#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — ISOLEMENT DU CLONE (D-084) : le banc tools/banc_clone_isolation.js sait-il ROUGIR ?
Chaque mutation casse UNE protection, sur une COPIE de clone/ (jamais le dépôt) ; le banc doit rougir, et sur le
témoin attendu. Un plantage du banc (code 2, pas de ligne de total) n'est jamais compté comme « attrapé ».
Usage : python3 tools/mut_clone_isolation.py"""
import os, re, shutil, subprocess, sys, tempfile
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLONE = os.path.join(RACINE, 'clone')
MUT = [
  ('MI1 cookie : le chemin /clone/ n\'est plus forcé (le cookie du clone tombe à la racine)', 'index.html',
   ".concat(['path=' + BASE]).join(';')", ".concat(['path=/']).join(';')", 'B-CLONE-12'),
  ('MI2 « tout vider » vide aussi la prod', 'index.html',
   "SP.clear      = function(){ var self = this; nos(this).forEach(function(kk){ r.call(self, kk); }); };",
   "SP.clear      = function(){ for (var i = len.call(this) - 1; i >= 0; i--) r.call(this, k.call(this, i)); };", 'B-CLONE-11'),
  ('MI3 IndexedDB : les bases ne sont plus préfixées', 'index.html',
   "IF.open = function(n, v){ return arguments.length > 1 ? op.call(this, P + n, v) : op.call(this, P + n); };",
   "IF.open = function(n, v){ return arguments.length > 1 ? op.call(this, n, v) : op.call(this, n); };", 'B-CLONE-14'),
  ('MI4 caches : « vider le cache » voit et supprime ceux de la prod', 'index.html',
   "CP['delete'] = function(n){ return cdel.call(this, PC + n); };\n      CP.keys = function(){ return miens(this).then(function(l){ return l.map(function(n){ return n.slice(PC.length); }); }); };",
   "CP['delete'] = function(n){ return cdel.call(this, n); };\n      CP.keys = function(){ return ck.call(this); };", 'B-CLONE-15'),
  ('MI5 réseau : plus rien n\'est coupé', 'index.html',
   "var permis = function(u){ try {", "var permis = function(u){ return true; try {", 'B-CLONE-08'),
  ('MI6 service worker du clone qui fait le ménage dans TOUS les caches', 'sw.js',
   "self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));",
   "self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => self.clients.claim())));", 'B-CLONE-15'),
  ('MI7 garde retirée : un script du clone s\'exécute dans un document sans isolement', 'state.js',
   "if(!window.__FT_CLONE_ISOLE__){", "if(false){", 'B-CLONE-20'),
  ('MI8 le clone ne filtre plus les événements « storage » de la prod', 'index.html',
   "if (this === window && type === 'storage' && typeof fn === 'function') {", "if (false) {", 'B-CLONE-22'),
]

def banc(dossier):
    p = subprocess.run(['node', os.path.join(RACINE, 'tools', 'banc_clone_isolation.js'), dossier], capture_output=True, text=True, timeout=900)
    sortie = p.stdout + p.stderr
    total = re.search(r'──── (\d+) OK / (\d+) rouge ────', sortie)
    rouges = re.findall(r'❌ ROUGE (B-CLONE-\d+)', sortie)
    return p.returncode, total, rouges, sortie

code, total, rouges, s = banc(CLONE)
print('  arbre sain : %s' % (total.group(0) if total else 'PAS DE TOTAL (code %d)' % code))
if code != 0 or not total: print(s[-2000:]); sys.exit(1)
conformes = 0
for nom, f, avant, apres, attendu in MUT:
    tmp = tempfile.mkdtemp(prefix='mutclone_')
    d = os.path.join(tmp, 'clone'); shutil.copytree(CLONE, d)
    chemin = os.path.join(d, f); t = open(chemin, encoding='utf-8').read()
    if t.count(avant) != 1:
        print('  INVALIDE %s — ancre trouvée %d fois' % (nom, t.count(avant))); shutil.rmtree(tmp); continue
    open(chemin, 'w', encoding='utf-8').write(t.replace(avant, apres))
    if f.endswith('.js') and subprocess.run(['node', '--check', chemin]).returncode != 0:
        print('  INVALIDE %s — syntaxe cassée' % nom); shutil.rmtree(tmp); continue
    code, total, rouges, s = banc(d)
    shutil.rmtree(tmp)
    if code == 2 or not total:
        print('  KO   %s — PLANTAGE (ne compte pas comme attrapé)' % nom); continue
    bon = attendu in rouges
    conformes += bon
    print('  %s %s — %d rouge(s), attendu %s : %s' % ('OK  ' if bon else 'KO  ', nom, len(rouges), attendu, ', '.join(rouges) or 'aucun'))
code, total, rouges, s = banc(CLONE)
print('  arbre sain rejoué à la fin : %s' % (total.group(0) if total else 'PAS DE TOTAL'))
print('%d/%d conformes' % (conformes, len(MUT)))
sys.exit(0 if conformes == len(MUT) and code == 0 else 1)
