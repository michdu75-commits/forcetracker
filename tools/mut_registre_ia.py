#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des blocs B-CCCXXXI, B-CCCXXXII et B-CCCXXXIII (phase 3).

⛔ SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

⭐⭐ CE QUE CE CONTROLE DOIT PROUVER, ET QUI EST PARTICULIER ICI. Les temoins du registre
   mesurent une DONNEE (un tableau JavaScript), pas un comportement. Le risque propre a ce
   genre de temoin est d etre d accord avec lui-meme : un registre qui se decrit lui-meme
   passerait tous les controles de forme sans jamais toucher le code servi. Les mutations
   les plus utiles sont donc celles qui font DIVERGER le registre du CODE REEL — retirer une
   action de `AI_PROXY_ACTIONS`, desynchroniser les deux listes, renommer une capacite.

⭐ DEUX MUTATIONS DOIVENT RESTER VERTES : elles citent dans un COMMENTAIRE les mots que les
   temoins cherchent. ⚠️ Aucune ne les cite dans une CHAINE — on a mesure hier que le garde a
   raison de mordre la : *le commentaire est de la documentation, la chaine est du code.*
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = '/home/user/forcetracker'

# le harnais : il conduit les trois blocs comme le runner, et rend un code de sortie
HARNAIS = r"""
const path=require('path'), fs=require('fs');
let ok=0, ko=0;
const t=(n,c,d)=>{ if(c){ok++;} else {ko++; console.log('ROUGE '+String(n).slice(0,70)+(d?' — '+d:''));} };
const ROOT=process.argv[2];
for (const f of ['registre_ia.js','quota_double.js']) {
  try { require(path.join(ROOT,'tests','parcours',f)).source(t, ROOT, fs, path); }
  catch(e){ ko++; console.log('CRASH '+f+' : '+String(e.message).slice(0,140)); }
}
console.log('TOTAL '+ok+' vert / '+ko+' rouge');
process.exit(ko?1:0);
"""

