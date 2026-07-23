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
| Coût | **0**, instantané | 1 appel LLM/scénario (× le juge = 2) |
| Fiabilité | **Reproductible à 100 %** | Non-déterministe (l'output varie) |
| Quand | **À chaque commit** | Rarement (avant release), petit set curé, **tendances** |

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
- `checks` = les assertions déterministes (Tier 1). Les notes de qualité (Tier 2) viendront dans
  un bloc `eval` séparé quand on construira ce tier.

## 5. Les familles (l'axe `category`)

`memoire` · `coherence` · `personnalisation` · `conversation` · `nutrition` · `analyse-photo` ·
`programmes` · `securite` · `cas-extremes`. (Le corpus grandit librement ; seul le noyau dur reste petit.)

## 6. Le juge IA (Tier 2) — 3 garde-fous (quand on le construira)

1. **La sécurité ne dépend JAMAIS du juge** → Gardien déterministe (règles dures). Le juge est secondaire.
2. **Qui juge le juge ?** → calibration humaine régulière + **modèle épinglé** (sinon ses notes dérivent).
3. **Tendances, pas verdicts couperets** → les notes (mémoire/cohérence/perso/pertinence/sécurité/
   naturel/raisonnement) sont suivies dans le temps ; un raté isolé = bruit, une baisse répétée = régression.

## 7. Le rapport

Par **tier** (déterministe = hard fails ; éval = notes moyennes + tendance vs run précédent) et par
**criticité** (critique/majeur/mineur), avec la **liste des `origin` qui régressent** (« le bug
ft-vNN est revenu »). Sortie **console + Markdown + JSON** (`tests/milo/report.json`).

## 8. Où ça vit (technique, sans build)

- `tests/milo/scenarios.js` — le corpus (données, format ci-dessus).
- `tests/milo/runner.js` — le runner **Tier 1** : lance un serveur local + Playwright, charge l'app,
  injecte l'état de chaque scénario, appelle `buildCoachContext()` / `_gardienSortie()`, exécute les
  assertions, sort le rapport. **Une commande** : `node tests/milo/runner.js`.
- Vanilla JS, zéro dépendance de build. Ajouté à `.claspignore` (jamais poussé dans Apps Script).

## 9. Le pipeline bug → scénario (le réflexe)

À chaque vrai bug remonté (testeur / Michel) : ajouter **une entrée** dans `scenarios.js` avec son
`origin` (le `ft-vNN` du correctif), sa `criticality`, son `tier`, et les `checks` qui l'auraient
attrapé. Si c'est un bug **existentiel** → il rejoint le **noyau dur**. C'est ce réflexe qui rend le
framework vivant.

## 10. Statut

- ✅ Architecture gravée (ce document).
- ✅ Tranche 1 : le **noyau dur déterministe** (runner + scénarios seedés avec les bugs récents).
- ⏳ À venir : élargir le corpus (au fil des bugs) · le **Tier 2** (éval LLM, minimal, plus tard).
