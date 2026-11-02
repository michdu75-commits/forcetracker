#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-REF-HIST-02 (3B, 31/10/2026) : le banc `tools/banc_journal_ecriture.js` (écrivain dédié du journal, persist() scindé, repli quota des séances,
écrivains Nutrition) sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du controle dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_journal_ecriture.py [J01|J02,J05|J10+]   (« J10+ » = de J10 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
ST = 'state.js'
G = lambda *c: ['B-JEC ' + x + ' ' for x in c]

MUT = [
    ('J01 l ecrivain du journal dit « reussi » meme quand setItem a leve',
     [(ST, "    _journalOk=false;\n    console.warn('[FT journal] écriture locale refusée',e);", "    _journalOk=true;\n    console.warn('[FT journal] écriture locale refusée',e);"),
      (ST, "    try{ if(typeof _logErr==='function')_logErr({m:'ft4_foodlog non écrit : '+String((e&&e.message)||e).slice(0,120)}); }catch(_){}\n    return false;", "    try{ if(typeof _logErr==='function')_logErr({m:'ft4_foodlog non écrit : '+String((e&&e.message)||e).slice(0,120)}); }catch(_){}\n    return true;")],
     G('G1b', 'G1c', 'G3A-après', 'G4b', 'G5a'), 'GARDE'),
    ('J02 l ecrivain du journal laisse remonter l exception',
     [(ST, "    try{ if(typeof _logErr==='function')_logErr({m:'ft4_foodlog non écrit : '+String((e&&e.message)||e).slice(0,120)}); }catch(_){}\n    return false;", "    throw e;")],
     G('G1b', 'G1c'), 'GARDE'),
    ('J03 le journal est ecrit EN TETE de persist (avant les cles des seances)',
     [(ST, "  _ecrireJournalLocal();\n  try{\n    _ecrireCleNutrition('ft4_savedfoods'", "  try{\n    _ecrireCleNutrition('ft4_savedfoods'"),
      (ST, "  const _rep={fait:false};   // le repli quota ne joue qu'UNE fois par appel, quelle que soit la phase qui échoue\n", "  const _rep={fait:false};   // le repli quota ne joue qu'UNE fois par appel, quelle que soit la phase qui échoue\n  _ecrireJournalLocal();\n")],
     G('G2b'), 'GARDE'),
    ('J04 le journal est ecrit en direct, sans l ecrivain dedie (la ligne d origine, hors try)',
     [(ST, "  _ecrireJournalLocal();\n  try{\n    _ecrireCleNutrition('ft4_savedfoods'", "  localStorage.setItem('ft4_foodlog',JSON.stringify(S.foodLog||[]));\n  try{\n    _ecrireCleNutrition('ft4_savedfoods'")],
     G('G3A-après', 'G6a'), 'GARDE'),
    ('J05 un echec du journal declenche le repli des SEANCES (le defaut d origine)',
     [(ST, "    _journalOk=false;\n    console.warn('[FT journal] écriture locale refusée',e);", "    _journalOk=false;\n    _persistRepli(e, {fait:false});\n    console.warn('[FT journal] écriture locale refusée',e);")],
     G('G3A-après', 'G6b'), 'GARDE'),
    ('J06 le repli peut se jouer deux fois dans le meme appel (garde « une seule fois » retiree)',
     [(ST, "    if(rep && rep.fait) return;\n    if(rep) rep.fait=true;\n", "")],
     G('G3E', 'G6b'), 'GARDE'),
    ('J07 la phase B n a plus de repli (un quota sur une cle apres le journal passe en silence)',
     [(ST, "  }catch(e){ _persistRepli(e, _rep); }\n  // Mise à jour reportée (app.js)", "  }catch(e){}\n  // Mise à jour reportée (app.js)")],
     G('G3C', 'G6b'), 'GARDE'),
    ('J08 l ecrivain du journal ecrit aussi une autre cle',
     [(ST, "  try{ localStorage.setItem('ft4_foodlog',JSON.stringify(S.foodLog||[])); _journalOk=true; return true; }", "  try{ localStorage.setItem('ft4_foodlog',JSON.stringify(S.foodLog||[])); localStorage.setItem('ft4_hist_tronque','1'); _journalOk=true; return true; }")],
     G('G1a', 'G6b', 'G3A-après'), 'GARDE'),
    ('J09 _journalPersister dit toujours « reussi »',
     [(A, "  return a.seq>avant && a.ok===true;\n}", "  return true;\n}")],
     G('G4b', 'G1e', 'G5a'), 'GARDE'),
    ('J10 _journalPersister prend l issue ANCIENNE pour celle de cette sauvegarde (compteur ignore)',
     [(A, "  return a.seq>avant && a.ok===true;\n}", "  return a.ok===true;\n}")],
     G('G1e'), 'GARDE'),
    ('J11 le bandeau « Reessayer » ne s affiche jamais',
     [(A, "  if(_journalEtat().ok!==false) return '';", "  return '';")],
     G('G4c', 'G5a'), 'GARDE'),
    ('J12 addFoodEntry annonce toujours le succes',
     [(A, "  toast(_sauve ? _afToastAjout() : _N_MSG_JOURNAL, _sauve ? 'success' : 'error');\n}", "  toast(_afToastAjout(), 'success');\n}")],
     G('G4b'), 'GARDE'),
    ('J13 quickAddFood annonce toujours le succes',
     [(A, "    toast(_sauve ? _afToastAjout() : _N_MSG_JOURNAL, _sauve ? 'success' : 'error');\n  });", "    toast(_afToastAjout(), 'success');\n  });")],
     G('G4b'), 'GARDE'),
    ('J14 removeFoodEntry se tait quand la suppression n est pas ecrite',
     [(A, "  if(!_sauve) toast(_N_MSG_SUPPR_JOURNAL,'error');\n}\n// Demande confirmation", "}\n// Demande confirmation")],
     G('G4b'), 'GARDE'),
    ('J15 saveEditFood annonce toujours « Modifie »',
     [(A, "  toast(_sauve ? 'Modifié ✅' : _N_MSG_JOURNAL, _sauve ? 'success' : 'error');", "  toast('Modifié ✅','success');")],
     G('G4b'), 'GARDE'),
    ('J16 « Tes repas habituels » annonce toujours le succes',
     [(A, "  if(!sauve){ toast(_N_MSG_JOURNAL,'error'); return; }\n  const mi=", "  const mi=")],
     G('G4b'), 'GARDE'),
    ('J17 le repli des seances perd le drapeau « historique tronque »',
     [(ST, "      localStorage.setItem('ft4_hist_tronque','1'); S.histTronque=true;", "      S.histTronque=true;")],
     G('G3B', 'G3C'), 'GARDE'),
    ('J18 le repli des seances ne ramene plus les seances a 50',
     [(ST, "      localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));", "      localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,60)));")],
     G('G3B', 'G3C'), 'GARDE'),
    ('J19 le mode demo ecrit le journal',
     [(ST, "  if(window._demoMode){ _journalOk=true; return true; }", "  if(false){ _journalOk=true; return true; }")],
     G('G1d'), 'GARDE'),
    ('J20 le compteur de tentatives n avance plus',
     [(ST, "function _ecrireJournalLocal(){\n  _journalSeq++;", "function _ecrireJournalLocal(){")],
     G('G4a', 'G1a'), 'GARDE'),
    ('J21 le journal est essaye APRES les cles suivantes (rang change)',
     [(ST, "  _ecrireJournalLocal();\n  try{\n    _ecrireCleNutrition('ft4_savedfoods',JSON.stringify(S.savedFoods||[]));", "  try{\n    _ecrireCleNutrition('ft4_savedfoods',JSON.stringify(S.savedFoods||[]));\n    _ecrireJournalLocal();")],
     G('G2b', 'G6a'), 'GARDE'),
    ('J22 « Reessayer » CREE une ligne (au lieu de reecrire)',
     [(A, "function _journalReessayer(){\n  const ok=_journalPersister();", "function _journalReessayer(){\n  S.foodLog.push(Object.assign({}, S.foodLog[S.foodLog.length-1], {id:_foodLineId()}));\n  const ok=_journalPersister();")],
     G('G5a'), 'GARDE'),
    ('J23 le message d echec demande de re-saisir (ou de retoucher) le repas',
     [(A, "puis touche « Réessayer l\\'enregistrement » en haut du journal — ne le ressaisis pas.", "puis touche de nouveau le repas.")],
     G('G4d'), 'GARDE'),
    ('J24 le message d echec ne dit plus que ce sera PERDU',
     [(A, "c\\'est à l\\'écran mais ce sera PERDU si tu fermes l\\'application. ", "c\\'est à l\\'écran. ")],
     G('G4d'), 'GARDE'),
    ('J25 l ecrivain du journal leve une exception NON rattrapee (le temoin G6e ne valait plus que « true » en dur avant le 01/11/2026)',
     [(ST, "function _ecrireJournalLocal(){\n  _journalSeq++;", "function _ecrireJournalLocal(){\n  _journalSeq++;\n  setTimeout(function(){ throw new Error('exception inattendue du journal'); },0);")],
     G('G6e'), 'GARDE'),
]

def banc(arbre):
    env = dict(os.environ, FT_DEPOT_GIT=SRC)   # la copie n'a pas de .git : le témoin relit `persist()` de master dans le vrai dépôt
    r = subprocess.run(['node', 'tools/banc_journal_ecriture.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_jec_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis:
        seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, attendu in MUT:
        if depuis and nom.startswith(seul + ' '):
            actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')):
            continue
        if depuis and not actif:
            continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s' % nom)
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:230]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:230]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        ok = rc == 1 and not manquants
        conformes += ok
        print('  %s %s -> %s  [%s]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, 'code %d' % rc))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s\n' % (' · '.join(re.sub(r' (⭐|—|:|\().*', '', x)[:24] for x in rouges) or 'aucun'))
    print('\n%d/%d tuees (conformes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
