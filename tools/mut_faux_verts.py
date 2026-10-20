#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D031S (D-031-SECURITE-01, 19/10/2026) : les faux verts corriges savent-ils ROUGIR ?

Quatre temoins de la passe etaient des faux verts documentes (contre-expertise du 19/10, OPTI-TEST-02) :
  F1  CLXXII  « R2 : les 4 routes passent par le MEME moteur _qtyRescale »  -> valait `true` en dur ;
  F2  CCVI    « un objectif inconnu rend null »                              -> valait `true` en dur ;
  F3  CCCXI ⑱ « aucun moteur du banc… ni au demarrage »                      -> `corpsN(...)||'x'` : vert sur du VIDE ;
  F4  B-CCCXII ⑭ « le seul chemin nomme la seance »                           -> `.match(/…/g||[])` : PLANTAIT au lieu de rougir.
Pour CHAQUE defaut volontaire, on rejoue le bloc vise deux fois, sur le MEME arbre mute :
  AVANT = le temoin d'origine (runner du commit de depart)  ·  APRES = le temoin corrige (runner de la branche).
Une mutation est conforme si APRES rougit sur SON temoin, et si AVANT etait vert (ou plantait) : c'est la preuve
que la correction attrape ce que l'ancien temoin laissait passer. F0 (commentaire) doit rester VERT des deux cotes.
[!!] DANS LA COPIE MUTEE (BUGS.md §60) et DANS UN ESPACE RESEAU ISOLE (tools/isoler_reseau.py --en-ligne).
[!!] Passe REDUITE au bloc vise (tools/passe_reduite.js) : un controle cible, jamais une passe complete.
Usage : python3 tools/mut_faux_verts.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : toutes les lignes rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPART = 'daa1a737'
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)
T_R2 = "R2 : les 4 routes passent par le MÊME moteur `_qtyRescale`"
T_NUL = "un objectif inconnu rend `null`, jamais un verdict par défaut"
T_18 = "CCCXI ⑱"
T_14 = "B-CCCXII ⑭"
B_R2, B_NUL, B_18, B_14 = "CLXXII. Les 4 routes", "CCVI. Une seule source", "CCCIX. LA RÉACTIVATION", "B-CCCXII."

def corps(src, nom):
    i = src.index('function ' + nom + '(')
    j = src.index('{', i); p = 0
    for k in range(j, len(src)):
        if src[k] == '{': p += 1
        elif src[k] == '}':
            p -= 1
            if not p: return src[i:k + 1]
    raise ValueError(nom)

MUT = [
    ('F0 (temoin de controle) un COMMENTAIRE du moteur de quantite modifie : tout reste VERT', [B_R2],
     [('app.js', "function _qtyRescale(pre, base, ref, saisie){", "function _qtyRescale(pre, base, ref, saisie){ /* commentaire D031S */")],
     {T_R2: 'vert'}, {T_R2: 'vert'}),
    ('F1a une route de quantite ne passe plus par le moteur commun (elle l\'appelle sous un autre nom)', [B_R2],
     [('app.js', "  _qtyRescale('ef', e.per100, 100, (document.getElementById('ef-grams')||{}).value);",
                 "  (window._qtyCopie=window._qtyCopie||_qtyRescale)('ef', e.per100, 100, (document.getElementById('ef-grams')||{}).value);")],
     {T_R2: 'rouge'}, {T_R2: 'vert'}),
    ('F1b un 2e moteur _qtyRescale apparait (copie a l\'identique : deux proprietaires)', [B_R2],
     'DOUBLON', {T_R2: 'rouge'}, {T_R2: 'vert'}),
    ('F2 un objectif inconnu recoit le verdict de « muscle » au lieu de null', [B_NUL],
     [('state.js', "function trendPourObjectif(goal){ return _GOAL_TREND[goal||'muscle']||null; }",
                   "function trendPourObjectif(goal){ return _GOAL_TREND[goal||'muscle']||_GOAL_TREND.muscle; }")],
     {T_NUL: 'rouge'}, {T_NUL: 'vert'}),
    ('F3a l\'ecran d\'ajout d\'aliment est reecrit en expression de fonction : son CORPS devient introuvable pour le temoin', [B_18],
     [('app.js', "function openAddFood(){", "var openAddFood=function(){")],
     {T_18: 'rouge'}, {T_18: 'vert'}),
    ('F3b un moteur du banc est cite au DEMARRAGE (ecouteur load)', [B_18],
     [('app.js', "window.addEventListener('load',()=>{try{if(typeof _initSheetHandles==='function')_initSheetHandles();}catch(e){}});",
                 "window.addEventListener('load',()=>{try{if(window.Quagga)window.Quagga.init;if(typeof _initSheetHandles==='function')_initSheetHandles();}catch(e){}});")],
     {T_18: 'rouge'}, {T_18: 'vert'}),
    ('F4 la consigne qui nomme la seance disparait du debrief', [B_14],
     [('log.js', " ⛔ LA SÉANCE À DÉBRIEFER EST EXACTEMENT CELLE-CI : ", " ⛔ La séance à débriefer : ")],
     {T_14: 'rouge'}, {T_14: 'plantage'}),
]


