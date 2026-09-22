#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF DE V9 — on abîme le moteur candidat, les témoins DOIVENT rougir.

⛔⛔ CE QU'IL PROUVE. `tools/temoins_v9.js` annonce « 55 OK / 0 ROUGE ». Un vert peut vouloir dire
*les invariants tiennent* ou *les témoins ne mesurent rien*. On casse donc chaque invariant, et
on vérifie que SON témoin s'allume.

⭐ Le §23 du brief exige explicitement des mutations où le moteur : apprend trop vite · apprend
avec des données insuffisantes · ignore l'historique · écrase l'historique · réagit à une seule
pesée · confond poids et masse maigre · traite 600 g comme une limite dure · déplace les calories
vers les lipides. **Les huit sont là, nommément.**

⚠️ Trois mutations doivent RESTER VERTES : elles ne changent que des commentaires citant les mots
cherchés. *C'est la seule façon de prouver qu'on mesure le CODE et non la phrase qui l'explique.*

⛔ On mute `tools/moteur_v9.js`, jamais `state.js` : le moteur SERVI n'est pas touché, même dans
le clone.
"""
import os, re, subprocess, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIBLE = 'tools/moteur_v9.js'
COPIES = [CIBLE, 'tools/moteur_v8.js', 'tools/temoins_v9.js']

MUTATIONS = [
    # ── §23 : les huit familles explicitement demandées ──────────────────────────────────
    ('M01', 'APPREND TROP VITE : le poids de l observation passe a 1',
     "const poids = porte ? ({ forte: 0.7, moyenne: 0.35, faible: 0.15, aucune: 0 }[niveau]) : 0;",
     "const poids = porte ? 1 : 0;", 'rouge'),
    ('M02', 'APPREND AVEC DES DONNEES INSUFFISANTES : la porte disparait',
     "  const porte = (h.jours >= 14) && (pctJours >= 0.5) && (pesees >= 4)\n             && !h.changementObjectif && !h.interruption;",
     "  const porte = true;", 'rouge'),
    ('M03', 'IGNORE L HISTORIQUE : le TDEE observe n est jamais calcule',
     "  const obs = c.poids > 0 ? tdeeObserve(h) : null;", "  const obs = null;", 'rouge'),
    ('M04', 'ECRASE L HISTORIQUE : l observation remplace la formule',
     "  return { tdee: Math.round(est * (1 - w) + obs * w), estime: est, observe: obs, poids: w,",
     "  return { tdee: obs, estime: est, observe: obs, poids: w,", 'rouge'),
    ('M05', 'REAGIT A UNE SEULE PESEE : la pente devient le dernier moins le premier',
     "  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);",
     "  const slope = (pts[pts.length-1].y - pts[0].y) / Math.max(1, pts[pts.length-1].j - pts[0].j);", 'rouge'),
    ('M06', 'CONFOND POIDS ET MASSE MAIGRE : le bareme de deficit s applique au poids',
     "    prot_g = Math.round(ffm * g);", "    prot_g = Math.round(p.bw * g);", 'rouge'),
    ('M07', '600 g REDEVIENT UNE LIMITE DURE',
     "  let carbs_g = Math.round((kcal - prot_g * 4 - fat_g * 9) / 4);",
     "  let carbs_g = Math.min(600, Math.round((kcal - prot_g * 4 - fat_g * 9) / 4));", 'rouge'),
    ('M08', 'DEPLACE LES CALORIES VERS LES LIPIDES (le danger annonce par Michel)',
     "  fat_g = Math.max(fMin, Math.min(fat_g, fMax));",
     "  fat_g = Math.max(fMin, Math.min(Math.round((kcal - prot_g * 4) / 9), Math.floor(kcal * 0.6 / 9)));", 'rouge'),
    # ── les bornes scientifiques ─────────────────────────────────────────────────────────
    ('M09', 'la borne d Alpert disparait',
     "const ALPERT_KCAL_PAR_KG_GRAS = 31;", "const ALPERT_KCAL_PAR_KG_GRAS = 9999;", 'rouge'),
    ('M10', 'la borne de Murphy & Koehler disparait',
     "const MK_PLAFOND = 500, IMC_OBESITE = 30;", "const MK_PLAFOND = 9999, IMC_OBESITE = 30;", 'rouge'),
    ('M11', 'le plafond de surplus de Helms 2023 saute',
     "const EA_MIN = 30, KCAL_PAR_KG = 7700, SURPLUS_MAX_PCT = 0.15;",
     "const EA_MIN = 30, KCAL_PAR_KG = 7700, SURPLUS_MAX_PCT = 0.90;", 'rouge'),
    ('M12', 'le plafond proteique de Helms (3,1 g/kg de masse maigre) saute',
     "const PROT_FFM_PLAFOND = 3.1;", "const PROT_FFM_PLAFOND = 99;", 'rouge'),
    ('M13', 'le plancher proteique de 1,4 g/kg de poids disparait',
     "const PROT_BW_PLANCHER = 1.4;", "const PROT_BW_PLANCHER = 0;", 'rouge'),
    ('M14', 'le plancher du metabolisme de repos disparait (le defaut que j avais moi-meme)',
     "    if (kcal < plancherRepos) { kcal = plancherRepos; sig.push('plancher_metabolisme_repos');",
     "    if (false) { kcal = plancherRepos; sig.push('plancher_metabolisme_repos');", 'rouge'),
    ('M15', 'le plancher lipidique dIraki disparait',
     "const LIP_GKG_MIN = 0.5, LIP_GKG_MAX = 1.5,", "const LIP_GKG_MIN = 0, LIP_GKG_MAX = 1.5,", 'rouge'),
    ('M16', 'le plafond lipidique dIraki disparait',
     "LIP_GKG_MAX = 1.5, LIP_PCT_MIN = 0.15,", "LIP_GKG_MAX = 99, LIP_PCT_MIN = 0.15,", 'rouge'),
    # ── l unite des proteines ────────────────────────────────────────────────────────────
    ('M17', 'l UNITE des proteines cesse de dependre de la situation',
     "  const enDeficit = (kcal < tdee - 50);", "  const enDeficit = false;", 'rouge'),
    ('M18', 'la modulation de Helms par la secheresse disparait',
     "    if (bf <= BF_SEC[sexe]) g += 0.5; else if (bf <= BF_MOYEN[sexe]) g += 0.2;", "", 'rouge'),
    # ── plausibilite et signaux ──────────────────────────────────────────────────────────
    ('M19', 'la bande glucidique cesse de dependre de la charge',
     "  if (s >= 6 || ser > 20) return BANDES_GLUC[3];", "  if (s >= 0) return BANDES_GLUC[0];", 'rouge'),
    ('M20', 'la plausibilite ne nomme plus la CAUSE',
     "  if (!causes.length && gluc > bande.max) causes.push('residu_energetique');",
     "  causes.length = 0;", 'ancre_ou_rouge'),
    ('M21', 'le moteur ne dit plus QUOI reexaminer',
     "  const aReexaminer = [];", "  const aReexaminer = []; if (true) return { kcal: kcalMacros, kcal_vise: kcal, prot_g, fat_g, carbs_g, signaux: sig, faisable, plausibilite: pl, a_reexaminer: [], tdee: T, explication: expl, vitesse: vit, ffm, bf, src_ffm: src, borne, unite_proteines: unite, conflit_manuel: conflitManuel };", 'rouge'),
    ('M22', 'la cible manuelle est FALSIFIEE en silence (le defaut de V8)',
     "    kcal = Math.round(p.manualKcal);\n    sig.push('cible_manuelle');",
     "    kcal = Math.max(Math.round(p.manualKcal), 1500);\n    sig.push('cible_manuelle');", 'rouge'),
    ('M23', 'le conflit de cible manuelle n est plus declare',
     "      conflitManuel = { demande: kcal, minimum_calculable: mini, ecart: mini - kcal,",
     "      conflitManuel = null; const _ignore = { demande: kcal, minimum_calculable: mini, ecart: mini - kcal,", 'rouge'),
    ('M24', 'une observation absurde n est plus rejetee',
     "  if (obs < est * 0.65 || obs > est * 1.35) {", "  if (false) {", 'rouge'),
    ('M25', 'la transition obesite redevient une MARCHE d escalier',
     "  const t = opts.mkPartout ? 0 : Math.max(0, Math.min(1, (imc - IMC_SURPOIDS) / (IMC_OBESITE - IMC_SURPOIDS)));",
     "  const t = opts.mkPartout ? 0 : (imc >= IMC_OBESITE ? 1 : 0);", 'rouge'),
    ('M26', 'la vitesse de perte redevient une marche d escalier',
     "      case 'perte': return bf <= sec ? -0.5 : (bf >= haut ? -1.0 : -(0.5 + 0.5 * (bf - sec) / (haut - sec)));",
     "      case 'perte': return -0.7;", 'rouge'),
    ('M27', 'la provenance de la masse maigre disparait',
     "           unite_proteines: unite, plafond_deficit: plafondDeficit, plafond_alpert: plafondAlpert,",
     "           unite_proteines: unite, src_ffm: 'estimee', plafond_deficit: plafondDeficit, plafond_alpert: plafondAlpert,", 'rouge'),
    ('M28', 'l explication disparait',
     "           plausibilite: pl, a_reexaminer: aReexaminer, tdee: T, explication: expl };",
     "           plausibilite: pl, a_reexaminer: aReexaminer, tdee: T, explication: [] };", 'rouge'),
    # ── doivent RESTER VERTES ────────────────────────────────────────────────────────────
    ('M29', 'commentaire seulement : les bornes citees (doit RESTER VERT)',
     "   [D] choix produit · [E] incertain, mesuré dans les deux sens. */",
     "   [D] choix produit · [E] incertain. 31 kcal 500 kcal 3.1 1.4 0.5 1.5 0.15 0.35 600 g. */", 'vert'),
    ('M30', 'commentaire seulement : la porte dapprentissage (doit RESTER VERT)',
     "   ⛔ ENTIÈREMENT DÉTERMINISTE. Aucune IA, aucun hasard, aucun réglage caché. */",
     "   ⛔ DETERMINISTE. porte poids 0.7 0.35 0.15 tdeeObserve penteKgParSemaine confiance. */", 'vert'),
    ('M31', 'commentaire seulement : Alpert et Murphy (doit RESTER VERT)',
     "   ⛔ V8 n'est pas détruite : elle reste dans `moteur_v8.js`, et le banc les compare.",
     "   ⛔ V8 reste dans moteur_v8.js. ALPERT_KCAL_PAR_KG_GRAS MK_PLAFOND IMC_OBESITE EA_MIN.", 'vert'),
]


def lancer(racine):
    try:
        r = subprocess.run(['node', 'tools/temoins_v9.js'], cwd=racine,
                           capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        return (None, 'TIMEOUT')
    m = re.search(r'(\d+) OK . (\d+) ROUGE', r.stdout)
    if not m:
        return (None, 'SORTIE ILLISIBLE: ' + (r.stderr.strip()[-220:] or r.stdout.strip()[-220:]))
    return (int(m.group(2)), None)


def main():
    print('=== CONTRÔLE NÉGATIF — MOTEUR V9 ===\n')
    print('① point de départ : l\'arbre SAIN doit rendre 0 témoin rouge')
    base, err = lancer(RACINE)
    if err or base != 0:
        print('  ⛔ ARRÊT : arbre sain à %r (%s). Un contrôle négatif dont le point de départ '
              'est faux ne prouve rien.' % (base, err))
        return 1
    print('  ✅ arbre sain : 0 rouge\n')

    original = open(os.path.join(RACINE, CIBLE), encoding='utf-8').read()
    conformes, ancres, echecs = 0, [], []

    with tempfile.TemporaryDirectory() as tmp:
        clone = os.path.join(tmp, 'arbre')
        print('② clonage de l\'arbre (⛔ on ne mute JAMAIS l\'arbre de travail)')
        subprocess.run(['git', 'clone', '--quiet', '--depth', '1', 'file://' + RACINE, clone],
                       check=True, capture_output=True)
        # ⛔ un clone git ne contient que ce qui est COMMITÉ : on recopie les fichiers de travail.
        for f in COPIES:
            dst = os.path.join(clone, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'w', encoding='utf-8').write(open(os.path.join(RACINE, f), encoding='utf-8').read())
        print('  ✅ cloné\n③ mutations\n')
        cible = os.path.join(clone, CIBLE)

        for mid, desc, vieux, neuf, attendu in MUTATIONS:
            n_occ = original.count(vieux)
            if n_occ != 1:
                if attendu == 'ancre_ou_rouge':
                    print('  ⚠️ %s ancre absente (%d) — mutation sans objet, comptée conforme : %s'
                          % (mid, n_occ, desc[:50]))
                    conformes += 1
                    continue
                ancres.append((mid, desc, n_occ))
                print('  ⛔ %s ANCRE %s (%d) — %s' % (mid, 'MORTE' if n_occ == 0 else 'NON UNIQUE', n_occ, desc))
                continue
            open(cible, 'w', encoding='utf-8').write(original.replace(vieux, neuf, 1))
            n, err = lancer(clone)
            if err:
                ok, verdict = False, 'PLANTAGE (%s)' % err
            elif attendu == 'vert':
                ok, verdict = (n == 0), '%d rouge(s)' % n
            else:
                ok, verdict = (n is not None and n > 0), '%d rouge(s)' % n
            print('  %s %s %-64s %s' % ('✅' if ok else '⛔', mid, desc[:64], verdict))
            if ok: conformes += 1
            else: echecs.append((mid, desc, verdict))
        open(cible, 'w', encoding='utf-8').write(original)

    print('\n=== BILAN : %d/%d conformes · %d ancre(s) morte(s) ===' % (conformes, len(MUTATIONS), len(ancres)))
    for mid, d, v in echecs: print('  ⛔ %s — %s → %s' % (mid, d, v))
    for mid, d, n in ancres: print('  ⛔ ancre %s — %s (%d occurrences)' % (mid, d, n))
    return 0 if (conformes == len(MUTATIONS) and not ancres) else 1


if __name__ == '__main__':
    sys.exit(main())
