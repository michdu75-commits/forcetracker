-- ════════════════════════════════════════════════════════════════════════════════════════
-- S2-B / migration 0002 — LES TROIS FONCTIONS BORNÉES
--
-- ⛔ AUCUNE DE CES FONCTIONS NE REÇOIT D'ADRESSE E-MAIL POUR DÉSIGNER UN COMPTE À ÉCRIRE.
--    C'est tout le chantier : le paramètre qui portait le défaut V2 **disparaît de la
--    signature**. On ne contrôle pas une entrée dangereuse, on la supprime.
--
-- ⚠️ `ft_inscrire_jeton` reçoit un compte — et c'est la seule, assumée et bornée. Elle ne
--    peut être appelée que par le rôle serveur, et uniquement après qu'Apps Script ait validé
--    le jeton brut : la valeur ne vient donc jamais du navigateur. C'est ce qui rend possible
--    le remplissage PROGRESSIF du registre, sans recopie de masse.
--
-- ⭐ UN SEUL MESSAGE DE REFUS POUR TOUTE IDENTITÉ QUI NE PASSE PAS — absente, mal formée,
--    inconnue ou révoquée. Distinguer les cas apprendrait à un inconnu quels hachés existent.
--    Apps Script peut se le permettre pour son diagnostic ; une porte publique, non.
--
-- ⛔ AUCUN SQL CONSTRUIT PAR CONCATÉNATION, `search_path` FIXÉ SUR CHAQUE FONCTION — même
--    forme que `ft_miroir`, qui a été auditée le 17/09.
-- ════════════════════════════════════════════════════════════════════════════════════════

