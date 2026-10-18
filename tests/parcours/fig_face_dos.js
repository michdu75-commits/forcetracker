/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
   🧍🧍 « TA SÉANCE JUSQU'ICI » : FACE · CHIFFRES · DOS (18/10/2026, décision D-091 de Michel, blocs B-FFD-*) — branche locale
   claude/ux-fig-face-dos-v2. La figurine de FACE à gauche, les chiffres de la séance au centre (durée, séries, volume), la
   figurine de DOS à droite, visibles ENSEMBLE, sans appui ni alternance. Les deux sont les vraies figurines de l'app : la
   petite figurine (`_mscSVGmini`), le dos étant le dessin de la grande figurine « Muscles travaillés » (`_BP`), colorées par
   le même moteur (`_mscScores` → `_MG`). Remplace la proposition « une figurine à retourner » (D-090).
   Ce que les témoins CONDUISENT : la vraie app servie en local, de vrais gestes — toucher, coche d'une série, ouverture d'un
   exercice, « Ajouter un exercice » → recherche → choix, barre du bas et « + », « Terminer la séance » → « Terminer quand
   même », un vrai rechargement —, 4 largeurs d'iPhone, de longues valeurs, le mode « texte agrandi ».
   Ce qu'ils OBSERVENT : les deux dessins (cadre, tracés, couleur de CHAQUE zone) comparés à deux oracles indépendants du
   dessin de la petite figurine — la grande figurine dessinée par son propre code, et les données (`_mscScores` + `_MG`) ;
   la position de chaque bloc dans la carte ; les chiffres recalculés ici ; la séance, l'historique et tout le stockage relus
   avant / après ; chaque écriture du stockage (espion) ; chaque requête (réseau coupé et compté) ; le « + ».
   Ce qu'ils NE COUVRENT PAS : Safari / l'iPhone réel, la lisibilité ressentie, la question « un échauffement SEUL colore-t-il
   la figurine ? » (comportement existant, à trancher — les séances du banc l'évitent exprès), Milo (aucun appel).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE = { ft4_bw: '82', ft4_age: '41', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_lms: '2026-10' };
const _det = o => JSON.stringify(o);
const SDT = 'Soulevé de Terre', DC = 'Développé Couché', SQ = 'Squat à la Barre', TR = 'Tractions (Pull-up)', DM = 'Développé Militaire',
  CB = 'Curl Barre', RB = 'Rowing Barre (Tirage Horizontal)', HT = 'Hip Thrust Barre (Poussée de Hanche)', LC = 'Leg Curl Couché Machine', CR = 'Crunch';
const S_ = (kg, reps, done, type) => ({ kg, reps, done: !!done, type: type || 'N' });
const HISTO = () => {
  const s = (date, exs) => { const ts = Date.parse(date + 'T18:00:00'); return { id: ts, ts, date, synced: true, volume: 3000, exs }; };
  return [s('2026-10-14', [{ name: SQ, sets: [S_(100, 5, 1), S_(100, 5, 1)] }]), s('2026-10-10', [{ name: CB, sets: [S_(30, 10, 1)] }])];
};
/* La séance EN COURS : le soulevé de terre a son échauffement et 2 séries de travail faites ; le développé couché n'a AUCUNE série
   faite (même pas l'échauffement : la question « un échauffement SEUL colore-t-il ? » n'est pas celle-ci). */
const WKT = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 41 * 60000, exs: [
  { name: SDT, sets: [S_(60, 8, 1, 'É'), S_(100, 10, 1), S_(120, 5, 1), S_(120, 5)] },
  { name: DC, sets: [S_(40, 10, 0, 'É'), S_(80, 8), S_(80, 8)] } ] });
// Les plus longues valeurs plausibles : 112 min, 24 séries, 37 440 kg.
const WKT_LONG = () => ({ date: '__TODAY__', startHour: 18, startTs: Date.now() - 112 * 60000, exs: [
  { name: SDT, sets: Array.from({ length: 12 }, () => S_(250, 8, 1)) }, { name: DC, sets: Array.from({ length: 12 }, () => S_(140, 8, 1)) } ] });
// Cardio seul : pas de figurine (rien de musculaire), la carte reste celle d'avant.
const WKT_CARDIO = () => ({ date: '__TODAY__', startHour: 18, exs: [], cardio: { type: 'velo', duration: 20 } });
const TAILLES = [[360, 740], [375, 667], [390, 844], [430, 932]];
const FACE = '1 0 32 94', DOS = '36 0 32 94';
const IA = ['coach', 'summarizeCoach', 'seanceJson', 'importProgram', 'importHistory', 'importBodyScan', 'importBloodTest', 'foodLabel', 'readBarcode',
  'morphoAnalysis', 'bodyStudy', 'estimateFood', 'importMealPlan', 'generateMealPlan'];

/* Lectures DANS la page. Deux oracles indépendants du dessin de la petite figurine : ① la GRANDE figurine (« Muscles travaillés »,
   `_mscSVG`, son propre code de couleurs) ; ② les données (`_mscScores` → niveau par groupe → zones de `_MG`). */
