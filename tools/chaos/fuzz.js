/* ════════════════════════════════════════════════════════════════════════════════════════
   FUZZ DETERMINISTE — des sequences d'operations, une graine fixe, des invariants verifies
   a CHAQUE etape.

   ⛔ AUCUN ALEA NON REPRODUCTIBLE : le generateur est un `mulberry32` a graine explicite.
   Une sequence qui casse un invariant est rendue AVEC sa graine et son rang, donc rejouable
   a l'identique. *Un fuzz qu'on ne peut pas rejouer ne trouve pas un bug, il raconte une
   anecdote.*

   ⭐ CE QU'ON CHERCHE N'EST PAS « ca plante » : les scenarios du banc ont deja montre que la
   perte et la resurrection SONT le comportement actuel. Le fuzz cherche les invariants qui
   doivent tenir QUOI QU'IL ARRIVE — l'identite, les justificatifs, la coherence du blob.
   ════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SENS = ['token', 'authCode', 'code', 'confirmCode', 'apikey', 'authorization'];
const LISTES = ['sessions', 'weightLog', 'sleepLog', 'foodLog', 'savedFoods'];
const OPS = ['add', 'edit', 'delete', 'saveA', 'saveB', 'offline', 'restore', 'revoke',
             'reconnect', 'ancienClient', 'salir'];

function lancer(env) {
  const { h, PG, BASE, H_A, H_B, jA, jB, CPT, compteBase, clone } = env;
  const graines = env.graines || [1];
  const parGraine = env.parGraine || 50;
  const violations = [];
  let etapes = 0;
  let sequences = 0;

  for (const graine of graines) {
    const rnd = mulberry32(graine);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length) % arr.length];

    // etat propre a chaque graine
    h.vider();
    PG.vider(BASE);
    PG.sql("update public.ft_jetons set revoque=false", BASE);
    const local = { A: clone(compteBase()), B: clone(compteBase()) };
    let hors = false;
    let revoqueA = false;
    const journal = [];
    sequences++;

    for (let pas = 0; pas < parGraine; pas++) {
      const op = pick(OPS);
      const L = pick(LISTES);
      const app = rnd() < 0.5 ? 'A' : 'B';
      journal.push(op + (op.startsWith('save') ? '' : ':' + app + '/' + L));
      etapes++;

      try {
        if (op === 'add') {
          local[app][L] = (local[app][L] || []).concat(
            [{ id: 'G' + graine + '_P' + pas }]);
        } else if (op === 'edit') {
          const l = local[app][L] || [];
          if (l.length) l[Math.floor(rnd() * l.length) % l.length].marque = pas;
        } else if (op === 'delete') {
          const l = local[app][L] || [];
          if (l.length) l.splice(Math.floor(rnd() * l.length) % l.length, 1);
        } else if (op === 'salir') {
          // on glisse un justificatif dans le corps : il ne doit JAMAIS atteindre le miroir
          local[app][pick(SENS)] = 'FUITE_G' + graine + '_P' + pas;
        } else if (op === 'offline') {
          hors = true;
        } else if (op === 'reconnect') {
          hors = false;
        } else if (op === 'revoke') {
          if (!revoqueA) { PG.revoquer(BASE, H_A); revoqueA = true; }
        } else if (op === 'restore') {
          const blob = PG.lireBlob(BASE, CPT);
          const dist = h.lire(CPT);
          // une restauration remplace l etat local par ce qu une source rend
          if (dist && dist.profile) local[app] = Object.assign(clone(compteBase()), dist, dist.profile);
          else if (blob && blob !== '<<NULL>>') local[app] = Object.assign(clone(compteBase()), blob);
        } else if (op === 'ancienClient') {
          if (!hors) PG.miroirAncien(BASE, CPT, { name: 'ANCIEN_G' + graine, token: 'FUITE_ANCIEN' });
        } else if (op === 'saveA' || op === 'saveB') {
          if (hors) continue;                       // local-first : rien ne part, rien ne casse
          const qui = op === 'saveA' ? 'A' : 'B';
          const jeton = qui === 'A' ? jA : jB;
          const hache = qui === 'A' ? H_A : H_B;
          const corps = Object.assign({}, clone(local[qui]), { action: 'saveProfile',
                                                               email: CPT, token: jeton });
          h.sauver(corps);
          PG.enregistrer(BASE, hache, clone(corps));
        }
      } catch (e) {
        violations.push({ graine, pas, op, invariant: 'PLANTAGE', detail: String(e.message).slice(0, 120) });
        break;
      }

      // ── LES INVARIANTS, VERIFIES A CHAQUE ETAPE ──────────────────────────────────────
      const blob = PG.lireBlob(BASE, CPT);
      const dist = h.lire(CPT);

      // I2 — aucun justificatif ne survit dans le miroir... SAUF par l ancienne porte, qui
      //      n a aucun filtre : c est un fait MESURE, pas une exception qu on s accorde.
      if (blob && blob !== '<<NULL>>' && typeof blob === 'object') {
        const fuites = SENS.filter((k) => k in blob);
        const parAncien = journal[journal.length - 1] === 'ancienClient'
          || (blob.name || '').startsWith('ANCIEN_');
        if (fuites.length && !parAncien) {
          violations.push({ graine, pas, op, invariant: 'I2 justificatif dans le miroir',
                            detail: fuites, sequence: journal.slice(-8) });
        }
        // coherence : le blob reste un objet JSON lisible
        if (Array.isArray(blob)) {
          violations.push({ graine, pas, op, invariant: 'blob corrompu (tableau)', sequence: journal.slice(-8) });
        }
      }
      // I4 — aucune ecriture n a jamais atteint un autre compte
      const autre = PG.lireBlob(BASE, 'chaos.autre@exemple.invalid');
      if (autre !== null && !journal.includes('ancienClient')) {
        violations.push({ graine, pas, op, invariant: 'I4 ecriture sur un autre compte',
                          sequence: journal.slice(-8) });
      }
      // I1 — un jeton revoque ne modifie plus le miroir
      if (revoqueA) {
        const essai = PG.enregistrer(BASE, H_A, { sondeRevoque: pas });
        if (essai.ok) {
          violations.push({ graine, pas, op, invariant: 'I1 jeton revoque accepte',
                            sequence: journal.slice(-8) });
        }
      }
      // I5 — l etat local n est jamais vide par une operation reseau
      if (!local[app] || typeof local[app] !== 'object') {
        violations.push({ graine, pas, op, invariant: 'I5 etat local detruit',
                          sequence: journal.slice(-8) });
      }
      if (violations.length > 20) break;
    }
    if (violations.length > 20) break;
  }

  return { graines, sequences, etapes, violations };
}

module.exports = { lancer, mulberry32 };
