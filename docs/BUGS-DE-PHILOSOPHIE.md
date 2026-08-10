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

### PB-005 — Une permission trop large déborde sur un domaine sensible *(2026-07-25, corrigé `ft-v605`)*
- **Symptôme** : photo d'une boîte d'**Imodium** (anti-diarrhée) envoyée à Milo → il répond
  « assure-toi de bien manger **même avec le gastro qui traîne** ». Le mot « gastro » n'est **écrit
  nulle part** (ni sur la boîte, ni dans le profil) : Milo a **inventé une maladie / une cause**.
- **Ce qui est troublant** (et instructif) : sur la **prod**, la photo d'un **complément** donnait une
  analyse **parfaite** (il lit l'étiquette + croise les vrais faits du profil, zéro invention). Le
  dérapage n'arrivait **que sur le clone** — qui porte la règle « propose vite, **fais des hypothèses
  par défaut** » (pensée pour l'entraînement). Milo a **généralisé** cette permission de « supposer »
  à la **santé**.
- **Le raisonnement était bon, la sortie non** : ce n'est PAS une règle « n'invente pas » manquante
  (elle existe, elle tient en prod). C'est une **permission mal bornée** qui a gagné le conflit.
  Même famille que PB-002 et que le bug de sécurité `ft-v603` : **une règle « agir vite » qui déborde
  par-dessus une règle de fiabilité / de sécurité**.
- **Règle de conception qui en sort** : *« Une permission n'est jamais globale : elle doit dire QUOI
  on a le droit de supposer ET dans quel DOMAINE. »* On **hiérarchise les permissions** comme les
  interdictions (Constitution v2.4). Frontière photo produit : décrire + usage général + lien profil
  connu ; **jamais** déduire le pourquoi ni inventer une maladie. Pour un **médicament**, on constate,
  on ne spécule pas (terrain du médecin).

---

### PB-006 — Milo INVENTE un prénom quand on ne lui en donne pas *(2026-07-28, corrigé `ft-v652`)*
- **Symptôme** : Milo appelle l'utilisateur **« Sam »**. Repris (« on tu m'appelles sam lol »), il
  répond : *« pardon mec, je sais pas d'où j'ai sorti ça 😂 — je n'ai pas ton prénom en fait »*.
- **Ce qui est remarquable** : il **sait** qu'il ne l'a pas, et il en a inventé un quand même.
- **La cause n'est PAS dans son comportement** : son prompt lui demandait explicitement de commencer
  par *« Salut [son prénom] »*, mais le prénom **ne lui était jamais transmis**. On lui a demandé de
  remplir un trou sans lui donner de quoi le remplir — il l'a comblé.
- **Principe trahi** : P4 (ne jamais présenter une invention comme un fait) — mais par **construction**,
  pas par dérive. Et **R8** : *un prompt ne compense jamais une donnée absente.*
- **Règle qui en sort** : *quand une consigne du prompt s'appuie sur une donnée, vérifier que la donnée
  est réellement transmise — et prévoir explicitement le cas où elle manque.* Un modèle à qui l'on
  demande d'employer une information qu'il n'a pas ne dit pas « je ne l'ai pas » : il **remplit**.
  Le correctif ne se limite donc pas à transmettre le prénom : quand il est inconnu, Milo est
  maintenant **explicitement prévenu de ne pas faire de formule à vide**.

## Comment utiliser ce journal
- À chaque **dérive de comportement** de Milo repérée (souvent via un « piège » d'un testeur ou de
  Michel) : ajouter une entrée **PB-NNN** (symptôme · principe trahi · **règle qui en sort** · version
  du correctif · éventuelle idée plus profonde).
- Une règle mûre et générale peut **monter** dans la Constitution (`CONSTITUTION-MILO.md`) — en
  respectant son critère d'entrée (principe fondamental, pas règle métier).
- Ce journal est l'un des documents les **plus précieux** du projet : il transforme chaque erreur en
  **capital de conception**.

---

## PB-005 — ACQUIESCER SANS CORRIGER (10/08/2026)

**Le cas.** Milo propose une montée en charge dangereuse (« 70×5 puis 130×3 » pour un squat à
130 kg). Michel signale le trou. Milo répond :

> *« Haha t'as raison, j'ai zappé l'échauffement progressif ! Le programme prévoit déjà ça :
> 70×5 (É) → 130×3. Je le relance avec la montée en charge correcte ? »*

**Il reconnaît l'erreur et repropose exactement la même chose**, en la qualifiant de « correcte ».
Il n'a corrigé qu'au 2ᵉ rappel, quand Michel a explicité le problème (« 60 kg d'un coup »).

**Pourquoi c'est un bug de PHILOSOPHIE et pas un bug de code.** Le raisonnement de Milo était
bon (il *avait* compris qu'il manquait quelque chose) ; c'est la **SORTIE** qui trahit. Il a
produit un accord social — « t'as raison » — sans qu'aucun comportement ne change. *Acquiescer
sans corriger est pire que contredire : ça a l'air réglé, donc la personne baisse la garde.*
Sur un sujet de blessure, c'est exactement le pire endroit.

**La cause profonde, et elle est structurelle.** Milo n'avait **pas de meilleure règle à
appliquer** : la consigne disait « 1-2 séries légères de montée en charge », il l'avait suivie.
Il était d'accord avec la critique sans disposer de quoi faire autrement — alors il a réémis la
même chose. **Un modèle privé de la règle produit un accord poli à la place d'une correction.**

**Ce qu'on en tire.**
- Quand Milo dit « t'as raison » et reproduit la même sortie, **ne pas durcir le prompt** :
  chercher **la règle qui manque** (R7 — structurel avant prompt ; R8 — un prompt ne compense
  jamais une donnée absente).
- Si le calcul est **déterministe**, il ne doit pas dépendre du modèle du tout : il descend dans
  le CODE (ft-v822, comme `_dateAnnoncee`).
- ⚠️ **Le signal à repérer** : un accord + une sortie inchangée. C'est plus discret qu'un refus,
  et plus dangereux.

