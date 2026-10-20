/* ═══════════════════════════════════════════════════════════════════════════
   🏋️ SÉANCE — CORRECTIONS DE LA RECETTE IPHONE DU 19/10/2026 + « PRÉCÉDENT » SUR 4 SÉANCES (blocs B-SR-*) — brief
   « Claude Principal » du 19/10, décisions de Michel du 19/10 (registre : D-093). Branche locale claude/seance-recette-precedent.
   ① le compteur « N / M » compte le TRAVAIL (D-083 ①, déjà juste sur iPhone : protégé, pas changé) ;
   ② le récapitulatif de fin dit le volume TOTAL (échauffements compris, D-092) et le travail à part ; la séance enregistrée garde
     le travail (`sess.volume`, sémantique historique inchangée) ; le détail d'une séance cesse d'appeler « total » le travail ;
   ③ le sélecteur de réserve : Échec | 0 | 1 | 2 | 3 | 4+ — « Échec » = le tag X (une seule donnée pour l'échec), « 0 » = un RIR 0
     réussi, marqué comme réponse NOUVELLE (`rirV: 2`) ; un ancien 0 (tapé sur l'ancien bouton « échec ») reste tel quel et se lit
     « 0 ou échec » ; rien n'est reclassé ;
   ④ le RIR se lit dans le détail d'une séance ; l'export et ce que Milo reçoit ne changent pas pour l'historique ;
   ⑤ la colonne « Précédent » ne duplique plus jamais une série : au-delà des séries de la dernière fois, « — » ;
   ⑥ « 4 dernières séances » : une feuille par-dessus la séance, ouverte par un geste distinct de la note de série ; les séries
     de TRAVAIL comparées par rang, les échauffements à part, « — » pour une série absente, deux séances du même jour distinctes,
     RIR / échec / notes en lecture seule, aucun verdict de progression.
   Ce que les témoins CONDUISENT : la vraie app servie en local, de vrais gestes (coche d'une série, réponse dans le dock de repos,
   pastille de type, « Terminer la séance » → « Terminer quand même », menu ⋯, « Précédent ▾ », fermeture de la feuille, un vrai
   rechargement, le détail d'une séance de Progrès), 4 largeurs d'iPhone.
   Ce qu'ils OBSERVENT : l'état (`S.wkt`, `S.sessions`, tout le stockage), le texte et la géométrie de chaque élément, chaque
   écriture du stockage (espion), chaque requête (réseau coupé et compté), le « + » central, le contexte de Milo CONSTRUIT (jamais
   envoyé) et les lignes de l'export (`_histoLignes`).
   Ce qu'ils NE COUVRENT PAS : Safari / l'iPhone réel, la lisibilité ressentie, la restauration depuis le cloud (aucun appel réseau :
   seule l'aller-retour du stockage local est conduit), Milo lui-même (aucun appel).
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999' };
const _det = o => JSON.stringify(o);
const DC = 'Développé Couché', PJ = 'Press Jambes 45°', DCH = 'Développé Couché Haltères', SQ = 'Squat à la Barre', RB = 'Rowing Barre (Tirage Horizontal)';
const S_ = (kg, reps, done, type, extra) => Object.assign({ kg, reps, done: !!done, type: type || 'N' }, extra || {});
const sess = (date, h, exs, extra) => { const ts = Date.parse(date + 'T' + String(h).padStart(2, '0') + ':30:00');
  return Object.assign({ id: ts, ts, date, startHour: h, synced: true, uniConv: 1, volume: 0, exs }, extra || {}); };
/* La recette de Michel (19/10) : développé couché et presse 45°, un échauffement + deux séries de travail chacun.
   Échauffement 8 × 50 + 10 × 100 = 1 400 kg · travail 2 × 10 × 60 + 2 × 10 × 150 = 4 200 kg · total 5 600 kg (comptés à la main). */
const WKT_RECETTE = (fini) => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 50 * 60000, exs: [
  { name: DC, sets: [S_(50, 8, 1, 'É'), S_(60, 10, 1), S_(60, 10, fini)] },
  { name: PJ, sets: [S_(100, 10, 1, 'É'), S_(150, 10, 1), S_(150, 10, fini)] } ] });
const WKT_SANS_ECH = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 30 * 60000, exs: [
  { name: DC, sets: [S_(60, 10, 1), S_(60, 10, 1), S_(60, 8, 1)] } ] });
const WKT_X = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 20 * 60000, exs: [
  { name: DC, sets: [S_(50, 8, 1, 'É'), S_(60, 10, 1), S_(60, 7, 1, 'X'), S_(60, 10)] } ] });
// Une séance pour répondre à la réserve : une série de travail à cocher, puis le dock de repos pose la question.
const WKT_RIR = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 10 * 60000, exs: [
  { name: DC, sets: [S_(50, 8, 1, 'É'), S_(60, 10), S_(60, 10), S_(60, 10)] } ] });
/* L'HISTORIQUE DE « PRÉCÉDENT » : A (6 séries de travail), puis B — la dernière fois — 4 séries de travail, son échauffement en 2ᵉ
   position ; aujourd'hui 6 séries de travail prévues, l'échauffement en 1ʳᵉ position. */
const HISTO_PREC = () => [
  sess('2026-10-12', 18, [{ name: DC, sets: [S_(55, 10, 1, 'N', { note: 'note B1' }), S_(40, 10, 1, 'É'), S_(57.5, 9, 1, 'N', { rir: 2, rirV: 2 }), S_(57.5, 8, 1, 'N', { rir: 0 }), S_(60, 6, 1)] }]),
  sess('2026-10-05', 18, [{ name: DC, sets: [S_(50, 10, 1), S_(52.5, 10, 1), S_(55, 9, 1), S_(55, 8, 1), S_(57.5, 6, 1), S_(57.5, 5, 1)] }]) ];
const WKT_PREC = () => ({ date: '__TODAY__', startHour: 18, exs: [
  { name: DC, sets: [S_(40, 10, 0, 'É')].concat(Array.from({ length: 6 }, () => S_(0, 0))) } ] });
/* ⑥ L'HISTORIQUE COMPARATIF : 6 séances avec le développé couché — la plus ancienne (25/09) sort des 4 ; deux le 16/10 ;
   une séance sans lui, une où il n'a AUCUNE série faite (ne comptent pas). 5 × 100 puis 10 × 80 : pas de verdict. */
const HISTO_4 = () => [
  sess('2026-10-16', 19, [{ name: DC, note: 'Banc du fond, prise large', sets: [S_(40, 10, 1, 'É'), S_(60, 10, 1, 'N', { rir: 2, rirV: 2 }),
    S_(60, 9, 1, 'N', { rir: 0, rirV: 2, note: 'cran 4' }), S_(60, 7, 1, 'X'), S_(57.5, 8, 1, 'N', { rir: 0 })] }]),
  sess('2026-10-16', 9, [{ name: DC, sets: [S_(62.5, 6, 1), S_(62.5, 6, 1), S_(62.5, 5, 1), S_(60, 6, 1), S_(60, 6, 1), S_(60, 5, 1)] }]),
  sess('2026-10-14', 18, [{ name: SQ, sets: [S_(100, 5, 1)] }]),
  sess('2026-10-12', 18, [{ name: DC, sets: [S_(80, 10, 0), S_(80, 10, 0)] }, { name: RB, sets: [S_(60, 10, 1)] }]),
  sess('2026-10-09', 18, [{ name: DC, sets: [S_(50, 10, 1, 'É'), S_(80, 10, 1), S_(80, 10, 1), S_(80, 9, 1)] }]),
  sess('2026-10-02', 18, [{ name: DC, sets: [S_(100, 5, 1), S_(100, 5, 1), S_(100, 4, 1)] }]),
  sess('2026-09-25', 18, [{ name: DC, sets: [S_(95, 5, 1), S_(95, 5, 1)] }]) ];
const WKT_4 = () => ({ date: '__TODAY__', startHour: 18, exs: [{ name: DC, sets: [S_(60, 10), S_(60, 10), S_(60, 10)] }, { name: RB, sets: [S_(60, 10)] }] });
/* ④ LE RIR DANS L'HISTORIQUE — la séance de la recette (export du 19/10) : développé couché haltères S1 RIR 1, S2 RIR 3 ;
   développé couché S1 RIR 1, S2 RIR 3. Plus : un ANCIEN 0 (sans marqueur), un NOUVEAU 0 (`rirV: 2`), un échec X, une série sans
   RIR, un échauffement qui porte un RIR (jamais affiché : la question ne concerne que le travail). */
const HISTO_RIR = () => [
  sess('2026-10-19', 7, [
    { name: DCH, sets: [S_(24, 10, 1, 'N', { rir: 1 }), S_(24, 10, 1, 'N', { rir: 3 })] },
    { name: DC, sets: [S_(40, 8, 1, 'É', { rir: 2 }), S_(60, 10, 1, 'N', { rir: 1 }), S_(60, 10, 1, 'N', { rir: 3 }), S_(60, 9, 1, 'N', { rir: 0 }),
      S_(60, 8, 1, 'N', { rir: 0, rirV: 2 }), S_(60, 6, 1, 'X'), S_(55, 10, 1)] } ], { volume: 3330 }),
  sess('2026-10-10', 18, [{ name: SQ, sets: [S_(100, 5, 1), S_(100, 5, 1)] }]) ];
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];
/* ⑧ LA SCÈNE DE LA DIAPO « TA SÉANCE » DU GUIDE (guide/seance.jpg, refaite pour le lot final du 20/10) — la même que la capture :
   « Pousser », développé couché É 60 × 10 ✓, 80 × 8 ✓, 87,5 × 6 ✓, 87,5 × 6 en cours ; développé militaire et dips à faire. */
const DM = 'Développé Militaire';
const WKT_GUIDE = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 23 * 60000, progLabel: 'Pousser', exs: [
  { name: DC, sets: [S_(60, 10, 1, 'É'), S_(80, 8, 1), S_(87.5, 6, 1), S_(87.5, 6)] },
  { name: DM, sets: [S_(45, 8), S_(45, 8), S_(45, 8)] },
  { name: 'Dips', sets: [S_(0, 12), S_(0, 10), S_(0, 9)] } ] });
const HISTO_GUIDE = () => [sess('2026-10-16', 18, [{ name: DC, sets: [S_(60, 10, 1, 'É'), S_(80, 8, 1), S_(85, 6, 1), S_(85, 6, 1)] },
  { name: DM, sets: [S_(42.5, 8, 1), S_(42.5, 8, 1), S_(42.5, 8, 1)] }, { name: 'Dips', sets: [S_(0, 12, 1), S_(0, 10, 1), S_(0, 9, 1)] }], { progLabel: 'Pousser', volume: 2680 })];   // travail : 80 × 8 + 2 × 85 × 6 + 3 × 42,5 × 8 = 2 680 kg (compté à la main)
/* Le bilan du mois écoulé est déjà « annoncé » (sinon sa pop-up s'ouvre 2,2 s après le chargement, par-dessus les gestes). Posé
   DANS la graine, pas à côté : à travers le clone, seule la graine reçoit le préfixe du clone. Mois de Paris, comme l'app. */
