/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-C3 — LA SÉANCE TRADUITE SURVIT AU RECHARGEMENT (27/09/2026)

   Mesuré avant correction (diagnostic C3) : la séance que la traduction produit vivait
   SEULEMENT dans `_pendingMiloSessions`, un tableau en mémoire. Le message enregistré ne
   portait que `{role, content, ts}` ; au rechargement, `_renderCoachThread` reconstruisait la
   séance depuis le TEXTE (`_seanceDepuisTexte`) :
     · texte lisible → 4 exercices « quand même », mais repos 120 s → 0 et consigne perdue ;
     · texte illisible → plus de séance du tout, une question, et une 2ᵉ traduction au tap.
   Décision de Michel (option A, option (i)) : un champ facultatif `seance` sur le message
   assistant, C3 seul, D-025 hors lot.

   Ce que les témoins CONDUISENT : `sendToCoach` de bout en bout (Worker simulé, 0 appel réel),
   un VRAI rechargement de page (`page.reload`), le rangement et la réouverture par « Mes
   discussions », et des historiques anciens déposés tels quels dans le stockage.
   Ce qu'ils OBSERVENT : la séance réellement proposée par la carte (`_pendingMiloSessions`),
   comparée champ par champ avant/après, le texte des cartes, le stockage local, et chaque
   requête envoyée au Worker. Ce qu'ils NE COUVRENT PAS : D-025 (`coupee` perdu par « Mes
   discussions »), le délai de 12 s, la traduction réelle, le cloud (l'historique n'y va pas).
   Banc : tools/banc_seance_c3.js · contrôle négatif : tools/mut_seance_c3.py
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const E = [
  { n: 'Développé couché', s: 4, r: 6, kg: 80 }, { n: 'Rowing barre', s: 4, r: 8, kg: 60 },
  { n: 'Développé militaire', s: 3, r: 8, kg: 40 }, { n: 'Extension triceps', s: 3, r: 12, kg: 20 },
];
const INTRO = 'Voilà ta séance haut du corps pour ce soir 💪\n\n', FIN = '\n\nBonne séance.';
// Le format que le prompt impose : lisible par le repli depuis C1, qui en IGNORE repos et consigne.
const LISIBLE = INTRO + E.map((e, i) => `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos 2 min — reste gainé`).join('\n') + FIN;
// Points médians : le repli ne lit rien.
const ILLISIBLE = INTRO + E.map(e => `**${e.n}** — ${e.s}×${e.r} · ${e.kg} kg · repos 2 min`).join('\n') + FIN;
const DEM = 'Donne-moi une séance haut du corps pour ce soir, 4 exercices';
// La traduction porte ce que le texte ne dit pas au repli : repos 120 s, une consigne par
// exercice, et un superset sur les deux derniers (C3-J).
const TRAD = { status: 'ok', seance: { label: 'Haut du corps', exs: E.map((e, i) => Object.assign({ name: e.n, note: 'CONSIGNE-' + i,
  sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg, type: 'N', rest: 120 })) }, i >= 2 ? { supersetGroup: 'A' } : {})) } };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCI. MILO-SEANCE-C3 — la séance traduite est gardée avec le message (source) ═══');
  const src = fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const corps = nom => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const light = corps('_lightMsg'), fil = corps('_renderCoachThread'), pay = corps('_coachHistPayload'), att = corps('_attacherSeance');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', light && fil && pay && att, [light, fil, pay, att].map(x => x.length).join('/'));
  t('② `_coachHistPayload` ne transmet toujours que `role` et `content` (le champ `seance` reste interne)',
    /\.map\(\s*m\s*=>\s*\(\{\s*role:\s*m\.role,\s*content:\s*m\.content\s*\}\)\)/.test(pay) && !/seance/.test(pay), '');
  const iCoupee = fil.indexOf('_coupeeValide(m.coupee)'), iSeance = fil.indexOf('m.seance');
  t('③ au rechargement, l\'arrêt sur une réponse coupée passe AVANT la lecture de `m.seance` (PDF1B prioritaire)',
    iCoupee > 0 && iSeance > 0 && iCoupee < iSeance, iCoupee + ' < ' + iSeance);
  t('④ `_attacherSeance` refuse une réponse coupée ou non confirmée', /_coupeeValide\(\s*msg\.coupee\s*\)/.test(att), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXCII. MILO-SEANCE-C3 — la séance survit au rechargement, sans retraduction (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 300);
  const D = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_devtoken: 'f'.repeat(64) };
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const req = []; let nCoach = 0;
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      req.push(c);
      if (c.action === 'coach') { nCoach++;
        const texte = (opts.replies || [])[nCoach - 1] || opts.texte || 'Ok.';
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: texte, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) }); }
      if (c.action === 'seanceJson') {
        if (opts.trad === 'panne' || (opts.trad === 'panne-puis-ok' && req.filter(x => x.action === 'seanceJson').length === 1)) return r.abort('failed');
        if (opts.delai) await new Promise(z => setTimeout(z, opts.delai));
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TRAD) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, D, opts.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_c3'))return; sessionStorage.setItem('_c3','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await prep(pg);
    return { cx, pg, req, errs, nTrad: () => req.filter(c => c.action === 'seanceJson').length };
  };
  const prep = pg => pg.evaluate(async () => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    S.premium = true; window._premiumPending = false;
    try { goScreen('coach', document.getElementById('nb-coach')); } catch (e) {}
    await new Promise(z => setTimeout(z, 400)); });
  // Ce que la carte proposerait réellement (la dernière séance posée), et les cartes par leur TEXTE.
  const lire = pg => pg.evaluate(() => {
    const w = [...document.querySelectorAll('#coach-msgs .coach-prog-save')].filter(x => /Cette séance te convient/.test(x.textContent));
    const btn = w.map(x => ((x.querySelector('button') || {}).textContent || '').trim());
    const p = (typeof _pendingMiloSessions !== 'undefined' && _pendingMiloSessions.length) ? _pendingMiloSessions[_pendingMiloSessions.length - 1] : null;
    let stock = []; try { stock = JSON.parse(localStorage.getItem('ft4_coach_hist') || '[]'); } catch (e) {}
    return { cartes: btn, seance: p ? JSON.parse(JSON.stringify(p)) : null,
      stockAssist: stock.filter(m => m.role === 'assistant').map(m => ({ cles: Object.keys(m).sort().join(','), n: m.seance && m.seance.exs ? m.seance.exs.length : null })) };
  });
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); await prep(X.pg); return lire(X.pg); };
  const envoyer = async (X, demande, attenteCarte) => X.pg.evaluate(async ({ demande, attenteCarte }) => {
    await sendToCoach(demande);
    const t0 = Date.now(); while (attenteCarte && Date.now() - t0 < 5000 && !/\(\d/.test([...document.querySelectorAll('#coach-msgs .coach-prog-save button')].map(e => e.textContent).join(' '))) await new Promise(z => setTimeout(z, 150));
    await new Promise(z => setTimeout(z, 500)); }, { demande, attenteCarte });
  const resume = s => s ? s.exs.map(e => e.name + '[' + e.sets.map(z => z.kg + 'x' + z.reps + z.type + '/r' + z.rest).join(',') + '] note=' + e.note + ' ss=' + (e.supersetGroup || '')).join(' | ') : 'null';
  const identique = (a, b) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b);
  const quatre = c => c.length === 1 && /\(4 exercices\)/.test(c[0]);
  const question = c => c.length === 1 && /Oui, on démarre$/.test(c[0]);
  const reposTravail = s => s ? s.exs.map(e => e.sets.filter(z => z.type === 'N').map(z => z.rest)) : [];
  const notes = s => s ? s.exs.map(e => /CONSIGNE-\d/.test(e.note)) : [];
  const tous = [];

  // ── C3-A · texte LISIBLE, traduction réussie ────────────────────────────────────────────
  const A = await ouvrir({ texte: LISIBLE }); tous.push(A);
  await envoyer(A, DEM, true);
  const aAv = await lire(A.pg), aTr = A.nTrad();
  const aAp = await recharger(A);
  t('C3-A avant : 4 exercices, repos 120 s sur chaque série de travail, consigne présente (la traduction)',
    quatre(aAv.cartes) && reposTravail(aAv.seance).every(r => r.length && r.every(x => x === 120)) && notes(aAv.seance).every(Boolean), resume(aAv.seance));
  t('C3-A ⭐ après VRAI rechargement : la MÊME séance, champ par champ (repos et consignes compris)',
    quatre(aAp.cartes) && identique(aAv.seance, aAp.seance), 'avant ' + resume(aAv.seance) + ' ≠ après ' + resume(aAp.seance));
  t('C3-A le message enregistré porte sa séance (4 exercices)', aAv.stockAssist.length === 1 && aAv.stockAssist[0].n === 4, js(aAv.stockAssist));
  t('C3-A le rechargement ne relance aucune traduction', A.nTrad() === aTr, aTr + ' → ' + A.nTrad());

  // ── C3-B · texte ILLISIBLE, traduction réussie ──────────────────────────────────────────
  const B = await ouvrir({ texte: ILLISIBLE }); tous.push(B);
  await envoyer(B, DEM, true);
  const bAv = await lire(B.pg), bTr = B.nTrad();
  const bAp = await recharger(B);
  t('C3-B avant : carte 4 exercices, venue de la traduction (1 appel)', quatre(bAv.cartes) && bTr === 1, js(bAv.cartes) + ' trad=' + bTr);
  t('C3-B ⭐ après VRAI rechargement : la carte 4 exercices revient directement (plus la simple question), séance identique',
    quatre(bAp.cartes) && identique(bAv.seance, bAp.seance), js(bAp.cartes) + ' ' + resume(bAp.seance));
  // démarrer la séance restaurée : aucune traduction, et c'est bien elle qui arrive dans l'écran Séance
  const bDem = await B.pg.evaluate(async () => { S.wkt = null;
    const btn = [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].find(e => /Oui, (on démarre|utiliser)/.test(e.textContent));
    if (btn) btn.click(); const t0 = Date.now(); while (Date.now() - t0 < 4000 && !(S.wkt && S.wkt.exs && S.wkt.exs.length)) await new Promise(z => setTimeout(z, 150));
    return S.wkt && S.wkt.exs ? S.wkt.exs.map(e => ({ n: e.name, series: e.sets.length, rest: e.sets.map(z => z.rest), note: e.note, ss: e.group && e.groupType === 'super' ? String(e.group) : null })) : null; });
  t('C3-B ⭐ au tap après rechargement : AUCUNE nouvelle traduction, 4 exercices chargés', B.nTrad() === bTr && bDem && bDem.length === 4, 'trad ' + bTr + ' → ' + B.nTrad() + ' ' + js(bDem));
  t('C3-B repos et consignes arrivent dans l\'écran Séance', !!bDem && bDem.every(e => e.rest.some(x => x === 120) && /CONSIGNE-\d/.test(e.note)), js(bDem));
  t('C3-J superset : l\'étiquette survit au rechargement (séance) et arrive dans l\'écran Séance (les 2 derniers liés)',
    !!bAp.seance && bAp.seance.exs.map(e => e.supersetGroup || '').join(',') === ',,A,A'
    && !!bDem && bDem[2].ss && bDem[2].ss === bDem[3].ss && !bDem[0].ss, js(bAp.seance && bAp.seance.exs.map(e => e.supersetGroup)) + ' ' + js(bDem && bDem.map(e => e.ss)));

  // ── C3-I · pas de double transformation (montée en charge, normalisation) ────────────────
  const n0 = s => s ? s.exs[0].sets.length : 0;
  t('C3-I la montée en charge n\'est appliquée qu\'UNE fois : même nombre de séries et mêmes charges après rechargement',
    n0(aAv.seance) === 7 && n0(aAp.seance) === 7 && n0(bAp.seance) === 7
    && aAp.seance && aAp.seance.exs[0].sets.map(z => z.kg).join(',') === '35,50,65,80,80,80,80', resume(aAp.seance));

  // ── C3-G · « Mes discussions » : ranger, rouvrir, recharger ─────────────────────────────
  const gAv = await B.pg.evaluate(async () => { newCoachChat(); await new Promise(z => setTimeout(z, 200));
    const c = S.coachConversations[0]; const a = c.messages.filter(m => m.role === 'assistant');
    loadCoachConv(c.id); await new Promise(z => setTimeout(z, 400));
    return { archive: a.map(m => m.seance && m.seance.exs ? m.seance.exs.length : null), actif: coachHistory.filter(m => m.role === 'assistant').map(m => m.seance && m.seance.exs ? m.seance.exs.length : null) }; });
  const gRo = await lire(B.pg), gTr = B.nTrad();
  const gAp = await recharger(B);
  t('C3-G la séance est rangée avec la discussion, puis recopiée à la réouverture', js(gAv.archive) === '[4]' && js(gAv.actif) === '[4]', js(gAv));
  t('C3-G ⭐ rouverte puis rechargée : même séance, carte 4 exercices, aucune traduction',
    quatre(gRo.cartes) && quatre(gAp.cartes) && identique(bAv.seance, gAp.seance) && B.nTrad() === gTr, js(gAp.cartes) + ' trad ' + gTr + '→' + B.nTrad());

  // ── C3-C · texte illisible, traduction EN PANNE : rien n'est fabriqué ────────────────────
  const C = await ouvrir({ texte: ILLISIBLE, trad: 'panne' }); tous.push(C);
  await envoyer(C, DEM, false);
  const cAv = await lire(C.pg), cAp = await recharger(C);
  t('C3-C sans traduction : la question seule, avant ET après rechargement, et aucune séance enregistrée',
    question(cAv.cartes) && question(cAp.cartes) && cAv.stockAssist.every(m => m.n === null && !/seance/.test(m.cles)) && !cAp.seance, js(cAv) + ' ' + js(cAp.cartes));

  // ── C3-L · la séance lue AU TAP (question à l'arrivée) rejoint aussi son message ──────────
  const L = await ouvrir({ texte: ILLISIBLE, trad: 'panne-puis-ok' }); tous.push(L);
  await envoyer(L, DEM, false);
  const lQ = await lire(L.pg);
  await L.pg.evaluate(async () => { const q = [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].find(e => /Oui, on démarre$/.test(e.textContent.trim()));
    if (q) q.click(); const t0 = Date.now(); while (Date.now() - t0 < 5000 && !/\(\d/.test([...document.querySelectorAll('#coach-msgs .coach-prog-save button')].map(e => e.textContent).join(' '))) await new Promise(z => setTimeout(z, 150)); });
  const lAv = await lire(L.pg), lTr = L.nTrad();
  const lAp = await recharger(L);
  t('C3-L question à l\'arrivée (traduction en panne), tap → 2ᵉ traduction réussie → carte 4 exercices', question(lQ.cartes) && quatre(lAv.cartes) && lTr === 2, js(lQ.cartes) + ' ' + js(lAv.cartes) + ' trad=' + lTr);
  t('C3-L ⭐ rechargé : la séance obtenue au tap revient directement, identique, sans 3ᵉ traduction',
    quatre(lAp.cartes) && identique(lAv.seance, lAp.seance) && L.nTrad() === lTr, js(lAp.cartes) + ' trad ' + lTr + '→' + L.nTrad());
  // ── C3-M · ancien message illisible : la question après rechargement, tap, puis rechargement ─
  const M = await ouvrir({ texte: ILLISIBLE, stock: { ft4_coach_hist: JSON.stringify([{ role: 'user', content: DEM, ts: Date.now() - 5000 }, { role: 'assistant', content: ILLISIBLE, ts: Date.now() - 4000 }]), ft4_coach_lastts: String(Date.now() - 4000) } }); tous.push(M);
  const mQ = await lire(M.pg);
  await M.pg.evaluate(async () => { const q = [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].find(e => /Oui, on démarre$/.test(e.textContent.trim()));
    if (q) q.click(); const t0 = Date.now(); while (Date.now() - t0 < 5000 && !/\(\d/.test([...document.querySelectorAll('#coach-msgs .coach-prog-save button')].map(e => e.textContent).join(' '))) await new Promise(z => setTimeout(z, 150)); });
  const mAv = await lire(M.pg), mTr = M.nTrad();
  const mAp = await recharger(M);
  t('C3-M ancien message (sans `seance`) : question, tap → 1 traduction → carte 4 exercices', question(mQ.cartes) && quatre(mAv.cartes) && mTr === 1, js(mQ.cartes) + ' ' + js(mAv.cartes) + ' trad=' + mTr);
  t('C3-M ⭐ rechargé : la séance lue au tap est désormais gardée — carte directe, identique, sans nouvelle traduction',
    quatre(mAp.cartes) && identique(mAv.seance, mAp.seance) && M.nTrad() === mTr, js(mAp.cartes) + ' trad ' + mTr + '→' + M.nTrad());

  // ── C3-F · ce qui part chez Milo ────────────────────────────────────────────────────────
  await B.pg.evaluate(async () => { await sendToCoach('Merci, et pour les étirements ?'); await new Promise(z => setTimeout(z, 300)); });
  const envoiMilo = B.req.filter(c => c.action === 'coach').pop() || {};
  const f = await B.pg.evaluate(() => _coachHistPayload(8));
  t('C3-F ⭐ l\'historique envoyé à Milo ne contient pas `seance` (payload direct ET requête réelle)',
    Array.isArray(envoiMilo.history) && envoiMilo.history.length > 0 && envoiMilo.history.every(m => Object.keys(m).sort().join(',') === 'content,role')
    && !/CONSIGNE-\d/.test(JSON.stringify(envoiMilo.history)) && f.every(m => !('seance' in m)), js(envoiMilo.history && envoiMilo.history.map(m => Object.keys(m))));

  // ── Historiques DÉPOSÉS (anciens messages, données injectées) ─────────────────────────────
  const maintenant = Date.now();
  const hist = (assist, extra) => JSON.stringify([{ role: 'user', content: DEM, ts: maintenant - 5000 }, Object.assign({ role: 'assistant', content: assist, ts: maintenant - 4000 }, extra || {})]);
  const SEANCE_OK = { label: 'Injectée', exs: [{ name: 'Développé Couché', note: 'INJECTEE', sets: [{ reps: 5, kg: 50, maxi: false, type: 'N', rest: 90 }] },
    { name: 'Squat à la Barre', note: 'INJECTEE', sets: [{ reps: 5, kg: 60, maxi: false, type: 'N', rest: 90 }] }] };
  const deposer = async (assist, extra) => { const X = await ouvrir({ stock: { ft4_coach_hist: hist(assist, extra), ft4_coach_lastts: String(maintenant - 4000) } }); tous.push(X);
    const r = await lire(X.pg); r.nTrad = X.nTrad(); await X.cx.close(); return r; };

  const d1 = await deposer(LISIBLE);
  t('C3-D ancien message LISIBLE sans `seance` : comportement d\'avant (carte 4 exercices lue dans le texte, sans repos)',
    quatre(d1.cartes) && reposTravail(d1.seance).every(r => r.every(x => x === 0)) && d1.nTrad === 0, js(d1.cartes) + ' ' + resume(d1.seance));
  const d2 = await deposer(ILLISIBLE);
  t('C3-D ancien message ILLISIBLE sans `seance` : la question, comme avant', question(d2.cartes) && !d2.seance, js(d2.cartes));

  for (const genre of ['reponse', 'non_confirmee', 'analyse']) {
    const e = await deposer(LISIBLE, { coupee: genre, seance: SEANCE_OK });
    t('C3-E ⭐ réponse `coupee:' + genre + '` avec un champ `seance` injecté → AUCUNE carte démarrable', e.cartes.length === 0 && !e.seance, js(e.cartes));
  }

  const h1 = await deposer(LISIBLE, { seance: 'pas une séance' });
  t('C3-H `seance` = texte quelconque → pas de plantage, repli sur le texte (4 exercices)', quatre(h1.cartes) && reposTravail(h1.seance).every(r => r.every(x => x === 0)), js(h1.cartes));
  const h2 = await deposer(ILLISIBLE, { seance: { label: 'x', exs: [{ name: 'Développé Couché', sets: [null] }] } });
  t('C3-H `seance` malformée (série nulle) → pas de plantage, aucune séance corrompue, la question comme sans `seance`', question(h2.cartes) && !h2.seance, js(h2.cartes));
  const h3 = await deposer(ILLISIBLE, { seance: { exs: [{ name: 'Développé Couché', sets: [] }] } });
  t('C3-H `seance` sans série → écartée par la normalisation existante, la question', question(h3.cartes) && !h3.seance, js(h3.cartes));
  const h4 = await deposer(ILLISIBLE, { seance: SEANCE_OK });
  t('C3-H `seance` valide sur un texte illisible → c\'est ELLE qui est proposée (la structure prime sur le texte)',
    h4.cartes.length === 1 && /\(2 exercices\)/.test(h4.cartes[0]) && !!h4.seance && h4.seance.exs.every(e => e.note === 'INJECTEE'), js(h4.cartes) + ' ' + resume(h4.seance));

  // ── Courses : la traduction arrive APRÈS que le message est enregistré ──────────────────
  // K1 · une 2ᵉ réponse arrive avant la traduction de la 1ʳᵉ
  const K1 = await ouvrir({ replies: [ILLISIBLE, 'Avec plaisir, bonne séance !'], delai: 1500 }); tous.push(K1);
  const k1 = await K1.pg.evaluate(async (DEM) => { await sendToCoach(DEM); await sendToCoach('Et pour les étirements après la séance, tu conseilles quoi ?'); await new Promise(z => setTimeout(z, 2500));
    return coachHistory.map(m => m.role + ':' + (m.seance && m.seance.exs ? m.seance.exs.length : '-')); }, DEM);
  const k1s = await lire(K1.pg);
  t('K1 ⭐ traduction tardive, une autre réponse entre-temps : la séance va au BON message, aucun doublon',
    js(k1) === js(['user:-', 'assistant:4', 'user:-', 'assistant:-']) && js(k1s.stockAssist.map(m => m.n)) === '[4,null]', js(k1) + ' ' + js(k1s.stockAssist));
  // K2 · la discussion est rangée avant la fin de la traduction
  const K2 = await ouvrir({ texte: ILLISIBLE, delai: 1500 }); tous.push(K2);
  const k2 = await K2.pg.evaluate(async (DEM) => { await sendToCoach(DEM); newCoachChat(); await new Promise(z => setTimeout(z, 2500));
    return { actif: coachHistory.length, archive: S.coachConversations[0].messages.map(m => m.role + ':' + (m.seance ? 'S' : '-')),
      stock: localStorage.getItem('ft4_coach_hist') }; }, DEM);
  t('K2 discussion rangée avant la traduction : rien de corrompu (2 messages rangés intacts, fil neuf vide, rien écrit dedans)',
    k2.actif === 0 && js(k2.archive) === js(['user:-', 'assistant:-']) && (k2.stock === null || k2.stock === '[]'), js(k2));
  // K3 · une AUTRE discussion est rouverte avant la fin de la traduction
  const autre = JSON.stringify([{ id: 'cAutre', title: 'Autre', ts: maintenant - 86400000, messages: [{ role: 'user', content: 'Parlons sommeil', ts: maintenant - 86400000 }, { role: 'assistant', content: 'Dors 8 h.', ts: maintenant - 86399000 }] }]);
  const K3 = await ouvrir({ texte: ILLISIBLE, delai: 1500, stock: { ft4_coach_convs: autre } }); tous.push(K3);
  const k3 = await K3.pg.evaluate(async (DEM) => { await sendToCoach(DEM); loadCoachConv('cAutre'); await new Promise(z => setTimeout(z, 2500));
    let st = []; try { st = JSON.parse(localStorage.getItem('ft4_coach_hist') || '[]'); } catch (e) {}
    return { actif: coachHistory.map(m => m.content.slice(0, 12) + ':' + (m.seance ? 'S' : '-')), stock: st.map(m => m.seance ? 'S' : '-'),
      rangee: (S.coachConversations || []).map(c => c.messages.map(m => m.seance ? 'S' : '-').join('')) }; }, DEM);
  t('K3 autre discussion rouverte avant la traduction : la séance n\'est rattachée à AUCUN de ses messages',
    k3.actif.length === 2 && k3.actif.every(x => /:-$/.test(x)) && k3.stock.every(x => x === '-') && k3.rangee.every(x => !/S/.test(x)), js(k3));

  t('C∅ aucune erreur de page', tous.every(x => !x.errs.length), tous.map(x => x.errs.join('|')).join(' ').slice(0, 300));
  for (const X of [A, B, C, L, M, K1, K2, K3]) { try { await X.cx.close(); } catch (e) {} }
};
