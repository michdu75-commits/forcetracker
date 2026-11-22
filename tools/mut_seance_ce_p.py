#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — mission corrective Séance du 16/11/2026, LOT 2 : D-164 (cinq états de charge sur toute la chaîne, lest au tonnage, record de lest) et D-167 (échauffement d'un mouvement
inconnu : jamais « cardio » sans confirmation) — les témoins B-SCCP savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee, ou fait ce que la decision INTERDIT : convertir un inconnu en zero, melanger PDC et « a vide »,
compter une assistance, ajouter le poids de corps, ranger au cardio sans oui) ; le banc `tools/banc_seance_ce_p.js` doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un
temoin qui ne protege rien (R17). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche « INVALIDE » (jamais un faux vert).
Usage : python3 tools/mut_seance_ce_p.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_ANCRES=1 : verifie seulement les ancres)
A lancer sous le garde reseau : sh tools/sous_garde.sh python3 tools/mut_seance_ce_p.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('log.js', 'setup.js', 'coach.js', 'style.css', 'tracking.js', 'state.js')
LO, SE, CO, CS = 'log.js', 'setup.js', 'coach.js', 'style.css'
ST = 'state.js'     # 22/11/2026 (ARCH-04) : le repli quota des séances écrit le drapeau « historique tronqué » AVANT de réduire
TR = 'tracking.js'   # 21/11/2026 : l'export Sheets (`_buildSyncRows`) préserve « inconnu ≠ zéro »

