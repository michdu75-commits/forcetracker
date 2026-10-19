/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🛠️ D-086 — CORRECTIONS UX APRÈS LA RECETTE IPHONE DE D-085 (18/10/2026, blocs B-D086-*), branche locale claude/ux-d086.
   Les 15 points de test du brief, aux largeurs 360 / 375 / 390 / 430 px :
   ① type visible (N / É / X) · ② règles des types inchangées · ③ « Précédent » lisible · ④ colonnes alignées, cibles
   44 × 44 · ⑤ dock [−15 s][temps][+15 s][Passer] · ⑥ « Régler » (30 s · 45 s · 1:00 · 1:30 · 2:00 · personnalisée) et
   la durée reprise à la série suivante · ⑦ « Passer » Cobalt, dock ET plein écran · ⑧ décompte automatique à 10 s ·
   ⑨ bandeau de reprise lisible · ⑩ point bleu du commentaire, sur sa série EXACTE seulement · ⑪ date et heure de chaque
   message Milo · ⑫ aucune heure inventée · ⑬ historique Milo et ordre intacts · ⑭ clavier, repos, validation, navigation ·
   ⑮ aucune écriture de stockage nouvelle, aucune migration, aucun réseau.
   Ce que les témoins CONDUISENT : la vraie app servie en local, les vrais boutons (pastille de type, « Précédent », temps
   du dock, préréglages, « Passer », ✓), le vrai focus d'un champ, `sendToCoach` sur une formule de politesse (réponse
   locale, sans réseau), `_renderCoachThread`, `_dbfPoserDansHistorique`.
   Ce qu'ils OBSERVENT : rectangles et styles CALCULÉS, `S.wkt` / `S.exRestPref` / `coachHistory` avant-après, les clés
   écrites dans le stockage (setItem espionné), les appels réseau (fetch espionné).
   Ce qu'ils NE COUVRENT PAS : le vrai clavier iOS (simulé en réduisant visualViewport), le vrai fuseau du téléphone (le
   navigateur de test est réglé sur Europe/Paris), Milo lui-même (aucun appel réel), le rendu Safari → recette iPhone.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', DM = 'Développé Militaire';
const S_ = (kg, reps, done, type, extra) => Object.assign({ kg, reps, done: !!done, type: type || 'N' }, extra || {});
/* La dernière fois (16/10) : une note sur la 2ᵉ série et sur l'échec (4ᵉ), une note sur l'EXERCICE (« Note perso »), une note
   sur un AUTRE exercice ; une séance plus ancienne (09/10) porte une note qui ne doit jamais remonter. */
const HISTO = () => {
  const s = (date, exs) => { const ts = Date.parse(date + 'T18:00:00'); return { id: ts, ts, date, synced: true, volume: 3000, exs }; };
  return [
    s('2026-10-16', [{ name: DC, note: 'Épaule gauche à surveiller', sets: [S_(60, 10, 1, 'É'), S_(92.5, 8, 1, 'N', { note: 'Coudes serrés, bonne trajectoire' }),
      S_(92.5, 8, 1), S_(90, 6, 1, 'X', { note: 'Échec à la 7e' })] }, { name: DM, sets: [S_(55, 8, 1, 'N', { note: 'NOTE DU MILITAIRE' }), S_(55, 7, 1)] }]),
    s('2026-10-09', [{ name: DC, sets: [S_(90, 8, 1, 'N', { note: 'NOTE ANCIENNE' }), S_(90, 8, 1)] }]),
  ];
};
// Aujourd'hui : échauffement fait, 1ʳᵉ série de travail faite, puis 2ᵉ (à faire), un échec prévu, et une 5ᵉ ligne qui
// n'a PAS de série correspondante la dernière fois (la colonne la remplit par REPLI avec l'échec : jamais sa note).
const WKT = () => ({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs: [
  { name: DC, sets: [S_(60, 10, 1, 'É', { rm1: 80, at: 60 }), S_(92.5, 8, 1, 'N', { rm1: 114.8, at: 300, rir: 2 }), S_(92.5, 8), S_(90, 6, 0, 'X'), S_(87.5, 8)] },
  { name: DM, sets: [S_(55, 8), S_(55, 8)] } ] });
