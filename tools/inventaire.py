#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère docs/INVENTAIRE.md — « qu'est-ce qui existe dans l'app AUJOURD'HUI ? »

POURQUOI CE SCRIPT EXISTE (27/07/2026)
Le journal des versions répond à « que s'est-il passé, quand, pourquoi ? ».
Il répond MAL à « est-ce que ça existe déjà ? » — pour le savoir, il faut lire
600 entrées chronologiques. Le 27/07, un audit a conclu à tort qu'une
fonctionnalité manquait (l'import de prise de sang) : elle était dans le code,
invisible dans la doc. Michel a dû corriger de mémoire.

PRINCIPE : l'inventaire est DÉRIVÉ DU CODE, jamais écrit à la main.
Un inventaire écrit à la main redevient faux en trois semaines (c'est arrivé au
fichier de contexte). Un inventaire généré ne peut pas mentir sur ce qui existe.

USAGE :  python3 tools/inventaire.py
         (à relancer à chaque livraison — ça prend une seconde)
"""
import io, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rp(*p): return os.path.join(ROOT, *p)
def rd(f):
    try: return io.open(rp(f), encoding='utf-8', errors='ignore').read()
    except Exception: return ''

HTML  = rd('index.html')
JS    = {f: rd(f) for f in ('app.js','coach.js','constants.js','log.js','screens.js',
                            'setup.js','state.js','tracking.js','food-health.js')}
BACK  = rd('Code.js') + rd('worker.js')
# La doc où l'on cherche si une chose est mentionnée (pour repérer les orphelines)
DOCS  = (rd('CLAUDE.md') + rd('docs/JOURNAL-ARCHIVE.md') + rd('IDEES-FUTURES.md')
         + rd('DOSSIER-ATHLETE-SUIVI.md') + rd('RETOURS-TESTEURS.md')
         + rd('docs/GALERES-ET-LECONS.md')).lower()

def cited(*names):
    """Une chose est 'documentée' si l'un de ses noms apparaît dans la doc."""
    return any(n and n.lower() in DOCS for n in names)

def uniq(seq):
    seen, out = set(), []
    for x in seq:
        if x not in seen: seen.add(x); out.append(x)
    return out

# ── Extraction ────────────────────────────────────────────────────────────────
# Un ÉCRAN = un <div class="screen" id="s-…">, pas n'importe quel id commençant par s-
screens = uniq(re.findall(r'<div[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*id="(s-[a-z0-9-]+)"', HTML)
             + re.findall(r'<div[^>]*id="(s-[a-z0-9-]+)"[^>]*class="[^"]*\bscreen\b[^"]*"', HTML))
menus   = uniq(re.findall(r'id="(menu-row-[a-z0-9-]+)"[^>]*onclick="([^"]+)"', HTML))
overlays= uniq(re.findall(r'class="overlay"\s+id="([a-z0-9-]+)"', HTML))
actions = sorted(set(re.findall(r"action\s*===?\s*['\"]([a-zA-Z][a-zA-Z0-9_]*)['\"]", BACK))
                 | set(re.findall(r"case\s*['\"]([a-zA-Z][a-zA-Z0-9_]*)['\"]\s*:", BACK)))
actions = [a for a in actions if len(a) > 3]

# Fonctions « publiques » (sans _ initial) = surface fonctionnelle appelée par l'UI
funcs = {}
for f, src in JS.items():
    for m in re.findall(r'^function ([a-zA-Z][a-zA-Z0-9_]*)\s*\(', src, re.M):
        funcs.setdefault(m, f)

# Ce qui a été ANNONCÉ aux utilisateurs (donc censé exister)
wn = re.findall(r"\{v:(\d+),\s*ic:'([^']*)',\s*t:'((?:[^'\\]|\\.)*)'", rd('constants.js'))

# Titre lisible d'une ligne de menu
def menu_label(mid):
    m = re.search(r'id="%s".*?class="menu-row-lbl">([^<]+)<' % re.escape(mid), HTML, re.S)
    return m.group(1).strip() if m else ''

# ── Rendu ─────────────────────────────────────────────────────────────────────
try:
    ver = re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", rd('sw.js')).group(1)
except Exception:
    ver = '?'
try:
    date = subprocess.run(['git','log','-1','--format=%ad','--date=short'],
                          capture_output=True, text=True, cwd=ROOT).stdout.strip()
except Exception:
    date = ''

L = []
w = L.append
w("# 📒 Inventaire — ce qui existe dans Force Tracker")
w("")
w("> ⚙️ **FICHIER GÉNÉRÉ — ne pas éditer à la main.** Régénérer avec `python3 tools/inventaire.py`.")
w("> Généré depuis **le code** (version `%s`%s)." % (ver, (", dernier commit "+date) if date else ""))
w(">")
w("> **À quoi il sert** : répondre à *« est-ce que c'est déjà construit ? »*. Le journal des versions")
w("> (`CLAUDE.md`, `docs/JOURNAL-ARCHIVE.md`) répond à *« que s'est-il passé, quand, pourquoi ? »* —")
w("> ce n'est pas la même question, et il y répond mal (600 entrées chronologiques à lire).")
w(">")
w("> ⚠️ **Colonne « doc »** : ✅ = le nom apparaît quelque part dans la documentation · ")
w("> ❓ = **absent de toute la doc**. Un ❓ n'est pas un bug : c'est une chose qui existe dans le code")
w("> mais dont personne (ni humain ni IA) ne sait qu'elle existe en lisant la doc. C'est précisément")
w("> ce qui a fait conclure à tort, le 27/07, qu'une fonctionnalité manquait.")
w("")

def table(title, rows, headers, note=''):
    w("## %s" % title)
    if note: w(""); w(note)
    w("")
    w("| " + " | ".join(headers) + " |")
    w("|" + "|".join(["---"]*len(headers)) + "|")
    for r in rows: w("| " + " | ".join(r) + " |")
    w("")

w("## 📊 Vue d'ensemble")
w("")
w("| Élément | Nombre | Absents de la doc |")
w("|---|---|---|")
sets = [
    ("Écrans",            screens,               lambda x: cited(x)),
    ("Lignes de menu",    [m[0] for m in menus], lambda x: cited(x, menu_label(x))),
    ("Fenêtres (modales)",overlays,              lambda x: cited(x)),
    ("Actions du serveur",actions,               lambda x: cited(x, 'handle%s_' % (x[0].upper()+x[1:]))),
]
for name, items, ok in sets:
    miss = [i for i in items if not ok(i)]
    w("| %s | %d | %d |" % (name, len(items), len(miss)))
w("| Fonctions JS | %d | — |" % len(funcs))
w("| Nouveautés annoncées | %d | — |" % len(wn))
w("")

table("🖥️ Écrans",
      [["`%s`" % s, "✅" if cited(s) else "❓"] for s in screens],
      ["Écran", "doc"])

table("☰ Menu",
      [["**%s**" % (menu_label(mid) or mid), "`%s`" % mid, "`%s`" % fn.split('(')[0].split(';')[-1],
        "✅" if cited(mid, menu_label(mid)) else "❓"] for mid, fn in menus],
      ["Libellé", "id", "ouvre", "doc"])

table("🔌 Actions du serveur (backend)",
      [["`%s`" % a, "✅" if cited(a, 'handle%s_' % (a[0].upper()+a[1:])) else "❓"] for a in actions],
      ["Action", "doc"],
      "Chaque action = une capacité côté serveur (IA, sauvegarde, import, premium…).")

table("🪟 Fenêtres (modales)",
      [["`%s`" % o, "✅" if cited(o) else "❓"] for o in overlays],
      ["Overlay", "doc"])

w("## ✨ Nouveautés annoncées aux utilisateurs")
w("")
w("Ce qui a été **annoncé dans la pop-up « Quoi de neuf »** — donc censé exister et être visible.")
w("")
w("| # | | Nouveauté |")
w("|---|---|---|")
for v, ic, t in sorted(wn, key=lambda x: -int(x[0])):
    w("| %s | %s | %s |" % (v, ic, t.replace("\\'", "'")))
w("")

w("---")
w("")
w("*Régénéré par `tools/inventaire.py`. Si une ligne ❓ correspond à une vraie fonctionnalité,")
w("lui écrire une entrée de journal — c'est le geste qui manquait (règle R23).*")

io.open(rp('docs/INVENTAIRE.md'), 'w', encoding='utf-8').write("\n".join(L) + "\n")

tot_miss = sum(len([i for i in items if not ok(i)]) for _, items, ok in sets)
print("docs/INVENTAIRE.md généré — %d écrans · %d menus · %d modales · %d actions · %d fonctions"
      % (len(screens), len(menus), len(overlays), len(actions), len(funcs)))
print("Absents de la doc : %d" % tot_miss)
