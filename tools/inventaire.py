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
# ⛔⛔ LE MENU SE LIT DANS LE MENU VIVANT, LIGNE PAR LIGNE (corrigé le 06/09/2026).
# L'ancienne extraction était `id="(menu-row-…)"[^>]*onclick=` sur le fichier ENTIER, et elle
# avait DEUX défauts mesurés :
#   ① elle exigeait un `id` → les 8 lignes du menu qui n'en ont pas étaient INVISIBLES.
#      Résultat : 6 entrées listées sur 14. *Un inventaire qui ne voit pas la moitié de ce
#      qu'il inventorie ne dit pas « il n'y a rien », il dit « il n'y a que ça » — et on le croit.*
#   ② `menu_label` cherchait `id="…".*?menu-row-lbl">` avec re.S SUR TOUT LE FICHIER : pour une
#      ligne sans libellé propre (la carte Profil, la ligne Premium), le `.*?` allait chercher le
#      libellé de la ligne SUIVANTE, n'importe où après. Mesuré : `menu-row-profil`,
#      `menu-row-premium` et `menu-row-miloknows` s'affichaient TOUS LES TROIS comme
#      « Ce que Milo sait de toi ».
# 👉 On découpe le tiroir VIVANT (`menu-drawer`) — surtout pas le vieux `#drawer` orphelin —
#    puis chaque ligne est lue DANS SES PROPRES BORNES. Le libellé ne peut plus venir d'ailleurs.
def _bloc_menu():
    i = HTML.find('id="menu-drawer"')
    if i < 0: return ''
    j = HTML.find('<!-- FOOTER -->', i)
    return HTML[i:j if j > 0 else len(HTML)]

MENU = _bloc_menu()
# Une LIGNE = un élément qui porte class="menu-row" ou un id="menu-row-…". On capture le tag
# d'ouverture ET ce qui suit jusqu'à la ligne suivante : le libellé vit dedans, pas ailleurs.
_bornes = [m.start() for m in re.finditer(r'<div[^>]*(?:class="menu-row"|id="menu-row-[a-z0-9-]+")', MENU)]
menus = []
for n, deb in enumerate(_bornes):
    fin = _bornes[n+1] if n+1 < len(_bornes) else len(MENU)
    row = MENU[deb:fin]
    mid = (re.search(r'id="(menu-row-[a-z0-9-]+)"', row) or [None, ''])[1] if re.search(r'id="(menu-row-[a-z0-9-]+)"', row) else ''
    # Le libellé, par ordre de fiabilité — et TOUJOURS pris dans `row`, jamais au-delà :
    #   ① la classe prévue pour ça ; ② à défaut, le premier texte du bloc `flex:1` SANS id
    #      (la carte Premium n'a pas de classe de libellé) ; ③ si le seul texte disponible porte
    #      un `id`, c'est que JS l'écrit à l'ouverture — on le DIT au lieu d'afficher la valeur
    #      de démonstration figée dans le HTML. *Écrire « Michel » dans un inventaire serait faux
    #      pour tout le monde sauf une personne.*
    lab = (re.search(r'class="menu-row-lbl">([^<]+)<', row)
        or re.search(r'class="menu-row-t">([^<]+)<', row)
        or re.search(r'flex:1;min-width:0;"[^>]*>\s*<div style="[^"]*">([^<]+)<', row))
    if lab:
        lab = lab.group(1).strip()
    elif re.search(r'flex:1;min-width:0;"[^>]*>\s*<div id="', row):
        lab = '_(libellé rempli à l\'ouverture)_'
    else:
        lab = ''
    act = re.search(r'onclick="([^"]+)"', row)
    menus.append((mid, act.group(1) if act else '', lab))
# Les RAYONS du menu (Ton suivi · Tes outils · Apprendre · L'application) — ft-v1139.
rayons = re.findall(r'<div class="sec">([^<]+)</div>', MENU)
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

# Titre lisible d'une ligne de menu — LU DANS LA LIGNE au moment de l'extraction (voir plus haut),
# jamais re-cherché dans le fichier entier : c'est ce qui donnait trois fois le même nom.
_LABELS = {mid: lab for mid, _fn, lab in menus if mid}
def menu_label(mid):
    return _LABELS.get(mid, '')

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
    # ⚠️ On indexe sur le LIBELLÉ, pas sur l'id : 8 lignes sur 14 n'ont pas d'id, et une clé vide
    #    les ferait toutes fusionner en une seule (le compte retomberait à 7).
    ("Lignes de menu",    [(m[0] or m[2]) for m in menus], lambda x: cited(x)),
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

# Où MÈNE une ligne — pas par quoi elle commence. `closeMenuDrawer();openProfil()` ouvre le
# PROFIL ; afficher `closeMenuDrawer` nommait la plomberie et cachait la destination, sur 8 lignes
# des 16. *Même défaut que les libellés : le document nommait la mauvaise chose.*
_PLOMBERIE = ('closeMenuDrawer', 'closeDrawer', 'closeDrawerContent')
def menu_cible(fn):
    appels = [a for a in re.findall(r'([A-Za-z_][A-Za-z0-9_.]*)\s*\(', fn or '') if a not in _PLOMBERIE]
    return appels[-1] if appels else (fn or '—')

table("☰ Menu (%s)" % (" · ".join(rayons) if rayons else "sans rayons"),
      [["**%s**" % (lab or mid or '(sans libellé)'),
        ("`%s`" % mid) if mid else "—",
        "`%s`" % menu_cible(fn),
        "✅" if cited(mid, lab) else "❓"] for mid, fn, lab in menus],
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
