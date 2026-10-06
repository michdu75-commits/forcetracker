/* ═══════════════════════════════════════════════════════════════════════════════════════════
   📥 IMPORT-ECH-01 — échauffement + séries de travail d'un même exercice = UN exercice (session-B · 06/10/2026)
   Blocs : B-IW-E (écran conduit). CONDUIT : la vraie chaîne d'import — `analyzeImportPhotos` (réponse du Worker
   simulée, à la FORME exacte de `importDoc` 'program' : une ligne du document = un exercice, nom nu, « échauffement »
   en note comme le prompt du Worker l'exige), `_mergeImportSeances`, `_mergeImportEchauffements`, le regroupement des
   blocs, `_vmMatchExtracted`, l'aperçu `_renderImpConfirm`, `finalImportProg`, puis `loadProgDay` (la séance).
   OBSERVE : le programme créé (exercices, séries, charges, reps, type É/N, repos, note, ordre), les exercices perso
   créés, la séance chargée et ses avertissements (« Déjà présent ailleurs dans cette séance »).
   ⛔ 0 appel réel (Worker et Apps Script simulés). NE COUVRE PAS : le modèle réel (ce qu'il renvoie vraiment pour un
   document donné), Safari iOS. Banc : tools/banc_import_echauffement.js · contrôle négatif : tools/mut_import_echauffement.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-IW-E (session-B). IMPORT-ECH-01 — échauffement + travail d\'un même exercice = UN exercice ═══');
  const js = x => JSON.stringify(x).slice(0, 420);
  const L = (name, sets, reps, kg, note, extra) => Object.assign({ name, sets, reps, repsPerSet: [], kg, kgPerSet: [], supersetGroup: '', setType: '', note: note || '' }, extra || {});
  // La forme EXACTE rendue aujourd'hui par le Worker (PROG_PROMPT) : une ligne = un exercice, nom nu, « échauffement » en note.
  const PROG = { name: 'Powerbuilding test', weeks: 0, startDate: '', days: [
    { label: 'Séance 1 - Push', exercises: [
      L('Développé couché', 1, 5, 50, 'ECH - série d\'échauffement, non comptée'),
      L('Développé couché', 1, 3, 65, 'Échauffement'),
      L('Développé couché', 1, 3, 90, 'RIR 2 · repos 3 min', { rest: '3 min' }),
      L('Développé couché', 1, 3, 90, 'RIR 2 · repos 3 min', { rest: '3 min' }),
      L('Développé couché', 1, 3, 90, 'RIR 1', { rest: '3 min' }),
      L('Squat à la barre', 4, 8, 100, 'Tempo 3-1-1'),
      L('Tirage vertical', 3, 10, 60, ''),
      L('Rowing barre', 3, 10, 70, ''),
    ] },
    { label: 'Séance 2 - Force', exercises: [
      L('Soulevé de terre', 1, 5, 60, 'Montée 1'),
      L('Soulevé de terre', 1, 3, 100, 'Montée 2'),
      L('Soulevé de terre', 1, 2, 130, 'Montée 3'),
      L('Soulevé de terre', 1, 1, 150, 'Montée 4'),
      L('Soulevé de terre', 1, 3, 170, ''),
      L('Soulevé de terre', 1, 3, 172.5, ''),
      L('Soulevé de terre', 1, 2, 175, ''),
      L('Développé militaire', 1, 8, 30, '', { setTypePerSet: ['W'] }),
      L('Développé militaire', 1, 6, 40, '', { setTypePerSet: ['W'] }),
      L('Développé militaire', 3, 8, 50, '', { setTypePerSet: ['', '', ''] }),
    ] },
    { label: 'Séance 3 - Pull', exercises: [
      L('ECH - Tractions', 1, 5, 0, ''),
      L('Tractions', 4, 6, 0, 'Lest si possible'),
      L('Curl biceps', 1, 12, 14, ''),
      L('Curl biceps', 1, 10, 16, ''),
      L('Développé couché', 1, 5, 50, 'échauffement'),
      L('Développé couché', 3, 5, 85, ''),
      L('Écarté poulie', 3, 12, 15, ''),
      L('Développé couché', 3, 8, 70, 'Back-off'),
      L('Leg extension', 1, 15, 20, 'Échauffement'),
      L('Rowing haltère', 3, 10, 30, ''),
    ] },
    { label: 'Séance 4 - Mix', exercises: [
      L('Developpe couche', 1, 5, 50, 'ECH'),
      L('Développé Couché', 3, 5, 85, ''),
      L('Presse Zeta Prototype', 1, 10, 40, 'Échauffement'),
      L('Presse Zeta Prototype', 1, 8, 80, 'Échauffement'),
      L('Presse Zeta Prototype', 3, 10, 120, ''),
      L('Fentes marchées', 1, 10, 0, 'ECH'),
      L('Fentes marchées', 3, 12, 20, ''),
    ] },
  ] };

  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  await cx.route(/workers\.dev|script\.google\.com/, async r => {
    let c = {}; try { c = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (c.action === 'importProgram') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: JSON.parse(JSON.stringify(PROG)) }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_iw'))return; sessionStorage.setItem('_iw','1'); localStorage.clear();
    const D={ft4_ob2:'1',ft4_name:'Testeur',ft4_premium:'true',ft4_guide_shown:'1',ft4_wn_seen:'999'}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);
  // La vraie chaîne : analyse (réponse simulée) → regroupements → catalogue → aperçu → création.
  const R = await pg.evaluate(async () => {
    S.premium = true; _impPhotos = [{ type: 'text/plain', data: 'programme', name: 'prog.txt', isText: true }]; _impMode = 'new';
    await analyzeImportPhotos();
    const apercu = JSON.parse(JSON.stringify((_impExtracted || {}).days || []));
    const avantCustom = (S.customExercises || []).length;
    finalImportProg();
    const prog = S.programmes[S.programmes.length - 1];
    const jours = prog.days.map(d => d.exs.map(e => ({ name: e.name, note: e.note, sets: e.sets.map(s => ({ kg: s.kg, reps: s.reps, type: s.type, rest: s.rest })) })));
    const custom = (S.customExercises || []).slice(avantCustom).map(e => e.n);
    // La séance : chaque jour chargé, avertissements relevés.
    const seances = [];
    for (let d = 0; d < prog.days.length; d++) {
      S.wkt = null; try { _loadProgDayVraiment(S.programmes.length - 1, d); } catch (e) { seances.push({ err: e.message }); continue; }
      seances.push((S.wkt && S.wkt.exs || []).map(e => ({ name: e.name, warn: (e.seanceWarn || []).join(' ') })));
    }
    return { apercu: apercu.map(d => d.exercises.map(e => e.name)), jours, custom, seances, preview: (document.getElementById('imp-confirm-body') || document.body).innerText.length };
  });
  const jour = (d, nom) => R.jours[d].filter(e => _naz(e.name) === _naz(nom));
  function _naz(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  const dc1 = jour(0, 'Développé couché');
  t('IMP-WU-01 ⛔⛔ 2 échauffements + 3 séries de travail (5 lignes du Worker) = UN exercice / 5 séries',
    dc1.length === 1 && dc1[0].sets.length === 5, js(R.jours[0].map(e => e.name + ':' + e.sets.length)));
  t('IMP-WU-02 ordre des 5 séries conservé (50 → 65 → 90 → 90 → 90)',
    dc1.length === 1 && dc1[0].sets.map(s => s.kg).join(',') === '50,65,90,90,90', js(dc1));
  t('IMP-WU-03 charges ET reps propres à chaque série conservées (5/3/3/3/3), repos de travail gardé (180 s)',
    dc1.length === 1 && dc1[0].sets.map(s => s.reps).join(',') === '5,3,3,3,3' && dc1[0].sets.slice(2).every(s => s.rest === 180), js(dc1));
  t('IMP-WU-04 type conservé : échauffement (É) puis travail (N) ; même chose via la métadonnée structurée (setTypePerSet W) et via le texte (« Montée N », « ECH - » en tête du nom)',
    dc1.length === 1 && dc1[0].sets.map(s => s.type).join('') === 'ÉÉNNN'
    && (jour(1, 'Développé militaire')[0] || { sets: [] }).sets.map(s => s.type).join('') === 'ÉÉNNN'
    && (jour(1, 'Soulevé de terre')[0] || { sets: [] }).sets.map(s => s.type).join('') === 'ÉÉÉÉNNN'
    && (R.jours[2].filter(e => /^tractions/i.test(e.name))[0] || { sets: [] }).sets.map(s => s.type).join('') === 'ÉNNNN' && R.jours[2].filter(e => /tractions/i.test(e.name)).length === 1,
    js({ mil: jour(1, 'Développé militaire'), sdt: jour(1, 'Soulevé de terre').map(e => e.sets.map(s => s.kg + s.type)), tr: R.jours[2].filter(e => /tractions/i.test(e.name)) }));
  const sq = jour(0, 'Squat à la barre').concat(jour(0, 'Squat à la Barre'));
  t('IMP-WU-05 exercice sans échauffement inchangé (Squat 4×8 @100, tout en travail, note gardée)',
    R.jours[0].filter(e => /squat/i.test(e.name)).length === 1 && R.jours[0].filter(e => /squat/i.test(e.name))[0].sets.length === 4
    && R.jours[0].filter(e => /squat/i.test(e.name))[0].sets.every(s => s.kg === 100 && s.type === 'N'), js(R.jours[0].filter(e => /squat/i.test(e.name))));
  t('IMP-WU-06 ⛔ deux exercices différents consécutifs jamais fusionnés (Tirage vertical / Rowing barre ; un échauffement isolé de Leg extension reste à part)',
    R.jours[0].filter(e => /tirage|rowing/i.test(e.name)).length === 2 && R.jours[2].some(e => /leg extension/i.test(e.name) && e.sets.length === 1)
    && R.jours[2].some(e => /rowing halt/i.test(e.name) && e.sets.length === 3), js(R.jours[2].map(e => e.name + ':' + e.sets.length)));
  const dc3 = jour(2, 'Développé couché');
  t('IMP-WU-07 ⛔ même exercice séparé par un autre (DC → Écarté → DC back-off) : PAS de fusion aveugle — 2 blocs ; et 2 lignes identiques SANS preuve d\'échauffement (Curl) restent telles quelles',
    dc3.length === 2 && dc3[0].sets.length === 4 && dc3[1].sets.length === 3 && R.jours[2].filter(e => /^curl/i.test(e.name)).length === 2,
    js(R.jours[2].map(e => e.name + ':' + e.sets.length)));
  const dc4 = R.jours[3].filter(e => /^d[ée]velopp[ée] couch[ée]$/i.test(e.name));
  t('IMP-WU-08 alias catalogue (« Developpe couche » ECH + « Développé Couché » travail) → UN exercice canonique / 4 séries (É N N N)',
    dc4.length === 1 && dc4[0].sets.map(s => s.type).join('') === 'ÉNNN', js(R.jours[3].map(e => e.name + ':' + e.sets.map(s => s.type).join(''))));
  const zeta = R.jours[3].filter(e => /zeta/i.test(e.name));
  t('IMP-WU-09 exercice ABSENT du catalogue (2 échauffements + travail) → UN exercice / 5 séries, et UN SEUL exercice perso créé',
    zeta.length === 1 && zeta[0].sets.map(s => s.type).join('') === 'ÉÉNNN' && R.custom.filter(n => /zeta/i.test(n)).length === 1,
    js({ zeta, custom: R.custom }));
  const doublonsEch = R.seances.map((s, d) => (Array.isArray(s) ? s : []).filter(e => /Déjà présent ailleurs/.test(e.warn)).map(e => d + ':' + e.name)).flat();
  // Doublons LÉGITIMES attendus, jour 3 seulement : DC en deux blocs séparés exprès, et les 2 lignes Curl SANS preuve
  // d'échauffement (laissées telles quelles, IMP-WU-07). Aucun autre.
  t('IMP-WU-10 ⛔⛔ après import, aucune carte « Déjà présent ailleurs dans cette séance » à cause d\'échauffements séparés (seuls le DC volontairement en 2 blocs et les 2 Curl sans preuve, au jour 3, peuvent le dire)',
    doublonsEch.every(x => x.indexOf('2:') === 0 && /couch|curl/i.test(x)) && doublonsEch.length === 4 && R.seances.every(s => Array.isArray(s)), js({ doublonsEch, errs }));
  t('IMP-WU-00 l\'aperçu montre déjà UN exercice (le regroupement a lieu AVANT la vérification, comme le filet ft-v1158) ; 0 appel réel, 0 erreur de page',
    R.apercu[0].filter(n => /couch/i.test(n)).length === 1 && reels === 0 && errs.length === 0, js({ apercu: R.apercu[0], reels, errs }));
  await cx.close();
};
