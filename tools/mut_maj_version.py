#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MAJV (lot E, 15/11/2026) : les temoins B-MAJV savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_maj_version.js`
doit alors rougir AU MOINS UNE fois (ou, pour les deux mutations « regles », le controle 17b de `tools/check_regles.py`). Une mutation qui laisse le banc vert =
un temoin qui ne protege rien (R17, « un test qui ne peut pas rougir rassure sans rien mesurer »). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Chaque mutation dit dans QUEL scenario elle doit etre vue (MAJV_SEUL) : un scenario conduit un vrai service worker (≈ 15-60 s) — on ne rejoue pas les six
pour chacune. « pur » = les temoins de source seuls (instantanes).
Usage : python3 tools/mut_maj_version.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_maj_version.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'coach.js', 'index.html', 'style.css', 'sw.js', 'log.js', 'screens.js', 'state.js')
AP, CJ, IX, CS, SW, LO, SC, ST = 'app.js', 'coach.js', 'index.html', 'style.css', 'sw.js', 'log.js', 'screens.js', 'state.js'


def lire(f):
    return open(os.path.join(SRC, f), encoding='utf-8').read()


# ── les deux numeros, LUS dans l'arbre (aucun numero de version ecrit ici : ils changent a chaque livraison) ──
_BUILD = re.search(r"const APP_BUILD='ft-v\d+';", lire(AP))
_CACHE = re.search(r"const CACHE = 'ft-v\d+';", lire(SW))
assert _BUILD and _CACHE, 'APP_BUILD (app.js) ou const CACHE (sw.js) introuvable : rien a muter'
BUILD, CACHE = _BUILD.group(0), _CACHE.group(0)

# ── la caches.keys() d'AVANT (le defaut d'origine, remis tel quel) ──
ANCIEN_LIBELLE = "  if('caches' in window)caches.keys().then(ks=>{ const f=(ks||[]).find(k=>k&&k.indexOf('ft-v')===0); if(f)document.querySelectorAll('.app-ver').forEach(el=>{el.textContent=f;}); });"
ANCIEN_BADGE = ("      if('caches' in window){ caches.keys().then(keys=>{ const ft=keys.find(k=>k.startsWith('ft-v')); const el=document.getElementById('_about-ver'); if(el&&ft)el.textContent=ft; }); }")

APP_VER_LIGNE = "  document.querySelectorAll('.app-ver').forEach(el=>{ if(el.textContent!==APP_BUILD)el.textContent=APP_BUILD; });"
VOIR = "    const voir=!!(window._swReloadPending&&window._majVersion)&&_majPeutSAppliquer()&&window._majFerme!==window._majVersion;"
PLUS_TARD = "function majPlusTard(){\n  window._majFerme=window._majVersion;\n  _majRefresh();\n}"
GARDE_REDEM = "  if(!_majPeutSAppliquer()){\n    if(typeof toast==='function') toast('Pas maintenant"
PERSIST_D_ABORD = "  try{persist();}catch(e){}                                              // on enregistre D'ABORD : le rechargement ne doit rien emporter"
FILTRE_CLE = ".filter(k=>k&&k.indexOf('ft-v')===0&&k!==APP_BUILD).pop()"
LIRE_VERSION = "  _majLireVersion();                                 // cherche la version qui attend et montre le bandeau (`_majRefresh`) si rien ne l'interdit\n"
REGLE_SEANCE = "  if(typeof _seanceOuverte==='function' ? _seanceOuverte()\n     : (S.wkt&&S.wkt.exs&&S.wkt.exs.length)) return false;             // séance non terminée\n"
# lot M (D-170, 17/11/2026) : `ecranLibre` n'existe plus — l'ancre est la ligne qui dit pourquoi l'ecran n'est plus une raison d'attendre
REGLE_ECRAN = "  /* D-170 (lot M, 17/11/2026) : l'ÉCRAN affiché n'est plus une raison d'attendre — la mise à jour ne part plus toute seule, c'est la PERSONNE qui la demande, au moment qu'elle choisit. */"
APPLIQUER = "  if(!_majPeutSAppliquer()){ _majRefresh(); return false; }"
APPEL_PLUS = "  return _appliquerMaj();"
MAJ_LIGNE = "  const maj=(window._swReloadPending&&window._majVersion)?window._majVersion:'';"
TEXTE_BANDEAU = "x.textContent='🔄 Mise à jour '+window._majVersion+' prête';"

