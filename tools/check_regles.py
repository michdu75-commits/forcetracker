#!/usr/bin/env python3
"""Garde CLAUDE.md et docs/REGLES-OR.md synchronisés (scission du 28/07/2026).

CLAUDE.md porte les 12 règles d'or en UNE LIGNE ; docs/REGLES-OR.md porte le texte
complet et le pourquoi. Deux fichiers dérivent en quelques semaines si rien ne les
surveille — d'où ce script. Trois contrôles :

  1. les mêmes numéros de règle des deux côtés ;
  2. chaque ligne courte renvoie bien vers le fichier long ;
  3. le journal récent de CLAUDE.md ne dépasse pas le seuil (sinon : archiver).
  4. AUCUNE entrée de docs/JOURNAL-ARCHIVE.md n'a disparu.

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

if erreurs:
    print("❌ Fichiers de règles désynchronisés :")
    for e in erreurs:
        print("   -", e)
    sys.exit(1)

print(f"✅ {len(n_court)} règles d'or cohérentes · journal récent : {len(entrees)} entrées "
      f"(seuil {SEUIL_JOURNAL}) · CLAUDE.md {len(court.split())} mots")
print(f"✅ archive : {len(maintenant)} entrées, 0 perdue"
      + ("" if git_ok else " (⚠️ git indisponible — contrôle non effectué)"))
