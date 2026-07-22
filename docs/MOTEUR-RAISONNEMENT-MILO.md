# 🧠 Le moteur de raisonnement de Milo

> Réflexion fondatrice de **Michel** (22/07/2026), en synthèse des retours GPT / Gemini / Mistral.
> Ce document est la **boussole** de tout ce qu'on construit pour « le cerveau de Milo ».
> Il ne se code pas d'un coup : chaque brique (priorités musculaires, ancre/accessoire,
> observations, profil conversationnel…) est une **PIÈCE** de ce moteur, jamais un ajout isolé.

---

## Le cap : du générateur au raisonnement

- **La plupart des IA** : `entrée → objectif → programme`. Efficace, mais c'est de la **génération**, pas du coaching.
- **Mieux (Gemini)** : `entrée → contexte → principes → stratégie → programme`. On quitte le « template ».
- **L'étape qui manquait (Michel) : le DIAGNOSTIC.** Un coach ne passe jamais directement du contexte à la stratégie.

**Le pipeline de raisonnement de Milo :**

`Compréhension → Diagnostic → Hypothèses → Décisions → Stratégie → Programme → Explication`

Une bibliothèque de **programmes** *reproduit*. Une bibliothèque de **décisions** *adapte*.
Un **raisonnement** *comprend* — et c'est la compréhension qui permet des décisions pertinentes.

**Pourquoi le diagnostic est central** : deux personnes, même objectif, même âge, même niveau, peuvent
avoir besoin de programmes **opposés** — parce que la **CAUSE** de leurs difficultés diffère.
Ex. « développer les pectoraux » : A = fréquence insuffisante · B = mauvaise technique · C = récup
insuffisante · D = mauvais choix d'exercices. Même contexte, diagnostic différent, stratégie différente.

**Causes types à distinguer** (viser 1-2 probables, PAS une longue liste) : fréquence · volume ·
intensité/charge · technique/exécution · choix d'exercices · récupération (sommeil/stress) · nutrition ·
régularité/adhérence · absence de progression planifiée · priorité mal ciblée.

---

## Les deux cerveaux (mappés sur notre architecture existante)

Ce cadre n'est **pas à construire de zéro** : c'est une **lentille** sur ce qu'on fait déjà.

- **Cerveau 1 — COMPRENDRE la personne** = le modèle **vivant** de l'athlète, construit progressivement :
  Registre · ADN sportif · Observations · état du jour / check-in · mémoire de conversation.
  (habitudes, douleurs, préférences, récupération, matériel, contraintes de vie, motivation, historique.)
- **Cerveau 2 — DÉCIDER** = le raisonnement de Milo + le **Gardien** (sécurité) + le futur générateur de programme.
  À chaque nouvelle information, il **réévalue** son diagnostic puis adapte exercices / volume / fréquence /
  conseils / explications. Le programme est la **conséquence** de la compréhension.

Cohérent avec l'**architecture hybride** déjà gravée : le **local/métier nourrit le contexte** (Cerveau 1 =
données déterministes + mémoire), **l'IA raisonne** (Cerveau 2). Les parties déterministes = la
**connaissance** (ancre/accessoire, biomécanique, EXLIB, VM) et les **données** ; le raisonnement se
**guide** par le prompt, il ne se code pas comme un moteur figé.

---

## La limite volontaire : fiabilité AVANT intelligence (Constitution · Principe 18)

Le but n'est **pas** de copier un cerveau humain (Milo ne voit pas l'athlète, ne corrige pas en direct, ne
ressent pas sa fatigue). À vouloir empiler trop de variables/hypothèses, on obtient « plus intelligent en
apparence, **moins fiable** ». La règle : **« pouvoir et savoir s'arrêter au bon moment. »**

- **Décider avec les infos d'AUJOURD'HUI**, jamais imaginées. Le **profil est VIVANT, jamais complet**
  (personne ne remplit tout) → apprendre **progressivement**, pas exiger un profil parfait.
- **Ne jamais faire semblant de savoir** : quand l'info manque → meilleure décision possible + **niveau de
  confiance honnête** + dire ce qui limite + poser **1-2** questions utiles. Posture type :
  *« Avec ce que je sais, je te conseille X aujourd'hui. Si tu me dis Y et Z, j'affinerai mon diagnostic. »*
- **Pas toujours UNE seule bonne réponse** : deux bons coachs peuvent diverger et réussir. Milo propose la
  décision la plus **cohérente** avec ce qu'il sait, jamais LA vérité. Il ne **surinterprète jamais**.