const moisPrecedent = () => { const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit' }).format(new Date()).split('-');
  const y = +p[0], m = +p[1]; return m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0'); };
const IA = ['coach', 'summarizeCoach', 'seanceJson', 'importProgram', 'importHistory', 'importBodyScan', 'importBloodTest', 'foodLabel', 'readBarcode',
  'morphoAnalysis', 'bodyStudy', 'estimateFood', 'importMealPlan', 'generateMealPlan'];

/* Lectures DANS la page. */
const AIDE = `(()=>{
  const R=e=>{ if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; };
  window.__srRir=()=>{ const z=document.getElementById('rest-rir'); if(!z) return null;
    const bs=[...z.querySelectorAll('.rir-b')].filter(b=>!b.classList.contains('rir-x'));
    const x=z.querySelector('.rir-x'), bar=document.getElementById('rest-bar'), tm=document.getElementById('rest-regler');
    const row=z.querySelector('.rir-row');
    const couvert=bs.concat(x?[x]:[]).map(b=>{ const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return !(e&&(e===b||b.contains(e))); });
    return { lbl:(z.querySelector('.rir-lbl')||{}).textContent||'', txt:bs.map(b=>b.textContent.trim()), on:bs.map(b=>b.classList.contains('on')),
      dis:bs.map(b=>!!b.disabled), oc:bs.map(b=>b.getAttribute('onclick')||''), x:!!x, rx:x?R(x):null, rs:bs.map(R), rt:R(tm), rbar:R(bar),
      rowOver:row?row.scrollWidth>row.clientWidth+0.5:false, couvert, docW:document.documentElement.scrollWidth, vw:innerWidth }; };
  window.__srP4=()=>{ const o=document.getElementById('ov-prev4'); if(!o||!o.classList.contains('open')) return null;
    const hs=[...o.querySelectorAll('.p4-h')];
    const rangs=[...o.querySelectorAll('.p4-r')].map(r=>({ rang:r.getAttribute('data-rang'), c:[...r.querySelectorAll('.p4-c')].map(c=>({ t:c.textContent.replace(/\\s+/g,' ').trim(), vide:c.getAttribute('data-vide')==='1' })) }));
    const sheet=o.querySelector('.p4-sheet')||o.firstElementChild, tab=o.querySelector('.p4-grille');
    return { titre:(o.querySelector('.p4-titre')||{}).textContent||'', h:hs.map(h=>h.textContent.replace(/\\s+/g,' ').trim()), cles:hs.map(h=>h.getAttribute('data-cle')),
      rangs, ech:[...o.querySelectorAll('.p4-ech-c')].map(c=>c.textContent.replace(/\\s+/g,' ').trim()),
      notes:[...o.querySelectorAll('.p4-note')].map(c=>c.textContent.replace(/\\s+/g,' ').trim()),
      leg:(o.querySelector('.p4-leg')||{}).textContent||'', texte:o.textContent.replace(/\\s+/g,' '), vide:(o.querySelector('.p4-vide')||{}).textContent||'',
      rsheet:R(sheet), rtab:R(tab), tabOver:tab?tab.scrollWidth>tab.clientWidth+0.5:false, docW:document.documentElement.scrollWidth, vw:innerWidth, vh:innerHeight }; };
  window.__srPrecCol=ei=>{ const ex=S.wkt&&S.wkt.exs[ei]; if(!ex) return null;
    return ex.sets.map((s,si)=>{ const row=document.getElementById('sr-'+ei+'-'+si); const c=row&&row.querySelector('.sprev');
      const ins=row?[...row.querySelectorAll('.sinp')]:[];
      return { v:c?((c.querySelector('.sprev-n')||{}).textContent||''):null, txt:c?c.textContent.replace(/\\s+/g,' ').trim():null,
        phR:ins[0]?ins[0].getAttribute('placeholder'):null, phK:ins[1]?ins[1].getAttribute('placeholder'):null }; }); };
  window.__srPlus=()=>R(document.querySelector('#nb-log .nb-plus'));
})();`;

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    /* Toutes les requêtes hors du serveur local : coupées et notées. Les témoins comptent les appels d'IA (Milo compris). */
    const req = [];
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const pd = String(rt.request().postData() || '');
      const m = /"action":"([A-Za-z]+)"/.exec(pd) || /[?&]action=([A-Za-z]+)/.exec(rt.request().url());
      req.push({ url: rt.request().url().slice(0, 70), action: m ? m[1] : '' }); return rt.abort(); });
    const init = Object.assign({}, BASE, { ft4_lms: moisPrecedent() }, opts.ls || {}, { ft4_sessions: JSON.stringify(opts.sessions || []) });
    const w = opts.wkt === undefined ? null : opts.wkt;
    if (w) { init.ft4_wkt = JSON.stringify(w); init.ft4_wkt_draft = JSON.stringify(w); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_sr'))return; sessionStorage.setItem('_sr','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));
    }catch(e){} })();`);
    await cx.addInitScript(`(()=>{ window.__ecrits=[]; const si=Storage.prototype.setItem, ri=Storage.prototype.removeItem;
      Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage) window.__ecrits.push(String(k)); }catch(e){} return si.apply(this,arguments); };
      Storage.prototype.removeItem=function(k){ try{ if(this===window.localStorage) window.__ecrits.push('-'+String(k)); }catch(e){} return ri.apply(this,arguments); }; })();`);
    await cx.addInitScript(AIDE);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, req, W, H };
    await apresChargement(X);
    return X;
  };
  const apresChargement = async X => {
    await nettoyer(X.pg);
    await X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
    await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); });
    await X.pg.waitForTimeout(250);
  };
  const recharger = async X => { await X.pg.reload(); await X.pg.waitForTimeout(1500); await apresChargement(X); };
  const nettoyer = pg => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const appelsIA = X => X.req.filter(r => IA.includes(r.action)).map(r => r.action);
  const etat = X => X.pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
    return { ls: o, wkt: JSON.stringify(S.wkt), sessions: JSON.stringify(S.sessions), ecrits: window.__ecrits.length }; });
  const visible = (pg, sel) => pg.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect();
      const cs = getComputedStyle(x); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }); if (!e) return false;
    e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === e || e.contains(top)); }, sel);
  const clic = async (pg, sel, txt) => { let loc = pg.locator(sel).filter({ visible: true }); if (txt) loc = loc.filter({ hasText: txt });
    if (!(await loc.count())) return false; try { await loc.first().click({ timeout: 2500 }); } catch (e) { return false; } await pg.waitForTimeout(250); return true; };
  const ouvrirEx = async (X, ei) => { await X.pg.evaluate(ei => { _expandedEx = ei; renderExBlocks(); }, ei); await X.pg.waitForTimeout(150); };
  // Une vraie coche (le dock de repos s'ouvre et pose la question) ; on n'enlève PAS les feuilles ouvertes : le dock n'en est pas une.
  const cocher = async (X, ei, si) => { await ouvrirEx(X, ei); const sel = '#sr-' + ei + '-' + si + ' .chk';
    const ok = await clic(X.pg, sel); await X.pg.waitForTimeout(250);
    return ok && await X.pg.evaluate(([ei, si]) => !!(S.wkt && S.wkt.exs[ei] && S.wkt.exs[ei].sets[si] && S.wkt.exs[ei].sets[si].done), [ei, si]); };
  const lireRir = X => X.pg.evaluate(() => window.__srRir());
  const repondre = (X, txt) => clic(X.pg, '#rest-rir .rir-b:not(.rir-x)', txt).then(async ok => {
    if (!ok) return false; return true; });
  const repondreExact = async (X, txt) => { const ok = await X.pg.evaluate(txt => { const b = [...document.querySelectorAll('#rest-rir .rir-b')].find(x => x.textContent.trim() === txt);
    if (!b) return false; b.click(); return true; }, txt); await X.pg.waitForTimeout(250); return ok; };
  const serie = (X, ei, si) => X.pg.evaluate(([ei, si]) => { const s = S.wkt.exs[ei].sets[si]; return { type: s.type, rir: s.rir === undefined ? '∅' : s.rir, rirV: s.rirV === undefined ? '∅' : s.rirV, done: s.done }; }, [ei, si]);
  const lireP4 = X => X.pg.evaluate(() => window.__srP4());
  const nb = x => String(x == null ? '' : x).replace(/\s/g, ' ');   // le séparateur de milliers français est une espace fine insécable
  const terminer = async X => { const okT = await clic(X.pg, '#log-finish .lf-fin');
    const q = await X.pg.evaluate(() => ((document.getElementById('ov-confirm') || {}).textContent || '').replace(/\s+/g, ' '));
    let okC = true; if (/Terminer quand même/.test(q)) okC = await clic(X.pg, '#confirm-ok');
    await X.pg.waitForTimeout(1500);
    const fin = await X.pg.evaluate(() => ({ tuiles: [...document.querySelectorAll('#se-stats .se-stat')].map(d => [((d.querySelector('.se-stat-l') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
      ((d.querySelector('.se-stat-v') || {}).textContent || '').replace(/\s+/g, ' ').trim()]), s0: (S.sessions || [])[0] || null, ouverte: _seanceOuverte(),
      geo: [...document.querySelectorAll('#se-stats .se-stat')].map(d => { const r = d.getBoundingClientRect(); return { w: r.width, sw: d.scrollWidth, cw: d.clientWidth }; }),
      docW: document.documentElement.scrollWidth, vw: innerWidth }));
    return { okT, okC, q, fin }; };
  const tuile = (fin, re) => (fin.tuiles.find(x => re.test(x[0])) || [null, null]);

  /* ══ ① LE COMPTEUR « N / M » COMPTE LE TRAVAIL (D-083 ①) — déjà juste sur iPhone : protégé, pas changé ══════════════════ */
  {
    const tete = X => X.pg.evaluate(() => ((document.querySelector('#tb-seance .tbs-l2') || {}).textContent || '').replace(/\s+/g, ' '));
    const X = await ouvrir({ wkt: WKT_RECETTE(false) });
    const h0 = nb(await tete(X));
    t('B-SR-①a la recette de Michel (développé couché : É ✓, N ✓, N à faire ; presse 45° : É ✓, N ✓, N à faire) → « 2 / 4 séries » de travail — les échauffements n\'y entrent pas',
      /(^|\D)2 \/ 4 séries/.test(h0), h0);
    await ouvrirEx(X, 1);
    const resume = await X.pg.evaluate(() => { const b = document.getElementById('ex-block-0'); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    t('B-SR-①b le compteur PROPRE à un exercice (carte repliée) garde sa règle : séries validées parmi toutes les séries prévues — « 2/3 séries » pour le développé couché (échauffement compris)',
      /2\/3 séries/.test(resume), resume.slice(0, 120));
    await recharger(X);
    const h1 = nb(await tete(X));
    t('B-SR-①c après un vrai rechargement : toujours « 2 / 4 séries »', /(^|\D)2 \/ 4 séries/.test(h1), h1);
    await X.cx.close();
    const Y = await ouvrir({ wkt: WKT_X() });
    const hx = nb(await tete(Y));
    t('B-SR-①d une série X validée est du travail (l\'échec compte) : É ✓, N ✓, X ✓, N à faire → « 2 / 3 séries »', /(^|\D)2 \/ 3 séries/.test(hx), hx);
    await Y.cx.close();
  }

  /* ══ ② LE RÉCAPITULATIF DE FIN : VOLUME TOTAL ET TRAVAIL À PART ; LA SÉANCE ENREGISTRÉE GARDE LE TRAVAIL ══════════════════ */
  {
    const X = await ouvrir({ wkt: WKT_RECETTE(true) });
    const kv = await X.pg.evaluate(() => [...document.querySelectorAll('#log-finish .lf-kv > div')].map(d => [((d.querySelector('span') || {}).textContent || ''), ((d.querySelector('b') || {}).textContent || '')]));
    t('B-SR-②a pendant la séance, la carte (D-092) : « 6 séries · dont 4 de travail » et « 5 600 kg · dont 4 200 kg de travail » — comptés à la main',
      _det(kv.slice(1).map(k => k.map(nb))) === _det([['séries · dont 4 de travail', '6'], ['volume · dont 4 200 kg de travail', '5 600 kg']]), _det(kv));
    const r = await terminer(X);
    const vol = tuile(r.fin, /^Volume/), ser = tuile(r.fin, /^Séries|^séries/);
    t('B-SR-②b ⭐ l\'écran de fin dit le volume TOTAL : « 5 600 kg », libellé « Volume total · dont 4 200 kg de travail » (avant : « 4200 kg » sous « Volume », le travail présenté comme le tout)',
      r.okT && r.okC && nb(vol[1]) === '5 600 kg' && /^Volume total/.test(nb(vol[0])) && /dont 4 200 kg de travail/.test(nb(vol[0])), _det({ okT: r.okT, okC: r.okC, tuiles: r.fin.tuiles }));
    t('B-SR-②c ⭐ l\'écran de fin dit les séries de TRAVAIL et le total validé : « 4 », libellé « Séries de travail · 6 validées »',
      ser[1] === '4' && /^Séries de travail/.test(nb(ser[0])) && /6 validées/.test(nb(ser[0])), _det(r.fin.tuiles));
    const s0 = r.fin.s0;
    t('B-SR-②d la séance ENREGISTRÉE garde la sémantique historique : `volume` = 4 200 (le travail), ses 6 séries intactes (types, charges, reps) — rien n\'est recalculé ni réécrit',
      !!s0 && s0.volume === 4200 && _det(s0.exs.map(e => e.sets.map(s => [s.type, s.kg, s.reps, s.done]))) === _det([[['É', 50, 8, true], ['N', 60, 10, true], ['N', 60, 10, true]], [['É', 100, 10, true], ['N', 150, 10, true], ['N', 150, 10, true]]]),
      _det(s0 && { v: s0.volume, s: s0.exs.map(e => e.sets.map(s => [s.type, s.kg, s.reps])) }));
    t('B-SR-②e l\'écran de fin tient sur iPhone (390 px) : aucune tuile ne déborde, pas de défilement horizontal',
      r.fin.geo.every(g => g.sw <= g.cw + 1) && r.fin.docW <= r.fin.vw, _det(r.fin.geo));
    // le détail de cette séance, après un vrai rechargement : il cesse d'appeler « total » le travail
    await recharger(X);
    const sub = await X.pg.evaluate(() => { const s = S.sessions[0]; openSessDetail(s.ts || s.id); return ((document.getElementById('sd-sub') || {}).textContent || '').replace(/\s+/g, ' '); });
    t('B-SR-②f ⭐ le détail de la séance (Progrès) : « 5 600 kg total · dont 4 200 kg de travail » (avant : « 4200 kg total », le travail présenté comme le total)',
      /5 600 kg total/.test(nb(sub)) && /dont 4 200 kg de travail/.test(nb(sub)), sub.slice(0, 120));
    const carteProgres = await X.pg.evaluate(() => { const s = S.sessions[0]; try { return _sessCarteHtml(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); } catch (e) { return 'ERR ' + e.message; } });
    /* Réécrit le 20/10 (lot final ft-v1257, décision de Michel : la carte dit « kg de travail ») : la carte garde le volume
       ENREGISTRÉ — le même nombre que « dont … kg de travail » du détail — et le NOMME, pour ne plus se lire comme le total. */
    t('B-SR-②g la carte de l\'historique (Progrès, liste) garde le volume enregistré et le nomme : « 4200 kg de travail » — jamais le total 5 600',
      /4200 kg de travail/.test(carteProgres) && !/5\s?600/.test(nb(carteProgres)), carteProgres.slice(0, 160));
    t('B-SR-②h aucune erreur de page, aucun appel d\'IA (fin de séance comprise)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
    for (const [W, H] of TAILLES.filter(([w]) => w !== 390)) {
      const Q = await ouvrir({ wkt: WKT_RECETTE(true), w: W, h: H });
      const rQ = await terminer(Q);
      t('B-SR-②e ' + W + ' px : l\'écran de fin tient (aucune tuile ne déborde, pas de défilement horizontal), mêmes chiffres',
        rQ.fin.geo.length > 0 && rQ.fin.geo.every(g => g.sw <= g.cw + 1) && rQ.fin.docW <= rQ.fin.vw && nb(tuile(rQ.fin, /^Volume/)[1]) === '5 600 kg', _det({ geo: rQ.fin.geo, t: rQ.fin.tuiles }));
      await Q.cx.close();
    }
    // sans échauffement : rien n'est ajouté
    const Y = await ouvrir({ wkt: WKT_SANS_ECH() });
    const rY = await terminer(Y);
    const vY = tuile(rY.fin, /^Volume/), sY = tuile(rY.fin, /^Séries|^séries/);
    t('B-SR-②i sans échauffement : « Volume total » = le travail (1 680 kg), aucun « dont » ; « Séries de travail » 3, aucun « validées »',
      nb(vY[1]) === '1 680 kg' && /^Volume total/.test(nb(vY[0])) && !/dont/.test(vY[0]) && sY[1] === '3' && /^Séries de travail/.test(sY[0]) && !/validées/.test(sY[0]), _det(rY.fin.tuiles));
    await Y.cx.close();
  }

  /* ══ ③ LE SÉLECTEUR DE RÉSERVE : Échec | 0 | 1 | 2 | 3 | 4+ (décisions de Michel du 19/10) ═══════════════════════════════ */
  {
    const X = await ouvrir({ wkt: WKT_RIR() });
    const ok1 = await cocher(X, 0, 1);
    const R0 = await lireRir(X);
    t('B-SR-③a ⭐ après une série de travail, le dock propose SIX réponses, dans l\'ordre : « Échec », « 0 », « 1 », « 2 », « 3 », « 4+ » (avant : « échec » = 0, pas de vrai 0)',
      ok1 && !!R0 && _det(R0.txt) === _det(['Échec', '0', '1', '2', '3', '4+']) && R0.on.every(v => !v), _det(R0 && { txt: R0.txt, on: R0.on }));
    const o0 = await repondreExact(X, '0'); const s0 = await serie(X, 0, 1), R1 = await lireRir(X);
    t('B-SR-③b ⭐ « 0 » enregistre un RIR 0 RÉUSSI : `rir: 0`, la série reste N, marquée réponse nouvelle (`rirV: 2`) ; « 0 » est coché',
      o0 && s0.type === 'N' && s0.rir === 0 && s0.rirV === 2 && !!R1 && R1.on[1] && R1.on.filter(Boolean).length === 1, _det({ o0, s0, on: R1 && R1.on }));
    const oe = await repondreExact(X, 'Échec'); const se = await serie(X, 0, 1), R2 = await lireRir(X);
    t('B-SR-③c ⭐ « Échec » pose le TAG X (une seule donnée pour l\'échec) : la série devient X, son RIR est retiré ; « Échec » est coché, « 0 » ne l\'est plus',
      oe && se.type === 'X' && se.rir === '∅' && se.rirV === '∅' && !!R2 && R2.on[0] && !R2.on[1] && R2.on.filter(Boolean).length === 1, _det({ oe, se, on: R2 && R2.on }));
    const o2 = await repondreExact(X, '2'); const s2 = await serie(X, 0, 1);
    t('B-SR-③d ⭐ changer d\'avis (Échec → 2) : la série redevient N avec `rir: 2` (marqué) — jamais un RIR 0 transformé en échec ni l\'inverse',
      o2 && s2.type === 'N' && s2.rir === 2 && s2.rirV === 2, _det({ o2, s2 }));
    const ox = await clic(X.pg, '#rest-rir .rir-x'); const sx = await serie(X, 0, 1);
    t('B-SR-③e « ✕ » retire la réponse : plus de RIR, plus de marqueur, la série reste N (non renseigné ≠ 0)',
      ox && sx.type === 'N' && sx.rir === '∅' && sx.rirV === '∅', _det({ ox, sx }));
    await repondreExact(X, 'Échec'); const ox2 = await clic(X.pg, '#rest-rir .rir-x'); const sx2 = await serie(X, 0, 1);
    t('B-SR-③f « ✕ » après « Échec » : la série redevient N, sans RIR (l\'échec retiré n\'est pas remplacé par un 0)',
      ox2 && sx2.type === 'N' && sx2.rir === '∅', _det({ ox2, sx2 }));
    // 1 et 4+ sur les séries suivantes (vraies coches) ; le « 3 » est enregistré et relu en ③j
    const vals = [];
    for (const [si, txt, att] of [[2, '1', 1], [3, '4+', 4]]) { await X.pg.evaluate(() => { if (typeof skipRest === 'function') skipRest(); }); const okc = await cocher(X, 0, si);
      const okr = await repondreExact(X, txt); vals.push([okc, okr, await serie(X, 0, si), att]); }
    t('B-SR-③g « 1 » et « 4+ » enregistrent 1 et 4 (4+ = 4 ou plus), marqués réponses nouvelles',
      vals.every(([okc, okr, s, att]) => okc && okr && s.type === 'N' && s.rir === att && s.rirV === 2), _det(vals));
    await recharger(X);
    const apres = await X.pg.evaluate(() => S.wkt.exs[0].sets.map(s => [s.type, s.rir === undefined ? '∅' : s.rir, s.rirV === undefined ? '∅' : s.rirV]));
    t('B-SR-③h après un vrai rechargement, les réponses sont toujours là, chacune sur SA série (reprise de séance)',
      _det(apres) === _det([['É', '∅', '∅'], ['N', '∅', '∅'], ['N', 1, 2], ['N', 4, 2]]), _det(apres));
    t('B-SR-③i aucune erreur de page, aucun appel d\'IA', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
    // la pastille de type reste une porte vers le même tag : X posé à la pastille → « Échec » coché, rien d'autre
    const Y = await ouvrir({ wkt: WKT_RIR() });
    await cocher(Y, 0, 1); await repondreExact(Y, '3');
    const okp = await Y.pg.evaluate(() => { cycleType(0, 1); cycleType(0, 1); return S.wkt.exs[0].sets[1].type; });   // N → É → X
    await Y.pg.evaluate(() => { if (typeof _renderRirRow === 'function') _renderRirRow(); });
    const RY = await lireRir(Y), sy = await serie(Y, 0, 1);
    t('B-SR-③j une série passée en X à la PASTILLE : la question montre « Échec » coché ; le RIR noté avant n\'est ni effacé ni lu (il reviendrait si la pastille repasse N)',
      okp === 'X' && !!RY && RY.on[0] && RY.on.filter(Boolean).length === 1 && sy.rir === 3, _det({ okp, on: RY && RY.on, sy }));
    await Y.cx.close();
    // un ANCIEN 0 dans la séance en cours (réponse tapée avant la mise à jour) : rien n'est coché, rien n'est réécrit
    const wl = WKT_RIR(); wl.exs[0].sets[1] = S_(60, 10, 1, 'N', { rir: 0 });
    const Z = await ouvrir({ wkt: wl });
    await Z.pg.evaluate(() => { _rirCible = { ei: 0, si: 1 }; _renderRirRow(); });
    const RZ = await lireRir(Z), sz = await serie(Z, 0, 1);
    t('B-SR-③k un ANCIEN 0 (sans marqueur, tapé sur l\'ancien bouton « échec ») : ni « 0 » ni « Échec » ne sont cochés, la donnée reste `rir: 0` — rien n\'est reclassé',
      !!RZ && RZ.on.every(v => !v) && RZ.x && sz.rir === 0 && sz.rirV === '∅' && sz.type === 'N', _det({ on: RZ && RZ.on, x: RZ && RZ.x, sz }));
    await Z.cx.close();
    // RPE : même donnée, autre vocabulaire
    const V = await ouvrir({ wkt: WKT_RIR(), ls: { ft4_echelle_reserve: 'rpe' } });
    await V.pg.evaluate(() => { S.echelleReserve = 'rpe'; persist(); });
    await cocher(V, 0, 1);
    const RV = await lireRir(V);
    const o10 = await repondreExact(V, '10'); const sv = await serie(V, 0, 1);
    t('B-SR-③l en RPE : « ≤6 », « 7 », « 8 », « 9 », « 10 », « Échec » ; « 10 » enregistre un RIR 0 réussi (marqué), pas un échec',
      !!RV && _det(RV.txt) === _det(['≤6', '7', '8', '9', '10', 'Échec']) && o10 && sv.type === 'N' && sv.rir === 0 && sv.rirV === 2, _det({ txt: RV && RV.txt, sv }));
    await V.cx.close();
    /* LES AIDES (R23) : « échec = 0 en réserve » (aide « ? »), « 0 = échec » / « 10 = échec » (échelle du Profil) et la liste
       « échec · 1 · 2 · 3 · 4+ » (point rouge, Guide) contredisaient ft-v1154 depuis le 06/09 — et c'est un texte faux qui fait
       taper « échec » pour dire « j'étais à fond ». Les CINQ aides qui décrivent l'app d'AUJOURD'HUI sont relues telles que l'app
       les sert, plus la DERNIÈRE annonce « Quoi de neuf » sur la réserve (repérée par son contenu, pas par son numéro).
       ⛔ Les annonces PASSÉES ne sont pas lues : ce sont des annonces datées, et les réécrire falsifierait ce qui a été annoncé ce
       jour-là (précédent écrit dans constants.js, ft-v1053, à propos de la v37) — la v62 dit encore « échec · 1 · 2 · 3 · 4+ »,
       exprès. C'est la plus récente qui dit ce qui a changé. */
    const A = await ouvrir({ wkt: null });
    const aides = await A.pg.evaluate(() => {
      const plat = v => (v === null || v === undefined) ? null : JSON.stringify(v).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
      const wn = typeof WHATS_NEW !== 'undefined' ? WHATS_NEW.filter(e => e && /échec/i.test((e.t || '') + ' ' + (e.d || ''))).sort((a, b) => b.v - a.v)[0] : null;
      return { ECH_DESCS: plat(typeof ECH_DESCS !== 'undefined' ? ECH_DESCS : null), _HELP_DATA: plat(typeof _HELP_DATA !== 'undefined' ? _HELP_DATA : null),
        _DRAWER_CONTENT: plat(typeof _DRAWER_CONTENT !== 'undefined' ? _DRAWER_CONTENT : null), APP_GUIDE_SLIDES: plat(typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : null),
        NEW_FEATURES: plat(typeof NEW_FEATURES !== 'undefined' ? NEW_FEATURES : null), WHATS_NEW_DERNIERE: plat(wn || null) }; });
    const FAUX = [/(?<![0-9])0 ?= ?échec/i, /10 ?= ?échec/i, /échec ?= ?0/i, /échec[ ·,]+1[ ·,]+2[ ·,]+3[ ·,]+4\+/i];
    const fautes = Object.keys(aides).filter(k => aides[k] !== null && FAUX.some(re => re.test(aides[k])));
    const NOUVELLE = /Échec[ ·,]+0[ ·,]+1[ ·,]+2[ ·,]+3[ ·,]+4\+/;
    const sansListe = ['_HELP_DATA', '_DRAWER_CONTENT', 'APP_GUIDE_SLIDES', 'NEW_FEATURES', 'WHATS_NEW_DERNIERE'].filter(k => !(aides[k] && NOUVELLE.test(aides[k])));
    t('B-SR-③n les aides de l\'app d\'aujourd\'hui (Profil, « ? », aide détaillée, Guide, point rouge) et la DERNIÈRE annonce sur la réserve ne disent plus « échec = 0 » ni « 0 / 10 = échec » ni la liste sans 0 ; celles qui montrent le sélecteur disent « Échec · 0 · 1 · 2 · 3 · 4+ » (les annonces passées, datées, ne sont pas réécrites)',
      Object.keys(aides).every(k => aides[k] !== null) && fautes.length === 0 && sansListe.length === 0 && /Échec/.test(aides.ECH_DESCS || '') && /(?<![0-9])0 = ta dernière/.test(aides.ECH_DESCS || ''),
      _det({ absentes: Object.keys(aides).filter(k => aides[k] === null), fautes, sansListe }));
    await A.cx.close();
    // la mise en page aux 4 largeurs, réponse donnée (« ✕ » visible : 7 boutons)
    for (const [W, H] of TAILLES) {
      const Q = await ouvrir({ wkt: WKT_RIR(), w: W, h: H });
      await cocher(Q, 0, 1); await repondreExact(Q, '2');
      const R = await lireRir(Q), plus = await Q.pg.evaluate(() => window.__srPlus());
      const tousR = R ? R.rs.concat([R.rx]) : [];
      const inter = (a, b2) => (a && b2) ? Math.max(0, Math.min(a.r, b2.r) - Math.max(a.x, b2.x)) * Math.max(0, Math.min(a.b, b2.b) - Math.max(a.y, b2.y)) : 0;
      t('B-SR-③m ' + W + ' px : les 6 réponses + « ✕ » tiennent sur une ligne, chacune au moins 36 × 36 px, rien ne déborde, rien n\'est recouvert, rien ne chevauche le minuteur',
        !!R && R.x && R.rs.length === 6 && tousR.every(r => r && r.w >= 36 && r.h >= 36) && !R.rowOver && R.docW <= R.vw && R.couvert.every(c => !c)
          && tousR.every(r => r.x >= 0 && r.r <= R.vw + 0.5) && tousR.every(r => inter(r, R.rt) === 0) && new Set(R.rs.map(r => Math.round(r.y))).size === 1,
        _det(R && { n: R.rs.length, w: tousR.map(r => r && Math.round(r.w)), h: tousR.map(r => r && Math.round(r.h)), over: R.rowOver, couvert: R.couvert, plus }));
      await Q.cx.close();
    }
  }

  /* ══ ④ LE RIR DANS L'HISTORIQUE ; L'EXPORT ET MILO INCHANGÉS POUR L'HISTORIQUE ═════════════════════════════════════════ */
  {
    const X = await ouvrir({ sessions: HISTO_RIR(), wkt: null });
    const det = await X.pg.evaluate(() => { const s = S.sessions[0]; openSessDetail(s.ts || s.id);
      return [...document.querySelectorAll('#sd-content .card')].map(c => ({ nom: ((c.querySelector('div[style*="font-weight:700;font-size:14px"]') || {}).textContent || '').trim(),
        series: [...c.querySelectorAll('.sd-set')].map(r => ({ num: ((r.querySelector('.sd-num') || {}).textContent || '').trim(), type: ((r.querySelector('.sd-type') || {}).textContent || '').trim(),
          rir: ((r.querySelector('.sd-rir') || {}).textContent || '').replace(/\s+/g, ' ').trim() })) })); });
    const ex = n => (det.find(d => d.nom === n) || { series: [] }).series;
    t('B-SR-④a ⭐ le détail de la séance (Progrès) montre le RIR de chaque série, sur la bonne série et le bon exercice — la recette : développé couché haltères S1 « RIR 1 », S2 « RIR 3 »',
      _det(ex(DCH).map(s => [s.num, s.type, s.rir])) === _det([['1', 'N', 'RIR 1'], ['2', 'N', 'RIR 3']]), _det(det));
    t('B-SR-④b ⭐ développé couché : échauffement sans RIR (même s\'il en porte un), S1 « RIR 1 », S2 « RIR 3 », un ANCIEN 0 « 0 ou échec », un NOUVEAU 0 « RIR 0 », l\'échec X sans RIR (son type le dit), une série sans RIR : rien',
      _det(ex(DC).map(s => [s.type, s.rir])) === _det([['É', ''], ['N', 'RIR 1'], ['N', 'RIR 3'], ['N', '0 ou échec'], ['N', 'RIR 0'], ['X', ''], ['N', '']]), _det(ex(DC)));
    const exp = await X.pg.evaluate(() => _histoLignes(false).filter(r => r.date === '2026-10-19').map(r => r.exercise.slice(0, 22) + ':' + r.set_num + ':' + r.type + ':' + r.rir));
    t('B-SR-④c l\'EXPORT ne change pas de format : la colonne RIR porte les mêmes valeurs qu\'avant (1, 3, ancien 0 → 0, nouveau 0 → 0, X et échauffement → vide)',
      _det(exp) === _det(['Développé Couché Haltè:1:N:1', 'Développé Couché Haltè:2:N:3', 'Développé Couché:1:É:', 'Développé Couché:2:N:1', 'Développé Couché:3:N:3', 'Développé Couché:4:N:0',
        'Développé Couché:5:N:0', 'Développé Couché:6:X:', 'Développé Couché:7:N:']), _det(exp));
    const ctx = await X.pg.evaluate(() => { try { const c = buildCoachContext('test'); return typeof c === 'string' ? c : JSON.stringify(c); } catch (e) { return 'ERR ' + e.message; } });
    const ligneDC = (ctx.split('\n').find(l => /Développé Couché: /.test(l) && /RIR/.test(l)) || '');
    t('B-SR-④d ce que MILO reçoit pour l\'historique est INCHANGÉ (contexte construit, jamais envoyé), série par série et au caractère près : « RIR1 », « RIR3 », l\'ancien 0 ET le nouveau 0 tous deux « RIR0 » (ni marqueur ni reclassement), l\'échec « (X) » sans RIR, l\'échauffement sans RIR',
      /Développé Couché Haltères: S1 24×10 RIR1 · S2 24×10 RIR3 · /.test(ligneDC) && /Développé Couché: É 40×8 · S1 60×10 RIR1 · S2 60×10 RIR3 · S3 60×9 RIR0 · S4 60×8 RIR0 · S5 60×6\(X\) · S6 55×10(?= |$)/.test(ligneDC), ligneDC.slice(0, 300));
    // une modification dans le détail ne perd ni le RIR ni le marqueur
    const apres = await X.pg.evaluate(() => { updateSessSet(1, 4, 'reps', '9'); saveSessEdits(); const s = S.sessions.find(x => x.date === '2026-10-19');
      return s.exs[1].sets.map(x => [x.reps, x.rir === undefined ? '∅' : x.rir, x.rirV === undefined ? '∅' : x.rirV]); });
    t('B-SR-④e modifier une série dans le détail puis enregistrer : chaque RIR et chaque marqueur restent sur leur série (le nouveau 0 garde `rirV`)',
      _det(apres) === _det([[8, 2, '∅'], [10, 1, '∅'], [10, 3, '∅'], [9, 0, '∅'], [9, 0, 2], [6, '∅', '∅'], [10, '∅', '∅']]), _det(apres));
    const det2 = await X.pg.evaluate(() => { const s = S.sessions.find(x => x.date === '2026-10-10'); openSessDetail(s.ts || s.id);
      return [...document.querySelectorAll('#sd-content .sd-rir')].map(e => e.textContent.trim()).filter(Boolean); });
    t('B-SR-④f une ancienne séance SANS RIR : aucun RIR affiché, rien n\'est inventé', det2.length === 0, _det(det2));
    t('B-SR-④g aucune erreur de page, aucun appel d\'IA', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
    // en RPE : la même donnée, l'autre vocabulaire (rien n'est converti en stock)
    const V = await ouvrir({ sessions: HISTO_RIR(), wkt: null });
    const rpe = await V.pg.evaluate(() => { S.echelleReserve = 'rpe'; const s = S.sessions[0]; openSessDetail(s.ts || s.id);
      const c = [...document.querySelectorAll('#sd-content .card')][1];
      return { rir: [...c.querySelectorAll('.sd-set')].map(r => ((r.querySelector('.sd-rir') || {}).textContent || '').trim()), stock: S.sessions[0].exs[1].sets.map(x => x.rir === undefined ? '∅' : x.rir) }; });
    t('B-SR-④i en RPE, le détail dit « RPE 9 », « RPE 7 », l\'ancien 0 « RPE 10 ou échec », le nouveau 0 « RPE 10 » — et le stock reste en RIR (2, 1, 3, 0, 0…)',
      _det(rpe.rir) === _det(['', 'RPE 9', 'RPE 7', 'RPE 10 ou échec', 'RPE 10', '', '']) && _det(rpe.stock) === _det([2, 1, 3, 0, 0, '∅', '∅']), _det(rpe));
    await V.cx.close();
    const Q = await ouvrir({ sessions: HISTO_RIR(), wkt: null, w: 360, h: 740 });
    const geo = await Q.pg.evaluate(() => { const s = S.sessions[0]; openSessDetail(s.ts || s.id);
      const rows = [...document.querySelectorAll('#sd-content .sd-set')].map(r => { const l = r.firstElementChild; const rr = r.getBoundingClientRect(); const c = r.closest('.card').getBoundingClientRect();
        const x = r.querySelector('.sd-rir'); const rx = x ? x.getBoundingClientRect() : null;
        return { over: l.scrollWidth > l.clientWidth + 1, dans: rr.left >= c.left - 0.5 && rr.right <= c.right + 0.5, rir: rx ? (rx.left >= c.left && rx.right <= c.right + 0.5) : true }; });
      return { rows, docW: document.documentElement.scrollWidth, vw: innerWidth }; });
    t('B-SR-④h 360 px : le détail de la séance tient — aucune ligne de série ne déborde, chaque RIR reste dans sa carte, pas de défilement horizontal',
      geo.rows.length === 9 && geo.rows.every(r => !r.over && r.dans && r.rir) && geo.docW <= geo.vw, _det(geo));
    await Q.cx.close();
    /* ⭐ LA CHAÎNE COMPLÈTE, de vrais gestes (familles 5 et 13 du brief) : réponses au dock → « Terminer » → la séance
       enregistrée → son détail → un vrai rechargement → la RESTAURATION sur un appareil vide, par le chemin local
       `_applyRestoreData` avec la séance telle que le cloud la rend (le cloud garde le JSON entier de la séance) — aucune
       requête : le réseau est coupé, la réponse du serveur est simulée par la séance elle-même. */
    const K = await ouvrir({ wkt: WKT_RIR() });
    const gk = [];
    for (const [si, txt] of [[1, '0'], [2, 'Échec'], [3, '2']]) { await K.pg.evaluate(() => { if (typeof skipRest === 'function') skipRest(); });
      gk.push(!!(await cocher(K, 0, si)) && !!(await repondreExact(K, txt))); }
    await K.pg.evaluate(() => { if (typeof skipRest === 'function') skipRest(); });
    const rk = await terminer(K);
    const lit = X => X.pg.evaluate(() => { const s = (S.sessions || []).find(x => (x.exs || []).some(e => e.name === 'Développé Couché'));
      if (!s) return null; openSessDetail(s.ts || s.id);
      const c = [...document.querySelectorAll('#sd-content .card')][0];
      const r = { n: (S.sessions || []).length, stock: s.exs[0].sets.map(x => [x.type, x.rir === undefined ? '∅' : x.rir, x.rirV === undefined ? '∅' : x.rirV]),
        det: c ? [...c.querySelectorAll('.sd-set')].map(z => ((z.querySelector('.sd-rir') || {}).textContent || '').trim()) : null, json: JSON.stringify(s) };
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); return r; });
    const STOCK = [['É', '∅', '∅'], ['N', 0, 2], ['X', '∅', '∅'], ['N', 2, 2]], DET = ['', 'RIR 0', '', 'RIR 2'];
    const vu = k => !!k && k.n === 1 && _det(k.stock) === _det(STOCK) && _det(k.det) === _det(DET);
    const court = k => k && { n: k.n, stock: k.stock, det: k.det };
    const k1 = await lit(K);
    await recharger(K); const k2 = await lit(K);
    t('B-SR-④k ⭐ la CHAÎNE COMPLÈTE, de vrais gestes : « 0 », « Échec », « 2 » au dock → « Terminer » → la séance enregistrée garde 0 (marqué), X, 2 (marqué) sur leurs séries ; le détail lit « RIR 0 », rien pour le X (son type le dit), « RIR 2 » ; un vrai rechargement ne change rien',
      gk.every(Boolean) && rk.okT && vu(k1) && vu(k2), _det({ gk, okT: rk.okT, k1: court(k1), k2: court(k2) }));
    const sauvee = k2 ? JSON.parse(k2.json) : null;
    await K.cx.close();
    const Rr = await ouvrir({ sessions: [], wkt: null });
    const okR = await Rr.pg.evaluate(s => { try { _applyRestoreData({ profile: { name: 'Test', bw: 82, age: 41, gender: 'H', goal: 'force' }, sessions: s ? [s] : [] }); return true; }
      catch (e) { return 'ERR ' + e.message; } }, sauvee);
    const r1 = await lit(Rr); await recharger(Rr); const r2 = await lit(Rr);
    t('B-SR-④l la RESTAURATION sur un appareil vide (chemin local `_applyRestoreData`, la séance telle que le cloud la rend — aucune requête) : chaque RIR, chaque marqueur et le X reviennent sur leur série, le détail lit pareil, un rechargement ne change rien',
      okR === true && vu(r1) && vu(r2), _det({ okR, r1: court(r1), r2: court(r2) }));
    t('B-SR-④m aucune erreur de page, aucun appel d\'IA (chaîne complète + restauration)',
      K.errs.length === 0 && Rr.errs.length === 0 && appelsIA(K).length === 0 && appelsIA(Rr).length === 0, K.errs.concat(Rr.errs, appelsIA(K), appelsIA(Rr)).join(' | ').slice(0, 200));
    await Rr.cx.close();
  }

  /* ══ ⑤ LA COLONNE « PRÉCÉDENT » : LA DERNIÈRE SÉANCE, SANS SÉRIE DUPLIQUÉE NI EMPRUNTÉE ═════════════════════════════════ */
  {
    const X = await ouvrir({ sessions: HISTO_PREC(), wkt: WKT_PREC() });
    await ouvrirEx(X, 0);
    const col = await X.pg.evaluate(() => window.__srPrecCol(0));
    t('B-SR-⑤a ⭐ B (la dernière fois) avait 4 séries de travail, aujourd\'hui 6 : les lignes 1 à 4 montrent les 4 séries de B (10×55, 9×57.5, 8×57.5, 6×60), les lignes 5 et 6 RIEN — ni la 4ᵉ de B répétée, ni les séries de A',
      !!col && _det(col.slice(1).map(c => c.v)) === _det(['10×55', '9×57.5', '8×57.5', '6×60', '', '']), _det(col && col.map(c => c.v)));
    t('B-SR-⑤b l\'échauffement d\'aujourd\'hui (1ʳᵉ ligne) se compare à l\'échauffement de B (2ᵉ position chez B) — par rôle, pas par position',
      !!col && col[0].v === '10×40', _det(col && col[0]));
    t('B-SR-⑤e les badges de réserve de la colonne : « ·2r » sur la série notée 2, « ·0/X » (0 ou échec) sur l\'ANCIEN 0 — rien sur les autres',
      !!col && /·2r/.test(col[2].txt) && /·0\/X/.test(col[3].txt) && !/·/.test(col[1].txt) && !/·/.test(col[4].txt), _det(col && col.slice(1, 5).map(c => c.txt)));
    t('B-SR-⑤c les SUGGESTIONS grises des champs (pré-remplissage) gardent leur règle : la 5ᵉ et la 6ᵉ ligne proposent encore la dernière série de B comme point de départ — ce n\'est pas un historique affiché',
      !!col && col[5].phK === '60' && col[5].phR === '6' && col[6].phK === '60', _det(col && col.slice(5).map(c => [c.phR, c.phK])));
    const okN = await clic(X.pg, '#sr-0-1 .sprev');
    const note = await X.pg.evaluate(() => { const o = document.getElementById('ov-set-note'); return { open: !!(o && o.classList.contains('open')), t: o ? o.textContent.replace(/\s+/g, ' ') : '',
      p4: !!(document.getElementById('ov-prev4') && document.getElementById('ov-prev4').classList.contains('open')) }; });
    t('B-SR-⑤d toucher une case « Précédent » ouvre toujours la NOTE de la série (« Note — série 2 », avec le commentaire de B sur cette série) — pas la comparaison',
      okN && note.open && /Note — série 2/.test(note.t) && /note B1/.test(note.t) && !note.p4, _det({ okN, note: Object.assign({}, note, { t: note.t.slice(0, 120) }) }));
    await X.cx.close();
  }

  /* ══ ⑥ « 4 DERNIÈRES SÉANCES » : COMPARER SANS QUITTER LA SÉANCE, SANS RIEN INVENTER ═════════════════════════════════════ */
  {
    const X = await ouvrir({ sessions: HISTO_4(), wkt: WKT_4() });
    await ouvrirEx(X, 0);
    const avant = await etat(X), plus0 = await X.pg.evaluate(() => window.__srPlus());
    const okH = await clic(X.pg, '#ex-block-0 .sprev-h');
    const P = await lireP4(X);
    t('B-SR-⑥a ⭐ un geste DISTINCT de la note : « Précédent ▾ » (en-tête de la colonne) ouvre la feuille « 4 dernières séances » par-dessus la séance',
      okH && !!P && /4 dernières séances/.test(P.titre), _det({ okH, titre: P && P.titre }));
    const cles = P ? P.cles : [];
    t('B-SR-⑥b ⭐ exactement les 4 séances les plus récentes OÙ L\'EXERCICE A ÉTÉ FAIT, dans l\'ordre chronologique (02/10, 09/10, 16/10, 16/10) — ni le 25/09 (5ᵉ), ni le 12/10 (aucune série faite), ni le 14/10 (sans lui)',
      _det(cles) === _det([String(Date.parse('2026-10-02T18:30:00')), String(Date.parse('2026-10-09T18:30:00')), String(Date.parse('2026-10-16T09:30:00')), String(Date.parse('2026-10-16T19:30:00'))]),
      _det({ cles, h: P && P.h }));
    t('B-SR-⑥c ⭐ deux séances le MÊME jour restent deux colonnes, distinguées (« 16/10 · 1ʳᵉ », « 16/10 · 2ᵉ », et l\'heure de début) — jamais fusionnées',
      !!P && P.h.length === 4 && /16\/10/.test(P.h[2]) && /16\/10/.test(P.h[3]) && /1ʳᵉ/.test(P.h[2]) && /2ᵉ/.test(P.h[3]) && /9 h/.test(P.h[2]) && /19 h/.test(P.h[3]) && P.h[2] !== P.h[3],
      _det(P && P.h));
    const cel = (rang, col) => { const r = P && P.rangs.find(x => x.rang === String(rang)); return r ? r.c[col] : null; };
    t('B-SR-⑥d ⭐ les séries de TRAVAIL se comparent par rang : 6 lignes (le maximum réel) ; le 02/10 (3 séries) a « — » aux rangs 4 à 6, le 16/10 du soir (4 séries) « — » aux rangs 5 et 6 — rien n\'est dupliqué ni emprunté',
      !!P && P.rangs.length === 6 && [4, 5, 6].every(r => cel(r, 0) && cel(r, 0).vide && cel(r, 0).t === '—') && [5, 6].every(r => cel(r, 3) && cel(r, 3).vide)
        && cel(4, 2) && !cel(4, 2).vide && cel(6, 2) && /5\s*×\s*60/.test(cel(6, 2).t),
      _det(P && P.rangs.map(r => [r.rang, r.c.map(c => c.t)])));
    t('B-SR-⑥e ⭐ 5 × 100 (02/10) puis 10 × 80 (09/10) : les valeurs RÉELLES, côte à côte — aucun verdict de progression ou de régression (ni flèche, ni « + kg », ni %)',
      cel(1, 0) && /5\s*×\s*100/.test(cel(1, 0).t) && cel(1, 1) && /10\s*×\s*80/.test(cel(1, 1).t)
        && !/📈|📉|⬆|⬇|progress|régress|\+\s?\d+(,\d+)?\s?kg|%/i.test(P.texte), _det({ c10: cel(1, 0), c11: cel(1, 1), extrait: P && P.texte.slice(0, 200) }));
    t('B-SR-⑥f les ÉCHAUFFEMENTS restent consultables, À PART (pas dans la grille de travail) : « 10 × 50 » le 09/10, « 10 × 40 » le 16/10 du soir, « — » ailleurs',
      !!P && P.ech.length === 4 && /—/.test(P.ech[0]) && /10\s*×\s*50/.test(P.ech[1]) && /—/.test(P.ech[2]) && /10\s*×\s*40/.test(P.ech[3])
        && !P.rangs.some(r => r.c.some(c => /×\s*40\b/.test(c.t) || /10\s*×\s*50\b/.test(c.t))), _det(P && { ech: P.ech }));
    t('B-SR-⑥g ⭐ la réserve dans les cases (16/10 du soir) : « RIR 2 », « RIR 0 » (nouveau), l\'échec marqué X sans RIR, l\'ANCIEN 0 « 0 ou échec » ; aucune réserve inventée ailleurs',
      cel(1, 3) && /RIR 2/.test(cel(1, 3).t) && cel(2, 3) && /RIR 0/.test(cel(2, 3).t) && !/ou échec/.test(cel(2, 3).t) && cel(3, 3) && /X/.test(cel(3, 3).t) && !/RIR/.test(cel(3, 3).t)
        && cel(4, 3) && /0 ou échec/.test(cel(4, 3).t) && !/RIR/.test(cel(1, 1).t) && !/RIR/.test(cel(1, 0).t), _det([1, 2, 3, 4].map(r => cel(r, 3))));
    t('B-SR-⑥h les NOTES en lecture seule, avec leur séance : la note de série « cran 4 » (16/10, série 2) et la note de séance « Banc du fond, prise large »',
      !!P && P.notes.some(n => /cran 4/.test(n) && /16\/10/.test(n)) && P.notes.some(n => /Banc du fond, prise large/.test(n)), _det(P && P.notes));
    t('B-SR-⑥i une légende dit comment lire : séries de travail par rang, « — » = pas de série, échauffements à part',
      !!P && /rang/.test(P.leg) && /—/.test(P.leg) && /échauffement/i.test(P.leg), P && P.leg);
    // fermer : rien n'a bougé, la séance continue
    const okF = await clic(X.pg, '#ov-prev4 .p4-fermer');
    const apres = await etat(X), plus1 = await X.pg.evaluate(() => window.__srPlus());
    const ouvert = await X.pg.evaluate(() => !!(document.getElementById('ov-prev4') && document.getElementById('ov-prev4').classList.contains('open')));
    t('B-SR-⑥j ⭐ ouvrir puis fermer la feuille ne touche à RIEN : séance en cours, historique et tout le stockage identiques, aucune écriture ; on est toujours dans la séance',
      okF && !ouvert && apres.wkt === avant.wkt && apres.sessions === avant.sessions && _det(apres.ls) === _det(avant.ls) && apres.ecrits === avant.ecrits
        && await X.pg.evaluate(() => (document.querySelector('.screen.active') || {}).id === 's-log'), _det({ okF, ouvert, ecrits: [avant.ecrits, apres.ecrits] }));
    t('B-SR-⑥k le « + » central n\'a pas bougé (mesuré avant et après la feuille)', _det(plus0) === _det(plus1), _det([plus0, plus1]));
    // la même feuille par le menu ⋯ de l'exercice, à côté de « Statistiques » (qui reste la courbe)
    await X.pg.evaluate(() => openExMenu(0, false)); await X.pg.waitForTimeout(250);
    const menu = await X.pg.evaluate(() => [...document.querySelectorAll('#ov-ex-menu button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()));
    const okM = await clic(X.pg, '#ov-ex-menu button', '4 dernières séances');
    const PM = await lireP4(X);
    t('B-SR-⑥l le menu ⋯ de l\'exercice propose aussi « 4 dernières séances », À CÔTÉ de « Statistiques » — la même feuille, les mêmes 4 séances',
      menu.some(x => /4 dernières séances/.test(x)) && menu.some(x => /Statistiques/.test(x)) && okM && !!PM && _det(PM.cles) === _det(cles), _det({ menu: menu.slice(0, 12), okM }));
    await clic(X.pg, '#ov-prev4 .p4-fermer');
    await X.pg.evaluate(() => openExHistory(S.wkt.exs[0].name)); await X.pg.waitForTimeout(250);
    const stats = await X.pg.evaluate(() => { const o = document.getElementById('ov-ex-hist'); return { open: !!(o && o.classList.contains('open')), svg: !!(o && o.querySelector('svg')), t: o ? o.textContent.replace(/\s+/g, ' ') : '' }; });
    t('B-SR-⑥m « Statistiques » reste la COURBE des charges maximales (complémentaire, inchangée) — elle ne remplace pas la comparaison série par série',
      stats.open && stats.svg && /Poids max · 5 dernières séances/.test(stats.t), stats.t.slice(0, 120));
    await X.pg.evaluate(() => closeExHistory());
    // un autre exercice : SON histoire, pas celle du développé couché
    await ouvrirEx(X, 1);
    const okH2 = await clic(X.pg, '#ex-block-1 .sprev-h');
    const P2 = await lireP4(X);
    t('B-SR-⑥n le rowing (autre exercice) : SA seule séance (12/10), une colonne — l\'historique d\'un exercice n\'emprunte rien à un autre',
      okH2 && !!P2 && P2.cles.length === 1 && P2.cles[0] === String(Date.parse('2026-10-12T18:30:00')) && /1 dernière séance|dernière séance/.test(P2.titre), _det({ okH2, p2: P2 && { cles: P2.cles, titre: P2.titre } }));
    t('B-SR-⑥o aucune erreur de page, aucun appel d\'IA', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
    // un exercice jamais fait : pas de bouton dans l'en-tête ; le menu dit qu'il n'y a rien
    const Y = await ouvrir({ sessions: [], wkt: WKT_4() });
    await ouvrirEx(Y, 0);
    const btn = await Y.pg.evaluate(() => document.querySelectorAll('#ex-block-0 .sprev-h').length);
    await Y.pg.evaluate(() => { if (typeof openDernieresSeances === 'function') openDernieresSeances(0); }); await Y.pg.waitForTimeout(250);
    const PY = await lireP4(Y);
    t('B-SR-⑥p un exercice jamais fait : aucun « ▾ » dans l\'en-tête ; par le menu, la feuille le dit (« pas encore de séance ») — rien d\'inventé',
      btn === 0 && !!PY && /pas encore/i.test(PY.vide) && PY.rangs.length === 0, _det({ btn, vide: PY && PY.vide }));
    await Y.cx.close();
    // la mise en page aux 4 largeurs
    for (const [W, H] of TAILLES) {
      const Q = await ouvrir({ sessions: HISTO_4(), wkt: WKT_4(), w: W, h: H });
      await ouvrirEx(Q, 0);
      const hdr0 = await Q.pg.evaluate(() => { const h = document.querySelector('#ex-block-0 .sets-hdr'); return h ? Math.round(h.getBoundingClientRect().height) : null; });
      const p0 = await Q.pg.evaluate(() => window.__srPlus());
      await clic(Q.pg, '#ex-block-0 .sprev-h');
      const PQ = await lireP4(Q);
      t('B-SR-⑥q ' + W + ' px : la feuille tient dans l\'écran (pas de défilement horizontal de la page, la grille ne déborde pas), en-tête de colonne inchangé en hauteur (' + hdr0 + ' px), « + » immobile',
        !!PQ && PQ.docW <= PQ.vw && PQ.rsheet && PQ.rsheet.x >= -0.5 && PQ.rsheet.r <= PQ.vw + 0.5 && !PQ.tabOver && PQ.rtab && PQ.rtab.r <= PQ.vw + 0.5 && hdr0 !== null && hdr0 <= 40
          && _det(p0) === _det(await Q.pg.evaluate(() => window.__srPlus())), _det(PQ && { docW: PQ.docW, vw: PQ.vw, sheet: PQ.rsheet, tab: PQ.rtab, over: PQ.tabOver, hdr0 }));
      await Q.cx.close();
    }
  }

  /* ══ ⑦ HISTORIQUES DE 2 ET 3 SÉANCES · DROPSET · SUPERSET · EXERCICE REMPLACÉ (familles 9 et 14 du brief) ══════════════ */
  {
    const avecDC = () => HISTO_4().filter(x => x.exs.some(e => e.name === DC && e.sets.some(z => z.done)));
    for (const [n, attendu] of [[2, ['2026-10-16T09:30:00', '2026-10-16T19:30:00']], [3, ['2026-10-09T18:30:00', '2026-10-16T09:30:00', '2026-10-16T19:30:00']]]) {
      const X = await ouvrir({ sessions: avecDC().slice(0, n), wkt: WKT_4() });
      await ouvrirEx(X, 0); await clic(X.pg, '#ex-block-0 .sprev-h');
      const P = await lireP4(X);
      t('B-SR-⑦a historique de ' + n + ' séances : ' + n + ' colonnes, dans l\'ordre chronologique, titre « ' + n + ' dernières séances »',
        !!P && _det(P.cles) === _det(attendu.map(d => String(Date.parse(d)))) && new RegExp(n + ' dernières séances').test(P.titre), _det(P && { cles: P.cles, titre: P.titre }));
      await X.cx.close();
    }
    // dropset : l'en-tête « Palier » n'a pas de « Précédent ▾ » ; le menu ⋯ ouvre la feuille ; ses paliers sont des rangs de travail
    const HD = [sess('2026-10-15', 18, [{ name: DC, dropset: { paliers: 3, pct: 20, direction: 'down' }, sets: [S_(100, 8, 1), S_(80, 8, 1), S_(64, 10, 1)] }])];
    const WD = { date: '__TODAY__', startHour: 18, exs: [{ name: DC, dropset: { paliers: 3, pct: 20, direction: 'down' }, sets: [S_(100, 8), S_(80, 8), S_(64, 8)] }] };
    const D = await ouvrir({ sessions: HD, wkt: WD });
    await ouvrirEx(D, 0);
    const dAvant = await etat(D);
    const nbH = await D.pg.evaluate(() => document.querySelectorAll('#ex-block-0 .sprev-h').length);
    await D.pg.evaluate(() => openExMenu(0, false)); await D.pg.waitForTimeout(250);
    const okD = await clic(D.pg, '#ov-ex-menu button', '4 dernières séances');
    const PD = await lireP4(D);
    await clic(D.pg, '#ov-prev4 .p4-fermer');
    const dApres = await etat(D);
    t('B-SR-⑦b dropset : pas de « Précédent ▾ » dans l\'en-tête « Palier » ; ⋯ → 4 dernières séances montre les 3 paliers de la dernière fois (100 × 8, 80 × 8, 64 × 10) par rang ; rien n\'est écrit, le dropset est intact',
      nbH === 0 && okD && !!PD && PD.rangs.length === 3 && /8\s*×\s*100/.test(PD.rangs[0].c[0].t) && /10\s*×\s*64/.test(PD.rangs[2].c[0].t)
        && dApres.wkt === dAvant.wkt && dApres.ecrits === dAvant.ecrits && /"dropset":\{"paliers":3/.test(dApres.wkt), _det({ nbH, okD, r: PD && PD.rangs.map(r => r.c.map(c => c.t)) }));
    await D.cx.close();
    // superset : deux questions, chacune à SA série ; « Échec » de la 2ᵉ ne touche pas la 1ʳᵉ ; chaque feuille = son exercice
    const HS = [sess('2026-10-15', 18, [{ name: DC, group: 'g1', groupType: 'super', sets: [S_(60, 10, 1)] }, { name: RB, group: 'g1', groupType: 'super', sets: [S_(50, 12, 1)] }])];
    const WS = { date: '__TODAY__', startHour: 18, exs: [{ name: DC, group: 'g1', groupType: 'super', sets: [S_(60, 10, 1), S_(60, 10)] }, { name: RB, group: 'g1', groupType: 'super', sets: [S_(50, 10, 1), S_(50, 10)] }] };
    const SS = await ouvrir({ sessions: HS, wkt: WS });
    await SS.pg.evaluate(() => { _rirCible = [{ ei: 0, si: 0 }, { ei: 1, si: 0 }]; _renderRirRow(); });
    const okE = await SS.pg.evaluate(() => { const qs = [...document.querySelectorAll('#rest-rir .rir-row')]; const b = qs[1] && [...qs[1].querySelectorAll('.rir-b')].find(x => x.textContent.trim() === 'Échec'); if (!b) return false; b.click(); return true; });
    await SS.pg.waitForTimeout(200);
    const ok0 = await SS.pg.evaluate(() => { const qs = [...document.querySelectorAll('#rest-rir .rir-row')]; const b = qs[0] && [...qs[0].querySelectorAll('.rir-b')].find(x => x.textContent.trim() === '0'); if (!b) return false; b.click(); return true; });
    await SS.pg.waitForTimeout(200);
    const ssEtat = await SS.pg.evaluate(() => S.wkt.exs.map(e => { const x = e.sets[0]; return [e.name.split(' ')[0], x.type, x.rir === undefined ? '∅' : x.rir, x.rirV === undefined ? '∅' : x.rirV]; }));
    t('B-SR-⑦c superset : deux questions, chacune à SA série — « Échec » sur la 2ᵉ pose X sur le rowing seul, « 0 » sur la 1ʳᵉ pose un RIR 0 sur le développé couché seul',
      okE && ok0 && _det(ssEtat) === _det([['Développé', 'N', 0, 2], ['Rowing', 'X', '∅', '∅']]), _det({ okE, ok0, ssEtat }));
    await SS.pg.evaluate(() => { if (typeof openDernieresSeances === 'function') openDernieresSeances(1); }); await SS.pg.waitForTimeout(200);
    const PS = await lireP4(SS);
    t('B-SR-⑦d superset : la feuille du rowing est celle du rowing (12 × 50 le 15/10), pas celle du développé couché',
      !!PS && /Rowing Barre/.test(PS.texte) && PS.rangs.length === 1 && /12\s*×\s*50/.test(PS.rangs[0].c[0].t), _det(PS && { r: PS.rangs.map(r => r.c.map(c => c.t)) }));
    await SS.cx.close();
    // exercice remplacé (rien de fait) : « Précédent » et la feuille suivent le REMPLAÇANT (D-046), jamais l'historique du remplacé
    const R = await ouvrir({ sessions: HISTO_4(), wkt: { date: '__TODAY__', startHour: 18, exs: [{ name: DC, sets: [S_(60, 10), S_(60, 10)] }] } });
    // le vrai chemin : menu ⋯ de l'exercice → « Remplacer l'exercice » → le sélecteur → le squat
    await R.pg.evaluate(() => openExMenu(0, false)); await R.pg.waitForTimeout(250);
    const okMenu = await clic(R.pg, '#ov-ex-menu button', 'Remplacer');
    await R.pg.evaluate(() => addExercise('Squat à la Barre')); await R.pg.waitForTimeout(800);
    // la question « pourquoi ce changement ? » s'ouvre 420 ms après : on y répond « plus tard » par SA porte de fermeture
    await R.pg.evaluate(() => { const o = document.getElementById('ov-ex-swap'); if (o && o.classList.contains('open') && typeof closeExSwap === 'function') closeExSwap(); });
    await nettoyer(R.pg);
    await ouvrirEx(R, 0);
    const colR = await R.pg.evaluate(() => window.__srPrecCol(0));
    const nomR = await R.pg.evaluate(() => S.wkt.exs[0].name);
    const okR = await clic(R.pg, '#ex-block-0 .sprev-h');
    const PR = await lireP4(R);
    t('B-SR-⑦e exercice REMPLACÉ : le squat prend la place, sa colonne « Précédent » montre SA dernière fois (5×100), et la feuille ses séances à lui (14/10) — rien du développé couché',
      okMenu && nomR === SQ && !!colR && colR[0].v === '5×100' && okR && !!PR && _det(PR.cles) === _det([String(Date.parse('2026-10-14T18:30:00'))]) && !/Développé/.test(PR.texte),
      _det({ okMenu, nomR, col: colR && colR.map(c => c.v), okR, cles: PR && PR.cles }));
    t('B-SR-⑦f aucune erreur de page, aucun appel d\'IA (dropset, superset, remplacement)', R.errs.length === 0 && appelsIA(R).length === 0, R.errs.concat(appelsIA(R)).join(' | ').slice(0, 200));
    await R.cx.close();
  }
  /* ══ ⑧ LE LOT FINAL ft-v1257 (consigne de Michel du 20/10, audit production ↔ clone : A1, A2, A3 et la réserve R1) ══════════
     ① les aides des séries décrivent la PASTILLE N / É / X que chaque série porte (D-086 ①) — l'aide « ? » de Séance, la fenêtre
       « Types de série » et l'aide détaillée : plus de « touche le numéro », plus de « N non affiché » ;
     ② la capture de la diapo « Ta séance » du Guide montre l'écran d'aujourd'hui : son « Terminer » a la couleur de celui de
       l'écran, et le doigt de la diapo tombe sur le ✓ de la série en cours ;
     ③ le « Terminer » de la fenêtre de fin de séance est en Cobalt (le rouge est réservé au destructif, D-085 B), en sombre, en
       clair et en vision basse — et il fait exactement ce qu'il faisait (fermer, revenir à l'Accueil, la séance enregistrée) ;
     ④ la carte de l'historique dit « kg de travail » : le même nombre que « dont … kg de travail » du détail.
     ⛔ Ce que ces témoins ne couvrent pas : le rendu de la capture sur l'iPhone (taille du texte, netteté). ══════════════════════ */
  {
    const X = await ouvrir({ sessions: HISTO_GUIDE(), wkt: WKT_X() });
    // les pastilles réellement affichées sur les séries (É, N, X, N) : c'est ce que les aides doivent décrire
    await ouvrirEx(X, 0);
    const pastilles = await X.pg.evaluate(() => [0, 1, 2, 3].map(si => { const b = document.querySelector('#tbtn-0-' + si + ' .tbtn'); return b ? b.textContent.trim() : null; }));
    // ① l'aide « ? » de Séance, par son vrai chemin : ⋯ de la séance → « Aide de l'écran Séance »
    const okMenu = await clic(X.pg, '[onclick*="openWktMenu("]');
    const okAide = okMenu && await clic(X.pg, '#ov-wkt-menu [onclick*="showHelp()"]');
    const aideTags = await X.pg.evaluate(() => { const it = [...document.querySelectorAll('#help-content .help-item-text')].find(e => /Tags de série/.test(e.textContent));
      return it ? it.textContent.replace(/\s+/g, ' ') : ''; });
    await nettoyer(X.pg);
    t('B-SR-⑧a ⭐ l\'aide « ? » de Séance (⋯ → Aide de l\'écran Séance) décrit la PASTILLE de la série : « pastille », N, É et X — plus « touche le numéro », plus « non affiché »',
      _det(pastilles) === _det(['É', 'N', 'X', 'N']) && okAide && /pastille/i.test(aideTags) && /N = Normal/.test(aideTags) && /É = Échauffement/.test(aideTags) && /X = Échec/.test(aideTags)
        && !/num[ée]ro/i.test(aideTags) && !/non affich/i.test(aideTags), _det({ pastilles, okAide, aideTags: aideTags.slice(0, 220) }));
    // ① la fenêtre « Types de série », par son vrai chemin : ⋯ de l'exercice → « Types de série »
    await X.pg.evaluate(() => openExMenu(0, false)); await X.pg.waitForTimeout(250);
    const okTypes = await clic(X.pg, '#ov-ex-menu button', 'Types de série');
    const th = await X.pg.evaluate(() => { const ov = document.getElementById('ov-type-help'); if (!ov || !ov.classList.contains('open')) return null;
      const lignes = [...ov.querySelectorAll('div')].filter(d => d.children.length === 2 && d.children[0].tagName === 'SPAN' && d.children[0].textContent.trim().length <= 2);
      return { badges: lignes.map(d => d.children[0].textContent.trim()), noms: lignes.map(d => ((d.children[1].querySelector('div') || {}).textContent || '').replace(/\s+/g, ' ').trim()),
        types: (typeof SET_TYPES !== 'undefined' ? SET_TYPES.slice() : []), libelles: (typeof SET_TYPE_LABELS !== 'undefined' ? Object.assign({}, SET_TYPE_LABELS) : {}),
        texte: ov.textContent.replace(/\s+/g, ' ') }; });
    await nettoyer(X.pg);
    t('B-SR-⑧b ⭐ « Types de série » (⋯ → Types de série) montre les MÊMES lettres que les pastilles (N, É, X — chacune avec son nom), plus de « — » ; la consigne dit de toucher la pastille, plus le numéro ; plus de « non affiché »',
      okTypes && !!th && _det(th.badges.slice().sort()) === _det(th.types.slice().sort()) && th.badges.every((b, i) => th.noms[i].indexOf(th.libelles[b]) === 0)
        && /pastille/i.test(th.texte) && !/num[ée]ro de la s[ée]rie/i.test(th.texte) && !/non affich/i.test(th.texte), _det(th && { badges: th.badges, noms: th.noms, types: th.types }));
    // ① l'aide détaillée (Menu → Aide détaillée)
    const det = await X.pg.evaluate(() => { if (typeof openDrawerContent !== 'function') return 'absente'; openDrawerContent('help');
      const b = document.getElementById('drawer-cnt-body'); const txt = b ? b.textContent.replace(/\s+/g, ' ') : '';
      const i = txt.indexOf('Tags de série'); return i < 0 ? '' : txt.slice(i, i + 260); });
    await nettoyer(X.pg);
    t('B-SR-⑧c l\'aide détaillée (« Tags de série ») ne dit plus « N … non affiché » : elle parle de la pastille',
      /Tags de série/.test(det) && /pastille/i.test(det) && !/non affich/i.test(det), det.slice(0, 200));
    t('B-SR-⑧d aucune erreur de page, aucun appel d\'IA (aides)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }
  {
    // ② la diapo « Ta séance » du Guide, mesurée CONTRE l'écran actuel (390 × 844, le format de la capture)
    const G = await ouvrir({ sessions: HISTO_GUIDE(), wkt: WKT_GUIDE() });
    await ouvrirEx(G, 0);
    const g = await G.pg.evaluate(async () => {
      const sl = (typeof APP_GUIDE_SLIDES !== 'undefined' ? APP_GUIDE_SLIDES : []).filter(s => s && s.t === 'Ta séance');
      if (sl.length !== 1) return { n: sl.length };
      const s = sl[0], img = new Image(); img.src = s.img;
      const ok = await new Promise(r => { img.onload = () => r(true); img.onerror = () => r(false); });
      if (!ok) return { n: 1, img: s.img, charge: false };
      const W = innerWidth, H = innerHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
      const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, W, H);
      const fin = document.querySelector('#tb-seance .tbs-fin'), chk = document.querySelector('#sr-0-3 .chk');
      if (!fin || !chk) return { n: 1, charge: true, fin: !!fin, chk: !!chk };
      const b = fin.getBoundingClientRect();
      const d = cx.getImageData(Math.round(b.left + 4), Math.round(b.top + 4), Math.max(1, Math.round(b.width - 8)), Math.max(1, Math.round(b.height - 8))).data;
      const R = [], V = [], B = []; for (let i = 0; i < d.length; i += 4) { R.push(d[i]); V.push(d[i + 1]); B.push(d[i + 2]); }
      const med = a => a.sort((x, y) => x - y)[a.length >> 1];
      const vivant = getComputedStyle(fin).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      const k = chk.getBoundingClientRect();
      return { n: 1, charge: true, nw: img.naturalWidth, nh: img.naturalHeight, image: [med(R), med(V), med(B)], vivant, tap: s.tap,
        chk: [k.left, k.top, k.right, k.bottom], W, H, cap: s.cap || '' }; });
    const dist = g && g.image && g.vivant ? Math.round(Math.hypot(g.image[0] - g.vivant[0], g.image[1] - g.vivant[1], g.image[2] - g.vivant[2])) : null;
    t('B-SR-⑧e la diapo « Ta séance » existe une seule fois, son image se charge au format de l\'écran (780 × 1688 = 390 × 844 en ×2)',
      !!g && g.n === 1 && g.charge === true && g.nw === 780 && g.nh === 1688, _det(g && { n: g.n, charge: g.charge, nw: g.nw, nh: g.nh }));
    t('B-SR-⑧f ⭐ la capture montre l\'écran d\'AUJOURD\'HUI : à l\'endroit du « Terminer » de l\'écran, l\'image a SA couleur (Cobalt) — l\'ancienne capture le montrait rouge',
      dist !== null && dist <= 60, _det({ image: g && g.image, vivant: g && g.vivant, dist }));
    const tx = g && g.tap ? g.tap[0] * g.W : -1, ty = g && g.tap ? g.tap[1] * g.H : -1, M = 6;
    t('B-SR-⑧g ⭐ le doigt de la diapo tombe sur le ✓ de la série EN COURS (4ᵉ série du développé couché) de l\'écran d\'aujourd\'hui',
      !!g && !!g.chk && tx >= g.chk[0] - M && tx <= g.chk[2] + M && ty >= g.chk[1] - M && ty <= g.chk[3] + M, _det({ tap: g && g.tap, px: [Math.round(tx), Math.round(ty)], chk: g && g.chk && g.chk.map(Math.round) }));
    t('B-SR-⑧h aucune erreur de page, aucun appel d\'IA (diapo du Guide)', G.errs.length === 0 && appelsIA(G).length === 0, G.errs.concat(appelsIA(G)).join(' | ').slice(0, 200));
    await G.cx.close();
  }
  {
    // ③ le « Terminer » de la fenêtre de fin de séance : la couleur des actions de séance, le même geste
    const X = await ouvrir({ wkt: WKT_RECETTE(true) });
    const avant = await X.pg.evaluate(() => (S.sessions || []).length);
    const r = await terminer(X);
    const couleurs = await X.pg.evaluate(async () => {
      const root = document.getElementById('root'), ov = document.getElementById('ov-session-end');
      const btn = ov && [...ov.querySelectorAll('button')].find(b => b.textContent.trim() === 'Terminer');
      if (!btn) return null;
      const sonde = document.createElement('div'); sonde.style.background = 'var(--sea-fill)'; ov.appendChild(sonde);
      const lire = async cls => { root.classList.add(...cls); await new Promise(z => setTimeout(z, 350));
        const cs = getComputedStyle(btn), o = { mode: cls.join('+') || 'sombre', fond: cs.backgroundColor, image: cs.backgroundImage, texte: cs.color, cobalt: getComputedStyle(sonde).backgroundColor, rouge: btn.classList.contains('btn-red') };
        root.classList.remove(...cls); return o; };
      const out = [await lire([]), await lire(['light-mode']), await lire(['a11y-lv'])];
      sonde.remove(); await new Promise(z => setTimeout(z, 350));
      return { out, onclick: btn.getAttribute('onclick'), texte: btn.textContent.trim() }; });
    t('B-SR-⑧i ⭐ fin de séance : le bouton « Terminer » est en Cobalt (la couleur des actions de séance, le jeton --sea-fill), texte blanc, sans dégradé rouge — en sombre, en clair et en vision basse',
      r.okT && !!couleurs && couleurs.out.every(o => o.fond === o.cobalt && o.image === 'none' && o.texte === 'rgb(255, 255, 255)' && !o.rouge), _det(couleurs));
    // le même geste qu'avant : fermer, revenir à l'Accueil, la séance reste enregistrée
    const okClic = await clic(X.pg, '#ov-session-end button', 'Terminer');
    const apres = await X.pg.evaluate(() => ({ ouverte: document.getElementById('ov-session-end').classList.contains('open'), ecran: window._curScreen, n: (S.sessions || []).length, seance: _seanceOuverte() }));
    t('B-SR-⑧j le « Terminer » de la fin fait exactement ce qu\'il faisait : onclick closeSessionEnd() inchangé, la fenêtre se ferme, retour à l\'Accueil, la séance est enregistrée une fois',
      !!couleurs && couleurs.onclick === 'closeSessionEnd()' && couleurs.texte === 'Terminer' && okClic && !apres.ouverte && apres.ecran === 'home' && apres.n === avant + 1 && !apres.seance,
      _det({ onclick: couleurs && couleurs.onclick, okClic, apres, avant }));
    t('B-SR-⑧k aucune erreur de page, aucun appel d\'IA (fin de séance)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }
  {
    // ④ la carte de l'historique : « kg de travail », le même nombre que le détail ; elle tient sur iPhone
    const sansEch = sess(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date()), 7, [{ name: DC, sets: [S_(60, 10, 1), S_(60, 10, 1), S_(60, 8, 1)] }], { volume: 1680, duration: 3900, calories: 420 });   // 600 + 600 + 480 ; durée et calories : la ligne la plus longue
    for (const [W, H] of [[320, 640]].concat(TAILLES)) {
      const Q = await ouvrir({ sessions: [sansEch].concat(HISTO_GUIDE()), w: W, h: H });
      const q = await Q.pg.evaluate(async () => { goSessionsHistory(); await new Promise(z => setTimeout(z, 700));
        const cartes = [...document.querySelectorAll('#sess-list .sess-card')];
        const c0 = cartes.find(c => /Développé Couché/.test(c.textContent) && !/Pousser/.test(c.textContent));
        const v = c0 && c0.querySelector('.sess-vol2'), m = c0 && c0.querySelector('.sess-meta');
        const rv = v && v.getBoundingClientRect(), rc = c0 && c0.getBoundingClientRect();
        const s = S.sessions.find(x => !x.progLabel); openSessDetail(s.ts || s.id);
        const sub = ((document.getElementById('sd-sub') || {}).textContent || '').replace(/\s+/g, ' ');
        return { n: cartes.length, vol: v ? v.textContent.trim() : null, sub, deborde: !!m && m.scrollWidth > m.clientWidth + 0.5,
          dedans: !!rv && !!rc && rv.left >= rc.left - 0.5 && rv.right <= rc.right + 0.5, docW: document.documentElement.scrollWidth, vw: innerWidth }; });
      t('B-SR-⑧l ' + W + ' px : une séance sans échauffement — la carte dit « 1680 kg de travail », le détail « 1 680 kg total » (le même nombre) ; la ligne (date · volume · durée · calories) passe à la ligne dans la carte, pas de défilement horizontal',
        q.vol === '1680 kg de travail' && /^1\s?680 kg total/.test(nb(q.sub)) && !q.deborde && q.dedans && q.docW <= q.vw, _det(q));
      await Q.cx.close();
    }
  }
}

module.exports = { ecran };
