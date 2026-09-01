#!/usr/bin/env python3
"""Garde CLAUDE.md et docs/REGLES-OR.md synchronisés (scission du 28/07/2026).

CLAUDE.md porte les 12 règles d'or en UNE LIGNE ; docs/REGLES-OR.md porte le texte
complet et le pourquoi. Deux fichiers dérivent en quelques semaines si rien ne les
surveille — d'où ce script. Trois contrôles :

  1. les mêmes numéros de règle des deux côtés ;
  2. chaque ligne courte renvoie bien vers le fichier long ;
  3. le journal récent de CLAUDE.md ne dépasse pas le seuil (sinon : archiver).
  4. AUCUNE entrée de docs/JOURNAL-ARCHIVE.md n'a disparu.
  5. AUCUN document .md ne s'est fait écraser (contrôle 4 généralisé aux 54 autres).
  6. AUCUNE ligne de TÂCHE n'est tombée dans le tableau des ÉTATS du journal de partage
  7. AUCUNE ligne 🟡 ne survit à sa propre clôture 🟢, et AUCUNE ligne 🟢 n'est en double
     (une fusion par UNION ressuscite ce qu'on a retiré ET dédouble ce qu'on a modifié).
  8. Le tableau des 8 BRIQUES de DOSSIER-ATHLETE-SUIVI.md est à jour (généré depuis le code).
     (bug arrivé DEUX fois — elle y est invisible, donc personne ne peut la voir manquer).

⚠️ PORTÉE HONNÊTE DU CONTRÔLE 5 : il compare l'état du dossier au DERNIER COMMIT,
donc il attrape l'écrasement AVANT qu'il parte — ce qui est le bon moment, puisque
ce script tourne à chaque livraison (règle d'or #12). Il ne remonte PAS 20 commits
en arrière comme le contrôle 4 : sur 54 documents, une perte volontaire d'il y a
trois jours rougirait pour toujours, et *un garde-fou qui crie pour rien se fait
désactiver*. Le contrôle 4 garde la mémoire longue ; le 5 garde le geste du jour.

⚠️ POURQUOI LE CONTRÔLE 4 EXISTE (06/08/2026) — le 04/08, à la livraison de ft-v766,
un script d'archivage a ÉCRIT le fichier au lieu d'y AJOUTER : 890 956 caractères et
297 entrées remplacés par une seule (`1 ligne ajoutée, 1793 supprimées` dans le diff,
que personne n'a lu). Les 17 archivages suivants ont refait la même chose, donc chacun
écrasait le précédent — la perte s'est aggravée en SILENCE pendant deux jours, et n'a
été trouvée que par hasard. Ce fichier était pourtant la mémoire longue du projet, et
les contrôles 1-3 ne regardaient QUE le journal récent : l'archive n'était surveillée
par rien. *On surveillait la pièce qu'on regarde, pas celle qu'on ne rouvre jamais.*

Le contrôle compare aux 20 derniers états connus du fichier dans git, pas seulement au
dernier : une perte découverte trois jours plus tard doit encore être vue (c'est
exactement ce qui est arrivé). Une entrée peut être RÉÉCRITE, jamais DISPARAÎTRE.

Sortie 1 si un contrôle échoue.  Lancer : python3 tools/check_regles.py
"""
import re, sys, pathlib, subprocess

SEUIL_JOURNAL = 20          # au-delà, déménager les plus anciennes dans docs/JOURNAL-ARCHIVE.md
racine = pathlib.Path(__file__).resolve().parent.parent
court  = (racine / "CLAUDE.md").read_text(encoding="utf-8")
long_  = (racine / "docs" / "REGLES-OR.md").read_text(encoding="utf-8")

erreurs = []

entete = court.split("## Présentation")[0]
n_court = sorted(int(n) for n in re.findall(r"(?m)^(\d+)\. \*\*", entete))
n_long  = sorted(int(n) for n in re.findall(r"(?m)^\*\*(\d+)\. ", long_))

if n_court != n_long:
    erreurs.append(f"numéros différents — CLAUDE.md {n_court} · REGLES-OR.md {n_long}")

sans_renvoi = [n for n in n_court if f"REGLES-OR.md#{n}`" not in entete]
if sans_renvoi:
    erreurs.append(f"règles sans renvoi vers REGLES-OR.md : {sans_renvoi}")

entrees = re.findall(r"(?m)^\*\*(?:ft-v\d+|GOUVERNANCE|BACKEND|FRAMEWORK)", court)
if len(entrees) > SEUIL_JOURNAL:
    erreurs.append(
        f"journal récent = {len(entrees)} entrées (seuil {SEUIL_JOURNAL}) — "
        "déménager les plus anciennes dans docs/JOURNAL-ARCHIVE.md"
    )

# ── 4. l'archive ne perd JAMAIS une entrée ──────────────────────────────────
ARCHIVE = "docs/JOURNAL-ARCHIVE.md"
PROFONDEUR = 20            # nb d'états passés du fichier qu'on relit dans git
archive_txt = (racine / "docs" / "JOURNAL-ARCHIVE.md").read_text(encoding="utf-8")
ids = lambda t: set(re.findall(r"(?m)^\*\*(ft-v\d+)", t))
maintenant = ids(archive_txt)
connues, git_ok = set(), True

def _git(*args):
    return subprocess.run(["git", "-C", str(racine)] + list(args),
                          capture_output=True).stdout.decode("utf-8", "replace")

try:
    commits = _git("log", f"-n{PROFONDEUR}", "--format=%H", "--", ARCHIVE).split()
    if not commits:
        git_ok = False                       # dépôt sans historique : rien à comparer
    for c in commits:
        connues |= ids(_git("show", f"{c}:{ARCHIVE}"))
