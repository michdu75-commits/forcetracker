/* ═══════════════════════════════════════════════════════════════════════════════════════
   LE PROPRIÉTAIRE UNIQUE DE « OÙ EST PLAYWRIGHT ? » (20/09/2026)
   ═══════════════════════════════════════════════════════════════════════════════════════
   ⛔⛔ POURQUOI CE FICHIER EXISTE — un échec MESURÉ, pas une bonne pratique.

   Michel a lancé le workflow « Banc d'essai de Milo » : il a échoué en **34 secondes**,
   sur `Cannot find module '/opt/node22/lib/node_modules/playwright/index.js'`.

   La chaîne exacte, vérifiée dans le dépôt :
     ① le dépôt n'a **NI `package.json` NI `node_modules`** → Playwright est une
        DÉPENDANCE INVISIBLE : rien, dans le dépôt, ne dit qu'elle est nécessaire ;
     ② `require('playwright')` échoue donc **même dans le conteneur de développement**
        (mesuré : `MODULE_NOT_FOUND`) — c'est toujours le repli absolu qui sert ;
     ③ sur un runner GitHub, `npx playwright install` télécharge les NAVIGATEURS mais
        n'installe pas le PAQUET dans le dépôt → les deux branches échouent.

   ⭐⭐ ET LE PIRE N'EST PAS LA PANNE, C'EST LE MESSAGE. L'ancien code s'écrivait :

        try   { chromium = require('playwright').chromium; }
        catch { chromium = require('/opt/node22/.../playwright/index.js').chromium; }

   Le `catch` **écrase l'erreur réelle** (« Cannot find module 'playwright' ») par celle du
   repli. 👉 *Le message d'erreur accusait un chemin de conteneur alors que la vraie cause
   était une dépendance non déclarée.* Un repli qui avale le diagnostic fait chercher au
   mauvais endroit — ici, il aurait fait « réparer » un chemin qui n'a jamais été le sujet.

   ⚖️ CE QU'ON GARDE, ET POURQUOI CE N'EST PAS UN CHEMIN ABSOLU DE PLUS. La résolution
   NORMALE passe en premier : c'est elle qui sert en CI et partout où `npm install` a été
   fait. Le chemin du conteneur reste en **dernier recours**, parce que le conteneur de
   développement n'a pas de `node_modules` et que **33 fichiers** du dépôt en dépendent
   encore. ⛔ Il n'est plus une branche muette : il est NOMMÉ, et son échec est expliqué.

   ⛔ CE FICHIER NE FAIT QUE RÉSOUDRE. Il ne lance rien, ne configure rien, ne choisit
   aucun navigateur : ces décisions restent chez l'appelant.
   ═══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

/* Le dernier recours, et lui seul. Déclaré ici pour qu'il n'y ait qu'UN endroit au monde
   où cette adresse soit écrite (R2) — les 32 autres fichiers qui la recopient encore sont
   une dette connue, pas un modèle à suivre. */
const REPLI_CONTENEUR = '/opt/node22/lib/node_modules/playwright';

function chargerPlaywright() {
  const essais = [];

  // ① LA VOIE NORMALE — celle qui doit servir en CI et sur n'importe quel poste.
  try {
    return { pw: require('playwright'), voie: 'node_modules', chemin: require.resolve('playwright') };
  } catch (e) {
    essais.push("require('playwright') → " + (e && e.code === 'MODULE_NOT_FOUND'
      ? 'MODULE_NOT_FOUND (le paquet n\'est pas installé : `npm install`)'
      : String(e && e.message || e)));
  }

  // ② LE DERNIER RECOURS — le conteneur de développement, qui n'a pas de node_modules.
  try {
    return { pw: require(REPLI_CONTENEUR), voie: 'conteneur', chemin: REPLI_CONTENEUR };
  } catch (e) {
    essais.push(REPLI_CONTENEUR + ' → ' + (e && e.code === 'MODULE_NOT_FOUND'
      ? "absent (normal hors du conteneur de développement)"
      : String(e && e.message || e)));
  }

  /* ⛔ ON DIT LES DEUX ÉCHECS. C'est tout l'objet de ce fichier : l'ancien code n'en
     montrait qu'un, et c'était le mauvais. */
  const err = new Error(
    'Playwright est introuvable. Les deux voies ont été essayées :\n'
    + essais.map(x => '  · ' + x).join('\n')
    + "\n👉 En intégration continue : `npm install` puis `npx playwright install chromium`."
    + "\n👉 Playwright est déclaré dans `package.json` — s'il manque, c'est l'installation"
    + "\n   qui n'a pas eu lieu, pas le chemin qui est faux.");
  err.code = 'FT_PLAYWRIGHT_INTROUVABLE';
  throw err;
}

module.exports = { chargerPlaywright, REPLI_CONTENEUR };
