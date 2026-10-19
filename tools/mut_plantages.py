#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEC-04 (D-031-SECURITE-01, decision de Michel du 19/10/2026) : un module qui plante devient un KO
IDENTIFIE, les autres modules continuent, et la passe n'est JAMAIS declaree reussie.

Chaque mutation injecte un plantage dans une COPIE de l'arbre, puis joue une passe REDUITE (installation + deux blocs +
la fin, ~25 s) dans un espace reseau isole. Elle est conforme si TOUT ce qu'elle attend est vrai :
  · le KO est NOMME (module + fonction, ou « n'a pas pu etre CHARGE ») ;
  · les temoins d'APRES le plantage ont tourne (la passe a continue) ;
  · la ligne de total est presente avec au moins 1 rouge — ou absente quand le plantage est hors module ;
  · le code de sortie n'est JAMAIS 0 ;
  · tools/passe_valide.sh (mode rejeu) dit « PASSE NON VALIDE », par la condition attendue.
P0 (un commentaire) doit, lui, rester entierement VERT : code 0, conditions ① ② vertes, 0 rouge.
[!!] DANS LA COPIE (BUGS.md §60) et DANS UN ESPACE RESEAU ISOLE (tools/isoler_reseau.py --en-ligne).
Usage : python3 tools/mut_plantages.py [PREFIXE[,PREFIXE...]]
        python3 tools/mut_plantages.py --contre-epreuve   # SEC-04 RETIRE de la copie : P0 doit rester conforme et TOUTES les
        autres mutations doivent echouer (preuve que ce controle mesure SEC-04, et pas autre chose)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)
BLOCS = ['CLXXII. Les 4 routes', 'B-CCCXIII. S1']
APRES_ORACLES = 'D031S-V ① 1RM (Brzycki)'                        # temoin joue APRES hygiene (meme module)
APRES_RIR = 'R2 : les 4 routes passent par le MÊME moteur'       # temoin du bloc CLXXII, joue APRES les modules D031S
APRES_FIN = 'B-CDXXV ② protéines inchangées'                     # temoin de source joue APRES identite_ligne.js
GR, RIR, IDL, RUN = 'tests/parcours/garde_reseau.js', 'tests/parcours/d031s_rir_superset.js', 'tests/parcours/identite_ligne.js', 'tests/parcours/runner.js'
A_HYG, A_ORA, A_DEB = "module.exports.hygiene = function (t) {", "module.exports.oracles = async function (t, b, PORT) {", "module.exports.debut = async function (t, b, PORT, chromium) {"
A_RIR = "module.exports.ecran = async function (t, b, PORT) {"
A_RIR0 = "  if (!pret.ok || !pret.lignes.every(Boolean)) { await c.close(); return; }"
A_IDL = "module.exports = function(t, ROOT, fs, path){"
A_C172 = "console.log('\\n-- CLXXII. Les 4 routes de quantité se comportent pareil (ft-v1067) --');"

