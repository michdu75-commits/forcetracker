#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — RETOUR DE CLAUDE PRINCIPAL SUR LA MISSION SÉANCE (25/10/2026) : les témoins de la PASSE COMPLÈTE
réécrits ou rendus verts par la branche Séance savent-ils ROUGIR ?

La passe répartie sur l'arbre intégré a trouvé 4 rouges côté Séance, invisibles dans les bancs voisins (ils vivent dans
tests/parcours/runner.js) : XXXII (l'import cardio « Treadmill »), CCXXVI ter ×2 (une fixture que D-116 rendait
incohérente), B-CCCVI ⑥ (un témoin de SOURCE qui épinglait l'ancienne boucle de volume). Règle d'or #17 : un témoin
réécrit doit rougir sous mutation volontaire.

⛔ Le moteur n'est PAS recopié : copie de l'app, passe RÉDUITE aux blocs visés (tools/passe_reduite.js), réseau isolé,
lecture des ✅ / ❌ — ce sont les fonctions de tools/mut_temoins_v2.py, importées telles quelles (R2). L'arbre sain est
joué d'abord et doit être ENTIÈREMENT vert ; une mutation est conforme si CHACUN de ses témoins attendus rougit ; un
plantage n'est jamais « attrapé ». ⛔ Ne remplace jamais une passe complète (protocole D-031).
Usage : python3 tools/mut_seance_runner.py [PREFIXE[,PREFIXE...]]
"""
import os, re, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mut_temoins_v2 as M   # cloner · jouer · etat (le moteur commun)

LO, SE = 'log.js', 'setup.js'
BLOCS = {'XXXII': "XXXII. La montre depose", 'CCXXVIter': "CCXXVI ter. Le cardio se reconna", 'BCCCVI': "B-CCCVI. Constat C"}
M.B.update(BLOCS)   # `jouer` lit ses titres de blocs dans M.B

MUT = [
    # ① l'import cardio : « Treadmill Running » revient sur le barème « Tapis » (l'ancien choix de la branche) — des calories
    #    changées sans décision ; le témoin XXXII exige « course » (calculé comme « Autre », D-119).
    ('RP1 le tapis importe repart sur le bareme « Tapis » (calories changees sans decision)', ['XXXII'],
     [(SE, "  if(/march|walk|randonn|hik/.test(n))            return 'marche';\n",
           "  if(/tapis|treadmill/.test(n))                   return 'tapis';\n  if(/march|walk|randonn|hik/.test(n))            return 'marche';\n")],
     ['/!\\ un type inconnu tombe sur « autre », jamais sur un type devine']),
    # ② CCXXVI ter, fixture rendue cohérente : la carte de l'historique DIVISE le volume par deux (la famille de F02).
    #    ⚠️ Ce que la fixture ne distingue plus, exprès : « copie rangée » contre « séries » (elles disent 2560 toutes les
    #    deux) — c'est C-NUM-B5 / B6 (tests/parcours/seance_chiffres.js) qui gardent ce point de D-116.
    ('RP2 la carte de l\'historique divise le volume par deux', ['CCXXVIter'],
     [(SE, "parts.push('<span class=\"sess-vol2\">'+_volTravail(s)+' kg de travail</span>');",
           "parts.push('<span class=\"sess-vol2\">'+Math.round(_volTravail(s)/2)+' kg de travail</span>');")],
     ['⛔⛔ NON-RÉGRESSION — une muscu garde son muscle, son volume et ses exercices', '⭐ une muscu AVEC cardio garde ses exercices ET dit son cardio']),
    # ③ B-CCCVI ⑥ réécrit sur l'invariant (deux règles, deux propriétaires).
    #    a. « le volume appelle le propriétaire des records » : NUMÉRIQUEMENT NEUTRE (une charge ou des reps nulles ajoutent 0
    #       de toute façon) — c'est pourquoi seul un témoin de source peut la voir.
    ('RP3a [deguisee] _workVol emprunte la regle des records (numeriquement neutre)', ['BCCCVI'],
     [(LO, "      if(s.done&&(avecEchauffements||(s.type!=='É'&&s.type!=='W'))&&(s.kg||0)>0&&(s.reps||0)>0)v+=s.kg*s.reps*k;",
           "      if((avecEchauffements&&s.done&&(s.kg||0)>0&&(s.reps||0)>0)||_serieFaitFoiPourPR(s))v+=s.kg*s.reps*k;")],
     ['B-CCCVI ⑥ ⛔ PÉRIMÈTRE — la règle du VOLUME reste distincte de celle des records']),
    #    b. « Enregistrer » recopie la règle du volume au lieu d'appeler `_workVol` (l'ancien code, sans l'unilatéral).
    ('RP3b saveSessEdits recopie la regle du volume (l\'ancienne boucle)', ['BCCCVI'],
     [(SE, "  _sessEdits.volume=Math.round(_workVol(_sessEdits));",
           "  let vol=0; _sessEdits.exs.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')vol+=(s.kg||0)*(s.reps||0);})); _sessEdits.volume=vol;")],
     ['B-CCCVI ⑥ ⛔ PÉRIMÈTRE — la règle du VOLUME reste distincte de celle des records']),
    # négatif : un commentaire reformulé ne doit RIEN faire rougir
    ('RP4 [negatif] un commentaire de la carte est reformule', ['CCXXVIter'],
     [(SE, "// ⛔ « 0 kg » n'apprend rien sur un cardio, et laisse croire à une séance vide.",
           "// ⛔ « 0 kg » n'apprend rien sur un cardio : on croirait une séance vide.")],
     []),
]


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    blocs = sorted({b for m in choisies for b in m[1]}, key=list(BLOCS).index)
    tmp0, a0 = M.cloner()
    out, tot = M.jouer(a0, blocs)
    shutil.rmtree(tmp0, ignore_errors=True)
    sains = {lib: M.etat(out, tot, lib) for m in choisies for lib in m[3]}
    rouges_sains = [l.strip()[2:120] for l in out.split('\n') if re.match(r'^\s+❌', l)]
    nb = len([l for l in out.split('\n') if re.match(r'^\s*(✅|❌) ', l)])
    print('  arbre SAIN (blocs %s) : %d témoin(s) joué(s), %d rouge(s) ; attendus verts : %s' % (','.join(blocs), nb, len(rouges_sains), sains))
    if rouges_sains or not tot or any(v != 'vert' for v in sains.values()):
        print('  !! l\'arbre SAIN n\'est pas entièrement vert — contrôle refusé :', ' | '.join(rouges_sains) or 'PAS DE TOTAL'); return 1
    conformes = 0
    for nom, bl, edits, attendus in choisies:
        tmp, arbre = M.cloner()
        invalide = []
        for f, av, ap in edits:
            p = os.path.join(arbre, f); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1: invalide.append('%s x%d' % (f, s.count(av))); continue
            open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
        if invalide:
            print('  INVALIDE  %s (ancre : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        if subprocess.run(['node', '--check', os.path.join(arbre, edits[0][0])], capture_output=True).returncode:
            print('  INVALIDE  %s (syntaxe cassée)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        out, tot = M.jouer(arbre, bl)
        rouges = [l.strip()[2:110] for l in out.split('\n') if re.match(r'^\s+❌', l)]
        if attendus:
            res = {lib: M.etat(out, tot, lib) for lib in attendus}
            ok = tot and all(v == 'rouge' for v in res.values())
        else:   # [negatif] : rien ne doit rougir, et la passe réduite doit aller jusqu'au bout
            res = {'(aucun rouge attendu)': 'rouges : %d' % len(rouges)}
            ok = tot and not rouges
        conformes += bool(ok)
        print('  %s  %s\n        attendus : %s\n        rouges (%d) : %s' % ('OK ' if ok else '!! ', nom, res, len(rouges), ' | '.join(rouges[:4])), flush=True)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(choisies)))
    return 0 if conformes == len(choisies) else 1


if __name__ == '__main__':
    raise SystemExit(main())
