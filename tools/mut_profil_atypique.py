#!/usr/bin/env python3
"""Contrôle négatif de B-NPA02 (NUT-PROFIL-ATYPIQUE-02) : chaque mutation, posée sur une COPIE
de l'arbre, doit faire rougir tools/banc_profil_atypique.js. Le banc sain doit être vert."""
import os, shutil, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUTS = [
  ('M01 retour à bf<70 (le code d\'avant)', 'state.js', 'bf>0&&bf<=70&&isFinite(bw)', 'bf>0&&bf<70&&isFinite(bw)'),
  ('M02 retour à taille >100 (le code d\'avant)', 'state.js', 'v>=100 && v<230', 'v>100 && v<230'),
  ('M03 fausse raison « aucune mesure » sur un bilan trop ancien', 'state.js',
   "raison:'dernier bilan trop ancien ('+(isNaN(jours)?'?':jours)+' j)'", "raison:'aucune mesure de composition corporelle'"),
  ('M04 fausse raison « aucune mesure » sur une variation de poids', 'state.js',
   "raison:'ton poids a changé de plus de 5 % depuis ce bilan'", "raison:'aucune mesure de composition corporelle'"),
  ('M05 borne haute ouverte (bf<=100)', 'state.js', 'bf>0&&bf<=70&&isFinite(bw)', 'bf>0&&bf<=100&&isFinite(bw)'),
  ('M06 taille 230 acceptée', 'state.js', 'v>=100 && v<230', 'v>=100 && v<=230'),
  ('M07 _bfNavy : retour à bf<=2 (le code de 384aa6f6)', 'tracking.js', 'if(!isFinite(bf)||r<2||r>70)return null;', 'if(!isFinite(bf)||bf<=2||r>70)return null;'),
  ('M08 _bfNavy : retour à bf>70 sur le brut (le code de 1b834203)', 'tracking.js', 'if(!isFinite(bf)||r<2||r>70)return null;', 'if(!isFinite(bf)||r<2||bf>70)return null;'),
]
def banc(d):
  r = subprocess.run(['node', os.path.join(d, 'tools', 'banc_profil_atypique.js')], cwd=d, capture_output=True, text=True, timeout=300)
  return r.returncode, r.stdout
def copie():
  d = tempfile.mkdtemp(prefix='npa02_')
  shutil.copytree(ROOT, d, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git', 'node_modules'))
  return d
d = copie(); rc, out = banc(d); shutil.rmtree(d)
print('SAIN :', 'vert' if rc == 0 else 'ROUGE (%d)' % rc)
if rc != 0: print(out[-1500:]); sys.exit(1)
bad = 0
for nom, f, a, b in MUTS:
  d = copie(); p = os.path.join(d, f); s = open(p, encoding='utf8').read()
  if s.count(a) != 1: print('ANCRE MORTE', nom, s.count(a)); bad += 1; shutil.rmtree(d); continue
  open(p, 'w', encoding='utf8').write(s.replace(a, b))
  rc, out = banc(d); shutil.rmtree(d)
  rouges = [l for l in out.splitlines() if 'ROUGE' in l]
  ok = rc == 1 and rouges
  print(('OK   ' if ok else 'ÉCHEC') + ' ' + nom + ' → rc=%d, %d rouge(s)' % (rc, len(rouges)))
  if not ok: bad += 1
print('\n%d/%d mutations conformes' % (len(MUTS) - bad, len(MUTS)))
sys.exit(1 if bad else 0)
