#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEANCE S-01 « DATE JUSTE » (session-B, 16/10/2026) : les temoins B-S01-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet log.js tel qu'il etait AVANT le lot (master 3f61e7e2, ft-v1256), mot pour mot.
Les mutations marquees [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] et
[equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Usage : python3 tools/mut_seance_date.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)

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
AVANT = '3f61e7e2'
LO = 'log.js'
FICHIERS = ('log.js',)

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (master 3f61e7e2)", 'AVANT', 'GARDE', 'B-S01-A1'),
    ('M1 suppression du renouvellement de date (la fonction ne fait plus rien)',
     [(LO, "  const d=today();\n  if(S.wkt.date!==d)_setLogDate(d,true);\n}", "}")], 'GARDE', 'B-S01-A1'),
    ('M2 renouvellement TROP agressif : une seance reellement commencee change aussi de date',
     [(LO, "  if(typeof S==='undefined'||!S.wkt||_seanceOuverte()||_wktDateChoisie===S.wkt)return;", "  if(typeof S==='undefined'||!S.wkt||_wktDateChoisie===S.wkt)return;")], 'GARDE', 'B-S01-N1'),
    ('M3 une seule porte : la carte « type de seance » ne renouvelle plus',
     [(LO, "    _dateSeanceReelle();                       // S-01", "    // S-01")], 'GARDE', 'B-S01-P3'),
    ('M4 une seule porte : le 1er exercice (balayage, rechargement) ne renouvelle plus',
     [(LO, "  _dateSeanceReelle();                         // S-01", "  // S-01")], 'GARDE', 'B-S01-A1'),
    ('M5 la date CHOISIE par la personne n\'est plus respectee',
     [(LO, "||_seanceOuverte()||_wktDateChoisie===S.wkt)return;", "||_seanceOuverte())return;")], 'GARDE', 'B-S01-N5'),
    ('M6 [deguisee] le renouvellement ne met plus la barre de date a jour',
     [(LO, "  if(S.wkt.date!==d)_setLogDate(d,true);", "  if(S.wkt.date!==d){S.wkt.date=d;persist();}")], 'GARDE', 'B-S01-A2'),
    ('M7 [deguisee] 2e definition : « pas commencee » = pas de serie faite (une seance preparee changerait de date)',
     [(LO, "||!S.wkt||_seanceOuverte()||_wktDateChoisie", "||!S.wkt||_etatTravailWkt()==='TRAVAIL'||_wktDateChoisie")], 'GARDE', 'B-S01-N3'),
    ('M8 [deguisee] le choix de la personne n\'est plus marque (le marqueur suit le renouvellement automatique)',
     [(LO, "if(!auto)_wktDateChoisie=S.wkt;", "if(auto)_wktDateChoisie=S.wkt;")], 'GARDE', 'B-S01-N5'),
    ('M9 [deguisee] renouvellement place APRES l\'ajout (la seance est deja « ouverte », jamais renouvelee)',
     [(LO, "  _dateSeanceReelle();                         // S-01 : une séance vide d'un autre jour prend la date du jour\n  const prev=getPrev(name);", "  const prev=getPrev(name);"),
      (LO, "  S.wkt.exs.push({name,sets});\n  _expandedEx=S.wkt.exs.length-1;", "  S.wkt.exs.push({name,sets});_dateSeanceReelle();\n  _expandedEx=S.wkt.exs.length-1;")], 'GARDE', 'B-S01-A1'),
    ('M10 [equivalente] S.wkt.date!==d -> !(S.wkt.date===d) (meme sens)',
     [(LO, "  if(S.wkt.date!==d)_setLogDate(d,true);", "  if(!(S.wkt.date===d))_setLogDate(d,true);")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_date.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_s01_')
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
