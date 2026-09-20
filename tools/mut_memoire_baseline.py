#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF des GARDES de `tools/gen_memoire_baseline_pdf.py`.

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).

POURQUOI CE FICHIER EXISTE
    Le generateur ne se contente pas de mettre en page : il RECOMPTE chaque chiffre depuis
    le code servi et REFUSE de produire si un fait tombe. Or *un garde qui ne peut pas
    rougir ne protege rien* — il faut le voir echouer avant de lui faire confiance. Trois
    chiffres faux ont deja ete attrapes par des gardes de cette famille ; les miens.

    Les gardes de git (arbre propre, pas de divergence, nombre de commits) sont neutralises
    par FT_CONTROLE_NEGATIF=1 : un arbre clone n'a pas de `.git`, donc ils repondraient
    toujours la meme chose et ne mesureraient rien ici. ⛔ C'est une neutralisation
    DECLAREE, pas un contournement : ces gardes-la se verifient en conditions reelles,
    et ils l'ont fait (le generateur a refuse deux fois aujourd'hui, arbre sale puis
    divergence avec origin/master).

Usage : python3 mut_memoire_baseline.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_memoire_baseline_pdf.py'

MUT = [
    # ══ LES FAITS DU CHANTIER coachMemory ══════════════════════════════════════════════
    ('M01  le contrat reseau du Worker change (coachMemory cesse d etre une chaine)',
     'worker.js', "const memory = body.coachMemory || ''",
     "const memory = (body.coachMemory && body.coachMemory.t) || ''", 'REFUS'),

    ('M02  un statut `validated` apparait — l interdit central de l arbitrage',
     'state.js', "statut:'generated',", "statut:'validated',", 'REFUS'),

    ('M03  un SECOND site pose `legacy` (la regle perd son proprietaire unique)',
     'setup.js', "    const mm=raw.coachMemoryMeta||d.coachMemoryMeta||null;",
     "    if(!S.coachMemoryMeta) S.coachMemoryMeta={statut:'legacy'};\n"
     "    const mm=raw.coachMemoryMeta||d.coachMemoryMeta||null;", 'REFUS'),

    ('M04  le proprietaire de la regle disparait',
     'state.js', 'function _coachMemProvenance()', 'function _coachMemProvenanceX()', 'REFUS'),

    ('M05  le Worker ne renvoie plus le modele du resume',
     'worker.js', "_model: MODELE_RESUME", "_modele: MODELE_RESUME", 'REFUS'),

    ('M06  une cle de la fiche disparait (la forme annoncee devient fausse)',
     'state.js', "date:new Date().toISOString(), source:'summarizeCoach' };",
     "date:new Date().toISOString() };", 'REFUS'),

    ('M07  un temoin est retire : le compte 15/13 annonce devient faux',
     'tests/parcours/coach_memoire.js',
     "  t('B-CCCXLI ⑬ aucune erreur de page pendant toute la conduite',",
     "  t('B-CCCXLI-retire aucune erreur de page pendant toute la conduite',", 'REFUS'),

    ('M08  le bloc n est plus branche dans le runner (il ne tournerait jamais)',
     # [!!] ancre allongee : le nom apparait DEUX fois (ecran + source)
     'tests/parcours/runner.js', "require('./coach_memoire.js').source(t, ROOT, fs, path);",
     "require('./coach_memoire_absent.js').source(t, ROOT, fs, path);", 'REFUS'),

    ('M09  la donnee n est plus classee face a Milo (R4a)',
     'tests/donnees/donnees-milo.json', '"coachMemoryMeta"', '"coachMemoryMetaXX"', 'REFUS'),

    # ══ LE BANC ════════════════════════════════════════════════════════════════════════
    ('M10  le garde de quota du banc redevient perime',
     'tests/milo/eval.js', 'const QUOTA_JOUR = 150;', 'const QUOTA_JOUR = 45;', 'REFUS'),

    ('M11  le plafond de developpement change dans Code.js sans que le banc suive',
     'Code.js', 'var AI_MAX_DEV_ = 150;', 'var AI_MAX_DEV_ = 200;', 'REFUS'),

    ('M12  coach.js cesse de porter le meme chiffre (deux sources qui divergent)',
     'coach.js', '_EV_QUOTA_JOUR = 150', '_EV_QUOTA_JOUR = 120', 'REFUS'),

    ('M13  LE WORKFLOW PART SUR PUSH (il brulerait la facture sans qu on le demande)',
     '.github/workflows/banc-milo.yml', 'on:\n  workflow_dispatch:',
     'on:\n  push:\n    branches: [master]\n  workflow_dispatch:', 'REFUS'),

    ('M14  la confirmation a taper disparait du workflow',
     # [!!] ancre allongee : « LANCER » apparait TROIS fois dans le workflow
     '.github/workflows/banc-milo.yml',
     '!= "LANCER" ]; then', '!= "OKOK" ]; then', 'REFUS'),

    ('M15  le generateur de reference n exige plus une passe REELLE',
     'tools/gen_banc_reference.py', "R.get('mode') in ('reel', 'comparaison')",
     "R.get('mode') in ('reel', 'comparaison', 'blanc')", 'REFUS'),

    ('M16  le garde « aucune conversation publiee » disparait',
     'tools/gen_banc_reference.py', '\'"reply"\'', '\'"rep1y"\'', 'REFUS'),

    # ══ LA GOUVERNANCE MEMOIRE ═════════════════════════════════════════════════════════
    ('M17  la restitution ne dit plus que les 5 restent NON DECIDEES',
     'docs/DECISIONS-MEMOIRE-LONGUE.md', 'NON DÉCIDÉS', 'NON TRANCHÉS', 'REFUS'),

    # [!!] LE GARDE EST UN « OU » : il accepte l'une OU l'autre formulation. Muter une
    #      seule des deux le laisserait VERT — et le controle negatif aurait conclu a tort
    #      qu'il ne mord pas. Mesure : « sa numerotation n » est absente aujourd'hui, seule
    #      « N'EST PAS FIABLE » porte la garantie. C'est donc elle qu'on coupe.
    ('M18  CLAUDE.md ne met plus en garde contre la numerotation M',
     'CLAUDE.md', "N'EST PAS FIABLE", "N'EST PAS CERTAINE", 'REFUS'),

    ('M19  la trace « arbitrage Q3 (M12) » disparait de capacites-ia.js',
     'capacites-ia.js', 'arbitrage Q3 (M12)', 'arbitrage Q3', 'REFUS'),

    # ══ LES OBSERVATIONS ═══════════════════════════════════════════════════════════════
    ('M20  le QR tiers disparait d index.html : l observation devient perimee',
     'index.html', 'api.qrserver.com', 'api.qrserver.invalid', 'REFUS'),

    # ══ CONTROLES NEGATIFS — DOIVENT RESTER VERTS (le generateur PRODUIT) ══════════════
    # [*] Ils ne touchent que des COMMENTAIRES, en y citant les mots que les gardes
    #     cherchent. Sans eux, un garde qui lirait le fichier brut resterait vert pour
    #     toujours — et les commentaires de cette passe citent tout ce qui est cherche.
    ('[negatif] un COMMENTAIRE de state.js cite `validated` et `legacy`',
     'state.js', 'function _coachMemProvenance(){',
     "// on ne pose JAMAIS statut:'validated' ici ; seuls 'legacy' et 'generated' existent\n"
     'function _coachMemProvenance(){', 'PRODUIT'),

    ('[negatif] un COMMENTAIRE du workflow cite « push » et « schedule »',
     '.github/workflows/banc-milo.yml', 'on:\n  workflow_dispatch:',
     '# volontairement AUCUN declencheur push ni schedule : une passe coute de l argent\n'
     'on:\n  workflow_dispatch:', 'PRODUIT'),

    ('[negatif] un COMMENTAIRE d eval.js cite l ancien chiffre 45',
     'tests/milo/eval.js', 'const QUOTA_JOUR = 150;',
     '// avant : 45, un chiffre perime qui bloquait silencieusement la passe de 57\n'
     'const QUOTA_JOUR = 150;', 'PRODUIT'),
]


