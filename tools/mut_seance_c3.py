#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-C3 : les temoins B-CCCXCI / B-CCCXCII savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet coach.js tel qu'il etait AVANT C3 (commit 150df13d, ft-v1237), mot pour mot.
Usage : python3 tools/mut_seance_c3.py [PREFIXE]
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'coach.js'
AVANT_C3 = '150df13d3541dee98c23183cc05c6b74989366dd'

LIGHT = "    ...(m.role==='assistant' && m.seance && typeof m.seance==='object'?{seance:m.seance}:{})\n"
RECOPIE = ",...(m.seance?{seance:m.seance}:{})}));"
LECTURE = ("      if(m.seance&&typeof _appendStartSessionBtn==='function'){\n"
           "        let relue=false;\n"
           "        try{ relue=!!_appendStartSessionBtn(m.seance, bulle); }catch(e){ relue=false; }\n"
           "        if(relue){ pose=true; _remplacer(m); continue; }\n"
           "      }\n")
COUPEE = "      if(typeof _coupeeValide==='function' && _coupeeValide(m.coupee)) break;\n"
PAYLOAD = "    .map(m => ({ role: m.role, content: m.content }));"
GARDE_COUPEE = "    if(typeof _coupeeValide==='function'&&_coupeeValide(msg.coupee))return;\n"
COPIE = "    msg.seance=JSON.parse(JSON.stringify(norm));"
THEN = "_appendStartSessionBtn(_montee(s), _bulle, _msgA)"
TAP = "    _pendingSeanceMsgs[idx]=msg||null;\n"
QUESTION_RELOAD = "_appendSeanceQuestion(dernAssist, bq, dernMsg);"

MUT = [
    ('M00 code d\'AVANT C3 remis mot pour mot (coach.js de 150df13d)', 'AVANT', 'GARDE'),
    ('M01 `_lightMsg` supprime `seance` (enregistrement)', [(LIGHT, '')], 'GARDE'),
    ('M02 `loadCoachConv` ne recopie plus `seance` (Mes discussions)', [(RECOPIE, '}));')], 'GARDE'),
    ('M03 `_renderCoachThread` ignore `seance`, toujours le texte', [(LECTURE, '')], 'GARDE'),
    ('M04 le texte PRIME : `seance` seulement si le texte ne lit rien',
     [("      if(m.seance&&typeof _appendStartSessionBtn==='function'){\n",
       "      if(m.seance&&!_extractDaySession(String(m.content||''))&&typeof _appendStartSessionBtn==='function'){\n")], 'GARDE'),
    ('M05 `seance` part chez Milo (`_coachHistPayload`)',
     [(PAYLOAD, "    .map(m => ({ role: m.role, content: m.content, ...(m.seance?{seance:m.seance}:{}) }));")], 'GARDE'),
    ('M06 une reponse coupee avec `seance` redevient demarrable (lecture AVANT la garde coupee)',
     [(LECTURE, ''), (COUPEE, LECTURE + COUPEE)], 'GARDE'),
    ('M06b `_attacherSeance` n\'ecarte plus les reponses coupees (temoin de source : chemin inatteignable en prod)',
     [(GARDE_COUPEE, '')], 'GARDE'),
    ('M07 [deguisee] la seance est gardee AVANT la montee en charge (etape trop tot)',
     [(THEN, "(_attacherSeance(_msgA, _normalizeMiloSession(s)), _appendStartSessionBtn(_montee(s), _bulle))")], 'GARDE'),
    ('M08 le repos est perdu a l\'enregistrement', [(COPIE, "    msg.seance=JSON.parse(JSON.stringify(norm,(k,v)=>k==='rest'?0:v));")], 'GARDE'),
    ('M09 la consigne est perdue a l\'enregistrement', [(COPIE, "    msg.seance=JSON.parse(JSON.stringify(norm,(k,v)=>k==='note'?'':v));")], 'GARDE'),
    ('M10 un ancien message sans `seance` fait planter la relecture',
     [("      if(m.seance&&typeof _appendStartSessionBtn==='function'){\n", "      if(m.seance.exs&&typeof _appendStartSessionBtn==='function'){\n")], 'GARDE'),
    ('M11 [deguisee] rattache au DERNIER message assistant du fil, pas au message designe',
     [(COPIE, "    { const c=(coachHistory||[]).filter(x=>x&&x.role==='assistant').pop(); if(c) msg=c; }\n" + COPIE)], 'GARDE'),
    ('M12 la seance lue au tap n\'est plus rattachee (question a l\'arrivee)', [(TAP, "    _pendingSeanceMsgs[idx]=null;\n")], 'GARDE'),
    ('M13 la question du rechargement ne transmet plus son message', [(QUESTION_RELOAD, "_appendSeanceQuestion(dernAssist, bq, null);")], 'GARDE'),
    ('M14 la traduction tardive n\'est plus rattachee (seulement les voies immediates)',
     [(THEN, "_appendStartSessionBtn(_montee(s), _bulle)")], 'GARDE'),
    ('M15 [deguisee] la relecture reapplique `_montee` : sans effet sur une seance deja montee, mais TRANSFORME une seance gardee qui ne l\'est pas',
     [("        try{ relue=!!_appendStartSessionBtn(m.seance, bulle); }", "        try{ relue=!!_appendStartSessionBtn(_montee(m.seance), bulle); }")], 'GARDE'),
    ('[negatif] commentaire citant tous les mots cherches',
     [(LECTURE, "      // m.seance _attacherSeance _coupeeValide(msg.coupee) seance:m.seance role: m.role, content: m.content\n" + LECTURE)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_seance_c3.js'], cwd=arbre, capture_output=True, text=True, timeout=1200,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_c3_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [x for x in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if x]   # plusieurs prefixes : M02,M03,...
    avant = subprocess.run(['git', 'show', AVANT_C3 + ':' + CO], cwd=SRC, capture_output=True, text=True).stdout
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
        cible = os.path.join(arbre, CO); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = avant
        else:
            invalide = [av[:50] for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
