/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
const CACHE = 'ft-v1105'; // ⚖️ ft-v1105 = LA PORTION PRE-REMPLIE N'EST PAS LA TIENNE. Michel envoie l'ETIQUETTE de son pot : 88 g de proteines / 100 g, dosette de 30 g — et il corrige mon explication de la veille : « pourtant j'ai ecrit le code barre, je n'ai rien recopie ». Il a raison, et c'est §12quater DEUX FOIS dans la meme journee : j'avais explique un mecanisme REEL (l'app propose bien ses anciennes lignes, mesure) sans le verifier contre CE QU'IL A FAIT. ⛔⛔ LE VRAI CHEMIN, REPRODUIT : le champ « Quantite » se remplit avec `serving_quantity` — LA PORTION DECLAREE PAR LA FICHE PRODUIT, pas la dosette qu'on a dans la main — et l'ecran n'en disait RIEN. Mesure : une fiche annoncant 40 g produit 156 kcal et 35 g de proteines sur ce pot, C'EST-A-DIRE LES DEUX CHIFFRES DE SA CAPTURE, au chiffre pres. *Des valeurs parfaitement justes pour une portion que personne n'a mangee.* ⛔ Le commentaire de `_bcProposerDerniere` disait DEJA « la portion du fabricant » : le code le savait, l'ecran ne le disait pas — R32/R33, ce qui est repris garde d'ou il vient. ⛔ ON NE RETIRE PAS LE PRE-REMPLISSAGE : sans lui on retombe a 100 g, ce qui est pire, et le chemin rapide disparait. *On ne cache pas le nombre, on lui rend sa source.* C'est la meme decision qu'en ft-v1051 (« on donne le choix et pas imposer »), prise alors pour la quantite de la DERNIERE FOIS et pas pour celle-ci — R8, la jumelle, pour la 3e fois en deux jours. ⛔ ET LES DEUX CHEMINS SONT TRAITES : le scan et la photo d'etiquette posent tous deux une portion declaree par un tiers. ⏭️ CE QUI RESTE NON ETABLI, ET IL FAUT LE DIRE : je ne sais pas quel chemin a produit SON entree (elle porte q=30 SANS pour-100 g, ce qui ne correspond pas a un scan reussi). Deux hypotheses ont ete ELIMINEES par la mesure : le pour-100 g survit au rechargement, et un scan qui trouve les valeurs enregistre bien q ET per100. La reponse est dans SON export CSV, qui porte les colonnes `saisie` et `source` depuis ft-v1097. Tests : parcours 2428 (bloc CCXIV, +7), calculs 266, muscles 241, croises 50, dates 7, donnees 0 trou.
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
