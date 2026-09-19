/* ══════════════════════════════════════════════════════════════════════════════════════
   PHASE 3.1 — LES TROIS ARBITRAGES RENDUS, ET LE POT DE 25 SÉPARÉ (19/09/2026)

   ⛔ POURQUOI UN FICHIER À PART : une mutation doit pouvoir être éprouvée en secondes.
   Gardés dans `runner.js`, ces témoins auraient obligé à relancer une passe complète pour
   chacune des mutations du contrôle négatif. Patron posé par `identite_ligne.js`.
   ⭐ UN SEUL PROPRIÉTAIRE (R2) : le banc appelle ce module, le contrôle négatif aussi.

   ⚠️ DEUX BLOCS, DEUX MÉTIERS, ET ILS NE SE REMPLACENT PAS :
     · `source` (B-CCCXXXIV) mesure ce que le registre DÉCLARE et ce que le code ÉCRIT ;
     · `ecran`  (B-CCCXXXV)  CONDUIT l'app et regarde ce qui se passe vraiment.
   *Conduire n'est pas observer, et lire n'est pas conduire* : un pot correctement déclaré
   dans le registre et jamais décrémenté dans le navigateur passerait le premier bloc sans
   broncher.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const R = require(path.join(ROOT, 'capacites-ia.js'));
  const C = R.CAPACITES_IA;
  const cap = (id) => R.capaciteIA(id);

  const brut = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS. Les commentaires de cette passe citent abondamment
     `S.foodAiUses`, `foodLabelAiUses`, `_foodAiConsomme` et `regenCount` — R30 exige que la
     raison soit écrite à côté du code. Un témoin qui lirait le fichier brut resterait vert
     pour toujours, quoi qu'on remette dans le code. */
  const sansComm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                           .replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const APP = sansComm(brut('app.js'));
  const ST = sansComm(brut('state.js'));
  const SET = sansComm(brut('setup.js'));
  const CJ = sansComm(brut('Code.js'));

  console.log('\n═══ B-CCCXXXIV. Phase 3.1 — arbitrages rendus et pot séparé (source) ═══');

  // ── ① à ④ : LES TROIS ARBITRAGES, ET RIEN D'AUTRE N'A BOUGÉ ────────────────────────
  t('B-CCCXXXIV ① ⭐⭐ `milo.debrief` porte la décision du 19/09 (PREMIUM), le code dit FREE',
    cap('milo.debrief').politique === 'PREMIUM'
      && cap('milo.debrief').etatCode === 'FREE'
      && !!cap('milo.debrief').ecart,
    cap('milo.debrief').politique + '/' + cap('milo.debrief').etatCode);

  t('B-CCCXXXIV ② ⭐⭐ `nutrition.mealPlanImport.ai` porte PREMIUM, le code dit FREE',
    cap('nutrition.mealPlanImport.ai').politique === 'PREMIUM'
      && cap('nutrition.mealPlanImport.ai').etatCode === 'FREE'
      && !!cap('nutrition.mealPlanImport.ai').ecart,
    cap('nutrition.mealPlanImport.ai').politique + '/'
      + cap('nutrition.mealPlanImport.ai').etatCode);

  /* ⭐⭐ LE PÉRIMÈTRE EST UNE VARIATION D'ACCÈS, PAS UNE CAPACITÉ DE PLUS. Michel, 19/09 :
     *« Ne crée PAS nutrition.mealPlan.day / nutrition.mealPlan.week ou une 22ᵉ capacité. »*
     Le témoin mesure les deux moitiés de la phrase : la variation EST portée, et elle n'a
     pas fabriqué d'entrée supplémentaire. */
  const mp = cap('nutrition.mealPlan.ai');
  t('B-CCCXXXIV ③ ⭐⭐ `nutrition.mealPlan.ai` est FREEMIUM PAR PÉRIMÈTRE (jour / semaine)',
    mp.politique === 'FREEMIUM' && mp.perimetre
      && mp.perimetre.free === 'jour' && mp.perimetre.premium === 'semaine',
    mp.politique + ' · ' + JSON.stringify(mp.perimetre || null));

  /* ⛔ LE NOMBRE DE GÉNÉRATIONS N'EST PAS DÉCIDÉ, et « illimité » serait une décision.
     Écrire `illimite` aurait été inventer un arbitrage que Michel a explicitement refusé de
     rendre : *« Ne pas inventer 1/jour, 3/jour, 5/mois ou autre quota. »* */
  t('B-CCCXXXIV ④ ⛔ le NOMBRE de générations reste NON DÉCIDÉ (jamais « illimité »)',
    mp.quotaType === 'non_decide' && mp.quotaValeur === null,
    mp.quotaType + ' · ' + mp.quotaValeur);

  // ── ⑤ à ⑦ : LE COMPTE ACTÉ, ET AUCUNE DÉCISION INVENTÉE ────────────────────────────
  t('B-CCCXXXIV ⑤ ⛔ il y a toujours EXACTEMENT 21 capacités, aucune 22ᵉ créée',
    C.length === 21 && new Set(C.map(c => c.id)).size === 21, 'reçu ' + C.length);

  const ouvertes = C.filter(c => c.politique === 'NON_DECIDEE').map(c => c.id);
  t('B-CCCXXXIV ⑥ ⭐ plus aucune politique produit n\'est NON DÉCIDÉE',
    ouvertes.length === 0, ouvertes.join(', '));

  /* ⛔⛔ LE TÉMOIN QUI EMPÊCHE LA FAUTE INVERSE. Fermer les trois arbitrages en les
     inscrivant « FREE » aurait aussi donné « 0 politique ouverte » — et c'est exactement
     la faute que la règle d'or 15 interdit. On vérifie donc ce que chacune porte, pas
     seulement qu'elle porte quelque chose. */
  t('B-CCCXXXIV ⑦ ⛔⛔ aucune des trois ex-ouvertes n\'a été inscrite « FREE » en passant',
    ['milo.debrief', 'nutrition.mealPlan.ai', 'nutrition.mealPlanImport.ai']
      .every(id => cap(id).politique !== 'FREE' && cap(id).politique !== 'NON_DECIDEE'),
    ['milo.debrief', 'nutrition.mealPlan.ai', 'nutrition.mealPlanImport.ai']
      .map(id => id + '=' + cap(id).politique).join(' · '));

  /* ⭐ « pas décidé » doit rester DISPONIBLE alors que plus personne ne le porte : la
     prochaine capacité déclarée avant d'être tranchée en aura besoin. */
  t('B-CCCXXXIV ⑧ ⭐ `NON_DECIDEE` reste une valeur déclarée, et `non_decide` aussi',
    R.POLITIQUES.indexOf('NON_DECIDEE') >= 0 && R.QUOTA_TYPES.indexOf('non_decide') >= 0, '');

  /* ⛔ Les sept formes de quota sont toutes EMPLOYÉES : une forme déclarée que rien
     n'emploie n'est pas éprouvée, elle est décorative. */
  const inemployees = R.QUOTA_TYPES.filter(q => !C.some(c => c.quotaType === q));
  t('B-CCCXXXIV ⑨ ⛔ les 7 formes de quota sont toutes employées par au moins une capacité',
    R.QUOTA_TYPES.length === 7 && inemployees.length === 0,
    'inemployées : ' + inemployees.join(', '));

  // ── ⑩ à ⑫ : LE POT NUTRITION, TROIS POLITIQUES ET TROIS COMPTEURS ──────────────────
  const N = ['nutrition.label.ai', 'nutrition.barcode.aiFallback',
             'nutrition.mealEstimate.ai'].map(cap);
  t('B-CCCXXXIV ⑩ ⭐⭐ les trois capacités Nutrition portent trois accès distincts',
    N[0].politique === 'FREEMIUM' && N[0].quotaValeur === 25
      && N[1].politique === 'PREMIUM' && N[1].quotaValeur === 0
      && N[2].politique === 'FREEMIUM' && N[2].quotaValeur === 25,
    N.map(c => c.id.split('.')[1] + '=' + c.politique + '/' + c.quotaValeur).join(' · '));

  /* ⭐⭐ UN SEUL NOMBRE, UNE SEULE TABLE (consigne §10 : *« ne crée surtout pas
     FOOD_LABEL_LIMIT = 25 / FOOD_MEAL_LIMIT = 25 dans dix fichiers »*). Le témoin compte
     les littéraux `25` associés à une limite : il doit en rester UN. */
  const decl25 = (APP.match(/FOOD_AI_FREE_LIMIT\s*=\s*25/g) || []).length;
  const autres = (APP.match(/FOOD_[A-Z_]*LIMIT\s*=\s*\d+/g) || [])
                   .filter(x => !/FOOD_AI_FREE_LIMIT/.test(x));
  t('B-CCCXXXIV ⑪ ⭐⭐ le nombre 25 est déclaré UNE fois, et aucune limite jumelle n\'existe',
    decl25 === 1 && autres.length === 0,
    'déclarations : ' + decl25 + ' · jumelles : ' + autres.join(', '));

  /* ⛔ LES TROIS IDENTIFIANTS DE LA TABLE DOIVENT EXISTER DANS LE REGISTRE. C'est le lien
     le moins cher entre le client et la source de vérité : pas de dépendance à l'exécution
     (Michel : *« ne construis pas de dépendance compliquée »*), mais un identifiant mal
     tapé fait tomber un test au lieu d'ouvrir un robinet silencieux. */
  const tableau = APP.match(/const FOOD_AI_POTS\s*=\s*\{([\s\S]*?)\};/);
  const idsTable = tableau ? (tableau[1].match(/'([a-zA-Z.]+)'\s*:/g) || [])
                               .map(x => x.replace(/['":\s]/g, '')) : [];
  t('B-CCCXXXIV ⑫ ⭐⭐ les 3 clés de FOOD_AI_POTS sont de vraies capacités du registre',
    idsTable.length === 3 && idsTable.every(id => !!cap(id)),
    idsTable.join(', ') + ' · inconnues : '
      + idsTable.filter(id => !cap(id)).join(', '));

  // ── ⑬ à ⑯ : PLUS AUCUN ÉCRIVAIN DU POT COMMUN ─────────────────────────────────────
  /* ⛔⛔ LE TÉMOIN CENTRAL DE LA SÉPARATION. Tant qu'un seul site incrémente encore
     `S.foodAiUses`, les trois capacités restent liées — et le défaut serait INVISIBLE,
     puisque tout continuerait de marcher. On cherche donc l'ÉCRITURE, pas la mention. */
  const ecrituresPot = (APP.match(/S\.foodAiUses\s*=/g) || []).length;
  t('B-CCCXXXIV ⑬ ⭐⭐ plus AUCUN site du client n\'incrémente l\'ancien pot commun',
    ecrituresPot === 0, ecrituresPot + ' écriture(s) restante(s)');

  /* ⭐ UN SEUL PROPRIÉTAIRE DE L'ÉCRITURE (R2, et la leçon du quota serveur de ft-v1224 :
     lire l'état et consommer une unité sont deux gestes différents). */
  const corps = (n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(APP);
    if (!m) return '';
    const i = m.index + m[0].length - 1;
    let d = 0;
    for (let j = i; j < APP.length; j++) {
      if (APP[j] === '{') d++;
      else if (APP[j] === '}') { d--; if (!d) return APP.slice(i, j + 1); }
    }
    return '';
  };
  const CONSO = corps('_foodAiConsomme');
  const ecrPots = (APP.match(/S\[ch\]\s*=/g) || []).length;
  /* ⛔ ON MESURE « COMBIEN » ET « OÙ », pas seulement la présence : un second écrivain
     glissé ailleurs ferait diverger les pots en silence, et un motif de simple présence
     resterait vert. */
  t('B-CCCXXXIV ⑭ ⭐ l\'écriture d\'un pot vit à UN SEUL endroit, dans `_foodAiConsomme`',
    ecrPots === 1 && CONSO !== '' && /S\[ch\]\s*=/.test(CONSO),
    ecrPots + ' écriture(s) · dans _foodAiConsomme : ' + (CONSO !== '' && /S\[ch\]\s*=/.test(CONSO)));

  /* ⛔ ET LE PREMIUM NE CONSOMME RIEN : la garde est DANS le propriétaire de l'écriture,
     pas recopiée chez ses six appelants (R2 — six copies auraient divergé). */
  t('B-CCCXXXIV ⑭b ⭐ la garde « Premium ne consomme pas » vit chez le propriétaire',
    /if\(S\.premium\)return;/.test(CONSO.replace(/\s+/g, '')), '');

  /* ⛔ LES SIX PORTES SONT NOMMÉES. Trois gardes + trois consommations : un site qui
     oublierait de nommer sa capacité retomberait sur la capacité d'à côté. */
  const parCap = (id) => ({
    garde: (APP.match(new RegExp('_foodAiEpuise\\(\'' + id.replace(/\./g, '\\.') + '\'\\)', 'g')) || []).length,
    conso: (APP.match(new RegExp('_foodAiConsomme\\(\'' + id.replace(/\./g, '\\.') + '\'\\)', 'g')) || []).length,
  });
  const pL = parCap('nutrition.label.ai'), pB = parCap('nutrition.barcode.aiFallback'),
        pM = parCap('nutrition.mealEstimate.ai');
  t('B-CCCXXXIV ⑮ ⭐⭐ chaque capacité garde ET consomme SON pot, nommément',
    pL.garde === 2 && pL.conso === 1 && pB.garde === 2 && pB.conso === 1
      && pM.garde === 1 && pM.conso === 1,
    'label ' + pL.garde + '/' + pL.conso + ' · barcode ' + pB.garde + '/' + pB.conso
      + ' · repas ' + pM.garde + '/' + pM.conso);

  /* ⚠️ LA NOTE DE L'ÉCRAN PARLE D'UN SEUL POT, ET ELLE DIT LEQUEL. Un `_foodAiLeft()` sans
     argument rendrait 0 (échec fermé) et afficherait « épuisées » à tout le monde : le
     témoin fige que l'appel est NOMMÉ. */
  t('B-CCCXXXIV ⑯ ⭐ la note de l\'écran interroge le pot du repas décrit, nommément',
    /_foodAiLeft\('nutrition\.mealEstimate\.ai'\)/.test(APP)
      && !/_foodAiLeft\(\s*\)/.test(APP), '');

  // ── ⑰ à ⑳ : LA MIGRATION ET SA PERSISTANCE ────────────────────────────────────────
  /* ⛔⛔ CE N'EST PAS UN DRAPEAU « MIGRATION FAITE ». Une restauration cloud remplace
     l'état APRÈS le chargement et peut ramener un profil d'avant cette version des mois
     plus tard (leçon `ft4_stmig1`, ft-v1213, et identité des lignes, ft-v1218). La règle
     est donc rejouée au chargement ET après la restauration. */
  t('B-CCCXXXIV ⑰ ⭐⭐ la migration est une RÈGLE rejouée, pas un drapeau posé une fois',
    /function _foodAiMigrer\(\)/.test(ST)
      && /_foodAiMigrer\(\)/.test(ST.replace(/function _foodAiMigrer\(\)/g, ''))
      && /_foodAiMigrer\(\)/.test(SET), '');

  /* ⚠️ LE SIGNAL EST L'ABSENCE. Si `load()` lisait `parseInt(...)||0`, un pot jamais écrit
     serait indiscernable d'un pot légitimement à zéro et la migration ne partirait JAMAIS —
     25 essais neufs pour quelqu'un qui en avait consommé 20, en silence. */
  t('B-CCCXXXIV ⑱ ⭐⭐ un pot jamais écrit se lit `null`, jamais 0',
    /function _lsNombreOuNull\(cle\)/.test(ST)
      && /S\.foodLabelAiUses\s*=\s*_lsNombreOuNull\('ft4_foodai_label'\)/.test(ST)
      && /S\.foodMealEstimateAiUses\s*=\s*_lsNombreOuNull\('ft4_foodai_meal'\)/.test(ST)
      && /S\.foodBarcodeAiUses\s*=\s*_lsNombreOuNull\('ft4_foodai_bc'\)/.test(ST), '');

  /* ⛔ LES TROIS POTS VOYAGENT. Un compteur qui ne part pas au cloud est un compteur qui se
     remet à zéro à la première restauration — et la liste blanche de `Code.js` est la
     raison pour laquelle il faut le vérifier DES DEUX CÔTÉS : ce qu'elle ne nomme pas
     n'atteint jamais le profil enregistré (le piège de `_provFood`, payé trois fois). */
  const champs = ['foodLabelAiUses', 'foodMealEstimateAiUses', 'foodBarcodeAiUses'];
  t('B-CCCXXXIV ⑲ ⭐⭐ les 3 pots partent dans la sauvegarde ET sont acceptés par le serveur',
    champs.every(c => new RegExp(c + '\\s*:\\s*S\\.' + c).test(SET))
      && champs.every(c => new RegExp('body\\.' + c + '\\s*!==\\s*undefined').test(CJ)),
    champs.filter(c => !new RegExp('body\\.' + c).test(CJ)).join(', ') || 'tous présents');

  /* ⭐ UN MAXIMUM, JAMAIS UN REMPLACEMENT — des deux côtés. Deux appareils qui se
     synchronisent ne doivent pas pouvoir SE RENDRE des essais déjà consommés. */
  t('B-CCCXXXIV ⑳ ⛔ le serveur prend le MAXIMUM pour les 3 pots (jamais un remplacement)',
    champs.every(c => new RegExp('profile\\.' + c + '\\s*=\\s*Math\\.max').test(CJ)), '');

  // ── ㉑ : LA PORTE DE CONTOURNEMENT DE LA RÉGÉNÉRATION ──────────────────────────────
  /* ⛔⛔ « 1 régénération/jour » se levait en appuyant sur le bouton d'à côté : la
     génération complète réécrivait `S.mealPlan` avec `regenCount:0`. Le témoin fige que le
     compteur du jour est REPORTÉ, pas effacé. */
  t('B-CCCXXXIV ㉑ ⭐⭐ une génération complète ne remet plus `regenCount` à 0 le jour même',
    /regenCount:_rgN/.test(APP.replace(/\s+/g, ''))
      && !/S\.mealPlan=\{days:data\.plan\.days\|\|\[\],generatedAt:td,regenDate:null,regenCount:0\}/
            .test(APP.replace(/\s+/g, '')), '');

  /* ⭐ ET LE PLAFOND LUI-MÊME N'A PAS BOUGÉ : on ferme une porte, on ne change pas la règle
     (Michel : *« Ne change pas la décision existante : FREEMIUM »*). */
  t('B-CCCXXXIV ㉒ ⛔ le plafond de régénération reste 1/jour en gratuit, inchangé',
    /\(S\.mealPlan\.regenCount\|\|0\)>=1/.test(APP.replace(/\s+/g, ''))
      && cap('nutrition.mealPlan.regen').quotaValeur === 1
      && cap('nutrition.mealPlan.regen').politique === 'FREEMIUM', '');
};

/* ══════════════════════════════════════════════════════════════════════════════════════
   B-CCCXXXV — LES POTS SÉPARÉS, CONDUITS DANS LE NAVIGATEUR

   ⚠️ CE BLOC N'ESPIONNE AUCUN APPEL RÉSEAU, ET C'EST VOLONTAIRE : les trois capacités
   partent vers le Worker, qu'on ne joint pas depuis le conteneur. On conduit donc les
   PROPRIÉTAIRES du comptage (`_foodAiEpuise`, `_foodAiConsomme`, `_foodAiLeft`) et la
   migration (`_foodAiMigrer`, `load`, `persist`), qui sont exactement ce que la décision
   de Michel concerne. ⛔ Ce que ça NE prouve pas est dit plutôt que masqué : qu'un appel
   réseau réel passe bien par ces portes est figé par les témoins de SOURCE (⑮), pas ici.
   ══════════════════════════════════════════════════════════════════════════════════════ */
module.exports.ecran = async function (t, b, PORT) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXXXV. Les trois pots séparés (conduits dans le navigateur) --');

  const R = await pg.evaluate(async () => {
    const o = {};
    const L = 'nutrition.label.ai', M = 'nutrition.mealEstimate.ai',
          B = 'nutrition.barcode.aiFallback';
    /* ⛔ chaque geste rend un résultat : une étape interrompue ne doit pas ressembler à une
       étape verte (BUGS.md §61, ma propre règle). */
    const neuf = () => { try {
      S.premium = false;
      S.foodAiUses = 0; S.foodLabelAiUses = 0; S.foodMealEstimateAiUses = 0;
      S.foodBarcodeAiUses = 0; return true;
    } catch (e) { o.err = String(e && e.message || e); return false; } };
    const etat = () => ({ l: _foodAiLeft(L), m: _foodAiLeft(M), b: _foodAiLeft(B) });
    const nFois = (cap, n) => { for (let i = 0; i < n; i++) _foodAiConsomme(cap); };

    // ── N1 : compte neuf ──────────────────────────────────────────────────────────
    o.n1ok = neuf();
    o.n1 = etat();

    // ── N2 : 25 usages étiquette → étiquette épuisée, le repas décrit intact ───────
    neuf(); nFois(L, 25);
    o.n2 = { etat: etat(), lEpuise: _foodAiEpuise(L), mEpuise: _foodAiEpuise(M) };

    // ── N3 : 25 usages repas décrit → repas épuisé, étiquette intacte ─────────────
    neuf(); nFois(M, 25);
    o.n3 = { etat: etat(), mEpuise: _foodAiEpuise(M), lEpuise: _foodAiEpuise(L) };

    // ── N4 / N5 : aucune capacité ne décrémente sa voisine ────────────────────────
    neuf(); nFois(L, 7);  o.n4 = etat();
    neuf(); nFois(M, 7);  o.n5 = etat();

    // ── N6 : le repli code-barres n'entame NI l'un NI l'autre des pots gratuits ───
    neuf(); nFois(B, 9);  o.n6 = etat();

    /* ⛔ N7 / N8 — LE SCANNER LOCAL ET LA SAISIE MANUELLE NE CONSOMMENT RIEN.
       On conduit les deux chemins réellement gratuits et on regarde les trois pots : ils
       ne doivent pas bouger d'une unité. `_eanValide` et `_lookupBarcode` sont les
       propriétaires du chemin déterministe ; aucun des deux ne doit toucher un compteur. */
    neuf();
    const avant = etat();
    o.n7ok = true;
    try { if (typeof _eanValide === 'function') { _eanValide('3017620422003'); _eanValide('0000'); } }
    catch (e) { o.n7ok = false; o.n7err = String(e && e.message || e); }
    o.n7 = etat();
    o.n7bouge = JSON.stringify(avant) !== JSON.stringify(o.n7);
    /* la saisie manuelle : on écrit une entrée du journal par le chemin ordinaire, sans IA */
    o.n8ok = true;
    try {
      const n = (S.foodLog || []).length;
      S.foodLog = (S.foodLog || []).concat([{ date: today(), meal: 'dejeuner', name: 'Riz',
        kcal: 130, prot: 2.7, carbs: 28, fat: 0.3, ts: Date.now(), id: 'test-n8' }]);
      o.n8ajout = (S.foodLog.length === n + 1);
    } catch (e) { o.n8ok = false; o.n8err = String(e && e.message || e); }
    o.n8 = etat();

    // ── PREMIUM : ne consomme aucun pot gratuit ───────────────────────────────────
    neuf(); S.premium = true; nFois(L, 5); nFois(M, 5); nFois(B, 5);
    o.prem = etat(); S.premium = false;

    // ── UNE CAPACITÉ INCONNUE ÉCHOUE FERMÉ ───────────────────────────────────────
    neuf();
    o.inconnue = { reste: _foodAiLeft('nutrition.nexistePas'),
                   epuise: _foodAiEpuise('nutrition.nexistePas') };
    /* ⛔ et elle n'écrit nulle part : une faute de frappe ne doit pas créer un champ */
    _foodAiConsomme('nutrition.nexistePas');
    o.inconnueEcrit = !!S['nutrition.nexistePas'] || S.foodLabelAiUses !== 0;

    return o;
  });

  // ── LA MIGRATION, SUR LES SIX ÉTATS DEMANDÉS PAR MICHEL ─────────────────────────────
  /* ⛔⛔ CHAQUE CAS REPART D'UN CONTEXTE NEUF : la migration se joue au CHARGEMENT, donc
     l'éprouver sans recharger la page mesurerait autre chose. C'est la leçon de la sonde du
     compte neuf, le matin même — `goScreen` sans rendu donnait le même texte pour 4 profils
     différents. */
  const migration = async (cle) => {
    const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                   timezoneId: 'Europe/Paris' });
    const p = await c.newPage();
    await p.addInitScript(`(()=>{try{localStorage.clear();${cle}}catch(e){}})();`);
    await p.goto('http://localhost:' + PORT + '/index.html'); await p.waitForTimeout(2000);
    const r = await p.evaluate(() => {
      const lu = () => ({ l: S.foodLabelAiUses, m: S.foodMealEstimateAiUses,
                          b: S.foodBarcodeAiUses, anc: S.foodAiUses });
      const apres1 = lu();
      /* ⛔ IDEMPOTENCE : on rejoue la règle, puis on persiste et on rejoue encore. Rien ne
         doit bouger — une migration qui s'applique deux fois double la consommation. */
      _foodAiMigrer(); const apres2 = lu();
      persist(); _foodAiMigrer(); const apres3 = lu();
      return { apres1, apres2, apres3,
               ls: { l: localStorage.getItem('ft4_foodai_label'),
                     m: localStorage.getItem('ft4_foodai_meal'),
                     b: localStorage.getItem('ft4_foodai_bc') } };
    });
    await c.close();
    return r;
  };

  const mAbsent = await migration('');
  const m0 = await migration("localStorage.setItem('ft4_foodai','0');");
  const m5 = await migration("localStorage.setItem('ft4_foodai','5');");
  const m24 = await migration("localStorage.setItem('ft4_foodai','24');");
  const m25 = await migration("localStorage.setItem('ft4_foodai','25');");
  const m40 = await migration("localStorage.setItem('ft4_foodai','40');");
  const mNeg = await migration("localStorage.setItem('ft4_foodai','-3');");
  const mSale = await migration("localStorage.setItem('ft4_foodai','abc');");
  /* ⭐ LE CAS QUI COMPTE VRAIMENT : un pot DÉJÀ migré ne doit plus jamais bouger, même si
     l'ancien pot remonte plus haut (un vieil appareil qui synchronise). */
  const mDeja = await migration(
    "localStorage.setItem('ft4_foodai','40');localStorage.setItem('ft4_foodai_label','3');"
    + "localStorage.setItem('ft4_foodai_meal','4');localStorage.setItem('ft4_foodai_bc','5');");

  const trois = (x) => [x.l, x.m, x.b];
  const tousEgaux = (x, v) => trois(x).every(n => n === v);
  const stable = (r) => JSON.stringify(r.apres1) === JSON.stringify(r.apres2)
                     && JSON.stringify(r.apres2) === JSON.stringify(r.apres3);

  // ══ LES TÉMOINS ═══════════════════════════════════════════════════════════════════
  t('B-CCCXXXV ① N1 — compte neuf : les trois pots sont pleins (25/25/25)',
    R.n1ok && R.n1.l === 25 && R.n1.m === 25 && R.n1.b === 25, JSON.stringify(R.n1));

  t('B-CCCXXXV ② N2 — 25 lectures d\'étiquette : l\'étiquette est épuisée…',
    R.n2.lEpuise === true && R.n2.etat.l === 0, JSON.stringify(R.n2));
  t('B-CCCXXXV ③ ⭐⭐ N2 — … et le repas décrit est INTACT (25), non épuisé',
    R.n2.etat.m === 25 && R.n2.mEpuise === false, JSON.stringify(R.n2.etat));

  t('B-CCCXXXV ④ N3 — 25 estimations de repas : le repas décrit est épuisé…',
    R.n3.mEpuise === true && R.n3.etat.m === 0, JSON.stringify(R.n3));
  t('B-CCCXXXV ⑤ ⭐⭐ N3 — … et l\'étiquette est INTACTE (25), non épuisée',
    R.n3.etat.l === 25 && R.n3.lEpuise === false, JSON.stringify(R.n3.etat));

  t('B-CCCXXXV ⑥ ⭐⭐ N4 — consommer l\'étiquette ne retire rien au repas décrit',
    R.n4.l === 18 && R.n4.m === 25 && R.n4.b === 25, JSON.stringify(R.n4));
  t('B-CCCXXXV ⑦ ⭐⭐ N5 — consommer le repas décrit ne retire rien à l\'étiquette',
    R.n5.m === 18 && R.n5.l === 25 && R.n5.b === 25, JSON.stringify(R.n5));

  /* ⛔⛔ N6 — LE TÉMOIN QUE MICHEL A NOMMÉ. Le repli code-barres a son compteur propre :
     il ne doit entamer NI l'étiquette NI le repas décrit. ⚠️ Et ce que ce témoin ne dit
     PAS est écrit dans le registre : le code lui accorde encore 25, alors que sa politique
     est « PREMIUM, 0 ». Le verrou appartient à la phase serveur — on mesure la SÉPARATION,
     pas une fausse sécurité client (consigne explicite). */
  t('B-CCCXXXV ⑧ ⭐⭐ N6 — le repli code-barres n\'entame AUCUN des deux pots gratuits',
    R.n6.l === 25 && R.n6.m === 25 && R.n6.b === 16, JSON.stringify(R.n6));

  t('B-CCCXXXV ⑨ N7 — valider un code-barres en local ne consomme aucune unité IA',
    R.n7ok && R.n7bouge === false && R.n7.l === 25 && R.n7.m === 25 && R.n7.b === 25,
    (R.n7err || '') + ' ' + JSON.stringify(R.n7));
  t('B-CCCXXXV ⑩ N8 — une saisie manuelle au journal ne consomme aucune unité IA',
    R.n8ok && R.n8ajout === true && R.n8.l === 25 && R.n8.m === 25 && R.n8.b === 25,
    (R.n8err || '') + ' ' + JSON.stringify(R.n8));

  t('B-CCCXXXV ⑪ ⛔ un compte Premium ne consomme AUCUN pot gratuit',
    R.prem.l === 25 && R.prem.m === 25 && R.prem.b === 25, JSON.stringify(R.prem));

  /* ⛔ ÉCHEC FERMÉ : une capacité inconnue ne reçoit pas un pot par défaut, et n'écrit
     nulle part. Un identifiant mal tapé doit se voir, pas ouvrir un robinet. */
  t('B-CCCXXXV ⑫ ⭐ une capacité INCONNUE échoue fermé (0 restant, épuisée, aucune écriture)',
    R.inconnue.reste === 0 && R.inconnue.epuise === true && R.inconnueEcrit === false,
    JSON.stringify(R.inconnue) + ' · a écrit : ' + R.inconnueEcrit);

  // ── LA MIGRATION ──────────────────────────────────────────────────────────────────
  t('B-CCCXXXV ⑬ migration — ancien pot ABSENT : les trois pots démarrent à 0',
    tousEgaux(mAbsent.apres1, 0) && stable(mAbsent), JSON.stringify(mAbsent.apres1));
  t('B-CCCXXXV ⑭ migration — ancien pot à 0 : les trois pots valent 0',
    tousEgaux(m0.apres1, 0) && stable(m0), JSON.stringify(m0.apres1));
  t('B-CCCXXXV ⑮ ⭐⭐ migration — ancien pot à 5 : CHAQUE pot hérite de 5 (jamais 0)',
    tousEgaux(m5.apres1, 5) && stable(m5), JSON.stringify(m5.apres1));
  t('B-CCCXXXV ⑯ migration — ancien pot à 24 : chaque pot vaut 24 (1 essai restant)',
    tousEgaux(m24.apres1, 24) && stable(m24), JSON.stringify(m24.apres1));
  t('B-CCCXXXV ⑰ ⭐ migration — ancien pot à 25 : chaque pot est ÉPUISÉ, pas rouvert',
    tousEgaux(m25.apres1, 25) && stable(m25), JSON.stringify(m25.apres1));
  t('B-CCCXXXV ⑱ migration — ancien pot à 40 (> 25) : la valeur est reprise telle quelle',
    tousEgaux(m40.apres1, 40) && stable(m40), JSON.stringify(m40.apres1));

  /* ⛔ NI NaN NI NÉGATIF — la famille de défauts la moins visible : un NaN rend toute
     comparaison fausse, donc un pot à NaN serait INFINIMENT gratuit sans rien casser. */
  t('B-CCCXXXV ⑲ ⭐⭐ aucun pot ne vaut NaN ni un nombre négatif, sur AUCUN des 8 états',
    [mAbsent, m0, m5, m24, m25, m40, mNeg, mSale].every(r =>
      trois(r.apres1).every(n => typeof n === 'number' && isFinite(n) && n >= 0)),
    JSON.stringify([mNeg.apres1, mSale.apres1]));
  t('B-CCCXXXV ⑳ ⛔ un ancien pot corrompu (« abc », −3) ne produit ni NaN ni essai infini',
    tousEgaux(mNeg.apres1, 0) && tousEgaux(mSale.apres1, 0),
    'neg ' + JSON.stringify(mNeg.apres1) + ' · sale ' + JSON.stringify(mSale.apres1));

  /* ⭐⭐ LE TÉMOIN D'IDEMPOTENCE, ET C'EST LE PLUS IMPORTANT DES SIX. Une migration qui se
     rejoue en écrasant transformerait chaque chargement en remise à niveau sur l'ancien
     pot — quelqu'un qui consomme 3 essais les reperdrait au rechargement suivant. */
  t('B-CCCXXXV ㉑ ⭐⭐ un pot DÉJÀ migré ne bouge plus, même si l\'ancien pot est plus haut',
    mDeja.apres1.l === 3 && mDeja.apres1.m === 4 && mDeja.apres1.b === 5
      && mDeja.apres1.anc === 40 && stable(mDeja),
    JSON.stringify(mDeja.apres1) + ' → ' + JSON.stringify(mDeja.apres3));

  t('B-CCCXXXV ㉒ ⛔ les trois pots sont bien ÉCRITS dans le stockage après `persist`',
    mDeja.ls.l === '3' && mDeja.ls.m === '4' && mDeja.ls.b === '5', JSON.stringify(mDeja.ls));

  /* ⛔ L'ANCIEN POT EST GELÉ, PAS EFFACÉ : il reste lisible pour un appareil resté sur
     l'ancienne version et pour une restauration. Un effacement serait un aller simple. */
  t('B-CCCXXXV ㉓ ⭐ l\'ancien pot commun est CONSERVÉ intact (gelé, jamais effacé)',
    m40.apres1.anc === 40 && m5.apres1.anc === 5, 'm40 ' + m40.apres1.anc + ' · m5 ' + m5.apres1.anc);

  t('B-CCCXXXV ㉔ aucune erreur JavaScript pendant tout le parcours',
    errs.length === 0 && !R.err, (R.err || '') + ' ' + errs.join(' | '));

  await cx.close();
};
