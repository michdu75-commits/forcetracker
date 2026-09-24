# 🧪 Retours des testeurs — mémoire centralisée

> **But** : garder au même endroit les retours des vrais testeurs (ce qui leur plaît,
> ce qui manque, les bugs, leurs idées, leur profil). Chaque retour important y est
> **gravé** pour ne pas se perdre entre les sessions.
> ⚠️ Ce fichier est **référencé depuis `CLAUDE.md`** (l'index auto-chargé) → je le
> retrouve toujours. À compléter à chaque retour marquant.

---

## 🧑‍💻 Michel (fondateur) — test en conditions réelles du 27/07/2026

> ⭐ **LE « moment signature » validé en vrai** (`docs/VISION` : le débrief de fin de séance).
> Michel, après sa séance : *« par contre super débriefing à la fin de la séance »*.

**Ce que Milo a produit** (séance pecs de reprise, après 8 jours de coupure) — et **ce que ça valide** :
- *« 🎯 Objectif précédent : couché 105×1 — **TENU**, et largement dépassé (105×2) »* → la **CONTINUITÉ** fonctionne : Milo se souvient de l'objectif que **lui-même** avait fixé la fois d'avant (`S.registre.sessionLog`, les 3 derniers débriefs injectés dans le contexte).
- *« 60×10, vs 56×10 le **19/07** »* · *« 68×10 le **22/06** »* → il va chercher les **vrais records datés** (zéro invention, cf. anti-invention ft-v589).
- *« après 8 jours sans toucher une barre… la surcompensation a fait son taf »* → il tient compte du **contexte réel** (la coupure), pas seulement des chiffres.
- *« vers ton **objectif 130** »* → les **objectifs de force chiffrés** (`S.strengthGoals`, ft-v574 — brique née précisément parce qu'il les ignorait).
- *« paliers de **2,5 kg**, pas besoin de griller les étapes »* → prudence cohérente avec l'épaule à protéger.
- Il **refixe un objectif** pour la prochaine séance → la boucle de continuité se referme.
- **Résultat sportif** : 3 records en séance de reprise (105×2, 60×10 incliné, 68×12 pec deck).

**🛡️ Validation implicite majeure** : Milo a répondu normalement → **le verrou anti-abus du Worker déployé le même jour ne casse rien** (c'était le dernier point « en attente de validation device » de l'audit sécurité).


**✅ VALIDATION DEVICE des 4 fixes Milo→Séance (27/07, séance de test « bas du corps »)** — Michel lance le test et **photographie les 6 exercices** : **① ordre** parfait (squat → hip thrust → SDT jambes tendues → leg curl → leg extension → abduction, exactement la table annoncée par Milo) · **② charges/reps** exactes sur les 6 (squat 8×60/6×70/4×80/3×85/2×90 · hip thrust 8×70/80/80/90 · SDT 6×80/100/110 · leg curl 10×54/60/68 · leg ext 12×45/55/60 · abduction 12×100/110/120) · **③ consignes** présentes sur les 6 (« amplitude parallèle, pas ATG », « pas d'hyperextension lombaire », « regard neutre, zéro à-coup », « excentrique lent 3s », « pas de verrouillage violent du genou », « fessier moyen, contraction 1s »). **Preuve la plus parlante** : la colonne « Précédent » diffère à CHAQUE exercice (15×40 vs 12×45, 6×125 vs 12×120…) → **ce sont ces valeurs-là qu'il aurait eues avant les fixes**. Bonus : Milo a typé la 1ʳᵉ série du squat en **É (échauffement)**, cohérent avec sa montée progressive. ⏱️ **Le REPOS aussi est validé** (testé juste après, en validant une série : le chrono part bien sur la durée annoncée par Milo). → **les 4 fixes ft-v625→628 sont confirmés sur device, 4/4.** *(Au passage, Milo avait d'abord « eu » Michel : il proposait la séance pour DEMAIN → pas de bouton, car le bloc n'est émis que pour une séance du jour. Règle saine, mais qui a fait naître l'idée « Milo prépare ta séance de demain » — cf. `IDEES-FUTURES.md`.)*

**Ce que ça confirme** : la mémoire, la continuité, les records et les objectifs chiffrés **travaillent ensemble**. Le débrief n'est plus une intention de la Vision — c'est du réel, sur une vraie séance. *(À rapprocher des 4 bugs Milo→Séance trouvés le même jour : le débrief, lui, restitue parfaitement ; c'était l'**injection** de la séance qui perdait l'info — cf. ft-v625→628.)*

---

## 🧑‍💻 Michel (fondateur), 07/09/2026 — **la journée où DEUX de ses remarques ont trouvé du code que je n'avais pas vu**

> ⭐⭐ **Pourquoi cette entrée existe** : d'habitude un retour signale un **symptôme** et le
> diagnostic vient d'ici. Ce jour-là, **deux de ses phrases ont directement localisé le défaut** —
> et l'une a trouvé la moitié du bug que j'étais en train de corriger sans l'avoir vue.

**① *« je l'ai rentré avec le code-barres »*** — lâché en passant, après trois versions passées à
poser des garde-fous sur la même ligne (son isolat de protéine). ⭐⭐ **Cette précision a recadré tout
le diagnostic** : je cherchais pourquoi les *valeurs* étaient fausses ; le vrai défaut était que le
**scan d'un produit dont la fiche Open Food Facts est vide** jetait le nom, cachait tout le réglage
de quantité (un `_bcNutr` **de zéros** faisait croire qu'un pour-100 g était connu) et ne proposait
jamais le bouton qui règle ça. **Cul-de-sac définitif** : `per100:null` **et** `q:null` → plus rien
ne rescale, jamais. → **ft-v1165**.

**② *« mais donc ça risque de merder aussi pour le scan du code-barres ou l'étiquette c'est pareil.
Si je mets des options et ça ne fonctionne pas ça en devient ridicule »*** — dit **pendant** que
j'écrivais le correctif. ⛔⛔ **Vérifié : `onFoodLabelFile` portait la ligne à l'identique.** *Il a
trouvé la jumelle (R8) avant moi.* Un seul propriétaire, deux appelants.

**③ *« c'est chiant de mettre ses aliments, alors si ça ne fonctionne pas »*** — ⭐ **le symptôme
n'est pas un bug report, c'est de la LASSITUDE**, et c'est ce qui a donné la famille `BUGS.md` **§48**
(*la porte de secours n'est pas proposée là où le chemin s'arrête*). *Un message d'erreur honnête qui
laisse la personne devant un formulaire vide reste un cul-de-sac.*

**④ *« si je mets 1 comme portion je ne connais pas la valeur en gramme de départ »*** — ⭐ un vrai
**trou de conception** qu'aucun test n'aurait trouvé : les boutons ½ · 1 · 1½ · 2 · 3 multiplient une
quantité **que personne ne connaît**. *Mesuré, noté ; le calibrage de ft-v1165 le contourne, il ne le
supprime pas.*

**⑤ *« ouais ok mais ça m'arrive à MOI, si ça arrive à d'autres personnes je fais comment moi ? Je
passe pour un mec qui a créé une application à l'arrache »*** — ⭐⭐ **la phrase qui a transformé une
réparation en principe** : lui savait qu'un ✎ violet caché permettait de rattacher un exercice
inventé. **Personne d'autre ne le sait.** → l'aperçu d'import dit désormais ce qu'il va créer
(ft-v1166).

### ⭐⭐ Ce que ces retours ont appris sur la MÉTHODE

- ***La précision qui recadre tout arrive souvent APRÈS coup, et en passant.*** « Je l'ai rentré avec
  le code-barres » n'était pas présenté comme une information — c'était une remarque. **Réflexe :
  quand un défaut résiste à trois versions, redemander comment la donnée est ENTRÉE.**
- ***Quand il dit « ça risque de merder aussi pour X », il faut aller VÉRIFIER X tout de suite*** —
  c'était vrai, au caractère près.
- ***Une plainte de lassitude vaut un rapport de bug*** : « c'est chiant » désigne un chemin sans
  issue, pas une préférence.

---

## 👩‍🦱 Tatiana (Tanna Valery) — `tanna.valery.studio@gmail.com`
**Profil** : testeuse ET **coach sportive** (clientèle, dont russophone). Ex-athlète de
**force athlétique en compétition (28→34 ans)**, sport de combat plus jeune, muscu depuis
18 ans, **jamais arrêté**. Vie chargée (**SNCF + 2ᵉ boulot, nuits & astreintes**).
Arthrose · anciennes blessures **genou gauche** + **épaule droite**. Priorité perso :
**le bas du corps** (course + squat) — **par choix**. Aime le soulevé de terre et **le dos** ;
n'aime pas trop épaules/dos mais sait que c'est nécessaire.

### Retour du 19/07/2026 (⭐ très positif — validation du cœur produit)
- **Adore le débrief de Milo** : *« J'aime vraiment ! Il est sympa ce IA »*. Le débrief a
  utilisé ses vraies charges (Cossack squats 20×12…), croisé sa morpho, et **fixé un
  objectif pour la prochaine séance** — pile la vision.
- **A compris la vision toute seule** : *« C'est un peu plus qu'une application de suivi,
  plutôt **un ami ou coach perso** »* → exactement `docs/PRESENCE-MILO.md`.
- **A rempli son ADN sportif** (motivation, mode de vie, préférences, expérience) + sa Santé
  (arthrose, genou/épaule) → *« et là c'est le cœur de l'application »*. Preuve que l'ADN + le
  profil = le bon levier (Milo devient sûr ET pertinent une fois rempli).
- **Veut partager l'app avec ses clientes** → demande **le russe**. = signal de croissance
  (les coachs amènent leurs clients). Cf. `IDEES-FUTURES.md` (chantier multilingue).

### Ce que ça a produit (actions gravées)
- **`ft-v493`** (CLAUDE.md) — le souci « objectif » : Milo lui imposait « rattrape ton haut du
  corps » alors qu'elle bosse le bas **par choix**. Fix : *la personne et SON objectif priment ;
  si l'objectif est inconnu (profil vide), Milo ne présume pas → il reflète et DEMANDE*.
- **`IDEES-FUTURES.md`** — multilingue = levier de croissance via les coachs (demande russe).
- ⚠️ Rappel : son *« traumatisme épaule → adapter »* = **Profil Santé + le Gardien** (qui
  aurait bloqué le « développé couché/militaire » que Milo lui proposait, une fois l'épaule
  renseignée). Une fois son profil rempli, Milo + le Gardien la couvrent.
- Historique features issues de ses retours plus tôt : `ft-v409` (réglage manuel calories,
  objectif recomposition, « maxi » reps), `ft-v446` (fix premium côté client).

---

## 🧔 Christophe — `christophe@famillelanglois.fr`
Super testeur, là **depuis le début**. Retours marquants : douleurs plus précises
(gauche/droite/les deux + plus de zones → `ft-v484`) ; bug boîte à idées photos absentes du
mail (→ `ft-v481`, puis `ft-v397`) ; « + Série » qui repart à vide (→ `ft-v290`) ; superset
par glisser-déposer (→ `ft-v398`). Phase 2 douleurs (intensité 1-5 + « depuis quand ») = à faire.
**27/07/2026** — 🐛 *« quand je balance la pop-up vers le bas, elle revient à la réouverture de l'app »* → **vrai bug, 8 pop-ups concernées** : le glissement ne posait pas le marqueur « vu ». Corrigé **ft-v629** (`_OVERLAY_CLOSERS` + `_closeOverlayProper`). Encore un bug de **chemin de fermeture oublié** — comme son retour sur le point rouge. 👏
**27/07/2026 (2)** — 💡 **proposition UX acceptée** : *« quand on fait beaucoup de mises à jour ça fait une seule pop-up et les gens, je pense que ça les saoule de descendre jusqu'en bas ; si on met une pop-up ensuite, on doit slider pour voir la deuxième — les gens vont peut-être plus lire »*. **Juste** : une liste empilée se scrolle sans se lire, un écran par nouveauté se lit. Livré **ft-v630** (carrousel « Quoi de neuf » : 1 nouveauté/écran, points, Suivant/Précédent, glissement latéral). **Nuance gardée** (règle d'or #4) : le format suffit à faire lire, on ne **bloque** donc pas l'entrée dans l'app — le glissement vers le bas reste une sortie (quelqu'un qui arrive à la salle ne doit pas être retenu par 6 écrans). 👏 **2 retours utiles dans la même journée.**

## 👩 Emma — `emma.david16@gmail.com`
Retours (→ `ft-v438`) : repos réglable à la main en séance, option « tout dérouler » les exos,
régime cétogène. Restent (notés) : détection supersets à l'import, conseils Milo selon la phase
du cycle (fait `ft-v442`), plus de techniques (excentrique/partielles).

---

---

## 🔢 Eline, 28/08/2026 — *« impossible de mettre la virgule pour les poids »*

**Reçu dans la boîte à idées**, lu par Michel dans l'app le 30/08. **Une phrase de neuf mots, et
c'est le retour le plus coûteux qu'on ait eu.**

### ⛔⛔ Ce qu'elle décrit est un refus. Ce qui se passait est bien pire.
Mesuré dans un navigateur, en **tapant vraiment au clavier** sur le champ le plus utilisé de
l'app (le kg d'une série) :

| | Ancien code | Corrigé (`ft-v1057`) |
|---|---|---|
| Elle tape | `62,5` | `62,5` |
| Le champ affiche | **625** | 62,5 |
| Ce qui est **enregistré** | **625 kg** | 62,5 kg |
| Le 1RM calculé | **776 kg** | 77,6 kg |

Et sur la **pesée**, l'autre moitié du défaut : `62,5` devenait **62** — la moitié du kilo
disparaissait. Deux façons différentes de se tromper, **toutes deux silencieuses**.

⚠️ **Le 776 kg ne serait pas resté à l'écran** : il partait dans ses **records**, dans sa
**courbe de progression** et dans le contexte de Milo. *Un retour formulé comme une gêne
d'ergonomie cachait une corruption de ses données.*

### ⭐⭐ Ce que ce retour a appris sur la MÉTHODE
- **Le mot de la personne décrit le symptôme, pas la cause.** En s'arrêtant à « impossible », on
  cherchait pourquoi le clavier ne propose pas la virgule — et on passait à côté des séances
  déjà fausses.
- **L'app savait déjà lire une virgule, à DIX endroits** — mais uniquement pour du texte venu
  d'ailleurs (une phrase, un rapport de balance photographié, une réponse de Milo). *Jamais pour
  ce que la personne tape.* Le mécanisme existait, posé d'un seul côté.
- Nouvelle famille **§23** de `BUGS.md` : *un champ qui « refuse » une saisie peut en fait la
  mutiler* — et un nombre faux mais crédible ne se voit jamais.

### ✅ CONFIRMÉ PAR ELINE, EN PRODUCTION (30/08/2026)
Michel, après qu'elle a retesté sur son iPhone : *« c'est bon ça fonctionne »*.
⭐⭐ **C'est la seule validation qui compte** : celle de la personne qui a signalé le défaut,
sur son propre appareil, sur la version déployée — pas une mesure dans un navigateur de test.
⚠️ **Et il a fallu un aller-retour pour y arriver** : elle avait d'abord retesté sur `ft-v1056`,
parce que j'avais dit *« c'est corrigé »* alors que le correctif dormait encore sur ma branche.
*Corrigé dans le code n'est pas corrigé dans son téléphone* — c'est **R18** (vérifier le
déploiement, pas le push), et je me la suis fait prendre.
⛔ **La question « pourquoi ça marchait chez Michel » reste ouverte** — mais elle n'a plus
d'effet : le comportement est désormais identique sur tous les moteurs. On la laisse écrite
plutôt que de la combler par une hypothèse (**R29**).

### Ce que ça a produit
**`ft-v1057`** — **22 champs décimaux** acceptent la virgule (le pavé numérique du téléphone est
conservé), **41 lectures** passent par un seul lecteur `numFR`, et un témoin permanent refuse
qu'un 23ᵉ champ décimal revienne en `type="number"`.

⏭️ **Ce qui reste ouvert — et l'alerte a été REVUE À LA BAISSE, à raison.** J'avais annoncé
des séances « ×10 » dans son historique. Michel : *« moi je mets aussi des virgules »* — et
chez lui, sur iPhone, **ça marche**. Le `×10` est mesuré dans **Chromium** ; **WebKit accepte
la virgule et la convertit**. Sur un iPhone, le pire cas est donc un **arrondi** (12 au lieu
de 12,5) : imprécis, pas faux. ⛔ **Rien n'est corrigé dans ses données**, et c'est la bonne
décision — *on ne répare pas un historique sur une hypothèse* (**R29**).
⚠️ **Reste inexpliqué, et écrit comme tel** : pourquoi le champ refuse chez elle alors qu'il
accepte chez son père. Sans savoir sur quel appareil elle est, toute réponse serait inventée.

---

## 💡 Christophe, 04/08/2026 — *« Il manque lombaires, je n'ai pas vérifié »*

**Son idée, en une ligne.** Il crée son exercice (« Extension lombaires sur Booty Builder machine »)
et le menu des groupes ne lui offre **aucune case juste**.

**Ce que la vérification a donné : il en manquait TROIS.** Le menu proposait **10** groupes, le
catalogue en compte **13** — *Lombaires* (12 exercices), *Full Body* (18) et *Avant-bras* (5)
étaient inchoisissables. Des groupes qu'on **voit écrits** en face des exercices dans la liste, et
qu'on ne peut pas sélectionner pour le sien.

**Et un deuxième bug derrière**, que personne n'aurait signalé : à l'édition, un groupe absent de la
liste était refusé **sans erreur** par le navigateur, et la sauvegarde écrivait le groupe affiché.
Modifier un exercice pouvait le **reclasser tout seul**. Corrigé, et figé par un test.

**⭐ Ce que ce retour dit de notre méthode.** On venait de passer **dix versions** à relire les 337
exercices un par un. On a audité le **contenu** du catalogue sans jamais ouvrir **l'écran qui sert à
en créer un**. *Un audit exhaustif d'un domaine ne dit rien de la porte d'entrée de ce domaine.*
C'est la meilleure illustration de pourquoi les retours de vrais utilisateurs ne se remplacent pas
par des tests, si complets soient-ils. → livré **ft-v755**.

**Sa prudence mérite d'être notée** : *« je n'ai pas vérifié »*. Il signale sans affirmer. C'est
exactement le bon réflexe côté testeur — et c'est à nous de mesurer, pas à lui.

---

## 🌡️ Où en est chacun — point de Michel du 03/08/2026

> Noté tel qu'il me l'a dit, sans interprétation. Ce sont des **observations d'usage**, pas des
> jugements : *« Eline s'y met et Tatiana a du mal »*. Ce qui compte ici n'est pas le classement,
> c'est de savoir **où porte l'effort** — une personne qui décroche ne le dira pas d'elle-même.

| Personne | État au 03/08 | Ce que ça suggère |
|---|---|---|
| **Christophe** | Le plus actif · 16 idées sur 17 dans la boîte · compte le plus lourd (278 Ko) | C'est lui qui trouve les vrais manques. Premier servi sur la **mémoire élargie** (ft-v754), prévenu par pop-up perso. |
| **Eline** | **S'y met** (03/08) | Le moment le plus fragile : c'est maintenant que l'app doit être simple, pas complète. À surveiller sans la solliciter. |
| **Tatiana** | **A du mal** (03/08) | ⚠️ Le signal le plus important du lot. Sa validation du 19/07 était très positive — l'écart entre « ça me plaît » et « je m'en sers » se joue ailleurs que dans les fonctionnalités. **Cause à comprendre avant d'ajouter quoi que ce soit pour elle** (R22 : un retour isolé, on observe). |
| **Emma** | Nombre de séances **inconnu** | ⏭️ La donnée existe côté serveur (`listUsers` renvoie le compte par personne) mais **n'est branchée nulle part dans l'app** et demande le jeton admin. **À faire : l'afficher dans Profil → Admin**, pour arrêter de deviner qui utilise vraiment l'app. |

**⭐ Ce que ce tableau révèle sur nous, pas sur eux** : au 03/08, on livre 15 versions en deux jours
sans savoir **combien de séances chacun a faites**. On mesure le temps de réponse de Milo, la taille
du contexte, le nombre de tracés de la figurine — et pas la seule chose qui dit si le produit sert :
**est-ce qu'ils s'en servent ?** C'est l'angle mort à combler en premier.

---

## 📬 Boîte à idées OUVERTE et TRIÉE le 30/07/2026 (17 idées, Christophe ×16 · Eline ×1)

> Michel a ouvert la boîte (`getIdees`) et collé le contenu ; tri vérifié **dans le code** avant
> chaque verdict (règle R23 : ne jamais affirmer qu'une chose manque sans vérifier).

**✅ Déjà fait depuis (6)** — la boîte datait surtout du 7-11/07 :
- Chrono repos « 8 reps à 30 kg » (au lieu de « 30×8 ») → **implémenté** (`_fmtNextSet`, log.js).
- Saisir soi-même ses repas (matin/midi/soir/collations) → **le journal « Noter ce que je mange »**.
- Code-barres qui ne marche pas → **corrigé le lendemain** (ft-v393, lecture du numéro par IA).
- Boîte à idées : photos séparées du texte → **corrigé** (ft-v397, photos en pièces jointes au mail).
- Supprimer un aliment avec confirmation nommée → **existe** (« Supprimer l'aliment ? “50 g de concombre” »).
- Voir la progression des poids d'un exercice → **bouton 📊 par exercice** (`openExHistory`) ; la vue en % n'existe pas (à discuter si toujours voulue).

**Suites données (30-31/07)** :
1. **Superset par glisser-déposer** (demandé 2 fois) → **❌ DÉCISION MICHEL (31/07) : « je suis pas chaud pour les supersets »** — pas de chantier. L'import de programmes continue de LIRE les supersets ; la création manuelle en séance n'est pas retenue. Si le retour revient avec insistance, re-passer par Michel (retours à 3 paliers, R22).
2. **Swipe gauche/droite** — sa capture montrait la fenêtre de PESÉE → **✅ LIVRÉ ft-v676** (flèches ‹ › + glissement + compteur « Pesée 12 sur 42 »).
3. **PDF téléchargeable** — préciser de QUOI (les réponses de Milo et l'étude du corps l'ont déjà) → en attente d'un cas concret.
4. **Eline — masse maigre non lue** sur son rapport MyBodyCheck → **✅ LIVRÉ** : repli déterministe au backend (@auto 30/07, nouveaux imports : `leanMass = poids − masse grasse`) + migration frontend **ft-v677** (les anciens bilans en stock sont complétés pareil ; une valeur déjà lue n'est jamais écrasée).

**❓ Illisibles sans contexte (2)** : « poids du précédent programme » (07/07 — l'import a été refait depuis, à reconfirmer par Christophe) · « comment associer les 2 ? » (photo jamais reçue).

**🐛 Trouvé EN LISANT la boîte** : deux idées envoyées **en double** (à 18 s et à 2 s d'écart) → le bouton d'envoi n'a probablement pas d'anti-double-tap. Petit fix candidat.

---

*(À compléter à chaque nouveau retour testeur marquant. Garder le lien dans `CLAUDE.md`.)*

---

## 🍽️ 22/09/2026 — MICHEL : « L'APPLICATION DONNE TROP DE CALORIES » (répété, jamais consigné)

> ⛔⛔ **CE QUI REND CE RETOUR DIFFÉRENT DE TOUS LES AUTRES DE CE FICHIER : il a été dit
> PLUSIEURS FOIS, sur plusieurs sessions, et il n'était écrit NULLE PART.** Michel, ce jour :
> *« tu te rappelles quand je te disais je trouve mes calories bcp trop élevées et on a jamais
> fouillé, je n'ai pas lâché l'affaire »*, puis : ***« je t'ai déjà dit que l'application donne
> trop de calories »***.
>
> **Vérifié avant de l'écrire** : dans tout le dépôt, seul le NOMBRE apparaît (3 522 kcal,
> `docs/AUDIT-NUTRITION-2026-09-22.md`). **Son doute, lui, n'apparaît pas une seule fois** —
> ni ici, ni dans `BUGS.md`, ni dans `docs/JOURNAL-DE-TEST.md`, ni dans le journal des versions.
> 👉 ***Donc à chaque session on repartait de zéro et on lui redemandait des chiffres*** —
> c'est-à-dire exactement le contraire de ce que le produit promet au sportif (*« tu ne repars
> jamais de zéro »*). **R27 appliquée à nous-mêmes**, et payée plusieurs fois.
>
> ⚖️ **Palier R22 : RÉCURRENT.** Ce n'est plus « on observe », ce n'est plus « on enquête ».

### Le profil et le chiffre

Homme · **85,8 kg · 179 cm · 41 ans** · activité **« Actif (5-6 j) »** (1,725) · métier
**« Physique »** (+450) · non-fumeur. TDEE servi : **3 522 kcal**.

### ⭐⭐ CE QUI EST MESURÉ DANS LE CODE SERVI (`calcTDEE`, `state.js`)

Le **PAL effectif** — le TDEE divisé par le métabolisme de base — est le seul chiffre comparable
d'un réglage à l'autre. Calculé sur son profil (BMR Mifflin 1 777) :

| réglage | TDEE | PAL effectif |
|---|---|---|
| Modéré (3-4j) + bureau | 2 754 | 1,550 |
| Actif (5-6j) + bureau | 3 065 | 1,725 |
| Modéré (3-4j) + physique | 3 204 | 1,803 |
| **Actif (5-6j) + physique ← le sien** | **3 515** | **1,978** |
| Très actif + bureau | 3 376 | 1,900 |

👉 ***Son réglage produit un PAL de 1,978, alors que le cran le plus haut du sélecteur,
« Très actif », vaut 1,900.*** Il est **139 kcal au-dessus du plafond que l'application propose
elle-même**, sans avoir jamais choisi le cran du haut.

### ⚠️ POURQUOI LES DEUX RÉGLAGES SE CUMULENT ALORS QU'ILS SE RECOUVRENT

Les cinq multiplicateurs (1,2 · 1,375 · 1,55 · 1,725 · 1,9) viennent d'une table standard où le
dernier cran se définit *« exercice très intense **ET métier physique**, ou deux séances par
jour »*. ⚠️ **Source secondaire, largement reproduite — le conteneur ne peut ouvrir aucune
publication primaire** (`connect_rejected` sur les domaines scientifiques) : c'est un fait de
type **[B]**, jamais **[A]**.

Or les libellés du sélecteur ne parlent **que des séances** (« Actif (5-6j) ») et le « Type de
travail » s'ajoute à côté. 👉 ***Les deux réglages ont l'air indépendants alors que la table
d'origine les compte ensemble.*** C'est la cause `metier_et_activite_cumules`, mesurée à
**7 450 profils sur 100 000** du corpus B lors du chantier V9.

### ⛔ CE QUE ÇA NE PROUVE PAS, ET IL FAUT LE DIRE

Ça ne prouve **pas** que 3 522 est faux : une manutention lourde produit vraiment un NEAT
considérable, et des PAL voisins de 2,0 existent. Ça prouve **une** chose : ***l'application le
place au-dessus de son propre maximum, et personne ne l'avait vu.***
⚖️ **Et le retour de Michel n'a pas à être prouvé pour être enregistré.** C'est l'utilisateur
n°1 du produit qui dit que le chiffre est trop haut, plusieurs fois, sur plusieurs mois. *Le
code dit ce qui EST ; Michel dit ce qui doit être corrigé* (règle d'or #15).

### ⏭️ CE QUI EXISTE DÉJÀ ET ATTEND SON FEU VERT

La réponse de fond n'est pas de retoucher un multiplicateur : c'est de **mesurer son TDEE réel**
au lieu de l'estimer. `tdeeObserve()` (candidate **V9**, `tools/moteur_v9.js`, **non servie**)
le calcule à partir du bilan énergétique — apport moyen et pente de poids — et la porte
d'apprentissage exige **14 jours · 50 % de jours notés · 4 pesées**. ⛔ Rien n'est publié
(arbitrages **D-019 → D-022** ouverts).

### ⭐⭐ 22/09/2026, 23 h — SES DONNÉES RÉELLES SONT ARRIVÉES, ET ELLES TRANCHENT

> Michel envoie son **export nutrition** (306 lignes, 22/08 → 22/09) et trois captures de la
> courbe de poids. Sa consigne, mot pour mot : ⛔ *« contrôle la qualité du journal : on sait
> qu'il existe encore quelques anciennes entrées historiques foireuses dans la base, donc ne
> prends pas la moyenne calorique brute comme vérité sans vérifier les anomalies »* · ⛔ *« je
> veux une conclusion avec niveau d'incertitude, pas un chiffre présenté comme exact »*.

**① QUALITÉ DU JOURNAL — [A] mesuré, et meilleure que supposé.** **32 jours CONSÉCUTIFS, zéro
trou.** Trois défauts seulement, trouvés par trois filtres distincts :

| défaut | où | effet |
|---|---|---|
| **loi physique violée** — « 30g de protéines » à **1 117 kcal** pour 26 P / 1 G / 1 L (= 117 réelles) | 22/08, saisie `ia-texte` | **+1 000 kcal**, un « 1 » de trop |
| **6 doublons exacts** de « Iso zero protein » (même jour, même repas, même valeur) | 11 · 12 · 14 · 15 · 16 · 18/09 | **+936 kcal** |
| **portion absurde** — 100 g de **café moulu** (entrée CIQUAL de la poudre sèche) | 06/09 | **+341 kcal** |

⭐ **Total retiré : 2 277 kcal sur 78 917, soit 2,9 %.** *Ses « entrées foireuses » existent bien,
mais elles ne déplacent pas la moyenne.* ⚠️ **Le doublon d'« Iso zero protein » est un vrai
défaut d'app, pas une faute de saisie** — 6 occurrences en 8 jours, toujours le même produit,
toujours au même repas. **À instruire.**

**② TDEE OBSERVÉ — [A].** Apport moyen corrigé **2 423 kcal/j** (27 jours complets).
⚠️ **La pente d'un mois est écartée exprès** : +0,19 kg/sem sur **5 pesées** et 1,1 kg
d'amplitude, c'est du bruit — l'app mesure elle-même **−0,06 kg/sem sur 16 pesées** à 3 mois.
***Son poids est plat.***

| pente retenue | TDEE observé | PAL |
|---|---|---|
| +0,19 kg/sem (5 pesées) | 2 197 | 1,24 |
| poids stable | **2 423** | **1,36** |
| −0,06 kg/sem (16 pesées) | 2 489 | 1,40 |

**③ ⭐⭐ LE CUMUL EST BIEN LE COUPABLE — et la démonstration ne dépend PAS de la valeur absolue
de son journal.** Un PAL de 1,24-1,40 est **impossible** pour 5-6 séances + métier physique :
il sous-déclare, comme tout le monde. La bonne question devient ***de combien faut-il qu'il
sous-déclare pour que chaque chiffre soit vrai ?***

| si son vrai TDEE valait… | sous-déclaration nécessaire |
|---|---|
| 2 932 (PAL 1,65) | 17 % |
| **3 065 (« Actif 5-6j » SANS le métier)** | **21 %** |
| 3 376 (cran le plus haut de l'app) | 28 % |
| ⛔ **3 515 (ce que l'app lui donne)** | ⛔ **31 %** |

**[B]** la sous-déclaration typique d'un adulte motivé est de **10 à 30 %** (eau doublement
marquée ; littérature reproduite, **aucune publication primaire ouvrable depuis le conteneur**).
👉 ***3 515 exige le bord extrême de la fourchette. Retirer le +450 du métier ramène à 21 %,
c'est-à-dire pile au milieu.*** **Le terme qui ne survit pas à la mesure, c'est le +450.**

**④ LE CHIFFRE QUI PARLE SANS STATISTIQUE.** Objectif affiché **« Perte de gras + muscle »**,
cible **3 372 kcal**. Il en mange **~2 423** et son poids **ne bouge pas depuis 3 mois**.
👉 ***L'app lui demande de manger 949 kcal/j de PLUS qu'aujourd'hui — pour perdre du gras.***

**⑤ CONCLUSION AVEC SON INCERTITUDE (c'était la consigne).** Son TDEE réel est **très
probablement entre 2 800 et 3 100 kcal** ; l'app est **haute de 400 à 700 kcal/j**.
**Confiance MOYENNE, pas haute** : ✅ solide côté journal (32 j, 97,1 % propre) et côté poids
(16 pesées) · ⚠️ ⛔ **impossible de séparer « l'app surestime » de « il sous-déclare » sans eau
doublement marquée** — on peut seulement dire que **3 515 exige l'hypothèse la plus extrême des
deux** · ⛔ **son nombre réel de séances/semaine n'est PAS vérifié** (pas d'accès à son
historique) ; à 3-4 séances tout descend encore de ~300 kcal.

⚖️ **Son intuition était juste.** ⛔ Elle n'est pas prouvée au chiffre près — elle est **bornée**,
et la borne haute du plausible passe **en dessous** de ce que l'app affiche.

---

## 🧠 24/09/2026 — MICHEL : LE DÉBRIEF DE MILO DIT DES CHOSES QUI NE SONT PAS DANS SA SÉANCE

Retour réel, capture d'un débrief de fin de séance à l'appui. Quatre symptômes, traités
**séparément** et revalidés en conduisant l'app (témoins `tests/parcours/debrief_provenance.js`,
blocs B-CCCLVIII / B-CCCLIX) avant toute correction :

| # | Ce que Michel a vu | Statut après audit |
|---|---|---|
| 1 | Larsen Press affichée **80×4 · 80×4 · 85×3 · 90×3 RIR1**, et Milo écrit « le saut **70→90** est un peu abrupt » | ✅ **CONFIRMÉ** — c'est l'APP qui l'écrivait à Milo : `[⚠️ montée en charge insuffisante — saut de 22 % entre 70 et 90 kg]`. La montée était jugée contre la charge **maximale** (90) au lieu de la **1ʳᵉ série de travail** (80) : un passage 70→90 qui n'a jamais eu lieu. Même défaut dans le débrief chiffré local. |
| 2 | 12 min de cardio faites **en fin de séance**, qualifiées « ça sert l'échauffement » | ❌ **PRÉMISSE FAUSSE côté code** — la phase est conservée jusqu'à Milo (« après séance » dans la ligne ET dans la consigne). ❓ Cause restante **non démontrable** sans la séance réelle : cardio rangé dans le volet « Avant », ou modèle qui ignore l'étiquette. |
| 3 | Machine Oiseau + Marteau faits **en superset**, débriefés comme deux exercices isolés | ✅ **CONFIRMÉ** — la séance EN COURS disait `[superset]`, une séance TERMINÉE arrivait à Milo sans aucune relation. Les RIR, eux, restaient bien sur leur exercice. |
| 4 | Hypothèse : le RIR n'est pas proposé sur le **premier** exercice du superset | ✅ **CONFIRMÉ** — l'Oiseau enchaîne sans repos, et la question du RIR ne vit que dans la barre de repos, qui ne visait que la dernière série validée (le Marteau). |

Suite et corrections : `docs/JOURNAL-DE-PARTAGE.md` (ligne du chantier « Milo — provenance
structurelle du débrief »).
