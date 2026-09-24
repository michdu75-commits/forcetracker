#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins B1/B2 (activité jamais choisie, relectures bornées) peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation remet UN comportement d'avant (1,55 silencieux, `selected` d'office, restauration
   sans borne…) ou en déguise un. Les témoins doivent rougir.
⛔ Deux mutations de COMMENTAIRE doivent rester vertes.
⛔ M00 : le clone non muté doit être vert, sinon le contrôle ne prouve rien.

Usage : python3 tools/mut_activite_provenance.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutact'
ST, SE, IH, CO, SC = 'state.js', 'setup.js', 'index.html', 'coach.js', 'screens.js'

MUT = [
    ('M01', ST, "    S.activityLevel=_activiteValide(localStorage.getItem('ft4_act'));",
     "    S.activityLevel=parseFloat(localStorage.getItem('ft4_act')||'1.55')||1.55;", 'rouge', 'LE CODE D AVANT : 1,55 redevient un repli silencieux'),
    ('M02', ST, "    S.activityLevel=_activiteValide(localStorage.getItem('ft4_act'));",
     "    S.activityLevel=_activiteValide(localStorage.getItem('ft4_act')||'1.55');", 'rouge', 'DÉGUISÉE : repli 1,55 AVANT le validateur'),
    ('M03', IH, '            <option value="1.55">Modéré (3-4j)</option>',
     '            <option value="1.55" selected>Modéré (3-4j)</option>', 'rouge', '`selected` réapparaît sans choix'),
    ('M04', SE, "if(actEl)actEl.value=(_activiteValide(S.activityLevel)!=null)?String(S.activityLevel):'';",
     "if(actEl)actEl.value=(_activiteValide(S.activityLevel)!=null)?String(S.activityLevel):'1.55';", 'rouge', 'DÉGUISÉE : le Profil affiche Modéré d office'),
    ('M05', SE, "const _act=_activiteValide(d.activityLevel); if(_act!=null)S.activityLevel=_act;",
     "const _act=parseFloat(d.activityLevel); if(_act)S.activityLevel=_act;", 'rouge', 'bornes de restauration de l activité retirées'),
    ('M06', SE, "const _k=_kcalManuelleValide(d.manualKcal); if(_k!=null)S.manualKcal=_k;",
     "const _k=parseFloat(d.manualKcal)||0; if(_k)S.manualKcal=_k;", 'rouge', 'bornes de restauration des calories retirées'),
    ('M07', ST, "    S.manualKcal=_kcalManuelleValide(localStorage.getItem('ft4_manualkcal'))||0;",
     "    S.manualKcal=parseFloat(localStorage.getItem('ft4_manualkcal')||'0')||0;", 'rouge', 'relecture des calories sans borne'),
    ('M08', ST, "{const _h=parseFloat(localStorage.getItem('ft4_ht')||'0'); S.height=_tailleValide(_h)?_h:0;}",
     "{const _h=parseFloat(localStorage.getItem('ft4_ht')||'0'); S.height=_h||0;}", 'rouge', 'relecture de la taille sans borne'),
    ('M09', ST, "{const _a=parseInt(localStorage.getItem('ft4_age')||'0'); S.age=_ageValide(_a)?_a:0;}",
     "{const _a=parseInt(localStorage.getItem('ft4_age')||'0'); S.age=_a||0;}", 'rouge', 'relecture de l âge sans borne'),
    ('M10', ST, "  if(_activiteValide(S.activityLevel)==null) m.push('ton niveau d\\'activité');\n",
     "", 'rouge', 'l activité ne compte plus comme manquante (TDEE sur null)'),
    ('M11', ST, "  return (isFinite(n)&&[1.2,1.375,1.55,1.725,1.9].indexOf(n)>=0)?n:null;",
     "  return (isFinite(n)&&n>=1&&n<=2)?n:null;", 'rouge', 'DÉGUISÉE : une PLAGE au lieu des 5 niveaux (1.4 passe)'),
    ('M12', ST, "    if(_activiteValide(S.activityLevel)!=null) localStorage.setItem('ft4_act',S.activityLevel);\n    else localStorage.removeItem('ft4_act');",
     "    localStorage.setItem('ft4_act',S.activityLevel||1.55);", 'rouge', 'persist() réécrit 1,55 sur le disque'),
    ('M13', ST, "  const a=_activiteValide(S.activityLevel);\n  if(a==null) return 0;\n  return a>=1.725?0:150;",
     "  return (S.activityLevel||1.55)>=1.725?0:150;", 'rouge', 'LE CODE D AVANT : bonus sport sur 1,55 supposé'),
    ('M14', ST, "  if(profilBmrManquants().length) return {kcal:0,methode:null,raison:'profil incomplet'};",
     "  if(profilCaloriqueManquants().length) return {kcal:0,methode:null,raison:'profil incomplet'};", 'rouge', 'le BMR se tait à cause de l activité'),
    ('M15', CO, "- Niveau activité sportive: ${_activiteValide(S.activityLevel)!=null?S.activityLevel:'NON RENSEIGNÉ (besoins caloriques non calculés)'} |",
     "- Niveau activité sportive: ${S.activityLevel} |", 'rouge', 'Milo lit « null »'),
    ('M16', ST, "    const actuel=_activiteValide(S.activityLevel);\n    if(actuel==null)return null;",
     "    const actuel=+S.activityLevel||1.55;", 'rouge', 'carte « passer de Modéré à… » sans niveau choisi'),
    ('M17', SE, "  const act=actEl?_activiteValide(actEl.value):null;",
     "  const act=actEl?(numFR(actEl.value)||1.55):null;", 'rouge', 'DÉGUISÉE : « À choisir » enregistre 1,55'),
    # ── M4 du brief de nuit (24→25/09) : réautoriser Infinity, par chaque porte ──
    ('M20', ST, "  return (isFinite(n)&&[1.2,1.375,1.55,1.725,1.9].indexOf(n)>=0)?n:null;",
     "  return ((isFinite(n)&&[1.2,1.375,1.55,1.725,1.9].indexOf(n)>=0)||n===Infinity)?n:null;", 'rouge', 'M4a : le propriétaire accepte Infinity'),
    ('M21', SE, "const _act=_activiteValide(d.activityLevel); if(_act!=null)S.activityLevel=_act;",
     "const _act=(String(d.activityLevel)==='Infinity')?Infinity:_activiteValide(d.activityLevel); if(_act!=null)S.activityLevel=_act;", 'rouge', 'M4b : la restauration contourne la garde pour Infinity'),
    ('M22', ST, "  return (isFinite(n)&&n>=800&&n<=6000)?Math.round(n):null;",
     "  return (n>=800&&(n<=6000||n===Infinity))?Math.round(n):null;", 'rouge', 'M4c : les calories manuelles acceptent Infinity'),
    ('M23', ST, "  return /^[+-]?(\\d+\\.?\\d*|\\.\\d+)([eE][+-]?\\d+)?$/.test(t)?Number(t):NaN;",
     "  return parseFloat(t);", 'rouge', 'LECTURE TOLÉRANTE revenue : « 1.55abc » redevient 1,55'),
    ('M24', ST, "  if(typeof v!=='string') return NaN;",
     "  if(typeof v!=='string') return +v;", 'rouge', 'DÉGUISÉE : un tableau [1.55] redevient 1,55'),
    ('M25', SC, "  S.manualKcal=_kcalManuelleValide(v);\n  persist();closeKcalEdit();renderNutrition();",
     "  S.manualKcal=_kcalManuelleValide(v);   // B2 : le même propriétaire que la relecturepersist();closeKcalEdit();renderNutrition();",
     'rouge', 'LA RÉGRESSION DE 20eac697 : le commentaire avale persist/close/render'),
    ('M26', SC, "      (currentDelta>=0?'+':'')+currentDelta+' kcal', 'TDEE '+_nbAff(tdee)]",
     "      (currentDelta>=0?'+':'')+currentDelta+' kcal', 'TDEE '+tdee.toLocaleString('fr-FR')]",
     'rouge', 'LE CODE D AVANT : renderNutrition plante sur un TDEE null (rattrapé en silence)'),
    ('M27', SC, "  const _macrosCalculees=(macros.prot_g!=null&&macros.calories!=null);",
     "  const _macrosCalculees=true;", 'rouge', 'le plan « 0 kcal » et les barres « 0% » reviennent sans répartition calculée'),
    ('M18', ST, "function _activiteValide(v){",
     "/* 1.55 selected _activiteValide ft4_act parseFloat(d.activityLevel) */\nfunction _activiteValide(v){", 'vert', 'un commentaire ne change rien'),
    ('M19', SE, "function _applyRestoreData(raw){",
     "// S.activityLevel=parseFloat(d.activityLevel) 1.55\nfunction _applyRestoreData(raw){", 'vert', 'idem côté restauration'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_activite_provenance.js'],
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    rc, out = lancer()
    if rc != 0:
        der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
        print('M00 le clone NON muté n est pas vert (%d) — contrôle refusé >> %s' % (rc, der[0][:120]))
        return 1
    print('M00 vert     attendu=vert  OK   — le clone non muté est vert (point de départ sain)')
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s' % (mid, src.count(avant), fic, quoi))
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
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s' % (mid, obt, att, quoi, der[0][:90]))
    rc, out = lancer()
    print('M99 %s après restauration de toutes les mutations' % ('vert' if rc == 0 else 'NON VERT'))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc or rc) else 0


if __name__ == '__main__':
    sys.exit(main())
