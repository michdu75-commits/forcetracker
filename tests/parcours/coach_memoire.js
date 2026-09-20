/* ═══════════════════════════════════════════════════════════════════════════════════════
   B-CCCXL / B-CCCXLI — LA PROVENANCE DE `coachMemory` (20/09/2026, arbitrage option B)
   ═══════════════════════════════════════════════════════════════════════════════════════
   Michel : « conserver `S.coachMemory`, mais lui ajouter une provenance et une structure
   minimale » · « ne jamais inventer une provenance que nous ne connaissons pas » · « ne
   donne surtout pas à coachMemory le statut `validated` simplement parce qu'elle existe ».

   ⛔⛔ CE QUE CES TÉMOINS PROTÈGENT AVANT TOUT : que `S.coachMemory` RESTE UNE CHAÎNE.
   Elle traverse 19 sites, dont le contrat réseau du Worker (`body.coachMemory`, concaténé
   dans le prompt) et le nettoyeur de chaîne d'Apps Script. En faire un objet injecterait
   « [object Object] » dans le prompt de Milo — un recul, pas un progrès.

   ⚠️ COMMENTAIRES NEUTRALISÉS pour les témoins de SOURCE : les commentaires de cette passe
   citent abondamment `coachMemoryMeta`, `legacy`, `generated` et `validated` — R30 exige
   que la raison soit écrite à côté du code. Un témoin qui lirait le fichier brut resterait
   vert pour toujours, quoi qu'on remette dans le code.
   ═══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const sansComm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                           .replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const ST = sansComm(brut('state.js'));
  const CO = sansComm(brut('coach.js'));
  const SE = sansComm(brut('setup.js'));
  const CJ = sansComm(brut('Code.js'));
  const WK = sansComm(brut('worker.js'));

  console.log('\n═══ B-CCCXL. Provenance de coachMemory (source) ═══');

  // ── ① LE CONTRAT RÉSEAU N'A PAS BOUGÉ : coachMemory reste une CHAÎNE ──────────────
  t('B-CCCXL ① ⭐⭐ le Worker lit toujours `coachMemory` comme une chaîne',
    /const\s+memory\s*=\s*body\.coachMemory\s*\|\|\s*''/.test(WK));
  t('B-CCCXL ② les envois à Milo passent toujours `S.coachMemory||\'\'` (jamais un objet)',
    (CO.match(/coachMemory\s*:\s*S\.coachMemory\s*\|\|\s*''/g) || []).length >= 3
      && !/coachMemory\s*:\s*S\.coachMemoryMeta/.test(CO));
  t('B-CCCXL ③ ⛔ aucun site ne transforme `S.coachMemory` en objet',
    !/S\.coachMemory\s*=\s*\{/.test(ST + CO + SE));

  // ── ④ LA PROVENANCE EST MESURÉE, PAS DEVINÉE ─────────────────────────────────────
  t('B-CCCXL ④ ⭐⭐ le Worker RENVOIE le modèle qui a résumé (`_model`)',
    /return\s*\{\s*summary:\s*summary\s*\|\|\s*''\s*,\s*_model:/.test(WK));
  t('B-CCCXL ⑤ le repli Apps Script renvoie le MÊME champ — sinon la provenance dépendrait de la route',
    /_model:\s*'claude-haiku-4-5-20251001'/.test(CJ));
  t('B-CCCXL ⑥ ⛔ le client ne fabrique JAMAIS un nom de moteur : il lit `data._model`',
    /_coachMemPoserProvenance\(\s*data\._model\s*\)/.test(CO)
      && !/_coachMemPoserProvenance\(\s*'claude/.test(CO));

  // ── ⑦ UN SEUL PROPRIÉTAIRE DE LA RÈGLE (R2) ──────────────────────────────────────
  t('B-CCCXL ⑦ ⭐ `_coachMemProvenance` est le SEUL à poser le statut `legacy`',
    (ST + CO + SE).split("statut:'legacy'").length - 1 === 1
      && /function _coachMemProvenance\(\)/.test(ST));
  t('B-CCCXL ⑧ la règle est rejouée au chargement ET après une restauration cloud',
    /_coachMemProvenance\(\)/.test(ST) && /_coachMemProvenance\(\)/.test(SE));

  // ── ⑨ PROVENANCE ≠ VALIDATION (consigne explicite de Michel) ─────────────────────
  t('B-CCCXL ⑨ ⛔⛔ aucun statut `validated` n\'est posé sur coachMemory',
    !/statut\s*:\s*['"]validated['"]/.test(ST + CO + SE)
      && /statut:'generated'/.test(ST) && /statut:'legacy'/.test(ST));
  t('B-CCCXL ⑩ le vocabulaire du statut se borne à deux valeurs, et elles sont nommées',
    (ST.match(/statut:'(generated|legacy)'/g) || []).length === 2);

  // ── ⑪ LE CLOUD : la provenance voyage, et avec le bon nettoyeur ──────────────────
  t('B-CCCXL ⑪ la sauvegarde cloud emporte la provenance',
    /coachMemoryMeta\s*:\s*S\.coachMemoryMeta\s*\|\|\s*null/.test(SE));
  t('B-CCCXL ⑫ ⭐ Apps Script la traite comme un OBJET (`_po_`), pas comme une chaîne',
    /body\.coachMemoryMeta[\s\S]{0,90}_po_\(body\.coachMemoryMeta/.test(CJ)
      && !/_ps_\(body\.coachMemoryMeta/.test(CJ));
  t('B-CCCXL ⑬ `loadProfile` la rend des DEUX côtés (profil + top-level)',
    (CJ.match(/coachMemoryMeta:\(data\.profile && data\.profile\.coachMemoryMeta\) \|\| null/g) || []).length === 2);

  // ── ⑭ LE DÉFAUT QUE LA RESTAURATION AURAIT CRÉÉ ─────────────────────────────────
  t('B-CCCXL ⑭ ⭐⭐ un texte restauré DIFFÉRENT jette l\'ancienne provenance (sinon elle serait FAUSSE)',
    /cm\s*&&\s*cm\s*!==\s*S\.coachMemory[\s\S]{0,80}S\.coachMemoryMeta\s*=\s*null/.test(SE));

  // ── ⑮ LA DONNÉE EST CLASSÉE FACE À MILO (R4a) ───────────────────────────────────
  const inv = JSON.parse(brut('tests/donnees/donnees-milo.json'));
  t('B-CCCXL ⑮ `coachMemoryMeta` est classée EXCLUE, avec sa raison écrite',
    !!inv.exclu.coachMemoryMeta && String(inv.exclu.coachMemoryMeta).length > 80
      && !(inv.transmis || []).includes('coachMemoryMeta'));
};


module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXLI. Provenance de coachMemory (conduite dans le navigateur) --');

  const R = await pg.evaluate(async () => {
    const o = {};
    const CLE = 'ft4_coach_mem', META = 'ft4_coach_mem_meta';
    /* ⛔ chaque geste rend un résultat : une étape interrompue ne doit pas ressembler à
       une étape verte (`BUGS.md` §61). */
    const poser = (txt, meta) => { try {
      if (txt === null) localStorage.removeItem(CLE); else localStorage.setItem(CLE, txt);
      if (meta === null) localStorage.removeItem(META); else localStorage.setItem(META, JSON.stringify(meta));
      load(); return true;
    } catch (e) { o.err = String(e && e.message || e); return false; } };

    // ── L1 : UNE MÉMOIRE ANCIENNE (chaîne nue, aucune provenance) ──────────────────
    o.l1ok = poser('Michel reprend apres une blessure au dos.', null);
    o.l1 = { texte: S.coachMemory, meta: S.coachMemoryMeta };

    // ── L2 : ON N'INVENTE RIEN — moteur, date et source restent NULS ───────────────
    o.l2 = { statut: (S.coachMemoryMeta || {}).statut,
             moteur: (S.coachMemoryMeta || {}).moteur,
             date: (S.coachMemoryMeta || {}).date,
             source: (S.coachMemoryMeta || {}).source };

    // ── L3 : IDEMPOTENCE — la règle rejouée trois fois ne change rien ──────────────
    const av = JSON.stringify(S.coachMemoryMeta);
    _coachMemProvenance(); _coachMemProvenance(); _coachMemProvenance();
    o.l3identique = JSON.stringify(S.coachMemoryMeta) === av;
    o.l3texte = S.coachMemory;

    // ── L4 : UN RÉSUMÉ NEUF — provenance complète, et le MOTEUR vient du serveur ───
    _coachMemPoserProvenance('claude-haiku-4-5-20251001');
    o.l4 = { statut: S.coachMemoryMeta.statut, moteur: S.coachMemoryMeta.moteur,
             source: S.coachMemoryMeta.source,
             dateISO: /^\d{4}-\d{2}-\d{2}T/.test(S.coachMemoryMeta.date || '') };

    // ── L5 : LE SERVEUR NE DIT PAS LE MOTEUR → on écrit `null`, pas un nom plausible
    _coachMemPoserProvenance(undefined);
    o.l5 = { statut: S.coachMemoryMeta.statut, moteur: S.coachMemoryMeta.moteur };
    _coachMemPoserProvenance('');
    o.l5vide = S.coachMemoryMeta.moteur;

    // ── L6 : UNE PROVENANCE CONNUE N'EST JAMAIS RÉTROGRADÉE EN `legacy` ────────────
    _coachMemPoserProvenance('claude-haiku-4-5-20251001');
    _coachMemProvenance();
    o.l6 = { statut: S.coachMemoryMeta.statut, moteur: S.coachMemoryMeta.moteur };

    // ── L7 : ALLER-RETOUR persist() → load() — rien ne se perd ─────────────────────
    S.coachMemory = 'Objectif : 140 kg au souleve de terre.';
    _coachMemPoserProvenance('claude-haiku-4-5-20251001');
    const attendu = JSON.stringify(S.coachMemoryMeta);
    persist();
    S.coachMemory = ''; S.coachMemoryMeta = null;    // on vide la mémoire vive
    load();
    o.l7 = { texte: S.coachMemory, metaIdentique: JSON.stringify(S.coachMemoryMeta) === attendu };

    // ── L8 : MÉMOIRE VIDE → PAS DE PROVENANCE ORPHELINE ───────────────────────────
    /* ⚠️ 1er JET FAUX : je vérifiais la clé de stockage juste après `load()`. Or `load()`
       LIT, il n'écrit pas — c'est `persist()` qui nettoie. *Un témoin qui attend une
       écriture d'une fonction de lecture mesure ma confusion, pas le code.* On conduit
       donc le geste complet : charger, puis persister. */
    o.l8ok = poser(null, { v: 1, statut: 'generated', moteur: 'x', date: 'y', source: 'z' });
    o.l8avantPersist = S.coachMemoryMeta;
    persist();
    o.l8 = { texte: S.coachMemory, meta: S.coachMemoryMeta,
             cleRetiree: localStorage.getItem('ft4_coach_mem_meta') === null };

    // ── L9 : UNE PROVENANCE ABÎMÉE REDEVIENT `legacy`, elle ne fait pas tomber load()
    o.l9ok = poser('Une memoire dont la fiche est cassee.', { n: 'importe quoi' });
    o.l9 = { statut: (S.coachMemoryMeta || {}).statut, texte: S.coachMemory };
    localStorage.setItem(CLE, 'Une memoire.'); localStorage.setItem(META, '{ceci nest pas du json');
    /* ⚠️⚠️ ON VIDE LA MÉMOIRE VIVE AVANT DE CHARGER — et c'est le contrôle négatif qui l'a
       exigé. Sans ces deux lignes, `S.coachMemoryMeta` portait encore le `legacy` posé par
       L9 juste au-dessus : le témoin lisait donc l'ÉTAT RÉSIDUEL et restait vert même quand
       `load()` s'interrompait avant d'avoir rien produit (mutation `M19`).
       👉 *Un témoin qui lit une variable que l'étape précédente a remplie mesure l'étape
       précédente.* Une vraie page démarre à vide : la fixture doit faire pareil. */
    S.coachMemory = ''; S.coachMemoryMeta = null;
    let l9bis = 'plante';
    try { load(); l9bis = (S.coachMemoryMeta || {}).statut; } catch (e) { l9bis = 'plante:' + e.message; }
    o.l9bis = { statut: l9bis, texte: S.coachMemory };

    // ── L10 : CE QUI PART AU NUAGE — la provenance oui, rien de plus ───────────────
    o.l10ok = poser('Memoire pour le nuage.', null);
    _coachMemPoserProvenance('claude-haiku-4-5-20251001');
    let corps = null;
    try {
      const espion = [];
      const vrai = window.fetch;
      window.fetch = function (u, opt) { try { espion.push({ u: String(u), b: opt && opt.body }); } catch (e) {} return Promise.reject(new Error('coupe')); };
      S.email = 'test@example.com'; S.url = 'https://exemple.invalid/exec';
      try { await _cloudSync(); } catch (e) {}
      window.fetch = vrai;
      const p = espion.find(x => x.b && String(x.b).indexOf('coachMemory') >= 0);
      corps = p ? JSON.parse(p.b) : null;
    } catch (e) { o.l10err = String(e && e.message || e); }
    o.l10 = corps ? {
      texte: corps.coachMemory,
      metaStatut: (corps.coachMemoryMeta || {}).statut,
      metaMoteur: (corps.coachMemoryMeta || {}).moteur,
      /* ⛔ la fiche ne doit porter QUE des métadonnées : aucune phrase de la personne */
      clesMeta: Object.keys(corps.coachMemoryMeta || {}).sort().join(',')
    } : { absent: true };

    return o;
  });

  const j = (x) => JSON.stringify(x);

  t('B-CCCXLI ① une mémoire ANCIENNE (chaîne nue) est toujours lue, et reste intacte',
    R.l1ok === true && R.l1.texte === 'Michel reprend apres une blessure au dos.', j(R.l1));
  t('B-CCCXLI ② ⭐⭐ elle reçoit le statut `legacy` — et AUCUNE provenance n\'est inventée',
    R.l2.statut === 'legacy' && R.l2.moteur === null && R.l2.date === null && R.l2.source === null,
    j(R.l2));
  t('B-CCCXLI ③ la règle est IDEMPOTENTE : rejouée 3 fois, elle ne change rien',
    R.l3identique === true && R.l3texte === 'Michel reprend apres une blessure au dos.',
    j({ identique: R.l3identique }));
  t('B-CCCXLI ④ un résumé NEUF porte statut `generated`, son moteur, sa source et une date ISO',
    R.l4.statut === 'generated' && R.l4.moteur === 'claude-haiku-4-5-20251001'
      && R.l4.source === 'summarizeCoach' && R.l4.dateISO === true, j(R.l4));
  t('B-CCCXLI ⑤ ⛔⛔ si le serveur ne dit PAS le moteur, on écrit `null` — jamais un nom plausible',
    R.l5.statut === 'generated' && R.l5.moteur === null && R.l5vide === null,
    j({ sansModele: R.l5, chaineVide: R.l5vide }));
  t('B-CCCXLI ⑥ ⭐ une provenance CONNUE n\'est jamais rétrogradée en `legacy`',
    R.l6.statut === 'generated' && R.l6.moteur === 'claude-haiku-4-5-20251001', j(R.l6));
  t('B-CCCXLI ⑦ aller-retour persist() → load() : ni le texte ni la provenance ne se perdent',
    R.l7.texte === 'Objectif : 140 kg au souleve de terre.' && R.l7.metaIdentique === true,
    j(R.l7));
  t('B-CCCXLI ⑧ une mémoire VIDE ne laisse aucune provenance orpheline — ni en mémoire, ni au stockage',
    R.l8ok === true && R.l8.texte === '' && R.l8avantPersist === null
      && R.l8.meta === null && R.l8.cleRetiree === true,
    j({ avantPersist: R.l8avantPersist, apres: R.l8 }));
  t('B-CCCXLI ⑨ une provenance ABÎMÉE redevient `legacy` sans faire tomber le chargement',
    R.l9ok === true && R.l9.statut === 'legacy' && R.l9.texte === 'Une memoire dont la fiche est cassee.',
    j(R.l9));
  t('B-CCCXLI ⑩ ⛔ une provenance ILLISIBLE (JSON cassé) ne perd pas la mémoire non plus',
    R.l9bis.statut === 'legacy' && R.l9bis.texte === 'Une memoire.', j(R.l9bis));
  t('B-CCCXLI ⑪ ⭐ la sauvegarde cloud emporte le texte ET sa provenance',
    R.l10 && !R.l10.absent && R.l10.texte === 'Memoire pour le nuage.'
      && R.l10.metaStatut === 'generated'
      && R.l10.metaMoteur === 'claude-haiku-4-5-20251001', j(R.l10));
  t('B-CCCXLI ⑫ ⛔ la fiche ne porte QUE des métadonnées — 5 clés, aucune phrase de la personne',
    R.l10 && !R.l10.absent && R.l10.clesMeta === 'date,moteur,source,statut,v',
    j({ cles: R.l10 && R.l10.clesMeta }));
  t('B-CCCXLI ⑬ aucune erreur de page pendant toute la conduite',
    errs.length === 0, errs.join(' · '));

  await cx.close();
};
