#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""🧪 GÉNÉRATEUR DU CLONE DE TEST UX — clone/ (décision de Michel du 17/10/2026, D-084).

Le clone est l'environnement de test UX : une copie du CODE d'une branche, servie sous /clone/,
STRICTEMENT séparée de la prod (même domaine, donc isolée par tools/clone_shim.js).
⛔ On ne l'édite jamais à la main : on le RÉGÉNÈRE depuis une branche, en une commande.

    python3 tools/clone_build.py                       # depuis claude/ux-seance-01
    python3 tools/clone_build.py <branche|commit>      # depuis une autre source

Ce qu'il fait, et rien d'autre :
  · copie les fichiers de CODE de la source (index.html, style.css, les scripts chargés par
    index.html, manifest.json) — les images, données, polices et bibliothèques (≈ 80 Mo) restent
    à la racine et sont lues par le service worker du clone et par le shim ;
  · injecte le shim d'isolement en tête du <head> (juste après <meta charset>) ;
  · pose en tête de CHAQUE script une garde : sans isolement vérifié, le script ne démarre pas ;
  · réécrit les chemins statiques (src / href / url()) qui ne sont pas au clone vers « ../ » ;
  · écrit un service worker PROPRE au clone (aucun cache, aucune suppression de cache) ;
  · écrit clone/CLONE-SOURCE.json (branche, commit, date) pour savoir ce qui est en ligne.
⛔ Il ne touche à AUCUN fichier de la prod.
"""
import json, os, re, shutil, subprocess, sys, datetime

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'clone')
REF = sys.argv[1] if len(sys.argv) > 1 else 'claude/ux-seance-01'


def git(*a):
    return subprocess.run(['git', '-C', RACINE] + list(a), check=True, capture_output=True).stdout


def lire(sha, chemin):
    return git('show', '%s:%s' % (sha, chemin)).decode('utf-8')


sha = git('rev-parse', REF + '^{commit}').decode().strip()
index = lire(sha, 'index.html')
scripts = re.findall(r'<script[^>]*\ssrc="([^"]+)"', index)
assert scripts and all('/' not in s and s.endswith('.js') for s in scripts), scripts
PROPRES = ['', 'index.html', 'style.css', 'manifest.json', 'sw.js'] + scripts
SOURCE = {'ref': REF, 'sha': sha, 'genere_le': datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

GARDE = ("/* 🧪 CLONE DE TEST — garde posée par tools/clone_build.py : sans isolement VÉRIFIÉ, ce script ne démarre pas. */\n"
         "if(!window.__FT_CLONE_ISOLE__){try{if(window.__FT_CLONE__){document.documentElement.innerHTML="
         "'<body style=\"font:16px system-ui,sans-serif;padding:24px;background:#111;color:#fff\">"
         "<h3>Clone de test : isolation non garantie sur ce navigateur</h3><p>'+String(window.__FT_CLONE_ECHECS__||'')+"
         "'</p><p>Le clone ne démarre pas : tes vraies données ne sont pas touchées.</p></body>';}"
         "else{document.documentElement.innerHTML='';location.replace('../');}}catch(e){}"
         "throw new Error('clone : isolation absente');}\n")


def hors_clone(url):
    """Un chemin relatif qui ne désigne pas un fichier du clone → il vit à la racine (« ../ »)."""
    if not url or re.match(r'^(#|%|[a-z][a-z0-9+.-]*:|/|\.\./)', url, re.I):   # %23 = « # » d'un SVG intégré
        return False
    return url.split('?')[0].split('#')[0].lstrip('./') not in PROPRES


def reecrire_html(h):
    return re.sub(r'(\s(?:src|href)=")([^"]*)(")', lambda m: m.group(1) + ('../' + m.group(2).lstrip('./') if hors_clone(m.group(2)) else m.group(2)) + m.group(3), h)


def reecrire_css(c):
    def f(m):
        q, u = m.group(1), m.group(2)
        return 'url(%s%s%s)' % (q, ('../' + u.lstrip('./')) if hors_clone(u) else u, q)
    return re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', f, c)


shim = open(os.path.join(RACINE, 'tools', 'clone_shim.js'), encoding='utf-8').read()
shim = shim.replace('__CLONE_PROPRES__', json.dumps(PROPRES)).replace('__CLONE_SOURCE__', json.dumps(SOURCE))
assert '__CLONE_' not in shim

if os.path.exists(SORTIE):
    shutil.rmtree(SORTIE)
os.makedirs(SORTIE)

h = reecrire_html(index)
m = re.search(r'<meta charset="[^"]*"\s*/?>', h)
assert m, 'meta charset introuvable'
h = h[:m.end()] + '\n<script>\n' + shim + '</script>' + h[m.end():]
h = re.sub(r'<title>[^<]*</title>', '<title>Force Tracker — CLONE DE TEST</title>', h, count=1)
assert h.index('<script') == m.end() + 1, 'le shim doit être le PREMIER script de la page'
open(os.path.join(SORTIE, 'index.html'), 'w', encoding='utf-8').write(h)

open(os.path.join(SORTIE, 'style.css'), 'w', encoding='utf-8').write(reecrire_css(lire(sha, 'style.css')))
for s in scripts:
    open(os.path.join(SORTIE, s), 'w', encoding='utf-8').write(GARDE + lire(sha, s))

man = json.loads(lire(sha, 'manifest.json'))
man.update({'name': 'Force Tracker — CLONE DE TEST', 'short_name': 'FT clone', 'start_url': './', 'scope': './'})
for ic in man.get('icons', []):
    ic['src'] = '../' + ic['src'].lstrip('./')
open(os.path.join(SORTIE, 'manifest.json'), 'w', encoding='utf-8').write(json.dumps(man, ensure_ascii=False, indent=2) + '\n')

SW = """/* 🧪 SERVICE WORKER DU CLONE DE TEST — généré par tools/clone_build.py, ne pas éditer.
   Portée : le dossier du clone seulement. ⛔ AUCUN cache, et il ne supprime JAMAIS un cache :
   ceux de la prod ne sont pas les siens. Les fichiers du clone viennent toujours du réseau
   (une mise à jour du clone se voit tout de suite) ; les ressources de la prod (images,
   données, polices, bibliothèques) sont lues à la racine ; aucune PAGE de la prod n'est
   servie sous /clone/ (elle tournerait sans l'isolement). */
