#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION V2 · FIABILITE DES DONNEES (mission P1 de Michel, 24/10/2026) : le banc B-NFIAB sait-il
ROUGIR, et au BON endroit ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation REINTRODUIT un defaut corrige (ou en invente un
     que la correction interdit) dans une COPIE ; le banc `tools/banc_nut_fiabilite.js` y est rejoue sur la seule partie visee
     (`NUTF_PARTIE` : ecran, identite ou croise), avec `NUTF_RACINE` = la copie.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (sinon le controle est refuse).
Une mutation GARDE est conforme si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges : un rouge
ailleurs ne prouve pas que le bon temoin mord. Une mutation OK (commentaire) est conforme si le banc reste vert.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout, AVANT le premier banc.
Usage : python3 tools/mut_nut_fiabilite.py [prefixe]      (les copies vont dans $TMPDIR)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A, ST, SE, CJ, N2, B = 'app.js', 'state.js', 'setup.js', 'Code.js', 'nutrition-v2.js', 'tests/parcours/nut_fiabilite.js'
SC = 'screens.js'

E = lambda *c: ['B-NFIAB ' + x for x in c]       # partie ecran
X = lambda *c: ['B-NFIAB-X ' + x for x in c]     # partie croisee (vrai Code.js en local)
I = lambda *c: ['B-NIDT ' + x for x in c]       # partie identite (NIDT, 27/10) : reutiliser un ancien aliment sans perdre ni inventer son identite

REPRISE = "  if(!R0 || !R0.ok || (R0.fiche && !choix)) return R0;\n"   # NIDT (27/10) : la fonction a gagne un 3e parametre (le choix de la personne)
ENLIGNE = "async function _n2RetrouverEnLigne(ean, jeton, saisie, qDer, nom, uDer, vAnc){\n  if(typeof _offFetchProduct!=='function') return false;\n"
PERIME = "  if(jeton!==_n2RechJeton || (ov && !ov.classList.contains('open')) || _afNomCourant()!==String(nom||'').trim()) return false;\n"
ISSUES = r"""[['🔎 Retrouver l\'aliment','_n2RetrouverRecherche()'],['📷 Scanner le code-barres','scanBarcode()'],['🏷️ Saisir l\'étiquette (pour 100 g)','_n2EtiquetteFige()']]"""
CONTR = "function _n2Contradiction(src, v, vf){\n"
DEJA = "    if(!_n2Propose(e, e.ts)) return;\n"
SID = "      if (texte(e.cle)) L.sourceId = texte(e.cle).slice(0, 32);\n"
KCAL = "  return _per100d1(n['energy-kcal_100g']||(n['energy_100g']?n['energy_100g']/4.184:0)||0);"
ORDRE = "  return f(v.kcal)+' kcal · '+pour+' · P '+f(v.prot)+' · G '+f(v.carbs)+' · L '+f(v.fat);"
DECIM = "(ref ? _nbFR(+x) : String(x))"
FAVBTN = "function _afFavMontrer(){ const b=document.getElementById('af-fav-maj'); if(b) b.style.display=_afFavSource?'block':'none'; }"
FAVOUBLI = "  try{ _afFavSource=null; _afFavMontrer(); }catch(e){}   // NV2-FIAB : le favori repris appartient à l'aliment d'avant\n"
FAVREMPL = "  fs[i]=fav;\n"
FAVDATE = "    fav.t=Date.now();\n"
ENVOI = "      hiddenFoods:_nutMasquesNormaliser(S.hiddenFoods),\n"
SERVEUR = "    if (body.hiddenFoods   !== undefined) profile.hiddenFoods   = _nutMasquesFusion_(profile.hiddenFoods, body.hiddenFoods);"
FUSION_SRV = "      if (!par.hasOwnProperty(k) || t > par[k]) par[k] = t;\n    });\n  }\n  prendre(existant); prendre(recu);\n"
RESTAURE_M = "  try{if(Array.isArray(d.hiddenFoods))S.hiddenFoods=_nutMasquesFusion(S.hiddenFoods,d.hiddenFoods);}catch(e){console.warn('[FT restore] hiddenFoods',e);}\n"
RESTAURE_F = "  try{if(typeof _n2Cle==='function')S.savedFoods=_nutFavorisVivants(S.savedFoods,S.hiddenFoods,_n2Cle);}catch(e){console.warn('[FT restore] favoris masqués',e);}\n"
DEMARRE = "          if(Array.isArray(_m)&&_m.length){ S.hiddenFoods=_nutMasquesFusion(S.hiddenFoods,_m); S.savedFoods=_nutFavorisVivants(S.savedFoods,S.hiddenFoods,_n2Cle); } }catch(e){}"
SANS_SAUVE = "  if(!_nutRazSauve){ _nutRazDire("
PERIMEE = "  if(_nutRazSauve.favs!==_nutRazEmpreinte(S.savedFoods||[])){"
RAZ_GO = "    S.savedFoods=_nutFavorisVivants(S.savedFoods, S.hiddenFoods, _n2Cle);\n    persist();\n"
ORACLE = "iso35: { kcal: 136, prot: 31, carbs: 1, fat: 1 }"
N08_MILO = "  const fl = (Array.isArray(S.foodLog) ? S.foodLog : []).filter(e => e && typeof e === 'object');\n"
N08_JOUR = "const entries=(S.foodLog||[]).filter(e=>e&&e.date===td).sort((a,b)=>b.ts-a.ts);"
# N08, l'ordre defavorable (temoin elargi le 25/10) : les quatre lecteurs qui tombaient encore apres les 2 lignes de Principal
N08_RESTE = "    rien: !(S.foodLog||[]).some(e=>e&&e.date===d),"
N08_IDEES = "  (S.foodLog||[]).filter(e=>e&&typeof e==='object').sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(e=>{ if(_n2Propose(e, e && e.ts)) prendre(e,false); });"
N08_LISTE = "  const recent=[], lignes=(S.foodLog||[]).filter(e=>e&&typeof e==='object').sort((a,b)=>b.ts-a.ts);"
N08_DEJA = "  (S.foodLog||[]).filter(e=>e&&typeof e==='object').sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(e=>{\n    if(!e||!e.name||out.length>=5) return;"
# ZERO (retour de Claude Principal, 25/10) : l'ancienne saisie sans quantite ni valeurs a les issues d'une reprise sans fiche
Z_MARQUE = "    _afRepriseVide=_N2_CHAMPS.some(c=>(+R.valeurs[c])>0) ? null : {nom:String(R.nom||'').trim(), etat:''};\n"
Z_DESSIN = "    if(_afRepriseVide && _afRepriseVide.nom===_afNomCourant()) _afMajVide();   // …mais une reprise sans rien garde ses issues\n"
Z_NOM = "if(_afRepriseVide && _afRepriseVide.nom===_afNomCourant()) _afMajVide();"
Z_OUBLI = "  try{ _afRepriseVide=null; }catch(e){}   // la reprise sans quantité ni valeurs appartient à l'aliment d'avant\n"
Z_AJOUT = "  if(_afRepriseVide && _afRepriseVide.nom===String(nom||'').trim() && !_N2_CHAMPS.some(c=>(+vals[c])>0))\n    return {ok:false, message:_N2_VIDE+' Rien n\\'a été ajouté.'};\n"
Z_HTML = "  el.innerHTML='<div style=\"font-size:11.5px;color:var(--t2);line-height:1.45;\">'+_escFood(_N2_VIDE)+'</div>'+_n2IssuesHtml(_afRepriseVide.etat);"
Z_TOAST = "toast(_afRepriseVide ? 'Rien n\\'a été ajouté. '+_N2_VIDE"
# T08 conditionnels : le serveur LIT les masquages mais ne les garde plus (la liste blanche les nomme encore)
SERVEUR_LU = "    if (body.hiddenFoods   !== undefined) void _nutMasquesFusion_(profile.hiddenFoods, body.hiddenFoods);"
CHARGE = "    S.hiddenFoods=_nutMasquesNormaliser(JSON.parse(localStorage.getItem('ft4_hiddenfoods')||'[]'));   // NV2-FIAB : des dates de départ\n"
# E2b · NUT-VERIFY-01 (cloture ciblee, 25/10) : seules les saisies encore PROPOSEES se comparent (D-131) ; les fiches verifiees par la
# SOURCE restent (D-136)
E2B_RANGER = "    if(sid && _n2Propose(x, fav ? x.t : x.ts)) (refs[sid]=refs[sid]||[]).push({x:x, fav:fav}); return sid; };"
E2B_FICHE = "    const sid=ranger(l, false); if(!sid) return;\n"
# Q15 / D-141 (cloture ciblee, 25/10) : la remise a zero SUPPRIME les anciens favoris au serveur, par P1 (motif « raz » : copie
# en zone de recuperation d'abord, surplus relu dans Drive)
RAZ_ENTREE = "function _nutRazFavoris_(existing, profile, recu, email) {\n  var raz = _nutRazDate_(profile.hiddenFoods);\n"
RAZ_P1 = "  var garde = _nutProtegerListe_(existing, profile, 'savedFoods', a.vivants, email, 'raz');\n"
RAZ_ENVOI = "  return b ? b.vivants : recu;\n}\n"
RAZ_REFUS = "  if (garde !== a.vivants) {                                       // refusé (D-109) : rien de supprimé, rien de repris\n"
RAZ_GARDE = "  profile.savedFoods = garde;\n"
RAZ_MOTIF = "  ec.retirees.forEach(function(l) { garder(l, motif || (brutal ? 'brutal' : 'retiree')); });\n"
RAZ_ADMIN_F = "  if (_raz && Array.isArray(data.profile.savedFoods)) data.profile.savedFoods = _nutRazTri_(data.profile.savedFoods, _raz).vivants;\n"
RAZ_ADMIN_M = "  if (_masques.length) data.profile.hiddenFoods = _masques;\n"
RAZ_ORDRE = ("    if (body.hiddenFoods   !== undefined) profile.hiddenFoods   = _nutMasquesFusion_(profile.hiddenFoods, body.hiddenFoods);   // NV2-FIAB : masquages + remise à zéro\n"
             "    // 🗑️ D-141 : APRÈS la fusion des masquages (la date de remise à zéro la plus récente) et AVANT P1 — les favoris d'avant elle sont\n"
             "    //    supprimés par P1, motif « raz » (copiés d'abord en zone de récupération), au serveur comme dans l'envoi ; P1 ne voit ensuite que les favoris d'après.\n"
             "    const _favRecus = _nutRazFavoris_(existing, profile, body.savedFoods, email);\n")