Sa qualité vient autant de ce qu'il sait **NE PAS conclure** que de ce qu'il sait conseiller.

---

## Les 3 réalités que le raisonnement doit accepter
1. **L'information est souvent incomplète.**
2. **Plusieurs stratégies peuvent être pertinentes.**
3. **La compréhension de l'utilisateur s'améliore avec le temps.**

> Le rôle de Milo n'est pas de générer le programme parfait dès le 1er jour, mais de prendre la meilleure
> décision possible avec les infos dont il dispose — puis de devenir progressivement un meilleur coach à
> mesure qu'il apprend à connaître la personne. C'est cette **évolution continue** qui sépare un générateur
> de programmes d'un véritable coach intelligent.

---

## État de mise en œuvre
- ✅ **Prompt de Milo enrichi** (`buildCoachContext`, coach.js, ft-v571) : pipeline diagnostic + causes types
  + « fiabilité avant intelligence / savoir s'arrêter » + posture d'humilité (1-2 questions).
- ✅ **Constitution · Principe 18** (v1.8).
- ✅ **Principes 19 & 20** (v1.9, ft-v575) — nés du sujet IMC, croisement GPT/Gemini/Mistral/Claude :
  **19 « La pertinence avant la disponibilité »** (une donnée n'est utilisée que si elle améliore la
  décision ; pertinence contextuelle ; ≠ minimalisme ; **deux étages** Milo raisonne / Gardien protège ;
  transparence ciblée) et **20 « La cohérence avant la réactivité »** (raisonner sur les tendances, pas sur
  le bruit ponctuel). Gravés dans le prompt de Milo (`buildCoachContext`) + le Gardien (`_gardienRules`
  → seuils absolus IMC ≥ 40 · tour de taille > 120 cm). ⏳ **Couche future** : veille longitudinale des
  signaux faibles sur plusieurs semaines (dérive sommeil / FC repos) + données de **montre connectée**
  (FC, pas) — non collectées aujourd'hui → liées à la brique « mémoire vivante ».
- ✅ **1ʳᵉ pièce — exercices « ANCRE » vs « ACCESSOIRE »** (`_exRole`, log.js, ft-v572) : connaissance
  déterministe du **Cerveau 2** (dérivée du schéma moteur, 0 IA). ANCRE = grand polyarticulaire de base
  qui porte la progression (squat/hip-hinge/poussée horiz.+vert./tirage horiz.+vert.) ; ACCESSOIRE =
  isolation/mouvement secondaire. Injectée dans `buildCoachContext` (bloc « STRUCTURER UN PROGRAMME » +
  étiquetage [ancre]/[accessoire] des exos de la séance en cours) → Milo construit AUTOUR des ancres,
  diagnostique une stagnation d'ancre autrement qu'un manque de volume d'accessoires.
- ✅ **2ᵉ pièce — profil CONVERSATIONNEL, étape 1 « le comportement »** (`buildCoachContext`, coach.js,
  ft-v573) : connaissance du **Cerveau 1** (COMPRENDRE), prompt-only. Bloc « APPRENDRE À CONNAÎTRE LA
  PERSONNE EN DISCUTANT » : profil VIVANT, poser 1 bonne question au bon moment (aide d'abord), écouter +
  montrer qu'on retient (adapte selon ce que la personne confie), relier au profil/ADN/historique,
  respecter le rythme (jamais un interrogatoire). Concrétise le Principe 18.
- ✅ **2ᵉ pièce — profil CONVERSATIONNEL, étape 2 « la mémoire durable »** (`coach.js`, ft-v582) :
  quand la personne confie un trait DURABLE en discutant (horaires, matériel, préférence forte,
  contrainte de vie, motivation), Milo PROPOSE de le retenir via un bloc caché `{"retiens":[…]}` →
  ligne « 🧠 Je retiens : … ? [Oui][Non] » → validé = rangé dans `S.registre.observations`
  (`status:'validated'`, `source:'conversation'`) → réutilise l'injection contexte + « Ce que Milo
  sait de toi ». **Rien mémorisé sans accord** (Principe 3), jamais un état du jour, jamais inventer.
  Réutilise l'infra Observations (une seule mémoire durable). 0 backend (Registre déjà cloud-sync).
- ⏭️ **Pièces à venir** (chacune une brique du moteur, une à la fois) : Observations (Cerveau 1 qui
  affine + Cerveau 2 qui réévalue) · générateur de programme (sortie du Cerveau 2).
