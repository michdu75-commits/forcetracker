#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUTRITION LOT 3 / NUT-FOODLOG-RESTORE-01 (01/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXIII : restauration conduite
     dans l'app, et B-CDXXIV : collision d'id C7prime). Un rouge des seuls temoins de SOURCE (B-CDXXII) ne suffit pas.
  M00 = le code d'avant (master 1ca144ad) remis mot pour mot · M01..M08 = les defauts demandes par Michel et
  chaque garde retiree une par une · DG1..DG2 = deguisees · EQ1 = equivalente (tout reste vert) · [negatif] = commentaire
Usage : python3 tools/mut_foodlog_restore.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '1ca144ad'
ST, SE = 'state.js', 'setup.js'
FICHIERS = (ST, SE)

APPEL = "S.foodLog=_fusionnerFoodLogRestauration(S.foodLog,d.foodLog).liste;_foodLogIdentifier(S.foodLog);"
ABS = "      if(absorbe.has(k)){ vus.push(e); cloudParId.set(c.id,vus); return; }"
AJOUT = "      out.push(c); ajoutees++; return;\n    }"
IDEM = "        if(n>0){ libres.set(e,n-1); return; }                                  // déjà préservé sur le téléphone"
CHOIX = "    if(premier>=0) absorbe.add(identique>=0?identique:premier);"
IDV = "  const idValide=l=>(typeof l.id==='string' && l.id.length>=8);"
MULTI = "    const e=_empreinteFood(c), n=libres.get(e)||0;\n    if(n>0){ libres.set(e,n-1); return; }"
EMP = "Object.keys(v).filter(k=>k!=='id')"
DEDUP = "      if(vus.indexOf(e)>=0 || parIdLocal.get(c.id)===e) return;"
RET = "  return {liste:out, ajoutees};"

MUT = [
    ('M00 le code d\'avant remis mot pour mot (master %s, state.js + setup.js)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M01 l\'ancienne regle par longueur retablie', [(SE, APPEL, "if(d.foodLog.length>=(S.foodLog||[]).length)S.foodLog=d.foodLog;")], 'GARDE'),
    ('M02 le cloud gagne a id egal', [(ST, ABS, "      if(absorbe.has(k)){ vus.push(e); cloudParId.set(c.id,vus); const i=out.findIndex(l=>l&&l.id===c.id); if(i>=0) out[i]=c; return; }")], 'GARDE'),
    ('MC7 [C7prime] tout exemplaire cloud d\'un id present sur le telephone est absorbe (comportement du checkpoint dc2ca3a8)', [(ST, ABS, "      if(parIdLocal.has(c.id)){ vus.push(e); cloudParId.set(c.id,vus); return; }")], 'GARDE'),
    ('MC7b [C7prime] la collision deja preservee n\'est plus reconnue (B recree a chaque restauration)', [(ST, IDEM, "        if(false){ return; }")], 'GARDE'),
    ('MC7c [C7prime] le PREMIER exemplaire est absorbe meme quand une copie identique existe plus loin', [(ST, CHOIX, "    if(premier>=0) absorbe.add(premier);")], 'GARDE'),
    ('M03 les lignes cloud absentes du telephone sont ignorees', [(ST, AJOUT, "      return;\n    }")], 'GARDE'),
    ('M04 les identifiants sont ignores (tout par contenu)', [(ST, IDV, "  const idValide=l=>false;")], 'GARDE'),
    ('M05 rapprochement flou des anciennes lignes (nom, date, repas)', [(ST, EMP, "Object.keys(v).filter(k=>k==='name'||k==='date'||k==='meal')")], 'GARDE'),
    ('M06 pas de multi-ensemble (une copie locale avale toutes les copies cloud)', [(ST, MULTI, "    const e=_empreinteFood(c), n=libres.get(e)||0;\n    if(n>0){ return; }")], 'GARDE'),
    ('M07 plus d\'identite canonique apres la fusion', [(SE, APPEL, "S.foodLog=_fusionnerFoodLogRestauration(S.foodLog,d.foodLog).liste;")], 'GARDE'),
    ('M08 les copies identiques du meme id dans le cloud ne sont plus fondues', [(ST, DEDUP, "      if(parIdLocal.get(c.id)===e) return;")], 'GARDE'),
    ('DG1 [deguisee] l\'union est rendue a l\'envers (ordre du telephone perdu)', [(ST, RET, "  return {liste:out.slice().reverse(), ajoutees};")], 'GARDE'),
    ('DG2 [deguisee] l\'empreinte des anciennes lignes inclut l\'id pose par le telephone', [(ST, EMP, "Object.keys(v).filter(k=>true)")], 'GARDE'),
    ('EQ1 [equivalente] le compteur `ajoutees` n\'est plus tenu', [(ST, AJOUT, "      out.push(c); return;\n    }")], 'OK'),
    ('[negatif] commentaire citant la regle par longueur', [(ST, RET, RET + "  // d.foodLog.length>=(S.foodLog||[]).length")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_foodlog_restore.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXX(III|IV) ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_foodlog_restore_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
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
        if isinstance(remplacements, str) and remplacements.startswith('REV:'):
            rev = remplacements[4:]; diff = 0
            for f in FICHIERS:
                av = subprocess.run(['git', 'show', rev + ':' + f], cwd=SRC, capture_output=True, text=True).stdout
                if not av:
                    print('  INVALIDE  %s (%s introuvable dans %s)' % (nom, f, rev)); break
                if av != open(os.path.join(arbre, f), encoding='utf-8').read(): diff += 1
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av)
            else:
                if not diff:
                    print('  INVALIDE  %s (code de %s identique)' % (nom, rev)); shutil.rmtree(tmp, ignore_errors=True); continue
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
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-86s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
