#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D031S (D-031-SECURITE-01, 19/10/2026) : les temoins du garde reseau savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
[!!] DANS UN ESPACE RESEAU ISOLE : le banc tourne sous tools/isoler_reseau.py (lo seule). Une mutation AFFAIBLIT le
     garde ; elle ne doit pouvoir rien atteindre, meme vers les destinations fictives des temoins.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Chaque mutation vise le VRAI garde (tests/_garde_reseau.js) et nomme le temoin qui doit rougir (CIBLE) : une mutation
n'est conforme que si CE temoin rougit (ou si le banc refuse de demarrer quand la cible est PLANTAGE — le garde est
ferme par defaut). Une seule mutation touche un commentaire, et elle doit rester VERTE.
L'environnement du banc est vide de tout nom de secret ; on y pose UN faux secret (D031S_FAUX_TOKEN=fictif) pour que
le temoin ③ ait quelque chose a voir.
Usage : python3 tools/mut_garde_reseau.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import json, os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = 'tests/_garde_reseau.js'
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)

ARGS_PROXY = "const ARGS_NAV = ['--proxy-server=' + PROXY_MORT, '--proxy-bypass-list"
ARGS_SANS = "const ARGS_NAV = ['--proxy-bypass-list"
NAV_GARDE = "  if (lance && !ligne.includes('--proxy-server=' + PROXY_MORT)) {"
CLIENT_PW = "const RE_CLIENT_PW = /playwright-core[\\\\/]lib[\\\\/]client[\\\\/](browserType|browser|browserContext|network)\\.js$/;"
ENTREE = "  if (!types.length || !types.every(t => DEJA.has(Object.getPrototypeOf(t))) || !patches.Browser || !patches.Route) {"

