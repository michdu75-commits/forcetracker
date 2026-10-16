#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — CC-01 (session-B, 16/10/2026) : les temoins B-CC01-* savent-ils ROUGIR ? (une serie validee est du passe)

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet log.js tel qu'il etait AVANT le lot (master 1717edc4), mot pour mot.
Les mutations marquees [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et
[equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Usage : python3 tools/mut_cc01_dropset.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)

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
AVANT = '1717edc4'
LO = 'log.js'
FICHIERS = ('log.js',)

# UX SEANCE (16/10/2026) : les deux ancres du filet MF* (le passe garde dans applyDropset, et dans removeDropset)
_GARDE = "  const garde=ex.sets.slice(0,fait+1);                           // le passé"
_RETIRE = "  ex.sets=fait>=0?ex.sets.slice(0,fait+1)                         // CC-01"

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (master 1717edc4)", 'AVANT', 'GARDE', 'B-CC01-B1'),
    ('M1 suppression de la protection : la methode remplace toute la liste',
     [(LO, "  ex.sets=garde.concat(newSets);ex.dropset=", "  ex.sets=newSets;ex.dropset=")], 'GARDE', 'B-CC01-B1'),
    ('M2 protection partielle : la serie faite reste mais perd RIR, note, repos, horodatage',
     [(LO, "  const garde=ex.sets.slice(0,fait+1);                           // le passé", "  const garde=ex.sets.slice(0,fait+1).map(s=>({kg:s.kg,reps:s.reps,done:s.done,type:s.type}));                           // le passé")], 'GARDE', 'B-CC01-B1'),
    ('M2b [deguisee] protection partielle : la derniere serie faite garde sa place mais son RIR est reecrit',
     [(LO, "  const garde=ex.sets.slice(0,fait+1);                           // le passé", "  if(derniere)derniere.rir=0;const garde=ex.sets.slice(0,fait+1);                           // le passé")], 'GARDE', 'B-CC01-B1'),
    ('M3 Drop protege, +% destructeur',
     [(LO, "  ex.sets=garde.concat(newSets);ex.dropset=", "  ex.sets=dir==='down'?garde.concat(newSets):newSets;ex.dropset=")], 'GARDE', 'B-CC01-E1'),
    ('M4 seule la PREMIERE serie faite est protegee',
     [(LO, "  const fait=ex.sets.map(s=>!!(s&&s.done)).lastIndexOf(true);   // dernière", "  const fait=ex.sets.map(s=>!!(s&&s.done)).indexOf(true);   // dernière")], 'GARDE', 'B-CC01-B1'),
    ('M5 « Retirer dropset » redevient destructeur (code d\'avant)',
     [(LO, "  ex.sets=fait>=0?ex.sets.slice(0,fait+1)                         // CC-01 : seule la partie non faite part\n    :[", "  ex.sets=[")], 'GARDE', 'B-CC01-H1'),
    ('M6 « Modifier paliers » repart de la PREMIERE serie de l\'exercice',
     [(LO, "    baseKg=+((suite||!prochaine)?derniere:prochaine).kg||+derniere.kg||0;", "    baseKg=+(suite?ex.sets[0]:(!prochaine?derniere:prochaine)).kg||+derniere.kg||0;")], 'GARDE', 'B-CC01-G1'),
    ('M7 « Modifier paliers » : le nombre de paliers oublie les paliers deja faits',
     [(LO, "ex.dropset={paliers:(suite?garde.length-p0:0)+_dropCfgPaliers,", "ex.dropset={paliers:_dropCfgPaliers,")], 'GARDE', 'B-CC01-G1'),
    ('M8 [deguisee] affichage : une serie normale faite avant le dropset est montree comme un palier',
     [(LO, "      if(si<p0)return _rowsHtml[si];                // une série normale reste une série normale\n", "")], 'GARDE', 'B-CC01-B3'),
    ('M9 [deguisee] Drop apres des series faites repart de la PREMIERE serie de l\'exercice',
     [(LO, "    baseKg=+((suite||!prochaine)?derniere:prochaine).kg||+derniere.kg||0;", "    baseKg=+ex.sets[0].kg||0;")], 'GARDE', 'B-CC01-B2'),
    ('M10 [deguisee] « Modifier paliers » reprend la derniere charge au lieu d\'en repartir (palier repete)',
     [(LO, "    if(i>0||suite)kg=_roundToGym(", "    if(i>0)kg=_roundToGym(")], 'GARDE', 'B-CC01-G1'),
    ('M11 [deguisee] « Retirer dropset » garde les paliers faits mais CREE une serie vide',
     [(LO, "  ex.sets=fait>=0?ex.sets.slice(0,fait+1)                         // CC-01", "  ex.sets=fait>=0?ex.sets.slice(0,fait+1).concat([{kg:0,reps:8,done:false,type:'N'}])                         // CC-01")], 'GARDE', 'B-CC01-H1'),
    ('M12 [equivalente] s.done -> s.done===true (meme sens sur ces donnees)',
     [(LO, "  const fait=ex.sets.map(s=>!!(s&&s.done)).lastIndexOf(true);   // dernière", "  const fait=ex.sets.map(s=>!!(s&&s.done===true)).lastIndexOf(true);   // dernière")], 'OK'),
    # ── UX SEANCE (16/10/2026) : le FILET de la contre-verification CC-01. Ses mutations O1 -> O14 ne sont ni dans le depot
    #    ni sur le Drive (cherche le 16/10) : celles-ci sont RECONSTRUITES, EQUIVALENTES aux pertes que la fiche CC-01 decrit
    #    (docs/SUIVI-AUDIT.md) — pas les originales. Chacune doit faire rougir SON temoin B-CC01-FIL-*.
    ('MF1 [perte] un echauffement valide n\'est plus protege par « 📉 Drop » (filtre sur le passe)',
     [(LO, _GARDE, _GARDE.replace("ex.sets.slice(0,fait+1);", "ex.sets.slice(0,fait+1).filter(s=>s.type!=='É');"))], 'GARDE', 'B-CC01-FIL-1'),
    ('MF2 [perte] [deguisee] la derniere serie faite ignore les echauffements (un echauffement seul valide est efface)',
     [(LO, "  const fait=ex.sets.map(s=>!!(s&&s.done)).lastIndexOf(true);   // dernière", "  const fait=ex.sets.map(s=>!!(s&&s.done&&s.type!=='É')).lastIndexOf(true);   // dernière")], 'GARDE', 'B-CC01-FIL-2'),
    ('MF3 [perte] É / X reecrits en N (le passe est reconstruit avec le type par defaut)',
     [(LO, _GARDE, _GARDE.replace("ex.sets.slice(0,fait+1);", "ex.sets.slice(0,fait+1).map(s=>Object.assign({},s,{type:'N'}));"))], 'GARDE', 'B-CC01-FIL-3'),
    ('MF4 [perte] le champ `maxi` d\'une serie faite est perdu (passe reconstruit sans lui)',
     [(LO, _GARDE, _GARDE.replace("ex.sets.slice(0,fait+1);", "ex.sets.slice(0,fait+1).map(s=>{const c=Object.assign({},s);delete c.maxi;return c;});"))], 'GARDE', 'B-CC01-FIL-4'),
    ('MF5 [perte] « Modifier paliers » en MONTEE efface les paliers faits',
     [(LO, _GARDE, _GARDE.replace("ex.sets.slice(0,fait+1);", "(suite&&dir==='up')?ex.sets.slice(0,p0):ex.sets.slice(0,fait+1);"))], 'GARDE', 'B-CC01-FIL-5'),
    ('MF6 [perte] « Retirer dropset » en MONTEE efface les paliers faits',
     [(LO, _RETIRE, _RETIRE.replace("ex.sets=fait>=0?", "ex.sets=(fait>=0&&ex.dropset.direction!=='up')?"))], 'GARDE', 'B-CC01-FIL-6'),
    ('MF7 [perte] TOUT FAIT + « Modifier paliers » : la derniere serie faite est perdue',
     [(LO, _GARDE, _GARDE.replace("ex.sets.slice(0,fait+1);", "ex.sets.slice(0,(suite&&!prochaine)?fait:fait+1);"))], 'GARDE', 'B-CC01-FIL-7'),
    ('MF8 [perte] TOUT FAIT + « Retirer dropset » : la derniere serie faite est perdue',
     [(LO, _RETIRE, _RETIRE.replace("ex.sets.slice(0,fait+1)", "ex.sets.slice(0,fait===ex.sets.length-1?fait:fait+1)"))], 'GARDE', 'B-CC01-FIL-8'),
    ('MF9 [affichage] cas mixte : le nombre de paliers compte la serie normale faite (elle redevient un palier)',
     [(LO, "ex.dropset={paliers:(suite?garde.length-p0:0)+_dropCfgPaliers,", "ex.dropset={paliers:(suite?garde.length:0)+_dropCfgPaliers,")], 'GARDE', 'B-CC01-FIL-9'),
    ('MF10 [rechargement] « Modifier paliers » n\'est plus enregistre (le rechargement revient en arriere)',
     [(LO, "  _expandedEx=ei;persist();renderExBlocks();\n  toast((dir==='down'?'Dropset':'Pyramide')+' créé ✓','success');",
           "  _expandedEx=ei;renderExBlocks();\n  toast((dir==='down'?'Dropset':'Pyramide')+' créé ✓','success');")], 'GARDE', 'B-CC01-FIL-10'),
    ('MF11 [rechargement] « Retirer dropset » n\'est plus enregistre (le dropset revient au rechargement)',
     [(LO, "  delete ex.dropset;persist();renderExBlocks();toast('Dropset supprimé','info');", "  delete ex.dropset;renderExBlocks();toast('Dropset supprimé','info');")], 'GARDE', 'B-CC01-FIL-11'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_cc01_dropset.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_cc01_')
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
