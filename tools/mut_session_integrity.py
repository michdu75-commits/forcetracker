#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SESSION-INTEGRITY-01 (session-B) : les temoins B-SI01-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (master c3c830ab, ft-v1249), mot pour mot.
M1..M11 = les mutations demandees par Michel · M12..M18 = N-G2, rendu, rattrapage, deguisees.
M-FIN1..M-FIN6 = finition du 04/10 (retention, suppression, fidelite PDF ; M-FIN5 negatif, M-FIN6 equivalente).
Usage : python3 tools/mut_session_integrity.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'c3c830ab'
LO, CO, SE = 'log.js', 'coach.js', 'setup.js'
FICHIERS = ('log.js', 'coach.js', 'setup.js', 'app.js', 'index.html', 'screens.js', 'style.css')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (master c3c830ab)", 'AVANT', 'GARDE'),
    ('M1 le remplacement garde les anciennes series (renommage seul)',
     [(LO, "    S.wkt.exs[ei]=nouveau;                 // rien n'a été fait : B prend la place entière de A\n", "    ex.name=name;\n")], 'GARDE'),
    ('M2 une serie realisee est reetiquetee vers le nouvel exercice',
     [(LO, "    ex.sets=faites;\n    if(ex.group){delete ex.group;delete ex.groupType;}\n    S.wkt.exs.splice(ei+1,0,nouveau);\n", "    ex.name=name;\n")], 'GARDE'),
    ('M3 complete:false traite comme un succes (ecran de fin et Coach)',
     [(CO, "  if(!r || r===_DBF_REPLI) return false;\n  return (typeof _miloEtatReponse==='function') ? _miloEtatReponse(data)==='complete' : data.complete===true;",
       "  if(!r) return false;\n  return true;")], 'GARDE'),
    ('M4 le retry est supprime apres echec (jeton detruit au lieu de rendu)',
     [(LO, "    try{ if(typeof _dbfRendre==='function') _dbfRendre(_pid);", "    try{ if(typeof _dbfRendre==='function') _dbfFini(_pid);")], 'GARDE'),
    ('M5 summarizeCoach declenche sur le faux succes',
     [(LO, "    if(typeof _dbfReponseValide==='function' && !_dbfReponseValide(data))throw new Error('non confirmé');",
       "    if(typeof _dbfReponseValide==='function' && !_dbfReponseValide(data)){ if(typeof _saveCoachMemory==='function')_saveCoachMemory(); throw new Error('non confirmé'); }")], 'GARDE'),
    ("M6 le sessionId du debrief n'est pas persiste (cle fixe)",
     [(CO, "  m.seances[String(id)]=Object.assign({}, (av&&typeof av==='object')?av:{},", "  m.seances['debrief']=Object.assign({}, (av&&typeof av==='object')?av:{},")], 'GARDE'),
    ('M7 debrief associe a la derniere seance du tableau plutot qu\'au bon sessionId',
     [(LO, "_dbfEnregistrer(_pid, reply, 'fin');", "_dbfEnregistrer(_dbfCle(S.sessions[S.sessions.length-1]), reply, 'fin');")], 'GARDE'),
    ('M7b [deguisee] debrief associe a la premiere seance du MEME JOUR',
     [(LO, "_dbfEnregistrer(_pid, reply, 'fin');", "_dbfEnregistrer(_dbfCle((S.sessions||[]).slice().reverse().find(x=>x.date===sess.date)||sess), reply, 'fin');")], 'GARDE'),
    ('M8 le bouton disparait apres rechargement (magasin tenu en memoire seulement)',
     [(CO, "    const v=JSON.parse(localStorage.getItem(_DBF_TEXTES)||'null');", "    const v=JSON.parse(window.__dbfMem||'null');"),
      (CO, "src:src||''});\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }",
           "src:src||''});\n  try{ window.__dbfMem=JSON.stringify(m); return true; }catch(e){ return false; }")], 'GARDE'),   # ancre : l'ecriture de _dbfEnregistrer (finition : _dbfOublier ecrit aussi)
    ('M9 les debriefs sont inclus malgre l\'export « sans » (CSV et PDF)',
     [(SE, "      if(avecDebriefs){\n", "      if(true){\n"), (SE, "      if(_histoAvecDebriefs){\n", "      if(true){\n")], 'GARDE'),
    ('M10 les debriefs sont retires malgre l\'export « avec »',
     [(SE, "      if(avecDebriefs){\n", "      if(false){\n")], 'GARDE'),
    ('M11 une premiere occurrence redevient un record',
     [(LO, "    if(!old){_refExs.add(ex.name);return;}", "    if(!old){_prExs.add(ex.name);return;}")], 'GARDE'),
    ('M12 N-G2 : l\'ecran de fin juge la seance contre son propre record',
     [(LO, "_intensiteDefauts(ex.name,sets,_refAvantDe(sess,ex.name))", "_intensiteDefauts(ex.name,sets)")], 'GARDE'),
    ('M12b N-G2 : le contexte de Milo juge la seance contre son propre record',
     [(CO, "${_verdictIntensite(e, ds, s)}", "${_verdictIntensite(e, ds)}")], 'GARDE'),
    ('M13 rendu immediat retire (le fil deja affiche n\'est pas redessine)',
     [(CO, "      if(_m && _m.children.length && typeof _renderCoachThread==='function') _renderCoachThread();", "")], 'GARDE'),
    ('M14 la consigne cachee d\'un debrief rate reste dans le fil (Coach)',
     [(CO, "    if (opts.debriefSess) { const _i = coachHistory.lastIndexOf(_msgU); if (_i >= 0) coachHistory.splice(_i, 1); }", "")], 'GARDE'),
    ('M15 un ancien « recu » de repli est pose comme debrief',
     [(CO, "  if(_r && String(_r.reply).trim()===_DBF_REPLI){ _dbfRendre(_r.id); return; }\n", "")], 'GARDE'),
    ('M16 [deguisee] le remplacant herite du repos prescrit de l\'ancien',
     [(LO, "  const sets=mod.map((m,i)=>{const pp=pa[i];return{kg:pp?pp.kg:0,reps:pp?pp.reps:5,type:m.type,done:false,rm1:0};});",
           "  const sets=mod.map((m,i)=>{const pp=pa[i];const o={kg:pp?pp.kg:0,reps:pp?pp.reps:5,type:m.type,done:false,rm1:0};if(modeleSets&&modeleSets[i]&&modeleSets[i].rest!=null)o.rest=modeleSets[i].rest;return o;});")], 'GARDE'),
    ('M17 [deguisee] le remplacant garde le marqueur d\'auteur _milo et la consigne',
     [(LO, "  const o={name,sets};\n", "  const o={name,sets};\n  if(ancien&&ancien._milo){o._milo=true;o.note=ancien.note||'';}\n")], 'GARDE'),
    ('M18 [deguisee] le chemin du Coach accepte complete:false',
     [(CO, "      if (opts.debriefSess && !_dbfReponseValide(data)) {", "      if (false) {")], 'GARDE'),
    ('M-FIN1 plafond artificiel faible : 2 debriefs, le plus ancien sort',
     [(CO, "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n", "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  { const _ids=Object.keys(m.seances); if(_ids.length>2){ _ids.sort((a,b)=>(+(m.seances[a].ts)||0)-(+(m.seances[b].ts)||0)).slice(0,_ids.length-2).forEach(k=>{ delete m.seances[k]; }); } }\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n")], 'GARDE'),
    ("M-FIN1b [deguisee] l'ancien plafond de 200 remis",
     [(CO, "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n", "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  { const _ids=Object.keys(m.seances); if(_ids.length>200){ _ids.sort((a,b)=>(+(m.seances[a].ts)||0)-(+(m.seances[b].ts)||0)).slice(0,_ids.length-200).forEach(k=>{ delete m.seances[k]; }); } }\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n")], 'GARDE'),
    ('M-FIN1c [deguisee] plafond cache a 1000 (invisible a 260 debriefs)',
     [(CO, "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n", "                                      {texte:String(texte).trim(), ts:Date.now(), src:src||''});\n  { const _ids=Object.keys(m.seances); if(_ids.length>1000){ _ids.sort((a,b)=>(+(m.seances[a].ts)||0)-(+(m.seances[b].ts)||0)).slice(0,_ids.length-1000).forEach(k=>{ delete m.seances[k]; }); } }\n  try{ localStorage.setItem(_DBF_TEXTES, JSON.stringify(m)); return true; }catch(e){ return false; }\n}\n")], 'GARDE'),
    ("M-FIN2 suppression inversee : efface le debrief d'une AUTRE seance (la plus recente restante)",
     [(SE, "  if(typeof _dbfOublier==='function') _parties.forEach(s=>_dbfOublier(_dbfCle(s)));\n", "  if(typeof _dbfOublier==='function') S.sessions.slice(0,1).forEach(s=>_dbfOublier(_dbfCle(s)));\n")], 'GARDE'),
    ('M-FIN2b [deguisee] suppression par DATE (toutes les seances du meme jour)',
     [(SE, "  if(typeof _dbfOublier==='function') _parties.forEach(s=>_dbfOublier(_dbfCle(s)));\n", "  if(typeof _dbfOublier==='function') S.sessions.concat(_parties).filter(x=>_parties.some(p=>p.date===x.date)).forEach(s=>_dbfOublier(_dbfCle(s)));\n")], 'GARDE'),
    ("M-FIN2c [deguisee] _dbfOublier efface l'entree ecrite en dernier, pas celle demandee",
     [(CO, '  delete m.seances[k];\n', '  delete m.seances[Object.keys(m.seances).sort((a,b)=>(+m.seances[b].ts||0)-(+m.seances[a].ts||0))[0]];\n')], 'GARDE'),
    ("M-FIN3 la suppression d'une seance ne supprime plus son debrief (orphelin)",
     [(SE, "  if(typeof _dbfOublier==='function') _parties.forEach(s=>_dbfOublier(_dbfCle(s)));\n", '')], 'GARDE'),
    ('M-FIN3b [deguisee] le debrief part mais le jeton reste en file (orphelin recree au Coach)',
     [(CO, '  const l=_dbfLire(), i=l.indexOf(k);\n  if(i>=0){ l.splice(i,1); _dbfEcrire(l); }\n', '  const l=_dbfLire(), i=l.indexOf(k);\n')], 'GARDE'),
    ("M-FIN4 l'ancien filtre PDF remis (coeur -> cur)",
     [(SE, "function _pdfTexte(t){\n  return String(t==null?'':t)\n", "function _pdfTexte(t){\n  return String(t==null?'':t).replace(/[^\\x00-\\xFF’–—…]/g,'');\n  return String(t==null?'':t)\n")], 'GARDE'),
    ('M-FIN4b [deguisee] plus de traduction (-> retire au lieu de traduit)',
     [(SE, '    .replace(_PDF_A_TRADUIRE, c=>_PDF_TRADUIT[c])\n', '')], 'GARDE'),
    ('M-FIN4c [deguisee] aucun filtre (texte brut a jsPDF)',
     [(SE, "function _pdfTexte(t){\n  return String(t==null?'':t)\n", "function _pdfTexte(t){\n  return String(t==null?'':t);\n  return String(t==null?'':t)\n")], 'GARDE'),
    ('M-FIN4d [deguisee] titre du debrief non filtre',
     [(SE, "doc.text(_pdfTexte('Débrief Milo'+(ss.progLabel?' — '+ss.progLabel:'')+(quand?' (séance terminée à '+quand+')':'')),M,y+16);", "doc.text('Débrief Milo'+(ss.progLabel?' — '+ss.progLabel:'')+(quand?' (séance terminée à '+quand+')':''),M,y+16);")], 'GARDE'),
    ("M-FIN4e [deguisee] l'export SANS change (mention des debriefs toujours ecrite)",
     [(SE, "      +(_histoAvecDebriefs?' Débriefs Milo inclus, sous leur séance.':''),M,y); y+=6;", "      +' Débriefs Milo inclus, sous leur séance.',M,y); y+=6;")], 'GARDE'),
    ('M-FIN5 [negatif] commentaires citant les motifs (plafond, delete, ancien filtre)',
     [(CO, '  if(!String(texte).trim()) return false;\n', '  if(!String(texte).trim()) return false;\n  // delete m.seances[k] .slice( .sort( _DBF_TEXTES_MAX=200 : cite, jamais execute\n'), (SE, "function _pdfTexte(t){\n  return String(t==null?'':t)\n", "function _pdfTexte(t){\n  // ancien filtre [^\\x00-\\xFF’–—…] : cite, jamais execute\n  return String(t==null?'':t)\n")], 'OK'),
    ('M-FIN6 [equivalente] hasOwnProperty -> in (meme sens sur un objet de donnees)',
     [(CO, '  if(!Object.prototype.hasOwnProperty.call(m.seances, k)) return false;', '  if(!(k in m.seances)) return false;')], 'OK'),
    ('[negatif] commentaire citant les motifs cherches',
     [(LO, "function _typeStructure(t){", "// _exerciceRemplacant _dbfReponseValide _dbfEnregistrer refAvant premiere complete:false\nfunction _typeStructure(t){")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_session_integrity.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_si01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
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
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
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
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
