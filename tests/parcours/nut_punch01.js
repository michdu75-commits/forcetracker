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

/* ══════════════════════════════════════════════════════════════════════════════════════
   ── B-NP01-B — CYCLE EN JOURS · CACHE DE RÉGION · RÉGION DU JOUR ANNONCÉ · ÉCRAN SÉANCE VIDE ──
   Mesuré sur master ad172a87 AVANT correctif (valeurs dans les témoins) :
   · B1 : 4 jours × 2 séances → `f = 8`, cycle COUPÉ ; 3 jours × 2 → `f = 6`, semaine NON neutre
     (−182 g de glucides, +77 g de lipides sur 7 jours) ;
   · B2 : la région de la séance ouverte, lue avant la 1ʳᵉ série, restait « inconnue » en cache :
     ni la série validée ni la fin de séance ne corrigeaient le cycle ni la couleur du calendrier ;
   · B3 : jour annoncé → facteur 1 (452 g) au lieu du « jour de séance typique » que le jour de
     repos annonçait pour ce même jour (456 g) ;
   · A2 : afficher l'écran Séance un jour de repos en faisait un jour de séance (repas pré/post,
     cycle côté séance) — et après une sauvegarde, rechargement compris.
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.sourceCycle = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-B. NUT-PUNCH-01 — cycle en jours, cache de région, jour annoncé (source) ═══');
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js'), TR = lire('tracking.js'), SC = lire('screens.js');
  const cyc = _corps(ST, 'cycleGlucides');
  const appels = (src, re) => (src.match(re) || []).length;
  t('B-NP01-B source ① SEUL le cycle lit les jours : `_weeklyCounts(4,true)` une fois, dans `cycleGlucides`, nulle part ailleurs',
    cyc.includes('constwk=_weeklyCounts(4,true);') && appels(ST + TR + SC + lire('app.js') + lire('coach.js'), /_weeklyCounts\(\d+,true\)/g) === 1, 'lecture en jours ailleurs');
  t('B-NP01-B source ② la tuile, la proposition de niveau et la carte de Milo lisent toujours les SÉANCES (un seul argument)',
    SC.includes('_weeklyCounts(1)[0]') && _corps(TR, '_pendingFreqContext').includes('constwk=_weeklyCounts(4);')
    && _corps(ST, 'ecartNiveauActivite').includes('constwk=_weeklyCounts(4);'), 'un consommateur de fréquence a basculé');
  t('B-NP01-B source ③ la clé du cache de région porte l\'état « série validée » de chaque exercice (même prédicat que `_mscScores`)',
    SC.includes("constkey=s.date+'|'+(s.exs||[]).map(e=>((e&&e.name)||'')+'#'+(((e&&e.sets)||[]).some(x=>x&&x.done)?1:0)).join('~');"), 'clé sans état');
  t('B-NP01-B source ④ « en cours » se lit dans `_seanceOuverte`, jamais dans « S.wkt existe »',
    _corps(ST, 'jourSeance').includes('if(S.wkt&&S.wkt.date===t&&ouverte)return{seance:true,heure:_heureSeance(S.wkt),source:\'encours\'};'), 'jourSeance lit S.wkt brut');
};

/* Historique mixte : lundi et vendredi jambes, mercredi haut du corps, 4 semaines avant aujourd'hui. */
const _MIX = `__np.base({}); for(let dec=-1;dec>=-27;dec--){ const ds=__np.jour(dec), wd=new Date(ds+'T12:00:00').getDay();
  if(wd===1||wd===5) __np.ajouter(__np.seance(ds,18,'jambes')); if(wd===3) __np.ajouter(__np.seance(ds,18,'haut')); }`;

