#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V2 / 0004 — eprouve le compteur anonyme de `ft_miroir` sur un VRAI PostgreSQL.

[!!] ON APPELLE LA VRAIE RPC, JAMAIS UN `update` A LA MAIN. Un banc qui incrementerait
     lui-meme le compteur mesurerait sa propre requete, pas la production.

[!!] CE BANC EST LE SEUL ENDROIT OU `ft_miroir` DOIT ETRE APPELEE VOLONTAIREMENT — et il
     tourne sur une base LOCALE jetable, jamais sur l'instance. A partir de l'installation du
     compteur en reel, tout appel volontaire a l'ancienne porte fausserait la mesure.

Usage : python3 tools/test_compteur_ft_miroir.py
"""
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIG = os.environ.get('FT_MIG') or os.path.join(ROOT, 'supabase', 'migrations')
SOCK = os.environ.get('FT_PGSOCK') or '/tmp/pg_s2b'
PORT = os.environ.get('FT_PGPORT') or '55432'
BASE = os.environ.get('FT_PGBASE') or 'compteur0004'
BIN = '/usr/lib/postgresql/16/bin'

OK = [0]
KO = []
H = 'a' * 64
CPT = 'legacy.compte@exemple.invalid'

SOCLE = """
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon')          then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')  then create role service_role nologin; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
-- ⭐⭐ ON REPRODUIT LES DROITS PAR DEFAUT DE SUPABASE, ET C'EST UN TROU DE BANC COMBLE.
-- Sans cette ligne, une table fraichement creee n'est lisible par personne, donc les
-- `revoke` de la migration sont des NON-OPERATIONS : les retirer ne changeait rien et le
-- controle negatif restait vert. >> *Un garde qu'on eprouve dans un monde ou il est inutile
-- n'est pas eprouve.* Supabase, lui, accorde par defaut aux roles de l'API — c'est
-- exactement pour ca que `ft_jetons` a eu besoin de `revoke` explicites.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
create table public.ft_comptes (
  email      text primary key,
  data       jsonb,
  updated_at timestamptz default now()
);
alter table public.ft_comptes enable row level security;
-- ⭐ LA DEFINITION REELLE, RELUE AU TABLEAU DE BORD LE 19/09 et comparee caractere par
--    caractere a la reconstitution du banc : identiques. C'est elle que la migration 0004
--    remplace, donc c'est elle qu'on doit monter ici avant de l'appliquer.
create or replace function public.ft_miroir(p_email text, p_data jsonb)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.ft_comptes(email, data, updated_at)
  values (lower(trim(p_email)), p_data, now())
  on conflict (email) do update
    set data = excluded.data, updated_at = now();