except Exception:
    git_ok = False                           # pas de git → on ne bloque pas la livraison

perdues = sorted(connues - maintenant, key=lambda s: int(s[4:]))
if git_ok and perdues:
    erreurs.append(
        f"{ARCHIVE} a PERDU {len(perdues)} entrée(s) déjà archivée(s) : "
        + ", ".join(perdues[:8]) + ("…" if len(perdues) > 8 else "")
        + " — l'archive s'AJOUTE, elle ne se réécrit pas. "
          "Récupérer : git show <commit>:" + ARCHIVE
    )

# ── 5. AUCUN document ne se fait ÉCRASER ────────────────────────────────────
# ⚠️ POURQUOI CE CONTRÔLE EXISTE (17/08/2026) — le contrôle 4 ci-dessus a été écrit
# après la perte du 04/08… et il ne surveille QU'UN SEUL FICHIER. Le 17/08, en
# rédigeant un audit, j'ai ouvert `docs/AUDIT-CONTEXTE-MILO.md` en écriture sans
# vérifier qu'il existait : un document du 09/08 a été remplacé, 138 lignes perdues.
# git l'a rendu — mais rien ne l'avait signalé. *Deuxième fois, même famille.*
#
# C'est exactement le motif trouvé le même jour sur le prompt de Milo : UNE CHOSE
# SURVEILLÉE, SA JUMELLE PAS DU TOUT. Le contrôle 4 gardait la pièce qu'on avait déjà
# perdue ; les 40 autres documents n'étaient gardés par personne.
#
# ⚠️ CE QU'IL NE FAIT PAS, VOLONTAIREMENT (R19 — la gouvernance sert le produit) :
# il ne bloque pas une réécriture normale. Une ligne qui DÉMÉNAGE dans un autre
# document est retrouvée et acceptée (c'est le geste légitime : journal → archive).
# Il ne se déclenche que si un document perd une grosse part de sa substance ET que
# ce qui manque n'est nulle part ailleurs. Un garde-fou qui crie pour rien se fait
# désactiver, et on revient au point de départ.
PART_MINI  = 0.25          # il faut perdre au moins un quart du fichier…
LIGNES_MINI = 15           # …ET au moins 15 lignes de fond (les deux, pas l'un ou l'autre)
# Fichiers RÉGÉNÉRÉS depuis le code : les réécrire EST leur mode de fonctionnement.
# ⚠️ AJOUT 21/08/2026 — les RAPPORTS DE TEST. `tests/milo/report.md` et
# `tests/milo/eval-report.md` sont réécrits par leur runner à chaque exécution, et leur
# taille dépend du nombre de scénarios joués : une passe `--only EV-012` en produit un de
# 4 lignes après une passe de 15. Le contrôle criait donc « 79 % perdus » sur le
# fonctionnement NORMAL de l'outil — et un garde-fou qui crie pour rien finit désactivé (R19).
# ⛔ On ne baisse AUCUN seuil : on retire de la surveillance des fichiers qui ne sont pas
# des documents. Ce qui protège les vrais documents (leçon du 04/08, 297 entrées écrasées)
# reste exactement aussi strict.
GENERES = {"docs/INVENTAIRE.md", "docs/FIGURINES.html",
           "tests/milo/report.md", "tests/milo/eval-report.md"}

# ── 🚪 LA PORTE ÉTROITE : une RÉÉCRITURE VOLONTAIRE (19/08/2026) ─────────────
# LE CAS QUI L'A CRÉÉE. Michel demande de réécrire un document en changeant l'ordre
# des sections (« je voulais que tu parles de la 2ᵉ ia et ce que l'on fait
# actuellement »). Le contenu est CONSERVÉ, mais les lignes sont re-coupées — or le
# contrôle compare des lignes À L'IDENTIQUE. Verdict : « 78 % perdus ». C'est un
# FAUX POSITIF, et un garde-fou qui crie sur un geste légitime finit désactivé (R19).
#
# ⚠️ MAIS ON N'AFFAIBLIT PAS LE SEUIL — ce contrôle existe parce qu'un script a
# ÉCRASÉ l'archive le 04/08 : 297 entrées perdues, découvertes 2 jours plus tard PAR
# HASARD. Baisser le seuil, ce serait rouvrir exactement cette porte-là.
#
# 👉 La porte est donc ÉTROITE et elle LAISSE UNE TRACE : le document doit porter
# lui-même une ligne datée qui dit ce qui a été réécrit et pourquoi (R30 — un geste
# volontaire s'écrit, sinon il redevient un bug ; R27 — le pourquoi vit à côté de ce
# qu'il protège). Format attendu, en commentaire HTML, dans le document :
#
#     <!-- RÉÉCRITURE VOLONTAIRE 2026-08-19 : la raison, en une phrase -->
#
# ⚠️ Et ça ne rend PAS le contrôle muet : il affiche l'avertissement et la raison.
# On voit passer la réécriture, on ne la découvre pas deux jours après.
MARQUE_REECRITURE = re.compile(
    r"<!--\s*R[ÉE]{1}[ÉE]?CRITURE\s+VOLONTAIRE\s+(\d{4}-\d{2}-\d{2})\s*:\s*(.{30,})?-->",
    re.IGNORECASE)

def _fond(t):
    """Les lignes qui portent du sens — on ignore le décor (vides, ---, titres seuls)."""
    return {l.strip() for l in t.split("\n")
            if len(l.strip()) > 40 and not set(l.strip()) <= set("-=_#>| ")}

