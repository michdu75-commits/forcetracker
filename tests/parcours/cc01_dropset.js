/* ══════════════════════════════════════════════════════════════════════════════════════
   🛡️ CC-01 — UNE SÉRIE VALIDÉE EST DU PASSÉ (blocs B-CC01-*) — session-B, 16/10/2026, P0 intégrité.
   Le défaut, mesuré sur master `1717edc4` : `applyDropset` remplaçait TOUTE la liste des séries
   (`ex.sets=newSets`) → « 📉 Drop », « 📈 +% » et « ⚙️ Modifier paliers » effaçaient les séries déjà
   validées ; « ✕ Retirer dropset » (`removeDropset`) les remplaçait par une seule série vide.
   Décisions de Michel (16/10) :
     ① « Retirer dropset » : les séries validées restent, seule la partie non faite part ;
     ② Drop / +% après des séries faites : elles restent à leur place ; la suite part de la PROCHAINE
        série prévue, sinon de la DERNIÈRE faite ; tout fait → les paliers s'ajoutent à la suite ;
     ③ « Modifier paliers » : le nombre choisi = paliers RESTANT à faire ; la suite repart de la dernière
        charge faite ; aucun palier fait → comportement de départ ;
     ④ une série normale faite AVANT le dropset reste affichée comme une série normale.
   Ce que les témoins CONDUISENT : les vrais boutons de l'écran Séance (« 📉 Drop », « 📈 +% »,
   « ⚙️ Modifier paliers », « ✕ Retirer dropset »), la vraie modale (paliers, %), « Créer le dropset »,
   « Terminer », le rechargement de la page.
   Ce qu'ils OBSERVENT : `S.wkt.exs[i].sets` objet par objet (JSON complet), `ex.dropset`, `ft4_wkt`,
   `ft4_wkt_draft`, la séance enregistrée, les lignes affichées.
   Ce qu'ils NE COUVRENT PAS : les groupes / supersets (SEANCE-02) ; les dropsets d'un programme importé
   (inchangés) ; l'ordre de validation hors séquence au-delà du cas « série sautée ».
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_lms: '2026-09' };
const _det = o => JSON.stringify(o);
const EX = 'Développé Couché';
// Deux séries VALIDÉES aux données riches et distinctes, puis deux séries prévues.
const FAIT1 = { kg: 100, reps: 8, done: true, type: 'N', rm1: 124, rest: 150, at: 30, rir: 2, note: 'propre' };
const FAIT2 = { kg: 92.5, reps: 7, done: true, type: 'N', rm1: 113, rest: 150, at: 240, rir: 1 };
const PREVUE = () => ({ kg: 92.5, reps: 7, done: false, type: 'N', rm1: 0 });
const WKT = (sets, extra) => Object.assign({ date: '2026-10-16', startHour: 10, startTs: Date.now() - 600000,
  exs: [{ name: EX, sets: sets }] }, extra || {});

async function ecran(t, b, PORT) {
  const ouvrir = async (wkt) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_wkt: JSON.stringify(wkt), ft4_wkt_draft: JSON.stringify(wkt) });
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_cc01'))return; sessionStorage.setItem('_cc01','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 140)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs };
    X.recharger = async () => { await pg.reload(); await pg.waitForTimeout(1500); };
    return X;
  };
  // L'écran Séance, l'exercice ouvert (les boutons de méthode sont dans le bloc développé).
  const seance = X => X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen('log', document.getElementById('nb-log')); _expandedEx = 0; renderExBlocks(); return true; });
  const clic = async (X, sel) => {
    const h = (await X.pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
    if (!h) return false;
    await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await X.pg.waitForTimeout(200); return true;
  };
  // La vraie méthode : bouton du bloc → modale → nombre de paliers → % → « Créer ».
  const methode = async (X, porte, paliers, pct) => {
    await seance(X);
    const ouvre = await clic(X, porte);
    const p = paliers ? await clic(X, '#ov-drop-cfg button[onclick^="_dropCfgPaliers=' + paliers + ';"]') : true;
    const q = pct ? await clic(X, '#ov-drop-cfg button[onclick^="_dropCfgPct=' + pct + ';"]') : true;
    const c = await clic(X, '#ov-drop-cfg button[onclick="applyDropset()"]');
    return ouvre && p && q && c;
  };
  const DROP = '#s-log button[onclick="openDropsetConfig(0,\'down\')"]';
  const PLUS = '#s-log button[onclick="openDropsetConfig(0,\'up\')"]';
  const etat = X => X.pg.evaluate(() => {
    const ls = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const ex = S.wkt && S.wkt.exs[0];
    return { sets: ex ? JSON.parse(JSON.stringify(ex.sets)) : null, dropset: ex && ex.dropset ? JSON.parse(JSON.stringify(ex.dropset)) : null,
      disque: (ls('ft4_wkt') || { exs: [{}] }).exs[0].sets || null, brouillon: (ls('ft4_wkt_draft') || { exs: [{}] }).exs[0].sets || null };
  });
  // Ce que l'écran montre, ligne par ligne : série normale (bouton de type) ou palier (son libellé).
  const lignes = X => X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 .set-row')].map(r =>
    r.querySelector('.tbtn') ? 'normale' : ((r.children[1] && r.children[1].textContent || '').trim() + (r.querySelector('.sinp') ? ' ✎' : ''))));
  const kgs = sets => (sets || []).map(s => s.kg + 'x' + s.reps + (s.done ? '✓' : ''));
  const memes = (a, b) => _det(a) === _det(b);

  /* ── A : aucune série validée → comportement existant conservé (Drop et +%). ── */
  {
    const X = await ouvrir(WKT([{ kg: 100, reps: 8, done: false, type: 'N', rm1: 0 }, PREVUE(), PREVUE()]));
    const ok = await methode(X, DROP, 3, 20);
    const e = await etat(X);
    t('B-CC01-A1 aucune série validée, « 📉 Drop » 3 paliers −20 % : exactement le comportement d\'avant (100 / 80 / 65 × 8, rien de fait)',
      ok && memes(kgs(e.sets), ['100x8', '80x8', '65x8']) && memes(e.dropset, { paliers: 3, pct: 20, direction: 'down' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    t('B-CC01-A1b … l\'écran montre « Charge de départ » puis deux paliers', memes(await lignes(X), ['Charge de départ ✎', 'Drop −20%', 'Drop −20%']), _det(await lignes(X)));
    await X.cx.close();
  }
  {
    const X = await ouvrir(WKT([{ kg: 100, reps: 8, done: false, type: 'N', rm1: 0 }, PREVUE()]));
    const ok = await methode(X, PLUS, 3, 10);
    const e = await etat(X);
    t('B-CC01-A2 aucune série validée, « 📈 +% » 3 paliers +10 % : comportement d\'avant (100 / 110 / 120)',
      ok && memes(kgs(e.sets), ['100x8', '110x8', '120x8']) && memes(e.dropset, { paliers: 3, pct: 10, direction: 'up' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    await X.cx.close();
  }

  /* ── B · C · D : deux séries validées (données riches), puis Drop ; rechargement ; enregistrement. ⭐ Rouge sur master. ── */
  {
    const X = await ouvrir(WKT([FAIT1, FAIT2, PREVUE(), PREVUE()]));
    const ok = await methode(X, DROP, 3, 20);
    const e = await etat(X);
    t('B-CC01-B1 ⭐ « 📉 Drop » après 2 séries validées : les 2 séries faites sont INTACTES et à leur place (kg, reps, RIR, type, note, repos, horodatage, 1RM)',
      ok && e.sets && memes(e.sets[0], FAIT1) && memes(e.sets[1], FAIT2), _det({ ok, s0: e.sets && e.sets[0], s1: e.sets && e.sets[1] }));
    t('B-CC01-B2 … seul le futur est transformé : 3 paliers partent de la PROCHAINE série prévue (92,5 → 75 → 60 × 7), non faits',
      e.sets && memes(kgs(e.sets), ['100x8✓', '92.5x7✓', '92.5x7', '75x7', '60x7']) && memes(e.dropset, { paliers: 3, pct: 20, direction: 'down' }),
      _det({ sets: kgs(e.sets), ds: e.dropset }));
    t('B-CC01-B3 l\'écran garde les 2 séries faites comme des séries NORMALES ; le dropset commence après (« Charge de départ » éditable)',
      memes(await lignes(X), ['normale', 'normale', 'Charge de départ ✎', 'Drop −20%', 'Drop −20%']), _det(await lignes(X)));
    await X.recharger();
    const r = await etat(X);
    t('B-CC01-D1 ⭐ après rechargement : séries faites toujours présentes et identiques (mémoire, ft4_wkt, brouillon)',
      r.sets && memes(r.sets.slice(0, 2), [FAIT1, FAIT2]) && r.disque && memes(r.disque.slice(0, 2), [FAIT1, FAIT2]) && r.brouillon && memes(r.brouillon.slice(0, 2), [FAIT1, FAIT2]) && r.sets.length === 5,
      _det({ sets: kgs(r.sets), disque: kgs(r.disque), brouillon: kgs(r.brouillon) }));
    await seance(X);
    t('B-CC01-D2 … et l\'écran rechargé les montre toujours comme des séries normales', memes(await lignes(X), ['normale', 'normale', 'Charge de départ ✎', 'Drop −20%', 'Drop −20%']), _det(await lignes(X)));
    // l'historique : on valide le 1er palier puis « Terminer »
    await X.pg.evaluate(() => toggleSet(0, 2));
    await X.pg.waitForTimeout(150);
    await X.pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); });
    /* UX SÉANCE (16/10/2026, R30) — la porte de fin est `terminerSeance()` (« Terminer » de l'en-tête et du bas) : s'il reste des séries de TRAVAIL, elle demande « Terminer quand même ? » et on confirme, comme la personne. La conduite change ; ce que le banc mesure ne change pas. */
    await clic(X, '.topbar button[onclick="terminerSeance()"]');
    await (async X => { await X.pg.waitForTimeout(150); if (await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); })) await X.pg.click('#confirm-ok'); })(X);
    await X.pg.waitForTimeout(1600);
    const h = await X.pg.evaluate(() => { const s = (S.sessions || [])[0]; return s ? JSON.parse(JSON.stringify(s.exs[0].sets)) : null; });
    t('B-CC01-D3 ⭐ la séance ENREGISTRÉE garde les 2 séries faites identiques, plus le palier validé',
      h && h.length === 5 && memes(h.slice(0, 2), [FAIT1, FAIT2]) && h[2].done === true, _det({ hist: h && kgs(h) }));
    t('B-CC01-D4 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── E : « 📈 +% » après 2 séries validées — même moteur, même protection. ⭐ Rouge sur master. ── */
  {
    const X = await ouvrir(WKT([FAIT1, FAIT2, PREVUE(), PREVUE()]));
    const ok = await methode(X, PLUS, 3, 10);
    const e = await etat(X);
    t('B-CC01-E1 ⭐ « 📈 +% » après 2 séries validées : séries faites intactes ; la pyramide part de la prochaine série (92,5 → 102,5 → 112,5)',
      ok && e.sets && memes(e.sets.slice(0, 2), [FAIT1, FAIT2]) && memes(kgs(e.sets), ['100x8✓', '92.5x7✓', '92.5x7', '102.5x7', '112.5x7'])
        && memes(e.dropset, { paliers: 3, pct: 10, direction: 'up' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    t('B-CC01-E2 … l\'écran : 2 séries normales, puis « Charge de départ » et « +10% »', memes(await lignes(X), ['normale', 'normale', 'Charge de départ ✎', '+10%', '+10%']), _det(await lignes(X)));
    await X.cx.close();
  }

  /* ── F : toutes les séries sont faites → les paliers s'ajoutent à la suite, depuis la DERNIÈRE faite. ── */
  {
    const F3 = { kg: 95, reps: 6, done: true, type: 'N', rm1: 0, at: 400 };
    const X = await ouvrir(WKT([FAIT1, FAIT2, F3]));
    const ok = await methode(X, DROP, 3, 20);
    const e = await etat(X);
    t('B-CC01-F1 ⭐ toutes les séries faites, « 📉 Drop » : les 3 faites restent, 3 paliers s\'AJOUTENT depuis la dernière faite (95 → 75 → 60 × 6)',
      ok && e.sets && memes(e.sets.slice(0, 3), [FAIT1, FAIT2, F3]) && memes(kgs(e.sets), ['100x8✓', '92.5x7✓', '95x6✓', '95x6', '75x6', '60x6'])
        && memes(e.dropset, { paliers: 3, pct: 20, direction: 'down' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    await X.cx.close();
  }

  /* ── G : « ⚙️ Modifier paliers » pendant le dropset. ── */
  {
    // 2 paliers faits, 1 restant ; on choisit 3 paliers → 3 paliers RESTANTS, depuis la dernière charge faite (80).
    const P1 = { kg: 100, reps: 8, done: true, type: 'N', rm1: 124, at: 20 }, P2 = { kg: 80, reps: 8, done: true, type: 'N', rm1: 99, at: 45, rir: 0 };
    const X = await ouvrir(WKT([P1, P2, { kg: 65, reps: 8, done: false, type: 'N' }]));
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    await seance(X);
    const ok = await methode(X, '#s-log button[onclick="openDropsetConfig(0,\'down\')"]', 3, 20);
    const e = await etat(X);
    t('B-CC01-G1 ⭐ « Modifier paliers » avec 2 paliers faits + choix 3 : les 2 faits intacts + 3 paliers RESTANTS depuis 80 (65 / 52,5 / 42,5)',
      ok && e.sets && memes(e.sets.slice(0, 2), [P1, P2]) && memes(kgs(e.sets), ['100x8✓', '80x8✓', '65x8', '52.5x8', '42.5x8'])
        && memes(e.dropset, { paliers: 5, pct: 20, direction: 'down' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    t('B-CC01-G2 … l\'écran : les 2 paliers faits restent des PALIERS (pas des séries normales), le suivant est éditable',
      memes(await lignes(X), ['Charge de départ', 'Drop −20%', 'Drop −20% ✎', 'Drop −20%', 'Drop −20%']), _det(await lignes(X)));
    await X.cx.close();
  }
  {
    // 2 séries NORMALES faites avant le dropset, aucun palier fait ; « Modifier » 4 paliers → depuis le 1er palier prévu (100).
    const X = await ouvrir(WKT([FAIT1, FAIT2, { kg: 100, reps: 8, done: false, type: 'N' }, { kg: 80, reps: 8, done: false, type: 'N' }, { kg: 65, reps: 8, done: false, type: 'N' }]));
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    const ok = await methode(X, '#s-log button[onclick="openDropsetConfig(0,\'down\')"]', 4, 20);
    const e = await etat(X);
    t('B-CC01-G3 « Modifier paliers » sans palier fait (2 séries normales faites devant) : elles restent ; 4 paliers repartent du 1er palier prévu (100 / 80 / 65 / 52,5)',
      ok && e.sets && memes(e.sets.slice(0, 2), [FAIT1, FAIT2]) && memes(kgs(e.sets), ['100x8✓', '92.5x7✓', '100x8', '80x8', '65x8', '52.5x8'])
        && memes(e.dropset, { paliers: 4, pct: 20, direction: 'down' }) && memes(await lignes(X), ['normale', 'normale', 'Charge de départ ✎', 'Drop −20%', 'Drop −20%', 'Drop −20%']),
      _det({ ok, sets: kgs(e.sets), ds: e.dropset, l: await lignes(X) }));
    await X.cx.close();
  }

  /* ── H : « ✕ Retirer dropset ». ── */
  {
    const P1 = { kg: 100, reps: 8, done: true, type: 'N', rm1: 124, at: 20, note: 'dur' }, P2 = { kg: 80, reps: 8, done: true, type: 'N', rm1: 99, at: 45 };
    const X = await ouvrir(WKT([P1, P2, { kg: 65, reps: 8, done: false, type: 'N' }]));
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    await seance(X);
    const ok = await clic(X, '#s-log button[onclick="removeDropset(0)"]');
    const e = await etat(X);
    t('B-CC01-H1 ⭐ « ✕ Retirer dropset » avec 2 paliers faits : ils restent intacts, seule la partie non faite part, plus de dropset, aucune série créée',
      ok && e.sets && memes(e.sets, [P1, P2]) && e.dropset === null && e.disque && memes(e.disque, [P1, P2]), _det({ ok, sets: e.sets, ds: e.dropset }));
    await X.cx.close();
  }
  {
    const X = await ouvrir(WKT([{ kg: 100, reps: 8, done: false, type: 'N' }, { kg: 80, reps: 8, done: false, type: 'N' }, { kg: 65, reps: 8, done: false, type: 'N' }]));
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    await seance(X);
    const ok = await clic(X, '#s-log button[onclick="removeDropset(0)"]');
    const e = await etat(X);
    t('B-CC01-H2 « ✕ Retirer dropset » sans palier fait : comportement d\'avant (une série 100 × 8, plus de dropset)',
      ok && memes(e.sets, [{ kg: 100, reps: 8, done: false, type: 'N' }]) && e.dropset === null, _det({ ok, sets: e.sets, ds: e.dropset }));
    await X.cx.close();
  }

  /* ── I : une série SAUTÉE (non faite) avant une série faite ne bouge pas non plus : rien de fait ne change de place. ── */
  {
    const SAUTEE = { kg: 92.5, reps: 7, done: false, type: 'N', rm1: 0 };
    const X = await ouvrir(WKT([FAIT1, SAUTEE, FAIT2, PREVUE()]));
    const ok = await methode(X, DROP, 2, 20);
    const e = await etat(X);
    t('B-CC01-I1 série sautée entre deux séries faites : les 3 premières restent telles quelles à leur place, seul le futur (après la dernière faite) devient le dropset',
      ok && e.sets && memes(e.sets.slice(0, 3), [FAIT1, SAUTEE, FAIT2]) && memes(kgs(e.sets), ['100x8✓', '92.5x7', '92.5x7✓', '92.5x7', '75x7']),
      _det({ ok, sets: kgs(e.sets) }));
    await X.cx.close();
  }
}

module.exports = { ecran };
