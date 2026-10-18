#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — brief « D-088 » (18/10/2026, decisions D-089) : les temoins B-D088-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers tels qu'ils etaient AVANT le brief (f2457ec8), mot pour mot : l'entree du menu, l'appellation de la
note et le garde de l'outil du prompt y rougissent ; les temoins de l'EXISTANT (moteur d'import, seance intacte, annulation,
reprise, programme) y restent verts — ce sont des invariants, pas la nouveaute.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SES temoins (4e champ, tous exiges).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local et FABRIQUE la reponse de l'import.
⛔ Les mutations de tools/dump_prompt.js ne visent jamais le vrai depot : le banc lance une COPIE redirigee vers un leurre,
   sous un garde d'ecriture qui bloque le vrai depot principal et l'arbre teste (temoin ⑪-0).
Usage : python3 tools/mut_d088.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'f2457ec8'
LO, IX, DP = 'log.js', 'index.html', 'tools/dump_prompt.js'
FICHIERS = (LO, IX, DP)
ENTREE = ("  g1+=ligne(ic('<path d=\"M12 3v12\"/><polyline points=\"7 10 12 15 17 10\"/><path d=\"M5 21h14\"/>'),\n"
          "    'Importer un historique','Séances passées → historique, stats et records','closeWktMenu();openImportHist()');\n")
GARDE_SI = "if(_ici!==ROOT){"