ecrases = []
reecrits = []   # réécritures VOLONTAIRES, déclarées dans le document (voir la porte étroite)
if git_ok:
    try:
        suivis = [f for f in _git("ls-files", "*.md").split("\n")
                  if f and f not in GENERES]
        # Tout ce que le dépôt contient AUJOURD'HUI, tous documents confondus :
        # une ligne déplacée d'un fichier à l'autre doit être retrouvée ici.
        partout = set()
        for f in suivis:
            p = racine / f
            if p.exists():
                partout |= _fond(p.read_text(encoding="utf-8", errors="replace"))
        for f in suivis:
            avant = _fond(_git("show", f"HEAD:{f}"))
            if not avant:
                continue                       # fichier nouveau : rien à perdre
            p = racine / f
            apres = _fond(p.read_text(encoding="utf-8", errors="replace")) if p.exists() else set()
            disparues = avant - apres - partout   # ni ici, ni ailleurs → vraiment perdues
            if len(disparues) >= LIGNES_MINI and len(disparues) / len(avant) >= PART_MINI:
                brut = p.read_text(encoding="utf-8", errors="replace") if p.exists() else ""
                m = MARQUE_REECRITURE.search(brut)
                if m:
                    reecrits.append((f, len(disparues), len(avant),
                                     m.group(1), (m.group(2) or "").strip()))
                else:
                    ecrases.append((f, len(disparues), len(avant)))
    except Exception:
        pass                                   # jamais bloquer sur un pépin d'outillage

# ⚠️ Une réécriture déclarée est SIGNALÉE, jamais silencieuse : on doit la voir passer.
for f, n, tot, quand, pourquoi in reecrits:
    print(f"🚪 {f} : réécriture VOLONTAIRE déclarée le {quand} "
          f"({100*n/tot:.0f} % des lignes re-rédigées) — {pourquoi}")

for f, n, tot in ecrases:
    erreurs.append(
        f"{f} a PERDU {n} lignes de fond sur {tot} ({100*n/tot:.0f} %), introuvables "
        f"ailleurs dans le dépôt — un document s'AJOUTE ou se DÉPLACE, il ne s'écrase pas. "
        f"Vérifier avec : git diff {f}  ·  récupérer : git show HEAD:{f}"
    )

if erreurs:
    print("❌ Fichiers de règles désynchronisés :")
    for e in erreurs:
        print("   -", e)
    sys.exit(1)

print(f"✅ {len(n_court)} règles d'or cohérentes · journal récent : {len(entrees)} entrées "
      f"(seuil {SEUIL_JOURNAL}) · CLAUDE.md {len(court.split())} mots")
print(f"✅ archive : {len(maintenant)} entrées, 0 perdue"
      + ("" if git_ok else " (⚠️ git indisponible — contrôle non effectué)"))
# ────────────────────────────────────────────────────────────────────────────────
# 🧾 LE JOURNAL DE TEST — compter les entrées, parce qu'une intention qu'aucun outil
# ne rappelle finit par s'éteindre.
#
# Michel, le 21/08/2026 : « on met de côté le benchmark, on n'a pas assez de pièges
# pour Milo », puis « dès que tu auras marqué 25 questions ou pièges on le relance »,
# et surtout : « il faut que tu fasses en sorte d'alimenter ce fichier ET QUE TU T'EN
# SOUVIENNES ».
#
# ⭐ « S'en souvenir » ne peut pas reposer sur la bonne volonté d'une session : elles
#    se terminent. Ça repose donc sur un COMPTEUR qui s'affiche à chaque livraison —
#    le même mécanisme qui garde le journal des versions sous son seuil.
# ⚠️ Ce n'est PAS bloquant : un journal peu rempli n'est pas une erreur, c'est un
#    état. On le SIGNALE, on ne refuse pas la livraison (R19 — un outil qui bloque
#    pour du confort finit contourné).
SEUIL_PIEGES = 25
try:
    jt = (racine / "docs" / "JOURNAL-DE-TEST.md").read_text(encoding="utf-8")
    # Une entrée = un titre de niveau 3 portant un état. Les états sont dans le fichier.
    _ETATS = "🟡🟢🔵🟣⚪"
    _titres = [l for l in jt.split("\n") if l.startswith("### ")]
    _ent = [l for l in _titres if any(e in l[:8] for e in _ETATS)]
    # ⚠️⚠️ UN TITRE SANS ÉTAT CONNU N'EST PAS IGNORÉ, IL EST DÉNONCÉ (26/08/2026).
    #    Mesuré ce jour-là : CINQ entrées portaient un 🟠 qui n'est dans aucune légende. Elles
    #    étaient donc SAUTÉES en silence — le compteur annonçait 54 entrées pour 59 réelles, et
    #    il aurait continué à mentir vers le bas indéfiniment.
    #    ⛔ C'est la famille « un vert qui ne peut pas rougir » de BUGS.md : un filtre qui ne
    #    garde que ce qu'il reconnaît ne peut jamais signaler ce qu'il ne reconnaît pas.
    #    ⚠️ ET IL S'IMPRIME ICI, PAS DANS `erreurs` : cette liste est consommée bien plus haut
    #    (ligne ~200), donc y ajouter quelque chose à cet endroit ne produirait AUCUN affichage.
    #    Mon 1er jet faisait exactement ça — un garde-fou parfaitement muet, c'est-à-dire pire
    #    que pas de garde-fou. Trouvé en essayant de le faire ROUGIR, pas en le relisant.
    _inconnus = [l for l in _titres if l not in _ent]
    if _inconnus:
        print("❌ docs/JOURNAL-DE-TEST.md : %d entrée(s) portent un état absent de la légende —"
              " elles ne sont comptées nulle part." % len(_inconnus))
        for _t in _inconnus[:5]:
            print("   → " + _t[:100])
        print("   États valides : %s (voir la légende du fichier)" % _ETATS)
        _JT_KO = True
    else:
        _JT_KO = False
    _ouvertes = [l for l in _ent if ("🟡" in l[:8] or "🟢" in l[:8])]
    _promues  = [l for l in _ent if "🔵" in l[:8]]
    if len(_ent) >= SEUIL_PIEGES:
        # ⚠️ Le seuil est un PLANCHER, pas une cible (Michel : « quand je dis 25 c'est AU MOINS »).
        #    On annonce donc que la relance est POSSIBLE, jamais que le travail est fini : un
        #    compteur qui dit « objectif atteint » fait arrêter de remplir.
        print(f"🎯 journal de test : {len(_ent)} entrées "
              f"({len(_ouvertes)} à promouvoir · {len(_promues)} promues) — "
              f"plancher de {SEUIL_PIEGES} ATTEINT, le benchmark peut être relancé. "
              f"On continue d'alimenter : le fichier ne se ferme pas.")
    else:
        print(f"🧾 journal de test : {len(_ent)} entrées "
              f"({len(_ouvertes)} à promouvoir · {len(_promues)} promues) — "
              f"benchmark en pause, encore {SEUIL_PIEGES - len(_ent)} avant le plancher de {SEUIL_PIEGES}.")
    if _JT_KO:
        sys.exit(1)
