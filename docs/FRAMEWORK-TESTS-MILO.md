# 🧪 Framework de validation de Milo — architecture (document de gouvernance)

> **But** : garantir la qualité de Milo **dans le temps** (plusieurs années). Ce n'est pas
> une suite de tests, c'est une **architecture de validation** d'une IA conversationnelle.
> Cadrage : Michel (vision) + Claude (archi), 23/07/2026. Croisé avec GPT/Gemini/Mistral.
>
> ⚠️ **Discipline** : on grave l'architecture (durable), on **construit par tranches** (pas de
> cathédrale). Chaque ajout passe par les **3 critères** (`docs/PROCESSUS-DEVELOPPEMENT.md`).

---

## 1. Le principe fondateur

> **« Chaque bug découvert devient un scénario de test permanent. »**

Version outillée de `docs/BUGS-DE-PHILOSOPHIE.md` (*un bug = une règle qui manquait*). Quand une
nouvelle version de Milo sort, **tous les anciens bugs sont automatiquement retestés** : ils ne
doivent JAMAIS revenir. Chaque scénario porte son `origin` (le `ft-vNN` du vrai bug) → le corpus
raconte l'histoire de la robustesse de Milo.

## 2. Les DEUX axes (orthogonaux — ne jamais les fusionner)

Chaque scénario a **deux étiquettes indépendantes** :

- **Criticité** — *combien c'est grave si ça casse* : `critique` · `majeur` · `mineur`.
- **Tier** — *comment on le teste* (coût + fiabilité) :

