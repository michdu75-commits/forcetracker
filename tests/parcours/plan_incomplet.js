/* ══════════════════════════════════════════════════════════════════════════════════════
   🛡️ LE COMPTE NEUF NE FABRIQUE PLUS UN PLAN CRÉDIBLE (21/09/2026)

   Michel : ⭐ *« Force Tracker ne doit jamais présenter comme plan personnalisé un résultat
   calculé avec des informations insuffisantes. »* · ⛔ *« Ne supprime pas aveuglément toutes
   les occurrences de 1500 »* · ⛔ *« Pas de refonte UX, pas de nouvel onboarding. »*

   ⛔⛔ LE DÉFAUT EST MESURÉ DANS L'APP SERVIE, PAS DÉDUIT D'UNE CAPTURE. Profil vide :
     · `bmrDetail` → 0 · `calcTDEE` → 0 · `autoKcal` → **1 500** · écran : « CIBLE 1 500 KCAL »
     · poids seul → **1 500 kcal · 189 g P · 77 g L · 13 g G**

   ⭐⭐ ET LE 1 500 N'EST PAS UNE VALEUR EN DUR : c'est `PLANCHER_KCAL.H`, le garde-fou de
   ft-v918, écrit pour empêcher l'app de PRESCRIRE une cible qu'elle signalerait elle-même.
   👉 ***Le défaut n'est pas le plancher, c'est qu'en l'absence de calcul la borne basse
   devienne le résultat.*** Deux témoins épinglent donc le plancher EN PLACE et intact.

   ⭐ TROIS FAITS TROUVÉS EN MESURANT, absents du brief :
     ① un `workType` renseigné sur un profil vide rend **TDEE 450** — pas 0, donc un chiffre
        *plausible* bâti sur un métabolisme nul ;
     ② `S.bw='abc'` passait l'ancien test `!S.bw` (une chaîne non vide est *truthy*) et
        produisait **`NaN`** dans les trois macros ;
     ③ la règle « a-t-on de quoi calculer ? » était écrite **quatre fois** dans le code servi.

   ⚠️ NUMÉROTATION : `B-CCCXLII`/`B-CCCXLIII` sont pris DEUX FOIS dans le dépôt (mon bloc
   masse grasse et le bloc motif d'exercice de session-B, publiés le même jour). ⛔ On ne
   renomme pas un bloc déjà publié — protocole deux sessions. On prend la suite.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const lire = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS — ceux du correctif citent `PLANCHER_KCAL`, `1500`, `null`,
     `profilCaloriqueManquants` et « Complète ton profil » en toutes lettres (R30 : la raison
     s'écrit à côté du code). Un témoin qui lirait le fichier brut resterait vert quoi qu'on
     remette dans le code. */
  const nett = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const ST = nett(lire('state.js')), SC = nett(lire('screens.js')),
        AP = nett(lire('app.js')), CO = nett(lire('coach.js'));
  const corps = (A, n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(A);
    if (!m) return '';
    const i = m.index + m[0].length - 1; let d = 0;
    for (let j = i; j < A.length; j++) {
      if (A[j] === '{') d++; else if (A[j] === '}') { d--; if (!d) return A.slice(i, j + 1); }
    }
    return '';
  };

  console.log('\n═══ B-CCCXLIV. Le compte neuf ne fabrique plus de plan (source) ═══');

  /* ── LE PROPRIÉTAIRE UNIQUE (R2) ─────────────────────────────────────────── */
  t('B-CCCXLIV ① ⭐ un propriétaire unique répond à « a-t-on de quoi calculer ? »',
    /function\s+profilCaloriqueManquants\s*\(/.test(ST), 'la fonction a disparu');
  /* ⚠️ MON PREMIER MOTIF ÉTAIT `\.filter\([^)]*\)\.map\(` — il s'arrêtait à la parenthèse
     fermante de `_nbUtil(S[c[0]])`, donc il rougissait sur du code parfaitement sain.
     *Un motif qui suppose qu'une expression ne contient pas de parenthèse mesure sa propre
     naïveté.* On vérifie le MÉCANISME : on filtre la table, et on rend des libellés. */
  /* ⚠️ DEPUIS B1 (24/09/2026) le filtre vit dans `profilBmrManquants` (le BMR n'a pas besoin de
     l'activité), que le propriétaire APPELLE avant d'ajouter l'activité. Ce témoin figeait le TEXTE
     du corps ; il suit maintenant la délégation — *un témoin qui fige une forme interdit
     d'améliorer ce qu'il protège* (même famille que B-CCCXXXVI ②). La garantie est la même. */
  const _pcm = corps(ST, 'profilCaloriqueManquants');
  const _mq = (/profilBmrManquants\(\)/.test(_pcm) ? _pcm + corps(ST, 'profilBmrManquants') : _pcm).replace(/\s+/g, '');
  t('B-CCCXLIV ② ⭐ il rend les champs MANQUANTS, pas un booléen (l\'écran doit pouvoir les nommer)',
    /PROFIL_CALORIQUE\.filter\(/.test(_mq) && /\.map\(c=>c\[1\]\)/.test(_mq),
    'il ne rend plus la liste');
  /* ⛔⛔ LE TÉMOIN QUI COMPTE : plus aucune COPIE de la règle dans les fichiers servis.
     Mesurer le nombre de copies est le seul invariant qui tienne — chercher la présence de
     `profilCaloriqueManquants` quelque part resterait vert avec une 5ᵉ copie à côté. */
  const copies = [ST, SC, AP].map(s =>
    (s.match(/!\s*S\.bw\s*\|\|\s*!\s*S\.(height|age)|S\.bw\s*&&\s*S\.age\s*&&\s*S\.height|S\.bw\s*&&\s*S\.height\s*&&\s*S\.age/g) || []).length
  ).reduce((a, b) => a + b, 0);
  t('B-CCCXLIV ③ ⭐⭐ la règle n\'est plus RÉÉCRITE nulle part (R2 — elle l\'était 4 fois)',
    copies === 0, copies + ' copie(s) subsistent');
  t('B-CCCXLIV ④ … et les trois anciens sites lisent bien le propriétaire',
    (ST.match(/profilCaloriqueManquants\(\)/g) || []).length >= 3
      && /profilCaloriqueManquants/.test(SC) && (AP.match(/profilCaloriqueManquants/g) || []).length >= 2,
    'un site a cessé de le lire');

  /* ── IL EST STRICT SUR LES NOMBRES (le NaN mesuré) ───────────────────────── */
  t('B-CCCXLIV ⑤ ⛔ la calculabilité se mesure sur un NOMBRE, pas sur l\'existence (`bw=\'abc\'` → NaN)',
    /_nbUtil/.test(_mq), 'le test d\'existence est revenu');
  t('B-CCCXLIV ⑥ ⭐ et `_nbUtil` exige un nombre fini strictement positif',
    /isFinite\(n\)\s*&&\s*n\s*>\s*0/.test(corps(ST, '_nbUtil').replace(/\s+/g, ' ')),
    'la borne a sauté');

  /* ── ⛔⛔ LE PLANCHER RESTE EN PLACE ET INTACT (consigne 1C) ──────────────── */
  /* ⚠️⚠️ LE PIÈGE DE L'ESPACE, 10ᵉ FOIS DANS CE DÉPÔT (`BUGS.md` n°1) : ce motif s'écrivait
     `/const\s+PLANCHER_KCAL/` sur une source dont je venais de retirer TOUS les espaces — donc
     `\s+` ne pouvait plus rien matcher et le témoin rougissait sur un garde-fou intact.
     👉 ***Quand on nettoie la source, on nettoie le motif du même geste.*** */
  t('B-CCCXLIV ⑦ ⛔⛔ `PLANCHER_KCAL` existe toujours, H 1500 / F 1200 (ce n\'est PAS le bug)',
    /constPLANCHER_KCAL=\{H:1500,F:1200\}/.test(ST.replace(/\s+/g, '')),
    'le garde-fou calorique a été supprimé ou modifié');
  t('B-CCCXLIV ⑧ ⛔ et il s\'applique toujours à un calcul réel',
    /Math\.max\(Math\.round\(k\),p\)/.test(corps(ST, '_plancherKcal').replace(/\s+/g, '')),
    '`_plancherKcal` ne relève plus rien');
  /* ⚠️ `null < 1500` vaut `true` en JavaScript : sans garde, l'encadré annonçait « NaN kcal ». */
  t('B-CCCXLIV ⑨ ⭐ un plancher ne relève que ce qui a été calculé (`null < 1500` est vrai en JS)',
    /if\(brut==null\)returnnull/.test(corps(ST, 'plancherKcalActif').replace(/\s+/g, '')),
    'le piège de la coercition de `null` est revenu');

  /* ── LA CHAÎNE REND `null`, JAMAIS UN NOMBRE PLAUSIBLE ───────────────────── */
  t('B-CCCXLIV ⑩ ⭐⭐ `calcTDEE` refuse AVANT d\'additionner (le cas mesuré à 450 kcal)',
    /if\(profilCaloriqueManquants\(\)\.length\)returnnull;/.test(corps(ST, 'calcTDEE').replace(/\s+/g, '')),
    'les 3 termes hors-BMR fuient de nouveau');
  t('B-CCCXLIV ⑪ ⛔ `autoKcal` ne pose pas le plancher sur un calcul absent',
    /constb=_autoKcalBrut\(phase\);returnb==null\?null:_plancherKcal\(b\)/.test(corps(ST, 'autoKcal').replace(/\s+/g, '')),
    'le plancher redevient le résultat');
  t('B-CCCXLIV ⑫ ⛔ `_autoKcalBrut` s\'arrête aussi (sinon l\'encadré « relevée de X » ment)',
    /if\(tdee==null\)returnnull/.test(corps(ST, '_autoKcalBrut').replace(/\s+/g, '')),
    'il continue à additionner');
  t('B-CCCXLIV ⑬ ⭐ `calcMacros` déclare l\'indisponibilité ET ce qui manque',
    /indisponible:manquants\.length>0,manquants:manquants/.test(corps(ST, 'calcMacros').replace(/\s+/g, '')),
    'l\'écran devra redériver la règle');
  /* ⭐ LES DEUX BESOINS SONT DISTINCTS : les calories peuvent venir d'un réglage manuel,
     les macros ont besoin du POIDS. Le cas `manualKcal` sans poids rendait 0 g P / 0 g L. */
  t('B-CCCXLIV ⑭ ⭐⭐ les macros exigent le POIDS, indépendamment des calories',
    /constcalculable=\(calories!=null\)&&\(_nbUtil\(S\.bw\)!=null\)/.test(corps(ST, 'calcMacros').replace(/\s+/g, '')),
    'une répartition peut de nouveau être inventée sans poids');
  t('B-CCCXLIV ⑮ ⛔ et ce qui n\'est pas calculable vaut `null`, jamais 0',
    /\{prot_g:null,fat_g:null,carbs_g:null,cycle:null\}/.test(corps(ST, 'calcMacros').replace(/\s+/g, '')),
    'des zéros sont réapparus');

  /* ── L'ÉCRAN ─────────────────────────────────────────────────────────────── */
  t('B-CCCXLIV ⑯ ⭐ un seul propriétaire de « comment s\'écrit un nombre qu\'on n\'a pas »',
    /function\s+_nbAff\s*\(/.test(ST) && /\?'—':/.test(corps(ST, '_nbAff').replace(/\s+/g, '')),
    '`_nbAff` a disparu ou n\'écrit plus le tiret');
  t('B-CCCXLIV ⑰ ⛔⛔ aucune case de l\'onglet n\'écrit plus un nombre brut',
    !/getElementById\('(nu-tdee|m-kcal|m-prot|m-carbs|m-fat)'\)\.textContent=(?!_nbAff)/
      .test(SC.replace(/\s+/g, '')),
    'une case écrit encore directement sa valeur');
  t('B-CCCXLIV ⑱ ⭐ la phrase de sortie existe, et elle NOMME ce qui manque',
    /Complètetonprofilpourcalculertesbesoins/.test(SC.replace(/\s+/g, ''))
      && /_etManquants\(macros\.manquants/.test(SC.replace(/\s+/g, '')),
    'le message a disparu ou récite les trois champs');
  t('B-CCCXLIV ⑲ ⛔ `openKcalEdit` ne fait plus `.toLocaleString()` sur un `null`',
    /macros?\.autoCalories!=null|m\.autoCalories!=null/.test(corps(SC, 'openKcalEdit').replace(/\s+/g, '')),
    'la modale peut de nouveau lever une erreur');

  /* ── ⛔ MILO NE REÇOIT PAS UN FAIT FAUX ──────────────────────────────────── */
  t('B-CCCXLIV ⑳ ⛔⛔ `null` n\'atteint jamais le contexte de Milo',
    /consttdee=\(\(typeofcalcTDEE==='function'\)\?calcTDEE\(\):null\)\|\|'—'/.test(CO.replace(/\s+/g, '')),
    'Milo peut recevoir « TDEE: null kcal »');
  t('B-CCCXLIV ㉑ ⛔ et le BMR suit la même règle',
    /constbmr=\(_bd&&_bd\.kcal>0\)/.test(CO.replace(/\s+/g, '')),
    'Milo peut recevoir « BMR: 0 kcal » comme un fait');

  /* ── ⛔ LE PÉRIMÈTRE : la formule elle-même ne bouge pas ──────────────────── */
  t('B-CCCXLIV ㉒ ⛔ Mifflin-St Jeor intacte',
    /constbase=10\*S\.bw\+6\.25\*S\.height-5\*S\.age/.test(ST.replace(/\s+/g, '')), 'la formule a changé');
  t('B-CCCXLIV ㉓ ⛔ Katch-McArdle intacte',
    /constkatch=Math\.round\(370\+21\.6\*lm\.lm\)/.test(ST.replace(/\s+/g, '')), 'la formule a changé');
  t('B-CCCXLIV ㉔ ⛔ les écarts caloriques par objectif n\'ont pas bougé',
    /\{muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100\}/.test(ST.replace(/\s+/g, '')),
    'la table des objectifs a changé');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  /* ⛔ LE DÉCOR NE SE POSE QU'UNE FOIS : un `addInitScript` rejoue à CHAQUE navigation,
     rechargement compris — une fixture qui s'efface pendant la mesure mesure la fixture
     (leçon ft-v1230, et le témoin ⑫ ci-dessous repose précisément sur un rechargement). */
  await pg.addInitScript(`(()=>{try{if(localStorage.getItem('_decorPlanInc')==='1')return;
    localStorage.clear();localStorage.setItem('_decorPlanInc','1');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXLV. Le compte neuf, conduit dans le navigateur --');

  /* ⛔ Chaque cas repart d'un état COMPLET et explicite : un champ oublié d'un cas à l'autre
     ferait passer un témoin pour la mauvaise raison. */
  const poser = (js) => pg.evaluate(j => {
    S.workType = 'bureau'; S.manualKcal = 0; S.gender = 'H'; S.goal = 'muscle';
    S.activityLevel = 1.55; S.nutritionPhase = 'charge'; S.foodMode = ''; S.keto = false;
    S.weightLog = []; S.bodyScans = []; S.sessions = []; S.coachQuiz = null; S.foodLog = [];
    eval(j); persist();
  }, js);
  const calc = () => pg.evaluate(() => {
    const m = calcMacros(S.nutritionPhase);
    return { tdee: calcTDEE(), auto: autoKcal(S.nutritionPhase), kcal: m.calories,
             p: m.prot_g, l: m.fat_g, g: m.carbs_g, ind: m.indisponible, mq: m.manquants,
             plancher: (typeof plancherKcalActif === 'function') ? plancherKcalActif(S.nutritionPhase) : 'absent' };
  });
  /* ⚠️ `goScreen` NE RECONSTRUIT PAS UN ÉCRAN DÉJÀ AFFICHÉ — mesuré : le cas « profil
     complet » lisait encore le rendu du cas précédent, et deux témoins rougissaient sur du
     code sain. *Une sonde qui lit un écran qu'elle n'a pas redemandé mesure l'état d'avant.* */
  const ecran = () => pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 200));
    renderNutrition();
    await new Promise(r => setTimeout(r, 650));
    const t = (document.getElementById('s-nutrition') || {}).innerText || '';
    /* ⚠️ `toLocaleString('fr-FR')` sépare les milliers par U+202F (espace fine insécable),
       PAS par une espace ordinaire — un témoin qui compare à « 2 711 » tapé au clavier
       rougit sur un affichage parfaitement juste. On normalise à la lecture. */
    const N = s => String(s == null ? '' : s).replace(/[   ]/g, ' ');
    const g = id => N((document.getElementById(id) || {}).textContent);
    return { n1500: (N(t).match(/1\s?500/g) || []).length, nan: /NaN|null|undefined/.test(t),
             fuite: (t.match(/.{0,40}(NaN|null|undefined).{0,40}/g) || []).join(' ¶ '),
             msg: /Complète ton profil pour calculer tes besoins/.test(t),
             tdee: g('nu-tdee'), bmr: g('nu-bmr'), kcal: g('m-kcal'),
             prot: g('m-prot'), hydra: g('nu-hydra') };
  });

  // ═══ CAS A — compte totalement neuf ════════════════════════════════════════
  await poser('S.bw=0;S.height=0;S.age=0;');
  let o = await calc(), e = await ecran();
  t('B-CCCXLV ① ⭐⭐ CAS A · aucun TDEE fabriqué', o.tdee === null, String(o.tdee));
  t('B-CCCXLV ② ⭐⭐ CAS A · aucune macro fabriquée',
    o.kcal === null && o.p === null && o.l === null && o.g === null, JSON.stringify(o));
  t('B-CCCXLV ③ ⭐⭐ CAS A · plus aucun « 1 500 » à l\'écran', e.n1500 === 0, 'il en reste ' + e.n1500);
  t('B-CCCXLV ④ ⭐ CAS A · l\'écran dit que le calcul n\'est pas disponible', e.msg, 'message absent');
  t('B-CCCXLV ⑤ ⛔ CAS A · « — », jamais 0 ni null', e.tdee === '—' && e.bmr === '—' && e.kcal === '—',
    JSON.stringify([e.bmr, e.tdee, e.kcal]));
  t('B-CCCXLV ⑥ ⛔ CAS A · et rien ne fuit sous forme de NaN/null/undefined', !e.nan, 'une fuite est visible');

  // ═══ CAS B — poids seul ════════════════════════════════════════════════════
  await poser('S.bw=85.9;S.height=0;S.age=0;');
  o = await calc(); e = await ecran();
  t('B-CCCXLV ⑦ ⭐⭐ CAS B · le poids seul ne suffit pas (c\'était 1500 · 189 · 77 · 13)',
    o.kcal === null && o.p === null, JSON.stringify(o));
  t('B-CCCXLV ⑧ ⭐ CAS B · le message ne réclame QUE ce qui manque',
    e.msg && o.mq.length === 2 && o.mq.join('|') === 'ta taille|ton âge', JSON.stringify(o.mq));

  // ═══ CAS C — poids + taille (une partie seulement) ═════════════════════════
  await poser('S.bw=85.9;S.height=180;S.age=0;');
  o = await calc();
  t('B-CCCXLV ⑨ CAS C · une partie seulement ne suffit pas',
    o.tdee === null && o.kcal === null, JSON.stringify(o));

  // ═══ CAS D — PROFIL COMPLET : rien ne doit avoir bougé ═════════════════════
  await poser('S.bw=85.9;S.height=180;S.age=48;');
  o = await calc(); e = await ecran();
  t('B-CCCXLV ⑩ ⭐⭐ CAS D · le vrai calcul est INTACT (2711 / 3161 / 189 / 77 / 428)',
    o.tdee === 2711 && o.kcal === 3161 && o.p === 189 && o.l === 77 && o.g === 428,
    JSON.stringify(o));
  t('B-CCCXLV ⑪ ⭐ CAS D · et l\'écran n\'affiche plus le message',
    !e.msg && e.tdee === '2 711' && e.prot === '189', JSON.stringify([e.msg, e.tdee, e.prot]));

  // ═══ CAS E — une donnée requise vaut 0 ═════════════════════════════════════
  await poser('S.bw=85.9;S.height=0;S.age=48;');
  o = await calc();
  t('B-CCCXLV ⑫ ⛔ CAS E · un 0 n\'est pas une taille', o.kcal === null && o.ind === true, JSON.stringify(o));

  // ═══ CAS F — donnée non numérique ══════════════════════════════════════════
  await poser("S.bw='abc';S.height='';S.age=null;");
  o = await calc(); e = await ecran();
  t('B-CCCXLV ⑬ ⭐⭐ CAS F · plus aucun NaN (les 3 macros en produisaient)',
    o.p === null && o.l === null && o.g === null && !e.nan, JSON.stringify(o) + ' fuite=' + e.fuite);
  /* ⭐ TROUVÉ PAR CE TÉMOIN, PAS PAR LE BRIEF : l'hydratation multiplie elle aussi le poids,
     et affichait « NaN L/jour ». *Toute case qui multiplie le poids hérite du même trou.* */
  t('B-CCCXLV ⑬bis ⭐ CAS F · l\'hydratation non plus ne sort pas un NaN',
    e.hydra === '—', e.hydra);

  // ═══ LE CAS QUE LE BRIEF N'AVAIT PAS — workType sur un profil vide ═════════
  await poser("S.bw=0;S.height=0;S.age=0;S.workType='physique';");
  o = await calc();
  t('B-CCCXLV ⑭ ⭐⭐ un métier « physique » ne fabrique plus un TDEE de 450 sur un BMR nul',
    o.tdee === null, String(o.tdee));

  // ═══ LE CAS MANUEL — ce que la personne a tapé n'est pas fabriqué ══════════
  await poser('S.bw=0;S.height=0;S.age=0;S.manualKcal=2200;');
  o = await calc();
  t('B-CCCXLV ⑮ ⭐ un objectif manuel TIENT — c\'est le chiffre de la personne, pas celui de l\'app',
    o.kcal === 2200, JSON.stringify(o));
  t('B-CCCXLV ⑯ ⛔⛔ … mais sans poids la répartition reste vide (c\'était 0 P / 0 L / 550 G)',
    o.p === null && o.l === null && o.g === null, JSON.stringify(o));
  t('B-CCCXLV ⑰ ⛔ et aucun plancher n\'est annoncé sur un calcul inexistant',
    o.plancher === null, JSON.stringify(o.plancher));
  /* ⚠️ Le chemin qui LEVAIT une erreur : objectif manuel + profil incomplet → `autoCalories`
     vaut `null`, et `null.toLocaleString()` faisait disparaître le bloc entier. */
  const modale = await pg.evaluate(async () => {
    try { openKcalEdit(); await new Promise(r => setTimeout(r, 250));
      return { ouverte: !!document.querySelector('#ov-kcal-edit.open'),
               txt: (document.getElementById('kcal-edit-auto') || {}).textContent || '' };
    } catch (err) { return { ouverte: false, txt: 'ERREUR ' + err.message }; }
  });
  t('B-CCCXLV ⑱ ⭐ la modale « ajuster mes calories » s\'ouvre encore, et explique',
    modale.ouverte && /ne peut pas encore calculer/.test(modale.txt), JSON.stringify(modale));
  await pg.evaluate(() => { const o = document.getElementById('ov-kcal-edit'); if (o) o.classList.remove('open'); });

  // ═══ CAS G — RECHARGEMENT COMPLET, lu sur le disque ════════════════════════
  await poser('S.bw=0;S.height=0;S.age=0;');
  await pg.reload(); await pg.waitForTimeout(2000);
  e = await ecran(); o = await calc();
  t('B-CCCXLV ⑲ ⭐⭐ CAS G · après un vrai rechargement, aucun faux plan ne revient',
    e.n1500 === 0 && e.msg && o.kcal === null, JSON.stringify([e.n1500, e.msg, o.kcal]));

  /* ⛔ UNE JOURNÉE NOTÉE SUR UN PROFIL INCOMPLET : on compte ce qui est mangé, on ne le
     compare à rien — et surtout on n'invente pas de cible pour faire joli (R24/P21). */
  await pg.evaluate(() => {
    S.foodLog = [{ date: today(), ts: 1, id: 'x1', name: 'Test', kcal: 600, prot: 30, carbs: 60, fat: 20 }];
    persist();
  });
  e = await ecran();
  t('B-CCCXLV ⑳ ⭐ ce qui a été noté reste visible, sans cible inventée',
    e.msg && e.n1500 === 0 && !e.nan, JSON.stringify(e));

  t('B-CCCXLV ㉑ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
