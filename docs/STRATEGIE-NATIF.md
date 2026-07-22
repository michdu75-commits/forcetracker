# 📱 Stratégie « passage en natif » — les principes durables

> Cadre à respecter le jour où Force Tracker évoluera vers une version **native ou hybride**.
> Né du cadrage « passage en natif » (22/07/2026) — croisement **Gemini + Mistral + Claude +
> synthèse de Michel**, même méthode que pour l'IMC / la nutrition.
> ⚠️ **Ce document ne contient volontairement AUCUNE estimation de coût ni de délai** (ça périme
> vite ; décision Michel). Il ne garde que les **principes durables**.

---

## 🧭 Le principe directeur (Michel)

> **« Le natif ne doit apporter que ce que le web ne peut pas offrir. »**

**Question de contrôle, pour chaque future fonctionnalité :**
> *« La PWA permet-elle déjà une expérience utilisateur satisfaisante ? »*
> - **Oui** → on reste en PWA.
> - **Non** → on développe **uniquement la brique native nécessaire**.

Le pendant, côté plateforme, de notre ligne de toujours : **simplicité, évolutivité, zéro
sur-ingénierie.**

---

## Le chemin retenu : emballer, ne pas réécrire

- **Coque native de type Capacitor** autour de l'app web existante → on **garde tout le code**
  (les fichiers JS, Milo, EXLIB, le modèle métier, le local-first, les données). Le natif est une
  **coque + des prises**, pas une nouvelle app.
- **Écartés** (convergence des 3 IA) : réécriture **React Native / Flutter** (coût énorme, on perdrait
  l'agilité **et** l'archi en adaptateurs) · **Tauri mobile** (iOS immature, risqué pour un non-dev) ·
  **Cordova** (moins maintenu). Sur **Android**, une **TWA** peut suffire.

---

## L'approche PROGRESSIVE des plugins (décision Michel + Claude)

On **prépare l'architecture à accueillir** les plugins natifs (Santé, Bluetooth, push…) — mais on
**n'ajoute chaque plugin que lorsqu'un besoin utilisateur RÉEL le justifie**, jamais « au cas où ».

- ✅ Moins de maintenance, moins de risques de compatibilité, moins de complexité.
- ✅ **Évite un rejet de review** : Apple demande une justification claire pour chaque permission
  (Santé, Bluetooth) → un plugin qui demande un accès **sans l'utiliser** peut faire **rejeter**.
- ✅ Ajouter un plugin plus tard = une **review de mise à jour normale**, pas une catastrophe.
- ⚠️ On écarte donc le conseil « inclure TOUS les plugins dès la V1 » (Mistral) : contraire à notre
  ligne anti-sur-ingénierie.

---

## Priorité des drivers (convergence des 3 IA — rapport valeur / effort)

1. **Objets connectés** (Apple Health / Health Connect / balances Bluetooth / montres) — la **plus
   forte valeur** vs une PWA (impossible sur iOS), automatise poids/sommeil/FC/activité.
2. **Notifications push** fiables — pour le coaching proactif de Milo.
3. **Présence App Store / Play Store** — crédibilité et découverte.
4. **Monétisation in-app** — **ROI le plus bas** (déjà possible hors app), à traiter en dernier.

---

## Monétisation — la posture (sans chiffres)

- **Au lancement natif : garder le mécanisme premium ACTUEL** — déverrouillage **côté serveur**
  (email whitelisté / code d'accès), **rien vendu dans l'app** → **zéro chose à rejeter**, on esquive
  la commission de store d'entrée de jeu.
- Ensuite, un **bouton neutre « Gérer mon abonnement » vers le web** (exception « service
  multiplateforme » tolérée par Apple ; conforme DMA en UE) — **sans afficher de prix ni inciter**
  dans l'app.
- ⚠️ **Ne PAS faire d'achat in-app natif si le premium est 100 % utilisable en PWA** (risque de rejet
  Apple pour « contournement »). L'IAP natif ne se justifie que pour une **valeur exclusivement
  native** (ex. synchro Apple Health).
- **On tranche le vrai modèle de paiement plus tard** — ça ne bloque jamais la sortie native.

---

## Opérationnel pour un fondateur non-développeur (l'approche, pas les chiffres)

- **Automatiser** les builds et signatures via **CI/CD cloud** (ex. GitHub Actions + un runner Mac
  cloud pour iOS) → éviter de gérer Xcode à la main.
- **Déléguer la configuration initiale** de la coque native et la **première soumission** aux stores
  à un prestataire/expert ; garder la main sur le **code web**.
- Prévoir une **beta fermée** (TestFlight / Play Console) avant chaque soumission ; bien rédiger la
  **fiche de store** (mots-clés fitness/workout/health) pour justifier les accès natifs.

---

## Ce qui NE change pas

Le coach IA (Milo), EXLIB, le **modèle métier**, le **local-first**, les données des utilisateurs —
**tout reste**. Le stockage local fonctionne à l'identique dans une coque native (IndexedDB / SQLite).

---

## Liens avec les principes existants

- **`MODELE-METIER.md` Principe n°2** — *le modèle de données est indépendant de son mode
  d'acquisition* → le modèle est **déjà prêt** pour des sources natives ; une nouvelle source = un
  **adaptateur**, jamais une refonte.
- **Local-first** (règles d'or) — renforcé par le natif, jamais menacé.
- **Anti-sur-ingénierie** — le principe directeur ci-dessus en est l'application plateforme.

---

## Sources croisées
- **Gemini** : Capacitor OK · piège paiement Apple (interdit de rediriger vers un paiement externe
  sans précaution) · CI/CD cloud + déléguer · piège « tout réécrire en RN/Flutter ».
- **Mistral** : plugins Capacitor précis · contournement 30 % (bouton neutre / service multiplateforme)
  · hot-update assets statiques · piège « wrapper et voir après » (nuancé par Michel/Claude).
- **Claude** (archi) : les 2 pièges sont complémentaires (garder le web + ajouter les plugins au bon
  moment) · lancer avec le premium serveur (esquive la taxe) · ne pas embarquer de plugin inutilisé.
- **Michel** (synthèse) : **le principe directeur** « le natif n'apporte que ce que le web ne peut pas »
  · l'**approche progressive** des plugins · **pas de coûts/délais** dans un doc d'architecture.
