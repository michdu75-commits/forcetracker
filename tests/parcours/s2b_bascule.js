/* ════════════════════════════════════════════════════════════════════════════════════════
   S2-B PHASE 4 — LA BASCULE DU CLIENT VERS `cloudSave`

   B-CCCXXVI : témoins de SOURCE (ce qui est écrit)
   B-CCCXXVII : témoins de COMPORTEMENT (ce qui part réellement sur le réseau)

   ⭐⭐ LE BANC DE COMPORTEMENT CHARGE LE VRAI `supabase.js` ET LE VRAI INJECTEUR DE
   `constants.js`. Ce n'est pas un détail de confort : toute la sûreté de la sonde Admin
   repose sur UNE propriété de l'injecteur — *il n'écrase jamais un jeton déjà posé*. Un banc
   qui rejouerait ma propre réécriture de l'injecteur validerait ma réécriture, pas la
   production (leçon S1 : *un mode test qui n'emprunte pas le chemin de production valide le
   mode test*).

   ⛔ CE QUE CE BANC NE PROUVE PAS : ni Cloudflare, ni le vrai Supabase, ni les vrais secrets.
   Il prouve ce que le NAVIGATEUR envoie et ce qu'il fait de la réponse. Le reste se mesure
   sur le vrai compte, en réseau réel.
   ════════════════════════════════════════════════════════════════════════════════════════ */

const vm = require('vm');

const PROXY = 'https://dry-field-e931.forcetracker-app.workers.dev';
const JETON_APPAREIL = 'd'.repeat(64);

/* Un corps métier représentatif : il porte une adresse (comme le vrai), parce que l'adresse
   est une DONNÉE du profil — ce qu'on interdit, c'est qu'elle SÉLECTIONNE le compte. */
function corpsMetier() {
  return { action: 'saveProfile', email: 'michel@example.test', name: 'Michel', bw: 84,
           sessions: [{ date: '2026-09-18' }], prs: {} };
}

/** Monte le vrai `supabase.js` + le vrai injecteur, avec un réseau qu'on observe. */
function monter(ROOT, fs, path, opts) {
  const o = opts || {};
  const src = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8');
  const CO = fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8');
  // ⭐ L'injecteur RÉEL, découpé dans le fichier servi — jamais réécrit ici.
  const i = CO.indexOf('(function _ftPoserInjecteurJeton(){');
  const j = CO.indexOf('})();', i);
  if (i < 0 || j < 0) throw new Error('injecteur introuvable dans constants.js');
  const INJ = CO.slice(i, j + 5);

  const appels = [];
  const magasin = {};
  const ctx = {
    AI_PROXY_URL: PROXY,
    FT_TOKEN_KEY: 'ft4_devtoken',
    console: { log() {}, error() {}, warn() {} },
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : null; },
      setItem(k, v) { magasin[k] = String(v); },
      removeItem(k) { delete magasin[k]; },
    },
    Object, JSON, Date, String, Number, Boolean, Array, Error, isNaN,
    async fetch(url, o2) {
      let corps = null;
      try { corps = JSON.parse((o2 && o2.body) || 'null'); } catch (e) {}
      appels.push({ url: String(url), corps, entetes: (o2 && o2.headers) || null,
                    brut: (o2 && o2.body) || '' });
      if (o.jette) throw new Error('reseau');
      const rep = o.repondre ? o.repondre(String(url), corps, appels.length)
                             : { statut: 200, json: { status: 'ok', voie: 'pont' } };
      return {
        ok: (rep.statut || 200) < 400,
        status: rep.statut || 200,
        async json() { if (rep.pasDeJson) throw new Error('pas du json'); return rep.json || {}; },
        async text() { return JSON.stringify(rep.json || {}); },
      };
    },
  };
  ctx.window = o.demo ? { _demoMode: true } : {};
  ctx.globalThis = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);
  // `_ftToken` vient de constants.js dans la production : on charge ses deux lignes réelles.
  vm.runInContext("function _ftToken(){ try{ return localStorage.getItem(FT_TOKEN_KEY)||''; }"
                  + "catch(e){ return ''; } }", ctx, { filename: 'constants-token.js' });
  if (o.jeton) ctx.localStorage.setItem('ft4_devtoken', o.jeton);
  vm.runInContext(src, ctx, { filename: 'supabase.js' });
  vm.runInContext(INJ, ctx, { filename: 'constants-injecteur.js' });
  return { ctx, appels, magasin };
}

