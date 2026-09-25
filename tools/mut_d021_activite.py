#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins D-021 (anciens 1,55 à confirmer) et R34 (ce que Milo reçoit) peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).
⭐ Chaque mutation défait UNE garantie de D-021 (provenance, confirmation, cloud, rechargement) ou de
   R34 (la ligne envoyée à Milo). Les témoins doivent rougir.
⛔ Deux mutations de COMMENTAIRE doivent rester vertes.
⛔ M00 : le clone non muté doit être vert, sinon le contrôle ne prouve rien.

Usage : python3 tools/mut_d021_activite.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutd21'
ST, SE, SC, CO, CJ = 'state.js', 'setup.js', 'screens.js', 'coach.js', 'Code.js'

MUT = [
    ('M-D021-1', ST, "    S.activitySrc=(S.activityLevel!=null&&localStorage.getItem('ft4_act_src')==='choisi')?'choisi':null;",
     "    S.activitySrc=(S.activityLevel!=null)?'choisi':null;", 'rouge', 'tout ancien 1,55 sans provenance devient « confirmé »'),
    ('M-D021-2', ST, "    S.activitySrc=(S.activityLevel!=null&&localStorage.getItem('ft4_act_src')==='choisi')?'choisi':null;",
     "    S.activitySrc=(S.activityLevel!=null&&localStorage.getItem('ft4_act_src')==='choisi')?'choisi':null;\n    if(S.activityLevel===1.55&&S.activitySrc!=='choisi')S.activityLevel=null;", 'rouge', 'effacement automatique des anciens 1,55'),
    ('M-D021-3', ST, "  if(a==null) return false;\n  S.activitySrc='choisi';\n  persist();",
     "  if(a==null) return false;\n  persist();", 'rouge', '« Confirmer » sans enregistrer la provenance'),
    ('M-D021-4', ST, "if(_activiteValide(S.activityLevel)!=null&&S.activitySrc==='choisi') localStorage.setItem('ft4_act_src','choisi');\n    else localStorage.removeItem('ft4_act_src');",
     "localStorage.removeItem('ft4_act_src');", 'rouge', 'la confirmation se perd au rechargement'),
    ('M-D021-5', SE, "    const _srcCloud=(d.activitySrc==='choisi')?'choisi':null;",
     "    const _srcCloud='choisi';", 'rouge', 'un vieux cloud 1,55 rend « confirmé » ce qui était ambigu'),
    ('M-D021-6', SE, "  const act=(actEl&&actEl.dataset.touche==='1')?_activiteValide(actEl.value):null;",
     "  const act=actEl?_activiteValide(actEl.value):null;", 'rouge', 'DÉGUISÉE : « Enregistrer » le Profil prérempli vaut confirmation'),
    ('M-D021-7', SE, "    if(_act!==S.activityLevel){ S.activityLevel=_act; S.activitySrc=_srcCloud; }",
     "    if(_act!==S.activityLevel){ S.activityLevel=_act; }", 'rouge', 'DÉGUISÉE : la provenance survit à un changement de valeur'),
    ('M-D021-8', CJ, "    if (body.activitySrc   !== undefined) profile.activitySrc   = _ps_(body.activitySrc === 'choisi' ? 'choisi' : '', profile.activitySrc);",
     "", 'rouge', 'le serveur jette la provenance (liste blanche)'),
    ('M-D021-9', SC, "  if(typeof etatActivite!=='function'||etatActivite()!=='a_confirmer'){ el.innerHTML=''; return; }",
     "  el.innerHTML=''; return;", 'rouge', 'la carte de confirmation ne s affiche plus'),
    ('M-R34-1', CO, "if(_e==='absent') return 'NON RENSEIGNÉ (besoins caloriques non calculés) — '+_MILO_ACT_ABSENTE;",
     "if(_e==='absent') return '1.55 — Modéré (3-4j)';", 'rouge', 'Milo reçoit « Modéré » pour une activité absente'),
    ('M-R34-2', CO, "if(_e==='a_confirmer') return S.activityLevel+' — '+_l+', À CONFIRMER",
     "if(_e==='a_confirmer') return S.activityLevel+' — '+_l+', choisi par la personne'; if(false) return S.activityLevel+' — '+_l+', À CONFIRMER",
     'rouge', 'Milo reçoit « Modéré, choisi » pour un ancien 1,55 non confirmé'),
    # ── R34-A (D-022, 25/09) : la consigne « demander, ne pas chiffrer » quand l'activité manque ──
    ('M-R34A-1', CO, "if(_e==='absent') return 'NON RENSEIGNÉ (besoins caloriques non calculés) — '+_MILO_ACT_ABSENTE;",
     "if(_e==='absent') return 'NON RENSEIGNÉ (besoins caloriques non calculés)';", 'rouge',
     'LE CODE D AVANT : simple constat, Milo reste autorisé à chiffrer une hypothèse'),
    ('M-R34A-2', CO, "pas même une fourchette ni un calcul « par hypothèse » (pas de « disons 3 séances ») ;",
     "une fourchette annoncée comme hypothèse reste permise ;", 'rouge',
     'DÉGUISÉE : la consigne tolère de nouveau une fourchette hypothétique'),
    ('M-R34A-3', CO, "Dis que ce niveau manque, explique que ses besoins caloriques en dépendent, et demande-lui combien de séances il fait par semaine : le calcul viendra après sa réponse.",
     "Dis que ce niveau manque et propose une estimation.", 'rouge',
     'DÉGUISÉE : on ne demande plus la donnée, on estime'),
    ('M-R34A-4', CO, "aux FOURCHETTES et aux hypothèses par défaut sur la fréquence';",
     "aux FOURCHETTES | et aux hypothèses par défaut sur la fréquence';", 'rouge',
     'un « | » dans la consigne coupe la ligne du profil : Milo ne lit que la moitié'),
    ('M-R34A-5', CO, "if(_e==='choisi') return S.activityLevel+' — '+_l+', choisi par la personne';",
     "if(_e==='choisi') return S.activityLevel+' — '+_l+', choisi par la personne — '+_MILO_ACT_ABSENTE;", 'rouge',
     'DÉGUISÉE : la consigne déborde sur un vrai choix (Milo refuserait des chiffres calculés)'),
    ('M-R34A-C', CO, "const _MILO_ACT_ABSENTE=",
     "/* AUCUN chiffre de dépense (TDEE) ni de cible calorique · pas même une fourchette · demande-lui */\nconst _MILO_ACT_ABSENTE=", 'vert',
     'un commentaire qui cite la consigne ne change rien'),
    ('M-C1', ST, "function etatActivite(){",
     "/* activitySrc choisi a_confirmer herite ft4_act_src */\nfunction etatActivite(){", 'vert', 'un commentaire ne change rien'),
    ('M-C2', CO, "- Niveau activité sportive: ${(()=>{",
     "- Niveau activité sportive: ${(()=>{ /* NON RENSEIGNÉ À CONFIRMER choisi par la personne */", 'vert', 'idem côté Milo'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_d021_activite.js'],
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