const AIDE = `(()=>{
  const NM={'#FF5555':'p','#FF9500':'s','#8FA9C4':'i','#C07060':'b','#D89070':'peau'};
  const NG={'url(#g-prim)':'p','url(#g-sec)':'s','url(#g-ind)':'i','url(#g-base)':'b','url(#g-skin)':'peau'};
  const lireFig=f=>{ const sv=f&&f.querySelector('svg'); if(!sv) return null;
    return { vb:sv.getAttribute('viewBox'), n:sv.querySelectorAll('path').length, niv:[...sv.querySelectorAll('path')].map(p=>NM[p.getAttribute('fill')]||'?'),
      svg:sv.outerHTML, role:f.getAttribute('role'), aria:f.getAttribute('aria-label')||'', tag:f.tagName, clic:!!(f.onclick||f.getAttribute('onclick')),
      vis:f.offsetWidth>0&&f.offsetHeight>0&&getComputedStyle(f).visibility!=='hidden'&&parseFloat(getComputedStyle(f).opacity)>0 }; };
  window.__ffdLire=()=>{ const c=document.querySelector('#log-finish .lf-bilan'); if(!c) return null;
    const figs=[...c.querySelectorAll('.lf-fig')];
    return { n:figs.length, figs:figs.map(lireFig), deux:c.classList.contains('lf-2fig'), ordre:[...c.children].map(e=>e.classList.contains('lf-fig')?'fig':(e.classList.contains('lf-t')?'chiffres':e.className)),
      kv:[...c.querySelectorAll('.lf-kv > div')].map(d=>[(d.querySelector('span')||{}).textContent,(d.querySelector('b')||{}).textContent]),
      cardio:(c.querySelector('.lf-cardio')||{}).textContent||'' }; };
  window.__ffdOracle=()=>{ const faits=((S.wkt&&S.wkt.exs)||[]).filter(ex=>(ex.sets||[]).some(s=>s.done)); const r=_mscScores(faits);
    const big=new DOMParser().parseFromString(_mscSVG(r),'image/svg+xml'); const g=[...big.querySelectorAll('path')].map(p=>NG[p.getAttribute('fill')]||'?');
    const grp={}; Object.entries(_MG).forEach(([k,d])=>d.paths.forEach(id=>{grp[id]=k;}));
    const niv=k=>{const v=r.sc[k]||0; return v>=2?'p':v>=1?'s':(r.ind[k]&&!v)?'i':'b';};
    const att=a=>a.map(([id])=>id?(grp[id]?niv(grp[id]):'b'):'peau');
    const trav=((S.wkt&&S.wkt.exs)||[]).reduce((a,ex)=>a.concat((ex.sets||[]).filter(s=>s.done&&s.type!=='É'&&s.type!=='W')),[]);
    return { nF:_FP.length, nB:_BP.length, face:{grande:g.slice(0,_FP.length),donnees:att(_FP)}, dos:{grande:g.slice(_FP.length,_FP.length+_BP.length),donnees:att(_BP)},
      grpF:_FP.map(([id])=>id?(grp[id]||null):null), grpB:_BP.map(([id])=>id?(grp[id]||null):null),
      groupes:Object.keys(_MG).filter(k=>niv(k)!=='b'), series:String(trav.length),
      volume:Math.round(trav.reduce((b,s)=>b+(s.kg||0)*(s.reps||0),0)).toLocaleString('fr-FR')+' kg' }; };
  window.__ffdMesure=()=>{ const c=document.querySelector('#log-finish .lf-bilan'); if(!c) return null; c.scrollIntoView({block:'center'});
    const R=e=>{ if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; };
    const figs=[...c.querySelectorAll('.lf-fig')], t=c.querySelector('.lf-t');
    const inter=(a,b)=>(a&&b)?Math.max(0,Math.min(a.r,b.r)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.y,b.y)):0;
    const vals=[...c.querySelectorAll('.lf-kv b')].map(b=>({ t:b.textContent, r:R(b), coupe:b.scrollWidth>b.clientWidth+0.5, fs:parseFloat(getComputedStyle(b).fontSize) }));
    const cadre=f=>{ const sv=f.querySelector('svg'); try{ const k=sv.getBBox(), v=sv.getAttribute('viewBox').split(' ').map(Number);
      return k.x>=v[0]-0.01&&k.x+k.width<=v[0]+v[2]+0.01&&k.y>=v[1]-0.01&&k.y+k.height<=v[1]+v[3]+0.01; }catch(e){ return false; } };
    const p=document.querySelector('#nb-log .nb-plus');
    const rf=figs.map(f=>R(f)), rt=R(t), rc=R(c);
    return { carte:rc, figs:rf, t:rt, vals, cadres:figs.map(cadre), ombre:figs.map(f=>getComputedStyle(f).filter||''),
      chevauche:Math.max(0,...rf.map(a=>inter(a,rt)), ...vals.map(v=>Math.max(0,...rf.map(a=>inter(a,v.r))))),
      dedans:rf.concat(vals.map(v=>v.r)).every(a=>a.x>=rc.x-0.5&&a.r<=rc.r+0.5&&a.y>=rc.y-0.5&&a.b<=rc.b+0.5),
      docW:document.documentElement.scrollWidth, vw:innerWidth, plus:R(p),
      anims:(document.getAnimations?document.getAnimations().filter(a=>a.effect&&a.effect.target&&c.contains(a.effect.target)).length:0) }; };
})();`;

