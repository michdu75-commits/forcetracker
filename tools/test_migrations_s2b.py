#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B — éprouve les migrations sur un VRAI PostgreSQL local, avant tout Dashboard.

[!!] POURQUOI UNE VRAIE BASE PLUTÔT QU'UNE RELECTURE. Un contrôle statique ne peut pas
     répondre à la seule question qui compte : « est-ce que ça REFUSE ? ». Il ne voit pas
     qu'un `FORCE ROW LEVEL SECURITY` mal placé rendrait toute lecture vide, donc tout jeton
     inconnu, donc le nouveau chemin fermé pour tout le monde. >> Ici on applique les fichiers
     TELS QUELS, on joue les scénarios, puis on MUTE chaque garantie pour la voir rougir.

[!!] CE QUE CE BANC NE PROUVE PAS, ET IL FAUT LE DIRE : PostgreSQL 16 en local n'est pas
     l'instance Supabase. Les rôles y sont recréés à la main, `ft_comptes` est reconstruite
     d'après la définition MESURÉE le 17/09, et rien ici ne dit ce que le tableau de bord fera
     vraiment. C'est un banc de SÉMANTIQUE SQL, pas une preuve de déploiement.

Usage : python3 tools/test_migrations_s2b.py [--garde-la-base]
"""
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# FT_MIG permet au contrôle négatif de pointer vers une COPIE mutée, sans jamais toucher
# aux fichiers du dépôt (BUGS.md §60 : on ne mute pas l'arbre servi).
MIG = os.environ.get('FT_MIG') or os.path.join(ROOT, 'supabase', 'migrations')
PGBIN = '/usr/lib/postgresql/16/bin'
SOCK = '/tmp/pg_s2b'
PORT = '55432'

OK = [0]
KO = []


def psql(sql, base='postgres', role='postgres'):
    """Rend (code_retour, sortie). Une erreur SQL n'est pas une exception : c'est une mesure."""
    env = dict(os.environ, PATH=PGBIN + ':' + os.environ.get('PATH', ''), PGOPTIONS='')
    r = subprocess.run(
        ['psql', '-h', SOCK, '-p', PORT, '-U', role, '-d', base, '-v', 'ON_ERROR_STOP=1',
         '-tA', '-c', sql],
        capture_output=True, text=True, env=env)
    return r.returncode, (r.stdout + r.stderr).strip()


def psql_fichier(chemin, base):
    env = dict(os.environ, PATH=PGBIN + ':' + os.environ.get('PATH', ''))
    r = subprocess.run(
        ['psql', '-h', SOCK, '-p', PORT, '-U', 'postgres', '-d', base,
         '-v', 'ON_ERROR_STOP=1', '-f', chemin],
        capture_output=True, text=True, env=env)
    return r.returncode, (r.stdout + r.stderr).strip()


def t(nom, cond, detail=''):
    if cond:
        OK[0] += 1
        print('  OK   %s' % nom)
    else:
        KO.append(nom)
        print('  !!   %s   %s' % (nom, detail[:150]))
    return cond


# ─── l'état MESURÉ du 17/09 que le banc doit reproduire ────────────────────────────────
# ⚠️ `ft_comptes` et `ft_miroir` ne sont PAS versionnées (elles ont été créées à la main).
#    On les reconstruit ici d'après la définition relevée dans le Dashboard, uniquement pour
#    que le banc ait de quoi écrire. *Ce bloc n'est pas une migration et ne doit jamais en
#    devenir une* : ce serait présenter une reconstitution comme une source de vérité.
SOCLE = """
-- [!!] Les roles sont a l'echelle du CLUSTER, pas de la base : on ne les cree que s'ils
--      manquent, sinon la seconde base du banc echoue sur « role already exists ».
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon')          then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')  then create role service_role nologin; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;

create table public.ft_comptes (
  email      text primary key,
  data       jsonb,
  updated_at timestamptz default now()
);
alter table public.ft_comptes enable row level security;   -- FORCE = false, comme mesure

create or replace function public.ft_miroir(p_email text, p_data jsonb)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  insert into public.ft_comptes(email, data, updated_at)
  values (lower(trim(p_email)), p_data, now())
  on conflict (email) do update set data = excluded.data, updated_at = now();
