#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF du contrat « exercice chiffre » du banc de Milo (21/09/2026).

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

CE QU'IL DOIT PROUVER, ET POURQUOI C'EST LE POINT DELICAT
    Ce correctif ELARGIT une reconnaissance. Deux facons opposees de le casser, et les
    temoins doivent mordre sur LES DEUX :
      1. TROP ETROIT — on retire une des formes reconnues, et le faux vert revient. C'est
         le defaut d'origine : un filtre d'entree qui ne reconnait rien ne trouve jamais
         de violation, donc le temoin metier passe au vert SANS RIEN MESURER.
      2. TROP LARGE — « tout reconnaitre » ferait passer les temoins d'elargissement les
         yeux fermes. Ce sont les gardes anti-permissivite qui doivent alors rougir.

    ⛔ ET UNE FAMILLE A PART : la REGRESSION PARTIELLE. Remettre l'ancien motif brut a UN
      SEUL site d'appel laisse le banc majoritairement correct — c'est exactement le genre
      de retour en arriere qu'on ne voit pas en lisant un diff.

    ⭐ DEUX mutations doivent rester VERTES : elles ne touchent que des COMMENTAIRES, en y
      citant le motif brut et les ecritures que les temoins cherchent. C'est la seule facon
      de prouver qu'on mesure le CODE et non la phrase qui l'explique — et R30 exige
      justement que cette phrase soit ecrite la.

Usage : python3 tools/mut_motif_exercice.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV = 'tests/milo/eval-scenarios.js'
BANC = 'tools/banc_motif_exercice.js'

