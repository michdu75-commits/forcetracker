/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🔒 LOT H DE LA MISSION DE FERMETURE (17/11/2026) — HISTORIQUE : HOMONYMES SANS IDENTITÉ · DERNIÈRE SÉANCE ABSENTE = PRESCRIPTION · VALIDER UNE CHARGE VIDE (blocs B-SCFH-*)
   Claude N°2 (Séance). Arbitrages de Michel (17/11/2026, via la contre-expertise finale) :
     1. `SEANCE-homonymes-sans-identite` — jamais d'attribution par POSITION / RANG d'exercices homonymes ambigus, « y compris si leurs commentaires coïncident » ;
     2. `SEANCE-absent-derniere-prescription` (H07) — la dernière séance TERMINÉE du même programme / jour ne contient pas l'exercice → la PRESCRIPTION, jamais une séance plus ancienne ;
     3. valider une charge vide n'importe JAMAIS la suggestion d'un AUTRE programme (ni d'un autre jour, ni d'une séance libre) ; inconnu ≠ zéro, rien d'inventé.
   Chaîne conduite : vrai Chromium 390 × 844 → `_loadProgDayVraiment` / `_loadProgVraiment` → `finishWorkout` (la VRAIE séance enregistrée) → le chargement suivant ; pour la validation d'une charge vide : le VRAI écran Séance
   (rendu des séries, saisie au clavier, appui sur ✓). Aucun appel réseau, aucun appel au modèle, aucune donnée réelle.
   ⛔ Données 100 % INVENTÉES et volontairement atypiques (17 · 34 · 57 · 63 · 72 · 99). Dates RELATIVES.
   LOT C DE LA FINALE (17/11/2026, bloc E) : l'ajout d'un exercice / d'une série (`addExercise`, `addSet`), le remplacement, la base d'un dropset et la séance de Milo ne reprennent que d'une source ADMISSIBLE (`_reprise`) — mêmes règles que valider une série ;
     une séance LIBRE ne reprend que la dernière séance LIBRE, sans ambiguïté ; une charge inconnue n'est jamais transformée en zéro.
   LOT S DE LA V3 (18/11/2026, bloc F) : UN SEUL SÉLECTEUR de « la dernière fois » (`_reprise`, qui lit le BLOC — `exId`, sinon nom non ambigu — dans la dernière séance terminée de CE jour de CE programme, comme le chargement) ; mêmes règles pour les RÉPÉTITIONS que pour les charges ;
     Milo qui AJOUTE respecte le jour de la séance en cours, Milo qui DÉMARRE reste libre ; « Précédent » reste comparatif.
   NE COUVRE PAS : Safari iOS (Chromium ≠ iPhone) ; la « référence de reprise » d'une séance allégée (aucun code : voir `SC/nuit7/NOTE-DELOAD-POUR-N1.md`) ; les zéros inventés (lot Z : `B-SCFD`).
   Banc : tools/banc_seance_cf_h.js · contrôle négatif : tools/mut_seance_cf_h.py
   Préfixes : SCFH-A (homonymes) · SCFH-B (dernière séance absente) · SCFH-C (valider une charge vide) · SCFH-D (incertitude) · SCFH-E (lot C : ajout / série / remplacement / dropset / Milo / séance libre) · SCFH-F (lot S : sélecteur unique) · SCFH-Z (règle d'or #9 · erreurs)
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };
const js = x => String(JSON.stringify(x)).slice(0, 700);
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const SE = (kg, reps, type, rest, extra) => Object.assign({ kg, reps, type: type || 'N', rest: rest || 0 }, extra || {});
const EXO = (name, sets, extra) => Object.assign({ name, note: '', sets }, extra || {});
const ZO = 'Zorglub Presse Quantique', CU = 'Curl Haltères', TR = 'Tractions (Pull-up)';

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-SCFH. LOT H DE FERMETURE — HOMONYMES · DERNIÈRE SÉANCE ABSENTE · VALIDER UNE CHARGE VIDE (l\'app conduite) ═══');
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  const dehors = [];
  await cx.route((u) => !/^http:\/\/localhost:/.test(String(u)), (rt) => { const rq = rt.request(); let c = {}; try { c = JSON.parse(rq.postData() || '{}'); } catch (e) {} dehors.push({ u: rq.url().slice(0, 60), a: c.action || '' }); return rt.abort(); });   // ⛔ toute requête hors du serveur local : notée, puis COUPÉE
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  pg.setDefaultTimeout(8000);
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_scfh'))return; sessionStorage.setItem('_scfh','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);
  const section = async (nom, fn) => { console.log('\n─── B-SCFH-' + nom + ' ───'); try { await fn(); } catch (e) { t('SCFH-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };

  await pg.evaluate(() => {
    const iso = d => { const x = new Date(Date.now() - d * 864e5); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    window.H = {
      iso,
      raz(progs, hist) {
        document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
        S.customExercises = []; S.programmes = progs || []; S.sessions = hist || []; S.wkt = null; S.prs = {}; S.exRestPref = {}; S.defRest = 130;
        const t = today(), pm = new Date(Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 2, 15));
        S.lastWeekSummary = t; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
        persist();
      },
      /** Une séance d'AILLEURS (libre ou d'un autre programme) : les mêmes exercices, des valeurs hostiles. */
      ailleurs(noms, progId, kg, ts, extra) { return Object.assign({ id: ts, ts, date: iso(Math.round((Date.now() - ts) / 864e5)), progLabel: 'Séance libre', ...(progId ? { progId, progDayId: 'j-autre' } : {}),
        exs: noms.map(n => ({ name: n, sets: [{ kg, reps: 7, type: 'N', done: true }, { kg, reps: 7, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 }, extra || {}); },
      charge(i, j) { S.wkt = null; if (S.programmes[i].days && S.programmes[i].days.length) _loadProgDayVraiment(i, j || 0); else _loadProgVraiment(i); return JSON.parse(JSON.stringify(S.wkt)); },
      async fait(i, j, aj, sauf, date) {
        H.charge(i, j);
        (aj || []).forEach(([ei, si, kg, reps, rest]) => { const s = S.wkt.exs[ei].sets[si]; if (kg != null) s.kg = kg; if (reps != null) s.reps = reps; if (rest != null) s.rest = rest; });
        S.wkt.exs.forEach((e, ei) => e.sets.forEach(s => { s.done = (sauf || []).indexOf(ei) < 0; }));
        if (date) S.wkt.date = date;
        await finishWorkout(); await new Promise(r => setTimeout(r, 14));
        return JSON.parse(JSON.stringify(S.sessions.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))[0]));
      },
      prog(i) { return JSON.parse(JSON.stringify(S.programmes[i])); }
    };
  });
  const raz = (progs, hist) => pg.evaluate(([p, h]) => { H.raz(p, h); }, [progs, hist || null]);
  const charge = (i, j) => pg.evaluate(([i, j]) => H.charge(i, j), [i, j || 0]);
  const fait = (i, j, aj, sauf) => pg.evaluate(([i, j, a, s]) => H.fait(i, j, a, s, null), [i, j || 0, aj || null, sauf || null]);
  const kgs = w => w.exs.map(e => e.sets.map(s => s.kg).join(','));
  const sess = () => pg.evaluate(() => JSON.parse(JSON.stringify(S.sessions)));

  // ═══ A. HOMONYMES SANS IDENTITÉ : jamais le RANG ═══
  await section('A', async () => {
    // séance d'AVANT les identités : deux blocs « ZO » SANS commentaire (rien pour les distinguer), sans `exId`, sans `progDayId`
    const t0 = Date.now();
    const ANC = (blocs, id) => ({ id: id || 3, ts: t0 - 2000, date: '2026-11-01', progId: 'p-scfh-a', progLabel: 'JOUR A', exs: blocs.map(([note, kg]) => ({ name: ZO, note, sets: [{ kg, reps: 5, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 });
    const PROG = (blocs) => ({ id: 'p-scfh-a', name: 'Fictif A', days: [{ label: 'JOUR A', exs: blocs.map(([note, kg]) => EXO(ZO, [SE(kg, 5)], { note })) }] });
    const essai = async (blocsProg, blocsHist) => { await raz([PROG(blocsProg)], [ANC(blocsHist)]); const av = JSON.stringify(await sess()); const w = await charge(0, 0); return { kg: w.exs.map(e => e.sets[0].kg), intact: av === JSON.stringify(await sess()) }; };
    const m1 = await essai([['', 57], ['', 63]], [['', 17], ['', 34]]);
    t('SCFH-A01 ⭐⭐⭐ sonde SEANCE-homonymes-sans-identite — deux blocs de MÊME NOM et de MÊME commentaire (ici aucun), d\'une séance d\'avant les identités : AUCUNE valeur n\'est attribuée par le rang — la PRESCRIPTION (57 · 63), jamais 17 · 34 ; l\'historique n\'est pas modifié',
      egal(m1.kg, [57, 63]) && m1.intact, js(m1));
    const m2 = await essai([['', 63], ['', 57]], [['', 17], ['', 34]]);
    t('SCFH-A02 ⭐⭐ … la même chose après une PERMUTATION du programme (63 · 57) : le rang ne se relit pas dans l\'autre sens non plus', egal(m2.kg, [63, 57]) && m2.intact, js(m2));
    const m3 = await essai([['', 57]], [['', 17], ['', 34]]);
    t('SCFH-A03 ⭐ … après la SUPPRESSION d\'un des deux blocs : le bloc restant ne prend ni le 1ᵉʳ (17) ni le dernier (34) d\'avant — sa prescription', egal(m3.kg, [57]) && m3.intact, js(m3));
    const m4 = await essai([['', 57], ['', 63], ['', 72]], [['', 17], ['', 34]]);
    t('SCFH-A04 ⭐ … après l\'INSERTION d\'un troisième homonyme : trois prescriptions (57 · 63 · 72)', egal(m4.kg, [57, 63, 72]) && m4.intact, js(m4));
    const m5 = await essai([['Bloc A', 57], ['Bloc B', 63]], [['Bloc B', 34], ['Bloc A', 17]]);
    t('SCFH-A05 ⭐⭐ commentaires DISTINCTS et uniques de chaque côté (non ambigu) : chaque bloc retrouve le sien malgré l\'ordre inversé — A → 17 · B → 34 (la règle ne devient pas « jamais »)', egal(m5.kg, [17, 34]) && m5.intact, js(m5));
    const m6 = await essai([['Bloc A', 57], ['Bloc B', 63]], [['Bloc A', 17], ['Bloc A', 34]]);
    t('SCFH-A06 ⭐⭐ le commentaire « Bloc A » existe DEUX fois dans la séance d\'avant : il ne désigne plus personne (ambigu) — A et B gardent leur prescription (57 · 63)', egal(m6.kg, [57, 63]) && m6.intact, js(m6));
    const m7 = await essai([['', 57], ['Bloc B', 63]], [['', 17], ['Bloc B', 34]]);
    t('SCFH-A07 ⭐ un bloc sans commentaire et un bloc « Bloc B » (commentaires uniques de chaque côté) : chacun retrouve le sien — 17 · 34', egal(m7.kg, [17, 34]) && m7.intact, js(m7));
    const m8 = await essai([['Bloc A', 57], ['Bloc A', 63]], [['Bloc A', 17]]);
    t('SCFH-A16 ⭐ deux blocs du programme portent le MÊME commentaire (« Bloc A ») et la séance d\'avant n\'en a qu\'un : le commentaire ne désigne aucun des deux (ambigu côté programme) — 57 · 63, jamais 17 pour l\'un d\'eux', egal(m8.kg, [57, 63]) && m8.intact, js(m8));
    // un exercice sans homonyme : le rapprochement par nom reste (aucune régression)
    await raz([{ id: 'p-scfh-a', name: 'Fictif A', days: [{ label: 'JOUR A', exs: [EXO(CU, [SE(57, 5)])] }] }], [{ id: 4, ts: t0 - 2000, date: '2026-11-01', progId: 'p-scfh-a', progLabel: 'JOUR A', exs: [{ name: CU, note: '', sets: [{ kg: 34, reps: 5, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }]);
    const u = await charge(0, 0);
    t('SCFH-A08 un exercice SANS homonyme se retrouve toujours par son nom dans une séance d\'avant les identités (34), pas de régression', egal(kgs(u), ['34']), js(kgs(u)));
    // sonde directe sur la fonction réelle (la forme de la contre-expertise : deux « Fictif » de chaque côté, aucun commentaire)
    const sonde = await pg.evaluate(() => { const ex = (name, kg) => ({ name, sets: [{ kg, reps: 5 }] }); const old = [{ ts: 100, exs: [ex('Fictif', 17), ex('Fictif', 34)] }], cur = [ex('Fictif', 57), ex('Fictif', 63)]; return [_prevDuJour(old, cur[0], cur).sets.length, _prevDuJour(old, cur[1], cur).sets.length]; });
    t('SCFH-A09 ⭐ sonde directe `_prevDuJour(old, cur[0], cur)` (deux « Fictif » de chaque côté) : 0 série, pour les DEUX blocs', egal(sonde, [0, 0]), js(sonde));

    // A10 — les IDENTITÉS (exId · sid) : deux blocs homonymes ENREGISTRÉS avec leurs identités ; permutation, suppression, insertion → chaque bloc garde son historique, les identités sont conservées
    const DUO = () => ({ id: 'p-scfh-duo', name: 'Fictif deux blocs', days: [{ label: 'TOP', exs: [EXO(ZO, [SE(57, 3, 'N', 60), SE(57, 3, 'N', 60)]), EXO(ZO, [SE(34, 8, 'N', 60)]), EXO(CU, [SE(17, 10)])] }] });
    await raz([DUO()], []);
    const sA = await fait(0, 0, [[0, 0, 63, 3], [0, 1, 63, 3], [1, 0, 39, 8], [2, 0, 22, 10]]);
    const ids0 = await pg.evaluate(() => S.programmes[0].days[0].exs.map(e => ({ ex: e.exId, s: e.sets.map(s => s.sid) })));
    t('SCFH-A10 ⭐ la séance enregistrée porte les identités du programme (`exId` de chaque exercice, `sid` de chaque série, `progDayId`) — de quoi retrouver chaque bloc sans lire ni nom ni rang', sA.exs.every((e, i) => e.exId === ids0[i].ex && egal(e.sets.map(s => s.sid), ids0[i].s)) && !!sA.progDayId && ids0[0].ex !== ids0[1].ex, js({ ids0, sA: sA.exs.map(e => e.exId) }));
    const perm = await pg.evaluate(() => { const p = S.programmes[0]; p.days[0].exs.reverse(); persist(); return H.charge(0, 0).exs.map(e => e.sets.map(s => s.kg).join(',')); });
    t('SCFH-A11 ⭐⭐ après une PERMUTATION (le 2ᵉ bloc passe en tête) : chaque bloc garde SON historique — 22 · 39 · 63,63 (jamais l\'autre, jamais le rang)', egal(perm, ['22', '39', '63,63']), js(perm));
    const supp = await pg.evaluate(() => { const p = S.programmes[0]; p.days[0].exs.splice(1, 1); persist(); return { kg: H.charge(0, 0).exs.map(e => e.sets.map(s => s.kg).join(',')) }; });
    t('SCFH-A12 ⭐ … puis la SUPPRESSION du bloc « 39 » : le bloc restant garde le sien (63,63), le curl aussi (22)', egal(supp.kg, ['22', '63,63']), js(supp));
    const ins = await pg.evaluate((n) => { const p = S.programmes[0]; p.days[0].exs.unshift({ name: n, note: '', sets: [{ kg: 72, reps: 5, type: 'N', rest: 0 }] }); persist(); const w = H.charge(0, 0); return { kg: w.exs.map(e => e.sets.map(s => s.kg).join(',')), ids: p.days[0].exs.map(e => e.exId), sids: p.days[0].exs.map(e => e.sets.map(s => s.sid)) }; }, ZO);
    t('SCFH-A13 ⭐⭐ … puis l\'INSERTION d\'un nouvel homonyme en tête : il s\'ouvre à SA prescription (72) — il n\'hérite ni du rang ni du nom ; les deux autres gardent leur historique (22 · 63,63) ; tous ont une identité, sans doublon',
      egal(ins.kg, ['72', '22', '63,63']) && ins.ids.every(Boolean) && new Set(ins.ids).size === ins.ids.length && ins.sids.every(l => l.every(Boolean) && new Set(l).size === l.length), js(ins));
    const idsApres = await pg.evaluate(() => S.programmes[0].days[0].exs.map(e => ({ ex: e.exId, s: e.sets.map(s => s.sid) })));
    t('SCFH-A14 ⭐ les identités posées AVANT n\'ont jamais été renouvelées : le bloc « 63,63 » (exId + 2 sid) et le curl sont ceux de la séance enregistrée ; la séance enregistrée n\'a pas changé',
      idsApres[2].ex === ids0[0].ex && egal(idsApres[2].s, ids0[0].s) && idsApres[1].ex === ids0[2].ex && J_(await sess(), [sA]), js({ idsApres, ids0 }));
    // A15 — des séances ANCIENNES avec `progId` mais sans `progDayId` : le libellé du jour est UNIQUE (rapprochement du jour permis) ; les blocs homonymes y restent ambigus
    await raz([{ id: 'p-scfh-anc', name: 'Fictif ancien', days: [{ label: 'HAUT', exs: [EXO(ZO, [SE(57, 5)]), EXO(ZO, [SE(63, 5)])] }, { label: 'BAS', exs: [EXO(CU, [SE(57, 5)]), EXO(CU, [SE(63, 5)])] }] }],
      [{ id: 5, ts: t0 - 3000, date: '2026-10-30', progId: 'p-scfh-anc', progLabel: 'HAUT', exs: [{ name: ZO, note: '', sets: [{ kg: 17, reps: 5, type: 'N', done: true }] }, { name: ZO, note: '', sets: [{ kg: 34, reps: 5, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 },
       { id: 6, ts: t0 - 2500, date: '2026-10-31', progId: 'p-scfh-anc', progLabel: 'BAS', exs: [{ name: CU, note: 'lourd', sets: [{ kg: 17, reps: 5, type: 'N', done: true }] }, { name: CU, note: 'léger', sets: [{ kg: 34, reps: 5, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }]);
    const anc0 = await charge(0, 0), anc1 = await pg.evaluate(() => { S.programmes[0].days[1].exs[0].note = 'lourd'; S.programmes[0].days[1].exs[1].note = 'léger'; persist(); return H.charge(0, 1); });
    t('SCFH-A15 ⭐⭐ séances d\'AVANT les identités de jour (`progId` sans `progDayId`) : le jour « HAUT » (deux blocs homonymes sans commentaire) → ses PRESCRIPTIONS (57 · 63) ; le jour « BAS » (commentaires distincts « lourd » / « léger ») retrouve les siens (17 · 34) — le jour se reconnaît par son libellé unique, le bloc jamais par le rang',
      egal(kgs(anc0), ['57', '63']) && egal(kgs(anc1), ['17', '34']), js({ a: kgs(anc0), b: kgs(anc1) }));
  });

  // ═══ B. LA DERNIÈRE SÉANCE NE CONTIENT PAS L'EXERCICE : la PRESCRIPTION (H07) ═══
  await section('B', async () => {
    const PROG = (extra) => Object.assign({ id: 'p-scfh-b', name: 'Fictif B', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(34, 8, 'N', 91)]), EXO(CU, [SE(17, 10, 'N', 62)])] }] }, extra || {});
    for (const [nom, extra] of [['programme ancien (sans `prescrit`)', {}], ['programme importé / de Milo (`prescrit:true`)', { prescrit: true, force: true }]]) {
      await raz([PROG(extra)], [await pg.evaluate(() => H.ailleurs(['Zorglub Presse Quantique'], null, 99, Date.now() - 1000))]);   // une séance libre PLUS RÉCENTE qui porte l'exercice (99) : jamais prise
      await fait(0, 0, [[0, 0, 63, 8], [1, 0, 57, 10]]);                                           // séance 1 : les deux exercices
      await pg.waitForTimeout(25);
      const s2 = await fait(0, 0, [[1, 0, 72, 10]], [0]);                                           // séance 2 (la dernière) : le 1ᵉʳ exercice n'est pas fait
      const av = JSON.stringify(await sess());
      const w = await charge(0, 0);
      t('SCFH-B01 ⭐⭐⭐ ' + nom + ' — sonde SEANCE-absent-derniere-prescription : la dernière séance TERMINÉE du jour ne contient pas « ' + ZO + ' » (non fait) → sa PRESCRIPTION (34), ni 63 (la séance 1) ni 99 (une séance libre plus récente) ; l\'exercice présent prend la sienne (72)',
        egal(kgs(w), ['34', '72']) && !s2.exs.some(e => e.name === ZO && e.sets.some(x => x.done)) && av === JSON.stringify(await sess()), js({ kg: kgs(w), s2: s2.exs.map(e => [e.name, e.sets.some(x => x.done)]) }));
      t('SCFH-B02 ⭐ … et seulement la REPRISE de valeurs change : la colonne « Précédent » / les « 4 dernières séances » montrent toujours la dernière fois de l\'exercice (63, la séance 1)',
        await pg.evaluate(() => { const g = getPrev('Zorglub Presse Quantique'), l = _seancesExercice('Zorglub Presse Quantique', 4); return g.length === 1 && g[0].kg === 63 && l.length === 2 && l[0].sets[0].kg === 63 && l[1].sets[0].kg === 99; }), '');
    }
    // B03 — le repos : la priorité des retouches manuelles (par champ et par série, repos compris) est conservée
    const rep = await pg.evaluate(() => { const p = S.programmes[0]; const e = p.days[0].exs[1]; e.sets[0].rest = 88; e.sets[0].ed = { rest: Date.now() + 100000 }; persist(); const w = H.charge(0, 0); return { zo: w.exs[0].sets[0], cu: w.exs[1].sets[0] }; });
    t('SCFH-B03 ⭐⭐ la retouche manuelle du REPOS (plus récente que la séance) garde la main pour SON champ — 88 s — pendant que la charge de la même série reprend la dernière séance (72) ; l\'exercice absent garde sa prescription entière (34 kg × 8, repos 91 s)',
      rep.cu.rest === 88 && rep.cu.kg === 72 && rep.zo.kg === 34 && rep.zo.rest === 91 && rep.zo.reps === 8, js(rep));
    // B04 — jamais de retour à une recherche par nom dans tout l'historique (fonction réelle)
    const sondes = await pg.evaluate(() => { const ex = (name, kg) => ({ name, sets: [{ kg, reps: 5 }] }); const cur = [ex('Fictif', 57)]; const recente = { ts: 200, exs: [ex('Autre', 10)] }, ancienne = { ts: 100, exs: [ex('Fictif', 20)] };
      return { a: _prevDuJour([recente, ancienne], cur[0], cur).sets.length, b: _prevDuJour([ancienne], cur[0], cur).sets.length, c: _prevDuJour([], cur[0], cur).sets.length, d: _prevDuJour([{ ts: 300, exs: [{ name: 'Fictif', sets: [{ kg: 99, reps: 5, done: false }] }] }, ancienne], cur[0], cur).sets.length }; });
    t('SCFH-B04 ⭐⭐ sonde directe `_prevDuJour([récente sans l\'exercice, ancienne avec], …)` : 0 série ; la dernière seule qui le contient : 1 ; aucune séance : 0 ; la dernière le porte avec des séries NON faites : 0 (pas la plus ancienne)', egal(sondes, { a: 0, b: 1, c: 0, d: 0 }), js(sondes));
    // B05 — un jour jamais fait / un jour d'un AUTRE programme : toujours la prescription (aucune recherche globale)
    await raz([PROG({}), { id: 'p-scfh-b2', name: 'Fictif B2', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(72, 8)])] }] }], []);
    await fait(0, 0, [[0, 0, 63, 8], [1, 0, 57, 10]]);
    const autre = await charge(1, 0);
    t('SCFH-B05 ⭐ un AUTRE programme (même nom de jour, même exercice) ne reprend rien de la séance faite dans le premier : sa prescription (72)', egal(kgs(autre), ['72']), js(kgs(autre)));
  });

  // ═══ C. VALIDER UNE CHARGE VIDE ═══
  await section('C', async () => {
    const KG = (ei, si) => `#sr-${ei}-${si} input[inputmode="decimal"]`, CHK = (ei, si) => `#sr-${ei}-${si} .chk`;
    const voir = async (ei) => { await pg.evaluate((ei) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderExBlocks(); }, ei); await pg.waitForTimeout(220); };
    const taper = async (sel, v) => { await pg.click(sel); await pg.fill(sel, String(v)); await pg.press(sel, 'Tab'); await pg.waitForTimeout(90); };
    const valider = async (ei, si) => { await pg.click(CHK(ei, si)); await pg.waitForTimeout(90); await pg.evaluate(() => { stopRest(); }); await pg.waitForTimeout(60); };
    const ph = (ei, si) => pg.$eval(KG(ei, si), (e) => e.placeholder);
    const ligne = (ei, si) => pg.evaluate(([ei, si]) => { const s = S.wkt.exs[ei].sets[si]; return { kg: s.kg === undefined ? 'U' : s.kg, pdc: s.pdc === undefined ? '' : s.pdc, done: !!s.done }; }, [ei, si]);
    const prevTxt = (ei, si) => pg.$eval(`#sr-${ei}-${si} .sprev`, (e) => e.textContent.replace(/\s+/g, ' ').trim());
    const t0 = Date.now();
    // le programme : un exercice au poids du corps (PDC +12 prescrit · charge inconnue · zéro écrit), un exercice à charge inconnue, un dropset
    const PROG = () => ({ id: 'p-scfh-c', name: 'Fictif C', days: [{ label: 'JOUR A', exs: [
      EXO(TR, [SE(null, 8, 'N', 60, { pdc: 12 }), SE(null, 8, 'N', 60), SE(0, 8, 'N', 60)]),
      EXO(ZO, [SE(null, 10, 'N', 60), SE(null, 10, 'N', 60)]),
      EXO(CU, [SE(40, 10, 'N', 60), SE(36, 10, 'N', 0), SE(32, 10, 'N', 0)], { dropset: { paliers: 2, pct: 10, direction: 'down' } })] }] });
    // l'historique d'AILLEURS : une séance libre (99 · PDC−20) et une séance d'un AUTRE programme (63), mêmes exercices
    const AILLEURS = () => pg.evaluate(() => { const lib = H.ailleurs(['Zorglub Presse Quantique', 'Curl Haltères'], null, 99, Date.now() - 9 * 864e5); lib.exs.push({ name: 'Tractions (Pull-up)', sets: [{ kg: 99, reps: 3, type: 'N', done: true }, { kg: 0, pdc: -20, reps: 3, type: 'N', done: true }] });
      const aut = H.ailleurs(['Zorglub Presse Quantique', 'Curl Haltères'], 'p-scfh-autre', 63, Date.now() - 5 * 864e5); aut.exs.push({ name: 'Tractions (Pull-up)', sets: [{ kg: 63, reps: 3, type: 'N', done: true }, { kg: 0, pdc: -20, reps: 3, type: 'N', done: true }] }); return [aut, lib]; });   // la plus RÉCENTE d'abord, comme `S.sessions` dans l'app
    await raz([PROG()], await AILLEURS());
    const avant = JSON.stringify(await sess());
    await charge(0, 0);
    await voir(1);
    t('SCFH-C01 ⭐⭐⭐ 1ᵉʳ chargement, charge INCONNUE, historique d\'un AUTRE programme (63) et d\'une séance libre (99) : le champ de charge ne SUGGÈRE rien (vide) ; la colonne « Précédent » montre, elle, la dernière fois (comparaison)',
      (await ph(1, 0)) === '' && (await ph(1, 1)) === '' && /63/.test(await prevTxt(1, 0)), js({ ph: await ph(1, 0), prev: await prevTxt(1, 0) }));
    await valider(1, 0);
    const c1 = await ligne(1, 0);
    t('SCFH-C02 ⭐⭐⭐ valider cette charge vide, sans rien taper : elle RESTE inconnue (`null`) — ni 63 (autre programme) ni 99 (séance libre), ni zéro inventé, ni PDC', c1.kg === null && c1.pdc === '' && c1.done, js(c1));
    await taper(KG(1, 1), '0'); await valider(1, 1);
    const c2 = await ligne(1, 1);
    t('SCFH-C03 ⭐⭐ un ZÉRO ÉCRIT au clavier puis ✓ : 0 (un zéro écrit reste un zéro), pas la suggestion d\'ailleurs', c2.kg === 0 && c2.pdc === '' && c2.done, js(c2));
    await voir(0);
    t('SCFH-C04 ⭐⭐ l\'exercice au poids du corps : le champ de charge ne suggère ni « 99 » ni « PDC−20 » (la séance libre) ni « 63 »', (await ph(0, 0)) === '' && (await ph(0, 1)) === '' && (await ph(0, 2)) === '', js([await ph(0, 0), await ph(0, 1), await ph(0, 2)]));
    await valider(0, 0); await valider(0, 1); await valider(0, 2);
    const c3 = [await ligne(0, 0), await ligne(0, 1), await ligne(0, 2)];
    t('SCFH-C05 ⭐⭐⭐ PDC + lest prescrit (+12) : ✓ garde le PDC+12 ; la charge inconnue (n°2) RESTE inconnue — le « PDC−20 » de la séance libre / de l\'autre programme n\'est pas repris, aucun PDC inventé ; le zéro écrit (n°3) reste 0',
      c3[0].pdc === 12 && c3[0].kg === 0 && c3[1].kg === null && c3[1].pdc === '' && c3[2].kg === 0 && c3[2].pdc === '', js(c3));
    // dropset : la suggestion de la ligne courante (2ᵉ endroit où le champ de charge est dessiné)
    await voir(2);
    const phs = await pg.evaluate(() => [...document.querySelectorAll('#ex-block-2 input[inputmode="decimal"]')].map((i) => i.placeholder));
    t('SCFH-C06 ⭐ le dropset (les deux dessins du champ de charge — série normale et palier courant) ne suggère pas non plus la valeur d\'ailleurs (99 · 63)', phs.length >= 1 && phs.every((p) => p === ''), js(phs));
    t('SCFH-C07 ⭐ l\'historique d\'ailleurs n\'est pas modifié par tout cela (octet pour octet), et aucun appel au modèle n\'est parti (toute requête hors du serveur local est coupée)', JSON.stringify((await sess())) === avant && dehors.every((d) => d.a !== 'coach' && !/anthropic/.test(d.u)), js(dehors.slice(0, 3)));
    // C08 — fin de séance : la charge inconnue est enregistrée telle quelle (null), rien d'inventé
    const fin = await pg.evaluate(async () => { S.wkt.exs.forEach((e) => e.sets.forEach((s) => { s.done = true; })); await finishWorkout(); await new Promise((r) => setTimeout(r, 14)); const s = S.sessions.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))[0]; return JSON.parse(JSON.stringify({ zo: s.exs.find((e) => e.name === 'Zorglub Presse Quantique').sets.map((x) => x.kg), tr: s.exs.find((e) => e.name === 'Tractions (Pull-up)').sets.map((x) => [x.kg, x.pdc === undefined ? '' : x.pdc]) })); });
    t('SCFH-C08 ⭐⭐ la séance ENREGISTRÉE garde les états tels quels : charge inconnue = `null`, zéro écrit = 0, PDC+12 ; aucune suggestion d\'ailleurs n\'y est entrée', egal(fin.zo, [null, 0]) && egal(fin.tr, [[0, 12], [null, ''], [0, '']]), js(fin));

    // C09 — l'HISTORIQUE ADMISSIBLE (même programme, même jour, par identité) reste proposé : la série dont la charge est vide (retouche plus récente) reprend la dernière fois par ✓
    await raz([PROG()], await AILLEURS());
    await fait(0, 0, [[1, 0, 57, 10], [1, 1, 34, 10]]);
    await pg.evaluate(() => { const s = S.programmes[0].days[0].exs[1].sets[0]; s.kg = null; s.ed = { kg: Date.now() + 100000 }; persist(); });
    const w = await charge(0, 0);
    await voir(1);
    const p0 = await ph(1, 0), p1 = await ph(1, 1);
    t('SCFH-C09 ⭐⭐ historique ADMISSIBLE (la séance faite de CE jour de CE programme, par identité) : la série à charge vide (retouche plus récente) le propose — 57 — ; la série voisine, déjà reprise (34), aussi', w.exs[1].sets[0].kg === null && p0 === '57' && p1 === '34', js({ kg: kgs(w), p0, p1 }));
    await valider(1, 0);
    const c9 = await ligne(1, 0);
    t('SCFH-C10 ⭐⭐ … et ✓ la reprend (57) : c\'est l\'historique du MÊME jour du MÊME programme, jamais celui d\'ailleurs (99 · 63)', c9.kg === 57 && c9.done, js(c9));

    // C11 — séance LIBRE : une autre séance libre reste proposée (aucun programme en jeu) ; la valeur d'un PROGRAMME ne l'est pas
    await raz([], [await pg.evaluate(() => H.ailleurs(['Zorglub Presse Quantique'], null, 57, Date.now() - 4 * 864e5))]);
    await pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 0, reps: 10, type: 'N', done: false, rm1: 0, rest: 60 }] }] }; persist(); });
    await voir(0);
    const lib1 = await ph(0, 0); await valider(0, 0); const lib1k = await ligne(0, 0);
    await raz([], [await pg.evaluate(() => H.ailleurs(['Zorglub Presse Quantique'], 'p-scfh-autre', 63, Date.now() - 4 * 864e5))]);
    await pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 0, reps: 10, type: 'N', done: false, rm1: 0, rest: 60 }] }] }; persist(); });
    await voir(0);
    const lib2 = await ph(0, 0); await valider(0, 0); const lib2k = await ligne(0, 0);
    t('SCFH-C11 ⭐⭐ séance LIBRE : la dernière séance libre (57) reste proposée et ✓ la reprend ; la séance d\'un PROGRAMME (63) n\'est pas proposée, ✓ ne la reprend pas (0, rien d\'inventé)', lib1 === '57' && lib1k.kg === 57 && lib2 === '' && lib2k.kg === 0, js({ lib1, lib1k, lib2, lib2k }));
  });

  await section('D', async () => {
    // D01 — l'INCERTITUDE ne suggère rien : le programme de la séance a disparu / son jour est introuvable → aucune suggestion, ✓ n'invente rien
    const KG = (ei, si) => `#sr-${ei}-${si} input[inputmode="decimal"]`;
    const voir = async (ei) => { await pg.evaluate((ei) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderExBlocks(); }, ei); await pg.waitForTimeout(220); };
    const ph = (ei, si) => pg.$eval(KG(ei, si), (e) => e.placeholder);
    const PROG = () => ({ id: 'p-scfh-d', name: 'Fictif D', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(null, 10, 'N', 60)])] }] });
    await raz([PROG()], []);
    await fait(0, 0, [[0, 0, 57, 10]]);
    await charge(0, 0); await voir(0);
    const ok = await ph(0, 0);
    await pg.evaluate(() => { S.programmes = []; renderExBlocks(); }); await pg.waitForTimeout(150);
    const sansProg = await ph(0, 0);
    await pg.evaluate(() => { S.programmes = [{ id: 'p-scfh-d', name: 'Fictif D', days: [{ id: 'j-autre-jour', label: 'JOUR A', exs: [] }] }]; renderExBlocks(); }); await pg.waitForTimeout(150);
    const sansJour = await ph(0, 0);
    t('SCFH-D01 ⭐⭐ l\'incertitude ne suggère RIEN : avec son programme et son jour la série propose sa dernière fois (57) ; si le programme de la séance a disparu, ou si son jour est introuvable, le champ ne suggère plus rien', ok === '57' && sansProg === '' && sansJour === '', js({ ok, sansProg, sansJour }));
    // D02 — un AUTRE jour du MÊME programme (jour 2, jamais le même exercice dans le jour courant) ne prête pas sa dernière fois
    const P2 = () => ({ id: 'p-scfh-e', name: 'Fictif E', days: [{ label: 'HAUT', exs: [EXO(ZO, [SE(null, 10, 'N', 60)])] }, { label: 'BAS', exs: [EXO(ZO, [SE(null, 10, 'N', 60)])] }] });
    await raz([P2()], []);
    await fait(0, 0, [[0, 0, 63, 10]]);                                           // le jour HAUT fait avec 63
    await charge(0, 1); await voir(0);
    const autreJour = await ph(0, 0);
    t('SCFH-D02 ⭐⭐ le jour « BAS » (jamais fait) du même programme ne propose pas la dernière fois du jour « HAUT » (63) : un autre jour est une autre séance', autreJour === '', js(autreJour));
  });

  // ═══ E. LOT C DE LA FINALE — LA PROVENANCE DES CHARGES, PARTOUT : ajouter un exercice / une série, remplacer, dropset, séance de Milo, séance libre ═══
  // Arbitrages de Michel (17/11/2026) : séance libre = SEULEMENT la dernière séance libre admissible du même exercice, sans ambiguïté ; `addExercise` / `addSet` suivent les mêmes règles de provenance que la validation d'une série ; une charge inconnue n'est JAMAIS transformée en zéro.
  await section('E', async () => {
    const PROG1 = () => ({ id: 'p-scfh-f', name: 'Fictif F', days: [{ label: 'JOUR A', exs: [EXO(CU, [SE(63, 5, 'N', 60)])] }] });
    const autre = (noms, kg, age, extra) => pg.evaluate(([n, k, a, x]) => H.ailleurs(n, 'p-scfh-autre', k, Date.now() - a * 864e5, x || undefined), [noms, kg, age, extra || null]);   // une séance d'UN AUTRE PROGRAMME
    const libre = (noms, kg, age, extra) => pg.evaluate(([n, k, a, x]) => H.ailleurs(n, null, k, Date.now() - a * 864e5, x || undefined), [noms, kg, age, extra || null]);                // une séance LIBRE
    const hist = (l) => pg.evaluate((l) => { S.sessions = l; persist(); }, l);
    const seanceLibre = (exs) => pg.evaluate((exs) => { S.wkt = { date: today(), exs: exs || [] }; persist(); }, exs || []);
    const ajoute = (nom) => pg.evaluate((n) => { _exPickerMode = 'workout'; addExercise(n); return JSON.parse(JSON.stringify(S.wkt.exs[S.wkt.exs.length - 1].sets)); }, nom);
    const ks = (sets) => sets.map((s) => s.kg);
    const ajouteSerie = (ei) => pg.evaluate((ei) => { addSet(ei); const l = S.wkt.exs[ei].sets; return JSON.parse(JSON.stringify(l[l.length - 1])); }, ei);
    const jeu = (sets) => ({ name: CU, note: '', sets });
    const ex0 = (name, sets) => ({ name, note: '', sets });
    const SN = (kg, reps, extra) => Object.assign({ kg, reps, type: 'N', done: false, rm1: 0, rest: 60 }, extra || {});
    const SD = (kg, reps, extra) => Object.assign({ kg, reps, type: 'N', done: true }, extra || {});

    // ── 1. séance LIBRE : l'ajout d'un exercice ne reprend que la dernière séance LIBRE ──
    await raz([], null);
    const hLib = [await autre([ZO], 99, 1), await libre([ZO], 57, 4)];                  // la séance d'un programme est PLUS RÉCENTE (99) ; la dernière séance libre (57) est plus ancienne
    await hist(hLib); await seanceLibre();
    const av1 = JSON.stringify(await sess());
    const e1 = await ajoute(ZO);
    t('SCFH-E01 ⭐⭐⭐ ajouter un exercice à une séance LIBRE : la valeur est celle de la dernière séance LIBRE (57) — la séance d\'un programme, plus récente (99), est sautée, pas lue ; l\'historique n\'est pas modifié', egal(ks(e1), [null, 57, 57]) && av1 === JSON.stringify(await sess()), js(ks(e1)));
    await hist([await autre([ZO], 99, 1)]); await seanceLibre();
    const e2 = await ajoute(ZO);
    t('SCFH-E02 ⭐⭐⭐ … et sans AUCUNE séance libre pour cet exercice (seulement la séance d\'un programme, 99) : rien n\'est repris — la charge reste INCONNUE (null, plus un zéro inventé — lot Z), jamais 99', egal(ks(e2), [null, null, null]) && e2.every((s) => s.reps === 5), js(e2));
    await hist([await libre([ZO], 57, 4, { exs: [ex0(ZO, [SD(17, 7), SD(17, 7)]), ex0(ZO, [SD(34, 7), SD(34, 7)])] })]); await seanceLibre();
    const e3 = await ajoute(ZO);
    t('SCFH-E03 ⭐⭐ deux blocs HOMONYMES dans la dernière séance libre (17 et 34) : on ne sait pas lequel est « le même » — AUCUNE valeur (inconnue · inconnue · inconnue, plus des zéros inventés — lot Z), ni le 1ᵉʳ ni le dernier', egal(ks(e3), [null, null, null]), js(ks(e3)));
    await hist([await libre([ZO], 57, 4, { exs: [ex0(ZO, [SD(0, 7), SD(null, 7)])] })]); await seanceLibre();
    const e4 = await ajoute(ZO);
    t('SCFH-E04 ⭐⭐ le ZÉRO ancien reste zéro (0) et la charge ANCIENNE inconnue reste inconnue (`null`), jamais un nombre inventé', egal(ks(e4), [null, 0, null]), js(ks(e4)));
    await hist([await autre([TR], 99, 1, { exs: [ex0(TR, [SD(0, 5, { pdc: -20 })])] }), await libre([TR], 57, 4, { exs: [ex0(TR, [SD(0, 5, { pdc: 12 }), SD(0, 5, { pdc: 12 })])] })]); await seanceLibre();
    const e5 = await ajoute(TR);
    t('SCFH-E05 ⭐⭐ le poids du corps suit la source admissible : la dernière séance libre disait PDC + lest 12 → les séries ajoutées le redisent (+12) ; le « PDC − 20 » d\'un programme plus récent n\'est pas repris', e5.slice(1).every((s) => s.pdc === 12 && s.kg === 0) && e5.every((s) => s.pdc !== -20), js(e5));
    await hist([await libre(['Exo Perso Fictif 34'], 57, 4)]); await seanceLibre();
    const av6 = JSON.stringify(await sess());
    const e6 = await ajoute('Exo Perso Fictif 34');
    t('SCFH-E06 un exercice PERSONNALISÉ (nom inventé, absent du catalogue) suit la même règle — 57 depuis la dernière séance libre ; l\'historique n\'est pas modifié (octet pour octet)', egal(ks(e6), [null, 57, 57]) && av6 === JSON.stringify(await sess()), js(ks(e6)));

    // ── 2. séance d'un JOUR DE PROGRAMME : l'ajout depuis le sélecteur ne reprend que CE jour de CE programme ──
    await raz([PROG1()], []); await charge(0, 0);
    const jourId = await pg.evaluate(() => S.programmes[0].days[0].id);
    const memeJour = (noms, kg, age) => pg.evaluate(([n, k, a, j]) => H.ailleurs(n, 'p-scfh-f', k, Date.now() - a * 864e5, { progDayId: j, progLabel: 'JOUR A' }), [noms, kg, age, jourId]);
    await hist([await libre([ZO], 99, 1), await memeJour([ZO], 57, 5)]);
    const f1 = await ajoute(ZO);
    /* ↪️ ORACLE RÉÉCRIT le 18/11/2026 (lot S, contre-sonde 3 + arbitrage « une seule logique de sélection ») — INVARIANT GARDÉ : la valeur de la séance LIBRE (99) n'est jamais reprise dans un jour de programme.
       L'ancien oracle exigeait « rien (0 · 0 · 0) » parce que l'ancien sélecteur lisait « la dernière fois du même nom, tous programmes confondus » PUIS testait si elle était admissible : une séance libre plus récente MASQUAIT la dernière séance de CE jour.
       Le sélecteur unique lit, comme le chargement du jour, la dernière séance terminée de CE jour de CE programme : la séance libre n'en fait pas partie, la séance de CE jour (57) est donc retrouvée. */
    t('SCFH-E07 ⭐⭐⭐ `addExercise` depuis le sélecteur DANS un jour de programme : la séance libre plus récente (99) n\'est jamais reprise ; c\'est la dernière séance de CE jour (57) qui l\'est (inconnue · 57 · 57 : la série sans source reste INCONNUE, plus un zéro inventé — lot Z) — la séance libre ne la masque pas', egal(ks(f1), [null, 57, 57]), js(ks(f1)));
    await pg.evaluate(() => { S.wkt.exs.pop(); });
    await hist([await memeJour([ZO], 57, 5)]);
    const f2 = await ajoute(ZO);
    t('SCFH-E08 ⭐⭐ … quand la dernière fois EST la séance de CE jour de CE programme (par identité), elle est reprise : 57', egal(ks(f2), [null, 57, 57]), js(ks(f2)));
    await pg.evaluate(() => { S.wkt.exs.pop(); });
    await hist([await autre([ZO], 63, 1)]);
    const f3 = await ajoute(ZO);
    t('SCFH-E09 ⭐ la dernière fois est celle d\'un AUTRE programme (63) : rien — jamais empruntée', egal(ks(f3), [null, null, null]), js(ks(f3)));

    // ── 3. addSet : jamais la charge d'un autre programme ; la copie VOLONTAIRE de la série voisine de la séance en cours reste ──
    await raz([PROG1()], []); await charge(0, 0);
    await hist([await autre([CU], 99, 2)]);
    const g1 = await ajouteSerie(0);
    t('SCFH-E10 ⭐⭐⭐ `addSet` dans un jour de programme, la dernière fois étant celle d\'un AUTRE programme (99) : la nouvelle série copie la série voisine de la séance EN COURS (63) — jamais 99', g1.kg === 63 && g1.reps === 5, js(g1));
    // admissible : une 3ᵉ série d'avant existe pour CE jour → elle est reprise ; un programme concurrent plus récent la masque
    const P3 = { id: 'p-scfh-g', name: 'Fictif G', days: [{ label: 'JOUR A', exs: [EXO(CU, [SE(34, 8, 'N', 60), SE(34, 8, 'N', 60), SE(34, 8, 'N', 60)])] }] };
    await raz([P3], []);
    await fait(0, 0, [[0, 0, 57, 8], [0, 1, 63, 8], [0, 2, 72, 8]]);
    await pg.evaluate(() => { S.programmes[0].days[0].exs[0].sets.pop(); persist(); H.charge(0, 0); });           // le programme n'a plus que deux séries ; la séance d'avant en avait trois
    const g2 = await ajouteSerie(0);
    t('SCFH-E11 ⭐⭐ `addSet` avec une source ADMISSIBLE (la séance faite de CE jour, par rôle) : la 3ᵉ série d\'avant (72) est reprise — l\'historique du même jour reste proposé', g2.kg === 72 && g2.reps === 8, js(g2));
    await pg.evaluate(() => { S.wkt.exs[0].sets.pop(); });
    await hist([await autre([CU], 99, 0)].concat(await pg.evaluate(() => S.sessions)));
    const g3 = await ajouteSerie(0);
    /* ↪️ ORACLE RÉÉCRIT le 18/11/2026 (lot S, contre-sonde 3) — INVARIANT GARDÉ : jamais 99, la valeur d'un AUTRE programme. L'ancien oracle attendait la copie de la série voisine (63) parce qu'un autre programme plus récent MASQUAIT la séance de ce jour (le sélecteur lisait
       « la dernière fois du même nom » puis la refusait). Le sélecteur unique retrouve la dernière séance de CE jour de CE programme (sa 3ᵉ série : 72, comme en E11) : la source admissible n'est plus perdue parce qu'un autre programme est plus récent. */
    t('SCFH-E12 ⭐⭐ … un autre programme PLUS RÉCENT (99) ne masque pas la source admissible : la 3ᵉ série d\'avant de CE jour (72) est reprise, jamais 99', g3.kg === 72 && g3.reps === 8, js(g3));
    // inconnu / zéro / PDC / à vide : la copie volontaire les garde tels quels
    await raz([], []);
    await seanceLibre([ex0(CU, [SN(null, 8)])]);
    const h1 = await ajouteSerie(0);
    await pg.evaluate(() => { S.wkt.exs[0].sets = [{ kg: 0, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }]; });
    const h2 = await ajouteSerie(0);
    await pg.evaluate(() => { S.wkt.exs[0].sets = [{ kg: 0, pdc: 12, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }]; });
    const h3 = await ajouteSerie(0);
    await pg.evaluate(() => { S.wkt.exs[0].sets = [{ kg: 0, pdc: -17, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }]; });
    const h4 = await ajouteSerie(0);
    await pg.evaluate(() => { S.wkt.exs[0].sets = [{ kg: 0, vide: true, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }]; });
    const h5 = await ajouteSerie(0);
    await pg.evaluate(() => { S.wkt.exs[0].sets = [{ kg: 34, reps: null, type: 'N', done: false, rm1: 0, rest: 60 }]; });
    const h6 = await ajouteSerie(0);
    t('SCFH-E13 ⭐⭐⭐ une charge INCONNUE (`null`) copiée par « + série » reste inconnue — jamais transformée en zéro', h1.kg === null && h1.pdc === undefined && h1.vide === undefined, js(h1));
    t('SCFH-E14 ⭐⭐ un ZÉRO écrit se copie en zéro (0), pas en inconnu', h2.kg === 0 && h2.pdc === undefined && h2.vide === undefined, js(h2));
    t('SCFH-E15 ⭐⭐ PDC + lest (+12) · PDC − assistance (−17) · barre « à vide » : chacun se copie tel quel (kg 0 · pdc 12 / −17 · vide), sans se confondre', h3.pdc === 12 && h3.kg === 0 && h4.pdc === -17 && h4.kg === 0 && h5.vide === true && h5.kg === 0 && h5.pdc === undefined, js([h3, h4, h5]));
    t('SCFH-E16 les répétitions « Non renseigné » (`null`) se copient aussi (correction D inchangée) ; la charge 34 aussi', h6.reps === null && h6.kg === 34, js(h6));

    // ── 4. le champ de charge d'une séance LIBRE : la dernière séance libre est proposée, ✓ la reprend ; ambigu → rien ──
    const KG = (ei, si) => `#sr-${ei}-${si} input[inputmode="decimal"]`, CHK = (ei, si) => `#sr-${ei}-${si} .chk`;
    const voir = async (ei) => { await pg.evaluate((ei) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderExBlocks(); }, ei); await pg.waitForTimeout(220); };
    const ph = (ei, si) => pg.$eval(KG(ei, si), (e) => e.placeholder);
    const valider = async (ei, si) => { await pg.click(CHK(ei, si)); await pg.waitForTimeout(90); await pg.evaluate(() => { stopRest(); }); await pg.waitForTimeout(60); };
    const kgDe = (ei, si) => pg.evaluate(([ei, si]) => S.wkt.exs[ei].sets[si].kg, [ei, si]);
    await raz([], null);
    await hist([await autre([ZO], 99, 1), await libre([ZO], 57, 4)]);
    await seanceLibre([ex0(ZO, [SN(0, 10)])]); await voir(0);
    const i1 = await ph(0, 0); await valider(0, 0); const i1k = await kgDe(0, 0);
    t('SCFH-E17 ⭐⭐⭐ séance LIBRE, une séance de programme PLUS RÉCENTE (99) et une séance libre plus ancienne (57) : le champ propose 57 (la dernière séance libre) et ✓ la reprend ; jamais 99', i1 === '57' && i1k === 57, js({ i1, i1k }));
    await hist([await libre([ZO], 57, 4, { exs: [ex0(ZO, [SD(17, 7)]), ex0(ZO, [SD(34, 7)])] })]);
    await seanceLibre([ex0(ZO, [SN(0, 10)])]); await voir(0);
    const i2 = await ph(0, 0); await valider(0, 0); const i2k = await kgDe(0, 0);
    t('SCFH-E18 ⭐⭐ … la dernière séance libre porte DEUX blocs de ce nom (17 · 34) : ambigu → le champ ne propose rien, ✓ n\'importe rien (0)', i2 === '' && i2k === 0, js({ i2, i2k }));
    await hist([await autre([TR], 99, 1, { exs: [ex0(TR, [SD(0, 5, { pdc: -20 })])] }), await libre([TR], 57, 4, { exs: [ex0(TR, [SD(0, 5, { pdc: 12 })])] })]);
    await seanceLibre([ex0(TR, [SN(0, 5)])]); await voir(0);
    const i3 = await ph(0, 0); await valider(0, 0); const i3k = await pg.evaluate(() => S.wkt.exs[0].sets[0].pdc);
    t('SCFH-E19 ⭐⭐ séance libre au poids du corps : le champ propose « PDC+12 » (la dernière séance libre), ✓ le reprend ; jamais le « PDC−20 » du programme plus récent', i3 === 'PDC+12' && i3k === 12, js({ i3, i3k }));

    // ── 5. remplacer un exercice · dropset · séance de Milo : la même source ──
    await raz([], null);
    await hist([await autre([ZO], 99, 1), await libre([ZO], 57, 4)]); await seanceLibre();
    const r1 = await pg.evaluate((n) => _exerciceRemplacant(n, [{ type: 'N' }, { type: 'N' }], null).sets.map((s) => s.kg), ZO);
    await hist([await autre([ZO], 99, 1)]);
    const r2 = await pg.evaluate((n) => _exerciceRemplacant(n, [{ type: 'N' }, { type: 'N' }], null).sets.map((s) => s.kg), ZO);
    t('SCFH-E20 ⭐⭐ « Remplacer l\'exercice » : le nouvel exercice reprend la dernière séance LIBRE (57 · 57) ; sans séance libre il part à charge INCONNUE (null · null, plus un zéro inventé — lot Z), jamais 99', egal(r1, [57, 57]) && egal(r2, [null, null]), js({ r1, r2 }));
    const dropset = (sets, h) => pg.evaluate(async ([sets, h]) => { S.sessions = h; S.wkt = { date: today(), exs: [{ name: 'Zorglub Presse Quantique', note: '', sets }] }; _dropCfgEi = 0; _dropCfgPct = 10; _dropCfgDir = 'down'; _dropCfgPaliers = 3; applyDropset(); return JSON.parse(JSON.stringify(S.wkt.exs[0].sets.map((s) => s.kg))); }, [sets, h]);
    /* ⚖️ ORACLE RÉÉCRIT (lot Z, 18/11/2026 — arbitrage de Michel : « une charge inconnue n'est jamais transformée en zéro ; un zéro explicite n'est jamais écrasé par l'historique »). L'INVARIANT est gardé : la base d'un dropset sur une série SANS charge
       vient de la dernière séance LIBRE (57), jamais d'un programme (99) ; sans rien d'admissible rien n'est inventé. Ce qui change : « SANS charge » se dit désormais INCONNUE (`null`) — avant, le test la posait en zéro écrit (`0`) et exigeait que `0||57`
       la remplace par l'historique, ce qui est justement le piège `0||x` ; un ZÉRO ÉCRIT (d4), lui, reste 0 même devant une source admissible. */
    const d1 = await dropset([SN(null, 8)], [await autre([ZO], 99, 1)]);
    const d2 = await dropset([SN(null, 8)], [await autre([ZO], 99, 1), await libre([ZO], 57, 4)]);
    const d3 = await dropset([SN(null, 8)], []);
    const d4 = await dropset([SN(0, 8)], [await autre([ZO], 99, 1), await libre([ZO], 57, 4)]);
    t('SCFH-E21 ⭐⭐ dropset créé sur une série SANS charge (inconnue) : le départ vient de la dernière séance libre (57), jamais d\'un programme (99) ; sans rien d\'admissible les paliers restent INCONNUS (null, jamais un zéro) ; un ZÉRO écrit reste 0 même devant une source admissible',
      d1.length === 3 && d1.every((k) => k === null) && d2[0] === 57 && d2.every((k) => k > 0 && k <= 57) && d3.length === 3 && d3.every((k) => k === null) && d4.length === 3 && d4.every((k) => k === 0), js({ d1, d2, d3, d4 }));
    const milo = (h) => pg.evaluate(async ([h]) => { S.sessions = h; S.wkt = null; persist(); _pendingMiloSessions = [{ label: 'Séance fictive 17', exs: [{ name: 'Zorglub Presse Quantique', sets: [{ kg: 0, reps: 10, type: 'N', rest: 60 }, { kg: 0, reps: 10, type: 'N', rest: 60 }] }] }]; _startSessionFromMilo(0, null); return S.wkt ? JSON.parse(JSON.stringify(S.wkt.exs[0].sets.map((s) => s.kg))) : null; }, [h]);
    const m1 = await milo([await autre([ZO], 99, 1), await libre([ZO], 57, 4)]);
    const m2 = await milo([await autre([ZO], 99, 1)]);
    /* ↪️ ORACLE RÉÉCRIT le 18/11/2026 (lot S, consigne du lot Z « inconnue ≠ zéro ») — INVARIANT GARDÉ : jamais la valeur d'un programme (99). Sans source admissible, la charge de Milo « non précisée » était un 0 INVENTÉ (`pp?pp.kg:0`) : elle est maintenant INCONNUE (`null`). */
    t('SCFH-E22 ⭐⭐ séance de MILO (une séance libre) : sans charge donnée, « la dernière fois » est la dernière séance LIBRE (57 · 57), jamais celle d\'un programme (99) ; sans séance libre → charge inconnue (null · null), pas un zéro inventé', egal(m1, [57, 57]) && egal(m2, [null, null]), js({ m1, m2 }));
    // la 2ᵉ PORTE de Milo (`_applyMiloSession` : une séance tourne déjà, « remplacer ») lit la MÊME source — avant : la dernière fois de tous les programmes, par POSITION
    const milo2 = (h) => pg.evaluate(([h]) => { S.sessions = h; _pendingMiloSessions = [{ label: 'Séance fictive 17', exs: [{ name: 'Zorglub Presse Quantique', sets: [{ kg: 0, reps: 10, type: 'N', rest: 60 }, { kg: 0, reps: 10, type: 'N', rest: 60 }] }] }]; _miloPendingIdx = 0; _miloPendingBtn = null;
      S.wkt = { date: today(), startHour: 10, exs: [{ name: 'Exercice fictif à remplacer', sets: [{ kg: 0, reps: 5, done: false, type: 'N', rm1: 0 }] }] }; _applyMiloSession('replace'); return S.wkt ? JSON.parse(JSON.stringify(S.wkt.exs[0].sets.map((s) => s.kg))) : null; }, [h]);
    const n1 = await milo2([await autre([ZO], 99, 1), await libre([ZO], 57, 4)]);
    const n2 = await milo2([await autre([ZO], 99, 1)]);
    t('SCFH-E22b ⭐⭐ … la SECONDE porte de Milo (une séance tourne déjà, « remplacer ») lit la même source : 57 · 57 depuis la dernière séance libre, charge inconnue (null · null — oracle réécrit le 18/11 : plus de zéro inventé) sans elle — jamais 99', egal(n1, [57, 57]) && egal(n2, [null, null]), js({ n1, n2 }));
    t('SCFH-E23 aucun appel au modèle n\'est parti pendant ces scénarios (toute requête hors du serveur local est coupée)', dehors.every((d) => d.a !== 'coach' && !/anthropic/.test(d.u)), js(dehors.slice(0, 3)));
  });

  // ═══ F. LOT S DE LA V3 (18/11/2026) — UN SEUL SÉLECTEUR de « la dernière fois » : le BLOC par identité, la dernière séance de CE jour seulement, les répétitions comme les charges, Milo selon sa destination ═══
  // Contre-sondes 1, 2, 3 de la contre-expertise : deux blocs de même nom (`_reprise` lisait le nom) · l'exercice absent de la dernière séance du jour (une séance plus ancienne était reprise) · un autre programme plus récent (il masquait la séance de CE jour).
  await section('F', async () => {
    const SN = (kg, reps, extra) => Object.assign({ kg, reps, type: 'N', done: false, rm1: 0, rest: 60 }, extra || {});
    const voir = async (ei) => { await pg.evaluate((ei) => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); _expandedEx = ei; goScreen('log', document.getElementById('nb-log')); renderExBlocks(); }, ei); await pg.waitForTimeout(200); };
    const ph = (ei, si, k) => pg.evaluate(([ei, si, k]) => document.querySelectorAll('#sr-' + ei + '-' + si + ' .sinp')[k].placeholder, [ei, si, k]);   // k = 0 : répétitions · k = 1 : charge
    const champs = async (ei, si) => [await ph(ei, si, 0), await ph(ei, si, 1)];
    const faitLe = (i, j, aj, sauf, age) => pg.evaluate(([i, j, a, s, d]) => H.fait(i, j, a, s, d === null ? null : H.iso(d)), [i, j || 0, aj || null, sauf || null, age === undefined ? null : age]);
    const ail = (noms, progId, kg, reps, age) => pg.evaluate(([n, p, k, r, a]) => { const s = H.ailleurs(n, p, k, Date.now() - a * 864e5); s.exs.forEach((e) => e.sets.forEach((x) => { x.reps = r; })); return s; }, [noms, progId, kg, reps, age]);
    const sessionsAvec = (l) => pg.evaluate((l) => { S.sessions = l.concat(S.sessions); persist(); }, l);
    const repr = () => pg.evaluate(() => S.wkt.exs.map((e) => { const r = _reprise(e); return r ? r.sets.map((s) => s.kg) : null; }));
    const lastKg = (ei) => pg.evaluate((ei) => { const l = S.wkt.exs[ei].sets; return JSON.parse(JSON.stringify(l[l.length - 1])); }, ei);
    const ajoute = (nom) => pg.evaluate((n) => { _exPickerMode = 'workout'; addExercise(n); return JSON.parse(JSON.stringify(S.wkt.exs[S.wkt.exs.length - 1].sets)); }, nom);
    const ks = (sets) => sets.map((s) => s.kg);

    // ── F01-F03 : deux blocs de MÊME NOM — chacun retrouve SA dernière fois (identité), jamais celle de l'autre ──
    const DUO = () => ({ id: 'p-scfh-s1', name: 'Fictif S1', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(57, 3)]), EXO(ZO, [SE(34, 8)])] }] });
    await raz([DUO()], []);
    await fait(0, 0, [[0, 0, 17, 3], [1, 0, 63, 8]]);
    const av1 = JSON.stringify(await sess());
    const w1 = await charge(0, 0); await voir(0); const c10 = await champs(0, 0); await voir(1); const c11 = await champs(1, 0); const r1 = await repr();
    t('SCFH-F01 ⭐⭐⭐ contre-sonde 1 — deux blocs de MÊME NOM (identités `exId`), le 1ᵉʳ a fait 17, le 2ᵉ 63 : le chargement donne 17 · 63, et la suggestion de chaque champ (répétitions · charge) vient de SON bloc — 3·17 puis 8·63, jamais 17 pour le 2ᵉ ; `_reprise(bloc)` rend la même chose',
      egal(kgs(w1), ['17', '63']) && egal(c10, ['3', '17']) && egal(c11, ['8', '63']) && egal(r1, [[17], [63]]) && av1 === JSON.stringify(await sess()), js({ kg: kgs(w1), c10, c11, r1 }));
    await pg.evaluate(() => { S.programmes[0].days[0].exs.reverse(); persist(); H.charge(0, 0); });
    await voir(0); const p0 = await champs(0, 0); await voir(1); const p1 = await champs(1, 0);
    t('SCFH-F02 ⭐⭐ … après une PERMUTATION des blocs du programme : chaque bloc suit SON identité — 63 · 17 dans les champs aussi (jamais le rang)', egal(p0, ['8', '63']) && egal(p1, ['3', '17']) && egal(await repr(), [[63], [17]]), js({ p0, p1 }));
    // F03 — homonymes d'une séance d'AVANT les identités : sans commentaire → rien (ni 17 ni 34) ; commentaires uniques → chaque bloc retrouve le sien
    const t0 = Date.now();
    const ANC = (blocs) => ({ id: 31, ts: t0 - 2000, date: '2026-11-01', progId: 'p-scfh-s3', progLabel: 'JOUR A', exs: blocs.map(([note, kg]) => ({ name: ZO, note, sets: [{ kg, reps: 5, type: 'N', done: true }] })), volume: 1, synced: true, uniConv: 1 });
    const PROG3 = (blocs) => ({ id: 'p-scfh-s3', name: 'Fictif S3', days: [{ label: 'JOUR A', exs: blocs.map(([note, kg]) => EXO(ZO, [SE(kg, 5)], { note })) }] });
    await raz([PROG3([['', 57], ['', 63]])], [ANC([['', 17], ['', 34]])]);
    await charge(0, 0); await voir(0); const h0 = await champs(0, 0); await voir(1); const h1 = await champs(1, 0); const hr = await repr();
    t('SCFH-F03 ⭐⭐ homonymes d\'une séance d\'AVANT les identités, sans commentaire : les champs ne suggèrent RIEN (ni 17 ni 34) et `_reprise` rend `null` pour les deux blocs — jamais le rang', egal(h0, ['', '']) && egal(h1, ['', '']) && egal(hr, [null, null]), js({ h0, h1, hr }));
    await raz([PROG3([['Bloc A', 57], ['Bloc B', 63]])], [ANC([['Bloc B', 34], ['Bloc A', 17]])]);
    await charge(0, 0); await voir(0); const k0 = await champs(0, 0); await voir(1); const k1 = await champs(1, 0);
    t('SCFH-F04 ⭐ … commentaires DISTINCTS et uniques de chaque côté : chaque bloc retrouve le sien malgré l\'ordre inversé — 17 · 34 (la règle ne devient pas « jamais »)', egal(k0, ['5', '17']) && egal(k1, ['5', '34']), js({ k0, k1 }));

    // ── F05 : l'exercice est ABSENT de la dernière séance terminée du jour → la PRESCRIPTION (jamais une séance plus ancienne) ──
    const PROG5 = () => ({ id: 'p-scfh-s5', name: 'Fictif S5', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(34, 8, 'N', 91)]), EXO(CU, [SE(17, 10, 'N', 62)])] }] });
    await raz([PROG5()], []);
    await faitLe(0, 0, [[0, 0, 63, 8], [1, 0, 57, 10]], null, 6);
    await pg.waitForTimeout(25);
    await faitLe(0, 0, [[1, 0, 72, 10]], [0], 1);                      // la dernière séance : « ZO » non fait
    const av5 = JSON.stringify(await sess());
    const w5 = await charge(0, 0); await voir(0); const c5 = await champs(0, 0); const r5 = await repr();
    await pg.evaluate(() => addSet(0)); const s5 = await lastKg(0);
    t('SCFH-F05 ⭐⭐⭐ contre-sonde 2 — l\'exercice est absent de la dernière séance du jour (la séance de 6 jours plus tôt l\'avait fait à 63) : le chargement donne sa prescription (34 · 72), le champ ne suggère rien, `_reprise` rend `null`, la série ajoutée copie la série voisine (34 × 8) — jamais 63',
      egal(kgs(w5), ['34', '72']) && egal(c5, ['', '']) && egal(r5, [null, [72]]) && s5.kg === 34 && s5.reps === 8 && av5 === JSON.stringify(await sess()), js({ kg: kgs(w5), c5, r5, s5 }));
    // F06 — dropset : la base ne vient pas non plus d'une séance plus ancienne
    const dr = await pg.evaluate(async () => { const e = S.wkt.exs[0]; e.sets = [{ kg: 0, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }]; _dropCfgEi = 0; _dropCfgPct = 10; _dropCfgDir = 'down'; _dropCfgPaliers = 3; applyDropset(); return JSON.parse(JSON.stringify(S.wkt.exs[0].sets.map((s) => s.kg))); });
    t('SCFH-F06 ⭐⭐ … et la base d\'un dropset créé sur l\'exercice absent ne reprend pas 63 : aucun palier ne vient de la séance plus ancienne', dr.length === 3 && dr.every((k) => !(k > 0)), js(dr));

    // ── F07-F08 : un AUTRE programme plus récent (99) ne masque pas la dernière séance de CE jour de CE programme (57) ──
    const PROG7 = () => ({ id: 'p-scfh-s7', name: 'Fictif S7', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(34, 8)])] }] });
    await raz([PROG7()], []);
    await faitLe(0, 0, [[0, 0, 57, 6]], null, 5);
    await sessionsAvec([await ail([ZO], 'p-scfh-autre', 99, 7, 1)]);
    const avant7 = JSON.stringify(await sess());
    await charge(0, 0); await voir(0); const c7 = await champs(0, 0); const r7 = await repr();
    const prevTxt = await pg.$eval('#sr-0-0 .sprev', (e) => e.textContent.replace(/\s+/g, ' ').trim());
    const gp = await pg.evaluate(() => { const g = getPrev('Zorglub Presse Quantique'); return [g.length, g[0] && g[0].kg]; });
    await pg.evaluate(() => addSet(0)); const s7 = await lastKg(0);
    t('SCFH-F07 ⭐⭐⭐ contre-sonde 3 — un AUTRE programme plus récent (99 × 7) ne masque pas la dernière séance de CE jour (57 × 6) : le champ suggère 6 · 57, `_reprise` la retrouve, la série ajoutée la reprend (57 × 6)',
      egal(c7, ['6', '57']) && egal(r7, [[57]]) && s7.kg === 57 && s7.reps === 6 && avant7 === JSON.stringify(await sess()), js({ c7, r7, s7 }));
    t('SCFH-F08 ⭐⭐ « Précédent » reste COMPARATIF (arbitrage de Michel) : la colonne et `getPrev` montrent toujours la dernière fois de l\'exercice (99, l\'autre programme), pas la source reprise (57)', /99/.test(prevTxt) && gp[0] === 2 && gp[1] === 99, js({ prevTxt, gp }));

    // ── F09-F10 : les RÉPÉTITIONS suivent la même source que les charges ──
    await raz([PROG7()], [await ail([ZO], 'p-scfh-autre', 99, 7, 1)]);
    await charge(0, 0); await pg.evaluate(() => { S.wkt.exs[0].sets[0].reps = null; renderExBlocks(); }); await voir(0);
    const rp1 = await champs(0, 0);
    await pg.click('#sr-0-0 .chk'); await pg.waitForTimeout(90); await pg.evaluate(() => { stopRest(); });
    const rv1 = await pg.evaluate(() => { const s = S.wkt.exs[0].sets[0]; return { reps: s.reps, done: s.done }; });
    t('SCFH-F09 ⭐⭐⭐ répétitions : la dernière fois d\'un AUTRE programme (7) n\'est ni suggérée (le champ garde son « ? » de série « Non renseigné ») ni importée par ✓ — la série reste à compléter (null, non validée)', egal(rp1, ['?', '']) && rv1.reps === null && rv1.done === false, js({ rp1, rv1 }));
    await raz([PROG7()], []);
    await faitLe(0, 0, [[0, 0, 57, 6]], null, 5);
    await charge(0, 0); await pg.evaluate(() => { S.wkt.exs[0].sets[0].reps = null; renderExBlocks(); }); await voir(0);
    const rp2 = await champs(0, 0);
    await pg.click('#sr-0-0 .chk'); await pg.waitForTimeout(90); await pg.evaluate(() => { stopRest(); });
    const rv2 = await pg.evaluate(() => { const s = S.wkt.exs[0].sets[0]; return { reps: s.reps, done: s.done }; });
    t('SCFH-F10 ⭐⭐ … et la dernière fois de CE jour (6) est suggérée et importée par ✓ : même source que la charge (57)', egal(rp2, ['6', '57']) && rv2.reps === 6 && rv2.done === true, js({ rp2, rv2 }));

    // ── F11 : un bloc AJOUTÉ sans identité ne se rapproche que s'il est non ambigu ──
    const PROG11 = () => ({ id: 'p-scfh-s11', name: 'Fictif S11', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(34, 8)]), EXO(CU, [SE(17, 10)])] }] });
    await raz([PROG11()], []);
    await faitLe(0, 0, [[0, 0, 63, 8], [1, 0, 57, 10]], null, 5);
    await charge(0, 0);
    await pg.evaluate(() => { S.wkt.exs = S.wkt.exs.filter((e) => e.name === 'Zorglub Presse Quantique'); });                  // le curl du programme a été retiré de la séance en cours
    const a1 = await ajoute(CU);
    await pg.evaluate(() => { S.wkt.exs.pop(); H.charge(0, 0); });                                                            // le curl du programme est là : en ajouter un second est AMBIGU
    const a2 = await ajoute(CU);
    t('SCFH-F11 ⭐⭐ un exercice AJOUTÉ à la main (sans identité) reprend la dernière séance de CE jour quand son nom est non ambigu (inconnue · 57 · 57) ; s\'il y a déjà un curl du programme dans la séance, lequel est « le même » ? on ne sait pas → rien (inconnue · inconnue · inconnue) — ORACLE ADAPTÉ À L\'ASSEMBLAGE (18/11/2026) : le lot S écrivait « 0 » pour une série sans source, le lot Z a établi que sans source la charge est INCONNUE (`null`), jamais un zéro inventé ; même invariant (la source reprise est la bonne, ou rien)', egal(ks(a1), [null, 57, 57]) && egal(ks(a2), [null, null, null]), js({ a1: ks(a1), a2: ks(a2) }));

    // ── F12-F14 : Milo — « ajouter » respecte le jour de la séance en cours, « démarrer » reste libre ──
    const PROG12 = () => ({ id: 'p-scfh-s12', name: 'Fictif S12', days: [{ label: 'JOUR A', exs: [EXO(ZO, [SE(34, 8)]), EXO(CU, [SE(17, 10)])] }] });
    const prepare = async () => { await raz([PROG12()], []); await faitLe(0, 0, [[0, 0, 63, 8], [1, 0, 57, 10]], null, 5); await sessionsAvec([await ail([CU], null, 99, 10, 1)]); await charge(0, 0); };   // le jour : curl 57 ; une séance libre plus récente : curl 99
    const miloDe = (mode, garde) => pg.evaluate(([mode, garde]) => { if (garde) S.wkt.exs = S.wkt.exs.filter((e) => e.name === 'Zorglub Presse Quantique');
      _pendingMiloSessions = [{ label: 'Séance fictive 17', exs: [{ name: 'Curl Haltères', sets: [{ kg: 0, reps: 10, type: 'N', rest: 60 }, { kg: 0, reps: 10, type: 'N', rest: 60 }] }] }]; _miloPendingIdx = 0; _miloPendingBtn = null;
      if (mode === 'start') { S.wkt = null; _startSessionFromMilo(0, null); return S.wkt.exs[0].sets.map((s) => s.kg); }
      _applyMiloSession(mode); return S.wkt.exs[S.wkt.exs.length - 1].sets.map((s) => s.kg); }, [mode, !!garde]);
    await prepare(); const m1 = await miloDe('add', true);
    await prepare(); const m2 = await miloDe('add', false);
    await prepare(); const m3 = await miloDe('replace', true);
    await prepare(); const m4 = await miloDe('start', false);
    t('SCFH-F12 ⭐⭐⭐ Milo qui AJOUTE à une séance d\'un jour de programme respecte le CONTEXTE DE DESTINATION : sans charge donnée, 57 · 57 (la dernière séance de CE jour), jamais 99 (la séance libre plus récente) ; « remplacer » aussi (la séance garde son jour) : 57 · 57', egal(m1, [57, 57]) && egal(m3, [57, 57]), js({ m1, m3 }));
    t('SCFH-F13 ⭐⭐ … si la séance en cours porte déjà le curl du programme, celui que Milo ajoute est AMBIGU : rien (inconnu : null · null), pas de rang ; Milo qui DÉMARRE une séance reste LIBRE : 99 · 99 (la dernière séance libre), jamais la séance d\'un jour de programme', egal(m2, [null, null]) && egal(m4, [99, 99]), js({ m2, m4 }));
    // F14 — une séance LIBRE en cours : Milo « ajouter » reste libre (99), et la séance d'un programme n'y est pas reprise
    await prepare();
    const m5 = await pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 0, reps: 8, type: 'N', done: false, rm1: 0, rest: 60 }] }] };
      _pendingMiloSessions = [{ label: 'Séance fictive 17', exs: [{ name: 'Curl Haltères', sets: [{ kg: 0, reps: 10, type: 'N', rest: 60 }] }] }]; _miloPendingIdx = 0; _miloPendingBtn = null; _applyMiloSession('add'); return S.wkt.exs[S.wkt.exs.length - 1].sets.map((s) => s.kg); });
    t('SCFH-F14 ⭐⭐ séance LIBRE en cours + Milo « ajouter » : le contexte libre est conservé — 99 (la dernière séance libre), jamais le 57 d\'un jour de programme', egal(m5, [99]), js(m5));

    // ── F15 : séance libre vs programme, et inversement ──
    await raz([PROG7()], [await ail([ZO], null, 99, 7, 1)]);
    await charge(0, 0); await voir(0); const j1 = await champs(0, 0); const jr = await repr();
    await raz([], [await ail([ZO], 'p-scfh-autre', 63, 7, 1)]);
    await pg.evaluate(() => { S.wkt = { date: today(), exs: [{ name: 'Zorglub Presse Quantique', note: '', sets: [{ kg: 0, reps: 10, type: 'N', done: false, rm1: 0, rest: 60 }] }] }; persist(); }); await voir(0);
    const j2 = await champs(0, 0); const jr2 = await repr();
    t('SCFH-F15 ⭐⭐ une séance de PROGRAMME ne reprend pas une séance libre (champs vides, `_reprise` null) et une séance LIBRE ne reprend pas un programme — et réciproquement rien n\'est inventé', egal(j1, ['', '']) && egal(jr, [null]) && egal(j2, ['', '']) && egal(jr2, [null]), js({ j1, jr, j2, jr2 }));
    // F17 — le dropset dessine ses répétitions par un 2ᵉ chemin (la ligne courante) : même source admissible, donc rien d'un autre programme
    await raz([{ id: 'p-scfh-s17', name: 'Fictif S17', days: [{ label: 'JOUR A', exs: [EXO(CU, [SE(40, 10, 'N', 60), SE(36, 10, 'N', 0), SE(32, 10, 'N', 0)], { dropset: { paliers: 2, pct: 10, direction: 'down' } })] }] }], [await ail([CU], 'p-scfh-autre', 99, 7, 1)]);
    await charge(0, 0); await voir(0);
    const dp = await pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 input[inputmode="numeric"]')].map((i) => i.placeholder));
    t('SCFH-F17 ⭐⭐ le dropset (ses deux dessins du champ de répétitions — série normale et palier courant) ne suggère pas les 7 répétitions d\'un AUTRE programme', dp.length >= 2 && dp.every((p) => p === ''), js(dp));
    // F18 — « + série » sur le 2ᵉ de deux blocs de même nom : la série ajoutée reprend SON historique (63, par identité), pas celui de l'autre bloc (17) ni la série voisine (40)
    await raz([DUO()], []);
    await fait(0, 0, [[0, 0, 17, 3], [1, 0, 63, 8]]);
    await charge(0, 0); await pg.evaluate(() => { S.wkt.exs[1].sets[0].kg = 40; addSet(1); });
    const ad = await lastKg(1);
    t('SCFH-F18 ⭐⭐ `addSet` sur le 2ᵉ de deux blocs de MÊME NOM : la série ajoutée reprend SON historique (63 × 8, par identité) — ni 17 (l\'autre bloc) ni 40 (la série voisine de la séance en cours)', ad.kg === 63 && ad.reps === 8, js(ad));
    // F19 — un AUTRE jour du MÊME programme, dont la séance d'avant est ANTÉRIEURE aux identités (aucun `exId`, `progId` sans `progDayId`, libellé « HAUT ») : le jour « BAS » ne lui emprunte rien (seul l'identité des blocs ne suffirait pas à l'écarter)
    await raz([{ id: 'p-scfh-s19', name: 'Fictif S19', days: [{ label: 'HAUT', exs: [EXO(ZO, [SE(57, 5)])] }, { label: 'BAS', exs: [EXO(ZO, [SE(72, 5)])] }] }],
      [{ id: 19, ts: Date.now() - 3000, date: '2026-11-01', progId: 'p-scfh-s19', progLabel: 'HAUT', exs: [{ name: ZO, note: '', sets: [{ kg: 63, reps: 7, type: 'N', done: true }] }], volume: 1, synced: true, uniConv: 1 }]);
    const w19 = await charge(0, 1); await voir(0); const c19 = await champs(0, 0); const r19 = await repr();
    t('SCFH-F19 ⭐⭐ le jour « BAS » du même programme ne reprend pas la séance (sans identités) du jour « HAUT » : sa prescription (72), aucune suggestion, `_reprise` rend `null`', egal(kgs(w19), ['72']) && egal(c19, ['', '']) && egal(r19, [null]), js({ kg: kgs(w19), c19, r19 }));
    t('SCFH-F16 aucun appel au modèle n\'est parti pendant ces scénarios (toute requête hors du serveur local est coupée)', dehors.every((d) => d.a !== 'coach' && !/anthropic/.test(d.u)), js(dehors.slice(0, 3)));
  });

  t('SCFH-Z00 aucune erreur JavaScript pendant tout le banc', errs.length === 0, errs.slice(0, 3).join(' | '));
  await cx.close();
};
function J_(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
