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

 LES CONDITIONS (toutes, sinon NON VALIDE) — celles de passe_valide.sh, appliquées à CHAQUE processus, plus celles de la répartition :
  ⓪ l'arbre est PROPRE au départ (fichiers non suivis compris) — INFRA-01 : « avant/après identiques » acceptait un arbre sale
  ① chaque processus a écrit SA ligne de total, UNIQUE et ancrée   ② chaque processus a fini en code 0
  ③ HEAD n'a pas changé pendant la passe                           ④ le distant PROUVÉ avant ET après, le même (INFRA-02, E21 : un `fetch`
     qui échoue en silence laissait lire un origin/master périmé ; l'inconnu BLOQUE)
  ⑤ 0 rouge réel, à toute indentation, tous journaux confondus    ⑥ chaque journal se recoupe : ✅ = N annoncé, ❌ = K annoncé, et aucun
     « ⛔ MODULE … PLANTÉ », aucune « PASSE INTERROMPUE », aucun « GARDE RÉSEAU NON PROUVÉ »
  ⑦ chaque processus porte TOUS les témoins de l'infrastructure du garde (D031S-I et D031S-II), et les mêmes
  ⑧ les copies découpées ont été retirées et l'arbre de travail est revenu PROPRE (git status vide, non suivis compris)
  ⑨ LES IDENTITÉS (tools/temoins.py) : la RÉUNION des processus, ramenée à l'équivalent séquentiel, contient chaque témoin attendu avec son
     nombre — un processus qui n'en joue que 100 sur 2 850, ou deux qui rejouent les mêmes, n'est plus une passe (R10/R11)

 ⚠️ CE QUI CHANGE PAR RAPPORT À LA PASSE SÉQUENTIELLE (et rien d'autre) : les témoins du garde D031S-I/II sont joués K
    fois. Le total réparti vaut donc le total séquentiel + (K−1) × (témoins du garde) ; la ligne « équivalent séquentiel »
    le retire. ⚠️ Charge machine : K navigateurs à la fois — la lancer SEULE sur la machine.
 Usage : python3 tools/passe_repartie.py [K] [dossier des journaux]      (défaut : 3, /tmp/passe-repartie)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import collections, datetime, hashlib, json, os, re, subprocess, sys, time

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RACINE)
sys.path.insert(0, os.path.join(RACINE, 'tools'))
sys.dont_write_bytecode = True      # ⛔ jamais de tools/__pycache__ : un fichier non suivi ferait refuser l'arbre (condition ⓪)
import temoins
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


def etat_distant():
    """(code du fetch, sha de ls-remote, HEAD contient le distant ?) — seul `ls-remote` dit ce qu'est le distant ; le fetch apporte les objets."""
    f = sh('git', 'fetch', '-q', 'origin')
    ls = sh('git', 'ls-remote', 'origin', 'refs/heads/master')
    sha = ls.stdout.split('\t')[0].strip() if ls.returncode == 0 and ls.stdout.strip() else ''
    return f.returncode, sha, bool(sha) and sh('git', 'merge-base', '--is-ancestor', sha, 'HEAD').returncode == 0


os.makedirs(J, exist_ok=True)
RP0 = sh('git', 'rev-parse', 'HEAD'); ARBRE = RP0.stdout.strip()
if RP0.returncode != 0 or not ARBRE:      # ⛔ INFRA-QA-01 · L0 (2ᵉ passe, défaut 5) : un git qui échoue n'est jamais « rien à signaler »
    print('  ❌ git rev-parse HEAD a échoué (code %s) : l\'arbre testé est INCONNU — refus avant de lancer la passe.' % RP0.returncode)
    print('⛔ PASSE RÉPARTIE NON VALIDE — refus AVANT de lancer la passe.'); sys.exit(1)
