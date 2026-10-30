#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — WORKOUT-CORE-01 (Claude N°2, Seance, 30/10/2026) : les temoins CHR-* (et DOM-*) savent-ils ROUGIR ?

[!!] PREPARE, JAMAIS EXECUTE A L'ECRITURE (GO TESTS non accorde le 30/10) : seules la syntaxe de ce fichier et l'UNICITE de
     chaque ancre dans log.js ont ete verifiees. Le premier passage se fait sur GO TESTS, et pas avant.
[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc instable = campagne refusee).
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et [equivalente] ne doivent PAS
faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Chaque mutation GARDE exige un TEMOIN PRECIS (4e champ) parmi les rouges : on prouve que CE temoin-la sait rougir.
Le 5e champ dit quelle partie du banc jouer (chr / dom) : une mutation du metronome ne fait pas tourner les temoins DOM.
Un PLANTAGE du banc (code de sortie hors 0/1, ligne PLANTAGE, ou pas de ligne de total) n'est JAMAIS « garde ».
Une mutation qui casse la SYNTAXE est refusee (elle rougirait tout, elle ne prouve rien).
Usage : python3 tools/mut_workout_core.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LO = 'log.js'
FICHIERS = (LO,)

ARM_START = "  _restArmer();                  // WORKOUT-CORE-01 : LE métronome du repos (1 s, calé) — armé avant le 1ᵉʳ affichage, que la pastille lit\n"
ARM_REPRISE = "  _restArmer();                  // … LE métronome (1 s, calé sur l'heure réelle de ce repos) — armé avant l'affichage, que la pastille lit\n"
ARM_ADDRT = "  _restArmer();                  // WORKOUT-CORE-01 : le départ a bougé, donc les changements de seconde aussi — on recale le tic\n"
ARM_REGLER = "    _restArmer();                // WORKOUT-CORE-01 : nouveau départ, nouveaux changements de seconde — on recale le tic\n"
DESARME_ARM = "  _restDesarmer();                                           // aucun doublon : l'ancien minuteur part toujours d'abord\n"
JETON = "    if(gen!==_restGen) return;                               // périmé : un arrêt ou un autre armement est passé entre-temps\n"
ANNULE = "  if(restIv){ if(_restIvCale) clearTimeout(restIv); else clearInterval(restIv); }"
VISIBLE = "  if(restIv){ _restTick(); _restArmer(); }"

