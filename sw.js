/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
const CACHE = 'ft-v1123'; // ⚡ ft-v1123 = << CETTE SEANCE TE CONVIENT ? >> NE S AFFICHE PLUS SOUS UN REPROCHE. Michel, enregistrement d ecran a l appui : il ecrit « Oui mais pourquoi tu me donnes la seance a faire ? » -- un REPROCHE -- et l app lui propose « ⚡ Oui, on demarre » SOUS une reponse de Milo qui dit exactement le contraire (« c est pas le bon moment, t as fini ta seance, on est en debrief »). LA CAUSE EST DANS LE FILET : depuis ft-v1053 la carte se declenche sur ce que la PERSONNE a demande, et sa regle 2 accepte n importe quel « la/ma seance » SANS verbe de demande. MESURE AVANT DE TOUCHER AU CODE, et son cas n etait pas isole : sur six phrases, QUATRE declenchaient la carte a tort -- « la seance etait trop longue », « pourquoi ma seance ne compte pas ? », « je viens de finir ma seance ». TROIS SONT L EXACT CONTRAIRE D UNE DEMANDE. Le commentaire au-dessus de la fonction prevoyait pourtant le risque en toutes lettres : « une question posee sous une reponse qui n y repond pas ». DEUX NIVEAUX D EXCLUSION, et la frontiere est mesuree : le PASSE tue tout, meme la regle a verbe (fai[st] attrape aussi bien l imperatif « fais-moi » que le participe « j ai FAIT ma seance ») ; les marqueurs AMBIGUS comme « pourquoi » ne tuent que les regles sans verbe, parce que « pourquoi tu ne me fais pas une seance jambes ? » EST une demande. ET MON PREMIER JET NE MORDAIT PAS : j avais ecrit \b[ee-accent]tait\b, or \b est ASCII en JavaScript -- il n y a AUCUNE frontiere entre l espace et le « e accent » de « etait », donc deux des trois phrases visees passaient encore. On teste desormais sur une copie sans accents. Une expression reguliere qui a l air juste et qui ne mord jamais est pire qu une absence de garde : on la croit posee. TROUS CONNUS EPINGLES, non corriges (des RATES pre-existants, sans rapport avec ce correctif qui ne fait que RETIRER des declenchements) : « on fait quoi ce soir » et « on s entraine quoi » sans apostrophe ne declenchent pas. REGLE #11 : RIEN -- c est une correction, rien n apparait, aucun repere ne bouge, et une pop-up dirait « la carte s affichait a tort » : une alarme retroactive (R25). CONTROLE NEGATIF : 3 rouges sur l ancien code, et les temoins de non-regression restent verts. Tests : calculs 298/298 (+8, bloc 14).
// 🔋 ft-v1122 = LE CARDIO ENTRE ENFIN DANS LA RECUPERATION (option A du contre-audit). TROIS DEFAUTS MESURES AU BANC DETERMINISTE AVANT D ECRIRE UNE LIGNE, puis tranches par Michel sur les chiffres. ① LE CARDIO NE COMPTAIT PAS : 18 combinaisons (3 intensites x 6 durees) rendaient TOUTES la meme penalite -6, donc 90 min de tapis intense (855 MET.min, 1140 kcal) coutaient autant que 10 min de marche -- et MOINS que 6 series de developpe couche. ② LE PLANCHER DE 6 fabriquait une falaise d entree : aucune seance 79, UNE SEULE SERIE 75, et 1/2/3 series aplaties sur la meme valeur. ③ LE BONUS DE REPOS arrivait d un bloc : 47,9 h -> 79 et 48,0 h -> 85, SIX POINTS EN UN DIXIEME D HEURE -- exactement la << marche de midi >> corrigee le 30/07 (ft-v671), deplacee a la frontiere de l effacement et jamais remesuree depuis. LA BASE EST LE MET.MINUTE, PAS LA CALORIE, et c est une MESURE : 45 min de tapis modere valent 248 MET.min pour tout le monde mais 248 kcal a 60 kg, 330 a 80 kg et 413 a 100 kg -- passer par les calories rendrait une personne lourde automatiquement plus fatiguee pour le meme effort relatif. ANCRAGE CHOISI PAR MICHEL : 45 min de tapis modere = 6 series equivalentes INTERNES (facteur 41,25 MET.min par unite), retenu contre l autre candidat mesure (8 series) parce qu a 8 un cardio SEUL de 90 min intense atteignait le plafond de 38, celui qui designe 24 series de squat depuis ft-v718. L equivalence est STRICTEMENT INTERNE : l app n affiche jamais << 45 min de tapis = 6 series >>. UNE SEULE SOMME muscu + cardio avant + cardio apres, donc aucun double comptage. RIEN D AUTRE NE BOUGE et les temoins le prouvent : x1,7, echec x1,5, drop x1,3, plafond 38, et la musculation au point pres a partir de 4 series. projectionRecup ecrivait 48 ET 24 en dur alors que RECUP_EFFACE_H existait depuis le 01/09 pour etre proprietaire unique -- et le 24 EST 48/2, donc les DEUX litteraux en dependaient ; corrige, invisible a H=48. CONTROLE NEGATIF : 14 rouges sur l ancien code. REGLE #11 : pop-up WHATS_NEW v70 (elle se merite -- un chiffre affiche tous les jours change tout seul, historique compris : mesure sur 60 jours REELS de Michel, 33 jours sur 60 bougent, TOUS vers le bas, de -1 a -6) + point rouge recup-cardio sur l Accueil + aide ? de l Accueil. REJEU DES 60 JOURS SUR SES VRAIES DONNEES (les deux moteurs, la vraie fonction des deux cotes) : 27 jours inchanges, 33 changes, ecart moyen -2,0, plus gros ecart -6, AUCUNE journee absurde. Deux causes seulement : le cardio enfin compte (26 jours) et le raccord des 48 h (6 jours, -4 a -6). Ses 27 cardios sont a 24/27 des echauffements de 4 a 12 min qui coutent -1 point ; les trois vrais sortent (20 min -2, 45 min -3, 62 min pour 3 series -5). LIMITE DITE : son historique ne contient aucun cardio long et intense, donc le haut du bareme n est pas valide par ses donnees. TROUVE DANS SON EXPORT, NON CORRIGE (hors perimetre A, decision de Michel) : SET_TYPES vaut N/E-accent/X et une migration a converti E->X et D->N, donc les multiplicateurs echec x1,5 et drop x1,3 de _penaliteSeance sont INATTEIGNABLES -- une serie a l echec compte comme une serie normale (mesure : 12 series N -> 20, 12 series X -> 20). Temoin permanent + entree du journal de test. Tests : calculs 290/290 (+22, blocs 12 et 13).
// 🌮 ft-v1121 = O TACOS SORT DE LA BASE. Decision de Michel : « vire-les ». Ses 5 lignes gardees etaient TOUTES des desserts -- Mix glace, Milkshake, Chantilly, deux Kinder Bueno -- et AUCUN TACOS. Taper « tacos » rendait donc une GLACE. UN MOT QUI NE DESIGNE PAS CE QU ON CROIT EST PIRE QU UN MOT QUI NE REND RIEN. ET CA RETABLIT UNE DECISION DEJA PRISE : en ft-v1113, tacos n avait deliberement PAS ete mappe dans la table nationale (« il n est pas dans la table, et on ne sert pas un kebab a sa place ») ; la base de marques contredisait cette decision sans qu on l ait voulu. On ne jette pas des valeurs FAUSSES -- on jette des valeurs JUSTES qui repondent a la mauvaise question. La source elle-meme mettait en garde : « ne pas presenter cette table comme une table France 2026 ». 128 -> 123 produits. R30 : le retrait est ecrit AVEC SA RAISON dans le generateur et FIGE PAR UN TEMOIN, sinon quelqu un les remettra dans six mois. ET L AIDE ECRITE LA VEILLE DEVENAIT FAUSSE (« taper tacos te rendra une glace ») : corrigee dans le meme mouvement -- une aide qui nomme un repere inexistant est pire qu une aide absente, 3e cas de la serie. Tests : parcours (bloc CCXXX), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// ⬆️ 23e collision (la 2e du jour) : session-A a publie SA ft-v1121 pendant que la suite tournait chez moi. Ma version devient ft-v1122. Le premier publie garde son numero -- et une suite de tests qui dure 15 min suffit a se faire doubler.
// 🍔 ft-v1120 = LA BASE FAST-FOOD PASSE DE 27 A 128 PRODUITS. Michel renvoie le classeur perdu, en VERSION 2 : 114 produits au lieu de 27, avec Quick (91 lignes, leur table officielle est tres complete), O Tacos et Subway. ALLER-RETOUR : 0 ECART sur 116 verifies -- chaque valeur rendue correspond a celle publiee, et le Big Mac tombe au chiffre pres sur l ancienne table : meme source, etendue. MAIS LA V2 SEULE AURAIT FAIT PERDRE TOUTES LES FRITES : dans ce classeur les frites de McDonald s, Burger King, KFC et Quick n ont QUE les calories, pas les macros -- une ligne sans macros ne peut pas alimenter un journal, le generateur les ecarte a juste titre. Remplacer aurait ete une REGRESSION DEGUISEE EN ENRICHISSEMENT. D ou une FUSION : 114 du classeur + 14 heritees. LES 14 HERITEES SONT FIGEES DANS LE GENERATEUR ET C EST UN PIS-ALLER ECRIT COMME TEL : leur classeur d origine est PERDU (dossier temporaire, conteneur redemarre), la sortie du 03/09 est leur seule trace. Une valeur dont on ne peut plus remonter a la source est une valeur qu on ne peut plus auditer ; si le classeur reapparait, ce bloc doit disparaitre. ET LE GARDE-FOU A DEJA SERVI LE JOUR MEME : la pizza 4 Fromages etait heritee le matin, la V2 la fournit avec des valeurs IDENTIQUES au chiffre pres, elle est repartie dans la source. Ce bloc doit RETRECIR, jamais grossir -- le generateur signale a chaque execution les lignes heritees qu un classeur fournit desormais. CONTROLES PASSES SUR LES 95 NOUVEAUX, et c est le bloc Quick qui avait ete DECALE la 1ere fois : 1 seule incoherence, le Korean Whopper (752 kcal annoncees contre 616 calculees) -- le doute DEJA CONNU et DEJA AFFICHE. 0 masse impossible, 0 incoherence de taille, 0 valeur aberrante. CE QUI N ENTRE PAS, ET C EST DIT : les 8 Subway (macros absentes) et 5 desserts O Tacos sans kcal. ET UN POINT A TRANCHER PAR MICHEL : O Tacos ne contient AUCUN TACOS, seulement 5 desserts (dont des Kinder Bueno), donc taper tacos rend une glace -- la source elle-meme demande de ne pas presenter cette table comme courante. Garde parce que la regle est la sienne (il faut tout mettre sinon autant rien mettre), signale parce qu il doit le savoir. Tests : parcours (bloc CCXXIX), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// ⬆️ 22e collision : session-A a publie SA ft-v1120 (base fast-food 27 -> 128 produits) pendant ce travail. Ma version devient ft-v1121 -- le premier publie garde son numero, le second se decale, jamais l inverse.
// 🔍 ft-v1119 = LES 2 DEFAUTS DE LA RECHERCHE ALIMENTAIRE, mesures le matin meme en auditant la base pour GPT. Michel : « corrige les 2 defauts de recherche ». (1) LA PONCTUATION RESTAIT COLLEE AU MOT TAPE : « Boulgour, cuit » ne rendait RIEN parce que le mot cherche devenait « boulgour, » avec sa virgule -- 4 cas sur 6 ; « Riz blanc, cuit » marchait PAR COINCIDENCE, la virgule tombant au meme endroit dans le nom de la table. Elle devient un ESPACE et non rien : supprimer un separateur recollerait deux mots qui n ont rien a voir. (2) LES MOTS-OUTILS ETAIENT EXIGES COMME SOUS-CHAINE : « filet de boeuf » ne rendait rien alors que 6116 Boeuf, filet cru existe -- « de » fait 2 lettres donc il etait conserve. ET CA MARCHAIT 7 FOIS SUR 8 PAR ACCIDENT : le « de » se trouve dans « viande », « Pomme de terre », « a la grecque », « au naturel ». Une regle qui ne marche que par accident marchera un jour de moins. R2 : les QUATRE recherches (aliments, complements, fast-food, son propre journal) decoupaient la frappe chacune de leur cote -- _afMots en est le proprietaire unique, et le commentaire de _afRang demandait deja qu elles corrigent au meme endroit. CE QU ON NE JETTE JAMAIS, nomme AVANT d ecrire une ligne : « sans » et « avec » (coca sans sucre deviendrait coca sucre, l exact contraire) et « the » (c est le THE une fois les accents retires). LA MESURE A DIT OU POSER LE FILTRE, ET C EST LA VRAIE LECON : 99 cles de la table d alias contiennent un mot-outil (pomme de terre, blanc de poulet, fromage de chevre). Les filtrer EN AMONT cassait ces 99 alias et faisait retomber « pomme de terre » sur la version CRUE. On retire les mots-outils pour CHERCHER, jamais pour RECONNAITRE. ET LA BARRE / EST VOLONTAIREMENT ABSENTE de la ponctuation espacee : elle n est pas necessaire (la virgule suffit) et l espacer d un seul cote rendrait la cle « lait 1/2 ecreme » introuvable -- une regle ajoutee pour etre complet peut faire disparaitre une entree en silence. CONTROLE NEGATIF par git stash, sur 82 requetes : 10 reparees, 4 nettement ameliorees (jarret de veau rendait « Osso buco a la milanaise », il rend « Veau, jarret cru »), 0 CASSEE. Tests : parcours (bloc CCXXVII), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// 🏃 ft-v1118 = UNE SEANCE DE CARDIO SEUL N EST PLUS INVISIBLE. Michel, deux retours le meme jour : « j ai fait 45 min de tapis et ma recup n a pas bouge » puis « on me dit que j ai pas fait le cardio hier ». UN SEUL DEFAUT DERRIERE LES DEUX, et c est la MESURE qui l a dit : la carte « seance manquee » ne peut PAS s afficher s il existe une seance ce jour-la (verifie sur les 4 facons de noter un cardio), donc AUCUNE seance n avait ete enregistree le 03/09. LE PIEGE : le bouton « ✓ Enregistrer le cardio » du bloc Cardio affichait « Cardio enregistre ✅ » et n enregistrait RIEN -- il replie le bloc. Le bouton qui enregistre pour de vrai est celui du BAS, et il s appelait... « 🏁 Enregistrer le cardio ». Deux boutons, presque les memes mots, un seul enregistre. ET LE PIRE N ETAIT PAS LE LIBELLE : startWorkout() remettait S.wkt a neuf des qu il n y avait pas d exercice, donc un aller-retour par l Accueil puis un tap sur le bouton rouge EFFACAIT 45 min de cardio EN SILENCE (regle d or #3, zero perte). QUATRE endroits lisaient « des exercices » la ou la question est « une seance ouverte » : le bouton de l Accueil, le toast d ouverture, le brouillon de secours, et startWorkout. _seanceOuverte() en est le proprietaire unique depuis le 02/08 (R2) -- il n a pas fallu ecrire une regle, seulement la lire. Le bouton du bloc dit maintenant « ✓ C est note », n est plus rouge (un seul bouton rouge par ecran, celui qui enregistre), et son message NOMME le bouton du bas en le lisant (_labelFinSeance, R2) au lieu de le recopier. Regle #11 : les 5 points, pop-up v69 MERITEE (un repere a bouge ET il y a un geste a connaitre). ET SA QUESTION SUIVANTE A TROUVE LA MEME FAMILLE UN CRAN PLUS LOIN : << pourquoi le cardio n apparait pas dans mon historique ? >>. Mesure : il Y EST, mais il s affichait << 💪 jeu. 3 sept. · 0 kg · 45 min · 351 kcal · — >> -- un emoji de muscle, un volume de zero, une figurine vide et un tiret. Techniquement present, humainement introuvable. Il n y a aucun muscle a nommer, donc le titre nomme ce que la seance EST (<< 🏃 Cardio >>) et la ligne du bas porte le cardio en clair ; << 0 kg >> ne disparait QUE dans ce cas. Verifie plutot que suppose : le calendrier marque deja le jour et le compteur du mois compte deja la seance (ils lisent les DATES, pas le volume). Au passage la cle technique sortait a l ecran (<< modere >>, sans accent) : CARDIO_INTENSITES, un seul proprietaire (R2). RESTE OUVERT ET DIT : le barime de recup du cardio (plancher de 6 points, autant que 4 series) attend un ordre de grandeur de Michel -- on n invente pas une echelle.
// 🥤 ft-v1117 = LE PIEGE DU COCA N ETAIT PAS CELUI DU COCA : IL Y EN A 9. Michel : « et les autres boissons ? ». MESURE : CIQUAL porte 9 PAIRES « X, sucre, avec edulcorants » / « X, sans sucres ajoutes, avec edulcorants » -- cola, limonade, tonic, boisson au the, boisson gazeuse (x3), boisson energisante, fromage blanc. Et « sucre » est TOUJOURS le nom le plus court, donc le tri choisissait systematiquement la version SUCREE quand on tape light ou zero. Le Coca n etait qu un cas sur 9. LE CORRECTIF STRUCTUREL A ETE REFUSE PAR LA MESURE, pas par l intuition : traduire zero/light en « sans sucres ajoutes » plutot qu en « edulcorants » corrige 3 cas ET EN CASSE 3 -- yaourt light ne rend PLUS RIEN, soda light tombe sur « Boisson gazeuse A LA POMME » (30 kcal, un autre produit), creme light devient un cappuccino. LIGHT NE VEUT PAS DIRE SANS SUCRE : un yaourt light est 0% de matiere grasse. Un mot qui a deux sens ne se traduit pas, il se DESIGNE -- d ou des alias par code. PIRE CAS TROUVE, ET IL DEPASSE LE COCA : lait amande rendait « Chocolat au lait aux fruits secs (noisettes, amandes) » a 559 kcal/100 g pour une boisson qui en fait 36. x 15,5. lait soja et lait avoine ne rendaient RIEN. Cause : CIQUAL ecrit « Boisson a... », on dit « lait de... ». ET ON NE TOUCHE PAS AU LAIT DE COCO : la table distingue le lait de coco CULINAIRE (18041, 199 kcal) de la BOISSON a la noix de coco (18907, 30). Deux produits differents ; les fusionner ferait exactement le degat qu on repare -- et mesure, « lait de coco » trouve DEJA le bon. rose rendait « ROSETTE ou fuseau », le saucisson a 392 kcal, pour un vin qui en fait 69 (famille hampe/champetre : la recherche compare des SOUS-CHAINES). Sur 80 boissons courantes : 28 sans resultat -> 9. Ce qui reste absent est LISTE : powerade, gatorade, isotonique (aucune boisson isotonique dans CIQUAL), mojito, ginger beer, cream soda, whey, shaker. Tests : parcours (bloc CCXXV), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// 🥤 ft-v1116 = LE COCA ZERO ETAIT COMPTE 24 FOIS TROP. Michel, en notant son repas de midi : « corrige le coca zero ». MESURE : coca zero rendait « Cola, SUCRE, avec edulcorants » (18037, 24 kcal/100 g) AVANT « Cola, SANS SUCRES AJOUTES, avec edulcorants » (18060, 1 kcal/100 g). Sur une canette de 50 cl : 120 kcal enregistrees au lieu de 5. LA CAUSE N EST PAS UNE FAUTE DE LA TRADUCTION, c est sa LIMITE : zero et light sont traduits en « edulcorants », or les DEUX lignes portent ce mot -- c est alors le tri par NOM LE PLUS COURT qui tranche, et il tranche mal. Un mot traduit designe une FAMILLE, pas un aliment ; quand la famille contient le CONTRAIRE de ce qu on cherche, il faut le CODE. C est exactement la frontiere entre FOOD_SYNONYMES et la table d alias, ecrite en ft-v1115 et verifiee ici sur un vrai cas. ON NE RETIRE PAS 18037 : c est le bon aliment pour un cola sucre aux edulcorants (type stevia). On l empeche seulement de repondre a la place du zero -- et il reste JUSTE DESSOUS dans la liste (R29). 13 alias ajoutes (coca/coke/cola/pepsi x zero/light/max/sans sucre), plus les deux variantes SANS CAFEINE que CIQUAL distingue et qu on ne fusionne pas. ILS VIVENT DANS tools/alias.py ET NON DANS data/alias.json : ce fichier est GENERE, une retouche a la main y disparaitrait a la prochaine execution, sans bruit (R27). Rien d autre ne bouge : coca rend toujours Cola sucre (40 kcal), cola et soda sont inchanges. Tests : parcours (bloc CCXXIV), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// 🥗 ft-v1115 = LES MOTS QU ON EMPLOIE ATTEIGNENT UN ALIMENT PRECIS. Michel fournit la table d alias V2 de GPT (602 mots), construite sur l export CSV de notre propre base -- l audit que je lui avais livre le matin. ELLE NE CREE AUCUNE VALEUR NUTRITIONNELLE : un alias est une PORTE vers un code CIQUAL existant. Verifie ligne a ligne a l import (tools/alias.py) : 0 macro divergente, 0 libelle divergent, 0 alias ambigu sur 569. MESURE AVANT DE BRANCHER, et c est ce qui dit ce que la version apporte : 219 mots etaient DEJA justes, 153 ne rendaient RIEN (tortiglioni, fettuccine, riz jasmin, arborio, sticky rice, pappardelle), 135 trouvaient la bonne cible sans la mettre en tete, et 62 rendaient un AUTRE aliment -- riz japonais rendait un BISCUIT APERITIF, patate rendait une patate DOUCE, tradition rendait du CIDRE. DECISION DE MICHEL sur les 13 cas cru/cuit : « les deux, le cuit en premier ». riz rend Riz blanc cuit (155 kcal) puis Riz blanc cru (350) juste dessous : personne ne perd son aliment, et celui qu on mange le plus souvent est en tete. R29, informer sans decider. POURQUOI UN CODE ET NON UNE REQUETE, ce qui distingue cette table de FOOD_SYNONYMES : celle-la traduit une frappe en une autre frappe puis laisse le classement trier -- parfait pour ouvrir une FAMILLE (mcdo), inutilisable pour designer UN aliment, puisque c est le tri par longueur de nom qui fait remonter Veau steak hache 15% avant le boeuf. UN ALIAS QUI PORTE LE CODE NE SUBIT AUCUN CLASSEMENT. R2 : un meme mot ne peut pas etre dans les deux tables, le generateur le refuse. CORRESPONDANCE SUR LA REQUETE ENTIERE, jamais sur un mot : riz est un alias, riz au lait n en est pas un et suit la recherche normale. UNE ERREUR TROUVEE CHEZ GPT : tomate visait 20189 Tomate sechee, dont les kcal sont NON DETERMINEES dans CIQUAL -- l app ne peut JAMAIS la proposer. Un alias qui ouvre une porte fermee est pire qu un alias absent : la personne croit avoir cherche. Corrige vers l aliment moyen, et la correction est NOMMEE et imprimee par le generateur, jamais silencieuse. 58 mots restent hors CIQUAL et sont LISTES plutot que tus : whey, creatine, naan, chapati, biryani. Tests : parcours (bloc CCXXIII), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// 🍔 ft-v1114 = ON MET TOUT ET ON MARQUE LE DOUTE, AU LIEU D ECARTER. Michel : « il faut que je puisse trouver les noms comme big Mac ou pizza 4 fromages » -- et il a fourni lui-meme le classeur des valeurs officielles, la source que ce conteneur ne pouvait pas atteindre (le proxy bloque mcdonalds.fr en 403). 27 produits dans data/marques.json, generes par tools/marques.py. R13/R2 : AUCUN nouveau mecanisme -- le chargeur, la recherche et le remplissage sont ceux de CIQUAL ; seule la table change. LA DECISION QUI PORTE LA VERSION EST DE MICHEL : « il faut tout mettre sinon autant rien mettre c est logique ». Ma premiere version ECARTAIT les 4 lignes douteuses (Korean Whopper : 752 kcal annoncees contre 616 calculees depuis ses propres macros ; 3 lignes KFC en pieces qui se divisent par deux). Il a raison et c est mesurable : UNE LIGNE ABSENTE POUSSE VERS L ESTIMATION IA, QUI EST PIRE QU UNE VALEUR PUBLIEE DOUTEUSE -- c est exactement le mecanisme qui a fabrique son pot de proteine faux (ft-v1103/1104/1105). On montre donc la valeur ET ce qui cloche, avec le chiffre qui permet de juger (« 38 kcal/piece »). R29 : informer sans decider. LE DOUTE DESCEND JUSQU A LA DONNEE (R4) : il s affiche dans la liste, se redit dans le formulaire, ET reste attache a la ligne enregistree -- la liste blanche de _provFood l avait laisse tomber, 3e fois au meme endroit. LES 4 VALEURS POUR-100 g SONT DERIVEES DE LA PORTION, jamais recopiees des colonnes arrondies du classeur : mon premier jet transcrivait, et le Big Mac sortait a 28 g de proteines au lieu des 27 publies. Aller-retour : 0 ecart sur 23 produits. LE PREMIER CLASSEUR AVAIT UN DECALAGE nom <-> ligne nutritionnelle sur le bloc Quick, et mon detecteur n en voyait que le symptome sur 6 lignes : j aurais importe 85 lignes decalees en croyant le degat borne. Michel a renvoye un fichier CONTROLE. ET LE TEXTE DE LA QUANTITE CHANGE DE SENS (R14) : « verifie ta dosette » est absurde devant un Big Mac -- 232 g est le poids de la portion publiee. Tests : parcours (bloc CCXXII), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// 🍔 ft-v1113 = LES MOTS QU ON DIT ATTEIGNENT LES ALIMENTS QU ILS NOMMENT. Michel : « il n y a pas de fast food ? » puis « fais les synonymes et Mac Donald, avec les sandwichs qui vont avec ». MESURE DANS LA VRAIE RECHERCHE : coca ne rendait RIEN alors que « Cola, sucre » est dans le fichier -- UNE LETTRE d ecart ; soda rien alors que 94 « Boisson gazeuse » y sont ; mcdo, macdo, fast food rien alors que 6 aliments « de restauration rapide » y sont. La donnee est la, la porte n existe pas. ET LE TROU EST INVISIBLE AU BUREAU, BEANT A LA SALLE : en ligne, Open Food Facts rattrape ; hors ligne on n a rien, alors que l aliment est DANS le telephone (regle d or #4). CE QUI N EST PAS FAIT, ET C EST UNE DECISION : aucun chiffre de marque n est ecrit -- un Big Mac a un poids et des macros que je ne peux pas SOURCER d ici, et les taper de memoire fabriquerait une valeur credible et fausse (§34). Les synonymes ouvrent la FAMILLE reelle de la table nationale, dont le nom dit lui-meme « de restauration rapide ». ON REPARTIT, ON N EMPILE PAS : en enchainant les requetes, « mcdo » rendait six sandwichs et coupait les frites et les nuggets -- or qui tape « mcdo » compose un MENU. light et zero n existaient dans AUCUN des 3 484 noms (mesure) : les mapper ne casse aucune recherche. tacos N EST PAS MAPPE, expres. R2 : la recherche ne change pas, c est la REQUETE qu on traduit avant de la lancer. Tests : parcours (bloc CCXXI), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
// ⬆️ 21e collision : session-A a publie SA ft-v1100 (une seule source pour les plages de
// poids) pendant ce travail, ET nomme son bloc de test CCVI. Ma version devient ft-v1101,
// mon bloc CCVIII — un numero de cache ne recule jamais, on ne renumerote pas l'autre.
// ⬇️ Le recit de LEUR ft-v1100, garde tel quel :
// ⚖️ UNE SEULE SOURCE POUR LES PLAGES DE POIDS ATTENDUES. ⛔⛔ MESURE : +1,6 kg/semaine en « prise de muscle » partait vers Milo comme « ✓ dans la bonne direction », pendant que l'ecran affichait juste a cote « evolution attendue : +0.1 a +0.3 kg/sem ». Cinq fois la borne haute. Une seule des six bornes etait une DONNEE (_GOAL_TREND_RECOMP) ; les cinq autres ne vivaient qu'en PROSE dans la chaine `goalDir` d'un affichage, et coach.js jugeait avec des seuils ECRITS AILLEURS (> 0.05, < -0.1, |x| < 0.2). C'est R4 double de R2. ⛔ Table unique `_GOAL_TREND`, valeurs TRANSCRITES au caractere pres depuis les phrases deja affichees — rien d'invente. Le texte de l'ecran est desormais DERIVE de la table, la couleur aussi (avant, +1,6 s'affichait en VERT sous une phrase annoncant +0.1 a +0.3). ⭐⭐ ET DEUX DEFAUTS DE MA PROPRE CORRECTION ONT ETE TROUVES PAR DES TEMOINS EXISTANTS, pas par relecture : ① sur une plage NEGATIVE, « au-dessus » veut dire MOINS — perdre 0,21 quand on vise 0,3-0,7 est plus LENT, pas plus rapide ; ② une plage qui FINIT A ZERO (recomposition) n'a pas d'axe « plus vite » vers le haut — a +0,7 on PREND du poids, on ne perd plus du tout. Le mot ne se lit pas sur le nombre, il se lit sur le SENS de l'objectif. ⛔ Un temoin permanent refuse toute plage kg/sem reecrite en dur hors de state.js : c'est la rechute a empecher. ⚠️ Ce correctif change ce que Milo RECOIT : le drapeau est verifie en local, ce qu'il en DIT demanderait une passe payante du banc d'essai (R34). ⭐ Livre avec 5 documents de specification pour GPT (seuil de bruit du e1RM, journal des mensurations, maquette rendue, alternatives a « calories restantes ») — le moteur de tendance N'EST PAS construit.
// 🚪 ft-v1099 = LA TROISIEME PORTE VERS L'EFFACEMENT · LES BORNES DU PROFIL RESTAURE · UN LIBELLE DE BADGE. Michel : « on continue sur les incoherences ? ». Six familles neuves, hors nutrition (session-A y travaille), deux ont mordu. ⛔⛔ ① CHARGER UN PROGRAMME EFFACAIT UNE SEANCE EN COURS SANS UN MOT : `loadProg` fait `S.wkt = {…}`. Mesure par les vraies fonctions — 3 series FAITES sur 2 exercices → 0, et `ft4_wkt` reecrit sur le DISQUE. Le rechargement ne les ramene pas. REGLE D'OR #3. ⭐⭐ LE TEMOIN DE COMPARAISON EST A QUINZE LIGNES DANS LE MEME FICHIER : « Annuler la seance » et « Vider la seance » detruisent la MEME chose et demandent toutes les deux. Trois portes, deux gardees (R8) — et le texte de « Vider » dit meme « pratique si tu as charge le mauvais programme » : l'app avait PREVU l'erreur sans empecher sa version destructrice. ⛔ On ne demande QUE s'il y a quelque chose a perdre (R29/R24) : ouvrir l'app et charger son programme ne pose aucune question. ⛔⛔ ② LE PROFIL RESTAURE N'AVAIT AUCUNE BORNE alors que la saisie manuelle en a. Memes valeurs par les deux chemins : a la main REFUSE, restaure ACCEPTE — age 500, taille 20 cm, repos 999 999 s. TDEE = -2 433 kcal, et Milo recevait « 500 ans » comme un fait sur la personne. C'est §35 pour la 5e fois, toujours dans le meme sens. ⚠️⚠️ ET CA NE SE VOYAIT PAS : le plancher de `calcMacros` ramene la cible affichee a 1 500 kcal — un chiffre plausible au-dessus d'un calcul qui n'a plus de sens. Un seul proprietaire des bornes (R2), a cote de `_poidsValide`. ⛔ ③ LE BADGE disait « 5 PRs battus » ; le code compte les EXERCICES ayant un record. Une seule seance a 5 exercices, zero record ameliore → badge debloque. On corrige le TEXTE : durcir le code RETIRERAIT le badge a ceux qui l'ont deja (R29). ⚠️ Quatre familles ont rendu du VIDE, ecrit pour ne pas refaire la chasse : la navigation (7 ecrans atteignables, un ecran bidon ne casse rien), les badges sur compte vide (0 debloque a tort), une seance en cours survit intacte a une restauration, et le cycle de force n'a pas pu etre mesure proprement — mes 3 sondes se sont trompees de champ (`exercises` pris pour `rm1s`, `S.wkt.start` pour `.exs`, `active` oublie), et chaque fois le signe etait le meme : UN RESULTAT IDENTIQUE DES DEUX COTES.
// 🔭 LA NUTRITION : LA CIBLE DU JOUR N'EST PAS LA CIBLE DE TOUS LES JOURS. ⛔⛔ DEFAUT 1, LA FREQUENCE : `cycleGlucides` faisait `f = round(somme / wk.length)` avec wk.length = 4, TOUJOURS — il divisait donc par des semaines ou la personne n'avait pas encore installe l'app. Mesure : 2 semaines a 3 seances/sem se lisaient 2 ; 1 semaine a 4 seances/sem se lisait 1. ⚠️ Et l'effet est A L'ENVERS : l'amplitude vaut (7-f)/7, donc plus f est petit plus l'ecart impose est GRAND — le pratiquant le plus recent, celui dont on sait le moins, recevait le cyclage le plus agressif (52 g de lipides pour un plancher a 50,4). ⭐ Son voisin `_pendingFreqContext` se protegeait DEJA : R8, encore. ⛔ Le bon denominateur n'est PAS les semaines non vides (une semaine SAUTEE fait partie de la frequence) mais l'ETENDUE de l'historique — et en `ceil`, pas en `round` : un temoin existant l'a attrape (-67 g sur la neutralite hebdo). ⛔⛔ DEFAUT 2, L'AFFICHAGE : le moteur prescrit a la MEME personne 368 a 478 g de glucides et 56 a 82 g de lipides selon le jour (26 % et 38 % d'amplitude) — l'ecran n'en montrait qu'un, sans dire lequel. C'est ft-v1027 : deux valeurs justes, une seule affichee. La carte NOMME le jour, les DEUX bouts vivent dans l'aide (R25), et ils sont calcules par le moteur, pas par l'ecran (R2). ⭐⭐ ET LA ZONE N'A AUCUN POURCENTAGE INVENTE : elle etait deja calculee. Les PROTEINES n'en ont pas (amplitude 0 g) et on ne leur en invente pas une (R29). ⚠⚠ CE DOCUMENT S'EST TROMPE : mon analyse du matin ecrivait `lipides 56 g = plancher` — faux, c'est une CIBLE (bw x 0,9 = 76 g), 56 g est la valeur d'un jour de seance, le plancher vaut 50,4. La decision 4 posee a Michel reposait sur MON erreur : retiree. ⭐ Au passage, une demi-portion s'ecrit `1½` et non `1.5` — trouve a la CAPTURE, un seul proprietaire du libelle. Nouvelle famille §37 de BUGS.md.
// ⬆️ 20e collision : session-A a publie ft-v1094, ft-v1095 PUIS ft-v1096 pendant ce travail,
// et leur bloc de test s'appelait deja CCIII. Ma version devient ft-v1097 et mon bloc CCIV —
// un numero de cache ne recule jamais, et on ne renumerote pas le travail de l'autre.
// ⬇️ Le recit de LEUR ft-v1096 (bornes du poids lu par l'IA), garde tel quel :
// 6e passe des imports : LE POIDS LU PAR L'IA A LES MEMES BORNES QUE LE POIDS SAISI A LA MAIN. ⛔⛔ CE QUI PASSAIT : un rapport de balance mal lu a 3 000 kg entrait dans le journal de poids et dans le profil — TDEE 47 900 kcal, et tous les objectifs de nutrition faux ensuite. La saisie MANUELLE du meme chiffre, elle, etait refusee depuis toujours (20-300 kg). ⭐ C'est R8 pour la 4e fois cette semaine, et le motif est constant : LE CHEMIN AUTOMATIQUE EST TOUJOURS LE MOINS PROTEGE que son equivalent manuel — le manuel a une personne devant lui, l'automatique n'a personne. ⛔ UN SEUL PROPRIETAIRE des bornes (`_poidsValide`, `_pctGrasValide` dans state.js, R2). ⛔ ON ECARTE LA VALEUR, PAS LE BILAN : un % de gras hors 3-70 est mis de cote, les 11 autres mesures restent ; un POIDS aberrant, lui, refuse l'enregistrement — il contamine le profil entier. ⭐ ET LE REFUS DIT OU REGARDER : « la lecture de la photo s'est trompee » quand ca vient de l'IA, « corrige la valeur » quand c'est saisi a la main. ⏭️ CE QUI RESTE, dit plutot que sous-entendu : l'import de PROGRAMME et le CODE-BARRES ne sont toujours pas instruits. ⚠️⚠️ ET MA SONDE A INVENTE UN NOM DE CHAMP TROIS FOIS (`ft4_weight` pour `ft4_wlog`, `fatPct` pour `bf`, `p/c/f` pour `prot/carbs/fat`) : chacun rend ZERO, et zero ressemble a un bug. Nouvelle famille §36 de BUGS.md.
// ⬆️ Pas de collision : session-B n'a pas pris de numero depuis ft-v1092. Leur recit est
// garde plus bas.
// ⬆️ Session-B a livre sa ft-v1092 puis un abaissement du seuil du journal (sans prendre de
// numero) : pas de collision cette fois. Leur recit ft-v1092 est garde juste en dessous.
// ⬆️ 18e collision : session-B a publie SA ft-v1092 (la sante dans sa propre cle) pendant ce
// chantier. Ma version devient ft-v1093 — UN NUMERO DE CACHE NE RECULE JAMAIS. Leur recit est
// garde juste en dessous, intact.
// 🔐 ft-v1092 = LES DONNEES DE SANTE VIVENT DANS LEUR PROPRE CLE DE STOCKAGE. Idee de Michel : « on peut pas creer une section sante pour eviter justement que tout se trouve dans le meme JSON ? ». ⭐⭐ ELLE EST PLUS FORTE QUE LA PROMESSE QU'ON VENAIT D'ECRIRE : la politique dit que les outils de diagnostic ne montrent que le necessaire — garantie de COMPORTEMENT, l'outil CHOISIT de ne pas montrer. Avec deux cles (`u_` et `h_`) elle devient une garantie de CONSTRUCTION : ***l'outil ne l'a pas en main***. C'est toujours la seconde qui tient. ⛔⛔ LE GARDE-FOU TIENT EN UNE PHRASE : la sante est ecrite dans `h_` **ET RELUE** avant d'etre retiree de `u_`. Script Properties n'a pas de transaction — `h_` echoue → on ne retire rien ; `u_` echoue apres → la sante est aux DEUX endroits et la lecture prefere `h_`. *Il n'existe aucun ordre ou la sante est retiree avant d'etre confirmee ailleurs.* ⛔ REPLI S
const PRECACHE = [
  './', './index.html', './style.css', './confidentialite.html',
  './constants.js', './state.js', './screens.js', './log.js',
  './setup.js', './tracking.js', './coach.js', './app.js', './food-health.js',
  /* ⛔⛔ `supabase.js` MANQUAIT ICI, ET C'ETAIT LE SEUL DES 10 (31/08/2026). Trouve en
     repondant a Michel sur le miroir de sauvegarde. Les 9 autres scripts servis par
     `index.html` etaient preches ; celui-la non, et sans raison ecrite (contrairement a
     `data/ciqual.json`, dont l'exclusion est argumentee juste en dessous — R30).
     ⚠️ LA PANNE ETAIT SILENCIEUSE ET ELLE TOUCHAIT UNE SAUVEGARDE : app ouverte hors ligne
     apres une mise a jour → la balise `<script>` echoue → `sbMirror` n'existe pas → le
     `try/catch` de `_cloudSync` avale l'absence, et la copie miroir est morte pour toute la
     session, sans un mot. *Une sauvegarde dont on ne verifie jamais qu'elle ecrit est pire
     que pas de sauvegarde* — c'est l'en-tete de `supabase.js` lui-meme. */
  './supabase.js',
  './manifest.json', './logo.png', './female-body.png',
  /* ⛔ `data/ciqual.json` ET `data/complalim.json` NE SONT VOLONTAIREMENT PAS ICI (22/08/2026). Le préchargement
     tourne à CHAQUE mise à jour du cache : ce serait 250 Ko re-téléchargés à chaque version,
     pour une base que beaucoup n'ouvriront jamais. Elle est mise en cache À LA DEMANDE par la
     branche « autres assets locaux » plus bas — donc disponible hors ligne dès la 1ʳᵉ
     recherche d'aliment, sans jamais peser sur l'installation (règle d'or #4).
     ⚠️ Retrait DÉCIDÉ, écrit pour ne pas être « réparé » plus tard (R30). */
  // Librairie PDF (hébergée en local pour marcher hors-ligne — chargée à la demande)
  './lib/jspdf.umd.min.js', './lib/jspdf.plugin.autotable.min.js',
  // Lecteur Excel (SheetJS, local) — import de fichiers balance .xlsx/.xls, chargé à la demande
  './lib/xlsx.full.min.js',
  // Lecteur code-barres (ZXing, local) — scan produit dans le journal alimentaire, chargé à la demande
  './lib/zxing.min.js',
  // Polices (hébergées localement — plus de dépendance Google Fonts)
  './fonts/manrope-variable.woff2', './fonts/spacegrotesk-variable.woff2', './fonts/pacifico-400.woff2',
  './force-tracker-logo-gray.png', './force-tracker-logo-splash.gif', './force-tracker-logo-topbar.gif', './force-tracker-logo-final.png',
  // Captures d'écran du guide-film (Menu → Guide de l'application)
  './guide/home.jpg','./guide/etat-du-jour.jpg','./guide/profil.jpg','./guide/seance.jpg',
  './guide/recup-moniteur.jpg','./guide/calendrier.jpg','./guide/programmes.jpg','./guide/progres.jpg','./guide/bilan.jpg','./guide/coach.jpg','./guide/milo-direct.jpg','./guide/milo-seance.jpg','./guide/milo-completer.jpg','./guide/milo-frequence.jpg','./guide/milo-apprend.jpg','./guide/milo-memoire.jpg',
  // Photos accessoires (Guide de la muscu → Matériel) — les fichiers absents ne sont PAS listés ici (sinon l'install du SW échoue)
  './accessoires/ceinture-souple.jpg','./accessoires/ceinture-cuir-levier.jpg','./accessoires/ceinture-cuir-ardillon.jpg',
  './accessoires/sangles.jpg','./accessoires/genouilleres.jpg','./accessoires/chaussures.jpg',
  './accessoires/wrist-wraps.jpg','./accessoires/magnesie-bloc.jpg','./accessoires/magnesie-liquide.jpg',
  // Muscles SVG + PNG
  './muscles/abs.svg','./muscles/arms.svg','./muscles/back.svg','./muscles/calves.svg',
  './muscles/chest.svg','./muscles/glutes.svg','./muscles/legs.svg','./muscles/shoulders.svg',
  // Icônes muscle réalistes (vignettes programme + picker)
  './muscles/muscle pectoreaux.png','./muscles/muscles dorsaux trapeze.png','./muscles/epaule trapeze.png',
  './muscles/muscle bras.png','./muscles/muscle avant cuisse.png','./muscles/fessiers ischios.png',
  './muscles/muscle abdominaux.png','./muscles/muscle mollet.png',
  // GIFs exercices pectoraux + fessiers
  './exercises/developpe-couche.webp',
  './exercises/developpe-couche-halteres-exercice-musculation.webp',
  './exercises/developpe-couche-smith-machine.webp',
  './exercises/developpe-decline-barre.webp',
  './exercises/developpe-incline-barre.webp',
  './exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.webp','./exercises/ecarte-couche-halteres.webp',
  './exercises/ecartes-decline-avec-halteres.webp',
  './exercises/pec-deck-butterfly-exercice-musculation.webp',
  './exercises/developpe-incline-halteres-exercice-musculation.webp',
  './exercises/ecartes-poulie-vis-a-vis.webp',
  './exercises/developpe-machine-assis-pectoraux.webp',
  './exercises/developpe-incline-machine-convergente-exercice-musculation.webp',
  './exercises/dips-pectoraux.webp',
  './exercises/glute-bridge.webp',
  // Fessiers / Ischios / Jambes / Soulevés de terre
  './exercises/souleve-de-terre.webp','./exercises/souleve-de-terre-sumo.webp','./exercises/rack-pull.webp',
  './exercises/good-morning-exercice.webp','./exercises/extension-lombaire-au-banc-45.webp',
  './exercises/homme-faisant-un-squat-avec-barre.webp','./exercises/front-squat-avec-halteres.webp',
  './exercises/squat-goblet-kettlebell.webp','./exercises/fente-avant-barre-femme.webp',
  './exercises/leg-curl-allonge.webp','./exercises/leg-curl-assis-machine.webp',
  './exercises/souleve-de-terre-jambes-tendues.webp','./exercises/souleve-de-terre-roumain-kettlebell.webp','./exercises/souleve-de-terre-roumain-landmine.webp',
  './exercises/deadlift-sumo-halteres-exercice-jambes-fessiers.webp','./exercises/souleve-de-terre-sumo-kettlebell.webp','./exercises/souleve-de-terre-sumo-landmine.webp',
  './exercises/souleve-de-terre-a-la-trap-bar.webp','./exercises/souleve-de-terre-avec-deficit.webp','./exercises/souleve-de-terre-avec-machine.webp',
  './exercises/zercher-deadlift.webp','./exercises/reeves-deadlift.webp','./exercises/glute-ham-developer-ghd.webp','./exercises/kettlebell-swing.webp',
  './exercises/squat-pistol.webp','./exercises/kettlebell-back-squat.webp','./exercises/fentes-avant-kettlebell.webp',
  './exercises/leg-curl-avec-elastique-musculation.webp','./exercises/leg-curl-decline-haltere.webp','./exercises/leg-curl-inverse-machine-tirage-vertical.webp','./exercises/leg-curl-unilateral-debout-machine.webp',
  // Dos / Trapèzes / Lombaires
  './exercises/rowing-barre.webp','./exercises/rowing-haltere-un-bras.webp','./exercises/tirage-horizontal-poulie.webp',
  './exercises/rowing-assis-machine-prise-pronation.webp','./exercises/rowing-assis-machine-hammer-strenght.webp','./exercises/rowing-halteres-banc-incline-prise-neutre.webp',
  './exercises/tirage-vertical-poitrine.webp','./exercises/tirage-vertical-prise-serree.webp','./exercises/tirage-horizontal-prise-large.webp','./exercises/tirage-horizontal-poulie-prise-serree.webp',
  './exercises/traction-musculation-dos.webp','./exercises/traction-assistee-machine.webp','./exercises/traction-prise-neutre.webp',
  './exercises/pullover-haltere.webp','./exercises/musculation-pull-over-assis-machine.webp',
  './exercises/shrug-barre.webp','./exercises/shrugs-avec-halteres.webp','./exercises/shrug-poulie-haussement-epaules.webp',
  './exercises/extension-lombaire-a-la-machine.webp',
  './exercises/rowing-smith-machine.webp','./exercises/rowing-t-bar-machine.webp','./exercises/rowing-barre-t-landmine.webp',
  './exercises/bent-over-row-avec-halteres.webp','./exercises/rowing-unilateral-landmine-meadows-row.webp','./exercises/seal-row-halteres.webp','./exercises/renegade-row.webp',
  './exercises/tirage-avant-iso-laterale-hammer-strength.webp','./exercises/tirage-incline-poulie-haute.webp','./exercises/tirage-vertical-prise-inversee.webp',
  './exercises/traction-barre-derriere-rear-oull-up.webp','./exercises/rocky-pull-up.webp','./exercises/sled-pull.webp',
  './exercises/pull-over-barre.webp','./exercises/pull-over-poulie.webp','./exercises/superman.webp','./exercises/overhead-shrug.webp',
  // Cuisses / Quadriceps
  './exercises/squat-bulgare-halteres-exercice-musculation.webp','./exercises/squat-smith-machine-exercice-musculation.webp','./exercises/leg-extension-exercice-musculation.webp',
  './exercises/fentes-marchees-avec-sandbag.webp','./exercises/split-squat-smith-machine.webp','./exercises/hip-thrust-a-la-machine.webp','./exercises/marche-du-fermier-avec-kettlebells.webp',
  './exercises/leg-extension-iso-lateral-unilateral-hammer-strenght.webp','./exercises/hack-squat-inverse.webp','./exercises/pendulum-squat.webp','./exercises/belt-squat.webp','./exercises/safety-bar-squat.webp',
  './exercises/overhead-squat.webp','./exercises/pin-squat.webp','./exercises/sissy-squat.webp','./exercises/cossack-squat.webp','./exercises/squat-bande-elastique.webp',
  './exercises/squat-statique-contre-mur-exercice-chaise.webp','./exercises/presse-cuisse-iso-laterale-hammer-stenght.webp','./exercises/sled-push-hyrox.webp','./exercises/croix-de-fer-halteres.webp',
  './exercises/leg-abduction-machine-v2.webp','./exercises/leg-adduction-machine-v2.webp',
  './exercises/chest-press-machine-declinee.webp','./exercises/dips-triceps-paralleles.webp','./exercises/montees-banc-lateral-halteres.webp',
  './exercises/dips-assiste-machine.webp','./exercises/developpe-nuque-barre-guidee.webp',
  './exercises/dips-assis-machine-avec-poids.webp',
  // Épaules + Trapèzes (lot 2026-07-06)
  './exercises/developpe-arnold-exercice-musculation.webp','./exercises/developpe-epaule-halteres.webp','./exercises/developpe-militaire-exercice-musculation.webp',
  './exercises/elevation-laterale-machine.webp','./exercises/elevations-frontales-exercice-musculation.webp','./exercises/elevations-laterales-exercice-musculation.webp',
  './exercises/elevations-laterales-poulie.webp','./exercises/face-pull.webp','./exercises/pec-deck-inverse.webp',
  './exercises/presse-epaule-exercice-musculation.webp','./exercises/elevation-en-y-a-la-poulie.webp','./exercises/oiseau-assis-sur-banc.webp',
  './exercises/tirage-menton-machine-guidee.webp','./exercises/tirage-menton-avec-kettlebell.webp','./exercises/developpe-epaule-avec-kettlebell.webp',
  './exercises/developpe-landmine.webp','./exercises/ecarte-arriere-elastique.webp','./exercises/elevation-frontale-allongee-a-la-barre.webp',
  './exercises/elevation-laterale-a-la-poulie-en-inclinaison.webp','./exercises/elevation-laterale-landmine-exercice-musculation.webp','./exercises/elevation-laterales-avec-kettlebell.webp',
  './exercises/exercice-rotation-interne-epaule-elastique-renforcement-coiffe-rotateurs-prevention-blessures-musculation.webp','./exercises/face-pull-couche-a-la-poulie.webp','./exercises/oiseau-a-la-poulie-a-45.webp',
  './exercises/passage-depaule-avec-elastique.webp','./exercises/rotation-externe-de-epaule-en-abduction.webp','./exercises/rotation-externe-epaule-exercice-renforcement-elastique.webp',
  './exercises/rotation-interne-a-90-a-la-poulie.webp',
  // Épaules + Trapèzes — 2e partie (lot 2026-07-06)
  './exercises/developpe-epaules-smith-machine.webp','./exercises/elevation-frontale-poulie-basse.webp','./exercises/elevation-frontale-banc-incline.webp',
  './exercises/elevation-laterale-incline-haltere.webp','./exercises/rotation-externe-epaule-haltere.webp','./exercises/tirage-menton-avec-elastique.webp',
  './exercises/thruster.webp','./exercises/thruster-kettlebell.webp','./exercises/russian-twist-avec-developpe-epaule.webp',
  './exercises/shoulder-press-machine.webp',
  // Images machines press jambes
  './machine/press-jambes-1.png','./machine/press-jambes-2.jpg','./machine/press-jambes-3.jpg',
  './machine/press-jambes-4.jpg','./machine/press-jambes-5.jpg','./machine/press-jambes-6.jpg',
  // Anatomie
  './anatomy/corps entier/schema homme entier face avant arriere et côté.png',
  './anatomy/pectoreaux/schema pectoreaux.png',
  './anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png',
  './anatomy/epaules/schéma epaule arriere.png',
  './anatomy/bras biceps triceps/schema muscles bras et avant bras.png',
  './anatomy/abdominaux/schema abdominaux.png',
  './anatomy/jambes/jambes avant/jambes face avant.png',
  './anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png',
  './anatomy/fessiers lombaires/schema lombaires fessiers.png',
  './anatomy/Vue des Nerfs/vue nerf.png',
  './anatomy/Vue des Os avec nerfs sciatiques/os et nerfs.png',
];

