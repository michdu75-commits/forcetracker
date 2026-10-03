#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-05 (corpus de reference des recherches alimentaires, 03/10/2026,
session-B) : le corpus protege-t-il REELLEMENT le moteur ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXXIX : le corpus conduit sur
     la vraie base, en ligne et hors ligne · B-CDXL : determinisme). Un rouge des seuls temoins de SOURCE
     (B-CDXXXVIII) ne suffit pas.
  M00 = le moteur de master (%s : app.js + data/alias.json) remis mot pour mot · M1..M14 = les defauts demandes
  par Michel · DG = deguisees · EQ1 = equivalente (temoins verts) · [negatif] = commentaire
Usage : python3 tools/mut_food_reference.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'f31dc234'
AP, AJ, CO = 'app.js', 'data/alias.json', 'tests/parcours/food_reference_corpus.js'
FICHIERS = (AP, AJ, CO)
FICHIERS_REV = (AP, AJ)          # le corpus n'existe pas sur master : seul le MOTEUR est remis

RIZ = "  {requetes:['riz'], prefere:['cuit'],"
INTENTION = "  const formes=_fsFormesDuTexte(q);\n"
EVITE = "const _FS_EVITE_GENERIQUE=['poudre','feuille','seche','puree','partie','sauce'];"
POUDRE = "poudre:'Poudre / moulu', "
BADGE = "  return l.length ? '<span class=\"af-forme\">'+l.join(' · ')+'</span>' : '';\n"
CLE = "  return [r[0], forme, r[1], entier, teteExacte, teteSing, n.length, n, a[0]];\n"
PROFILS = "const _FS_PREFS_GENERIQUES=[\n"
PROFIL = "      if(q===r || q===pluriel) return p;\n"
PATES = "  {requetes:['pates'].concat(_AF_FORMES_PATES), prefere:['cuit'],"
RAISIN = "{ id: 'FR-043', q: 'raisin', cat: 'fruits', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION',"
CAMEMBERT = "{ id: 'FR-118', q: 'camembert', cat: 'laitiers', kind: 'ambigu', mode: 'en', niveau: 'KNOWN_LIMITATION',"
RAISON_POMME = "raison: 'une pomme n\\'est pas une pomme séchée' }"

MUT = [
    ('M00 le moteur de master remis mot pour mot (%s : app.js + data/alias.json)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 « riz » n\'est plus servi cuit (profil riz retire)', [(AP, RIZ, "  {requetes:['_riz_retire'], prefere:['cuit'],")], 'GARDE'),
    ('M2 une requete explicite ne gagne plus (formes nommees ignorees)',
     [(AP, INTENTION, "  const formes=[]; q=_afMots(q).filter(m=>!_FS_ORDRE.some(f=>_FS_FORMES[f].suites.some(s=>s.length===1&&s[0]===m))).join(' ');\n")], 'GARDE'),
    ('M3 « pomme » renvoie de nouveau la pomme sechee (alias)', [(AJ, '"pomme":13396', '"pomme":13111')], 'GARDE'),
    ('M4 « haricot(s) vert(s) » renvoie de nouveau la puree (alias)',
     [(AJ, '"haricot vert":20030', '"haricot vert":20257'), (AJ, '"haricots verts":20030', '"haricots verts":20257')], 'GARDE'),
    ('M5 « poire » renvoie la Poire belle Helene (alias)', [(AJ, '"poire":13397', '"poire":39519')], 'GARDE'),
    ('M6 « courgette » renvoie de nouveau la puree (alias reintroduit)', [(AJ, '"cuisse de poulet":36024,', '"courgette":20264,"cuisse de poulet":36024,')], 'GARDE'),
    ('M7 « cafe » generique peut renvoyer la poudre (poudre plus evitee)', [(AP, EVITE, EVITE.replace("'poudre',", ""))], 'GARDE'),
    ('M8 « the » generique peut renvoyer les feuilles (feuille plus evitee)', [(AP, EVITE, EVITE.replace("'feuille',", ""))], 'GARDE'),
    ('M9 mauvaise forme affichee dans l\'UI (« Poudre » au lieu de « Poudre / moulu »)', [(AP, POUDRE, "poudre:'Poudre', ")], 'GARDE'),
    ('M10 un aliment SANS forme recoit un faux badge (« Standard »)', [(AP, BADGE, BADGE.replace(": '';", ": '<span class=\"af-forme\">Standard</span>';"))], 'GARDE'),
    ('M11 l\'ordre depend du fichier CIQUAL (nom et code retires de la cle)', [(AP, CLE, CLE.replace(", n, a[0]];", "];"))], 'GARDE'),
    ('M12 regle globale cuit > cru appliquee aux viandes et poissons',
     [(AP, PROFILS, PROFILS + "  {requetes:['poulet','dinde','boeuf','steak','saumon','thon','oeuf','oeufs'], prefere:['cuit'], raison:'mutation'},\n")], 'GARDE'),
    ('M13 un profil par prefixe deborde sur un plat compose (« riz cantonais »…)', [(AP, PROFIL, "      if(q===r || q===pluriel || q.indexOf(r+' ')===0) return p;\n")], 'GARDE'),
    ('M14 une KNOWN_LIMITATION devient MUST (raisin hors ligne -> Raisin sec)', [(CO, RAISIN, RAISIN.replace("'KNOWN_LIMITATION'", "'MUST'"))], 'GARDE'),
    ('DG1 [deguisee] camembert « Cru » promu SHOULD', [(CO, CAMEMBERT, CAMEMBERT.replace("'KNOWN_LIMITATION'", "'SHOULD'"))], 'GARDE'),
    ('DG2 [deguisee] la sauce n\'est plus evitee en generique', [(AP, EVITE, EVITE.replace(",'sauce'", ""))], 'GARDE'),
    ('DG3 [deguisee] le profil pates retire', [(AP, PATES, "  {requetes:['_pates_retire'], prefere:['cuit'],")], 'GARDE'),
    ('EQ1 [equivalente] la raison d\'un cas reformulee', [(CO, RAISON_POMME, "raison: 'pomme fraîche, jamais séchée' }")], 'OK'),
    ('[negatif] commentaire citant riz, cuit et badge', [(AP, PROFIL, PROFIL + "      // riz · cuit · badge\n")], 'OK'),
]

def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_reference.js'], cwd=arbre, capture_output=True, text=True, timeout=600, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXXIX |❌ ROUGE B-CDXL ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_reference_')
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
            for f in FICHIERS_REV:
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
