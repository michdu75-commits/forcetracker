# 🔬 AUDIT DU MOTEUR NUTRITIONNEL — Phase A mesurée, Phase B amorcée

> **Créé le 22/09/2026**, en réponse au cahier *« Force Tracker — Audit nutritionnel complet »*
> (5 pages, 13 sections, 38 tests) remis par Michel.
>
> ⛔⛔ **AUCUNE LIGNE DE CODE MÉTIER N'A ÉTÉ TOUCHÉE**, et ce n'est pas une prudence de ma part :
> c'est le **principe non négociable n°2 du cahier lui-même** (*« Aucune correction fonctionnelle
> avant la fin de l'audit et du contre-audit »*) et son **§12** (*« Aucune implémentation tant
> que… »*). Le cahier demande un **audit**, pas un correctif.
> ⚖️ Et ça tombe bien : le chantier Nutrition est **gelé** par décision de Michel du 13/09/2026.
> Un audit en lecture seule est compatible ; une refonte ne l'est pas sans nouveau feu vert.

---

## 0. Ce qui a été fait, et comment

| | |
|---|---|
| **Phase A — audit forensique** | ✅ **faite et MESURÉE dans l'app servie**, pas déduite de l'écran |
| **Phase B — audit documentaire** | ⚠️ **amorcée, et bornée par une limite technique mesurée** (§6) |
| **Phase C — contre-audit** | ⛔ **non faite** — elle exige la Phase B complète |
| **Architecture cible, §6 du cahier** | ⛔ **non proposée** — elle vient après B et C |

L'instrument est **`tools/audit_nutri_moteur.js`** : il conduit l'app servie dans un vrai
navigateur, pose des profils, et lit `bmrDetail()`, `calcTDEE()`, `autoKcal()`, `calcMacros()`.
⭐ Il est **reproductible et lecture seule** — il ne modifie rien, il mesure.

---

## 1. ⭐⭐ LES QUATRE CAS DU CAHIER SONT REPRODUITS

Profil approché du cahier : **homme, 85,8 kg, 179 cm, 41 ans, niveau « Actif (5-6 j) », métier
physique**, phase **CHARGE**, **jour de séance**. TDEE mesuré : **3 515 kcal** (le cahier : 3 522).

| objectif | cahier (kcal · P · G · L) | mesuré ici | écart |
|---|---|---|---|
| Force maximale | 3 822 · 172 · 621 · 72 | **3 815 · 172 · 615 · 74** | −7 kcal · **0 g P** |
| Perte gras + muscle | 3 372 · 223 · 482 · 61 | **3 365 · 223 · 477 · 63** | −7 kcal · **0 g P** |
| Prise de muscle | 3 972 · 189 · 659 · 65 | **3 965 · 189 · 653 · 66** | −7 kcal · **0 g P** |
| Rééquilibrage | 3 622 · 172 · 596 · 64 | **3 615 · 172 · 590 · 63** | −7 kcal · **0 g P** |

⭐⭐ **Les protéines tombent EXACTEMENT sur les quatre lignes**, et les écarts caloriques sont
tous de **−7 kcal**, c'est-à-dire exactement l'écart de TDEE entre mon profil approché et le
sien. ***La reproduction n'est pas approximative : elle est exacte à la différence d'entrée près.***

**Et les écarts par objectif sont ceux de la table, lue à la source** —
`_GOAL_DELTA_KCAL = {muscle:350, perte:−450, recomp:−250, force:200, equilibre:0, endurance:100}`,
plus `phaseAdj = +100` en charge / `−100` en décharge :

| | force | recomp | muscle | equilibre |
|---|---|---|---|---|
| cahier (cible − TDEE) | +300 | −150 | +450 | +100 |
| mesuré | **+300** | **−150** | **+450** | **+100** |

---

## 2. ⛔⛔ LE CONSTAT CENTRAL DU CAHIER EST CONFIRMÉ — LES GLUCIDES SONT UN RÉSIDU

`macrosForKcal()` (`state.js`) :

```js
const prot_g  = Math.round(S.bw * protRatio);     // g/kg de POIDS DE CORPS
const fat_g   = Math.round(S.bw * fatRatio);      // g/kg de POIDS DE CORPS
const carbs_g = Math.max(0, Math.round((kcal - prot_g*4 - fat_g*9) / 4));   // ⛔ LE RESTE
```

