#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MIGRER UN ANCIEN BANC SOUS LE GARDE RESEAU — sans modification aveugle (D-031-SECURITE-01, decision de Michel du 19/10/2026).

Pour chaque fichier inscrit « a migrer » dans tests/garde_existants.json :
  1. AVANT : il est joue tel quel, dans une COPIE de l'arbre et un espace reseau isole (tools/isoler_reseau.py --en-ligne) ;
  2. la ligne du garde est inseree comme PREMIERE instruction (apres le « #! » et la directive 'use strict' : le mode
     strict du fichier ne change pas) ;
  3. APRES : il est rejoue, meme copie, meme isolement ;
  4. COMPARAISON : memes temoins, memes verdicts, meme code de sortie. Un ecart est rejoue une fois (un banc instable ne
     doit pas passer pour un effet du garde). Identique -> la ligne est posee dans le VRAI fichier et il sort de la liste ;
     sinon RIEN n'est touche et l'ecart est dit.
⛔ Aucun temoin n'est retire ni modifie : seule une ligne s'ajoute en tete du fichier.
⛔ Les fichiers « Milo — conserve (decision 3) » sont refuses (decision de Michel : on n'y touche pas).
Usage : python3 tools/migrer_garde.py <fichier> [...]        (MIGRER_SEC=1 : affiche les ecarts complets)
        python3 tools/migrer_garde.py --essai <fichier> [...] (mesure seulement : ne touche ni au fichier ni a la liste)
"""
import json, os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTE = os.path.join(SRC, 'tests', 'garde_existants.json')
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)
DELAI = int(os.environ.get('MIGRER_DELAI', '900'))
INSERER_JS = r"""
const fs = require('fs'), path = require('path');
const acorn = require('/opt/node-tools/node_modules/acorn');
const [f, racine] = process.argv.slice(1);
const src = fs.readFileSync(f, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true });
let pos = 0;
for (const st of ast.body) { if (st.type === 'ExpressionStatement' && st.directive) pos = st.end; else break; }
if (!pos) { const m = src.match(/^#![^\n]*\n/); pos = m ? m[0].length : 0; }
let rel = path.relative(path.dirname(f), path.join(racine, 'tests', '_garde_reseau.js')).split(path.sep).join('/');
if (!rel.startsWith('.')) rel = './' + rel;
const ligne = "require('" + rel + "');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 — migration vérifiée avant/après : tools/migrer_garde.py)";
const sep = pos && src[pos - 1] !== '\n' ? '\n' : '';
fs.writeFileSync(f, src.slice(0, pos) + sep + ligne + '\n' + src.slice(pos).replace(/^\n/, ''));
"""


def env_propre():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}
    e['LANG'] = e.get('LANG', 'C.UTF-8')
    return e


def verdicts(out):
    """Les temoins et leur verdict, chiffres normalises (une duree ou une heure dans un libelle n'est pas un verdict)."""
    v = []
    for l in out.split('\n'):
        s = l.rstrip()
        m = re.match(r'^\s*(✅|❌)\s+(.+)$', s) or re.match(r'^\s*(OK)\s{2}(.+)$', s) or re.match(r'^(❌) ROUGE (.+?)(?:  >>.*)?$', s)
        if not m: continue
        lab = re.sub(r'\d+([.,]\d+)?', '#', m.group(2).strip())
        if re.fullmatch(r'#\s*/\s*#', lab): continue          # une ligne de total « ✅ 24/25 »
        v.append(('vert' if m.group(1) in ('✅', 'OK') else 'rouge') + ' · ' + lab)
    return sorted(v)


def jouer(arbre, fichier):
    cmd = ['python3', os.path.join(arbre, 'tools', 'isoler_reseau.py'), '--en-ligne', '--'] + (['node', fichier] if fichier.endswith('.js') else ['python3', fichier])
    t0 = time.time()
    try:
        r = subprocess.run(cmd, cwd=arbre, capture_output=True, text=True, timeout=DELAI, env=env_propre())
        out, code = r.stdout + r.stderr, r.returncode
    except subprocess.TimeoutExpired as e:
        out, code = str(e.stdout or ''), 'DELAI'
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVE — migration arretee :\n' + out[-400:])
    return {'code': code, 'v': verdicts(out), 'n': len(verdicts(out)), 'duree': round(time.time() - t0, 1), 'out': out}


def ecart(a, b):
    if a['code'] != b['code']: return 'code %s -> %s' % (a['code'], b['code'])
    if a['v'] != b['v']:
        sa, sb = set(a['v']), set(b['v'])
        return 'verdicts : %d avant, %d apres ; disparus %s ; apparus %s' % (len(a['v']), len(b['v']), sorted(sa - sb)[:3], sorted(sb - sa)[:3])
    return ''


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    essai = '--essai' in sys.argv
    if not args:
        print(__doc__); return 2
    doc = json.load(open(LISTE, encoding='utf-8'))
    inscrits = {x['fichier']: x for x in doc['fichiers']}
    tmp = tempfile.mkdtemp(prefix='migrer_garde_')
    arbre = os.path.join(tmp, 'a')
    shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    migres, refuses = [], []
    for f in args:
        f = os.path.relpath(os.path.abspath(f), SRC) if os.path.isabs(f) else f
        x = inscrits.get(f)
        if not x: refuses.append((f, 'non inscrit dans tests/garde_existants.json')); print('  REFUSE   %s (non inscrit)' % f); continue
        if x['etat'] != 'à migrer': refuses.append((f, x['etat'])); print('  REFUSE   %s (%s)' % (f, x['etat'])); continue
        if not f.endswith('.js'): refuses.append((f, 'pas un fichier .js (migration a la main)')); print('  REFUSE   %s (pas .js)' % f); continue
        cible = os.path.join(arbre, f)
        original = open(cible, encoding='utf-8').read()
        avant = jouer(arbre, f)
        subprocess.run(['node', '-e', INSERER_JS, cible, arbre], check=True)
        if subprocess.run(['node', '--check', cible], capture_output=True).returncode:
            open(cible, 'w', encoding='utf-8').write(original); refuses.append((f, 'syntaxe cassee par l\'insertion')); print('  REFUSE   %s (syntaxe)' % f); continue
        apres = jouer(arbre, f)
        e = ecart(avant, apres)
        if e:                                   # un ecart : on rejoue les deux une fois (banc instable ?)
            open(cible, 'w', encoding='utf-8').write(original); avant2 = jouer(arbre, f)
            subprocess.run(['node', '-e', INSERER_JS, cible, arbre], check=True); apres2 = jouer(arbre, f)
            e2 = ecart(avant2, apres2)
            if e2 or ecart(avant, avant2):
                open(cible, 'w', encoding='utf-8').write(original)
                refuses.append((f, e2 or ('instable sans le garde : ' + ecart(avant, avant2))))
                print('  ECART    %-52s %s' % (f, (e2 or 'instable sans le garde')[:150]))
                if os.environ.get('MIGRER_SEC'): print(apres2['out'][-1500:])
                continue
            avant, apres = avant2, apres2
        migres.append(f)
        print('  IDENTIQUE %-51s code %s · %d temoin(s) · %.0f s / %.0f s' % (f, apres['code'], apres['n'], avant['duree'], apres['duree']))
        if not essai:
            shutil.copyfile(cible, os.path.join(SRC, f))
    if migres and not essai:
        doc['fichiers'] = [x for x in doc['fichiers'] if x['fichier'] not in set(migres)]
        open(LISTE, 'w', encoding='utf-8').write(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d migre(s)%s, %d refuse(s) ou en ecart' % (len(migres), ' (ESSAI : rien ecrit)' if essai else '', len(refuses)))
    for f, r in refuses: print('   - %s : %s' % (f, r[:160]))
    return 0 if not refuses else 1


if __name__ == '__main__':
    raise SystemExit(main())
