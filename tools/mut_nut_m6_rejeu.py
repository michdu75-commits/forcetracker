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
# 🥗 22/10/2026 (Nutrition V2, jalon 4) — LES MUTATIONS SUIVENT LE NOUVEAU SUPPORT DE LA MEME GARANTIE. `_provFood` et son
#    marqueur sont retires (R30) ; un aliment re-note passe par `_n2Reajouter`, qui ne lit que la ligne d'origine. Chaque
#    mutation ci-dessous REINTRODUIT une facon de lire l'ecran (ou de completer / d'inventer) pendant un rejeu.
RA_ORIG = "origine:{saisie:'liste', origine:'reprise'}, quantite:Object.assign({}, R.quantite, {origine:'proposee'})};"
RA_FIN = "  return _n2Enregistrer(e, porte);"
RA_QVIDE = "  if(!R.quantite) return {ok:false, aCompleter:true};"
RA_FICHE = "  if(R.fiche){\n    e.mode='pesee'; e.fiche=R.fiche;"
RA_TETE = "function _n2Reajouter(src, repas, date, porte){\n"
RJ_TETE = "function rejouerRepas(sig, meal){\n"
RJ_MSG = "+(reste.length?' · à noter à la main (quantité inconnue) : '+reste.map(n=>String(n||'').slice(0,30)).join(', '):''),"
CIQ = "  if(!(lignes||[]).some(_n2BesoinCiqual)) return suite();"
FIGE_GARDE = "  const f=document.getElementById('af-prop'); if(f && garde) f.value=garde;"
AF_LIT = "  const _en=_n2EntreeEcran(name, _vals, !!(_bcRow && _bcRow.style.display!=='none' && _bcNutr));"
PUSH = "  }else S.foodLog.push(r.ligne);"

S = lambda *c: ['B-NM6-S ' + x for x in c]
C = lambda *c: ['B-NM6-C ' + x for x in c]

MUT = [
    ('N1 le rejeu prend la provenance de l\'ecran', [(A, RA_ORIG, RA_ORIG.replace("origine:{saisie:'liste', origine:'reprise'}", "origine:_n2Provenance()"))],
     S('S0') + C('④'), 'GARDE'),
    ('N2 le rejeu emporte la trace de fiabilite de l\'ecran', [(A, RA_FIN, "  return _n2Enregistrer(Object.assign(e, _n2Extras()), porte);")],
     S('S4') + C('④'), 'GARDE'),
    ('N3 le rejeu prend les grammes du bloc « Quantite »', [(A, RA_ORIG, RA_ORIG.replace("{origine:'proposee'})};",
        "{origine:'proposee'}, (typeof _bcNutr==='object'&&_bcNutr&&numFR((document.getElementById('af-bc-grams')||{}).value)>0)?{val:numFR(document.getElementById('af-bc-grams').value)}:{})};"))],
     S('S1', 'S5') + C('④'), 'GARDE'),
    ('N4 le rejeu complete une quantite absente (100 g)', [(A, RA_QVIDE, "  if(!R.quantite) R.quantite={val:100, unite:'g'};")], S('S0'), 'GARDE'),
    ('N5 M1 : le rejeu propage un pour-100 g NON verifie', [(A, RA_FICHE, "  if(!R.fiche && src.per100 && src.q>0 && src.u==='g') R.fiche={base:'g', p100:src.per100, source:'reprise', fiab:'declaree'};\n" + RA_FICHE)],
     S('S0'), 'GARDE'),
    ('N6 remise a zero de l\'ecran en tete du rejeu (interdite)', [(A, RJ_TETE, RJ_TETE + "  try{ _afOublierAliment(); }catch(e){}\n")], ['B-NM6-S ⑦'] + C('⑥'), 'GARDE'),
    ('N7 le rejeu pose une provenance', [(A, RJ_TETE, RJ_TETE + "  _afSetSrc({saisie:'liste', origine:'reprise'});\n")], ['B-NM6-MQ ②'] + C('⑥'), 'GARDE'),
    ('N8 un 4e ecrivain appelle _n2Enregistrer sans se declarer', [(A, RJ_TETE, "function _m6EcrivainOublie(e){ return _n2Enregistrer(e, 'x'); }\n" + RJ_TETE)], C('①'), 'GARDE'),
    ('N9 `_provFood` revient (R30)', [(A, RJ_TETE, "function _provFood(v){ return {}; }\n" + RJ_TETE)], C('⑦'), 'GARDE'),
    ('N10 l\'oracle : la source du yaourt est semee a 120 g (l\'oracle attend 125 g, ecrit a la main)',
     [(B, "{ name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 125, u: 'g', per100:",
          "{ name: 'Yaourt (test)', kcal: 75, prot: 5, carbs: 6, fat: 3, q: 120, u: 'g', per100:")], S('S0', 'S6'), 'GARDE'),
    ('N11 le message du rejeu ne nomme plus les aliments non completes', [(A, RJ_MSG, "+(reste.length?' · à noter à la main':''),")], S('S0'), 'GARDE'),
    ('N12 une ancienne ligne CIQUAL n\'attend plus la table (reprise figee avant toute recherche)', [(A, CIQ, "  return suite();")],
     S('S1') + ['B-NM6-A A1'], 'GARDE'),
    ('N13 reprise figee : la quantite tapee s\'efface au redessin', [(A, FIGE_GARDE, "  const f=document.getElementById('af-prop');")], ['B-NM6-A A2b'], 'GARDE'),
    ('N14 « ferme par defaut » : « Ajouter » ne lit plus le bloc « Quantite »', [(A, AF_LIT, "  const _en=_n2EntreeEcran(name, _vals, false);")],
     ['B-NM6-A A1', 'B-NM6-A A4'], 'GARDE'),
    ('N15 un champ d\'ecran descend dans la ligne enregistree', [(A, PUSH, "  }else S.foodLog.push(Object.assign(r.ligne, porte==='rejouerRepas'?{ecran:false}:{}));")],
     ['B-NM6-MQ ①'] + S('S0'), 'GARDE'),
    ('MC1 [negatif] commentaire seulement dans _n2Reajouter (cite document, _afSrc, _bcNutr, _provFood(, _n2Extras)',
     [(A, RA_TETE, RA_TETE + "  /* lecture interdite ici : document. _afSrc _bcNutr _provFood( _n2Extras() */\n")], [], 'OK'),
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
