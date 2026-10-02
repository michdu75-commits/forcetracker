#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-LIPIDES-25-01 (02/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXVI moteur conduit,
     B-CDXXVII ecran / apercu / rechargement / Milo). Un rouge des seuls temoins de SOURCE (B-CDXXV) ne suffit pas.
  M00 = le code d'avant (master 5b0387d4) remis mot pour mot · M1..M6 = les defauts demandes par Michel
  · TX1 = texte de l'ancienne regle · DG1..DG4 = deguisees · EQ1 = equivalente (temoins executes verts) · [negatif] = commentaire
Usage : python3 tools/mut_nutri_lipides25.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '5b0387d4'
ST = 'state.js'
SC = 'screens.js'
FICHIERS = (ST, SC)

FAT = "  const fat_g=Math.round(kcal*_LIPIDES_PART_STANDARD/9);\n"
PROT = "  const protRatio=({muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)+lutealProt;\n"
CARB = "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n  return{prot_g,fat_g,carbs_g};\n}"
LC = "    const fat_g  =Math.max(0,Math.round(kcal*0.45/9));\n"
KE = "    const fat_g  =Math.max(0,Math.round(reste/9));\n"
INC = "return (ecrete&&ecart>_ARRONDI_MACROS_KCAL)?{ecart,macros:Math.round(somme),ecrete}:null;"
PART = "const _LIPIDES_PART_STANDARD=0.25;"

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 retour de l\'ancien calcul en g/kg de poids total',
     [(ST, FAT, "  const fatRatio={muscle:0.9,perte:0.8,recomp:0.85,force:1.0,equilibre:0.85,endurance:0.75}[goal]||0.9;\n  const fat_g=Math.round((S.bw||0)*fatRatio);\n")], 'GARDE'),
    ('M2 proteines modifiees (prise de muscle 2,2 -> 2,0 g/kg)', [(ST, PROT, PROT.replace('muscle:2.2', 'muscle:2.0'))], 'GARDE'),
    ('M3 les 25 % appliques au low carb', [(ST, LC, "    const fat_g  =Math.max(0,Math.round(kcal*_LIPIDES_PART_STANDARD/9));\n")], 'GARDE'),
    ('M4 les 25 % appliques au keto', [(ST, KE, "    const fat_g  =Math.max(0,Math.round(kcal*_LIPIDES_PART_STANDARD/9));\n")], 'GARDE'),
    ('M5 glucides non bornes (negatifs possibles)', [(ST, CARB, CARB.replace('Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4))', 'Math.round((kcal-prot_g*4-fat_g*9)/4)'))], 'GARDE'),
    ('M6 D-034 masque (l\'ecart n\'est plus jamais declare)', [(ST, INC, "return null;")], 'GARDE'),
    ('DG1 [deguisee] 30 %% au lieu de 25 %%', [(ST, PART, "const _LIPIDES_PART_STANDARD=0.30;")], 'GARDE'),
    ('DG2 [deguisee] arrondi par defaut (Math.floor)', [(ST, FAT, FAT.replace('Math.round', 'Math.floor'))], 'GARDE'),
    ('DG3 [deguisee] 25 %% de la DEPENSE (TDEE) au lieu de la cible', [(ST, FAT, "  const fat_g=Math.round(calcTDEE()*_LIPIDES_PART_STANDARD/9);\n")], 'GARDE'),
    ('DG4 [deguisee] lipides au plus grand des deux (25 %% ou ancien g/kg)',
     [(ST, FAT, "  const fat_g=Math.max(Math.round(kcal*_LIPIDES_PART_STANDARD/9),Math.round((S.bw||0)*({muscle:0.9,perte:0.8,recomp:0.85,force:1.0,equilibre:0.85,endurance:0.75}[goal]||0.9)));\n")], 'GARDE'),
    ('TX1 l\'avertissement D-034 redit « lipides calcules sur ton poids » (texte de l\'ancienne regle)',
     [(SC, "Tes protéines (calculées sur ton poids et ton objectif) et tes lipides (25 % de ta cible) font déjà", "Tes protéines et lipides (calculés sur ton poids et ton objectif) font déjà")], 'GARDE'),
    ('EQ1 [equivalente] cible / 36 au lieu de cible x 0,25 / 9', [(ST, FAT, "  const fat_g=Math.round(kcal/36);\n")], 'SOURCE'),
    ('[negatif] commentaire citant fatRatio et 0,9 g/kg', [(ST, FAT, FAT + "  // ancien : fatRatio 0,9 g/kg\n")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nutri_lipides25.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXV(I|II) ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nutri_lipides25_')
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
        nom = nom.replace('%%', '%')
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
        print('  %s  DANS LA COPIE MUTEE — %-70s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