end;
$function$;
grant execute on function public.ft_miroir(text, jsonb) to anon, authenticated;
"""


def psql(sql, base=BASE):
    r = subprocess.run([os.path.join(BIN, 'psql'), '-h', SOCK, '-p', PORT, '-U', 'postgres',
                        '-d', base, '-v', 'ON_ERROR_STOP=1', '-tA', '-c', sql],
                       capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def fichier(chemin, base=BASE):
    r = subprocess.run([os.path.join(BIN, 'psql'), '-h', SOCK, '-p', PORT, '-U', 'postgres',
                        '-d', base, '-v', 'ON_ERROR_STOP=1', '-f', chemin],
                       capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def t(nom, cond, detail=''):
    if cond:
        OK[0] += 1
        print('  OK   ' + nom)
    else:
        KO.append(nom)
        print('  !!   ' + nom + '\n       ' + str(detail)[:200])
    return cond


def compteur():
    c, o = psql("select appels_total || '|' || coalesce(dernier_appel::text,'-') || '|' "
                "|| debut_mesure::text from public.ft_miroir_usage")
    if c or not o:
        return None
    a, d, deb = o.split('|', 2)
    return {'total': int(a), 'dernier': d, 'debut': deb}


def miroir(email=CPT, n=1):
    for i in range(n):
        psql("select public.ft_miroir('%s', '{\"k\":%d}'::jsonb)" % (email, i))


def monter():
    psql('drop database if exists ' + BASE, 'postgres')
    c, o = psql('create database ' + BASE, 'postgres')
    if c:
        return False, o
    c, o = psql(SOCLE)
    if c:
        return False, o
    for f in sorted(x for x in os.listdir(MIG) if x.endswith('.sql')):
        c, o = fichier(os.path.join(MIG, f))
        if c:
            return False, f + ' : ' + o
    return True, ''


def main():
    print('=== MONTAGE (socle mesure + les 4 migrations) ===')
    ok, err = monter()
    if not t('M1 les migrations s appliquent', ok, err):
        return 1
    psql("insert into public.ft_jetons(hachage, compte) values ('%s','%s')" % (H, CPT))

    print('\n=== T1 — apres initialisation ===')
    c1 = compteur()
    t('T1a le compteur existe et vaut 0', c1 and c1['total'] == 0, c1)
    t('T1b `dernier_appel` est vide, `debut_mesure` est pose',
      c1 and c1['dernier'] == '-' and c1['debut'], c1)

    print('\n=== T2 — un appel accepte ===')
    miroir(n=1)
    c2 = compteur()
    t('T2a le compteur passe a 1', c2 and c2['total'] == 1, c2)
    t('T2b `dernier_appel` est renseigne et >= `debut_mesure`',
      c2 and c2['dernier'] != '-' and c2['dernier'] >= c2['debut'], c2)

    print('\n=== T3 — dix appels ===')
    miroir(n=10)
    c3 = compteur()
    t('T3 le compteur vaut 11 (1 + 10)', c3 and c3['total'] == 11, c3)

    print('\n=== T4 — appels CONCURRENTS (aucun increment perdu) ===')
    psql("update public.ft_miroir_usage set appels_total = 0")
    N = 40
    with ThreadPoolExecutor(max_workers=12) as ex:
        list(ex.map(lambda i: psql("select public.ft_miroir('%s', '{\"c\":%d}'::jsonb)"
                                   % (CPT, i)), range(N)))
    c4 = compteur()
    t('T4 %d appels concurrents, %d comptes : aucun increment perdu' % (N, N),
      c4 and c4['total'] == N, c4)

    print('\n=== T5 — la voie MODERNE ne doit PAS bouger le compteur ===')
    avant = compteur()['total']
    for i in range(5):
        psql("select public.ft_enregistrer_instantane('%s', '{\"m\":%d}'::jsonb)" % (H, i))
    apres = compteur()['total']
    t('T5 le compteur V2 est inchange apres 5 ecritures modernes', avant == apres,
      {'avant': avant, 'apres': apres})

    print('\n=== T6 — aucune donnee personnelle stockee ===')
    c, cols = psql("select string_agg(column_name, ',' order by ordinal_position) "
                   "from information_schema.columns "
                   "where table_schema='public' and table_name='ft_miroir_usage'")
    t('T6a la table n a QUE les 4 colonnes prevues',
      cols == 'id,appels_total,dernier_appel,debut_mesure', cols)
    c, fuite = psql("select count(*) from public.ft_miroir_usage where "
                    "ft_miroir_usage::text like '%exemple.invalid%'")
    t('T6b aucune trace de l adresse employee par les 50+ appels', fuite == '0', fuite)
    # ⭐ et la preuve STRUCTURELLE : la fonction de comptage ne recoit aucun parametre.
    c, corps = psql("select pg_get_functiondef(p.oid) from pg_proc p "
                    "join pg_namespace n on n.oid=p.pronamespace "
                    "where n.nspname='public' and p.proname='ft_miroir'")
    bloc = corps[corps.find('ft_miroir_usage'):] if 'ft_miroir_usage' in corps else ''
    t('T6c l increment ne nomme ni p_email ni p_data (anonyme par construction)',
      bloc and 'p_email' not in bloc and 'p_data' not in bloc, bloc[:120])

    print('\n=== T7 — la table est HORS DE PORTEE de l API ===')
    ok_droits = True
    for role in ('anon', 'authenticated', 'service_role', 'public'):
        c, o = psql("select coalesce(has_table_privilege('%s','public.ft_miroir_usage',"
                    "'select'),false)" % role if role != 'public' else
                    "select count(*) from information_schema.role_table_grants "
                    "where table_name='ft_miroir_usage' and grantee='PUBLIC'")
        if role == 'public':
            ok_droits = ok_droits and o == '0'
        else:
            ok_droits = ok_droits and o == 'f'
    t('T7a aucun role de l API ne peut LIRE le compteur', ok_droits)
    c, o = psql("select relrowsecurity from pg_class where relname='ft_miroir_usage'")
    t('T7b la securite au niveau ligne est activee', o == 't', o)
    c, o = psql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
                "where n.nspname='public' and p.proname like '%miroir_usage%'")
    t('T7c aucune RPC publique de consultation n a ete creee', o == '0', o)

    print('\n=== T8 — une seule ligne, par CONSTRUCTION ===')
    c, o = psql("insert into public.ft_miroir_usage (id) values (false)")
    t('T8a une seconde ligne est REFUSEE par la contrainte', c != 0, o[:90])
    c, o = psql("select count(*) from public.ft_miroir_usage")
    t('T8b il n y a toujours qu une ligne', o == '1', o)

    print('\n=== T10 — OPTION B : un appel qui N ECRIT PAS ne compte pas ===')
    # ⭐ LE TEMOIN QUI MANQUAIT, ET C'EST LE CONTROLE NEGATIF QUI L'A REVELE : rien ne
    #    prouvait le choix « compter APRES l'ecriture ». Un `p_email` nul fait echouer
    #    l'insert (cle primaire), donc rien n'est sauvegarde — donc rien ne doit compter.
    av = compteur()['total']
    c, o = psql("select public.ft_miroir(null, '{\"x\":1}'::jsonb)")
    ap = compteur()['total']
    t('T10a un appel legacy qui ECHOUE n incremente pas le compteur', av == ap,
      {'avant': av, 'apres': ap, 'retour': o[:80]})
    t('T10b et cet appel a bien echoue (sinon le test ne prouve rien)', c != 0, o[:80])

    print('\n=== T9 — le compteur ne fait JAMAIS echouer une sauvegarde ===')
    # on casse le compteur de la facon la plus brutale : la table disparait
    psql('drop table public.ft_miroir_usage')
    c, o = psql("select public.ft_miroir('%s', '{\"survie\":1}'::jsonb)" % CPT)
    t('T9a la sauvegarde legacy PASSE malgre un compteur casse', c == 0, o[:120])
    c, o = psql("select data->>'survie' from public.ft_comptes where email='%s'" % CPT)
    t('T9b et la donnee est bien ecrite', o == '1', o)

    print('\n' + '=' * 70)
    print('TOTAL : %d OK, %d rouge(s)' % (OK[0], len(KO)))
    for k in KO:
        print('  - ' + k)
    return 0 if not KO else 1


if __name__ == '__main__':
    sys.exit(main())