# NUT-QTY-02 (25/10 soir) : la quantite posee pendant la recherche en ligne survit a la fiche ; NUT-CIQ-HL-01 : la table CIQUAL
# absente n'est pas « pas de fiche » (la protection D-101 ⑨ reste)
QPOSE = "  const qPose=_afQtePoseeReprise();\n"
QUNITE = "    if(qPose.unite===u){\n"
QHIDE = "      if(b && qPose.origine==='proposee' && parseFloat(b.dataset.q)===qPose.val) b.style.display='none';\n"
QORIG = "      _bcQtyPose=true; _bcQtyOrigine=qPose.origine;   // le geste d'avant, tel quel (une frappe, ou une pastille touchée)\n"
QDIT = "      dit+=' — ta quantité ('+_n2QteTexte(qPose, false)+') est gardée';\n"
QELSE = "    }else dit+=' — tu avais indiqué '+_n2QteTexte(qPose, false)+' : cette fiche compte en '+u+', tape ta quantité en '+u;\n"
QPREBLUR = "  if(_afPropPose && _afPoidsDeclare>0 && (_afUnite==='g' || _afUnite==='ml')) return {val:_afPoidsDeclare, unite:_afUnite, origine:'tapee'};\n"
QRU = "  if(R && (R.u==='g' || R.u==='ml') && R.q>0) return _afQtePosee(R.u);\n"
QPORT = "  if(_afUnite==='portion'){\n    if(!(_afPortionPose && +_afPortions>0)) return null;\n"
QFIN = QPREBLUR + "  return null;\n}\n"
QREPCOMM = "   ⛔ Elle ne lit que des GESTES (`_afPropPose`, `_afPortionPose`) : un nombre proposé et pas pris n'est rien.\n"
QCOMM = "SURVIT À LA FICHE. Mesuré : 180 tapé dans l'écran figé AVANT la réponse ; la fiche arrivait par le chemin du scan, qui oublie\n"
CABS = "function _n2CiqualAbsente(sid){\n  return /^ciqual:/.test(String(sid||'').trim()) && !(typeof _ciqual==='object' && _ciqual && Array.isArray(_ciqual.a));\n}\n"
FIGE_REFUS = "    if(R.qte && !_afValeursTapees && !(q.unite===R.qte.unite && q.val===R.qte.val))\n"


