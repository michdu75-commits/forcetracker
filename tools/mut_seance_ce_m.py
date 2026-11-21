#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SCCM (CE lot M, 16/11/2026 : D-170, D-173, D-176) : les temoins B-SCCM savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT (ou retire une protection) ; le banc `tools/banc_seance_ce_m.js` doit alors rougir AU MOINS UNE fois. Une mutation qui laisse
le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche INVALIDE.
Chaque mutation dit dans QUELLE partie du banc elle doit etre vue : ('pur', None) source seule (instantane) · ('ecran', 'F|S|H|B') · ('maj', 'A|B|C|D') — SCCM_SEUL.
Usage : python3 tools/mut_seance_ce_m.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=T01 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_ce_m.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'coach.js', 'log.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js', 'style.css', 'index.html')
AP, CJ, LO, TR, CS, SC, IX = 'app.js', 'coach.js', 'log.js', 'tracking.js', 'style.css', 'screens.js', 'index.html'

# ── ancres (le texte EXACT du code sain) ──
FB_CORPS = "    const corps=lire?await Promise.race([lire(resp),delai]):undefined;"
FB_ABORT = "try{ if(ctl) ctl.abort(); }catch(_e){}"
FB_SIGNAL = "Object.assign({},init,ctl?{signal:ctl.signal}:{})"
FB_FETCH = "await Promise.race([fetch(url,Object.assign({},init,ctl?{signal:ctl.signal}:{})),delai]);"
FB_FINALLY = "  }finally{ clearTimeout(tId); }"
SYNC_DELAI = ",8000,r=>r.text().catch(()=>'(body illisible)'));"
TOAST_TIMEOUT = "}else if(res&&res.timeout) toast("
TRY_POSE = "  try{\n  _dbfVolPoser(sid);"
CSS_MASQUE = "#root:not(.on-home) .topbar{display:none;}"
CSS_SEANCE = "#root.on-log.seance-on .topbar{display:flex;}"
CSS_SAFE = "#root:not(.on-home):not(.maj-on):not(.demo-on) .screens{margin-top:env(safe-area-inset-top,0px);}"
CSS_SAFE_SEANCE = "html #root.on-log.seance-on:not(.on-home) .screens{margin-top:0;}"
CSS_BANDEAU = "#root.maj-on #maj-banner{ display:flex; }"
CSS_BANDEAU_DEF = "#maj-banner{ display:none; flex-direction:column;"
VOIR = "&&_majPeutSAppliquer()&&window._majFerme!==window._majVersion;"   # lot M (D-170, 17/11/2026) : plus de parametre d'ecran
PALIER_FN = "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&si>=_dropDebut(ex); }"
SPLICE = "    ex.sets.splice(k,1);\n    const recaler"
ATT_RECALE = "    _pdcAtt=recaler(_pdcAtt)||null; const _attPdc=_pdcAtt;"
ATT_RESTAURE = "    if(_attPdc){ _pdcAtt=_attPdc; _pdcMajChamp(_attPdc.ei,_attPdc.si); }\n"
LIGNE_PALIER = "    if(_estPalierDrop(ex,si)&&!_serieSupprimable(ex,si)) return `<div style="
LIGNE_PALIER_ANCIEN = "    if(_estPalierDrop(ex,si)) return `<div style="   # l'etat d'avant le lot D : TOUT palier verrouille
PHRASE = "Dernier palier du dropset : le retirer laisserait un dropset sans palier, rien n'est supprimé."
OKPAL = "const ok=k=>!_estPalierDrop(ex,k)||_nbPaliers(ex)>=2;"
REGLE_SUIT = "    if(_estPalierDrop(ex,k)) ex.dropset.paliers=_nbPaliers(ex)-1;"
CONFIRME = "  if(set.done) showConfirm((_estPalierDrop(ex,si)?"
HOME_TOGGLE = "classList.toggle('on-home',id==='home')"
ROOT_HOME = '<div id="root" class="on-home">'

