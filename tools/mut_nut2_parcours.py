#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUTRITION V2, LES PARCOURS À L'ÉCRAN (jalon 4, 22/10/2026) : le banc
tools/banc_nut2_parcours.js sait-il ROUGIR ?
Chaque mutation casse UNE garantie du branchement, sur une COPIE complète de l'app (jamais le dépôt) ; le banc sert
la copie (NUT2P_RACINE) et doit rougir, sur le témoin attendu. Un plantage (code 2, ou pas de ligne de total) n'est
jamais compté comme « attrapé ». L'arbre sain est rejoué avant ET après.
Usage : python3 tools/mut_nut2_parcours.py"""
import os, re, shutil, subprocess, sys, tarfile, tempfile, io
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join(RACINE, 'tools', 'banc_nut2_parcours.js')
EXCLUS = ('.git', 'audits', 'worktrees', 'node_modules')

MUT = [
  ('MP1 écran : des valeurs SANS poids reçoivent 100 g inventés', 'app.js',
   "  return {ok:false, message:'Combien pesait ce que tu as mangé ? Indique le poids en grammes (ou le volume en ml).'};",
   "  return {ok:true, entree:Object.assign(e, {mode:'declaree', declare:vals, quantite:{val:100, unite:'g'}})};", 'B-NV2P P3 ②'),
  ('MP2 écran : une valeur absente s\'affiche 0', 'app.js',
   "    el.value=(r && r.ok && (c in r.valeurs)) ? r.valeurs[c] : '';", "    el.value=(r && r.ok && (c in r.valeurs)) ? r.valeurs[c] : 0;", 'B-NV2P P4 ①'),
  ('MP3 total : une valeur absente compte pour 0 sans le dire', 'app.js',
   "if(typeof x==='number' && isFinite(x)) t[c]+=x; else manque[c]++;", "if(typeof x==='number' && isFinite(x)) t[c]+=x;", 'B-NV2P P4 ③'),
  ('MP4 reprise : une quantité absente est complétée (100 g)', 'app.js',
   "  if(!R.quantite) return {ok:false, aCompleter:true};", "  if(!R.quantite) R.quantite={val:100, unite:'g'};", 'B-NV2P P8 ②'),
  ('MP5 scan : une boisson redevient une fiche pour 100 g', 'app.js',
   "  if(u==='ml' || u==='cl' || u==='l') return 'ml';", "  if(u==='ml' || u==='cl' || u==='l') return 'g';", 'B-NV2P P5 ①'),
  ('MP6 export : les clés de repas d\'avant (matin, midi, soir)', 'setup.js',
   "  const REPAS = {}; (typeof FOOD_MEALS!=='undefined' ? FOOD_MEALS : []).forEach(m => { REPAS[m.k] = m.lbl; });",
   "  const REPAS = {matin:'Petit-déjeuner', midi:'Déjeuner', soir:'Dîner', collation:'Collation'};", 'B-NV2P P9 ①'),
  ('MP7 modification : la ligne modifiée s\'AJOUTE au lieu de remplacer', 'app.js',
   "  if(entree.remplace){\n    const i=S.foodLog.indexOf(entree.remplace);",
   "  if(false){\n    const i=S.foodLog.indexOf(entree.remplace);", 'B-NV2P P6 ①'),
  ('MP8 modification : une retouche à la main n\'est plus une correction tracée', 'app.js',
   "    else _efCorr[c]={v:v, avant:(c in _efCalc)?_efCalc[c]:null, le:Date.now()};", "    else delete _efCorr[c];", 'B-NV2P P6 ②'),
  ('MP9 ajout rapide : la reprise non vérifiée ne le dit plus', 'app.js',
   "    if(R.statut==='non-verifiee') e.notes=['reprise-non-verifiee'];\n  }\n  return _n2Enregistrer(e, porte);",
   "  }\n  return _n2Enregistrer(e, porte);", 'B-NV2P P7 ①'),
  ('MP10 calcul : l\'écran recalcule lui-même (l\'ancienne formule), sans le moteur', 'app.js',
   "  const _r=(typeof NUT2==='object' && NUT2) ? NUT2.calcule(_n2Fiche(_vals, ref, _u), {val:(v>0? v : ref), unite:_u}) : {ok:false};",
   "  const _f=(v>0? v : ref)/ref, _o={}; Object.keys(_vals).forEach(c=>{ _o[c]=Math.round((+_vals[c]||0)*_f); }); const _r={ok:true, valeurs:_o};",
   'B-NV2P P2 ④'),
  ('MP11 modification : une ancienne ligne modifiée perd sa copie d\'origine', 'app.js',
   "  const base={id:e.id, ts:(typeof e.ts==='number' && isFinite(e.ts)) ? e.ts : Date.now(), date:e.date, repas:_editFoodMeal, nom:nom,\n              remplace:e,",
   "  const base={id:e.id, ts:(typeof e.ts==='number' && isFinite(e.ts)) ? e.ts : Date.now(), date:e.date, repas:_editFoodMeal, nom:nom,\n              remplace:Object.assign({}, e, {n2:{s:1}}),",
   'B-NV2P P6 ③'),
  ('MP12 modification : une quantité absente est remplie à l\'ouverture (déduite des valeurs)', 'app.js',
   "  const val=(q && q.unite===_efUniteDecl) ? q.val : '';", "  const val=(q && q.unite===_efUniteDecl) ? q.val : 100;", 'B-NV2P P6 ④'),
  # Les deux défauts mesurés le 22/10 sur le pont (P11) : chaque correctif retiré doit rougir son témoin.
  ('MP13 la table CIQUAL n\'est plus attendue : une ancienne ligne CIQUAL est « non vérifiée » avant toute recherche', 'app.js',
   "  if(!(lignes||[]).some(_n2BesoinCiqual)) return suite();", "  return suite();", 'B-NV2P P11 ①'),
  ('MP14 reprise figée : une autre quantité passe avec les valeurs de l\'ancienne', 'app.js',
   "    if(R.qte && !_afValeursTapees && !(q.unite===R.qte.unite && q.val===R.qte.val))", "    if(false)", 'B-NV2P P11 ③'),
  ('MP15 reprise figée : retoucher une valeur efface la quantité tapée', 'app.js',
   "  const f=document.getElementById('af-prop'); if(f && garde) f.value=garde;", "  const f=document.getElementById('af-prop');", 'B-NV2P P11 ④'),
]

def copier_app(dest):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w') as tf:
        for nom in os.listdir(RACINE):
            if nom in EXCLUS: continue
            tf.add(os.path.join(RACINE, nom), arcname=nom,
                   filter=lambda ti: None if ti.name.endswith('_nut_reduite.js') else ti)
    buf.seek(0)
    with tarfile.open(fileobj=buf, mode='r') as tf: tf.extractall(dest)

def banc(racine):
    env = dict(os.environ, NUT2P_RACINE=racine)
    p = subprocess.run(['node', BANC], capture_output=True, text=True, timeout=900, env=env, cwd=RACINE)
    s = p.stdout + p.stderr
    total = re.search(r'^(\d+) OK / (\d+) rouge$', s, re.M)
    rouges = re.findall(r'^  !!   (B-NV2P \S+ \S+)', s, re.M)
    return p.returncode, total, rouges, s

tmp = tempfile.mkdtemp(prefix='mutnut2p_')
try:
    sain = os.path.join(tmp, 'sain'); os.makedirs(sain); copier_app(sain)
    code, total, rouges, s = banc(sain)
    print('  arbre sain : %s' % (total.group(0) if total else 'PAS DE TOTAL (code %d)' % code))
    if code != 0 or not total or total.group(2) != '0': print(s[-2500:]); sys.exit(1)
    conformes = 0
    for nom, fic, avant, apres, attendu in MUT:
        d = os.path.join(tmp, 'm'); shutil.rmtree(d, ignore_errors=True); shutil.copytree(sain, d)
        f = os.path.join(d, fic); t = io.open(f, encoding='utf-8').read()
        if t.count(avant) != 1:
            print('  INVALIDE %s — ancre trouvée %d fois' % (nom, t.count(avant))); continue
        io.open(f, 'w', encoding='utf-8').write(t.replace(avant, apres))
        if subprocess.run(['node', '--check', f]).returncode != 0:
            print('  INVALIDE %s — syntaxe cassée' % nom); continue
        code, total, rouges, s = banc(d)
        if code == 2 or not total:
            print('  KO   %s — PLANTAGE (ne compte pas comme attrapé)' % nom); continue
        bon = any(r.startswith(attendu) for r in rouges) and code == 1
        conformes += bon
        print('  %s %s — %d rouge(s), attendu %s : %s' % ('OK  ' if bon else 'KO  ', nom, len(rouges), attendu, ', '.join(rouges) or 'aucun'))
    code, total, rouges, s = banc(sain)
    print('  arbre sain rejoué à la fin : %s' % (total.group(0) if total else 'PAS DE TOTAL'))
    print('%d/%d conformes' % (conformes, len(MUT)))
    sys.exit(0 if conformes == len(MUT) and code == 0 and total and total.group(2) == '0' else 1)
finally:
    shutil.rmtree(tmp, ignore_errors=True)
