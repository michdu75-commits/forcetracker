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

  /* ══ B-CC01-FIL — LE FILET COMPLÉTÉ (UX SÉANCE, 16/10/2026 — réserve de la contre-vérification CC-01) ══════════════
     La contre-vérification indépendante (session-A, 16/10) a fait passer 8 PERTES réelles à travers ce banc : ses séries
     faites étaient toutes de type N, sans `maxi`, « Modifier » et « Retirer » seulement en ↓, « tout fait » seulement pour
     Drop, et aucun rechargement après « Modifier » / « Retirer » ; une 9ᵉ mutation, d'affichage (cas mixte), passait aussi.
     ⛔ TESTS SEULEMENT : le moteur CC-01 ne change pas (décision : ne pas rouvrir le correctif).
     ⚠️ Les mutations O1 → O14 de la contre-vérification ne sont ni dans le dépôt ni sur le Drive (cherché le 16/10) :
     elles sont reconstruites depuis leur DESCRIPTION (`docs/SUIVI-AUDIT.md`, fiche CC-01), une par perte décrite,
     dans `tools/mut_cc01_dropset.py` (MF1 → MF11) — et chacune doit faire rougir SON témoin ci-dessous.
     Conduit : les vrais boutons (« 📉 Drop », « 📈 +% », « ⚙️ Modifier paliers », « ✕ Retirer dropset »), la vraie modale,
     le rechargement. Observe : chaque série faite, objet JSON complet ; `ex.dropset` ; `ft4_wkt` et le brouillon ; les
     lignes affichées. Ne couvre pas : groupes / supersets, programme importé (inchangés). */
  const ECH = { kg: 60, reps: 10, done: true, type: 'É', rm1: 80, rest: 45, at: 15 };
  const ECHEC = { kg: 100, reps: 6, done: true, type: 'X', rm1: 0, rest: 240, at: 200, rir: 0 };
  {
    const X = await ouvrir(WKT([ECH, FAIT1, PREVUE(), PREVUE()]));
    const ok = await methode(X, DROP, 3, 20);
    const e = await etat(X);
    t('B-CC01-FIL-1 ⭐ « 📉 Drop » après un ÉCHAUFFEMENT validé puis une série validée : les deux restent intacts, l\'échauffement garde son type É',
      ok && e.sets && memes(e.sets[0], ECH) && memes(e.sets[1], FAIT1) && memes(kgs(e.sets), ['60x10✓', '100x8✓', '92.5x7', '75x7', '60x7']),
      _det({ ok, s0: e.sets && e.sets[0], s1: e.sets && e.sets[1], sets: kgs(e.sets) }));
    await X.cx.close();
  }
  {
    const X = await ouvrir(WKT([ECH, PREVUE(), PREVUE()]));
    const ok = await methode(X, DROP, 2, 20);
    const e = await etat(X);
    t('B-CC01-FIL-2 ⭐ « 📉 Drop » quand la seule série validée est un ÉCHAUFFEMENT : il reste à sa place, le dropset part de la série prévue',
      ok && e.sets && memes(e.sets[0], ECH) && memes(kgs(e.sets), ['60x10✓', '92.5x7', '75x7']), _det({ ok, s0: e.sets && e.sets[0], sets: kgs(e.sets) }));
    await X.cx.close();
  }
  {
    const X = await ouvrir(WKT([FAIT1, ECHEC, PREVUE()]));
    const ok = await methode(X, PLUS, 2, 10);
    const e = await etat(X);
    t('B-CC01-FIL-3 ⭐ « 📈 +% » après une série d\'ÉCHEC validée : elle garde son type X (rien n\'est réécrit en N)',
      ok && e.sets && memes(e.sets[0], FAIT1) && memes(e.sets[1], ECHEC) && memes(kgs(e.sets), ['100x8✓', '100x6✓', '92.5x7', '102.5x7']),
      _det({ ok, s1: e.sets && e.sets[1], sets: kgs(e.sets) }));
    await X.cx.close();
  }
  {
    const MAXI = { kg: 20, reps: 15, done: true, type: 'N', maxi: true, rm1: 0, at: 60 };
    const X = await ouvrir(WKT([MAXI, { kg: 20, reps: 0, done: false, type: 'N', maxi: true }]));
    const ok = await methode(X, DROP, 2, 20);
    const e = await etat(X);
    t('B-CC01-FIL-4 ⭐ une série « maxi » validée garde son champ `maxi` après « 📉 Drop » (le passé n\'est pas reconstruit)',
      ok && e.sets && memes(e.sets[0], MAXI) && memes(kgs(e.sets), ['20x15✓', '20x15', '15x15']), _det({ ok, s0: e.sets && e.sets[0], sets: kgs(e.sets) }));
    await X.cx.close();
  }
  // ↑ : une pyramide montante avec 2 paliers faits (le 2ᵉ en « maxi »)
  const U1 = { kg: 100, reps: 8, done: true, type: 'N', rm1: 124, at: 20 };
  const U2 = { kg: 110, reps: 6, done: true, type: 'N', rm1: 0, at: 50, rir: 1, maxi: true };
  const PYR = () => WKT([U1, U2, { kg: 120, reps: 6, done: false, type: 'N' }]);
  const MODIF_UP = '#s-log button[onclick="openDropsetConfig(0,\'up\')"]';
  {
    const X = await ouvrir(PYR());
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 10, direction: 'up' }; persist(); });
    const ok = await methode(X, MODIF_UP, 2, 10);
    const e = await etat(X);
    t('B-CC01-FIL-5 ⭐ « ⚙️ Modifier paliers » en MONTÉE avec 2 paliers faits : les 2 faits intacts, 2 paliers restants depuis la dernière charge faite (120 / 132,5)',
      ok && e.sets && memes(e.sets.slice(0, 2), [U1, U2]) && memes(kgs(e.sets), ['100x8✓', '110x6✓', '120x6', '132.5x6'])
        && memes(e.dropset, { paliers: 4, pct: 10, direction: 'up' }), _det({ ok, sets: kgs(e.sets), ds: e.dropset }));
    await X.cx.close();
  }
  {
    const X = await ouvrir(PYR());
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 10, direction: 'up' }; persist(); });
    await seance(X);
    const ok = await clic(X, '#s-log button[onclick="removeDropset(0)"]');
    const e = await etat(X);
    t('B-CC01-FIL-6 ⭐ « ✕ Retirer dropset » en MONTÉE avec 2 paliers faits : ils restent intacts, seule la partie non faite part, aucune série créée',
      ok && memes(e.sets, [U1, U2]) && e.dropset === null && memes(e.disque, [U1, U2]), _det({ ok, sets: e.sets, ds: e.dropset }));
    await X.cx.close();
  }
  // TOUT FAIT : 3 paliers ↓ validés (le dernier à l'échec, RIR 0)
  const T1 = { kg: 100, reps: 8, done: true, type: 'N', rm1: 124, at: 20 };
  const T2 = { kg: 80, reps: 8, done: true, type: 'N', rm1: 99, at: 45 };
  const T3 = { kg: 65, reps: 8, done: true, type: 'N', rm1: 81, at: 70, rir: 0, note: 'à fond' };
  const TOUT = () => WKT([T1, T2, T3]);
  const MODIF_DOWN = '#s-log button[onclick="openDropsetConfig(0,\'down\')"]';
  {
    const X = await ouvrir(TOUT());
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    const ok = await methode(X, MODIF_DOWN, 2, 20);
    const e = await etat(X);
    const apres = e.sets;
    t('B-CC01-FIL-7 ⭐ TOUT FAIT + « ⚙️ Modifier paliers » : les 3 paliers faits restent (le DERNIER compris), 2 paliers s\'ajoutent depuis la dernière charge (52,5 / 42,5)',
      ok && apres && memes(apres.slice(0, 3), [T1, T2, T3]) && memes(kgs(apres), ['100x8✓', '80x8✓', '65x8✓', '52.5x8', '42.5x8'])
        && memes(e.dropset, { paliers: 5, pct: 20, direction: 'down' }), _det({ ok, sets: kgs(apres), ds: e.dropset }));
    await X.recharger();
    const r = await etat(X);
    t('B-CC01-FIL-10 ⭐ RECHARGEMENT après « ⚙️ Modifier paliers » : mémoire, ft4_wkt et brouillon identiques à l\'état d\'après l\'action (rien ne revient, rien ne se perd)',
      !!apres && memes(r.sets, apres) && memes(r.disque, apres) && memes(r.brouillon, apres) && memes(r.dropset, { paliers: 5, pct: 20, direction: 'down' }),
      _det({ sets: kgs(r.sets), disque: kgs(r.disque), brouillon: kgs(r.brouillon), ds: r.dropset }));
    await X.cx.close();
  }
  {
    const X = await ouvrir(TOUT());
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 3, pct: 20, direction: 'down' }; persist(); });
    await seance(X);
    const ok = await clic(X, '#s-log button[onclick="removeDropset(0)"]');
    const e = await etat(X);
    t('B-CC01-FIL-8 ⭐ TOUT FAIT + « ✕ Retirer dropset » : les 3 paliers faits restent (le DERNIER compris), plus de dropset, rien de créé',
      ok && memes(e.sets, [T1, T2, T3]) && e.dropset === null, _det({ ok, sets: e.sets, ds: e.dropset }));
    await X.recharger();
    const r = await etat(X);
    t('B-CC01-FIL-11 ⭐ RECHARGEMENT après « ✕ Retirer dropset » : toujours les 3 séries faites et plus de dropset (mémoire, ft4_wkt, brouillon)',
      memes(r.sets, [T1, T2, T3]) && memes(r.disque, [T1, T2, T3]) && memes(r.brouillon, [T1, T2, T3]) && r.dropset === null,
      _det({ sets: kgs(r.sets), disque: kgs(r.disque), brouillon: kgs(r.brouillon), ds: r.dropset }));
    await X.cx.close();
  }
  {
    // CAS MIXTE : une série NORMALE faite avant le dropset, puis 1 palier fait ; « Modifier » 2 paliers.
    const PM = { kg: 90, reps: 8, done: true, type: 'N', rm1: 0, at: 300 };
    const X = await ouvrir(WKT([FAIT1, PM, { kg: 72.5, reps: 8, done: false, type: 'N' }]));
    await X.pg.evaluate(() => { S.wkt.exs[0].dropset = { paliers: 2, pct: 20, direction: 'down' }; persist(); });
    const ok = await methode(X, MODIF_DOWN, 2, 20);
    const e = await etat(X);
    const l = await lignes(X);
    t('B-CC01-FIL-9 ⭐ CAS MIXTE + « ⚙️ Modifier paliers » : la série normale faite AVANT le dropset reste affichée comme une série NORMALE (D-082 ④)',
      ok && e.sets && memes(e.sets.slice(0, 2), [FAIT1, PM]) && memes(kgs(e.sets), ['100x8✓', '90x8✓', '72.5x8', '57.5x8'])
        && memes(e.dropset, { paliers: 3, pct: 20, direction: 'down' }) && l[0] === 'normale' && l.length === 4 && l.slice(1).every(x => x !== 'normale'),
      _det({ ok, sets: kgs(e.sets), ds: e.dropset, l }));
    t('B-CC01-FIL-12 aucune erreur de page sur le filet', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}

module.exports = { ecran };
