#!/usr/bin/env python3
"""
🥗 CONVERTIT LA TABLE D'ALIAS ALIMENTAIRES EN `data/alias.json`.

Michel : *« il faut que je puisse trouver les noms comme big Mac ou pizza 4 fromages »* pour le
fast-food (ft-v1114) — et, le même jour, pour les aliments courants : quelqu'un tape
« tortiglioni », « sticky rice » ou « riz jasmin », et l'app ne rend RIEN alors que l'aliment
générique est dans le téléphone.

La table vient de **GPT**, construite sur l'export CSV de notre propre base (le rapport d'audit du
03/09). ⭐⭐ ELLE NE CRÉE AUCUNE VALEUR NUTRITIONNELLE : un alias est une **porte** vers un code
CIQUAL existant, jamais une fiche. Vérifié ligne à ligne à l'import — voir les garde-fous.

⛔⛔ LES CINQ GARDE-FOUS, ET CHACUN A ATTRAPÉ QUELQUE CHOSE OU PEUT LE FAIRE :
  ① le code doit EXISTER dans `data/ciqual.json` ;
  ② les 4 macros doivent être IDENTIQUES aux nôtres — c'est ce qui prouve qu'aucune valeur n'a
     été réécrite en chemin (mesuré à l'import de la V2 : 0 écart sur 569 lignes) ;
  ③ ⚠️ LA CIBLE DOIT ÊTRE PROPOSABLE (kcal non `null`). **Ce contrôle a attrapé une vraie erreur** :
     `tomate` visait `20189 · Tomate, séchée`, dont les calories sont « non déterminées » dans
     CIQUAL — l'app ne peut JAMAIS la proposer. *Un alias qui ouvre une porte fermée est pire
     qu'un alias absent : la personne croit avoir cherché.*
  ④ un alias ne doit PAS être déjà dans `FOOD_SYNONYMES` (R2 : une information, un propriétaire).
     Les deux tables répondent à deux questions différentes — « traduire les mots tapés »
     (query → query, les familles et les marques) et « ce mot EST cet aliment » (query → code) —
     mais un même mot ne peut pas relever des deux ;
  ⑤ les lignes `HORS_CIQUAL` (sans code) sont ÉCARTÉES et LISTÉES : ce sont de vrais trous de la
     table nationale (whey, créatine, naan…), pas des erreurs. On les nomme au lieu de les taire.

⭐ POURQUOI UN CODE ET NON UNE REQUÊTE. `FOOD_SYNONYMES` (ft-v1113) traduit une frappe en une autre
frappe, puis laisse la recherche classer. Ça marche pour ouvrir une FAMILLE (« mcdo »), pas pour
désigner UN aliment : le classement trie par longueur de nom, et c'est ainsi que « steak haché
15 % » remonte du **veau** avant le **bœuf**. Un alias qui porte le CODE ne subit aucun classement.

⛔ LES CORRECTIONS APPORTÉES À LA TABLE sont ci-dessous, nommées, avec leur raison. Elles ne sont
pas silencieuses : le script les imprime à chaque exécution.

Usage : python3 tools/alias.py [fichier.xlsx]   → écrit data/alias.json
        sans argument, il prend la source versionnée dans `data/sources/`.

⚠️⚠️ LA SOURCE EST DANS LE DÉPÔT DEPUIS LE 04/09/2026, ET CE N'EST PAS DU CONFORT. Elle vivait
   dans un dossier temporaire ; le conteneur a redémarré et elle a disparu — `data/alias.json`
   est devenu **impossible à régénérer** pendant une journée. *Un fichier généré dont la source
   n'est pas versionnée est un fichier figé qui s'ignore*, et R27 (« ce qui est généré ne s'édite
   pas à la main ») devient alors intenable. Détail et état des 3 générateurs : `data/sources/README.md`.
"""
import sys, json, re, os, unicodedata

# ⛔ CORRECTIONS EXPLICITES DE LA TABLE FOURNIE — chacune avec sa raison, jamais en silence.
#    On ne « répare » que ce qui est démontrablement faux, et on l'écrit (R30).
CORRECTIONS = {
    # `tomate` visait 20189 « Tomate, séchée » : kcal non déterminées → jamais proposable, et une
    # tomate n'est pas une tomate séchée. CIQUAL porte l'aliment moyen, c'est sa convention même
    # pour un mot générique — on ne choisit pas une variété à la place de la personne (R29).
    'tomate':  (20385, 'GPT visait « Tomate, séchée » (kcal non déterminées, jamais proposable)'),
    'tomates': (20385, 'idem'),
    # 🔎 FS-01 (02/10/2026, Food Semantics V1) — la table envoyait le mot GÉNÉRIQUE vers une forme
    #    TRANSFORMÉE, et l'alias passant devant tout, c'était le 1ᵉʳ résultat proposé. Mesuré sur
    #    master f31dc234 : « pomme » → « Pomme, sèche » (247 kcal/100 g au lieu de ~51) et
    #    « haricots verts » → « Haricots verts, purée ». Une pomme n'est pas une pomme séchée.
    #    ⭐ Même convention que `tomate` : l'aliment moyen quand CIQUAL en a un (pomme) ; sinon la
    #    forme CUITE, celle de la décision de Michel sur le cru/cuit (« les deux, le cuit en
    #    premier », ft-v1115). L'ancienne cible reste trouvable juste dessous : « pomme séchée »,
    #    « haricots verts purée ». ⏭️ « courgette » vise aussi une purée : même défaut, hors des
    #    témoins de FS-01, consigné pour FS-03 (on ne corrige pas en silence au-delà du lot).
    'pomme':          (13396, 'GPT visait « Pomme, sèche » — une pomme n\'est pas une pomme séchée (247 kcal/100 g au lieu de 51)'),
    'pommes':         (13396, 'idem'),
    'haricot vert':   (20030, 'GPT visait « Haricots verts, purée » — le légume, cuit en premier (décision cru/cuit, ft-v1115)'),
    'haricots verts': (20030, 'idem'),
}

