#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — UX SEANCE (session-B, 16/10/2026) : les temoins B-UXS-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (master 5a29d149, ft-v1256), mot pour mot.
Chaque mutation exige un TEMOIN PRECIS parmi les rouges (4e champ) : on prouve que CE temoin-la sait rougir.
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [equivalente] ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».

Ce que le brief exige de prouver (une ligne par exigence -> mutation) :
  mauvais compte des echauffements .......... M1 (+ M18 equivalente)
  mauvais N restant .......................... M2 [deguisee], M3
  2e seance creee par le « + » ............... M4
  confirmation de fin retiree ................ M5, M19 (« Reessayer » apres un stockage plein)
  seance active affichee vide ................ M6 [deguisee], M7 [deguisee]
  dock qui couvre une zone critique .......... M8, M9, M10
  serie faite detruite sur le chemin dropset . -> tools/mut_cc01_dropset.py (M1..M11 + MF1..MF11, banc B-CC01)
  action du menu branchee au mauvais proprietaire M11
  et le bouton central immobile (M13, regle d'or #9) ; les decisions ② ③ ④ ⑤ sont prouvees par M00 (temoins rouges sur master).
Usage : python3 tools/mut_seance_ux.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '5a29d149'
LO, TR, SC, IX, CS, CT, CO, AP = 'log.js', 'tracking.js', 'screens.js', 'index.html', 'style.css', 'constants.js', 'coach.js', 'app.js'
FICHIERS = ('log.js', 'tracking.js', 'screens.js', 'index.html', 'style.css', 'constants.js', 'coach.js', 'app.js', 'translations.js')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (master 5a29d149)", 'AVANT', 'GARDE', 'B-UXS-B1'),
    ('M1 un echauffement (É) est compte comme une serie de travail',
     [(LO, "function _estPalierEch(s){ return !!(s && (s.type==='É' || s.type==='W')); }",
           "function _estPalierEch(s){ return !!(s && s.type==='W'); }")], 'GARDE', 'B-UXS-C3'),
    ('M2 [deguisee] « Terminer » compte les echauffements sautes comme des series restantes',
     [(LO, "  const n=_bilanTravailWkt().restantes;",
           "  const n=_bilanTravailWkt().restantes+(S.wkt.exs||[]).reduce((a,ex)=>a+(ex.sets||[]).filter(s=>_estPalierEch(s)&&!s.done).length,0);")], 'GARDE', 'B-UXS-D1'),
    ('M3 le reste de la seance ignore les series deja faites (N restant = total)',
     [(LO, "const b=_bilanTravailEx(ex); total+=b.total; faites+=b.faites; }\n  return {total, faites, restantes:total-faites};",
           "const b=_bilanTravailEx(ex); total+=b.total; faites+=b.faites; }\n  return {total, faites, restantes:total};")], 'GARDE', 'B-UXS-D2'),
    ('M4 le « + » cree une DEUXIEME seance quand une seance est ouverte',
     [(LO, "  if(!ouverte) S.wkt={date:today(),exs:[],startHour:new Date().getHours()};",
           "  S.wkt={date:today(),exs:[],startHour:new Date().getHours()};")], 'GARDE', 'B-UXS-E4'),
    ('M5 la confirmation « Il reste N series » est retiree (Terminer enregistre toujours)',
     [(LO, "  if(n<=0) return finishWorkout();", "  return finishWorkout();")], 'GARDE', 'B-UXS-D2'),
    ('M6 [deguisee] une seance ouverte dont le chrono n\'a pas demarre s\'affiche VIDE',
     [(LO, "function renderExBlocks(){\n  const c=document.getElementById('wkt-exs');\n  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){",
           "function renderExBlocks(){\n  const c=document.getElementById('wkt-exs');\n  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length||!S.wkt.startTs){")], 'GARDE', 'B-UXS-B14'),
    ('M7 [deguisee] l\'en-tete ne reconnait une seance que si son chrono tourne (seance preparee = ecran « avant »)',
     [(LO, "function _renderEnteteSeance(){\n  const ouverte=_seanceOuverte();",
           "function _renderEnteteSeance(){\n  const ouverte=!!(S.wkt&&S.wkt.startTs);")], 'GARDE', 'B-UXS-D7'),
    ('M8 le dock ne degage plus la serie suivante (elle reste sous le dock)',
     [(LO, "function _dockDegager(){\n  try{", "function _dockDegager(){\n  return;\n  try{")], 'GARDE', 'B-UXS-F12'),
    ('M9 l\'espace de fin de liste ne grandit plus pendant le repos (le bas passe sous le dock)',
     [(CS, "#rest-bar.show ~ .scroll-spacer{height:calc(max(env(safe-area-inset-bottom,0px),8px) + 110px + 200px);}", "")], 'GARDE', 'B-UXS-F3'),
    ('M10 le dock se pose SUR la barre de navigation (plus au-dessus)',
     [(CS, "  bottom:calc(max(env(safe-area-inset-bottom),8px) + 76px);z-index:25;", "  bottom:calc(max(env(safe-area-inset-bottom),8px));z-index:25;")], 'GARDE', 'B-UXS-F1'),
    ('M11 « Vider la seance » est branche sur « Abandonner » (mauvais proprietaire)',
     [(LO, "'Vider la séance','Retire les exercices, la séance reste ouverte','closeWktMenu();clearAllEx()'",
           "'Vider la séance','Retire les exercices, la séance reste ouverte','closeWktMenu();clearWkt()'")], 'GARDE', 'B-UXS-M3'),
    ('M13 regle d\'or #9 : le bouton central descend de 3 px quand une seance est ouverte',
     [(CS, "#root.seance-on .nb-plus::after{", "#root.seance-on #nb-log{position:relative;top:3px;}\n#root.seance-on .nb-plus::after{")], 'GARDE', 'B-UXS-E6'),
    ('M19 « 🔄 Reessayer » (stockage plein) contourne la porte de fin (enregistre sans la question)',
     [(LO, "<button class=\"btn btn-red\" onclick=\"terminerSeance()\" style=\"width:100%;\">🔄 Réessayer</button>",
           "<button class=\"btn btn-red\" onclick=\"finishWorkout()\" style=\"width:100%;\">🔄 Réessayer</button>")], 'GARDE', 'B-UXS-D9'),
    # ⛔ RETIREES le 16/10 (consigne de Michel : pas de variante qui n'apporte plus d'information) — M12 (pause branchee
    #    sur « fermer ») : le cablage de CHAQUE ligne du menu est deja eprouve par M11 sur le meme temoin B-UXS-M3 ;
    #    M14 a M17 (decisions ② ③ ④ ⑤) : leurs temoins (B5, F7, A1/A6, E3) etaient ROUGES sur master a l'etape 0 et le
    #    redeviennent sous M00 — leur capacite a rougir est deja prouvee. M13 reste : le « + » ne bougeait pas sur master,
    #    E6 n'avait jamais ete eprouve.
    ('M18 [equivalente] l\'ordre du test des echauffements est inverse (meme sens)',
     [(LO, "function _estPalierEch(s){ return !!(s && (s.type==='É' || s.type==='W')); }",
           "function _estPalierEch(s){ return !!(s && (s.type==='W' || s.type==='É')); }")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_ux.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_uxs_')
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