# (nom, [(fichier, avant, apres)], attendu, (partie, scenarios))
MUT = [
    # ── D-170 : l'attente réseau SE TERMINE (l'outil `_fetchBorne`, la fin de séance, le briefing) ──
    ('T01 ⛔⛔ le DÉFAUT d\'origine remis : le minuteur est levé AVANT la lecture du corps, qui attend sans délai (sonde U07)',
     [(TR, FB_CORPS, "    clearTimeout(tId); const corps=lire?await lire(resp):undefined;")], 'GARDE', ('ecran', 'F')),
    ('T02 ⛔ l\'abandon ne coupe plus la requête (`ctl.abort()` retiré) : la connexion reste ouverte',
     [(TR, FB_ABORT, "")], 'GARDE', ('ecran', 'F')),
    ('T03 ⛔⛔ la requête ne porte plus le SIGNAL d\'annulation (réseau réel : le serveur ne voit jamais la connexion coupée)',
     [(TR, FB_SIGNAL, "init")], 'GARDE', ('maj', 'A')),
    ('T04 ⛔ l\'attente des EN-TÊTES n\'est plus en course avec le délai (un serveur qui ne répond jamais suspend la fin de séance)',
     [(TR, FB_FETCH, "await fetch(url,Object.assign({},init,ctl?{signal:ctl.signal}:{}));")], 'GARDE', ('ecran', 'F')),
    ('T05 ⛔ le minuteur n\'est plus levé en sortie (un abandon tardif tomberait après coup)',
     [(TR, FB_FINALLY, "  }finally{ }")], 'GARDE', ('ecran', 'F')),
    ('T06 ⛔⛔ le délai de la fin de séance devient énorme (8 000 s) : la séance reste suspendue, le récapitulatif ne s\'ouvre jamais',
     [(TR, SYNC_DELAI, ",8000000,r=>r.text().catch(()=>'(body illisible)'));")], 'GARDE', ('maj', 'A')),
    ('T07 ⛔ l\'issue d\'un délai n\'est plus dite (le message « Réseau trop lent — ta séance est gardée » disparaît)',
     [(LO, TOAST_TIMEOUT, "}else if(false) toast(")], 'GARDE', ('pur', None)),
    ('T08 ⛔ le `try` du briefing est de nouveau ouvert APRÈS la construction de la consigne (une exception laisse l\'analyse « en vol » pour toujours)',
     [(LO, TRY_POSE, "  _dbfVolPoser(sid);\n  try{")], 'GARDE', ('pur', None)),
    # ── D-170 : le bandeau de mise à jour, sur l'Accueil ──
    ('B01 ⛔ le bandeau n\'existe de nouveau PAS sur l\'Accueil (l\'exception `:not(.on-home)` est remise)',
     [(CS, CSS_BANDEAU, "#root.maj-on:not(.on-home) #maj-banner{ display:flex; }")], 'GARDE', ('ecran', 'B')),
    ('B02 ⛔⛔ le bandeau ne consulte plus la décision « peut-on appliquer ? » : il paraît pendant une opération active',
     [(AP, VOIR, "&&window._majFerme!==window._majVersion;")], 'GARDE', ('ecran', 'B')),
    ('B03 ⛔ « Plus tard » n\'est plus respecté : l\'avis revient sans cesse',
     [(AP, VOIR, "&&_majPeutSAppliquer();")], 'GARDE', ('ecran', 'B')),
    ('B04 ⛔ le bandeau est posé PAR-DESSUS l\'écran (position fixe) : il recouvre l\'en-tête au lieu de le pousser',
     [(CS, CSS_BANDEAU_DEF, "#maj-banner{ position:fixed;top:0;left:0;right:0;z-index:50; display:none; flex-direction:column;")], 'GARDE', ('ecran', 'B')),
    # ── D-173 : supprimer la série choisie dans les structures dégressives ──
    ('S01 ⛔⛔ la notion de PALIER disparaît (tout est série normale : le réglage de la chaîne ne suit plus, la feuille ne dit plus « Palier »)',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return false; }")], 'GARDE', ('ecran', 'S')),
    ('S02 ⛔ TOUT le dropset est de nouveau exclu (la série normale ne se supprime plus : le défaut d\'avant)',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset); }")], 'GARDE', ('ecran', 'S')),
    ('S03 ⛔ la frontière série / palier est décalée d\'un cran (une série normale devient un palier)',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&si>=_dropDebut(ex)-1; }")], 'GARDE', ('ecran', 'S')),
    ('S04 ⛔⛔ le sens PDC en attente n\'est plus recalé (la sonde S05) : il garde l\'ancien index',
     [(LO, ATT_RECALE, "    const _attPdc=_pdcAtt;")], 'GARDE', ('ecran', 'S')),
    ('S05 ⛔ le sens PDC en attente n\'est pas rétabli après le redessin : le champ perd son focus, le sens est oublié',
     [(LO, ATT_RESTAURE, "")], 'GARDE', ('ecran', 'S')),
    ('S06 ⛔ TOUT palier est de nouveau verrouillé dans la feuille (l\'état d\'avant le lot D : D-173 refusé)',
     [(LO, LIGNE_PALIER, LIGNE_PALIER_ANCIEN), (LO, OKPAL, "const ok=k=>!_estPalierDrop(ex,k);")], 'GARDE', ('ecran', 'S')),
    ('S07 ⛔ la feuille ne DIT plus pourquoi le dernier palier est verrouillé (la contradiction est cachée)',
     [(LO, PHRASE, "…")], 'GARDE', ('ecran', 'S')),
    ('S08 ⛔⛔ le DERNIER palier restant se supprime (le dropset reste sans palier : sémantique non décidée tranchée en silence)',
     [(LO, OKPAL, "const ok=k=>true;")], 'GARDE', ('ecran', 'S')),
    ('S08b ⛔ la ligne du dernier palier n\'est plus verrouillée dans la feuille (cliquable, mais la fonction refuse : un bouton qui ne fait rien)',
     [(LO, LIGNE_PALIER, "    if(false) return `<div style=")], 'GARDE', ('ecran', 'S')),
    ('S08c ⛔⛔ le réglage ne SUIT plus : un palier part mais `dropset.paliers` garde l\'ancien nombre (« 3 paliers » sur 2 lignes)',
     [(LO, REGLE_SUIT, "")], 'GARDE', ('ecran', 'S')),
    ('S08d ⛔ le réglage retire DEUX paliers au lieu d\'un',
     [(LO, REGLE_SUIT, "    if(_estPalierDrop(ex,k)) ex.dropset.paliers=_nbPaliers(ex)-2;")], 'GARDE', ('ecran', 'S')),
    ('S08e ⛔ un palier ne se supprime que s\'il en reste TROIS (le palier isolé est de nouveau refusé à 2)',
     [(LO, OKPAL, "const ok=k=>!_estPalierDrop(ex,k)||_nbPaliers(ex)>=3;")], 'GARDE', ('ecran', 'S')),
    ('S08f ⛔⛔ un palier DÉJÀ POINTÉ part sans confirmation (volume, records et calories perdus en silence)',
     [(LO, CONFIRME, "  if(set.done&&!_estPalierDrop(ex,si)) showConfirm((_estPalierDrop(ex,si)?")], 'GARDE', ('ecran', 'S')),
    ('S09 ⛔⛔ supprimer une série normale d\'un dropset efface aussi son RÉGLAGE (la structure est perdue)',
     [(LO, SPLICE, "    ex.sets.splice(k,1); if(ex.dropset) delete ex.dropset;\n    const recaler")], 'GARDE', ('ecran', 'S')),
    ('S10 ⛔ supprimer une série d\'un dégressif IMPORTÉ efface son marqueur de chaîne',
     [(LO, SPLICE, "    ex.sets.splice(k,1); if(ex.dropChaine) delete ex.dropChaine;\n    const recaler")], 'GARDE', ('ecran', 'S')),
    ('S11 ⛔ la suppression retire de nouveau la DERNIÈRE série (le palier part au lieu de la série choisie)',
     [(LO, SPLICE, "    ex.sets.pop();\n    const recaler")], 'GARDE', ('ecran', 'S')),
    ('S12 ⛔ un nom d\'exercice du catalogue est codé en dur dans la règle des paliers',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&ex.name!=='Squat'&&si>=_dropDebut(ex); }")], 'GARDE', ('ecran', 'S')),
    # ── D-176 : l'en-tête global n'existe que sur l'Accueil ──
    ('H01 ⛔⛔ l\'en-tête n\'est masqué QUE sur l\'écran Séance (une liste d\'écrans au lieu de la règle générique)',
     [(CS, CSS_MASQUE, "#root.on-log .topbar{display:none;}")], 'GARDE', ('ecran', 'H')),
    ('H02 ⛔ la règle est retirée : l\'en-tête global reste partout (l\'état d\'avant)',
     [(CS, CSS_MASQUE, "")], 'GARDE', ('ecran', 'H')),
    ('H03 ⛔⛔ l\'en-tête de SÉANCE est masqué aussi (« Terminer » et le chrono disparaissent pendant une séance)',
     [(CS, CSS_SEANCE, "")], 'GARDE', ('ecran', 'H')),
    ('H04 ⛔ l\'en-tête est rendu invisible (`visibility:hidden`) au lieu d\'être retiré : une BANDE VIDE reste en haut',
     [(CS, CSS_MASQUE, "#root:not(.on-home) .topbar{visibility:hidden;}")], 'GARDE', ('ecran', 'H')),
    ('H05 ⛔ la zone sûre du haut n\'est plus rendue à l\'écran (le contenu passe sous l\'encoche)',
     [(CS, CSS_SAFE, "")], 'GARDE', ('ecran', 'H')),
    ('H06 ⛔ la marge de zone sûre s\'ajoute SOUS le bandeau de mise à jour (double marge)',
     [(CS, CSS_SAFE, "#root:not(.on-home):not(.demo-on) .screens{margin-top:env(safe-area-inset-top,0px);}")], 'GARDE', ('ecran', 'H')),
    ('H07 ⛔ la marge de zone sûre s\'ajoute SOUS l\'en-tête de séance (bande vide sous « Terminer »)',
     [(CS, CSS_SAFE_SEANCE, "")], 'GARDE', ('ecran', 'H')),
    ('H08 ⛔ l\'Accueil et « cycle » partagent l\'en-tête (la classe `on-home` est posée à tort sur un autre écran)',
     [(SC, HOME_TOGGLE, "classList.toggle('on-home',id==='home'||id==='cycle')")], 'GARDE', ('ecran', 'H')),
    ('H09 ⛔ la classe `on-home` est posée par PRÉFIXE du nom (un écran futur « home2 » garde l\'en-tête)',
     [(SC, HOME_TOGGLE, "classList.toggle('on-home',id.indexOf('home')===0)")], 'GARDE', ('ecran', 'H')),
    ('H10 ⛔⛔ rendre la place de l\'en-tête DÉPLACE la barre du bas (règle d\'or #9) : le bouton central bouge',
     [(CS, CSS_SEANCE, CSS_SEANCE + "\n#root:not(.on-home) .nav{margin-bottom:-20px;}")], 'GARDE', ('ecran', 'H')),
    ('H11 ⛔ `#root` ne démarre plus sur l\'Accueil dans le HTML (un premier affichage sans en-tête)',
     [(IX, ROOT_HOME, '<div id="root" class="">')], 'GARDE', ('pur', None)),
]

BANC = os.path.join('tools', 'banc_seance_ce_m.js')


def banc(arbre, spec):
    env = dict(os.environ, TZ='Europe/Paris')
    partie, seul = spec if spec != 'tout' else ('tout', None)
    arg = [] if partie == 'tout' else [partie]
    if seul:
        env['SCCM_SEUL'] = seul
    try:
        r = subprocess.run(['node', BANC] + arg, cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    except subprocess.TimeoutExpired:
        return ['DELAI : le scenario ne finit pas (une page suspendue est un defaut vu, pas un vert)'], '?'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_sccm_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
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
    for nom, remplacements, attendu, spec in MUT:
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
        rouges, bilan = banc(arbre, spec)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        sys.stdout.flush()
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