MUT = [
 # ── la forme du registre ────────────────────────────────────────────────────
 ('M01  une capacite disparait (20 au lieu de 21)',
  [('capacites-ia.js', r"\{\n    id: 'admin\.bench\.pt001'[\s\S]*?\n  \},\n", '')], 'ROUGE'),

 ('M02  une capacite est DUPLIQUEE',
  [('capacites-ia.js', r"(\{\n    id: 'milo\.chat',)",
    r"{ id: 'milo.chat', module: 'X', declenchement: 'manuel', emploieIA: true,\n"
    r"  politique: 'FREE', etatCode: 'FREE', gratuits: null, quotaType: 'illimite',\n"
    r"  quotaValeur: null, quotaPeriode: null, actionServeur: 'coach',\n"
    r"  porteAppsScript: 'coach', serveurApplique: false, decisionSource: null,\n"
    r"  decisionDate: null, ecart: null, notes: null },\n\1")], 'ROUGE'),

 ('M03  une capacite de la phase 1 est RENOMMEE (le compte reste 21)',
  [('capacites-ia.js', r"id: 'health\.bloodTest\.ai'", "id: 'health.bloodTests.ai'")], 'ROUGE'),

 ('M04  `milo.memory.backfill` n est plus la DERNIERE',
  [('capacites-ia.js', r"(const CAPACITES_IA = \[\n)",
    r"\1  { id: 'milo.memory.backfill', module: 'Milo', declenchement: 'automatique',\n"
    r"    emploieIA: true, politique: 'PREMIUM', etatCode: 'INEXISTANT', gratuits: 0,\n"
    r"    quotaType: 'par_evenement', quotaValeur: null, quotaPeriode: 'evenement',\n"
    r"    actionServeur: 'summarizeCoach', porteAppsScript: 'summarizeCoach',\n"
    r"    serveurApplique: false, decisionSource: 'x', decisionDate: 'x', ecart: 'x',\n"
    r"    notes: 'x' },\n")], 'ROUGE'),

 ('M05  le backfill prend la meme forme de quota que milo.memory',
  [('capacites-ia.js', r"quotaType: 'par_evenement', quotaValeur: null, quotaPeriode: 'evenement'",
    "quotaType: 'zero', quotaValeur: 0, quotaPeriode: null")], 'ROUGE'),

 ('M06  la taille d une periode de backfill est INVENTEE',
  [('capacites-ia.js', r"quotaType: 'par_evenement', quotaValeur: null",
    "quotaType: 'par_evenement', quotaValeur: 20")], 'ROUGE'),

 ('M07  le quota MENSUEL disparait du registre',
  [('capacites-ia.js', r"quotaType: 'usage_par_mois', quotaValeur: 4, quotaPeriode: 'mois'",
    "quotaType: 'usage_total', quotaValeur: 4, quotaPeriode: null")], 'ROUGE'),

 ('M08  le quota JOURNALIER disparait du registre',
  [('capacites-ia.js', r"quotaType: 'usage_par_jour', quotaValeur: 1, quotaPeriode: 'jour'",
    "quotaType: 'usage_total', quotaValeur: 1, quotaPeriode: null")], 'ROUGE'),

 ('M09  une politique NON DECIDEE est transformee en FREE (decision inventee)',
  [('capacites-ia.js', r"id: 'milo\.debrief', module: 'Milo', declenchement: 'automatique', emploieIA: true,\n    politique: 'NON_DECIDEE'",
    "id: 'milo.debrief', module: 'Milo', declenchement: 'automatique', emploieIA: true,\n    politique: 'FREE'")],
  'ROUGE'),

 ('M10  un ecart entre politique et code est MASQUE',
  # ⚠️ ANCRE SUR UN FRAGMENT COURT ET SANS ACCENT. Premier jet : je recopiais la phrase
  #    entiere, accents compris, et le motif ne s appliquait pas — la mutation s annoncait
  #    « invalide » au lieu de mentir, ce qui est le bon comportement, mais elle ne mesurait
  #    plus rien. *Une ancre longue est une ancre fragile.*
  [('capacites-ia.js', r'ecart: "le code ne porte AUCUN garde[\s\S]{0,200}?",\n',
    'ecart: null,\n')], 'ROUGE'),

 ('M11  une capacite pretend etre appliquee par le SERVEUR',
  [('capacites-ia.js', r"(id: 'milo\.chat'[\s\S]{0,700}?)serveurApplique: false",
    r"\1serveurApplique: true")], 'ROUGE'),

 ('M12  une politique invalide se glisse dans le registre (faute de frappe)',
  [('capacites-ia.js', r"politique: 'PREMIUM', etatCode: 'PREMIUM',\n    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,\n    actionServeur: 'morphoAnalysis'",
    "politique: 'PREMIM', etatCode: 'PREMIUM',\n    gratuits: 0, quotaType: 'zero', quotaValeur: 0, quotaPeriode: null,\n    actionServeur: 'morphoAnalysis'")],
  'ROUGE'),

 ('M13  les trois capacites du pot Nutrition reviennent a UNE seule politique',
  [('capacites-ia.js', r"(id: 'nutrition\.barcode\.aiFallback'[\s\S]{0,400}?)politique: 'PREMIUM', etatCode: 'FREEMIUM'",
    r"\1politique: 'FREEMIUM', etatCode: 'FREEMIUM'")], 'ROUGE'),

 ('M14  une capacite sans 2e porte Apps Script en recoit une',
  [('capacites-ia.js', r"actionServeur: 'seanceJson', porteAppsScript: null",
    "actionServeur: 'seanceJson', porteAppsScript: 'seanceJson'")], 'ROUGE'),

 # ── la fidelite au CODE SERVI : les mutations qui comptent le plus ──────────
 ('M15  ⭐ le registre declare une action qui N EXISTE PAS dans le code',
  [('constants.js', r"'morphoAnalysis',", "'morphoAnalyse',")], 'ROUGE'),

 ('M16  ⭐ le client et le Worker declarent des listes DIFFERENTES',
  [('worker.js', r"'importBodyScan','foodLabel',", "'importBodyScan',")], 'ROUGE'),

 # ── la documentation ────────────────────────────────────────────────────────
 ('M17  ⭐⭐ la documentation est editee A LA MAIN',
  [('docs/IA-FREE-PREMIUM.md', r"\| `milo\.chat` \| Milo \| manuel \| \*\*FREEMIUM\*\*",
    "| `milo.chat` | Milo | manuel | **PREMIUM**")], 'ROUGE'),

 ('M18  la documentation perd son avertissement « ne pas editer »',
  [('docs/IA-FREE-PREMIUM.md', r"NE PAS ÉDITER À LA MAIN", "document de reference")], 'ROUGE'),

 ('M19  le generateur cesse de comparer (son --check rend toujours 0)',
  [('tools/gen_doc_ia.js', r"  if \(actuel !== attendu\) \{", "  if (false) {")], 'ROUGE'),

 # ── le double comptage ──────────────────────────────────────────────────────
 ('M20  ⭐⭐ l identite se remet a CONSOMMER le quota (le double comptage revient)',
  [('Code.js', r"var q = _aiQuotaEtat_\(j\.email\);", "var q = _aiQuotaBlock_(j.email);")],
  'ROUGE'),

 ('M21  ⭐ la LECTURE d etat se met a ecrire',
  [('Code.js', r"    return \{ blocked: false, _sp: sp, _q: q, _e: e \};",
    "    q.global++; sp.setProperty('ai_quota', JSON.stringify(q));\n"
    "    return { blocked: false, _sp: sp, _q: q, _e: e };")], 'ROUGE'),

 ('M22  ⛔ le plafond est DOUBLE pour compenser (ce que Michel interdit)',
  [('Code.js', r"getProperty\('AI_EMAIL_MAX'\), 10\)  \|\| 50;",
    "getProperty('AI_EMAIL_MAX'), 10)  || 100;")], 'ROUGE'),

 ('M23  le repli du quota devient FERME (une panne couperait Milo)',
  [('Code.js', r"function _aiQuotaEtat_\(email\) \{([\s\S]*?)  \} catch \(err\) \{\n[^\n]*\n[^\n]*\n    return \{ blocked: false \};",
    r"function _aiQuotaEtat_(email) {\1  } catch (err) {\n    return { blocked: true, scope: 'erreur' };")],
  'ROUGE'),

 ('M24  l identite cesse de rendre le verdict de quota au Worker',
  [('Code.js', r"blocked:!!q\.blocked, scope:q\.scope \|\| ''", "x:1")], 'ROUGE'),

 # ── les deux qui doivent RESTER VERTES ──────────────────────────────────────
 ('M25  VERT ATTENDU — les mots cherches cites dans un COMMENTAIRE du registre',
  [('capacites-ia.js', r"(const CAPACITES_IA = \[)",
    r"// note : par_evenement, NON_DECIDEE, serveurApplique: true, milo.memory.backfill\n\1")],
  'VERT'),

 ('M26  VERT ATTENDU — un commentaire de BLOC dans Code.js qui cite tout',
  [('Code.js', r"(function _aiQuotaEtat_\(email\) \{)",
    r"/* _aiQuotaBlock_(email), q.global++, setProperty('ai_quota', ...), AI_MAX_DEV_ = 150 */\n\1")],
  'VERT'),
]


