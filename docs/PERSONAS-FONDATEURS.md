# 👥 Les Personas Fondateurs de Force Tracker

> **À lire juste après la Vision.** Cette page relie chaque grande évolution technique
> à un **besoin humain concret**. Elle donne un **langage commun** entre la technique, les
> tests et les utilisateurs, et elle raconte **pourquoi** certaines briques existent.
>
> **Idée & conception : Michel.** Mise en forme : ChatGPT. Implémentation & architecture : Claude.
> *(Comme le reste du produit — l'étincelle vient de Michel ; les IA structurent et construisent.)*

---

## Le principe

Les personas ne sont plus de simples profils de test : ils sont devenus les **représentants
des grandes dimensions du projet**. Quand une nouvelle dimension apparaît, la question
devient : **« Quel persona fondateur l'incarne — et quelle partie de Force Tracker fait-il
progresser ? »**

⚠️ **Distinction importante (honnêteté) :**
- **Michel** n'est pas un persona de test — c'est le **fondateur/architecte**, l'origine de la
  vision. Il est placé à part, comme la **dimension Vision**.
- **Christophe, Tatiana, Emma** sont des **dimensions utilisateur**, chacune **incarnée par un
  vrai testeur** ET par un **persona VC** (fictif, dérivé du vrai testeur) qui sert à valider
  le comportement de Milo. *(Voir `RETOURS-TESTEURS.md` pour les vrais retours.)*

⛔ **CE QUE « FONDATEUR » NE VEUT PAS DIRE — ajouté le 21/08/2026, après l'avoir fait dire à ce
document deux corrections de suite.** « Fondateur » qualifie la **DIMENSION**, jamais la
personne. **Christophe, Tatiana et Emma sont des TESTEURS** — Michel : *« ils n'ont aucune
action directe sur l'application »*. Ils remontent des retours, **Michel décide**. Écrire
« Christophe, persona fondateur » — ce que j'ai fait dans le journal de ft-v936 — transforme
un nom de dimension en **titre**, et laisse croire à un rôle dans le projet qui n'existe pas.
⚠️ **Et le piège se double** : le persona VC porte le **prénom** du testeur mais son contenu
est **inventé** (le `resume` de VC-002 dit « a déjà un coach humain » — c'est un décor de test,
pas une information sur Christophe, qui est *« un sportif qui fait du body »*). **Les deux
erreurs se ressemblent** : un mot du vocabulaire interne relu comme un fait sur quelqu'un de
réel. ⭐ **La règle** : toute affirmation sur une personne réelle vient de `RETOURS-TESTEURS.md`
ou de Michel — jamais d'un nom de dimension, jamais d'un champ de persona.

---

## Les Personas Fondateurs

| Persona | Dimension | Contribution principale | Rattaché à |
|---|---|---|---|
| **Michel** 🧠 | **Vision & Architecture** | Fait émerger les idées, relie les modules, challenge les choix de conception. *(L'organisme, l'estomac, le corps de Force Tracker = ses idées.)* | Toute l'architecture · la Constitution · la Vision |
| **Christophe** 🏋️ | **Terrain & Métier** | Import de programmes, machines de salle, EXLIB, usage réel. | **VM** (Validation Métier) · l'ontologie du mouvement · VC-002 |
| **Tatiana** 🎯 | **Personnalisation** | Objectifs, contexte, **absence de présupposés** (« ne présume pas ce que je veux »). | **VC** (Validation Comportementale) · VC-001 |
| **Emma** 🌙 | **Physiologie & Ressenti** | Adaptation au **ressenti**, spécificités féminines (cycle), récupération, accompagnement. | **VC** · le ressenti prime sur les chiffres · VC-003 |

---

## 🎯 La dimension Tatiana, approfondie (22/07/2026)

La grande réflexion « philosophie de Milo » a confirmé que **Tatiana n'est pas un persona de test
parmi d'autres : elle porte la dimension la plus stratégique du produit.** Sa phrase fondatrice :

> **« À quoi sert une appli à une femme si c'est juste pour rentrer des données ? »**

Elle dit en une ligne **pourquoi Milo existe** : donner du **sens** aux données, pas les stocker.
Et elle porte la **mission** de Michel : que **chacun·e se sente compris·e** — en particulier les
**femmes**, car la plupart des outils « pour elles » sont pensés par des hommes qui **présument** à
leur place (et parce qu'une femme, une fois en confiance, est **fidèle**). C'est de cette dimension
que sont nés les **Principes 22 & 23** de la Constitution (respect de la liberté · ne pas confisquer
le récit · l'humilité · le réconfort jamais une stratégie) et le retour terrain fondateur du
**Principe 17** (« le mental, c'est le seul problème »). Sa dimension = **personnalisation + zéro
présupposé + le sens avant la donnée**.

## Pourquoi c'est plus fort qu'une liste de testeurs

- **Ça relie chaque évolution technique à un besoin humain** : VM existe *à cause de*
  Christophe ; le « ne présume pas » de Milo existe *à cause de* Tatiana ; l'adaptation au
  cycle existe *à cause d'*Emma.
- **Ça raconte l'histoire du projet** et **explique pourquoi les briques existent** — pas des
  fonctionnalités isolées, mais des réponses à des personnes.
- **Ça donne un langage commun** entre la technique, les tests et les utilisateurs.

## La règle pour la suite

> **Quand on crée un nouveau persona (débutant, blessé, senior…), on se demande d'abord :
> « quelle nouvelle DIMENSION de Force Tracker va-t-il nous aider à faire progresser ? »**

Un persona fondateur n'est ajouté que s'il ouvre une **dimension** qui n'est pas déjà couverte.

---

## Liens

- 🌟 La Vision — `docs/VISION-FORCE-TRACKER.md`
- 🧪 Le Laboratoire (familles VT / VC / VM) — journal `CLAUDE.md` + `DOSSIER-ATHLETE-SUIVI.md`
- 🧬 Les vrais retours des testeurs — `RETOURS-TESTEURS.md`
- 🫀 Le corps de Force Tracker (architecture-organisme) — cadre conçu par Michel
