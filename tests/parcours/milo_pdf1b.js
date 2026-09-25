/* ═══════════════════════════════════════════════════════════════════════════════════════
   📄 MILO-PDF1B — LE RACCORD SE PROUVE, LA FIN SE CONFIRME, ET UNE RÉPONSE NON TERMINÉE
   NE DEVIENT JAMAIS UNE SÉANCE (25/09/2026)

   Contre-vérification du principal sur MILO-PDF1 (démontré, pas supposé) :
     · la couture heuristique rendait « épaulessont », « et le » + « lendemain » → « et lendemain »
       (un MOT PERDU), « dede », et dupliquait une réponse redémarrée — le tout marqué complet ;
     · une raison d'arrêt inconnue ou absente s'affichait EXACTEMENT comme une réponse finie ;
     · sous une réponse coupée, « Leg curl 3×12 » devenait « 3×1 » dans la séance du jour.
   Correctifs : raccord à ANCRE exacte (sans preuve → incomplet), fail-closed (seul `end_turn`
   est complet), aucune séance depuis une réponse non confirmée (décision de Michel), marqueur
   AVANT le texte de Milo (décision de Michel).
     .source : ce qui est écrit.   .reel : le VRAI worker.js, API simulée (C1 → C12).
     .ecran  : le chat, le fil rechargé, le bouton séance, dans le navigateur.
   Contrôle négatif : `tools/mut_milo_pdf1.py` (banc : `tools/banc_milo_pdf1.js`).
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const _sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ')
                                  .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, '$1');
const _corps = (src, tete) => {
  const i = src.indexOf(tete); if (i < 0) return '';
  const j = src.slice(i + tete.length).search(/\n(?:async )?function |\nconst [A-Z_]+ *=|\nlet |\nvar /);
  return j < 0 ? src.slice(i) : src.slice(i, i + tete.length + j);
};

module.exports.source = function (t, ROOT, fs, path) {
  const brut = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const W = _sansCommentaires(brut('worker.js')), C = _sansCommentaires(brut('coach.js'));
  console.log('\n═══ B-CCCLXXXI. MILO-PDF1B — raccord prouvé, fin confirmée, séance refusée (source) ═══');
  const rac = _corps(W, 'function _raccorderSuite(');
  t('B-CCCLXXXI ① la couture heuristique a DISPARU ; un seul raccord, par ancre',
    !/_recollerSuite/.test(W) && (W.match(/function _raccorderSuite\(/g) || []).length === 1, '');
  t('B-CCCLXXXI ② l\'ancre se vérifie à l\'IDENTIQUE — aucune comparaison approximative dans le raccord',
    /if \(!corps\.startsWith\(ancre\)\) return non\(/.test(rac)
    && !/toLowerCase|toUpperCase|normalize\(|localeCompare|levenshtein|\.search\(|new RegExp/.test(rac), '');
  t('B-CCCLXXXI ③ seule une coupure excuse une fermeture absente ; texte avant/après l\'enveloppe → refus',
    /if \(stop2 !== 'max_tokens'\) return non\('structure'\);/.test(rac)
    && /b\.slice\(0, i\)\.trim\(\) !== ''\) return non\('structure'\)/.test(rac)
    && /\.trim\(\) !== ''\) return non\('structure'\);/.test(rac), '');
  t('B-CCCLXXXI ④ un redémarrage (la 1ʳᵉ ligne réécrite) est refusé',
    /if \(premiere\.length >= 12 && suite\.indexOf\(premiere\) >= 0\) return non\('redemarrage'\);/.test(rac), '');
  const co = _corps(W, 'async function coach(');
  t('B-CCCLXXXI ⑤ FAIL-CLOSED : `complete` n\'accepte QUE end_turn (ni stop_sequence, ni rien d\'autre)',
    /complete: !!texte && stop === 'end_turn', continued \}/.test(co) && !/stop_sequence/.test(co), '');
  const anc = _corps(W, 'function _ancreSuite(');
  t('B-CCCLXXXI ⑥ l\'ancre = au plus 60 points de code de la FIN, jamais un blanc en tête',
    /Array\.from\(t\)\.slice\(-60\)/.test(anc) && /\.replace\(\/\^\[\\s/.test(anc), anc.slice(0, 160));
  const et = _corps(C, 'function _miloEtatReponse(');
  t('B-CCCLXXXI ⑦ côté app : 3 états seulement, et tout ce qui n\'est pas confirmé → « non_confirmee »',
    /if \(d\.complete === true\) return 'complete';\s*return 'non_confirmee';/.test(et) && !/'inconnu'|'interrompue'/.test(et), et.slice(0, 200));
  const chat = _corps(C, 'async function sendToCoach(');
  t('B-CCCLXXXI ⑧ chat : toute réponse non confirmée est marquée, et AUCUNE voie de séance ne s\'ouvre',
    /if \(_et !== 'complete'\) _coupee = \(_et === 'coupee'\) \? 'reponse' : 'non_confirmee';/.test(chat)
    && /if \(!_fp && !_coupee\) \{/.test(chat) && /const _dsDemande = !_fp && !_coupee && /.test(chat) && !/\bsuite\s*:/.test(chat), '');
  const fil = _corps(C, 'function _renderCoachThread(');
  t('B-CCCLXXXI ⑨ fil rechargé : une réponse marquée ne rend ni bouton ni question « on démarre ? »',
    /_coupeeValide\(m\.coupee\)\) break;/.test(fil) && /dernAssist=\(typeof _coupeeValide==='function'&&_coupeeValide\(m\.coupee\)\)\?null:m\.content;/.test(fil), '');
  const rend = _corps(C, 'function renderCoachMsg(');
  t('B-CCCLXXXI ⑩ le marqueur est posé AVANT le texte de Milo (décision de Michel), pas après',
    /div\.insertBefore\(cp, div\.firstChild\);/.test(rend) && !/div\.appendChild\(cp\)/.test(rend), '');
};

module.exports.reel = async function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCLXXXII. MILO-PDF1B — le raccord CONDUIT sur le vrai Worker (C1 → C12, 0 appel réel) ═══');
  const O = require('./milo_pdf1.js')._outils;
  const lance = async (file, extra) => {
    const { ctx, ia } = O.monter(ROOT, fs, path, file.slice());
    const corps = Object.assign({ action: 'coach', token: 'a'.repeat(64), message: 'Analyse ce programme', context: 'ctx', history: [], suite: true }, extra || {});
    const req = new Request('https://worker.test/', { method: 'POST',
      headers: { Origin: 'https://michdu75-commits.github.io', 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corps) });
    const r = await ctx._h.fetch(req, { ANTHROPIC_API_KEY: 'cle-de-test' }, { waitUntil() {} });
    let d = {}; try { d = await r.json(); } catch (e) {}
    return { d, ia };
  };
  // Une réponse de suite ÉCRITE À LA MAIN (brut), pour tester chaque écart au protocole.
  const BRUT = (f, stop) => (corps) => O.REP(f(O.ANCRE_DE(corps)), stop)();
  const env = (x) => '<FT_SUITE>' + x + '</FT_SUITE>';
  const e = (x) => JSON.stringify({ r: x.d.reply, co: x.d.complete, tr: x.d.truncated, su: x.d.continued, rac: x.d._raccord, n: x.ia.length });
  const ok = (x, attendu) => x.d.reply === attendu && x.d.complete === true && x.d.truncated === false && x.d.continued === true && x.ia.length === 2;
  const garde = (x, p1) => x.d.reply === p1 && x.d.complete === false && x.d.truncated === true && x.d.continued === false && x.ia.length === 2;

  const c1 = await lance([O.REP('Les épa', 'max_tokens'), BRUT(a => env(a + 'ules sont prioritaires.'), 'end_turn')]);
  t('C1 mot coupé : « Les épa » → « Les épaules sont prioritaires. », complete', ok(c1, 'Les épaules sont prioritaires.'), e(c1));
  const c2 = await lance([O.REP('Les épaules', 'max_tokens'), BRUT(a => env(a + ' sont prioritaires.'), 'end_turn')]);
  t('C2 frontière de mots : l\'espace est celle que Milo écrit APRÈS l\'ancre (plus de « épaulessont »)', ok(c2, 'Les épaules sont prioritaires.'), e(c2));
  const c3 = await lance([O.REP('Repos : 3 min.', 'max_tokens'), BRUT(a => env(a + ' Ensuite passe au rowing.'), 'end_turn')]);
  t('C3 phrase terminée : « Repos : 3 min. Ensuite passe au rowing. », aucune fusion', ok(c3, 'Repos : 3 min. Ensuite passe au rowing.'), e(c3));
  const p4 = 'Squat 4×5. Repos : 3 min.';
  const c4 = await lance([O.REP(p4, 'max_tokens'), BRUT(a => env(a + ' Ensuite rowing.'), 'end_turn')]);
  t('C4 la fin répétée (l\'ancre) n\'apparaît qu\'UNE fois — aucun doublon', ok(c4, p4 + ' Ensuite rowing.') && (c4.d.reply.match(/Repos : 3 min\./g) || []).length === 1, e(c4));
  const p5 = '## Muscles prioritaires\n- **Épau';
  const c5 = await lance([O.REP(p5, 'max_tokens'), BRUT(a => env(a + 'les** : priorité\n- Dos'), 'end_turn')]);
  t('C5 Markdown (titre, liste, gras) : rien de perdu, le gras est refermé par Milo',
    ok(c5, '## Muscles prioritaires\n- **Épaules** : priorité\n- Dos'), e(c5));
  const c6 = await lance([O.REP('On reprend et le', 'max_tokens'), BRUT(a => env(a + ' lendemain repos.'), 'end_turn')]);
  /* ⚠️ Ce que le protocole garantit, et ce qu'il ne peut pas garantir : AUCUN caractère de la 1ʳᵉ partie
     n'est jamais retiré (témoin C∗ plus bas), et une suite qui ne recopie pas l'ancre est refusée. Ce
     que Milo écrit APRÈS une ancre recopiée est pris tel quel — c'est son texte, pas une couture. */
  const c6b = await lance([O.REP('On reprend et le', 'max_tokens'), BRUT(() => env('et lendemain repos.'), 'end_turn')]);
  t('C6 « et le » + « lendemain » : aucun mot perdu ; une suite qui ne recopie pas l\'ancre → INCOMPLET',
    ok(c6, 'On reprend et le lendemain repos.') && garde(c6b, 'On reprend et le') && c6b.d._raccord === 'ancre_absente', e(c6) + ' ' + e(c6b));
  const c7 = await lance([O.REP('Fais 3 séries de', 'max_tokens'), BRUT(a => env(a + ' 10 reps.'), 'end_turn')]);
  const c7b = await lance([O.REP('Fais 3 séries de', 'max_tokens'), BRUT(() => env('de 10 reps.'), 'end_turn')]);
  t('C7 « de » + « de 10 reps » : jamais « dede » — sans ancre la suite est refusée',
    ok(c7, 'Fais 3 séries de 10 reps.') && !/dede/.test(c7.d.reply + c7b.d.reply) && garde(c7b, 'Fais 3 séries de'), e(c7) + ' ' + e(c7b));
  const c8 = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => env(a + ' Dos.\n\n🎯 VERDICT GLOBAL\nProgramme solide.'), 'end_turn')]);
  const c8b = await lance([O.REP(O.P1, 'max_tokens'), BRUT(() => env(O.P1 + ' Dos.'), 'end_turn')]);
  t('C8 redémarrage complet (avec ou sans ancre) → refusé, 1ʳᵉ partie gardée INTACTE, jamais complete',
    garde(c8, O.P1) && c8.d._raccord === 'redemarrage' && garde(c8b, O.P1) && c8b.d.reply.length === O.P1.length, e(c8) + ' ' + e(c8b));
  const c9 = await lance([O.REP(O.P1, 'max_tokens'), BRUT(() => env('Muscles prioritaires : Épaule + Dos.'), 'end_turn')]);
  const c9b = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => env('Voici : ' + a + ' Dos.'), 'end_turn')]);
  t('C9 ancre incorrecte, ou pas en tête → complete=false, 1ʳᵉ partie gardée',
    garde(c9, O.P1) && garde(c9b, O.P1) && c9b.d._raccord === 'ancre_fausse', e(c9) + ' ' + e(c9b));
  const c10 = await lance([O.REP(O.P1, 'max_tokens'), O.REP(' Dos, en priorité le haut du dos.', 'end_turn')]);
  const c10b = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => 'Voici la suite : ' + env(a + ' Dos.'), 'end_turn')]);
  const c10c = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => env(a + ' Dos.') + ' Bon courage !', 'end_turn')]);
  const c10d = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => '<FT_SUITE>' + a + ' Dos.', 'end_turn')]);
  t('C10 enveloppe absente / texte avant / texte après / fermeture manquante sans coupure → complete=false',
    [c10, c10b, c10c, c10d].every(x => garde(x, O.P1) && x.d._raccord === 'structure'), [c10, c10b, c10c, c10d].map(e).join(' '));
  const c11 = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => '<FT_SUITE>' + a + ' Dos, en priorité le haut du dos. </FT_SU', 'max_tokens')]);
  t('C11 suite coupée à son tour : la partie PROUVÉE est gardée, la fermeture tronquée retirée, et complete=false',
    c11.d.reply === O.P1 + ' Dos, en priorité le haut du dos. ' && c11.d.complete === false && c11.d.truncated === true
    && c11.d.continued === true && c11.ia.length === 2, e(c11));
  const c12 = await lance([O.REP(O.P1, 'max_tokens'), O.COUPURE]);
  const c12b = await lance([O.REP(O.P1, 'max_tokens'), O.ERR(529)]);
  t('C12 suite en panne (réseau / 529) → 1ʳᵉ partie gardée + incomplète',
    garde(c12, O.P1) && garde(c12b, O.P1) && c12.d._raccord === 'echec' && c12b.d._raccord === 'echec', e(c12) + ' ' + e(c12b));
  const cN = await lance([O.REP(O.P1, 'max_tokens'), BRUT(a => '<FT_SUITE>\n' + a + ' Dos.</FT_SUITE>\n', 'end_turn')]);
  t('C∗ un retour à la ligne d\'ENVELOPPE est toléré (l\'ancre ne commence jamais par un blanc)', ok(cN, O.P1 + ' Dos.'), e(cN));
  const cE = await lance([O.REP('Bon courage 💪🏽', 'max_tokens'), BRUT(a => env(a + ' et à demain.'), 'end_turn')]);
  const q = (cE.ia[1] || {}).messages || [], cons = String((q[q.length - 1] || {}).content || '');
  t('C∗ l\'ancre envoyée est la fin EXACTE (emoji entier), 60 points de code au plus',
    ok(cE, 'Bon courage 💪🏽 et à demain.') && O.ANCRE_DE({ messages: q }) === 'Bon courage 💪🏽' && /<FT_SUITE>/.test(cons),
    JSON.stringify(O.ANCRE_DE({ messages: q })));
  const longue = 'x'.repeat(30) + ' ' + 'Muscles prioritaires : Épaules + Dos + Bras, en priorité le haut du dos';
  const cL = await lance([O.REP(longue, 'max_tokens'), BRUT(a => env(a + '.'), 'end_turn')]);
  const aL = O.ANCRE_DE({ messages: (cL.ia[1] || {}).messages || [] });
  t('C∗ ancre bornée : 60 points de code, prise à la FIN', Array.from(aL).length === 60 && longue.endsWith(aL) && ok(cL, longue + '.'), JSON.stringify(aL));

  const cCasse = await lance([O.REP('Les épa', 'max_tokens'), BRUT(a => env(a.toLowerCase() + 'ules sont prioritaires.'), 'end_turn')]);
  t('C∗ l\'ancre se compare À L\'IDENTIQUE : une casse différente (« les épa ») → refusée, incomplète',
    garde(cCasse, 'Les épa') && cCasse.d._raccord === 'ancre_absente', e(cCasse));
  const pEmo = 'x'.repeat(10) + '💪' + 'y'.repeat(59);
  const cEmo = await lance([O.REP(pEmo, 'max_tokens'), BRUT(a => env(a + ' fin.'), 'end_turn')]);
  const aEmo = O.ANCRE_DE({ messages: (cEmo.ia[1] || {}).messages || [] });
  t('C∗ l\'ancre ne coupe jamais un emoji : 60 POINTS DE CODE, aucune demi-paire UTF-16',
    aEmo === '💪' + 'y'.repeat(59) && !/[\ud800-\udbff](?![\udc00-\udfff])|(^|[^\ud800-\udbff])[\udc00-\udfff]/.test(aEmo), JSON.stringify(aEmo.slice(0, 4)));
  const acceptes = [c1, c2, c3, c4, c5, c6, c7, cN, cE, cL, c11];
  const p1s = ['Les épa', 'Les épaules', 'Repos : 3 min.', p4, p5, 'On reprend et le', 'Fais 3 séries de', O.P1, 'Bon courage 💪🏽', longue, O.P1];
  t('C∗ INVARIANT : dans TOUT raccord accepté, la 1ʳᵉ partie est conservée caractère pour caractère',
    acceptes.every((x, i) => x.d.continued === true && x.d.reply.startsWith(p1s[i])), acceptes.map(e).join(' ').slice(0, 300));
  console.log('  — fail-closed sur la raison d\'arrêt —');
  for (const sr of ['stop_sequence', 'refusal', 'pause_turn', 'tool_use', undefined, 'raison_future_xyz']) {
    const x = await lance([O.REP('Une réponse.', sr)], { suite: false });
    t('SR `' + String(sr) + '` → complete=false (seul end_turn est complet), 1 appel',
      x.d.complete === false && x.d.truncated === false && x.ia.length === 1 && x.d.stopReason === (sr || null), e(x));
  }
  const xE = await lance([O.REP('Une réponse.', 'end_turn')], { suite: false });
  t('SR `end_turn` → complete=true (témoin de sensibilité)', xE.d.complete === true && xE.ia.length === 1, e(xE));
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXXIII. MILO-PDF1B — ce que la personne VOIT : marqueur en tête, séance refusée ═══');
  const SEANCE = 'Voilà ta séance jambes pour ce soir 💪\n\nSquat — 4×6 à 100 kg, repos 3 min\nPresse à cuisses — 3×10 à 180 kg, repos 2 min\n'
    + 'Soulevé de terre roumain — 3×8 à 80 kg, repos 2 min\nLeg curl — 3×1';
  const TRAD = { label: 'Jambes', exs: [{ name: 'Squat', sets: [1, 2, 3, 4].map(() => ({ reps: 6, kg: 100, rest: 180 })) },
    { name: 'Presse à cuisses', sets: [1, 2, 3].map(() => ({ reps: 10, kg: 180 })) },
    { name: 'Soulevé de terre roumain', sets: [1, 2, 3].map(() => ({ reps: 8, kg: 80 })) },
    { name: 'Leg curl', sets: [1, 2, 3].map(() => ({ reps: 1, kg: 0 })) }] };
  const ETATS = {
    coupee:   { reply: SEANCE, _diag: 'ok', stopReason: 'max_tokens', truncated: true, complete: false, continued: false },
    complete: { reply: SEANCE, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false },
    suiteOK:  { reply: SEANCE, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: true },
    refus:    { reply: SEANCE, _diag: 'ok', stopReason: 'refusal', truncated: false, complete: false, continued: false },
    suiteKO:  { reply: SEANCE, _diag: 'ok', stopReason: 'max_tokens', truncated: true, complete: false, continued: false, _raccord: 'ancre_fausse' },
    ancien:   { reply: SEANCE, _diag: 'ok' },
    // une réponse coupée APRÈS un bloc caché complet : le fil rechargé saurait le relire (sans le cervelet)
    coupeeBloc: { reply: SEANCE + '\n\n```json\n' + JSON.stringify({ seance: TRAD }) + '\n```\nEt pour la suite on', _diag: 'ok',
      stopReason: 'max_tokens', truncated: true, complete: false, continued: false },
    completeBloc: { reply: SEANCE + '\n\n```json\n' + JSON.stringify({ seance: TRAD }) + '\n```', _diag: 'ok',
      stopReason: 'end_turn', truncated: false, complete: true, continued: false },
  };
  const essai = async (etat, recharger) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const recus = [];
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      recus.push(c.action || '');
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ETATS[etat]) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', seance: TRAD }) }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_pdf1b'))return; sessionStorage.setItem('_pdf1b','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(async (rech) => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      S.premium = true; window._premiumPending = false;
      await sendToCoach('Donne-moi une séance jambes pour ce soir');
      await new Promise(z => setTimeout(z, 1200));
      if (rech) { _saveCoachHist(); coachHistory = []; _pendingMiloSessions.length = 0; _loadCoachHist(); _renderCoachThread(); await new Promise(z => setTimeout(z, 300)); }
      const bs = document.querySelectorAll('.msg-coach'); const x = bs[bs.length - 1];
      let boutons = [...x.querySelectorAll('button')].map(e => e.textContent.trim()).filter(s => !/PDF|Partager|côté/.test(s));
      const oui = [...x.querySelectorAll('button')].find(e => /Oui, on d|Commencer/.test(e.textContent));
      if (oui) { oui.click(); await new Promise(z => setTimeout(z, 1500)); }
      const prem = x.firstElementChild;
      return { boutons, premier: prem ? prem.className + '|' + prem.textContent.slice(0, 40) : '', marque: (x.dataset.coupee || ''),
        wkt: (S.wkt && S.wkt.exs || []).map(e => e.name + ' ' + (e.sets || []).length + 'x' + ((e.sets || [])[0] || {}).reps),
        attente: _pendingMiloSessions.length, hist: (coachHistory[coachHistory.length - 1] || {}).coupee || '' };
    }, !!recharger);
    r.errs = errs; r.appelsCoach = recus.filter(a => a === 'coach').length; r.cervelet = recus.filter(a => a === 'seanceJson').length;
    await cx.close(); return r;
  };
  const R = {};
  for (const k of ['coupee', 'complete', 'suiteOK', 'refus', 'suiteKO', 'ancien']) R[k] = await essai(k);
  R.rechCoupee = await essai('coupee', true); R.rechComplete = await essai('complete', true);
  R.rechCoupeeBloc = await essai('coupeeBloc', true); R.rechCompleteBloc = await essai('completeBloc', true);
  const bloque = (x) => x.boutons.length === 0 && x.wkt.length === 0 && x.attente === 0 && x.cervelet === 0;
  t('S1 réponse COMPLÈTE → la séance se propose et démarre comme avant (témoin de sensibilité)',
    R.complete.boutons.some(s => /on démarre|Commencer/.test(s)) && R.complete.wkt.length === 4 && R.complete.marque === '', JSON.stringify(R.complete));
  t('S2 réponse COUPÉE (3×12 → « 3×1 ») → aucun bouton, aucune séance, aucun appel de traduction',
    bloque(R.coupee) && R.coupee.marque === 'reponse', JSON.stringify(R.coupee));
  t('S3 suite réussie ET confirmée complète → bouton disponible', R.suiteOK.wkt.length === 4 && R.suiteOK.marque === '', JSON.stringify(R.suiteOK));
  t('S4 suite échouée, raison inconnue (refusal), serveur sans le signal → séance IMPOSSIBLE',
    [R.suiteKO, R.refus, R.ancien].every(bloque) && R.refus.marque === 'non_confirmee' && R.ancien.marque === 'non_confirmee' && R.suiteKO.marque === 'reponse',
    JSON.stringify([R.suiteKO, R.refus, R.ancien].map(x => [x.marque, x.boutons, x.wkt.length])));
  t('S5 fil RECHARGÉ : la réponse coupée ne retrouve ni bouton ni question ; la complète, si (comme avant)',
    bloque(R.rechCoupee) && R.rechCoupee.hist === 'reponse' && R.rechComplete.boutons.some(s => /on démarre|Commencer/.test(s)), JSON.stringify([R.rechCoupee, R.rechComplete.boutons]));
  /* Le fil rechargé relit d'abord le bloc caché (sans cervelet) : ce cas-là prouve que la garde du
     rechargement AGIT, au lieu de rester verte parce que la lecture échoue d'elle-même. */
  t('S5b fil RECHARGÉ, bloc caché complet sous une réponse COUPÉE → toujours refusé ; même bloc sous une réponse complète → séance (sensibilité)',
    bloque(R.rechCoupeeBloc) && R.rechCompleteBloc.wkt.length === 4 && R.rechCompleteBloc.marque === '',
    JSON.stringify([R.rechCoupeeBloc, R.rechCompleteBloc.wkt, R.rechCompleteBloc.boutons]));
  t('S6 le marqueur est le PREMIER élément de la bulle, avant le texte de Milo',
    /coach-coupee/.test(R.coupee.premier) && /Réponse incomplète/.test(R.coupee.premier)
    && /coach-coupee/.test(R.refus.premier) && /Réponse non confirmée/.test(R.refus.premier) && !/coach-coupee/.test(R.complete.premier),
    JSON.stringify([R.coupee.premier, R.refus.premier, R.complete.premier]));
  t('S7 chat : 1 seul envoi à Milo par message, même coupé', Object.keys(R).every(k => R[k].appelsCoach === 1), JSON.stringify(Object.keys(R).map(k => R[k].appelsCoach)));
  t('S∅ aucune erreur de page', Object.keys(R).every(k => !R[k].errs.length), Object.keys(R).map(k => R[k].errs.join('|')).join(' ').slice(0, 200));
};
