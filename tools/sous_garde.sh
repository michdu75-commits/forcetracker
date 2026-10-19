#!/bin/sh
# SOUS GARDE — lancer N'IMPORTE QUELLE commande de test sous le garde réseau des tests (D-031-SÉCURITÉ-01, 19/10/2026).
# Pourquoi : la passe charge le garde elle-même ; un banc, une mutation ou l'annexe lancés seuls, non. Ici, tout
# processus Node lancé par la commande (directement ou par Python) charge le garde par NODE_OPTIONS, et tout ce qui
# lit les variables de proxy (navigateur, git, curl, Python) part vers un proxy MORT. Les secrets ne sont pas lus :
# le garde les retire de l'environnement de chaque processus Node au chargement.
# Usage : tools/sous_garde.sh python3 tools/mut_x.py        ·  tools/sous_garde.sh node tools/banc_x.js
# Avec l'isolement système en plus : python3 tools/isoler_reseau.py --en-ligne -- tools/sous_garde.sh <commande>
R=$(cd "$(dirname "$0")/.." && pwd)
case "$NODE_OPTIONS" in *_garde_reseau.js*) ;; *) NODE_OPTIONS="--require \"$R/tests/_garde_reseau.js\"${NODE_OPTIONS:+ $NODE_OPTIONS}" ;; esac
MORT=http://127.0.0.1:9
export NODE_OPTIONS HTTP_PROXY=$MORT HTTPS_PROXY=$MORT ALL_PROXY=$MORT http_proxy=$MORT https_proxy=$MORT all_proxy=$MORT \
       NO_PROXY=localhost,127.0.0.1,::1 no_proxy=localhost,127.0.0.1,::1
[ $# -gt 0 ] || { echo "usage : tools/sous_garde.sh <commande> [arguments…]" >&2; exit 2; }
exec "$@"
