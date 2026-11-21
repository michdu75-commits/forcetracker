#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SCFM (mission de fermeture, lot M, 17/11/2026 : D-170 sans rechargement automatique) : les temoins B-SCFM savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET un defaut (rechargement automatique, relance apres « Plus tard »...) ou RETIRE une garde ; le banc `tools/banc_seance_cf_m.js` doit alors rougir AU MOINS UNE fois.
Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Chaque mutation dit dans QUEL scenario elle doit etre vue (SCFM_SEUL) : 'pur' = les temoins de source seuls (instantanes).
Usage : python3 tools/mut_seance_cf_m.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_cf_m.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'screens.js', 'state.js', 'index.html', 'style.css')
AP, SC, ST, IX, CS = 'app.js', 'screens.js', 'state.js', 'index.html', 'style.css'

LIRE_VERSION = "  _majLireVersion();                                 // cherche la version qui attend et montre le bandeau (`_majRefresh`) si rien ne l'interdit\n"
TOAST = "toast('Mise à jour disponible — elle te sera proposée après ta séance ou ton enregistrement','info');"
APPEL = "  return _appliquerMaj();"
PLUS_TARD = "function majPlusTard(){\n  window._majFerme=window._majVersion;\n  _majRefresh();\n}"
REPROPOSE_APPEL = "  if(id==='home'&&_prevScreen!=='home'){ try{ if(typeof _majRepropose==='function')_majRepropose(); }catch(e){} }"
PERSIST_AVIS = "  try{ if(typeof _majRefresh==='function')_majRefresh(); }catch(e){}\n  _cloudSyncDebounced();"
FIN_LECTEUR = "  if(typeof _finishing!=='undefined' && _finishing) return false;      // fin de séance en cours — levé par la FIN de `finishWorkout` (`finally`), jamais par l'écoulement d'un délai (lot M)\n"
ECRAN = "  /* D-170 (lot M, 17/11/2026) : l'ÉCRAN affiché n'est plus une raison d'attendre — la mise à jour ne part plus toute seule, c'est la PERSONNE qui la demande, au moment qu'elle choisit. */"
_BUILD = re.search(r"const APP_BUILD='ft-v\d+';", open(os.path.join(SRC, AP), encoding='utf-8').read())
assert _BUILD, 'APP_BUILD introuvable : rien a muter'
BUILD = _BUILD.group(0)
BOUTON = '>Mettre à jour</button>'
APP_VER_LIGNE = "  document.querySelectorAll('.app-ver').forEach(el=>{ if(el.textContent!==APP_BUILD)el.textContent=APP_BUILD; });"

