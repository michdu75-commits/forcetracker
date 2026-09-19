#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des blocs B-CCCXXXIV et B-CCCXXXV (phase 3.1).

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

⭐⭐ CE QUE CE CONTROLE DOIT PROUVER ICI, ET QUI EST PARTICULIER A CETTE PASSE. Le chantier
   touche DEUX natures de chose : des DECISIONS (le registre, une donnee) et un COMPORTEMENT
   (trois compteurs et leur migration). Les mutations les plus utiles ne sont pas celles qui
   cassent la forme du registre — la phase 3 les a deja eprouvees — mais celles qui font
   DIVERGER la decision du code : un pot qui revient sur l ancien compteur, une migration qui
   s applique deux fois, un garde qui retombe sur la capacite d a cote.

⭐ TROIS MUTATIONS DOIVENT RESTER VERTES : elles ne touchent que des COMMENTAIRES, en y
   citant precisement les mots que les temoins cherchent (`S.foodAiUses =`, `regenCount:0`,
   `FOOD_LABEL_LIMIT = 25`, `NON_DECIDEE`). C est la seule facon de prouver qu on mesure le
   CODE et non la DOCUMENTATION — et les commentaires de cette passe citent abondamment tout
   ce qui est cherche (R30 : la raison s ecrit a cote du code).

Usage : python3 tools/mut_pots_nutrition.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'

