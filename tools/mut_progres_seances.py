#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — PROGRES-SEANCES-01 (session-B) : les temoins B-PS01-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (master a0eab5b3, ft-v1254), mot pour mot.
Les mutations marquees [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et
[equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Usage : python3 tools/mut_progres_seances.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=3 : en parallele)
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'a0eab5b3'
SE, LO, CO, SC, IX, CT, AP = 'setup.js', 'log.js', 'coach.js', 'screens.js', 'index.html', 'constants.js', 'app.js'
FICHIERS = ('setup.js', 'log.js', 'coach.js', 'screens.js', 'index.html', 'constants.js', 'app.js', 'style.css')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (master a0eab5b3)", 'AVANT', 'GARDE'),
    ('M1 le plafond de 20 cartes revient',
     [(SE, "  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  /* 🗂️",
           "  flist=flist.slice(0,20);\n  if(!flist.length){el.innerHTML='<div class=\"empty\">Aucune séance pour ce muscle</div>';return;}\n  /* 🗂️")], 'GARDE'),
    ('M2 [deguisee] le regroupement perd la plus ancienne seance de chaque mois',
     [(SE, "          +(o?'<div class=\"sess-mois-cartes\">'+L.map(_sessCarteHtml).join('')+'</div>':'')",
           "          +(o?'<div class=\"sess-mois-cartes\">'+L.slice(0,Math.max(1,L.length-1)).map(_sessCarteHtml).join('')+'</div>':'')")], 'GARDE'),
    ('M3 [deguisee] une carte en double (la 1re seance du mois dessinee deux fois)',
     [(SE, "          +(o?'<div class=\"sess-mois-cartes\">'+L.map(_sessCarteHtml).join('')+'</div>':'')",
           "          +(o?'<div class=\"sess-mois-cartes\">'+L.concat(L.slice(0,1)).map(_sessCarteHtml).join('')+'</div>':'')")], 'GARDE'),
    ('M4 toutes les annees depliees par defaut',
     [(SE, ":(an===today().slice(0,4));}", ":true;}")], 'GARDE'),
    ('M5 tous les mois deplies par defaut (contrat UX-HIST : un mois se deplie a la demande)',
     [(SE, "const o=!!_sessMoisOuvert[m],L=A.parMois[m];", "const o=_sessMoisOuvert[m]!==false,L=A.parMois[m];")], 'GARDE'),
    ('M6 [deguisee] seances rangees sous le mois PRECEDENT (cle de mois decalee)',
     [(SE, "return /^\\d{4}-\\d{2}/.test(d)?d.slice(0,7):'?';}", "if(!/^\\d{4}-\\d{2}/.test(d))return '?';const x=new Date(d.slice(0,7)+'-01T12:00:00');x.setMonth(x.getMonth()-1);return x.toISOString().slice(0,7);}")], 'GARDE'),
    ("M7 Milo recoit la periode de l'ecran (28 jours par defaut)",
     [(CO, "    const v=_volumeParMuscle();\n    if(!v || !v.series || !v.liste.length) return '';    // rien fait",
           "    const v=_volumeParMuscle(undefined,(typeof _volJours!=='undefined'?_volJours:14));\n    if(!v || !v.series || !v.liste.length) return '';    // rien fait")], 'GARDE'),
    ('M8 [deguisee] la fenetre par defaut passe a 28 (Milo change en silence)',
     [(LO, "const VOL_FENETRE_JOURS = 14;", "const VOL_FENETRE_JOURS = 28;")], 'GARDE'),
    ('M9 [deguisee] la moyenne divise toujours par 2 semaines (28 jours faux)',
     [(LO, "  const out={jours:J, semaines:J/7,", "  const out={jours:J, semaines:2,")], 'GARDE'),
    ("M10 l'ecran s'ouvre sur 14 jours (decision : 28 par defaut)",
     [(SE, "let _volJours=28;", "let _volJours=14;")], 'GARDE'),
    ('M11 le choix 14 jours ne change rien (la periode passee est ignoree)',
     [(LO, "  const J=(VOL_PERIODES_JOURS.indexOf(jours)>=0)?jours:VOL_FENETRE_JOURS;", "  const J=28;")], 'GARDE'),
    ("M12 un bloc global reste dans Exercices (le filtre d'historique)",
     [(IX, '    <div id="sess-filter"></div>\n    <div id="sess-list"></div>', '    <div id="sess-list"></div>'),
      (IX, '    <div id="prog-cycle-banner" style="display:none;"></div>', '    <div id="prog-cycle-banner" style="display:none;"></div>\n    <div id="sess-filter"></div>')], 'GARDE'),
    ('M13 le sous-onglet est de nouveau force (Exercices a chaque ouverture)',
     [(SE, "  switchProgTab(_progTab,document.getElementById(PROG_ONGLETS[_progTab][0]));", "  switchProgTab('exo',document.getElementById('ptab-exo'));")], 'GARDE'),
    ('M14 le calendrier ne vise plus la seance (« Revoir la seance » nu)',
     [(SC, "    +'<div onclick=\"goSessionsHistory('+_argAttr(sess.map(s=>s.ts||s.id||0))+')\" class=\"ft-press\"", "    +'<div onclick=\"goSessionsHistory()\" class=\"ft-press\"")], 'GARDE'),
    ('M15 [deguisee] la cible marque tout le MOIS au lieu des seances visees',
     [(SE, "    const _cible=_sessCibles.indexOf(s.ts||s.id||0)>=0;",
           "    const _cible=(S.sessions||[]).some(x=>_sessCibles.indexOf(x.ts||x.id||0)>=0&&_sessMoisDe(x)===_sessMoisDe(s));")], 'GARDE'),
    ('M16 [deguisee] la cible par DATE de la 1re cle (une seule seance du jour retrouvee)',
     [(SE, "    const _cible=_sessCibles.indexOf(s.ts||s.id||0)>=0;", "    const _cible=_sessCibles.length>0&&(s.ts||s.id||0)===_sessCibles[0];")], 'GARDE'),
    ('M17 consulter un mois ecrit une cle de stockage',
     [(SE, "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisOuvert[m];renderSessions();}",
           "function basculerSessMois(m){_sessMoisOuvert[m]=!_sessMoisOuvert[m];try{localStorage.setItem('ft4_sessMois',JSON.stringify(_sessMoisOuvert));}catch(e){}renderSessions();}")], 'GARDE'),
    ('M18 [deguisee] consulter Progres modifie S.sessions (marque « vue » + persist)',
     [(SE, "function _sessCarteHtml(s){\n", "function _sessCarteHtml(s){\n    if(!s._vu){s._vu=1;try{persist();}catch(e){}}\n")], 'GARDE'),
    ("M19 le point rouge du filtre vise toujours l'onglet Exercices",
     [(CT, "{id:'sess-filter', screen:'progress', spot:'ptab-seances',", "{id:'sess-filter', screen:'progress', spot:'ptab-exo',")], 'GARDE'),
    ("M20 l'aide « ? » garde l'ancienne repartition (Exercices · Poids · Badges)",
     [(SC, "{i:'🚶',t:'<b>« Tes pas »</b> (sous-onglet <b>Corps &amp; santé</b>)", "{i:'🚶',t:'<b>« Tes pas »</b> (sous-onglet <b>Poids</b>)")], 'GARDE'),
    ('M21 le Guide garde « Progres → historique » et l\'ancienne repartition',
     [(AP, "{icon:'🗂️', t:'Progrès : Séances d\\'abord', cap:'<b>Séances</b> passe en premier",
           "{icon:'🗂️', t:'Le haut de Progrès se replie', cap:'Les trois onglets (<b>Exercices · Poids · Badges</b>) sont <b>tout en haut</b>. <b>Séances</b> passe en premier")], 'GARDE'),
    ("M22 l'onglet Badges disparait (relocalisation non decidee)",
     [(SE, ",\n                    poids:['ptab-poids','prog-poids','10px'], badges:['ptab-badges','prog-badges','12px']};",
           ",\n                    poids:['ptab-poids','prog-poids','10px']};"),
      (IX, '    <button class="nu-tab" id="ptab-badges" onclick="switchProgTab(\'badges\',this)">Badges</button>\n', '')], 'GARDE'),
    ('M23 [deguisee] le bouton de debrief disparait au-dela des 20 dernieres seances',
     [(SE, "    const _dbfId=(typeof _dbfCle==='function')?_dbfCle(s):'';", "    const _dbfId=(typeof _dbfCle==='function'&&S.sessions.indexOf(s)<20)?_dbfCle(s):'';")], 'GARDE'),
    ('M24 [deguisee] l\'analyse d\'un exercice change (Progres = derniere - record)',
     [(SE, "  const delta=pts.length>1?fmt(last.rm1-pts[0].rm1):null;", "  const delta=pts.length>1?fmt(last.rm1-maxPt.rm1):null;")], 'GARDE'),
    ('M25 le bandeau de cycle quitte Exercices (statu quo non tenu)',
     [(IX, '    <div id="prog-cycle-banner" style="display:none;"></div>\n', ''),
      (IX, '    <div id="sess-filter"></div>\n', '    <div id="prog-cycle-banner" style="display:none;"></div>\n    <div id="sess-filter"></div>\n')], 'GARDE'),
    ('M28 [deguisee] les seances sans date (ou mal datees) disparaissent du regroupement',
     [(SE, "  flist.forEach(s=>{const m=_sessMoisDe(s),an=m==='?'?'?':m.slice(0,4);", "  flist.forEach(s=>{if(_sessMoisDe(s)==='?')return;const m=_sessMoisDe(s),an=m==='?'?'?':m.slice(0,4);")], 'GARDE'),
    ('M29 une porte d\'entree garde le filtre de muscle (la seance visee peut etre cachee)',
     [(SE, "  _sessFilter=null;\n  _sessOuvrir(mois);", "  _sessOuvrir(mois);")], 'GARDE'),
    ('M30 [deguisee] fermer le detail replie les mois (le retour ne ramene plus au mois)',
     [(SE, "  _sessId=null;_sessEdits=null;_sdDelConfirm=false;\n", "  _sessId=null;_sessEdits=null;_sdDelConfirm=false;\n  try{Object.keys(_sessMoisOuvert).forEach(k=>delete _sessMoisOuvert[k]);renderSessions();}catch(e){}\n")], 'GARDE'),
    ('M26 [negatif] commentaire citant les motifs cherches (slice(0,20), localStorage.setItem, goSessionsHistory())',
     [(SE, "function _sessMoisNom(m){\n", "// ancien : flist.slice(0,20) · localStorage.setItem('ft4_x') · goSessionsHistory() — cite, jamais execute\nfunction _sessMoisNom(m){\n")], 'OK'),
    ('M27 [equivalente] hasOwnProperty -> in (meme sens sur ces cles)',
     [(SE, "return Object.prototype.hasOwnProperty.call(_sessAnOuvert,an)?_sessAnOuvert[an]:", "return (an in _sessAnOuvert)?_sessAnOuvert[an]:")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_progres_seances.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ps01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m
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
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        return nom, obtenu == attendu, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '3'))) as ex:
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
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