except FileNotFoundError:
    print("⚠️ docs/JOURNAL-DE-TEST.md introuvable — le réflexe de la règle #12 n'a plus de fichier.")
except SystemExit:
    raise                                      # ⛔ ne pas avaler notre propre refus (ci-dessus)
except Exception:
    pass                                       # jamais bloquer sur un pépin d'outillage


# ══════════════════════════════════════════════════════════════════════════════
# CONTRÔLE 6 — UNE LIGNE DE TÂCHE NE TOMBE PLUS DANS LE TABLEAU DES ÉTATS
#
# ⚠️ C'EST UN VRAI BUG, ET IL S'EST PRODUIT DEUX FOIS (25/08 puis 26/08/2026).
# Michel, en le voyant : « j'appelle ça un bug moi ». Il a raison — deux fois le même
# défaut, ce n'est plus un accident, c'est une famille (R17 : chaque bug devient un test).
#
# LA CAUSE N'EST PAS DE LA NÉGLIGENCE, ELLE EST DANS LA FORME DU FICHIER :
# `docs/JOURNAL-DE-PARTAGE.md` porte DEUX tableaux dont les lignes commencent par le
# MÊME jeton — la légende (« | 🟢 **livré** | … », 2 colonnes) et les tâches
# (« | 🟢 | 26/08 … | », 6 colonnes) — et **le leurre vient EN PREMIER** dans le
# fichier. Toute insertion qui vise « la première ligne `| 🟢` » atterrit donc dans la
# légende.
#
# ⛔⛔ ET LE DÉGÂT EST SILENCIEUX, c'est ce qui le rend coûteux : markdown affiche une
# ligne de 6 colonnes dans un tableau de 2 en **jetant les cellules en trop**. La ligne
# EXISTE dans le fichier, elle est INVISIBLE à l'écran. Personne ne peut la voir
# manquer — donc deux sessions peuvent prendre le même sujet en croyant le tableau à
# jour. C'est très exactement ce que ce protocole existe pour empêcher.
#
# LA RÈGLE, PAS LA MESURE DU JOUR : une ligne de la légende n'a JAMAIS de date. On
# refuse donc toute ligne DATÉE (JJ/MM) dans le tableau des états — la prochaine
# insertion ratée fait rougir la livraison au lieu de disparaître en silence.
try:
    _jp = (racine / "docs" / "JOURNAL-DE-PARTAGE.md").read_text(encoding="utf-8")
    _lignes = _jp.split("\n")
    _iEtats  = next(i for i, l in enumerate(_lignes) if l.startswith("## ") and "Les états" in l)
    _iTaches = next(i for i, l in enumerate(_lignes) if l.startswith("## ") and "Les tâches" in l)
    # La légende s'arrête au séparateur `---` qui suit son titre.
    _fin = next((i for i in range(_iEtats + 1, len(_lignes)) if _lignes[i].strip() == "---"), _iTaches)
    _egarees = [l for l in _lignes[_iEtats:_fin]
                if l.startswith("|") and re.search(r"\|\s*\d{2}/\d{2}\s", l)]
    if _egarees:
        print("❌ docs/JOURNAL-DE-PARTAGE.md : "
              f"{len(_egarees)} ligne(s) de TÂCHE dans le tableau des ÉTATS "
              "(elles y sont INVISIBLES — markdown jette les colonnes en trop) :")
        for l in _egarees:
            print("   - " + l[:110])
        print("   → les déplacer sous « ## 📋 Les tâches », EN TÊTE du fichier. ⚠️ Et pour "
              "insérer, s'ancrer sur l'EN-TÊTE de ce tableau : la légende porte le même jeton "
              "`| 🟢`, donc elle reste une cible possible même depuis qu'elle ne vient plus en "
              "premier (restructuration du 26/08).")
        sys.exit(1)
    # ⛔ Et le témoin doit avoir VU quelque chose, sinon il serait vert en ne mesurant rien.
    _nTaches = sum(1 for l in _lignes[_iTaches:] if l.startswith("|")
                   and re.search(r"\|\s*\d{2}/\d{2}\s", l))
    if _nTaches == 0:
        print("⚠️ docs/JOURNAL-DE-PARTAGE.md : aucune ligne datée trouvée dans le tableau des "
              "tâches — le contrôle 6 ne mesure peut-être plus rien (structure changée ?).")
except FileNotFoundError:
    print("⚠️ docs/JOURNAL-DE-PARTAGE.md introuvable — le protocole de la règle #13 n'a plus de fichier.")
