#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION V2 · FIABILITE DES DONNEES (mission P1 de Michel, 24/10/2026) : le banc B-NFIAB sait-il
ROUGIR, et au BON endroit ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation REINTRODUIT un defaut corrige (ou en invente un
     que la correction interdit) dans une COPIE ; le banc `tools/banc_nut_fiabilite.js` y est rejoue sur la seule partie visee
     (`NUTF_PARTIE` : ecran ou croise), avec `NUTF_RACINE` = la copie.
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

REPRISE = "function _n2RepriseIdentite(R0, src){\n  if(!R0 || !R0.ok || R0.fiche) return R0;\n"
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

MUT = [
    # ── la reprise d'un aliment : son IDENTITE, sa fiche retrouvee, ses issues ──
    ('F1 dans l\'ecran, la fiche n\'est plus retrouvee par l\'identite du produit (code-barres, ciqual:)',
     [(A, REPRISE, REPRISE.replace("  if(!R0 || !R0.ok || R0.fiche) return R0;\n", "  return R0;\n"))], E('T02 ⑥b'), 'GARDE', 'ecran'),
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
     [(A, CONTR, CONTR + "  return null;\n")], E('T06 ①', 'T06 ③'), 'GARDE', 'ecran'),
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
    ('F22 « Restaurer » rend les favoris d\'avant la remise a zero', [(SE, RESTAURE_F, "")], X('T08 ⑤'), 'GARDE', 'croise'),
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
    for nom, rempl, _, _, _ in MUT:
        for f, old, _new in rempl:
            n = open(os.path.join(SRC, f), encoding='utf-8').read().count(old)
            if n != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) dans %s : %s' % (n, f, nom)); return 1
    parties = sorted(set(m[4] for m in MUT if choisie(m[0])))
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