const PROPRES = new Set(%s);
const BASE = self.location.pathname.replace(/[^\\/]*$/, '');
const PARENT = BASE.replace(/[^\\/]+\\/$/, '');
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  const rel = url.pathname.slice(BASE.length);
  if (PROPRES.has(rel)) { e.respondWith(fetch(e.request, { cache: 'no-store' })); return; }
  if (e.request.mode === 'navigate' || /\\.html?$/i.test(rel)) {
    e.respondWith(new Response('Page absente du clone de test.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    return;
  }
  e.respondWith(fetch(url.origin + PARENT + rel + url.search));
});
""" % json.dumps(PROPRES)
open(os.path.join(SORTIE, 'sw.js'), 'w', encoding='utf-8').write(SW)

def empreinte():
    import hashlib
    h = hashlib.sha256()
    for f in sorted(os.listdir(SORTIE)):
        p = os.path.join(SORTIE, f)
        if os.path.isfile(p) and f != 'CLONE-SOURCE.json':
            h.update(f.encode() + b'\0' + open(p, 'rb').read() + b'\0')
    return h.hexdigest()


# ⛔ LE TAMPON : le banc d'isolement tourne sur le clone qui vient d'être généré ; s'il n'est pas vert, PAS de tampon,
#    et tools/check_regles.py refusera la livraison (condition de Michel : isolement démontré, sinon STOP).
info = dict(SOURCE, fichiers=PROPRES[1:])
p = subprocess.run(['node', os.path.join(RACINE, 'tools', 'banc_clone_isolation.js'), SORTIE], capture_output=True, text=True)
total = re.search(r'──── (\d+ OK / \d+ rouge) ────', p.stdout)
if p.returncode == 0 and total and total.group(1).endswith(' 0 rouge'):
    info.update(banc_isolation=total.group(1), empreinte=empreinte())
else:
    info.update(banc_isolation='ROUGE OU INTERROMPU — clone NON vérifié')
open(os.path.join(SORTIE, 'CLONE-SOURCE.json'), 'w', encoding='utf-8').write(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
print('clone/ généré depuis %s (%s) : %d fichiers de code · banc d\'isolement : %s' % (REF, sha[:8], len(PROPRES) - 1, info['banc_isolation']))
if 'empreinte' not in info:
    print(p.stdout[-3000:] + p.stderr[-1000:])
    sys.exit(1)
