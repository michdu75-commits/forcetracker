#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — UX INTEGRATION (D-085, 17/10/2026) : les temoins B-UXI-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (claude/ux-seance-01 @ 1ab2b38f), mot pour mot :
les temoins des DECISIONS (Cobalt, Terminer, point bleu, Seance prete, badge de type, onglets Milo, courbes) y rougissent.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SON temoin (4e champ).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
Usage : python3 tools/mut_ux_integration.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '1ab2b38f'
LO, TR, SC, IX, CS, CO, AP, SE = 'log.js', 'tracking.js', 'screens.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js'
FICHIERS = ('log.js', 'tracking.js', 'screens.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (claude/ux-seance-01 @ 1ab2b38f)", 'AVANT', 'GARDE', 'B-UXI-A1'),
    # ── B · Terminer Cobalt, rouge reserve au destructif
    ('M1 la classe « fin de seance » n\'est plus retiree a l\'ouverture d\'une autre confirmation (le Cobalt FUIT sur « Vider »)',
     [(LO, "  document.getElementById('ov-confirm').classList.remove('cf-seance');   // D-085 : bouton rouge par défaut (seule la fin de séance le passe en Cobalt)\n", "")], 'GARDE', 'B-UXI-A9'),
    ('M2 [deguisee] la regle Cobalt s\'applique a TOUTES les confirmations (Supprimer / Abandonner deviennent bleus)',
     [(CS, "#ov-confirm.cf-seance #confirm-ok{", "#ov-confirm #confirm-ok{")], 'GARDE', 'B-UXI-A10'),
    ('M3 [deguisee] « Continuer la seance » retire un exercice (Terminer n\'est plus intelligent)',
     [(LO, "()=>finishWorkout(),'Terminer quand même','Continuer la séance');", "()=>finishWorkout(),'Terminer quand même','Continuer la séance',()=>{S.wkt.exs.pop();persist();renderLog();});")], 'GARDE', 'B-UXI-A8'),
    # ── M · Seance prete (affichage seul)
    ('M4 « Seance prete » n\'est jamais reconnue', [(LO, "function _seancePrete(){\n  if(!_seanceOuverte()||S.wkt.startTs) return false;", "function _seancePrete(){\n  return false;\n  if(!_seanceOuverte()||S.wkt.startTs) return false;")], 'GARDE', 'B-UXI-B1'),
    ('M5 [deguisee] une seance « prete » est traitee comme FERMEE (le point du « + » s\'eteint : regle metier changee)',
     [(LO, "  const root=document.getElementById('root'); if(root) root.classList.toggle('seance-on',ouverte);", "  const root=document.getElementById('root'); if(root) root.classList.toggle('seance-on',ouverte&&!_seancePrete());")], 'GARDE', 'B-UXI-B3'),
    ('M6 [deguisee] un cardio note est dit « pret » (rien a enregistrer ignore le cardio)',
     [(LO, "  return !c.fait && !c.cardio && !(_cardioNoteMin()>0);", "  return !c.fait;")], 'GARDE', 'B-UXI-B5'),
    # ── C/D · barre du bas : point bleu, « + » constant, 6 entrees
    ('M7 le bouton central rogne de nouveau le point (overflow)', [(CS, "#nb-log{overflow:visible;}\n", "")], 'GARDE', 'B-UXI-C3'),
    ('M8 le point « nouveaute » revient a droite et chevauche le point de seance', [(CS, "#nb-log .new-dot{right:auto;left:calc(50% - 26px);top:-2px;}\n", "")], 'GARDE', 'B-UXI-C4'),
    ('M9 [deguisee] le « + » grossit de nouveau sur l\'ecran Seance', [(CS, "#nb-log{overflow:visible;}\n", "#nb-log{overflow:visible;}\n#root.on-log .nb-plus{transform:scale(1.06);}\n")], 'GARDE', 'B-UXI-C1'),
    ('M10 le « + » est recentre (deplace apres Nutrition)',
     [(IX, '  <button class="nb" id="nb-nutrition" onclick="goScreen(\'nutrition\',this)">', '  <button class="nb" id="nb-nutrition" onclick="goScreen(\'nutrition\',this)" style="order:-1">')], 'GARDE', 'B-UXI-C2'),
    # ── H · clavier
    ('M11 la barre du bas n\'est plus masquee pendant la saisie', [(CS, "#root.kbd-serie .nav{display:none;}\n", "")], 'GARDE', 'B-UXI-D1'),
    ('M12 [deguisee] la ligne active n\'est plus ramenee au-dessus du clavier', [(LO, "function _garderLigneVisible(el){\n  try{", "function _garderLigneVisible(el){\n  return;\n  try{")], 'GARDE', 'B-UXI-D2'),
    ('M13 [deguisee] la barre ne revient jamais apres la saisie', [(LO, "  setTimeout(()=>{ if(!_estChampSerie(document.activeElement)) _clavierSerie(false); },60);", "  setTimeout(()=>{},60);")], 'GARDE', 'B-UXI-D4'),
    ('M14 [deguisee] tout champ de saisie masque la barre (le Coach aussi)', [(LO, "function _estChampSerie(el){ return !!(el&&el.classList&&el.classList.contains('sinp')&&el.closest&&el.closest('#s-log')); }", "function _estChampSerie(el){ return !!(el&&el.tagName==='INPUT'); }")], 'GARDE', 'B-UXI-D5'),
    ('M15 l\'espace de fin de liste ne protege plus du bas (contenu sous la barre)', [(CS, ".scroll-spacer{flex:0 0 auto;height:calc(max(env(safe-area-inset-bottom,0px),8px) + 110px);}", ".scroll-spacer{flex:0 0 auto;height:8px;}")], 'GARDE', 'B-UXI-E1'),
    # ── E/G/K/L · types, series, cardio
    ('M16 les icones des types reviennent', [(LO, "+'<div class=\"ts-h\">'", "+'<div class=\"ts-h\"><span class=\"ts-ico\">🏋️</span>'")], 'GARDE', 'B-UXI-F1'),
    ('M17 le cardio passe AVANT les types de seance',
     [(IX, '  <div id="log-types" style="padding-top:6px;"></div>\n  <div class="la-sec" id="la-autres">Autres options</div>\n  <div id="log-cardio"></div>',
           '  <div class="la-sec" id="la-autres">Autres options</div>\n  <div id="log-cardio"></div>\n  <div id="log-types" style="padding-top:6px;"></div>')], 'GARDE', 'B-UXI-F3'),
    ('M18 une entree « Autre activite » apparait (decision L : non construite)', [(IX, '  <div id="log-cardio"></div>', '  <div id="log-cardio"></div>\n  <button class="btn btn-bg2">Autre activité</button>')], 'GARDE', 'B-UXI-F4'),
    # R30 — D-086 (18/10) remplace la decision G (badge sur le numero) par une pastille de type dans sa colonne : M19 vise la pastille.
    ('M19 la pastille de type ne montre plus le type', [(LO, '<span class="tbtn ${_tt}">${_tt}</span>', '<span class="tbtn ${_tt}"></span>')], 'GARDE', 'B-UXI-F5'),
    ('M20 [deguisee] le 1RM retourne DANS un bouton', [(LO, "+`<div class=\"srm\" id=\"trm-${ei}-${si}\">${set.done&&set.rm1?'~'+fmt(set.rm1):liveRM?'~'+liveRM:''}</div>`", "+`<button class=\"srm\" id=\"trm-${ei}-${si}\">${set.done&&set.rm1?'~'+fmt(set.rm1):liveRM?'~'+liveRM:''}</button>`")], 'GARDE', 'B-UXI-F6'),
    ('M21 la coche retombe a 30 px (cible trop petite)', [(CS, "#s-log .chk{width:44px;height:44px;", "#s-log .chk{width:30px;height:30px;")], 'GARDE', 'B-UXI-F7'),
    # ── I · Milo
    ('M22 [deguisee] le Coach s\'ouvre toujours sur « Discussion » (l\'arrivee sans discussion change)', [(CO, "return _coachOnglet || ((coachHistory&&coachHistory.length)?'disc':'espace');", "return _coachOnglet || 'disc';")], 'GARDE', 'B-UXI-G1'),
    ('M23 l\'onglet choisi est STOCKE (nouvelle cle persistee)', [(CO, "function coachTab(t){ _coachOnglet=(t==='espace')?'espace':'disc'; _appliquerOngletCoach(); }", "function coachTab(t){ _coachOnglet=(t==='espace')?'espace':'disc'; try{localStorage.setItem('ft4_coachTab',_coachOnglet);}catch(e){} _appliquerOngletCoach(); }")], 'GARDE', 'B-UXI-G3'),
    ('M24 [deguisee] passer sur « Espace Milo » vide le fil de discussion', [(CO, "function coachTab(t){ _coachOnglet=(t==='espace')?'espace':'disc'; _appliquerOngletCoach(); }", "function coachTab(t){ _coachOnglet=(t==='espace')?'espace':'disc'; if(_coachOnglet==='espace')coachHistory=[]; _appliquerOngletCoach(); }")], 'GARDE', 'B-UXI-G5'),
    # ── J · Progres
    ('M25 [deguisee] une BAISSE est affichee en vert', [(SE, "color:${pos?'var(--green)':'var(--red)'};line-height:1;", "color:var(--green);line-height:1;")], 'GARDE', 'B-UXI-H2'),
    # ── equivalente
    ('M26 [equivalente] l\'ordre des deux classes d\'onglet est inverse (meme resultat)',
     [(CO, "  scr.classList.toggle('ct-espace',o==='espace');\n  scr.classList.toggle('ct-disc',o==='disc');", "  scr.classList.toggle('ct-disc',o==='disc');\n  scr.classList.toggle('ct-espace',o==='espace');")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_ux_integration.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_uxi_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
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
                return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
            for f in FICHIERS:
                if f.endswith('.js'):
                    chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
                    if chk.returncode:
                        return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, avant), choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
    tmp1, a1 = cloner()
    rouges1, plantage1 = banc(a1)
    shutil.rmtree(tmp1, ignore_errors=True)
    if rouges1 or plantage1:
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
