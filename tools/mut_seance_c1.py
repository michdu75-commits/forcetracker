#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-02 / C1 : les temoins B-CCCLXXXVII / B-CCCLXXXVIII savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. M01 remet le code d'AVANT mot pour mot.
Usage : python3 tools/mut_seance_c1.py [PREFIXE]
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'coach.js'
RE_NEUF = r"""    const RE=/^\s*(?:[-•*–]|\d+[.)])?\s*(.{3,60}?)\s*([:—–-])?\s*(\d{1,2})\s*(?:[x×*]|\s+s[ée]ries?\s+de\s+)\s*(\d{1,3})\s*(?:reps?)?\s*(?:(?:@|à)?\s*(\d{1,3}(?:[.,]\d)?)\s*kg)?(?:\s*(?:[,;(—–]|-\s)(.*))?\s*$/i;"""
RE_AVANT = r"""    const RE=/^\s*(?:[-•*–]|\d+[.)])?\s*(.{3,60}?)\s*[:—–-]?\s*(\d{1,2})\s*(?:[x×*]|\s+s[ée]ries?\s+de\s+)\s*(\d{1,3})\s*(?:reps?)?\s*(?:@?\s*(\d{1,3}(?:[.,]\d)?)\s*kg)?\s*$/i;"""
BOUCLE_NEUVE = """      const t=l.replace(/\\*\\*/g,'').trim(); if(!t||t.length>200)return;
      let brut, nb, reps, kg;
      const m=t.match(RE);
      if(m){
        const suite=m[6];
        if(suite!==undefined){
          if(!m[2] && !/[:—–-]\\s*$/.test(m[1])) return;            // pas de séparateur explicite
          if(SERIES.test(suite)) return;                           // d'autres séries dans la suite
          if(!m[5] && /\\d\\s*kg\\b/i.test(suite)) return;            // une charge écrite mais pas lue
        }else if(t.length>90) return;
        brut=m[1].replace(/[:–—-]+$/,'').trim();
        nb=+m[3]; reps=+m[4]; kg=m[5]?parseFloat(String(m[5]).replace(',','.')):0;
      }else{
        if(t.length>90)return;                    // borne d'avant, inchangée pour les séries seules
        const m2=t.match(RE_SEULE); if(!m2)return;"""
BOUCLE_AVANT = """      const t=l.replace(/\\*\\*/g,'').trim(); if(!t||t.length>90)return;
      let brut, nb, reps, kg;
      const m=t.match(RE);
      if(m){
        brut=m[1].replace(/[:–—-]+$/,'').trim();
        nb=+m[2]; reps=+m[3]; kg=m[4]?parseFloat(String(m[4]).replace(',','.')):0;
      }else{
        const m2=t.match(RE_SEULE); if(!m2)return;"""
SEP = "          if(!m[2] && !/[:—–-]\\s*$/.test(m[1])) return;            // pas de séparateur explicite\n"
SER = "          if(SERIES.test(suite)) return;                           // d'autres séries dans la suite\n"
KG = "          if(!m[5] && /\\d\\s*kg\\b/i.test(suite)) return;            // une charge écrite mais pas lue\n"

# (nom, [(avant, apres), ...], attendu)
MUT = [
    ('M01 code d\'AVANT remis mot pour mot', [(RE_NEUF, RE_AVANT), (BOUCLE_NEUVE, BOUCLE_AVANT)], 'GARDE'),
    ('M02 garde du separateur explicite retiree', [(SEP, '')], 'GARDE'),
    ('M03 garde « autres series dans la suite » retiree', [(SER, '')], 'GARDE'),
    ('M04 garde « charge ecrite mais pas lue » retiree', [(KG, '')], 'GARDE'),
    ('M05 borne de 90 remise pour toutes les lignes', [("if(!t||t.length>200)return;", "if(!t||t.length>90)return;")], 'GARDE'),
    ('M06 « a » refuse devant la charge', [("(?:(?:@|à)?\\s*(\\d{1,3}", "(?:@?\\s*(\\d{1,3}")], 'GARDE'),
    ('M07 plus de suite apres la charge (ancre en fin de ligne)', [("kg)?(?:\\s*(?:[,;(—–]|-\\s)(.*))?\\s*$/i;", "kg)?()?\\s*$/i;")], 'GARDE'),
    ('M08 [deguisee] garde de la charge sur le MAUVAIS groupe (m[4] = reps, toujours vrai)', [("if(!m[5] && /\\d\\s*kg", "if(!m[4] && /\\d\\s*kg")], 'GARDE'),
    ('M09 [deguisee] separateur « deduit » de la simple presence d\'une suite', [("if(!m[2] && !/[:—–-]\\s*$/.test(m[1])) return;", "if(!m[2] && !/[:—–-]\\s*$/.test(m[1]) && !suite) return;")], 'GARDE'),
    ('M10 [deguisee] borne de 90 retiree pour les series seules', [("        if(t.length>90)return;                    // borne d'avant", "        // borne d'avant")], 'GARDE'),
    ('M11 [deguisee] rapprochement « a peu pres » des noms', [("if(!r.match||r.via!=='exact'){", "if(!r.match){")], 'GARDE'),
    ('M12 [deguisee] grammaire elargie : virgule acceptee devant la charge', [("(?:(?:@|à)?\\s*(\\d{1,3}", "(?:(?:@|à|,)?\\s*(\\d{1,3}")], 'GARDE'),
    ('[negatif] commentaire citant tous les mots cherches', [("    const RE_SEULE=", "    // SERIES.test(suite) return; t.length>90 via!=='exact' nb>=1&&nb<=12 exs.length<2)return null\n    const RE_SEULE=")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_seance_c1.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_c1_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtre = sys.argv[1] if len(sys.argv) > 1 else ''
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtre and not nom.startswith(filtre):
            continue
        total += 1
        tmp, arbre = cloner()
        cible = os.path.join(arbre, CO); src = open(cible, encoding='utf-8').read()
        invalide = [av[:40] for av, _ in remplacements if src.count(av) != 1]
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for av, ap in remplacements:
            src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-86s %-6s %d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
