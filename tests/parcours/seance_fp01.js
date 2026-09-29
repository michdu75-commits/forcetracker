/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-FP-01 — UNE MENTION CONVERSATIONNELLE DE SÉANCE N'EST PLUS UNE DEMANDE DE SÉANCE
   session-B · 29/09/2026

   Terrain (Michel, 29/09, ft-v1242) : la carte « Cette séance te convient ? · ⚡ Oui, on démarre ·
   ✏️ Non, retravaille » s'affichait sous des réponses de Milo sans aucune séance — y compris sous
   celle où Milo disait « c'est un bug d'affichage ».
   MESURÉ AVANT CORRECTION (master 7a71649e, ft-v1243) : `_demandeUneSeance` (coach.js) rendait VRAI
   pour « Ya le bouton démarrer une séance qui est arrivé », « Non ya le bouton démarrer une séance »,
   « Le bouton pour démarrer une séance s'affiche encore », « Je ne demande pas une séance, je parle du
   bouton », « Tu m'as encore affiché une séance alors qu'on parlait d'autre chose » — les cinq par la
   MÊME règle, la ② (« une / ma / la … séance », sans verbe de demande). `sendToCoach` pose alors la
   question (`_dsDemande` → `_appendSeanceQuestion`), et la relecture du fil la repose au rechargement.
   ⛔ CAUSE DE LA PREMIÈRE CARTE TERRAIN (13:38-13:39) : NON DÉMONTRÉE — son message déclencheur n'est
   pas sur les captures. Ce banc ne prétend corriger que le mécanisme démontré.

   Ce que les témoins CONDUISENT : l'onglet Coach, le vrai champ `#coach-inp` et le vrai bouton
   `#coach-send-btn` (donc `sendToCoach`), un VRAI rechargement avec un fil déposé (relecture du fil).
   Frontières simulées : le Worker (réponses de Milo fournies par le banc), Apps Script coupé.
   ⛔ AUCUN APPEL MILO RÉEL.
   Ce qu'ils OBSERVENT : la valeur de `_demandeUneSeance` servie, et les cartes réellement affichées
   dans `#coach-msgs`, comptées par leur TEXTE (« Cette séance te convient ? »).
   Ce qu'ils NE COUVRENT PAS : le parser `_seanceDepuisTexte`, la traduction (cervelet), la séance
   lue dans le texte de Milo (voies ① ② ③ de `sendToCoach`), `message.seance`, F08/K3, le retravail.
   Banc : tools/banc_fp01.js · contrôle négatif : tools/mut_fp01.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */

// Les phrases du lot, telles que Michel les a écrites ou demandées (apostrophes typographiques comprises).
const N = {
  N1: 'Ya le bouton démarrer une séance qui est arrivé',
  N2: 'Non ya le bouton démarrer une séance',
  N3: 'Le bouton pour démarrer une séance s’affiche encore',
  N4: 'Je ne demande pas une séance, je parle du bouton',
  N5: 'Tu m’as encore affiché une séance alors qu’on parlait d’autre chose' };
const P = {
  P1: 'Fais-moi une séance',
  P2: 'Prépare-moi une séance de 45 minutes',
  P3: 'Je veux une séance pecs triceps',
  P5: 'Fais-moi ma séance du jour',
  P6: 'Je veux démarrer une séance' };
