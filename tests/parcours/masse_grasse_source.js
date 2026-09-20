/* ══════════════════════════════════════════════════════════════════════════════════════
   ⚖️ SÉPARER « MASSE GRASSE MESURÉE » ET « ESTIMATION US NAVY » (20/09/2026)

   Michel : *« Ces deux valeurs sont différentes par nature et ne doivent pas se remplacer
   l'une l'autre. »* · ⛔ *« Je ne veux pas simplement changer deux textes dans l'interface si
   les deux valeurs restent mélangées dans les données — vérifie le MODÈLE réel. »*

   ⛔⛔ ELLES ÉTAIENT RÉELLEMENT CONFONDUES, ET C'EST MESURÉ, PAS DÉDUIT. `S.weightLog[].bf`
   était un champ UNIQUE sans provenance, qui recevait indifféremment ce que la personne tapait
   et le calcul US Navy. Conduit dans l'app servie, horloge gelée :
     · balance 18,3 % enregistrée → `{bf:18.3}` ;
     · tour de taille corrigé → `_recalcNavyBf` écrivait 17,9 **DANS LA CASE** ;
     · ✓ → `{bf:17.9}`. ***La valeur de la balance disparaissait sans un mot.***

   ⭐ LA CAUSE TENAIT EN SIX MOTS : `if(navy!=null){…i.value=navy;}`.
   👉 ***Une estimation qui s'écrit dans le champ de saisie CESSE d'être une estimation au
   premier ✓*** — plus rien ne la distingue de ce que la personne a tapé.

   ⛔ AUCUNE MIGRATION : `bfSrc` s'ajoute À CÔTÉ de `bf` (patron de `coachMemoryMeta`,
   ft-v1227). Les lignes d'avant n'ont pas de provenance, elles gardent ce trou, et il se lit
   « on ne sait pas » — *une fausse précision est pire qu'un trou déclaré* (règle d'or #16).

   ⭐ ON MESURE DEUX NIVEAUX : ce que l'écran DIT, et ce qui est réellement dans `S.weightLog`
   après un vrai rechargement. *Le brief interdit explicitement de se contenter du premier.*
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.source = function (t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'tracking.js'), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS — ceux du correctif citent `bfSrc`, `estime`, `mesure`,
     `i.value=navy` et « ne remplace pas » en toutes lettres (R30 : la raison s'écrit à côté du
     code). Un témoin qui lirait le fichier brut resterait vert quoi qu'on remette dans le code. */
  const A = brut.replace(/\/\*[\s\S]*?\*\//g, ' ')
                .replace(/(^|[^:"'`])\/\/[^\n]*/gm, '$1');
  const nu = A.replace(/\s+/g, '');

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

  console.log('\n═══ B-CCCXLII. Mesurée vs estimée — la séparation, figée dans la source ═══');

  /* ⛔⛔ LE TÉMOIN CENTRAL : L'ESTIMATION NE DOIT PLUS ÉCRIRE DANS LE CHAMP DE SAISIE.
     C'est LA cause, et elle se mesure par une absence. Un témoin qui chercherait la présence
     de `bfSrc` quelque part resterait vert alors que la ligne fautive serait revenue. */
  const REC = corps('_recalcNavyBf');
  t('B-CCCXLII ① `_recalcNavyBf` est toujours là', REC !== '', 'introuvable');
  t('B-CCCXLII ② ⭐⭐ l\'estimation n\'écrit PLUS dans la case de saisie (la cause)',
    REC !== '' && !/getElementById\(\s*['"]bf-inp['"]\s*\)/.test(REC)
      && !/\.value\s*=\s*navy/.test(REC.replace(/\s+/g, '')),
    'elle remplit encore #bf-inp');
  t('B-CCCXLII ③ … mais elle met toujours à jour SON propre affichage',
    /bf-navy-val/.test(REC), 'l\'estimation ne s\'affiche plus du tout');

  /* ⛔ LA PROVENANCE EXISTE, ET ELLE N'A QUE DEUX VALEURS NOMMÉES. */
  t('B-CCCXLII ④ ⭐ deux provenances déclarées, et une seule fois (R2)',
    /const\s+BF_MESURE\s*=\s*'mesure'\s*,\s*BF_ESTIME\s*=\s*'estime'/.test(A.replace(/\s+/g, ' ')),
    'les constantes de provenance ont disparu');
  t('B-CCCXLII ⑤ ⛔ aucune troisième valeur de provenance inventée',
    (A.match(/bfSrc\s*=\s*'/g) || []).length === 0,
    'une provenance est écrite en clair au lieu de passer par les constantes');

  /* ⛔⛔ LA GARANTIE DU BRIEF : une estimation n'écrase jamais une mesure.
     On mesure le MÉCANISME (le garde est appelé avant l'écriture), pas le mot. */
  const SBF = corps('saveBodyFat');
  t('B-CCCXLII ⑥ `saveBodyFat` est toujours là', SBF !== '', 'introuvable');
  t('B-CCCXLII ⑦ ⭐⭐ une ESTIMATION ne peut écrire que sur un emplacement remplaçable',
    /bfSrc===BF_ESTIME&&!_bfRemplacableParEstime\(e\)/.test(SBF.replace(/\s+/g, '')),
    'le garde a disparu');
  /* ⚠️ ET L'ORDRE COMPTE : le garde doit précéder l'écriture, sinon il ne protège rien.
     *Un contrôle posé après l'affectation mesure un dégât déjà fait.* */
  const _sansEsp = SBF.replace(/\s+/g, '');
  t('B-CCCXLII ⑧ ⭐ … et le garde est posé AVANT l\'écriture de `e.bf`',
    _sansEsp.indexOf('_bfRemplacableParEstime(e)') >= 0
      && _sansEsp.indexOf('_bfRemplacableParEstime(e)') < _sansEsp.indexOf('e.bf=Math.round'),
    'le garde arrive après l\'affectation');
  t('B-CCCXLII ⑨ ⛔ une provenance INCONNUE est traitée comme intouchable (R29)',
    /e\.bf==null\|\|e\.bfSrc===BF_ESTIME/.test(nu),
    'le garde accepte d\'écraser une ligne sans provenance');

  /* ⛔ QUATRE ÉCRIVAINS, QUATRE PROVENANCES — un seul oubli et la donnée redevient muette.
     Mesuré avant d'écrire : `saveBodyFat`, `saveWeighEdit`, `saveBodyScan` et l'import de
     bilans écrivent tous dans `S.weightLog[].bf`. */
  t('B-CCCXLII ⑩ ⭐⭐ les 4 écrivains de `bf` posent tous une provenance',
    (A.match(/bfSrc\s*=/g) || []).length >= 5, 'un écrivain écrit un % sans dire d\'où il vient');
  const EDI = corps('saveWeighEdit');
  t('B-CCCXLII ⑪ ⭐ l\'édition d\'une pesée ne PROMEUT pas une estimation en mesure',
    /_anc&&_anc\.bf===bfv&&_anc\.bfSrc/.test(EDI.replace(/\s+/g, '')),
    'rouvrir une pesée requalifie le % en « mesure »');
  t('B-CCCXLII ⑫ ⭐ un bilan corporel est une MESURE, jamais une estimation',
    (A.match(/bfSrc\s*=\s*BF_MESURE/g) || []).length >= 3, '');

  /* ⚖️ D-013 EST TRANCHÉE : le champ ne porte QUE la mesure du jour. */
  const CAR = corps('renderBodyFatCard');
  t('B-CCCXLII ⑬ ⭐⭐ D-013 : le champ n\'est prérempli que par la MESURE du jour',
    /constprefill=mesureDuJour\?todayW\.bf:''/.test(CAR.replace(/\s+/g, '')),
    'le préremplissage a changé');
  t('B-CCCXLII ⑭ ⛔ … et une estimation du jour ne prérempli pas le champ',
    /mesureDuJour=\(savedToday&&todayW\.bfSrc!==BF_ESTIME\)/.test(CAR.replace(/\s+/g, '')), '');

  /* ⭐ L'ÉCRAN DIT LES DEUX, ET IL NE DIT « mesure saisie » QUE S'IL LE SAIT. */
  t('B-CCCXLII ⑮ ⭐ l\'estimation est nommée comme telle à l\'écran',
    /Estimation d\\?'après tes mensurations/.test(CAR), '');
  /* ⚠️ CE TÉMOIN A ROUGI SUR DU CODE PARFAITEMENT SAIN, ET C'EST LE PIÈGE DE L'ESPACE — 9ᵉ FOIS.
     Ma première version cherchait le motif dans une source dont j'avais retiré TOUS les espaces
     (`.replace(/\s+/g,'')`) — y compris ceux qui sont **à l'intérieur des libellés**, donc
     « Dernière mesure saisie » y devenait « Dernièremesuresaisie ». *Quand on nettoie la source,
     on nettoie le motif du même geste — sinon le garde mesure sa propre mise en forme.*
     ⭐ Et l'invariant juste n'est pas la forme exacte du ternaire : c'est que **le choix du mot
     dépende de la provenance**, et que les deux libellés existent. */
  t('B-CCCXLII ⑯ ⭐⭐ le libellé du rappel dépend de ce qu\'on SAIT de la provenance',
    /src\s*===\s*BF_MESURE/.test(CAR)
      && /Dernière mesure saisie/.test(CAR) && /Dernière valeur notée/.test(CAR),
    'le rappel affirme une provenance qu\'on ignore');

  /* ⛔ LA DERNIÈRE MESURE NE DOIT PAS ÊTRE UNE ESTIMATION. */
  const DER = corps('bfDerniere');
  t('B-CCCXLII ⑰ ⭐ `bfDerniere` écarte les estimations',
    /w\.bfSrc!==BF_ESTIME/.test(DER.replace(/\s+/g, '')), '');
  t('B-CCCXLII ⑱ ⛔ … elle TRIE toujours par date et rend `null`, jamais 0 (R29)',
    /localeCompare/.test(DER) && /:null;/.test(DER.replace(/\s+/g, '')), '');
  t('B-CCCXLII ⑲ ⭐ … et elle rend la provenance AVEC la valeur',
    /src:l\[0\]\.bfSrc\|\|null/.test(DER.replace(/\s+/g, '')), '');

  /* ⛔ LE PÉRIMÈTRE, NOMMÉ PAR MICHEL. La formule US Navy ne bouge pas d'une constante. */
  t('B-CCCXLII ⑳ ⛔ la formule US Navy homme est intacte',
    nu.includes('bf=495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(ht))-450'), '');
  t('B-CCCXLII ㉑ ⛔ la formule US Navy femme est intacte',
    nu.includes('bf=495/(1.29579-0.35004*Math.log10(waist+hip-neck)+0.22100*Math.log10(ht))-450'),
    '');
  t('B-CCCXLII ㉒ ⛔ aucune migration : rien ne réécrit les `bfSrc` des lignes existantes',
    !/weightLog[\s\S]{0,80}forEach[\s\S]{0,120}bfSrc\s*=/.test(A), 'une migration a été ajoutée');
  t('B-CCCXLII ㉓ ⛔ un champ VIDE ne vaut toujours pas « efface » (acquis ft-v1230)',
    /if\(!brut\)return;/.test(corps('_mensEnregistrerSaisie').replace(/\s+/g, '')), '');
};

module.exports.ecran = async function (t, b, PORT) {
  /* ⏰ HORLOGE GELÉE : tout ce bloc parle de JOURS. Sans gel, une passe lancée à 23 h 59
     daterait la mesure d'un jour et la relecture du suivant. */
  const GEL = '2026-09-20T10:00:00';
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`(()=>{const F=new Date(${JSON.stringify(GEL)});const V=Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  /* ⛔⛔ LE DÉCOR NE SE POSE QU'UNE FOIS : un `addInitScript` rejoue à CHAQUE navigation,
     **rechargement compris**. Une fixture qui s'efface elle-même pendant la mesure mesure la
     fixture, pas le produit (leçon ft-v1230). */
  await pg.addInitScript(`(()=>{try{
    if(localStorage.getItem('_decorBfSrc')==='1')return;
    localStorage.clear();localStorage.setItem('_decorBfSrc','1');
    localStorage.setItem('ft4_bw','85.9');localStorage.setItem('ft4_age','48');
    localStorage.setItem('ft4_ht','180');localStorage.setItem('ft4_gender','H');}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXLIII. Mesurée vs estimée (conduit, horloge gelée) --');

  const carte = () => pg.evaluate(async () => {
    const pause = ms => new Promise(r => setTimeout(r, ms));
    goScreen('progress', document.querySelector('[onclick*="progress"]')); await pause(320);
    switchProgTab('poids', document.getElementById('ptab-poids')); await pause(450);
  });
  const scene = (js) => pg.evaluate(j => { eval(j); persist(); }, js);
  const lire = () => pg.evaluate(() => {
    const d = today();
    const l = (S.weightLog || []).find(w => w.date === d) || null;
    const c = document.getElementById('bodyfat-card');
    return {
      sous: c ? (c.querySelector('div[style*="12px"]') || {}).textContent || '' : '',
      champ: (document.getElementById('bf-inp') || {}).value,
      navy: (document.getElementById('bf-navy-val') || {}).textContent || '',
      bf: l ? l.bf : undefined, src: l ? l.bfSrc : undefined, ligne: !!l,
      disque: (JSON.parse(localStorage.getItem('ft4_wlog') || '[]')
        .find(w => w.date === d) || {}),
    };
  });
  const valider = (ch) => pg.evaluate(async c => {
    Object.keys(c).forEach(id => {
      const e = document.getElementById(id);
      if (e) { e.value = c[id]; e.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    saveBodyFat(); await new Promise(r => setTimeout(r, 380));
    return (document.querySelector('.toast, #toast') || {}).textContent || '';
  }, ch);

  const VIERGE = "S.weightLog=[];S.mensLog=[];S.neck=0;S.waist=0;S.hip=0;";

  // ═══ CAS A — mensurations seules, aucune valeur de balance ═════════════════
  await scene(VIERGE); await carte();
  await valider({ 'bf-neck': '40.7', 'bf-waist': '92.4' });
  await carte();
  let o = await lire();
  t('B-CCCXLIII ① CAS A · l\'estimation est visible', /~19\.6 %/.test(o.navy), o.navy);
  t('B-CCCXLIII ② ⭐⭐ CAS A · elle est enregistrée COMME UNE ESTIMATION, pas comme une mesure',
    o.bf === 19.6 && o.src === 'estime', JSON.stringify(o));
  t('B-CCCXLIII ③ ⭐ CAS A · l\'écran ne prétend pas avoir une mesure du jour',
    !/Mesure du jour/.test(o.sous) && /Estimation d'après tes mensurations/.test(o.sous), o.sous);
  t('B-CCCXLIII ④ ⛔ CAS A · le champ de saisie reste VIDE (D-013)', o.champ === '', o.champ);

  // ═══ CAS B — la personne saisit la valeur de sa balance ════════════════════
  await valider({ 'bf-inp': '18.3' }); await carte();
  o = await lire();
  t('B-CCCXLIII ⑤ ⭐⭐ CAS B · la valeur saisie est enregistrée comme MESURE',
    o.bf === 18.3 && o.src === 'mesure', JSON.stringify(o));
  t('B-CCCXLIII ⑥ ⭐⭐ CAS B · les deux coexistent à l\'écran, sans se remplacer',
    /Mesure du jour : 18\.3 %/.test(o.sous) && /Estimation[^·]*~19\.6 %/.test(o.sous), o.sous);
  t('B-CCCXLIII ⑦ CAS B · le champ porte la mesure du jour', o.champ === '18.3', o.champ);

  // ═══ CAS C — LE CŒUR : on modifie une mensuration APRÈS la balance ═════════
  await pg.evaluate(() => {
    const e = document.getElementById('bf-waist');
    e.value = '90'; e.dispatchEvent(new Event('input', { bubbles: true }));
  });
  o = await lire();
  t('B-CCCXLIII ⑧ ⭐⭐ CAS C · l\'estimation bouge en direct…', /~17\.9 %/.test(o.navy), o.navy);
  t('B-CCCXLIII ⑨ ⭐⭐ CAS C · … et elle N\'ÉCRIT PAS dans la case de saisie (la cause)',
    o.champ === '18.3', 'le champ affiche ' + o.champ);
  await valider({}); await carte();
  o = await lire();
  t('B-CCCXLIII ⑩ ⭐⭐⭐ CAS C · après le ✓, la MESURE 18,3 a survécu',
    o.bf === 18.3 && o.src === 'mesure', JSON.stringify(o));
  t('B-CCCXLIII ⑪ ⭐ CAS C · la nouvelle estimation est bien affichée à côté',
    /~17\.9 %/.test(o.sous) || /~17\.9 %/.test(o.navy), o.sous);

  // ═══ LA GARANTIE, PRISE PAR SON CHEMIN DIRECT : champ effacé + ✓ ══════════
  await valider({ 'bf-inp': '' }); await carte();
  o = await lire();
  t('B-CCCXLIII ⑫ ⭐⭐⭐ champ EFFACÉ + ✓ : l\'estimation ne remplace toujours pas la mesure',
    o.bf === 18.3 && o.src === 'mesure', JSON.stringify(o));

  /* ⛔ ET UNE PROVENANCE INCONNUE EST PROTÉGÉE PAREIL — c'est le cas des lignes d'AVANT ce
     chantier, donc de toutes celles de Michel et de Christophe aujourd'hui. */
  await scene("S.weightLog=[{date:today(),kg:85.9,bf:20.7}];S.neck=40.7;S.waist=92.4;");
  await carte();
  await valider({ 'bf-inp': '', 'bf-waist': '90' }); await carte();
  o = await lire();
  t('B-CCCXLIII ⑬ ⭐⭐ une ligne SANS provenance (ancienne) n\'est pas écrasée non plus',
    o.bf === 20.7, JSON.stringify(o));
  t('B-CCCXLIII ⑭ ⛔ … et on ne lui INVENTE pas une provenance au passage (règle d\'or #16)',
    o.src === undefined, 'provenance fabriquée : ' + o.src);

  /* ⛔⛔ TROU TROUVÉ PAR LE CONTRÔLE NÉGATIF — c'est exactement à ça qu'il sert.
     La mutation `M06` (`let bfSrc=null;` au lieu de la lecture du champ) restait **VERTE** :
     tous mes cas de provenance inconnue passaient par le champ **effacé**, donc par le garde de
     l'estimation, qui sort AVANT d'arriver à la conservation de provenance.
     👉 ***Le chemin réel n'est pas celui-là*** : une ligne ancienne est PRÉREMPLIE dans la case,
     donc la personne appuie sur ✓ **sans rien effacer**, et c'est là que la provenance se
     fabriquait. *Un cas qu'on n'écrit pas reste vert pour toujours.* */
  await scene("S.weightLog=[{date:today(),kg:85.9,bf:20.7}];S.neck=40.7;S.waist=92.4;");
  await carte();
  const champPre = (await lire()).champ;
  t('B-CCCXLIII ⑭bis une ligne ancienne EST bien préremplie (sinon le cas suivant ne teste rien)',
    champPre === '20.7', 'champ = ' + champPre);
  await valider({}); await carte();
  o = await lire();
  t('B-CCCXLIII ⑭ter ⭐⭐ un ✓ SANS RIEN CHANGER ne fabrique pas une provenance',
    o.bf === 20.7 && o.src === undefined, JSON.stringify(o));

  /* ⭐ MAIS UNE ESTIMATION, ELLE, PEUT ÊTRE REMPLACÉE PAR UNE ESTIMATION PLUS FRAÎCHE. */
  await scene("S.weightLog=[{date:today(),kg:85.9,bf:19.6,bfSrc:'estime'}];S.neck=40.7;S.waist=92.4;");
  await carte();
  await valider({ 'bf-inp': '', 'bf-waist': '90' }); await carte();
  o = await lire();
  t('B-CCCXLIII ⑮ ⭐ une estimation est bien rafraîchie par la nouvelle estimation',
    o.bf === 17.9 && o.src === 'estime', JSON.stringify(o));

  /* ⭐ ET UNE MESURE ÉCRIT TOUJOURS, quelle que soit la provenance en place. */
  await scene("S.weightLog=[{date:today(),kg:85.9,bf:19.6,bfSrc:'estime'}];S.neck=40.7;S.waist=92.4;");
  await carte();
  await valider({ 'bf-inp': '17,2' }); await carte();
  o = await lire();
  t('B-CCCXLIII ⑯ ⭐ une MESURE saisie écrase bien une estimation (sens autorisé)',
    o.bf === 17.2 && o.src === 'mesure', JSON.stringify(o));
  t('B-CCCXLIII ⑰ ⭐ … et la virgule du clavier français est lue (acquis ft-v1230)',
    o.bf === 17.2, 'lu ' + o.bf);

  // ═══ CAS F — rechargement complet : mêmes valeurs, mêmes dates, mêmes sources ═══
  await pg.reload(); await pg.waitForTimeout(2200); await carte();
  o = await lire();
  t('B-CCCXLIII ⑱ ⭐⭐ CAS F · après RECHARGEMENT, la valeur ET sa provenance sont là',
    o.bf === 17.2 && o.src === 'mesure', JSON.stringify(o));
  t('B-CCCXLIII ⑲ ⭐⭐ CAS F · et c\'est bien le DISQUE qui les porte',
    o.disque.bf === 17.2 && o.disque.bfSrc === 'mesure', JSON.stringify(o.disque));

  // ═══ CAS D et E — le LENDEMAIN ════════════════════════════════════════════
  await pg.evaluate(`(()=>{const F=new Date('2026-09-21T10:00:00');const V=window.Date;
    window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}
      static now(){return F.getTime();}};})();`);
  await carte();
  o = await lire();
  t('B-CCCXLIII ⑳ ⭐⭐ CAS D · le lendemain, RIEN n\'est enregistré automatiquement',
    o.ligne === false, JSON.stringify(o));
  t('B-CCCXLIII ㉑ ⭐⭐ CAS D · la dernière MESURE reste consultable, avec sa date',
    /Dernière mesure saisie : 17\.2 % — 20\/09/.test(o.sous), o.sous);
  t('B-CCCXLIII ㉒ ⛔ CAS D · et le champ ne propose PAS la mesure de la veille (D-013)',
    o.champ === '', o.champ);

  await valider({ 'bf-waist': '91' }); await carte();
  o = await lire();
  t('B-CCCXLIII ㉓ ⭐ CAS E · la nouvelle estimation du jour est enregistrée comme telle',
    o.bf === 18.6 && o.src === 'estime', JSON.stringify(o));
  const hier = await pg.evaluate(() =>
    (S.weightLog || []).find(w => w.date === '2026-09-20') || {});
  t('B-CCCXLIII ㉔ ⭐⭐ CAS E · la mesure de la veille est intacte, valeur ET provenance',
    hier.bf === 17.2 && hier.bfSrc === 'mesure', JSON.stringify(hier));
  t('B-CCCXLIII ㉕ ⭐ CAS E · aucune confusion : l\'écran nomme les deux séparément',
    /Estimation[^·]*~18\.6 %/.test(o.sous) && /Dernière mesure saisie : 17\.2 %/.test(o.sous),
    o.sous);

  t('B-CCCXLIII ㉖ aucune erreur JS pendant toute la conduite',
    errs.length === 0, errs.join(' | '));
  await cx.close();
};
