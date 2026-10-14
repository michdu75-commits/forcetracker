/* ══════════════════════════════════════════════════════════════════════════════════════
   🍽️ LOT 0 — CONTRAT SÉANCE → NUTRITION (bloc B-NP01-A)
   Porté sur master le 14/10/2026 (NUT-LOT0-CONTRAT, session-A, demande de Michel) depuis le seul
   sous-lot A de NUT-PUNCH-01 (`df6e9a1a`, 03/10/2026, session-B). ⛔ Les sous-lots B → F de
   NUT-PUNCH-01 (correctifs) ne sont PAS portés : ils vivent sur la branche `claude/nut-punch-01`.
   Le nom du fichier et l'identifiant du bloc sont gardés tels quels, exprès : un portage futur
   des sous-lots B → F s'ajoutera ICI, sans second fichier pour le même contrat (R2).

   ⛔ LOT 0 = CONTRAT, PAS POLITIQUE PRODUIT. Les valeurs attendues sont MESURÉES sur le code
   (master `ad172a87` le 03/10, re-mesurées sur `a0eab5b3` le 14/10), jamais choisies. Profils
   SYNTHÉTIQUES. 0 appel réseau hors localhost : tout est coupé ET compté.
   Contrôle négatif : `tools/mut_nut_punch01.py` (mutations DANS UNE COPIE, jamais dans le dépôt).

   CE QU'IL PROTÈGE (témoins, rouges s'ils cassent) — conduit dans Chromium, vrais `startWorkout` /
   `toggleSet` / `finishWorkout` / `clearWkt`, vrais rechargements : la date LOCALE (après minuit
   compris), `ts`, `startHour`, les noms d'exercices, `sets[].done`, les codes de série (N / É / X,
   et les anciens W / E / D qui doivent survivre sans perte), `cardioAvant` / `cardio`, `duration`,
   `importedHistory`, `S.wkt`, `S.nextPlanned`, l'ordre des séances, la persistance, aucune perte,
   aucun appel réseau.
   ⭐ ET SES CONTRÔLES NÉGATIFS : changer SEULEMENT la durée, le volume, la méthode (superset,
   dropset), la discipline ou le niveau ne change PAS la cible calorique.

   ⚠️ CE QU'IL NE JUGE PAS — les OBSERVATIONS (O1 → O10). Ce sont des comportements ACTUELS qui
   dépendent encore d'une décision produit (G5, G6…) ou d'un correctif futur. Chacune ENREGISTRE la
   valeur mesurée aujourd'hui ; elle n'est JAMAIS rouge :
     · mesure = valeur enregistrée → « ⓘ OBSERVATION … conforme au comportement actuel » ;
     · mesure ≠ valeur enregistrée → « ⚠️ LEVÉE — À RECLASSER » : quelqu'un a changé ce
       comportement (volontairement ou non) ; on relit, on décide, on reclasse — jamais en silence.
   Une observation n'est PAS une règle produit souhaitée : elle dit ce qui EST, pas ce qui DOIT ÊTRE.
     O1 la dernière séance du jour donne la région du jour (G6)
     O2 deux séances le même jour = deux événements (G1 / G6)
     O3 un bloc abdos séparé donne la région du jour (G5 / G6)
     O4 un cardio seul fait un jour de séance de région inconnue (G5)
     O5 une annonce est honorée par n'importe quelle séance (G5)
     O6 un programme actif, jour non annoncé = jour de repos (G5)
     O7 le cardio APRÈS une séance de musculation (champ `cardio`) : jour et région de la séance
     O8 les anciens codes W / E / D au rechargement (migration une seule fois, `ft4_stmig1`)
     O9 une annonce puis une séance annulée : l'annonce reste, le jour reste « annoncé » (G5)
     O10 ⚠️ ANOMALIE DE DÉCLENCHEMENT, À TRAITER DANS LE LOT B — l'écran Séance simplement affiché
         (ou le bouton central sans rien noter) fait du jour un jour de séance « en cours ».
         ⛔ Ce n'est PAS une décision G5 ni une règle produit : la définition existante d'une
         séance ouverte (`_seanceOuverte`, log.js) dit le contraire. Observé ici pour que le LOT B
         le corrige EN LE SACHANT. ⚠️ Le témoin ancien de `tests/calculs/runner.js` (« SÉANCE EN
         COURS … comptent aussi », fixture `S.wkt={…, exs:[]}`) s'appuie sur cet objet vide : le
         LOT B devra le requalifier (une séance en cours AVEC un exercice), sans en retirer l'intention.
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
/* Une OBSERVATION : jamais rouge. Elle compare la mesure du jour à la valeur ENREGISTRÉE (le
   comportement actuel, mesuré) et le DIT quand elle change — « LEVÉE — À RECLASSER ». */
