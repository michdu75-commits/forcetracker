#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-03 (preferences par defaut, 02/10/2026, session-B) : les temoins
savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXXXIV, les preferences
     conduites sur la vraie base, avec et sans alias). Un rouge des seuls temoins de SOURCE (B-CDXXXIII) ne
     suffit pas.
  M00 = le code de FS-02 (%s) remis mot pour mot · M1..M10 = les defauts demandes par Michel · DG = deguisees
  · EQ1 = equivalente (temoins executes verts) · [negatif] = commentaire
Usage : python3 tools/mut_food_prefs.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'f9f4aa34'
AP, AJ = 'app.js', 'data/alias.json'
FICHIERS = (AP, AJ)

EVITE = "const _FS_EVITE_GENERIQUE=['poudre','feuille','seche','puree','partie','sauce'];"
RIZ = "  {requetes:['riz'], prefere:['cuit'],"
GEN = "  if(!it.generique) return null;\n"
FILTRE = "  const evite=_FS_EVITE_GENERIQUE.filter(f=>it.formes.indexOf(f)<0);"
RET = "  return _fsFormesDuTexte(nom, {debut:true}).some(f=>evite.indexOf(f)>=0) ? 2 : 1;\n"
PROMO = "  if(i>0) out.unshift(out.splice(i,1)[0]);\n"
EXACT = "      if(q===r || q===pluriel) return p;\n"
FORME = "  const forme = manque ? 3 : _fsPreference(it, a[1]);\n"
ALIASNON = "    for(const a of _ciqualChercherSansAlias(q, lim, false)){"
PROFILS = "const _FS_PREFS_GENERIQUES=[\n"

MUT = [
    ('M00 le code de FS-02 remis mot pour mot (%s : app.js + data/alias.json)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    ('M1 cafe -> boisson desactive (la poudre n\'est plus evitee)', [(AP, EVITE, EVITE.replace("'poudre',", ""))], 'GARDE'),
    ('M2 the -> boisson desactive (la feuille n\'est plus evitee)', [(AP, EVITE, EVITE.replace("'feuille',", ""))], 'GARDE'),
    ('M3 pomme -> sechee reintroduite (alias)', [(AJ, '"pomme":13396', '"pomme":13111')], 'GARDE'),
    ('M4 haricots verts -> puree reintroduite (alias)', [(AJ, '"haricots verts":20030', '"haricots verts":20257')], 'GARDE'),
    ('M5 riz -> cuit desactive (profil retire)', [(AP, RIZ, "  {requetes:['_riz_retire'], prefere:['cuit'],")], 'GARDE'),
    ('M6 la preference passe avant l\'explicite (forme nommee evitee, profil sur l\'explicite)',
     [(AP, FILTRE, "  const evite=_FS_EVITE_GENERIQUE.slice();"), (AP, GEN, "")], 'GARDE'),
    ('M7 CUIT devient une preference globale des viandes (poulet, dinde, boeuf, saumon)',
     [(AP, PROFILS, PROFILS + "  {requetes:['poulet','dinde','boeuf','saumon'], prefere:['cuit'], raison:'mutation'},\n")], 'GARDE'),
    ('M8 tout candidat SANS forme est penalise', [(AP, RET, "  if(!_fsFormesDuTexte(nom).length) return 2;\n" + RET)], 'GARDE'),
    ('M9 la promotion depend de l\'ordre du FICHIER (le prefere le plus tot dans la base)',
     [(AP, PROMO, "  if(i>0){ const c=out.filter(x=>x.k[0]===out[0].k[0]&&x.k[1]===1&&_fsFormesDuTexte(x.a[1]).some(f=>p.prefere.indexOf(f)>=0)); const m=c.reduce((b,x)=>_ciqual.a.indexOf(x.a)<_ciqual.a.indexOf(b.a)?x:b); out.splice(out.indexOf(m),1); out.unshift(m); }\n")], 'GARDE'),
    ('M10 alias courgette -> puree reintroduit comme choix prioritaire', [(AJ, '"cuisse de poulet":36024,', '"courgette":20264,"cuisse de poulet":36024,')], 'GARDE'),
    ('DG1 [deguisee] profil par PREFIXE (« pates bolognaise » bascule sur des raviolis cuits)',
     [(AP, EXACT, "      if(q===r || q===pluriel || q.indexOf(r+' ')===0) return p;\n")], 'GARDE'),
    ('DG2 [deguisee] la preference trie TOUTE la liste (le cru n\'est plus juste dessous)',
     [(AP, RET, "  if(p && p.prefere && _fsFormesDuTexte(nom).some(f=>p.prefere.indexOf(f)>=0)) return 0;\n" + RET)], 'GARDE'),
    ('DG3 [deguisee] la preference rejoue le choix de l\'alias', [(AP, ALIASNON, "    for(const a of _ciqualChercherSansAlias(q, lim)){")], 'GARDE'),
    ('DG4 [deguisee] la sauce n\'est plus evitee (« carbonara » -> la sauce)', [(AP, EVITE, EVITE.replace(",'sauce'", ""))], 'GARDE'),
    ('DG5 [deguisee] la forme explicite passe APRES la preference dans la cle',
     [(AP, FORME, "  const forme = _fsPreference(it, a[1])===2 ? 4 : (manque ? 3 : 1);\n"), (AP, FILTRE, "  const evite=_FS_EVITE_GENERIQUE.slice();")], 'GARDE'),
    ('EQ1 [equivalente] i>=1 au lieu de i>0', [(AP, PROMO, "  if(i>=1) out.unshift(out.splice(i,1)[0]);\n")], 'OK'),
    ('[negatif] commentaire citant riz, cuit et cru', [(AP, PROMO, PROMO + "  // riz · cuit · cru\n")], 'OK'),
]

def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_prefs.js'], cwd=arbre, capture_output=True, text=True, timeout=300, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXXXIV ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_prefs_')
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
