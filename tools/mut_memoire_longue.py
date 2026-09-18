#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des gardes de l etude « memoire longue de Milo ».

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

⭐⭐ DEUX MUTATIONS DOIVENT RESTER VERTES : elles citent les mots que les gardes cherchent
   dans un COMMENTAIRE ou une CHAINE. C est la seule facon de prouver que les gardes
   mesurent le CODE et non la documentation — et le generateur lui-meme cite abondamment
   ce qu il verifie (R30 : la raison s ecrit a cote du code).
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'
GEN = 'tools/gen_memoire_longue_pdf.py'

MUT = [
 ('M01  la memoire n est plus REMPLACEE (elle s ajoute)',
  [('coach.js', r'if\(data\.summary\)\{S\.coachMemory=data\.summary;',
    "if(data.summary){S.coachMemory=(S.coachMemory||'')+data.summary;")], 'ROUGE'),

 ('M02  la fenetre du resumeur passe de 16 a 60 messages',
  [('worker.js', r'const history = \(body\.history \|\| \[\]\)\.slice\(-16\);',
    'const history = (body.history || []).slice(-60);')], 'ROUGE'),

 ('M03  le plafond du resume passe de 250 a 2000 jetons',
  [('worker.js', r"model: 'claude-haiku-4-5-20251001', max_tokens: 250",
    "model: 'claude-haiku-4-5-20251001', max_tokens: 2000")], 'ROUGE'),

 ('M04  le resumeur ne demande plus « 2-3 phrases max »',
  [('worker.js', r'R\S+sume cette conversation coach/athl\S+te en 2-3 phrases max',
    'Fais un resume de cette conversation')], 'ROUGE'),

 ('M05  la memoire existante n est plus renvoyee au resumeur',
  [('worker.js', r"const existing = body\.existingMemory \|\| '';",
    "const existing = '';")], 'ROUGE'),

 ('M06  coachMemory cesse d etre un champ de la charge utile coach',
  [('coach.js', r'coachMemory: S\.coachMemory\|\|\'\'', "coachMemoire: ''"),
   ('coach.js', r'coachMemory:S\.coachMemory\|\|\'\'', "coachMemoire:''")], 'ROUGE'),

 ('M07  le fil de conversation part au nuage',
  [('setup.js', r'      foodLog:\(S\.foodLog\|\|\[\]\)\.slice\(-8000\),',
    '      coachConversations:S.coachConversations||[],\n'
    '      foodLog:(S.foodLog||[]).slice(-8000),')], 'ROUGE'),

 ('M08  la raison ecrite du choix disparait du code',
  [('coach.js', r'il ne part ni', 'il ne va pas')], 'ROUGE'),

 ('M09  le plafond du fil passe de 400 a 50 messages',
  [('coach.js', r'const _HIST_MAX_MSG = 400;', 'const _HIST_MAX_MSG = 50;')], 'ROUGE'),

 ('M10  une donnee factuelle cesse de partir au nuage',
  [('setup.js', r'      goalLog:\(S\.goalLog\|\|\[\]\)\.slice\(-20\),', '')], 'ROUGE'),

 ('M11  le plafond du journal alimentaire passe de 8000 a 500',
  [('setup.js', r'foodLog:\(S\.foodLog\|\|\[\]\)\.slice\(-8000\)',
    'foodLog:(S.foodLog||[]).slice(-500)')], 'ROUGE'),

 ('M12  le plafond des seances passe de 1500 a 300',
  [('log.js', r"localStorage\.setItem\('ft4_sessions',JSON\.stringify\(\(S\.sessions\|\|\[\]\)\.slice\(0,1500\)\)\);",
    "localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,300)));")],
  'ROUGE'),

 ('M13  goalLog cesse de journaliser {date, de, vers}',
  [('state.js', r'S\.goalLog\.push\(\{ date: today\(\), de: avant, vers: g, src: src \|\| \'\' \}\);',
    'S.goalLog.push({ vers: g });')], 'ROUGE'),

 ('M14  l inscription est journalisee comme un changement d objectif',
  [('state.js', r"if\(src === 'inscription' \|\| !avant \|\| avant === g\) return false;",
    'if(!avant || avant === g) return false;')], 'ROUGE'),

 ('M15  une pierre tombale apparait dans le code',
  [('state.js', r'(function _fusionListe\(memoire, disque, cle\)\{)',
    r'\1\n  const deletedAt = null;')], 'ROUGE'),

 ('M16  _fusionListe cesse d etre une UNION',
  [('state.js', r'  disque\.forEach\(e=>\{ const k=cle\(e\); if\(!vus\.has\(k\)\)\{ out\.push\(e\); vus\.add\(k\); \} \}\);',
    '  return out;')], 'ROUGE'),

 ('M17  _pa_ laisse une liste vide ecraser une liste pleine',
  [('Code.js', r'function _pa_\(b, e\)\{ if\(b===undefined\)return e; const bi=b\|\|\[\],ei=e\|\|\[\]; return\(bi\.length>0\|\|ei\.length===0\)\?bi:ei; \}',
    'function _pa_(b, e){ if(b===undefined)return e; return b||[]; }')], 'ROUGE'),

 ('M18  un curseur de memoire apparait dans le code',
  [('state.js', r'(  S\.coachMemory=localStorage\.getItem\(\'ft4_coach_mem\'\)\|\|\'\';)',
    r"\1\n    S.memoryProcessedUntil=localStorage.getItem('ft4_mem_until')||'';")], 'ROUGE'),

 ('M19  S.registre.updatedAt disparait (le precedent de curseur)',
  [('state.js', r"S\.registre=_lsJson\('ft4_registre',null\)\|\|\{facts:\{\},observations:\[\],updatedAt:''\};",
    "S.registre=_lsJson('ft4_registre',null)||{facts:{},observations:[]};")], 'ROUGE'),

 ('M20  une seance cesse de porter id ET ts',
  [('log.js', r'const sess=\{id:Date\.now\(\),', 'const sess={ident:Date.now(),')], 'ROUGE'),

 ('M21  un journal de changement de profil apparait',
  [('state.js', r'(const _GOAL_LOG_MAX = 20;)',
    r'\1\nconst _DISCIPLINE_LOG_MAX = 20;\nlet disciplineLog = [];')], 'ROUGE'),

 ('M22  VERT ATTENDU — les mots cherches cites dans un COMMENTAIRE JS',
  [('coach.js', r'(const _HIST_MAX_MSG = 400;)',
    r'// note : tombstone, deletedAt, memoryProcessedUntil, coachConversations, 2-3 phrases max\n\1')],
  'VERT'),

 ('M23  ROUGE ATTENDU — les mots cherches dans une CHAINE (mon attente etait FAUSSE)',
  # ⛔⛔ J AVAIS ECRIT « VERT ATTENDU » ET LE GARDE A EU RAISON CONTRE MOI. Une CHAINE n est
  #    pas de la documentation : le moteur la lit. Rendre le garde aveugle aux chaines pour
  #    faire passer cette mutation l aurait rendu aveugle a `localStorage.getItem('deletedAt')`,
  #    qui serait une VRAIE pierre tombale. *Le commentaire est de la documentation ; la chaine
  #    est du code.* Meme lecon qu en ft-v1220, ou une `const` citee m avait piege pareil.
  [('state.js', r'(const _GOAL_LOG_MAX = 20;)',
    r"\1\nconst _NOTE_MEM='tombstone deletedAt isDeleted memoryProcessedUntil disciplineLog';")],
  'ROUGE'),

 ('M24  VERT ATTENDU — un commentaire de BLOC qui cite tout',
  [('worker.js', r'(async function summarizeCoach\(body, apiKey, meta\) \{)',
    r'/* tombstone, deletedAt, isDeleted, memoryProcessedUntil, disciplineLog,\n'
    r'   coachConversations, ft4_coach_hist, LevelLog */\n\1')], 'VERT'),
]


def controle(root, out):
    env = dict(os.environ, MEM_PDF=out)
    r = subprocess.run([sys.executable, os.path.join(root, GEN)],
                       capture_output=True, text=True, timeout=600, cwd=root, env=env)
    motifs = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith('- ')]
    return r.returncode, motifs


base = tempfile.mkdtemp(prefix='ftmem_')
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
    orig, ok = {}, True
    for fic, motif, remp in edits:
        p = os.path.join(tree, fic)
        if fic not in orig:
            orig[fic] = open(p, encoding='utf-8').read()
        courant = open(p, encoding='utf-8').read()
        neuf, n = re.subn(motif, remp, courant, count=1)
        if n != 1 and len(edits) == 1:
            ok = False
            break
        if n == 1:
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
