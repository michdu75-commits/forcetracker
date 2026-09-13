#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  LA PASSE COMPLÈTE, AVEC SES 4 CONDITIONS DE VALIDITÉ
#  Protocole validé par Michel le 13/09/2026 (docs/PROTOCOLE-DEUX-SESSIONS.md).
#
#  ⛔⛔ POURQUOI CE SCRIPT EXISTE — chaque condition vient d'un ÉCHEC VÉCU le 13/09 :
#   ① la LIGNE DE TOTAL : une passe s'est arrêtée à mi-parcours en affichant 0 rouge.
#      *Une passe interrompue ressemble trait pour trait à une passe verte.*
#   ② le CODE DE SORTIE DU RUNNER LUI-MÊME : ma commande finissait par un `tail`,
#      donc `$?` mesurait le tail. Elle a répondu « exit 0 » sur un runner en erreur.
#   ③ l'ARBRE INCHANGÉ : une passe décrit l'arbre qu'elle a lu, pas celui qu'on pousse.
#   ④ AUCUNE PUBLICATION CONCURRENTE : c'est la seule qui manquait, et c'est elle
#      qui a rendu une passe périmée après 25 minutes.
#
#  ⛔ Il ne pousse rien, il ne modifie rien. Il dit VALIDE ou il dit pourquoi pas.
# ══════════════════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.." || exit 2
JOURNAL="${1:-/tmp/passe.log}"

ARBRE=$(git rev-parse HEAD)
echo "── arbre au départ : $ARBRE"

# ⛔ MODE D'ÉPREUVE (FT_PASSE_REJOUER) : réutilise un journal existant au lieu de relancer
#    25 minutes. Il existe pour UNE raison — le protocole exige qu'un garde soit éprouvé sur
#    du sain PUIS cassé par mutation, et un garde qu'on ne peut pas casser en moins de 25 min
#    ne sera jamais éprouvé. *Un garde qu'on n'éprouve pas est une affirmation, pas une garantie.*
#    ⛔ Il ne sert JAMAIS à valider une vraie livraison : sans lui, la passe tourne pour de bon.
if [ -n "${FT_PASSE_REJOUER:-}" ]; then
  echo "── ⚠️ MODE D'ÉPREUVE : journal rejoué, AUCUNE passe lancée"
  CODE="${FT_PASSE_CODE:-0}"
else
  echo "── la passe tourne (~25 min)…"
  # ⛔ LE RUNNER SEUL : rien après lui sur la ligne, sinon $? cesse d'être le sien.
  node tests/parcours/runner.js > "$JOURNAL" 2>&1
  CODE=$?
fi

ok=1
echo
echo "══════ LES 4 CONDITIONS ══════"

# ① la ligne de total
if grep -q "TOTAL CROISÉ" "$JOURNAL"; then
  echo "  ✅ ① ligne de total : $(grep 'TOTAL CROISÉ' "$JOURNAL")"
else
  echo "  ❌ ① AUCUNE LIGNE DE TOTAL — la passe n'a pas fini. NE RIEN CONCLURE."
  tail -3 "$JOURNAL" | sed 's/^/       /'
  ok=0
fi

# ② le code de sortie du runner lui-même
if [ "$CODE" = "0" ]; then echo "  ✅ ② le runner a terminé correctement (code $CODE)"
else echo "  ❌ ② le runner a échoué (code $CODE)"; ok=0; fi

# ③ l'arbre n'a pas changé pendant la passe
MAINTENANT=$(git rev-parse HEAD)
if [ "$MAINTENANT" = "$ARBRE" ]; then echo "  ✅ ③ l'arbre testé est celui d'aujourd'hui ($ARBRE)"
else echo "  ❌ ③ L'ARBRE A CHANGÉ pendant la passe : $ARBRE → $MAINTENANT"; ok=0; fi

# ④ aucune publication concurrente
git fetch -q --all 2>/dev/null
RETARD=$(git rev-list --count HEAD..origin/master 2>/dev/null || echo "?")
if [ "$RETARD" = "0" ]; then echo "  ✅ ④ aucune publication concurrente sur origin/master"
else
  echo "  ❌ ④ PUBLICATION CONCURRENTE — $RETARD commit(s) sur origin/master : PASSE PÉRIMÉE."
  echo "       → refusionner · vérifier les témoins de périmètre · renuméroter si besoin · RELANCER"
  ok=0
fi

# ⛔ les vrais rouges s'ancrent en début de ligne : un ❌ dans un LIBELLÉ de témoin
#    n'est pas un échec. Vécu le 13/09 : `grep -c "❌"` annonçait 3 rouges pour 0.
ROUGES=$(grep -cE '^[[:space:]]+❌' "$JOURNAL")
echo "  ·  rouges réels (ancrés en début de ligne) : $ROUGES"
[ "$ROUGES" = "0" ] || ok=0

echo
if [ "$ok" = "1" ]; then echo "⭐ PASSE VALIDE — le push peut être préparé (poser le numéro de version MAINTENANT)."; exit 0
else echo "⛔ PASSE NON VALIDE — aucun feu vert."; exit 1; fi
