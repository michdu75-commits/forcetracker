/* ═══════════════════════════════════════════════════════════════════════════════════════
   🧾 CONTRAT FT → MILO — « FORCE TRACKER CALCULE, MILO EXPLIQUE » (25/09/2026)

   Ce que Force Tracker AFFIRME à Milo, lu dans le contexte RÉELLEMENT construit
   (`buildCoachContext`), jamais dans un commentaire. ⛔ 0 appel Milo.
   Invariant central : quand l'app ne peut pas produire une valeur métier complète, elle
   n'envoie pas de quoi la reconstruire ; quand elle la produit, elle envoie le calcul ENTIER.
     CTX-01 activité absente : BMR présent, TDEE/cible absents, AUCUNE composante de cible.
     CTX-02 activité valide : décomposition complète, dont la somme retombe sur la cible (R8).
     CTX-03 travail : absent ≠ « Bureau » ; présent = connu, pas présenté comme manquant.
     CTX-04 programme structuré : vrais noms des jours, charge prévue, supersets, lien réalisé.
     CTX-05 programme NOM SEUL : annoncé comme tel, jamais comme « programme complet ».
     CTX-06 objectifs : réglages ACTUELS, source de vérité, priment sur la mémoire.
     CTX-07 historique : l'historique de l'objectif est marqué comme tel.
     CTX-08 absence : rien de synthétique n'est produit.
   ═══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8')).replace(/\s+/g, '');
  const ST = lire('state.js');
  console.log('\n═══ B-CCCLXXIII. CONTRAT FT → MILO — les propriétaires (source) ═══');
  t('B-CCCLXXIII ① la décomposition lit `_autoKcalBrut` (UNE formule, pas une copie)',
    /functioncibleDecomposition\(phase\)\{[\s\S]*?_autoKcalBrut\(phase,d\)/.test(ST), 'cibleDecomposition ne lit plus _autoKcalBrut');
  t('B-CCCLXXIII ② et se VÉRIFIE contre `calcMacros` (sinon null plutôt qu\'une fausse explication)',
    /if\(cible!==m\.calories\)returnnull;/.test(ST), 'garde de cohérence absente');
  t('B-CCCLXXIII ③ plus de « bureau » par défaut au chargement',
    !/S\.workType=localStorage\.getItem\('ft4_work'\)\|\|'bureau'/.test(ST) && /workType:null,/.test(ST), 'défaut silencieux revenu');
};

module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-20T12:00:00';
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1800);
  const R = await pg.evaluate(() => {
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_nphase: 'charge', ft4_ob2: '1', ft4_name: 'Test' };
    const ctx = (o, avant) => { localStorage.clear(); const D = Object.assign({}, BASE, o || {}); Object.keys(D).forEach(k => localStorage.setItem(k, D[k])); load();
      if (avant) avant(); return String(buildCoachContext('combien de calories ?')); };
    const ligne = (c, re) => (c.split('\n').find(l => re.test(l)) || '');
    const out = {};
    let c = ctx({ ft4_work: 'bureau' });
    out.abs = { bmr: ligne(c, /^- BMR:/), cible: ligne(c, /^- Calories cible:/), calc: ligne(c, /CALCUL DE LA CIBLE/), act: ligne(c, /Niveau activité sportive/),
                phase: (c.match(/\| Phase: [^\n|]*/) || [''])[0], neat: /kcal NEAT/.test(c), plus100: /\(\+100 kcal\)|\+100 kcal/.test(c), plus200: /\+200/.test(c) };
    c = ctx({ ft4_work: 'bureau', ft4_act: '1.55', ft4_act_src: 'choisi' });
    out.val = { cible: ligne(c, /^- Calories cible:/), calc: ligne(c, /CALCUL DE LA CIBLE/), vrai: calcMacros('charge').calories, tdee: calcTDEE(),
                phase: (c.match(/\| Phase: [^\n|]*/) || [''])[0] };
    c = ctx({ ft4_work: 'debout', ft4_act: '1.725', ft4_act_src: 'choisi', ft4_goal: 'perte', ft4_nphase: 'decharge' });
    out.val2 = { calc: ligne(c, /CALCUL DE LA CIBLE/), vrai: calcMacros('decharge').calories };
    c = ctx({ ft4_work: 'bureau', ft4_act: '1.55', ft4_act_src: 'choisi', ft4_manualkcal: '2500' });
    out.man = { calc: ligne(c, /CALCUL DE LA CIBLE/), fixe: ligne(c, /CIBLE FIXÉE À LA MAIN/) };
    c = ctx({});
    out.travAbs = { act: ligne(c, /Niveau activité sportive/), disque: localStorage.getItem('ft4_work'), wt: S.workType };
    persist(); out.travAbs.apresPersist = localStorage.getItem('ft4_work');
    c = ctx({ ft4_work: 'bureau', ft4_act: '1.55', ft4_act_src: 'choisi' });
    out.travBur = ligne(c, /Niveau activité sportive/);
    c = ctx({ ft4_work: 'bureau' }, () => {
      S.programmes = [{ name: 'Bloc 1 V2', weeks: 8, startDate: '2026-09-01', days: [
        { label: 'Push', exs: [{ name: 'Développé Couché', sets: [{ kg: 95, reps: 6 }, { kg: 95, reps: 6 }], group: 'A' }] },
        { label: 'Pull', exs: [{ name: 'Tractions', sets: [{ reps: 8 }] }] }] }];
      S.sessions = [{ date: '2026-09-19', progLabel: 'Push', exs: [] }]; });
    out.prog = c.slice(c.indexOf('SES PROGRAMMES'), c.indexOf('RECORDS PERSONNELS'));
    c = ctx({ ft4_work: 'bureau' }, () => { S.programmes = []; S.sessions = [{ date: '2026-09-19', progLabel: 'Bloc 1 V2', exs: [] }]; });
    out.nom = c.indexOf('SES PROGRAMMES') >= 0 ? c.slice(c.indexOf('SES PROGRAMMES'), c.indexOf('RECORDS PERSONNELS')) : '';
    c = ctx({ ft4_work: 'bureau' }, () => { S.programmes = []; S.sessions = []; });
    out.aucun = c.indexOf('SES PROGRAMMES') >= 0;
    c = ctx({ ft4_work: 'bureau' }, () => { S.strengthGoals = { 'Squat': 160 }; S.targetWeight = 78; });
    const io = c.indexOf('OBJECTIFS FIXÉS PAR'); out.obj = io >= 0 ? c.slice(io, io + 700) : '';
    c = ctx({ ft4_work: 'bureau' }, () => { S.strengthGoals = {}; S.targetWeight = 0; });
    out.objVide = io >= 0 ? (c.slice(c.indexOf('OBJECTIFS FIXÉS PAR'), c.indexOf('OBJECTIFS FIXÉS PAR') + 300)) : '';
    c = ctx({ ft4_work: 'bureau' }, () => { S.goalLog = [{ date: '2026-08-01', de: 'muscle', vers: 'force' }]; });
    out.hist = ligne(c, /SON OBJECTIF A CHANGÉ/);
    return out;
  });
  const somme = (l) => { const m = /TDEE (\d+) = BMR (\d+) × [\d,]+ « [^»]* » ≈ (\d+) ([+−]\d+) travail ([+−]\d+) autre sport ([+−]\d+) pas ; puis objectif « [^»]+» ([+−]\d+) ; phase \S+ ([+−]\d+)(?: ; phase lutéale ([+−]\d+))? = (\d+) kcal(?: → relevée au plancher de sécurité : (\d+) kcal)? → CIBLE (\d+) kcal/.exec(l);
    if (!m) return null; const v = s => s == null ? 0 : +String(s).replace('−', '-');
    return { tdee: +m[1], base: +m[3], travail: v(m[4]), sport: v(m[5]), pas: v(m[6]), goal: v(m[7]), phase: v(m[8]), lut: v(m[9]), brut: +m[10], plancher: m[11] ? +m[11] : null, cible: +m[12] }; };

  console.log('\n═══ B-CCCLXXIV. CONTRAT FT → MILO — ce que Milo reçoit (0 appel) ═══');
  t('CTX-01 activité absente → BMR PRÉSENT (donnée indépendante de l\'activité)', /BMR: 1718 kcal/.test(R.abs.bmr), R.abs.bmr.slice(0, 80));
  t('CTX-01 … TDEE et cible ABSENTS (« — »)', /TDEE: — kcal/.test(R.abs.bmr) && /Calories cible: — kcal/.test(R.abs.cible), R.abs.cible);
  t('CTX-01 … AUCUNE composante de cible exposée : ni ajustement de phase chiffré, ni delta d\'objectif, ni NEAT, ni ligne de calcul',
    !R.abs.plus100 && !R.abs.plus200 && !R.abs.neat && !R.abs.calc && R.abs.phase === '| Phase: Charge', JSON.stringify(R.abs));
  t('CTX-01 … l\'activité reste marquée absente', /NON RENSEIGNÉ/.test(R.abs.act), R.abs.act.slice(0, 80));
  const s1 = somme(R.val.calc);
  t('CTX-02 activité valide → la ligne de calcul existe et se lit ENTIÈREMENT', !!s1, R.val.calc);
  t('CTX-02 … R8 : TDEE + objectif + phase (+ lutéal) = brut, et la CIBLE est celle de l\'app',
    !!s1 && s1.tdee + s1.goal + s1.phase + s1.lut === s1.brut && s1.cible === R.val.vrai && s1.tdee === R.val.tdee && s1.goal === 200 && s1.phase === 100,
    JSON.stringify(s1) + ' vrai=' + R.val.vrai);
  t('CTX-02 … le TDEE lui-même se décompose (BMR × niveau + travail + autre sport + pas = TDEE)',
    !!s1 && s1.base + s1.travail + s1.sport + s1.pas === s1.tdee, JSON.stringify(s1));
  const s2 = somme(R.val2.calc);
  t('CTX-02 … vrai aussi sur un autre profil (Actif, debout, perte, décharge)',
    !!s2 && s2.tdee + s2.goal + s2.phase + s2.lut === s2.brut && s2.cible === R.val2.vrai && s2.travail === 200 && s2.phase === -100, R.val2.calc + ' vrai=' + R.val2.vrai);
  t('CTX-02 … cible MANUELLE : dite comme telle, sans fausse décomposition', !R.man.calc && /2500 kcal/.test(R.man.fixe) && /2963 kcal/.test(R.man.fixe), JSON.stringify(R.man));
  t('CTX-03 travail ABSENT → « NON RENSEIGNÉ », plus de « Bureau » par défaut, et rien écrit sur le disque',
    /Type travail: NON RENSEIGNÉ/.test(R.travAbs.act) && R.travAbs.wt === null && R.travAbs.disque === null && R.travAbs.apresPersist === null, JSON.stringify(R.travAbs));
  t('CTX-03 travail CONNU → transmis comme connu (pas manquant, ne pas le redemander)',
    /Type travail: Bureau\/Sédentaire \(enregistré dans son profil — ne le redemande pas\)/.test(R.travBur) && !/NON RENSEIGNÉ/.test(R.travBur.split('Type travail')[1] || ''), R.travBur);
  t('CTX-04 programme structuré → les VRAIS noms des jours (label), pas « Jour 1 »', /· Push : /.test(R.prog) && /· Pull : /.test(R.prog) && !/Jour 1/.test(R.prog), R.prog.slice(0, 200));
  t('CTX-04 … charge prévue, superset, durée et début transmis', /2×6 @95kg \[superset A\]/.test(R.prog) && /8 semaines, début 2026-09-01/.test(R.prog), R.prog.slice(0, 250));
  t('CTX-04 … ce que l\'app NE SAIT PAS est dit (actif, version, phase, progression, RIR cibles)',
    /CE QU'ELLE NE SAIT PAS : lequel est ACTIF aujourd'hui, sa version, sa phase, la progression prévue/.test(R.prog), R.prog.slice(0, 600));
  t('CTX-04 … prévu et réalisé distingués : la dernière séance réalisée est reliée par son NOM seulement',
    /Dernière séance RÉALISÉE rattachée à un libellé : « Push »/.test(R.prog) && /lien par le NOM seulement/.test(R.prog) && /C'est du PLANIFIÉ, pas du RÉALISÉ/.test(R.prog), R.prog.slice(-500));
  t('CTX-05 programme NOM SEUL → annoncé « NOM SEUL, structure INCONNUE », jamais comme programme complet',
    /AUCUN\./.test(R.nom) && /NOM SEUL : aucun programme enregistré ne porte ce nom, sa STRUCTURE est INCONNUE/.test(R.nom) && !/2×|@\d+kg/.test(R.nom), R.nom);
  t('CTX-06 objectifs → réglages ACTUELS de l\'app, source de vérité, qui priment sur la mémoire',
    /Squat: objectif 160 kg/.test(R.obj) && /Poids objectif: 78 kg/.test(R.obj) && /Réglages ACTUELS de l'app — la source de vérité/.test(R.obj) && /celui-ci prime/.test(R.obj), R.obj.slice(0, 400));
  t('CTX-07 historique de l\'objectif → marqué comme un CHANGEMENT passé, daté', /SON OBJECTIF A CHANGÉ/.test(R.hist), R.hist);
  t('CTX-08 absence → aucun objectif ni programme synthétique n\'est produit',
    /Aucun objectif chiffré fixé pour l'instant/.test(R.objVide) && !/source de vérité/.test(R.objVide) && R.aucun === false, JSON.stringify([R.objVide.slice(0, 120), R.aucun]));
  t('CTX ∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
  await cx.close();
};