MUT = [
    # ══ 1. TROP ETROIT — le faux vert revient ══════════════════════════════════════════
    ('M01  la forme « 4 series de 5 » n est plus reconnue',
     "    /\\d+\\s*(?:series?|serie|sets?)\\s*(?:[x×*]|de|d'|of|par)?\\s*\\d+/,",
     '    /(?!)/,', 'GARDE'),

    ('M02  la forme « 4 de 5 reps » n est plus reconnue',
     "    /\\d+\\s*(?:[x×*]|de|d'|of)\\s*\\d+\\s*(?:reps?|repetitions?|repet)/,",
     '    /(?!)/,', 'GARDE'),

    ('M03  l ordre inverse « 5 reps x 4 series » n est plus reconnu',
     '    /\\d+\\s*(?:reps?|repetitions?)\\s*[x×*]\\s*\\d+\\s*(?:series?|sets?)/,',
     '    /(?!)/,', 'GARDE'),

    ('M04  la forme « 4 series, 8 reps » n est plus reconnue',
     '    /\\d+\\s*(?:series?|sets?)\\s*[,:;-]\\s*\\d+\\s*(?:reps?|repetitions?)/,',
     '    /(?!)/,', 'GARDE'),

    ('M05  les tableaux Markdown ne sont plus reconnus', '  _tableau(n){\n    if(n.indexOf',
     '  _tableau(n){\n    if(true) return false;\n    if(n.indexOf', 'GARDE'),

    ('M09  l ANCIEN motif disparait : le sur-ensemble est casse',
     '    /\\d+\\s*[x×]\\s*\\d+/,                                                '
     "// (1) l'ancien contrat, INTACT",
     '    /(?!)/,', 'GARDE'),

    # ══ 2. TROP LARGE — la permissivite ════════════════════════════════════════════════
    ('M10  « chiffre » accepte tout (le contrat ne refuse plus rien)',
     '  chiffre(t){ const n=U.norm(t); return U._EX.some(r=>r.test(n)) || U._tableau(n); },',
     '  chiffre(t){ return true; },', 'GARDE'),

    ('M06  une ligne de tableau n exige plus de NOM en premiere cellule',
     '    if((cel[0].match(/[a-z]/g)||[]).length<3) return false;', '    if(false) return false;',
     'GARDE'),

    ('M07  le tableau accepte une cellule qui CONTIENT un chiffre (85 kg, 2 min)',
     '    return cel.filter(c=>/^\\d+(?:\\s*-\\s*\\d+)?$/.test(c)).length>=2;',
     '    return cel.filter(c=>/\\d/.test(c)).length>=2;', 'GARDE'),

    ('M08  un SEUL entier nu suffit a faire une ligne de tableau',
     '    return cel.filter(c=>/^\\d+(?:\\s*-\\s*\\d+)?$/.test(c)).length>=2;',
     '    return cel.filter(c=>/^\\d+(?:\\s*-\\s*\\d+)?$/.test(c)).length>=1;', 'GARDE'),

    # ══ 3. REGRESSION PARTIELLE — un seul site d appel revient en arriere ══════════════
    ('M11  EV-055 : le garde « il a bien ecrit une seance » revient au motif brut',
     "            if(U.chiffre(m)) n++; }));",
     '            if(/\\d+\\s*[x×]\\s*\\d+/.test(U.norm(m))) n++; }));', 'GARDE'),

    ('M12  EV-056 : le compteur de lignes revient au motif brut',
     '          const nEx=U.lignes(reply).filter(l=>U.chiffre(l)).length;',
     '          const nEx=U.lignes(reply).filter(l=>/\\d+\\s*[x×]\\s*\\d+/.test(U.norm(l))).length;',
     'GARDE'),

    # ══ 4. LE COMPTEUR D EXERCICES ═════════════════════════════════════════════════════
    ('M13  « compterEx » ne decoupe plus sur la ponctuation',
     "      l.split(/[,;.]/).forEach(m=>{ if(U.chiffre(m)) n++; }); });",
     '      if(U.chiffre(l)) n++; });', 'GARDE'),

    ('M14  « compterEx » compte TOUTES les lignes, prescriptions ou non',
     '  compterEx(reply){\n    let n=0;', '  compterEx(reply){\n    return U.lignes(reply).length;\n    let n=0;',
     'GARDE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    ("[negatif] un COMMENTAIRE cite le motif brut et « 4 series de 5 repetitions »",
     '  _EX:[', "  // rappel : l'ancien motif etait /\\d+\\s*[x×]\\s*\\d+/ et ne voyait ni\n"
     '  // « 4 series de 5 repetitions » ni « 4 sets of 5 »\n  _EX:[', 'OK'),

    ("[negatif] un COMMENTAIRE cite un en-tete et un separateur de tableau",
     '  _tableau(n){', "  // rappel : « | Exercice | Series | Reps | » et « |---|---| » ne sont PAS\n"
     '  // des lignes d exercice, et aucune regle particuliere ne les ecarte\n  _tableau(n){', 'OK'),
]


def banc(arbre):
    """Le banc cible, joue tel quel. Rend True s'il est entierement vert."""
    r = subprocess.run([sys.executable and 'node', BANC], cwd=arbre,
                       capture_output=True, text=True, timeout=180)
    return r.returncode == 0, (r.stdout + r.stderr)


def main():
    # ⛔ On mesure d'abord l'arbre SAIN : un controle negatif dont le point de depart est
    #    deja rouge ne prouve rien (lecon du 20/09, payee deux fois).
    tmp0 = tempfile.mkdtemp(prefix='mot_sain_')
    a0 = os.path.join(tmp0, 'a')
    shutil.copytree(SRC, a0, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
    vert, sortie = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if not vert:
        print('  !! ARBRE SAIN DEJA ROUGE :')
        print('\n'.join('     ' + l for l in sortie.strip().split('\n')[-6:]))
        return 1
    print('  arbre sain : banc entierement vert (point de depart valide)\n')

    conformes = 0
    for nom, avant, apres, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='mot_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, EV)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-66s (ancre %s)'
                  % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))

        vert, sortie = banc(arbre)
        obtenu = 'OK' if vert else 'GARDE'
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.strip()[:56] for l in sortie.split('\n') if l.strip().startswith('❌')]
        print('  %s  %-66s %-6s %s' % ('OK ' if ok else '!! ', nom, obtenu,
                                       (rouges[0] if rouges else '')))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
