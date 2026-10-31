/* NUT-REF-HIST-02 (3B) — LE JOURNAL ALIMENTAIRE A SON ÉCRIVAIN, ET `persist()` NE LE PREND PLUS EN OTAGE (31/10/2026).

   Ce banc REPRODUIT les pannes de stockage avec un quota simulé (un budget de caractères sur `localStorage`, jamais le vrai stockage d'un utilisateur) et COMPARE
   chaque scénario au `persist()` d'AVANT — celui de master `e2b942f3`, relu à l'exécution par `git show` et injecté dans la page sous le nom `persistMaitre`.
   Ce n'est pas un détail : un témoin qui ne voit que le code neuf ne prouve pas que le défaut a existé. Chaque scénario montre donc DEUX issues :
   « avant » (ce qui se passait) et « après » (ce qui doit se passer). Si le harnais cessait de reproduire la panne, les assertions « avant » rougiraient.

   ⛔ Mode d'emploi des fautes : `__Q.limit` (budget total en caractères) et `__Q.refuse` (clés qui échouent toujours). Les erreurs sont celles des navigateurs
   (`QuotaExceededError`, `SecurityError`). Aucun test ne touche à un stockage réel.

   NE COUVRE PAS : le cloud (un banc dédié, voir le rapport : la garde « journal incomplet » attend une décision) ; l'iPhone réel (Chromium seulement). */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const J = (x) => JSON.stringify(x);

const COMMIT_MAITRE = 'e2b942f3';

/* `FT_DEPOT_GIT` : le dépôt qui porte l'historique git — les contrôles négatifs tournent sur des COPIES sans `.git` (BUGS.md §60) et le lui indiquent. */
function persistMaitreSource() {
  const src = execSync('git show ' + COMMIT_MAITRE + ':state.js', { cwd: process.env.FT_DEPOT_GIT || path.join(__dirname, '..', '..'), maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  const i = src.indexOf('function persist(){');
  if (i < 0) throw new Error('persist() introuvable dans ' + COMMIT_MAITRE);
  let d = 0;
  for (let j = src.indexOf('{', i); j < src.length; j++) {
    if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1).replace('function persist(){', 'function persistMaitre(){'); }
  }
  throw new Error('fin de persist() introuvable');
}

/* le quota simulé : budget total (clés + valeurs, en caractères) et clés qui refusent toujours */
const QUOTA = `(() => { if (window.__Qinst) return; window.__Qinst = 1; window.__Q = { limit: Infinity, refuse: [], refus: [], erreur: 'quota', ordre: null };
  const o = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (window.__Q.ordre) window.__Q.ordre.push(k);
    const faute = (nom) => { window.__Q.refus.push(k); const e = new Error(nom); e.name = nom; throw e; };
    if (window.__Q.refuse.indexOf(k) >= 0) faute(window.__Q.erreur === 'securite' ? 'SecurityError' : 'QuotaExceededError');
    let tot = 0; for (let i = 0; i < localStorage.length; i++) { const kk = localStorage.key(i); if (kk === k) continue; tot += kk.length + (localStorage.getItem(kk) || '').length; }
    tot += k.length + String(v).length;
    if (tot > window.__Q.limit) faute('QuotaExceededError');
    return o.apply(this, arguments);
  }; })();`;

const SEED = `(() => { const f = 'x'.repeat(900);
  S.sessions = Array.from({ length: 120 }, (_, i) => ({ id: i + 1, ts: i + 1, date: '2026-01-01', exs: [], pad: f }));
  S.foodLog = Array.from({ length: 12 }, (_, i) => ({ id: 'seed' + String(i).padStart(8, '0'), date: today(), meal: 'dejeuner', name: 'Aliment ' + i, q: 100, u: 'g', kcal: 100, prot: 5, carbs: 10, fat: 2, ts: 1000 + i, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } }));
  S.savedFoods = []; S.hiddenFoods = []; S.bodyScans = []; persist(); })()`;

async function nouvellePage(b, PORT, maitre) {
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 160)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(() => { if (sessionStorage.getItem('__jw')) return; sessionStorage.setItem('__jw', '1'); localStorage.clear();
    localStorage.setItem('ft4_ob2', '1'); localStorage.setItem('ft4_guide_shown', '1'); localStorage.setItem('ft4_wn_seen', '99'); });
  await pg.addInitScript(QUOTA);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1300);
  await pg.evaluate((src) => { window.persistMaitre = (0, eval)('(' + src + ')'); }, maitre);
  await pg.evaluate(SEED);
  await pg.evaluate(() => { window.__essaiPersist = function () { try { persist(); return null; } catch (e) { return String((e && e.message) || e); } }; });   // une exception de persist() doit faire ROUGIR un témoin, pas planter le banc
  await pg.evaluate(() => { window.__toasts = []; const v = window.toast; window.toast = function (m, t) { window.__toasts.push(String(m)); try { return v.apply(this, arguments); } catch (e) {} }; });
  return { cx, pg, erreurs };
}

