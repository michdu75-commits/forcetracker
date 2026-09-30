#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION LOT 1 / B3 (30/09/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit : moteur conduit (B-CDXVI),
     ecran conduit (B-CDXVII), contexte de Milo construit (B-CDXVIII) ou moteur NUT (B-CCCLXI). Un rouge
     des seuls temoins de SOURCE (B-CDXV, B-CCCLX) ne suffit pas : la mutation est alors NON conforme.
Les mutations cassent le PRINCIPE, pas un mot :
  M00 = le code d'avant (master 105d4e20) remis mot pour mot, sur les 4 fichiers
  S2 / S3 / S5 = les strategies ECARTEES (monter la cible · dire sans corriger · reduire en proportion)
  M01..M15 = chaque morceau retire un par un · DG1..DG3 = deguisees · EQ1, EQ2 = equivalentes (vertes)
  [negatif] = commentaire
Usage : python3 tools/mut_nutri_b3.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '105d4e20'
ST, SC, CO, IH = 'state.js', 'screens.js', 'coach.js', 'index.html'
FICHIERS = (ST, SC, CO, IH)

DLC_FAT = "  const fat_g=Math.max(lMin,Math.min(fat_de,Math.floor((kcal-prot_de*4)/9)));\n"
DLC_PROT = "  const prot_g=(prot_de*4+fat_g*9>kcal)?Math.max(pMin,Math.min(prot_de,Math.floor((kcal-fat_g*9)/4))):prot_de;\n"
DLC_MIN = "  const lMin=Math.round(bw*_CYCLE_FAT_MIN), pMin=Math.round(bw*_PROT_MIN_GKG);\n"
DLC_RET = "  return{prot_g,fat_g,carbs_g,ajuste:{prot_de,fat_de,depasse:Math.max(0,prot_g*4+fat_g*9-kcal)}};\n"
APPEL = "  if(prot_g*4+fat_g*9>kcal) return _macrosDansLaCible(kcal,prot_g,fat_g);   // B3, ci-dessous\n"
CYC_AJ = "    if(m.ajuste) return m;\n"
CYC_BORNE = "    if(rMoy>0 && ajout(D)>ajoutMax) D=ajoutMax/(rMoy*f/7);\n"
EXPOSE = "ajuste:(base&&base.ajuste)||null,"
CALORIES = "  const calories=manual||auto;\n"
KETO = "    if(depasse>0) return{prot_g,fat_g,carbs_g,ajuste:{prot_de:prot_g,fat_de:fat_g,depasse}};\n"
NOTE = "  if(nt) nt.innerHTML=(v>=800&&v<=6000)?_ajusteMacrosHTML(mm,v):'';\n"
ECRAN = "if(_aj)_aj.innerHTML=_ajusteMacrosHTML(macros,macros.calories);}"
GMAC = "function _gMac(v){ return v==null?'—':v; }"
MILO = "  const a=m&&m.ajuste; if(!a) return '';\n"

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s, 4 fichiers)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('S2 strategie ecartee « monter la cible » : la cible devient 4P + 9L quand P et L la depassent',
     [(ST, CALORIES, "  const calories=manual||(auto!=null&&_nbUtil(S.bw)!=null?Math.max(auto,macrosForKcal(1e6).prot_g*4+macrosForKcal(1e6).fat_g*9):auto);\n")], 'GARDE'),
    ('S3 strategie ecartee « dire sans corriger » : P et L gardes, l\'ecart seulement declare',
     [(ST, DLC_FAT, "  const fat_g=fat_de;\n"), (ST, DLC_PROT, "  const prot_g=prot_de;\n")], 'GARDE'),
    ('S5 strategie ecartee « reduire P et L dans la meme proportion »',
     [(ST, DLC_FAT, "  const _k=kcal/(prot_de*4+fat_de*9);\n  const fat_g=Math.floor(fat_de*_k);\n"),
      (ST, DLC_PROT, "  const prot_g=Math.floor(prot_de*_k);\n")], 'GARDE'),
    ('M01 la branche B3 retiree : P et L « poids x objectif » meme quand ils depassent la cible', [(ST, APPEL, '')], 'GARDE'),
    ('M02 le plancher des lipides retire (0 g/kg)', [(ST, DLC_MIN, DLC_MIN.replace('Math.round(bw*_CYCLE_FAT_MIN)', '0'))], 'GARDE'),
    ('M03 les proteines cedent AVANT les lipides',
     [(ST, DLC_FAT + DLC_PROT,
       "  const prot_g=Math.max(pMin,Math.min(prot_de,Math.floor((kcal-fat_de*9)/4)));\n"
       "  const fat_g=(prot_g*4+fat_de*9>kcal)?Math.max(lMin,Math.min(fat_de,Math.floor((kcal-prot_g*4)/9))):fat_de;\n")], 'GARDE'),
    ('M04 le plancher des proteines (0,8 g/kg, Gardien) retire', [(ST, DLC_MIN, DLC_MIN.replace('Math.round(bw*_PROT_MIN_GKG)', '0'))], 'GARDE'),
    ('M05 l\'ecart restant n\'est jamais declare (depasse toujours 0)', [(ST, DLC_RET, DLC_RET.replace('depasse:Math.max(0,prot_g*4+fat_g*9-kcal)', 'depasse:0'))], 'GARDE'),
    ('M06 le cycle n\'est plus borne : un jour de repos repasse sous 0 g de glucides', [(ST, CYC_BORNE, '')], 'GARDE'),
    ('M07 le cycle cycle une repartition deja comprimee', [(ST, CYC_AJ, '')], 'GARDE'),
    ('M08 calcMacros n\'expose plus `ajuste`', [(ST, EXPOSE, 'ajuste:null,')], 'GARDE'),
    ('M09 Milo : un vrai 0 g redevient « — »', [(CO, GMAC, "function _gMac(v){ return v||'—'; }")], 'GARDE'),
    ('M10 Milo ne recoit plus la note d\'ajustement / d\'ecart', [(CO, MILO, "  const a=null; if(!a) return '';\n")], 'GARDE'),
    ('M11 l\'ecran ne dit plus rien sous les macros', [(SC, ECRAN, "if(_aj)_aj.innerHTML='';}")], 'GARDE'),
    ('M12 l\'apercu du reglage manuel ne dit plus rien', [(SC, NOTE, "  if(nt) nt.innerHTML='';\n")], 'GARDE'),
    ('M13 keto : l\'ecart n\'est plus declare', [(ST, KETO, '')], 'GARDE'),
    ('M14 arrondi des lipides vers le HAUT (le total repasse au-dessus de la cible)',
     [(ST, DLC_FAT, DLC_FAT.replace('Math.floor((kcal-prot_de*4)/9)', 'Math.ceil((kcal-prot_de*4)/9)'))], 'GARDE'),
    ('M15 les glucides deviennent negatifs quand meme les minimums depassent la cible',
     [(ST, "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n  return{prot_g,fat_g,carbs_g,ajuste:",
       "  const carbs_g=Math.round((kcal-prot_g*4-fat_g*9)/4);\n  return{prot_g,fat_g,carbs_g,ajuste:")], 'GARDE'),
    ('DG1 [deguisee] plancher des lipides a 0,5 g/kg ecrit en dur', [(ST, DLC_MIN, DLC_MIN.replace('_CYCLE_FAT_MIN', '0.5'))], 'GARDE'),
    ('DG2 [deguisee] proteines arrondies au plus proche au lieu de vers le bas',
     [(ST, DLC_PROT, DLC_PROT.replace('Math.floor((kcal-fat_g*9)/4)', 'Math.round((kcal-fat_g*9)/4)'))], 'GARDE'),
    ('DG3 [deguisee] la borne du cycle calculee avec la seance du jour (rJour) au lieu de la moyenne (rMoy)',
     [(ST, CYC_BORNE, CYC_BORNE.replace('rMoy>0 && ajout(D)>ajoutMax) D=ajoutMax/(rMoy*f/7)', 'rJour>0 && D*rJour*f/7>ajoutMax) D=ajoutMax/(rJour*f/7)'))], 'GARDE'),
    ('EQ1 [equivalente] lMin et pMin declares dans l\'autre ordre : doit RESTER vert',
     [(ST, DLC_MIN, "  const pMin=Math.round(bw*_PROT_MIN_GKG), lMin=Math.round(bw*_CYCLE_FAT_MIN);\n")], 'OK'),
    ('EQ2 [equivalente] les Math.min redondants retires : doit RESTER vert',
     [(ST, DLC_FAT, "  const fat_g=Math.max(lMin,Math.floor((kcal-prot_de*4)/9));\n"),
      (ST, DLC_PROT, "  const prot_g=(prot_de*4+fat_g*9>kcal)?Math.max(pMin,Math.floor((kcal-fat_g*9)/4)):prot_de;\n")], 'OK'),
    ('[negatif] commentaire citant les planchers et la cible', [(ST, DLC_MIN, DLC_MIN + "  // 0,6 g/kg · 0,8 g/kg · la cible ne bouge pas · depasse\n")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nutri_b3.js'], cwd=arbre, capture_output=True, text=True, timeout=1800, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-(CDXVI|CDXVII|CDXVIII|CCCLXI) ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nutri_b3_')
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
        print('  %s  DANS LA COPIE MUTEE — %-92s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
