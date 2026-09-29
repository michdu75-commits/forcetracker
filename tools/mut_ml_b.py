#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 6 / ML-B (session-B) : les temoins B-CDIV / B-CDV savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin CONDUIT (libelle « T… », bloc ecran B-CDV)
rougit. Un rouge des seuls temoins de SOURCE (①..⑥) ne suffit pas : la mutation est alors NON conforme.
M00 remet log.js tel qu'il etait AVANT ML-B (master 2f10ae40, ft-v1242), mot pour mot.
M1..M8 = la liste demandee par Michel · D1..D4 = deguisees · D5 = equivalente (doit RESTER verte)
· [negatif] = commentaire citant les motifs (doit RESTER vert).
Usage : python3 tools/mut_ml_b.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges, pas seulement le premier)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '2f10ae40'
LO = 'log.js'
FICHIERS = (LO,)

H_FILTRE = "  const reste=exs.filter(e=>e&&e.group===gid);\n"
H_COND = "  if(reste.length<2)reste.forEach(e=>{delete e.group;delete e.groupType;});\n"
RFG = "  delete S.wkt.exs[ei].group;delete S.wkt.exs[ei].groupType;\n  _dissoudreGroupeOrphelin(S.wkt.exs,gid);\n"
RME = "    S.wkt.exs.splice(ei,1);\n    _dissoudreGroupeOrphelin(S.wkt.exs,gid);   // ML-B : le survivant perd aussi `groupType`\n"

MUT = [
    ("M00 code d'AVANT ML-B remis mot pour mot (log.js de 2f10ae40)", 'AVANT', 'GARDE'),
    ('M1 retour a l\'ancien comportement : le groupe n\'est dissous qu\'a 0 membre (1 membre reste actif)',
     [(LO, H_COND, H_COND.replace('reste.length<2', 'reste.length<1'))], 'GARDE'),
    ('M2 oubli de nettoyer le membre restant (son `groupType` reste)',
     [(LO, H_COND, "  if(reste.length<2)reste.forEach(e=>{delete e.group;});\n")], 'GARDE'),
    ('M3 suppression accidentelle du dropset du survivant',
     [(LO, H_COND, "  if(reste.length<2)reste.forEach(e=>{delete e.group;delete e.groupType;delete e.dropset;});\n")], 'GARDE'),
    ('M4 suppression accidentelle de series du survivant',
     [(LO, H_COND, "  if(reste.length<2)reste.forEach(e=>{delete e.group;delete e.groupType;e.sets=e.sets.slice(0,1);});\n")], 'GARDE'),
    ('M5 les AUTRES groupes sont dissous aussi',
     [(LO, H_COND, "  if(reste.length<2)exs.forEach(e=>{delete e.group;delete e.groupType;});\n")], 'GARDE'),
    ('M6 dissolution trop tot : un groupe de 2 est dissous',
     [(LO, H_COND, H_COND.replace('reste.length<2', 'reste.length<3'))], 'GARDE'),
    ('M7 l\'exercice retire part en fin de seance (ordre modifie)',
     [(LO, RFG, RFG + "  S.wkt.exs.push(S.wkt.exs.splice(ei,1)[0]);\n")], 'GARDE'),
    ('M8 reconstruction partielle du survivant (un champ inconnu se perd)',
     [(LO, H_COND, "  if(reste.length<2)reste.forEach(e=>{const k=exs.indexOf(e);exs[k]={name:e.name,note:e.note,sets:e.sets,dropset:e.dropset};});\n")], 'GARDE'),
    ('D1 [deguisee] removeFromGroup compte les membres AVANT de retirer le sien',
     [(LO, RFG, "  _dissoudreGroupeOrphelin(S.wkt.exs,gid);\n  delete S.wkt.exs[ei].group;delete S.wkt.exs[ei].groupType;\n")], 'GARDE'),
    ('D2 [deguisee] rmEx compte les membres AVANT de supprimer l\'exercice',
     [(LO, RME, "    _dissoudreGroupeOrphelin(S.wkt.exs,gid);\n    S.wkt.exs.splice(ei,1);\n")], 'GARDE'),
    ('D3 [deguisee] on compte par TYPE de groupe au lieu de l\'identifiant',
     [(LO, H_FILTRE, "  const reste=exs.filter(e=>e&&e.group&&e.groupType==='super');\n")], 'GARDE'),
    ('D4 [deguisee] le survivant recoit group/groupType = null au lieu de perdre les cles',
     [(LO, H_COND, "  if(reste.length<2)reste.forEach(e=>{e.group=null;e.groupType=null;});\n")], 'GARDE'),
    ('D5 [equivalente] « <=1 » au lieu de « <2 » : meme comportement, doit RESTER vert',
     [(LO, H_COND, H_COND.replace('reste.length<2', 'reste.length<=1'))], 'OK'),
    ('[negatif] commentaire citant les motifs cherches (left.length<1, delete e.dropset)',
     [(LO, H_COND, H_COND + "  // left.length<1 · delete e.dropset · JSON.parse(JSON.stringify( · Object.assign(\n")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_ml_b.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def conduits(rouges):
    # les temoins CONDUITS du bloc ecran B-CDV ont un libelle qui commence par « T »
    return [x for x in rouges if re.match(r'❌ ROUGE T', x)]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ml_b_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s' % (f, av[:50]))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        cd = conduits(rouges)
        obtenu = 'GARDE' if cd else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = cd[0] if cd else (rouges[0] if rouges else '')
        print('  %s  %-92s %-6s %2d rouge(s), %2d conduit(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(cd), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