const _levees = [];
const _obs = (id, nom, mesure, enregistre) => {
  const m = _det(mesure), e = _det(enregistre);
  if (m === e) console.log('   ⓘ OBSERVATION (jamais rouge) ' + id + ' ' + nom + ' — conforme au comportement actuel >> ' + m);
  else { _levees.push(id); console.log('   ⚠️ LEVÉE — À RECLASSER ' + id + ' ' + nom + ' >> enregistré ' + e + ' · mesuré ' + m); }
};
module.exports.levees = _levees;

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
  _levees.length = 0;
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

  /* ⓘ OBSERVATIONS O1 → O5 — mesurées, comparées à la valeur enregistrée, JAMAIS rouges. */
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
  _obs('O1', 'la DERNIÈRE séance du jour donne la région du jour (haut 10 h + jambes 18 h)', OB.O1, { region: 1.25, derniere: 'bas' });
  _obs('O2', 'deux séances le même jour = DEUX événements pour le compteur (jour, tuile 7 jours)', OB.O2, { evenementsAujourdhui: 2, tuile7j: 4 });
  _obs('O3', 'un bloc abdos SÉPARÉ après les jambes donne la région du jour', OB.O3, { region: 0.8, regionAbdos: 'tronc' });
  _obs('O4', 'un cardio SEUL fait un jour de séance (région inconnue)', OB.O4, { js: 'faite', regionCardio: null, facteur: 1 });
  _obs('O5', 'une annonce « Jambes » est HONORÉE par une séance de bras', OB.O5, { annonce: null, regionFaite: 'dos' });
  /* La sonde vivante ne juge AUCUNE observation : elle vérifie seulement que chacune a été mesurée
     (une valeur lue, pas `undefined`) — sinon une sonde morte passerait pour « conforme ». */
  t('B-NP01-A les observations O1 → O5 ont bien été MESURÉES (sonde vivante : 2 séances stockées aujourd\'hui, valeurs lues)',
    OB.O2.evenementsAujourdhui === 2 && typeof OB.O1.region === 'number' && typeof OB.O3.region === 'number'
    && typeof OB.O4.js === 'string' && 'annonce' in OB.O5 && OB.O5.regionFaite !== undefined, _det(OB));
  t('B-NP01-A observations : aucune erreur de page, aucun appel réseau pendant les calculs', O.errs.length === 0 && O.externes.length === reseauO, O.errs.concat(O.externes.slice(reseauO)).slice(0, 2).join(' | '));
  await O.cx.close();

  await _complementsLot0(t, b, PORT);
  console.log('   ⓘ OBSERVATIONS B-NP01-A : ' + (_levees.length ? _levees.length + ' LEVÉE(S) — À RECLASSER : ' + _levees.join(', ')
    : 'toutes conformes au comportement actuel enregistré') + ' (une observation n\'est jamais rouge)');
};

