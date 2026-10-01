/* ══════════════════════════════════════════════════════════════════════════════════════
   ☁️🍽️ NUTRITION LOT 3 — NUT-FOODLOG-RESTORE-01 : LA RESTAURATION NE SUPPRIME PLUS UNE LIGNE DU
   JOURNAL ALIMENTAIRE (01/10/2026, session-B, à la demande de Michel) — blocs B-CDXXII → B-CDXXIV (C7′ : collision d'id, 01/10).

   LE DÉFAUT (audit en lecture seule du 01/10, master `1ca144ad`) : `_applyRestoreData` remplaçait
   `S.foodLog` par le journal du cloud dès que celui-ci avait AUTANT ou PLUS de lignes. Une ligne
   locale jamais synchronisée disparaissait, en mémoire et sur le disque — par « Restaurer » comme
   par la restauration automatique au démarrage.

   LA RÈGLE (décision de Michel) : union par identifiant ; toutes les lignes du téléphone restent ;
   à `id` égal, la version du téléphone ; une ancienne ligne sans `id` n'est reconnue que par une
   copie STRICTEMENT identique (multi-ensemble) ; puis `_foodLogIdentifier`.

   ⛔ Tout est lu dans l'app servie (mémoire, `ft4_foodlog`, après rechargement), réseau Apps Script
   SIMULÉ, données fictives. Contrôle négatif : `tools/mut_foodlog_restore.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const SE = lire('setup.js'), ST = lire('state.js');
  console.log('\n═══ B-CDXXII. NUT-FOODLOG-RESTORE-01 — le journal se fusionne, il ne se remplace plus (source) ═══');
  t('B-CDXXII ① plus de « la liste la plus longue gagne » sur `foodLog`',
    !/d\.foodLog\.length>=\(S\.foodLog\|\|\[\]\)\.length/.test(SE) && !/S\.foodLog=d\.foodLog/.test(SE), 'ancienne règle encore présente');
  t('B-CDXXII ② `_applyRestoreData` passe par la fusion puis par l\'identité canonique',
    SE.includes('S.foodLog=_fusionnerFoodLogRestauration(S.foodLog,d.foodLog).liste;_foodLogIdentifier(S.foodLog);'), 'appel absent');
  t('B-CDXXII ③ un seul propriétaire de la fusion (state.js), qui ne compare jamais des longueurs',
    (() => { const i = ST.indexOf('function_fusionnerFoodLogRestauration(local,cloud){'); if (i < 0) return false;
      const corps = ST.slice(i, ST.indexOf('return{liste:out,ajoutees};}', i));
      return corps.length > 0 && !/(local|cloud|out|S\.foodLog)\.length/.test(corps); })(),
    'fusion absente');
  t('B-CDXXII ④ les séances gardent leur union du lot 3 (non-régression de source)',
    SE.includes('_fusionnerSeancesRestauration(S.sessions,sessions)'), 'restauration des séances modifiée');
};

const L = (id, ts, name, kcal) => {
  const o = { ts, date: '2026-09-' + String(10 + (ts % 20)).padStart(2, '0'), meal: 'dej', name, kcal, prot: 10, carbs: 10, fat: 5 };
  if (id) o.id = id; return o;
};
const A = L('aaaaaaaa-1', 1, 'Riz', 200), B = L('bbbbbbbb-2', 2, 'Poulet', 250), C = L('cccccccc-3', 3, 'Pomme', 80),
      D = L('dddddddd-4', 4, 'Yaourt', 90),
      LOC = L('llllllll-9', 9, 'LOCALE RECENTE', 500), CLD = L('kkkkkkkk-8', 8, 'CLOUD RECENTE', 400),
      A2 = Object.assign({}, A, { kcal: 999 }),                       // même id que A, contenu différent
      X = L(null, 11, 'Ancienne X', 111), Y = L(null, 12, 'Ancienne Y', 122),
      Xbis = Object.assign({}, X, { kcal: 112 }),                    // ancienne ligne presque identique : un AUTRE repas
      YA = L(null, 13, 'Yaourt ancien', 60);
const profil = (fl, ses) => ({ status: 'ok', premium: false,
  profile: { name: 'Test', bw: 80, age: 40, height: 180, gender: 'H', goal: 'muscle', foodLog: fl },
  prs: {}, sessions: ses || [{ id: 1001, date: '2026-09-01', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }],
  weightLog: [], sleepLog: [] });

module.exports.ecran = async function (t, b, PORT) {
  let cloud = null; const posts = [];
  const nouvelle = async (init) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    await cx.route(/script\.google\.com|workers\.dev|anthropic/, async rt => {
      let a = ''; try { a = JSON.parse(rt.request().postData() || '{}').action || ''; } catch (e) {}
      posts.push(a);
      if (a === 'loadProfile' && cloud) return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cloud) });
      return rt.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    if (init) await cx.addInitScript(init);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1800);
    return { cx, pg, errs };
  };
  const etat = pg => pg.evaluate(() => {
    const m = (S.foodLog || []).map(x => ({ n: x.name, k: x.kcal, id: x.id }));
    const d = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]').map(x => ({ n: x.name, k: x.kcal, id: x.id }));
    return { m, d };
  });
  const noms = l => l.map(x => x.n).join(' | ');
  const canon = l => l.every(x => typeof x.id === 'string' && x.id.length >= 8) && new Set(l.map(x => x.id)).size === l.length;
  console.log('\n-- B-CDXXIII. NUT-FOODLOG-RESTORE-01 — restauration conduite dans l\'app (fusion, chemins réels, rechargement) --');

  /* 1. La fusion conduite par `_applyRestoreData` (le vrai code), cas C1 → C8. */
  const { cx, pg, errs } = await nouvelle();
  const cas = async (loc, cl) => {
    await pg.evaluate(({ loc, cl, raw }) => { S.foodLog = JSON.parse(JSON.stringify(loc)); persist();
      raw.profile.foodLog = cl; _applyRestoreData(raw); }, { loc, cl, raw: profil([]) });
    return etat(pg);
  };
  const ok = (r, attendu) => noms(r.m) === attendu && noms(r.d) === attendu && canon(r.m) && canon(r.d);
  const det = r => 'mémoire [' + noms(r.m) + '] · disque [' + noms(r.d) + '] · ids ' + JSON.stringify(r.m.map(x => x.id));

  let r = await cas([A, B, C], []);
  t('B-CDXXIII C1 local 3 / cloud vide → le local est gardé', ok(r, 'Riz | Poulet | Pomme'), det(r));
  r = await cas([], [A, B, C]);
  t('B-CDXXIII C2 local vide / cloud 3 → le cloud est récupéré', ok(r, 'Riz | Poulet | Pomme'), det(r));
  r = await cas([A, B, LOC], [A, B, C, D]);
  t('B-CDXXIII C3 ⭐ cloud plus long (4) : la ligne locale récente RESTE, les lignes du cloud s\'ajoutent',
    ok(r, 'Riz | Poulet | LOCALE RECENTE | Pomme | Yaourt'), det(r));
  r = await cas([A, B, C, D], [A, B, CLD]);
  t('B-CDXXIII C4 local plus long (4) : la ligne du cloud absente du téléphone est AJOUTÉE',
    ok(r, 'Riz | Poulet | Pomme | Yaourt | CLOUD RECENTE'), det(r));
  r = await cas([A, B, LOC], [A, B, CLD]);
  t('B-CDXXIII C5 ⭐⭐ MÊME LONGUEUR (3/3), contenus différents : union, aucune ligne locale perdue',
    ok(r, 'Riz | Poulet | LOCALE RECENTE | CLOUD RECENTE'), det(r));
  r = await cas([A, B, C], [C, A, B]);
  t('B-CDXXIII C6 mêmes lignes, autre ordre : rien perdu, rien doublé, ordre du téléphone',
    ok(r, 'Riz | Poulet | Pomme'), det(r));
  r = await cas([A], [A, A]);
  const r7b = await cas([], [A, A]);
  t('B-CDXXIII C7 doublon d\'id dans le cloud (copies identiques) : une seule ligne, avec ou sans copie locale',
    ok(r, 'Riz') && ok(r7b, 'Riz') && r7b.m[0].id === 'aaaaaaaa-1', det(r) + ' || ' + det(r7b));
  const r7c = await cas([], [A, A2]);
  t('B-CDXXIII C7′ même id, contenus DIFFÉRENTS dans le cloud : les deux restent, le second reçoit un id neuf',
    ok(r7c, 'Riz | Riz') && r7c.m[0].k === 200 && r7c.m[1].k === 999 && r7c.m[0].id === 'aaaaaaaa-1' && r7c.m[1].id !== 'aaaaaaaa-1', det(r7c));
  const r7d = await cas([A], [A2]);
  t('B-CDXXIII C7″ même id local / cloud, contenus différents : la version du TÉLÉPHONE reste (200, pas 999)',
    ok(r7d, 'Riz') && r7d.m[0].k === 200, det(r7d));
  const r8a = await cas([], [X, Y]);
  t('B-CDXXIII C8 anciennes lignes sans id, téléphone vide : toutes ajoutées, et identifiées',
    ok(r8a, 'Ancienne X | Ancienne Y'), det(r8a));
  const xLocal = Object.assign({}, X, { id: 'eeeeeeee-5' });       // la même ancienne ligne, identifiée au chargement
  const r8b = await cas([xLocal], [X]);
  t('B-CDXXIII C8 la même ancienne ligne (identique, sauf l\'id posé par le téléphone) : PAS de doublon, l\'id local reste',
    ok(r8b, 'Ancienne X') && r8b.m[0].id === 'eeeeeeee-5', det(r8b));
  const r8c = await cas([xLocal], [Xbis]);
  t('B-CDXXIII C8 ⛔ deux anciennes lignes presque identiques (111 / 112 kcal) : les DEUX restent, aucun rapprochement flou',
    ok(r8c, 'Ancienne X | Ancienne X') && r8c.m.map(x => x.k).join(',') === '111,112', det(r8c));
  const r8d = await cas([Object.assign({}, YA, { id: 'ffffffff-6' }), Object.assign({}, YA, { id: 'gggggggg-7' })], [YA, YA, YA]);
  t('B-CDXXIII C8 multi-ensemble : 2 yaourts identiques sur le téléphone, 3 dans le cloud → 3, pas 2 ni 5',
    ok(r8d, 'Yaourt ancien | Yaourt ancien | Yaourt ancien'), det(r8d));

  /* ── B-CDXXIV. C7′ — COLLISION D'ID DANS LE CLOUD (01/10/2026, décision de Michel : « B doit être
     préservé »). Un seul exemplaire du cloud est la version de la ligne du téléphone ; un autre
     exemplaire au contenu distinct est préservé avec un id neuf, UNE fois (idempotence). */
  console.log('\n-- B-CDXXIV. C7′ — collision d\'id dans le cloud : rien perdu, rien recréé (moteur conduit + vrai bouton) --');
  const AX = L('xxxxxxxx-1', 21, 'Col A', 200), BX = L('xxxxxxxx-1', 22, 'Col B', 300), CX = L('xxxxxxxx-1', 23, 'Col C', 400);
  const encore = async (cl) => { await pg.evaluate(({ cl, raw }) => { raw.profile.foodLog = cl; _applyRestoreData(raw); }, { cl, raw: profil([]) }); return etat(pg); };
  const sig = r => r.m.map(x => x.n + ':' + x.k + ':' + x.id).join(' | ');
  const X_ = 'xxxxxxxx-1';
  let q = await cas([AX], [AX]);
  t('B-CDXXIV C7A cas normal (A id X des deux côtés) : 1 ligne, version du téléphone, id X inchangé',
    ok(q, 'Col A') && q.m[0].id === X_ && q.m[0].k === 200, det(q));
  const q1 = await cas([AX], [AX, BX]);
  t('B-CDXXIV C7B ⭐ collision : téléphone A (X) + cloud A (X) et B (X, distinct) → A + B, A garde X, B reçoit un id neuf',
    ok(q1, 'Col A | Col B') && q1.m[0].id === X_ && q1.m[1].id !== X_ && q1.m[1].k === 300, det(q1));
  const q2 = await encore([AX, BX]), q3 = await encore([AX, BX]);
  t('B-CDXXIV C7C idempotence : le même cloud restauré 3 fois → 2 → 2 → 2, ids et contenus identiques',
    ok(q2, 'Col A | Col B') && ok(q3, 'Col A | Col B') && sig(q1) === sig(q2) && sig(q2) === sig(q3), sig(q1) + ' || ' + sig(q2) + ' || ' + sig(q3));
  await pg.reload(); await pg.waitForTimeout(1800);
  const q4 = await etat(pg), q5 = await encore([AX, BX]);
  t('B-CDXXIV C7D après un vrai rechargement puis une nouvelle restauration : toujours 2 lignes, mémoire = disque, ids stables',
    ok(q4, 'Col A | Col B') && ok(q5, 'Col A | Col B') && sig(q4) === sig(q1) && sig(q5) === sig(q1), sig(q4) + ' || ' + sig(q5));
  const e1 = await cas([AX], [AX, BX, CX]), e2 = await encore([AX, BX, CX]), e3 = await encore([AX, BX, CX]);
  t('B-CDXXIV C7E trois exemplaires distincts du même id → A + B + C, ids distincts, stables sur 3 restaurations',
    ok(e1, 'Col A | Col B | Col C') && sig(e1) === sig(e2) && sig(e2) === sig(e3) && e1.m[0].id === X_, sig(e1) + ' || ' + sig(e3));
  q = await cas([AX], [AX, Object.assign({}, AX)]);
  t('B-CDXXIV C7F copies strictement identiques (A, A) : 1 ligne, pas de faux doublon', ok(q, 'Col A') && q.m[0].id === X_, det(q));
  const g1 = await cas([AX], [AX, BX, Object.assign({}, BX)]), g2 = await encore([AX, BX, Object.assign({}, BX)]);
  t('B-CDXXIV C7G deux copies identiques de B (même id X) : B une seule fois → 2 lignes, stable à la 2ᵉ restauration',
    ok(g1, 'Col A | Col B') && sig(g1) === sig(g2), sig(g1) + ' || ' + sig(g2));
  q = await cas([AX], [BX, AX]);
  t('B-CDXXIV C7H ordre inversé dans le cloud (B avant A) : la copie identique est la version absorbée, B reste → A + B',
    ok(q, 'Col A | Col B') && q.m[0].id === X_ && q.m[0].k === 200, det(q));
  q = await cas([Object.assign({}, AX, { kcal: 250 })], [AX]);
  t('B-CDXXIV C7I un seul exemplaire cloud, contenu différent (A corrigée sur le téléphone) : PAS de doublon, le téléphone gagne',
    ok(q, 'Col A') && q.m[0].k === 250, det(q));
  await cx.close();

  /* 2. Chemin MANUEL réel : Profil → Restaurer (`doRestoreAccount`), puis vrai rechargement. */
  posts.length = 0; cloud = profil([A, B, CLD]);
  const seed = fl => `if(!sessionStorage.getItem('graine')){sessionStorage.setItem('graine','1');localStorage.setItem('ft4_ob2','1');`
    + `localStorage.setItem('ft4_foodlog',${JSON.stringify(JSON.stringify(fl))});}`;
  {
    const { cx, pg, errs: e2 } = await nouvelle(seed([A, B, LOC]));
    await pg.evaluate(async () => { const inp = document.getElementById('restore-email-inp'); inp.value = 'test@example.invalid';
      document.getElementById('restore-account-btn').click(); });
    await pg.waitForTimeout(2500);
    const avant = await etat(pg);
    await pg.reload(); await pg.waitForTimeout(1800);
    const apres = await etat(pg);
    t('B-CDXXIII MANUEL ⭐ « Restaurer » (vrai bouton) : union 3/3 en mémoire et sur le disque',
      ok(avant, 'Riz | Poulet | LOCALE RECENTE | CLOUD RECENTE') && posts.includes('loadProfile'), det(avant) + ' · requêtes ' + posts.join(','));
    t('B-CDXXIII MANUEL … et la même union APRÈS un vrai rechargement de la page',
      ok(apres, 'Riz | Poulet | LOCALE RECENTE | CLOUD RECENTE'), det(apres));
    t('B-CDXXIII MANUEL aucune erreur de page', e2.length === 0, e2.slice(0, 2).join(' | '));
    await cx.close();
  }

  /* 2 bis. C7′ par le VRAI bouton « Restaurer », rechargement entre chaque restauration (B-CDXXIV). */
  {
    const AX = L('xxxxxxxx-1', 21, 'Col A', 200), BX = L('xxxxxxxx-1', 22, 'Col B', 300);
    cloud = profil([AX, BX]);
    const { cx, pg, errs: e4 } = await nouvelle(seed([AX]));
    const tours = [];
    for (let i = 0; i < 3; i++) {
      await pg.evaluate(() => { document.getElementById('restore-email-inp').value = 'test@example.invalid';
        document.getElementById('restore-account-btn').click(); });
      await pg.waitForTimeout(2200);
      const m = await etat(pg); await pg.reload(); await pg.waitForTimeout(1600);
      tours.push({ m, apres: await etat(pg) });
    }
    const s0 = tours[0].m.m.map(x => x.n + ':' + x.id).join(' | ');
    t('B-CDXXIV C7′ VRAI BOUTON : 3 restaurations du même cloud avec rechargement → 2 / 2 / 2, ids stables, mémoire = disque',
      tours.every(x => ok(x.m, 'Col A | Col B') && ok(x.apres, 'Col A | Col B')
        && x.m.m.map(y => y.n + ':' + y.id).join(' | ') === s0 && x.apres.m.map(y => y.n + ':' + y.id).join(' | ') === s0)
      && tours[0].m.m[0].id === 'xxxxxxxx-1' && tours[0].m.m[1].id !== 'xxxxxxxx-1' && e4.length === 0,
      tours.map(x => det(x.m) + ' → ' + det(x.apres)).join(' || ') + (e4.length ? ' · erreurs ' + e4[0] : ''));
    await cx.close();
  }

  /* 3. Chemin AUTOMATIQUE réel : démarrage, aucune séance/PR/programme local, journal rempli. */
  posts.length = 0; cloud = profil([A, B, CLD]);
  {
    const { cx, pg, errs: e3 } = await nouvelle(seed([A, B, LOC]).replace("localStorage.setItem('ft4_ob2','1');",
      "localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_email','test@example.invalid');"));
    await pg.waitForTimeout(2000);
    const avant = await etat(pg);
    const ses = await pg.evaluate(() => (S.sessions || []).length);
    await pg.reload(); await pg.waitForTimeout(1800);
    const apres = await etat(pg);
    t('B-CDXXIII AUTO ⭐ restauration automatique au démarrage : union, la ligne locale reste (et la séance du cloud arrive)',
      ok(avant, 'Riz | Poulet | LOCALE RECENTE | CLOUD RECENTE') && ses === 1 && posts.includes('loadProfile'), det(avant) + ' · séances ' + ses);
    t('B-CDXXIII AUTO … et la même union APRÈS un vrai rechargement', ok(apres, 'Riz | Poulet | LOCALE RECENTE | CLOUD RECENTE'), det(apres));
    t('B-CDXXIII AUTO aucune erreur de page', e3.length === 0, e3.slice(0, 2).join(' | '));
    await cx.close();
  }

  /* 4. Non-régression : la restauration des séances garde l'union du lot 3. */
  posts.length = 0;
  cloud = profil([A], [{ id: 2002, date: '2026-09-03', exs: [{ name: 'Cloud', sets: [{ kg: 50, reps: 5, done: true }] }] }]);
  {
    const { cx, pg } = await nouvelle(`if(!sessionStorage.getItem('graine')){sessionStorage.setItem('graine','1');localStorage.setItem('ft4_ob2','1');`
      + `localStorage.setItem('ft4_sessions',JSON.stringify([{id:3003,date:'2026-09-04',exs:[{name:'Local',sets:[{kg:60,reps:5,done:true}]}]}]));}`);
    await pg.evaluate(() => { const inp = document.getElementById('restore-email-inp'); inp.value = 'test@example.invalid';
      document.getElementById('restore-account-btn').click(); });
    await pg.waitForTimeout(2500);
    const s = await pg.evaluate(() => (S.sessions || []).map(x => x.id).sort().join(','));
    t('B-CDXXIII séances : la restauration garde la séance locale ET ajoute celle du cloud (lot 3 intact)', s === '2002,3003', s);
    await cx.close();
  }
  t('B-CDXXIII aucune erreur de page (fusion directe)', errs.length === 0, errs.slice(0, 2).join(' | '));
};
