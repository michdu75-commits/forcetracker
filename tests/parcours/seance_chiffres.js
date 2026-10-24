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
    /* F21, l'autre moitié du contexte : le repos par défaut (lu par le moteur) change entre la fin de séance et « Enregistrer ».
       Garder les calories, c'est garder AUSSI leur détail tel qu'il a été calculé ce jour-là — pas un recalcul du jour
       ramené au même total (le contrôle négatif du 24/10 a montré que le cas du poids seul ne les distinguait pas). */
    const X = await ouvrir();
    const r = await terminer(X, [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5 }, { kg: 100, reps: 5 }, { kg: 100, reps: 5 }] }]);
    await X.pg.evaluate(() => { S.defRest = 60; persist(); });
    await X.pg.evaluate(id => openSessDetail(id), r.id);
    await enregistrer(X);
    const apres = (await stocke(X))[0];
    t('C-NUM-A7 ⭐ F21 — « Enregistrer » sans rien changer, après un changement du repos par défaut (130 → 60 s) : calories ET détail d\'origine gardés',
      apres.calories === r.s.calories && _j(apres.calData) === _j(r.s.calData),
      'avant ' + r.s.calories + ' / repos ' + r.s.calData.restMin + ' min · après ' + apres.calories + ' / repos ' + apres.calData.restMin + ' min');
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
  {
    // confirmer la durée DÉJÀ affichée (60) n'est pas une correction : rien n'est écrit, rien ne bouge
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const ts = Date.now() - 864e5;
      const s = { id: ts, ts, date: today(ts), uniConv: 1, duration: 3610,
        exs: [{ name: 'Squat Barre', sets: [1, 2, 3].map(i => ({ kg: 100, reps: 5, done: true, type: 'N', at: ts + i * 60000 })) }] };
      s.exercises = s.exs; s.volume = Math.round(_workVol(s)); S.bw = 82; const c = calcSessionCalories(s); s.calories = c.total; s.calData = c;
      S.sessions = [s]; persist(); return { ts, s: JSON.parse(JSON.stringify(s)) };
    });
    await X.pg.evaluate(ts => openSessDetail(ts), r.ts);
    await duree(X, '60');
    const ap = (await stocke(X))[0];
    t('C-NUM-C11 confirmer la durée déjà affichée (60 min) ne change rien : ni la durée, ni « saisie », ni les calories',
      ap.duration === 3610 && !ap.durationDite && ap.calories === r.s.calories && _j(ap.calData) === _j(r.s.calData),
      _j({ duree: ap.duration, dite: ap.durationDite, kcal: ap.calories, avant: r.s.calories }));
    await X.cx.close();
  }

  /* ══ LOT 2 — LES MÊMES CHIFFRES PARTOUT ══════════════════════════════════════════════════════════════════════════
     ── C-NUM-D — F01 · F25 · exports · Milo · tableau de bord : la convention unilatérale d'une séance, une seule règle.
     Trois séances : celle du jour terminée par le vrai `finishWorkout` (unilatéral 30 kg par côté × 10 + un palier É
     + Développé Couché 100 × 5 → 1 100 kg de travail), une ANCIENNE (d'avant la convention, sans `uniConv` : 600 kg
     notés en total) et une séance déjà réduite de moitié par une édition passée (600 réels, 300 rangés). */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(async () => {
      S.bw = 82; S.prs = {}; persist();
      const U = Object.keys(EX_UNI).map(id => exNom(id)).filter(n => n && estUnilateral(n))[0];
      const j = n => today(Date.now() - n * 864e5);
      const vieille = { id: 1001, ts: Date.now() - 3 * 864e5, date: j(3), volume: 600, exs: [{ name: U, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }] };
      const moitie = { id: 1002, ts: Date.now() - 5 * 864e5, date: j(5), uniConv: 1, volume: 300, exs: [{ name: U, sets: [{ kg: 30, reps: 10, done: true, type: 'N' }] }] };
      [vieille, moitie].forEach(x => { x.exercises = x.exs; });
      S.sessions = [vieille, moitie]; _trierSeances(S.sessions); persist();
      S.wkt = { date: today(), exs: [{ name: U, sets: [{ kg: 20, reps: 10, done: true, type: 'É', at: 30000 }, { kg: 30, reps: 10, done: true, type: 'N', at: 60000 }] },
        { name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: true, type: 'N', at: 120000 }] }], startHour: 17, startTs: Date.now() - 20 * 60000 };
      await finishWorkout();
      const jour = S.sessions.find(x => x.date === today());
      const vb = _calVolByDay();
      const csv = d => _histoLignes(false).filter(x => x.date === d && x.exercise === U && x.type === 'N').reduce((a, x) => a + (+x.volume || 0), 0);
      const ctx = buildCoachContext('bonjour');
      const lignes = ctx.split('\n').filter(l => /kg vol total/.test(l));
      const nb = l => { const m = l.match(/(\d+)kg vol total/); return m ? +m[1] : null; };
      return { U, sauve: jour.volume, cal: { jour: vb[today()], vieille: vb[j(3)], moitie: vb[j(5)] },
        tendance: _volumeParMoitie(14), csv: { jour: csv(today()), vieille: csv(j(3)), moitie: csv(j(5)) },
        milo: lignes.map(nb), dbf: { jour: _dbfDesignation(jour), moitie: _dbfDesignation(S.sessions.find(x => x.id === 1002)) },
        moitieRangee: JSON.parse(localStorage.getItem('ft4_sessions')).find(x => x.id === 1002).volume };
    });
    t('C-NUM-D1 ⭐ F01 — le calendrier compte la séance du jour comme la séance enregistrée : 1 100 kg (et non 800)',
      r.sauve === 1100 && r.cal.jour === 1100, 'enregistrée ' + r.sauve + ' · calendrier ' + r.cal.jour);
    t('C-NUM-D2 F01 — la séance d\'avant la convention garde ses 600 kg ; la séance réduite de moitié vaut 600 au calendrier',
      r.cal.vieille === 600 && r.cal.moitie === 600, _j(r.cal));
    t('C-NUM-D3 ⭐ F25 — la tendance de volume suit la même règle (unilatéral ×2, échauffements exclus) : 2 300 kg sur la moitié récente',
      r.tendance && r.tendance.recent === 2300, _j(r.tendance));
    t('C-NUM-D4 ⭐ export (CSV / PDF) — la ligne de travail unilatérale porte le volume des deux côtés (600) ; l\'ancienne séance reste à 600',
      r.csv.jour === 600 && r.csv.vieille === 600 && r.csv.moitie === 600, _j(r.csv));
    t('C-NUM-D5 Milo — la liste des séances qu\'il reçoit dit 1 100, 600 et 600 kg (la séance réduite de moitié comprise)',
      _j(r.milo.slice().sort((a, b) => b - a)) === _j([1100, 600, 600]), _j(r.milo));
    t('C-NUM-D6 Milo — la fiche du débrief dit 1100 kg pour la séance du jour, 600 kg pour la séance réduite de moitié',
      /1100kg de volume/.test(r.dbf.jour) && /600kg de volume/.test(r.dbf.moitie), _j(r.dbf));
    t('C-NUM-D7 ⛔ et rien n\'est réécrit en silence : la séance réduite de moitié garde 300 sur le disque', r.moitieRangee === 300, 'rangé ' + r.moitieRangee);
    t('C-NUM-D9 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    /* le tableau de bord ordinateur (même origine, même stockage) : « Charge totale » sur 30 jours. ⚠️ Dans le MÊME onglet :
       un nouvel onglet aurait un `sessionStorage` vide et le script d'initialisation du montage viderait le stockage. */
    await X.pg.goto('http://localhost:' + PORT + '/dashboard.html'); await X.pg.waitForTimeout(1200);
    const charge = await X.pg.evaluate(() => { const h = String(_dBas()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const m = h.match(/Charge totale\s+([\d.,]+) T/); return m ? m[1] : h.slice(0, 160); });
    t('C-NUM-D8 tableau de bord ordinateur — « Charge totale » sur 30 jours : 2,3 T (1 100 + 600 + 600)', charge === '2.3', 'lu : ' + charge);
    await X.cx.close();
  }

  /* ── C-NUM-E — F03 : les anciennes séries « W » ne sont pas des séries de travail ────────────────────────────── */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const mk = types => ({ id: 2001, ts: Date.now() - 864e5, date: today(Date.now() - 864e5), uniConv: 1,
        exs: [{ name: 'Développé Couché', sets: types.map(t => ({ kg: 80, reps: 8, done: true, type: t })) }] });
      const pec = () => { const v = _volumeParMuscle(Date.now(), 14); const l = v.liste.find(x => x.code === 'pec'); return l ? l.series : 0; };
      S.sessions = [mk(['N', 'N', 'É', 'W'])]; const avecW = pec();
      const ctx = (typeof _ctxVolumeMuscles === 'function') ? _ctxVolumeMuscles() : '';
      S.sessions = [mk(['N', 'N'])]; const deuxN = pec();
      return { avecW, deuxN, milo: (ctx.match(/[^\n]*[Pp]ectora[^\n]*/) || [''])[0].slice(0, 160) };
    });
    t('C-NUM-E1 ⭐ F03 — une ancienne série « W » ne compte pas dans le volume par muscle : 2 séries de pectoraux, comme sans elle',
      r.avecW === 2 && r.deuxN === 2, _j(r));
    t('C-NUM-E2 F03 — Milo lit 1 série par semaine de pectoraux (et non 1,5)', /Pectoraux\s*:\s*1 s/.test(r.milo) && !/1[.,]5/.test(r.milo), r.milo);
    await X.cx.close();
  }

  /* ── C-NUM-F — F07 : la couleur du calendrier suit la séance modifiée, sans redémarrage ──────────────────────── */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const s = { id: 5001, ts: Date.now() - 864e5, date: today(Date.now() - 864e5), uniConv: 1,
        exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }, { name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: false, type: 'N' }] }] };
      S.sessions = [s]; persist();
      const avant = _calSessMix(s);
      s.exs[0].sets[0].done = false; s.exs[1].sets[0].done = true;     // mêmes noms, autres séries faites
      const apres = _calSessMix(s);
      return { avant: avant && avant.reg, apres: apres && apres.reg };
    });
    t('C-NUM-F1 ⭐ F07 — mêmes exercices, autres séries faites : la couleur passe aussitôt de « bas » à « haut » (plus de cache périmé)',
      r.avant === 'bas' && r.apres === 'haut', _j(r));
    await X.cx.close();
  }

  /* ── C-NUM-G — F06 : la tuile « Séance » de Nutrition additionne les séances du jour ─────────────────────────── */
  {
    const X = await ouvrir();
    const lireTuile = () => X.pg.evaluate(() => { renderNutrition();
      const v = document.getElementById('nu-session-cal'), l = v && v.closest('.nu-stat') && v.closest('.nu-stat').querySelector('.nu-stat-lbl');
      const b = v.closest('.nu-stat').getBoundingClientRect(), bv = v.getBoundingClientRect(), bl = l.getBoundingClientRect();
      return { val: v.textContent.replace(/[\u202f\u00a0]/g, ' ').trim(), lbl: l.textContent.trim(), deborde: v.scrollWidth > v.clientWidth + 1 || bv.right > b.right + 0.5 || bl.right > bv.left + 0.5 || b.height > 60 }; });
    await X.pg.evaluate(() => { const mk = (id, kcal) => ({ id, ts: id, date: today(), calories: kcal, exs: [] });
      S.sessions = [mk(Date.now() - 3600e3, 350), mk(Date.now() - 7200e3, 250)]; persist(); goScreen('nutrition', document.getElementById('nb-nutrition')); });
    const deux = await lireTuile();
    await X.pg.evaluate(() => { S.sessions = S.sessions.slice(0, 1); persist(); });
    const une = await lireTuile();
    await X.pg.evaluate(() => { S.sessions = []; persist(); });
    const zero = await lireTuile();
    await X.pg.setViewportSize({ width: 320, height: 700 });
    await X.pg.evaluate(() => { const mk = (id, kcal) => ({ id, ts: id, date: today(), calories: kcal, exs: [] });
      S.sessions = [mk(Date.now() - 3600e3, 1350), mk(Date.now() - 7200e3, 1250)]; persist(); });
    const etroit = await lireTuile();
    t('C-NUM-G1 ⭐ F06 — deux séances aujourd\'hui (250 + 350 kcal) : la tuile dit 600 kcal et « 2 séances »',
      deux.val === '600 kcal' && /2 séances/.test(deux.lbl), _j(deux));
    t('C-NUM-G2 F06 — une séance : 350 kcal et « Séance » ; aucune : « aucune »',
      une.val === '350 kcal' && /^Séance$/.test(une.lbl) && zero.val === 'aucune', _j({ une, zero }));
    t('C-NUM-G3 F06 — rien ne déborde de la tuile, même à 320 px avec 2 600 kcal', !deux.deborde && !etroit.deborde && etroit.val === '2 600 kcal', _j({ deux, etroit }));
    await X.cx.close();
  }

  /* ── C-NUM-H — F23 : l'export PDF distingue les séances des jours d'entraînement ─────────────────────────────── */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const j = n => today(Date.now() - n * 864e5);
      const mk = (id, d, nom) => ({ id, ts: id, date: d, progLabel: nom, exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, done: true, type: 'N' }] }] });
      S.sessions = [mk(Date.now() - 3600e3, today(), 'Matin'), mk(Date.now() - 1800e3, today(), 'Soir'), mk(Date.now() - 3 * 864e5, j(3), 'Pecs')];
      S.sessions.forEach(x => x.exercises = x.exs); _trierSeances(S.sessions); persist();
      return { entete: (typeof _histoEntete === 'function') ? _histoEntete(_histoLignes(false)) : null };
    });
    t('C-NUM-H1 ⭐ F23 — l\'en-tête de l\'export PDF dit 3 séances sur 2 jours d\'entraînement (et non « 2 séances »)',
      r.entete && /3 séances/.test(r.entete) && /2 jours/.test(r.entete), _j(r));
    await X.cx.close();
  }

  /* ── C-NUM-I — F19 : sans sommeil récent, le score de récupération est une estimation ────────────────────────── */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      /* le cas mesuré le 23/10 (F19 « jeune ») : 25 ans, dernière séance il y a 20 jours, aucun sommeil noté → 82 */
      S.age = 25; S.sleepLog = [];
      S.sessions = [{ id: 7001, ts: Date.now() - 20 * 864e5, date: today(Date.now() - 20 * 864e5), uniConv: 1, exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] }];
      persist();
      const d = calcRecoveryDetail(); const info = getRecoveryInfo(d.score, d.sansSommeil);
      renderHome(); const hero = ((document.getElementById('home-hero') || document.body).textContent || '').replace(/\s+/g, ' ');
      const ctx = buildCoachContext('bonjour');
      const milo = (ctx.split('\n').filter(l => /Implication entraînement|Score récupération|Conseil récupération/.test(l))).join(' | ');
      // avec un sommeil récent (8 h la nuit dernière, 8 h les deux précédentes), rien ne change
      const t0 = Date.now(); S.sleepLog = [0, 1, 2].map(k => ({ date: today(t0 - k * 864e5), hours: 8, quality: 4 })); persist();
      const d2 = calcRecoveryDetail(); const info2 = getRecoveryInfo(d2.score, d2.sansSommeil);
      const ctx2 = buildCoachContext('bonjour');
      const milo2 = (ctx2.split('\n').filter(l => /Implication entraînement|Conseil récupération/.test(l))).join(' | ');
      return { score: d.score, sans: d.sansSommeil, info, milo, hero: hero.slice(0, 400), score2: d2.score, sans2: d2.sansSommeil, info2, milo2 };
    });
    t('C-NUM-I1 ⭐ F19 — sans sommeil récent, même à 82 : le conseil se dit « estimation » et n\'encourage pas à tenter des records',
      r.sans === true && r.score >= 80 && /estim/i.test(r.info.rec) && !/record|PR/i.test(r.info.rec), _j({ score: r.score, rec: r.info.rec, label: r.info.label }));
    t('C-NUM-I2 F19 — le libellé ne présente pas le score comme une certitude (« estimé »)', /estim/i.test(r.info.label), r.info.label);
    t('C-NUM-I3 ⭐ F19 — Milo ne lit plus « JOUR IDÉAL pour PRs » un jour sans sommeil noté', !/JOUR IDÉAL|PRs/i.test(r.milo) && /estim/i.test(r.milo), r.milo.slice(0, 300));
    t('C-NUM-I5 F19 — l\'Accueil non plus : pas d\'invitation aux records sans sommeil noté', !/record/i.test(r.hero) && /estim/i.test(r.hero), r.hero.slice(0, 260));
    t('C-NUM-I4 F19 — avec un sommeil récent, rien ne change : textes et consigne de Milo d\'origine',
      r.sans2 === false && !/estim/i.test(r.info2.rec + r.info2.label) && (r.score2 < 80 || /records/.test(r.info2.rec)) && !/estim/i.test(r.milo2),
      _j({ score: r.score2, info: r.info2, milo: r.milo2.slice(0, 200) }));
    await X.cx.close();
  }

  /* ── C-NUM-J — F22 : les activités de la montre gardent leur nom, sans barème inventé ────────────────────────── */
  {
    const X = await ouvrir();
    const r = await X.pg.evaluate(() => {
      const types = ['Walking', 'Marche à pied', 'Running', 'Course à pied', 'Swimming', 'Treadmill', 'Tapis de course', 'Indoor Cycling', 'Rowing', 'Elliptical', 'Yoga'].map(n => [n, _typeCardioDepuisMontre(n)]);
      const c = { type: _typeCardioDepuisMontre('Walking'), intensity: 'modere', duration: 30 };
      const kcalMarche = calcCardioKcal(c), kcalAutre = calcCardioKcal({ type: 'autre', intensity: 'modere', duration: 30 });
      // le détail d'une séance avec ce cardio : le choix affiché doit être « Marche », pas « Elliptique »
      const ts = Date.now() - 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), exs: [], cardio: c }]; persist(); openSessDetail(ts);
      const sel = [...document.querySelectorAll('#sd-content select')].find(x => (x.getAttribute('onchange') || '').indexOf("'type'") > 0 && (x.getAttribute('onchange') || '').indexOf("'apres'") > 0);
      const affiche = sel ? sel.options[sel.selectedIndex].textContent : null;
      return { types, clair: _cardioClair(c), kcalMarche, kcalAutre, affiche };
    });
    const T = Object.fromEntries(r.types);
    t('C-NUM-J1 ⭐ F22 — « Walking » s\'affiche « Marche 30 min », pas « marche » ni « Autre »', /^Marche 30 min/.test(r.clair), r.clair);
    t('C-NUM-J2 ⛔ F22 — aucun barème inventé : une marche se calcule exactement comme « Autre » (moteur gelé)', r.kcalMarche === r.kcalAutre && r.kcalMarche > 0, r.kcalMarche + ' / ' + r.kcalAutre);
    t('C-NUM-J3 F22 — le détail de la séance montre « Marche », pas « Elliptique »', /Marche/.test(r.affiche || '') && !/Elliptique/.test(r.affiche || ''), r.affiche);
    t('C-NUM-J4 ⭐ F22 — un tapis de course (« Treadmill », « Tapis de course ») va sur le barème « Tapis » qui existe déjà',
      T['Treadmill'] === 'tapis' && T['Tapis de course'] === 'tapis' && T['Running'] === 'course' && T['Walking'] === 'marche' && T['Indoor Cycling'] === 'velo' && T['Yoga'] === 'autre', _j(r.types));
    await X.cx.close();
  }
}

module.exports = { ecran };