MUT = [
    # ── CHR-03 : un seul metronome, 1 s, cale ──────────────────────────────────────────────────────────────────────────
    ('W01 _pillIv revient : un 2e intervalle a 500 ms pour la pilule',
     [(LO, ARM_START, ARM_START + "  setInterval(_updPill,500);\n")], 'GARDE', 'CHR-T01', 'chr'),
    ('W02 le tic repasse a 250 ms (le reveil compte)',
     [(LO, "    restIv=setInterval(_restTick,1000);", "    restIv=setInterval(_restTick,250);")], 'GARDE', 'CHR-T10a', 'chr'),
    ('W03 [deguisee] le (re)armement n\'enleve plus l\'ancien minuteur (startRest s\'en sort par stopRest ; pas les autres)',
     [(LO, DESARME_ARM, "")], 'GARDE', 'CHR-T02b', 'chr'),
    ('W04 ni annulation ni jeton : un calage perime installe son intervalle apres stopRest',
     [(LO, ANNULE, "  if(restIv&&!_restIvCale) clearInterval(restIv);"), (LO, JETON, "")], 'GARDE', 'CHR-T02c', 'chr'),
    ('W05 [equivalente] l\'armement ponctuel n\'est plus annule : le JETON seul empeche son effet',
     [(LO, ANNULE, "  if(restIv&&!_restIvCale) clearInterval(restIv);")], 'OK', None, 'chr'),
    ('W06 rattrapage au retour : les vibrations des secondes sautees sont rejouees',
     [(LO, VISIBLE, "  if(restIv){ for(let k=5;k>=1;k--){ if(_restLeft()<k&&_restLeft()>0&&!_countdownSecs.has(k)){ _countdownSecs.add(k); if(navigator.vibrate)navigator.vibrate(60); } } _restTick(); _restArmer(); }")],
     'GARDE', 'CHR-T06a', 'chr'),
    ('W07 le temps restant compte les tics au lieu de lire l\'horloge',
     [(LO, "  return restTot-Math.floor((Date.now()-restStartTs)/1000);", "  return restTot-(window.__wcTics||0);"),
      (LO, "function _restTick(){\n  const left=_restLeft();", "function _restTick(){\n  window.__wcTics=(window.__wcTics||0)+1;\n  const left=_restLeft();")],
     'GARDE', 'CHR-T05a', 'chr'),
    ('W08 le callback de fin peut repartir a chaque tic',
     [(LO, "  if(left<=0&&!_restBeeped){", "  if(left<=0){")], 'GARDE', 'CHR-T07', 'chr'),
    ('W09 abandon a 899 s au lieu de 900',
     [(LO, "const REST_DEPASSEMENT_MAX = 900;", "const REST_DEPASSEMENT_MAX = 899;")], 'GARDE', 'CHR-T08', 'chr'),
    ('W10 la reprise montre le repos sans armer le metronome',
     [(LO, ARM_REPRISE, "")], 'GARDE', 'CHR-T09a', 'chr'),
    ('W11 « +15 s » ne recale plus le tic',
     [(LO, ARM_ADDRT, "")], 'GARDE', 'CHR-T05b', 'chr'),
    ('W12 « Regler » ne recale plus le tic',
     [(LO, ARM_REGLER, "")], 'GARDE', 'CHR-T05c', 'chr'),
    ('W13 [deguisee] calage retire : l\'intervalle part tout de suite, a la phase du geste',
     [(LO, "  },(1100-pos)%1000);", "  },0);")], 'GARDE', 'CHR-T05d', 'chr'),
    ('W14 [deguisee] le calage vise la fin de la seconde (+900 ms au lieu de +100 ms)',
     [(LO, "  },(1100-pos)%1000);", "  },(1900-pos)%1000);")], 'GARDE', 'CHR-T05b', 'chr'),
    ('W15 le retour au premier plan ne recale plus le metronome',
     [(LO, VISIBLE, "  if(restIv){ _restTick(); }")], 'GARDE', 'CHR-T05a', 'chr'),
    ('W16 la memoire des valeurs ecrites survit a l\'arret (ecran faux au repos suivant)',
     [(LO, "  _restVu.clear();               // … et la mémoire des valeurs écrites : les lignes ci-dessous remettent l'écran à zéro\n", "")],
     'GARDE', 'CHR-T11', 'chr'),
    ('W17 [equivalente] le decompte ne vide plus la memoire a l\'OUVERTURE (sa fermeture le fait deja)',
     [(LO, "  _restVu.clear(); _cdownLit=-1;   // WORKOUT-CORE-01 : l'écran vient d'être remis à zéro à la main — tout réécrire au 1ᵉʳ rendu\n", "")],
     'OK', None, 'chr'),
    ('W18 textes reecrits a chaque tic (memoire desactivee)',
     [(LO, "function _vuTexte(el,cle,v){ if(!el||_restVu.get(cle)===v) return;", "function _vuTexte(el,cle,v){ if(!el) return;")],
     'GARDE', 'CHR-T10b', 'chr'),
    ('W19 les 44 traits repeints a chaque tic',
     [(LO, "  const de=_cdownLit<0?0:Math.min(_cdownLit,litCount), a=_cdownLit<0?ln.length:Math.max(_cdownLit,litCount);",
       "  const de=0, a=ln.length;")], 'GARDE', 'CHR-T10e', 'chr'),
    ('W20 revenir sur Seance arrete le repos (navigation = fin)',
     [(LO, "  if(restIv)_restTick();\n  renderCardioBlock();", "  if(restIv)stopRest();\n  renderCardioBlock();")], 'GARDE', 'CHR-T04', 'chr'),
    ('W21 [negatif] un commentaire du metronome est reformule',
     [(LO, "// ⏱️ WORKOUT-CORE-01 — retire le métronome, qu'il soit encore en calage (armement ponctuel) ou installé (intervalle).",
       "// WORKOUT-CORE-01 : retire le métronome (calage ou intervalle).")], 'OK', None, 'chr'),
]


def banc(arbre, partie):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_workout_core.js', partie], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_wc_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m):
    nom, remplacements, attendu, temoin, partie = m
    tmp, arbre = cloner()
    try:
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
            chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
            if chk.returncode:
                return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre, partie)
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
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parties = sorted({m[4] for m in choix})
    for p in parties:   # l'arbre sain d'abord : 0 rouge sur chaque partie jouee, sinon la campagne ne prouve rien
        tmp0, a0 = cloner()
        rouges, plantage = banc(a0, p)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges or plantage:
            print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE (%s) — controle refuse :' % p, ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge sur %s (point de depart valide) · MUT_J=%s\n' % (','.join(parties), os.environ.get('MUT_J', '1')), flush=True)
    conformes = 0
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        futs = [ex.submit(une, m) for m in choix]
        for fu in as_completed(futs):
            nom, ok, obtenu, rouges = fu.result()
            if ok is None:
                print('  INVALIDE  %s %s' % (nom, obtenu), flush=True); continue
            conformes += ok
            print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''), flush=True)
            if os.environ.get('MUT_DETAIL'):
                for r in rouges[1:]:
                    print('        ' + r, flush=True)
    for p in parties:   # rejoue de l'arbre sain a la fin : un banc instable invalide la campagne
        tmp1, a1 = cloner()
        rouges1, plantage1 = banc(a1, p)
        shutil.rmtree(tmp1, ignore_errors=True)
        if rouges1 or plantage1:
            print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL (%s) — campagne refusee (banc instable) :' % p, ([plantage1] if plantage1 else []) + rouges1[:3])
            return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
