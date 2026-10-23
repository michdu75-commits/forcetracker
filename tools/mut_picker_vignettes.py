#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEANCE-UX-IMAGES (session-C, Claude Seance, 23/10/2026) : les temoins C-VIG-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc instable = campagne refusee).
M00 remet log.js, style.css et sw.js tels qu'ils etaient AVANT le lot (02898d6c), mot pour mot.
Les mutations [deguisee] cassent l'invariant sans toucher a la ligne evidente ; [neutre] et [equivalente] ne doivent PAS
faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Chaque mutation GARDE exige un TEMOIN PRECIS (4e champ) parmi les rouges.
Un PLANTAGE du banc n'est JAMAIS « garde ». Une mutation qui casse la SYNTAXE est refusee.
[!!] Chaque resultat est imprime des qu'il tombe (une campagne coupee ne perd rien). MUT_PARTS=N MUT_PART=k : une part.
Usage : python3 tools/mut_picker_vignettes.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '02898d6c'
LO, CS, SW = 'log.js', 'style.css', 'sw.js'
FICHIERS = (LO, CS, SW)
V = "muscles/vignettes/"
OCTET = 'OCTET'   # mutation binaire : un octet ajoute a la fin d'un fichier image

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (02898d6c : log.js, style.css, sw.js)", 'AVANT', 'GARDE', 'C-VIG-A2'),
    ('MV1 deux vignettes permutees (Pectoraux <-> Dos)',
     [(LO, 'src="' + V + '01_pectoraux.png"', 'src="' + V + 'TMP.png"'), (LO, 'src="' + V + '02_dos_dorsaux.png"', 'src="' + V + '01_pectoraux.png"'),
      (LO, 'src="' + V + 'TMP.png"', 'src="' + V + '02_dos_dorsaux.png"')], 'GARDE', 'C-VIG-A2'),
    ('MV2 Mollets recoit « Corps complet » (l\'image interdite par Michel)',
     [(LO, 'src="muscles/muscle mollet.png" alt="" class="ex-grp-vig ex-grp-vig-centre"', 'src="' + V + '08_corps_complet.png" alt="" class="ex-grp-vig ex-grp-vig-centre"')], 'GARDE', 'C-VIG-A2'),
    ('MV3 [deguisee] Mollets recoit la vignette d\'un autre groupe (abdominaux)',
     [(LO, 'src="muscles/muscle mollet.png" alt="" class="ex-grp-vig ex-grp-vig-centre"', 'src="' + V + '07_abdominaux.png" alt="" class="ex-grp-vig ex-grp-vig-centre"')], 'GARDE', 'C-VIG-A2'),
    ('MV4 [deguisee] cadre centre au lieu d\'ancre en bas (le liseré du haut revient)',
     [(CS, "object-fit:cover;object-position:50% 100%;border-radius:10px;", "object-fit:cover;object-position:50% 50%;border-radius:10px;")], 'GARDE', 'C-VIG-A5'),
    # MV5 était GARDE (C-VIG-B1) tant que l'en-tête était une rangée SANS retour : l'image s'y écrasait. Depuis le correctif
    # de la revue adverse (23/10), l'en-tête passe à la ligne au lieu d'écraser l'image : MESURÉ sans cette règle, la vignette
    # reste en 88 × 51 de 300 à 430 px, en-tête comme tuiles, sans débordement. La règle reste, défensive ; la casse est équivalente.
    ('MV5 [equivalente depuis le correctif de l\'en-tete] flex-shrink:0 retire de la vignette (elle ne retrecit plus nulle part)',
     [(CS, ".ex-grp-vig{width:88px;height:51px;flex-shrink:0;", ".ex-grp-vig{width:88px;height:51px;")], 'OK'),
    ('MV6 l\'en-tete n\'est plus en ligne (le libelle long repasse sous l\'image)',
     [(CS, "letter-spacing:.3px;display:flex;align-items:center;gap:10px;flex:1 1 auto;flex-wrap:wrap;}", "letter-spacing:.3px;flex:1 1 auto;}")], 'GARDE', 'C-VIG-B1'),
    # ↓ les 3 suivantes viennent de la revue adverse du 23/10 (en-tête qui débordait à 320 px ; S2 qui ne lisait que du texte)
    ('MV15 l\'en-tete ne peut plus passer a la ligne (flex-wrap retire) : a 320 px « Abdominaux » fait deborder la feuille',
     [(CS, "gap:10px;flex:1 1 auto;flex-wrap:wrap;}", "gap:10px;flex:1 1 auto;}")], 'GARDE', 'C-VIG-B4'),
    ('MV16 [deguisee] le libelle reprend la largeur de son contenu (base 0 retiree) : les libelles longs passent sous l\'image',
     [(CS, ".ex-grp-header-label{flex:1 1 0;}", ".ex-grp-header-label{flex:0 1 auto;}")], 'GARDE', 'C-VIG-B1'),
    ('MV17 [deguisee] les vignettes mises en commentaire dans la liste de prechargement (le texte reste dans sw.js)',
     [(SW, "  './" + V + "01_pectoraux.png',", "  /* './" + V + "01_pectoraux.png',"),
      (SW, "'./" + V + "07_abdominaux.png',", "'./" + V + "07_abdominaux.png', */")], 'GARDE', 'C-VIG-S2'),
    ('MV7 cadre 64 x 64 (l\'ancien)',
     [(CS, ".ex-grp-vig{width:88px;height:51px;", ".ex-grp-vig{width:64px;height:64px;")], 'GARDE', 'C-VIG-A4'),
    # ⚠️ hors ligne, elle resterait servie : les tuiles sont dessinees au demarrage, le service worker les met en cache a la volee
    #    (mesure du 23/10) — le prechargement est un filet, que seul C-VIG-S2 verifie
    ('MV8 une vignette n\'est plus prechargee (liste PRECACHE)',
     [(SW, "'./" + V + "07_abdominaux.png',\n", "\n")], 'GARDE', 'C-VIG-S2'),
    ('MV9 [deguisee] un fichier image modifie d\'un octet (ce n\'est plus le fichier du paquet)', OCTET, 'GARDE', 'C-VIG-S1'),
    ('MV10 une categorie change (tags du Dos)',
     [(LO, "{label:'Dos / Dorsaux',           tags:['Dos'],", "{label:'Dos / Dorsaux',           tags:['Dorsaux'],")], 'GARDE', 'C-VIG-S3'),
    ('MV11 [deguisee] le bouton « Anatomie » des Pectoraux ouvre un autre schema',
     [(LO, "anatomy:'anatomy/pectoreaux/schema pectoreaux.png'", "anatomy:'anatomy/abdominaux/schema abdominaux.png'")], 'GARDE', 'C-VIG-B3'),
    ('MV12 les vignettes de groupe gagnent un autre ecran (table des vignettes de mouvement)',
     [(LO, "const _MG_IMG={\n  pec:'muscles/muscle pectoreaux.png',", "const _MG_IMG={\n  pec:'" + V + "01_pectoraux.png',")], 'GARDE', 'C-VIG-S4'),
    ('MV13 [deguisee] un exercice inconnu recoit une vignette de groupe par defaut',
     [(LO, "  const src=_exImg(e.n);", "  const src=_exImg(e.n)||'" + V + "01_pectoraux.png';")], 'GARDE', 'C-VIG-D1'),
    ('MV14 un libelle de groupe change',
     [(LO, "{label:'Abdominaux',              tags:['Abdominaux'],", "{label:'Abdos',              tags:['Abdominaux'],")], 'GARDE', 'C-VIG-A1'),
    ('MN1 [neutre] un commentaire change',
     [(LO, "LES VIGNETTES DES GROUPES DE « CHOISIR UN\n   EXERCICE ».", "LES VIGNETTES DES GROUPES.\n   (commentaire)")], 'OK'),
    ('MN2 [equivalente] « center bottom » au lieu de « 50% 100% » (meme position calculee)',
     [(CS, "object-fit:cover;object-position:50% 100%;border-radius:10px;", "object-fit:cover;object-position:center bottom;border-radius:10px;")], 'OK'),
]


def banc(arbre):
    try:
        r = subprocess.run(['node', 'tools/banc_picker_vignettes.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_vig_')
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
        elif remplacements == OCTET:
            with open(os.path.join(arbre, V + '05_jambes.png'), 'ab') as fh:
                fh.write(b'\0')
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
            for f in (LO, SW):
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
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3], flush=True); return 1
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
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3], flush=True)
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)', flush=True)
    print('\n%d/%d conformes' % (conformes, len(choix)), flush=True)
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
