/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ NUT-PUNCH-01 — COUP DE POING NUTRITION (03/10/2026, session-B, feu vert de Michel)
   Blocs B-NP01-A (contrat Séance → Nutrition) → B-NP01-F (« Ce qu'il te reste »).

   ⛔ Les valeurs attendues sont MESURÉES sur le code (master ad172a87 pour ce qui ne doit pas
   bouger), jamais choisies. Profils SYNTHÉTIQUES, aucune donnée réelle de qui que ce soit.
   ⛔ 0 appel réseau hors localhost : tout est coupé ET compté (preuve écrite dans les témoins).
   Contrôle négatif : `tools/mut_nut_punch01.py` (mutations DANS UNE COPIE, jamais dans le dépôt).

   ── B-NP01-A — LE CONTRAT SÉANCE → NUTRITION (le « LOT 0 » de la contre-vérification) ──
   CE QU'IL PROTÈGE (conduit dans Chromium, vrais `startWorkout` / `toggleSet` / `finishWorkout`,
   vrai rechargement) : la date LOCALE, `ts`, `startHour`, les noms d'exercices, `sets[].done`,
   les codes de série actuels (N / É / X), `cardioAvant` / `cardio`, `duration`,
   `importedHistory`, `S.wkt`, `S.nextPlanned`, l'ordre des séances, la persistance, le
   rechargement, aucune perte, aucun appel réseau.
   ⭐ ET SES CONTRÔLES NÉGATIFS : changer SEULEMENT la durée, le volume, la méthode (superset,
   dropset), la discipline ou le niveau ne change PAS la cible calorique.
   ⚠️ CE QU'IL NE JUGE PAS — cinq comportements DOUTEUX, imprimés comme OBSERVATIONS NOMMÉES,
   jamais rouges (ce ne sont pas des invariants : décision de la contre-vérification) :
   la dernière séance du jour gagne · 2 séances = 2 événements · un bloc abdos séparé ·
   un cardio seul · une annonce honorée par n'importe quelle séance.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const _corps = (src, nom) => {
  let i = src.indexOf('function ' + nom + '(');
  if (i < 0) i = src.indexOf('function' + nom + '(');          // source déjà sans espaces
  if (i < 0) return '';
  let d = 0;
  for (let k = src.indexOf('{', i); k > 0 && k < src.length; k++) {
    if (src[k] === '{') d++; else if (src[k] === '}' && !--d) return src.slice(i, k + 1);
  }
  return src.slice(i);
};

/* Aides évaluées DANS la page. Profil synthétique ; séances fabriquées avec les champs que
   `finishWorkout` écrit (log.js), et rien d'autre. */
