#!/usr/bin/env python3
"""AUDIT NUTRITION DE NUIT (12/10/2026) — REGISTRE UNIQUE ET DÉDUPLIQUÉ. Outil d'audit, hors runtime.
Les entrées sont CURÉES (une par cause ou par famille de symptômes) ; les volumes et les exemples sont RELUS dans les sorties
des sondes, jamais recopiés à la main. Usage : python3 tools/audit-nut-night/registre.py <dossier analyse> <dossier journal> <sortie.json>"""
import json, os, sys
A, J, OUT = sys.argv[1:4]
S = json.load(open(os.path.join(A, 'symptomes.json'), encoding='utf-8'))
MET = json.load(open(os.path.join(A, 'metriques.json'), encoding='utf-8'))
ALS = json.load(open(os.path.join(A, 'alias_semantique.json'), encoding='utf-8'))
JR = {s['id']: s for s in json.load(open(os.path.join(J, 'journal.json'), encoding='utf-8'))['scenarios']}
n_type = lambda t: sum(1 for s in S if s['type'] == t)
req_type = lambda t, k=12: sorted({s['requete'] for s in S if s['type'] == t})[:k]
T = 'tools/audit-nut-night/'
SC = 'node ' + T + 'sonde_ciblee.js '
CHAMPS = ['id', 'titre', 'famille_cause', 'source', 'requete', 'online_offline', 'scenario', 'attendu', 'observe', 'gravite', 'statut',
          'reproductible', 'preuve', 'commande_ou_procedure_reproduction', 'fichiers_probablement_concernes', 'fonctions_probablement_concernees',
          'cause_probable', 'confiance_cause', 'cas_voisins', 'deja_connu', 'id_dette_connue_si_applicable', 'recommendation', 'lot_propose',
          'bloque_fermeture_nutrition']
R = []
def E(**k):
    e = {c: k.get(c) for c in CHAMPS}
    e.setdefault('deja_connu', False)
    for c in CHAMPS:
        if e[c] is None: e[c] = [] if c in ('cas_voisins', 'fichiers_probablement_concernes', 'fonctions_probablement_concernees') else ('' if c not in ('deja_connu', 'reproductible', 'bloque_fermeture_nutrition') else False)
    R.append(e)

alias_faux = [o for o in ALS['cas'] if o['cle'] in ('gruyere', 'lieu noir', 'pilon de poulet', 'pilons de poulet', 'riz semi-complet', 'pain aux cereales',
              'jambon de bayonne', 'jambon sec', 'lentilles blondes', 'pates semi-completes', 'haut de cuisse de poulet', 'beurre sale', 'riz thai')]

