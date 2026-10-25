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
    t('C-NUM-I5 F19 — l\'Accueil non plus : ni « Prêt à performer », ni invitation aux records, sans sommeil noté',
      !/record/i.test(r.hero) && !/Prêt à performer/i.test(r.hero) && /estim/i.test(r.hero), r.hero.slice(0, 260));
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
      // un tapis importé, compté en intensité FORTE (la seule où « Tapis » et « Autre » diffèrent : 9,5 contre 8,0)
      const kcalTapisFort = calcCardioKcal({ type: _typeCardioDepuisMontre('Treadmill'), intensity: 'intense', duration: 30 }),
            kcalAutreFort = calcCardioKcal({ type: 'autre', intensity: 'intense', duration: 30 });
      // le détail d'une séance avec ce cardio : le choix affiché doit être « Marche », pas « Elliptique »
      const ts = Date.now() - 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), exs: [], cardio: c }]; persist(); openSessDetail(ts);
      const sel = [...document.querySelectorAll('#sd-content select')].find(x => (x.getAttribute('onchange') || '').indexOf("'type'") > 0 && (x.getAttribute('onchange') || '').indexOf("'apres'") > 0);
      const affiche = sel ? sel.options[sel.selectedIndex].textContent : null;
      return { types, clair: _cardioClair(c), kcalMarche, kcalAutre, affiche, kcalTapisFort, kcalAutreFort };
    });
    const T = Object.fromEntries(r.types);
    t('C-NUM-J1 ⭐ F22 — « Walking » s\'affiche « Marche 30 min », pas « marche » ni « Autre »', /^Marche 30 min/.test(r.clair), r.clair);
    t('C-NUM-J2 ⛔ F22 — aucun barème inventé : une marche se calcule exactement comme « Autre » (moteur gelé)', r.kcalMarche === r.kcalAutre && r.kcalMarche > 0, r.kcalMarche + ' / ' + r.kcalAutre);
    t('C-NUM-J3 F22 — le détail de la séance montre « Marche », pas « Elliptique »', /Marche/.test(r.affiche || '') && !/Elliptique/.test(r.affiche || ''), r.affiche);
    /* ↪️ RÉÉCRIT 25/10 (retour de Claude Principal) : J4 exigeait « Treadmill » → barème « Tapis ». C'était un changement de
       CALORIES (intensité forte 9,5 au lieu de 8,0) fait sans décision de Michel, et contraire à D-119 (« calculés comme Autre »)
       et au témoin XXXII du runner. J4 garde maintenant l'INVARIANT : un tapis importé coûte ce qu'il coûtait en ft-v1260. */
    t('C-NUM-J4 ⛔ F22 — un tapis de course (« Treadmill », « Tapis de course ») reste « course » : ses calories restent celles de ft-v1260 (comme « Autre », même en intensité forte) — le barème « Tapis » est à Michel (D-119)',
      T['Treadmill'] === 'course' && T['Tapis de course'] === 'course' && T['Running'] === 'course' && T['Walking'] === 'marche' && T['Indoor Cycling'] === 'velo' && T['Yoga'] === 'autre'
      && r.kcalTapisFort === r.kcalAutreFort && r.kcalTapisFort > 0, _j({ types: r.types, fort: [r.kcalTapisFort, r.kcalAutreFort] }));
    await X.cx.close();
  }

  /* ══ LOT 3 — RECORDS ET MUSCLES ═══════════════════════════════════════════════════════════════════════════════════
     ── C-REC — F08 : un record qui venait d'une séance supprimée ou modifiée → aperçu, rien sans le geste de la personne ── */
  const E = 'Développé Couché';
  const recBase = (X, opts) => X.pg.evaluate(o => {
    const j = n => today(Date.now() - n * 864e5), TA = Date.now() - 5 * 864e5, TB = Date.now() - 2 * 864e5;
    const A = { id: TA, ts: TA, date: j(5), uniConv: 1, exs: [{ name: 'Développé Couché', sets: [{ kg: 60, reps: 5, done: true, type: 'N' }] }] };
    const B = { id: TB, ts: TB, date: j(2), uniConv: 1, exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] };
    S.sessions = o.seul ? [B] : [A, B]; S.sessions.forEach(x => { x.exercises = x.exs; x.volume = Math.round(_workVol(x)); }); _trierSeances(S.sessions);
    S.prs = { 'Développé Couché': o.pr || { kg: 100, reps: 5, rm1: bz(100, 5), date: j(2) } }; persist();
    return { TA, TB, jA: j(5), jB: j(2) };
  }, opts || {});
  const confirmVu = X => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm');
    return { ouvert: o.classList.contains('open'), titre: document.getElementById('confirm-title').textContent, msg: document.getElementById('confirm-msg').textContent }; });
  const supprimer = async (X, ts) => { await X.pg.evaluate(ts => openSessDetail(ts), ts);
    await X.pg.evaluate(() => { document.getElementById('sd-del-btn').click(); document.getElementById('sd-del-btn').click(); }); };
  const repondre = (X, oui) => X.pg.evaluate(oui => document.getElementById(oui ? 'confirm-ok' : 'confirm-cancel').click(), oui);
  const pr = X => X.pg.evaluate(() => { const p = JSON.parse(localStorage.getItem('ft4_prs') || '{}')['Développé Couché']; return p ? { kg: p.kg, reps: p.reps, date: p.date } : null; });
  {
    const X = await ouvrir();
    const f = await recBase(X);
    await supprimer(X, f.TB);
    const c = await confirmVu(X); const avant = await pr(X);
    t('C-REC-A1 ⭐ F08 — la séance du record (100 × 5) supprimée : un aperçu « avant → après » s\'ouvre (100 kg × 5 → 60 kg × 5)',
      c.ouvert && /record/i.test(c.titre) && /100 kg × 5/.test(c.msg) && /60 kg × 5/.test(c.msg), _j(c));
    t('C-REC-A2 ⛔ F08 — rien n\'a changé tant que la personne n\'a pas répondu', avant && avant.kg === 100, _j(avant));
    await repondre(X, false);
    t('C-REC-A3 F08 — « Garder » : le record reste 100 × 5', _j(await pr(X)) === _j({ kg: 100, reps: 5, date: f.jB }), _j(await pr(X)));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const f = await recBase(X);
    await supprimer(X, f.TB); await repondre(X, true);
    t('C-REC-B1 ⭐ F08 — « Mettre à jour » : le record redevient le meilleur de l\'historique (60 × 5, sa date)', _j(await pr(X)) === _j({ kg: 60, reps: 5, date: f.jA }), _j(await pr(X)));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const f = await recBase(X);
    await X.pg.evaluate(ts => openSessDetail(ts), f.TB);
    await champ(X, 0, 0, 'kg', '80');
    await enregistrer(X);
    const c = await confirmVu(X);
    await repondre(X, true);
    t('C-REC-C1 ⭐ F08 — la série du record corrigée à la baisse (100 → 80) : aperçu, puis record 80 × 5',
      c.ouvert && /100 kg × 5/.test(c.msg) && /80 kg × 5/.test(c.msg) && _j(await pr(X)) === _j({ kg: 80, reps: 5, date: f.jB }), _j({ c, pr: await pr(X) }));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const f = await recBase(X, { pr: { kg: 120, reps: 5, rm1: 135, date: '2026-01-15' } });   // record d'ailleurs (import ancien) : origine incertaine
    await supprimer(X, f.TB);
    const c = await confirmVu(X);
    t('C-REC-D1 ⛔ F08 — un record dont l\'origine est incertaine (autre date, importé) : aucun aperçu, il reste intact',
      !c.ouvert && _j(await pr(X)) === _j({ kg: 120, reps: 5, date: '2026-01-15' }), _j({ c, pr: await pr(X) }));
    await X.cx.close();
  }
  {
    // le MÊME 100 × 5 que le record, mais le record est daté d'un autre jour dont la séance n'est plus là (import ancien) :
    // la séance supprimée l'a seulement ÉGALÉ — l'origine reste incertaine, donc rien n'est proposé (la date fait foi)
    const X = await ouvrir();
    const f = await recBase(X, { pr: { kg: 100, reps: 5, rm1: 112.5, date: '2026-01-15' } });
    await supprimer(X, f.TB);
    const c = await confirmVu(X);
    t('C-REC-D2 ⛔ F08 — la séance supprimée a seulement ÉGALÉ un record daté d\'un autre jour (100 × 5) : aucun aperçu, il reste intact',
      !c.ouvert && _j(await pr(X)) === _j({ kg: 100, reps: 5, date: '2026-01-15' }), _j({ c, pr: await pr(X) }));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const f = await recBase(X, { seul: true });
    await supprimer(X, f.TB);
    const c = await confirmVu(X);
    await repondre(X, false);
    const garde = await pr(X);
    t('C-REC-E1 F08 — la seule séance de l\'exercice supprimée : l\'aperçu le dit (« aucune autre séance »), « Garder » garde le record',
      c.ouvert && /aucune autre séance/.test(c.msg) && garde && garde.kg === 100, _j({ c, garde }));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const f = await recBase(X);
    await X.pg.evaluate(ts => openSessDetail(ts), f.TB);
    await champ(X, 0, 0, 'reps', '6');
    await enregistrer(X);
    const c = await confirmVu(X);
    t('C-REC-F1 F08 — la série du record AMÉLIORÉE (100 × 6) : le record monte comme avant, aucun aperçu',
      !c.ouvert && _j(await pr(X)) === _j({ kg: 100, reps: 6, date: f.jB }), _j({ c, pr: await pr(X) }));
    t('C-REC-F2 aucune erreur de page', X.errs.length === 0, X.errs.join(' | '));
    await X.cx.close();
  }
  {
    // le même 100 × 5 fait deux jours différents ; le record est daté du PREMIER : supprimer le second ne le touche pas
    const X = await ouvrir();
    const f = await X.pg.evaluate(() => {
      const j = n => today(Date.now() - n * 864e5), TA = Date.now() - 5 * 864e5, TB = Date.now() - 2 * 864e5;
      const mk = (ts, d) => ({ id: ts, ts, date: d, uniConv: 1, exs: [{ name: 'Développé Couché', sets: [{ kg: 100, reps: 5, done: true, type: 'N' }] }] });
      S.sessions = [mk(TA, j(5)), mk(TB, j(2))]; S.sessions.forEach(x => { x.exercises = x.exs; }); _trierSeances(S.sessions);
      S.prs = { 'Développé Couché': { kg: 100, reps: 5, rm1: bz(100, 5), date: j(5) } }; persist(); return { TB, jA: j(5) };
    });
    await supprimer(X, f.TB);
    const c = await confirmVu(X);
    t('C-REC-G1 ⛔ F08 — le même 100 × 5 refait un autre jour : supprimer la séance qui ne porte PAS la date du record ne propose rien',
      !c.ouvert && _j(await pr(X)) === _j({ kg: 100, reps: 5, date: f.jA }), _j({ c, pr: await pr(X) }));
    await X.cx.close();
  }

  /* Ces deux blocs (lots 3 et 4) s'exécutent aussi sur le code d'AVANT : une fonction qui n'y existe pas encore rend le
     témoin ROUGE, avec sa raison, au lieu d'arrêter le banc (chaque correction doit être VUE rouge sur master). */
  const ev = (X, fn, arg) => X.pg.evaluate(fn, arg).catch(e => ({ __erreur: String(e && e.message || e).slice(0, 200) }));
  const sur = f => { try { return !!f(); } catch (e) { return false; } };
  const voir = f => { try { return f(); } catch (e) { return 'erreur : ' + (e && e.message); } };
  /* ── C-MUS — F04 : moteur ≠ sollicité · F05 : les muscles cochés d'un perso d'abord ────────────────────────────── */
  {
    const X = await ouvrir();
    const r = await ev(X, () => {
      const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
      const sec = noms.filter(n => { const m = exMuscles(exNomCatalogue(n)); return m && (m.s || []).includes('triceps') && !(m.p || []).includes('triceps'); }).slice(0, 2);
      const exs = n => n.map(x => ({ name: x, sets: [{ kg: 50, reps: 8, done: true, type: 'N' }] }));
      const rouges = o => (_mscSVGmini(o).match(/#FF5555/g) || []).length;
      const deux = _mscScoresVus(exs(sec)), un = _mscScoresVus(exs(sec.slice(0, 1)));
      showMuscleMap(exs(sec), null);
      const liste = document.getElementById('mm-list').textContent;
      if (typeof closeMuscleMap === 'function') closeMuscleMap();
      return { sec, score: deux.sc.triceps, rougesDeux: rouges(deux), rougesUn: rouges(un), liste: liste.replace(/\s+/g, ' ').slice(0, 220),
        pecRouge: (_mscSVGmini(_mscScoresVus(exs(['Développé Couché']))).match(/#FF5555/g) || []).length };
    });
    const prim = voir(() => (r.liste.match(/Primaires\s*:\s*([^●]*)/) || ['', ''])[1]);
    t('C-MUS-A1 ⭐ F04 — un muscle secondaire de deux exercices (triceps, score 2) n\'est pas listé « Primaires »',
      sur(() => r.sec.length === 2 && r.score === 2 && !/Triceps/i.test(prim)), voir(() => _j({ sec: r.sec, prim })));
    t('C-MUS-A2 F04 — il est listé « Secondaires » avec le nombre d\'exercices qui le sollicitent (« ×2 »)', sur(() => /Secondaires[^●]*Triceps[^●]*×2/i.test(r.liste)), voir(() => r.liste));
    t('C-MUS-A3 ⭐ F04 — la figurine ne rougit pas un secondaire cumulé : autant de zones rouges avec deux exercices qu\'avec un',
      sur(() => r.rougesDeux === r.rougesUn && r.rougesUn > 0), voir(() => _j({ deux: r.rougesDeux, un: r.rougesUn })));
    t('C-MUS-A4 F04 — un vrai moteur reste rouge (pectoraux au développé couché)', sur(() => r.pecRouge > 0), voir(() => _j(r.pecRouge)));
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    const r = await ev(X, () => {
      S.customExercises = [{ n: 'Curl Maison Zorglub', g: 'Bras', muscles: { p: ['quads'], s: [] } },
        { n: 'Rowing Zorglub', g: 'Dos', muscles: { p: ['lats'], s: ['biceps'] } }, { n: 'Rowing Sans Muscles', g: 'Dos' }];
      persist();
      const sc = n => _mscScoresVus([{ name: n, sets: [{ kg: 20, reps: 10, done: true, type: 'N' }] }]);
      const curl = sc('Curl Maison Zorglub'), rowing = sc('Rowing Zorglub');
      const ts = Date.now() - 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), uniConv: 1, exs: [{ name: 'Curl Maison Zorglub', sets: [{ kg: 20, reps: 10, done: true, type: 'N' }] }] }]; persist();
      const vol = _volumeParMuscle(Date.now(), 14).liste.map(l => l.code);
      const metRowing = getExerciseMET('Rowing Zorglub');
      // le même perso SANS ses muscles cochés : le moteur des calories doit donner exactement la même classe
      const sauve = S.customExercises[1].muscles; delete S.customExercises[1].muscles; const metRowingSansCoches = getExerciseMET('Rowing Zorglub'); S.customExercises[1].muscles = sauve;
      return { curl: { prim: Object.keys(curl.prim || {}), sc: curl.sc }, rowing: { prim: Object.keys(rowing.prim || {}), sc: rowing.sc }, vol,
        metRowing, metRowingSansCoches, metSans: getExerciseMET('Rowing Sans Muscles'), metCatalogue: getExerciseMET('Rowing Barre') };
    });
    t('C-MUS-B1 ⭐ F05 — un perso « Curl Maison Zorglub » coché quadriceps : la figurine dit quadriceps, plus biceps',
      sur(() => _j(r.curl.prim) === _j(['quads']) && !r.curl.sc.biceps), voir(() => _j(r.curl)));
    t('C-MUS-B2 F05 — la figurine et Progrès disent la même chose (quadriceps)', sur(() => _j(r.vol) === _j(['quads'])), voir(() => _j(r.vol)));
    /* ↪️ RÉÉCRIT LE 24/10 (D-122, isolation de F05) : il exigeait que les calories suivent les muscles cochés (4 au lieu de 5,5).
       Le moteur des calories est gelé (§8.3) et l'écart doit être montré à Michel AVANT d'être appliqué : la figurine suit
       les muscles cochés, les calories gardent la règle du nom. Contrôle négatif : M45 et M46 le font rougir. */
    t('C-MUS-B3 ⛔ F05 — les CALORIES ne bougent pas : « Rowing Zorglub » coché 2 muscles garde la classe de son nom (5,5), avec ou sans ses muscles cochés, pendant que sa figurine montre SES muscles (dos, biceps)',
      sur(() => r.metRowing === 5.5 && r.metRowingSansCoches === 5.5 && r.metSans === 5.5 && _j(r.rowing.prim) === _j(['lats']) && r.rowing.sc.biceps === 1 && Object.keys(r.rowing.sc).length === 2),
      voir(() => _j({ coche: r.metRowing, sansCoches: r.metRowingSansCoches, sansMuscles: r.metSans, figurine: r.rowing })));
    await X.cx.close();
  }
  {
    /* F05, le cas le plus traître : un perso dont le NOM se résout sur une fiche du catalogue. La personne a coché d'autres
       muscles : c'est son choix qui compte, partout (figurine ET Progrès). */
    const X = await ouvrir();
    const r = await ev(X, () => {
      // la forme ABRÉGÉE d'un nom du catalogue (« Hip Thrust Barre » pour « Hip Thrust Barre (Poussée de Hanche) »), qui se
      // résout sur sa fiche ; la personne y coche les mollets, absents de la fiche
      // ↪️ RÉÉCRIT 24/10 (clôture) : la fiche doit être un exercice COMPOSÉ dont le MET dépend VRAIMENT des muscles (pas de
      // mot-clé haltéro / cardio / porté, pas de charnière de hanche, ≥ 3 muscles). Le 1ᵉʳ nom trouvé avant était « Croisé
      // Poulie », une isolation (4,0) : un mollet coché seul reste une isolation (4,0) — C-MUS-B5 ne pouvait PAS rougir, et
      // la mutation M68 (le moteur lit les muscles cochés avant la fiche) l'a montré. Ici, un mollet seul ferait tomber le MET.
      const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
      const motCle = n => OLYMPIC_KW.concat(CARDIO_KW).some(k => n.toLowerCase().includes(k.toLowerCase())) || /farmer|fermier|\bcarry\b|porte lourd|suitcase carry/i.test(n);
      const plein = noms.find(n => / \(/.test(n) && exNomCatalogue(n.split(' (')[0]) === n && exMuscles(n) && (exMuscles(n).p || []).length && (exMuscles(n).p || []).concat(exMuscles(n).s || []).indexOf('calves') < 0
        && !motCle(n) && _movPattern(n) !== 'hip-hinge' && (exMuscles(n).p || []).concat(exMuscles(n).s || []).length >= 3);
      const nom = plein.split(' (')[0], fiche = exMuscles(exNomCatalogue(nom));
      S.customExercises = [{ n: nom, g: 'Jambes', muscles: { p: ['calves'], s: [] } }]; persist();
      const o = _mscScoresVus([{ name: nom, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }]);
      const metPerso = getExerciseMET(nom), metFiche = getExerciseMET(plein);
      const ts = Date.now() - 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), uniConv: 1, exs: [{ name: nom, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }] }]; persist();
      return { nom, ficheCatalogue: fiche && fiche.p, prim: Object.keys(o.prim || {}), vol: _volumeParMuscle(Date.now(), 14).liste.map(l => l.code), metPerso, metFiche, metIso: MET_ISO };
    });
    t('C-MUS-B4 ⭐ F05 — un perso dont le nom se résout sur une fiche du catalogue : SES muscles cochés (mollets) passent avant la fiche, figurine et Progrès',
      sur(() => Array.isArray(r.ficheCatalogue) && r.ficheCatalogue.length > 0 && r.ficheCatalogue.indexOf('calves') < 0 && _j(r.prim) === _j(['calves']) && _j(r.vol) === _j(['calves'])), voir(() => _j(r)));
    t('C-MUS-B5 ⛔ F05 — … et ses CALORIES restent celles de la fiche du catalogue (le moteur gelé ignore les muscles cochés d\'un nom reconnu)',
      sur(() => r.metPerso === r.metFiche && r.metFiche > r.metIso), voir(() => _j({ nom: r.nom, perso: r.metPerso, fiche: r.metFiche, isolation: r.metIso })));
    await X.cx.close();
  }
  {
    /* F05, les JUMELLES (R8) : la figurine de la carte de l'historique — un des 16 endroits qui dessinent ou listent les muscles —
       suit les muscles cochés d'un perso, comme le détail et Progrès. Elle ne rougit que les mollets cochés. */
    const X = await ouvrir();
    const r = await ev(X, () => {
      const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
      const plein = noms.find(n => / \(/.test(n) && exNomCatalogue(n.split(' (')[0]) === n && exMuscles(n) && (exMuscles(n).p || []).length && (exMuscles(n).p || []).concat(exMuscles(n).s || []).indexOf('calves') < 0);
      const nom = plein.split(' (')[0], fiche = exMuscles(plein);
      // un muscle DESSINÉ sur la vue de face (la carte montre la face) et absent de la fiche : c'est lui que la personne coche
      const devant = g => _FP.some(([id]) => id && _MG[g].paths.indexOf(id) >= 0);
      const coche = Object.keys(_MG).find(g => devant(g) && (fiche.p || []).concat(fiche.s || []).indexOf(g) < 0);
      S.customExercises = [{ n: nom, g: 'Autres', muscles: { p: [coche], s: [] } }];
      const ts = Date.now() - 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), uniConv: 1, exs: [{ name: nom, sets: [{ kg: 60, reps: 10, done: true, type: 'N' }] }] }]; persist();
      goScreen('progress'); if (typeof switchProgTab === 'function') switchProgTab('seances'); renderSessions();
      const svg = document.querySelector('#sess-list .sess-card [onclick^="showSessMuscleMap"] svg');
      const attendus = _FP.filter(([id]) => id && _MG[coche].paths.indexOf(id) >= 0).length;
      return { nom, coche, carte: !!svg, rouges: svg ? (svg.outerHTML.match(/#FF5555/g) || []).length : -1, attendus };
    });
    t('C-MUS-C2 ⭐ F05 — la carte de l\'historique dessine le muscle COCHÉ du perso (en rouge, et rien d\'autre — pas la fiche du catalogue)',
      sur(() => r.carte && r.attendus > 0 && r.rouges === r.attendus), voir(() => _j(r)));
    t('C-MUS-C3 aucune erreur de page', sur(() => X.errs.length === 0), voir(() => X.errs.join(' | ')));
    await X.cx.close();
  }
  {
    /* ⛔⛔ PÉRIMÈTRE (F05, D-122) : le moteur des calories est GELÉ (docs/CHANTIER-NUTRITION-SEANCE.md §8.3). `_mscScores`
       garde exactement 4 appelants — `getExerciseMET` (les calories), `_mscScoresVus` (qui lui délègue un exercice sans muscles
       cochés), `_cexSeraitMuet` (« le NOM seul donne-t-il des muscles ? ») et `chargeLeDos` (un avertissement de prudence).
       Tout ce qui DESSINE ou LISTE passe par `_mscScoresVus`. Un 5ᵉ appelant = un écran qui a perdu les muscles cochés, ou un
       calcul qui les a gagnés en silence. Les fichiers sont lus tels que l'app les sert. */
    const X = await ouvrir();
    const r = await ev(X, async () => {
      const src = [...new Set([...document.scripts].map(x => x.getAttribute('src')).filter(u => u && !/^https?:|^\/\/|^lib\//.test(u)).map(u => u.replace(/\?.*$/, '')).concat(['dashboard.js']))];
      const appels = [];
      for (const f of src) {
        const txt = await (await fetch(f)).text();
        txt.split('\n').forEach((l, i) => { if (/(^|[^\w$.])_mscScores\(/.test(l) && !/function _mscScores\(/.test(l)) appels.push(f + ':' + (i + 1)); });
      }
      const parFichier = {}; appels.forEach(a => { const f = a.split(':')[0]; parFichier[f] = (parFichier[f] || 0) + 1; });
      return { lus: src.length, appels, parFichier };
    });
    t('C-MUS-C1 ⛔⛔ PÉRIMÈTRE — `_mscScores` (moteur des calories, gelé) garde ses 4 appelants : app.js ×1 (getExerciseMET), log.js ×3 ; rien d\'autre ne le lit',
      sur(() => r.lus >= 6 && r.appels.length === 4 && r.parFichier['app.js'] === 1 && r.parFichier['log.js'] === 3), voir(() => _j(r)));
    await X.cx.close();
  }

  /* ══ LOT 4 — RÉGLAGES DEPUIS LA SÉANCE ═════════════════════════════════════════════════════════════════════════════
     ── C-REG — le repos par défaut : UNE valeur (`S.defRest`), deux portes (Profil · menu ⋯ de la séance), un écrivain ──
     Conduit : le vrai Profil (`renderSetup`, le sélecteur, « Enregistrer »), le vrai menu ⋯ (`openWktMenu`, la ligne
     « Repos par défaut », ses boutons), la vraie validation d'une série (`toggleSet`, qui lance le repos).
     Observe : `S.defRest`, `ft4_rest`, le sélecteur du Profil, la feuille du menu, la durée du repos lancé (`restTot`), les
     séances passées (`ft4_sessions`), la place du « + » central (règle d'or #9).
     Ne couvre pas : l'iPhone réel, la synchro serveur (coupée), le poids de la barre (retiré exprès, ft-v726 : son absence
     est figée par la passe). */
  const seanceOuverte = X => ev(X, () => {
    S.wkt = { date: today(), startTs: Date.now() - 10 * 60000, startHour: 17,
      exs: [{ name: 'Squat Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }, { kg: 100, reps: 5, done: false, type: 'N' }] },
            { name: 'Développé Couché', sets: [{ kg: 60, reps: 8, done: false, type: 'N' }] }] };
    persist(); goScreen('log'); renderLog();
  });
  const profil = X => ev(X, () => { goScreen('setup'); renderSetup(); const el = document.getElementById('rest-sel');
    return { val: el.value, idx: el.selectedIndex, vu: el.selectedIndex >= 0 ? el.options[el.selectedIndex].textContent : '(vide)', opts: [...el.options].map(o => o.value) }; });
  {
    const X = await ouvrir();
    const a = await profil(X);
    t('C-REG-A1 ⭐ le Profil montre le VRAI repos par défaut (130 s, celui de l\'installation) — il s\'affichait vide',
      sur(() => a.val === '130' && a.idx >= 0 && /130/.test(a.vu)), voir(() => _j(a)));
    await ev(X, () => { localStorage.setItem('ft4_rest', '75'); S.defRest = 75; });
    const b = await profil(X);
    t('C-REG-A2 ⛔ une valeur hors liste (75 s, restaurée d\'un ancien appareil) est montrée telle quelle, jamais remplacée',
      sur(() => b.val === '75' && /75/.test(b.vu) && b.opts.indexOf('75') >= 0), voir(() => _j(b)));
    await ev(X, () => { S.defRest = 130; persist(); });
    await X.cx.close();
  }
  {
    const X = await ouvrir();
    await seanceOuverte(X);
    const passe = await ev(X, () => { const ts = Date.now() - 3 * 864e5;
      S.sessions = [{ id: ts, ts, date: today(ts), uniConv: 1, duration: 3000, calories: 250, exs: [{ name: 'Squat Barre', sets: [{ kg: 90, reps: 5, done: true, type: 'N' }] }] }];
      persist(); return localStorage.getItem('ft4_sessions'); });
    const fab = () => ev(X, () => { const r = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); });
    const fab0 = await fab();
    const m = await ev(X, () => { openWktMenu(); const row = document.getElementById('wm-repos');
      return { ligne: !!row, valeur: row ? row.querySelector('.wm-v').textContent : '', texte: row ? row.textContent.replace(/\s+/g, ' ').trim() : '' }; });
    t('C-REG-B1 ⭐ le menu ⋯ de la séance a « Repos par défaut », avec la valeur en cours (2:10)',
      sur(() => m.ligne && m.valeur === '2:10' && /Profil/.test(m.texte)), voir(() => _j(m)));
    const f = await ev(X, () => { document.getElementById('wm-repos').click();
      const sh = document.querySelector('#ov-wkt-menu .wm-sheet'); const on = sh.querySelector('.wm-on');
      return { titre: sh.querySelector('.wm-h b').textContent, choix: [...sh.querySelectorAll('.wm-g .wm-row')].map(b => b.textContent.replace(/\s+/g, '').replace('✓', '')), coche: on ? on.textContent.replace(/\s+/g, '').replace('✓', '') : '' }; });
    t('C-REG-B2 la feuille propose la même liste que le Profil, la valeur en cours cochée (2:10)',
      sur(() => f.titre === 'Repos par défaut' && f.coche === '2:10' && _j(f.choix) === _j(['1:00', '1:30', '2:00', '2:10', '3:00', '5:00'])), voir(() => _j(f)));
    await ev(X, () => { const b = [...document.querySelectorAll('#ov-wkt-menu .wm-g .wm-row')].find(x => /1:30/.test(x.textContent)); b.click(); });
    const apres = await ev(X, () => ({ defRest: S.defRest, ls: localStorage.getItem('ft4_rest'), ouvert: document.getElementById('ov-wkt-menu').classList.contains('open'), toast: (window.__T || []).slice(-1)[0] || '' }));
    t('C-REG-B3 ⭐ choisir 1:30 dans la séance règle LA préférence : 90 s en mémoire et sur l\'appareil, le menu se ferme, c\'est dit',
      sur(() => apres.defRest === 90 && apres.ls === '90' && !apres.ouvert && /1:30/.test(apres.toast) && /Profil/.test(apres.toast)), voir(() => _j(apres)));
    const p = await profil(X);
    t('C-REG-B4 ⭐ UNE SEULE SOURCE — le Profil montre aussitôt 90 s', sur(() => p.val === '90'), voir(() => _j(p)));
    const ret = await ev(X, () => { goScreen('log'); renderLog(); openWktMenu(); document.getElementById('wm-repos').click();
      const sh = document.querySelector('#ov-wkt-menu .wm-sheet'); const choix = [...sh.querySelectorAll('.wm-g .wm-row')].map(x => x.textContent.replace(/\s+/g, '').replace('✓', ''));
      closeWktMenu(); return { choix, profil: (goScreen('setup'), renderSetup(), [...document.getElementById('rest-sel').options].map(o => o.value)) }; });
    t('C-REG-B9 ⛔ à 90 s, on peut toujours revenir à la valeur d\'installation : 2:10 reste proposé, dans la séance ET dans le Profil',
      sur(() => ret.choix.indexOf('2:10') >= 0 && ret.profil.indexOf('130') >= 0 && ret.choix.length === 6), voir(() => _j(ret)));
    await ev(X, () => { goScreen('log'); renderLog(); });
    const r = await ev(X, () => { toggleSet(0, 0); const tot = restTot; stopRest(); return tot; });
    t('C-REG-B5 ⭐ la série suivante lance bien un repos de 90 s (le chrono lit la même valeur)', sur(() => r === 90), voir(() => String(r)));
    const fab1 = await fab();
    t('C-REG-B6 ⛔ règle d\'or #9 — le « + » central n\'a pas bougé (menu ouvert, choix, fermeture)', sur(() => fab0 === fab1 && fab0 !== '0,0,0,0'), voir(() => fab0 + ' → ' + fab1));
    const passeApres = await ev(X, () => localStorage.getItem('ft4_sessions'));
    t('C-REG-B7 ⛔ les séances passées ne changent pas (ft4_sessions identique à l\'octet)', sur(() => typeof passe === 'string' && passeApres === passe), voir(() => ''));
    t('C-REG-B8 aucune erreur de page', sur(() => X.errs.length === 0), voir(() => X.errs.join(' | ')));
    await X.cx.close();
  }
  {
    // le réglage d'une SÉANCE reste distinct de la préférence générale (consigne de Michel)
    const X = await ouvrir();
    await seanceOuverte(X);
    const r = await ev(X, () => {
      S.exRestPref = { 'Développé Couché': 75 }; persist();
      toggleSet(0, 0); const enCours = restTot;                // un repos tourne (130 s, le défaut)
      openWktMenu(); document.getElementById('wm-repos').click();
      const note = (document.querySelector('#ov-wkt-menu .wm-note') || {}).textContent || '';
      const b = [...document.querySelectorAll('#ov-wkt-menu .wm-g .wm-row')].find(x => /3:00/.test(x.textContent)); b.click();
      const pendant = restTot; stopRest();
      toggleSet(1, 0); const propre = restTot; stopRest();
      return { enCours, pendant, propre, pref: S.exRestPref['Développé Couché'], defRest: S.defRest, note };
    });
    t('C-REG-C1 ⛔ changer le repos par défaut ne touche pas au repos EN COURS (130 s restent 130 s)', sur(() => r.enCours === 130 && r.pendant === 130 && r.defRest === 180), voir(() => _j(r)));
    t('C-REG-C2 ⛔ … ni à la durée qu\'un exercice a reçue pendant un repos (le développé couché garde ses 75 s)', sur(() => r.propre === 75 && r.pref === 75), voir(() => _j(r)));
    t('C-REG-C3 la feuille le dit : « 1 exercice de cette séance garde sa propre durée »', sur(() => /1 exercice de cette séance garde sa propre durée/.test(r.note)), voir(() => r.note));
    const p = await profil(X);
    t('C-REG-C4 et le Profil suit (180 s)', sur(() => p.val === '180'), voir(() => _j(p)));
    await X.cx.close();
  }
  {
    /* Règle d'or #11 pour « Repos par défaut » dans ⋯ (une porte nouvelle) — et l'aide reste joignable PENDANT la séance :
       la barre du haut (et son « ? ») cède la place à « Séance en cours », l'aide passe par ⋯ → « Aide de l'écran Séance ». */
    const X = await ouvrir();
    await seanceOuverte(X);
    const r = await ev(X, () => {
      openWktMenu();
      const aide = [...document.querySelectorAll('#ov-wkt-menu .wm-row')].find(b => /Aide de l'écran Séance/.test(b.textContent));
      if (aide) aide.click();
      const titre = document.getElementById('help-title').textContent, ouverte = document.getElementById('ov-help').classList.contains('open');
      const texte = document.getElementById('help-content').textContent.replace(/\s+/g, ' ');
      closeHelp();
      const point = (NEW_FEATURES || []).find(f => f.id === 'repos-defaut-seance');
      const guide = (APP_GUIDE_SLIDES || []).map(x => x.cap || '').join(' ');
      return { aide: !!aide, titre, ouverte, porte: /⋯ \(pause, date, repos par défaut,/.test(texte), timer: /N = ton repos par défaut/.test(texte) && !/N = 2:10/.test(texte),
        point: !!point && point.screen === 'log', guide: /Repos par défaut/.test(guide) };
    });
    t('C-REG-E1 ⭐ pendant la séance, l\'aide de l\'écran se joint par ⋯ → « Aide de l\'écran Séance » (elle s\'ouvre sur « ⚡ Séance »)',
      sur(() => r.aide && r.ouverte && r.titre === '⚡ Séance'), voir(() => _j(r)));
    t('C-REG-E2 règle d\'or #11 — l\'aide « ? » cite « repos par défaut » dans ⋯ et ne fige plus « N = 2:10 » ; point rouge et diapo du Guide le disent',
      sur(() => r.porte && r.timer && r.point && r.guide), voir(() => _j(r)));
    await X.cx.close();
  }
  {
    // l'autre sens : Profil → séance, par le vrai « Enregistrer »
    const X = await ouvrir();
    await profil(X);
    const r = await ev(X, () => { const el = document.getElementById('rest-sel'); el.value = '60'; el.dispatchEvent(new Event('change', { bubbles: true }));
      saveProfile(); return { defRest: S.defRest, ls: localStorage.getItem('ft4_rest') }; });
    await seanceOuverte(X);
    const v = await ev(X, () => { openWktMenu(); const row = document.getElementById('wm-repos'); return row ? row.querySelector('.wm-v').textContent : ''; });
    t('C-REG-D1 ⭐ UNE SEULE SOURCE, dans l\'autre sens — 60 s enregistrés dans le Profil, le menu de la séance dit 1:00',
      sur(() => r.defRest === 60 && r.ls === '60' && v === '1:00'), voir(() => _j({ r, v })));
    t('C-REG-D2 aucune erreur de page', sur(() => X.errs.length === 0), voir(() => X.errs.join(' | ')));
    await X.cx.close();
  }

  /* ══ LOT 5 — IMAGES ═════════════════════════════════════════════════════════════════════════════════════════════════
     ── C-IMG — « Aucune illustration disponible » au lieu d'une image de muscle DEVINÉE (vignettes de la séance, démonstration) ──
     Conduit : le vrai rendu de la séance (`renderLog`, carte repliée et carte ouverte), la vraie démonstration (`toggleExGif`).
     Observe : ce qui est dessiné à la place de l'illustration, son libellé accessible, la place du « + » central.
     Ne couvre pas : l'iPhone réel ; les icônes des listes d'import et de l'éditeur de programme (hors de ce changement). */
  {
    const X = await ouvrir();
    const r = await ev(X, () => {
      const noms = [...new Set(Object.values(EXLIB).flat().map(e => typeof e === 'string' ? e : (e && (e.n || e.name))).filter(Boolean))];
      const sans = noms.filter(n => !_exImg(n)), avec = noms.find(n => _exImg(n));
      const A = sans[0];
      S.wkt = { date: today(), startTs: Date.now() - 5 * 60000, startHour: 17,
        exs: [{ name: A, sets: [{ kg: 20, reps: 10, done: false, type: 'N' }] }, { name: avec, sets: [{ kg: 40, reps: 8, done: false, type: 'N' }] }] };
      S.expandAll = false; persist(); goScreen('log');
      const fab = () => { const q = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return [q.left, q.top, q.width, q.height].map(Math.round).join(','); };
      const vignette = ei => { const c = document.getElementById('sr-' + ei + '-0'); const bloc = c ? c.closest('.ex-block') || c.parentElement.closest('div') : null;
        const tout = [...document.querySelectorAll('#wkt-exs [onclick^="toggleExGif(' + ei + ',"]')];
        return tout.map(e => ({ tag: e.tagName, src: e.getAttribute('src') || '', label: e.getAttribute('aria-label') || '', w: Math.round(e.getBoundingClientRect().width) })); };
      _expandedEx = 1; renderLog(); const replie = vignette(0), fab1 = fab();
      _expandedEx = 0; renderLog(); const ouvert = vignette(0), autre = vignette(1), fab2 = fab();
      toggleExGif(0, A); const demoA = (document.getElementById('ex-gif-0') || {}).innerHTML || '';
      _expandedEx = 1; renderLog(); toggleExGif(1, avec); const demoB = (document.getElementById('ex-gif-1') || {}).innerHTML || '';
      return { nSans: sans.length, A, avec, imgAvec: _exImg(avec), replie, ouvert, autre, demoA, demoB, fab1, fab2 };
    });
    const muscleDevine = l => (l || []).some(v => /muscles\//.test(v.src));
    t('C-IMG-A1 ⭐ un exercice du catalogue sans illustration (carte repliée) : « Aucune illustration disponible », plus d\'image de muscle devinée',
      sur(() => r.replie.length >= 1 && r.replie.every(v => v.tag === 'SPAN' && v.label === 'Aucune illustration disponible') && !muscleDevine(r.replie)), voir(() => _j({ A: r.A, replie: r.replie })));
    t('C-IMG-A2 ⭐ … carte ouverte : la même chose (48 px)', sur(() => r.ouvert.some(v => v.tag === 'SPAN' && v.label === 'Aucune illustration disponible' && v.w === 48) && !muscleDevine(r.ouvert)), voir(() => _j(r.ouvert)));
    t('C-IMG-A3 ⭐ la démonstration le dit en toutes lettres, sans image de muscle, et propose toujours d\'ajouter sa photo',
      sur(() => /Aucune illustration disponible/.test(r.demoA) && !/muscles\//.test(r.demoA) && /Ajouter la photo/.test(r.demoA)), voir(() => r.demoA.replace(/\s+/g, ' ').slice(0, 300)));
    t('C-IMG-A4 ⛔ un exercice qui a son illustration la garde : vignette et démonstration montrent SON image',
      sur(() => r.autre.some(v => v.tag === 'IMG' && v.src === r.imgAvec) && r.demoB.indexOf(r.imgAvec) >= 0), voir(() => _j({ avec: r.avec, img: r.imgAvec, autre: r.autre })));
    t('C-IMG-A5 ⛔ règle d\'or #9 — le « + » central est au même endroit, carte repliée ou ouverte', sur(() => r.fab1 === r.fab2 && r.fab1 !== '0,0,0,0'), voir(() => r.fab1 + ' / ' + r.fab2));
    t('C-IMG-A6 aucune erreur de page', sur(() => X.errs.length === 0), voir(() => X.errs.join(' | ')));
    await X.cx.close();
  }
  {
    // un exercice PERSO avec sa photo : rien ne change ; sans photo : « Aucune illustration disponible »
    const X = await ouvrir();
    const r = await ev(X, () => {
      const px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      S.customExercises = [{ n: 'Machine Maison Photo', g: 'Dos', img: px }, { n: 'Machine Maison Sans Photo', g: 'Dos', muscles: { p: ['lats'], s: [] } }];
      S.wkt = { date: today(), startTs: Date.now() - 5 * 60000, startHour: 17,
        exs: [{ name: 'Machine Maison Photo', sets: [{ kg: 20, reps: 10, done: false, type: 'N' }] }, { name: 'Machine Maison Sans Photo', sets: [{ kg: 20, reps: 10, done: false, type: 'N' }] }] };
      S.expandAll = true; persist(); goScreen('log'); renderLog();
      const v = ei => [...document.querySelectorAll('#wkt-exs [onclick^="toggleExGif(' + ei + ',"]')].map(e => ({ tag: e.tagName, src: (e.getAttribute('src') || '').slice(0, 30), label: e.getAttribute('aria-label') || '' }));
      return { photo: v(0), sans: v(1), px: px.slice(0, 30) };
    });
    t('C-IMG-B1 ⛔ un perso avec SA photo la garde ; un perso sans photo dit « Aucune illustration disponible »',
      sur(() => r.photo.some(x => x.tag === 'IMG' && x.src === r.px) && r.sans.length >= 1 && r.sans.every(x => x.label === 'Aucune illustration disponible')), voir(() => _j(r)));
    await X.cx.close();
  }
  {
    /* ── C-IMG-C — le PRÉCACHE : rien de jamais affiché n'y est (551 289 octets, dont 386 881 retéléchargés à chaque version).
       Les fichiers sont lus tels que l'app les sert ; « affiché » = nommé quelque part dans le code servi (EX_YT, tables,
       styles, HTML). ⚠️ L'inverse (toute illustration préchargée) N'EST PAS une garantie de l'app aujourd'hui : 156 des 305
       illustrations ne sont pas préchargées (mesuré le 24/10, `BUGS.md` §105) — c'est une décision de Michel, pas un témoin. */
    const X = await ouvrir();
    const r = await ev(X, async () => {
      const sw = await (await fetch('sw.js')).text();
      const pre = sw.slice(sw.indexOf('const PRECACHE'), sw.indexOf('PRECACHE_SENTINEL')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      const images = (pre.match(/'\.\/((?:exercises|machine)\/[^']+\.(?:webp|png|jpe?g|gif))'/g) || []).map(x => x.slice(3, -1));
      const src = [...new Set([...document.scripts].map(x => x.getAttribute('src')).filter(u => u && !/^https?:|^\/\/|^lib\//.test(u)).map(u => u.replace(/\?.*$/, '')).concat(['index.html', 'style.css']))];
      let tout = ''; for (const f of src) tout += await (await fetch(f)).text();
      const jamais = images.filter(f => tout.indexOf(f) < 0);
      return { nPre: images.length, jamais };
    });
    t('C-IMG-C1 ⭐ aucun fichier préchargé n\'est « jamais affiché » (les 6 du 23/10 — 551 Ko — ne le sont plus ; les fichiers restent dans le dépôt)',
      sur(() => r.nPre > 100 && r.jamais.length === 0), voir(() => _j({ nPre: r.nPre, jamais: r.jamais })));
    await X.cx.close();
  }
}

module.exports = { ecran };