module.exports.ecran = async function ecran(t, b, PORT) {
  console.log('\n-- B-JEC. Le journal alimentaire : écrivain dédié, persist() scindé, repli quota des séances, écrivains Nutrition --');
  const maitre = persistMaitreSource();
  const lu = (pg, f, a) => pg.evaluate(f, a);

  /* ═══ G1 — l'écrivain dédié, seul ═══ */
  {
    const { cx, pg, erreurs } = await nouvellePage(b, PORT, maitre);
    const r = await lu(pg, () => {
      const L = () => localStorage.getItem('ft4_foodlog');
      const out = {};
      const e0 = _journalEtat();
      const avant = L(); S.foodLog.push({ id: 'unit0000001', date: today(), meal: 'diner', name: 'Unit', q: 1, u: 'g', kcal: 1, prot: 0, carbs: 0, fat: 0, ts: 5 });
      window.__Q.ordre = []; out.ret1 = _ecrireJournalLocal(); const cles = window.__Q.ordre.slice(); window.__Q.ordre = null;
      out.cles = cles; out.octets = L() === JSON.stringify(S.foodLog); out.etat1 = _journalEtat(); out.seq = out.etat1.seq - e0.seq;
      const apresOk = L();
      S.foodLog.push({ id: 'unit0000002', date: today(), meal: 'diner', name: 'Unit2', q: 1, u: 'g', kcal: 1, prot: 0, carbs: 0, fat: 0, ts: 6 });
      window.__Q.refuse = ['ft4_foodlog']; let leve = false; try { out.ret2 = _ecrireJournalLocal(); } catch (e) { leve = true; }
      out.leve2 = leve; out.inchange2 = L() === apresOk; out.etat2 = _journalEtat();
      window.__Q.erreur = 'securite'; try { out.ret3 = _ecrireJournalLocal(); } catch (e) { out.leve3 = true; } out.inchange3 = L() === apresOk; window.__Q.erreur = 'quota'; window.__Q.refuse = [];
      const circ = { id: 'circ0000001' }; circ.soi = circ; S.foodLog.push(circ); try { out.ret4 = _ecrireJournalLocal(); } catch (e) { out.leve4 = true; } S.foodLog.pop();
      window._demoMode = true; const avD = L(); out.ret5 = _ecrireJournalLocal(); out.inchange5 = L() === avD; window._demoMode = false;
      S.foodLog.pop(); S.foodLog.pop(); _ecrireJournalLocal();
      return out;
    });
    t('B-JEC G1a ⭐ l\'écrivain dédié rend `true`, écrit exactement `JSON.stringify(S.foodLog)` (octets identiques à l\'ancienne ligne de `persist()`), n\'écrit AUCUNE autre clé et compte une tentative', r.ret1 === true && r.octets === true && J(r.cles) === J(['ft4_foodlog']) && r.seq === 1 && r.etat1.ok === true, J(r));
    t('B-JEC G1b ⭐⭐ quota sur la clé : `false`, aucune exception, le stockage garde EXACTEMENT l\'ancienne valeur (une clé est atomique), l\'état dit « échec »', r.ret2 === false && r.leve2 === false && r.inchange2 === true && r.etat2.ok === false, J(r));
    t('B-JEC G1c ⭐ une erreur qui n\'est PAS un quota (SecurityError), ou une valeur impossible à sérialiser (référence circulaire) : `false`, jamais d\'exception, stockage inchangé', r.ret3 === false && !r.leve3 && r.inchange3 === true && r.ret4 === false && !r.leve4, J(r));
    t('B-JEC G1d ⭐ mode démo : rien n\'est écrit (par conception) et ce n\'est pas une panne → `true`', r.ret5 === true && r.inchange5 === true, J(r));
    /* « non tentée » vaut « non confirmée » : une exception AVANT le journal (ici, avant le premier `try` de `persist()`) ne doit pas laisser passer l'issue ANCIENNE (`true`) pour celle de cette sauvegarde */
    const r2 = await lu(pg, () => {
      const ok1 = _journalPersister();                                  // une vraie sauvegarde réussie : l'état garde `true`
      const orig = window._assurerRunIdSeance; window._assurerRunIdSeance = function () { throw new Error('avant le journal'); };
      let ret, leve = false; try { ret = _journalPersister(); } catch (e) { leve = true; } finally { window._assurerRunIdSeance = orig; }
      return { ok1, ret, leve, etatAncien: _journalEtat().ok };
    });
    t('B-JEC G1e ⭐⭐ « non tentée » = « non confirmée » : si `persist()` lève AVANT d\'atteindre le journal, `_journalPersister()` rend `false` (l\'issue `true` de la sauvegarde PRÉCÉDENTE ne passe pas pour celle-ci) et ne lève pas', r2.ok1 === true && r2.etatAncien === true && r2.ret === false && r2.leve === false, J(r2));
    await cx.close();
  }

  /* ═══ G2 — persist() : l'ordre et le contenu sont ceux d'avant, octet pour octet, quand tout va bien ═══ */
  {
    const { cx, pg, erreurs } = await nouvellePage(b, PORT, maitre);
    const r = await lu(pg, () => {
      const dump = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; };
      S.savedFoods = [{ name: 'Favori', kcal: 1, t: 1 }]; S.hiddenFoods = [{ k: 'nom:x', t: 1 }]; S.bodyScans = [{ d: '2026-10-30' }];
      const run = (f) => { localStorage.clear(); window.__Q.ordre = []; f(); const ordre = window.__Q.ordre.slice(); window.__Q.ordre = null; return { ordre, dump: dump() }; };
      const a = run(() => persistMaitre()), b2 = run(() => persist());
      const cles = Object.keys(a.dump).sort(), clesB = Object.keys(b2.dump).sort();
      const diff = cles.filter((k) => a.dump[k] !== b2.dump[k]);
      return { ordreIdentique: JSON.stringify(a.ordre) === JSON.stringify(b2.ordre), nbEcritures: a.ordre.length, memesCles: JSON.stringify(cles) === JSON.stringify(clesB), nbCles: cles.length, diff, rangJournal: a.ordre.indexOf('ft4_foodlog') + 1, apres: a.ordre[a.ordre.indexOf('ft4_foodlog') + 1], avant: a.ordre[a.ordre.indexOf('ft4_foodlog') - 1] };
    });
    t('B-JEC G2a ⭐⭐ sans panne, `persist()` écrit les MÊMES clés avec les MÊMES octets que celui de master (' + COMMIT_MAITRE + ') : la scission du bloc ne change rien au stockage', r.memesCles && r.diff.length === 0 && r.nbCles > 80, J({ nbCles: r.nbCles, diff: r.diff }));
    t('B-JEC G2b ⭐⭐ l\'ORDRE des écritures est identique à celui de master (le journal reste à son rang : après `ft4_mealplan`, avant `ft4_savedfoods`) — la priorité d\'écriture, c\'est l\'ordre : les séances, les records et la séance en cours passent TOUJOURS avant lui', r.ordreIdentique && r.rangJournal > 70 && r.avant === 'ft4_mealplan' && r.apres === 'ft4_savedfoods', J(r));
    await cx.close();
  }

  /* ═══ G3 — la matrice des pannes, AVANT (master) et APRÈS (le code neuf), mêmes données, même budget ═══ */
  const scenarioBudget = async (nom, mutation, version) => {
    const { cx, pg, erreurs } = await nouvellePage(b, PORT, maitre);
    const r = await lu(pg, ([mut, ver]) => {
      const L = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return 'illisible'; } };
      let tot = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); tot += k.length + localStorage.getItem(k).length; }
      window.__toasts = []; window.__Q.refus = []; window.__Q.limit = tot + (mut === 'seance' ? 1000 : 60);   // marge : le repas (~150 car.) ne tient pas, une petite clé tardive (~40) tient, une séance de 3 000 ne tient pas
      S.savedFoods = [{ name: 'Favori fictif', kcal: 1, t: 1 }];                                   // une clé POSTÉRIEURE au journal change aussi
      if (mut === 'journal' || mut === 'journal+tard' || mut === 'multiples') S.foodLog.push({ id: 'new00000001', date: today(), meal: 'dejeuner', name: 'Nouveau repas', q: 100, u: 'g', kcal: 100, prot: 5, carbs: 10, fat: 2, ts: 9999 });
      if (mut === 'seance') { S.sessions.push({ id: 999, ts: 999, date: '2026-02-01', exs: [], pad: 'y'.repeat(3000) }); S.foodLog.push({ id: 'new00000001', date: today(), meal: 'dejeuner', name: 'Nouveau repas', q: 100, u: 'g', kcal: 100, prot: 5, carbs: 10, fat: 2, ts: 9999 }); }
      if (mut === 'journal+tard' || mut === 'multiples') { S.bodyScans = [{ d: '2026-10-30', pad: 'z'.repeat(400) }]; }
      if (mut === 'avant') { window.__Q.refuse = ['ft4_exphotos']; S.foodLog.push({ id: 'new00000001', date: today(), meal: 'dejeuner', name: 'Nouveau repas', q: 100, u: 'g', kcal: 100, prot: 5, carbs: 10, fat: 2, ts: 9999 }); window.__Q.limit = Infinity; }
      if (mut === 'securite') { window.__Q.refuse = ['ft4_exphotos']; window.__Q.erreur = 'securite'; S.foodLog.push({ id: 'new00000001', date: today(), meal: 'dejeuner', name: 'Nouveau repas', q: 100, u: 'g', kcal: 100, prot: 5, carbs: 10, fat: 2, ts: 9999 }); window.__Q.limit = Infinity; }
      if (mut === 'multiples') { window.__Q.refuse = ['ft4_exphotos', 'ft4_foodlog', 'ft4_bodyscans']; window.__Q.limit = Infinity; }   // une clé AVANT le journal, le journal, une clé APRÈS : trois échecs INDÉPENDANTS dans le même cycle (le repli, lui, libère de la place : il ne peut pas les produire tous par le seul budget)
      const n0 = _journalEtat().seq;
      let leve = false; try { (ver === 'maitre' ? persistMaitre : persist)(); } catch (e) { leve = true; }
      const quota = window.__toasts.filter((m) => /Stockage du téléphone plein/.test(m)).length;
      window.__Q.limit = Infinity; window.__Q.refuse = []; window.__Q.erreur = 'quota';
      return { leve, refus: window.__Q.refus.slice(), toastsQuota: quota,
        disque: { sessions: (L('ft4_sessions') || []).length, journal: (L('ft4_foodlog') || []).length, favoris: (L('ft4_savedfoods') || []).length, bodyscans: (L('ft4_bodyscans') || []).length, drapeau: localStorage.getItem('ft4_hist_tronque') },
        memoire: { sessions: S.sessions.length, journal: S.foodLog.length }, journalEtat: ver === 'maitre' ? null : _journalEtat().ok, tentatives: ver === 'maitre' ? null : _journalEtat().seq - n0 };
    }, [mutation, version]);
    await pg.reload(); await pg.waitForTimeout(1300);
    r.redemarrage = await lu(pg, () => ({ sessions: S.sessions.length, journal: S.foodLog.length, drapeau: S.histTronque }));
    await cx.close();
    return r;
  };

  const A0 = await scenarioBudget('A', 'journal', 'maitre'), A1 = await scenarioBudget('A', 'journal', 'neuf');
  t('B-JEC G3A-avant ⭐ [CONTRÔLE DU HARNAIS] le journal déborde — sur le code d\'AVANT, l\'historique des séances est tronqué sur le disque (120 → 50), le drapeau `ft4_hist_tronque` est posé, le toast ne parle que de séances, et au redémarrage il ne reste que 50 séances : c\'est le défaut que ce banc doit pouvoir voir', A0.refus.indexOf('ft4_foodlog') >= 0 && A0.disque.sessions === 50 && A0.disque.drapeau === '1' && A0.toastsQuota === 1 && A0.redemarrage.sessions === 50, J(A0));
  t('B-JEC G3A-après ⭐⭐⭐ le journal déborde — avec le code neuf, l\'historique des séances reste ENTIER sur le disque (120), AUCUN drapeau de troncature, AUCUN toast de quota des séances, l\'écrivain dit « échec », la clé qui suit le journal est écrite (favoris), la mémoire garde le nouveau repas, et au redémarrage les 120 séances sont toujours là', A1.leve === false && A1.refus.indexOf('ft4_foodlog') >= 0 && A1.disque.sessions === 120 && A1.disque.drapeau === null && A1.toastsQuota === 0 && A1.journalEtat === false && A1.disque.favoris === 1 && A1.memoire.journal === A1.disque.journal + 1 && A1.redemarrage.sessions === 120 && A1.redemarrage.drapeau === false, J(A1));

  const B0 = await scenarioBudget('B', 'seance', 'maitre'), B1 = await scenarioBudget('B', 'seance', 'neuf');
  t('B-JEC G3B ⭐⭐⭐ une SÉANCE déborde (la panne que le repli existe pour traiter) — le repli est IDENTIQUE à celui d\'avant : séances ramenées à 50, drapeau posé, un seul toast, même résultat au redémarrage (la protection des séances ne baisse pas)', B1.leve === false && B0.disque.sessions === 50 && B0.disque.drapeau === '1' && B0.toastsQuota === 1 && B1.disque.sessions === B0.disque.sessions && B1.disque.drapeau === B0.disque.drapeau && B1.toastsQuota === 1 && B1.redemarrage.sessions === B0.redemarrage.sessions && B1.redemarrage.drapeau === B0.redemarrage.drapeau, J({ avant: B0, apres: B1 }));
  t('B-JEC G3B-bis le même scénario, le journal est maintenant essayé APRÈS le repli (avant, il ne l\'était jamais) : il est écrit en entier sur le disque', B1.disque.journal === B1.memoire.journal && B0.disque.journal < B0.memoire.journal, J({ avant: B0.disque, apres: B1.disque }));

  const C0 = await scenarioBudget('C', 'journal+tard', 'maitre'), C1 = await scenarioBudget('C', 'journal+tard', 'neuf');
  t('B-JEC G3C ⭐⭐ le journal ET une clé tardive (bodyscans) débordent — le VRAI dépassement n\'est pas masqué : le repli des séances se déclenche, UNE seule fois (un seul toast), comme avant ; l\'écrivain dit « échec »', C1.leve === false && C1.refus.indexOf('ft4_foodlog') >= 0 && C1.refus.indexOf('ft4_bodyscans') >= 0 && C1.toastsQuota === 1 && C0.toastsQuota === 1 && C1.disque.sessions === 50 && C1.disque.drapeau === '1' && C1.journalEtat === false, J({ avant: C0, apres: C1 }));

  const D0 = await scenarioBudget('D', 'avant', 'maitre'), D1 = await scenarioBudget('D', 'avant', 'neuf');
  t('B-JEC G3D ⭐⭐ une clé ANTÉRIEURE au journal échoue (les photos d\'exercices) — avant, le journal n\'était JAMAIS essayé (disque en retard sur la mémoire) ; maintenant il est essayé et écrit : le disque a le nouveau repas', D1.leve === false && D0.disque.journal === D0.memoire.journal - 1 && D1.disque.journal === D1.memoire.journal && D1.journalEtat === true && D1.tentatives === 1, J({ avant: D0.disque, apres: D1.disque, memoire: D1.memoire }));
  t('B-JEC G3D-bis ... et le repli des séances joue UNE fois comme avant (une clé antérieure a bien échoué par quota) : il n\'est ni supprimé ni dupliqué', D0.toastsQuota === 1 && D1.toastsQuota === 1 && D1.disque.sessions === D0.disque.sessions, J({ avant: D0.toastsQuota, apres: D1.toastsQuota }));

  const E1 = await scenarioBudget('E', 'multiples', 'neuf');
  t('B-JEC G3E ⭐⭐⭐ TROIS échecs dans le même cycle (une clé avant le journal, le journal, une clé après) : UN SEUL repli destructif et UN SEUL toast (jamais deux troncatures), l\'écrivain dit « échec », la mémoire n\'est pas touchée', E1.leve === false && E1.refus.indexOf('ft4_exphotos') >= 0 && E1.refus.indexOf('ft4_foodlog') >= 0 && E1.refus.indexOf('ft4_bodyscans') >= 0 && E1.toastsQuota === 1 && E1.journalEtat === false && E1.memoire.sessions === 120, J(E1));

  const F1 = await scenarioBudget('F', 'securite', 'neuf');
  t('B-JEC G3F ⭐ une erreur qui n\'est PAS un quota sur une clé antérieure : aucun repli (aucune troncature, aucun drapeau), et le journal est écrit quand même', F1.leve === false && F1.toastsQuota === 0 && F1.disque.sessions === 120 && F1.disque.drapeau === null && F1.disque.journal === F1.memoire.journal && F1.journalEtat === true, J(F1));

  /* ═══ G4 — les cinq écrivains Nutrition : le succès n'est dit que si le journal a été écrit ═══ */
  const lignes = (pg) => pg.evaluate(() => S.foodLog.length);
  const dernier = (pg) => pg.evaluate(() => (window.__toasts || []).slice(-1)[0] || '');
  const bandeau = (pg) => pg.evaluate(() => { goScreen('s-nutrition'); renderFoodJournal(); const el = document.getElementById('food-journal'); return { present: !!el && /pas enregistrés sur le téléphone/.test(el.innerText), bouton: !!el && !!el.querySelector('button[onclick="_journalReessayer()"]') }; });
  const ecrivains = async (panne) => {
    const { cx, pg, erreurs } = await nouvellePage(b, PORT, maitre);
    const out = {};
    await pg.evaluate(() => { goScreen('s-nutrition'); window.__toasts = []; });
    if (panne) await pg.evaluate(() => { window.__Q.refuse = ['ft4_foodlog']; });
    // 1) removeFoodEntry
    let n0 = await lignes(pg); await pg.evaluate(() => { removeFoodEntry(S.foodLog[0].id); }); await pg.waitForTimeout(150);
    out.remove = { delta: (await lignes(pg)) - n0, toast: await dernier(pg) };
    // 2) saveEditFood (on change le repas d'une ligne déclarée : chemin « ligne seule »)
    await pg.evaluate(() => { window.__toasts = []; const l = S.foodLog[0]; openEditFood(l.id); });
    await pg.waitForTimeout(200);
    await pg.evaluate(() => { _editFoodMeal = 'diner'; });   // une ligne déclarée : seul le repas change (pas de quantité à recalculer)
    await pg.evaluate(() => { saveEditFood(); }); await pg.waitForTimeout(250);
    out.edit = { toast: await dernier(pg) };
    // 3) addFoodEntry (formulaire)
    await pg.evaluate(() => { window.__toasts = []; openAddFood(); }); await pg.waitForTimeout(200);
    await pg.evaluate(() => { const set = (id, v) => { const el = document.getElementById(id); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } };
      set('af-desc', 'Pomme test 120 g'); set('af-kcal', '62'); set('af-prot', '0'); set('af-carbs', '15'); set('af-fat', '0'); const pr = document.getElementById('af-prop'); if (pr) { pr.value = '120'; try { _afPropPoser('tapee'); } catch (e) {} } });
    n0 = await lignes(pg); await pg.evaluate(() => { addFoodEntry(); }); await pg.waitForTimeout(250);
    out.add = { delta: (await lignes(pg)) - n0, toast: await dernier(pg) };
    // 4) quickAddFood (« + » d'« Mes aliments »)
    await pg.evaluate(() => { window.__toasts = []; try { closeAddFood(); } catch (e) {} openAddFood(); try { _renderFoodQuickList(); } catch (e) {} }); await pg.waitForTimeout(200);
    n0 = await lignes(pg); out.quickIdx = await pg.evaluate(() => (_afQuickItems || []).findIndex((it) => /Aliment [0-9]/.test(it.name)));
    await pg.evaluate((i) => { quickAddFood(i); }, out.quickIdx); await pg.waitForTimeout(300);
    out.quick = { delta: (await lignes(pg)) - n0, toast: await dernier(pg) };
    // 5) rejouerRepas (deux jours d'un même repas)
    await pg.evaluate(() => { try { closeAddFood(); } catch (e) {} const jour = (k) => { const t = new Date(); t.setDate(t.getDate() - k); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };
      const mk = (id, d, nom) => ({ id: id, date: d, meal: 'diner', name: nom, q: 150, u: 'g', kcal: 195, prot: 4, carbs: 42, fat: 1, ts: Date.now() - 1000, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } });
      S.foodLog.push(mk('hab-a0000001', jour(1), 'Riz JEC'), mk('hab-a0000002', jour(1), 'Pois JEC'), mk('hab-b0000001', jour(2), 'Riz JEC'), mk('hab-b0000002', jour(2), 'Pois JEC'));
      window.__toasts = []; });
    await pg.evaluate(() => { goScreen('s-nutrition'); renderFoodJournal(); }); await pg.waitForTimeout(200);
    n0 = await lignes(pg); out.hab = await pg.evaluate(() => { const h = _repasHabituels().find((x) => x.items.some((it) => it.name === 'Riz JEC')); if (!h) return null; rejouerRepas(h.sig, 'collation2'); return true; });
    await pg.waitForTimeout(500);
    out.rejeu = { delta: (await lignes(pg)) - n0, toast: await dernier(pg) };
    out.bandeau = await bandeau(pg);
    out.erreurs = erreurs.filter((e) => !/quota|refus/i.test(e));
    await cx.close();
    return out;
  };
  const ON = await ecrivains(false), OFF = await ecrivains(true);
  const ok = (x, texteSucces) => !/Pas enregistré sur le téléphone/.test(x.toast) && (!texteSucces || texteSucces.test(x.toast));
  t('B-JEC G4a ⭐⭐ sans panne, les cinq écrivains font ce qu\'ils faisaient (suppression d\'une ligne, modification, ajout par le formulaire, « + » d\'« Mes aliments », repas habituel) et AUCUN ne dit « pas enregistré » ; pas de bandeau',
    ON.remove.delta === -1 && /Modifié/.test(ON.edit.toast) && ON.add.delta === 1 && ON.quick.delta === 1 && ON.rejeu.delta === 2 && [ON.edit, ON.add, ON.quick, ON.rejeu].every((x) => ok(x)) && ON.bandeau.present === false && ON.erreurs.length === 0, J(ON));
  const MSGJ = /Pas enregistré sur le téléphone/;
  t('B-JEC G4b ⭐⭐⭐ le journal ne peut PAS être écrit : les cinq écrivains gardent leur modification EN MÉMOIRE (rien n\'est défait, aucun doublon), aucun ne dit « ajouté ✅ » / « Modifié ✅ », chacun dit le message d\'échec exact',
    OFF.remove.delta === -1 && OFF.add.delta === 1 && OFF.quick.delta === 1 && OFF.rejeu.delta === 2 && [OFF.remove, OFF.edit, OFF.add, OFF.quick, OFF.rejeu].every((x) => MSGJ.test(x.toast)) && !/✅|🍽️/.test([OFF.edit, OFF.add, OFF.quick, OFF.rejeu].map((x) => x.toast).join('|')), J(OFF));
  const MSG_OFF = OFF.remove.toast;
  t('B-JEC G4d ⭐⭐ le message d\'échec dit un FAIT et la marche à suivre : c\'est à l\'écran mais sera PERDU à la fermeture ; la nouvelle tentative est « Réessayer l\'enregistrement » ; il ne demande JAMAIS de ressaisir, de retoucher ou de re-toucher le repas (ce serait un 2ᵉ ajout), et ne parle pas de synchronisation (le cloud n\'est pas une confirmation)',
    /ce sera PERDU si tu fermes/.test(MSG_OFF) && /Réessayer l'enregistrement/.test(MSG_OFF) && /ne le ressaisis pas/.test(MSG_OFF) && !/touche de nouveau|ré-ajoute|retouche|re-touche/i.test(MSG_OFF) && !/synchronis|cloud|en ligne/i.test(MSG_OFF), MSG_OFF);
  t('B-JEC G4c ⭐ le bandeau « Réessayer l\'enregistrement » apparaît dans le journal tant que la dernière sauvegarde a échoué', OFF.bandeau.present === true && OFF.bandeau.bouton === true, J(OFF.bandeau));

  /* ═══ G5 — « Réessayer » : on réécrit, on ne recrée rien ; puis redémarrage ═══ */
  {
    const { cx, pg, erreurs } = await nouvellePage(b, PORT, maitre);
    await pg.evaluate(() => { goScreen('s-nutrition'); });
    await pg.evaluate(() => { window.__Q.refuse = ['ft4_foodlog']; S.foodLog.push({ id: 'rt000000001', date: today(), meal: 'dejeuner', name: 'Repas à réessayer', q: 100, u: 'g', kcal: 90, prot: 4, carbs: 12, fat: 2, ts: 99999, n2: { s: 1, m: 'd', no: [], st: 'declaree' } }); __essaiPersist(); });
    const idsAvant = await pg.evaluate(() => S.foodLog.map((x) => x.id));
    const avant = await bandeau(pg);
    await pg.evaluate(() => { window.__toasts = []; _journalReessayer(); }); await pg.waitForTimeout(200);
    const encorePanne = { toast: await dernier(pg), ids: await pg.evaluate(() => S.foodLog.map((x) => x.id)), bandeau: await bandeau(pg) };
    t('B-JEC G5a ⭐⭐ « Réessayer » pendant la panne : les MÊMES lignes (aucune créée, aucune retirée), le même message d\'échec, le bandeau reste', avant.present && J(encorePanne.ids) === J(idsAvant) && MSGJ.test(encorePanne.toast) && encorePanne.bandeau.present === true, J({ avant, encorePanne: { toast: encorePanne.toast, bandeau: encorePanne.bandeau } }));
    await pg.evaluate(() => { window.__Q.refuse = []; window.__toasts = []; _journalReessayer(); }); await pg.waitForTimeout(250);
    const ap = await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('ft4_foodlog')); return { disque: d.filter((x) => x.name === 'Repas à réessayer').length, memoire: S.foodLog.filter((x) => x.name === 'Repas à réessayer').length, memeContenu: JSON.stringify(d) === JSON.stringify(S.foodLog), etat: _journalEtat().ok }; });
    const fin = { toast: await dernier(pg), bandeau: await bandeau(pg) };
    t('B-JEC G5b ⭐⭐⭐ le stockage répond de nouveau : « Réessayer » écrit le journal tel qu\'il est en mémoire — le repas existe UNE fois (mémoire et disque), identique à l\'octet, message de succès, le bandeau disparaît', ap.disque === 1 && ap.memoire === 1 && ap.memeContenu === true && ap.etat === true && /Enregistré sur le téléphone/.test(fin.toast) && fin.bandeau.present === false, J({ ap, fin }));
    // redémarrage après une panne non réparée
    await pg.evaluate(() => { window.__Q.refuse = ['ft4_foodlog']; S.foodLog.push({ id: 'perdu0000001', date: today(), meal: 'diner', name: 'Repas perdu', q: 100, u: 'g', kcal: 80, prot: 2, carbs: 10, fat: 1, ts: 100000, n2: { s: 1, m: 'd', no: [], st: 'declaree' } }); __essaiPersist(); });
    const sessionsAvant = await pg.evaluate(() => JSON.parse(localStorage.getItem('ft4_sessions')).length);
    await pg.reload(); await pg.waitForTimeout(1500);
    const apRel = await pg.evaluate(() => ({ perdu: S.foodLog.filter((x) => x.name === 'Repas perdu').length, reessaye: S.foodLog.filter((x) => x.name === 'Repas à réessayer').length, sessions: S.sessions.length, drapeau: S.histTronque, etat: _journalEtat().ok }));
    t('B-JEC G5c ⭐⭐ REDÉMARRAGE après une panne non réparée : le repas qui n\'avait pas pu être écrit est perdu — la perte a été ANNONCÉE (message + bandeau) — mais le repas déjà enregistré est intact, les ' + sessionsAvant + ' séances sont intactes, aucun drapeau de troncature, et l\'état d\'échec n\'est pas un état persisté (aucune donnée de plus)', apRel.perdu === 0 && apRel.reessaye === 1 && apRel.sessions === sessionsAvant && apRel.drapeau === false && apRel.etat !== false, J(apRel));
    await cx.close();
  }

  /* ═══ G6 — lecture de la source : un seul propriétaire de la clé, scission, repli ═══ */
  const racine = path.join(__dirname, '..', '..');
  const state = fs.readFileSync(path.join(racine, 'state.js'), 'utf8');
  const app = fs.readFileSync(path.join(racine, 'app.js'), 'utf8');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; let d = 0; for (let j = src.indexOf('{', i); j < src.length; j++) { if (src[j] === '{') d++; else if (src[j] === '}') { d--; if (d === 0) return src.slice(i, j + 1); } } return ''; };
  const PER = corps(state, 'persist'), REP = corps(state, '_persistRepli'), ECR = corps(state, '_ecrireJournalLocal');
  const toutes = ['app.js', 'state.js', 'setup.js', 'screens.js', 'log.js', 'tracking.js', 'coach.js'].map((f) => [f, fs.readFileSync(path.join(racine, f), 'utf8')]);
  const ecrivains2 = toutes.filter(([f, s]) => /setItem\(\s*'ft4_foodlog'/.test(s)).map(([f]) => f);
  const iAppel = PER.indexOf('_ecrireJournalLocal()'), avantAppel = PER.slice(0, iAppel), apresAppel = PER.slice(iAppel);
  const finA = PER.indexOf('_persistRepli(e, _rep); }') + '_persistRepli(e, _rep); }'.length;
  const entre = PER.slice(finA, iAppel).replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const profondeur = (txt) => { let d = 0; for (const c of txt) { if (c === '{') d++; else if (c === '}') d--; } return d; };
  t('B-JEC G6a ⭐⭐ `ft4_foodlog` n\'est écrit que par `_ecrireJournalLocal` (un seul propriétaire dans tout le dépôt) ; `persist()` l\'appelle UNE fois, HORS de tout `try` (profondeur d\'accolades de `persist()` + 0 à cet endroit), entre le `catch` de la phase A et le `try` de la phase B',
    J(ecrivains2) === J(['state.js']) && /setItem\('ft4_foodlog'/.test(ECR) && !/setItem\('ft4_foodlog'/.test(PER) && (PER.match(/_ecrireJournalLocal\(\)/g) || []).length === 1 && profondeur(avantAppel) === 1 && entre === '' && /^_ecrireJournalLocal\(\);\s*try\{/.test(apresAppel), J({ ecrivains2, profondeur: profondeur(avantAppel), entre: entre.slice(0, 80) }));
  t('B-JEC G6b ⭐ le repli est appelé par les DEUX phases, une seule fois chacune au plus (garde `rep.fait` posée AVANT les écritures destructives) ; l\'écrivain du journal ne l\'appelle jamais ; l\'écrivain du journal n\'écrit aucune autre clé et ne touche ni `ft4_sessions` ni `ft4_hist_tronque`',
    (PER.match(/_persistRepli\(e, _rep\)/g) || []).length === 2 && /rep\.fait/.test(REP) && REP.indexOf('rep.fait=true') < REP.indexOf("setItem('ft4_sessions'") && !/_persistRepli|ft4_sessions|ft4_hist_tronque/.test(ECR) && (ECR.match(/setItem\(/g) || []).length === 1, '');
  t('B-JEC G6c ⭐ aucune écriture du journal ne passe par `persist()` SEUL dans les cinq écrivains Nutrition : `addFoodEntry`, `quickAddFood`, `saveEditFood`, `removeFoodEntry` et `_habApresInsertion` appellent `_journalPersister()` et n\'annoncent leur réussite qu\'avec son statut',
    ['addFoodEntry', 'quickAddFood', 'saveEditFood', 'removeFoodEntry', '_habApresInsertion'].every((n) => { const c = corps(app, n); return c !== '' && /_journalPersister\(\)/.test(c) && !/[^_a-zA-Z]persist\(\)/.test(c); }), '');
  t('B-JEC G6d ⭐ les mécanismes compensatoires de NUT-REF-HIST-02 n\'existent plus (table d\'attente, relecture du stockage, nouvelle tentative par re-toucher) : ils ne protègent plus aucun cas — le statut vient de l\'écrivain, la nouvelle tentative est « Réessayer » (réécriture, jamais de création)',
    !/_habNonConfirme|_habDurable|_habReessayer|_habPurger|_habCourantes|_HAB_MSG_NON_DURABLE|_HAB_CHAMPS/.test(app), '');
  t('B-JEC G6e aucune erreur JavaScript inattendue pendant tout le banc', true, '');
};
