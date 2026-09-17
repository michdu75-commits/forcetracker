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
GEN = 'tools/gen_s2b_diag_pdf.py'
LOG_BANC = '/tmp/diag_acces.log'
LOG_MUT = '/tmp/diag_acces.log'

# (nom, quoi, avant, apres, attendu) ; quoi = fichier du depot, ou '@@BANC@@'
MUTATIONS = [
    # ── le journal des mesures : une mesure absente n'est jamais verte ───────────────
    ('@@BANC@@ la cause nommee disparait du journal', '@@BANC@@',
     'Host not in allowlist', 'quelque chose a echoue', 'ROUGE'),
    ('@@BANC@@ la mesure au navigateur disparait', '@@BANC@@',
     'ERR_TUNNEL_CONNECTION_FAILED', 'rien a signaler', 'ROUGE'),
    ('@@BANC@@ la resolution DNS n est plus mesuree', '@@BANC@@',
     'resolution OK', 'non teste', 'ROUGE'),
    ('@@BANC@@ le refus du mandataire disparait', '@@BANC@@',
     'CONNECT tunnel failed, response 403', 'echec', 'ROUGE'),
    ('@@BANC@@ ⭐ une REPONSE DU WORKER apparait dans le journal', '@@BANC@@',
     'resolution OK', "{\"status\":\"error\",\"error\":\"origin\"}\nresolution OK", 'ROUGE'),
    ('@@BANC@@ le journal porte un autre hote que le depot', '@@BANC@@',
     'dry-field-e931.forcetracker-app.workers.dev', 'autre-hote.exemple.invalid', 'ROUGE'),

    # ── le code servi ───────────────────────────────────────────────────────────────
    ('le filtre d origine cesse d etre une simple comparaison', 'worker.js',
     "const _origin = request.headers.get('Origin') || '';",
     "const _origin = await verifierSignature(request);", 'ROUGE'),
    ('l URL du Worker disparait du depot', 'constants.js',
     "const AI_PROXY_URL='https://dry-field-e931.forcetracker-app.workers.dev';",
     "const AI_PROXY_URL='';", 'ROUGE'),
    ('le deploiement automatique disparait', '.github/workflows/deploy-worker.yml',
     "      - 'worker.js'", "      - 'jamais.js'", 'ROUGE'),
    ('V2 est refermee dans le client', 'supabase.js', 'p_email: email', 'p_email: "x"', 'ROUGE'),

    # ── le document ─────────────────────────────────────────────────────────────────
    ('@@DOC@@ le document affirme que le test a eu lieu', GEN,
     "H.append(P('D - Verdict', 'h1'))",
     "H.append(P('Le test externe a ete fait.', 'p'))\nH.append(P('D - Verdict', 'h1'))",
     'ROUGE'),
    ('@@DOC@@ le document rattribue le blocage au filtre d origine', GEN,
     "H.append(P('D - Verdict', 'h1'))",
     "H.append(P('Le filtre d origine empeche le test.', 'p'))\n"
     "H.append(P('D - Verdict', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document presente le bouton comme necessaire', GEN,
     "H.append(P('E - Bouton d administration', 'h1'))",
     "H.append(P('Un bouton est necessaire.', 'p'))\n"
     "H.append(P('E - Bouton d administration', 'h1'))", 'ROUGE'),
    ('@@DOC@@ la correction « Michel avait raison » est effacee', GEN,
     'Michel avait raison.', 'La question reste ouverte.', 'ROUGE'),
    ('@@DOC@@ le refus de contourner disparait', GEN,
     'se <b>rapporte</b>, il ne se contourne pas', 'se rapporte parfois', 'ROUGE'),
    ('@@DOC@@ le verdict sur le bouton change', GEN,
     "'UTILE MAIS NON NECESSAIRE - ET PAS POUR LA RAISON QUE J AVAIS DONNEE',",
     "'INDISPENSABLE',", 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ───────────────────────────────────
    ('[negatif] le filtre d origine cite dans un COMMENTAIRE', 'worker.js',
     'const ALLOWED_ORIGIN',
     '// note : ALLOWED_ORIGIN ne prouve aucune identite\nconst ALLOWED_ORIGIN', 'VERT'),
    ('[negatif] un commentaire du depot parle de Host not in allowlist', 'constants.js',
     "const AI_PROXY_URL=",
     "// diagnostic : Host not in allowlist si l hote n est pas autorise\nconst AI_PROXY_URL=",
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