// Sentinelle de « santé du cache » : un fichier du CORE (précaché à l'install). S'il manque, c'est
// que le cache a été vidé (iOS/manuel) → on réinstalle le CORE (rapide). ⚠️ NE PAS pointer sur
// une figurine (le CORE seul ne les contient pas → fausse « absence »). Fix 2026-07-13.
const PRECACHE_SENTINEL = './style.css';

// ── DEUX TIROIRS SÉPARÉS (fix 2026-07-16, demande Michel) ─────────────────────
// CACHE (versionné, tout en haut) = le CODE (html/js/css/polices/libs/logos) : petit, change à
//   chaque mise à jour → renouvelé à chaque version (garantit qu'on reçoit bien le nouveau code).
// IMG_CACHE (nom STABLE ci-dessous) = les IMAGES (exercices/anatomie/guide/accessoires/muscles) :
//   ~15 Mo, ne changent quasi jamais. Ce tiroir n'est JAMAIS vidé par une mise à jour → les images
//   sont téléchargées UNE SEULE FOIS (1re install) puis CONSERVÉES sur le téléphone. Fini le
//   re-téléchargement des 15 Mo à chaque MAJ (qui mangeait la data et saturait la 4G).
const IMG_CACHE = 'ft-images';
/* 🔤 TIROIR STABLE DU MOTEUR OCR (23/08/2026, ft-v974) — ≈ 2,5 Mo (wasm + modèle français).
   ⛔ Il n'est PAS dans le PRECACHE : la plupart des gens ne scanneront jamais un rapport de
   balance, et l'ouverture ne doit rien attendre (règle d'or #4). Il se télécharge à la
   PREMIÈRE lecture d'un rapport, comme CIQUAL.
   ⛔⛔ MAIS IL A SON PROPRE TIROIR, et c'est le point qui compte : le tiroir CACHE est
   VERSIONNÉ, donc vidé à chaque livraison. Le laisser là-dedans ferait re-télécharger 2,5 Mo
   à chaque version — plusieurs fois par jour en ce moment. Ce tiroir-ci, comme celui des
   images, n'est jamais vidé par une mise à jour : téléchargé UNE fois, gardé. */