except StopIteration:
    print("⚠️ docs/JOURNAL-DE-PARTAGE.md : titres « Les états » / « Les tâches » introuvables — "
          "contrôle 6 non effectué (le fichier a changé de structure).")


# ══════════════════════════════════════════════════════════════════════════════
# CONTRÔLE 7 — UNE LIGNE 🟡 NE SURVIT PAS À SA PROPRE CLÔTURE 🟢
#
# ⚠️ CE DÉFAUT EST DE MOI, ET IL EST L'EXACT MIROIR DU CONTRÔLE 6 (26/08/2026).
# En fusionnant deux versions du journal, j'ai pris l'UNION des lignes de tâche pour
# n'en PERDRE aucune. Mais **une union ne supprime jamais** : session-A avait retiré sa
# ligne 🟡 en la remplaçant par une 🟢, et mon union l'a **ressuscitée**. Le tableau
# annonçait donc « quelqu'un travaille dessus » sur un sujet livré depuis des heures.
#
# 👉 *Un choix qui ne peut que gagner ne peut pas non plus oublier.* Le contrôle 6 protège
# contre la PERTE d'une ligne ; celui-ci protège contre sa RÉSURRECTION.
#
# LA RÈGLE : une ligne 🟡 et une ligne 🟢 qui portent la MÊME session et la MÊME heure de
# départ sont la même tâche, avant et après clôture. La 🟢 fait foi ; la 🟡 est un reste.
try:
    _lg = (racine / "docs" / "JOURNAL-DE-PARTAGE.md").read_text(encoding="utf-8").split("\n")
    def _cle(l):
        m = re.match(r"\|\s*[🟡🟢]\s*\|\s*(\d{2}/\d{2}\s+\d{2}:\d{2})[^|]*\|\s*([^|]+?)\s*\|", l)
        return (m.group(1).strip(), m.group(2).strip()) if m else None
    _jaunes = {_cle(l): l for l in _lg if l.startswith("| 🟡 |") and _cle(l)}
    _verts  = {_cle(l) for l in _lg if l.startswith("| 🟢 |") and _cle(l)}
    _zombies = [_jaunes[k] for k in _jaunes if k in _verts]
    if _zombies:
        print("❌ docs/JOURNAL-DE-PARTAGE.md : "
              f"{len(_zombies)} ligne(s) 🟡 qui ont DÉJÀ leur clôture 🟢 (même session, même heure) :")
        for l in _zombies:
            print("   - " + l[:110])
        print("   → retirer la 🟡 : la 🟢 fait foi. ⚠️ Cause connue : une fusion par UNION ne "
              "supprime jamais, donc elle RESSUSCITE une ligne que l'autre session avait close.")
        sys.exit(1)

    # ── 2ᵉ moitié, ajoutée le 27/08 après un cas RÉEL de la MÊME cause ──────────
    # ⚠️ CE DÉFAUT EST ENCORE DE MOI, et il montre que la 1ʳᵉ moitié ne couvrait qu'un cas
    # sur deux. Une fusion par union a recopié ma ligne 🟢 de ft-v1032 **DEUX FOIS** — les
    # deux exemplaires ne différaient que par un mot (« votre ft-v1031 » / « ft-v1035 »),
    # donc aucun outil ne les voyait comme identiques, et l'œil non plus : la ligne fait
    # 1 400 caractères.
    # 👉 *Une union ne ressuscite pas seulement ce qui a été retiré : elle DÉDOUBLE ce qui
    # a été modifié.* Le contrôle 7 attrapait 🟡+🟢 ; il lui manquait 🟢+🟢.
    # LA RÈGLE : deux lignes de tâche qui portent la MÊME session et la MÊME heure de départ
    # sont la même tâche. Il ne peut y en avoir qu'une.
    _vus = {}
    _doublons = []
    for l in _lg:
        if not l.startswith("| 🟢 |"):
            continue
        k = _cle(l)
        if not k:
            continue
        if k in _vus:
            _doublons.append(l)
        _vus[k] = l
    if _doublons:
        print("❌ docs/JOURNAL-DE-PARTAGE.md : "
              f"{len(_doublons)} ligne(s) 🟢 en DOUBLE (même session, même heure de départ) :")
        for l in _doublons:
            print("   - " + l[:110])
        print("   → n'en garder qu'UNE. ⚠️ Cause connue : une fusion par UNION dédouble une "
              "ligne modifiée des deux côtés — les deux exemplaires diffèrent d'un mot, "
              "donc rien ne les distingue à l'œil sur 1 400 caractères.")
        sys.exit(1)
except FileNotFoundError:
    pass                                        # déjà signalé par le contrôle 6
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage


# ══════════════════════════════════════════════════════════════════════════════
# CONTRÔLE 8 — LE TABLEAU DES 8 BRIQUES EST À JOUR
#
# Le socle du produit (DOSSIER-ATHLETE-SUIVI.md) n'avait pas bougé pendant 28 jours et
# ~350 versions, et il DISAIT FAUX : deux briques construites y étaient marquées
# « ⏳ EN ATTENTE ». C'est R23 — *un document d'état qu'on ne met pas à jour fait dire
# des bêtises à celui qui le lit*, ce qui est arrivé deux fois le seul 26/08.
#
# ⭐ Le tableau est donc GÉNÉRÉ depuis le code (tools/briques.py), comme INVENTAIRE.md, et
# ce contrôle refuse la livraison s'il a dérivé. *Un état qu'on doit penser à mettre à jour
# finit par ne pas l'être ; un état qui fait rougir la livraison, si.*
try:
    _r = subprocess.run([sys.executable, str(racine / "tools" / "briques.py"), "--check"],
                        capture_output=True, text=True, timeout=30)
    if _r.returncode != 0:
        print((_r.stdout or "").strip() or "❌ tools/briques.py --check a échoué")
        sys.exit(1)
    print((_r.stdout or "").strip())