# NIDT (27/10, mission de Michel) : « Modifier » garde l'identite ; un ancien aliment sans identite PROPOSE (jamais ne prend) le produit
# identifie de meme nom exact ; la personne confirme ; la fiche vient de la SOURCE ; rien ne s'ecrit avant « Ajouter »
CAND_FIN = "    if(_cs.length) _n2Cand={src:src, saisie:saisie, nom:String(R.nom||'').trim(), liste:_cs};\n"
CAND_NOM = ".normalize('NFC').toLowerCase()"
CAND_COURT = "if(cle.length<3 || cle==='produit') return [];"
CAND_CHOIX = "  const R=_n2RepriseIdentite(N.reprise(src, _n2Ctx()), choixSid ? {sourceId:choixSid} : src, !!choixSid); if(!R.ok) return false;\n"
CAND_GO = "    try{ _afOublierAliment(); }catch(e){}\n    if(!_n2Reprendre(C.src, C.saisie, c.sid)) return;\n"
CAND_FAV = "    if(fav){ _afFavSource=fav; try{ _afFavMontrer(); }catch(e){} }\n"
CAND_PROPOSE = "    if(!_n2Propose(l, l.ts)) return;   // ce que « ✕ » ou la remise à zéro ont écarté ne revient pas par ce panneau (D-140 ②) ; ce qui est noté APRÈS revient de lui-même\n"
CAND_QTE = "  const qPose=_n2QteAvantChoix();   // D-101 ⑧/⑨ : la quantité déjà tapée survit au choix\n"
CAND_OUBLI = "  try{ _n2Cand=null; _n2CandRendre(); }catch(e){}   // NIDT : les candidats d'identité appartiennent, eux aussi, à l'aliment d'avant (R15)\n"
CAND_BOUTON = "lignes.push('<button type=\"button\" onclick=\"_n2ChoisirCandidat('+i+')\""
MOD_ID = "    const _id=_n2IdentiteQuiSuit(e, nom);\n"
MOD_CLE = "      entree.cle=_id; if(e.etat) entree.etat=String(e.etat);\n"
MOD_ORIG = "      if(R.statut!=='v2' && ['off','ciqual','marque'].indexOf(e.origine)>=0)\n"
MOD_EGAL = "    if(_id && _egal){\n"
MOD_NOM = "  const sid=(e && typeof e.sourceId==='string') ? e.sourceId.trim() : ''; if(!sid) return '';\n  if(_n2NomCle(nom)===_n2NomCle(e.name)) return sid;\n"
PORTE_SID = "    if(_sid){ e.cle=_sid; if(src.etat) e.etat=String(src.etat); }\n    if(R.statut==='non-verifiee') e.notes=['reprise-non-verifiee'];\n"
SYNC_FL = "      foodLog:(S.foodLog||[]).slice(-8000), // ~journal nutrition sur plusieurs annees (entrees minuscules)"
CAND_TABLE = "  if(/^ciqual:/.test(c.sid) && !(typeof _ciqual==='object' && _ciqual && Array.isArray(_ciqual.a))){\n"
CAND_INCONNU = "    if(d.type==='ciqual' && d.tableOK && !d.dispo) return;   // un code que la table CIQUAL n'a pas ne donne aucune fiche : il n'est pas proposé\n"
ORACLE_P = "g && v150 === '546/20/109/2' && b3 === b0"
ORACLE_H = "['V1 corrompue (10 g · 36 kcal)', HUI_OLD1, 10, [90, 0, 0, 10]]"

