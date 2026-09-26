/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-02 / C1 — LA LECTURE DE SECOURS LIT LE FORMAT QUE LE PROMPT DEMANDE (26/09/2026)

   Le prompt impose à Milo « UN EXERCICE PAR LIGNE, avec ses séries × reps, la charge en kg, le
   REPOS et ta consigne technique ». Mesuré par MILO-SEANCE-01, avant ce correctif :
     format du prompt 0/4 · format court 4/4 · format bloc 4/4 · mélange des deux 2/4.
   ⚠️ C'est un MÉCANISME reproduit en local, capable de produire un 4 → 2. Ce n'est PAS la cause
      démontrée de l'événement réel (SYMPTÔME RÉEL — CAUSE DE L'ÉVÉNEMENT RÉEL NON DÉTERMINÉE).

   Ce que les témoins CONDUISENT : `_seanceDepuisTexte` de l'app servie, puis `sendToCoach` de bout
   en bout (Worker simulé, 0 appel réel) jusqu'à la carte et `S.wkt`.
   Ce qu'ils OBSERVENT : le nombre d'exercices lus, leurs séries/reps/charges, les cartes posées.
   Ce qu'ils NE COUVRENT PAS : ce que Milo écrit réellement (un modèle), la traduction réelle,
   C2 (carte mémoire), C3 (séance traduite au rechargement), D-025, le délai de 12 s.
   Banc : tools/banc_seance_c1.js · contrôle négatif : tools/mut_seance_c1.py
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const E = [
  { n: 'Développé couché', s: 4, r: 6, kg: 80, rest: '2 min 30', sec: 150, cue: 'omoplates serrées, pieds ancrés au sol' },
  { n: 'Rowing barre', s: 4, r: 8, kg: 60, rest: '2 min', sec: 120, cue: 'dos neutre, tire la barre vers le nombril' },
  { n: 'Développé militaire', s: 3, r: 8, kg: 40, rest: '2 min', sec: 120, cue: 'gainage fort, ne cambre pas' },
  { n: 'Extension triceps', s: 3, r: 12, kg: 20, rest: '90 s', sec: 90, cue: 'coudes fixes, descente contrôlée' },
];
const INTRO = 'Voilà ta séance haut du corps pour ce soir 💪\n\n', FIN = '\n\nBonne séance, concentre-toi sur la technique.';
const PROMPT = INTRO + E.map((e, i) => `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN;
const PROMPT_SANS_NUM = INTRO + E.map(e => `${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN;
const PUCES = INTRO + E.map(e => `- ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN;
const COURT = INTRO + E.map(e => `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`).join('\n') + FIN;
const BLOC = INTRO + E.map(e => `**${e.n}**\n${e.s}×${e.r} à ${e.kg} kg — repos ${e.rest}\n${e.cue}`).join('\n\n') + FIN;
const MIXTE = INTRO + E.map((e, i) => i < 2 ? `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`
  : `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n') + FIN;
// Variations raisonnables : x / ×, @ / à, espaces, repos en parenthèse, séparateur « - », charge décimale
const VARIANTES = INTRO + [
  'Développé couché — 4x6 à 80 kg, repos 2 min — omoplates serrées',
  'Rowing barre — 4×8 @ 60 kg, repos 2 min — dos neutre',
  'Développé militaire —  3 × 8  à  40 kg ,  repos 2 min',
  'Extension triceps : 3×12 à 20 kg (repos 90 s)',
  'Curl biceps - 3×10 à 12,5 kg - repos 1 min',
].join('\n') + FIN;
const V_ATT = [['Développé couché', 4, 6, 80], ['Rowing barre', 4, 8, 60], ['Développé militaire', 3, 8, 40],
  ['Extension triceps', 3, 12, 20], ['Curl biceps', 3, 10, 12.5]];
// Une consigne longue : la ligne dépasse 90 caractères (l'ancienne borne la jetait entière)
const LONG = INTRO + '1. Développé couché — 4×6 à 80 kg, repos 2 min 30 — omoplates serrées, pieds ancrés, descends la barre sous contrôle jusqu\'au sternum\n'
  + '2. Rowing barre — 4×8 à 60 kg, repos 2 min — dos neutre, tire vers le nombril sans donner d\'élan avec les jambes ni le buste' + FIN;
// ── NÉGATIFS : chacun porte au moins DEUX lignes, sinon la règle « 2 exercices minimum » masquerait le défaut
const NEG = {
  'N1 paragraphe ordinaire de Milo': 'Bonne question ! Pour progresser, vise 3 à 4 séances par semaine, dors 8 h et bois 2 litres d\'eau.\n'
    + 'Sur le développé couché, ajoute 2,5 kg quand tu fais toutes tes reps, pas avant.\n'
    + 'La semaine dernière tu as tenu 4×6 à 80 kg, c\'est solide — garde ce cap.',
  'N2 simples quantités': 'Bois 2 litres d\'eau\nDors 8 h\n3 à 4 séances par semaine\nPrends 5 g de créatine\n2 min de repos entre les séries',
  'N3 poids + reps sans exercice': 'Tu as fait 4×6 à 80 kg la semaine dernière, bravo.\nBravo pour ton 5×5 à 100 kg, c\'est un record !\n'
    + 'Tu étais à 3×8 à 60 kg, repos 2 min, et tu as tout validé.',
  'N4a d\'autres séries dans la suite': 'Développé couché — 4×6 à 80 kg, puis 3×10 à 60 kg\nRowing barre — 4×8 à 60 kg, puis 3×12 à 40 kg',
  'N4b charge écrite mais pas lue': 'Développé couché — 4×6, 80 kg — repos 2 min\nRowing barre — 4×8, 60 kg — repos 2 min',
  'N4c écriture tronquée': 'Développé couché — 4×\nRowing barre — ×8 à 60 kg, repos 2 min',
  'N4d nombre de séries hors bornes': 'Développé couché — 15×6 à 80 kg, repos 2 min\nRowing barre — 20×8 à 60 kg, repos 2 min',
  'N4e paliers d\'échauffement': 'Échauffement : 40×5, 55×3, 70×2\nMontée : 60×5, 80×3, 90×1',
  'N4f pas de séparateur + suite': 'Développé couché 4×6 à 80 kg, bravo pour hier\nRowing barre 4×8 à 60 kg, comme la dernière fois',
};
const TRAD = { status: 'ok', seance: { label: 'Haut du corps', exs: E.map(e => ({ name: e.n, note: e.cue,
  sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg, type: 'N', rest: e.sec })) })) } };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCLXXXVII. MILO-SEANCE-02 / C1 — la lecture de secours : garde-fous (source) ═══');
  const src = fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8');
  const i0 = src.indexOf('function _seanceDepuisTexte('), i1 = src.indexOf('function _extractDaySession(');
  const f = i0 >= 0 && i1 > i0 ? src.slice(i0, i1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '') : '';
  t('① la fonction est trouvée (sinon les témoins suivants ne mesurent rien)', f.length > 500, f.length + ' car');
  t('② une SUITE après la charge exige un séparateur explicite entre le nom et les séries',
    /suite!==undefined[\s\S]{0,80}if\(!m\[2\]\s*&&\s*!\/\[:—–-\]\\s\*\$\/\.test\(m\[1\]\)\)\s*return/.test(f), '');
  t('③ une suite qui porte d\'autres séries fait refuser la ligne (on ne lit pas à moitié)', /if\(SERIES\.test\(suite\)\)\s*return/.test(f), '');
  t('④ une charge écrite dans la suite sans avoir été lue fait refuser la ligne (jamais de série à 0 kg)',
    /if\(!m\[5\]\s*&&\s*\/\\d\\s\*kg\\b\/i\.test\(suite\)\)\s*return/.test(f), '');
  t('⑤ la borne de 90 caractères reste entière pour les lignes sans suite et pour les séries seules',
    /else if\(t\.length>90\)\s*return/.test(f) && /if\(t\.length>90\)return;\s*const m2=t\.match\(RE_SEULE\)/.test(f), '');
  t('⑥ la règle des noms ne bouge pas : seulement `via:\'exact\'`, sinon le nom TEL QUEL (2 endroits)',
    (f.match(/via!==?'exact'|via===?'exact'/g) || []).length === 2, (f.match(/via!==?'exact'|via===?'exact'/g) || []).length + ' occurrence(s)');
  t('⑦ les bornes ne bougent pas : 1 à 12 séries, 1 à 100 reps, au moins 2 exercices',
    /nb>=1&&nb<=12/.test(f) && /reps>=1&&reps<=100/.test(f) && /exs\.length<2\)return null/.test(f), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXXVIII. MILO-SEANCE-02 / C1 — formats lus, faux exercices refusés, une carte (écran conduit) ═══');
  const ouvrir = async (routeur) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const appels = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      appels.push(c.action || ''); return routeur(r, c); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_c1'))return; sessionStorage.setItem('_c1','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.premium = true; window._premiumPending = false; });
    return { cx, pg, appels, errs };
  };
  const n0 = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

  // ── A. LA FONCTION, TEXTE PAR TEXTE (aucun réseau) ───────────────────────────────────────
  const A = await ouvrir(r => r.abort());
  const lire = txt => A.pg.evaluate(x => { const s = _seanceDepuisTexte(x);
    return s ? s.exs.map(e => ({ n: e.name, s: e.sets.length, r: e.sets[0] && e.sets[0].reps, kg: e.sets[0] && e.sets[0].kg })) : null; }, txt);
  const conforme = (lu, att) => !!lu && lu.length === att.length && att.every(([n, s, r, kg], i) =>
    lu[i] && n0(lu[i].n) === n0(n) && lu[i].s === s && lu[i].r === r && lu[i].kg === kg);
  const attE = E.map(e => [e.n, e.s, e.r, e.kg]);
  const js = x => JSON.stringify(x).slice(0, 260);

  const p1 = await lire(PROMPT);
  t('P1 ⭐ format EXACT du prompt (numéroté, repos, consigne) → 4/4, séries, reps et charges justes', conforme(p1, attE), js(p1));
  const p1b = await lire(PROMPT_SANS_NUM);
  t('P1b format du prompt sans numéro « Nom — 4×6 à 80 kg, repos 2 min — consigne » → 4/4', conforme(p1b, attE), js(p1b));
  const p2 = await lire(PUCES);
  t('P2 même format en puces → 4/4', conforme(p2, attE), js(p2));
  const p3 = await lire(COURT);
  t('P3 format court historique « Nom : 4×6 @ 80 kg » → 4/4 (inchangé)', conforme(p3, attE), js(p3));
  const p4 = await lire(BLOC);
  t('P4 format bloc (nom / séries / consigne) → 4/4 (inchangé)', conforme(p4, attE), js(p4));
  const p5 = await lire(MIXTE);
  t('P5 ⭐ mélange court + format du prompt → 4/4 (était 2/4)', conforme(p5, attE), js(p5));
  const p6 = await lire(VARIANTES);
  t('P6 variations (x/×, @/à, espaces, parenthèse, « - », 12,5 kg) → 5/5, valeurs justes', conforme(p6, V_ATT), js(p6));
  const p7 = await lire(LONG);
  t('P7 consigne longue : ligne de plus de 90 caractères → lue', conforme(p7, attE.slice(0, 2)) && LONG.split('\n')[2].length > 90,
    js(p7) + ' · ' + LONG.split('\n')[2].length + ' car');

  for (const [nom, txt] of Object.entries(NEG)) {
    const x = await lire(txt);
    t(nom + ' → aucune séance', x === null, js(x));
  }
  // Le plus exigeant : 2 vrais exercices + toutes les lignes pièges → EXACTEMENT les 2 vrais, aucun fantôme
  const pieges = Object.values(NEG).join('\n');
  const vrais = PROMPT.split('\n').filter(l => /^[12]\. /.test(l)).join('\n');
  const m1 = await lire(vrais + '\n' + pieges);
  t('N∑ 2 vrais exercices noyés dans toutes les lignes pièges → exactement les 2 vrais, aucun exercice fantôme',
    conforme(m1, attE.slice(0, 2)), js(m1));
  await A.cx.close();

  // ── B. DE BOUT EN BOUT : une carte, et la séance chargée ─────────────────────────────────
  const parcours = async (texte, cervelet) => {
    const X = await ouvrir(async (r, c) => {
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ reply: texte, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) });
      if (c.action === 'seanceJson') { if (cervelet === 'panne') return r.abort('failed');
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TRAD) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    const res = await X.pg.evaluate(async () => {
      const attendre = async (f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = f(); if (v) return v; } catch (e) {} await new Promise(z => setTimeout(z, 200)); } return null; };
      const oui = () => [...document.querySelectorAll('#coach-msgs .coach-prog-save button')].filter(e => /Oui, (on démarre|utiliser)/.test(e.textContent));
      await sendToCoach('Donne-moi une séance haut du corps pour ce soir, 4 exercices');
      await attendre(() => oui().length, 4000);
      await new Promise(z => setTimeout(z, 2500));                       // une réponse tardive poserait-elle une 2ᵉ carte ?
      const o = { cartes: oui().length, textes: oui().map(e => e.textContent.trim()) };
      const btn = oui().find(e => /\(\d+ exercices?\)/.test(e.textContent));
      S.wkt = null;
      if (btn) { btn.click(); await attendre(() => S.wkt && S.wkt.exs && S.wkt.exs.length, 4000); }
      o.wkt = S.wkt && S.wkt.exs ? S.wkt.exs.map(e => e.name) : null;
      return o;
    });
    res.appels = X.appels.filter(a => a && a !== 'summarizeCoach'); res.errs = X.errs; await X.cx.close(); return res;
  };
  const c1 = await parcours(PROMPT, 'panne');
  t('C1 ⭐ format du prompt + traduction EN PANNE → UNE carte, et le tap charge 4 exercices (était « je n\'arrive pas à lire »)',
    c1.cartes === 1 && c1.wkt && c1.wkt.length === 4, js(c1));
  const c2 = await parcours(PROMPT, 'ok');
  t('C2 format du prompt + traduction réussie → UNE carte, 4 exercices chargés', c2.cartes === 1 && c2.wkt && c2.wkt.length === 4, js(c2));
  const c3 = await parcours(MIXTE, 'panne');
  t('C3 ⭐ mélange + traduction EN PANNE → UNE carte, 4 exercices chargés (était 2)', c3.cartes === 1 && c3.wkt && c3.wkt.length === 4, js(c3));
  t('C∅ aucune erreur de page', ![c1, c2, c3].some(x => x.errs.length), [c1, c2, c3].map(x => x.errs.join('|')).join(' ').slice(0, 200));
};