MUT = [
 # ══ LES TROIS ARBITRAGES ══════════════════════════════════════════════════════
 ('M01  `milo.debrief` redevient NON_DECIDEE (la decision est perdue)',
  [('capacites-ia.js', r"(id: 'milo\.debrief'[\s\S]{0,90}?)politique: 'PREMIUM'",
    r"\1politique: 'NON_DECIDEE'")], 'ROUGE'),

 ('M02  `milo.debrief` est inscrite FREE (la faute INVERSE : fermer en inventant)',
  [('capacites-ia.js', r"(id: 'milo\.debrief'[\s\S]{0,90}?)politique: 'PREMIUM'",
    r"\1politique: 'FREE'")], 'ROUGE'),

 ('M03  `nutrition.mealPlanImport.ai` est inscrite FREE',
  [('capacites-ia.js', r"(id: 'nutrition\.mealPlanImport\.ai'[\s\S]{0,140}?)politique: 'PREMIUM'",
    r"\1politique: 'FREE'")], 'ROUGE'),

 ('M04  le NOMBRE de generations devient « illimite » (une decision inventee)',
  [('capacites-ia.js', r"quotaType: 'non_decide'", "quotaType: 'illimite'")], 'ROUGE'),

 ('M05  le perimetre jour/semaine disparait du registre',
  [('capacites-ia.js', r"perimetre: \{ free: 'jour', premium: 'semaine' \},\n", '')], 'ROUGE'),

 ('M06  le perimetre devient semaine/semaine (le gratuit recoit le payant)',
  [('capacites-ia.js', r"perimetre: \{ free: 'jour', premium: 'semaine' \}",
    "perimetre: { free: 'semaine', premium: 'semaine' }")], 'ROUGE'),

 ('M07  une 22e capacite est creee pour le plan de la SEMAINE',
  [('capacites-ia.js', r"(\{\n    id: 'nutrition\.mealPlan\.regen')",
    r"{ id: 'nutrition.mealPlan.week', module: 'Nutrition', declenchement: 'manuel',\n"
    r"    emploieIA: true, politique: 'PREMIUM', etatCode: 'FREE', gratuits: 0,\n"
    r"    quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,\n"
    r"    actionServeur: 'generateMealPlan', porteAppsScript: 'generateMealPlan',\n"
    r"    serveurApplique: false, decisionSource: 'x', decisionDate: 'x', ecart: null,\n"
    r"    notes: null },\n  \1")], 'ROUGE'),

 ('M08  `NON_DECIDEE` est retiree des politiques declarees',
  [('capacites-ia.js', r", 'NON_DECIDEE'\]", "]")], 'ROUGE'),

 ('M09  `non_decide` est retire des formes de quota declarees',
  [('capacites-ia.js', r", 'non_decide'\]", "]")], 'ROUGE'),

 # ══ LE POT NUTRITION — LE REGISTRE ════════════════════════════════════════════
 ('M10  le repli code-barres redevient FREEMIUM/25 dans le registre',
  [('capacites-ia.js',
    r"(id: 'nutrition\.barcode\.aiFallback'[\s\S]{0,200}?)politique: 'PREMIUM', etatCode: 'FREEMIUM',\n"
    r"    gratuits: 0, quotaType: 'zero', quotaValeur: 0",
    r"\1politique: 'FREEMIUM', etatCode: 'FREEMIUM',\n"
    r"    gratuits: 25, quotaType: 'usage_total', quotaValeur: 25")], 'ROUGE'),

 ('M11  un ecart est MASQUE pour faire joli (etatCode aligne sur la politique)',
  [('capacites-ia.js', r"(id: 'milo\.debrief'[\s\S]{0,120}?)etatCode: 'FREE'",
    r"\1etatCode: 'PREMIUM'")], 'ROUGE'),

 # ══ LE POT NUTRITION — LE CODE ════════════════════════════════════════════════
 ('M12  l etiquette revient consommer l ANCIEN pot commun',
  [('app.js', r"    _foodAiConsomme\('nutrition\.label\.ai'\);",
    "    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();}")], 'ROUGE'),

 ('M13  deux capacites repartagent le MEME champ',
  [('app.js', r"'nutrition\.mealEstimate\.ai':    'foodMealEstimateAiUses',",
    "'nutrition.mealEstimate.ai':    'foodLabelAiUses',")], 'ROUGE'),

 ('M14  `_foodAiConsomme` incremente les TROIS pots a la fois',
  [('app.js', r"  S\[ch\]=\(parseInt\(S\[ch\],10\)\|\|0\)\+1;",
    "  for(var _k in FOOD_AI_POTS){var _c=FOOD_AI_POTS[_k];"
    "S[_c]=(parseInt(S[_c],10)||0)+1;}")], 'ROUGE'),

 ('M15  la garde « Premium ne consomme pas » disparait',
  [('app.js', r"  if\(S\.premium\)return;                       ", "  ")], 'ROUGE'),

 ('M16  le repli code-barres consomme le pot de l ETIQUETTE',
  [('app.js', r"    _foodAiConsomme\('nutrition\.barcode\.aiFallback'\);",
    "    _foodAiConsomme('nutrition.label.ai');")], 'ROUGE'),

 ('M17  le garde du repas decrit interroge le pot de l etiquette',
  [('app.js', r"    if\(_foodAiEpuise\('nutrition\.mealEstimate\.ai'\)\)\{showFoodWall\(\);return;\}",
    "    if(_foodAiEpuise('nutrition.label.ai')){showFoodWall();return;}")], 'ROUGE'),

 ('M18  une capacite inconnue recoit un pot PLEIN (echec OUVERT)',
  [('app.js', r"  const ch=_foodAiChamp\(cap\); if\(!ch\)return 0;",
    "  const ch=_foodAiChamp(cap); if(!ch)return FOOD_AI_FREE_LIMIT;")], 'ROUGE'),

 ('M19  la note de l ecran perd le nom de sa capacite',
  [('app.js', r"_foodAiLeft\('nutrition\.mealEstimate\.ai'\)", "_foodAiLeft()")], 'ROUGE'),

 ('M20  une limite JUMELLE apparait (deux nombres 25 au lieu d un)',
  [('app.js', r"(const FOOD_AI_POTS=\{)",
    "const FOOD_LABEL_LIMIT = 25;\n\\1")], 'ROUGE'),

 ('M21  une cle de FOOD_AI_POTS est mal tapee (capacite inexistante)',
  [('app.js', r"'nutrition\.label\.ai':           'foodLabelAiUses',",
    "'nutrition.labels.ai':          'foodLabelAiUses',")], 'ROUGE'),

 # ══ LA MIGRATION ══════════════════════════════════════════════════════════════
 ('M22  un pot jamais ecrit se lit 0 : la migration ne part JAMAIS',
  [('state.js', r"    if\(v===null\|\|v===undefined\|\|v===''\)return null;",
    "    if(v===null||v===undefined||v==='')return 0;")], 'ROUGE'),

 ('M23  la migration ECRASE a chaque chargement (non idempotente)',
  [('state.js', r"    if\(isFinite\(v\)&&v>=0\)\{ S\[ch\]=v; continue; \}\n", '')], 'ROUGE'),

 ('M24  la migration met 0 au lieu de l ancien pot (25 essais neufs offerts)',
  [('state.js', r"    S\[ch\]=anc; n\+\+;", "    S[ch]=0; n++;")], 'ROUGE'),

 ('M25  un ancien pot corrompu produit NaN',
  [('state.js', r"  const anc=Math\.max\(0,parseInt\(S\.foodAiUses,10\)\|\|0\);",
    "  const anc=parseInt(S.foodAiUses,10);")], 'ROUGE'),

 ('M26  `persist` n ecrit plus les trois pots (perdus au rechargement)',
  [('state.js', r"    localStorage\.setItem\('ft4_foodai_label',String\(S\.foodLabelAiUses\|\|0\)\);\n"
                 r"    localStorage\.setItem\('ft4_foodai_meal', String\(S\.foodMealEstimateAiUses\|\|0\)\);\n"
                 r"    localStorage\.setItem\('ft4_foodai_bc',   String\(S\.foodBarcodeAiUses\|\|0\)\);\n",
    '')], 'ROUGE'),

 ('M27  l ancien pot commun est EFFACE au lieu d etre gele',
  [('state.js', r"    localStorage\.setItem\('ft4_foodai',String\(S\.foodAiUses\|\|0\)\);",
    "    localStorage.removeItem('ft4_foodai');S.foodAiUses=0;")], 'ROUGE'),

 # ══ LA PERSISTANCE CLOUD ══════════════════════════════════════════════════════
 ('M28  les pots ne partent plus dans la sauvegarde',
  [('setup.js', r"      foodLabelAiUses:S\.foodLabelAiUses\|\|0,\n", '')], 'ROUGE'),

 ('M29  le serveur n accepte plus le pot de l etiquette (liste blanche)',
  [('Code.js', r"    if \(body\.foodLabelAiUses        !== undefined\)[^\n]*\n", '')], 'ROUGE'),

 ('M30  le serveur REMPLACE au lieu de prendre le maximum',
  [('Code.js',
    r"profile\.foodLabelAiUses        = Math\.max\(parseInt\(body\.foodLabelAiUses\)\|\|0,        parseInt\(profile\.foodLabelAiUses\)\|\|0\);",
    "profile.foodLabelAiUses        = parseInt(body.foodLabelAiUses)||0;")], 'ROUGE'),

 # ══ LA REGENERATION ═══════════════════════════════════════════════════════════
 ('M31  une generation complete remet `regenCount` a 0 (le contournement revient)',
  [('app.js', r"      S\.mealPlan=\{days:data\.plan\.days\|\|\[\],generatedAt:td,\n"
               r"                  regenDate:\(_rgD===td\?td:null\),regenCount:_rgN\};",
    "      S.mealPlan={days:data.plan.days||[],generatedAt:td,regenDate:null,regenCount:0};")],
  'ROUGE'),

 ('M32  le plafond de regeneration passe de 1 a 5 (la decision change en douce)',
  [('app.js', r"\(S\.mealPlan\.regenCount\|\|0\)>=1", "(S.mealPlan.regenCount||0)>=5")], 'ROUGE'),

 # ══ LES TROIS QUI DOIVENT RESTER VERTES ═══════════════════════════════════════
 ('M33  un COMMENTAIRE de app.js cite tout ce que les temoins cherchent',
  [('app.js', r"(const FOOD_AI_POTS=\{)",
    "/* S.foodAiUses = 1 ; FOOD_LABEL_LIMIT = 25 ; regenCount:0 ; NON_DECIDEE */\n\\1")],
  'VERT'),

 ('M34  un COMMENTAIRE de state.js cite les motifs de la migration',
  [('state.js', r"(function _foodAiMigrer\(\)\{)",
    "// S[ch]=0; et localStorage.removeItem('ft4_foodai') et return 0;\n\\1")], 'VERT'),

 ('M35  un COMMENTAIRE du registre cite NON_DECIDEE et illimite',
  [('capacites-ia.js', r"(const CAPACITES_IA = \[)",
    "/* politique: 'NON_DECIDEE' et quotaType: 'illimite' — cites, pas ecrits */\n\\1")],
  'VERT'),
]