# 🎯 FS-03 (02/10/2026) — LES ALIAS QUI IMPOSAIENT UNE FORME TRANSFORMÉE OU UN DESSERT À UN FRUIT / LÉGUME
#    GÉNÉRIQUE. Mesuré en classant les 633 alias (487 lexicaux, 146 « de préférence » qui choisissent une forme
#    parmi plusieurs) : trois défauts prouvés, et seulement eux — le reste de la table n'est pas touché.
#    ⭐ Même convention que `pomme` et `tomate` : l'aliment moyen quand CIQUAL en a un ; sinon RETRAIT, et c'est
#    le moteur (`_fsPreference`, qui évite la purée) qui choisit — il n'impose ni cru ni cuit.
CORRECTIONS.update({
    'poire':   (13397, 'FS-03 : visait « Poire belle Hélène » (un dessert glacé) — une poire est un fruit cru'),
    'poires':  (13397, 'idem'),
    'raisin':  (13395, 'FS-03 : visait « Raisin sec » — un raisin est un fruit frais ; « raisins secs » reste explicite'),
    'raisins': (13395, 'idem'),
})
# 🥛 NUT-FOOD-VARIANTS-03 (12/10/2026, décision de Michel) — STEAK HACHÉ : cru en premier, cuit présent. Les alias à
#    10 / 15 / 20 % visaient déjà le CRU ; ceux à 5 % visaient le CUIT (6251) — la seule incohérence de la famille.
CORRECTIONS.update({
    'steak hache 5%':   (6250, 'NUT-FOOD-VARIANTS-03 : visait le CUIT (6251) quand 10 / 15 / 20 % visent le cru — aligné, le cuit reste juste dessous'),
    'boeuf hache 5%':   (6250, 'idem'),
    'hache 5%':         (6250, 'idem'),
    'viande hachee 5%': (6250, 'idem'),
})
# 🍽️ NUT-LOT-A (13/10/2026, audit de nuit du 12/10 + décision D1 de Michel) — L'ALIMENT NOMMÉ EXISTE, L'ALIAS EN
#    VISAIT UN AUTRE. *« Une requête explicite privilégie l'aliment qu'elle nomme ; une requête générique reste générique
#    et n'invente pas de variante. »* Mesuré en ligne (l'alias passe devant tout) : « confiture de fraise » rendait
#    « Confiture de LAIT » (340 kcal), « gruyère » l'Emmental, « lieu noir » le lieu d'Alaska. Chaque code est vérifié
#    dans `data/ciqual.json` (proposable, nom relu) ; la forme (cru / cuit) de l'ancienne cible est conservée.
#    ⭐ Ce qui manquait n'était pas un contrôle de code ni de macros — ft-v1115 les avait — c'était le SENS : voir
#    `controle_semantique` plus bas, qui refuse désormais de générer une table où l'aliment nommé est contourné.
CORRECTIONS.update({
    'confiture':                (30999, 'NUT-LOT-A, D1 : visait « Confiture de lait » — le générique « sans précision sur la teneur en sucres », rien d\'imposé'),
    'confiture de fraise':      (31024, 'NUT-LOT-A : visait « Confiture de lait » — la confiture de fraise existe'),
    'confiture dabricot':       (31037, 'NUT-LOT-A : visait « Confiture de lait » — la confiture d\'abricot existe'),
    'confiture fruits rouges':  (31083, 'NUT-LOT-A, D1 : visait « Confiture de lait » ; CIQUAL n\'a pas de « fruits rouges » — le mélange de fruits correspondant'),
    'gruyere':                  (12114, 'NUT-LOT-A : visait l\'Emmental — le Gruyère (sans précision) existe'),
    'lieu noir':                (26134, 'NUT-LOT-A : visait le lieu d\'Alaska, un autre poisson — le lieu noir cru existe'),
    'pilon de poulet':          (36022, 'NUT-LOT-A : visait la cuisse — le pilon existe'),
    'pilons de poulet':         (36022, 'idem'),
    'riz semi-complet':         (9113,  'NUT-LOT-A : visait le riz complet — le semi-complet existe'),
    'pain aux cereales':        (7255,  'NUT-LOT-A : visait le pain complet — le pain aux céréales existe'),
    'jambon de bayonne':        (28811, 'NUT-LOT-A : visait le jambon cru générique — le jambon de Bayonne existe'),
    'jambon sec':               (28812, 'NUT-LOT-A : visait le jambon cru générique — le jambon sec existe'),
    'lentilles blondes':        (20588, 'NUT-LOT-A : visait la lentille verte — la lentille blonde existe'),
    'pates semi-completes':     (9877,  'NUT-LOT-A : visait les pâtes complètes — les semi-complètes existent'),
    'haut de cuisse de poulet': (36019, 'NUT-LOT-A : visait la cuisse — le haut de cuisse existe'),
    'beurre sale':              (16403, 'NUT-LOT-A : visait le demi-sel, un autre beurre — le beurre salé existe'),
    'riz thai':                 (9124,  'NUT-LOT-A : visait le riz blanc — le riz thaï existe'),
    # D1 : les salades — l'aliment exact quand CIQUAL le possède ; « salade » seule reste la salade verte générique.
    'laitue':                   (20031, 'NUT-LOT-A, D1 : visait « Salade verte » — la laitue existe'),
    'batavia':                  (20123, 'NUT-LOT-A, D1 : visait « Salade verte » — la batavia existe'),
    'feuille de chene':         (20295, 'NUT-LOT-A, D1 : visait « Salade verte » — la feuille de chêne existe'),
    # D1, règle générale, appliquée aux autres alias que le contrôle sémantique a trouvés et où l'aliment nommé existe :
    'tradition':                (7007,  'NUT-LOT-A, D1 : visait le pain blanc — le pain de tradition française existe'),
    'baguette tradition':       (7007,  'idem'),
    'noix de veau':             (6522,  'NUT-LOT-A, D1 : visait l\'escalope — la noix de veau crue existe'),
    'rosette':                  (30304, 'NUT-LOT-A, D1 : visait le saucisson sec — la rosette existe'),
    'pomme de terre a leau':    (4003,  'NUT-LOT-A, D1 : visait la pomme de terre cuite moyenne — « bouillie/cuite à l\'eau » existe (trouvé par le contrôle de sens)'),
    # D-074 (Michel, 13/10) : « potatoes » → l'aliment exact, dans sa forme CUITE comme l'ancienne cible (« rôtie / cuite
    #    au four ») ; l'oracle MS-105 de FS-05B, qui figeait « Pomme de terre, rôtie », était historique et a été mis à jour.
    'potatoes':                 (4025,  'NUT-LOT-A, D-074 : visait la pomme de terre rôtie (91 kcal) — « Potatoes ou wedges…, cuites » existe (175 kcal)'),
})

