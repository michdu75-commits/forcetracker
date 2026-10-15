/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🗂️ PROGRES-SEANCES-01 — PROGRÈS → SÉANCES / UX-HIST, LOT STRUCTUREL 01 (session-B · 14/10/2026, mission de Michel)

   Contrat (décisions de Michel du 14/10 + contrat UX-HIST du 08/10, §12 de l'addendum d'architecture) :
   · Progrès = SÉANCES | EXERCICES | CORPS & SANTÉ, Séances en premier, et rien d'autre : 🏅 Badges a quitté Progrès
     pour le Menu ☰ → « Ton suivi » → Badges (D-078, décision de Michel du 15/10/2026), même grille (`renderBadges`) ;
   · Séances porte « Ce que ton histoire montre », « Ce que tu travailles, par semaine », l'historique,
     l'export, le filtre, la liste et le débrief ; Exercices garde chips, recherche, graphique, objectif ;
   · historique Année → Mois → Séance : années repliées sauf l'année en cours, un mois se déplie à la
     demande, plus de plafond de 20 ; ⭐ décision de Michel du 14/10 (PROGRES-SEANCES-INTEGRATION-01) : en
     entrée normale, le MOIS COURANT est déplié s'il existe — sinon aucun mois ne s'ouvre et aucun n'est inventé ;
   · Accueil « Séances ce mois » → Séances, mois en cours ; calendrier → Séances, sur LA séance (par sa clé
     `ts||id`, la même que la carte et `openSessDetail`), plusieurs séances ce jour-là → celles du jour ;
   · volume : 14 jours | 28 jours, 28 par défaut, moyenne = total / 2 ou / 4 ; ⛔ Milo garde 14 jours ;
   · le sous-onglet choisi survit (contrat UX-HIST) ; ⛔ consulter Progrès ne modifie jamais S.sessions.

   Blocs : B-PS01-S (source) · B-PS01-E (écran conduit) · B-PSI01-E (session-B, PROGRES-SEANCES-INTEGRATION-01 :
   PS-E41 → PS-E44, mois courant, largeur 390 / 320 px, calendrier → séance ancienne par le vrai geste ;
   micro-fermeture du 14/10 : PS-S8 diapo du Guide, PS-E45 → PS-E48, PS-E27 / PS-E29 isolés dans un contexte neuf ;
   publication ft-v1255 du 15/10 : PS-S9 et PS-E49, la pop-up « Quoi de neuf » « Progrès : Séances d'abord » ;
   D-078 du 15/10, Badges → Menu : PS-S10, PS-E01 réécrit, PS-E01b, PS-E25 réécrit, PS-E50 → PS-E53 ;
   D-079 / D-080 du 15/10 soir (filtres compacts multi OU, volume replié au lancement) : PS-S11, PS-E40 adapté,
   PS-E54 → PS-E66).
   Ce que les témoins CONDUISENT : la barre du bas, le Menu ☰ et sa ligne Badges, la fenêtre Badges et ses trois
   fermetures (✕, tap à côté, bouton retour), les onglets de Progrès, les en-têtes Année / Mois,
   la tuile « Séances ce mois », le calendrier (jour, « Revoir la séance », vue semaine), le choix
   14 | 28 jours, une carte (détail), « 💬 Voir le débrief Milo ».
   Frontières SIMULÉES : Worker IA (compté, jamais réel), Apps Script, Supabase. ⛔ 0 appel réel à Anthropic.
   Ce qu'ils OBSERVENT : la visibilité réelle (offsetParent) et le parent DOM de chaque bloc, les en-têtes
   et les cartes de l'historique, le texte de la carte volume, le texte que Milo reçoit
   (`_ctxVolumeMuscles`), `ft4_sessions` et la liste des clés du stockage, les requêtes `coach`.
   Ce qu'ils NE COUVRENT PAS : Safari iOS, le rendu visuel fin (captures), la séparation lecture /
   modification du détail (non décidée), le glissé vers le bas de la fenêtre Badges (geste tactile, porte commune à
   tous les contenus du Menu, non conduite ici).
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
  const ecritures = [rs, gsh, corps(se, 'switchProgTab'), corps(se, 'basculerSessAnnee'), corps(se, 'basculerSessMois'), corps(se, 'choisirVolumeJours'), corps(se, 'setSessFilter')].join('\n');
  t('PS-S6 ⛔ aucune nouvelle clé persistée pour l\'historique, le mois ouvert, l\'onglet, la période ou le filtre (aucun `localStorage.setItem`)',
    corps(se, 'setSessFilter').length > 0 && !/localStorage\.setItem/.test(ecritures), (ecritures.match(/localStorage\.setItem\([^,]*/g) || []).join(' '));
  /* PS-S8 — la diapo « Tes progrès » du Guide (règle d'or #11). La légende nomme les 3 onglets dans l'ordre, Séances
     d'abord, et dit que les badges sont dans le Menu (D-078) ; l'image n'est ni la capture d'avant PROGRES-SEANCES-01
     (3 onglets, « Exercices » actif) ni celle à 4 onglets (Badges en dernier) du 14/10. */
  { const ap = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    const d = (ap.split('\n').find(l => /img:'guide\/progres\.jpg'/.test(l)) || '');
    const ordre = ['Séances', 'Exercices', 'Corps &amp; santé'].map(x => d.indexOf(x));
    const h = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'guide', 'progres.jpg'))).digest('hex');
    const anciennes = ['f3a5ff8147a7a06371ed48638baa3702790b36a431d430a794708f901c8fa954', 'f82c8f6a1a77af56', '1f6d97351bd5c633'];   // 3ᵉ : ft-v1255, filtres sur plusieurs lignes
    t('PS-S8 diapo « Tes progrès » : légende Séances · Exercices · Corps & santé (dans l\'ordre), badges dans le Menu, et capture refaite (≠ capture d\'avant, ≠ capture à 4 onglets, ≠ capture aux filtres sur plusieurs lignes)',
      d && ordre.every(i => i > 0) && ordre.every((v, i) => !i || v > ordre[i - 1]) && !/graphiques clairs/.test(d)
      && /<b>badges<\/b>[^.]*<b>Menu<\/b>/i.test(d) && anciennes.every(a => h.indexOf(a) !== 0), JSON.stringify({ ordre, h: h.slice(0, 12) })); }
  /* PS-S9 — la pop-up « Quoi de neuf » de la publication ft-v1255 (règle d'or #11 : un repère a bougé). Elle existe,
     APRÈS la dernière annonce de la production d'avant (ft-v1254 : v76), elle est courte (R25 : ≤ 600 caractères) et
     elle dit ce qui a bougé : Séances en premier, l'historique par année puis par mois, Exercices garde la progression. */
  { const ct = fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8');
    const l = ct.split('\n').find(x => /^\s*\{v:\d+,[^\n]*t:'Progrès : Séances d\\'abord'/.test(x)) || '';
    const v = +((l.match(/\{v:(\d+)/) || [])[1] || 0), d = ((l.match(/ d:'(.*)'\},?\s*$/) || [])[1] || '').replace(/\\'/g, "'");
    t('PS-S9 pop-up « Progrès : Séances d\'abord » : après v76, ≤ 600 caractères, dit Séances · année puis mois · Exercices',
      v > 76 && d.length > 0 && d.length <= 600 && /Séances/.test(d) && /<b>année<\/b>[^.]*<b>mois<\/b>/.test(d) && /<b>Exercices<\/b>/.test(d),
      JSON.stringify({ v, n: d.length })); }
  /* PS-S10 — D-078 : Badges a quitté Progrès SANS deuxième moteur. Une seule définition de `renderBadges`, un seul
     `badge-grid` (la fenêtre du Menu, dans coach.js), plus aucun onglet ni panneau Badges dans index.html, et le point
     rouge « prog-badges » vise la ligne du Menu (aucun point ne vise un élément retiré). */
  { const raw = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
    const html = raw('index.html'), tous = ['app.js', 'setup.js', 'coach.js', 'screens.js', 'log.js', 'tracking.js', 'state.js', 'constants.js'].map(nu).join('\n');
    const defs = (tous.match(/function renderBadges\(/g) || []).length;
    const grilles = ((html + '\n' + tous).match(/id="badge-grid"/g) || []).length;
    const retires = /id="(ptab-badges|prog-badges)"/.test(html);
    const ct = raw('constants.js'), pb = (ct.match(/\{id:'prog-badges'[^}]*\}/) || [''])[0];
    const viseRetire = /(spot|anchor):'(ptab-badges|prog-badges)'/.test(ct);
    t('PS-S10 D-078 : un seul `renderBadges`, un seul `badge-grid`, aucun onglet / panneau Badges dans Progrès, le point « prog-badges » vise la ligne Badges du Menu',
      defs === 1 && grilles === 1 && !retires && !viseRetire && /screen:'setup'/.test(pb) && /anchor:'menu-row-badges'/.test(pb) && /id="menu-row-badges"/.test(html),
      JSON.stringify({ defs, grilles, retires, viseRetire, pb: pb.slice(0, 80) })); }
  /* PS-S11 — D-079 / D-080, règle d'or #11 : PAS de pop-up (décision de Michel : aucune annonce au-delà de v77), mais un point
     rouge qui dit le nouveau geste. */
  { const ct = fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8');
    const vmax = Math.max(...[...ct.matchAll(/\{v:(\d+),/g)].map(m => +m[1]));
    const pt = (ct.match(/\{id:'sess-filtre-multi'[^}]*\}/) || [''])[0];
    t('PS-S11 D-079 : aucune pop-up « Quoi de neuf » nouvelle (la dernière reste v77) et un point rouge Progrès dit « Filtrer les séances », plusieurs muscles',
      vmax === 77 && /screen:'progress'/.test(pt) && /Filtrer les séances/.test(pt) && /un ou plusieurs/.test(pt), JSON.stringify({ vmax, pt: pt.slice(0, 90) })); }
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
    if (!o.garderOverlays) await pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
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
  const panneaux = await X.pg.evaluate(() => [...document.querySelectorAll('#s-progress [id^="prog-"]')].filter(e => /^prog-(seances|exo|poids|badges)$/.test(e.id)).map(e => e.id));
  t('PS-E01b Progrès porte EXACTEMENT 3 onglets, Séances | Exercices | Corps & santé dans cet ordre — plus d\'onglet ni de panneau Badges (D-078)',
    tabs.map(x => x.id).join(',') === 'ptab-seances,ptab-exo,ptab-poids' && tabs[0].txt === 'Séances' && tabs[1].txt === 'Exercices' && tabs[2].txt === 'Corps & santé'
    && panneaux.join(',') === 'prog-seances,prog-exo,prog-poids', JSON.stringify({ tabs, panneaux }));
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
    nCartes: document.querySelectorAll('#sess-list .sess-card').length,
    cartesMois: [...document.querySelectorAll('#sess-list .sess-card')].map(c => (c.closest('[data-mois]') || { getAttribute: () => null }).getAttribute('data-mois')) }));
  const ansAttendus = [...new Set(FIX.map(s => s.date.slice(0, 4)))].sort().reverse();
  t('PS-E09 l\'historique est rangé par ANNÉE, la plus récente d\'abord ; seule l\'année en cours est dépliée',
    tete.ans.map(a => a.an).join(',') === ansAttendus.join(',') && tete.ans.every(a => a.ouvert === (a.an === AN_AUJ ? 'true' : 'false')), JSON.stringify(tete.ans));
  const moisAnAuj = [...new Set(FIX.filter(s => s.date.slice(0, 4) === AN_AUJ).map(s => s.date.slice(0, 7)))].sort().reverse();
  /* ⚠️ RÉÉCRIT (R30) — PROGRES-SEANCES-INTEGRATION-01, décision de Michel du 14/10. Ce témoin exigeait « tous les mois
     repliés, aucune carte avant un tap » (contrat UX-HIST appliqué à la lettre). Michel : en entrée NORMALE, le MOIS
     COURANT s'ouvre seul s'il existe — sinon un tap de plus pour voir ses séances récentes. Les autres mois restent
     repliés (pas de centaines de cartes). L'ancien comportement (mois courant replié) fait rougir ce témoin. */
  const nAuj = FIX.filter(s => s.date.slice(0, 7) === MOIS_AUJ).length;
  t('PS-E10 dans l\'année en cours : un en-tête par MOIS (le plus récent d\'abord) ; seul le MOIS COURANT est déplié en entrée normale — ses séances, et elles seules',
    tete.mois.map(m => m.mois).join(',') === moisAnAuj.join(',') && tete.mois.every(m => m.ouvert === (m.mois === MOIS_AUJ ? 'true' : 'false'))
    && nAuj > 0 && tete.nCartes === nAuj && tete.cartesMois.every(m => m === MOIS_AUJ), JSON.stringify(tete));
  /* ⭐ Le défaut ne doit pas confisquer le geste : un tap sur le mois courant le REPLIE (puis le redéplie). Piège réel :
     une bascule écrite `!état brut` lit « absent » comme « replié » et rouvre le mois au premier tap. */
  await clic(X.pg, '#sess-list .sess-mois[data-mois="' + MOIS_AUJ + '"]');
  const plie = await X.pg.evaluate(m => ({ ouvert: (document.querySelector('#sess-list .sess-mois[data-mois="' + m + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
    n: document.querySelectorAll('#sess-list .sess-mois-bloc[data-mois="' + m + '"] .sess-card').length }), MOIS_AUJ);
  await clic(X.pg, '#sess-list .sess-mois[data-mois="' + MOIS_AUJ + '"]');
  const redeplie = await X.pg.evaluate(m => ({ ouvert: (document.querySelector('#sess-list .sess-mois[data-mois="' + m + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
    n: document.querySelectorAll('#sess-list .sess-mois-bloc[data-mois="' + m + '"] .sess-card').length }), MOIS_AUJ);
  t('PS-E42 un tap sur le mois courant (déplié par défaut) le REPLIE, un 2ᵉ tap le redéplie — le geste n\'est jamais confisqué',
    plie.ouvert === 'false' && plie.n === 0 && redeplie.ouvert === 'true' && redeplie.n === nAuj, JSON.stringify({ plie, redeplie }));
  /* PS-E45 — déplier une ANNÉE PASSÉE ne déplie aucun de ses mois : seul le mois EN COURS est ouvert par défaut. */
  const anPasse = String(Number(AN_AUJ) - 1);
  const okAn = await clic(X.pg, '#sess-list .sess-an[data-an="' + anPasse + '"]');
  const passe = await X.pg.evaluate(a => { const bloc = document.querySelector('#sess-list .sess-an-bloc[data-an="' + a + '"]');
    return { ouverte: (document.querySelector('#sess-list .sess-an[data-an="' + a + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
      mois: bloc ? [...bloc.querySelectorAll('.sess-mois')].map(m => m.getAttribute('aria-expanded')) : [],
      cartes: bloc ? bloc.querySelectorAll('.sess-card').length : -1 }; }, anPasse);
  const nMoisPasse = new Set(FIX.filter(s => s.date.slice(0, 4) === anPasse).map(s => s.date.slice(0, 7))).size;
  t('PS-E45 une année passée dépliée garde TOUS ses mois repliés (aucune carte) — seul le mois en cours s\'ouvre par défaut',
    okAn && passe.ouverte === 'true' && nMoisPasse > 0 && passe.mois.length === nMoisPasse && passe.mois.every(m => m === 'false') && passe.cartes === 0, JSON.stringify(passe));
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

  /* ── 9. Corps & santé inchangé (invariant 11) ; Badges → Menu : voir 9 bis (D-078) ─────────── */
  await onglet(X, 'ptab-poids');                           // conduit explicitement : ne dépend pas de PS-E23
  const poids = await X.pg.evaluate(() => ({ vis: !!(document.getElementById('prog-poids') || {}).offsetParent, entree: !!(document.getElementById('weight-entry-card') || {}).offsetParent,
    exp: !!(document.getElementById('poids-exp-btn') || {}).offsetParent }));
  const globPoids = await Promise.all(GLOBAUX.map(id => visible(X.pg, id)));
  t('PS-E24 Corps & santé : la pesée et son export sont là, et aucun bloc de Séances ne s\'y affiche', poids.vis && poids.entree && poids.exp && globPoids.every(v => !v), JSON.stringify(poids) + ' ' + globPoids.join(','));
  await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
  await X.pg.evaluate(() => { try { goWeightTab(); } catch (e) {} }); await X.pg.waitForTimeout(500);
  t('PS-E26 la tuile Poids de l\'Accueil ouvre toujours Corps & santé', (await ongletActif(X.pg)) === 'ptab-poids', await ongletActif(X.pg));

  /* ── 10. Les portes d'entrée mènent à Séances, au bon endroit (invariant 3) ──────────────── */
  /* PS-E27 et PS-E29 sont joués plus bas, chacun dans un CONTEXTE NEUF (micro-fermeture du 14/10) : ici, l'état laissé par
     les témoins précédents (mois dépliés, onglet choisi) pouvait les satisfaire sans que la porte fasse son travail. */
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

  /* Un filtre de muscle actif cacherait la séance visée : la porte d'entrée repasse sur « Tous ». */
  await versProgres(X); await onglet(X, 'ptab-seances');
  /* D-079 : les pastilles vivent dans le panneau « Filtrer les séances », fermé à l'entrée — on l'ouvre d'abord (vrai geste). */
  if (!(await X.pg.evaluate(() => { const a = document.getElementById('sess-filter-acc'); return !!(a && a.open); }))) await clic(X.pg, '#sess-filter-acc > summary');
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
    const PAN = { 'ptab-seances': 'prog-seances', 'ptab-exo': 'prog-exo', 'ptab-poids': 'prog-poids' };
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

  /* ── 12 bis. B-PS01-E, D-078 (décision de Michel du 15/10/2026) — BADGES DANS LE MENU ─────────────────────────────
     Contexte NEUF. Un badge débloqué est posé (« Premier soulevé », daté) ; la fixture a 32 séances, donc « Légende »
     (100 séances) est en cours, avec sa barre. Le parcours est celui d'une personne : ☰ → ligne « Badges » (rayon
     « Ton suivi ») → la grille → ✕ → ☰ de nouveau → Badges → tap à côté → Badges → bouton retour.
     ⛔ Les références (badges, séances, clés) sont prises APRÈS le démarrage : `checkBadges(true)` débloque au lancement
     ce que la fixture mérite, ce n'est pas l'ouverture qui écrit. */
  { const B = await ouvrir({ stock: { ft4_badges: JSON.stringify({ first_session: { unlockedAt: '2026-01-02' } }) } });
    const fab = () => B.pg.evaluate(() => { const e = document.getElementById('nb-log'); if (!e) return null; const r = e.getBoundingClientRect();
      return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10).join(','); });
    const etat = () => B.pg.evaluate(() => ({ badges: localStorage.getItem('ft4_badges'), sess: localStorage.getItem('ft4_sessions'),
      cles: Object.keys(localStorage).sort(), mem: JSON.stringify(S.badges || {}), ecran: window._curScreen }));
    const ouvertDC = () => B.pg.evaluate(() => { const o = document.getElementById('ov-drawer-cnt'); return !!(o && o.classList.contains('open')); });
    const menuOuvert = () => B.pg.evaluate(() => { const m = document.getElementById('menu-drawer'); return !!(m && m.classList.contains('open')); });
    const grille = () => B.pg.evaluate(() => {
      const g = document.getElementById('badge-grid'), ov = document.getElementById('ov-drawer-cnt');
      const cartes = g ? [...g.querySelectorAll('.badge-card')] : [];
      const carte = n => cartes.find(c => ((c.querySelector('.badge-name') || {}).textContent || '') === n) || null;
      const pre = carte('Premier soulevé'), leg = carte('Légende');
      return { dansMenu: !!(g && g.closest('#ov-drawer-cnt')), visible: !!(g && g.offsetParent !== null && ov && ov.classList.contains('open')),
        n: cartes.length, attendu: (typeof BADGES !== 'undefined') ? BADGES.length : -1,
        titre: ((document.querySelector('#drawer-cnt-body') || {}).textContent || '').indexOf('Badges') >= 0,
        premier: pre ? { debloque: pre.classList.contains('unlocked'), date: ((pre.querySelector('.badge-date') || {}).textContent || '').trim() } : null,
        legende: leg ? { verrou: leg.classList.contains('locked'), barre: !!leg.querySelector('.badge-prog-fill'),
          txt: ((leg.querySelector('.badge-prog-txt') || {}).textContent || '').trim() } : null,
        nSeances: ((typeof S !== 'undefined' && S.sessions) || []).length }; });
    const ligne = () => B.pg.evaluate(() => { const r = document.getElementById('menu-row-badges'); const g = r && r.closest('.menu-group');
      const sec = g && g.previousElementSibling; return { vis: !!(r && r.offsetParent !== null), rayon: sec ? sec.textContent.trim() : null,
        point: !!(r && r.querySelector('.menu-new-dot')), vu: ((typeof S !== 'undefined' && S.seenFeatures) || []).indexOf('prog-badges') >= 0 }; });
    const rouvrirMenu = async () => { await clic(B.pg, '#nb-setup'); await B.pg.waitForTimeout(350); };
    const versBadges = async () => { await rouvrirMenu(); const ok = await clic(B.pg, '#menu-row-badges', 'ov-drawer-cnt'); await B.pg.waitForTimeout(350); return ok; };

    await clic(B.pg, '#nb-home'); await B.pg.waitForTimeout(300);
    const fab0 = await fab(), e0 = await etat();
    /* ① le Menu montre la ligne, au bon rayon, avec son point rouge — puis l'ouvre */
    await rouvrirMenu();
    const l0 = await ligne();
    const ok1 = await clic(B.pg, '#menu-row-badges', 'ov-drawer-cnt'); await B.pg.waitForTimeout(350);
    const g1 = await grille(), menuApres = await menuOuvert();
    t('PS-E01 ⭐ Badges est JOIGNABLE depuis le Menu et sa grille est FONCTIONNELLE : ☰ → « Badges » (rayon « Ton suivi ») ouvre la fenêtre, le Menu se range, et la grille montre TOUS les badges',
      l0.vis && l0.rayon === 'Ton suivi' && ok1 && !menuApres && g1.dansMenu && g1.visible && g1.titre && g1.attendu > 0 && g1.n === g1.attendu,
      JSON.stringify({ l0, ok1, menuApres, g1: { dansMenu: g1.dansMenu, visible: g1.visible, titre: g1.titre, n: g1.n, attendu: g1.attendu } }));
    t('PS-E25 Badges n\'est pas perdu : un badge DÉBLOQUÉ (« Premier soulevé ») avec sa date, et un badge EN COURS (« Légende ») avec sa barre « ' + g1.nSeances + '/100 »',
      !!(g1.premier && g1.premier.debloque && g1.premier.date) && !!(g1.legende && g1.legende.verrou && g1.legende.barre && g1.legende.txt === g1.nSeances + '/100') && g1.nSeances > 0,
      JSON.stringify({ premier: g1.premier, legende: g1.legende, nSeances: g1.nSeances }));
    /* ② trois fermetures, chacune suivie d'un retour au Menu */
    await clic(B.pg, '#drawer-cnt-body button[onclick="closeDrawerContent()"]', 'ov-drawer-cnt'); await B.pg.waitForTimeout(450);
    const f1 = await ouvertDC(); await rouvrirMenu(); const m1 = await menuOuvert(), l1 = await ligne();
    const ok2 = await clic(B.pg, '#menu-row-badges', 'ov-drawer-cnt'); await B.pg.waitForTimeout(350);
    const o2 = await ouvertDC(), g2 = await grille();
    await B.pg.mouse.click(8, 60); await B.pg.waitForTimeout(450);
    const f2 = await ouvertDC(); await rouvrirMenu(); const m2 = await menuOuvert();
    const ok3 = await clic(B.pg, '#menu-row-badges', 'ov-drawer-cnt'); await B.pg.waitForTimeout(350);
    const o3 = await ouvertDC();
    await B.pg.evaluate(() => history.back()); await B.pg.waitForTimeout(600);
    const f3 = await ouvertDC(), ecranFin = (await etat()).ecran;
    t('PS-E52 la fenêtre Badges se FERME par ✕, par un tap à côté et par le bouton retour ; après chacune, ☰ rouvre le Menu avec sa ligne Badges, et l\'écran d\'en dessous n\'a pas changé',
      !f1 && m1 && l1.vis && ok2 && o2 && g2.n === g2.attendu && !f2 && m2 && ok3 && o3 && !f3 && ecranFin === e0.ecran,
      JSON.stringify({ f1, m1, l1vis: l1.vis, ok2, o2, n2: g2.n, f2, m2, ok3, o3, f3, ecran: [e0.ecran, ecranFin] }));
    /* ③ le point rouge : là avant, éteint après la première ouverture (R15 : posé à l'ouverture) */
    t('PS-E50 le point rouge « Badges » est sur la ligne du Menu avant ouverture et s\'éteint dès la première ouverture (marqueur « vu » posé)',
      l0.point && !l0.vu && !l1.point && l1.vu, JSON.stringify({ avant: l0, apres: l1 }));
    /* ④ ouvrir ne modifie rien ; le « + » central n'a pas bougé */
    await B.pg.evaluate(() => { try { closeMenuDrawer(); } catch (e) {} }); await B.pg.waitForTimeout(300);
    const e1 = await etat(), fab1 = await fab();
    const nouvelles = e1.cles.filter(k => e0.cles.indexOf(k) < 0 && !/^ft4_(seen_ft|menu_ack|sb_last)$/.test(k));   // seen_ft / menu_ack : le mécanisme EXISTANT des points rouges
    t('PS-E53 ⛔ ouvrir / fermer Badges ne modifie ni les badges (stockés et en mémoire) ni les séances, ne crée aucune clé, et le « + » central ne bouge pas (règle d\'or #9)',
      e1.badges === e0.badges && e1.mem === e0.mem && e1.sess === e0.sess && !nouvelles.length && !!fab0 && fab1 === fab0 && !B.errs.length,
      JSON.stringify({ badges: e1.badges === e0.badges, mem: e1.mem === e0.mem, sess: e1.sess === e0.sess, nouvelles, fab: [fab0, fab1], errs: B.errs.slice(0, 2) }));
    /* ⑤ PS-E51 — l'aide et le Guide disent « Menu », plus « onglet Badges de Progrès » */
    const txt = await B.pg.evaluate(() => {
      const tips = ((typeof _HELP_DATA !== 'undefined' && _HELP_DATA.progress && _HELP_DATA.progress.tips) || []).map(x => x.t).join('\n');
      /* toutes les aides « ? » (Accueil compris : sa carte des badges récents renvoyait à « l'onglet Badges dans Progrès ») */
      const toutes = (typeof _HELP_DATA !== 'undefined' ? Object.keys(_HELP_DATA) : []).map(k => ((_HELP_DATA[k] && _HELP_DATA[k].tips) || []).map(x => x.t).join('\n')).join('\n');
      const guide = (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).map(x => (x.t || '') + ' ' + (x.cap || '')).join('\n');
      return { tips, toutes, guide }; });
    const ancien = s => /quatre onglets|4 onglets|\| Badges|· Badges\b|onglet <b>Badges<\/b>|onglet Badges/i.test(s);
    t('PS-E51 les aides « ? » (toutes) et le Guide ne présentent plus Badges comme un onglet de Progrès, et l\'aide de Progrès comme le Guide disent où il est (le Menu)',
      txt.toutes.length > txt.tips.length && !ancien(txt.toutes) && !ancien(txt.guide) && /[Bb]adges[^\n]*Menu/.test(txt.tips) && /[Bb]adges<\/b>[^\n]*Menu/.test(txt.guide),
      JSON.stringify({ tips: (txt.tips.match(/.{0,50}[Bb]adges.{0,50}/) || [''])[0], guide: (txt.guide.match(/.{0,40}[Bb]adges<\/b>.{0,40}/) || [''])[0] }));
    await B.cx.close(); }

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

  /* ── 13 ter. B-PSI01-E — mois courant ABSENT : rien ne s'ouvre, rien n'est inventé (décision de Michel, 14/10) ── */
  { const sansMois = FIX.filter(s => s.date.slice(0, 7) !== MOIS_AUJ);
    const moisReels = [...new Set(sansMois.map(s => s.date.slice(0, 7)))];
    const Y = await ouvrir({ sessions: sansMois });
    await versProgres(Y);
    const h = await Y.pg.evaluate(m => ({
      onglet: (document.querySelector('#s-progress .nu-tabs .nu-tab.active') || {}).id || null,
      ans: [...document.querySelectorAll('#sess-list .sess-an')].map(a => ({ an: a.getAttribute('data-an'), ouvert: a.getAttribute('aria-expanded') })),
      mois: [...document.querySelectorAll('#sess-list .sess-mois')].map(x => x.getAttribute('data-mois')),
      ouverts: [...document.querySelectorAll('#sess-list .sess-mois[aria-expanded="true"]')].map(x => x.getAttribute('data-mois')),
      courant: !!document.querySelector('#sess-list [data-mois="' + m + '"]'),
      nCartes: document.querySelectorAll('#sess-list .sess-card').length }), MOIS_AUJ);
    const anCourant = h.ans.find(a => a.an === AN_AUJ);
    /* ⭐ Positif (micro-fermeture du 14/10) : l'historique est BIEN là — les années attendues, dans l'ordre, et les mois réels de
       l'année en cours, chacun avec son en-tête — sinon « rien d'ouvert, rien d'inventé » serait vrai d'une liste vide. */
    const ansAttendus = [...new Set(sansMois.map(s => s.date.slice(0, 4)))].sort().reverse();
    const moisAttendus = [...new Set(sansMois.filter(s => s.date.slice(0, 4) === AN_AUJ).map(s => s.date.slice(0, 7)))].sort().reverse();
    t('PS-E41 aucune séance ce mois-ci : Progrès s\'ouvre sur Séances, l\'historique est là (années, mois réels), AUCUN mois n\'est déplié, le mois courant n\'est pas inventé, aucune carte',
      sansMois.length === FIX.length - FIX.filter(s => s.date.slice(0, 7) === MOIS_AUJ).length && h.onglet === 'ptab-seances'
      && h.ans.length > 0 && h.ans.map(a => a.an).join(',') === ansAttendus.join(',') && h.mois.join(',') === moisAttendus.join(',')
      && !h.ouverts.length && !h.courant && !h.nCartes && h.mois.every(m => moisReels.indexOf(m) >= 0) && (!anCourant || anCourant.ouvert === 'true'),
      JSON.stringify(h).slice(0, 300));
    await Y.cx.close(); }

  /* ── 13 quater. B-PSI01-E — les 3 onglets tiennent sur UNE ligne, à 390 ET à 320 px (4 jusqu'à D-078) ───────── */
  { const Y = await ouvrir();
    await versProgres(Y);
    const mesurer = () => Y.pg.evaluate(() => {
      const bar = document.querySelector('#s-progress .nu-tabs'), tabs = [...document.querySelectorAll('#s-progress .nu-tabs .nu-tab')];
      const r = bar.getBoundingClientRect(), tops = tabs.map(x => Math.round(x.getBoundingClientRect().top));
      return { n: tabs.length, uneLigne: tops.every(x => Math.abs(x - tops[0]) <= 1), dedans: tabs.every(x => { const b = x.getBoundingClientRect(); return b.left >= r.left - 1 && b.right <= r.right + 1; }),
        barre: bar.scrollWidth <= bar.clientWidth + 1, page: document.documentElement.scrollWidth <= window.innerWidth + 1,
        texteEntier: tabs.every(x => x.scrollWidth <= x.clientWidth + 1), largeur: window.innerWidth,
        /* ⭐ micro-fermeture du 14/10 : une étiquette passée sur DEUX lignes garde le même haut d'onglet — on compte les lignes
           de son TEXTE (les points rouges, en position absolue, ne sont pas du texte). */
        lignes: tabs.map(x => { const tops = new Set(); [...x.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).forEach(n => {
          const r = document.createRange(); r.selectNodeContents(n); [...r.getClientRects()].forEach(q => tops.add(Math.round(q.top))); }); return tops.size; }) }; });
    const m390 = await mesurer();
    await Y.pg.setViewportSize({ width: 320, height: 700 }); await Y.pg.waitForTimeout(300);
    const m320 = await mesurer();
    const ok = m => m.n === 3 && m.uneLigne && m.dedans && m.barre && m.page && m.texteEntier && m.lignes.every(n => n === 1);
    t('PS-E43 Séances | Exercices | Corps & santé : une seule ligne, sans débordement ni texte coupé, à 390 px ET à 320 px',
      ok(m390) && ok(m320) && m390.largeur === 390 && m320.largeur === 320, JSON.stringify({ m390, m320 }));
    await Y.cx.close(); }

  /* ── 13 quinquies. B-PSI01-E — CALENDRIER → une séance ANCIENNE (au-delà des 20 dernières), par le VRAI geste ────
     App FRAÎCHE (contexte neuf : seuls l'année et le mois en cours sont dépliés) → flèche ‹ du calendrier jusqu'à son
     mois → son jour → « Revoir la séance » → Séances, sa carte visible, marquée, seule marquée, et à l'écran.
     ⚠️ Contexte neuf EXPRÈS : dans le parcours principal, tous les mois ont déjà été dépliés (PS-E11) ; la séance y
     serait visible même si la porte n'ouvrait pas son mois — la mutation M36 est passée au travers ainsi. */
  { const X = await ouvrir();
    const vieille = FIX[24];                                // 25ᵉ séance : seule de son jour, hors des 20 dernières
    const seuleDuJour = FIX.filter(s => s.date === vieille.date).length === 1;
    const d0 = new Date(jourParis(0) + 'T12:00:00'), d1 = new Date(vieille.date + 'T12:00:00');
    const recul = (d0.getFullYear() - d1.getFullYear()) * 12 + (d0.getMonth() - d1.getMonth());
    await clic(X.pg, '#nb-home'); await X.pg.waitForTimeout(300);
    await X.pg.evaluate(() => { try { _calZoom(null); } catch (e) {} });
    let fleches = 0;
    for (let k = 0; k < recul; k++) { if (await clic(X.pg, '#s-home button[onclick="_calArrow(-1)"]')) fleches++; }
    const okJ = await clic(X.pg, '#s-home [onclick="_calSelect(\'' + vieille.date + '\')"]');
    const okR = await clic(X.pg, '#s-home .ft-press[onclick^="goSessionsHistory(["]');
    await X.pg.waitForTimeout(700);
    const apres = await cartes(X.pg);
    const c = apres.filter(x => x.cible);
    const aEcran = await X.pg.evaluate(k => { const e = document.querySelector('#sess-list .sess-card[onclick="openSessDetail(' + k + ')"]'); if (!e) return null;
      const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight; }, cleDe(vieille));
    t('PS-E44 calendrier → ' + recul + ' mois en arrière → le jour d\'une séance hors des 20 dernières → « Revoir la séance » → Séances, CETTE carte visible, seule marquée, à l\'écran',
      seuleDuJour && FIX.indexOf(vieille) >= 20 && fleches === recul && okJ && okR && (await ongletActif(X.pg)) === 'ptab-seances'
      && c.length === 1 && c[0].cle === cleDe(vieille) && c[0].vis && aEcran === true,
      JSON.stringify({ recul, fleches, okJ, okR, c, aEcran }));
    await X.cx.close(); }


  /* ── 13 sexies. B-PSI01-E (micro-fermeture du 14/10) — LES PORTES, CHACUNE DANS UN CONTEXTE NEUF ──────────────────────
     L'état de départ est posé par de VRAIS gestes dans le témoin lui-même (jamais hérité d'un témoin précédent). */
  { const Y = await ouvrir();
    const nAujT = FIX.filter(s => s.date.slice(0, 7) === MOIS_AUJ).length;
    const J0b = jourParis(0), duJourB = FIX.filter(s => s.date === J0b).map(cleDe);
    const etatMois = () => Y.pg.evaluate(m => (document.querySelector('#sess-list .sess-mois[data-mois="' + m + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'), MOIS_AUJ);
    /* état DÉRANGÉ : mois en cours replié à la main, Progrès laissé sur Corps & santé */
    await versProgres(Y);
    await clic(Y.pg, '#sess-list .sess-mois[data-mois="' + MOIS_AUJ + '"]');
    const replie1 = await etatMois();
    await onglet(Y, 'ptab-poids');
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300);
    await Y.pg.evaluate(() => { try { if (typeof _ceMoisOuvert === 'function' && !_ceMoisOuvert() && typeof toggleCeMois === 'function') toggleCeMois(); } catch (e) {} });
    await Y.pg.waitForTimeout(200);
    const okTuile = await clic(Y.pg, '#s-home [onclick="goSessionsHistory()"]');
    await Y.pg.waitForTimeout(600);
    const apresTuile = await cartes(Y.pg);
    const ongTuile = await ongletActif(Y.pg), moisTuile = await etatMois();
    t('PS-E27 « Séances ce mois » (Accueil), depuis Corps & santé et le mois en cours REPLIÉ à la main → Séances, mois en cours rouvert, ses séances visibles',
      replie1 === 'false' && okTuile && ongTuile === 'ptab-seances' && moisTuile === 'true' && apresTuile.filter(c => c.mois === MOIS_AUJ && c.vis).length === nAujT,
      JSON.stringify({ replie1, okTuile, ongTuile, moisTuile, n: apresTuile.filter(c => c.mois === MOIS_AUJ && c.vis).length, nAujT }));
    /* PS-E46 — la porte du CALENDRIER gagne elle aussi sur un repli manuel */
    await clic(Y.pg, '#sess-list .sess-mois[data-mois="' + MOIS_AUJ + '"]');
    const replie2 = await etatMois();
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300);
    const okJ = await clic(Y.pg, '#s-home [onclick="_calSelect(\'' + J0b + '\')"]');
    const okR = await clic(Y.pg, '#s-home .ft-press[onclick^="goSessionsHistory(["]');
    await Y.pg.waitForTimeout(600);
    const apresCal = await cartes(Y.pg);
    const ciblesCal = apresCal.filter(c => c.cible).map(c => c.cle).sort();
    t('PS-E46 une porte ciblée gagne sur un repli manuel : mois en cours replié à la main → calendrier → « Revoir la séance » → mois rouvert, les séances du jour visibles et marquées',
      replie2 === 'false' && okJ && okR && (await etatMois()) === 'true' && ciblesCal.join(',') === duJourB.slice().sort().join(',') && apresCal.filter(c => c.cible && c.vis).length === duJourB.length,
      JSON.stringify({ replie2, okJ, okR, ciblesCal, duJourB }));
    await Y.cx.close(); }

  { const Z = await ouvrir();
    const seule = sDbf;                                       // séance seule de son jour, année précédente
    const anS = seule.date.slice(0, 4), moisS = seule.date.slice(0, 7);
    await versProgres(Z);
    const avantPorte = await Z.pg.evaluate(a => (document.querySelector('#sess-list .sess-an[data-an="' + a + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'), anS);
    await clic(Z.pg, '#nb-home'); await Z.pg.waitForTimeout(300);
    const okSeule = await Z.pg.evaluate(k => { try { goSessionsHistory([k]); return true; } catch (e) { return false; } }, cleDe(seule));
    await Z.pg.waitForTimeout(700);
    const apresSeule = await cartes(Z.pg);
    const cSeule = apresSeule.filter(c => c.cible);
    t('PS-E29 une cible = UNE séance (par sa clé), depuis une app fraîche où son année est REPLIÉE : son année et son mois s\'ouvrent, sa carte est visible et seule marquée',
      avantPorte === 'false' && okSeule && cSeule.length === 1 && cSeule[0].cle === cleDe(seule) && cSeule[0].mois === moisS && cSeule[0].vis, JSON.stringify({ avantPorte, cSeule }));
    /* PS-E48 — la marque bleue ne vit que pour la navigation qui l'a posée : une entrée normale l'efface */
    await clic(Z.pg, '#nb-home'); await Z.pg.waitForTimeout(300);
    await versProgres(Z);
    const marques = await Z.pg.evaluate(() => document.querySelectorAll('#sess-list .sess-card.sess-cible').length);
    const apresNormale = await cartes(Z.pg);
    t('PS-E48 la marque bleue ne survit pas à une entrée normale dans Progrès (aucune carte marquée), la séance reste atteignable',
      cSeule.length === 1 && marques === 0 && apresNormale.length > 0, JSON.stringify({ marques, n: apresNormale.length }));
    await Z.cx.close(); }

  /* ── 13 septies. B-PSI01-E — RELANCE : le repli d'un mois, la période 14 jours et le sous-onglet ne survivent pas ─── */
  { const R = await ouvrir();
    const clesAvant = await R.pg.evaluate(() => Object.keys(localStorage).sort());
    await versProgres(R);
    await clic(R.pg, '#sess-list .sess-mois[data-mois="' + MOIS_AUJ + '"]');
    await R.pg.evaluate(() => { const d = document.getElementById('prog-volume-acc'); if (d && !d.open) d.open = true; });
    await clic(R.pg, '#prog-volume-acc [data-vol-jours="14"]');
    const avant = await R.pg.evaluate(m => ({ mois: (document.querySelector('#sess-list .sess-mois[data-mois="' + m + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
      vol: (document.querySelector('#prog-volume-acc [data-vol-jours="14"]') || { getAttribute: () => null }).getAttribute('aria-pressed') }), MOIS_AUJ);
    await onglet(R, 'ptab-exo');
    const ongAvant = await ongletActif(R.pg);
    await R.pg.reload(); await R.pg.waitForTimeout(1500);
    await R.pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    await versProgres(R);
    await R.pg.evaluate(() => { const d = document.getElementById('prog-volume-acc'); if (d && !d.open) d.open = true; });
    const apres = await R.pg.evaluate(m => ({ onglet: (document.querySelector('#s-progress .nu-tabs .nu-tab.active') || {}).id || null,
      mois: (document.querySelector('#sess-list .sess-mois[data-mois="' + m + '"]') || { getAttribute: () => null }).getAttribute('aria-expanded'),
      vol28: (document.querySelector('#prog-volume-acc [data-vol-jours="28"]') || { getAttribute: () => null }).getAttribute('aria-pressed'),
      cles: Object.keys(localStorage).sort() }), MOIS_AUJ);
    const nouvelles = apres.cles.filter(k => clesAvant.indexOf(k) < 0 && !/^ft4_(seen_ft|progAcc|sb_last)$/.test(k));
    t('PS-E47 relance de l\'app : le repli du mois en cours, le choix « 14 jours » et le sous-onglet ne sont PAS gardés (Séances, mois en cours ouvert, 28 jours), et aucune clé de stockage nouvelle',
      avant.mois === 'false' && avant.vol === 'true' && ongAvant === 'ptab-exo' && apres.onglet === 'ptab-seances' && apres.mois === 'true' && apres.vol28 === 'true' && !nouvelles.length,
      JSON.stringify({ avant, ongAvant, apres: { onglet: apres.onglet, mois: apres.mois, vol28: apres.vol28 }, nouvelles }));
    await R.cx.close(); }

  /* ── 13 octies. D-079 / D-080 (15/10/2026 au soir, décisions de Michel) — FILTRE COMPACT, MULTI-SÉLECTION « OU »,
     « CE QUE TU TRAVAILLES » REPLIÉ AU LANCEMENT ─────────────────────────────────────────────────────────────────
     Fixture propre (6 séances, une par jour, aucune n'a un autre muscle « présent » que ceux listés ici — mesuré) :
     A = Développé Couché (pec) · B = Extension Triceps Poulie (triceps) · C = Squat (quads) · D = Curl (biceps) ·
     E = Développé Couché + Extension Triceps (pec ET triceps : la séance qui piège un filtre à doublons) · F = Rowing (dos).
     L'oracle est écrit ICI, à la main : Pectoraux = {A, E} · Triceps = {B, E} · Pectoraux OU Triceps = {A, B, E}. */
  { const mk = (off, noms) => { const date = jourParis(off), ts = Date.parse(date + 'T08:00:00Z');
      return { date, ts, id: ts, volume: 1000, duration: 3000, exs: noms.map(n => ({ name: n, sets: serie(50, 8, 3) })) }; };
    const FF = { A: mk(0, ['Développé Couché']), B: mk(-1, ['Extension Triceps Poulie']), C: mk(-2, ['Squat à la Barre']),
      D: mk(-3, ['Curl Biceps Haltères']), E: mk(-4, ['Développé Couché', 'Extension Triceps Poulie']), F: mk(-5, ['Rowing Barre (Tirage Horizontal)']) };
    const K = x => String(x.ts), TOUTES = Object.values(FF).map(K).sort();
    const att = (...l) => l.map(x => K(FF[x])).sort();
    const etatF = pg => pg.evaluate(() => { const a = document.getElementById('sess-filter-acc'), ch = [...document.querySelectorAll('#sess-filter .sessf-chip')];
      return { existe: !!a, cache: !!(a && a.hidden), ouvert: !!(a && a.open), resume: ((document.getElementById('sess-filter-resume') || {}).textContent || '').trim(),
        on: ch.filter(c => c.classList.contains('on')).map(c => c.dataset.m || 'tous'),
        presse: ch.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.m || 'tous'),
        /* ⚠️ `offsetParent` (et même la hauteur) voient encore une pastille dans un <details> FERMÉ sous Chromium : seule
           `checkVisibility()` dit ce que la personne voit (mesuré le 15/10, BUGS §74 — la mesure qui ne mesure pas). */
        pastillesVisibles: ch.filter(c => (c.checkVisibility ? c.checkVisibility() : c.offsetParent !== null)).length,
        listeHorsPanneau: !!(document.getElementById('sess-list') && !document.getElementById('sess-list').closest('#sess-filter-acc')) }; });
    const visibles = async Y => { await toutDeplier(Y); const c = (await cartes(Y.pg)).filter(x => x.vis).map(x => String(x.cle)); return c; };
    const panneau = Y => clic(Y.pg, '#sess-filter-acc > summary');
    const ouvrirPanneau = async Y => { if (!(await etatF(Y.pg)).ouvert) await panneau(Y); };
    const chip = (Y, m) => clic(Y.pg, '#sess-filter .sessf-chip[data-m="' + m + '"]');
    const tousChip = Y => clic(Y.pg, '#sess-filter .sessf-chip:not([data-m])');
    const RES = 'Filtrer les séances · ';

    const Y = await ouvrir({ sessions: Object.values(FF) });
    const clesAvant = await Y.pg.evaluate(() => Object.keys(localStorage).sort());
    await versProgres(Y);
    /* PS-E54 — à l'entrée, sans AUCUN tap : panneau fermé sur « Tous », pastilles invisibles, liste visible et hors du panneau */
    const e0 = await etatF(Y.pg);
    const vis0 = (await cartes(Y.pg)).filter(x => x.vis).length;
    t('PS-E54 à l\'entrée, sans aucun tap : « Filtrer les séances · Tous » est FERMÉ (aucune pastille visible) et la liste des séances est visible, hors du panneau',
      e0.existe && !e0.cache && !e0.ouvert && e0.resume === RES + 'Tous' && e0.pastillesVisibles === 0 && e0.listeHorsPanneau && vis0 > 0,
      JSON.stringify({ e0, vis0 }));
    /* PS-E56 / PS-E57 — Pectoraux puis Triceps : OU, sans doublon */
    await ouvrirPanneau(Y);
    const okP = await chip(Y, 'pec'), okT = await chip(Y, 'triceps');
    const e1 = await etatF(Y.pg), v1 = await visibles(Y);
    t('PS-E56 D-079 « OU » : Pectoraux + Triceps montre les séances qui travaillent l\'un OU l\'autre ({A, B, E}), résumé « Pectoraux + Triceps », les deux pastilles pressées et « Tous » relâché',
      okP && okT && JSON.stringify(v1.slice().sort()) === JSON.stringify(att('A', 'B', 'E')) && e1.resume === RES + 'Pectoraux + Triceps'
      && e1.on.slice().sort().join(',') === 'pec,triceps' && e1.presse.slice().sort().join(',') === 'pec,triceps', JSON.stringify({ okP, okT, v1, att: att('A', 'B', 'E'), e1 }));
    t('PS-E57 aucun doublon : la séance E (Pectoraux ET Triceps) n\'apparaît qu\'UNE fois, et le nombre de cartes = le nombre de séances distinctes',
      v1.filter(k => k === K(FF.E)).length === 1 && v1.length === new Set(v1).size && v1.length === 3, JSON.stringify(v1));
    /* PS-E58 — décocher : Triceps retiré → Pectoraux seul ; décocher la dernière → « Tous » */
    await chip(Y, 'triceps'); const e2 = await etatF(Y.pg), v2 = await visibles(Y);
    await chip(Y, 'pec'); const e3 = await etatF(Y.pg), v3 = await visibles(Y);
    t('PS-E58 décocher Triceps garde Pectoraux seul ({A, E}) ; décocher la DERNIÈRE zone revient à « Tous » (toutes les séances)',
      JSON.stringify(v2.slice().sort()) === JSON.stringify(att('A', 'E')) && e2.resume === RES + 'Pectoraux'
      && e3.on.join(',') === 'tous' && e3.resume === RES + 'Tous' && JSON.stringify(v3.slice().sort()) === JSON.stringify(TOUTES), JSON.stringify({ e2, v2, e3, n3: v3.length }));
    /* PS-E59 — trois zones puis « Tous » */
    await chip(Y, 'pec'); await chip(Y, 'triceps'); await chip(Y, 'biceps');
    const e4 = await etatF(Y.pg);
    await tousChip(Y); const e5 = await etatF(Y.pg), v5 = await visibles(Y);
    t('PS-E59 trois zones → résumé court « Pectoraux + 2 autres » ; « Tous » vide la sélection et réaffiche toutes les séances',
      e4.on.length === 3 && e4.resume === RES + 'Pectoraux + 2 autres' && e5.on.join(',') === 'tous' && e5.resume === RES + 'Tous'
      && JSON.stringify(v5.slice().sort()) === JSON.stringify(TOUTES), JSON.stringify({ e4, e5, n5: v5.length }));
    /* PS-E55 — une seule ligne, fermé, à 390 et à 320 px, y compris avec un résumé long */
    const ligne = () => Y.pg.evaluate(() => { const a = document.getElementById('sess-filter-acc'), s = a && a.querySelector('summary'), sp = document.getElementById('sess-filter-resume');
      if (!a || !s || !sp) return { absent: true };                    // ⛔ un panneau absent ROUGIT, il ne fait pas planter le banc
      const r = s.getBoundingClientRect(), l = document.getElementById('sess-list').getBoundingClientRect();
      const tops = new Set(); [...sp.childNodes].filter(n => n.nodeType === 3).forEach(n => { const g = document.createRange(); g.selectNodeContents(n); [...g.getClientRects()].forEach(q => tops.add(Math.round(q.top))); });
      return { largeur: innerWidth, ouvert: a.open, h: Math.round(r.height), lignesTexte: tops.size, deborde: s.scrollWidth > s.clientWidth + 1, page: document.documentElement.scrollWidth <= innerWidth + 1,
        ecart: Math.round(l.top - r.bottom), resume: sp.textContent }; });
    if ((await etatF(Y.pg)).ouvert) await panneau(Y);
    const m390 = await ligne();
    await Y.pg.setViewportSize({ width: 320, height: 700 }); await Y.pg.waitForTimeout(250);
    const m320 = await ligne();
    await ouvrirPanneau(Y); await chip(Y, 'pec'); await chip(Y, 'triceps'); await chip(Y, 'quads'); await panneau(Y);
    const m320long = await ligne();
    const uneLigne = m => !m.absent && !m.ouvert && m.h <= 46 && m.lignesTexte === 1 && !m.deborde && m.page && m.ecart >= 0 && m.ecart < 40;
    t('PS-E55 fermé, le filtre tient sur UNE ligne, sans débordement, la liste juste dessous — à 390 px, à 320 px, et à 320 px avec trois zones choisies',
      uneLigne(m390) && uneLigne(m320) && uneLigne(m320long) && m390.largeur === 390 && m320.largeur === 320 && /\+ 2 autres/.test(m320long.resume),
      JSON.stringify({ m390, m320, m320long }));
    await Y.pg.setViewportSize({ width: 390, height: 844 }); await Y.pg.waitForTimeout(200);
    /* PS-E60 — la tuile « Séances ce mois » (Accueil) remet une multi-sélection à « Tous » */
    await ouvrirPanneau(Y); await chip(Y, 'quads'); await chip(Y, 'biceps');     // il reste Pectoraux + Triceps + Quadriceps → on retire Quads, ajoute Biceps
    const avantTuile = await etatF(Y.pg);
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300);
    await Y.pg.evaluate(() => { try { if (typeof _ceMoisOuvert === 'function' && !_ceMoisOuvert() && typeof toggleCeMois === 'function') toggleCeMois(); } catch (e) {} });
    const okTuile = await clic(Y.pg, '#s-home [onclick="goSessionsHistory()"]'); await Y.pg.waitForTimeout(600);
    const apTuile = await etatF(Y.pg);
    t('PS-E60 Accueil « Séances ce mois », depuis une multi-sélection (Pectoraux + Triceps + Biceps) → le filtre revient sur « Tous »',
      avantTuile.on.length === 3 && okTuile && apTuile.on.join(',') === 'tous' && apTuile.resume === RES + 'Tous', JSON.stringify({ avantTuile: avantTuile.on, okTuile, apTuile }));
    /* PS-E61 — le calendrier (« Revoir la séance ») remet le filtre à « Tous » : la séance A (Pectoraux) était CACHÉE par « Triceps » */
    await ouvrirPanneau(Y); await chip(Y, 'triceps');
    const avantCal = await etatF(Y.pg), cacheeAvant = (await visibles(Y)).indexOf(K(FF.A)) < 0;
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300);
    const okJ = await clic(Y.pg, '#s-home [onclick="_calSelect(\'' + FF.A.date + '\')"]');
    const okR = await clic(Y.pg, '#s-home .ft-press[onclick^="goSessionsHistory(["]'); await Y.pg.waitForTimeout(700);
    const apCal = await etatF(Y.pg), cA = (await cartes(Y.pg)).find(x => String(x.cle) === K(FF.A)) || {};
    t('PS-E61 calendrier → « Revoir la séance » depuis un filtre qui la cachait (Triceps) → filtre sur « Tous », la séance visible et marquée',
      avantCal.on.join(',') === 'triceps' && cacheeAvant && okJ && okR && apCal.on.join(',') === 'tous' && apCal.resume === RES + 'Tous' && cA.vis && cA.cible,
      JSON.stringify({ avantCal: avantCal.on, cacheeAvant, okJ, okR, apCal: apCal.on, cA }));
    /* PS-E64 — « Ce que tu travailles » ouvert : il le RESTE pendant la session (Accueil ↔ Progrès, Exercices ↔ Séances), et refermé il le reste */
    const volOuvert = () => Y.pg.evaluate(() => !!document.getElementById('prog-volume-acc').open);
    await versProgres(Y); await onglet(Y, 'ptab-seances');
    const v0 = await volOuvert();
    await clic(Y.pg, '#prog-volume-acc > summary'); await Y.pg.waitForTimeout(250);
    const vOuv = await volOuvert();
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300); await versProgres(Y);
    const vApresAccueil = await volOuvert();
    await onglet(Y, 'ptab-exo'); await onglet(Y, 'ptab-seances');
    const vApresOnglet = await volOuvert();
    await clic(Y.pg, '#prog-volume-acc > summary'); await Y.pg.waitForTimeout(250);
    await clic(Y.pg, '#nb-home'); await Y.pg.waitForTimeout(300); await versProgres(Y);
    const vRefermeGarde = await volOuvert();
    t('PS-E64 D-080 : « Ce que tu travailles » replié à l\'entrée ; ouvert, il RESTE ouvert pendant la session (Accueil ↔ Progrès, Exercices ↔ Séances) ; refermé, il reste fermé',
      v0 === false && vOuv === true && vApresAccueil === true && vApresOnglet === true && vRefermeGarde === false,
      JSON.stringify({ v0, vOuv, vApresAccueil, vApresOnglet, vRefermeGarde }));
    /* PS-E63 / PS-E62 — relancement : volume REPLIÉ, filtre sur « Tous », et rien n'a été écrit pour l'un ou l'autre */
    await clic(Y.pg, '#prog-volume-acc > summary'); await Y.pg.waitForTimeout(250);        // ouvert juste avant le relancement
    await ouvrirPanneau(Y); await chip(Y, 'pec'); await chip(Y, 'biceps');
    const avantReload = { vol: await volOuvert(), f: (await etatF(Y.pg)).on, cle: await Y.pg.evaluate(() => localStorage.getItem('ft4_progAcc')) };
    await Y.pg.reload(); await Y.pg.waitForTimeout(1500);
    await Y.pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    await versProgres(Y);
    const apresReload = { vol: await volOuvert(), e: await etatF(Y.pg), n: (await visibles(Y)).length, cle: await Y.pg.evaluate(() => localStorage.getItem('ft4_progAcc')) };
    t('PS-E63 D-080 : ouvert avant le relancement, « Ce que tu travailles » repart REPLIÉ après, et `ft4_progAcc` ne l\'a jamais retenu',
      avantReload.vol === true && apresReload.vol === false && !/prog-volume-acc/.test(String(avantReload.cle)) && !/prog-volume-acc/.test(String(apresReload.cle)),
      JSON.stringify({ avantReload, apresReload: { vol: apresReload.vol, cle: apresReload.cle } }));
    const clesApres = await Y.pg.evaluate(() => Object.keys(localStorage).sort());
    const nouvellesCles = clesApres.filter(k => clesAvant.indexOf(k) < 0 && !/^ft4_(seen_ft|progAcc|sb_last|menu_ack)$/.test(k));
    t('PS-E62 D-079 : le filtre n\'est gardé qu\'en MÉMOIRE — après relancement « Tous », panneau fermé, toutes les séances ; aucune clé nouvelle de tout ce parcours',
      avantReload.f.length === 2 && apresReload.e.on.join(',') === 'tous' && apresReload.e.resume === RES + 'Tous' && !apresReload.e.ouvert && apresReload.n === TOUTES.length && !nouvellesCles.length
      && !Y.errs.length, JSON.stringify({ avant: avantReload.f, apres: apresReload.e.on, n: apresReload.n, nouvellesCles, errs: Y.errs.slice(0, 2) }));
    await Y.cx.close(); }

  /* PS-E65 / PS-E66 — « Ce que ton histoire montre » GARDE sa mémoire ; une ancienne valeur de `ft4_progAcc` qui cite encore le
     volume (tous les utilisateurs qui l'avaient ouvert avant D-080) ne le rouvre plus. */
  { const Z = await ouvrir({ stock: { ft4_progAcc: JSON.stringify(['prog-synth-acc', 'prog-volume-acc']) } });
    await versProgres(Z);
    const e66 = await Z.pg.evaluate(() => ({ synth: document.getElementById('prog-synth-acc').open, vol: document.getElementById('prog-volume-acc').open }));
    t('PS-E66 une ANCIENNE valeur `ft4_progAcc` qui cite le volume : la synthèse s\'ouvre comme avant, « Ce que tu travailles » reste REPLIÉ',
      e66.synth === true && e66.vol === false, JSON.stringify(e66));
    await clic(Z.pg, '#prog-synth-acc > summary'); await Z.pg.waitForTimeout(250);           // on la REPLIE
    await Z.pg.reload(); await Z.pg.waitForTimeout(1500);
    await Z.pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    await versProgres(Z);
    const ferme = await Z.pg.evaluate(() => ({ synth: document.getElementById('prog-synth-acc').open, cle: localStorage.getItem('ft4_progAcc') }));
    await clic(Z.pg, '#prog-synth-acc > summary'); await Z.pg.waitForTimeout(250);           // on la ROUVRE
    await Z.pg.reload(); await Z.pg.waitForTimeout(1500);
    await Z.pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
    await versProgres(Z);
    const ouv = await Z.pg.evaluate(() => ({ synth: document.getElementById('prog-synth-acc').open, cle: localStorage.getItem('ft4_progAcc') }));
    t('PS-E65 « Ce que ton histoire montre » garde sa mémoire d\'un lancement à l\'autre (repliée → repliée, ouverte → ouverte), dans `ft4_progAcc`',
      ferme.synth === false && ouv.synth === true && /prog-synth-acc/.test(String(ouv.cle)) && !/prog-synth-acc/.test(String(ferme.cle)), JSON.stringify({ ferme, ouv }));
    /* PS-E68 — les aides disent le nouveau geste (règle d'or #11, points 3 à 5 ; pas de pop-up) */
    const aides = await Z.pg.evaluate(() => {
      const tips = ((typeof _HELP_DATA !== 'undefined' && _HELP_DATA.progress && _HELP_DATA.progress.tips) || []).map(x => x.t).join('\n');
      const h = (typeof _DRAWER_CONTENT !== 'undefined' && _DRAWER_CONTENT.help) ? (typeof _DRAWER_CONTENT.help.html === 'function' ? _DRAWER_CONTENT.help.html() : _DRAWER_CONTENT.help.html) : '';
      const guide = (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).map(x => (x.t || '') + ' ' + (x.cap || '')).join('\n');
      return { tips, h: String(h), guide }; });
    t('PS-E68 aide « ? » de Progrès, aide détaillée et Guide disent « Filtrer les séances », plusieurs muscles, et que le volume repart replié — plus « tape un groupe » ni « l\'app retient ton choix »',
      [aides.tips, aides.h, aides.guide].every(x => /Filtrer les séances/.test(x) && /un ou plusieurs/.test(x))
      && /repliée à chaque lancement/.test(aides.tips) && /repliée à chaque lancement/.test(aides.h)
      && !/tape un groupe musculaire/.test(aides.tips) && !/l\\'app retient ton choix|l'app retient ton choix/.test(aides.tips),
      JSON.stringify({ tips: /Filtrer les séances/.test(aides.tips), h: /Filtrer les séances/.test(aides.h), guide: /Filtrer les séances/.test(aides.guide) }));
    await Z.cx.close(); }

  /* ── 13. Bandeau de cycle : comportement actuel préservé (statu quo, non tranché) ──────────── */
  X = await ouvrir({ stock: { ft4_gender: 'F', ft4_mcstart: jourParis(-3) } });
  await versProgres(X); await onglet(X, 'ptab-exo');
  const ban = await X.pg.evaluate(() => { const e = document.getElementById('prog-cycle-banner'); return { vis: !!(e && e.offsetParent), dansExo: !!(e && e.closest('#prog-exo')), txt: e ? e.textContent.trim().slice(0, 60) : '' }; });
  t('PS-E38 le bandeau de cycle reste dans Exercices et s\'affiche comme avant (statu quo jusqu\'à décision)', ban.vis && ban.dansExo && /Jour/.test(ban.txt), JSON.stringify(ban));
  await X.cx.close();

  /* ── 14. PS-E49 — la pop-up de la publication ATTEINT la personne (règle d'or #11). Quelqu'un qui a vu toutes les
     nouveautés de la production d'avant (ft-v1254 : WHATS_NEW_MAX = 76, donc ft4_wn_seen = '76') la reçoit au
     démarrage, par le vrai mécanisme (checkAnnouncements → showWhatsNew), sans rien toucher. ⛔ « 76 » est l'état RÉEL
     des utilisateurs à la publication, pas un nombre de commodité : une annonce numérotée sous 76 ne leur parviendrait
     jamais. ── */
  X = await ouvrir({ stock: { ft4_wn_seen: '76' }, garderOverlays: true });
  await X.pg.waitForTimeout(800);
  const wn = await X.pg.evaluate(() => { const ov = document.getElementById('ov-whatsnew');
    const it = (typeof _wnItems !== 'undefined' && _wnItems) || [];
    return { ouvert: !!(ov && ov.classList.contains('open')), titres: it.map(f => f.v + ':' + f.t),
      premier: !!(ov && it[0] && ov.textContent.indexOf(it[0].t) >= 0) }; });
  t('PS-E49 au démarrage (vu jusqu\'à v76, état de ft-v1254) la pop-up « Quoi de neuf » s\'ouvre et porte « Progrès : Séances d\'abord »',
    wn.ouvert && wn.premier && wn.titres.some(x => /Progrès : Séances d'abord/.test(x)), JSON.stringify(wn));
  await X.cx.close();
};
