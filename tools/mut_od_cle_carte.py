#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — OD-CLE-CARTE (session-B, 15/10/2026) : les temoins reecrits ou ajoutes savent-ils ROUGIR ?

Contexte : la D-031 du 15/10 sur c6a19763 a fini 7 040 / 2 rouges (OD-07, OD-07b). Cause prouvee : un DEFAUT DE TEST
preexistant (candidat, master ET production aa808110) — le banc cherchait l'id de la seance dans l'onclick de la carte,
alors que la carte porte openSessDetail(ts || id), et finishWorkout ecrit deux Date.now() (id et ts different d'1 ms de
temps en temps). Correction TEST-ONLY (decision de Michel) : aides du banc par la cle du produit, fixture OD-11
deterministe (ts = id + 1), OD-12 / OD-14 par la cle, temoin explicite OD-18 (id != ts).

[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
  - un PLANTAGE n'est jamais compte comme une mutation attrapee (code de sortie hors 0/1, ligne PLANTAGE, ou pas de
    ligne de total) ;
  - « attrapee » = le temoin VISE (4e champ) est dans les rouges, pas n'importe quel rouge ;
  - une mutation qui casse la SYNTAXE est refusee (elle rougirait tout sans rien prouver) ;
  - MUT_J vaut 1 par defaut (une mutation a la fois : pas de rouge fabrique par la charge) ;
  - l'arbre sain est mesure AVANT et rejoue APRES la campagne (un banc instable aurait pu « attraper » par hasard).
Les mutations [test] cassent l'AIDE du banc (elle redevient la recherche par id) : elles prouvent que le temoin OD-18
voit l'ancien defaut. Les mutations [produit] cassent un invariant de l'application pour une seance id != ts.
Usage : python3 tools/mut_od_cle_carte.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TE, CO, LO, SE = 'tests/parcours/debrief_demande.js', 'coach.js', 'log.js', 'setup.js'
FICHIERS = (TE, CO, LO, SE)

MUT = [
    # ── [test] l'aide du banc redevient la recherche par id : OD-18 (id != ts fixe) doit le voir ──
    ('T1 [test] boutons() cherche de nouveau l\'id dans l\'onclick de la carte',
     [(TE, "        const c = k ? [...document.querySelectorAll('#sess-list .sess-card')].find(x => (x.getAttribute('onclick') || '') === 'openSessDetail(' + k + ')') : null;\n        return c ?",
           "        const c = [...document.querySelectorAll('#sess-list .sess-card')].find(x => (x.getAttribute('onclick') || '').indexOf(String(i)) >= 0);\n        return c ?")],
     'GARDE', 'OD-18'),
    ('T2 [test] ouvrirCarte() vise de nouveau [onclick*=id]',
     [(TE, "  const ouvrirCarte = async (X, id) => { const k = await cleCarte(X, id); return k ? clic(X.pg, selCarte(k) + ' .sess-dbf-go', 'ov-debrief-milo') : false; };",
           "  const ouvrirCarte = (X, id) => clic(X.pg, '#sess-list .sess-card[onclick*=\"' + id + '\"] .sess-dbf-go', 'ov-debrief-milo');")],
     'GARDE', 'OD-18b'),
    # ── [produit] un invariant casse pour une seance id != ts ──
    ('P1 [produit] la carte porte openSessDetail(id) : une seance id != ts ne s\'ouvre plus',
     [(SE, "onclick=\"openSessDetail(${s.ts||s.id||0})\"", "onclick=\"openSessDetail(${s.id||s.ts||0})\"")],
     'GARDE', 'OD-18'),
    ('P2 [produit] la cle du debrief devient ts : un debrief range sous l\'id n\'est plus retrouve',
     [(CO, "function _dbfCle(sess){ return sess ? String(sess.id||sess.ts||sess.date||'') : ''; }",
           "function _dbfCle(sess){ return sess ? String(sess.ts||sess.id||sess.date||'') : ''; }")],
     'GARDE', 'OD-11'),
    ('P3 [produit] une analyse coupee par un rechargement n\'est plus dite « interrompue »',
     [(CO, "  return !!(e && e.page!==_DBF_PAGE) && !_dbfTexteDe(id);", "  return false;")],
     'GARDE', 'OD-07'),
    ('P4 [produit] la relance depuis Progres envoie la consigne de fin de seance',
     [(LO, "'[DÉBRIEF AUTO] '+(fin?'Je viens de terminer ma séance.':'Analyse cette séance de mon historique, à ma demande.')",
           "'[DÉBRIEF AUTO] '+('Je viens de terminer ma séance.')")],
     'GARDE', 'OD-07b'),
    ('P5 [produit] le geste « analyser » retrouve la seance par ts : rien ne part pour une seance id != ts',
     [(SE, "  const s=(S.sessions||[]).find(x=>x&&typeof _dbfCle==='function'&&_dbfCle(x)===String(id))||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}",
           "  const s=(S.sessions||[]).find(x=>x&&String(x.ts)===String(id))||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}")],
     'GARDE', 'OD-18b'),
    ('P6 [produit] « Voir le debrief » lit le magasin sous ts : le texte n\'est plus retrouve',
     [(SE, "  const e=(typeof _dbfTexteDe==='function')?_dbfTexteDe(id):null;\n  if(!e){toast('Aucun débrief Milo rangé pour cette séance','info');return;}",
           "  const _s6=(S.sessions||[]).find(x=>String(x.id)===String(id)); const e=(typeof _dbfTexteDe==='function')?_dbfTexteDe(_s6?String(_s6.ts):id):null;\n  if(!e){toast('Aucun débrief Milo rangé pour cette séance','info');return;}")],
     'GARDE', 'OD-18c'),
    ('P7 [produit] supprimer une seance laisse son etat « en vol »',
     [(CO, "  const k=String(id);\n  _dbfVolRetirer(k);\n", "  const k=String(id);\n")],
     'GARDE', 'OD-14'),
    ('P8 [produit] le geste retrouve la seance par sa DATE (la 1re du jour), pas par son identifiant',
     [(SE, "  const s=(S.sessions||[]).find(x=>x&&typeof _dbfCle==='function'&&_dbfCle(x)===String(id))||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}\n  const fin=",
           "  const s=(S.sessions||[]).find(x=>x&&x.date===((S.sessions||[]).find(y=>_dbfCle(y)===String(id))||{}).date)||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}\n  const fin=")],
     'GARDE', 'OD-12'),
    # ── controles : ne doivent RIEN faire rougir ──
    ('N1 [negatif] commentaire citant l\'ancien motif (indexOf(String(id)), onclick*=id) dans le banc',
     [(TE, "  const selCarte = k =>", "  // ancien : (x.getAttribute('onclick') || '').indexOf(String(id)) >= 0 · [onclick*=\"id\"] — cite, jamais execute\n  const selCarte = k =>")],
     'OK'),
    ('E1 [equivalente] cleCarte : ts || id ecrit en ternaire (meme sens)',
     [(TE, "    return s ? String(s.ts || s.id) : null; }, id);", "    return s ? String(s.ts ? s.ts : s.id) : null; }, id);")],
     'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_debrief_demande.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    pat = re.compile(r'ROUGE ' + re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_odcle_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
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
            chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
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
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(une, choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-96s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
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