LANCE = 'lau' + 'nch'   # D031S-VII : voir le commentaire des mutations G1 a G7
MUT = [
    ('M00 le garde absent : le fichier ne fait plus rien', 'VIDE', '①'),
    ('M01 le refus par defaut n\'est jamais pose sur les contextes -> refuse DES LE LANCEMENT (preuve D031S-2 ; avant : temoin ④)',
     [(G, "const poserRefus = (c) => c.route(RE_NON_LOCAL, refusParDefaut);", "const poserRefus = (c) => Promise.resolve();")], "PREUVE:refus par défaut non prouvé"),
    ('M02 le proxy mort retire des arguments du navigateur : le garde des enfants refuse le lancement (ferme par defaut)',
     [(G, ARGS_PROXY, ARGS_SANS)], 'PLANTAGE'),
    ('M03 le proxy mort retire partout (arguments, environnement du processus, environnement des enfants) ET garde des enfants desactive',
     [(G, ARGS_PROXY, ARGS_SANS), (G, NAV_GARDE, "  if (false) {"),
      (G, "'all_proxy']) process.env[k] = PROXY_MORT;", "'all_proxy']) delete process.env[k];"),
      (G, "'all_proxy']) e[k] = PROXY_MORT;", "'all_proxy']) delete e[k];")], '⑥'),
    ('M04 les options de contournement (--no-proxy-server, proxy direct) ne sont plus retirees',
     [(G, "const RE_ARGS_RETIRES = /^--(proxy-server|", "const RE_ARGS_RETIRES = /^$^--(proxy-server|")], '⑫'),
    ('M05 les connexions TCP de Node ne sont plus gardees -> refuse DES LE LANCEMENT (preuve D031S-2 ; avant : temoin ②)',
     [(G, "  if (!chemin && !estLocalHote(hote)) {", "  if (false) {")], "PREUVE:Node n'est pas gardé"),
    ('M06 les resolutions DNS de Node ne sont plus gardees -> refuse DES LE LANCEMENT (preuve D031S-2 ; avant : temoin ②)',
     [(G, "dns.lookup = function (h, ...r) { return estLocalHote(h) ?", "dns.lookup = function (h, ...r) { return true ?"),
      (G, "    obj[nom] = function (h, ...r) { return estLocalHote(h) ?", "    obj[nom] = function (h, ...r) { return true ?")], "PREUVE:Node n'est pas gardé"),
    ('M07 les variables au nom de secret restent dans l\'environnement de la passe',
     [(G, "for (const k of Object.keys(process.env)) if (k !== 'NODE_OPTIONS' && RE_SECRET.test(k)) { secretsRetires.push(k);",
           "for (const k of Object.keys(process.env)) if (false) { secretsRetires.push(k);")], '③'),
    ('M08 l\'environnement EXPLICITE d\'un processus enfant n\'est plus nettoye',
     [(G, "  for (const k of Object.keys(e)) if (k !== 'NODE_OPTIONS' && RE_SECRET.test(k)) delete e[k];",
           "  for (const k of Object.keys(e)) if (false) delete e[k];")], '⑬'),
    ('M09 le garde n\'est plus transmis aux enfants (NODE_OPTIONS)',
     [(G, "if (!(process.env.NODE_OPTIONS || '').includes(SOI)) process.env.NODE_OPTIONS =", "if (false) process.env.NODE_OPTIONS =")], '⑬'),
    ('M10 contexte persistant, connect, CDP et serveur de navigateur acceptes',
     [(G, "      if (typeof BT.prototype[nom] === 'function') BT.prototype[nom] = function () { throw",
           "      if (false) BT.prototype[nom] = function () { throw")], '⑪'),
    ('M11 unrouteAll() d\'un test retire le refus par defaut',
     [(G, "    if (typeof ua0 === 'function') BC.prototype.unrouteAll =", "    if (false) BC.prototype.unrouteAll =")], '⑨'),
    ('M12 un navigateur lance hors Playwright sans le proxy mort est accepte',
     [(G, NAV_GARDE, "  if (false) {")], '⑭'),
    ('M13 classement : une reponse simulee est comptee comme SORTIE',
     [(G, "      if (d === 'fulfill') sort = 'simulée';", "      if (false) sort = 'simulée';")], 'D031S-II ②'),
    ('M14 la decision fulfill du test n\'est plus enregistree (une simulation passerait pour une sortie)',
     [(G, "if (!DECISION.has(rq) || decision !== 'fallback') DECISION.set(rq, decision); }",
           "if (decision !== 'fulfill' && (!DECISION.has(rq) || decision !== 'fallback')) DECISION.set(rq, decision); }")], 'D031S-II ②'),
    ('M15 Playwright non reconnu (aucune classe patchee) : le chargement refuse (ferme par defaut)',
     [(G, CLIENT_PW, "const RE_CLIENT_PW = /^$^/;")], 'PLANTAGE'),
    ('M16 Playwright non reconnu ET verification d\'entree desactivee : le garde des enfants refuse encore le lancement',
     [(G, CLIENT_PW, "const RE_CLIENT_PW = /^$^/;"), (G, ENTREE, "  if (false) {")], 'PLANTAGE'),
    ('M17 Playwright non reconnu, verification d\'entree ET garde des enfants desactives : le temoin ① le voit',
     [(G, CLIENT_PW, "const RE_CLIENT_PW = /^$^/;"), (G, ENTREE, "  if (false) {"), (G, NAV_GARDE, "  if (false) {")], '①'),
    ('M18 la porte des contextes n\'est plus enveloppee (les contextes naissent sans refus par defaut) -> refuse DES LE LANCEMENT (preuve D031S-2 ; avant : temoin ④)',
     [(G, "    B.prototype[nom] = async function (...a) { const c = await nc0.apply(this, a); await installerContexte(c); return c; };",
           "    B.prototype[nom] = nc0;")], "PREUVE:le contexte est né SANS refus par défaut"),
    ('M19 les erreurs du garde ne portent plus sa marque (un echec « faute de reseau » ne passe pas pour le garde) -> refuse DES LE LANCEMENT (preuve D031S-2 ; avant : temoin ②)',
     [(G, "{ code: code || 'ENETUNREACH', gardeReseau: true });", "{ code: code || 'ENETUNREACH', gardeReseau: false });")], "PREUVE:Node n'est pas gardé"),
    # ── les identites (D031S-III), l'hygiene des temoins (D031S-IV), les oracles independants (D031S-V)
    ('I1 le serveur des tests sert de nouveau les identites REELLES (substitution coupee)',
     [('tests/identites_fictives.js', "  if (!motif || typeof texte !== 'string' || texte.indexOf('@') < 0) return texte;",
       "  return texte;")], 'D031S-III ②'),
    ('I2 une identite n\'est plus trouvable dans le code (_isChristophe renomme) : ferme par defaut',
     [('app.js', "function _isChristophe(){", "function _isChristopheRenomme(){")], 'D031S-III ①'),
    ('I3 une identite REELLE est ecrite dans un fichier de test de la passe', 'REELLE', 'D031S-III ④'),
    ('M22 la PREUVE AU LANCEMENT est desactivee (le navigateur est rendu sans etre prouve)',
     [('tests/_garde_reseau.js', "      try { await preuveLancement(nav); compte.preuves++; }", "      try { compte.preuves += 0; }")], 'D031S-I ⑯'),
    ('M23 la preuve accepte une page qui REPOND (le refus par defaut n\'est plus exige)',
     [('tests/_garde_reseau.js', "    if (!/ERR_BLOCKED_BY_CLIENT/.test(e1)) throw", "    if (false && !/ERR_BLOCKED_BY_CLIENT/.test(e1)) throw"),
      ('tests/_garde_reseau.js', "const poserRefus = (c) => c.route(RE_NON_LOCAL, refusParDefaut);", "const poserRefus = (c) => Promise.resolve();")], 'D031S-I ④'),
    # ── la GARDE OBLIGATOIRE (D031S-VII, decision de Michel du 19/10) : le cliquet et les chemins de lancement
    #    (le mot du lancement est ASSEMBLE : ces textes sont des DONNEES de mutation, pas un lancement — sans ca, le cliquet
    #     prendrait cet outil pour un banc non garde, et il aurait raison de rougir)
    ('G1 un NOUVEAU banc pilote Playwright SANS charger le garde',
     [('tools/banc_mutg.js', None, "'use strict';\nconst { chromium } = require('/opt/node22/lib/node_modules/playwright');\n(async () => { const b = await chromium." + LANCE + "(); await b.close(); })();\n")], 'D031S-VII ①'),
    ('G2 un NOUVEAU banc charge le garde APRES Playwright (trop tard : l\'ordre compte)',
     [('tools/banc_mutg.js', None, "'use strict';\nconst { chromium } = require('/opt/node22/lib/node_modules/playwright');\nrequire('../tests/_garde_reseau.js');\n(async () => { const b = await chromium." + LANCE + "(); await b.close(); })();\n")], 'D031S-VII ①'),
    ('G3 un ancien inscrit devient garde mais RESTE dans la liste (le cliquet ne retrecit plus)',
     'INSCRIT_GARDE', 'D031S-VII ②'),
    ('G4 un ancien inscrit est SUPPRIME mais reste dans la liste (ligne perimee)',
     'INSCRIT_SUPPRIME', 'D031S-VII ②'),
    ('G5 la recette annexe ne lance plus ses suites sous le garde',
     [('tools/recette_annexe.py', "env=_env_garde()", "env=None")], 'D031S-VII ③'),
    ('G6 tools/sous_garde.sh ne charge plus le garde',
     [('tools/sous_garde.sh', "export NODE_OPTIONS HTTP_PROXY", "export HTTP_PROXY")], 'D031S-VII ③'),
    ('G8 la recette annexe lance un essai Milo REEL (decision 3 : ils sont exclus des executions non protegees)',
     [('tests/recette/suites-annexes.json', '"commande": ["node", "tests/milo/runner.js"]', '"commande": ["node", "tests/milo/eval.js"]')], 'D031S-VII ④'),
    ('G9 le workflow du banc Milo recoit un declencheur AUTOMATIQUE (push)',
     [('.github/workflows/banc-milo.yml', "on:\n  workflow_dispatch:", "on:\n  push:\n  workflow_dispatch:")], 'D031S-VII ④'),
    ('G10 le workflow du banc Milo ne demande plus la confirmation LANCER',
     [('.github/workflows/banc-milo.yml', '!= "LANCER"', '!= "LANCER_PAS"')], 'D031S-VII ④'),
    ('G7 (temoin de controle) un NOUVEAU banc GARDE en premiere instruction : tout reste VERT',
     [('tools/banc_mutg.js', None, "'use strict';\nrequire('../tests/_garde_reseau.js');\nconst { chromium } = require('/opt/node22/lib/node_modules/playwright');\n(async () => { const b = await chromium." + LANCE + "(); await b.close(); })();\n")], 'OK'),
    ('H1 un temoin a condition `true` en dur revient dans la passe',
     [('tests/parcours/sec_admin.js', "'use strict';", "'use strict';\nfunction _mutH1(t){ t('mutation', true, ''); }")], 'D031S-IV ①'),
    ('H2 SEC-04 retire du runner (un module qui plante arreterait de nouveau toute la passe sans total)',
     [('tests/parcours/runner.js', "require('../_plantages.js').installer(__filename, t, ()=>ok+ko);", ";")], 'D031S-IV ②'),
    ('O1 la formule du 1RM derive (0,0278 -> 0,0270)',
     [('state.js', "fmt(kg/(1.0278-0.0278*Math.min(r,20)))", "fmt(kg/(1.0278-0.0270*Math.min(r,20)))")], 'D031S-V ①'),
    ('O2 la part des lipides derive (25 % -> 30 %)',
     [('state.js', "const _LIPIDES_PART_STANDARD=0.25;", "const _LIPIDES_PART_STANDARD=0.30;")], 'D031S-V ②'),
    # ── le RIR en superset, conduit par de vrais appuis (D031S-VI) : chaque defaut vise le comportement, pas le texte
    ('R1 la question de reserve est posee aussi sur l\'ECHAUFFEMENT',
     [('log.js', "return st&&st.type!=='É'&&st.type!=='W';", "return !!st;")], 'D031S-VI ②'),
    ('R2 le superset n\'attend plus ses series : seule la DERNIERE recoit sa question',
     [('log.js', "      : []).concat([{ei,si}]);", "      : []).slice(0,0).concat([{ei,si}]);")], 'D031S-VI ②'),
    ('R3 les questions d\'un superset ne nomment plus leur exercice',
     [('log.js', "  const avecNom=cibles.length>1;", "  const avecNom=false;")], 'D031S-VI ②'),
    ('R4 la reponse va a la PREMIERE serie attendue, pas a celle de la question',
     [('log.js', 'onclick="setRir(${c.ei},${c.si},${n})"',
       'onclick="setRir(${(Array.isArray(_rirCible)?_rirCible[0]:c).ei},${(Array.isArray(_rirCible)?_rirCible[0]:c).si},${n})"')], 'D031S-VI ④'),
    ('R5 les boutons de reserve sont rendus mais NON appuyables (rien ne repond au doigt)',
     [('log.js', "  z.innerHTML=cibles.map(c=>_rirQuestionHtml(c,avecNom)).join('');",
       "  z.innerHTML='<div style=\"pointer-events:none\">'+cibles.map(c=>_rirQuestionHtml(c,avecNom)).join('')+'</div>';")], 'D031S-VI ③'),
    ('M20 (temoin de controle) un COMMENTAIRE du garde modifie : le banc doit rester VERT',
     [(G, "   LE GARDE RÉSEAU DES TESTS — FERMÉ PAR DÉFAUT (D-031-SÉCURITÉ-01, 19/10/2026)",
           "   LE GARDE RÉSEAU DES TESTS — FERMÉ PAR DÉFAUT, TOUJOURS (D-031-SÉCURITÉ-01, 19/10/2026)")], 'OK'),
]


