/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧮 MISSION SÉANCE DU 24/10/2026 — LES CHIFFRES D'UNE SÉANCE (blocs C-NUM-*) — session-C (Claude Séance), mission de Michel
   (« Corrections et fiabilisation de l'onglet Séance », P1) ; constats de la contre-vérification du 23/10
   (docs/CONTRE-VERIF-AUDIT-SEANCE-2026-10-23.md) et du plan commun (docs/CHANTIER-NUTRITION-SEANCE.md §2.1).
   Lot 1 — une séance enregistrée ne change pas en silence :
   · F21 — « Enregistrer » une séance passée SANS changer l'effort garde ses calories (et leur détail) ; quand l'effort change,
     seule la VARIATION d'effort s'applique aux calories d'origine : jamais un recalcul au poids du jour ;
   · F02 — le même « Enregistrer » ne divise plus le volume unilatéral par deux (la règle unique `_workVol`) ;
   · Q5  — une séance déjà réduite de moitié par une édition passée s'AFFICHE juste, sans être réécrite tant que la personne
     ne l'enregistre pas ;
   · K1  — corriger la durée met les calories à jour, à la même échelle que la séance d'origine ;
   · K2  — corriger la durée n'efface plus une modification pas encore enregistrée ; tout finit enregistré.
   Ce que les témoins CONDUISENT : la vraie app servie en local (réseau coupé, données fictives, horloge fixe), le vrai
   `finishWorkout`, le vrai détail d'une séance (`openSessDetail`), de vrais champs modifiés (événement `change`), le vrai bouton
   « 💾 Enregistrer », le vrai ⏱️ de la durée (la question `prompt` reçoit la réponse de la personne).
   Ce qu'ils OBSERVENT : la séance en mémoire et dans `ft4_sessions`, ses calories et leur détail (`calData`), son volume, la
   carte de l'historique, l'en-tête du détail, les champs du détail, les messages affichés, les erreurs de page.
   Ce qu'ils NE COUVRENT PAS : l'iPhone réel, la synchro serveur (coupée), Milo lui-même, le moteur calorique (gelé : il n'est
   qu'APPELÉ, jamais modifié).
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const T0 = Date.parse('2026-10-24T18:00:00+02:00');
const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130', ft4_sessions: '[]', ft4_prs: '{}' };
const _j = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const ouvrir = async () => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris',
      locale: 'fr-FR', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_num'))return; sessionStorage.setItem('_num','1'); localStorage.clear();
      const D=${_j(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k])); }catch(e){} })();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.clock.setFixedTime(new Date(T0));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      window.__T = []; const _t = window.toast; window.toast = function (m) { window.__T.push(String(m)); try { return _t.apply(this, arguments); } catch (e) {} }; });
    return { cx, pg, errs };
  };
  // le geste « 💾 Enregistrer » du détail, par son vrai bouton
  const enregistrer = X => X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-sess-detail button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
  // un champ du détail modifié comme le ferait la personne (valeur + événement change)
  const champ = (X, ei, si, quoi, val) => X.pg.evaluate(([ei, si, quoi, val]) => {
    const inp = [...document.querySelectorAll('#sd-content input')].find(i => (i.getAttribute('onchange') || '').indexOf('updateSessSet(' + ei + ',' + si + ",'" + quoi + "'") === 0);
    inp.value = val; inp.dispatchEvent(new Event('change', { bubbles: true })); }, [ei, si, quoi, val]);
  // le ⏱️ du détail, la personne répond `rep` à la question (null = « Annuler »)
  const duree = (X, rep) => X.pg.evaluate(rep => { window.prompt = () => rep;
    const el = document.querySelector('#sd-sub .sd-dur'); el.click(); }, rep);
  const stocke = X => X.pg.evaluate(() => JSON.parse(localStorage.getItem('ft4_sessions') || '[]'));

  /* Séance de référence, terminée par le VRAI `finishWorkout` à 82 kg : un exercice unilatéral (30 kg par côté × 10) et un
     bilatéral (Squat 100 × 5, trois séries). */
  const terminer = (X, exs, opts) => X.pg.evaluate(async ([exs, opts]) => {
    S.bw = 82; persist();
    const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
    S.wkt = { date: today(), exs: exs.map(e => ({ name: e.name === 'U' ? U : e.name, sets: e.sets.map((s, i) => Object.assign({ done: true, type: 'N', at: 60000 * (i + 1) }, s)) })),
      startHour: 17, startTs: Date.now() - (opts.min || 30) * 60000 };
    await finishWorkout();
    const s = S.sessions[0];
    return { U, id: s.ts || s.id, s: JSON.parse(JSON.stringify(s)) };
  }, [exs, opts || {}]);
  // le calcul de référence, INDÉPENDANT du correctif : le vrai moteur, au poids de la séance (82 kg), sur une séance donnée
  const kcalA82 = (X, sess) => X.pg.evaluate(sess => { const bw = S.bw; S.bw = 82;
    const c = calcSessionCalories(sess); const k = calcCardioKcal(sess.cardioAvant || null) + calcCardioKcal(sess.cardio || null);
    S.bw = bw; return Math.round(c.total + k); }, sess);

  /* ── C-NUM-A — F21 : les calories d'une séance passée ─────────────────────────────────────────────────────────────── */
  {
    const X = await ouvrir();
    const r = await terminer(X, [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5 }, { kg: 100, reps: 5 }, { kg: 100, reps: 5 }] }]);
    await X.pg.evaluate(() => { S.bw = 95; persist(); });
    await X.pg.evaluate(id => openSessDetail(id), r.id);
    await enregistrer(X);
    const apres = (await stocke(X))[0];
    t('C-NUM-A1 ⭐ F21 — « Enregistrer » sans rien changer, après une prise de poids (82 → 95 kg) : les calories restent celles de la séance',
      r.s.calories > 0 && apres.calories === r.s.calories, 'avant ' + r.s.calories + ' · après ' + apres.calories);
    t('C-NUM-A2 F21 — et leur détail (`calData`) reste à l\'identique', _j(apres.calData) === _j(r.s.calData),
      _j(apres.calData).slice(0, 120));
    // l'effort change : une répétition de plus sur la 1ʳᵉ série → le recalcul suit la séance (82 kg), jamais le poids du jour
    await X.pg.evaluate(id => openSessDetail(id), r.id);
    await champ(X, 0, 0, 'reps', '6');
    await enregistrer(X);
    const ap2 = (await stocke(X))[0];
    const att = await kcalA82(X, ap2);
    const a95 = await X.pg.evaluate(sess => Math.round(calcSessionCalories(sess).total), ap2);
    t('C-NUM-A3 ⭐ F21 — l\'effort change (5 → 6 répétitions) : les calories suivent, au poids de la SÉANCE, pas au poids du jour',
      Math.abs(ap2.calories - att) <= 1 && ap2.calories !== a95,
      'enregistré ' + ap2.calories + ' · attendu (82 kg) ' + att + ' · au poids du jour (95 kg) ' + a95);
    t('C-NUM-A4 F21 — l\'effort modifié est bien enregistré (6 répétitions)', ap2.exs[0].sets[0].reps === 6, _j(ap2.exs[0].sets[0]));
    t('C-NUM-A5 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }

  {
    /* La fin de séance passe maintenant par le MÊME calcul que la modification (`_calDataSeance`) : le cardio d'avant et
       celui d'après y entrent toujours, et une séance avec cardio garde ses calories à « Enregistrer » sans changement. */
    const X = await ouvrir();
    const r = await X.pg.evaluate(async () => {
      S.bw = 82; persist();
      S.wkt = { date: today(), exs: [{ name: 'Squat Barre', sets: [1, 2, 3].map(i => ({ kg: 100, reps: 5, done: true, type: 'N', at: 60000 * i })) }],
        cardioAvant: { type: 'velo', duration: 10, intensity: 'modere' }, cardio: { type: 'velo', duration: 15, intensity: 'modere' },
        startHour: 17, startTs: Date.now() - 40 * 60000 };
      await finishWorkout();
      const s = JSON.parse(JSON.stringify(S.sessions[0]));
      const moteur = calcSessionCalories(s).total, cardio = calcCardioKcal(s.cardioAvant) + calcCardioKcal(s.cardio);
      S.bw = 95; persist(); openSessDetail(s.ts || s.id);
      return { s, moteur, cardio };
    });
    await enregistrer(X);
    const ap = (await stocke(X))[0];
    t('C-NUM-A6 la fin de séance compte le cardio d\'avant ET d\'après dans ses calories, et « Enregistrer » sans changement les garde',
      r.cardio > 0 && r.s.calData.cardio === r.cardio && r.s.calories === r.moteur + r.cardio && ap.calories === r.s.calories,
      _j({ kcal: r.s.calories, moteur: r.moteur, cardio: r.cardio, calDataCardio: r.s.calData.cardio, apres: ap.calories }));
    await X.cx.close();
  }

  /* ── C-NUM-B — F02 et Q5 : le volume unilatéral ─────────────────────────────────────────────────────────────────── */
  {
    const X = await ouvrir();
    const r = await terminer(X, [{ name: 'U', sets: [{ kg: 30, reps: 10 }] }]);
    await X.pg.evaluate(id => openSessDetail(id), r.id);
    await enregistrer(X);
    const apres = (await stocke(X))[0];
    t('C-NUM-B1 ⭐ F02 — « Enregistrer » sans rien changer : le volume unilatéral reste 600 kg (30 kg par côté × 10 × 2)',
      r.s.volume === 600 && apres.volume === 600 && apres.uniConv === 1, 'avant ' + r.s.volume + ' · après ' + apres.volume + ' (' + r.U + ')');
    const carte = await X.pg.evaluate(() => { renderSessions(); return [...document.querySelectorAll('.sess-vol2')].map(e => e.textContent.trim()); });
    t('C-NUM-B2 F02 — la carte de l\'historique dit 600 kg de travail', carte.length === 1 && /^600 kg/.test(carte[0]), _j(carte));
    // contre-épreuve bilatérale : rien ne doit changer
    await X.pg.evaluate(() => { S.sessions = []; persist(); });
    const rb = await terminer(X, [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 5 }] }]);
    await X.pg.evaluate(id => openSessDetail(id), rb.id);
    await enregistrer(X);
    const bap = (await stocke(X))[0];
    t('C-NUM-B3 F02 — contre-épreuve bilatérale : 500 kg avant et après', rb.s.volume === 500 && bap.volume === 500, rb.s.volume + ' → ' + bap.volume);
    t('C-NUM-B4 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  {
    /* Q5 — une séance déjà réduite de moitié par une édition passée (le défaut F02 existe en production depuis le 11/08) :
       elle s'affiche juste partout, et elle n'est PAS réécrite tant que la personne ne l'enregistre pas. */
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
      const ts = Date.now() - 2 * 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), uniConv: 1, volume: 300, calories: 80, duration: 1200,
        exs: [{ name: U, sets: [{ kg: 30, reps: 10, done: true, type: 'N' }] }] }];
      S.sessions[0].exercises = S.sessions[0].exs; persist();
      renderSessions();
      const carte = [...document.querySelectorAll('.sess-vol2')].map(e => e.textContent.trim());
      openSessDetail(ts);
      const entete = document.getElementById('sd-sub').textContent;
      closeSessDetail();
      return { U, ts, carte, entete, stocke: JSON.parse(localStorage.getItem('ft4_sessions'))[0].volume };
    });
    t('C-NUM-B5 ⭐ Q5 — une séance déjà réduite de moitié (300 enregistrés pour 600 réels) : la carte de l\'historique dit 600 kg',
      r.carte.length === 1 && /^600 kg/.test(r.carte[0]), _j(r.carte));
    t('C-NUM-B6 Q5 — l\'en-tête du détail dit 600 kg', /(^|\D)600 kg/.test(r.entete.replace(/ | /g, ' ')), r.entete.slice(0, 90));
    t('C-NUM-B7 ⛔ Q5 — et la séance enregistrée n\'est PAS réécrite en silence (300 reste en mémoire et sur le disque)',
      r.stocke === 300, 'stocké ' + r.stocke);
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts); await enregistrer(X);
    const ap = (await stocke(X))[0];
    t('C-NUM-B8 Q5 — quand la personne l\'enregistre elle-même, le volume enregistré redevient juste (600)', ap.volume === 600, 'après ' + ap.volume);
    t('C-NUM-B9 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }

  /* ── C-NUM-C — K1 et K2 : la durée corrigée dans le détail ─────────────────────────────────────────────────────── */
  /* La séance de 60 min de la contre-vérification (K1 : 317 kcal à 82 kg). `records` : comme une VRAIE fin de séance, ses
     records sont posés AVANT le calcul de ses calories (sans eux, le premier « Enregistrer » les pose et change le contexte
     du calcul au milieu du témoin — un artefact du montage, pas un comportement de l'app). */
  const seance60 = (X, records) => X.pg.evaluate(records => {
    const ts = Date.now() - 2 * 864e5;
    const s = { id: ts, ts, date: today(ts), uniConv: 1, duration: 3600,
      exs: [{ name: 'Squat Barre', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 100, reps: 5, done: true, type: 'N' })) },
            { name: 'Développé Couché', sets: [1, 2, 3, 4, 5, 6].map(() => ({ kg: 80, reps: 8, done: true, type: 'N' })) }] };
    s.exercises = s.exs; s.volume = Math.round(_workVol(s));
    if (records) s.exs.forEach(ex => { const st = ex.sets[0]; S.prs[ex.name] = { kg: st.kg, reps: st.reps, rm1: bz(st.kg, st.reps), date: s.date }; });
    S.bw = 82; const c = calcSessionCalories(s); s.calories = c.total; s.calData = c;
    S.sessions = [s]; persist();
    return { ts, kcal: s.calories };
  }, !!records);
  {
    const X = await ouvrir();
    const r = await seance60(X);
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await duree(X, '90');
    const ap = (await stocke(X))[0];
    const att = await kcalA82(X, ap);
    t('C-NUM-C1 ⭐ K1 — la durée passe de 60 à 90 min : les calories sont mises à jour (≈ 440), pas gardées à 317',
      ap.duration === 5400 && r.kcal === 317 && Math.abs(ap.calories - att) <= 1 && ap.calories !== r.kcal, 'avant ' + r.kcal + ' · après ' + ap.calories + ' · attendu ' + att);
    const vu = await X.pg.evaluate(() => document.getElementById('sd-sub').textContent);
    t('C-NUM-C2 K1 — le détail ouvert montre aussitôt la nouvelle durée et les nouvelles calories',
      /1 h 30/.test(vu) && new RegExp('🔥 ' + att + ' kcal').test(vu), vu.slice(0, 120) + ' · attendu 🔥 ' + att);
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const r = await seance60(X);
    await X.pg.evaluate(() => { S.bw = 95; persist(); });
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await duree(X, '90');
    const ap = (await stocke(X))[0];
    const att = await kcalA82(X, ap);
    t('C-NUM-C3 K1 — après une prise de poids (95 kg), la durée corrigée garde l\'échelle de la séance (82 kg) : ≈ 440, pas ≈ 510',
      Math.abs(ap.calories - att) <= 1, 'après ' + ap.calories + ' · attendu ' + att);
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const r = await seance60(X, true);
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await champ(X, 0, 0, 'kg', '120');                    // pas encore enregistré
    await duree(X, '75');
    const vu = await X.pg.evaluate(() => ({ champ: ([...document.querySelectorAll('#sd-content input')].find(i => (i.getAttribute('onchange') || '').indexOf("updateSessSet(0,0,'kg'") === 0) || {}).value,
      edite: _sessEdits && _sessEdits.exs[0].sets[0].kg, ouvert: document.getElementById('ov-sess-detail').classList.contains('open') }));
    t('C-NUM-C4 ⭐ K2 — corriger la durée n\'efface pas la charge tapée et pas encore enregistrée (120 reste dans le détail ouvert)',
      vu.ouvert && vu.edite === 120 && vu.champ === '120', _j(vu));
    await enregistrer(X);
    const ap = (await stocke(X))[0];
    const att = await kcalA82(X, ap);
    t('C-NUM-C5 ⭐ K2 — « Enregistrer » garde les deux : la charge (120) et la durée (75 min)', ap.exs[0].sets[0].kg === 120 && ap.duration === 4500,
      _j({ kg: ap.exs[0].sets[0].kg, duree: ap.duration }));
    /* 120 kg relève le record du Squat : le contexte du calcul (charge relative des autres séries) change avec l'édition elle-
       même. La règle garde l'échelle de la séance d'origine pour ce qui n'a pas changé ; l'écart avec un recalcul complet
       reste petit — borné ici à 2 %, et loin du calcul au poids du jour qu'on écarte. */
    t('C-NUM-C6 K2 — une charge relevée (nouveau record) : les calories enregistrées restent à moins de 2 % d\'un recalcul complet au poids de la séance',
      Math.abs(ap.calories - att) <= Math.max(1, att * 0.02), 'enregistré ' + ap.calories + ' · recalcul complet ' + att);
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const r = await seance60(X, true);
    await X.pg.evaluate(() => { S.bw = 95; persist(); });
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await champ(X, 0, 0, 'kg', '95');                     // une charge corrigée à la BAISSE : aucun record ne bouge
    await duree(X, '75');
    await enregistrer(X);
    const ap = (await stocke(X))[0];
    const att = await kcalA82(X, ap);
    const a95 = await X.pg.evaluate(sess => { const c = calcSessionCalories(sess); return Math.round(c.total); }, ap);
    t('C-NUM-C9 ⭐ K1 + K2 + F21 — durée puis charge corrigées, après une prise de poids : les calories enregistrées valent le calcul au poids de la SÉANCE (± 1)',
      ap.exs[0].sets[0].kg === 95 && ap.duration === 4500 && Math.abs(ap.calories - att) <= 1 && ap.calories !== a95,
      'enregistré ' + ap.calories + ' · au poids de la séance ' + att + ' · au poids du jour ' + a95);
    t('C-NUM-C10 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const r = await seance60(X);
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await champ(X, 0, 0, 'kg', '110');
    await duree(X, null);                                 // « Annuler »
    const a = await X.pg.evaluate(() => ({ edite: _sessEdits && _sessEdits.exs[0].sets[0].kg }));
    await duree(X, '0');                                  // réponse impossible
    const b2 = await X.pg.evaluate(() => ({ edite: _sessEdits && _sessEdits.exs[0].sets[0].kg, msg: window.__T.slice(-1)[0] || '' }));
    const ap = (await stocke(X))[0];
    t('C-NUM-C7 K2 — « Annuler » ou une durée impossible ne change rien : ni la durée, ni les calories, ni la charge en attente',
      ap.duration === 3600 && ap.calories === r.kcal && a.edite === 110 && b2.edite === 110 && /entre 1 et 600/.test(b2.msg),
      _j({ a, b2, duree: ap.duration, kcal: ap.calories }));
    t('C-NUM-C8 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
}

module.exports = { ecran };
