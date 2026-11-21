#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SCMAJ (D-170, 16/11/2026) : les temoins B-SCMAJ savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation RETIRE une garde (ou remet un defaut) ; le banc `tools/banc_seance_maj.js` doit alors rougir AU MOINS UNE fois. Une mutation qui laisse
le banc vert = un temoin qui ne protege rien (R17). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Chaque mutation dit dans QUEL scenario elle doit etre vue (SCMAJ_SEUL) : 'pur' = les temoins de source seuls (instantanes).
Usage : python3 tools/mut_seance_maj.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_maj.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'coach.js', 'log.js', 'setup.js', 'screens.js', 'state.js')
AP, CJ, LO, SU = 'app.js', 'coach.js', 'log.js', 'setup.js'
SC, ST = 'screens.js', 'state.js'   # lot M (D-170, 17/11/2026) : les chemins qui rechargeaient tout seuls (retour a l'Accueil, enregistrement)

# ── les lignes de la decision « peut-on appliquer ? » (app.js) ──
FIN_LECTEUR = "  if(typeof _finishing!=='undefined' && _finishing) return false;      // fin de séance en cours — levé par la FIN de `finishWorkout` (`finally`), jamais par l'écoulement d'un délai (lot M)\n"
# lot M : le balayage par l'âge n'existe plus — la mutation M18 le REMET (un verrou qui expire par le temps)
BALAI_REMIS = "  if(typeof _finishing!=='undefined' && _finishing && (window.__fsT=window.__fsT||Date.now(), Date.now()-window.__fsT>120000)) _finishing=false;\n"
RECAP = "  if(ov&&ov.classList.contains('open')) return false;                  // récapitulatif à l'écran\n"
VIVE = "  if(typeof _dbfAnalyseVive==='function' && _dbfAnalyseVive()) return false;\n"
LISTE = "  if(['ov-debrief-milo','ov-week-summary','ov-month-summary'].some(id=>{ const o=document.getElementById(id); return !!(o&&o.classList.contains('open')); })) return false;"
APPLIQUER = "  if(!_majPeutSAppliquer()){ _majRefresh(); return false; }"   # lot M (D-170) : plus de parametre `demande`
REGLE_SEANCE = "  if(typeof _seanceOuverte==='function' ? _seanceOuverte()\n     : (S.wkt&&S.wkt.exs&&S.wkt.exs.length)) return false;             // séance non terminée\n"
# ── log.js ──
FINALLY = "  }finally{ _finishing=false; }\n"
POSE_VRAI = "  _finishing=true;\n"
DELAI_APPEL = "(typeof _DBF_DELAI_MS!=='undefined')?_DBF_DELAI_MS:90000"
MSG = "Ta séance, elle, est bien enregistrée."
FIN_REFRESH_RUN = "try{ if(typeof _majRefresh==='function') _majRefresh(); }catch(e){}   // D-170 : le verrou « briefing en cours »"
FIN_REFRESH_CLOSE = "try{ if(typeof _majRefresh==='function') _majRefresh(); }catch(e){}   // D-170 : le récapitulatif est FERMÉ"
# ── coach.js ──
VIVE_CORPS = "function _dbfAnalyseVive(){ return _dbfActifs.size>0; }"
VIVE_POSE = "_dbfVolEcrire(v); _dbfActifs.add(String(id)); }"
RETIRE_ACTIF = "    _dbfActifs.delete(String(sid));   // D-170 (CE lot M) : l'opération est TERMINÉE (réponse, échec, délai, exception) — c'est CELA, et rien d'autre, qui rend la main à la mise à jour\n"
DELAI = "const _DBF_DELAI_MS = 90000;"
OUBLIER = "function _dbfOublier(id){\n"
# ── setup.js ──
FERMER = "try{if(typeof _majRefresh==='function')_majRefresh();}catch(e){}}   /* D-170 : briefing refermé"

