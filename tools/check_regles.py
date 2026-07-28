#!/usr/bin/env python3
"""Garde CLAUDE.md et docs/REGLES-OR.md synchronisés (scission du 28/07/2026).

CLAUDE.md porte les 12 règles d'or en UNE LIGNE ; docs/REGLES-OR.md porte le texte
complet et le pourquoi. Deux fichiers dérivent en quelques semaines si rien ne les
surveille — d'où ce script. Trois contrôles :

  1. les mêmes numéros de règle des deux côtés ;
  2. chaque ligne courte renvoie bien vers le fichier long ;
  3. le journal récent de CLAUDE.md ne dépasse pas le seuil (sinon : archiver).

Sortie 1 si un contrôle échoue.  Lancer : python3 tools/check_regles.py
"""
import re, sys, pathlib

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

if erreurs:
    print("❌ Fichiers de règles désynchronisés :")
    for e in erreurs:
        print("   -", e)
    sys.exit(1)

print(f"✅ {len(n_court)} règles d'or cohérentes · journal récent : {len(entrees)} entrées "
      f"(seuil {SEUIL_JOURNAL}) · CLAUDE.md {len(court.split())} mots")
