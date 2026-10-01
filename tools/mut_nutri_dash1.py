#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION LOT 2 / NUT-DASH1 (01/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXI : tableau de bord et
     onglet Nutrition rendus). Un rouge des seuls temoins de SOURCE (B-CDXX) ne suffit pas.
  M00 = le code d'avant (master 21eddae3) remis mot pour mot · M01..M06 = les defauts demandes par Michel
  (repli TDEE, ancienne cle kcal, mauvaise cle proteines…) · DG1..DG3 = deguisees · EQ1 = equivalente
  (temoins executes verts, seule la source la voit) · [negatif] = commentaire
Usage : python3 tools/mut_nutri_dash1.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '21eddae3'
DJ = 'dashboard.js'
FICHIERS = (DJ,)

LIGNE = "       if(m){kcal=m.calories!=null?m.calories:null; prot=m.prot_g!=null?m.prot_g:null;} }catch(e){}\n"
REPLI = "  if(kcal==null){ try{ kcal=(typeof calcTDEE==='function')?calcTDEE():null; }catch(e){} }\n"
APPEL = "calcMacros(S_.nutritionPhase||'charge'):null;\n       if(m){"

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M01 retour du repli sur le TDEE quand la cible manque', [(DJ, LIGNE, LIGNE + REPLI)], 'GARDE'),
    ('M02 ancienne cle `m.kcal` pour la cible', [(DJ, LIGNE, LIGNE.replace('kcal=m.calories!=null?m.calories:null', 'kcal=m.kcal||m.cal||null'))], 'GARDE'),
    ('M03 ancienne cle `m.prot` pour les proteines', [(DJ, LIGNE, LIGNE.replace('prot=m.prot_g!=null?m.prot_g:null', 'prot=m.prot||m.p||null'))], 'GARDE'),
    ('M04 la cible AUTOMATIQUE au lieu de la cible retenue (manuelle ignoree)', [(DJ, LIGNE, LIGNE.replace('kcal=m.calories!=null?m.calories:null', 'kcal=m.autoCalories!=null?m.autoCalories:null'))], 'GARDE'),
    ('M05 la tuile affiche la depense (TDEE) en toutes circonstances', [(DJ, LIGNE, LIGNE.replace('kcal=m.calories!=null?m.calories:null', 'kcal=calcTDEE()'))], 'GARDE'),
    ('M06 ancienne cle + repli TDEE, sans la cle des proteines (le defaut exact de master, reecrit)',
     [(DJ, LIGNE, "       if(m){kcal=m.kcal||null; prot=m.prot||null;} }catch(e){}\n" + REPLI)], 'GARDE'),
    ('DG1 [deguisee] phase forcee a « charge » (la decharge de l\'onglet ignoree)', [(DJ, APPEL, APPEL.replace("S_.nutritionPhase||'charge'", "'charge'"))], 'GARDE'),
    ('DG2 [deguisee] les lipides affiches sous le nom de proteines', [(DJ, LIGNE, LIGNE.replace('prot=m.prot_g!=null?m.prot_g:null', 'prot=m.fat_g!=null?m.fat_g:null'))], 'GARDE'),
    ('DG3 [deguisee] repli TDEE seulement si `calcMacros` echoue', [(DJ, "}catch(e){}\n  T.push(_dTuile({titre:'Nutrition'", "}catch(e){ try{ kcal=calcTDEE(); }catch(_){} }\n  T.push(_dTuile({titre:'Nutrition'")], 'GARDE'),
    ('EQ1 [equivalente] l\'ancienne cle lue d\'abord, la bonne en second (`m.kcal||m.calories`)',
     [(DJ, LIGNE, LIGNE.replace('kcal=m.calories!=null?m.calories:null', 'kcal=m.kcal||(m.calories!=null?m.calories:null)'))], 'SOURCE'),
    ('[negatif] commentaire citant m.kcal, m.prot et calcTDEE', [(DJ, LIGNE, LIGNE + "  // m.kcal · m.prot · calcTDEE\n")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nutri_dash1.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXI ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nutri_dash1_')
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
            rev = remplacements[4:]; diff = 0
            for f in FICHIERS:
                av = subprocess.run(['git', 'show', rev + ':' + f], cwd=SRC, capture_output=True, text=True).stdout
                if not av:
                    print('  INVALIDE  %s (%s introuvable dans %s)' % (nom, f, rev)); break
                if av != open(os.path.join(arbre, f), encoding='utf-8').read(): diff += 1
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av)
            else:
                if not diff:
                    print('  INVALIDE  %s (code de %s identique)' % (nom, rev)); shutil.rmtree(tmp, ignore_errors=True); continue
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
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-86s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
