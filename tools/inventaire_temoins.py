#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 INVENTAIRE INDÉPENDANT DES TÉMOINS ATTENDUS — pour la REVUE qui précède tout calibrage  (INFRA-QA-01 · 17/11/2026)
 ⭐ POURQUOI : le premier calibrage du manifeste (`tools/passe_valide.sh --calibrer --croiser …`) tire ses identités de DEUX passes. Si un témoin est omis dans les DEUX
    (un `t(` retiré du code, un module planté de la même façon dans les deux modes), il disparaît du manifeste SANS que rien ne le dise. Cet outil fournit la 2ᵉ source,
    celle qui ne dépend d'AUCUN journal : il LIT LE CODE SOURCE (les appels `t('libellé littéral', …)`), par fichier, avec la partition (`tests/parcours/repartition-<K>.json`)
    de chaque module, et le CONFRONTE ensuite au journal d'une passe pour nommer les libellés littéraux du code qui n'ont pas tourné.
 ⛔ CE QU'IL N'EST PAS (limite dite, jamais cachée) : un libellé construit (gabarit `${…}`, concaténation, boucle) n'est pas inventoriable statiquement : il est COMPTÉ à part
    (« dynamiques ») et reste à la charge de la revue humaine ; un `t(` dans une branche conditionnelle jamais atteinte sort « absent » à tort (la revue tranche) ;
    « tous présents » ne PROUVE PAS que le journal est complet. Il ne calibre rien, ne lance rien, n'écrit rien dans le dépôt, ne lit aucune donnée réelle.
 Usage : python3 tools/inventaire_temoins.py inventorier [racine]                       # par fichier : appels littéraux, dynamiques, processus de la partition
         python3 tools/inventaire_temoins.py confronter [racine] <journal>             # les libellés littéraux du code ABSENTS du journal (à relire, jamais « verts par défaut »)
         python3 tools/inventaire_temoins.py --auto-test                               # s'éprouve sur un arbre FICTIF (secondes)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import collections, glob, json, os, re, shutil, sys, tempfile
sys.dont_write_bytecode = True
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RACINE, 'tools'))
import temoins

RE_APPEL = re.compile(r"""(?<![\w.$])t\(\s*(?:'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"|(`))""")
RE_FIN = re.compile(r'\s*[,)]')
RE_ECH = re.compile(r"\\(['\"\\nt]|u[0-9a-fA-F]{4})")


def _dec(s):
    def r(m):
        c = m.group(1)
        return {'n': '\n', 't': '\t'}.get(c) or (chr(int(c[1:], 16)) if c[0] == 'u' else c)
    return RE_ECH.sub(r, s)


def fichiers(racine):
    out = sorted(glob.glob(os.path.join(racine, 'tests', 'parcours', '*.js')))
    out = [f for f in out if '.part-' not in f]
    return out


def partition(racine, k=3):
    try:
        rep = json.load(open(os.path.join(racine, 'tests', 'parcours', 'repartition-%d.json' % k), encoding='utf-8'))
    except (OSError, ValueError):
        return {}
    return {os.path.basename(m): int(p) for m, p in rep.items() if isinstance(p, int)}


def inventorier(racine):
    """{fichier: {'litteraux': Counter(libellé → n), 'dynamiques': n, 'processus': p}} — lecture seule du code source."""
    part = partition(racine); res = {}
    for f in fichiers(racine):
        src = open(f, encoding='utf-8', errors='replace').read()
        lit, dyn = collections.Counter(), 0
        for m in RE_APPEL.finditer(src):
            if m.group(3):
                dyn += 1; continue
            texte = m.group(1) if m.group(1) is not None else m.group(2)
            if not RE_FIN.match(src, m.end()):          # « 'abc' + x » : libellé construit
                dyn += 1; continue
            lit[_dec(texte)] += 1
        nom = os.path.basename(f)
        res[nom] = {'litteraux': lit, 'dynamiques': dyn, 'processus': 0 if nom == 'runner.js' else part.get(nom, None)}
    return res


def confronter(racine, journal):
    """Pour chaque fichier : les libellés littéraux du code qui ne sont PAS dans le journal (libellé exact, `✅`/`❌`). Rend {fichier: {'presents': n, 'absents': [libellés]}}."""
    a = temoins.analyser(temoins.lire(journal))
    vus = collections.Counter(lib for lib in a['libelles'])
    vus_tous = set(vus)
    res = {}
    for nom, d in inventorier(racine).items():
        absents = [l for l in d['litteraux'] if l not in vus_tous and l.strip() not in {v.strip() for v in vus_tous}]
        res[nom] = {'presents': len(d['litteraux']) - len(absents), 'absents': sorted(absents), 'dynamiques': d['dynamiques'], 'processus': d['processus']}
    return res


