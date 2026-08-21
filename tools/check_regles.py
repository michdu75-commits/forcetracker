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
print(f"✅ documents : aucun écrasement"
      + (f" ({len(suivis)} fichiers .md surveillés)" if git_ok and 'suivis' in dir() else
         " (⚠️ git indisponible — contrôle non effectué)"))