-- ─── 1. ÉCRIRE L'INSTANTANÉ ──────────────────────────────────────────────────────────────
create or replace function public.ft_enregistrer_instantane(p_hachage text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_compte text;
begin
  if p_hachage is null or p_hachage !~ '^[0-9a-f]{64}$' then
    raise exception 'identite' using errcode = '28000';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'charge' using errcode = '22023';
  end if;

  select j.compte into v_compte
    from public.ft_jetons j
   where j.hachage = p_hachage
     and j.revoque = false;

  -- inconnu ou revoque : MEME refus que mal forme. Aucun oracle.
  if v_compte is null then
    raise exception 'identite' using errcode = '28000';
  end if;

  -- ⭐ RETRAIT DÉFENSIF DES JUSTIFICATIFS, ICI ET PAS SEULEMENT CHEZ L'APPELANT.
  -- La liste est le miroir exact de `_SB_JUSTIFICATIFS` (supabase.js). Le client les retire
  -- déjà ; cette porte les retire à nouveau, donc elle protège aussi l'appelant qu'on n'a pas
  -- prévu. *Un garde qui dépend de la façon dont la valeur a été calculée ne protège que les
  -- cas qu'on avait déjà en tête.*
  insert into public.ft_comptes (email, data, updated_at)
  values (v_compte,
          p_data - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' - 'authorization',
          now())
  on conflict (email) do update
     set data = excluded.data, updated_at = now();
end;
$$;

comment on function public.ft_enregistrer_instantane(text, jsonb) is
  'S2-B : ecrit l''instantane du compte DESIGNE PAR LE JETON. Aucune adresse en entree.';

-- ─── 2. INSCRIRE UN JETON (remplissage progressif) ───────────────────────────────────────
create or replace function public.ft_inscrire_jeton(p_hachage text, p_compte text,
                                                    p_appareil text default null)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  n int;
begin
  if p_hachage is null or p_hachage !~ '^[0-9a-f]{64}$' then
    raise exception 'hachage' using errcode = '22023';
  end if;
  if p_compte is null or btrim(p_compte) = '' then
    raise exception 'compte' using errcode = '22023';
  end if;

  -- ⛔⛔ `do nothing` N'EST PAS UNE COMMODITÉ, C'EST UNE PROPRIÉTÉ DE SÉCURITÉ. Deux choses en
  --     découlent : un jeton déjà inscrit ne peut pas être RE-POINTÉ vers un autre compte, et
  --     un jeton RÉVOQUÉ ne peut pas être ressuscité en le réinscrivant.
  --     *Un `do update` ici rouvrirait par la porte de service ce qu'on ferme par l'entrée.*
  insert into public.ft_jetons (hachage, compte, appareil)
  values (p_hachage, lower(btrim(p_compte)), left(coalesce(p_appareil, ''), 24))
  on conflict (hachage) do nothing;

  get diagnostics n = row_count;
  return n > 0;
end;
$$;

comment on function public.ft_inscrire_jeton(text, text, text) is
  'S2-B : lie un hachage a un compte, une seule fois. Jamais de re-pointage, jamais de resurrection.';

-- ─── 3. RÉVOQUER UN JETON ────────────────────────────────────────────────────────────────
-- ⭐ REND UN BOOLÉEN, ET C'EST CE QUI PERMET AU WORKER D'ÉCHOUER FERMÉ. Il doit pouvoir
--    distinguer « il n'y avait rien à révoquer ici » (normal : cet appareil n'a jamais écrit
--    dans Supabase) d'une PANNE (auquel cas la révocation ne doit surtout pas être annoncée
--    comme faite). Une fonction qui ne rend rien rend ces deux cas indiscernables.
create or replace function public.ft_revoquer_jeton(p_hachage text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  n int;
begin
  if p_hachage is null or p_hachage !~ '^[0-9a-f]{64}$' then
    raise exception 'hachage' using errcode = '22023';
  end if;

  update public.ft_jetons
     set revoque = true,
         revoque_le = coalesce(revoque_le, now())
   where hachage = p_hachage
     and revoque = false;

  get diagnostics n = row_count;
  return n > 0;
end;
$$;

comment on function public.ft_revoquer_jeton(text) is
  'S2-B : marque un jeton revoque. Rend true s''il vient de l''etre, false s''il n''y avait rien a faire.';

-- ─── DROITS ──────────────────────────────────────────────────────────────────────────────
-- ⛔ Le `revoke ... from public` est indispensable : PostgreSQL accorde EXECUTE à PUBLIC sur
--    toute fonction nouvellement créée. Sans lui, la clé publiée dans l'application pourrait
--    appeler ces fonctions — c'est-à-dire recréer V2 sous un autre nom.
revoke all on function public.ft_enregistrer_instantane(text, jsonb) from public;
revoke all on function public.ft_enregistrer_instantane(text, jsonb) from anon;
revoke all on function public.ft_enregistrer_instantane(text, jsonb) from authenticated;
revoke all on function public.ft_inscrire_jeton(text, text, text)    from public;
revoke all on function public.ft_inscrire_jeton(text, text, text)    from anon;
revoke all on function public.ft_inscrire_jeton(text, text, text)    from authenticated;
revoke all on function public.ft_revoquer_jeton(text)                from public;
revoke all on function public.ft_revoquer_jeton(text)                from anon;
revoke all on function public.ft_revoquer_jeton(text)                from authenticated;

-- Seul le rôle serveur (le Worker, via sa clé secrète) peut les appeler.
grant execute on function public.ft_enregistrer_instantane(text, jsonb) to service_role;
grant execute on function public.ft_inscrire_jeton(text, text, text)    to service_role;
grant execute on function public.ft_revoquer_jeton(text)                to service_role;

-- ────────────────────────────────────────────────────────────────────────────────────────
-- RETOUR ARRIERE (complet — ne touche ni ft_comptes ni ft_miroir)
--   drop function if exists public.ft_revoquer_jeton(text);
--   drop function if exists public.ft_inscrire_jeton(text, text, text);
--   drop function if exists public.ft_enregistrer_instantane(text, jsonb);
-- ────────────────────────────────────────────────────────────────────────────────────────