# ⛔ RETRAITS — un mot qui ne doit plus avoir d'alias du tout (R30 : le retrait s'écrit, avec sa raison).
RETRAITS = {
    'courgette':  'FS-03 : visait « Courgette, purée » ; aucun aliment moyen — le moteur évite la purée sans imposer cru ou cuit',
    'courgettes': 'idem',
}

# ⛔ AJOUTS QUI NE VIENNENT PAS DU CLASSEUR — nommés, avec leur raison, jamais silencieux.
#    ⚠️ ILS VIVENT ICI ET NON DANS `data/alias.json` : ce fichier est GÉNÉRÉ, donc une retouche
#    à la main y disparaîtrait à la prochaine exécution, sans bruit (R27 : ce qui est généré ne
#    s'édite pas à la main).
AJOUTS = {
    # 🥤 LE CAS QUI LES A FAIT NAÎTRE (03/09/2026, ft-v1116) — signalé par Michel en notant son
    #    repas. `coca zéro` rendait « Cola, SUCRÉ, avec édulcorants » (18037, **24 kcal/100 g**)
    #    AVANT « Cola, SANS SUCRES AJOUTÉS, avec édulcorants » (18060, **1 kcal/100 g**).
    #    ⛔⛔ Sur une canette de 50 cl : **120 kcal enregistrées au lieu de 5**.
    #    👉 Cause : `zero`/`light` sont traduits en « édulcorants », et les DEUX lignes portent ce
    #    mot ; c'est alors le tri par NOM LE PLUS COURT qui tranche — et il tranche mal.
    #    *Un mot traduit désigne une famille, pas un aliment : quand la famille contient le
    #    contraire de ce qu'on cherche, il faut le code.*
    #    ⚠️ On ne retire PAS 18037 : c'est le bon aliment pour un cola sucré aux édulcorants
    #    (type stévia). On l'empêche seulement de répondre à la place du zéro.
    'coca zero':      (18060, 'rendait « Cola, sucré, avec édulcorants » (24 kcal/100 g) — 120 kcal au lieu de 5 sur 50 cl'),
    'coca light':     (18060, 'idem'),
    'coke zero':      (18060, 'idem'),
    'coke light':     (18060, 'idem'),
    'cola zero':      (18060, 'idem'),
    'cola light':     (18060, 'idem'),
    'coca sans sucre':(18060, 'rendait « Cola, sucré, SANS CAFÉINE » (41 kcal/100 g) — encore pire'),
    'cola sans sucre':(18060, 'idem'),
    'pepsi max':      (18060, 'même famille : un cola sans sucres ajoutés, aux édulcorants'),
    'pepsi zero':     (18060, 'idem'),
    'pepsi light':    (18060, 'idem'),
    # ⛔ Et la variante sans caféine a SA propre entrée dans la table nationale : on ne la
    #    confond pas avec la précédente, elles ne portent pas les mêmes valeurs.
    'coca zero sans cafeine': (18068, 'CIQUAL distingue la version sans caféine — on ne fusionne pas'),
    'coca sans cafeine':      (18067, 'le cola sucré sans caféine, qui existe aussi'),
    # 🔎 FS-01 — « eau » tenait à la COUPURE À 400 (l'ordre du fichier écartait « Eau de coco »). La
    #    coupure retirée, le nom le plus court passait devant. On garde le résultat de master.
    # 🥛 NUT-FOOD-VARIANTS-03 — « steak haché » SANS taux ni cuisson : sans alias, le départage par la longueur ne
    #    montrait que des CRUS. L'aliment moyen (cuit) en tête, les crus dessous : les deux formes visibles (décision G).
    'steak hache':    (6259, 'NUT-FOOD-VARIANTS-03 : sans précision, l\'aliment moyen (cuit) devant les crus — cru ET cuit visibles'),
    'eau':            (18066, 'FS-01 : garde « Eau du robinet » (résultat de master) — sans la coupure à 400, « Eau de coco » passait devant'),

    # ═══ 🥤 ft-v1117 — LE PIÈGE DU COCA N'ÉTAIT PAS CELUI DU COCA : IL Y EN A 9 ═══════════════
    #  Michel : *« et les autres boissons ? »*. **Mesuré** : CIQUAL porte **9 paires**
    #  « X, sucré, avec édulcorants » / « X, sans sucres ajoutés, avec édulcorants », et
    #  ⛔⛔ « sucré » est TOUJOURS le nom le plus court — donc le tri choisit systématiquement
    #  la version SUCRÉE quand on tape « light » ou « zéro ». Le Coca n'était qu'un cas sur 9.
    #  ⚠️⚠️ ET LE CORRECTIF « PROPRE » A ÉTÉ REFUSÉ PAR LA MESURE, pas par l'intuition :
    #  traduire `zero`/`light` en « sans sucres ajoutés » plutôt qu'en « édulcorants » corrige
    #  3 cas… et en casse 3 autres — `yaourt light` ne rend **plus rien**, `soda light` tombe
    #  sur « Boisson gazeuse **à la pomme** » (30 kcal, un autre produit).
    #  👉 ***« Light » ne veut pas dire « sans sucre » : un yaourt light est 0 % de matière
    #  grasse.*** Un mot qui a deux sens ne se traduit pas, il se DÉSIGNE — d'où ces alias.
    'soda zero':          (18001, 'les 9 paires : « sucré » est toujours le nom le plus court, donc il gagnait'),
    'soda light':         (18001, 'idem'),
    'soda sans sucre':    (18001, 'idem'),
    'boisson gazeuse zero':  (18001, 'idem'),
    'boisson gazeuse light': (18001, 'idem'),
    'limonade zero':      (18035, 'idem — 8 kcal/100 g au lieu de 0'),
    'limonade light':     (18035, 'idem'),
    'limonade sans sucre':(18035, 'idem'),
    'tonic zero':         (18013, 'idem — 22 kcal/100 g au lieu de 0'),
    'tonic light':        (18013, 'idem'),
    'schweppes zero':     (18013, 'idem'),
    'schweppes light':    (18013, 'idem'),
    'ice tea zero':       (18065, 'idem — 17 kcal/100 g au lieu de 1'),
    'ice tea light':      (18065, 'idem'),
    'the glace zero':     (18065, 'idem'),
    'the glace light':    (18065, 'idem'),
    'red bull zero':      (18353, 'idem — 28 kcal/100 g au lieu de 9'),
    'red bull sans sucre':(18353, 'idem'),
    'energy drink zero':  (18353, 'idem'),
    'boisson energisante zero': (18353, 'idem'),

    # ═══ 🥤 LES BOISSONS QUI NE RENDAIENT **RIEN** ══════════════════════════════════════════
    #  ⛔ Elles ouvrent le GÉNÉRIQUE de la table nationale, jamais un chiffre de marque : le nom
    #  affiché dit « Boisson énergisante » ou « Boisson gazeuse aux fruits », donc rien ne se
    #  fait passer pour le produit lui-même (R32/R33). C'est le mécanisme de « mcdo » en ft-v1113.
    #  ⭐ Et on prend l'**aliment moyen** quand il existe : c'est la convention de CIQUAL pour un
    #  mot générique, et elle ne choisit pas une variante à la place de la personne (R29).
    'ice tea':      (18062, 'ne rendait RIEN — l\'aliment moyen « Boisson au thé, aromatisée »'),
    'icetea':       (18062, 'idem'),
    'the glace':    (18062, 'idem'),
    'red bull':     (18324, 'ne rendait RIEN — l\'aliment moyen « Boisson énergisante »'),
    'redbull':      (18324, 'idem'),
    'monster':      (18324, 'idem'),
    'energy drink': (18324, 'idem'),
    'orangina':     (18048, 'ne rendait RIEN — l\'aliment moyen « Boisson gazeuse aux fruits, sucrée »'),
    'sprite':       (18048, 'idem'),
    'fanta':        (18048, 'idem'),
    'oasis':        (18048, 'idem'),
    'seven up':     (18048, 'idem'),
    'tropico':      (18048, 'idem'),
    'schweppes':    (18344, 'ne rendait RIEN — « Tonic ou bitter, sucré »'),
    'latte':        (18151, 'ne rendait RIEN — « Café au lait, café crème ou cappuccino, prêt à boire »'),
    'cafe latte':   (18151, 'idem'),
    'eau petillante': (18046, 'ne rendait RIEN — l\'aliment moyen « Eau minérale, gazeuse »'),
    'biere blonde': (5001,  'ne rendait RIEN — la bière standard « coeur de marché (4-5° alcool) »'),
    'panache':      (5004,  'ne rendait RIEN — « Panaché (limonade et bière) »'),

    # ═══ 🥛 LES LAITS VÉGÉTAUX — LE PIRE DE TOUS ═══════════════════════════════════════════
    #  ⛔⛔ `lait amande` rendait **« Chocolat au lait aux fruits secs (noisettes, amandes) » à
    #  559 kcal/100 g** — pour une boisson qui en fait **36**. ***× 15,5.*** Et `lait soja`,
    #  `lait avoine` ne rendaient RIEN. Cause : CIQUAL écrit « Boisson à… », on dit « lait de… ».
    #  ⚠️⚠️ ET ON NE TOUCHE PAS AU « LAIT DE COCO » : la table distingue le **lait de coco
    #  culinaire** (18041, **199 kcal**) de la **boisson à la noix de coco** (18907, **30**).
    #  Ce sont deux produits différents ; les fusionner ferait exactement le dégât qu'on répare.
    #  ⭐ Mesuré : « lait de coco » trouve DÉJÀ le bon (18041), il n'a besoin d'aucun alias.
    'lait amande':    (18111, 'rendait « Chocolat au lait aux fruits secs » à 559 kcal/100 g — × 15,5'),
    'lait d amande':  (18111, 'idem'),
    'lait damande':   (18111, 'idem'),
    'lait soja':      (18113, 'ne rendait RIEN — CIQUAL écrit « Boisson au soja »'),
    'lait de soja':   (18113, 'idem'),
    'lait avoine':    (18899, 'ne rendait RIEN — CIQUAL écrit « Boisson à l\'avoine »'),
    'lait d avoine':  (18899, 'idem'),
    'lait de riz':    (18904, 'ne rendait RIEN — CIQUAL écrit « Boisson au riz »'),

    # ⛔ « rosé » rendait « ROSETTE ou fuseau » — le SAUCISSON, à 392 kcal/100 g pour un vin qui
    #    en fait 69. C'est la famille de `hampe` → « cham**pêtre** » : la recherche compare des
    #    SOUS-CHAÎNES, donc « rose » se trouve dans « Rosette ».
    #    ⭐ Et rien n'est perdu : la rosette reste trouvable en tapant « rosette », et elle
    #    apparaît juste sous le vin dans la liste (R29).
    'rose':     (5216, 'rendait « Rosette ou fuseau » — le saucisson, 392 kcal au lieu de 69'),
    'vin rose': (5216, 'idem'),
    '7up':      (18048, 'ne rendait RIEN — l\'aliment moyen « Boisson gazeuse aux fruits, sucrée »'),
}

