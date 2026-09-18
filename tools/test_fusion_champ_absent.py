#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B / 0003 — éprouve « champ absent = conservé » sur un VRAI PostgreSQL.

[!!] POURQUOI UNE VRAIE BASE. La question posée — *est-ce qu'une clé absente survit ?* — est
     une question de SÉMANTIQUE SQL. Aucune relecture de fichier ne peut y répondre : elle ne
     verrait pas que `NULL || '{"a":1}'` rend NULL, ni qu'un objet imbriqué est remplacé et
     non fusionné. On applique donc les migrations TELLES QUELLES, on écrit par la vraie
     fonction, et on relit la vraie ligne.

[!!] ⭐⭐ ET ON ÉCRIT PAR LA FONCTION, JAMAIS PAR UN `insert` À LA MAIN. Un banc qui ferait
     l'`insert ... on conflict` lui-même mesurerait SA PROPRE requête, pas la production —
     c'est exactement le vert qui rassure sans rien prouver.

[!!] CE QUE CE BANC NE PROUVE PAS : PostgreSQL 16 en local n'est pas l'instance Supabase.
     `ft_comptes` y est reconstruite d'après la définition MESURÉE le 17/09. C'est un banc de
     sémantique SQL, pas une preuve de déploiement.

Usage : python3 tools/test_fusion_champ_absent.py
Le contrôle négatif passe FT_MIG vers une COPIE mutée (BUGS.md §60 : on ne mute jamais
l'arbre servi).
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIG = os.environ.get('FT_MIG') or os.path.join(ROOT, 'supabase', 'migrations')
SOCK = os.environ.get('FT_PGSOCK') or '/tmp/pg_s2b'
PORT = os.environ.get('FT_PGPORT') or '55432'
BASE = os.environ.get('FT_PGBASE') or 'fusion0003'

OK = [0]
KO = []
H = 'a' * 64                      # le jeton de l'appareil de test
CPT = 'compte.test@exemple.invalid'


def psql(sql, base=BASE):
    r = subprocess.run(
        ['psql', '-h', SOCK, '-p', PORT, '-U', 'postgres', '-d', base,
         '-v', 'ON_ERROR_STOP=1', '-tA', '-c', sql],
        capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def fichier(chemin, base=BASE):
    r = subprocess.run(
        ['psql', '-h', SOCK, '-p', PORT, '-U', 'postgres', '-d', base,
         '-v', 'ON_ERROR_STOP=1', '-f', chemin],
        capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def t(nom, cond, detail=''):
    if cond:
        OK[0] += 1
        print('  OK   %s' % nom)
    else:
        KO.append(nom)
        print('  !!   %s\n       %s' % (nom, str(detail)[:220]))
    return cond


# ⚠️ `ft_comptes` n'est PAS versionnée : on la reconstruit d'après la mesure du 17/09,
#    exactement comme le fait `tools/test_migrations_s2b.py`. Ce bloc n'est pas une migration
#    et ne doit jamais en devenir une.
SOCLE = """
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
alter table public.ft_comptes enable row level security;
"""


def monter():
    psql('drop database if exists ' + BASE, 'postgres')
    c, o = psql('create database ' + BASE, 'postgres')
    if c:
        return False, o
    c, o = psql(SOCLE)
    if c:
        return False, o
    for f in sorted(os.listdir(MIG)):
        if f.endswith('.sql'):
            c, o = fichier(os.path.join(MIG, f))
            if c:
                return False, f + ' : ' + o
    # le jeton de test, pose directement (la pose n'est pas le sujet de ce banc)
    c, o = psql("insert into public.ft_jetons(hachage, compte) values ('%s','%s')" % (H, CPT))
    return c == 0, o


def ecrire(obj):
    """Ecrit via LA VRAIE FONCTION. Rend (ok, sortie)."""
    charge = json.dumps(obj).replace("'", "''")
    return psql("select public.ft_enregistrer_instantane('%s', '%s'::jsonb)" % (H, charge))


def lire():
    c, o = psql("select coalesce(data::text,'<<NULL>>') from public.ft_comptes "
                "where email='%s'" % CPT)
    if c or not o:
        return None
    return o if o == '<<NULL>>' else json.loads(o)


def vider():
    psql("delete from public.ft_comptes")


def main():
    print('=== MONTAGE (migrations appliquees telles quelles) ===')
    ok, err = monter()
    if not t('M1 les %d migrations s appliquent' % len([f for f in os.listdir(MIG)
                                                        if f.endswith('.sql')]), ok, err):
        print('\nARRET : le socle ne monte pas.')
        return 1

    print('\n=== T1 - PREMIERE ECRITURE (aucun blob prealable) ===')
    vider()
    c, o = ecrire({'sessions': ['s1'], 'weights': ['w1']})
    d = lire()
    t('T1 les deux champs sont presents', c == 0 and d == {'sessions': ['s1'],
                                                           'weights': ['w1']}, d)

    print('\n=== T2 - CHAMP ABSENT (le test principal) ===')
    vider()
    ecrire({'sessions': ['ancienne_session'], 'weights': ['ancienne_pesee']})
    c, o = ecrire({'weights': ['nouvelle_pesee']})
    d = lire()
    t('T2a le champ ABSENT conserve sa valeur (sessions)',
      isinstance(d, dict) and d.get('sessions') == ['ancienne_session'], d)
    t('T2b le champ PRESENT est remplace (weights)',
      isinstance(d, dict) and d.get('weights') == ['nouvelle_pesee'], d)

    print('\n=== T3 - TABLEAU VIDE EXPLICITE (present, donc ecrit) ===')
    vider()
    ecrire({'sessions': ['ancienne_session'], 'weights': ['ancienne_pesee']})
    ecrire({'weights': []})
    d = lire()
    t('T3a un tableau vide ENVOYE est bien ecrit (absence != vide)',
      isinstance(d, dict) and d.get('weights') == [], d)
    t('T3b et il n entraine pas les autres champs',
      isinstance(d, dict) and d.get('sessions') == ['ancienne_session'], d)

    print('\n=== T4 - VALEUR SCALAIRE REMPLACEE ===')
    vider()
    ecrire({'foo': 'A'})
    ecrire({'foo': 'B'})
    t('T4 la valeur scalaire est remplacee', lire() == {'foo': 'B'}, lire())

    print('\n=== T5 - PLUSIEURS CHAMPS ABSENTS ===')
    vider()
    ecrire({'a': 1, 'b': 2, 'c': 3})
    ecrire({'b': 20})
    t('T5 a et c survivent, b est remplace', lire() == {'a': 1, 'b': 20, 'c': 3}, lire())

    print('\n=== T6 - null EXPLICITE (on DOCUMENTE la regle, on ne l invente pas) ===')
    vider()
    ecrire({'foo': 'A'})
    ecrire({'foo': None})
    d = lire()
    t('T6 un null explicite RESTE null - il n efface pas la cle',
      isinstance(d, dict) and 'foo' in d and d['foo'] is None, d)

    print('\n=== T7 - OBJET IMBRIQUE : fusion de SURFACE, pas profonde ===')
    vider()
    ecrire({'profil': {'a': 1, 'b': 2}})
    ecrire({'profil': {'a': 3}})
    d = lire()
    t('T7 l objet imbrique est REMPLACE en entier (surface, et c est dit)',
      isinstance(d, dict) and d.get('profil') == {'a': 3}, d)

    print('\n=== T8 - LE PIEGE DU NULL A GAUCHE (mesure, pas suppose) ===')
    vider()
    psql("insert into public.ft_comptes(email, data) values ('%s', null)" % CPT)
    ecrire({'a': 1})
    d = lire()
    t('T8 une ligne dont data vaut NULL est COMPLETEE, pas videe',
      isinstance(d, dict) and d.get('a') == 1, d)

    print('\n=== T9 - NON-REGRESSION : les justificatifs ne franchissent toujours pas ===')
    vider()
    ecrire({'bw': 80, 'token': 'X', 'authCode': 'Y', 'code': 'Z',
            'confirmCode': 'W', 'apikey': 'V', 'authorization': 'U'})
    d = lire()
    t('T9a aucun justificatif n est stocke',
      isinstance(d, dict) and not ({'token', 'authCode', 'code', 'confirmCode',
                                    'apikey', 'authorization'} & set(d)), d)
    t('T9b la donnee metier passe', isinstance(d, dict) and d.get('bw') == 80, d)
    # ⛔⛔ LE TEST QUI A TROUVE UNE REGRESSION DE LA CORRECTION ELLE-MEME.
    #    Avec le remplacement integral, une fuite deja dans le miroir etait EFFACEE par la
    #    sauvegarde suivante. Avec la fusion naive, la cle est absente de `excluded.data`
    #    (retiree par `-`), donc *absence = conservee*, donc LA FUITE SURVIVAIT. Le retrait
    #    des justificatifs est donc reapplique APRES la fusion.
    #    >> *Le geste qui protege les champs metier protegeait aussi ceux qu'on veut voir
    #       disparaitre.*
    vider()
    psql("insert into public.ft_comptes(email, data) values ('%s', "
         "'{\"token\":\"FUITE\",\"authCode\":\"FUITE2\",\"bw\":70}'::jsonb)" % CPT)
    ecrire({'bw': 80})
    d = lire()
    t('T9c ⭐ un justificatif deja present AVANT la fusion est PURGE, pas conserve',
      isinstance(d, dict) and 'token' not in d and 'authCode' not in d, d)
    t('T9d et la purge n emporte pas la donnee metier', isinstance(d, dict) and d.get('bw') == 80,
      d)

    print('\n=== T10 - NON-REGRESSION : l identite decide toujours ===')
    c, _ = psql("select public.ft_enregistrer_instantane('%s', '{\"a\":1}'::jsonb)" % ('f' * 64))
    t('T10a un hache INCONNU est refuse', c != 0)
    psql("update public.ft_jetons set revoque = true where hachage='%s'" % H)
    c, _ = ecrire({'a': 1})
    t('T10b un hache REVOQUE est refuse', c != 0)
    psql("update public.ft_jetons set revoque = false where hachage='%s'" % H)

    print('\n' + '=' * 70)
    print('TOTAL : %d OK, %d rouge(s)' % (OK[0], len(KO)))
    for k in KO:
        print('  - ' + k)
    return 0 if not KO else 1


if __name__ == '__main__':
    sys.exit(main())