# (nom, [(fichier, ancre, remplacement)], attentes)
MUT = [
    ('P0 (temoin de controle) un COMMENTAIRE dans un module : tout reste VERT', [(RIR, A_RIR, A_RIR + ' /* commentaire D031S */')],
     dict(vert=True)),
    ('P1 une fonction SYNCHRONE plante (hygiene)', [(GR, A_HYG, A_HYG + " throw new Error('défaut injecté P1');")],
     dict(ko=['⛔ MODULE ./garde_reseau.js · hygiene a PLANTÉ'], apres=[APRES_ORACLES, APRES_RIR], total=True, cond='②')),
    ('P2 une fonction ASYNCHRONE plante apres 1 temoin (RIR superset)', [(RIR, A_RIR0, A_RIR0 + "\n  throw new Error('défaut injecté P2');")],
     dict(ko=['⛔ MODULE ./d031s_rir_superset.js · ecran a PLANTÉ après 1 témoin(s)'], apres=[APRES_RIR], total=True, cond='②')),
    ('P3 un plantage qui n\'est pas une Error (throw undefined)', [(GR, A_ORA, A_ORA + " throw undefined;")],
     dict(ko=['⛔ MODULE ./garde_reseau.js · oracles a PLANTÉ'], apres=[APRES_RIR], total=True, cond='②')),
    ('P4 un module ne se CHARGE pas (exception a l\'evaluation)', [(RIR, A_RIR, "throw new Error('défaut au chargement P4');\n" + A_RIR)],
     dict(ko=['⛔ MODULE ./d031s_rir_superset.js n\'a pas pu être CHARGÉ'], apres=[APRES_RIR], total=True, cond='②',
          resume=['./d031s_rir_superset.js (chargement)', './d031s_rir_superset.js · ecran (non joué)'])),
    ('P5 un module appelle process.exit(0) avant le total', [(RIR, A_RIR, A_RIR + " process.exit(0);")],
     dict(total=False, cond='①', message='PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL')),
    ('P6 une promesse rejetee DETACHEE (jamais attendue) : KO nomme par son origine, la passe continue', [(RIR, A_RIR, A_RIR + " Promise.reject(new Error('rejet détaché P6'));")],
     dict(ko=['⛔ PROMESSE REJETÉE SANS ÊTRE ATTENDUE (tests/parcours/d031s_rir_superset.js:'], apres=[APRES_RIR], total=True, cond='②')),
    ('P7 le CORPS de la passe plante (hors module) : passe invalide, comme avant', [(RUN, A_C172, A_C172 + " throw new Error('corps P7');")],
     dict(total=False, cond='①', message='PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL')),
    ('P8 une fonction SYNCHRONE rend une promesse REJETEE que la passe n\'attend pas', [(GR, A_HYG, A_HYG + " return Promise.reject(new Error('défaut injecté P8'));")],
     dict(ko=['⛔ MODULE ./garde_reseau.js · hygiene a PLANTÉ'], apres=[APRES_RIR], total=True, cond='②')),
    ('P9 la PREUVE du garde plante : KO, puis arret ferme (code 97, aucun total)', [(GR, A_DEB, A_DEB + " throw new Error('défaut injecté P9');")],
     dict(ko=['⛔ MODULE ./garde_reseau.js · debut a PLANTÉ'], total=False, code=97, cond='①', message='GARDE RÉSEAU NON PROUVÉ')),
    ('P10 un module-FONCTION plante (module.exports = function)', [(IDL, A_IDL, A_IDL + " throw new Error('défaut injecté P10');")],
     dict(ko=['⛔ MODULE ./identite_ligne.js · (module) a PLANTÉ'], apres=[APRES_FIN], total=True, cond='②')),
]


def env_propre():
    return {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}


INSTALLE = "require('../_plantages.js').installer(__filename, t, ()=>ok+ko);"


