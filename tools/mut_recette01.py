#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — RECETTE-01 (session-B) : les temoins de l'infra de test savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : les suites visees sont vertes sur l'arbre sain, mesure d'abord.
D* = le jour UTC des fixtures (suite `dates`) · A* = le temoin `anneau` realigne · C* = le temoin
`calendrier-milo` realigne · W* = le test hors ligne (vrai service worker) · R* = le classement du bloc annexe
· S* = le selecteur de recette et la verification du registre. Les mutations A* et C* cassent le CODE SERVI de la copie (tuile du
check-in, Worker) : un temoin realigne doit toujours voir la garantie tomber.
Usage : python3 tools/mut_recette01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUN = 'tests/parcours/runner.js'

MUT = [
    ('D1 le journal du bloc B-CCCXVII rouvert au jour UTC (la ligne trouvee le 28/09)',
     [(RUN, "    journalAllerA(today()); await pause(100);", "    journalAllerA(new Date().toISOString().slice(0,10)); await pause(100);")], ['dates'], 'GARDE'),
    ('D2 [deguisee] la forme « maintenant - n jours » en UTC (celle qui echappait au detecteur)',
     [(RUN, "journalAllerA((()=>{const x=new Date();x.setDate(x.getDate()-recul);return today(x.getTime());})());",
       "journalAllerA(new Date(Date.now()-recul*864e5).toISOString().slice(0,10));")], ['dates'], 'GARDE'),
    ('D3 le motif UTC dans un MODULE de parcours (hors de l\'ancienne liste de 7 fichiers)',
     [('tests/parcours/travail_existant.js', "date: jourParis(), exs: []", "date: new Date().toISOString().slice(0, 10), exs: []")], ['dates'], 'GARDE'),
    ('D4 la fixture Node prend le jour de Greenwich au lieu de celui de Paris',
     [('tests/_jour.js', "base.toLocaleDateString('sv-SE', { timeZone: FUSEAU_TESTS })", "base.toISOString().slice(0, 10)")], ['dates'], 'GARDE'),
    ('D5 [deguisee] le decalage ignore n (tous les jours deviennent aujourd\'hui)',
     [('tests/_jour.js', "return new Date(Date.UTC(y, m - 1, d + (n || 0))).toISOString().slice(0, 10);",
       "return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);")], ['dates'], 'GARDE'),
    ('D6 [deguisee] jourLocal suit Paris meme sans fuseau de contexte',
     [('tests/_jour.js', "return _decale(b.getFullYear(), b.getMonth() + 1, b.getDate(), n);",
       "return jourParis(n, maintenant);")], ['dates'], 'GARDE'),
    ('A1 la legende quitte aussi l\'aria-label (l\'information est perdue pour de bon)',
     [('screens.js', "role=\"img\" aria-label=\"'+lgd+' : '+val+'\"", "role=\"img\" aria-label=\"'+val+'\"")], ['anneau'], 'GARDE'),
    ('A2 une tuile en moins (Moral retire)',
     [('screens.js', "    + _ckTuile(_ckVisage(cMor,d.mood), cMor, d.mood, _lbl(lblMor,d.mood), 'Moral')\n", "")], ['anneau'], 'GARDE'),
    ('C1 le cache personnel n\'est plus ephemeral',
     [('worker.js', "  const _TTL_PERSO  = { type: 'ephemeral' };", "  const _TTL_PERSO  = { type: 'persistent' };")], ['calendrier-milo'], 'GARDE'),
    ('C2 le bloc de l\'instant (apres le marqueur) est mis en cache',
     [('worker.js', "      { type: 'text', text: String(ctx).slice(_mi) }\n", "      { type: 'text', text: String(ctx).slice(_mi), cache_control: _TTL_PERSO }\n")], ['calendrier-milo'], 'GARDE'),
    ('C3 le Worker decoupe sur un autre marqueur que celui du contexte',
     [('worker.js', "const CACHE_MARKER = \"═══ SITUATION DE L'INSTANT ═══\";", "const CACHE_MARKER = \"═══ SITUATION ═══\";")], ['calendrier-milo'], 'GARDE'),
    ('W1 un script servi retire du precache (app.js)',
     [('sw.js', "'./setup.js', './tracking.js', './coach.js', './app.js', './food-health.js',", "'./setup.js', './tracking.js', './coach.js', './food-health.js',")], ['pwa'], 'GARDE'),
    ('W2 [deguisee] la navigation ne tombe plus sur le cache (reseau seul, repli retire)',
     [('sw.js', "        if (cached) { netFetch.catch(() => {}); return cached; }\n", ""),
      ('sw.js', "        return netFetch.then(r => r || caches.match('./'));", "        return netFetch.then(r => r || Response.error());")], ['pwa'], 'GARDE'),
    ('W3 le service worker n\'est plus enregistre par l\'app',
     [('app.js', "    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{", "    Promise.resolve(null).then(reg=>{")], ['pwa'], 'GARDE'),
    ('R1 le classement accepte un rouge inconnu (liste des defauts ignoree)',
     [('tools/recette_annexe.py', "    if non_listes:\n        return 'FAIL'", "    if False:\n        return 'FAIL'")], ['autotest'], 'GARDE'),
    ('R2 [deguisee] un libelle ACCEPTE par ressemblance (debut commun)',
     [('tools/recette_annexe.py', "    non_listes = [r for r in rouges if r not in listes]", "    non_listes = [r for r in rouges if not any(r.startswith(x) for x in listes)]")], ['autotest'], 'GARDE'),
    ('R3 une suite sans ligne de total passe pour verte',
     [('tools/recette_annexe.py', "    if not a_fin:\n", "    if False:\n")], ['autotest'], 'GARDE'),
    ('R4 [deguisee] un libelle qui commence par un chiffre est pris pour une ligne de total (le defaut trouve le 28/09)',
     [('tools/recette_annexe.py', "        if not r or re.fullmatch(r'\\d+\\s*/\\s*\\d+', r) or r == 'ÉCHEC':", "        if not r or r[:1].isdigit() or r == 'ÉCHEC':")], ['autotest'], 'GARDE'),
    ('S1 le selecteur ne voit plus les carrefours (persist ne reclame plus la passe)',
     [('tools/recette_selecteur.py', "        if e in carrefours or cit_b >= SEUIL_CARREFOUR:", "        if False:")], ['selecteur'], 'GARDE'),
    ('S2 [deguisee] un simple numero de sw.js reclame toute la recette metier',
     [('tools/recette_selecteur.py', "    metier = [e for e in entrees if not (e.startswith('infra-test:') or e in ('documentation', 'sw.js:version'))]",
       "    metier = [e for e in entrees if not (e.startswith('infra-test:') or e in ('documentation',))]")], ['selecteur'], 'GARDE'),
    ('S3 le registre n\'est plus verifie (un declencheur fantome passe)',
     [('tests/recette/registre.json', '"declencheurs": ["saveAsProg", ', '"declencheurs": ["saveAsProgFantome", "saveAsProg", ')], ['selecteur'], 'GARDE'),
    ('[negatif] commentaire citant le motif UTC dans le bloc',
     [(RUN, "    journalAllerA(today()); await pause(100);", "    // new Date().toISOString().slice(0,10) etait le defaut\n    journalAllerA(today()); await pause(100);")], ['dates'], 'OK'),
]


