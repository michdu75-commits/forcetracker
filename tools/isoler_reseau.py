#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ISOLER DU RESEAU — lancer une commande dans un espace reseau ou SEULE l'interface locale existe (D-031-SECURITE-01).

Pourquoi : le garde reseau des tests (tests/_garde_reseau.js) se prouve d'abord la ou une erreur ne pourrait rien
atteindre (consigne de Michel du 19/10/2026 : « les controles de protection doivent etre effectues initialement dans
un environnement reellement isole du reseau externe, avec des destinations fictives »). Ce lanceur est la troisieme
couche, celle du SYSTEME : elle ne depend ni de Playwright ni de Node.

Usage :
  python3 tools/isoler_reseau.py [--en-ligne] -- <commande> [arguments...]
  --en-ligne : ajoute une interface « ftnet0 » (198.18.0.2/15, plage de banc d'essai RFC 2544) SANS AUCUNE ROUTE vers
    l'exterieur. Pourquoi : sans autre interface que « lo », Chromium se croit HORS LIGNE (navigator.onLine = false,
    mesure le 19/10) et les tests qui supposent l'app en ligne rougissent pour une raison qui n'est pas la leur. Avec
    elle, Chromium se croit en ligne, mais rien ne peut sortir : aucune route par defaut, 192.0.2.1 reste inaccessible.
    -> se relance sous `unshare -n` (root) ou `unshare -rn` (utilisateur), met « lo » en marche, VERIFIE
       l'isolement, puis remplace son processus par la commande (son code de sortie est celui de la commande).
Il REFUSE de lancer la commande (code 97) si l'isolement n'est pas prouve :
  - une autre interface que « lo » (et « ftnet0 » avec --en-ligne) existe, ou une route par defaut ;
  - une connexion vers 192.0.2.1 (adresse de documentation, RFC 5737) ne repond pas « reseau inaccessible » ;
  - le local (127.0.0.1) ne marche pas.
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


TUNSETIFF, IFF_TUN, IFF_NO_PI = 0x400454ca, 0x0001, 0x1000
SIOCSIFADDR, SIOCSIFNETMASK = 0x8916, 0x891c


def interface_en_ligne():
    """Cree « ftnet0 » (une interface tun sans lecteur) : Chromium se croit en ligne, aucun paquet ne sort.
    Le descripteur reste ouvert et HERITE par la commande : l'interface vit aussi longtemps qu'elle."""
    fd = os.open('/dev/net/tun', os.O_RDWR)
    fcntl.ioctl(fd, TUNSETIFF, struct.pack('16sH', b'ftnet0', IFF_TUN | IFF_NO_PI))
    os.set_inheritable(fd, True)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    adr = lambda ip: struct.pack('16sH2s4s8s', b'ftnet0', socket.AF_INET, b'\x00' * 2, socket.inet_aton(ip), b'\x00' * 8)
    fcntl.ioctl(s, SIOCSIFADDR, adr('198.18.0.2'))
    fcntl.ioctl(s, SIOCSIFNETMASK, adr('255.254.0.0'))
    SIOCGIFFLAGS, SIOCSIFFLAGS, IFF_UP = 0x8913, 0x8914, 0x1
    ifr = struct.pack('16sH', b'ftnet0', 0)
    drap = struct.unpack('16sH', fcntl.ioctl(s, SIOCGIFFLAGS, ifr))[1]
    fcntl.ioctl(s, SIOCSIFFLAGS, struct.pack('16sH', b'ftnet0', drap | IFF_UP))


def preuve(en_ligne=False):
    """Rend (ok, explication). ok seulement si l'isolement est MESURE, pas suppose."""
    interfaces = sorted(n for _, n in socket.if_nameindex())
    attendu = ['ftnet0', 'lo'] if en_ligne else ['lo']
    if interfaces != attendu:
        return False, 'interfaces presentes : %s (attendu : %s)' % (interfaces, attendu)
    with open('/proc/net/route') as f:
        routes = [l.split() for l in f.read().strip().split('\n')[1:] if l.strip()]
    if any(r[1] == '00000000' for r in routes):
        return False, 'une route par defaut existe'
    if en_ligne and any(r[0] != 'ftnet0' for r in routes):
        return False, 'route inattendue : %s' % routes
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
    if en_ligne:
        return True, 'isolement prouve : lo + ftnet0 sans route par defaut (Chromium en ligne), 192.0.2.1 inaccessible, local en marche'
    return True, 'isolement prouve : interface lo seule, 192.0.2.1 inaccessible, local en marche'


def main():
    if '--' not in sys.argv:
        print(__doc__); return 2
    cmd = sys.argv[sys.argv.index('--') + 1:]
    en_ligne = '--en-ligne' in sys.argv[1:sys.argv.index('--')]
    if not cmd:
        print('commande manquante'); return 2
    if os.environ.get(DRAPEAU) != '1':
        unshare = shutil.which('unshare')
        if not unshare:
            sys.stderr.write('isoler_reseau : `unshare` introuvable — isolement impossible, commande NON lancee\n'); return 97
        os.environ[DRAPEAU] = '1'
        opts = ['-n'] if os.geteuid() == 0 else ['-r', '-n']
        os.execv(unshare, [unshare] + opts + [sys.executable, os.path.abspath(__file__)] + (['--en-ligne'] if en_ligne else []) + ['--'] + cmd)
    try:
        lo_en_marche()
        if en_ligne:
            interface_en_ligne()
    except OSError as e:
        sys.stderr.write('isoler_reseau : impossible de preparer les interfaces (%s) — commande NON lancee\n' % e); return 97
    ok, pourquoi = preuve(en_ligne)
    sys.stderr.write('isoler_reseau : %s\n' % pourquoi)
    if not ok:
        sys.stderr.write('isoler_reseau : commande NON lancee\n'); return 97
    os.execvp(cmd[0], cmd)


if __name__ == '__main__':
    raise SystemExit(main())
