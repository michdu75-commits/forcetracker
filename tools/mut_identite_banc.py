#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF de l'IDENTITE S1 DU BANC (20/09/2026).

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

CE QU'IL DOIT PROUVER
    Cette passe ajoute une IDENTITE, pas une exception. Les gardes les plus importants sont
    donc des ABSENCES : aucun mode « benchmark », aucun bypass, aucun secret qui fuite. Or
    une absence est exactement ce qui reste vert tout seul.

    ⭐ Les mutations sont donc de trois familles :
      1. celles qui OUVRENT une porte (un `if benchmark then allow`, un jeton en dur, une
         verification d'identite retiree du Worker) ;
      2. celles qui FONT FUIR le secret (l'afficher dans le journal, l'ecrire dans le
         rapport, le passer au controle gratuit qui n'en a pas besoin) ;
      3. celles qui retirent un garde-fou (secret non verifie, verification tardive,
         refus avant depense supprime).

    ⛔ Et DEUX mutations doivent rester VERTES : elles ne touchent que des COMMENTAIRES, en
      y citant les mots que les controles cherchent. C'est la seule facon de prouver qu'on
      mesure le MECANISME et non la phrase qui l'explique (R30).

Usage : python3 tools/mut_identite_banc.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WF, EV, WK, APP = '.github/workflows/banc-milo.yml', 'tests/milo/eval.js', 'worker.js', 'app.js'


def sans_comm_yaml(s):
    return '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('#'))


def sans_comm_js(s):
    s = re.sub(r'/\*[\s\S]*?\*/', ' ', s)
    return '\n'.join((lambda m: l[:m.start()] if m else l)(re.search(r'(?<!:)//', l))
                     for l in s.split('\n'))


def gardes(arbre):
    """Les invariants du brief, mesures sur le CODE (jamais sur un commentaire)."""
    L = lambda f: open(os.path.join(arbre, f), encoding='utf-8').read()
    wf, ev, wk, app = sans_comm_yaml(L(WF)), sans_comm_js(L(EV)), sans_comm_js(L(WK)), sans_comm_js(L(APP))
    v = [
        # §6 — le Worker continue de verifier une vraie identite
        ('worker verifie identite', '_identiteIA(body.token' in wk),
        ('worker refuse sans identite', 'if (!_moi.ok)' in wk),
        # ⛔⛔ ON MESURE LE MECANISME, PAS LE MOT — et ce garde a rougi sur l'arbre SAIN
        #    avant d'etre corrige. Il interdisait le mot « benchmark » dans worker.js : or
        #    `MODELES_BENCHMARK` y existe legitimement depuis longtemps, et ne parle pas
        #    d'identite du tout — c'est une liste blanche de MODELES que le banc peut
        #    demander (--compare haiku).
        #    👉 *L'invariant n'est pas « le mot n'apparait pas », c'est « l'identite ne
        #    peut venir que de _identiteIA ».* Mesure : il n'existe qu'UNE affectation de
        #    `_moi` dans tout le fichier, et elle appelle `_identiteIA`.
        ('l identite ne peut venir que de _identiteIA',
         re.findall(r'^\s*_moi\s*=\s*(.*)$', wk, flags=re.M)
         == ['await _identiteIA(body.token, env);']),
        # §3 — le secret n'est jamais expose
        ('le secret n est jamais affiche', not re.search(r'echo .*\$FT_BANC_TOKEN', wf)),
        # ⛔ L'INVARIANT EST D'OU VIENT LA VALEUR, PAS SA FORME. Premiere version : un motif
        #    cherchait 64 caracteres hexadecimaux litteraux — `'a'.repeat(64)` passait donc
        #    tranquillement (mutation M03, restee verte). *Un garde qui decrit a quoi
        #    ressemble un secret ne dit rien de sa provenance.* On exige la SOURCE.
        ('le jeton vient de l environnement, jamais du code',
         re.findall(r'^\s*const BANC_TOKEN\s*=\s*(.*)$', ev, flags=re.M)
         == ["String(process.env.FT_BANC_TOKEN || '').trim();"]),
        # §3/§8 — le secret est verifie AVANT toute depense
        ('secret verifie dans le workflow', 'secrets.FT_BANC_TOKEN' in wf),
        ('workflow echoue si secret absent', '-z "$FT_BANC_TOKEN"' in wf),
        ('nom du secret dit a l utilisateur', 'FT_BANC_TOKEN' in wf),
        # §9 — eval.js refuse avant de depenser
        ('eval refuse --go sans jeton', 'GO && !LOCAL && !BANC_TOKEN' in ev),
        ('eval controle la forme du jeton', 'BANC_TOKEN.length !== 64' in ev),
        # §5 — le banc emprunte le chemin du vrai client
        ('cle de stockage lue a la source (R2)', 'FT_TOKEN_KEY' in ev and "constants.js" in ev),
        ('pas de cle recopiee en dur', "'ft4_devtoken'" not in ev),
        # §2 — l identite est etiquetee et revocable
        ("etiquette banc-milo", "appareil:'banc-milo'" in app),
        ('revocation possible', "action:'revokeToken'" in app),
        ("reutilise la route existante", "action:'issueTokenByCode'" in app),
        # garde-fous anterieurs conserves (§8, §11)
        ('LANCER', bool(re.search(r'!=\s*"LANCER"\s*\]', wf))),
        ('aucun push', not re.search(r'^\s*push:', wf, flags=re.M)),
        ('au moins une reponse exigee', "etat === 'vert' || x.etat === 'rouge'" in wf),
        ('controle gratuit present', '--n 3' in wf),
    ]
    return [n for n, ok in v if not ok]


MUT = [
    # ══ 1. ON OUVRE UNE PORTE ══════════════════════════════════════════════════════════
    ('M01  un mode « benchmark » apparait dans le Worker', WK,
     '      _moi = await _identiteIA(body.token, env);',
     "      if (body.benchmark === true) { _moi = { ok: true, email: 'banc@x' }; }\n"
     '      else _moi = await _identiteIA(body.token, env);', 'GARDE'),

    ('M02  le Worker cesse de refuser une identite invalide', WK,
     '      if (!_moi.ok) {', '      if (false) {', 'GARDE'),

    ('M03  un jeton est ecrit EN DUR dans le banc', EV,
     "const BANC_TOKEN = String(process.env.FT_BANC_TOKEN || '').trim();",
     "const BANC_TOKEN = 'a'.repeat(64);", 'GARDE'),

    # ══ 2. LE SECRET FUIT ══════════════════════════════════════════════════════════════
    ('M04  le workflow affiche le secret dans son journal', WF,
     '          echo "::notice::identite du banc : presente"',
     '          echo "jeton = $FT_BANC_TOKEN"', 'GARDE'),

    ('M05  la cle de stockage est recopiee en dur (R2 casse)', EV,
     "  const m = /FT_TOKEN_KEY\\s*=\\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8'));",
     "  const m = ['x', 'ft4_devtoken'];", 'GARDE'),

    # ══ 3. UN GARDE-FOU DISPARAIT ══════════════════════════════════════════════════════
    ('M06  le workflow ne verifie plus que le secret existe', WF,
     '          if [ -z "$FT_BANC_TOKEN" ]; then', '          if false; then', 'GARDE'),

    ('M07  eval.js ne refuse plus --go sans jeton (57 appels pour 57 refus)', EV,
     'if (GO && !LOCAL && !BANC_TOKEN) {', 'if (false) {', 'GARDE'),

    ('M08  le controle de forme du jeton disparait', EV,
     'if (BANC_TOKEN && BANC_TOKEN.length !== 64) {', 'if (false) {', 'GARDE'),

    ('M09  la confirmation LANCER disparait', WF,
     '!= "LANCER" ]; then', '!= "OKOK" ]; then', 'GARDE'),

    ('M10  le garde « au moins une reponse » disparait', WF,
     "const repondu = p.filter(x => x.etat === 'vert' || x.etat === 'rouge').length;",
     'const repondu = 1;', 'GARDE'),

    ('M11  l etiquette du banc disparait (plus revocable a part)', APP,
     "                           appareil:'banc-milo'})});",
     "                           appareil:''})});", 'GARDE'),

    ('M12  la revocation disparait de l outil Admin', APP,
     "      body:JSON.stringify({action:'revokeToken',token:tok})});",
     "      body:JSON.stringify({action:'autre',token:tok})});", 'GARDE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    ('[negatif] un COMMENTAIRE du workflow cite « benchmark » et le nom du secret', WF,
     'on:\n  workflow_dispatch:',
     '# rappel : aucun mode benchmark, aucun bypass ; le secret FT_BANC_TOKEN\n'
     "# n'est jamais affiche, meme tronque\n"
     'on:\n  workflow_dispatch:', 'OK'),

    ('[negatif] un COMMENTAIRE du Worker cite « benchmark » et « banc »', WK,
     'async function _identiteIA(token, env) {',
     '// ce Worker ne connait AUCUN mode benchmark et aucune exception pour le banc :\n'
     '// le banc presente un jeton S1 ordinaire, verifie ici comme les autres\n'
     'async function _identiteIA(token, env) {', 'OK'),
]


def main():
    conformes = 0
    # ⛔ On mesure d'abord l'arbre SAIN : un controle negatif dont le point de depart est
    #    deja rouge ne prouve rien (lecon du 20/09 : 17 mutations « conformes » pour rien).
    sain = gardes(SRC)
    if sain:
        print('  !! ARBRE SAIN DEJA ROUGE : %s' % ', '.join(sain))
        print('     -> le controle ne mesurerait rien. On s arrete.')
        return 1
    print('  arbre sain : 0 garde rouge (point de depart valide)\n')

    for nom, fich, avant, apres, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='ident_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-68s (ancre %s)'
                  % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))

        manquants = gardes(arbre)
        obtenu = 'GARDE' if manquants else 'OK'
        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-68s %-6s %s' % ('OK ' if ok else '!! ', nom, obtenu,
                                       ', '.join(manquants)[:52]))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
