/* ══════════════════════════════════════════════════════════════════════════════════════
   🧠 « CE QUE L'APP A APPRIS DE TON ALIMENTATION » — UNE HABITUDE DOIT ÊTRE SOUTENUE
   PAR LE JOURNAL (22/09/2026)

   Cas réel de Michel, sur son téléphone : *« Petit-déj ~12h »* · *« Collation 2 · Pom'Potes »*
   (prise 1 ou 2 fois) · *« Dîner · prune »* (prise 2 fois), sur ~33 jours notés étalés sur 76.

   ⛔⛔ REPRODUIT AVANT D'ÊTRE CORRIGÉ, dans l'app servie. Les quatre symptômes sortent à
   l'identique sur un journal synthétique, et chacun a une cause distincte :

     ① « ~12h »     `pa.heures[m]` est la médiane de `new Date(e.ts).getHours()` — or `ts` vaut
                    `Date.now()` À L'ENREGISTREMENT, et `FOOD_MEALS` ne porte AUCUNE heure.
                    *L'app ne sait pas quand on a mangé, elle sait quand on a tapé.*
     ② Pom'Potes    « Collation 2 » n'avait que **2 jours notés** : seule candidate, donc
                    affichée quoi qu'il arrive.
     ③ prune        `top(o,3)` prend les 3 premiers PAR FRÉQUENCE, **sans aucun seuil** — donc
                    2 occurrences passent à côté d'un aliment 27× plus fréquent.
                    👉 *Un « top 3 » ne demande jamais si le 2ᵉ est une habitude : il demande
                    seulement s'il existe un 2ᵉ.*

   ⛔⛔ ET UNE SUSPICION DU BRIEF EST INFIRMÉE, écrite ici plutôt que masquée (R38) : il n'y a
   **ni `slice()` sur les dernières lignes, ni fenêtre glissante, ni tri supposé, ni `[0]`**.
   La population EST le journal entier, et le « 33 jours sur 76 » affiché est honnête.

   ⛔ AUCUN SEUIL INVENTÉ : le nombre employé est `_PA_MIN_JOURS`, **déjà** déclaré dans le
   fichier et **déjà** appliqué deux fois (le seuil du « pas encore de quoi dégager une
   habitude », et le minimum des horaires). ⭐ Mesuré sur 10 aliments de fréquences variées :
   il sort Kebab (1 j), Prune (2 j) et Pom'Potes (repas vu 2 j) **sans perdre une seule
   habitude réelle** — y compris la pizza tous les 11 jours, qu'un seuil en POURCENTAGE aurait
   éliminée.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  /* ⚠️ Commentaires neutralisés : ceux du correctif citent `_PA_MIN_JOURS`, `joursRepas`,
     `_afMealDefautHoraire` et « heure de saisie » en toutes lettres (R30). */
  const A = brut.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const nu = A.replace(/\s+/g, '');
  const SC = fs.readFileSync(path.join(ROOT, 'screens.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1').replace(/\s+/g, '');
  const corps = (n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(A);
    if (!m) return '';
    const i = m.index + m[0].length - 1; let d = 0;
    for (let j = i; j < A.length; j++) {
      if (A[j] === '{') d++; else if (A[j] === '}') { d--; if (!d) return A.slice(i, j + 1); }
    }
    return '';
  };
  const PA = corps('_profilAlimentaire').replace(/\s+/g, '');

  console.log('\n═══ B-CCCXLVIII. Les habitudes alimentaires, figées dans la source ═══');

  /* ── LE SEUIL N'EST PAS INVENTÉ : c'est celui qui existait déjà ────────────── */
  t('B-CCCXLVIII ① ⭐ le seuil employé est `_PA_MIN_JOURS`, pas un nombre neuf',
    /const_PA_MIN_JOURS=3;/.test(nu), 'la constante a changé ou disparu');
  /* ⛔⛔ L'INVARIANT JUSTE N'EST PAS « COMBIEN » MAIS « D'OÙ VIENT LE NOMBRE » : un témoin qui
     figerait `>= 3` resterait vert si quelqu'un écrivait un 3 en dur à côté (R2, et le défaut
     d'instrument déjà payé en ft-v1226). On exige donc que la constante soit LUE. */
  t('B-CCCXLVIII ② ⛔⛔ aucun seuil de jours écrit en dur dans la fonction',
    !/jours>=[0-9]/.test(PA) && !/\.length<[0-9]\)return/.test(PA.replace(/length<3\)return;/, '')),
    'un nombre en dur a été réintroduit');
  t('B-CCCXLVIII ③ ⭐ il est lu au moins deux fois (le repas ET l\'aliment)',
    (PA.match(/_PA_MIN_JOURS/g) || []).length >= 3, 'une des deux barres a sauté');

  /* ── ① LE REPAS DOIT AVOIR ÉTÉ OBSERVÉ ────────────────────────────────────── */
  t('B-CCCXLVIII ④ ⭐⭐ un repas vu trop peu de jours ne produit AUCUNE habitude',
    /if\(Object\.keys\(joursRepas\[m\]\|\|\{\}\)\.length<_PA_MIN_JOURS\)return;constl=/.test(PA),
    'le filtre sur la population du repas a disparu');
  t('B-CCCXLVIII ⑤ ⭐ les jours d\'un repas sont bien COMPTÉS, pas déduits',
    /\(joursRepas\[m\]=joursRepas\[m\]\|\|\{\}\)\[d\]=1;/.test(PA),
    'joursRepas n\'est plus alimenté');

  /* ── ② L'ALIMENT SE COMPTE EN JOURS, PAS EN LIGNES ────────────────────────── */
  t('B-CCCXLVIII ⑥ ⭐⭐ un aliment doit revenir sur assez de JOURS différents',
    /\.filter\(a=>a\.jours>=_PA_MIN_JOURS\)/.test(PA), 'le filtre par aliment a disparu');
  t('B-CCCXLVIII ⑦ ⛔ et « jours » est bien un compte de dates distinctes',
    /jours:Object\.keys\(a\.jours\)\.length/.test(PA) && /if\(d\)parRepas\[m\]\[k\]\.jours\[d\]=1;/.test(PA),
    'on est revenu à un compte de lignes');

  /* ── LE DÉPARTAGE NE DÉPEND PLUS DE L'ORDRE DU TABLEAU ────────────────────── */
  t('B-CCCXLVIII ⑧ ⭐⭐ départage déterministe : jours, puis lignes, puis le NOM',
    /\.sort\(\(a,b\)=>\(b\.jours-a\.jours\)\|\|\(b\.n-a\.n\)\|\|a\.nom\.localeCompare\(b\.nom,'fr'\)\)/.test(PA),
    'l\'ordre du tableau peut de nouveau décider de l\'affichage');
  t('B-CCCXLVIII ⑨ ⛔ et le vieux `top(o,3)` ne pilote plus les habitudes',
    !/habitudes\[m\]=top\(/.test(PA), 'le top-3 sans seuil est revenu');

  /* ── ③ L'HEURE : on ne présente plus une heure de SAISIE comme une heure de REPAS ─ */
  t('B-CCCXLVIII ⑩ ⭐⭐ l\'heure est confrontée à la règle horaire de l\'app',
    /_FAMILLE\[_afMealDefautHoraire\(h\)\]!==attendu\)return;/.test(PA),
    'une heure de saisie peut de nouveau passer pour une heure de repas');
  /* ⛔⛔ ON N'A PAS FABRIQUÉ UNE SECONDE TABLE D'HORAIRES (R2) : le barème doit rester chez
     son propriétaire. Un témoin qui ne chercherait que l'appel resterait vert si quelqu'un
     recopiait `h<11?...` dans la carte. */
  t('B-CCCXLVIII ⑪ ⛔⛔ aucune 2ᵉ table d\'horaires : le barème n\'est écrit qu\'une fois',
    (nu.match(/h<11\?'petitdej'/g) || []).length === 1, 'le barème horaire est dupliqué');
  t('B-CCCXLVIII ⑫ ⛔ échec fermé si le propriétaire du barème manque',
    /if\(typeof_afMealDefautHoraire!=='function'\)return;/.test(PA),
    'une heure pourrait s\'afficher sans avoir été vérifiée');
  /* ⚠️ La règle n'a que 4 cases pour 5 repas — la limite est ÉCRITE, pas masquée. */
  t('B-CCCXLVIII ⑬ ⭐ les deux collations partagent la case `collation` de la règle',
    /const_FAMILLE=\{petitdej:'petitdej',dejeuner:'dejeuner',collation:'collation',collation2:'collation',diner:'diner'\};/.test(PA),
    'la correspondance des familles a changé');
  t('B-CCCXLVIII ⑭ ⛔ un repas hors de la règle (`autre`) n\'affiche jamais d\'heure',
    /if\(!attendu\)return;/.test(PA), 'un repas sans case peut afficher une heure');
  t('B-CCCXLVIII ⑮ ⛔ et l\'heure exige la même population que les aliments',
    /if\(hs\.length<3\)return;if\(Object\.keys\(joursRepas\[m\]\|\|\{\}\)\.length<_PA_MIN_JOURS\)return;/.test(PA),
    'une heure peut s\'afficher sans aucun aliment à côté');

  /* ── LE PROPRIÉTAIRE DU BARÈME RESTE COMPATIBLE ──────────────────────────── */
  t('B-CCCXLVIII ⑯ ⛔⛔ `_afMealDefautHoraire()` sans argument garde son comportement',
    /functio?n?_afMealDefautHoraire\(heure\)\{consth=\(heure===undefined\|\|heure===null\|\|!isFinite\(\+heure\)\)\?newDate\(\)\.getHours\(\):\+heure;/
      .test(nu), 'le repli sur l\'heure courante a changé : le repas actif est touché');
  t('B-CCCXLVIII ⑰ ⛔ le repas actif l\'appelle toujours SANS argument',
    /return_afMealDefautHoraire\(\);/.test(nu), 'le repas actif passe désormais une heure');

  /* ── LA POPULATION N'A PAS BOUGÉ (la suspicion infirmée) ──────────────────── */
  t('B-CCCXLVIII ⑱ ⛔⛔ aucune fenêtre, aucun `slice` sur le journal',
    !/fl\.slice\(/.test(PA) && !/\.slice\(-/.test(PA), 'une fenêtre glissante est apparue');
  t('B-CCCXLVIII ⑲ ⛔ les jours restent TRIÉS avant d\'être bornés (pas de `[0]` aveugle)',
    /constjours=Object\.keys\(parJour\)\.sort\(\);/.test(PA), 'le tri des jours a disparu');

  /* ── L'ÉCRAN ─────────────────────────────────────────────────────────────── */
  /* ⚠️ L'APOSTROPHE EST ÉCHAPPÉE DANS LA SOURCE (`d\'habitude`) : un motif qui la cherche nue
     rougit sur du code parfaitement sain. *Quand on lit la source brute, on lit AUSSI ses
     échappements* — même famille que le piège de l'espace, appliquée aux guillemets. */
  t('B-CCCXLVIII ⑳ ⭐ une liste vide ne rend plus un cadre muet',
    /Pasencored\\?'habitudequisedégage/.test(SC), 'le cas « aucune habitude » n\'est plus dit');
};

module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{try{if(localStorage.getItem('_decorHab')==='1')return;
    localStorage.clear();localStorage.setItem('_decorHab','1');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXLIX. Les habitudes, conduites dans le navigateur --');

  /* ⛔ Un journal se DÉCRIT, il ne se bricole pas ligne à ligne : chaque cas dit ses aliments
     par repas, le nombre de jours, et l'heure à laquelle la ligne a été ENREGISTRÉE. */
  const poser = (spec) => pg.evaluate(s => {
    const iso = d => new Date(2026, 6, 1 + d).toISOString().slice(0, 10);
    const J = [];
    s.forEach(x => {
      for (let i = 0; i < x.jours; i++) {
        const d = (x.decale || 0) + i;
        (x.noms || [x.nom]).forEach(n => J.push({
          date: iso(d), meal: x.meal, name: n,
          ts: new Date(2026, 6, 1 + d, x.h, 0, 0).getTime(),
          kcal: 100, prot: 5, carbs: 10, fat: 2
        }));
      }
    });
    S.foodLog = J; persist();
    const pa = _profilAlimentaire();
    return { hab: Object.keys(pa.habitudes).reduce((o, m) => { o[m] = pa.habitudes[m].map(x => x.nom); return o; }, {}),
             heures: pa.heures, nbJours: pa.nbJours, lignes: J.length };
  }, spec);

  // ═══ A — un aliment fréquent passe devant un exceptionnel ══════════════════
  let o = await poser([
    { meal: 'diner', nom: 'Saumon', jours: 30, h: 20 },
    { meal: 'diner', nom: 'Prune', jours: 2, h: 20, decale: 40 },
  ]);
  t('B-CCCXLIX ① ⭐⭐ CAS A · l\'aliment fréquent est là',
    (o.hab.diner || []).indexOf('Saumon') >= 0, JSON.stringify(o.hab));
  t('B-CCCXLIX ② ⭐⭐ CAS B · l\'aliment vu 2 fois n\'est PAS une habitude (le cas « prune »)',
    (o.hab.diner || []).indexOf('Prune') < 0, JSON.stringify(o.hab));

  // ═══ LE CAS « POM'POTES » — le repas lui-même est trop peu observé ══════════
  o = await poser([
    { meal: 'dejeuner', nom: 'Poulet', jours: 30, h: 13 },
    { meal: 'collation2', nom: "Pom'Potes", jours: 2, h: 17, decale: 40 },
  ]);
  t('B-CCCXLIX ③ ⭐⭐ un repas vu 2 jours ne produit AUCUNE habitude, même seul candidat',
    o.hab.collation2 === undefined, JSON.stringify(o.hab));
  t('B-CCCXLIX ④ ⛔ … et il n\'affiche pas d\'heure non plus',
    o.heures.collation2 === undefined, JSON.stringify(o.heures));

  // ═══ C — la récence seule ne gagne pas ═════════════════════════════════════
  o = await poser([
    { meal: 'dejeuner', nom: 'Poulet', jours: 15, h: 13 },
    { meal: 'dejeuner', nom: 'Kebab', jours: 1, h: 13, decale: 60 },
  ]);
  t('B-CCCXLIX ⑤ ⭐⭐ CAS C · 1 fois hier ne bat pas 15 fois avant',
    (o.hab.dejeuner || []).join('|') === 'Poulet', JSON.stringify(o.hab));

  // ═══ D — égalité : départage déterministe ══════════════════════════════════
  o = await poser([{ meal: 'petitdej', noms: ['Zeste', 'Avoine'], jours: 20, h: 8 }]);
  const egalite1 = (o.hab.petitdej || []).join('|');
  t('B-CCCXLIX ⑥ ⭐ CAS D · à égalité, le nom tranche (ordre alphabétique)',
    egalite1 === 'Avoine|Zeste', egalite1);

  // ═══ G — historique non trié : même résultat ═══════════════════════════════
  const inverse = await pg.evaluate(() => {
    S.foodLog = (S.foodLog || []).slice().reverse(); persist();
    const pa = _profilAlimentaire();
    return Object.keys(pa.habitudes).reduce((o, m) => { o[m] = pa.habitudes[m].map(x => x.nom); return o; }, {});
  });
  t('B-CCCXLIX ⑦ ⭐⭐ CAS G · tableau inversé, résultat IDENTIQUE',
    (inverse.petitdej || []).join('|') === egalite1, JSON.stringify(inverse));

  // ═══ E + F — les horaires ══════════════════════════════════════════════════
  /* ⭐ LE CAS DE MICHEL : petit-déjeuner réellement pris le matin, SAISI à midi. */
  o = await poser([{ meal: 'petitdej', nom: 'Avoine', jours: 30, h: 12 }]);
  t('B-CCCXLIX ⑧ ⭐⭐ CAS F · un petit-déj SAISI à 12 h n\'affiche plus « ~12h »',
    o.heures.petitdej === undefined, JSON.stringify(o.heures));
  t('B-CCCXLIX ⑨ ⭐ … mais l\'aliment, lui, reste : on perd l\'heure, pas l\'habitude',
    (o.hab.petitdej || []).join('|') === 'Avoine', JSON.stringify(o.hab));

  /* ⭐ ET QUELQU'UN QUI NOTE EN DIRECT GARDE SON HEURE — sinon on aurait « corrigé » en
     supprimant l'information pour tout le monde. */
  o = await poser([
    { meal: 'petitdej', nom: 'Avoine', jours: 30, h: 8 },
    { meal: 'dejeuner', nom: 'Poulet', jours: 30, h: 13 },
    { meal: 'diner', nom: 'Saumon', jours: 30, h: 20 },
  ]);
  t('B-CCCXLIX ⑩ ⭐⭐ CAS E · noté en direct, les trois heures sont conservées',
    o.heures.petitdej === 8 && o.heures.dejeuner === 13 && o.heures.diner === 20,
    JSON.stringify(o.heures));

  /* ⛔ Une heure aberrante pour le repas observé ne passe pas non plus. */
  o = await poser([{ meal: 'diner', nom: 'Saumon', jours: 30, h: 9 }]);
  t('B-CCCXLIX ⑪ ⛔ un « dîner » enregistré à 9 h n\'affiche pas d\'heure',
    o.heures.diner === undefined, JSON.stringify(o.heures));

  // ═══ H — la période annoncée est bien celle employée ═══════════════════════
  o = await poser([
    { meal: 'dejeuner', nom: 'Ancien', jours: 20, h: 13 },
    { meal: 'dejeuner', nom: 'Recent', jours: 4, h: 13, decale: 60 },
  ]);
  t('B-CCCXLIX ⑫ ⭐⭐ CAS H · le calcul porte sur TOUT le journal, pas sur la fin',
    o.nbJours === 24 && (o.hab.dejeuner || [])[0] === 'Ancien', JSON.stringify([o.nbJours, o.hab]));

  /* ⛔ LA CARTE À L'ÉCRAN — ce que Michel lit réellement. */
  const carte = await pg.evaluate(async () => {
    goScreen('nutrition', document.querySelector('[onclick*="nutrition"]'));
    await new Promise(r => setTimeout(r, 200));
    renderNutrition();
    await new Promise(r => setTimeout(r, 500));
    const el = document.getElementById('nu-appris');
    return (el && el.innerText) || '';
  });
  t('B-CCCXLIX ⑬ ⭐ la carte affiche l\'habitude et sa population',
    /Ancien/.test(carte) && /24 jours notés/.test(carte), carte.slice(0, 160));
  t('B-CCCXLIX ⑭ ⛔ et aucune fuite `NaN`/`undefined` dans la carte',
    !/NaN|undefined|null/.test(carte), carte.slice(0, 160));

  /* ⛔ LE CAS VIDE, ET IL A DEMANDÉ UNE CORRECTION DE MA PART : mon premier scénario mettait
     2 jours en tout, donc la carte partait sur sa branche « insuffisant » (< 3 jours notés) et
     ne testait pas ce que je croyais. Ici **6 jours sont notés** — assez pour que la carte
     parle — mais **aucun repas n'atteint 3 jours**. *C'est exactement le trou ouvert par le
     correctif : assez de journal pour dire quelque chose, pas assez par repas pour dire quoi.* */
  o = await poser([
    { meal: 'diner', nom: 'Saumon', jours: 2, h: 20 },
    { meal: 'dejeuner', nom: 'Poulet', jours: 2, h: 13, decale: 10 },
    { meal: 'petitdej', nom: 'Avoine', jours: 2, h: 8, decale: 20 },
  ]);
  t('B-CCCXLIX ⑭bis ⛔ assez de jours notés, mais aucun repas retenu',
    o.nbJours === 6 && Object.keys(o.hab).length === 0, JSON.stringify([o.nbJours, o.hab]));
  const vide = await pg.evaluate(async () => {
    renderNutrition(); await new Promise(r => setTimeout(r, 400));
    const el = document.getElementById('nu-appris');
    return (el && el.innerText) || '';
  });
  /* ⚠️⚠️ TÉMOIN RETOURNÉ LE 22/09/2026, ET IL N'EST PAS AFFAIBLI — il figeait une PHRASE
     (« Pas encore d'habitude qui se dégage ») alors que sa garantie annoncée est *« la carte
     le DIT au lieu de rester muette »*. Depuis l'ordre fixe, la carte tient cette garantie
     MIEUX : elle affiche les 5 repas, chacun avec son état vide explicite, au lieu d'un
     paragraphe unique. 👉 ***Un témoin qui fige une formulation interdit d'améliorer ce qu'il
     protège*** — même famille que `B-CCCXXXVI ②`, qui figeait une signature. On mesure donc
     les deux choses qui comptent : le cadre n'est pas muet, et il NOMME chaque repas.
     ⛔ L'ancienne phrase reste éprouvée par ailleurs : `B-CCCXLVIII ⑳` la trouve toujours dans
     la source, où elle sert désormais d'échec fermé si `FOOD_MEALS` est introuvable. */
  t('B-CCCXLIX ⑮ ⭐ aucun repas retenu → la carte le DIT au lieu de rester muette',
    /Pas encore assez de données/.test(vide)
    && ['Petit-déj', 'Collation', 'Déjeuner', 'Collation 2', 'Dîner'].every(l => vide.indexOf(l) >= 0),
    vide.slice(0, 160));

  t('B-CCCXLIX ⑯ ⛔ aucune erreur de page sur tout le parcours', errs.length === 0, errs.join(' | '));
  await cx.close();
};
