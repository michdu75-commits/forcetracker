/* ═════════════════════════════════════════════════════════════════════════════════════════════
   💪 D031S-VI — LE RIR EN SUPERSET, CONDUIT PAR DE VRAIS APPUIS (D-031-SÉCURITÉ-01, 19/10/2026)
   POURQUOI : les témoins RIR existants posent la cible À LA MAIN (`_rirCible={…}; _renderRirRow()`) puis lisent le
     rendu. Ils prouvent que la barre SAIT afficher les questions — pas que le geste de la personne les fait APPARAÎTRE,
     au bon moment, pour les bonnes séries, ni que la réponse va à la bonne série. Ici, tout passe par l'écran :
     des appuis réels sur les cases ✓ et sur les boutons de réserve (consigne de Michel du 19/10, point C).
   CONDUIT : un superset réel (Développé Couché + Rowing Barre, même groupe), un échauffement É puis une série de
     travail sur le 1er exercice, une série de travail sur le 2ᵉ ; appuis sur ✓ dans l'ordre d'une vraie séance ;
     appui sur « 2 » sous la question du 1er exercice, « 1 » sous celle du 2ᵉ.
   OBSERVE : l'ordre d'apparition des questions, leur nombre, le NOM de l'exercice sur chacune, leur visibilité
     réelle (dans l'écran, pas recouvertes), et la donnée écrite sur chaque série (`rir`).
   NE MODIFIE RIEN au fonctionnement du RIR (consigne) : un rouge ici est une ANOMALIE à soumettre, pas à corriger.
   NE COUVRE PAS : l'échelle RPE (bloc CL), le tri-set, Safari iOS, un superset de plus de deux tours.
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const SEED = `(()=>{try{${Object.entries({ ft4_name: 'Testeur', ft4_bw: '80', ft4_age: '30', ft4_ht: '178', ft4_gender: 'H',
  ft4_act: '1.55', ft4_goal: 'muscle', ft4_rest: '120', ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '999' })
  .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')} window._demoMode=true;}catch(e){}})();`;

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ D031S-VI. LE RIR EN SUPERSET — CONDUIT PAR DE VRAIS APPUIS ═══');
  const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await p.addInitScript(SEED);
  await p.goto('http://localhost:' + PORT + '/index.html'); await p.waitForTimeout(2300);
  const pret = await p.evaluate(() => {
    try {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      S.wkt = { date: today(), start: Date.now() - 600000, startHour: 10, exs: [
        { name: 'Développé Couché', group: 'd031s', groupType: 'super', sets: [{ kg: 30, reps: 8, type: 'É' }, { kg: 55, reps: 8, type: 'N' }] },
        { name: 'Rowing Barre', group: 'd031s', groupType: 'super', sets: [{ kg: 40, reps: 10, type: 'N' }] }] };
      persist();
      goScreen('log', document.getElementById('nb-log'));
      _expandedEx = 0; renderLog(); renderExBlocks();
      return { ok: true, lignes: ['#sr-0-0', '#sr-0-1'].map(s => !!document.querySelector(s + ' .chk')) };
    } catch (e) { return { err: String(e && e.message || e) }; }
  });
  t('D031S-VI ⓪ CONTRÔLE — le superset est à l\'écran : les cases ✓ du 1er exercice (É + travail) sont rendues',
    !!pret.ok && pret.lignes.every(Boolean), JSON.stringify(pret));
  if (!pret.ok || !pret.lignes.every(Boolean)) { await c.close(); return; }

  const questions = () => p.evaluate(() => [...document.querySelectorAll('#rest-rir .rir-lbl')].map(x => x.textContent.trim()));
  const appui = async (sel) => { await p.locator(sel).scrollIntoViewIfNeeded(); await p.locator(sel).click(); await p.waitForTimeout(350); };

  await appui('#sr-0-0 .chk');                 // l'échauffement du 1er exercice — l'app passe au 2ᵉ (superset, sans repos)
  const q1 = await questions();
  await appui('#ex-block-0');                  // la personne rouvre le 1er exercice (appui sur sa carte repliée)
  await appui('#sr-0-1 .chk');                 // sa série de travail — l'app repasse au 2ᵉ, toujours sans repos
  const q2 = await questions();
  const ouvert2 = await p.evaluate(() => !!document.querySelector('#sr-1-0 .chk'));
  await appui('#sr-1-0 .chk');                 // la série de travail du 2ᵉ : le tour est fini, le repos commence
  const q3 = await questions();
  t('D031S-VI ① aucune question de réserve sur l\'ÉCHAUFFEMENT, ni au milieu du tour ; le superset passe de lui-même au 2ᵉ exercice',
    q1.length === 0 && q2.length === 0 && ouvert2, JSON.stringify({ apresEchauffement: q1, apresPremierExercice: q2, deuxiemeOuvert: ouvert2 }));
  t('D031S-VI ② à la fin du tour, UNE question PAR série de travail, chacune NOMME son exercice (Développé Couché, puis Rowing Barre)',
    q3.length === 2 && /Développé Couché/.test(q3[0]) && /Rowing Barre/.test(q3[1]), JSON.stringify(q3));

  const vis = await p.evaluate(() => {
    const H = window.innerHeight, W = window.innerWidth;
    return [...document.querySelectorAll('#rest-rir .rir-b')].map(bt => { const r = bt.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2, el = document.elementFromPoint(x, y);
      return { dans: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= H && r.left >= 0 && r.right <= W,
               libre: !!el && (el === bt || bt.contains(el)), h: Math.round(r.height), txt: bt.textContent.trim() }; });
  });
  t('D031S-VI ③ les boutons de réserve sont VISIBLES et APPUYABLES (dans l\'écran, rien par-dessus, libellé lisible)',
    vis.length >= 10 && vis.every(v => v.dans && v.libre && v.txt.length > 0), JSON.stringify(vis.filter(v => !(v.dans && v.libre)).slice(0, 4)));

  const rangs = p.locator('#rest-rir .rir-row');
  let erreurAppui = '';
  try {
    await rangs.nth(0).locator('.rir-b', { hasText: /^\s*2\s*$/ }).first().click(); await p.waitForTimeout(250);
    await p.locator('#rest-rir .rir-row').nth(1).locator('.rir-b', { hasText: /^\s*1\s*$/ }).first().click(); await p.waitForTimeout(250);
  } catch (e) { erreurAppui = String(e.message).slice(0, 160); }
  const D = await p.evaluate(() => S.wkt.exs.map(ex => ex.sets.map(s => ({ type: s.type, done: !!s.done, rir: s.rir === undefined ? null : s.rir }))));
  t('D031S-VI ④ chaque réponse va à SA série : « 2 » au travail du Développé Couché, « 1 » à celui du Rowing Barre — rien sur l\'échauffement',
    !erreurAppui && D[0][1].rir === 2 && D[1][0].rir === 1 && D[0][0].rir === null && D.every(e => e.every(s => s.done)),
    erreurAppui || JSON.stringify(D));
  t('D031S-VI ⑤ 0 erreur JS sur le parcours', errs.length === 0, errs.join(' | '));
  await c.close();
};
