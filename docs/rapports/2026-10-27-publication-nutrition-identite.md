# Nutrition — identité et réutilisation des anciens aliments : verdict de publication

Date : 27/10/2026 · Branche `claude/nut-identite-reutilisation-01` @ `492666e3` · base `origin/master` `53c464f6` (ft-v1261)

## Verdict : ✅ PUBLIABLE (en attente du GO explicite de Michel)

Raison : les deux passes D-031 sont valides et identiques (0 rouge), `Code.js` est identique à master, aucune donnée existante n'est modifiée, la règle d'or 11 est couverte. Rien n'est fusionné ni déployé. Rien n'est vérifié sur iPhone.

## 1. État de la branche
- 13 fichiers, +801 / −29 par rapport à master. Master inchangé depuis le départ de la branche (aucune publication concurrente).
- `Code.js` : aucune différence avec master (Apps Script @193 inchangé ; D-141 / `hiddenFoods` non déployés).
- Un rouge réel a été trouvé et corrigé pendant la passe : le recensement `CCCII ⑮` comptait 12 portes vers `_afOublierAliment` ; la correction en ajoute une 13ᵉ (`_n2ChoisirCandidat`, choix de fiche proposée). Témoin mis à jour (13 portes, 6 servies, présence de `_n2ChoisirCandidat`), commit `492666e3`. Les deux passes ci-dessous ont été relancées entières après ce commit.

## 2. Passes D-031 (sur `492666e3`)
| Passe | Résultat | Conditions |
|---|---|---|
| Répartie (3 processus) | 8 280 ✅ · 0 ❌ (équivalent séquentiel 8 242 ✅) | 8/8 |
| Classique (`passe_valide.sh`) | 8 242 ✅ · 0 ❌ | 4/4 |
- R1 : les deux totaux séquentiels sont identiques (8 242 / 0). R4 : classique faite cette semaine.
- Limite dite : navigateur Playwright Chromium 1243 présenté comme 1194 par un lien symbolique hors dépôt → environnement non strict ; 13 tests « sans objet » non comptés.

## 3. Non-régression
Partie `identite` (46 témoins B-NIDT) + parties `ecran` et `croise` du banc Nutrition fiabilité ; contrôle négatif `tools/mut_nut_fiabilite.py` (mutations I1–I22, MC4) ; les 4 portes d'écriture (`addFoodEntry`, `quickAddFood`, `rejouerRepas`, `saveEditFood`) ; synchro/restauration avec le vrai `Code.js` en local (X①–④). Tout vert dans les passes.

## 4. Règle d'or 11
Points 2 à 5 faits (commit `ab6d957b`) : point rouge `NEW_FEATURES` (constants.js) · aide `?` (`_HELP_DATA`, screens.js) · aide détaillée (`_DRAWER_CONTENT.help`, coach.js) · diapo du Guide (`APP_GUIDE_SLIDES`, app.js). Pas de pop-up `WHATS_NEW` : la personne n'a rien à faire, aucun repère n'a bougé (R25).

## 5. Données existantes
- Aucune migration, aucune clé de stockage ajoutée, aucune suppression, aucune écriture avant « Ajouter ».
- Les anciennes lignes restent intactes (témoins : stockage brut identique avant/après choix ; copie d'origine dans `n2.av`).
- « Modifier » garde l'identité seulement si le nom est inchangé/corroboré ET les valeurs inchangées.

## 6. Compteurs (règle d'or 17), code applicatif seulement
Données persistées ajoutées : **0** · fichiers applicatifs touchés : **2** (`app.js`, `index.html`) + 3 fichiers de texte d'aide (`constants.js`, `screens.js`, `coach.js`, règle 11) · lignes ajoutées − retirées : voir `git diff --numstat origin/master -- app.js index.html constants.js screens.js coach.js` · anciens chemins supprimés/fusionnés : 0 (4 réutilisés).

## 7. Préparation de la publication (NON appliquée, attend le GO)
1. `sw.js` → `ft-v1262` ; CLAUDE.md (en-tête + entrée courte, entrée ft-v1254 déménagée en ajout dans `docs/JOURNAL-ARCHIVE.md`, texte complet de ft-v1262 dans l'archive) ; `docs/CONTEXTE-ACTUEL.md` ; `python3 tools/inventaire.py` ; `docs/JOURNAL-DE-PARTAGE.md` ; `check_regles.py`.
2. Branche de retour arrière `backup-prod-ft-v1261-…` depuis master (les tags sont refusés par le proxy).
3. Fusion sur master → vérifier le run Pages et « À propos » = ft-v1262 (R18). Pas de déploiement Apps Script (Code.js inchangé).
4. Si master a bougé entre-temps : refusionner et relancer la passe.

## 8. À vérifier sur iPhone (après publication)
- Reprendre un ancien aliment sans code-barres/CIQUAL qui a un homonyme identifié : le panneau « fiche proposée » apparaît, rien n'est pré-choisi.
- Taper une quantité d'abord, puis choisir la fiche : la quantité reste, les valeurs se recalculent ; rien n'est enregistré avant « Ajouter ».
- « Modifier » : changer seulement le nom ou le repas → le produit (code-barres/CIQUAL) est conservé ; changer les valeurs → l'identité est abandonnée.
- Hors ligne puis réseau : choix d'une fiche code-barres hors ligne = « fiche introuvable » sans rien casser ; table CIQUAL absente puis revenue.
- « + Ajouter » et « Tes repas habituels » : aucun changement de comportement.
- Restauration sur appareil neuf : les lignes arrivent identiques.

## 9. Points ouverts / limites
- D-144 (un nom sans rapport fait tomber l'identité en « Modifier ») : proposée, à confirmer par Michel. D-141, D-112, D-098 : hors de cette mission.
- Les fiches de marque ne sont pas proposées (CIQUAL et code-barres seulement). Les doublons dans « Mes aliments » ne sont pas masqués.
- États : corrigé sur branche ✅ · intégré ❌ · publié ❌ · vérifié sur iPhone ❌.

## 10. Registre / passation (à reporter par Michel, règle d'or 18)
IDs proposés : `NUT-IDENT-01` (« Modifier » perd l'identité) → corrigé sur branche `492666e3`, passes D-031 8 242 ✅/0 ❌ ; `NUT-IDENT-02` (anciens aliments sans identité non réutilisables) → corrigé sur branche, idem. Liés : NUT-QTY-01, NUT-QTY-02, NUT-CIQ-HL-01. Rien n'a été écrit sur Drive.