// P4 : NON détectée AVANT ce lot (mesuré) — trou préexistant, épinglé tel quel, ni élargi ni corrigé ici.
const P4 = 'Quelle séance je fais aujourd’hui ?';
// Réponse de Milo sans aucune séance (celle du terrain, 29/09 13:47).
const REPONSE_BUG = "Ah mince ! C'est un bug d'affichage côté app plutôt que quelque chose que j'ai généré — je n'ai rien écrit qui ressemble à une séance dans notre échange.";
// Réponse neutre à une vraie demande : aucune séance lisible, donc seule la DEMANDE peut poser la question.
const REPONSE_NEUTRE = 'Avec plaisir ! Tu préfères travailler le haut ou le bas du corps aujourd’hui ?';

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDVIII (session-B). MILO-SEANCE-FP-01 — parler d\'une séance n\'est pas en demander une (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const d = corps(co, '_demandeUneSeance');
  t('① `_demandeUneSeance` est trouvée (sinon les témoins suivants ne mesurent rien)', d.length > 200, d.length);
  const iVerbe = d.search(/\(fai\[st\]\|donne/), iSansVerbe = d.search(/\(une\|ma\|la\|nouvelle/);
  const iMeta = d.search(/\\bbouton/);
  t('② le garde « on parle de la carte / du bouton » agit APRÈS la règle à verbe et AVANT les règles sans verbe',
    iVerbe > 0 && iMeta > iVerbe && iSansVerbe > iMeta, [iVerbe, iMeta, iSansVerbe].join(' < '));
  const lMeta = (d.split('\n').find(l => /\\bbouton/.test(l)) || '');
  t('③ il est testé sur la copie SANS ACCENTS (`p`) — « affiché » / « apparaît » doivent mordre', /\.test\(p\)\)\s*return false/.test(lMeta), lMeta.trim().slice(0, 160));
  t('④ ⛔ un seul endroit décide : toujours 2 appelants (envoi du message · relecture du fil), aucun nouveau',
    (co.match(/_demandeUneSeance\(/g) || []).length === 3, (co.match(/_demandeUneSeance\(/g) || []).length);
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CDIX (session-B). MILO-SEANCE-FP-01 — la carte séance ne répond plus à une plainte (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const ouvrir = async (opts) => {
    opts = opts || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const req = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      req.push(c.action || '');
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: opts.reponse || REPONSE_BUG, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({ ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1' }, opts.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_fp1'))return; sessionStorage.setItem('_fp1','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.premium = true; window._premiumPending = false; });
    const h = await pg.$('#nb-coach'); if (h) { await h.click(); await pg.waitForTimeout(500); }
    await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    return { cx, pg, req, errs };
  };
  // Les cartes séance réellement affichées, comptées par leur TEXTE ; et les boutons qu'elles portent.
  const cartes = pg => pg.evaluate(() => {
    const w = [...document.querySelectorAll('#coach-msgs .coach-prog-save')].filter(x => /Cette séance te convient/.test(x.textContent));
    return { n: w.length, oui: w.filter(x => /Oui, on démarre/.test(x.textContent)).length, non: w.filter(x => /Non, retravaille/.test(x.textContent)).length };
  });
  // CONDUIT : on tape dans le vrai champ et on appuie sur le vrai bouton d'envoi.
  const taper = async (X, msg) => {
    await X.pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    await X.pg.fill('#coach-inp', msg);
    await X.pg.click('#coach-send-btn');
    await X.pg.waitForFunction(() => !window.coachBusy && [...document.querySelectorAll('#coach-msgs .msg-coach')].length > 0, null, { timeout: 8000 }).catch(() => {});
    await X.pg.waitForTimeout(900);
  };

  // ── A · B · C · D : la valeur servie par l'app (aucun réseau) ─────────────────────────────────
  const A = await ouvrir();
  const v = await A.pg.evaluate(({ N, P, P4 }) => {
    const j = s => _demandeUneSeance(s);
    const map = o => Object.fromEntries(Object.entries(o).map(([k, s]) => [k, j(s)]));
    return {
      N: map(N), P: map(P), P4: j(P4),
      varNeg: [ 'YA LE BOUTON DÉMARRER UNE SÉANCE', 'ya le bouton demarrer une seance', 'le bouton "démarrer une séance" est revenu !!!',
                'encore le bouton une séance...', 'Il y a un bug, ça affiche une séance', 'la carte séance est apparue sous ta réponse',
                "Je veux pas une séance, c'était une question", 'pas besoin de la séance, je parlais du bug',
                'Je ne demande pas une séance', 'je veux pas une séance maintenant', 'une séance apparaît sous chaque réponse' ].map(s => [s, j(s)]),
      varPos: [ 'FAIS-MOI UNE SÉANCE', 'fais moi une seance', 'Une séance jambes stp', 'Séance du jour ?', 'ma séance du jour ?',
                'prépare-moi une séance de 45 min, le bouton peut attendre' ].map(s => [s, j(s)]),
      anciensNon: [ 'Oui mais pourquoi tu me donnes la séance à faire ?', 'la séance était trop longue', 'pourquoi ma séance ne compte pas ?',
                    'je viens de finir ma séance', "j'ai fait ma séance ce matin", 'Pourquoi tu me sors une séance lol' ].map(s => [s, j(s)]),
      anciensOui: [ 'pourquoi pas une séance jambes ?', 'pourquoi tu ne me fais pas une séance jambes ?', 'donne moi une séance pour ce soir',
                    'je fais quoi aujourd hui ?' ].map(s => [s, j(s)]),
      trous: [ 'on fait quoi ce soir', 'on s entraîne quoi demain ?' ].map(s => [s, j(s)])
    };
  }, { N, P, P4 });
  t('A1 N1 « Ya le bouton démarrer une séance qui est arrivé » n\'est PAS une demande', v.N.N1 === false, js(v.N));
  t('A2 N2 « Non ya le bouton démarrer une séance » n\'est PAS une demande', v.N.N2 === false, js(v.N));
  t('A3 N3 · N4 · N5 (bouton affiché · « je ne demande pas » · « encore affiché ») ne sont PAS des demandes',
    v.N.N3 === false && v.N.N4 === false && v.N.N5 === false, js(v.N));
  t('B1 P1 « Fais-moi une séance » · P2 « Prépare-moi une séance de 45 minutes » restent des demandes', v.P.P1 === true && v.P.P2 === true, js(v.P));
  t('B2 P3 « Je veux une séance pecs triceps » · P5 « Fais-moi ma séance du jour » · P6 « Je veux démarrer une séance » restent des demandes',
    v.P.P3 === true && v.P.P5 === true && v.P.P6 === true, js(v.P));
  t('B3 ⚠️ P4 « Quelle séance je fais aujourd\'hui ? » : NON détectée, exactement comme avant ce lot (trou préexistant, épinglé)', v.P4 === false, String(v.P4));
  t('C1 variations de plainte (majuscules, sans accents, guillemets, ponctuation, bug, carte, négation) : aucune n\'est une demande',
    v.varNeg.every(x => x[1] === false), js(v.varNeg.filter(x => x[1])));
  t('C2 variations de demande (majuscules, sans accents, courte, « séance du jour », avec un mot « bouton » après un verbe) : toutes restent des demandes',
    v.varPos.every(x => x[1] === true), js(v.varPos.filter(x => !x[1])));
  t('D1 anciennes exclusions intactes (pourquoi · passé · « ne compte pas » · « Pourquoi tu me sors une séance lol »)', v.anciensNon.every(x => x[1] === false), js(v.anciensNon.filter(x => x[1])));
  t('D2 anciennes vraies demandes intactes (« pourquoi pas … » · « pourquoi tu ne me fais pas … » · « donne moi … » · « je fais quoi »)', v.anciensOui.every(x => x[1] === true), js(v.anciensOui.filter(x => !x[1])));
  t('D3 ⚠️ trous connus inchangés (« on fait quoi » · « on s entraîne » sans apostrophe)', v.trous.every(x => x[1] === false), js(v.trous));
  await A.cx.close();

  // ── E · la PLAINTE tapée dans le vrai champ : aucune carte ────────────────────────────────────
  const E = await ouvrir({ reponse: REPONSE_BUG });
  const e = {};
  const NEG = Object.assign({}, N, { N4c: 'Je ne demande pas une séance', H1: 'Pourquoi tu me sors une séance lol' });
  for (const k of ['N1', 'N2', 'N4c', 'N5', 'H1']) { await taper(E, NEG[k]); e[k] = await cartes(E.pg); }
  const nMilo = E.req.filter(a => a === 'coach').length;
  t('E1 ⭐ N1 tapé puis envoyé (champ + bouton réels), Milo répond sans séance : AUCUNE carte « Cette séance te convient ? »', e.N1 && e.N1.n === 0 && nMilo >= 1, js(e.N1) + ' coach=' + nMilo);
  t('E2 ⭐ N2 · « Je ne demande pas une séance » · N5 envoyés à la suite : toujours aucune carte, ni « Oui, on démarre » ni « Non, retravaille »',
    ['N2', 'N4c', 'N5'].every(k => e[k] && e[k].n === 0 && e[k].oui === 0 && e[k].non === 0), js(e));
  t('E2b la phrase terrain « Pourquoi tu me sors une séance lol » (exclusion ancienne) : toujours aucune carte, 5 messages bien partis chez Milo simulé',
    e.H1 && e.H1.n === 0 && nMilo === 5, js(e.H1) + ' coach=' + nMilo);
  t('E3 aucune erreur de page, aucun appel de traduction de séance', E.errs.length === 0 && !E.req.includes('seanceJson'), E.errs.join(' | ').slice(0, 160) + ' ' + js(E.req));
  await E.cx.close();

  // ── E · la relecture du fil au RECHARGEMENT : une plainte ne fait pas renaître la carte ─────────
  const m = Date.now();
  const fil = (u, a) => JSON.stringify([{ role: 'user', content: u, ts: m - 5000 }, { role: 'assistant', content: a, ts: m - 4000 }]);
  const R = await ouvrir({ stock: { ft4_coach_hist: fil(N.N1, REPONSE_BUG), ft4_coach_lastts: String(m - 4000) } });
  const r = await cartes(R.pg);
  const fileLu = await R.pg.evaluate(() => [...document.querySelectorAll('#coach-msgs .msg-coach')].some(x => /bug d'affichage/.test(x.textContent)));
  t('E4 ⭐ fil déposé (N1 + réponse sans séance), app rechargée : le fil est relu et AUCUNE carte ne réapparaît', fileLu && r.n === 0, js(r) + ' filLu=' + fileLu);
  await R.cx.close();

  // ── F · une VRAIE demande tapée : la carte est toujours là ─────────────────────────────────────
  const F = await ouvrir({ reponse: REPONSE_NEUTRE });
  await taper(F, P.P1); const f1 = await cartes(F.pg);
  t('F1 ⭐ « Fais-moi une séance » tapé puis envoyé : la carte « Cette séance te convient ? · Oui, on démarre · Non, retravaille » s\'affiche (1)',
    f1.n === 1 && f1.oui === 1 && f1.non === 1, js(f1));
  await F.cx.close();
  const F2 = await ouvrir({ reponse: REPONSE_NEUTRE });
  await taper(F2, P.P2); const f2 = await cartes(F2.pg);
  t('F2 « Prépare-moi une séance de 45 minutes » tapé puis envoyé : 1 carte', f2.n === 1 && f2.oui === 1, js(f2));
  await F2.cx.close();
  const R2 = await ouvrir({ stock: { ft4_coach_hist: fil(P.P3, REPONSE_NEUTRE), ft4_coach_lastts: String(m - 4000) } });
  const r2 = await cartes(R2.pg);
  t('F3 fil déposé avec une VRAIE demande (P3), app rechargée : la question est reposée (1 carte)', r2.n === 1, js(r2));
  t('F4 aucune erreur de page', F.errs.length + F2.errs.length + R.errs.length + R2.errs.length === 0, [F, F2, R, R2].map(x => x.errs.join('|')).join(' ').slice(0, 160));
  await R2.cx.close();
};