# ═══ P1 ═════════════════════════════════════════════════════════════════════════════════════════════════════
E(id='NIGHT-P-001', titre='« confiture » (et 3 variantes) met la CONFITURE DE LAIT (340 kcal, produit laitier) en 1ʳᵉ ligne',
  famille_cause='C-A alias : table générée sans contrôle sémantique', source='CIQUAL via table d\'alias (data/alias.json)',
  requete='confiture · confiture de fraise · confiture d\'abricot · confiture fruits rouges', online_offline='EN LIGNE seulement (alias chargé = état normal)',
  scenario='taper la requête dans « Ajouter un aliment »', attendu='une confiture de fruits (CIQUAL : 31024 fraise 248 kcal, 31037 abricot 246 kcal, 30999 aliment moyen 235 kcal)',
  observe='1ʳᵉ ligne « Confiture de lait » (31040, 340 kcal) pour les 4 clés ; « confiture fruits rouges » ne rend QUE cette ligne ; hors ligne, la bonne confiture est 1ʳᵉ',
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='preuves/sonde_ciblee.txt ; preuves/alias_semantique.json ; data/alias.json clés confiture*→31040',
  commande_ou_procedure_reproduction=SC + '"confiture" "confiture de fraise" "confiture d\'abricot" "confiture fruits rouges"',
  fichiers_probablement_concernes=['tools/alias.py (CORRECTIONS)', 'data/alias.json (régénéré, jamais à la main)'],
  fonctions_probablement_concernees=['_aliasCible (app.js) — inchangée', 'tools/alias.py : CORRECTIONS / contrôle de génération'],
  cause_probable='la table d\'alias V2 (GPT) a été vérifiée sur les CODES et les MACROS (0 écart), jamais sur le SENS : « confiture » a été rapprochée du seul nom court qui contient le mot',
  confiance_cause='haute', cas_voisins=['NIGHT-P-002', 'NIGHT-P-003'], recommendation='corriger les 4 clés dans CORRECTIONS (fraise→31024, abricot→31037, générique→30999 ou 31006 : choix produit), ajouter un contrôle sémantique au générateur',
  lot_propose='LOT-A', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-002', titre='Alias qui contournent l\'aliment NOMMÉ alors qu\'il existe dans CIQUAL (gruyère→emmental, lieu noir→lieu d\'Alaska, pilon→cuisse…)',
  famille_cause='C-A alias : table générée sans contrôle sémantique', source='CIQUAL via table d\'alias',
  requete='gruyère · lieu noir · pilon(s) de poulet · riz semi-complet · pain aux céréales · jambon de Bayonne · jambon sec · lentilles blondes · pâtes semi-complètes · haut de cuisse de poulet · beurre salé · riz thaï',
  online_offline='EN LIGNE seulement — hors ligne l\'aliment exact sort 1ᵉʳ', scenario='taper la requête', attendu='l\'aliment nommé, qui existe (ex. 12114 Gruyère 408 kcal, 26134 Lieu noir cru 82, 36022 Poulet pilon cru 155, 9113 Riz semi-complet cuit 165, 7255 Pain aux céréales 269)',
  observe='; '.join('%s → %s (%s kcal)' % (o['cle'], o['cible'][1], o['cible'][2]) for o in alias_faux),
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='preuves/alias_semantique.json (%d clés dont la cible ne porte pas tous les mots alors qu\'un aliment les porte tous) ; preuves/sonde_ciblee.txt' % ALS['dont_un_autre_aliment_les_porte_tous'],
  commande_ou_procedure_reproduction='python3 ' + T + 'alias_semantique.py out.json ; ' + SC + '"gruyère" "lieu noir" "pilon de poulet" "riz semi-complet" "pain aux céréales"',
  fichiers_probablement_concernes=['tools/alias.py', 'data/alias.json (régénéré)'], fonctions_probablement_concernees=['tools/alias.py CORRECTIONS + contrôle de génération'],
  cause_probable='même cause que NIGHT-P-001 ; écarts de 5 à 36 % sur les kcal (pilon 155 vs cuisse 114)', confiance_cause='haute', cas_voisins=['NIGHT-P-001', 'NIGHT-P-027'],
  recommendation='corriger les clés sans ambiguïté ; garder un contrôle de génération qui IMPRIME toute clé dont la cible ne porte pas les mots quand un aliment les porte (liste blanche explicite pour les traductions voulues : lait d\'amande→boisson, patate, spaghetti, burger…)',
  lot_propose='LOT-A', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-003', titre='Fast-food Quick : 5 groupes de produits DIFFÉRENTS portant exactement les mêmes valeurs — « Dosette salade fromage blanc ciboulette » à 576 kcal',
  famille_cause='C-A table générée sans contrôle sémantique (fast-food)', source='data/marques.json ← data/sources/Base_Fast_Food_France_Force_Tracker_2.xlsx',
  requete='dosette salade · grande frites supplément sauce ranch / teriyaki / sriracha / ranch fusion / poivre intense', online_offline='en et hors ligne (fichier local)',
  scenario='proposition « FAST-FOOD (SOURCES OFFICIELLES) » → choix → portion publiée', attendu='des valeurs propres à chaque produit, ou un doute affiché',
  observe='la dosette porte les valeurs de « Grande Rustiques » (254,9 kcal/100 g, portion 226 g = 576 kcal, catégorie « Burger » dans le classeur) ; « …Sauce Ranch » = « Petite Frite » (portion 65 g pour une GRANDE frite) ; 4 autres copies ; doute affiché sur 1 seule ligne sur 11',
  gravite='P1', statut='DONNEE_SOURCE_SUSPECTE', reproductible=True, preuve='preuves/marques_doublons.txt ; le classeur source porte déjà la dosette à 576 kcal (ligne 86 « Base nutrition »)',
  commande_ou_procedure_reproduction='python3 ' + T + 'marques_doublons.py', fichiers_probablement_concernes=['tools/marques.py', 'data/marques.json (régénéré)'],
  fonctions_probablement_concernees=['tools/marques.py : contrôles de cohérence (le doute « mêmes poids » existe déjà)'],
  cause_probable='décalage nom ↔ valeurs dans le classeur (déjà vu en ft-v1114 sur le bloc Quick) ; aucun contrôle « valeurs identiques entre produits différents »',
  confiance_cause='haute', cas_voisins=['NIGHT-P-021'], deja_connu=False,
  recommendation='Michel décide : marquer ces lignes en DOUTE (mécanisme existant, décision ft-v1114 « tout mettre et marquer le doute ») ou les retirer ; ajouter le contrôle au générateur ; vérifier la PDF officielle Quick (injoignable d\'ici, 403)',
  lot_propose='LOT-A', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-004', titre='Une QUANTITÉ tapée dans la recherche vide la liste (« riz 100g », « poulet 200g », « riz cuit 150 g », « lait 250ml »)',
  famille_cause='C-B normalisation de la requête : nombres / unités / ponctuation', source='CIQUAL, fast-food, journal (même découpage `_afMots`)',
  requete=', '.join(req_type('UNITE_DANS_REQUETE', 20)), online_offline='en ET hors ligne', scenario='taper l\'aliment suivi (ou précédé) de sa quantité',
  attendu='l\'aliment (la quantité se règle dans le champ quantité)', observe='%d requêtes sur 20 ne rendent RIEN ; « 2 oeufs » rend « Oeufs au lait, rayon frais » (un dessert)' % (n_type('UNITE_DANS_REQUETE') // 2),
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='b4_adversarial.json (UNITES) ; preuves/sonde_ciblee.txt',
  commande_ou_procedure_reproduction=SC + '"riz 100g" "poulet 200g" "200 g poulet" "riz cuit 150 g" "lait 250ml" "30g de whey" "2 oeufs"',
  fichiers_probablement_concernes=['app.js'], fonctions_probablement_concernees=['_afMots (propriétaire unique du découpage, R2)', '_afNorm', '_fsIntention (si l\'intention lit les mots)'],
  cause_probable='`_afMots` garde « 100g », « 200 », « 250ml », « x2 » comme des mots EXIGÉS du nom ; un nombre seul d\'un caractère est jeté (« 2 »)', confiance_cause='haute',
  cas_voisins=['NIGHT-P-005', 'NIGHT-P-006'], recommendation='retirer de la RECHERCHE les jetons de quantité (nombre seul, nombre+unité g/kg/ml/cl/l, xN) ; reporter ou non la quantité dans le champ = DÉCISION de Michel (D2)',
  lot_propose='LOT-B', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-005', titre='« coca 0 » propose le COLA SUCRÉ en tête (le « 0 » d\'un caractère est jeté) ; « vitamine c » = « vitamine d »',
  famille_cause='C-B normalisation de la requête : nombres / unités / ponctuation', source='CIQUAL (+ compléments)', requete='coca 0 · vitamine c · omega 3',
  online_offline='en et hors ligne', scenario='taper la requête', attendu='« coca 0 » : la version sans sucres (V03 a traité « zéro / zero », pas « 0 »)',
  observe='« coca 0 » → Cola, sucré (40 kcal/100 ml) puis sucré sans caféine ; le sans sucres (1 kcal) en 4ᵉ ; 33 cl : 132 kcal au lieu de 3',
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='preuves/sonde_ciblee.txt', commande_ou_procedure_reproduction=SC + '"coca 0" "vitamine c"',
  fichiers_probablement_concernes=['app.js'], fonctions_probablement_concernees=['_afMots (filtre m.length>1)', 'FOOD_SYNONYMES (« zero »)'],
  cause_probable='`_afMots` jette tout mot d\'une lettre ; « 0 » n\'atteint pas le synonyme « zero » de V03', confiance_cause='haute', cas_voisins=['NIGHT-P-004'],
  recommendation='traiter « 0 » isolé comme « zéro » (même table que V03, aucune nouvelle logique) dans le même lot que les quantités', lot_propose='LOT-B', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-006', titre='Un POINT final (« pain complet. », « riz. ») vide la liste — iOS l\'insère sur double espace',
  famille_cause='C-B normalisation de la requête : nombres / unités / ponctuation', source='CIQUAL, fast-food, journal', requete='pain complet. · riz.',
  online_offline='en et hors ligne', scenario='taper la requête terminée par un point', attendu='même liste que sans le point', observe='aucun résultat',
  gravite='P2', statut='BUG_CONFIRME', reproductible=True, preuve='preuves/sonde_ciblee.txt ; b4 PAIRES « pain complet ⇄ pain complet. »',
  commande_ou_procedure_reproduction=SC + '"pain complet." "riz."', fichiers_probablement_concernes=['app.js'], fonctions_probablement_concernees=['_afNorm (classe de ponctuation sans « . »)'],
  cause_probable='`_afNorm` remplace , ; : ! ? par un espace mais pas « . » (gardé pour les décimales « 1.5 »)', confiance_cause='haute', cas_voisins=['NIGHT-P-004'],
  recommendation='retirer « . » quand il n\'est pas entre deux chiffres', lot_propose='LOT-B', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-007', titre='Garde « Combien en as-tu mangé ? » contournable : quantité tapée puis vidée / 0 / texte → la ligne s\'enregistre avec les valeurs POUR 100 g',
  famille_cause='C-C garde de quantité fondée sur un drapeau d\'interaction', source='toutes les sources qui posent `_bcNutr` (CIQUAL, fast-food, OFF, scan, reprise)',
  requete='big mac (portion 232 g) · riz blanc cuit', online_offline='indépendant', scenario='choisir l\'aliment → taper « 5 » puis effacer (ou « 0 », ou « abc ») → Ajouter',
  attendu='refus (comme quand on ne touche pas au champ)', observe='; '.join('%s : %s' % (k, json.dumps(JR[k]['observe'], ensure_ascii=False)[:110]) for k in ('J4b', 'J4c', 'J4e') if k in JR),
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='journal.json J4b/J4c/J4d/J4e', commande_ou_procedure_reproduction='node ' + T + 'sonde_journal.js out (scénarios J4b → J4e)',
  fichiers_probablement_concernes=['app.js', 'index.html (oninput de #af-bc-grams)'], fonctions_probablement_concernees=['addFoodEntry (garde _bcQtyPose)', '_qtyRescale (repli sur la référence 100 g)', '_bcApplyGrams'],
  cause_probable='la garde lit `_bcQtyPose` (« le champ a été touché ») et non la VALIDITÉ de la quantité ; un champ vide/0 retombe sur la référence 100 g', confiance_cause='haute',
  cas_voisins=['NIGHT-P-008'], deja_connu=False, recommendation='refuser à l\'ajout quand la quantité lue est ≤ 0 ou illisible (sans toucher au repli d\'AFFICHAGE de `_qtyRescale`, décidé)',
  lot_propose='LOT-C', bloque_fermeture_nutrition=True)
E(id='NIGHT-P-008', titre='« Modifier » : vider le champ grammes (ou 0) ÉCRASE une ligne existante — 250 g / 388 kcal devient 155 kcal avec q = 0',
  famille_cause='C-C garde de quantité fondée sur un drapeau d\'interaction', source='journal (écran Modifier)', requete='riz blanc cuit 250 g',
  online_offline='indépendant', scenario='ajouter 250 g → Modifier → effacer le champ grammes (ou 0) → Enregistrer', attendu='refus, ou ligne inchangée',
  observe='; '.join('%s : %s' % (k, json.dumps(JR[k]['observe'], ensure_ascii=False)) for k in ('J4f', 'J4g') if k in JR),
  gravite='P1', statut='BUG_CONFIRME', reproductible=True, preuve='journal.json J4f/J4g ; preuves/edit_grammes_vide.txt', commande_ou_procedure_reproduction='node ' + T + 'sonde_journal.js out (scénarios J4f, J4g)',
  fichiers_probablement_concernes=['app.js'], fonctions_probablement_concernees=['saveEditFood (`e.q=numFR(gEl.value)||0`)', '_efApplyGrams', '_qtyRescale'],
  cause_probable='la porte JUMELLE de NIGHT-P-007 (R8) : saveEditFood écrit q = 0 et recopie les champs repliés sur 100 g', confiance_cause='haute', cas_voisins=['NIGHT-P-007'],
  recommendation='même règle aux deux portes : une quantité ≤ 0 ou illisible ne s\'enregistre pas', lot_propose='LOT-C', bloque_fermeture_nutrition=True)

# ═══ P2 ═════════════════════════════════════════════════════════════════════════════════════════════════════
E(id='NIGHT-P-009', titre='Une macro « non déterminée » dans CIQUAL (affichée « ? » dans la liste) est ENREGISTRÉE à 0 au journal',
  famille_cause='C-D absence de valeur convertie en zéro', source='CIQUAL (18 aliments proposables : merguez, saucisses fumées, diots, purée de marrons…)',
  requete='merguez crue → « Merguez crue (aliment moyen) »', online_offline='indépendant', scenario='choisir l\'aliment → 100 g → Ajouter',
  attendu='glucides INCONNUS (pas 0), ou une mention', observe=json.dumps(JR.get('J3', {}).get('observe'), ensure_ascii=False)[:260],
  gravite='P2', statut='DECISION_PRODUIT', reproductible=True, preuve='journal.json J3 ; data/ciqual.json (13 G, 4 P, 2 L nuls sur 3341)',
  commande_ou_procedure_reproduction='node ' + T + 'sonde_journal.js out (J3)', fichiers_probablement_concernes=['app.js'],
  fonctions_probablement_concernees=['_ref100 / _per100d1 (null → 0)', '_afSuggPrendreCiqual'], cause_probable='la normalisation transforme null en 0 ; la présence est mesurée pour le résolveur mais pas conservée dans la ligne',
  confiance_cause='haute', deja_connu=False, recommendation='DÉCISION D3 : comment représenter « inconnu » dans une ligne (null + mention, ou 0 + drapeau) ; impact faible (glucides des charcuteries)',
  lot_propose='DETTE (après décision D3)', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-010', titre='Mots courants sans équivalent local : nutella, popcorn (écrit « pop-corn » dans CIQUAL), granola',
  famille_cause='C-E vocabulaire', source='CIQUAL', requete='nutella · popcorn · granola', online_offline='en et hors ligne (Open Food Facts en ligne rend des marques)',
  scenario='taper le mot', attendu='« Pâte à tartiner chocolat et noisette » ; « Pop-corn ou maïs éclaté » ; un muesli croustillant', observe='aucun résultat CIQUAL',
  gravite='P2', statut='BUG_CONFIRME', reproductible=True, preuve='b4_adversarial.json MOTS_SEULS ; preuves/sonde_ciblee.txt', commande_ou_procedure_reproduction=SC + '"nutella" "popcorn" "granola"',
  fichiers_probablement_concernes=['tools/alias.py (AJOUTS)', 'app.js FOOD_SYNONYMES'], fonctions_probablement_concernees=['_aliasCible', '_foodSynonymes'],
  cause_probable='vocabulaire courant absent de la table d\'alias', confiance_cause='haute', recommendation='3 alias (choix des cibles : Michel pour « granola »)', lot_propose='LOT-A (optionnel)', bloque_fermeture_nutrition=False)

# ═══ P3 / DETTES / SOURCES ════════════════════════════════════════════════════════════════════════════════════
E(id='NIGHT-P-011', titre='Aliments absents de CIQUAL : whey, ricotta, skyr (hors ligne), tacos', famille_cause='SOURCE', source='CIQUAL', requete='whey · ricotta · skyr · tacos',
  online_offline='hors ligne vide ; en ligne Open Food Facts', attendu='—', observe='aucun résultat local', gravite='P3', statut='DONNEE_ABSENTE', reproductible=True,
  preuve='b4_adversarial.json', commande_ou_procedure_reproduction=SC + '"whey" "ricotta" "tacos"', cause_probable='la table nationale ne les porte pas (liste déjà écrite en ft-v1115)',
  confiance_cause='haute', deja_connu=True, id_dette_connue_si_applicable='ft-v1115 (58 mots hors CIQUAL)', recommendation='rien : le moteur ne fabrique pas la donnée', lot_propose='—', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-012', titre='Fautes de frappe non tolérées (%d sur 20 ne rendent rien : yaourht, poullet, croisant, mozarella…)' % n_type('FAUTE_NON_TOLEREE'),
  famille_cause='C-E vocabulaire / tolérance', source='toutes', requete=', '.join(req_type('FAUTE_NON_TOLEREE', 20)), online_offline='en et hors ligne', attendu='une proposition proche',
  observe='aucun résultat', gravite='P3', statut='DECISION_PRODUIT', reproductible=True, preuve='b4_adversarial.json FAUTES', commande_ou_procedure_reproduction=SC + '"yaourht" "poullet" "croisant"',
  cause_probable='pas de recherche approchée (choix d\'architecture, pas un oubli)', confiance_cause='haute', recommendation='dette : un moteur approché est un chantier, pas un correctif', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-013', titre='Variantes d\'écriture qui ne rendent rien ou autre chose : choufleur, cacahouète, yoghourt, pomme-de-terre, « lait demiecreme », « jus d orange », « l\'huile d\'olive »',
  famille_cause='C-B / C-E normalisation et vocabulaire', source='CIQUAL', requete='voir observe', online_offline='en et hors ligne', attendu='même résultat que l\'écriture standard',
  observe='; '.join(s['requete'] + ' (' + s['mode'] + ')' for s in S if s['type'] == 'PAIRE_DIVERGE' and any(x in s['requete'] for x in ('choufleur', 'cacahou', 'yoghourt', 'pomme-de-terre', 'demiecreme', 'jus d orange', "l'huile")))[:600],
  gravite='P3', statut='BUG_CONFIRME', reproductible=True, preuve='b4_adversarial.json PAIRES', commande_ou_procedure_reproduction=SC + '"choufleur" "pomme-de-terre" "jus d orange"',
  cause_probable='le trait d\'union n\'est pas un séparateur à la recherche ; orthographes alternatives sans synonyme ; article élidé « l\' » recollé au mot', confiance_cause='moyenne',
  recommendation='dette (le trait d\'union peut rejoindre LOT-B si le coût est nul)', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-014', titre='Premier usage HORS LIGNE (table d\'alias jamais chargée) : skyr, latte, yogourt, lait d\'amande vides ; « jambon blanc » → jambon de DINDE ; « oeufs » → œufs au lait (dessert)',
  famille_cause='online/offline', source='CIQUAL sans alias', requete='skyr · latte · yogourt · lait d\'amande · jambon blanc · oeufs · filet de saumon', online_offline='HORS LIGNE seulement',
  attendu='le même aliment qu\'en ligne', observe='voir b4 (mode hors)', gravite='P3', statut='BUG_CONFIRME', reproductible=True, preuve='b4_adversarial.json ; preuves/sonde_ciblee.txt',
  commande_ou_procedure_reproduction=SC + '"jambon blanc" "oeufs" "filet de saumon"', cause_probable='la table d\'alias est un fichier chargé au premier besoin ; le service worker le garde ensuite — l\'écart ne touche que le tout premier usage hors ligne',
  confiance_cause='moyenne', deja_connu=True, id_dette_connue_si_applicable='FS-01 (« un échec reste non bloquant : la liste sort sans alias »)', recommendation='dette', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-015', titre='Pluriels sans alias : « steaks hachés », « yaourts nature », « lentille / lentilles » donnent une autre 1ʳᵉ ligne que le singulier (en ligne)',
  famille_cause='C-A alias (couverture des pluriels)', source='CIQUAL + alias', requete='steaks hachés · yaourts nature · lentille', online_offline='EN LIGNE',
  attendu='même 1ʳᵉ ligne', observe='voir b4 PAIRES', gravite='P3', statut='BUG_CONFIRME', reproductible=True, preuve='b4_adversarial.json', commande_ou_procedure_reproduction=SC + '"steak haché" "steaks hachés"',
  cause_probable='l\'alias porte sur la requête ENTIÈRE ; le pluriel n\'est pas une clé', confiance_cause='haute', deja_connu=True, id_dette_connue_si_applicable='D-061 (pluriel « viandes hachées » non traité)',
  recommendation='dette (ou clés plurielles dans LOT-A si le générateur les produit sans risque)', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-016', titre='Compléments (identification seule) : coupure à 400 correspondances + mot d\'1 lettre jeté → « vitamine c » propose « Vitamine E » en 1ᵉʳ',
  famille_cause='classement / C-B', source='data/complalim.json (129 033 lignes, sans valeurs nutritionnelles)', requete='vitamine c · vitamine d · omega 3 · whey',
  online_offline='en et hors ligne', attendu='le complément nommé', observe=json.dumps([s['observe'] for s in S if s['type'] == 'COMPLEMENTS_COUPURE_400'][:2], ensure_ascii=False)[:300],
  gravite='P3', statut='BUG_CONFIRME', reproductible=True, preuve='b6_sources.json', commande_ou_procedure_reproduction='voir sonde_machine.js bloc B6',
  fichiers_probablement_concernes=['app.js'], fonctions_probablement_concernees=['_complChercher (`if(out.length>400) break` AVANT le tri — le défaut que FS-01 a retiré de CIQUAL)', '_afMots'],
  cause_probable='la coupure garde les 400 PREMIERS du fichier puis trie ; aucune valeur nutritionnelle n\'en dépend', confiance_cause='haute', recommendation='dette (hors parcours nutritionnel)', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-017', titre='Fast-food : le nom exact n\'est pas 1ᵉʳ quand plusieurs enseignes ont des noms voisins (« grande frites » → KFC avant Quick)',
  famille_cause='classement fast-food', source='data/marques.json', requete='grande frites · moyenne frites', online_offline='en et hors ligne', attendu='« Grande Frites · Quick » trouvable par son nom',
  observe='la limite de 4 lignes est prise par les « Grande(s) Frite(s) » des autres enseignes ; « grande frites quick » le trouve', gravite='P3', statut='BUG_CONFIRME', reproductible=True,
  preuve='b6_sources.json ; preuves/sonde_ciblee.txt', commande_ou_procedure_reproduction=SC + '"grande frites" "grande frites quick"', cause_probable='plafond de 4 lignes fast-food (décidé) + singulier/pluriel',
  confiance_cause='haute', recommendation='dette (taper l\'enseigne suffit)', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-018', titre='Fast-food : kcal publiées ≠ macros (> 15 %) sans doute affiché sur 3 lignes à faibles calories (salades, dosette balsamique, tomates cerises)',
  famille_cause='SOURCE', source='data/marques.json', requete='salade qréative · dosette salade vinaigre balsamique · tomates cerises', online_offline='—', attendu='—',
  observe=json.dumps([s['observe'] for s in S if s['type'] == 'FASTFOOD_KCAL_VS_MACROS'][:4], ensure_ascii=False)[:400], gravite='P3', statut='DONNEE_SOURCE_SUSPECTE', reproductible=True,
  preuve='b6_sources.json', commande_ou_procedure_reproduction='voir sonde_machine.js bloc B6', cause_probable='fibres / acides / arrondis de la source sur de petites valeurs', confiance_cause='moyenne',
  recommendation='rien, ou doute si LOT-A ajoute un contrôle', lot_propose='DETTE', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-019', titre='« Dernier mot partiel » : un mot seul touche l\'intérieur d\'un autre (roquette→croquette, oseille→groseille, gin→aubergine, raie→« vraie daurade », lin→blinis, gari→margarine, cola→chocolat)',
  famille_cause='sous-chaîne (dernier mot)', source='CIQUAL', requete=', '.join(sorted({s['requete'] for s in S if s['type'] in ('FAUX_AMI', 'FAUX_AMI_MOT_COURANT') and s['mode'] == 'hors' and not s.get('top1_faux')})[:12]),
  online_offline='en et hors ligne', attendu='le vrai aliment 1ᵉʳ', observe='le vrai aliment reste 1ᵉʳ ; le faux ami apparaît plus bas dans la liste', gravite='P3', statut='DETTE_CONNUE', reproductible=True,
  preuve='b2_tetes.json / b4_adversarial.json (FAUX_AMI, mode hors, top1 non faux)', commande_ou_procedure_reproduction=SC + '"roquette" "oseille" "gin"',
  cause_probable='le dernier mot reste une frappe partielle (on est peut-être en train de le taper)', confiance_cause='haute', deja_connu=True, id_dette_connue_si_applicable='D-061 ② / VARIANTS-03 (« cola » seul)',
  recommendation='rien : décision de VARIANTS-03', lot_propose='—', bloque_fermeture_nutrition=False)
for i, (t, d_, ref) in enumerate([
    ('« steak haché » sans précision, hors ligne : crus seulement', 'FV-164', 'D-061 ④'),
    ('« viande hachée » sans précision, en et hors ligne : crus seulement', 'FV-165', 'D-061 ④'),
    ('« light » interprété « édulcorants »', 'VARIANTS-03', 'D-061'),
    ('crème fraîche : crèmes d\'Isigny et UHT exclues ; « crème entière » : aucun taux choisi', 'FV-067', 'D-060 / D-061 ③'),
    ('FS-05 / FR-119 « crème fraîche » affiche « LIMITE LEVÉE » (à reclasser, pas un rouge)', 'FR-119', 'VARIANTS-03')]):
    E(id='NIGHT-P-02%d' % i, titre=t, famille_cause='dette connue', source='CIQUAL', requete='—', online_offline='—', attendu='—', observe='inchangé, conforme à la dette nommée', gravite='P3',
      statut='DETTE_CONNUE', reproductible=True, preuve='HANDOFF-NUT-FOOD-VARIANTS-03.json', commande_ou_procedure_reproduction='node tools/banc_food_variants.js',
      cause_probable='voir la dette', confiance_cause='haute', deja_connu=True, id_dette_connue_si_applicable=d_ + ' / ' + ref, recommendation='ne pas rouvrir', lot_propose='—', bloque_fermeture_nutrition=False)
E(id='NIGHT-P-027', titre='Alias DISCUTABLES (pas des erreurs nettes) : blanc de poulet / de dinde → filet cru (ou tranche de charcuterie ?), pomme de terre vapeur → aliment moyen cuit (ou « vapeur sous vide » 76 kcal ?), laitue / batavia / feuille de chêne → « salade verte » (l\'exact existe), tradition → pain blanc',
  famille_cause='C-A alias', source='CIQUAL via alias', requete='blanc de poulet · blanc de dinde · pomme de terre vapeur · laitue · batavia · feuille de chêne · tradition', online_offline='EN LIGNE',
  attendu='décision de Michel', observe='voir preuves/alias_semantique.json', gravite='P2', statut='DECISION_PRODUIT', reproductible=True, preuve='preuves/alias_semantique.json',
  commande_ou_procedure_reproduction='python3 ' + T + 'alias_semantique.py out.json', cause_probable='traductions voulues ou approximations : le sens n\'est pas tranchable par le code',
  confiance_cause='moyenne', recommendation='DÉCISION D1 (liste courte dans REPRISE-DEMAIN) avant LOT-A', lot_propose='LOT-A (après décision)', bloque_fermeture_nutrition=False)

# ═══ PASS (couverture) ═══════════════════════════════════════════════════════════════════════════════════════
E(id='NIGHT-P-030', titre='Chaque aliment CIQUAL proposable (%d) se retrouve par son nom entier, en ligne ET hors ligne' % MET['b1_total_proposables'],
  famille_cause='accessibilité', source='CIQUAL', requete='3341 noms', online_offline='les deux', attendu='trouvé dans les 6 lignes', observe='%d introuvables ; mots nécessaires : %s' % (MET['b1_nom_entier_introuvable'], json.dumps(MET['b1_mots_necessaires'])),
  gravite='—', statut='PASS', reproductible=True, preuve='b1_accessibilite.json', commande_ou_procedure_reproduction='node ' + T + 'sonde_machine.js out', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-031', titre='Variantes : aucune variante CONTRAIRE classée devant la variante demandée (%d requêtes tête + qualificatif, × en / hors ligne)' % MET['b3_requetes'],
  famille_cause='variantes', source='CIQUAL', requete='cru/cuit/sec · entier/demi/écrémé · sucré/sans sucre · nature/aromatisé · UHT/pasteurisé/frais · épais/fluide · taux', online_offline='les deux',
  attendu='0 contraire avant compatible', observe='0 ; les %d « variantes absentes » sont des requêtes mal fabriquées par la sonde (voir NIGHT-P-040)' % MET['b3_violations'].get('aucune_compatible', 0),
  gravite='—', statut='PASS', reproductible=True, preuve='b3_variantes.json', commande_ou_procedure_reproduction='node ' + T + 'sonde_machine.js out', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-032', titre='Parcours réel du journal : ajout, stockage, rechargement, modification, autre jour, suppression d\'UNE ligne',
  famille_cause='journal', source='CIQUAL, fast-food, journal, OFF figé, scan figé', requete='riz blanc cuit · big mac · barre test', online_offline='—',
  attendu='lignes = pour-100 g × quantité, persistées', observe='%d scénarios ; écarts seulement sur NIGHT-P-007/008/009' % MET['journal']['scenarios'], gravite='—', statut='PASS', reproductible=True,
  preuve='journal.json J1a→J2, J4, J5, J6a, J6b, J7, J8', commande_ou_procedure_reproduction='node ' + T + 'sonde_journal.js out', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-033', titre='Open Food Facts / code-barres (réponses FIGÉES) : kJ seul converti (÷ 4,184), valeurs « par portion » seules jamais présentées comme pour 100 g',
  famille_cause='normalisation OFF', source='OFF (figé)', requete='barre kJ · boisson kJ · biscuit portion seule', online_offline='—', attendu='—', observe='conforme', gravite='—', statut='PASS', reproductible=True,
  preuve='journal.json J5, J6a, J6b', commande_ou_procedure_reproduction='node ' + T + 'sonde_journal.js out', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-034', titre='Données CIQUAL cohérentes : 0 valeur extrême, 0 négative, 0 doublon de code ou de nom ; écarts Atwater expliqués (alcools, polyols) ; plancher énergétique ≤ 1,3 kcal',
  famille_cause='cohérence', source='data/ciqual.json, data/alias.json, data/marques.json', requete='—', online_offline='—', attendu='—', observe='conforme (sauf NIGHT-P-003 et NIGHT-P-009)', gravite='—', statut='PASS', reproductible=True,
  preuve='contrôle python dans le rapport §J', commande_ou_procedure_reproduction='voir RAPPORT §J', confiance_cause='haute', lot_propose='—')
# ═══ FAUX POSITIFS DE L'AUDIT ════════════════════════════════════════════════════════════════════════════════
E(id='NIGHT-P-040', titre='%d « variantes absentes du top 6 » : requêtes fabriquées par la sonde avec « aromatisé », un mot que ces noms n\'emploient pas' % n_type('VARIANTE_ABSENTE_TOP6'),
  famille_cause='instrument', source='—', requete='biscuit sec aromatisé, muffin aromatisé…', online_offline='—', attendu='—', observe='attendu faux', gravite='—', statut='FAUX_POSITIF', reproductible=True,
  preuve='b3_variantes.json', commande_ou_procedure_reproduction='—', cause_probable='libellé de l\'oracle (« aromatisé ») ≠ vocabulaire CIQUAL (« au chocolat », « parfum »)', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-041', titre='238 « faux amis » du premier passage : l\'oracle ne recollait pas l\'apostrophe et le trait d\'union comme l\'app (« loignon », « pot-au-feu ») — corrigé avant de compter',
  famille_cause='instrument', source='—', requete='soupe à l\'oignon, pot-au-feu…', online_offline='—', attendu='—', observe='289 → 51 après correction de l\'oracle', gravite='—', statut='FAUX_POSITIF', reproductible=True,
  preuve='tools/audit-nut-night/analyse.py (fonction glue)', commande_ou_procedure_reproduction='—', confiance_cause='haute', lot_propose='—')
E(id='NIGHT-P-042', titre='Faux amis « traduits » : laitue, yogourt, patate, spaghetti, burger, soda, latte, coca… rendent une ligne qui ne contient pas le mot — ce sont des alias / synonymes VOULUS',
  famille_cause='instrument', source='—', requete='voir FAUX_AMI top1 en ligne', online_offline='EN LIGNE', attendu='—', observe='traductions décidées (ft-v1113/1115/1117)', gravite='—', statut='FAUX_POSITIF', reproductible=True,
  preuve='symptomes.json', commande_ou_procedure_reproduction='—', confiance_cause='haute', lot_propose='—')

for e in R:
    assert all(c in e for c in CHAMPS), e['id']
reg = {'genere': '12/10/2026', 'base': 'claude/nut-food-variants-03 @ 7dd1b005 (fonctionnel ae2f950c, arbre 5785192494bb0d50c6f9320197b134be43b6ef95)',
       'symptomes_bruts': MET['symptomes'], 'metriques': MET, 'entrees': R}
json.dump(reg, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(R), 'entrées', dict(Counter(e['gravite'] for e in R)), dict(Counter(e['statut'] for e in R)))
