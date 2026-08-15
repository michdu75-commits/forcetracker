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



## PB-007 — MILO DIAGNOSTIQUE L'APPLICATION QU'IL NE VOIT PAS (13/08/2026, corrigé `ft-v846`)

**Ce qui s'est passé.** Michel dit à Milo que le débrief d'après séance n'apparaît pas. Milo répond :

> *« Ah c'est un bug d'affichage de l'app alors, pas un problème de contenu ! Je te refais le bloc
> proprement »* — puis il produit **une séance à faire**, pas un compte-rendu.

**Le raisonnement n'est pas absurde ; c'est la SORTIE qui trahit.** Milo n'a accès ni à l'écran, ni au
code, ni au réseau de l'app. Il ne peut donc pas savoir si quelque chose s'affiche ou non. Il a pris
une remarque et l'a transformée en **constat technique**, énoncé sans la moindre réserve.

**Ce que ça a coûté, et c'est mesurable.** Cette phrase a servi de diagnostic à Michel, qui me l'a
transmise comme telle. **J'ai cherché pendant une heure un bug d'affichage qui n'existait pas** —
jusqu'à rejouer une vraie fin de séance et constater que le mécanisme fonctionnait parfaitement. Le
vrai défaut était ailleurs (l'échec de l'appel était silencieux, `ft-v845`).
*Une hypothèse de Milo présentée comme un fait a envoyé deux personnes sur une fausse piste.*

**Pourquoi c'est plus grave que les cas précédents.** PB-001 à PB-006 portaient sur ce que Milo dit
**de la personne**. Ici il parle **du produit** — un domaine où il n'a strictement aucune donnée, et
où son assurance est prise pour de l'expertise. La Constitution dit déjà « les faits avant les
opinions » ; il manquait de dire que **l'app elle-même est un domaine sur lequel il ne sait rien**.

**Le deuxième défaut, dans la même réponse.** On lui demande un **débrief** (ce qui a été FAIT) et il
rend un **plan** (ce qu'il y a À FAIRE). C'est la confusion **planifié / réalisé** de
`docs/MODELE-METIER.md`. La cause est structurelle et pas morale : le prompt consacrait une quinzaine
de lignes très précises à *comment produire une séance*, et **rien** à ce que « débriefer » veut dire
quand c'est la personne qui le demande (les seules consignes de débrief vivaient dans le message
automatique de l'app). Sur une demande ambiguë, le seul format bien décrit gagne. **R8 : ce n'est pas
qu'il est mal instruit, c'est que le cas n'était pas couvert.**

**Les deux règles qui en découlent** (dans le prompt, compressées pour ne pas gonfler le bloc commun) :
- *Ne diagnostique jamais l'app* — dire qu'on n'a pas accès à l'écran, demander ce qui est affiché,
  proposer de le signaler. Jamais « c'est un bug de… ».
- *Débriefer ≠ proposer* — un débrief regarde en arrière, avec les charges réalisées ; il ne finit
  jamais par une séance entière.

⚠️ **Le signal à repérer** : Milo qui affirme quelque chose sur **le logiciel** (affichage,
enregistrement, mise à jour, réseau). Il n'a aucun moyen de le savoir — c'est toujours une invention,
même quand elle tombe juste.


### PB-007 bis — MILO INVENTE LE FONCTIONNEMENT DE L'APP, PAS SEULEMENT SES PANNES *(2026-08-14, corrigé `ft-v854`)*

**La règle du 13/08 était trop étroite.** Elle interdisait de *diagnostiquer* l'app — « c'est un bug
d'affichage », « ça n'a pas été enregistré ». Le lendemain, Milo a fait autre chose :

> *« Les 249 kcal affichés dans l'app, c'est le calcul basé sur le volume soulevé (tonnes × distance
> estimée). C'est une estimation mécanique pure. »*

**C'est faux.** `calcSessionCalories` fait `MET × poids de corps × durée` — le volume soulevé n'entre
**jamais** dans le calcul des calories. Vérifié dans le code avant d'affirmer quoi que ce soit.

**Pourquoi c'est PIRE que le premier cas.** Une panne inventée finit par se contredire : on cherche,
on ne trouve rien, on s'en rend compte (ça a coûté une heure le 13/08). Un **mécanisme** inventé, lui,
ne se contredit jamais : il sonne technique, il est cohérent, et **personne ne peut le vérifier** — ni
l'utilisateur, qui ne lit pas le code, ni Milo, qui ne le voit pas non plus.
⚠️ Et ici l'invention **contredisait un diagnostic établi sur 19 séances** : si Michel avait cru que
l'app calcule « par le volume », toute l'enquête sur la durée de repos aurait paru fausse.

**Ce qui change dans la règle** : elle ne porte plus sur les pannes mais sur le **fonctionnement
interne** — écran, code, calculs. Milo peut **commenter** un chiffre qu'on lui donne (c'est son
métier) ; il ne peut jamais **expliquer d'où il sort**.

⚠️ **Le signal à repérer** : une phrase de Milo qui commence par « c'est calculé sur… », « ça vient
de… », « l'app utilise… ». Il n'a aucun moyen de le savoir.

**⭐ Et la deuxième réponse, elle, était bonne** — après que Michel a précisé sa question, Milo a
correctement identifié la montre comme la plus fiable et donné 400-550 kcal, très proche des 430-465
calculés. *Le problème n'est pas ce qu'il raisonne, c'est ce qu'il comble quand une information
manque.*

---

## PB-008 — Reprocher à la personne un choix que l'APP a fait à sa place (15/08/2026)

**Le cas.** Débrief de fin de séance, développé incliné : *« la montée en charge a démarré à 36 kg
(60 % de la charge) au lieu de ~28 kg (50 %), et le palier à 56×5 reps était déjà une série de
travail déguisée »*. Michel : *« j'ai pas trop compris à un moment donné, je sais pas ce qu'il a
branlé »*.

**Ce que ce n'est pas.** Ce n'est **pas** une dérive du modèle. La phrase est produite mot pour mot
par `_verdictMontee` (coach.js) et injectée dans le contexte ; Milo l'a recopiée. *Chercher la faute
chez le modèle aurait été un 8ᵉ durcissement de prompt pour un problème de donnée* (R7).

**Ce que c'est.** Cet exercice portait la note « ⚡ Montée en charge ajoutée par l'app ». L'app a
écrit la montée, puis l'a jugée, puis l'a reprochée — sans jamais savoir qu'elle en était l'auteur.

**La règle qui manquait.** *Avant de reprocher quoi que ce soit, l'app doit savoir QUI a décidé.*
Une donnée produite par l'app n'est pas un choix de la personne, et ne peut pas lui être opposée.
Corollaire pratique : toute donnée que l'app **fabrique** doit porter sa marque d'origine
(ici `_montee`), sinon elle devient indiscernable d'une décision humaine dès l'écran suivant.

**Le coût, et pourquoi il n'est pas symétrique** (R29) : un conseil manqué coûte un conseil ; un
reproche injuste coûte la **confiance dans l'outil** — et se paie en doute sur une bonne séance.