const OCR_CACHE = 'ft-ocr';
const OCR_RE = /\/lib\/ocr\//;
const IMG_RE = /\/(exercises|anatomy|guide|accessoires|muscles)\//;
const IMG_ASSETS = PRECACHE.filter(u => IMG_RE.test(u));

// Fichiers ESSENTIELS (code + polices + libs + logos) — petits → install RAPIDE.
// ⚠️ On ne bloque PAS l'install sur les ~15 Mo d'images : sur iOS/5G ça faisait traîner/échouer
// l'install → skipWaiting jamais atteint → utilisateur COINCÉ sur l'ancienne version (bug 2026-07-13).
const CORE = PRECACHE.filter(u => !IMG_RE.test(u));
async function precacheCore(){
  const cache = await caches.open(CACHE);
  for (const url of CORE){ try { await cache.add(url); } catch (e) {} }
}

// Télécharge SEULEMENT les images MANQUANTES dans le tiroir stable IMG_CACHE, une par une, en
// notifiant la progression (barre « 📦 Installation… X% »). Résumable. La barre n'apparaît donc
// QUE quand il y a vraiment quelque chose à télécharger : 1re installation, ou nouvelles figurines
// ajoutées. Sur une mise à jour normale (images déjà présentes) → rien à faire, AUCUNE barre, 0 data.
async function precacheImages(){
  const cache = await caches.open(IMG_CACHE);
  const missing = [];
  for (const url of IMG_ASSETS){ if (!(await cache.match(url))) missing.push(url); }
  if (!missing.length){                          // tout est déjà là → pas de barre
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type:'PRECACHE_DONE', done:1, total:1}));
    return;
  }
  const total = missing.length;
  let done = 0;
  const notify = async (type) => {
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type, done, total}));
  };
  for (const url of missing){
    try { await cache.add(url); } catch (err) { /* asset manquant sur le serveur → on continue */ }
    done++;
    if (done === total || done % 4 === 0) await notify('PRECACHE_PROGRESS');
  }
  await notify('PRECACHE_DONE');
}
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    await precacheCore();      // rapide : uniquement le code (+ polices, libs, logos)
    await self.skipWaiting();  // → la nouvelle version s'active immédiatement, sans attendre les images
  })());
});