def env_banc():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) or k == 'NODE_OPTIONS'}
    e.pop('NODE_OPTIONS', None)
    e.update(TZ='Europe/Paris', D031S_FAUX_TOKEN='fictif')
    return e


def banc(arbre):
    r = subprocess.run([sys.executable, os.path.join(arbre, 'tools', 'isoler_reseau.py'), '--', 'node', 'tools/banc_garde_reseau.js'],
                       cwd=arbre, capture_output=True, text=True, timeout=900, env=env_banc())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVE — controle arrete :\n' + out[-600:])
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    # pas de bilan final = le banc n'est pas alle au bout (exception au chargement, lancement refuse...) : c'est un plantage
    if not re.search(r'(\d+) OK / (\d+) rouge', out) and not any('PLANTAGE' in x for x in rouges):
        err = next((l.strip() for l in out.split('\n') if 'garde réseau' in l or 'Error' in l), '')
        rouges.append('PLANTAGE (code %d, pas de bilan) %s' % (r.returncode, err[:120]))
    return rouges, out


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '--check', chemin], capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_d031s_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    rouges, out0 = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    m = re.search(r'(\d+) OK / (\d+) rouge', out0)
    print('  arbre sain, espace reseau isole : 0 rouge (%s OK) — point de depart valide\n' % (m.group(1) if m else '?'))
    conformes = total = 0
    for nom, remplacements, cible in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        chemin = os.path.join(arbre, G)
        if remplacements == 'VIDE':
            open(chemin, 'w', encoding='utf-8').write("'use strict';\nmodule.exports = {};\n")
        elif remplacements in ('INSCRIT_GARDE', 'INSCRIT_SUPPRIME'):
            # le premier ancien ENCORE inscrit « à migrer » qui charge Playwright par le chemin du conteneur
            liste = json.load(open(os.path.join(arbre, 'tests', 'garde_existants.json'), encoding='utf-8'))['fichiers']
            RE_PW_L = re.compile(r"^(const \{ chromium \} = require\('/opt/node22/lib/node_modules/playwright'\);)$", re.M)
            choix = next((x['fichier'] for x in liste if x['etat'] == 'à migrer' and x['fichier'].endswith('.js')
                          and RE_PW_L.search(open(os.path.join(arbre, x['fichier']), encoding='utf-8').read())), None)
            if not choix:
                print('  INVALIDE  %s (aucun ancien inscrit utilisable)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            p_ = os.path.join(arbre, choix)
            if remplacements == 'INSCRIT_SUPPRIME': os.remove(p_)
            else:
                rel = os.path.relpath(os.path.join(arbre, 'tests', '_garde_reseau.js'), os.path.dirname(p_)).replace(os.sep, '/')
                src_ = open(p_, encoding='utf-8').read()
                open(p_, 'w', encoding='utf-8').write(RE_PW_L.sub(lambda m: "require('" + rel + "');\n" + m.group(1), src_, count=1))
            nom = nom + ' [' + choix + ']'
        elif remplacements == 'REELLE':
            # une identite reelle LUE dans le code (jamais ecrite dans cet outil), posee dans un fichier de test de la copie
            r = subprocess.run(['node', '-e', "process.stdout.write(require('./tests/identites_fictives.js').adressesReelles()[0]||'')"],
                               cwd=arbre, capture_output=True, text=True)
            if not r.stdout:
                print('  INVALIDE  %s (aucune identite lue)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            fichier_mute = os.path.join(arbre, 'tests', 'parcours', 'garde_reseau.js')
            open(fichier_mute, 'a', encoding='utf-8').write("\nconst _mutI3 = '" + r.stdout + "';\n")
        else:
            fichiers = {}
            invalide = []
            for f, av, ap in remplacements:
                p = os.path.join(arbre, f)
                if av is None:                       # D031S-VII : un NOUVEAU fichier apparait (contenu = ap)
                    fichiers[p] = ap; continue
                if ap is None:                       # D031S-VII : un fichier disparait
                    if os.path.exists(p): os.remove(p)
                    else: invalide.append('%s absent' % f)
                    continue
                src = fichiers.get(p) or open(p, encoding='utf-8').read()
                if src.count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], src.count(av)))
                else:
                    fichiers[p] = src.replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for p, src in fichiers.items():
                open(p, 'w', encoding='utf-8').write(src)
            # ⛔ une mutation qui casse la SYNTAXE fait planter le banc : ce rouge-la ne prouverait rien (M10, 09/10)
            casses = [p for p in fichiers if p.endswith('.js') and not syntaxe_ok(p)]
            if casses:
                print('  INVALIDE  %s (syntaxe cassee par la mutation)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges, _ = banc(arbre)
        if cible == 'OK':
            ok = not rouges
        elif cible == 'PLANTAGE':
            ok = any('PLANTAGE' in r for r in rouges)
        elif cible.startswith('PREUVE:'):   # le defaut est arrete DES LE LANCEMENT par la preuve du garde (D031S-2)
            ok = any('PLANTAGE' in r and 'PREUVE AU LANCEMENT' in r and cible[7:] in r for r in rouges)
        else:
            ok = any(cible in r for r in rouges if 'ROUGE' in r)
        conformes += ok
        print('  %s  %-112s cible %-11s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom[:112], cible, len(rouges),
              next((r for r in rouges if cible in r), rouges[0] if rouges else '')[:150]))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
