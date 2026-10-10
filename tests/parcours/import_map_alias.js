/* ═══ B-IMAPB (session-B). IMPORT-MAP-01B — LES ALIAS DÉCLARÉS NE CHANGENT PLUS LE MATÉRIEL ÉCRIT (10/10/2026) ═══
   Contre-vérification Nutrition d'IMPORT-MAP-01 : les alias COMPLETS de `_EX_EQUIV` passent AVANT le garde-fou
   matériel. « Rowing haltères » → Rowing Barre, « Hip thrust haltères » → Hip Thrust Barre, « Thruster haltères »
   → Thruster (barre) : la carte importée reprenait les charges, les séances et le record de la barre.
   ⭐ INVARIANT : un alias déclaré ne change jamais en silence le matériel explicitement écrit.
   ⭐⭐ VOCABULAIRE DE TEST INDÉPENDANT (exigence de la contre-vérification) : ni l'app ni l'ancien témoin ne
   lisaient « db » ; ce témoin a SON vocabulaire (db / bb / kb compris) et ne réutilise jamais `_materielDe`.
   Le matériel d'une CIBLE se lit dans le catalogue lui-même : son nom français, sinon une variante sœur qui
   écrit le matériel de la source, sinon son nom anglais (`EX_EN`). L'illustration n'est qu'un indice affiché.
   ⭐⭐ CE QUE LE CLIQUET MESURE (il remplace « ≤ 23 », qui laissait passer un échange d'alias dangereux) :
   pour chaque alias, si le rattachement AUTO contredit le matériel écrit, on RETIRE l'alias dans la page et on
   recommence. Si le résultat change, l'alias est la cause → ROUGE. S'il ne change pas, c'est le moteur
   (hors périmètre de ce lot) → dette nommée, liste figée. Une seule exception sémantique : « lat machine ». */

const nf = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const VOC = { smith: ['smith'], poulie: ['poulie', 'poulies', 'cable', 'cables'], machine: ['machine', 'machines', 'guide', 'guidee', 'guided'],
  kettlebell: ['kettlebell', 'kettlebells', 'kb'], halteres: ['haltere', 'halteres', 'dumbbell', 'dumbbells', 'db'], barre: ['barre', 'barbell', 'bb'] };
const ORDRE = ['smith', 'poulie', 'machine', 'kettlebell', 'halteres', 'barre'];
const MATW = new Set([].concat(...Object.values(VOC), ['bar']));
// Matériel ÉCRIT selon le TEST. « smith machine » → smith ; haltères ET barre → ambigu (jamais jugé).
function oracle(s) { const w = new Set(nf(s).split(' ')); const h = ORDRE.filter(c => VOC[c].some(x => w.has(x)));
  if (!h.length) return null; if (h.includes('halteres') && h.includes('barre')) return 'ambigu'; return h[0]; }
const STOPB = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'a', 'au', 'aux', 'en', 'sur', 'avec', 'l', 'd', 'et', 'the', 'with']);
const stem = w => w.length > 3 ? w.replace(/(es|s|x)$/, '') : w;
// Base d'un nom : sans parenthèse, sans mot de matériel, sans mot vide, au singulier approché.
const base = s => nf(String(s).replace(/\([^)]*\)/g, ' ')).split(' ').filter(w => w && !MATW.has(w) && !STOPB.has(w)).map(stem).sort().join(' ');
module.exports.oracle = oracle;

// L'unique exception sémantique : « lat machine » désigne le poste de tirage à la poulie haute (validée, documentée).
const EXCEPTIONS = { 'lat machine': 'Tirage Poulie Haute (Lat Pulldown)' };
/* Dette du MOTEUR (hors périmètre de 01B, le moteur IMPORT-MAP-01 n'est pas touché) : le nom anglais du catalogue
   dit un autre matériel, mais `_exEquip` ne le sait pas — retirer l'alias ne change RIEN, le moteur rattache pareil.
   Liste FIGÉE : une clé de plus = rouge ; une clé qui en sort parce que l'alias devient la cause = rouge (S1). */
