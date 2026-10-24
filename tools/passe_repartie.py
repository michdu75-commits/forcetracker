#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 LA PASSE COMPLÈTE D-031, RÉPARTIE SUR K PROCESSUS — avec SES conditions de validité
 ⛔⛔ PROPOSITION (OPTI-TEST-02 · FINALISATION, 23-24/10/2026) — NON ADOPTÉE tant que Michel ne l'a pas validée
    (règle d'or #15). La passe officielle reste `tools/passe_valide.sh` (`node tests/parcours/runner.js`).

 CE QU'ELLE JOUE : EXACTEMENT les instructions du runner, aucune réécrite.
  · tools/decouper_passe.js écrit K copies `tests/parcours/runner.part-K-i.js` : chaque instruction de premier niveau
    de la fonction principale y est GARDÉE telle quelle ou remplacée par « ; ». L'infrastructure (serveur, navigateur,
    enveloppes et PREUVE du garde réseau, fermeture, ligne de total) est jouée dans CHAQUE processus ; chaque module
    awaité dans UN SEUL (tous ses appels ensemble) ; tout le reste (blocs du runner, page partagée, contrôles du garde
    D031S-III/IV/V/VII, contrôles de source après la fermeture) dans le processus 0, dans l'ordre.
  · tools/verifier_decoupe.js CONTRE-VÉRIFIE les copies sans faire confiance au découpeur : rien d'oublié, rien de
    doublé hors de l'infrastructure, rien de réécrit. Un refus = rien ne tourne.
  · les K processus tournent EN MÊME TEMPS ; chacun prouve SON garde réseau (D031S-I) et le revérifie à la fin (D031S-II).

 LES CONDITIONS (toutes, sinon NON VALIDE) — les 4 de passe_valide.sh, appliquées à CHAQUE processus, plus 4 :
  ① chaque processus a écrit SA ligne de total            ② chaque processus a fini en code 0
  ③ l'arbre n'a pas changé pendant la passe               ④ aucune publication concurrente sur origin/master
  ⑤ 0 rouge réel (ancré en début de ligne), tous journaux confondus
  ⑥ aucun « ⛔ MODULE … PLANTÉ », aucune « PASSE INTERROMPUE », aucun « GARDE RÉSEAU NON PROUVÉ »
  ⑦ chaque processus porte TOUS les témoins de l'infrastructure du garde (D031S-I et D031S-II), et les mêmes
  ⑧ les copies découpées ont été retirées et l'arbre de travail est revenu à son état d'avant (git status identique)

 ⚠️ CE QUI CHANGE PAR RAPPORT À LA PASSE SÉQUENTIELLE (et rien d'autre) : les témoins du garde D031S-I/II sont joués K
    fois. Le total réparti vaut donc le total séquentiel + (K−1) × (témoins du garde) ; la ligne « équivalent séquentiel »
    le retire. ⚠️ Charge machine : K navigateurs à la fois — la lancer SEULE sur la machine.
 Usage : python3 tools/passe_repartie.py [K] [dossier des journaux]      (défaut : 3, /tmp/passe-repartie)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import collections, os, re, subprocess, sys, time

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RACINE)
K = int(sys.argv[1]) if len(sys.argv) > 1 else 3
J = sys.argv[2] if len(sys.argv) > 2 else '/tmp/passe-repartie'
REP = 'tests/parcours/repartition-%d.json' % K
RUNNER = 'tests/parcours/runner.js'
PARTS = ['tests/parcours/runner.part-%d-%d.js' % (K, i) for i in range(K)]
RE_INFRA = re.compile(r'^\s+(✅|❌) (D031S-II? .*)$')
sh = lambda *c: subprocess.run(c, capture_output=True, text=True)


def retirer_copies():
    for p in PARTS:
        try: os.remove(p)
        except OSError: pass


os.makedirs(J, exist_ok=True)
ARBRE = sh('git', 'rev-parse', 'HEAD').stdout.strip()
ETAT0 = sh('git', 'status', '--porcelain').stdout
print('── arbre au départ : %s · %d processus · répartition %s' % (ARBRE, K, REP))
if K < 2: sys.exit('K < 2 : c\'est la passe séquentielle — utiliser tools/passe_valide.sh')
d = sh('node', 'tools/decouper_passe.js', RUNNER, str(K), REP)
if d.returncode != 0:
    retirer_copies(); print(d.stderr.strip()); print('⛔ PASSE RÉPARTIE NON VALIDE — découpe refusée (structure du runner inconnue) : utiliser tools/passe_valide.sh'); sys.exit(1)
v = sh('node', 'tools/verifier_decoupe.js', RUNNER, str(K))
if v.returncode != 0:
    retirer_copies(); print(v.stdout[-2000:]); print('⛔ PASSE RÉPARTIE NON VALIDE — copies découpées NON CONFORMES'); sys.exit(1)
