-- ════════════════════════════════════════════════════════════════════════════════════════
-- S2-B / migration 0001 — LE REGISTRE DES JETONS D'APPAREIL
--
-- POURQUOI. Jusqu'ici, le navigateur choisissait le compte Supabase en envoyant une adresse
-- e-mail (`ft_miroir(p_email, p_data)`). Une adresse fournie par le client n'est pas une
-- identité : c'est une demande. Ce registre permet au SERVEUR de décider, à partir d'une
-- preuve que le navigateur possède déjà — son jeton S1.
--
-- CE QU'ON STOCKE, ET RIEN DE PLUS. Le SHA-256 hexadécimal du jeton, le compte qu'il désigne,
-- une date, un drapeau de révocation et un libellé d'appareil. ⛔ JAMAIS le jeton brut : une
-- fuite intégrale de cette table ne donne aucun justificatif utilisable.
--
-- ⭐ LA FORME EST CELLE DU REGISTRE S1 D'APPS SCRIPT, VOLONTAIREMENT. Là-bas, la clé de
-- stockage EST déjà `sha256(jeton)` et la valeur porte {compte, date, révoqué, appareil}.
-- Donc aucune reconnexion n'est nécessaire, aucun jeton n'est perdu, et rien n'est réémis :
-- une ligne se dérive de ce qui existe déjà. Ce n'est pas une coïncidence — le commentaire du
-- registre S1, écrit avant ce chantier, dit « se transpose telle quelle en table Supabase ».
--
-- ⛔⛔ PAS DE `FORCE ROW LEVEL SECURITY` ICI, ET LA RAISON A ÉTÉ CORRIGÉE APRÈS MESURE.
--
-- Ce que `FORCE` fait : il soumet le PROPRIÉTAIRE de la table aux règles de ligne. Les
-- fonctions de la migration 0002 sont `SECURITY DEFINER` et tournent au nom de ce même
-- propriétaire — donc avec `FORCE` et zéro règle, elles liraient **zéro ligne**, tout jeton
-- deviendrait « inconnu », et le nouveau chemin refuserait tout le monde. **Mesuré** sur
-- PostgreSQL 16 avec un propriétaire ordinaire : `FORCE` → 0 ligne vue, `ENABLE` seul → 1.
--
-- ⚠️ MAIS MON DOSSIER D'ARCHITECTURE PRÉSENTAIT CE DANGER COMME CERTAIN, ET IL NE L'EST PAS.
-- Le propriétaire de ce projet a été mesuré le 17/09 avec `rolbypassrls = true` — et
-- `BYPASSRLS` passe outre les règles de ligne, **y compris forcées**. Donc aujourd'hui,
-- `FORCE` ne casserait rien.
-- 👉 On ne le pose pas quand même, et c'est ça le vrai argument : il n'apporterait **rien**
--    (le `REVOKE` ci-dessous retire déjà tout privilège à tous les rôles du navigateur, donc
--    il n'y a aucune ligne à filtrer pour personne), et il ferait dépendre le nouveau chemin
--    d'un attribut de rôle que nous ne contrôlons pas. *Le jour où cet attribut changerait,
--    tout le monde serait refusé — en silence, et sans que personne fasse le lien.*
--    On préfère l'absence de privilège à la dépendance à une configuration invisible.
--
-- ⚠️ LE `REVOKE` N'EST PAS DÉCORATIF. Mesuré sur `ft_comptes` le 17/09 : le rôle public y
-- possédait SELECT, DELETE et TRUNCATE que personne ne lui avait donnés — ils viennent des
-- privilèges accordés par défaut aux nouvelles tables. **Une table créée sans REVOKE naît
-- ouverte.**
-- ════════════════════════════════════════════════════════════════════════════════════════

create table if not exists public.ft_jetons (
  hachage     text        primary key,
  compte      text        not null,
  cree_le     timestamptz not null default now(),
  revoque     boolean     not null default false,
  revoque_le  timestamptz,
  appareil    text
);

comment on table  public.ft_jetons is
  'S2-B : registre des jetons d''appareil. Le hachage SHA-256 designe un compte. Jamais le jeton brut.';
comment on column public.ft_jetons.hachage is
  'SHA-256 hexadecimal minuscule du jeton brut. Identite technique du jeton.';
comment on column public.ft_jetons.appareil is
  'Libelle court, purement informatif. AUCUNE autorite : il ne decide de rien.';

-- Plusieurs jetons pour un compte : telephone, PC, futur Android, futur iPhone.
create index if not exists ft_jetons_compte_idx on public.ft_jetons (compte);

-- ⚠️ CETTE CONTRAINTE GARANTIT UNE FORME, PAS UNE PROVENANCE — et il faut le dire, parce que
-- croire l'inverse serait dangereux : dans ce projet, le jeton BRUT est lui aussi une chaîne
-- de 64 caractères hexadécimaux. Elle empêche donc une adresse, un objet ou une valeur vide
-- d'entrer ici ; elle ne peut pas distinguer un haché d'un brut. C'est le Worker qui garantit
-- qu'on ne lui passe que le haché, et c'est un témoin qui le fige.
alter table public.ft_jetons drop constraint if exists ft_jetons_hachage_forme;
alter table public.ft_jetons add  constraint ft_jetons_hachage_forme
      check (hachage ~ '^[0-9a-f]{64}$');

-- Une date de révocation sans révocation serait un état que personne ne sait lire.
alter table public.ft_jetons drop constraint if exists ft_jetons_revocation_coherente;
alter table public.ft_jetons add  constraint ft_jetons_revocation_coherente
      check (revoque_le is null or revoque);

-- ⛔ Le navigateur n'a AUCUN privilège sur cette table. Le Worker non plus : il ne parle qu'aux
--    fonctions de la migration 0002, qui s'exécutent au nom du propriétaire.
revoke all on table public.ft_jetons from public;
revoke all on table public.ft_jetons from anon;
revoke all on table public.ft_jetons from authenticated;
revoke all on table public.ft_jetons from service_role;

-- Deuxième verrou, derrière le premier. Voir l'avertissement en tête : ENABLE, jamais FORCE.
alter table public.ft_jetons enable row level security;

-- ────────────────────────────────────────────────────────────────────────────────────────
-- RETOUR ARRIERE (complet — ne touche rien d'autre)
--   drop table if exists public.ft_jetons;
-- ⚠️ A executer APRES le retour arriere de la migration 0002, qui lit cette table.
-- ────────────────────────────────────────────────────────────────────────────────────────
