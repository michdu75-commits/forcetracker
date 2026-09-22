#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins de l'ordre des repas mordent-ils vraiment ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).

⭐ LES SIX FAMILLES EXIGÉES PAR LE BRIEF (§6) SONT CHACUNE COUVERTE :
   · affichage selon l'ordre d'INSERTION                    → M01 (la mutation centrale)
   · disparition d'un repas sans données                    → M02
   · ordre ALPHABÉTIQUE accidentel                          → M03
   · ordre par HEURE                                        → M04
   · ordre par FRÉQUENCE (les repas remplis d'abord)        → M05
   · duplication de l'ordre canonique                       → M06, M07

⛔⛔ M01 REMET LE CODE D'AVANT MOT POUR MOT (`Object.keys(pa.habitudes)`). Si elle ne rougit
   pas, rien de ce qui est écrit dans le journal ne vaut.

⚠️ CINQ SONT « DÉGUISÉES » — chacune laisse l'écran d'aujourd'hui parfaitement juste :
   · M06 recopie l'ordre canonique SUR PLACE, dans le bon ordre : la carte reste correcte, et
     la deuxième source de vérité est née (R2). Un témoin qui ne regarderait que le rendu
     resterait vert dessus — c'est la mutation la plus importante du lot après M01 ;
   · M07 redéclare `FOOD_MEALS` dans `screens.js`, même contenu : idem, par déclaration ;
   · M08 donne une heure à la ligne vide en la prenant chez `pa.heures` — elle a l'air plus
     complète, et elle invente un fait sur la personne ;
   · M09 remplit la ligne vide avec le dernier aliment connu du repas : plausible à l'œil ;
   · M11 duplique le gabarit de ligne pour les vides — visuellement presque identique, mais
     l'alignement à colonne fixe payé en ft-v1031 est perdu.

⛔ ET TROIS MUTATIONS DOIVENT RESTER VERTES (V01→V03) : des COMMENTAIRES citant tous les mots
   cherchés. *C'est la seule façon de prouver qu'on mesure le mécanisme et non la phrase qui
   l'explique* — et les commentaires de ce correctif les citent tous, parce que R30 exige que
   la raison soit écrite à côté du code.

Usage : python3 tools/mut_ordre_repas.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutordre'
AP, SC = 'app.js', 'screens.js'

BOUCLE = ("    let lignes=MM.map(m=>{\n"
          "      const hab=pa.habitudes[m.k];\n")
LIGNE_VIDE = ("      if(!hab || !hab.length) return lgn(m.lbl, undefined, "
              "'Pas encore assez de données', true);\n")
MM_DECL = ("    const MM=(typeof FOOD_MEALS!=='undefined' && Array.isArray(FOOD_MEALS))"
           "?FOOD_MEALS:[];\n")

MUT = [
    # ══ ⛔⛔ LA MUTATION CENTRALE : LE CODE D'AVANT, MOT POUR MOT ═══════════════════════
    ('M01', SC,
     MM_DECL,
     "    const MM=Object.keys(pa.habitudes).map(k=>({k:k,lbl:({petitdej:'Petit-déj',"
     "collation:'Collation',dejeuner:'Déjeuner',collation2:'Collation 2',diner:'Dîner',"
     "autre:'Autre'})[k]})).filter(m=>m.lbl);\n",
     'rouge', "L ORDRE D INSERTION REVIENT (Object.keys(pa.habitudes)) - le code d avant"),

    # ══ un repas sans donnees disparait de nouveau ══════════════════════════════════════
    ('M02', SC,
     LIGNE_VIDE,
     "      if(!hab || !hab.length) return '';\n",
     'rouge', "la ligne d un repas sans habitude DISPARAIT au lieu de rester visible"),

    # ══ ordre ALPHABETIQUE accidentel ═══════════════════════════════════════════════════
    ('M03', SC,
     BOUCLE,
     "    let lignes=MM.slice().sort((a,b)=>a.lbl.localeCompare(b.lbl,'fr')).map(m=>{\n"
     "      const hab=pa.habitudes[m.k];\n",
     'rouge', "ordre ALPHABETIQUE des libelles"),

    # ══ ordre par HEURE ═════════════════════════════════════════════════════════════════
    ('M04', SC,
     BOUCLE,
     "    let lignes=MM.slice().sort((a,b)=>(pa.heures[a.k]===undefined?99:pa.heures[a.k])"
     "-(pa.heures[b.k]===undefined?99:pa.heures[b.k])).map(m=>{\n"
     "      const hab=pa.habitudes[m.k];\n",
     'rouge', "ordre par HEURE mediane observee"),

    # ══ ordre par FREQUENCE : les repas renseignes d abord ══════════════════════════════
    ('M05', SC,
     BOUCLE,
     "    let lignes=MM.slice().sort((a,b)=>((pa.habitudes[b.k]||[]).length)"
     "-((pa.habitudes[a.k]||[]).length)).map(m=>{\n"
     "      const hab=pa.habitudes[m.k];\n",
     'rouge', "ordre par FREQUENCE : les repas remplis passent devant"),

    # ══ ⚠️ DEGUISEES : l ecran reste JUSTE, la 2e source de verite est nee ══════════════
    ('M06', SC,
     BOUCLE,
     "    const _ORDRE=['petitdej','collation','dejeuner','collation2','diner'];\n"
     "    let lignes=MM.slice().sort((a,b)=>_ORDRE.indexOf(a.k)-_ORDRE.indexOf(b.k)).map(m=>{\n"
     "      const hab=pa.habitudes[m.k];\n",
     'rouge', "DEGUISEE : l ordre canonique RECOPIE sur place, l ecran reste juste"),

    ('M07', SC,
     MM_DECL,
     "    const MM=[{k:'petitdej',lbl:'Petit-déj'},{k:'collation',lbl:'Collation'},"
     "{k:'dejeuner',lbl:'Déjeuner'},{k:'collation2',lbl:'Collation 2'},{k:'diner',lbl:'Dîner'}];\n",
     'rouge', "DEGUISEE : FOOD_MEALS redeclare dans l ecran, meme contenu"),

    # ══ ⚠️ DEGUISEES : l etat vide se met a inventer ════════════════════════════════════
    ('M08', SC,
     LIGNE_VIDE,
     "      if(!hab || !hab.length) return lgn(m.lbl, pa.heures[m.k], "
     "'Pas encore assez de données', true);\n",
     'rouge', "DEGUISEE : la ligne vide recupere une heure - elle invente un fait"),

    ('M09', SC,
     LIGNE_VIDE,
     "      if(!hab || !hab.length){const d=(S.foodLog||[]).filter(e=>e&&(e.meal||'autre')===m.k).pop();\n"
     "        return lgn(m.lbl, undefined, d?esc(d.name):'Pas encore assez de données', !d);}\n",
     'rouge', "DEGUISEE : la ligne vide affiche le DERNIER aliment connu du repas"),

    # ══ l etat vide disparait / devient muet ════════════════════════════════════════════
    ('M10', SC,
     LIGNE_VIDE,
     "      if(!hab || !hab.length) return lgn(m.lbl, undefined, '', true);\n",
     'rouge', "la ligne vide ne DIT plus rien (cadre a moitie muet)"),

    ('M11', SC,
     LIGNE_VIDE,
     "      if(!hab || !hab.length) return '<div style=\"margin-bottom:5px;font-size:12.5px;"
     "line-height:1.45;color:var(--t3);\">'+m.lbl+' — Pas encore assez de données</div>';\n",
     'rouge', "DEGUISEE : gabarit duplique pour les vides, l alignement a colonne fixe est perdu"),

    # ══ « Autre » supprime en silence ═══════════════════════════════════════════════════
    ('M12', SC,
     "    if(lignes && (pa.habitudes.autre||[]).length)\n"
     "      lignes+=lgn('Autre', pa.heures.autre, pa.habitudes.autre.map(x=>esc(x.nom)).join(' · '), false);\n",
     "",
     'rouge', "« Autre » disparait en silence (R30 : un retrait doit etre ecrit)"),

    # ══ l echec ferme saute ═════════════════════════════════════════════════════════════
    ('M13', SC,
     MM_DECL,
     "    const MM=FOOD_MEALS;\n",
     'rouge', "l echec ferme saute : FOOD_MEALS introuvable ferait planter la carte"),

    # ══ la branche « insuffisant », decision actee en ft-v1021 ══════════════════════════
    ('M14', SC,
     "  if(pa.etat==='insuffisant'){",
     "  if(false){",
     'rouge', "la branche « moins de 3 jours notes » est rouverte sans decision"),

    # ══ ⛔ LE PERIMETRE : la logique metier de ft-v1233 ne doit pas bouger ═══════════════
    ('M15', AP,
     "const _PA_MIN_JOURS = 3;",
     "const _PA_MIN_JOURS = 1;",
     'rouge', "PERIMETRE : le seuil metier de ft-v1233 a bouge"),

    ('M16', AP,
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n) || a.nom.localeCompare(b.nom,'fr'))",
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n))",
     'rouge', "PERIMETRE : le departage deterministe par le nom a saute"),

    ('M17', AP,
     "    if(_FAMILLE[_afMealDefautHoraire(h)] !== attendu) return;    // l'heure dit un autre repas",
     "    // l'heure n'est plus verifiee",
     'rouge', "PERIMETRE : la regle des heures de ft-v1233 a saute"),

    ('M18', AP,
     "const FOOD_MEALS = [\n"
     "  {k:'petitdej',  ic:'🌅', lbl:'Petit-déj'},\n"
     "  {k:'collation', ic:'🍎', lbl:'Collation'},",
     "const FOOD_MEALS = [\n"
     "  {k:'collation', ic:'🍎', lbl:'Collation'},\n"
     "  {k:'petitdej',  ic:'🌅', lbl:'Petit-déj'},",
     'rouge', "l ordre canonique de la journee est casse a la source"),

    # ══ ⭐ LES TROIS QUI DOIVENT RESTER VERTES ══════════════════════════════════════════
    ('V01', SC,
     "function _blocApprisHTML(){",
     "/* note : FOOD_MEALS, Object.keys(pa.habitudes), LBL={petitdej:...}, ordre, petitdej,\n"
     "   collation, dejeuner, collation2, diner, Pas encore assez de donnees, nu-lgn, autre */\n"
     "function _blocApprisHTML(){",
     'vert', "un COMMENTAIRE citant tous les mots cherches ne doit rien changer"),

    ('V02', AP,
     "function _profilAlimentaire(){",
     "/* note : _PA_MIN_JOURS, FOOD_MEALS, _afMealDefautHoraire, localeCompare, jours */\n"
     "function _profilAlimentaire(){",
     'vert', "idem cote app.js"),

    ('V03', SC,
     MM_DECL,
     MM_DECL + "    /* ordre : petitdej, collation, dejeuner, collation2, diner */\n",
     'vert', "une suite de cles dans un COMMENTAIRE n est pas une 2e source de verite"),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_ordre_repas.js'],
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
