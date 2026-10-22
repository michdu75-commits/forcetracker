#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEANCE-REPOS-01 (session-C, Claude Seance, 22/10/2026) : les temoins C-REP-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc instable = campagne refusee).
M00 remet log.js, app.js et state.js tels qu'ils etaient AVANT le lot (master f82a7c07, ft-v1258), mot pour mot.
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et [equivalente] ne doivent PAS
faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Chaque mutation GARDE exige un TEMOIN PRECIS (4e champ) parmi les rouges : on prouve que CE temoin-la sait rougir.
Un PLANTAGE du banc (code de sortie hors 0/1, ligne PLANTAGE, ou pas de ligne de total) n'est JAMAIS « garde ».
Une mutation qui casse la SYNTAXE est refusee (elle rougirait tout, elle ne prouve rien).
Usage : python3 tools/mut_seance_repos.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'f82a7c07'
LO, AP, ST, CO, SC, CN = 'log.js', 'app.js', 'state.js', 'coach.js', 'screens.js', 'constants.js'
FICHIERS = (LO, AP, ST, CO, SC, CN)
FICHIERS_AVANT = (LO, AP, ST)

MEM_START = "  _reposMemoriser();             // SEANCE-REPOS-01 : le repos est rangé dans la séance active (il survit à une fermeture)\n"
MEM_STOP = "  _stopRestTimerOnly();\n  _reposMemoriser();             // SEANCE-REPOS-01 : un repos arrêté ne doit pas revenir au prochain démarrage"
MEM_PRESET = "  _reposMemoriser();             // SEANCE-REPOS-01 : la nouvelle durée survit à une fermeture\n"
MEM_ADDRT = "  _reposMemoriser();             // SEANCE-REPOS-01 : −15 s / +15 s survivent à une fermeture\n"
MEM_REGLER = "    _reposMemoriser();           // SEANCE-REPOS-01 : « Régler » survit à une fermeture\n"
GARDE_APP = ("\n_reposReprendre();", "\n_reposReprendre();\ndocument.addEventListener('visibilitychange',()=>{\n"
             "  if(document.visibilityState==='visible'&&restStartTs&&_restLeft()<=-5)stopRest();\n});")

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (master f82a7c07 : log.js, app.js, state.js)", 'AVANT', 'GARDE', 'C-REP-A1'),
    ('M1 le rangement ne fait plus rien (`_reposMemoriser` sort tout de suite)',
     [(LO, "function _reposMemoriser(){\n  try{", "function _reposMemoriser(){ return;\n  try{")], 'GARDE', 'C-REP-A1'),
    ('M2 « stopRest » n\'efface plus l\'etat range (Passer, GO, fin, abandon, vider, pause)',
     [(LO, MEM_STOP, "  _stopRestTimerOnly();")], 'GARDE', 'C-REP-F1'),
    ('M3 « startRest » ne range plus le repos',
     [(LO, MEM_START, "")], 'GARDE', 'C-REP-A1'),
    ('M4 « −15 s / +15 s » ne sont plus ranges',
     [(LO, MEM_ADDRT, "")], 'GARDE', 'C-REP-D1'),
    ('M5 un prereglage n\'est plus range',
     [(LO, MEM_PRESET, "")], 'GARDE', 'C-REP-D4'),
    ('M6 « Regler » n\'est plus range',
     [(LO, MEM_REGLER, "")], 'GARDE', 'C-REP-D3'),
    ('M7 [deguisee] la reprise REDEMARRE le repos (depart = maintenant)',
     [(LO, "  restTot=total; restStartTs=debut;", "  restTot=total; restStartTs=Date.now();")], 'GARDE', 'C-REP-A3'),
    ('M8 la reprise n\'applique plus l\'expiration (le repos clignote avant l\'arret au 1er tick)',
     [(LO, "  if(_restLeft()<=-REST_DEPASSEMENT_MAX){ stopRest(); return false; }   // abandonné : 15 min après la fin théorique\n", "")], 'GARDE', 'C-REP-B3'),
    # avenant du 22/10 apres-midi (decision de Michel) : 900 s. M9 remet l'ANCIENNE valeur du matin (300 s) — c'est la
    # regression la plus probable, et elle doit faire rougir le temoin qui rouvre a l'ancien instant d'abandon.
    ('M9 expiration remise a 5 min (300 s, la decision du matin)',
     [(LO, "const REST_DEPASSEMENT_MAX = 900;", "const REST_DEPASSEMENT_MAX = 300;")], 'GARDE', 'C-REP-B0'),
    ('M9a la meme regression vue app OUVERTE (300 s)',
     [(LO, "const REST_DEPASSEMENT_MAX = 900;", "const REST_DEPASSEMENT_MAX = 300;")], 'GARDE', 'C-REP-B5a'),
    ('M9b [deguisee] expiration a 901 s (une seconde de trop)',
     [(LO, "const REST_DEPASSEMENT_MAX = 900;", "const REST_DEPASSEMENT_MAX = 901;")], 'GARDE', 'C-REP-B2'),
    ('M9c [deguisee] expiration a 899 s (une seconde trop tot)',
     [(LO, "const REST_DEPASSEMENT_MAX = 900;", "const REST_DEPASSEMENT_MAX = 899;")], 'GARDE', 'C-REP-B1'),
    ('M9d [deguisee] la pilule garde l\'ancien seuil en dur (deux regles pour le meme repos)',
     [(LO, "  if(left<=-REST_DEPASSEMENT_MAX){pill.classList.remove('show');return;}", "  if(left<=-300){pill.classList.remove('show');return;}")], 'GARDE', 'C-REP-B1b'),
    ('M30 [deguisee] l\'arret app ouverte (`_restTick`) remet l\'ancien seuil en dur',
     [(LO, "  if(left<=-REST_DEPASSEMENT_MAX){ stopRest(); return; }", "  if(left<=-300){ stopRest(); return; }")], 'GARDE', 'C-REP-B5a'),
    ('M30b [deguisee] l\'arret app ouverte ecrit le BON nombre en dur (-900) : deux regles qui coincident aujourd\'hui',
     [(LO, "  if(left<=-REST_DEPASSEMENT_MAX){ stopRest(); return; }", "  if(left<=-900){ stopRest(); return; }")], 'GARDE', 'C-REP-S1'),
    ('M31 [deguisee] la reprise (`_reposReprendre`) remet l\'ancien seuil en dur',
     [(LO, "  if(_restLeft()<=-REST_DEPASSEMENT_MAX){ stopRest(); return false; }", "  if(_restLeft()<=-300){ stopRest(); return false; }")], 'GARDE', 'C-REP-B0'),
    ('M32 [deguisee] borne stricte a la reprise (15:17:00 pile reprend encore)',
     [(LO, "  if(_restLeft()<=-REST_DEPASSEMENT_MAX){ stopRest(); return false; }", "  if(_restLeft()<-REST_DEPASSEMENT_MAX){ stopRest(); return false; }")], 'GARDE', 'C-REP-B3'),
    # ── CALORIES (consigne de Michel, avenant du 22/10) : le moteur n'est PAS touche par le lot ; ces mutations simulent
    #    les fautes qui le feraient dependre du repos, pour prouver que C-REP-I / C-REP-J savent les voir.
    ('MC1 [deguisee] le chrono de seance retire le depassement du repos en cours (la duree depend du repos)',
     [(LO, "  return Math.max(0,end-S.wkt.startTs-paused);", "  return Math.max(0,end-S.wkt.startTs-paused-((typeof restStartTs!=='undefined'&&restStartTs&&_restLeft()<0)?-_restLeft()*1000:0));")], 'GARDE', 'C-REP-I1'),
    ('MC2 [deguisee] la reprise apres fermeture decale le depart de la seance (temps ferme compte deux fois)',
     [(LO, "  restTot=total; restStartTs=debut;", "  restTot=total; restStartTs=debut; S.wkt.startTs-=60000;")], 'GARDE', 'C-REP-J1'),
    ('MC3 la seance enregistree emporte le repos ET le moteur calorique le compte',
     [(LO, "  if(S.wkt.runId) sess.runId=S.wkt.runId;", "  if(S.wkt.runId) sess.runId=S.wkt.runId; if(S.wkt.repos) sess.repos=S.wkt.repos;"),
      (AP, "  const warmupCals = 3.5 * bw * (warmupMin/60);", "  const warmupCals = 3.5 * bw * (warmupMin/60) + (session.repos ? 12 : 0);")], 'GARDE', 'C-REP-I1'),
    ('MC4 la seance est enregistree deux fois (double comptage)',
     [(LO, "  S.sessions.unshift(sess);", "  S.sessions.unshift(sess); S.sessions.unshift(Object.assign({},sess));")], 'GARDE', 'C-REP-J2'),
    ('MC5 [negatif] le moteur calorique change un commentaire',
     [(AP, "  const warmupCals = 3.5 * bw * (warmupMin/60);", "  const warmupCals = 3.5 * bw * (warmupMin/60);   // inchange")], 'OK'),
    ('M10 la reprise ignore la pause (seance ouverte suffit)',
     [(LO, "  if(!lisible||!_wktEnCours()){ stopRest(); return false; }", "  if(!lisible||!_seanceOuverte()){ stopRest(); return false; }")], 'GARDE', 'C-REP-G2'),
    ('M11 la reprise accepte un depart dans le futur sans limite (horloge reculee)',
     [(LO, "&&total>0&&total<=3600&&debut+total*1000<=Date.now()+(Math.max(total,REST_PLUS_MAX)+5)*1000;", "&&total>0&&total<=3600;")], 'GARDE', 'C-REP-G2'),
    # revue de l'avenant (22/10 apres-midi) : « +15 s » tot dans le repos range un depart FUTUR ; la 1re version le refusait
    # revue de l'avenant : le rangement s'execute SANS geste ; il ne doit ecrire que `repos`, dans la MEME seance du disque
    ('MK1 le rangement reecrit toute la seance EN MEMOIRE de l\'onglet (la 1re version)',
     [(LO, "    const d=JSON.parse(localStorage.getItem('ft4_wkt')||'null'), w=S.wkt;", "    localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt)); return;\n    const d=JSON.parse(localStorage.getItem('ft4_wkt')||'null'), w=S.wkt;")], 'GARDE', 'C-REP-K1'),
    ('MK2 [deguisee] effacer retire le repos du disque quel qu\'il soit (celui, plus recent, de l\'autre onglet aussi)',
     [(LO, "    else if(avant&&d.repos&&d.repos.debut===avant.debut&&d.repos.total===avant.total) delete d.repos;", "    else if(d.repos) delete d.repos;")], 'GARDE', 'C-REP-K2'),
    ('MK3 [deguisee] plus de verification de la seance (le repos s\'ecrit dans une autre seance)',
     [(LO, "    if(!meme) return;                                  // une autre séance, ou plus de séance : rien", "    if(!d||typeof d!=='object') return;")], 'GARDE', 'C-REP-K3'),
    ('MD1 la reprise refuse de nouveau tout depart a plus de 5 s dans le futur (la 1re version du matin)',
     [(LO, "&&total>0&&total<=3600&&debut+total*1000<=Date.now()+(Math.max(total,REST_PLUS_MAX)+5)*1000;", "&&total>0&&total<=3600&&debut<=Date.now()+5000;")], 'GARDE', 'C-REP-D1b'),
    ('MD2 [deguisee] la tolerance oublie le plafond de « +15 s » (restant borne a la seule duree)',
     [(LO, "&&total>0&&total<=3600&&debut+total*1000<=Date.now()+(Math.max(total,REST_PLUS_MAX)+5)*1000;", "&&total>0&&total<=3600&&debut+total*1000<=Date.now()+(total+5)*1000;")], 'GARDE', 'C-REP-D1b'),
    ('MD3 [deguisee] le plafond de « +15 s » passe a 100 min (la reprise accepte alors n\'importe quel restant)',
     [(LO, "const REST_PLUS_MAX = 600;", "const REST_PLUS_MAX = 6000;")], 'GARDE', 'C-REP-G2'),
    ('M12 le brouillon de secours porte le repos (state.js remis a JSON.stringify(S.wkt))',
     [(ST, "localStorage.setItem('ft4_wkt_draft',JSON.stringify(Object.assign({},S.wkt,{repos:undefined})));", "localStorage.setItem('ft4_wkt_draft',JSON.stringify(S.wkt));")], 'GARDE', 'C-REP-A2'),
    ('M13 [deguisee] un repos deja fini rejoue la vibration de fin a la reprise',
     [(LO, "  _restBeeped=_restLeft()<=0;", "  _restBeeped=false;")], 'GARDE', 'C-REP-B1'),
    ('M14 l\'ancienne coupure a -5 s au retour au premier plan est remise (app.js)',
     [(AP,) + GARDE_APP], 'GARDE', 'C-REP-C1'),
    ('M15 le demarrage refait stopRest() au lieu de la reprise (app.js)',
     [(AP, "\n_reposReprendre();", "\nstopRest();")], 'GARDE', 'C-REP-A3'),
    ('M16 le mode demo ecrit quand meme',
     [(LO, "    if(window._demoMode) return;\n    const d=JSON.parse(", "    const d=JSON.parse(")], 'GARDE', 'C-REP-G4'),
    ('M17 [deguisee] le rangement passe par persist() (toutes les cles, le brouillon, la synchro)',
     [(LO, "    localStorage.setItem('ft4_wkt',JSON.stringify(d));\n  }catch(e){}\n}\n/* ⏱️ LA REPRISE", "    persist();\n  }catch(e){}\n}\n/* ⏱️ LA REPRISE")], 'GARDE', 'C-REP-G3'),
    ('M18 [deguisee] la structure s\'enrichit d\'un 3e champ (decision de Michel : {debut, total}, rien d\'autre)',
     [(LO, "    if(restStartTs) S.wkt.repos={debut:restStartTs,total:restTot};", "    if(restStartTs) S.wkt.repos={debut:restStartTs,total:restTot,ex:_restEx};")], 'GARDE', 'C-REP-A1'),
    ('M19 la seance enregistree emporte le repos',
     [(LO, "  if(S.wkt.runId) sess.runId=S.wkt.runId;", "  if(S.wkt.runId) sess.runId=S.wkt.runId; if(S.wkt.repos) sess.repos=S.wkt.repos;")], 'GARDE', 'C-REP-F2'),
    ('M20 Milo recoit le repos dans son contexte',
     [(CO, "gérer la fatigue.\\n${exLines}\\n`;", "gérer la fatigue.\\n${exLines}\\n${_wkt.repos?'repos '+JSON.stringify(_wkt.repos):''}`;")], 'GARDE', 'C-REP-H1'),
    ('M21 [equivalente] if(restStartTs) -> if(restStartTs>0) (meme sens)',
     [(LO, "    if(restStartTs) S.wkt.repos=", "    if(restStartTs>0) S.wkt.repos=")], 'OK'),
    ('M22 [negatif] un commentaire change',
     [(LO, "// SEANCE-REPOS-01 : la nouvelle durée survit à une fermeture", "// SEANCE-REPOS-01 : durée")], 'OK'),
    ('M23 la pause n\'arrete plus le repos',
     [(LO, "    if(typeof stopRest==='function')stopRest();\n    persist();\n    _syncWktPauseUI();", "    persist();\n    _syncWktPauseUI();")], 'GARDE', 'C-REP-F5'),
    ('M24 la reprise montre le dock sans relancer le tick',
     [(LO, "  if(restIv)clearInterval(restIv);\n  restIv=setInterval(_restTick,250);\n  if(_pillIv)clearInterval(_pillIv);\n  _pillIv=setInterval(_updPill,500);\n  return true;",
       "  if(_pillIv)clearInterval(_pillIv);\n  _pillIv=setInterval(_updPill,500);\n  return true;")], 'GARDE', 'C-REP-A3'),
    ('M25 [deguisee] le prereglage est range AVANT sa nouvelle duree',
     [(LO, "  restTot=sec;_restBeeped=false;_countdownSecs=new Set();\n" + MEM_PRESET, MEM_PRESET + "  restTot=sec;_restBeeped=false;_countdownSecs=new Set();\n")], 'GARDE', 'C-REP-D4'),
    ('M26 [deguisee] +15 s est range AVANT le recalcul du depart',
     [(LO, "  restStartTs=Date.now()-(restTot-newLeft)*1000;\n" + MEM_ADDRT, MEM_ADDRT + "  restStartTs=Date.now()-(restTot-newLeft)*1000;\n")], 'GARDE', 'C-REP-D1'),
    ('M27 [deguisee] une valeur douteuse n\'est plus effacee (on sort sans stopRest)',
     [(LO, "  if(!lisible||!_wktEnCours()){ stopRest(); return false; }", "  if(!lisible||!_wktEnCours()){ return false; }")], 'GARDE', 'C-REP-G2'),
    ('M28 la reprise ne montre pas le dock',
     [(LO, "  const bar=document.getElementById('rest-bar'); if(bar) bar.classList.add('show');\n  updRest(); _updPill();", "  updRest(); _updPill();")], 'GARDE', 'C-REP-A4'),
    # D-102 : « au-dela de 15 min » n'est plus un texte FAUX (revue de l'avenant) — M29 remet donc une vraie mauvaise duree
    ('M29 l\'aide « ? » de Seance dit « 10 min apres la fin »',
     [(SC, "15 min après la fin, il s\\'arrête seul. <b>L\\'app se ferme", "10 min après la fin, il s\\'arrête seul. <b>L\\'app se ferme")], 'GARDE', 'C-REP-S5'),
    ('M29d [deguisee] UN seul des deux points rouges donne une autre duree (« repos-maximum » : 20 minutes)',
     [(CN, "⏹️ 15 minutes après la fin du repos, le chrono", "⏹️ 20 minutes après la fin du repos, le chrono")], 'GARDE', 'C-REP-S5'),
    ('M29b [deguisee] l\'aide « ? » de Seance dit encore « 5 min apres la fin » (contenue dans « 15 min apres la fin »)',
     [(SC, "15 min après la fin, il s\\'arrête seul. <b>L\\'app se ferme", "5 min après la fin, il s\\'arrête seul. <b>L\\'app se ferme")], 'GARDE', 'C-REP-S5'),
    ('M29c le point rouge « repos-persistant » dit encore 5 min',
     [(CN, "et <b>15 min après la fin</b>, il s\\'arrête tout seul.", "et <b>5 min après la fin</b>, il s\\'arrête tout seul.")], 'GARDE', 'C-REP-S5'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_repos.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_rep_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS_AVANT}
            if any(not avant[f] for f in FICHIERS_AVANT) or all(avant[f] == cur[f] for f in FICHIERS_AVANT):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS_AVANT:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            for f in FICHIERS:
                chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
                if chk.returncode:
                    return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS_AVANT}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, avant), choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    tmp1, a1 = cloner()
    rouges1, plantage1 = banc(a1)
    shutil.rmtree(tmp1, ignore_errors=True)
    if rouges1 or plantage1:
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