👉 ***Les protéines et les lipides sont attachés au poids de corps ; les glucides absorbent tout
ce qui reste.*** Plus le TDEE est élevé, plus les glucides montent — **mécaniquement, sans aucune
borne**. C'est exactement la logique « calories restantes = glucides » que le §3 du cahier
demandait d'identifier.

**Mesuré, jour de séance, à 85,8 kg :**

| objectif | glucides | **g/kg/j** |
|---|---|---|
| Endurance (jour de repos) | 639 g | **7,45** |
| **Prise de muscle** | 653 g | ⛔ **7,61** |
| Force maximale | 615 g | **7,17** |
| Rééquilibrage | 590 g | **6,88** |
| Perte gras + muscle | 477 g | 5,56 |
| Perte de gras | 421 g | 4,91 |

⚠️ **Et le cycle glucides AGGRAVE le sommet** : les jours de séance il déplace des lipides vers
les glucides (`dFat −11 g → dCarbs +24 g` mesuré). Le maximum n'est donc pas atteint un jour de
repos, mais **le jour où la personne s'entraîne**.

---

> ## ⛔⛔ CORRECTION DU 22/09 AU SOIR — LA SECTION 3 CI-DESSOUS EST FAUSSE
>
> Le corpus massif (921 984 profils) a **réfuté** ce que j'écris plus bas. L'écart maximal de
> fermeture calorique n'est pas de ±3 kcal : il atteint **+377 kcal** — une femme de 75 ans,
> 150 cm, 110 kg en perte de poids voit **« cible 1 515 kcal »** et des macros qui totalisent
> **1 892 kcal**. 191 profils sont concernés, écart moyen 108 kcal.
>
> **Deux erreurs successives, les deux à moi** : ① 14 cas ne suffisaient pas ; ② mon corpus ne
> gardait ensuite que les **8 premiers** cas rencontrés, pas les **pires** — *un échantillon
> d'exemples n'est pas un maximum*. ⭐ L'invariant reste vrai **hors écrêtage des glucides** :
> c'est le `Math.max(0, …)` qui laisse le surplus dans la somme.
>
> **Le détail et la correction sont dans `docs/DOSSIER-DECISION-NUTRITION-2026-09-22.md`.**

## 3. ⚠️ ~~MAIS UNE ANOMALIE SUGGÉRÉE PAR LE CAHIER N'EN EST PAS UNE~~ (RÉFUTÉ — voir l'encadré)

Le **T09 — fermeture calorique** demande de vérifier que `4P + 4G + 9L` retombe sur la cible.
**Mesuré sur 14 cas** (6 objectifs × charge, 4 × décharge, 4 × jour de séance) :

> ⭐ **écart maximum : ±3 kcal.** La fermeture est saine.

⚠️ **Or la ligne « Rééquilibrage » du cahier ne ferme PAS** : 172 P + 596 G + 64 L = 3 648 kcal
pour une cible de 3 622, soit **+26 kcal**, alors que ses trois autres lignes ferment à ±5. Ma
mesure du même cas ferme à **+0**. ⛔ **Je ne conclus pas** : sans la capture d'origine je ne peux
pas distinguer une recopie manuelle dans le PDF d'un cas particulier non reproduit. **C'est à
vérifier sur la capture, pas à corriger.**

---

## 4. 📚 CE QUE DIT LA LITTÉRATURE — et la surprise est en faveur du moteur actuel

| règle Force Tracker (mesurée) | référence | verdict |
|---|---|---|
| **Lipides 15,5 % → 20,3 %** des calories | Helms 2014 : **15-30 %** | ✅ **dans la plage** |
| **Surplus muscle +350 (+450 en charge)** sur 3 515 kcal = **+10 % / +13 %** | Iraki 2019 : **+10-20 %** (novice/intermédiaire), +5-10 % (avancé) | ✅ **plage basse, conservateur** |
| **Glucides = le reste** | Helms 2014 : *« …and the remainder of calories from carbohydrate »* | ⚠️ **c'est la méthode de référence** |
| **Protéines 2,0 → 2,6 g/kg de POIDS DE CORPS** | Helms 2014 : **2,3-3,1 g/kg de MASSE MAIGRE** | ⚠️ **unité différente** |