| | **TIER 1 — DÉTERMINISTE (sans LLM)** | **TIER 2 — ÉVAL (avec le vrai Milo)** |
|---|---|---|
| Teste | Le **contexte** (`buildCoachContext`), les moteurs (Gardien, reco exos, macros), le câblage | Le **comportement réel** de Milo (naturel, raisonnement) |
| Coût | **0**, instantané | 1 appel LLM/scénario — **pas de juge**, les vérificateurs sont du code (voir §6) |
| Fiabilité | **Reproductible à 100 %** | Non-déterministe (l'output varie) |
| Quand | **À chaque commit** | À la main (`--go`), avant/après un changement de prompt — jamais dans la suite de livraison |

**Sépare aussi « obtenir » et « juger »** :
- *Obtenir la sortie* : avec LLM ou sans.
- *Juger la sortie* : **verdict déterministe** (assertion / regex / Gardien) ou **juge IA**.

Trois combinaisons utiles :
1. **Sans LLM + verdict déterministe** → le plus solide → peut être un **blocage dur** (gate).
2. **Sortie LLM + verdict déterministe** (Gardien/regex sur la vraie réponse) → **alerte forte**, pas blocage (l'output varie).
3. **Sémantique pur** (juge IA) → **surveillé**, jamais un gate.

## 3. Le NOYAU DUR (la « Constitution » du corpus)

Une **dizaine** de scénarios **critiques** (les bugs existentiels) qui tournent **EN PREMIER, à
chaque version, et bloquent si rouge**. Petit, stable : il ne grandit que quand apparaît une
**nouvelle CLASSE existentielle** de bug (même discipline que « garder la Constitution courte »).

**Règle d'or du noyau dur : le plus DÉTERMINISTE possible.** Un gate qui bloque une release ne peut
pas être flaky. Les bugs existentiels connus, presque tous testables sans LLM :

| Bug existentiel | Origin | Testable |
|---|---|---|
| Oubli d'une blessure connue | ft-v588 | ✅ déterministe (la zone est-elle dans le contexte/Gardien ?) |
| Redemande d'une info déjà connue | ft-v595 | ✅ déterministe (info dans le contexte + règle présente ?) |
| Fuite d'un bloc technique | ft-v591 | ✅ déterministe (`_stripCoachTech` / `_gardienSortie`) |
| Violation d'une règle du Gardien | ft-v591 | ✅ déterministe (le Gardien EST déterministe) |
| Oubli des objectifs chiffrés | ft-v574 | ✅ déterministe (objectifs dans le contexte ?) |
| Invention d'une info / source | ft-v589 | 🟡 sémantique (Tier 2) + garde-fou regex partiel |

## 4. Le schéma d'un scénario

```
{
  id, category, criticality, tier, origin, description,
  setup   : { profile, quiz, health, reply? },   // état contrôlé
  checks  : { contextMustContain[], contextMustNotContain[],
              gardienFlagsExpected[], replyMustNotContain[] }
}
```

- `setup` = un état 100 % contrôlé (profil, réponses d'inscription, santé, historique, +
  éventuellement une **réponse Milo** figée pour les checks de sortie déterministes).
- `checks` = les assertions déterministes (Tier 1). Le Tier 2 vit dans un **fichier séparé**
  (`eval-scenarios.js`) et non dans un bloc `eval` de ce corpus-ci, comme il était prévu : ses
  scénarios ont besoin d'un `history` (le bug n'apparaît parfois qu'au 2ᵉ message) et surtout de
  **fonctions de vérification**, que ce fichier-ci — pure donnée — n'a pas vocation à porter.

## 5. Les familles (l'axe `category`)

`memoire` · `coherence` · `personnalisation` · `conversation` · `nutrition` · `analyse-photo` ·
`programmes` · `securite` · `cas-extremes`. (Le corpus grandit librement ; seul le noyau dur reste petit.)

## 6. Le Tier 2 — ✅ CONSTRUIT le 20/08/2026, et SANS juge IA

> **Ce qui l'a déclenché** : le §8 de `docs/ARCHITECTURE-CERVEAU-CERVELET.md` posait que
> `tests/milo` prouve la **PRÉSENCE** d'une règle, jamais son **OBÉISSANCE**. Le 20/08 on en a eu
> la **preuve** : la règle *« avant de reprocher une charge, regarde qui l'a choisie — le marqueur
> te le dit, **ou tu la retrouves dans votre échange** »* était dans le prompt, la séance était
> littéralement quelques messages plus haut, et Milo a quand même reproché ses propres paliers
> (ft-v926). *Une règle présente n'est pas une règle appliquée* — et rien ne mesurait ça.

### 6.1 Le juge IA était prévu. On ne l'a pas construit — c'est une DÉCISION (R30)

Les 3 garde-fous d'origine étaient bons, et le deuxième — **« qui juge le juge ? »** — est
justement celui qui tue l'idée : un juge demande une **calibration humaine régulière** et un
**modèle épinglé**, c'est-à-dire un deuxième chantier permanent, pour **doubler le coût** de
chaque passe et **ajouter** une source d'erreur.

**Le constat qui tranche** : les vrais bugs de ce projet sont **mécaniquement vérifiables**. Un
exercice absent d'un débrief, une charge de 82,5 kg sur une barre, un *« c'est noté »* sans bloc
de mémoire, un lien inventé, un féculent proposé en keto — tout ça, du **code** le voit. On a donc
écrit **15 vérificateurs en JavaScript**. Le jour où un attendu ne sera vraiment pas exprimable en
code, il restera au **juge HUMAIN** — c'est déjà ce que fait la carte VC dans l'app.

### 6.2 Les deux règles d'interprétation (à lire avant tout rapport)

1. ⚠️ **Un VERT vaut moins qu'un ROUGE.** Un rouge est une **preuve** : la règle a été violée sous
   une forme que le code reconnaît. Un vert dit seulement *« aucune violation DÉTECTABLE »*. On ne
   conclut **jamais** « Milo respecte ses règles » d'un run tout vert ; on conclut « ces 15 pièges-là
   n'ont pas pris ».
2. ⚠️ **Les motifs sont volontairement ÉTROITS** (R19). On préfère **rater** une violation que
   rougir sur une réponse correcte : un faux rouge ferait jeter le benchmark entier, un raté ne
   coûte que ce qu'on savait déjà ne pas voir.

### 6.3 Les deux garde-fous de COÛT — c'est le seul runner du dépôt qui dépense

1. **Il ne part pas tout seul.** Sans `--go`, il tourne **à blanc** : 0 appel, 0 €. Il construit
   quand même le **contexte réel** de chaque scénario (gratuit, tout est local) et en tire un devis
   **mesuré**, pas deviné — ~70 k caractères par scénario, soit **0,23 à 0,95 € la passe de 15**.
2. **Il n'est PAS branché sur la suite de livraison.** Un test qui dépense à chaque `git push`
   finirait coupé — et c'est le seul qui mesure vraiment Milo.

### 6.4 Il réutilise le laboratoire VC de l'app (R13)

Rien de neuf construit côté navigateur : `_vcApplyPersona` (remise à neutre de **tout** ce que lit
`buildCoachContext`, puis injection du persona) et `_vcAsk` (l'appel instrumenté) existaient déjà
pour les cartes VC-001/002/003. Le seul changement : les **ATTENDUS**, jusque-là cochés à la main
par un juge humain, deviennent du **code**.

⚠️ **Deux défauts du laboratoire trouvés en le branchant, et corrigés :** ① `_vcAsk` appelait
`buildCoachContext()` **sans le message** — ce qui envoie TOUT (c'est le contrat de la fonction pour
les appelants de diagnostic), donc **plus** que ce que reçoit un vrai utilisateur : *une évaluation
qui envoie plus que la réalité mesure une autre dilution que celle qu'on subit, donc un vert n'y
prouve rien* ; ② les personas annonçaient « Haiku (défaut) » alors que `worker.js` sert
**Sonnet à tout le monde** depuis le 10/08 — croire qu'on teste Haiku en testant Sonnet, c'est
**corriger le mauvais cerveau** (R9).

## 7. Le rapport

Par **tier** (déterministe = hard fails ; éval = notes moyennes + tendance vs run précédent) et par
**criticité** (critique/majeur/mineur), avec la **liste des `origin` qui régressent** (« le bug
ft-vNN est revenu »). Sortie **console + Markdown + JSON** (`tests/milo/report.json`).

## 8. Où ça vit (technique, sans build)

- `tests/milo/scenarios.js` — le corpus (données, format ci-dessus).
- `tests/milo/runner.js` — le runner **Tier 1** : lance un serveur local + Playwright, charge l'app,
  injecte l'état de chaque scénario, appelle `buildCoachContext()` / `_gardienSortie()`, exécute les
  assertions, sort le rapport. **Une commande** : `node tests/milo/runner.js`. **0 appel, 0 €.**
- `tests/milo/eval-scenarios.js` — le corpus **Tier 2** : 15 scénarios, chacun avec ses
  **vérificateurs en code**. Six viennent des bugs vécus en salle du 15 au 20/08 ; les neuf autres
  reprennent les règles de conversation/sécurité et les trois personas fondateurs.
- `tests/milo/eval.js` — le runner **Tier 2** : `node tests/milo/eval.js` (à blanc + devis),
  `--go` (réel), `--only EV-001,EV-006`, `--n 4`. Rapports : `eval-report.json` / `.md`.
- Vanilla JS, zéro dépendance de build. Ajouté à `.claspignore` (jamais poussé dans Apps Script).

## 9. Le pipeline bug → scénario (le réflexe)

À chaque vrai bug remonté (testeur / Michel) : ajouter **une entrée** dans `scenarios.js` avec son
`origin` (le `ft-vNN` du correctif), sa `criticality`, son `tier`, et les `checks` qui l'auraient
attrapé. Si c'est un bug **existentiel** → il rejoint le **noyau dur**. C'est ce réflexe qui rend le
framework vivant.

## 10. Statut

- ✅ Architecture gravée (ce document).
- ✅ Tranche 1 : le **noyau dur déterministe** (runner + scénarios seedés avec les bugs récents).
- ✅ Tranche 2 : le **Tier 2** (20/08/2026) — 15 scénarios, vérificateurs déterministes, pas de juge IA.
- ⏳ À venir : élargir les deux corpus au fil des bugs · rejouer le Tier 2 **avant/après** un
  changement de prompt (c'est là qu'il rend le plus : il dit si le changement a servi).