except FileNotFoundError:
    print("⚠️ tools/briques.py introuvable — le tableau des 8 briques n'est plus surveillé.")
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage

# ══════════════════════════════════════════════════════════════════════════════
# CONTRÔLE 9 — AUCUN PAQUET NI GROS BINAIRE N'ENTRE PAR MÉGARDE
#
# ⚠️ CAS RÉEL (27/08/2026) : un `imageio_ffmpeg-…-manylinux2014_x86_64.whl` de **29 Mo**
# — 21 % du dépôt — est entré par un `git add -A`, dans une session où il fallait
# installer de quoi lire une vidéo envoyée par Michel. Personne ne le référençait ; il
# partait sur le site **PUBLIC** à chaque déploiement, dans un artefact de 122 Mo, et
# alourdissait chaque clone. *Un outil installé pour dépanner n'est pas une dépendance
# du projet.*
#
# ⭐ POURQUOI UN CONTRÔLE ET PAS SEULEMENT UNE LIGNE DE .gitignore : le `.gitignore` ne
# protège que les motifs qu'on a pensé à écrire. Celui-ci mesure la CONSÉQUENCE — un gros
# fichier posé à la racine — quelle que soit son extension. *On ne peut pas lister à
# l'avance toutes les formes que prend une erreur ; on peut mesurer ce qu'elle produit.*
#
# ⛔ SEULEMENT À LA RACINE, et c'est délibéré : les dossiers d'assets ont de vraies raisons
# d'être lourds (`data/complalim.json` = 6,4 Mo, les moteurs OCR = 3,8 Mo chacun). Ce qui
# n'a pas de raison d'être, c'est un gros fichier posé À CÔTÉ de `index.html`.
#
# ⭐⭐ ÉTENDU LE 29/08/2026 — LES CAPTURES DE DÉBOGAGE, ET C'EST LA LIMITE DU CONTRÔLE
# CI-DESSUS QUI L'A MONTRÉE. `cap_fab2/3/4.png` + `cap_original.png` (2,9 Mo au total) ont
# vécu **un mois** à la racine, entrées par un merge le 29/07, référencées par **rien**, et
# publiées sur le site public à chaque déploiement. ⚠️ **Le contrôle du dessus les laissait
# passer** : 600 Ko à 1,1 Mo chacune, très en dessous des 5 Mo. *Le seuil mesurait le gros
# fichier unique, pas les quatre petits qui font la même chose.*
# ⛔ On ajoute donc un MOTIF DE NOM, et on assume la différence de nature : le plafond
# mesure une conséquence (c'est lourd), celui-ci reconnaît une INTENTION (c'est une capture
# jetable). Les deux sont utiles, aucun ne remplace l'autre.
# ⚠️ Volontairement borné à la RACINE et à des noms de brouillon : `female-body.png` vit
# aussi à la racine, n'est référencée nulle part, et est **gardée exprès** (voir CLAUDE.md,
# « Notes techniques ») — une règle « toute image non référencée » la supprimerait, c'est-à-
# dire casserait une décision (R30). *Un contrôle qui attrape une décision est un mauvais
# contrôle.*
PLAFOND_RACINE = 5 * 1024 * 1024
CAPTURE_MOTIFS = ("cap_", "capture", "screenshot", "screen_", "shot_", "tmp_", "test_")
try:
    _suivis = _git("ls-files").splitlines() if git_ok else []
    _gros, _paquets, _captures = [], [], []
    for _f in _suivis:
        if "/" not in _f:                                     # racine uniquement
            _p = racine / _f
            if _p.exists() and _p.stat().st_size > PLAFOND_RACINE:
                _gros.append(f"{_f} ({_p.stat().st_size/1048576:.1f} Mo)")
            _bas = _f.lower()
            if _bas.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif")) \
               and _bas.startswith(CAPTURE_MOTIFS):
                _captures.append(_f)
        if _f.endswith((".whl", ".tar.gz", ".tgz")):
            _paquets.append(_f)
    if _gros or _paquets or _captures:
        print("❌ des fichiers qui n'ont rien à faire dans le dépôt :")
        for _x in _gros:    print(f"   - {_x} — trop gros pour la racine (> 5 Mo)")
        for _x in _paquets: print(f"   - {_x} — paquet téléchargé, pas une source")
        for _x in _captures: print(f"   - {_x} — capture de débogage, pas un asset du produit")
        print("   → les retirer (`git rm`) : ils sont publiés sur le site PUBLIC et "
              "alourdissent chaque clone.")
        sys.exit(1)
    print(f"✅ dépôt : aucun paquet, gros fichier ni capture de débogage à la racine "
          f"({len(_suivis)} fichiers suivis)")
except SystemExit:
    raise
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage


# ══════════════════════════════════════════════════════════════════════════════
# CONTRÔLE 10 — LE NOMBRE DE TÉMOINS NE DESCEND JAMAIS
#
# ⚠️⚠️ CAS RÉEL (30/08/2026) — et c'est L'ARCHIVE DU 04/08 REJOUÉE DANS LE RUNNER.
# Ma fusion de ft-v1065 a résolu un conflit de `tests/parcours/runner.js` en **écrasant
# le côté de l'autre session** : `-140` lignes, et **deux blocs entiers effacés** — le
# CLXX de session-A (« j'ai 2 fois la même prot », 8 témoins) et son CLXXI (« le choix
# d'unité dans Modifier l'aliment », 9 témoins). Pire, mon bloc a **repris leur numéro**,
# ce qui masquait le trou : le fichier avait toujours un « BLOC CLXX ».
#
# ⛔⛔ LE CODE MESURÉ, LUI, ÉTAIT INTACT (`_afSetUnite`, `ef-qty-row` toujours dans
# `app.js`). *Seuls les témoins qui le protègent avaient disparu* — c'est-à-dire la panne
# la plus silencieuse qui soit : rien ne casse, rien ne rougit, et la prochaine régression
# sur ces deux écrans passerait sans un bruit.
#
# ⭐⭐ ET LE SIGNAL ÉTAIT LÀ, DANS MON PROPRE MESSAGE DE COMMIT : l'arbre d'avant portait
# **1949** témoins, j'ai livré **1939** en annonçant *« +4 »*. ***Un total qui BAISSE
# pendant qu'on ajoute des tests est un aveu, et je l'ai écrit sans le lire.***
# 👉 D'où ce contrôle : il compare le compte de `t(` de `runner.js` à celui de la version
# précédente et **refuse toute baisse**. La même leçon que le contrôle de l'archive
# (« 0 perdue ») — *on ne surveille pas ce qu'on ajoute, on surveille ce qui disparaît.*
#
# ⛔ POURQUOI UN COMPTE STATIQUE ET PAS LE TOTAL DE LA SUITE : le total demande de faire
# tourner Playwright pendant ~10 min. Celui-ci se lit dans le fichier, donc il tourne à
# **chaque** livraison — un contrôle qu'on saute parce qu'il est lent ne protège personne.
#
# ⚠️ ET IL EST FRANCHISSABLE EXPRÈS : retirer un témoin est parfois juste (R30 — un retrait
# volontaire s'écrit). Le contrôle demande alors la **raison** dans le message de commit,
# via `TEMOINS-RETIRES:`. *On ne peut plus effacer par accident — on peut seulement décider.*
RUNNER = racine / "tests" / "parcours" / "runner.js"
def _compte_temoins(txt):
    return len(re.findall(r"(?:^|[^A-Za-z0-9_$.])t\(\s*['\"]", txt))
try:
    if git_ok and RUNNER.exists():
        _av_txt = _git("show", "HEAD:tests/parcours/runner.js")
        if _av_txt:
            _av = _compte_temoins(_av_txt)
            _ap = _compte_temoins(RUNNER.read_text(encoding="utf-8"))
            _msg = _git("log", "-1", "--format=%B") or ""
            if _ap < _av and "TEMOINS-RETIRES:" not in _msg:
                print(f"❌ le runner a PERDU des témoins : {_av} → {_ap} ({_av - _ap} en moins)")
                print("   → une fusion a probablement écrasé le bloc de l'autre session.")
                print("   → vérifier : git show HEAD -- tests/parcours/runner.js | grep '^-.*BLOC'")
                print("   → si le retrait est VOULU, l'écrire : `TEMOINS-RETIRES: <raison>` "
                      "dans le message de commit (R30).")
                sys.exit(1)
            _fl = ("→" if _ap == _av
                   else (f"↑ +{_ap - _av}" if _ap > _av else f"↓ −{_av - _ap}, retrait déclaré"))
            print(f"✅ témoins du runner : {_ap} ({_fl})")
except SystemExit:
    raise
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage


# ── CONTRÔLE 11 — AUCUNE SESSION NE PERD SA LIGNE DANS LE JOURNAL DE PARTAGE ──
#
# ⚠️⚠️ POURQUOI IL EXISTE (31/08/2026) — c'est Michel qui l'a demandé, et il avait raison :
# *« c'est pas la première fois que tu me dis que les lignes risquent d'être écrasées,
# pourtant on avait fait le nécessaire »*.
#
# ⭐ CE QUI ÉTAIT VRAI : git n'écrase rien tout seul. Un push non-fast-forward ÉCHOUE —
# c'est le vrai verrou, et il a tenu à chaque fois. Ce que le journal de partage dit
# lui-même : *« il évite le doublon de TRAVAIL, git évite l'écrasement de CODE »*.
#
# ⛔⛔ CE QUI NE L'ÉTAIT PAS : le danger n'a jamais été git, c'est la RÉSOLUTION MANUELLE
# du conflit qui suit. Et elle est manuelle À CHAQUE FOIS, parce que les deux sessions
# insèrent leur ligne exactement au même endroit — la 1ʳᵉ ligne du même tableau.
# *Le protocole garantit qu'on se voit ; il ne garantit pas qu'on se recopie bien.*
# C'est déjà arrivé le 30/08 (ft-v1065) : ma fusion a effacé DEUX blocs de test de
# l'autre session — d'où le contrôle 10. Le journal, lui, n'était gardé par personne.
#
# ⭐⭐ ET LE TROU A ÉTÉ MESURÉ AVANT D'ÊTRE BOUCHÉ : en supprimant la ligne 🟡 de
# session-A du journal, `check_regles.py` sortait **VERT SUR TOUTE LA LIGNE** (sortie 0).
# Le contrôle 5 (« aucun document écrasé ») ne pouvait pas la voir : il exige une perte
# d'au moins **25 % du fichier ET 15 lignes**, or une ligne de ce tableau est UNE ligne.
# *Une chose surveillée, sa jumelle pas du tout* — le motif du 17/08, une fois de plus.
#
# 👉 CE QU'IL FAIT : il compte les lignes du tableau PAR SESSION et refuse toute BAISSE.
# Une ligne 🟡 qui devient 🟢 est une MODIFICATION sur place, pas une disparition : le
# compte ne bouge pas. Seule la perte se voit — *on ne surveille pas ce qu'on ajoute,
# on surveille ce qui disparaît* (la leçon de l'archive du 04/08).
#
# ⚠️ ET IL EST FRANCHISSABLE EXPRÈS (R30) : élaguer de vieilles lignes est légitime, mais
# ça se décide et ça s'écrit — `LIGNES-PARTAGE-RETIREES:` dans le message de commit.
PARTAGE = racine / "docs" / "JOURNAL-DE-PARTAGE.md"
def _compte_par_session(txt):
    """Lignes du tableau, par session. Une ligne = `| <état> | <quand> | <qui> | …`."""
    d = {}
    for m in re.finditer(r"^\|[^|\n]*\|[^|\n]*\|\s*(session-[^|(\n]*)", txt, re.M):
        qui = m.group(1).strip()
        d[qui] = d.get(qui, 0) + 1
    return d
