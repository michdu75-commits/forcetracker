#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-FOOD-VARIANTS-01 (session-B, 12/10/2026) : les temoins B-FV savent-ils ROUGIR ?

Le lot fait respecter un qualificatif nutritionnel tape (un taux, entier / ecreme, allege, « sans sucre ») par trois
proprietaires existants de la recherche d'aliments : `_afNorm` (le taux colle a son %, la virgule decimale),
`_afTrouve` (un taux n'est pas dans un autre, un mot NIE ne compte pas, sauf « ou non / ou sans ») et `_afRang`
(« sans X » d'un bloc). Les mutations sont celles du brief de Michel, plus une par regle posee :
  M1  ignorer completement les pourcentages            M2  5 %, 10 %, 15 %, 20 % equivalents (sous-chaine)
  M3  ignorer entier / ecreme / demi-ecreme            M4  promouvoir une variante incompatible (mot entier inverse)
  M5  forcer une variante par defaut sans qualificatif M6a supprimer la protection d'un mot NIE dans le nom
  M6b « sans X » tape ne se lit plus d'un bloc         M7  « 5 % » (espace) n'est plus recolle
  M8  la virgule decimale coupe de nouveau le nombre   M9  « ou non / ou sans » redevient une negation
  M10 [Y3] « non X » M11 [Y13] pluriels M12 decimal de quantite M13 contraire M14 « ou non » tape M15 rang « dans un mot »
  M16 debut de mot (NUT-FOOD-VARIANTS-02, contre-verification)
  MC1 (controle) un COMMENTAIRE modifie : VERT         MC2 (controle) une ecriture EQUIVALENTE : VERT
[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60). Une mutation qui casse la
SYNTAXE est refusee, et un rouge qui n'est QU'un plantage ne compte pas. M00 = l'app.js de 0407516b (base du lot).
Usage : python3 tools/mut_food_variants.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_JOBS=n)
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = 'app.js'
BASE_AVANT = '0407516b'     # le code D-042 qualifie, avant NUT-FOOD-VARIANTS-01
BANCS = ['tools/banc_food_variants.js']

GLUE_DEC = ".replace(/(\\d),(\\d+)\\s*%/g,'$1.$2%')"
GLUE_PCT = ".replace(/(\\d)\\s+%/g,'$1%')"
BRUTS = "const bruts=_afNorm(q).split(/\\s+/).filter(m=>m.length>1);"
BORNE = "    if(/^[0-9]/.test(t) && /[0-9.]/.test(n[i-1]||'')) continue;\n"
NEG = "    if(!nie && /(^|\\s)(sans|non) $/.test(avant) && !/(^|\\s)ou (sans|non) $/.test(avant)) continue;\n"
OU = " && !/(^|\\s)ou (sans|non) $/.test(avant)"
BLOC = "    if(/^(sans|non)$/.test(mots[i]) && i+1<mots.length && mots[i-1]!=='ou'){"
CONTRAIRE = "      if(xs.some(t=>_afTrouve(n, t, true)>=0)) return null;\n"
DANSMOT = "xs.some(t=>_afTrouve(n, t)>=0) ? 1 : 2"
DEBUTMOT = "    if(mot && i>0 && !/[ -]/.test(n[i-1])) continue;"
SG = "  if(sg && _afTrouve(n, sg)>=0) return {t:sg, approx:1};"
ENTIER = "  const entier = _fsMotsEntiers(it.mots, a[1])?0:1;"
TRI = "  out.sort((x,y)=>_fsComparer(x.k, y.k));\n"
COMM = "/* 🥛 NUT-FOOD-VARIANTS-01 (12/10/2026) — OÙ UN MOT TAPÉ SE TROUVE VRAIMENT DANS UN NOM."
PREM = "    const premier=i===0;"

MUT = [
    ("M00 le code d'AVANT (app.js de 0407516b)", 'AVANT', 'GARDE'),
    ('M1 ignorer completement les pourcentages', [(BRUTS, BRUTS[:-1] + ".filter(m=>!/%/.test(m));")], 'GARDE'),
    ('M2 5 %, 10 %, 15 %, 20 % equivalents (le taux redevient une sous-chaine)', [(BORNE, '')], 'GARDE'),
    ('M3 ignorer entier / ecreme / demi-ecreme', [(BRUTS, BRUTS[:-1] + ".filter(m=>!/^(entiere?|ecreme|demi-ecreme)$/.test(m));")], 'GARDE'),
    ('M4 promouvoir une variante incompatible (mot entier inverse dans la cle)', [(ENTIER, ENTIER.replace('?0:1', '?1:0'))], 'GARDE'),
    ('M5 forcer une variante par defaut quand aucun qualificatif n\'est tape',
     [(TRI, TRI + "  if(!/\\d/.test(q)){ const k=out.findIndex(x=>/(^|[^0-9])(0|5)% mg/.test(_afNorm(x.a[1]))); if(k>=0) return [out[k].a]; }\n")], 'GARDE'),
    ('M6a supprimer la protection d\'un mot NIE dans le nom (non allege, sans sucres)', [(NEG, '')], 'GARDE'),
    ('M6b « sans X » tape ne se lit plus d\'un bloc', [(BLOC, "    if(false){")], 'GARDE'),
    ('M7 « 5 % » (espace) n\'est plus recolle a son %', [(GLUE_PCT, '')], 'GARDE'),
    ('M8 la virgule decimale coupe de nouveau le nombre (1,2 %)', [(GLUE_DEC, '')], 'GARDE'),
    ('M9 « ou non / ou sans » redevient une negation', [(OU, '')], 'GARDE'),
    # NUT-FOOD-VARIANTS-02 (12/10/2026, contre-verification) : Y3 « non X », Y13 pluriels, decimal de taux / de quantite,
    # retour du contraire, « ou non » tape, rang des mots qui ne portent X qu'a l'interieur, debut de mot.
    ('M10 [Y3] « non X » tape n\'est plus une negation (seul « sans » l\'est)', [(BLOC, BLOC.replace('(sans|non)', '(sans)'))], 'GARDE'),
    ('M11 [Y13] au pluriel, le singulier redevient une sous-chaine (« non enrichi » repond a « enrichis »)', [(SG, "  if(sg && n.indexOf(sg)>=0) return {t:sg, approx:1};")], 'GARDE'),
    ('M12 la virgule est gardee pour TOUT nombre decimal (« eau 1,5 l » vide)', [(GLUE_DEC, ".replace(/(\\d),(\\d)/g,'$1.$2')")], 'GARDE'),
    ('M13 le CONTRAIRE explicite n\'est plus ecarte (« sel iode » pour « sel non iode »)', [(CONTRAIRE, '')], 'GARDE'),
    ('M14 « ou non » tape redevient une negation (les noms complets se perdent)', [(BLOC, BLOC.replace(" && mots[i-1]!=='ou'", ''))], 'GARDE'),
    ('M15 « decafeine », « decouenne » ne passent plus devant un nom qui ne dit rien', [(DANSMOT, '2')], 'GARDE'),
    ('M16 X n\'a plus besoin d\'etre en debut de mot pour etre un contraire', [(DEBUTMOT, '')], 'GARDE'),
    ('MC1 (controle) un COMMENTAIRE modifie : le banc doit rester VERT', [(COMM, COMM.replace('(12/10/2026)', '(12/10/2026, controle)'))], 'OK'),
    ('MC2 (controle) une ecriture EQUIVALENTE : le banc doit rester VERT', [(PREM, "    const premier=(i===0);")], 'OK'),
]


def banc(arbre):
    rouges = []
    for b in BANCS:
        r = subprocess.run(['node', b], cwd=arbre, capture_output=True, text=True, timeout=1800, env=dict(os.environ, TZ='Europe/Paris'))
        out = r.stdout + r.stderr
        rg = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
        if r.returncode not in (0, 1) and not rg:
            rg = ['%s · PLANTAGE (code %d)' % (b, r.returncode)]
        rouges += rg
    return rouges


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin],
                       capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_fv_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def jouer(item, avant):
    nom, remplacements, attendu = item
    tmp, arbre = cloner()
    try:
        cible = os.path.join(arbre, APP); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                return (nom, 'INVALIDE', "code d'avant introuvable ou identique", [], attendu)
            src = avant
        else:
            invalide = ['%s (x%d)' % (av[:50], src.count(av)) for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                return (nom, 'INVALIDE', 'ancre absente ou multiple : %s' % invalide, [], attendu)
            if any(av == ap for av, ap in remplacements):
                return (nom, 'INVALIDE', 'remplacement identique', [], attendu)
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(cible):
            return (nom, 'INVALIDE', 'syntaxe cassee par la mutation', [], attendu)
        rouges = banc(arbre)
        sem = [r for r in rouges if 'PLANTAGE' not in r]
        obtenu = 'GARDE' if sem else ('PLANTE' if rouges else 'OK')
        return (nom, obtenu, '', rouges, attendu)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = subprocess.run(['git', 'show', BASE_AVANT + ':' + APP], cwd=SRC, capture_output=True, text=True).stdout
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge — point de depart valide\n')
    choisis = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_JOBS', '3'))) as ex:
        res = list(ex.map(lambda m: jouer(m, avant), choisis))
    conformes = 0
    for nom, obtenu, motif, rouges, attendu in res:
        if obtenu == 'INVALIDE':
            print('  INVALIDE  %s (%s)' % (nom, motif)); continue
        ok = obtenu == attendu
        conformes += ok
        print('  %s  %-80s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom[:80], obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
    print('\n%d/%d conformes' % (conformes, len(choisis)))
    return 0 if conformes == len(choisis) else 1


if __name__ == '__main__':
    raise SystemExit(main())
