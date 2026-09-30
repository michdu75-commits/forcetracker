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
   CAS MIXTE (B-CDX · B-CDXI, correction finale du 29/09) : « Tu peux me faire une séance ? le bouton
   bug » était une demande avant FP-01 et n'en était plus une après (démontré à la contre-vérification).
   Règle ①bis (RETIRÉE le 30/09, voir plus bas) : modal adressé à Milo + « me » + infinitif + « une / ma / la … séance », sans texte
   libre entre les deux (une 1ʳᵉ écriture à 40 caractères libres rendait « Tu peux me faire un résumé
   de ma dernière séance ? » demande — G10, H5, X10).
   EXTENSION FINALE (B-CDXII · B-CDXIII, 30/09, nuit) : R1-R4 (« Je veux une séance », « Tu me prépares une
   séance », « Refais-moi une séance », « Tu peux me refaire une séance » + remarque sur le bouton) — des
   RÉGRESSIONS FP-01, jamais des décisions de Michel. Corrigées d'abord une par une… ce qui en laissait d'autres.
   ⭐⭐ ARCHITECTURE FINALE (30/09, décision de Michel — B-CDVIII, B-CDX et B-CDXII RÉÉCRITS, B-CDXIV ajouté) :
   MASTER PRÉSERVÉ PAR DÉFAUT. Les 8 règles de master sont gardées MOT POUR MOT ; FP-01 n'ajoute qu'UNE ligne,
   `if(_seulementMeta(p)) return false;`, vraie seulement si le message contient une STRUCTURE de méta-discussion
   (le bouton / la carte « … séance », un refus explicite, un constat d'affichage, une séance qui « apparaît »)
   ET que tout le reste n'est que du vocabulaire de plainte : un seul mot inconnu, et master décide.
   Plus aucune structure de demande n'est listée. Preuve : `tools/corpus_fp01.js`, différentiel master →
   branche, B = 0 (témoins K du banc). Les attendus qui encodaient l'ancienne stratégie ont été changés, et
   c'est dit à chaque fois : « …un résumé de la séance ? le bouton bug » (G12) et les cas ambigus (I9)
   restent VRAIS comme sur master.

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
  // ⚙️ ARCHITECTURE DU 30/09 (décision de Michel) : master mot pour mot, UNE ligne de veto ajoutée.
  const iVerbe = d.search(/\(fai\[st\]\|donne/), iAmbigu = d.search(/\\bpourquoi\\b\(\?!/), iVeto = d.indexOf('if(_seulementMeta(p)) return false;'), iR2 = d.search(/\(une\|ma\|la\|nouvelle/);
  t('② la ligne de veto `if(_seulementMeta(p)) return false;` est APRÈS la règle à verbe et le niveau « pourquoi », AVANT les règles sans verbe (même étage que « pourquoi »)',
    iVerbe > 0 && iAmbigu > iVerbe && iVeto > iAmbigu && iR2 > iVeto, [iVerbe, iAmbigu, iVeto, iR2].join(' < '));
  const v = corps(co, '_seulementMeta');
  t('③ les structures sont cherchées sur la copie SANS ACCENTS (`p`), et c\'est `p` qu\'on lui passe',
    /function _seulementMeta\(p\)/.test(v) && /reste=p/.test(v) && /_seulementMeta\(p\)/.test(d), v.slice(0, 60));
  t('④ ⛔ un seul endroit décide : toujours 2 appelants (envoi du message · relecture du fil), aucun nouveau',
    (co.match(/_demandeUneSeance\(/g) || []).length === 3, (co.match(/_demandeUneSeance\(/g) || []).length);
};

// Outils communs aux blocs écran B-CDIX et B-CDXI : mêmes frontières simulées, vrai champ, vrai bouton.
function outils(b, PORT) {
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
  return { ouvrir, cartes, taper };
}

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CDIX (session-B). MILO-SEANCE-FP-01 — la carte séance ne répond plus à une plainte (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const { ouvrir, cartes, taper } = outils(b, PORT);

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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-FP-01 — CORRECTION DU CAS MIXTE (29/09/2026, avant publication)
   Démontré à la contre-vérification : le garde de FP-01 rendait FAUSSE une vraie demande mêlée à une
   plainte — « Tu peux me faire une séance ? le bouton bug » (VRAI avant FP-01, FAUX après). Mesuré sur
   toute la famille : « tu peux / peux-tu / pourrais-tu / tu pourrais + me + faire, préparer, proposer,
   donner, créer, construire, monter, écrire, lancer, envoyer, générer … une séance » + bouton / bug /
   affiché. Aucune de ces tournures n'atteignait la règle à verbe (elle ne connaît que l'impératif :
   « fais », « prépare »…), elles vivaient de la règle ② — que le garde neutralise.
   Correctif : une règle de STRUCTURE (demande adressée à Milo : modal + « me » + infinitif), rangée à
   l'étage des règles à verbe, donc AVANT le garde. ⛔ « faire » et « préparer » ne sont PAS ajoutés à
   la liste générale : « Le bouton pour faire une séance bug » doit rester une plainte.
   CONDUIT : le vrai champ et le vrai bouton du Coach (Worker simulé, 0 appel réel).
   NE COUVRE PAS : « le bouton lance une séance » (reste détectée, limite connue), « Quelle séance je
   fais aujourd'hui ? » (trou préexistant), la 1ʳᵉ carte de 13:38.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const MIX_P = {
  PM1: 'Tu peux me faire une séance ? le bouton bug',
  PM2: 'Tu peux me préparer une séance ? le bouton bug',
  PM3: 'Peux-tu me faire une séance même si le bouton bug ?',
  PM4: 'Pourrais-tu me préparer une séance ?' };
const MIX_N = {
  NF: 'Le bouton pour faire une séance bug',
  NP: 'Le bouton pour préparer une séance ne marche plus',
  NJ: 'Je parle juste du bouton pour faire une séance' };
// mesuré le 29/09 : avec une fenêtre de 40 caractères libres entre le verbe et « séance », ces
// phrases devenaient des demandes — ni avant FP-01, ni après. Les deux premières sont tapées (H5).
const COMPLEMENT = [
  'Tu peux me faire un résumé de ma dernière séance ?', 'Tu peux me donner ton avis sur cette séance ?',
  'Tu peux me donner le détail de cette séance ?', 'Tu peux m’écrire le récap de cette séance ?',
  'Pourrais-tu me faire un bilan de cette séance ?', 'Tu peux me faire un plan de séance ?' ];
// ⚠️ 30/09 : « …un résumé de la séance ? le bouton bug » a QUITTÉ la liste ci-dessus. Master le détecte (règle ②,
// « la séance ») : c'est un faux positif PRÉEXISTANT de master, sans structure méta — l'invariant « master préservé
// par défaut » le laisse VRAI (témoin G12). L'attendre faux, c'était exiger une correction hors lot.
const PREEXISTANT = [ 'Tu peux me faire un résumé de la séance ? le bouton bug' ];
const COMME_AVANT = [ 'Tu peux me faire ta séance ?', 'Tu peux me faire ta séance ? le bouton bug' ];

// Les 8 règles de `_demandeUneSeance` telles qu'elles sont sur master (7a71649e, ft-v1243), MOT POUR MOT :
// recopiées une fois de `git show 7a71649e:coach.js` le 30/09/2026. Le témoin ① ci-dessous exige qu'elles
// soient toutes encore là, identiques (depuis la version finale du 30/09, master n'est plus modifié du tout).
const REGLES_MASTER = [
  "if(/\\bai\\s+fait\\b|\\bje\\s+viens\\s+de\\b|\\betait\\b|\\ba\\s+ete\\b|\\bfini[es]?\\b/i.test(p)) return false;",
  "if(/\\b(fai[st]|donne|propose|pr[ée]pare|cr[ée]e|construis|monte|[ée]cris|lance|balance|envoie|g[ée]n[èe]re)\\b[^.?!\\n]{0,40}\\b(s[ée]ance|entra[îi]nement|programme|prog)\\b/i.test(t)) return true;",
  "if(/\\bpourquoi\\b(?!\\s+pas\\b)|\\bne\\s+compte\\s+pas\\b|\\bdebrief/i.test(p)) return false;",
  "if(/\\b(une|ma|la|nouvelle|prochaine|autre|petite|bonne)\\s+s[ée]ance\\b/i.test(t)) return true;",
  "if(/\\bs[ée]ance\\s+(du\\s+jour|d'aujourd|de\\s+ce\\s+soir|de\\s+ce\\s+matin|pour\\s+)/i.test(t)) return true;",
  "if(/\\b(je|on)\\s+fais?\\s+quoi\\b/i.test(t)) return true;",
  "if(/\\bqu'est[- ]ce\\s+que\\s+(je|on)\\s+(fais|fait)\\b/i.test(t)) return true;",
  "if(/\\bon\\s+s'entra[îi]ne\\s+(quoi|comment)\\b/i.test(t)) return true;"
];

module.exports.sourceMixte = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDX (session-B). MILO-SEANCE-FP-01 — master préservé par défaut, un veto étroit et rien d\'autre (source ; réécrit le 30/09) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const d = corps(co, '_demandeUneSeance'), v = corps(co, '_seulementMeta');
  const manquantes = REGLES_MASTER.filter(r => !d.includes(r));
  t('① les 8 règles de master sont là MOT POUR MOT (et lisent toujours `t` / `p` comme sur master) : on n\'a rien réécrit de master',
    d.length > 200 && manquantes.length === 0, manquantes.map(r => r.slice(0, 60)).join(' | '));
  t('② ⛔ aucune règle de « sauvetage » : les seuls `return true` sont les 6 de master', (d.match(/return true/g) || []).length === 6, (d.match(/return true/g) || []).length);
  const faux = d.split('\n').filter(l => /return false/.test(l));
  t('③ ⛔ une seule ligne ajoutée à master, et aucun mot ne suffit à rejeter : 6 `return false` = les 5 de master + `if(_seulementMeta(p)) return false;` ; aucun ne cite bouton / bug / affiché',
    faux.length === 6 && faux.filter(l => l.trim() === 'if(_seulementMeta(p)) return false;').length === 1 && !faux.some(l => /bouton|bug|affich|appar/.test(l)), faux.map(l => l.trim().slice(0, 50)).join(' | '));
  const appels = (co.match(/_seulementMeta\(/g) || []).length;
  t('④ ⛔ le veto ne peut rien AJOUTER : `_seulementMeta` rend un booléen et n\'est appelée qu\'à un seul endroit, dans un `return false`',
    appels === 2 && /return \(reste[^;]*\.every\(/.test(v) && /if\(!vu\) return false;/.test(v), appels);
  const lignesVeto = v.split('\n').filter(l => /new RegExp\(/.test(l));
  t('⑤ ⛔ aucune fenêtre libre dans les structures ([^…], .*, .{n}) ; entre « bouton » et « séance », au plus UN mot, et ce mot a une terminaison de verbe',
    lignesVeto.length === 4 && !lignesVeto.some(l => /\[\^|\.\*|\.\{/.test(l)) && /\[a-z\]\+\(\?:er\|ir\|re\|e\|t\)/.test(lignesVeto.find(l => /bouton/.test(l)) || ''), lignesVeto.length);
};

module.exports.ecranMixte = async function (t, b, PORT) {
  console.log('\n═══ B-CDXI (session-B). MILO-SEANCE-FP-01 — cas mixte : la demande garde sa carte, la plainte n\'en a pas (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const { ouvrir, cartes, taper } = outils(b, PORT);
  const A = await ouvrir();
  const v = await A.pg.evaluate(({ MIX_P, MIX_N, P, N, COMPLEMENT, COMME_AVANT, PREEXISTANT }) => {
    const j = s => _demandeUneSeance(s);
    const map = o => Object.fromEntries(Object.entries(o).map(([k, s]) => [k, j(s)]));
    return { P: map(MIX_P), N: map(MIX_N), simples: map(P), plaintes: map(N),
      famille: [ 'Tu peux me proposer une séance ? le bouton bug', 'Tu peux me donner une séance ? le bouton bug',
                 'Tu peux me créer une séance ? le bouton bug', 'Tu peux me construire une séance ? le bouton bug',
                 'Tu peux me monter une séance ? le bouton bug', 'Tu peux m’écrire une séance ? le bouton bug',
                 'Tu peux me lancer une séance ? le bouton bug', 'Tu peux m’envoyer une séance ? le bouton bug',
                 'Tu peux me générer une séance ? le bouton bug', 'Tu pourrais me faire une séance ? ça affiche un bug',
                 'peux tu me faire une seance le bouton bug', 'TU PEUX ME PRÉPARER UNE SÉANCE ? LE BOUTON BUG' ].map(s => [s, j(s)]),
      plaintesMix: [ 'Tu peux me dire pourquoi le bouton démarrer une séance est apparu ?', 'le bouton pour faire une séance, tu peux le retirer ?',
                     'Tu peux regarder le bug de la carte une séance ?' ].map(s => [s, j(s)]),
      pourquoi: [ ['Pourquoi tu peux me faire une séance et pas un programme ?', j('Pourquoi tu peux me faire une séance et pas un programme ?')],
                  ['pourquoi pourrais-tu me préparer une séance ? le bouton bug', j('pourquoi pourrais-tu me préparer une séance ? le bouton bug')],
                  ['pourquoi tu ne me fais pas une séance jambes ?', j('pourquoi tu ne me fais pas une séance jambes ?')] ],
      limites: [ ['le bouton lance une séance', j('le bouton lance une séance')], ['Quelle séance je fais aujourd’hui ?', j('Quelle séance je fais aujourd’hui ?')] ],
      // la séance n'est PAS le complément du verbe : on demande un résumé, un avis, un détail… d'une séance
      complement: COMPLEMENT.map(s => [s, j(s)]),
      commeAvant: COMME_AVANT.map(s => [s, j(s)]),
      preexistant: PREEXISTANT.map(s => [s, j(s)]) };
  }, { MIX_P, MIX_N, P, N, COMPLEMENT, COMME_AVANT, PREEXISTANT });
  t('G1 ⭐ « Tu peux me faire une séance ? le bouton bug » est une demande', v.P.PM1 === true, js(v.P));
  t('G2 ⭐ « Tu peux me préparer une séance ? le bouton bug » est une demande', v.P.PM2 === true, js(v.P));
  t('G3 « Peux-tu me faire une séance même si le bouton bug ? » · « Pourrais-tu me préparer une séance ? » sont des demandes',
    v.P.PM3 === true && v.P.PM4 === true, js(v.P));
  t('G4 la même tournure avec les autres verbes déjà reconnus (proposer, donner, créer, construire, monter, écrire, lancer, envoyer, générer), « tu pourrais », sans tiret, en majuscules : toutes des demandes',
    v.famille.every(x => x[1] === true), js(v.famille.filter(x => !x[1])));
  t('G5 ⛔ « Le bouton pour faire une séance bug » · « …pour préparer une séance ne marche plus » · « Je parle juste du bouton pour faire une séance » : PAS des demandes',
    v.N.NF === false && v.N.NP === false && v.N.NJ === false, js(v.N));
  t('G6 ⛔ « tu peux » sans demande de séance (« tu peux me dire pourquoi le bouton… », « …tu peux le retirer ? », « tu peux regarder le bug… ») : PAS des demandes',
    v.plaintesMix.every(x => x[1] === false), js(v.plaintesMix.filter(x => x[1])));
  t('G7 non-régression : « Fais-moi une séance » · « Prépare-moi une séance de 45 minutes » · « Fais-moi ma séance du jour » restent des demandes, les 5 plaintes simples restent rejetées',
    v.simples.P1 === true && v.simples.P2 === true && v.simples.P5 === true && Object.values(v.plaintes).every(x => x === false), js({ s: v.simples, p: v.plaintes }));
  t('G9 « pourquoi » garde sa priorité d\'avant FP-01 : « Pourquoi tu peux me faire une séance… » et « pourquoi pourrais-tu me préparer… » restent des QUESTIONS ; « pourquoi tu ne me fais pas une séance jambes ? » reste une demande',
    v.pourquoi[0][1] === false && v.pourquoi[1][1] === false && v.pourquoi[2][1] === true, js(v.pourquoi));
  t('G8 ⚠️ limites inchangées (hors lot) : « le bouton lance une séance » reste détectée, « Quelle séance je fais aujourd\'hui ? » reste non détectée',
    v.limites[0][1] === true && v.limites[1][1] === false, js(v.limites));
  t('G10 ⛔ la séance doit être le COMPLÉMENT du verbe : « Tu peux me faire un résumé de ma dernière séance ? », « …ton avis sur cette séance ? », « …un plan de séance ? », « …un résumé de la séance ? le bouton bug »… ne sont PAS des demandes',
    v.complement.every(x => x[1] === false), js(v.complement.filter(x => x[1])));
  t('G11 ⚠️ rien de plus qu\'avant FP-01 : « Tu peux me faire ta séance ? » (non détectée avant FP-01) reste non détectée, avec ou sans « le bouton bug »',
    v.commeAvant.every(x => x[1] === false), js(v.commeAvant));
  t('G12 ⚠️ master préservé : « Tu peux me faire un résumé de la séance ? le bouton bug » reste VRAI comme sur master (faux positif préexistant de la règle ②, aucune structure méta — hors lot)',
    v.preexistant.every(x => x[1] === true), js(v.preexistant));
  await A.cx.close();
  // ── CONDUIT : tapé dans le vrai champ, envoyé par le vrai bouton ─────────────────────────────
  const H1 = await ouvrir({ reponse: REPONSE_NEUTRE });
  await taper(H1, MIX_P.PM1); const h1 = await cartes(H1.pg);
  t('H1 ⭐ « Tu peux me faire une séance ? le bouton bug » tapé puis envoyé : la carte « Cette séance te convient ? · Oui, on démarre · Non, retravaille » s\'affiche (1)',
    h1.n === 1 && h1.oui === 1 && h1.non === 1, js(h1));
  await H1.cx.close();
  const H2 = await ouvrir({ reponse: REPONSE_NEUTRE });
  await taper(H2, MIX_P.PM2); const h2 = await cartes(H2.pg);
  t('H2 ⭐ « Tu peux me préparer une séance ? le bouton bug » tapé puis envoyé : 1 carte', h2.n === 1 && h2.oui === 1, js(h2));
  await H2.cx.close();
  const H3 = await ouvrir({ reponse: REPONSE_BUG });
  const h3 = {};
  for (const k of ['NF', 'NP', 'NJ']) { await taper(H3, MIX_N[k]); h3[k] = await cartes(H3.pg); }
  const n3 = H3.req.filter(a => a === 'coach').length;
  t('H3 ⭐ « Le bouton pour faire une séance bug » · « …préparer… ne marche plus » · « Je parle juste du bouton… » tapés puis envoyés : AUCUNE carte',
    ['NF', 'NP', 'NJ'].every(k => h3[k] && h3[k].n === 0) && n3 === 3, js(h3) + ' coach=' + n3);
  await H3.cx.close();
  const H5 = await ouvrir({ reponse: REPONSE_NEUTRE });
  const h5 = {};
  for (const k of [0, 1]) { await taper(H5, COMPLEMENT[k]); h5[k] = await cartes(H5.pg); }
  const n5 = H5.req.filter(a => a === 'coach').length;
  t('H5 ⭐ « Tu peux me faire un résumé de ma dernière séance ? » · « Tu peux me donner ton avis sur cette séance ? » tapés puis envoyés : AUCUNE carte',
    [0, 1].every(k => h5[k] && h5[k].n === 0) && n5 === 2, js(h5) + ' coach=' + n5);
  t('H4 aucune erreur de page', H1.errs.length + H2.errs.length + H3.errs.length + H5.errs.length === 0, [H1, H2, H3, H5].map(x => x.errs.join('|')).join(' ').slice(0, 160));
  await H5.cx.close();
};

// ── EXTENSION FINALE (30/09) : les autres demandes explicites, R1-R4 de la contre-vérification ──
const EXT_P = {
  R1: 'Je veux une séance, mais le bouton bug',
  R2: 'Tu me prépares une séance ? le bouton bug',
  R3: 'Refais-moi une séance, le bouton bug',
  R4: 'Tu peux me refaire une séance ? le bouton bug' };
// plaintes et récits qui portent les MÊMES mots : aucune n'est une demande (mesuré le 30/09)
const EXT_N = {
  N3: 'Le bouton pour refaire une séance bug',
  RT: 'Le bouton refait une séance tout seul',
  VP: 'Je veux pas une séance, le bouton bug' };
// ⚠️ 30/09 : CAS AMBIGUS (récit / plainte hypothétique). Attendus FAUX la veille ; ils ne sont PAS une structure
// méta démontrée — l'invariant « master préservé par défaut » les laisse VRAIS, comme sur master (témoin I7).
const EXT_Q = {
  QV: 'Quand je veux une séance le bouton bug',
  CF: 'Chaque fois que tu me prépares une séance le bouton bug',
  QP: 'Quand je veux que tu me prépares une séance, le bouton bug',
  SI: 'Si je veux que tu me prépares une séance, ça affiche un bug',
  JR: 'Je refais une séance et le bouton bug' };

module.exports.sourceExt = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CDXII (session-B). MILO-SEANCE-FP-01 — le veto ne s\'applique qu\'à un message QUI N\'EST QUE méta-discussion (source ; réécrit le 30/09) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const co = nu('coach.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const v = corps(co, '_seulementMeta');
  const mMeta = /new Set\(\(([\s\S]*?)\)\.split\(' '\)\)/.exec(v);
  const mots = mMeta ? mMeta[1].replace(/['+\s]+/g, ' ').trim().split(' ') : [];
  t('⑥ le veto exige que TOUT le reste du message soit du vocabulaire de plainte / méta (`every`) : un seul mot inconnu (« stp », « une », « jambes », un verbe) et master décide',
    mots.length > 50 && /\.every\(m=>META\.has\(m\)\)/.test(v), mots.length);
  const INTERDITS = ['une', 'ma', 'mes', 'stp', 'svp', 'please', 'seance', 'fais', 'faire', 'refais', 'refaire', 'prepare', 'prepares', 'preparer', 'propose', 'donne',
    'veux', 'voudrais', 'aimerais', 'faut', 'besoin', 'moi', 'relance', 'relancer', 'lance', 'lancer', 'demarre', 'demarrer', 'jambes', 'meme', 'nouvelle', 'petite', 'go'];
  const fautifs = INTERDITS.filter(x => mots.includes(x));
  t('⑦ ⛔ ce vocabulaire ne contient AUCUN mot qui sert à demander (verbes de demande ou de désir, « une », « ma », « stp », « séance », « moi »…) : sinon une demande pourrait passer pour de la méta',
    mots.length > 50 && fautifs.length === 0, fautifs.join(' '));
  const V = v.split('\n').filter(l => /new RegExp\(/.test(l));
  const V2 = V.find(l => /demande\|veux/.test(l)) || '', V3 = V.find(l => /affiche\(\?:e/.test(l)) || '';   // repérées par ce qu'elles disent, pas par leur rang
  t('⑧ le REFUS (V2) porte sur une séance COMPLÉMENT du refus (« je ne demande pas une séance ») : « séance » vient juste après le refus, rien entre les deux',
    /\(\?:\(\?:demande\|veux/.test(V2) && /seance\\\\b/.test(V2) && !/\[\^|\.\*/.test(V2), V2.trim().slice(0, 100));
  t('⑨ le CONSTAT d\'affichage (V3) ne prend pas « tu m\'affiches une séance ? » (même forme que « tu me prépares », une demande possible) : « tu » n\'est pas un sujet de V3',
    /\(\?:ca\|cela\|il\|elle/.test(V3) && !/\|tu\|/.test(V3), V3.trim().slice(0, 100));
  let outil = ''; try { outil = fs.readFileSync(path.join(ROOT, 'tools', 'corpus_fp01.js'), 'utf8'); } catch (e) {}
  t('⑩ l\'outil différentiel existe : il extrait `_demandeUneSeance` de master par git, classe MASTER VRAI → FINAL FAUX en A (méta, étiquette de construction) / B (tout le reste), et s\'éprouve lui-même (--auto-test)',
    /git show/.test(outil) && /c\.lab === 'M' \? r\.A : r\.B/.test(outil) && /--auto-test/.test(outil) && /OUTIL AVEUGLE/.test(outil), outil.length);
};

module.exports.ecranExt = async function (t, b, PORT) {
  console.log('\n═══ B-CDXIII (session-B). MILO-SEANCE-FP-01 — extension finale : les demandes explicites gardent leur carte, les plaintes n\'en ont pas (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const { ouvrir, cartes, taper } = outils(b, PORT);
  const A = await ouvrir();
  const v = await A.pg.evaluate(({ EXT_P, EXT_N, EXT_Q, MIX_P, MIX_N, P, COMPLEMENT, N }) => {
    const map = o => Object.fromEntries(Object.entries(o).map(([k, s]) => [k, _demandeUneSeance(s)]));
    return { P: map(EXT_P), N: map(EXT_N), Q: map(EXT_Q), mix: map(MIX_P), mixN: map(MIX_N), simples: map(P), plaintes: map(N),
      resume: _demandeUneSeance(COMPLEMENT[0]) };
  }, { EXT_P, EXT_N, EXT_Q, MIX_P, MIX_N, P, COMPLEMENT, N });
  t('I1 ⭐ R1 « Je veux une séance, mais le bouton bug » est une demande', v.P.R1 === true, js(v.P));
  t('I2 ⭐ R2 « Tu me prépares une séance ? le bouton bug » est une demande', v.P.R2 === true, js(v.P));
  t('I3 ⭐ R3 « Refais-moi une séance, le bouton bug » est une demande', v.P.R3 === true, js(v.P));
  t('I4 ⭐ R4 « Tu peux me refaire une séance ? le bouton bug » est une demande', v.P.R4 === true, js(v.P));
  t('I5 positifs historiques préservés : « Fais-moi une séance », « Prépare-moi une séance de 45 minutes », « Fais-moi ma séance du jour », « Tu peux me faire / préparer une séance ? le bouton bug »',
    v.simples.P1 && v.simples.P2 && v.simples.P5 && v.mix.PM1 && v.mix.PM2, js({ s: v.simples, m: v.mix }));
  t('I6 ⛔ « Le bouton pour refaire une séance bug » n\'est PAS une demande', v.N.N3 === false, js(v.N));
  t('I7 ⛔ veto sur des structures démontrées : « Le bouton refait une séance tout seul » (le bouton + verbe + séance) et « Je veux pas une séance, le bouton bug » (refus) ne sont PAS des demandes',
    v.N.RT === false && v.N.VP === false, js(v.N));
  t('I9 ⚠️ cas AMBIGUS, master conservé (30/09) : « Quand je veux une séance… », « Chaque fois que tu me prépares… », « Si je veux que tu me prépares… », « Je refais une séance et… » restent VRAIS comme sur master — ce ne sont pas des structures méta démontrées',
    Object.values(v.Q).every(x => x === true), js(v.Q));
  t('I8 non-régression des négatifs : « bouton pour faire / préparer », « Je parle juste du bouton… », N1-N5, « résumé de ma dernière séance » : PAS des demandes',
    Object.values(v.mixN).every(x => x === false) && Object.values(v.plaintes).every(x => x === false) && v.resume === false, js({ m: v.mixN, p: v.plaintes, r: v.resume }));
  await A.cx.close();
  // une conversation neuve par phrase : un compte cumulé laisserait passer une phrase sans carte
  const j1 = {}, errs1 = [];
  for (const k of ['R1', 'R3']) {
    const J1 = await ouvrir({ reponse: REPONSE_NEUTRE });
    await taper(J1, EXT_P[k]); j1[k] = await cartes(J1.pg); errs1.push(...J1.errs);
    await J1.cx.close();
  }
  t('J1 ⭐ R1, puis R3 (chacun dans sa conversation), tapés et envoyés (vrai champ, vrai bouton) : la carte « Cette séance te convient ? · Oui, on démarre · Non, retravaille » s\'affiche (1)',
    ['R1', 'R3'].every(k => j1[k] && j1[k].n === 1 && j1[k].oui === 1 && j1[k].non === 1), js(j1));
  const J2 = await ouvrir({ reponse: REPONSE_BUG });
  const j2 = {};
  for (const k of ['N3', 'RT']) { await taper(J2, EXT_N[k]); j2[k] = await cartes(J2.pg); }
  const n2 = J2.req.filter(a => a === 'coach').length;
  t('J2 ⭐ « Le bouton pour refaire une séance bug » puis « Le bouton refait une séance tout seul » tapés et envoyés : AUCUNE carte',
    ['N3', 'RT'].every(k => j2[k] && j2[k].n === 0) && n2 === 2, js(j2) + ' coach=' + n2);
  t('J3 aucune erreur de page', errs1.length + J2.errs.length === 0, [errs1.join('|'), J2.errs.join('|')].join(' ').slice(0, 160));
  await J2.cx.close();
};

// ── ARCHITECTURE DU 30/09 (décision de Michel) : master préservé par défaut, veto étroit sur la méta ──
// §5 de la demande : des demandes que master reconnaissait, suivies d'une remarque sur le bouton → VRAI
const ARCHI_P = [
  'Je veux une séance, mais le bouton bug', 'Tu me prépares une séance ? le bouton bug', 'Refais-moi une séance, le bouton bug',
  'Tu peux me refaire une séance ? le bouton bug', 'Tu peux me faire une séance ? le bouton bug', 'Tu peux me préparer une séance ? le bouton bug',
  'Je veux démarrer une séance, le bouton bug', 'Je veux faire une séance, le bouton bug', 'Je voudrais une séance, le bouton bug',
  'J’aimerais une séance, le bouton bug', 'Il me faut une séance, le bouton bug', 'Une séance jambes stp, le bouton bug', 'Nouvelle séance stp, le bouton bug' ];
// §4 de la demande : des méta-discussions → FAUX
const ARCHI_N = [
  'Ya le bouton démarrer une séance qui est arrivé', 'Non ya le bouton démarrer une séance', 'Le bouton pour faire une séance bug',
  'Le bouton pour préparer une séance ne marche plus', 'Le bouton pour refaire une séance bug', 'Je parle juste du bouton pour faire une séance',
  'Je ne demande pas une séance' ];
// une demande ET une structure méta dans le même message : la structure est neutralisée, la demande reste lue
const ARCHI_MIXTE = [
  'Le bouton démarrer une séance bug. Une séance jambes stp', 'Je voudrais une séance, le bouton démarrer une séance bug',
  'Le bouton pour faire une séance bug, tu peux m’en préparer une ?', 'Le bouton bug, je voudrais une séance', 'la carte bug une séance stp',
  'Le bouton démarrer une séance bug, une autre stp', 'Ya le bouton démarrer une séance qui est arrivé, la même stp', 'Le bouton pour faire une séance ne marche plus, relance-la' ];

module.exports.ecranArchi = async function (t, b, PORT) {
  console.log('\n═══ B-CDXIV (session-B). MILO-SEANCE-FP-01 — master préservé par défaut, veto étroit : demandes gardées, méta rejetée (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 260);
  const { ouvrir, cartes, taper } = outils(b, PORT);
  const A = await ouvrir();
  const v = await A.pg.evaluate(({ ARCHI_P, ARCHI_N, ARCHI_MIXTE }) => {
    const m = l => l.map(s => [s, _demandeUneSeance(s)]);
    return { P: m(ARCHI_P), N: m(ARCHI_N), X: m(ARCHI_MIXTE) };
  }, { ARCHI_P, ARCHI_N, ARCHI_MIXTE });
  t('L1 ⭐ les 13 demandes historiques suivies d\'une remarque sur le bouton restent des demandes (« Je voudrais… », « J’aimerais… », « Il me faut… », « Une séance jambes stp… », « Nouvelle séance stp… »…)',
    v.P.every(x => x[1] === true), js(v.P.filter(x => !x[1])));
  t('L2 ⛔ les 7 méta-discussions de la demande ne sont PAS des demandes (le bouton « démarrer une séance », « le bouton pour faire / préparer / refaire… », « je parle du bouton… », « je ne demande pas… »)',
    v.N.every(x => x[1] === false), js(v.N.filter(x => x[1])));
  t('L3 ⭐ une demande et une structure méta dans le même message : la demande l\'emporte (structure neutralisée, pas le message ; demande par pronom « tu peux m’en préparer une ? » ou par ellipse « une autre stp », « la même stp », « relance-la » ; « bug » n\'est jamais pris pour le libellé d\'un bouton)',
    v.X.every(x => x[1] === true), js(v.X.filter(x => !x[1])));
  await A.cx.close();
  const o1 = {}, errs = [];
  for (const s of ['J’aimerais une séance, le bouton bug', 'Il me faut une séance, mais le bouton bug', 'Une séance jambes stp, le bouton bug']) {
    const O = await ouvrir({ reponse: REPONSE_NEUTRE });
    await taper(O, s); o1[s] = await cartes(O.pg); errs.push(...O.errs);
    await O.cx.close();
  }
  t('O1 ⭐ « J’aimerais une séance, le bouton bug » · « Il me faut une séance, mais le bouton bug » · « Une séance jambes stp, le bouton bug » tapés et envoyés, chacun dans sa conversation : 1 carte « Cette séance te convient ? · Oui, on démarre · Non, retravaille »',
    Object.values(o1).length === 3 && Object.values(o1).every(c => c.n === 1 && c.oui === 1 && c.non === 1), js(o1));
  const O2 = await ouvrir({ reponse: REPONSE_BUG });
  const o2 = [];
  for (const s of ['Le bouton pour faire une séance bug', 'Je parle juste du bouton pour faire une séance', 'Ya le bouton démarrer une séance qui est arrivé']) { await taper(O2, s); o2.push((await cartes(O2.pg)).n); }
  const n2 = O2.req.filter(a => a === 'coach').length;
  t('O2 ⭐ « Le bouton pour faire une séance bug » · « Je parle juste du bouton pour faire une séance » · « Ya le bouton démarrer une séance qui est arrivé » tapés et envoyés : AUCUNE carte (3 messages bien partis)',
    o2.length === 3 && o2.every(n => n === 0) && n2 === 3, js(o2) + ' coach=' + n2);
  t('O3 aucune erreur de page', errs.length + O2.errs.length === 0, [errs.join('|'), O2.errs.join('|')].join(' ').slice(0, 160));
  await O2.cx.close();
};