def main():
    conformes = 0
    env = dict(os.environ, FT_CONTROLE_NEGATIF='1')
    for nom, fich, avant, apres, attendu in MUT:
        tmp = tempfile.mkdtemp(prefix='base_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(SRC, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        n = src.count(avant)
        if n != 1:
            print('  INVALIDE  %-72s (ancre %s)'
                  % (nom, 'absente' if n == 0 else '%d fois' % n))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))

        e = dict(env, FT_ROOT=arbre)
        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, cwd=arbre, env=e, timeout=300)
        sortie = (r.stdout + r.stderr)
        # [!!] UNE ERREUR PYTHON N'EST PAS UN REFUS. Un garde qui « rougit » parce que le
        #      script a plante mesure mon code, pas le fait (BUGS.md §61).
        if 'GARDE ROUGE' in sortie:
            obtenu = 'REFUS'
        elif r.returncode == 0:
            obtenu = 'PRODUIT'
        else:
            obtenu = 'PLANTAGE'
        ok = (obtenu == attendu)
        conformes += ok
        motif = ''
        m = re.search(r'GARDE ROUGE \(#\d+\) - (.{0,52})', sortie)
        if m:
            motif = m.group(1)
        elif obtenu == 'PLANTAGE':
            motif = (sortie.strip().split('\n') or [''])[-1][:52]
        print('  %s  %-72s %-9s %s' % ('OK ' if ok else '!! ', nom, obtenu, motif))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