module.exports.cycle = async function (t, b, PORT) {
  console.log('\n-- B-NP01-B. NUT-PUNCH-01 — cycle en jours, cache de région, jour annoncé, écran Séance vide (conduit) --');
  /* ── B1 : une SEMAINE entière, jour par jour, motif fixe par jour de la semaine (aujourd'hui compris). ── */
  const semaine = async (motif, kinds, quiz) => {
    const o = await _ouvrir(b, PORT, '2026-10-05T21:00:00+02:00');
    let sG = 0, sL = 0; const jours = [];
    for (let k = 0; k < 7; k++) {
      const tt = new Date('2026-10-05T21:00:00+02:00'); tt.setDate(tt.getDate() + k); await o.heure(tt.toISOString());
      jours.push(await o.pg.evaluate(([motif, kinds, quiz]) => {
        __np.base({ quiz: quiz || {} });
        for (let dec = 0; dec >= -27; dec--) { const ds = __np.jour(dec); const wd = new Date(ds + 'T12:00:00').getDay();
          for (let i = 0; i < (motif[wd] || 0); i++) __np.ajouter(__np.seance(ds, i ? 18 : 10, kinds[i % kinds.length])); }
        const n = __np.nutri(); renderNutrition();
        const e = ecartNiveauActivite(), fc = _pendingFreqContext();
        return { js: n.js, f: n.cycle && n.cycle.freq, G: n.G, L: n.L, dG: n.cycle ? n.cycle.dCarbs : 0, dL: n.cycle ? n.cycle.dFat : 0,
          autre: n.cycle && n.cycle.autre, tuile: document.getElementById('nu-week-sess').textContent, wk: _weeklyCounts(4),
          ecart: e ? [e.actuel, e.suggere, e.moy] : null, fc: fc ? [fc.dir, fc.declared, fc.observed] : null };
      }, [motif, kinds, quiz]));
      sG += jours[k].dG || 0; sL += jours[k].dL || 0;
    }
    await o.cx.close();
    return { sG, sL, j0: jours[0], j1: jours[1], errs: o.errs };
  };
  const det = _det;
  const s41 = await semaine({ 1: 1, 3: 1, 5: 1, 6: 1 }, ['jambes']);
  t('B-NP01-B B1 ⭐ TÉMOIN DE CONTRÔLE 4 jours × 1 séance : IDENTIQUE à master (f 4 · séance 450 / 74 · repos 376 / 107 · semaine −5 / +1)',
    s41.j0.f === 4 && s41.j0.G === 450 && s41.j0.L === 74 && s41.j1.G === 376 && s41.j1.L === 107 && s41.sG === -5 && s41.sL === 1, det([s41.j0, s41.j1, s41.sG, s41.sL]));
  const s42 = await semaine({ 1: 2, 3: 2, 5: 2, 6: 2 }, ['haut', 'jambes'], { freq: '4' });
  t('B-NP01-B B1 ⭐⭐ 4 jours × 2 séances : le cycle n\'est plus COUPÉ (master : f = 8, aucun cycle) — f = 4, mêmes valeurs que 4 × 1 jambes',
    s42.j0.f === 4 && s42.j0.G === 450 && s42.j0.L === 74 && s42.j1.G === 376 && s42.j1.L === 107 && s42.sG === -5 && s42.sL === 1, det([s42.j0, s42.j1, s42.sG]));
  t('B-NP01-B B1 ⛔ … et ce qui lit des SÉANCES ne bouge pas : tuile « 8 séances », compteur [8,8,8,8], proposition 1,55 → 1,725 (moy. 8), carte de Milo « up »',
    s42.j0.tuile === '8 séances' && det(s42.j0.wk) === '[8,8,8,8]' && det(s42.j0.ecart) === '[1.55,1.725,8]' && det(s42.j0.fc) === '["up","4","5"]', det([s42.j0.tuile, s42.j0.wk, s42.j0.ecart, s42.j0.fc]));
  const s32 = await semaine({ 1: 2, 3: 2, 5: 2 }, ['haut', 'jambes']);
  t('B-NP01-B B1 ⛔⛔ 3 jours × 2 séances : la SEMAINE est neutre (master : −182 g de glucides / +77 g de lipides) — f = 3, ±1 g par jour d\'arrondi',
    s32.j0.f === 3 && Math.abs(s32.sG) <= 7 && Math.abs(s32.sL) <= 7, det({ f: s32.j0.f, sG: s32.sG, sL: s32.sL }));
  t('B-NP01-B B1 ⭐ 3 × 2 : chaque jour de séance prend la région de SA dernière séance (jambes), comme 3 × 1 jambes (461 / 69 · repos 387 / 102)',
    s32.j0.G === 461 && s32.j0.L === 69 && s32.j1.G === 387 && s32.j1.L === 102, det([s32.j0, s32.j1]));
  t('B-NP01-B B1 ⛔ 3 × 2 : la tuile dit toujours « 6 séances », le compteur [6,6,6,6], la proposition 1,55 → 1,725 (moy. 6)',
    s32.j0.tuile === '6 séances' && det(s32.j0.wk) === '[6,6,6,6]' && det(s32.j0.ecart) === '[1.55,1.725,6]', det([s32.j0.tuile, s32.j0.wk, s32.j0.ecart]));
  t('B-NP01-B B1 aucune erreur de page', !s41.errs.length && !s42.errs.length && !s32.errs.length, s41.errs.concat(s42.errs, s32.errs).slice(0, 2).join(' | '));

  /* ── A2 : un jour de repos, on AFFICHE l'écran Séance sans rien démarrer. ── */
  const A = await _ouvrir(b, PORT, '2026-10-03T09:00:00+02:00');
  await A.pg.evaluate(new Function(_MIX + 'persist();'));
  const lireA = () => A.pg.evaluate(() => { const n = __np.nutri(); return { js: n.js, cyc: n.cycle && n.cycle.jour, G: n.G, L: n.L,
    repas: getMeals(calcMacros('charge'), 'charge').map(m => m.name).join(' | ') }; });
  const a0 = await lireA();
  await A.pg.evaluate(() => goScreen('log', document.getElementById('nb-log'))); await A.pg.waitForTimeout(300);
  const a1 = await lireA();
  await A.pg.evaluate(() => persist()); await A.recharger();
  const a2 = await lireA();
  const sansSeance = x => x.js === 'repos' && x.cyc === 'repos' && x.G === 390 && x.L === 100 && !/entraînement/.test(x.repas);
  t('B-NP01-B A2 ⭐⭐ jour de repos, écran Séance AFFICHÉ sans rien démarrer : toujours un jour de REPOS (master : « en cours », 452 / 73, repas pré/post)',
    sansSeance(a0) && sansSeance(a1), det([a0, a1]));
  t('B-NP01-B A2 ⛔⛔ … et après une sauvegarde puis un vrai rechargement (master : toute la journée restait un jour de séance)',
    sansSeance(a2), det(a2));
  await A.pg.evaluate(() => { startWorkout(); });
  const a3 = await lireA();
  await A.pg.evaluate(() => { S.wkt.cardioAvant = { type: 'elliptique', intensity: 'modere', duration: 10 }; });
  const a4 = await lireA();
  await A.pg.evaluate(() => { delete S.wkt.cardioAvant; S.wkt.exs.push({ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }] }); });
  const a5 = await lireA();
  t('B-NP01-B A2 ⭐ la définition unique, appliquée telle quelle : « Démarrer » sans rien → pas encore une séance ; un cardio noté OU un exercice → « en cours »',
    a3.js === 'repos' && a4.js === 'encours' && a5.js === 'encours' && /Pré-entraînement/.test(a5.repas), det([a3.js, a4.js, a5.js]));
  t('B-NP01-B A2 aucune erreur de page', A.errs.length === 0, A.errs.slice(0, 2).join(' | '));
  await A.cx.close();

  /* ── B3 + B2 : samedi, historique mixte (r̄ = 1,1). ── */
  const X = await _ouvrir(b, PORT, '2026-10-03T17:50:00+02:00');
  await X.pg.evaluate(new Function(_MIX + 'persist();'));
  const lireX = () => X.pg.evaluate(() => { const n = __np.nutri(); return { js: n.js, reg: n.cycle && n.cycle.region, G: n.G, L: n.L, autre: n.cycle && n.cycle.autre }; });
  const repos = await lireX();
  await X.pg.evaluate(() => { S.nextPlanned = { date: today(), label: 'Jambes' }; });
  const annJ = await lireX();
  await X.pg.evaluate(() => { S.nextPlanned = { date: today(), label: 'Haut du corps' }; });
  const annH = await lireX();
  t('B-NP01-B B3 ⭐⭐ jour ANNONCÉ : exactement le « jour de séance typique » que le jour de repos annonçait (456 / 71, région r̄ = 1,1 — master : facteur 1, 452 / 73)',
    repos.js === 'repos' && repos.autre && repos.autre.carbs_g === 456 && repos.autre.fat_g === 71
    && annJ.js === 'annoncee' && annJ.reg === 1.1 && annJ.G === repos.autre.carbs_g && annJ.L === repos.autre.fat_g, det([repos.autre, annJ]));
  t('B-NP01-B B3 ⛔ on ne devine RIEN du libellé : « Jambes » et « Haut du corps » donnent la même chose',
    annH.reg === annJ.reg && annH.G === annJ.G && annH.L === annJ.L, det([annJ, annH]));
  await X.pg.evaluate(() => { startWorkout();
    S.wkt.exs.push({ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }, { kg: 100, reps: 5, done: false, type: 'N' }] });
    S.wkt.exs.push({ name: 'Press Jambes 45°', sets: [{ kg: 160, reps: 10, done: false, type: 'N' }] }); persist(); renderLog(); });
  const ouv = await lireX();
  await X.heure('2026-10-03T18:05:00+02:00');
  await X.pg.evaluate(() => toggleSet(0, 0));
  const s1 = await lireX();
  await X.pg.evaluate(() => toggleSet(0, 0));
  const s0 = await lireX();
  t('B-NP01-B B3 séance ouverte, AUCUNE série validée : région inconnue → le jour de séance typique (r̄ 1,1 · 456 / 71), comme l\'annonce',
    ouv.js === 'encours' && ouv.reg === 1.1 && ouv.G === 456 && ouv.L === 71, det(ouv));
  t('B-NP01-B B2 ⭐⭐ 1ʳᵉ série de jambes validée, MÊME PAGE : la région passe à « bas » (1,25 · 461 / 69) — master : restait 1 en cache',
    s1.reg === 1.25 && s1.G === 461 && s1.L === 69, det(s1));
  t('B-NP01-B B2 ⭐ série dévalidée, même page : retour à « inconnue » → r̄ (456 / 71) — l\'état compte dans les deux sens',
    s0.reg === 1.1 && s0.G === 456 && s0.L === 71, det(s0));
  await X.pg.evaluate(() => { toggleSet(0, 0); toggleSet(0, 1); toggleSet(1, 0); });
  await X.heure('2026-10-03T19:00:00+02:00');
  const fin = await X.pg.evaluate(async () => { await finishWorkout(); _renderHomeCalendar();
    const h = (document.getElementById('home-secondary') || {}).innerHTML || ''; const n = __np.nutri();
    return { region: _calSessRegion(S.sessions[0]), couleur: _calSessColor(S.sessions[0]), barres: (h.match(/height:3px;border-radius:2px;background:var\(--purp\)/g) || []).length,
      js: n.js, reg: n.cycle && n.cycle.region, G: n.G, L: n.L }; });
  t('B-NP01-B B2 ⭐⭐ fin de séance, SANS recharger : région « bas », couleur du calendrier violette (4ᵉ barre de jambes du mois) — master : inconnue, rouge par défaut, 3 barres',
    fin.region === 'bas' && fin.couleur === 'var(--purp)' && fin.barres === 4 && fin.js === 'faite' && fin.reg === 1.25 && fin.G === 461 && fin.L === 69, det(fin));
  t('B-NP01-B B2/B3 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();

  /* ⛔ NON-RÉGRESSION : une séance FAITE dont la région est inconnue (cardio seul) garde le facteur 1. */
  const C = await _ouvrir(b, PORT, '2026-10-03T19:00:00+02:00');
  const card = await C.pg.evaluate(new Function(_MIX + `__np.ajouter(__np.seance(today(),18,'cardio')); const n=__np.nutri(); return {js:n.js, reg:n.cycle&&n.cycle.region, G:n.G, L:n.L};`));
  t('B-NP01-B B3 ⛔ une séance FAITE de région inconnue (cardio seul) garde le facteur 1 (452 / 73), comme master : elle a eu lieu, on ne la remplace pas par une moyenne',
    card.js === 'faite' && card.reg === 1 && card.G === 452 && card.L === 73, det(card));
  await C.cx.close();
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   ── B-NP01-C — LE RÔLE D'UN REPAS D'ENTRAÎNEMENT SURVIT À SON INTITULÉ ──
   Mesuré sur master ad172a87 AVANT correctif :
   · C1 low carb, jour de repos : « ⚡ Autour de la séance » (317 kcal) s'affichait ;
   · C2 jeûne 16/8 + force ou endurance, séance à 18 h : plus AUCUN repas pré-entraînement (le
     « ⚡ Pré-entraînement » était renommé « ⏳ Rupture du jeûne (12 h) » et perdait son rôle) ; et un
     jour de repos, son contenu (« Charge glycogène maximale ») restait affiché sous ce nom.
   ⛔ Principe (Michel) : un changement d'intitulé d'AFFICHAGE ne fait jamais perdre la sémantique
   interne du repas. ⛔ Ni macros, ni total du jour, ni ordre des repas, ni G11 (quel repas dans la
   fenêtre de jeûne selon l'heure de séance) ne changent ici.
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.sourceRepas = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-C. NUT-PUNCH-01 — rôle des repas d\'entraînement (source) ═══');
  const ST = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'state.js'), 'utf8')).replace(/\s+/g, '');
  const gm = _corps(ST, 'getMeals');
  t('B-NP01-C source ① le rôle se lit sur l\'intitulé D\'ORIGINE (pré / post / autour de la séance), avant tout renommage',
    gm.indexOf('letplan2=plan.map(([p,nom,d])=>[p,nom,d,_roleRepas(nom)]);') >= 0
    && /\['autour',\/autourdelaséance\/i\]/.test(ST), 'rôle absent');
  t('B-NP01-C source ② le filtre des jours de repos passe par le RÔLE et AVANT le jeûne',
    gm.indexOf('if(!_js.seance)plan2=_retirerRepas(plan2,r=>!!r[3]);') >= 0
    && gm.indexOf('if(!_js.seance)plan2=_retirerRepas(plan2,r=>!!r[3]);') < gm.indexOf('if(S.fasting){'), 'ordre ou critère');
};

