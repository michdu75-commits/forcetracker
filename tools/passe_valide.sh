#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  LA PASSE COMPLÈTE, AVEC SES CONDITIONS DE VALIDITÉ
#  Protocole validé par Michel le 13/09/2026 (docs/PROTOCOLE-DEUX-SESSIONS.md).
#
#  ⛔⛔ POURQUOI CE SCRIPT EXISTE — chaque condition vient d'un ÉCHEC VÉCU :
#   ① la LIGNE DE TOTAL : une passe s'est arrêtée à mi-parcours en affichant 0 rouge.
#      *Une passe interrompue ressemble trait pour trait à une passe verte.*
#   ② le CODE DE SORTIE DU RUNNER LUI-MÊME : ma commande finissait par un `tail`,
#      donc `$?` mesurait le tail. Elle a répondu « exit 0 » sur un runner en erreur.
#   ③ l'ARBRE INCHANGÉ : une passe décrit l'arbre qu'elle a lu, pas celui qu'on pousse.
#   ④ AUCUNE PUBLICATION CONCURRENTE : c'est elle qui a rendu une passe périmée après 25 minutes.
#
#  ⭐ INFRA-QA-01 · LOT L0 (16/11/2026) — ce que les audits des 15-16/11 ont ajouté. Chaque ligne est un FAUX VERT
#     MESURÉ sur le vrai script (arène de scénarios réalistes, `tests/gardes/`), pas une précaution théorique :
#   ⓪ ARBRE PROPRE AU DÉPART (fichiers non suivis compris) : HEAD seul ne dit pas ce qui a été lu (INFRA-01).
#   ③b ARBRE PROPRE À L'ARRIVÉE : un fichier modifié ou créé PENDANT la passe fait de la passe un autre arbre.
#   ④  LE DISTANT, PROUVÉ DEUX FOIS (INFRA-02, E21) : `git fetch` ET `ls-remote` doivent réussir et s'accorder AVANT la
#      passe, puis APRÈS ; les deux relevés doivent être IDENTIQUES (aucune publication pendant les ~25 min) et le distant
#      doit être contenu dans HEAD (on compare à la base attendue, pas au SHA d'un candidat non poussé). Un `fetch` qui
#      échoue en silence laissait lire un `origin/master` périmé : désormais l'inconnu BLOQUE.
#   ⑤⑥ TOTAL ANCRÉ ET UNIQUE, ✅ = N, ❌ = K, ROUGES À TOUTE INDENTATION (INFRA-03) : `grep "TOTAL CROISÉ"` partout
#      acceptait un libellé de témoin qui cite le total ; mesuré sur 5 vrais journaux, ✅ = N et ❌ = K sont EXACTS.
#   ⑦  LES IDENTITÉS (tools/temoins.py, `tests/recette/temoins-attendus.json`) : un témoin OMIS et remplacé par un DOUBLON
#      garde le même total, le même code et zéro rouge. Chaque témoin attendu doit avoir tourné, avec son nombre.
#   ⛔ LE MODE D'ÉPREUVE (FT_PASSE_REJOUER) NE DIT PLUS « PASSE VALIDE » : il dit « ÉPREUVE RÉUSSIE » et sort 3 — ni 0 ni
#      le même message : une réussite d'épreuve n'est JAMAIS une preuve de livraison (INFRA-03, scénario P12/E16).
#
#  ⛔ Il ne pousse rien. Il dit VALIDE ou il dit pourquoi pas.
#  Usage : tools/passe_valide.sh [journal]            la passe, pour de bon (~25 min)
#          tools/passe_valide.sh --calibrer --croiser <dossier d'une passe répartie du même commit> [--accepter-retraits] [journal]
#                                                     la même passe, puis ÉCRIT le manifeste des identités SI les deux exécutions se recoupent
#                                                     (à relire et à committer) ; une passe de calibrage n'est pas une passe de livraison.
# ══════════════════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")/.." || exit 2

CALIBRER=0; ARGS=(); CROISER=""; RETRAITS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --calibrer) CALIBRER=1 ;;
    --croiser) shift; CROISER="${1:-}" ;;
    --accepter-retraits) RETRAITS="--accepter-retraits" ;;
    *) ARGS+=("$1") ;;
  esac
  shift
