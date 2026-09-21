#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  ATTENDRE LA FIN D'UN TRAVAIL DE FOND — SANS JAMAIS S'ATTENDRE SOI-MÊME
#
#  ⛔⛔ POURQUOI CE SCRIPT EXISTE — le défaut est vécu DEUX FOIS, et la deuxième
#     a laissé SIX processus fantômes vivre jusqu'à 12 HEURES (21/09/2026).
#
#     La sonde naïve est celle-ci :
#         until ! pgrep -f 'tests/parcours/runner.js'; do sleep 20; done
#
#     👉 `pgrep -f` cherche dans la LIGNE DE COMMANDE COMPLÈTE — et la ligne de
#     commande de la sonde CONTIENT le motif qu'elle surveille. Elle se trouve
#     donc elle-même, conclut que le travail tourne encore, et NE SORT JAMAIS.
#
#     ⚠️ ET CHANGER LE MOTIF NE CORRIGE RIEN : je l'ai cru, je l'ai annoncé, et
#     la sonde « corrigée » est restée bloquée 2 h 12 avec le nouveau motif.
#     *Tant que le motif vit dans son propre argv, il s'auto-trouve.*
#
#     ⭐ PIRE ENCORE, LES SONDES SE MAINTIENNENT MUTUELLEMENT EN VIE : une sonde
#     bloquée porte le motif dans son argv, donc la SUIVANTE la voit et se croit
#     en pleine passe. Six sondes, zéro travail réel, charge 0,00.
#
#  ⭐⭐ LA CORRECTION N'EST PAS UN MEILLEUR MOTIF, C'EST L'ABSENCE DE MOTIF.
#     On attend un PID (`kill -0`) ou l'apparition d'un MARQUEUR dans un fichier.
#     Aucun des deux ne regarde la liste des processus : *l'auto-correspondance
#     devient impossible par construction, pas par précaution.*
#
#  Usage :
#     tools/attendre_fin.sh pid   <PID>            [pas_en_s] [max_en_s]
#     tools/attendre_fin.sh texte <fichier> <mot>  [pas_en_s] [max_en_s]
#
#  Sortie : 0 = le travail est fini (ou le marqueur est apparu)
#           2 = délai maximum dépassé — ⛔ on REND LA MAIN, on ne boucle pas
#               indéfiniment : *une sonde qui ne peut pas abandonner est
#               exactement ce qui a produit les six fantômes.*
# ══════════════════════════════════════════════════════════════════════════════
set -u
MODE="${1:-}"

case "$MODE" in
  pid)
    CIBLE="${2:?usage: attendre_fin.sh pid <PID> [pas] [max]}"
    PAS="${3:-15}"; MAX="${4:-5400}"
    # ⛔ `kill -0` NE TUE RIEN : il demande seulement « ce PID existe-t-il encore ? ».
    #    Il ne lit aucune ligne de commande, donc il ne peut pas se voir lui-même.
    #
    # ⛔⛔ ET LE PIÈGE DE CE MODE EST PIRE QUE CELUI QU'IL REMPLACE, DONC IL SE DIT.
    #    Si l'appelant passe le PID d'un ENVELOPPEUR (`setsid nohup … &` rend le PID du
    #    wrapper, pas celui du travail), ce wrapper meurt aussitôt : la sonde annonce
    #    « terminé » en 0 s pendant que le travail tourne encore.
    #    👉 ***Un faux VERT est pire qu'un blocage : le blocage se voit, le faux vert
    #    se croit.*** Mesuré en écrivant ce script — ma propre épreuve est passée verte
    #    pour cette raison exacte.
    #    On ne peut pas deviner l'intention, mais on peut REFUSER DE SE TAIRE : si le PID
    #    n'existe déjà plus au tout premier regard, on le DIT.
    if ! kill -0 "$CIBLE" 2>/dev/null; then
      echo "⚠️  le PID $CIBLE n'existait DÉJÀ PLUS au premier regard." >&2
      echo "    → soit le travail était fini, soit on a passé le PID d'un enveloppeur" >&2
      echo "      (\`setsid nohup … &\` rend le PID du wrapper). Vérifier avant de conclure." >&2
      exit 0
    fi
    T=0
    while kill -0 "$CIBLE" 2>/dev/null; do
      sleep "$PAS"; T=$((T + PAS))
      if [ "$T" -ge "$MAX" ]; then
        echo "⛔ ABANDON : le PID $CIBLE tourne encore après ${MAX}s — la main est rendue." >&2
        exit 2
      fi
    done
    echo "✅ le PID $CIBLE est terminé (après ${T}s)"
    ;;

  texte)
    FIC="${2:?usage: attendre_fin.sh texte <fichier> <mot> [pas] [max]}"
    MOT="${3:?il manque le mot à attendre}"
    PAS="${4:-15}"; MAX="${5:-5400}"
    # ⛔ On lit un FICHIER, jamais la liste des processus. Le mot attendu peut
    #    parfaitement vivre dans notre propre argv : ça n'a aucune importance,
    #    puisque personne ne regarde les argv.
    T=0
    until [ -f "$FIC" ] && grep -q -- "$MOT" "$FIC" 2>/dev/null; do
      sleep "$PAS"; T=$((T + PAS))
      if [ "$T" -ge "$MAX" ]; then
        echo "⛔ ABANDON : « $MOT » n'est pas apparu dans $FIC après ${MAX}s." >&2
        exit 2
      fi
    done
    echo "✅ « $MOT » est apparu dans $FIC (après ${T}s)"
    ;;

  *)
    echo "usage : $0 pid   <PID>           [pas] [max]" >&2
    echo "        $0 texte <fichier> <mot> [pas] [max]" >&2
    exit 1
    ;;
esac
