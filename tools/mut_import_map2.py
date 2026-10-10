#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-MAP-02 (session-B, 10/10/2026) : les temoins B-IMAP2 savent-ils ROUGIR ?

Le lot ne touche qu'un proprietaire, `_materielDe` (log.js), plus une donnee du catalogue (le nom anglais de
Fentes). Les mutations sont celles de la conception (§N.G) : M1 → M7 et les deguisees, plus celles des oracles
01 / 01B que ce lot a adaptes (la grille 01 apprend le role de la barre ; le cliquet 01B suit la decision P.1).
[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60). Une mutation qui casse la
SYNTAXE est refusee (un plantage n'est pas une preuve). M00 = le log.js d'AVANT le lot (790932a3).
Usage : python3 tools/mut_import_map2.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG = 'log.js'
BASE_AVANT = '790932a3'     # avant IMPORT-MAP-02
BANCS = ['tools/banc_import_map2.js', 'tools/banc_import_map.js', 'tools/banc_import_map_alias.js']

CABLE = ("  const cable=!/ (elastique|elastiques|band|bands|bande|bandes|resistance) /.test(s)&&(/ (pushdown|pulldown)s? /.test(s)"
         "||(/ (corde|rope)s? /.test(s)&&!/ (sauter|sauts?|jump|battle|ondulatoires?|climb|grimper|montee) /.test(s)));\n")
BARRE = "  if(/ (barre|barbell|ez) /.test(s)) return (cable||(/ tirage /.test(s)&&/ (verticale?|poitrine|nuque) /.test(s)))?'poulie':'barre';\n"
EN = "  return en?_materielDe(en,true):null;\n"
ECRIT = "  if(ecritSeulement) return null;\n"
EQ = "  if(eq&&eq!=='autre') return eq;\n"
DEBUT = "function _materielDe(nom, ecritSeulement){\n  const s=' '+_normEx(nom)+' ';\n"
FENTES = "  'Fentes':'lunge',"
KICK = "  'Extension Fessiers Arrière (Kickback)':'glute kickback cable',"
# oracles 01 / 01B (donnees d'alias)
ABDUC = "'cable hip abduction':"
FENH = "'fentes halteres':'Fentes'"

MUT = [
    ('M00 le code d\'AVANT (log.js de 790932a3)', 'AVANT', 'GARDE'),
    # ── conception §N.G ──
    ('M1 regle « poignee » retiree (la barre est toujours une charge)',
     [(BARRE, "  if(/ (barre|barbell|ez) /.test(s)) return cable?'poulie':'barre';\n")], 'GARDE'),
    ('M1b regle « poignee » retiree MEME en contexte de poulie ecrit (pushdown barre lu barre libre)',
     [(BARRE, "  if(/ (barre|barbell|ez) /.test(s)) return (/ tirage /.test(s)&&/ (verticale?|poitrine|nuque) /.test(s))?'poulie':'barre';\n")], 'GARDE'),
    ('M2 lecture du nom anglais retiree (cible Polyvalent de nouveau aveugle)', [(EN, "  return null;\n")], 'GARDE'),
    ('M3a barre lue comme poignee PARTOUT', [(BARRE, "  if(/ (barre|barbell|ez) /.test(s)) return 'poulie';\n")], 'GARDE'),
    ('M3b « bar » anglais lu comme barre', [(BARRE, BARRE.replace("(barre|barbell|ez)", "(barre|barbell|ez|bar)"))], 'GARDE'),
    ('M4 corde / rope non reconnus',
     [(CABLE, "  const cable=!/ (elastique|elastiques|band|bands|bande|bandes|resistance) /.test(s)&&/ (pushdown|pulldown)s? /.test(s);\n")], 'GARDE'),
    ('M5 pushdown non reconnu', [(CABLE, CABLE.replace("/ (pushdown|pulldown)s? /", "/ (pulldown)s? /"))], 'GARDE'),
    ('M6 EZ ignore', [(BARRE, BARRE.replace("(barre|barbell|ez)", "(barre|barbell)"))], 'GARDE'),
    ('M6b EZ lue comme poignee hors cable (symetrique : se protege chez le proprietaire, X10)',
     [(BARRE, "  if(/ ez /.test(s)) return 'poulie';\n" + BARRE)], 'GARDE'),
    ('M7 cible Polyvalent sans materiel visible (nom anglais du kickback poulie sans « cable »)',
     [(KICK, "  'Extension Fessiers Arrière (Kickback)':'glute kickback',")], 'GARDE'),
    # ── deguisees (conception §N.G) ──
    ('D1 [deguisee] exclusion elastique retiree (« Band pushdown » lu poulie)',
     [(CABLE, CABLE.replace("!/ (elastique|elastiques|band|bands|bande|bandes|resistance) /.test(s)&&", ""))], 'GARDE'),
    ('D2 [deguisee] nom anglais lu aussi dans la lecture ECRITE (D-053)',
     [(ECRIT, "  if(ecritSeulement){ const e=(typeof EX_EN!=='undefined'&&EX_EN[nom])||''; return (e&&e!==nom)?_materielDe(e,true):null; }\n")], 'GARDE'),
    ('D3 [deguisee] `_exEquip` applique au nom anglais (« hammer » = Hammer Strength)',
     [(EN, "  if(en){ const r=_materielDe(en,true); if(r) return r; const f=_exEquip(en); return (f&&f!=='autre')?f:null; } return null;\n")], 'GARDE'),
    ('D4 [deguisee] ordre T1 : le nom anglais AVANT `_exEquip` (decision P.2 prise en silence)',
     [(ECRIT, ECRIT + "  { const e=(typeof EX_EN!=='undefined'&&EX_EN[nom])||''; const r=e?_materielDe(e,true):null; if(r) return r; }\n")], 'GARDE'),
    ('D5 [deguisee] exclusion cardio de la corde retiree (protegee chez le proprietaire, X2)',
     [(CABLE, CABLE.replace("&&!/ (sauter|sauts?|jump|battle|ondulatoires?|climb|grimper|montee) /.test(s)", ""))], 'GARDE'),
    ('D6 [deguisee] Fentes redevient « lunge barbell » (decision P.1 de Michel contredite)',
     [(FENTES, "  'Fentes':'lunge barbell',")], 'GARDE'),
    ('D7 [deguisee] « tirage horizontal » devient un contexte de poulie (P.4 tranchee en silence)',
     [(BARRE, BARRE.replace("(verticale?|poitrine|nuque)", "(verticale?|poitrine|nuque|horizontale?)"))], 'GARDE'),
    ('D8 [deguisee] « tirage menton » devient un contexte de poulie (P.2 tranchee en silence)',
     [(BARRE, BARRE.replace("(verticale?|poitrine|nuque)", "(verticale?|poitrine|nuque|menton)"))], 'GARDE'),
    ('D9 [deguisee] regle moteur « lat machine » = poulie (l\'alias en est proprietaire)',
     [(DEBUT, DEBUT + "  if(/ lat machine /.test(s)) return 'poulie';\n")], 'GARDE'),
    ('D10 [deguisee] `_exEquip` « Polyvalent » rendu tel quel (la cible n\'atteint jamais le nom anglais)',
     [(EQ, "  if(eq) return eq==='autre'?null:eq;\n")], 'GARDE'),
    # ── oracles 01 / 01B adaptes par ce lot (doivent toujours mordre) ──
    ('O1 [oracle 01B S3b] la dette moteur perd une cle en silence (alias « cable hip abduction » retire)',
     [(ABDUC, "'cable hip abduction_':")], 'GARDE'),
    ('O2 [oracle 01B S5] « fentes halteres » detourne vers une variante (Fentes Kettlebell)', [(FENH, "'fentes halteres':'Fentes Kettlebell'")], 'GARDE'),
    # ── temoins de controle : doivent rester VERTS ──
    ('M10 (temoin de controle) un COMMENTAIRE modifie : les bancs doivent rester VERTS',
     [("/* IMPORT-MAP-02 : la poulie écrite SANS le mot", "/* IMPORT-MAP-02 : la poulie écrite SANS le mot lui-même")], 'OK'),
    ('M10b (temoin de controle) un nom anglais SANS materiel reformule (« lunge » → « lunges ») : verts',
     [(FENTES, "  'Fentes':'lunges',")], 'OK'),
]


def banc(arbre):
    rouges = []
    for b in BANCS:
        r = subprocess.run(['node', b], cwd=arbre, capture_output=True, text=True, timeout=1800, env=dict(os.environ, TZ='Europe/Paris'))
        out = r.stdout + r.stderr
        rg = [os.path.basename(b)[5:-3] + ' · ' + l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
        if r.returncode not in (0, 1) and not rg:
            rg = ['%s · PLANTAGE (code %d)' % (b, r.returncode)]
        rouges += rg
    return rouges


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin],
                       capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_imap2_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = subprocess.run(['git', 'show', BASE_AVANT + ':' + LOG], cwd=SRC, capture_output=True, text=True).stdout
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge — point de depart valide\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        cible = os.path.join(arbre, LOG); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = avant
        else:
            invalide = ['%s (x%d)' % (av[:50], src.count(av)) for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            if any(av == ap for av, ap in remplacements):
                print('  INVALIDE  %s (remplacement identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(cible):
            print('  INVALIDE  %s (syntaxe cassée par la mutation)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        conformes += ok
        print('  %s  %-96s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom[:96], obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