const DETTE_MOTEUR = ['cable hip abduction', 'cable hip adduction', 'cable leg extension', 'leg extension poulie', 'dumbbell lunge', 'fentes halteres'];
// Retraits volontaires de 01B (R30) : aucune cible du bon matériel n'existe, ou plusieurs sont plausibles.
const RETIRES = ['cable leg curl', 'leg curl poulie', 'low cable leg curl', 'barbell step up', 'step up barre', 'cable kickback',
  'low cable knee extension', 'db lunge', 'rowing halteres', 'db row', 'dumbbell row'];

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-IMAPB-O (session-B). IMPORT-MAP-01B — le vocabulaire du TEST lit db / bb / kb ═══');
  const js = x => JSON.stringify(x).slice(0, 600);
  const O = [['db row', 'halteres'], ['dumbbell row', 'halteres'], ['Rowing haltères', 'halteres'], ['bb squat', 'barre'], ['barbell row', 'barre'],
    ['kb swing', 'kettlebell'], ['Thruster Kettlebell', 'kettlebell'], ['Smith Machine Squat', 'smith'], ['cable fly', 'poulie'], ['Écarté Poulie', 'poulie'],
    ['lat machine', 'machine'], ['Squat guidé', 'machine'], ['Développé Couché', null], ['Spider curl', null], ['debout', null], ['dbol', null]];
  const oKo = O.filter(([s, m]) => oracle(s) !== m);
  t('O ⭐ le vocabulaire du témoin lit db/dumbbell/haltères, bb/barbell/barre, kb/kettlebell, poulie/câble, machine/guidé, Smith — et ne lit rien dans un nom sans matériel',
    oKo.length === 0, js(oKo.map(([s, m]) => s + ' : attendu ' + m + ', lu ' + oracle(s))));

  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  const L = (name, sets, reps, kg) => ({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: '' });
  const PROG = { name: 'Programme IMPORT-MAP-01B', weeks: 0, startDate: '', days: [
    { label: 'Haltères', exercises: [L('Rowing haltères', 3, 10, 0), L('Hip thrust haltères', 3, 10, 0), L('Thruster haltères', 3, 10, 0)] },
    { label: 'Contrôle barre', exercises: [L('Rowing barre', 3, 8, 0), L('Hip thrust barre', 3, 8, 0), L('Thruster', 3, 8, 0)] },
  ] };
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  // Historique RÉEL des variantes BARRE : charges, séances, records.
  const ser = (kg, reps, n) => Array.from({ length: n }, () => ({ kg, reps, done: true, type: 'N', rm1: 0 }));
  const SESS = [{ id: 'imapb-1', date: '2026-10-02', exs: [{ name: 'Rowing Barre (Tirage Horizontal)', sets: ser(100, 8, 3) },
    { name: 'Hip Thrust Barre (Poussée de Hanche)', sets: ser(160, 8, 3) }, { name: 'Thruster', sets: ser(60, 8, 3) }] }];
  const PRS = { 'Rowing Barre (Tirage Horizontal)': { rm1: 125, kg: 100, reps: 8, date: '2026-10-02' },
    'Hip Thrust Barre (Poussée de Hanche)': { rm1: 200, kg: 160, reps: 8, date: '2026-10-02' }, 'Thruster': { rm1: 75, kg: 60, reps: 8, date: '2026-10-02' } };
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_imapb'))return; sessionStorage.setItem('_imapb','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999',
      ft4_sessions:${JSON.stringify(JSON.stringify(SESS))},ft4_prs:${JSON.stringify(JSON.stringify(PRS))}};
    Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  // Le catalogue tel que l'app le sert : nom français, nom anglais. (Pas de `_materielDe`, pas de `_exEquip`.)
  const CAT = await pg.evaluate(() => (EXLIB || []).map(e => [e.n, (typeof EX_EN !== 'undefined' && EX_EN[e.n]) || '']));
  const NOMS = [...new Set(CAT.map(c => c[0]))], EN = Object.fromEntries(CAT);
  // Matériel d'une CIBLE selon le catalogue : nom FR → variante sœur du matériel de la source → nom EN → inconnu.
  const matCible = (n, src) => { const fr = oracle(n); if (fr) return fr;
    const soeur = NOMS.find(x => x !== n && base(x) === base(n) && oracle(x) === src); if (soeur) return 'variante ' + soeur;
    return oracle(EN[n]) || null; };
  const contredit = (src, n) => { if (!src || src === 'ambigu' || !n) return false; const c = matCible(n, src); return !!c && c !== 'ambigu' && c !== src; };

  console.log('\n═══ B-IMAPB-A (session-B). IMPORT-MAP-01B — cas nommés ═══');
  const NOMMES = ['Rowing haltères', 'db row', 'dumbbell row', 'Hip thrust haltères', 'db hip thrust', 'Thruster haltères', 'machine overhead press',
    'extension nuque poulie', 'arm curl machine', 'machine triceps', 'rowing deux haltères', 'bent over dumbbell row', 'Rowing haltère', 'Rowing barre',
    'Squat Smith', 'DC', 'Bench press', 'DC Barre', 'Shoulder press machine', 'Peck deck machine', 'Pendulum squat machine', 'lat machine',
    'leg curl poulie', 'cable leg curl', 'step up barre', 'barbell step up', 'cable kickback', 'db lunge', 'low cable knee extension', 'spider db curl'];
  const M = await pg.evaluate(noms => { const o = {}; noms.forEach(n => { const r = _matchExercise(n) || {}; o[n] = { tier: r.tier, match: r.match || null, via: r.via || '' }; }); return o; }, NOMMES);
  const auto = (n, c) => M[n].tier === 'auto' && M[n].match === c;
  const jamaisAuto = (n, c) => !auto(n, c);
  const aff = n => n + ' → ' + M[n].tier + ' ' + M[n].match + ' [' + M[n].via + ']';
  const interdits = [['Rowing haltères', 'Rowing Barre (Tirage Horizontal)'], ['db row', 'Rowing Barre (Tirage Horizontal)'], ['dumbbell row', 'Rowing Barre (Tirage Horizontal)'],
    ['Hip thrust haltères', 'Hip Thrust Barre (Poussée de Hanche)'], ['db hip thrust', 'Hip Thrust Barre (Poussée de Hanche)'], ['Thruster haltères', 'Thruster'],
    ['machine overhead press', 'Développé Militaire'], ['extension nuque poulie', 'Extension Nuque Haltère'], ['arm curl machine', 'Curl Barre']];
  t('A1 ⛔⛔ Rowing haltères · db row · dumbbell row ↛ Rowing Barre · Hip thrust haltères · db hip thrust ↛ Hip Thrust Barre · Thruster haltères ↛ Thruster (barre) · machine overhead press ↛ Développé Militaire · extension nuque poulie ↛ …Haltère · arm curl machine ↛ Curl Barre (jamais en AUTO)',
    interdits.every(([n, c]) => jamaisAuto(n, c)), js(interdits.filter(([n, c]) => !jamaisAuto(n, c)).map(([n]) => aff(n))));
  const tous = Object.keys(M).filter(n => !(n in EXCEPTIONS)).filter(n => M[n].tier === 'auto' && contredit(oracle(n), M[n].match));
  t('A2 ⛔ aucun des noms ci-dessus (hors « lat machine ») n\'est rattaché en AUTO à une cible d\'un autre matériel', tous.length === 0, js(tous.map(aff)));
  const redirs = [['Hip thrust haltères', 'Hip Thrust Haltère (Poussée de Hanche)'], ['db hip thrust', 'Hip Thrust Haltère (Poussée de Hanche)'], ['Thruster haltères', 'Thrusters Haltères'],
    ['machine overhead press', 'Développé Épaules Machine'], ['extension nuque poulie', 'Extension Nuque Poulie Haute'], ['arm curl machine', 'Curl Pupitre Machine'],
    ['machine triceps', 'Triceps Machine'], ['rowing deux haltères', 'Rowing Haltères Buste Penché'], ['bent over dumbbell row', 'Rowing Haltères Buste Penché']];
  t('A3 ⭐ alias redirigés vers la SEULE cible du bon matériel du catalogue (AUTO conservé)', redirs.every(([n, c]) => auto(n, c)),
    js(redirs.filter(([n, c]) => !auto(n, c)).map(([n, c]) => aff(n) + ' (attendu ' + c + ')')));
  const surs = [['Rowing haltère', 'Rowing Haltère (Tirage Horizontal)'], ['Rowing barre', 'Rowing Barre (Tirage Horizontal)'], ['Squat Smith', 'Smith Machine Squat'],
    ['DC', 'Développé Couché'], ['Bench press', 'Développé Couché'], ['DC Barre', 'Développé Couché'], ['Shoulder press machine', 'Développé Épaules Machine'],
    ['Peck deck machine', 'Pec Deck'], ['Pendulum squat machine', 'Pendulum Squat'], ['spider db curl', 'Curl Araignée (Spider Curl)']];
  t('A4 ⭐ rapprochements sûrs préservés : Rowing haltère / barre · Squat Smith · DC · Bench press · DC Barre · Shoulder press machine · Peck deck machine · Pendulum squat machine · spider db curl (illustré aux haltères)',
    surs.every(([n, c]) => auto(n, c)), js(surs.filter(([n, c]) => !auto(n, c)).map(([n]) => aff(n))));
  t('A5 ⭐ exception sémantique documentée : « lat machine » → AUTO « Tirage Poulie Haute (Lat Pulldown) » (le poste de tirage EST la poulie haute)',
    auto('lat machine', EXCEPTIONS['lat machine']), aff('lat machine'));

  console.log('\n═══ B-IMAPB-R (session-B). IMPORT-MAP-01B — retraits volontaires (R30) ═══');
  const ret = await pg.evaluate(k => k.filter(x => x in _EX_EQUIV), RETIRES);
  t('R1 ⛔⛔ RETRAIT VOLONTAIRE — les ' + RETIRES.length + ' alias sans cible du bon matériel (ou à cible ambiguë) ne sont plus dans la table',
    ret.length === 0, js(ret));
  const sansCible = ['leg curl poulie', 'cable leg curl', 'step up barre', 'barbell step up', 'cable kickback', 'db lunge', 'low cable knee extension', 'db row', 'dumbbell row', 'Rowing haltères'];
  t('R2 ⛔ … et ces noms ne reçoivent jamais d\'identité AUTO (nouveau ou question, jamais un autre matériel en silence)',
    sansCible.every(n => M[n].tier !== 'auto'), js(sansCible.filter(n => M[n].tier === 'auto').map(aff)));

  console.log('\n═══ B-IMAPB-S (session-B). IMPORT-MAP-01B — CLIQUET STRICT : 0 alias contradictoire atteignable en AUTO ═══');
  const A = await pg.evaluate(() => Object.keys(_EX_EQUIV).map(k => {
    const r = _matchExercise(k) || {}; const v = _EX_EQUIV[k];
    const cur = (typeof exNomActuel === 'function') ? exNomActuel(v) : v;
    let r0 = null;
    if (r.tier === 'auto') { delete _EX_EQUIV[k]; try { const x = _matchExercise(k) || {}; r0 = { tier: x.tier, match: x.match || null }; } finally { _EX_EQUIV[k] = v; } }
    return { k, cible: cur, tier: r.tier, match: r.match || null, via: r.via || '', r0 };
  }));
  const ecrits = A.filter(a => oracle(a.k) && oracle(a.k) !== 'ambigu');
  const contra = ecrits.filter(a => a.tier === 'auto' && contredit(oracle(a.k), a.match));
  const exc = contra.filter(a => a.k in EXCEPTIONS);
  const moteur = contra.filter(a => !(a.k in EXCEPTIONS) && a.r0 && a.r0.tier === 'auto' && a.r0.match === a.match);
  const viol = contra.filter(a => !(a.k in EXCEPTIONS) && !moteur.includes(a));
  console.log('   ℹ️ ' + A.length + ' alias · ' + ecrits.length + ' écrivent un matériel (vocabulaire du test) · ' + contra.length + ' AUTO contradictoires : ' +
    exc.length + ' exception · ' + moteur.length + ' dette moteur · ' + viol.length + ' causés par l\'alias');
  const ab = ['db row', 'db hip thrust', 'spider db curl', 'bb squat', 'kb swing'].filter(k => A.some(a => a.k === k) && !ecrits.some(a => a.k === k));
  t('S0 le cliquet voit les abréviations : toute clé « db / bb / kb » présente dans la table est lue avec son matériel', ab.length === 0, js(ab));
  t('S1 ⛔⛔ CLIQUET STRICT — 0 alias dont le rattachement AUTO contredit le matériel écrit ET qui en est la cause (liste complète si rouge)',
    viol.length === 0, js(viol.map(a => a.k + ' → ' + a.match + ' (écrit ' + oracle(a.k) + ', cible ' + matCible(a.match, oracle(a.k)) + ')')));
  t('S2 ⛔ une seule exception, et c\'est « lat machine » (aucune exception ajoutée en silence)',
    Object.keys(EXCEPTIONS).length === 1 && exc.every(a => EXCEPTIONS[a.k] === a.match), js(exc.map(a => a.k + ' → ' + a.match)));
  const horsListe = moteur.filter(a => !DETTE_MOTEUR.includes(a.k));
  t('S3 ⛔ dette MOTEUR figée (retirer l\'alias n\'y change rien, `_exEquip` ignore le matériel du nom anglais) — aucune nouvelle clé',
    horsListe.length === 0, js(horsListe.map(a => a.k + ' → ' + a.match)));
  // Niveau DONNÉE : même un alias LATENT (un autre chemin gagne aujourd'hui) ne doit pas viser un autre matériel —
  // la recherche du sélecteur d'exercice lit `_EX_EQUIV` directement (« synonyme de salle »).
  const latents = ecrits.filter(a => !(a.k in EXCEPTIONS) && !DETTE_MOTEUR.includes(a.k) && contredit(oracle(a.k), a.cible));
  t('S4 ⛔ niveau DONNÉE : aucun alias, même latent, ne vise une cible d\'un autre matériel (hors exception et dette moteur figée)',
    latents.length === 0, js(latents.map(a => a.k + ' → ' + a.cible + ' [' + a.via + ']')));
  const reste = moteur.map(a => a.k + ' → ' + a.match);
  if (reste.length) console.log('   ℹ️ dette moteur (hors périmètre 01B) : ' + reste.join(' · '));

  console.log('\n═══ B-IMAPB-H (session-B). IMPORT-MAP-01B — historique par le VRAI chemin d\'import ═══');
  const H = await pg.evaluate(async () => {
    S.premium = true; _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos();
    finalImportProg();
    const iP = S.programmes.length - 1, prog = S.programmes[iP], jours = [];
    for (let d = 0; d < prog.days.length; d++) {
      S.wkt = null; try { _loadProgDayVraiment(iP, d); } catch (e) { jours.push({ err: e.message }); continue; }
      jours.push((S.wkt && S.wkt.exs || []).map(e => ({ name: e.name, kg: (e.sets || []).map(s => s.kg), prev: getPrev(e.name).map(s => s.kg), pr: !!(S.prs && S.prs[e.name]) })));
    }
    return { prog: prog.days.map(d => d.exs.map(e => e.name)), jours, custom: (S.customExercises || []).map(e => e.n) };
  });
  const J0 = H.jours[0] || [], J1 = H.jours[1] || [];
  const propre = (c, nomBarre, kg) => !!c && !!c.name && c.name !== nomBarre && !c.kg.includes(kg) && !c.prev.includes(kg) && !c.pr;
  const garde = (c, nomBarre, kg) => !!c && c.name === nomBarre && c.kg.every(k => k === kg) && c.prev.length === 3 && c.pr;
  t('H0 ⭐ témoin de mesure : « Rowing barre » importé garde son historique (100 kg, 3 séances, record)', garde(J1[0], 'Rowing Barre (Tirage Horizontal)', 100), js(J1[0]));
  t('H0b ⭐ témoin de mesure : « Hip thrust barre » importé garde son historique (160 kg, record)', garde(J1[1], 'Hip Thrust Barre (Poussée de Hanche)', 160), js(J1[1]));
  t('H0c témoin de mesure : « Thruster » (barre) garde son historique (60 kg, record)', garde(J1[2], 'Thruster', 60), js(J1[2]));
  t('H1 ⛔⛔ « Rowing haltères » importé : ni le nom, ni les 100 kg, ni les séances, ni le record de la barre', propre(J0[0], 'Rowing Barre (Tirage Horizontal)', 100), js(J0[0]));
  t('H2 ⛔⛔ « Hip thrust haltères » importé : ni le nom, ni les 160 kg, ni le record de la barre (rattaché à « Hip Thrust Haltère »)',
    propre(J0[1], 'Hip Thrust Barre (Poussée de Hanche)', 160) && J0[1].name === 'Hip Thrust Haltère (Poussée de Hanche)', js(J0[1]));
  t('H3 ⛔⛔ « Thruster haltères » importé : ni le nom, ni les 60 kg, ni le record du thruster barre (rattaché à « Thrusters Haltères »)',
    propre(J0[2], 'Thruster', 60) && J0[2].name === 'Thrusters Haltères', js(J0[2]));

  t('IMAPB-∅ aucune erreur de page, 0 appel réel', !errs.length && reels === 0, errs.join(' | ').slice(0, 300));
  try { await cx.close(); } catch (e) {}
};
