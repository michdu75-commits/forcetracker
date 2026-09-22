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
#  ⛔⛔ 4ᵉ RECHUTE — 21/09/2026 AU SOIR, ET CE SCRIPT EXISTAIT DÉJÀ.
#     Pour attendre un déploiement GitHub, j'ai écrit à la main, hors d'ici :
#         until [ "$(curl -s .../actions/runs/<id> \
#                    | grep -o '"status":"[a-z_]*"' | head -1)" = '"status":"completed"' ]
#         do sleep 15; done
#     👉 L'API GitHub répond en JSON **INDENTÉ** : `"status": "completed"`, AVEC UNE
#     ESPACE. Le motif `"status":"…"` (sans espace) ne correspond donc JAMAIS.
#     ⭐⭐ La condition n'était pas « difficile à satisfaire », elle était
#     ***IMPOSSIBLE À SATISFAIRE*** — et la boucle n'avait AUCUN maximum.
#     *Deux fautes qui, séparément, se voient ; ensemble, elles tournent sans fin.*
#     C'est le **piège de l'espace pour la 11ᵉ fois** dans ce dépôt (`BUGS.md` §1).
#
#  ⭐ D'OÙ LE MODE `gh-run` : on ne cherche plus un MOTIF dans du texte, on LIT le
#     JSON avec un vrai analyseur (python3). Une réponse illisible, vide, en erreur
#     HTTP ou sans champ `status` **arrête le guetteur et le DIT** — elle ne se
#     confond plus avec « pas encore fini ».
#     ⛔ *Un guetteur qui ne sait pas distinguer « en cours » de « je n'ai pas
#     compris la réponse » attendra indéfiniment une réponse qu'il ne comprend pas.*
#
#  Usage :
#     tools/attendre_fin.sh pid    <PID>            [pas_en_s] [max_en_s]
#     tools/attendre_fin.sh texte  <fichier> <mot>  [pas_en_s] [max_en_s]
#     tools/attendre_fin.sh gh-run <run_id>         [pas_en_s] [max_en_s]
#         (dépôt : $FT_DEPOT, défaut michdu75-commits/forcetracker ·
#          jeton facultatif : $GITHUB_TOKEN)
#
#  Sortie : 0 = le travail est fini (marqueur apparu · run `completed` + `success`)
#           2 = délai maximum dépassé — ⛔ on REND LA MAIN, on ne boucle pas
#               indéfiniment : *une sonde qui ne peut pas abandonner est
#               exactement ce qui a produit les six fantômes.*
#           3 = ERREUR EXPLICITE : réponse illisible, HTTP non-200, champ absent,
#               argument invalide, python3 manquant. ⛔ Jamais confondue avec « en cours ».
#           4 = le run est TERMINÉ mais son verdict n'est pas `success`
#               (failure · cancelled · timed_out · startup_failure…).
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

  gh-run)
    RUN="${2:?usage: attendre_fin.sh gh-run <run_id> [pas] [max]}"
    PAS="${3:-15}"; MAX="${4:-1800}"
    DEPOT="${FT_DEPOT:-michdu75-commits/forcetracker}"

    # ⛔ L'identifiant est VÉRIFIÉ avant le premier appel. Coller une URL entière
    #    (ce qui est le geste naturel) donnerait sinon une 404 toutes les 15 s,
    #    c'est-à-dire une panne qui ressemble à de l'attente.
    case "$RUN" in
      ''|*[!0-9]*)
        echo "⛔ ERREUR : « $RUN » n'est pas un identifiant de run (chiffres uniquement)." >&2
        echo "   → le numéro seul, pas l'URL : .../actions/runs/<CE_NUMÉRO>" >&2
        exit 3 ;;
    esac
    command -v python3 >/dev/null 2>&1 || {
      echo "⛔ ERREUR : python3 est requis pour lire le JSON sans le deviner." >&2; exit 3; }

    API="https://api.github.com/repos/$DEPOT/actions/runs/$RUN"
    ENTETES=(-H 'Accept: application/vnd.github+json')
    [ -n "${GITHUB_TOKEN:-}" ] && ENTETES+=(-H "Authorization: Bearer $GITHUB_TOKEN")

    # ⛔⛔ AUCUN `grep` SUR DU JSON — c'est tout l'objet de ce mode.
    #    L'analyseur rend TROIS mots : un verdict de lecture, le statut, la conclusion.
    #    Ainsi « je n'ai pas compris » a son propre mot, et ne peut pas se déguiser
    #    en « pas encore terminé ».
    LIRE='import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("ILLISIBLE - -"); raise SystemExit
if not isinstance(d, dict) or "status" not in d:
    msg = d.get("message", "?") if isinstance(d, dict) else "?"
    print("SANS_STATUT %s -" % str(msg).split("\n")[0].replace(" ", "_")); raise SystemExit
print("LU %s %s" % (d.get("status") or "?", d.get("conclusion") or "-"))'

    T=0; ECHECS=0; MAX_ECHECS=3; DERNIER="(rien lu)"
    while :; do
      REP="$(curl -sS -m 20 -w $'\n%{http_code}' "${ENTETES[@]}" "$API" 2>/dev/null)" || REP=""
      CODE="$(printf '%s' "$REP" | tail -n 1)"
      CORPS="$(printf '%s' "$REP" | sed '$d')"

      if [ "$CODE" = "200" ]; then
        read -r VERDICT STATUT CONCL <<<"$(printf '%s' "$CORPS" | python3 -c "$LIRE")"
      else
        VERDICT="HTTP"; STATUT="$CODE"; CONCL="-"
      fi

      case "$VERDICT" in
        LU)
          ECHECS=0; DERNIER="« $STATUT »"
          if [ "$STATUT" = "completed" ]; then
            if [ "$CONCL" = "success" ]; then
              echo "✅ run $RUN terminé : success (après ${T}s)"; exit 0
            fi
            echo "⛔ run $RUN terminé, mais verdict « $CONCL » — ce n'est PAS un succès." >&2
            exit 4
          fi
          ;;
        *)
          # ⛔ Une lecture qui échoue N'EST PAS « en cours ». On tolère quelques
          #    ratés réseau consécutifs, puis on s'arrête EN DISANT LEQUEL.
          ECHECS=$((ECHECS + 1)); DERNIER="illisible ($VERDICT $STATUT)"
          echo "⚠️  lecture $ECHECS/$MAX_ECHECS impossible ($VERDICT $STATUT)" >&2
          if [ "$ECHECS" -ge "$MAX_ECHECS" ]; then
            echo "⛔ ERREUR : $MAX_ECHECS lectures consécutives inexploitables ($VERDICT $STATUT)." >&2
            echo "   → réponse reçue, début : $(printf '%s' "$CORPS" | head -c 200)" >&2
            exit 3
          fi
          ;;
      esac

      sleep "$PAS"; T=$((T + PAS))
      if [ "$T" -ge "$MAX" ]; then
        echo "⛔ ABANDON : le run $RUN est encore $DERNIER après ${MAX}s — la main est rendue." >&2
        exit 2
      fi
    done
    ;;

  *)
    echo "usage : $0 pid    <PID>           [pas] [max]" >&2
    echo "        $0 texte  <fichier> <mot> [pas] [max]" >&2
    echo "        $0 gh-run <run_id>        [pas] [max]" >&2
    exit 1
    ;;
esac