ST0 = sh('git', 'status', '--porcelain', '--untracked-files=all'); ETAT0 = ST0.stdout
print('── arbre au départ : %s · %d processus · répartition %s' % (ARBRE, K, REP))
if K < 2: sys.exit('K < 2 : c\'est la passe séquentielle — utiliser tools/passe_valide.sh')
if ST0.returncode != 0 or ETAT0.strip():
    print('  ❌ ⓪ L\'ARBRE N\'EST PAS PROPRE au départ (code git %s) : la passe décrirait autre chose que le commit.' % ST0.returncode)
    print('\n'.join('       ' + l for l in ETAT0.splitlines()[:5]))
    print('⛔ PASSE RÉPARTIE NON VALIDE — refus AVANT de lancer la passe.'); sys.exit(1)
RC0, DIST0, CONTENU0 = etat_distant()
if RC0 != 0 or not DIST0 or not CONTENU0:
    print('  ❌ ④a DISTANT NON PROUVÉ ou HEAD EN RETARD avant la passe (fetch code %s, ls-remote \'%s\', contenu dans HEAD : %s) — on ne lit pas un distant périmé.' % (RC0, DIST0 or '—', CONTENU0))
    print('⛔ PASSE RÉPARTIE NON VALIDE — refus AVANT de lancer la passe.'); sys.exit(1)
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
print('  ✅ ⓪ arbre propre au départ · ✅ ④a distant joint, à %s, et HEAD le contient — avant la passe' % DIST0)
journaux = [temoins.lire(os.path.join(J, 'p%d.log' % i)) for i in range(K)]
analyses = [temoins.analyser(s) for s in journaux]
totaux = []
for i, a in enumerate(analyses):
    ok_i, lignes_i = temoins.conditions(a, None, epreuve=True)      # ① unique et ancré · ⑤ 0 rouge · ⑥ ✅ = N, ❌ = K (l'identité se juge sur la RÉUNION, ⑨)
    print('\n'.join(('  [p%d] ' % i + l.strip()) if l.strip() else l for l in lignes_i if '⑦' not in l))
    ok = ok and ok_i
    if len(a['totaux']) == 1: totaux.append(a['totaux'][0])
for i, c in enumerate(codes):
    if c == 0: print('  ✅ ② p%d : terminé correctement (code 0)' % i)
    else: print('  ❌ ② p%d : code %s' % (i, c)); ok = False
MAINTENANT = sh('git', 'rev-parse', 'HEAD').stdout.strip()
if MAINTENANT == ARBRE: print('  ✅ ③ HEAD inchangé : l\'arbre testé est celui d\'aujourd\'hui (%s)' % ARBRE)
else: print('  ❌ ③ L\'ARBRE A CHANGÉ pendant la passe : %s → %s' % (ARBRE, MAINTENANT)); ok = False
RC1, DIST1, _ = etat_distant()
if RC1 == 0 and DIST1 and DIST1 == DIST0: print('  ✅ ④b aucune publication concurrente : le distant est resté à %s pendant toute la passe' % DIST1)
else: print('  ❌ ④b PUBLICATION CONCURRENTE OU DISTANT NON PROUVÉ — avant %s · après %s (fetch code %s) : PASSE PÉRIMÉE' % (DIST0, DIST1 or '—', RC1)); ok = False
mauvais = [(i, x) for i, s in enumerate(journaux) for x in ('a PLANTÉ', 'n\'a pas pu être CHARGÉ', 'PROMESSE REJETÉE SANS', 'PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL', 'GARDE RÉSEAU NON PROUVÉ') if x in s]
if not mauvais: print('  ✅ ⑥ aucun plantage, aucune interruption, garde prouvé dans chaque processus')
else: print('  ❌ ⑥ %s' % ' · '.join('p%d : %s' % m for m in mauvais)); ok = False
infra = [collections.Counter(m.groups() for m in map(RE_INFRA.match, s.splitlines()) if m) for s in journaux]
if infra[0] and all(x == infra[0] for x in infra) and all(v == '✅' for (v, _) in infra[0]):
    print('  ✅ ⑦ chaque processus porte les %d témoins du garde (D031S-I et D031S-II), tous verts' % sum(infra[0].values()))
