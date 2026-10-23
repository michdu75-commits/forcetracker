#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-JOURNAL-QTY-GUARD-01 (LOT-C, 13/10/2026) : le banc sait-il ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Une mutation GARDE est conforme si le banc `tools/banc_journal_qty_guard.js` rougit (code 1) ;
une mutation OK (commentaire) est conforme s'il reste vert. Un PLANTAGE n'est jamais un verdict.
Usage : python3 tools/mut_journal_qty_guard.py
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
N = 'nutrition-v2.js'
AJOUT = "&& !(_bcQtyPose && numFR((document.getElementById('af-bc-grams')||{}).value)>0)){"
# Nutrition V2 (jalon 4, 22/10/2026) : la modification passe par `_efQteFiche` (l'ecran) puis par le moteur.
MODIF = "  const v=numFR((document.getElementById('ef-grams')||{}).value);\n  if(!(v>0)) return null;"
# ⭐ DEUX BARRIERES, ET C'EST VOULU (defense en profondeur) : l'ecran refuse avec une phrase, et le MOTEUR refuse
#    toute ligne sans quantite > 0 (contrat V2). Une mutation qui n'affaiblit QU'UNE barriere doit donc rester
#    VERTE — c'est ce qui prouve que l'autre tient (si un jour le moteur perdait sa garde, ces mutations
#    deviendraient rouges et le controle le dirait). Une mutation qui affaiblit LES DEUX doit rougir.
MOT_CALC = "    if (!lv.ok) return ko('FICHE_INVALIDE', lv.erreur + (lv.detail ? ':' + lv.detail : ''));\n    if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');"
MOT_LIGNE = "    var q = e.quantite;\n    if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');"
MOTEUR_SANS_GARDE = [
    (N, MOT_CALC, MOT_CALC.replace(" || !(q.val > 0)) return ko('QUANTITE_INVALIDE');", ") return ko('QUANTITE_INVALIDE');")),
    (N, MOT_LIGNE, MOT_LIGNE.replace(" || !(q.val > 0)) return ko('QUANTITE_INVALIDE');", ") return ko('QUANTITE_INVALIDE');")),
]
SANS_POIDS = "  return {ok:false, message:'Combien pesait ce que tu as mangé ? Indique le poids en grammes (ou le volume en ml).'};"
POIDS_POSE = "  _afPropPose=true; _afPropOrigine='tapee';   // 🥗 V2 : un poids TAPÉ est une quantité réellement choisie"
MODIF_DECL = "  const v=numFR((document.getElementById('ef-q')||{}).value);\n  if(!(v>0)) return null;"
REMPLACE = "              remplace:e, origine:(R.statut==='v2')"

MUT = [
    ('M1 garde d\'ajout ramenee au seul drapeau `_bcQtyPose` — le moteur refuse quand meme', [(A, AJOUT, "&& !_bcQtyPose){")], 'OK'),
    ('M2 garde de modification neutralisee — le moteur refuse quand meme', [(A, MODIF, MODIF.replace('if(!(v>0)) return null;', 'if(false) return null;'))], 'OK'),
    ('M3 l\'ajout accepte de nouveau 0 (`>0` devient `>=0`) — le moteur refuse quand meme', [(A, AJOUT, AJOUT.replace('>0)){', '>=0)){'))], 'OK'),
    ('M4 la modification n\'exclut que le negatif — le moteur refuse quand meme', [(A, MODIF, MODIF.replace('if(!(v>0)) return null;', 'if(v<0) return null;'))], 'OK'),
    ('M5 garde d\'ajout trop large : refuse aussi une quantite valide', [(A, AJOUT, "){")], 'GARDE'),
    ('M6 LES DEUX barrieres de l\'ajout tombent (ecran au seul drapeau + moteur sans garde)', [(A, AJOUT, "&& !_bcQtyPose){")] + MOTEUR_SANS_GARDE, 'GARDE'),
    ('M7 LES DEUX barrieres de la modification tombent (ecran neutralise + moteur sans garde)', [(A, MODIF, MODIF.replace('if(!(v>0)) return null;', 'if(false) return null;'))] + MOTEUR_SANS_GARDE, 'GARDE'),
    ('M8 une saisie a la main SANS poids recoit 100 g inventes', [(A, SANS_POIDS, "  return {ok:true, entree:Object.assign(e, {mode:'declaree', declare:vals, quantite:{val:100, unite:'g'}})};")], 'GARDE'),
    ('M9 un poids tape n\'est plus une quantite choisie (la saisie a la main avec poids est refusee)', [(A, POIDS_POSE, "  _afPropOrigine='tapee';")], 'GARDE'),
    ('M10 modifier une ancienne ligne sans quantite : 100 g remplis en silence', [(A, MODIF_DECL, MODIF_DECL.replace('if(!(v>0)) return null;', 'if(!(v>0)) return {val:100, unite:\'g\', origine:\'tapee\'};'))], 'GARDE'),
    ('M11 une ancienne ligne modifiee perd sa copie d\'origine', [(A, REMPLACE, "              remplace:Object.assign({}, e, {n2:{s:1}}), origine:(R.statut==='v2')")], 'GARDE'),
    ('MC1 [negatif] commentaire seulement', [(A, MODIF, "  /* garde : vide, 0, illisible */\n" + MODIF)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_journal_qty_guard.js'], cwd=arbre, capture_output=True, text=True, timeout=600)
    last = [l for l in (r.stdout or '').split('\n') if ' OK / ' in l]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:])


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_jqg_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    tmp0, a0 = cloner()
    rc, res = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes = 0
    for nom, rempl, attendu in MUT:
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        chk = subprocess.run(['node', '-e', "for (const f of ['app.js','nutrition-v2.js']) new Function(require('fs').readFileSync(f,'utf8'))"], cwd=arbre, capture_output=True)
        if chk.returncode != 0:
            print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        ok = (rc == 1) if attendu == 'GARDE' else (rc == 0)
        conformes += ok
        print('  %s %-80s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:80], attendu, res))
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
