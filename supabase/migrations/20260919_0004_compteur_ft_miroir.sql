-- ════════════════════════════════════════════════════════════════════════════════════════
-- V2 / migration 0004 — COMPTEUR ANONYME D'USAGE DE L'ANCIENNE PORTE `ft_miroir`
--
-- POURQUOI. `ft_miroir(p_email libre, p_data)` est le seul défaut encore classé CRITIQUE :
-- le navigateur y choisit le compte écrit, et rien n'y filtre les justificatifs. On veut la
-- fermer — mais on ignore si elle sert encore. La mesure du 19/09 (0 ancien client observé)
-- portait sur ~22 h pendant lesquelles **un seul compte sur 10 a sauvegardé** : c'est une
-- absence de preuve, pas une preuve d'absence.
-- 👉 Ce compteur remplace l'attente passive par une MESURE.
--
-- ⭐⭐ LE CORPS DE `ft_miroir` EST REPRODUIT À L'IDENTIQUE, ET CE N'EST PAS UNE FORMULE.
-- Cette fonction n'est **pas versionnée** (créée à la main avant le versionnement) : la
-- réécrire de mémoire aurait pu changer sa logique métier en silence. Sa définition réelle a
-- donc été relue au tableau de bord le 19/09 et comparée **caractère par caractère** (espaces
-- et casse normalisés) à la reconstitution du banc : identiques. *On ne réécrit pas de
-- mémoire une fonction dont on n'a pas la source.*
--
-- ⛔ CE QUE CETTE MIGRATION NE FAIT PAS : elle ne ferme pas V2, ne filtre aucun appel, ne
-- change aucune logique métier, ne touche ni `ft_jetons` ni `ft_enregistrer_instantane` ni
-- le client. `ft_miroir` accepte exactement ce qu'elle acceptait hier.
--
-- ⚠️⚠️ LA LIMITE, ÉCRITE ICI PARCE QU'ELLE SERA OUBLIÉE AILLEURS : ce compteur prouve que la
-- RPC a été **invoquée**, jamais qu'un **vrai utilisateur legacy** l'a appelée. Un test
-- manuel, une sonde, un appel extérieur comptent pareil. À partir de son installation,
-- aucun appel volontaire à `ft_miroir` ne doit avoir lieu sans être noté.
-- ════════════════════════════════════════════════════════════════════════════════════════

-- ─── 1. LA TABLE, RÉDUITE À CE QUI RÉPOND À LA QUESTION ─────────────────────────────────
-- ⛔ AUCUNE LIGNE PAR APPEL, AUCUN HISTORIQUE, AUCUNE GRANULARITÉ JOURNALIÈRE. La question
-- est « zéro appel depuis telle date, ou N appels, et le dernier quand ? ». Trois colonnes y
-- répondent. *Une télémétrie qu'on construit « au cas où » finit par contenir ce qu'on ne
-- voulait pas y mettre.*
--
-- ⭐ `id boolean primary key check (id)` GARANTIT UNE LIGNE UNIQUE PAR CONSTRUCTION : la
-- seule valeur acceptée est `true`, et elle est clé primaire. Il devient donc **impossible**
-- d'avoir deux compteurs qui divergent — ce n'est pas une convention qu'on se promet de
-- respecter, c'est une contrainte que la base fait respecter.
create table if not exists public.ft_miroir_usage (
  id            boolean     primary key default true check (id),
  appels_total  bigint      not null default 0,
  dernier_appel timestamptz,
  debut_mesure  timestamptz not null default now()
);

comment on table public.ft_miroir_usage is
  'V2 : compteur ANONYME des ecritures acceptees par l''ancienne porte ft_miroir. '
  'Aucune adresse, aucun jeton, aucune charge, aucune IP. Une seule ligne par construction.';

insert into public.ft_miroir_usage (id) values (true) on conflict (id) do nothing;

-- ⛔ PERSONNE NE LIT NI N'ÉCRIT CETTE TABLE DEPUIS L'API — même pattern que `ft_jetons`.
-- Le navigateur ne doit pouvoir ni la lire, ni la remettre à zéro, ni choisir sa date.
-- `ft_miroir` étant `SECURITY DEFINER`, elle y écrit au nom du propriétaire malgré ces
-- retraits : c'est exactement ce qu'on veut — une seule voie d'écriture, celle du serveur.
revoke all on table public.ft_miroir_usage from public;
revoke all on table public.ft_miroir_usage from anon;
revoke all on table public.ft_miroir_usage from authenticated;
revoke all on table public.ft_miroir_usage from service_role;
alter table public.ft_miroir_usage enable row level security;

