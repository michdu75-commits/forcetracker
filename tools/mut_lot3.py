#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 3 (session-B) : les temoins B-CCCXCVII / B-CCCXCVIII savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet state.js, log.js, coach.js, setup.js et app.js tels qu'ils etaient AVANT le lot 3 (master b5069757, ft-v1240), mot pour mot.
B01..B07 = LOT 3B (_recoverDraft) : B01 = dependance a S.sessions[0] reintroduite · B02 = correspondance volontairement vague.
M01 = `.slice(-1)[0]` reintroduit · M02 = `unshift` sans tri · M03 = « la liste la plus longue gagne »
M04 = deduplication heuristique date + nombre d'exercices + premier exercice · M05 = plus de tri apres la fusion.
Usage : python3 tools/mut_lot3.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges, pas seulement le premier)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'b5069757'
ST, LO, CO, SE, AP = 'state.js', 'log.js', 'coach.js', 'setup.js', 'app.js'
FICHIERS = (ST, LO, CO, SE, AP)

DERNIERE = "  const derniere=_derniereSeance(x=>x&&x.progLabel);\n"
TRI_FIN = "  _trierSeances(S.sessions);\n  let _savedOk=false;\n"
UNION = "    const _r=_fusionnerSeancesRestauration(S.sessions, sessions);\n"
AJOUT = "      if(!l){ out.push(c); parId.set(String(c.id),c); ajoutees++; return; }\n"
RETOUR = "  return {liste:_trierSeances(out), ajoutees, conflits};\n"
CMP = "  if(da!==db) return da<db?1:-1;\n  return (+(b&&b.ts)||0)-(+(a&&a.ts)||0);\n"
CONFLIT = "      if(_empreinteSeance(l)!==_empreinteSeance(c)) conflits.push(c);\n"
SYNCED = "      sess.synced=true;"
ANNULE = "    { const _i=S.sessions.indexOf(sess); if(_i>=0) S.sessions.splice(_i,1); }\n"
DATES = "function _cmpSeances(a,b){\n  const da=String(a&&a.date||''), db=String(b&&b.date||'');\n"
GARDE_CONFLITS = "      _r.conflits.forEach(c=>{ const e=_empreinteSeance(c); if(!_vus.has(e)){ _vus.add(e); _anc.push(c); } });\n"
CHARGE = "    S.sessions=_trierSeances(_lsJson('ft4_sessions',[]));"
REC = "    if(_seanceDuBrouillon(draft)){localStorage.removeItem('ft4_wkt_draft');return;}\n"
LIEN_FIND = "  return L.find(s=>{\n"
LIEN_BORNE = "    return ecart>=0 && ecart<1000+_BROUILLON_MARGE_MS;\n"
LIEN_FIGEE = "    if(figee) return +s.ts>=figee && Math.floor(Math.max(0,figee-t0-pause)/1000)===s.duration;\n"
LIEN_PAUSE = "  const pause=+(draft.pausedTotal||0)||0, figee=+(draft.pausedAt||0)||0;\n"
HEUR = ("if(out.some(s=>s.date===c.date&&(s.exs||[]).length===(c.exs||[]).length"
        "&&((s.exs||[])[0]||{}).name===((c.exs||[])[0]||{}).name)) return; ")