try:
    if git_ok and PARTAGE.exists():
        _av_txt = _git("show", "HEAD:docs/JOURNAL-DE-PARTAGE.md")
        if _av_txt:
            _av = _compte_par_session(_av_txt)
            _ap = _compte_par_session(PARTAGE.read_text(encoding="utf-8"))
            _msg = _git("log", "-1", "--format=%B") or ""
            _perdus = {k: (v, _ap.get(k, 0)) for k, v in _av.items() if _ap.get(k, 0) < v}
            if _perdus and "LIGNES-PARTAGE-RETIREES:" not in _msg:
                for k, (a, b) in _perdus.items():
                    print(f"❌ le journal de partage a PERDU une ligne de {k} : {a} → {b}")
                print("   → une fusion a probablement écrasé la ligne de l'autre session.")
                print("   → vérifier : git show HEAD -- docs/JOURNAL-DE-PARTAGE.md | grep '^-| '")
                print("   → si le retrait est VOULU, l'écrire : "
                      "`LIGNES-PARTAGE-RETIREES: <raison>` dans le message de commit (R30).")
                sys.exit(1)
            print("✅ journal de partage : "
                  + " · ".join(f"{k} {v}" for k, v in sorted(_ap.items()))
                  + " (aucune ligne perdue)")
except SystemExit:
    raise
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage


print(f"✅ documents : aucun écrasement"
      + (f" ({len(suivis)} fichiers .md surveillés)" if git_ok and 'suivis' in dir() else
         " (⚠️ git indisponible — contrôle non effectué)"))


# ── CONTRÔLE 12 — L'ARCHIVE NE PORTE JAMAIS DEUX FOIS LA MÊME ENTRÉE ─────────
# ⚠️ POURQUOI IL MANQUAIT (01/09/2026, ft-v1092). Le contrôle 4 garde l'archive contre la
# DISPARITION d'une entrée — il est né du script qui l'avait écrasée en perdant 297 entrées.
# Il ne sait pas voir le défaut SYMÉTRIQUE : la même entrée écrite DEUX fois. Or c'est ce que
# fabrique une fusion par union entre deux sessions — le journal de partage l'écrit déjà
# (« une fusion par union ne ressuscite pas seulement ce qu'on a retiré : elle DÉDOUBLE ce
# qu'on a modifié »), mais rien ne le mesurait ici.
# MESURÉ le 01/09 : 7 entrées écrites deux fois (ft-v996, 1026, 1027, 1030, 1032, 1034, 1035),
# les deux copies identiques à des lignes vides près — 123 lignes de recopie. Le contrôle 4
# était vert pendant tout ce temps : aucune n'avait disparu.
# ⛔ POURQUOI C'EST GRAVE PLUTÔT QUE SALE : le jour où l'une des deux copies est corrigée et
# pas l'autre, l'archive raconte la même version de deux façons et rien ne dit laquelle fait
# foi (R2). Et un `grep ft-v1030` rend deux endroits.
# ⭐ L'EXCEPTION EST NOMMÉE, PAS IGNORÉE (R30) : ft-v887 a bien deux entrées, et ce ne sont
# PAS des copies — l'une est l'en-tête d'origine (avec les mots de Michel), l'autre le récit
# complet restitué le 19/08 sous un autre titre. Les fusionner perdrait les citations. On les
# garde, et on écrit pourquoi ici plutôt que de laisser le contrôle rouge à vie.
# ⚠️ Et le motif exige le tiret cadratin (`**ft-vNNN —`) : sans lui, une simple RÉFÉRENCE en
# gras en début de ligne (« **ft-v1009** pendant ce travail… ») compte comme une entrée. Mon
# premier détecteur l'a fait, et il a annoncé un 8ᵉ doublon qui n'existait pas.
try:
    _arch = (racine / "docs" / "JOURNAL-ARCHIVE.md").read_text(encoding="utf-8")
    _vus = re.findall(r"(?m)^\*\*(ft-v\d+) —", _arch)
    _EXCEPTIONS = {"ft-v887"}
    _dbl = sorted({v for v in _vus if _vus.count(v) > 1} - _EXCEPTIONS,
                  key=lambda x: int(x[5:]))
    if _dbl:
        print(f"❌ archive : {len(_dbl)} entrée(s) écrite(s) DEUX fois — "
              + ", ".join(_dbl))
        print("   → une fusion par union a dédoublé ces entrées. Vérifier que les deux copies "
              "sont identiques (aux lignes vides près) AVANT d'en retirer une : si elles "
              "diffèrent ailleurs, c'est un choix, pas un nettoyage — il revient à Michel.")
        sys.exit(1)
    print(f"✅ archive : {len(set(_vus))} entrées, aucune écrite deux fois"
          + (f" ({len(_EXCEPTIONS)} exception documentée)" if _EXCEPTIONS else ""))
except SystemExit:
    raise
except Exception:
    pass                                        # jamais bloquer sur un pépin d'outillage
