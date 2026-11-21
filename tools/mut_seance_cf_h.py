#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT H DE FERMETURE (Claude N°2, 17/11/2026 : homonymes sans identite · derniere seance absente = prescription · valider une charge vide) : les temoins B-SCFH savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot supprime (ou retire une protection qu'il ajoute) ; le banc `tools/banc_seance_cf_h.js` doit alors rougir AU MOINS une fois.
Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche INVALIDE.
Usage : python3 tools/mut_seance_cf_h.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_cf_h.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_seance_cf_h.js')
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js')
LO, SJ, CO, CS = 'log.js', 'setup.js', 'coach.js', 'style.css'

POOL = "      if(freres.length===1&&pool.length===1)ex=pool[0];"
FIN = "  return sets.length?{sets,ts:_tsSeance(s)}:{sets:[],ts:0};"
SEUL = "  return _seancesDuJour(prog,w.progLabel,day);"
PROGJ = "  if(c.progId)jour=_seancesDeCeJour(c);"
LIBREJ = "  else{ const v=_seancesExercice(e.name).find(x=>x&&x.sess&&!x.sess.progId); jour=v?[v.sess]:[]; }"
HPJ = "  const h=_prevDuJour(jour,e,lst);"
ADD = "  else if(!ident.length&&(!e.exId||!liste.some(x=>x.exId))){"
MILO = "  return _reprisesPour(e,e.sets||[],mode==='start'?{}:undefined,exs);"
PHN = "placeholder=\"${set.vide?'à vide':(_pk&&_pdcDe(_pk)!==null?_pdcTxt(_pk.pdc):(_pk&&_kgConnu(_pk.kg)?_pk.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\""
PHD = "placeholder=\"${set.vide?'à vide':(_pk&&_pdcDe(_pk)!==null?_pdcTxt(_pk.pdc):(_pk&&_kgConnu(_pk.kg)?_pk.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" onchange"

