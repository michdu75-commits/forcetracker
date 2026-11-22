#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 1 « CONTRE-EXPERTISE » (Claude N°2, 16/11/2026, D-163 tous programmes · D-168 repos · D-171 commentaire par serie) : les temoins B-SCCH savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot supprime (ou retire une protection qu'il ajoute) ; le banc `tools/banc_seance_ce_h.js` doit alors rougir AU MOINS une fois.
Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche INVALIDE.
Usage : python3 tools/mut_seance_ce_h.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_ce_h.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_seance_ce_h.js')
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js')
LO, SJ, CO, CS = 'log.js', 'setup.js', 'coach.js', 'style.css'

JOUR = "  const _jour=_seancesDuJour(prog,_lbl,day);"
PREVC = "    const h=_prevDuJour(jour||[],e,exs), prev=h.sets, ts=h.ts;"
IDENT = "  if(ident.length===1)ex=ident[0];"
POOL = "      if(freres.length===1&&pool.length===1)ex=pool[0];"
REST = "rest:_secRepos(ppRest?ppRest.rest:s.rest),"
PPREST = "      const ppRest=(pp&&pp.rest>0&&!(ed.rest>ts))?pp:null;"
SERIES = "  if(!(prev||[]).some(x=>x&&x.sid))return _prevAligne(prev,sets);"

