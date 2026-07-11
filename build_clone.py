#!/usr/bin/env python3
# ─── Sync du clone de test (/clone/) depuis la PROD ───────────────────────────
# Régénère clone/*.js, clone/style.css et clone/index.html à partir des fichiers
# racine (prod), en :
#   • réécrivant les chemins d'assets en ../ (seulement si précédés d'une quote/
#     parenthèse → jamais dans un regex, cf. piège « machine/ »),
#   • réinjectant le shim d'isolation cl_ + le badge CLONE dans index.html,
#   • gardant clone/sw.js et clone/manifest.json tels quels (spécifiques clone).
# Usage : python3 build_clone.py
import re, os

ROOT = os.path.dirname(os.path.abspath(__file__))
def rp(*p): return os.path.join(ROOT, *p)

# Assets à préfixer ../  (dossiers + fichiers image à la racine)
TOKENS = ['exercises/','anatomy/','muscles/','guide/','accessoires/','fonts/','lib/','machine/',
          'force-tracker-logo-gray.png','force-tracker-logo-splash.gif',
          'force-tracker-logo-topbar.gif','force-tracker-logo-final.png',
          'logo.png','female-body.png']

def rewrite(txt):
    # Préfixe ../ UNIQUEMENT si le token est précédé d'une quote ' " ou d'une (
    # → attrape 'exercises/…', "logo.png", (guide/…) ; ignore un regex «  machine/i ».
    for tok in TOKENS:
        txt = re.sub(r'(?<=[\'"(])' + re.escape(tok), '../' + tok, txt)
    return txt

# 1) Récupérer le bloc shim (isolation cl_ + badge) depuis le clone actuel.
old = open(rp('clone','index.html'), encoding='utf-8').read()
m = re.search(r'<script>.*?__FT_CLONE__.*?</script>', old, re.S)
if not m:
    raise SystemExit('Shim clone introuvable dans clone/index.html — abandon (rien écrasé).')
shim = m.group(0)

# 2) index.html : prod → titre CLONE + shim inséré + chemins ../
prod = open(rp('index.html'), encoding='utf-8').read()
prod = prod.replace('<title>Force Tracker</title>', '<title>Force Tracker — CLONE TEST</title>', 1)
prod = prod.replace('<title>Force Tracker — CLONE TEST</title>',
                    '<title>Force Tracker — CLONE TEST</title>\n' + shim, 1)
open(rp('clone','index.html'), 'w', encoding='utf-8').write(rewrite(prod))

# 3) JS + CSS : copie avec réécriture des chemins
for f in ['constants.js','state.js','screens.js','log.js','setup.js',
          'tracking.js','coach.js','app.js','food-health.js','programs-lib.js','style.css']:
    if not os.path.exists(rp(f)):   # fichier propre à une autre branche → on saute
        print('  (ignoré, absent sur cette branche :', f, ')'); continue
    open(rp('clone',f), 'w', encoding='utf-8').write(rewrite(open(rp(f), encoding='utf-8').read()))

print('Clone régénéré : index.html + 8 JS + style.css (sw.js et manifest.json du clone conservés).')
