#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-FP-01 (session-B) : les temoins savent-ils ROUGIR ?
Reecrit le 30/09/2026 pour l'architecture decidee par Michel : MASTER PRESERVE PAR DEFAUT, VETO ETROIT.

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit : valeur servie dans la page
     (A..D, G, I, L), ecran conduit (E, F, H, J, O) ou corpus differentiel execute (K). Un rouge des seuls
     temoins de SOURCE (①..⑩) ne suffit pas : la mutation est alors NON conforme.
Les mutations cassent le PRINCIPE, pas un mot :
  M00 / B2 / B3 = des versions entieres remises (master ; les deux premieres strategies de la branche)
  B1 = « bouton / bug / affiche present = rejet » (la strategie abandonnee)
  P1..P3 = veto trop large (fenetre de 4 mots, garde « rien que de la meta » retire, veto avant la regle ①)
  P4..P7 = une meta-discussion acceptee (« bouton pour faire », refus, affichage, apparition)
  P8 = la fenetre libre de 40 caracteres rouverte · P9 = une demande historique perdue (desir non protege)
  P10 = [deguisee] la regle ② relit le texte brut · P11..P13 = le CORPUS rendu aveugle
  DG1, DG2 = deguisees · EQ1..EQ3 = equivalentes (doivent RESTER vertes) · [negatif] = commentaire
Usage : python3 tools/mut_fp01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '7a71649e'
CO = 'coach.js'
OUTIL = os.path.join('tools', 'corpus_fp01.js')
FICHIERS = (CO, OUTIL)

co = open(os.path.join(SRC, CO), encoding='utf-8').read()
lignes = co.split('\n')
def ligne(pred, quoi):
    l = [x for x in lignes if pred(x)]
    if len(l) != 1:
        raise SystemExit('ancre %s : %d ligne(s)' % (quoi, len(l)))
    return l[0] + '\n'
APPEL = ligne(lambda x: x.strip() == 'const u=_sansMetaSeance(t,p);', 'appel')
ALIGN = ligne(lambda x: x.strip() == 'if(p.length!==t.length) return t;', 'alignement')
V1 = ligne(lambda x: 'new RegExp(' in x and 'bouton|carte' in x, 'V1')
V2 = ligne(lambda x: 'new RegExp(' in x and 'demande|veux' in x, 'V2')
V3 = ligne(lambda x: 'new RegExp(' in x and 'affiche(?:e' in x, 'V3')
V4 = ligne(lambda x: 'new RegExp(' in x and 'apparu' in x, 'V4')
SIGNAL = ligne(lambda x: 'return t;' in x and 'voudrais' in x and '.test(q)' in x, 'signal')
VERBE = ligne(lambda x: '(fai[st]|donne|' in x, 'regle 1')
R2 = ligne(lambda x: '(une|ma|la|nouvelle|prochaine|autre|petite|bonne)\\s+s[ée]ance' in x and 'return true' in x, 'regle 2')
EXEC = '  for(const re of VETO){ let m; while((m=re.exec(p))){'
SLOT = "(?:[a-z]+(?:er|ir|re|e|t)\\\\s+)?"
BOUTON_REJET = "    if(/\\bbouton|\\bb(?:u|eu)g\\b|\\baffich/i.test(p)) return false;\n"

