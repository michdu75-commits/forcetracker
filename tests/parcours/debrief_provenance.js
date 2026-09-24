/* ══════════════════════════════════════════════════════════════════════════════════════
   🧠 LE DÉBRIEF DE MILO ET LA PROVENANCE DE SES FAITS (24/09/2026)

   Retour réel de Michel, capture à l'appui (débrief de fin de séance) :
     ① Larsen Press affichée 80×4 · 80×4 · 85×3 · 90×3 RIR1 — et Milo écrit « le saut 70→90
        est un peu abrupt » : il n'y a JAMAIS eu de passage de 70 à 90 ;
     ② 12 min de cardio faites en FIN de séance, qualifiées « ça sert l'échauffement » ;
     ③ Machine Oiseau + Marteau faits en SUPERSET, débriefés comme deux exercices isolés ;
     ④ hypothèse de Michel : le RIR n'est jamais proposé sur le PREMIER exercice du superset.

   ⛔ Les quatre étaient des HYPOTHÈSES. Ce fichier les mesure, puis fige ce qui a été corrigé.
   ⛔ ON NE TESTE PAS LE MODÈLE (aucun appel IA ici) : on teste ce que l'app lui DONNE — le
   contexte et la consigne. *Un modèle ne peut rattacher une conclusion qu'aux faits qu'on lui
   transmet ; un fait fabriqué par le code sera répété, un fait absent sera deviné.*
   ⛔ FICHIER À PART : le contrôle négatif (`tools/mut_debrief_provenance.py`) doit rejouer ses
   mutations en secondes, pas relancer une passe de 25 minutes.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const _corps = (A, n) => {
  const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(A);
  if (!m) return '';
  const i = m.index + m[0].length - 1;
  let d = 0;
  for (let j = i; j < A.length; j++) {
    if (A[j] === '{') d++;
    else if (A[j] === '}') { d--; if (!d) return A.slice(i, j + 1); }
  }
  return '';
};

module.exports.source = function (t, ROOT, fs, path) {
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const LG = lire('log.js'), CO = lire('coach.js');
  console.log('\n═══ B-CCCLVIII. Provenance du débrief — figée dans la source ═══');
  /* La règle de montée ne change pas : mêmes seuils (18 % ET 15 kg, 85 % au-dessus de 2 reps). */
  const MD = _corps(LG, '_monteeDefauts');
  t('B-CCCLVIII ① `_monteeDefauts` garde ses seuils (18 % et 15 kg, 85 %) — aucune règle inventée',
    /dKg\/T\s*>\s*0\.18\s*&&\s*dKg\s*>\s*15/.test(MD) && /k\s*>=\s*0\.85\s*\*\s*T\s*&&\s*r\s*>\s*2/.test(MD), MD === '' ? 'introuvable' : '');
  /* Le superset voyage jusqu'aux séances TERMINÉES du contexte, pas seulement la séance en cours. */
  t('B-CCCLVIII ② la ligne de séance terminée envoyée à Milo sait nommer un superset',
    /_supersetTxt|superset avec/.test(CO.slice(CO.indexOf('const recentSessions'), CO.indexOf('Aucune séance'))), '');
  /* Un seul endroit pose la question du RIR : la barre de repos — et elle peut viser PLUSIEURS séries. */
  t('B-CCCLVIII ③ la barre de repos peut porter la question du RIR pour plusieurs séries (superset)',
    /Array\.isArray\(_rirCible\)/.test(_corps(LG, '_renderRirRow')), '');
};

