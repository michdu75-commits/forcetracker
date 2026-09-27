/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-RETRAVAIL — UNE SÉANCE RETRAVAILLÉE DEVIENT LA SEULE SÉANCE ACTIVE (27/09/2026)

   Cas réel de Michel (ft-v1238) : séance A (5 exercices) → carte « 5 » → « Non, retravaille »
   → « Autre chose… » → « Avec 4 exercices stp » → Milo écrit B (4 exercices) → AUCUNE carte
   pour B, la « 5 » reste seule. Cause de l'essai réel NON déterminée ; mécanisme reproduit :
   B n'est lue ni par la traduction ni par le repli, et la question « on démarre ? » ne la
   rattrape pas, parce qu'un message de retravail n'est pas reconnu comme une demande de séance.
   Diagnostic aussi : avant rechargement toutes les versions restent démarrables ; après
   rechargement, une ancienne séance est remontée et sa carte posée sous le texte de B.
   Décision de Michel (option C) : l'historique reste visible, UNE seule version est active —
   la dernière ; si elle n'est pas structurée, on propose de préparer CETTE réponse, sous elle ;
   jamais d'ancienne séance ressuscitée sous une proposition plus récente.

   Ce que les témoins CONDUISENT : `sendToCoach` de bout en bout (Worker simulé, 0 appel réel),
   le vrai bouton « Non, retravaille » et ses motifs, un VRAI rechargement de page, « Mes
   discussions ». Ce qu'ils OBSERVENT : les cartes séance bulle par bulle (par leur TEXTE), la
   séance que la carte démarrerait, et chaque requête envoyée au Worker. Ce qu'ils NE COUVRENT
   PAS : D-025, K3 (traduction tardive dans une autre discussion), le délai de 12 s, le résumé
   mémoire (aucun e-mail dans ces fils), la traduction réelle.
   Banc : tools/banc_seance_retravail.js · contrôle négatif : tools/mut_seance_retravail.py
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const TOUS = [['Développé couché', 4, 6, 80], ['Rowing barre', 4, 8, 60], ['Développé militaire', 3, 8, 40],
  ['Extension triceps', 3, 12, 20], ['Curl barre', 3, 10, 30], ['Élévations latérales', 3, 15, 8]];
// Lisible : le format du prompt, lu par le repli depuis C1. Illisible : points médians.
const texte = (tag, n, illisible) => `Séance ${tag} (TAG-${tag}) 💪\n\n` + TOUS.slice(0, n).map((e, i) => illisible
  ? `**${e[0]}** — ${e[1]}×${e[2]} · ${e[3]} kg · repos 2 min`
  : `${i + 1}. ${e[0]} — ${e[1]}×${e[2]} à ${e[3]} kg, repos 2 min — reste gainé`).join('\n') + '\n\nBonne séance.';
const trad = n => ({ status: 'ok', seance: { label: 'X', exs: TOUS.slice(0, n).map(e => ({ name: e[0], note: 'C',
  sets: Array.from({ length: e[1] }, () => ({ reps: e[2], kg: e[3], type: 'N', rest: 120 })) })) } });