def controle(root):
    harnais = os.path.join(root, '_h.js')
    with open(harnais, 'w', encoding='utf-8') as f:
        f.write(HARNAIS)
    r = subprocess.run([  # noqa
        'node', harnais, root], capture_output=True, text=True, timeout=300, cwd=root)
    try:
        os.remove(harnais)
    except OSError:
        pass
    lignes = [l.strip() for l in (r.stdout + r.stderr).splitlines()
              if l.strip().startswith(('ROUGE', 'CRASH', 'TOTAL'))]
    return r.returncode, lignes


base = tempfile.mkdtemp(prefix='ftreg_')
tree = os.path.join(base, 'arbre')
subprocess.run(['git', 'clone', '--no-hardlinks', '-q', SRC, tree], check=True)
for f in ('capacites-ia.js', 'Code.js', 'constants.js', 'worker.js',
          'tools/gen_doc_ia.js', 'docs/IA-FREE-PREMIUM.md',
          'tests/parcours/registre_ia.js', 'tests/parcours/quota_double.js'):
    d = os.path.join(tree, f)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy(os.path.join(SRC, f), d)

print('== CONTROLE SAIN, AVANT ==')
code, lignes = controle(tree)
print('   code=%d  %s  %s' % (code, 'VERT' if code == 0 else 'ROUGE',
                              [l for l in lignes if l.startswith('TOTAL')]))
if code != 0:
    for l in lignes[:6]:
        print('   ', l[:160])
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
    code, lignes = controle(tree)
    for fic, txt in orig.items():
        open(os.path.join(tree, fic), 'w', encoding='utf-8').write(txt)
    verdict = 'VERT' if code == 0 else 'ROUGE'
    bon = (verdict == attendu)
    conformes += bon
    print('\n%s\n   -> [attendu %s, obtenu %s] %s'
          % (nom, attendu, verdict, 'OK' if bon else 'NON CONFORME'))
    for l in lignes:
        if l.startswith(('ROUGE', 'CRASH')):
            print('      ', l[:150])
            break

print('\n== CONTROLE SAIN, APRES ==')
code, lignes = controle(tree)
print('   code=%d  %s  (attendu VERT)' % (code, 'VERT' if code == 0 else 'ROUGE'))
for l in lignes:
    print('   ', l[:160])
print('\n──── %d / %d mutations conformes (%d ancres invalides) ────'
      % (conformes, len(MUT), invalides))
shutil.rmtree(base, ignore_errors=True)