MUT = [
    ("M00 master remis mot pour mot (coach.js de 7a71649e) : les meta-discussions redeviennent des demandes", 'REV:' + AVANT, 'GARDE'),
    ('B1 strategie abandonnee : « bouton / bug / affiche » present = rejet du message entier', [(CO, APPEL, BOUTON_REJET + APPEL)], 'GARDE'),
    ('B2 la 1re strategie FP-01 remise (coach.js de 5158c582 : garde large)', 'REV:5158c582', 'GARDE'),
    ('B3 la 2e strategie FP-01 remise (coach.js de b45b2e2a : garde large + structures qui sauvent)', 'REV:b45b2e2a', 'GARDE'),
    ('P1 veto trop large : jusqu\'a 4 mots quelconques entre « bouton » et « seance »', [(CO, V1, V1.replace(SLOT, "(?:\\\\S+\\\\s+){0,4}"))], 'GARDE'),
    ('P2 veto trop large : le garde « rien que de la meta » est retire (un verbe de demande restant n\'arrete plus le veto)', [(CO, SIGNAL, '')], 'GARDE'),
    ('P3 veto trop large : applique AVANT la regle ① (« le bouton lance une seance », hors lot, est corrige)',
     [(CO, APPEL, ''), (CO, VERBE, APPEL + VERBE.replace('.test(t)) return true;', '.test(u)) return true;'))], 'GARDE'),
    ('P4 meta acceptee : « bouton pour faire une seance » (« pour » ote de V1)', [(CO, V1, V1.replace('(?:pour|de|du|', '(?:de|du|'))], 'GARDE'),
    ('P5 meta acceptee : le refus (V2) retire', [(CO, V2, '')], 'GARDE'),
    ('P6 meta acceptee : le constat d\'affichage (V3) retire', [(CO, V3, '')], 'GARDE'),
    ('P7 meta acceptee : l\'apparition (V4) retiree', [(CO, V4, '')], 'GARDE'),
    ('P8 la fenetre libre de 40 caracteres rouverte (entre « bouton » et « seance »)', [(CO, V1, V1.replace(SLOT, "[^.?!\\\\n]{0,40}"))], 'GARDE'),
    ('P9 demande historique perdue : les verbes de desir ne protegent plus (« …, j\'en voudrais une » perdue)', [(CO, SIGNAL, SIGNAL.replace('|veux|voudrais|aimerais', ''))], 'GARDE'),
    ('P10 [deguisee] la regle ② relit le texte brut `t` (le veto n\'a plus d\'effet sur elle)', [(CO, R2, R2.replace('.test(u))', '.test(t))'))], 'GARDE'),
    ('P11 CORPUS AVEUGLE : toute perte classee « veto justifie » (A), jamais « regression » (B)', [(OUTIL, "(c.lab === 'M' ? r.A : r.B)", 'r.A')], 'GARDE'),
    ('P12 CORPUS AVEUGLE : la branche comparee a elle-meme au lieu de master', [(OUTIL, 'const r = differentiel(fMaster, fFinal);', 'const r = differentiel(fFinal, fFinal);')], 'GARDE'),
    ('P13 CORPUS AVEUGLE : la reference n\'est plus master mais l\'arbre lui-meme', [(OUTIL, 'const fMaster = fnOf(srcOf(REF));', "const fMaster = fnOf(srcOf('WT'));")], 'GARDE'),
    ('DG1 [deguisee] structures cherchees sur le texte AVEC accents (« DÉMARRER UNE SÉANCE » ne mord plus)', [(CO, EXEC, EXEC.replace('re.exec(p)', 're.exec(t)'))], 'GARDE'),
    ('DG2 [deguisee] garde d\'alignement inverse (plus aucun veto sur un texte normal)', [(CO, ALIGN, ALIGN.replace('!==', '==='))], 'GARDE'),
    ('EQ1 [equivalente] V2 avant V1 dans la liste : doit RESTER vert', [(CO, V1 + V2, V2 + V1)], 'OK'),
    ('EQ2 [equivalente] « # » au lieu de « § » pour neutraliser : doit RESTER vert', [(CO, "'§'.repeat(", "'#'.repeat(")], 'OK'),
    ('EQ3 [equivalente] determinants dans un autre ordre (« la|une|ma ») : doit RESTER vert', [(CO, "const D='(?:une|la|ma|", "const D='(?:la|une|ma|")], 'OK'),
    ('[negatif] commentaire citant les motifs cherches', [(CO, APPEL, APPEL + "    // bouton · bug · affiché · je ne demande pas · le bouton pour faire une séance\n")], 'OK'),
]


def banc(arbre):
    # le corpus (temoins K) lit l'historique git : le clone n'a pas de .git, on lui prete celui du depot
    env = dict(os.environ, TZ='Europe/Paris', GIT_DIR=os.path.join(SRC, '.git'))
    r = subprocess.run(['node', 'tools/banc_fp01.js'], cwd=arbre, capture_output=True, text=True, timeout=1800, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    # temoins EXECUTES : toute etiquette « lettre + chiffre » (les temoins de source sont ①..⑩)
    return [x for x in rouges if re.match(r'❌ ROUGE [A-Z]\d', x)]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_fp01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
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
        if isinstance(remplacements, str) and remplacements.startswith('REV:'):
            rev = remplacements[4:]
            av = subprocess.run(['git', 'show', rev + ':' + CO], cwd=SRC, capture_output=True, text=True).stdout
            if not av or av == open(os.path.join(arbre, CO), encoding='utf-8').read():
                print('  INVALIDE  %s (code de %s introuvable ou identique)' % (nom, rev)); shutil.rmtree(tmp, ignore_errors=True); continue
            open(os.path.join(arbre, CO), 'w', encoding='utf-8').write(av)
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
        cond = [x for x in ex if re.match(r'❌ ROUGE [EFHJOK]\d', x)]
        montre = (cond or ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-96s %-6s %2d rouge(s), %2d execute(s) dont %2d ecran/corpus  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), len(cond), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
