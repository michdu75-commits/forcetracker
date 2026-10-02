#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-01 (02/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXIX resolveur conduit sur
     la vraie base, B-CDXXX premier affichage par la vraie frappe). Un rouge des seuls temoins de SOURCE
     (B-CDXXVIII) ne suffit pas.
  M00 = le code d'avant (master %s) remis mot pour mot · M1..M6 = les defauts demandes par Michel
  · M7..M11 = les autres pieces du lot (coupure a 400, alias faux, alias « eau », forme partie, petit mot) · DG = deguisees
  · EQ1 = equivalente (temoins executes verts) · [negatif] = commentaire
Usage : python3 tools/mut_food_semantics.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'ad172a87'
AP, AJ = 'app.js', 'data/alias.json'
FICHIERS = (AP, AJ)

# ancres mises a jour par FS-02 (meme intention, code de la taxonomie) — les mutations FS-01 restent les memes
GEN = "  const forme = manque ? 2 : (nonDemandee ? 1 : 0);\n"
EXP = "  const manque = it.formes.some(f=>_fsFormesDuTexte(a[1]).indexOf(f)<0);\n"
INT = "  const formes=_fsFormesDuTexte(q);\n"
CLE = "  return [r[0], forme, r[1], entier, teteExacte, teteSing, n.length, n, a[0]];\n"
TETE = "          if((opt.debut||F.tete) && !t.slice(0,i).every(x=>_AF_OUTILS.has(x))) continue;"
PARTIE = "  partie:   {suites:"
CIQ_DEB = "  const teteSing = (_fsTete(a[1], true)===it.mots.map(_fsSing).join(' '))?0:1;\n"
UNIQ = "    Promise.all([_ciqualCharger(), _aliasCharger()]).then(()=>{\n"
DEUX = ("    _ciqualCharger().then(()=>{\n"
        "      const enCours=(document.getElementById('af-desc')||{}).value||'';\n"
        "      if(_afNorm(enCours)!==_afNorm(q)) return;\n"
        "      _afSuggCiq=_ciqualChercher(q,6); _afSuggRendu();\n"
        "    });\n"
        "    _aliasCharger().then(async()=>{ await _ciqualCharger();\n")
PUSH = "    out.push({k:_fsCle(a, it, r), a:a});\n"

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s : app.js + data/alias.json)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 preference « boisson » desactivee (la forme transformee n\'est plus penalisee)', [(AP, GEN, GEN.replace("(nonDemandee ? 1 : 0)", "0"))], 'GARDE'),
    ('M2 l\'etat explicite est ignore (la forme nommee n\'est ni reconnue ni cherchee)', [(AP, INT, "  const formes=[];\n")], 'GARDE'),
    ('M3 les alias rendus APRES le 1er affichage (deux rendus, comme avant)', [(AP, UNIQ, DEUX)], 'GARDE'),
    ('M4 la longueur du nom redevient le critere dominant', [(AP, CLE, "  return [r[0], n.length, forme, r[1], entier, teteExacte, teteSing, n, a[0]];\n")], 'GARDE'),
    ('M5 preference frais / seche inversee (la forme transformee passe devant)', [(AP, GEN, GEN.replace("(nonDemandee ? 1 : 0)", "(nonDemandee ? 0 : 1)"))], 'GARDE'),
    ('M6 le tri depend de l\'ordre des candidats (plus de departage par nom puis code)', [(AP, CLE, "  return [r[0], forme, r[1], entier, teteExacte, teteSing, n.length];\n")], 'GARDE'),
    ('M7 retour de la coupure a 400 candidats (les 400 PREMIERS du fichier)', [(AP, PUSH, PUSH + "    if(out.length>400) break;\n")], 'GARDE'),
    ('M8 les alias faux remis (pomme -> Pomme, seche ; haricots verts -> puree)',
     [(AJ, '"pomme":13396', '"pomme":13111'), (AJ, '"haricots verts":20030', '"haricots verts":20257')], 'GARDE'),
    ('M9 l\'alias « eau » retire (le nom le plus court, « Eau de coco », repasse devant)', [(AJ, '"eau":18066,', '')], 'GARDE'),
    ('M10 plus de forme « partie » (« Oeuf, blanc » repasse devant un oeuf entier)', [(AP, PARTIE, "  _partieRetiree:{suites:")], 'GARDE'),
    ('M11 la forme n\'est plus lue apres un petit mot (« Oeuf, en poudre » n\'est plus une poudre)', [(AP, TETE, "          if((opt.debut||F.tete) && i>0) continue;")], 'GARDE'),
    ('DG1 [deguisee] l\'approximation repasse APRES le nom de tete (« pates » -> « Pate »)', [(AP, CLE, "  return [r[0], forme, entier, teteExacte, teteSing, r[1], n.length, n, a[0]];\n")], 'GARDE'),
    ('DG2 [deguisee] l\'explicite ne regarde que les qualificatifs (« lait poudre »)', [(AP, EXP, EXP.replace("_fsFormesDuTexte(a[1])", "_fsFormesDuTexte(a[1], {qualificatifs:true})"))], 'GARDE'),
    ('DG3 [deguisee] plus de mot entier (« gaufre » retrouve « Gaufrette »)', [(AP, CLE, "  return [r[0], forme, r[1], teteExacte, teteSing, n.length, n, a[0]];\n")], 'GARDE'),
    ('DG4 [deguisee] l\'« aliment moyen » remis dans la cle (« coca » -> « Cola, sans precision »)',
     [(AP, CIQ_DEB, CIQ_DEB + "  const moyen = /\\(aliment moyen\\)/i.test(a[1])?0:1;\n"),
      (AP, CLE, "  return [r[0], forme, r[1], entier, teteExacte, moyen, teteSing, n.length, n, a[0]];\n")], 'GARDE'),
    ('DG5 [deguisee] plus de nom de tete (« fromage » -> « Fromage de tete »)', [(AP, CLE, "  return [r[0], forme, r[1], entier, n.length, n, a[0]];\n")], 'GARDE'),
    ('DG6 [deguisee] l\'approximation repasse AVANT la forme (« haricots verts » -> la puree, pluriel exact)', [(AP, CLE, "  return [r[0], r[1], forme, entier, teteExacte, teteSing, n.length, n, a[0]];\n")], 'GARDE'),
    ('EQ1 [equivalente] le code ecrit -(-code) : meme nombre, meme ordre', [(AP, CLE, "  return [r[0], forme, r[1], entier, teteExacte, teteSing, n.length, n, -(-a[0])];\n")], 'SOURCE'),
    ('[negatif] commentaire citant longueur, 400 et alias', [(AP, PUSH, PUSH + "    // longueur · 400 · alias\n")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_semantics.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXX(IX|X) ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_semantics_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        nom = nom.replace('%%', '%')
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if isinstance(remplacements, str) and remplacements.startswith('REV:'):
            rev = remplacements[4:]; diff = 0
            for f in FICHIERS:
                av = subprocess.run(['git', 'show', rev + ':' + f], cwd=SRC, capture_output=True, text=True).stdout
                if not av:
                    print('  INVALIDE  %s (%s introuvable dans %s)' % (nom, f, rev)); break
                if av != open(os.path.join(arbre, f), encoding='utf-8').read(): diff += 1
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av)
            else:
                if not diff:
                    print('  INVALIDE  %s (code de %s identique)' % (nom, rev)); shutil.rmtree(tmp, ignore_errors=True); continue
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-70s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
