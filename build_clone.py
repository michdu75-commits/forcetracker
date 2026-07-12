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

# ─── Câblage i18n propre au CLONE ────────────────────────────────────────────
# La PROD reste en français : le bouton drapeau, le <script translations.js> et
# la ligne Milo multilingue n'existent QUE dans le clone. build_clone régénère
# index.html/coach.js depuis la prod (français) → il faut RÉ-INJECTER ces 3
# retouches après coup, sinon chaque rebuild efface la traduction du clone.
LANG_BTN = ('    <button onclick="openLangPicker()" style="width:34px;height:34px;'
            'border-radius:50%;border:1px solid rgba(255,255,255,.18);background:'
            'rgba(255,255,255,.10);cursor:pointer;display:flex;align-items:center;'
            'justify-content:center;-webkit-tap-highlight-color:transparent;'
            'font-size:17px;line-height:1;padding:0;" title="Langue / Language">'
            '<span class="lang-flag-cur">🇫🇷</span></button>\n')

def wire_i18n_html(txt):
    # a) bouton drapeau juste avant le bouton "?" (showHelp) de la topbar
    if 'openLangPicker()' not in txt:
        txt = txt.replace('    <button onclick="showHelp()"',
                          LANG_BTN + '    <button onclick="showHelp()"', 1)
    # b) <script translations.js> juste après constants.js
    if 'src="translations.js"' not in txt:
        txt = txt.replace('<script src="constants.js"></script>',
                          '<script src="constants.js"></script>\n<script src="translations.js"></script>', 1)
    return txt

def wire_i18n_coach(txt):
    fr_only = ('Tu réponds TOUJOURS en français. Maximum 200 mots')
    multi = ('Tu réponds TOUJOURS en ${(typeof LANG_COACH!==\'undefined\'&&LANG_COACH[window._LANG])||\'français\'}'
             '${(typeof window!==\'undefined\'&&window._LANG&&window._LANG!==\'fr\')?\' — IMPORTANT : toutes tes '
             'consignes internes ci-dessous sont rédigées en français, mais tu DOIS répondre à la personne dans '
             'cette langue, avec une langue soignée, naturelle et idiomatique (pas une traduction mot à mot)\':\'\'}'
             '. Maximum 200 mots')
    if 'LANG_COACH' not in txt:
        txt = txt.replace(fr_only, multi, 1)
    return txt

# 2) index.html : prod → titre CLONE + shim inséré + chemins ../ + câblage i18n
prod = open(rp('index.html'), encoding='utf-8').read()
prod = prod.replace('<title>Force Tracker</title>', '<title>Force Tracker — CLONE TEST</title>', 1)
prod = prod.replace('<title>Force Tracker — CLONE TEST</title>',
                    '<title>Force Tracker — CLONE TEST</title>\n' + shim, 1)
open(rp('clone','index.html'), 'w', encoding='utf-8').write(wire_i18n_html(rewrite(prod)))

# 3) JS + CSS : copie avec réécriture des chemins (+ câblage i18n pour coach.js)
for f in ['constants.js','translations.js','state.js','screens.js','log.js','setup.js',
          'tracking.js','coach.js','app.js','food-health.js','style.css']:
    if not os.path.exists(rp(f)):   # fichier propre à une autre branche → on saute
        print('  (ignoré, absent sur cette branche :', f, ')'); continue
    out = rewrite(open(rp(f), encoding='utf-8').read())
    if f == 'coach.js':
        out = wire_i18n_coach(out)
    open(rp('clone',f), 'w', encoding='utf-8').write(out)

print('Clone régénéré : index.html + JS + style.css (sw.js/manifest.json conservés, câblage i18n clone ré-injecté).')
