-- ════════════════════════════════════════════════════════════════════════════════════════
-- S2-B / phase 1 — CONTROLE APRES APPLICATION.  ⛔ LECTURE SEULE : rien n'est modifié.
--
-- POURQUOI CE FICHIER EXISTE. « Success. No rows returned » dit que les instructions ont
-- été acceptées, pas que la base est dans l'état voulu. C'est **R18** appliqué au SQL —
-- *vérifier le déploiement, pas le push*. Le projet a déjà payé deux fois pour l'avoir
-- oublié ailleurs (un déploiement Pages bloqué plusieurs versions, en silence).
--
-- ⭐ CHAQUE LIGNE PORTE SON ATTENDU. Un contrôle qui rend des chiffres bruts oblige à les
-- interpréter de mémoire ; celui-ci se lit seul. La colonne `verdict` dit OK ou A REGARDER.
--
-- ⛔ AUCUNE DONNÉE PERSONNELLE N'EN SORT : des comptes, des booléens, des noms d'objets.
-- Aucune adresse, aucun contenu de sauvegarde, aucun haché.
-- ════════════════════════════════════════════════════════════════════════════════════════

with f as (
  select p.proname, p.prosecdef,
         coalesce(array_to_string(p.proconfig, ','), '') as config
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('ft_enregistrer_instantane', 'ft_inscrire_jeton', 'ft_revoquer_jeton')
),
c as (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'ft_jetons')                  as colonnes,
    (select count(*) from pg_constraint
      where conrelid = 'public.ft_jetons'::regclass and contype = 'c')             as contraintes,
    (select count(*) from pg_indexes
      where schemaname = 'public' and tablename = 'ft_jetons')                     as index_,
    (select relrowsecurity   from pg_class where oid = 'public.ft_jetons'::regclass) as rls,
    (select relforcerowsecurity from pg_class where oid = 'public.ft_jetons'::regclass) as rls_forcee,
    (select count(*) from pg_policies where schemaname = 'public' and tablename = 'ft_jetons') as policies,
    (select count(*) from public.ft_jetons)                                        as lignes_registre,
    (select count(*) from f)                                                       as fonctions,
    (select count(*) from f where prosecdef)                                       as definer,
    (select count(*) from f where config like 'search_path=%')                     as chemin_fixe,
    (select bool_or(has_table_privilege(r, 'public.ft_jetons', pr))
       from unnest(array['anon','authenticated','service_role']) r,
            unnest(array['select','insert','update','delete']) pr)                 as droits_table,
    (select bool_or(has_function_privilege(r, p.oid, 'execute'))
       from unnest(array['anon','authenticated']) r,
            pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('ft_enregistrer_instantane','ft_inscrire_jeton','ft_revoquer_jeton'))
                                                                                   as execute_navigateur,
    (select bool_and(has_function_privilege('service_role', p.oid, 'execute'))
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('ft_enregistrer_instantane','ft_inscrire_jeton','ft_revoquer_jeton'))
                                                                                   as execute_serveur,
    (select count(*) from public.ft_comptes)                                       as comptes,
    has_function_privilege('anon', 'public.ft_miroir(text, jsonb)', 'execute')     as v2_ouverte
)
select v.ordre, v.controle, v.mesure, v.attendu,
       case when v.mesure = v.attendu then 'OK' else 'A REGARDER' end as verdict
  from c,
  lateral (values
    ( 1, 'colonnes de ft_jetons',                    colonnes::text,           '6'),
    ( 2, 'contraintes de coherence',                 contraintes::text,        '2'),
    ( 3, 'index (cle primaire + compte)',            index_::text,             '2'),
    ( 4, 'regles de ligne activees',                 rls::text,                'true'),
    ( 5, 'regles de ligne FORCEES',                  rls_forcee::text,         'false'),
    ( 6, 'policies sur le registre',                 policies::text,           '0'),
    ( 7, 'lignes dans le registre',                  lignes_registre::text,    '0'),
    ( 8, 'fonctions S2-B creees',                    fonctions::text,          '3'),
    ( 9, 'dont security definer',                    definer::text,            '3'),
    (10, 'dont chemin de recherche fixe',            chemin_fixe::text,        '3'),
    (11, 'un role client a un droit sur le registre', droits_table::text,      'false'),
    (12, 'le navigateur peut executer les fonctions', execute_navigateur::text,'false'),
    (13, 'le role serveur peut les executer',        execute_serveur::text,    'true'),
    (14, 'comptes existants (inchanges)',            comptes::text,            '10'),
    (15, 'ancienne porte encore ouverte (ATTENDU a ce stade)', v2_ouverte::text,'true')
  ) as v(ordre, controle, mesure, attendu)
 order by v.ordre;

-- ⚠️ LA LIGNE 15 DOIT DIRE `true`, ET CE N'EST PAS UNE ERREUR. Tant que le nouveau chemin
-- n'est pas prouvé de bout en bout, l'ancienne porte reste ouverte EXPRES — la fermer avant
-- couperait le miroir de tout le monde. *Un contrôle qui exigerait `false` ici pousserait à
-- fermer trop tôt.* Elle passera à `false` en phase 5, et c'est à ce moment-là que le test
-- réseau réel devra donner un refus.
