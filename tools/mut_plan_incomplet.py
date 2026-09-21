#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins du « compte neuf » peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60 : on ne modifie pas
    l'arbre pendant qu'on le mesure).

⭐ Chaque mutation défait UN fait que les témoins prétendent protéger. ⛔ Et deux doivent
   RESTER VERTES : elles ajoutent un COMMENTAIRE citant les mots cherchés — c'est la seule
   preuve qu'on mesure le CODE et non la documentation. Indispensable ici : les commentaires
   du correctif citent `PLANCHER_KCAL`, `1500`, `null`, `profilCaloriqueManquants` et
   « Complète ton profil » en toutes lettres (R30).

⚠️ ET DEUX MUTATIONS SONT « DÉGUISÉES » : M03 rend `_nbUtil` permissif par une AUTRE forme
   (un test d'existence au lieu d'un test de nombre) et M14 remet la copie de la règle sous
   une écriture différente. Un témoin qui ne chercherait que la forme d'origine resterait
   vert dessus, et le défaut serait revenu.

⛔⛔ M02 EST LA MUTATION QUE MICHEL A DEMANDÉE NOMMÉMENT : elle remet, MOT POUR MOT, le code
   d'avant ce chantier — donc le faux plan à 1 500 kcal. Si elle ne rougit pas, rien de ce
   qui est écrit ici ne vaut.

Usage : python3 tools/mut_plan_incomplet.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutplan'
ST, SC, AP, CO = 'state.js', 'screens.js', 'app.js', 'coach.js'

