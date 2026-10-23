#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-SECURISATION-P1 (session-B, 23/10/2026) : les temoins B-NSP1 savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE (Code.js + le banc), jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. M00 = le Code.js d'AVANT (master, `_pa_` sur le journal).
Chaque mutation casse UNE garantie du garde-fou dans le VRAI code ; une seule touche un commentaire, et elle doit rester
VERTE (un banc qui rougit sur un commentaire mesurerait le texte, pas le comportement).
Une mutation qui casse la SYNTAXE est refusee (INVALIDE) : un banc qui plante ne prouve rien (M10 de SEC-ADMIN, 09/10).
Usage : python3 tools/mut_nut_secu_p1.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'Code.js'
COPIES = ('Code.js', 'tests/_garde_reseau.js', 'tests/parcours/nut_secu_p1.js', 'tools/banc_nut_secu_p1.js')
BASE_AVANT = 'origin/master'

MUT = [
    ("M00 le Code.js d'AVANT (master) : `_pa_` remplace le journal et les favoris sans rien garder", 'AVANT', 'GARDE'),
    ("M01 le journal repasse par `_pa_` (les favoris restent proteges)",
     "    if (body.foodLog       !== undefined) profile.foodLog       = _nutProtegerListe_(existing, profile, 'foodLog',    body.foodLog);\n",
     "    if (body.foodLog       !== undefined) profile.foodLog       = _pa_(body.foodLog, profile.foodLog);\n", 'GARDE'),
    ("M02 les favoris repassent par `_pa_` (le journal reste protege)",
     "    if (body.savedFoods    !== undefined) profile.savedFoods    = _nutProtegerListe_(existing, profile, 'savedFoods', body.savedFoods);\n",
     "    if (body.savedFoods    !== undefined) profile.savedFoods    = _pa_(body.savedFoods, profile.savedFoods);\n", 'GARDE'),
    ("M03 les lignes RETIREES ne sont plus copiees dans la zone",
     "  ec.retirees.forEach(function(l) { garder(l, brutal ? 'brutal' : 'retiree'); });\n", "", 'GARDE'),
    ("M04 l'ancienne version d'une ligne MODIFIEE n'est plus copiee",
     "  ec.modifiees.forEach(function(l) { garder(l, 'modifiee'); });\n", "", 'GARDE'),
    ("M05 deduplication en ENSEMBLE (deux repas identiques retires ensemble => une seule copie)",
     "    var k = cle(l); if (deja[k] > 0) { deja[k]--; return; }\n",
     "    var k = cle(l); if (deja[k]) return; deja[k] = 1;\n", 'GARDE'),
    ("M06 aucune deduplication : un aller-retour entre appareils recopie a chaque fois",
     "    var k = cle(l); if (deja[k] > 0) { deja[k]--; return; }\n", "    var k = cle(l);\n", 'GARDE'),
    ("M07 appariement par IDENTIFIANT SEUL (identifiants historiques instables => fausses suppressions)",
     "  restants.forEach(function(a) { var k = empA[a]; if (libres[k] > 0) libres[k]--; else retirees.push(actuel[a]); });\n",
     "  restants.forEach(function(a) { retirees.push(actuel[a]); });\n", 'GARDE'),
    ("M08 appariement par CONTENU SEUL (une modification devient retrait + ajout, plus de « modifiee »)",
     "    var id = _nutIdLigne_(s), l = id ? parId[id] : null;\n    if (l && l.length) { pris[l.shift()] = true; modifiees.push(s); return; }\n",
     "    restants.push(a); return;\n    var id = _nutIdLigne_(s), l = id ? parId[id] : null;\n    if (l && l.length) { pris[l.shift()] = true; modifiees.push(s); return; }\n", 'GARDE'),
    ("M09 identifiant en double : premiere copie prise au lieu de la copie IDENTIQUE",
     "    for (var j = 0; j < l.length; j++) { if (empR[l[j]] === empA[a]) { pris[l.splice(j, 1)[0]] = true; vu[a] = true; return; } }\n",
     "    if (l.length && empR[l[0]] === empA[a]) { pris[l.shift()] = true; vu[a] = true; return; }\n", 'GARDE'),
    ("M10 la zone est rangee DANS le profil (donc renvoyee par loadProfile)",
     "  var z = existing.recupNut || (existing.recupNut = { v: 1 });\n",
     "  var z = profile.recupNut || (profile.recupNut = { v: 1 });\n", 'GARDE'),
    ("M11 la zone n'est plus bornee",
     "  while (liste.length && (liste.length > b.lignes || total > b.car)) { total -= tailles.shift(); liste.shift(); coupees++; }\n",
     "", 'GARDE'),
    ("M12 la borne retire les copies les plus RECENTES au lieu des plus anciennes",
     "  while (liste.length && (liste.length > b.lignes || total > b.car)) { total -= tailles.shift(); liste.shift(); coupees++; }\n",
     "  while (liste.length && (liste.length > b.lignes || total > b.car)) { total -= tailles.pop(); liste.pop(); coupees++; }\n", 'GARDE'),
    ("M13 ce qui ne tient pas dans la zone n'est plus COMPTE (perte silencieuse)",
     "  if (coupees) z.coupees = (z.coupees || 0) + coupees;\n", "", 'GARDE'),
    ("M14 le retrecissement brutal n'est plus signale",
     "  var brutal = actuel.length >= 30 && (actuel.length - ec.retirees.length) < actuel.length * 0.6;   // le seuil des séances\n",
     "  var brutal = false;\n", 'GARDE'),
    ("M15 un envoi illisible (une chaine...) est de nouveau stocke tel quel",
     "    Logger.log('[FT GARDE-FOU ' + nom + '] envoi non lisible : ignoré, liste conservée');\n    return profile[nom];\n",
     "    return recu;\n", 'GARDE'),
    ("M16 la regle existante « le vide ne gagne jamais » est perdue au passage",
     "  if (recu.length === 0 && actuel.length > 0) return profile[nom];   // règle existante de _pa_ : le vide ne gagne jamais\n",
     "", 'GARDE'),
    ("M17 le journal du serveur cite un aliment retire (donnee personnelle)",
     "  Logger.log('[FT GARDE-FOU ' + nom + '] ' + ec.retirees.length",
     "  Logger.log('[FT GARDE-FOU ' + nom + '] ' + JSON.stringify(ec.retirees[0] || '') + ec.retirees.length", 'GARDE'),
    ("M18 plus aucune trace dans le journal du serveur",
     "  Logger.log('[FT GARDE-FOU ' + nom + '] ' + ec.retirees.length",
     "  if (false) Logger.log('[FT GARDE-FOU ' + nom + '] ' + ec.retirees.length", 'GARDE'),
    ("M19 la liste des evenements n'est plus bornee",
     "  if (evts.length > NUT_RECUP_MAX_EVTS_) evts.splice(0, evts.length - NUT_RECUP_MAX_EVTS_);\n", "", 'GARDE'),
    ("M20 la zone est ecrite dans une CLE A PART, avant le compte (plus atomique)",
     "  var z = existing.recupNut || (existing.recupNut = { v: 1 });\n",
     "  var z = existing.recupNut || (existing.recupNut = { v: 1 });\n"
     "  PropertiesService.getScriptProperties().setProperty('recup_' + (existing.email || ''), '{}');\n", 'GARDE'),
    ("M21 borne des favoris trop basse (40 000) : un ecrasement des 200 favoris ne tient plus",
     "savedFoods: { lignes: 1000, car: 60000 } };", "savedFoods: { lignes: 1000, car: 40000 } };", 'GARDE'),
    ("M22 (temoin de controle) un COMMENTAIRE du garde-fou modifie : le banc doit rester VERT",
     "// ⛔ BORNÉE : au-delà, on retire les copies les plus ANCIENNES",
     "// ⛔ BORNÉE (commentaire modifié) : au-delà, on retire les copies les plus ANCIENNES", 'OK'),
]


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin],
                       capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nsp1_')
    for f in COPIES:
        d = os.path.join(tmp, f)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(os.path.join(SRC, f), d)
    return tmp


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_secu_p1.js'], cwd=arbre, capture_output=True, text=True, timeout=600,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges, out


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    av = subprocess.run(['git', 'show', BASE_AVANT + ':' + CO], cwd=SRC, capture_output=True, text=True)
    AVANT = av.stdout if av.returncode == 0 else ''
    a0 = cloner()
    rouges, out0 = banc(a0)
    shutil.rmtree(a0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    m = re.search(r'(\d+) OK / (\d+) rouge', out0)
    print('  arbre sain : 0 rouge (%s OK) — point de depart valide\n' % (m.group(1) if m else '?'))
    conformes = total = 0
    for spec in MUT:
        nom, attendu = spec[0], spec[-1]
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        arbre = cloner()
        chemin = os.path.join(arbre, CO)
        src = open(chemin, encoding='utf-8').read()
        if spec[1] == 'AVANT':
            if not AVANT or AVANT == src:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
            src = AVANT
        else:
            av_, ap_ = spec[1], spec[2]
            if src.count(av_) != 1:
                print('  INVALIDE  %s (ancre trouvee %d fois)' % (nom, src.count(av_))); shutil.rmtree(arbre, ignore_errors=True); continue
            src = src.replace(av_, ap_, 1)
        open(chemin, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(chemin):
            print('  INVALIDE  %s (syntaxe cassee par la mutation)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
        rouges, out = banc(arbre)
        shutil.rmtree(arbre, ignore_errors=True)
        plante = any('PLANTAGE' in r for r in rouges)
        ok = (attendu == 'GARDE' and rouges and not plante) or (attendu == 'OK' and not rouges)
        conformes += 1 if ok else 0
        etat = 'CONFORME ' if ok else 'NON CONFORME'
        print('  %s %s -> %d rouge(s)%s' % (etat, nom, len(rouges), ' (PLANTAGE : ne prouve rien)' if plante else ''))
        for r in (rouges if os.environ.get('MUT_DETAIL') else rouges[:2]):
            print('        ' + r)
    print('\n  ==== %d / %d mutations conformes ====' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