# ⛔⛔ NUT-LOT-A (13/10/2026) — LES TRADUCTIONS VOULUES, et elles seulement. Le contrôle de sens (`controle_semantique`)
#    REFUSE de générer la table quand la cible d'un alias ne porte pas les mots de sa clé ALORS QU'UN AUTRE aliment
#    proposable les porte tous : l'alias contournerait l'aliment nommé (« gruyère » → Emmental). Les clés ci-dessous sont
#    les traductions VOULUES que ce contrôle voit — chacune liée à SA cible (un alias détourné ailleurs n'est plus
#    couvert) et avec SA raison (R30). ⛔ Ce n'est pas une porte de sortie : une ligne de plus ici est une décision.
_PATES  = 'une forme de pâtes vaut les pâtes sèches cuites ; les autres aliments qui portent le mot sont des PLATS (bolognaise, soupe)'
_BOISS  = 'CIQUAL écrit « Boisson à… » (ft-v1116) ; l\'autre aliment qui porte les mots est un chocolat / un riz au lait'
_PATATE = '« patate » = pomme de terre en français courant ; l\'autre aliment est la PATATE DOUCE, un autre légume'
_BLANC  = 'D1 (Michel, 13/10) : le blanc = la viande ; la tranche de charcuterie seulement si la requête la nomme'
_VAPEUR = 'D1 (Michel, 13/10) : la pomme de terre cuite générique ; « vapeur, sous vide » n\'est pas imposé'
TRADUCTIONS_VOULUES = {
    'arachide':               (15001, 'arachide = cacahuète ; les autres sont le beurre, l\'huile ou une sardine à l\'huile d\'arachide'),
    'arachides':              (15001, 'idem'),
    'burger':                 (25413, 'le générique est le hamburger ; poisson / poulet sont des variantes qu\'on nomme'),
    'escalope de poulet':     (36017, 'l\'escalope de poulet = le filet ; l\'autre aliment est une escalope PANÉE'),
    'filet de maquereau':     (26051, 'le poisson cru ; les filets de la table sont en conserve, en sauce'),
    'filet de merlu':         (26044, 'le poisson cru ; le seul filet de la table est SURGELÉ, une forme non demandée (D1)'),
    'jambon blanc':           (28906, 'jambon blanc = jambon cuit de porc ; les autres sont des jambons de VOLAILLE'),
    'blanc de poulet':        (36017, _BLANC),
    'blanc de dinde':         (36304, _BLANC),
    'lait amande':            (18111, _BOISS),
    'lait d amande':          (18111, _BOISS),
    'lait de riz':            (18904, _BOISS),
    'pain sandwich':          (7200,  'le pain de mie ; les autres aliments sont des SANDWICHS garnis'),
    'toast':                  (7200,  'le pain de mie ; les autres sont des toasts briochés aux raisins ou des canapés garnis'),
    'patate':                 (4048,  _PATATE),
    'patates':                (4048,  _PATATE),
    'patate vapeur':          (4048,  _PATATE),
    'pomme de terre vapeur':  (4048,  _VAPEUR),
    'pommes de terre vapeur': (4048,  _VAPEUR),
    'riz japonais':           (9104,  'le riz cuit ; l\'autre aliment est un BISCUIT apéritif « mélange japonais »'),
    'semoule de ble':         (9683,  'la semoule CUITE en premier (décision cru / cuit de Michel, ft-v1115) ; la crue reste trouvable'),
    'spaghetti':              (9811,  _PATES),
    'spaghettis':             (9811,  _PATES),
    'tagliatelle':            (9811,  _PATES),
    'tagliatelles':           (9811,  _PATES),
    'vermicelles':            (9811,  _PATES),
    # (« potatoes » figurait ici comme À TRANCHER — tranché par D-074 : il est passé dans CORRECTIONS, vers l'aliment exact.)
}

