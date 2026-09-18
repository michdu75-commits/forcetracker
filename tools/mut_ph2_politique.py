#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des gardes du dossier PHASE 2.

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60) — et le clone est refait a chaque
   mutation par restauration du fichier d origine, pas par un `git checkout` qui pourrait
   emporter autre chose.

⭐⭐ QUATRE MUTATIONS DOIVENT RESTER VERTES : elles ajoutent les mots que les gardes
   cherchent, mais dans un COMMENTAIRE ou dans une CHAINE. C est la seule facon de prouver
   que les gardes mesurent le CODE et non la documentation — et ce projet a paye ce defaut
   cinq fois (ft-v1193, 1203, 1205, 1210, 1216).

⚠️ ET UNE MUTATION DOIT RESTER VERTE PARCE QUE LE FAIT DEMEURE : renommer une constante
   en gardant sa valeur ne change pas le fait mesure. Si un garde rougissait dessus, il
   mesurerait l orthographe, pas la politique d acces.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'
GEN = 'tools/gen_ph2_politique_pdf.py'

# (nom, [(fichier, motif, remplacement)], attendu)
MUT = [
 ('M01  le serveur se met a lire le premium (worker.js)',
  [('worker.js', r'const meta = \{ action: body\.action',
    'const _prem = _moi.premium;\n    const meta = { action: body.action')], 'ROUGE'),

 ('M02  _aiQuotaBlock_ devient conscient du premium',
  [('Code.js', r'    var ec = q\.byEmail\[e\] \|\| 0;',
    '    var ec = q.byEmail[e] || 0;\n    var premiumBonus = 0;')], 'ROUGE'),

 ('M03  le plafond par e-mail passe de 50 a 80',
  [('Code.js', r"getProperty\('AI_EMAIL_MAX'\), 10\)  \|\| 50;",
    "getProperty('AI_EMAIL_MAX'), 10)  || 80;")], 'ROUGE'),

 ('M04  le repli du quota devient FERME',
  [('Code.js', r'(function _aiQuotaBlock_[\s\S]*?)return \{ blocked: false \};\n  \}\n\}',
    r'\1return { blocked: true, scope: \'erreur\' };\n  }\n}')], 'ROUGE'),

 ('M05  handleAuthIdentity_ cesse de compter (le double comptage serait corrige)',
  [('Code.js', r'var q = _aiQuotaBlock_\(j\.email\);',
    'var q = { blocked: false };')], 'ROUGE'),

 ('M06  une action IA disparait de la liste du client',
  [('constants.js', r"AI_PROXY_ACTIONS=\['importBodyScan',", "AI_PROXY_ACTIONS=[")], 'ROUGE'),

 ('M07  une action IA disparait de la liste du Worker (les deux listes divergent)',
  [('worker.js', r"_ACTIONS_IA = new Set\(\['importBodyScan',",
    "_ACTIONS_IA = new Set([")], 'ROUGE'),

 ('M08  seanceJson est ajoutee a la 2e porte Apps Script',
  [('Code.js', r"  if \(body\.action === 'aiCount'\) \{",
    "  if (body.action === 'seanceJson') { return json_({status:'ok'}); }\n"
    "  if (body.action === 'aiCount') {")], 'ROUGE'),

 ('M09  le plafond des questions gratuites passe de 10 a 3',
  [('coach.js', r'const COACH_FREE_LIMIT = 10;', 'const COACH_FREE_LIMIT = 3;')], 'ROUGE'),

 ('M10  le pot nutrition passe de 25 a 40',
  [('app.js', r'const FOOD_AI_FREE_LIMIT=25;', 'const FOOD_AI_FREE_LIMIT=40;')], 'ROUGE'),

 ('M11  _runSeDebrief recoit un garde premium (I1 serait corrigee)',
  [('log.js', r'(async function _runSeDebrief\(sess,prCount\)\{\n)',
    r'\1  if(!S.premium)return;\n')], 'ROUGE'),

 ('M12  _saveCoachMemory recoit un garde premium (I2 serait corrigee)',
  [('coach.js', r'(async function _saveCoachMemory\(\)\{)',
    r'\1\n  if(!S.premium)return;')], 'ROUGE'),

 ('M13  analyzeMealImport recoit un garde premium (I3 serait corrigee)',
  [('app.js', r'(async function analyzeMealImport\(\)\{)',
    r'\1\n  if(!S.premium)return;')], 'ROUGE'),

 ('M14  _runSeDebrief passe par sendToCoach au lieu du fetch direct',
  [('log.js', r"(async function _runSeDebrief\(sess,prCount\)\{\n)",
    r'\1  /*x*/ if(false) sendToCoach("");\n')], 'ROUGE'),

 ('M15  generateMealPlan cesse de choisir le perimetre (I4 serait corrigee)',
  [('app.js', r"scope:isPrem\?'week':'day'", "scope:'day'")], 'ROUGE'),

 ('M16  la generation complete ne remet plus regenCount a 0',
  [('app.js', r"S\.mealPlan=\{days:data\.plan\.days\|\|\[\],generatedAt:td,regenDate:null,regenCount:0\}",
    "S.mealPlan={days:data.plan.days||[],generatedAt:td,regenDate:null}")], 'ROUGE'),

 ('M17  la regle du chip gratuit disparait de sendToCoach (I5 serait corrigee)',
  [('coach.js', r"if \(!opts\.noQuota && typeof document !== 'undefined' && document\.querySelector"
    r" && document\.querySelector\('\.coach-qr'\)\) opts\.noQuota = true;", '')], 'ROUGE'),

 ('M18  openMorphoAnalysis perd son garde premium',
  [('setup.js', r"(function openMorphoAnalysis\(\)\{\n)\s*if\(!S\.premium\)\{[^\n]*\n",
    r'\1')], 'ROUGE'),

 ('M19  openBodySeries perd son garde super-testeur',
  [('setup.js',
    r"(function openBodySeries\(\)\{\n)\s*if\(!\(typeof _isSuperTester[^\n]*\n", r'\1')],
  'ROUGE'),

 ('M20  la limite mensuelle des series disparait',
  [('setup.js', r'const _BSER_MONTHLY_LIMIT=4;', 'const _BSER_MONTHLY_LIMIT=999;')], 'VERT'),

 ('M21  startEvalBench perd son garde admin',
  [('coach.js',
    r"(function startEvalBench\(compare\)\{\n)\s*if\(!\(typeof _isAdminUnlocked[^\n]*\n",
    r'\1')], 'ROUGE'),

 ('M22  la restauration cloud cesse de prendre le MAX',
  [('setup.js', r'S\.progImports=Math\.max\(S\.progImports\|\|0,parseInt\(d\.progImports\)\|\|0\)',
    'S.progImports=parseInt(d.progImports)||0')], 'ROUGE'),

 ('M23  une cle de stockage freemium est renommee (piege de la SOUS-CHAINE)',
  [('state.js', r"'ft4_foodai'", "'ft4_foodaiX'")], 'ROUGE'),

 ('M24  PREMIUM_PERKS cesse de promettre le recap de seance',
  [('constants.js', r"Le récap de chaque séance", "Le resume de chaque entrainement")],
  'ROUGE'),

 ('M25  l ecran Nutrition cesse d annoncer « Gratuit : repas du jour »',
  [('screens.js', r'Gratuit : repas du jour', 'Offert : le repas du jour')], 'ROUGE'),

 ('M30  _saveCoachMemory perd sa file de promesses',
  [('coach.js', r'  _memFile=_memFile\.then\(_resumeCoachUn,_resumeCoachUn\);\n  return _memFile;',
    '  return _resumeCoachUn();')], 'ROUGE'),

 ('M31  le commentaire « plus de barriere premium » disparait',
  [('coach.js', r'plus de barri\S+re premium',
    '// memoire')], 'ROUGE'),

 ('M32  _identiteIA cesse de rendre le premium',
  [('worker.js', r'premium: !!d\.premium, ', '')], 'ROUGE'),

 ('M33  _identiteIA devient OUVERTE sur une panne reseau',
  [('worker.js', r"catch \(e\) \{ return \{ ok: false, raison: 'reseau' \}; \}",
    "catch (e) { return { ok: true, email: 'anon' }; }")], 'ROUGE'),

 ('M34  _runSeDebrief cesse de prendre un jeton de seance',
  [('log.js', r'  const _pid=\(typeof _dbfPrendreCible==', '  const _pid=(false&&typeof _dbfX==')],
  'ROUGE'),

 ('M35  la navigation vers Coach ne declenche plus le debrief automatique',
  [('screens.js', r"_maybeAutoDebrief==='function'\)_maybeAutoDebrief\(\)",
    "_maybeAutoDbf==='function')_maybeAutoDbf()")], 'ROUGE'),

 ('M36  _pn_ devient monotone (un compteur ne peut plus etre abaisse)',
  [('Code.js', r'function _pn_\(b, e\)\{ if\(b===undefined\)return e; '
    r'return \(b&&b!==0\)\?b:\(e\|\|b\|\|0\); \}',
    'function _pn_(b, e){ if(b===undefined)return e; return Math.max(b||0, e||0); }')], 'ROUGE'),

 ('M37  S.coachFree part au cloud comme les autres compteurs',
  [('setup.js', r'      histImports:S\.histImports\|\|0,',
    '      coachFree:S.coachFree||0,\n      histImports:S.histImports||0,')], 'ROUGE'),

 ('M38  le bouton de generation complete de l en-tete disparait',
  [('screens.js', r'onclick="generateMealPlan\(\)">🔄 IA', 'onclick="renderMealPlanIA()">IA')],
  'ROUGE'),

 ('M39  la liste premium du client perd une adresse',
  [('constants.js', r"const PREMIUM_CLIENT_EMAILS=\['michdu75@gmail\.com',",
    "const PREMIUM_CLIENT_EMAILS=[")], 'ROUGE'),

 ('M40  S.premium perd sa 2e source client (la liste d e-mails)',
  [('state.js', r"if\(typeof _isClientPremium==='function'&&_isClientPremium\(\)\)S\.premium=true;",
    '')], 'ROUGE'),

 ('M41  un super-testeur sort de la liste premium (le 2e chemin devient un contournement)',
  [('constants.js', r"const PREMIUM_CLIENT_EMAILS=\['michdu75@gmail\.com','elineazs32@gmail\.com',"
    r"'christophe@famillelanglois\.fr','emma\.david16@gmail\.com','tanna\.valery\.studio@gmail\.com'\]",
    "const PREMIUM_CLIENT_EMAILS=['michdu75@gmail.com','elineazs32@gmail.com',"
    "'emma.david16@gmail.com','tanna.valery.studio@gmail.com','x@y.z']")], 'ROUGE'),

 ('M42  la boucle de reessai du debrief disparait',
  [('log.js', r'for\(let a=1;a<=2;a\+\+\)\{', 'for(let a=1;a<=1;a++){')], 'ROUGE'),

 ('M26  VERT ATTENDU — les mots cherches cites dans un COMMENTAIRE JS',
  [('worker.js', r'(let _moi = null;)',
    r'// note : _moi.premium n est PAS lu ici, et scope:isPrem?\'week\':\'day\' non plus\n    \1')],
  'VERT'),

 ('M27  VERT ATTENDU — les mots cherches cites dans une CHAINE',
  [('app.js', r"(const FOOD_AI_FREE_LIMIT=25;)",
    r"\1\nconst _PH2_NOTE='_moi.premium / .coach-qr / _aiQuotaBlock_(j.email)';")], 'VERT'),

 ('M28  VERT ATTENDU — un commentaire de BLOC qui cite tout ce que les gardes cherchent',
  [('coach.js', r'(const COACH_FREE_LIMIT = 10;)',
    r'/* PREMIUM_PERKS, scope:isPrem, regenCount:0, _isSuperTester, _BSER_MONTHLY_LIMIT,\n'
    r'   Gratuit : repas du jour, ft4_foodai, _aiQuotaBlock_(body.email) */\n\1')], 'VERT'),

 ('M29  VERT ATTENDU — un commentaire qui cite les mots dans un FICHIER DE DOC',
  [('docs/CONTEXTE-ACTUEL.md', r'\A',
    '<!-- ph2 : _moi.premium, .coach-qr, scope:isPrem, AI_PROXY_ACTIONS -->\n')], 'VERT'),
]


