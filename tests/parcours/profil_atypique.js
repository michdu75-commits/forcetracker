/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧍 NUT-PROFIL-ATYPIQUE-02 — FRONTIÈRE BF 70 % + TAILLE 100 CM · session-A · 02/10/2026

   Mesuré sur master 187a1bbc (ft-v1247), AVANT correction :
     · BF 69,9 % → Katch (923 kcal) ; BF 70 % → Mifflin (1 780 kcal) avec la raison
       « aucune mesure de composition corporelle » — alors que la carte « Masse grasse du jour »
       ACCEPTE 70 (`saveBodyFat` : 2 ≤ bf ≤ 70). Cause : `leanMassRecente` filtrait `bf<70`.
       Effet : un bilan à 70 % trop ancien ou d'avant une variation de poids recevait AUSSI
       « aucune mesure », puisque la mesure n'atteignait jamais `bmrDetail`.
     · Taille 100 cm refusée (« Taille invalide (100–229 cm) ») : `_tailleValide` testait `v>100`.
   Correctif : `bf<=70` et `v>=100`. Rien d'autre.

   Ce que les témoins CONDUISENT : `bmrDetail`, `calcMacros`, `_tailleValide`, `saveProfile`
   (champ taille + toast) et l'écran Nutrition (« Raison : … ») dans l'app servie.
   Ce qu'ils OBSERVENT : la méthode, la raison, le poids de masse maigre, les macros, le toast.
   Ce qu'ils NE COUVRENT PAS : `_bfNavy` (borne basse `<=2`, hors périmètre), la base protéines /
   lipides, Milo, le cloud.
   Banc : tools/banc_profil_atypique.js · contrôle négatif : tools/mut_profil_atypique.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-NPA02-A (session-A). Frontière BF 70 % + taille 100 cm (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const st = nu('state.js'), tr = nu('tracking.js'), se = nu('setup.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const lmr = corps(st, 'leanMassRecente'), tv = (st.match(/function _tailleValide\([^)]*\)\{[^\n]*/) || [''])[0];
  t('① les fonctions sont trouvées', lmr && tv, lmr.length + '/' + tv.length);
  t('② la masse maigre accepte bf=70 (même borne que la saisie)', /bf<=70/.test(lmr) && !/bf<70\b/.test(lmr), (lmr.match(/bf[<>]=?\d+/g) || []).join(' '));
  t('③ la saisie garde sa borne 2–70 (inchangée)', /bf<2\|\|bf>70/.test(tr), '');
  t('④ `_tailleValide` : 100 inclus, 230 exclu', /v>=100\s*&&\s*v<230/.test(tv), tv);
  t('⑤ le message dit la même plage que la règle (100–229 cm)', /Taille invalide \(100–229 cm\)/.test(se), '');
  const nvy = corps(tr, '_bfNavy');
  t('⑦ `_bfNavy` : borne basse 2 INCLUSE sur la valeur rendue, borne haute 70 inchangée', /r<2\|\|bf>70/.test(nvy) && !/bf<=2/.test(nvy), (nvy.match(/if\(!isFinite\(bf\)[^\n]*/) || [''])[0]);
  t('⑥ une seule `_tailleValide` (R2)', (st.match(/function _tailleValide\(/g) || []).length === 1 && !/function _tailleValide\(/.test(se), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-NPA02-B (session-A). Frontière BF 70 % + taille 100 cm (conduit) ═══');
  const D = { ft4_bw: '85', ft4_age: '40', ft4_ht: '180', ft4_gender: 'H', ft4_goal: 'maintain', ft4_act: '1.55', ft4_act_src: 'choisi',
    ft4_ob2: '1', ft4_name: 'Test', ft4_tester_eq_v1: '1' };
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
  await cx.route(/script\.google\.com|supabase\.co|workers\.dev/, r => r.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_npa'))return; sessionStorage.setItem('_npa','1'); localStorage.clear();
    const D=${JSON.stringify(D)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const js = x => JSON.stringify(x).slice(0, 260);
  // Un cas = une pesée avec % de gras, `jours` dans le passé, poids actuel `bw`.
  const cas = (bf, jours, bw) => pg.evaluate(([bf, jours, bw]) => {
    S.bw = bw || 85; S.bodyScans = [];
    const d = new Date(Date.now() - (jours || 0) * 864e5); const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    S.weightLog = [{ date: iso, kg: 85, bf }];
    const bd = bmrDetail(), m = calcMacros();
    return { methode: bd.methode, raison: bd.raison, kcal: bd.kcal, lm: bd.lm ? bd.lm.lm : null, P: m.prot_g, L: m.fat_g, G: m.carbs_g, cal: m.calories };
  }, [bf, jours, bw]);
  const AUCUNE = 'aucune mesure de composition corporelle';
  const r699 = await cas(69.9), r70 = await cas(70), r701 = await cas(70.1), r2 = await cas(2), rOld = await cas(70, 120), rPds = await cas(70, 0, 95);
  t('BF1 · 69,9 % frais, poids cohérent → Katch', r699.methode === 'katch', js(r699));
  t('BF2 · 70 % frais, poids cohérent → Katch (c\'était Mifflin + « aucune mesure »)', r70.methode === 'katch' && r70.raison !== AUCUNE, js(r70));
  t('BF3 · continuité 69,9 → 70 : BMR à ±5 kcal, même masse maigre à 0,2 kg près',
    Math.abs(r70.kcal - r699.kcal) <= 5 && Math.abs(r70.lm - r699.lm) <= 0.2, r699.kcal + ' → ' + r70.kcal);
  t('BF4 · 70,1 % reste INVALIDE (pas de Katch)', r701.methode === 'mifflin' && r701.lm == null, js(r701));
  t('BF5 · 2 % reste valide (Katch)', r2.methode === 'katch', js(r2));
  t('BF6 · 70 % à 120 j → pas de Katch, raison « trop ancien » (jamais « aucune mesure »)',
    rOld.methode === 'mifflin' && /trop ancien/.test(rOld.raison) && rOld.raison !== AUCUNE, js(rOld));
  t('BF7 · 70 % puis poids 85 → 95 kg → pas de Katch, raison « poids a changé » (jamais « aucune mesure »)',
    rPds.methode === 'mifflin' && /poids a changé/.test(rPds.raison) && rPds.raison !== AUCUNE, js(rPds));
  t('BF · protéines et lipides IDENTIQUES quelle que soit la méthode (seuls les glucides suivent la cible)',
    [r70, r701, rOld].every(r => r.P === r699.P && r.L === r699.L), [r699, r70, r701, rOld].map(r => r.P + '/' + r.L).join(' · '));
  // L'écran Nutrition dit la vraie raison (BF6), pas « aucune mesure ».
  await pg.evaluate(() => { S.bw = 85; const d = new Date(Date.now() - 120 * 864e5); S.weightLog = [{ date: d.toISOString().slice(0, 10), kg: 85, bf: 70 }]; S.bodyScans = []; });
  const raisonEcran = await pg.evaluate(() => { try { if (typeof openBmrHelp === 'function') openBmrHelp(); } catch (e) {} return document.body.innerHTML.match(/Raison : [^<.]*/g) || []; });
  t('BF6 écran · « Raison : dernier bilan trop ancien »', raisonEcran.some(x => /trop ancien/.test(x)) && !raisonEcran.some(x => x.includes(AUCUNE)), js(raisonEcran));
  // Taille : la règle, puis le vrai chemin `saveProfile`.
  const tv = await pg.evaluate(() => [99, 100, 101, 229, 230].map(h => _tailleValide(h)));
  t('T1 · 99 cm invalide', tv[0] === false, js(tv));
  t('T2 · 100 cm valide (c\'était refusé)', tv[1] === true, js(tv));
  t('T3 · 101 cm valide', tv[2] === true, js(tv));
  t('T4 · 229 cm valide', tv[3] === true, js(tv));
  t('T5 · 230 cm invalide', tv[4] === false, js(tv));
  const sp = h => pg.evaluate(h => {
    const toasts = []; const o = window.toast; window.toast = (m, k) => toasts.push(m);
    S.height = 180; const el = document.getElementById('ht-inp'); if (el) el.value = String(h);
    try { saveProfile(); } catch (e) { toasts.push('EXC ' + e.message); }
    window.toast = o; return { h: S.height, toasts };
  }, h);
  const s99 = await sp(99), s100 = await sp(100), s230 = await sp(230);
  t('T6 · saveProfile 100 → enregistré, aucun toast d\'erreur', s100.h === 100 && !s100.toasts.some(m => /invalide/i.test(m)), js(s100));
  t('T6 · saveProfile 99 et 230 → refusés, message « 100–229 cm » (cohérent avec la règle)',
    s99.h === 180 && s230.h === 180 && s99.toasts.some(m => m.includes('100–229')) && s230.toasts.some(m => m.includes('100–229')), js([s99, s230]));
  /* 02B — `_bfNavy` CALCULE le % depuis des mensurations (cou · taille · hauteur, homme) : on le conduit
     par son vrai contrat, avec des mensurations au millimètre. ⚠️ Aucune mensuration réaliste ne donne
     EXACTEMENT 2,000 brut (le calcul est continu) : le défaut réel est qu'un résultat qui s'ARRONDIT à
     2,0 (brut 1,95–2,0) était rejeté alors que la saisie accepte 2. Cas trouvés par balayage. */
  const NV = { BFN1: ['65', '35', 170, 1.9], BFN2: ['65.2', '35', 171, 2], BFN3: ['65.2', '35', 170, 2.1],
    BFN4: ['203.9', '35', 170, 69.9], BFN5: ['204.3', '35', 170, 70], BFN6: ['204.6', '35', 170, 70.1] };
  const nv = await pg.evaluate(NV => { const o = {}; for (const k in NV) { const [w, n, h] = NV[k]; o[k] = _bfNavy(n, w, '', h, 'H'); } return o; }, NV);
  t('BFN1 · brut ≈ 1,91 (→ 1,9 %) → rejeté', nv.BFN1 === null, js(nv));
  t('BFN2 · brut ≈ 1,976 (→ 2,0 %) → VALIDE, rend 2 (c\'était rejeté)', nv.BFN2 === 2, js(nv));
  t('BFN3 · → 2,1 % → valide', nv.BFN3 === 2.1, js(nv));
  t('BFN4 · → 69,9 % → valide', nv.BFN4 === 69.9, js(nv));
  t('BFN5 · brut ≈ 69,97 (→ 70,0 %) → valide', nv.BFN5 === 70, js(nv));
  t('BFN6 · brut ≈ 70,05 (→ 70,1 %) → rejeté', nv.BFN6 === null, js(nv));
  t('BFN · la virgule française donne le même résultat (65,2 → 2)', await pg.evaluate(() => _bfNavy('35', '65,2', '', 171, 'H')) === 2, '');
  t('aucune erreur de page', errs.length === 0, errs.join(' | '));
  await cx.close();
};