MUT = [
    # ── la LECTURE des cinq états (P01 / P02 / P09) ──
    ('M01 un zéro écrit se lit « ? » (l\'ancien `x.kg||\'?\'`) : il passe pour « je ne sais pas » (P01)',
     [(LO, "return _kgConnu(x.kg)?x.kg:'?'; }", "return x.kg||'?'; }")], 'GARDE'),
    ('M02 une charge INCONNUE se lit « 0 » (l\'inconnu passe pour une mesure)',
     [(LO, "return _kgConnu(x.kg)?x.kg:'?'; }", "return (x.kg===undefined||x.kg===null||x.kg==='')?0:x.kg; }")], 'GARDE'),
    ('M03 « à vide » ne se lit plus « à vide » (Milo le lit « 0 »)',
     [(LO, "if(x.vide&&!(+x.kg>0))return 'à vide'; ", "")], 'GARDE'),
    # ── le 1ᵉʳ chargement (P03 / P04) ──
    ('M04 le chargement d\'un programme rend une charge inconnue « zéro » (`s.kg||0` : P03)',
     # ↪️ ANCRE RE-POSÉE le 18/11/2026 (lot Z a réécrit cette ligne : une charge absente du programme est INCONNUE, `_kgConnu(s.kg)?s.kg:null`) ; même intention : remettre le « zéro » inventé.
     [(LO, ":(ppKg?(_kgConnu(ppKg.kg)?ppKg.kg:null):(_kgConnu(s.kg)?s.kg:null))", ":(ppKg?(_kgConnu(ppKg.kg)?ppKg.kg:null):(s.kg||0))")], 'GARDE'),
    ('M05 le PDC / lest / assistance PRESCRIT du programme est perdu au 1ᵉʳ chargement (P04)',
     [(LO, "((ppKg&&ppKg.kg>0)?{}:_pdcRepris(s))", "{}")], 'GARDE'),
    ('M06 la dernière séance à charge INCONNUE est reprise comme « zéro »',
     [(LO, "(ppKg?(_kgConnu(ppKg.kg)?ppKg.kg:null):", "(ppKg?(ppKg.kg||0):")], 'GARDE'),
    ('M07 « PDC » et « à vide » coexistent sur une série chargée (le `vide` du programme survit au PDC)',
     [(LO, "...((s.vide&&!_avecPdc&&!(ppKg&&ppKg.kg>0))?{vide:true}:{}),", "...((s.vide&&!(ppKg&&ppKg.kg>0))?{vide:true}:{}),")], 'GARDE'),
    ('M08 le PDC prescrit gagne même contre des KILOS faits la dernière fois (l\'historique plus récent ne prime plus)',
     [(LO, "((ppKg&&ppKg.kg>0)?{}:_pdcRepris(s))", "_pdcRepris(s)")], 'GARDE'),
    # ── « enregistrer en programme » (P05) ──
    ('M09 « enregistrer en programme » perd le PDC +12 (P05)',
     [(LO, "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),..._pdcRepris(s),", "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),")], 'GARDE'),
    ('M10 « enregistrer en programme » rend une charge inconnue « zéro »',
     [(LO, "kg:(_pdcDe(s)!==null?0:(s.kg===null?null:(s.kg||0)))", "kg:s.kg||0")], 'GARDE'),
    ('M11 « enregistrer en programme » garde « à vide » ET le PDC sur la même série',
     [(LO, "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),", "...(s.vide?{vide:true}:{}),")], 'GARDE'),
    # ── P10 : jamais PDC ET « à vide » ──
    ('M12 choisir « PDC » sur une barre « à vide » laisse `vide:true` (P10 : les deux ensemble)',
     [(LO, "set.kg=0; delete set.rm1; delete set.vide;                      // `kg` reste 0", "set.kg=0; delete set.rm1;                      // `kg` reste 0")], 'GARDE'),
    ('M13 taper le montant d\'un lest sur une barre « à vide » laisse `vide:true`',
     [(LO, "s.kg=0; delete s.rm1; delete s.vide; persist(); _pdcMajChamp(ei,si);", "s.kg=0; delete s.rm1; persist(); _pdcMajChamp(ei,si);")], 'GARDE'),
    ('M14 valider une charge INCONNUE sans rien taper l\'écrit « 0 » (la validation invente un zéro)',
     [(LO, "else if(set.kg===null&&String(inps[1].value||'').trim()===''&&!(numFR(inps[1].placeholder)>0)){ /* reste `null` */ } else set.kg=", "else set.kg=")], 'GARDE'),
    # ── l'import (charge non renseignée = inconnue) ──
    ('M15 l\'import écrit « 0 » pour une charge non renseignée (elle redevient un zéro inventé)',
     [(LO, "kgs.push(c>0?c:(c==='vide'?0:null));", "kgs.push(c>0?c:0);")], 'GARDE'),
    ('M16 le regroupement échauffement / travail rend une charge inconnue « 0 » (puis lue « barre à vide » à côté d\'une charge positive)',
     [(LO, "function _kgPerSetDe(x){ return x.kgs.map((k,i)=>x.vides[i]?'vide':(k>0?k:null)); }", "function _kgPerSetDe(x){ return x.kgs.map((k,i)=>x.vides[i]?'vide':(k>0?k:0)); }")], 'GARDE'),
    ('M17 le regroupement perd les repos par série (`restPerSet` supprimé)',
     [(LO, "if(RE.some(v=>v!=null&&v!=='')){o.restPerSet=RE.map(v=>v==null?'':v);}else delete o.restPerSet;", "delete o.restPerSet;")], 'GARDE'),
    # ── l'éditeur de programme ──
    ('M18 vider une charge dans l\'éditeur la rend « zéro » (et non plus inconnue)',
     [(LO, "if(s.kg!==null)_marquerEdition(s,'kg'); s.kg=null; if(el)el.value=''; return true; }", "if(s.kg!==0)_marquerEdition(s,'kg'); s.kg=0; if(el)el.value=''; return true; }")], 'GARDE'),
    ('M19 traverser le champ vide d\'une série PDC prescrite dans l\'éditeur EFFACE la prescription',
     [(LO, "if(_pdcDe(s)!==null){ if(el)el.value=''; return true; } if(s.kg!==null)", "if(s.kg!==null)")], 'GARDE'),
    ('M20 taper des kilos dans l\'éditeur sur une série PDC garde le PDC (les deux coexistent)',
     [(LO, "if(n>0){ delete s.vide; delete s.pdc; }", "if(n>0){ delete s.vide; }")], 'GARDE'),
    ('M21 « vide » dans l\'éditeur sur une série PDC garde le PDC (les deux coexistent)',
     [(LO, "    delete s.pdc;                                                // D-164 : « à vide » et « PDC » sont deux choix contradictoires — le dernier geste gagne\n", "")], 'GARDE'),
    ('M22 retirer « à vide » dans l\'éditeur laisse un zéro (la charge n\'est plus inconnue)',
     [(LO, "if(s.vide){ delete s.vide; s.kg=null; }", "if(s.vide){ delete s.vide; }")], 'GARDE'),
    ('M23 l\'éditeur ne montre plus un PDC prescrit (champ vide, indice « kg ») : la prescription est invisible',
     [(LO, "placeholder=\"${_pdcDe(s)!==null?_pdcTxt(s.pdc):(s.vide?'à vide':'kg')}\"", "placeholder=\"${s.vide?'à vide':'kg'}\"")], 'GARDE'),
    ('M24 « + série » de l\'éditeur ne copie pas le PDC prescrit de la série précédente',
     [(LO, "rest:l?l.rest||0:0,..._pdcRepris(l)});", "rest:l?l.rest||0:0});")], 'GARDE'),
    # ── le LEST au tonnage (arbitrage de Michel) ──
    ('M25 le lest ne compte plus dans le tonnage (comme avant l\'arbitrage)',
     [(LO, "function _chargeTonnage(s){ const n=_pdcDe(s); return n!==null?(n>0?n:0):(+s.kg||0); }", "function _chargeTonnage(s){ const n=_pdcDe(s); return n!==null?0:(+s.kg||0); }")], 'GARDE'),
    ('M26 ⛔ une ASSISTANCE compte au tonnage (valeur absolue : une règle d\'assistance inventée)',
     [(LO, "return n!==null?(n>0?n:0):(+s.kg||0); }", "return n!==null?Math.abs(n):(+s.kg||0); }")], 'GARDE'),
    ('M27 ⛔ le poids de corps est AJOUTÉ au lest (le passé dépendrait du poids de corps)',
     [(LO, "return n!==null?(n>0?n:0):(+s.kg||0); }", "return n!==null?(n>0?(S.bw||0)+n:0):(+s.kg||0); }")], 'GARDE'),
    ('M28 ⛔ un PDC seul compte le poids de corps au tonnage',
     [(LO, "return n!==null?(n>0?n:0):(+s.kg||0); }", "return n!==null?(S.bw||0)+(n>0?n:0):(+s.kg||0); }")], 'GARDE'),
    ('M29 la carte de l\'exercice ne compte pas le lest (deux volumes pour le même travail)',
     [(LO, "const vol=doneSets.reduce((a,s)=>a+_chargeTonnage(s)*(s.reps||0),0)", "const vol=doneSets.reduce((a,s)=>a+(s.kg||0)*(s.reps||0),0)")], 'GARDE'),
    ('M30 l\'export refait un volume SANS le lest (la somme des lignes ne refait plus le volume)',
     [(SE, "volume:Math.round(_chargeTonnage(st)*reps*_facteurUni(s, ex.name))", "volume:Math.round(kg*reps*_facteurUni(s, ex.name))")], 'GARDE'),
    ('M31 ⛔ un lest crée un RECORD de charge (`S.prs`) : le lest se mêle aux charges ordinaires',
     [(LO, "return !!(s && s.done && s.kg && s.reps && s.type!=='É' && s.type!=='W');", "return !!(s && s.done && (s.kg||s.pdc>0) && s.reps && s.type!=='É' && s.type!=='W');")], 'GARDE'),
    # ── le RECORD de lest (dérivé) ──
    ('M32 ⛔ une ASSISTANCE donne un record de lest (aucune règle d\'assistance)',
     [(LO, "if(!s||!s.done||!(n>0)||!(+s.reps>0)||s.type==='É'||s.type==='W')return;", "if(!s||!s.done||n===null||!(+s.reps>0)||s.type==='É'||s.type==='W')return;")], 'GARDE'),
    ('M33 un lest d\'ÉCHAUFFEMENT donne un record de lest',
     [(LO, "if(!s||!s.done||!(n>0)||!(+s.reps>0)||s.type==='É'||s.type==='W')return;", "if(!s||!s.done||!(n>0)||!(+s.reps>0))return;")], 'GARDE'),
    ('M34 un PREMIER lest est annoncé comme un record',
     [(LO, "if(b&&old&&(b.lest>old.lest||(b.lest===old.lest&&b.reps>old.reps)))out.push", "if(b&&(!old||b.lest>old.lest||(b.lest===old.lest&&b.reps>old.reps)))out.push")], 'GARDE'),
    ('M35 le record de lest n\'est plus dit à la fin de la séance',
     [(LO, "if(_lestB.length){const _e=", "if(false){const _e=")], 'GARDE'),
    ('M36 la carte de l\'exercice ne dit plus le record de lest',
     [(LO, "${_recLest?' · lest max +'+fmt(_recLest.lest)+' kg':''}", "")], 'GARDE'),
    # ── les sorties : CSV et Milo ──
    ('M37 le CSV écrit « 0 » pour une charge inconnue (elle passe pour une mesure)',
     [(SE, "kg:(_kgConnu(st.kg)||_pdcDe(st)!==null?kg:'')", "kg:kg")], 'GARDE'),
    ('M38 le CSV ne dit plus « à vide » dans la colonne `charge`',
     [(SE, ":(_vide?{charge:'à vide'}:{})));", ":{}));")], 'GARDE'),
    ('M39 le programme que Milo reçoit ne dit plus le PDC / lest / assistance prescrit',
     [(CO, "((typeof _pdcDe==='function'&&_pdcDe(t[0])!==null)?' @'+_kgTxtSerie(t[0]):'')", "''")], 'GARDE'),
    # ── les chemins dégressifs ──
    ('M40 un palier fait dit « — » au lieu de son PDC (dégressif)',
     [(LO, "${_pdcDe(set)!==null?_pdcTxt(set.pdc):(set.kg||'—')}</div>`", "${set.kg||'—'}</div>`")], 'GARDE'),
    ('M41 le palier courant d\'un dégressif ne dit pas son PDC (champ vide)',
     [(LO, "value=\"${_pdcDe(set)!==null?_pdcTxt(set.pdc):(set.kg||'')}\" placeholder=\"${set.vide?'à vide':(_pk&&_pdcDe(_pk)!==null?_pdcTxt(_pk.pdc):(_pk&&_kgConnu(_pk.kg)?_pk.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" onchange=", "value=\"${set.kg||''}\" placeholder=\"${set.vide?'à vide':(_pk&&_pdcDe(_pk)!==null?_pdcTxt(_pk.pdc):(_pk&&_kgConnu(_pk.kg)?_pk.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" onchange=")], 'GARDE'),
    # ── D-167 : jamais de cardio sans confirmation ──
    ('M42 ⛔ la ligne d\'un mouvement inconnu est classée « cardio » sans demander (le garde D-167 retiré : E01 d\'origine)',
     [(LO, "if(!brut&&o._cardioOk!==true&&_creneauAConfirmer(o))return false;", "")], 'GARDE'),
    ('M43 la question n\'est jamais posée (rien à confirmer) : l\'aperçu ne demande plus',
     [(LO, "function _creneauAConfirmer(o){\n  try{\n", "function _creneauAConfirmer(o){\n  return false;\n  try{\n")], 'GARDE'),
    ('M44 le « oui » de la personne ne change rien (la ligne reste un exercice même après « Mettre dans le cardio »)',
     [(LO, "if(!brut&&o._cardioOk!==true&&_creneauAConfirmer(o))return false;", "if(!brut&&_creneauAConfirmer(o))return false;")], 'GARDE'),
    ('M45 le « oui » ne voyage pas jusqu\'au rangement du jour (`_cardioOk` non transmis à `_buildProgDay`)',
     [(LO, "        if(ex._cardioOk===true)obj._cardioOk=true;        // D-167", "        // D-167")], 'GARDE'),
    ('M46 l\'aperçu ne marque jamais la question (`_impCardioAConfirmer` n\'est pas appelé)',
     [(LO, "    _impCardioAConfirmer();      // D-167 :", "    // D-167 :")], 'GARDE'),
    ('M47 ⛔ une ligne AVEC charge (kg > 0 ou « à vide ») est mise en question / rangée au cardio (le garde « une charge = de la musculation » retiré)',
     [(LO, "    if(sets.some(s=>s&&(s.vide||parseFloat(String(s.kg).replace(',','.'))>0)))return false;\n", "")], 'GARDE'),
    ('M48 un créneau NOMMÉ (« Échauffement - 5 min », « Warm-up - vélo ») est mis en question (le garde « libellé / machine / durée » retiré)',
     [(LO, "    if(_RE_CRENEAU_CARDIO.test(nb)||_CARDIO_TYPES.some(([re])=>re.test(nb))||/\\d\\s*(?:min|minutes?|')/.test(nb))return false;", "")], 'GARDE'),
    ('M49 la création des exercices perso à l\'import ignore la réponse (la sonde d\'avant : « cardio » confirmé crée quand même un exercice perso)',
     [(LO, "&& _estCreneauCardio(_impSondeCardio(ex)))return;", "&& _estCreneauCardio({name:ex.name,note:ex.note,sets:[{kg:ex.kg||0}]}))return;")], 'GARDE'),
    # ── intégration V4 (21/11/2026) : l'export Sheets garde la distinction inconnu / zéro ──
    ('M50 ⛔⛔ l\'export Sheets écrit de nouveau un ZÉRO pour une charge INCONNUE (la cellule n\'est plus vide)',
     [(TR, "const kgInconnu=!pdcPose&&(s.kg===null||s.kg===undefined||s.kg===''||!isFinite(kgNum));", "const kgInconnu=false;")], 'GARDE'),
    ('M51 ⛔ l\'export Sheets laisse la charge vide mais écrit un VOLUME 0 pour la série sans charge (0 × reps)',
     [(TR, "volume:kgInconnu?'':kg*reps", "volume:kg*reps")], 'GARDE'),
    ('M52 ⛔ l\'export Sheets prend un « poids du corps » (PDC, kg 0 écrit) pour une charge inconnue (le garde `pdcPose` retiré)',
     [(TR, "const kgInconnu=!pdcPose&&(", "const kgInconnu=(")], 'GARDE'),
    # ── ARCH-04 (22/11/2026) : stockage plein, le drapeau « historique tronqué » d'abord ──
    ('M53 ⛔⛔ ARCH-04 : l\'ORDRE D\'AVANT (les 50 séances écrites PUIS le drapeau) : si le drapeau est refusé, le disque porte 50 séances sans que rien ne le dise',
     [(ST, "      let drapeau=false;\n      try{ localStorage.setItem('ft4_hist_tronque','1'); S.histTronque=true; drapeau=true; }\n      catch(eD){ try{console.warn('[FT persist] drapeau ft4_hist_tronque refusé : les séances ne sont PAS réduites',eD);}catch(_){} }\n      if(drapeau) localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));\n",
           "      localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));\n      localStorage.setItem('ft4_hist_tronque','1'); S.histTronque=true; let drapeau=true;\n")], 'GARDE'),
    ('M54 ⛔ ARCH-04 : le drapeau est écrit d\'abord mais son échec n\'empêche plus la réduction (les 50 séances sont écrites quand même)',
     [(ST, "      if(drapeau) localStorage.setItem('ft4_sessions'", "      localStorage.setItem('ft4_sessions'")], 'GARDE'),
]

BANC = os.path.join('tools', 'banc_seance_ce_p.js')


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
    tmp = tempfile.mkdtemp(prefix='mut_sccp_')
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