else: print('  ❌ ⑦ infrastructure du garde différente ou rouge selon les processus : %s' % [sum(x.values()) for x in infra]); ok = False
ok_pre = ok      # tout sauf ⑨ (identités) et ⑧ (arbre final) — repris plus bas pour `verdict_hors_identites`
fusion, anomalies = temoins.fusion_repartie(analyses)
ok_id, lignes_id = temoins.identites(fusion, temoins.charger_manifeste())
print('\n'.join(l.replace('⑦', '⑨') for l in lignes_id)); ok = ok and ok_id
for x in anomalies: print('  ·  ⑨ (info, ⑦ tranche) %s' % x)      # l'asymétrie d'infrastructure est jugée par ⑦, une seule fois
FIN = sh('git', 'status', '--porcelain', '--untracked-files=all')
# ⛔ le `git status` FINAL doit lui-même RÉUSSIR (défaut 5 : un échec — code 128, sortie vide — ressemblait à « arbre propre » et la passe était déclarée valide)
if FIN.returncode == 0 and FIN.stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧ copies découpées retirées, arbre de travail PROPRE à l\'arrivée')
elif FIN.returncode != 0: print('  ❌ ⑧ `git status` FINAL en échec (code %s) : l\'état final de l\'arbre est INCONNU — l\'inconnu BLOQUE' % FIN.returncode); ok = False
else: print('  ❌ ⑧ l\'arbre de travail a changé pendant la passe (git status, fichiers non suivis compris)'); ok = False
ok_hors_identites = ok_pre and FIN.returncode == 0 and FIN.stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS)
if totaux and len(totaux) == K:
    G = sum(infra[0].values()); T = (sum(a for a, _ in totaux), sum(b for _, b in totaux))
    print('\n  TOTAL RÉPARTI : %d ✅ · %d ❌ (%d processus) — équivalent séquentiel : %d ✅ · %d ❌ (le garde, %d témoins, compté une fois)'
          % (T[0], T[1], K, T[0] - (K - 1) * G, T[1], G))
def provenance(verdict):
    """La provenance de CETTE passe, écrite à côté de ses journaux (hors dépôt) : c'est ce que `temoins.py calibrer --croiser` lit comme SOURCE INDÉPENDANTE
    (commit, K, verdict de toutes les conditions sauf les identités — qu'elle n'a pas encore de manifeste pour juger —, empreinte de chaque journal)."""
    try:
        meta = {'version': 1, 'commit': ARBRE, 'K': K, 'jour': temoins.jour_passe().isoformat(), 'verdict': verdict, 'verdict_hors_identites': bool(ok_hors_identites),
                'journaux': {'p%d.log' % i: hashlib.sha256(open(os.path.join(J, 'p%d.log' % i), 'rb').read()).hexdigest() for i in range(K)}}
        tmp = os.path.join(J, '.PASSE.json.tmp')
        with open(tmp, 'w', encoding='utf-8') as f: json.dump(meta, f, ensure_ascii=False, indent=1); f.write('\n')
        os.replace(tmp, os.path.join(J, 'PASSE.json'))
    except OSError as e:
        print('  ⚠️  PASSE.json non écrit (%s) : cette passe ne pourra pas servir de source de calibrage.' % e)
print()
provenance('VALIDE' if ok else 'NON VALIDE')
if ok: print('⭐ PASSE RÉPARTIE VALIDE — le push peut être préparé (poser le numéro de version MAINTENANT).'); sys.exit(0)
print('⛔ PASSE RÉPARTIE NON VALIDE — aucun feu vert. En cas de rouge ou de plantage : le confirmer par tools/passe_valide.sh (séquentielle).'); sys.exit(1)
