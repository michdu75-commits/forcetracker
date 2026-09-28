#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 6 / ML-A (session-B) : les temoins B-CDII / B-CDIII savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet log.js tel qu'il etait AVANT ML-A (master dcc2ff43, ft-v1241), mot pour mot.
M1..M3 = un des trois sites ne recopie plus · M4 = valeur par defaut · M5 = dropset invente quand absent
M6 = copie tronquee aux trois champs connus · M7..M10 = deguisees (alias, pyramide oubliee, copie generique, copie superficielle).
Usage : python3 tools/mut_ml_a.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges, pas seulement le premier)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'dcc2ff43'
LO = 'log.js'
FICHIERS = (LO,)

APPEL_SAV = "      _recopierDropset(ex,o);                                           // LOT 6 / ML-A\n"
APPEL_L1 = "\n      _recopierDropset(e,obj);                                              // LOT 6 / ML-A"
APPEL_L2 = "\n    _recopierDropset(e,obj);                                              // LOT 6 / ML-A"
GARDE = "  if(!src||!dst||src.dropset===undefined)return dst;\n"
COPIE = "  dst.dropset=JSON.parse(JSON.stringify(src.dropset));\n"
O_SAV = "      const o={name:ex.name,sets:ex.sets.map(s=>({kg:s.kg||0,reps:s.reps||5,maxi:!!s.maxi,type:s.type||'N',rest:_secRepos(s.rest)}))};\n"
#OBJ_L1 = "      const obj={name:e.name,note:e.note||'',sets:(e.sets||[]).map((s,i)=>{\n        const pp=_pa[i];\n        return {\n          kg:pp?pp.kg:(s.kg||0),\n          reps:s.maxi?0:(pp?pp.reps:(s.reps||5)),"

MUT = [
    ("M00 code d'AVANT ML-A remis mot pour mot (log.js de dcc2ff43)", 'AVANT', 'GARDE'),
    ('M1 dropset omis dans saveAsProg', [(LO, APPEL_SAV, '')], 'GARDE'),
    ('M2 dropset omis dans _loadProgVraiment', [(LO, APPEL_L1, '')], 'GARDE'),
    ('M3 dropset omis dans _loadProgDayVraiment', [(LO, APPEL_L2, '')], 'GARDE'),
    ('M4 dropset remplace par une valeur par defaut', [(LO, COPIE, "  dst.dropset={paliers:3,pct:20,direction:'down'};\n")], 'GARDE'),
    ('M5 dropset cree artificiellement quand absent',
     [(LO, GARDE + COPIE, "  if(!src||!dst)return dst;\n  dst.dropset=src.dropset===undefined?{paliers:3,pct:20,direction:'down'}:JSON.parse(JSON.stringify(src.dropset));\n")], 'GARDE'),
    ('M6 contenu tronque aux trois champs connus (paliers, pct, direction)',
     [(LO, COPIE, "  dst.dropset=src.dropset&&{paliers:src.dropset.paliers,pct:src.dropset.pct,direction:src.dropset.direction};\n")], 'GARDE'),
    ('M7 [deguisee] alias : le programme et la seance partagent le meme objet', [(LO, COPIE, "  dst.dropset=src.dropset;\n")], 'GARDE'),
    ('M8 [deguisee] seul le dropset descendant est recopie (la pyramide + se perd)',
     [(LO, GARDE, "  if(!src||!dst||src.dropset===undefined||(src.dropset&&src.dropset.direction!=='down'))return dst;\n")], 'GARDE'),
    ('M9 [deguisee] copie GENERIQUE de l\'exercice dans saveAsProg (champs realises embarques)',
     [(LO, O_SAV, "      const o=Object.assign(JSON.parse(JSON.stringify(ex)),{sets:ex.sets.map(s=>({kg:s.kg||0,reps:s.reps||5,maxi:!!s.maxi,type:s.type||'N',rest:_secRepos(s.rest)}))});\n")], 'GARDE'),
    ('M9b [deguisee] copie GENERIQUE de l\'exercice dans _loadProgVraiment (champs inconnus embarques)',
     [(LO, APPEL_L1, "\n      Object.keys(e).forEach(k=>{if(!(k in obj))obj[k]=JSON.parse(JSON.stringify(e[k]));});" + APPEL_L1)], 'GARDE'),
    ('M10 [deguisee] copie SUPERFICIELLE (sous-objets partages)',
     [(LO, COPIE, "  dst.dropset=(src.dropset&&typeof src.dropset==='object')?Object.assign({},src.dropset):src.dropset;\n")], 'GARDE'),
    ('[negatif] commentaire citant tous les motifs cherches',
     [(LO, APPEL_SAV, APPEL_SAV + "      // _recopierDropset(ex,o) dropset JSON.parse(JSON.stringify( paliers pct direction src.dropset===undefined\n")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_ml_a.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ml_a_')
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
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
