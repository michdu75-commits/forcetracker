/* ═════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧹 SCFD — LOT D DE FERMETURE (Claude N°2, 17/11/2026) : D-173, le PALIER ISOLÉ d'un dropset se supprime (arbitrage de Michel).
   Blocs : B-SCFD-P (source) · B-SCFD-E (écran : premier / milieu / dernier palier, pointé / non pointé, PDC / lest, RIR, superset, ancien format, déplacement, reprise, « Modifier paliers »).

   D-173 (Michel, 16/11) : « supprimer précisément la série choisie » — le lot 3 laissait les PALIERS d'un dropset verrouillés (🔒, « le nombre de paliers fait loi »). Arbitrage du 17/11 : le palier isolé se supprime AUSSI,
   et le réglage (`ex.dropset.paliers`) SUIT — jamais « 3 paliers » sur 2 lignes (ce qui ferait basculer la 1ʳᵉ série normale en « palier » : `_dropDebut` se recalcule depuis ce nombre).
   Conservés : ordre, charges, reps, PDC / lest / assistance, identités, les AUTRES paliers et séries, repos, RIR, pointage, commentaires ; confirmation pour un élément déjà validé ; ni le programme d'origine ni l'historique.
   ⛔ LE DERNIER PALIER RESTANT n'est PAS supprimé : ce que deviendrait un dropset sans palier (série normale ? dropset retiré ?) n'est pas décidé — la ligne reste verrouillée, la feuille le DIT, rien n'est perdu
   (décision de Michel à venir ; « ⚙️ Modifier paliers » et « ✕ Retirer dropset » existent déjà).
   CONDUIT : vrai Chromium mobile (390×844 dpr 2, 375×667), la vraie app servie en local, de vrais boutons de la feuille ; données ENTIÈREMENT FICTIVES (valeurs atypiques), 0 appel réel.
   OBSERVE : `S.wkt`, le disque (`ft4_wkt`), `S.programmes` / `S.sessions`, le DOM de la feuille et de l'exercice, `_pdcAtt`, `_rirCible` / `_rirPending`, le rectangle du bouton central.
   NE COUVRE PAS ⛔ : Safari iOS (Chromium n'est pas un iPhone), le geste réel d'un doigt sur la feuille, la sémantique du dernier palier (volontairement non décidée). Banc : tools/banc_seance_cf_d.js · contrôle négatif : tools/mut_seance_cf_d.py
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const js = (x) => JSON.stringify(x).slice(0, 420);
const J = (o) => JSON.stringify(o);
/* ft-v1269 (S2) : `S.wkt.vue` (rang + nom de l'exercice OUVERT) est une VUE rangée dans la séance en cours pour la reprise, pas une donnée d'entraînement : « séance et disque inchangés » compare tout le reste. */
const sansVue = (o) => { if (!o || typeof o !== 'object') return o; const c = JSON.parse(JSON.stringify(o)); delete c.vue; return c; };
const FIC = 'Zorglub inversé à la poulie', PERSO = 'Exo perso Zéta';              // FICTIF (absent du catalogue) · PERSONNALISÉ (S.customExercises)
const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_devtoken: 'f'.repeat(64),
  ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: moisPrec };
const PROGS = () => [{ id: 'p1', name: 'Push fictif', exs: [{ name: 'Développé Couché', sets: [{ kg: 0, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }] }] }];
const SESS = () => [{ id: 1760349600000, ts: 1760349600000, date: '2026-10-13', synced: true, volume: 2900, progLabel: 'Push', exs: [{ name: 'Développé Couché', sets: [{ kg: 90, reps: 8, done: true, type: 'N', rm1: 112 }] }] }];
let _mk = 0;
/* une série marquée : `mk` = son IDENTITÉ de test, `note` / `rest` / `sid` = des champs que seule la série porte */
const SR = (kg, reps, done, type, extra) => Object.assign({ mk: 'm' + (++_mk), sid: 'sid-' + _mk, kg, reps, done: !!done, type: type || 'N', rm1: done ? Math.round(kg * (1 + reps / 30)) : 0, note: 'n' + _mk, rest: 60 + _mk },
  done ? { at: 100 + _mk, rir: 2, rirV: 2 } : {}, extra || {});
const exo = (name, sets, extra) => Object.assign({ name, sets }, extra || {});
const DROP = (paliers, dir) => ({ paliers, pct: 10, direction: dir || 'down' });
const sans = (arr, i) => arr.filter((_, k) => k !== i);
const DS3 = () => [SR(63, 8, true), SR(57, 8, false), SR(51, 8, false), SR(46, 8, false)];     // 1 série normale pointée + 3 PALIERS
const nu = (c) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');   // le code SANS ses commentaires (un commentaire qui cite l'ancien défaut ne le remet pas)
const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? src.length : j); };

