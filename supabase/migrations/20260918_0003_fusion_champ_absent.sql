-- ════════════════════════════════════════════════════════════════════════════════════════
-- S2-B / migration 0003 — UN CHAMP ABSENT NE SUPPRIME PLUS LA VALEUR EXISTANTE
--
-- POURQUOI. Le corps de sauvegarde est construit UNE FOIS et servi à DEUX destinations
-- (R2 — et c'est juste : deux constructions séparées finiraient par diverger). Mais les
-- deux destinations n'en faisaient pas la même chose :
--
--   • Apps Script fusionne CHAMP PAR CHAMP — `if (body.X !== undefined)` — donc un champ
--     absent veut dire « laisse l'existant intact ». Mesuré : 44 des 45 champs du corps
--     sont gardés ainsi (le 45ᵉ, `action`, est le mot de routage, pas une donnée).
--   • Supabase remplaçait le blob EN ENTIER (`set data = excluded.data`), donc un champ
--     absent DISPARAISSAIT de la copie miroir.
--
-- ⭐ LE CAS RÉEL QUI L'A MOTIVÉE, ET IL N'EST PAS THÉORIQUE. Quand le stockage du téléphone
-- sature, l'application tronque l'historique local à 50 séances et OMET volontairement le
-- champ `sessions` (`setup.js` : « l'envoyer écraserait la sauvegarde cloud complète par la
-- version tronquée »). Ce geste protège Apps Script — et appauvrissait le miroir.
-- 👉 *Un comportement transposé d'un contexte à un autre peut devenir faux* (R14).
--
-- ⛔ CE QUE CETTE MIGRATION NE FAIT PAS, ET IL NE FAUT PAS LE LUI PRÊTER :
--   • elle ne règle PAS l'instantané ancien qui écrase un instantané récent ;
--   • elle ne règle PAS la résurrection d'une entrée supprimée (mesurée : elle atteint
--     Apps Script aussi, pas seulement le miroir) ;
--   • elle ne règle PAS la suppression totale d'une liste, refusée côté Apps Script ;
--   • elle n'introduit NI révision, NI marqueur de suppression, NI fusion profonde.
-- Elle corrige EXACTEMENT une chose : *absence n'est pas suppression*.
--
-- ⚠️ EFFET SECONDAIRE CONNU, ÉCRIT POUR QUE PERSONNE NE LE REDÉCOUVRE : des CLÉS ZOMBIES.
-- Une clé qu'une future version cesserait totalement d'envoyer resterait indéfiniment dans
-- le miroir. Conséquence faible (le miroir grossit), NON corrigée ici — on ne construit pas
-- un nettoyage pour un cas qui ne s'est jamais produit (R19).
--
-- ⛔ AUCUNE TABLE TOUCHÉE. AUCUNE COLONNE AJOUTÉE. AUCUN DROIT MODIFIÉ. AUCUN CHANGEMENT RLS.
-- `create or replace function` conserve les privilèges déjà accordés : les `grant` de la
-- migration 0002 restent valides et ne sont pas réécrits.
-- ════════════════════════════════════════════════════════════════════════════════════════

-- ─── 0. PRÉCONDITION MESURÉE, PAS SUPPOSÉE ──────────────────────────────────────────────
-- ⚠️⚠️ `ft_comptes` N'EST PAS VERSIONNÉE (créée à la main avant le versionnement), donc son
-- schéma n'existe nulle part dans le dépôt. Le type `jsonb` a été RELEVÉ au tableau de bord
-- le 17/09 — c'est une mesure, pas une garantie. Or l'opérateur `||` de fusion **n'existe
-- pas pour `json`**, seulement pour `jsonb`.
-- 👉 On vérifie donc ici, au seul moment où c'est vérifiable. *Une migration qui échoue en
-- annonçant pourquoi vaut infiniment mieux qu'une fusion silencieusement fausse.*
do $$
declare
  v_type text;
begin
  select a.atttypid::regtype::text into v_type
    from pg_attribute a
   where a.attrelid = 'public.ft_comptes'::regclass
     and a.attname  = 'data'
     and a.attnum > 0 and not a.attisdropped;
  if v_type is distinct from 'jsonb' then
    raise exception
      'ft_comptes.data est de type % et non jsonb : la fusion || ne s''applique pas', v_type;
  end if;
