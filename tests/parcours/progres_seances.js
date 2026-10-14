/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🗂️ PROGRES-SEANCES-01 — PROGRÈS → SÉANCES / UX-HIST, LOT STRUCTUREL 01 (session-B · 14/10/2026, mission de Michel)

   Contrat (décisions de Michel du 14/10 + contrat UX-HIST du 08/10, §12 de l'addendum d'architecture) :
   · Progrès = SÉANCES | EXERCICES | CORPS & SANTÉ, Séances en premier ; Badges reste un onglet tant que sa
     destination n'est pas décidée (aucune relocalisation) ;
   · Séances porte « Ce que ton histoire montre », « Ce que tu travailles, par semaine », l'historique,
     l'export, le filtre, la liste et le débrief ; Exercices garde chips, recherche, graphique, objectif ;
   · historique Année → Mois → Séance : années repliées sauf l'année en cours, un mois se déplie à la
     demande, plus de plafond de 20 ;
   · Accueil « Séances ce mois » → Séances, mois en cours ; calendrier → Séances, sur LA séance (par sa clé
     `ts||id`, la même que la carte et `openSessDetail`), plusieurs séances ce jour-là → celles du jour ;
   · volume : 14 jours | 28 jours, 28 par défaut, moyenne = total / 2 ou / 4 ; ⛔ Milo garde 14 jours ;
   · le sous-onglet choisi survit (contrat UX-HIST) ; ⛔ consulter Progrès ne modifie jamais S.sessions.

   Blocs : B-PS01-S (source) · B-PS01-E (écran conduit).
   Ce que les témoins CONDUISENT : la barre du bas, les onglets de Progrès, les en-têtes Année / Mois,
   la tuile « Séances ce mois », le calendrier (jour, « Revoir la séance », vue semaine), le choix
   14 | 28 jours, une carte (détail), « 💬 Voir le débrief Milo ».
   Frontières SIMULÉES : Worker IA (compté, jamais réel), Apps Script, Supabase. ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : la visibilité réelle (offsetParent) et le parent DOM de chaque bloc, les en-têtes
   et les cartes de l'historique, le texte de la carte volume, le texte que Milo reçoit
   (`_ctxVolumeMuscles`), `ft4_sessions` et la liste des clés du stockage, les requêtes `coach`.
   Ce qu'ils NE COUVRENT PAS : Safari iOS, le rendu visuel fin (captures), la séparation lecture /
   modification du détail (non décidée), la destination finale de Badges (non décidée).
   Banc : tools/banc_progres_seances.js · contrôle négatif : tools/mut_progres_seances.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const { jourParis } = require('../_jour.js');

const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); const k = src.indexOf('\nasync function ', i + 10);
  const l = src.indexOf('\nconst ', i + 10), m = src.indexOf('\nlet ', i + 10), n = src.indexOf('\n(function', i + 10), o = src.indexOf('\n/*', i + 10);
  const fin = [j, k, l, m, n, o].filter(x => x > 0); return src.slice(i, fin.length ? Math.min(...fin) : undefined); };

/* ── LA FIXTURE : 32 séances sur ~14 mois, deux années, deux séances le même jour (aujourd'hui) ──
   Volume CONNU d'avance (calculé ici, jamais par l'app) :
   · fenêtre 14 j : DC 4 + 4 séries (J0, J-1) = 8 → 4 / semaine ; Squat 3 (J0) → 1,5 / semaine ;
   · fenêtre 28 j : + DC 2 + 2 (J-16, J-22) = 12 → 3 / semaine ; + Squat 5 (J-22) = 8 → 2 / semaine.
   Les séances plus anciennes (J-35 → J-425) sont hors des deux fenêtres. Celle de J-305 a un débrief rangé. */
const serie = (kg, reps, n, type) => Array.from({ length: n }, () => ({ kg, reps, type: type || 'N', done: true, rm1: 0 }));
function fixture() {
  const out = [];
  const seance = (off, min, exs) => { const date = jourParis(off); const ts = Date.parse(date + 'T08:00:00Z') + min * 60e3;
    const volume = exs.reduce((a, e) => a + e.sets.reduce((b, s) => b + (s.type === 'É' ? 0 : s.kg * s.reps), 0), 0);
    out.push({ date, ts, id: ts + 3600e3, volume, duration: 3000, exs }); };
  seance(0, 120, [{ name: 'Squat à la Barre', sets: serie(100, 5, 3).concat(serie(60, 5, 1, 'É')) }]);
  seance(0, 0, [{ name: 'Développé Couché', sets: serie(80, 8, 4) }]);
  seance(-1, 0, [{ name: 'Développé Couché', sets: serie(80, 8, 4) }]);
  seance(-16, 0, [{ name: 'Développé Couché', sets: serie(75, 8, 2) }]);
  seance(-22, 0, [{ name: 'Développé Couché', sets: serie(75, 8, 2) }, { name: 'Squat à la Barre', sets: serie(95, 5, 5) }]);
  for (let k = 0; k < 27; k++) {
    const off = -35 - 15 * k;
    /* ⚠️ La PLUS VIEILLE séance de DC (k = 26) est volontairement plus légère que le record (k = 24) : sinon
       « dernière − première » et « dernière − record » donnent le même chiffre et PS-E07 ne verrait pas la
       différence (trouvé par la mutation M24, qui passait au travers). */
    seance(off, 0, k % 2 ? [{ name: 'Squat à la Barre', sets: serie(90 + k, 5, 3) }] : [{ name: 'Développé Couché', sets: serie(k === 26 ? 60 : 70 + k, 8, 3) }]);
  }
  out.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : (b.ts || 0) - (a.ts || 0)));
  return out;
}
const cleDe = s => s.ts || s.id || 0;                  // la clé de la carte et de openSessDetail
const OFF_DBF = -305;                                   // la séance au débrief rangé (année précédente)
const TXT_DBF = 'DEBRIEF-PS01 rangé pour une vieille séance.';

