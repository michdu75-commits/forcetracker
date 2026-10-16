/* ══════════════════════════════════════════════════════════════════════════════════════
   📅 SÉANCE — S-01 « DATE JUSTE » (blocs B-S01-*) — session-B, 16/10/2026, brief de Michel (P1).
   Le défaut, reproduit par l'audit Séance ft-v1255 / ft-v1256 : ouvrir l'onglet Séance crée un
   objet de séance VIDE daté du jour ; il peut rester des jours ; revenu sur Séance autrement que
   par le « + » central, on ajoute un exercice et la séance garde la VIEILLE date (faite le 15/10,
   enregistrée au 01/10). Par le « + » central la date était juste (`startWorkout` renouvelle).

   La règle : une séance prend la date du jour où elle devient RÉELLEMENT une séance.
     · « pas encore commencée » = `_seanceOuverte()` faux (log.js, le propriétaire unique : ni
       exercice, ni chrono démarré, ni cardio noté) — aucune 2ᵉ définition ;
     · une séance RÉELLEMENT commencée garde sa date (reprise J1 → J2 : J1) ;
     · une date CHOISIE par la personne sur la séance vide (sélecteur de date) est gardée.

   Ce que les témoins CONDUISENT : le vrai « + » central, le vrai geste de balayage (TouchEvent sur
   #root, le gestionnaire de screens.js), la vraie carte « type de séance », le vrai sélecteur de date
   `#s-date`, le vrai bouton « Terminer », le rechargement de la page, l'horloge du navigateur.
   Ce qu'ils OBSERVENT : `S.wkt.date`, `ft4_wkt`, `ft4_wkt_draft`, `runId`, la séance enregistrée,
   la barre de date affichée, les clés du stockage.
   Ce qu'ils NE COUVRENT PAS : la porte « cardio noté sur une séance vide » (hors périmètre S-01,
   consignée) ; Milo et les programmes (ils créent un objet neuf daté du jour) ; l'affichage de la
   séance vide AVANT le premier exercice (`renderLog`, non touché).
   ══════════════════════════════════════════════════════════════════════════════════════ */
'use strict';

const J1 = '2026-10-01', J2 = '2026-10-02', J15 = '2026-10-15', J12 = '2026-10-12';
const H = d => d + 'T18:30:00+02:00';
const BASE = { ft4_bw: '80', ft4_age: '40', ft4_ht: '178', ft4_gender: 'H', ft4_goal: 'force', ft4_ob2: '1', ft4_name: 'Test',
  ft4_email: 't@t.t', ft4_devtoken: 'f'.repeat(64), ft4_tester_eq_v1: '1', ft4_ok: '1', ft4_stmig1: '1',
  ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_lms: '2026-09' };
const _det = o => JSON.stringify(o);

