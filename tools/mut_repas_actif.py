#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des blocs B-CCCXXXVI et B-CCCXXXVII (Nutrition UX #1).

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

⭐⭐ CE QUE CE CONTROLE DOIT PROUVER. La correction tient en une absence : `openAddFood` ne
   recalcule plus le repas. Un temoin qui mesure une ABSENCE est le plus facile a tromper —
   il reste parfaitement vert si le parcours ne s execute pas du tout. Les mutations les plus
   utiles sont donc celles qui REMETTENT le recalcul sous ses differentes formes, et celles
   qui font ecrire la donnee dans un autre repas que celui affiche.

⭐ DEUX MUTATIONS DOIVENT RESTER VERTES : elles ne touchent que des COMMENTAIRES, en y citant
   les mots que les temoins cherchent (`_afMeal =`, `getHours()`, `setTimeout`). C est la seule
   facon de prouver qu on mesure le CODE et non la DOCUMENTATION — et le commentaire de cette
   correction cite abondamment tout ce qui est cherche (R30).

Usage : python3 tools/mut_repas_actif.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'

MUT = [
 # ══ LA CAUSE REVIENT, SOUS SES DIFFERENTES FORMES ═════════════════════════════
 ('M01  `openAddFood` recalcule a nouveau le repas depuis l heure (la cause exacte)',
  [('app.js', r"(function openAddFood\(\)\{)",
    r"\1\n  _afMeal = new Date().getHours()<11?'petitdej':'diner';")], 'ROUGE'),

 ('M02  le recalcul revient DEGUISE, via le proprietaire du defaut',
  [('app.js', r"(function openAddFood\(\)\{)",
    r"\1\n  _afMeal = _afMealDefautHoraire();")], 'ROUGE'),

 ('M03  le recalcul revient dans `addFoodVia`, un cran plus haut',
  [('app.js', r"(function addFoodVia\(mode\)\{\n  openAddFood\(\);)",
    r"\1\n  _afMeal = _afMealDefautHoraire();")], 'ROUGE'),

 ('M04  l etat repart avec un repas par defaut au lieu de `null`',
  [('app.js', r"let _afMeal=null;", "let _afMeal='petitdej';")], 'ROUGE'),

 # ══ LE PROPRIETAIRE EST CONTOURNE ═════════════════════════════════════════════
 ('M05  le formulaire ecrit la variable brute au lieu du proprietaire',
  [('app.js', r"const _e=Object\.assign\(\{date:_journalJourActif\(\),meal:_afMealActif\(\),",
    "const _e=Object.assign({date:_journalJourActif(),meal:_afMeal,")], 'ROUGE'),

 ('M06  la reprise d un aliment ecrit la variable brute',
  [('app.js', r"const _l=Object\.assign\(\{date:_journalJourActif\(\),meal:_afMealActif\(\),",
    "const _l=Object.assign({date:_journalJourActif(),meal:_afMeal,")], 'ROUGE'),

 ('M07  la DONNEE part dans un autre repas que celui affiche (onglet juste, ecriture fausse)',
  [('app.js', r"const _e=Object\.assign\(\{date:_journalJourActif\(\),meal:_afMealActif\(\),",
    "const _e=Object.assign({date:_journalJourActif(),meal:_afMealDefautHoraire(),")], 'ROUGE'),

 ('M08  les puces affichent la variable brute : rien de selectionne sans choix',
  [('app.js', r"    const sel=m\.k===_afMealActif\(\);", "    const sel=m.k===_afMeal;")],
  'ROUGE'),

 # ══ LE DEFAUT HORAIRE LUI-MEME ════════════════════════════════════════════════
 ('M09  la suggestion horaire disparait : tout le monde demarre au dejeuner',
  [('app.js', r"  return h<11\?'petitdej' : h<15\?'dejeuner' : h<18\?'collation' : 'diner';",
    "  return 'dejeuner';")], 'ROUGE'),

 ('M10  les bornes horaires sont decalees (matin -> dejeuner)',
  [('app.js', r"  return h<11\?'petitdej'", "  return h<3?'petitdej'")], 'ROUGE'),

 ('M11  le choix explicite est ignore par le proprietaire',
  [('app.js', r"  if\(_afMeal && FOOD_MEALS\.some\(m=>m\.k===_afMeal\)\) return _afMeal;\n", '')],
  'ROUGE'),

 ('M12  l echec n est plus ferme : un repas inconnu atteint le journal',
  [('app.js', r"  if\(_afMeal && FOOD_MEALS\.some\(m=>m\.k===_afMeal\)\) return _afMeal;",
    "  if(_afMeal) return _afMeal;")], 'ROUGE'),

 # ══ LE CHOIX MANUEL ═══════════════════════════════════════════════════════════
 ('M13  `setFoodMeal` n ecrit plus le choix (il ne fait que redessiner)',
  [('app.js', r"function setFoodMeal\(k\)\{_afMeal=k;_renderAfMealChips\(\);\}",
    "function setFoodMeal(k){_renderAfMealChips();}")], 'ROUGE'),

 ('M14  un second ecrivain du choix apparait ailleurs',
  [('app.js', r"(function _renderAfMealChips\(\)\{)",
    r"\1\n  _afMeal = _afMeal || 'petitdej';")], 'ROUGE'),

 # ══ LE PERIMETRE ══════════════════════════════════════════════════════════════
 ('M15  un `setTimeout` est ajoute autour du repas actif (l usine a gaz interdite)',
  [('app.js', r"function setFoodMeal\(k\)\{_afMeal=k;",
    "function setFoodMeal(k){_afMeal=k;setTimeout(()=>{_afMeal=null;},50);")], 'ROUGE'),

 ('M16  un des cinq repas change de cle',
  [('app.js', r"\{k:'collation2',", "{k:'collation_2',")], 'ROUGE'),

 ('M17  le plafond des compteurs IA est touche au passage',
  [('app.js', r"const FOOD_AI_FREE_LIMIT=25;", "const FOOD_AI_FREE_LIMIT=50;")], 'ROUGE'),

 # ══ LES DEUX QUI DOIVENT RESTER VERTES ════════════════════════════════════════
 ('M18  un COMMENTAIRE cite tout ce que les temoins cherchent',
  [('app.js', r"(function openAddFood\(\)\{)",
    r"/* _afMeal = new Date().getHours(); setTimeout(...) ; FOOD_AI_FREE_LIMIT=50 */\n\1")],
  'VERT'),

 ('M19  un COMMENTAIRE de ligne cite le recalcul horaire',
  [('app.js', r"(function _afMealActif\(\)\{)",
    r"// _afMeal = h<11?'petitdej':'diner'; et meal:_afMeal\n\1")], 'VERT'),
]