# (nom, [(fichier, avant, apres)], attendu, scenarios SCFM_SEUL ('pur' = source seule))
MUT = [
    # ── les trois chemins qui rechargeaient tout seuls (le defaut de ft-v1184 que Michel a retire) ──
    ('M01 ⛔⛔ le retour à l\'Accueil applique de nouveau la mise à jour TOUT SEUL (screens.js)',
     [(SC, REPROPOSE_APPEL, "  if(id==='home'){ try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){} }")], 'GARDE', 'F'),
    ('M02 ⛔⛔ `persist()` applique de nouveau la mise à jour TOUT SEUL (state.js)',
     [(ST, PERSIST_AVIS, "  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}\n  _cloudSyncDebounced();")], 'GARDE', 'F'),
    ('M03 ⛔⛔ l\'arrivée d\'une nouvelle version recharge de nouveau (`_reloadForUpdate` rappelle `_appliquerMaj`)',
     [(AP, LIRE_VERSION, "  _majLireVersion();\n  _appliquerMaj();\n")], 'GARDE', 'F'),
    ('M04 ⛔ les mêmes chemins, vus par la SOURCE seule : un rappel de `_appliquerMaj` hors du bouton (screens.js) fait rougir le témoin de source',
     [(SC, REPROPOSE_APPEL, "  if(id==='home'){ try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){} }")], 'GARDE', 'pur'),
    # ── « Plus tard » : aucune relance ──
    ('M05 ⛔⛔ « Plus tard » programme une RELANCE (un minuteur de 60 s remet l\'avis) : le bandeau revient tout seul',
     [(AP, PLUS_TARD, "function majPlusTard(){\n  window._majFerme=window._majVersion;\n  _majRefresh();\n  setTimeout(()=>{ window._majFerme=null; _majRefresh(); },60000);\n}")], 'GARDE', 'F'),
    ('M06 ⛔ la même relance, vue par la SOURCE seule (aucun minuteur dans la chaîne de mise à jour)',
     [(AP, PLUS_TARD, "function majPlusTard(){\n  window._majFerme=window._majVersion;\n  _majRefresh();\n  setTimeout(()=>{ window._majFerme=null; _majRefresh(); },60000);\n}")], 'GARDE', 'pur'),
    ('M07 ⛔ « Plus tard » ne ferme rien (le marqueur n\'est plus posé)',
     [(AP, PLUS_TARD, "function majPlusTard(){\n  _majRefresh();\n}")], 'GARDE', 'F'),
    ('M08 ⛔ le retour à l\'Accueil ne re-propose plus jamais la mise à jour fermée (screens.js : `_majRepropose` n\'est plus appelé)',
     [(SC, REPROPOSE_APPEL, "")], 'GARDE', 'F'),
    ('M09 ⛔ la proposition fermée revient à CHAQUE changement d\'écran (le marqueur est levé par tout `goScreen`, pas seulement le retour à l\'Accueil)',
     [(SC, REPROPOSE_APPEL, "  try{ if(typeof _majRepropose==='function')_majRepropose(); }catch(e){}")], 'GARDE', 'F'),
    # ── le choix de la personne ──
    ('M10 ⛔⛔ le bouton « Mettre à jour » n\'appelle plus `_appliquerMaj` (il enregistre puis ne recharge pas) : le choix ne produit rien',
     [(AP, APPEL, "  return false;")], 'GARDE', 'F'),
    ('M11 ⛔ l\'ancien libellé « Redémarrer maintenant » revient sur le bouton',
     [(IX, BOUTON, ">Redémarrer maintenant</button>")], 'GARDE', 'pur'),
    # ── le toast pendant une opération ──
    ('M12 ⛔ le toast ne dit plus QUAND la mise à jour se proposera (« après ta séance ou ton enregistrement »)',
     [(AP, TOAST, "toast('Mise à jour disponible','info');")], 'GARDE', 'F'),
    ('M13 ⛔ le toast n\'est plus montré pendant une opération (la personne n\'est pas prévenue)',
     [(AP, "  if(!_majPeutSAppliquer()&&typeof toast==='function')\n    " + TOAST, "  if(false&&typeof toast==='function')\n    " + TOAST)], 'GARDE', 'F'),
    # ── les verrous sont CONSERVES ──
    ('M14 ⛔⛔ le verrou de fin de séance n\'est plus lu : « Mettre à jour » demandé PENDANT l\'enregistrement recharge la page',
     [(AP, FIN_LECTEUR, "")], 'GARDE', 'F'),
    ('M15 ⛔ l\'ÉCRAN redevient une raison d\'attendre (la condition « pas sur l\'Accueil » remise dans la décision) : la décision lit de nouveau `_curScreen`',
     [(AP, ECRAN, ECRAN + "\n  if(window._curScreen&&window._curScreen!=='home') return false;")], 'GARDE', 'pur'),
    # ── la vraie version est CONSERVEE ──
    # M16 (1re version : « APP_BUILD change ») SURVIVAIT, et c'est le banc qui l'explique : le serveur de publications simulées (`maj_version.js`) RE-POSE `APP_BUILD` à chaque release servie, la mutation était neutralisée avant d'atteindre
    # la page. `APP_BUILD` = const CACHE est gardé par MAJV-D2 (source) ; ici on mute ce que le banc conduit : le LIBELLÉ affiché (`.app-ver`).
    ('M16 ⛔ l\'étiquette de version n\'affiche plus `APP_BUILD` (le code qui tourne) : « À propos » et le Menu disent autre chose',
     [(AP, APP_VER_LIGNE, "  document.querySelectorAll('.app-ver').forEach(el=>{ if(el.textContent!=='ft-v1')el.textContent='ft-v1'; });")], 'GARDE', 'F'),
    # ══ LOT A DE LA FINALE (17/11/2026) : le « ? » d'écran — scénario 'A' (écran conduit, B-SCFM-A) ou 'pur' (B-SCFM-AP) ══
    ('MA01 ⛔⛔ le « ? » reste visible PENDANT une séance sur l\'écran Séance (la règle qui l\'efface est retirée) : il double l\'en-tête de séance',
     [(CS, "#root.on-log.seance-on #ctx-help{display:none;}\n", "")], 'GARDE', 'A'),
    ('MA02 ⛔⛔ la première rangée de l\'écran ne cède plus 40 px à droite : le « ? » recouvre les onglets / l\'en-tête (UNE règle générique retirée)',
     [(CS, "#root.aide-ecran .screen.active>:first-child{margin-right:40px;}\n", "")], 'GARDE', 'A'),
    ('MA03 ⛔ le « ? » d\'écran apparaît aussi sur l\'Accueil (la condition « pas l\'Accueil » est retirée) : deux « ? » sur la même page',
     [(SC, "const a=id!=='home'&&!!_HELP_DATA[_aideClef(id)];", "const a=!!_HELP_DATA[_aideClef(id)];")], 'GARDE', 'A'),
    ('MA04 ⛔ la zone tactile tombe à 30 × 30 px (trop petite pour le pouce)',
     [(CS, "right:6px;width:44px;height:44px;padding:0;", "right:6px;width:30px;height:30px;padding:0;")], 'GARDE', 'A'),
    ('MA05 ⛔ le Cycle de force n\'a plus d\'aide (la clef « cycle → Accueil » est retirée) : le « ? » disparaît de cet écran et `showHelp` ne s\'ouvre plus',
     [(SC, "function _aideClef(id){ return id==='cycle'?'home':(id||'home'); }", "function _aideClef(id){ return id||'home'; }")], 'GARDE', 'A'),
    ('MA06 ⛔ le « ? » n\'ouvre plus l\'aide de l\'écran mais l\'Aide détaillée du Menu (autre fenêtre, autres textes)',
     [(SC, "b.setAttribute('onclick','showHelp()');", "b.setAttribute('onclick',\"openDrawerContent('help')\");")], 'GARDE', 'A'),
    ('MA07 ⛔ le « ? » passe SOUS l\'écran (z-index négatif) : on ne peut plus le toucher',
     [(CS, "background:transparent;z-index:27;", "background:transparent;z-index:-1;")], 'GARDE', 'A'),
    ('MA08 ⛔ l\'aide de l\'Accueil ne dit plus que chaque écran a gardé son « ? » (texte périmé revenu)',
     [(SC, "aide de chaque écran a gardé sa porte", "aide de l\\'écran est dans le Menu")], 'GARDE', 'pur'),
    ('MA09 ⛔ l\'aide « Supprimer une série précise » redit que les paliers « se règlent ensemble » (texte périmé revenu)',
     [(SC, "chaque <b>palier</b> se supprime comme une série", "les paliers se règlent ensemble")], 'GARDE', 'pur'),
    ('MA10 ⛔ le Profil n\'a plus de « ? » (la règle exclut « setup »)',
     [(SC, "const a=id!=='home'&&!!_HELP_DATA[_aideClef(id)];", "const a=id!=='home'&&id!=='setup'&&!!_HELP_DATA[_aideClef(id)];")], 'GARDE', 'A'),
    ('MA11 ⛔⛔ D-176 rouvert : l\'en-tête GLOBAL revient sur tous les écrans (une barre, pas un bouton)',
     [(CS, "#root:not(.on-home) .topbar{display:none;}", "#root:not(.on-home) .topbar{display:flex;}")], 'GARDE', 'A'),
    ('MA12 ⛔ un nouveau « ? » est créé à chaque changement d\'écran (la garde « un seul bouton » est retirée) : plusieurs boutons superposés',
     [(SC, "if(a&&!b){", "if(a){")], 'GARDE', 'A'),
    ('MA13 ⛔ le « ? » reste visible sans que l\'écran en ait besoin (la règle de visibilité ne lit plus `aide-ecran`) : l\'Accueil et les écrans sans aide en portent un',
     [(CS, "#root.aide-ecran #ctx-help{display:flex;}", "#ctx-help{display:flex;}")], 'GARDE', 'A'),
    ('MA14 ⛔ le « ? » descend au milieu de l\'écran (plus « en haut à droite »)',
     [(CS, "position:absolute;top:8px;right:6px;width:44px;", "position:absolute;top:300px;right:6px;width:44px;")], 'GARDE', 'A'),
    ('MA15 ⛔ le signe « ? » prend la couleur de son disque (invisible, notamment en mode clair)',
     [(CS, "background:var(--bg3);color:var(--t2);font:800 15px/30px", "background:var(--bg3);color:var(--bg3);font:800 15px/30px")], 'GARDE', 'A'),
]

BANC = os.path.join('tools', 'banc_seance_cf_m.js')


def banc(arbre, scenarios):
    env = dict(os.environ, TZ='Europe/Paris')
    arg = ['pur']
    if scenarios == 'tout':
        arg = []
    elif scenarios and scenarios != 'pur':
        env['SCFM_SEUL'] = scenarios
        arg = ['ecran']
    try:
        r = subprocess.run(['node', BANC] + arg, cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    except subprocess.TimeoutExpired:
        return ['DELAI : le scenario ne finit pas (une page qui se recharge en boucle est un defaut vu, pas un vert)'], '?'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_scfm_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le service worker precache les images du catalogue : on les lie (lecture seule) plutot que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    if not os.environ.get('MUT_SANS_BASE'):
        tmp0, a0 = cloner()
        rouges, bilan = banc(a0, 'tout')
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges:
            print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
        print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu, scenarios in MUT:
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
        rouges, bilan = banc(arbre, scenarios)
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