def controle(root):
    r = subprocess.run(  # noqa
        ['node', os.path.join(root, 'tools', 'banc_pots_nutrition.js')],
        capture_output=True, text=True, timeout=600, cwd=root,
        env=dict(os.environ, TZ='Europe/Paris'))
    lignes = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith(('!!', 'CRASH')) or ' rouge' in l]
    return r.returncode, lignes


base = tempfile.mkdtemp(prefix='ftpots_')
tree = os.path.join(base, 'arbre')
subprocess.run(['git', 'clone', '--no-hardlinks', '-q', SRC, tree], check=True)
for f in ('capacites-ia.js', 'app.js', 'state.js', 'setup.js', 'Code.js', 'index.html',
          'tools/gen_doc_ia.js', 'docs/IA-FREE-PREMIUM.md',
          'tests/parcours/pots_nutrition.js', 'tools/banc_pots_nutrition.js'):
    d = os.path.join(tree, f)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy(os.path.join(SRC, f), d)

print('== CONTROLE SAIN, AVANT ==')
code, lignes = controle(tree)
print('   code=%d  %s  %s' % (code, 'VERT' if code == 0 else 'ROUGE', lignes[-1:]))
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
        print('\n%s\n   ANCRE INVALIDE — mutation NON APPLIQUEE' % nom)
        continue
    code, lignes = controle(tree)
    for fic, txt in orig.items():
        open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
    verdict = 'VERT' if code == 0 else 'ROUGE'
    bon = (verdict == attendu)
    conformes += bon
    print('\n%s\n   -> [attendu %s, obtenu %s] %s'
          % (nom, attendu, verdict, 'OK' if bon else 'NON CONFORME'))
    if not bon:
        for l in lignes[:5]:
            print('      ', l[:170])

print('\n== CONTROLE SAIN, APRES ==')
code, lignes = controle(tree)
print('   code=%d  %s  %s' % (code, 'VERT' if code == 0 else 'ROUGE', lignes[-1:]))

print('\n%d/%d conformes · %d ancre(s) invalide(s)' % (conformes, len(MUT), invalides))
shutil.rmtree(base, ignore_errors=True)
sys.exit(0 if (conformes == len(MUT) and invalides == 0 and code == 0) else 1)
