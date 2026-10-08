#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 1 IMPORT, FERMETURE DE SURETE (session-B, 07/10/2026) : les temoins SAFE-L1 savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. M00 = le CODE D'AVANT (36200085, HEAD de cloture du Lot 1)
avec les temoins d'aujourd'hui ; M00b = le code de 19db28b5 (fermeture de surete, AVANT la fermeture du P2 de la
contre-verification, 08/10). Chaque mutation retire UNE protection ; plusieurs sont deguisees (le code a l'air raisonnable).
Usage : python3 tools/mut_import_prog_surete.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('log.js', 'state.js', 'setup.js', 'coach.js')
LO, ST, SE, CO = 'log.js', 'state.js', 'setup.js', 'coach.js'
BASES = ('36200085', '19db28b5')

MUT = [
    ('M00 le code d\'avant (36200085) avec les temoins d\'aujourd\'hui', 'AVANT:36200085', 'GARDE'),
    ('M00b le code de 19db28b5 (avant la fermeture du P2) avec les temoins d\'aujourd\'hui', 'AVANT:19db28b5', 'GARDE'),
    # ── la portee du document d'import ──
    ('S01 la portee ignore le compte (tout le monde partage « local »)',
     [(LO, "  return e?('compte:'+e):'local';", "  return 'local';")], 'GARDE'),
    ('S02 la reprise lit TOUS les documents (plus de filtre de portee)',
     [(LO, "return ((await _impDbFaire('readonly',st=>st.getAll()))||[]).filter(x=>x&&x.scope===sc);", "return ((await _impDbFaire('readonly',st=>st.getAll()))||[]);")], 'GARDE'),
    ('S03 l\'effacement ne verifie plus la portee',
     [(LO, "if(x&&x.scope===sc){ st.delete(id); fait=true; }", "if(x){ st.delete(id); fait=true; }")], 'GARDE'),
    ('S04 [deguisee] le scan est lache a l\'ouverture, mais l\'ecriture ne verifie plus la portee',
     [(LO, "  if(_impDoc.scope!==sc) return Promise.resolve(false);\n", ""),
      (LO, "if(!x||x.scope===sc){ st.put(rec); ecrit=true; }", "{ st.put(rec); ecrit=true; }")], 'GARDE'),
    ('S05 le scan d\'un autre compte reste montre a l\'ouverture',
     [(LO, "  if(_scanEnCours(_impPhotos,_impExtracted) && _impDoc && _impDoc.scope!==_impScope()) impRecommencer(true);", "")], 'GARDE'),
    ('S06 une restauration ATTENDUE ouvre la base (le cookie redevient une preuve)',
     [(LO, "  try{ if(typeof _restauAttendue==='function'&&_restauAttendue()) return null; }catch(e){ return null; }\n", "")], 'GARDE'),
    ('S07 la demo a une portee (lecture / ecriture de la vraie base)',
     [(LO, "  if(typeof window!=='undefined'&&window._demoMode) return null;\n  try{ if(typeof _restauAttendue", "  try{ if(typeof _restauAttendue")], 'GARDE'),
    # ── le stockage plein ──
    ('S08 _progSauver ne verifie plus rien (persist puis « reussi »)',
     [(LO, "    try{ localStorage.setItem(k,v); ok=(localStorage.getItem(k)===v); }catch(e){ ok=false; }", "    try{ localStorage.setItem(k,v); }catch(e){}")], 'GARDE'),
    ('S09 echec annonce, mais la memoire n\'est pas ramenee au disque',
     [(LO, "    _progRetourDisque(); return false;\n  }", "    return false;\n  }")], 'GARDE'),
    ('S10 [deguisee] persist AVANT la verification (le repli des 50 seances se declenche)',
     [(LO, "  const ecrire=[['ft4_progs',JSON.stringify(S.programmes||[])]].concat(extras||[]);",
           "  persist();\n  const ecrire=[['ft4_progs',JSON.stringify(S.programmes||[])]].concat(extras||[]);")], 'GARDE'),
    ('S11 la synchro envoie les programmes de la MEMOIRE',
     [(SE, "      programmes:_progsAEnvoyer,", "      programmes:S.programmes||[],")], 'GARDE'),
    ('S12 l\'import en echec marque quand meme le document « importe »',
     [(LO, "    S.customExercises=persoAvant;\n", "    S.customExercises=persoAvant; if(_impDoc){ _impDoc.state='imported'; _impDocSauver(); }\n")], 'GARDE'),
    ('S13 l\'import en echec laisse ses exercices perso',
     [(LO, "    S.customExercises=persoAvant;\n", "")], 'GARDE'),
    ('S14 Milo affiche « Enregistre » sans verifier',
     [(CO, "    if(!_progSauver()){ if(typeof _progEchecStockage==='function')_progEchecStockage(); return; }", "    _progSauver();")], 'GARDE'),
    ('S15 l\'editeur se ferme et annonce le succes sans verifier',
     [(LO, "  if(!_progSauver()){ _progEchecStockage('Tes modifications sont encore", "  if(false){ _progEchecStockage('Tes modifications sont encore")], 'GARDE'),
    ('S16 le bouton Restaurer annonce le succes sans verifier',
     [(LO, "  if(n) _progAnnoncer('Version '+(parseInt(version)||0)+' restaur", "  if(true) _progAnnoncer('Version '+(parseInt(version)||0)+' restaur")], 'GARDE'),
    ('S17 « Sauvegarder comme programme » (nouveau) ignore l\'echec',
     [(LO, "  if(!_progSauver()){ _progEchecStockage(); renderProgModal(); return null; }", "  _progSauver();")], 'GARDE'),
    ('S18 [deguisee] la migration de noms du catalogue reecrit aussi les versions archivees',
     [(ST, "(p.days||[]).forEach(d=>((d&&d.exs)||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);}));});",
           "(p.days||[]).forEach(d=>((d&&d.exs)||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);}));(p.previousVersions||[]).forEach(v=>{const c=v&&v.content;if(!c)return;(c.exs||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);});});});")], 'GARDE'),
    # ── le cas limite (contre-verification de 19db28b5, P2) ──
    ('S19 l\'import n\'ecrit plus son exercice perso AVEC le programme (pre-ecriture retiree)',
     [(LO, "  if(!_progSauver(toCreate.length?[['ft4_cuex',JSON.stringify(S.customExercises||[])]]:null)){", "  if(!_progSauver()){")], 'GARDE'),
    ('S20 [deguisee] pre-ecriture sans remise en place des cles deja ecrites',
     [(LO, "    for(let i=remettre.length-1;i>=0;i--){\n      try{ if(remettre[i][1]===null) localStorage.removeItem(remettre[i][0]); else localStorage.setItem(remettre[i][0],remettre[i][1]); }catch(e){}\n    }\n", "")], 'GARDE'),
    ('S21 le repli de persist pendant l\'operation n\'est pas retenu',
     [(LO, "  if(typeof _persistReplis==='number'&&_persistReplis!==replis) _progAlerte=_progAlerteTexte();\n", "")], 'GARDE'),
    ('S22 _progAnnoncer affiche le succes meme apres l\'alerte',
     [(LO, "  if(!a){ toast(msg,type); return; }", "  if(true){ toast(msg,type); return; }")], 'GARDE'),
    ('S23 le compteur de replis n\'est jamais incremente (state.js)',
     [(ST, "      _persistReplis++;\n", "")], 'GARDE'),
    ('S24 l\'import annonce son succes par un toast direct',
     [(LO, "  _progAnnoncer(txt,'success');", "  toast(txt,'success');")], 'GARDE'),
    ('S25 [deguisee] l\'alerte promet la sauvegarde en ligne meme sans compte',
     [(LO, "    +((typeof S!=='undefined'&&S&&S.email)", "    +((true)")], 'GARDE'),
    ('S26 « Importer » ne verifie plus le compte du scan',
     [(LO, "  if(_impDoc&&_impDoc.scope!==_impScope()){\n    toast('⚠️ Le compte a chang", "  if(false){\n    toast('⚠️ Le compte a chang")], 'GARDE'),
    ('S27 [deguisee] « Importer » ne refuse qu\'un document SANS portee',
     [(LO, "  if(_impDoc&&_impDoc.scope!==_impScope()){\n    toast('⚠️ Le compte a chang", "  if(_impDoc&&!_impDoc.scope){\n    toast('⚠️ Le compte a chang")], 'GARDE'),
    ('S28 le programme debutant n\'ecrit plus son parcours AVEC le programme',
     [(LO, "  if(!_progSauver(S.beginnerJourney!==parcoursAvant?[['ft4_bjourney',JSON.stringify(S.beginnerJourney||null)]]:null)){", "  if(!_progSauver()){")], 'GARDE'),
    ('S29 [deguisee] la boucle d\'ecriture ne s\'arrete pas au premier refus',
     [(LO, "  for(let i=0;i<ecrire.length&&ok;i++){", "  for(let i=0;i<ecrire.length;i++){")], 'GARDE'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_import_prog_surete.js'], cwd=arbre, capture_output=True, text=True, timeout=2400,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_l1s_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avants = {}
    for base in BASES:
        avants[base] = {}
        for f in FICHIERS:
            try:
                avants[base][f] = subprocess.run(['git', 'show', base + ':' + f], cwd=SRC, capture_output=True, text=True, check=True).stdout
            except Exception:
                avants[base][f] = ''
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
        if isinstance(remplacements, str) and remplacements.startswith('AVANT:'):
            avant = avants[remplacements.split(':', 1)[1]]
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
            for r in rouges:
                print('        ' + r)
        sys.stdout.flush()
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
