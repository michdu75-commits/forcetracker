#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUTRITION V2, LES PARCOURS À L'ÉCRAN (jalon 4, 22/10/2026) : le banc
tools/banc_nut2_parcours.js sait-il ROUGIR ?
Chaque mutation casse UNE garantie du branchement, sur une COPIE complète de l'app (jamais le dépôt) ; le banc sert
la copie (NUT2P_RACINE) et doit rougir, sur le témoin attendu. Un plantage (code 2, ou pas de ligne de total) n'est
jamais compté comme « attrapé ». L'arbre sain est rejoué avant ET après.
Usage : python3 tools/mut_nut2_parcours.py [PREFIXE[,PREFIXE...]]   (sans argument : toutes les mutations)"""
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
   "    if(R.statut==='non-verifiee') e.notes=['reprise-non-verifiee'];\n  }\n  const L=N.ligneNouvelle(e);",
   "  }\n  const L=N.ligneNouvelle(e);", 'B-NV2P P7 ①'),
  ('MP10 calcul : l\'écran recalcule lui-même (l\'ancienne formule), sans le moteur', 'app.js',
   "  const _r=(typeof NUT2==='object' && NUT2) ? NUT2.calcule(_n2Fiche(_vals, ref, _u), {val:(v>0? v : ref), unite:_u}) : {ok:false};",
   "  const _f=(v>0? v : ref)/ref, _o={}; Object.keys(_vals).forEach(c=>{ _o[c]=Math.round((+_vals[c]||0)*_f); }); const _r={ok:true, valeurs:_o};",
   'B-NV2P P2 ④'),
  ('MP11 modification : une ancienne ligne modifiée perd sa copie d\'origine', 'app.js',
   "  const base={id:e.id, ts:Number.isFinite(e.ts) ? e.ts : Date.now(), date:e.date, repas:_editFoodMeal, nom:nom,\n              remplace:e,",
   "  const base={id:e.id, ts:Number.isFinite(e.ts) ? e.ts : Date.now(), date:e.date, repas:_editFoodMeal, nom:nom,\n              remplace:Object.assign({}, e, {n2:{s:1}}),",
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
  # P12 — les portes jumelles des reprises (D-101 ⑩) : chaque garantie retirée doit rougir son témoin.
  ('MP16 jumelles : le repas habituel écrit une AUTRE provenance que « + Ajouter »', 'app.js',
   "           origine:{saisie:'liste', origine:'reprise'}, quantite:Object.assign({}, R.quantite, {origine:'proposee'})};",
   "           origine:{saisie:'liste', origine:(porte==='rejouerRepas')?'utilisateur':'reprise'}, quantite:Object.assign({}, R.quantite, {origine:'proposee'})};",
   'B-NV2P P12 ①'),
  ('MP17 M1 : une ligne NON vérifiée devient une fiche (son pour-100 g et son code-barres repris)', 'app.js',
   "  if(R.fiche){\n    e.mode='pesee'; e.fiche=R.fiche;",
   "  if(R.fiche || (src && src.per100 && (R.fiche={base:'g', p100:src.per100, cle:src.sourceId||null, source:'utilisateur', fiab:'declaree'}))){\n    e.mode='pesee'; e.fiche=R.fiche;",
   'B-NV2P P12 ②'),
  ('MP18 D-099 : une reprise en portions devient des grammes', 'app.js',
   "           origine:{saisie:'liste', origine:'reprise'}, quantite:Object.assign({}, R.quantite, {origine:'proposee'})};",
   "           origine:{saisie:'liste', origine:'reprise'}, quantite:(R.quantite.unite==='portion')?{val:R.quantite.val*R.quantite.portion.poids, unite:'g', origine:'proposee'}:Object.assign({}, R.quantite, {origine:'proposee'})};",
   'B-NV2P P12 ③'),
  ('MP19 D-099 : des ml repris deviennent des grammes (« 1 ml = 1 g »)', 'app.js',
   "           origine:{saisie:'liste', origine:'reprise'}, quantite:Object.assign({}, R.quantite, {origine:'proposee'})};",
   "           origine:{saisie:'liste', origine:'reprise'}, quantite:(R.quantite.unite==='ml')?{val:R.quantite.val, unite:'g', origine:'proposee'}:Object.assign({}, R.quantite, {origine:'proposee'})};",
   'B-NV2P P12 ③'),
  ('MP20 jumelles à l\'écran : la recherche du journal reprend SANS la quantité d\'avant', 'app.js',
   "    if(!_n2Reprendre(e, 'historique')) return;",
   "    if(!_n2Reprendre(Object.assign({}, e, {q:null}), 'historique')) return;",
   'B-NV2P P12 ⑥'),
  ('MP21 fiche V2 reprise : la quantité d\'avant n\'est plus proposée', 'app.js',
   "    _bcProposerDerniere(qDer, (qDer>0 && q.unite==='portion') ? q : null);", "    _bcProposerDerniere(0);", 'B-NV2P P12 ⑦'),
  ('MP22 une ligne V2 reprise perd son code-barres (la fiche ne le porte plus)', 'app.js',
   "    e.mode='pesee'; e.fiche=R.fiche;", "    e.mode='pesee'; e.fiche=Object.assign({}, R.fiche, {cle:null, etat:null});",
   'B-NV2P P12 ④'),
  # P13 — les correctifs trouvés en révisant les témoins V1 (22/10) : chacun retiré doit rougir SON témoin.
  ('MP23 « Modifier » : une autre quantité passe avec les valeurs notées pour l\'ancienne (D-101 ⑧, la jumelle)', 'app.js',
   "    if(q0 && !_efValeursTapees && !(q.unite===q0.unite && q.val===q0.val",
   "    if(false && q0 && !_efValeursTapees && !(q.unite===q0.unite && q.val===q0.val", 'B-NV2P P13 ①'),
  ('MP24 « Mettre X kcal » dans « Modifier » ne passe plus par la saisie : l\'écran dit X, la ligne garde la frappe', 'app.js',
   "  if(el) _efSaisieValeur(el); else _efCoherence();", "  _efCoherence();", 'B-NV2P P13 ③'),
  ('MP25 « Modifier » : la quantité tapée ne relance plus le contrôle', 'app.js',
   '" oninput="_efCoherence()"', '"', 'B-NV2P P13 ④'),
  ('MP26 le contrôle de masse redevient aveugle à la quantité de « Modifier » (ef-q)', 'app.js',
   "  if(pfx==='ef' && typeof _efUniteDecl!=='undefined' && _efUniteDecl==='g'){ const d=lu('q'); if(d>0) return d; }", "", 'B-NV2P P13 ④'),
  ('MP27 reprise figée : la pastille pose la quantité SANS le contrôle (ft-v1104 rouvert)', 'app.js',
   "  _afCoherence();\n}\nfunction _afPrendreFige(){", "}\nfunction _afPrendreFige(){", 'B-NV2P P13 ⑤'),
  ('MP28 portions : le poids d\'avant survit quand l\'écran devient « 1 portion » de ce qui en valait deux', 'app.js',
   "  if(relit){ if(_afPortions!==1) _afPortionPoids=0; _afPortions=1; _afPortionPose=false; }",
   "  if(relit){ _afPortions=1; _afPortionPose=false; }", 'B-NV2P P13 ⑥'),
  ('MP29 reprise figée redimensionnée par `_afApplyProp`', 'app.js',
   "  if(!_afRef || _afRef.fige) return;\n  _qtyRescale('af', _afRef.base, _afRef.q, (document.getElementById('af-prop')||{}).value);",
   "  if(!_afRef) return;\n  _qtyRescale('af', _afRef.base, _afRef.q, (document.getElementById('af-prop')||{}).value);", 'B-NV2P P13 ⑦'),
  ('MP30 reprise figée redimensionnée par `_afProp`', 'app.js',
   "  if(!_afRef || _afRef.fige) return;   // 🥗⛔ une reprise figée n'est jamais recalculée (voir `_afApplyProp`)",
   "  if(!_afRef) return;", 'B-NV2P P13 ⑦'),
  ('MP31 un code-barres lu sans origine dite reprend l\'ancien « scan » (refusé par le moteur)', 'app.js',
   "  _offRemplirFormulaire(p, ean, saisie||'camera-code-local', codeDouteux===true);",
   "  _offRemplirFormulaire(p, ean, saisie||'scan', codeDouteux===true);", 'B-NV2P P13 ⑧'),
  ('MP32 « Modifier » sans geste : la quantité DÉCLARÉE devient « tapée »', 'app.js',
   "  const origine=(q0 && q0.unite===u && q0.val===v) ? ((e && e.n2 && e.n2.qo) || 'proposee') : 'tapee';",
   "  const origine='tapee';", 'B-NV2P P13 ⑨'),
  ('MP33 « Modifier » sans geste : les portions d\'une ligne à fiche deviennent « tapées »', 'app.js',
   "origine:(q.val===n) ? ((e && e.n2 && e.n2.qo) || 'proposee') : 'tapee',", "origine:'tapee',", 'B-NV2P P13 ⑨'),
  # Venues du contrôle négatif des témoins de la passe (tools/mut_temoins_v2.py, 22/10) : AUCUN témoin de la passe ne les
  # voyait — l'origine d'une reprise à l'écran n'y est pas lue, et le garde de l'onglet portions n'y est jamais SEUL.
  ('MP34 reprise figée à l\'écran : l\'origine n\'est plus « reprise » (D-101 ⑩, n°4)', 'app.js',
   "    _afSetSrc({saisie:saisie, origine:'reprise'});\n    _afRef={base:R.valeurs",
   "    _afSetSrc({saisie:saisie, origine:'utilisateur'});\n    _afRef={base:R.valeurs", 'B-NV2P P12 ⑥'),
  ('MP35 retour à l\'onglet portions (×1) : l\'ancien poids d\'une portion se recolle en silence (D-101 ⑬)', 'app.js',
   "  if(_afUnite==='portion' && _uAvant!=='portion') _afPortionPoids=0;", "", 'B-NV2P P13 ⑪'),
  # ── D-103 (Michel, 22/10, tranche D-101 ⑯) : « 3 portions (450 g) » si le poids est fiable, sans grammes sinon ──
  ('MP36 D-103 : la parenthèse redonne le poids d\'UNE portion au lieu du TOTAL', 'app.js',
   "_n2PortionsMot(q.val)+' ('+_nbFR(q.val*p.poids)+' '+p.unite+')'", "_n2PortionsMot(q.val)+' ('+_nbFR(p.poids)+' '+p.unite+')'", 'B-NV2P P14 ①'),
  ('MP37 D-103 : une portion au poids NON fiable affiche quand même ses grammes', 'app.js',
   "  return (fiable && p && +p.poids>0) ?", "  return (p && +p.poids>0) ?", 'B-NV2P P14 ②'),
  ('MP38 D-103 : la fiabilité ne vérifie plus que la fiche redonne les valeurs (favori réécrit)', 'app.js',
   "  return NUT2.CHAMPS.every(k=>corr.indexOf(k)>=0\n", "  return true || NUT2.CHAMPS.every(k=>corr.indexOf(k)>=0\n", 'B-NV2P P14 ⑧'),
  ('MP39 D-103 : une valeur corrigée à la main rend la portion « non fiable »', 'app.js',
   "  return NUT2.CHAMPS.every(k=>corr.indexOf(k)>=0\n", "  return NUT2.CHAMPS.every(k=>false\n", 'B-NV2P P14 ①'),
  ('MP40 D-103 : la pastille prise telle quelle redevient des GRAMMES (la forme se perd)', 'app.js',
   "    const P=_bcPortionPrise, prise=!!(P && _bcQtyOrigine==='proposee' && v===P.masse);", "    const P=_bcPortionPrise, prise=false;", 'B-NV2P P14 ④'),
  ('MP41 D-103 : un champ RETOUCHÉ reste « les portions de la dernière fois »', 'app.js',
   "    const P=_bcPortionPrise, prise=!!(P && _bcQtyOrigine==='proposee' && v===P.masse);", "    const P=_bcPortionPrise, prise=!!(P);", 'B-NV2P P14 ⑥'),
  ('MP42 D-103 : la pastille « la dernière fois » PRÉ-REMPLIT le champ (D-101 ①)', 'app.js',
   "  if(g) g.value='';                       // ⛔ rien de pré-rempli : la personne choisit\n  /* La masse",
   "  if(g) g.value=String(+q);\n  /* La masse", 'B-NV2P P14 ③'),
  ('MP43 D-103 : « Modifier » ne suit plus le nombre de portions tapé', 'app.js',
   "    if(pq) pq.innerHTML=", "    if(false) pq.innerHTML=", 'B-NV2P P14 ⑪'),
  ('MP44 D-103 : « Modifier » affirme le poids noté d\'une ancienne ligne', 'app.js',
   "  if(!(n>0) || !_n2PortionFiable(_efR)) return nom+' — poids non vérifié.';", "  if(!(n>0)) return nom+' ('+_nbFR(p.poids)+' '+p.unite+').';", 'B-NV2P P14 ⑫'),
  ('MP45 D-103 : l\'onglet portions ne dit plus le total', 'app.js',
   "  const qte = _n2QteTexte({val:q, unite:'portion', portion:{poids:p, unite:'g'}}, p>0);",
   "  const qte = _n2QteTexte({val:q, unite:'portion', portion:{poids:p, unite:'g'}}, false);", 'B-NV2P P14 ⑬'),
  ('MP46 D-103 : « 1,5 portions » (le pluriel avant 2)', 'app.js',
   "((+n>=2)?'portions':'portion')", "((+n!==1)?'portions':'portion')", 'B-NV2P P14 ①'),
  ('MP47 D-103 : le total sous le champ ne dit plus les portions prises', 'app.js',
   "  const P=_bcPortionPrise, qte=(P && _bcQtyOrigine==='proposee'", "  const P=null, qte=(P && _bcQtyOrigine==='proposee'", 'B-NV2P P14 ④'),
  ('MP48 D-103 : une reprise FIGÉE affirme le poids d\'une ancienne portion', 'app.js',
   "  const qTxt=_escFood(_n2QteTexte(q, false));", "  const qTxt=_escFood(_n2QteTexte(q, true));", 'B-NV2P P14 ⑨'),
  ('MP49 D-103 : le refus d\'une autre quantité affirme le poids d\'une ancienne portion', 'app.js',
   "'Ces valeurs valent pour '+_n2QteTexte(R.qte, false)+' : corrige-les", "'Ces valeurs valent pour '+_n2QteTexte(R.qte, true)+' : corrige-les", 'B-NV2P P14 ⑩'),
  ('MP50 D-103 : la liste « Mes aliments » affirme le poids de toute portion', 'app.js',
   "  return _escFood(_n2QteTexte(q, _n2PortionFiable(R)))+' · ';", "  return _escFood(_n2QteTexte(q, true))+' · ';", 'B-NV2P P14 ②'),
  # ── la relecture adverse du 22/10 : un témoin, et sa mutation, pour chaque trou trouvé ──
  ('MP51 la portion proposée pour un aliment survit et s\'applique à l\'aliment SUIVANT (M6)', 'app.js',
   "  _bcDernPortion=null; _bcPortionPrise=null;", "  _bcPortionPrise=null;", 'B-NV2P P14 ⑯'),
  ('MP52 la MÊME masse retapée reste « les portions de la dernière fois » (l\'origine ignorée)', 'app.js',
   "prise=!!(P && _bcQtyOrigine==='proposee' && v===P.masse);", "prise=!!(P && v===P.masse);", 'B-NV2P P14 ⑥b'),
  ('MP53 le total sous le champ dit les portions pour une masse retapée', 'app.js',
   "qte=(P && _bcQtyOrigine==='proposee' && Math.round(g*10)/10===P.masse)", "qte=(P && Math.round(g*10)/10===P.masse)", 'B-NV2P P14 ⑥b'),
  ('MP54 la reprise à l\'écran perd les corrections de la ligne (360 au lieu de 300)', 'app.js',
   "    _afCorr={}; (R.corrections||[]).forEach(x=>{ if(R.valeurs[x.c]===x.v) _afCorr[x.c]={v:x.v, avant:x.avant, le:x.le}; });",
   "    _afCorr={};", 'B-NV2P P14 ⑤b'),
  ('MP55 un favori par l\'étoile perd les corrections de sa ligne', 'app.js',
   "      if(Array.isArray(s.n2.corr) && s.n2.corr.length) n2.corr=JSON.parse(JSON.stringify(s.n2.corr));\n", "", 'B-NV2P P14 ⑱'),
  ('MP56 la pastille prise redéfinit le favori du même nom (ft-v1186 ⑤ sans définition donnée)', 'app.js',
   "  if(!_en.pastillePortions) _majDefFavori(_e);", "  _majDefFavori(_e);", 'B-NV2P P14 ⑲'),
  ('MP57 le refus de « Modifier » affirme le poids d\'une ancienne portion', 'app.js',
   "_n2QteTexte(q0, _n2PortionFiable(R))", "_n2QteTexte(q0, true)", 'B-NV2P P14 ⑫b'),
  ('MP58 « Modifier » : champ vidé, la quantité dite garde le dernier nombre tapé', 'app.js',
   "    if(pq) pq.innerHTML='<b>'+_escFood(_n2QteTexte({val:nq,", "    if(pq && n>0) pq.innerHTML='<b>'+_escFood(_n2QteTexte({val:n,", 'B-NV2P P14 ⑪'),
  ('MP59 le message de reprise montre une pastille absente', 'app.js',
   "(pas?'touche la pastille ou tape-la':'tape-la')", "('touche la pastille ou tape-la')", 'B-NV2P P14 ⑧b'),
  ('MP60 la masse des portions n\'est plus posée au dixième (99.89999999999999)', 'app.js',
   "  const v=portion ? Math.round(+q*10)/10 : +q;", "  const v=+q;", 'B-NV2P P14 ⑰'),
  ('MP61 l\'écran calcule sur le champ arrondi, la ligne sur la masse exacte', 'app.js',
   "  const saisie=(P && _bcQtyOrigine==='proposee' && numFR(s)===P.masse) ? P.q.val*P.q.portion.poids : s;", "  const saisie=s;", 'B-NV2P P14 ⑰'),
  # ── P15 — L'INCIDENT DU 23/10 : chaque garantie du correctif retirée doit rougir SON témoin ──
  ('MP62 identité : le code-barres ne compte plus, le NOM redevient l\'identité', 'app.js',
   "  return s ? 'id:'+s : 'nom:'+(norm ? norm(n) : n.trim().toLowerCase());",
   "  return 'nom:'+(norm ? norm(n) : n.trim().toLowerCase());", 'B-NV2P P15 ⑯'),
  ('MP63 « Mes aliments » : une référence vérifiée est cachée derrière une copie du même produit', 'app.js',
   "    if((k in vus) && !v) continue;         // déjà listé, et celle-ci n'est pas plus fiable",
   "    if(k in vus) continue;", 'B-NV2P P15 ①'),
  ('MP64 la liste ne dit plus l\'état d\'une référence (« à vérifier », « non vérifié »)', 'app.js',
   "function _n2Marque(a){ return (!a || !a.ok) ? '' : (a.raison ? ' · ⚠️ à vérifier' : _n2Badge(a.ligne)); }",
   "function _n2Marque(a){ return ''; }", 'B-NV2P P15 ②'),
  ('MP65 une référence incohérente est re-notée en silence', 'app.js',
   "  if(raison) return {ok:false, incoherente:true, raison:raison};\n", "", 'B-NV2P P15 ⑥'),
  ('MP66 « périmé » : un favori dont la fiche ne redonne plus les valeurs passe pour cohérent (400 / 480)', 'app.js',
   "    return d ? {code:'perime', texte:'ses valeurs enregistrées ne correspondent plus à sa fiche pour '+qt} : null;",
   "    return null;", 'B-NV2P P15 ㉖'),
  ('MP67 « fiche » : des valeurs qui contredisent leur pour-100 g passent pour cohérentes (26 g au lieu de 35)', 'app.js',
   "  if(src && src.per100 && typeof src.per100==='object' && ecart(src.per100))",
   "  if(false)", 'B-NV2P P15 ⑥'),
  ('MP68 « diffère » : la fiche vérifiée du même code-barres n\'est plus consultée', 'app.js',
   "  if(fv && fv.id!==src.id && N.calcule(fv.fiche, q).ok && ecart(fv.fiche.p100))",
   "  if(false)", 'B-NV2P P15 ⑦'),
  ('MP69 « impossible » : 28 g de macros dans 5 g passent pour cohérents (M6)', 'app.js',
   "  if(mG>0 && (_masseImpossibleVals(mG, v.prot, v.carbs, v.fat) || _kcalImpossibleVals(mG, v.kcal, v.prot, v.carbs, v.fat)))",
   "  if(false)", 'B-NV2P P15 ㉜b'),
  ('MP70 « Déjà noté par toi » : une proposition par NOM (de deux produits, un seul)', 'app.js',
   "    const k=_n2Cle(e, _afNorm); if(vus[k]===true) return;",
   "    const k='nom:'+cle; if(vus[k]===true) return;", 'B-NV2P P15 ⑰'),
  ('MP71 « Déjà noté par toi » : la ligne vérifiée est cachée derrière la copie plus récente', 'app.js',
   "    if((k in vus) && !v) return;\n    vus[k]=v; out.push(e);",
   "    if(k in vus) return;\n    vus[k]=v; out.push(e);", 'B-NV2P P15 ③'),
  ('MP72 l\'étoile retire le favori du MÊME NOM (l\'ancien comportement)', 'app.js',
   "  if(it.fav){\n    let idx=S.savedFoods.indexOf(it._src);",
   "  { const _k=String(it.name||'').toLowerCase(), _i=S.savedFoods.findIndex(f=>String(f.name||'').toLowerCase()===_k); if(!it.fav && _i>=0){ S.savedFoods.splice(_i,1); persist(); _renderFoodQuickList(); return; } }\n  if(it.fav){\n    let idx=S.savedFoods.indexOf(it._src);",
   'B-NV2P P15 ⑩'),
  ('MP73 ft-v1186 ⑤ redéfinit le favori d\'un AUTRE produit du même nom', 'app.js',
   "    const memes=S.savedFoods.filter(x=>_n2Cle(x)===k);",
   "    const memes=S.savedFoods.filter(x=>String(x.name||'').toLowerCase()===String(e.name||'').toLowerCase());", 'B-NV2P P15 ⑲'),
  ('MP74 « ✕ » masque par le NOM (le scan juste disparaît avec le favori faux)', 'app.js',
   "    const cle=_n2Cle(it._src||it).toLowerCase();",
   "    const cle=String(it.name||'').toLowerCase();", 'B-NV2P P15 ⑬'),
  ('MP75 « ✕ » retire TOUS les favoris du même nom', 'app.js',
   "    if(it.fav){ const fs=S.savedFoods||[]; let j=fs.indexOf(it._src);",
   "    if(it.fav){ S.savedFoods=(S.savedFoods||[]).filter(f=>String(f.name||'').toLowerCase()!==String(it.name||'').toLowerCase()); } if(false){ const fs=S.savedFoods||[]; let j=fs.indexOf(it._src);",
   'B-NV2P P15 ⑫'),
  ('MP76 une valeur INCONNUE devient 0 dans un favori (et dans ce qu\'il écrit)', 'app.js',
   "  _N2_CHAMPS.forEach(c => { const x = s[c]; if (typeof x === 'number' && isFinite(x) && x >= 0) o[c] = x; });",
   "  _N2_CHAMPS.forEach(c => { const x = s[c]; o[c] = (typeof x === 'number' && isFinite(x) && x >= 0) ? x : 0; });", 'B-NV2P P15 ㉙'),
  ('MP77 la carte d\'une habitude compte ce qui ne s\'écrira pas (et ne le dit pas)', 'app.js',
   "    if(a.raison){ o.aVerifier++; return; }\n    o.n++;", "    o.n++;", 'B-NV2P P15 ⑤'),
  ('MP78 « Tes repas habituels » ne nomme plus ce qu\'il n\'a pas recopié', 'app.js',
   "          +(aVerifier.length?' · à vérifier (ses valeurs se contredisent, rien de recopié) : '+aVerifier.map(court).join(', '):'')\n", "", 'B-NV2P P15 ④'),
  ('MP79 « + Ajouter » sur une référence incohérente n\'ouvre plus l\'écran (ni ne le dit)', 'app.js',
   "    if(!r.ok && r.incoherente){\n      quickFillFood(i);",
   "    if(!r.ok && r.incoherente){ return; }\n    if(false){\n      quickFillFood(i);", 'B-NV2P P15 ⑥'),
  ('MP80 une ligne recopiée d\'une référence non vérifiée se dit « déclaré »', 'app.js',
   "  if(Array.isArray(n2.no) && n2.no.indexOf('reprise-non-verifiee')>=0) m.push('non vérifié');\n  else if(n2.st==='estimee')",
   "  if(n2.st==='estimee')", 'B-NV2P P15 ㉙'),
  ('MP81 « Déjà noté par toi » redevient muet (sans quantité, inconnu = 0, sans état)', 'app.js',
   "      _n2QteListe({_src:e, _ap:a})+_n2Val(e.kcal)+' kcal · P '+_n2Val(e.prot)+' · G '+_n2Val(e.carbs)+' · L '+_n2Val(e.fat)+_n2Marque(a),",
   "      (e.kcal||0)+' kcal · P '+(e.prot||0)+' · G '+(e.carbs||0)+' · L '+(e.fat||0),", 'B-NV2P P15 ③'),
  ('MP82 l\'écran d\'une reprise figée ne dit plus pourquoi elle est « à vérifier »', 'app.js',
   "            raison:_n2Incoherence(src, R, null)};", "            raison:null};", 'B-NV2P P15 ⑥'),
  ('MP83 l\'écran d\'une fiche périmée ne dit plus pourquoi elle est « à vérifier »', 'app.js',
   "      +((apR.ok && apR.raison) ? ' — ⚠️ à vérifier : '+apR.raison.texte : '');", "      +'';", 'B-NV2P P15 ㉖'),
  ('MP84 la 2ᵉ modification perd la copie d\'origine (moteur, vu à l\'écran)', 'nutrition-v2.js',
   "        else if (rp.n2.av && typeof rp.n2.av === 'object') av = JSON.parse(JSON.stringify(rp.n2.av));\n", "\n", 'B-NV2P P15 ㉘'),
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
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f + ' ') for f in filtres)]
    for nom, fic, avant, apres, attendu in choisies:
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
    print('%d/%d conformes' % (conformes, len(choisies)))
    sys.exit(0 if choisies and conformes == len(choisies) and code == 0 and total and total.group(2) == '0' else 1)
finally:
    shutil.rmtree(tmp, ignore_errors=True)
