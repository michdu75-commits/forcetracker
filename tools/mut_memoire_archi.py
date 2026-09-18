#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des gardes de « memoire longue Milo — architecture de reference ».

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

⭐⭐ DEUX MUTATIONS DOIVENT RESTER VERTES : elles citent dans un COMMENTAIRE les mots que les
   gardes cherchent. ⚠️ Et AUCUNE ne les cite dans une CHAINE — parce qu on a mesure hier que
   le garde a raison de mordre la : *le commentaire est de la documentation, la chaine est du
   code que le moteur lit*.

⭐ LE COEUR DE CE DOSSIER EST QUE LE MODELE EXISTE DEJA. Les mutations les plus utiles sont
   donc celles qui RETIRENT un morceau du modele existant : si le dossier peut encore se
   produire sans `registre.observations`, sans les statuts de blessure ou sans `goalLog`,
   c est qu il ne mesure pas ce qu il affirme.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'
GEN = 'tools/gen_memoire_archi_pdf.py'

MUT = [
 ('M01  une observation perd son identifiant',
  [('coach.js', r"S\.registre\.observations\.push\(\{id:'cm'\+Date\.now\(\)\.toString\(36\),",
    'S.registre.observations.push({')], 'ROUGE'),

 ('M02  une observation perd sa provenance',
  [('coach.js', r"source:'conversation',", '')], 'ROUGE'),

 ('M03  une observation perd sa date de proposition',
  [('coach.js', r"proposedAt:\(typeof today==='function'\?today\(\):''\),", '')], 'ROUGE'),

 ('M04  une observation perd sa derniere confirmation',
  [('coach.js', r"validatedAt:ok\?\(typeof today==='function'\?today\(\):''\):undefined", 'x:1')],
  'ROUGE'),

 ('M05  le statut « pending » disparait',
  [('tracking.js', r"status:'pending'", "status:'attente'"),
   ('coach.js', r"status==='pending'", "status==='attente'")], 'ROUGE'),

 ('M06  une blessure perd sa date',
  [('setup.js', r'\{zone,status,since:today\(\)\}', '{zone,status}')], 'ROUGE'),

 ('M07  un statut de blessure disparait',
  [('setup.js', r"\{id:'ancienne',label:'Ancienne'", "{id:'passee',label:'Ancienne'")], 'ROUGE'),

 ('M08  une blessure se supprime autrement que par indice',
  [('setup.js', r'hp\.injuries\.splice\(i,1\);', 'hp.injuries=hp.injuries.filter(x=>x!==i);')],
  'ROUGE'),

 ('M09  goalLog cesse de journaliser {date, de, vers}',
  [('state.js', r'S\.goalLog\.push\(\{ date: today\(\), de: avant, vers: g, src: src \|\| \'\' \}\);',
    'S.goalLog.push({ vers: g });')], 'ROUGE'),

 ('M10  goalLog n est plus borne a 20',
  [('state.js', r'const _GOAL_LOG_MAX = 20;', 'const _GOAL_LOG_MAX = 200;')], 'ROUGE'),

 ('M11  une seance vivante perd son id',
  [('log.js', r'const sess=\{id:Date\.now\(\),', 'const sess={ident:Date.now(),')], 'ROUGE'),

 ('M12  une seance IMPORTEE date son id du FAIT et non de l import',
  [('log.js', r'      id:now\+si,', '      id:dateTs+si,')], 'ROUGE'),

 ('M13  l import ne prend plus l heure courante',
  [('log.js', r'  const now=Date\.now\(\);', '  const now=0;')], 'ROUGE'),

 ('M14  un curseur de memoire apparait',
  [('state.js', r"(    S\.coachMemory=localStorage\.getItem\('ft4_coach_mem'\)\|\|'';)",
    r"\1\n    S.memoryProcessedUntil='';")], 'ROUGE'),

 ('M15  une pierre tombale apparait',
  [('tracking.js', r'(function deleteObs\(id\)\{)', r'\1\n  const deletedAt=Date.now();')],
  'ROUGE'),

 ('M16  la suppression d une observation change de forme',
  [('tracking.js', r'S\.registre\.observations=S\.registre\.observations\.filter\(o=>o&&o\.id!==id\);',
    'S.registre.observations.splice(0,0);')], 'ROUGE'),

 ('M17  _fusionListe cesse d etre une UNION',
  [('state.js', r'  disque\.forEach\(e=>\{ const k=cle\(e\); if\(!vus\.has\(k\)\)\{ out\.push\(e\); vus\.add\(k\); \} \}\);',
    '  return out;')], 'ROUGE'),

 ('M18  le registre entre dans la fusion multi-onglets',
  # ⛔ LA MUTATION A ETE REECRITE AVEC LE GARDE. La premiere version ne changeait qu un
  #    COMMENTAIRE (« registre desormais couvert ») — elle testait un garde qui lisait la
  #    documentation. Le garde mesure desormais les appels a _fusionListe, donc la mutation
  #    doit en AJOUTER un. *Quand on resserre un garde, sa mutation se resserre avec lui,
  #    sinon on garde une mutation qui ne peut plus mordre* (lecon ft-v994).
  [('state.js', r'(    S\.sleepLog   = _fusionListe\(S\.sleepLog,)',
    r'    S.registre = _fusionListe(S.registre, lire(\'ft4_registre\',[]), e=>String(e&&e.id||\'\'));\n\1')],
  'ROUGE'),

 ('M19  _pa_ laisse une liste vide ecraser une liste pleine',
  [('Code.js', r'function _pa_\(b, e\)\{ if\(b===undefined\)return e; const bi=b\|\|\[\],ei=e\|\|\[\]; return\(bi\.length>0\|\|ei\.length===0\)\?bi:ei; \}',
    'function _pa_(b, e){ if(b===undefined)return e; return b||[]; }')], 'ROUGE'),

 ('M20  le registre cesse de partir au nuage',
  [('setup.js', r'registre:S\.registre\|\|\{facts:\{\},observations:\[\]\},', '')], 'ROUGE'),

 ('M21  le fil de conversation part au nuage',
  [('setup.js', r'(      foodLog:\(S\.foodLog\|\|\[\]\)\.slice\(-8000\),)',
    r'      coachConversations:S.coachConversations||[],\n\1')], 'ROUGE'),

 ('M22  la memoire n est plus REMPLACEE',
  [('coach.js', r'if\(data\.summary\)\{S\.coachMemory=data\.summary;',
    "if(data.summary){S.coachMemory=(S.coachMemory||'')+data.summary;")], 'ROUGE'),

 ('M23  summarizeCoach cesse d etre une action IA',
  [('constants.js', r"'summarizeCoach',", "'resumeCoach',")], 'ROUGE'),

 ('M24  _saveCoachMemory recoit un garde premium',
  [('coach.js', r'(async function _saveCoachMemory\(\)\{)', r'\1\n  if(!S.premium)return;')],
  'ROUGE'),

 ('M25  une borne de retention change',
  [('coach.js', r'const _CONVS_MAX    = 30;', 'const _CONVS_MAX    = 90;')], 'ROUGE'),

 ('M26  VERT ATTENDU — les mots cherches cites dans un COMMENTAIRE de ligne',
  [('state.js', r'(const _GOAL_LOG_MAX = 20;)',
    r'// note : tombstone, deletedAt, isDeleted, memoryProcessedUntil, coachConversations\n\1')],
  'VERT'),

 ('M27  VERT ATTENDU — un commentaire de BLOC qui cite tout ce que les gardes cherchent',
  [('worker.js', r'(async function summarizeCoach\(body, apiKey, meta\) \{)',
    r'/* tombstone, deletedAt, isDeleted, memoryProcessedUntil, registre.observations,\n'
    r'   id:now+si, const now=Date.now();, _GOAL_LOG_MAX, _HIS, coachConversations */\n\1')],
  'VERT'),
]


def controle(root, out):
    env = dict(os.environ, ARCHI_PDF=out)
    r = subprocess.run([sys.executable, os.path.join(root, GEN)],
                       capture_output=True, text=True, timeout=600, cwd=root, env=env)
    motifs = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith('- ') or l.strip().startswith('REFUS —')]
    return r.returncode, motifs


base = tempfile.mkdtemp(prefix='ftarchi_')
tree = os.path.join(base, 'arbre')
subprocess.run(['git', 'clone', '--no-hardlinks', '-q', SRC, tree], check=True)
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