const PAGE = `window.__np=(function(){
  const EXS={
    jambes:['Squat à la Barre','Press Jambes 45°','Leg Curl Couché Machine','Extension Quadriceps (Leg Extension)'],
    haut:['Développé Couché','Développé Couché Haltères','Dips Triceps (Buste Droit)','Extension Triceps'],
    dos:['Rowing Barre (Tirage Horizontal)','Curl Barre','Curl Haltères'],
    full:['Squat à la Barre','Développé Couché','Rowing Barre (Tirage Horizontal)','Press Jambes 45°'],
    abdos:['Crunch','Gainage','Planche Latérale (Side Plank)'],
    bras:['Curl Barre','Curl Haltères','Triceps Poulie','Extension Triceps']
  };
  const pad=n=>String(n).padStart(2,'0');
  const jour=dec=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+dec);
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
  function base(o){
    o=o||{};
    S.bw=o.bw||80; S.height=180; S.age=35; S.gender=o.gender||'H';
    S.activityLevel=o.act||1.55; S.activitySrc='choisi';
    S.goal=o.goal||'muscle'; S.workType='bureau'; S.nutritionPhase='charge';
    S.foodMode=o.foodMode||''; S.keto=false; S.fasting=o.fasting||''; S.manualKcal=null; S.smoker=false;
    S.coachQuiz={answers:Object.assign({},o.quiz||{}),done:true};
    S.sessions=[]; S.healthDaily=[]; S.weightLog=[]; S.bodyScans=[]; S.nextPlanned=null; S.wkt=null;
    S.mensCycleStart=null; S.contraception=''; S.prs={}; S.foodLog=[];
    S.discipline=o.discipline||'muscu'; S.level=o.level||'';
  }
  function seance(dateStr,h,kind,opt){
    opt=opt||{};
    const ts=new Date(dateStr+'T'+pad(h)+':'+pad(opt.min||0)+':00').getTime();
    const exs=(kind==='cardio'||kind==='vide')?[]:(EXS[kind]||[]).map(n=>({name:n,
      sets:[1,2,3].map(()=>({kg:50,reps:10,done:opt.done===undefined?true:opt.done,type:'N'}))}));
    const s={id:ts,date:dateStr,ts,startHour:h,duration:(opt.dur||60)*60,exs,volume:0,uniConv:1,synced:true,progLabel:''};
    s.exercises=exs.map(e=>({name:e.name,sets:e.sets}));
    if(kind==='cardio') s.cardio={type:'elliptique',intensity:'modere',duration:opt.dur||40};
    return s;
  }
  function ajouter(s){ S.sessions.push(s); _trierSeances(S.sessions); return s; }
  /* Un historique régulier : les jours de la semaine donnés (0 = dimanche), 4 semaines, AVANT
     aujourd'hui (aujourd'hui exclu), \`parJour\` séances par jour. */
  function historique(jours,kind,parJour){
    for(let dec=-1;dec>=-27;dec--){
      const ds=jour(dec), wd=new Date(ds+'T12:00:00').getDay();
      if(jours.indexOf(wd)<0) continue;
      for(let i=0;i<(parJour||1);i++) ajouter(seance(ds,i?18:10,Array.isArray(kind)?kind[i%kind.length]:kind));
    }
  }
  function nutri(){
    const m=calcMacros('charge')||{};
    return {cible:m.calories,P:m.prot_g,G:m.carbs_g,L:m.fat_g,tdee:calcTDEE(),
      cycle:m.cycle?{jour:m.cycle.jour,freq:m.cycle.freq,region:m.cycle.region,dCarbs:m.cycle.dCarbs,dFat:m.cycle.dFat,
        autre:m.cycle.autre?{jour:m.cycle.autre.jour,fat_g:m.cycle.autre.fat_g,carbs_g:m.cycle.autre.carbs_g}:null}:null,
      js:jourSeance().source, heure:jourSeance().heure};
  }
  return {EXS,jour,base,seance,ajouter,historique,nutri};
})();`;

async function _ouvrir(b, PORT, quand, opt) {
  opt = opt || {};
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: opt.tz || 'Europe/Paris' });
  const externes = [];
  await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => { externes.push(rt.request().url()); rt.abort(); });
  await cx.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('__np01')) { localStorage.clear(); sessionStorage.setItem('__np01', '1'); }
      localStorage.setItem('ft4_ob2', '1'); localStorage.setItem('ft4_guide_shown', '1'); localStorage.setItem('ft4_wn_seen', '99');
    } catch (e) { }
  });
  const pg = await cx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await pg.clock.setFixedTime(new Date(quand));
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(opt.attente || 1500);
  await pg.evaluate(PAGE);
  return {
    cx, pg, errs, externes,
    heure: async (x) => pg.clock.setFixedTime(new Date(x)),
    recharger: async () => { await pg.reload(); await pg.waitForTimeout(opt.attente || 1500); await pg.evaluate(PAGE); }
  };
}
const _det = o => JSON.stringify(o);
const _obs = (nom, val) => console.log('   ⓘ OBSERVATION (jamais rouge) ' + nom + ' >> ' + val);

module.exports.PAGE = PAGE;
module.exports._ouvrir = _ouvrir;

