/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🧱 FIABILISATION LOT 2 — DÉFINITION UNIQUE DU « TRAVAIL EXISTANT » (F01 + F02) · session-B · 27/09/2026

   Mesuré par l'écran sur master e1dcb91c (ft-v1239), AVANT correction : 20 min de cardio ou
   10 min d'échauffement notés dans le bloc Cardio, puis
     · F01 — « Oui, on démarre » sur une carte de Milo → effacés sans question (mode « start »
       qui reconstruit `S.wkt`) : la porte ne regardait que les EXERCICES ;
     · F02 — « ▶ Charger » un programme → effacés sans question : `_travailAPerdre` ne comptait
       que les SÉRIES FAITES.
   Correctif : `_etatTravailWkt()` (log.js) rend RIEN / PREPARATION / TRAVAIL ; le cardio compte
   par ses MINUTES (`_cardioNoteMin`). Milo questionne dès que l'état n'est pas RIEN ; le
   programme confirme sur TRAVAIL et remplace toujours une PREPARATION sans rien demander.

   Ce que les témoins CONDUISENT : l'onglet Séance, le bloc Cardio (champ durée), l'onglet Coach,
   l'envoi d'un message, la carte « Oui » de Milo, la modale « Ajouter / Remplacer / Annuler »,
   « ▶ Charger » d'un programme, la confirmation « Remplacer / Annuler », un VRAI rechargement.
   Ce qu'ils OBSERVENT : `S.wkt` en mémoire ET `ft4_wkt` sur le disque, avant et après chaque
   geste, la question posée ou non, son texte, `S.sessions`.
   Ce qu'ils NE COUVRENT PAS : le libellé des cartes Milo (« on démarre » / « utiliser cette
   séance », volontairement inchangé), `lancerTypeSeance` au-delà de la non-destruction du cardio,
   la fin de séance, le débrief, le cloud.
   Banc : tools/banc_travail_lot2.js · contrôle négatif : tools/mut_travail_lot2.py
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const PROG = [{ id: 'p1', name: 'Mon Push', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 6, type: 'N', rest: 120 }, { kg: 80, reps: 6, type: 'N', rest: 120 }] }] }];
const MILO_EX = [['Squat Avant', 3, 8, 60], ['Leg Curl Assis Machine', 3, 10, 40], ['Fentes Marchées', 3, 10, 20]];
const MILO_TXT = 'Voilà ta séance jambes pour ce soir 💪\n\n' + MILO_EX.map((e, i) => `${i + 1}. ${e[0]} — ${e[1]}×${e[2]} à ${e[3]} kg, repos 2 min — gainage`).join('\n') + '\n\nBonne séance.';
const DEM = 'Donne-moi une séance jambes pour ce soir';
const C = (min) => ({ type: 'elliptique', intensity: 'modere', duration: min });
const EX0 = () => ({ name: 'Rowing Barre (Tirage Horizontal)', sets: [{ kg: 60, reps: 8, type: 'N', done: false, rm1: 0 }, { kg: 60, reps: 8, type: 'N', done: false, rm1: 0 }] });
const EX1 = () => ({ name: 'Rowing Barre (Tirage Horizontal)', sets: [{ kg: 60, reps: 8, type: 'N', done: true, rm1: 0 }, { kg: 60, reps: 8, type: 'N', done: false, rm1: 0 }] });
const { jourParis } = require('../_jour.js');   // RECETTE-01 : le jour de Paris, comme la page
const W = (o) => Object.assign({ date: jourParis(), exs: [] }, o);
// Les 8 états de la matrice (+ la ligne fantôme : un objet cardio à 0 min n'est pas un travail).
const ETATS = [
  ['1 rien', null, 'RIEN'],
  ['1b cardio ouvert à 0 min', W({ cardio: C(0), cardioAvant: C(0) }), 'RIEN'],
  ['2 cardio seul', W({ cardio: C(20) }), 'TRAVAIL'],
  ['3 échauffement seul', W({ cardioAvant: C(10) }), 'TRAVAIL'],
  ['4 cardio + échauffement', W({ cardioAvant: C(10), cardio: C(20) }), 'TRAVAIL'],
  ['5 exercice, 0 série', W({ exs: [EX0()] }), 'PREPARATION'],
  ['6 exercice + série faite', W({ exs: [EX1()] }), 'TRAVAIL'],
  ['7 cardio + exercice, 0 série', W({ cardio: C(20), exs: [EX0()] }), 'TRAVAIL'],
  ['8 cardio + exercice + série', W({ cardio: C(20), exs: [EX1()] }), 'TRAVAIL'],
];