-- ⛔ AUCUNE RPC PUBLIQUE DE CONSULTATION N'EST CRÉÉE. La lecture de diagnostic se fait par le
-- propriétaire, dans l'éditeur SQL — ouvrir une porte de lecture pour surveiller une porte
-- qu'on veut fermer serait un mauvais échange.

-- ─── 2. `ft_miroir`, CORPS IDENTIQUE + LE COMPTAGE ──────────────────────────────────────
create or replace function public.ft_miroir(p_email text, p_data jsonb)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  insert into public.ft_comptes(email, data, updated_at)
  values (lower(trim(p_email)), p_data, now())
  on conflict (email) do update
    set data = excluded.data, updated_at = now();

  -- ⭐⭐ ON COMPTE **APRÈS** L'ÉCRITURE, ET C'EST LA DÉCISION DE CONCEPTION (option B).
  -- La question de Michel est « un ancien chemin est-il encore réellement utilisé pour
  -- SAUVEGARDER ? ». Un appel qui échoue n'a rien sauvegardé : le compter gonflerait le
  -- chiffre avec des événements qui ne justifient pas de retarder la fermeture.
  -- Placé ici, le compteur n'est atteint que si l'`insert` a réussi.
  --
  -- ⚠️ NUANCE MESURÉE, ET ELLE ÉVITE DE SURVENDRE CE CHOIX : le contrôle négatif a montré
  -- qu'un compteur placé AVANT l'insert ne gonfle PAS non plus sur un appel qui échoue —
  -- l'incrément est annulé avec la transaction. *La transaction donne donc déjà
  -- gratuitement la moitié de l'option B.* Le choix « compter après » reste le bon, pour
  -- deux raisons qui, elles, tiennent : il rend l'intention explicite, et il survivra au
  -- jour où quelqu'un ajoutera une instruction après l'`insert`. Mais il ne porte pas, à
  -- lui seul, la garantie qu'on serait tenté de lui prêter.
  --
  -- ⛔⛔ ET LE BLOC A SON PROPRE GESTIONNAIRE D'ERREUR, CE QUI EST LE POINT LE PLUS IMPORTANT
  -- DE CETTE MIGRATION. Sans lui, une erreur du compteur (table absente, droit retiré,
  -- verrou) ferait échouer toute la fonction — donc **annulerait la sauvegarde legacy**, qui
  -- est encore autorisée aujourd'hui.
  -- 👉 *Un instrument d'observation qui peut détruire ce qu'il observe n'est pas un
  -- instrument, c'est un risque.* Le compteur est du confort ; la sauvegarde est la donnée
  -- de quelqu'un. En cas de doute, c'est le compteur qui perd.
  --
  -- ⭐ L'incrément est ATOMIQUE : `appels_total + 1` lit et écrit sous le verrou de ligne
  -- que PostgreSQL pose pour l'`update`. Deux appels simultanés ne peuvent pas perdre un
  -- incrément — contrairement à un `select` suivi d'un `update`, qui lui le pourrait.
  begin
    update public.ft_miroir_usage
       set appels_total = appels_total + 1,
           dernier_appel = now()
     where id;
  exception when others then
    null;   -- ⛔ le compteur ne fait JAMAIS échouer une sauvegarde
  end;
end;
$function$;

comment on function public.ft_miroir(text, jsonb) is
  'ANCIENNE PORTE (V2), inchangee dans sa logique metier. Depuis 0004 : compte anonymement '
  'ses ecritures ACCEPTEES dans ft_miroir_usage. Aucune donnee personnelle enregistree.';

-- ─── LECTURE DE DIAGNOSTIC (proprietaire uniquement, dans l'editeur SQL) ────────────────
--   select appels_total,
--          dernier_appel at time zone 'Europe/Paris' as dernier_appel_paris,
--          debut_mesure  at time zone 'Europe/Paris' as debut_mesure_paris,
--          now() - debut_mesure                      as duree_observation
--     from public.ft_miroir_usage;
--
-- ─── RETOUR ARRIERE (ne touche ni donnee metier ni logique) ─────────────────────────────
-- Rejouer le bloc `create or replace function public.ft_miroir` de CETTE migration en
-- retirant le bloc `begin ... exception ... end;`, puis :
--   drop table if exists public.ft_miroir_usage;
-- ⚠️ Dans cet ordre : la fonction cesse d'ecrire dans la table AVANT qu'elle disparaisse.
-- L'ordre inverse marcherait quand meme (le gestionnaire d'erreur avalerait l'echec), mais
-- on ne s'appuie pas sur un filet pour faire un geste propre.
