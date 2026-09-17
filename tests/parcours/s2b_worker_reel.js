/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOC B-CCCXXII — S2-B : LA ROUTE DE SAUVEGARDE **EXÉCUTÉE**, PAS SEULEMENT RELUE

   ⭐⭐ POURQUOI CE FICHIER EXISTE ALORS QUE B-CCCXXI EXISTE DÉJÀ. Le bloc précédent lit la
   SOURCE : il prouve qu'une règle est écrite, jamais qu'elle est suivie. `tests/milo` dit la
   même chose depuis longtemps — *la présence n'est pas l'obéissance*. Ici on charge le vrai
   `worker.js`, on lui donne un faux Supabase et un faux Apps Script, et on REGARDE ce qu'il
   fait : combien d'appels, vers qui, avec quoi dedans.

   ⛔ CE QUE CE BANC NE PROUVE TOUJOURS PAS : il ne dit rien de Cloudflare, ni du vrai réseau,
   ni des vrais secrets. Il prouve la MÉCANIQUE de la route. La preuve de bout en bout se
   prendra sur le compte de test, en réseau réel.

   ⚠️ ON CHARGE LE FICHIER SERVI, PAS UNE COPIE. Un banc qui rejouerait une réécriture du
   Worker validerait la réécriture, pas la production.
   ════════════════════════════════════════════════════════════════════════════════════════ */

const vm = require('vm');

const H_CONNU = 'a'.repeat(64);     // un jeton brut bien formé, déjà inscrit
const H_NEUF = 'b'.repeat(64);      // bien formé, jamais vu
const H_REVOQ = 'c'.repeat(64);     // bien formé, inscrit mais révoqué

/** Monte le vrai Worker dans un bac à sable, avec un réseau qu'on observe. */
function monter(ROOT, fs, path, plan) {
  const src = fs.readFileSync(path.join(ROOT, 'worker.js'), 'utf8')
    .replace(/export default/, 'const _handlerExporte =');
  const appels = [];
  const ctx = {
    crypto: globalThis.crypto,
    TextEncoder,
    console: { log() {}, error() {}, warn() {} },
    async fetch(url, opts) {
      let corps = {};
      try { corps = JSON.parse((opts && opts.body) || '{}'); } catch (e) {}
      appels.push({ url: String(url), corps, entetes: (opts && opts.headers) || {} });
      const rep = plan(String(url), corps, appels.length);
      return {
        ok: rep.ok !== false,
        status: rep.statut || (rep.ok === false ? 400 : 200),
        async json() { return rep.json || {}; },
        async text() { return JSON.stringify(rep.json || {}); },
      };
    },
  };
  ctx.globalThis = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'worker.js' });
  return { ctx, appels };
}

/** Un faux Supabase qui connaît un registre, et un faux Apps Script. */
function planStandard(registre, options) {
  const o = options || {};
  return (url, corps) => {
    if (url.indexOf('/rest/v1/rpc/ft_enregistrer_instantane') >= 0) {
      if (o.sbPanne) return { ok: false, statut: 500 };
      const e = registre[corps.p_hachage];
      if (!e || e.revoque) return { ok: false, statut: 400, json: { message: 'identite' } };
      registre._ecrit = { compte: e.compte, data: corps.p_data };
      return { ok: true };
    }
    if (url.indexOf('/rest/v1/rpc/ft_inscrire_jeton') >= 0) {
      // fidèle au SQL : « ne rien faire si la ligne existe » — donc un révoqué reste révoqué.
      if (!registre[corps.p_hachage]) {
        registre[corps.p_hachage] = { compte: corps.p_compte, revoque: false };
      }
      return { ok: true };
    }
    if (url.indexOf('script.google.com') >= 0) {
      if (o.pontRefuse) return { ok: true, json: { status: 'error', raison: 'inconnu' } };
      if (o.pontPanne) throw new Error('reseau');
      return { ok: true, json: { status: 'ok', email: o.email || 'compte-a.test' } };
    }
    return { ok: true, json: {} };
  };
}

const ENV = { SUPABASE_URL: 'https://exemple.invalid', SUPABASE_SECRET: 'secret-de-test' };