MUT = [
    ("M00 code d'AVANT le lot 3 remis mot pour mot (state/log/coach/setup/app de b5069757)", 'AVANT', 'GARDE'),
    ('M01 `.slice(-1)[0]` reintroduit pour la derniere seance a libelle (F03 rouvert)',
     [(CO, DERNIERE, "  const derniere=(S.sessions||[]).filter(x=>x&&x.progLabel).slice(-1)[0]||null;\n")], 'GARDE'),
    ('M02 `unshift` sans tri a la fin de seance (F03b rouvert)', [(LO, TRI_FIN, "  let _savedOk=false;\n")], 'GARDE'),
    ('M03 restauration : « la liste la plus longue gagne »',
     [(SE, UNION, "    const _r={liste:(sessions&&sessions.length>(S.sessions||[]).length)?sessions:S.sessions,ajoutees:0,conflits:[]};\n")], 'GARDE'),
    ('M04 deduplication HEURISTIQUE date + nb d\'exercices + premier exercice',
     [(ST, AJOUT, AJOUT.replace("if(!l){ out.push(c);", "if(!l){ " + HEUR + "out.push(c);"))], 'GARDE'),
    ('M05 plus de tri apres la fusion', [(ST, RETOUR, "  return {liste:out, ajoutees, conflits};\n")], 'GARDE'),
    ('M06 [deguisee] comparateur `ts` d\'abord (l\'ancien tri de l\'import)',
     [(ST, CMP, "  return ((+(b&&b.ts)||0)-(+(a&&a.ts)||0)) || (da<db?1:da>db?-1:0);\n")], 'GARDE'),
    ('M07 [deguisee] conflit : la version du cloud remplace le telephone en silence',
     [(ST, CONFLIT, "      if(_empreinteSeance(l)!==_empreinteSeance(c)) out[out.indexOf(l)]=c;\n")], 'GARDE'),
    ('M08 [deguisee] conflit garde a part… mais le CLOUD devient la version active',
     [(ST, CONFLIT, "      if(_empreinteSeance(l)!==_empreinteSeance(c)){ conflits.push(l); out[out.indexOf(l)]=c; }\n")], 'GARDE'),
    ('M09 `synced` pose sur la PREMIERE du tableau', [(LO, SYNCED, "      if(S.sessions.length)S.sessions[0].synced=true;")], 'GARDE'),
    ('M10 annulation par `shift()` (retire la tete, plus la seance ajoutee)', [(LO, ANNULE, "    S.sessions.shift();\n")], 'GARDE'),
    ('M11 [deguisee] une date absente est lue comme « aujourd\'hui »',
     [(ST, DATES, "function _cmpSeances(a,b){\n  const da=String(a&&a.date||today()), db=String(b&&b.date||today());\n")], 'GARDE'),
    ('M12 [deguisee] la variante du cloud n\'est plus gardee (conflit oublie)', [(SE, GARDE_CONFLITS, '')], 'GARDE'),
    ('M13 le chargement ne range plus l\'historique', [(ST, CHARGE, "    S.sessions=_lsJson('ft4_sessions',[]);")], 'GARDE'),
    ('B01 [LOT 3B] dependance a S.sessions[0] reintroduite (lien fort, mais sur la premiere seulement)',
     [(AP, LIEN_FIND, "  return [L[0]].find(s=>{\n")], 'GARDE'),
    ('B01b [LOT 3B] ancienne regle remise : S.sessions[0], meme date, assez d\'exercices',
     [(AP, REC, "    const lastSess=S.sessions&&S.sessions[0];if(lastSess&&lastSess.date===(draft.date||today())&&lastSess.exs&&lastSess.exs.length>=draft.exs.length){localStorage.removeItem('ft4_wkt_draft');return;}\n")], 'GARDE'),
    ('B02 [LOT 3B] correspondance vague sur toute la liste : meme date + au moins autant d\'exercices',
     [(AP, REC, "    if((S.sessions||[]).some(s=>s&&s.date===draft.date&&(s.exs||[]).length>=draft.exs.length)){localStorage.removeItem('ft4_wkt_draft');return;}\n")], 'GARDE'),
    ('B03 [LOT 3B][deguisee] correspondance par CONTENU identique (date + exercices + series)',
     [(AP, REC, "    if((S.sessions||[]).some(s=>s&&s.date===draft.date&&JSON.stringify((s.exs||[]).map(e=>[e.name,(e.sets||[]).map(x=>[x.kg,x.reps,!!x.done])]))===JSON.stringify(draft.exs.map(e=>[e.name,(e.sets||[]).map(x=>[x.kg,x.reps,!!x.done])])))){localStorage.removeItem('ft4_wkt_draft');return;}\n")], 'GARDE'),
    ('B04 [LOT 3B][deguisee] borne basse retiree : une seance finie AVANT le debut du brouillon peut etre « lui »',
     [(AP, LIEN_BORNE, "    return ecart<1000+_BROUILLON_MARGE_MS;\n")], 'GARDE'),
    ('B05 [LOT 3B][deguisee] la pause en cours est ignoree (horloge jamais figee)', [(AP, LIEN_FIGEE, '')], 'GARDE'),
    ('B06 [LOT 3B][deguisee] le temps de pause cumule est ignore',
     [(AP, LIEN_PAUSE, "  const pause=0, figee=+(draft.pausedAt||0)||0;\n")], 'GARDE'),
    ('[negatif 3B] commentaire citant S.sessions[0] et les champs du contenu dans _recoverDraft',
     [(AP, REC, "    // const lastSess=S.sessions&&S.sessions[0]; lastSess.exs.length progLabel .sets .name\n" + REC)], 'OK'),
    ('[negatif] commentaire citant tous les motifs cherches',
     [(LO, ANNULE, ANNULE + "    // S.sessions.shift(); S.sessions[0].synced=true; S.sessions.sort( sessions.length>S.sessions.length .slice(-1)[0]\n")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_lot3.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:120] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_lot3_')
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
        print('  %s  %-96s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