MUT = [
    # ── LA RACINE : le propriétaire de « a-t-on de quoi calculer ? » ──────────────
    ('M01', ST,
     "  if(profilCaloriqueManquants().length) return null;\n"
     "  return Math.round(calcBMR()*S.activityLevel",
     "  if(false) return null;\n"
     "  return Math.round(calcBMR()*S.activityLevel",
     'rouge', 'calcTDEE additionne de nouveau sur un BMR nul (le cas mesure a 450 kcal)'),

    # ⛔⛔ LA MUTATION CENTRALE : le code d'AVANT, mot pour mot.
    ('M02', ST,
     "function autoKcal(phase){ const b=_autoKcalBrut(phase); return b==null?null:_plancherKcal(b); }",
     "function autoKcal(phase){ return _plancherKcal(_autoKcalBrut(phase)); }",
     'rouge', 'LE FAUX PLAN A 1500 KCAL REVIENT (code d avant, mot pour mot)'),

    ('M03', ST,
     "function _nbUtil(v){ const n=(typeof v==='string')?parseFloat(v.replace(',','.')):+v;\n"
     "                     return (isFinite(n)&&n>0)?n:null; }",
     "function _nbUtil(v){ const n=(typeof v==='string')?parseFloat(v.replace(',','.')):+v;\n"
     "                     return (v!==undefined&&v!==null&&v!=='')?(isFinite(n)?n:1):null; }",
     'rouge', 'DEGUISEE : un test d EXISTENCE remplace le test de NOMBRE (le cas « abc »)'),

    ('M04', ST,
     "  return PROFIL_CALORIQUE.filter(c=>_nbUtil(S[c[0]])==null).map(c=>c[1]);",
     "  return [];",
     'rouge', 'le proprietaire declare toujours le profil complet'),

    ('M05', ST,
     "  if(profilCaloriqueManquants().length) return {kcal:0,methode:null,raison:'profil incomplet'};",
     "  if(!S.bw||!S.height||!S.age) return {kcal:0,methode:null,raison:'profil incomplet'};",
     'rouge', 'bmrDetail reecrit la regle au lieu de la lire (R2, la copie revient)'),

    ('M06', ST,
     "         indisponible:manquants.length>0, manquants:manquants};",
     "         indisponible:false, manquants:[]};",
     'rouge', 'calcMacros ne declare plus l indisponibilite'),

    ('M07', ST,
     "  const calculable=(calories!=null)&&(_nbUtil(S.bw)!=null);",
     "  const calculable=(calories!=null);",
     'rouge', 'une repartition est inventee sans poids (le cas manualKcal : 0 P / 0 L / 550 G)'),

    ('M08', ST,
     "  const tdee=calcTDEE();\n  if(tdee==null) return null;",
     "  const tdee=calcTDEE();",
     'rouge', '_autoKcalBrut continue d additionner sur un TDEE absent'),

    ('M09', ST,
     "  if(brut==null) return null;\n  const p=PLANCHER_KCAL[sexeAthlete()];",
     "  const p=PLANCHER_KCAL[sexeAthlete()];",
     'rouge', 'le piege de la coercition de `null` revient (« ton calcul donnait NaN kcal »)'),

    ('M10', ST,
     "function _nbAff(v){ return (v==null||!isFinite(v))?'—':(+v).toLocaleString('fr-FR'); }",
     "function _nbAff(v){ return (+v||0).toLocaleString('fr-FR'); }",
     'rouge', 'un nombre inconnu s affiche « 0 » au lieu de « — »'),

    # ── L ECRAN ──────────────────────────────────────────────────────────────────
    ('M11', SC,
     "  document.getElementById('nu-tdee').textContent=_nbAff(tdee);",
     "  document.getElementById('nu-tdee').textContent=String(tdee);",
     'rouge', 'la case TDEE ecrit sa valeur brute'),

    ('M12', SC,
     "  document.getElementById('m-kcal').textContent=_nbAff(macros.calories);",
     "  document.getElementById('m-kcal').textContent=String(macros.calories);",
     'rouge', 'la cible ecrit sa valeur brute'),

    ('M13', SC,
     "  if(macros.indisponible||macros.calories==null){",
     "  if(false){",
     'rouge', 'le message « Complete ton profil » disparait'),

    ('M14', SC,
     "  const hasProfile=profilCaloriqueManquants().length===0;",
     "  const hasProfile=!!(S.bw&&S.height&&S.age);",
     'rouge', 'DEGUISEE : la copie de la regle revient sous une autre ecriture (R2)'),

    ('M15', SC,
     "  const hydra=(_bwOk!=null)?fmt((_bwOk*0.035)+0.5):'—';",
     "  const hydra=fmt((S.bw*0.035)+0.5);",
     'rouge', 'l hydratation reaffiche « NaN L/jour »'),

    ('M16', SC,
     "  if(auto)auto.textContent=(m.autoCalories!=null)",
     "  if(auto)auto.textContent=(true)",
     'rouge', 'openKcalEdit leve de nouveau une erreur sur un `null`'),

    # ── MILO ─────────────────────────────────────────────────────────────────────
    ('M17', CO,
     "  const tdee = ((typeof calcTDEE === 'function') ? calcTDEE() : null) || '—';",
     "  const tdee = calcTDEE ? calcTDEE() : '—';",
     'rouge', 'Milo recoit « TDEE: null kcal »'),

    ('M18', CO,
     "  const bmr = (_bd && _bd.kcal > 0) ? _bd.kcal : (calcBMR && calcBMR() > 0 ? calcBMR() : '—');",
     "  const bmr = _bd ? _bd.kcal : (calcBMR ? calcBMR() : '—');",
     'rouge', 'Milo recoit « BMR: 0 kcal » comme un fait'),

    # ── LE PERIMETRE : ce qui NE doit PAS bouger ─────────────────────────────────
    ('M19', ST, "const PLANCHER_KCAL={H:1500,F:1200};", "const PLANCHER_KCAL={H:1200,F:1200};",
     'rouge', 'le garde-fou calorique a ete modifie'),

    ('M20', ST, "const base=10*S.bw+6.25*S.height-5*S.age;", "const base=10*S.bw+6.00*S.height-5*S.age;",
     'rouge', 'Mifflin-St Jeor a change'),

    ('M21', ST, "const katch=Math.round(370+21.6*lm.lm);", "const katch=Math.round(370+22.0*lm.lm);",
     'rouge', 'Katch-McArdle a change'),

    ('M22', ST,
     "const _GOAL_DELTA_KCAL={muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100};",
     "const _GOAL_DELTA_KCAL={muscle:400,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100};",
     'rouge', 'la table des objectifs a change'),

    ('M23', AP,
     "  if(typeof profilCaloriqueManquants!=='function' || profilCaloriqueManquants().length) return null;",
     "  if(!(S.bw && S.age && S.height)) return null;",
     'rouge', '_resteDuJour reecrit la regle au lieu de la lire (R2)'),

    # ── ⭐ LES DEUX QUI DOIVENT RESTER VERTES ─────────────────────────────────────
    ('V01', ST,
     "function sexeAthlete(){ return S.gender==='F' ? 'F' : 'H'; }",
     "/* note : PLANCHER_KCAL, 1500, profilCaloriqueManquants, _nbUtil, _nbAff, null,\n"
     "   autoKcal, _autoKcalBrut, calcTDEE, brut==null, isFinite, indisponible, manquants,\n"
     "   10*S.bw+6.25*S.height-5*S.age, 370+21.6*lm.lm sont cites ici, en commentaire */\n"
     "function sexeAthlete(){ return S.gender==='F' ? 'F' : 'H'; }",
     'vert', 'un COMMENTAIRE citant tous les mots cherches ne doit rien changer'),

    ('V02', SC,
     "function renderFoodJournal(){",
     "/* note : hasProfile, S.bw&&S.age&&S.height, _nbAff, nu-tdee, m-kcal, hydra,\n"
     "   Complete ton profil pour calculer tes besoins, autoCalories sont cites ici */\n"
     "function renderFoodJournal(){",
     'vert', 'idem cote ecran'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_plan_incomplet.js'],  # noqa
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s'
                  % (mid, src.count(avant), fic, quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        if obt == att:
            ok += 1
            print('%s %-8s attendu=%-5s OK   — %s' % (mid, obt, att, quoi))
        else:
            nc += 1
            der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s'
                  % (mid, obt, att, quoi, der[0][:90]))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc) else 0


if __name__ == '__main__':
    sys.exit(main())
