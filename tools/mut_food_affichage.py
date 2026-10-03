#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-04 (afficher la forme, 03/10/2026, session-B) : les temoins
savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXXVI : la projection sur la
     vraie base · B-CDXXXVII : la vraie frappe, en ligne et hors ligne). Un rouge des seuls temoins de SOURCE
     (B-CDXXXV) ne suffit pas.
  M00 = le code de FS-03 (%s) remis mot pour mot · M1..M10 = les defauts demandes par Michel · DG = deguisees
  · EQ1 = equivalente (temoins executes verts) · [negatif] = commentaire
Usage : python3 tools/mut_food_affichage.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '0be1fd28'
AP, CS = 'app.js', 'style.css'
FICHIERS = (AP, CS)

ORDRE = "const _FS_AFFICHAGE_ORDRE=['boisson','sauce','poudre','puree','feuille','partie','cru','cuit','seche','surgele','conserve','prepare'];"
SOURCE = "  let f=_fsFormesDuTexte(nom);\n"
SECHE = "  if(f.indexOf('cru')>=0 || f.indexOf('cuit')>=0) f=f.filter(x=>x!=='seche');\n"
PREPARE = "  if(f.length>1) f=f.filter(x=>x!=='prepare');\n"
RET = "  return _FS_AFFICHAGE_ORDRE.filter(x=>f.indexOf(x)>=0).slice(0,2).map(x=>_FS_LIBELLES[x]);\n"
FONC = "function _fsFormesAffichees(nom){\n"
BADGE = "  return l.length ? '<span class=\"af-forme\">'+l.join(' · ')+'</span>' : '';\n"
LIGNE = "    _afSuggCiq.forEach((a,i)=>{ h+=ligne('🥗', a[1],\n      _fsBadgeForme(a[1])\n"
LIBS = "const _FS_LIBELLES={cru:'Cru', cuit:'Cuit', "
POUDRE = "poudre:'Poudre / moulu', "
CSSB = ".af-forme{display:inline-block;"

MUT = [
    ('M00 le code de FS-03 remis mot pour mot (%s : app.js + style.css)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 forme reconnue mais libelle absent (« cuit » n\'est plus affiche)', [(AP, ORDRE, ORDRE.replace("'cuit',", ""))], 'GARDE'),
    ('M2 forme incorrecte affichee (la poudre devient « Feuilles »)', [(AP, POUDRE, "poudre:'Feuilles', ")], 'GARDE'),
    ('M3 un aliment SANS forme recoit un faux libelle (« Standard »)', [(AP, BADGE, BADGE.replace(": '';", ": '<span class=\"af-forme\">Standard</span>';"))], 'GARDE'),
    ('M4 multi-formes rendues dans un ordre qui change d\'un appel a l\'autre',
     [(AP, FONC, "var _fsTour=0;\n" + FONC), (AP, RET, RET.replace(".map(x=>_FS_LIBELLES[x]);", ".map(x=>_FS_LIBELLES[x])[(_fsTour++)%2?'reverse':'slice']();"))], 'GARDE'),
    ('M5 l\'UI recree sa propre taxonomie (sous-chaines du nom) au lieu de FS-02', [(AP, SOURCE, "  let f=_FS_ORDRE.filter(x=>_afNorm(nom).indexOf(x)>=0);\n")], 'GARDE'),
    ('M6 FS-04 change l\'ordre des resultats (les aliments a forme passent devant)',
     [(AP, LIGNE, "    _afSuggCiq.slice().sort((x,y)=>_fsBadgeForme(y[1]).length-_fsBadgeForme(x[1]).length).forEach((a,i)=>{ h+=ligne('🥗', a[1],\n      _fsBadgeForme(a[1])\n")], 'GARDE'),
    ('M7 requete explicite affiche une forme contradictoire (cru et cuit echanges)', [(AP, LIBS, "const _FS_LIBELLES={cru:'Cuit', cuit:'Cru', ")], 'GARDE'),
    ('M8 le rendu depend de l\'ordre de la base (rang de l\'aliment dans le fichier)',
     [(AP, RET, RET.replace(".map(x=>_FS_LIBELLES[x]);", ".map(x=>_FS_LIBELLES[x])[(_ciqual.a.findIndex(a=>a[1]===nom)%2)?'reverse':'slice']();"))], 'GARDE'),
    ('M9 un nom long masque la forme (le badge passe dans le nom, tronque)',
     [(AP, LIGNE, "    _afSuggCiq.forEach((a,i)=>{ h+=ligne('🥗', _fsBadgeForme(a[1])+a[1],\n      ''\n")], 'GARDE'),
    ('M10 la forme n\'est plus qu\'une couleur (pastille sans texte)', [(AP, BADGE, "  return l.length ? '<span class=\"af-forme\" style=\"background:var(--green)\"></span>' : '';\n")], 'GARDE'),
    ('DG1 [deguisee] « prepare » n\'est plus retire a cote d\'une autre forme', [(AP, PREPARE, "")], 'GARDE'),
    ('DG2 [deguisee] « sec » n\'est plus retire a cote de cru / cuit', [(AP, SECHE, "")], 'GARDE'),
    ('DG3 [deguisee] plus de plafond a 2 libelles', [(AP, RET, RET.replace(".slice(0,2)", ".slice(0,3)"))], 'GARDE'),
    ('DG4 [deguisee] le badge est cache par le style', [(CS, CSSB, ".af-forme{display:none;")], 'GARDE'),
    ('EQ1 [equivalente] l.slice().join au lieu de l.join', [(AP, BADGE, BADGE.replace("l.join(", "l.slice().join("))], 'OK'),
    ('[negatif] commentaire citant cru, cuit et badge', [(AP, PREPARE, PREPARE + "  // cru · cuit · badge\n")], 'OK'),
]

def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_affichage.js'], cwd=arbre, capture_output=True, text=True, timeout=600, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXXV[I]+ ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_affichage_')
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
        nom = nom.replace('%%', '%')
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
        print('  %s  DANS LA COPIE MUTEE — %-70s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
