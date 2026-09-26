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
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = 'tools/banc_milo_pdf1.js'
WK, CO, LG = 'worker.js', 'coach.js', 'log.js'

COND = "  const ancre = (body.suite === true && texte && stop === 'max_tokens') ? _ancreSuite(texte) : '';"

MUT = [
    # ══ 1. LE SIGNAL / FAIL-CLOSED ═══════════════════════════════════════════════════
    ('M01  stop_reason JETE (le defaut d origine)', WK,
     "    const stopReason = (data && typeof data.stop_reason === 'string' && data.stop_reason) ? data.stop_reason : null;",
     "    const stopReason = null;", 'GARDE'),
    ('M02  une reponse coupee (max_tokens) est dite « complete »', WK,
     "complete: !!texte && stop === 'end_turn', continued };",
     "complete: !!texte, continued };", 'GARDE'),
    ('M02b [PDF1B] stop_sequence redevient « complete »', WK,
     "complete: !!texte && stop === 'end_turn', continued };",
     "complete: !!texte && (stop === 'end_turn' || stop === 'stop_sequence'), continued };", 'GARDE'),
    ('M02c [PDF1B] toute raison connue sauf max_tokens est « complete »', WK,
     "complete: !!texte && stop === 'end_turn', continued };",
     "complete: !!texte && stop !== 'max_tokens', continued };", 'GARDE'),
    ('M03  la coupure est DEVINEE depuis la ponctuation', WK,
     "truncated: stop === 'max_tokens',",
     "truncated: stop === 'max_tokens' || !/[.!?]\\s*$/.test(texte || ''),", 'GARDE'),
    ('M04  le client ne lit plus le signal (owner) : jamais « coupee »', CO,
     "  if (d.truncated === true) return 'coupee';\n", "", 'GARDE'),
    ('M04b [PDF1B] un serveur sans signal redevient « on ne prétend rien » (pas de marqueur)', CO,
     "  if (d.complete === true) return 'complete';\n  return 'non_confirmee';",
     "  if (d.complete === true) return 'complete';\n  if (!('complete' in d)) return 'complete';\n  return 'non_confirmee';", 'GARDE'),
    ('M04c [PDF1B] raison inconnue traitee comme complete cote app', CO,
     "  if (d.complete === true) return 'complete';\n  return 'non_confirmee';",
     "  return 'complete';", 'GARDE'),

    # ══ 2. LA SUITE ═══════════════════════════════════════════════════════════════════
    ('M05  la suite BOUCLE (jusqu a 3 appels)', WK,
     "  if (ancre) {\n    const s = await callClaudeDiag(",
     "  for (let _i = 0; _i < 2 && ancre && stop === 'max_tokens'; _i++) {\n    const s = await callClaudeDiag(", 'GARDE'),
    ('M06  la suite part SANS signal max_tokens (chat court a 2 appels)', WK,
     COND, "  const ancre = texte ? _ancreSuite(texte) : '';", 'GARDE'),
    ('M07  une suite RATEE rend la 1re partie « complete »', WK,
     "    if (r.ok) { texte = r.texte; stop = r.stop; continued = true; }",
     "    if (r.ok) { texte = r.texte; stop = r.stop; continued = true; } else { stop = 'end_turn'; }", 'GARDE'),
    ('M08  le chat demande la suite (2e appel payant au quotidien)', CO,
     "        coachMemory: S.coachMemory||''\n      };",
     "        coachMemory: S.coachMemory||'', suite: true\n      };", 'GARDE'),
    ('M09  l analyse ne demande plus la suite', LG,
     "history:[],suite:true})", "history:[]})", 'GARDE'),
    ('M13  le budget monte en douce : 1024 -> 4096', WK,
     "  const d = await callClaudeDiag(apiKey, { model, max_tokens: 1024, system, messages }, meta);",
     "  const d = await callClaudeDiag(apiKey, { model, max_tokens: 4096, system, messages }, meta);", 'GARDE'),

    # ══ 2b. LE RACCORD (PDF1B) ═════════════════════════════════════════════════════════
    ('R01  ancre FAUSSE acceptee (plus de verification)', WK,
     "  if (!corps.startsWith(ancre)) return non(corps.indexOf(ancre) >= 0 ? 'ancre_fausse' : 'ancre_absente');\n  const suite = corps.slice(ancre.length);",
     "  const suite = corps.startsWith(ancre) ? corps.slice(ancre.length) : corps;", 'GARDE'),
    ('R02  ancre ABSENTE acceptee (on recolle quand meme)', WK,
     "  if (!corps.startsWith(ancre)) return non(corps.indexOf(ancre) >= 0 ? 'ancre_fausse' : 'ancre_absente');",
     "  if (!corps.startsWith(ancre) && corps.indexOf(ancre) >= 0) return non('ancre_fausse');", 'GARDE'),
    ('R03  comparaison approximative (casse ignoree)', WK,
     "  if (!corps.startsWith(ancre)) return non(",
     "  if (!corps.toLowerCase().startsWith(ancre.toLowerCase())) return non(", 'GARDE'),
    ('R04  suppression arbitraire d un fragment (le dernier mot de la 1re partie)', WK,
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite,",
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '').replace(/\\S+$/, '') + suite,", 'GARDE'),
    ('R05  fusion de deux mots (les blancs de tete de la suite retires)', WK,
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite,",
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite.replace(/^\\s+/, ''),", 'GARDE'),
    ('R06  perte d un mot (l ancienne heuristique « mot repete retire »)', WK,
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite,",
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '').replace(/(\\S+)$/, (w) => suite.trim().startsWith(w) ? '' : w) + suite,", 'GARDE'),
    ('R07  redemarrage laisse passer', WK,
     "  if (premiere.length >= 12 && suite.indexOf(premiere) >= 0) return non('redemarrage');", "", 'GARDE'),
    ('R08b suite max_tokens : stop force a end_turn', WK,
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite, stop: stop2 || null,",
     "  return { ok: true, texte: String(p1).replace(/\\s+$/, '') + suite, stop: 'end_turn',", 'GARDE'),
    ('R09  fermeture absente toleree sans coupure', WK,
     "    if (stop2 !== 'max_tokens') return non('structure');", "", 'GARDE'),
    ('R10  texte AVANT l enveloppe tolere', WK,
     "  if (i < 0 || b.slice(0, i).trim() !== '') return non('structure');",
     "  if (i < 0) return non('structure');", 'GARDE'),
    ('R11  texte APRES l enveloppe tolere', WK,
     "    if (corps.slice(j + _SUITE_FERM.length).trim() !== '') return non('structure');\n", "", 'GARDE'),
    ('R12  erreur de la suite : la 1re partie est dite complete', WK,
     "  if (!brut) return non('echec');",
     "  if (!brut) return { ok: true, texte: String(p1), stop: 'end_turn', raison: 'ok' };", 'GARDE'),
    ('R13  ancre coupee au milieu d un emoji (unites UTF-16)', WK,
     "  return Array.from(t).slice(-60).join('')",
     "  return t.slice(-60)", 'GARDE'),

    # ══ 3. LES SORTIES MACHINE ════════════════════════════════════════════════════════
    ('M14  un JSON coupe est « repare » et accepte', WK,
     "  try { return JSON.parse(m[0]); } catch (e) { return null; }",
     "  try { return JSON.parse(m[0]); } catch (e) { return {}; }", 'GARDE'),

    # ══ 4. CE QUE LA PERSONNE VOIT ════════════════════════════════════════════════════
    ('M15  le chat ignore l etat (aucun marqueur)', CO,
     "      { const _et = _miloEtatReponse(data); if (_et !== 'complete') _coupee = (_et === 'coupee') ? 'reponse' : 'non_confirmee'; }", "", 'GARDE'),
    ('M15b [PDF1B] le chat ne marque que la coupure, pas le « non confirme »', CO,
     "if (_et !== 'complete') _coupee = (_et === 'coupee') ? 'reponse' : 'non_confirmee'; }",
     "if (_et === 'coupee') _coupee = 'reponse'; }", 'GARDE'),
    ('M16  l analyse ignore l etat (aucun bandeau)', LG,
     "_lastProgAnalysisCoupee=(_et==='complete')?'':(_et==='coupee'?'analyse':'non_confirmee'); }",
     "_lastProgAnalysisCoupee=''; }", 'GARDE'),
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
     "function _coupeeValide(v){ return (v === 'analyse' || v === 'reponse' || v === 'non_confirmee') ? v : ''; }",
     "function _coupeeValide(v){ return v ? String(v) : ''; }", 'GARDE'),
    ('M24  [PDF1B] marqueur remis APRES le texte (masque par un titre « Analyse complete »)', CO,
     "      div.insertBefore(cp, div.firstChild);", "      div.appendChild(cp);", 'GARDE'),
    ('M25  [PDF1B] marqueur « non confirme » masque', CO,
     "  if (_coupee) {\n      div.dataset.coupee = _coupee;",
     "  if (_coupee && _coupee !== 'non_confirmee') {\n      div.dataset.coupee = _coupee;", 'GARDE'),

    # ══ 5. BOUTON SEANCE (decision Michel) ═════════════════════════════════════════════
    ('S01  [PDF1B] seance construite depuis une reponse coupee (chat)', CO,
     "    if (!_fp && !_coupee) {", "    if (!_fp) {", 'GARDE'),
    ('S02  [PDF1B] question « on demarre ? » sous une reponse coupee', CO,
     "    const _dsDemande = !_fp && !_coupee && !opts.silent", "    const _dsDemande = !_fp && !opts.silent", 'GARDE'),
    ('S03  [PDF1B] bouton seance rendu au rechargement d une reponse coupee', CO,
     "      if(typeof _coupeeValide==='function' && _coupeeValide(m.coupee)) break;\n", "", 'GARDE'),
    ('S04  [PDF1B] question rendue au rechargement d une reponse coupee', CO,
     "dernAssist=(typeof _coupeeValide==='function'&&_coupeeValide(m.coupee))?null:m.content;tsA=m.ts;if(!dernAssist)break;}",
     "dernAssist=m.content;tsA=m.ts;}", 'GARDE'),

    # ══ 6. PUBLICATION : D-027 (programme) · D-028 (prochaine seance) ════════════════════
    ('D01  [D-028] l annonce est de nouveau ecrite sous une reponse incomplete (le defaut mesure)', CO,
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);",
     "    const _plan = _extractPlannedSession(reply);", 'GARDE'),
    ('D02  [D-028] seule la coupure de longueur bloque (refus / ancien serveur ecrivent)', CO,
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);",
     "    const _plan = _coupee === 'reponse' ? null : _extractPlannedSession(reply);", 'GARDE'),
    ('D03  [D-028] deguisee : garde intacte, 2e lecture qui ecrit quand meme', CO,
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);",
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);\n"
     "    if (_coupee) { const _p2 = _extractPlannedSession(reply); if (_p2) { S.nextPlanned = _p2; persist(); } }", 'GARDE'),
    ('D04  [D-028] une reponse incomplete EFFACE l annonce deja enregistree', CO,
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);",
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);\n    if (_coupee) { S.nextPlanned = null; persist(); }", 'GARDE'),
    ('D05  [D-027] JSON coupe REPARE par pile au parse', CO,
     "    const prog=JSON.parse(jsonStr.trim());",
     "    let _js=jsonStr.trim(),prog;try{prog=JSON.parse(_js);}catch(e0){const st=[];for(const ch of _js){if(ch==='{'||ch==='[')st.push(ch);else if(ch==='}'||ch===']')st.pop();}"
     "prog=JSON.parse(_js+st.reverse().map(c=>c==='{'?'}':']').join(''));}", 'GARDE'),
    ('D06  [D-027] deguisee : parse strict intact, JSON repare AVANT', CO,
     "    if(!jsonStr)return null;\n    const prog=JSON.parse(jsonStr.trim());",
     "    if(!jsonStr)return null;\n    try{JSON.parse(jsonStr.trim());}catch(e0){const st=[];for(const ch of jsonStr){if(ch==='{'||ch==='[')st.push(ch);else if(ch==='}'||ch===']')st.pop();}"
     "jsonStr=jsonStr+st.reverse().map(c=>c==='{'?'}':']').join('');}\n    const prog=JSON.parse(jsonStr.trim());", 'GARDE'),
    ('D07  [D-027] schema vide accepte (garde du bouton retiree)', CO,
     "  if((!norm.days||!norm.days.length)&&(!norm.exs||!norm.exs.length))return;\n", "", 'GARDE'),
    ('D08  [D-027] programme enregistre AVANT le clic', CO,
     "  const idx=_pendingForceProgs.push(norm)-1;",
     "  const idx=_pendingForceProgs.push(norm)-1;\n  S.programmes=(S.programmes||[]).concat([norm]);persist();", 'GARDE'),
    ('D09  [D-027] sens inverse : bouton retire sous toute reponse incomplete (decision non respectee)', CO,
     "      const ext = _extractForceProgram(reply);",
     "      const ext = _coupee ? null : _extractForceProgram(reply);", 'GARDE'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS ══════════════════════════════════════
    ('[negatif] commentaire D-028 : S.nextPlanned = _plan, _extractPlannedSession(reply), JSON.parse(, repeat(', CO,
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);",
     "    // jamais S.nextPlanned = _plan sous _coupee ; _extractPlannedSession(reply) lu une fois ; ni repeat( ni jsonrepair ni JSON.parse(\n"
     "    const _plan = _coupee ? null : _extractPlannedSession(reply);", 'OK'),
    ('[negatif] commentaire Worker : stop_reason, max_tokens: 4096, while (, for (, stop_sequence, toLowerCase', WK,
     COND,
     "  /* rappel : jamais while (stop === 'max_tokens') ni for (;;) ; body.suite === true seulement ;\n"
     "     max_tokens: 4096 interdit ; stop_sequence n'est pas une fin ; jamais toLowerCase() sur l'ancre */\n" + COND, 'OK'),
    ('[negatif] commentaire chat : suite: true, d.truncated === true, _miloEtatReponse(, appendChild(cp)', CO,
     "        coachMemory: S.coachMemory||''\n      };",
     "        coachMemory: S.coachMemory||''\n        // jamais suite: true ici ; d.truncated === true se lit dans _miloEtatReponse(data) ; pas de div.appendChild(cp)\n      };",
     'OK'),
    ('[negatif] commentaire analyse : history:[] sans suite', LG,
     "  _lastProgAnalysisCoupee='';\n  try{",
     "  _lastProgAnalysisCoupee='';\n  // l'ancien appel etait {action:'coach',history:[]} sans suite:false\n  try{", 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=900,
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
    # Filtre facultatif : `python3 tools/mut_milo_pdf1.py D [negatif]` ne joue que les mutations dont le nom
    # commence par un des prefixes (le point de depart sain est TOUJOURS mesure). Sans argument : toutes.
    pref = tuple(sys.argv[1:])
    liste = [m for m in MUT if not pref or m[0].startswith(pref) or any(p in m[0] for p in pref if p.startswith('['))]
    conformes = 0
    for nom, fic, avant, apres, attendu in liste:
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
        comp = [l for l in rouges if 'B-CCCLXXVIII' not in l and 'B-CCCLXXXI ' not in l and 'B-CCCLXXXIV' not in l]   # rouges de COMPORTEMENT (Worker conduit / ecran) — les trois blocs de SOURCE exclus
        print('  %s  %-72s %-6s %2d rouge(s) dont %2d de comportement  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(comp), (rouges[0] if rouges else '')))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(liste)))
    return 0 if conformes == len(liste) else 1


if __name__ == '__main__':
    raise SystemExit(main())