MUT = [
    # ── D-163 : tous les programmes ──
    ('M01 les identites ne sont plus posees au chargement (programme, jour, exercice, serie) : la seance chargee et l\'historique n\'ont plus de reperes',
     [(LO, "  _assurerIdentites(prog,day);  ", "  ")], 'GARDE'),
    ('M02 la derniere seance se lit dans l\'ORDRE DU TABLEAU (le tri chronologique est retire : sonde H05)',
     [(LO, ".sort(_cmpSeances);\n}\n/* ", ";\n}\n/* ")], 'GARDE'),
    ('M03 la chronologie est lue A L\'ENVERS (la plus ANCIENNE seance du jour fait foi)',
     [(LO, ".sort(_cmpSeances);\n}\n/* ", ".sort((a,b)=>_cmpSeances(b,a));\n}\n/* ")], 'GARDE'),
    ('M04 le drapeau « prescrit » redevient une CONDITION : un programme non marque ne reprend jamais sa derniere seance',
     [(LO, JOUR, "  const _jour=prog.prescrit?_seancesDuJour(prog,_lbl,day):null;")], 'GARDE'),
    ('M05 le 1er usage reprend la derniere seance de l\'exercice DE PARTOUT (le defaut H02/H03 : la charge d\'un autre contexte remplace la prescription)',
     [(LO, PREVC, "    const h=(()=>{const v=_prevSeance(e.name);return {sets:v?v.sets:[],ts:v?_tsSeance(v.sess):0};})(), prev=h.sets, ts=h.ts;")], 'GARDE'),
    ('M06 le bloc se reconnait par son NOM et son rang (l\'identite d\'exercice n\'est plus lue : deux blocs de meme nom se melangent apres une reorganisation — H12)',
     [(LO, IDENT, "  if(false)ex=ident[0];\n  else if(!ident.length&&!liste.some(x=>x.exId)||true){ const c=liste.filter(x=>x.name===nom); ex=c[memeNom.indexOf(e)]||null; }")], 'GARDE'),
    ('M07 seance d\'AVANT les identites : deux blocs de meme nom — le 1er bloc de la seance sert aux deux (le rang n\'est plus lu)',
     [(LO, POOL, "      if(freres.length&&freres.length===pool.length)ex=pool[0];")], 'GARDE'),
    ('M08 seance d\'AVANT les identites : un nombre de blocs different reprend quand meme le 1er bloc (aucune garde : une valeur d\'un bloc qu\'on ne reconnait pas)',
     [(LO, POOL, "      if(freres.length)ex=pool[0];")], 'GARDE'),
    ('M09 la seance chargee ne porte plus l\'identite d\'exercice (`exId`) : l\'historique ne peut plus la reconnaitre',
     [(LO, "    const obj={name:e.name,note:e.note||'',...(e.exId?{exId:e.exId}:{}),sets:", "    const obj={name:e.name,note:e.note||'',sets:")], 'GARDE'),
    ('M10 la seance chargee ne porte plus l\'identite de serie (`sid`) : une serie deplacee perd son historique (rapprochement par rang)',
     [(LO, "        ...(s.sid?{sid:s.sid}:{}),                         // D-163", "        ...({}),                         // D-163")], 'GARDE'),
    ('M11 les series se rapprochent TOUJOURS par rang / role (l\'identite de serie n\'est plus lue)',
     [(LO, SERIES, "  return _prevAligne(prev,sets);\n  if(false)return _prevAligne(prev,sets);"),
      (LO, "  if(!(prev||[]).some(x=>x&&x.sid)) return base;", "  return base;")], 'GARDE'),
    ('M12 une serie dont le ROLE a change (N -> echauffement) emprunte quand meme la valeur de l\'ancien role',
     [(LO, "return (m.length===1&&ech(m[0])===ech(s))?m[0]:null;", "return (m.length===1)?m[0]:null;")], 'GARDE'),
    ('M13 une serie AJOUTEE (sans identite connue) emprunte une valeur de l\'historique (le repli par role est garde meme avec identites)',
     [(LO, "  return (sets||[]).map(s=>_serieParIdentite(prev,s));\n}", "  return (sets||[]).map((s,i)=>_serieParIdentite(prev,s)||(_prevAligne(prev,sets)[i]||null));\n}")], 'GARDE'),
    ('M14 des identites de jour en double ne sont plus renouvelees (un jour copie partage l\'identite de l\'original)',
     [(LO, "if(!day.id||(prog.days||[]).some((d,i)=>i<k&&d&&d.id===day.id))day.id=_idJour();", "if(!day.id)day.id=_idJour();")], 'GARDE'),
    ('M15 des identites d\'exercice en double ne sont plus renouvelees',
     [(LO, "if(!e.exId||vusE.has(e.exId))e.exId=_idCourt(vusE); else vusE.add(e.exId);", "if(!e.exId)e.exId=_idCourt(vusE);")], 'GARDE'),
    ('M16 des identites de serie en double ne sont plus renouvelees',
     [(LO, "if(!s.sid||vusS.has(s.sid))s.sid=_idCourt(vusS); else vusS.add(s.sid);", "if(!s.sid)s.sid=_idCourt(vusS);")], 'GARDE'),
    ('M17 un programme d\'AVANT recoit `prescrit:true` au chargement (migration silencieuse du drapeau)',
     [(LO, "  if(!prog.id)prog.id=_idStable('p');", "  prog.prescrit=true; if(!prog.id)prog.id=_idStable('p');")], 'GARDE'),
    ('M18 un programme sans identifiant n\'en recoit plus : sa seance ne porte aucun `progId` (jamais « deja fait »)',
     [(LO, "  if(!prog.id)prog.id=_idStable('p');", "  if(false)prog.id=_idStable('p');")], 'GARDE'),
    ('M19 le programme de Milo n\'est plus « prescrit » (sonde H03 : le drapeau est perdu a la normalisation)',
     [(CO, "force:true,prescrit:true};", "force:true};")], 'GARDE'),
    ('M20 « deja fait » se decide sur le PROGRAMME seul : les seances d\'un AUTRE jour du meme programme servent de repere',
     [(LO, "(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))", "true")], 'GARDE'),
    ('M21 le repli par libelle perd sa prudence : des seances anciennes se rattachent a deux jours homonymes',
     [(LO, "(unique&&s.progLabel===label)", "(s.progLabel===label)")], 'GARDE'),
    ('M22 H07 : le repli sur une seance PLUS ANCIENNE du meme jour revient (la derniere seance ne contient pas l\'exercice : on lit la precedente au lieu de la prescription)',
     [(LO, "  return sets.length?{sets,ts:_tsSeance(s)}:{sets:[],ts:0};", "  return sets.length?{sets,ts:_tsSeance(s)}:_prevDuJour((seances||[]).slice(1),e,exs);")], 'GARDE'),
    ('M23 les series d\'une seance non terminee comptent comme faites (`done:false` repris)',
     [(LO, "  const sets=ex?(ex.sets||[]).filter(x=>x&&x.done!==false):[];\n  return sets.length?", "  const sets=ex?(ex.sets||[]):[];\n  return sets.length?")], 'GARDE'),
    ('M24 un programme a UN SEUL jour reprend l\'historique de partout (il ne suit plus la regle)',
     [(LO, "exs:_exsDeProgramme(prog.exs,_seancesDuJour(prog,prog.name,null),5)", "exs:_exsDeProgramme(prog.exs,null,5)")], 'GARDE'),
    ('M44 17/11 : le RANG redevient lu pour des blocs homonymes de meme commentaire (le defaut H12 « y compris si les commentaires coincident » : le 2e bloc prend le 2e d\'avant)',
     [(LO, POOL, "      if(freres.length&&freres.length===pool.length)ex=pool[freres.indexOf(e)];")], 'GARDE'),
    # ── D-168 : le repos ──
    ('M25 le REPOS ne reprend plus l\'historique (lu toujours du programme : sonde H09)',
     [(LO, REST, "rest:_secRepos(s.rest),")], 'GARDE'),
    ('M26 l\'editeur ne pose plus l\'instant d\'une retouche de REPOS',
     [(LO, "  if(v!==(ex.sets[si].rest||0))_marquerEdition(ex.sets[si],'rest');", "")], 'GARDE'),
    ('M27 retaper le MEME repos pose un instant de retouche',
     [(LO, "  if(v!==(ex.sets[si].rest||0))_marquerEdition(ex.sets[si],'rest');", "  _marquerEdition(ex.sets[si],'rest');")], 'GARDE'),
    ('M28 le repos retouche n\'est plus prioritaire (l\'historique l\'ecrase toujours : sonde H10)',
     [(LO, PPREST, "      const ppRest=(pp&&pp.rest>0)?pp:null;")], 'GARDE'),
    ('M29 un repos INCONNU (0) dans l\'historique ecrase celui du programme (valeur inventee)',
     [(LO, PPREST, "      const ppRest=(pp&&!(ed.rest>ts))?pp:null;")], 'GARDE'),
    ('M30 la retouche de la charge emporte AUSSI le repos de la serie (les autres champs ne gardent plus leur progression)',
     [(LO, PPREST, "      const ppRest=(pp&&pp.rest>0&&!(ed.rest>ts)&&!(ed.kg>ts))?pp:null;")], 'GARDE'),
    # ── D-171 : le commentaire par serie ──
    ('M31 le commentaire de serie n\'est plus charge dans la seance (le programme le garde, la serie ne le montre pas)',
     [(LO, "        ...(s.note?{note:String(s.note)}:{}),              // D-171", "        ...({}),              // D-171")], 'GARDE'),
    ('M32 « Sauvegarder comme programme » ne recopie plus le commentaire de serie',
     [(LO, ",...(s.note?{note:String(s.note)}:{})}))};   // D-171", "}))};   // D-171")], 'GARDE'),
    ('M33 le champ de commentaire d\'une serie ecrit dans la CONSIGNE DE L\'EXERCICE (les deux niveaux se melangent)',
     [(LO, "  _noteBornee(ex.sets[si],val,document.getElementById('prog-snote-'+di+'-'+ei+'-'+si));", "  _noteBornee(ex,val,document.getElementById('prog-snote-'+di+'-'+ei+'-'+si));")], 'GARDE'),
    ('M34 les commentaires de serie existants restent CACHES derriere le bouton (apres rechargement, plus de champ visible)',
     [(LO, "const _noteOuverte=sets.some(x=>x&&x.note)||_peNotes.has(di+'-'+ei);", "const _noteOuverte=_peNotes.has(di+'-'+ei);")], 'GARDE'),
    ('M35 deplacer une serie ne l\'emporte plus entiere (le commentaire reste a sa place : copie champ par champ sans `note`)',
     [(LO, "  const t=ex.sets[si-1]; ex.sets[si-1]=ex.sets[si]; ex.sets[si]=t;", "  const t=ex.sets[si-1]; const u=ex.sets[si]; ex.sets[si-1]={kg:u.kg,reps:u.reps,type:u.type,rest:u.rest,sid:u.sid}; ex.sets[si]=t;")], 'GARDE'),
    ('M36 le plafond de surete coupe un commentaire deja plus long (une retouche le raccourcit en silence)',
     [(LO, "  const cap=Math.max(_NOTE_PROG_MAX,String(o.note||'').length);", "  const cap=_NOTE_PROG_MAX;")], 'GARDE'),
    ('M37 le bouton « Commentaire par serie » pose une cle `note` vide sur chaque serie (donnee ecrite sans que la personne ait ecrit)',
     [(LO, "function _togglePeNotes(di,ei){ const k=di+'-'+ei;", "function _togglePeNotes(di,ei){ const k=di+'-'+ei; _progEditEx(di,ei).sets.forEach(s=>{s.note=s.note||'';});")], 'GARDE'),
    # ── la cible tactile ──
    ('M38 la zone touchable du numero ne depasse plus du bouton (la regle generale des boutons rogne : `overflow:hidden`)',
     [(CS, "text-underline-offset:3px;position:relative;overflow:visible;}", "text-underline-offset:3px;position:relative;overflow:hidden;}")], 'GARDE'),   # ancre re-posee le 22/11/2026 : les deux regles `.pe-up` sont fusionnees
    ('M39 la zone touchable du numero n\'est plus elargie (24 → 30 px de large, 34 de haut)',
     [(CS, ".pe-up::before{content:'';position:absolute;left:-10px;right:0;top:-4px;bottom:-4px;}", ".pe-up::before{content:none;}")], 'GARDE'),
    ('M40 la zone elargie du numero deborde sur la pastille de type voisine (le bord du type n\'est plus le type)',
     [(CS, ".pe-up::before{content:'';position:absolute;left:-10px;right:0;top:-4px;bottom:-4px;}", ".pe-up::before{content:'';position:absolute;left:-10px;right:-14px;top:-4px;bottom:-4px;z-index:2;}")], 'GARDE'),
    # ── la regle d'or #9 ──
    ('M41 le bouton central « + » bouge sur l\'ecran Seance (decale de 3 px des que la seance est ouverte)',
     [(CS, "text-underline-offset:3px;position:relative;overflow:visible;}", "text-underline-offset:3px;position:relative;overflow:visible;}\n#root.seance-on #nb-log{position:relative;top:3px;}")], 'GARDE'),   # ancre re-posee le 22/11/2026 (fusion des deux regles `.pe-up`)
    # ── les nouvelles donnees voyagent ──
    ('M42 la synchronisation n\'envoie plus l\'identite des series (`sid`) : un copieur qui ne la recopie pas la supprime',
     [(SJ, "programmes:S.programmes||[],", "programmes:JSON.parse(JSON.stringify(S.programmes||[],function(k,v){return k==='sid'?undefined:v;})),")], 'GARDE'),
    ('M43 la restauration perd le commentaire de serie des programmes',
     [(SJ, "{S.programmes=raw.programmes;console.log('[FT restore] programmes:',raw.programmes.length);}", "{S.programmes=JSON.parse(JSON.stringify(raw.programmes,function(k,v){return k==='note'&&typeof v==='string'&&v.length<20?undefined:v;}));console.log('[FT restore] programmes:',raw.programmes.length);}")], 'GARDE'),
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
    tmp = tempfile.mkdtemp(prefix='mut_scch_')
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
