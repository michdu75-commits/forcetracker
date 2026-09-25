/* ══════════════════════════════════════════════════════════════════════════════════════
   🧾 D-021 — LES ANCIENS 1,55 À CONFIRMER, ET CE QUE MILO EN REÇOIT (R34) — 25/09/2026

   Décision de Michel : un ancien `activityLevel = 1.55` sans provenance ne doit être NI tenu
   pour un choix de la personne, NI effacé → on DEMANDE UNE FOIS (Confirmer / Modifier).
   ⭐ Le mécanisme : une provenance `activitySrc` ('choisi' ou rien), un seul propriétaire de
   l'état (`etatActivite()` : absent · choisi · a_confirmer · herite), un seul écrivain d'un
   choix (`choisirActivite`), et la règle « la provenance ne survit jamais à sa valeur ».
   ⛔ Aucune règle nutritionnelle ne bouge : un 1,55 à confirmer reste CALCULABLE (mêmes
   chiffres), il est seulement DIT comme tel — à l'écran et à Milo.
   ⛔ 0 appel Milo réel : R34 se vérifie sur le CONTEXTE construit (`buildCoachContext`).
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const CO = lire('Code.js'), SE = lire('setup.js');
  console.log('\n═══ B-CCCLXVIII. D-021 — la provenance traverse le serveur et la restauration ═══');
  t('B-CCCLXVIII ① le serveur garde `activitySrc` dans sa liste blanche (sinon jeté en silence), filtré sur « choisi »',
    /if\(body\.activitySrc!==undefined\)profile\.activitySrc=_ps_\(body\.activitySrc==='choisi'\?'choisi':'',profile\.activitySrc\);/.test(CO),
    'ligne de liste blanche absente ou modifiée');
  t('B-CCCLXVIII ② la sauvegarde cloud envoie la provenance',
    /activityLevel:S\.activityLevel,activitySrc:S\.activitySrc\|\|''/.test(SE), 'charge utile sans activitySrc');
};

module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-20T12:00:00';
  const BASE = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau',
                 ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1' };
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  /* Décor posé UNE fois : un ANCIEN profil, 1,55 stocké, AUCUNE provenance (l'état de tous les comptes d'avant B1). */
  await pg.addInitScript(`(()=>{try{ if(localStorage.getItem('_decorD21')==='1')return;
    localStorage.clear();localStorage.setItem('_decorD21','1');
    const D=${JSON.stringify(Object.assign({}, BASE, { ft4_act: '1.55' }))}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);
  const outiller = () => pg.evaluate(() => {
    /* Un propriétaire ABSENT (code d'avant D-021) rend un rouge lisible, jamais un plantage. */
    if (typeof etatActivite !== 'function') window.etatActivite = () => 'PROPRIÉTAIRE ABSENT';
    if (typeof confirmerActivite !== 'function') window.confirmerActivite = () => false;
    window.__sync = []; window._cloudSync = () => { window.__sync.push(1); }; window._cloudSyncDebounced = () => { window.__sync.push(1); };
    window.toast = () => {};
    window.__ctx = () => String(buildCoachContext());
    window.__ligneAct = () => ((window.__ctx().match(/Niveau activité sportive: [^|]*/) || [''])[0]).trim();
    /* La pop-up « Quoi de neuf » s'ouvre au démarrage d'un profil de test : on la ferme comme la personne
       le ferait, pour que le VRAI clic (page.click) atteigne la carte. */
    window.__nutri = async () => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); await new Promise(r => setTimeout(r, 300)); };
  });
  await outiller();

  console.log('\n-- B-CCCLXIX. D-021 conduit : ancien 1,55 → à confirmer · Confirmer · Modifier · abandon · cloud --');
  // ① ancien 1,55 sans provenance
  const A = await pg.evaluate(async () => {
    await __nutri();
    const c = document.getElementById('nu-act-confirm');
    const r = { etat: etatActivite(), act: S.activityLevel, src: S.activitySrc, tdee: calcTDEE(),
                carte: c ? c.textContent : '', bOk: !!document.getElementById('act-confirm-ok'), bMod: !!document.getElementById('act-confirm-mod'),
                ligne: __ligneAct() };
    goScreen('setup', document.getElementById('nb-setup')); await new Promise(r2 => setTimeout(r2, 250));
    const h = document.getElementById('act-src-hint'); r.hint = !!(h && h.style.display !== 'none'); r.sel = document.getElementById('act-sel').value;
    saveProfile();   // « Enregistrer » pour AUTRE CHOSE, sélecteur non touché
    r.apresSave = { etat: etatActivite(), src: S.activitySrc, disqueSrc: localStorage.getItem('ft4_act_src') };
    return r;
  });
  t('B-CCCLXIX ① ancien 1,55 sans provenance → « à confirmer » (ni choisi, ni effacé), valeur 1,55 gardée, TDEE 2711 calculé',
    A.etat === 'a_confirmer' && A.act === 1.55 && A.src === null && A.tdee === 2711, JSON.stringify(A));
  t('B-CCCLXIX ② l\'onglet Nutrition DEMANDE : « Modéré (3-4j) » + Confirmer + Modifier',
    /Modéré \(3-4j\)/.test(A.carte) && A.bOk && A.bMod, A.carte.slice(0, 120));
  t('B-CCCLXIX ③ le Profil le DIT sous le sélecteur (1,55 prérempli, « À confirmer »)',
    A.hint === true && A.sel === '1.55', JSON.stringify({ hint: A.hint, sel: A.sel }));
  t('B-CCCLXIX ④ « Enregistrer » le Profil sans toucher au sélecteur ne transforme PAS l\'ambiguïté en choix',
    A.apresSave.etat === 'a_confirmer' && A.apresSave.src === null && A.apresSave.disqueSrc === null, JSON.stringify(A.apresSave));
  // ⑤ abandon : rechargement sans répondre
  await pg.reload(); await pg.waitForTimeout(2200); await outiller();
  const Ab = await pg.evaluate(async () => { await __nutri(); return { etat: etatActivite(), carte: !!document.getElementById('act-confirm-ok') }; });
  t('B-CCCLXIX ⑤ fermer sans répondre (rechargement) : toujours « à confirmer », la carte revient',
    Ab.etat === 'a_confirmer' && Ab.carte === true, JSON.stringify(Ab));
  // ⑥ Confirmer (vrai clic)
  if (await pg.$('#act-confirm-ok')) await pg.click('#act-confirm-ok');   // bouton absent (code d'avant) → rouge lisible, pas de plantage
  await pg.waitForTimeout(300);
  const C = await pg.evaluate(() => ({ etat: etatActivite(), act: S.activityLevel, src: S.activitySrc, disque: localStorage.getItem('ft4_act'),
    disqueSrc: localStorage.getItem('ft4_act_src'), tdee: calcTDEE(), carte: !!document.getElementById('act-confirm-ok'), sync: window.__sync.length,
    ligne: __ligneAct() }));
  t('B-CCCLXIX ⑥ « Confirmer » : 1,55 EXACT gardé, provenance « choisi » en mémoire ET sur le disque, synchro demandée, carte partie, TDEE 2711',
    C.etat === 'choisi' && C.act === 1.55 && C.src === 'choisi' && C.disque === '1.55' && C.disqueSrc === 'choisi'
    && C.sync > 0 && C.carte === false && C.tdee === 2711, JSON.stringify(C));
  await pg.reload(); await pg.waitForTimeout(2200); await outiller();
  const C2 = await pg.evaluate(async () => { await __nutri(); return { etat: etatActivite(), carte: !!document.getElementById('act-confirm-ok') }; });
  t('B-CCCLXIX ⑦ après rechargement : la confirmation TIENT, on ne redemande plus',
    C2.etat === 'choisi' && C2.carte === false, JSON.stringify(C2));

  // ⑧ → ⑨ Modifier
  const poser = (o) => pg.evaluate((o) => { localStorage.clear(); localStorage.setItem('_decorD21', '1');
    Object.keys(o).forEach(k => localStorage.setItem(k, o[k])); }, o);
  await poser(Object.assign({}, BASE, { ft4_act: '1.55' }));
  await pg.reload(); await pg.waitForTimeout(2200); await outiller();
  await pg.evaluate(async () => { await __nutri(); });
  if (await pg.$('#act-confirm-mod')) await pg.click('#act-confirm-mod');   // bouton absent (code d'avant) → rouge lisible, pas de plantage
  await pg.waitForTimeout(600);
  const M = await pg.evaluate(() => ({ ecran: (document.querySelector('.screen.active') || {}).id || '', focus: (document.activeElement || {}).id || '',
    etat: etatActivite(), src: S.activitySrc }));
  t('B-CCCLXIX ⑧ « Modifier » emmène au vrai choix (Profil, sélecteur d\'activité) SANS rien confirmer',
    M.ecran === 's-setup' && M.focus === 'act-sel' && M.etat === 'a_confirmer' && M.src === null, JSON.stringify(M));
  const M2 = await pg.evaluate(() => {
    const se = document.getElementById('act-sel'); se.value = '1.725'; se.dispatchEvent(new Event('change', { bubbles: true }));
    saveProfile();
    return { etat: etatActivite(), act: S.activityLevel, src: S.activitySrc, disque: localStorage.getItem('ft4_act'), disqueSrc: localStorage.getItem('ft4_act_src'), tdee: calcTDEE() };
  });
  t('B-CCCLXIX ⑨ … puis choisir 1,725 et enregistrer : valeur + provenance écrites, TDEE 3017',
    M2.etat === 'choisi' && M2.act === 1.725 && M2.src === 'choisi' && M2.disque === '1.725' && M2.disqueSrc === 'choisi' && M2.tdee === 3017,
    JSON.stringify(M2));

  // ⑩ → ⑯ états et cloud
  const R = await pg.evaluate(() => {
    const BASEP = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau', ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', _decorD21: '1' };
    const charger = (o) => { localStorage.clear(); const D = Object.assign({}, BASEP, o || {});
      Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); load(); };
    const rs = (prof) => { try { _applyRestoreData({ profile: Object.assign({ name: 'Sonde' }, prof) }); } catch (e) {} };
    const et = () => ({ etat: etatActivite(), act: S.activityLevel, src: S.activitySrc });
    const out = {};
    charger({ ft4_act: '1.725' }); out.herite = Object.assign(et(), { tdee: calcTDEE(), ecart: typeof ecartNiveauActivite });
    charger({}); out.absent = et();
    charger({ ft4_act: '99', ft4_act_src: 'choisi' }); out.invalide = Object.assign(et(), { disqueSrc: (persist(), localStorage.getItem('ft4_act_src')) });
    charger({ ft4_act: '1.55', ft4_act_src: 'oui' }); out.srcBidon = et();
    charger({ ft4_act: '1.55' }); rs({ activityLevel: 1.55 }); out.ambAmb = et();
    charger({ ft4_act: '1.55', ft4_act_src: 'choisi' }); rs({ activityLevel: 1.55 }); out.choisiVsVieux = et();
    charger({}); rs({ activityLevel: 1.55, activitySrc: 'choisi' }); out.appareilB = et();
    charger({ ft4_act: '1.725', ft4_act_src: 'choisi' }); rs({ activityLevel: 1.55 }); out.valeurChange = et();
    charger({ ft4_act: '1.55' }); rs({ activityLevel: 1.2, activitySrc: 'choisi' }); out.nouveauChoix = et();
    charger({ ft4_act: '1.55' }); rs({ activityLevel: 1.55, activitySrc: 'choisi' }); out.confirmeAilleurs = et();
    charger({ ft4_act: '1.55' }); rs({ activityLevel: 1.55, activitySrc: 'oui' }); out.cloudBidon = et();
    charger({ ft4_act: '1.55' }); rs({ activitySrc: 'choisi' }); out.srcSansValeur = et();
    /* la provenance ne survit pas à sa valeur, même en mémoire → disque */
    charger({ ft4_act: '1.55', ft4_act_src: 'choisi' }); S.activityLevel = null; persist(); out.srcOrpheline = localStorage.getItem('ft4_act_src');
    return out;
  });
  t('B-CCCLXIX ⑩ un AUTRE ancien niveau (1,725) sans provenance : « hérité », utilisé comme avant, pas de carte, jamais écrit « choisi »',
    R.herite.etat === 'herite' && R.herite.act === 1.725 && R.herite.src === null && R.herite.tdee === 3017, JSON.stringify(R.herite));
  t('B-CCCLXIX ⑪ sans niveau : « absent » (B1) · niveau invalide + « choisi » stocké : rejeté (B2) et la provenance orpheline s\'efface',
    R.absent.etat === 'absent' && R.invalide.etat === 'absent' && R.invalide.src === null && R.invalide.disqueSrc === null,
    JSON.stringify([R.absent, R.invalide]));
  t('B-CCCLXIX ⑫ une provenance stockée autre que « choisi » est ignorée (reste « à confirmer »)',
    R.srcBidon.etat === 'a_confirmer' && R.srcBidon.src === null, JSON.stringify(R.srcBidon));
  t('B-CCCLXIX ⑬ cloud : local ambigu + cloud 1,55 ancien → reste ambigu',
    R.ambAmb.etat === 'a_confirmer', JSON.stringify(R.ambAmb));
  t('B-CCCLXIX ⑭ cloud : confirmé ici + vieux cloud 1,55 sans provenance → la confirmation n\'est PAS perdue',
    R.choisiVsVieux.etat === 'choisi' && R.choisiVsVieux.act === 1.55, JSON.stringify(R.choisiVsVieux));
  t('B-CCCLXIX ⑮ cloud : confirmé sur l\'appareil A → l\'appareil B (neuf) récupère valeur ET provenance',
    R.appareilB.etat === 'choisi' && R.appareilB.act === 1.55, JSON.stringify(R.appareilB));
  t('B-CCCLXIX ⑯ cloud : la valeur change (1,725 choisi → vieux 1,55) → la provenance NE SURVIT PAS à l\'ancienne valeur (à confirmer)',
    R.valeurChange.etat === 'a_confirmer' && R.valeurChange.act === 1.55 && R.valeurChange.src === null, JSON.stringify(R.valeurChange));
  t('B-CCCLXIX ⑰ cloud : un choix explicite (1,2 « choisi ») écrase proprement l\'ancien 1,55 ambigu',
    R.nouveauChoix.etat === 'choisi' && R.nouveauChoix.act === 1.2, JSON.stringify(R.nouveauChoix));
  t('B-CCCLXIX ⑱ cloud : 1,55 confirmé sur un autre appareil → confirmé ici aussi ; provenance bidon ou sans valeur → ignorée',
    R.confirmeAilleurs.etat === 'choisi' && R.cloudBidon.etat === 'a_confirmer' && R.srcSansValeur.etat === 'a_confirmer',
    JSON.stringify([R.confirmeAilleurs, R.cloudBidon, R.srcSansValeur]));
  t('B-CCCLXIX ⑲ niveau retiré en mémoire → `persist()` efface aussi la provenance du disque',
    R.srcOrpheline === null, String(R.srcOrpheline));

  /* ══ B-CCCLXX. R34 — CE QUE MILO REÇOIT, par état (contexte construit, 0 appel réel) ══ */
  console.log('\n-- B-CCCLXX. R34 : la ligne « Niveau activité » du contexte de Milo, dans les 5 cas (+ hérité) --');
  const L = await pg.evaluate(() => {
    const BASEP = { ft4_bw: '85.9', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_work: 'bureau', ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', _decorD21: '1' };
    const lire = (o) => { localStorage.clear(); const D = Object.assign({}, BASEP, o || {}); Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); load();
      const c = String(buildCoachContext()); return { ligne: ((c.match(/Niveau activité sportive: [^|]*/) || [''])[0]).trim(), tdee: ((c.match(/TDEE: [^ |\n]*/) || [''])[0]),
        plein: (c.split('\n').find(l => l.indexOf('Niveau activité sportive:') >= 0) || ''),
        bmr: ((c.match(/BMR: [^|\n]*/) || [''])[0]) }; };
    const out = {};
    out.A = lire({});
    out.B = lire({ ft4_act: '1.55', ft4_act_src: 'choisi' });
    out.C = lire({ ft4_act: '1.725', ft4_act_src: 'choisi' });
    out.D = lire({ ft4_act: '1.55' });
    lire({ ft4_act: '1.55' }); window._cloudSync = () => {}; window._cloudSyncDebounced = () => {}; confirmerActivite();
    const c = String(buildCoachContext()); out.E = { ligne: ((c.match(/Niveau activité sportive: [^|]*/) || [''])[0]).trim(), tdee: ((c.match(/TDEE: [^ |\n]*/) || [''])[0]) };
    out.H = lire({ ft4_act: '1.2' });
    return out;
  });
  /* ⚠️ Égalité stricte remplacée le 25/09 (D-022) : la ligne porte désormais la consigne « demander,
     ne pas chiffrer ». Le préfixe reste EXACT ; la consigne est éprouvée en B-CCCLXXI. */
  t('B-CCCLXX A activité absente → « NON RENSEIGNÉ (besoins caloriques non calculés) … », TDEE « — »',
    L.A.ligne.startsWith('Niveau activité sportive: NON RENSEIGNÉ (besoins caloriques non calculés) — ') && /TDEE: —/.test(L.A.tdee), JSON.stringify(L.A));
  t('B-CCCLXX B 1,55 choisi → « 1.55 — Modéré (3-4j), choisi par la personne », TDEE 2711',
    L.B.ligne === 'Niveau activité sportive: 1.55 — Modéré (3-4j), choisi par la personne' && /2711/.test(L.B.tdee), JSON.stringify(L.B));
  t('B-CCCLXX C 1,725 choisi → la valeur EXACTE « 1.725 — Actif (5-6j), choisi par la personne »',
    L.C.ligne === 'Niveau activité sportive: 1.725 — Actif (5-6j), choisi par la personne', JSON.stringify(L.C));
  t('B-CCCLXX D ancien 1,55 non confirmé → « À CONFIRMER », et JAMAIS « choisi par la personne »',
    /^Niveau activité sportive: 1\.55 — Modéré \(3-4j\), À CONFIRMER/.test(L.D.ligne) && !/choisi par la personne/.test(L.D.ligne)
    && /ne le présente PAS comme un choix/.test(L.D.ligne), JSON.stringify(L.D));
  t('B-CCCLXX E après confirmation du 1,55 → exactement la ligne du cas B',
    L.E.ligne === L.B.ligne && L.E.tdee === L.B.tdee, JSON.stringify(L.E));
  t('B-CCCLXX F ancien 1,2 sans provenance → « réglage ancien (provenance non enregistrée) », jamais « choisi »',
    L.H.ligne === 'Niveau activité sportive: 1.2 — Sédentaire, réglage ancien (provenance non enregistrée)', JSON.stringify(L.H));
  t('B-CCCLXX ∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));

  /* ══ B-CCCLXXI. R34-A (D-022, Michel 25/09) — ACTIVITÉ ABSENTE : MILO DEMANDE, IL N'INVENTE PAS ══
     Banc réel du 25/09 : avec le seul constat « NON RENSEIGNÉ », Milo chiffrait « disons 3 séances →
     TDEE 2 300–2 500 ». Ces témoins lisent la ligne RÉELLEMENT construite (pas un commentaire). */
  console.log('\n-- B-CCCLXXI. R34-A : la consigne « demander avant de chiffrer », et SEULEMENT sans activité --');
  const CONSIGNE = /AUCUN chiffre calorique qui dépendrait de lui/;
  const a1 = L.A.ligne;
  t('B-CCCLXXI A1 activité absente → consigne explicite : aucun TDEE ni cible chiffrés', CONSIGNE.test(a1) && /ni dépense \(TDEE\), ni cible/.test(a1), a1);
  t('B-CCCLXXI A1 … ni fourchette, ni calcul « par hypothèse » (pas de « disons 3 séances »)',
    /ni fourchette/.test(a1) && /par hypothèse/.test(a1) && /disons 3 séances/.test(a1), a1);
  /* ══ D-024 (25/09) : le micro-banc réel a sorti « l'écart peut dépasser 500 kcal » — un chiffre qui
     dépend de l'activité inconnue sans être un TDEE ni une cible. Ces témoins ferment cette fuite. */
  t('B-CCCLXXII D-024 … ni ORDRE DE GRANDEUR, ni ÉCART/DELTA en kcal, ni exemple chiffré (le cas « 500 kcal » est nommé)',
    /ni ordre de grandeur/.test(a1) && /ni écart ou delta en kcal/.test(a1) && /l'écart peut dépasser 500 kcal/.test(a1) && /ni exemple chiffré/.test(a1), a1);
  t('B-CCCLXXII D-024 … ni ESTIMATION INDIRECTE : multiplicateur/pourcentage du BMR, kcal par séance, grammes de macros déduits',
    /ni estimation indirecte/.test(a1) && /multiplicateur ou de pourcentage appliqué au BMR/.test(a1) && /kcal brûlées par séance/.test(a1) && /grammes de glucides ou de macros/.test(a1), a1);
  t('B-CCCLXXII D-024 … Milo reste QUALITATIF',
    /Reste QUALITATIF/.test(a1) && /ses besoins en dépendent fortement/.test(a1), a1);
  t('B-CCCLXXII D-024 … mais le BMR et les données indépendantes de l\'activité restent AUTORISÉS, avec la précision « ni dépense ni cible »',
    /Tu peux citer ce qui n'en dépend pas \(BMR, poids, taille, âge\)/.test(a1) && /le BMR n'est ni sa dépense quotidienne ni une cible/.test(a1), a1);
  t('B-CCCLXXII D-024 … et le contexte continue de FOURNIR le BMR chiffré (la consigne ne vide pas les données)',
    /BMR: \d{3,4} kcal/.test(L.A.bmr || ''), L.A.bmr);
  t('B-CCCLXXI A1 … et DEMANDER la donnée avant de calculer',
    /demande-lui combien de séances/.test(a1) && /le calcul viendra après sa réponse/.test(a1), a1);
  t('B-CCCLXXI A1 … exception NOMMÉE aux règles qui poussaient à chiffrer (propose d\'abord, fourchettes, fréquence)',
    /Exception explicite/.test(a1) && /propose d'abord/.test(a1) && /FOURCHETTES/.test(a1) && /fréquence/.test(a1), a1);
  t('B-CCCLXXI A1 … la consigne va jusqu\'au bout AVANT « | Type travail » (un « | » dans son texte la couperait)',
    L.A.plein === '- ' + a1 + ' | Type travail: Bureau/Sédentaire (+0 kcal NEAT)' && /fréquence$/.test(a1), L.A.plein);
  t('B-CCCLXXI A2 1,55 CHOISI → aucune consigne « ne chiffre pas » (les chiffres calculés restent explicables)',
    !CONSIGNE.test(L.B.ligne) && /2711/.test(L.B.tdee), JSON.stringify(L.B));
  t('B-CCCLXXI A3 ancien 1,55 non confirmé → ambiguïté D-021 conservée, pas de consigne « ne chiffre pas »',
    /À CONFIRMER/.test(L.D.ligne) && !CONSIGNE.test(L.D.ligne), JSON.stringify(L.D));
  t('B-CCCLXXI A4 ancien 1,55 CONFIRMÉ → identique à un vrai choix, sans consigne',
    L.E.ligne === L.B.ligne && !CONSIGNE.test(L.E.ligne), JSON.stringify(L.E));
  t('B-CCCLXXI A5 1,725 choisi et ancien 1,2 hérité → pas de consigne non plus',
    !CONSIGNE.test(L.C.ligne) && !CONSIGNE.test(L.H.ligne), JSON.stringify([L.C.ligne, L.H.ligne]));
  await cx.close();
};
