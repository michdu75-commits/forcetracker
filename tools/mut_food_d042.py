#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-D042-01 (11/10/2026, session-B) : les temoins de D-042 distinguent-ils VRAIMENT un generique
pertinent passe devant d'un fast-food reste devant, une intention de marque gardee d'une intention perdue, une forme
nommee respectee d'une forme ecrasee, et « Deja note par toi » intact d'un « Deja note » touche ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-D42-B : la vraie frappe ·
     B-D42-J : « Deja note » au niveau du proprietaire · B-D42-T : le premier affichage). Un rouge des seuls
     temoins de STRUCTURE (B-D42-A) ne suffit pas.
  M00 = le moteur de master (%s) remis mot pour mot · M1..M8 = les mutations demandees par le brief ·
  M9..M12 = le critere D, la table d'alias, le premier affichage, la marque « Coca-Cola » · DG = deguisee ·
  EQ = equivalente (temoins verts) · [negatif] = commentaire. Chacune vise une propriete, aucune ne gonfle le compte.
Usage : python3 tools/mut_food_d042.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'b280ea5d'
AP, AJ = 'app.js', 'data/alias.json'
FICHIERS = (AP, AJ)
FICHIERS_REV = (AP, AJ)

RENDU = "  h+=_afGeneriqueDevant((document.getElementById('af-desc')||{}).value||'', _afSuggCiq) ? ciq+ff : ff+ciq;"
REGLE_MARQUE = "  if(!ciq || !ciq.length || _afIntentionMarque(q)) return false;"
REGLE_ALIAS = "  if(c && c[0]===a[0]) return true;\n"
REGLE_D = "  return _foodSynonymes(q).some(r=>{\n    const m=_afMots(r), aliment=m.filter(x=>!_fsFormesDuTexte(x).length);\n    return _fsMotsEntiers(aliment.length?aliment:m, a[1]);\n  });"
CHARGEURS = "    Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger()]).then(()=>{"
APRES_CHARGE = "      _afSuggCiq=_ciqualChercher(q,6); _afSuggMarq=_marquesChercher(q,4); _afSuggRendu();"