def norm(t):
    """La MÊME normalisation que `_afNorm` dans app.js — sinon la clé ne serait jamais trouvée."""
    t = str(t or '').lower()
    # 🥛 MIROIR DE NUT-FOOD-VARIANTS-01 : un taux reste un nombre collé à son « % » (« 5 % » = « 5% ») et la
    #    virgule décimale d'un TAUX devient un point (« 1,2% » → « 1.2% »), AVANT que la ponctuation ne devienne une espace.
    t = re.sub(r'(\d),(\d+)\s*%', r'\1.\2%', t)   # la virgule d'un TAUX seulement (NUT-FOOD-VARIANTS-02)
    t = re.sub(r'(\d)\s+%', r'\1%', t)
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = t.replace('œ', 'oe').replace('æ', 'ae')
    t = re.sub(r"['’‘`´ʼ]", '', t)
    # ⛔⛔ MIROIR DE ft-v1119 : la ponctuation devient un ESPACE, exactement comme dans `_afNorm`.
    #    ⛔ La barre `/` en est ABSENTE des deux côtés, exprès : la clé `lait 1/2 ecreme` la
    #    porte, et l'espacer d'un seul côté la rendrait introuvable.
    #    *Deux normalisations qui divergent d'un caractère font disparaître une entrée en silence.*
    t = re.sub(r'[,;:!?()\[\]{}«»"–—]+', ' ', t)   # ⛔ pas le « / » : voir _afNorm
    return re.sub(r'\s+', ' ', t).strip()

