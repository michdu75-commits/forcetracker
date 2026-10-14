#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — PROGRES-SEANCES-01 (session-B) : les temoins B-PS01-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (master a0eab5b3, ft-v1254), mot pour mot.
Les mutations marquees [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et
[equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Usage : python3 tools/mut_progres_seances.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)

[!!] DURCI le 14/10 (micro-fermeture PROGRES-SEANCES-INTEGRATION-01, reserves du contre-check B) :
  - un PLANTAGE du banc (code de sortie hors 0/1, ligne PLANTAGE, ou pas de ligne de total) n'est JAMAIS « garde » :
    il est classe PLANTAGE, donc non conforme ;
  - une mutation peut exiger un TEMOIN PRECIS (4e champ) : sans lui parmi les rouges, elle n'est pas conforme —
    on prouve que CE temoin-la sait rougir, pas seulement qu'un autre rougit ;
  - MUT_J vaut 1 par defaut (une mutation a la fois : pas de contention qui fabriquerait un rouge par lenteur), et
    l'arbre sain est REJOUE a la fin : s'il rougit, la campagne est refusee (banc instable).
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'a0eab5b3'
SE, LO, CO, SC, IX, CT, AP = 'setup.js', 'log.js', 'coach.js', 'screens.js', 'index.html', 'constants.js', 'app.js'
FICHIERS = ('setup.js', 'log.js', 'coach.js', 'screens.js', 'index.html', 'constants.js', 'app.js', 'style.css')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (master a0eab5b3)", 'AVANT', 'GARDE', 'PS-E01'),
    ('M1 le plafond de 20 cartes revient',
     [(SE, "  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  /* 🗂️",
           "  flist=flist.slice(0,20);\n  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  /* 🗂️")], 'GARDE', 'PS-S2'),
    ('M2 [deguisee] le regroupement perd la plus ancienne seance de chaque mois',
     [(SE, "          +(o?'<div class=\"sess-mois-cartes\">'+L.map(_sessCarteHtml).join('')+'</div>':'')",
           "          +(o?'<div class=\"sess-mois-cartes\">'+L.slice(0,Math.max(1,L.length-1)).map(_sessCarteHtml).join('')+'</div>':'')")], 'GARDE', 'PS-E11'),
    ('M3 [deguisee] une carte en double (la 1re seance du mois dessinee deux fois)',
     [(SE, "          +(o?'<div class=\"sess-mois-cartes\">'+L.map(_sessCarteHtml).join('')+'</div>':'')",
           "          +(o?'<div class=\"sess-mois-cartes\">'+L.concat(L.slice(0,1)).map(_sessCarteHtml).join('')+'</div>':'')")], 'GARDE', 'PS-E11'),
    ('M4 toutes les annees depliees par defaut',
     [(SE, ":(an===today().slice(0,4));}", ":true;}")], 'GARDE', 'PS-E09'),
    ('M5 tous les mois deplies par defaut (seul le mois courant l\'est, decision du 14/10)',
     [(SE, ":(m===today().slice(0,7));}", ":true;}")], 'GARDE', 'PS-E10'),
    ('M6 [deguisee] seances rangees sous le mois PRECEDENT (cle de mois decalee)',
     [(SE, "return /^\\d{4}-\\d{2}/.test(d)?d.slice(0,7):'?';}", "if(!/^\\d{4}-\\d{2}/.test(d))return '?';const x=new Date(d.slice(0,7)+'-01T12:00:00');x.setMonth(x.getMonth()-1);return x.toISOString().slice(0,7);}")], 'GARDE', 'PS-E12'),
    ("M7 Milo recoit la periode de l'ecran (28 jours par defaut)",
     [(CO, "    const v=_volumeParMuscle();\n    if(!v || !v.series || !v.liste.length) return '';    // rien fait",
           "    const v=_volumeParMuscle(undefined,(typeof _volJours!=='undefined'?_volJours:14));\n    if(!v || !v.series || !v.liste.length) return '';    // rien fait")], 'GARDE', 'PS-E22'),
    ('M8 [deguisee] la fenetre par defaut passe a 28 (Milo change en silence)',
     [(LO, "const VOL_FENETRE_JOURS = 14;", "const VOL_FENETRE_JOURS = 28;")], 'GARDE', 'PS-E22'),
    ('M9 [deguisee] la moyenne divise toujours par 2 semaines (28 jours faux)',
     [(LO, "  const out={jours:J, semaines:J/7,", "  const out={jours:J, semaines:2,")], 'GARDE', 'PS-E19'),
    ("M10 l'ecran s'ouvre sur 14 jours (decision : 28 par defaut)",
     [(SE, "let _volJours=28;", "let _volJours=14;")], 'GARDE', 'PS-E17'),
    ('M11 le choix 14 jours ne change rien (la periode passee est ignoree)',
     [(LO, "  const J=(VOL_PERIODES_JOURS.indexOf(jours)>=0)?jours:VOL_FENETRE_JOURS;", "  const J=28;")], 'GARDE', 'PS-E20'),
    ("M12 un bloc global reste dans Exercices (le filtre d'historique)",
     [(IX, '    <div id="sess-filter"></div>\n    <div id="sess-list"></div>', '    <div id="sess-list"></div>'),
      (IX, '    <div id="prog-cycle-banner" style="display:none;"></div>', '    <div id="prog-cycle-banner" style="display:none;"></div>\n    <div id="sess-filter"></div>')], 'GARDE', 'PS-E03'),
    ('M13 le sous-onglet est de nouveau force (Exercices a chaque ouverture)',
     [(SE, "  switchProgTab(_progTab,document.getElementById(PROG_ONGLETS[_progTab][0]));", "  switchProgTab('exo',document.getElementById('ptab-exo'));")], 'GARDE', 'PS-E02'),
    ('M14 le calendrier ne vise plus la seance (« Revoir la seance » nu)',
     [(SC, "    +'<div onclick=\"goSessionsHistory('+_argAttr(sess.map(s=>s.ts||s.id||0))+')\" class=\"ft-press\"", "    +'<div onclick=\"goSessionsHistory()\" class=\"ft-press\"")], 'GARDE', 'PS-E28'),
    ('M15 [deguisee] la cible marque tout le MOIS au lieu des seances visees',
     [(SE, "    const _cible=_sessCibles.indexOf(s.ts||s.id||0)>=0;",
           "    const _cible=(S.sessions||[]).some(x=>_sessCibles.indexOf(x.ts||x.id||0)>=0&&_sessMoisDe(x)===_sessMoisDe(s));")], 'GARDE', 'PS-E28'),
    ('M16 [deguisee] la cible par DATE de la 1re cle (une seule seance du jour retrouvee)',
     [(SE, "    const _cible=_sessCibles.indexOf(s.ts||s.id||0)>=0;", "    const _cible=_sessCibles.length>0&&(s.ts||s.id||0)===_sessCibles[0];")], 'GARDE', 'PS-E28'),
    ('M17 consulter un mois ecrit une cle de stockage',
     [(SE, "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisEstOuvert(m);renderSessions();}",
           "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisEstOuvert(m);try{localStorage.setItem('ft4_sessMois',JSON.stringify(_sessMoisOuvert));}catch(e){}renderSessions();}")], 'GARDE', 'PS-E36'),
    ('M18 [deguisee] consulter Progres modifie S.sessions (marque « vue » + persist)',
     [(SE, "function _sessCarteHtml(s){\n", "function _sessCarteHtml(s){\n    if(!s._vu){s._vu=1;try{persist();}catch(e){}}\n")], 'GARDE', 'PS-E35'),
    ("M19 le point rouge du filtre vise toujours l'onglet Exercices",
     [(CT, "{id:'sess-filter', screen:'progress', spot:'ptab-seances',", "{id:'sess-filter', screen:'progress', spot:'ptab-exo',")], 'GARDE', 'PS-E32'),
    ("M20 l'aide « ? » garde l'ancienne repartition (Exercices · Poids · Badges)",
     [(SC, "{i:'🚶',t:'<b>« Tes pas »</b> (sous-onglet <b>Corps &amp; santé</b>)", "{i:'🚶',t:'<b>« Tes pas »</b> (sous-onglet <b>Poids</b>)")], 'GARDE', 'PS-E33'),
    ('M21 le Guide garde « Progres → historique » et l\'ancienne repartition',
     [(AP, "{icon:'🗂️', t:'Progrès : Séances d\\'abord', cap:'<b>Séances</b> passe en premier",
           "{icon:'🗂️', t:'Le haut de Progrès se replie', cap:'Les trois onglets (<b>Exercices · Poids · Badges</b>) sont <b>tout en haut</b>. <b>Séances</b> passe en premier")], 'GARDE', 'PS-E34'),
    ("M22 l'onglet Badges disparait (relocalisation non decidee)",
     [(SE, ",\n                    poids:['ptab-poids','prog-poids','10px'], badges:['ptab-badges','prog-badges','12px']};",
           ",\n                    poids:['ptab-poids','prog-poids','10px']};"),
      (IX, '    <button class="nu-tab" id="ptab-badges" onclick="switchProgTab(\'badges\',this)">Badges</button>\n', '')], 'GARDE', 'PS-E01'),
    ('M23 [deguisee] le bouton de debrief disparait au-dela des 20 dernieres seances',
     [(SE, "    const _dbfId=(typeof _dbfCle==='function')?_dbfCle(s):'';", "    const _dbfId=(typeof _dbfCle==='function'&&S.sessions.indexOf(s)<20)?_dbfCle(s):'';")], 'GARDE', 'PS-E14'),
    ('M24 [deguisee] l\'analyse d\'un exercice change (Progres = derniere - record)',
     [(SE, "  const delta=pts.length>1?fmt(last.rm1-pts[0].rm1):null;", "  const delta=pts.length>1?fmt(last.rm1-maxPt.rm1):null;")], 'GARDE', 'PS-E07'),
    ('M25 le bandeau de cycle quitte Exercices (statu quo non tenu)',
     [(IX, '    <div id="prog-cycle-banner" style="display:none;"></div>\n', ''),
      (IX, '    <div id="sess-filter"></div>\n', '    <div id="prog-cycle-banner" style="display:none;"></div>\n    <div id="sess-filter"></div>\n')], 'GARDE', 'PS-E38'),
    ('M28 [deguisee] les seances sans date (ou mal datees) disparaissent du regroupement',
     [(SE, "  flist.forEach(s=>{const m=_sessMoisDe(s),an=m==='?'?'?':m.slice(0,4);", "  flist.forEach(s=>{if(_sessMoisDe(s)==='?')return;const m=_sessMoisDe(s),an=m==='?'?'?':m.slice(0,4);")], 'GARDE', 'PS-E39'),
    ('M29 une porte d\'entree garde le filtre de muscle (la seance visee peut etre cachee)',
     [(SE, "  _sessFilter=null;\n  _sessOuvrir(mois);", "  _sessOuvrir(mois);")], 'GARDE', 'PS-E40'),
    ('M30 [deguisee] fermer le detail replie les mois (le retour ne ramene plus au mois)',
     [(SE, "  _sessId=null;_sessEdits=null;_sdDelConfirm=false;\n", "  _sessId=null;_sessEdits=null;_sdDelConfirm=false;\n  try{Object.keys(_sessMoisOuvert).forEach(k=>delete _sessMoisOuvert[k]);renderSessions();}catch(e){}\n")], 'GARDE', 'PS-E13b'),
    # ── PROGRES-SEANCES-INTEGRATION-01 (session-B, 14/10) : decision de Michel — le mois courant s'ouvre seul en entree normale ──
    ('M31 le mois courant redevient replie en entree normale (decision du 14/10 non tenue)',
     [(SE, ":(m===today().slice(0,7));}", ":false;}")], 'GARDE', 'PS-E10'),
    ('M32 [deguisee] la bascule lit l\'etat BRUT (« absent » = replie) : le 1er tap ne replie pas le mois courant',
     [(SE, "_sessMoisOuvert[m]=!_sessMoisEstOuvert(m);", "_sessMoisOuvert[m]=!_sessMoisOuvert[m];")], 'GARDE', 'PS-E42'),
    ('M33 [deguisee] sans seance ce mois-ci, le mois le plus recent s\'ouvre a la place',
     [(SE, "const o=_sessMoisEstOuvert(m),L=A.parMois[m];", "const o=_sessMoisEstOuvert(m)||(an===ans[0]&&m===A.mois[0]),L=A.parMois[m];")], 'GARDE', 'PS-E41'),
    ('M34 [deguisee] le mois courant est INVENTE (en-tete vide) quand il n\'a aucune seance',
     [(SE, "  const desc=(a,b)=>a==='?'?1:b==='?'?-1:(a<b?1:a>b?-1:0);",
           "  {const mc=today().slice(0,7),ac=mc.slice(0,4);if(!parAn[ac]){parAn[ac]={mois:[],parMois:{},n:0};ans.push(ac);}if(!parAn[ac].parMois[mc]){parAn[ac].parMois[mc]=[];parAn[ac].mois.push(mc);}}\n  const desc=(a,b)=>a==='?'?1:b==='?'?-1:(a<b?1:a>b?-1:0);")], 'GARDE', 'PS-E41'),
    ('M36 [deguisee] une porte d\'entree ouvre toujours le mois COURANT (le mois de la seance visee reste replie)',
     [(SE, "  const mois=vis.length?vis.map(_sessMoisDe):[_sessMoisDe({date:today()})];", "  const mois=[_sessMoisDe({date:today()})];")], 'GARDE', 'PS-E44'),
    # ── micro-fermeture du 14/10 : temoins durcis (PS-S8, PS-E41 positif, PS-E43, PS-E45 → PS-E48) ──
    ('M37 [deguisee] une porte ciblee cede au repli manuel (le mois replie a la main reste replie)',
     [(SE, "function _sessOuvrir(mois){(mois||[]).forEach(m=>{_sessMoisOuvert[m]=true;", "function _sessOuvrir(mois){(mois||[]).forEach(m=>{if(_sessMoisOuvert[m]!==false)_sessMoisOuvert[m]=true;")], 'GARDE', 'PS-E27'),
    ('M38 [deguisee] le repli du mois survit a la relance (garde dans le stockage et relu)',
     [(SE, "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisEstOuvert(m);renderSessions();}",
           "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisEstOuvert(m);try{localStorage.setItem('ft4_mc_'+m,_sessMoisOuvert[m]?'1':'0');}catch(e){}renderSessions();}"),
      (SE, ":(m===today().slice(0,7));}", ":(m===today().slice(0,7)&&localStorage.getItem('ft4_mc_'+m)!=='0');}")], 'GARDE', 'PS-E47'),
    # ⚠️ M39 re-visee : retirer seulement `nowrap` ne fait passer AUCUNE etiquette a la ligne (mesure du 14/10 : 0 rouge,
    #    la mutation ne fabriquait pas le defaut qu'elle pretendait). Celle-ci le fabrique : « Corps & sante » sur 2 lignes a 390 px.
    ('M39 une etiquette d\'onglet passe sur deux lignes (white-space:normal, onglets plus larges)',
     [('style.css', "#s-progress .nu-tab{flex:1 1 auto;white-space:nowrap;padding:10px 6px;}", "#s-progress .nu-tab{flex:1 1 auto;white-space:normal;padding:10px 22px;}")], 'GARDE', 'PS-E43'),
    ('M40 la marque bleue survit a une entree normale',
     [(SE, "  if(!_progCibleNav) _sessCibles=[];", "  if(!_progCibleNav) {}")], 'GARDE', 'PS-E48'),
    ('M41 la diapo « Tes progres » du Guide revient a l\'ancienne legende',
     [(AP, "cap:'Progrès s\\'ouvre sur <b>Séances</b> : tout ton <b>historique</b>", "cap:'Tes <b>records</b>, ton poids, ta masse grasse et tes badges — tout en graphiques clairs. <b>Séances</b> : tout ton <b>historique</b>")], 'GARDE', 'PS-S8'),
    ('M42 [deguisee] sans seance ce mois-ci, l\'historique s\'affiche VIDE (rien d\'ouvert, rien d\'invente… et plus rien du tout)',
     [(SE, "  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  /* 🗂️",
           "  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  if(!flist.some(s=>_sessMoisDe(s)===today().slice(0,7))){el.innerHTML='';return;}\n  /* 🗂️")], 'GARDE', 'PS-E41'),
    ('M43 [deguisee] les mois d\'une annee passee s\'ouvrent par defaut',
     [(SE, ":(m===today().slice(0,7));}", ":(m===today().slice(0,7)||m.slice(0,4)!==today().slice(0,4));}")], 'GARDE', 'PS-E45'),
    ('M35 [equivalente] mois : hasOwnProperty -> in (meme sens sur ces cles)',
     [(SE, "return Object.prototype.hasOwnProperty.call(_sessMoisOuvert,m)?_sessMoisOuvert[m]:", "return (m in _sessMoisOuvert)?_sessMoisOuvert[m]:")], 'OK'),
    ('M26 [negatif] commentaire citant les motifs cherches (slice(0,20), localStorage.setItem, goSessionsHistory())',
     [(SE, "function _sessMoisNom(m){\n", "// ancien : flist.slice(0,20) · localStorage.setItem('ft4_x') · goSessionsHistory() — cite, jamais execute\nfunction _sessMoisNom(m){\n")], 'OK'),
    ('M27 [equivalente] hasOwnProperty -> in (meme sens sur ces cles)',
     [(SE, "return Object.prototype.hasOwnProperty.call(_sessAnOuvert,an)?_sessAnOuvert[an]:", "return (an in _sessAnOuvert)?_sessAnOuvert[an]:")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_progres_seances.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_ps01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS:
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
            # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
            for f in FICHIERS:
                if f.endswith('.js'):
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
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
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
    # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
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
