/* ═════════════════════════════════════════════════════════════════════════════════════════════
   📐 D031S-B — VOLUME ET ÉCHAUFFEMENTS : TÉMOINS PRÉPARÉS POUR D-091 — ⛔ NON BRANCHÉS (D-031-SÉCURITÉ-01, 19/10/2026)
   ⛔⛔ CE FICHIER N'EST PAS CHARGÉ PAR LA PASSE. Il prépare, de façon INDÉPENDANTE du code de D-091 (que Principal
   écrit), les témoins de la règle décidée par Michel :
     · toutes les séries VALIDÉES, échauffements compris, entrent dans le volume TOTAL et le nombre TOTAL de séries ;
     · les séries de TRAVAIL et leur volume restent identifiables séparément ;
     · les records, le 1RM, le RIR et les règles de Milo ne changent pas implicitement.
   ⭐ LES VALEURS SONT CALCULÉES À LA MAIN, jamais par une fonction de l'app :
     É 8 × 30 = 240 kg · travail 8 × 55 = 440 kg → TOTAL 680 kg et 2 séries ; TRAVAIL 440 kg et 1 série.
     + un É NON validé (8 × 40) → rien ne change (680 / 2).
     + une série X validée 6 × 55 = 330 kg → TOTAL 1 010 kg et 3 séries ; TRAVAIL 770 kg et 2 séries.
     1RM du jour (Brzycki, la formule de l'app) : 55 × 8 → 55 / (1,0278 − 0,2224) = 68,29 → 68,3 — l'É à 30 kg
     n'est jamais un record.
   ⚠️ À L'INTÉGRATION (coordination avec Principal) : `lire()` ci-dessous est le SEUL endroit qui suppose où D-091
     range le total et le travail. Ses noms sont des HYPOTHÈSES ; une valeur introuvable rend `null`, donc un témoin
     ROUGE qui le dit — jamais un vert par défaut. La question des séries X (comptent-elles comme TRAVAIL ?) est
     écrite ici comme une HYPOTHÈSE (oui, comme aujourd'hui dans `_workVol`) : à confirmer par Michel.
   ⚠️ SUR LE CODE D'AUJOURD'HUI (avant D-091), les témoins du TOTAL rougissent : c'est ATTENDU, la règle n'est pas
     encore livrée. Banc : node -r ./tests/_garde_reseau.js tools/banc_d091_volume_prepare.js
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const SEED = `(()=>{try{${Object.entries({ ft4_name: 'Testeur', ft4_bw: '80', ft4_age: '30', ft4_ht: '178', ft4_gender: 'H',
  ft4_act: '1.55', ft4_goal: 'muscle', ft4_rest: '120', ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' })
  .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')} window._demoMode=true;}catch(e){}})();`;

/* ⚠️ LE SEUL POINT DE CONTACT AVEC LES NOMS DE D-091 — à aligner avec Principal (hypothèses, pas des faits). */
const LIRE = `(sess)=>({
  volTotal:   sess.volumeTotal ?? sess.volume ?? null,
  volTravail: sess.volumeTravail ?? sess.workVolume ?? (typeof _workVol==='function' ? Math.round(_workVol(sess)) : null),
  nbTotal:    sess.nbSeries ?? sess.seriesTotal ?? null,
  nbTravail:  sess.nbSeriesTravail ?? sess.seriesTravail ?? null })`;