MUT = [
    # ── 1. homonymes sans identite ──
    ('M01 le RANG redevient lu pour des blocs homonymes de meme commentaire (le defaut : le 2e bloc prend le 2e d\'avant, « y compris si les commentaires coincident »)',
     [(LO, POOL, "      if(freres.length&&freres.length===pool.length)ex=pool[freres.indexOf(e)];")], 'GARDE'),
    ('M02 un commentaire present plusieurs fois dans la seance d\'avant designe quand meme le 1er bloc (ambigu cote historique)',
     [(LO, POOL, "      if(freres.length===1&&pool.length>=1)ex=pool[0];")], 'GARDE'),
    ('M03 un commentaire present plusieurs fois dans le programme designe quand meme le bloc d\'avant (ambigu cote programme)',
     [(LO, POOL, "      if(freres.length>=1&&pool.length===1)ex=pool[0];")], 'GARDE'),
    ('M04 le nom seul suffit meme quand il y a plusieurs blocs de ce nom (le 1er bloc de la seance d\'avant sert a tous)',
     [(LO, "    if(memeNom.length===1&&cands.length===1)ex=cands[0];", "    if(cands.length>=1)ex=cands[0];")], 'GARDE'),
    # ── 2. derniere seance absente = prescription ──
    ('M05 H07 : le repli sur une seance PLUS ANCIENNE du meme jour revient',
     [(LO, FIN, "  return sets.length?{sets,ts:_tsSeance(s)}:_prevDuJour((seances||[]).slice(1),e,exs);")], 'GARDE'),
    ('M06 les series NON faites de la derniere seance comptent comme une reprise (l\'exercice « present » sans serie faite prete sa charge)',
     [(LO, "  const sets=ex?(ex.sets||[]).filter(x=>x&&x.done!==false):[];\n  return sets.length?", "  const sets=ex?(ex.sets||[]):[];\n  return sets.length?")], 'GARDE'),
    ('M07 la derniere seance du jour n\'est plus la plus RECENTE : c\'est la plus ancienne qui est lue',
     [(LO, "  const s=(seances||[])[0];", "  const s=(seances||[])[(seances||[]).length-1];")], 'GARDE'),
    ('M08 le retour a la recherche par nom dans tout l\'historique quand la derniere seance n\'a pas l\'exercice',
     [(LO, FIN, "  return sets.length?{sets,ts:_tsSeance(s)}:(()=>{const v=_prevSeance(e.name);return {sets:v?v.sets:[],ts:v?_tsSeance(v.sess):0};})();")], 'GARDE'),
    # ── 3. valider une charge vide ──
    ('M09 la suggestion de charge vient de n\'importe quelle source (l\'ancien comportement : ✓ reprend la valeur d\'un autre programme / d\'une seance libre)',
     [(LO, "const _vs=_reprise(ex), _sugDet=_vs?", "const _vs=_prevSeance(ex.name), _sugDet=_vs?")], 'GARDE'),
    # M10 (« une seance LIBRE reprend la valeur d'une seance de PROGRAMME » sur `_sourceAdmissible`) : RETIREE LE 18/11/2026 (lot S) — `_sourceAdmissible` est supprimee (fusionnee dans `_seancesDeCeJour`, un seul selecteur) ;
    # la protection « une seance libre ne lit que les seances libres » est tuee par M19 (le filtre de `_reprise`). Le numero n'est pas reattribue.
    ('M11 un jour de programme dont le programme a disparu reprend quand meme des seances de programme (l\'incertitude suggere)',
     [(LO, "  if(!prog)return [];", "  if(!prog)return _seancesTrain().filter(s=>s&&s.progId).sort(_cmpSeances);")], 'GARDE'),
    ('M12 un jour de programme introuvable laisse quand meme proposer (l\'incertitude suggere)',
     [(LO, "  if(jours&&!day)return [];", "  if(false)return [];")], 'GARDE'),
    ('M13 un AUTRE jour du meme programme prete sa derniere fois (le jour n\'est plus lu)',
     [(LO, SEUL, "  return _seancesDuJour(prog,w.progLabel,null);")], 'GARDE'),
    ('M14 un AUTRE programme prete sa derniere fois (le programme n\'est plus lu : toute seance de programme est admissible)',
     [(LO, SEUL, "  return _seancesTrain().filter(s=>s&&s.progId).sort(_cmpSeances);")], 'GARDE'),
    ('M15 la ligne COURANTE d\'un dropset garde l\'ancienne suggestion (le 2e dessin du champ de charge)',
     [(LO, PHD, "placeholder=\"${set.vide?'à vide':(p&&_pdcDe(p)!==null?_pdcTxt(p.pdc):(p&&_kgConnu(p.kg)?p.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" onchange")], 'GARDE'),
    ('M16 les series ordinaires gardent l\'ancienne suggestion (le 1er dessin du champ de charge)',
     [(LO, PHN, "placeholder=\"${set.vide?'à vide':(p&&_pdcDe(p)!==null?_pdcTxt(p.pdc):(p&&_kgConnu(p.kg)?p.kg:''))}\" inputmode=\"decimal\" step=\"0.5\" enterkeyhint=\"done\"")], 'GARDE'),
    ('M17 valider une charge INCONNUE invente un zero (inconnu et zero se confondent)',
     [(LO, "      if(_pd!==null)set.pdc=_pd; else if(set.kg===null&&String(inps[1].value||'').trim()===''&&!(numFR(inps[1].placeholder)>0)){ /* reste `null` */ } else", "      if(_pd!==null)set.pdc=_pd; else")], 'GARDE'),
    ('M18 la suggestion de la derniere fois du MEME jour n\'est plus proposee (la protection devient « jamais rien » : l\'historique admissible disparait)',
     [(LO, "const _vs=_reprise(ex), _sugDet=_vs?", "const _vs=null, _sugDet=_vs?")], 'GARDE'),
    # ── 4. lot C de la finale : la provenance des charges partout (addExercise · addSet · remplacer · dropset · Milo · séance libre) ──
    ('M19 une seance LIBRE lit la derniere fois de TOUS les programmes (la seance de programme plus recente n\'est plus sautee : la derniere seance libre n\'est jamais atteinte)',
     [(LO, LIBREJ, "  else{ const v=_seancesExercice(e.name)[0]; jour=v?[v.sess]:[]; }")], 'GARDE'),
    ('M20 deux blocs homonymes dans la derniere seance libre ne sont plus ambigus (le 1er bloc sert)',
     [(LO, "    if(memeNom.length===1&&cands.length===1)ex=cands[0];", "    if(memeNom.length===1&&cands.length>=1)ex=cands[0];")], 'GARDE'),
    ('M21 la source n\'a plus a etre admissible (l\'ajout / « + serie » reprennent la derniere fois de n\'importe quel programme, libre compris)',
     [(LO, PROGJ, "  if(c.progId)jour=_seancesTrain().slice().sort(_cmpSeances);")], 'GARDE'),
    ('M22 `addExercise` reprend de nouveau la derniere fois du meme nom, tous programmes confondus',
     [(LO, "const _pa=_reprisesPour(name,_mod);", "const _pa=_prevAligne(prev,_mod);")], 'GARDE'),
    ('M23 `addSet` reprend de nouveau la derniere fois du meme nom, tous programmes confondus',
     [(LO, "const p=_reprisesPour(ex, ex.sets.concat([{type:'N'}])).pop();", "const p=_prevAligne(getPrev(ex.name), ex.sets.concat([{type:'N'}])).pop();")], 'GARDE'),
    ('M24 une charge INCONNUE (null) devient zero quand on ajoute une serie / un exercice (inconnu = zero)',
     # ↪️ ANCRE RE-POSÉE le 18/11/2026 (assemblage des lots S+Z) : même intention (inconnu → zéro à l'ajout), le code visé a bougé (`_serieDepuis` : « sans source » = `{kg:null,reps:def&&def.reps}`).
     [(LO, "const n=pp?{kg:_kgConnu(pp.kg)?pp.kg:null,reps:pp.reps}:{kg:null,reps:def&&def.reps};", "const n=pp?{kg:pp.kg||0,reps:pp.reps}:{kg:null,reps:def&&def.reps};")], 'GARDE'),
    ('M25 la barre « a vide » ne se copie plus (la serie ajoutee redevient un zero ordinaire)',
     # ↪️ ANCRE RE-POSÉE le 18/11/2026 : la copie de « à vide » vit désormais dans `_pdcVideDe` (le code de `_serieDepuis` l'appelle) ; même intention.
     [(LO, ",...((pp.vide&&!(+pp.kg>0)&&_pdcDe(pp)===null)?{vide:true}:{})}:{}; }", "}:{}; }")], 'GARDE'),
    ('M26 le PDC / lest / assistance ne se reprend plus a l\'ajout',
     # ↪️ ANCRE RE-POSÉE le 18/11/2026 : la copie vit dans `_pdcVideDe` (`..._pdcRepris(pp)`), appelée par `_serieDepuis` ; même intention.
     [(LO, "return pp?{..._pdcRepris(pp),", "return pp?{")], 'GARDE'),
    ('M27 « Remplacer l\'exercice » reprend de nouveau la derniere fois de tous les programmes',
     [(LO, "const pa=_reprisesPour(name,mod);", "const pa=_prevAligne(getPrev(name)||[],mod);")], 'GARDE'),
    ('M28 le depart d\'un dropset vient de nouveau de la derniere fois de tous les programmes',
     [(LO, "const h=(_reprise(ex)||{sets:[]}).sets[0];", "const h=getPrev(ex.name)[0];")], 'GARDE'),
    ('M29 un depart de dropset INCONNU devient des paliers a zero',
     # ↪️ ANCRE RE-POSÉE le 18/11/2026 (lot Z a réécrit la ligne du palier de `applyDropset`) ; même intention.
     [(LO, "kg:kg===null?null:(kg||0)", "kg:kg||0")], 'GARDE'),
    ('M30 la seance de Milo (1re porte, aucune seance en cours) reprend de nouveau la derniere fois de tous les programmes',
     [(LO, "const _pa=_repriseMilo(e,data,'start');   // par RÔLE", "const _pa=_prevAligne(getPrev(e.name)||[], e.sets||[]);   // par RÔLE")], 'GARDE'),
    ('M30b la seance de Milo (2e porte, une seance tourne deja) reprend de nouveau la derniere fois de tous les programmes',
     [(LO, "const _pa=_repriseMilo(e,data,mode);   // 18/11/2026 (lot S)", "const _pa=_prevAligne(getPrev(e.name)||[], e.sets||[]);   // 18/11/2026 (lot S)")], 'GARDE'),
    ('M31 une seance de PROGRAMME lit la derniere seance libre (le contexte programme n\'est plus distingue)',
     [(LO, PROGJ, "  if(false)jour=_seancesDeCeJour(c);")], 'GARDE'),
    ('M32 la seance concernee n\'est plus un parametre (`{}` : la seance de Milo lit la seance en cours, nulle)',
     [(LO, "  const c=(w===undefined)?S.wkt:w, e=", "  const c=S.wkt, e=")], 'GARDE'),
    ('M33 `addSet` ne copie plus la serie voisine de la seance en cours (la copie volontaire disparait)',
     [(LO, "const n=_serieDepuis(p||last,{kg:0,reps:8},'N');", "const n=_serieDepuis(p,{kg:0,reps:8},'N');")], 'GARDE'),
    # ── 5. lot S de la V3 (18/11/2026) : UN SEUL selecteur (bloc par identite · derniere seance du jour seulement · repetitions · Milo selon sa destination) ──
    ('M34 les REPETITIONS suggerees viennent de nouveau de « la derniere fois » de tous les programmes (serie ordinaire)',
     [(LO, "placeholder=\"${set.maxi?'max':(_pk?_pk.reps:(set.reps===null?'?':''))}\"", "placeholder=\"${set.maxi?'max':(p?p.reps:(set.reps===null?'?':''))}\"")], 'GARDE'),
    ('M35 les REPETITIONS suggerees de la ligne COURANTE d\'un dropset viennent de nouveau de tous les programmes',
     [(LO, "placeholder=\"${_pk?_pk.reps:''}\" inputmode=\"numeric\"", "placeholder=\"${p?p.reps:''}\" inputmode=\"numeric\"")], 'GARDE'),
    ('M36 un bloc AJOUTE sans identite ne se rapproche plus (contre une seance d\'avant qui porte des identites : « rien »)',
     [(LO, ADD, "  else if(!ident.length&&(!liste.some(x=>x.exId))){")], 'GARDE'),
    ('M37 Milo qui AJOUTE lit le contexte LIBRE (le jour de la seance en cours n\'est plus respecte)',
     [(LO, MILO, "  return _reprisesPour(e,e.sets||[],{},exs);")], 'GARDE'),
    ('M38 Milo qui DEMARRE lit la seance en cours (nulle) au lieu du contexte libre',
     [(LO, MILO, "  return _reprisesPour(e,e.sets||[],undefined,exs);")], 'GARDE'),
    ('M39 Milo qui AJOUTE ne voit plus les blocs de la seance en cours (l\'homonyme du programme n\'est plus detecte : ambigu → faussement unique)',
     [(LO, "  const exs=(mode==='add'?S.wkt.exs:[]).concat(data.exs||[]);", "  const exs=[].concat(data.exs||[]);")], 'GARDE'),
    ('M40 le bloc est de nouveau designe par son NOM seul (contre-sonde 1 : deux blocs homonymes se croisent / deviennent ambigus)',
     [(LO, HPJ, "  const h=_prevDuJour(jour,{name:e.name},lst);")], 'GARDE'),
    ('M41 le repli sur une seance PLUS ANCIENNE du jour revient quand l\'exercice est absent de la derniere (contre-sonde 2)',
     [(LO, HPJ, "  let h=_prevDuJour(jour,e,lst); for(let k=1;!h.sets.length&&k<jour.length;k++)h=_prevDuJour(jour.slice(k),e,lst);")], 'GARDE'),
    ('M42 un AUTRE programme plus recent masque de nouveau la derniere seance de CE jour (contre-sonde 3 : « la derniere fois du meme nom » puis refus)',
     [(LO, PROGJ, "  if(c.progId){ const v=_prevSeance(e.name); jour=(v&&_seancesDeCeJour(c).indexOf(v.sess)>=0)?[v.sess]:[]; }")], 'GARDE'),
    ('M43 « + serie » designe le bloc par son nom seul (le 2e de deux homonymes ne retrouve plus SON historique)',
     [(LO, "const p=_reprisesPour(ex, ex.sets.concat([{type:'N'}])).pop();", "const p=_reprisesPour(ex.name, ex.sets.concat([{type:'N'}])).pop();")], 'GARDE'),
    ('M44 Milo, sans source admissible, invente de nouveau un zero (1re porte)',
     [(LO, "const kg=(s.kg>0)?s.kg:(pp?pp.kg:null); ", "const kg=(s.kg>0)?s.kg:(pp?pp.kg:0); ")], 'GARDE'),
    ('M45 Milo, sans source admissible, invente de nouveau un zero (2e porte)',
     [(LO, "return {kg:(s.kg>0)?s.kg:(pp?pp.kg:null),", "return {kg:(s.kg>0)?s.kg:(pp?pp.kg:0),")], 'GARDE'),
]


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
    tmp = tempfile.mkdtemp(prefix='mut_scfh_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutot que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    if not os.environ.get('MUT_SANS_BASE'):          # MUT_SANS_BASE=1 : l'arbre sain a deja ete mesure a part (lots courts sous le verrou commun)
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
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS if os.path.exists(os.path.join(arbre, f))}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in srcs:
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
