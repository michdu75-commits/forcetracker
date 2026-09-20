/* ══════════════════════════════════════════════════════════════════════════════════════
   📏 « IMPOSSIBLE D'ENREGISTRER LES MENSURATIONS » (20/09/2026)

   Cas réel de Michel — Progrès → Corps & santé, carte « Masse grasse du jour » :
   poids 85,9 · objectif 85 · cou 40,7 · taille 92,4 · hanches vide · % auto ~19,6.
   *« Il renseigne ses mensurations et il ne peut pas les enregistrer. »*

   ⛔⛔ LA CAUSE TIENT À UN `persist()` MANQUANT SUR **UN SEUL** CHEMIN DE SORTIE.
   ft-v1129 avait corrigé l'ORDRE pour le `return` du **%** (« ce que la personne a tapé ne se
   perd pas parce qu'un CALCUL n'a pas abouti »). Il restait un **second** `return`, celui du
   **poids** : les centimètres étaient écrits dans `S` puis jamais persistés, et le
   rechargement suivant les effaçait — *en silence, avec un message qui ne parle que du poids*.
   👉 ***Un correctif d'ORDRE doit être posé sur TOUS les chemins de sortie, pas seulement sur
   celui qui a servi à le trouver*** (R15).

   ⛔ ET UN SECOND DÉFAUT DANS LES MÊMES TROIS LIGNES : `last ? last.kg : S.bw` n'atteignait le
   repli `S.bw` que s'il n'existait AUCUNE pesée. Une pesée sans kilo utilisable (un bilan
   corporel qui n'a écrit qu'un %, une ligne importée, un `kg` à 0) bloquait donc quelqu'un
   dont le poids s'affiche juste au-dessus. **Mesuré, trois états d'entrée, même racine.**

   ⭐ ON MESURE DEUX NIVEAUX, PAS UN : ce que l'écran DIT et ce qui est réellement dans
   `localStorage` **après un vrai rechargement**. *Une valeur en mémoire et une valeur persistée
   ne sont pas la même chose* — et c'était précisément la forme du défaut.

   ⛔ FICHIER À PART (comme `accueil_mini.js`, `pots_nutrition.js`, `repas_actif.js`) : une
   mutation doit pouvoir être éprouvée en secondes, pas en relançant une passe de 25 minutes.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'tracking.js'), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS. Les commentaires du correctif citent `persist`, `numFR`,
     `S.bw` et la phrase du message en toutes lettres (R30 — la raison s'écrit à côté du code).
     Un témoin qui lirait le fichier brut resterait vert quoi qu'on remette dans le code. */
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

  console.log('\n═══ B-CCCXXXVIII. Les mensurations — la cause, figée dans la source ═══');

  const SBF = corps('saveBodyFat');
  t('B-CCCXXXVIII ① `saveBodyFat` est toujours là', SBF !== '', 'introuvable');

  /* ⛔⛔ LE TÉMOIN CENTRAL, ET IL COMPTE LES SORTIES PLUTÔT QUE DE LES CITER.
     L'invariant n'est pas « il y a un persist quelque part » : c'est que **tout `return` situé
     APRÈS l'enregistrement des centimètres soit précédé d'un `persist()`**. Un témoin qui
     chercherait seulement la présence du mot resterait vert sur la version d'avant, qui en
     contenait déjà deux. */
  /* ⚠️ ON NE COMPTE QUE LES `return;` NUS, ET C'EST UN DÉFAUT D'INSTRUMENT ATTRAPÉ AU BANC :
     ma première version coupait sur `\breturn\b` et comptait donc aussi les `return` des
     **fonctions fléchées** du correctif (`_kgUtil`, le `.some(…)`) — 4 « sorties » au lieu de 2,
     dont 2 forcément sans `persist()`. *Un motif qui cherche un mot-clé ne distingue pas la
     SORTIE d'une fonction du RETOUR d'une lambda.* Un `return;` nu quitte une fonction sans
     valeur : c'est exactement, et seulement, ce qu'on veut mesurer ici. */
  const apres = SBF.slice(SBF.indexOf('_mensEnregistrerSaisie()'));
  const sorties = apres.split(/\breturn\s*;/).slice(0, -1);  // le texte QUI PRÉCÈDE chaque sortie
  t('B-CCCXXXVIII ② ⭐⭐ tout chemin de sortie posé APRÈS la saisie sauvegarde (R15)',
    sorties.length >= 2 && sorties.every(bloc => /persist\(\)/.test(bloc)),
    sorties.length + ' sortie(s), dont ' + sorties.filter(b => !/persist\(\)/.test(b)).length
      + ' sans persist()');

  /* ⛔ LE REPLI SUR LE POIDS DU PROFIL DOIT ÊTRE ATTEIGNABLE MÊME QUAND UNE PESÉE EXISTE.
     On mesure la DISPARITION du ternaire fautif, pas la présence d'un mot : `last?last.kg:S.bw`
     est exactement ce qui rendait le repli inatteignable. */
  t('B-CCCXXXVIII ③ ⭐ le ternaire qui rendait `S.bw` inatteignable a disparu',
    !/last\s*\?\s*last\.kg\s*:/.test(A), 'il est encore là');
  t('B-CCCXXXVIII ④ ⭐ le poids de secours est cherché sur TOUTES les pesées',
    /_kgUtil/.test(SBF) && /S\.weightLog[\s\S]{0,160}\.some\(/.test(SBF), '');
  t('B-CCCXXXVIII ⑤ `S.bw` reste le dernier recours, et il est lu avec `numFR`',
    /if\s*\(\s*!\s*kg\s*\)\s*kg\s*=\s*numFR\(\s*S\.bw\s*\)/.test(SBF.replace(/\s+/g, ' ')),
    '');

  /* ⭐ LE MESSAGE DOIT DIRE CE QUI A ÉTÉ GARDÉ. Un « enregistre d'abord ton poids » sec, après
     une saisie réellement sauvegardée, ferait retaper — ou abandonner. */
  t('B-CCCXXXVIII ⑥ ⭐ la sortie « pas de poids » dit combien de mesures sont gardées',
    /mesure[\s\S]{0,120}enregistr[\s\S]{0,120}entre ton poids/.test(SBF), '');

  /* ⛔ LA LECTURE DES NOMBRES A UN SEUL PROPRIÉTAIRE (R2). `parseFloat('40,7')` rend 40 :
     corriger le seul appelant fautif aurait laissé le piège armé pour le suivant. */
  const NAVY = corps('_bfNavy');
  t('B-CCCXXXVIII ⑦ ⭐⭐ `_bfNavy` lit ses nombres avec `numFR`, jamais `parseFloat`',
    NAVY !== '' && /numFR\(/.test(NAVY) && !/parseFloat\(/.test(NAVY),
    NAVY === '' ? '_bfNavy introuvable' : 'parseFloat encore présent');

  /* ⛔ ET LE CALCUL LUI-MÊME N'A PAS BOUGÉ — c'est la borne de Michel (« ne change pas
     l'algorithme »). On épingle les deux constantes de la formule US Navy. */
  t('B-CCCXXXVIII ⑧ ⛔ la formule US Navy est intacte (homme ET femme)',
    /1\.0324/.test(NAVY) && /0\.19077/.test(NAVY)
      && /1\.29579/.test(NAVY) && /0\.35004/.test(NAVY), '');

  /* ⛔ PÉRIMÈTRE : l'écrivain unique des mensurations reste `mensAjouter` (R2). */
  t('B-CCCXXXVIII ⑨ ⛔ `saveBodyFat` n\'écrit toujours aucune mensuration en direct',
    !/S\.(neck|waist|hip)\s*=/.test(SBF), 'elle en réécrit une');
  t('B-CCCXXXVIII ⑩ ⛔ un champ VIDE ne vaut toujours pas « efface »',
    /if\s*\(\s*!\s*brut\s*\)\s*return\s*;/.test(corps('_mensEnregistrerSaisie').replace(/\s+/g, ' ')),
    '');

  /* ══ LE RETOUR DE CHRISTOPHE — « ma masse grasse revient à 20,7 le lendemain » ══════════
     ⛔⛔ 20,7 N'EST NI UNE CONSTANTE, NI UN DÉFAUT, NI UN DÉCALAGE D'INDEX : c'est le calcul
     US Navy des mensurations stockées, qui ne bouge pas tant qu'elles ne bougent pas. Ce qui
     manquait n'était donc pas le bon chiffre — c'est que l'écran ne montrait **nulle part** la
     dernière mesure réelle, ni d'où venait celui qu'il proposait. */
  const BFD = corps('bfDerniere');
  t('B-CCCXXXVIII ⑪ ⭐ « la dernière masse grasse connue » a UN propriétaire (R2)',
    BFD !== '', 'bfDerniere introuvable');
  /* ⛔ ON TRIE AVANT DE PRENDRE. Un `[0]` qui se fie à l'ordre du tableau est un bug qui
     n'apparaît que chez les autres — après une restauration, un import, une fusion. */
  t('B-CCCXXXVIII ⑫ ⭐⭐ elle TRIE par date, elle ne se fie pas à l\'ordre du tableau',
    /\.sort\(/.test(BFD) && /localeCompare/.test(BFD), '');
  t('B-CCCXXXVIII ⑬ ⛔ elle rend `null`, jamais 0 (R29)',
    /\?\s*\{\s*date\s*:[^}]*\}\s*:\s*null/.test(BFD.replace(/\s+/g, ' ')), '');
  /* ⚠️ ON CHERCHE « après tes mesures » SANS L'APOSTROPHE, ET C'EST UN DÉFAUT D'INSTRUMENT
     ATTRAPÉ AU BANC : dans la source, la chaîne s'écrit `d\'après` — l'apostrophe y est
     ÉCHAPPÉE, puisqu'elle vit dans un littéral délimité par des apostrophes. Mon motif
     cherchait `d'après` et rougissait donc sur du code parfaitement juste.
     *Un motif qui inclut un caractère d'échappement mesure ma mise en forme, pas le fait.* */
  t('B-CCCXXXVIII ⑭ ⭐ le sous-titre nomme la SOURCE du chiffre proposé',
    /après tes mesures/.test(brut), '');
  t('B-CCCXXXVIII ⑮ ⭐⭐ … et rappelle la dernière valeur NOTÉE, avec sa date',
    /dernière notée/.test(brut) && /_bfJourCourt/.test(A), '');
  /* ⛔ LA DATE SE FORMATE PAR DÉCOUPAGE DE CHAÎNE : `new Date('2026-09-20')` est lue en UTC et
     affiche la veille à l'ouest de Greenwich (famille « fuseaux horaires » de BUGS.md). */
  t('B-CCCXXXVIII ⑯ ⛔ la date est découpée, jamais passée à `new Date`',
    corps('_bfJourCourt') !== '' && !/new Date/.test(corps('_bfJourCourt')), '');
  /* ⛔⛔ ET LE CHIFFRE PRÉREMPLI N'A PAS BOUGÉ — c'est une décision rendue à Michel (D-013).
     Ce témoin existe pour qu'on ne la prenne pas « en passant » à la prochaine version. */
  t('B-CCCXXXVIII ⑰ ⛔⛔ le chiffre prérempli reste le calcul (décision D-013, non tranchée)',
    /const prefill\s*=\s*savedToday\s*\?\s*todayW\.bf\s*:\s*\(\s*navyNow\s*!=\s*null\s*\?\s*navyNow\s*:\s*''\s*\)/
      .test(A.replace(/\s+/g, ' ').replace(/const prefill = /, 'const prefill=')),
    'le préremplissage a changé sans que D-013 soit tranchée');
};

module.exports.ecran = async function (t, b, PORT) {
  /* ⏰ HORLOGE GELÉE : une mensuration est DATÉE au jour. Sans gel, une passe lancée à 23 h 59
     daterait la saisie d'un jour et la relecture du suivant. */
  const GEL = '2026-09-20T10:00:00';
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  /* ⭐ LE PROFIL RÉEL DE MICHEL : homme, 180 cm (déduit de son % affiché), 85,9 kg.
     ⛔⛔ LE DÉCOR NE SE POSE QU'UNE FOIS, ET C'EST INDISPENSABLE : un `addInitScript` rejoue à
     CHAQUE navigation, **rechargement compris**. Ma première version y appelait
     `localStorage.clear()` — donc le rechargement du témoin ⑬ effaçait lui-même ce qu'il
     venait mesurer, et le témoin rougissait sur un correctif parfaitement juste.
     👉 ***Une fixture qui se rejoue pendant la mesure mesure la fixture, pas le produit.*** */
  await pg.addInitScript(`(()=>{try{
    if(localStorage.getItem('_decorMens')==='1')return;
    localStorage.clear();localStorage.setItem('_decorMens','1');
    localStorage.setItem('ft4_bw','85.9');localStorage.setItem('ft4_age','48');
    localStorage.setItem('ft4_ht','180');localStorage.setItem('ft4_gender','H');
    localStorage.setItem('ft4_target','85');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXXXIX. Les mensurations s\'enregistrent (conduit, horloge gelée) --');

  const carte = async () => pg.evaluate(async () => {
    const pause = ms => new Promise(r => setTimeout(r, ms));
    goScreen('progress', document.querySelector('[onclick*="progress"]')); await pause(320);
    switchProgTab('poids', document.getElementById('ptab-poids')); await pause(420);
  });

  /* ⛔ UN CAS = un état de départ, une saisie, un ✓, puis la MÉMOIRE **et** le DISQUE.
     C'est le disque qui compte : c'est lui que le rechargement relit. */
  const cas = async (prep, champs) => {
    await pg.evaluate((pr) => { eval(pr); persist(); }, prep);
    await carte();
    return pg.evaluate(async (ch) => {
      const o = {};
      try {
        Object.keys(ch).forEach(id => {
          const e = document.getElementById(id);
          if (e) { e.value = ch[id]; e.dispatchEvent(new Event('input', { bubbles: true })); }
        });
        o.champsVus = Object.keys(ch).every(id => !!document.getElementById(id));
        saveBodyFat();
        await new Promise(r => setTimeout(r, 400));
        o.memoire = (S.mensLog || []).map(e => e.k + '=' + e.v).sort();
        o.disque = JSON.parse(localStorage.getItem('ft4_mens') || '[]')
          .map(e => e.k + '=' + e.v).sort();
        const _auj = (S.weightLog || []).find(w => w.date === today()) || {};
        o.bf = _auj.bf;
        o.poidsDuJour = _auj.kg;
        o.ok = true;
      } catch (e) { o.ok = false; o.err = String(e && e.message || e); }
      return o;
    }, champs);
  };

  const VIDE = "S.mensLog=[];S.neck=0;S.waist=0;S.hip=0;";
  const POIDS_AUJ = VIDE + "S.weightLog=[{date:'2026-09-20',kg:85.9}];S.bw=85.9;";

  // ── ① LE CAS DE MICHEL : cou + taille, hanches VIDE ──────────────────────────────
  const A = await cas(POIDS_AUJ, { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  t('B-CCCXXXIX ① ⭐⭐ cou + taille, hanches VIDE → les DEUX sont sur le DISQUE',
    A.ok && A.disque.join('|') === 'cou=40.7|taille=92.4', JSON.stringify(A));
  t('B-CCCXXXIX ② ⛔ une hanche vide n\'empêche rien et n\'invente rien',
    A.ok && A.disque.indexOf('hanches=0') < 0, JSON.stringify(A.disque));

  // ── ② LES TROIS PRINCIPALES ──────────────────────────────────────────────────────
  const B = await cas(POIDS_AUJ, { 'bf-neck': '40.7', 'bf-waist': '92.4', 'bf-hip': '99.5' });
  t('B-CCCXXXIX ③ cou + taille + hanches → les trois sur le disque',
    B.ok && B.disque.join('|') === 'cou=40.7|hanches=99.5|taille=92.4', JSON.stringify(B));

  // ── ③ UNE SEULE MESURE SUFFIT (acquis de ft-v1129, on le protège) ────────────────
  const C = await cas(POIDS_AUJ, { 'bf-neck': '40.7' });
  t('B-CCCXXXIX ④ ⭐ une SEULE mensuration suffit pour être gardée',
    C.ok && C.disque.join('|') === 'cou=40.7', JSON.stringify(C));

  // ── ④ LE SÉPARATEUR DÉCIMAL — mesuré, jamais supposé ─────────────────────────────
  const D1 = await cas(POIDS_AUJ, { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  const D2 = await cas(POIDS_AUJ, { 'bf-neck': '40,7', 'bf-waist': '92,4' });
  t('B-CCCXXXIX ⑤ ⭐⭐ la VIRGULE donne exactement le même résultat que le POINT',
    D1.ok && D2.ok && D1.disque.join('|') === D2.disque.join('|') && D1.bf === D2.bf,
    'point=' + JSON.stringify([D1.disque, D1.bf]) + ' virgule=' + JSON.stringify([D2.disque, D2.bf]));

  // ── ⑤ LES TROIS ÉTATS DE POIDS QUI BLOQUAIENT — la racine du bug ─────────────────
  const E = await cas(VIDE + "S.weightLog=[];S.bw=0;", { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  t('B-CCCXXXIX ⑥ ⭐⭐ AUCUN poids connu → les mensurations sont quand même SUR LE DISQUE',
    E.ok && E.disque.join('|') === 'cou=40.7|taille=92.4', JSON.stringify(E));

  const L = await cas(VIDE + "S.weightLog=[{date:'2026-09-14',bf:19.9}];S.bw=85.9;",
                      { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  t('B-CCCXXXIX ⑦ ⭐⭐ une pesée SANS kilo n\'empêche plus rien (le poids du profil sert)',
    L.ok && L.disque.join('|') === 'cou=40.7|taille=92.4' && L.bf > 0, JSON.stringify(L));

  const M = await cas(VIDE + "S.weightLog=[{date:'2026-09-14',kg:0}];S.bw=85.9;",
                      { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  t('B-CCCXXXIX ⑧ ⭐ une pesée à `kg:0` n\'empêche plus rien non plus',
    M.ok && M.disque.join('|') === 'cou=40.7|taille=92.4' && M.bf > 0, JSON.stringify(M));

  /* ⭐⭐ CE TÉMOIN A ÉTÉ AJOUTÉ PAR LE CONTRÔLE NÉGATIF, PAS PAR MOI. La mutation M04
     (`_kgUtil = x => (x&&x.kg)||0`) restait VERTE sur mes témoins ⑦ et ⑧ : ni `{bf:19.9}` ni
     `{kg:0}` ne la distinguent. Or une valeur NON NUMÉRIQUE, elle, est *truthy* — la pesée du
     jour serait alors créée avec `kg:'abc'`, un poids qui n'en est pas un, et qui partirait
     dans les courbes et au cloud. 👉 ***Un trou trouvé par une mutation devient un témoin***
     (R17/R35), sinon la mutation n'a servi qu'à me rassurer. */
  const MX = await cas(VIDE + "S.weightLog=[{date:'2026-09-14',kg:'abc'}];S.bw=85.9;",
                       { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  t('B-CCCXXXIX ⑧bis ⭐⭐ un `kg` NON NUMÉRIQUE ne devient jamais le poids du jour',
    MX.ok && MX.disque.join('|') === 'cou=40.7|taille=92.4' && MX.poidsDuJour === 85.9,
    JSON.stringify(MX));

  // ── ⑥ MODIFIER UNE VALEUR EXISTANTE, ET NE PAS DÉTRUIRE LES AUTRES ───────────────
  const H = await cas(POIDS_AUJ + "mensAjouter('cou',40.7,'manuel');mensAjouter('taille',92.4,'manuel');",
                      { 'bf-waist': '91' });
  t('B-CCCXXXIX ⑨ ⭐ modifier la taille met à jour SA ligne et garde le cou',
    H.ok && H.disque.join('|') === 'cou=40.7|taille=91', JSON.stringify(H));

  /* ⛔⛔ CHAMP VIDE ≠ DEMANDE DE SUPPRESSION. C'est la consigne explicite, et c'est le pire
     mode d'échec possible : effacer une vraie mesure parce qu'un champ facultatif est vide. */
  const V = await cas(POIDS_AUJ + "mensAjouter('cou',40.7,'manuel');mensAjouter('taille',92.4,'manuel');",
                      { 'bf-neck': '' });
  t('B-CCCXXXIX ⑩ ⛔⛔ un champ VIDÉ ne détruit PAS la valeur déjà enregistrée',
    V.ok && V.disque.indexOf('cou=40.7') >= 0, JSON.stringify(V));

  // ── ⑦ LES 6 AUTRES MENSURATIONS — même mécanisme, un seul correctif ──────────────
  const AU = await cas(POIDS_AUJ, { 'bf-neck': '40.7', 'bf-waist': '92.4',
                                    'mens-bras': '38.5', 'mens-cuisse': '61', 'mens-mollet': '39' });
  t('B-CCCXXXIX ⑪ ⭐ les « autres mensurations » passent par la MÊME racine',
    AU.ok && AU.champsVus && ['bras=38.5', 'cuisse=61', 'mollet=39']
      .every(x => AU.disque.indexOf(x) >= 0), JSON.stringify(AU));

  const AU2 = await cas(VIDE + "S.weightLog=[];S.bw=0;", { 'mens-bras': '38.5' });
  t('B-CCCXXXIX ⑫ ⭐⭐ … y compris quand aucun poids n\'est connu (la racine, pas 6 correctifs)',
    AU2.ok && AU2.disque.join('|') === 'bras=38.5', JSON.stringify(AU2));

  // ── ⑧ LE POINT QUI COMPTE VRAIMENT : ÇA SURVIT AU RECHARGEMENT ───────────────────
  await cas(POIDS_AUJ, { 'bf-neck': '40.7', 'bf-waist': '92.4' });
  await pg.reload({ waitUntil: 'load' }); await pg.waitForTimeout(2200);
  await carte();
  const R = await pg.evaluate(() => ({
    mensLog: (S.mensLog || []).map(e => e.d + '/' + e.k + '=' + e.v).sort(),
    cou: (document.getElementById('bf-neck') || {}).value,
    taille: (document.getElementById('bf-waist') || {}).value,
    navy: ((document.getElementById('bf-navy-val') || {}).innerText || '').trim(),
  }));
  t('B-CCCXXXIX ⑬ ⭐⭐ APRÈS RECHARGEMENT : les mensurations sont toujours là, DATÉES',
    R.mensLog.join('|') === '2026-09-20/cou=40.7|2026-09-20/taille=92.4', JSON.stringify(R));
  t('B-CCCXXXIX ⑭ ⭐ … et l\'écran les réaffiche',
    R.cou === '40.7' && R.taille === '92.4', JSON.stringify(R));
  t('B-CCCXXXIX ⑮ ⛔ le calcul de masse grasse marche toujours après tout ça',
    /^~\d+(\.\d+)?\s*%$/.test(R.navy), JSON.stringify(R.navy));

  // ── ⑨ DEUX JOURS DIFFÉRENTS NE S'ÉCRASENT PAS ────────────────────────────────────
  const J2 = await pg.evaluate(async () => {
    const o = {};
    try {
      S.mensLog = []; S.neck = 0; S.waist = 0; S.hip = 0;
      mensAjouter('taille', 95, 'manuel');
      /* ⛔ on date la ligne d'HIER à la main : la sonde ne peut pas remonter le temps, et
         rejouer `today()` sous une autre horloge validerait mon décor, pas le produit. */
      S.mensLog[0].d = '2026-09-19';
      persist();
      const e = document.getElementById('bf-waist');
      if (e) { e.value = '92.4'; e.dispatchEvent(new Event('input', { bubbles: true })); }
      saveBodyFat(); await new Promise(r => setTimeout(r, 400));
      o.disque = JSON.parse(localStorage.getItem('ft4_mens') || '[]')
        .map(x => x.d + '/' + x.k + '=' + x.v).sort();
      o.ok = true;
    } catch (e) { o.ok = false; o.err = String(e && e.message || e); }
    return o;
  });
  /* ⚠️ L'ATTENDU PORTE SUR LA GARANTIE, PAS SUR LA LISTE ENTIÈRE. Ma première version figeait
     le contenu complet du disque — et rougissait parce que le champ « cou », toujours rempli
     après le rechargement du témoin ⑬, est légitimement ré-enregistré par le ✓ (c'est le
     comportement voulu de cette carte : appuyer sur ✓ EST l'acte de déclarer ses mensurations).
     *Un témoin qui fige une liste mesure l'ordre des témoins précédents, pas l'invariant.* */
  t('B-CCCXXXIX ⑯ ⭐ deux JOURS différents coexistent, ils ne s\'écrasent pas',
    J2.ok && J2.disque.indexOf('2026-09-19/taille=95') >= 0
          && J2.disque.indexOf('2026-09-20/taille=92.4') >= 0,
    JSON.stringify(J2));

  /* ══ ⑱-㉒ LE RETOUR DE CHRISTOPHE — « ma masse grasse revient à 20,7 le lendemain » ═════
     ⭐ On conduit DEUX JOURS avec la même carte : on avance l'horloge du contexte, ce qui est
     la seule facon honnête de mesurer un comportement qui ne se voit qu'au changement de jour.
     ⛔ Et on mesure ce que l'écran DIT, pas seulement ce qu'il stocke : la plainte porte sur
     l'affichage (« je n'ai pas la valeur précédente »), pas sur une perte de donnée. */
  const jour2 = async (isoJour, prep) => {
    const cx2 = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                     timezoneId: 'Europe/Paris' });
    await cx2.addInitScript(`(()=>{const F=new Date(${JSON.stringify(isoJour)});const V=Date;
      window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
        static now(){return F.getTime();}};})();`);
    await cx2.addInitScript(`(()=>{try{ if(localStorage.getItem('_d2')==='1')return;
      localStorage.clear(); localStorage.setItem('_d2','1');
      localStorage.setItem('ft4_bw','85.9');localStorage.setItem('ft4_age','48');
      localStorage.setItem('ft4_ht','180');localStorage.setItem('ft4_gender','H');
      ${prep} }catch(e){}})();`);
    const pg2 = await cx2.newPage();
    await pg2.goto('http://localhost:' + PORT + '/index.html');
    await pg2.waitForTimeout(2200);
    const o = await pg2.evaluate(async () => {
      const pause = ms => new Promise(r => setTimeout(r, ms));
      goScreen('progress', document.querySelector('[onclick*="progress"]')); await pause(320);
      switchProgTab('poids', document.getElementById('ptab-poids')); await pause(450);
      const txt = (document.getElementById('bodyfat-card') || {}).innerText || '';
      return {
        jour: today(),
        bf: (document.getElementById('bf-inp') || {}).value,
        sousTitre: (txt.split('\n')[1] || '').trim(),
        navy: _bfNavy(S.neck, S.waist, S.hip, S.height, S.gender),
        derniere: (typeof bfDerniere === 'function') ? bfDerniere(null) : '(absente)',
      };
    });
    await cx2.close();
    return o;
  };

  /* ⭐ Le decor est celui de Christophe : des mensurations qui NE BOUGENT PAS (donc un calcul
     US Navy constant) et une valeur de BALANCE notee la veille. */
  const MESURES = "localStorage.setItem('ft4_neck','40.7');localStorage.setItem('ft4_waist','95.5');";
  const VEILLE = MESURES + "localStorage.setItem('ft4_wlog',JSON.stringify("
    + "[{date:'2026-09-20',kg:85.9,bf:19.1},{date:'2026-09-19',kg:86.1}]));";

  const C1 = await jour2('2026-09-20T10:00:00', VEILLE);
  t('B-CCCXXXIX ⑱ le MÊME jour, la valeur enregistrée est bien celle qui s\'affiche',
    C1.jour === '2026-09-20' && C1.bf === '19.1' && /Enregistr/.test(C1.sousTitre),
    JSON.stringify(C1));

  const C2 = await jour2('2026-09-21T10:00:00', VEILLE);
  /* ⛔⛔ LE CŒUR DU RETOUR : le lendemain, l'app propose le CALCUL (constant), pas la derniere
     valeur notee. C'est le comportement ACTUEL, volontairement conserve (D-013 non tranchee) —
     ce temoin le FIGE pour qu'il ne change pas « en passant ». */
  t('B-CCCXXXIX ⑲ ⛔ le LENDEMAIN, le chiffre proposé est bien le calcul, pas la valeur notée',
    C2.jour === '2026-09-21' && parseFloat(C2.bf) === C2.navy && C2.bf !== '19.1',
    JSON.stringify(C2));
  /* ⭐⭐ ET C'EST ÇA QUI MANQUAIT : l'écran doit DIRE d'où vient ce chiffre ET montrer la
     dernière valeur réelle avec sa date. « Je n'ai pas la valeur précédente », mot pour mot. */
  t('B-CCCXXXIX ⑳ ⭐⭐ … et l\'écran NOMME sa source et rappelle la dernière valeur notée',
    /d'après tes mesures/.test(C2.sousTitre) && /dernière notée\s*:\s*19\.1 %/.test(C2.sousTitre)
      && /le 20\/09/.test(C2.sousTitre),
    JSON.stringify(C2.sousTitre));
  t('B-CCCXXXIX ㉑ ⭐ le propriétaire rend bien la dernière mesure RÉELLE, pas le calcul',
    C2.derniere && C2.derniere.bf === 19.1 && C2.derniere.date === '2026-09-20',
    JSON.stringify(C2.derniere));

  /* ⛔ AUCUNE VALEUR NOTÉE : on ne doit rien inventer, et surtout pas un « dernière notée ». */
  const C3 = await jour2('2026-09-21T10:00:00', MESURES
    + "localStorage.setItem('ft4_wlog',JSON.stringify([{date:'2026-09-19',kg:86.1}]));");
  t('B-CCCXXXIX ㉒ ⛔ sans aucune valeur notée, l\'écran n\'invente aucun rappel',
    !/dernière notée/.test(C3.sousTitre) && C3.derniere === null, JSON.stringify(C3));

  t('B-CCCXXXIX ㉓ aucune erreur JS pendant toute la conduite',
    errs.length === 0, errs.slice(0, 3).join(' | '));

  await cx.close();
};
