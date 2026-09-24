/* ══════════════════════════════════════════════════════════════════════════════════════
   🏃 B1 / B2 — L'ACTIVITÉ JAMAIS CHOISIE, ET LES VALEURS RELUES SANS BORNE (24/09/2026)

   Décision de Michel, après contre-vérification de Claude principal :
     · B1 — *D-016 s'applique aussi au niveau d'activité* : une activité jamais choisie ne
       devient plus en silence « Modéré (3-4j) » = 1,55, ne s'affiche plus comme sélectionnée,
       et ne fabrique plus de TDEE ni de macros. L'interface dit ce qui manque.
     · B2 — ce qui est RELU (stockage, cloud) passe par les MÊMES bornes que ce qui est SAISI.
       Mesuré avant correctif : activité −1 → TDEE **−1 749** ; 99 → **173 151** ;
       taille `1e6` → **9,7 M kcal** ; calories manuelles `Infinity` → glucides **infinis**.

   ⛔ AUCUNE RÈGLE NUTRITIONNELLE NE BOUGE : multiplicateurs, bonus métier/sport, ratios,
   résidu glucidique, cycle, plancher D-017 — tous figés par `nutri_moteur.js`.
   ⚠️ LIMITE ÉCRITE : `persist()` écrivait `ft4_act` à chaque sauvegarde, donc un `1.55` déjà
   stocké ne dit pas s'il a été choisi. Il est GARDÉ (témoin ⑬) — décision rendue à Michel.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js'), SE = lire('setup.js');
  const IH = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  console.log('\n═══ B-CCCLXII. B1/B2 — activité et relectures bornées, dans la source ═══');

  const sel = (IH.match(/<select id="act-sel">([\s\S]*?)<\/select>/) || ['', ''])[1];
  const vals = (sel.match(/value="([^"]*)"/g) || []).map(v => v.slice(7, -1)).filter(Boolean);
  const liste = (ST.match(/\[1\.2,1\.375,1\.55,1\.725,1\.9\]\.indexOf\(n\)/) || [''])[0];
  t('B-CCCLXII ① la liste de `_activiteValide` = les options de l\'écran (R2)',
    liste !== '' && vals.join(',') === '1.2,1.375,1.55,1.725,1.9', vals.join(','));
  t('B-CCCLXII ② aucune option d\'activité n\'est `selected` d\'office, « À choisir » en tête',
    !/selected/.test(sel) && /<option value="">À choisir<\/option>/.test(sel), sel.replace(/\s+/g, ' ').slice(0, 120));
  t('B-CCCLXII ③ plus aucun repli `1.55` dans le chargement ni dans le bonus sport',
    !/ft4_act'\)\|\|'1\.55'/.test(ST) && !/\|\|1\.55\)/.test(ST) && !/activityLevel:1\.55/.test(ST),
    'repli 1.55 revenu');
  t('B-CCCLXII ④ la restauration de l\'activité et des calories passe par les propriétaires',
    /_activiteValide\(d\.activityLevel\)/.test(SE) && /_kcalManuelleValide\(d\.manualKcal\)/.test(SE)
    && !/S\.activityLevel=parseFloat\(d\.activityLevel\)/.test(SE), 'restauration non bornée');
};

module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-20T12:00:00';
  const DECL = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau',
                 ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' };
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  /* Décor posé UNE fois (un addInitScript rejoue à chaque rechargement). */
  await pg.addInitScript(`(()=>{try{ if(localStorage.getItem('_decorAct')==='1')return;
    localStorage.clear();localStorage.setItem('_decorAct','1');
    const D=${JSON.stringify(DECL)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCLXIII. B1/B2 conduits (vrai chargement, vrai écran, vraie restauration) --');

  /* ① → ⑤ : nouveau profil SANS activité choisie, tel que chargé au démarrage. */
  const neuf = await pg.evaluate(async () => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; window.toast = () => {};
    const m = calcMacros(S.nutritionPhase);
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 300));
    const txt = (document.getElementById('s-nutrition') || document.body).textContent;
    goScreen('setup', document.getElementById('nb-setup'));
    await new Promise(r => setTimeout(r, 300));
    const se = document.getElementById('act-sel');
    persist();
    /* Trouvé par le contrôle négatif : « Enregistrer » avec « À choisir » ne doit rien écrire. */
    saveProfile();
    const apresSave = { act: S.activityLevel, disque: localStorage.getItem('ft4_act') };
    /* Trouvé par le contrôle négatif : sans historique, la carte « passer de… » se tait de toute
       façon. Avec 5 séances/semaine sur 4 semaines, elle parlerait — sauf qu'il n'y a pas d'« actuel ». */
    const T = new Date('2026-09-20T12:00:00'), ses = [];
    for (let d = 0; d < 28; d++) { const x = new Date(T - d * 864e5); if ([1, 2, 3, 4, 5].includes(x.getDay()))
      ses.push({ date: x.toISOString().slice(0, 10), exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true }] }] }); }
    const sesAvant = S.sessions; S.sessions = ses;
    const ecartHisto = ecartNiveauActivite();
    S.activityLevel = 1.55; const ecartTemoin = ecartNiveauActivite(); S.activityLevel = null;
    S.sessions = sesAvant;
    return { apresSave, ecartHisto, ecartTemoin: !!ecartTemoin, act: S.activityLevel, tdee: calcTDEE(), bmr: bmrDetail().kcal, cal: m.calories,
             P: m.prot_g, L: m.fat_g, G: m.carbs_g, manq: m.manquants, ecran: /il manque[^.]*niveau d.activité/.test(txt),
             sel: se ? se.value : 'ABSENT', selTxt: se && se.selectedIndex >= 0 ? se.options[se.selectedIndex].text : '',
             stocke: localStorage.getItem('ft4_act'), ecart: ecartNiveauActivite(),
             ctx: (typeof buildCoachContext === 'function') ? String(buildCoachContext()) : '' };
  });
  t('B-CCCLXIII ① profil sans activité choisie : activité `null`, TDEE et macros `null` (plus de 1,55 silencieux)',
    neuf.act === null && neuf.tdee === null && neuf.cal === null && neuf.P === null && neuf.G === null,
    JSON.stringify({ act: neuf.act, tdee: neuf.tdee, cal: neuf.cal, G: neuf.G }));
  t('B-CCCLXIII ② le BMR, lui, reste calculé (il n\'a pas besoin de l\'activité) : 1749',
    neuf.bmr === 1749, String(neuf.bmr));
  t('B-CCCLXIII ③ l\'écran Nutrition DEMANDE la donnée : « il manque ton niveau d\'activité »',
    neuf.ecran && JSON.stringify(neuf.manq) === JSON.stringify(["ton niveau d'activité"]), JSON.stringify(neuf.manq));
  t('B-CCCLXIII ④ le Profil affiche « À choisir », pas « Modéré (3-4j) »',
    neuf.sel === '' && neuf.selTxt === 'À choisir', neuf.sel + ' / ' + neuf.selTxt);
  t('B-CCCLXIII ⑤ `persist()` n\'écrit pas d\'activité inventée sur le disque',
    neuf.stocke === null, String(neuf.stocke));
  t('B-CCCLXIII ⑥ Milo lit « NON RENSEIGNÉ », jamais « null » ni 1.55 ; aucune carte « passer de Modéré à… »',
    /Niveau activité sportive: NON RENSEIGNÉ/.test(neuf.ctx) && !/Niveau activité sportive: (null|1\.55)/.test(neuf.ctx)
    && neuf.ecart === null, (neuf.ctx.match(/Niveau activité sportive:[^|]*/) || ['?'])[0]);

  t('B-CCCLXIII ⑥b « Enregistrer » le Profil avec « À choisir » n\'invente rien (ni en mémoire ni sur le disque)',
    neuf.apresSave.act === null && neuf.apresSave.disque === null, JSON.stringify(neuf.apresSave));
  t('B-CCCLXIII ⑥c 5 séances/sem sur 4 semaines, niveau jamais choisi : pas de carte « passer de… » (témoin : à 1,55 elle parle)',
    neuf.ecartHisto === null && neuf.ecartTemoin === true, JSON.stringify([neuf.ecartHisto, neuf.ecartTemoin]));

  /* ⑦ → ⑧ : choix explicite dans le Profil, puis vrai rechargement. */
  await pg.evaluate(() => {
    const se = document.getElementById('act-sel'); se.value = '1.725';
    se.dispatchEvent(new Event('change', { bubbles: true }));
    saveProfile();
  });
  const choisi = await pg.evaluate(() => ({ act: S.activityLevel, tdee: calcTDEE(), disque: localStorage.getItem('ft4_act') }));
  t('B-CCCLXIII ⑦ activité choisie dans le Profil : 1,725 → TDEE 3017 (multiplicateur inchangé), écrite sur le disque',
    choisi.act === 1.725 && choisi.tdee === 3017 && choisi.disque === '1.725', JSON.stringify(choisi));
  await pg.reload(); await pg.waitForTimeout(2200);
  const recharge = await pg.evaluate(async () => {
    goScreen('setup', document.getElementById('nb-setup'));
    await new Promise(r => setTimeout(r, 300));
    const se = document.getElementById('act-sel');
    return { act: S.activityLevel, tdee: calcTDEE(), sel: se ? se.value : 'ABSENT' };
  });
  t('B-CCCLXIII ⑧ après rechargement : 1,725 relu, sélectionné dans le Profil, TDEE 3017',
    recharge.act === 1.725 && recharge.sel === '1.725' && recharge.tdee === 3017, JSON.stringify(recharge));

  /* ⑨ → ⑫ : chargement d'un ANCIEN stockage (invalide ou incomplet), et restauration cloud. */
  const R = await pg.evaluate(() => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; window.toast = () => {};
    const BASE = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau',
                   ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', _decorAct: '1' };
    const charger = (o) => {
      localStorage.clear(); const D = Object.assign({}, BASE, o || {});
      Object.keys(D).forEach(k => { if (D[k] != null) localStorage.setItem(k, D[k]); });
      load();
      const m = calcMacros(S.nutritionPhase);
      return { act: S.activityLevel, age: S.age, ht: S.height, mk: S.manualKcal, tdee: calcTDEE(),
               cal: m.calories, G: m.carbs_g, manq: m.manquants };
    };
    const out = {};
    out.stock = {};
    ['-1', '99', '1.4', 'abc', 'Infinity', '1e9', 'null', ''].forEach(v => { out.stock[v] = charger({ ft4_act: v }); });
    out.age150 = charger({ ft4_act: '1.55', ft4_age: '150' });
    out.ht1e6 = charger({ ft4_act: '1.55', ft4_ht: '1e6' });
    out.mk = {};
    ['Infinity', '1e9', '-500', '100', '2200'].forEach(v => { out.mk[v] = charger({ ft4_act: '1.55', ft4_manualkcal: v }); });
    out.partiel = charger({ ft4_age: null, ft4_ht: null });
    out.legacy = charger({ ft4_act: '1.55' });
    /* Restauration cloud, sur un état où 1,375 a été CHOISI. */
    const restaurer = (prof) => {
      charger({ ft4_act: '1.375' });
      try { _applyRestoreData({ profile: Object.assign({ name: 'Sonde' }, prof) }); } catch (e) {}
      return { act: S.activityLevel, mk: S.manualKcal };
    };
    out.rs = {};
    [1.9, '1.2', -1, 99, 1.4, 'Infinity', '1e9', 'abc'].forEach(v => { out.rs[String(v)] = restaurer({ activityLevel: v }); });
    out.rsIncomplet = restaurer({ bw: 85.9 });
    out.rsMk = {};
    ['Infinity', 1e9, -500, 2200].forEach(v => { out.rsMk[String(v)] = restaurer({ manualKcal: v }); });
    /* Cloud incomplet sur un appareil NEUF (aucune activité) : rien n'est inventé. */
    localStorage.clear(); Object.keys(BASE).forEach(k => localStorage.setItem(k, BASE[k])); load();
    try { _applyRestoreData({ profile: { name: 'Sonde', bw: 85.9 } }); } catch (e) {}
    out.neufIncomplet = S.activityLevel;
    /* Bonus sport : règle des niveaux choisis intacte, zéro sans niveau. */
    const sport = (act) => { charger(act == null ? {} : { ft4_act: act }); S.coachQuiz = { answers: { othersport: 'velo' } }; return calcSportExtra(); };
    out.sport = { sans: sport(null), m155: sport('1.55'), m1725: sport('1.725') };
    /* D-016 et D-017 : non-régression. */
    out.d016 = charger({ ft4_act: '1.55', ft4_bw: '0' });
    out.d017 = charger({ ft4_act: '1.2', ft4_bw: '50', ft4_age: '45', ft4_ht: '160', ft4_gender: 'F', ft4_goal: 'perte' });
    return out;
  });
  const invalides = ['-1', '99', '1.4', 'abc', 'Infinity', '1e9', 'null', ''];
  t('B-CCCLXIII ⑨ ancien stockage invalide (−1, 99, 1.4, abc, Infinity, 1e9, null, vide) → activité `null`, aucun TDEE',
    invalides.every(v => R.stock[v].act === null && R.stock[v].tdee === null && R.stock[v].G === null),
    invalides.map(v => v + '→' + R.stock[v].act + '/' + R.stock[v].tdee).join(' '));
  t('B-CCCLXIII ⑩ âge 150 et taille 1e6 relus → absents (« il manque… »), plus de TDEE à 9,7 M kcal',
    R.age150.age === 0 && R.age150.tdee === null && R.ht1e6.ht === 0 && R.ht1e6.tdee === null
    && R.ht1e6.manq.indexOf('ta taille') >= 0, JSON.stringify([R.age150.tdee, R.ht1e6.ht, R.ht1e6.tdee]));
  t('B-CCCLXIII ⑪ calories manuelles relues : Infinity, 1e9, −500, 100 refusées (auto) ; 2200 gardée',
    ['Infinity', '1e9', '-500', '100'].every(v => R.mk[v].mk === 0 && R.mk[v].cal === 3011 && isFinite(R.mk[v].G))
    && R.mk['2200'].mk === 2200 && R.mk['2200'].cal === 2200,
    Object.keys(R.mk).map(k => k + '→' + R.mk[k].mk + '/' + R.mk[k].cal).join(' '));
  t('B-CCCLXIII ⑫ profil partiel (poids seul) : il manque la taille, l\'âge ET l\'activité',
    JSON.stringify(R.partiel.manq) === JSON.stringify(['ta taille', 'ton âge', "ton niveau d'activité"]),
    JSON.stringify(R.partiel.manq));
  t('B-CCCLXIII ⑬ ⚠️ LIMITE ÉCRITE : un 1,55 déjà stocké est gardé (provenance inconnue) → TDEE 2711',
    R.legacy.act === 1.55 && R.legacy.tdee === 2711, JSON.stringify(R.legacy));
  t('B-CCCLXIII ⑭ restauration valide : 1,9 et « 1.2 » acceptés',
    R.rs['1.9'].act === 1.9 && R.rs['1.2'].act === 1.2, JSON.stringify([R.rs['1.9'], R.rs['1.2']]));
  const refus = ['-1', '99', '1.4', 'Infinity', '1e9', 'abc'];
  t('B-CCCLXIII ⑮ restauration −1, 99, 1.4, Infinity, 1e9, abc → refusée, le 1,375 choisi reste',
    refus.every(v => R.rs[v].act === 1.375), refus.map(v => v + '→' + R.rs[v].act).join(' '));
  t('B-CCCLXIII ⑯ cloud incomplet : le choix local reste, et un appareil neuf reste SANS activité',
    R.rsIncomplet.act === 1.375 && R.neufIncomplet === null, JSON.stringify([R.rsIncomplet.act, R.neufIncomplet]));
  t('B-CCCLXIII ⑰ restauration des calories : Infinity, 1e9, −500 refusées ; 2200 acceptée',
    ['Infinity', '1000000000', '-500'].every(v => R.rsMk[v].mk === 0) && R.rsMk['2200'].mk === 2200,
    Object.keys(R.rsMk).map(k => k + '→' + R.rsMk[k].mk).join(' '));
  t('B-CCCLXIII ⑱ bonus « autre sport » : 0 sans niveau, 150 à 1,55, 0 à 1,725 (règle inchangée)',
    R.sport.sans === 0 && R.sport.m155 === 150 && R.sport.m1725 === 0, JSON.stringify(R.sport));
  t('B-CCCLXIII ⑲ D-016 intact : sans poids, aucun calcul (le poids reste cité en manquant)',
    R.d016.tdee === null && R.d016.cal === null && R.d016.manq.indexOf('ton poids') >= 0, JSON.stringify(R.d016));
  t('B-CCCLXIII ⑳ D-017 intact : femme 50 kg, perte, sédentaire → plancher 1 200 kcal',
    R.d017.cal === 1200, JSON.stringify(R.d017));

  /* ══ B-CCCLXIV. B2 ÉTENDU (nuit du 24→25/09) — chaque valeur, par CHAQUE porte d'entrée ══
     Les refus « par construction » (la liste des 5 niveaux) sont FIGÉS un par un : sans témoin,
     une future « simplification » en plage (1 ≤ n ≤ 2) les laisserait passer sans un rouge.
     ⭐ On distingue les ORIGINES : relu du stockage · reçu du cloud · tapé à l'écran · appel direct.
     « absent » et « invalide » finissent tous deux non exploitables (pas de marqueur de provenance
     cette nuit, décision de Michel) — mais chaque origine est vérifiée séparément. */
  console.log('\n-- B-CCCLXIV. B2 étendu : valeurs limites, par origine (stockage · cloud · écran · appel direct) --');
  const E = await pg.evaluate(() => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; window.toast = () => {};
    const BASE = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau',
                   ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', _decorAct: '1' };
    const charger = (o) => {
      localStorage.clear(); const D = Object.assign({}, BASE, o || {});
      Object.keys(D).forEach(k => { if (D[k] != null) localStorage.setItem(k, D[k]); });
      load();
      const m = calcMacros(S.nutritionPhase);
      return { act: S.activityLevel, tdee: calcTDEE(), G: m.carbs_g, mk: S.manualKcal, cal: m.calories };
    };
    const out = { direct: {}, stock: {}, cloud: {}, cloudNeuf: {}, ecran: {}, valides: {}, mkStock: {}, mkCloud: {} };
    /* Appel direct du propriétaire — y compris des types que seul du code peut produire. */
    const DIRECT = [['0', 0], ['2', 2], ['-Infinity', -Infinity], ['Infinity', Infinity], ['NaN', NaN],
      ['"1e999"', '1e999'], ['""', ''], ['"abc"', 'abc'], ['1.4', 1.4], ['"1.55abc"', '1.55abc'],
      ['"1.5 5"', '1.5 5'], ['null', null], ['undefined', undefined], ['true', true], ['[1.55]', [1.55]],
      ['{}', {}], ['"0x1"', '0x1']];
    /* Un propriétaire ABSENT rend un rouge lisible, jamais un plantage (qui masquerait la suite). */
    const AV = (typeof _activiteValide === 'function') ? _activiteValide : () => 'PROPRIÉTAIRE ABSENT';
    const KV = (typeof _kcalManuelleValide === 'function') ? _kcalManuelleValide : () => 'PROPRIÉTAIRE ABSENT';
    DIRECT.forEach(([k, v]) => { out.direct[k] = AV(v); });
    /* Relu du STOCKAGE (localStorage ne garde que des chaînes). */
    ['0', '2', '-Infinity', 'Infinity', 'NaN', '1e999', '', 'abc', '1.4', '1.55abc', ' ', 'undefined']
      .forEach(v => { out.stock[v] = charger({ ft4_act: v }); });
    /* Reçu du CLOUD, sur un état où 1,375 a été CHOISI : le choix doit rester. */
    const CLOUD = [['0', 0], ['2', 2], ['-Infinity', -Infinity], ['Infinity', Infinity], ['NaN', NaN],
      ['"1e999"', '1e999'], ['""', ''], ['"abc"', 'abc'], ['1.4', 1.4], ['"1.55abc"', '1.55abc'], ['null', null]];
    CLOUD.forEach(([k, v]) => {
      charger({ ft4_act: '1.375' });
      try { _applyRestoreData({ profile: { name: 'Sonde', activityLevel: v } }); } catch (e) {}
      out.cloud[k] = { act: S.activityLevel, tdee: calcTDEE() };
    });
    /* … et sur un appareil NEUF (aucune activité) : rien ne devient 1,55. */
    CLOUD.forEach(([k, v]) => {
      charger({});
      try { _applyRestoreData({ profile: { name: 'Sonde', activityLevel: v } }); } catch (e) {}
      out.cloudNeuf[k] = { act: S.activityLevel, tdee: calcTDEE() };
    });
    /* Les 5 niveaux VALIDES, par les trois portes : acceptés à l'identique. */
    ['1.2', '1.375', '1.55', '1.725', '1.9'].forEach(v => {
      const st = charger({ ft4_act: v }).act;
      charger({});
      try { _applyRestoreData({ profile: { name: 'Sonde', activityLevel: +v } }); } catch (e) {}
      const cl = S.activityLevel;
      out.valides[v] = { st, cl, direct: AV(v) };
    });
    /* Tapé à l'ÉCRAN : une option forgée dans le sélecteur ne passe pas le propriétaire. */
    ['99', 'Infinity', '1e999', '1.4', '1.55abc'].forEach(v => {
      charger({});
      const se = document.getElementById('act-sel');
      const o = document.createElement('option'); o.value = v; o.textContent = 'forgée'; se.appendChild(o);
      se.value = v;
      try { saveProfile(); } catch (e) {}
      out.ecran[v] = { act: S.activityLevel, disque: localStorage.getItem('ft4_act'), tdee: calcTDEE() };
      o.remove();
    });
    /* Calories manuelles : mêmes familles, stockage et cloud. */
    ['Infinity', '-Infinity', 'NaN', '1e999', '0', '799', '6001', '2200abc', ''].forEach(v => {
      out.mkStock[v] = charger({ ft4_act: '1.55', ft4_manualkcal: v });
    });
    [['Infinity', Infinity], ['NaN', NaN], ['"1e999"', '1e999'], ['799', 799], ['6001', 6001], ['"2200abc"', '2200abc']].forEach(([k, v]) => {
      charger({ ft4_act: '1.55' });
      try { _applyRestoreData({ profile: { name: 'Sonde', manualKcal: v } }); } catch (e) {}
      out.mkCloud[k] = { mk: S.manualKcal, cal: calcMacros(S.nutritionPhase).calories };
    });
    out.bornesMk = { m800: KV(800), m6000: KV(6000), s2200: KV('2200') };
    return out;
  });
  const cles = o => Object.keys(o);
  t('B-CCCLXIV ① appel direct : 0, 2, ±Infinity, NaN, "1e999", "", "abc", 1.4, "1.55abc", "1.5 5", null, undefined, true, [1.55], {}, "0x1" → tous refusés',
    cles(E.direct).every(k => E.direct[k] === null),
    cles(E.direct).filter(k => E.direct[k] !== null).map(k => k + '→' + E.direct[k]).join(' ') || 'ok');
  t('B-CCCLXIV ② relu du stockage : les mêmes (+ espace, "undefined") → activité null, AUCUN TDEE, aucun glucide',
    cles(E.stock).every(k => E.stock[k].act === null && E.stock[k].tdee === null && E.stock[k].G === null),
    cles(E.stock).filter(k => E.stock[k].act !== null || E.stock[k].tdee !== null).map(k => JSON.stringify(k) + '→' + E.stock[k].act + '/' + E.stock[k].tdee).join(' ') || 'ok');
  t('B-CCCLXIV ③ reçu du cloud sur un choix 1,375 : tout est refusé, le choix reste, TDEE 2405 inchangé',
    cles(E.cloud).every(k => E.cloud[k].act === 1.375 && E.cloud[k].tdee === 2405),
    cles(E.cloud).filter(k => E.cloud[k].act !== 1.375).map(k => k + '→' + E.cloud[k].act).join(' ') || 'ok');
  t('B-CCCLXIV ④ reçu du cloud sur un appareil NEUF : rien ne devient une activité (ni 1,55, ni autre)',
    cles(E.cloudNeuf).every(k => E.cloudNeuf[k].act === null && E.cloudNeuf[k].tdee === null),
    cles(E.cloudNeuf).filter(k => E.cloudNeuf[k].act !== null).map(k => k + '→' + E.cloudNeuf[k].act).join(' ') || 'ok');
  t('B-CCCLXIV ⑤ les 5 niveaux valides passent À L\'IDENTIQUE par le stockage, le cloud et l\'appel direct',
    cles(E.valides).length === 5 && cles(E.valides).every(v => E.valides[v].st === +v && E.valides[v].cl === +v && E.valides[v].direct === +v),
    JSON.stringify(E.valides));
  t('B-CCCLXIV ⑥ une option FORGÉE dans le sélecteur (99, Infinity, 1e999, 1.4, "1.55abc") n\'est pas enregistrée',
    cles(E.ecran).every(v => E.ecran[v].act === null && E.ecran[v].disque === null && E.ecran[v].tdee === null),
    JSON.stringify(E.ecran));
  t('B-CCCLXIV ⑦ calories relues : ±Infinity, NaN, 1e999, 0, 799, 6001, "2200abc", vide → refusées (calcul auto 3011)',
    cles(E.mkStock).every(v => E.mkStock[v].mk === 0 && E.mkStock[v].cal === 3011),
    cles(E.mkStock).filter(v => E.mkStock[v].mk !== 0).map(v => v + '→' + E.mkStock[v].mk).join(' ') || 'ok');
  t('B-CCCLXIV ⑧ calories reçues du cloud : Infinity, NaN, "1e999", 799, 6001, "2200abc" → refusées',
    cles(E.mkCloud).every(k => E.mkCloud[k].mk === 0 && E.mkCloud[k].cal === 3011),
    cles(E.mkCloud).filter(k => E.mkCloud[k].mk !== 0).map(k => k + '→' + E.mkCloud[k].mk).join(' ') || 'ok');
  t('B-CCCLXIV ⑨ bornes des calories : 800 et 6000 inclus, "2200" accepté',
    E.bornesMk.m800 === 800 && E.bornesMk.m6000 === 6000 && E.bornesMk.s2200 === 2200, JSON.stringify(E.bornesMk));

  /* ══ B-CCCLXV. B1-06 — LES REMISES À ZÉRO (nuit du 24→25/09) ══════════════════════════════
     Tracé : il n'y a PAS de remise à zéro globale en production. Les chemins réels sont :
       ① l'effacement des données du site par le navigateur, puis rechargement ;
       ② `resetOnboardingTest()` (app.js) — réservé au clone (`window.__FT_CLONE__`) : il vide le
          stockage et recharge ; en production il REFUSE ;
       ③ une restauration cloud juste après la remise à zéro ;
       ④ le mode démo des personas (`_vcApplyPersona`, coach.js) : il pose EN MÉMOIRE
          `activityLevel = a.activityLevel||'modéré'` (une CHAÎNE), puis `load()` restaure.
     Attendu partout : l'activité redevient réellement non renseignée, aucun 1,55 par défaut,
     aucun TDEE ni macro fabriqués. */
  console.log('\n-- B-CCCLXV. B1-06 : remises à zéro (navigateur · clone · restauration · personas) --');
  const etat = () => pg.evaluate(async () => {
    goScreen('setup', document.getElementById('nb-setup'));
    await new Promise(r => setTimeout(r, 250));
    const se = document.getElementById('act-sel'), m = calcMacros(S.nutritionPhase);
    return { act: S.activityLevel, disque: localStorage.getItem('ft4_act'), tdee: calcTDEE(), G: m.carbs_g,
             sel: se ? se.value : 'ABSENT', selTxt: se && se.selectedIndex >= 0 ? se.options[se.selectedIndex].text : '' };
  });
  const choisir = async (v) => { await pg.evaluate((v) => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; window.toast = () => {};
    S.activityLevel = +v; persist(); }, v); };
  // ① effacement des données du site (le drapeau de décor est reposé SEUL : profil entièrement vide)
  await choisir('1.725');
  const av1 = await etat();
  await pg.evaluate(() => { localStorage.clear(); localStorage.setItem('_decorAct', '1'); });
  await pg.reload(); await pg.waitForTimeout(2200);
  const ap1 = await etat();
  t('B-CCCLXV ① avant : 1,725 choisi et écrit ; après effacement du site + rechargement : activité null, rien sur le disque, « À choisir », aucun TDEE',
    av1.act === 1.725 && av1.disque === '1.725'
    && ap1.act === null && ap1.disque === null && ap1.tdee === null && ap1.G === null && ap1.sel === '' && ap1.selTxt === 'À choisir',
    JSON.stringify({ av1, ap1 }));
  // ③ restauration cloud juste après la remise à zéro
  const rs = await pg.evaluate(() => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; window.toast = () => {};
    const out = {};
    try { _applyRestoreData({ profile: { name: 'Sonde', bw: 85.9, age: 48, height: 180 } }); } catch (e) {}
    out.sans = { act: S.activityLevel, tdee: calcTDEE() };
    try { _applyRestoreData({ profile: { name: 'Sonde', activityLevel: 'modéré' } }); } catch (e) {}
    out.chaine = { act: S.activityLevel };
    try { _applyRestoreData({ profile: { name: 'Sonde', activityLevel: 1.55 } }); } catch (e) {}
    out.legacy = { act: S.activityLevel, tdee: calcTDEE() };
    return out;
  });
  t('B-CCCLXV ② restauration SANS activité après remise à zéro : rien n\'est inventé (null, aucun TDEE)',
    rs.sans.act === null && rs.sans.tdee === null, JSON.stringify(rs.sans));
  t('B-CCCLXV ③ restauration d\'une chaîne « modéré » : refusée (reste null)',
    rs.chaine.act === null, JSON.stringify(rs.chaine));
  t('B-CCCLXV ④ ⚠️ D-021 : un cloud qui porte 1,55 le ramène (valeur valide, provenance inconnue) — figé, NON tranché',
    rs.legacy.act === 1.55 && rs.legacy.tdee === 2711, JSON.stringify(rs.legacy));
  // ② resetOnboardingTest : refus en production, remise à zéro réelle dans le clone
  await choisir('1.725');
  const prod = await pg.evaluate(() => {
    window.__FT_CLONE__ = false; let appele = false; const sc = window.showConfirm;
    window.showConfirm = () => { appele = true; };
    try { resetOnboardingTest(); } catch (e) {}
    window.showConfirm = sc;
    return { appele, act: S.activityLevel, disque: localStorage.getItem('ft4_act') };
  });
  t('B-CCCLXV ⑤ en production, `resetOnboardingTest` refuse : le choix 1,725 reste intact',
    prod.appele === false && prod.act === 1.725 && prod.disque === '1.725', JSON.stringify(prod));
  await Promise.all([
    pg.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    pg.evaluate(() => {
      window.__FT_CLONE__ = true;
      window.showConfirm = (a, b2, fn) => { setTimeout(fn, 0); };
      resetOnboardingTest();
    }).catch(() => {}),
  ]);
  await pg.waitForTimeout(2200);
  /* Le vidage efface aussi le drapeau de décor : la fixture repose le profil de base (SANS
     activité) — c'est l'équivalent d'une nouvelle inscription qui saisit poids/taille/âge. */
  const ap2 = await etat();
  t('B-CCCLXV ⑥ `resetOnboardingTest` (clone) : après vidage + rechargement, activité null, « À choisir », aucun TDEE',
    ap2.act === null && ap2.disque === null && ap2.tdee === null && ap2.sel === '' && ap2.selTxt === 'À choisir',
    JSON.stringify(ap2));
  // ④ mode démo des personas : en mémoire seulement, puis `load()` restaure le vrai choix
  await choisir('1.375');
  const demo = await pg.evaluate(() => {
    const k = Object.keys(VC_PERSONAS)[0];
    _vcApplyPersona(VC_PERSONAS[k]);
    const pendant = { act: S.activityLevel, valide: (typeof _activiteValide === 'function') ? _activiteValide(S.activityLevel) : 'PROPRIÉTAIRE ABSENT', tdee: calcTDEE(),
                      disque: localStorage.getItem('ft4_act') };
    load();
    return { persona: k, pendant, apres: { act: S.activityLevel, tdee: calcTDEE() } };
  });
  t('B-CCCLXV ⑦ persona de démo : la chaîne « modéré » n\'est pas une activité (TDEE null, pas NaN), le disque garde 1,375',
    demo.pendant.valide === null && demo.pendant.tdee === null && demo.pendant.disque === '1.375',
    JSON.stringify(demo.pendant));
  t('B-CCCLXV ⑧ … et `load()` restaure le vrai choix après la démo (1,375)',
    demo.apres.act === 1.375 && Number.isFinite(demo.apres.tdee), JSON.stringify(demo.apres));

  /* ══ B-CCCLXVI. LA SAISIE DES CALORIES À LA MAIN, CONDUITE (nuit du 24→25/09) ══════════════
     ⛔⛔ TROUVÉ PAR L'INVESTIGATION DE NUIT, PAS PAR UN TÉMOIN — et c'est pour ça que ce bloc existe :
     en 20eac697, mon commentaire `// B2 : …` a AVALÉ la fin de la ligne de `saveKcalEdit`
     (`persist();closeKcalEdit();renderNutrition();`). Le toast disait « Objectif réglé ✅ »,
     rien n'était écrit sur le disque, la fenêtre restait ouverte. AUCUN témoin n'appelait
     `saveKcalEdit` : on ne teste une porte qu'en la franchissant, pas en lisant la règle derrière. */
  console.log('\n-- B-CCCLXVI. Calories à la main : la VRAIE saisie (fenêtre, bouton, disque, rechargement) --');
  await pg.evaluate(() => { localStorage.clear(); localStorage.setItem('_decorAct', '1');
    const D = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau', ft4_act: '1.55',
                ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' };
    Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); });
  await pg.reload(); await pg.waitForTimeout(2200);
  const K = await pg.evaluate(async () => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    const toasts = []; window.toast = (m, k) => toasts.push((k || '') + ':' + m);
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 250));
    const ov = () => { const o = document.getElementById('ov-kcal-edit'); return !!(o && o.classList.contains('open')); };
    const saisir = (v) => { openKcalEdit(); const i = document.getElementById('kcal-edit-inp'); i.value = v;
      i.dispatchEvent(new Event('input', { bubbles: true })); const avant = ov(); saveKcalEdit();
      return { ouverteAvant: avant, ouverteApres: ov(), mk: S.manualKcal, disque: localStorage.getItem('ft4_manualkcal'),
               cal: calcMacros(S.nutritionPhase).calories, toast: toasts[toasts.length - 1] || '' }; };
    const out = {};
    out.v2200 = saisir('2200');
    out.v9000 = saisir('9000');
    out.vabc = saisir('abc');
    out.v1800 = saisir('1 800'.replace(' ', ''));
    return out;
  });
  t('B-CCCLXVI ① saisir 2200 : écrit en mémoire ET sur le disque, fenêtre refermée, cible 2200',
    K.v2200.ouverteAvant === true && K.v2200.ouverteApres === false && K.v2200.mk === 2200 && K.v2200.disque === '2200' && K.v2200.cal === 2200,
    JSON.stringify(K.v2200));
  t('B-CCCLXVI ② saisir 9000 : l\'écran RAMÈNE à 6000 et le DIT (toast), écrit sur le disque',
    K.v9000.mk === 6000 && K.v9000.disque === '6000' && /6\s?000/.test(K.v9000.toast) && K.v9000.ouverteApres === false,
    JSON.stringify(K.v9000));
  t('B-CCCLXVI ③ saisir « abc » : refusé avec un message, rien ne change (6000 reste), fenêtre ouverte',
    K.vabc.mk === 6000 && K.vabc.disque === '6000' && /valide/.test(K.vabc.toast) && K.vabc.ouverteApres === true,
    JSON.stringify(K.vabc));
  await pg.reload(); await pg.waitForTimeout(2200);
  const K2 = await pg.evaluate(() => ({ mk: S.manualKcal, cal: calcMacros(S.nutritionPhase).calories }));
  t('B-CCCLXVI ④ après rechargement : la dernière saisie (1800) est relue — la cible manuelle SURVIT',
    K.v1800.disque === '1800' && K2.mk === 1800 && K2.cal === 1800, JSON.stringify({ saisie: K.v1800, relu: K2 }));

  /* ══ B-CCCLXVII. L'ONGLET NUTRITION SANS ACTIVITÉ CHOISIE SE DESSINE EN ENTIER (nuit du 24→25/09) ══
     ⛔⛔ TROUVÉ PAR LA CONTRE-VÉRIFICATION (agent critique), PAS PAR UN TÉMOIN : `renderNutrition`
     faisait `'TDEE '+tdee.toLocaleString(…)` avec `tdee = null` → exception RATTRAPÉE en silence
     (`console.error`, jamais vue par un écouteur `pageerror`) → tout ce qui suit n'était pas dessiné
     (macros, anneaux, cycle, hydratation, plan). Latent depuis ft-v1232 pour les profils incomplets ;
     B1 l'étend à TOUT compte sans activité choisie. Avec une cible MANUELLE, les calories
     s'affichaient mais protéines et glucides restaient « — » alors que `calcMacros` les calcule.
     👉 On écoute donc `console.error` ICI, pas seulement `pageerror`. */
  console.log('\n-- B-CCCLXVII. Nutrition sans activité choisie : l\'onglet se dessine en entier (console.error écouté) --');
  const rendre = async (extra) => {
    await pg.evaluate((extra) => { localStorage.clear(); localStorage.setItem('_decorAct', '1');
      const D = Object.assign({ ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau',
                  ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' }, extra);
      Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); }, extra);
    await pg.reload(); await pg.waitForTimeout(2200);
    return pg.evaluate(async () => {
      window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
      const erreurs = []; const ce = console.error;
      console.error = (...a) => { erreurs.push(a.map(String).join(' ').slice(0, 160)); ce.apply(console, a); };
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
      await new Promise(r => setTimeout(r, 300));
      try { renderNutrition(); } catch (e) { erreurs.push('LEVÉE : ' + e.message); }
      console.error = ce;
      const v = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
      return { erreurs: erreurs.filter(x => /renderNutrition|TypeError|LEVÉE/.test(x)),
               kcal: v('m-kcal'), P: v('m-prot'), G: v('m-carbs'), L: v('m-fat'), sub: v('nu-acc-calc-sub') };
    });
  };
  const sansAct = await rendre({});
  const manuel = await rendre({ ft4_manualkcal: '2500' });
  const avecAct = await rendre({ ft4_act: '1.55' });
  t('B-CCCLXVII ① sans activité, sans cible manuelle : AUCUNE erreur de rendu, macros « — »',
    sansAct.erreurs.length === 0 && sansAct.P === '—' && sansAct.G === '—', JSON.stringify(sansAct));
  t('B-CCCLXVII ② sans activité, 2500 kcal à la main : aucune erreur, et les macros calculées S\'AFFICHENT (P 172 · L 86 · G 260 = (2500 − 4×172 − 9×86)/4)',
    manuel.erreurs.length === 0 && manuel.P === '172' && manuel.L === '86' && manuel.G === '260',
    JSON.stringify(manuel));
  t('B-CCCLXVII ③ le sous-titre de l\'accordéon dit « TDEE — » au lieu de planter',
    /TDEE —/.test(manuel.sub || '') && /TDEE —/.test(sansAct.sub || ''), JSON.stringify([sansAct.sub, manuel.sub]));
  t('B-CCCLXVII ④ contrôle : activité 1,55 choisie → rendu complet, TDEE 2 711 dans le sous-titre, 172 · 86 · 387',
    avecAct.erreurs.length === 0 && avecAct.P === '172' && avecAct.G === '387' && /TDEE 2\s?711/.test(avecAct.sub || ''),
    JSON.stringify(avecAct));
  t('B-CCCLXIII ∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