def controle(root, out):
    env = dict(os.environ, PH2_PDF=out)
    r = subprocess.run([sys.executable, os.path.join(root, GEN)],
                       capture_output=True, text=True, timeout=600, cwd=root, env=env)
    motifs = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith('- ')]
    return r.returncode, motifs


base = tempfile.mkdtemp(prefix='ftph2_')
tree = os.path.join(base, 'arbre')
subprocess.run(['git', 'clone', '--no-hardlinks', '-q', SRC, tree], check=True)
# le generateur et le jeu de donnees viennent de l arbre de travail, pas du dernier commit
shutil.copy(os.path.join(SRC, GEN), os.path.join(tree, GEN))

print('== CONTROLE SAIN, AVANT ==')
code, motifs = controle(tree, os.path.join(base, 'avant.pdf'))
print('   code=%d  %s' % (code, 'VERT' if code == 0 else 'ROUGE'))
if code != 0:
    for m in motifs:
        print('   ', m[:170])
    sys.exit('le clone est deja rouge : rien de ce qui suit ne mesure quoi que ce soit.')

conformes, invalides = 0, 0
for nom, edits, attendu in MUT:
    orig, ok = {}, True
    for fic, motif, remp in edits:
        p = os.path.join(tree, fic)
        orig[fic] = open(p, encoding='utf-8').read()
        neuf, n = re.subn(motif, remp, orig[fic], count=1)
        if n != 1:
            ok = False
            break
        open(p, 'w', encoding='utf-8').write(neuf)
    if not ok:
        for fic, txt in orig.items():
            open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
        invalides += 1
        print('\n%s\n   ANCRE INVALIDE — mutation NON APPLIQUEE' % nom)
        continue
    code, motifs = controle(tree, os.path.join(base, 'mut.pdf'))
    for fic, txt in orig.items():
        open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
    verdict = 'VERT' if code == 0 else 'ROUGE'
    bon = (verdict == attendu)
    conformes += bon
    print('\n%s\n   -> [attendu %s, obtenu %s] %s'
          % (nom, attendu, verdict, 'OK' if bon else 'NON CONFORME'))
    for m in motifs[:2]:
        print('      ', m[:160])

print('\n== CONTROLE SAIN, APRES ==')
code, motifs = controle(tree, os.path.join(base, 'apres.pdf'))
print('   code=%d  %s  (attendu VERT)' % (code, 'VERT' if code == 0 else 'ROUGE'))
for m in motifs:
    print('   ', m[:170])

print('\n──── %d / %d mutations conformes (%d ancres invalides) ────'
      % (conformes, len(MUT), invalides))
shutil.rmtree(base, ignore_errors=True)
