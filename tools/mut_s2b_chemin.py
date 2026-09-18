#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier S2-B / diagnostic d'acces. Arbre CLONE.

[!!] Les mutations du DOCUMENT sont bornees entre @@DEBUT@@ et @@FIN@@ : sans cette borne,
     une mutation reecrirait la GARDE en meme temps que le texte, et se prouverait elle-meme.

[!!] Les mutations de JOURNAL sont ecrites dans une copie du journal, pas dans l'original :
     un dossier doit refuser de publier un total tronque ou faux, et c'est ce qu'on eprouve.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_chemin_pdf.py'
LOG_BANC = '/tmp/diag_acces.log'
LOG_MUT = '/tmp/diag_acces.log'

# (nom, quoi, avant, apres, attendu)
MUTATIONS = [
    ('@@BANC@@ la cause nommee disparait', '@@BANC@@',
     'Host not in allowlist', 'echec inconnu', 'ROUGE'),
    ('@@BANC@@ la mesure au navigateur disparait', '@@BANC@@',
     'ERR_TUNNEL_CONNECTION_FAILED', 'rien', 'ROUGE'),
    ('@@BANC@@ ⭐ une REPONSE DU WORKER apparait dans le journal', '@@BANC@@',
     'resolution OK', '{"status":"error","error":"auth"}\nresolution OK', 'ROUGE'),
    ('@@BANC@@ le journal porte un autre hote', '@@BANC@@',
     'dry-field-e931.forcetracker-app.workers.dev', 'autre.exemple.invalid', 'ROUGE'),

    ('⭐⭐ l injecteur ECRASE un jeton fourni (le test enverrait le VRAI)', 'constants.js',
     'if(o && typeof o==="object" && !o.token)'.replace('"', "'"),
     "if(o && typeof o==='object')", 'ROUGE'),
    ('la route de sauvegarde disparait du Worker', 'worker.js',
     "body.action === 'cloudSave'", "body.action === 'autreChose'", 'ROUGE'),
    ('l URL du Worker disparait du depot', 'constants.js',
     "const AI_PROXY_URL='https://dry-field-e931.forcetracker-app.workers.dev';",
     "const AI_PROXY_URL='';", 'ROUGE'),
    ('le deploiement automatique disparait', '.github/workflows/deploy-worker.yml',
     "      - 'worker.js'", "      - 'jamais.js'", 'ROUGE'),
    ('V2 est refermee dans le client', 'supabase.js', 'p_email: email', 'p_email: "x"', 'ROUGE'),

    ('@@DOC@@ le document affirme que le test a eu lieu', GEN,
     "H.append(P('E - Bouton dans l application', 'h1'))",
     "H.append(P('Le test a ete fait.', 'p'))\n"
     "H.append(P('E - Bouton dans l application', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document annonce une ecriture', GEN,
     "H.append(P('E - Bouton dans l application', 'h1'))",
     "H.append(P('Cet essai ecrit une ligne.', 'p'))\n"
     "H.append(P('E - Bouton dans l application', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le bouton devient necessaire', GEN,
     "H.append(P('E - Bouton dans l application', 'h1'))",
     "H.append(P('Un bouton est necessaire.', 'p'))\n"
     "H.append(P('E - Bouton dans l application', 'h1'))", 'ROUGE'),
    ('@@DOC@@ la case a cocher disparait du mode d emploi', GEN,
     '  -> COCHER « Also include default list of common package managers »', '  -> fin',
     'ROUGE'),
    # [!!] SANS le prefixe du document : ces deux ancres vivent dans la section des
    #      MESURES, pas dans le corps redige — les borner a la zone les rendait introuvables.
    ('le test lit le VRAI jeton', GEN,
     "\"                         token:'\" + JETON_FACTICE + \"',\\n\"",
     "\"                         token:_ftToken(),\\n\"", 'ROUGE'),
    ('le test envoie une adresse', GEN,
     '"                         data:{ essai:true } })\\n"',
     '"                         data:{ email:\'x\' } })\\n"', 'ROUGE'),
    # [!!] L'ANCRE ETAIT COUPEE EN DEUX LITTERAUX Python : la chaine n'existe pas
    #      contiguement dans la source. On vise un morceau reellement contigu.
    ('@@DOC@@ la reserve sur les secrets Cloudflare disparait', GEN,
     '<i>C est son releve, pas ', 'Les secrets sont donc poses, ', 'ROUGE'),

    ('[negatif] un commentaire du Worker parle de p_email', 'worker.js',
     'const _FORME_JETON = /^[0-9a-f]{64}$/;',
     '// rappel : plus aucun p_email nulle part\nconst _FORME_JETON = /^[0-9a-f]{64}$/;',
     'VERT'),
    ('[negatif] un commentaire cite Host not in allowlist', 'constants.js',
     'const AI_PROXY_URL=',
     '// diagnostic : Host not in allowlist si l hote n est pas autorise\nconst AI_PROXY_URL=',
     'VERT'),
]


def borne_doc(src, avant, apres):
    d, f = src.find('# @@DEBUT@@'), src.find('# @@FIN@@')
    if d < 0 or f < 0:
        return None
    zone = src[d:f]
    if zone.count(avant) != 1:
        return None
    return src[:d] + zone.replace(avant, apres) + src[f:]


def main():
    conformes = 0
    for nom, quoi, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='p1_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        env = dict(os.environ, FT_ROOT=arbre, FT_OUT=os.path.join(tmp, 'x.pdf'),
                   FT_LOG_ACCES=LOG_BANC)

        if quoi in ('@@BANC@@', '@@MUT@@'):
            orig = LOG_BANC if quoi == '@@BANC@@' else LOG_MUT
            txt = open(orig, encoding='utf-8', errors='replace').read()
            if avant not in txt:
                print('  INVALIDE  %-64s (ancre absente du journal)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
            copie = os.path.join(tmp, 'journal.log')
            open(copie, 'w', encoding='utf-8').write(txt.replace(avant, apres))
            env['FT_LOG_ACCES'] = copie
        else:
            cible = os.path.join(arbre, quoi)
            src = open(cible, encoding='utf-8').read()
            if nom.startswith('@@DOC@@'):
                neuf = borne_doc(src, avant, apres)
                if neuf is None:
                    print('  INVALIDE  %-64s (ancre absente ou multiple dans la zone)' % nom)
                    shutil.rmtree(tmp, ignore_errors=True)
                    continue
            else:
                if src.count(avant) != 1:
                    print('  INVALIDE  %-64s (ancre %s)'
                          % (nom, 'absente' if avant not in src else 'multiple'))
                    shutil.rmtree(tmp, ignore_errors=True)
                    continue
                neuf = src.replace(avant, apres)
            if neuf == src:
                print('  INVALIDE  %-64s (mutation sans effet)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
            open(cible, 'w', encoding='utf-8').write(neuf)

        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        obtenu = 'ROUGE' if r.returncode != 0 else 'VERT'
        ok = (obtenu == attendu)
        conformes += ok
        raison = ''
        if obtenu == 'ROUGE':
            raison = (r.stdout + r.stderr).strip().split('\n')[-1][:86]
        print('  %s  %-64s %s  %s' % ('OK ' if ok else '!! ', nom, obtenu, raison))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
