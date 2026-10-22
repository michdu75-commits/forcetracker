#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUTRITION V2, LE MOTEUR (jalon 2, 22/10/2026) : le banc tools/banc_nut2_moteur.js sait-il ROUGIR ?
Chaque mutation casse UNE garantie du contrat du 22/10, sur une COPIE de nutrition-v2.js (jamais le fichier du dépôt) ;
le banc la charge par NUT2_CIBLE et doit rougir, et sur le témoin attendu. Un plantage du banc (code 2, ou pas de ligne
de total) n'est jamais compté comme « attrapé ». L'arbre sain est rejoué avant ET après.
Usage : python3 tools/mut_nut2_moteur.py"""
import os, re, shutil, subprocess, sys, tempfile
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOTEUR = os.path.join(RACINE, 'nutrition-v2.js')
BANC = os.path.join(RACINE, 'tools', 'banc_nut2_moteur.js')

QTE_CALC = ("if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');\n"
            "    if (q.unite !== 'g' && q.unite !== 'ml' && q.unite !== 'portion') return ko('UNITE_INCONNUE', String(q.unite));\n"
            "    var out = {}")
QTE_ECR = ("if (!q || typeof q !== 'object' || !fini(q.val) || !(q.val > 0)) return ko('QUANTITE_INVALIDE');\n"
           "    if (q.unite !== 'g' && q.unite !== 'ml' && q.unite !== 'portion') return ko('UNITE_INCONNUE', String(q.unite));\n"
           "    /* ⛔ `ft-v1186`")
MUT = [
  ('MN1 calcul : une quantité 0 passe', QTE_CALC, QTE_CALC.replace('!(q.val > 0)', '!(q.val >= 0)'), 'B-NV2-C ⑫'),
  ('MN2 calcul : un champ absent devient 0',
   "if (c in lv.valeurs) out[c] = Math.round(masse * lv.valeurs[c] / 100); else manque.push(c);",
   "if (c in lv.valeurs) out[c] = Math.round(masse * lv.valeurs[c] / 100); else { out[c] = 0; manque.push(c); }", 'B-NV2-C ③'),
  ('MN3 calcul : arrondi par défaut au lieu de l\'arrondi de l\'app',
   "out[c] = Math.round(masse * lv.valeurs[c] / 100)", "out[c] = Math.floor(masse * lv.valeurs[c] / 100)", 'B-NV2-C ①'),
  ('MN4 calcul : « 1 ml = 1 g » (l\'unité n\'est plus vérifiée)', "if (u !== base) {", "if (u !== base && false) {", 'B-NV2-C ⑤'),
  ('MN5 écrivain : une portion SANS poids redevient une quantité (D-099)',
   "    if (q.unite === 'portion' && (!fini(q.portion.poids) || !(q.portion.poids > 0) ||\n        (q.portion.unite !== 'g' && q.portion.unite !== 'ml'))) return ko('PORTION_SANS_POIDS');\n",
   "\n", 'B-NV2-E ⑬b'),
  ('MN5b calcul : une fiche « par portion » est acceptée (D-099)',
   "    if (base !== 'g' && base !== 'ml') return ko('BASE_INCONNUE', String(base));\n    var lv = lireValeurs(fiche.p100);",
   "    if (base !== 'g' && base !== 'ml' && base !== 'portion') return ko('BASE_INCONNUE', String(base));\n    var lv = lireValeurs(base === 'portion' ? fiche.pourUne : fiche.p100);", 'B-NV2-C ⑩'),
  ('MN6 écrivain : une déclarée à 0 g passe', QTE_ECR, QTE_ECR.replace('!(q.val > 0)', '!(q.val >= 0)'), 'B-NV2-E ⑭'),
  ('MN7 écrivain : « 2 steaks » deviennent « 250 g »',
   "saisie: o.saisie, origine: o.origine, q: q.val, u: q.unite,",
   "saisie: o.saisie, origine: o.origine, q: (q.unite === 'portion' && q.portion && q.portion.poids ? q.val * q.portion.poids : q.val), "
   "u: (q.unite === 'portion' && q.portion && q.portion.poids ? q.portion.unite : q.unite),", 'B-NV2-E ⑧'),
  ('MN8 écrivain : une portion sans libellé passe',
   "if (q.unite === 'portion' && (!q.portion || !texte(q.portion.libelle))) return ko('PORTION_SANS_LIBELLE');",
   "if (q.unite === 'portion' && !q.portion) return ko('PORTION_SANS_LIBELLE');", 'B-NV2-E ⑨'),
  ('MN9 écrivain : la provenance prend une valeur par défaut',
   "if (!o || typeof o !== 'object' || !texte(o.saisie) || !texte(o.origine)) return ko('PROVENANCE_ABSENTE');",
   "o = o || {}; o = { saisie: o.saisie || 'manuel', origine: o.origine || 'utilisateur' };", 'B-NV2-E ⑤'),
  ('MN10 écrivain : un recalcul efface la correction à la main', "      finales[x.c] = x.v;\n", "\n", 'B-NV2-E ⑪'),
  ('MN11 écrivain : la correction devenue douteuse n\'est plus signalée',
   "n2.no.indexOf('correction-a-revoir') < 0) n2.no.push('correction-a-revoir');",
   "n2.no.indexOf('correction-a-revoir') < 0 && false) n2.no.push('correction-a-revoir');", 'B-NV2-E ⑪'),
  ('MN12 écrivain : une macro absente est écrite 0',
   "for (i = 0; i < CHAMPS.length; i++) { c = CHAMPS[i]; if (c in finales) L[c] = finales[c]; }",
   "for (i = 0; i < CHAMPS.length; i++) { c = CHAMPS[i]; L[c] = (c in finales) ? finales[c] : 0; }", 'B-NV2-E ④'),
  ('MN13 écrivain : `per100` est la fiche elle-même (pas une copie)',
   "L.per100 = lireValeurs(f.p100).valeurs;", "L.per100 = f.p100;", 'B-NV2-E ②'),
  ('MN14 adaptateur : une unité absente devient « g »',
   "vue.qteNotee = { val: l.q, unite: aU ? l.u : null };", "vue.qteNotee = { val: l.q, unite: aU ? l.u : 'g' };", 'B-NV2-A ⑤'),
  ('MN15 adaptateur : il écrit sur l\'ancienne ligne',
   "    var notes = [];\n    var vue = {", "    var notes = [];\n    l.n2 = { s: 1 };\n    var vue = {", 'B-NV2-A ①'),
  ('MN16 adaptateur : la vue partage la fiche de l\'ancienne ligne',
   "vue.ficheNotee = { p100: lv.valeurs, cle: vue.provenance.sourceId };",
   "vue.ficheNotee = { p100: l.per100, cle: vue.provenance.sourceId };", 'B-NV2-A ③'),
  ('MN17 adaptateur : un repas absent devient « déjeuner »',
   "repas: (typeof l.meal === 'string' && l.meal) ? l.meal : null,",
   "repas: (typeof l.meal === 'string' && l.meal) ? l.meal : 'dejeuner',", 'B-NV2-A ⑨'),
  ('MN18 adaptateur : une valeur illisible devient 0',
   "if (fini(x) && x >= 0) vue.valeurs[c] = x; else notes.push('valeur-illisible:' + c);",
   "if (fini(x) && x >= 0) vue.valeurs[c] = x; else { vue.valeurs[c] = 0; notes.push('valeur-illisible:' + c); }", 'B-NV2-A ⑩'),
  ('MN19 adaptateur : la tolérance de vérification s\'élargit (fiche arrondie de l\'époque acceptée)',
   "Math.abs(p[c] - ref[c]) > 0.05 + 1e-9", "Math.abs(p[c] - ref[c]) > 1", 'B-NV2-A ⑫'),
  ('MN20 adaptateur : une ligne illisible disparaît du journal',
   "for (var i = 0; i < liste.length; i++) vues.push(lireAncienne(liste[i], ctx));",
   "for (var i = 0; i < liste.length; i++) { var r = lireAncienne(liste[i], ctx); if (r.ok) vues.push(r); }", 'B-NV2-G ①'),
]

def banc(cible):
    env = dict(os.environ, NUT2_CIBLE=cible)
    p = subprocess.run(['node', BANC], capture_output=True, text=True, timeout=300, env=env, cwd=RACINE)
    sortie = p.stdout + p.stderr
    total = re.search(r'^(\d+) OK / (\d+) rouge$', sortie, re.M)
    rouges = re.findall(r'^  !!   (B-NV2-[A-Z] \S+)', sortie, re.M)
    return p.returncode, total, rouges, sortie

code, total, rouges, s = banc(MOTEUR)
print('  arbre sain : %s' % (total.group(0) if total else 'PAS DE TOTAL (code %d)' % code))
if code != 0 or not total or total.group(2) != '0': print(s[-2000:]); sys.exit(1)
conformes = 0
for nom, avant, apres, attendu in MUT:
    tmp = tempfile.mkdtemp(prefix='mutnut2_')
    copie = os.path.join(tmp, 'nutrition-v2.js')
    t = open(MOTEUR, encoding='utf-8').read()
    if t.count(avant) != 1:
        print('  INVALIDE %s — ancre trouvée %d fois' % (nom, t.count(avant))); shutil.rmtree(tmp); continue
    open(copie, 'w', encoding='utf-8').write(t.replace(avant, apres))
    if subprocess.run(['node', '--check', copie]).returncode != 0:
        print('  INVALIDE %s — syntaxe cassée' % nom); shutil.rmtree(tmp); continue
    code, total, rouges, s = banc(copie)
    shutil.rmtree(tmp)
    if code == 2 or not total:
        print('  KO   %s — PLANTAGE (ne compte pas comme attrapé)' % nom); continue
    bon = attendu in rouges and code == 1
    conformes += bon
    print('  %s %s — %d rouge(s), attendu %s : %s' % ('OK  ' if bon else 'KO  ', nom, len(rouges), attendu, ', '.join(rouges) or 'aucun'))
code, total, rouges, s = banc(MOTEUR)
print('  arbre sain rejoué à la fin : %s' % (total.group(0) if total else 'PAS DE TOTAL'))
print('%d/%d conformes' % (conformes, len(MUT)))
sys.exit(0 if conformes == len(MUT) and code == 0 and total and total.group(2) == '0' else 1)