def controle(root):
    r = subprocess.run(  # noqa
        ['node', os.path.join(root, 'tools', 'banc_repas_actif.js')],
        capture_output=True, text=True, timeout=600, cwd=root,
        env=dict(os.environ, TZ='Europe/Paris'))
    lignes = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith(('!!', 'CRASH')) or ' rouge' in l]
    return r.returncode, lignes


base = tempfile.mkdtemp(prefix='ftrepas_')
tree = os.path.join(base, 'arbre')
subprocess.run(['git', 'clone', '--no-hardlinks', '-q', SRC, tree], check=True)
for f in ('app.js', 'state.js', 'screens.js', 'index.html',
          'tests/parcours/repas_actif.js', 'tools/banc_repas_actif.js'):
    d = os.path.join(tree, f)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy(os.path.join(SRC, f), d)

print('== CONTROLE SAIN, AVANT ==', flush=True)
code, lignes = controle(tree)
print('   code=%d  %s  %s' % (code, 'VERT' if code == 0 else 'ROUGE', lignes[-1:]), flush=True)
if code != 0:
    for l in lignes[:8]:
        print('   ', l[:170])
    sys.exit('le clone est deja rouge : rien de ce qui suit ne mesure quoi que ce soit.')

conformes, invalides = 0, 0
for nom, edits, attendu in MUT:
    orig, applique = {}, 0
    for fic, motif, remp in edits:
        p = os.path.join(tree, fic)
        if fic not in orig:
            orig[fic] = open(p, encoding='utf-8').read()
        courant = open(p, encoding='utf-8').read()
        neuf, n = re.subn(motif, remp, courant, count=1)
        if n == 1:
            open(p, 'w', encoding='utf-8').write(neuf)
            applique += 1
    if not applique:
        for fic, txt in orig.items():
            open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
        invalides += 1
        # /!\ UNE MUTATION QUI NE S APPLIQUE PAS RESSEMBLE TRAIT POUR TRAIT A UNE MUTATION
        #     QUI NE MORD PAS. Elle s annonce donc, au lieu de compter comme un verdict.
        print('\n%s\n   ANCRE INVALIDE — mutation NON APPLIQUEE' % nom, flush=True)
        continue
    code, lignes = controle(tree)
    for fic, txt in orig.items():
        open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
    verdict = 'VERT' if code == 0 else 'ROUGE'
    bon = (verdict == attendu)
    conformes += bon
    print('\n%s\n   -> [attendu %s, obtenu %s] %s'
          % (nom, attendu, verdict, 'OK' if bon else 'NON CONFORME'), flush=True)
    if not bon:
        for l in lignes[:5]:
            print('      ', l[:170], flush=True)

print('\n== CONTROLE SAIN, APRES ==', flush=True)
code, lignes = controle(tree)
print('   code=%d  %s  %s' % (code, 'VERT' if code == 0 else 'ROUGE', lignes[-1:]), flush=True)

print('\n%d/%d conformes · %d ancre(s) invalide(s)' % (conformes, len(MUT), invalides), flush=True)
shutil.rmtree(base, ignore_errors=True)
sys.exit(0 if (conformes == len(MUT) and invalides == 0 and code == 0) else 1)