module.exports.repas = async function (t, b, PORT) {
  console.log('\n-- B-NP01-C. NUT-PUNCH-01 — repas low carb et jeûne (conduit, écran Nutrition, rechargement) --');
  const X = await _ouvrir(b, PORT, '2026-10-03T20:00:00+02:00');
  const plan = (opt, s) => X.pg.evaluate(([opt, s]) => {
    __np.base(opt); __np.historique([1, 3, 5], 'haut');
    if (s === 'annonce') S.nextPlanned = { date: today(), label: 'Jambes' }; else if (s != null) __np.ajouter(__np.seance(today(), s, 'jambes'));
    persist();
    const m = calcMacros('charge'), r = getMeals(m, 'charge', 0);
    return { cible: m.calories, tot: r.reduce((a, x) => a + x.kcal, 0), noms: r.map(x => x.name), kcal: r.map(x => x.kcal) };
  }, [opt, s]);
  const det = _det, tient = p => Math.abs(p.tot - p.cible) <= p.noms.length;
  const lcR = await plan({ foodMode: 'lowcarb' }, null), lcS = await plan({ foodMode: 'lowcarb' }, 18);
  t('B-NP01-C C1 ⭐⭐ low carb, jour de REPOS : plus de « ⚡ Autour de la séance » (master : 317 kcal affichées), ses calories redistribuées, total intact',
    !lcR.noms.some(n => /Autour de la séance/.test(n)) && det(lcR.kcal) === '[872,396,1030,872]' && tient(lcR), det(lcR));
  t('B-NP01-C C1 ⛔ low carb, jour de SÉANCE : le repas « Autour de la séance » reste, plan identique à master',
    det(lcS.noms) === det(['🌅 Petit-déjeuner', '🥜 Collation', '🍽️ Déjeuner', '⚡ Autour de la séance', '🌙 Dîner']) && det(lcS.kcal) === '[793,317,951,317,793]', det(lcS));
  const jfS = await plan({ goal: 'force', fasting: '16-8' }, 18), jeS = await plan({ goal: 'endurance', fasting: '16-8' }, 18);
  t('B-NP01-C C2 ⭐⭐ jeûne 16/8 + force, séance 18 h : le 1ᵉʳ repas redevient un pré-entraînement (« … — avant ta séance de 18 h »), mêmes calories que master',
    jfS.noms[0] === '⏳ Rupture du jeûne (12 h) — avant ta séance de 18 h' && jfS.noms[2] === '💪 Post-entraînement — après ta séance de 18 h'
    && det(jfS.kcal) === '[604,906,906,604]' && tient(jfS), det(jfS));
  t('B-NP01-C C2 ⭐ jeûne 16/8 + endurance, séance 18 h : idem (master : plus aucun pré-entraînement)',
    jeS.noms[0] === '⏳ Rupture du jeûne (12 h) — avant ta séance de 18 h' && det(jeS.kcal) === '[621,913,767,621]' && tient(jeS), det(jeS));
  const jfA = await plan({ goal: 'force', fasting: '16-8' }, 'annonce');
  t('B-NP01-C C2 séance ANNONCÉE (heure inconnue) : « — avant ta séance », aucune heure inventée',
    jfA.noms[0] === '⏳ Rupture du jeûne (12 h) — avant ta séance' && jfA.noms[2] === '💪 Post-entraînement' && !/\d+ h$/.test(jfA.noms[0].split('— ')[1]), det(jfA.noms));
  const jfR = await plan({ goal: 'force', fasting: '16-8' }, null), jeR = await plan({ goal: 'endurance', fasting: '16-8' }, null);
  t('B-NP01-C C2 ⛔ jeûne + force / endurance, jour de REPOS : aucun repas d\'entraînement, même renommé ; la rupture du jeûne est le 1ᵉʳ repas RESTANT ; total intact',
    det(jfR.noms) === det(['⏳ Rupture du jeûne (12 h)', '🌙 Dîner']) && det(jfR.kcal) === '[1661,1359]' && tient(jfR)
    && det(jeR.noms) === det(['⏳ Rupture du jeûne (12 h)', '🌙 Dîner']) && tient(jeR), det([jfR, jeR]));
  /* ⛔ Ce qui ne doit PAS bouger (valeurs de master). */
  const muR = await plan({}, null), muS = await plan({}, 18), muJ = await plan({ fasting: '18-6' }, 18), muJR = await plan({ fasting: '16-8' }, null);
  t('B-NP01-C ⛔ plan « muscle » standard : repos et séance IDENTIQUES à master',
    det(muR.kcal) === '[911,594,1070,594]' && det(muS.noms) === det(['🌅 Petit-déjeuner', '🍎 Collation matin', '🍽️ Déjeuner', '⚡ Pré-entraînement — avant ta séance de 18 h', '💪 Post-entraînement — après ta séance de 18 h', '🌙 Dîner'])
    && det(muS.kcal) === '[634,317,793,476,634,317]', det([muR, muS]));
  t('B-NP01-C ⛔ plan « muscle » + jeûne : IDENTIQUE à master (la rupture du jeûne y est une collation, pas un repas d\'entraînement)',
    det(muJ.noms) === det(['⏳ Rupture du jeûne (13 h)', '🍽️ Déjeuner', '⚡ Pré-entraînement — avant ta séance de 18 h', '💪 Post-entraînement — après ta séance de 18 h', '🌙 Dîner'])
    && det(muJ.kcal) === '[444,919,602,761,444]' && det(muJR.kcal) === '[898,1374,898]', det([muJ, muJR]));
  const ke = await plan({ foodMode: 'keto' }, 18), pe = await plan({ goal: 'perte' }, 18), fo = await plan({ goal: 'force' }, 18);
  t('B-NP01-C ⛔ kéto, perte et force SANS jeûne : identiques à master',
    det(ke.kcal) === '[793,317,951,317,793]' && det(pe.kcal) === '[593,237,711,237,593]'
    && det(fo.noms) === det(['🌅 Petit-déjeuner', '⚡ Pré-entraînement — avant ta séance de 18 h', '🍽️ Déjeuner', '💪 Post-entraînement — après ta séance de 18 h', '🌙 Dîner']) && det(fo.kcal) === '[604,453,755,755,453]', det([ke, pe, fo]));
  /* L'écran : le plan RENDU dans l'onglet Nutrition, puis un vrai rechargement. */
  await plan({ goal: 'force', fasting: '16-8' }, 18);
  const ecran = () => X.pg.evaluate(async () => { goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); renderNutrition();
    await new Promise(r => setTimeout(r, 200));
    return [...document.querySelectorAll('#meal-plan .meal-name')].map(e => e.textContent.trim()); });
  const e1 = await ecran();
  await X.recharger();
  const e2 = await ecran();
  t('B-NP01-C ⭐ à l\'écran (onglet Nutrition) et après un vrai rechargement : « ⏳ Rupture du jeûne (12 h) — avant ta séance de 18 h » en tête',
    e1[0] === '⏳ Rupture du jeûne (12 h) — avant ta séance de 18 h' && det(e1) === det(e2) && e1.length === 4, det([e1, e2]));
  t('B-NP01-C aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   ── B-NP01-D — RELIQUATS FACTUELS ──
   Mesuré sur master ad172a87 AVANT correctif :
   · D1 la tendance de force excluait les codes ANCIENS (`W`, `E`) mais pas l'échauffement actuel
     `É` : un palier 40 → 60 kg × 8 comptait +50 % ; le garde-fou de volume comptait les paliers ;
   · D2 la phase du cycle menstruel basculait à MIDI (écart mesuré depuis 12 h du jour de début) ;
   · D3 « Séance demain » datée en UTC : en UTC+13 / +14, « demain » devenait AUJOURD'HUI ;
   · D4 la tuile Nutrition disait « Cette semaine » pour 7 jours GLISSANTS.
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.sourceReliquats = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-D. NUT-PUNCH-01 — reliquats (source) ═══');
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js'), SC = lire('screens.js');
  t('B-NP01-D source ① « demain » se date en jour LOCAL (`today(ts)`), jamais par `toISOString`',
    _corps(SC, '_planTomorrow').includes('S.nextPlanned={date:today(d.getTime()),label:\'\'};') && !/toISOString/.test(_corps(SC, '_planTomorrow')), 'date UTC');
  t('B-NP01-D source ② la phase du cycle compare deux DATES locales',
    _corps(ST, 'getMensCyclePhase').includes("const_jourLocal=today(ts==null?undefined:ts);"), 'instant brut');
};