/* ═══ LOT 0 — les cinq compléments du 14/10/2026 (O6 → O10) et leurs témoins de contrat ═══ */
async function _complementsLot0(t, b, PORT) {
  console.log('\n-- B-NP01-A. LOT 0 — compléments (programme, cardio après, anciens codes, annulation, écran affiché) --');

  /* ── O6 : un programme ACTIF (sa période couvre aujourd'hui), jour NON annoncé. ── */
  const P = await _ouvrir(b, PORT, '2026-10-05T09:00:00+02:00');   // lundi matin
  const P6 = await P.pg.evaluate(() => {
    __np.base({}); __np.historique([1, 3, 5], 'haut');
    const ex = n => ({ name: n, sets: [{ kg: 50, reps: 10 }, { kg: 50, reps: 10 }] });
    S.programmes = [{ name: 'Programme test LOT 0', startDate: __np.jour(-14), weeks: 8,
      days: [{ label: 'Jambes', exercises: __np.EXS.jambes.map(ex) }, { label: 'Haut', exercises: __np.EXS.haut.map(ex) }] }];
    persist();
    const avant = JSON.stringify(S.programmes);
    const per = progPeriode(S.programmes[0]);
    const n = __np.nutri();
    const repas = getMeals(calcMacros('charge'), 'charge').map(m => m.name).join(' | ');
    return { actif: !!(per && per.start <= today() && today() <= per.end), n, repas, inchange: JSON.stringify(S.programmes) === avant, annonce: S.nextPlanned };
  });
  t('B-NP01-A O6 sonde vivante : le programme est bien ACTIF aujourd\'hui (sa période couvre le jour), aucune annonce, et le calcul Nutrition ne le modifie pas',
    P6.actif === true && P6.annonce === null && P6.inchange === true, _det({ actif: P6.actif, annonce: P6.annonce, inchange: P6.inchange }));
  _obs('O6', 'programme ACTIF, jour NON annoncé, rien fait → la Nutrition lit un jour de REPOS (le programme n\'est jamais lu)',
    { js: P6.n.js, cycle: P6.n.cycle && P6.n.cycle.jour, repasEntrainement: /entraînement/i.test(P6.repas) },
    { js: 'repos', cycle: 'repos', repasEntrainement: false });
  t('B-NP01-A O6 aucune erreur de page', P.errs.length === 0, P.errs.slice(0, 2).join(' | '));
  await P.cx.close();

  /* ── O7 : une vraie séance de jambes TERMINÉE AVEC un cardio APRÈS (champ `cardio`). ── */
  const C = await _ouvrir(b, PORT, '2026-10-05T17:55:00+02:00');
  await C.pg.evaluate(() => { __np.base({}); __np.historique([1, 3, 5], 'haut'); persist(); startWorkout();
    S.wkt.exs.push({ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }, { kg: 100, reps: 5, done: false, type: 'N' }] });
    S.wkt.exs.push({ name: 'Press Jambes 45°', sets: [{ kg: 160, reps: 10, done: false, type: 'N' }] });
    persist(); renderLog(); });
  await C.heure('2026-10-05T18:05:00+02:00'); await C.pg.evaluate(() => toggleSet(0, 0));
  await C.heure('2026-10-05T18:10:00+02:00'); await C.pg.evaluate(() => toggleSet(0, 1));
  await C.heure('2026-10-05T18:20:00+02:00'); await C.pg.evaluate(() => toggleSet(1, 0));
  await C.pg.evaluate(() => { S.wkt.cardio = { type: 'velo', intensity: 'modere', duration: 20 }; persist(); });
  await C.heure('2026-10-05T18:50:00+02:00');
  await C.pg.evaluate(async () => { await finishWorkout(); });
  await C.pg.waitForTimeout(300);
  const lireC = () => C.pg.evaluate(() => { const s = S.sessions.find(x => x.date === today()) || {};
    return { cardio: s.cardio || null, noms: (s.exs || []).map(e => e.name), done: (s.exs || []).map(e => e.sets.map(x => x.done)),
      date: s.date, startHour: s.startHour, nbJour: S.sessions.filter(x => x.date === today()).length,
      region: _calSessRegion(s), n: __np.nutri(), brut: JSON.stringify(S.sessions) }; });
  const C1 = await lireC();
  await C.recharger();
  const C2 = await lireC();
  t('B-NP01-A ⭐ cardio APRÈS la musculation : la séance garde ses exercices, ses séries validées ET son cardio (type, intensité, durée), datée du jour local',
    _det(C1.cardio) === _det({ type: 'velo', intensity: 'modere', duration: 20 }) && _det(C1.noms) === _det(['Squat à la Barre', 'Press Jambes 45°'])
    && _det(C1.done) === _det([[true, true], [true]]) && C1.date === '2026-10-05' && C1.startHour === 18 && C1.nbJour === 1, _det(C1));
  t('B-NP01-A ⛔ cardio après : rechargé, l\'historique revient OCTET POUR OCTET (cardio compris)', C2.brut === C1.brut, C2.brut.slice(0, 160));
  _obs('O7', 'cardio APRÈS une séance de jambes (même séance) → un seul événement, jour « fait », région de la musculation',
    { evenements: C2.nbJour, js: C2.n.js, regionSeance: C2.region, region: C2.n.cycle && C2.n.cycle.region },
    { evenements: 1, js: 'faite', regionSeance: 'bas', region: 1.25 });
  t('B-NP01-A O7 aucune erreur de page', C.errs.length === 0, C.errs.slice(0, 2).join(' | '));
  await C.cx.close();

  /* ── O8 : les ANCIENS codes W / E / D au rechargement. Deux chemins réels :
     a) téléphone DÉJÀ migré (drapeau `ft4_stmig1` posé) qui reçoit une vieille séance (restauration cloud) ;
     b) téléphone JAMAIS migré (drapeau absent) : la migration une fois pour toutes s'applique. ── */
  const W = await _ouvrir(b, PORT, '2026-10-05T12:00:00+02:00');
  const vieille = () => { const s = __np.seance(__np.jour(-2), 10, 'jambes');
    s.exs[0].sets = [{ kg: 40, reps: 10, done: true, type: 'W' }, { kg: 100, reps: 5, done: true, type: 'N' },
      { kg: 100, reps: 3, done: true, type: 'E' }, { kg: 70, reps: 8, done: true, type: 'D' }];
    s.exercises = s.exs.map(e => ({ name: e.name, sets: e.sets })); return s; };
  const lireW = () => W.pg.evaluate(() => { const s = S.sessions.find(x => x.date === __np.jour(-2)) || { exs: [] };
    const e = s.exs[0] || { sets: [] };
    return { types: e.sets.map(x => x.type), charges: e.sets.map(x => [x.kg, x.reps, x.done]), nbSeries: s.exs.reduce((a, x) => a + x.sets.length, 0),
      drapeau: localStorage.getItem('ft4_stmig1') }; });
  await W.pg.evaluate(new Function('v', '__np.base({}); __np.ajouter((' + vieille.toString() + ')()); persist();'));
  const Wa0 = await lireW();
  await W.recharger();
  const Wa = await lireW();
  await W.pg.evaluate(new Function('__np.base({}); __np.ajouter((' + vieille.toString() + ')()); persist(); localStorage.removeItem("ft4_stmig1");'));
  await W.recharger();
  const Wb = await lireW();
  const charges = _det([[40, 10, true], [100, 5, true], [100, 3, true], [70, 8, true]]);
  t('B-NP01-A ⛔ anciens codes W / E / D : aucune série, aucune charge, aucune répétition perdue au rechargement (téléphone migré ET non migré)',
    Wa0.nbSeries === 13 && Wa.nbSeries === Wa0.nbSeries && Wb.nbSeries === Wa0.nbSeries && _det(Wa.charges) === charges && _det(Wb.charges) === charges, _det({ Wa0, Wa, Wb }));
  _obs('O8', 'anciens codes W / E / D rechargés — a) téléphone déjà migré : codes gardés tels quels ; b) jamais migré : migration W→É, E→X, D→N',
    { dejaMigre: Wa.types, jamaisMigre: Wb.types, drapeauApres: Wb.drapeau },
    { dejaMigre: ['W', 'N', 'E', 'D'], jamaisMigre: ['É', 'N', 'X', 'N'], drapeauApres: '1' });
  t('B-NP01-A O8 aucune erreur de page', W.errs.length === 0, W.errs.slice(0, 2).join(' | '));
  await W.cx.close();

  /* ── O9 : une annonce du jour, une séance démarrée (une série validée), puis ANNULÉE par le vrai bouton. ── */
  const A = await _ouvrir(b, PORT, '2026-10-05T17:55:00+02:00');
  const reseauA = () => A.externes.length;
  const A9 = await A.pg.evaluate(() => { __np.base({}); __np.historique([1, 3, 5], 'haut');
    S.nextPlanned = { date: today(), label: 'Jambes' }; persist();
    const o = { nb0: S.sessions.length, brut0: JSON.stringify(S.sessions), annonce: __np.nutri().js };
    startWorkout(); S.wkt.exs.push({ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, done: false, type: 'N' }] }); persist(); renderLog();
    return o; });
  await A.heure('2026-10-05T18:05:00+02:00'); await A.pg.evaluate(() => toggleSet(0, 0));
  const A9e = await A.pg.evaluate(() => __np.nutri().js);
  const rA = reseauA();
  await A.pg.evaluate(() => clearWkt());
  await A.pg.click('#confirm-ok');
  await A.pg.waitForTimeout(300);
  const lireA = () => A.pg.evaluate(() => ({ nb: S.sessions.length, brut: JSON.stringify(S.sessions), wkt: S.wkt, ouverte: _seanceOuverte(),
    planned: plannedSession(), np: S.nextPlanned, n: __np.nutri() }));
  const A9a = await lireA();
  const rAnnul = reseauA() - rA;                     // mesuré AVANT le rechargement (qui, lui, amorce la page)
  await A.recharger();
  const A9r = await lireA();
  t('B-NP01-A ⛔ séance ANNULÉE (vrai bouton « Abandonner ») : aucune séance ajoutée à l\'historique, plus de séance ouverte — avant ET après rechargement',
    A9e === 'encours' && A9a.nb === A9.nb0 && A9a.brut === A9.brut0 && A9a.ouverte === false && A9r.nb === A9.nb0 && A9r.brut === A9.brut0 && A9r.ouverte === false,
    _det({ avant: A9e, nb0: A9.nb0, nb: A9a.nb, nbR: A9r.nb, ouverte: [A9a.ouverte, A9r.ouverte] }));
  t('B-NP01-A ⛔ annulation : aucun appel réseau', rAnnul === 0, 'appels : ' + rAnnul);
  /* ⚠️ Juste après l'annulation, le jour se lit « en cours » : `renderLog` recrée un objet de séance VIDE
     (la même anomalie de déclenchement que O10, à traiter dans le LOT B). Après rechargement : « annoncé ». */
  _obs('O9', 'annonce « Jambes » puis séance ANNULÉE → l\'annonce reste ; « en cours » juste après (objet vide recréé, cf. O10), « annoncé » après rechargement',
    { apres: A9a.n.js, objetVide: !!(A9a.wkt && !(A9a.wkt.exs || []).length), annonce: A9a.planned && A9a.planned.label, recharge: A9r.n.js, annonceRecharge: A9r.planned && A9r.planned.label },
    { apres: 'encours', objetVide: true, annonce: 'Jambes', recharge: 'annoncee', annonceRecharge: 'Jambes' });
  t('B-NP01-A O9 aucune erreur de page', A.errs.length === 0, A.errs.slice(0, 2).join(' | '));
  await A.cx.close();

  /* ── O10 : ⚠️ ANOMALIE DE DÉCLENCHEMENT (LOT B) — un jour de repos, l'écran Séance simplement AFFICHÉ.
     ⛔ Comportement factuel actuel, observé — ni une décision G5, ni une règle produit souhaitée. ── */
  /* Chaque mesure = [jour lu par la Nutrition, « séance ouverte » selon la définition existante
     `_seanceOuverte`, repas pré / post-entraînement affichés]. Mesuré le 14/10 : ['encours', false, true]
     — la Nutrition dit « en cours » là où la définition existante dit « pas de séance ouverte ». */
  const E = await _ouvrir(b, PORT, '2026-10-05T09:00:00+02:00');
  const lireE = () => E.pg.evaluate(() => { const n = __np.nutri();
    return { js: n.js, cycle: n.cycle && n.cycle.jour, nbSeances: S.sessions.length, ouverte: _seanceOuverte(),
      repasEntrainement: /entraînement/i.test(getMeals(calcMacros('charge'), 'charge').map(m => m.name).join(' | ')) }; });
  await E.pg.evaluate(() => { __np.base({}); __np.historique([1, 3, 5], 'haut'); persist(); });
  const e0 = await lireE();
  await E.pg.evaluate(() => goScreen('log', document.getElementById('nb-log'))); await E.pg.waitForTimeout(300);
  const e1 = await lireE();
  await E.pg.evaluate(() => persist()); await E.recharger();
  const e2 = await lireE();
  /* Le bouton central « + » tel qu'il est câblé (`onclick="startWorkout()"`), cliqué dans le DOM. */
  await E.pg.evaluate(() => { S.wkt = null; persist(); goScreen('home'); document.getElementById('nb-log').click(); });
  await E.pg.waitForTimeout(300);
  const e3 = await lireE();
  t('B-NP01-A O10 sonde vivante : AVANT l\'écran Séance, un vrai jour de repos (aucune séance du jour, aucune séance ouverte)',
    e0.js === 'repos' && e0.ouverte === false && e0.repasEntrainement === false, _det(e0));
  t('B-NP01-A ⛔ ni l\'affichage de l\'écran Séance ni le bouton central sans rien noter n\'ajoutent une séance à l\'historique',
    e1.nbSeances === e0.nbSeances && e2.nbSeances === e0.nbSeances && e3.nbSeances === e0.nbSeances, _det([e0.nbSeances, e1.nbSeances, e2.nbSeances, e3.nbSeances]));
  _obs('O10', '⚠️ ANOMALIE DE DÉCLENCHEMENT (à traiter dans le LOT B, PAS une décision G5) — écran Séance affiché / bouton central sans rien noter',
    { affiche: [e1.js, e1.ouverte, e1.repasEntrainement], apresRechargement: [e2.js, e2.ouverte, e2.repasEntrainement], boutonCentral: [e3.js, e3.ouverte, e3.repasEntrainement] },
    { affiche: ['encours', false, true], apresRechargement: ['encours', false, true], boutonCentral: ['encours', false, true] });
  t('B-NP01-A O10 aucune erreur de page', E.errs.length === 0, E.errs.slice(0, 2).join(' | '));
  await E.cx.close();
}

