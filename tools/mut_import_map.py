#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-MAP-01 (session-B, 10/10/2026) : les temoins B-IMAP-A/H/G savent-ils ROUGIR ?

Les DEUX cotes sont proteges : pas assez strict (un faux rattachement revient) ET trop strict (un
rapprochement sur est perdu : DC Barre, Peck deck machine, Pendulum, alias declares).
[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60). Une mutation qui casse la
SYNTAXE est refusee (un plantage n'est pas une preuve). M00 = le log.js d'AVANT (master b280ea5d).
Usage : python3 tools/mut_import_map.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG = 'log.js'
BASE_AVANT = 'b280ea5d'

GUARD = "  const contredit=cible=>{ if(!matSrc)return false; const c=_materielDe(cible,false);\n"
COMPAT = "    if(!c||c===matSrc)return false; return !(c==='guide'&&/^(machine|poulie|smith)$/.test(matSrc)); };\n"
EQ = "  if(eq&&(_EX_EQUIV[q]||!contredit(eq))){ return {match:eq,score:.95,confidence:95,tier:'auto',via:'équivalence connue'}; }\n"
LOOP = "    if(contredit(ex.n)) continue;   // IMPORT-MAP-01 : un autre matériel n'est jamais candidat\n"
REGLE2 = "tier:(!matSrc&&_materielDe(best,true))?'confirm':'auto',via:'mots'};"
SRCMAT = "  const matSrc=_materielDe(name,true);\n"
POULIE = "  if(/ (poulie|cable|cables) /.test(s)) return 'poulie';\n"
DEBUT = "function _materielDe(nom, ecritSeulement){\n  const s=' '+_normEx(nom)+' ';\n"

MUT = [
    ('M00 le code d\'AVANT (log.js de master b280ea5d)', 'AVANT', 'GARDE'),
    ('M1 garde-fou materiel neutralise (la contradiction n\'est plus jamais vue)',
     [(GUARD, "  const contredit=cible=>{ return false; const c=_materielDe(cible,false);\n")], 'GARDE'),
    ('M1b garde-fou absent de l\'equivalence REDUITE (« Squat machine » → squat → barre)', [(EQ, EQ.replace("(_EX_EQUIV[q]||!contredit(eq))", "true"))], 'GARDE'),
    ('M1c garde-fou absent du recouvrement de mots (« haltères » → câble)', [(LOOP, "")], 'GARDE'),
    ('M2 garde-fou SYMETRIQUE trop strict (matériel écrit des deux côtés, aucune déduction ni tolérance)',
     [(GUARD + COMPAT, "  const contredit=cible=>{ const c=_materielDe(cible,true); return c!==matSrc; };\n")], 'GARDE'),
    ('M3 trop strict : les alias COMPLETS declares sont aussi bloques', [(EQ, EQ.replace("(_EX_EQUIV[q]||!contredit(eq))", "!contredit(eq)"))], 'GARDE'),
    ('M4 decision de Michel retiree : nom sans materiel → variante materielle en AUTO', [(REGLE2, "tier:'auto',via:'mots'};")], 'GARDE'),
    ('M5 machine = poulie (le bac « guidé » n\'est plus precise)', [(POULIE, "  if(/ (poulie|cable|cables) /.test(s)) return 'machine';\n")], 'GARDE'),
    ('M6 [deguisee] la FAMILLE passe avant le mot ecrit (« Chest Press barre » lu comme guidé)',
     [(DEBUT, DEBUT + "  { const f=_exEquip(nom); if(f==='guide'&&/ (barre|barbell|haltere|halteres) /.test(s)) return 'machine'; }\n")], 'GARDE'),
    ('M7 [deguisee] un guide DEDUIT est compatible avec tout (« Pec Deck barre » → Pec Deck)',
     [(COMPAT, "    if(!c||c===matSrc)return false; return c!=='guide'; };\n")], 'GARDE'),
    ('M9 la SOURCE deduit un materiel qu\'elle n\'ecrit pas (« Développé épaules » lu comme barre)', [(SRCMAT, "  const matSrc=_materielDe(name,false);\n")], 'GARDE'),
    ('M10 (temoin de controle) un COMMENTAIRE modifie : le banc doit rester VERT',
     [("// IMPORT-MAP-01 : le matériel ÉCRIT par la source contredit-il", "// IMPORT-MAP-01 : le matériel ÉCRIT par la source contredit-il bien")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_import_map.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin],
                       capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_imap_')
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
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(cible):
            print('  INVALIDE  %s (syntaxe cassée par la mutation)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom[:100], obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
