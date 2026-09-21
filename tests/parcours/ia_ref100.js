/* ══════════════════════════════════════════════════════════════════════════════════════
   🔬 LE REPAS DÉCRIT PASSE PAR `_ref100` (21/09/2026)

   Michel : ⭐ *« faire passer `estimateFoodAI` par `_ref100` selon le même contrat que les
   autres écrivains »* · ⛔ *« Ne duplique pas `_ref100`. Ne réécris pas un deuxième
   résolveur. Ne modifie pas la logique de `_ref100` … Le propriétaire unique doit rester
   propriétaire. »*

   ⛔⛔ LA PRÉMISSE A ÉTÉ VÉRIFIÉE AVANT D'ÊTRE EXÉCUTÉE (R38) — et le code disait LUI-MÊME
   pourquoi il était exempté : *« l'IA ne donne PAS de valeur au 100 g … inventer un `per100`
   ici ferait passer une estimation pour une mesure »*. **La mesure a rendu cette raison
   caduque** : un `per100` était DÉJÀ écrit sur la ligne, en aval, dans 4 cas sur 6.

   ⭐⭐ LE VRAI DÉFAUT EST R4 : l'avertissement vivait à l'ÉCRAN et n'atteignait jamais la
   DONNÉE. Mesuré, face à la MÊME incohérence :

     écrivain CIQUAL  → DERIVE_ESTIMABLE · derive_macros · brut 60 → retenu 215
     repas décrit     → ⛔ `fiab: null`, **6 fois sur 6**

   ⭐ ET LA LOI EST INVARIANTE D'ÉCHELLE : `E ≥ 4P + 9L` vaut sur un total de portion comme
   sur 100 g. C'est ce qui permet de récolter le verdict même sans poids.
   ⛔ MAIS SANS POIDS ON CLASSE SANS RÉÉCRIRE — la branche 🔬 qui explique une substitution
   lit `_bcNutr`, absent dans ce cas : *une correction qu'aucun écran n'explique est une
   correction silencieuse.*
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  /* ⚠️ Commentaires neutralisés : ceux du correctif citent `_ref100`, `origine:'ia'`,
     `NON_RESOLU`, `_afFiab` et `_bcNutr` en toutes lettres (R30). */
  const A = brut.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const nu = A.replace(/\s+/g, '');
  const corps = (n) => {
    const m = new RegExp('(?:async\\s+)?function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(A);
    if (!m) return '';
    const i = m.index + m[0].length - 1; let d = 0;
    for (let j = i; j < A.length; j++) {
      if (A[j] === '{') d++; else if (A[j] === '}') { d--; if (!d) return A.slice(i, j + 1); }
    }
    return '';
  };
  const EST = corps('estimateFoodAI').replace(/\s+/g, '');

  console.log('\n═══ B-CCCXLVI. Le repas décrit et le résolveur (source) ═══');

  t('B-CCCXLVI ① ⭐⭐ `estimateFoodAI` appelle bien le résolveur',
    /_ref100\(/.test(EST), 'la porte est de nouveau hors du propriétaire unique');
  t('B-CCCXLVI ② ⭐ … et se déclare comme l\'origine `ia`',
    /origine:'ia'/.test(EST), 'l\'origine n\'est plus transmise');
  /* ⛔⛔ LE TÉMOIN QUI COMPTE VRAIMENT : on n'a pas écrit un SECOND résolveur. La loi
     `E ≥ 4P + 9L` et ses facteurs ne doivent exister qu'à un seul endroit. */
  t('B-CCCXLVI ③ ⛔⛔ aucune 2ᵉ implémentation de la loi dans la porte IA',
    !/4\*|9\*|NRJ_PROT|NRJ_LIP|_nrjPlancher|_nrjAtwater|_resoudreNutrition/.test(EST),
    'la porte recalcule la loi au lieu de la demander');
  t('B-CCCXLVI ④ ⛔ `_resoudreNutrition` n\'a qu\'un appelant, et c\'est `_ref100`',
    (nu.match(/_resoudreNutrition\(/g) || []).length === 2,
    'le résolveur est appelé ailleurs que depuis son propriétaire');
  t('B-CCCXLVI ⑤ ⛔ les facteurs UE 1169/2011 n\'ont pas bougé',
    /constNRJ_PROT=4,NRJ_LIP=9;/.test(nu), 'les facteurs de la loi ont changé');
  t('B-CCCXLVI ⑥ ⛔ et `ia` n\'est PAS devenue une origine utilisateur',
    /constNRJ_ORIGINES_UTILISATEUR=\['manuel','reprise','historique'\]/.test(nu),
    'la liste des origines protégées a été modifiée');

  /* ⛔⛔ L'ABSENCE SE TRANSPORTE — on repart de la réponse BRUTE, pas des champs remplis. */
  t('B-CCCXLVI ⑦ ⭐⭐ le résolveur reçoit la réponse BRUTE, pas les champs (`d.carbs||0`)',
    /_ref100\(d\.name\|\|desc,_iaV\(d\.kcal\),_iaV\(d\.prot\),_iaV\(d\.carbs\),_iaV\(d\.fat\)/.test(EST),
    'une macro absente redevient un 0 avant d\'atteindre le résolveur');
  t('B-CCCXLVI ⑧ ⛔ et `_iaV` rend `undefined` sur une valeur absente, jamais 0',
    /const_iaV=x=>_iaLa\(x\)\?\(_iaG\?_per100d1\(\(\+x\)\*100\/_iaG\):\+x\):undefined;/.test(EST),
    'l\'absence est redevenue un zéro');

  /* ── LES DEUX BRANCHES, ET CE QUI LES SÉPARE ─────────────────────────────── */
  t('B-CCCXLVI ⑨ ⭐ avec un poids, la porte pose une vraie référence pour-100 g',
    /if\(_iaG\)\{_bcNutr=_iaRef;/.test(EST), 'la référence n\'est plus posée');
  t('B-CCCXLVI ⑩ ⛔⛔ SANS poids, aucune référence pour-100 g n\'est inventée',
    !/else\{[^}]*_bcNutr=/.test(EST), 'un pour-100 g est fabriqué sans masse');
  t('B-CCCXLVI ⑪ ⛔⛔ … et rien n\'est réécrit dans ce cas (correction silencieuse interdite)',
    !/else\{[^}]*af-kcal/.test(EST), 'une substitution se fait sans explication à l\'écran');
  /* ⭐ La trace ne doit pas annoncer un « retenu » que la ligne ne porte pas. */
  t('B-CCCXLVI ⑫ ⭐⭐ sans poids, la trace dit « classé, pas réécrit » et `retenu = brut`',
    /etat:'NON_RESOLU',methode:'observation',kcal:_zf\.brut,confiance:'source'/.test(EST),
    'la trace peut annoncer un retenu que la donnée ne porte pas');

  /* ── R15 : LE MARQUEUR MEURT AVEC L'ALIMENT ──────────────────────────────── */
  t('B-CCCXLVI ⑬ ⛔ le verdict se vide avec l\'aliment (R15)',
    /_afFiab=null/.test(corps('_afOublierAliment').replace(/\s+/g, '')),
    'l\'incohérence du repas précédent peut s\'enregistrer sur le suivant');
  /* ⭐ UNE SEULE PRIORITÉ, ÉCRITE UNE SEULE FOIS : `_bcNutr.fiab` d'abord, `_afFiab` ensuite. */
  /* ⚠️ MA PREMIÈRE VERSION FIGEAIT UN NOMBRE D'OCCURRENCES (« au plus 5 ») et rougissait sur
     du code sain — *un témoin qui fige un nombre mesure mon arithmétique mentale*, défaut
     d'instrument déjà payé en ft-v1226. L'invariant juste n'est pas COMBIEN mais **OÙ** :
     `_afFiab` ne s'écrit qu'à trois endroits (sa déclaration, l'oubli, la porte IA) et ne se
     lit que dans l'expression de priorité. */
  t('B-CCCXLVI ⑭ ⭐ une seule priorité entre les deux porteurs (R2)',
    /* ⚠️ ET `_afFiab=` MATCHE À L'INTÉRIEUR DE `_afFiab==='object'` — le piège de la
       sous-chaîne (`BUGS.md` n°1), qui m'a rendu 4 au lieu de 3. Une AFFECTATION est un `=`
       qui n'est pas suivi d'un autre `=`. */
    (nu.match(/_afFiab=(?!=)/g) || []).length === 3
      && /_bcNutr\.fiab\)\?_bcNutr\.fiab:\(\(typeof_afFiab==='object'&&_afFiab\)\?_afFiab:null\)/.test(nu),
    'la priorité a changé ou `_afFiab` s\'écrit ailleurs');
  t('B-CCCXLVI ⑮ ⛔ une ligne cohérente ne grossit toujours pas d\'une trace',
    /if\(_z&&_z\.etat!=='COHERENT'\)\{/.test(nu), 'toute ligne porte désormais une trace');

  /* ── ⛔ PÉRIMÈTRE : ce que ce chantier ne touche pas ─────────────────────── */
  t('B-CCCXLVI ⑯ ⛔ `_ref100` garde exactement ses deux substitutions',
    /if\(f\.fiab\.etat==='ALTERNATIVE_FIABLE'\|\|f\.fiab\.etat==='DERIVE_ESTIMABLE'\)f\.kcal100=f\.fiab\.kcal;/.test(nu),
    '`_ref100` a été modifié');
  t('B-CCCXLVI ⑰ ⛔ la douane n\'est pas touchée (21 règles)',
    /constDOUANE_OBS_CLE='ft4_douane_obs'/.test(nu), 'le carnet d\'observation a changé');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{if(localStorage.getItem('_decorIaRef')==='1')return;
    localStorage.clear();localStorage.setItem('_decorIaRef','1');
    localStorage.setItem('ft4_bw','85.9');localStorage.setItem('ft4_ht','180');
    localStorage.setItem('ft4_age','48');localStorage.setItem('ft4_gender','H');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXLVII. Le repas décrit, conduit (serveur IA simulé) --');

  /* ⛔ LE SERVEUR EST SIMULÉ, LE CHEMIN NE L'EST PAS : on remplace `fetch` pour la seule
     route `estimateFood` et TOUT le reste — parsing, résolveur, écran, enregistrement —
     est celui de la production. *Un mode test qui n'emprunte pas le chemin de production
     valide le mode test, pas la production.* */
  await pg.evaluate(() => {
    window.__fetchVrai = window.fetch;
    window.fetch = function (u, o) {
      const body = (o && o.body) || '';
      if (String(body).indexOf('"estimateFood"') >= 0)
        return Promise.resolve({ ok: true, json: () => Promise.resolve(window.__reponseIA) });
      return window.__fetchVrai.apply(window, arguments);
    };
  });

  const jouer = (rep) => pg.evaluate(async r => {
    window.__reponseIA = r;
    S.url = 'http://x'; S.premium = true; S.foodLog = [];
    openAddFood(); await new Promise(x => setTimeout(x, 400));
    document.getElementById('af-desc').value = 'test';
    await estimateFoodAI(); await new Promise(x => setTimeout(x, 400));
    const lu = id => (document.getElementById(id) || {}).value;
    const coh = document.getElementById('af-coherence') || {};
    const vu = !!(coh.style && coh.style.display !== 'none');
    const form = { kcal: lu('af-kcal'), prot: lu('af-prot'), carbs: lu('af-carbs'), fat: lu('af-fat') };
    addFoodEntry(); await new Promise(x => setTimeout(x, 400));
    const l = (S.foodLog || [])[0] || null;
    return { form, avert: vu ? (coh.innerText || '') : '',
             l: l ? { kcal: l.kcal, prot: l.prot, carbs: l.carbs, fat: l.fat,
                      fiab: l.fiab || null, per100: l.per100 || null } : null };
  }, rep);

  // ═══ A — énergie et macros cohérentes : RIEN ne doit changer ═══════════════
  let o = await jouer({ status:'ok', name:'Poulet riz', kcal:500, prot:40, carbs:55, fat:10, g:350 });
  t('B-CCCXLVII ① ⭐⭐ CAS A · une estimation cohérente n\'est pas touchée',
    o.form.kcal === '500' && o.l.kcal === 500 && o.l.prot === 40, JSON.stringify(o.form));
  t('B-CCCXLVII ② ⛔ CAS A · et elle ne porte AUCUNE trace (la ligne ne grossit pas)',
    o.l.fiab === null, JSON.stringify(o.l.fiab));
  /* ⚠️ RÉGRESSION QUE J'AI INTRODUITE PUIS MESURÉE : en posant `_bcNutr`, la ligne perdait
     le `per100` qu'elle portait AVANT ce chantier (142,9 pour 500 kcal / 350 g). */
  t('B-CCCXLVII ③ ⭐ CAS A · le pour-100 g d\'avant est toujours là (aucune régression)',
    o.l.per100 && o.l.per100.kcal === 142.9, JSON.stringify(o.l.per100));

  // ═══ B — énergie incompatible avec les macros, POIDS connu ════════════════
  o = await jouer({ status:'ok', name:'Steak huile', kcal:120, prot:40, carbs:0, fat:30, g:200 });
  t('B-CCCXLVII ④ ⭐⭐ CAS B · le résolveur applique sa règle normale (120 → 430)',
    o.form.kcal === '430' && o.l.kcal === 430, JSON.stringify(o.form));
  t('B-CCCXLVII ⑤ ⭐⭐ CAS B · la trace atteint enfin la DONNÉE (elle était `null`)',
    o.l.fiab && o.l.fiab.etat === 'DERIVE_ESTIMABLE'
      && o.l.fiab.raison === 'plancher_energetique'
      && o.l.fiab.brut === 60 && o.l.fiab.retenu === 215, JSON.stringify(o.l.fiab));
  t('B-CCCXLVII ⑥ ⛔ CAS B · et l\'écran EXPLIQUE la substitution (jamais silencieuse)',
    /🔬/.test(o.avert) && /215/.test(o.avert), o.avert.slice(0, 90));

  // ═══ C — même incohérence, SANS poids ═════════════════════════════════════
  o = await jouer({ status:'ok', name:'Steak huile', kcal:120, prot:40, carbs:0, fat:30 });
  t('B-CCCXLVII ⑦ ⭐⭐ CAS C · sans poids, RIEN n\'est réécrit',
    o.form.kcal === '120' && o.l.kcal === 120, JSON.stringify(o.form));
  t('B-CCCXLVII ⑧ ⭐⭐ CAS C · … mais le verdict est quand même enregistré',
    o.l.fiab && o.l.fiab.raison === 'plancher_energetique', JSON.stringify(o.l.fiab));
  t('B-CCCXLVII ⑨ ⛔⛔ CAS C · et la trace ne ment pas : `retenu` vaut `brut`',
    o.l.fiab && o.l.fiab.etat === 'NON_RESOLU' && o.l.fiab.methode === 'observation'
      && o.l.fiab.retenu === o.l.fiab.brut && o.l.fiab.retenu === 120, JSON.stringify(o.l.fiab));
  t('B-CCCXLVII ⑩ ⛔ CAS C · aucun pour-100 g inventé sans masse',
    o.l.per100 === null, JSON.stringify(o.l.per100));
  t('B-CCCXLVII ⑪ ⛔ CAS C · l\'avertissement d\'écart reste affiché',
    /ne colle pas/.test(o.avert), o.avert.slice(0, 90));

  // ═══ D — énergie absente, macros présentes ════════════════════════════════
  o = await jouer({ status:'ok', name:'Omelette', prot:20, carbs:2, fat:15, g:150 });
  t('B-CCCXLVII ⑫ ⭐⭐ CAS D · une énergie absente est estimée (elle valait 0)',
    o.l.kcal === 223 && o.l.fiab && o.l.fiab.raison === 'energie_absente', JSON.stringify(o.l));

  // ═══ E — une macro manque (absente ≠ zéro) ════════════════════════════════
  o = await jouer({ status:'ok', name:'Soupe', kcal:90, prot:3, fat:2, g:250 });
  t('B-CCCXLVII ⑬ ⭐ CAS E · la loi est un PLANCHER : 90 ≥ 4×3 + 9×2, donc rien à résoudre',
    o.l.fiab === null && o.l.kcal === 90, JSON.stringify(o.l));

  // ═══ F — valeurs nulles / invalides ═══════════════════════════════════════
  o = await jouer({ status:'ok', name:'Vide', kcal:'abc', prot:null, carbs:undefined, fat:'' });
  t('B-CCCXLVII ⑭ ⛔ CAS F · aucun NaN, aucune valeur fantôme',
    o.l === null || (isFinite(o.l.kcal) && !isNaN(o.l.kcal)), JSON.stringify(o.l));

  // ═══ G — LE MÊME APPORT PAR UN ÉCRIVAIN DÉJÀ BRANCHÉ ══════════════════════
  /* ⭐⭐ C'est le témoin demandé par le brief : à entrée équivalente, MÊME contrat de sortie. */
  const comp = await pg.evaluate(async () => {
    openAddFood(); await new Promise(x => setTimeout(x, 300));
    const r = _ref100('Steak huile', 60, 20, 0, 15, { origine: 'ciqual' });
    return JSON.parse(JSON.stringify(r.fiab));
  });
  o = await jouer({ status:'ok', name:'Steak huile', kcal:120, prot:40, carbs:0, fat:30, g:200 });
  const ia = o.l.fiab;
  t('B-CCCXLVII ⑮ ⭐⭐ CAS G · même verdict que CIQUAL sur la même incohérence',
    ia && ia.etat === comp.etat && ia.methode === comp.methode && ia.raison === comp.raison
      && ia.brut === comp.brut && ia.retenu === comp.kcal && ia.champ === comp.champ,
    JSON.stringify([ia, comp]));
  /* ⚠️ `ia &&` N'EST PAS DÉCORATIF : sans lui, ce témoin LEVAIT une TypeError dès que la
     trace redevenait `null` — le contrôle négatif rendait alors « PLANTAGE » au lieu de
     « rouge », deux fois. *Un témoin qui plante au lieu de rougir ne dit plus lequel a
     échoué, et peut masquer les suivants.* */
  t('B-CCCXLVII ⑯ ⭐ CAS G · seule l\'origine les distingue, et c\'est ce qu\'on veut',
    !!ia && ia.origine === 'ia' && comp.origine === 'ciqual',
    JSON.stringify([ia && ia.origine, comp.origine]));

  // ═══ H — UNE MACRO À `null` : absente, PAS égale à zéro ═══════════════════
  /* ⭐⭐ CE CAS A ÉTÉ AJOUTÉ PAR LE CONTRÔLE NÉGATIF, ET C'EST EXACTEMENT SON MÉTIER : la
     mutation qui rendait `_iaLa` permissif restait VERTE, parce qu'aucun de mes cas ne
     portait une macro à `null` ou `''` — ils portaient `undefined`, que les deux versions
     traitent pareil. *On pouvait retirer la distinction « absent / zéro » sans un rouge.*
     ⛔ Ici la loi est violée ET les glucides sont absents : le résolveur ne peut donc PAS
     dériver (il lui faut les trois macros), et il doit dire `NON_RESOLU`. Avec un `null` lu
     comme un zéro légitime, il dériverait — et fabriquerait une énergie sur une macro que
     personne n'a donnée. */
  o = await jouer({ status:'ok', name:'Plat', kcal:120, prot:40, carbs:null, fat:30, g:200 });
  t('B-CCCXLVII ⑰ ⭐⭐ CAS H · une macro `null` est ABSENTE : on ne dérive pas (R29)',
    o.l.fiab && o.l.fiab.etat === 'NON_RESOLU' && o.l.kcal === 120, JSON.stringify(o.l.fiab));

  /* ⛔ R15 — le verdict ne doit PAS se coller au repas suivant. */
  o = await jouer({ status:'ok', name:'Poulet riz', kcal:500, prot:40, carbs:55, fat:10, g:350 });
  t('B-CCCXLVII ⑱ ⛔⛔ le verdict du repas PRÉCÉDENT ne contamine pas le suivant (R15)',
    o.l.fiab === null, JSON.stringify(o.l.fiab));

  t('B-CCCXLVII ⑲ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