MUT = [
    ("M00 code d'AVANT le brief remis mot pour mot (f2457ec8)", 'AVANT', 'GARDE', ('B-D088-IMP-①a', 'B-D088-NOTE-①b', 'B-D088-OUTIL-①a')),
    # ── ① l'entree du menu « … »
    ('M1 l\'entree « Importer un historique » retiree du menu de la seance',
     [(LO, ENTREE, '')], 'GARDE', ('B-D088-IMP-①a', 'B-D088-IMP-②0')),
    ('M2 [deguisee] l\'entree ouvre la fenetre et la referme aussitot',
     [(LO, "'closeWktMenu();openImportHist()');", "'closeWktMenu();openImportHist();closeImportHist()');")], 'GARDE', ('B-D088-IMP-①c',)),
    ('M3 [deguisee] l\'entree laisse le menu ouvert derriere la fenetre d\'import',
     [(LO, "'closeWktMenu();openImportHist()');", "'openImportHist()');")], 'GARDE', ('B-D088-IMP-①c',)),
    # ── ② la seance en cours ne bouge jamais
    ('M4 [deguisee] l\'import efface les notes de la seance EN COURS',
     [(LO, "    S.sessions.push(sessionObj);\n", "    S.sessions.push(sessionObj);if(S.wkt&&S.wkt.exs)S.wkt.exs.forEach(e=>{e.note='';});\n")], 'GARDE', ('B-D088-IMP-②b',)),
    ('M5 [deguisee] l\'import efface la copie de secours de la seance (le brouillon)',
     [(LO, "    S.sessions.push(sessionObj);\n", "    S.sessions.push(sessionObj);setTimeout(()=>{try{localStorage.removeItem('ft4_wkt_draft');}catch(e){}},0);\n")], 'GARDE', ('B-D088-IMP-②b',)),
    ('M6 [deguisee] un conflit de date se regle par defaut en REMPLACANT la seance terminee',
     [(LO, "if(existing)_histConflicts.push({idx:i,existing,resolution:'add'});", "if(existing)_histConflicts.push({idx:i,existing,resolution:'replace'});")], 'GARDE', ('B-D088-IMP-②c',)),
    ('M7 [deguisee] l\'import repond « un seul exercice » : la seance importee est mise A LA PLACE de la seance en cours',
     [(LO, "    S.sessions.push(sessionObj);\n", "    S.sessions.push(sessionObj);if(S.wkt&&S.wkt.exs&&sessionObj.exs)S.wkt.exs=JSON.parse(JSON.stringify(sessionObj.exs));\n")], 'GARDE', ('B-D088-IMP-②b',)),
    # ── ③④⑤ annuler, fermer, reprendre, recharger
    ('M8 [deguisee] fermer la fenetre a l\'apercu importe quand meme',
     [(LO, "function closeImportHist(){document.getElementById('ov-import-hist').classList.remove('open');}",
           "function closeImportHist(){const ov=document.getElementById('ov-import-hist');if(ov.classList.contains('open')&&_histExtracted&&!window.__m8){window.__m8=1;finalImportHist();window.__m8=0;}ov.classList.remove('open');}")],
     'GARDE', ('B-D088-IMP-④a',)),
    ('M9 [deguisee] l\'apercu ecrit deja dans l\'historique, avant toute confirmation',
     [(LO, "function _renderHistPreview(){\n  const sessions=(_histExtracted&&_histExtracted.sessions)||[];\n  if(!sessions.length)return;\n",
           "function _renderHistPreview(){\n  const sessions=(_histExtracted&&_histExtracted.sessions)||[];\n  if(!sessions.length)return;\n"
           "  if(!window.__m9){window.__m9=1;(S.sessions=S.sessions||[]).push({id:9,ts:9,date:'2026-10-05',exs:[],importedHistory:true});persist();}\n")],
     'GARDE', ('B-D088-IMP-④a',)),
    ('M10 [deguisee] rouvrir la fenetre perd le scan (plus de « Scan repris »)',
     [(LO, "function openImportHist(){\n  if(_scanEnCours(_histPhotos,_histExtracted)){", "function openImportHist(){\n  _histExtracted=null;_histPhotos=[];\n  if(_scanEnCours(_histPhotos,_histExtracted)){")],
     'GARDE', ('B-D088-IMP-④b',)),
    # ── ⑥⑦⑧ analyse vide, historique vide, remplacement explicite
    ('M11 [deguisee] une analyse sans seance ne dit plus rien',
     [(LO, "    toast(dense?'Pages trop denses pour l\\'analyse", "    if(0)toast(dense?'Pages trop denses pour l\\'analyse")], 'GARDE', ('B-D088-IMP-⑥a',)),
    ('M12 [deguisee] le premier import (historique vide) ne range rien',
     [(LO, "    if(!S.sessions)S.sessions=[];\n    S.sessions.push(sessionObj);\n", "    if(!(S.sessions||[]).length)return;\n    S.sessions.push(sessionObj);\n")], 'GARDE', ('B-D088-IMP-⑦a',)),
    ('M13 [deguisee] « Remplacer » retire la mauvaise seance (la plus ancienne)',
     [(LO, "const idx=(S.sessions||[]).findIndex(s=>s.date===sess.date);", "const idx=(S.sessions||[]).length-1;")], 'GARDE', ('B-D088-IMP-⑧a',)),
    # ── ⑨ l'import de programme
    ('M14 « Programmes » ne propose plus d\'importer un programme',
     [(IX, 'onclick="importProgDepuisProgrammes()"', 'onclick="closeProgModal()"')], 'GARDE', ('B-D088-IMP-⑨a',)),
    # ── ⑩ la note de la derniere seance
    ('M15 l\'ancienne appellation revient (« Note de la derniere fois »)',
     [(LO, '<div class="sn-prev-t">💬 Note de la dernière séance</div>', '<div class="sn-prev-t">💬 Note de la dernière fois</div>')], 'GARDE', ('B-D088-NOTE-①b',)),
    ('M16 [deguisee] le point disparait quand le texte du jour est identique (proposition refusee par Michel)',
     [(LO, "  const _noteExPrev=_noteExPrecedente(ex);", "  const _noteExPrev=(n=>n&&n.texte===String(ex.note||'').trim()?null:n)(_noteExPrecedente(ex));")], 'GARDE', ('B-D088-NOTE-①a',)),
    ('M17 [deguisee] la fiche pretend connaitre l\'origine du texte',
     [(LO, '<div class="sn-prev-t">💬 Note de la dernière séance</div>', '<div class="sn-prev-t">💬 Note de la dernière séance</div><div class="sn-prev-o">Consigne de ton programme</div>')], 'GARDE', ('B-D088-NOTE-①c',)),
    # ── ⑪ l'outil du prompt de Milo
    ('M18 le garde de l\'outil du prompt est desactive',
     [(DP, GARDE_SI, "if(false&&_ici!==ROOT){")], 'GARDE', ('B-D088-OUTIL-①a',)),
    ('M19 [deguisee] le garde accepte tout sous-dossier du depot (comparaison par prefixe)',
     [(DP, GARDE_SI, "if(!_ici.startsWith(ROOT)){")], 'GARDE', ('B-D088-OUTIL-①b',)),
    ('M20 [deguisee] le garde refuse TOUT, meme depuis la racine du depot (l\'outil ne sert plus)',
     [(DP, GARDE_SI, "if(true||_ici!==ROOT){")], 'GARDE', ('B-D088-OUTIL-①c',)),
    ('M21 [deguisee] la sortie n\'est plus ecrite mot pour mot (le generateur de PDF ne peut plus la rediriger)',
     [(DP, "fs.writeFileSync('/home/user/forcetracker/docs/PROMPT-MILO-REEL.txt',", "fs.writeFileSync(path.join(ROOT,'docs','PROMPT-MILO-REEL.txt'),")], 'GARDE', ('B-D088-OUTIL-①e',)),
    # ── equivalente
    ('M22 [equivalente] l\'icone de l\'entree devient celle du calendrier (meme ligne, meme geste)',
     [(LO, "ic('<path d=\"M12 3v12\"/><polyline points=\"7 10 12 15 17 10\"/><path d=\"M5 21h14\"/>')", "ic('<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/>')")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_d088.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_d088_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoins = m[3] if len(m) > 3 else ()
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