**⭐⭐ LE POINT QUI CHANGE LA CONCLUSION DU CAHIER.** Le §6 demande de *« ne pas fermer aveuglément
l'équation avec les glucides »*. Or **c'est précisément ce que recommande la littérature de
référence en musculation** : on fixe protéines et lipides, les glucides prennent le reste.
👉 ***Le défaut n'est donc pas la méthode du résidu : c'est l'absence de CONTRÔLE DE PLAUSIBILITÉ
sur son résultat.*** Helms écrit pour un contexte de **déficit** encadré par un praticien ; ici la
même formule tourne seule, en **surplus**, sur un TDEE lui-même estimé.

**⚠️ Et l'unité des protéines est une vraie question d'audit.** À 85,8 kg avec ~18 % de masse
grasse, la masse maigre vaut ≈ 70 kg — donc `recomp` à 2,6 g/kg de poids de corps (223 g) fait
**3,2 g/kg de masse maigre**, soit **au-dessus** du haut de la plage Helms. Ce n'est pas dangereux
(la littérature ne rapporte pas de risque chez le sujet sain), mais ***le chiffre affiché n'est
pas dans l'unité de la source qui le justifie***. Le cahier l'avait pressenti (**T06**).

---

## 5. ⛔ CE QUE LE CAHIER SUPPOSE ET QUI EST DÉJÀ VRAI (R23)

Plusieurs exigences du cahier sont **déjà tenues** — les rebâtir serait refaire ce qui existe :

| exigence du cahier | état réel, mesuré |
|---|---|
| **T19** — pas de NaN, fallback explicite, pas de prescription silencieusement précise | ✅ **livré en ft-v1232** : `profilCaloriqueManquants()` est propriétaire unique, la chaîne rend `null` et l'écran nomme les champs manquants |
| **T16** — même valeur, nature différente (MG mesurée vs estimée) | ✅ **livré en ft-v1231** : `weightLog[].bfSrc` (`mesure` / `estime` / absent = inconnu) |
| **T22** — provenance inconnue reste inconnue | ✅ **livré en ft-v1231 et ft-v1227** : on n'invente jamais une provenance absente |
| **T29/T30** — mutations mordantes, ancres vivantes | ✅ **pratique établie** : contrôle négatif sur arbre cloné à chaque version, ancres mortes comptées |
| **T38** — tout fonctionne sans IA | ✅ **déjà vrai** : BMR, TDEE, macros, plan local, débrief chiffré sont 100 % locaux |
| **T27** — déterminisme | ✅ sauf `getMensCyclePhase()` et le cycle glucides, qui dépendent de **la date** et de l'historique — donc déterministes **à date et historique fixés** |
| « documenter le moteur » | ⚠️ **`docs/NUTRITION-MOTEUR.md` existe depuis le 18/08/2026** et décrit déjà la chaîne BMR → TDEE → objectif → macros → plan → portions |

---

## 6. ⛔⛔ LA LIMITE QUI BORNE LA PHASE B — MESURÉE, PAS SUPPOSÉE

Le §4 du cahier exige des sources primaires (organismes publics, sociétés savantes, consensus) de
plusieurs régions. **Mesuré depuis ce conteneur :**

```
pubmed.ncbi.nlm.nih.gov   → CONNECT tunnel failed, 403
pmc.ncbi.nlm.nih.gov      → bloqué par le proxy d'egress
link.springer.com         → bloqué
www.anses.fr              → bloqué
www.efsa.europa.eu        → bloqué
www.who.int               → bloqué
dietitians.ca             → bloqué
raw.githubusercontent.com → 301 (seul GitHub passe)
```

👉 ***La RECHERCHE fonctionne, la LECTURE des sources primaires non.*** Je peux obtenir des
résultats de moteur de recherche avec leurs extraits ; je ne peux pas ouvrir les articles pour
vérifier population, protocole, date et limites — **ce que le cahier exige explicitement**.

**⛔⛔ ET CE N'EST PAS THÉORIQUE : LE PREMIER RÉSUMÉ REÇU ÉTAIT FAUX.** Interrogé sur les glucides
en musculation, le moteur de recherche a répondu **« 8-12 g/kg/j »** en le présentant comme la
recommandation pour la musculation. C'est la plage des **athlètes d'endurance à très haut volume**
— exactement l'extrapolation que le **§4 du cahier interdit** (*« Interdiction de transformer une
recommandation destinée à des cyclistes d'élite en règle universelle pour la musculation »*).
👉 ***Une Phase B bâtie sur des résumés de moteur de recherche produirait des règles fausses avec
l'apparence de sources.*** C'est pourquoi elle est déclarée **amorcée**, pas faite.

