#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION LOT 1 / B3 (30/09/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit : moteur conduit (B-CDXVI),
     ecran conduit (B-CDXVII, B-CDXIX), contexte de Milo construit (B-CDXVIII) ou moteur NUT (B-CCCLXI). Un rouge
     des seuls temoins de SOURCE (B-CDXV, B-CCCLX) ne suffit pas : la mutation est alors NON conforme.
Les mutations cassent le PRINCIPE, pas un mot :
  M00 = le code d'avant (master 105d4e20) remis mot pour mot, sur les 4 fichiers
  S1 = la strategie D-033 REFUSEE par Michel (reduire lipides puis proteines) · S2 = monter la cible
  M01..M15 et U1..U6 = chaque morceau retire un par un · C1..C2 = contrat du cycle sous le plancher (NUT-LIPIDES-25-01)
  · DG1..DG3 = deguisees · EQ1 = equivalente (temoins executes verts)
  [negatif] = commentaire
Usage : python3 tools/mut_nutri_b3.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '105d4e20'
ST, SC, CO, IH = 'state.js', 'screens.js', 'coach.js', 'index.html'
FICHIERS = (ST, SC, CO, IH)

CRIT = "  return (ecrete&&ecart>_ARRONDI_MACROS_KCAL)?{ecart,macros:Math.round(somme),ecrete}:null;\n"
SEUIL = "const _ARRONDI_MACROS_KCAL=6;\n"
AUTRE = "  const au=calculable&&m.cycle&&m.cycle.autre?_cibleIncompatible(m.prot_g,m.cycle.autre.fat_g,m.cycle.autre.carbs_g,calories):null;\n"
JOUR = "  const inc=calculable?_cibleIncompatible(m.prot_g,m.fat_g,m.carbs_g,calories):null;\n"
RESIDU = "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n  return{prot_g,fat_g,carbs_g};\n}"
CALORIES = "  const calories=manual||auto;\n"
ECRAN = "if(_inc)_inc.innerHTML=_incompatibleHTML(macros);}"
NOTE = "    nt.innerHTML=sim?_incompatibleHTML(sim):'';"
SIMUL = "      try{ S.manualKcal=v; sim=calcMacros(S.nutritionPhase); }catch(e){ sim=null; }\n      finally{ S.manualKcal=gard; }\n"
PHRASE = "        +(macros.incompatible\n          ?"
TOASTF = "  return 'Cible incompatible : +'+n(d.ecart)+' kcal'+(d.jour==='repos'?' au repos':(d.jour==='seance'?' en séance':''))+'.';"
TOAST2 = "  if(L.length>1){ const e=L.map(d=>d.ecart).sort((a,b)=>a-b); return 'Cible incompatible : +'+n(e[0])+' à +'+n(e[e.length-1])+' kcal.'; }"
TOAST = "  if(_jours.length) toast(_toastIncompatible(_jours),'info');"
GMAC = "function _gMac(v){ return v==null?'—':v; }"
MILO = "  const i=m&&m.incompatible; if(!i) return '';\n  const J="
AUTRE_ECRAN = "  if(i.autre) l.push("

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s, 4 fichiers)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('S1 strategie REFUSEE par Michel (D-033) : lipides puis proteines reduits jusqu\'a 0,6 / 0,8 g/kg',
     [(ST, RESIDU, "  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));\n"
       "  if(prot_g*4+fat_g*9>kcal){ const bw=S.bw||0, lMin=Math.round(bw*0.6), pMin=Math.round(bw*0.8);\n"
       "    const L=Math.max(lMin,Math.floor((kcal-prot_g*4)/9)); const P=(prot_g*4+L*9>kcal)?Math.max(pMin,Math.floor((kcal-L*9)/4)):prot_g;\n"
       "    return{prot_g:P,fat_g:L,carbs_g:Math.max(0,Math.round((kcal-P*4-L*9)/4))}; }\n  return{prot_g,fat_g,carbs_g};\n}")], 'GARDE'),
    ('S2 strategie ecartee « monter la cible » a 4P + 9L',
     [(ST, CALORIES, "  const calories=manual||(auto!=null&&_nbUtil(S.bw)!=null?Math.max(auto,macrosForKcal(1e6).prot_g*4+macrosForKcal(1e6).fat_g*9):auto);\n")], 'GARDE'),
    ('M01 l\'ecart n\'est plus jamais declare', [(ST, CRIT, "  return null;\n")], 'GARDE'),
    ('M02 l\'ecart de l\'autre bout du cycle (jour de repos) n\'est plus calcule', [(ST, AUTRE, "  const au=null;\n")], 'GARDE'),
    ('M03 l\'ecart du jour n\'est plus calcule', [(ST, JOUR, "  const inc=null;\n")], 'GARDE'),
    # M04 : n'est PLUS equivalente (30/09, contre-verification) — en low carb, l'arrondi seul atteint +7 kcal
    # (1 050 kcal → 66/79/53) sans ecretage ; sans la condition d'ecretage, ce profil serait signale a tort.
    ('M04 declare sans condition d\'ecretage (le +7 de pur arrondi du low carb devient une incompatibilite)', [(ST, CRIT, CRIT.replace('(ecrete&&', '(true&&'))], 'GARDE'),
    ('M05 seuil d\'arrondi a 0 (le bruit d\'arrondi devient une « incompatibilite »)', [(ST, SEUIL, "const _ARRONDI_MACROS_KCAL=0;\n")], 'GARDE'),
    ('M06 seuil a 50 kcal (des ecarts reels passent sous silence)', [(ST, SEUIL, "const _ARRONDI_MACROS_KCAL=50;\n")], 'GARDE'),
    ('M07 keto oublie : seuls les glucides ecretes comptent', [(ST, "(fat_g===0?'lipides':null)", "(null)")], 'GARDE'),
    ('M14 la coche verte ne regarde que le jour courant (l\'autre bout du cycle ignore)',
     [(SC, "const _jours=_joursIncompatibles(calcMacros(S.nutritionPhase));", "const _jours=_joursIncompatibles(calcMacros(S.nutritionPhase)).filter(d=>d.aujourdhui);")], 'GARDE'),
    ('M15 le texte keto redit « glucides » quand ce sont les lipides qui sont ecretes',
     [(SC, "+' kcal de plus</b> que la cible — les '+(d.ecrete||'glucides')+' tombent à 0. '", "+' kcal de plus</b> que la cible — les glucides tombent à 0. '"),
      (CO, "'+(i.ecrete||'glucides')+' écrêtés à 0':'aujourd", "glucides écrêtés à 0':'aujourd")], 'GARDE'),
    ('U1 la note du reglage manuel relit les macros SANS le cycle (le defaut du contre-check)',
     [(SC, SIMUL, "      try{ const b=macrosForKcal(v), i=_cibleIncompatible(b.prot_g,b.fat_g,b.carbs_g,v); sim={calories:v,cycle:null,incompatible:i?{ecart:i.ecart,macros:i.macros,ecrete:i.ecrete,autre:null}:null}; }catch(e){ sim=null; }\n      finally{ S.manualKcal=gard; }\n")], 'GARDE'),
    ('U2 la simulation de l\'apercu n\'est plus remise (la cible tapee reste en memoire sans « Enregistrer »)',
     [(SC, SIMUL, "      try{ S.manualKcal=v; sim=calcMacros(S.nutritionPhase); }catch(e){ sim=null; }\n")], 'GARDE'),
    ('U3 la phrase « total de la semaine identique » affirmee meme quand le cycle ne l\'est pas', [(SC, PHRASE, "        +(false\n          ?")], 'GARDE'),
    ('U4 la phrase « le cycle ne peut pas conserver… » affichee meme quand le cycle est neutre', [(SC, PHRASE, "        +(true\n          ?")], 'GARDE'),
    ('U5 le toast redevient le long message (deborde a 390 px)',
     [(SC, TOASTF, "  return 'Objectif réglé — incompatible avec tes macros (+'+n(d.ecart)+' kcal'+(d.jour==='repos'?' un jour de repos':(d.jour==='seance'?' un jour de séance':''))+'), détail dans Nutrition';")], 'GARDE'),
    ('U6 le toast des deux jours ne garde que le plus grand ecart', [(SC, TOAST2, "  if(L.length>1){ const e=L.map(d=>d.ecart).sort((a,b)=>a-b); return 'Cible incompatible : +'+n(e[e.length-1])+' kcal.'; }")], 'GARDE'),
    ('DG3 [deguisee] le toast inverse repos et seance', [(SC, TOASTF, TOASTF.replace("' au repos':(d.jour==='seance'?' en séance'", "' en séance':(d.jour==='seance'?' au repos'"))], 'GARDE'),
    ('M08 l\'ecran ne dit plus rien sous les macros', [(SC, ECRAN, "if(_inc)_inc.innerHTML='';}")], 'GARDE'),
    ('M09 l\'apercu du reglage manuel ne dit plus rien', [(SC, NOTE, "nt.innerHTML='';")], 'GARDE'),
    ('M10 enregistrer une cible incompatible redit « ✅ »', [(SC, TOAST, "  if(false) toast(")], 'GARDE'),
    ('M11 l\'ecran tait l\'ecart de l\'autre jour du cycle', [(SC, AUTRE_ECRAN, "  if(false) l.push(")], 'GARDE'),
    ('M12 Milo : un vrai 0 g redevient « — »', [(CO, GMAC, "function _gMac(v){ return v||'—'; }")], 'GARDE'),
    ('M13 Milo ne recoit plus l\'incompatibilite', [(CO, MILO, "  const i=null; if(!i) return '';\n  const J=")], 'GARDE'),
    ('DG1 [deguisee] l\'ecart calcule sur la cible AUTOMATIQUE au lieu de la cible retenue (manuelle)',
     [(ST, JOUR, JOUR.replace('m.carbs_g,calories)', 'm.carbs_g,auto!=null?auto:calories)'))], 'GARDE'),
    ('DG2 [deguisee] l\'ecart arrondi a la dizaine', [(ST, "ecart=Math.round(somme-kcal);", "ecart=Math.round((somme-kcal)/10)*10;")], 'GARDE'),
    # 🥑 NUT-LIPIDES-25-01 (02/10/2026) : le CONTRAT DU CYCLE sous le plancher (temoins RÉELS de B-CDXVI/XVII/XIX)
    ('C1 le plancher du cycle (0,6 g/kg) ignore : le cycle joue meme sous le plancher',
     [(ST, "    const retraitMax=Math.max(0, m.fat_g-plancher);\n", "    const retraitMax=m.fat_g;\n")], 'GARDE'),
    ('C2 cycle refuse mais macros retouchees en silence (1 g de glucides retire)',
     [(ST, "    if(!(D>0)) return m;\n", "    if(!(D>0)) return {prot_g:m.prot_g,fat_g:m.fat_g,carbs_g:Math.max(0,m.carbs_g-1)};\n")], 'GARDE'),
    ('EQ1 [equivalente] le seuil ecrit >= 7 au lieu de > 6 : temoins executes VERTS, seule la source le voit', [(ST, CRIT, CRIT.replace('ecart>_ARRONDI_MACROS_KCAL', 'ecart>=_ARRONDI_MACROS_KCAL+1'))], 'SOURCE'),
    ('[negatif] commentaire citant ecretage, seuil et incompatibilite', [(ST, SEUIL, SEUIL + "// ecretage · 6 kcal · incompatible · 0,6 g/kg · 0,8 g/kg\n")], 'OK'),
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
    return [x for x in rouges if re.match(r'❌ ROUGE B-(CDXVI|CDXVII|CDXVIII|CDXIX|CCCLXI) ', x) or x.startswith('PLANTAGE')]


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