async function reel(t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXXII. S2-B — LA ROUTE DE SAUVEGARDE, CONDUITE POUR DE VRAI ═══');

  const lance = async (corpsAppel, registre, options, env) => {
    const reg = registre || {};
    const { ctx, appels } = monter(ROOT, fs, path, planStandard(reg, options || {}));
    const r = await ctx.cloudSave(corpsAppel, env === undefined ? ENV : env);
    return { r, appels, reg };
  };
  const vers = (appels, motif) => appels.filter((a) => a.url.indexOf(motif) >= 0);

  // ── ① le chemin normal : Supabase seule, Google jamais sollicité ──────────────────
  {
    const reg = {};
    const { ctx } = monter(ROOT, fs, path, planStandard(reg, {}));
    const h = await ctx._hacher(H_CONNU);
    reg[h] = { compte: 'compte-a.test', revoque: false };
    const { r, appels } = await lance({ token: H_CONNU, data: { bw: 80 } }, reg, {});
    t('B-CCCXXII ① un appareil déjà inscrit écrit sans passer par Google',
      r.statut === 200 && r.corps.status === 'ok' && r.corps.voie === 'directe', JSON.stringify(r.corps));
    t('B-CCCXXII ② ⭐ zéro appel à Apps Script sur le chemin normal',
      vers(appels, 'script.google.com').length === 0, '');
    t('B-CCCXXII ③ un seul appel à Supabase', vers(appels, '/rpc/').length === 1, '');
    t('B-CCCXXII ④ la ligne écrite est celle du JETON', reg._ecrit && reg._ecrit.compte === 'compte-a.test', '');
  }

  // ── ② l'appareil inconnu : le pont tranche UNE fois, puis on inscrit ──────────────
  {
    const { r, appels, reg } = await lance({ token: H_NEUF, data: { bw: 81 }, appareil: 'tel' },
      {}, { email: 'compte-a.test' });
    t('B-CCCXXII ⑤ ⭐⭐ un appareil inconnu passe par le pont, puis écrit',
      r.statut === 200 && r.corps.voie === 'pont', JSON.stringify(r.corps));
    t('B-CCCXXII ⑥ le pont n\'est appelé qu\'une seule fois',
      vers(appels, 'script.google.com').length === 1, '');
    t('B-CCCXXII ⑦ ⭐ le hachage est INSCRIT au passage (remplissage à l\'usage)',
      vers(appels, 'ft_inscrire_jeton').length === 1, '');
    t('B-CCCXXII ⑧ le compte inscrit est celui rendu par le pont',
      (vers(appels, 'ft_inscrire_jeton')[0] || {}).corps.p_compte === 'compte-a.test', '');
    // et la fois SUIVANTE, plus de pont du tout
    const { r: r2, appels: a2 } = await lance({ token: H_NEUF, data: { bw: 82 } }, reg, {});
    t('B-CCCXXII ⑨ ⭐⭐ la fois suivante, le même appareil se passe de Google',
      r2.corps.voie === 'directe' && vers(a2, 'script.google.com').length === 0, '');
  }

  // ── ③ les refus ───────────────────────────────────────────────────────────────────
  {
    const { r, appels } = await lance({ token: 'PAS-UN-JETON', data: { bw: 1 } }, {}, {});
    t('B-CCCXXII ⑩ un jeton mal formé est refusé', r.statut === 401 && r.corps.error === 'auth', '');
    t('B-CCCXXII ⑪ ⭐ et il ne déclenche AUCUN appel réseau', appels.length === 0, '');
  }
  {
    const { r, appels } = await lance({ token: H_NEUF, data: { bw: 1 } }, {}, { pontRefuse: true });
    t('B-CCCXXII ⑫ hachage inconnu + pont qui refuse : refus', r.statut === 401 && r.corps.error === 'auth', '');
    t('B-CCCXXII ⑬ ⭐ et RIEN n\'est inscrit', vers(appels, 'ft_inscrire_jeton').length === 0, '');
  }
  {
    const reg = {};
    const { ctx } = monter(ROOT, fs, path, planStandard(reg, {}));
    reg[await ctx._hacher(H_REVOQ)] = { compte: 'compte-a.test', revoque: true };
    const { r, appels } = await lance({ token: H_REVOQ, data: { bw: 1 } }, reg,
      { email: 'compte-a.test' });
    t('B-CCCXXII ⑭ ⭐⭐ un jeton RÉVOQUÉ ne ressuscite pas, même si le pont le valide',
      r.statut === 401 && r.corps.raison === 'revoque', JSON.stringify(r.corps));
    t('B-CCCXXII ⑮ ⭐ exactement deux tentatives d\'écriture, jamais une boucle',
      vers(appels, 'ft_enregistrer_instantane').length === 2, '');
    t('B-CCCXXII ⑯ la ligne reste révoquée après la tentative d\'inscription',
      reg[await ctx._hacher(H_REVOQ)].revoque === true, '');
  }

  // ── ④ panne et configuration : jamais confondues avec un refus d'identité ─────────
  {
    const { r } = await lance({ token: H_CONNU, data: { bw: 1 } }, {}, { sbPanne: true });
    t('B-CCCXXII ⑰ ⭐ une panne du cloud n\'est pas un refus d\'identité',
      r.statut === 503 && r.corps.error === 'cloud', JSON.stringify(r.corps));
  }
  {
    const { r, appels } = await lance({ token: H_CONNU, data: { bw: 1 } }, {}, {}, {});
    t('B-CCCXXII ⑱ ⛔ sans secret configuré, la porte est FERMÉE (jamais ouverte)',
      r.statut === 503 && r.corps.raison === 'config', JSON.stringify(r.corps));
    t('B-CCCXXII ⑲ et aucun appel n\'est tenté', appels.length === 0, '');
  }
  {
    const { r } = await lance({ token: H_CONNU, data: [1, 2] }, {}, {});
    t('B-CCCXXII ⑳ une charge qui n\'est pas un objet est refusée',
      r.statut === 400 && r.corps.error === 'charge', '');
  }

  // ── ⑤ ce qui ne doit JAMAIS voyager ───────────────────────────────────────────────
  {
    const { appels } = await lance(
      { token: H_NEUF, data: { email: 'autre.test', accountId: 'x', premium: true, bw: 83 } },
      {}, { email: 'compte-a.test' });
    const sb = vers(appels, '/rpc/');
    const tout = JSON.stringify(sb);
    t('B-CCCXXII ㉑ ⛔⛔ le jeton BRUT n\'apparaît dans AUCUN appel à Supabase',
      tout.indexOf(H_NEUF) === -1, '');
    t('B-CCCXXII ㉒ ⛔ aucun appel à Supabase ne porte de paramètre d\'adresse',
      sb.every((a) => !('p_email' in a.corps)), '');
    t('B-CCCXXII ㉓ ⭐⭐ une adresse glissée dans la charge ne change PAS le compte inscrit',
      (vers(appels, 'ft_inscrire_jeton')[0] || {}).corps.p_compte === 'compte-a.test', '');
    const pont = vers(appels, 'script.google.com')[0];
    t('B-CCCXXII ㉔ le pont ne reçoit que le jeton, aucune donnée métier',
      pont && Object.keys(pont.corps).sort().join(',') === 'action,token', '');
  }
}

module.exports = { reel };
