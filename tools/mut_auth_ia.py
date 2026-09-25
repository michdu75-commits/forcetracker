#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — MILO-AUTH1 : les témoins (B-CCCLXXV/LXXVI/LXXVII) peuvent-ils RÉELLEMENT rougir ?

⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation réintroduit un défaut : panne dite « reconnecte », refus dit « temporaire »,
   panne qui ouvre l'IA, client qui transforme un 5xx en reconnexion, client qui efface le jeton.
⛔ Une mutation de COMMENTAIRE doit rester verte. M00 : le clone non muté doit être vert.

Usage : python3 tools/mut_auth_ia.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutauth'
WK, LG, CO = 'worker.js', 'log.js', 'coach.js'
BR503 = ("        if (!_identiteEstRefusReel(_moi.raison)) {\n"
         "          return json({ status: 'error', error: 'identite_indisponible', raison: _moi.raison,\n")

MUT = [
    ('M-AUTH-1', WK, BR503,
     "        if (false) {\n          return json({ status: 'error', error: 'identite_indisponible', raison: _moi.raison,\n",
     'rouge', 'LE CODE D AVANT : une panne réseau redevient 401 « Reconnecte »'),
    ('M-AUTH-2', WK, "const _REFUS_IDENTITE_REELS = ['revoque', 'forme', 'absent', 'inconnu'];",
     "const _REFUS_IDENTITE_REELS = ['forme', 'absent', 'inconnu'];", 'rouge',
     'un vrai refus (révoqué) devient 503 temporaire — et les listes client/Worker divergent'),
    ('M-AUTH-3', WK, "      if (!_moi.ok) {\n        /* 🩹 MILO-AUTH1",
     "      if (!_moi.ok && _moi.raison !== 'reseau') {\n        /* 🩹 MILO-AUTH1", 'rouge',
     'une panne réseau du pont LAISSE PASSER l appel IA'),
    ('M-AUTH-4', LG, "    const _txt=(e&&e.duServeur)?String(e.message).replace(/</g,'&lt;'):'Erreur de connexion. Vérifie ta connexion et réessaie.';",
     "    const _txt=(e&&e.duServeur&&!/indisponible/.test(e.message))?String(e.message).replace(/</g,'&lt;'):'Reconnecte ton appareil pour utiliser Milo.';", 'rouge',
     'le client transforme une indisponibilité (5xx) en « Reconnecte »'),
    ('M-AUTH-5', LG, "    if(!resp.ok){\n      let _m='';",
     "    if(!resp.ok){\n      if(resp.status>=500)_setFtToken('');\n      let _m='';", 'rouge',
     'le client EFFACE le jeton d appareil sur une erreur temporaire'),
    ('M-AUTH-6', LG, "      try{ const _d=await resp.clone().json(); _m=(typeof _phraseServeur==='function')?_phraseServeur((_d&&(_d.reply||_d.error))||''):''; }catch(_){}",
     "", 'rouge', 'LE CODE D AVANT côté analyse : la phrase du serveur n est plus lue'),
    ('M-AUTH-7', CO, "        const _e = new Error(_msgServeur || ('HTTP ' + resp.status));",
     "        const _e = new Error(resp.status >= 500 ? 'Reconnecte ton appareil pour utiliser Milo 👍' : (_msgServeur || ('HTTP ' + resp.status)));", 'rouge',
     'DÉGUISÉE : le chat transforme tout 5xx en reconnexion'),
    ('M-AUTH-C', WK, "function _identiteEstRefusReel(r) {",
     "/* reseau erreur illisible refus → 401 Reconnecte ; if (!_moi.ok) */\nfunction _identiteEstRefusReel(r) {", 'vert',
     'un commentaire qui cite les raisons ne change rien'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_auth_ia.js'],
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    rc, out = lancer()
    if rc != 0:
        der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
        print('M00 le clone NON muté n est pas vert (%d) — contrôle refusé >> %s' % (rc, der[0][:120]))
        return 1
    print('M00 vert     attendu=vert  OK   — le clone non muté est vert (point de départ sain)')
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s' % (mid, src.count(avant), fic, quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        if obt == att:
            ok += 1
            print('%s %-8s attendu=%-5s OK   — %s' % (mid, obt, att, quoi))
        else:
            nc += 1
            der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s' % (mid, obt, att, quoi, der[0][:90]))
    rc, out = lancer()
    print('M99 %s après restauration de toutes les mutations' % ('vert' if rc == 0 else 'NON VERT'))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc or rc) else 0


if __name__ == '__main__':
    sys.exit(main())