MUT = [
    ('M00 le moteur de master remis mot pour mot (%s : app.js + data/alias.json)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    # — les huit mutations du brief —
    ('M1 D-042 desactivee : le rendu ignore la regle, fast-food toujours devant', [(AP, RENDU, "  h+=ff+ciq;")], 'GARDE'),
    ('M2 generique toujours devant, meme pour une marque explicite (intention ignoree)', [(AP, REGLE_MARQUE, "  if(!ciq || !ciq.length) return false;")], 'GARDE'),
    ('M3 marque toujours devant : toute requete est lue comme une intention de marque', [(AP, "function _afIntentionMarque(q){\n", "function _afIntentionMarque(q){ return true;\n")], 'GARDE'),
    ('M4 forme explicite ignoree : l\'intention perd ses formes nommees (cru, cuit, seche, poudre)', [(AP, "  return {version:_FS_VERSION, mots:recherche, formes:formes, generique:formes.length===0};", "  return {version:_FS_VERSION, mots:_afMots(q), formes:[], generique:true};")], 'GARDE'),
    ('M5 protection lexicale FS-01 retiree : plus de nom de tete exact ni singulier (fromage -> Fromage de tete)', [(AP, "  const teteExacte = (_fsTete(a[1], false)===it.mots.join(' '))?0:1;", "  const teteExacte = 0;"), (AP, "  const teteSing = (_fsTete(a[1], true)===it.mots.map(_fsSing).join(' '))?0:1;", "  const teteSing = 0;")], 'GARDE'),
    ('M6 l\'ordre D-042 passe AU-DESSUS d\'un vrai « Deja note par toi »', [(AP, RENDU, "  { const sec=_afGeneriqueDevant((document.getElementById('af-desc')||{}).value||'', _afSuggCiq) ? ciq+ff : ff+ciq; const k=h.indexOf('<div',1); h = k<0 ? h+sec : h.slice(0,k)+sec+h.slice(k); }")], 'GARDE'),
    ('M7 D-042 modifie la couche « Deja note » : ses faux amis (Boeuf hache pour oeuf) sont filtres en mot entier', [(AP, "  _afSuggLoc=_afSuggLocales(q);\n", "  _afSuggLoc=_afSuggLocales(q).filter(e=>_fsMotsEntiers(_afMots(q), e.name));\n")], 'GARDE'),
    ('M8 le fast-food revient devant pour les requetes generiques (seule la table d\'alias garde le generique)', [(AP, REGLE_D, "  return false;")], 'GARDE'),
    # — le critere D, l'alias, le premier affichage, la marque —
    ('M9 critere D retire : tout premier CIQUAL passe devant, meme sans le mot tape (wings -> chewing-gum)', [(AP, REGLE_D, "  return true;")], 'GARDE'),
    ('M10 la cible de la table d\'alias n\'est plus pertinente d\'office (mayo, fish burger)', [(AP, REGLE_ALIAS, "")], 'GARDE'),
    ('M11 premier affichage : le fast-food rendu seul avant CIQUAL (deux rendus, comme master)', [(AP, CHARGEURS, "    _marquesCharger().then(()=>{ _afSuggMarq=_marquesChercher(q,4); _afSuggRendu(); });\n" + CHARGEURS)], 'GARDE'),
    ('M12 « coca cola » retire de MARQUE_ALIAS : « Coca-Cola » redevient une requete generique', [(AP, "  'coca cola':'coca cola'\n", "\n")], 'GARDE'),
    ('DG1 [deguisee] M1 ecrite autrement : la regle evaluee puis neutralisee', [(AP, RENDU, "  h+=(_afGeneriqueDevant((document.getElementById('af-desc')||{}).value||'', _afSuggCiq)&&0) ? ciq+ff : ff+ciq;")], 'GARDE'),
    ('DG2 [deguisee] M9 ecrite autrement : le test du mot entier accepte la sous-chaine', [(AP, "    return w.some(x=>x===m||x===s||_fsSing(x)===s); });\n}", "    return w.some(x=>x===m||x===s||_fsSing(x)===s||x.indexOf(m)>=0); });\n}")], 'GARDE'),
    ('EQ1 [equivalente] les trois conditions d\'entree de la regle dans un autre ordre', [(AP, REGLE_MARQUE, "  if(_afIntentionMarque(q) || !ciq || !ciq.length) return false;")], 'OK'),
    ('EQ2 [equivalente] la cible d\'alias comparee par egalite stricte du tableau entier', [(AP, REGLE_ALIAS, "  if(c && (c===a || c[0]===a[0])) return true;\n")], 'OK'),
    ('[negatif] commentaire citant D-042, fast-food, generique et Deja note', [(AP, APRES_CHARGE, APRES_CHARGE + "   // D-042 : generique · fast-food · Deja note")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_d042.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-D42-[BJT] ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_d042_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def syntaxe(arbre):
    """Une mutation qui casse la syntaxe ne prouve rien : elle « rougit » par plantage (leçon SEC-ADMIN, M10)."""
    r = subprocess.run(['node', '--check', os.path.join(arbre, AP)], capture_output=True, text=True)
    return r.returncode == 0, (r.stderr or '').strip().split('\n')[-1][:120]


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
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if isinstance(remplacements, str) and remplacements.startswith('REV:'):
            rev = remplacements[4:]; diff = 0; ok = True
            for f in FICHIERS_REV:
                av = subprocess.run(['git', 'show', rev + ':' + f], cwd=SRC, capture_output=True, text=True).stdout
                if not av:
                    print('  INVALIDE  %s (%s introuvable dans %s)' % (nom, f, rev)); ok = False; break
                if av != open(os.path.join(arbre, f), encoding='utf-8').read(): diff += 1
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av)
            if not ok or not diff:
                if ok: print('  INVALIDE  %s (code de %s identique)' % (nom, rev))
                shutil.rmtree(tmp, ignore_errors=True); continue
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (%s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            ok_syn, err = syntaxe(arbre)
            if not ok_syn:
                print('  INVALIDE  %s (syntaxe cassee : %s)' % (nom, err)); shutil.rmtree(tmp, ignore_errors=True); continue
        rouges = banc(arbre)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-88s %-6s %3d rouge(s), %3d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        sys.stdout.flush()
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
