#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-M6-REJEU-01 (21/10/2026) : le banc sait-il ROUGIR, et au BON endroit ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (sinon le controle est refuse).
Une mutation GARDE est conforme si le banc `tools/banc_nut_m6_rejeu.js` rougit (code 1) ET si
CHACUN des temoins attendus fait partie des rouges : un rouge ailleurs ne prouve pas que le bon
temoin mord. Une mutation OK (commentaire) est conforme si le banc reste vert.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout.
Usage : python3 tools/mut_nut_m6_rejeu.py      (les copies vont dans $TMPDIR)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
B = 'tests/parcours/nut_m6_rejeu.js'
G1 = "if(ecran&&row&&row.style.display!=='none'"
G2 = "if(ecran && !p.per100 && typeof _afRef==='object'"
G3 = "if(ecran && !p.q && _afPortionPose"
G4 = "if(ecran && _z && _z.etat!=='COHERENT'){"
MARQ = "const ecran=!(_afSrc && _afSrc.ecran===false);"
RJ_SRC = "Object.assign({saisie:'liste',origine:'reprise',ecran:false}, _srcRepriseQ(e, qOk))"
QA_SRC = "try{ _afSetSrc(Object.assign({saisie:'liste', origine:'reprise', ecran:false},"
RJ_FIN = "  }); }finally{"
QA_FIN = "  S.foodLog.push(_l);\n  }finally{"
AF_PROV = "    _provFood({kcal,prot,carbs,fat}));"
RJ_TETE = "function rejouerRepas(sig, meal){\n"

S = lambda *c: ['B-NM6-S ' + x for x in c]
C = lambda *c: ['B-NM6-C ' + x for x in c]

MUT = [
    ('N1 garde « bloc grammes » retiree', [(A, G1, G1.replace('ecran&&', ''))], S('S1', 'S5') + C('⑥'), 'GARDE'),
    ('N2 garde « ancre en grammes » retiree', [(A, G2, G2.replace('ecran && ', ''))], S('S2 ', 'S2b') + C('⑦'), 'GARDE'),
    ('N3 garde « portions » retiree', [(A, G3, G3.replace('ecran && ', ''))], S('S3') + C('⑧'), 'GARDE'),
    ('N4 garde « trace de fiabilite » retiree', [(A, G4, G4.replace('ecran && ', ''))], S('S4') + C('⑨'), 'GARDE'),
    ('N5 le rejeu ne pose plus le marqueur', [(A, RJ_SRC, RJ_SRC.replace(',ecran:false', ''))],
     S('S1', 'S2 ', 'S2b', 'S3', 'S4', 'S5') + C('②'), 'GARDE'),
    ('N5b l\'ajout rapide ne pose plus le marqueur (comportement inchange : seul le cliquet le voit)',
     [(A, QA_SRC, QA_SRC.replace(', ecran:false', ''))], C('③'), 'GARDE'),
    ('N6 « ferme par defaut » : l\'ajout depuis l\'ecran ne lit plus l\'ecran',
     [(A, MARQ, "const ecran=!!(_afSrc && _afSrc.ecran===true);")], ['B-NM6-A A1', 'B-NM6-A A2', 'B-NM6-A A3', 'B-NM6-A A4'] + C('⑤'), 'GARDE'),
    ('N7 l\'oracle : la source du yaourt est semee a 120 g (l\'oracle attend 125 g, ecrit a la main)',
     [(B, "{ name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 125, u: 'g', per100:",
          "{ name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 120, u: 'g', per100:")], S('S0', 'S6'), 'GARDE'),
    ('N8 remise a zero de l\'ecran en tete du rejeu (variante alpha, interdite)',
     [(A, RJ_TETE, RJ_TETE + "  try{ _afOublierAliment(); }catch(e){}\n")], ['B-NM6-S ⑦'], 'GARDE'),
    ('N9 le rejeu ne rend plus la provenance dans un finally (rendue apres la boucle, comme avant)',
     [(A, RJ_FIN, "  }); }catch(e){ throw e; }{")], ['B-NM6-MQ ③'] + C('⑩'), 'GARDE'),
    ('N10 l\'ajout rapide n\'efface plus sa provenance dans un finally',
     [(A, QA_FIN, "  S.foodLog.push(_l);\n  }catch(e){ throw e; }{")], ['B-NM6-MQ ④', 'B-NM6-MQ ⑤'] + C('⑪'), 'GARDE'),
    ('N11 un 4e ecrivain appelle _provFood sans se declarer',
     [(A, RJ_TETE, "function _m6EcrivainOublie(v){ return _provFood(v); }\n" + RJ_TETE)], C('①'), 'GARDE'),
    ('N12 le marqueur descend dans la ligne enregistree',
     [(A, "  return p;\n}\nfunction _loadZXing(){", "  if(!ecran) p.ecran=false;\n  return p;\n}\nfunction _loadZXing(){")],
     ['B-NM6-MQ ①', 'B-NM6-S S0'] + C('⑤'), 'GARDE'),
    ('N13 _provFood ne lit plus le marqueur', [(A, MARQ, "const ecran=true;")], S('S1', 'S2 ', 'S2b', 'S3', 'S4', 'S5') + C('⑤'), 'GARDE'),
    ('N14 addFoodEntry pose le marqueur', [(A, AF_PROV, "    (_afSetSrc(Object.assign({},_afSrc||{},{ecran:false})),_provFood({kcal,prot,carbs,fat})));")],
     ['B-NM6-A A1', 'B-NM6-A A2', 'B-NM6-A A3', 'B-NM6-A A4'] + C('④'), 'GARDE'),
    ('MC1 [negatif] commentaire seulement dans _provFood', [(A, MARQ, "/* commentaire sans effet */ " + MARQ)], [], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_m6_rejeu.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_m6_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    for nom, rempl, attendus, attendu in MUT:
        if seul and not nom.startswith(seul + ' '):
            continue
        total += 1
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '--check', f], cwd=arbre, capture_output=True) if f != A else \
                subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('app.js','utf8'))"], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        if attendu == 'GARDE':
            manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
            ok = rc == 1 and not manquants
        else:
            manquants = []
            ok = rc == 0
        conformes += ok
        print('  %s %-78s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:78], attendu, res))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s' % (' · '.join(re.sub(r' → .*| \(.*', '', x)[:40] for x in rouges) or 'aucun'))
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