def rapport_inventaire(inv):
    L = ['INVENTAIRE STATIQUE DES TÉMOINS (lecture du code source, aucun journal) — %d fichier(s)' % len(inv), '']
    L.append('%-44s %9s %11s %9s' % ('fichier', 'littéraux', 'dynamiques', 'processus'))
    for nom, d in sorted(inv.items()):
        L.append('%-44s %9d %11d %9s' % (nom[:44], sum(d['litteraux'].values()), d['dynamiques'], '?' if d['processus'] is None else d['processus']))
    tot = sum(sum(d['litteraux'].values()) for d in inv.values())
    L += ['', 'TOTAL littéraux : %d · dynamiques : %d' % (tot, sum(d['dynamiques'] for d in inv.values())),
          '⛔ Les « dynamiques » (gabarits, concaténations, boucles) NE SONT PAS inventoriés : ils restent à la charge de la revue humaine ; un « ? » de processus = module absent de la partition (joué dans le processus 0).']
    return L


def rapport_confrontation(conf):
    L = ['CONFRONTATION CODE ↔ JOURNAL — libellés LITTÉRAUX du code absents du journal (à relire : branche conditionnelle, ou témoin réellement omis)', '']
    n_abs = 0
    for nom, d in sorted(conf.items()):
        if d['absents']:
            L.append('%s : %d absent(s) sur %d littéraux' % (nom, len(d['absents']), d['presents'] + len(d['absents'])))
            for l in d['absents'][:5]: L.append('    · %s' % l[:110])
            if len(d['absents']) > 5: L.append('    · … et %d autre(s)' % (len(d['absents']) - 5))
            n_abs += len(d['absents'])
    L += ['', 'TOTAL absents : %d · ⛔ « 0 absent » ne prouve PAS que le journal est complet (libellés dynamiques non inventoriés).' % n_abs]
    return L, n_abs


def auto_test():
    d = tempfile.mkdtemp(prefix='inv-temoins-')
    try:
        os.makedirs(d + '/tests/parcours'); os.makedirs(d + '/tools')
        open(d + '/tests/parcours/runner.js', 'w', encoding='utf-8').write("t('bloc un', true);\nt('bloc deux', true);\nt('libellé construit ' + x, true);\nt(`gabarit ${y}`, true);\n")
        open(d + '/tests/parcours/m1.js', 'w', encoding='utf-8').write("t(\"module A\", ok);\nt('module B', ok);\nt('l\\'apostrophe', ok);\n")
        json.dump({'./m1.js': 1}, open(d + '/tests/parcours/repartition-3.json', 'w'))
        inv = inventorier(d)
        journal = d + '/j.log'
        open(journal, 'w', encoding='utf-8').write("  ✅ bloc un\n  ✅ module A\n  ✅ l'apostrophe\n\n════ TOTAL CROISÉ : 3 ✅ · 0 ❌ ════\n")
        conf = confronter(d, journal)
        rep, nabs = rapport_confrontation(conf)
        verifs = [('les appels littéraux sont comptés par fichier (runner 2, m1 3)', sum(inv['runner.js']['litteraux'].values()) == 2 and sum(inv['m1.js']['litteraux'].values()) == 3),
                  ('un libellé construit et un gabarit sont comptés « dynamiques » (2), jamais inventoriés', inv['runner.js']['dynamiques'] == 2),
                  ('un échappement (\\\') est décodé comme dans le journal', "l'apostrophe" in inv['m1.js']['litteraux']),
                  ('la partition est lue : m1.js → processus 1 ; runner.js → 0', inv['m1.js']['processus'] == 1 and inv['runner.js']['processus'] == 0),
                  ('un témoin du code ABSENT du journal est NOMMÉ (« bloc deux », « module B »)', nabs == 2 and conf['runner.js']['absents'] == ['bloc deux'] and conf['m1.js']['absents'] == ['module B']),
                  ('le rapport dit la limite (pas de preuve de complétude)', any('ne prouve PAS' in l for l in rep)),
                  ('rien n\'a été écrit dans l\'arbre lu', sorted(os.listdir(d + '/tests/parcours')) == ['m1.js', 'repartition-3.json', 'runner.js'])]
        ok = 0
        for nom, cond in verifs:
            ok += bool(cond); print('  %s %s' % ('✅' if cond else '❌', nom))
        print('──── %d OK / %d rouge ────' % (ok, len(verifs) - ok))
        return 0 if ok == len(verifs) else 1
    finally:
        shutil.rmtree(d, ignore_errors=True)


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    if a[0] == '--auto-test': sys.exit(auto_test())
    if a[0] == 'inventorier':
        print('\n'.join(rapport_inventaire(inventorier(a[1] if len(a) > 1 else RACINE)))); sys.exit(0)
    if a[0] == 'confronter' and len(a) >= 2:
        rac, jr = (a[1], a[2]) if len(a) > 2 else (RACINE, a[1])
        l, n = rapport_confrontation(confronter(rac, jr)); print('\n'.join(l)); sys.exit(0)
    print(__doc__); sys.exit(2)