module.exports.fixture = fixture;

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-PS01-S (session-B). PROGRÈS → SÉANCES — source ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const se = nu('setup.js'), lo = nu('log.js'), co = nu('coach.js'), sc = nu('screens.js');
  const rs = corps(se, 'renderSessions'), vpm = corps(lo, '_volumeParMuscle'), ctx = corps(co, '_ctxVolumeMuscles');
  const gsh = corps(se, 'goSessionsHistory'), cal = corps(sc, '_renderHomeCalendar') + corps(sc, '_calDayPanel');
  t('PS-S1 les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', rs && vpm && ctx && gsh && cal, [rs, vpm, ctx, gsh, cal].map(x => x.length).join('/'));
  t('PS-S2 ⛔ l\'historique n\'a plus de plafond : `renderSessions` ne coupe plus la liste des séances (ni `slice(0,20)`, ni autre coupe)',
    !/(flist|S\.sessions|liste)\s*\.slice\(/.test(rs) && !/\.slice\(\s*0\s*,\s*20\s*\)/.test(rs), (rs.match(/\w+\.slice\([^)]*\)/g) || []).join(' '));
  t('PS-S3 ⛔ UN seul producteur de carte d\'historique (`class="sess-card…`) dans setup.js — pas de 2ᵉ moteur',
    (se.match(/class="sess-card(?![\w-])/g) || []).length === 1, (se.match(/class="sess-card(?![\w-])/g) || []).length + ' producteur(s)');
  t('PS-S4 la fenêtre du volume reste UN seul propriétaire : `VOL_FENETRE_JOURS = 14` et `_volumeParMuscle` reçoit la période',
    /const VOL_FENETRE_JOURS\s*=\s*14\s*;/.test(lo) && /function _volumeParMuscle\(\s*refTs\s*,\s*\w+\s*\)/.test(lo), vpm.slice(0, 120));
  t('PS-S5 ⛔ Milo ne reçoit PAS la période de l\'écran : `_ctxVolumeMuscles` appelle `_volumeParMuscle()` sans période',
    /_volumeParMuscle\(\s*\)/.test(ctx) && !/_volumeParMuscle\([^)]+\)/.test(ctx), (ctx.match(/_volumeParMuscle\([^)]*\)/g) || []).join(' '));
  const ecritures = [rs, gsh, corps(se, 'switchProgTab'), corps(se, 'basculerSessAnnee'), corps(se, 'basculerSessMois'), corps(se, 'choisirVolumeJours')].join('\n');
  t('PS-S6 ⛔ aucune nouvelle clé persistée pour l\'historique, le mois ouvert, l\'onglet ou la période (aucun `localStorage.setItem`)',
    !/localStorage\.setItem/.test(ecritures), (ecritures.match(/localStorage\.setItem\([^,]*/g) || []).join(' '));
  t('PS-S7 le calendrier vise la séance par sa clé : plus aucun `goSessionsHistory()` NU dans le calendrier',
    !/goSessionsHistory\(\)/.test(cal) && /goSessionsHistory\(/.test(cal), (cal.match(/goSessionsHistory\([^)]{0,40}/g) || []).join(' | '));
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-PS01-E (session-B). PROGRÈS → SÉANCES — écran conduit, Worker simulé ═══');
  const FIX = fixture();
  const sDbf = FIX.find(s => s.date === jourParis(OFF_DBF));
  const DBF = { v: 1, seances: { [String(sDbf.id)]: { texte: TXT_DBF, ts: 1, src: 'test' } } };
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_ok: '1', ft4_stmig1: '1', ft4_wn_seen: '999' };

  const ouvrir = async (o) => {
    o = o || {};
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const st = { coach: 0, reels: 0 };
    await cx.route(/supabase\.co/, r => r.abort());
    await cx.route(/anthropic\.com/, r => { st.reels++; return r.abort(); });
    await cx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json',
      body: /test=1/.test(r.request().url()) ? '{"status":"online","version":"3.5"}' : '{"status":"not_found"}' }));
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      if (c.action === 'coach') st.coach++;
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","reply":"x"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(o.sessions || FIX), ft4_prs: '{}', ft4_debriefs: JSON.stringify(DBF) }, o.stock || {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_ps'))return; sessionStorage.setItem('_ps','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    return { cx, pg, st, errs };
  };
  const clic = async (pg, sel, garder) => {
    for (let k = 0; k < 8; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), garder || 'ov-sess-detail|ov-debrief-milo');
      const h = (await pg.evaluateHandle(s => [...document.querySelectorAll(s)].find(x => x.offsetParent !== null) || null, sel)).asElement();
      if (!h) { await pg.waitForTimeout(150); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); await pg.waitForTimeout(200); return true; } catch (e) { await pg.waitForTimeout(150); }
    }
    return false;
  };
  const visible = (pg, id) => pg.evaluate(i => { const e = document.getElementById(i); return !!(e && e.offsetParent !== null); }, id);
  const dans = (pg, id, pid) => pg.evaluate(([i, p]) => { const e = document.getElementById(i); return !!(e && e.closest('#' + p)); }, [id, pid]);
  const ongletActif = pg => pg.evaluate(() => { const a = document.querySelector('#s-progress .nu-tabs .nu-tab.active'); return a ? a.id : null; });
  const versProgres = async X => { await clic(X.pg, '#nb-progress'); await X.pg.waitForTimeout(450); };
  const onglet = async (X, id) => { await clic(X.pg, '#' + id); await X.pg.waitForTimeout(250); };
  /* Ouvre TOUTES les années puis tous les mois (par de vrais taps sur les en-têtes repliés). */
  const toutDeplier = async X => {
    for (let k = 0; k < 6; k++) { const n = await X.pg.evaluate(() => document.querySelectorAll('#sess-list .sess-an[aria-expanded="false"]').length); if (!n) break;
      await clic(X.pg, '#sess-list .sess-an[aria-expanded="false"]'); }
    for (let k = 0; k < 40; k++) { const n = await X.pg.evaluate(() => document.querySelectorAll('#sess-list .sess-mois[aria-expanded="false"]').length); if (!n) break;
      await clic(X.pg, '#sess-list .sess-mois[aria-expanded="false"]'); }
  };
  const cartes = pg => pg.evaluate(() => [...document.querySelectorAll('#sess-list .sess-card')].map(c => {
    const m = /openSessDetail\(([^)]*)\)/.exec(c.getAttribute('onclick') || ''); const bloc = c.closest('[data-mois]');
    return { cle: m ? Number(m[1]) : null, mois: bloc ? bloc.getAttribute('data-mois') : null, vis: c.offsetParent !== null, cible: c.classList.contains('sess-cible'),
      dbf: [...c.querySelectorAll('.sess-dbf-btn,.sess-dbf-go')].map(x => x.textContent.trim()) }; }));
  const MOIS_AUJ = jourParis(0).slice(0, 7), AN_AUJ = jourParis(0).slice(0, 4);
  const CLES = FIX.map(cleDe);

  let X = await ouvrir();
  const avant = await X.pg.evaluate(() => ({ sess: localStorage.getItem('ft4_sessions'), cles: Object.keys(localStorage).sort() }));

  /* ── 1. L'onglet Séances existe, en premier, et c'est lui qui s'ouvre ─────────────────────── */
  await versProgres(X);
  const tabs = await X.pg.evaluate(() => [...document.querySelectorAll('#s-progress .nu-tabs .nu-tab')].map(b => ({ id: b.id, txt: b.textContent.trim() })));
  t('PS-E01 Progrès porte Séances | Exercices | Corps & santé dans cet ordre (Badges reste un onglet, à la fin)',
    tabs.map(x => x.id).join(',') === 'ptab-seances,ptab-exo,ptab-poids,ptab-badges' && tabs[0].txt === 'Séances' && tabs[1].txt === 'Exercices' && tabs[2].txt === 'Corps & santé', JSON.stringify(tabs));
  t('PS-E02 sans cible, Progrès s\'ouvre sur Séances (premier onglet) et le panneau Exercices est masqué',
    (await ongletActif(X.pg)) === 'ptab-seances' && await visible(X.pg, 'prog-seances') && !(await visible(X.pg, 'prog-exo')), await ongletActif(X.pg));

  /* ── 2. Les blocs GLOBAUX vivent dans Séances, plus dans Exercices (invariant 1) ──────────── */
  const GLOBAUX = ['prog-synth-acc', 'prog-volume-acc', 'sess-hist-title', 'histo-exp-btn', 'sess-filter', 'sess-list'];
  const ouSont = await Promise.all(GLOBAUX.map(id => dans(X.pg, id, 'prog-seances')));
  t('PS-E03 synthèse, volume, titre de l\'historique, export, filtre et liste sont DANS le panneau Séances',
    ouSont.every(Boolean), GLOBAUX.map((id, i) => id + ':' + ouSont[i]).join(' '));
  const visSeances = await Promise.all(['prog-synth-acc', 'prog-volume-acc', 'sess-hist-title', 'histo-exp-btn', 'sess-list'].map(id => visible(X.pg, id)));
  t('PS-E04 ils sont visibles sur l\'onglet Séances', visSeances.every(Boolean), visSeances.join(','));
  await onglet(X, 'ptab-exo');
  const visExo = await Promise.all(GLOBAUX.map(id => visible(X.pg, id)));
  const exoGarde = await Promise.all(['big4-chips', 'prog-search', 'chart-box'].map(id => visible(X.pg, id)));
  const exoDans = await Promise.all(['big4-chips', 'prog-search', 'chart-box', 'prog-cycle-banner'].map(id => dans(X.pg, id, 'prog-exo')));
  t('PS-E05 ⛔ sur Exercices, AUCUN bloc global n\'est visible', visExo.every(v => !v), GLOBAUX.map((id, i) => id + ':' + visExo[i]).join(' '));
  t('PS-E06 Exercices garde chips, recherche, graphique (et le bandeau de cycle, statu quo) — dans son panneau, visibles',
    exoGarde.every(Boolean) && exoDans.every(Boolean), exoGarde.join(',') + ' / ' + exoDans.join(','));

  /* ── 3. L'analyse par exercice est INCHANGÉE (invariant 2) ─────────────────────────────────── */
  const ana = await X.pg.evaluate(() => { try { selectProgEx('Développé Couché'); } catch (e) {} const box = document.getElementById('chart-box');
    return { txt: (box && box.textContent || '').replace(/\s+/g, ' ').trim(), svg: box ? box.querySelectorAll('svg').length : 0,
      chips: [...document.querySelectorAll('#big4-chips [id^="pchip-"]')].map(c => c.textContent.trim()) }; });
  /* ⚠️ Les chiffres épinglés sont ceux de master a0eab5b3 sur cette fixture : ce lot ne doit PAS les changer.
     Un futur lot statistique (HP-02, HP-03…) qui les change mettra ce témoin à jour, avec sa raison. */
  t('PS-E07 le graphique d\'un exercice est dessiné (courbe + 1RM) et ses chiffres sont ceux d\'avant le lot',
    ana.svg > 0 && /99\.3 kg 1RM Actuel/.test(ana.txt) && /116\.7 kg Record/.test(ana.txt) && /\+24\.8 kg Progrès \+33%/.test(ana.txt), ana.txt.slice(0, 220) + ' | svg=' + ana.svg);
  t('PS-E08 les 4 raccourcis d\'exercice sont toujours là', ana.chips.length === 4, JSON.stringify(ana.chips));

  /* ── 4. Année → Mois → Séance (invariant 5) ────────────────────────────────────────────────── */
  await onglet(X, 'ptab-seances');
  const tete = await X.pg.evaluate(() => ({
    ans: [...document.querySelectorAll('#sess-list .sess-an')].map(a => ({ an: a.getAttribute('data-an'), ouvert: a.getAttribute('aria-expanded') })),
    mois: [...document.querySelectorAll('#sess-list .sess-mois')].map(m => ({ mois: m.getAttribute('data-mois'), ouvert: m.getAttribute('aria-expanded') })),
    nCartes: document.querySelectorAll('#sess-list .sess-card').length }));
  const ansAttendus = [...new Set(FIX.map(s => s.date.slice(0, 4)))].sort().reverse();
  t('PS-E09 l\'historique est rangé par ANNÉE, la plus récente d\'abord ; seule l\'année en cours est dépliée',
    tete.ans.map(a => a.an).join(',') === ansAttendus.join(',') && tete.ans.every(a => a.ouvert === (a.an === AN_AUJ ? 'true' : 'false')), JSON.stringify(tete.ans));
  const moisAnAuj = [...new Set(FIX.filter(s => s.date.slice(0, 4) === AN_AUJ).map(s => s.date.slice(0, 7)))].sort().reverse();
  t('PS-E10 dans l\'année en cours : un en-tête par MOIS (le plus récent d\'abord), tous repliés — aucune carte avant un tap (contrat UX-HIST)',
    tete.mois.map(m => m.mois).join(',') === moisAnAuj.join(',') && tete.mois.every(m => m.ouvert === 'false') && tete.nCartes === 0, JSON.stringify(tete));
  await toutDeplier(X);
  const tout = await cartes(X.pg);
  const clesVues = tout.map(c => c.cle);
  t('PS-E11 tout déplié : CHAQUE séance a sa carte, une seule fois (32 / 32, aucune perdue, aucun doublon)',
    tout.length === FIX.length && new Set(clesVues).size === clesVues.length && CLES.every(k => clesVues.includes(k)), tout.length + ' cartes / ' + FIX.length);
  const malRangees = tout.filter(c => { const s = FIX.find(x => cleDe(x) === c.cle); return !s || s.date.slice(0, 7) !== c.mois; });
  t('PS-E12 chaque carte est sous le mois de SA date', !malRangees.length, JSON.stringify(malRangees.slice(0, 3)));

  /* ── 5. Une séance plus ancienne que les 20 dernières reste atteignable (invariant 4) ───────── */
  const plusVieille = FIX[FIX.length - 1];
  const okVieille = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(' + cleDe(plusVieille) + ')"] .sess-title', 'ov-sess-detail');
  const det = await X.pg.evaluate(() => ({ ouvert: !!document.querySelector('#ov-sess-detail.open'), id: typeof _sessId !== 'undefined' ? _sessId : null }));
  t('PS-E13 la plus vieille séance (32ᵉ, ' + plusVieille.date + ') s\'ouvre en détail par sa carte',
    okVieille && det.ouvert && det.id === cleDe(plusVieille), JSON.stringify(det));
  const posAvant = await X.pg.evaluate(k => { const c = document.querySelector('#sess-list .sess-card[onclick="openSessDetail(' + k + ')"]'); return c ? Math.round(c.getBoundingClientRect().top) : null; }, cleDe(plusVieille));
  await X.pg.evaluate(() => { try { closeSessDetail(); } catch (e) {} document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); });
  await X.pg.waitForTimeout(200);
  const posApres = await X.pg.evaluate(k => { const c = document.querySelector('#sess-list .sess-card[onclick="openSessDetail(' + k + ')"]'); return c ? { top: Math.round(c.getBoundingClientRect().top), vis: c.offsetParent !== null } : null; }, cleDe(plusVieille));
  t('PS-E13b fermer le détail ramène au MÊME mois, à la même position (contrat UX-HIST)', posAvant !== null && posApres && posApres.vis && Math.abs(posApres.top - posAvant) <= 1,
    JSON.stringify({ posAvant, posApres }));

  /* ── 6. Le débrief d'une vieille séance reste atteignable, sans appel (invariant 6) ─────────── */
  const cDbf = tout.find(c => c.cle === cleDe(sDbf)) || {};
  const autreVieille = tout.find(c => c.cle === cleDe(FIX[25])) || {};
  t('PS-E14 la séance du ' + sDbf.date + ' (hors des 20 dernières, autre année) montre « 💬 Voir le débrief Milo »',
    (cDbf.dbf || []).length === 1 && /Voir le débrief Milo/.test(cDbf.dbf[0]), JSON.stringify(cDbf));
  t('PS-E15 une vieille séance sans débrief propose « ✨ Analyser avec Milo » (jamais les deux)',
    (autreVieille.dbf || []).length === 1 && /Analyser avec Milo/.test(autreVieille.dbf[0]), JSON.stringify(autreVieille));
  const okDbf = await clic(X.pg, '#sess-list .sess-card[onclick="openSessDetail(' + cleDe(sDbf) + ')"] .sess-dbf-btn', 'ov-debrief-milo');
  const fen = await X.pg.evaluate(() => ({ ouvert: !!document.querySelector('#ov-debrief-milo.open'), txt: (document.getElementById('dbf-milo-body') || {}).textContent || '' }));
  t('PS-E16 le tap ouvre CE débrief (lu sur ce téléphone), sans aucun appel à Milo', okDbf && fen.ouvert && fen.txt.indexOf(TXT_DBF) >= 0 && X.st.coach === 0 && X.st.reels === 0,
    JSON.stringify(fen).slice(0, 160) + ' coach=' + X.st.coach);
  await X.pg.evaluate(() => { try { fermerDebriefMilo(); } catch (e) {} });

  /* ── 7. Volume : 28 jours par défaut, 14 au choix, Milo inchangé (invariants 7 à 10) ─────── */
  await X.pg.evaluate(() => { const d = document.getElementById('prog-volume-acc'); if (d && !d.open) d.open = true; });
  await X.pg.waitForTimeout(150);
  const lireVol = () => X.pg.evaluate(() => {
    const el = document.getElementById('prog-volume'), acc = document.getElementById('prog-volume-acc');
    const lignes = {}; (el ? [...el.querySelectorAll('.vol-l')] : []).forEach(l => { lignes[(l.querySelector('.vol-nom') || {}).textContent] = (l.querySelector('.vol-n') || {}).textContent; });
    const bt = [...document.querySelectorAll('#prog-volume-acc [data-vol-jours]')].map(x => ({ j: x.getAttribute('data-vol-jours'), on: x.getAttribute('aria-pressed') }));
    return { fen: ((el && el.querySelector('.vol-fen')) || {}).textContent || '', resume: ((acc && acc.querySelector('summary')) || {}).textContent || '', lignes, bt }; });
  const v28 = await lireVol();
  const pec = l => l['Pectoraux'] !== undefined ? l['Pectoraux'] : Object.keys(l).filter(k => /pector/i.test(k)).map(k => l[k])[0];
  const qua = l => Object.keys(l).filter(k => /quadri/i.test(k)).map(k => l[k])[0];
  t('PS-E17 deux choix de période, 14 jours | 28 jours, et 28 est actif par défaut',
    v28.bt.map(x => x.j).join(',') === '14,28' && (v28.bt.find(x => x.j === '28') || {}).on === 'true' && (v28.bt.find(x => x.j === '14') || {}).on === 'false', JSON.stringify(v28.bt));
  t('PS-E18 par défaut la carte compte sur 28 jours, et son titre le dit', /sur 28 jours/.test(v28.fen) && /28 jours/.test(v28.resume) && !/14 jours/.test(v28.resume), v28.fen + ' | ' + v28.resume.replace(/\s+/g, ' '));
  t('PS-E19 moyenne sur 28 jours = total / 4 : Pectoraux 12 → 3 · Quadriceps 8 → 2', pec(v28.lignes) === '3' && qua(v28.lignes) === '2', JSON.stringify(v28.lignes));
  await clic(X.pg, '#prog-volume-acc [data-vol-jours="14"]');
  const v14 = await lireVol();
  t('PS-E20 « 14 jours » se choisit : la carte compte sur 14 jours, et son titre suit', /sur 14 jours/.test(v14.fen) && /14 jours/.test(v14.resume) && (v14.bt.find(x => x.j === '14') || {}).on === 'true', v14.fen);
  t('PS-E21 moyenne sur 14 jours = total / 2 : Pectoraux 8 → 4 · Quadriceps 3 → 1,5', pec(v14.lignes) === '4' && qua(v14.lignes) === '1,5', JSON.stringify(v14.lignes));
  const milo14 = await X.pg.evaluate(() => _ctxVolumeMuscles());
  await clic(X.pg, '#prog-volume-acc [data-vol-jours="28"]');
  const milo28 = await X.pg.evaluate(() => _ctxVolumeMuscles());
  const miloOk = m => /mesurée sur 14 jours/.test(m) && /Pectoraux: 4 séries\/semaine/.test(m);
  t('PS-E22 ⛔ Milo reçoit 14 jours, QUEL QUE SOIT le choix de l\'écran (14 ou 28) — rien de silencieux', miloOk(milo14) && miloOk(milo28) && milo14 === milo28,
    (milo28.match(/mesurée sur \d+ jours/) || [''])[0] + ' | ' + (milo28.match(/Pectoraux: [\d.,]+/) || [''])[0]);

  /* ── 8. Le sous-onglet choisi survit (contrat UX-HIST) ─────────────────────────────────────── */
  await onglet(X, 'ptab-poids');
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  await versProgres(X);
  t('PS-E23 le sous-onglet choisi survit à un aller-retour (Corps & santé reste Corps & santé)', (await ongletActif(X.pg)) === 'ptab-poids', await ongletActif(X.pg));

  /* ── 9. Corps & santé et Badges inchangés (invariants 11 et 12) ──────────────────────────── */
  await onglet(X, 'ptab-poids');                           // conduit explicitement : ne dépend pas de PS-E23
  const poids = await X.pg.evaluate(() => ({ vis: !!(document.getElementById('prog-poids') || {}).offsetParent, entree: !!(document.getElementById('weight-entry-card') || {}).offsetParent,
    exp: !!(document.getElementById('poids-exp-btn') || {}).offsetParent }));
  const globPoids = await Promise.all(GLOBAUX.map(id => visible(X.pg, id)));
  t('PS-E24 Corps & santé : la pesée et son export sont là, et aucun bloc de Séances ne s\'y affiche', poids.vis && poids.entree && poids.exp && globPoids.every(v => !v), JSON.stringify(poids) + ' ' + globPoids.join(','));
  await onglet(X, 'ptab-badges');
  const bad = await X.pg.evaluate(() => ({ vis: !!(document.getElementById('prog-badges') || {}).offsetParent, n: (document.getElementById('badge-grid') || { children: [] }).children.length }));
  t('PS-E25 Badges n\'est pas perdu : l\'onglet s\'ouvre et montre ses récompenses', bad.vis && bad.n > 0, JSON.stringify(bad));
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  await X.pg.evaluate(() => { try { goWeightTab(); } catch (e) {} }); await X.pg.waitForTimeout(500);
  t('PS-E26 la tuile Poids de l\'Accueil ouvre toujours Corps & santé', (await ongletActif(X.pg)) === 'ptab-poids', await ongletActif(X.pg));

  /* ── 10. Les portes d'entrée mènent à Séances, au bon endroit (invariant 3) ──────────────── */
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  await X.pg.evaluate(() => { try { if (typeof _ceMoisOuvert === 'function' && !_ceMoisOuvert() && typeof toggleCeMois === 'function') toggleCeMois(); } catch (e) {} });
  await X.pg.waitForTimeout(200);
  const okTuile = await clic(X.pg, '#s-home [onclick="goSessionsHistory()"]');
  await X.pg.waitForTimeout(600);
  const apresTuile = await cartes(X.pg);
  const moisOuverts = await X.pg.evaluate(() => [...document.querySelectorAll('#sess-list .sess-mois[aria-expanded="true"]')].map(m => m.getAttribute('data-mois')));
  const nMoisAuj = FIX.filter(s => s.date.slice(0, 7) === MOIS_AUJ).length;
  t('PS-E27 « Séances ce mois » (Accueil) → Progrès → Séances, sur le mois en cours, ses séances visibles',
    okTuile && (await ongletActif(X.pg)) === 'ptab-seances' && moisOuverts.indexOf(MOIS_AUJ) >= 0
    && apresTuile.filter(c => c.mois === MOIS_AUJ && c.vis).length === nMoisAuj, okTuile + ' ' + (await ongletActif(X.pg)) + ' ' + JSON.stringify(moisOuverts) + ' ' + apresTuile.filter(c => c.mois === MOIS_AUJ).length + '/' + nMoisAuj);

  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  const J0 = jourParis(0), duJour = FIX.filter(s => s.date === J0).map(cleDe);
  const okJour = await clic(X.pg, '#s-home [onclick="_calSelect(\'' + J0 + '\')"]');
  const okRevoir = await clic(X.pg, '#s-home .ft-press[onclick^="goSessionsHistory(["]');   // « Revoir la séance » (pas la tuile)
  await X.pg.waitForTimeout(600);
  const apresJour = await cartes(X.pg);
  const cibles = apresJour.filter(c => c.cible).map(c => c.cle).sort();
  t('PS-E28 calendrier → jour à DEUX séances → « Revoir la séance » → Séances, avec LES DEUX séances du jour visibles et marquées (et elles seules)',
    okJour && okRevoir && (await ongletActif(X.pg)) === 'ptab-seances' && cibles.join(',') === duJour.slice().sort().join(',') && apresJour.filter(c => c.cible && c.vis).length === duJour.length,
    okJour + ' ' + okRevoir + ' cibles=' + JSON.stringify(cibles) + ' attendu=' + JSON.stringify(duJour));

  /* Un jour à UNE séance — pris dans une autre année / un autre mois, pour prouver que le bon mois s'ouvre. */
  const seule = sDbf;                                        // séance seule de son jour, année précédente
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  const okSeule = await X.pg.evaluate(k => { try { goSessionsHistory([k]); return true; } catch (e) { return false; } }, cleDe(seule));
  await X.pg.waitForTimeout(700);
  const apresSeule = await cartes(X.pg);
  const cSeule = apresSeule.filter(c => c.cible);
  t('PS-E29 une cible = UNE séance (par sa clé) : son année et son mois s\'ouvrent, sa carte est visible et seule marquée',
    okSeule && cSeule.length === 1 && cSeule[0].cle === cleDe(seule) && cSeule[0].vis, JSON.stringify(cSeule));

  /* Un filtre de muscle actif cacherait la séance visée : la porte d'entrée repasse sur « Tous ». */
  await versProgres(X); await onglet(X, 'ptab-seances');
  const okFiltre = await clic(X.pg, '#sess-filter .sessf-chip:not(.on)');            // un muscle (pas « Tous »)
  const filtreAvant = await X.pg.evaluate(() => (document.querySelector('#sess-filter .sessf-chip.on') || {}).textContent || '');
  const squatJ0 = FIX.find(s => s.date === J0 && s.exs[0].name === 'Squat à la Barre'), pecJ0 = FIX.find(s => s.date === J0 && s.exs[0].name === 'Développé Couché');
  const cibleFiltree = /Pector/i.test(filtreAvant) ? squatJ0 : pecJ0;                // la séance que ce filtre CACHE
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  await X.pg.evaluate(k => { try { goSessionsHistory([k]); } catch (e) {} }, cleDe(cibleFiltree));
  await X.pg.waitForTimeout(700);
  const apresFiltre = await cartes(X.pg);
  const filtreApres = await X.pg.evaluate(() => (document.querySelector('#sess-filter .sessf-chip.on') || {}).textContent || '');
  const cF = apresFiltre.find(c => c.cle === cleDe(cibleFiltree)) || {};
  t('PS-E40 une porte d\'entrée remet le filtre de muscle sur « Tous » : la séance visée n\'est jamais cachée par un filtre',
    okFiltre && filtreAvant && filtreAvant !== 'Tous' && filtreApres === 'Tous' && cF.vis && cF.cible, JSON.stringify({ filtreAvant, filtreApres, cF }));

  /* La vue semaine du calendrier : la ligne d'un jour à séance vise ses séances. */
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  /* La semaine qui contient aujourd'hui : on la cherche par ses lignes (`_calZoom(wi)` = le vrai geste du n° de semaine). */
  const zoom = await X.pg.evaluate(k => { try { for (let wi = 0; wi < 7; wi++) { _calZoom(wi);
      const l = [...document.querySelectorAll('#s-home [onclick^="_calZoom(null)"]')].length ? [...document.querySelectorAll('#s-home div[onclick^="goSessionsHistory("]')] : [];
      if (l.some(x => (x.getAttribute('onclick') || '').indexOf(String(k)) >= 0)) return wi; } } catch (e) {} return null; }, duJour[0]);
  const ligne = await X.pg.evaluate(() => [...document.querySelectorAll('#s-home div[onclick^="goSessionsHistory("]')].filter(x => !x.closest('[id^="h-"]') && !/^goSessionsHistory\(\)$/.test(x.getAttribute('onclick'))).map(x => x.getAttribute('onclick')));
  const ligneJour = ligne.find(o => o.indexOf(String(duJour[0])) >= 0) || '';
  const nus = await X.pg.evaluate(() => [...document.querySelectorAll('#s-home [onclick="goSessionsHistory()"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)));
  t('PS-E30 vue semaine : chaque ligne à séance appelle `goSessionsHistory` avec des clés, et celle d\'aujourd\'hui avec LES DEUX clés du jour (seule la tuile reste sans argument)',
    zoom !== null && ligne.length >= 1 && ligne.every(o => /^goSessionsHistory\(\[[\d,]+\]\)$/.test(o)) && duJour.every(k => ligneJour.indexOf(String(k)) >= 0) && nus.every(x => /Séances/.test(x)),
    'wi=' + zoom + ' ' + JSON.stringify(ligne).slice(0, 160) + ' nus=' + JSON.stringify(nus));
  await X.pg.evaluate(() => { try { _calZoom(null); } catch (e) {} });

  /* ── 11. Points rouges, aide, Guide : rien ne vise un onglet absent (invariant 13) ──────── */
  const dots = await X.pg.evaluate(() => {
    const PAN = { 'ptab-seances': 'prog-seances', 'ptab-exo': 'prog-exo', 'ptab-poids': 'prog-poids', 'ptab-badges': 'prog-badges' };
    const f = (typeof NEW_FEATURES !== 'undefined' ? NEW_FEATURES : []).filter(x => x.screen === 'progress' && x.spot);
    return f.map(x => { const el = document.getElementById(x.spot); return { id: x.id, spot: x.spot, existe: !!el, onglet: !!(el && el.closest('#s-progress .nu-tabs')), panneau: PAN[x.spot] || null }; });
  });
  t('PS-E31 chaque point rouge de Progrès vise un ONGLET qui existe', dots.length > 0 && dots.every(d => d.existe && d.onglet), JSON.stringify(dots.filter(d => !d.existe || !d.onglet)));
  const filtreDot = dots.find(d => d.id === 'sess-filter');
  const filtreOk = filtreDot && await dans(X.pg, 'sess-filter', filtreDot.panneau);
  t('PS-E32 le point rouge du filtre d\'historique vise l\'onglet qui CONTIENT le filtre (Séances)', !!filtreOk && filtreDot.spot === 'ptab-seances', JSON.stringify(filtreDot));
  const aide = await X.pg.evaluate(() => {
    const tips = ((typeof _HELP_DATA !== 'undefined' && _HELP_DATA.progress && _HELP_DATA.progress.tips) || []).map(x => x.t).join('\n');
    const guide = (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).map(x => (x.t || '') + ' ' + (x.cap || '')).join('\n');
    return { tips, guide };
  });
  const perime = s => /sous-onglet <b>Poids<\/b>|Onglet Poids|\(Exercices · Poids · Badges\)|\(<b>Exercices · Poids · Badges<\/b>\)|ne s'affichent que sur <b>Exercices<\/b>/.test(s);
  t('PS-E33 l\'aide « ? » de Progrès ne cite plus d\'onglet « Poids » ni la répartition d\'avant, et parle de Séances et de 28 jours',
    !perime(aide.tips) && /Séances/.test(aide.tips) && /28 jours/.test(aide.tips), (aide.tips.match(/.{0,60}(sous-onglet <b>Poids|Exercices · Poids).{0,40}/) || ['ok'])[0]);
  t('PS-E34 le Guide ne décrit plus l\'ancienne répartition (Exercices · Poids · Badges) et place l\'historique dans Séances',
    aide.guide.length > 0 && !perime(aide.guide) && /Progrès → Séances|Progrès<\/b> → <b>Séances|Séances<\/b>/.test(aide.guide), (aide.guide.match(/.{0,60}Exercices · Poids.{0,40}/) || ['ok'])[0]);

  /* ── 12. Consulter ne modifie RIEN (invariant 14) ─────────────────────────────────────────── */
  const apres = await X.pg.evaluate(() => ({ sess: localStorage.getItem('ft4_sessions'), cles: Object.keys(localStorage).sort(), mem: JSON.stringify(S.sessions) }));
  const nouvelles = apres.cles.filter(k => avant.cles.indexOf(k) < 0 && !/^ft4_(seen_ft|progAcc|sb_last)$/.test(k));   // sb_last : état réseau du miroir Supabase (asynchrone, hors Progrès)
  t('PS-E35 ⛔ consulter Progrès (onglets, années, mois, cibles, débrief, période) ne modifie pas `ft4_sessions`',
    apres.sess === avant.sess && JSON.stringify(JSON.parse(apres.mem)) === JSON.stringify(JSON.parse(avant.sess)), (apres.sess || '').length + ' vs ' + (avant.sess || '').length);
  t('PS-E36 ⛔ et ne crée aucune nouvelle clé de stockage (mois ouvert, onglet, période : en mémoire seulement)', !nouvelles.length, JSON.stringify(nouvelles));
  t('PS-E37 aucune erreur JavaScript pendant tout le parcours', !X.errs.length, X.errs.slice(0, 3).join(' | '));
  await X.cx.close();

  /* ── 13 bis. Séances sans date ou mal datées : rien ne se perd (invariant 5) ──────────────────── */
  { const base = FIX.slice(0, 2).map(s => JSON.parse(JSON.stringify(s)));
    const sans = Object.assign(JSON.parse(JSON.stringify(FIX[2])), { ts: 4242, id: 4343 }); delete sans.date;
    const mal = Object.assign(JSON.parse(JSON.stringify(FIX[3])), { ts: 5252, id: 5353, date: 'n/a' });
    const Y = await ouvrir({ sessions: base.concat([sans, mal]) });
    await versProgres(Y); await onglet(Y, 'ptab-seances'); await toutDeplier(Y);
    const c = await cartes(Y.pg);
    const ans = await Y.pg.evaluate(() => [...document.querySelectorAll('#sess-list .sess-an')].map(a => a.textContent.replace(/\s+/g, ' ').trim()));
    t('PS-E39 une séance SANS date et une séance MAL datée restent atteignables (rangées en dernier, « Sans date »), aucune perdue',
      c.length === 4 && [4242, 5252].every(k => c.some(x => x.cle === k && x.vis)) && /Sans date/.test(ans[ans.length - 1] || ''), JSON.stringify({ n: c.length, ans }));
    await Y.cx.close(); }

  /* ── 13. Bandeau de cycle : comportement actuel préservé (statu quo, non tranché) ──────────── */
  X = await ouvrir({ stock: { ft4_gender: 'F', ft4_mcstart: jourParis(-3) } });
  await versProgres(X); await onglet(X, 'ptab-exo');
  const ban = await X.pg.evaluate(() => { const e = document.getElementById('prog-cycle-banner'); return { vis: !!(e && e.offsetParent), dansExo: !!(e && e.closest('#prog-exo')), txt: e ? e.textContent.trim().slice(0, 60) : '' }; });
  t('PS-E38 le bandeau de cycle reste dans Exercices et s\'affiche comme avant (statu quo jusqu\'à décision)', ban.vis && ban.dansExo && /Jour/.test(ban.txt), JSON.stringify(ban));
  await X.cx.close();
};