/* ═══ B-NP01-A — source : la cible n'a AUCUN terme de séance ═══ */
module.exports.sourceContrat = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-A. NUT-PUNCH-01 — contrat Séance → Nutrition (source) ═══');
  const ST = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'state.js'), 'utf8')).replace(/\s+/g, '');
  const tdee = _corps(ST, 'calcTDEE');
  t('B-NP01-A source ① la dépense du jour a QUATRE termes, aucun ne lit une séance (BMR × activité + travail + autre sport + surplus de pas)',
    tdee.includes('returnMath.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));')
    && !/sessions|wkt|duration|volume/.test(tdee), tdee.slice(0, 160));
  const brut = _corps(ST, '_autoKcalBrut');
  t('B-NP01-A source ② la cible automatique ne lit ni la durée, ni le volume, ni la méthode, ni la discipline, ni le niveau',
    brut.length > 0 && !/\.duration|\.volume|groupType|dropset|S\.discipline|S\.level/.test(brut), 'terme de séance dans _autoKcalBrut');
};

/* ═══ B-NP01-A — le contrat conduit ═══ */
module.exports.contrat = async function (t, b, PORT) {
  console.log('\n-- B-NP01-A. NUT-PUNCH-01 — contrat Séance → Nutrition (conduit : vraie séance, vrai rechargement) --');
  /* Samedi 03/10/2026, 17 h 55 à Paris. Historique : lundi / mercredi / vendredi, 4 semaines, haut du corps ;
     + UNE séance importée (`importedHistory`) un mardi, telle que `finalImportHist` l'écrit. */
  const X = await _ouvrir(b, PORT, '2026-10-03T17:55:00+02:00');
  const A0 = await X.pg.evaluate(() => {
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    const imp = __np.seance(__np.jour(-11), 12, 'dos'); imp.startHour = null; imp.duration = 0; imp.importedHistory = true;
    delete imp.uniConv; imp.synced = false; imp.exs.forEach(e => e.sets.forEach(x => { x.type = ''; }));
    __np.ajouter(imp); persist();
    const o = { repos: __np.nutri() };
    S.nextPlanned = { date: today(), label: 'Jambes' }; persist();
    o.annonce = __np.nutri(); o.planned = plannedSession();
    startWorkout();
    o.wkt = { date: S.wkt && S.wkt.date, startHour: S.wkt && S.wkt.startHour, n: S.wkt && S.wkt.exs.length };
    S.wkt.exs.push({ name: 'Squat à la Barre', sets: [
      { kg: 60, reps: 8, done: false, type: 'É' }, { kg: 100, reps: 5, done: false, type: 'N' },
      { kg: 100, reps: 5, done: false, type: 'N' }, { kg: 100, reps: 4, done: false, type: 'X' }] });
    S.wkt.exs.push({ name: 'Press Jambes 45°', sets: [
      { kg: 160, reps: 10, done: false, type: 'N' }, { kg: 160, reps: 10, done: false, type: 'N' }] });
    S.wkt.cardioAvant = { type: 'elliptique', intensity: 'modere', duration: 10 };
    persist(); renderLog();
    o.encours = __np.nutri();
    return o;
  });
  t('B-NP01-A samedi sans séance → jour de REPOS ; annonce du jour → jour de séance « annoncée » ; séance démarrée avec ses exercices → « en cours »',
    A0.repos.js === 'repos' && A0.annonce.js === 'annoncee' && A0.encours.js === 'encours' && A0.planned && A0.planned.label === 'Jambes', _det([A0.repos.js, A0.annonce.js, A0.encours.js]));
  t('B-NP01-A ⭐ la séance ouverte porte la date LOCALE du jour et l\'heure d\'ouverture (17 h)',
    A0.wkt.date === '2026-10-03' && A0.wkt.startHour === 17 && A0.wkt.n === 0, _det(A0.wkt));
  t('B-NP01-A ⛔ ni l\'annonce ni l\'ouverture ne changent la cible calorique (aucun terme de séance)',
    A0.repos.cible > 0 && A0.annonce.cible === A0.repos.cible && A0.encours.cible === A0.repos.cible && A0.encours.tdee === A0.repos.tdee, _det([A0.repos.cible, A0.annonce.cible, A0.encours.cible]));

  /* Les séries validées par le VRAI `toggleSet`, à des heures différentes. */
  const valider = async (h, ei, si) => { await X.heure('2026-10-03T' + h + ':00+02:00'); return X.pg.evaluate(([e, s]) => { toggleSet(e, s); return { startHour: S.wkt.startHour, at: S.wkt.exs[e].sets[s].at, done: S.wkt.exs[e].sets[s].done }; }, [ei, si]); };
  const v0 = await valider('18:10', 0, 0);
  await valider('18:14', 0, 1); await valider('18:18', 0, 2); await valider('18:22', 0, 3);
  await valider('18:30', 1, 0);
  t('B-NP01-A ⭐ la 1ʳᵉ série validée fixe l\'heure de séance (18 h) et démarre le chrono (at = 0)',
    v0.startHour === 18 && v0.at === 0 && v0.done === true, _det(v0));
  /* Rechargement PENDANT la séance : rien ne se perd, la séance reste « en cours ». */
  await X.heure('2026-10-03T18:40:00+02:00');
  const avantRech = await X.pg.evaluate(() => JSON.stringify(S.wkt));
  await X.recharger();
  const R1 = await X.pg.evaluate(() => ({ wkt: JSON.stringify(S.wkt), n: __np.nutri() }));
  t('B-NP01-A ⛔ rechargement en pleine séance : la séance ouverte revient À L\'IDENTIQUE (séries, codes, cardio, chrono)',
    R1.wkt === avantRech && R1.n.js === 'encours', R1.wkt.slice(0, 160));

  /* Fin de séance par le VRAI `finishWorkout`, à 19 h 05. */
  await X.heure('2026-10-03T19:05:00+02:00');
  await X.pg.evaluate(async () => { await finishWorkout(); });
  await X.pg.waitForTimeout(300);
  const reseauAvant = X.externes.length;
  const F = await X.pg.evaluate(async () => {
    const s = S.sessions[0];
    const o = { s: { date: s.date, ts: s.ts, startHour: s.startHour, duration: s.duration, noms: s.exs.map(e => e.name),
      done: s.exs.map(e => e.sets.map(x => x.done)), types: s.exs.map(e => e.sets.map(x => x.type)),
      cardioAvant: s.cardioAvant ? s.cardioAvant.duration : null, cardio: s.cardio || null, imp: !!s.importedHistory },
      wkt: S.wkt, ouverte: _seanceOuverte(), n: __np.nutri(), planned: plannedSession(),
      ordre: S.sessions.map(x => x.date).every((d, i, l) => !i || l[i - 1] >= d), nb: S.sessions.length,
      importe: S.sessions.filter(x => x.importedHistory).length };
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); renderNutrition();
    return o;
  });
  await X.pg.waitForTimeout(300);
  const reseauNutri = X.externes.length - reseauAvant;
  const ts1905 = new Date('2026-10-03T19:05:00+02:00').getTime();
  t('B-NP01-A ⭐ séance enregistrée : date locale 03/10, ts = l\'heure de fin, startHour 18, durée = 55 min (depuis la 1ʳᵉ série)',
    F.s.date === '2026-10-03' && F.s.ts === ts1905 && F.s.startHour === 18 && F.s.duration === 3300, _det(F.s));
  t('B-NP01-A ⭐ noms, séries validées / non validées, codes de série (É, N, X) et cardio d\'échauffement : intacts',
    _det(F.s.noms) === _det(['Squat à la Barre', 'Press Jambes 45°'])
    && _det(F.s.done) === _det([[true, true, true, true], [true, false]])
    && _det(F.s.types) === _det([['É', 'N', 'N', 'X'], ['N', 'N']])
    && F.s.cardioAvant === 10 && F.s.cardio === null && F.s.imp === false, _det(F.s));
  /* ⚠️ `renderLog()` recrée un objet VIDE juste après la fin (quirk connu, sans exercice) : on lit la
     définition UNIQUE de « séance ouverte » (`_seanceOuverte`, log.js), jamais « S.wkt existe ». */
  t('B-NP01-A ⭐ après la fin : séance « faite », l\'annonce est honorée, plus aucune séance ouverte, l\'ordre (plus récente d\'abord) tient',
    F.n.js === 'faite' && F.n.heure === 18 && F.planned === null && F.ouverte === false && !(F.wkt && F.wkt.exs && F.wkt.exs.length)
    && F.ordre && F.importe === 1, _det({ js: F.n.js, h: F.n.heure, pl: F.planned, wkt: F.wkt, ordre: F.ordre }));
  t('B-NP01-A ⛔ la séance TERMINÉE ne change pas la cible calorique (ni la dépense)',
    F.n.cible === A0.repos.cible && F.n.tdee === A0.repos.tdee, _det([F.n.cible, A0.repos.cible]));
  t('B-NP01-A ⛔ aucun appel réseau pendant le calcul et l\'affichage Nutrition (tout hors localhost est coupé ET compté)',
    reseauNutri === 0, 'appels : ' + reseauNutri);

  /* Vrai rechargement après la fin : aucune perte. */
  const avant = await X.pg.evaluate(() => JSON.stringify(S.sessions));
  await X.recharger();
  const R2 = await X.pg.evaluate(() => ({ s: JSON.stringify(S.sessions), wkt: S.wkt, ouverte: _seanceOuverte(), np: S.nextPlanned, n: __np.nutri() }));
  t('B-NP01-A ⛔ rechargé : l\'historique revient OCTET POUR OCTET (séance du jour + séance importée), aucune séance ouverte fantôme',
    R2.s === avant && !R2.ouverte && R2.n.js === 'faite', _det({ wkt: R2.wkt, js: R2.n.js }));

  /* ⛔⛔ CONTRÔLES NÉGATIFS — changer SEULEMENT la durée / le volume / la méthode / la discipline / le niveau. */
  const N = await X.pg.evaluate(() => {
    const s = S.sessions.find(x => x.date === today());
    const lire = () => { const n = __np.nutri(); return { cible: n.cible, tdee: n.tdee, P: n.P, G: n.G, L: n.L }; };
    const o = { ref: lire() };
    const d0 = s.duration; s.duration = d0 * 3; o.duree = lire(); s.duration = 60; o.dureeCourte = lire(); s.duration = d0;
    const v0 = s.volume; s.volume = (v0 || 1000) * 10; o.volume = lire(); s.volume = v0;
    s.exs[0].group = 'g1'; s.exs[0].groupType = 'super'; s.exs[1].group = 'g1'; s.exs[1].groupType = 'super';
    s.exs[0].dropset = { paliers: 3, baisse: 20 }; o.methode = lire();
    delete s.exs[0].group; delete s.exs[0].groupType; delete s.exs[1].group; delete s.exs[1].groupType; delete s.exs[0].dropset;
    S.discipline = 'powerlifting'; o.discipline = lire(); S.discipline = 'muscu';
    S.level = 'confirme'; o.niveau = lire(); S.level = 'debutant'; o.niveau2 = lire(); S.level = '';
    return o;
  });
  const meme = (a, r) => a.cible === r.cible && a.tdee === r.tdee;
  const memeTout = (a, r) => meme(a, r) && a.P === r.P && a.G === r.G && a.L === r.L;
  t('B-NP01-A ⛔⛔ NÉGATIF durée ×3 puis 1 min : cible, dépense ET macros identiques', memeTout(N.duree, N.ref) && memeTout(N.dureeCourte, N.ref), _det([N.ref, N.duree, N.dureeCourte]));
  t('B-NP01-A ⛔⛔ NÉGATIF volume ×10 : cible, dépense ET macros identiques', memeTout(N.volume, N.ref), _det([N.ref, N.volume]));
  t('B-NP01-A ⛔⛔ NÉGATIF méthode (superset + dropset) : cible, dépense ET macros identiques', memeTout(N.methode, N.ref), _det([N.ref, N.methode]));
  t('B-NP01-A ⛔⛔ NÉGATIF discipline (musculation → powerlifting) : cible et dépense identiques', meme(N.discipline, N.ref), _det([N.ref, N.discipline]));
  t('B-NP01-A ⛔⛔ NÉGATIF niveau (aucun → confirmé → débutant) : cible et dépense identiques', meme(N.niveau, N.ref) && meme(N.niveau2, N.ref), _det([N.ref, N.niveau, N.niveau2]));
  t('B-NP01-A aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();

  /* ⛔ LA DATE LOCALE APRÈS MINUIT : dimanche 04/10 à 1 h 30 à Paris = samedi 23 h 30 en UTC. Une date
     prise en UTC rangerait la séance la veille — et la Nutrition du dimanche la perdrait. */
  const Z = await _ouvrir(b, PORT, '2026-10-04T01:30:00+02:00');
  await Z.pg.evaluate(() => { __np.base({}); __np.historique([1, 3, 5], 'haut'); persist(); startWorkout();
    S.wkt.exs.push({ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }] }); persist(); renderLog(); });
  await Z.heure('2026-10-04T01:35:00+02:00');
  await Z.pg.evaluate(() => toggleSet(0, 0));
  await Z.heure('2026-10-04T02:10:00+02:00');
  const ZN = await Z.pg.evaluate(async () => { await finishWorkout(); const s = S.sessions[0];
    return { date: s.date, startHour: s.startHour, duration: s.duration, n: __np.nutri(), jourLocal: today() }; });
  t('B-NP01-A ⛔ après minuit (1 h 30 à Paris = 23 h 30 UTC la veille) : la séance est datée du jour LOCAL (04/10), « faite » pour la Nutrition du 04/10',
    ZN.date === '2026-10-04' && ZN.jourLocal === '2026-10-04' && ZN.startHour === 1 && ZN.duration === 2100 && ZN.n.js === 'faite', _det(ZN));
  t('B-NP01-A après minuit : aucune erreur de page', Z.errs.length === 0, Z.errs.slice(0, 2).join(' | '));
  await Z.cx.close();

  /* ⓘ LES CINQ OBSERVATIONS NOMMÉES — mesurées, imprimées, JAMAIS rouges. */
  const O = await _ouvrir(b, PORT, '2026-10-05T21:00:00+02:00');   // lundi soir
  const reseauO = O.externes.length;
  const OB = await O.pg.evaluate(() => {
    const o = {};
    const region = () => { const m = calcMacros('charge'); return m && m.cycle ? m.cycle.region : null; };
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    __np.ajouter(__np.seance(today(), 10, 'haut')); __np.ajouter(__np.seance(today(), 18, 'jambes'));
    o.O1 = { region: region(), derniere: _calSessRegion(S.sessions.find(s => s.date === today())) };
    o.O2 = { evenementsAujourdhui: S.sessions.filter(s => s.date === today()).length, tuile7j: _weeklyCounts(1)[0] };
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    __np.ajouter(__np.seance(today(), 18, 'jambes')); __np.ajouter(__np.seance(today(), 19, 'abdos'));
    o.O3 = { region: region(), regionAbdos: _calSessRegion(S.sessions[0]) };
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    __np.ajouter(__np.seance(today(), 18, 'cardio'));
    o.O4 = { js: jourSeance().source, regionCardio: _calSessRegion(S.sessions[0]), facteur: region() };
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    S.nextPlanned = { date: today(), label: 'Jambes' }; __np.ajouter(__np.seance(today(), 18, 'bras'));
    o.O5 = { annonce: plannedSession(), regionFaite: _calSessRegion(S.sessions[0]) };
    return o;
  });
  _obs('O1 la DERNIÈRE séance du jour donne la région du jour (haut 10 h + jambes 18 h)', _det(OB.O1));
  _obs('O2 deux séances le même jour = DEUX événements pour le compteur (jour, tuile 7 jours)', _det(OB.O2));
  _obs('O3 un bloc abdos SÉPARÉ après les jambes donne la région du jour', _det(OB.O3));
  _obs('O4 un cardio SEUL fait un jour de séance (région inconnue)', _det(OB.O4));
  _obs('O5 une annonce « Jambes » est HONORÉE par une séance de bras', _det(OB.O5));
  t('B-NP01-A les observations ont bien été MESURÉES (sonde vivante : 2 événements comptés, annonce lue)',
    OB.O2.evenementsAujourdhui === 2 && OB.O4.js === 'faite' && 'annonce' in OB.O5, _det(OB));
  t('B-NP01-A observations : aucune erreur de page, aucun appel réseau pendant les calculs', O.errs.length === 0 && O.externes.length === reseauO, O.errs.concat(O.externes.slice(reseauO)).slice(0, 2).join(' | '));
  await O.cx.close();
};