const pause = () => new Promise((r) => setTimeout(r, 0));

// ════════════════════════════════════════════════════════════════════════════════════════
// B-CCCXXVI — LA SOURCE
// ════════════════════════════════════════════════════════════════════════════════════════
function source(t, ROOT, fs, path) {
  const SB = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8');
  const SET = fs.readFileSync(path.join(ROOT, 'setup.js'), 'utf8');
  const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const CO = fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8');
  /* ⚠️ ON MESURE LE CODE, PAS LA DOCUMENTATION. Ces fichiers citent abondamment, dans leurs
     commentaires, tout ce que les témoins cherchent — la raison de chaque décision est
     justement écrite à côté du code (R30). Un témoin qui lirait le fichier brut resterait
     vert pour toujours, quoi qu'on remette dans le code. */
  const nuC = (s) => String(s || '').replace(/\/\*[\s\S]*?\*\//g, '')
                                    .replace(/(^|[^:"'])\/\/[^\n]*/gm, '$1');
  const corps = (n, src) => {
    const m = new RegExp('(?:async\\s+)?function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(src);
    if (!m) return '';
    let i = m.index + m[0].length - 1, d = 0;
    for (let j = i; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') { d--; if (!d) return src.slice(i, j + 1); }
    }
    return '';
  };
  const SBC = nuC(SB);
  const ENV = nuC(corps('sbEnvoyer', SB));
  const SONDE = nuC(corps('sbTestVoie', SB));
  const MIR = nuC(corps('sbMirror', SB));
  const CS = nuC(corps('_cloudSync', SET));
  const ADMIN = nuC(corps('loadSbAdmin', APP));

  console.log('\n═══ B-CCCXXVI. S2-B PHASE 4 — LA BASCULE (source) ═══');

  // ── la bascule elle-même ────────────────────────────────────────────────────────────
  t('B-CCCXXVI ① ⭐⭐ RETOURNÉ — `_cloudSync` appelle `sbEnvoyer`, plus `sbMirror`',
    /sbEnvoyer\(_corpsSync\)/.test(CS) && !/sbMirror\(/.test(CS), '');
  t('B-CCCXXVI ② la voie par défaut est celle du jeton résolu côté serveur',
    /SB_VOIE\s*=\s*'worker'/.test(SBC), '');
  t('B-CCCXXVI ③ ⛔ R30 — l\'ancienne porte n\'est PAS supprimée (retour arrière possible)',
    /function sbMirror\(/.test(SBC) && /function sbTest\(/.test(SBC)
    && /SB_VOIE\s*!==\s*'worker'\s*\)\s*return sbMirror\(/.test(ENV), '');
  t('B-CCCXXVI ④ ⛔ R2 — un SEUL constructeur de corps métier (aucun instantané séparé)',
    (SET.match(/action\s*:\s*'saveProfile'/g) || []).length === 1, '');

  // ── ce que la nouvelle porte n'envoie pas ───────────────────────────────────────────
  t('B-CCCXXVI ⑤ ⛔ aucune adresse ne SÉLECTIONNE le compte sur la nouvelle voie',
    ENV.length > 100 && !/p_email/.test(ENV) && !/payload\.email/.test(ENV), '');
  t('B-CCCXXVI ⑥ ⛔ la nouvelle porte ne vise JAMAIS Supabase en direct',
    !/SB_URL/.test(ENV) && !/SB_ANON/.test(ENV) && !/rest\/v1/.test(ENV), '');
  t('B-CCCXXVI ⑦ ⭐ le filet des justificatifs vit sur la nouvelle porte aussi',
    /_sbSansJustificatifs\(payload\)/.test(ENV), '');
  /* ⭐⭐ R2 — LE JETON A UN SEUL PROPRIÉTAIRE : l'injecteur de `constants.js`. Si `sbEnvoyer`
     lisait `_ftToken()` lui-même, on aurait deux lecteurs du même justificatif, et c'est
     exactement la dette que S2-A a payée sur le corps de sauvegarde. */
  t('B-CCCXXVI ⑧ ⭐⭐ `sbEnvoyer` ne lit PAS le jeton : l\'injecteur en est le seul propriétaire',
    !/_ftToken/.test(ENV), '');
  t('B-CCCXXVI ⑨ ⛔ la nouvelle porte ne journalise rien',
    !/console\./.test(ENV) && !/console\./.test(SONDE) && !/console\./.test(nuC(corps('_sbNoter', SB))), '');

  // ── la sonde Admin : la ligne la plus dangereuse du fichier ─────────────────────────
  /* ⭐⭐ SANS CE TÉMOIN, LA SONDE DEVIENDRAIT UNE VRAIE SAUVEGARDE. L'injecteur poserait le
     VRAI jeton de la personne et l'instantané serait écrasé par `{sonde:true}`. */
  t('B-CCCXXVI ⑩ ⭐⭐ la sonde POSE son jeton factice (sinon l\'injecteur mettrait le vrai)',
    /token\s*:\s*SB_SONDE_JETON/.test(SONDE), '');
  t('B-CCCXXVI ⑪ ⛔ le jeton de la sonde est bien formé et ne peut exister nulle part',
    /SB_SONDE_JETON\s*=\s*'0{64}'/.test(SBC), '');
  t('B-CCCXXVI ⑫ ⭐⭐ l\'injecteur n\'écrase toujours JAMAIS un jeton déjà posé',
    /&&\s*!o\.token\s*\)/.test(nuC(CO)), '');
  t('B-CCCXXVI ⑬ la sonde ne lit ni n\'envoie le vrai jeton',
    !/_ftToken/.test(SONDE), '');

  // ── panne contre révocation ─────────────────────────────────────────────────────────
  /* ⛔⛔ Le témoin regarde la BRANCHE 503, pas le fichier : « révoqué » est écrit ailleurs
     dans la même fonction, donc chercher sa présence globale ne mesurerait rien. */
  {
    const E = nuC(corps('_sbEtatDepuis', SB));
    const b503 = (E.match(/statut === 503[^\n]*\n?[^\n]*/) || [''])[0];
    t('B-CCCXXVI ⑭ ⭐⭐ une panne du cloud n\'est JAMAIS présentée comme une révocation',
      /statut === 503/.test(E) && /cloud indisponible/.test(b503) && !/révoqu/.test(b503), '');
    t('B-CCCXXVI ⑮ une révocation reste fail-closed et le dit',
      /revoque/.test(E) && /révoqué/.test(E) && /ok:false/.test(E.replace(/\s/g, '')), '');
    t('B-CCCXXVI ⑯ un succès n\'est reconnu que sur 200 ET `status:"ok"`',
      /statut === 200 && d && d\.status === 'ok'/.test(E), '');
  }

  // ── la carte Admin ne déclenche plus l'ancienne voie ────────────────────────────────
  t('B-CCCXXVI ⑰ ⭐⭐ la carte Admin éprouve la NOUVELLE route et n\'appelle plus l\'ancienne',
    /sbTestVoie\(\)/.test(ADMIN) && !/\bsbTest\(\)/.test(ADMIN), '');
  t('B-CCCXXVI ⑱ ⛔ plus AUCUN appel à l\'ancien test dans tout `app.js`',
    !/\bsbTest\(\)/.test(nuC(APP)), '');
  t('B-CCCXXVI ⑲ l\'état rend la présence du jeton en OUI/NON, jamais le jeton',
    /!!_ftToken\(\)/.test(nuC(corps('sbEtat', SB)))
    && !/\+\s*_ftToken\(\)/.test(nuC(corps('sbEtat', SB))), '');

  // ── V2 n'est PAS fermée, et le témoin le dit dans les deux sens ─────────────────────
  /* ⛔⛔ NON RETOURNÉ, ET C'EST VOULU. `sbMirror` garde son `p_email` libre et le RPC
     `ft_miroir` n'est pas révoqué : la fermeture est une passe à part, sur décision de
     Michel. *On ne maquille pas une porte ouverte.* */
  t('B-CCCXXVI ⑳ ⛔ NON RETOURNÉ — `p_email` reste libre dans l\'ancienne porte : V2 est ouverte',
    /p_email\s*:\s*email/.test(MIR), '');

  // ── périmètre ───────────────────────────────────────────────────────────────────────
  t('B-CCCXXVI ㉑ ⛔ PÉRIMÈTRE — Nutrition intacte dans `app.js`',
    /function _douaneLigne\(/.test(APP) && /function scanBarcode\(/.test(APP), '');
  /* ⚠️ CE TÉMOIN COMPTAIT D'ABORD LES OCCURRENCES ET EXIGEAIT « 1 » — il rougissait sur du
     code parfaitement sain : la carte NOMME la fonction deux fois, une pour le garde de
     chargement, une pour l'appel. *Un témoin qui fige une VALEUR mesure mon arithmétique
     mentale, pas le périmètre.* L'invariant juste n'est pas « combien », c'est « OÙ » :
     toutes les occurrences vivent dans `loadSbAdmin`, et nulle part ailleurs dans `app.js`. */
  t('B-CCCXXVI ㉒ ⛔ PÉRIMÈTRE — mon empreinte dans `app.js` tient dans la carte Admin',
    (nuC(APP).match(/sbTestVoie/g) || []).length
      === (ADMIN.match(/sbTestVoie/g) || []).length
    && (ADMIN.match(/sbTestVoie/g) || []).length > 0, '');
  t('B-CCCXXVI ㉓ ⛔ PÉRIMÈTRE — le transport Apps Script garde ses deux justificatifs',
    /authCode:_authCode\(\), token:_ftToken\(\)/.test(CS), '');
  t('B-CCCXXVI ㉔ ⛔ anti-alias — chaque justificatif n\'est lu QU\'UNE FOIS dans `_cloudSync`',
    (CS.match(/_ftToken\(\)/g) || []).length === 1
    && (CS.match(/_authCode\(\)/g) || []).length === 1, '');
}

// ════════════════════════════════════════════════════════════════════════════════════════
// B-CCCXXVII — LE COMPORTEMENT
// ════════════════════════════════════════════════════════════════════════════════════════
async function reel(t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXXVII. S2-B PHASE 4 — LA BASCULE (comportement réel) ═══');

  // ① ce qui part sur le réseau, et vers qui
  {
    const { ctx, appels } = monter(ROOT, fs, path, { jeton: JETON_APPAREIL });
    ctx.sbEnvoyer(corpsMetier());
    await pause();
    const a = appels[0] || {};
    t('B-CCCXXVII ① exactement UN appel, et il va au Worker',
      appels.length === 1 && a.url === PROXY, appels.length + ' appel(s)');
    t('B-CCCXXVII ② ⭐⭐ aucun appel ne vise Supabase en direct (ancienne voie non utilisée)',
      appels.every((x) => x.url.indexOf('/rest/v1/') < 0), '');
    t('B-CCCXXVII ③ la charge annonce `cloudSave`',
      !!a.corps && a.corps.action === 'cloudSave', '');
    t('B-CCCXXVII ④ ⭐⭐ le jeton voyage dans l\'ENVELOPPE, jamais dans la donnée',
      !!a.corps && a.corps.token === JETON_APPAREIL
      && !('token' in (a.corps.data || {})), '');
    t('B-CCCXXVII ⑤ ⛔ aucun sélecteur d\'identité : ni `p_email`, ni `email` d\'enveloppe',
      !!a.corps && !('p_email' in a.corps) && !('email' in a.corps), '');
    /* ⭐ L'adresse RESTE dans la donnée métier, et c'est juste : c'est un champ du profil,
       identique à ce que reçoit Apps Script (R2). Ce qu'on interdit, c'est qu'elle DÉSIGNE
       le compte — et c'est le serveur, pas ce banc, qui le garantit (B-CCCXXIII). */
    t('B-CCCXXVII ⑥ la donnée métier est transmise entière, adresse comprise',
      !!a.corps && a.corps.data && a.corps.data.email === 'michel@example.test'
      && Array.isArray(a.corps.data.sessions), '');
    t('B-CCCXXVII ⑦ ⛔ aucun en-tête `Content-Type` (pas de requête préliminaire par sauvegarde)',
      !a.entetes || !a.entetes['Content-Type'], '');
  }

  // ② le filet : un justificatif glissé dans le corps métier ne sort pas
  {
    const { ctx, appels } = monter(ROOT, fs, path, { jeton: JETON_APPAREIL });
    const c = corpsMetier();
    c.token = 'JETON_QUI_NE_DOIT_PAS_SORTIR';
    c.authCode = '1234';
    ctx.sbEnvoyer(c);
    await pause();
    const d = (appels[0] && appels[0].corps && appels[0].corps.data) || {};
    t('B-CCCXXVII ⑧ ⭐ le filet retire les justificatifs glissés dans le corps métier',
      !('token' in d) && !('authCode' in d), '');
    t('B-CCCXXVII ⑨ … et il ne touche à AUCUNE donnée métier',
      d.email === 'michel@example.test' && d.bw === 84 && !!d.prs, '');
    t('B-CCCXXVII ⑩ ⛔ le corps brut envoyé ne contient pas le justificatif glissé',
      (appels[0] || {}).brut.indexOf('JETON_QUI_NE_DOIT_PAS_SORTIR') < 0, '');
  }

  // ③ LA MESURE ATTENDUE PAR MICHEL : pont puis directe
  {
    let n = 0;
    const { ctx, appels } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 200, json: { status: 'ok', voie: (++n === 1 ? 'pont' : 'directe') } }),
    });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e1 = ctx.sbEtat();
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e2 = ctx.sbEtat();
    t('B-CCCXXVII ⑪ ⭐⭐ première sauvegarde : l\'état annonce la voie « pont »',
      e1.ok === true && e1.voie === 'pont' && /voie : pont/.test(e1.texte), e1.texte);
    t('B-CCCXXVII ⑫ ⭐⭐ seconde sauvegarde : l\'état annonce la voie « directe »',
      e2.ok === true && e2.voie === 'directe' && /voie : directe/.test(e2.texte), e2.texte);
    t('B-CCCXXVII ⑬ les deux sauvegardes ont emprunté le Worker, jamais l\'ancienne voie',
      appels.length === 2 && appels.every((x) => x.url === PROXY), '');
    t('B-CCCXXVII ⑭ ⛔ l\'état ne porte ni jeton ni haché',
      JSON.stringify(e2).indexOf(JETON_APPAREIL) < 0, '');
  }

  // ④ une panne du cloud n'est pas une révocation
  {
    const { ctx } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 503, json: { status: 'error', error: 'cloud', raison: 'panne' } }),
    });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e = ctx.sbEtat();
    t('B-CCCXXVII ⑮ ⭐⭐ cloud indisponible : dit comme une panne, JAMAIS comme une révocation',
      e.ok === false && /cloud indisponible/.test(e.texte) && !/révoqu/.test(e.texte), e.texte);
  }

  // ⑤ une révocation réelle reste fail-closed
  {
    const { ctx } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 401, json: { status: 'error', error: 'auth', raison: 'revoque' } }),
    });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e = ctx.sbEtat();
    t('B-CCCXXVII ⑯ ⭐ révocation : refus annoncé comme tel, aucun repli, aucune écriture',
      e.ok === false && /révoqué/.test(e.texte), e.texte);
  }

  // ⑥ appareil sans jeton : rien n'est deviné, et surtout aucun repli sur l'adresse
  {
    const { ctx, appels } = monter(ROOT, fs, path, {
      repondre: () => ({ statut: 401, json: { status: 'error', error: 'auth', raison: 'forme' } }),
    });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e = ctx.sbEtat();
    t('B-CCCXXVII ⑰ ⭐⭐ sans jeton : AUCUN repli vers l\'ancienne voie (V2 ne se rouvre pas)',
      appels.length === 1 && appels[0].url === PROXY
      && !('token' in (appels[0].corps || {})), '');
    t('B-CCCXXVII ⑱ … et l\'état le DIT au lieu de se taire',
      /AUCUN jeton sur cet appareil/.test(e.texte), e.texte);
  }

  // ⑦ panne réseau : jamais présentée comme un problème d'identité
  {
    const { ctx } = monter(ROOT, fs, path, { jeton: JETON_APPAREIL, jette: true });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e = ctx.sbEtat();
    t('B-CCCXXVII ⑲ réseau coupé : « réseau », jamais « révoqué »',
      e.ok === false && /réseau/.test(e.texte) && !/révoqu/.test(e.texte), e.texte);
  }

  // ⑧ mode démo : aucune écriture nulle part
  {
    const { ctx, appels } = monter(ROOT, fs, path, { jeton: JETON_APPAREIL, demo: true });
    ctx.sbEnvoyer(corpsMetier());
    await pause();
    t('B-CCCXXVII ⑳ ⛔ mode démo : aucun appel', appels.length === 0, '');
  }

  // ⑨ LA SONDE ADMIN — celle qui pourrait écraser un vrai instantané
  {
    const { ctx, appels } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 401, json: { status: 'error', error: 'auth', raison: 'inconnu' } }),
    });
    const r = await ctx.sbTestVoie();
    const a = appels[0] || {};
    t('B-CCCXXVII ㉑ ⭐⭐ LA SONDE N\'EMPORTE PAS LE VRAI JETON, même quand il existe',
      a.corps && a.corps.token === '0'.repeat(64)
      && a.brut.indexOf(JETON_APPAREIL) < 0, '');
    t('B-CCCXXVII ㉒ la sonde lit un refus comme une PREUVE que la route vit',
      r.ok === true && /REFUSE un jeton inconnu/.test(r.texte), r.texte);
  }
  {
    // ⛔ et si la route ACCEPTAIT un jeton inconnu, la sonde doit crier, pas se réjouir.
    const { ctx } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 200, json: { status: 'ok', voie: 'pont' } }),
    });
    const r = await ctx.sbTestVoie();
    t('B-CCCXXVII ㉓ ⭐⭐ un 200 sur jeton factice est une ALERTE, pas un succès',
      r.ok === false && /ACCEPT/.test(r.texte), r.texte);
  }
  {
    const { ctx } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL,
      repondre: () => ({ statut: 503, json: { status: 'error', error: 'cloud', raison: 'config' } }),
    });
    const r = await ctx.sbTestVoie();
    t('B-CCCXXVII ㉔ la sonde distingue une panne d\'un problème d\'identité',
      r.ok === false && /cloud est indisponible/.test(r.texte) && !/identité/.test(r.texte.replace("d'identité", '')), r.texte);
  }

  // ⑩ une réponse illisible ne doit pas casser la sauvegarde
  {
    const { ctx } = monter(ROOT, fs, path, {
      jeton: JETON_APPAREIL, repondre: () => ({ statut: 200, pasDeJson: true }),
    });
    ctx.sbEnvoyer(corpsMetier());
    await pause(); await pause();
    const e = ctx.sbEtat();
    t('B-CCCXXVII ㉕ réponse illisible : état cohérent, aucune exception',
      e.ok === false && !!e.texte, e.texte);
  }
}

module.exports = { source, reel };
