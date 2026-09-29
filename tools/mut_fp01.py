#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-FP-01 (session-B) : les temoins B-CDVIII / B-CDIX savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit : ecran conduit (E*, F* :
vrai champ, vrai bouton, vrai rechargement) ou valeur servie par l'app dans la page (A*..D*). Un rouge
des seuls temoins de SOURCE (①..④) ne suffit pas : la mutation est alors NON conforme.
M00 = coach.js tel qu'il etait AVANT le lot (master 7a71649e, ft-v1243), mot pour mot.
M1..M8 = la liste demandee par Michel · D1, D2 = deguisees · D3 = equivalente (doit RESTER verte)
· [negatif] = commentaire citant les motifs (doit RESTER vert).
Usage : python3 tools/mut_fp01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '7a71649e'
CO = 'coach.js'
FICHIERS = (CO,)

GARDE = ("    if(/\\bbouton|\\bb(?:u|eu)g\\b|\\baffich|\\bapparu|\\bapparai|\\b(?:demande|veux|voulais|voudrais)\\s+pas\\b|\\bpas\\s+besoin\\b/i.test(p)) return false;\n")
VERBE = "if(/\\b(fai[st]|donne|propose|pr[ée]pare|cr[ée]e|construis|monte|[ée]cris|lance|balance|envoie|g[ée]n[èe]re)\\b"
REGLE2 = "    // ② une séance nommée comme celle qu'on va faire (« une séance », « ma séance du jour »…)\n"
AMBIGU = "    if(/\\bpourquoi\\b(?!\\s+pas\\b)|\\bne\\s+compte\\s+pas\\b|\\bdebrief/i.test(p)) return false;\n"
QUESTION = "    else if (_dsDemande) _appendSeanceQuestion(reply, _derniereBulleCoach(), _msgA);\n"
R1_COMMENT = "    // ① un verbe de demande suivi, dans la même phrase, du mot séance / entraînement / programme\n"

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (coach.js de 7a71649e)", 'AVANT', 'GARDE'),
    ('M1 retour a la logique permissive : le garde « bouton / affiche / negation » n\'existe plus', [(CO, GARDE, '')], 'GARDE'),
    ('M2 le garde est la mais desactive (condition jamais vraie)', [(CO, GARDE, GARDE.replace('if(/', 'if(false&&/'))], 'GARDE'),
    ('M3 correctif trop large : « fais » retire des verbes de demande (« Fais-moi une seance » devient faux)',
     [(CO, VERBE, VERBE.replace('fai[st]|', ''))], 'GARDE'),
    ('M4 correctif trop large : le garde passe AVANT la regle a verbe et prend une duree pour une discussion',
     [(CO, GARDE, ''), (CO, R1_COMMENT, GARDE.replace('\\bpas\\s+besoin\\b', '\\bpas\\s+besoin\\b|\\bde\\s+\\d+') + R1_COMMENT)], 'GARDE'),
    ('M5 le booleen est juste mais la carte s\'affiche quand meme (repli sur le mot « seance »)',
     [(CO, QUESTION, QUESTION.replace('else if (_dsDemande)', 'else if (_dsDemande || /s[ée]ance/i.test(msg))'))], 'GARDE'),
    ('M6 une plainte contenant « bouton » repasse en positif', [(CO, GARDE, GARDE.replace('\\bbouton|', ''))], 'GARDE'),
    ('M7 « je ne demande pas une seance » repasse en positif (negation retiree du garde)',
     [(CO, GARDE, GARDE.replace('\\b(?:demande|veux|voulais|voudrais)\\s+pas\\b|', ''))], 'GARDE'),
    ('M8 une ancienne exclusion utile est cassee (« pourquoi »)', [(CO, AMBIGU, AMBIGU.replace('\\bpourquoi\\b(?!\\s+pas\\b)|', ''))], 'GARDE'),
    ('D1 [deguisee] le garde teste le texte AVEC accents (« apparaît » ne mord plus)', [(CO, GARDE, GARDE.replace('.test(p))', '.test(t))'))], 'GARDE'),
    ('D2 [deguisee] le garde arrive trop tard (apres la regle « une seance »)',
     [(CO, GARDE, ''), (CO, "    if(/\\bs[ée]ance\\s+(du\\s+jour", GARDE + "    if(/\\bs[ée]ance\\s+(du\\s+jour")], 'GARDE'),
    ('D3 [equivalente] « boutons? » au lieu de « bouton » : doit RESTER vert', [(CO, GARDE, GARDE.replace('\\bbouton|', '\\bboutons?|'))], 'OK'),
    ('[negatif] commentaire citant les motifs cherches', [(CO, GARDE, GARDE + "    // bouton · bug · affiché · apparaît · je ne demande pas · pas besoin — c'était le faux positif\n")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_fp01.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    # temoins EXECUTES : ecran conduit (E, F) ou valeur servie dans la page (A, B, C, D)
    return [x for x in rouges if re.match(r'❌ ROUGE [A-F]\d', x)]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_fp01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        cond = [x for x in ex if re.match(r'❌ ROUGE [EF]\d', x)]
        montre = (cond or ex or rouges or [''])[0]
        print('  %s  %-100s %-6s %2d rouge(s), %2d execute(s) dont %2d ecran  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), len(cond), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
