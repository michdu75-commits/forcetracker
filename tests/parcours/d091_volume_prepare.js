/* ═════════════════════════════════════════════════════════════════════════════════════════════
   📐 D031S-B — VOLUME ET ÉCHAUFFEMENTS : TÉMOINS PRÉPARÉS POUR D-091 / D-092 (D-031-SÉCURITÉ-01, 19/10/2026)
   ✅ BRANCHÉS DANS LA PASSE le 20/10/2026 par Principal, avec la livraison de D-091 (lot final ft-v1257) — ils étaient « non
   branchés » jusque-là, en attente de D-091 (passation § 6). Ils préparent, de façon INDÉPENDANTE du code de Principal, les
   témoins de la règle décidée par Michel :
     · toutes les séries VALIDÉES, échauffements compris, entrent dans le volume TOTAL et le nombre TOTAL de séries ;
     · les séries de TRAVAIL et leur volume restent identifiables séparément ;
     · les records, le 1RM, le RIR et les règles de Milo ne changent pas implicitement.
   📍 OÙ CES CHIFFRES S'AFFICHENT — lu dans le code de D-091 / D-092 tel que Principal l'a préparé (`clone/` de
   `origin/master` @ ed05faa1, source `claude/ux-fig-face-dos-v2` @ e8ffb71c) : le panneau « Ta séance jusqu'ici »
   (`#log-finish`, `renderLogFinish`) dit les TOTAUX, et « dont … de travail » quand ils diffèrent ; la séance ENREGISTRÉE
   (`sess.volume`) garde le volume de TRAVAIL (« sans ce 2ᵉ argument rien ne bouge », commentaire de `_workVol`).
   ⭐ LES VALEURS SONT CALCULÉES À LA MAIN, jamais par une fonction de l'app :
     É 8 × 30 = 240 kg · travail 8 × 55 = 440 kg → « 2 séries · dont 1 de travail » et « 680 kg · dont 440 kg de travail ».
     + un É NON validé (8 × 40) → rien ne change.
     + une série X validée 6 × 55 = 330 kg → « 3 séries · dont 2 de travail » et « 1 010 kg · dont 770 kg de travail »
       (un X est du TRAVAIL : règle existante de `_bilanTravailEx`, décision ① de Michel du 16/10).
     Séance enregistrée : 440 kg (le TRAVAIL) ; record du jour 55 × 8 → 55 / (1,0278 − 0,2224) = 68,29 → 68,3.
     + ⑥b un É PLUS LOURD que le travail (60 × 8 → 74,5 s'il comptait) : le record reste 68,3 — sinon « l'É n'est
       jamais un record » ne se mesurait pas (à 30 kg, il aurait perdu de toute façon).
   ⚠️ SUR LE CODE D'AVANT D-091, les témoins des TOTAUX rougissent : c'est ATTENDU, la règle n'y est pas encore.
   Banc : tools/sous_garde.sh node tools/banc_d091_volume_prepare.js
   Contrôle négatif (sur un arbre qui porte D-091) : python3 tools/mut_d091_volume_prepare.py <arbre-D-091>
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const SEED = `(()=>{try{${Object.entries({ ft4_name: 'Testeur', ft4_bw: '80', ft4_age: '30', ft4_ht: '178', ft4_gender: 'H',
  ft4_act: '1.55', ft4_goal: 'muscle', ft4_rest: '120', ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' })
  .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')} window._demoMode=true;}catch(e){}})();`;

/* le panneau « Ta séance jusqu'ici », tel qu'il s'affiche (espaces insécables normalisés) */
async function panneau(p, sets) {
  return p.evaluate((sets) => {
    try {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      S.wkt = null; S.sessions = []; S.prs = {}; persist();      // chaque scénario part d'une séance NEUVE
      startWorkout();
      S.wkt.exs.push({ name: 'Développé Couché', sets });
      persist();
      goScreen('log', document.getElementById('nb-log'));
      if (typeof renderLogFinish === 'function') renderLogFinish();
      const el = document.getElementById('log-finish');
      const nz = x => (x || '').replace(/[\u202f\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();
      const tuiles = el ? [...el.querySelectorAll('.lf-kv > div')].map(d => nz((d.querySelector('b') || {}).textContent) + ' | ' + nz((d.querySelector('span') || {}).textContent)) : [];
      return { txt: tuiles.join(' ¦ ') || (el ? '(aucune tuile) ' + nz(el.textContent).slice(0, 120) : '(panneau absent)') };
    } catch (e) { return { err: String(e && e.message || e) }; }
  }, sets);
}
const dit = (r, ...motifs) => !r.err && motifs.every(m => m.test(r.txt));

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ D031S-B. VOLUME ET ÉCHAUFFEMENTS (D-091 / D-092) — TÉMOINS PRÉPARÉS, VALEURS À LA MAIN ═══');
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.addInitScript(SEED);
  await p.goto('http://localhost:' + PORT + '/index.html'); await p.waitForTimeout(2300);
  const E = { kg: 30, reps: 8, done: true, type: 'É' }, N = { kg: 55, reps: 8, done: true, type: 'N' };

  const A = await panneau(p, [Object.assign({}, E), Object.assign({}, N)]);
  t('D031S-B ① TOTAL : l\'échauffement validé COMPTE — « 680 kg », et le travail reste dit à part (« dont 440 kg de travail »)',
    dit(A, /(^|¦ )680 kg \| volume · dont 440 kg de travail/), A.err || A.txt.slice(0, 200));
  t('D031S-B ② séries : « 2 séries · dont 1 de travail »', dit(A, /(^|¦ )2 \| séries · dont 1 de travail/), A.err || A.txt.slice(0, 200));
  const B = await panneau(p, [Object.assign({}, E), Object.assign({}, E, { kg: 40, done: false }), Object.assign({}, N)]);
  t('D031S-B ③ un échauffement NON validé ne compte nulle part (toujours 680 kg et 2 séries)',
    dit(B, /(^|¦ )680 kg \| volume/, /(^|¦ )2 \| séries/), B.err || B.txt.slice(0, 200));
  const C = await panneau(p, [Object.assign({}, E), Object.assign({}, N), { kg: 55, reps: 6, done: true, type: 'X' }]);
  t('D031S-B ④ une série X validée : « 3 séries · dont 2 de travail » et « 1 010 kg · dont 770 kg de travail » (X = travail)',
    dit(C, /(^|¦ )3 \| séries · dont 2 de travail/, /(^|¦ )1 010 kg \| volume · dont 770 kg de travail/), C.err || C.txt.slice(0, 220));

  /* ⑤ RESTAURATION : la séance EN COURS survit au rechargement, et le panneau redit les mêmes totaux */
  await p.evaluate(({ E, N }) => { S.wkt = null; S.sessions = []; S.prs = {}; persist(); startWorkout();
    S.wkt.exs.push({ name: 'Développé Couché', sets: [E, N] }); persist(); }, { E, N });
  await p.reload(); await p.waitForTimeout(2200);
  const D = await p.evaluate(() => { try {
    if (!S.wkt || !S.wkt.exs || !S.wkt.exs.length) return { err: 'séance en cours PERDUE au rechargement' };
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen('log', document.getElementById('nb-log')); if (typeof renderLogFinish === 'function') renderLogFinish();
    const el = document.getElementById('log-finish');
    const nz = x => (x || '').replace(/[\u202f\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();
    const tuiles = el ? [...el.querySelectorAll('.lf-kv > div')].map(d => nz((d.querySelector('b') || {}).textContent) + ' | ' + nz((d.querySelector('span') || {}).textContent)) : [];
    return { txt: tuiles.join(' ¦ ') || (el ? '(aucune tuile) ' + nz(el.textContent).slice(0, 120) : '(panneau absent)') };
  } catch (e) { return { err: String(e) }; } });
  t('D031S-B ⑤ après RECHARGEMENT, la séance en cours est restaurée et le panneau redit 680 kg et 2 séries',
    dit(D, /(^|¦ )680 kg \| volume/, /(^|¦ )2 \| séries/), D.err || D.txt.slice(0, 200));

  /* ⑥ LA SÉANCE ENREGISTRÉE garde le TRAVAIL ; le record ne bouge pas */
  const F = await p.evaluate(async () => { try { await finishWorkout(); const s = S.sessions[0];
    return { vol: s && s.volume, pr: (S.prs['Développé Couché'] || {}).rm1 || null }; } catch (e) { return { err: String(e) }; } });
  t('D031S-B ⑥ la séance ENREGISTRÉE garde le volume de TRAVAIL (440 kg) ; le record vaut 68,3 (55 × 8)',
    !F.err && F.vol === 440 && F.pr === 68.3, F.err || JSON.stringify(F));

  /* ⑥b UN ÉCHAUFFEMENT PLUS LOURD QUE LE TRAVAIL ne devient JAMAIS un record. Sans ce cas, « l'É n'en fait jamais »
     ne se mesurait pas : à 30 kg, l'É était plus léger que le travail et aurait perdu de toute façon.
     É 60 × 8 → 60 / 0,8054 = 74,5 s'il comptait ; travail 55 × 8 → 68,3. Volume enregistré : 440 (le travail seul). */
  const G = await p.evaluate(async () => { try {
    S.wkt = null; S.sessions = []; S.prs = {}; persist(); startWorkout();
    S.wkt.exs.push({ name: 'Développé Couché', sets: [{ kg: 60, reps: 8, done: true, type: 'É' }, { kg: 55, reps: 8, done: true, type: 'N' }] });
    persist(); await finishWorkout(); const s = S.sessions[0];
    return { vol: s && s.volume, pr: (S.prs['Développé Couché'] || {}).rm1 || null }; } catch (e) { return { err: String(e) }; } });
  t('D031S-B ⑥b un échauffement PLUS LOURD (60 × 8) que le travail : record 68,3 (jamais 74,5), séance enregistrée 440 kg',
    !G.err && G.vol === 440 && G.pr === 68.3, G.err || JSON.stringify(G));
  t('D031S-B ⑦ 0 erreur JS', errs.length === 0, errs.join(' | '));
  await c.close();
};
