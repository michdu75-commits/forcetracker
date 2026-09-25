#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-PDF1 : les temoins (B-CCCLXXVIII / LXXIX / LXXX) peuvent-ils RÉELLEMENT rougir ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

Chaque mutation reintroduit un defaut que le chantier ferme :
  · le signal de coupure JETE, ou une coupure lue comme « complete » ;
  · une suite qui BOUCLE, ou qui part sur une reponse courte (chat a 2 appels) ;
  · une suite ratee qui rend la 1re partie « complete » ;
  · un JSON coupe « repare » et accepte ;
  · un PDF / un partage / un fil qui perdent le marqueur ;
  · une coupure DEVINEE depuis la ponctuation au lieu d'etre lue ;
  · le budget de la conversation monte en douce (1024 -> 4096).
⭐ TROIS mutations doivent rester VERTES : elles n'ajoutent que des COMMENTAIRES citant les mots
  que les temoins cherchent (stop_reason, max_tokens, suite: true, while, .truncated === true).
  C'est la seule facon de prouver qu'on mesure le CODE et non la phrase qui l'explique (R30).
⛔ Le point de depart est mesure d'abord : un controle negatif parti d'un arbre deja rouge ne
  prouve rien.

Usage : python3 tools/mut_milo_pdf1.py
"""
import os
import shutil
import subprocess
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = 'tools/banc_milo_pdf1.js'
WK, CO, LG = 'worker.js', 'coach.js', 'log.js'

MUT = [
    # ══ 1. LE SIGNAL ══════════════════════════════════════════════════════════════════
    ('M01  stop_reason JETE (le defaut d origine)', WK,
     "    const stopReason = (data && typeof data.stop_reason === 'string' && data.stop_reason) ? data.stop_reason : null;",
     "    const stopReason = null;", 'GARDE'),
    ('M02  une reponse coupee (max_tokens) est dite « complete »', WK,
     "complete: !!texte && (stop === 'end_turn' || stop === 'stop_sequence'), continued };",
     "complete: !!texte, continued };", 'GARDE'),
    ('M03  la coupure est DEVINEE depuis la ponctuation', WK,
     "truncated: stop === 'max_tokens',",
     "truncated: stop === 'max_tokens' || !/[.!?]\\s*$/.test(texte || ''),", 'GARDE'),
    ('M04  le client ne lit plus le signal (owner) : jamais « coupee »', CO,
     "  if (d.truncated === true) return 'coupee';\n", "", 'GARDE'),

    # ══ 2. LA SUITE ═══════════════════════════════════════════════════════════════════
    ('M05  la suite BOUCLE (jusqu a 3 appels)', WK,
     "  if (body.suite === true && texte && stop === 'max_tokens') {",
     "  for (let _i = 0; _i < 2 && body.suite === true && texte && stop === 'max_tokens'; _i++) {", 'GARDE'),
    ('M06  la suite part SANS signal max_tokens (chat court a 2 appels)', WK,
     "  if (body.suite === true && texte && stop === 'max_tokens') {",
     "  if (texte) {", 'GARDE'),
    ('M07  une suite RATEE rend la 1re partie « complete »', WK,
     "    if (s.text) { texte = _recollerSuite(texte, s.text); stop = s.stopReason; continued = true; }",
     "    if (s.text) { texte = _recollerSuite(texte, s.text); stop = s.stopReason; continued = true; } else { stop = 'end_turn'; }",
     'GARDE'),
    ('M08  le chat demande la suite (2e appel payant au quotidien)', CO,
     "        coachMemory: S.coachMemory||''\n      };",
     "        coachMemory: S.coachMemory||'', suite: true\n      };", 'GARDE'),
    ('M09  l analyse ne demande plus la suite', LG,
     "history:[],suite:true})", "history:[]})", 'GARDE'),
    ('M10  la couture ne retire plus la repetition', WK,
     "    if (a.endsWith(bt.slice(0, k))) return a + bt.slice(k);",
     "    if (false) return a + bt.slice(k);", 'GARDE'),
    ('M11  la couture ne gere plus le mot reecrit en entier', WK,
     "  if (mot && bt.startsWith(mot) && /^[\\p{L}\\p{N}]/u.test(bt.slice(mot.length))) return a.slice(0, -mot.length) + bt;",
     "", 'GARDE'),
    ('M12  la couture mange un mot nouveau (garde de l espace retiree)', WK,
     "  if (/^\\s/.test(b)) return a + b;", "", 'GARDE'),
    ('M13  le budget monte en douce : 1024 -> 4096', WK,
     "  const d = await callClaudeDiag(apiKey, { model, max_tokens: 1024, system, messages }, meta);",
     "  const d = await callClaudeDiag(apiKey, { model, max_tokens: 4096, system, messages }, meta);", 'GARDE'),

    # ══ 3. LES SORTIES MACHINE ════════════════════════════════════════════════════════
    ('M14  un JSON coupe est « repare » et accepte', WK,
     "  try { return JSON.parse(m[0]); } catch (e) { return null; }",
     "  try { return JSON.parse(m[0]); } catch (e) { return {}; }", 'GARDE'),

    # ══ 4. CE QUE LA PERSONNE VOIT ════════════════════════════════════════════════════
    ('M15  le chat ignore la coupure (aucun marqueur)', CO,
     "      if (data.reply && _miloEtatReponse(data) === 'coupee') _coupee = 'reponse';", "", 'GARDE'),
    ('M16  l analyse ignore la coupure (aucun bandeau)', LG,
     "_lastProgAnalysisCoupee=(data.reply&&typeof _miloEtatReponse==='function'&&_miloEtatReponse(data)==='coupee')?'analyse':'';",
     "_lastProgAnalysisCoupee='';", 'GARDE'),
    ('M17  « Continuer dans le Coach » perd le marqueur', LG,
     "      renderCoachMsg('coach',_lastProgAnalysisReply,{coupee:_lastProgAnalysisCoupee});",
     "      renderCoachMsg('coach',_lastProgAnalysisReply);", 'GARDE'),
    ('M18  le stockage perd le marqueur (_lightMsg)', CO,
     "    ...(m.role==='assistant' && typeof _coupeeValide==='function' && _coupeeValide(m.coupee)?{coupee:m.coupee}:{})",
     "    ...({})", 'GARDE'),
    ('M19  le fil recharge ne repose plus le marqueur', CO,
     "    else if(t) renderCoachMsg('coach', t, {coupee: m.coupee});",
     "    else if(t) renderCoachMsg('coach', t);", 'GARDE'),
    ('M20  le marqueur part a l API', CO,
     "    .map(m => ({ role: m.role, content: m.content }));",
     "    .map(m => ({ role: m.role, content: m.content, ...(m.coupee?{coupee:m.coupee}:{}) }));", 'GARDE'),
    ('M21  le PDF d une reponse coupee sort comme complet', CO,
     "    const _cp=_coupeeValide(bubble.dataset.coupee);", "    const _cp='';", 'GARDE'),
    ('M22  le partage d une reponse coupee ne le dit pas', CO,
     "  const _cp = _coupeeValide(bubble && bubble.dataset.coupee);", "  const _cp = '';", 'GARDE'),
    ('M23  liste blanche retiree : un marqueur abime est affiche', CO,
     "function _coupeeValide(v){ return (v === 'analyse' || v === 'reponse') ? v : ''; }",
     "function _coupeeValide(v){ return v ? String(v) : ''; }", 'GARDE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    ('[negatif] commentaire Worker : stop_reason, max_tokens: 4096, while (, for (, body.suite === true', WK,
     "  if (body.suite === true && texte && stop === 'max_tokens') {",
     "  /* rappel : jamais while (stop === 'max_tokens') ni for (;;) ; body.suite === true seulement ;\n"
     "     max_tokens: 4096 interdit ; data.stop_reason est lu plus haut */\n"
     "  if (body.suite === true && texte && stop === 'max_tokens') {", 'OK'),
    ('[negatif] commentaire chat : suite: true, d.truncated === true, _miloEtatReponse(', CO,
     "        coachMemory: S.coachMemory||''\n      };",
     "        coachMemory: S.coachMemory||''\n        // jamais suite: true ici ; d.truncated === true se lit dans _miloEtatReponse(data)\n      };",
     'OK'),
    ('[negatif] commentaire analyse : history:[] sans suite', LG,
     "  _lastProgAnalysisCoupee='';\n  try{",
     "  _lastProgAnalysisCoupee='';\n  // l'ancien appel etait {action:'coach',history:[]} sans suite:false\n  try{", 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=300,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return r.returncode == 0, (r.stdout + r.stderr)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_pdf1_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    vert, sortie = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if not vert:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :')
        print('\n'.join('     ' + l for l in sortie.strip().split('\n')[-6:]))
        return 1
    print('  arbre sain : banc entierement vert (point de depart valide)\n')
    conformes = 0
    for nom, fic, avant, apres, attendu in MUT:
        tmp, arbre = cloner()
        cible = os.path.join(arbre, fic)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-72s (ancre %s)' % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        vert, sortie = banc(arbre)
        obtenu = 'OK' if vert else 'GARDE'
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.strip()[:48] for l in sortie.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
        comp = [l for l in rouges if 'B-CCCLXXVIII' not in l]   # rouges de COMPORTEMENT (Worker conduit / ecran)
        print('  %s  %-72s %-6s %2d rouge(s) dont %2d de comportement  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(comp), (rouges[0] if rouges else '')))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    raise SystemExit(main())