const DEM = 'Donne-moi une séance haut du corps pour ce soir';

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCIII. MILO-SEANCE-RETRAVAIL — une seule séance active, sous son message (source) ═══');
  const src = fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const corps = nom => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const fil = corps('_renderCoachThread'), ctx = corps('_suitUnePropositionDeSeance'), des = corps('_desactiverAutresCartesSeance');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', fil && ctx && des, [fil, ctx, des].map(x => x.length).join('/'));
  t('② le contexte de retravail se déduit de l\'historique : il écarte la réponse à une consigne interne (`_silent`)', /_silent/.test(ctx), '');
  const iCoupee = fil.indexOf('_coupeeValide(m.coupee)'), iSeance = fil.indexOf('m.seance');
  t('③ au rechargement, l\'arrêt sur une réponse coupée reste AVANT toute lecture de séance (PDF1B prioritaire)',
    iCoupee > 0 && iSeance > 0 && iCoupee < iSeance, iCoupee + ' < ' + iSeance);
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXCIV. MILO-SEANCE-RETRAVAIL — la dernière version est la seule active (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 320);
  const D = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_devtoken: 'f'.repeat(64) };
  // plan : [{tag, n, ill, trad:'ok'|'panne'|'panne-puis-ok', coupee, tape, motif}] — la 1ʳᵉ est la demande initiale
  const ouvrir = async (plan, stock) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const req = []; let k = 0; const essais = {};
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      req.push(c.action || '?');
      if (c.action === 'coach') { const p = plan[Math.min(k++, plan.length - 1)];
        const env = p.coupee ? { stopReason: 'max_tokens', truncated: true, complete: false } : { stopReason: 'end_turn', truncated: false, complete: true };
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(Object.assign({ reply: p.txt || texte(p.tag, p.n, p.ill), continued: false }, env)) }); }
      if (c.action === 'seanceJson') { const tag = (String(c.texte || '').match(/TAG-(\w+)/) || [])[1]; const p = plan.find(x => x.tag === tag) || {};
        essais[tag] = (essais[tag] || 0) + 1;
        if (p.trad === 'panne' || (p.trad === 'panne-puis-ok' && essais[tag] === 1)) return r.abort('failed');
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(trad(p.n)) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, D, stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_rt'))return; sessionStorage.setItem('_rt','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, req, errs, n: a => req.filter(x => x === a).length };
    await prep(X); return X;
  };
  const prep = X => X.pg.evaluate(async () => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    S.premium = true; window._premiumPending = false; try { goScreen('coach', document.getElementById('nb-coach')); } catch (e) {}
    await new Promise(z => setTimeout(z, 300)); });
  // Les cartes séance, bulle par bulle, repérées par leur TEXTE ; la bulle est nommée par son TAG.
  const lire = X => X.pg.evaluate(() => {
    const bulles = [...document.querySelectorAll('#coach-msgs .msg-coach')];
    const out = [];
    bulles.forEach(b => { const tag = ((b.textContent.match(/TAG-(\w+)/) || [])[1]) || '?';
      [...b.querySelectorAll('.coach-prog-save')].filter(w => /Cette séance te convient/.test(w.textContent)).forEach(w => {
        const oui = [...w.querySelectorAll('button')].map(x => x.textContent.trim()).find(x => /Oui/.test(x)) || '';
        out.push(tag + ':' + (/\(\d+ exercices?\)/.test(oui) ? oui.match(/\((\d+)/)[1] : '?')); }); });
    return out; });
  const envoyer = (X, m) => X.pg.evaluate(async m => { await sendToCoach(m); await new Promise(z => setTimeout(z, 1300)); }, m);
  const retravailler = (X, motif, tape) => X.pg.evaluate(async ({ motif, tape }) => {
    const non = [...document.querySelectorAll('#coach-msgs .milo-ask-no')].pop(); if (non) non.click();
    await new Promise(z => setTimeout(z, 150));
    const chip = [...document.querySelectorAll('.milo-ask-chip')].find(c => c.textContent === motif); if (chip) chip.click();
    if (motif === 'Autre chose…') await sendToCoach(tape);
    const t0 = Date.now(); while (Date.now() - t0 < 3000 && coachBusy) await new Promise(z => setTimeout(z, 100));
    await new Promise(z => setTimeout(z, 1300)); }, { motif, tape });
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); await prep(X); return lire(X); };
  const taperQuestion = X => X.pg.evaluate(async () => {
    const q = [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].find(e => /Oui, on démarre$/.test(e.textContent.trim()));
    if (q) q.click(); const t0 = Date.now(); while (Date.now() - t0 < 4000 && !document.querySelector('#coach-msgs .coach-seance-carte button') ) await new Promise(z => setTimeout(z, 100));
    await new Promise(z => setTimeout(z, 800)); return !!q; });
  const demarrer = X => X.pg.evaluate(async () => { S.wkt = null;
    const bs = [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].filter(e => /Oui, (on démarre|utiliser)/.test(e.textContent) && /\(\d/.test(e.textContent));
    if (bs.length !== 1) return 'cartes=' + bs.length; bs[0].click();
    const t0 = Date.now(); while (Date.now() - t0 < 3000 && !(S.wkt && S.wkt.exs && S.wkt.exs.length)) await new Promise(z => setTimeout(z, 100));
    return S.wkt && S.wkt.exs ? S.wkt.exs.length : 0; });
  const tous = [];

  // ── R1 · retravail « Autre chose… » → B illisible, traduction en panne (le cas de Michel) ──
  const P1 = [{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, ill: 1, trad: 'panne-puis-ok' }];
  const X1 = await ouvrir(P1); tous.push(X1);
  await envoyer(X1, DEM); const r1a = await lire(X1);
  await retravailler(X1, 'Autre chose…', 'Avec 4 exercices stp'); const r1b = await lire(X1);
  t('R1 avant retravail : une carte « 5 » sous A', js(r1a) === js(['A:5']), js(r1a));
  t('R1 ⭐ B illisible et non traduite : la question « on démarre ? » s\'affiche SOUS B, et A n\'est plus démarrable',
    js(r1b) === js(['B:?']), js(r1b));
  const trAvantTap = X1.n('seanceJson');
  await taperQuestion(X1); const r1c = await lire(X1);
  t('R1 le tap prépare CETTE réponse : carte « 4 » sous B, 1 seule traduction de plus, A toujours inactive',
    js(r1c) === js(['B:4']) && X1.n('seanceJson') === trAvantTap + 1, js(r1c) + ' trad ' + trAvantTap + '→' + X1.n('seanceJson'));
  const r1r = await recharger(X1);
  t('R1 rechargé : la carte « 4 » sous B, jamais A, 0 traduction', js(r1r) === js(['B:4']) && X1.n('seanceJson') === trAvantTap + 1, js(r1r));

  // ── R3 · rechargement SANS avoir tapé : on ne remonte pas vers A ──
  const X3 = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, ill: 1, trad: 'panne' }]); tous.push(X3);
  await envoyer(X3, DEM); await retravailler(X3, 'Autre chose…', 'Que 4 exercices');
  const tr3avant = X3.n('seanceJson');
  const r3 = await recharger(X3);
  t('R3 ⭐ rechargé avant tout tap : la question sous B — la carte de A n\'est PAS posée sous le texte de B', js(r3) === js(['B:?']), js(r3));
  const tr3 = X3.n('seanceJson');
  t('R3 le rechargement lui-même ne lance aucune traduction', tr3 === tr3avant, 'trad ' + tr3avant + '→' + tr3);
  // la traduction de B répond maintenant (on remplace la route du Worker, rien d'autre ne change)
  await X3.cx.unroute(/workers\.dev/);
  await X3.cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
    X3.req.push(c.action || '?');
    if (c.action === 'seanceJson') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(trad(4)) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
  await taperQuestion(X3); const r3t = await lire(X3);
  const r3r = await recharger(X3);
  t('R3 tap sur la question du rechargement : 1 traduction, carte « 4 » sous B ; rechargée : la même, 0 traduction de plus',
    js(r3t) === js(['B:4']) && js(r3r) === js(['B:4']) && X3.n('seanceJson') === tr3 + 1, js(r3t) + ' → ' + js(r3r) + ' trad ' + tr3 + '→' + X3.n('seanceJson'));

  // ── R2 · retravail lisible : B remplace A ──
  const X2 = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, trad: 'ok' }]); tous.push(X2);
  await envoyer(X2, DEM); await retravailler(X2, 'Autre chose…', 'Avec 4 exercices stp'); const r2 = await lire(X2);
  t('R2 ⭐ B lisible : une seule carte active, « 4 » sous B (A n\'est plus démarrable)', js(r2) === js(['B:4']), js(r2));
  const d2 = await demarrer(X2);
  t('R2 démarrer lance bien B (4 exercices)', d2 === 4, String(d2));
  const r2r = await recharger(X2);
  t('R2 rechargé : la même, sous B', js(r2r) === js(['B:4']), js(r2r));

  // ── R4 · trois retravails : seule D est active, immédiatement et après rechargement ──
  const X4 = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, trad: 'ok' }, { tag: 'C', n: 6, trad: 'ok' }, { tag: 'D', n: 3, trad: 'ok' }]); tous.push(X4);
  await envoyer(X4, DEM);
  for (const m of ['Avec 4 exercices stp', 'Finalement 6', 'Plutôt 3']) await retravailler(X4, 'Autre chose…', m);
  const r4 = await lire(X4), c4 = X4.n('coach'), s4 = X4.n('seanceJson');
  t('R4 ⭐ A → B → C → D : une seule carte active, « 3 » sous D', js(r4) === js(['D:3']), js(r4));
  const r4r = await recharger(X4);
  t('R4 rechargé : toujours la seule « 3 » sous D', js(r4r) === js(['D:3']), js(r4r));

  // ── R5 · « Mes discussions » : ranger puis rouvrir la chaîne ──
  const r5 = await X4.pg.evaluate(async () => { newCoachChat(); const id = S.coachConversations[0].id; loadCoachConv(id); await new Promise(z => setTimeout(z, 500)); return 1; });
  const r5b = await lire(X4);
  t('R5 rangée puis rouverte : la même dernière version seule active (« 3 » sous D)', r5 === 1 && js(r5b) === js(['D:3']), js(r5b));
  const d5 = await demarrer(X4);
  t('R5 … et elle démarre sans appel (3 exercices)', d5 === 3 && X4.n('seanceJson') === s4 && X4.n('coach') === c4, String(d5) + ' coach ' + c4 + '→' + X4.n('coach') + ' trad ' + s4 + '→' + X4.n('seanceJson'));

  // ── R6 · la dernière réponse du retravail est coupée ──
  const X6 = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, trad: 'ok', coupee: 1 }]); tous.push(X6);
  await envoyer(X6, DEM); await retravailler(X6, 'Autre chose…', 'Avec 4 exercices stp');
  const r6 = await lire(X6), r6r = await recharger(X6);
  t('R6 ⭐ réponse de retravail coupée : aucune carte pour elle, et A n\'est ni gardée active ni ressuscitée', js(r6) === '[]' && js(r6r) === '[]', js(r6) + ' → ' + js(r6r));

  // ── R7 · le coût : aucun appel ajouté ──
  t('R7 A + 3 retravails lisibles : 4 appels Milo et 4 traductions, rien de plus', c4 === 4 && s4 === 4, 'coach=' + c4 + ' trad=' + s4);
  t('R7 rechargement, « Mes discussions » et démarrage : 0 appel', X4.n('coach') === c4 && X4.n('seanceJson') === s4, 'coach ' + c4 + '→' + X4.n('coach') + ' trad ' + s4 + '→' + X4.n('seanceJson'));

  // ── Motifs prérédigés : « Trop long » n'est pas une demande de séance au sens du texte ──
  const XM = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'B', n: 4, ill: 1, trad: 'panne' }]); tous.push(XM);
  await envoyer(XM, DEM); await retravailler(XM, 'Trop long'); const rm = await lire(XM);
  t('R8 motif « Trop long », B illisible et non traduite : la question sous B, A inactive', js(rm) === js(['B:?']), js(rm));

  // ── Bornes : ce qui n'est PAS un retravail ne doit rien changer ──
  const XN = await ouvrir([{ tag: 'A', n: 5, trad: 'ok' }, { tag: 'N', txt: 'La créatine se prend tous les jours, 3 à 5 g, le moment importe peu. (TAG-N)' }]); tous.push(XN);
  await envoyer(XN, DEM); await envoyer(XN, 'La créatine, je la prends quand ?'); const rn = await lire(XN);
  const rnr = await recharger(XN);
  t('R9 une question sans rapport après A : pas de question séance sous la réponse, A reste active',
    js(rn) === js(['A:5']) && js(rnr) === js(['A:5']), js(rn) + ' → ' + js(rnr));
  const cl = JSON.stringify([{ role: 'user', content: 'donne moi ma séance', ts: Date.now() - 5000 },
    { role: 'assistant', content: texte('A', 5), ts: Date.now() - 4000 },
    { role: 'user', content: 'OK, tu peux lancer la séance', ts: Date.now() - 3000 },
    { role: 'assistant', content: 'La séance est juste au-dessus 👆 (TAG-Z)', ts: Date.now() - 2000 }]);
  const XC = await ouvrir([{ tag: 'Z' }], { ft4_coach_hist: cl, ft4_coach_lastts: String(Date.now() - 2000) }); tous.push(XC);
  const rc = await lire(XC);
  t('R10 un mot de Milo après la séance (ft-v1051) : la carte de A reste, posée sous A — plus sous le dernier message', js(rc) === js(['A:5']), js(rc));

  const dbf = JSON.stringify([{ role: 'user', content: '[DÉBRIEF AUTO] Je viens de terminer ma séance…', _silent: true, ts: Date.now() - 6000 },
    { role: 'assistant', content: texte('R', 5), ts: Date.now() - 5000 },
    { role: 'user', content: 'Avec 4 exercices stp', ts: Date.now() - 4000 },
    { role: 'assistant', content: texte('Q', 4, true), ts: Date.now() - 3000 }]);
  const XD = await ouvrir([{ tag: 'Z' }], { ft4_coach_hist: dbf, ft4_coach_lastts: String(Date.now() - 3000) }); tous.push(XD);
  const rd = await lire(XD);
  t('R11 un récap de débrief (réponse à une consigne interne) n\'est pas une séance proposée : pas de question sous la réponse suivante', js(rd) === '[]', js(rd));
  t('R∅ aucune erreur de page', tous.every(x => !x.errs.length), tous.map(x => x.errs.join('|')).join(' ').slice(0, 300));
  for (const X of tous) { try { await X.cx.close(); } catch (e) {} }
};
