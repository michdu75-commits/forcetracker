/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   SEC-04 — UN MODULE QUI PLANTE DEVIENT UN KO IDENTIFIÉ, ET LA PASSE N'EST JAMAIS DÉCLARÉE RÉUSSIE
   (D-031-SÉCURITÉ-01 — décision de Michel du 19/10/2026 : « OUI »)
   ═══════════════════════════════════════════════════════════════════════════════════════════════
   ⛔⛔ POURQUOI — mesuré, pas supposé : avant, une exception dans `await require('./x.js').ecran(…)` arrêtait TOUTE la
   passe (code 2, aucune ligne de total) ; les modules suivants ne tournaient pas et rien ne disait lesquels manquaient
   (OPTI-TEST-02 : auth_new_device et auth_signup_strict plantent sous un défaut injecté).

   ⭐ CE QU'IL FAIT — pour chaque module que la passe charge par `require('./x.js')` :
     · toute fonction exportée est appelée à travers une ENVELOPPE : une exception synchrone, ou une promesse rejetée,
       devient le témoin rouge « ⛔ MODULE ./x.js · f a PLANTÉ après N témoin(s) », compté KO ; la passe continue ;
     · un module qui ne se CHARGE pas devient le témoin rouge « ⛔ MODULE ./x.js n'a pas pu être CHARGÉ » ; ses appels
       ne sont pas joués, et la liste de fin les NOMME ;
     · une promesse rejetée que personne n'attend devient « ⛔ PROMESSE REJETÉE SANS ÊTRE ATTENDUE (fichier:ligne) », KO ;
     · une sortie AVANT la ligne de total (`process.exit(0)` d'un module, boucle d'événements vide) rend un code NON NUL.
   ⛔ LA PASSE NE PEUT PAS ÊTRE DÉCLARÉE RÉUSSIE APRÈS UN PLANTAGE : le KO compte (total rouge, code 1), et
   `tools/passe_valide.sh` refuse (condition ② et rouges réels). Un plantage du CORPS de la passe ou une promesse
   rejetée hors module restent une passe INVALIDE (aucun total, code ≠ 0) — inchangé, et c'est plus strict.

   ⚖️ CE QU'IL NE CHANGE PAS : le module lui-même n'est jamais modifié — la passe reçoit une VUE (Proxy) de ses exports,
   les autres modules qui le chargent voient l'original (une exception attendue par un autre module reste la sienne).
   Les valeurs exportées (tables, constantes, objets d'outils) passent telles quelles.
   Contrôle négatif : python3 tools/mut_plantages.py
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const Module = require('module');

function installer(fichierPasse, t, compte) {
  const plantes = [], vues = new WeakMap(), morts = new Map();
  let totalEcrit = false;
  const estClasse = (f) => /^class[\s{]/.test(Function.prototype.toString.call(f));
  const resume = (e) => String((e && e.stack) || e).split('\n').slice(0, 2).join(' | ').slice(0, 240);
  const echec = (id, k, k0, e) => {
    plantes.push(id + ' · ' + k);
    t('⛔ MODULE ' + id + ' · ' + k + ' a PLANTÉ après ' + (compte() - k0) + ' témoin(s) — la suite de ce module n\'a PAS été jouée', false, resume(e));
  };
  // l'enveloppe : synchrone ou asynchrone, une exception devient un KO nommé ; la valeur rendue passe telle quelle
  const envelopper = (id, k, f, cible) => function (...a) {
    const k0 = compte(); let r;
    try { r = f.apply(cible, a); } catch (e) { echec(id, k, k0, e); return undefined; }
    return (r && typeof r.then === 'function') ? Promise.resolve(r).then((v) => v, (e) => { echec(id, k, k0, e); return undefined; }) : r;
  };
  const vue = (id, ex) => {
    if (!ex || (typeof ex !== 'object' && typeof ex !== 'function')) return ex;
    if (vues.has(ex)) return vues.get(ex);
    const cache = new Map();
    const v = new Proxy(ex, {
      get(o, k, r) {
        const x = Reflect.get(o, k, r);
        if (typeof k !== 'string' || typeof x !== 'function' || estClasse(x)) return x;
        if (!cache.has(k)) cache.set(k, envelopper(id, k, x, o));
        return cache.get(k);
      },
      apply(o, soi, a) { return envelopper(id, '(module)', o, soi)(...a); },      // module.exports = function (…)
    });
    vues.set(ex, v); return v;
  };
  const mort = (id) => new Proxy(function () {}, {      // un module non chargé : chaque appel est NOMMÉ, jamais joué
    get(o, k) { if (typeof k !== 'string' || k === 'then') return undefined; return () => { plantes.push(id + ' · ' + k + ' (non joué)'); return undefined; }; },
    apply() { plantes.push(id + ' (non joué)'); return undefined; },
  });
  const req0 = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (this.filename !== fichierPasse || !/^\.\/[\w.-]+\.js$/.test(String(id))) return req0.apply(this, arguments);
    if (morts.has(id)) return morts.get(id);
    let ex;
    try { ex = req0.apply(this, arguments); }
    catch (e) {
      plantes.push(id + ' (chargement)');
      t('⛔ MODULE ' + id + ' n\'a pas pu être CHARGÉ — aucun de ses témoins n\'a été joué', false, resume(e));
      morts.set(id, mort(id)); return morts.get(id);
    }
    return vue(id, ex);
  };
  // une promesse rejetée que PERSONNE n'attend (un module l'a laissée filer) : un KO nommé par son origine, et la passe
  // continue — sans ce gestionnaire, Node coupe tout (code 1, aucun total). Une EXCEPTION non rattrapée, elle, reste un arrêt
  // (passe invalide) : reprendre après elle n'est pas sûr (documentation de Node).
  process.on('unhandledRejection', (e) => {
    const ou = (String((e && e.stack) || '').match(/tests[\\/]parcours[\\/][\w.-]+\.js:\d+/) || ['origine inconnue'])[0];
    plantes.push('promesse rejetée (' + ou + ')');
    t('⛔ PROMESSE REJETÉE SANS ÊTRE ATTENDUE (' + ou + ') — un module a laissé filer une erreur', false, resume(e));
  });
  // la ligne de total est la seule fin normale : on la reconnaît à l'écriture, sans toucher à la fin de la passe
  const log0 = console.log;
  console.log = function (...a) { if (typeof a[0] === 'string' && a[0].includes('TOTAL CROISÉ')) totalEcrit = true; return log0.apply(this, a); };
  process.on('exit', (c) => {
    if (plantes.length) log0('⛔ ' + plantes.length + ' MODULE(S) PLANTÉ(S) OU NON JOUÉ(S) : ' + plantes.join(' · '));
    if (!totalEcrit) { log0('⛔ PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL — elle ne peut pas être déclarée réussie (code ' + (c || 3) + ').'); if (!c) process.exitCode = 3; }
  });
  return { plantes: () => plantes.slice(), totalEcrit: () => totalEcrit };
}

module.exports = { installer };
