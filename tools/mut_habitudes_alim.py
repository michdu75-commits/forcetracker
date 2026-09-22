#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins des habitudes alimentaires mordent-ils vraiment ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).

⭐ Les CINQ familles exigées par le brief (§9) sont chacune représentées :
   · un algorithme qui prend simplement le dernier aliment          → M08
   · un `slice()` sur les dernières lignes                          → M09
   · un ordre de tableau supposé                                    → M06, M07
   · une heure de SAISIE employée à la place de l'heure pertinente   → M10, M11, M12
   · une fréquence qui compte mal les occurrences                    → M04, M05

⛔⛔ M01 EST LA MUTATION CENTRALE : elle remet le `top(o,3)` sans seuil, mot pour mot le code
   d'avant. Si elle ne rougit pas, rien de ce qui est écrit ne vaut.

⚠️ QUATRE SONT « DÉGUISÉES » :
   · M02 remet le défaut en gardant le filtre par aliment mais en RETIRANT celui du repas —
     c'est le cas Pom'Potes exactement, et un témoin qui ne regarderait que « la prune a
     disparu » resterait vert dessus ;
   · M05 compte les LIGNES au lieu des JOURS sans toucher au reste (deux Pom'Potes le même
     après-midi redeviennent deux occasions) ;
   · M07 remplace le départage par le nom par un départage par `n`, qui retombe sur l'ordre
     du tableau à égalité parfaite ;
   · M12 recopie le barème horaire sur place au lieu de le demander — l'affichage reste juste,
     et la deuxième source de vérité est née (R2).

Usage : python3 tools/mut_habitudes_alim.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/muthab'
AP, SC = 'app.js', 'screens.js'