async function ecran(t, b, PORT) {
  const ouvrir = async (opts) => {
    opts = opts || {};
    const W = opts.w || 390, H = opts.h || 844;
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, timezoneId: 'Europe/Paris', locale: 'fr-FR', hasTouch: true });
    /* toutes les requêtes hors du serveur local : coupées et notées. ⚠️ L'app en fait d'elle-même au démarrage (image du QR de partage,
       synchro du compte) — comportement d'avant, sans rapport avec la carte : les témoins comptent ① les appels d'IA (Milo compris)
       sur tout le parcours, et ② TOUTE requête pendant une fenêtre d'affichages répétés, une fois l'app redevenue calme. */
    const req = [];
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { const pd = String(rt.request().postData() || '');
      const m = /"action":"([A-Za-z]+)"/.exec(pd) || /[?&]action=([A-Za-z]+)/.exec(rt.request().url());
      req.push({ url: rt.request().url().slice(0, 70), action: m ? m[1] : '' }); return rt.abort(); });
    const init = Object.assign({}, BASE, { ft4_sessions: JSON.stringify(opts.sessions || HISTO()) });
    const w = opts.wkt === undefined ? WKT() : opts.wkt;
    if (w) { init.ft4_wkt = JSON.stringify(w); init.ft4_wkt_draft = JSON.stringify(w); }
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_ffd'))return; sessionStorage.setItem('_ffd','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){} })();`);
    await cx.addInitScript(`(()=>{ window.__ecrits=[]; const si=Storage.prototype.setItem, ri=Storage.prototype.removeItem;
      Storage.prototype.setItem=function(k,v){ try{ if(this===window.localStorage) window.__ecrits.push(String(k)); }catch(e){} return si.apply(this,arguments); };
      Storage.prototype.removeItem=function(k){ try{ if(this===window.localStorage) window.__ecrits.push('-'+String(k)); }catch(e){} return ri.apply(this,arguments); };
      window.__fetchN=0; const f=window.fetch; window.fetch=function(){ window.__fetchN++; return f.apply(this,arguments); }; })();`);
    await cx.addInitScript(AIDE);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 160)));
    const toasts = []; await pg.exposeFunction('__toastVu', m => toasts.push(String(m).slice(0, 140)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const X = { cx, pg, errs, req, toasts, W, H };
    await apresChargement(X);
    return X;
  };
  /* `toast` est enveloppée APRÈS le chargement (une déclaration `function toast(){}` écrase ce qui serait posé avant). */
  const apresChargement = async X => {
    await X.pg.evaluate(() => { const o = window.toast; window.toast = function (m) { try { window.__toastVu(m); } catch (e) {} return o.apply(this, arguments); }; });
    await nettoyer(X.pg);
    await X.pg.evaluate(() => { if (S.wkt && S.wkt.date === '__TODAY__') { S.wkt.date = today(); persist(); } });
    await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); });
    await X.pg.waitForTimeout(250);
  };
  const nettoyer = pg => pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    const ob = document.getElementById('onboarding'); if (ob) ob.style.display = 'none'; });
  const lire = X => X.pg.evaluate(() => window.__ffdLire());
  const oracle = X => X.pg.evaluate(() => window.__ffdOracle());
  const mesure = X => X.pg.evaluate(() => window.__ffdMesure());
  const appelsIA = X => X.req.filter(r => IA.includes(r.action)).map(r => r.action);
  const snap = X => X.pg.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
    return { ls: o, wkt: JSON.stringify(S.wkt), sessions: JSON.stringify(S.sessions), ecrits: window.__ecrits.length, fetchN: window.__fetchN,
      overlays: document.querySelectorAll('.overlay.open').length, ecran: (document.querySelector('.screen.active') || {}).id || '' }; });
  /* L'app redevient CALME : ni écriture, ni requête pendant 5 s d'affilée (la synchro différée part 4 s après un enregistrement). */
  const attendreCalme = async X => { let prec = null, stables = 0;
    for (let i = 0; i < 25; i++) { const e = await X.pg.evaluate(() => [window.__ecrits.length, window.__fetchN]); const cle = _det(e.concat([X.req.length]));
      stables = cle === prec ? stables + 1 : 0; prec = cle; if (stables >= 5) return true; await X.pg.waitForTimeout(1000); }
    return false; };
  const visible = (pg, sel) => pg.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect();
      const cs = getComputedStyle(x); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; }); if (!e) return false;
    e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === e || e.contains(top)); }, sel);
  const clic = async (pg, sel, txt) => { let loc = pg.locator(sel).filter({ visible: true }); if (txt) loc = loc.filter({ hasText: txt });
    if (!(await loc.count())) return false; try { await loc.first().click({ timeout: 2500 }); } catch (e) { return false; } await pg.waitForTimeout(250); return true; };
  // Niveaux : zones colorées et groupes vus dans une vue (par index de tracé ↔ groupe de `_MG`).
  const groupesVus = (niv, grp) => [...new Set(niv.map((v, i) => (v === 'p' || v === 's' || v === 'i') ? grp[i] : null).filter(Boolean))];
  const conforme = (F, O, vue) => !!F && !!O && _det(F.niv) === _det(O[vue].grande) && _det(F.niv) === _det(O[vue].donnees);
  const diffNiv = (F, O, vue) => { if (!F || !O) return 'pas de figurine ' + vue; const d = []; F.niv.forEach((v, i) => { if (v !== O[vue].donnees[i]) d.push(i + ':' + v + '≠' + O[vue].donnees[i] + '(' + ((vue === 'face' ? O.grpF : O.grpB)[i] || 'peau') + ')'); });
    return vue + ' ' + (d.slice(0, 6).join(' ') || F.niv.length + ' tracés'); };
  // Les deux vues présentes, dans l'ordre face · chiffres · dos, chacune dans SON cadre
  const deuxVues = (L, O) => !!L && L.n === 2 && L.deux && !!L.figs[0] && !!L.figs[1] && L.figs[0].vis && L.figs[1].vis && L.figs[0].vb === FACE && L.figs[0].n === O.nF && L.figs[1].vb === DOS && L.figs[1].n === O.nB
    && _det(L.ordre) === _det(['fig', 'chiffres', 'fig']);
  const kvConforme = (L, O) => !!L && !!O && L.kv.length === 3 && L.kv[1][1] === O.series && L.kv[2][1] === O.volume && /min$/.test(L.kv[0][1] || '');
  const ajouterExercice = async (X, porte, q, nom) => {
    const o = await clic(X.pg, porte);
    if (!o) return false;
    await X.pg.fill('#ex-search', q); await X.pg.waitForTimeout(300);
    const ok = await clic(X.pg, '#ex-list .ex-pick', nom);
    await X.pg.evaluate(() => { if (typeof closeExPicker === 'function') closeExPicker(); }); await X.pg.waitForTimeout(250);
    return ok && await X.pg.evaluate(nom => !!(S.wkt && S.wkt.exs.some(e => e.name === nom)), nom);
  };
  const cocher = async (X, ei, si) => { const sel = '#sr-' + ei + '-' + si + ' .chk';
    if (!(await visible(X.pg, sel))) await clic(X.pg, '#ex-block-' + ei + ' .ex-hdr');
    if (!(await visible(X.pg, sel))) await clic(X.pg, '#ex-block-' + ei);
    const ok = await clic(X.pg, sel); await nettoyer(X.pg); await X.pg.waitForTimeout(150);
    return ok && await X.pg.evaluate(([ei, si]) => !!(S.wkt && S.wkt.exs[ei] && S.wkt.exs[ei].sets[si] && S.wkt.exs[ei].sets[si].done), [ei, si]); };
  // La mise en page d'une carte à deux figurines : rien ne déborde, rien ne se chevauche, chaque chiffre entier et lisible.
  const pageOK = m => !!m && m.figs.length === 2 && m.docW <= m.vw && m.dedans && m.chevauche === 0 && m.cadres.every(Boolean)
    && m.vals.length >= 3 && m.vals.every(v => !v.coupe && v.fs >= 18);
  const pageDet = m => _det(m && { docW: m.docW, vw: m.vw, dedans: m.dedans, ch: m.chevauche, cadres: m.cadres, vals: m.vals.map(v => [v.t, v.coupe, v.fs]) });

  /* ══ ①②③ · AUX QUATRE LARGEURS : LES DEUX VUES D'EMBLÉE, DANS L'ORDRE, BIEN DESSINÉES, BIEN PLACÉES ══════════════════════ */
  for (const [W, H] of TAILLES) {
    const X = await ouvrir({ w: W, h: H });
    const O = await oracle(X), L = await lire(X), m = await mesure(X);
    t('B-FFD-①a ⭐ ' + W + ' px : dès l\'ouverture, sans aucun appui, DEUX figurines — la face (' + O.nF + ' tracés) à gauche, les chiffres au centre, le dos (' + O.nB + ' tracés) à droite',
      deuxVues(L, O), _det(L && { n: L.n, deux: L.deux, ordre: L.ordre, vb: L.figs.map(f => f && f.vb), n2: L.figs.map(f => f && f.n) }));
    const milieu = m && (m.carte.x + m.carte.r) / 2;
    t('B-FFD-①b ' + W + ' px : l\'ordre se VOIT — la face finit avant les chiffres, le dos commence après eux ; chaque chiffre est centré dans la carte, les deux figurines à égale distance des bords (au moins 8 px)',
      !!m && m.figs.length === 2 && m.figs[0].r <= m.t.x + 0.5 && m.t.r <= m.figs[1].x + 0.5 && m.vals.length >= 3 && m.vals.every(v => Math.abs((v.r.x + v.r.r) / 2 - milieu) <= 2)
        && m.figs[0].r <= Math.min(...m.vals.map(v => v.r.x)) && Math.max(...m.vals.map(v => v.r.r)) <= m.figs[1].x
        && Math.abs((m.figs[0].x - m.carte.x) - (m.carte.r - m.figs[1].r)) <= 1 && m.figs[0].x - m.carte.x >= 8 && m.carte.r - m.figs[1].r >= 8,
      _det(m && { f: m.figs.map(r => [Math.round(r.x), Math.round(r.r)]), vals: m.vals.map(v => [Math.round(v.r.x), Math.round(v.r.r)]), c: [Math.round(m.carte.x), Math.round(m.carte.r)] }));
    t('B-FFD-②a ⭐ ' + W + ' px : chaque zone, de face ET de dos, a la couleur des données ET de la grande figurine (aucune couleur ajoutée ni oubliée)',
      !!L && conforme(L.figs[0], O, 'face') && conforme(L.figs[1], O, 'dos'), diffNiv(L && L.figs[0], O, 'face') + ' | ' + diffNiv(L && L.figs[1], O, 'dos'));
    t('B-FFD-③a ⭐ ' + W + ' px : rien ne déborde ni ne se chevauche, chaque dessin tient dans son cadre, chaque chiffre est entier et lisible (≥ 18 px)', pageOK(m), pageDet(m));
    t('B-FFD-③b ' + W + ' px : deux figurines de même taille, entre 44 et 54 px de large ; l\'ombre de la figurine est gardée',
      !!m && m.figs.length === 2 && Math.abs(m.figs[0].w - m.figs[1].w) < 0.5 && Math.abs(m.figs[0].h - m.figs[1].h) < 0.5 && m.figs[0].w >= 43.5 && m.figs[0].w <= 54.5
        && m.ombre.every(o => /drop-shadow/.test(o)), _det(m && { w: m.figs.map(r => [r.w, r.h]), ombre: m.ombre.map(o => o.slice(0, 30)) }));
    t('B-FFD-③c ' + W + ' px : la carte reste compacte — pas plus haute que sa plus haute colonne (figurine ou chiffres) plus ses marges',
      !!m && m.figs.length >= 1 && m.carte.h <= Math.max(m.figs[0].h, m.t.h) + 30.5, _det(m && { carte: m.carte.h, fig: m.figs[0] && m.figs[0].h, chiffres: m.t.h }));
    // le « + » de la barre du bas : identique avec et sans la carte (aucune série faite → pas de carte) — règle d'or #9
    const plusAvec = m && m.plus;
    await X.pg.evaluate(() => { S.wkt.exs.forEach(e => e.sets.forEach(s => { s.done = false; })); renderLog(); }); await X.pg.waitForTimeout(200);
    const sans = await X.pg.evaluate(() => { const p = document.querySelector('#nb-log .nb-plus').getBoundingClientRect(); return { x: p.left, y: p.top, w: p.width, h: p.height,
      carte: !!document.querySelector('#log-finish .lf-bilan') }; });
    t('B-FFD-③d ⭐ ' + W + ' px : le « + » de la barre du bas ne bouge pas d\'un pixel, avec ou sans la carte (mesuré, règle d\'or #9)',
      !!plusAvec && !sans.carte && Math.abs(plusAvec.x - sans.x) < 0.5 && Math.abs(plusAvec.y - sans.y) < 0.5 && Math.abs(plusAvec.w - sans.w) < 0.5 && Math.abs(plusAvec.h - sans.h) < 0.5,
      _det([plusAvec, sans]));
    t('B-FFD-③e ' + W + ' px : aucune erreur de page, aucun appel d\'IA (Milo compris)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
    // ④ les valeurs les plus longues (112 min · 24 séries · 37 440 kg), et le texte agrandi : toujours lisible, rien ne déborde
    const Y = await ouvrir({ w: W, h: H, wkt: WKT_LONG() });
    const mL = await mesure(Y), LL = await lire(Y);
    await Y.pg.evaluate(() => { document.getElementById('root').classList.add('a11y-lv'); renderLog(); }); await Y.pg.waitForTimeout(200);
    const mA = await mesure(Y);
    t('B-FFD-④a ⭐ ' + W + ' px : avec les plus longues valeurs (' + (LL ? LL.kv.map(k => k[1]).join(' · ') : '?') + '), puis en texte agrandi, rien ne déborde ni ne se chevauche, tout reste entier',
      pageOK(mL) && pageOK(mA), pageDet(mL) + ' | ' + pageDet(mA));
    await Y.cx.close();
  }

  /* ══ ⑤⑥⑧ · LA MÊME SÉANCE PAR LES VRAIS GESTES (390 px) : AUCUN APPUI NÉCESSAIRE, MISES À JOUR, RIEN D'ÉCRIT ══════════════ */
  {
    const X = await ouvrir({});
    const O0 = await oracle(X), L0 = await lire(X);
    t('B-FFD-⑧a ⭐ les chiffres de la carte sont ceux de la séance (séries de travail faites, volume hors échauffement) — recalculés ici',
      kvConforme(L0, O0), _det({ kv: L0 && L0.kv, oracle: [O0.series, O0.volume] }));
    // ⑤ rien ne bouge tout seul, rien n'est à toucher : relue 10 fois en 2,5 s, puis un toucher sur chaque figurine ne change rien
    let stable = true; const ref = _det(L0);
    for (let i = 0; i < 10; i++) { await X.pg.waitForTimeout(250); if (_det(await lire(X)) !== ref) { stable = false; break; } }
    const m0 = await mesure(X);
    t('B-FFD-⑤a aucune alternance automatique : 2,5 s sans rien faire (relue 10 fois), la carte ne change pas, sans animation', stable && !!m0 && m0.anims === 0,
      _det({ stable, anims: m0 && m0.anims }));
    t('B-FFD-⑤b les figurines sont des IMAGES, pas des boutons : rôle « img », nom lu par les lecteurs d\'écran (face / dos), aucune action au toucher',
      !!L0 && L0.figs.length === 2 && L0.figs.every(f => f && f.role === 'img' && f.tag === 'DIV' && !f.clic) && /vue de face/.test((L0.figs[0] || {}).aria) && /vue de dos/.test((L0.figs[1] || {}).aria),
      _det(L0 && L0.figs.map(f => f && [f.tag, f.role, f.clic, f.aria])));
    const calme = await attendreCalme(X);
    const av = await snap(X), req0 = X.req.length;
    for (const i of [0, 1, 0, 1]) { try { await X.pg.locator('#log-finish .lf-fig').nth(i).tap({ timeout: 1500 }); } catch (e) {} await X.pg.waitForTimeout(150); }
    const L1 = await lire(X);   // relue AVANT tout réaffichage : un réaffichage effacerait ce qu'un toucher aurait caché
    t('B-FFD-⑤c toucher les figurines (4 fois) ne change rien : mêmes deux vues, visibles, mêmes couleurs, mêmes chiffres', _det(L1) === ref,
      _det(L1 && { n: L1.n, vis: L1.figs.map(f => f && f.vis), ordre: L1.ordre }));
    for (let i = 0; i < 4; i++) await X.pg.evaluate(() => renderLogFinish());
    await X.pg.waitForTimeout(5500);
    const ap = await snap(X);
    t('B-FFD-⑧b ⭐ afficher la carte (toucher, 4 réaffichages) n\'écrit RIEN : aucun setItem / removeItem, tout le stockage identique à l\'octet, séance et historique inchangés',
      calme && ap.ecrits === av.ecrits && _det(ap.ls) === _det(av.ls) && ap.wkt === av.wkt && ap.sessions === av.sessions,
      'calme=' + calme + ' ' + _det(await X.pg.evaluate(n => window.__ecrits.slice(n), av.ecrits)));
    t('B-FFD-⑧c ni requête, ni fenêtre, ni message, même écran', calme && ap.fetchN === av.fetchN && X.req.length === req0 && ap.overlays === 0 && X.toasts.length === 0 && ap.ecran === av.ecran,
      _det({ calme, fetch: [av.fetchN, ap.fetchN], req: X.req.slice(req0), ov: ap.overlays, toasts: X.toasts, ecran: ap.ecran }));
    // ⑥ les deux vues suivent la séance : une série validée, un exercice ajouté, un changement d'écran, un rechargement
    const triB = O0.grpB.map((g, i) => g === 'triceps' ? i : -1).filter(i => i >= 0), pecF = O0.grpF.map((g, i) => g === 'pec' ? i : -1).filter(i => i >= 0);
    const okDC = await cocher(X, 1, 1);
    const L2 = await lire(X), O2 = await oracle(X);
    t('B-FFD-⑥a ⭐ valider une série (vraie coche) met à jour LES DEUX vues : pectoraux du développé couché de face, triceps de dos — toujours deux figurines',
      okDC && deuxVues(L2, O2) && conforme(L2.figs[0], O2, 'face') && conforme(L2.figs[1], O2, 'dos') && triB.length > 0 && pecF.length > 0
        && !!L0.figs[1] && triB.every(i => L0.figs[1].niv[i] === 'b' && L2.figs[1].niv[i] !== 'b') && pecF.every(i => L0.figs[0].niv[i] === 'b' && L2.figs[0].niv[i] === 'p'),
      _det({ okDC, tri: triB.map(i => [L0.figs[1] && L0.figs[1].niv[i], L2 && L2.figs[1] && L2.figs[1].niv[i]]), pec: pecF.map(i => [L0.figs[0] && L0.figs[0].niv[i], L2 && L2.figs[0] && L2.figs[0].niv[i]]) }));
    t('B-FFD-⑧d après la série validée, les chiffres suivent la séance (oracle recalculé)', kvConforme(L2, O2), _det({ kv: L2 && L2.kv, o: [O2.series, O2.volume] }));
    const okAj = await ajouterExercice(X, '#log-add-ex', 'Tractions', TR);
    const L3 = await lire(X);
    t('B-FFD-⑥b ajouter un exercice (vrai sélecteur) : les deux vues restent, rien de neuf n\'est coloré tant qu\'aucune série n\'est faite',
      okAj && _det(L3) === _det(L2), _det({ okAj, n: L3 && L3.n }));
    const iTR = await X.pg.evaluate(nom => S.wkt.exs.findIndex(e => e.name === nom), TR);
    const latB = O2.grpB.map((g, i) => g === 'lats' ? i : -1).filter(i => i >= 0);
    const okTR = await cocher(X, iTR, 0);
    const L4 = await lire(X), O4 = await oracle(X);
    t('B-FFD-⑥c ⭐ puis valider sa série : les dorsaux des tractions passent en principal de dos, la face suit aussi (biceps)',
      okTR && deuxVues(L4, O4) && conforme(L4.figs[0], O4, 'face') && conforme(L4.figs[1], O4, 'dos') && latB.length > 0 && latB.every(i => L4.figs[1].niv[i] === 'p'),
      _det({ okTR, lats: latB.map(i => L4 && L4.figs[1] && L4.figs[1].niv[i]) }) + ' ' + diffNiv(L4 && L4.figs[1], O4, 'dos'));
    const okNav = (await clic(X.pg, '#nb-home')) && (await X.pg.evaluate(() => (document.querySelector('.screen.active') || {}).id)) !== 's-log';
    const okPlus = await clic(X.pg, '#nb-log'); await nettoyer(X.pg);
    const L5 = await lire(X);
    t('B-FFD-⑥d changer d\'écran puis revenir par le « + » : la même carte, à l\'identique', okNav && okPlus && _det(L5) === _det(L4), _det({ okNav, okPlus }));
    await X.pg.reload(); await X.pg.waitForTimeout(1500); await apresChargement(X);
    const L6 = await lire(X);
    t('B-FFD-⑥e rouvrir l\'app : la séance est là et la carte est identique (rien n\'est gardé à part, tout se recalcule)', _det(L6) === _det(L4), _det(L6 && { n: L6.n }));
    // ⑧ fin de séance par la vraie porte, puis les autres figurines restent de face (une seule vue)
    await X.pg.evaluate(() => { if (typeof goSessionsHistory === 'function') goSessionsHistory(); }); await X.pg.waitForTimeout(500);
    const cartes0 = await X.pg.evaluate(() => [...document.querySelectorAll('.sess-card svg')].map(s => s.getAttribute('viewBox')).filter(v => / 32 94$/.test(v || '')));
    await clic(X.pg, '#nb-log'); await nettoyer(X.pg);
    const okFin = (await clic(X.pg, '#log-finish .lf-fin')) && (await clic(X.pg, '#confirm-ok'));
    await X.pg.waitForTimeout(1500); await nettoyer(X.pg);
    const fini = await X.pg.evaluate(nom => ({ ouverte: _seanceOuverte(), der: ((S.sessions || [])[0] || {}).exs ? S.sessions[0].exs.some(e => e.name === nom) : false }), TR);
    await X.pg.evaluate(() => { goScreen('log', document.getElementById('nb-log')); renderLog(); }); await X.pg.waitForTimeout(250);
    const la = await X.pg.evaluate(() => [...document.querySelectorAll('#la-ctx .la-fig svg')].map(s => s.getAttribute('viewBox')));
    await X.pg.evaluate(() => { if (typeof goSessionsHistory === 'function') goSessionsHistory(); }); await X.pg.waitForTimeout(500);
    const cartes = await X.pg.evaluate(() => [...document.querySelectorAll('.sess-card svg')].map(s => s.getAttribute('viewBox')).filter(v => / 32 94$/.test(v || '')));
    t('B-FFD-⑧e ⭐ « Terminer la séance » enregistre la séance comme avant ; les AUTRES figurines (carte « Dernière séance », cartes de Progrès) restent une seule vue, de face — pendant et après la séance',
      okFin && !fini.ouverte && fini.der && _det(la) === _det([FACE]) && cartes0.length >= 1 && cartes0.every(v => v === FACE) && cartes.length >= 1 && cartes.every(v => v === FACE),
      _det({ okFin, fini, la, cartes0, cartes }));
    t('B-FFD-⑧f aucune erreur de page, aucun appel d\'IA (Milo compris) pendant tout le parcours, fin de séance comprise', X.errs.length === 0 && appelsIA(X).length === 0,
      X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }

  /* ══ ⑦ · PLUSIEURS EXERCICES, DONT LE SOULEVÉ DE TERRE : LES DEUX VUES DISENT EXACTEMENT LES DONNÉES ═════════════════════ */
  {
    const X = await ouvrir({});
    const LISTE = [SDT, 'Souleve de terre', SQ, TR, DM, CB, RB, HT, LC, CR];
    let k = 0;
    for (const nom of LISTE) {
      k++;
      await X.pg.evaluate(([nom, k]) => { S.wkt = { date: today(), startHour: 18, startTs: Date.now() - k * 60000, exs: [{ name: nom, sets: [{ kg: 50, reps: 8, done: true, type: 'N' }, { kg: 50, reps: 8, done: false, type: 'N' }] }] };
        persist(); renderLog(); }, [nom, k]);
      await X.pg.waitForTimeout(150);
      const O = await oracle(X), L = await lire(X);
      const vus = L && L.n === 2 ? [...new Set(groupesVus(L.figs[0].niv, O.grpF).concat(groupesVus(L.figs[1].niv, O.grpB)))].sort() : [];
      t('B-FFD-⑦ ⭐ ' + nom + ' : face et dos ensemble, colorés exactement comme ses muscles (données = grande figurine) ; aucun n\'est invisible sur les deux vues',
        deuxVues(L, O) && conforme(L.figs[0], O, 'face') && conforme(L.figs[1], O, 'dos') && _det(vus) === _det(O.groupes.slice().sort()),
        _det({ n: L && L.n, vus, donnees: O.groupes }) + ' ' + diffNiv(L && L.figs[1], O, 'dos'));
      if (nom === SDT) {
        // chaque groupe a AU MOINS une zone au dos (sinon « toutes rouges » serait vrai sur un ensemble vide), et toutes ses zones ont la couleur dite
        const zones = g => O.grpB.map((x, i) => x === g ? i : -1).filter(i => i >= 0);
        const pri = ['glutes', 'hamstrings', 'lower-back'], sec = ['lats', 'traps'];
        const d = L && L.figs[1];
        const okPri = !!d && pri.every(g => zones(g).length > 0 && zones(g).every(i => d.niv[i] === 'p'));
        const okSec = !!d && sec.every(g => zones(g).length > 0 && zones(g).every(i => d.niv[i] === 'p' || d.niv[i] === 's'));
        const surFace = O.grpF.filter(g => pri.concat(sec).includes(g)).length;
        t('B-FFD-⑦-SDT ⭐ soulevé de terre, figurine de DOS : fessiers, ischio-jambiers et lombaires en principal (rouge), grand dorsal et trapèzes colorés — invisibles de face, visibles sans appui',
          okPri && okSec && surFace === 0, _det(pri.concat(sec).map(g => g + ':' + zones(g).map(i => d && d.niv[i]).join(''))) + ' surFace=' + surFace);
      }
    }
    // la petite figurine appelée SANS vue (Accueil, Progrès, carte du jour) reste la vue avant, à l'octet ; « dos » dessine l'arrière
    const P = await X.pg.evaluate(() => { const ex = [[{ name: 'Soulevé de Terre', sets: [{ done: true }] }], [{ name: 'Curl Barre', sets: [{ done: true }] }], []];
      return ex.map(e => { const r = _mscScores(e), a = _mscSVGmini(r), f = _mscSVGmini(r, 'face'), d = _mscSVGmini(r, 'dos');
        const n = s => (s.match(/<path /g) || []).length, vb = s => (/viewBox="([^"]+)"/.exec(s) || [])[1];
        return { egal: a === f, vbA: vb(a), nA: n(a), vbD: vb(d), nD: n(d), nF: _FP.length, nB: _BP.length }; }); });
    t('B-FFD-⑧g ⭐ appelée sans vue, la petite figurine est la vue avant À L\'OCTET (Accueil, Progrès, carte du jour inchangés) ; « dos » dessine les ' + (P[0] && P[0].nB) + ' tracés arrière',
      P.every(p => p.egal && p.vbA === FACE && p.nA === p.nF && p.vbD === DOS && p.nD === p.nB), _det(P));
    t('B-FFD-⑦z aucune erreur de page, aucun appel d\'IA (Milo compris)', X.errs.length === 0 && appelsIA(X).length === 0, X.errs.concat(appelsIA(X)).join(' | ').slice(0, 200));
    await X.cx.close();
  }

  /* ══ ⑨ · CARDIO SEUL : AUCUNE FIGURINE, LA CARTE RESTE CELLE D'AVANT ═══════════════════════════════════════════════════════ */
  {
    const X = await ouvrir({ w: 360, h: 740, wkt: WKT_CARDIO() });
    const L = await lire(X), m = await X.pg.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth }));
    t('B-FFD-⑨a une séance de cardio seul garde sa carte d\'avant : aucune figurine, pas de disposition à trois colonnes, le cardio est dit, rien ne déborde (360 px)',
      !!L && L.n === 0 && !L.deux && /Cardio/.test(L.cardio) && /20min/.test(L.cardio) && m.docW <= m.vw, _det({ L, m }));
    await X.cx.close();
  }
}

module.exports = { ecran };
