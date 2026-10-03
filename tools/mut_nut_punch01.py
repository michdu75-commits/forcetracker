#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-PUNCH-01 (03/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (pour la partie du banc concernee).
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE (conduit dans la page) rougit.
     Un rouge des seuls temoins de SOURCE (« B-NP01-x source ») ne suffit pas.
  MA* = contrat Seance -> Nutrition (B-NP01-A) · MB* = cycle / cache / annonce / ecran vide (B-NP01-B)
  · MC* = role des repas d'entrainement (B-NP01-C) · MD* = reliquats (B-NP01-D)
  · ME* = repas habituels par famille (B-NP01-E) · MF* = « Il te reste aujourd'hui » (B-NP01-F)
  · EQ* = equivalentes (temoins EXECUTES verts ; seul le temoin de source, qui fige le texte, rougit) · [negatif] = commentaire seul (doit rester vert)
Usage : python3 tools/mut_nut_punch01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ST, LO, SC, AP, TR, IX = 'state.js', 'log.js', 'screens.js', 'app.js', 'tracking.js', 'index.html'
FICHIERS = (ST, LO, SC, AP, TR, IX)

TDEE = "  return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));\n"
_DU_JOUR = "(S.sessions||[]).filter(s=>s&&s.date===today())"
START = "  if(!ouverte) S.wkt={date:today(),exs:[],startHour:new Date().getHours()};\n"
ENCOURS = "    if(S.wkt && S.wkt.date===t && ouverte) return {seance:true, heure:_heureSeance(S.wkt), source:'encours'};\n"
HONORE = "    if(lastDate&&lastDate>=np.date)return null;   // annonce honorée : la séance a été faite\n"
FIN_PR = "  const _oldPrs={};Object.keys(S.prs||{}).forEach(k=>{_oldPrs[k]={...S.prs[k]};});\n"

