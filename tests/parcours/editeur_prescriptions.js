/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ✏️ ÉDITEUR DE PROGRAMME — CONSULTER ET MODIFIER RÉELLEMENT LES PRESCRIPTIONS (blocs B-EDP-*)
   Claude N°2 (Séance, lot C de la mission « import PDF » du 15/11/2026) · GO de Michel (mission du 15/11).
   La demande, mot pour mot : « L'éditeur doit permettre de consulter et modifier réellement les prescriptions : numéro de série · type
   É/N et autres types existants · charge · répétitions · option Max existante · temps de repos · commentaires complets. Préserver les
   supersets, dropsets et toutes les fonctionnalités existantes. Optimiser la présentation pour iPhone. Éviter de surcharger inutilement
   l'écran. Les commentaires doivent être entièrement consultables et éditables sans troncature. »
   Chaîne conduite : un programme FICTIF (forme d'un import : échauffements ÉÉÉÉÉ dont le 1ᵉʳ « à vide », travail NNN en charges décimales,
   superset, dropset, séries « max » / « Non renseigné », cardio, date de début, commentaire de 900 caractères) → `editProg` (l'éditeur
   ouvert dans l'app servie, 390 × 844) → gestes de la personne (touche · saisie · bascule) → « 💾 Enregistrer » → `S.programmes`.
   OBSERVÉ : ce que l'écran AFFICHE (champ par champ, hauteur, largeur, alignement), ce que l'enregistrement ÉCRIT (objet complet,
   comparé clé par clé : rien d'autre ne change), et ce que la séance chargée en lit.
   ⛔ 0 appel réel (Worker, Apps Script, Anthropic, Supabase interceptés), aucune donnée réelle : tous les noms, charges et commentaires
   ci-dessous sont INVENTÉS (mêmes FORMES qu'un vrai document, autres valeurs).
   NE COUVRE PAS : Safari iOS (Chromium 390 × 844 ≠ iPhone : le zoom automatique à la mise au point d'un champ < 16 px, le clavier
   décimal et la barre de défilement tactile ne s'y observent pas — on vérifie seulement la TAILLE de police et de cible).
   Banc : tools/banc_editeur_prescriptions.js · contrôle négatif : tools/mut_editeur_prescriptions.py
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const BASE_LS = { ft4_ob2: '1', ft4_name: 'Testeur', ft4_premium: 'true', ft4_guide_shown: '1', ft4_wn_seen: '999', ft4_rest: '130' };

/* Un commentaire FICTIF de 900 caractères exactement, avec ce qu'un vrai commentaire de coach contient : accents, « | », guillemets français,
   « & », et du balisage (`<b>`) qui doit ressortir À L'IDENTIQUE du champ (aller-retour de l'échappement HTML). Sans espace final. */
const COM = 'Consigne fictive | descente contrôlée 3 s, pause d\'une seconde en bas | poussée explosive & omoplates serrées | « pieds ancrés » <b>sans cambrer</b> | RIR 2 ; ';
const COM900 = COM.repeat(10).slice(0, 899) + '.';

/* Le programme importé FICTIF — une FONCTION (chaque cas repart d'un objet neuf, rien ne se partage entre deux essais). */
function PROG() {
  const S = (kg, reps, type, rest, extra) => Object.assign({ kg, reps, type, rest }, extra || {});
  return {
    id: 'pEDP1', name: 'Programme fictif EDP', weeks: 6, startDate: '2026-09-07', prescrit: true,
    days: [
      { label: 'Séance A — haut du corps (fictif)', cardioAvant: { type: 'velo', intensity: 'leger', duration: 10 }, exs: [
        { name: 'Développé Couché', note: COM900, sets: [
          S(0, 12, 'É', 60, { vide: true, restTxt: '45-90 s' }),
          S(40, 6, 'É', 60, { restTxt: '45-90 s' }),
          S(55, 4, 'É', 90), S(67.5, 2, 'É', 120), S(77.5, 1, 'É', 150),
          S(87.5, 3, 'N', 240, { restTxt: '4-5 min' }), S(82.5, 4, 'N', 240, { restTxt: '4-5 min' }), S(82.5, 4, 'N', 240, { restTxt: '4-5 min' })] },
        { name: 'Développé Incliné Haltères', note: 'RIR 2. Amplitude confortable.', sets: [S(48, 8, 'N', 150), S(48, 8, 'N', 150), S(48, 8, 'N', 150)] },
        { name: 'Curl Biceps', note: '', group: 'sgEDP', groupType: 'super', sets: [S(24, 12, 'N', 0), S(24, 12, 'N', 0), S(24, 12, 'N', 0)] },
        { name: 'Extension Triceps Poulie', note: '', group: 'sgEDP', groupType: 'super', sets: [S(32.5, 12, 'N', 90), S(32.5, 12, 'N', 90), S(32.5, 12, 'N', 90)] },
        { name: 'Élévations Latérales', note: 'Dropset fictif', dropChaine: true, sets: [S(12, 12, 'D', 0), S(9, 10, 'D', 0), S(6, 8, 'D', 90)] },
        { name: 'Tractions', note: '', sets: [S(0, 0, 'N', 120, { maxi: true }), S(0, null, 'N', 120)] }] },
      { label: 'Séance B — bas du corps (fictif)', cardio: { type: 'tapis', intensity: 'modere', duration: 12 }, exs: [
        { name: 'Squat à la Barre', note: 'Barres d\'activation, aucune fatigue.', sets: [S(20, 8, 'É', 60), S(45, 5, 'É', 90), S(70, 3, 'N', 180), S(72.5, 3, 'N', 180), S(72.5, 3, 'N', 180)] },
        { name: 'Soulevé de Terre Roumain Barre', note: '', sets: [S(62.5, 8, 'N', 150), S(62.5, 8, 'N', 150), S(62.5, 8, 'N', 150)] },
        { name: 'Leg Curl Assis Machine', note: 'Charge adaptée', sets: [S(0, 10, 'N', 0, { restTxt: 'selon ressenti' }), S(0, 10, 'N', 0), S(0, 10, 'N', 0)] }] }]
  };
}
/* Un programme ANCIEN, tel que les versions d'avant l'écrivaient : un seul jour (exercices à plat), séries SANS `type`, sans `rest`, sans `vide`,
   sans `restTxt`, sans `dropChaine`, sans `prescrit` — l'éditeur ne doit pas lui « apprendre » un seul champ en l'ouvrant. */
function ANCIEN() {
  return {
    id: 'pEDPancien', name: 'Ancien programme fictif', weeks: 4, startDate: '2026-08-03',
    exs: [
      { name: 'Développé Couché', note: 'Dos calé, cran 4', sets: [{ kg: 60, reps: 10 }, { kg: 60, reps: 10 }, { kg: 62.5, reps: 8 }] },
      { name: 'Curl Biceps', sets: [{ kg: 0, reps: 0 }, { kg: 14, reps: 12, type: 'N', rest: 90 }] },
      { name: 'Tractions', note: '', sets: [{ kg: 0, reps: 0, maxi: true, type: 'N', rest: 90 }] }]
  };
}

const sortKeys = x => Array.isArray(x) ? x.map(sortKeys) : (x && typeof x === 'object') ? Object.keys(x).sort().reduce((r, k) => { r[k] = sortKeys(x[k]); return r; }, {}) : x;
const canon = x => JSON.stringify(sortKeys(x));
const clone = x => JSON.parse(JSON.stringify(x));
const js = x => String(JSON.stringify(x)).slice(0, 700);          // `undefined` s'écrit « undefined » (un champ absent d'un côté) au lieu de faire planter le compte rendu

module.exports.PROG = PROG;
module.exports.ANCIEN = ANCIEN;
module.exports.COM900 = COM900;

/* ── FORME (source, sans navigateur) : ce que le style doit porter et que le DOM ne laisse pas mesurer ── */
module.exports.pur = function (t, ROOT, fs, path) {
  console.log('\n─── B-EDP-F · FORME (lecture du style) ───');
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  /* Les flèches d'un champ numérique prennent la place du texte : en capturant l'éditeur à 375 px, « 240 » se lisait « 2… ». Le navigateur ne dit pas combien de place elles prennent
     (la largeur lue sur le champ ne bouge pas) : on ne peut donc pas MESURER la troncature — on vérifie que la règle qui les retire est là. C'est un témoin d'IMPLÉMENTATION, assumé comme tel. */
  t('EDP-F01 ⛔ les champs numériques de l\'éditeur (`.pe-in[type=number]`) n\'affichent pas de flèches : elles prenaient la place du texte (« 240 » lu « 2… » à 375 px, mesuré sur capture)',
    /\.pe-in\[type=number\]\s*\{[^}]*appearance\s*:\s*textfield/.test(css) && /\.pe-in\[type=number\]::-webkit-inner-spin-button[^{]*\{[^}]*-webkit-appearance\s*:\s*none/.test(css), '');
};

/* ── ÉCRAN : l'éditeur conduit dans l'app servie ── */
module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-EDP. ÉDITEUR DE PROGRAMME — consulter et modifier réellement les prescriptions (l\'app conduite) ═══');
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
  let reels = 0;
  await cx.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
  await cx.route(/workers\.dev|script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }));
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
  pg.setDefaultTimeout(6000);                          // un champ ABSENT (code d'avant, mutation) échoue vite : un rouge nommé, pas 30 s d'attente
  await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_edp'))return; sessionStorage.setItem('_edp','1'); localStorage.clear();
    const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(2500);

  /** Une section qui plante (champ absent sur le code d'AVANT, par exemple) devient un ROUGE nommé — jamais un arrêt du banc. Elle annonce son bloc `B-EDP-<nom>`. */
  const section = async (nom, titre, fn) => { console.log('\n─── B-EDP-' + nom + ' · ' + titre + ' ───'); try { await fn(); } catch (e) { t('EDP-' + nom + ' ⛔ la section n\'a pas pu aller au bout', false, String(e && e.message || e).slice(0, 300)); } };
  const ouvrir = (prog) => pg.evaluate(p => {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    S.programmes = [p]; S.sessions = []; S.wkt = null; S.exRestPref = {}; S.defRest = 130; persist();
    window.__toasts = []; if (!window.__espionToast) { window.__espionToast = true; const o = window.toast; window.toast = function (m, ty) { window.__toasts.push(String(m)); return o.apply(this, arguments); }; }
    editProg(0);
  }, prog);
  const lire = () => pg.evaluate(() => JSON.parse(JSON.stringify(S.programmes[0])));
  const enregistrer = () => pg.evaluate(() => { const bt = [...document.querySelectorAll('#ov-prog-edit button')].find(x => /Enregistrer/.test(x.textContent)); bt.click(); });
  const toasts = () => pg.evaluate(() => (window.__toasts || []).slice());
  const raz = () => pg.evaluate(() => { window.__toasts = []; });
  const ROW = (di, ei, si) => `.prog-ex-card[data-di="${di}"][data-ei="${ei}"] .pe-row[data-si="${si}"]`;
  const CH = (di, ei, si, ch) => `${ROW(di, ei, si)} [data-ch="${ch}"]`;
  const present = async sel => (await pg.locator(sel).count()) > 0;
  /** Lit une ligne de série telle que l'ÉCRAN la montre (valeur, indice, état, taille de chaque champ). */
  const ligne = (di, ei, si) => pg.evaluate(([di, ei, si]) => {
    const card = document.querySelector(`.prog-ex-card[data-di="${di}"][data-ei="${ei}"]`);
    const row = card && card.querySelector(`.pe-row[data-si="${si}"]`);
    if (!row) return null;
    const o = {};
    ['num', 'type', 'kg', 'vide', 'reps', 'max', 'rest', 'supprimer'].forEach(n => {
      const e = row.querySelector(`[data-ch="${n}"]`);
      if (!e) { o[n] = null; return; }
      const r = e.getBoundingClientRect();
      o[n] = { v: (e.tagName === 'INPUT') ? e.value : e.textContent.trim(), ph: e.placeholder || '', pressed: e.getAttribute('aria-pressed'), h: Math.round(r.height * 10) / 10, w: Math.round(r.width * 10) / 10, fs: parseFloat(getComputedStyle(e).fontSize), left: Math.round(r.left * 10) / 10, top: Math.round(r.top * 10) / 10 };
    });
    return o;
  }, [di, ei, si]);
  /** Saisit `v` dans un champ de l'éditeur par les VRAIS gestes (sélection, frappe, sortie du champ = l'événement `change`). */
  const saisir = async (sel, v) => { const l = pg.locator(sel); await l.fill(v); await l.blur(); };
  const toucher = async sel => { await pg.locator(sel).scrollIntoViewIfNeeded(); await pg.locator(sel).click(); };
  const SETS = (prog) => { const out = []; (prog.days || [{ exs: prog.exs }]).forEach((d, di) => (d.exs || []).forEach((e, ei) => (e.sets || []).forEach((s, si) => out.push({ di, ei, si, s, e })))); return out; };

  const fx = PROG();
  t('EDP-A00 ⛔ CONTRÔLE DU JEU DE TEST — le commentaire fictif fait 900 caractères, finit sans espace, et ne contient aucune donnée réelle', COM900.length === 900 && !/\s$/.test(COM900), 'longueur=' + COM900.length);

  // ═══ A. CONSULTER — ce que l'écran montre de chaque série ═══
  await section('A', 'CONSULTER — ce que l\'écran montre de chaque série', async () => {
    await ouvrir(fx);
    const lignes = await pg.evaluate(() => document.querySelectorAll('#prog-edit-content .pe-row').length);
    const attendu = SETS(fx).length;
    t('EDP-A01 ⭐⭐ chaque série du programme a SA LIGNE dans l\'éditeur (' + attendu + ' séries, 2 jours)', lignes === attendu, 'lignes=' + lignes + ' attendu=' + attendu);
    const manques = [];
    for (const { di, ei, si } of SETS(fx)) {
      const l = await ligne(di, ei, si);
      if (!l) { manques.push(di + '.' + ei + '.' + si + ' (ligne absente)'); continue; }
      const sans = ['num', 'type', 'kg', 'reps', 'rest'].filter(k => !l[k]);
      if (sans.length) manques.push(di + '.' + ei + '.' + si + ' sans ' + sans.join('+'));
    }
    t('EDP-A02 ⭐⭐ DÉFAUT MESURÉ — chaque ligne porte ses 5 champs : n° · TYPE · CHARGE · reps · repos (avant : ni type ni charge, alors que les données les contiennent)', manques.length === 0, manques.slice(0, 6).join(' | ') + (manques.length > 6 ? ' … (' + manques.length + ' lignes)' : ''));

    // les valeurs AFFICHÉES sont exactement les valeurs ENREGISTRÉES
    const ecarts = []; let comparees = 0;
    for (const { di, ei, si, s } of SETS(fx)) {
      const l = await ligne(di, ei, si); if (!l) continue;
      comparees++;
      const att = {
        num: String(si + 1), type: s.type || 'N', kg: s.kg > 0 ? String(s.kg) : '',
        reps: s.maxi ? 'maxi' : (s.reps ? String(s.reps) : ''), rest: s.rest ? String(s.rest) : ''
      };
      const lu = { num: l.num && l.num.v, type: l.type && l.type.v, kg: l.kg && l.kg.v, reps: l.reps && l.reps.v, rest: l.rest && l.rest.v };
      Object.keys(att).forEach(k => { if (lu[k] !== att[k]) ecarts.push(di + '.' + ei + '.' + si + ' ' + k + ' lu=' + js(lu[k]) + ' attendu=' + js(att[k])); });
    }
    t('EDP-A03 ⭐⭐ les valeurs AFFICHÉES sont les valeurs ENREGISTRÉES, champ par champ (n°, type, charge, reps ou « maxi », repos) sur les ' + attendu + ' séries', comparees === attendu && ecarts.length === 0, 'lignes comparées=' + comparees + '/' + attendu + ' ' + ecarts.slice(0, 5).join(' | '));

    // « à vide » (écrit par le document) ≠ « charge non renseignée »
    const vide = await ligne(0, 0, 0), nonRens = await ligne(0, 5, 0), nr2 = await ligne(1, 2, 0), chiffre = await ligne(0, 0, 1);
    t('EDP-A04 ⭐⭐ « à vide » (barre à vide, écrit par le document) s\'affiche DISTINCTEMENT : indice « à vide » et bascule enfoncée — une charge NON renseignée n\'a ni l\'un ni l\'autre',
      !!(vide && vide.kg && vide.vide) && /à vide/.test(vide.kg.ph) && vide.kg.v === '' && vide.vide.pressed === 'true'
      && !!(nonRens && nonRens.kg && nonRens.vide) && !/à vide/.test(nonRens.kg.ph) && nonRens.kg.v === '' && nonRens.vide.pressed === 'false'
      && !!(nr2 && nr2.kg && nr2.vide) && !/à vide/.test(nr2.kg.ph) && nr2.vide.pressed === 'false'
      && !!(chiffre && chiffre.vide) && chiffre.vide.pressed === 'false',
      js({ vide: vide && vide.kg && [vide.kg.v, vide.kg.ph, vide.vide && vide.vide.pressed], nonRens: nonRens && nonRens.kg && [nonRens.kg.v, nonRens.kg.ph, nonRens.vide && nonRens.vide.pressed] }));
    t('EDP-A05 une charge NON renseignée est un champ VIDE avec un indice discret (jamais « 0 », jamais « à vide »)',
      !!(nonRens && nonRens.kg) && nonRens.kg.v === '' && nonRens.kg.ph !== '' && !/0/.test(nonRens.kg.ph), js(nonRens && nonRens.kg));

    // la consigne de repos ÉCRITE dans le document reste lisible (existant, ft-v1266) : on ne le perd pas en refaisant les lignes
    const txt = await pg.evaluate(() => document.getElementById('prog-edit-content').innerText);
    t('EDP-A06 ⛔ NON-RÉGRESSION — la consigne de repos écrite (« 45-90 s », « 4-5 min ») reste LISIBLE sous les séries concernées',
      /repos écrit dans le document : « 45-90 s » \(séries 1 à 2\)/.test(txt) && /repos écrit dans le document : « 4-5 min » \(séries 6 à 8\)/.test(txt), (txt.match(/repos écrit[^\n]*/g) || []).join(' | '));
    t('EDP-A07 ⛔ NON-RÉGRESSION — le champ « Non renseigné » des répétitions (« ? ») et la série « maxi » s\'affichent toujours',
      await pg.evaluate(() => { const c = document.querySelector('.prog-ex-card[data-di="0"][data-ei="5"]'); return !!c && /maxi/.test(c.innerText) && !!c.querySelector('input.reps-nr') && /Non renseigné/.test(c.innerText); }), '');
  });

  // ═══ C. LE COMMENTAIRE — ENTIER, DÈS L'OUVERTURE ═══
  await section('C', 'COMMENTAIRES — entiers dès l\'ouverture, jamais coupés en silence', async () => {
    await ouvrir(fx);
    const m = await pg.evaluate(() => { const ta = document.getElementById('prog-note-0-0'); if (!ta) return null; const r = ta.getBoundingClientRect(); return { n: ta.value.length, ch: ta.clientHeight, sh: ta.scrollHeight, h: Math.round(r.height), egal: ta.value === (S.programmes[0].days[0].exs[0].note) }; });
    t('EDP-C01 ⭐⭐ DÉFAUT MESURÉ — à l\'OUVERTURE de l\'éditeur, le commentaire de 900 caractères est lu EN ENTIER : le champ est aussi haut que son texte (avant : 24 px mesurés au lieu de 42-58 px, la hauteur réglée pendant que la fenêtre était encore cachée)',
      !!m && m.n === 900 && m.ch >= m.sh && m.h > 100, js(m));
    t('EDP-C02 le texte du champ est EXACTEMENT le commentaire enregistré (« & », « <b> », guillemets, « | » : aller-retour de l\'échappement)', !!m && m.egal, js(m));
    // au rendu suivant (une bascule re-dessine l'éditeur), toujours entier
    await pg.evaluate(() => _renderProgEdit());
    const m2 = await pg.evaluate(() => { const ta = document.getElementById('prog-note-0-0'); return { ch: ta.clientHeight, sh: ta.scrollHeight }; });
    t('EDP-C03 après un nouveau rendu de l\'éditeur (touche une bascule, ajout d\'une série…), le commentaire reste entier', m2.ch >= m2.sh, js(m2));
    // fermé puis rouvert : entier aussi (le 2ᵉ chemin d'ouverture)
    await pg.evaluate(() => { closeProgEdit(); editProg(0); });
    const m3 = await pg.evaluate(() => { const ta = document.getElementById('prog-note-0-0'); return { ch: ta.clientHeight, sh: ta.scrollHeight }; });
    t('EDP-C04 fermé puis rouvert, le commentaire est entier dès l\'ouverture (même chemin, deuxième fois)', m3.ch >= m3.sh && m3.sh > 100, js(m3));
    // tous les commentaires de l'éditeur sont entiers, pas seulement le long
    const tous = await pg.evaluate(() => [...document.querySelectorAll('#prog-edit-content textarea[id^="prog-note-"]')].map(ta => [ta.id, ta.clientHeight >= ta.scrollHeight]).filter(x => !x[1]).map(x => x[0]));
    t('EDP-C05 AUCUN champ commentaire n\'est coupé (hauteur ≥ contenu pour tous les exercices)', tous.length === 0, tous.join(','));
    // un commentaire court reste COMPACT (une ligne) — l'écran n'est pas alourdi
    const court = await pg.evaluate(() => Math.round(document.getElementById('prog-note-0-1').getBoundingClientRect().height));
    t('EDP-C06 un commentaire court reste sur UNE ligne (le champ grandit avec son contenu, il ne prend pas de place d\'avance)', court <= 34, 'hauteur=' + court);
    // le texte de 900 caractères est reçu tel quel par un « Enregistrer » sans rien toucher
    await enregistrer();
    const sauv = await lire();
    t('EDP-C07 « Enregistrer » sans rien toucher rend le commentaire de 900 caractères IDENTIQUE (aucune coupure, aucun espace retiré)', sauv.days[0].exs[0].note === COM900, 'longueur=' + (sauv.days[0].exs[0].note || '').length);

    // éditer : ajouter à la fin du long, par de vraies frappes
    await ouvrir(fx);
    const ta = pg.locator('#prog-note-0-0');
    await ta.focus(); await pg.keyboard.press('Control+End'); await pg.keyboard.type(' +ajout');
    const apres = await pg.evaluate(() => ({ stocke: _progEditEx(0, 0).note, ecran: document.getElementById('prog-note-0-0').value, ch: document.getElementById('prog-note-0-0').clientHeight, sh: document.getElementById('prog-note-0-0').scrollHeight }));
    t('EDP-C08 on peut COMPLÉTER le commentaire long par de vraies frappes : le texte stocké est l\'ancien + l\'ajout, identique à l\'écran', apres.stocke === COM900 + ' +ajout' && apres.ecran === apres.stocke && apres.ch >= apres.sh, js({ n: (apres.stocke || '').length, ecran: (apres.ecran || '').length }));
    await enregistrer();
    t('EDP-C09 … et « Enregistrer » le garde en entier', (await lire()).days[0].exs[0].note === COM900 + ' +ajout', '');

    // ⭐ LE DÉFAUT DE TRONCATURE : un commentaire TAPÉ de plusieurs centaines de caractères
    await ouvrir(fx);
    const long450 = ('Pause en bas, remontée vive, souffle bloqué, regard fixe. ').repeat(8).slice(0, 449) + '.';
    await pg.locator('#prog-note-0-1').fill(long450);
    const tape = await pg.evaluate(() => ({ stocke: _progEditEx(0, 1).note, ecran: document.getElementById('prog-note-0-1').value }));
    t('EDP-C10 ⭐⭐ DÉFAUT MESURÉ — un commentaire TAPÉ de 450 caractères est gardé EN ENTIER (avant : coupé à 300, en silence)', tape.stocke === long450 && tape.ecran === long450, 'stocké=' + (tape.stocke || '').length + ' écran=' + (tape.ecran || '').length);
    await enregistrer();
    t('EDP-C11 … et il ressort identique de « Enregistrer »', (await lire()).days[0].exs[0 + 1].note === long450, '');

    // effacer un commentaire le retire (existant) ; des espaces seuls aussi
    await ouvrir(fx);
    await pg.locator('#prog-note-0-1').fill('');
    const vide1 = await pg.evaluate(() => _progEditEx(0, 1).note);
    await pg.locator('#prog-note-0-1').fill('   ');
    const vide2 = await pg.evaluate(() => _progEditEx(0, 1).note);
    t('EDP-C12 ⛔ NON-RÉGRESSION — un commentaire effacé (ou fait d\'espaces) est RETIRÉ du programme, pas gardé vide', vide1 === undefined && vide2 === undefined, js({ vide1, vide2 }));

    // un PLAFOND très large, documenté : ce que l'écran montre est exactement ce qui est gardé
    await ouvrir(fx);
    const enorme = 'x'.repeat(4500);                          // 4 500 caractères d'un seul tenant (aucun espace : le plafond tombe en plein texte)
    await raz();
    await pg.locator('#prog-note-0-1').fill(enorme);
    const pl = await pg.evaluate(() => ({ stocke: (_progEditEx(0, 1).note || '').length, ecran: document.getElementById('prog-note-0-1').value.length, dit: (window.__toasts || []).filter(m => /limité à 4000 caractères/.test(m)).length }));
    t('EDP-C13 ⭐ au-delà du plafond de sûreté (4 000 caractères), ce que l\'écran montre est EXACTEMENT ce qui est gardé (rien de plus affiché que conservé) ET le message le DIT — jamais une coupure en silence', pl.stocke === pl.ecran && pl.stocke === 4000 && pl.dit >= 1, js(pl));
    // un texte DÉJÀ plus long que le plafond n'est jamais coupé par une simple retouche
    const geant = 'g'.repeat(4600);
    const garde = await pg.evaluate(g => { _progEditEx(0, 1).note = g; _setProgExNote(0, 1, g.slice(0, -5)); return (_progEditEx(0, 1).note || '').length; }, geant);
    t('EDP-C14 ⛔ un commentaire qui existait DÉJÀ plus long que le plafond n\'est pas coupé quand on le retouche (on retire 5 caractères : il en reste 4 595)', garde === 4595, 'longueur=' + garde);
    // le chemin « retour du sélecteur d'exercices » : le rendu se fait fenêtre FERMÉE, puis elle s'ouvre — le commentaire long doit être entier à l'arrivée
    await ouvrir(fx);
    await pg.evaluate(() => { document.getElementById('ov-prog-edit').classList.remove('open'); _addExToProgEdit('Tractions'); });
    const m4 = await pg.evaluate(() => { const ta = document.getElementById('prog-note-0-0'); return { ouvert: document.getElementById('ov-prog-edit').classList.contains('open'), ch: ta.clientHeight, sh: ta.scrollHeight, nbEx: _editProgData.days[0].exs.length }; });
    t('EDP-C15 ⭐ le 3ᵉ chemin d\'ouverture (retour du sélecteur d\'exercices : l\'éditeur est redessiné fenêtre fermée, puis rouvert) montre aussi le commentaire long EN ENTIER — et l\'exercice ajouté est là', m4.ouvert && m4.ch >= m4.sh && m4.sh > 100 && m4.nbEx === 7, js(m4));
    await pg.evaluate(() => closeProgEdit());
  });

  // ═══ A8. UN TEXTE DU DOCUMENT NE CASSE PAS LA LIGNE ═══
  await section('A8', 'UN TEXTE DU DOCUMENT NE CASSE PAS LA LIGNE (guillemets dans une consigne)', async () => {
    const f = PROG(); f.days[0].exs[1].sets[0].restTxt = 'libre " onfocus="window.__pwn=1" x="'; f.days[0].exs[1].sets[0].rest = 0;
    await ouvrir(f);
    const r = await pg.evaluate(() => {
      window.__pwn = 0;
      const card = document.querySelector('.prog-ex-card[data-di="0"][data-ei="1"]');
      const champs = [...card.querySelectorAll('input')];
      champs.forEach(i => { try { i.focus(); } catch (e) {} });                            // mettre un champ au point exécute un `onfocus` qui se serait glissé dans la ligne
      const repos = champs.filter(i => i.type === 'number' && i.step === '5')[0];
      return { pwn: window.__pwn, ph: repos ? repos.placeholder : null };
    });
    t('EDP-A08 ⛔ une consigne de repos écrite avec des GUILLEMETS (texte lu dans un document, jamais de confiance) s\'affiche telle quelle dans le champ et n\'ajoute AUCUN attribut à la ligne (avant : elle cassait l\'attribut `placeholder` et laissait passer un `onfocus`)',
      r.pwn === 0 && r.ph === 'libre " onfocus="window.__pwn=1" x="', js(r));
    await pg.evaluate(() => closeProgEdit());
  });

  // ═══ M. MODIFIER — chaque champ, par les vrais gestes, puis « Enregistrer » ═══
  await section('M', 'MODIFIER — chaque champ par les vrais gestes, puis « Enregistrer »', async () => {
    await ouvrir(fx);
    const avant = await lire();
    const att = clone(avant);                                   // l'attendu : exactement l'avant + les modifications faites ci-dessous, et RIEN d'autre
    const TYPE = (di, ei, si) => CH(di, ei, si, 'type');

    // TYPE : on parcourt les types existants (SET_TYPES), comme à la séance — N → É → X → N
    const seq = [];
    for (let k = 0; k < 4; k++) { await toucher(TYPE(0, 0, 5)); seq.push(((await ligne(0, 0, 5)) || {}).type && (await ligne(0, 0, 5)).type.v); }
    t('EDP-M01 ⭐⭐ le TYPE d\'une série se change d\'une touche et PARCOURT les types existants, comme à la séance : N → É → X → N → É (l\'écran, 4 touches)', js(seq) === js(['É', 'X', 'N', 'É']), js(seq));
    // la liste parcourue est LUE dans la table de la séance : on y ajoute un type d'essai, la touche le propose (une liste recopiée dans l'éditeur ne le verrait pas)
    const regle = await pg.evaluate(() => {
      const ex = _editProgData.days[0].exs[1]; const ancien = ex.sets[1].type;
      SET_TYPES.push('Z'); SET_TYPE_LABELS.Z = 'Type d\'essai';
      ex.sets[1].type = 'X'; _setProgSetType(0, 1, 1); const apresX = ex.sets[1].type;
      SET_TYPES.pop(); delete SET_TYPE_LABELS.Z; ex.sets[1].type = ancien; _renderProgEdit();
      return { table: SET_TYPES.slice().join(''), apresX, ancien };
    });
    t('EDP-M02 ⭐ la liste parcourue est la table de la séance (`SET_TYPES`), lue à chaque touche — pas une liste recopiée dans l\'éditeur (R2) : un type ajouté à la table est proposé après « X »', regle.table === 'NÉX' && regle.apresX === 'Z' && regle.ancien === 'N', js(regle));
    att.days[0].exs[0].sets[5].type = 'É';                       // l'état après 4 touches (N→É→X→N→É)
    const ed1 = await pg.evaluate(() => _progEditEx(0, 0).sets[5].type);
    t('EDP-M03 le type touché est écrit dans la copie d\'édition (avant « Enregistrer »)', ed1 === 'É', 'type=' + ed1);

    // CHARGE : virgule ou point, par la vraie saisie
    await saisir(CH(0, 0, 6, 'kg'), '92,5');
    const kg1 = await pg.evaluate(() => _progEditEx(0, 0).sets[6].kg);
    t('EDP-M04 ⭐⭐ la CHARGE se saisit avec la VIRGULE (« 92,5 » → 92,5 kg, pas 92) — la même lecture que partout dans l\'app (`numFR`)', kg1 === 92.5, 'kg=' + kg1);
    att.days[0].exs[0].sets[6].kg = 92.5;
    await saisir(CH(0, 0, 7, 'kg'), '90.25');
    t('EDP-M05 … et avec le POINT, décimales conservées (« 90.25 » → 90,25)', (await pg.evaluate(() => _progEditEx(0, 0).sets[7].kg)) === 90.25, '');
    att.days[0].exs[0].sets[7].kg = 90.25;
    const aff = (await ligne(0, 0, 6)).kg.v;
    t('EDP-M06 l\'écran redit la valeur ENREGISTRÉE après la saisie (« 92.5 », pas « 92,5 » en attente d\'une conversion)', aff === '92.5', 'champ=' + aff);

    // CHARGE INVALIDE : jamais « corrigée » en silence — refusée, DITE, et le champ redit la valeur enregistrée
    const refus = [];
    for (const mauvais of ['-5', 'abc', '600', '12abc', '9e9']) {
      await raz();
      await saisir(CH(0, 1, 0, 'kg'), mauvais);
      const r = await pg.evaluate(() => ({ kg: _progEditEx(0, 1).sets[0].kg, vide: _progEditEx(0, 1).sets[0].vide, champ: document.querySelector('.prog-ex-card[data-di="0"][data-ei="1"] .pe-row[data-si="0"] [data-ch="kg"]').value, toast: (window.__toasts || []).length }));
      if (!(r.kg === 48 && r.vide === undefined && r.champ === '48' && r.toast >= 1)) refus.push(mauvais + ' → ' + js(r));
    }
    t('EDP-M07 ⭐⭐ une charge INVALIDE (« -5 », « abc », « 600 », « 12abc », « 9e9 ») n\'est JAMAIS corrigée en silence : la valeur enregistrée (48) ne bouge pas, le champ la redit, et un message le dit', refus.length === 0, refus.join(' | '));

    // CHARGE EFFACÉE = non renseignée
    await saisir(CH(0, 1, 1, 'kg'), '');
    const eff = await pg.evaluate(() => { const s = _progEditEx(0, 1).sets[1]; return { kg: s.kg, vide: s.vide }; });
    /* D-164 (mission corrective du 16/11/2026) : « non renseignée » s'écrit `null` (INCONNUE), plus `0` — un zéro écrit et un inconnu ne se confondent plus. L'invariant (sans `vide`, rien d'autre ne change) reste. */
    t('EDP-M08 effacer une charge la rend « non renseignée » (INCONNUE : null, jamais un zéro inventé ; sans `vide`)', eff.kg === null && eff.vide === undefined, js(eff));
    att.days[0].exs[1].sets[1].kg = null;

    // À VIDE : la bascule
    const refVide = await (async () => { await raz(); await toucher(CH(0, 0, 4, 'vide')); return pg.evaluate(() => { const s = _progEditEx(0, 0).sets[4]; return { kg: s.kg, vide: s.vide, toast: (window.__toasts || []).length }; }); })();
    t('EDP-M09 ⛔ « à vide » sur une série qui a une CHARGE est refusé et dit (jamais d\'effacement du 77,5 kg par une touche à côté du champ) : la charge reste, `vide` ne s\'écrit pas', refVide.kg === 77.5 && refVide.vide === undefined && refVide.toast >= 1, js(refVide));
    await toucher(CH(0, 5, 1, 'vide'));
    const vOn = await pg.evaluate(() => { const s = _progEditEx(0, 5).sets[1]; return { kg: s.kg, vide: s.vide }; });
    const lOn = await ligne(0, 5, 1);
    t('EDP-M10 ⭐⭐ la bascule « vide » sur une série SANS charge écrit `vide: true` (charge 0) ; l\'écran l\'affiche (bascule enfoncée, indice « à vide »)',
      vOn.kg === 0 && vOn.vide === true && !!lOn && lOn.vide.pressed === 'true' && /à vide/.test(lOn.kg.ph), js({ vOn, ph: lOn && lOn.kg.ph }));
    att.days[0].exs[5].sets[1].vide = true;
    await toucher(CH(0, 5, 1, 'vide'));
    const vOff = await pg.evaluate(() => { const s = _progEditEx(0, 5).sets[1]; return { kg: s.kg, aVide: ('vide' in s) }; });
    t('EDP-M11 ⭐ la bascule remise SUPPRIME la clé `vide` (elle ne s\'écrit pas `false`) et la charge redevient INCONNUE (null : D-164, plus un zéro inventé)', vOff.kg === null && vOff.aVide === false, js(vOff));
    delete att.days[0].exs[5].sets[1].vide; att.days[0].exs[5].sets[1].kg = null;
    // saisir un nombre dans une série « à vide » efface `vide`
    await saisir(CH(0, 0, 0, 'kg'), '20');
    const vNb = await pg.evaluate(() => { const s = _progEditEx(0, 0).sets[0]; return { kg: s.kg, aVide: ('vide' in s) }; });
    const lNb = await ligne(0, 0, 0);
    t('EDP-M12 ⭐⭐ saisir un NOMBRE dans une série « à vide » efface `vide` (20 kg) ; l\'écran suit sans redessiner la ligne : bascule relâchée, indice « kg »',
      vNb.kg === 20 && vNb.aVide === false && lNb.vide.pressed === 'false' && !/à vide/.test(lNb.kg.ph), js({ vNb, pressed: lNb.vide.pressed, ph: lNb.kg.ph }));
    att.days[0].exs[0].sets[0].kg = 20; delete att.days[0].exs[0].sets[0].vide;

    // REPS, REPOS (existants), MAX (existant), + série, × (existants) — dans la nouvelle disposition
    await saisir(CH(0, 0, 6, 'reps'), '5');
    att.days[0].exs[0].sets[6].reps = 5; att.days[0].exs[0].sets[6].maxi = false;      // EXISTANT (`_setProgSetReps`, inchangé) : saisir un nombre annule le mode « maxi » en l'écrivant `false`
    await saisir(CH(0, 0, 6, 'rest'), '270');
    att.days[0].exs[0].sets[6].rest = 270;                       // la consigne écrite (`restTxt`) reste : on change le chiffre, pas le texte
    const rr = await pg.evaluate(() => { const s = _progEditEx(0, 0).sets[6]; return { reps: s.reps, rest: s.rest, txt: s.restTxt }; });
    t('EDP-M13 les REPS (5) et le REPOS (270 s) se modifient dans la nouvelle ligne ; la consigne écrite « 4-5 min » n\'est pas effacée', rr.reps === 5 && rr.rest === 270 && rr.txt === '4-5 min', js(rr));
    await toucher(CH(0, 1, 2, 'max'));
    const mx = await pg.evaluate(() => { const s = _progEditEx(0, 1).sets[2]; return { maxi: s.maxi, reps: s.reps }; });
    t('EDP-M14 ⛔ NON-RÉGRESSION — l\'option MAX existante bascule comme avant (maxi: true, reps 0) ; la remettre redonne « Non renseigné » (null)', mx.maxi === true && mx.reps === 0, js(mx));
    att.days[0].exs[1].sets[2].maxi = true; att.days[0].exs[1].sets[2].reps = 0;
    await toucher(CH(0, 1, 2, 'max'));
    const mx2 = await pg.evaluate(() => { const s = _progEditEx(0, 1).sets[2]; return { maxi: s.maxi, reps: s.reps }; });
    t('EDP-M14b … (retour)', mx2.maxi === false && mx2.reps === null, js(mx2));
    att.days[0].exs[1].sets[2].maxi = false; att.days[0].exs[1].sets[2].reps = null;
    const nbAvant = await pg.evaluate(() => _progEditEx(0, 1).sets.length);
    await pg.locator('.prog-ex-card[data-di="0"][data-ei="1"] button', { hasText: '+ série' }).click();
    const nbPlus = await pg.evaluate(() => _progEditEx(0, 1).sets.length);
    await toucher(CH(0, 1, 3, 'supprimer'));
    const nbMoins = await pg.evaluate(() => _progEditEx(0, 1).sets.length);
    t('EDP-M15 ⛔ NON-RÉGRESSION — « + série » ajoute une série, « × » la retire (3 → 4 → 3)', nbAvant === 3 && nbPlus === 4 && nbMoins === 3, js([nbAvant, nbPlus, nbMoins]));
    // « + série » après une DERNIÈRE série « à vide » : la nouvelle est une série normale (elle n'hérite pas de `vide`) — « + série » copie la dernière série
    const copieVide = await pg.evaluate(() => { _toggleProgSetVide(1, 2, 2); _addProgSet(1, 2); const ex = _progEditEx(1, 2); const r = { dern: ex.sets[ex.sets.length - 1], nb: ex.sets.length, vide2: ex.sets[2].vide }; ex.sets.pop(); delete ex.sets[2].vide; _renderProgEdit(); return r; });
    t('EDP-M15b « + série » copie la charge, le type et le repos de la dernière série — mais une série « à vide » ne se transmet pas par copie (la nouvelle n\'est pas « à vide »)',
      copieVide.vide2 === true && copieVide.nb === 4 && copieVide.dern.kg === 0 && copieVide.dern.type === 'N' && !('vide' in copieVide.dern), js(copieVide));

    // L'ENREGISTREMENT ÉCRIT EXACTEMENT CELA, ET RIEN D'AUTRE
    await enregistrer();
    const apres = await lire();
    const ecarts = [];
    /* D-168 (16/11/2026, décision de Michel) : une retouche de CHARGE ou de REPS pose, sur LA SÉRIE touchée seulement, l'instant de la retouche (`ed.kg` / `ed.reps`, des nombres) — c'est la seule chose que l'enregistrement
       écrit en plus. Elle est lue ICI à part (chemin → champs), puis exigée EXACTEMENT : ni sur une série non touchée, ni pour un autre champ (le type n'en pose pas ; le repos en pose depuis le 16/11 : `ed.rest`). Tout le reste reste comparé clé par clé. */
    const edPoses = {};
    const cmp = (a, b2, chemin) => { if (/\.ed$/.test(chemin) && a && typeof a === 'object' && !b2) { edPoses[chemin.replace(/^prog\.days\./, '').replace(/\.exs\./, '/').replace(/\.sets\./, '/').replace(/\.ed$/, '')] = Object.keys(a).sort().join('+') + (Object.values(a).every(v => typeof v === 'number' && v > 0) ? '' : '!'); return; }
      if (a && typeof a === 'object' && b2 && typeof b2 === 'object') { new Set(Object.keys(a).concat(Object.keys(b2))).forEach(k => cmp(a[k], b2[k], chemin + '.' + k)); } else if (canon(a) !== canon(b2)) ecarts.push(chemin + ' : ' + js(a) + ' ≠ ' + js(b2)); };
    cmp(apres, att, 'prog');
    t('EDP-M16 ⭐⭐⭐ « Enregistrer » écrit EXACTEMENT les modifications faites (type, charges, `vide`, reps, repos, max, séries) — le reste du programme (30+ autres champs, commentaires, supersets, dropset, cardio, date) est IDENTIQUE, clé par clé', ecarts.length === 0, ecarts.slice(0, 5).join(' | '));
    /* ⚠️ RÉÉCRIT LE 16/11/2026 (lot 1 « contre-expertise », D-168, sonde H09) : le REPOS retouché pose lui aussi son instant (`ed.rest`) — « ni le repos n'en pose » contredisait la décision (« y compris le repos »). L'invariant utile est gardé ENTIER : l'instant
       n'est posé que sur les séries et les champs TOUCHÉS (ici, la série 7 du 1ᵉʳ exercice a eu sa charge, ses répétitions ET son repos retouchés), jamais pour le type ni « maxi », jamais sur une autre série. */
    t('EDP-M17 ⭐⭐ D-168 — les retouches de charge / reps / repos ont posé leur instant sur les séries TOUCHÉES et sur elles seules (kg : séries 1, 7 et 8 du 1ᵉʳ exercice, série 2 du 2ᵉ, la barre « à vide » basculée du 6ᵉ exercice et du jour 2 ; reps et repos : série 7 du 1ᵉʳ) — aucune autre série, aucun autre champ : ni le type, ni « maxi » n\'en posent',
      js(edPoses) === js({ '0/0/0': 'kg', '0/0/6': 'kg+reps+rest', '0/0/7': 'kg', '0/1/1': 'kg', '0/5/1': 'kg', '1/2/2': 'kg' }), js(edPoses));
  });

  // ═══ D. TYPES ET DROPSETS / SUPERSETS — changer un type ne casse rien ═══
  await section('D', 'TYPES, DROPSETS, SUPERSETS — changer un type ne casse rien', async () => {
    await ouvrir(fx);
    const avant = await lire();
    // le dropset (3 paliers « D ») : on parcourt le type d'un palier, on revient — rien d'autre ne bouge
    const seqD = [];
    for (let k = 0; k < 4; k++) { await toucher(CH(0, 4, 1, 'type')); const l = await ligne(0, 4, 1); seqD.push(l && l.type && l.type.v); }
    t('EDP-D01 ⭐⭐ un palier de DROPSET se parcourt sans se perdre : D → N → É → X → D (on peut toujours REVENIR à « D » — le type n\'est pas à sens unique)', js(seqD) === js(['N', 'É', 'X', 'D']), js(seqD));
    const apresBoucle = await pg.evaluate(() => JSON.parse(JSON.stringify(_editProgData)));
    t('EDP-D02 ⭐⭐ après la boucle complète, l\'exercice est IDENTIQUE (types, charges, repos, `dropChaine`) : un type touché puis remis ne laisse aucune trace', canon(apresBoucle.days[0].exs[4]) === canon(avant.days[0].exs[4]), canon(apresBoucle.days[0].exs[4]).slice(0, 300));
    // un palier changé en « N » : l'enchaînement (dropChaine) et les autres paliers ne bougent pas
    await toucher(CH(0, 4, 2, 'type'));                       // D → N
    const d2 = await pg.evaluate(() => { const e = _editProgData.days[0].exs[4]; return { dc: e.dropChaine, types: e.sets.map(s => s.type).join(''), kgs: e.sets.map(s => s.kg).join(','), rests: e.sets.map(s => s.rest).join(',') }; });
    t('EDP-D03 ⭐⭐ changer le type d\'UN palier ne touche ni `dropChaine` (reste vrai), ni les types des autres paliers, ni les charges, ni les repos', d2.dc === true && d2.types === 'DDN' && d2.kgs === '12,9,6' && d2.rests === '0,0,90', js(d2));
    await toucher(CH(0, 4, 2, 'type')); await toucher(CH(0, 4, 2, 'type')); await toucher(CH(0, 4, 2, 'type'));   // N → É → X → D
    // un exercice SANS dropset ne propose pas « D » (la liste de la séance : N → É → X → N)
    const seqN = [];
    for (let k = 0; k < 4; k++) { await toucher(CH(0, 1, 0, 'type')); const l = await ligne(0, 1, 0); seqN.push(l && l.type && l.type.v); }
    t('EDP-D04 un exercice qui n\'est PAS un dropset ne propose jamais « D » : N → É → X → N → É (la liste de la séance)', js(seqN) === js(['É', 'X', 'N', 'É']), js(seqN));
    // changer un type dans un SUPERSET : le groupe est intact (les deux membres)
    await toucher(CH(0, 2, 0, 'type')); await toucher(CH(0, 3, 1, 'type'));
    const g = await pg.evaluate(() => { const ex = _editProgData.days[0].exs; return { a: [ex[2].group, ex[2].groupType], b: [ex[3].group, ex[3].groupType], ta: ex[2].sets[0].type, tb: ex[3].sets[1].type }; });
    t('EDP-D05 ⭐⭐ changer le type d\'une série d\'un SUPERSET laisse le groupe intact (même `group`, `groupType: super`, pour les deux membres)', g.a[0] === 'sgEDP' && g.b[0] === 'sgEDP' && g.a[1] === 'super' && g.b[1] === 'super' && g.ta === 'É' && g.tb === 'É', js(g));
    const lien = await pg.evaluate(() => { const c = document.querySelector('.prog-ex-card[data-di="0"][data-ei="2"]'); return /En superset ✓/.test(c.innerText) && /SUPERSET/.test(document.querySelector('.prog-ex-card[data-di="0"][data-ei="3"]').innerText); });
    t('EDP-D06 ⛔ NON-RÉGRESSION — le lien de superset s\'affiche toujours (« En superset ✓ », « SUPERSET »), et se défait comme avant', lien === true, '');
    await pg.evaluate(() => _toggleProgSuperset(0, 2));
    const defait = await pg.evaluate(() => { const ex = _editProgData.days[0].exs; return [ex[2].group, ex[3].group]; });
    t('EDP-D07 ⛔ NON-RÉGRESSION — « En superset ✓ » défait le lien (les deux `group` disparaissent)', defait[0] === undefined && defait[1] === undefined, js(defait));
    // en séance : le dropset repasse bien par l'enchaînement (type D conservé après la boucle)
    await pg.evaluate(() => { closeProgEdit(); });
    await ouvrir(fx);
    for (let k = 0; k < 4; k++) await toucher(CH(0, 4, 0, 'type'));
    await enregistrer();
    const sauvD = await lire();
    const seance = await pg.evaluate(() => { S.wkt = null; S.sessions = []; _loadProgDayVraiment(0, 0); const e = S.wkt.exs[4]; const r = { types: e.sets.map(s => s.type).join(''), dc: e.dropChaine }; S.wkt = null; return r; });
    t('EDP-D08 ⭐ le dropset édité (boucle de types faite et défaite) charge à la séance comme avant : paliers « DDD », `dropChaine` vrai', sauvD.days[0].exs[4].dropChaine === true && seance.types === 'DDD' && seance.dc === true, js(seance));
    // un type INCONNU demandé explicitement au setter est refusé, dit, et jamais écrit
    await ouvrir(fx); await raz();
    const inc = await pg.evaluate(() => { const r = _setProgSetType(0, 1, 0, 'Q'); return { r, type: _progEditEx(0, 1).sets[0].type, toast: (window.__toasts || []).length }; });
    t('EDP-D09 ⛔ un type INCONNU demandé au setter est refusé et dit (jamais écrit dans la série)', inc.r === false && inc.type === 'N' && inc.toast >= 1, js(inc));
    await pg.evaluate(() => closeProgEdit());
  });

  // ═══ P. PRÉSERVER — tout ce que l'éditeur ne touche pas ═══
  await section('P', 'PRÉSERVER — tout ce que l\'éditeur ne touche pas (ancien programme, champs futurs, cardio, dates)', async () => {
    // un programme complet, ouvert puis enregistré SANS rien toucher : identique (date de début, nombre de semaines, cardio, `prescrit`, `vide`, `restTxt`…)
    const f = PROG(); f.days[0].exs[0].sets[1].zz_futur = { a: 1 }; f.days[0].exs[2].zz_ex = 'x'; f.zz_prog = [1, 2];     // des champs qu'une version FUTURE aura ajoutés : jamais perdus
    await ouvrir(f); await enregistrer();
    const a = await lire();
    t('EDP-P01 ⭐⭐⭐ ouvrir puis « Enregistrer » SANS rien toucher laisse le programme IDENTIQUE, clé par clé : date de début, semaines, cardio, `prescrit`, `vide`, `restTxt`, supersets, dropset, commentaires, et les champs d\'une version future', canon(a) === canon(f), canon(a).length + ' vs ' + canon(f).length);
    // ancien programme : un seul jour, séries sans type ni repos, sans aucun des nouveaux champs
    const an = ANCIEN();
    await ouvrir(an); await enregistrer();
    const a2 = await lire();
    t('EDP-P02 ⭐⭐⭐ DONNÉES D\'AVANT — un ANCIEN programme (un jour, séries sans `type` ni `rest`, sans `vide` / `prescrit` / `restTxt` / `dropChaine`) ouvert puis enregistré sans rien toucher est IDENTIQUE : aucun champ n\'est appris en l\'ouvrant', canon(a2) === canon(an), canon(a2).slice(0, 400));
    const nouveaux = await pg.evaluate(() => JSON.stringify(S.programmes[0]).match(/"(vide|prescrit|restTxt|dropChaine|progId)"/g));
    t('EDP-P03 ⛔ … et aucun des nouveaux champs (`vide`, `prescrit`, `restTxt`, `dropChaine`) n\'y est apparu', nouveaux === null, js(nouveaux));
    // l'ancien programme s'affiche : type « N » par défaut (la donnée n'en a pas), charge vide pour 0
    await ouvrir(ANCIEN());
    const l0 = await ligne(0, 0, 0), l1 = await ligne(0, 1, 0), l2 = await ligne(0, 2, 0);
    t('EDP-P04 l\'ancien programme s\'AFFICHE avec ses valeurs : série sans type = « N », charge 60 lue, charge 0 = champ vide « non renseignée », série « maxi » intacte',
      !!l0 && !!l1 && !!l2 && l0.type.v === 'N' && l0.kg.v === '60' && l1.kg.v === '' && l1.vide.pressed === 'false' && l2.reps.v === 'maxi', js([l0 && l0.type && l0.type.v, l0 && l0.kg && l0.kg.v, l1 && l1.kg && l1.kg.v, l2 && l2.reps && l2.reps.v]));
    // une série d'un ancien programme SANS `type` s'affiche « N » : la 1ʳᵉ touche donne « É » (pas « N » une seconde fois sans rien changer à l'écran)
    await toucher(CH(0, 0, 0, 'type'));
    const l0b = await ligne(0, 0, 0);
    t('EDP-P08 ⭐ une série d\'un ancien programme sans `type` s\'affiche « N » et sa PREMIÈRE touche la passe en « É » (ce que la personne voit change dès le premier appui)', !!l0b && l0b.type.v === 'É' && (await pg.evaluate(() => _progEditEx(0, 0).sets[0].type)) === 'É', js(l0b && l0b.type));
    await pg.evaluate(() => closeProgEdit());
    // une série ancienne SANS clé `kg` mise « à vide » s'écrit {kg: 0, vide: true} (le modèle partagé)
    await ouvrir(ANCIEN());
    const sk = await pg.evaluate(() => { delete _editProgData.exs[1].sets[0].kg; _toggleProgSetVide(0, 1, 0); const s = _editProgData.exs[1].sets[0]; return { kg: s.kg, vide: s.vide }; });
    t('EDP-P09 ⭐ une série ancienne SANS clé `kg` mise « à vide » s\'écrit {kg: 0, vide: true} (le modèle partagé : « à vide » = charge 0 marquée), jamais `vide` tout seul', sk.kg === 0 && sk.vide === true, js(sk));
    await pg.evaluate(() => closeProgEdit());
    // modifier UN champ d'une série ne réécrit pas le reste de la série (champ inconnu, consigne écrite, `vide`)
    const f2 = PROG(); f2.days[0].exs[0].sets[1].zz_futur = { a: 1 };
    await ouvrir(f2);
    await saisir(CH(0, 0, 1, 'kg'), '42,5'); await toucher(CH(0, 0, 1, 'type'));
    await toucher(CH(0, 0, 0, 'vide')); await toucher(CH(0, 0, 0, 'vide'));            // la série 1 est « à vide » : on la défait puis on la REMET — elle revient comme avant (sa charge étant 0, la bascule marche)
    await enregistrer();
    const a3 = await lire();
    const s1 = a3.days[0].exs[0].sets[1], s0 = a3.days[0].exs[0].sets[0];
    t('EDP-P05 ⭐⭐ modifier la charge et le type d\'une série garde SES autres champs : consigne écrite (`restTxt`), champ d\'une version future, repos ; la bascule « vide » défaite puis remise rend la série « à vide » comme avant',
      s1.kg === 42.5 && s1.type === 'X' && s1.restTxt === '45-90 s' && canon(s1.zz_futur) === canon({ a: 1 }) && s1.rest === 60 && s0.vide === true && s0.kg === 0, js({ s1, s0 }));
    // cardio, date de début, semaines : l'éditeur du cycle est intact
    t('EDP-P06 ⛔ NON-RÉGRESSION — la date de début (2026-09-07), les 6 semaines et le cardio des deux jours sont intacts après des modifications de séries', a3.startDate === '2026-09-07' && a3.weeks === 6 && canon(a3.days[0].cardioAvant) === canon({ type: 'velo', intensity: 'leger', duration: 10 }) && canon(a3.days[1].cardio) === canon({ type: 'tapis', intensity: 'modere', duration: 12 }), js({ d: a3.startDate, w: a3.weeks, c: a3.days[0].cardioAvant }));
    // `prescrit` (posé par l'import) n'est ni lu ni écrit par l'éditeur
    t('EDP-P07 ⛔ le marquage `prescrit` posé par l\'import n\'est ni perdu ni modifié par l\'éditeur', a3.prescrit === true, js(a3.prescrit));
  });

  // ═══ S. LA CHAÎNE — ce que l'éditeur écrit est ce que la séance lit ═══
  await section('S', 'LA CHAÎNE — ce que l\'éditeur écrit est ce que la séance lit', async () => {
    const f = PROG(); delete f.prescrit;
    await ouvrir(f);
    await saisir(CH(0, 0, 6, 'kg'), '95'); await toucher(CH(0, 0, 6, 'type')); await saisir(CH(0, 0, 6, 'rest'), '200');
    await enregistrer();
    const seance = await pg.evaluate(() => { S.wkt = null; S.sessions = []; _loadProgDayVraiment(0, 0); const s = S.wkt.exs[0].sets[6]; const r = { kg: s.kg, type: s.type, rest: s.rest, n: S.wkt.exs[0].sets.length }; S.wkt = null; return r; });
    t('EDP-S01 ⭐ la CHAÎNE — la charge (95), le type (É) et le repos (200 s) modifiés dans l\'éditeur sont ceux de la série chargée à la séance (8 séries)', seance.kg === 95 && seance.type === 'É' && seance.rest === 200 && seance.n === 8, js(seance));
  });

  // ═══ I. IPHONE — largeur, cibles, alignement ═══
  await section('I', 'IPHONE — largeur (375 à 430 px), cibles du pouce, police, alignement, bouton « + » immobile', async () => {
    for (const w of [375, 390, 430]) {
      await pg.setViewportSize({ width: w, height: 844 });
      await ouvrir(PROG());
      await pg.waitForTimeout(150);
      const m = await pg.evaluate(() => {
        const c = document.getElementById('prog-edit-content'); const de = document.documentElement;
        const cartes = [...c.querySelectorAll('.prog-ex-card')]; let debord = [];
        cartes.forEach(card => { const cr = card.getBoundingClientRect(); card.querySelectorAll('input,button,textarea,.pe-row > *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > cr.right + 0.5 || r.left < cr.left - 0.5)) debord.push((e.dataset.ch || e.tagName) + ':' + Math.round(r.right - cr.right)); }); });
        // un champ dont la valeur est PLUS LARGE que lui la montre tronquée (« 240 » lu « 2… ») : on le mesure, pas à l'œil
        const tronques = [...c.querySelectorAll('.pe-row input')].filter(e => e.value !== '' && e.scrollWidth > e.clientWidth + 1).map(e => (e.dataset.ch || '?') + '=' + e.value + ' (' + e.scrollWidth + '>' + e.clientWidth + ')');
        return { page: de.scrollWidth, vw: window.innerWidth, contenu: [c.scrollWidth, c.clientWidth], debord: debord.slice(0, 4), tronques: tronques.slice(0, 4) };
      });
      t('EDP-I01 ⭐⭐ à ' + w + ' px de large : AUCUNE barre de défilement horizontale (page ≤ ' + w + ', contenu de l\'éditeur sans débordement, aucun champ ne sort de sa carte) ET aucune valeur de champ tronquée (« 240 » reste « 240 »)', m.page <= w && m.contenu[0] <= m.contenu[1] && m.debord.length === 0 && m.tronques.length === 0, js(m));
    }
    await pg.setViewportSize({ width: 390, height: 844 });
    await ouvrir(PROG());
    // les cibles tactiles
    const cibles = await pg.evaluate(() => {
      const bas = []; document.querySelectorAll('#prog-edit-content .pe-row').forEach((row, k) => row.querySelectorAll('input,button').forEach(e => { const r = e.getBoundingClientRect(); const mini = e.tagName === 'BUTTON' && e.dataset.ch === 'supprimer' ? 32 : 32; if (r.height < mini - 0.01 || r.width < 24) bas.push((e.dataset.ch || e.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }));
      return { n: document.querySelectorAll('#prog-edit-content .pe-row').length, bas: bas.slice(0, 5) };
    });
    t('EDP-I02 ⭐⭐ DÉFAUT MESURÉ — chaque champ et chaque bouton d\'une série mesure au moins 32 px de haut (et 24 de large) : le pouce vise juste (avant : ≈ 28 px de haut)', cibles.n > 0 && cibles.bas.length === 0, js(cibles));
    const police = await pg.evaluate(() => [...document.querySelectorAll('#prog-edit-content .pe-row input')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).map(e => (e.dataset.ch || '?') + ' ' + getComputedStyle(e).fontSize).slice(0, 5));
    const nbChamps = await pg.evaluate(() => document.querySelectorAll('#prog-edit-content .pe-row input').length);
    t('EDP-I03 les champs de saisie d\'une série ont une police de 16 px au moins (iPhone zoome la page à la mise au point d\'un champ plus petit)', nbChamps > 0 && police.length === 0, js({ nbChamps, police }));
    // l'en-tête de colonnes est aligné sur les champs
    const al = await pg.evaluate(() => {
      const card = document.querySelector('.prog-ex-card[data-di="0"][data-ei="0"]'); const hd = card && card.querySelector('.pe-hdr'); const row = card && card.querySelector('.pe-row[data-si="2"]');
      if (!hd || !row) return null;
      const L = el => Math.round(el.getBoundingClientRect().left * 10) / 10, C = el => { const r = el.getBoundingClientRect(); return Math.round((r.left + r.width / 2) * 10) / 10; };
      const h = n => hd.querySelector(`[data-h="${n}"]`), c = n => row.querySelector(`[data-ch="${n}"]`);
      return { num: [C(h('num')), C(c('num'))], type: [C(h('type')), C(c('type'))], kg: [L(h('kg')), L(c('kg'))], reps: [L(h('reps')), L(c('reps'))], rest: [C(h('rest')), C(c('rest'))] };
    });
    const ok = al && Object.keys(al).every(k => Math.abs(al[k][0] - al[k][1]) <= 3);
    t('EDP-I04 ⭐ l\'en-tête de colonnes (N° · Type · Charge · Reps · Repos) reste ALIGNÉ sur les champs de la ligne (écart ≤ 3 px)', !!ok, js(al));
    // l'écran n'est pas alourdi : la hauteur d'une ligne de série reste raisonnable
    const hl = await pg.evaluate(() => { const c = document.querySelector('.prog-ex-card[data-di="0"][data-ei="0"]'); const rows = c ? [...c.querySelectorAll('.pe-row')] : []; return rows.length ? { n: rows.length, ligne: Math.round(rows[2].getBoundingClientRect().height), somme: Math.round(rows.reduce((a, r) => a + r.getBoundingClientRect().height, 0)) } : null; });
    t('EDP-I05 l\'écran n\'est pas alourdi : une ligne de série fait entre 32 et 44 px de haut, et les 8 lignes du développé occupent au plus 320 px en tout (une seule ligne par série — sans compter les consignes écrites qui s\'y ajoutent)', !!hl && hl.n === 8 && hl.ligne >= 32 && hl.ligne <= 44 && hl.somme <= 320, js(hl));
    // le défilement de l'éditeur ne saute pas quand on touche un type (re-rendu)
    const defil = await pg.evaluate(() => {
      const c = document.getElementById('prog-edit-content'); c.scrollTop = 420; const av = c.scrollTop;
      const sel = '.prog-ex-card[data-di="0"][data-ei="2"] .pe-row[data-si="1"] [data-ch="type"]';
      const b = document.querySelector(sel); const avant = b ? b.textContent : null;
      if (b) b.click();                                                      // le type change → l'éditeur est redessiné
      const b2 = document.querySelector(sel);
      return { av, ap: c.scrollTop, avant, apres: b2 ? b2.textContent : null };
    });
    t('EDP-I06 ⭐ toucher un type (l\'éditeur est redessiné) ne fait PAS sauter le défilement : la liste ne remonte pas en haut à chaque touche', defil.av > 100 && !!defil.avant && defil.avant !== defil.apres && defil.ap === defil.av, js(defil));
    // plusieurs jours : la 2ᵉ séance a les mêmes champs
    const l2 = await ligne(1, 0, 2);
    t('EDP-I07 le 2ᵉ jour du programme a les mêmes champs (n°, type, charge, reps, repos) — multi-jours', !!l2 && ['num', 'type', 'kg', 'reps', 'rest'].every(k => !!l2[k]) && l2.kg.v === '70', js(l2 && l2.kg));
    // règle d'or n°9 : le bouton central « + » Séance ne bouge pas — on le MESURE (avant l'ouverture, éditeur ouvert, après la fermeture)
    await pg.evaluate(() => closeProgEdit());
    const fab = await pg.evaluate(() => {
      const r = () => { const e = document.getElementById('nb-log'); const q = e && e.getBoundingClientRect(); return q ? [Math.round(q.left * 10) / 10, Math.round(q.top * 10) / 10, Math.round(q.width * 10) / 10, Math.round(q.height * 10) / 10] : null; };
      const avant = r(); editProg(0); const ouvert = r(); closeProgEdit(); const apres = r();
      return { avant, ouvert, apres };
    });
    t('EDP-I08 ⛔ RÈGLE D\'OR n°9 — le bouton central « + » Séance ne bouge pas d\'un pixel (avant l\'ouverture de l\'éditeur, éditeur ouvert, après sa fermeture) : on le mesure', !!fab.avant && js(fab.avant) === js(fab.ouvert) && js(fab.avant) === js(fab.apres), js(fab));
    // la variante SANS colonne « max » (réservée aux testeurs : `_isNutriBeta()` faux) existe dans le code : la grille perd sa 6ᵉ colonne, l'en-tête reste aligné
    const sansMax = await pg.evaluate(() => {
      const orig = window._isNutriBeta; window._isNutriBeta = () => false; editProg(0);
      const card = document.querySelector('.prog-ex-card[data-di="0"][data-ei="0"]'); const hd = card.querySelector('.pe-hdr'); const row = card.querySelector('.pe-row[data-si="2"]');
      const L = el => Math.round(el.getBoundingClientRect().left * 10) / 10, C = el => { const r = el.getBoundingClientRect(); return Math.round((r.left + r.width / 2) * 10) / 10; };
      const h = n => hd.querySelector(`[data-h="${n}"]`), c = n => row.querySelector(`[data-ch="${n}"]`);
      const W = el => Math.round(el.getBoundingClientRect().width * 10) / 10;
      const r = { max: !!row.querySelector('[data-ch="max"]'), al: { num: [C(h('num')), C(c('num'))], type: [C(h('type')), C(c('type'))], kg: [L(h('kg')), L(c('kg'))], reps: [L(h('reps')), L(c('reps'))], rest: [C(h('rest')), C(c('rest'))] }, restL: W(c('rest')), xL: W(c('supprimer')), page: document.documentElement.scrollWidth, h: Math.round(row.getBoundingClientRect().height) };
      window._isNutriBeta = orig; closeProgEdit(); return r;
    });
    /* L'en-tête et les lignes partagent UNE grille : si elle se trompe de colonnes, les deux se trompent ENSEMBLE et l'alignement reste « bon » — on mesure donc aussi la largeur de ce qui doit être large (le repos) et étroit (la croix). */
    t('EDP-I11 ⛔ NON-RÉGRESSION — sans la colonne « max » (réservée aux testeurs), la ligne perd sa colonne, reste sur UNE ligne, l\'en-tête reste ALIGNÉ, le repos garde sa largeur (≥ 44 px) et la croix la sienne (≤ 30 px), rien ne déborde',
      !sansMax.max && Object.keys(sansMax.al).every(k => Math.abs(sansMax.al[k][0] - sansMax.al[k][1]) <= 3) && sansMax.restL >= 44 && sansMax.xL <= 30 && sansMax.page <= 390 && sansMax.h >= 32 && sansMax.h <= 44, js(sansMax));
    await pg.evaluate(() => closeProgEdit());
  });

  // ═══ I9. EN MODE TÉLÉPHONE ÉMULÉ (écran tactile, viewport mobile) ═══
  await section('I9', 'ÉCRAN TACTILE — viewport mobile émulé : pas de zoom ni de défilement horizontal, la pastille se touche au doigt', async () => {
    const cx2 = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, timezoneId: 'Europe/Paris', locale: 'fr-FR' });
    await cx2.route(/supabase\.co|anthropic\.com/, r => { reels++; return r.abort(); });
    await cx2.route(/workers\.dev|script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }));
    const p2 = await cx2.newPage(); p2.setDefaultTimeout(6000); p2.on('pageerror', x => errs.push(x.message));
    await p2.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_edp'))return; sessionStorage.setItem('_edp','1'); localStorage.clear();
      const D=${JSON.stringify(BASE_LS)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await p2.goto('http://localhost:' + PORT + '/index.html'); await p2.waitForTimeout(2500);
    await p2.evaluate(p => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.programmes = [p]; S.sessions = []; S.wkt = null; persist(); editProg(0); }, PROG());
    await p2.waitForTimeout(200);
    const m = await p2.evaluate(() => ({ page: document.documentElement.scrollWidth, iw: window.innerWidth, zoom: window.visualViewport ? Math.round(window.visualViewport.scale * 100) / 100 : 1, contenu: [document.getElementById('prog-edit-content').scrollWidth, document.getElementById('prog-edit-content').clientWidth] }));
    t('EDP-I09 ⭐ en viewport MOBILE émulé (390 px, tactile) : aucun défilement horizontal, aucun zoom, le contenu de l\'éditeur tient dans sa fenêtre', m.page <= m.iw && m.zoom === 1 && m.contenu[0] <= m.contenu[1], js(m));
    const SEL = `${ROW(0, 0, 5)} [data-ch="type"]`;
    const avant = await p2.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, SEL);
    await p2.locator(SEL).scrollIntoViewIfNeeded(); await p2.locator(SEL).tap();
    const apres = await p2.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, SEL);
    t('EDP-I10 ⭐ la pastille du type se touche AU DOIGT (événements tactiles, pas seulement la souris) : « N » → « É »', avant === 'N' && apres === 'É', js({ avant, apres }));
    await cx2.close();
  });

  // ═══ Z. ZÉRO APPEL RÉEL, ZÉRO ERREUR DE PAGE ═══
  t('EDP-Z01 ⛔ aucune erreur de page pendant tout le banc', errs.length === 0, errs.slice(0, 3).join(' | '));
  t('EDP-Z02 ⛔ aucun appel réel (Supabase, Anthropic) n\'est parti', reels === 0, 'appels=' + reels);
  await cx.close();
};