MUT = [
    # ⛔⛔ LA MUTATION CENTRALE : le code d'AVANT, mot pour mot.
    ('M01', AP,
     "  const habitudes = {};\n"
     "  Object.keys(parRepas).forEach(m=>{\n"
     "    /* ① Le REPAS doit avoir été observé assez de jours pour qu'on prétende le connaître. */\n"
     "    if(Object.keys(joursRepas[m]||{}).length < _PA_MIN_JOURS) return;",
     "  const habitudes = {};\n"
     "  Object.keys(parRepas).forEach(m=>{\n"
     "    if(false) return;",
     'rouge', 'LE TOP-3 SANS SEUIL REVIENT cote repas (le cas Pom Potes)'),

    ('M02', AP,
     "    if(Object.keys(joursRepas[m]||{}).length < _PA_MIN_JOURS) return;\n"
     "    const l = Object.keys(parRepas[m]).map(k=>{",
     "    const l = Object.keys(parRepas[m]).map(k=>{",
     'rouge', 'DEGUISEE : le filtre par ALIMENT reste, celui du REPAS saute (Pom Potes passe)'),

    ('M03', AP,
     "      .filter(a=>a.jours >= _PA_MIN_JOURS)",
     "      .filter(a=>a.jours >= 1)",
     'rouge', 'un aliment vu une seule fois redevient une habitude (le cas prune)'),

    # ── LA FREQUENCE : compter les JOURS, pas les lignes ─────────────────────────
    # ⚠️ ANCRE REPAREE : mon premier jet avait 8 espaces d indentation, la source en a 6.
    #    *Une ancre morte ne mesure RIEN* — on la corrige, on ne la retire pas (lecon ft-v1227).
    ('M04', AP,
     "      return {nom:a.nom, n:a.n, jours:Object.keys(a.jours).length};",
     "      return {nom:a.nom, n:a.n, jours:a.n};",
     'rouge', 'les jours redeviennent des lignes (3 fois le meme apres-midi = habitude)'),

    ('M05', AP,
     "    if(d) parRepas[m][k].jours[d] = 1;",
     "    if(d) parRepas[m][k].jours[d+'-'+parRepas[m][k].n] = 1;",
     'rouge', 'DEGUISEE : chaque ligne fabrique un faux jour distinct'),

    # ── L ORDRE DU TABLEAU NE DOIT PLUS DECIDER ─────────────────────────────────
    ('M06', AP,
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n) || a.nom.localeCompare(b.nom,'fr'))",
     "      .sort((a,b)=> (b.jours-a.jours))",
     'rouge', 'l ordre du tableau redecide l affichage a egalite'),

    ('M07', AP,
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n) || a.nom.localeCompare(b.nom,'fr'))",
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n))",
     'rouge', 'DEGUISEE : un 2e critere existe mais retombe sur l ordre a egalite parfaite'),

    # ── LES FAMILLES NOMMEES PAR LE BRIEF ───────────────────────────────────────
    ('M08', AP,
     "      .slice(0,3);\n    if(l.length) habitudes[m] = l;",
     "      .slice(0,3);\n"
     "    const _der={}; fl.forEach(e=>{ if((e.meal||'autre')===m && e.name) _der[m]=e.name; });\n"
     "    if(_der[m]) habitudes[m] = [{nom:_der[m], n:1, jours:1}]; else if(l.length) habitudes[m] = l;",
     'rouge', 'BRIEF §9 : l algorithme prend simplement le DERNIER aliment'),

    ('M09', AP,
     "  const parRepas = {}, global = {}, joursRepas = {};\n  fl.forEach(e=>{",
     "  const parRepas = {}, global = {}, joursRepas = {};\n  fl.slice(-30).forEach(e=>{",
     'rouge', 'BRIEF §9 : un slice() sur les dernieres lignes'),

    # ── L HEURE DE SAISIE NE DOIT PLUS PASSER POUR UNE HEURE DE REPAS ───────────
    ('M10', AP,
     "    if(_FAMILLE[_afMealDefautHoraire(h)] !== attendu) return;    // l'heure dit un autre repas",
     "    ;",
     'rouge', 'BRIEF §9 : l heure de SAISIE repasse pour une heure de repas (« Petit-dej ~12h »)'),

    ('M11', AP,
     "    if(!attendu) return;                                        // `autre` : aucune case",
     "    if(!attendu){ heures[m]=h; return; }",
     'rouge', 'un repas hors du bareme affiche quand meme une heure'),

    ('M12', AP,
     "    if(_FAMILLE[_afMealDefautHoraire(h)] !== attendu) return;    // l'heure dit un autre repas",
     "    const _b=h<11?'petitdej':h<15?'dejeuner':h<18?'collation':'diner';\n"
     "    if(_FAMILLE[_b] !== attendu) return;",
     'rouge', 'DEGUISEE : le bareme horaire est RECOPIE sur place (2e source de verite, R2)'),

    ('M13', AP,
     "    if(typeof _afMealDefautHoraire !== 'function') return;       // ⛔ échec fermé",
     "    if(typeof _afMealDefautHoraire !== 'function'){ heures[m]=h; return; }",
     'rouge', 'l echec n est plus ferme : une heure passe sans avoir ete verifiee'),

    ('M14', AP,
     "    if(Object.keys(joursRepas[m]||{}).length < _PA_MIN_JOURS) return;\n    const h = hs[Math.floor(hs.length/2)];",
     "    const h = hs[Math.floor(hs.length/2)];",
     'rouge', 'une heure peut s afficher sans aucun aliment a cote'),

    # ── LE SEUIL DOIT RESTER CELUI QUI EXISTAIT ─────────────────────────────────
    ('M15', AP, "const _PA_MIN_JOURS = 3;", "const _PA_MIN_JOURS = 1;",
     'rouge', 'le seuil de la maison est abaisse'),

    # ── LE PROPRIETAIRE DU BAREME RESTE COMPATIBLE ──────────────────────────────
    ('M16', AP,
     "  const h=(heure===undefined||heure===null||!isFinite(+heure))?new Date().getHours():+heure;",
     "  const h=+heure||0;",
     'rouge', 'le repli sur l heure courante saute : le REPAS ACTIF est touche'),

    ('M17', AP,
     "  if(_afMeal && FOOD_MEALS.some(m=>m.k===_afMeal)) return _afMeal;\n"
     "  return _afMealDefautHoraire();",
     "  if(_afMeal && FOOD_MEALS.some(m=>m.k===_afMeal)) return _afMeal;\n"
     "  return _afMealDefautHoraire(12);",
     'rouge', 'le repas actif se met a passer une heure fixe'),

    # ── LA POPULATION NE DOIT PAS BOUGER ────────────────────────────────────────
    ('M18', AP,
     "  const jours = Object.keys(parJour).sort();",
     "  const jours = Object.keys(parJour);",
     'rouge', 'le tri des jours saute (la famille du [0] qui suppose un tri)'),

    # ── L ECRAN ─────────────────────────────────────────────────────────────────
    ('M19', SC,
     "    corps=(lignes || '<div class=\"txt-just\" style=\"font-size:12.5px;color:var(--t3);line-height:1.5;\">'\n"
     "        +'Pas encore d\\'habitude qui se dégage : aucun repas n\\'a été noté assez de jours pour '\n"
     "        +'qu\\'un aliment revienne vraiment.</div>')",
     "    corps=lignes",
     'rouge', 'le cadre redevient muet quand aucun repas ne passe la barre'),

    # ── ⭐ LES DEUX QUI DOIVENT RESTER VERTES ─────────────────────────────────────
    ('V01', AP,
     "function _profilAlimentaire(){",
     "/* note : _PA_MIN_JOURS, joursRepas, a.jours, localeCompare, _afMealDefautHoraire,\n"
     "   _FAMILLE, collation2, h<11?'petitdej', slice, top(o,3), heure de saisie sont cites ici */\n"
     "function _profilAlimentaire(){",
     'vert', 'un COMMENTAIRE citant tous les mots cherches ne doit rien changer'),

    ('V02', SC,
     "function _blocApprisHTML(){",
     "/* note : Pas encore d habitude qui se degage, lignes, corps, habitudes, heures */\n"
     "function _blocApprisHTML(){",
     'vert', 'idem cote ecran'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_habitudes_alim.js'],  # noqa
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