# (nom, remplacements, attendu, partie du banc)
MUT = [
    ('MA1 la DUREE de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.duration||0)/60),0));"))], 'GARDE', 'contrat'),
    ('MA2 la METHODE (superset) entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(" + _DU_JOUR + ".some(s=>(s.exs||[]).some(e=>e&&e.group))?50:0));"))], 'GARDE', 'contrat'),
    ('MA3 le VOLUME de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.volume||0)/500),0));"))], 'GARDE', 'contrat'),
    ('MA4 la DISCIPLINE entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.discipline==='powerlifting'?100:0));"))], 'GARDE', 'contrat'),
    ('MA5 le NIVEAU entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.level==='confirme'?80:0));"))], 'GARDE', 'contrat'),
    ('MA6 la seance est datee en UTC au lieu du jour local',
     [(LO, START, START.replace("date:today()", "date:new Date().toISOString().slice(0,10)"))], 'GARDE', 'contrat'),
    ('MA7 la fin de seance efface les codes de serie (tout devient N)',
     [(LO, FIN_PR, "  sess.exs.forEach(e=>(e.sets||[]).forEach(x=>{x.type='N';}));\n" + FIN_PR)], 'GARDE', 'contrat'),
    ('MA8 la seance EN COURS n\'est plus un jour de seance',
     [(ST, ENCOURS, "")], 'GARDE', 'contrat'),
    ('MA9 une annonce n\'est jamais honoree par la seance faite',
     [(ST, HONORE, "")], 'GARDE', 'contrat'),
    # ── B-NP01-B : cycle en jours, cache de region, jour annonce, ecran Seance vide ──
    ('MB1 le cycle recompte des SEANCES (retour de f = 8 / f = 6)',
     [(ST, "    const wk=_weeklyCounts(4,true);\n", "    const wk=_weeklyCounts(4);\n")], 'GARDE', 'cycle'),
    ('MB2 la region moyenne redevient une moyenne PAR SEANCE',
     [(ST, "    const facteurs=Object.keys(parJour).map(k=>_facteurRegion(parJour[k]));\n",
       "    const facteurs=(S.sessions||[]).filter(s=>{if(!s||!s.date)return false;const d=Math.round((new Date(t+'T12:00:00')-new Date(s.date+'T12:00:00'))/864e5);return d>=0&&d<28;}).map(_facteurRegion);\n")], 'GARDE', 'cycle'),
    ('MB3 la cle du cache de region ignore l\'etat des series',
     [(SC, "+'#'+(((e&&e.sets)||[]).some(x=>x&&x.done)?1:0)).join('~');", ").join('~');")], 'GARDE', 'cycle'),
    ('MB4 « en cours » relit S.wkt brut (ecran Seance vide = seance)',
     [(ST, "    if(S.wkt && S.wkt.date===t && ouverte) return", "    if(S.wkt && S.wkt.date===t) return")], 'GARDE', 'cycle'),
    ('MB5 le jour annonce reprend le facteur 1',
     [(ST, "    let rJour=rMoy;\n    if(js.seance){", "    let rJour=js.seance?1:rMoy;\n    if(js.seance&&faiteJ){")], 'GARDE', 'cycle'),
    ('MB6 la tuile « 7 derniers jours » compte des jours',
     [(SC, "_weeklyCounts(1)[0]:null;", "_weeklyCounts(1,true)[0]:null;")], 'GARDE', 'cycle'),
    ('MB7 la proposition de niveau d\'activite compte des jours',
     [(ST, "    const wk=_weeklyCounts(4);\n", "    const wk=_weeklyCounts(4,true);\n")], 'GARDE', 'cycle'),
    ('MB8 la carte de frequence de Milo compte des jours',
     [(TR, "    const wk=_weeklyCounts(4);\n", "    const wk=_weeklyCounts(4,true);\n")], 'GARDE', 'cycle'),
    ('MB9 [deguisee] le jour annonce devine la region depuis son libelle',
     [(ST, "    let rJour=rMoy;\n", "    let rJour=(js.source==='annoncee'&&/jambe/i.test((S.nextPlanned||{}).label||''))?_CYCLE_REGION.bas:rMoy;\n")], 'GARDE', 'cycle'),
    ('MB10 [deguisee] un jour compte une fois mais la region du jour = la PREMIERE seance du jour',
     [(ST, "      if(!s||!s.date||parJour[s.date]) return;\n", "      if(!s||!s.date) return;\n")], 'GARDE', 'cycle'),
    ('EQB1 [equivalente] la cle porte le NOMBRE de series validees (plus fine, meme resultat)',
     [(SC, "+'#'+(((e&&e.sets)||[]).some(x=>x&&x.done)?1:0)).join('~');", "+'#'+(((e&&e.sets)||[]).filter(x=>x&&x.done).length?1:0)).join('~');")], 'SOURCE', 'cycle'),
    # ── B-NP01-C : role des repas d'entrainement (low carb, jeune) ──
    ('MC1 le role « autour de la seance » n\'est plus reconnu (retour C1)',
     [(ST, ",['autour',/autour de la séance/i]];", "];")], 'GARDE', 'repas'),
    ('MC2 le renommage du jeune efface le role (retour C2)',
     [(ST, "      ? [r[0], '⏳ Rupture du jeûne'+(FEN?' ('+FEN.split('→')[0].trim()+')':''), r[2], r[3], true] : r));",
           "      ? [r[0], '⏳ Rupture du jeûne'+(FEN?' ('+FEN.split('→')[0].trim()+')':''), r[2], null, true] : r));")], 'GARDE', 'repas'),
    ('MC3 le filtre des jours de repos repasse APRES le jeune',
     [(ST, "  if(!_js.seance) plan2=_retirerRepas(plan2, r=>!!r[3]);\n  if(S.fasting){",
           "  if(S.fasting){"),
      (ST, "  if(_js.seance){\n    /* ⭐ ON NOMME L'HEURE", "  if(!_js.seance) plan2=_retirerRepas(plan2, r=>!!r[3]&&!r[4]);\n  if(_js.seance){\n    /* ⭐ ON NOMME L'HEURE")], 'GARDE', 'repas'),
    ('MC4 l\'annotation relit l\'INTITULE au lieu du role',
     [(ST, "      if(role==='pre'  && (h||renomme))", "      if(/pré-entraînement/i.test(nom) && (h||renomme))")], 'GARDE', 'repas'),
    ('MC5 _retirerRepas perd les cases du repas (le role disparait a la redistribution)',
     [(ST, "  return restants.map(r=>{ const c=r.slice(); c[0]=r[0]+bonus; return c; });", "  return restants.map(([p,nom,d])=>[p+bonus,nom,d]);")], 'GARDE', 'repas'),
    ('MC6 [deguisee] une heure inventee pour une seance annoncee (« de 18 h » par defaut)',
     [(ST, "    const h=_js.heure!=null?_js.heure+' h':null;", "    const h=(_js.heure!=null?_js.heure:18)+' h';")], 'GARDE', 'repas'),
    ('MC7 [deguisee] les calories d\'un repas retire sont perdues au lieu d\'etre redistribuees',
     [(ST, "  if(!_js.seance) plan2=_retirerRepas(plan2, r=>!!r[3]);", "  if(!_js.seance) plan2=plan2.filter(r=>!r[3]);")], 'GARDE', 'repas'),
    # ── B-NP01-D : reliquats ──
    ('MD1 la tendance de force reprend l\'echauffement É',
     [(ST, "          if(x.type==='É' || x.type==='W' || x.type==='E') return;", "          if(x.type==='W' || x.type==='E') return;")], 'GARDE', 'reliquats'),
    ('MD2 le garde-fou de volume reprend les paliers d\'echauffement',
     [(ST, "x.done!==false && x.type!=='É' && x.type!=='W' && +x.kg>0", "x.done!==false && +x.kg>0")], 'GARDE', 'reliquats'),
    ('MD3 la phase du cycle recompte depuis l\'INSTANT (bascule a midi)',
     [(ST, "  const elapsed=Math.round((new Date(_jourLocal+'T12:00:00')-new Date(S.mensCycleStart+'T12:00:00'))/864e5);",
           "  const elapsed=Math.floor(((ts==null?new Date():new Date(ts))-new Date(S.mensCycleStart+'T12:00:00'))/864e5);")], 'GARDE', 'reliquats'),
    ('MD4 « demain » redevient une date UTC',
     [(SC, "    S.nextPlanned={date:today(d.getTime()),label:''};", "    S.nextPlanned={date:d.toISOString().slice(0,10),label:''};")], 'GARDE', 'reliquats'),
    ('MD5 la tuile redit « Cette semaine »',
     [(IX, "</svg>7 derniers jours</span>", "</svg>Cette semaine</span>")], 'GARDE', 'reliquats'),
    ('MD6 [deguisee] la serie a l\'ECHEC X sortie du volume (ce n\'est pas un echauffement)',
     [(ST, "x.done!==false && x.type!=='É' && x.type!=='W' && +x.kg>0", "x.done!==false && x.type!=='É' && x.type!=='W' && x.type!=='X' && +x.kg>0")], 'GARDE', 'reliquats'),
    ('MD7 [deguisee] « demain » calcule en ajoutant 24 h a l\'instant present (decale a l\'heure d\'ete)',
     [(SC, "    S.nextPlanned={date:today(d.getTime()),label:''};", "    S.nextPlanned={date:new Date(Date.now()+864e5).toISOString().slice(0,10),label:''};")], 'GARDE', 'reliquats'),
    # ── B-NP01-E : repas habituels par famille ──
    ('ME1 plus de familles : chaque habitude est sa propre carte (retour des 3 shakers)',
     [(AP, "    const f=familles.find(F=>F.some(m=>_habVariantes(m,h)));", "    const f=null;")], 'GARDE', 'habituels'),
    ('ME2 le rejeu ne cherche que dans le haut de liste (une variante ne se rejoue plus)',
     [(AP, "  const r=_repasHabituelsTous().find(x=>x.sig===sig);", "  const r=_repasHabituels().find(x=>x.sig===sig);")], 'GARDE', 'habituels'),
    ('ME3 la part des CALORIES au lieu des proteines (l\'huile rejoint la salade)',
     [(AP, "  const p = part('prot'), k = (p===null) ? part('kcal') : null;", "  const p = part('kcal'), k = null;")], 'GARDE', 'habituels'),
    ('ME4 un aliment PARTAGE suffit (plus d\'inclusion)',
     [(AP, "  for(const n of petit) if(!grand.has(n)) return false;", "  if(![...petit].some(n=>grand.has(n))) return false;")], 'GARDE', 'habituels'),
    ('ME5 libelle court pour TOUT nom a virgule (provenance CIQUAL ignoree)',
     [(AP, "  const court = n => (ciqual[n] && n.indexOf(',')>0)", "  const court = n => (n.indexOf(',')>0)")], 'GARDE', 'habituels'),
    ('ME6 libelle court meme quand il devient ambigu',
     [(AP, "  return n => { const c=court(n); return Object.keys(parCourt[c.toLowerCase()]||{}).length>1 ? n : c; };", "  return n => court(n);")], 'GARDE', 'habituels'),
    ('ME7 [deguisee] le libelle court RENOMME les aliments enregistres (historique reecrit)',
     [(AP, "  const court = n => (ciqual[n] && n.indexOf(',')>0) ? n.slice(0, n.indexOf(',')).trim() : n;",
           "  const court = n => (ciqual[n] && n.indexOf(',')>0) ? n.slice(0, n.indexOf(',')).trim() : n;\n  (S.foodLog||[]).forEach(e=>{ if(e&&ciqual[e.name]&&e.name.indexOf(',')>0) e.name=court(e.name); });")], 'GARDE', 'habituels'),
    ('ME8 [deguisee] les familles se forment sur le top 3 des habitudes (au lieu de toutes)',
     [(AP, "  _repasHabituelsTous().forEach(h=>{", "  _repasHabituelsTous().slice(0,3).forEach(h=>{")], 'GARDE', 'habituels'),
    ('ME9 « note X fois » revient sur la carte',
     [(SC, "${mi.lbl||''} · ${k} kcal · ${p} g de protéines</span></span>`", "${mi.lbl||''} · ${k} kcal · ${p} g de protéines · noté ${r.n} fois</span></span>`")], 'GARDE', 'habituels'),
    ('ME10 les variantes s\'affichent comme des cartes principales',
     [(SC, "        if(v.length){\n          html+=`<details class=\"jr-sec hab-variantes\"", "        if(v.length){ v.forEach((x,j)=>{ html+=carte(x,'hab-x-'+idx+'-'+j,false); }); }\n        if(v.length){\n          html+=`<details class=\"jr-sec hab-variantes\"")], 'GARDE', 'habituels'),
    ('ME11 le bouton de rejeu n\'echappe plus que l\'apostrophe (retour du guillemet qui casse le clic)',
     [(SC, "      const att=s=>(typeof _escAttrJs==='function')?_escAttrJs(s):String(s).replace(/'/g,\"\\\\'\");",
           "      const att=s=>String(s).replace(/'/g,\"\\\\'\");")], 'GARDE', 'habituels'),
    # ── B-NP01-F : « Il te reste aujourd'hui » ──
    ('MF1 les idees s\'ouvrent d\'office (equivalences affichees)',
     [(SC, "<details class=\"jr-sec nu-reste-idees\" style=\"margin-top:8px;\">", "<details open class=\"jr-sec nu-reste-idees\" style=\"margin-top:8px;\">")], 'GARDE', 'reste'),
    ('MF2 le bloc parle quand rien n\'est note',
     [(SC, "  if(!reste || reste.rien || !(reste.kcal>0)) return '';", "  if(!reste || !(reste.kcal>0)) return '';")], 'GARDE', 'reste'),
    ('MF3 le bloc parle quand la cible est atteinte ou depassee',
     [(SC, "  if(!reste || reste.rien || !(reste.kcal>0)) return '';", "  if(!reste || reste.rien) return '';")], 'GARDE', 'reste'),
    ('MF4 une macro depassee s\'affiche en negatif',
     [(SC, "+(v>0?v+'\u00A0g':'<span style=\"color:var(--t3);\">atteint</span>')", "+(v+'\u00A0g')")], 'GARDE', 'reste'),
    ('MF5 le Journal repete les kcal de son en-tete',
     [(SC, "  const sansKcal=!!(opts&&opts.sansKcal)||soir;", "  const sansKcal=soir;")], 'GARDE', 'reste'),
    ('MF6 plus de silence du soir (ft-v1029)',
     [(SC, "  if(soir && !idees.length) return '';", "")], 'GARDE', 'reste'),
    ('MF7 le bloc parle sur un jour passe',
     [(SC, "function _blocResteHTML(td, heure, opts){\n  if(td!==today()) return '';", "function _blocResteHTML(td, heure, opts){")], 'GARDE', 'reste'),
    ('MF8 [deguisee] les kcal restantes recalculees sur la DEPENSE au lieu de la cible',
     [(SC, "+reste.kcal.toLocaleString('fr-FR')+'</span>'", "+Math.round((calcTDEE()||0)-reste.tot.kcal).toLocaleString('fr-FR')+'</span>'")], 'GARDE', 'reste'),
    ('MF9 [deguisee] le bloc passe AVANT les anneaux (plus le gros chiffre de la carte)',
     [(SC, "      +'<span style=\"font-size:12.5px;color:var(--t3);font-weight:700;\">kcal mangées</span>'",
           "      +'<span style=\"font-size:12.5px;color:var(--t3);font-weight:700;\">kcal mangées</span>'+_blocResteHTML(today())"),
      (SC, "    +(typeof _blocResteHTML==='function'?_blocResteHTML(today()):'');", "    +'';")], 'GARDE', 'reste'),
    ('MF10 le soir, toutes les macros sont nommees (le manque s\'affiche « pour information »)',
     [(SC, "  const garde=soir?new Set(idees.map(i=>i.macro)):null;", "  const garde=null;")], 'GARDE', 'reste'),
    ('MF11 le soir, le total kcal reste affiche',
     [(SC, "  const sansKcal=!!(opts&&opts.sansKcal)||soir;", "  const sansKcal=!!(opts&&opts.sansKcal);")], 'GARDE', 'reste'),
    ('MU1 la ligne des variantes redevient trop petite pour un pouce (29 px)',
     [(SC, "padding:10px 12px;min-height:40px;box-sizing:border-box;display:flex;align-items:center;gap:8px;font-size:12px;", "padding:6px 12px;display:flex;align-items:center;gap:8px;font-size:12px;")], 'GARDE', 'habituels'),
    ('MU2 « Voir des idees » redevient trop petit pour un pouce (29 px)',
     [(SC, "padding:10px 0;min-height:40px;box-sizing:border-box;display:flex;", "padding:6px 0;display:flex;")], 'GARDE', 'reste'),
    ('[negatif] commentaire citant la duree et le volume dans calcTDEE',
     [(ST, TDEE, "  // (duree, volume, methode : jamais dans la depense)\n" + TDEE)], 'OK', 'contrat'),
]


def banc(arbre, partie):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nut_punch01.js', partie], cwd=arbre, capture_output=True, text=True, timeout=1200, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-NP01-[A-F] (?!source)', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nut_punch01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parties = sorted(set(m[3] for m in choisies))
    for p in parties:
        tmp0, a0 = cloner()
        rouges = banc(a0, p)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges:
            print('  !! ARBRE SAIN DEJA ROUGE (partie %s) — controle refuse :' % p, rouges[:3]); return 1
        print('  arbre sain, partie %s : 0 rouge (point de depart valide)' % p)
    print()
    conformes = total = 0
    for nom, remplacements, attendu, partie in choisies:
        total += 1
        tmp, arbre = cloner()
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
        rouges = banc(arbre, partie)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-66s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
