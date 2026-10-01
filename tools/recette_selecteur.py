#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LE SÉLECTEUR DE RECETTE — « ces fonctions ont changé : quels tests rejouer ? » (RECETTE-01, D-030)

Entrées :
  python3 tools/recette_selecteur.py saveAsProg persist          # des noms de fonctions / zones
  python3 tools/recette_selecteur.py --diff master               # le diff entre master et l'arbre de travail
  python3 tools/recette_selecteur.py --diff 3c4031a9~1..3c4031a9 # le diff d'un intervalle de commits
  python3 tools/recette_selecteur.py --publication …             # ajoute T3 et la passe complète (protocole)
  python3 tools/recette_selecteur.py --auto-test                  # s'éprouve lui-même

⭐ PRINCIPE (le brief : « une table explicite fiable vaut mieux qu'un moteur qui invente ») :
① la TABLE fait foi — `tests/recette/registre.json`, écrite et relue, déclencheurs = fonctions ;
② l'INDEX des citations (quels fichiers de test nomment la fonction) est seulement AFFICHÉ, pour
   information : il ne décide rien, parce qu'une citation n'est pas une couverture ;
③ un CARREFOUR (fonction lue partout) réclame le bloc annexe entier et la passe complète ;
④ une fonction modifiée qu'aucun scénario ne connaît est SIGNALÉE (« témoin à écrire »), jamais
   rattachée au hasard.
⛔ Le registre est vérifié à chaque lancement : un déclencheur qui ne correspond plus à aucune
fonction du code servi, ou un test dont le fichier manque, fait échouer l'outil (code 2).
"""
import json, os, re, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(RACINE, 'tests', 'recette', 'registre.json')
SERVIS = ['app.js', 'log.js', 'coach.js', 'setup.js', 'state.js', 'screens.js', 'tracking.js', 'constants.js',
          'food-health.js', 'supabase.js', 'capacites-ia.js', 'translations.js']
SEUIL_CARREFOUR = 20
MOTIFS = {'motif:audio': r'AudioContext|new Audio\(|\.play\(\)', 'motif:camera': r'getUserMedia'}
ZONES_FICHIER = {'worker.js': 'fichier:worker.js', 'Code.js': 'fichier:Code.js', 'appsscript.json': 'fichier:appsscript.json',
                 'index.html': 'fichier:index.html', 'style.css': 'fichier:style.css',
                 # le tableau de bord ordinateur est servi (dashboard.html) mais hors de SERVIS : sans
                 # cette zone, un diff qui ne touche que lui ne déclenchait AUCUN test (NUT-DASH1, 01/10/2026)
                 'dashboard.js': 'fichier:dashboard.js'}
# déclarations de premier niveau : `function f(`, `async function f(`, `const f =`, et les fonctions
# nommées auto-exécutées au démarrage `(function _recoverDraft(){…})()` / `(async function autoConnect(`
DECL = re.compile(r'^\(?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=')


def lire(p):
    with open(os.path.join(RACINE, p), encoding='utf-8') as f:
        return f.read()


def git(*a):
    return subprocess.run(['git'] + list(a), cwd=RACINE, capture_output=True, text=True).stdout


def fonctions_du_code():
    noms = set()
    for f in SERVIS:
        if os.path.exists(os.path.join(RACINE, f)):
            for l in lire(f).split('\n'):
                m = DECL.match(l)
                if m:
                    noms.add(m.group(1) or m.group(2))
    return noms


def verifier_registre(reg, noms):
    """Rend la liste des incohérences du registre (vide = sain)."""
    pb = []
    tests = reg['tests']
    for sc in reg['scenarios']:
        for d in sc['declencheurs']:
            if d.startswith(('fichier:', 'sw.js:', 'motif:', 'source:')) or d == 'documentation':
                if d.startswith('fichier:') and not os.path.exists(os.path.join(RACINE, d[8:])):
                    pb.append('%s : fichier absent %s' % (sc['id'], d))
                continue
            if d not in noms:
                pb.append('%s : déclencheur « %s » introuvable dans le code servi' % (sc['id'], d))
        for niv, lst in sc['tests_associes'].items():
            for tid in lst:
                if tid not in tests:
                    pb.append('%s : test inconnu « %s »' % (sc['id'], tid))
    for tid, t in tests.items():
        for champ in ('commande', 'controle_negatif'):
            c = t.get(champ, '')
            m = re.search(r'(tools/[\w/.-]+|tests/[\w/.-]+)', c)
            if m and not os.path.exists(os.path.join(RACINE, m.group(1))):
                pb.append('test %s : fichier absent %s' % (tid, m.group(1)))
    for c in reg['carrefours']['liste']:
        if c not in noms:
            pb.append('carrefour « %s » introuvable dans le code servi' % c)
    return pb


def citations(nom):
    """Index d'information : quels fichiers de test nomment la fonction ; combien de blocs de la passe."""
    pat = re.compile(r'\b' + re.escape(nom) + r'\b')
    fichiers, blocs = [], 0
    for base in ('tests', 'tools'):
        for dp, _, fs in os.walk(os.path.join(RACINE, base)):
            for f in fs:
                if not f.endswith('.js') or (base == 'tools' and not f.startswith('banc_')):
                    continue
                p = os.path.join(dp, f)
                s = open(p, encoding='utf-8', errors='ignore').read()
                if f == 'runner.js' and dp.endswith(os.path.join('tests', 'parcours')):
                    pos = [m.start() for m in re.finditer(r'BLOC [A-Z]+\b', s)]
                    vus = set()
                    for m in pat.finditer(s):
                        b = max([i for i, x in enumerate(pos) if x <= m.start()] or [-1])
                        vus.add(b)
                    blocs = len(vus)
                elif pat.search(s):
                    fichiers.append(os.path.relpath(p, RACINE))
    return sorted(fichiers), blocs


def zones_du_diff(spec):
    """Fonctions et zones touchées par un diff. `spec` = « ref » (ref → arbre de travail) ou « a..b »."""
    if '..' in spec:
        a, b = spec.split('..', 1)
        diff = git('diff', '-U0', a, b)
        lire_ap = lambda f: git('show', '%s:%s' % (b, f))
    else:
        a = spec
        diff = git('diff', '-U0', a)
        lire_ap = lambda f: lire(f) if os.path.exists(os.path.join(RACINE, f)) else ''
    lire_av = lambda f: git('show', '%s:%s' % (a, f))
    zones, fichiers = set(), {}
    if '..' not in spec:   # l'arbre de travail : les fichiers NOUVEAUX ne sont pas dans `git diff`
        for f in git('ls-files', '--others', '--exclude-standard').split('\n'):
            if f.strip():
                diff += '\ndiff --git a/%s b/%s\n@@ -0,0 +1,1 @@\n+(nouveau fichier)' % (f, f)
    cur = None
    for l in diff.split('\n'):
        if l.startswith('diff --git'):
            cur = l.split(' b/')[-1]
            fichiers[cur] = {'av': [], 'ap': [], 'ajouts': [], 'retraits': []}
        elif l.startswith('@@') and cur:
            m = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', l)
            ad, an, bd, bn = int(m.group(1)), int(m.group(2) or 1), int(m.group(3)), int(m.group(4) or 1)
            fichiers[cur]['av'].append((ad, an)); fichiers[cur]['ap'].append((bd, bn))
        elif cur and l.startswith('+') and not l.startswith('+++'):
            fichiers[cur]['ajouts'].append(l[1:])
        elif cur and l.startswith('-') and not l.startswith('---'):
            fichiers[cur]['retraits'].append(l[1:])
    for f, info in fichiers.items():
        if f.endswith('.md') or f.startswith('docs/'):
            zones.add('documentation'); continue
        if f.startswith(('tests/', 'tools/', '.github/')):
            zones.add('infra-test:' + f); continue
        if f == 'sw.js':
            chg = [x for x in info['ajouts'] + info['retraits'] if x.strip()]
            zones.add('sw.js:version' if chg and all(re.match(r"\s*const CACHE = 'ft-v\d+'", x) for x in chg) else 'sw.js:logique')
            continue
        if f in ZONES_FICHIER:
            zones.add(ZONES_FICHIER[f])
        for mz, rx in MOTIFS.items():
            if any(re.search(rx, x) for x in info['ajouts']):
                zones.add(mz)
        if f.endswith('.js'):
            for texte, plages in ((lire_ap(f), info['ap']), (lire_av(f), info['av'])):
                lignes = texte.split('\n')
                decl = [(i + 1, (DECL.match(x).group(1) or DECL.match(x).group(2))) for i, x in enumerate(lignes) if DECL.match(x)]
                for debut, n in plages:
                    for ln in range(debut, debut + max(n, 1)):
                        avant = [d for d in decl if d[0] <= ln]
                        if avant:
                            zones.add(avant[-1][1])
    return zones


def selectionner(entrees, reg, noms, publication=False):
    carrefours = set(reg['carrefours']['liste'])
    sc_touches, sans_scenario, carrefours_vus = [], [], []
    for e in sorted(entrees):
        hits = [sc for sc in reg['scenarios'] if e in sc['declencheurs']]
        if e.startswith('infra-test:'):
            continue
        cit_f, cit_b = (citations(e) if e in noms else ([], 0))
        if e in carrefours or cit_b >= SEUIL_CARREFOUR:
            carrefours_vus.append((e, cit_b))
        if hits:
            for h in hits:
                if h not in sc_touches:
                    sc_touches.append(h)
        elif e in noms:
            sans_scenario.append((e, cit_f, cit_b))
    niveaux = {k: [] for k in ('T0', 'T1', 'T2', 'T3', 'T4', 'T6')}
    ajouter = lambda n, x: niveaux[n].append(x) if x not in niveaux[n] else None
    ajouter('T0', 'diff-check'); ajouter('T0', 'check-regles')
    if any(e.startswith('infra-test:') for e in entrees):
        ajouter('T0', 'selecteur-autotest'); ajouter('T2', 'annexe')
    if any(e.startswith('infra-test:tests/parcours/') for e in entrees):
        ajouter('T2', 'passe')   # le harnais de la passe a changé : seule la passe prouve qu'il n'a rien cassé
    manuels = []
    for sc in sc_touches:
        for niv, lst in sc['tests_associes'].items():
            for tid in lst:
                ajouter(niv if niv in niveaux else 'T2', tid)
        if sc['type'] in ('MANUEL', 'HYBRIDE') and sc.get('manuel_si') and sc['niveau'] in ('T4', 'T6'):
            manuels.append(sc)
    if carrefours_vus:
        ajouter('T2', 'annexe'); ajouter('T2', 'passe')
    metier = [e for e in entrees if not (e.startswith('infra-test:') or e in ('documentation', 'sw.js:version'))]
    if publication:
        if metier:
            ajouter('T2', 'passe')
        ajouter('T3', 'pages')
    # un test T1 n'est pas répété en T2
    niveaux['T2'] = [x for x in niveaux['T2'] if x not in niveaux['T1']]
    return {'scenarios': sc_touches, 'sans_scenario': sans_scenario, 'carrefours': carrefours_vus,
            'niveaux': niveaux, 'manuels': manuels, 'metier': bool(metier)}


def afficher(res, reg, entrees):
    T = reg['tests']
    print('═══ SÉLECTEUR DE RECETTE ═══')
    print('entrées : ' + ', '.join(sorted(entrees)))
    print('scénarios touchés : ' + (', '.join(s['id'] for s in res['scenarios']) or '—'))
    for niv in ('T0', 'T1', 'T2', 'T3'):
        print('\n%s :' % niv)
        for tid in res['niveaux'][niv] or []:
            print('  · %-24s %s' % (tid, T[tid]['commande']))
        if not res['niveaux'][niv]:
            print('  —')
    print('\nT4 MANUELS RESTANTS :')
    t4 = [s for s in res['manuels'] if s['niveau'] == 'T4']
    for s in t4:
        print('  · %s — %s\n      pourquoi pas automatique : %s' % (s['id'], s['scenario'], s['manuel_si']))
    if not t4:
        print('  — aucun')
    t6 = [s for s in res['manuels'] if s['niveau'] == 'T6']
    if t6:
        print('\nT6 (recette lourde, à planifier, pas bloquant pour un micro-lot) :')
        for s in t6:
            print('  · %s — %s' % (s['id'], s['scenario']))
    if res['carrefours']:
        print('\n⚠️  CARREFOUR : ' + ', '.join('%s (%d blocs de la passe)' % c for c in res['carrefours'])
              + ' → bloc annexe ENTIER + passe complète.')
    if res['sans_scenario']:
        print('\n⚠️  FONCTIONS SANS SCÉNARIO (le lot doit écrire son témoin ; citations pour information) :')
        for n, f, b in res['sans_scenario']:
            print('  · %s — citée par %d bloc(s) de la passe%s' % (n, b, (' et ' + ', '.join(f[:4])) if f else ''))
    auto = sum(len(v) for k, v in res['niveaux'].items())
    print('\n──── %d contrôle(s) automatique(s) · %d manuel(s) T4 · %d T6 à planifier ────' % (auto, len(t4), len(t6)))


def auto_test(reg, noms):
    ok = ko = 0
    def t(nom, c, det=''):
        nonlocal ok, ko
        if c: ok += 1; print('   OK  ' + nom)
        else: ko += 1; print('❌ ROUGE ' + nom + ('  >> ' + det if det else ''))
    pb = verifier_registre(reg, noms)
    t('le registre est cohérent avec le code servi (déclencheurs, tests, carrefours)', not pb, '; '.join(pb[:3]))
    r = selectionner({'saveAsProg'}, reg, noms)
    t('saveAsProg → programme / dropset (banc ML-A) et sa dépendance directe (travail existant)',
      'banc:ml_a' in r['niveaux']['T1'] and 'banc:travail_lot2' in r['niveaux']['T2'], str(r['niveaux']))
    t('saveAsProg → aucun test téléphone bloquant', not [s for s in r['manuels'] if s['niveau'] == 'T4'], str([s['id'] for s in r['manuels']]))
    r = selectionner({'persist'}, reg, noms)
    t('persist → CARREFOUR : bloc annexe entier + passe complète',
      bool(r['carrefours']) and 'annexe' in r['niveaux']['T2'] and 'passe' in r['niveaux']['T2'], str(r['carrefours']))
    r = selectionner({'sw.js:version'}, reg, noms, publication=True)
    t('sw.js (numéro seul) + publication → T0 et T3 seulement, AUCUNE recette métier',
      not r['niveaux']['T1'] and 'passe' not in r['niveaux']['T2'] and 'annexe' not in r['niveaux']['T2'] and 'pages' in r['niveaux']['T3']
      and not r['manuels'], str(r['niveaux']))
    r = selectionner({'sw.js:logique'}, reg, noms)
    t('sw.js (logique) → test hors ligne automatique + TEL-VERSION / PWA-IOS au téléphone',
      'annexe:pwa-offline' in r['niveaux']['T1'] and {'TEL-VERSION-01', 'PWA-IOS-01'} <= {s['id'] for s in r['manuels']}, str(r['niveaux']))
    r = selectionner({'documentation'}, reg, noms)
    t('documentation seule → T0 seulement', not r['niveaux']['T1'] and not r['niveaux']['T2'], str(r['niveaux']))
    r = selectionner({'createSuperset'}, reg, noms)
    t('createSuperset → le TROU est dit (aucun T1, scénario qui annonce le témoin à écrire)',
      not r['niveaux']['T1'] and any('TROU' in s['notes'] for s in r['scenarios']), str(r['niveaux']))
    r = selectionner({'infra-test:tests/parcours/runner.js'}, reg, noms)
    t('le harnais de la passe modifié → la passe complète est réclamée', 'passe' in r['niveaux']['T2'], str(r['niveaux']))
    r = selectionner({'infra-test:tests/dates/runner.js'}, reg, noms)
    t('une suite annexe modifiée → le bloc annexe, sans passe complète', 'annexe' in r['niveaux']['T2'] and 'passe' not in r['niveaux']['T2'], str(r['niveaux']))
    r = selectionner({'uneFonctionQuiNExistePas'}, reg, noms)
    t('une fonction inconnue ne déclenche rien au hasard', not r['scenarios'] and not r['sans_scenario'], str(r))
    # diff synthétique : sw.js ne change que le numéro
    z = zones_du_diff_texte('sw.js', ["const CACHE = 'ft-v1243'; // (!) ft-v1243 = test"], ["const CACHE = 'ft-v1242'; // (!) ft-v1242 = x"])
    t('diff de sw.js limité au numéro → zone « sw.js:version »', z == {'sw.js:version'}, str(z))
    z = zones_du_diff_texte('sw.js', ["  if (url.origin !== self.location.origin) return;"], [])
    t('diff de sw.js qui touche la logique → zone « sw.js:logique »', z == {'sw.js:logique'}, str(z))
    # diff réel : le commit fonctionnel de ML-A
    if git('cat-file', '-t', '3c4031a9').strip() == 'commit':
        z = zones_du_diff('3c4031a9~1..3c4031a9')
        t('diff réel de ML-A (3c4031a9) → saveAsProg + les deux chargeurs + _recopierDropset',
          {'saveAsProg', '_loadProgVraiment', '_loadProgDayVraiment', '_recopierDropset'} <= z, str(sorted(z)))
        r = selectionner(z, reg, noms)
        t('… et le sélecteur en tire le banc ML-A, sans test téléphone', 'banc:ml_a' in r['niveaux']['T1'] and not [s for s in r['manuels'] if s['niveau'] == 'T4'],
          str(r['niveaux']['T1']))
    print('──── %d OK / %d rouge ────' % (ok, ko))
    return 0 if not ko else 1


def zones_du_diff_texte(fichier, ajouts, retraits):
    """Même règle que `zones_du_diff` pour sw.js, sur un diff fabriqué (auto-test)."""
    chg = [x for x in ajouts + retraits if x.strip()]
    if fichier == 'sw.js':
        return {'sw.js:version' if chg and all(re.match(r"\s*const CACHE = 'ft-v\d+'", x) for x in chg) else 'sw.js:logique'}
    return set()


def main():
    reg = json.load(open(REG, encoding='utf-8'))
    noms = fonctions_du_code()
    args = sys.argv[1:]
    if '--auto-test' in args:
        return auto_test(reg, noms)
    pb = verifier_registre(reg, noms)
    if pb:
        print('⛔ REGISTRE INCOHÉRENT (corriger tests/recette/registre.json avant de s\'en servir) :')
        for x in pb:
            print('  · ' + x)
        return 2
    publication = '--publication' in args
    args = [a for a in args if a != '--publication']
    entrees = set()
    if args and args[0] == '--diff':
        entrees = zones_du_diff(args[1] if len(args) > 1 else 'origin/master')
    else:
        for a in args:
            entrees |= {x for x in a.split(',') if x}
    if not entrees:
        print(__doc__); return 2
    res = selectionner(entrees, reg, noms, publication)
    afficher(res, reg, entrees)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