const COBALT = 'rgb(47, 91, 255)';
const T = s => Date.parse(s);
const HIST = () => [
  { role: 'user', content: 'Message ancien sans heure' },
  { role: 'assistant', content: 'Réponse ancienne sans heure.' },
  { role: 'user', content: 'Salut Milo, je fais quoi aujourd\'hui ?', ts: T('2026-10-17T07:32:00+02:00') },
  { role: 'user', content: '[consigne interne de débrief]', ts: T('2026-10-17T07:33:00+02:00'), _silent: true },
  { role: 'assistant', content: 'Je te propose ton Push : **Développé couché** 4 × 8.', ts: T('2026-10-17T07:32:09+02:00') },
  { role: 'user', content: 'Et pour les épaules ?', ts: T('2026-10-18T11:32:00+02:00') },
  { role: 'assistant', content: 'Reste sur 12 kg, 3 × 15.', ts: T('2026-10-18T11:32:07+02:00') },
];
// Le « + » ne doit pas bouger : son centre mesuré sur D-085 (6d9b6c90), validé sur iPhone par Michel (« légèrement à gauche »).
const PLUS_D085 = { 360: 154, 375: 161, 390: 167, 430: 184 };
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || HISTO()) });
    if (opts.wkt !== undefined && opts.wkt !== null) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    if (opts.hist) init.ft4_coach_hist = JSON.stringify(opts.hist);
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d086'))return; sessionStorage.setItem('_d086','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}
      window.__fetchN=0; const f=window.fetch; window.fetch=function(){ window.__fetchN++; return f.apply(this,arguments); };
      window.__ecrits=[]; const si=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage) window.__ecrits.push(String(k)); }catch(e){} return si.apply(this,arguments); };})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(opts.attente || 1500);
    if (!opts.garderToast) await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
    return { cx, pg, errs, W, H };
  };
  const fixDate = async X => X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
  const vers = async (X, id) => { await X.pg.evaluate(id => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    goScreen(id, document.getElementById('nb-' + id)); }, id); await X.pg.waitForTimeout(300); };
  const seance = async (X, ei) => { await fixDate(X); await X.pg.evaluate(ei => { _expandedEx = ei || 0; }, ei || 0); await vers(X, 'log'); await X.pg.evaluate(() => renderLog()); await X.pg.waitForTimeout(150); };
  const clic = async (X, sel) => { if (!(await X.pg.$(sel))) return false; await X.pg.click(sel, { timeout: 3000 }).catch(() => {}); await X.pg.waitForTimeout(180); return true; };
  const snapLS = X => X.pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  // Rapport de contraste WCAG entre deux couleurs « rgb(a) » (fond supposé opaque).
  const contraste = (c1, c2) => { const L = c => { const m = (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * m[0] + .7152 * m[1] + .0722 * m[2]; }; const a = L(c1), z = L(c2); return (Math.max(a, z) + .05) / (Math.min(a, z) + .05); };

  /* ══ ①②③④ · LA LIGNE DE SÉRIE, AUX QUATRE LARGEURS ══════════════════════════════════════════════════════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H, wkt: WKT() });
    await seance(X, 0);
    const L = await X.pg.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, r: r.right, w: r.width, h: r.height, cx: r.left + r.width / 2 }; };
      const bloc = document.getElementById('ex-block-0');
      const hdr = [...bloc.querySelectorAll('.sets-hdr span')];
      const rows = [...bloc.querySelectorAll('.set-row')];
      return { hdr: hdr.map(s => s.textContent.trim()), hdrCx: hdr.map(s => R(s).cx),
        rows: rows.map(r => { const ty = r.querySelector('button.stype'), pill = ty && ty.querySelector('.tbtn'), sp = r.querySelector('.sprev'), n = r.querySelector('.sprev-n');
          const sup = sp && sp.querySelector('sup');
          return { cells: [...r.children].map(c => R(c).cx), ty: R(ty), id: ty && ty.id, pill: pill ? pill.textContent.trim() : null,
            pillCls: pill ? pill.className : '', chk: R(r.querySelector('.chk')), prev: sp ? sp.innerText.replace(/\s+/g, '') : null,
            val: (sp && sp.firstElementChild) ? sp.firstElementChild.innerText.replace(/\s+/g, '') : null,
            fs: sp ? parseFloat(getComputedStyle(sp).fontSize) : 0, col: sp ? getComputedStyle(sp).color : null,
            sup: sup ? { fs: parseFloat(getComputedStyle(sup).fontSize), style: sup.getAttribute('style') } : null,
            deborde: (sp && n) ? Math.max(0, n.getBoundingClientRect().right - sp.getBoundingClientRect().right, sp.getBoundingClientRect().left - n.getBoundingClientRect().left) : 0,
            rowOver: r.scrollWidth - r.clientWidth }; }),
        fond: getComputedStyle(bloc).backgroundColor, docW: document.documentElement.scrollWidth, vw: innerWidth,
        plus: (() => { const p = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return Math.round(p.left + p.width / 2); })(),
        nav: [...document.querySelectorAll('.nav > .nb, .nav > button')].filter(e => getComputedStyle(e).display !== 'none').length };
    });
    const r = L.rows;
    /* ⛔ R30 — D-093 (19/10/2026) : l'en-tête « Précédent » porte « ▾ » quand l'exercice a une dernière fois (il ouvre « 4 dernières
       séances ») ; la colonne « Type » reste à sa place, entre « # » et « Précédent ». */
    t('B-D086-①a ⭐ ' + W + ' px : une colonne « Type » a sa propre en-tête, entre « # » et « Précédent » ; 1RM, Reps, KG et ✓ restent séparés',
      _det(L.hdr) === _det(['#', 'Type', 'Précédent ▾', 'Reps', 'KG', '1RM', '✓']), _det(L.hdr));
    t('B-D086-①b ⭐ ' + W + ' px : CHAQUE série montre son type sans ouvrir de menu — pastilles É, N, N, X, N (même les séries normales)',
      _det(r.map(x => x.pill)) === _det(['É', 'N', 'N', 'X', 'N']) && r.every((x, i) => x.id === 'tbtn-0-' + i), _det(r.map(x => [x.pill, x.id])));
    t('B-D086-④a ⭐ ' + W + ' px : pastille de type et ✓ — zones d\'appui ≥ 44 × 44', r.every(x => x.ty && x.ty.w >= 44 && x.ty.h >= 44 && x.chk && x.chk.w >= 44 && x.chk.h >= 44),
      _det(r.map(x => [x.ty && [Math.round(x.ty.w), Math.round(x.ty.h)], x.chk && [Math.round(x.chk.w), Math.round(x.chk.h)]])));
    t('B-D086-④b ' + W + ' px : les 7 en-têtes sont centrées sur leurs colonnes (écart ≤ 3 px, ligne de série normale)',
      L.hdrCx.length === 7 && r[2].cells.length === 7 && L.hdrCx.every((c, i) => Math.abs(c - r[2].cells[i]) <= 3), _det({ h: L.hdrCx.map(Math.round), c: r[2].cells.map(Math.round) }));
    t('B-D086-④c ⭐ ' + W + ' px : aucune ligne ne déborde, aucune défilement horizontal de la page', r.every(x => x.rowOver <= 0) && L.docW <= L.vw, _det({ over: r.map(x => x.rowOver), docW: L.docW, vw: L.vw }));
    /* ⛔ R30 — D-093 (recette iPhone du 19/10) : la 5ᵉ ligne n'affiche plus la 4ᵉ série d'avant RÉPÉTÉE (repli) — « — ». Michel :
       une série qui n'a pas existé ne s'invente pas. Le repli ne sert plus qu'aux suggestions grises des champs (B-SR-⑤c). */
    t('B-D086-③a ⭐ ' + W + ' px : « Précédent » montre les séries de la dernière fois (par rôle) ; la 5ᵉ ligne, sans série d\'avant, « — »',
      _det(r.map(x => x.val)) === _det(['10×60É', '8×92.5', '8×92.5', '6×90X', '—']), _det(r.map(x => x.val)));
    t('B-D086-③b ⭐ ' + W + ' px : « Précédent » plus grand (≥ 14 px, 15 px dès 375) et contraste nettement relevé (≥ 7:1 sur la carte)',
      r.every(x => x.fs >= (W < 375 ? 14 : 15)) && contraste(r[2].col, L.fond) >= 7, _det({ fs: r[2].fs, col: r[2].col, fond: L.fond, c: contraste(r[2].col, L.fond).toFixed(2) }));
    t('B-D086-③c ' + W + ' px : marqueurs É / X plus lisibles (11 px), dans leur couleur (bleu / rouge)',
      r[0].sup && r[0].sup.fs >= 11 && /var\(--blue\)/.test(r[0].sup.style) && r[3].sup && r[3].sup.fs >= 11 && /var\(--red\)/.test(r[3].sup.style), _det([r[0].sup, r[3].sup]));
    t('B-D086-③d ' + W + ' px : le nombre de « Précédent » n\'est jamais rogné ni ne déborde de sa case', r.every(x => x.deborde <= 0.5), _det(r.map(x => x.deborde)));
    t('B-D086-⑭a ⭐ ' + W + ' px : le « + » central ne bouge pas (centre mesuré sur D-085 : ' + PLUS_D085[W] + ' px) et la barre garde 6 entrées',
      L.plus === PLUS_D085[W] && L.nav === 6, _det({ plus: L.plus, nav: L.nav }));
    t('B-D086-④d ' + W + ' px : aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  // ③ PIRE CAS : les valeurs les plus longues tiennent, à 360 px aussi (le marqueur passe à la ligne, jamais le nombre).
  for (const W of [360, 375]) {
    const P = [S_(102.5, 12, 1, 'É'), S_(102.5, 12, 1, 'N', { rir: 4 }), S_(142.5, 10, 1, 'X'), S_(62.5, 15, 1, 'N', { rir: 2 })];
    const X = await ouvrir({ w: W, h: 800, sessions: [{ id: 1, ts: Date.parse('2026-10-16T18:00:00'), date: '2026-10-16', exs: [{ name: DC, sets: P }] }],
      wkt: { date: '__TODAY__', startTs: Date.now() - 60000, exs: [{ name: DC, sets: P.map(s => S_(s.kg, s.reps, 0, s.type)) }] } });
    await seance(X, 0);
    // Le NOMBRE et TOUT le contenu (marqueurs É / X, RIR compris) restent dans la case — mesuré sur le texte réellement dessiné.
    const d = await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 .set-row')].map(r => { const cell = r.querySelector('.sprev'), c = cell.getBoundingClientRect(),
      n = (r.querySelector('.sprev-n') || r.querySelector('.sprev > div')).getBoundingClientRect(), v = r.querySelector('.sprev-v') || r.querySelector('.sprev > div');
      const rg = document.createRange(); rg.selectNodeContents(v); const tout = [...rg.getClientRects()].reduce((m, q) => ({ l: Math.min(m.l, q.left), r: Math.max(m.r, q.right) }), { l: 1e9, r: -1e9 });
      return { t: cell.innerText.replace(/\s+/g, ''), d: Math.round(Math.max(0, n.right - c.right, c.left - n.left, tout.r - c.right, c.left - tout.l)), over: r.scrollWidth - r.clientWidth }; }));
    t('B-D086-③e ⭐ ' + W + ' px, pire cas (12×102.5 É, 10×142.5 X, RIR 4+) : rien n\'est rogné, rien ne déborde, le texte est complet',
      d.every(x => x.d === 0 && x.over <= 0) && _det(d.map(x => x.t)) === _det(['12×102.5É', '12×102.5·4+r', '10×142.5X', '15×62.5·2r']), _det(d));
    await X.cx.close();
  }

  /* ══ ①② · CHANGER LE TYPE : MÊME ACTION, MÊMES RÈGLES ══════════════════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: WKT() });
    await seance(X, 0);
    const avant = await X.pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt.exs[0].sets[1])));
    const prog = () => X.pg.evaluate(() => { const m = /(\d+)\s*\/\s*(\d+)/.exec((document.querySelector('.topbar').innerText || '').replace(/\s+/g, ' ')); return m ? m[1] + '/' + m[2] : null; });
    const p0 = await prog();
    const suite = [];
    for (let k = 0; k < 3; k++) { await clic(X, '#tbtn-0-1'); suite.push(await X.pg.evaluate(() => ({ t: S.wkt.exs[0].sets[1].type, p: (document.querySelector('#tbtn-0-1 .tbtn') || { textContent: '' }).textContent.trim(),
      toast: document.getElementById('toast').textContent }))); if (k === 0) suite[0].prog = await prog(); }
    const apres = await X.pg.evaluate(() => JSON.parse(JSON.stringify(S.wkt.exs[0].sets[1])));
    t('B-D086-①c ⭐ un appui sur la pastille fait N → É → X → N (cycleType inchangé), la pastille suit, le nom s\'affiche',
      _det(suite.map(x => x.t)) === _det(['É', 'X', 'N']) && suite.every(x => x.p === x.t) && _det(suite.map(x => x.toast)) === _det(['Échauffement', 'Échec', 'Normal']), _det(suite));
    const regles = await X.pg.evaluate(() => JSON.stringify(SET_TYPES) + ' ' + JSON.stringify(SET_TYPE_LABELS));
    t('B-D086-②a ⭐ règles des types inchangées : mêmes types et libellés ; la série garde charge, reps, 1RM, RIR, « faite », horodatage',
      regles === '["N","É","X"] {"N":"Normal","É":"Échauffement","X":"Échec"}' && ['kg', 'reps', 'rm1', 'rir', 'done', 'at'].every(k => avant[k] === apres[k]), _det({ regles, avant, apres }));
    t('B-D086-②b ⭐ la progression de l\'en-tête compte toujours les séries de TRAVAIL : 1/6 ; la série passée en É en sort (0/5), puis revient (1/6)',
      p0 === '1/6' && suite[0].prog === '0/5' && (await prog()) === '1/6', _det({ p0, e: suite[0].prog }));
    await X.cx.close();
  }

  /* ══ ⑩ · LE COMMENTAIRE DE LA DERNIÈRE FOIS ═════════════════════════════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ wkt: WKT() });
    await seance(X, 0);
    const pts = await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-0 .set-row')].map(r => !!r.querySelector('.sprev-pt')));
    t('B-D086-⑩a ⭐ point bleu sur les séries EXACTES qui avaient un commentaire (2ᵉ et 4ᵉ) — pas sur la 5ᵉ, remplie par repli avec l\'échec',
      _det(pts) === _det([false, true, false, true, false]), _det(pts));
    const txt = await X.pg.evaluate(() => document.getElementById('ex-block-0').innerText);
    t('B-D086-⑩b ⭐ aucune note n\'est écrite dans les lignes : ni celle de la série, ni « Note perso » de l\'exercice, ni la séance plus ancienne, ni un autre exercice',
      !/Coudes serrés|Échec à la 7e|Épaule gauche|NOTE ANCIENNE|NOTE DU MILITAIRE/.test(txt), txt.slice(0, 200));
    const pt = await X.pg.evaluate(() => { const p = document.querySelector('#sr-0-1 .sprev-pt'); if (!p) return null; const c = getComputedStyle(p); return { bg: c.backgroundColor, w: p.getBoundingClientRect().width }; });
    t('B-D086-⑩c le point est bleu (Cobalt de séance) et discret (≤ 10 px)', !!pt && pt.bg === 'rgb(124, 149, 255)' && pt.w <= 10, _det(pt));
    const ls0 = await snapLS(X), e0 = await X.pg.evaluate(() => window.__ecrits.length);
    await clic(X, '#sr-0-1 .sprev');
    const f1 = await X.pg.evaluate(() => { const o = document.getElementById('ov-set-note'), p = document.getElementById('sn-prev');
      return { open: !!o && o.classList.contains('open'), p: p ? p.innerText.replace(/\s+/g, ' ') : null, ta: (document.getElementById('set-note-ta') || {}).value }; });
    t('B-D086-⑩d ⭐ un appui sur « Précédent » montre le commentaire AVEC son origine : séance du 16/10/2026, série 2, exercice',
      f1.open && /Commentaire de la dernière fois/.test(f1.p || '') && /Séance du 16\/10\/2026/.test(f1.p || '') && /série 2/.test(f1.p || '') && /Développé Couché/.test(f1.p || '') && /Coudes serrés, bonne trajectoire/.test(f1.p || ''), _det(f1));
    t('B-D086-⑩e la note d\'AUJOURD\'HUI reste vide et modifiable dans la même fenêtre (rien n\'est recopié dedans)', f1.ta === '', _det(f1));
    await X.pg.evaluate(() => closeSetNote());
    await clic(X, '#sr-0-3 .sprev');
    const f3 = await X.pg.evaluate(() => (document.getElementById('sn-prev') || {}).innerText || '');
    t('B-D086-⑩f l\'échec d\'avant : « série 4 » et son commentaire', /série 4/.test(f3) && /Échec à la 7e/.test(f3), f3);
    await X.pg.evaluate(() => closeSetNote());
    await clic(X, '#sr-0-4 .sprev');
    const f4 = await X.pg.evaluate(() => ({ open: document.getElementById('ov-set-note').classList.contains('open'), p: !!document.getElementById('sn-prev') }));
    t('B-D086-⑩g ⭐ ligne remplie par REPLI : la fenêtre s\'ouvre (note du jour) mais n\'attribue AUCUN commentaire d\'avant', f4.open && !f4.p, _det(f4));
    await X.pg.evaluate(() => closeSetNote());
    t('B-D086-⑮a ⭐ lire les commentaires n\'écrit RIEN : aucun setItem, stockage identique', _det(await snapLS(X)) === _det(ls0) && (await X.pg.evaluate(() => window.__ecrits.length)) === e0,
      _det(await X.pg.evaluate(e0 => window.__ecrits.slice(e0), e0)));
    // Un AUTRE exercice ne prête jamais sa note : le Militaire montre la SIENNE, sur sa 1ʳᵉ série seulement.
    await X.pg.evaluate(() => { _expandedEx = 1; renderLog(); }); await X.pg.waitForTimeout(150);
    const dm = await X.pg.evaluate(() => [...document.querySelectorAll('#ex-block-1 .set-row')].map(r => !!r.querySelector('.sprev-pt')));
    t('B-D086-⑩h le commentaire du Militaire reste au Militaire (1ʳᵉ série) — jamais au Développé Couché', _det(dm) === _det([true, false]), _det(dm));
    t('B-D086-⑩i aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ⑤⑥⑦⑧ · LE REPOS ══════════════════════════════════════════════════════════════════════════════════════════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H, wkt: WKT() });
    await seance(X, 0);
    await X.pg.evaluate(() => startRest(120)); await X.pg.waitForTimeout(600);
    const d = await X.pg.evaluate(() => { const R = s => { const e = document.querySelector('#rest-bar ' + s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, r: r.right, w: r.width, h: r.height, cx: r.left + r.width / 2 }; };
      const bar = document.getElementById('rest-bar').getBoundingClientRect();
      return { m: R('#rest-btn-minus'), t: R('#rest-regler'), p: R('#rest-btn-plus'), s: R('.rd-skip'), ringIn: !!document.querySelector('#rest-regler .rd-ring svg #rest-ring'),
        timeIn: !!document.querySelector('#rest-regler #rest-time'), fs: parseFloat(getComputedStyle(document.getElementById('rest-time')).fontSize),
        txt: [...document.querySelectorAll('#rest-bar .rd-top > button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()),
        skipBg: getComputedStyle(document.querySelector('#rest-bar .rd-skip')).backgroundColor, bar: { x: bar.left, r: bar.right }, vw: innerWidth }; });
    t('B-D086-⑤a ⭐ ' + W + ' px : [ −15 s ] [ temps ] [ +15 s ] [ Passer ] — le temps entre les deux boutons qui le règlent',
      d.m && d.t && d.p && d.s && d.m.r <= d.t.x && d.t.r <= d.p.x && d.p.r <= d.s.x && /^−15\s?s$/.test(d.txt[0]) && /^\+15\s?s$/.test(d.txt[2]) && d.txt[3] === 'Passer', _det({ txt: d.txt, m: d.m, t: d.t, p: d.p, s: d.s }));
    t('B-D086-⑤b ⭐ ' + W + ' px : temps très visible (≥ 28 px), anneau gardé DANS le bouton du temps', d.fs >= 28 && d.ringIn && d.timeIn, _det({ fs: d.fs, ring: d.ringIn }));
    t('B-D086-⑤c ' + W + ' px : boutons ≥ 44 px de haut, dock entier dans l\'écran', [d.m, d.t, d.p, d.s].every(x => x.h >= 44) && d.bar.x >= 0 && d.bar.r <= d.vw, _det({ h: [d.m.h, d.t.h, d.p.h, d.s.h], bar: d.bar }));
    t('B-D086-⑦a ' + W + ' px : « Passer » du dock en Cobalt', d.skipBg === COBALT, d.skipBg);
    await X.cx.close();
  }
  {
    const X = await ouvrir({ wkt: WKT() });
    await seance(X, 0);
    // Le repos part d'une VRAIE série validée (le ✓) : c'est elle qui dit à quel exercice appartient la durée choisie.
    await clic(X, '#sr-0-2 .chk'); await X.pg.waitForTimeout(400);
    const l0 = await X.pg.evaluate(() => _restLeft());
    await clic(X, '#rest-btn-plus'); const l1 = await X.pg.evaluate(() => _restLeft());
    await clic(X, '#rest-btn-minus'); const l2 = await X.pg.evaluate(() => _restLeft());
    t('B-D086-⑤d −15 s / +15 s règlent toujours le temps restant (addRT inchangé)', l1 - l0 >= 13 && l1 - l0 <= 16 && l1 - l2 >= 13 && l1 - l2 <= 16, _det({ l0, l1, l2 }));
    await clic(X, '#rest-regler');
    const reg = await X.pg.evaluate(() => { const o = document.getElementById('ov-rest-edit'); const vis = e => !!e && e.getClientRects().length > 0;
      return { open: o.classList.contains('open'), presets: [30, 45, 60, 90, 120].map(v => { const b = document.getElementById('rp-' + v); return b && vis(b) ? b.textContent.replace(/\s+/g, ' ').trim() : null; }),
        perso: vis(document.getElementById('re-min')) && vis(document.getElementById('re-sec')), ok: o.querySelector('.re-ok') ? getComputedStyle(o.querySelector('.re-ok')).backgroundColor : null }; });
    t('B-D086-⑥a ⭐ toucher le temps ouvre « Régler » : 30 s · 45 s · 1:00 · 1:30 · 2:00 + durée personnalisée (min / s)',
      reg.open && _det(reg.presets) === _det(['30 s', '45 s', '1:00', '1:30', '2:00']) && reg.perso, _det(reg));
    t('B-D086-⑥b « Valider » du réglage en Cobalt (plus en rouge)', reg.ok === COBALT, reg.ok);
    await clic(X, '#rp-45');
    const p45 = await X.pg.evaluate(() => ({ tot: restTot, ferme: !document.getElementById('ov-rest-edit').classList.contains('open'), pref: (S.exRestPref || {})['Développé Couché'], tourne: !!restIv,
      cle: JSON.parse(localStorage.getItem('ft4_exRp') || '{}')['Développé Couché'] }));
    t('B-D086-⑥c ⭐ 45 s règle le repos en cours et le mémorise pour CET exercice (S.exRestPref, clé existante ft4_exRp)',
      p45.tot === 45 && p45.ferme && p45.tourne && p45.pref === 45 && p45.cle === 45, _det(p45));
    await X.pg.evaluate(() => skipRest()); await X.pg.waitForTimeout(150);
    // La série de TRAVAIL suivante (la 5ᵉ ; la 4ᵉ est un échec, dont le repos est fixé à 4 min par la règle existante).
    await clic(X, '#sr-0-4 .chk'); await X.pg.waitForTimeout(400);
    const rep = await X.pg.evaluate(() => ({ tot: restTot, tourne: !!restIv, actif: (document.getElementById('rp-45') || {}).className || '' }));
    t('B-D086-⑥d ⭐ la série de travail SUIVANTE reprend 45 s toute seule (repos ENTRE séries, sans nouveau réglage) — 45 s en surbrillance',
      rep.tot === 45 && rep.tourne && /rp-active/.test(rep.actif), _det(rep));
    await X.pg.evaluate(() => skipRest());
    // ⑧ Le décompte plein écran arrive tout seul aux 10 dernières secondes, et son « Passer » est Cobalt.
    await X.pg.evaluate(() => startRest(12)); await X.pg.waitForTimeout(900);
    const c0 = await X.pg.evaluate(() => getComputedStyle(document.getElementById('ov-rest-countdown')).display);
    await X.pg.waitForTimeout(1900);
    const c1 = await X.pg.evaluate(() => { const o = document.getElementById('ov-rest-countdown'), b = document.getElementById('rcd-passer');
      return { d: getComputedStyle(o).display, bg: b ? getComputedStyle(b).backgroundColor : null, col: b ? getComputedStyle(b).color : null,
        fond: getComputedStyle(o).backgroundColor, traits: document.querySelectorAll('#rcd-svg line').length, num: (document.getElementById('rcd-num').textContent || '').trim() }; });
    t('B-D086-⑧a ⭐ le décompte plein écran n\'est pas là à 11 s, il apparaît SEUL à ≤ 10 s (comportement inchangé)', c0 === 'none' && c1.d === 'block', _det({ c0, c1: c1.d }));
    t('B-D086-⑦b ⭐ plein écran : « Passer » en Cobalt, texte blanc ; le reste de l\'écran est inchangé (fond sombre, anneau à traits, grand chiffre)',
      c1.bg === COBALT && c1.col === 'rgb(255, 255, 255)' && c1.fond === 'rgb(14, 16, 22)' && c1.traits > 0 && /^\d+$/.test(c1.num), _det(c1));
    await clic(X, '#rcd-passer');
    const fin = await X.pg.evaluate(() => ({ tourne: !!restIv, d: getComputedStyle(document.getElementById('ov-rest-countdown')).display }));
    t('B-D086-⑦c « Passer » plein écran arrête le repos et ferme l\'écran (même fonction)', !fin.tourne && fin.d === 'none', _det(fin));
    t('B-D086-⑤e aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ⑨ · LE BANDEAU DE REPRISE ═════════════════════════════════════════════════════════════════════════════════════ */
  for (const [W, H] of TAILLES) {
    const wk = { date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs: [{ name: DC, sets: [S_(92.5, 8, 1, 'N', { at: 60 }), S_(92.5, 8, 1, 'N', { at: 300 }), S_(92.5, 8)] }] };
    const X = await ouvrir({ w: W, h: H, wkt: wk, attente: 1350, garderToast: true });
    const b = await X.pg.evaluate(() => { const t = document.getElementById('toast'), r = t.getBoundingClientRect(), c = getComputedStyle(t);
      return { show: t.classList.contains('show'), txt: t.textContent, x: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), ws: c.whiteSpace, pe: c.pointerEvents, vw: innerWidth }; });
    t('B-D086-⑨a ⭐ ' + W + ' px : « Séance en cours — 1 exercice · 2 séries validées · Appuie sur Reprendre » ENTIER, dans l\'écran (aucun débordement)',
      b.show && b.txt === 'Séance en cours — 1 exercice · 2 séries validées · Appuie sur Reprendre' && b.x >= 0 && b.r <= b.vw && b.ws !== 'nowrap', _det(b));
    t('B-D086-⑨b ' + W + ' px : il passe à la ligne sans devenir un pavé (≤ 3 lignes) et ne capte aucun appui', b.h <= 82 && b.pe === 'none', _det(b));
    await X.pg.evaluate(() => toast('Note enregistrée 💬', 'success')); await X.pg.waitForTimeout(250);
    const c = await X.pg.evaluate(() => Math.round(document.getElementById('toast').getBoundingClientRect().height));
    t('B-D086-⑨c ' + W + ' px : un message court reste sur UNE ligne', c <= 48, String(c));
    await X.cx.close();
  }

  /* ══ ⑪⑫⑬ · LES MESSAGES DE MILO ═══════════════════════════════════════════════════════════════════════════════════ */
  for (const [W, H] of [[360, 740], [430, 932]]) {
    const X = await ouvrir({ w: W, h: H, wkt: null, hist: HIST() });
    const ref = await X.pg.evaluate(() => { const n = window.__ecrits.length; persist(); return [...new Set(window.__ecrits.slice(n))]; });
    const hist0 = await X.pg.evaluate(() => localStorage.getItem('ft4_coach_hist')), net0 = await X.pg.evaluate(() => window.__fetchN), e0 = await X.pg.evaluate(() => window.__ecrits.length);
    await vers(X, 'coach'); await X.pg.waitForTimeout(400);
    const m = await X.pg.evaluate(() => [...document.querySelectorAll('#coach-msgs .msg-bubble')].map(b => ({ role: b.classList.contains('msg-user') ? 'u' : 'c', h: b.dataset.heure || null,
      apres: getComputedStyle(b, '::after').content, texte: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) })));
    t('B-D086-⑪a ⭐ ' + W + ' px : chaque message porte sa date et son heure LOCALES enregistrées (« 17/10/2026 · 07:32 » …)',
      _det(m.map(x => x.h)) === _det(['Date indisponible', 'Date indisponible', '17/10/2026 · 07:32', '17/10/2026 · 07:32', '18/10/2026 · 11:32', '18/10/2026 · 11:32']), _det(m.map(x => x.h)));
    t('B-D086-⑪b ' + W + ' px : l\'heure est DESSINÉE sous le message (pas du texte de la bulle)', m.every(x => x.apres === '"' + x.h + '"'), _det(m.map(x => x.apres)));
    const maintenant = await X.pg.evaluate(() => (typeof _heureMsgTxt === 'function') ? _heureMsgTxt(Date.now()) : null);
    t('B-D086-⑫a ⭐ ' + W + ' px : un message sans heure enregistrée dit « Date indisponible » — jamais l\'heure de consultation (' + maintenant + ')',
      !!maintenant && m[0].h === 'Date indisponible' && m[1].h === 'Date indisponible' && !m.some(x => x.h === maintenant), _det(m.map(x => x.h)));
    t('B-D086-⑬a ⭐ ' + W + ' px : ordre de l\'historique conservé, la consigne interne reste invisible, le texte des bulles n\'a pas changé',
      _det(m.map(x => x.role + ':' + x.texte.slice(0, 12))) === _det(['u:Message anci', 'c:Réponse anci', 'u:Salut Milo, ', 'c:Je te propos', 'u:Et pour les ', 'c:Reste sur 12']) && !m.some(x => /2026 ·|indisponible/.test(x.texte)), _det(m.map(x => x.texte)));
    t('B-D086-⑬b ⭐ ' + W + ' px : afficher le fil ne réécrit pas l\'historique (ft4_coach_hist identique) et n\'appelle pas le réseau',
      (await X.pg.evaluate(() => localStorage.getItem('ft4_coach_hist'))) === hist0 && (await X.pg.evaluate(() => window.__fetchN)) === net0, '');
    const ec = await X.pg.evaluate(e0 => [...new Set(window.__ecrits.slice(e0))], e0);
    // Référence MESURÉE sur D-085 (6d9b6c90), même scénario : ouvrir le fil écrivait déjà ces deux clés existantes
    // (nouveautés vues, compteur du Gardien) en plus de celles de `persist()`. D-086 ne doit rien y ajouter.
    const ref085 = ref.concat(['ft4_gardienStats', 'ft4_seen_ft']);
    t('B-D086-⑮b ' + W + ' px : ouvrir le fil n\'écrit que les clés que D-085 écrivait déjà (aucune clé nouvelle)', ec.every(c => ref085.indexOf(c) >= 0), _det({ nouvelles: ec.filter(c => ref085.indexOf(c) < 0) }));
    await X.cx.close();
  }
  {
    // Un NOUVEAU message (formule de politesse : réponse locale, aucun réseau) et le débrief rangé SANS heure.
    const X = await ouvrir({ wkt: null, hist: HIST() });
    await vers(X, 'coach'); await X.pg.waitForTimeout(300);
    const net0 = await X.pg.evaluate(() => window.__fetchN);
    const av = await X.pg.evaluate(() => Date.now());
    await X.pg.evaluate(() => sendToCoach('merci', 'merci')); await X.pg.waitForTimeout(400);
    const n = await X.pg.evaluate(av => { const b = [...document.querySelectorAll('#coach-msgs .msg-bubble')].slice(-2); const ap = Date.now();
      const ok = h => { const m = /^(\d\d)\/(\d\d)\/(\d{4}) · (\d\d):(\d\d)$/.exec(h || ''); if (!m) return false; const d = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).getTime(); return d >= av - 60000 && d <= ap; };
      return { h: b.map(x => x.dataset.heure), ok: b.map(x => ok(x.dataset.heure)), roles: b.map(x => x.className) }; }, av);
    t('B-D086-⑪c ⭐ un message envoyé MAINTENANT porte l\'heure de l\'envoi, et la réponse aussi', n.ok.every(Boolean) && /msg-user/.test(n.roles[0]) && /msg-coach/.test(n.roles[1]), _det(n));
    t('B-D086-⑮c la réponse locale n\'a fait aucun appel réseau', (await X.pg.evaluate(() => window.__fetchN)) === net0, '');
    const nbHist = await X.pg.evaluate(() => coachHistory.length);
    await X.pg.evaluate(() => _dbfPoserDansHistorique('Débrief : bonne séance.', null)); await X.pg.waitForTimeout(300);
    const dbf = await X.pg.evaluate(() => { const b = [...document.querySelectorAll('#coach-msgs .msg-coach')].pop(); const m = coachHistory[coachHistory.length - 1];
      return { h: b && b.dataset.heure, txt: b && b.innerText.slice(0, 20), ts: Object.prototype.hasOwnProperty.call(m, 'ts'), n: coachHistory.length }; });
    t('B-D086-⑫b ⭐ le débrief, rangé sans heure (enregistrement INCHANGÉ — proposition à part), affiche « Date indisponible »',
      dbf.h === 'Date indisponible' && /Débrief/.test(dbf.txt) && dbf.ts === false && dbf.n === nbHist + 1, _det(dbf));
    t('B-D086-⑬c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ══ ⑭⑮ · CLAVIER, VALIDATION, AUCUNE CLÉ NOUVELLE ══════════════════════════════════════════════════════════════ */
  for (const [W, H] of [[360, 740], [390, 844]]) {
    const X = await ouvrir({ w: W, h: H, wkt: WKT() });
    await seance(X, 0);
    // Les clés que l'app écrit d'habitude : un `persist()` complet sert de référence.
    const ref = await X.pg.evaluate(() => { const n = window.__ecrits.length; persist(); return [...new Set(window.__ecrits.slice(n))]; });
    const e0 = await X.pg.evaluate(() => window.__ecrits.length), net0 = await X.pg.evaluate(() => window.__fetchN);
    const kb = Math.round(H * 0.55);
    await X.pg.evaluate(kb => { try { Object.defineProperty(window.visualViewport, 'height', { get: () => kb, configurable: true }); } catch (e) {} }, kb);
    await X.pg.evaluate(() => { const i = document.querySelector('#sr-0-2 .sinp'); i.focus(); }); await X.pg.waitForTimeout(450);
    const k = await X.pg.evaluate(kb => { const row = document.activeElement.closest('.set-row').getBoundingClientRect();
      return { cls: document.getElementById('root').classList.contains('kbd-serie'), nav: getComputedStyle(document.querySelector('.nav')).display, bas: Math.round(row.bottom), haut: Math.round(row.top), kb }; }, kb);
    t('B-D086-⑭b ⭐ ' + W + ' px : clavier ouvert dans une série → barre du bas masquée, ligne visible au-dessus du clavier', k.cls && k.nav === 'none' && k.bas <= kb && k.haut >= 0, _det(k));
    await X.pg.evaluate(() => { const i = document.querySelectorAll('#sr-0-2 .sinp')[1]; i.focus(); }); await X.pg.keyboard.press('Enter'); await X.pg.waitForTimeout(500);
    const v = await X.pg.evaluate(() => ({ done: S.wkt.exs[0].sets[2].done, repos: !!restIv, dock: document.getElementById('rest-bar').classList.contains('show') }));
    t('B-D086-⑭c ⭐ ' + W + ' px : « Entrée » sur KG valide la série et lance le repos (confirmSetAndNext inchangé)', v.done && v.repos && v.dock, _det(v));
    await X.pg.evaluate(() => { if (document.activeElement) document.activeElement.blur(); }); await X.pg.waitForTimeout(250);
    await clic(X, '#tbtn-0-3'); await X.pg.evaluate(() => skipRest());
    const ecrits = await X.pg.evaluate(e0 => [...new Set(window.__ecrits.slice(e0))], e0);
    t('B-D086-⑮d ⭐ ' + W + ' px : saisir, valider, changer un type, reposer n\'écrit QUE des clés que l\'app écrivait déjà (aucune clé nouvelle, aucune migration)',
      ecrits.every(c => ref.indexOf(c) >= 0), _det({ nouvelles: ecrits.filter(c => ref.indexOf(c) < 0) }));
    t('B-D086-⑮e ' + W + ' px : aucune connexion réseau pendant la séance', (await X.pg.evaluate(() => window.__fetchN)) === net0, '');
    t('B-D086-⑭d ' + W + ' px : aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}
module.exports = { ecran };
