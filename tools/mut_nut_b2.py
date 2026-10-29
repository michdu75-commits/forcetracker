#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-B2 (29/10/2026) : le banc `tools/banc_nut_b2.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE, JAMAIS SUR LE DEPOT (BUGS.md §60) : chaque mutation est appliquee a un clone jetable ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une mutation est conforme si le banc rougit (code 1) ET si CHACUN des
temoins attendus fait partie des rouges. Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout.
Chaque mutation imprime l'extrait ORIGINAL et l'extrait MUTE (--montrer, par defaut actif).
Usage : python3 tools/mut_nut_b2.py [M1|M1b|...]      (les copies vont dans $TMPDIR)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ST = 'state.js'
A = 'app.js'

NC = "  if(nc) t=Math.max(t, _nutMasquesNomIndex(masques)[nc]||0);"
NORM = "  const r=_afNorm(k.slice(4));\n  return r ? 'nom:'+r : null;"
NORM_TETE = "function _nutNomNormalise(k){\n"
CLELUE = "function _n2CleLue(x){ return _n2Cle(x, (typeof _afNorm==='function') ? _afNorm : undefined); }"
BARE = "(n && e.k===n))) t=Math.max(t, +e.t||0);"
CACHE_GET = "  let c=_nutMasquesIdx ? _nutMasquesIdx.get(liste) : null;\n  if(c && c.n===liste.length) return c.idx;"
CACHE_SET = "  if(_nutMasquesIdx && liste.length) _nutMasquesIdx.set(liste, {n:liste.length, idx:idx});"
MAXT = "    idx[k]=Math.max(idx[k]||0, +e.t||0);"
DEL = "    const cle=_n2Cle(it._src||it).toLowerCase();"

MUT = [
    ('M1 la lecture normalisee est neutralisee (retour a la comparaison exacte)', [(ST, NC, "  /* M1 : lecture normalisee neutralisee */")],
     ['B-NB2 N1 ', 'B-NB2 N2 ', 'B-NB2 N4 ', 'B-NB2 P2 '], 'GARDE'),
    ('M1b la cle de LECTURE devient la cle d\'ecriture (les deux listes ne regroupent plus pareil)', [(A, CLELUE, "function _n2CleLue(x){ return _n2Cle(x); }")],
     ['B-NB2 L1 ', 'B-NB2 L3 '], 'GARDE'),
    ('M2 les cles `nom:` enregistrees sont lues sans `_afNorm` (minuscules + bords seulement)', [(ST, NORM, "  const r=k.slice(4).trim().toLowerCase();\n  return r ? 'nom:'+r : null;")],
     ['B-NB2 N1 ', 'B-NB2 N2 '], 'GARDE'),
    ('M3 l\'index memorise ne se rafraichit jamais (un seul cache global, plus de controle de liste ni de taille)',
     [(ST, CACHE_GET, "  let c=_nutMasquesIdx ? (_nutMasquesIdx.get(liste)||_nutMasquesIdx.__d) : null;\n  if(c) return c.idx;"),
      (ST, CACHE_SET, "  if(_nutMasquesIdx && liste.length){ const o={n:liste.length, idx:idx}; _nutMasquesIdx.set(liste, o); _nutMasquesIdx.__d=o; }")],
     ['B-NB2 C5 '], 'GARDE'),
    ('M3b l\'index d\'une MEME liste ne verifie plus sa taille (une liste agrandie sur place reste lue a l\'ancienne)', [(ST, CACHE_GET, "  let c=_nutMasquesIdx ? _nutMasquesIdx.get(liste) : null;\n  if(c) return c.idx;")],
     ['B-NB2 C5b '], 'GARDE'),
    ('M4 une cle `id:` est normalisee comme un nom (deux identifiants de meme forme se confondent)',
     [(ST, NORM_TETE, NORM_TETE + "  if(typeof k==='string' && k.indexOf('id:')===0 && typeof _afNorm==='function'){ const q=_afNorm(k.slice(3)); return q ? 'id:'+q : null; }\n")],
     ['B-NB2 I7 '], 'GARDE'),
    ('M4b la cle de lecture normalise aussi l\'identifiant (regroupement de deux produits par la forme de leur code)',
     [(A, CLELUE, "function _n2CleLue(x){ const k=_n2Cle(x, (typeof _afNorm==='function') ? _afNorm : undefined); return (k.indexOf('id:')===0 && typeof _afNorm==='function') ? 'id:'+_afNorm(k.slice(3)) : k; }")],
     ['B-NB2 I7b ', 'B-NB2 L3 '], 'GARDE'),
    ('M5 un ancien nom NU est lu normalise (au lieu d\'etre compare a l\'identique)',
     [(ST, BARE, "(n && typeof e.k==='string' && e.k.indexOf(':')<0 && e.k!=='*' && typeof _afNorm==='function' && _afNorm(e.k)===_afNorm(n)))) t=Math.max(t, +e.t||0);")],
     ['B-NB2 I8 ', 'B-NB2 R2 '], 'GARDE'),
    ('M6 l\'ECRITURE du masquage ("✕") est normalisee (le format enregistre change)', [(A, DEL, "    const cle=_n2Cle(it._src||it, typeof _afNorm==='function'?_afNorm:undefined).toLowerCase();")],
     ['B-NB2 P1 '], 'GARDE'),
    ('M7 la normalisation de lecture supprime les chiffres (5 % et 15 % se confondent)', [(ST, NORM, "  const r=_afNorm(k.slice(4)).replace(/[0-9]/g,'');\n  return r ? 'nom:'+r : null;")],
     ['B-NB2 I1 '], 'GARDE'),
    ('M8 l\'index garde la date la plus ANCIENNE au lieu de la plus tardive', [(ST, MAXT, "    idx[k]=idx[k] ? Math.min(idx[k], +e.t||0) : (+e.t||0);")],
     ['B-NB2 C4 '], 'GARDE'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_b2.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_b2_')
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
        print('--- %s' % nom)
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:230]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:230]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        ok = rc == 1 and not manquants
        conformes += ok
        print('  %s %s -> %s  [%s]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, 'code %d' % rc))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s\n' % (' · '.join(re.sub(r' (⭐|—|:|\().*', '', x)[:24] for x in rouges) or 'aucun'))
    print('\n%d/%d tuees (conformes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