COMMANDES = {'pwa': ['node', 'tests/recette/pwa_offline.js'], 'autotest': ['python3', 'tools/recette_annexe.py', '--auto-test'],
             'selecteur': ['python3', 'tools/recette_selecteur.py', '--auto-test']}


def suite(arbre, nom):
    cmd = COMMANDES.get(nom, ['node', 'tests/%s/runner.js' % nom])
    r = subprocess.run(cmd, cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    # une ligne de rouge commence par ❌ ; la ligne de total (« ❌ 17/18 ») n'en est pas une
    rouges = [l.strip()[:120] for l in out.split('\n')
              if l.strip().startswith('❌') and not re.fullmatch(r'\d+\s*/\s*\d+', l.strip()[1:].strip())]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d) %s' % (r.returncode, out.strip().split('\n')[-1][:100])]
    if r.returncode == 1 and not rouges:
        rouges = ['ROUGE sans libelle lisible (code 1)']
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_recette01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    sains = {n: suite(a0, n) for n in ('dates', 'anneau', 'calendrier-milo', 'pwa', 'autotest', 'selecteur')}
    shutil.rmtree(tmp0, ignore_errors=True)
    if any(sains.values()):
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', sains); return 1
    print('  arbre sain : dates, anneau, calendrier-milo, pwa, autotest, selecteur a 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, suites, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        invalide = []
        for f, av, ap in remplacements:
            p = os.path.join(arbre, f); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1:
                invalide.append('%s:%s' % (f, av[:50]))
            else:
                open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges = [r for n in suites for r in suite(arbre, n)]
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
