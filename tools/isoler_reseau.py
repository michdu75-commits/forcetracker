#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ISOLER DU RESEAU — lancer une commande dans un espace reseau ou SEULE l'interface locale existe (D-031-SECURITE-01).

Pourquoi : le garde reseau des tests (tests/_garde_reseau.js) se prouve d'abord la ou une erreur ne pourrait rien
atteindre (consigne de Michel du 19/10/2026 : « les controles de protection doivent etre effectues initialement dans
un environnement reellement isole du reseau externe, avec des destinations fictives »). Ce lanceur est la troisieme
couche, celle du SYSTEME : elle ne depend ni de Playwright ni de Node.

Usage :
  python3 tools/isoler_reseau.py -- <commande> [arguments...]
    -> se relance sous `unshare -n` (root) ou `unshare -rn` (utilisateur), met « lo » en marche, VERIFIE
       l'isolement, puis remplace son processus par la commande (son code de sortie est celui de la commande).
Il REFUSE de lancer la commande (code 97) si l'isolement n'est pas prouve :
  - une autre interface que « lo » existe ;
  - une connexion vers 192.0.2.1 (adresse de documentation, RFC 5737) ne repond pas « reseau inaccessible ».
Aucune requete ne part vers un vrai service : la seule tentative vise une adresse reservee a la documentation.
"""
import errno, fcntl, os, shutil, socket, struct, sys

DRAPEAU = 'FT_ISOLEMENT_RESEAU'


def lo_en_marche():
    SIOCGIFFLAGS, SIOCSIFFLAGS, IFF_UP = 0x8913, 0x8914, 0x1
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    ifr = struct.pack('16sH', b'lo', 0)
    drap = struct.unpack('16sH', fcntl.ioctl(s, SIOCGIFFLAGS, ifr))[1]
    fcntl.ioctl(s, SIOCSIFFLAGS, struct.pack('16sH', b'lo', drap | IFF_UP))
    return bool(struct.unpack('16sH', fcntl.ioctl(s, SIOCGIFFLAGS, ifr))[1] & IFF_UP)


def preuve():
    """Rend (ok, explication). ok seulement si l'isolement est MESURE, pas suppose."""
    interfaces = sorted(n for _, n in socket.if_nameindex())
    if interfaces != ['lo']:
        return False, 'interfaces presentes : %s (attendu : lo seule)' % interfaces
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    try:
        s.connect(('192.0.2.1', 9))
        return False, 'une connexion vers 192.0.2.1 a ABOUTI'
    except OSError as e:
        if e.errno != errno.ENETUNREACH:
            return False, 'connexion vers 192.0.2.1 : %s (attendu : reseau inaccessible)' % (e.strerror or e)
    finally:
        s.close()
    l = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        l.bind(('127.0.0.1', 0)); l.listen(1)
        c = socket.create_connection(l.getsockname(), timeout=3); c.close()
    except OSError as e:
        return False, 'le local ne marche pas : %s' % e
    finally:
        l.close()
    return True, 'isolement prouve : interface lo seule, 192.0.2.1 inaccessible, local en marche'


def main():
    if '--' not in sys.argv:
        print(__doc__); return 2
    cmd = sys.argv[sys.argv.index('--') + 1:]
    if not cmd:
        print('commande manquante'); return 2
    if os.environ.get(DRAPEAU) != '1':
        unshare = shutil.which('unshare')
        if not unshare:
            sys.stderr.write('isoler_reseau : `unshare` introuvable — isolement impossible, commande NON lancee\n'); return 97
        os.environ[DRAPEAU] = '1'
        opts = ['-n'] if os.geteuid() == 0 else ['-r', '-n']
        os.execv(unshare, [unshare] + opts + [sys.executable, os.path.abspath(__file__), '--'] + cmd)
    try:
        lo_en_marche()
    except OSError as e:
        sys.stderr.write('isoler_reseau : impossible de mettre lo en marche (%s) — commande NON lancee\n' % e); return 97
    ok, pourquoi = preuve()
    sys.stderr.write('isoler_reseau : %s\n' % pourquoi)
    if not ok:
        sys.stderr.write('isoler_reseau : commande NON lancee\n'); return 97
    os.execvp(cmd[0], cmd)


if __name__ == '__main__':
    raise SystemExit(main())
