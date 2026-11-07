#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les PIÈGES DE DATE corrigés le 07/11/2026 (PS-E29, plantage de `seance_ux`, B-UXI-G2/G3/G5/G7, B-FFD-⑧e) : les témoins qui les gardent SAVENT-ILS ROUGIR ?

[!!] DANS LA COPIE MUTÉE : chaque mutation est appliquée à un ARBRE COPIE, jamais au dépôt (BUGS.md §60). Les mutations visent des FICHIERS DE TEST (le défaut corrigé est dans les tests, pas dans l'app) :
chacune RÉINTRODUIT le piège ou casse le correctif, puis on rejoue le banc qui doit le voir.
Point de départ : l'arbre sain rejoue d'abord les bancs — 0 rouge exigé (sinon le contrôle est refusé) ; chaque mutation est jugée par SES contrôles :
  · `requis`  : le contrôle DOIT voir la mutation (rouge nommé, ou plantage du module pour `seance_ux`), sinon la mutation « passe au travers » = témoin aveugle ;
  · `info`    : contrôle dépendant de la DATE du jour (un mois sans séance dans la fixture ne rouvre pas le bilan du mois) — affiché, jamais bloquant.
⭐ Le garde-fou principal est INDÉPENDANT de la date : `tests/dates/runner.js` refuse tout `ft4_lms: 'AAAA-MM'` écrit en dur, quel que soit le jour.
Usage : python3 tools/mut_pieges_dates.py [PREFIXE[,PREFIXE...]]      (MUT_DETAIL=1 : toutes les lignes rouges · MUT_SAIN=0 : saute l'arbre sain)
"""
import importlib.util, os, re, subprocess, sys, shutil

_ICI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('mut_autre_activite', os.path.join(_ICI, 'mut_autre_activite.py'))
m = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(m)       # UN SEUL mécanisme de copie / ancre (R2/R13)

def cloner():
    """UN SEUL mécanisme de copie (R2/R13) : celui de `mut_autre_activite.py`… + `guide/` (1,7 Mo, ignoré par défaut) : `progres_seances` y lit une image (PLANTAGE `ENOENT guide/progres.jpg` sinon, vu le 07/11)."""
    tmp, arbre = m.cloner()
    shutil.copytree(os.path.join(m.SRC, 'guide'), os.path.join(arbre, 'guide'))
    return tmp, arbre

DATES = ['node', 'tests/dates/runner.js']
def banc(nom): return ['node', 'tools/banc_%s.js' % nom]

# (nom, [(fichier, ancien, nouveau)], [(commande, mode, motif attendu dans la sortie, requis)])
MUT = [
    ('P01 seance_ux : le mois du bilan est de nouveau ÉCRIT EN DUR (2026-09) — la fenêtre « Bilan du mois » recouvre l\'écran et fait planter le module',
     [('tests/parcours/seance_ux.js', 'ft4_lms: moisPrecedent()', "ft4_lms: '2026-09'")],
     [(DATES, 'rouge', r'aucun module de test ne FIGE le mois', True), (banc('seance_ux'), 'plantage', r'ov-month-summary', False)]),
    ('P02 ux_integration : le mois du bilan est de nouveau ÉCRIT EN DUR (2026-09) — onglets du Coach rouges (G2, G3, G5, G7)',
     [('tests/parcours/ux_integration.js', 'ft4_lms: moisPrecedent()', "ft4_lms: '2026-09'")],
     [(DATES, 'rouge', r'aucun module de test ne FIGE le mois', True), (banc('ux_integration'), 'rouge', r'B-UXI-G2', False)]),
    ('P03 fig_face_dos : ⑧e n\'entre plus par la PORTE CIBLÉE (retour à `goSessionsHistory()` nu) — les mois passés sont pliés, aucune carte à observer',
     [('tests/parcours/fig_face_dos.js', "goSessionsHistory(passee ? [passee.ts || passee.id] : undefined)", "goSessionsHistory()")],
     [(banc('fig_face_dos'), 'rouge', r'B-FFD-⑧e', True)]),
    ('P04 progres_seances : la séance visée par PS-E29 est de nouveau le jour d\'AUJOURD\'HUI (année courante, donc déjà dépliée)',
     [('tests/parcours/progres_seances.js', 'const OFF_DBF = offDbf();', 'const OFF_DBF = 0;')],
     [(banc('progres_seances'), 'rouge', r'PS-E29 ⓪ précondition', True)]),
    ('P05 _jour.js : `moisPrecedent()` rend le mois COURANT (décalage d\'un mois oublié) — les fixtures annoncent alors un bilan du mois',
     [('tests/_jour.js', 'const d = new Date(Date.UTC(y, m - 2, 1));', 'const d = new Date(Date.UTC(y, m - 1, 1));')],
     [(DATES, 'rouge', r'le mois précédent du jour de PARIS|ne dépend PAS du fuseau', True), (banc('seance_ux'), 'plantage', r'ov-month-summary', False)]),
    ('P06 dates : le détecteur de mois en dur est AVEUGLE (le motif ne reconnaît plus RIEN : `/(?!)/` ne matche jamais — surtout pas `/$^/`, qui matche la chaîne vide et ferait rougir la garde principale avant le témoin de contrôle) — le témoin de contrôle doit rougir',
     [('tests/dates/runner.js', r'''const INTERDIT_MOIS=/\bft4_lms\s*:\s*['"`]\d{4}-\d{2}['"`]/;''', 'const INTERDIT_MOIS=/(?!)/;')],
     [(DATES, 'rouge', r'CONTRÔLE — le détecteur de mois en dur', True)]),
    ('P07 _jour.js : `moisPrecedent()` calculé en UTC et non à Paris (le 1ᵉʳ du mois à 00 h 30 Paris, il rend le mois d\'AVANT le mois précédent)',
     [('tests/_jour.js', "const [y, m] = base.toLocaleDateString('sv-SE', { timeZone: FUSEAU_TESTS }).split('-').map(Number);\n  const d = new Date(Date.UTC(y, m - 2, 1));",
       "const [y, m] = base.toISOString().slice(0, 10).split('-').map(Number);\n  const d = new Date(Date.UTC(y, m - 2, 1));")],
     [(DATES, 'rouge', r'le mois précédent du jour de PARIS|ne dépend PAS du fuseau', True)]),
]


def lancer(arbre, cmd):
    env = dict(os.environ, TZ='Europe/Paris')
    try:
        r = subprocess.run(cmd, cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    except subprocess.TimeoutExpired:
        return 99, 'PLANTAGE (délai dépassé)'
    return r.returncode, r.stdout + r.stderr


def juge(code, sortie, mode, motif):
    """rouge  : code 1 (au moins un ❌) ET le motif est dans une ligne rouge · plantage : code 2 (le module est tombé) ET le motif est dans la sortie · vert : code 0."""
    if mode == 'vert': return code == 0
    if mode == 'plantage': return code == 2 and re.search(motif, sortie) is not None
    rouges = [l for l in sortie.split('\n') if re.match(r'^\s*❌', l)]       # banc : « ❌ ROUGE nom >> détail » · suite des dates : « ❌ nom »
    return code == 1 and any(re.search(motif, l) for l in rouges)


def une(mu):
    nom, remplacements, controles = mu
    tmp, arbre = cloner()
    try:
        srcs = {}
        for f, av, ap in remplacements:
            srcs.setdefault(f, open(os.path.join(arbre, f), encoding='utf-8').read())
        for f, av, ap in remplacements:
            if av.startswith('re:'): err = m.appliquer(srcs, f, av, ap)
            elif srcs[f].count(av) != 1: err = '%s:%s (x%d)' % (f, av[:60], srcs[f].count(av))
            else: srcs[f] = srcs[f].replace(av, ap, 1); err = None
            if err: return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % err, []
        for f, txt in srcs.items(): open(os.path.join(arbre, f), 'w', encoding='utf-8').write(txt)
        res = []
        for cmd, mode, motif, requis in controles:
            code, sortie = lancer(arbre, cmd)
            res.append((' '.join(cmd[1:]), mode, requis, juge(code, sortie, mode, motif), code))
        ok = all(v for (_, _, requis, v, _) in res if requis)
        return nom, ok, 'ATTRAPÉE' if ok else 'PASSE AU TRAVERS', res
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def sain():
    tmp, arbre = cloner()
    try:
        mauvais = []
        for cmd in (DATES, banc('seance_ux'), banc('ux_integration'), banc('fig_face_dos'), banc('progres_seances')):
            code, sortie = lancer(arbre, cmd)
            if code != 0: mauvais.append(' '.join(cmd[1:]) + ' → code %d' % code)
        return mauvais
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choix = [mu for mu in MUT if not filtres or any(mu[0].startswith(f) for f in filtres)]
    if os.environ.get('MUT_SAIN', '1') != '0':
        mauvais = sain()
        if mauvais:
            print('  !! ARBRE SAIN PAS VERT — contrôle refusé :', ' · '.join(mauvais)); return 1
        print('  arbre sain : dates, seance_ux, ux_integration, fig_face_dos, progres_seances = 0 rouge (point de départ valide)\n')
    conformes = 0
    for mu in choix:
        nom, ok, verdict, res = une(mu)
        if ok is None: print('  INVALIDE  %s %s' % (nom, verdict)); continue
        conformes += bool(ok)
        print('  %s  %s' % ('OK ' if ok else '!! ', nom))
        for (cmd, mode, requis, v, code) in res:
            print('        %-9s %-52s attendu=%-8s %s' % ('[requis]' if requis else '[info]', cmd[:52], mode, ('vu' if v else 'PAS VU') + ' (code %d)' % code))
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    sys.exit(main())
