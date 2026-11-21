#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D-164 (charge au poids du corps) et D-166 (haltères), mission Séance du 16/11/2026 : les témoins B-SCPDC savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee, ou fait ce que la decision INTERDIT : deviner le PDC d'apres un nom,
convertir en kilos, doubler deux fois) ; le banc `tools/banc_seance_pdc.js` doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege
rien (R17). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche « INVALIDE » (jamais un faux vert).
Usage : python3 tools/mut_seance_pdc.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_ANCRES=1 : verifie seulement les ancres)
A lancer sous le garde reseau : sh tools/sous_garde.sh python3 tools/mut_seance_pdc.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('log.js', 'setup.js', 'coach.js', 'style.css')
LO, SE, CO, CS = 'log.js', 'setup.js', 'coach.js', 'style.css'

MUT = [
    # ── le champ lui-même ──
    ('M01 le champ `pdc` n\'est plus lu (la fonction qui le lit rend toujours « aucun ») : tout le PDC disparait',
     [(LO, "function _pdcDe(s){ return (s&&typeof s.pdc==='number'&&isFinite(s.pdc))?s.pdc:null; }", "function _pdcDe(s){ return null; }")], 'GARDE'),
    ('M02 le montant tapé dans une série au poids du corps est lu comme des KILOS (le test d\'aiguillage de `upSet` disparait)',
     [(LO, "  if(f==='kg'&&(_pdcDe(S.wkt.exs[ei].sets[si])!==null||_pdcAttendu(ei,si))){ _pdcSaisie(ei,si,v); return; }   // D-164 : le montant d'une charge au poids du corps ne passe jamais pour des kilos\n", "")], 'GARDE'),
    ('M03 le montant d\'un lest / d\'une assistance est AUSSI écrit dans `kg` (il pèse dans le tonnage, les records et les calories ; l\'assistance gagnerait un record)',
     [(LO, "  s.kg=0; delete s.rm1; delete s.vide; persist(); _pdcMajChamp(ei,si);   // D-164 : un PDC écrit exclut « à vide » (voir `setPdcMode`)\n}\nfunction upSet", "  s.kg=Math.abs(s.pdc)||0; persist(); _pdcMajChamp(ei,si);\n}\nfunction upSet")], 'GARDE'),
    ('M04 la fin de séance CONVERTIT le PDC en kilos avec le poids de corps du jour (le passé dépendrait du poids de corps)',
     [(LO, "  S.wkt.exs.forEach(ex=>(ex.sets||[]).forEach(s=>{ if(s&&s.reps===null)s.reps=0; }));", "  S.wkt.exs.forEach(ex=>(ex.sets||[]).forEach(s=>{ if(s&&s.reps===null)s.reps=0; }));\n  S.wkt.exs.forEach(ex=>(ex.sets||[]).forEach(s=>{ if(_pdcDe(s)!==null)s.kg=Math.round((S.bw||0)+s.pdc); }));")], 'GARDE'),
    # ── ⛔ aucune attribution automatique ──
    ('M05 ⛔ le PDC est DEVINÉ d\'après le NOM de l\'exercice (une série validée sans charge sur « traction / pull / dip / pompe » devient PDC)',
     [(LO, "/* reste `null` */ } else set.kg=numFR(inps[1].value||inps[1].placeholder)||0; }}", "/* reste `null` */ } else{ set.kg=numFR(inps[1].value||inps[1].placeholder)||0; if(!set.kg&&/traction|pull|dip|pompe/i.test((S.wkt.exs[ei]||{}).name||''))set.pdc=0; } }}")], 'GARDE'),
    ('M06 ⛔ le PDC est posé d\'office sur TOUTE série validée sans charge (quel que soit l\'exercice : la famille ne doit rien décider)',
     [(LO, "/* reste `null` */ } else set.kg=numFR(inps[1].value||inps[1].placeholder)||0; }}", "/* reste `null` */ } else{ set.kg=numFR(inps[1].value||inps[1].placeholder)||0; if(!set.kg)set.pdc=0; } }}")], 'GARDE'),
    ('M07 la suggestion grise « PDC+10 » est lue comme 10 KG (la reprise telle quelle disparait)',
     [(LO, "const _pd=inps[1].value?null:_pdcLire(inps[1].placeholder);", "const _pd=null;")], 'GARDE'),
    # ── la reprise (même règle que `kg`) ──
    ('M08 la reprise du PDC de la dernière fois ne se fait nulle part (les programmes, Milo et « + Série » repartent sans)',
     [(LO, "function _pdcRepris(pp){ const n=_pdcDe(pp); return n===null?{}:{pdc:n}; }", "function _pdcRepris(pp){ return {}; }")], 'GARDE'),
    ('M09 le chargement d\'un programme à jours ne reprend pas le PDC',
     [(LO, "        ..._pdcSerie,                                     // D-164 : la dernière fois disait « PDC » → la série le redit (comme `kg`, donc sous la même règle D-163 / D-168) ; sinon le PDC écrit par le programme\n", "")], 'GARDE'),
    ('M10 le chargement ne reprend pas le PDC de la DERNIÈRE FOIS (seul le PDC écrit par le programme passe ; mission corrective : un seul chargeur pour un jour et pour un programme à plat)',
     [(LO, "(ppKg&&_pdcDe(ppKg)!==null)?_pdcRepris(ppKg):", "false?_pdcRepris(ppKg):")], 'GARDE'),
    ('M11 une série ajoutée (« + Série ») ne reprend pas le PDC (ré-ancrée le 17/11 après la fermeture finale : la construction d\'une série neuve vit maintenant dans `_serieDepuis`, partagée par « + Série », l\'ajout d\'exercice et « Remplacer » ; même intention ; RE-POSÉE le 18/11/2026 : la copie du PDC vit désormais dans `_pdcVideDe`, appelée par `_serieDepuis`)',
     [(LO, "return pp?{..._pdcRepris(pp),", "return pp?{")], 'GARDE'),
    ('M12 la séance de Milo (1ʳᵉ porte) pose le PDC PAR-DESSUS les kilos que Milo a écrits',
     [(LO, "rm1:0,rest:_secRepos(s.rest),...((s.kg>0)?{}:_pdcRepris(pp))};   // D-164 : Milo a donné des kilos → eux seuls ; sinon la dernière fois, PDC compris", "rm1:0,rest:_secRepos(s.rest),..._pdcRepris(pp)};")], 'GARDE'),
    # ── l'affichage ──
    ('M13 « Précédent » écrit « 8×0 » pour une série au poids du corps',
     [(LO, "${pv.reps}×${_pdcDe(pv)!==null?_pdcTxt(pv.pdc):(_kgConnu(pv.kg)?pv.kg:'?')}", "${pv.reps}×${_kgConnu(pv.kg)?pv.kg:'?'}")], 'GARDE'),
    ('M14 « 4 dernières séances » écrit « × 0 » pour une série au poids du corps',
     [(LO, "_escNote(_pdcDe(s)!==null?_pdcTxt(s.pdc):String((s.kg!==undefined&&s.kg!==null&&s.kg!=='')?s.kg:0))", "_escNote(String((s.kg!==undefined&&s.kg!==null&&s.kg!=='')?s.kg:0))")], 'GARDE'),
    ('M15 pendant la frappe du montant, un 1RM s\'affiche (10 kg × 8 lu comme une charge)',
     [(LO, "  if(_s&&(_pdcDe(_s)!==null||_pdcAttendu(ei,si))){ const _t=document.getElementById(`trm-${ei}-${si}`); if(_t)_t.textContent=''; return; }   // D-164 : le montant d'un lest / d'une assistance n'est pas une charge en kilos : aucun 1RM\n", "")], 'GARDE'),
    ('M16 le détail d\'une séance passée garde le PDC quand on y tape des kilos (les deux coexistent)',
     [(SE, "if(field==='kg'&&_pdcDe(_st)!==null){ if(!(n>0))return; delete _st.pdc; }", "if(field==='kg'&&_pdcDe(_st)!==null){ if(!(n>0))return; }")], 'GARDE'),
    ('M17 le détail d\'une séance passée écrit « 0 » dans le champ de kilos d\'une série au poids du corps (aucun indice)',
     [(SE, "value=\"${_pdcDe(s)!==null?'':_champNum(s.kg)}\"${_pdcDe(s)!==null?` placeholder=\"${_pdcTxt(s.pdc)}\" title=\"Charge au poids du corps : taper des kilos la remplace\"`:''}", "value=\"${_champNum(s.kg)}\"")], 'GARDE'),
    # ── les sorties : CSV et Milo ──
    ('M18 le CSV n\'a plus de colonne `charge` : une série au poids du corps y est un « 0 » muet',
     [(SE, "(avec?HISTO_COLONNES_DEBRIEF:HISTO_COLONNES).concat(L.some(r=>r.charge)?['charge']:[])", "(avec?HISTO_COLONNES_DEBRIEF:HISTO_COLONNES)")], 'GARDE'),
    ('M19 le CSV a TOUJOURS la colonne `charge` (le fichier d\'un utilisateur sans PDC change)',
     [(SE, "(avec?HISTO_COLONNES_DEBRIEF:HISTO_COLONNES).concat(L.some(r=>r.charge)?['charge']:[])", "(avec?HISTO_COLONNES_DEBRIEF:HISTO_COLONNES).concat(['charge'])")], 'GARDE'),
    ('M20 Milo lit « ? » (charge inconnue) pour une série au poids du corps : il ne sait plus qu\'elle est PDC',
     [(LO, "function _kgTxtSerie(x){ const n=_pdcDe(x); if(n!==null)return _pdcTxt(n,true).replace(' ',''); if(x.vide&&!(+x.kg>0))return 'à vide'; return _kgConnu(x.kg)?x.kg:'?'; }", "function _kgTxtSerie(x){ return x.kg||'?'; }")], 'GARDE'),
    ('M21 Milo ne lit pas la charge d\'une série au poids du corps (la ligne de la séance recopie `kg` brut)',
     [(CO, "return `${num}${(typeof _kgTxtSerie==='function'?_kgTxtSerie(x):(x.kg||'?'))}×${x.reps||'?'}", "return `${num}${(x.kg||'?')}×${x.reps||'?'}")], 'GARDE'),
    # ── le pavé de charge (style) ──
    ('M22 les trois choix sont affichés EN PERMANENCE (sans le doigt sur le champ de charge)',
     [(CS, ".kgm{display:none;position:absolute;", ".kgm{display:flex;position:absolute;")], 'GARDE'),
    ('M23 les trois choix s\'insèrent DANS la liste (position normale) : la série suivante descend quand le champ prend le doigt',
     [(CS, ".kgm{display:none;position:absolute;", ".kgm{display:none;position:static;")], 'GARDE'),
    ('M24 les trois choix ne s\'ouvrent plus jamais (la règle `:has(…:focus)` disparait)',
     [(CS, ".set-row:has(input[inputmode=\"decimal\"]:focus)+.kgm{display:flex;}\n", "")], 'GARDE'),
    ('M25 les trois choix passent SOUS la ligne (ils tombent sous le clavier de l\'iPhone) — ici : ils débordent hors de l\'écran vers le bas à la dernière série',
     [(CS, "bottom:100%;z-index:6;gap:6px;padding:6px;margin-bottom:-3px;", "top:100%;z-index:6;gap:6px;padding:6px;margin-top:-3px;")], 'GARDE'),
    ('M26 RÈGLE D\'OR n°9 : le bouton central « + » est déplacé (un style ajouté avec le pavé le touche)',
     [(CS, "#s-log [id^=\"sr-wrap-\"]{position:relative;}", "#s-log [id^=\"sr-wrap-\"]{position:relative;}\n.nav .nb-plus{transform:translateY(5px);}")], 'GARDE'),
    ('M35 la séance de Milo (2ᵉ porte, « remplacer ») pose le PDC PAR-DESSUS les kilos que Milo a écrits',
     [(LO, "rm1:0,rest:_secRepos(s.rest),...((s.kg>0)?{}:_pdcRepris(pp))};   // D-164 : voir `_startSessionFromMilo`", "rm1:0,rest:_secRepos(s.rest),..._pdcRepris(pp)};")], 'GARDE'),
    ('M36 la séance de Milo (2ᵉ porte, « remplacer ») ne reprend pas le PDC de la dernière fois',
     [(LO, "rm1:0,rest:_secRepos(s.rest),...((s.kg>0)?{}:_pdcRepris(pp))};   // D-164 : voir `_startSessionFromMilo`", "rm1:0,rest:_secRepos(s.rest)};")], 'GARDE'),
    # ── l'import (D-164 / D-166) ──
    ('M27 un LEST écrit dans la source (« 10 kg lest ») redevient une charge de 10 kg',
     [(LO, "  if(/(?:^|[^a-z0-9])(?:pdc|bw|bodyweight|body weight|poids (?:du )?corps|lest\\w*|assist\\w*)(?![a-z0-9])/.test(_naz(s)))return {n:null,vide:false};\n", "")], 'GARDE'),
    ('M28 « 2 haltères de 15 » redevient « 2 kg » (le premier nombre avant les mots)',
     [(LO, "  if(!_PLAGE_TXT.test(s)&&/\\d[^\\d]*[A-Za-zÀ-ÿ][^\\d]*\\d/.test(s.replace(/kg/ig,'')))return {n:null,vide:false};", "")], 'GARDE'),
    ('M29 la deuxième règle rejette AUSSI une fourchette « 60kg-65kg » (une charge qui se lisait bien ne se lit plus)',
     [(LO, "if(!_PLAGE_TXT.test(s)&&/\\d[^\\d]*[A-Za-zÀ-ÿ][^\\d]*\\d/.test(s.replace(/kg/ig,'')))", "if(!_PLAGE_TXT.test(s)&&/\\d[^\\d]*[A-Za-zÀ-ÿ][^\\d]*\\d/.test(s))")], 'GARDE'),
    ('M30 un exercice SANS charge écrite est déclaré PDC à l\'import (la devinette « tractions = PDC » côté import)',
     [(LO, "    const K=_kgCanon(ex,n);\n    ex.kgPerSet=K.kgs;", "    const K=_kgCanon(ex,n);\n    if(/traction|pull/i.test(ex.name||'')&&!K.kgs.some(k=>k>0))ex.kgPerSet=K.kgs.map(()=>0.0001);\n    else ex.kgPerSet=K.kgs;")], 'GARDE'),
    # ── D-166 : les haltères ──
    ('M31 D-166 : la convention unilatérale dépend d\'un NOM (« unilat » dans le nom double le volume d\'un exercice perso ou fictif)',
     [(LO, "  return (sess&&sess.uniConv&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;", "  return (sess&&sess.uniConv&&(/unilat/i.test(String(nom))||(typeof estUnilateral==='function'&&estUnilateral(nom))))?2:1;")], 'GARDE'),
    ('M32 D-166 : DOUBLE multiplication (la charge d\'un exercice à un bras compte ×2 puis ×2 encore)',
     [(LO, "&&c>0&&(s.reps||0)>0)v+=c*s.reps*k;", "&&c>0&&(s.reps||0)>0)v+=c*s.reps*k*k;")], 'GARDE'),
    ('M33 D-166 : la convention double aussi les exercices à DEUX bras (la table d\'identifiants est ignorée : tout haltère × 2)',
     [(LO, "  return (sess&&sess.uniConv&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;", "  return (sess&&sess.uniConv)?2:1;")], 'GARDE'),
    ('M34 D-166 : une séance d\'AVANT la convention (sans `uniConv`) est doublée rétroactivement',
     [(LO, "  return (sess&&sess.uniConv&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;", "  return (sess&&typeof estUnilateral==='function'&&estUnilateral(nom))?2:1;")], 'GARDE'),
]

BANC = os.path.join('tools', 'banc_seance_pdc.js')


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_scpdc_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutôt que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def ancres():
    """Verifie, sans lancer le banc, que chaque ancre existe EXACTEMENT une fois (une ancre perimee n'est jamais un faux vert)."""
    srcs = {f: open(os.path.join(SRC, f), encoding='utf-8').read() for f in FICHIERS}
    mauvais = 0
    for nom, remplacements, _ in MUT:
        for f, av, ap in remplacements:
            n = srcs[f].count(av)
            if n != 1:
                mauvais += 1
                print('  INVALIDE  %s (%s : %d occurrence(s)) %s' % (nom[:60], f, n, av[:70].replace('\n', '\\n')))
    print('%d ancre(s) invalide(s) sur %d mutations' % (mauvais, len(MUT)))
    return 0 if not mauvais else 1


def main():
    if os.environ.get('MUT_ANCRES'):
        return ancres()
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    tmp0, a0 = cloner()
    rouges, bilan = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        if seul and not nom.startswith(seul):
            continue
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, bilan = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
