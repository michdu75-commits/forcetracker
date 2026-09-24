/* ══════════════════════════════════════════════════════════════════════════════════════
   ⚖️ LA CHAÎNE POIDS — saisie, historique, restauration, persistance (24/09/2026)

   Chantier de Michel : *« priorité absolue : intégrité et cohérence de la donnée avant
   UX »*. Les défauts du registre forensique étaient des HYPOTHÈSES ; ils ont été
   **revalidés en conduisant l'app servie** (ft-v1234, arbre 0193b82a) avant d'écrire une
   ligne de correctif :

     · F003 ✅ la restauration écrivait `S.bw` sans borne (−10, 500, 3000, `1e4`, `Infinity`
       entraient ; « 85,9 » devenait **85** — `parseFloat` s'arrête à la virgule) ;
     · F004 ✅ l'import balance écrivait sans borne, et posait `S.bw` sur le DERNIER JOUR DU
       FICHIER — un historique plus ancien faisait reculer le poids courant (91 au lieu de 86) ;
       une date lue à l'américaine (`09/20/2026` → « 2026-20-09 ») passait EN TÊTE du journal ;
     · F005 ✅ trois règles pour la même grandeur : le Profil refusait **20** et **300**, que la
       pesée, le bilan et `_poidsValide` acceptent — et son message annonçait « 20–299 » ;
     · F011 ✅ le Profil écrivait `S.bw` sans pesée : Nutrition sur 84, Accueil et courbe sur 86 ;
     · F012 ❌ PRÉMISSE FAUSSE : le bilan corporel s'enregistre depuis l'écran **Progrès**, et
       `_applyScreen('setup')` redessine le Profil à CHAQUE entrée. Le retour en arrière n'existe
       que si un écrivain tourne PENDANT que le Profil est affiché — aucun parcours ne le fait
       aujourd'hui ; l'invariant est quand même figé (E), c'est ce que Michel demande.
     · ⭐ Trouvés en mesurant, absents du registre : ① `S.bw = S.weightLog[0].kg` sans contrôle
       (édition, suppression, bilan) écrivait « undefined » sur le disque quand la ligne la plus
       récente ne portait qu'un % ; ② le champ « Pesée du jour » PRÉREMPLI + un ✓ machinal
       fabriquait une pesée datée d'aujourd'hui avec le poids d'il y a trois jours.

   ⛔ ON MESURE DEUX NIVEAUX : ce que l'écran DIT et ce qui est sur le DISQUE après un vrai
   rechargement. ⛔ FICHIER À PART (comme `mensurations.js`) : le contrôle négatif doit
   rejouer ses mutations en secondes, pas relancer une passe de 25 minutes.
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
  /* ⚠️ COMMENTAIRES NEUTRALISÉS : les commentaires du correctif citent `_poidsValide`,
     `S.weightLog[0].kg` et `parseFloat(d.bw)` en toutes lettres (R30). Un témoin qui lirait le
     fichier brut resterait vert quoi qu'on remette dans le code. */
  const lire = f => _sansCommentaires(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const ST = lire('state.js'), TR = lire('tracking.js'), SE = lire('setup.js');
  const net = s => s.replace(/\s+/g, ' ');
  /* Une borne de poids écrite EN DUR (kg<20, bw>300, 299…) sur une variable de poids. */
  const BORNE_EN_DUR = /\b(kg|bw)\s*[<>]=?\s*(20|299|300)\b|\b(20|299|300)\s*[<>]=?\s*(kg|bw)\b/;

  console.log('\n═══ B-CCCLV. La chaîne Poids — une règle, des propriétaires, figés dans la source ═══');

  const PV = _corps(ST, '_poidsValide');
  t('B-CCCLV ① `_poidsValide` garde SES bornes : 20 et 300 kg inclus (aucune borne inventée)',
    /k\s*>=\s*20\s*&&\s*k\s*<=\s*300/.test(PV), PV.slice(0, 120) || 'introuvable');

  /* ⭐⭐ F005 — LES ÉCRANS N'ONT PLUS LEUR PROPRE RÈGLE. On mesure l'ABSENCE d'une borne en dur
     ET la présence de l'appel : l'un sans l'autre laisserait une 2ᵉ règle, ou aucune. */
  [['saveWeightEntry', TR], ['saveWeighEdit', TR], ['saveProfile', SE]].forEach(([n, src]) => {
    const c = _corps(src, n);
    t('B-CCCLV ② `' + n + '` valide par `_poidsValide`, sans borne de poids en dur',
      c !== '' && /_poidsValide\(/.test(c) && !BORNE_EN_DUR.test(c),
      c === '' ? 'introuvable' : ((c.match(BORNE_EN_DUR) || [''])[0] || 'appel absent'));
  });

  /* F003 — la restauration : même propriétaire, et `numFR` (« 85,9 » ne devient plus 85). */
  const RS = _corps(SE, '_applyRestoreData');
  t('B-CCCLV ③ ⭐ la restauration passe le poids par `_poidsValide` (F003)',
    /numFR\(\s*d\.bw\s*\)/.test(RS) && /d\.bw[\s\S]{0,60}_poidsValide\(/.test(RS)
      && !/S\.bw\s*=\s*parseFloat\(\s*d\.bw/.test(RS), RS === '' ? 'introuvable' : '');

  /* F004 — l'import : poids ET date par leurs propriétaires, et plus de `S.bw` tiré du fichier. */
  const IM = _corps(TR, '_importScaleRows');
  t('B-CCCLV ④ ⭐ l\'import balance filtre poids ET date par les propriétaires existants (F004)',
    /_poidsValide\(/.test(IM) && /_dateImportValide\(/.test(IM), IM === '' ? 'introuvable' : '');
  t('B-CCCLV ⑤ ⭐ l\'import ne pose plus `S.bw` sur le dernier jour DU FICHIER',
    IM !== '' && !/S\.bw\s*=[^;]*byDay/.test(IM) && /_bwSurDernierePesee\(/.test(IM), '');

  /* Le recalcul sans contrôle `S.bw = S.weightLog[0].kg` a disparu de TOUT le fichier… */
  t('B-CCCLV ⑥ ⭐ plus aucun `S.bw = S.weightLog[0].kg` (la ligne la plus récente peut ne porter qu\'un %)',
    !/S\.bw\s*=\s*S\.weightLog\s*\[\s*0\s*\]/.test(TR), (TR.match(/S\.bw\s*=\s*S\.weightLog\s*\[\s*0\s*\][^;]*/) || [''])[0]);
  /* … et chaque écrivain d'historique repasse par le MÊME propriétaire. */
  ['saveWeighEdit', 'deleteWeighEntry', 'saveBodyScan'].forEach(n => {
    const c = _corps(TR, n);
    t('B-CCCLV ⑦ `' + n + '` repose le poids courant par `_bwSurDernierePesee`',
      /_bwSurDernierePesee\(/.test(c), c === '' ? 'introuvable' : '');
  });

  /* Le propriétaire de « quelle est la dernière pesée ? » — patron de `bfDerniere`/`mensDerniere`. */
  const PD = _corps(ST, 'poidsDernier');
  t('B-CCCLV ⑧ `poidsDernier` trie par DATE, ne garde qu\'un poids valide, et rend `null`, jamais 0',
    PD !== '' && /_poidsValide\(/.test(PD) && /\.sort\(/.test(PD) && /localeCompare/.test(PD)
      && /:\s*null/.test(PD) && !/return\s+0\b/.test(PD), PD === '' ? 'introuvable' : PD.slice(0, 140));

  /* F011 — le Profil enregistre une PESÉE, et seulement si le champ a été touché. */
  const SP = net(_corps(SE, 'saveProfile'));
  t('B-CCCLV ⑨ ⭐ le Profil enregistre le poids comme une pesée datée (F011)',
    /typeof _enregistrerPesee\s*===\s*'function'\s*\)\s*_enregistrerPesee\(\s*bw\s*\)\s*;\s*else S\.bw\s*=\s*bw/.test(SP),
    SP === '' ? 'introuvable' : 'le chemin Profil → pesée est absent');
  t('B-CCCLV ⑩ … seulement si le champ a été TOUCHÉ (un champ prérempli ne fabrique pas de pesée)',
    /dataset\.touche/.test(SP) && /dataset\.touche/.test(net(_corps(SE, 'renderSetup'))), '');

  /* ⛔ ANTI-DÉDOUBLONNAGE : aucune comparaison avec le poids précédent dans le propriétaire
     de la pesée — « même valeur » ne veut jamais dire « rien à enregistrer » (Michel). */
  const EP = _corps(TR, '_enregistrerPesee');
  t('B-CCCLV ⑪ ⭐ `_enregistrerPesee` ne compare pas la nouvelle valeur à l\'ancienne',
    EP !== '' && !/===\s*\+?S\.bw\b|S\.bw\s*===|\.kg\s*===\s*kg\b|\bkg\s*===/.test(EP), EP === '' ? 'introuvable' : '');
  /* ⚖️ ET L'ARCHITECTURE N'EST PAS CHANGÉE EN PASSANT : une pesée par jour, clé = la date.
     Plusieurs pesées horodatées le même jour sont une DÉCISION rendue à Michel. */
  t('B-CCCLV ⑫ le modèle reste « une pesée par jour » (clé = date) — pas de migration',
    /findIndex\(\s*w\s*=>\s*w\.date\s*===\s*d\s*\)/.test(EP) && /_enregistrerPesee\(/.test(_corps(TR, 'saveWeightEntry')), '');

  console.log('\n═══ B-CCCLVII. L\'UX « Dernière mesure » — figée dans la source ═══');
  const RW = _corps(TR, 'renderWeightTab');
  t('B-CCCLVII ① le champ de nouvelle mesure est rendu VIDE (aucun préremplissage)',
    RW !== '' && /id="wentry-inp"\s+value=""/.test(RW) && !/prefill/.test(RW) && !/placeholder="\$\{S\.bw/.test(RW),
    RW === '' ? 'introuvable' : '');
  t('B-CCCLVII ② la « Dernière mesure » est lue chez le propriétaire unique `poidsDernier` (R2)',
    /poidsDernier\(/.test(RW), '');
  const WE = _corps(TR, '_wentryEcart');
  t('B-CCCLVII ③ l\'écart est une PRÉSENTATION : il n\'écrit ni l\'historique, ni le poids, ni le disque',
    WE !== '' && !/S\.weightLog|persist\(|S\.bw\s*=/.test(WE), WE === '' ? 'introuvable' : '');
};

module.exports.ecran = async function (t, b, PORT) {
  /* ⏰ HORLOGE GELÉE ET DÉPLAÇABLE : une pesée est DATÉE au jour. `window.__T` permet de passer
     au lendemain sans recharger (le cas « 85,8 à J1 puis 85,8 à J2 »). */
  const GEL = '2026-09-20T10:00:00';
  const DECOR = { ft4_bw: '86', ft4_age: '48', ft4_ht: '180', ft4_gender: 'H', ft4_ob2: '1',
                  ft4_wlog: JSON.stringify([{ date: '2026-09-19', kg: 86 }]) };
  const outiller = pg => pg.evaluate(() => {
    window.__toasts = [];
    window.toast = (m, k) => { window.__toasts.push((k || '') + ':' + m); };
    window._cloudSync = () => {}; window._cloudSyncDebounced = () => {};
    window.showConfirm = (a, b2, fn) => { if (fn) fn(); };
    window._healthGate = async () => true;
    window.__pause = ms => new Promise(r => setTimeout(r, ms));
    window.__carte = async () => {
      goScreen('progress', document.querySelector('[onclick*="progress"]')); await __pause(200);
      switchProgTab('poids', document.getElementById('ptab-poids')); await __pause(250);
    };
    window.__profil = async () => { goScreen('setup', document.getElementById('nb-setup')); await __pause(200); };
    window.__taper = (id, v) => {
      const e = document.getElementById(id); if (!e) return false;
      e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true;
    };
    window.__hbw = () => { renderHome(); const e = document.getElementById('h-bw'); return e ? e.textContent.trim() : null; };
    window.__jour = d => (S.weightLog || []).find(w => w && w.date === d) || null;
  });
  /* ⛔ LE DÉCOR NE SE POSE QU'UNE FOIS : un `addInitScript` rejoue à chaque navigation,
     rechargement compris (leçon de `mensurations.js` — une fixture qui se rejoue pendant la
     mesure mesure la fixture, pas le produit). */
  const ouvrir = async (decor) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                    timezoneId: 'Europe/Paris' });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(`(()=>{const V=Date;if(!window.__T)window.__T=new V(${JSON.stringify(GEL)}).getTime();
      window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(window.__T);}
        static now(){return window.__T;}};})();`);
    await pg.addInitScript(`(()=>{try{ if(localStorage.getItem('_decorPoids')==='1')return;
      localStorage.clear();localStorage.setItem('_decorPoids','1');
      const D=${JSON.stringify(decor)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html');
    await pg.waitForTimeout(2200);
    await outiller(pg);
    return { cx, pg, errs };
  };
  const sur = (o, k) => (o && typeof o === 'object') ? o[k] : undefined;

  console.log('\n-- B-CCCLVI. La chaîne Poids, conduite (horloge gelée, disque relu) --');

  /* ══ A. UNE SEULE RÈGLE, QUEL QUE SOIT LE CHEMIN ═══════════════════════════════════════ */
  { const { cx, pg, errs } = await ouvrir(DECOR);
    const A = await pg.evaluate(async () => {
      const VALS = ['19.99', '20', '20.01', '85.8', '299.99', '300', '300.01', '-10', '500', 'abc'];
      const res = { attendu: {}, chemins: {}, msgProfil: '' };
      VALS.forEach(v => { res.attendu[v] = _poidsValide(numFR(v)); });
      const note = (ch, v, ok) => { (res.chemins[ch] = res.chemins[ch] || {})[v] = ok; };
      try {
        for (const v of VALS) {
          const n = numFR(v);
          /* Pesée du jour (Progrès) */
          S.bw = 77.77; S.weightLog = []; await __carte();
          __taper('wentry-inp', v); saveWeightEntry();
          note('pesée du jour', v, !!__jour(today()) && S.bw === n);
          /* Profil — la personne TAPE dans le champ */
          S.bw = 77.77; S.weightLog = []; await __profil(); renderSetup(); window.__toasts = [];
          __taper('bw-inp', v); saveProfile();
          note('Profil', v, S.bw === n);
          if (v === '300.01') res.msgProfil = window.__toasts.join(' | ');
          /* Édition d'une pesée */
          S.bw = 85; S.weightLog = [{ date: '2026-09-18', kg: 85 }]; openWeighEdit('2026-09-18');
          document.getElementById('weigh-edit-kg').value = v; saveWeighEdit();
          note('édition', v, (__jour('2026-09-18') || {}).kg === n);
          /* Bilan corporel */
          S.bodyScans = []; S.weightLog = [{ date: '2026-09-19', kg: 86 }]; await openBodyScanForm(-1);
          document.getElementById('bs-weight').value = v; saveBodyScan();
          note('bilan corporel', v, (S.bodyScans || []).some(s => s.weight === n));
          /* Import balance — la vraie porte : le texte du fichier */
          S.bodyScans = []; S.weightLog = [{ date: '2026-09-19', kg: 86 }];
          _scaleCsvImportFromText('Date,Poids\n2026-09-10,"' + v + '"');
          note('import balance', v, !!__jour('2026-09-10'));
          /* Restauration cloud */
          S.bw = 77.77;
          try { _applyRestoreData({ profile: { name: 'Sonde', bw: v } }); } catch (e) {}
          note('restauration', v, S.bw === n);
        }
      } catch (e) { res.err = String(e && e.message || e); }
      return res;
    });
    t('B-CCCLVI A0 les six chemins ont tous été conduits sans exception',
      !sur(A, 'err') && Object.keys(sur(A, 'chemins') || {}).length === 6, sur(A, 'err') || '');
    ['pesée du jour', 'Profil', 'édition', 'bilan corporel', 'import balance', 'restauration'].forEach(ch => {
      const c = (sur(A, 'chemins') || {})[ch] || {};
      const ecarts = Object.keys(sur(A, 'attendu') || {}).filter(v => c[v] !== A.attendu[v])
        .map(v => v + (c[v] ? ' accepté' : ' refusé'));
      t('B-CCCLVI A · ' + ch + ' : même verdict que `_poidsValide` sur les 10 valeurs (F005)',
        Object.keys(c).length === 10 && ecarts.length === 0, ecarts.join(' · ') || 'non conduit');
    });
    t('B-CCCLVI A+ ⭐ le Profil annonce la MÊME plage que les autres écrans (20–300)',
      /20\s*[–-]\s*300/.test(sur(A, 'msgProfil') || ''), sur(A, 'msgProfil') || 'aucun message');
    t('B-CCCLVI A∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ B. UNE VALEUR INVALIDE NE CONTAMINE RIEN ══════════════════════════════════════════ */
  { const { cx, pg, errs } = await ouvrir(DECOR);
    const B = await pg.evaluate(async () => {
      const o = {};
      try {
        const tdee0 = calcTDEE();
        _applyRestoreData({ profile: { name: 'Sonde', bw: 500 } });
        o.bwApres500 = S.bw; o.tdeeInchange = calcTDEE() === tdee0;
        _applyRestoreData({ profile: { name: 'Sonde', bw: '85,9' } });
        o.bwVirgule = S.bw;
        _applyRestoreData({ profile: { name: 'Sonde', bw: 86 } });   // contrôle sain voisin
        o.bwSain = S.bw;
        /* Import : trois poids impossibles et un vrai, par le texte du fichier */
        S.bodyScans = []; S.weightLog = [{ date: '2026-09-19', kg: 86 }]; S.bw = 86; window.__toasts = [];
        _scaleCsvImportFromText('Date,Poids\n2026-09-11,500\n2026-09-12,0\n2026-09-13,-10\n2026-09-14,85.9');
        o.importDates = S.weightLog.map(w => w.date).sort();
        o.scans = S.bodyScans.map(s => s.date + '=' + s.weight);
        o.bwApresImport = S.bw; o.toastImport = window.__toasts.join(' | ');
        /* Import : une date impossible (format américain) et une date future */
        S.bodyScans = []; S.weightLog = [{ date: '2026-09-19', kg: 86 }]; S.bw = 86;
        _scaleCsvImportFromText('Date,Poids\n09/20/2026,91\n09/12/2026,90');
        o.teteApresDates = S.weightLog.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
        o.bwApresDates = S.bw;
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    t('B-CCCLVI B1 ⭐ une restauration à 500 kg ne touche ni le poids courant ni le TDEE (F003)',
      sur(B, 'bwApres500') === 86 && sur(B, 'tdeeInchange') === true, 'bw=' + sur(B, 'bwApres500') + (sur(B, 'err') ? ' ' + B.err : ''));
    t('B-CCCLVI B2 ⭐ « 85,9 » restauré vaut 85,9 — pas 85 (la virgule tronquait en silence)',
      sur(B, 'bwVirgule') === 85.9, 'bw=' + sur(B, 'bwVirgule'));
    t('B-CCCLVI B3 contrôle sain : une restauration valide est toujours appliquée',
      sur(B, 'bwSain') === 86, 'bw=' + sur(B, 'bwSain'));
    t('B-CCCLVI B4 ⭐ l\'import écarte 500, 0 et −10, garde 85,9 — journal ET bilans (F004)',
      JSON.stringify(sur(B, 'importDates')) === JSON.stringify(['2026-09-14', '2026-09-19'])
        && JSON.stringify(sur(B, 'scans')) === JSON.stringify(['2026-09-14=85.9']),
      JSON.stringify(sur(B, 'importDates')) + ' / ' + JSON.stringify(sur(B, 'scans')));
    t('B-CCCLVI B5 … et le poids courant reste la pesée la PLUS RÉCENTE (86 du 19/09)',
      sur(B, 'bwApresImport') === 86, 'bw=' + sur(B, 'bwApresImport'));
    t('B-CCCLVI B6 … et l\'écran DIT combien de lignes ont été écartées (R24)',
      /3\s+ligne/.test(sur(B, 'toastImport') || ''), sur(B, 'toastImport') || 'aucun message');
    t('B-CCCLVI B7 ⭐ une date impossible ou future ne passe plus en tête du journal',
      (sur(B, 'teteApresDates') || {}).date === '2026-09-19' && sur(B, 'bwApresDates') === 86,
      JSON.stringify(sur(B, 'teteApresDates')) + ' bw=' + sur(B, 'bwApresDates'));
    t('B-CCCLVI B∅ aucune erreur de page', errs.length === 0 && !sur(B, 'err'), errs.concat(sur(B, 'err') || []).slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ C. DEUX MESURES IDENTIQUES = DEUX ÉVÉNEMENTS ═════════════════════════════════════ */
  { const { cx, pg, errs } = await ouvrir(Object.assign({}, DECOR, { ft4_wlog: '[]' }));
    const C = await pg.evaluate(async () => {
      const o = {};
      try {
        await __carte(); __taper('wentry-inp', '85,8'); saveWeightEntry();
        window.__T += 864e5;                                   // J2
        await __carte(); __taper('wentry-inp', '85,8'); window.__toasts = []; saveWeightEntry();
        o.toastJ2 = window.__toasts.join(' | ');
        o.j1j2 = S.weightLog.map(w => w.date + '=' + w.kg).sort();
        await __carte(); __taper('wentry-inp', '85,8'); window.__toasts = []; saveWeightEntry();
        o.toastMemeJour = window.__toasts.join(' | ');
        o.memeJour = S.weightLog.map(w => w.date + '=' + w.kg).sort();
        o.bw = S.bw;
        o.disque = JSON.parse(localStorage.getItem('ft4_wlog') || '[]').map(w => w.date + '=' + w.kg).sort();
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    t('B-CCCLVI C1 ⭐⭐ 85,8 à J1 puis 85,8 à J2 = DEUX pesées distinctes, même valeur',
      JSON.stringify(sur(C, 'j1j2')) === JSON.stringify(['2026-09-20=85.8', '2026-09-21=85.8']),
      JSON.stringify(sur(C, 'j1j2')) + (sur(C, 'err') ? ' ' + C.err : ''));
    t('B-CCCLVI C2 … et la seconde est ENREGISTRÉE, pas écartée comme « rien de neuf »',
      /success/.test(sur(C, 'toastJ2') || '') && /success/.test(sur(C, 'toastMemeJour') || ''), sur(C, 'toastJ2'));
    t('B-CCCLVI C3 le même jour, la pesée du jour est remplacée (modèle actuel : une par jour)',
      JSON.stringify(sur(C, 'memeJour')) === JSON.stringify(['2026-09-20=85.8', '2026-09-21=85.8']) && sur(C, 'bw') === 85.8,
      JSON.stringify(sur(C, 'memeJour')));
    t('B-CCCLVI C4 … et c\'est bien ce qui est sur le DISQUE',
      JSON.stringify(sur(C, 'disque')) === JSON.stringify(['2026-09-20=85.8', '2026-09-21=85.8']), JSON.stringify(sur(C, 'disque')));
    t('B-CCCLVI C∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ D. LE POIDS COURANT SUIT LA MESURE, PAR TOUS LES CHEMINS ═════════════════════════ */
  { const { cx, pg, errs } = await ouvrir(DECOR);
    const D = await pg.evaluate(async () => {
      const o = {};
      try {
        const tdee0 = calcTDEE();
        await __carte(); __taper('wentry-inp', '84,2'); saveWeightEntry();
        o.d1 = { bw: S.bw, tuile: __hbw(), tdeeBouge: calcTDEE() !== tdee0 };
        /* Profil : on TAPE 84 */
        await __profil(); __taper('bw-inp', '84'); saveProfile();
        o.d2 = { bw: S.bw, jour: (__jour(today()) || {}).kg, tuile: __hbw() };
        /* Profil : on ne touche QUE la taille — ⚠️ LE LENDEMAIN, un jour SANS pesée. Trou attrapé
           par le contrôle négatif (M08 restait vert) : le jour même, une pesée « fabriquée » depuis
           le champ prérempli remplaçait celle du jour par la même valeur, donc ne se voyait pas. */
        window.__T += 864e5;
        await __profil(); const n0 = S.weightLog.length, bw0 = S.bw;
        __taper('ht-inp', '181'); saveProfile();
        o.d3 = { memeNombre: S.weightLog.length === n0, bwInchange: S.bw === bw0, taille: S.height,
                 aucunePeseeDuJour: !__jour(today()) };
        /* Édition quand la ligne la plus récente ne porte qu'un % */
        S.bw = 85; S.weightLog = [{ date: '2026-09-20', bf: 19 }, { date: '2026-09-18', kg: 85 }]; persist();
        await __carte(); openWeighEdit('2026-09-18');
        document.getElementById('weigh-edit-kg').value = '84'; saveWeighEdit();
        o.d4 = { bw: S.bw, disque: localStorage.getItem('ft4_bw') };
        /* Suppression quand il ne reste qu'une ligne à 0 kg */
        S.bw = 85; S.weightLog = [{ date: '2026-09-20', kg: 0 }, { date: '2026-09-18', kg: 85 }]; persist();
        openWeighEdit('2026-09-18'); deleteWeighEntry();
        o.d5 = { bw: S.bw, disque: localStorage.getItem('ft4_bw') };
        /* Import d'un historique PLUS ANCIEN que la dernière pesée */
        S.bw = 86; S.weightLog = [{ date: '2026-09-19', kg: 86 }]; S.bodyScans = [];
        _scaleCsvImportFromText('Date,Poids\n2026-08-01,90\n2026-08-02,91');
        o.d6 = { bw: S.bw, n: S.weightLog.length };
        /* Bilan corporel daté d'avant la dernière pesée */
        S.bw = 86; S.weightLog = [{ date: '2026-09-19', kg: 86 }]; S.bodyScans = [];
        await openBodyScanForm(-1); document.getElementById('bs-date').value = '2026-09-01';
        document.getElementById('bs-weight').value = '88'; saveBodyScan();
        o.d7 = { bw: S.bw, ancien: (__jour('2026-09-01') || {}).kg };
        /* Une ligne ANCIENNE à date impossible (laissée par un import d'avant ce correctif) n'est pas
           « la dernière pesée » : éditer une vraie pesée ne doit pas y ramener le poids courant. */
        S.bw = 86; S.weightLog = [{ date: '2026-20-09', kg: 91 }, { date: '2026-09-19', kg: 86 }, { date: '2026-09-18', kg: 85 }];
        await __carte(); openWeighEdit('2026-09-18');
        document.getElementById('weigh-edit-kg').value = '85,5'; saveWeighEdit();
        o.d8 = { bw: S.bw };
        /* Un journal dans le DÉSORDRE (la fusion entre onglets ajoute en fin de liste) : la dernière
           pesée se trouve par la DATE, jamais par la position. */
        S.bw = 86; S.weightLog = [{ date: '2026-09-15', kg: 85 }, { date: '2026-09-10', kg: 84 }, { date: '2026-09-19', kg: 86 }];
        openWeighEdit('2026-09-10'); deleteWeighEntry();
        o.d9 = { bw: S.bw };
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    const d = k => sur(D, k) || {};
    t('B-CCCLVI D1 contrôle sain : la pesée du jour devient le poids courant (calculs ET Accueil)',
      d('d1').bw === 84.2 && d('d1').tuile === '84.2' && d('d1').tdeeBouge === true, JSON.stringify(d('d1')) + (sur(D, 'err') ? ' ' + D.err : ''));
    t('B-CCCLVI D2 ⭐⭐ un poids tapé dans le Profil devient une PESÉE : calculs, Accueil et journal d\'accord (F011)',
      d('d2').bw === 84 && d('d2').jour === 84 && d('d2').tuile === '84', JSON.stringify(d('d2')));
    t('B-CCCLVI D3 ⭐ corriger sa TAILLE dans le Profil ne fabrique aucune pesée (champ poids prérempli, non touché)',
      d('d3').memeNombre === true && d('d3').bwInchange === true && d('d3').taille === 181
        && d('d3').aucunePeseeDuJour === true, JSON.stringify(d('d3')));
    t('B-CCCLVI D4 ⭐ éditer une pesée ne met plus « undefined » dans le poids courant',
      d('d4').bw === 84 && d('d4').disque === '84', JSON.stringify(d('d4')));
    t('B-CCCLVI D5 ⭐ supprimer ne met plus le poids courant à 0 (aucune pesée valide ne reste → on garde)',
      d('d5').bw === 85 && d('d5').disque === '85', JSON.stringify(d('d5')));
    t('B-CCCLVI D6 ⭐ importer un historique ANCIEN ne fait pas reculer le poids courant',
      d('d6').bw === 86 && d('d6').n === 3, JSON.stringify(d('d6')));
    t('B-CCCLVI D7 contrôle sain : un bilan daté d\'avant la dernière pesée entre dans l\'historique sans la remplacer',
      d('d7').bw === 86 && d('d7').ancien === 88, JSON.stringify(d('d7')));
    t('B-CCCLVI D8 ⭐ une ligne ancienne à date impossible ne redevient pas « la dernière pesée »',
      d('d8').bw === 86, JSON.stringify(d('d8')));
    t('B-CCCLVI D9 ⭐ la dernière pesée se trouve par la DATE, pas par la position dans le tableau',
      d('d9').bw === 86, JSON.stringify(d('d9')));
    t('B-CCCLVI D∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ E. LE FORMULAIRE PROFIL NE PRÉSENTE PAS UNE VALEUR PÉRIMÉE ═══════════════════════ */
  { const { cx, pg, errs } = await ouvrir(DECOR);
    const E = await pg.evaluate(async () => {
      const o = {};
      try {
        await __profil(); o.e1a = document.getElementById('bw-inp').value;
        await __carte(); __taper('wentry-inp', '80'); saveWeightEntry();
        await __profil(); o.e1b = document.getElementById('bw-inp').value;
        /* Un écrivain tourne PENDANT que le Profil est affiché (aucun parcours ne le fait
           aujourd'hui : c'est l'invariant qu'on fige, pas un scénario qu'on corrige). */
        _scaleCsvImportFromText('Date,Poids\n2026-09-20,78');
        o.ecran = window._curScreen; o.e2champ = document.getElementById('bw-inp').value;
        __taper('ht-inp', '182'); saveProfile();
        o.e2 = { bw: S.bw, jour: (__jour(today()) || {}).kg };
        /* La personne a déjà tapé 90 quand un écrivain passe : on ne lui vole pas sa saisie. */
        await __profil(); __taper('bw-inp', '90');
        _scaleCsvImportFromText('Date,Poids\n2026-09-20,77');
        o.e3champ = document.getElementById('bw-inp').value;
        saveProfile();
        o.e3 = { bw: S.bw, jour: (__jour(today()) || {}).kg };
        /* Après un enregistrement, le champ n'est PLUS « touché » : le prochain écrivain le remet à
           jour, et le prochain « Enregistrer » ne ré-écrit pas l'ancienne saisie. */
        _scaleCsvImportFromText('Date,Poids\n2026-09-20,76');
        o.e5champ = document.getElementById('bw-inp').value;
        __taper('ht-inp', '183'); saveProfile(); o.e5bw = S.bw;
        /* Une saisie ABANDONNÉE (on quitte l'écran sans enregistrer) ne reste pas « touchée » :
           au retour, le champ montre le poids courant et suit les écrivains. */
        __taper('bw-inp', '95'); await __carte(); await __profil();
        _scaleCsvImportFromText('Date,Poids\n2026-09-20,75');
        o.e6champ = document.getElementById('bw-inp').value;
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    t('B-CCCLVI E1 contrôle sain : revenir au Profil après une pesée affiche la nouvelle valeur',
      sur(E, 'e1a') === '86' && sur(E, 'e1b') === '80', sur(E, 'e1a') + ' → ' + sur(E, 'e1b') + (sur(E, 'err') ? ' ' + E.err : ''));
    t('B-CCCLVI E2 ⭐ un écrivain qui passe pendant que le Profil est affiché met le champ à jour',
      sur(E, 'ecran') === 'setup' && sur(E, 'e2champ') === '78', sur(E, 'ecran') + ' / champ=' + sur(E, 'e2champ'));
    t('B-CCCLVI E3 ⭐⭐ … et enregistrer le Profil ne fait plus REVENIR le poids en arrière',
      (sur(E, 'e2') || {}).bw === 78 && (sur(E, 'e2') || {}).jour === 78, JSON.stringify(sur(E, 'e2')));
    t('B-CCCLVI E4 une saisie EN COURS n\'est jamais écrasée par un rafraîchissement',
      sur(E, 'e3champ') === '90' && (sur(E, 'e3') || {}).bw === 90 && (sur(E, 'e3') || {}).jour === 90,
      sur(E, 'e3champ') + ' ' + JSON.stringify(sur(E, 'e3')));
    t('B-CCCLVI E5 après un enregistrement, le champ suit de nouveau les écrivains (76) et n\'est pas ré-écrit',
      sur(E, 'e5champ') === '76' && sur(E, 'e5bw') === 76, 'champ=' + sur(E, 'e5champ') + ' bw=' + sur(E, 'e5bw'));
    t('B-CCCLVI E6 une saisie abandonnée ne reste pas « touchée » au retour sur le Profil',
      sur(E, 'e6champ') === '75', 'champ=' + sur(E, 'e6champ'));
    t('B-CCCLVI E∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ F. APRÈS RECHARGEMENT : LE DISQUE DIT LA MÊME CHOSE ══════════════════════════════ */
  { const { cx, pg, errs } = await ouvrir(DECOR);
    await pg.evaluate(async () => {
      try {
        await __carte(); __taper('wentry-inp', '84,2'); saveWeightEntry();
        await __profil(); __taper('bw-inp', '83,6'); saveProfile();
        _applyRestoreData({ profile: { name: 'Sonde', bw: 500 } }); persist();
      } catch (e) { window.__errF = String(e && e.message || e); }
    });
    await pg.reload(); await pg.waitForTimeout(2200); await outiller(pg);
    const F = await pg.evaluate(() => ({ bw: S.bw, jour: (__jour(today()) || {}).kg, tuile: __hbw(),
                                          n: (S.weightLog || []).length }));
    t('B-CCCLVI F1 ⭐ après rechargement : poids courant, pesée du jour et Accueil disent 83,6',
      sur(F, 'bw') === 83.6 && sur(F, 'jour') === 83.6 && sur(F, 'tuile') === '83.6', JSON.stringify(F));
    t('B-CCCLVI F2 contrôle sain : l\'historique a gardé ses deux jours après rechargement',
      sur(F, 'n') === 2, JSON.stringify(F));
    t('B-CCCLVI F∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ G. LA COURBE LIT L'HISTORIQUE RÉEL — pas une deuxième source ═════════════════════ */
  { const { cx, pg, errs } = await ouvrir(Object.assign({}, DECOR, { ft4_wlog: JSON.stringify([
      { date: '2026-09-15', kg: 86.4 }, { date: '2026-09-17', kg: 86.1 }, { date: '2026-09-19', kg: 86 }]) }));
    const G = await pg.evaluate(async () => {
      const pts = () => Array.from(document.querySelectorAll('#weight-chart-box circle[onclick*="openWeighEdit"]'))
        .map(c => (c.getAttribute('onclick').match(/'([\d-]+)'/) || [])[1]).sort();
      const o = {};
      try {
        await __carte(); o.g1 = pts(); o.journal = S.weightLog.map(w => w.date).sort();
        __taper('wentry-inp', '85,7'); saveWeightEntry(); o.g2 = pts();
        /* ⚠️ LE LENDEMAIN, et SANS pesée par la carte ce jour-là : sinon le point du jour existerait
           déjà et le témoin resterait vert sur la version d'avant (vérifié en l'écrivant). */
        window.__T += 864e5;
        await __profil(); __taper('bw-inp', '85,5'); saveProfile();
        await __carte(); o.g3 = pts();
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    t('B-CCCLVI G1 contrôle sain : chaque point de la courbe est une pesée du journal',
      JSON.stringify(sur(G, 'g1')) === JSON.stringify(sur(G, 'journal')) && (sur(G, 'g1') || []).length === 3,
      JSON.stringify(sur(G, 'g1')) + (sur(G, 'err') ? ' ' + G.err : ''));
    t('B-CCCLVI G2 une nouvelle pesée apparaît sur la courbe',
      (sur(G, 'g2') || []).length === 4 && (sur(G, 'g2') || []).indexOf('2026-09-20') >= 0, JSON.stringify(sur(G, 'g2')));
    t('B-CCCLVI G3 ⭐ un poids tapé dans le Profil est un point de la courbe, comme les autres (F011)',
      (sur(G, 'g3') || []).length === 5 && (sur(G, 'g3') || []).indexOf('2026-09-21') >= 0, JSON.stringify(sur(G, 'g3')));
    t('B-CCCLVI G∅ aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }

  /* ══ B-CCCLVII. L'UX « DERNIÈRE MESURE » — seulement après l'intégrité (24/09/2026) ══════
     Direction de Michel : champ de nouvelle mesure VIDE, dernière mesure affichée à côté,
     écart en présentation. ⛔ Ni pré-remplissage, ni deuxième historique, ni nouvelle courbe,
     ni dédoublonnage de deux mesures identiques. */
  console.log('\n-- B-CCCLVII. L\'UX « Dernière mesure » (conduit) --');
  { const { cx, pg, errs } = await ouvrir(Object.assign({}, DECOR, { ft4_wlog: JSON.stringify([
      { date: '2026-09-18', kg: 86.4 }, { date: '2026-09-19', kg: 86 }]) }));
    const U = await pg.evaluate(async () => {
      const o = {};
      const lire = () => ({ champ: (document.getElementById('wentry-inp') || {}).value,
        ph: (document.getElementById('wentry-inp') || {}).placeholder,
        dern: ((document.getElementById('wentry-derniere') || {}).textContent || '').trim(),
        ecart: ((document.getElementById('wentry-ecart') || {}).textContent || '').trim() });
      try {
        await __carte(); o.u1 = lire();
        /* ✓ sur le champ vide : rien n'est créé */
        const n0 = S.weightLog.length; window.__toasts = []; saveWeightEntry();
        o.u2 = { n: S.weightLog.length === n0, toast: window.__toasts.join(' | '), jour: !!__jour(today()) };
        /* écart pendant la saisie */
        __taper('wentry-inp', '86,3'); o.plus = lire().ecart;
        __taper('wentry-inp', '86'); o.zero = lire().ecart;
        __taper('wentry-inp', '85,7'); o.moins = lire().ecart;
        __taper('wentry-inp', '8'); o.partiel = lire().ecart;
        /* après enregistrement */
        __taper('wentry-inp', '85,7'); saveWeightEntry(); o.u4 = lire();
        /* même valeur le lendemain : un NOUVEL événement, écart 0,0 */
        window.__T += 864e5; await __carte(); __taper('wentry-inp', '85,7'); o.u5ecart = lire().ecart;
        saveWeightEntry(); o.u5 = lire(); o.u5n = S.weightLog.length;
        /* l'écart n'est écrit nulle part : chaque ligne ne porte que ses champs de mesure */
        o.u6 = S.weightLog.every(w => Object.keys(w).every(k => ['date', 'kg', 'bf', 'bfSrc'].indexOf(k) >= 0));
        /* une ligne sans poids utilisable n'est pas « la dernière mesure » */
        /* ⚠️ À une date PLUS RÉCENTE que la vraie dernière pesée : au même jour, la pesée valide
           masquerait le défaut et le témoin resterait vert sur un préremplissage naïf. */
        S.weightLog.unshift({ date: '2026-09-22', kg: 0 }); S.weightLog.sort((a, b) => b.date.localeCompare(a.date));
        window.__T += 864e5; await __carte(); o.u7 = lire().dern;
      } catch (e) { o.err = String(e && e.message || e); }
      return o;
    });
    const u = k => sur(U, k) || {};
    t('B-CCCLVII U1 ⭐⭐ le champ de nouvelle mesure est VIDE, même avec des pesées enregistrées',
      u('u1').champ === '' && !/\d/.test(u('u1').ph || ''), JSON.stringify(u('u1')) + (sur(U, 'err') ? ' ' + U.err : ''));
    t('B-CCCLVII U2 ⭐ la dernière mesure est affichée à côté, avec sa date',
      u('u1').dern === 'Dernière mesure : 86,0 kg — 19/09/2026', u('u1').dern);
    t('B-CCCLVII U3 et l\'écart avec la précédente, en présentation',
      u('u1').ecart === 'Écart : −0,4 kg', u('u1').ecart);
    t('B-CCCLVII U4 ⭐ ✓ sur le champ vide ne FABRIQUE aucune pesée (il en fabriquait une depuis le préremplissage)',
      u('u2').n === true && u('u2').jour === false && /info:Entre ton poids/.test(u('u2').toast || ''), JSON.stringify(u('u2')));
    t('B-CCCLVII U5 l\'écart suit la saisie : +0,3 · 0,0 · −0,3',
      sur(U, 'plus') === 'Écart : +0,3 kg' && sur(U, 'zero') === 'Écart : 0,0 kg' && sur(U, 'moins') === 'Écart : −0,3 kg',
      [sur(U, 'plus'), sur(U, 'zero'), sur(U, 'moins')].join(' / '));
    t('B-CCCLVII U6 une saisie partielle (« 8 ») n\'affiche pas un écart absurde',
      sur(U, 'partiel') === 'Écart : −0,4 kg', sur(U, 'partiel'));
    t('B-CCCLVII U7 ⭐ après enregistrement : champ vidé, dernière mesure et écart à jour',
      u('u4').champ === '' && u('u4').dern === 'Dernière mesure : 85,7 kg — 20/09/2026' && u('u4').ecart === 'Écart : −0,3 kg',
      JSON.stringify(u('u4')));
    t('B-CCCLVII U8 ⭐⭐ la même valeur le lendemain est une NOUVELLE pesée — écart 0,0, pas « rien à enregistrer »',
      sur(U, 'u5ecart') === 'Écart : 0,0 kg' && sur(U, 'u5n') === 4 && u('u5').dern === 'Dernière mesure : 85,7 kg — 21/09/2026'
        && u('u5').ecart === 'Écart : 0,0 kg', sur(U, 'u5ecart') + ' n=' + sur(U, 'u5n') + ' ' + JSON.stringify(u('u5')));
    t('B-CCCLVII U9 l\'écart n\'est écrit nulle part — aucune nouvelle donnée canonique',
      sur(U, 'u6') === true, '');
    t('B-CCCLVII U10 une ligne à 0 kg n\'est pas « la dernière mesure »',
      sur(U, 'u7') === 'Dernière mesure : 85,7 kg — 21/09/2026', sur(U, 'u7'));
    t('B-CCCLVII U∅ aucune erreur de page', errs.length === 0 && !sur(U, 'err'), errs.concat(sur(U, 'err') || []).slice(0, 2).join(' | '));
    await cx.close(); }
  { const { cx, pg, errs } = await ouvrir(Object.assign({}, DECOR, { ft4_wlog: '[]' }));
    const V = await pg.evaluate(async () => { await __carte();
      return { champ: document.getElementById('wentry-inp').value,
               dern: (document.getElementById('wentry-derniere') || {}).textContent,
               ecart: (document.getElementById('wentry-ecart') || {}).textContent }; });
    t('B-CCCLVII U11 aucun historique : le champ est vide et l\'écran le DIT (pas de chiffre inventé)',
      sur(V, 'champ') === '' && sur(V, 'dern') === 'Pas encore de pesée' && sur(V, 'ecart') === '', JSON.stringify(V));
    t('B-CCCLVII U∅² aucune erreur de page', errs.length === 0, errs.slice(0, 2).join(' | '));
    await cx.close(); }
};
