/* ═══════════════════════════════════════════════════════════════════════════════════════
   📄 MILO-PDF1 — UNE RÉPONSE COUPÉE PAR LA LIMITE DE LONGUEUR NE PASSE PLUS POUR COMPLÈTE
   (25/09/2026)

   Cas réel : un PDF que Milo avait titré « Analyse complète » s'arrêtait en page 2 sur
   « Muscles prioritaires : Épaules + ». Cause mesurée : la conversation appelle le modèle avec
   `max_tokens: 1024`, et le Worker ne gardait que le TEXTE — il jetait `stop_reason`. La coupure
   existait côté API, et n'atteignait ni l'écran, ni le fil, ni le PDF (R4).

   L'invariant : FORCE TRACKER NE PRÉSENTE JAMAIS COMME COMPLÈTE UNE RÉPONSE QUE LE MODÈLE A
   SIGNALÉE COMME TRONQUÉE.
     .source : ce qui est écrit (transport, budget, suite bornée, qui la demande, marqueur gardé).
     .reel   : le VRAI worker.js conduit dans un bac à sable, API Anthropic SIMULÉE et observée
               (0 appel réel) — PDF-01 → PDF-08.
     .ecran  : l'analyse de programme, le chat, le fil rechargé, le PDF et le partage, conduits
               dans le navigateur.
   Contrôle négatif : `tools/mut_milo_pdf1.py` (banc : `tools/banc_milo_pdf1.js`).
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const vm = require('vm');
const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
// Le corps d'une fonction de premier niveau (jusqu'à la prochaine déclaration de premier niveau).
const _corps = (src, tete) => {
  const i = src.indexOf(tete); if (i < 0) return '';
  const j = src.slice(i + tete.length).search(/\n(?:async )?function |\nconst [A-Z_]+ *=|\nlet |\nvar /);
  return j < 0 ? src.slice(i) : src.slice(i, i + tete.length + j);
};

module.exports.source = function (t, ROOT, fs, path) {
  const brut = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const W = _sansCommentaires(brut('worker.js'));
  const C = _sansCommentaires(brut('coach.js')), L = _sansCommentaires(brut('log.js'));
  const Cn = C.replace(/\s+/g, ''), Ln = L.replace(/\s+/g, '');
  console.log('\n═══ B-CCCLXXVIII. MILO-PDF1 — la coupure du modèle transportée jusqu\'au PDF (source) ═══');

  const diag = _corps(W, 'async function callClaudeDiag(');
  t('B-CCCLXXVIII ① `callClaudeDiag` TRANSPORTE la raison d\'arrêt réelle (`stop_reason`), sur ses deux sorties',
    /data\.stop_reason/.test(diag) && (diag.match(/return \{[^}]*stopReason[^}]*\}/g) || []).length === 2, diag.slice(0, 200));

  const co = _corps(W, 'async function coach(');
  t('B-CCCLXXVIII ② `coach()` rend `reply` (ancien contrat) ET l\'état : stopReason · truncated · complete · continued',
    /reply: texte \|\| 'Désolé, réessaie\.'/.test(co) && /stopReason: stop \|\| null/.test(co)
    && /truncated: stop === 'max_tokens'/.test(co) && /complete: !!texte && \(stop === 'end_turn' \|\| stop === 'stop_sequence'\)/.test(co)
    && /continued \}/.test(co), '');

  const mt = co.match(/max_tokens: *\d+/g) || [];
  t('B-CCCLXXVIII ③ ⛔ le budget de la conversation est INCHANGÉ (1024, sur ses deux appels) — pas de « 4096 partout »',
    mt.length === 2 && mt.every(x => /1024$/.test(x)), JSON.stringify(mt));

  const nApp = (co.match(/callClaudeDiag\(/g) || []).length;
  t('B-CCCLXXVIII ④ la suite est UNIQUE et BORNÉE : 2 appels au plus, aucune boucle, demandée ET signalée `max_tokens`',
    nApp === 2 && !/\bwhile *\(|\bfor *\(/.test(co)
    && /if \(body\.suite === true && texte && stop === 'max_tokens'\) \{/.test(co), 'appels=' + nApp);

  t('B-CCCLXXVIII ⑤ la suite RATÉE ne rend pas la 1ʳᵉ partie « complète » (texte et raison ne changent que si la suite a un texte)',
    /if \(s\.text\) \{ texte = _recollerSuite\(texte, s\.text\); stop = s\.stopReason; continued = true; \}/.test(co), '');

  const ana = L.slice(L.indexOf('async function analyzeProgIa('), L.indexOf('function continueInCoach('));
  const chat = _corps(C, 'async function sendToCoach(');
  const dbf = (L.match(/const payload=\{action:'coach'[^\n]*/) || [''])[0];
  t('B-CCCLXXVIII ⑥ seule l\'ANALYSE demande la suite (`suite:true`) ; le chat et le débrief restent à UN appel',
    /suite:true/.test(ana) && !/\bsuite\s*:/.test(chat) && dbf && !/suite/.test(dbf), '');

  t('B-CCCLXXVIII ⑦ un seul propriétaire de « la réponse est-elle finie ? » (R2), lu par le chat ET l\'analyse',
    (C.match(/function _miloEtatReponse\(/g) || []).length === 1 && !/function _miloEtatReponse\(/.test(L)
    && /_miloEtatReponse\(data\) === 'coupee'/.test(chat) && /_miloEtatReponse\(data\)==='coupee'/.test(Ln)
    && !/\.truncated\s*===\s*true/.test(L) && (C.match(/\.truncated\s*===\s*true/g) || []).length === 1, '');

  const lm = _corps(C, 'function _lightMsg(');
  const hp = _corps(C, 'function _coachHistPayload(');
  t('B-CCCLXXVIII ⑧ le marqueur SURVIT au stockage (`_lightMsg`) et ne part JAMAIS à l\'API (`_coachHistPayload` : role/content)',
    /_coupeeValide\(m\.coupee\)\?\{coupee:m\.coupee\}/.test(lm) && /\.map\(m => \(\{ role: m\.role, content: m\.content \}\)\)/.test(hp), '');

  const pdf = _corps(C, 'async function exportCoachPdf(');
  t('B-CCCLXXVIII ⑨ le PDF lit l\'état de la bulle : bandeau AVANT le texte, repère à la fin, nom de fichier « -incomplet »',
    /const _cp=_coupeeValide\(bubble\.dataset\.coupee\);/.test(pdf) && /génération interrompue',M,y\)/.test(pdf)
    && pdf.indexOf('génération interrompue\',M,y)') < pdf.indexOf('_coachPdfText(raw)')
    && /\(_cp\?'-incomplet':''\)/.test(pdf), '');

  const fj = _corps(W, 'function firstJson(');
  const imp = _corps(W, 'async function importDoc(');
  t('B-CCCLXXVIII ⑩ ⛔ un JSON illisible (coupé) n\'est ni réparé ni accepté : `firstJson` rend null, l\'import rend une erreur',
    /try \{ return JSON\.parse\(m\[0\]\); \} catch \(e\) \{ return null; \}/.test(fj)
    && /try \{ data = JSON\.parse\(cleaned\); \} catch \(e\) \{ return \{ status: 'error'/.test(imp), '');
};

/* ── Le VRAI worker.js, avec une API Anthropic SCRIPTÉE (une file de réponses) et observée ── */
function monter(ROOT, fs, path, file) {
  const src = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8').replace(/export default/, 'const _handlerExporte =');
  const ia = [];
  const ctx = {
    crypto: globalThis.crypto, TextEncoder, Request, Response, Headers, URL,
    console: { log() {}, error() {}, warn() {} }, setTimeout, clearTimeout,
    async fetch(url, opts) {
      let corps = {}; try { corps = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
      const u = String(url);
      if (u.indexOf('api.anthropic.com') >= 0) {
        ia.push(corps);
        const r = file.shift();
        if (!r) throw new Error('file vide : appel IA non prévu');
        return r();
      }
      if (u.indexOf('script.google.com') >= 0 && corps.action === 'authIdentity')
        return { ok: true, status: 200, async json() { return { status: 'ok', email: 'compte-a.test', premium: true, blocked: false }; }, async text() { return ''; } };
      return { ok: true, status: 200, async json() { return { status: 'ok' }; }, async text() { return '{}'; } };
    },
  };
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx); vm.runInContext(src + '\n;globalThis._h=_handlerExporte;', ctx, { filename: 'worker.js' });
  return { ctx, ia };
}
const REP = (text, stop) => () => ({ ok: true, status: 200,
  async json() { const o = { content: [{ type: 'text', text }], model: 'claude-sonnet-4-6', usage: {} }; if (stop !== undefined) o.stop_reason = stop; return o; },
  async text() { return ''; } });
const ERR = (status) => () => ({ ok: false, status, async json() { return { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }; }, async text() { return ''; } });
const COUPURE = () => { throw new Error('ECONNRESET'); };

// La fin réelle du PDF du 25/09 : la coupure tombe là.
const P1 = '🎯 VERDICT GLOBAL\nProgramme solide.\n\n✅ POINTS FORTS\n- Volume bien réparti\n\n💡 RECOMMANDATIONS\nMuscles prioritaires : Épaules +';
const P2 = ' Dos, en priorité le haut du dos.\n\nBon entraînement.';

module.exports.reel = async function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCLXXIX. MILO-PDF1 — le Worker CONDUIT, API simulée (PDF-01 → PDF-08, 0 appel réel) ═══');
  const lance = async (file, extra, action) => {
    const { ctx, ia } = monter(ROOT, fs, path, file.slice());
    const corps = Object.assign({ action: action || 'coach', token: 'a'.repeat(64), message: 'Analyse ce programme', context: 'ctx', history: [] }, extra || {});
    const req = new Request('https://worker.test/', { method: 'POST',
      headers: { Origin: 'https://michdu75-commits.github.io', 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corps) });
    const r = await ctx._h.fetch(req, { ANTHROPIC_API_KEY: 'cle-de-test' }, { waitUntil() {} });
    let d = {}; try { d = await r.json(); } catch (e) {}
    return { statut: r.status, d, ia };
  };
  const etat = (x) => JSON.stringify({ tr: x.d.truncated, co: x.d.complete, su: x.d.continued, sr: x.d.stopReason, n: x.ia.length });

  const r01 = await lance([REP('Réponse finie, bonne séance.', 'end_turn')]);
  t('PDF-01 arrêt normal (`end_turn`) → complete, pas tronquée, 1 appel, texte intact',
    r01.statut === 200 && r01.d.complete === true && r01.d.truncated === false && r01.d.stopReason === 'end_turn'
    && r01.d.continued === false && r01.ia.length === 1 && r01.d.reply === 'Réponse finie, bonne séance.', etat(r01));

  const r02 = await lance([REP(P1, 'max_tokens'), REP(P2, 'end_turn')]);
  t('PDF-02 `max_tokens` DÉTECTÉ (chat, sans `suite`) → truncated, JAMAIS complete, 1 seul appel, texte partiel rendu tel quel',
    r02.d.truncated === true && r02.d.complete === false && r02.d.stopReason === 'max_tokens'
    && r02.ia.length === 1 && r02.d.reply === P1, etat(r02));

  const r03 = await lance([REP(P1, 'max_tokens'), REP(P2, 'end_turn')], { suite: true });
  const q2 = r03.ia[1] || {}, m2 = q2.messages || [];
  t('PDF-03 suite réussie → les deux parties RECOLLÉES, complete, 2 appels exactement',
    r03.d.reply === P1 + P2 && r03.d.complete === true && r03.d.truncated === false && r03.d.continued === true
    && r03.d.stopReason === 'end_turn' && r03.ia.length === 2, etat(r03));
  t('PDF-03 … la suite REPREND la 1ʳᵉ partie (texte déjà écrit + consigne de reprise citant sa fin), même modèle, même budget',
    m2.length >= 3 && m2[m2.length - 2].role === 'assistant' && m2[m2.length - 2].content === P1
    && m2[m2.length - 1].role === 'user' && /coupée/.test(m2[m2.length - 1].content) && /Épaules \+/.test(m2[m2.length - 1].content)
    && /Ne répète rien/.test(m2[m2.length - 1].content)
    && q2.model === r03.ia[0].model && q2.model === 'claude-sonnet-4-6' && q2.max_tokens === 1024 && r03.ia[0].max_tokens === 1024
    && JSON.stringify(q2.system) === JSON.stringify(r03.ia[0].system), JSON.stringify(m2.map(m => m.role)));

  const rRep = await lance([REP(P1, 'max_tokens'), REP('Muscles prioritaires : Épaules + Dos, en priorité le haut du dos.', 'end_turn')], { suite: true });
  t('PDF-03 … AUCUNE RÉPÉTITION quand la suite recopie la fin de la 1ʳᵉ partie (couture déterministe)',
    (rRep.d.reply.match(/Muscles prioritaires/g) || []).length === 1 && /Épaules \+ Dos, en priorité le haut du dos\.$/.test(rRep.d.reply)
    && rRep.d.complete === true, rRep.d.reply.slice(-90));
  const rMot = await lance([REP('Priorité : Épau', 'max_tokens'), REP('Épaules et dos.', 'end_turn')], { suite: true });
  const rMot2 = await lance([REP('Priorité : Épau', 'max_tokens'), REP('les et dos.', 'end_turn')], { suite: true });
  const rMot3 = await lance([REP('On reprend et le', 'max_tokens'), REP(' lendemain repos.', 'end_turn')], { suite: true });
  t('PDF-03 … un mot coupé se recolle sans doublon (« Épau » + « Épaules » / « les »), un mot nouveau n\'est pas mangé',
    rMot.d.reply === 'Priorité : Épaules et dos.' && rMot2.d.reply === 'Priorité : Épaules et dos.'
    && rMot3.d.reply === 'On reprend et le lendemain repos.', JSON.stringify([rMot.d.reply, rMot2.d.reply, rMot3.d.reply]));

  const r04 = await lance([REP(P1, 'max_tokens'), REP(P2, 'max_tokens'), REP('troisième', 'end_turn')], { suite: true });
  t('PDF-04 suite coupée À SON TOUR → incomplète (truncated), JAMAIS complete, et 2 appels — pas de 3ᵉ',
    r04.d.truncated === true && r04.d.complete === false && r04.d.continued === true && r04.ia.length === 2
    && r04.d.reply === P1 + P2, etat(r04));

  const r05a = await lance([REP(P1, 'max_tokens'), COUPURE], { suite: true });
  const r05b = await lance([REP(P1, 'max_tokens'), ERR(529)], { suite: true });
  t('PDF-05 suite en échec (réseau / 529) → la 1ʳᵉ partie est GARDÉE, et reste incomplète (jamais « complete »)',
    [r05a, r05b].every(x => x.statut === 200 && x.d.reply === P1 && x.d.truncated === true && x.d.complete === false
      && x.d.continued === false && x.ia.length === 2)
    && /^error fetch/.test(r05a.d._diagSuite || '') && r05b.d._diagSuite === 'overloaded', etat(r05a) + ' ' + etat(r05b));

  const r06 = await lance([REP('Oui, 3 séries suffisent.', 'end_turn'), REP('x', 'end_turn')], { suite: true });
  t('PDF-06 réponse courte → 1 SEUL appel, même quand la suite est permise (elle ne part que sur `max_tokens`)',
    r06.ia.length === 1 && r06.d.complete === true && r01.ia.length === 1, etat(r06));

  const tronque = '{"seance":{"label":"Push","exs":[{"name":"Développé couché","sets":[{"reps":8,"kg":60}]},{"name":"Dips","sets":[{"reps":10';
  const complet = '{"seance":{"label":"Push","exs":[{"name":"Développé couché","sets":[{"reps":8,"kg":60}]},{"name":"Dips","sets":[{"reps":10,"kg":0}]}]}}';
  const r07a = await lance([REP(tronque, 'max_tokens')], { texte: 'Développé couché 4×8\nDips 3×10' }, 'seanceJson');
  const r07c = await lance([REP(complet, 'end_turn')], { texte: 'Développé couché 4×8\nDips 3×10' }, 'seanceJson');
  const r07b = await lance([REP('{"name":"Bloc","days":[{"label":"J1","exs":[{"name":"Squat","sets":[{"reps":5', 'max_tokens')],
    { images: [{ type: 'text/plain', data: 'U3F1YXQgNXg1', isText: true }] }, 'importProgram');
  t('PDF-07 ⛔ un JSON COUPÉ (action machine) n\'est pas accepté : séance du cervelet et import → erreur, aucune donnée',
    r07a.d.status === 'error' && r07a.d.seance === undefined && r07b.d.status === 'error' && !r07b.d.data
    && r07a.ia.length === 1 && r07b.ia.length === 1, JSON.stringify([r07a.d, r07b.d]).slice(0, 200));
  t('PDF-07 … témoin de sensibilité : le MÊME JSON, complet, est accepté (le refus vient de la coupure, pas du format)',
    r07c.d.status === 'ok' && r07c.d.seance && r07c.d.seance.exs.length === 2, JSON.stringify(r07c.d).slice(0, 160));

  const r08 = await lance([REP('Garde ce rythme sur trois semaines', 'end_turn')]);
  t('PDF-08 arrêt normal SANS point final → complete, PAS tronquée (on lit le signal, pas la ponctuation)',
    r08.d.complete === true && r08.d.truncated === false, etat(r08));

  const rNul = await lance([REP('Texte sans raison d\'arrêt.', undefined)]);
  const rRef = await lance([REP('Je ne peux pas t\'aider là-dessus.', 'refusal')]);
  t('PDF-∅ raison absente ou inconnue (`refusal`) → ni « coupée » ni « complete » : on ne prétend rien',
    [rNul, rRef].every(x => x.d.complete === false && x.d.truncated === false && x.ia.length === 1)
    && rNul.d.stopReason === null && rRef.d.stopReason === 'refusal', etat(rNul) + ' ' + etat(rRef));

  const rErr = await lance([ERR(529), REP('x', 'end_turn')], { suite: true });
  t('PDF-∅ panne du 1ᵉʳ appel → « Désolé, réessaie. », ni complete ni coupée, et AUCUNE suite tentée (1 appel)',
    rErr.d.reply === 'Désolé, réessaie.' && rErr.d._diag === 'overloaded' && rErr.d.complete === false
    && rErr.d.truncated === false && rErr.ia.length === 1, etat(rErr));
  t('PDF-§24 le modèle de la conversation est `claude-sonnet-4-6` (inchangé)',
    r01.ia[0].model === 'claude-sonnet-4-6' && r03.ia.every(q => q.model === 'claude-sonnet-4-6'), r01.ia[0].model);
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXX. MILO-PDF1 — ce que la personne VOIT : analyse, chat, fil, PDF, partage ═══');
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
  const recus = []; let mode = 'coupee';
  const REPONSES = {
    coupee:   { reply: P1, _diag: 'ok', _model: 'claude-sonnet-4-6', stopReason: 'max_tokens', truncated: true, complete: false, continued: true },
    complete: { reply: P1 + P2, _diag: 'ok', _model: 'claude-sonnet-4-6', stopReason: 'end_turn', truncated: false, complete: true, continued: true },
    ancien:   { reply: 'Réponse d\'un ancien serveur.', _diag: 'ok', _model: 'claude-sonnet-4-6' },
    court:    { reply: 'Oui, trois séries suffisent.', _diag: 'ok', _model: 'claude-sonnet-4-6', stopReason: 'end_turn', truncated: false, complete: true, continued: false },
  };
  await cx.route(/workers\.dev/, r => {
    let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
    if (c.action !== 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', seance: null }) });
    recus.push(c);
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REPONSES[mode]) });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_pdf1'))return; sessionStorage.setItem('_pdf1','1'); localStorage.clear();
    const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'e'.repeat(64)}'};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  await pg.evaluate(() => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    S.premium = true; window._premiumPending = false;
    S.programmes = [{ name: 'Bloc test', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] }];
    try { Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true }); } catch (e) {}
    try { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); } catch (e) {}
    window.__dl = []; HTMLAnchorElement.prototype.click = function () { window.__dl.push(this.download || ''); };
    window.__clip = []; try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (x) => { window.__clip.push(x); } }, configurable: true }); } catch (e) {}
  });
  // Exporte la DERNIÈRE bulle de Milo en PDF et rend ce qui a été écrit dedans + le nom du fichier.
  const pdfDe = () => pg.evaluate(async () => {
    await _loadJsPdf();
    const J = window.jspdf.jsPDF, rec = [];
    window.jspdf.jsPDF = function (...a) { const d = new J(...a); const tx = d.text.bind(d);
      d.text = function (x, ...r) { rec.push(Array.isArray(x) ? x.join(' ') : String(x)); return tx(x, ...r); }; return d; };
    const bs = document.querySelectorAll('.msg-coach'); const btn = bs[bs.length - 1].querySelector('.coach-share-btn');
    const n0 = window.__dl.length; await exportCoachPdf(btn); window.jspdf.jsPDF = J;
    return { texte: rec.join('\n'), fichier: window.__dl[n0] || '' };
  });
  const derniere = () => pg.evaluate(() => { const bs = document.querySelectorAll('.msg-coach'); const x = bs[bs.length - 1];
    return { marque: !!(x && x.querySelector('.coach-coupee')), coupee: (x && x.dataset.coupee) || '', txt: (x && x.textContent) || '' }; });

  // ── E1 · l'analyse de programme restée coupée ──
  mode = 'coupee';
  const a1 = await pg.evaluate(async () => { await analyzeProgIa(0);
    return { html: document.getElementById('prog-analysis-content').textContent, coupee: _lastProgAnalysisCoupee }; });
  const q1 = recus[recus.length - 1] || {};
  t('E1 l\'analyse DEMANDE la suite bornée (`suite:true`) ; restée coupée, elle le DIT en tête : « Analyse incomplète »',
    q1.suite === true && /^✂️ Analyse incomplète — génération interrompue/.test(a1.html.trim()) && a1.coupee === 'analyse', a1.html.slice(0, 120));

  // ── E2 · « Continuer dans le Coach » : le marqueur suit, survit au rechargement, ne part pas à l'API ──
  await pg.evaluate(() => continueInCoach());
  const b2 = await derniere();
  const e2 = await pg.evaluate(() => { const h = coachHistory[coachHistory.length - 1]; _saveCoachHist();
    coachHistory = []; _loadCoachHist(); _renderCoachThread();
    const bs = document.querySelectorAll('.msg-coach'); const x = bs[bs.length - 1];
    return { hist: h.coupee, apres: coachHistory[coachHistory.length - 1].coupee, marque: !!x.querySelector('.coach-coupee'),
      payload: JSON.stringify(_coachHistPayload(8)) }; });
  t('E2 dans le Coach, la bulle de l\'analyse porte le marqueur (« Analyse incomplète ») et le fil le garde',
    b2.marque && b2.coupee === 'analyse' && /Analyse incomplète — génération interrompue/.test(b2.txt) && e2.hist === 'analyse', JSON.stringify(b2).slice(0, 160));
  t('E2 … après un RECHARGEMENT du fil, la bulle est toujours marquée coupée',
    e2.apres === 'analyse' && e2.marque, JSON.stringify(e2).slice(0, 160));
  t('E2 … ⛔ le marqueur ne part JAMAIS à l\'API (historique envoyé : role/content seulement)',
    !/coupee/.test(e2.payload) && /"role":"assistant"/.test(e2.payload), e2.payload.slice(0, 120));

  // ── E3 · le PDF de cette analyse ──
  const p3 = await pdfDe();
  t('E3 PDF d\'une analyse coupée → titre « ANALYSE INCOMPLÈTE », bandeau AVANT le texte de Milo, repère de fin, fichier « -incomplet »',
    /ANALYSE INCOMPLÈTE — génération interrompue/.test(p3.texte) && p3.texte.indexOf('ANALYSE INCOMPLÈTE — génération') < p3.texte.indexOf('VERDICT')
    && /la réponse s'arrête ici — génération interrompue/.test(p3.texte) && /-incomplet\.pdf$/.test(p3.fichier), p3.fichier + ' | ' + p3.texte.slice(0, 160));

  // ── E4 · l'analyse COMPLÈTE (suite réussie) : aucun avertissement, PDF normal (non-régression) ──
  mode = 'complete';
  const a4 = await pg.evaluate(async () => { await analyzeProgIa(0); const h = document.getElementById('prog-analysis-content').textContent;
    continueInCoach(); return { html: h, coupee: _lastProgAnalysisCoupee }; });
  const b4 = await derniere(); const p4 = await pdfDe();
  t('E4 analyse complète (suite recollée) → AUCUN bandeau, aucune bulle marquée, PDF sans avertissement, fichier normal',
    !/incomplète/i.test(a4.html) && a4.coupee === '' && !b4.marque && b4.coupee === '' && /Bon entraînement/.test(a4.html)
    && !/INCOMPLÈTE|interrompue/.test(p4.texte) && /\d\.pdf$/.test(p4.fichier) && !/incomplet/.test(p4.fichier), p4.fichier);

  // ── E5 · le chat : une réponse coupée est SIGNALÉE (1 appel, pas de suite demandée) ──
  mode = 'coupee'; const n5 = recus.length;
  await pg.evaluate(async () => { coachBusy = false; await sendToCoach('Fais-moi une analyse complète de ma progression'); });
  const b5 = await derniere(); const q5 = recus[recus.length - 1] || {};
  const h5 = await pg.evaluate(() => coachHistory[coachHistory.length - 1].coupee);
  t('E5 chat coupé → 1 seul envoi SANS `suite`, bulle marquée « Réponse incomplète », fil marqué',
    recus.length === n5 + 1 && !('suite' in q5) && b5.marque && b5.coupee === 'reponse' && /Réponse incomplète/.test(b5.txt) && h5 === 'reponse',
    JSON.stringify({ n: recus.length - n5, suite: q5.suite, b5 }).slice(0, 200));
  const s5 = await pg.evaluate(async () => { const bs = document.querySelectorAll('.msg-coach');
    const btns = bs[bs.length - 1].querySelectorAll('.coach-share-btn'); await shareCoachReply(btns[1]); return window.__clip[window.__clip.length - 1] || ''; });
  t('E5 … le PARTAGE texte d\'une réponse coupée le dit aussi (en tête et à la fin)',
    /RÉPONSE INCOMPLÈTE — génération interrompue/.test(s5) && /la réponse s'arrête ici/.test(s5), s5.slice(0, 120));

  // ── E6 · l'indication « écris continue » est VRAIE : le message part bien à Milo ──
  mode = 'court'; const n6 = recus.length;
  await pg.evaluate(async () => { coachBusy = false; await sendToCoach('continue'); });
  const q6 = recus[recus.length - 1] || {};
  t('E6 « continue » (l\'indication affichée) part bien à Milo, avec sa réponse coupée dans l\'historique',
    recus.length === n6 + 1 && q6.message === 'continue' && (q6.history || []).some(m => m.role === 'assistant' && m.content === P1), JSON.stringify(q6).slice(0, 160));

  // ── E7 · réponses non coupées : rien n'est ajouté (réponse finie · ancien serveur sans le signal) ──
  const b7 = await derniere();
  mode = 'ancien';
  await pg.evaluate(async () => { coachBusy = false; await sendToCoach('Et pour la récup ?'); });
  const b7b = await derniere(); const p7 = await pdfDe();
  t('E7 réponse finie OU serveur qui ne transmet pas encore le signal → aucun marqueur, PDF normal (on ne prétend rien)',
    !b7.marque && !b7b.marque && b7b.coupee === '' && !/INCOMPLÈTE/.test(p7.texte) && !/incomplet/.test(p7.fichier), JSON.stringify([b7.coupee, b7b.coupee, p7.fichier]));

  // ── E8 · valeurs abîmées dans le stockage : liste blanche, aucun marqueur inventé ──
  const e8 = await pg.evaluate(() => { coachHistory = [{ role: 'assistant', content: 'Texte.', coupee: 'n_importe_quoi' }, { role: 'assistant', content: 'Autre.', coupee: true }];
    _saveCoachHist(); coachHistory = []; _loadCoachHist(); _renderCoachThread();
    return { stock: localStorage.getItem('ft4_coach_hist'), n: document.querySelectorAll('.coach-coupee').length }; });
  t('E8 un marqueur inconnu (stockage abîmé, autre version) n\'est ni gardé ni affiché',
    !/coupee/.test(e8.stock) && e8.n === 0, JSON.stringify(e8).slice(0, 160));

  t('E∅ aucune erreur de page', !errs.length, errs.slice(0, 2).join(' | '));
  await cx.close();
};