def cloner(sans_sec04=False):
    tmp = tempfile.mkdtemp(prefix='mut_plantages_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    if sans_sec04:
        p = os.path.join(a, RUN); s = open(p, encoding='utf-8').read()
        if s.count(INSTALLE) != 1: raise SystemExit('  !! contre-epreuve : la ligne qui installe SEC-04 est introuvable')
        open(p, 'w', encoding='utf-8').write(s.replace(INSTALLE, ';', 1))
    return tmp, a


def jouer(a):
    red = os.path.join(a, 'tests', 'parcours', 'runner.reduit.js')
    subprocess.run(['node', os.path.join(a, 'tools', 'passe_reduite.js'), os.path.join(a, RUN), red] + BLOCS, check=True, capture_output=True, text=True)
    r = subprocess.run([sys.executable, os.path.join(a, 'tools', 'isoler_reseau.py'), '--en-ligne', '--', 'node', red],
                       cwd=a, capture_output=True, text=True, timeout=900, env=env_propre())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVE — controle arrete :\n' + out[-500:])
    return out, r.returncode


def valide(journal, code):
    """passe_valide.sh en mode REJEU, depuis le vrai depot (il lit le journal, ne lance rien)."""
    e = dict(env_propre(), FT_PASSE_REJOUER='1', FT_PASSE_CODE=str(code))
    r = subprocess.run(['bash', os.path.join(SRC, 'tools', 'passe_valide.sh'), journal], cwd=SRC, capture_output=True, text=True, env=e)
    o = r.stdout
    cond = {k: ('✅ ' + k in o) for k in ('①', '②')}
    rouges = int((re.search(r'rouges réels \(ancrés en début de ligne\) : (\d+)', o) or [None, '-1'])[1])
    return cond, rouges, ('PASSE NON VALIDE' in o), o


def juger(out, code, att, journal):
    raisons = []
    lignes = out.split('\n')
    tot = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', out)
    cond, rouges, non_valide, _ = valide(journal, code)
    if att.get('vert'):
        if code != 0: raisons.append('code %s' % code)
        if not tot or tot.group(2) != '0': raisons.append('total ' + (tot.group(0) if tot else 'absent'))
        if '⛔ MODULE' in out: raisons.append('un KO de module est apparu')
        if not (cond['①'] and cond['②']) or rouges != 0: raisons.append('passe_valide : %s rouges=%d' % (cond, rouges))
        return raisons
    for k in att.get('ko', []):
        i = next((n for n, l in enumerate(lignes) if l.startswith('  ❌ ') and k in l), None)
        if i is None: raisons.append('KO non nomme : « %s »' % k); continue
        for a_ in att.get('apres', []):
            if not any(l.startswith('  ✅ ') and a_ in l for l in lignes[i + 1:]): raisons.append('la passe n\'a pas continue (« %s » absent apres le KO)' % a_)
    if att.get('total') and not (tot and int(tot.group(2)) >= 1): raisons.append('total ' + (tot.group(0) if tot else 'absent') + ' (attendu : present, au moins 1 rouge)')
    if not att.get('total') and tot: raisons.append('un total est apparu : ' + tot.group(0))
    if code == 0: raisons.append('CODE 0 — la passe se dirait reussie')
    if att.get('code') is not None and code != att['code']: raisons.append('code %s (attendu %s)' % (code, att['code']))
    for m in att.get('resume', []):
        if not re.search(r'MODULE\(S\) PLANTÉ\(S\) OU NON JOUÉ\(S\) :.*' + re.escape(m), out): raisons.append('resume de fin sans « %s »' % m)
    if att.get('message') and att['message'] not in out: raisons.append('message absent : « %s »' % att['message'])
    if not non_valide: raisons.append('passe_valide.sh ne dit PAS « PASSE NON VALIDE »')
    c = att.get('cond')
    if c and cond.get(c): raisons.append('passe_valide : la condition %s reste verte' % c)
    if att.get('total') and rouges < 1: raisons.append('passe_valide : 0 rouge reel compte')
    return raisons


def main():
    contre = '--contre-epreuve' in sys.argv
    args = [x for x in sys.argv[1:] if x != '--contre-epreuve']
    filtres = [f for f in (args[0] if args else '').split(',') if f]
    conformes = total = 0
    if contre: print('  CONTRE-EPREUVE : SEC-04 retire de chaque copie — P0 doit rester conforme, toutes les autres doivent ECHOUER')
    for nom, edits, att in MUT:
        if filtres and not any(nom.startswith(p + ' ') for p in filtres):
            continue
        total += 1
        tmp, a = cloner(contre)
        invalide = []
        for f, av, ap in edits:
            p = os.path.join(a, f); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1: invalide.append('%s x%d' % (f, s.count(av))); continue
            open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
            if subprocess.run(['node', '--check', p], capture_output=True).returncode: invalide.append(f + ' : syntaxe cassee')
        if invalide:
            print('  INVALIDE  %s (%s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        out, code = jouer(a)
        journal = os.path.join(tmp, 'passe.log'); open(journal, 'w', encoding='utf-8').write(out)
        raisons = juger(out, code, att, journal)
        ok = not raisons
        if contre and not nom.startswith('P0 '): ok = bool(raisons)   # sans SEC-04, le controle DOIT voir le defaut
        conformes += ok
        tot = re.search(r'TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌', out)
        print('  %s  %-82s code %-3s %s' % ('OK ' if ok else '!! ', nom[:82], code, tot.group(0) if tot else 'aucun total'))
        for r_ in raisons: print('        -> ' + r_)
        if os.environ.get('MUT_DETAIL') or raisons:
            for l in out.split('\n'):
                if '⛔' in l or 'INTERROMPUE' in l: print('        | ' + l.strip()[:200])
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
