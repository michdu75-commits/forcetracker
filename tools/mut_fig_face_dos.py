#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — « Ta seance jusqu'ici » : FACE · CHIFFRES · DOS (18/10/2026, decision D-091) : les temoins B-FFD-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers tels qu'ils etaient AVANT (daa1a737 = le code D-088), mot pour mot : la 2e figurine, l'ordre et les
couleurs du dos y rougissent ; les temoins de l'EXISTANT (chiffres de la carte, rien d'ecrit, fin de seance, autres figurines,
« + », cardio seul) y restent verts — ce sont des invariants, pas la nouveaute (la comparaison D-088 se lit dans ses rouges).
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SES temoins (4e champ, tous exiges).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local ; Milo n'est jamais appele.
D-092 (19/10/2026, le COMPTAGE) : M00b remet le code de D-091 d'AVANT le comptage (f7c4537b) — les temoins ⑩ / ⑧a / ④b y
rougissent, les figurines y restent vertes ; M21 a M31 visent chacun un rouage du comptage. M18 est RETIREE (R30) : elle
simulait « la carte compte les echauffements dans le volume », qui est desormais la regle voulue (D-092).
Usage : python3 tools/mut_fig_face_dos.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'daa1a737'          # le code D-088 : une seule figurine, de face
AVANT_D092 = 'f7c4537b'     # le code D-091 avant le comptage D-092 : deux figurines, totaux = travail seul
SE, TR, CS, LG = 'setup.js', 'tracking.js', 'style.css', 'log.js'
FICHIERS = (SE, TR, CS, LG)
DONT_S = "(nTot!==b.faites?' · dont '+b.faites+' de travail':'')"
WVOL = "if(s.done&&(avecEchauffements||(s.type!=='É'&&s.type!=='W'))&&(s.kg||0)>0&&(s.reps||0)>0)v+=s.kg*s.reps*k;"
CARTE = "${figF}<div class=\"lf-t\">${kv}${cardioTxt?`<div class=\"lf-cardio\">${cardioTxt}</div>`:''}</div>${figD}</div>"
KV = ".lf-2fig .lf-kv{flex-direction:column;flex-wrap:nowrap;align-items:center;gap:6px;}"