// Messages venant de l'app :
//  - REPRECACHE      : réinstalle TOUT de force (bouton « Vider le cache ») → montre la barre.
//                      C'est EXPLICITE : l'utilisateur le déclenche (à faire en wifi de préférence).
//  - ENSURE_PRECACHE : envoyé à chaque ouverture. Répare le CORE (code) si le cache a été vidé, PUIS
//                      lance l'installation COMPLÈTE des images en arrière-plan AVEC la barre
//                      « 📦 Installation… X% » — SEULEMENT si le marqueur FULL_MARKER manque (donc
//                      1 fois par version = à chaque mise à jour). Résumable : reprend là où ça s'est
//                      arrêté, saute ce qui est déjà en cache. (Choix Michel 2026-07-15 : barre auto à
//                      chaque MAJ, compromis assumé vs data mobile — la lecture bilan/import passe
//                      désormais par le serveur Cloudflare, plus par Google, donc moins de contention.)
self.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === 'REPRECACHE') {
    // « Vider le cache » (explicite) → tout réinstaller : code + images (les images ont été vidées).
    e.waitUntil((async () => { await precacheCore(); await precacheImages(); })());
  } else if (t === 'ENSURE_PRECACHE') {
    e.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const coreOk = await cache.match(PRECACHE_SENTINEL);
      if (!coreOk) { await precacheCore(); }        // cache CODE vidé → répare le code d'abord (rapide)
      await precacheImages();                        // télécharge les images MANQUANTES → barre SI besoin, sinon rien
    })());
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE && k !== OCR_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({includeUncontrolled:true}).then(clients =>
        clients.forEach(c => c.postMessage({type:'SW_UPDATED'}))
      ))
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requêtes externes (Apps Script, Google Fonts, etc.) : réseau uniquement
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : cache d'abord (instantané) + mise à jour silencieuse en fond
  // → ouverture immédiate depuis le cache même sans réseau ou réseau lent
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        // Revalidation en arrière-plan — met à jour le cache pour la prochaine ouverture
        const netFetch = fetch(e.request).then(r => {
          if (r && r.status === 200) {
            const cl = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, cl));
          }
          return r;
        }).catch(() => null);
        // Cache dispo → affiche immédiatement, réseau en fond
        if (cached) { netFetch.catch(() => {}); return cached; }
        // Pas de cache (1re installation) → attend le réseau
        return netFetch.then(r => r || caches.match('./'));
      })
    );
    return;
  }

  // logo.png : réseau d'abord (toujours à jour), cache en fallback offline
  if (url.pathname.endsWith('/logo.png')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) { const cl=r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Autres assets locaux : cache d'abord (cherche dans les DEUX tiroirs), réseau en fallback.
  // Au téléchargement à la demande : les images vont dans IMG_CACHE (stable), le reste dans CACHE.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const cl=r.clone();
          const target = OCR_RE.test(url.pathname) ? OCR_CACHE : (IMG_RE.test(url.pathname) ? IMG_CACHE : CACHE);
          caches.open(target).then(c => c.put(e.request, cl));
        }
        return r;
      });
    })
  );
});