module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-24T10:00:00';
  const ouvrir = async () => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(`(()=>{const V=Date;if(!window.__T)window.__T=new V(${JSON.stringify(GEL)}).getTime();
      window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(window.__T);}static now(){return window.__T;}};})();`);
    await pg.addInitScript(`(()=>{try{ if(localStorage.getItem('_decorDbf')==='1')return; localStorage.clear();
      localStorage.setItem('_decorDbf','1');
      const D={ft4_bw:'86',ft4_age:'48',ft4_ht:'180',ft4_gender:'H',ft4_ob2:'1',ft4_name:'Michel'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pg.waitForTimeout(2200);
    await pg.evaluate(() => {
      window.toast = () => {}; window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
      window.__pause = ms => new Promise(r => setTimeout(r, ms));
      /* Une séance TERMINÉE, telle que `finishWorkout` l'enregistre (`sess.exs = S.wkt.exs`). */
      window.__seance = (exs, extra) => Object.assign({ id: Date.now(), ts: Date.now(), date: today(), exs,
        exercises: exs.map(e => ({ name: e.name, sets: e.sets })), volume: 1000, uniConv: 1, startHour: 10 }, extra || {});
      window.__S = (kg, reps, o) => Object.assign({ kg, reps, done: true, type: 'N' }, o || {});
      /* La ligne que Milo reçoit pour CETTE séance, et la consigne du débrief. */
      window.__ctx = (sess) => { S.sessions = [sess]; persist(); return buildCoachContext(''); };
      /* ⚠️ LA LIGNE DE LA SÉANCE, pas la première qui cite le nom : le contexte porte aussi le
         CATALOGUE d'exercices, qui contient « Larsen » et « Marteau » (défaut d'instrument
         attrapé au premier passage — le témoin lisait le catalogue). */
      window.__ligne = (ctx, nom) => ctx.split('\n').find(l => /\(\d+ exercices?\): /.test(l) && l.indexOf(nom) >= 0) || '';
    });
    return { cx, pg, errs };
  };
  const sur = (o, k) => (o && typeof o === 'object') ? o[k] : undefined;
  const LARSEN = 'Développé Couché Larsen (Larsen Press)';

  console.log('\n-- B-CCCLIX. Le débrief de Milo reçoit des faits avec leur provenance (conduit) --');
  { const { cx, pg, errs } = await ouvrir();
    const R = await pg.evaluate((LARSEN) => {
      const o = {};
      try {
        /* ── E. Larsen : échauffement séparé, séries de travail montantes ── */
        const larsen = [__S(40, 5, { type: 'É' }), __S(55, 3, { type: 'É' }), __S(70, 2, { type: 'É' }),
                        __S(80, 4), __S(80, 4), __S(85, 3), __S(90, 3, { rir: 1 })];
        const sE = __seance([{ name: LARSEN, sets: larsen }]);
        const cE = __ctx(sE);
        o.eLigne = __ligne(cE, 'Larsen').slice(0, 500);
        o.eLocal = _debriefLocal(sE, 0, {});
        /* contrôle sain : un VRAI saut (50 → 90 directement) reste signalé */
        const sE2 = __seance([{ name: LARSEN, sets: [__S(40, 5, { type: 'É' }), __S(50, 3, { type: 'É' }),
                        __S(90, 3), __S(90, 3), __S(90, 3)] }]);
        o.e2Ligne = __ligne(__ctx(sE2), 'Larsen').slice(0, 500);
        /* ── A. superset avec deux RIR ── */
        const sA = __seance([
          { name: 'Machine Oiseau', group: 'ssT', groupType: 'super', sets: [__S(35, 12, { rir: 1 }), __S(35, 12, { rir: 1 })] },
          { name: 'Marteau', group: 'ssT', groupType: 'super', sets: [__S(40, 8, { rir: 2 }), __S(40, 8, { rir: 2 })] }]);
        const lA = __ligne(__ctx(sA), 'Machine Oiseau');
        o.aOiseau = (lA.match(/Machine Oiseau[^·]*(·[^·]*){0,1}/) || [''])[0];
        o.aLigne = lA.slice(0, 600);
        /* ── B. superset, RIR absent sur l'Oiseau ── */
        const sB = __seance([
          { name: 'Machine Oiseau', group: 'ssT', groupType: 'super', sets: [__S(35, 12), __S(35, 12)] },
          { name: 'Marteau', group: 'ssT', groupType: 'super', sets: [__S(40, 8, { rir: 2 }), __S(40, 8, { rir: 2 })] }]);
        o.bLigne = __ligne(__ctx(sB), 'Machine Oiseau').slice(0, 600);
        /* ── F. mêmes exercices SANS relation superset : rien ne doit l'inventer ── */
        const sF = __seance([{ name: 'Machine Oiseau', sets: [__S(35, 12)] }, { name: 'Marteau', sets: [__S(40, 8)] }]);
        o.fLigne = __ligne(__ctx(sF), 'Machine Oiseau').slice(0, 600);
        /* ── F2. un DROPSET est un groupe, mais pas un superset ── */
        const sF2 = __seance([{ name: 'Marteau', group: 'dsT', groupType: 'drop', sets: [__S(40, 8)] },
                              { name: 'Machine Oiseau', group: 'dsT', groupType: 'drop', sets: [__S(30, 8)] }]);
        o.f2Ligne = __ligne(__ctx(sF2), 'Machine Oiseau').slice(0, 600);
        /* ── C / D. cardio après / avant ── */
        const muscu = [{ name: LARSEN, sets: [__S(80, 5)] }];
        const sC = __seance(muscu, { cardio: { type: 'elliptique', intensity: 'modere', duration: 12 } });
        o.cLigne = __ligne(__ctx(sC), 'Larsen');
        o.cConsigne = _seCardioTxt(sC);
        const sD = __seance(muscu, { cardioAvant: { type: 'elliptique', intensity: 'modere', duration: 12 } });
        o.dLigne = __ligne(__ctx(sD), 'Larsen');
        o.dConsigne = _seCardioTxt(sD);
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    }, LARSEN);
    const E = sur(R, 'eLigne') || '';
    t('B-CCCLIX E1 ⭐⭐ Larsen : la ligne de Milo ne fabrique pas un « saut entre 70 et 90 kg »',
      E !== '' && !/entre 70 et 90/.test(E), E.slice(0, 260) + (sur(R, 'err') ? ' ERR ' + R.err : ''));
    t('B-CCCLIX E2 … ni le débrief chiffré local',
      !/entre 70 et 90/.test(sur(R, 'eLocal') || ''), (sur(R, 'eLocal') || '').replace(/<[^>]+>/g, ' ').slice(0, 200));
    t('B-CCCLIX E3 contrôle sain : les séries de travail restent dans l\'ordre, échauffements marqués',
      /É 70×2 · S1 80×4 · S2 80×4 · S3 85×3 · S4 90×3 RIR1/.test(E), E.slice(0, 260));
    t('B-CCCLIX E4 contrôle sain : un VRAI saut (50 → 90 d\'un coup) est toujours signalé',
      /entre 50 et 90/.test(sur(R, 'e2Ligne') || ''), (sur(R, 'e2Ligne') || '').slice(0, 260));
    const A = sur(R, 'aLigne') || '';
    t('B-CCCLIX A1 ⭐⭐ superset : la ligne de Milo dit que l\'Oiseau et le Marteau sont ENCHAÎNÉS',
      /Machine Oiseau[^·]*superset[^·]*Marteau/i.test(A) && /Marteau[^·]*superset[^·]*Machine Oiseau/i.test(A), A.slice(0, 400));
    t('B-CCCLIX A2 chaque RIR reste sur SON exercice (RIR1 Oiseau, RIR2 Marteau)',
      /Machine Oiseau[^·]*: S1 35×12 RIR1 · S2 35×12 RIR1/.test(A) && /Marteau[^·]*: S1 40×8 RIR2 · S2 40×8 RIR2/.test(A), A.slice(0, 400));
    const B = sur(R, 'bLigne') || '';
    t('B-CCCLIX B1 RIR absent sur l\'Oiseau : aucun RIR ne lui est attribué',
      /Machine Oiseau[^·]*: S1 35×12 · S2 35×12 · Marteau/.test(B) && /Marteau[^·]*: S1 40×8 RIR2/.test(B), B.slice(0, 400));
    const F = sur(R, 'fLigne') || '';
    t('B-CCCLIX F1 sans relation enregistrée, aucun superset n\'est inventé',
      F !== '' && !/superset/i.test(F), F.slice(0, 300));
    t('B-CCCLIX F2 un dropset (groupe d\'un autre type) n\'est pas présenté comme un superset',
      (sur(R, 'f2Ligne') || '') !== '' && !/superset/i.test(sur(R, 'f2Ligne') || ''), (sur(R, 'f2Ligne') || '').slice(0, 300));
    t('B-CCCLIX C1 cardio de FIN : la ligne et la consigne disent « après séance », jamais « échauffement »',
      /cardio: après séance/.test(sur(R, 'cLigne') || '') && !/échauffement/.test((sur(R, 'cLigne') || '').split('cardio:')[1] || 'x')
        && /^après séance/.test(sur(R, 'cConsigne') || ''), (sur(R, 'cLigne') || '').slice(-80) + ' | ' + sur(R, 'cConsigne'));
    t('B-CCCLIX D1 cardio d\'ÉCHAUFFEMENT : la ligne et la consigne disent « échauffement »',
      /cardio: échauffement/.test(sur(R, 'dLigne') || '') && /^échauffement/.test(sur(R, 'dConsigne') || ''),
      (sur(R, 'dLigne') || '').slice(-80) + ' | ' + sur(R, 'dConsigne'));
    t('B-CCCLIX ∅ aucune erreur de page', errs.length === 0 && !sur(R, 'err'), errs.concat(sur(R, 'err') || []).slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ L'INTERFACE : le RIR est-il proposé au PREMIER exercice d'un superset ? ══ */
  { const { cx, pg, errs } = await ouvrir();
    const U = await pg.evaluate(async () => {
      const o = {};
      try {
        S.wkt = { date: today(), progLabel: 'Test', startHour: 10, exs: [
          { name: 'Machine Oiseau', group: 'ssT', groupType: 'super', sets: [{ kg: 35, reps: 12, done: false, type: 'N' }, { kg: 35, reps: 12, done: false, type: 'N' }] },
          { name: 'Marteau', group: 'ssT', groupType: 'super', sets: [{ kg: 40, reps: 8, done: false, type: 'N' }, { kg: 40, reps: 8, done: false, type: 'N' }] }] };
        persist(); goScreen('log', document.getElementById('nb-log')); await __pause(300);
        toggleSet(0, 0); await __pause(150);
        o.apresOiseau = (document.getElementById('rest-rir') || {}).innerHTML || '';
        toggleSet(1, 0); await __pause(150);
        const z = (document.getElementById('rest-rir') || {}).innerHTML || '';
        o.oiseauPropose = /setRir\(0,0,/.test(z);
        o.marteauPropose = /setRir\(1,0,/.test(z);
        o.nomsVisibles = /Machine Oiseau/.test(z) && /Marteau/.test(z);
        if (o.oiseauPropose) setRir(0, 0, 1);
        if (o.marteauPropose) setRir(1, 0, 2);
        o.rirOiseau = S.wkt.exs[0].sets[0].rir; o.rirMarteau = S.wkt.exs[1].sets[0].rir;
        /* hors superset : la question reste la même, une seule série, sans nom ajouté */
        S.wkt.exs.push({ name: 'Marteau', sets: [{ kg: 40, reps: 8, done: false, type: 'N' }] });
        stopRest(); toggleSet(2, 0); await __pause(150);
        const z2 = (document.getElementById('rest-rir') || {}).innerHTML || '';
        o.seulUneCible = (z2.match(/setRir\(2,0,/g) || []).length >= 1 && !/setRir\([01],/.test(z2) && !/rir-nom/.test(z2);
        stopRest();
        /* une série de superset EN ATTENTE ne suit pas une série d'un autre exercice hors groupe */
        toggleSet(0, 1); await __pause(100);           // Oiseau, 2ᵉ tour : avance sans repos
        S.wkt.exs[2].sets.push({ kg: 40, reps: 8, done: false, type: 'N' });
        toggleSet(2, 1); await __pause(150);           // Marteau SEUL, hors superset
        const z3 = (document.getElementById('rest-rir') || {}).innerHTML || '';
        o.horsGroupe = /setRir\(2,1,/.test(z3) && !/setRir\(0,/.test(z3);
        stopRest();
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    await pg.reload(); await pg.waitForTimeout(2200);
    const apres = await pg.evaluate(() => ({ o: ((S.wkt || {}).exs || [])[0] && S.wkt.exs[0].sets[0].rir,
                                             m: ((S.wkt || {}).exs || [])[1] && S.wkt.exs[1].sets[0].rir }));
    t('B-CCCLIX U1 contrôle : le superset avance sans repos après l\'Oiseau (aucune question à ce moment)',
      sur(U, 'apresOiseau') === '', (sur(U, 'apresOiseau') || '').slice(0, 120) + (sur(U, 'err') ? ' ERR ' + U.err : ''));
    t('B-CCCLIX U2 ⭐⭐ au repos du tour, le RIR est proposé pour l\'OISEAU aussi, pas seulement le Marteau',
      sur(U, 'oiseauPropose') === true && sur(U, 'marteauPropose') === true, JSON.stringify(U));
    t('B-CCCLIX U3 … et chaque ligne dit de quel exercice il s\'agit',
      sur(U, 'nomsVisibles') === true, '');
    t('B-CCCLIX U4 ⭐ chaque RIR est enregistré sur SA série (1 Oiseau, 2 Marteau)',
      sur(U, 'rirOiseau') === 1 && sur(U, 'rirMarteau') === 2, sur(U, 'rirOiseau') + ' / ' + sur(U, 'rirMarteau'));
    t('B-CCCLIX U5 … et survit au rechargement', sur(apres, 'o') === 1 && sur(apres, 'm') === 2, JSON.stringify(apres));
    t('B-CCCLIX U6 contrôle sain : hors superset, la question vise UNE série, sans nom ajouté',
      sur(U, 'seulUneCible') === true, '');
    t('B-CCCLIX U7 une série hors du groupe ne récupère pas la question d\'une série de superset',
      sur(U, 'horsGroupe') === true, '');
    t('B-CCCLIX U∅ aucune erreur de page', errs.length === 0 && !sur(U, 'err'), errs.concat(sur(U, 'err') || []).slice(0, 2).join(' | '));
    await cx.close(); }
};