done
JOURNAL="${ARGS[0]:-/tmp/passe.log}"
EPREUVE=0; [ -n "${FT_PASSE_REJOUER:-}" ] && EPREUVE=1
# ⛔ INFRA-QA-01 · L0 (2ᵉ passe, défaut 3) : un calibrage a besoin d'une SOURCE INDÉPENDANTE — les journaux d'une passe RÉPARTIE du même commit (tools/passe_repartie.py).
#    Sans elle, la référence serait déduite du seul journal à certifier : un témoin omis dont le total a été ajusté deviendrait « attendu ». Refus AVANT les 25 minutes.
if [ "$CALIBRER" = "1" ] && { [ -z "$CROISER" ] || [ ! -f "$CROISER/PASSE.json" ]; }; then
  echo "⛔ --calibrer exige --croiser <dossier des journaux d'une passe répartie du même commit> (avec son PASSE.json) : une référence ne se tire pas du seul journal qu'elle doit certifier."; exit 2
fi
if [ "$CALIBRER" = "1" ] && [ "$EPREUVE" = "1" ]; then echo "⛔ --calibrer est incompatible avec le mode d'épreuve : un manifeste ne se calibre jamais sur un journal rejoué."; exit 2; fi
command -v python3 >/dev/null 2>&1 || { echo "⛔ python3 introuvable : les identités des témoins ne peuvent pas être vérifiées — l'inconnu BLOQUE."; exit 2; }

ok=1
ARBRE=$(git rev-parse HEAD)
echo "── arbre au départ : $ARBRE"

# ⓪ l'arbre est PROPRE au départ — fichiers non suivis compris (un fichier non commité lu par le runner n'est pas dans HEAD)
ETAT0=$(git status --porcelain --untracked-files=all 2>&1); RC_ST=$?
echo
echo "══════ LES CONDITIONS ══════"
if [ "$RC_ST" = "0" ] && [ -z "$ETAT0" ]; then echo "  ✅ ⓪ arbre propre au départ (aucun fichier modifié ni non suivi)"
else echo "  ❌ ⓪ L'ARBRE N'EST PAS PROPRE au départ (code git $RC_ST) : la passe décrirait autre chose que le commit."; echo "$ETAT0" | head -5 | sed 's/^/       /'; ok=0; fi

# ④ LE DISTANT, PROUVÉ DEUX FOIS (avant, puis après) : `fetch` réussi (les objets sont là) + `ls-remote` qui répond + le distant
#    CONTENU dans HEAD (on compare à la base attendue, jamais au SHA local d'un candidat non poussé). Le relevé local
#    `origin/master` n'est PAS comparé : seul `ls-remote` dit ce qu'est le distant ; un fetch qui échouerait en silence
#    rendrait `merge-base` incapable de juger — donc il bloque.
etat_distant() {
  git fetch -q origin 2>/dev/null; D_RC=$?
  D_SHA=$(git ls-remote origin refs/heads/master 2>/dev/null | cut -f1)
  D_CONTENU=0; [ -n "$D_SHA" ] && git merge-base --is-ancestor "$D_SHA" HEAD 2>/dev/null && D_CONTENU=1
}
etat_distant; DIST0=$D_SHA
if [ "$D_RC" = "0" ] && [ -n "$DIST0" ] && [ "$D_CONTENU" = "1" ]; then echo "  ✅ ④a distant joint (fetch et ls-remote), à $DIST0, et HEAD le contient — avant la passe"
else echo "  ❌ ④a DISTANT NON PROUVÉ ou HEAD EN RETARD avant la passe (fetch code $D_RC, ls-remote '${DIST0:-—}', contenu dans HEAD : $D_CONTENU) : refusionner / rétablir le réseau — on ne lit pas un distant périmé"; ok=0; fi

# ⛔ MODE D'ÉPREUVE (FT_PASSE_REJOUER) : réutilise un journal existant au lieu de relancer 25 minutes. Il existe pour UNE
#    raison — le protocole exige qu'un garde soit éprouvé sur du sain PUIS cassé par mutation, et un garde qu'on ne peut
#    pas casser en moins de 25 min ne sera jamais éprouvé. ⛔ Son verdict n'est JAMAIS « PASSE VALIDE » (voir plus haut).
if [ "$EPREUVE" = "1" ]; then
  echo "── ⚠️ MODE D'ÉPREUVE : journal rejoué, AUCUNE passe lancée"
  CODE="${FT_PASSE_CODE:-0}"
elif [ "$ok" = "0" ]; then
  echo
  echo "⛔ PASSE NON VALIDE — refus AVANT de lancer 25 minutes de tests : corriger l'arbre ou le distant, puis relancer."
  exit 1
