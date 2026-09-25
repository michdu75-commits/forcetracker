/* ═══════════════════════════════════════════════════════════════════════════════════════
   🩹 MILO-AUTH1 — UNE PANNE DU PONT D'IDENTITÉ N'EST PAS UN REFUS (25/09/2026)

   Avant : toute identité non prouvée rendait 401 « Reconnecte ton appareil pour utiliser Milo »,
   y compris quand Apps Script était muet (`reseau`), que son stockage lâchait (`erreur`), qu'il
   répondait sans raison (`refus`) ou qu'une ligne était abîmée (`illisible`). Le chat relaie la
   phrase du serveur : une panne passagère se lisait « appareil déconnecté ».
   ⭐ Même correction que ft-v1223 (miroir Supabase), un étage plus haut : LISTE BLANCHE des vrais
   refus (revoque · forme · absent · inconnu) → 401 ; tout le reste → 503 « momentanément
   indisponible ». ⛔ Dans TOUS les cas d'échec : aucun appel IA (fail-closed).
     .source : ce qui est écrit (liste identique au client, garde avant l'IA, client).
     .reel   : le VRAI worker.js conduit dans un bac à sable, réseau simulé et OBSERVÉ.
     .ecran  : le chat et l'analyse de programme, conduits dans le navigateur.
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const vm = require('vm');
const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

module.exports.source = function (t, ROOT, fs, path) {
  const brut = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const W = _sansCommentaires(brut('worker.js')), SB = _sansCommentaires(brut('supabase.js'));
  const LG = _sansCommentaires(brut('log.js')).replace(/\s+/g, '');
  const TOUT = ['app.js', 'coach.js', 'log.js', 'setup.js', 'screens.js', 'tracking.js', 'state.js', 'constants.js']
    .map(f => _sansCommentaires(brut(f))).join('\n');
  console.log('\n═══ B-CCCLXXV. MILO-AUTH1 — la garde d\'identité IA (source) ═══');
  const lw = (/const _REFUS_IDENTITE_REELS = \[([^\]]*)\]/.exec(W) || [, ''])[1].match(/'[a-z]+'/g) || [];
  const ls = Object.keys(((() => { const m = /const _SB_REFUS_REELS = \{([\s\S]*?)\};/.exec(SB); if (!m) return {};
    const o = {}; (m[1].match(/^\s*([a-z]+):/gm) || []).forEach(k => { o[k.trim().replace(':', '')] = 1; }); return o; })()));
  t('B-CCCLXXV ① la liste des vrais refus du Worker est IDENTIQUE à celle du client (ft-v1223, R2)',
    lw.length === 4 && JSON.stringify(lw.map(x => x.replace(/'/g, '')).sort()) === JSON.stringify(ls.slice().sort()),
    JSON.stringify([lw, ls]));
  const iGarde = W.indexOf('if (!_moi.ok) {'), iIA = W.indexOf('_compterIA(body.action, _moi.email, env)');
  const garde = W.slice(iGarde, W.indexOf('if (_moi.blocked)', iGarde));
  t('B-CCCLXXV ② la garde classe AVANT tout : refus réel → 401 « Reconnecte », le reste → 503, et les deux RETOURNENT',
    iGarde > 0 && iGarde < iIA && /if \(!_identiteEstRefusReel\(_moi\.raison\)\) \{\s*return json\(\{[^}]*error: 'identite_indisponible'[\s\S]*?\}, 503\);\s*\}/.test(garde)
    && /return json\(\{ status: 'error', error: 'auth'[\s\S]*?Reconnecte ton appareil[\s\S]*?\}, 401\);/.test(garde), garde.slice(0, 300));
  t('B-CCCLXXV ③ la phrase 503 ne parle NI de reconnexion NI de la connexion de la personne',
    /momentanément indisponible/.test(garde) && !/Reconnecte[^']*'\s*\}, 503/.test(garde) && !/(ta|votre) connexion[^']*'\s*\}, 503/.test(garde), '');
  t('B-CCCLXXV ④ le pont reste fail-closed (exception → refus technique, jamais une identité)',
    /catch \(e\) \{ return \{ ok: false, raison: 'reseau' \}; \}/.test(W), '');
  t('B-CCCLXXV ⑤ l\'analyse de programme LIT la phrase du serveur (plus de « vérifie ta connexion » pour tout)',
    /asyncfunctionanalyzeProgIa\(idx\)\{[\s\S]*?if\(!resp\.ok\)\{[\s\S]*?_phraseServeur\([\s\S]*?_e\.duServeur=!!_m;/.test(LG)
    && /\(e&&e\.duServeur\)\?String\(e\.message\)/.test(LG), '');
  /* ⚠️ Le PROPRIÉTAIRE de la clé (`_setFtToken`, constants.js) sait l'effacer : c'est sa définition,
     pas un appel. On l'écarte, puis on exige qu'AUCUN appelant ne l'efface. */
  const APPELANTS = TOUT.replace(/function _setFtToken\(t\)\{[^\n]*\}/, '');
  const appels = APPELANTS.match(/_setFtToken\(([^)]*)\)/g) || [];
  t('B-CCCLXXV ⑥ ⛔ aucun code client n\'efface le jeton d\'appareil (une panne ne coupe jamais le lien)',
    /function _setFtToken\(t\)\{/.test(TOUT) && appels.length >= 1 && appels.every(a => /_setFtToken\(d\.token\)/.test(a))
    && !/removeItem\(\s*FT_TOKEN_KEY/.test(APPELANTS) && !/removeItem\(\s*'ft4_devtoken'/.test(APPELANTS), JSON.stringify(appels));
};

/** Monte le VRAI worker.js, avec un Apps Script et une API Anthropic simulés et observés. */
function monter(ROOT, fs, path, pont) {
  const src = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8').replace(/export default/, 'const _handlerExporte =');
  const appels = [];
  const ctx = {
    crypto: globalThis.crypto, TextEncoder, Request, Response, Headers, URL,
    console: { log() {}, error() {}, warn() {} }, setTimeout, clearTimeout,
    async fetch(url, opts) {
      let corps = {}; try { corps = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
      const u = String(url); appels.push({ url: u, action: corps.action || '' });
      if (u.indexOf('api.anthropic.com') >= 0)
        return { ok: true, status: 200, async json() { return { content: [{ type: 'text', text: 'Réponse de Milo.' }], usage: {} }; }, async text() { return ''; } };
      if (u.indexOf('script.google.com') >= 0 && corps.action === 'authIdentity') return pont();
      return { ok: true, status: 200, async json() { return { status: 'ok' }; }, async text() { return '{}'; } };
    },
  };
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx); vm.runInContext(src + '\n;globalThis._h=_handlerExporte;', ctx, { filename: 'worker.js' });
  return { ctx, appels };
}
const repJson = (o) => () => ({ ok: true, status: 200, async json() { return o; }, async text() { return JSON.stringify(o); } });

module.exports.reel = async function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCLXXVI. MILO-AUTH1 — le Worker CONDUIT (réseau simulé, 0 appel réel) ═══');
  const lance = async (pont, action) => {
    const { ctx, appels } = monter(ROOT, fs, path, pont);
    const req = new Request('https://worker.test/', { method: 'POST',
      headers: { Origin: 'https://michdu75-commits.github.io', 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action || 'coach', token: 'a'.repeat(64), message: 'bonjour', context: 'ctx', history: [] }) });
    const r = await ctx._h.fetch(req, { ANTHROPIC_API_KEY: 'cle-de-test' }, { waitUntil() {} });
    let d = {}; try { d = await r.json(); } catch (e) {}
    return { statut: r.status, d, ia: appels.filter(a => a.url.indexOf('api.anthropic.com') >= 0).length };
  };
  const CAS = {
    valide:   repJson({ status: 'ok', email: 'compte-a.test', premium: false, blocked: false }),
    revoque:  repJson({ status: 'error', error: 'token', raison: 'revoque' }),
    inconnu:  repJson({ status: 'error', error: 'token', raison: 'inconnu' }),
    absent:   repJson({ status: 'error', error: 'token', raison: 'absent' }),
    reseau:   () => { throw new Error('ECONNRESET'); },
    html:     () => ({ ok: false, status: 502, async json() { throw new SyntaxError('Unexpected token <'); }, async text() { return '<html>'; } }),
    erreur:   repJson({ status: 'error', error: 'token', raison: 'erreur' }),
    sansRaison: repJson({ status: 'error', error: 'auth' }),
    illisible: repJson({ status: 'error', error: 'token', raison: 'illisible' }),
    okSansEmail: repJson({ status: 'ok' }),
    nouvelle: repJson({ status: 'error', error: 'token', raison: 'jamais_vue' }),
  };
  const R = {}; for (const k of Object.keys(CAS)) R[k] = await lance(CAS[k]);
  const reco = (x) => /Reconnecte ton appareil/.test(x.d.reply || '');
  const tempo = (x) => x.statut === 503 && x.d.error === 'identite_indisponible' && /momentanément indisponible/.test(x.d.reply || '') && !reco(x);
  t('AUTH-A identité valide → la requête passe (1 appel IA), comportement inchangé', R.valide.statut === 200 && R.valide.ia === 1, JSON.stringify(R.valide));
  ['revoque', 'inconnu', 'absent'].forEach(k => t('AUTH-B refus réel « ' + k + ' » → 401 auth + « Reconnecte », 0 appel IA',
    R[k].statut === 401 && R[k].d.error === 'auth' && reco(R[k]) && R[k].ia === 0, JSON.stringify(R[k])));
  t('AUTH-C panne réseau du pont → 503 temporaire, PAS de reconnexion, 0 appel IA', tempo(R.reseau) && R.reseau.ia === 0 && R.reseau.d.raison === 'reseau', JSON.stringify(R.reseau));
  t('AUTH-C … page d\'erreur HTML (JSON illisible) → même famille temporaire, 0 appel IA', tempo(R.html) && R.html.ia === 0, JSON.stringify(R.html));
  t('AUTH-C … exception de stockage côté Apps Script (`erreur`) → temporaire, 0 appel IA', tempo(R.erreur) && R.erreur.ia === 0, JSON.stringify(R.erreur));
  t('AUTH-D réponse sans raison (`catch` de handleAuthIdentity_) → temporaire, 0 appel IA', tempo(R.sansRaison) && R.sansRaison.ia === 0, JSON.stringify(R.sansRaison));
  t('AUTH-D ligne de registre abîmée (`illisible`) → temporaire (décision ft-v1223), 0 appel IA', tempo(R.illisible) && R.illisible.ia === 0, JSON.stringify(R.illisible));
  t('AUTH-D « ok » SANS e-mail → identité NON prouvée : fermé, temporaire, 0 appel IA', tempo(R.okSansEmail) && R.okSansEmail.ia === 0, JSON.stringify(R.okSansEmail));
  t('AUTH-D raison JAMAIS VUE → fermée et dite temporaire (liste blanche, R29), 0 appel IA', tempo(R.nouvelle) && R.nouvelle.ia === 0, JSON.stringify(R.nouvelle));
  const echecs = Object.keys(R).filter(k => k !== 'valide');
  t('AUTH-⛔ INVARIANT : AUCUN échec de vérification n\'appelle l\'IA (' + echecs.length + ' cas)', echecs.every(k => R[k].ia === 0 && R[k].statut >= 400), JSON.stringify(echecs.map(k => [k, R[k].statut, R[k].ia])));
  // La garde est COMMUNE à toutes les actions IA, pas un correctif du seul chat.
  const autres = ['estimateFood', 'generateMealPlan', 'summarizeCoach', 'importProgram'];
  const RA = {}; for (const a of autres) RA[a] = { panne: await lance(CAS.reseau, a), refus: await lance(CAS.revoque, a) };
  t('AUTH-∀ la même distinction vaut pour les autres actions IA (' + autres.join(', ') + ')',
    autres.every(a => tempo(RA[a].panne) && RA[a].panne.ia === 0 && RA[a].refus.statut === 401 && reco(RA[a].refus) && RA[a].refus.ia === 0),
    JSON.stringify(autres.map(a => [a, RA[a].panne.statut, RA[a].refus.statut, RA[a].panne.ia + RA[a].refus.ia])));
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXVII. MILO-AUTH1 — ce que la personne LIT (chat, analyse de programme) ═══');
  const TOK = 'd'.repeat(64);
  const essai = async (statut, corps) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    await cx.route(/workers\.dev/, r => r.fulfill({ status: statut, contentType: 'application/json', body: JSON.stringify(corps) }));
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_ai1'))return; sessionStorage.setItem('_ai1','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${TOK}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(async () => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      S.premium = true; window._premiumPending = false;
      await sendToCoach('Bonjour Milo, comment je progresse sur mon développé couché ?');
      const bulles = [...document.querySelectorAll('.msg-coach')]; const chat = bulles.length ? bulles[bulles.length - 1].textContent : '';
      S.programmes = [{ name: 'Bloc test', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] }];
      await analyzeProgIa(0);
      const prog = (document.getElementById('prog-analysis-content') || {}).textContent || '';
      return { chat, prog, jeton: localStorage.getItem('ft4_devtoken') };
    });
    r.errs = errs; await cx.close(); return r;
  };
  const PANNE = { status: 'error', error: 'identite_indisponible', raison: 'reseau',
    reply: "Milo est momentanément indisponible : la vérification de ton appareil n'a pas pu se faire de notre côté. Réessaie dans un instant 🙏" };
  const REFUS = { status: 'error', error: 'auth', raison: 'revoque', reply: 'Reconnecte ton appareil pour utiliser Milo 👍' };
  const p = await essai(503, PANNE), f = await essai(401, REFUS);
  t('A6 chat · panne 503 → la personne lit « momentanément indisponible », JAMAIS « Reconnecte »',
    /momentanément indisponible/.test(p.chat) && !/Reconnecte/.test(p.chat) && !/Vérifie ta connexion/.test(p.chat), p.chat.slice(0, 200));
  t('A6 chat · refus 401 → la personne lit « Reconnecte ton appareil »', /Reconnecte ton appareil/.test(f.chat), f.chat.slice(0, 200));
  t('A6 analyse de programme · panne 503 → message temporaire (plus « Vérifie ta connexion »)',
    /momentanément indisponible/.test(p.prog) && !/Vérifie ta connexion/.test(p.prog) && !/Reconnecte/.test(p.prog), p.prog.slice(0, 200));
  t('A6 analyse de programme · refus 401 → « Reconnecte ton appareil »', /Reconnecte ton appareil/.test(f.prog), f.prog.slice(0, 200));
  t('A6 ⛔ après une panne (et même après un refus), le jeton d\'appareil est CONSERVÉ', p.jeton === TOK && f.jeton === TOK, JSON.stringify([p.jeton, f.jeton]).slice(0, 80));
  t('A6 ∅ aucune erreur de page', !p.errs.length && !f.errs.length, p.errs.concat(f.errs).slice(0, 2).join(' | '));
};