def env_propre():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}
    e['TZ'] = os.environ.get('TZ', '')
    if not e['TZ']: e.pop('TZ')
    return e


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_fv_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    avant = subprocess.run(['git', 'show', DEPART + ':tests/parcours/runner.js'], cwd=SRC, capture_output=True, text=True, check=True).stdout
    open(os.path.join(a, 'tests', 'parcours', 'runner.avant.js'), 'w', encoding='utf-8').write(avant)
    return tmp, a


def jouer(arbre, runner, blocs):
    red = os.path.join(arbre, 'tests', 'parcours', 'runner.reduit.js')
    subprocess.run(['node', os.path.join(arbre, 'tools', 'passe_reduite.js'), os.path.join(arbre, 'tests', 'parcours', runner), red] + blocs,
                   check=True, capture_output=True, text=True)
    r = subprocess.run([sys.executable, os.path.join(arbre, 'tools', 'isoler_reseau.py'), '--en-ligne', '--', 'node', red],
                       cwd=arbre, capture_output=True, text=True, timeout=900, env=env_propre())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVE — controle arrete :\n' + out[-500:])
    return out, ('TOTAL CROISÉ' in out)


def etat(out, total, libelle):
    for l in out.split('\n'):
        if libelle in l and ('✅' in l or '❌' in l):
            return 'vert' if '✅' in l else 'rouge'
    return 'plantage' if not total else 'absent'


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    tous = [B_R2, B_NUL, B_18, B_14]
    sains = {}
    for runner in ('runner.js', 'runner.avant.js'):
        out, total = jouer(a0, runner, tous)
        sains[runner] = {lib: etat(out, total, lib) for lib in (T_R2, T_NUL, T_18, T_14)}
    shutil.rmtree(tmp0, ignore_errors=True)
    print('  arbre SAIN — apres :', sains['runner.js'], '\n               avant :', sains['runner.avant.js'])
    if any(v != 'vert' for v in sains['runner.js'].values()) or any(v != 'vert' for v in sains['runner.avant.js'].values()):
        print('  !! un temoin n\'est pas vert sur l\'arbre sain — controle refuse'); return 1
    conformes = total = 0
    for nom, blocs, edits, attendu_apres, attendu_avant in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if edits == 'DOUBLON':
            p = os.path.join(arbre, 'app.js'); s = open(p, encoding='utf-8').read()
            s = s + '\n' + corps(s, '_qtyRescale') + '\n'
            open(p, 'w', encoding='utf-8').write(s)
        else:
            invalide = []
            for f, av, ap in edits:
                p = os.path.join(arbre, f); s = open(p, encoding='utf-8').read()
                if s.count(av) != 1: invalide.append('%s x%d' % (f, s.count(av))); continue
                open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
            if invalide:
                print('  INVALIDE  %s (ancre : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            if subprocess.run(['node', '--check', os.path.join(arbre, edits[0][0])], capture_output=True).returncode:
                print('  INVALIDE  %s (syntaxe cassee)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        res = {}
        for runner in ('runner.js', 'runner.avant.js'):
            out, tot = jouer(arbre, runner, blocs)
            res[runner] = {lib: etat(out, tot, lib) for lib in set(attendu_apres) | set(attendu_avant)}
            if os.environ.get('MUT_DETAIL'):
                for l in out.split('\n'):
                    if '❌' in l or 'Error' in l: print('        [%s] %s' % (runner, l.strip()[:150]))
        ok = all(res['runner.js'][k] == v for k, v in attendu_apres.items()) and all(res['runner.avant.js'][k] == v for k, v in attendu_avant.items())
        conformes += ok
        print('  %s  %-92s apres %-30s avant %s' % ('OK ' if ok else '!! ', nom[:92], res['runner.js'], res['runner.avant.js']))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