module.exports.reliquats = async function (t, b, PORT) {
  console.log('\n-- B-NP01-D. NUT-PUNCH-01 — reliquats (conduit) --');
  const det = _det;
  /* ── D1 : deux moitiés de 7 jours, un squat de travail ET un échauffement dans chacune. ── */
  const X = await _ouvrir(b, PORT, '2026-10-03T20:00:00+02:00');
  const D1 = await X.pg.evaluate(async () => {
    __np.base({});
    const s = (dec, kgT, kgE) => { const x = __np.seance(__np.jour(dec), 18, 'vide');
      x.exs = [{ name: 'Squat à la Barre', sets: [{ kg: kgE, reps: 8, done: true, type: 'É' }, { kg: kgT, reps: 5, done: true, type: 'N' }, { kg: kgT, reps: 5, done: true, type: 'X' }] }];
      x.exercises = x.exs; return __np.ajouter(x); };
    s(-2, 100, 60); s(-9, 97.5, 40);
    const f = _forceSurFenetre(14), v = _volumeParMoitie(14);
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); renderNutrition();
    await new Promise(r => setTimeout(r, 200));
    const T = tendance14j();
    return { pct: f && f.pct, paires: f && f.paires, vol: v, force: T && T.force ? { pct: T.force.pct, decharge: T.force.decharge } : null };
  });
  t('B-NP01-D D1 ⭐⭐ la tendance de force ignore l\'échauffement `É` : une seule paire (squat × 5), +2,6 % (master : 2 paires, +26,3 % — le palier 40 → 60 kg comptait +50 %)',
    D1.pct === 2.6 && D1.paires === 1 && D1.force && D1.force.pct === 2.6, det(D1));
  t('B-NP01-D D1 ⭐ le garde-fou de volume compte les seules séries de travail (1 000 / 975 kg ; master : 1 480 / 1 295 avec les paliers) — la série `X` reste du travail',
    D1.vol && D1.vol.recent === 1000 && D1.vol.avant === 975, det(D1.vol));
  /* ── D4 : la tuile. ── */
  const D4 = await X.pg.evaluate(() => { const e = document.getElementById('nu-week-sess'); const l = e && e.parentElement.querySelector('.nu-stat-lbl');
    return { lbl: l ? l.textContent.trim() : null, val: e ? e.textContent : null }; });
  t('B-NP01-D D4 ⭐ la tuile dit « 7 derniers jours » (ce qu\'elle compte : 7 jours glissants) — master : « Cette semaine »',
    D4.lbl === '7 derniers jours' && /séance/.test(D4.val), det(D4));
  t('B-NP01-D D1/D4 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();

  /* ── D2 : début de cycle le 17/09 (28 j, ovulation J14) → J17 = phase lutéale à partir du 03/10. ── */
  const F = await _ouvrir(b, PORT, '2026-10-02T23:30:00+02:00');
  const lireF = () => F.pg.evaluate(() => { __np.base({ gender: 'F', bw: 60 }); S.mensCycleStart = '2026-09-17'; S.mensCycleDur = 28; S.contraception = '';
    const p = getMensCyclePhase(); return { phase: p && p.phase, jour: p && p.day, cible: calcMacros('charge').calories }; });
  const veille = await lireF();
  await F.heure('2026-10-03T00:30:00+02:00'); const nuit = await lireF();
  await F.heure('2026-10-03T09:00:00+02:00'); const matin = await lireF();
  await F.heure('2026-10-03T13:00:00+02:00'); const aprem = await lireF();
  t('B-NP01-D D2 ⭐⭐ la phase change à MINUIT : le 02/10 à 23 h 30 → Ovulation (J16) ; le 03/10 à 0 h 30, 9 h et 13 h → Lutéale (J17), MÊME cible toute la journée (master : ovulation jusqu\'à midi, +150 kcal à 13 h)',
    veille.phase === 'Ovulation' && veille.jour === 16 && [nuit, matin, aprem].every(x => x.phase === 'Lutéale' && x.jour === 17)
    && nuit.cible === matin.cible && matin.cible === aprem.cible && aprem.cible === veille.cible + 150, det([veille, nuit, matin, aprem]));
  t('B-NP01-D D2 aucune erreur de page', F.errs.length === 0, F.errs.slice(0, 2).join(' | '));
  await F.cx.close();

  /* ── D3 : « Séance demain » en UTC+14 (Kiribati), +13 (Tonga) et à Paris. ── */
  const demain = async (tz, quand) => {
    const Z = await _ouvrir(b, PORT, quand, { tz });
    const r = await Z.pg.evaluate(() => { __np.base({}); __np.historique([1, 3, 5], 'haut'); _planTomorrow();
      const d = new Date(today() + 'T12:00:00'); d.setDate(d.getDate() + 1);
      const attendu = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      return { aujourdhui: today(), annonce: S.nextPlanned && S.nextPlanned.date, attendu, js: jourSeance().source, disque: JSON.parse(localStorage.getItem('ft4_nextplanned') || 'null') }; });
    const errs = Z.errs.slice(); await Z.cx.close(); return Object.assign(r, { errs });
  };
  const k14 = await demain('Pacific/Kiritimati', '2026-10-03T09:00:00+14:00');
  const k13 = await demain('Pacific/Tongatapu', '2026-10-03T21:00:00+13:00');
  const par = await demain('Europe/Paris', '2026-10-03T21:00:00+02:00');
  const bon = x => x.annonce === x.attendu && x.annonce > x.aujourdhui && x.js === 'repos' && x.disque && x.disque.date === x.attendu && !x.errs.length;
  t('B-NP01-D D3 ⭐⭐ « Séance demain » en UTC+14 et UTC+13 : l\'annonce est datée de DEMAIN, aujourd\'hui reste un jour de repos (master : datée d\'aujourd\'hui)',
    bon(k14) && bon(k13), det([k14, k13]));
  t('B-NP01-D D3 ⛔ à Paris : inchangé (demain)', bon(par), det(par));
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   ── B-NP01-E — « TES REPAS HABITUELS » : UNE CARTE PAR FAMILLE (décision validée de Michel) ──
   Mesuré sur master ad172a87 (HAB1 : 40 shakers, 10 shaker + banane, 6 shaker + banane + cannelle,
   8 steak + riz, 5 poulet + pâtes) : 2 cartes de shaker sur 3, « Poulet + pâtes » absent, titres
   bruts « Iso zero protein (ASL) + Banane, chair sans peau, crue », « noté X fois » en tête.
   ⛔ C'est une VUE : aucun nom enregistré, aucune ligne du journal n'est modifiée (témoin E8).
   ══════════════════════════════════════════════════════════════════════════════════════ */
const _JOURNAL = `window.__npJ=function(spec){
  const L=[]; let ts=new Date(today()+'T08:00:00').getTime()-90*864e5;
  spec.forEach(([jours,meal,items])=>{ jours.forEach(dec=>items.forEach(it=>{
    const [name,kcal,prot,carbs,fat,ciq]=it;
    L.push(Object.assign({date:__np.jour(-dec),meal,name,kcal,prot,carbs,fat,ts:ts++,id:'np'+(ts)},
      ciq?{origine:'ciqual',saisie:'ciqual',sourceId:'ciqual:'+ciq}:{origine:'utilisateur',saisie:'manuel'})); })); });
  S.foodLog=L; persist(); return L.length;
};
window.__npR=n=>Array.from({length:n},(_,i)=>i+1);
window.__npA={W:['Iso zero protein (ASL)',156,35,1,1], B:['Banane, chair sans peau, crue',90,1,20,0,'13005'],
  C:['Cannelle, poudre',6,0,1,0,'11034'], ST:['Steak haché 5% MG, cuit',250,40,0,10,'6253'], RI:['Riz blanc, cuit',260,5,57,1,'9104'],
  PO:['Poulet, filet, cuit',165,31,0,4,'36018'], PA:['Pâtes alimentaires cuites',350,12,70,2,'9811'],
  OM:['Omelette nature',300,20,2,23], PN:['Pain complet',250,9,45,3], HU:['Huile d\\'olive',90,0,0,10],
  SA:['Salade verte',20,1,3,0], FR:['Fromage blanc 0%',90,15,6,0]};
window.__npHab=function(){
  goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
  switchNuTab('journal', document.getElementById('ntab-journal')); renderFoodJournal();
  const fj=document.getElementById('food-journal');
  return [...fj.querySelectorAll('button.hab-carte')].filter(b=>!b.closest('details.hab-variantes')).map(b=>{
    const titre=(b.querySelector('.hab-titre')||{}).textContent||'';
    let n=b.nextElementSibling; n=n&&n.nextElementSibling;
    const det=(n&&n.matches&&n.matches('details.hab-variantes'))?n:null;
    return {titre, texte:b.textContent.replace(/\\s+/g,' ').trim(),
      variantes: det?[...det.querySelectorAll('button.hab-carte .hab-titre')].map(x=>x.textContent):[],
      resume: det?(det.querySelector('summary')||{}).textContent:''};
  });
};`;

module.exports.sourceHabituels = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-E. NUT-PUNCH-01 — repas habituels par famille (source) ═══');
  const AP = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')).replace(/\s+/g, '');
  t('B-NP01-E source ① le rejeu cherche dans TOUTES les habitudes (une variante se rejoue), jamais dans le seul haut de liste',
    _corps(AP, 'rejouerRepas').includes('constr=_repasHabituelsTous().find(x=>x.sig===sig);'), 'rejeu limité au haut de liste');
  t('B-NP01-E source ② aucune écriture dans le journal pour regrouper : les familles se calculent, elles ne se stockent pas',
    !/S\.foodLog\s*=|foodLog\.(push|splice)|persist\(/.test(_corps(AP, '_repasHabituelsFamilles') + _corps(AP, '_habVariantes') + _corps(AP, '_habLibelles') + _corps(AP, '_repasHabituels')),
    'écriture dans le journal');
};

module.exports.habituels = async function (t, b, PORT) {
  console.log('\n-- B-NP01-E. NUT-PUNCH-01 — « Tes repas habituels » (conduit, vrais clics, rechargement, 390 px) --');
  const det = _det;
  const X = await _ouvrir(b, PORT, '2026-10-03T14:00:00+02:00');
  await X.pg.evaluate(_JOURNAL);
  const cas = (spec) => X.pg.evaluate((spec) => { __np.base({}); __npJ(eval(spec)); return __npHab(); }, spec);
  const HAB1 = `[[__npR(40),'collation2',[__npA.W]], [__npR(10),'petitdej',[__npA.W,__npA.B]], [[11,12,13,14,15,16],'petitdej',[__npA.W,__npA.B,__npA.C]],
                 [__npR(8),'dejeuner',[__npA.ST,__npA.RI]], [__npR(5),'diner',[__npA.PO,__npA.PA]], [[20,21,22],'diner',[__npA.OM]]]`;
  const h1 = await cas(HAB1);
  const whey = h1.filter(c => /Iso zero/.test(c.titre));
  t('B-NP01-E HAB1 ⭐⭐ UNE seule carte de la famille shaker (master : 2 sur 3), puis deux AUTRES familles (master : « Poulet + pâtes » absent)',
    h1.length === 3 && whey.length === 1 && h1[0].titre === 'Iso zero protein (ASL)'
    && h1[1].titre === 'Steak haché 5% MG + Riz blanc' && h1[2].titre === 'Poulet + Pâtes alimentaires cuites', det(h1.map(c => c.titre)));
  t('B-NP01-E HAB1 ⭐ les variantes restent ACCESSIBLES derrière la carte : « 2 variantes de ce repas » (shaker + banane, shaker + banane + cannelle)',
    whey.length === 1 && whey[0].resume.trim() === '2 variantes de ce repas'
    && det(whey[0].variantes) === det(['Iso zero protein (ASL) + Banane', 'Iso zero protein (ASL) + Banane + Cannelle']), det(whey[0]));
  t('B-NP01-E HAB1 ⭐ « noté X fois » n\'est plus sur la carte : l\'action d\'abord (+), le détail au tap',
    h1.every(c => !/noté \d+ fois/.test(c.texte) && /\+$/.test(c.texte)), det(h1.map(c => c.texte)));
  const h2 = await cas(`[[__npR(12),'collation2',[__npA.W]], [__npR(10),'dejeuner',[__npA.ST,__npA.RI]], [__npR(8),'petitdej',[__npA.OM,__npA.PN]]]`);
  t('B-NP01-E HAB2 ⭐ trois familles distinctes → trois cartes, aucune variante inventée',
    h2.length === 3 && new Set(h2.map(c => c.titre)).size === 3 && h2.every(c => !c.variantes.length), det(h2));
  const h3 = await cas(`[[__npR(20),'collation2',[__npA.W]], [[21,22,23,24,25,26,27,28],'petitdej',[__npA.W,__npA.B]], [[30,31,32,33],'petitdej',[__npA.W,__npA.B,__npA.C]]]`);
  t('B-NP01-E HAB3 ⭐ une seule famille → UNE carte + ses 2 variantes, aucun faux repas pour remplir',
    h3.length === 1 && h3[0].variantes.length === 2, det(h3));
  const h4 = await cas(`[[__npR(8),'dejeuner',[__npA.ST,__npA.RI,__npA.HU]], [__npR(6),'diner',[__npA.SA,__npA.HU]], [__npR(5),'collation',[__npA.HU]]]`);
  t('B-NP01-E HAB4 ⛔ un ingrédient mineur partagé ne fait PAS une famille : steak + riz + huile, salade + huile, huile seule → 3 cartes',
    h4.length === 3 && h4.every(c => !c.variantes.length), det(h4.map(c => c.titre)));
  /* Les bornes de la règle, sur la fonction elle-même. */
  const BO = await X.pg.evaluate(() => {
    const H = (...its) => ({ items: its.map(([name, kcal, prot]) => ({ name, kcal, prot })) });
    return {
      w_wb: _habVariantes(H(['Shaker', 156, 35]), H(['Shaker', 156, 35], ['Banane', 90, 1])),           // 97 % des protéines
      b_wb: _habVariantes(H(['Banane', 90, 1]), H(['Shaker', 156, 35], ['Banane', 90, 1])),             // 3 %
      r_pr: _habVariantes(H(['Riz', 260, 5]), H(['Poulet', 250, 31], ['Riz', 260, 5])),                 // 14 %
      h_sh: _habVariantes(H(['Huile', 90, 0]), H(['Salade', 20, 1], ['Huile', 90, 0])),                 // 0 % (82 % des kcal)
      o_op: _habVariantes(H(['Oeufs', 140, 12]), H(['Oeufs', 140, 12], ['Pain', 250, 9])),              // 57 %
      p_pt: _habVariantes(H(['Pâtes', 350, 12]), H(['Pâtes', 350, 12], ['Thon', 110, 25])),             // 32 %
      o_oo: _habVariantes(H(['Oeuf', 80, 6]), H(['Oeuf', 80, 6], ['Oeuf', 80, 6])),                     // mêmes aliments
      disj: _habVariantes(H(['Pâtes', 350, 12], ['Parmesan', 40, 4]), H(['Salade', 20, 1], ['Parmesan', 40, 4])),
      k_sans_p: _habVariantes(H(['Café', 2, 0]), H(['Café', 2, 0], ['Sucre', 20, 0])),                  // 0 g de protéines → 9 % des kcal
      cas0a: _habVariantes(H(['A', 0, 0]), H(['A', 0, 0], ['B', 0, 0])),                                // rien de chiffré : 1/2 aliments
      cas0b: _habVariantes(H(['A', 0, 0], ['B', 0, 0]), H(['A', 0, 0], ['B', 0, 0], ['C', 0, 0])),      // 2/3 aliments
      casse: _habVariantes(H(['Shaker', 156, 35]), H(['SHAKER ', 156, 35], ['Banane', 90, 1])),
      sym: _habVariantes(H(['Shaker', 156, 35], ['Banane', 90, 1]), H(['Shaker', 156, 35]))
    };
  });
  t('B-NP01-E bornes ⭐ part des PROTÉINES : shaker ⊂ shaker + banane (97 %) OUI · oeufs ⊂ oeufs + pain (57 %) OUI · banane ⊂ shaker + banane (3 %) NON · riz ⊂ poulet + riz (14 %) NON · pâtes ⊂ pâtes + thon (32 %) NON',
    BO.w_wb === true && BO.o_op === true && BO.b_wb === false && BO.r_pr === false && BO.p_pt === false, det(BO));
  t('B-NP01-E bornes ⛔ huile ⊂ salade + huile NON (0 % des protéines — 82 % des kcal : la raison d\'écarter les calories) · mêmes aliments OUI · disjoints NON',
    BO.h_sh === false && BO.o_oo === true && BO.disj === false, det(BO));
  t('B-NP01-E bornes ⭐ replis : sans protéines → calories (café ⊂ café + sucre, 9 % : NON) ; rien de chiffré → aliments (1/2 OUI à la moitié, 2/3 OUI) ; casse et espaces ignorés ; relation symétrique',
    BO.k_sans_p === false && BO.cas0a === true && BO.cas0b === true && BO.casse === true && BO.sym === true, det(BO));
  /* Libellés : court seulement pour un nom CIQUAL, et jamais s'il devient ambigu. */
  const lb = await cas(`[[__npR(6),'dejeuner',[['Pâtes, sauce maison',600,20,80,15],__npA.FR]], [__npR(5),'diner',[['Riz blanc, cuit',260,5,57,1,'9104'],__npA.PO]],
                         [[7,8,9,10],'dejeuner',[['Riz blanc, cru',350,7,77,1,'9100'],__npA.OM]]]`);
  t('B-NP01-E libellés ⛔ nom saisi à la main gardé ENTIER (« Pâtes, sauce maison ») ; deux noms CIQUAL au même début (« Riz blanc, cuit » / « Riz blanc, cru ») gardés entiers ; « Poulet, filet, cuit » → « Poulet »',
    lb.some(c => c.titre === 'Pâtes, sauce maison + Fromage blanc 0%') && lb.some(c => c.titre === 'Poulet + Riz blanc, cuit')
    && lb.some(c => c.titre === 'Omelette nature + Riz blanc, cru'), det(lb.map(c => c.titre)));
  /* Détail au tap, rejeu d'une VARIANTE par vrais clics, non-réécriture de l'historique, rechargement. */
  await cas(HAB1);
  const avant = await X.pg.evaluate(() => JSON.stringify(S.foodLog));
  const E7 = await X.pg.evaluate(async () => {
    const fj = document.getElementById('food-journal');
    const carte = fj.querySelector('button.hab-carte'); carte.click(); await new Promise(r => setTimeout(r, 120));
    const row = document.getElementById('hab-m-0');
    const o = { detail: (row.querySelector('.hab-detail') || {}).textContent || '', moments: row.querySelectorAll('button').length };
    const det0 = fj.querySelector('details.hab-variantes'); det0.querySelector('summary').click(); await new Promise(r => setTimeout(r, 80));
    o.ouvert = det0.open;
    const v1 = det0.querySelectorAll('button.hab-carte')[0]; v1.click(); await new Promise(r => setTimeout(r, 80));
    const rowV = document.getElementById('hab-m-0-0');
    o.rowV = !!rowV && getComputedStyle(rowV).display !== 'none' && getComputedStyle(row).display === 'none';
    const b = [...rowV.querySelectorAll('button')].find(x => /Déjeuner/.test(x.textContent)); b.click(); await new Promise(r => setTimeout(r, 200));
    const auj = S.foodLog.filter(e => e.date === today());
    o.ajout = auj.map(e => [e.name, e.meal, e.origine, e.saisie]);
    return o;
  });
  t('B-NP01-E détail ⭐ au tap : les noms COMPLETS enregistrés et « noté 40 fois » ; les 5 moments restent les 5 boutons de la rangée',
    /Iso zero protein \(ASL\)/.test(E7.detail) && /noté 40 fois/.test(E7.detail) && E7.moments === 5, det(E7));
  t('B-NP01-E variante ⭐⭐ rejouée par VRAIS clics (déroulant → variante → « Déjeuner ») : ses 2 aliments, au moment choisi, provenance « reprise »',
    E7.ouvert === true && E7.rowV === true && det(E7.ajout) === det([['Iso zero protein (ASL)', 'dejeuner', 'reprise', 'liste'], ['Banane, chair sans peau, crue', 'dejeuner', 'reprise', 'liste']]), det(E7));
  await X.recharger(); await X.pg.evaluate(_JOURNAL);
  const apres = await X.pg.evaluate(() => JSON.stringify(S.foodLog));
  const A0 = JSON.parse(avant), A1 = JSON.parse(apres);
  const memes = A0.every((e, i) => JSON.stringify(e) === JSON.stringify(A1[i]));
  const neuves = A1.slice(A0.length);
  t('B-NP01-E §14 ⛔⛔ HISTORIQUE NON RÉÉCRIT : après regroupement, rejeu et vrai rechargement, les ' + A0.length + ' lignes d\'avant sont identiques OCTET POUR OCTET, seules les 2 lignes voulues s\'ajoutent',
    memes && A1.length === A0.length + 2 && neuves.every(e => e.date === '2026-10-03' && e.origine === 'reprise'), det({ n0: A0.length, n1: A1.length, memes }));
  /* Après le rejeu (sur un AUTRE moment que d'habitude), la règle ft-v1062 garde la variante habituelle
     proposée (« ce qui est noté à midi n'empêche pas celui du matin ») : la famille garde UNE carte, ses
     2 variantes, et la ligne du jour ne crée AUCUNE carte de plus. */
  const apresRejeu = await X.pg.evaluate(() => __npHab());
  t('B-NP01-E ⛔ après un rejeu : toujours UNE carte de la famille et ses 2 variantes — la ligne du jour ne fabrique pas de doublon',
    apresRejeu.filter(c => /Iso zero/.test(c.titre)).length === 1 && apresRejeu[0].variantes.length === 2 && apresRejeu.length === 3, det(apresRejeu.map(c => [c.titre, c.variantes.length])));
  /* Rejeu d'une signature inconnue : rien n'est écrit. */
  const inconnu = await X.pg.evaluate(() => { const n = S.foodLog.length; rejouerRepas('n-existe-pas', 'midi'); return S.foodLog.length === n; });
  t('B-NP01-E ⛔ une signature inconnue n\'écrit rien', inconnu === true, String(inconnu));
  /* E′ — BUG FACTUEL trouvé en chemin (03/10) : un repas habituel dont un nom contient un guillemet
     « " » coupait l'attribut onclick du bouton de moment (master : `String(sig).replace(/'/g,…)`
     n'échappait que l'apostrophe) → erreur au clic, RIEN d'ajouté. Corrigé par l'utilitaire
     existant `_escAttrJs` (log.js), déjà employé partout ailleurs pour la même chose. */
  const EQ = await X.pg.evaluate(async () => {
    __np.base({});
    __npJ([[__npR(4), 'collation', [['Yaourt "nature" maison', 120, 8, 10, 4], ["Muesli d'avoine \\ miel", 200, 5, 35, 4]]]]);
    __npHab();
    const fj = document.getElementById('food-journal');
    const carte = fj.querySelector('button.hab-carte'); if (!carte) return { err: 'pas de carte' };
    carte.click(); await new Promise(r => setTimeout(r, 100));
    const btn = [...document.querySelectorAll('#hab-m-0 button')].find(b => /Déjeuner/.test(b.textContent));
    if (!btn) return { err: 'pas de bouton Déjeuner' };
    const n0 = S.foodLog.length; let err = null;
    try { btn.click(); } catch (e) { err = String(e).slice(0, 120); }
    await new Promise(r => setTimeout(r, 200));
    return { ajout: S.foodLog.slice(n0).map(e => [e.name, e.meal]), err };
  });
  t('B-NP01-E E′ ⭐ un nom avec un guillemet « " » et une barre « \\ » se rejoue par VRAI clic, noms intacts (master : erreur au clic, rien d\'ajouté)',
    !EQ.err && det(EQ.ajout) === det([['Yaourt "nature" maison', 'dejeuner'], ["Muesli d'avoine \\ miel", 'dejeuner']]), det(EQ));
  /* Déterminisme + 390 px : noms très longs, aucun débordement horizontal, titre tronqué proprement. */
  const hV = await X.pg.evaluate(() => { __np.base({}); __npJ([[__npR(20), 'collation2', [__npA.W]], [[21, 22, 23], 'petitdej', [__npA.W, __npA.B]]]); __npHab();
    const sv = document.querySelector('#food-journal details.hab-variantes > summary'); return sv ? Math.round(sv.getBoundingClientRect().height) : 0; });
  const L390 = await X.pg.evaluate(async () => {
    __np.base({});
    const long = 'Préparation culinaire à base de viande hachée de bœuf, sauce tomate, oignons et épices, surgelée, réchauffée';
    __npJ([[__npR(6), 'dejeuner', [[long, 520, 30, 40, 22], ['Riz blanc, cuit', 260, 5, 57, 1, '9104']]], [__npR(4), 'diner', [__npA.OM]]]);
    const a = JSON.stringify(_repasHabituels()), h = __npHab(), b2 = JSON.stringify(_repasHabituels());
    const fj = document.getElementById('food-journal'), c = fj.querySelector('button.hab-carte'), ti = c.querySelector('.hab-titre');
    return { stable: a === b2, deborde: document.documentElement.scrollWidth > window.innerWidth || fj.scrollWidth > fj.clientWidth,
      coupe: ti.scrollWidth > ti.clientWidth && getComputedStyle(ti).textOverflow === 'ellipsis', carteDansEcran: c.getBoundingClientRect().right <= window.innerWidth, n: h.length };
  });
  t('B-NP01-E 390 px ⭐ nom très long : titre tronqué par « … », carte dans l\'écran, aucun débordement horizontal ; deux calculs successifs identiques',
    L390.stable && !L390.deborde && L390.coupe && L390.carteDansEcran && L390.n === 2, det(L390));
  t('B-NP01-E 390 px ⭐ la ligne « N variantes de ce repas » est une vraie zone tactile (≥ 40 px de haut)', hV >= 40, 'hauteur ' + hV + ' px');
  t('B-NP01-E aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   ── B-NP01-F — « IL TE RESTE AUJOURD'HUI » : LES CHIFFRES D'ABORD, LES IDÉES SUR DEMANDE ──
   Mesuré sur master : le bloc « Ce qu'il te reste, en vrai » affichait D'OFFICE des équivalences
   (« 250 g de … + … ») et jamais le reste en kcal / P / G / L.
   ⛔ Décisions déjà actées et gardées : « kcal mangées » reste le gros chiffre (ft-v1102) ; rien sur
   un jour passé, rien si rien n'est noté, rien si la cible est atteinte ou dépassée ; jamais de
   négatif ; silence du soir après 20 h sans idée légère (ft-v1029).
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.sourceReste = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NP01-F. NUT-PUNCH-01 — « Il te reste aujourd\'hui » (source) ═══');
  const SC = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'screens.js'), 'utf8')).replace(/\s+/g, '');
  const bl = _corps(SC, '_blocResteHTML');
  t('B-NP01-F source ① le bloc lit le reste SOURCE (`_resteDuJour`) et se tait si rien n\'est noté ou si la cible est atteinte',
    bl.includes('if(!reste||reste.rien||!(reste.kcal>0))return\'\';'), 'garde absente');
  t('B-NP01-F source ② les idées vivent derrière un déroulant (`details`), jamais ouvert d\'office',
    _corps(SC, '_blocIdeesHTML').includes('<detailsclass="jr-secnu-reste-idees"') && !/nu-reste-idees"open|\bopen\b/.test(_corps(SC, '_blocIdeesHTML').replace('jr-sec', '')), 'idées affichées d\'office');
};