def synonymes_existants(app_js):
    """Les clés de FOOD_SYNONYMES, pour interdire qu'un mot relève des deux tables (R2)."""
    s = open(app_js, encoding='utf-8').read()
    i = s.find('const FOOD_SYNONYMES')
    if i < 0: return set()
    bloc = s[i:s.index('\n};', i)]
    bloc = re.sub(r'/\*.*?\*/', '', bloc, flags=re.S)
    return {norm(m) for m in re.findall(r"'([^']+)'\s*:", bloc)}

# ⛔⛔ NUT-LOT-A — LE CONTRÔLE DE SENS. Ft-v1115 vérifiait le CODE (il existe), les MACROS (rien n'est réécrit) et la
#    PROPOSABILITÉ — jamais le SENS. L'audit de nuit du 12/10 a mesuré le trou : 49 clés dont la cible ne porte pas les
#    mots alors qu'un autre aliment proposable les porte tous. Oracle écrit ici, indépendant du moteur de l'app : mots
#    entiers, mots outils ignorés, pluriel et accord (complet / complète) tolérés, élision détachée (« d'abricot »).
_OUTILS_SENS = {'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'au', 'aux', 'en', 'et', 'a', 'd', 'l', 'avec'}

def _mots_sens(t):
    t = unicodedata.normalize('NFD', str(t or '').lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').replace('œ', 'oe').replace('æ', 'ae')
    t = re.sub(r"['’]", ' ', t)              # l'élision se détache : « d'abricot » → « d abricot »
    t = re.sub(r'[^a-z0-9% ]+', ' ', t)
    return [w[:-1] if len(w) > 3 and w[-1] in 'sx' else w for w in t.split() if w not in _OUTILS_SENS]

def _porte(noms, mots):
    """Le nom (ensemble de mots) porte-t-il tous les mots de la clé ? L'accord en genre est toléré (complet / complète)."""
    return all(w in noms or (w.endswith('e') and w[:-1] in noms) or (w + 'e') in noms for w in mots)

def controle_semantique(out, brut, base):
    """Rend (refusés, blanchis, entrées inutiles de la liste blanche). Un refus = une clé dont la cible ne porte pas les
       mots alors qu'un autre aliment proposable les porte tous, et qui n'est pas une traduction voulue VERS CETTE CIBLE."""
    noms = {c: set(_mots_sens(e[1])) for c, e in base.items()}
    prop = [c for c, e in base.items() if e[3] is not None]
    refus, blanchis = [], []
    for a, code in sorted(out.items()):
        mots = _mots_sens(brut.get(a, a))
        if not mots or _porte(noms[code], mots):
            continue
        autres = [c for c in prop if c != code and _porte(noms[c], mots)]
        if not autres:
            continue
        tv = TRADUCTIONS_VOULUES.get(a)
        if tv and tv[0] == code:
            blanchis.append(a); continue
        refus.append((a, code, base[code][1], autres[0], base[autres[0]][1], len(autres)))
    return refus, blanchis, sorted(set(TRADUCTIONS_VOULUES) - set(blanchis))

def main(src):
    import openpyxl
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ciq = json.load(open(os.path.join(ROOT, 'data', 'ciqual.json'), encoding='utf-8'))
    base = {a[0]: a for a in ciq['a']}
    deja = synonymes_existants(os.path.join(ROOT, 'app.js'))

    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    lignes = []
    for feuille in wb.sheetnames:
        ws = wb[feuille]
        it = ws.iter_rows(values_only=True)
        try: cols = next(it)
        except StopIteration: continue
        if not cols or 'alias' not in [str(c) for c in cols]: continue
        if 'code_ciqual' not in [str(c) for c in cols]: continue
        if 'libellé_CIQUAL' not in [str(c) for c in cols]: continue   # feuille d'import allégée
        for r in it:
            if r and r[0]: lignes.append(dict(zip(cols, r)))

    out, vus = {}, {}
    rej = {'hors_ciqual': [], 'inconnu': [], 'non_proposable': [], 'macro': [],
           'collision': [], 'doublon': [], 'court': [], 'retrait': []}
    corrigees, ajoutees = [], []
    brut = {}   # la clé telle qu'écrite (accents, apostrophe) — c'est elle que lit le contrôle de sens

    for l in lignes:
        a = norm(l['alias'])
        if len(a) < 3:                    rej['court'].append(l['alias']); continue
        if a in deja:                     rej['collision'].append(l['alias']); continue
        if a in RETRAITS:                 rej['retrait'].append((l['alias'], RETRAITS[a])); continue

        code, raison = l.get('code_ciqual'), None
        if a in CORRECTIONS:
            code, raison = CORRECTIONS[a][0], CORRECTIONS[a][1]
        try: code = int(code)
        except (TypeError, ValueError):
            rej['hors_ciqual'].append((l['alias'], l.get('cible_affichée'))); continue

        e = base.get(code)
        if not e:                         rej['inconnu'].append((l['alias'], code)); continue
        # ③ la cible doit pouvoir être PROPOSÉE : sans calories, la ligne ne peut pas être notée.
        if e[3] is None:                  rej['non_proposable'].append((l['alias'], code, e[1])); continue

        # ② aucune valeur n'a été réécrite en chemin (sauté pour une correction : la ligne du
        #    classeur décrit alors un AUTRE aliment, c'est justement pour ça qu'on la corrige).
        if raison is None:
            ecart = False
            for cle, idx in (('kcal_100g', 3), ('prot_100g', 4), ('glucides_100g', 5), ('lipides_100g', 6)):
                v = l.get(cle)
                try: v = float(str(v).replace(',', '.'))
                except (TypeError, ValueError): v = None
                n = e[idx]
                if (v is None) != (n is None) or (v is not None and n is not None and abs(v - n) > 0.001):
                    ecart = True
            if ecart:                     rej['macro'].append((l['alias'], code)); continue
        else:
            corrigees.append((l['alias'], code, e[1], raison))

        if a in vus:
            # ⛔ deux cibles pour le même mot tapé = ambiguïté : on refuse les DEUX, on ne
            #    tranche pas au hasard (R29). Un doublon à l'identique, lui, est inoffensif.
            if vus[a] != code: rej['doublon'].append((l['alias'], vus[a], code)); out.pop(a, None)
            continue
        vus[a] = code
        out[a] = code
        brut.setdefault(a, l['alias'])

    # ⛔ LES AJOUTS PASSENT LES MÊMES GARDE-FOUS QUE LE CLASSEUR — sinon ils seraient une porte
    #    dérobée par laquelle une cible morte pourrait entrer.
    for a0, (code, raison) in AJOUTS.items():
        a = norm(a0)
        if a in deja:   rej['collision'].append(a0); continue
        e = base.get(code)
        if not e:       rej['inconnu'].append((a0, code)); continue
        if e[3] is None: rej['non_proposable'].append((a0, code, e[1])); continue
        if a in vus and vus[a] != code:
            rej['doublon'].append((a0, vus[a], code)); out.pop(a, None); continue
        vus[a] = code; out[a] = code; brut.setdefault(a, a0)
        ajoutees.append((a0, code, e[1], raison))

    # ⛔⛔ LE SENS AVANT L'ÉCRITURE (NUT-LOT-A) : une clé qui contourne l'aliment qu'elle nomme ARRÊTE la génération —
    #    rien n'est écrit, l'ancienne table reste en place. Corriger dans CORRECTIONS, ou justifier dans TRADUCTIONS_VOULUES.
    refus, blanchis, inutiles = controle_semantique(out, brut, base)
    if refus:
        print(f'⛔⛔ GÉNÉRATION REFUSÉE — {len(refus)} alias contournent l\'aliment qu\'ils nomment (aucun fichier écrit) :')
        for a, c, lib, c2, lib2, n in refus:
            print(f'   · « {a} » → {c} {lib}\n     alors que {c2} « {lib2} » porte tous ses mots ({n} aliment(s))')
        sys.exit(1)
    dst = os.path.join(ROOT, 'data', 'alias.json')
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump({'source': 'Alias FR → codes Ciqual 2025 (ANSES) — aucune valeur nutritionnelle créée',
                   'n': len(out), 'a': out}, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)

    ko = os.path.getsize(dst) / 1024
    import gzip as _gz
    kz = len(_gz.compress(open(dst, 'rb').read())) / 1024
    print(f'{len(out)} alias → {dst} ({ko:.0f} Ko · {kz:.0f} Ko gzippé)')
    print(f'\n✅ contrôle de sens : 0 refus · {len(blanchis)} traduction(s) voulue(s), chacune justifiée dans TRADUCTIONS_VOULUES')
    if inutiles:
        print(f'⚠️ {len(inutiles)} entrée(s) de TRADUCTIONS_VOULUES ne servent plus (à retirer) : ' + ', '.join(inutiles))
    if ajoutees:
        print(f'\n⭐ {len(ajoutees)} AJOUT(S) HORS CLASSEUR — nommés, avec leur raison :')
        for a, c, lib, r in ajoutees: print(f'   · « {a} » → {c} {lib}\n     raison : {r}')
    if corrigees:
        print(f'\n⛔ {len(corrigees)} CORRECTION(S) APPORTÉE(S) À LA TABLE — jamais en silence :')
        for a, c, lib, r in corrigees: print(f'   · « {a} » → {c} {lib}\n     raison : {r}')
    for cle, titre in (('hors_ciqual',   "écartés — ABSENTS de CIQUAL (vrais trous de la table nationale)"),
                       ('non_proposable', "écartés — cible sans calories déterminées (jamais proposable)"),
                       ('inconnu',       "écartés — code introuvable dans notre base"),
                       ('macro',         "écartés — macros divergentes (la valeur aurait été réécrite)"),
                       ('collision',     "écartés — déjà dans FOOD_SYNONYMES (R2, un propriétaire)"),
                       ('doublon',       "écartés — DEUX cibles pour le même mot (ambigu, on ne tranche pas)"),
                       ('court',         "écartés — moins de 3 caractères"),
                       ('retrait',       "RETIRÉS exprès (RETRAITS, raison écrite)")):
        v = rej[cle]
        if not v: continue
        print(f'\n⚠️ {len(v)} {titre} :')
        for x in v[:14]: print('   ·', x)
        if len(v) > 14: print(f'   … et {len(v)-14} autres')

if __name__ == '__main__':
    _defaut = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                           'data', 'sources', 'Force_Tracker_Alias_CIQUAL_V2_Elargie.xlsx')
    main(sys.argv[1] if len(sys.argv) > 1 else _defaut)