# (nom, [(fichier, avant, apres)], attendu, scenarios MAJV_SEUL ('' = pur seul, 'regles' = contrôle 17b de check_regles))
MUT = [
    # ── la VERSION AFFICHEE : le code qui tourne, pas le cache ──
    ('M01 le libellé relit la CLÉ DU CACHE (le défaut d\'origine, remis tel quel) : après une publication il annonce le code NEUF pendant que l\'ANCIEN tourne',
     [(AP, APP_VER_LIGNE, ANCIEN_LIBELLE)], 'GARDE', 'W-log'),
    ('M02 le badge d\'« À propos » relit la CLÉ DU CACHE (le 2ᵉ lecteur de caches.keys(), celui de coach.js)',
     [(CJ, "      setTimeout(()=>{ if(typeof _setAppVersionEls==='function')_setAppVersionEls(); },0);", ANCIEN_BADGE)], 'GARDE', 'W-log'),
    ('M03 `.app-ver` porte aussi la phrase « mise à jour … prête » (l\'export et le banc de Milo la recopieraient comme « version »)',
     [(AP, APP_VER_LIGNE, "  document.querySelectorAll('.app-ver').forEach(el=>{ const x=APP_BUILD+(maj?' · mise à jour '+maj+' prête':''); if(el.textContent!==x)el.textContent=x; });")], 'GARDE', 'W-setup'),
    ('M04 le pied du Menu n\'a plus d\'emplacement pour « mise à jour … prête » (la version qui attend ne se dit plus nulle part dans le Menu)',
     [(IX, '<span class="app-maj" data-pre=" · "></span> · 2026<br>', ' · 2026<br>')], 'GARDE', 'W-setup'),
    ('M05 fermer l\'avis cache AUSSI l\'information (l\'étiquette ne dit plus « mise à jour … prête » une fois « Plus tard » touché)',
     [(AP, MAJ_LIGNE, "  const maj=(window._swReloadPending&&window._majVersion&&window._majFerme!==window._majVersion)?window._majVersion:'';")], 'GARDE', 'W-setup'),
    # ── le GARDE de divergence : un 2ᵉ endroit porte le numéro (R2) ──
    ('M06 APP_BUILD diverge de const CACHE (un nouveau numéro posé à UN seul endroit)',
     [(AP, BUILD, "const APP_BUILD='ft-v1';")], 'GARDE', ''),
    ('M07 const CACHE (sw.js) diverge de APP_BUILD',
     [(SW, CACHE, "const CACHE = 'ft-v1';")], 'GARDE', ''),
    ('M08 la constante APP_BUILD disparaît (renommée : le libellé n\'a plus de source)',
     [(AP, BUILD, BUILD.replace('APP_BUILD', 'APP_BUILD_X'))], 'GARDE', ''),
    ('M09 APP_BUILD déclarée DEUX fois (une seconde copie qui divergerait en silence)',
     [(AP, BUILD, BUILD + '\n' + BUILD)], 'GARDE', ''),
    ('M10 ⛔ check_regles : le contrôle 17b refuse la divergence (APP_BUILD ≠ const CACHE)',
     [(AP, BUILD, "const APP_BUILD='ft-v1';")], 'GARDE', 'regles'),
    ('M11 ⛔ check_regles : le contrôle 17b refuse la constante disparue',
     [(AP, BUILD, BUILD.replace('APP_BUILD', 'APP_BUILD_X'))], 'GARDE', 'regles'),
    # ── l'AVIS : il se voit, sans s'imposer ──
    ('M12 le bandeau ne s\'affiche plus jamais (voir = false) : l\'ancien silence revient',
     [(AP, VOIR, "    const voir=false;")], 'GARDE', 'W-setup'),
    ('M13 la version plus récente n\'est plus cherchée (`_reloadForUpdate` n\'appelle plus `_majLireVersion`) : rien à dire, donc rien de visible',
     [(AP, LIRE_VERSION, "")], 'GARDE', 'W-log'),
    ('M14 le bandeau ne dit plus QUELLE version attend',
     [(AP, TEXTE_BANDEAU, "x.textContent='🔄 Mise à jour prête';")], 'GARDE', 'W-setup'),
    ('M15 « en attente » SANS version plus récente annonce quand même une mise à jour (la clé du code qui tourne n\'est plus écartée : la 1ʳᵉ installation passe pour une mise à jour)',
     [(AP, FILTRE_CLE, ".filter(k=>k&&k.indexOf('ft-v')===0).pop()")], 'GARDE', 'W-setup'),
    ('M16 « Plus tard » ne pose plus son marqueur : l\'avis revient à la réévaluation suivante (R15)',
     [(AP, PLUS_TARD, "function majPlusTard(){\n  _majRefresh();\n}")], 'GARDE', 'W-setup'),
    ('M17 « Plus tard » vaut POUR TOUJOURS (le marqueur ne dit plus quelle version) : une version plus récente ne rouvre plus l\'avis',
     [(AP, VOIR, "    const voir=!!(window._swReloadPending&&window._majVersion)&&_majPeutSAppliquer()&&!window._majFerme;"),
      (AP, PLUS_TARD, "function majPlusTard(){\n  window._majFerme=true;\n  _majRefresh();\n}")], 'GARDE', 'W-setup'),
    ('M18 « Plus tard » ÉCRIT sur l\'appareil (une clé de stockage de plus : une donnée persistée pour rien)',
     [(AP, PLUS_TARD, "function majPlusTard(){\n  window._majFerme=window._majVersion;\n  try{localStorage.setItem('ft4_maj_ferme',String(window._majVersion));}catch(e){}\n  _majRefresh();\n}")], 'GARDE', 'W-setup'),
    ('M19 R24 : la sortie « Plus tard » est retirée du bandeau (plus aucune sortie visible)',
     [(IX, '<button type="button" id="maj-later" onclick="majPlusTard()">Plus tard</button>', '')], 'GARDE', 'W-setup'),
    ('M20 R24 : les boutons du bandeau redeviennent trop petits pour un pouce (24 px)',
     [(CS, "#maj-banner button{ flex:1 1 0; min-height:40px;", "#maj-banner button{ flex:1 1 0; min-height:24px;")], 'GARDE', 'W-setup'),
    ('M21 R24 : le bandeau RECOUVRE le haut de l\'écran au lieu de le pousser (position fixe : l\'en-tête passe dessous)',
     [(CS, "#maj-banner{ display:none; flex-direction:column;", "#maj-banner{ position:fixed; top:0; left:0; right:0; z-index:9998; display:none; flex-direction:column;")], 'GARDE', 'W-setup'),
    ('M22 règle d\'or #9 : le bandeau DÉCALE la barre du bas, donc le bouton central « + » (mesuré avant / pendant)',
     [(CS, "#root.maj-on #maj-banner{ display:flex; }", "#root.maj-on #maj-banner{ display:flex; }\n#root.maj-on .nav{ bottom:40px; }")], 'GARDE', 'W-setup'),
    # ── JAMAIS d'interruption de séance, JAMAIS de perte ──
    ('M23 « Redémarrer maintenant » refuse EN SILENCE pendant une séance (le 1ᵉʳ verrou retiré : la personne appuie et ne sait pas pourquoi rien ne se passe)',
     [(AP, GARDE_REDEM, "  if(false){\n    if(typeof toast==='function') toast('Pas maintenant")], 'GARDE', 'A'),
    ('M33 ⛔⛔ « Redémarrer maintenant » ne demande plus la permission : les DEUX verrous retirés, il recharge MÊME pendant une séance',
     [(AP, GARDE_REDEM, "  if(false){\n    if(typeof toast==='function') toast('Pas maintenant"),
      (AP, APPLIQUER, "  if(false){ _majRefresh(); return false; }")], 'GARDE', 'A'),
    ('M24 ⛔ le bandeau s\'affiche pendant une séance (les gardes ne sont plus lus par l\'avis)',
     [(AP, VOIR, "    const voir=!!(window._swReloadPending&&window._majVersion)&&window._majFerme!==window._majVersion;")], 'GARDE', 'A'),
    ('M25 ⛔⛔ une séance ouverte ne retient plus la mise à jour (la règle « séance non terminée » est retirée de la décision)',
     [(AP, REGLE_SEANCE, "")], 'GARDE', 'A'),
    ('M26 une séance EN PAUSE redevient une séance « finie » (log.js `_seanceOuverte`) : la mise à jour tombe pendant la pause',
     [(LO, "  return !!(S.wkt.startTs || (S.wkt.exs&&S.wkt.exs.length) || _cardioNoteMin()>0);", "  return !S.wkt.pausedAt && !!(S.wkt.startTs || (S.wkt.exs&&S.wkt.exs.length) || _cardioNoteMin()>0);")], 'GARDE', 'A'),
    ('M27 ⛔⛔ « Redémarrer maintenant » ne ENREGISTRE plus d\'abord (persist retiré) : une écriture en mémoire est emportée par le rechargement',
     [(AP, PERSIST_D_ABORD, "")], 'GARDE', 'B'),
    ('M28 ⛔ « Redémarrer maintenant » efface un pan du stockage (les programmes) en passant',
     [(AP, PERSIST_D_ABORD, "  try{persist(); localStorage.removeItem('ft4_progs');}catch(e){}")], 'GARDE', 'B'),
    ('M29 l\'ÉCRAN redevient une raison d\'attendre (la condition « pas sur l\'Accueil » remise dans la décision) : l\'avis ne s\'affiche plus hors de l\'Accueil et « Mettre à jour » refuse',
     [(AP, REGLE_ECRAN, REGLE_ECRAN + "\n  if(window._curScreen&&window._curScreen!=='home') return false;")], 'GARDE', 'W-setup'),
    # ── lot M (D-170, 17/11/2026) : M30 / M31 / M32 REECRITES — leur invariant (« la mise à jour s'applique, et se réévalue au bon moment ») est GARDE, leur sens change : plus d'application automatique ──
    # M30 (AVANT : « `_appliquerMaj` oublie la demande explicite (`demande`) » — le paramètre n'existe plus) devient : le bouton « Mettre à jour » n'appelle plus `_appliquerMaj` (il ne fait plus rien).
    ('M30 ⛔ le bouton « Mettre à jour » n\'appelle plus `_appliquerMaj` (`majRedemarrer` enregistre puis ne recharge pas) : le choix de la personne ne produit rien',
     [(AP, APPEL_PLUS, "  return false;")], 'GARDE', 'B'),
    # M31 (AVANT : « le retour à l'Accueil n'applique plus la mise à jour : l'application automatique est perdue ») devient son CONTRAIRE : le retour à l'Accueil RE-applique tout seul (le rechargement automatique de ft-v1184 revient).
    ('M31 ⛔⛔ le retour à l\'Accueil applique de nouveau la mise à jour TOUT SEUL (le rechargement automatique de ft-v1184 revient, screens.js)',
     [(SC, "  if(id==='home'&&_prevScreen!=='home'){ try{ if(typeof _majRepropose==='function')_majRepropose(); }catch(e){} }",
           "  if(id==='home'){ try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){} }")], 'GARDE', 'A'),
    # M32 (AVANT : « `persist()` ne réévalue plus la mise à jour ») : meme invariant, nouvelle ligne (`_majRefresh`).
    ('M32 `persist()` ne réévalue plus l\'avis (state.js) : l\'avis retenu pendant la séance ne reparaît pas à sa fin',
     [(ST, "  try{ if(typeof _majRefresh==='function')_majRefresh(); }catch(e){}\n  _cloudSyncDebounced();", "  _cloudSyncDebounced();")], 'GARDE', 'A'),
    ('M36 ⛔⛔ `persist()` applique de nouveau la mise à jour TOUT SEUL (state.js : le rechargement automatique revient par l\'enregistrement)',
     [(ST, "  try{ if(typeof _majRefresh==='function')_majRefresh(); }catch(e){}\n  _cloudSyncDebounced();", "  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}\n  _cloudSyncDebounced();")], 'GARDE', 'A'),
    ('M37 ⛔⛔ l\'arrivée d\'une nouvelle version recharge de nouveau (`_reloadForUpdate` rappelle `_appliquerMaj`, le service worker déclenche le rechargement)',
     [(AP, LIRE_VERSION, LIRE_VERSION + "  _appliquerMaj();\n")], 'GARDE', 'W-home'),
    ('M34 une erreur JS non attrapée à la réception de la mise à jour (l\'écouteur du service worker plante : plus d\'avis, plus de toast)',
     [(AP, LIRE_VERSION, "  _majLireVersion(); __erreur_de_test__();\n")], 'GARDE', 'W-log'),
]

MUT += [
    ('M35 le code courant ne regroupe plus « X - échauffement » + « X » (log.js `_echNomQueue` rend toujours null) : l\'import — la conséquence vue le 14/11 — redevient fautif, et W3 comme l\'oracle le voient',
     [(LO, "function _echNomQueue(name){", "function _echNomQueue(name){return null;")], 'GARDE', 'O,W-home'),
]

BANC = os.path.join('tools', 'banc_maj_version.js')


def banc(arbre, scenarios):
    env = dict(os.environ, TZ='Europe/Paris')
    arg = ['pur']
    if scenarios == 'tout':
        arg = []
    elif scenarios:
        env['MAJV_SEUL'] = scenarios
        arg = []
    r = subprocess.run(['node', BANC] + arg, cwd=arbre, capture_output=True, text=True, timeout=1800, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def regles(arbre):
    r = subprocess.run([sys.executable, os.path.join('tools', 'check_regles.py')], cwd=arbre, capture_output=True, text=True, timeout=300)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if l.startswith('❌') and 'version du code' in l]
    return rouges if (rouges and r.returncode != 0) else [], ('exit %d' % r.returncode)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_majv_')
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
        rouges, bilan = regles(arbre) if scenarios == 'regles' else banc(arbre, scenarios)
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
