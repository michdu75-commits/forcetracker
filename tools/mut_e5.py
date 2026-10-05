#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — E5 (session-B) : les temoins B-E5-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
⭐ Une mutation n'est « attrapee » que si un temoin d'ECRAN (E5-*) rougit : un temoin qui lit la source ne
   suffit pas (BUGS.md §64). Les rouges de source sont affiches a part.
M00 remet coach.js tel qu'il etait AVANT le chantier (master a1e39739, ft-v1250), mot pour mot.
M-E5-1..7 = les mutations demandees par Michel · M-E5-8.. = deguisees, equivalente, negative.
Usage : python3 tools/mut_e5.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'a1e39739'
CO, LO = 'coach.js', 'log.js'
FICHIERS = ('coach.js', 'log.js')

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (master a1e39739)", 'AVANT', 'GARDE'),
    ('M-E5-1 protection anti-double appel retiree (aucun verrou : ni page, ni « deja couvert »)',
     [(CO, "function _dbfDejaCouvert(id){ return _dbfEnVol(id) || !!_dbfTexteDe(id); }", "function _dbfDejaCouvert(id){ return false; }"),
      (CO, "    if(e && e.page===_DBF_PAGE) return;\n", "")], 'GARDE'),
    ('M-E5-2 un echec est marque « termine » trop tot (livre et retire de la file)',
     [(CO, "  _dbfEcrire(l); _dbfFini(id, true);\n}", "  _dbfEcrire(l); _dbfFini(id);\n}")], 'GARDE'),
    ('M-E5-3 jamais remis en retry apres un echec',
     [(CO, "  if(l.indexOf(s)<0) l.unshift(s);\n  _dbfEcrire(l); _dbfFini(id, true);", "  _dbfEcrire(l); _dbfFini(id, true);")], 'GARDE'),
    ('M-E5-4 la DATE au lieu du sessionId pour savoir ce qui est en vol',
     [(CO, "  const e=_dbfVolLire()[String(id)];\n  return !!(e && e.page===_DBF_PAGE);",
           "  const d=x=>{ const q=((typeof S!=='undefined'&&S.sessions)||[]).find(z=>z&&String(z.id||z.ts||z.date)===String(x)); return q?q.date:String(x); };\n"
           "  const v=_dbfVolLire(); return Object.keys(v).some(k=>v[k]&&v[k].page===_DBF_PAGE&&d(k)===d(id));")], 'GARDE'),
    ("M-E5-5 verrou oublie a l'ouverture du Coach",
     [(CO, "  const reste=l.filter(x=>!_dbfDejaCouvert(x));\n", "  const reste=l.slice();\n")], 'GARDE'),
    ('M-E5-6a verrou oublie au demarrage (le rattrapage reprend aussi un appel VIVANT de cette page)',
     [(CO, "    if(e && e.page===_DBF_PAGE) return;\n", "")], 'GARDE'),
    ('M-E5-6b verrou oublie au demarrage (le filet n°3 re-inscrit une seance en vol)',
     [(CO, "      if(_dbfEnVol(sid) || _dbfTexteDe(sid)) return;", "      if(_dbfTexteDe(sid)) return;")], 'GARDE'),
    ('M-E5-7 complete:false considere comme un succes',
     [(CO, "  if(!r || r===_DBF_REPLI) return false;\n  return (typeof _miloEtatReponse==='function') ? _miloEtatReponse(data)==='complete' : data.complete===true;",
       "  if(!r) return false;\n  return true;")], 'GARDE'),
    ("M-E5-8 [deguisee] « deja couvert » lu dans _dbfFaits au lieu du magasin (perd les anciens echecs)",
     [(CO, "function _dbfDejaCouvert(id){ return _dbfEnVol(id) || !!_dbfTexteDe(id); }",
           "function _dbfDejaCouvert(id){ return _dbfEnVol(id) || _dbfFaits().indexOf(String(id))>=0; }")], 'GARDE'),
    ('M-E5-9 [deguisee] un minuteur arbitraire (10 s) a la place de la preuve de vie par page',
     [(CO, "    if(e && e.page===_DBF_PAGE) return;\n", "    if(e && (Date.now()-(Number(e.ts)||0))<10000) return;\n")], 'GARDE'),
    ('M-E5-10 [deguisee] le magasin ignore : un debrief deja range est repaye',
     [(CO, "function _dbfDejaCouvert(id){ return _dbfEnVol(id) || !!_dbfTexteDe(id); }", "function _dbfDejaCouvert(id){ return _dbfEnVol(id); }")], 'GARDE'),
    ('M-E5-11 [deguisee] le « recu » libere TOUS les appels en vol (seance B en vol pendant A)',
     [(CO, "  _dbfVolRetirer(id);   // plus « en vol »", "  _dbfVolEcrire({});   // plus « en vol »")], 'GARDE'),
    ('M-E5-12 [equivalente mesuree] le succes ne retire plus la seance de la file (le verrou du Coach la retire deja)',
     [(CO, "    if(id){ const l=_dbfLire(), i=l.indexOf(String(id)); if(i>=0){ l.splice(i,1); _dbfEcrire(l); } }\n", "")], 'OK'),
    ('M-E5-13 [negatif] commentaire citant les motifs (page, en vol, date, minuteur)',
     [(CO, "function _dbfDejaCouvert(id){", "// _DBF_PAGE _dbfEnVol .date setTimeout Date.now()- : cite, jamais execute\nfunction _dbfDejaCouvert(id){")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_e5.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:130] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_e5_')
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
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        ecran = [x for x in rouges if 'ROUGE E5-' in x or 'PLANTAGE' in x]
        obtenu = 'GARDE' if ecran else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-96s %-6s %2d ecran / %2d source  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(ecran), len(rouges) - len(ecran), ecran[0] if ecran else (rouges[0] if rouges else '')))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
