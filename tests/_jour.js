/* 📅 LE JOUR CALENDAIRE DES FIXTURES DE TEST — RECETTE-01 (28/09/2026)

   ⛔ LE DÉFAUT QU'IL FERME, MESURÉ : des fixtures écrivaient « aujourd'hui » avec
   `new Date().toISOString().slice(0,10)`, c'est-à-dire le jour de GREENWICH, pendant que les
   contextes de test tournent en `Europe/Paris`. Entre 00 h et 02 h à Paris (l'été ; 00 h-01 h
   l'hiver), la page dit « le 29 » et la fixture dit « le 28 » : faux rouges, sur du code sain.
   La suite `tests/dates` interdit ce motif depuis le 05/09 — mais elle ne scannait que 7
   fichiers, et les modules `tests/parcours/*.js` créés depuis lui échappaient.

   ⭐ DEUX FUSEAUX, DEUX FONCTIONS, parce que la page n'a pas toujours le même :
   · `jourParis(n)` — pour un contexte ouvert avec `timezoneId:'Europe/Paris'` (la règle des
     parcours) : le jour de Paris, quel que soit le fuseau du processus Node ;
   · `jourLocal(n)` — pour un contexte SANS `timezoneId` : le navigateur suit alors le fuseau
     du processus (variable `TZ`), et la fixture doit suivre le même.
   ⛔ Le décalage `n` est CALENDAIRE (Date.UTC(a, m, j + n)), jamais `n × 24 h` : une addition
   d'heures se trompe d'un jour à l'heure du changement d'heure.
   ⚠️ Côté PAGE (dans `page.evaluate`), on n'utilise pas ce fichier : on appelle le vrai
   `today()` de l'app, qui est la définition même du « jour » pour l'utilisateur.
   Témoins : `tests/dates/runner.js` (frontière du jour, été / hiver / fin de mois). */
const FUSEAU_TESTS = 'Europe/Paris';

function _decale(y, m, d, n) {
  return new Date(Date.UTC(y, m - 1, d + (n || 0))).toISOString().slice(0, 10);
}
function jourParis(n, maintenant) {
  const base = maintenant != null ? new Date(maintenant) : new Date();
  const [y, m, d] = base.toLocaleDateString('sv-SE', { timeZone: FUSEAU_TESTS }).split('-').map(Number);
  return _decale(y, m, d, n);
}
function jourLocal(n, maintenant) {
  const b = maintenant != null ? new Date(maintenant) : new Date();
  return _decale(b.getFullYear(), b.getMonth() + 1, b.getDate(), n);
}

/* 📅 LE MOIS PRÉCÉDENT, POUR `ft4_lms` — NUT/SÉANCE (07/11/2026, défauts préexistants PS-E29 / seance_ux / B-UXI-G2-G3-G5-G7 / B-FFD-⑧e).
   `ft4_lms` = « le dernier bilan du mois ANNONCÉ ». Au démarrage, `checkMonthlySummary` (app.js) annonce le bilan du mois ÉCOULÉ si ce n'est pas déjà fait et s'il a des séances :
   2,2 s après le chargement, la fenêtre `ov-month-summary` s'ouvre PAR-DESSUS l'écran (elle intercepte les clics : plantage de `seance_ux`, onglets du Coach, figurines) et un
   `persist()` écrit `ft4_sb_last` et appelle le réseau (B-UXI-G3). Une fixture qui écrit `ft4_lms: '2026-09'` EN DUR était juste jusqu'au 31/10 et fausse dès le 1ᵉʳ novembre :
   le « mois écoulé » de la page avait changé, pas le code. ⭐ La valeur à poser est TOUJOURS le mois précédent du JOUR DE PARIS (le fuseau des contextes de test).
   ⛔ `tests/dates/runner.js` refuse désormais tout `ft4_lms: 'AAAA-MM'` écrit en dur dans un module de test. */
function moisPrecedent(maintenant) {
  const base = maintenant != null ? new Date(maintenant) : new Date();
  const [y, m] = base.toLocaleDateString('sv-SE', { timeZone: FUSEAU_TESTS }).split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));          // m vaut 1…12 : le mois précédent est l'indice m − 2 (janvier → décembre de l'année d'avant)
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
}

module.exports = { jourParis, jourLocal, moisPrecedent, FUSEAU_TESTS };