**Ce qu'il faudrait pour la finir** : que Michel fournisse les PDF des positions de référence
(ACSM/AND/DC 2016, ISSN protéines 2017, Helms 2014, Iraki 2019, ANSES), ou qu'un domaine d'accès
aux publications soit ouvert. *Une instruction donnée à Michel doit être nécessaire et réversible
— celle-ci l'est, et elle est la seule qui débloque la Phase B.*

---

## 7. 📋 CLASSEMENT DES CONCLUSIONS (exigé par le §5 du cahier)

| conclusion | classe |
|---|---|
| Les glucides sont un résidu calorique sans borne | ⭐ **ÉTABLIE** — lue dans le code et mesurée |
| Les 4 cas du cahier sont reproduits par le moteur actuel | ⭐ **ÉTABLIE** — ±7 kcal, protéines exactes |
| La prise de muscle produit **7,6 g/kg/j** de glucides à 85,8 kg | ⭐ **ÉTABLIE** — mesurée |
| ~~La fermeture calorique est saine~~ | ⛔ **RÉFUTÉE le 22/09 au soir** — écart réel jusqu'à **+377 kcal** (voir l'encadré §3) |
| Les lipides et le surplus sont dans les plages publiées | **PROBABLE** — sources secondaires, primaires non lues |
| Les protéines sont exprimées dans une autre unité que leur source | **PROBABLE** — ⚠️ **nuancé le 22/09 au soir** : l'ISSN 2017 donne 2,3-3,1 g/kg de **poids de corps** en déficit, donc Force Tracker est dans la bonne unité — le défaut réel est le **dénominateur chez les sujets à forte masse grasse** |
| 7,6 g/kg/j est « nutritionnellement indéfendable » | ⛔ **NON DÉMONTRÉE** — exige la Phase B complète |
| Le TDEE de départ est surestimé (hypothèse du §1) | ⛔ **NON DÉMONTRÉE** — exige un TDEE observé, donc des données réelles |

---

## 8. ⚖️ CE QUE JE NE FAIS PAS, ET POURQUOI

- ⛔ **Aucun code métier touché** — interdit par le §2 et le §12 du cahier, et par le gel du 13/09.
- ⛔ **Aucune architecture cible proposée** — elle vient après B et C (§6 du cahier).
- ⛔ **Aucun des 38 tests écrit** — le §12 exige que les règles cibles soient validées d'abord.
- ⛔ **Aucun seuil inventé** pour borner les glucides : ce serait précisément la fausse précision
  que le cahier interdit, et une décision produit qui appartient à Michel (**règle d'or #15**).

**⚠️ Et une réserve de méthode, dite plutôt que masquée.** Ce cahier décrit un chantier de
plusieurs semaines : 38 tests, un corpus de « plusieurs dizaines de profils », des séries
longitudinales de 8 à 16 semaines, un contre-audit indépendant, un modèle d'historique immuable et
une stratégie de migration. C'est **un ordre de grandeur au-dessus** de tout ce qui a été livré
jusqu'ici en une version. ***Le découper en étapes validées une par une est la seule façon de ne
pas le commencer et l'abandonner*** (**R19** : la gouvernance sert le produit).

---

## 9. 🎯 CE QUI SE DÉCIDE MAINTENANT (et qui revient à Michel)

1. **La Phase B se fait-elle sur sources primaires ?** Si oui, il faut les PDF — sinon elle
   restera au rang de « probable » et aucune règle ne pourra être implémentée (§5 du cahier).
2. **Quel est le vrai problème à résoudre en premier ?** L'audit dit que c'est **l'absence de
   contrôle de plausibilité sur les glucides**, pas la méthode. C'est un chantier beaucoup plus
   petit qu'une refonte.
3. **L'historique immuable des périodes (§7 du cahier)** est un chantier à part entière, sans lien
   technique avec les macros. Il peut être décidé séparément.

---

*Instrument : `tools/audit_nutri_moteur.js` (lecture seule, reproductible).
Sources consultées : Helms, Aragon & Fitschen 2014 (JISSN) · Iraki et al. 2019 · ISSN protein
position stand 2017 · ACSM/AND/DC 2016 — **toutes via résultats de recherche, aucune lue à la
source** (voir §6).*