async function ecran(t, b, PORT) {
  const ouvrir = async (quand) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris', hasTouch: true });
    await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
    await cx.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_s01'))return; sessionStorage.setItem('_s01','1'); localStorage.clear();
      const D=${JSON.stringify(BASE)}; Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(String(x.message).slice(0, 140)));
    await pg.clock.setFixedTime(new Date(H(quand)));
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    return { cx, pg, errs,
      jour: async (d) => pg.clock.setFixedTime(new Date(H(d))),
      recharger: async () => { await pg.reload(); await pg.waitForTimeout(1500); } };
  };
  const fermerOverlays = pg => pg.evaluate(() => document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')));
  // le VRAI « + » central (startWorkout)
  const plus = async X => { await fermerOverlays(X.pg); await X.pg.click('#nb-log'); await X.pg.waitForTimeout(250); };
  // le VRAI geste : depuis Progrès, un balayage vers la gauche sur #root (gestionnaire de screens.js)
  const glisser = async X => {
    await fermerOverlays(X.pg);
    await X.pg.evaluate(() => goScreen('progress', document.getElementById('nb-progress')));
    await X.pg.waitForTimeout(200);
    await X.pg.evaluate(() => {
      const r = document.getElementById('root');
      const tc = (x, y) => new Touch({ identifier: 1, target: r, clientX: x, clientY: y });
      r.dispatchEvent(new TouchEvent('touchstart', { touches: [tc(320, 420)], changedTouches: [tc(320, 420)], bubbles: true }));
      r.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [tc(90, 425)], bubbles: true }));
    });
    await X.pg.waitForTimeout(250);
    return X.pg.evaluate(() => window._curScreen);
  };
  // le sélecteur d'exercices, mode séance : c'est `addExercise(nom)` que la ligne du catalogue appelle
  const ajouter = (X, nom) => X.pg.evaluate(n => { openExPicker('workout'); addExercise(n); closeExPicker(); return true; }, nom || 'Squat à la Barre');
  const valider = X => X.pg.evaluate(() => { toggleSet(0, S.wkt.exs[0].sets.findIndex(s => !s.done)); return !!S.wkt.startTs; });
  const etat = X => X.pg.evaluate(() => {
    const ls = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const w = ls('ft4_wkt'), dr = ls('ft4_wkt_draft');
    return { date: S.wkt && S.wkt.date, n: S.wkt && (S.wkt.exs || []).length, runId: S.wkt && S.wkt.runId || null,
      lsDate: w && w.date, draftDate: dr && dr.date, ouverte: _seanceOuverte(), ecran: window._curScreen,
      barre: (document.getElementById('s-date-txt') || {}).textContent || '', input: (document.getElementById('s-date') || {}).value || '',
      sessions: (S.sessions || []).map(s => s.date), cles: Object.keys(localStorage).sort() };
  });
  const terminer = async X => {
    await fermerOverlays(X.pg);
    await X.pg.evaluate(() => goScreen('log', document.getElementById('nb-log')));
    await X.pg.waitForTimeout(200);
    /* UX SÉANCE (16/10/2026, R30) — la porte de fin est `terminerSeance()` (« Terminer » de l'en-tête et du bas) : s'il reste des séries de TRAVAIL, elle demande « Terminer quand même ? » et on confirme, comme la personne. La conduite change ; ce que le banc mesure ne change pas. */
    await X.pg.click('.topbar button[onclick="terminerSeance()"]');
    await (async X => { await X.pg.waitForTimeout(150); if (await X.pg.evaluate(() => { const o = document.getElementById('ov-confirm'); return !!(o && o.classList.contains('open')); })) await X.pg.click('#confirm-ok'); })(X);
    await X.pg.waitForTimeout(1600);
    await X.pg.evaluate(() => { try { if (typeof closeSessionEnd === 'function') closeSessionEnd(); } catch (e) {} });
    return X.pg.evaluate(() => (S.sessions || []).map(s => s.date));
  };
  const barreDe = (X, d) => X.pg.evaluate(x => _fmtWktDate(x), d);
  // L'objet VIDE de J1, fabriqué par le vrai chemin : « + » central le 01/10, rien d'autre.
  const vieilleSeanceVide = async () => {
    const X = await ouvrir(J1);
    await plus(X);
    const e = await etat(X);
    return { X, e };
  };

  /* ── A : LE CAS RÉEL — J1 « + » sans rien faire ; J15 on rouvre l'app, on revient sur Séance par le
        balayage, on ajoute un exercice, on valide une série, on termine. ⭐ Témoin ROUGE sur master. ── */
  {
    const { X, e: e0 } = await vieilleSeanceVide();
    await X.jour(J15); await X.recharger();
    const ec = await glisser(X);
    const cles0 = (await etat(X)).cles;
    await ajouter(X);
    const e1 = await etat(X);
    t('B-S01-A1 ⭐ séance vide du 01/10 reprise le 15/10 par le balayage : le 1er exercice la date du 15/10 (S.wkt, ft4_wkt, brouillon)',
      e0.date === J1 && e0.ouverte === false && ec === 'log' && e1.date === J15 && e1.lsDate === J15 && e1.draftDate === J15,
      _det({ avant: e0.date, ecran: ec, date: e1.date, ft4_wkt: e1.lsDate, brouillon: e1.draftDate }));
    t('B-S01-A2 la barre de date affiche le 15/10 dès le 1er exercice (pas l\'ancienne date)',
      e1.barre === await barreDe(X, J15) && e1.input === J15, _det({ barre: e1.barre, input: e1.input }));
    t('B-S01-A3 la séance devenue réelle reçoit son runId (comme avant), et aucune clé de stockage nouvelle n\'apparaît',
      !!e1.runId && e1.cles.filter(k => cles0.indexOf(k) < 0).every(k => k === 'ft4_wkt_draft'),
      _det({ runId: e1.runId, nouvelles: e1.cles.filter(k => cles0.indexOf(k) < 0) }));
    await valider(X);
    const fin = await terminer(X);
    t('B-S01-A4 ⭐ la séance ENREGISTRÉE porte le 15/10 (et pas le 01/10)', fin.length === 1 && fin[0] === J15, _det({ sessions: fin }));
    t('B-S01-A5 aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── P : LES PORTES — même vieille séance vide, quatre façons de revenir. ── */
  {
    const { X } = await vieilleSeanceVide();
    await X.jour(J15); await X.recharger();
    await plus(X);
    await ajouter(X);
    const e = await etat(X);
    t('B-S01-P1 porte « + » central : le 1er exercice date la séance du 15/10 (déjà juste avant S-01, doit le rester)',
      e.date === J15 && e.lsDate === J15, _det({ date: e.date, ft4_wkt: e.lsDate }));
    await X.cx.close();
  }
  {
    // l'app restée OUVERTE (pas de rechargement) : l'horloge passe au 15/10, on revient par le balayage
    const { X } = await vieilleSeanceVide();
    await X.pg.evaluate(() => goScreen('home', document.getElementById('nb-home')));
    await X.jour(J15);
    const ec = await glisser(X);
    await ajouter(X, 'Développé Couché');
    const e = await etat(X);
    t('B-S01-P2 porte « balayage », app restée ouverte du 01/10 au 15/10 : le 1er exercice date la séance du 15/10',
      ec === 'log' && e.date === J15 && e.lsDate === J15, _det({ ecran: ec, date: e.date, ft4_wkt: e.lsDate }));
    t('B-S01-P2b aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    const { X } = await vieilleSeanceVide();
    await X.jour(J15); await X.recharger();
    await glisser(X);
    const carte = await X.pg.evaluate(() => !!document.querySelector('#log-types button.ts-carte'));
    await X.pg.click('#log-types button.ts-carte[onclick*="\'muscu\'"]');
    await X.pg.waitForTimeout(250);
    const e = await etat(X);
    t('B-S01-P3 porte « type de séance » (la vraie carte Musculation) : la séance montée le 15/10 porte le 15/10, et la barre l\'affiche',
      carte && e.n > 0 && e.date === J15 && e.lsDate === J15 && e.barre === await barreDe(X, J15), _det({ carte, n: e.n, date: e.date, ft4_wkt: e.lsDate, barre: e.barre }));
    await X.cx.close();
  }
  {
    const { X } = await vieilleSeanceVide();
    await X.jour(J15); await X.recharger();
    await glisser(X);
    await X.recharger();                                  // on recharge l'app SUR la séance vide, avant tout ajout
    const e0 = await etat(X);
    await glisser(X);
    await ajouter(X);
    await X.recharger();                                  // et encore après : la date tient
    const e = await etat(X);
    t('B-S01-P4 porte « rechargement » : vide rechargée le 15/10 (encore datée du 01/10), puis 1er exercice → 15/10, qui survit à un nouveau rechargement (S.wkt, ft4_wkt, brouillon)',
      e0.date === J1 && e0.ouverte === false && e.date === J15 && e.n === 1 && e.lsDate === J15 && e.draftDate === J15,
      _det({ avantAjout: e0.date, date: e.date, n: e.n, ft4_wkt: e.lsDate, brouillon: e.draftDate }));
    t('B-S01-P4b aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }

  /* ── N : CE QUI NE DOIT PAS BOUGER. ── */
  {
    // ⭐ CAS B : une VRAIE séance commencée le 01/10 (exercice + série validée), reprise le 02/10.
    const X = await ouvrir(J1);
    await plus(X); await ajouter(X); const chrono = await valider(X);
    const e0 = await etat(X);
    await X.jour(J2); await X.recharger();
    const ec = await glisser(X);
    await ajouter(X, 'Développé Couché');
    const e1 = await etat(X);
    t('B-S01-N1 ⭐ CAS B — séance RÉELLEMENT commencée le 01/10 (série validée), reprise le 02/10 par le balayage : elle GARDE le 01/10, et son runId',
      chrono && e0.date === J1 && ec === 'log' && e1.date === J1 && e1.lsDate === J1 && e1.draftDate === J1 && e1.n === 2 && !!e0.runId && e1.runId === e0.runId,
      _det({ chrono, avant: e0.date, date: e1.date, ft4_wkt: e1.lsDate, brouillon: e1.draftDate, n: e1.n, runId: [e0.runId, e1.runId] }));
    const fin = await terminer(X);
    t('B-S01-N1b ⭐ … et la séance enregistrée porte le 01/10', fin.length === 1 && fin[0] === J1, _det({ sessions: fin }));
    t('B-S01-N1c aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
  {
    // reprise par le « + » central aussi : le « + » ne remet pas à zéro une séance ouverte
    const X = await ouvrir(J1);
    await plus(X); await ajouter(X); await valider(X);
    await X.jour(J2); await X.recharger();
    await plus(X); await ajouter(X, 'Développé Couché');
    const e = await etat(X);
    t('B-S01-N2 CAS B par le « + » central : la séance commencée le 01/10 garde le 01/10 le 02/10', e.date === J1 && e.n === 2, _det({ date: e.date, n: e.n }));
    await X.cx.close();
  }
  {
    // des exercices posés le 01/10, aucune série validée : la définition existante dit « ouverte » → date gardée
    const X = await ouvrir(J1);
    await plus(X); await ajouter(X);
    await X.jour(J2); await X.recharger();
    await glisser(X); await ajouter(X, 'Développé Couché');
    const e = await etat(X);
    t('B-S01-N3 exercice posé le 01/10 sans série validée, repris le 02/10 : `_seanceOuverte` dit « ouverte » → le 01/10 est gardé (définition inchangée)',
      e.date === J1 && e.n === 2, _det({ date: e.date, n: e.n }));
    await X.cx.close();
  }
  {
    // chrono démarré (une série validée) puis l'unique exercice retiré : startTs dit « commencée »
    const X = await ouvrir(J1);
    await plus(X); await ajouter(X); await valider(X);
    await X.pg.evaluate(() => rmEx(0)); await X.pg.click('#confirm-ok'); await X.pg.waitForTimeout(200);
    const e0 = await etat(X);
    await X.jour(J2); await X.recharger();
    await glisser(X); await ajouter(X, 'Développé Couché');
    const e = await etat(X);
    t('B-S01-N4 séance commencée le 01/10 (chrono parti) puis vidée de ses exercices, reprise le 02/10 : elle garde le 01/10',
      e0.n === 0 && e0.ouverte === true && e.date === J1, _det({ vide: e0.n, ouverte: e0.ouverte, date: e.date }));
    await X.cx.close();
  }
  {
    // la date CHOISIE par la personne (sélecteur de l'écran Séance) sur la séance vide, avant le 1er exercice
    const { X } = await vieilleSeanceVide();
    await X.jour(J15); await X.recharger();
    await glisser(X);
    await X.pg.evaluate(d => { const i = document.getElementById('s-date'); i.value = d; i.dispatchEvent(new Event('change', { bubbles: true })); }, J12);
    await ajouter(X);
    const e = await etat(X);
    t('B-S01-N5 ⭐ date CHOISIE par la personne sur la séance vide (le 12/10, pour noter une séance passée) puis 1er exercice : le 12/10 est gardé',
      e.date === J12 && e.lsDate === J12 && e.barre === await barreDe(X, J12), _det({ date: e.date, ft4_wkt: e.lsDate, barre: e.barre }));
    await valider(X);
    const fin = await terminer(X);
    t('B-S01-N5b … et la séance enregistrée porte le 12/10', fin.length === 1 && fin[0] === J12, _det({ sessions: fin }));
    await X.cx.close();
  }
  {
    // le jour même : rien ne change
    const X = await ouvrir(J15);
    await glisser(X).catch(() => null);
    await plus(X); await ajouter(X);
    const e = await etat(X);
    t('B-S01-N6 séance vide créée le jour même puis 1er exercice : la date du jour', e.date === J15, _det({ date: e.date }));
    // annulation : la séance part, rien n'est enregistré, l'écran recrée l'objet vide (comme avant, cf. nut_punch01 O9)
    await X.pg.evaluate(() => clearWkt()); await X.pg.click('#confirm-ok'); await X.pg.waitForTimeout(300);
    const a = await etat(X);
    t('B-S01-N7 annulation par le vrai bouton : aucune séance enregistrée, plus de séance ouverte, objet vide recréé par l\'écran, brouillon effacé',
      a.sessions.length === 0 && a.ouverte === false && a.n === 0 && a.draftDate == null, _det({ sessions: a.sessions, ouverte: a.ouverte, n: a.n, brouillon: a.draftDate }));
    t('B-S01-N7b aucune erreur de page', X.errs.length === 0, X.errs.slice(0, 2).join(' | '));
    await X.cx.close();
  }
}

/* Témoins de SOURCE : ce dont dépend le reste (nut_punch01 O9) et ce qui garantit une seule définition. */
function source(t, ROOT, fs, path) {
  const log = fs.readFileSync(path.join(ROOT, 'log.js'), 'utf8');
  const corps = nom => { const i = log.indexOf('function ' + nom + '('); if (i < 0) return ''; let j = log.indexOf('\n}', i); return j < 0 ? '' : log.slice(i, j + 2); };
  t('B-S01-S1 `renderLog` crée toujours l\'objet vide comme avant (nut_punch01 O9 en dépend) — S-01 ne le touche pas',
    corps('renderLog').indexOf('  if(!S.wkt) S.wkt={date:today(),exs:[]};\n  const d=S.wkt.date||today();') >= 0);
  const h = corps('_dateSeanceReelle');
  t('B-S01-S2 une seule définition de « pas encore commencée » : `_dateSeanceReelle` lit `_seanceOuverte()`, n\'écrit aucune clé de stockage',
    !!h && /_seanceOuverte\(\)/.test(h) && !/localStorage|sessionStorage|indexedDB/.test(h), h ? '' : 'fonction absente');
  t('B-S01-S3 `_seanceOuverte` est inchangée (exercices · chrono · cardio noté)',
    corps('_seanceOuverte').indexOf('return !!(S.wkt.startTs || (S.wkt.exs&&S.wkt.exs.length) || _cardioNoteMin()>0);') >= 0);
}

module.exports = { ecran, source };
