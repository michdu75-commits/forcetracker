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