end;
$function$;
grant execute on function public.ft_miroir(text, jsonb) to anon, authenticated;
"""

H_A1 = 'a' * 64          # appareil 1 du compte A
H_A2 = 'b' * 64          # appareil 2 du compte A
H_B1 = 'c' * 64          # appareil du compte B
H_INC = 'd' * 64         # bien forme, jamais inscrit
CA = 'compte-a.test'
CB = 'compte-b.test'


def monter(base, racine_mig):
    psql('drop database if exists %s' % base)
    c, o = psql('create database %s' % base)
    if c:
        print('impossible de creer la base :', o)
        sys.exit(2)
    c, o = psql(SOCLE, base=base)
    if c:
        print('socle en echec :', o)
        sys.exit(2)
    for f in sorted(os.listdir(racine_mig)):
        if not f.endswith('.sql'):
            continue
        c, o = psql_fichier(os.path.join(racine_mig, f), base)
        if c:
            return False, f + ' : ' + o
    return True, ''


def scenarios(base):
    """Les garanties. Rend la liste des noms qui ont ECHOUE."""
    echecs = []

    def v(nom, cond, detail=''):
        if not t(nom, cond, detail):
            echecs.append(nom)

    # ── inscription : le remplissage progressif ──────────────────────────────────────
    c, o = psql("select public.ft_inscrire_jeton('%s','%s','tel')" % (H_A1, CA), base)
    v('I1 inscription d un jeton inconnu', c == 0 and o == 't', o)
    c, o = psql("select public.ft_inscrire_jeton('%s','%s','tel')" % (H_A1, CA), base)
    v('I2 reinscription du meme jeton : sans effet, sans erreur', c == 0 and o == 'f', o)
    c, o = psql("select public.ft_inscrire_jeton('%s','%s','pc') ; "
                "select compte from public.ft_jetons where hachage='%s'"
                % (H_A1, CB, H_A1), base)
    v('I3 un jeton deja inscrit n est JAMAIS re-pointe vers un autre compte',
      c == 0 and o.strip().endswith(CA), o)
    psql("select public.ft_inscrire_jeton('%s','%s','pc')" % (H_A2, CA), base)
    psql("select public.ft_inscrire_jeton('%s','%s','tel')" % (H_B1, CB), base)

    # ── T1 : le jeton decide du compte ───────────────────────────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('%s','{\"bw\":80}'::jsonb); "
                "select email from public.ft_comptes" % H_A1, base)
    v('T1 jeton A ecrit le compte A', c == 0 and CA in o, o)

    # ── T2 : une adresse dans la charge utile n'a AUCUN effet ────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('%s',"
                "'{\"email\":\"%s\",\"bw\":81}'::jsonb); "
                "select count(*) from public.ft_comptes where email='%s'"
                % (H_A1, CB, CB), base)
    v('T2 jeton A + adresse B dans la charge : aucune ligne B creee', c == 0 and o.strip().endswith('0'), o)

    # ── T3 / T4 / T5 : les refus ────────────────────────────────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane(null,'{}'::jsonb)", base)
    v('T3 sans jeton : refus', c != 0 and 'identite' in o, o)
    c3 = o
    c, o = psql("select public.ft_enregistrer_instantane('%s','{}'::jsonb)" % H_INC, base)
    v('T4 jeton bien forme mais inconnu : refus', c != 0 and 'identite' in o, o)
    c4 = o

    psql("select public.ft_revoquer_jeton('%s')" % H_A2, base)
    c, o = psql("select public.ft_enregistrer_instantane('%s','{}'::jsonb)" % H_A2, base)
    v('T5 jeton revoque : refus', c != 0 and 'identite' in o, o)
    c5 = o

    def msg(x):
        m = re.search(r'ERROR:\s*(\w+)', x)
        return m.group(1) if m else x[:40]
    v('E1 aucun oracle : absent, inconnu et revoque rendent le MEME refus',
      msg(c3) == msg(c4) == msg(c5), '%r / %r / %r' % (msg(c3), msg(c4), msg(c5)))

    # ── T6 / T7 : multi-appareils et revocation selective ───────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('%s','{\"bw\":82}'::jsonb)" % H_A1, base)
    v('T7 le second appareil du compte A fonctionne apres revocation du premier', c == 0, o)
    c, o = psql("select count(*) from public.ft_comptes where email='%s'" % CA, base)
    v('T7b le compte A reste utilisable', c == 0 and o.strip() == '1', o)
    c, o = psql("select public.ft_inscrire_jeton('%s','%s','tel') ; "
                "select revoque from public.ft_jetons where hachage='%s'"
                % (H_A2, CA, H_A2), base)
    v('R1 un jeton revoque ne ressuscite pas si on le reinscrit',
      c == 0 and o.strip().endswith('t'), o)

    # ── T8 : cloisonnement des comptes ───────────────────────────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('%s','{\"bw\":70}'::jsonb); "
                "select data->>'bw' from public.ft_comptes where email='%s'"
                % (H_B1, CB), base)
    v('T8 jeton B ecrit uniquement B', c == 0 and o.strip().endswith('70'), o)
    c, o = psql("select data->>'bw' from public.ft_comptes where email='%s'" % CA, base)
    v('T8b le compte A n a pas bouge', c == 0 and o.strip() == '82', o)

    # ── T9 / T10 : charge utile hostile ──────────────────────────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('%s',"
                "'{\"email\":\"%s\",\"accountId\":\"x\",\"premium\":true,\"bw\":83}'::jsonb); "
                "select email from public.ft_comptes where data->>'bw'='83'"
                % (H_A1, CB), base)
    v('T9 email/accountId/premium dans la charge ne changent pas l identite resolue',
      c == 0 and o.strip().endswith(CA), o)
    c, o = psql("select public.ft_enregistrer_instantane('%s',"
                "'{\"token\":\"secret\",\"authCode\":\"1234\",\"bw\":84}'::jsonb); "
                # [!!] `jsonb_exists(...)` plutot que l'operateur `?` : dans un client, le point
                #      d'interrogation est ambigu avec un parametre. Et le rendu de `::text`
                #      d'un booleen est « false », pas « f » — ma premiere version attendait
                #      « f/f » et rougissait sur du SQL parfaitement juste.
                "select jsonb_exists(data,'token')::text || '/' || "
                "jsonb_exists(data,'authCode')::text "
                "from public.ft_comptes where email='%s'" % (H_A1, CA), base)
    v('T10 token et authCode ne sont JAMAIS stockes',
      c == 0 and o.strip().endswith('false/false'), o)
    c, o = psql("select data->>'bw' from public.ft_comptes where email='%s'" % CA, base)
    v('T10b le reste de la charge metier est intact', c == 0 and o.strip() == '84', o)

    # ── formes refusees ─────────────────────────────────────────────────────────────
    c, o = psql("select public.ft_enregistrer_instantane('PAS-UN-HACHE','{}'::jsonb)", base)
    v('F1 un hache mal forme est refuse', c != 0, o)
    c, o = psql("select public.ft_enregistrer_instantane('%s','[]'::jsonb)" % H_A1, base)
    v('F2 une charge qui n est pas un objet est refusee', c != 0 and 'charge' in o, o)
    c, o = psql("insert into public.ft_jetons(hachage,compte) values ('trop-court','x')", base)
    v('F3 la contrainte de forme protege la table elle-meme', c != 0, o)
    c, o = psql("insert into public.ft_jetons(hachage,compte,revoque_le) "
                "values ('%s','x',now())" % ('e' * 64), base)
    v('F4 une date de revocation sans revocation est refusee', c != 0, o)

    # ── droits : le navigateur et le Worker ─────────────────────────────────────────
    for droit in ('select', 'insert', 'update', 'delete'):
        c, o = psql("select has_table_privilege('anon','public.ft_jetons','%s')" % droit, base)
        v('P1 anon n a pas %s sur ft_jetons' % droit.upper(), c == 0 and o == 'f', o)
    c, o = psql("select has_table_privilege('service_role','public.ft_jetons','select')", base)
    v('P2 le role serveur non plus : il ne parle qu aux fonctions', c == 0 and o == 'f', o)
    for fn in ('public.ft_enregistrer_instantane(text, jsonb)',
               'public.ft_inscrire_jeton(text, text, text)',
               'public.ft_revoquer_jeton(text)'):
        c, o = psql("select has_function_privilege('anon','%s','execute')" % fn, base)
        v('P3 anon ne peut pas executer %s' % fn.split('(')[0].split('.')[-1],
          c == 0 and o == 'f', o)
        c, o = psql("select has_function_privilege('service_role','%s','execute')" % fn, base)
        v('P4 le role serveur peut executer %s' % fn.split('(')[0].split('.')[-1],
          c == 0 and o == 't', o)

    # ── l'ancienne porte n'est pas touchee par cette migration ──────────────────────
    c, o = psql("select has_function_privilege('anon','public.ft_miroir(text, jsonb)','execute')",
                base)
    v('V2 l ancienne fonction reste executable : V2 est ENCORE OUVERTE, et c est voulu a ce stade',
      c == 0 and o == 't', o)

    # ── le piege du FORCE RLS, eprouve pour de vrai ─────────────────────────────────
    c, o = psql("select relforcerowsecurity from pg_class where relname='ft_jetons'", base)
    v('W1 ft_jetons n a PAS force row level security (sinon la fonction lirait zero ligne)',
      c == 0 and o == 'f', o)
    c, o = psql("select relrowsecurity from pg_class where relname='ft_jetons'", base)
    v('W2 ft_jetons a bien les regles de ligne activees', c == 0 and o == 't', o)
    c, o = psql("select count(*) from pg_policies where tablename='ft_jetons'", base)
    v('W3 aucune policy sur ft_jetons', c == 0 and o.strip() == '0', o)
    c, o = psql("select relforcerowsecurity from pg_class where relname='ft_comptes'", base)
    v('W4 ft_comptes n a pas ete force non plus (la migration n y touche pas)',
      c == 0 and o == 'f', o)

    # ── proprietes que le COMPORTEMENT ne peut pas montrer ───────────────────────────
    # [!!] Un `search_path` non fixe ne se voit pas a l'execution dans un banc propre : il se
    #      voit le jour ou quelqu'un cree un schema qui masque `public`. On le lit donc dans
    #      la definition REELLE, telle que la base l'a enregistree — pas dans le fichier.
    for fn in ('ft_enregistrer_instantane', 'ft_inscrire_jeton', 'ft_revoquer_jeton'):
        c, o = psql("select coalesce(array_to_string(p.proconfig,','),'') "
                    "from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
                    "where p.proname='%s' and n.nspname='public'" % fn, base)
        v('S1 %s a un search_path fixe' % fn, c == 0 and 'search_path=' in o, o)
        c, o = psql("select p.prosecdef from pg_proc p join pg_namespace n "
                    "on n.oid=p.pronamespace where p.proname='%s' and n.nspname='public'" % fn,
                    base)
        v('S2 %s est security definer' % fn, c == 0 and o == 't', o)
        c, o = psql("select prosrc from pg_proc where proname='%s'" % fn, base)
        v('S3 %s ne construit aucun SQL dynamique' % fn,
          c == 0 and not re.search(r'\bexecute\b', o, re.I), o[:120])

    # ⛔ la signature de la fonction d'ecriture ne porte AUCUNE adresse : c'est tout S2-B.
    c, o = psql("select pg_get_function_arguments(p.oid) from pg_proc p "
                "join pg_namespace n on n.oid=p.pronamespace "
                "where p.proname='ft_enregistrer_instantane' and n.nspname='public'", base)
    v('S4 la fonction d ecriture ne recoit ni email ni compte dans sa signature',
      c == 0 and 'email' not in o.lower() and 'compte' not in o.lower(), o)

    return echecs


def main():
    garder = '--garde-la-base' in sys.argv
    print('=== APPLICATION DES MIGRATIONS SUR POSTGRESQL LOCAL ===')
    ok, err = monter('s2b', MIG)
    if not t('A1 les migrations s appliquent telles quelles', ok, err):
        print('\nARRET : la migration ne passe pas.')
        return 1
    ok, _ = monter('s2b_bis', MIG)
    c, o = psql_fichier(os.path.join(MIG, sorted(os.listdir(MIG))[0]), 's2b_bis')
    c2, o2 = psql_fichier(os.path.join(MIG, sorted(os.listdir(MIG))[1]), 's2b_bis')
    t('A2 les migrations sont rejouables sans erreur (idempotentes)', c == 0 and c2 == 0,
      (o + o2)[:200])

    print('\n=== GARANTIES ===')
    echecs = scenarios('s2b')

    print('\n=== LE MECANISME DE FORCE RLS, MESURE ET NON RECITE ===')
    # [!!] LE BANC PRINCIPAL NE PEUT PAS MONTRER CE MECANISME : ici, `postgres` est
    #      SUPERUTILISATEUR, donc il passe outre les regles de ligne quoi qu'on fasse. Une
    #      mutation qui ajoute FORCE reste donc verte sur le comportement — et c'est
    #      exactement le genre de vert qui rassure sans rien prouver.
    #      >> On reproduit donc la situation avec un proprietaire ORDINAIRE.
    psql('drop database if exists s2b_force')
    psql('create database s2b_force')
    psql("do $$ begin if not exists(select 1 from pg_roles where rolname='prop_ordinaire') "
         "then create role prop_ordinaire nologin; end if; end $$;", 's2b_force')
    psql('grant create, usage on schema public to prop_ordinaire', 's2b_force')
    base_f = 's2b_force'
    psql("set role prop_ordinaire; create table reg(h text); insert into reg values ('x'); "
         "alter table reg enable row level security; "
         "create function lire() returns bigint language sql security definer "
         "set search_path=public as $f$ select count(*) from reg $f$;", base_f)
    # [!!] `psql -c` avec plusieurs instructions ECHOTE les etiquettes de commande (« SET »,
    #      « CREATE TABLE »…) : le resultat est la DERNIERE ligne, pas toute la sortie. Ma
    #      premiere version comparait la sortie entiere et rougissait sur une mesure juste.
    def der(x):
        return x.strip().split('\n')[-1].strip()
    c, o = psql('set role prop_ordinaire; select lire()', base_f)
    t('X1 ENABLE seul : la fonction definer voit ses lignes', c == 0 and der(o) == '1', o)
    psql('set role prop_ordinaire; alter table reg force row level security;', base_f)
    c, o = psql('set role prop_ordinaire; select lire()', base_f)
    t('X2 FORCE : la MEME fonction ne voit plus RIEN (le piege est reel)',
      c == 0 and der(o) == '0', o)
    c, o = psql("select rolbypassrls from pg_roles where rolname='prop_ordinaire'", base_f)
    t('X3 et ce proprietaire n a pas BYPASSRLS — c est ce qui rend le piege possible',
      c == 0 and o == 'f', o)
    psql('drop database if exists s2b_force')

    print('\n=== RETOUR ARRIERE ===')
    retour = ("drop function if exists public.ft_revoquer_jeton(text);"
              "drop function if exists public.ft_inscrire_jeton(text, text, text);"
              "drop function if exists public.ft_enregistrer_instantane(text, jsonb);"
              "drop table if exists public.ft_jetons;")
    c, o = psql(retour, 's2b')
    t('Z1 le retour arriere s execute', c == 0, o)
    c, o = psql("select count(*) from public.ft_comptes", 's2b')
    t('Z2 apres retour arriere, ft_comptes existe toujours avec ses lignes',
      c == 0 and o.strip() == '2', o)
    c, o = psql("select has_function_privilege('anon','public.ft_miroir(text, jsonb)','execute')",
                's2b')
    t('Z3 apres retour arriere, l ancien chemin fonctionne encore', c == 0 and o == 't', o)

    if not garder:
        psql('drop database if exists s2b')
        psql('drop database if exists s2b_bis')

    print('\n%d OK / %d rouge' % (OK[0], len(KO)))
    for k in KO:
        print('  rouge :', k)
    return 0 if not KO else 1


if __name__ == '__main__':
    sys.exit(main())
