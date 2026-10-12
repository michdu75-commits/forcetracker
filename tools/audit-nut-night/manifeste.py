#!/usr/bin/env python3
"""AUDIT NUTRITION DE NUIT — MANIFESTE, relu depuis git et le registre (rien à la main). Usage : manifeste.py <sortie.json> <statut> <cv_declenchee 0|1> [chemin_drive]"""
import json, subprocess, sys, os
out, statut, cv = sys.argv[1], sys.argv[2], sys.argv[3] == '1'
drive = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else 'Force Tracker/Nutrition/AUDIT-NIGHT-2026-10-12/'
etat_cv = sys.argv[5] if len(sys.argv) > 5 else None   # état CONSTATÉ de la contre-vérification, jamais supposé
g = lambda *a: subprocess.run(['git', *a], capture_output=True, text=True, check=True).stdout.strip()
SRC = '7dd1b0051af290267d6f498bf96b8e32de885498'
diff = [f for f in g('diff', '--name-only', SRC, 'HEAD').split('\n') if f]
produit = [f for f in diff if not (f.startswith('tools/audit-nut-night/') or f.startswith('audit/nut-night-2026-10-12/') or f == 'docs/JOURNAL-DE-PARTAGE.md')]
reg = json.load(open('audit/nut-night-2026-10-12/REGISTRE-NUT-NIGHT.json', encoding='utf-8'))
E = reg['entrees']; cnt = lambda k, v: sum(1 for e in E if e[k] == v)
causes = sorted({e['famille_cause'].split(' ')[0] for e in E if e['gravite'] == 'P1'})
m = {
  'date': '2026-10-12', 'branche_source': 'claude/nut-food-variants-03', 'head_source': SRC, 'tree_source': g('rev-parse', SRC + '^{tree}'),
  'head_fonctionnel_source': g('rev-parse', 'ae2f950c'), 'tree_fonctionnel_source': g('rev-parse', 'ae2f950c^{tree}'),
  'branche_audit': 'claude/nut-night-audit-2026-10-12', 'head_audit': g('rev-parse', 'HEAD'), 'master_observe': g('rev-parse', 'origin/master'),
  'git_status_depart': 'propre (0 fichier modifié, vérifié 20:40 UTC)', 'git_status_fin': (g('status', '--porcelain') or 'propre'),
  'fichiers_produit_modifies': produit,
  'scripts_audit_crees': sorted({f for f in diff if f.startswith('tools/audit-nut-night/')} | {'tools/audit-nut-night/manifeste.py'}),
  'bancs_utilises': ['sondes d\'audit : sonde_machine.js (B1–B6), sonde_journal.js (20 scénarios réels), sonde_ciblee.js',
                     'référence VARIANTS-03 (HANDOFF) : food_variants 122/0, D-042 73, FS-01 44, FS-02 46, FS-03 39, FS-05 136, FS-05B 177, repas_actif 24, habitudes_alim 37 ; mutations 31/31 — non relancés (consigne)'],
  'sources_auditees': ['CIQUAL (data/ciqual.json, 3484 / 3341 proposables)', 'table d\'alias (632)', 'fast-food (123)', 'compléments (129 033, identification)',
                       'Open Food Facts recherche + code-barres (réponses FIGÉES)', 'journal « Déjà noté par toi »', 'parcours journal réel (ajout, modification, suppression, rechargement, autre jour)'],
  'nombre_requetes': 27997 + 60, 'nombre_aliments_inventories': 3484 + 123 + 632,
  'nombre_symptomes': reg['symptomes_bruts'], 'nombre_entrees_registre': len(E), 'nombre_causes': len(causes), 'causes_P1': causes,
  'nombre_P0': cnt('gravite', 'P0'), 'nombre_P1': cnt('gravite', 'P1'), 'nombre_P2': cnt('gravite', 'P2'), 'nombre_dettes': cnt('gravite', 'P3'),
  'lots_proposes': ['LOT-C', 'LOT-A', 'LOT-B'],
  'artefacts': ['MANIFEST-NUT-NIGHT.json', 'REGISTRE-NUT-NIGHT.json', 'RAPPORT-PRINCIPAL-NUT-NIGHT.md', 'REPRISE-DEMAIN.md',
                'PROMPT-NUT-LOT-A.md', 'PROMPT-NUT-LOT-B.md', 'PROMPT-NUT-LOT-C.md', 'preuves/ (légers sur Drive ; complets dans audit/nut-night-2026-10-12/preuves/ sur la branche)'],
  'chemin_drive': drive, 'contre_verification_declenchee': cv,
  'contre_verification': ({'session': 'Claude Nutrition (session cloud distincte)', 'branche_attendue': 'claude/nut-night-cv-2026-10-12',
                           'artefacts_attendus': ['CONTRE-VERIFICATION-NUTRITION-NIGHT.md', 'CONTRE-VERIFICATION-NUTRITION-NIGHT.json'],
                           'etat_constate': etat_cv} if cv else None),
  'synthese_croisee': 'SYNTHESE-CROISEE-NUT-NIGHT.md' if cv else None, 'statut_final': statut, 'pdf': 'aucun (consigne : pas de PDF cette nuit)'}
assert m['fichiers_produit_modifies'] == [], m['fichiers_produit_modifies']
json.dump(m, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); open(out, 'a').write('\n')
print(json.dumps({k: m[k] for k in ('head_audit', 'fichiers_produit_modifies', 'nombre_P0', 'nombre_P1', 'nombre_P2', 'nombre_dettes', 'nombre_causes', 'statut_final')}, ensure_ascii=False))