module.exports.reste = async function (t, b, PORT) {
  console.log('\n-- B-NP01-F. NUT-PUNCH-01 — « Il te reste aujourd\'hui » (écran du jour + Journal, 14 h et 21 h) --');
  const det = _det;
  const X = await _ouvrir(b, PORT, '2026-10-03T14:00:00+02:00');
  const etat = (aliments, heure) => X.pg.evaluate(async ([aliments, heure]) => {
    __np.base({});
    S.savedFoods = [{ name: 'Blanc de poulet', kcal: 165, prot: 31, carbs: 0, fat: 3.6, per100: { kcal: 110, prot: 23, carbs: 0, fat: 2.4 } },
                    { name: 'Riz basmati', kcal: 350, prot: 7, carbs: 77, fat: 1, per100: { kcal: 350, prot: 7, carbs: 77, fat: 1 } },
                    { name: 'Amandes', kcal: 180, prot: 6, carbs: 4, fat: 16, per100: { kcal: 600, prot: 21, carbs: 13, fat: 53 } }];
    let ts = Date.now() - 5e6;
    S.foodLog = aliments.map(([name, kcal, prot, carbs, fat]) => ({ date: today(), meal: 'dejeuner', name, kcal, prot, carbs, fat, ts: ts++, id: 'f' + ts }));
    persist();
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); switchNuTab('macros', document.getElementById('ntab-macros'));
    renderNutrition(); await new Promise(r => setTimeout(r, 120));
    const r = _resteDuJour(today()), card = document.getElementById('nu-today');
    const bloc = card.querySelector('.nu-reste'), det0 = bloc && bloc.querySelector('details.nu-reste-idees');
    const o = { r: r ? { kcal: r.kcal, P: r.prot, G: r.carbs, L: r.fat, rien: r.rien } : null, bloc: !!bloc,
      texte: bloc ? bloc.innerText.replace(/\s+/g, ' ').trim() : '', carte: card.innerText.replace(/\s+/g, ' ').trim(),
      chiffres: bloc ? [...bloc.querySelectorAll('.nu-reste-chiffres [title]')].map(x => x.title) : [],
      ideesFermees: det0 ? det0.open === false : null, ideesVisibles: det0 ? /Une idée, pas une consigne/.test(bloc.innerText) : null,
      hResume: det0 ? Math.round(det0.querySelector('summary').getBoundingClientRect().height) : null };
    if (det0) { det0.querySelector('summary').click(); await new Promise(r => setTimeout(r, 60)); o.apresOuverture = bloc.innerText.replace(/\s+/g, ' ').trim(); }
    /* Le Journal : même code, sans répéter les kcal de l'en-tête. */
    switchNuTab('journal', document.getElementById('ntab-journal')); renderFoodJournal(); await new Promise(r => setTimeout(r, 80));
    const fj = document.getElementById('food-journal'), bj = fj.querySelector('.nu-reste');
    o.journal = bj ? bj.innerText.replace(/\s+/g, ' ').trim() : null;
    o.journalEntete = (fj.innerText.match(/\d[\d\s ]* kcal (restantes|au-dessus)/) || [''])[0];
    o.deborde = document.documentElement.scrollWidth > window.innerWidth;
    switchNuTab('macros', document.getElementById('ntab-macros'));
    return o;
  }, [aliments, heure]);
  /* ① Journée partielle (14 h). */
  const p = await etat([['Flocons avoine', 380, 13, 60, 8], ['Riz basmati', 350, 7, 77, 1]]);
  const fr = n => n.toLocaleString('fr-FR').replace(/ /g, ' ');
  t('B-NP01-F ⭐⭐ journée partielle : « Il te reste aujourd\'hui ≈ X kcal · P · G · L », les nombres de `_resteDuJour` (calcul inchangé)',
    p.bloc && p.r && /^Il te reste aujourd'hui/i.test(p.texte) && p.texte.indexOf('≈ ' + fr(p.r.kcal) + ' kcal') >= 0
    && p.texte.indexOf('P ' + p.r.P + ' g') >= 0 && p.texte.indexOf('G ' + p.r.G + ' g') >= 0 && p.texte.indexOf('L ' + p.r.L + ' g') >= 0
    && det(p.chiffres) === det(['Protéines', 'Glucides', 'Lipides']), det(p));
  t('B-NP01-F ⭐⭐ les équivalences ne s\'affichent PAS d\'office : « Voir des idées pour compléter » est fermé, rien de « 250 g de … » à l\'écran',
    p.ideesFermees === true && p.ideesVisibles === false && /Voir des idées pour compléter/.test(p.texte) && !/\d+\s*g de [A-ZÉ]/.test(p.texte), det(p.texte));
  t('B-NP01-F ⭐ « Voir des idées pour compléter » est une vraie zone tactile (≥ 40 px de haut)', p.hResume >= 40, 'hauteur ' + p.hResume + ' px');
  t('B-NP01-F ⭐ un appui ouvre les idées (et leur mention « Une idée, pas une consigne »)',
    /Une idée, pas une consigne/.test(p.apresOuverture || '') && /[+]|g de/.test(p.apresOuverture || ''), (p.apresOuverture || '').slice(0, 200));
  const cb = p.carte.toLowerCase();   /* innerText rend les titres en majuscules (text-transform) */
  t('B-NP01-F ⛔ « kcal mangées » reste le gros chiffre de la carte (ft-v1102), le bloc vient APRÈS les anneaux',
    cb.indexOf('kcal mangées') >= 0 && cb.indexOf('kcal mangées') < cb.indexOf('protéines') && cb.indexOf('lipides') < cb.indexOf('il te reste aujourd'), p.carte.slice(0, 160));
  t('B-NP01-F ⭐ Journal : le MÊME bloc, sans répéter les kcal (l\'en-tête de la carte les dit déjà)',
    p.journal && /^Il te reste aujourd'hui/i.test(p.journal) && !/≈/.test(p.journal) && p.journal.indexOf('P ' + p.r.P + ' g') >= 0
    && /kcal restantes/.test(p.journalEntete), det([p.journal, p.journalEntete]));
  t('B-NP01-F 390 px : aucun débordement horizontal', p.deborde === false, String(p.deborde));
  /* ② Rien de noté. */
  const v = await etat([]);
  t('B-NP01-F ⛔ rien de noté : aucun bloc (ni carte du jour, ni Journal)', !v.bloc && v.journal === null, det(v));
  /* ③ Cible atteinte (exactement) puis dépassée. */
  const cible = p.r.kcal + 730;
  const at = await etat([['Repas', cible, 100, 300, 100]]);
  const dep = await etat([['Gros repas', cible + 900, 300, 400, 150]]);
  t('B-NP01-F ⛔ cible ATTEINTE pile : aucun « il te reste », aucun 0, aucun bloc', at.r && at.r.kcal === 0 && !at.bloc && at.journal === null, det(at));
  t('B-NP01-F ⛔ cible DÉPASSÉE : aucun bloc, aucun reproche (la carte garde « Un jour, pas une tendance »)',
    dep.r && dep.r.kcal < 0 && !dep.bloc && dep.journal === null && /pas une tendance/.test(dep.carte), det(dep));
  /* ④ Une macro atteinte (protéines dépassées), les autres restent ; aucun négatif. */
  const pa = await etat([['Shaker x4', 700, 190, 10, 5]]);
  t('B-NP01-F ⭐ une macro ATTEINTE pendant que les autres restent : « P atteint », G et L chiffrés, aucun nombre négatif',
    pa.r && pa.r.P < 0 && pa.r.G > 0 && /P atteint/.test(pa.texte) && pa.texte.indexOf('G ' + pa.r.G + ' g') >= 0 && !/[-−]\s?\d/.test(pa.texte), det(pa));
  t('B-NP01-F ⛔ aucun « 0 g » ni signe moins dans le bloc, dans aucun état', ![p, pa].some(x => /\b0 g\b|[-−]\s?\d/.test(x.texte)), det([p.texte, pa.texte]));
  /* ⑤ Le soir (21 h) : silence sans idée légère, et le pied « Il est tard » au dépliage quand il y en a une. */
  await X.heure('2026-10-03T21:00:00+02:00');
  /* Seul aliment à soi : un concombre — aucune portion légère ne couvre un quart d'un manque. */
  const muet = () => X.pg.evaluate(() => { __np.base({}); S.savedFoods = [];
    S.foodLog = [{ date: today(), meal: 'matin', name: 'Concombre', kcal: 16, prot: 1, carbs: 3, fat: 0.1, ts: Date.now() - 3e6, id: 'z1', per100: { kcal: 16, prot: 0.7, carbs: 3, fat: 0.1 } }];
    const r = _resteDuJour(today()); return { kcal: r.kcal, idees: _ideesPourLeReste(r).length, html: _blocResteHTML(today()) }; });
  await X.heure('2026-10-03T14:00:00+02:00');
  const jourMuet = await X.pg.evaluate(() => { __np.base({}); S.savedFoods = [];
    S.foodLog = [{ date: today(), meal: 'matin', name: 'Boisson', kcal: 40, prot: 0, carbs: 0, fat: 0, ts: Date.now() - 3e6, id: 'z0' }];
    const r = _resteDuJour(today()); return { kcal: r.kcal, idees: _ideesPourLeReste(r).length, html: _blocResteHTML(today()) }; });
  await X.heure('2026-10-03T21:00:00+02:00'); const soirMuet = await muet();
  t('B-NP01-F ⭐ 14 h sans aucune idée possible : les CHIFFRES s\'affichent quand même, sans « Voir des idées »',
    jourMuet.idees === 0 && /Il te reste aujourd/.test(jourMuet.html) && !/Voir des idées/.test(jourMuet.html), det({ idees: jourMuet.idees, html: jourMuet.html.slice(0, 80) }));
  const soir = await etat([['Flocons avoine', 380, 13, 60, 8], ['Riz basmati', 350, 7, 77, 1]]);
  t('B-NP01-F ⛔⛔ 21 h sans idée légère utile : SILENCE (règle du soir ft-v1029 gardée), même s\'il « reste » des chiffres',
    soirMuet.idees === 0 && soirMuet.html === '', det(soirMuet));
  const soirIdees = await X.pg.evaluate(() => _ideesPourLeReste(_resteDuJour(today())).map(i => i.macro));
  t('B-NP01-F ⭐ 21 h avec une idée légère : idées repliées ; au dépliage « Il est tard — une idée légère, pas un rattrapage »',
    soir.bloc && soir.ideesFermees === true && /pas un rattrapage/.test(soir.apresOuverture || ''), det(soir));
  t('B-NP01-F ⛔ 21 h (ft-v1029) : pas de total kcal, et SEULES les macros qu\'une idée légère complète encore sont nommées',
    soir.bloc && !/≈/.test(soir.texte) && soirIdees.length > 0 && soirIdees.length < 3
    && det(soir.chiffres) === det(['prot', 'carbs', 'fat'].filter(m => soirIdees.includes(m)).map(m => ({ prot: 'Protéines', carbs: 'Glucides', fat: 'Lipides' })[m])), det({ chiffres: soir.chiffres, soirIdees }));
  /* ⑥ Jour passé (Journal) : rien. */
  await X.heure('2026-10-03T14:00:00+02:00');
  /* ⚠️ La veille porte de VRAIS repas (sous la cible) : sans eux, le bloc se tairait de toute façon
     (« rien de noté ») et ce témoin ne pourrait pas rougir — la mutation MF7 l'a montré. */
  const passe = await X.pg.evaluate(async () => {
    const hier = __np.jour(-1); let ts = Date.now() - 864e5;
    S.foodLog = (S.foodLog || []).concat([['Flocons avoine', 380, 13, 60, 8], ['Riz basmati', 350, 7, 77, 1]]
      .map(([name, kcal, prot, carbs, fat]) => ({ date: hier, meal: 'dejeuner', name, kcal, prot, carbs, fat, ts: ts++, id: 'h' + ts })));
    persist(); journalNav(-1); await new Promise(r => setTimeout(r, 80));
    const fj = document.getElementById('food-journal'); const o = !!fj.querySelector('.nu-reste'); journalAllerA(today()); return o; });
  t('B-NP01-F ⛔ un jour PASSÉ n\'a jamais de bloc (anti-TCA)', passe === false, String(passe));
  /* ⑦ L'aide « ? » de l'onglet Nutrition (règle d'or #11, point 3) nomme le bloc tel qu'il s'affiche :
     « il te reste aujourd'hui ». Elle disait encore « ce qu'il te reste, en vrai » à un endroit (l'entrée
     du plan de repas) — R23 : une aide qui nomme un bloc disparu fait chercher ce qui n'existe plus.
     ⚠️ Les ANNONCES passées (`NEW_FEATURES` déjà publiées, constants.js) sont de l'histoire : pas relues. */
  const aide = await X.pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]')); await new Promise(r => setTimeout(r, 60));
    showHelp(); await new Promise(r => setTimeout(r, 60));
    const ov = document.getElementById('ov-help'), tx = (document.getElementById('help-content') || {}).textContent || '';
    const o = { ouverte: !!(ov && ov.classList.contains('open')), nouveau: (tx.match(/il te reste aujourd'hui/gi) || []).length, ancien: /il te reste, en vrai/i.test(tx) };
    closeHelp(); return o;
  });
  t('B-NP01-F ⭐ l\'aide « ? » de l\'onglet Nutrition, OUVERTE : « il te reste aujourd\'hui » partout, plus jamais « ce qu\'il te reste, en vrai »',
    aide.ouverte && aide.nouveau >= 3 && aide.ancien === false, det(aide));
  t('B-NP01-F aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
  await X.cx.close();
};