print('── découpe acceptée et contre-vérifiée ; la passe tourne (~30 min sur 3 processus)…')
T0 = time.time(); procs = []
for i, p in enumerate(PARTS):
    f = open(os.path.join(J, 'p%d.log' % i), 'w', encoding='utf-8')
    # ⛔ LE RUNNER SEUL : son code de sortie est lu directement, jamais celui d'un tube
    procs.append((subprocess.Popen(['node', p], stdout=f, stderr=subprocess.STDOUT), f))
codes = []
for pr, f in procs:
    codes.append(pr.wait()); f.close()
duree = (time.time() - T0) / 60
retirer_copies()

ok = True
print('\n══════ LES CONDITIONS (passe répartie, %d processus, %.1f min) ══════' % (K, duree))
journaux = [open(os.path.join(J, 'p%d.log' % i), encoding='utf-8', errors='replace').read() for i in range(K)]
totaux = []
for i, s in enumerate(journaux):
    m = re.findall(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', s)
    if m: totaux.append((int(m[-1][0]), int(m[-1][1]))); print('  ✅ ① p%d : ligne de total : %s ✅ · %s ❌' % (i, m[-1][0], m[-1][1]))
    else: print('  ❌ ① p%d : AUCUNE LIGNE DE TOTAL — NE RIEN CONCLURE' % i); ok = False
for i, c in enumerate(codes):
    if c == 0: print('  ✅ ② p%d : terminé correctement (code 0)' % i)
    else: print('  ❌ ② p%d : code %s' % (i, c)); ok = False
MAINTENANT = sh('git', 'rev-parse', 'HEAD').stdout.strip()
if MAINTENANT == ARBRE: print('  ✅ ③ l\'arbre testé est celui d\'aujourd\'hui (%s)' % ARBRE)
else: print('  ❌ ③ L\'ARBRE A CHANGÉ pendant la passe : %s → %s' % (ARBRE, MAINTENANT)); ok = False
sh('git', 'fetch', '-q', '--all')
retard = sh('git', 'rev-list', '--count', 'HEAD..origin/master').stdout.strip() or '?'
if retard == '0': print('  ✅ ④ aucune publication concurrente sur origin/master')
else: print('  ❌ ④ PUBLICATION CONCURRENTE — %s commit(s) sur origin/master : PASSE PÉRIMÉE' % retard); ok = False
rouges = sum(len(re.findall(r'^\s+❌', s, re.M)) for s in journaux)
print('  %s ⑤ rouges réels (ancrés en début de ligne), tous processus : %d' % ('✅' if rouges == 0 else '❌', rouges)); ok = ok and rouges == 0
mauvais = [(i, x) for i, s in enumerate(journaux) for x in ('a PLANTÉ', 'n\'a pas pu être CHARGÉ', 'PROMESSE REJETÉE SANS', 'PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL', 'GARDE RÉSEAU NON PROUVÉ') if x in s]
if not mauvais: print('  ✅ ⑥ aucun plantage, aucune interruption, garde prouvé dans chaque processus')
else: print('  ❌ ⑥ %s' % ' · '.join('p%d : %s' % m for m in mauvais)); ok = False
infra = [collections.Counter(m.groups() for m in map(RE_INFRA.match, s.splitlines()) if m) for s in journaux]
if infra[0] and all(x == infra[0] for x in infra) and all(v == '✅' for (v, _) in infra[0]):
    print('  ✅ ⑦ chaque processus porte les %d témoins du garde (D031S-I et D031S-II), tous verts' % sum(infra[0].values()))
else: print('  ❌ ⑦ infrastructure du garde différente ou rouge selon les processus : %s' % [sum(x.values()) for x in infra]); ok = False
if sh('git', 'status', '--porcelain').stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧ copies découpées retirées, arbre de travail revenu à son état d\'avant')
else: print('  ❌ ⑧ l\'arbre de travail a changé pendant la passe (git status)'); ok = False
if totaux and len(totaux) == K:
    G = sum(infra[0].values()); T = (sum(a for a, _ in totaux), sum(b for _, b in totaux))
    print('\n  TOTAL RÉPARTI : %d ✅ · %d ❌ (%d processus) — équivalent séquentiel : %d ✅ · %d ❌ (le garde, %d témoins, compté une fois)'
          % (T[0], T[1], K, T[0] - (K - 1) * G, T[1], G))
print()
if ok: print('⭐ PASSE RÉPARTIE VALIDE — le push peut être préparé (poser le numéro de version MAINTENANT).'); sys.exit(0)
print('⛔ PASSE RÉPARTIE NON VALIDE — aucun feu vert. En cas de rouge ou de plantage : le confirmer par tools/passe_valide.sh (séquentielle).'); sys.exit(1)
