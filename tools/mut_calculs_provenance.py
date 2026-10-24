#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUTRITION V2, JALON 4 (22/10/2026) : le bloc 12 de tests/calculs/runner.js (« la provenance de chaque
ligne du journal »), réécrit sur le contrat V2, sait-il ROUGIR ?

Ses témoins ont été réécrits (règle d'or #17 : *tout témoin réécrit doit ensuite rougir sous mutation volontaire*). Chaque
mutation casse UNE garantie de `app.js` sur une COPIE complète de l'app (jamais le dépôt, BUGS.md §60), dans un espace réseau
isolé (tools/isoler_reseau.py --en-ligne) ; la suite `calculs` est rejouée entière sur la copie. Une mutation est conforme
si CHACUN de ses témoins attendus rougit ; un plantage n'est jamais compté comme « attrapé ». L'arbre sain est rejoué
d'abord et doit être ENTIÈREMENT vert (leçon du 22/10 : un arbre « sain » qui rougit ailleurs n'est pas sain).
Usage : python3 tools/mut_calculs_provenance.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)

MUT = [
    ('C1 une saisie SANS poids reçoit 100 g inventés (garde-fou du 10/09)',
     [('app.js', "  return {ok:false, message:'Combien pesait ce que tu as mangé ? Indique le poids en grammes (ou le volume en ml).'};",
       "  return {ok:true, entree:Object.assign(e, {mode:'declaree', declare:vals, quantite:{val:100, unite:'g'}})};")],
     ['⭐⭐ SAISIE MANUELLE SANS POIDS']),
    ('C2 une valeur retouchée sur une fiche n\'est plus tracée (la ligne garde le calcul)',
     [('app.js', "      corrections:_n2CorrectionsEcran(_afCorr)})};", "      corrections:[]})};")],
     ['⭐⭐ VALEURS RETOUCHEES A LA MAIN']),
    # ⚠️ La provenance est rendue DEUX fois (à l'ouverture et à l'enregistrement) : retirer l'une ne prouve rien.
    ('C3 la provenance du scan survit à la saisie suivante (les DEUX remises à zéro retirées)',
     [('app.js', " voir. Une provenance fausse est pire que pas de provenance : elle se\n     présente comme un fait vérifiable. */\n  _afSetSrc(null);\n",
       " voir. Une provenance fausse est pire que pas de provenance : elle se\n     présente comme un fait vérifiable. */\n"),
      ('app.js', "  _afSetSrc(null);   // la provenance ne survit pas à l'enregistrement (R15 : le marqueur se pose et se rend)\n", "")],
     ['⭐⭐ LA PROVENANCE NE SURVIT PAS']),
    ('C4 le pour-100 g de la fiche n\'est plus gardé sur la ligne',
     [('nutrition-v2.js', "      L.per100 = lireValeurs(f.p100).valeurs;", "      L.per100 = null;")],
     ['⭐ ... et les valeurs au 100 g sont gardees']),
]


def env_propre():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}
    return e


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_calc_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    return tmp, a


def jouer(arbre):
    r = subprocess.run([sys.executable, os.path.join(arbre, 'tools', 'isoler_reseau.py'), '--en-ligne', '--',
                        os.path.join(arbre, 'tools', 'sous_garde.sh'), 'node', os.path.join(arbre, 'tests', 'calculs', 'runner.js')],
                       cwd=arbre, capture_output=True, text=True, timeout=1800, env=env_propre())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVÉ — contrôle arrêté :\n' + out[-500:])
    return out, ('TOTAL LINÉAIRE' in out)


def etat(out, total, lib):
    for l in out.split('\n'):
        m = re.match(r'^\s*(✅|❌) (.*)$', l)
        if m and m.group(2).startswith(lib):
            return 'vert' if m.group(1) == '✅' else 'rouge'
    return 'plantage' if not total else 'absent'


def main():
    tmp0, a0 = cloner()
    out, tot = jouer(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    rouges = [l.strip()[2:120] for l in out.split('\n') if re.match(r'^\s+❌', l)]
    sains = {lib: etat(out, tot, lib) for m in MUT for lib in m[2]}
    print('  arbre SAIN : %d témoin(s) attendu(s), %d vert(s) ; %d rouge(s) en tout' % (
        len(sains), sum(v == 'vert' for v in sains.values()), len(rouges)))
    if not tot or rouges or any(v != 'vert' for v in sains.values()):
        print('  !! arbre SAIN pas entièrement vert — contrôle refusé :', ' | '.join(rouges) or sains); return 1
    conformes = 0
    for nom, edits, attendus in MUT:
        tmp, arbre = cloner()
        invalide = []
        for f, av, ap in edits:
            p = os.path.join(arbre, f); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1: invalide.append('%s x%d' % (f, s.count(av))); continue
            open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
        if invalide:
            print('  INVALIDE  %s (ancre : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        out, tot = jouer(arbre)
        res = {lib: etat(out, tot, lib) for lib in attendus}
        ok = tot and all(v == 'rouge' for v in res.values())
        conformes += bool(ok)
        rg = [l.strip()[2:90] for l in out.split('\n') if re.match(r'^\s+❌', l)]
        print('  %s  %s\n        attendus : %s\n        rouges (%d) : %s' % ('OK ' if ok else '!! ', nom, res, len(rg), ' | '.join(rg[:5])))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    raise SystemExit(main())
