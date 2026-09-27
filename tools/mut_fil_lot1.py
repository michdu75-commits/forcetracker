#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 1 (session-B) : les temoins B-CCCXCIII / B-CCCXCIV savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet coach.js ET log.js tels qu'ils etaient AVANT le lot 1 (master 2f5ccdb5, ft-v1238), mot pour mot.
M01 = la coupe a 20 reintroduite (F07a) · M02 = la garde d'hydratation court-circuitee (F07b).
Usage : python3 tools/mut_fil_lot1.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges, pas seulement le premier)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '2f5ccdb5b9f526f548f6314aebaf0d4cfc232582'
CO, LO = 'coach.js', 'log.js'

GARDE = "    if(!_coachHistHydrater()) return false;\n"
PUSH = ("    if(instr) coachHistory.push({role:'user',content:String(instr),_silent:true});\n"
        "    coachHistory.push({role:'assistant',content:String(reply)});\n")
TRIM = "    _trimCoachHistory();\n    if(typeof _saveCoachHist==='function')_saveCoachHist();\n"
LISIBLE = ("  try{\n    const raw=localStorage.getItem('ft4_coach_hist');\n"
           "    if(raw!=null && !Array.isArray(JSON.parse(raw))) return false;\n  }catch(e){ return false; }\n")
CHARGE = "  if(!_coachHistLoaded){ _loadCoachHist(); _coachHistLoaded=true; }\n  return true;\n}"
FIN = ("    try{ if(_pose===false && typeof _dbfMarquerFait==='function') _dbfMarquerFait(_pid);\n"
       "         else if(typeof _dbfFini==='function') _dbfFini(_pid); }catch(e){}")
RECUP = "&& !_dbfPoserDansHistorique(_r.reply, _r.instr)){ _dbfMarquerFait(_r.id); return; }"
SAVE = "function _saveCoachHist(){\n"
PAYLOAD8 = "history:(typeof _coachHistPayload==='function'?_coachHistPayload(8):coachHistory.slice(-8))"

MUT = [
    ('M00 code d\'AVANT le lot 1 remis mot pour mot (coach.js + log.js de 2f5ccdb5)', 'AVANT', 'GARDE'),
    ('M01 F07a : la coupe a 20 reintroduite dans le debrief',
     [(CO, TRIM, "    if(coachHistory.length>20)coachHistory=coachHistory.slice(-20);\n    if(typeof _saveCoachHist==='function')_saveCoachHist();\n")], 'GARDE'),
    ('M02 F07b : la garde d\'hydratation court-circuitee (plus appelee avant la mutation)', [(CO, GARDE, '')], 'GARDE'),
    ('M02b F07b : la garde repond « pret » sans rien charger', [(CO, CHARGE, "  return true;\n}")], 'GARDE'),
    ('M03 la garde prend un contenu ILLISIBLE pour un fil vide', [(CO, LISIBLE, '')], 'GARDE'),
    ('M04 [deguisee] la garde se fie au drapeau « charge » (Coach ouvert sur un fil illisible)',
     [(CO, LISIBLE, "  if(_coachHistLoaded) return true;\n" + LISIBLE)], 'GARDE'),
    ('M05 fin de seance : le « recu » est efface meme quand le debrief n\'a pas ete pose',
     [(LO, FIN, "    try{ if(typeof _dbfFini==='function') _dbfFini(_pid); }catch(e){}")], 'GARDE'),
    ('M06 rattrapage : le « recu » est jete quand le fil est encore illisible',
     [(CO, RECUP, ") _dbfPoserDansHistorique(_r.reply, _r.instr);")], 'GARDE'),
    ('M07 [deguisee] la garde deplacee a l\'ENREGISTREMENT (_saveCoachHist refuse si non charge)',
     [(CO, GARDE, ''), (CO, SAVE, SAVE + "  if(!_coachHistLoaded) return;\n")], 'GARDE'),
    ('M08 [deguisee] l\'hydratation APRES la mutation (le chargement ecrase le debrief)',
     [(CO, GARDE + PUSH, PUSH + GARDE)], 'GARDE'),
    ('M09 la borne de securite (400) retiree du debrief', [(CO, TRIM, "    if(typeof _saveCoachHist==='function')_saveCoachHist();\n")], 'GARDE'),
    ('M10 le debrief envoie 10 messages a Milo au lieu de 8 (controle `_coachHistPayload(8)`)',
     [(LO, PAYLOAD8, PAYLOAD8.replace('(8)', '(10)'))], 'GARDE'),
    ('M11 [deguisee] le « recu » survit a un debrief pose : reposE au rechargement (doublon)',
     [(LO, FIN, "    try{ if(typeof _dbfMarquerFait==='function') _dbfMarquerFait(_pid); }catch(e){}")], 'GARDE'),
    ('M12 [deguisee] le debrief range en TETE du fil (reordonnancement)',
     [(CO, "    coachHistory.push({role:'assistant',content:String(reply)});\n",
       "    coachHistory.unshift({role:'assistant',content:String(reply)});\n")], 'GARDE'),
    ('[negatif] commentaires citant tous les mots cherches',
     [(CO, GARDE, "    // if(coachHistory.length>20)coachHistory=coachHistory.slice(-20); _coachHistLoaded _dbfFini(_pid) JSON.parse\n" + GARDE),
      (CO, SAVE, SAVE + "  // _coachHistLoaded _coachHistHydrater\n")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_fil_lot1.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_lot1_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in (CO, LO)}
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
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in (CO, LO)}
            if any(not avant[f] or avant[f] == cur[f] for f in (CO, LO)):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in (CO, LO):
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in (CO, LO)}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s' % (f, av[:50]))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in (CO, LO):
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