async function seance(p, sets) {
  return p.evaluate(async ({ sets, LIRE }) => {
    try {
      const lire = eval(LIRE);
      S.sessions = []; S.prs = {}; persist();
      startWorkout();
      S.wkt.exs.push({ name: 'Développé Couché', sets });
      await finishWorkout();
      const s = S.sessions[0];
      return { lu: lire(s), pr: (S.prs['Développé Couché'] || {}).rm1 || null, nSess: S.sessions.length };
    } catch (e) { return { err: String(e && e.message || e) }; }
  }, { sets, LIRE });
}

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ D031S-B. VOLUME ET ÉCHAUFFEMENTS (D-091) — TÉMOINS PRÉPARÉS, VALEURS À LA MAIN ═══');
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.addInitScript(SEED);
  await p.goto('http://localhost:' + PORT + '/index.html'); await p.waitForTimeout(2300);
  const E = { kg: 30, reps: 8, done: true, type: 'É' }, N = { kg: 55, reps: 8, done: true, type: 'N' };
  const A = await seance(p, [Object.assign({}, E), Object.assign({}, N)]);
  t('D031S-B ① TOTAL : l\'échauffement validé COMPTE — 240 + 440 = 680 kg', !A.err && A.lu.volTotal === 680, A.err || JSON.stringify(A.lu));
  t('D031S-B ② TRAVAIL identifiable séparément : 440 kg', !A.err && A.lu.volTravail === 440, A.err || JSON.stringify(A.lu));
  t('D031S-B ③ séries : 2 au TOTAL, 1 de TRAVAIL', !A.err && A.lu.nbTotal === 2 && A.lu.nbTravail === 1, A.err || JSON.stringify(A.lu));
  t('D031S-B ④ le record ne bouge pas : 55 × 8 → 68,3 (Brzycki), l\'É à 30 kg n\'est jamais un record', !A.err && A.pr === 68.3, A.err || String(A.pr));
  const B = await seance(p, [Object.assign({}, E), Object.assign({}, E, { kg: 40, done: false }), Object.assign({}, N)]);
  t('D031S-B ⑤ un échauffement NON validé ne compte nulle part (680 kg / 2 séries)', !B.err && B.lu.volTotal === 680 && B.lu.nbTotal === 2, B.err || JSON.stringify(B.lu));
  const C = await seance(p, [Object.assign({}, E), Object.assign({}, N), { kg: 55, reps: 6, done: true, type: 'X' }]);
  t('D031S-B ⑥ une série X validée : TOTAL 1 010 kg / 3 séries ; TRAVAIL 770 kg / 2 séries (hypothèse : X = travail)',
    !C.err && C.lu.volTotal === 1010 && C.lu.nbTotal === 3 && C.lu.volTravail === 770 && C.lu.nbTravail === 2, C.err || JSON.stringify(C.lu));
  await p.reload(); await p.waitForTimeout(2200);
  const R = await p.evaluate((LIRE) => { try { const lire = eval(LIRE); return { lu: lire(S.sessions[0]), n: S.sessions.length }; } catch (e) { return { err: String(e) }; } }, LIRE);
  t('D031S-B ⑦ après RECHARGEMENT, la séance garde les mêmes totaux (1 010 / 770)', !R.err && R.n === 1 && R.lu.volTotal === 1010 && R.lu.volTravail === 770, R.err || JSON.stringify(R));
  /* ⑨ RESTAURATION : une séance EN COURS (validée à moitié) survit au rechargement, puis se termine avec les bons totaux */
  await p.evaluate(({ E, N }) => { S.sessions = []; S.prs = {}; persist(); startWorkout();
    S.wkt.exs.push({ name: 'Développé Couché', sets: [E, N] }); persist(); }, { E, N });
  await p.reload(); await p.waitForTimeout(2200);
  const D = await p.evaluate(async (LIRE) => { try { const lire = eval(LIRE);
    if (!S.wkt || !S.wkt.exs || !S.wkt.exs.length) return { err: 'séance en cours PERDUE au rechargement' };
    await finishWorkout(); return { lu: lire(S.sessions[0]) }; } catch (e) { return { err: String(e) }; } }, LIRE);
  t('D031S-B ⑨ une séance EN COURS restaurée après rechargement se termine avec les mêmes totaux (680 / 440)',
    !D.err && D.lu.volTotal === 680 && D.lu.volTravail === 440, D.err || JSON.stringify(D.lu));
  t('D031S-B ⑧ 0 erreur JS', errs.length === 0, errs.join(' | '));
  await c.close();
};
