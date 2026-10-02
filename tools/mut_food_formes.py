#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-02 (taxonomie des formes, 02/10/2026, session-B) : les temoins
savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXXII, la taxonomie conduite
     sur la vraie base). Un rouge des seuls temoins de SOURCE (B-CDXXXI) ne suffit pas.
  M00 = le code de FS-01 (%s) remis mot pour mot · M1..M10 = les defauts demandes par Michel · DG = deguisees
  · EQ1 = equivalente (temoins executes verts) · [negatif] = commentaire
Usage : python3 tools/mut_food_formes.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'a07b4988'
AP = 'app.js'
FICHIERS = (AP,)

CRU = "  cru:      {suites:[['cru'],['crue'],['crus'],['crues']]},\n"
CUIT = "  cuit:     {suites:[['cuit'],['cuite'],['cuits'],['cuites'],"
POUDRE = "  poudre:   {suites:[['poudre'],"
PUREE = "  puree:    {suites:[['puree'],['purees']]},\n"
SAUCE = "  sauce:    {suites:[['sauce'],['sauces']], tete:true},\n"
SECHE = "  seche:    {suites:[['sec'],['secs'],['seche'],['seches'],['sechee'],['sechees']], cherche:'sec'},\n"
FIN = "  return _FS_ORDRE.filter(f=>trouve[f]);\n"
PARTIE = "  partie:   {suites:"
EGAL = "          if(!suite.every((m,k)=>t[i+k]===m)) continue;\n"
INT = "  const formes=_fsFormesDuTexte(q);\n"
SANS = "          if(i>0 && t[i-1]==='sans') continue;"
AVEC = "      if(trouve[f] || (F.avec && !tous.some(x=>F.avec.indexOf(x)>=0))) continue;\n"
TETE = "          if(F.tete && t!==segs[0]) continue;"
DECOUPE = "map(s=>_afNorm(s).split(/[\\s\\/]+/).filter(Boolean));"
VRAI = "          trouve[f]=true;\n"

MUT = [
    ('M00 le code de FS-01 remis mot pour mot (%s : app.js)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 CRU n\'est plus detecte', [(AP, CRU, "  cru:      {suites:[]},\n")], 'GARDE'),
    ('M2 CUIT n\'est plus detecte par le mot « cuit »', [(AP, CUIT, "  cuit:     {suites:[")], 'GARDE'),
    ('M3 POUDRE seulement en tete de nom (« Lait en poudre » perd sa forme)', [(AP, POUDRE, "  poudre:   {tete:true, suites:[['poudre'],")], 'GARDE'),
    ('M4 PUREE non reconnue', [(AP, PUREE, "  puree:    {suites:[]},\n")], 'GARDE'),
    ('M5 SAUCE non reconnue', [(AP, SAUCE, "  sauce:    {suites:[], tete:true},\n")], 'GARDE'),
    ('M6 SECHE confondu avec CRU (les mots du sec portent « cru »)',
     [(AP, SECHE, "  seche:    {suites:[], cherche:'sec'},\n"), (AP, CRU, "  cru:      {suites:[['cru'],['crue'],['crus'],['crues'],['sec'],['secs'],['seche'],['seches'],['sechee'],['sechees']]},\n")], 'GARDE'),
    ('M7 SURGELE ecrase CUIT', [(AP, FIN, "  if(trouve.surgele) delete trouve.cuit;\n" + FIN)], 'GARDE'),
    ('M8 PARTIE supprimee', [(AP, PARTIE, "  _partieRetiree:{suites:")], 'GARDE'),
    ('M9 detection par sous-chaine naive (« grille-pain » devient « grille »)', [(AP, EGAL, "          if(!suite.every((m,k)=>(t[i+k]||'').indexOf(m)>=0)) continue;\n")], 'GARDE'),
    ('M10 la requete explicite est ignoree (aucune forme nommee)', [(AP, INT, "  const formes=[];\n")], 'GARDE'),
    ('DG1 [deguisee] « sans X » compte comme X (« sans feuille »)', [(AP, SANS, "          if(false) continue;")], 'GARDE'),
    ('DG2 [deguisee] la partie n\'exige plus l\'oeuf (« Riz blanc » devient une partie)', [(AP, AVEC, "      if(trouve[f]) continue;\n")], 'GARDE'),
    ('DG3 [deguisee] la sauce n\'exige plus la tete du nom (« Ravioli, sauce tomate »)', [(AP, TETE, "          if(false) continue;")], 'GARDE'),
    ('DG4 [deguisee] decoupage sur l\'espace seul (« saute/poele » n\'est plus cuit)', [(AP, DECOUPE, "map(s=>_afNorm(s).split(/\\s+/).filter(Boolean));")], 'GARDE'),
    ('EQ1 [equivalente] trouve[f]=1 au lieu de true : meme verite', [(AP, VRAI, "          trouve[f]=1;\n")], 'OK'),
    ('[negatif] commentaire citant cru, cuit et sauce', [(AP, FIN, "  // cru · cuit · sauce\n" + FIN)], 'OK'),
]

def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_formes.js'], cwd=arbre, capture_output=True, text=True, timeout=300, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXXII ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_formes_')
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
