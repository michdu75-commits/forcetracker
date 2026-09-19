/* ══════════════════════════════════════════════════════════════════════════════════════
   NUTRITION UX #1 — LE REPAS CHOISI À LA MAIN RESTE ACTIF (19/09/2026)

   Cas réel de Michel : il remplit sa journée en retard, choisit **Déjeuner**, ajoute un
   aliment… et l'application revient toute seule sur le repas que suggère l'HEURE.

   ⛔⛔ CE N'ÉTAIT PAS UNE GÊNE D'AFFICHAGE : mesuré sur l'app servie, horloge gelée à 09 h,
   le 1ᵉʳ aliment tombait dans `dejeuner` et les DEUX SUIVANTS dans `petitdej`. Même forme à
   16 h (`collation`) et à 21 h (`diner`). *Une journée rentrée après coup s'éparpillait dans
   des repas que personne n'avait choisis.*

   ⭐ LA RÈGLE QUE CES TÉMOINS FIGENT : *l'heure décide du DÉFAUT, jamais de ce qui a été
   DÉCIDÉ.* Priorité — choix de la personne > suggestion horaire.

   ⛔ ET ON MESURE DEUX CHOSES, PAS UNE (consigne explicite, U8) : l'ÉTAT (la puce sélectionnée)
   ET la DONNÉE réellement écrite dans `S.foodLog`. *Un onglet juste et une écriture fausse est
   pire qu'un onglet faux* — c'est exactement la forme qu'avait le défaut.

   ⛔ FICHIER À PART, comme `accueil_mini.js` et `pots_nutrition.js` : une mutation doit pouvoir
   être éprouvée en secondes, pas en relançant une passe de 25 minutes.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS : le commentaire de la correction cite `_afMeal`,
     `openAddFood` et la formule horaire en toutes lettres (R30 — la raison s'écrit à côté du
     code). Un témoin qui lirait le fichier brut resterait vert quoi qu'on remette dedans. */
  const A = brut.replace(/\/\*[\s\S]*?\*\//g, ' ')
                .replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');

  const corps = (n) => {
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

  console.log('\n═══ B-CCCXXXVI. Le repas actif — la cause, figée dans la source ═══');

  /* ⛔⛔ LE TÉMOIN CENTRAL. La cause tenait en une ligne : `openAddFood` recalculait le repas
     depuis l'heure à chaque ouverture. On mesure son ABSENCE là où elle était. */
  const OAF = corps('openAddFood');
  t('B-CCCXXXVI ① ⭐⭐ `openAddFood` ne touche plus au repas actif',
    OAF !== '' && !/_afMeal\s*=/.test(OAF) && !/getHours\(\)/.test(OAF),
    OAF === '' ? 'openAddFood introuvable' : 'elle y touche encore');

  /* ⭐ UN SEUL PROPRIÉTAIRE (R2) : une seule fonction répond à « dans quel repas écrit-on ? ». */
  t('B-CCCXXXVI ② ⭐ le repas employé a UN propriétaire, `_afMealActif`',
    /function _afMealActif\(\)/.test(A) && /function _afMealDefautHoraire\(\)/.test(A), '');

  /* ⛔ LE SIGNAL EST L'ABSENCE : `null` veut dire « personne n'a choisi ». S'il valait un repas
     par défaut, on ne pourrait plus distinguer un choix d'une suggestion — et la correction
     n'aurait plus de sens. */
  t('B-CCCXXXVI ③ ⭐⭐ l\'état ne porte que le choix EXPLICITE (`null` = rien de choisi)',
    /let _afMeal\s*=\s*null\s*;/.test(A), '');

  /* ⛔⛔ LES QUATRE LECTEURS PASSENT TOUS PAR LE PROPRIÉTAIRE. Une seule porte restée sur la
     variable brute écrirait `null` dans le journal — le genre de défaut qui ne se voit qu'au
     moment de relire ses repas, des jours plus tard. */
  /* ⚠️⚠️ PREMIER JET : CE TÉMOIN FIGEAIT UN NOMBRE (« au plus 4 lectures brutes ») et
     rougissait sur du code parfaitement sain — il y en a 5. *Un témoin qui fige une VALEUR
     mesure mon arithmétique mentale, pas le produit* (même faute qu'en ft-v1222).
     ⭐ L'invariant juste n'est pas « combien », c'est « **OÙ** » : toute lecture de la variable
     brute doit vivre dans `_afMealActif` ou dans `setFoodMeal`. Une lecture ailleurs, c'est
     une porte qui contourne le propriétaire — et elle écrirait `null` dans le journal. */
  const horsProprietaire = (() => {
    const zones = corps('_afMealActif') + corps('setFoodMeal');
    const total = (A.match(/(?<!function\s)_afMeal(?![A-Za-z])/g) || []).length;
    const dedans = (zones.match(/(?<!function\s)_afMeal(?![A-Za-z])/g) || []).length;
    const declaration = (A.match(/let\s+_afMeal\s*=/g) || []).length;
    return total - dedans - declaration;
  })();
  const viaProprietaire = (A.match(/_afMealActif\(\)/g) || []).length;
  t('B-CCCXXXVI ④ ⭐⭐ toute lecture brute vit chez le propriétaire, aucune ailleurs',
    viaProprietaire >= 4 && horsProprietaire === 0,
    'via le propriétaire : ' + viaProprietaire + ' · lectures brutes hors zone : ' + horsProprietaire);

  /* ⭐ Les deux ÉCRIVAINS du journal nomment le propriétaire : c'est là que la donnée se fige. */
  t('B-CCCXXXVI ⑤ ⭐⭐ les DEUX écrivains du journal écrivent le repas du propriétaire',
    (A.match(/meal:_afMealActif\(\)/g) || []).length === 2,
    (A.match(/meal:_afMealActif\(\)/g) || []).length + ' écrivain(s)');

  /* ⭐ Le choix manuel reste le seul à écrire l'état. */
  /* ⚠️ ON EXCLUT LA DÉCLARATION. Premier jet : le motif comptait aussi `let _afMeal=null`,
     donc il annonçait 2 au lieu de 1 et serait resté ROUGE sur une correction parfaitement
     juste. *Un compteur d'écritures qui compte la déclaration mesure autre chose que ce qu'il
     annonce* — exactement le défaut de mon compteur d'appels de ft-v1224. */
  const ecritures = (A.match(/(?<!let\s)_afMeal\s*=(?!=)/g) || []).length;
  t('B-CCCXXXVI ⑥ ⭐ seul `setFoodMeal` écrit le choix',
    /* ⚠️⚠️ ET LE PIÈGE DE L'ESPACE, DANS LE COMMIT MÊME OÙ JE LE CORRIGEAIS AILLEURS :
       le motif cherchait `function setFoodMeal` AVEC un espace dans une source dont on vient
       de retirer TOUS les espaces. 8ᵉ fois dans ce dépôt. *Quand on nettoie la source, il faut
       nettoyer le motif du même geste — sinon le garde mesure sa propre mise en forme.* */
    ecritures === 1 && /functionsetFoodMeal\(k\)\{_afMeal=k;/.test(A.replace(/\s+/g, '')),
    ecritures + ' écriture(s) hors déclaration');

  /* ⛔ ÉCHEC FERMÉ : une clé qui n'existe pas dans FOOD_MEALS ne doit pas atteindre le journal. */
  t('B-CCCXXXVI ⑦ ⛔ un repas inconnu retombe sur la suggestion, jamais sur une valeur inventée',
    /FOOD_MEALS\.some\(m=>m\.k===_afMeal\)/.test(A.replace(/\s+/g, '')), '');

  /* ⛔⛔ PÉRIMÈTRE — la consigne de Michel est que RIEN d'autre ne bouge. Ces trois témoins le
     figent là où la tentation était la plus grande. */
  t('B-CCCXXXVI ⑧ ⛔ aucun timer ni `setTimeout` n\'a été ajouté autour du repas actif',
    !/setTimeout[^;]{0,60}_afMeal/.test(A) && !/_afMeal[^;]{0,60}setTimeout/.test(A), '');
  t('B-CCCXXXVI ⑨ ⛔ les compteurs IA et leur table ne sont pas touchés',
    /constFOOD_AI_FREE_LIMIT=25;/.test(A.replace(/\s+/g, ''))
      && /constFOOD_AI_POTS=\{/.test(A.replace(/\s+/g, '')), '');
  t('B-CCCXXXVI ⑩ ⛔ les cinq repas et leurs clés sont inchangés',
    ['petitdej', 'collation', 'dejeuner', 'collation2', 'diner']
      .every(k => new RegExp("k:'" + k + "'").test(A.replace(/\s+/g, ''))), '');
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   B-CCCXXXVII — LES HUIT CAS DE MICHEL, CONDUITS DANS LE NAVIGATEUR

   ⏰ L'HORLOGE EST GELÉE, et ce n'est pas un confort : sans ça, le même témoin rendrait un
   verdict différent selon l'heure à laquelle la passe tourne. C'est la famille « fuseaux
   horaires » de `BUGS.md`, appliquée à l'instrument plutôt qu'au produit.
   ⭐ Et on gèle à **09 h** exprès : c'est l'heure où le défaut horaire (`petitdej`) DIFFÈRE du
   choix manuel qu'on va poser (`dejeuner`). *Un banc calé sur une heure où les deux coïncident
   serait resté vert sur le code d'avant.*
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  const GEL = '2026-09-19T09:10:00';
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await pg.addInitScript(`(()=>{try{localStorage.clear();
    localStorage.setItem('ft4_bw','80');localStorage.setItem('ft4_age','30');
    localStorage.setItem('ft4_ht','178');localStorage.setItem('ft4_gender','H');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXXXVII. Le repas choisi reste actif (conduit, horloge gelée à 09 h) --');

  const R = await pg.evaluate(async () => {
    const o = {}; const pause = ms => new Promise(r => setTimeout(r, ms));
    /* ⛔ chaque geste rend un résultat : une étape interrompue ne doit pas ressembler à une
       étape verte (BUGS.md §61). */
    const puce = () => {
      const el = document.getElementById('af-meal-chips');
      if (!el) return '(pas de puces)';
      const s = [...el.querySelectorAll('button')]
        .find(x => /font-weight:\s*700/.test(x.getAttribute('style') || ''));
      return s ? s.innerText.replace(/\s+/g, ' ').trim() : '(aucune)';
    };
    const actif = () => (typeof _afMealActif === 'function') ? _afMealActif() : '(absent)';
    const ajouter = async (nom, kcal) => {
      try {
        document.getElementById('af-desc').value = nom;
        document.getElementById('af-kcal').value = String(kcal);
        document.getElementById('af-prot').value = '10';
        document.getElementById('af-carbs').value = '10';
        document.getElementById('af-fat').value = '1';
        addFoodEntry(); await pause(450); return true;
      } catch (e) { o.err = String(e && e.message || e); return false; }
    };
    const journal = () => (S.foodLog || []).map(e => e.name + '=' + e.meal);

    try {
      S.foodLog = []; persist();
      goScreen('s-nutrition', document.querySelector('[onclick*="s-nutrition"]'));
      await pause(350);
      switchNuTab('journal', document.getElementById('ntab-journal'));
      await pause(350);

      // ── U1 : le défaut horaire fonctionne toujours (09 h → Petit-déj) ───────────
      openAddFood(); await pause(300);
      o.u1 = { actif: actif(), puce: puce() };

      // ── U2 : choix manuel ──────────────────────────────────────────────────────
      setFoodMeal('dejeuner'); await pause(150);
      o.u2 = { actif: actif(), puce: puce() };

      // ── U3/U4 : trois ajouts d'affilée, avec RÉOUVERTURE entre chacun ──────────
      /* ⚠️ LA RÉOUVERTURE EST LE GESTE QUI FAISAIT MAL, et c'est elle qu'il faut conduire :
         on rouvre l'écran d'ajout pour CHAQUE aliment. Un banc qui ajouterait trois fois
         sans rouvrir serait resté vert sur le code d'avant. */
      o.u3ok = await ajouter('RIZ', 130);
      o.u3 = { actif: actif(), puce: puce(), journal: journal() };
      openAddFood(); await pause(300);
      o.u3bis = { actif: actif(), puce: puce() };
      o.u4aok = await ajouter('POULET', 165);
      openAddFood(); await pause(300);
      o.u4bok = await ajouter('THON', 116);
      o.u4 = { actif: actif(), journal: journal() };

      // ── U5 : la porte « mes aliments » (reprise d'un favori) ───────────────────
      /* ⭐ C'est le SECOND écrivain du journal (`quickAddFood`). Il doit écrire le même repas
         que le formulaire — sinon la correction ne serait faite qu'à moitié (R8). */
      openAddFood(); await pause(300);
      o.u5avant = actif();
      try {
        _afQuickItems = [{ name: 'YAOURT', kcal: 60, prot: 5, carbs: 7, fat: 1, fav: false }];
        quickAddFood(0); await pause(450);
        o.u5ok = true;
      } catch (e) { o.u5ok = false; o.u5err = String(e && e.message || e); }
      o.u5 = { actif: actif(), journal: journal() };

      // ── U6 : la porte du scanner / code-barres (même ouvreur, `addFoodVia`) ────
      /* ⚠️ CE QU'ON CONDUIT ICI EST L'OUVREUR, PAS LE DÉCODAGE. `addFoodVia('bc')` est le
         chemin réel du bouton « code-barres » : c'est lui qui appelait `openAddFood`, donc
         lui qui écrasait le choix. ⛔ Ce qu'on NE couvre PAS est dit plutôt que masqué : la
         lecture zxing-wasm elle-même n'est pas rejouée (elle demande une caméra), et elle
         n'écrit pas le repas — elle remplit le formulaire, qui passe par le même écrivain. */
      try { addFoodVia('bc'); await pause(350); o.u6ok = true; }
      catch (e) { o.u6ok = false; o.u6err = String(e && e.message || e); }
      o.u6 = { actif: actif(), puce: puce() };
      o.u6bok = await ajouter('RATATOUILLE', 90);
      o.u6apres = { actif: actif(), journal: journal() };

      // ── U7 : changement volontaire ─────────────────────────────────────────────
      openAddFood(); await pause(300);
      setFoodMeal('diner'); await pause(150);
      o.u7 = { actif: actif(), puce: puce() };
      o.u7ok = await ajouter('SOUPE', 70);
      o.u7apres = { actif: actif(), journal: journal() };
    } catch (e) { o.FATAL = String(e && e.message || e); }
    return o;
  });

  // ── §8 : LA JOURNÉE ENTIÈRE, RENTRÉE EN RETARD ────────────────────────────────────
  /* ⭐⭐ LE SCÉNARIO QUE MICHEL A DÉCRIT MOT POUR MOT : quatre repas, neuf aliments, chacun
     ajouté en rouvrant l'écran. C'est le seul témoin qui prouve que la correction tient sur
     un parcours ENTIER et pas seulement sur deux ajouts. */
  const J = await pg.evaluate(async () => {
    const o = { erreurs: [] }; const pause = ms => new Promise(r => setTimeout(r, ms));
    try {
      S.foodLog = []; persist();
      const plan = [['petitdej', ['PAIN', 'BEURRE']],
                    ['dejeuner', ['RIZ', 'POULET', 'HARICOTS']],
                    ['collation', ['POMME']],
                    ['diner', ['SOUPE', 'OEUF', 'FROMAGE']]];
      for (const [repas, aliments] of plan) {
        openAddFood(); await pause(220);
        setFoodMeal(repas); await pause(120);
        for (const nom of aliments) {
          /* ⛔ on ROUVRE avant chaque aliment, comme la personne le fait vraiment */
          openAddFood(); await pause(220);
          if (_afMealActif() !== repas) o.erreurs.push('avant ' + nom + ' : ' + _afMealActif());
          document.getElementById('af-desc').value = nom;
          document.getElementById('af-kcal').value = '100';
          document.getElementById('af-prot').value = '5';
          document.getElementById('af-carbs').value = '10';
          document.getElementById('af-fat').value = '2';
          addFoodEntry(); await pause(400);
        }
      }
      o.journal = (S.foodLog || []).map(e => e.name + '=' + e.meal);
      o.attendu = ['PAIN=petitdej', 'BEURRE=petitdej', 'RIZ=dejeuner', 'POULET=dejeuner',
                   'HARICOTS=dejeuner', 'POMME=collation', 'SOUPE=diner', 'OEUF=diner',
                   'FROMAGE=diner'];
    } catch (e) { o.FATAL = String(e && e.message || e); }
    return o;
  });

  // ══ LES TÉMOINS ══════════════════════════════════════════════════════════════════
  t('B-CCCXXXVII ⓪ la sonde a tourné (pas de FATAL)', !R.FATAL && !J.FATAL,
    (R.FATAL || '') + ' ' + (J.FATAL || ''));

  t('B-CCCXXXVII ① U1 — sans choix, la suggestion horaire fonctionne (09 h → Petit-déj)',
    R.u1 && R.u1.actif === 'petitdej' && /Petit/.test(R.u1.puce), JSON.stringify(R.u1));

  t('B-CCCXXXVII ② U2 — un choix manuel devient le repas actif',
    R.u2 && R.u2.actif === 'dejeuner' && /Déjeuner/.test(R.u2.puce), JSON.stringify(R.u2));

  t('B-CCCXXXVII ③ U3 — après un ajout, le repas actif n\'a pas bougé',
    R.u3ok && R.u3.actif === 'dejeuner', JSON.stringify(R.u3 && R.u3.actif));

  /* ⛔⛔ LE TÉMOIN QUI MORD LE PLUS : c'est la RÉOUVERTURE qui écrasait le choix. */
  t('B-CCCXXXVII ④ ⭐⭐ U3 — … y compris après avoir ROUVERT l\'écran d\'ajout',
    R.u3bis && R.u3bis.actif === 'dejeuner' && /Déjeuner/.test(R.u3bis.puce),
    JSON.stringify(R.u3bis));

  t('B-CCCXXXVII ⑤ U4 — trois aliments d\'affilée restent dans le même repas',
    R.u4aok && R.u4bok && R.u4 && R.u4.actif === 'dejeuner'
      && JSON.stringify(R.u4.journal) === JSON.stringify(
           ['RIZ=dejeuner', 'POULET=dejeuner', 'THON=dejeuner']),
    JSON.stringify(R.u4 && R.u4.journal));

  t('B-CCCXXXVII ⑥ U5 — la reprise d\'un aliment (« mes aliments ») écrit le même repas',
    R.u5ok && R.u5avant === 'dejeuner' && R.u5.actif === 'dejeuner'
      && (R.u5.journal || []).indexOf('YAOURT=dejeuner') >= 0,
    (R.u5err || '') + ' ' + JSON.stringify(R.u5 && R.u5.journal));

  t('B-CCCXXXVII ⑦ U6 — ouvrir la porte code-barres ne change pas le repas actif',
    R.u6ok && R.u6 && R.u6.actif === 'dejeuner' && /Déjeuner/.test(R.u6.puce),
    (R.u6err || '') + ' ' + JSON.stringify(R.u6));
  t('B-CCCXXXVII ⑧ U6 — … et l\'aliment ajouté ensuite tombe bien dans ce repas',
    R.u6bok && (R.u6apres.journal || []).indexOf('RATATOUILLE=dejeuner') >= 0,
    JSON.stringify(R.u6apres && R.u6apres.journal));

  t('B-CCCXXXVII ⑨ U7 — un changement volontaire remplace immédiatement le repas',
    R.u7 && R.u7.actif === 'diner' && /Dîner/.test(R.u7.puce), JSON.stringify(R.u7));
  t('B-CCCXXXVII ⑩ ⭐⭐ U8 — et la DONNÉE suit : l\'aliment suivant est écrit dans `diner`',
    R.u7ok && (R.u7apres.journal || []).indexOf('SOUPE=diner') >= 0,
    JSON.stringify(R.u7apres && R.u7apres.journal));

  /* ⭐⭐ §8 — LA JOURNÉE ENTIÈRE. Deux témoins, parce que deux garanties différentes :
     l'écriture ne dérive jamais EN COURS de route, et le résultat final est exact. */
  t('B-CCCXXXVII ⑪ ⭐⭐ journée complète — le repas actif ne dérive JAMAIS entre deux aliments',
    J.erreurs && J.erreurs.length === 0, (J.erreurs || []).join(' · '));
  t('B-CCCXXXVII ⑫ ⭐⭐ journée complète — les 9 aliments sont dans les 4 bons repas',
    J.journal && JSON.stringify(J.journal) === JSON.stringify(J.attendu),
    JSON.stringify(J.journal));

  t('B-CCCXXXVII ⑬ aucune erreur JavaScript pendant tout le parcours',
    errs.length === 0 && !R.err, (R.err || '') + ' ' + errs.join(' | '));

  await cx.close();
};