else
  echo "── la passe tourne (~25 min)…"
  # ⛔ LE RUNNER SEUL : rien après lui sur la ligne, sinon $? cesse d'être le sien.
  node tests/parcours/runner.js > "$JOURNAL" 2>&1
  CODE=$?
fi

# ② le code de sortie du runner lui-même
if [ "$CODE" = "0" ]; then echo "  ✅ ② le runner a terminé correctement (code $CODE)"
else echo "  ❌ ② le runner a échoué (code $CODE)"; ok=0; fi

# ① ⑤ ⑥ ⑦ le journal : total unique et ancré, rouges à toute indentation, lignes = total, identités (tools/temoins.py)
OPT=""; [ "$EPREUVE" = "1" ] && OPT="--epreuve"; [ "$CALIBRER" = "1" ] && OPT="--epreuve"
JSORTIE=$(python3 tools/temoins.py controler "$JOURNAL" $OPT 2>&1); JRC=$?
echo "$JSORTIE"
[ "$CALIBRER" = "1" ] && echo "  ·  ⑦ identités : non évaluées — c'est CETTE passe qui les calibre"
[ "$JRC" = "0" ] || ok=0

# ③ l'arbre n'a pas changé pendant la passe (HEAD) ; ③b l'arbre est resté PROPRE (modifié / créé pendant la passe)
MAINTENANT=$(git rev-parse HEAD)
if [ "$MAINTENANT" = "$ARBRE" ]; then echo "  ✅ ③ HEAD inchangé : l'arbre testé est celui d'aujourd'hui ($ARBRE)"
else echo "  ❌ ③ L'ARBRE A CHANGÉ pendant la passe : $ARBRE → $MAINTENANT"; ok=0; fi
ETAT1=$(git status --porcelain --untracked-files=all 2>&1); RC_ST1=$?
if [ "$RC_ST1" = "0" ] && [ -z "$ETAT1" ]; then echo "  ✅ ③b arbre toujours propre à l'arrivée"
else echo "  ❌ ③b L'ARBRE A ÉTÉ MODIFIÉ pendant ou après la passe (code git $RC_ST1) :"; echo "$ETAT1" | head -5 | sed 's/^/       /'; ok=0; fi

# ④b le distant, prouvé APRÈS (E21) : le MÊME qu'avant (aucune publication pendant les ~25 min, même d'un commit que HEAD contient
#    — deux sessions qui publient en même temps, c'est ce que ④ doit voir) et joint ; HEAD le contenait déjà (④a) et n'a pas bougé (③)
etat_distant; DIST1=$D_SHA
if [ "$D_RC" = "0" ] && [ -n "$DIST1" ] && [ "$DIST1" = "$DIST0" ]; then
  echo "  ✅ ④b aucune publication concurrente : le distant est resté à $DIST1 pendant toute la passe (④a a prouvé que HEAD le contient)"
else
  echo "  ❌ ④b PUBLICATION CONCURRENTE OU DISTANT NON PROUVÉ — avant $DIST0 · après ${DIST1:-—} (fetch code $D_RC) : PASSE PÉRIMÉE."
  echo "       → refusionner · vérifier les témoins de périmètre · renuméroter si besoin · RELANCER"
  ok=0
fi

echo
if [ "$EPREUVE" = "1" ]; then
  if [ "$ok" = "1" ]; then echo "🧪 ÉPREUVE RÉUSSIE (journal rejoué) — SANS VALEUR DE LIVRAISON : ce verdict n'autorise AUCUN push."; exit 3
  else echo "⛔ PASSE NON VALIDE — aucun feu vert."; exit 1; fi
fi
if [ "$ok" = "1" ]; then
  if [ "$CALIBRER" = "1" ]; then
    python3 tools/temoins.py calibrer "$JOURNAL" --commit "$ARBRE" --croiser "$CROISER" $RETRAITS || { echo "⛔ calibrage impossible."; exit 1; }
    echo "⭐ PASSE VALIDE (CALIBRAGE) — manifeste réécrit : relire « git diff tests/recette/temoins-attendus.json », le committer, puis RELANCER sans --calibrer : seule cette seconde passe, qui VÉRIFIE les identités, autorise un push."
    exit 0
  fi
  echo "⭐ PASSE VALIDE — le push peut être préparé (poser le numéro de version MAINTENANT)."; exit 0
else echo "⛔ PASSE NON VALIDE — aucun feu vert."; exit 1; fi
