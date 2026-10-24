#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MISSION SEANCE DU 24/10/2026, les chiffres d'une seance (session-C, Claude Seance) : les temoins
C-NUM-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc instable = campagne refusee).
M00 remet les fichiers de l'app tels qu'ils etaient AVANT la mission (branche Seance 5a7b0a57 = master 999b7947 + repos +
vignettes), mot pour mot.
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [negatif] ne doit PAS faire rougir.
Chaque mutation GARDE exige un TEMOIN PRECIS (4e champ) parmi les rouges.
Un PLANTAGE du banc (code de sortie hors 0/1, ligne PLANTAGE, ou pas de ligne de total) n'est JAMAIS « garde ».
Une mutation qui casse la SYNTAXE est refusee (elle rougirait tout, elle ne prouve rien).
Usage : python3 tools/mut_seance_chiffres.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
        MUT_PARTS=N MUT_PART=k : ne joue que la k-ieme part (1..N) des mutations choisies.
Chaque resultat est imprime des qu'il tombe.
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '5a7b0a57'
LO, SE, AP, ST, SC, DA, CO = 'log.js', 'setup.js', 'app.js', 'state.js', 'screens.js', 'dashboard.js', 'coach.js'
FICHIERS = (LO, SE, AP, ST, SC, DA, CO)
FICHIERS_AVANT = (LO, SE, AP, ST, SC, DA, CO)

MUT = [
    ("M00 code d'AVANT la mission remis mot pour mot (5a7b0a57)", 'AVANT', 'GARDE', 'C-NUM-A1'),
    # ── F21 : les calories d'une seance passee ─────────────────────────────────────────────────────────────────────
    ('M1 meme effort : le detail des calories est recalcule au lieu d\'etre garde',
     [(SE, "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // même effort : rien ne bouge\n", "")],
     'GARDE', 'C-NUM-A7'),
    ('M2 [deguisee] effort change : le calcul du jour est pris tel quel (poids du jour)',
     [(SE, "  if(!(ref>0) || !(cA.total>0)) return {calories:cN.total, calData:cN};", "  return {calories:cN.total, calData:cN};")],
     'GARDE', 'C-NUM-A3'),
    ('M3 [deguisee] l\'echelle d\'origine est inversee (cA / ref)',
     [(SE, "  const k=ref/cA.total, sc=v=>Math.round(v*k);", "  const k=cA.total/ref, sc=v=>Math.round(v*k);")],
     'GARDE', 'C-NUM-C3'),
    ('M4 « Enregistrer » recalcule les calories avec le moteur seul (l\'ancien chemin)',
     [(SE, "  const _k=_kcalApresEdition(_avant,_sessEdits);   // F21 : rien ne bouge si l'effort n'a pas bougé",
           "  const _k=(()=>{const c=_calDataSeance(_sessEdits);return {calories:c.total,calData:c};})();")],
     'GARDE', 'C-NUM-A1'),
    ('M5 la fin de seance oublie le cardio (calcul commun ampute)',
     [(LO, "  if(cardioKcal){calData.total+=cardioKcal;calData.cardio=cardioKcal;}\n  return calData;",
           "  return calData;")],
     'GARDE', 'C-NUM-A6'),
    # ── F02 / Q5 : le volume ───────────────────────────────────────────────────────────────────────────────────────
    ('M6 « Enregistrer » revient a la copie sans convention unilaterale',
     [(SE, "  _sessEdits.volume=Math.round(_workVol(_sessEdits));",
           "  let vol=0; _sessEdits.exs.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')vol+=(s.kg||0)*(s.reps||0);})); _sessEdits.volume=Math.round(vol);")],
     'GARDE', 'C-NUM-B1'),
    ('M7 [deguisee] _volTravail lit d\'abord la copie rangee',
     [(LO, "  return Math.round(w>0 ? w : (+sess.volume||+sess.vol||0));", "  return Math.round((+sess.volume||+sess.vol||0) || w);")],
     'GARDE', 'C-NUM-B5'),
    ('M8 la carte de l\'historique relit la copie rangee',
     [(SE, "parts.push('<span class=\"sess-vol2\">'+_volTravail(s)+' kg de travail</span>');",
           "parts.push('<span class=\"sess-vol2\">'+Math.round(s.volume||0)+' kg de travail</span>');")],
     'GARDE', 'C-NUM-B5'),
    ('M9 l\'en-tete du detail relit la copie rangee',
     [(SE, "  const _vTrav=_volTravail(sess), _vEch=", "  const _vTrav=Math.round(sess.volume||0), _vEch=")],
     'GARDE', 'C-NUM-B6'),
    ('M10 [deguisee] l\'affichage reecrit la seance au passage (correction silencieuse)',
     [(SE, "  const _vTrav=_volTravail(sess), _vEch=", "  sess.volume=_volTravail(sess); persist();\n  const _vTrav=_volTravail(sess), _vEch=")],
     'GARDE', 'C-NUM-B7'),
    # ── K1 / K2 : la duree ─────────────────────────────────────────────────────────────────────────────────────────
    ('M11 corriger la duree ne recalcule plus les calories',
     [(SE, "  s.calories=_k.calories; s.calData=_k.calData;\n  persist();", "  persist();")],
     'GARDE', 'C-NUM-C1'),
    ('M12 corriger la duree rouvre le detail (efface ce qui est tape)',
     [(SE, "  if(_sessEdits && (_sessEdits.ts||_sessEdits.id)===(s.ts||s.id)){", "  if(false){")],
     'GARDE', 'C-NUM-C4'),
    ('M13 [deguisee] la duree n\'est pas reportee dans le detail ouvert (« Enregistrer » la remet)',
     [(SE, "    if(s.duration){ _sessEdits.duration=s.duration; _sessEdits.durationDite=true; }", "    if(s.duration){ }")],
     'GARDE', 'C-NUM-C5'),
    ('M14 l\'en-tete n\'est pas redessine apres la duree',
     [(SE, "    _sdEntete(s);\n  }else openSessDetail(s.ts||s.id);", "  }else openSessDetail(s.ts||s.id);")],
     'GARDE', 'C-NUM-C2'),
    # ── negatif : ne doit rien faire rougir ─────────────────────────────────────────────────────────────────────────
    ('M15 [negatif] un commentaire de la regle des calories est reformule',
     [(SE, "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // même effort : rien ne bouge",
           "  if(cA.total===cN.total) return {calories:avant.calories, calData:avant.calData};   // effort identique : on garde tout")],
     'OK', None),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_chiffres.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_num_')
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
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'), flush=True)
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parts, part = int(os.environ.get('MUT_PARTS', '1')), int(os.environ.get('MUT_PART', '1'))
    choix = [m for i, m in enumerate(choix) if i % parts == part - 1]
    print('  part %d/%d : %d mutation(s)' % (part, parts, len(choix)), flush=True)
    conformes = 0
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        futs = [ex.submit(une, m, avant) for m in choix]
        for fu in as_completed(futs):
            nom, ok, obtenu, rouges = fu.result()
            if ok is None:
                print('  INVALIDE  %s %s' % (nom, obtenu), flush=True); continue
            conformes += ok
            print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''), flush=True)
            if os.environ.get('MUT_DETAIL'):
                for r in rouges[1:]:
                    print('        ' + r, flush=True)
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
