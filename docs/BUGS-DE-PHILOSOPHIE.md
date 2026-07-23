# 🧭 Journal des bugs de philosophie

> **Ce document ne documente PAS des bugs de code.** (Ceux-là vont dans le journal des versions de
> `CLAUDE.md` et les galères techniques dans `docs/GALERES-ET-LECONS.md`.)
>
> Il documente les **moments où notre façon de concevoir Milo évolue** : les fois où Milo s'est
> comporté d'une manière qui **trahissait un principe**, alors même que son *raisonnement* était
> souvent correct. **Chaque bug de philosophie devient une nouvelle règle de conception.**
>
> Idée fondatrice (Michel, 23/07/2026) — dans le cadre de « Force Tracker devient un **système** » :
> *« Un bug n'est pas un échec, c'est une règle de conception qui manquait. »*

## La distinction fondatrice : raisonnement vs comportement

La plupart de nos vrais problèmes ne viennent **pas** du fait que l'IA « ne sait pas raisonner ».
Ils viennent de la **façon dont la réponse finale est formulée ou présentée** :
- une **hypothèse présentée comme un fait** ;
- une **mémoire créée à partir d'une déduction** (jamais confirmée) ;
- un **rythme de conversation inadapté** (interrogatoire, trop vite) ;
- une **sortie légère du rôle** de Milo ;
- l'**oubli d'une contrainte UX** (ex. les questions gratuites).

Le raisonnement était bon ; **c'est la SORTIE qui ne respectait pas la Constitution.** D'où l'idée
d'un futur **« Gardien de la Constitution »** (couche de conformité **avant l'affichage**, distincte
du Gardien de sécurité qui agit **à l'entrée**). Détail : `docs/MOTEUR-RAISONNEMENT-MILO.md`.

---

## Cas recensés

### PB-001 — Milo transforme une déduction en souvenir utilisateur *(2026-07-23, corrigé `ft-v589`)*
- **Symptôme** : sur « j'ai eu un accident de moto », Milo répond « je vois ça dans tes antécédents,
  c'était il y a quelques années d'après ce que je sais ». L'utilisateur n'a **jamais** dit « il y a
  quelques années » — Milo l'a **inventé**, puis l'avait **stocké en mémoire** et le citait comme un
  fait confié.
- **Principe trahi** : P3 (faits avant opinions), P18 (ne jamais faire semblant de savoir), P22 (ne
  présume/n'invente jamais).
- **Règle de conception qui en sort** : ⛔ n'ajouter **jamais** un détail non donné (date/gravité/
  cause), même à une info vraie ; ⛔ ne **jamais fabriquer de source** (« je vois dans tes
  antécédents ») pour une info fraîche ; le bloc mémoire = **exactement** ce que la personne a dit.
- **Idée plus profonde (GPT)** : chaque connaissance de Milo devrait porter son **origine**
  (✅ confirmé / 🟡 déduit / ⚪ inconnu) — *« Milo ne doit jamais oublier comment il sait ce qu'il
  sait »*. Notre modèle mémoire porte **déjà** `source`/`status`/dates → à exploiter (montrer
  l'origine à Milo + le faire citer : « je me souviens que TU m'as dit… »). *(À implémenter.)*

### PB-002 — La mémoire d'une blessure ne protège pas la personne *(2026-07-23, corrigé `ft-v588`)*
- **Symptôme** : Milo « retient l'accident nickel et après plus rien ». Une blessure confiée était
  stockée dans sa mémoire de conversation (il la SAIT en discutant) mais **le Gardien de sécurité ne
  lit que le Profil Santé** → aucune zone n'était protégée en séance.
- **Principe trahi** : P2 (sécurité), P13 (adapter, pas interdire) — rendus inopérants par un **trou
  d'architecture** (mémoire et sécurité déconnectées).
- **Règle** : une **conséquence** de blessure (la zone + la limitation), pas l'anecdote ; et un
  souvenir qui nomme une **zone du corps** atterrit **aussi** dans le Profil Santé → le Gardien la
  protège partout. *(La mémoire doit nourrir la sécurité, pas seulement la conversation.)*

### PB-003 — L'interrogatoire déguisé *(2026-07-23, corrigé `ft-v590`)*
- **Symptôme** : Milo enchaîne 5-6 questions de découverte avant de rien proposer ; ironie, lui
  donner des **réponses rapides** l'a rendu **plus** questionneur.
- **Principe trahi** : P19 (répondre d'abord, proposer ensuite), « moins mais mieux » (Présence).
- **Règle** : n'enchaîne **jamais** les questions — **apporte de la valeur d'abord** (1er programme
  avec hypothèses raisonnables), puis **1-2 questions max**. La personne repart avec de l'utile
  **même si elle ne répond à rien**.

### PB-004 — Un parcours qu'un freemium ne peut pas finir *(2026-07-23, corrigé `ft-v590`)*
- **Symptôme** : Milo mène un long questionnaire, finit par une **question écrite**, alors que
  l'utilisateur n'a peut-être **plus de questions gratuites** → il est **bloqué avant la récompense**,
  après avoir investi plusieurs minutes.
- **Principe trahi** : P21 (une donnée ne doit jamais coûter plus qu'elle n'apporte) + une **règle UX
  manquante**.
- **Règle UX qui en sort** : *« Le gratuit doit toujours donner une victoire, même partielle. »*
  Ne jamais faire franchir 95 % d'un parcours à quelqu'un qui sera bloqué avant le bénéfice.
  Répondre à une question **posée par Milo** ne coûte/ne bloque **jamais** un freemium.

---

## Comment utiliser ce journal
- À chaque **dérive de comportement** de Milo repérée (souvent via un « piège » d'un testeur ou de
  Michel) : ajouter une entrée **PB-NNN** (symptôme · principe trahi · **règle qui en sort** · version
  du correctif · éventuelle idée plus profonde).
- Une règle mûre et générale peut **monter** dans la Constitution (`CONSTITUTION-MILO.md`) — en
  respectant son critère d'entrée (principe fondamental, pas règle métier).
- Ce journal est l'un des documents les **plus précieux** du projet : il transforme chaque erreur en
  **capital de conception**.
