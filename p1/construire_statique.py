#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONSTRUIT LA VERSION STATIQUE DE L'ESSAI iPHONE (sans ordinateur) — À LANCER UNIQUEMENT SUR UNE BRANCHE D'ESSAI JETABLE, JAMAIS SUR master.
Deux fichiers de l'app sont modifiés, et seulement eux :
  · constants.js : `DEFAULT_URL` = l'adresse /exec du projet de TEST (remplacement COMPTÉ : exactement 1) ;
  · index.html   : une Content-Security-Policy qui n'autorise QUE le projet de TEST (le Worker de Milo, Supabase, l'Apps Script de production sont refusés par le navigateur),
                   la configuration, et le panneau de mesure `p1/c1_panneau.js` (compte fictif @example.invalid, gestes, journal des envois, rapport).
Refuse l'adresse de PRODUCTION. Usage : python3 p1/construire_statique.py <URL /exec de TEST> [--extra-connect http://127.0.0.1:1234 ...]  (l'option sert seulement à l'auto-contrôle local)"""
import json, re, sys, os
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
exec_url = next((a for a in args if a.startswith('http')), '')
extra = [args[i + 1] for i, a in enumerate(args) if a == '--extra-connect']
if 'AKfycbxWUsEFIlmx' in exec_url: sys.exit('⛔ adresse de PRODUCTION : refus')
m = re.fullmatch(r'https://script\.google\.com/macros/s/([A-Za-z0-9_-]+)/exec', exec_url)
if not m and not extra: sys.exit('Usage : python3 p1/construire_statique.py https://script.google.com/macros/s/…/exec')
if os.path.exists(os.path.join(RACINE, '.git')) and os.popen('git -C "%s" rev-parse --abbrev-ref HEAD' % RACINE).read().strip() == 'master': sys.exit('⛔ jamais sur master')
connect = ["'self'"] + (['https://script.google.com/macros/s/%s/' % m.group(1), 'https://script.googleusercontent.com'] if m else []) + extra
csp = "; ".join(["default-src 'none'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "media-src 'self' data: blob:",
                 "connect-src " + " ".join(connect), "worker-src 'self' blob:", "manifest-src 'self'", "frame-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"])
p = os.path.join(RACINE, 'constants.js'); t = open(p, encoding='utf-8').read()
r = re.compile(r"const DEFAULT_URL='[^']+';"); assert len(r.findall(t)) == 1, 'DEFAULT_URL : occurrences != 1'
open(p, 'w', encoding='utf-8').write(r.sub("const DEFAULT_URL='%s';" % exec_url, t))
p = os.path.join(RACINE, 'index.html'); t = open(p, encoding='utf-8').read()
assert 'c1_panneau.js' not in t, 'déjà construit'
h = re.search(r'<head[^>]*>', t, re.I); assert h, '<head> introuvable'
ins = '\n<meta http-equiv="Content-Security-Policy" content="%s">\n<script>window.__C1_CFG=%s;</script>\n<script src="p1/c1_panneau.js"></script>\n' % (csp.replace('"', '&quot;'), json.dumps({'exec': exec_url}))
open(p, 'w', encoding='utf-8').write(t[:h.end()] + ins + t[h.end():])
print('OK : constants.js et index.html préparés pour', exec_url.replace(re.sub(r'.*/s/', '', exec_url).split('/')[0], '…'))