module.exports.source = function (t, ROOT, fs, path) {
  console.log('\n═══ B-CCCXCV (session-B). LOT 2 — une seule définition du « travail existant » (source) ═══');
  const nu = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const lo = nu('log.js'), co = nu('coach.js');
  const corps = (src, nom) => { const i = src.indexOf('function ' + nom + '('); if (i < 0) return ''; const j = src.indexOf('\nfunction ', i + 10); return src.slice(i, j < 0 ? undefined : j); };
  const et = corps(lo, '_etatTravailWkt'), tap = corps(lo, '_travailAPerdre'), mil = corps(lo, '_startSessionFromMilo'),
        lp = corps(lo, 'loadProg'), lpd = corps(lo, 'loadProgDay'), conf = corps(lo, '_confirmerRemplacementSeance');
  t('① les fonctions sont trouvées (sinon les témoins suivants ne mesurent rien)', et && tap && mil && lp && lpd && conf, [et, tap, mil, lp, lpd, conf].map(x => x.length).join('/'));
  t('② UN seul propriétaire : `_etatTravailWkt` est déclarée une fois, dans log.js seulement',
    (lo.match(/function _etatTravailWkt\(/g) || []).length === 1 && !/function _etatTravailWkt\(/.test(co), '');
  t('③ le cardio compte par ses MINUTES (`_cardioNoteMin`), les séries par `done`', /_cardioNoteMin\(\)\s*>\s*0/.test(et) && /\.done/.test(et), et.slice(0, 200));
  t('④ `_travailAPerdre` ne recompte plus rien : elle lit `_etatTravailWkt()`', /_etatTravailWkt\(\)\s*===\s*'TRAVAIL'/.test(tap) && !/\.done/.test(tap), tap);
  t('⑤ la porte de Milo lit `_etatTravailWkt()` au lieu des seuls exercices', /const active=_etatTravailWkt\(\)!=='RIEN'/.test(mil) && !/const active=S\.wkt/.test(mil), '');
  t('⑥ le programme garde sa règle : question sur TRAVAIL seulement (loadProg et loadProgDay)',
    /_travailAPerdre\(\)\s*&&\s*!\(prog\.days&&prog\.days\.length\)/.test(lp) && /if\(_travailAPerdre\(\)\)/.test(lpd) && /if\(!_travailAPerdre\(\)\)\s*return suite\(\)/.test(conf), '');
  t('⑦ hors périmètre, inchangé : le libellé des cartes Milo lit toujours les exercices (2 endroits)',
    (co.match(/const enCours=\(typeof S!=='undefined'\)&&S\.wkt&&Array\.isArray\(S\.wkt\.exs\)&&S\.wkt\.exs\.length;/g) || []).length === 2, '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCXCVI (session-B). LOT 2 — cardio et échauffement protégés, par Milo et par programme (écran conduit) ═══');
  const js = x => JSON.stringify(x).slice(0, 240);
  const moisPrec = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); })();
  const D = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test', ft4_email: 't@t.t',
    ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_lms: moisPrec, ft4_progs: JSON.stringify(PROG) };
  const ouvrir = async (wkt) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const req = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      req.push(c.action);
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: MILO_TXT, _diag: 'ok', stopReason: 'end_turn', truncated: false, complete: true, continued: false }) });
      if (c.action === 'seanceJson') return r.abort('failed');         // repli de lecture : la carte vient du texte
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    const init = Object.assign({}, D, wkt ? { ft4_wkt: JSON.stringify(wkt) } : {});
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_l2'))return; sessionStorage.setItem('_l2','1'); localStorage.clear();
      const D=${JSON.stringify(init)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    return { cx, pg, errs, req };
  };
  const GARDER = /ov-milo-seance|ov-confirm|ov-prog|mod-prog|ov-day-sel/;
  const clic = async (pg, sel, txt) => {
    for (let k = 0; k < 6; k++) {
      await pg.evaluate(g => document.querySelectorAll('.overlay.open').forEach(o => { if (!new RegExp(g).test(o.id)) o.classList.remove('open'); }), GARDER.source);
      const h = (await pg.evaluateHandle(([s, x]) => [...document.querySelectorAll(s)].find(e => e.offsetParent !== null && (!x || e.textContent.includes(x))) || null, [sel, txt])).asElement();
      if (!h) { await pg.waitForTimeout(250); continue; }
      try { await h.evaluate(x => x.scrollIntoView({ block: 'center' })); await h.click({ timeout: 3000 }); return true; } catch (e) { await pg.waitForTimeout(200); }
    }
    return false;
  };
  const lire = pg => pg.evaluate(() => { const w = S.wkt || {}; let d = null; try { d = JSON.parse(localStorage.getItem('ft4_wkt')); } catch (e) {}
    const r = o => o ? { exs: (o.exs || []).map(e => e.name), faites: (o.exs || []).reduce((n, e) => n + (e.sets || []).filter(s => s.done).length, 0),
      avant: o.cardioAvant ? +o.cardioAvant.duration : null, apres: o.cardio ? +o.cardio.duration : null } : null;
    return { mem: r(w), disque: r(d), etat: (typeof _etatTravailWkt === 'function') ? _etatTravailWkt() : '(absente)',
      question: !!document.querySelector('#ov-milo-seance.open'), confirmation: !!document.querySelector('#ov-confirm.open'),
      texte: ((document.querySelector('#ov-confirm.open #confirm-msg') || {}).textContent || '') + ((document.querySelector('#ov-milo-seance.open') || {}).textContent || ''),
      sessions: (S.sessions || []).length }; });
  const cardioUI = async (pg, moment, min) => {
    await clic(pg, '#nb-log'); await pg.waitForTimeout(300);
    if (!await pg.$(`#log-cardio input[oninput*="'${moment}')"]`)) await clic(pg, '#log-cardio [onclick="toggleCardio()"]');
    await pg.waitForTimeout(200);
    const inp = await pg.$(`#log-cardio input[oninput*="'${moment}')"]`); if (!inp) return false;
    await inp.scrollIntoViewIfNeeded(); await inp.fill(String(min)); await inp.dispatchEvent('input'); await pg.waitForTimeout(150);
    await clic(pg, '#cardio-save-btn'); await pg.waitForTimeout(200); return true;
  };
  const milo = async X => {
    await clic(X.pg, '#nb-coach'); await X.pg.waitForTimeout(400);
    await X.pg.evaluate(() => { S.premium = true; window._premiumPending = false; });
    await X.pg.fill('#coach-inp', DEM); await clic(X.pg, '#coach-send-btn');
    await X.pg.waitForFunction(() => [...document.querySelectorAll('#coach-msgs .coach-seance-carte button')].some(b => /Oui/.test(b.textContent)), null, { timeout: 12000 }).catch(() => {});
    const ok = await clic(X.pg, '#coach-msgs .coach-seance-carte button', 'Oui'); await X.pg.waitForTimeout(600); return ok;
  };
  const programme = async X => {
    await clic(X.pg, '#nb-log'); await X.pg.waitForTimeout(300);
    await clic(X.pg, '[onclick="openProgModal()"]'); await X.pg.waitForTimeout(300);
    /* LOT 1 IMPORT PROGRAMME (07/10/2026) : les boutons de programme visent l'ID (`loadProg("p…")`), plus l'index —
       le sélecteur littéral `loadProg(N)` ne trouvait plus rien. Même bouton, même garantie, visé par l'id. */
    const id0 = await X.pg.evaluate(() => (S.programmes[0] || {}).id || '');
    const ok = await clic(X.pg, '[onclick=\'loadProg("' + id0 + '")\']'); await X.pg.waitForTimeout(500); return ok;
  };
  const identique = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const MILO_NOMS = MILO_EX.map(e => e[0]);
  const tous = [];
  const fermer = async X => { try { await X.cx.close(); } catch (e) {} };
  try {
    // ── LA MATRICE : 9 états × 2 voies ────────────────────────────────────────────────────
    for (const [nom, wkt, attendu] of ETATS) {
      // voie Milo
      const M = await ouvrir(wkt); tous.push(M);
      const mAv = await lire(M.pg); const mOk = await milo(M); const mAp = await lire(M.pg);
      const mDoitDemander = attendu !== 'RIEN';
      t('[Milo · ' + nom + '] classé ' + attendu + ', ' + (mDoitDemander ? 'question « Ajouter / Remplacer », séance intacte' : 'démarre directement'),
        mOk && mAv.etat === attendu && (mDoitDemander
          ? (mAp.question && identique(mAp.mem, mAv.mem) && identique(mAp.disque, mAv.disque))
          : (!mAp.question && identique(mAp.mem.exs, MILO_NOMS))),
        'état ' + mAv.etat + ' · question ' + mAp.question + ' · avant ' + js(mAv.mem) + ' après ' + js(mAp.mem));
      // voie programme
      const P = await ouvrir(wkt); tous.push(P);
      const pAv = await lire(P.pg); const pOk = await programme(P); const pAp = await lire(P.pg);
      const pDoitConfirmer = attendu === 'TRAVAIL';
      t('[Programme · ' + nom + '] ' + (pDoitConfirmer ? 'confirmation avant remplacement, séance intacte' : 'chargé directement, sans confirmation'),
        pOk && (pDoitConfirmer
          ? (pAp.confirmation && identique(pAp.mem, pAv.mem) && identique(pAp.disque, pAv.disque))
          : (!pAp.confirmation && identique(pAp.mem.exs, ['Développé Couché']))),
        'confirmation ' + pAp.confirmation + ' · avant ' + js(pAv.mem) + ' après ' + js(pAp.mem));
      // ce que la confirmation annonce (seulement là où elle apparaît)
      if (nom.startsWith('2 ') || nom.startsWith('8 ')) {
        t('[Programme · ' + nom + '] le message nomme ce qui part vraiment (minutes de cardio' + (nom.startsWith('8') ? ' ET série' : '') + ')',
          /20 min de cardio/.test(pAp.texte) && (!nom.startsWith('8') || /1 série déjà faite/.test(pAp.texte)), pAp.texte.slice(0, 160));
      }
      // réponses à la question sur le cardio seul : Annuler / Remplacer (Milo) · Annuler / Remplacer (programme)
      if (nom.startsWith('2 ')) {
        await clic(M.pg, '#ov-milo-seance button', 'Annuler'); await M.pg.waitForTimeout(250);
        const mAn = await lire(M.pg);
        t('[Milo · cardio seul] « Annuler » : rien ne bouge, le cardio reste (mémoire et disque)', !mAn.question && identique(mAn.mem, mAv.mem) && identique(mAn.disque, mAv.disque), js(mAn.mem));
        await clic(M.pg, '#nb-coach'); await M.pg.waitForTimeout(300);
        await clic(M.pg, '#coach-msgs .coach-seance-carte button', 'Oui'); await M.pg.waitForTimeout(400);
        await clic(M.pg, '#ov-milo-seance button', 'Remplacer'); await M.pg.waitForTimeout(600);
        const mRe = await lire(M.pg);
        t('[Milo · cardio seul] « Remplacer » : les exercices de Milo arrivent ET le cardio noté est gardé (ce que la question annonce)',
          identique(mRe.mem.exs, MILO_NOMS) && mRe.mem.apres === 20 && mRe.disque.apres === 20 && /cardio noté est gardé/.test(mAp.texte), js(mRe.mem) + ' · ' + mAp.texte.slice(0, 120));
        await clic(P.pg, '#confirm-cancel'); await P.pg.waitForTimeout(250);
        const pAn = await lire(P.pg);
        t('[Programme · cardio seul] « Annuler » : aucune perte de cardio (mémoire et disque)', !pAn.confirmation && identique(pAn.mem, pAv.mem) && identique(pAn.disque, pAv.disque), js(pAn.mem));
      }
      if (nom.startsWith('7 ')) {
        await clic(P.pg, '#confirm-ok'); await P.pg.waitForTimeout(400);
        const pOui = await lire(P.pg);
        t('[Programme · cardio + exercice] « Remplacer » confirmé : le programme se charge vraiment (fonction non cassée)', identique(pOui.mem.exs, ['Développé Couché']), js(pOui.mem));
      }
      t('[' + nom + '] aucune séance ajoutée à l\'historique par ces gestes', mAp.sessions === 0 && pAp.sessions === 0, mAp.sessions + '/' + pAp.sessions);
      await fermer(M); await fermer(P);
    }

    // ── RECHARGEMENT : créé par l'écran → vrai rechargement → tentative (classification identique) ──
    const RELOAD = [['cardio seul', null, 'apres', 20], ['échauffement seul', null, 'avant', 10], ['cardio + exercice', W({ exs: [EX0()] }), 'apres', 20]];
    for (const [nom, base, moment, min] of RELOAD) {
      for (const voie of ['Milo', 'Programme']) {
        const X = await ouvrir(base); tous.push(X);
        const cree = await cardioUI(X.pg, moment, min); const e0 = await lire(X.pg);
        await X.pg.reload(); await X.pg.waitForTimeout(1500);
        const e1 = await lire(X.pg);
        const ok = voie === 'Milo' ? await milo(X) : await programme(X);
        const e2 = await lire(X.pg);
        t('[Rechargement · ' + nom + ' · ' + voie + '] saisi par l\'écran, même classement après rechargement, et protégé',
          cree && ok && e0.etat === 'TRAVAIL' && e1.etat === 'TRAVAIL' && identique(e1.disque, e0.disque)
          && (voie === 'Milo' ? e2.question : e2.confirmation) && identique(e2.mem, e1.mem),
          'avant ' + e0.etat + ' · après rechargement ' + e1.etat + ' · question ' + (e2.question || e2.confirmation) + ' ' + js(e2.mem));
        await fermer(X);
      }
    }

    // ── NON-DESTRUCTION HORS DES DEUX PORTES : un type de séance lancé sur un cardio seul ──────
    const T = await ouvrir(W({ cardio: C(20) })); tous.push(T);
    const tt = await T.pg.evaluate(() => { const d = Object.keys(DISC_SEANCE || {})[0]; if (!d) return null; lancerTypeSeance(d); return { d, apres: S.wkt.cardio && +S.wkt.cardio.duration, exs: (S.wkt.exs || []).length }; });
    t('[Type de séance · cardio seul] `lancerTypeSeance` ajoute les exercices et garde le cardio (pourquoi elle n\'est pas modifiée)', !!tt && tt.apres === 20 && tt.exs > 0, js(tt));

    const errs = tous.flatMap(X => X.errs);
    t('aucune erreur JavaScript dans les pages conduites', errs.length === 0, js(errs.slice(0, 3)));
  } finally { for (const X of tous) await fermer(X); }
};
