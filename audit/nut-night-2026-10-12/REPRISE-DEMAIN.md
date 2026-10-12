# PREMIÈRE ACTION DEMAIN MATIN

**Lire `SYNTHESE-CROISEE-NUT-NIGHT.md` (1 minute), répondre aux 4 questions ci-dessous (5 minutes), puis lancer `PROMPT-NUT-LOT-C.md`.**

1. **État global** :
   - Nutrition est presque fermable.
   - Environ 28 000 requêtes et 20 parcours réels donnent 222 symptômes, qui se ramènent à **3 causes**.
   - Le produit n'a pas été touché cette nuit ; master est intact (`7b75f3c1`).
2. **Verdict VARIANTS-03** :
   - selon Principal : qualifié avec dette (dettes nommées FV-164, **FV-165 viande hachée = crus seulement**, « light », cola seul) ;
   - le verdict indépendant de Claude Nutrition est dans la synthèse croisée.
3. **Compte** : **0 P0 · 3 causes P1** (7 entrées) **· 4 P2 · 14 P3 / dettes** (dont 6 dettes déjà connues).
4. **Première chose à faire** : répondre à **D1 → D4**, puis lancer **LOT-C**.
5. **Pourquoi LOT-C d'abord** :
   - c'est la seule **corruption de données du journal** : dans « Modifier », vider le champ grammes transforme une ligne
     de 250 g / 388 kcal en 155 kcal avec quantité 0 ;
   - à l'ajout, vider la quantité enregistre les valeurs pour 100 g ;
   - il ne dépend d'**aucune** décision.
6. **Prompt à lancer** : `PROMPT-NUT-LOT-C.md` (dans ce dossier).
7. **Durée** : 45 à 60 min.
8. **Condition de fin** :
   - les témoins par clics réels (vide / 0 / texte, à l'ajout ET à la modification) sont rouges avant et verts après ;
   - les mutations sont conformes ;
   - `repas_actif` et `habitudes_alim` sont verts, et les témoins existants de la garde ft-v1051 aussi ;
   - un handoff est produit, et seule la branche est poussée.
9. **Deuxième action** : **LOT-A** (`PROMPT-NUT-LOT-A.md`, 45–60 min, **aucune ligne d'app.js**). Il corrige :
   - « confiture » → *confiture de lait* ;
   - gruyère → emmental, pilon → cuisse, etc. ;
   - les copies de valeurs Quick (dosette à 576 kcal).

   Puis **LOT-B** (`PROMPT-NUT-LOT-B.md`, 60–90 min) : « riz 100g » vide, « coca 0 » → cola sucré, point final.
10. **Nutrition est fermée quand** :
    - C, A et B sont verts et contre-vérifiés ;
    - les branches Nutrition sont intégrées (D-042 closure → VARIANTS → lots) ;
    - la passe **D-031** est verte sur l'arbre final intégré.

    Alors : publication, puis **passage à Séance**. Les P3 restent des dettes nommées.

## Les 4 questions (une réponse courte suffit)

- **D1 — Alias.**
  - « confiture » tout court doit-il viser la confiture « sans précision sur les sucres » (235 kcal) ou « non allégée »
    (244 kcal) ?
  - Et pour ces cas discutables, l'aliment exact ou la version générique ?
    - blanc de poulet / blanc de dinde : filet cru, ou tranche de charcuterie ?
    - pomme de terre vapeur : aliment moyen cuit, ou « vapeur sous vide » 76 kcal ?
    - laitue / batavia / feuille de chêne : « salade verte », ou l'aliment exact ?
- **D2 — « riz 100g » tapé dans la recherche.**
  - Seulement ignorer « 100g » pour trouver le riz (proposé) ?
  - Ou aussi pré-remplir 100 g dans le champ quantité ?
- **D3 — Macro « non déterminée » dans CIQUAL** (18 aliments : merguez, saucisses fumées…).
  - La garder « inconnue » avec une mention ?
  - Ou 0 avec un drapeau (aujourd'hui : 0 silencieux) ?
- **D4 — 5 groupes de produits Quick aux valeurs copiées** (dosette de sauce à 576 kcal).
  - Les marquer « doute » comme tu l'avais décidé en ft-v1114, ou les retirer ?
  - La vérification sur la PDF officielle Quick doit se faire de ton côté : le conteneur ne l'atteint pas.

> Sans réponse à D1 / D4 : LOT-A corrige seulement les erreurs nettes. Sans D2 : LOT-B ignore la quantité, sans la reporter.
