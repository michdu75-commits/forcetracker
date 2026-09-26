/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-03 / C2 — UNE CARTE MÉMOIRE NE MASQUE PLUS LA CARTE SÉANCE (26/09/2026)

   Mesuré avant correction : la garde d'unicité de `_appendStartSessionBtn` cherchait
   `.coach-prog-save`, classe que portent AUSSI la carte « 🧠 Je retiens » et la carte
   « Enregistrer ce programme ». Séance + proposition de mémoire → la garde rendait `true`
   (« déjà un bouton ») → ni la traduction ni le repli ne posaient de carte séance. La même garde
   large existait dans `_appendSeanceQuestion`. Et sans `cible`, AUCUNE garde : deux appels
   posaient deux cartes.
   Ce que les témoins CONDUISENT : les fonctions de l'app servie, puis `sendToCoach` de bout en bout
   (Worker simulé, 0 appel réel). Ce qu'ils OBSERVENT : les cartes sous chaque bulle, comptées par
   leur TEXTE (« Cette séance te convient ») et non par la marque que la correction ajoute — sinon
   retirer la marque rendrait le compteur aveugle. Ce qu'ils NE COUVRENT PAS : C3, D-025, le délai
   de 12 s, la traduction réelle.
   Banc : tools/banc_seance_c2.js · contrôle négatif : tools/mut_seance_c2.py
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const E = [
  { n: 'Développé couché', s: 4, r: 6, kg: 80 }, { n: 'Rowing barre', s: 4, r: 8, kg: 60 },
  { n: 'Développé militaire', s: 3, r: 8, kg: 40 }, { n: 'Extension triceps', s: 3, r: 12, kg: 20 },
];
const INTRO = 'Voilà ta séance haut du corps pour ce soir 💪\n\n', FIN = '\n\nBonne séance.';
const COURT = INTRO + E.map(e => `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`).join('\n') + FIN;
const ILLISIBLE = INTRO + E.map(e => `**${e.n}** — ${e.s}×${e.r} · ${e.kg} kg · repos 2 min`).join('\n') + FIN;   // le repli ne lit pas les points médians
const MEM = '\n```json\n{"retiens":["préfère les séances courtes le soir"]}\n```';
const TRAD = { status: 'ok', seance: { label: 'Haut du corps', exs: E.map(e => ({ name: e.n,
  sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg, type: 'N', rest: 120 })) })) } };

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCLXXXIX. MILO-SEANCE-03 / C2 — la garde d\'unicité ne regarde que les cartes séance (source) ═══');
  const src = fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const corps = nom => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const btn = corps('_appendStartSessionBtn'), qst = corps('_appendSeanceQuestion'), mem = corps('_appendMemoryBtns'), prog = corps('_appendSaveProgBtn');
  t('① les quatre fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', btn && qst && mem && prog, [btn, qst, mem, prog].map(x => x.length).join('/'));
  t('② `_appendStartSessionBtn` : la garde cherche `.coach-seance-carte`, plus `.coach-prog-save`',
    /last\.querySelector\('\.coach-seance-carte'\)\)return true/.test(btn) && !/querySelector\('\.coach-prog-save'\)/.test(btn), '');
  t('③ `_appendSeanceQuestion` : même garde, propre aux cartes séance',
    /last\.querySelector\('\.coach-seance-carte'\)\)return false/.test(qst) && !/querySelector\('\.coach-prog-save'\)/.test(qst), '');
  t('④ les DEUX cartes séance portent la marque ; la carte mémoire et la carte programme ne la portent pas',
    /className='coach-prog-save coach-seance-carte'/.test(btn) && /className='coach-prog-save coach-seance-carte'/.test(qst)
    && !/coach-seance-carte/.test(mem) && !/coach-seance-carte/.test(prog), '');
  const iGarde = btn.indexOf(".coach-seance-carte')"), iLast = btn.indexOf('if(!last)return false;');
  t('⑤ la garde s\'applique APRÈS le choix de la bulle, donc aussi sans `cible`', iGarde > 0 && iLast > 0 && iGarde > iLast, iLast + ' < ' + iGarde);
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXC. MILO-SEANCE-03 / C2 — mémoire et séance coexistent, une seule carte séance (écran conduit) ═══');
  const ouvrir = async (routeur) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const appels = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      appels.push(c.action || ''); return routeur(r, c); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_c2'))return; sessionStorage.setItem('_c2','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.premium = true; window._premiumPending = false; });
    return { cx, pg, appels, errs };
  };
  const js = x => JSON.stringify(x).slice(0, 260);

  // ── A. LES FONCTIONS, BULLE PAR BULLE (aucun réseau) ─────────────────────────────────────
  const A = await ouvrir(r => r.abort());
  const a = await A.pg.evaluate((COURT) => {
    // compteurs par le TEXTE, jamais par la marque que la correction ajoute
    const compter = bulle => { const w = [...bulle.querySelectorAll('.coach-prog-save')];
      return { seance: w.filter(x => /Cette séance te convient/.test(x.textContent)).length,
               memoire: w.filter(x => /Je retiens/.test(x.textContent)).length,
               programme: w.filter(x => /Enregistrer ce programme/.test(x.textContent)).length }; };
    const bulle = () => { renderCoachMsg('coach', 'Réponse de test'); const bs = document.querySelectorAll('#coach-msgs .msg-coach'); return bs[bs.length - 1]; };
    const s = _extractDaySession(COURT).sess; const o = {};
    let x = bulle(); _appendMemoryBtns(['préfère le soir']); o.memoireSeule = compter(x);
    x = bulle(); o.seul = { rv: _appendStartSessionBtn(s), n: compter(x) };
    x = bulle(); _appendStartSessionBtn(s); _appendMemoryBtns(['aime le tempo lent']); o.seancePuisMemoire = compter(x);
    x = bulle(); _appendMemoryBtns(['récupère mal le lundi']); o.memoirePuisSeance = { rv: _appendStartSessionBtn(s, x), n: compter(x) };
    x = bulle(); _appendStartSessionBtn(s, x); o.deuxieme = { rv: _appendStartSessionBtn(s, x), n: compter(x) };
    x = bulle(); o.repetes = { rv: [_appendStartSessionBtn(s), _appendStartSessionBtn(s), _appendStartSessionBtn(s)], n: compter(x) };
    x = bulle(); _appendMemoryBtns(['dort peu en semaine']); _appendSaveProgBtn({ name: 'Force', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5 }] }] });
    o.nonSeance = { avant: compter(x), rv: _appendStartSessionBtn(s, x), apres: compter(x) };
    x = bulle(); const q1 = _appendSeanceQuestion('texte', x);
    o.questionPuisCarte = { q1, rv: _appendStartSessionBtn(s, x), q2: _appendSeanceQuestion('texte', x), n: compter(x) };
    x = bulle(); _appendMemoryBtns(['s\'entraîne à 7 h']); o.memoirePuisQuestion = { rv: _appendSeanceQuestion('texte', x), n: compter(x) };
    return o;
  }, COURT);
  const un = (n, m) => n.seance === 1 && (m == null || n.memoire === m);
  t('1 mémoire seule → la carte mémoire, AUCUNE carte séance fantôme', a.memoireSeule.memoire === 1 && a.memoireSeule.seance === 0, js(a.memoireSeule));
  t('2 séance seule → exactement 1 carte séance', a.seul.rv === true && un(a.seul.n, 0), js(a.seul));
  t('3 ⭐ mémoire PUIS séance → la carte mémoire reste ET 1 carte séance apparaît (C2, était 0)', a.memoirePuisSeance.rv === true && un(a.memoirePuisSeance.n, 1), js(a.memoirePuisSeance));
  t('4 séance PUIS mémoire → les deux, 1 carte séance', un(a.seancePuisMemoire, 1), js(a.seancePuisMemoire));
  t('5 ⭐ une vraie carte séance présente bloque TOUJOURS la deuxième (rendu true, 1 carte)', a.deuxieme.rv === true && un(a.deuxieme.n), js(a.deuxieme));
  t('6 ⭐ trois appels sans bulle cible → 1 seule carte séance (étaient 2 pour 2 appels)', a.repetes.rv.every(v => v === true) && un(a.repetes.n), js(a.repetes));
  t('9 plusieurs cartes non-séance (mémoire + programme) → elles restent, et 1 carte séance s\'ajoute',
    a.nonSeance.avant.seance === 0 && a.nonSeance.rv === true && a.nonSeance.apres.seance === 1 && a.nonSeance.apres.memoire === 1 && a.nonSeance.apres.programme === 1, js(a.nonSeance));
  t('10 une question « on démarre ? » déjà posée compte comme carte séance : pas de 2ᵉ carte, pas de 2ᵉ question',
    a.questionPuisCarte.q1 === true && a.questionPuisCarte.rv === true && a.questionPuisCarte.q2 === false && un(a.questionPuisCarte.n), js(a.questionPuisCarte));
  t('10b une carte mémoire ne bloque plus la question « on démarre ? »', a.memoirePuisQuestion.rv === true && un(a.memoirePuisQuestion.n, 1), js(a.memoirePuisQuestion));
  await A.cx.close();

  // ── B. DE BOUT EN BOUT (sendToCoach, Worker simulé) ──────────────────────────────────────
  const parcours = async (texte, demande, cerv, env) => {
    let nTrad = 0;
    const X = await ouvrir(async (r, c) => {
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(Object.assign(
        { reply: texte, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }, env || {})) });
      if (c.action === 'seanceJson') { nTrad++;
        const panne = cerv === 'panne' || (cerv === 'panne-puis-ok' && nTrad === 1);
        if (panne) return r.abort('failed');
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TRAD) }); }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    const res = await X.pg.evaluate(async (demande) => {
      const attendre = async (f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = f(); if (v) return v; } catch (e) {} await new Promise(z => setTimeout(z, 200)); } return null; };
      const m = () => document.getElementById('coach-msgs');
      const cartes = () => { const w = [...m().querySelectorAll('.coach-prog-save')];
        return { seance: w.filter(x => /Cette séance te convient/.test(x.textContent)).length, memoire: w.filter(x => /Je retiens/.test(x.textContent)).length,
                 textes: w.filter(x => /Cette séance te convient/.test(x.textContent)).map(x => (x.querySelector('button') || {}).textContent || '') }; };
      await sendToCoach(demande);
      await attendre(() => cartes().seance, 4000);
      await new Promise(z => setTimeout(z, 2500));                           // une réponse tardive poserait-elle une 2ᵉ carte ?
      const o = { arrivee: cartes() };
      const q = [...m().querySelectorAll('.coach-prog-save button')].find(e => /Oui, on démarre$/.test(e.textContent.trim()));
      if (q) { q.click(); await attendre(() => cartes().textes.some(x => /\(\d+ exercices?\)/.test(x)) || m().querySelector('.milo-ask-fail'), 16000); o.apresQuestion = cartes(); }
      const btn = [...m().querySelectorAll('.coach-prog-save button')].find(e => /\(\d+ exercices?\)/.test(e.textContent));
      S.wkt = null; if (btn) { btn.click(); await attendre(() => S.wkt && S.wkt.exs && S.wkt.exs.length, 4000); }
      o.wkt = S.wkt && S.wkt.exs ? S.wkt.exs.length : 0;
      return o;
    }, demande);
    res.appels = X.appels.filter(x => x && x !== 'summarizeCoach'); res.errs = X.errs; await X.cx.close(); return res;
  };
  const DEM = 'Donne-moi une séance haut du corps pour ce soir, 4 exercices';
  const f1 = await parcours('Noté, je garde ça en tête.' + MEM, 'Je dors mieux depuis que je me couche plus tôt.', 'ok');
  t('B1 mémoire seule (sendToCoach) → carte mémoire, aucune carte séance', f1.arrivee.memoire === 1 && f1.arrivee.seance === 0, js(f1));
  const f2 = await parcours(COURT, DEM, 'ok');
  t('B2 séance seule → 1 carte séance, 4 exercices chargés', f2.arrivee.seance === 1 && f2.wkt === 4, js(f2));
  const f3 = await parcours(COURT + MEM, DEM, 'ok');
  t('B3 ⭐ mémoire + séance, traduction réussie → carte mémoire ET 1 carte séance, 4 exercices chargés (était 0 carte séance)',
    f3.arrivee.memoire === 1 && f3.arrivee.seance === 1 && f3.wkt === 4, js(f3));
  const f3b = await parcours(COURT + MEM, DEM, 'panne');
  t('B3b ⭐ mémoire + séance, traduction EN PANNE → le repli pose sa carte malgré la mémoire, 4 exercices',
    f3b.arrivee.memoire === 1 && f3b.arrivee.seance === 1 && f3b.wkt === 4, js(f3b));
  const f3c = await parcours(ILLISIBLE + MEM, DEM, 'panne-puis-ok');
  t('B3c ⭐ mémoire + séance illisible → la question s\'affiche, et au tap la vraie carte la remplace (1 seule), mémoire intacte',
    f3c.arrivee.memoire === 1 && f3c.arrivee.seance === 1 && f3c.apresQuestion && f3c.apresQuestion.seance === 1 && f3c.apresQuestion.memoire === 1 && f3c.wkt === 4, js(f3c));
  const f7 = await parcours('Bonne question ! La créatine se prend tous les jours, 3 à 5 g, le moment importe peu.', 'La créatine, je la prends quand ?', 'ok');
  t('7 message ordinaire sans séance → aucune carte séance', f7.arrivee.seance === 0 && f7.wkt === 0, js(f7));
  const f8 = await parcours(COURT + MEM, DEM, 'ok', { stopReason: 'max_tokens', truncated: true, complete: false });
  t('8 réponse incomplète (coupée) avec séance + mémoire → aucune carte séance démarrable', f8.arrivee.seance === 0 && f8.wkt === 0, js(f8));
  const tous = [f1, f2, f3, f3b, f3c, f7, f8];
  t('C∅ aucune erreur de page', tous.every(x => !x.errs.length), tous.map(x => x.errs.join('|')).join(' ').slice(0, 200));
};
