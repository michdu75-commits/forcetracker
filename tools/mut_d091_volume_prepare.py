#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D031S-B (D-031-SECURITE-01, 19/10/2026) : les temoins PREPARES de D-091 savent-ils ROUGIR ?

Les temoins de tests/parcours/d091_volume_prepare.js ne sont PAS branches dans la passe : ils attendent D-091. Ce
controle les eprouve SUR UN ARBRE QUI PORTE D-091 (argument 1) : le point de depart vert est mesure d'abord, puis
chaque defaut volontaire doit faire rougir EXACTEMENT ses temoins et laisser les autres verts. MD0 (un commentaire)
doit laisser tout VERT. Les temoins, le banc, le garde et les identites viennent de CE depot ; seul le code de l'app
vient de l'arbre donne.
[!!] DANS UNE COPIE (BUGS.md §60) et DANS UN ESPACE RESEAU ISOLE (tools/isoler_reseau.py --en-ligne).
Usage : python3 tools/mut_d091_volume_prepare.py <arbre-qui-porte-D-091> [PREFIXE[,PREFIXE...]]
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)
DEPUIS_CE_DEPOT = ['tests/_garde_reseau.js', 'tests/identites_fictives.js', 'tests/parcours/d091_volume_prepare.js',
                   'tools/banc_d091_volume_prepare.js', 'tools/isoler_reseau.py']
TEMOINS = ['①', '②', '③', '④', '⑤', '⑥', '⑥b', '⑦']
SIGNE_D091 = ('log.js', 'function _workVol(sess, avecEchauffements){')

MUT = [
    ('MD0 (temoin de controle) un COMMENTAIRE dans _workVol : tout reste VERT',
     [('log.js', "function _workVol(sess, avecEchauffements){", "function _workVol(sess, avecEchauffements){ /* commentaire D031S */")],
     set()),
    ('MD1 le volume TOTAL compte aussi les series NON validees',
     [('log.js', "if(s.done&&(avecEchauffements||(s.type!=='É'&&s.type!=='W'))",
                 "if((s.done||avecEchauffements)&&(avecEchauffements||(s.type!=='É'&&s.type!=='W'))")],
     {'③'}),
    ('MD2 une serie X ne compte plus comme TRAVAIL dans le volume',
     [('log.js', "(avecEchauffements||(s.type!=='É'&&s.type!=='W'))",
                 "(avecEchauffements||(s.type!=='É'&&s.type!=='W'&&s.type!=='X'))")],
     {'④'}),
    ('MD3 la seance ENREGISTREE prend le volume TOTAL (echauffements compris)',
     [('log.js', "const vol=_workVol({exs:S.wkt.exs,uniConv:1});", "const vol=_workVol({exs:S.wkt.exs,uniConv:1},true);")],
     {'⑥', '⑥b'}),
    ('MD4 un echauffement peut faire un RECORD',
     [('log.js', "return !!(s && s.done && s.kg && s.reps && s.type!=='É' && s.type!=='W');",
                 "return !!(s && s.done && s.kg && s.reps && s.type!=='W');")],
     {'⑥b'}),
    ('MD5 le nombre TOTAL de series oublie les echauffements',
     [('tracking.js', "const nTot=S.wkt.exs.reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s&&s.done).length,0);",
                      "const nTot=S.wkt.exs.reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s&&s.done&&s.type!=='É').length,0);")],
     {'②', '③', '④', '⑤'}),
    ('MD6 le volume TOTAL affiche oublie les echauffements',
     [('tracking.js', "const vol=volDe(true), volTrav=volDe(false),", "const vol=volDe(false), volTrav=volDe(false),")],
     {'①', '③', '④', '⑤'}),
]


def env_propre():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}
    return e


def cloner(arbre):
    tmp = tempfile.mkdtemp(prefix='mut_d091_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(arbre, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    for f in DEPUIS_CE_DEPOT:
        os.makedirs(os.path.dirname(os.path.join(a, f)), exist_ok=True)
        shutil.copyfile(os.path.join(SRC, f), os.path.join(a, f))
    return tmp, a


def jouer(a):
    r = subprocess.run([sys.executable, os.path.join(a, 'tools', 'isoler_reseau.py'), '--en-ligne', '--', 'node',
                        os.path.join(a, 'tools', 'banc_d091_volume_prepare.js')],
                       cwd=a, capture_output=True, text=True, timeout=900, env=env_propre())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVE — controle arrete :\n' + out[-500:])
    etats = {}
    for k in TEMOINS:
        etats[k] = 'absent'
        for l in out.split('\n'):
            m = re.match(r'^(   OK  |❌ ROUGE )D031S-B (\S+) ', l)
            if m and m.group(2) == k:
                etats[k] = 'vert' if m.group(1).startswith('   OK') else 'rouge'
    if '────' not in out:
        etats = {k: 'plantage' for k in TEMOINS}
    return etats, out


def main():
    if len(sys.argv) < 2:
        print(__doc__); return 2
    arbre = os.path.abspath(sys.argv[1])
    filtres = [f for f in (sys.argv[2] if len(sys.argv) > 2 else '').split(',') if f]
    f, signe = SIGNE_D091
    if signe not in open(os.path.join(arbre, f), encoding='utf-8').read():
        print('  !! cet arbre ne porte pas D-091 (%s sans « %s ») — controle refuse' % (f, signe)); return 2
    tmp0, a0 = cloner(arbre)
    sain, out = jouer(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    print('  arbre SAIN :', ' '.join('%s=%s' % kv for kv in sain.items()))
    if any(v != 'vert' for v in sain.values()):
        print('  !! un temoin n\'est pas vert sur l\'arbre sain — controle refuse'); print(out[-1500:]); return 1
    conformes = total = 0
    for nom, edits, rouges in MUT:
        if filtres and not any(nom.startswith(p) for p in filtres):
            continue
        total += 1
        tmp, a = cloner(arbre)
        invalide = []
        for fichier, av, ap in edits:
            p = os.path.join(a, fichier); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1: invalide.append('%s x%d' % (fichier, s.count(av))); continue
            open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
            if subprocess.run(['node', '--check', p], capture_output=True).returncode: invalide.append(fichier + ' : syntaxe cassee')
        if invalide:
            print('  INVALIDE  %s (%s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        etats, out = jouer(a)
        vus = {k for k, v in etats.items() if v != 'vert'}
        ok = vus == rouges and all(etats[k] == 'rouge' for k in rouges)
        conformes += ok
        print('  %s  %-74s attendu rouge %-22s obtenu %s' % ('OK ' if ok else '!! ', nom[:74], ''.join(sorted(rouges)) or '(aucun)',
                                                           ' '.join('%s=%s' % (k, v) for k, v in etats.items() if v != 'vert') or 'tout vert'))
        if os.environ.get('MUT_DETAIL'):
            for l in out.split('\n'):
                if 'ROUGE' in l or 'PLANTAGE' in l: print('        ' + l.strip()[:160])
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