/* ══════════════════════════════════════ SOURCE ══════════════════════════════════════ */
function pur(t, ROOT, fs, path) {
  console.log('\n═══ B-SCFD-P (source). D-173 : le palier isolé se supprime, le réglage suit ═══');
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const log = lire('log.js'), runner = lire('tests/parcours/runner.js'), rep = lire('tests/parcours/repartition-3.json');
  t('B-SCFD-P1 ⛔⛔ UN SEUL propriétaire de la règle « ce palier est-il supprimable ? » (`_serieSupprimable`) : un palier n\'est refusé que s\'il est le DERNIER restant (`_nbPaliers(ex)>=2`) ; la feuille et la suppression la LISENT (R2)',
    /const ok=k=>!_estPalierDrop\(ex,k\)\|\|_nbPaliers\(ex\)>=2;/.test(corps(log, '_serieSupprimable')) && /_serieSupprimable\(ex,si\)/.test(corps(log, 'openSerieSuppr')) && /_serieSupprimable\(ex,k\)/.test(corps(log, 'supprimerSerie')));
  t('B-SCFD-P2 ⛔⛔ le retrait d\'un palier RECALE le réglage (`ex.dropset.paliers`), calculé AVANT le retrait, dans la même fonction que la suppression — pas de 2ᵉ chemin',
    /if\(_estPalierDrop\(ex,k\)\) ex\.dropset\.paliers=_nbPaliers\(ex\)-1;\s*\/\/[^\n]*\n\s*ex\.sets\.splice\(k,1\);/.test(corps(log, 'supprimerSerie')));
  t('B-SCFD-P3 le nombre de paliers a UN calculateur (`_nbPaliers`, via `_dropDebut`) — aucune copie du calcul dans la feuille', /function _nbPaliers\(ex\)\{ return \(ex&&ex\.dropset&&Array\.isArray\(ex\.sets\)\)\?ex\.sets\.length-_dropDebut\(ex\):0; \}/.test(log) && !/ex\.sets\.length-_dropDebut/.test(corps(log, 'openSerieSuppr')));
  t('B-SCFD-P4 la feuille DIT pourquoi le dernier palier reste (« Dernier palier du dropset … rien n\'est supprimé ») et renvoie vers les deux réglages qui existent déjà', /Dernier palier du dropset : le retirer laisserait un dropset sans palier, rien n'est supprimé\. « ⚙️ Modifier paliers » ou « ✕ Retirer dropset »/.test(corps(log, 'openSerieSuppr')));
  t('B-SCFD-P5 une série pointée demande confirmation, palier compris (« Supprimer le palier N ? ») — une seule fonction, le même `showConfirm`', /showConfirm\(\(_estPalierDrop\(ex,si\)\?'Supprimer le palier ':'Supprimer la série '\)\+\(si\+1\)\+' \?'/.test(corps(log, 'supprimerSerie')));
  t('B-SCFD-P6 le banc est ENREGISTRÉ pour la passe : joué par le runner (source · écran) et rangé dans la répartition en 3 processus',
    /require\('\.\/seance_cf_d\.js'\)\.pur\(/.test(runner) && /require\('\.\/seance_cf_d\.js'\)\.ecran\(/.test(runner) && /"\.\/seance_cf_d\.js"\s*:\s*[012]/.test(rep));
  /* ── LOT Z (18/11/2026) : les ZÉROS INVENTÉS. Blocs B-SCFD-ZP (source) · B-SCFD-ZE (écran) : une charge inconnue reste inconnue, un zéro écrit reste 0, rien n'est fabriqué sans source. ── */
  t('B-SCFD-ZP1 ⛔⛔ `_serieDepuis` : SANS source, la charge est INCONNUE (`kg:null`) — le `def.kg` d\'un appelant (`kg:0`) n\'est JAMAIS lu (contre-sonde 5 : il fabriquait un « 0 écrit »)',
    /const n=pp\?\{kg:_kgConnu\(pp\.kg\)\?pp\.kg:null,reps:pp\.reps\}:\{kg:null,reps:def&&def\.reps\};/.test(nu(corps(log, '_serieDepuis'))) && !/def\.kg|:def;/.test(nu(corps(log, '_serieDepuis'))));
  t('B-SCFD-ZP2 ⛔⛔ `removeDropset` et `applyDropset` ne fabriquent plus de zéro : plus de `kg||0` (ni `a.kg||b.kg||0`, où un zéro écrit passait derrière l\'historique) — la base se lit par `_kgConnu` (les cinq états d\'une charge)',
    !/\.kg\|\|/.test(nu(corps(log, 'removeDropset'))) && !/\.kg\|\|[^\n]*\|\|0|\bbaseKg=[^\n]*\|\|0|inconnue/.test(nu(corps(log, 'applyDropset'))) && /_kgConnu\(s\.kg\)/.test(nu(corps(log, 'applyDropset'))) && /_kgConnu\(s0\.kg\)/.test(nu(corps(log, 'removeDropset'))));
  t('B-SCFD-ZP3 ⭐ UN SEUL propriétaire de « le PDC / lest / assistance et « à vide » se recopient tels quels » (`_pdcVideDe`, R2) : lu par `_serieDepuis`, les paliers d\'un dropset et le clone de `addToGroup` — aucune copie de l\'expression',
    ['_serieDepuis', 'applyDropset', 'addToGroup'].every((f) => /_pdcVideDe\(/.test(corps(log, f))) && (log.match(/pp\.vide&&!\(\+pp\.kg>0\)/g) || []).length === 1);
  t('B-SCFD-ZP4 ⭐ les chemins qui CRÉENT une série sans source n\'écrivent plus `kg:0` : superset (`_doAddToGroup`), éditeur de programme (`_addProgSet`), chargement d\'un programme, carte « type de séance » (`lancerTypeSeance`), générateur (`_s3`)',
    !/kg:0/.test(nu(corps(log, '_doAddToGroup'))) && !/\(l\.kg\|\|0\)/.test(nu(corps(log, '_addProgSet'))) && !/s\.kg\|\|0/.test(nu(corps(log, '_exsDeProgramme'))) && !/kg:0,reps:x\.reps/.test(nu(corps(log, 'lancerTypeSeance'))) && !/_s3=\(reps\)=>\[\{kg:0/.test(log));
}

/* ══════════════════════════════════════ ÉCRAN ══════════════════════════════════════ */
async function ecran(t, b, PORT) {
  const SEUL = (process.env.SCFD_SEUL || '').split(',').filter(Boolean);
  const garde = async (nom, f) => { if (SEUL.length && SEUL.indexOf(nom) < 0) return; try { await f(); } catch (e) { t('B-SCFD-' + nom + ' ⛔ le scénario s\'est exécuté jusqu\'au bout', false, String(e && e.stack || e).slice(0, 500)); } };
  console.log('\n═══ B-SCFD-E (écran conduit). D-173 : palier isolé · pointé / non pointé · PDC · RIR · superset · ancien format · déplacement · reprise · « Modifier paliers » ═══');
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris' });
    await cx.route((u) => !/^http:\/\/localhost:/.test(String(u)), (rt) => rt.abort());
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(SESS()), ft4_progs: JSON.stringify(PROGS()), ft4_cuex: JSON.stringify([{ n: PERSO, g: 'Pectoraux', eq: 'Haltères', c: 'custom' }]) });
    if (opts.wkt !== undefined) { init.ft4_wkt = JSON.stringify(opts.wkt); init.ft4_wkt_draft = JSON.stringify(opts.wkt); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_scfd'))return; sessionStorage.setItem('_scfd','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', (x) => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open'));
      const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none';
      const tt = today(), pm = new Date(Date.UTC(+tt.slice(0, 4), +tt.slice(5, 7) - 2, 15));     // le piège du lundi et du mois : les bilans automatiques recouvriraient l'écran
      S.lastWeekSummary = tt; S.lastMonthSummary = pm.getUTCFullYear() + '-' + String(pm.getUTCMonth() + 1).padStart(2, '0');
      if (S.wkt && S.wkt.date === '__TODAY__') S.wkt.date = tt; persist();
      goScreen('log', document.getElementById('nb-log')); });
    await pg.waitForTimeout(350);
    return { cx, pg, errs, W, H };
  };
  const wkt = (exs, extra) => Object.assign({ date: '__TODAY__', startHour: 10, startTs: Date.now() - 600000, exs }, extra || {});
  const etat = (X) => X.pg.evaluate(() => ({ wkt: S.wkt ? JSON.parse(JSON.stringify(S.wkt)) : null, progs: JSON.parse(JSON.stringify(S.programmes || S.progs || [])), sess: JSON.parse(JSON.stringify(S.sessions || [])),
    disque: JSON.parse(localStorage.getItem('ft4_wkt') || 'null'), pdcAtt: typeof _pdcAtt === 'undefined' ? 'ABSENT' : (_pdcAtt ? JSON.parse(JSON.stringify(_pdcAtt)) : null),
    rirCible: typeof _rirCible === 'undefined' ? 'ABSENT' : JSON.parse(JSON.stringify(_rirCible)), rirPending: typeof _rirPending === 'undefined' ? 'ABSENT' : JSON.parse(JSON.stringify(_rirPending)) }));
  const fab = (X) => X.pg.evaluate(() => { const r = document.getElementById('nb-log').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(','); });
  const confirmOuvert = (X) => X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); });
  const ouvrirExo = async (X, ei) => { await X.pg.evaluate((ei) => { _expandedEx = ei; renderExBlocks(); }, ei); await X.pg.waitForTimeout(150); };
  const menu = async (X, ei) => { await ouvrirExo(X, ei);
    const ok = await X.pg.evaluate((ei) => { const bt = [...document.querySelectorAll('#ex-block-' + ei + ' .ex-hdr button')].filter((e) => (e.textContent || '').trim() === '⋯').pop(); if (!bt) return false; bt.click(); return true; }, ei);
    await X.pg.waitForTimeout(150); return ok; };
  const ouvrirFeuille = async (X, ei) => { if (!await menu(X, ei)) return false;
    const ok = await X.pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-ex-menu button')].find((e) => /Supprimer une série/.test(e.textContent)); if (!bt) return false; bt.click(); return true; });
    await X.pg.waitForTimeout(150); return ok; };
  const feuille = (X) => X.pg.evaluate(() => { const o = document.getElementById('ov-ex-menu'); if (!o) return null;
    return { boutons: [...o.querySelectorAll('button[onclick^="supprimerSerie("]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), cliquables: [...o.querySelectorAll('button[onclick^="supprimerSerie("]')].map((e) => +/supprimerSerie\(\d+,(\d+)\)/.exec(e.getAttribute('onclick'))[1]),
      verrouilles: [...o.querySelectorAll('div[style*="opacity:.55"]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), texte: (o.innerText || '').replace(/\s+/g, ' ') }; });
  const toucher = async (X, ei, si) => { const ok = await X.pg.evaluate(([ei, si]) => { const bt = document.querySelector('#ov-ex-menu button[onclick="supprimerSerie(' + ei + ',' + si + ')"]'); if (!bt) return false; bt.click(); return true; }, [ei, si]);
    await X.pg.waitForTimeout(220); return ok; };
  const confirmer = async (X, oui) => { await X.pg.evaluate((oui) => { document.getElementById(oui ? 'confirm-ok' : 'confirm-cancel').click(); }, !!oui); await X.pg.waitForTimeout(220); };
  const coh = (X, ei) => X.pg.evaluate((ei) => { const ex = S.wkt.exs[ei]; return !!ex.dropset && ex.sets.length - _dropDebut(ex) === ex.dropset.paliers; }, ei);   // le réglage dit le VRAI nombre de paliers
  const lignesDom = (X, ei) => X.pg.evaluate((ei) => [...document.querySelectorAll('#ex-block-' + ei + ' .set-row')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()), ei);

  /* ── B-SCFD-E1 · premier / milieu / dernier palier (3 paliers derrière une série normale pointée) ── */
  await garde('E1', async () => {
    for (const [nom, k] of [['PREMIER palier (n°2, la « charge de départ »)', 1], ['palier du MILIEU (n°3)', 2], ['DERNIER palier en position (n°4)', 3]]) {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', DS3(), { dropset: DROP(3) }), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])]) });
      const av = await etat(X); const f0 = await fab(X);
      const ok = await ouvrirFeuille(X, 0); const f = ok ? await feuille(X) : null; const fm = await fab(X);
      t('B-SCFD-E1a ⭐ ' + nom + ' : la feuille propose les 4 lignes (la normale et les 3 paliers, qui se disent « Palier »), aucune n\'est verrouillée',
        ok && !!f && J(f.cliquables) === J([0, 1, 2, 3]) && f.verrouilles.length === 0 && !/Dernier palier/.test(f.texte) && /^2\s*Palier/.test(f.boutons[1]) && /^4\s*Palier/.test(f.boutons[3]) && /^1\s*Normal/.test(f.boutons[0]), js(f));
      await toucher(X, 0, k);                                                                                        // un palier NON pointé : part tout de suite
      const ap = await etat(X); const rows = await lignesDom(X, 0);
      t('B-SCFD-E1b ⭐⭐ ' + nom + ' : CE palier part et lui seul (aucune confirmation) ; les autres séries sont les MÊMES objets dans le même ordre (identités `sid`, charges, reps, repos, notes, RIR, pointage) ; le programme et l\'historique sont intacts',
        !(await confirmOuvert(X)) && ap.wkt.exs[0].sets.length === 3 && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, k)) && J(ap.wkt.exs[1]) === J(av.wkt.exs[1]) && J(ap.progs) === J(av.progs) && J(ap.sess) === J(av.sess), J(ap.wkt.exs[0].sets.map((s) => s.mk)));
      t('B-SCFD-E1c ⭐⭐ ' + nom + ' : le RÉGLAGE suit (3 → 2 paliers, pourcentage et sens conservés) et dit le vrai nombre — la série normale reste une série normale (`_dropDebut` = 1)',
        J(ap.wkt.exs[0].dropset) === J(DROP(2)) && await coh(X, 0) && await X.pg.evaluate(() => _dropDebut(S.wkt.exs[0]) === 1 && !_estPalierDrop(S.wkt.exs[0], 0) && _estPalierDrop(S.wkt.exs[0], 1) && _estPalierDrop(S.wkt.exs[0], 2)), J(ap.wkt.exs[0].dropset));
      t('B-SCFD-E1d l\'écran est redessiné de façon cohérente : 3 lignes dans l\'exercice, la 1ʳᵉ ligne de la chaîne s\'appelle « Charge de départ », la suppression est sur le disque (zéro perte), aucune erreur de page',
        rows.length === 3 && /Charge de départ/.test(rows[1]) && /Drop/.test(rows[2]) && ap.disque && J(ap.disque.exs[0].sets.map((s) => s.mk)) === J(ap.wkt.exs[0].sets.map((s) => s.mk)) && X.errs.length === 0, js(rows) + ' ' + X.errs.slice(0, 2).join(' | '));
      t('B-SCFD-E1e ⭐ règle d\'or #9 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après)', f0 === fm && f0 === await fab(X), f0 + ' | ' + fm + ' | ' + await fab(X));
      await X.cx.close();
    }
  });

  /* ── B-SCFD-E2 · pointé : confirmation, annulation, confirmation acceptée ── */
  await garde('E2', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(63, 8, true), SR(57, 8, true), SR(51, 8, false), SR(46, 8, false)], { dropset: DROP(3) })]) });
    const av = await etat(X);
    await ouvrirFeuille(X, 0); await toucher(X, 0, 1);                                                               // le palier n°2, DÉJÀ pointé
    const conf = await X.pg.evaluate(() => ({ ouv: document.getElementById('ov-confirm').classList.contains('open'), titre: document.getElementById('confirm-title').textContent }));
    const pend = await etat(X);
    await confirmer(X, false); const ann = await etat(X);
    t('B-SCFD-E2a ⭐ un palier DÉJÀ POINTÉ demande confirmation (« Supprimer le palier 2 ? ») ; tant qu\'on n\'a pas confirmé, rien ne change ; « Annuler » ne touche à rien (séance, réglage, disque)',
      conf.ouv && /Supprimer le palier 2/.test(conf.titre) && J(pend.wkt) === J(av.wkt) && J(ann.wkt) === J(av.wkt) && J(ann.disque) === J(av.disque), js(conf));
    await ouvrirFeuille(X, 0); await toucher(X, 0, 1); await confirmer(X, true);
    const fin = await etat(X);
    t('B-SCFD-E2b ⭐ confirmé : CE palier pointé part et lui seul (son pointage part avec lui, pas celui de la voisine) ; le réglage suit (3 → 2) ; reste cohérent',
      fin.wkt.exs[0].sets.length === 3 && J(fin.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && J(fin.wkt.exs[0].dropset) === J(DROP(2)) && fin.wkt.exs[0].sets[0].done === true && fin.wkt.exs[0].sets[1].done === false && await coh(X, 0), J(fin.wkt.exs[0].sets.map((s) => s.mk + (s.done ? '✓' : ''))));
    t('B-SCFD-E2c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  });

  /* ── B-SCFD-E3 · le DERNIER palier restant : verrouillé, dit, rien ne se perd ── */
  await garde('E3', async () => {
    for (const [nom, fait] of [['non pointé', false], ['POINTÉ', true]]) {
      const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(63, 8, true), SR(57, 8, fait)], { dropset: DROP(1) }), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])]) });
      const av = await etat(X); const f0 = await fab(X);
      const ok = await ouvrirFeuille(X, 0); const f = ok ? await feuille(X) : null; const fm = await fab(X);
      t('B-SCFD-E3a ⭐⭐ dropset [normale, UN palier ' + nom + '] : le palier est la ligne verrouillée (non cliquable, « Palier · 8 × 57 kg ») et la feuille DIT précisément pourquoi (« Dernier palier … rien n\'est supprimé », « Modifier paliers » / « Retirer dropset »)',
        ok && !!f && J(f.cliquables) === J([0]) && f.verrouilles.length === 1 && /^2\s*Palier · 8 × 57 kg/.test(f.verrouilles[0]) && /Dernier palier du dropset/.test(f.texte) && /rien n'est supprimé/.test(f.texte) && /Modifier paliers/.test(f.texte) && /Retirer dropset/.test(f.texte), js(f));
      await X.pg.evaluate(() => { closeExMenu(); supprimerSerie(0, 1); });
      const ap = await etat(X);
      t('B-SCFD-E3b ⭐⭐ la fonction REFUSE de retirer le dernier palier restant : aucune confirmation, séance, réglage et disque inchangés — les données sont conservées (aucune suppression implicite)',
        !(await confirmOuvert(X)) && J(sansVue(ap.wkt)) === J(sansVue(av.wkt)) && J(sansVue(ap.disque)) === J(sansVue(av.disque)) && J(ap.wkt.exs[0].dropset) === J(DROP(1)), '');   // ft-v1269 : ouvrir la feuille de l'exercice change l'exercice OUVERT, donc `S.wkt.vue` — une vue, jamais une donnée d'entraînement
      t('B-SCFD-E3c ⭐ règle d\'or #9 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après)', f0 === fm && f0 === await fab(X), f0 + ' | ' + fm + ' | ' + await fab(X));
      await X.cx.close();
    }
    // on arrive au dernier palier PAR les suppressions : 3 paliers → 2 → 1, puis le dernier est refusé
    const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(63, 8, false), SR(57, 8, false), SR(51, 8, false)], { dropset: DROP(3) })]) });
    const av = await etat(X);
    await X.pg.evaluate(() => { supprimerSerie(0, 1); supprimerSerie(0, 1); });                                    // il reste [palier 1]
    const a1 = await etat(X);
    await X.pg.evaluate(() => { supprimerSerie(0, 0); });
    const a2 = await etat(X);
    t('B-SCFD-E3d ⭐ un dropset qui n\'est QUE paliers : 3 → 2 → 1 (le réglage suit à chaque pas), puis plus rien ne part (jamais la dernière série restante)',
      J(a1.wkt.exs[0].sets) === J([av.wkt.exs[0].sets[0]]) && J(a1.wkt.exs[0].dropset) === J(DROP(1)) && J(a2.wkt) === J(a1.wkt), J(a1.wkt.exs[0].dropset));
    await X.cx.close();
  });

  /* ── B-SCFD-E4 · PDC / lest / assistance / zéro : les autres paliers gardent leur sens ── */
  await garde('E4', async () => {
    const PDC = () => [SR(0, 8, true, 'N', { pdc: 17.5 }), SR(0, 8, false, 'N', { pdc: 34 }), SR(0, 8, false, 'N', { pdc: 0 }), SR(46, 8, false), SR(0, 8, false, 'N', { pdc: -57 })];   // normale à lest · paliers : lest · zéro écrit · kilos · assistance
    {
      const X = await ouvrir({ wkt: wkt([exo('Tractions', PDC(), { dropset: DROP(4) })]) });
      await X.pg.evaluate(() => { setPdcMode(0, 3, '+'); });                                                       // « lest » choisi sur le palier n°4 (kilos), montant pas encore tapé
      const av = await etat(X);                                                                                    // l'état de DÉPART est pris après ce choix (il pose un PDC 0 sur ce palier, comme dans l'app)
      await X.pg.evaluate(() => { supprimerSerie(0, 1); });                                                          // on supprime le palier n°2 (lest +34), AU-DESSUS
      const ap = await etat(X);
      t('B-SCFD-E4a ⭐⭐ dropset au poids du corps : le palier n°2 (lest +34) part ; les autres gardent leur sens EXACT (lest +17,5 · zéro écrit · palier à PDC posé · assistance −57) ; aucune série ne gagne ni ne perd de PDC à cause de la suppression ; le réglage suit (4 → 3)',
        J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && ap.wkt.exs[0].sets[0].pdc === 17.5 && ap.wkt.exs[0].sets[1].pdc === 0 && ap.wkt.exs[0].sets[2].pdc === 0 && ap.wkt.exs[0].sets[3].pdc === -57 && J(ap.wkt.exs[0].dropset) === J(DROP(3)) && await coh(X, 0), js(ap.wkt.exs[0].sets.map((s) => s.pdc)));
      t('B-SCFD-E4b ⭐⭐ le sens PDC EN ATTENTE (« lest » sur le palier n°4) SUIT sa série quand un palier AU-DESSUS part (index 3 → 2, sens conservé) : le montant tapé va à LA BONNE série, pas à sa voisine',
        J(av.pdcAtt) === J({ ei: 0, si: 3, sg: '+' }) && J(ap.pdcAtt) === J({ ei: 0, si: 2, sg: '+' }) && await X.pg.evaluate(() => { _pdcSaisie(0, 2, '12'); const s = S.wkt.exs[0].sets; return s[2].pdc === 12 && s[1].pdc === 0 && s[3].pdc === -57; }), js(ap.pdcAtt));
      t('B-SCFD-E4c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    {
      const X = await ouvrir({ wkt: wkt([exo('Tractions', PDC(), { dropset: DROP(4) })]) });
      await X.pg.evaluate(() => { setPdcMode(0, 3, '+'); });
      await X.pg.evaluate(() => { supprimerSerie(0, 3); });                                                          // on supprime LE palier dont le sens était en attente
      const ap = await etat(X);
      t('B-SCFD-E4d ⭐ le sens PDC en attente sur le palier SUPPRIMÉ disparaît avec lui (la voisine qui prend son index n\'hérite pas d\'un sens attendu)', ap.pdcAtt === null && ap.wkt.exs[0].sets.length === 4 && ap.wkt.exs[0].sets[3].pdc === -57, js(ap.pdcAtt));
      await X.cx.close();
    }
    {   // assistance sur le palier supprimé, lest ailleurs : le tonnage et le record de lest ne bougent pas pour les séries restantes (aucun poids de corps automatique)
      const X = await ouvrir({ wkt: wkt([exo('Dips', [SR(0, 8, true, 'N', { pdc: 17.5 }), SR(0, 6, true, 'N', { pdc: 34 }), SR(0, 5, true, 'N', { pdc: -57 })], { dropset: DROP(2) })]) });
      const av = await etat(X);
      await ouvrirFeuille(X, 0); await toucher(X, 0, 2); await confirmer(X, true);                                  // le palier n°3 (assistance −57), pointé
      const ap = await etat(X);
      t('B-SCFD-E4e ⭐ palier d\'ASSISTANCE pointé supprimé (confirmé) : les séries à lest gardent exactement leur PDC, leur 1RM et leurs reps ; aucune charge ni PDC n\'apparaît sur la voisine ; la séance enregistrée plus tôt est intacte',
        ap.wkt.exs[0].sets.length === 2 && J(ap.wkt.exs[0].sets) === J(av.wkt.exs[0].sets.slice(0, 2)) && J(ap.wkt.exs[0].dropset) === J(DROP(1)) && J(ap.sess) === J(av.sess), js(ap.wkt.exs[0].sets.map((s) => s.pdc)));
      await X.cx.close();
    }
  });

  /* ── B-SCFD-E5 · la question du RIR en cours suit sa série ── */
  await garde('E5', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', DS3(), { dropset: DROP(3) })]) });
    await X.pg.evaluate(() => { _rirCible = { ei: 0, si: 3 }; _rirPending = [{ ei: 0, si: 2 }, { ei: 0, si: 3 }]; });
    await X.pg.evaluate(() => { supprimerSerie(0, 1); });                                                            // un palier AU-DESSUS part
    const a1 = await etat(X);
    await X.pg.evaluate(() => { supprimerSerie(0, 2); });                                                            // puis LE palier visé par la question (n°4 → devenu n°3)
    const a2 = await etat(X);
    t('B-SCFD-E5a ⭐ la question du RIR (cible et file d\'attente) SUIT sa série quand un palier AU-DESSUS part (index recalés), et DISPARAÎT avec la série quand c\'est la sienne qui part (rien n\'est affecté à la voisine)',
      J(a1.rirCible) === J({ ei: 0, si: 2 }) && J(a1.rirPending) === J([{ ei: 0, si: 1 }, { ei: 0, si: 2 }]) && a2.rirCible === null && J(a2.rirPending) === J([{ ei: 0, si: 1 }]), js([a1.rirCible, a1.rirPending, a2.rirCible, a2.rirPending]));
    await X.cx.close();
  });

  /* ── B-SCFD-E6 · déplacement et reprise de séance ── */
  await garde('E6', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', DS3(), { dropset: DROP(3) }), exo('Tractions', [SR(0, 8, false), SR(0, 8, false)])]) });
    await X.pg.evaluate(() => { moveExBlock(0, 1); });                                                               // le dropset passe en 2ᵉ position
    await X.pg.waitForTimeout(150);
    const av = await etat(X);
    t('B-SCFD-E6a le dropset est bien en 2ᵉ position avant la suppression (le test se tient sur l\'indice déplacé)', av.wkt.exs[1].name === 'Développé Couché' && !!av.wkt.exs[1].dropset && av.wkt.exs[0].name === 'Tractions', js(av.wkt.exs.map((e) => e.name)));
    await ouvrirFeuille(X, 1); await toucher(X, 1, 2);                                                               // le palier du milieu, dans l'exercice DÉPLACÉ
    const ap = await etat(X);
    t('B-SCFD-E6b ⭐ après déplacement : la suppression vise le bon exercice et le bon palier ; l\'autre exercice, l\'ordre et le réglage sont conservés',
      J(ap.wkt.exs[1].sets) === J(sans(av.wkt.exs[1].sets, 2)) && J(ap.wkt.exs[0]) === J(av.wkt.exs[0]) && J(ap.wkt.exs[1].dropset) === J(DROP(2)) && await coh(X, 1), js(ap.wkt.exs.map((e) => e.name)));
    await X.pg.reload({ waitUntil: 'load' }); await X.pg.waitForTimeout(1600);
    const re = await etat(X);
    t('B-SCFD-E6c ⭐ REPRISE : la page rechargée retrouve la séance SANS le palier supprimé (mêmes objets, même ordre, même réglage, cohérent)',
      !!re.wkt && J(re.wkt.exs.map((e) => e.sets.map((s) => s.mk))) === J(ap.wkt.exs.map((e) => e.sets.map((s) => s.mk))) && J(re.wkt.exs[1].dropset) === J(DROP(2)) && await coh(X, 1), js(re.wkt && re.wkt.exs.map((e) => e.sets.map((s) => s.mk))));
    t('B-SCFD-E6d la séance reprise se poursuit : on valide les paliers restants, le dernier palier devient la série en cours, aucune erreur',
      await X.pg.evaluate(() => { try { _expandedEx = 1; for (let k = 0; k < S.wkt.exs[1].sets.length; k++) if (!S.wkt.exs[1].sets[k].done) { toggleSet(1, k); stopRest(); } return S.wkt.exs[1].sets.every((s) => s.done); } catch (e) { return false; } }) && X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  });

  /* ── B-SCFD-E7 · superset : le lien et les autres exercices ne bougent pas ── */
  await garde('E7', async () => {
    const g = 'g-scfd';
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(60, 10, true), SR(60, 10, false)], { group: g, groupType: 'super' }), exo(FIC, [SR(0, 12, false), SR(0, 12, false)], { group: g, groupType: 'super' }),
      exo('Squat', DS3(), { dropset: DROP(3) })]) });
    await X.pg.evaluate(() => { setPdcMode(1, 1, '+'); });
    const av = await etat(X);
    await ouvrirFeuille(X, 2); await toucher(X, 2, 2);
    const ap = await etat(X);
    t('B-SCFD-E7 ⭐ superset puis dropset : le palier du DROPSET (3ᵉ exercice) part ; les deux exercices du superset et leur LIEN (group, groupType) sont intacts ; la sélection PDC en attente de l\'exercice 1 ne bouge pas',
      J(ap.wkt.exs[2].sets) === J(sans(av.wkt.exs[2].sets, 2)) && J(ap.wkt.exs[0]) === J(av.wkt.exs[0]) && J(ap.wkt.exs[1]) === J(av.wkt.exs[1]) && ap.wkt.exs[1].group === g && ap.wkt.exs[0].groupType === 'super' && J(ap.wkt.exs[2].dropset) === J(DROP(2)) && J(ap.pdcAtt) === J({ ei: 1, si: 1, sg: '+' }), js(ap.pdcAtt));
    await X.cx.close();
  });

  /* ── B-SCFD-E8 · « ⚙️ Modifier paliers » reste cohérent après une suppression (le réglage dit le vrai nombre) ── */
  await garde('E8', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Développé Couché', [SR(63, 8, true), SR(57, 8, true), SR(51, 8, false), SR(46, 8, false)], { dropset: DROP(3) })]) });
    await ouvrirFeuille(X, 0); await toucher(X, 0, 3);                                                               // le dernier palier (non pointé) part : 3 → 2 paliers, la normale ✓ reste une série normale
    const a1 = await etat(X);
    t('B-SCFD-E8a après la suppression, la série normale pointée est TOUJOURS une série normale (si le réglage était resté à 3 sur 2 paliers, elle basculerait en « palier »)',
      J(a1.wkt.exs[0].dropset) === J(DROP(2)) && await X.pg.evaluate(() => _dropDebut(S.wkt.exs[0]) === 1 && !_estPalierDrop(S.wkt.exs[0], 0)), J(a1.wkt.exs[0].dropset));
    await X.pg.evaluate(() => { _dropCfgEi = 0; _dropCfgPaliers = 2; _dropCfgPct = 10; _dropCfgDir = 'down'; applyDropset(); });   // « Modifier paliers » : 2 nouveaux paliers derrière le palier déjà fait
    const a2 = await etat(X);
    t('B-SCFD-E8b ⭐ « ⚙️ Modifier paliers » (2 nouveaux paliers après le palier fait) reste COHÉRENT : le passé est intact et à sa place (mêmes objets), le réglage dit 3 paliers = les 3 dernières lignes',
      a2.wkt.exs[0].sets.length === 4 && J(a2.wkt.exs[0].sets.slice(0, 2)) === J(a1.wkt.exs[0].sets.slice(0, 2)) && a2.wkt.exs[0].dropset.paliers === 3 && await coh(X, 0) && await X.pg.evaluate(() => _dropDebut(S.wkt.exs[0]) === 1), js(a2.wkt.exs[0].dropset));
    await X.cx.close();
  });

  /* ── B-SCFD-E9 · ancien format (pas de `paliers`, toutes les séries sont des paliers) ── */
  await garde('E9', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(63, 8, false), SR(57, 8, false), SR(51, 8, false)], { dropset: { pct: 10, direction: 'down' } })]) });
    const av = await etat(X);
    t('B-SCFD-E9a ancien format (aucun `paliers` écrit) : les 3 lignes sont des paliers et se suppriment ; la 1ʳᵉ n\'est pas protégée', await ouvrirFeuille(X, 0) && J((await feuille(X)).cliquables) === J([0, 1, 2]), '');
    await toucher(X, 0, 1);
    const ap = await etat(X);
    t('B-SCFD-E9b ⭐ ancien format : le palier du milieu part ; le réglage est (re)posé au vrai nombre (2) sans changer pourcentage ni sens ; les autres séries sont les mêmes objets',
      J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 1)) && ap.wkt.exs[0].dropset.paliers === 2 && ap.wkt.exs[0].dropset.pct === 10 && ap.wkt.exs[0].dropset.direction === 'down' && await coh(X, 0), js(ap.wkt.exs[0].dropset));
    await X.cx.close();
  });

  /* ── B-SCFD-E10 · une pyramide (sens « up ») : même règle ── */
  await garde('E10', async () => {
    const X = await ouvrir({ wkt: wkt([exo('Squat', [SR(63, 8, false), SR(69, 6, false), SR(76, 4, false)], { dropset: DROP(3, 'up') })]) });
    const av = await etat(X);
    await ouvrirFeuille(X, 0); await toucher(X, 0, 0);
    const ap = await etat(X);
    t('B-SCFD-E10 pyramide (sens « up »), tout est palier : le 1ᵉʳ palier part, la pyramide garde son sens et son pourcentage, le réglage suit (3 → 2)', J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 0)) && J(ap.wkt.exs[0].dropset) === J(DROP(2, 'up')) && await coh(X, 0), js(ap.wkt.exs[0].dropset));
    await X.cx.close();
  });

  /* ── B-SCFD-E11 · des FAMILLES d'exercices, un exercice PERSONNALISÉ et un exercice FICTIF : aucun nom codé en dur ── */
  await garde('E11', async () => {
    for (const [fam, nom] of [['catalogue — jambes', 'Squat'], ['catalogue — tirage', 'Tractions'], ['catalogue — isolation', 'Curl Biceps Haltères'], ['PERSONNALISÉ (S.customExercises)', PERSO], ['FICTIF inédit, absent du catalogue', FIC]]) {
      const X = await ouvrir({ wkt: wkt([exo(nom, DS3(), { dropset: DROP(3) })]) });
      const av = await etat(X); const ok = await ouvrirFeuille(X, 0); await toucher(X, 0, 2); const ap = await etat(X);
      t('B-SCFD-E11 ⭐ ' + fam + ' « ' + nom + ' » : le palier du MILIEU part, les autres séries sont identiques, le réglage suit (3 → 2)', ok && J(ap.wkt.exs[0].sets) === J(sans(av.wkt.exs[0].sets, 2)) && J(ap.wkt.exs[0].dropset) === J(DROP(2)) && J(ap.sess) === J(av.sess), '');
      await X.cx.close();
    }
    const X = await ouvrir({ wkt: null });
    const r = await X.pg.evaluate(() => { const src = [window._nbPaliers, window._estPalierDrop, window._serieSupprimable, window.openSerieSuppr, window.supprimerSerie].map((f) => (typeof f === 'function' ? f.toString() : '')).join('\n').toLowerCase();
      const noms = (typeof EXLIB !== 'undefined' ? EXLIB : []).map((e) => String(e.n || '').toLowerCase()).filter((n) => n.length >= 5);
      return { n: noms.length, trouves: noms.filter((n) => src.indexOf(n) >= 0).slice(0, 5), longueur: src.length }; });
    t('B-SCFD-E11b ⭐ GÉNÉRIQUE : aucun nom du catalogue dans le code de la suppression (palier compris)', r.n > 100 && r.trouves.length === 0 && r.longueur > 800, js(r));
    await X.cx.close();
  });

  /* ── B-SCFD-E12 · 375×667 : le bouton central ne bouge pas non plus ── */
  await garde('E12', async () => {
    const X = await ouvrir({ w: 375, h: 667, wkt: wkt([exo('Squat', DS3(), { dropset: DROP(3) })]) });
    const f0 = await fab(X); await ouvrirFeuille(X, 0); const fm = await fab(X); await toucher(X, 0, 2); const fa = await fab(X);
    t('B-SCFD-E12 ⭐ règle d\'or #9 sur 375×667 : le bouton central « + » ne bouge pas (avant · feuille ouverte · après suppression d\'un palier)', f0 === fm && f0 === fa && X.errs.length === 0, f0 + ' | ' + fm + ' | ' + fa);
    await X.cx.close();
  });

  /* ═════════ LOT Z (18/11/2026) — B-SCFD-ZE : LES ZÉROS INVENTÉS. Une charge inconnue (`null`) reste inconnue, un zéro écrit reste 0 (jamais écrasé par l'historique : `0||x`), PDC / lest / assistance / « à vide » se copient tels quels,
     et SANS source admissible on n'invente rien. Fonctions RÉELLES de l'app dans la vraie page (données fictives : « Développé Couché » a une séance LIBRE à 90 ; FIC et PERSO n'ont aucune histoire). ═════════ */
  const kgs = (ex) => ex.sets.map((s) => s.kg);
  const prep = (X, exs) => X.pg.evaluate((exs) => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 600000, exs }; _exPickerMode = 'workout'; return true; }, exs);

  /* ── B-SCFD-ZE1 · « ✕ Retirer dropset » (le vrai bouton) : la série qui reste est la 1ʳᵉ TELLE QU'ELLE EST ── */
  await garde('ZE1', async () => {
    const CAS = [['charge INCONNUE (null)', { kg: null }, { kg: null }], ['ZÉRO écrit', { kg: 0 }, { kg: 0 }], ['une valeur (57)', { kg: 57 }, { kg: 57 }], ['charge ABSENTE (jamais renseignée)', {}, { kg: null }],
      ['PDC + lest 17', { kg: 0, pdc: 17 }, { kg: 0, pdc: 17 }], ['assistance −34', { kg: 0, pdc: -34 }, { kg: 0, pdc: -34 }], ['PDC seul', { kg: 0, pdc: 0 }, { kg: 0, pdc: 0 }], ['« à vide »', { kg: 0, vide: true }, { kg: 0, vide: true }]];
    for (const [nom, ent, att] of CAS) {
      const X = await ouvrir({ wkt: wkt([exo(FIC, [Object.assign({ reps: 8, done: false, type: 'N' }, ent), SR(46, 8, false)], { dropset: DROP(2) })]) });
      await ouvrirExo(X, 0); const f0 = await fab(X);
      const clic = await X.pg.evaluate(() => { const bt = document.querySelector('#s-log button[onclick="removeDropset(0)"]'); if (!bt) return false; bt.click(); return true; });
      await X.pg.waitForTimeout(200); const ap = await etat(X); const s = (ap.wkt.exs[0].sets || [])[0] || {};
      t('B-SCFD-ZE1a ⭐⭐ « Retirer dropset » sans palier fait · ' + nom + ' : la série qui reste garde EXACTEMENT son état (kg ' + J(att.kg) + (att.pdc !== undefined ? ', PDC ' + att.pdc : '') + (att.vide ? ', à vide' : '') + '), jamais un zéro fabriqué ; plus de dropset ; reps 8',
        clic && ap.wkt.exs[0].sets.length === 1 && s.kg === att.kg && s.pdc === att.pdc && s.vide === att.vide && s.reps === 8 && s.done === false && !ap.wkt.exs[0].dropset && ap.disque && ap.disque.exs[0].sets[0].kg === att.kg && X.errs.length === 0 && f0 === await fab(X), js(s) + ' ' + X.errs.slice(0, 2).join(' | '));
      await X.cx.close();
    }
    const X = await ouvrir({ wkt: wkt([exo(FIC, [SR(63, 8, true), SR(null, 8, false), SR(0, 8, false)], { dropset: DROP(2) })]) });
    const av = await etat(X); await X.pg.evaluate(() => removeDropset(0)); const ap = await etat(X);
    t('B-SCFD-ZE1b ⭐ « Retirer dropset » APRÈS une série faite (CC-01) : le passé est intact (même objet, même charge) et seule la suite non faite part — ni zéro ni valeur ajoutés', ap.wkt.exs[0].sets.length === 1 && J(ap.wkt.exs[0].sets[0]) === J(av.wkt.exs[0].sets[0]) && !ap.wkt.exs[0].dropset, js(ap.wkt.exs[0].sets));
    await X.cx.close();
  });

  /* ── B-SCFD-ZE2 · applyDropset (la vraie fonction) : zéro écrit · inconnu · valeur · prescription · sans source · PDC / à vide · dernier palier protégé ── */
  await garde('ZE2', async () => {
    const X = await ouvrir({ wkt: null });
    const drop = (ex, n, sans) => X.pg.evaluate(([ex, n]) => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 600000, exs: [ex] }; _dropCfgEi = 0; _dropCfgPaliers = n; _dropCfgPct = 10; _dropCfgDir = 'down'; applyDropset(); return JSON.parse(JSON.stringify(S.wkt.exs[0])); }, [ex, n]);
    const B = (kg, extra) => Object.assign({ kg, reps: 8, done: false, type: 'N' }, extra || {});
    const base = (n, sets, extra) => Object.assign({ name: n, sets, dropset: DROP(1) }, extra || {});
    const HIST = 'Développé Couché';                                                                                   // séance LIBRE à 90 : une source ADMISSIBLE
    let r;
    r = await drop(base(HIST, [B(0)]), 3);
    t('B-SCFD-ZE2a ⭐⭐ un ZÉRO ÉCRIT (série n°1) l\'emporte sur l\'historique admissible (90) : paliers [0,0,0] (avant : `0||90` → 90, 80, 72,5)', J(kgs(r)) === J([0, 0, 0]), J(kgs(r)));
    r = await drop(base(HIST, [B(null)]), 3);
    t('B-SCFD-ZE2b ⭐ départ INCONNU + historique ADMISSIBLE (90) : c\'est la source admissible qui fait la base (90, 80, 72,5)', J(kgs(r)) === J([90, 80, 72.5]), J(kgs(r)));
    r = await drop(base(FIC, [B(null)]), 3);
    t('B-SCFD-ZE2c ⭐⭐ départ INCONNU, AUCUNE source : les paliers restent INCONNUS ([null,null,null]) — on n\'invente rien', J(kgs(r)) === J([null, null, null]), J(kgs(r)));
    r = await drop(base(FIC, [{ reps: 8, done: false, type: 'N' }]), 3);
    t('B-SCFD-ZE2d ⭐⭐ charge ABSENTE de la série, aucune source : paliers inconnus (avant : [0,0,0], trois zéros inventés)', J(kgs(r)) === J([null, null, null]), J(kgs(r)));
    r = await drop(base(HIST, [B(57, { rest: 77, note: 'n-prescrite' })]), 3);
    t('B-SCFD-ZE2e ⭐ une valeur SAISIE / prescrite (57) fait la base, même avec un historique à 90 : [57, 52,5, 47,5] ; les répétitions prescrites sont gardées', J(kgs(r)) === J([57, 52.5, 47.5]) && r.sets.every((s) => s.reps === 8), J(kgs(r)));
    r = await drop(base(FIC, [B(0, { pdc: 17 })]), 3);
    t('B-SCFD-ZE2f ⭐⭐ PDC + lest (17) : chaque palier le garde TEL QUEL (kg reste 0, aucun pourcentage appliqué à un lest)', J(r.sets.map((s) => [s.kg, s.pdc])) === J([[0, 17], [0, 17], [0, 17]]), J(r.sets.map((s) => [s.kg, s.pdc])));
    r = await drop(base(FIC, [B(0, { pdc: -34 })]), 2);
    t('B-SCFD-ZE2g ⭐ assistance (−34) : chaque palier la garde telle quelle', J(r.sets.map((s) => [s.kg, s.pdc])) === J([[0, -34], [0, -34]]), J(r.sets.map((s) => [s.kg, s.pdc])));
    r = await drop(base(FIC, [B(0, { vide: true })]), 3);
    t('B-SCFD-ZE2h ⭐ barre « à vide » : chaque palier reste « à vide » (kg 0 + `vide`), jamais « inconnu » ni une charge', J(r.sets.map((s) => [s.kg, s.vide])) === J([[0, true], [0, true], [0, true]]), J(r.sets.map((s) => [s.kg, s.vide])));
    r = await drop(base(FIC, [B(63, { done: true }), B(null)], { dropset: undefined }), 3);
    t('B-SCFD-ZE2i ⭐ une série FAITE (63) puis une prochaine INCONNUE : la base est la dernière faite (63, 57,5, 52,5) ; la série faite est intacte', J(kgs(r)) === J([63, 63, 57.5, 52.5]) && r.sets[0].done === true, J(kgs(r)));
    r = await drop(base(FIC, [B(63, { done: true }), B(0)], { dropset: undefined }), 3);
    t('B-SCFD-ZE2j ⭐⭐ une série faite (63) puis une prochaine ÉCRITE à 0 : le zéro écrit est conservé (paliers [0,0,0]), il ne cède pas la place à la valeur d\'avant', J(kgs(r).slice(1)) === J([0, 0, 0]), J(kgs(r)));
    r = await drop(base(FIC, [B(null, { done: true }), B(null)], { dropset: undefined }), 2);
    t('B-SCFD-ZE2k ⭐ une série faite à charge INCONNUE (champ laissé vide) : les paliers suivants restent inconnus (jamais 0)', J(kgs(r).slice(1)) === J([null, null]), J(kgs(r)));
    r = await drop(base(FIC, [B(63, { done: true }), B(57, { done: true })], { dropset: DROP(1) }), 2);
    t('B-SCFD-ZE2l ⭐ « Modifier paliers » après un palier fait : la suite repart de la dernière charge FAITE (57 → 52,5 → 47,5) ; le passé est intact', J(kgs(r)) === J([63, 57, 52.5, 47.5]), J(kgs(r)));
    r = await drop(base(FIC, [B(null)]), 1);
    const dernier = await X.pg.evaluate(() => { const ex = S.wkt.exs[0], av = JSON.stringify(ex.sets); const ok = _serieSupprimable(ex, 0); supprimerSerie(0, 0); return { ok, intact: JSON.stringify(S.wkt.exs[0].sets) === av, n: S.wkt.exs[0].sets.length, paliers: S.wkt.exs[0].dropset.paliers }; });
    t('B-SCFD-ZE2m ⭐⭐ le DERNIER palier reste PROTÉGÉ (D-173) : un dropset à 1 palier créé par `applyDropset` ne laisse pas retirer son dernier palier — rien ne part, rien ne se perd', dernier.ok === false && dernier.intact && dernier.n === 1 && dernier.paliers === 1, js(dernier));
    await X.cx.close();
  });

  /* ── B-SCFD-ZE3 · AJOUTS sans source admissible : une charge inconnue (jamais 0) ; avec source : la valeur ; copie de la série voisine : son état ── */
  await garde('ZE3', async () => {
    const X = await ouvrir({ wkt: null });
    const R = await X.pg.evaluate(([FIC, PERSO]) => {
      const o = {}, K = (ex) => ex.sets.map((s) => s.kg), neuf = (exs) => { S.wkt = { date: today(), startHour: 10, startTs: Date.now() - 600000, exs: exs || [] }; _exPickerMode = 'workout'; };
      neuf(); addExercise(FIC); o.addFic = K(S.wkt.exs[0]);
      neuf(); addExercise(PERSO); o.addPerso = K(S.wkt.exs[0]);
      neuf(); addExercise('Développé Couché'); o.addAvecSource = K(S.wkt.exs[0]);
      neuf([{ name: FIC, sets: [] }]); addSet(0); o.setVide = K(S.wkt.exs[0]);
      neuf([{ name: FIC, sets: [{ kg: null, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setInconnue = K(S.wkt.exs[0]);
      neuf([{ name: FIC, sets: [{ kg: 0, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setZero = K(S.wkt.exs[0]);
      neuf([{ name: FIC, sets: [{ kg: 63, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setValeur = K(S.wkt.exs[0]);
      neuf([{ name: FIC, sets: [{ kg: 0, pdc: 17, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setLest = S.wkt.exs[0].sets.map((s) => [s.kg, s.pdc]);
      neuf([{ name: FIC, sets: [{ kg: 0, pdc: -34, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setAssist = S.wkt.exs[0].sets.map((s) => [s.kg, s.pdc]);
      neuf([{ name: FIC, sets: [{ kg: 0, vide: true, reps: 8, done: false, type: 'N' }] }]); addSet(0); o.setVideBarre = S.wkt.exs[0].sets.map((s) => [s.kg, !!s.vide]);
      neuf(); o.remplace = _exerciceRemplacant(FIC, null, null).sets.map((s) => s.kg);
      neuf(); o.remplaceSource = _exerciceRemplacant('Développé Couché', null, null).sets.map((s) => s.kg);
      o.depuisSans = _serieDepuis(null, { kg: 0, reps: 5 }, 'N'); o.depuisReps = _serieDepuis(null, { reps: 5 }, 'N').reps;
      o.depuisNull = _serieDepuis({ kg: null, reps: 8 }, { reps: 5 }, 'N').kg; o.depuisZero = _serieDepuis({ kg: 0, reps: 8 }, { reps: 5 }, 'N').kg; o.depuisVal = _serieDepuis({ kg: 63, reps: 8 }, { reps: 5 }, 'N').kg;
      neuf([{ name: FIC, sets: [{ kg: null, reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }], group: 'g1', groupType: 'drop' }]); addToGroup('g1'); o.grpZero = K(S.wkt.exs[1]);
      neuf([{ name: FIC, sets: [{ kg: null, reps: 8, type: 'N' }], group: 'g1', groupType: 'drop' }]); addToGroup('g1'); o.grpInconnue = K(S.wkt.exs[1]);
      neuf([{ name: FIC, sets: [{ kg: 60, reps: 8, type: 'N' }], group: 'g1', groupType: 'drop' }]); addToGroup('g1'); o.grpValeur = K(S.wkt.exs[1]);
      neuf([{ name: FIC, sets: [{ kg: 0, pdc: 17, reps: 8, type: 'N' }], group: 'g1', groupType: 'drop' }]); addToGroup('g1'); o.grpLest = S.wkt.exs[1].sets.map((s) => [s.kg, s.pdc]);
      neuf([{ name: FIC, sets: [{ kg: 60, reps: 8, type: 'N' }], group: 'g2', groupType: 'super' }]); _addToGroupGid = 'g2'; _doAddToGroup(PERSO); o.superNeuf = K(S.wkt.exs[1]);
      return o;
    }, [FIC, PERSO]);
    t('B-SCFD-ZE3a ⭐⭐ `addExercise` SANS source admissible (exercice FICTIF · PERSONNALISÉ) : 3 séries à charge INCONNUE (avant : [0,0,0])', J(R.addFic) === J([null, null, null]) && J(R.addPerso) === J([null, null, null]), J([R.addFic, R.addPerso]));
    t('B-SCFD-ZE3b ⭐ `addExercise` AVEC une source admissible (séance libre à 90) : la valeur est reprise, jamais écrasée ni remplacée par un zéro', R.addAvecSource.includes(90) && !R.addAvecSource.includes(0), J(R.addAvecSource));
    t('B-SCFD-ZE3c ⭐⭐ `addSet` sans série voisine ni source : INCONNUE (null) ; voisine inconnue → inconnue ; voisine à zéro ÉCRIT → 0 ; voisine à 63 → 63 (copie de la séance en cours)', J(R.setVide) === J([null]) && J(R.setInconnue) === J([null, null]) && J(R.setZero) === J([0, 0]) && J(R.setValeur) === J([63, 63]), J([R.setVide, R.setInconnue, R.setZero, R.setValeur]));
    t('B-SCFD-ZE3d ⭐⭐ `addSet` : le PDC + lest (17), l\'assistance (−34) et « à vide » de la voisine se copient TELS QUELS (kg reste 0, aucun poids de corps déduit)', J(R.setLest) === J([[0, 17], [0, 17]]) && J(R.setAssist) === J([[0, -34], [0, -34]]) && J(R.setVideBarre) === J([[0, true], [0, true]]), J([R.setLest, R.setAssist, R.setVideBarre]));
    t('B-SCFD-ZE3e ⭐ « Remplacer l\'exercice » : sans source → 3 séries inconnues ; avec source admissible (90) → la valeur', J(R.remplace) === J([null, null, null]) && R.remplaceSource.includes(90), J([R.remplace, R.remplaceSource]));
    t('B-SCFD-ZE3f ⭐⭐ `_serieDepuis` (contre-sonde 5) : SANS source, un `def` à `kg:0` d\'un appelant ne produit AUCUN zéro (null) et garde les répétitions par défaut (5) ; avec source : null → null, 0 → 0, 63 → 63',
      R.depuisSans.kg === null && R.depuisSans.reps === 5 && R.depuisReps === 5 && R.depuisNull === null && R.depuisZero === 0 && R.depuisVal === 63, js(R.depuisSans));
    t('B-SCFD-ZE3g ⭐ `addToGroup` (dégressif) : dernière série à zéro ÉCRIT → 0 · INCONNUE → null · 60 → 55 · PDC + lest 17 → recopié', J(R.grpZero) === J([0]) && J(R.grpInconnue) === J([null]) && J(R.grpValeur) === J([55]) && J(R.grpLest) === J([[0, 17]]), J([R.grpZero, R.grpInconnue, R.grpValeur, R.grpLest]));
    t('B-SCFD-ZE3h ⭐ ajouter un exercice à un superset (`_doAddToGroup`) : sans source, la charge est INCONNUE (null), plus un « 0 écrit »', J(R.superNeuf) === J([null]), J(R.superNeuf));
    await X.cx.close();
  });

  /* ── B-SCFD-ZE4 · AVAL : un `null` neuf ne casse rien (écran, validation, tonnage, lecture de Milo, enregistrement) ── */
  await garde('ZE4', async () => {
    const X = await ouvrir({ wkt: wkt([exo(FIC, [])]) });
    await X.pg.evaluate(() => { _expandedEx = 0; addSet(0); addSet(0); });                                           // deux séries SANS charge ni source
    await X.pg.waitForTimeout(250);
    const dom = await X.pg.evaluate(() => { const r = document.querySelector('#sr-0-0'); const ins = r ? [...r.querySelectorAll('.sinp')] : []; return { n: ins.length, kgVal: ins[1] ? ins[1].value : null, kgPh: ins[1] ? ins[1].placeholder : null, kg: S.wkt.exs[0].sets.map((s) => s.kg) }; });
    t('B-SCFD-ZE4a ⭐ À L\'ÉCRAN : une série ajoutée sans source a un champ de charge VIDE (ni « 0 » écrit ni suggestion), et la donnée est `null`', dom.n >= 2 && dom.kgVal === '' && J(dom.kg) === J([null, null]) && !/^0/.test(String(dom.kgPh || '')), js(dom));
    const val = await X.pg.evaluate(() => { toggleSet(0, 0); stopRest(); const s = S.wkt.exs[0].sets[0]; return { done: s.done, kg: s.kg, txt: _kgTxtSerie(s), ton: _chargeTonnage(s), conn: _kgConnu(s.kg) }; });
    t('B-SCFD-ZE4b ⭐⭐ VALIDER la série sans rien taper : elle reste à charge INCONNUE (D-164 : `null`, « ? »), tonnage 0, `_kgConnu` faux — aucun zéro n\'apparaît à la validation', val.done === true && val.kg === null && val.txt === '?' && val.ton === 0 && val.conn === false, js(val));
    const ctx = await X.pg.evaluate(() => { try { const c = (typeof buildCoachContext === 'function') ? String(buildCoachContext() || '') : ''; return { ok: true, len: c.length, zero: /Zorglub[^\n]{0,80}\b0\s?kg/.test(c) }; } catch (e) { return { ok: false, err: String(e).slice(0, 120) }; } });
    t('B-SCFD-ZE4c ce que MILO lit : le contexte se construit sans erreur et ne dit pas « 0 kg » pour la série à charge inconnue', ctx.ok === true && ctx.zero === false, js(ctx));
    const fin = await X.pg.evaluate(async () => { const n0 = S.sessions.length; try { await finishWorkout(); } catch (e) { return { err: String(e).slice(0, 120) }; } await new Promise((r) => setTimeout(r, 150));
      const s = S.sessions.find((x) => (x.exs || []).some((e) => e.name === 'Zorglub inversé à la poulie')); return { plus: S.sessions.length - n0, kg: s ? s.exs[0].sets.map((q) => q.kg) : null, vol: s ? s.volume : null }; });
    t('B-SCFD-ZE4d ⭐ ENREGISTRER la séance : la série validée sans charge est conservée (`null`, jamais 0), volume 0, aucune erreur de page', fin.plus === 1 && J(fin.kg) === J([null, null]) && fin.vol === 0 && X.errs.length === 0, js(fin) + ' ' + X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  });

  /* ── B-SCFD-ZE5 · PROGRAMMES : « + série » de l'éditeur, chargement d'un jour, carte « type de séance », générateur : une charge jamais écrite reste inconnue, un zéro écrit reste 0 ── */
  await garde('ZE5', async () => {
    const X = await ouvrir({ wkt: null });
    const R = await X.pg.evaluate(() => {
      const o = {};
      S.programmes = [{ id: 'pz', name: 'Fictif Z', days: [{ id: 'dz', label: 'A', exs: [{ name: 'Zorglub inversé à la poulie', sets: [{ reps: 8, type: 'N' }, { kg: 0, reps: 8, type: 'N' }, { kg: 34, reps: 8, type: 'N' }, { kg: null, reps: 8, type: 'N' }] }] }] }];
      o.charge = _exsDeProgramme(S.programmes[0].days[0].exs, [], 10)[0].sets.map((s) => s.kg);                                  // absente · zéro écrit · 34 · inconnue
      const ed = { sets: [{ reps: 8, type: 'N' }] }; const pe = _progEditEx, pr = _renderProgEdit; _progEditEx = () => ed; _renderProgEdit = () => {};
      _addProgSet(0, 0); const e1 = ed.sets[1].kg; ed.sets[1].kg = 0; _addProgSet(0, 0); const e2 = ed.sets[2].kg; ed.sets[2].kg = 34; _addProgSet(0, 0); const e3 = ed.sets[3].kg; _progEditEx = pe; _renderProgEdit = pr;
      o.edit = [e1, e2, e3];                                                                                                  // la copie d'une série : sans charge écrite → null · zéro écrit → 0 · 34 → 34
      S.wkt = null; lancerTypeSeance(Object.keys(DISC_SEANCE)[0]); o.type = S.wkt.exs.every((e) => e.sets.every((s) => s.kg === null)) && S.wkt.exs.length > 0;
      S.level = 'debutant'; S.beginnerJourney = null; S.programmes = []; openBeginnerSetup(); createBeginnerProg();
      const g = [].concat.apply([], S.programmes[0].days.map((d) => [].concat.apply([], d.exs.map((e) => e.sets)))); o.gen = g.length > 0 && g.every((s) => s.kg === null);
      return o;
    });
    t('B-SCFD-ZE5a ⭐⭐ CHARGEMENT d\'un jour de programme : une charge ABSENTE devient inconnue (null, avant : 0) ; un zéro ÉCRIT reste 0 ; 34 reste 34 ; une charge inconnue reste inconnue', J(R.charge) === J([null, 0, 34, null]), J(R.charge));
    t('B-SCFD-ZE5b ⭐ éditeur de programme « + série » : copier une série sans charge écrite donne inconnue (null) ; copier un zéro écrit donne 0 ; copier 34 donne 34', J(R.edit) === J([null, 0, 34]), J(R.edit));
    t('B-SCFD-ZE5c ⭐ la carte « type de séance » (`lancerTypeSeance`) et le générateur de programme (`createBeginnerProg`) ne connaissent AUCUNE charge : toutes leurs séries sont inconnues (null), plus des « 0 écrits »', R.type === true && R.gen === true, js(R));
    await X.cx.close();
  });
}

module.exports = { pur, ecran };
