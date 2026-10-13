#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-LOT-B (13/10/2026) : le banc `food_lot_b` sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : la copie intacte doit etre VERTE. Une mutation GARDE est conforme si le banc rougit (code 1) ; une
mutation OK (commentaire) l'est s'il reste vert. Un PLANTAGE (code 2) n'est jamais un verdict.
Pour chaque mutation, les premiers temoins rouges sont affiches : on voit QUEL bloc mord (conduit, pas structure).
Usage : python3 tools/mut_nut_lot_b.py
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = 'app.js'

MUT = [
    ('M1 retirer la reconnaissance nombre+unite (aucune unite reconnue)',
     [(APP, r"const _AF_UNITES='g|gr|grs|gramme|grammes|kg|kgs|kilo|kilos|ml|cl|dl|l|litre|litres';",
            r"const _AF_UNITES='zzzaucuneunitezzz';")], 'GARDE'),
    ('M2 casser l\'unite separee de son nombre (« 150 g », « 250 ml » ne se lisent plus d\'un bloc)',
     [(APP, r"const _AF_QTE=new RegExp('(^|\\s)(\\d+(?:\\.\\d+)?)\\s?('+_AF_UNITES+')(?=\\s|$)','g');",
            r"const _AF_QTE=new RegExp('(^|\\s)(\\d+(?:\\.\\d+)?)('+_AF_UNITES+')(?=\\s|$)','g');")], 'GARDE'),
    ('M3 traiter N% comme une quantite ordinaire (le taux devient une unite)',
     [(APP, r"const _AF_UNITES='g|gr|grs|gramme|grammes|kg|kgs|kilo|kilos|ml|cl|dl|l|litre|litres';",
            r"const _AF_UNITES='g|gr|grs|gramme|grammes|kg|kgs|kilo|kilos|ml|cl|dl|l|litre|litres|%';")], 'GARDE'),
    ('M4 casser la prise en charge du « 0 » (plus de lecture « zero »)',
     [(APP, "    .replace(/(^|\\s)0%?(?=\\s|$)/g,'$1zero')\n", "")], 'GARDE'),
    ('M5 garder le point final comme mot obligatoire',
     [(APP, r"  return _afNorm(t).replace(/[.\u2026]+$/,'').trim()", r"  return _afNorm(t).trim()")], 'GARDE'),
    ('M6 appliquer le nettoyage aussi aux NOMS CIQUAL (recherche + empreinte `_fsTete`)',
     [(APP, "    const n=_afNorm(a[1]);\n", "    const n=_afAliment(a[1]);\n"),
      (APP, r"  const m=_afMots(String(nom||'').split(',')[0].replace(/\(aliment moyen\)/i,''));",
            r"  const m=_afMots(_afAliment(String(nom||'').split(',')[0].replace(/\(aliment moyen\)/i,'')));")], 'GARDE'),
    ('M7 remettre `_aliasCible` sur la requete brute',
     [(APP, "  const c=(_alias.a[k]!=null) ? _alias.a[k] : (f && f!==k ? _alias.a[f] : null);",
            "  const c=_alias.a[k];")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement',
     [(APP, "function _afSinonAliment(q, chercher){", "/* (commentaire de controle) */\nfunction _afSinonAliment(q, chercher){")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_food_lot_b.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = (r.stdout or '').split('\n')
    last = [l for l in out if ' OK / ' in l]
    rouges = [l.replace('❌ ROUGE ', '').split('  >> ')[0][:70] for l in out if l.startswith('❌ ROUGE')]
    return r.returncode, (last[-1].strip(' ─') if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_lotb_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN : banc %s (code %d) — controle refuse' % (res, rc)); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes = 0
    for nom, rempl, attendu in MUT:
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        chk = subprocess.run(['node', '--check', os.path.join(arbre, APP)], capture_output=True)
        if chk.returncode != 0:
            print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        if rc not in (0, 1):
            print('  !! PLANTAGE (pas un verdict) : %s -> %s' % (nom, res)); return 1
        ok = (rc == 1) if attendu == 'GARDE' else (rc == 0)
        conformes += ok
        print('  %s %-74s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:74], attendu, res))
        for l in rouges[:6]:
            print('        · ' + l)
        if len(rouges) > 6:
            print('        · ... (+%d)' % (len(rouges) - 6))
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