MUT = [
    # ── la reprise d'un aliment : son IDENTITE, sa fiche retrouvee, ses issues ──
    ('F1 dans l\'ecran, la fiche n\'est plus retrouvee par l\'identite du produit (code-barres, ciqual:)',
     [(A, REPRISE, "  return R0;\n")], E('T02 ⑥b'), 'GARDE', 'ecran'),
    # ⛔ Regle A de D-111 (Michel, 24/10) : HORS de l'ecran, une reference qui contredit la fiche verifiee de son produit n'est
    #    jamais recalculee en silence. La mutation reintroduit la fiche d'identite dans « + Ajouter » / l'apercu (la variante B).
    ('F1b la fiche d\'identite revient HORS de l\'ecran (« + Ajouter », la liste : la variante B que Michel a ecartee)',
     [(A, "  const R=N.reprise(src, _n2Ctx()); if(!R.ok) return R;\n  if(!R.quantite) return {ok:false, aCompleter:true};",
          "  const R=_n2RepriseIdentite(N.reprise(src, _n2Ctx()), src); if(!R.ok) return R;\n  if(!R.quantite) return {ok:false, aCompleter:true};"),
      (A, "  if(R.fiche){\n    const d=!!L && C.some(", "  if(R.fiche){\n    if(R.parIdentite) return null;\n    const d=!!L && C.some(")],
     E('T02 ⑥'), 'GARDE', 'ecran'),
    ('F2 la fiche n\'est plus cherchee en ligne par le code-barres (le cas fige redevient une impasse en ligne)',
     [(A, ENLIGNE, ENLIGNE.replace("  if(typeof _offFetchProduct!=='function') return false;\n", "  return false;\n"))],
     E('T02 ②', 'T02 ④', 'T02 ⑤', 'T06 ④'), 'GARDE', 'ecran'),
    ('F3 une fiche arrivee EN RETARD s\'applique a l\'aliment choisi entre-temps', [(A, PERIME, "")], E('T02 ⑦'), 'GARDE', 'ecran'),
    ('F4 le cas fige n\'a plus d\'issue a l\'ecran (ni retrouver, ni scanner, ni etiquette) — ni la saisie a zero (meme proprietaire)', [(A, ISSUES, "[]")], E('T02 ②', 'ZÉRO ①'), 'GARDE', 'ecran'),
    ('F5 deux saisies du meme produit qui se contredisent ne se signalent plus',
     [(A, CONTR, CONTR + "  return null;\n")], E('T06 ①', 'T06 ③', 'E2b ⑤'), 'GARDE', 'ecran'),
    ('F6 « Deja note par toi » ignore de nouveau les masquages (« ✕ »)', [(A, DEJA, "")], E('N2 ①'), 'GARDE', 'ecran'),
    ('F7 une recopie « declaree » perd l\'identite du produit (`sourceId:null`)', [(N2, SID, "")], E('T02 ③'), 'GARDE', 'ecran'),
    ('F8 l\'energie pour 100 g d\'un produit est de nouveau ARRONDIE a l\'entier (156 au lieu de 155 pour 40 g)',
     [(A, KCAL, KCAL.replace("return _per100d1(", "return Math.round("))], E('T01 ①', 'T09 ①'), 'GARDE', 'ecran'),
    # ── l'affichage (§6) ──
    ('F9 l\'ancien ordre revient (la quantite avant les calories)',
     [(A, ORDRE, "  return pour+' · '+f(v.kcal)+' kcal · P '+f(v.prot)+' · G '+f(v.carbs)+' · L '+f(v.fat);")],
     E('T03 ①', 'T06 ①', 'T06 ②', 'F ①', 'N2 ②', 'T09 ①'), 'GARDE', 'ecran'),
    ('F10 une reference perd ses decimales (21,9 g devient 22)', [(A, DECIM, "(ref ? String(Math.round(+x)) : String(x))")], E('T03 ①', 'T09 ①'), 'GARDE', 'ecran'),
    # ── corriger un favori sans toucher au journal ──
    ('F11 « ⭐ Corriger ce favori » n\'apparait jamais', [(A, FAVBTN, FAVBTN.replace("_afFavSource?'block':'none'", "'none'"))], E('F ②'), 'GARDE', 'ecran'),
    ('F12 le favori repris n\'est plus oublie quand un autre produit est scanne', [(A, FAVOUBLI, "")], E('F ②'), 'GARDE', 'ecran'),
    ('F13 corriger un favori REECRIT les lignes du journal du meme aliment',
     [(A, FAVREMPL, FAVREMPL + "  (S.foodLog||[]).forEach(l=>{ if(l && l.name===ancien.name){ l.kcal=fav.kcal; l.prot=fav.prot; } });\n")], E('F ③'), 'GARDE', 'ecran'),
    ('F14 une etoile n\'est plus datee (elle ne survit plus a une remise a zero, ni ne s\'en distingue)',
     [(A, FAVDATE, "")], E('T09 ⑤'), 'GARDE', 'ecran'),
    # ── la remise a zero (admin) : sauvegarde d'abord, journal intact ──
    # 24/10 : sans sa 3ᵉ retouche, la confirmation lisait `_nutRazSauve.nom` -> exception dans la page -> le banc PLANTAIT
    #   (un plantage n'est pas un verdict). Le défaut modélisé est « la remise à zéro PART sans sauvegarde » : elle doit partir.
    ('F15 la remise a zero part SANS sauvegarde',
     [(A, SANS_SAUVE, "  if(false){ _nutRazDire("), (A, PERIMEE, "  if(_nutRazSauve && _nutRazSauve.favs!==_nutRazEmpreinte(S.savedFoods||[])){"),
      (A, "Sauvegarde : « '+_nutRazSauve.nom+' ».", "Sauvegarde : « '+(_nutRazSauve||{}).nom+' ».")],
     X('T07 ①'), 'GARDE', 'croise'),
    ('F16 la remise a zero part avec une sauvegarde PERIMEE (un favori pose apres le fichier serait perdu)',
     [(A, PERIMEE, "  if(false){")], E('R ①'), 'GARDE', 'ecran'),
    ('F17 la remise a zero touche le JOURNAL (des repas consommes disparaissent)',
     [(A, RAZ_GO, RAZ_GO.replace("    persist();\n", "    S.foodLog=(S.foodLog||[]).filter(l=>l && l.n2);\n    persist();\n"))],
     X('T07 ③', 'T12 ①'), 'GARDE', 'croise'),
    # ── la synchronisation des masquages et de la remise a zero ──
    ('F18 les masquages ne partent plus au serveur (synchro)', [(SE, ENVOI, "")], X('T08 ①', 'T08 ②'), 'GARDE', 'croise'),
    # ⚖️ 25/10 : retirer la ligne de la liste blanche, c'est le Code.js de master — le banc passe en garanties locales (F19b, vert).
    #    Le DEFAUT, c'est un serveur qui LIT les masquages sans les garder : T08 ⓪ (le mode ne concorde plus) et la synchro rougissent.
    ('F19 le serveur LIT les masquages mais ne les enregistre plus (la liste blanche les nomme encore)', [(CJ, SERVEUR, SERVEUR_LU)],
     X('T08 ⓪', 'T08 ①', 'T08 ②', 'T08 ③'), 'GARDE', 'croise'),
    ('F19b [mode] la liste blanche sans `hiddenFoods` (le Code.js de master) : le banc passe en garanties locales, le dit, et reste vert',
     [(CJ, SERVEUR, "")], [], 'OK', 'croise'),
    # ── les garanties LOCALES (sur le Code.js de master : c'est la ou elles sont seules a proteger) ──
    ('FL1 [Code.js de master] « Restaurer » REMPLACE les masquages locaux par ceux du serveur (ici : aucun)',
     [(CJ, SERVEUR, ""), (SE, RESTAURE_M, "  try{S.hiddenFoods=Array.isArray(d.hiddenFoods)?d.hiddenFoods:[];}catch(e){console.warn('[FT restore] hiddenFoods',e);}\n")],
     X('T08L ②'), 'GARDE', 'croise'),
    ('FL2 [Code.js de master] « Restaurer » rend les favoris d\'avant la remise a zero (la date locale ne les ecarte plus)',
     [(CJ, SERVEUR, ""), (SE, RESTAURE_F, "")], X('T08L ③'), 'GARDE', 'croise'),
    ('FL3 [Code.js de master] au rechargement, l\'app oublie les masquages enregistres sur le telephone',
     [(CJ, SERVEUR, ""), (ST, CHARGE, "    S.hiddenFoods=[];\n")], X('T08L ①'), 'GARDE', 'croise'),
    ('F20 le serveur REMPLACE la liste au lieu de la fusionner (un telephone en retard efface la remise a zero)',
     [(CJ, FUSION_SRV, FUSION_SRV.replace("  prendre(existant); prendre(recu);\n", "  prendre(recu);\n"))], X('T08 ⑦'), 'GARDE', 'croise'),
    ('F21 « Restaurer » ne reprend plus les masquages du serveur', [(SE, RESTAURE_M, "")], X('T08 ②'), 'GARDE', 'croise'),
    ('F22 « Restaurer » rend les favoris d\'avant la remise a zero (le serveur D-141 n\'en renvoie plus : T08L ④ lui en fait renvoyer)', [(SE, RESTAURE_F, "")], X('T08L ④'), 'GARDE', 'croise'),
    ('F23 au demarrage, les masquages venus d\'un autre appareil ne s\'appliquent plus',
     [(A, DEMARRE, "          }catch(e){}")], X('T08 ④'), 'GARDE', 'croise'),
    # ── N08 (retour de Claude Principal, 25/10) : une entree vide (`null`) dans le journal ne fait plus rien tomber ──
    ('N08a ce que Milo lit relit de nouveau les entrees vides (`_profilAlimentaire` sans filtre : le contexte ne se construit plus)',
     [(A, N08_MILO, "  const fl = Array.isArray(S.foodLog) ? S.foodLog : [];\n")], E('N08 ①', 'N08 ②'), 'GARDE', 'ecran'),
    ('N08b le journal du jour relit de nouveau les entrees vides (`renderFoodJournal` : l\'affichage tombe)',
     [(SC, N08_JOUR, "const entries=(S.foodLog||[]).filter(e=>e.date===td).sort((a,b)=>b.ts-a.ts);")], E('N08 ①'), 'GARDE', 'ecran'),
    ('N08c la carte « ce qu\'il te reste » relit les entrees vides (`_resteDuJour` : le journal du jour tombe avec elle)',
     [(A, N08_RESTE, "    rien: !(S.foodLog||[]).some(e=>e.date===d),")], E('N08 ③'), 'GARDE', 'ecran'),
    ('N08d les idees pour le reste trient de nouveau les entrees vides (`_mesAliments`)',
     [(A, N08_IDEES, N08_IDEES.replace(".filter(e=>e&&typeof e==='object')", ".slice()"))], E('N08 ③'), 'GARDE', 'ecran'),
    ('N08e « Ajouter » trie de nouveau les entrees vides (`_buildFoodQuickItems` : « Mes aliments » tombe)',
     [(A, N08_LISTE, N08_LISTE.replace(".filter(e=>e&&typeof e==='object')", ".slice()"))], E('N08 ③'), 'GARDE', 'ecran'),
    ('N08f « Deja note par toi » trie de nouveau les entrees vides (`_afSuggLocales`)',
     [(A, N08_DEJA, N08_DEJA.replace(".filter(e=>e&&typeof e==='object')", ".slice()"))], E('N08 ③'), 'GARDE', 'ecran'),
    # ── ZERO (retour de Claude Principal, 25/10) : l'ancienne saisie sans quantite ni valeurs n'est plus une impasse ──
    ('Z1 la reprise sans quantite ni valeurs ne se marque plus (l\'ecran redevient une impasse)', [(A, Z_MARQUE, "    _afRepriseVide=null;\n")], E('ZÉRO ①', 'ZÉRO ②'), 'GARDE', 'ecran'),
    ('Z2 l\'ecran ne dessine plus ses issues', [(A, Z_DESSIN, "")], E('ZÉRO ①', 'ZÉRO ②'), 'GARDE', 'ecran'),
    ('Z3 sa marque survit a l\'aliment (l\'oubli de l\'aliment ne la rend plus)', [(A, Z_OUBLI, "")], E('ZÉRO ③'), 'GARDE', 'ecran'),
    ('Z4 un AUTRE nom herite de ses issues', [(A, Z_NOM, "if(_afRepriseVide) _afMajVide();")], E('ZÉRO ③'), 'GARDE', 'ecran'),
    ('Z5 « Ajouter » redemande « Combien pesait… » (un poids qu\'on ne peut ecrire nulle part)', [(A, Z_AJOUT, "")], E('ZÉRO ①', 'ZÉRO ②'), 'GARDE', 'ecran'),
    ('Z6 un champ « quantite » est propose pour ces 0 (accepter une quantite affirmerait qu\'ils valaient pour elle)',
     [(A, Z_HTML, Z_HTML.replace("el.innerHTML='", "el.innerHTML='<input id=\"af-prop\" type=\"text\" inputmode=\"decimal\">'+'"))], E('ZÉRO ①', 'ZÉRO ②'), 'GARDE', 'ecran'),
    ('Z7 « + Ajouter » annonce de nouveau « choisis la quantite » (sans champ ou la choisir)', [(A, Z_TOAST, Z_TOAST.replace('toast(_afRepriseVide ?', 'toast(false ?'))], E('ZÉRO ①'), 'GARDE', 'ecran'),
    # ── E2b · NUT-VERIFY-01 (cloture ciblee, 25/10) ──
    ('E1 les saisies retirees par la remise a zero ou « ✕ » jugent de nouveau une saisie notee ensuite (le defaut E2b)',
     [(A, E2B_RANGER, "    if(sid) (refs[sid]=refs[sid]||[]).push({x:x, fav:fav}); return sid; };")],
     E('E2b ①', 'E2b ②', 'E2b ③', 'E2b ④', 'E2b ④b'), 'GARDE', 'ecran'),
    ('E2 seuls les FAVORIS retires jugent de nouveau (le journal reste filtre)',
     [(A, E2B_RANGER, "    if(sid && (fav || _n2Propose(x, x.ts))) (refs[sid]=refs[sid]||[]).push({x:x, fav:fav}); return sid; };")],
     E('E2b ④b'), 'GARDE', 'ecran'),
    ('E3 seules les saisies du JOURNAL retirees jugent de nouveau (les favoris restent filtres)',
     [(A, E2B_RANGER, "    if(sid && (!fav || _n2Propose(x, x.t))) (refs[sid]=refs[sid]||[]).push({x:x, fav:fav}); return sid; };")],
     E('E2b ①', 'E2b ②', 'E2b ③', 'E2b ④'), 'GARDE', 'ecran'),
    ('E4 sur-correction : la remise a zero retire aussi les fiches verifiees par la SOURCE (le controle « differe » s\'eteint)',
     [(A, E2B_FICHE, "    const sid=ranger(l, false); if(!sid || !_n2Propose(l, l.ts)) return;\n")], E('E2b ⑥'), 'GARDE', 'ecran'),
    # ── Q15 / D-141 (cloture ciblee, 25/10) : la suppression reelle au serveur, PAR la protection P1 ──
    ('D1 le serveur ne supprime plus les anciens favoris (retour a D-133 : la date les ecarte, le serveur les garde)',
     [(CJ, RAZ_ENTREE, RAZ_ENTREE.replace("{\n", "{\n  return recu;\n", 1))], X('Q15 ①', 'Q15 ③', 'T08 ③', 'T08 ⑧'), 'GARDE', 'croise'),
    ('D2 la suppression part SANS copie (P1 contourne : rien pour retrouver ce que le serveur avait)',
     [(CJ, RAZ_P1, "  var garde = a.vivants;\n")], X('Q15 ①', 'Q15 ⑦', 'T08 ③'), 'GARDE', 'croise'),
    ('D3 un ancien favori RENVOYE par un appareil en retard est repris par le serveur',
     [(CJ, RAZ_ENVOI, "  return recu;\n}\n")], X('Q15 ③', 'T08 ⑧'), 'GARDE', 'croise'),
    ('D4 au-dela du plafond, Drive en panne : la suppression passe SANS copie au lieu d\'attendre (D-109 ignoree)',
     [(CJ, RAZ_REFUS, "  if (garde !== a.vivants) garde = a.vivants;\n  if (false) {\n")], X('Q15 ⑤'), 'GARDE', 'croise'),
    ('D5 la restauration admin d\'une sauvegarde d\'avant ramene les anciens favoris',
     [(CJ, RAZ_ADMIN_F, "")], X('Q15 ⑥'), 'GARDE', 'croise'),
    ('D6 la restauration admin d\'une sauvegarde d\'avant efface la date de remise a zero du compte',
     [(CJ, RAZ_ADMIN_M, "")], X('Q15 ⑥'), 'GARDE', 'croise'),
    ('D7 la suppression lit la date AVANT la fusion des masquages (la remise a zero qui arrive ne supprime rien)',
     [(CJ, RAZ_ORDRE, RAZ_ORDRE.split("\n")[3] + "\n" + "\n".join(RAZ_ORDRE.split("\n")[:3]) + "\n")], X('Q15 ①'), 'GARDE', 'croise'),
    ('D8 la suppression touche le JOURNAL du serveur (des repas consommes disparaissent)',
     [(CJ, RAZ_GARDE, RAZ_GARDE + "  profile.foodLog = _nutRazTri_(profile.foodLog, raz).vivants;\n")], X('Q15 ②', 'Q15 ⑧'), 'GARDE', 'croise'),
    ('D9 l\'ordre de la remise a zero passe sans son motif (« le vide ne gagne jamais » bloque la suppression)',
     [(CJ, RAZ_P1, RAZ_P1.replace(", email, 'raz');", ", email);"))], X('Q15 ①', 'T08 ③'), 'GARDE', 'croise'),
    ('D10 les copies de la remise a zero ne portent plus leur motif (indiscernables d\'un retrait ordinaire)',
     [(CJ, RAZ_MOTIF, "  ec.retirees.forEach(function(l) { garder(l, brutal ? 'brutal' : 'retiree'); });\n")], X('Q15 ①', 'Q15 ⑦', 'T08 ③'), 'GARDE', 'croise'),
    # ── NUT-QTY-02 · NUT-CIQ-HL-01 (mission de Michel, 25/10 soir) ──
    ('Q1 la quantite posee pendant la recherche en ligne n\'est plus relevee (le defaut NUT-QTY-02 : 180 perdu a l\'arrivee de la fiche)',
     [(A, QPOSE, "  const qPose=null;\n")], E('Q2 ①', 'Q2 ②', 'Q2 ③', 'Q2 ④', 'Q2 ⑦', 'Q2 ⑧', 'Q2 ⑨'), 'GARDE', 'ecran'),
    ('Q2 la quantite passe dans une AUTRE unite (180 g poses comme 180 ml : une densite inventee)',
     [(A, QUNITE, "    if(true){\n")], E('Q2 ④', 'Q2 ⑨'), 'GARDE', 'ecran'),
    ('Q3 « 0 » (ou un champ vide) devient une quantite posee',
     [(A, QPOSE, "  const qPose=(_afRef && _afRef.fige) ? {val:numFR((document.getElementById('af-prop')||{}).value)||0, unite:(_afRef.u==='ml')?'ml':'g', origine:'tapee'} : null;\n")],
     E('Q2 ⑤'), 'GARDE', 'ecran'),
    ('Q4 la fiche s\'applique sans verifier que l\'ecran montre toujours cet aliment (la quantite passerait a un autre)',
     [(A, PERIME, "")], E('T02 ⑦', 'Q2 ⑥'), 'GARDE', 'ecran'),
    ('Q5 la pastille deja prise se repropose apres l\'arrivee de la fiche', [(A, QHIDE, "")], E('Q2 ③'), 'GARDE', 'ecran'),
    ('Q6 l\'origine du geste se perd (une pastille prise devient une quantite « tapee »)',
     [(A, QORIG, "      _bcQtyPose=true; _bcQtyOrigine='tapee';\n")], E('Q2 ③'), 'GARDE', 'ecran'),
    ('Q7 la quantite est gardee SANS le dire', [(A, QDIT, "")], E('Q2 ②'), 'GARDE', 'ecran'),
    ('Q8 une autre unite : la quantite se perd sans rien dire', [(A, QELSE, "    }\n")], E('Q2 ④', 'Q2 ⑨'), 'GARDE', 'ecran'),
    ('Q9 la jumelle rouverte : seule la reprise FIGEE garde sa quantite (le correctif d\'avant, b41089f7) — l\'ancien scan SANS quantite la perd',
     [(A, QPOSE, "  const qPose=(_afRef && _afRef.fige) ? _afQtePoseeFige() : null;\n")], E('Q2 ⑦', 'Q2 ⑧', 'Q2 ⑨'), 'GARDE', 'ecran'),
    ('Q10 le poids tape AVANT la sortie du champ n\'est plus lu (180 perdu si la fiche arrive pendant la frappe)',
     [(A, QPREBLUR, "")], E('Q2 ⑦'), 'GARDE', 'ecran'),
    ('Q11 la quantite CORRIGEE apres la sortie du champ n\'est plus lue : le premier poids (180) l\'emporte sur le dernier (200)',
     [(A, QRU, "")], E('Q2 ⑧'), 'GARDE', 'ecran'),
    ('Q12 des portions choisies avant la fiche se perdent sans rien dire',
     [(A, QPORT, "  if(false){\n    if(!(_afPortionPose && +_afPortions>0)) return null;\n")], E('Q2 ⑨'), 'GARDE', 'ecran'),
    ('Q13 rien de pose, et pourtant une quantite : le « 1 » de l\'ancre devient 1 g a l\'arrivee de la fiche',
     [(A, QFIN, QPREBLUR + "  return (R && R.q>0) ? {val:R.q, unite:'g', origine:'tapee'} : null;\n}\n")], E('Q2 ⑩'), 'GARDE', 'ecran'),
    ('C1 la table CIQUAL absente se dit de nouveau « pas de fiche verifiee » (le defaut NUT-CIQ-HL-01)',
     [(A, CABS, CABS.replace("  return /^ciqual:/", "  return false && /^ciqual:/"))], E('CHL ①', 'CHL ④'), 'GARDE', 'ecran'),
    ('C2 « reference indisponible » pour TOUTE ligne ciqual:, table chargee ou non (la condition n\'est plus la table)',
     [(A, CABS, "function _n2CiqualAbsente(sid){\n  return /^ciqual:/.test(String(sid||'').trim());\n}\n")], E('CHL ⑥'), 'GARDE', 'ecran'),
    ('C3 la protection saute : hors ligne, une autre quantite s\'ecrit avec les valeurs d\'avant (D-101 ⑨ ignoree)',
     [(A, FIGE_REFUS, "    if(false)\n")], E('CHL ②', 'T02 ①'), 'GARDE', 'ecran'),
    ('MC2 [negatif] commentaire seulement dans le correctif NUT-QTY-02', [(A, QCOMM, QCOMM.replace("Mesuré :", "Mesuré (commentaire) :"))], [], 'OK', 'ecran'),
    ('MC3 [negatif] commentaire seulement dans le lecteur de la jumelle (`_afQtePoseeReprise`)', [(A, QREPCOMM, QREPCOMM.replace("GESTES", "GESTES (commentaire)"))], [], 'OK', 'ecran'),
    # ── NIDT (27/10, mission de Michel) : la partie « identite » — chaque mutation REINTRODUIT un defaut que la mission interdit ──
    ('I1 un candidat UNIQUE est pris en silence (l\'association par le nom, ce que la mission interdit)',
     [(A, CAND_FIN, CAND_FIN + "    if(_cs.length===1 && !choixSid) return _n2Reprendre(src, saisie, _cs[0].sid);\n")], I('P ①', 'H ①', 'I ①'), 'GARDE', 'identite'),
    ('I1b plusieurs candidats : le PREMIER est pris sans que la personne choisisse',
     [(A, CAND_FIN, CAND_FIN + "    if(_cs.length>=1 && !choixSid) return _n2Reprendre(src, saisie, _cs[0].sid);\n")], I('S ①'), 'GARDE', 'identite'),
    ('I1c plusieurs candidats : le premier bouton est affiche comme deja choisi',
     [(A, CAND_BOUTON, CAND_BOUTON.replace('onclick="_n2', 'aria-pressed="\'+(i===0?\'true\':\'false\')+\'" onclick="_n2', 1))], I('S ①'), 'GARDE', 'identite'),
    ('I2 le choix ECRIT l\'identite sur l\'ancienne ligne et l\'enregistre (rien ne devrait s\'ecrire avant « Ajouter », et les anciennes lignes restent intactes)',
     [(A, CAND_GO, "    try{ C.src.sourceId=c.sid; persist(); }catch(e){}\n" + CAND_GO)], I('P ②', 'P ④', 'H ②'), 'GARDE', 'identite'),
    ('I2b la confirmation vit dans une NOUVELLE clef de stockage (une table d\'associations a part, ce que la mission interdit)',
     [(A, CAND_GO, "    try{ localStorage.setItem('ft4_idassoc', JSON.stringify({id:C.src.id, sid:c.sid})); }catch(e){}\n" + CAND_GO)], I('P ⑥'), 'GARDE', 'identite'),
    ('I3 le nom est compare « a peu pres » (accents et ponctuation effaces : « Pates seches standard crues » trouve les pates)',
     [(A, CAND_NOM, ".normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9 ]/gi,'').toLowerCase()")], I('N ①'), 'GARDE', 'identite'),
    ('I4 un nom generique (« Produit ») ou de 2 lettres propose lui aussi un candidat',
     [(A, CAND_COURT, "if(!cle) return [];")], I('N ①'), 'GARDE', 'identite'),
    ('I5 le choix ne charge aucune fiche a la source (il relit la ligne d\'avant : rien ne se recalcule)',
     [(A, CAND_CHOIX, CAND_CHOIX.replace("choixSid ? {sourceId:choixSid} : src", "src"))], I('P ②', 'H ①', 'S ②'), 'GARDE', 'identite'),
    ('I6 la quantite deja tapee se PERD au choix (le defaut D-101 ⑧/⑨ rouvert)',
     [(A, CAND_QTE, "  const qPose=null;\n")], I('H ③', 'C ②'), 'GARDE', 'identite'),
    ('I7 le panneau ne meurt plus avec son aliment (R15) : il reste affiche quand un autre produit arrive (scan) ou quand la fiche en ligne arrive',
     [(A, CAND_OUBLI, "")], I('F ③', 'C ②'), 'GARDE', 'identite'),
    ('I8 « Modifier » perd de nouveau l\'identite (le defaut mesure sur ft-v1261 : `sourceId:null`)',
     [(A, MOD_ID, "    const _id='';\n")], I('M ①', 'M ⑤', 'M ⑩'), 'GARDE', 'identite'),
    ('I9 sur-correction : l\'identite suit N\'IMPORTE QUEL nouveau nom (« Riz (test) » garde le code-barres de l\'isolat)',
     [(A, MOD_NOM, MOD_NOM.replace("  if(_n2NomCle(nom)===_n2NomCle(e.name)) return sid;\n", "  return sid;\n"))], I('M ④'), 'GARDE', 'identite'),
    ('I10 « Modifier » DONNE une identite par le nom (une ligne sans code, renommee comme un produit identifie, en prend le code)',
     [(A, MOD_NOM, "  const sid=(e && typeof e.sourceId==='string') ? e.sourceId.trim() : '';\n  if(!sid){ const o=(S.foodLog||[]).find(l=>l && l!==e && typeof l.sourceId==='string' && l.sourceId.trim() && _n2NomCle(l.name)===_n2NomCle(nom)); return o ? o.sourceId.trim() : ''; }\n  if(_n2NomCle(nom)===_n2NomCle(e.name)) return sid;\n")],
     I('M ⑥'), 'GARDE', 'identite'),
    ('I11 sur-correction : « Modifier » rend la ligne FIABLE avec l\'ancien pour-100 g, jamais verifie (pesee / fiable, sans fiche source)',
     [(A, MOD_CLE, MOD_CLE + "      if(e.per100){ entree.mode='pesee'; entree.fiche={base:'g', p100:e.per100, cle:_id, source:(e.origine==='ciqual'?'ciqual':'off'), fiab:'source'}; delete entree.declare; delete entree.notes; }\n")],
     I('M ②'), 'GARDE', 'identite'),
    ('I12 l\'identite et la provenance suivent MEME quand les valeurs ont ete RETAPEES (la ligne corrigee a la main contredit les autres saisies du produit : le defaut mesure par B-NV2P P8 ①)',
     [(A, MOD_EGAL, "    if(_id){\n")], I('M ③', 'M ③b'), 'GARDE', 'identite'),
    ('I13 la provenance d\'origine n\'est plus jamais gardee par « Modifier »',
     [(A, MOD_ORIG, MOD_ORIG.replace("if(R.statut", "if(false && R.statut"))], I('M ①'), 'GARDE', 'identite'),
    ('I14 « + Ajouter » et « Tes repas habituels » donnent une identite par le nom (la regle A de D-111 ignoree : une association en silence)',
     [(A, PORTE_SID, "    const _cs0=_sid ? [] : _n2Candidats(src);\n    if(_sid){ e.cle=_sid; if(src.etat) e.etat=String(src.etat); } else if(_cs0.length===1){ e.cle=_cs0[0].sid; }\n    if(R.statut==='non-verifiee') e.notes=['reprise-non-verifiee'];\n")],
     I('D ①', 'D ②'), 'GARDE', 'identite'),
    ('I15 le blocage de recalcul saute : hors ligne, une autre quantite s\'ecrit avec les valeurs d\'avant (D-101 ⑧ ignoree)',
     [(A, FIGE_REFUS, "    if(false)\n")], I('C ①', 'N ②', 'M ⑨'), 'GARDE', 'identite'),
    ('I16 la synchro perd l\'identite CIQUAL des lignes (le serveur et le telephone neuf ne la voient plus)',
     [(SE, SYNC_FL, "      foodLog:(S.foodLog||[]).slice(-8000).map(l=>(l&&/^ciqual:/.test(String(l.sourceId||'')))?Object.assign({},l,{sourceId:null}):l),")], I('X ①', 'X ③'), 'GARDE', 'identite'),
    ('I19 le choix ne recharge plus la table CIQUAL absente (la connexion revenue, le bouton ne fait rien : la table n\'est jamais retentee)',
     [(A, CAND_TABLE, "  if(false){\n")], I('P ⑦', 'P ⑧'), 'GARDE', 'identite'),
    ('I20 un code CIQUAL que la table ne connait pas est propose quand meme (un bouton qui ne mene a aucune fiche)',
     [(A, CAND_INCONNU, "")], I('N ③'), 'GARDE', 'identite'),
    ('I21 choisir la fiche d\'un favori lui fait oublier son lien « ⭐ Corriger ce favori »',
     [(A, CAND_FAV, "")], I('V ⭐'), 'GARDE', 'identite'),
    ('I22 une identite ecartee par « ✕ » ou la remise a zero revient par le panneau (les anciennes references incorrectes reapparaissent : D-140 ②)',
     [(A, CAND_PROPOSE, "")], I('N ④'), 'GARDE', 'identite'),
    ('I17 l\'oracle de la fiche CIQUAL : 150 g de pates attendus a 547 kcal au lieu de 546 (l\'oracle est bien LU)',
     [(B, ORACLE_P, ORACLE_P.replace("546/20", "547/20"))], I('P ③'), 'GARDE', 'identite'),
    ('I18 l\'oracle de l\'huile : 10 g attendus a 91 kcal au lieu de 90',
     [(B, ORACLE_H, ORACLE_H.replace("[90, 0, 0, 10]", "[91, 0, 0, 10]"))], I('H ①'), 'GARDE', 'identite'),
    ('MC4 [negatif] commentaire seulement dans `_n2Candidats` (cite return [], sourceId, ciqual)',
     [(A, CAND_COURT, CAND_COURT + "   /* return []; sourceId:null ciqual:9810 — un commentaire ne change rien */")], [], 'OK', 'identite'),
    # ── l'oracle (ecrit a la main) et le controle « commentaire » ──
    ('F24 l\'oracle : 35 g d\'isolat attendus a 135 kcal au lieu de 136 (l\'oracle est bien LU)',
     [(B, ORACLE, ORACLE.replace("kcal: 136", "kcal: 135"))], E('T01 ①'), 'GARDE', 'ecran'),
    ('MC1 [negatif] commentaire seulement dans _n2Contradiction (cite return null, _n2Propose, sourceId)',
     [(A, CONTR, CONTR + "  /* return null; _n2Propose(e, e.ts) sourceId:null — un commentaire ne change rien */\n")], [], 'OK', 'ecran'),
]