MUT = [
    ("M00 code d'AVANT remis mot pour mot (daa1a737 = D-088 : une seule figurine, de face)", 'AVANT', 'GARDE',
     ('B-FFD-①a', 'B-FFD-②a', 'B-FFD-⑦-SDT', 'B-FFD-⑧g', 'B-FFD-⑩a')),
    ("M00b code de D-091 d'AVANT le comptage remis mot pour mot (f7c4537b : deux figurines, totaux = travail seul)", 'AVANT:' + AVANT_D092, 'GARDE',
     ('B-FFD-④b', 'B-FFD-⑧a', 'B-FFD-⑩a', 'B-FFD-⑩b', 'B-FFD-⑩d', 'B-FFD-⑩f')),
    # ── le dos lui-meme
    ('M1 la petite figurine ignore la vue demandee : la figurine de droite est une 2e face',
     [(SE, "const dos=vue==='dos';", "const dos=false;")], 'GARDE', ('B-FFD-①a', 'B-FFD-②a')),
    ('M2 [deguisee] les figurines sont inversees (le dos a gauche, la face a droite)',
     [(TR, CARTE, CARTE.replace("${figF}<div", "${figD}<div").replace("</div>${figD}</div>", "</div>${figF}</div>"))], 'GARDE', ('B-FFD-①a',)),
    ('M3 [deguisee] le dos est decale de 6 : le dessin sort de son cadre (memes traces, memes couleurs)',
     [(SE, "${(dos?_BP:_FP).map(pt).join('')}</svg>",
           "${dos?'<g transform=\"translate(6 0)\">':''}${(dos?_BP:_FP).map(pt).join('')}${dos?'</g>':''}</svg>")], 'GARDE', ('B-FFD-③a',)),
    ('M4 [deguisee] le dos n\'est affiche que s\'il a des muscles colores (abdos seuls : une seule figurine)',
     [(TR, "figF=vue('face'); figD=vue('dos');",
           "figF=vue('face'); figD=Object.keys(res.sc).some(g=>res.sc[g]&&(_MG[g]||{paths:[]}).paths.some(id=>/^back_/.test(id)))?vue('dos'):'';")], 'GARDE', ('B-FFD-⑦ ⭐ Crunch',)),
    # ── les couleurs : le vrai moteur, rien d'ajoute, rien d'oublie
    ('M5 [deguisee] dessin GENERIQUE : la face n\'est plus coloree par la seance',
     [(TR, "_mscSVGmini(res,v)", "_mscSVGmini(v==='face'?{sc:{},ind:{}}:res,v)")], 'GARDE', ('B-FFD-②a',)),
    ('M6 [deguisee] couleur ARTIFICIELLE : de dos, les lombaires sont toujours en rouge',
     [(SE, "const dos=vue==='dos';", "const dos=vue==='dos';if(dos)_MG['lower-back'].paths.forEach(id=>{pd[id]={f:'#FF5555',k:'#AA0010'};});")],
     'GARDE', ('B-FFD-⑦ ⭐ Curl Barre',)),
    ('M7 [deguisee] de dos, les muscles secondaires (orange) ne sont plus colores',
     [(SE, "const[f,k]=v>=2?['#FF5555','#AA0010']:v>=1?['#FF9500','#AA5500']:isI?", "const[f,k]=v>=2?['#FF5555','#AA0010']:(v>=1&&vue!=='dos')?['#FF9500','#AA5500']:isI?")],
     'GARDE', ('B-FFD-②a', 'B-FFD-⑦-SDT')),
    # ── la mise en page sur iPhone
    ('M8 [deguisee] les chiffres restent EN LIGNE, sans retour : les longues valeurs debordent sur la figurine de dos',
     [(CS, KV, ".lf-2fig .lf-kv{flex-wrap:nowrap;align-items:center;gap:6px;}")], 'GARDE', ('B-FFD-④a',)),
    ('M9 [deguisee] les chiffres ne sont plus centres (cales a gauche de leur colonne)',
     [(CS, KV, KV.replace("align-items:center", "align-items:flex-start"))], 'GARDE', ('B-FFD-①b',)),
    ('M10 [deguisee] marges asymetriques : la face colle au bord, le dos non',
     [(CS, ".lf-2fig{gap:clamp(8px,3vw,14px);padding:14px clamp(12px,4vw,18px);}", ".lf-2fig{gap:clamp(8px,3vw,14px);padding:14px 16px 14px 34px;}")], 'GARDE', ('B-FFD-①b',)),
    ('M11 [deguisee] figurines trop petites (30 px)',
     [(CS, ".lf-2fig .lf-fig{width:clamp(44px,12.5vw,54px);}", ".lf-2fig .lf-fig{width:30px;}")], 'GARDE', ('B-FFD-③b',)),
    ('M12 [deguisee] figurines trop grandes (80 px)',
     [(CS, ".lf-2fig .lf-fig{width:clamp(44px,12.5vw,54px);}", ".lf-2fig .lf-fig{width:80px;}")], 'GARDE', ('B-FFD-③b',)),
    ('M13 [deguisee] plus de marge : les figurines collent au bord arrondi de la carte',
     [(CS, ".lf-2fig{gap:clamp(8px,3vw,14px);padding:14px clamp(12px,4vw,18px);}", ".lf-2fig{gap:clamp(8px,3vw,14px);padding:14px 0;}")], 'GARDE', ('B-FFD-①b',)),
    # ── sans appui, sans alternance
    ('M14 [deguisee] toucher une figurine cache l\'autre (retour de la bascule)',
     [(TR, 'role="img" aria-label="Muscles travaillés dans cette séance, vue de ${v}"',
           'role="img" onclick="this.parentNode.querySelectorAll(\'.lf-fig\').forEach(f=>{if(f!==this)f.style.display=\'none\'})" aria-label="Muscles travaillés dans cette séance, vue de ${v}"')],
     'GARDE', ('B-FFD-⑤b', 'B-FFD-⑤c')),
    ('M15 [deguisee] alternance automatique (une figurine a la fois, toutes les 1,2 s)',
     [(TR, "figF=vue('face'); figD=vue('dos');",
           "figF=vue('face'); figD=vue('dos'); if(!window.__alt){window.__alt=setInterval(()=>{const f=[...document.querySelectorAll('#log-finish .lf-fig')];if(f.length===2){const a=f[0].style.visibility==='hidden';f[0].style.visibility=a?'':'hidden';f[1].style.visibility=a?'hidden':'';}},1200);}")],
     'GARDE', ('B-FFD-⑤a',)),
    # ── rien d'ecrit, rien d'autre ne bouge
    ('M16 [deguisee] afficher la carte ECRIT dans le stockage local',
     [(TR, "figF=vue('face'); figD=vue('dos');", "figF=vue('face'); figD=vue('dos'); try{localStorage.setItem('ft4_lfFig','2');}catch(e){}")], 'GARDE', ('B-FFD-⑧b',)),
    ('M17 [deguisee] les autres figurines passent de dos (vue par defaut inversee)',
     [(SE, "const dos=vue==='dos';", "const dos=vue!=='face';")], 'GARDE', ('B-FFD-⑧e', 'B-FFD-⑧g')),
    # M18 RETIREE (19/10/2026, R30) : elle simulait « la carte compte les echauffements dans le volume » — c'est la regle voulue
    # depuis D-092. Son inverse (la carte les OUBLIE) est M22 ; son ancre (la copie de la regle de volume) n'existe plus.
    ('M19 [deguisee] cardio seul : la carte passe quand meme en trois colonnes',
     [(TR, "${figF&&figD?' lf-2fig':''}", "${' lf-2fig'}")], 'GARDE', ('B-FFD-⑨a',)),
    # ── le comptage (D-092)
    ('M21 [deguisee] le nombre TOTAL de series oublie les echauffements (la tuile affiche le travail)',
     [(TR, "${tuile(nTot,'série'", "${tuile(b.faites,'série'")], 'GARDE', ('B-FFD-⑩a', 'B-FFD-⑩b', 'B-FFD-⑩f')),
    ('M22 [deguisee] le volume TOTAL oublie les echauffements (comportement d\'avant D-092)',
     [(TR, "const vol=volDe(true), volTrav=volDe(false)", "const vol=volDe(false), volTrav=volDe(false)")], 'GARDE', ('B-FFD-⑩a', 'B-FFD-⑩b', 'B-FFD-⑩d')),
    ('M23 [deguisee] la carte oublie la convention unilaterale (un Curl Halteres vaut la moitie du volume enregistre)',
     [(TR, "const vs={exs:S.wkt.exs,uniConv:1}", "const vs={exs:S.wkt.exs,uniConv:0}")], 'GARDE', ('B-FFD-⑩d',)),
    ('M24 [deguisee] _workVol compte TOUJOURS les echauffements (2e argument ignore) : la seance enregistree change',
     [(LG, WVOL, WVOL.replace("(avecEchauffements||", "(true||"))], 'GARDE', ('B-FFD-⑩e',)),
    ('M25 [deguisee] « dont N de travail » affiche meme sans echauffement',
     [(TR, DONT_S, "(' · dont '+b.faites+' de travail')")], 'GARDE', ('B-FFD-⑩g',)),
    ('M26 [deguisee] le travail n\'est plus dit a part (jamais de « dont »)',
     [(TR, DONT_S, "('')")], 'GARDE', ('B-FFD-⑩a', 'B-FFD-⑧a')),
    ('M27 [deguisee] « dont N de travail » compte les echauffements',
     [(TR, DONT_S, "(nTot!==b.faites?' · dont '+nTot+' de travail':'')")], 'GARDE', ('B-FFD-⑩a',)),
    ('M28 [deguisee] « N / M » de l\'en-tete compte aussi les echauffements valides',
     [(LG, "const progres=b.total?(b.faites+' / '+b.total+",
           "const progres=b.total?((b.faites+(S.wkt.exs||[]).reduce((a,e)=>a+(e.sets||[]).filter(s=>s&&s.done&&(s.type==='É'||s.type==='W')).length,0))+' / '+b.total+")],
     'GARDE', ('B-FFD-⑩c',)),
    ('M29 [deguisee] la seance ENREGISTREE prend le volume total (echauffements compris)',
     [(LG, "const vol=_workVol({exs:S.wkt.exs,uniConv:1});", "const vol=_workVol({exs:S.wkt.exs,uniConv:1},true);")], 'GARDE', ('B-FFD-⑩e',)),
    ('M30 [deguisee] le volume de travail affiche dans la carte prend le total (« dont » du volume disparait)',
     [(TR, "const vol=volDe(true), volTrav=volDe(false)", "const vol=volDe(true), volTrav=volDe(true)")], 'GARDE', ('B-FFD-⑩a', 'B-FFD-⑩d')),
    # ── equivalentes
    ('M31 [equivalente] le total de series compte autrement (meme resultat)',
     [(TR, "const nTot=S.wkt.exs.reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s&&s.done).length,0);",
           "const nTot=S.wkt.exs.reduce((a,ex)=>(ex.sets||[]).reduce((n,s)=>n+(s&&s.done?1:0),a),0);")], 'OK'),
    ('M20 [equivalente] un pixel de plus entre les chiffres empiles (7 px au lieu de 6)',
     [(CS, KV, KV.replace("gap:6px", "gap:7px"))], 'OK'),
]

def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_fig_face_dos.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
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
    tmp = tempfile.mkdtemp(prefix='mut_ffd_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoins = m[3] if len(m) > 3 else ()
    tmp, arbre = cloner()
    try:
        if isinstance(remplacements, str) and remplacements.startswith('AVANT'):
            av = avant[remplacements.split(':', 1)[1] if ':' in remplacements else AVANT]
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not av[f] for f in FICHIERS) or all(av[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av[f])
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
                    chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
                    if chk.returncode:
                        return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        manque = [t for t in temoins if not temoin_present(rouges, t)]
        if ok and manque:
            ok, obtenu = False, 'GARDE sans ' + ', '.join(manque)
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {ref: {f: subprocess.run(['git', 'show', ref + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
             for ref in (AVANT, AVANT_D092)}
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