# (nom, [(fichier, avant, apres)], attendu, scenarios SCMAJ_SEUL ('pur' = source seule))
MUT = [
    # ── la SEANCE, l'ENREGISTREMENT, le RECAPITULATIF ──
    ('M01 ⛔⛔ le verrou « fin de séance » n\'est plus lu par la décision : le rechargement tombe PENDANT la sauvegarde (la fenêtre de ft-v1184)',
     [(AP, FIN_LECTEUR, "")], 'GARDE', 'A'),
    ('M02 ⛔⛔ le récapitulatif ouvert ne retient plus la mise à jour : elle tombe PENDANT la consultation',
     [(AP, RECAP, "")], 'GARDE', 'A'),
    ('M03 ⛔⛔ la règle « séance ouverte » est retirée : la mise à jour tombe PENDANT la séance',
     [(AP, REGLE_SEANCE, "")], 'GARDE', 'A'),
    # (M04 retiré : « `_appliquerMaj` ne consulte plus la décision » recharge la page en BOUCLE — le scénario ne finit jamais ; M01, M02 et M03 retirent chacune des gardes de la même décision)
    # ── la GENERATION du briefing ──
    ('M05 ⛔⛔ la décision ne lit plus « briefing en cours de génération » : la mise à jour tombe, la requête est annulée, le briefing perdu',
     [(AP, VIVE, "")], 'GARDE', 'B'),
    ('M06 ⛔ `_dbfAnalyseVive` répond toujours « non » (coach.js) : la génération ne retient rien',
     [(CJ, VIVE_CORPS, "function _dbfAnalyseVive(){ return false; }")], 'GARDE', 'B'),
    ('M07 ⛔⛔ la fin de l\'analyse ne retire plus l\'opération (`finally` de `_runSeDebrief`) : un verrou qui ne se lèverait JAMAIS (lot M : plus aucun délai pour le lever)',
     [(LO, RETIRE_ACTIF, "")], 'GARDE', 'B'),
    ('M08 ⛔⛔ `_dbfVolPoser` n\'enregistre plus l\'opération en cours : la génération ne retient rien (testé par l\'exécution de la décision, sans navigateur)',
     [(CJ, VIVE_POSE, "_dbfVolEcrire(v); }")], 'GARDE', 'pur'),
    ('M09 ⛔ le délai d\'attente du briefing n\'est plus fini (1e9 ms) : une requête suspendue laisse « Milo analyse… » à l\'écran, sans issue dite',
     [(LO, DELAI_APPEL, "1e9")], 'GARDE', 'E'),
    # (M10 déplacé : le signal d'annulation vit maintenant dans `_fetchBorne` — mutations dans tools/mut_seance_ce_m.py)
    ('M11 ⛔ le délai d\'attente du briefing est supprimé (0) : le test « l\'opération a un délai fini » rougit',
     [(CJ, DELAI, "const _DBF_DELAI_MS = 0;")], 'GARDE', 'pur'),
    ('M12 ⛔ le message d\'échec redit « Rien n\'est enregistré » (lu : la SÉANCE n\'est pas enregistrée) au lieu de rassurer',
     [(LO, MSG, "Rien n\\'est enregistré.")], 'GARDE', 'D'),
    # ── la CONSULTATION depuis Progrès, les BILANS ──
    ('M13 ⛔ le bilan de la SEMAINE ouvert ne retient plus la mise à jour (refermé par le rechargement, il ne reviendrait pas)',
     [(AP, LISTE, LISTE.replace("'ov-week-summary',", ""))], 'GARDE', 'C'),
    ('M14 ⛔ le bilan du MOIS ouvert ne retient plus la mise à jour',
     [(AP, LISTE, LISTE.replace(",'ov-month-summary'", ""))], 'GARDE', 'C'),
    ('M15 ⛔⛔ le briefing consulté depuis Progrès (« Débrief Milo ») ne retient plus la mise à jour : « Redémarrer maintenant » la recharge par-dessus',
     [(AP, LISTE, LISTE.replace("'ov-debrief-milo',", ""))], 'GARDE', 'C'),
    # ── les VERROUS SE LEVENT ──
    ('M16 ⛔⛔ la fin de séance ne lève plus son verrou sur une EXCEPTION (le `finally` retiré) : plus de mise à jour, et « Terminer » ignoré à la séance suivante',
     [(LO, FINALLY, "  }finally{}\n")], 'GARDE', 'F'),
    ('M17 ⛔ le verrou de fin de séance porte de nouveau l\'HEURE de sa pose (`Date.now()`) : il pourrait de nouveau se périmer (lot M : interdit)',
     [(LO, POSE_VRAI, "  _finishing=Date.now();\n")], 'GARDE', 'A'),
    ('M18 ⛔⛔ un balayage par le TEMPS est remis dans la décision (le verrou de fin de séance se lève au bout de 120 s, comme l\'ancien « filet ») : la mise à jour retombe sur une opération encore active',
     [(AP, FIN_LECTEUR, BALAI_REMIS + FIN_LECTEUR)], 'GARDE', 'E'),
    ('M19 ⛔⛔ `_dbfAnalyseVive` redevient bornée par le TEMPS (120 s) : une analyse encore en vol est déclarée « non vive » (la sonde U06)',
     [(CJ, VIVE_CORPS, "function _dbfAnalyseVive(){ return _dbfActifs.size>0 && (Date.now()-(window.__avT=window.__avT||Date.now()))<120000; }")], 'GARDE', 'E'),
    # ── les CHEMINS de rechargement ──
    ('M20 ⛔ un NOUVEAU rechargement apparaît dans coach.js, en dehors de `_appliquerMaj` : la liste connue des rechargements ne tient plus',
     [(CJ, OUBLIER, OUBLIER + "  if(false) location.reload();\n")], 'GARDE', 'pur'),
    # ── la PROPOSITION paraît au bon moment ──
    ('M21 ⛔ la fin de l\'analyse ne réévalue plus l\'avis (`_runSeDebrief`) : le briefing est écrit, rien ne se propose avant le prochain enregistrement',
     [(LO, FIN_REFRESH_RUN, FIN_REFRESH_RUN.replace("try{ if(typeof _majRefresh==='function') _majRefresh(); }", "try{ }"))], 'GARDE', 'G'),
    ('M22 ⛔ le récapitulatif fermé ne réévalue plus l\'avis (`closeSessionEnd`) : la proposition n\'apparaît pas à la fermeture',
     [(LO, FIN_REFRESH_CLOSE, FIN_REFRESH_CLOSE.replace("try{ if(typeof _majRefresh==='function') _majRefresh(); }", "try{ }"))], 'GARDE', 'D'),
    ('M23 ⛔ le briefing consulté depuis Progrès, refermé, ne réévalue plus l\'avis (`fermerDebriefMilo`)',
     [(SU, FERMER, "}   /* D-170 : briefing refermé")], 'GARDE', 'C'),
    # ── lot M (D-170, 17/11/2026) : AUCUN rechargement automatique, même sur l'Accueil — les trois chemins qui rechargeaient tout seuls, remis un à un ──
    ('M24 ⛔⛔ le retour à l\'Accueil applique de nouveau la mise à jour TOUT SEUL (screens.js : le rechargement automatique de ft-v1184 revient)',
     [(SC, "  if(id==='home'&&_prevScreen!=='home'){ try{ if(typeof _majRepropose==='function')_majRepropose(); }catch(e){} }",
           "  if(id==='home'){ try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){} }")], 'GARDE', 'A'),
    ('M25 ⛔⛔ `persist()` applique de nouveau la mise à jour TOUT SEUL (state.js : l\'enregistrement recharge la page dès que rien ne l\'interdit)',
     [(ST, "  try{ if(typeof _majRefresh==='function')_majRefresh(); }catch(e){}\n  _cloudSyncDebounced();",
           "  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}\n  _cloudSyncDebounced();")], 'GARDE', 'A'),
    ('M26 ⛔⛔ l\'arrivée d\'une nouvelle version recharge de nouveau (`_reloadForUpdate` rappelle `_appliquerMaj`)',
     [(AP, "  _majLireVersion();                                 // cherche la version qui attend et montre le bandeau (`_majRefresh`) si rien ne l'interdit\n",
           "  _majLireVersion();\n  _appliquerMaj();\n")], 'GARDE', 'A'),
]

BANC = os.path.join('tools', 'banc_seance_maj.js')


def banc(arbre, scenarios):
    env = dict(os.environ, TZ='Europe/Paris')
    arg = ['pur']
    if scenarios == 'tout':
        arg = []
    elif scenarios and scenarios != 'pur':
        env['SCMAJ_SEUL'] = scenarios
        arg = ['ecran']
    try:
        r = subprocess.run(['node', BANC] + arg, cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    except subprocess.TimeoutExpired:
        return ['DELAI : le scenario ne finit pas (une page qui se recharge en boucle est un defaut vu, pas un vert)'], '?'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_scmaj_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le service worker precache les images du catalogue : on les lie (lecture seule) plutot que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    if not os.environ.get('MUT_SANS_BASE'):
        tmp0, a0 = cloner()
        rouges, bilan = banc(a0, 'tout')
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges:
            print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
        print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu, scenarios in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        if seul and not nom.startswith(seul):
            continue
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, bilan = banc(arbre, scenarios)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