def banc(arbre, partie):
    env = dict(os.environ, NUTF_RACINE=arbre, NUTF_PARTIE=partie)
    # Les COPIES vont dans $TMPDIR ; Chromium, lui, garde son dossier temporaire par defaut : il y cree des sockets, et un
    # chemin trop long l'empeche de demarrer (mesure le 24/10 : TMPDIR de 85 caracteres -> « browser has been closed »).
    env.pop('TMPDIR', None)
    r = subprocess.run(['node', 'tools/banc_nut_fiabilite.js'], cwd=arbre, env=env, capture_output=True, text=True, timeout=1200)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    if r.returncode == 2:   # un plantage se montre (il n'est jamais un verdict) : la fin de ce que le banc a ecrit
        print('       [plantage] ' + ' | '.join(((r.stderr or '') + (r.stdout or '')).strip().split('\n')[-6:])[:900])
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nfiab_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, symlinks=False,
                    ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    # un ou plusieurs prefixes separes par des virgules (« F21,F23 ») : on ne rejoue que celles-la (et leurs parties saines)
    seuls = [x for x in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if x]
    choisie = lambda nom: not seuls or any(nom.startswith(x + ' ') for x in seuls)
    # ⛔ Toutes les ancres d'abord, sur le depot (lecture seule) : une ancre absente ou multiple arrete tout AVANT le premier banc.
    # ⚖️ Sauf une : une mutation du serveur (D-141) sur un Code.js qui n'a pas D-141 (celui de master, ou une integration sans le
    #    GO serveur) est SANS OBJET — listee, jamais comptee conforme (comme les temoins tD du banc).
    cj = open(os.path.join(SRC, CJ), encoding='utf-8').read()
    sans_d141 = '_nutRazFavoris_(' not in cj
    sans_objet = set()
    for nom, rempl, _, _, _ in MUT:
        if not choisie(nom):   # NIDT (27/10) : avec un filtre, seules les ancres des mutations CHOISIES sont verifiees (sur master, `Code.js` n'a ni D-141 ni `hiddenFoods` : leurs ancres n'existent pas)
            continue
        for f, old, _new in rempl:
            n = open(os.path.join(SRC, f), encoding='utf-8').read().count(old)
            if n == 0 and f == CJ and sans_d141 and nom.startswith('D'):
                sans_objet.add(nom); continue
            if n != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) dans %s : %s' % (n, f, nom)); return 1
    parties = sorted(set(m[4] for m in MUT if choisie(m[0]) and m[0] not in sans_objet))
    for p in parties:
        tmp0, a0 = cloner()
        rc, res, r0 = banc(a0, p)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rc != 0:   # un refus dit QUEL temoin (25/10 : un rouge de l'arbre sain, sous charge, restait anonyme)
            print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE (%s) — controle refuse : %s' % (p, res))
            for r in r0: print('       rouge : ' + r[:160])
            return 1
        print('  arbre sain, partie %s : %s (point de depart valide)' % (p, res))
    print()
    conformes, total = 0, 0
    for nom, rempl, attendus, attendu, partie in MUT:
        if not choisie(nom):
            continue
        if nom in sans_objet:
            print('  --  %-92s SANS OBJET (le Code.js du depot n\'a pas D-141)' % nom[:92]); continue
        total += 1
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '--check', f], cwd=arbre, capture_output=True) if f in (N2, B) else \
                subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre, partie)
        shutil.rmtree(tmp, ignore_errors=True)
        if attendu == 'GARDE':
            manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
            ok = rc == 1 and not manquants
        else:
            manquants = []
            ok = rc == 0
        conformes += ok
        print('  %s %-92s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:92], attendu, res))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s' % (' · '.join(re.sub(r'^(B-NFIAB(-X)? \S+ \S+).*', r'\1', x) for x in rouges) or 'aucun'))
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