end $$;

-- ─── 1. LA FONCTION, IDENTIQUE À 0002 SAUF LA LIGNE DE CONFLIT ──────────────────────────
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
     -- ⭐⭐ LA SEULE LIGNE QUI CHANGE PAR RAPPORT À 0002.
     -- `a || b` en jsonb : les clés de `b` écrasent celles de `a`, les clés que `b` ne porte
     -- pas SURVIVENT. C'est exactement la sémantique d'Apps Script, transposée.
     --
     -- ⛔⛔ LE `coalesce` N'EST PAS DÉCORATIF, ET LE DOSSIER D'ARCHITECTURE L'AVAIT OUBLIÉ.
     -- Mesuré sur PostgreSQL 16 : `NULL || '{"a":1}'::jsonb` rend **NULL**, pas `{"a":1}`.
     -- La colonne `data` est NULLABLE. Sans ce `coalesce`, une ligne dont `data` vaut NULL
     -- serait donc **remise à NULL par sa propre sauvegarde** — la copie miroir serait vidée
     -- au lieu d'être complétée, en silence.
     -- 👉 *La forme conceptuelle d'un rapport n'est pas du code : elle se mesure avant d'être
     -- recopiée.*
     --
     -- ⚠️ FUSION DE SURFACE, ET C'EST DIT : un objet imbriqué est REMPLACÉ en entier, pas
     -- fusionné récursivement (mesuré : `{"p":{"a":1,"b":2}} || {"p":{"a":3}}` rend
     -- `{"p":{"a":3}}`). C'est le comportement VOULU ici — chaque champ du corps de
     -- sauvegarde est toujours construit en entier, jamais par morceaux.
     --
     -- ⚠️ ET UN `null` EXPLICITE RESTE UN `null` : il n'efface pas la clé (mesuré). Seul
     -- l'opérateur `-` supprime, et il n'est employé que pour les justificatifs ci-dessous.
     --
     -- ⛔⛔ LE RETRAIT DES JUSTIFICATIFS EST RÉAPPLIQUÉ **APRÈS** LA FUSION, ET C'EST UNE
     -- CORRECTION DE LA CORRECTION — trouvée en écrivant le test, pas en relisant le code.
     -- Avec le remplacement intégral, une fuite déjà présente dans le miroir était **effacée
     -- par la sauvegarde suivante** : la porte se réparait toute seule. Avec la fusion, la
     -- clé est absente de `excluded.data` (le `-` des `values` l'a retirée)… donc *absence =
     -- conservée*, et **la fuite SURVIVAIT indéfiniment**.
     -- 👉 *Le geste qui protège les champs métier protégeait aussi les champs qu'on veut
     -- justement voir disparaître.* Mesuré : sans cette ligne, un `token` planté dans la
     -- ligne y reste après une sauvegarde propre.
     -- ⭐ Et comme le retrait s'applique au RÉSULTAT, il purge désormais activement les
     -- justificatifs écrits AVANT S2-A (04/08 → 16/09) à la première sauvegarde de chaque
     -- compte — ce que le dossier S2-A avait laissé ouvert faute d'accès au tableau de bord.
     set data = (coalesce(public.ft_comptes.data, '{}'::jsonb) || excluded.data)
                  - 'token' - 'authCode' - 'code' - 'confirmCode' - 'apikey' - 'authorization',
         updated_at = now();
end;
$$;

comment on function public.ft_enregistrer_instantane(text, jsonb) is
  'S2-B : ecrit l''instantane du compte DESIGNE PAR LE JETON. Aucune adresse en entree. '
  'Depuis 0003 : un champ ABSENT conserve la valeur existante (fusion de surface).';

-- ─── RETOUR ARRIERE (a executer tel quel, il ne touche ni table ni donnee) ───────────────
-- Il suffit de rejouer la migration 20260917_0002_rpc_s2b.sql, qui redefinit la fonction
-- avec `set data = excluded.data`. Aucune donnee n'est modifiee, aucun droit n'est perdu
-- (`create or replace` conserve les privileges). Les cles deja fusionnees dans le miroir
-- restent en place : le retour arriere retablit la SEMANTIQUE, il ne defait pas les
-- ecritures passees — et c'est voulu, defaire une ecriture serait une perte.
