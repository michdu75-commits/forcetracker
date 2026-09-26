/* ═══════════════════════════════════════════════════════════════════════════════════════
   📄 PUBLICATION MILO-PDF1 — CE QU'UNE RÉPONSE INCOMPLÈTE A LE DROIT DE PRODUIRE (26/09/2026)

   Deux questions posées AVANT de publier l'app, mesurées dans l'app servie (0 appel réel) :
     · D-027 (Michel) — le bouton « Enregistrer ce programme » PEUT rester sous une réponse
       globalement incomplète UNIQUEMENT si le bloc JSON est lui-même complet, accepté par le
       parseur, de schéma valide, et qu'aucun JSON partiel n'est réparé ni enregistré.
       Mesuré : c'était DÉJÀ exactement le comportement → rien n'a changé, on le FIGE.
     · D-028 (Michel) — l'« annonce de la prochaine séance » n'était PAS informative : sous une
       réponse coupée ou non confirmée, un bloc « prevu » complet écrivait S.nextPlanned en
       mémoire, sur le disque (`ft4_nextplanned`) et vers le cloud. Décision : même règle que la
       séance (D-025) — une réponse non confirmée terminée n'enregistre pas l'annonce.
     .source : ce qui est écrit.   .ecran : sendToCoach conduit dans le navigateur, Worker simulé.
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
  const C = _sansCommentaires(fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8'));
  console.log('\n═══ B-CCCLXXXIV. D-027 / D-028 — programme et prochaine séance sous une réponse incomplète (source) ═══');
  const chat = _corps(C, 'async function sendToCoach(');
  const appels = (C.match(/_extractPlannedSession\(/g) || []).length;   // la définition + UN appel
  t('B-CCCLXXXIV ① D-028 : l\'annonce n\'est LUE que si la réponse est confirmée complète — un seul appel, derrière la garde',
    /const _plan = _coupee \? null : _extractPlannedSession\(reply\);/.test(chat) && appels === 2, 'appels=' + appels);
  const ecrit = (C.match(/S\.nextPlanned\s*=\s*_plan\b/g) || []).length;
  t('B-CCCLXXXIV ② D-028 : S.nextPlanned n\'est écrit depuis le chat qu\'à UN endroit, et seulement depuis `_plan`',
    ecrit === 1 && /if \(_plan\) \{ try \{ S\.nextPlanned = _plan; persist\(\);/.test(chat), 'ecritures=' + ecrit);
  const ext = _corps(C, 'function _extractForceProgram(');
  t('B-CCCLXXXIV ③ D-027 : le programme se lit par JSON.parse STRICT — aucune réparation, un échec rend null',
    /const prog=JSON\.parse\(jsonStr\.trim\(\)\);/.test(ext) && /catch\(e\)\{[^}]*return null;\}/.test(ext)
    && !/repeat\(|jsonrepair|\+\s*['"][\]}]/.test(ext), ext.slice(0, 120));
  const btn = _corps(C, 'function _appendSaveProgBtn(');
  t('B-CCCLXXXIV ④ D-027 : le bouton refuse un programme vide et n\'enregistre RIEN tant qu\'on n\'appuie pas',
    /if\(\(!norm\.days\|\|!norm\.days\.length\)&&\(!norm\.exs\|\|!norm\.exs\.length\)\)return;/.test(btn)
    && !/persist\(|S\.programmes|_cloudSync/.test(btn), '');
};

module.exports.ecran = async function (t, b, PORT) {
  console.log('\n═══ B-CCCLXXXV. D-027 / D-028 — ce que produit une réponse incomplète (écran conduit) ═══');
  const PROG = { name: 'Force Big 3', days: [
    { label: 'Jour 1 — Squat', exs: [{ name: 'Squat à la Barre', sets: [{ kg: 100, reps: 5, type: 'N', rest: 180 }] }] },
    { label: 'Jour 2 — Développé', exs: [{ name: 'Développé Couché', sets: [{ kg: 80, reps: 5, type: 'N', rest: 180 }] }] }] };
  const J = JSON.stringify(PROG);
  // Coupé APRÈS la 1ʳᵉ journée fermée : une réparation par pile (`]}`) le rendrait valide (1 séance) → le parseur doit refuser.
  const J_JOUR1 = J.slice(0, J.indexOf(']}]}') + 4);
  const TXT = 'Voici ton programme force sur 3 lifts.\n\n';
  const env = (reply, stop) => ({ reply, _diag: 'ok', stopReason: stop, truncated: stop === 'max_tokens', complete: stop === 'end_turn', continued: false });
  const P = {
    complet:     env(TXT + '```json\n' + J + '\n```', 'end_turn'),
    coupeApres:  env(TXT + '```json\n' + J + '\n```\nPour la semaine 2, augmente de 2,5 kg sur le squ', 'max_tokens'),
    coupeDedans: env(TXT + '```json\n' + J_JOUR1, 'max_tokens'),
    coupeNu:     env(TXT + J_JOUR1, 'max_tokens'),
    schemaVide:  env(TXT + '```json\n' + JSON.stringify({ name: 'X', days: [] }) + '\n```\nsuite coup', 'max_tokens'),
    refus:       env(TXT + '```json\n' + J + '\n```', 'refusal'),
  };
  const d3 = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  const d5 = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
  const PREVU = '```json\n' + JSON.stringify({ prevu: { date: d3, label: 'Haut du corps' } }) + '\n```';
  const DIT = 'Noté, on se retrouve pour le haut du corps.\n\n';
  const N = {
    complet:    env(DIT + PREVU, 'end_turn'),
    coupeApres: env(DIT + PREVU + '\nEt pense à bien dormir la veil', 'max_tokens'),
    refus:      env(DIT + PREVU, 'refusal'),
    ancien:     { reply: DIT + PREVU, _diag: 'ok' },
    coupeDedans: env(DIT + PREVU.slice(0, PREVU.length - 20), 'max_tokens'),
  };
  const essai = async (envl, mode, avant) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const recus = [];
    await cx.route(/workers\.dev/, r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      recus.push(c.action || '');
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(envl) });
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d027'))return; sessionStorage.setItem('_d027','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    const r = await pg.evaluate(async ([mode, avant]) => {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
      S.premium = true; window._premiumPending = false; S.nextPlanned = avant || null; S.programmes = []; persist();
      if (mode === 'prog') { _forceProgReq = true; await sendToCoach(_buildForceMessage(), _forceDisplayMsg()); }
      else await sendToCoach('Je pense m\'entraîner dans 3 jours, haut du corps');
      await new Promise(z => setTimeout(z, 800));
      const bs = document.querySelectorAll('.msg-coach'); const x = bs[bs.length - 1];
      const bouton = [...x.querySelectorAll('.coach-prog-save button')].map(e => e.textContent.trim());
      const prem = x.firstElementChild;
      const out = { bouton, marqueur: !!(prem && prem.classList.contains('coach-coupee')), texteBloc: /"prevu"|"days"/.test(x.textContent),
        progsAvantClic: (S.programmes || []).length, attente: _pendingForceProgs.length,
        np: S.nextPlanned, disque: localStorage.getItem('ft4_nextplanned') };
      const b1 = x.querySelector('.coach-prog-save button');
      if (b1) { b1.click(); await new Promise(z => setTimeout(z, 200));
        out.progsApresClic = (S.programmes || []).length; out.disqueProgs = /Force Big 3/.test(localStorage.getItem('ft4_progs') || ''); }
      return out;
    }, [mode, avant || null]);
    r.errs = errs; r.appelsCoach = recus.filter(a => a === 'coach').length;
    await cx.close(); return r;
  };
  const RP = {}, RN = {};
  for (const k of Object.keys(P)) RP[k] = await essai(P[k], 'prog');
  for (const k of Object.keys(N)) RN[k] = await essai(N[k], 'prevu');
  const avant = { date: d5, label: 'Jambes' };
  RN.garde = await essai(N.coupeApres, 'prevu', avant);
  const js = (o) => JSON.stringify(o).slice(0, 260);

  t('B-CCCLXXXV P1 réponse COMPLÈTE + JSON complet → bouton ; RIEN d\'enregistré avant le clic, enregistré après (témoin de sensibilité)',
    RP.complet.bouton.length === 1 && /2 séances/.test(RP.complet.bouton[0]) && RP.complet.progsAvantClic === 0
    && RP.complet.progsApresClic === 1 && RP.complet.disqueProgs === true && !RP.complet.marqueur, js(RP.complet));
  t('B-CCCLXXXV P2 D-027 : réponse COUPÉE après un JSON COMPLET → le bouton reste, sous le marqueur ; rien d\'enregistré avant le clic',
    RP.coupeApres.bouton.length === 1 && /2 séances/.test(RP.coupeApres.bouton[0]) && RP.coupeApres.marqueur
    && RP.coupeApres.progsAvantClic === 0, js(RP.coupeApres));
  t('B-CCCLXXXV P3 D-027 : JSON coupé DANS son bloc (1ʳᵉ journée fermée, réparable par `]}`) → aucun bouton, rien en attente',
    RP.coupeDedans.bouton.length === 0 && RP.coupeDedans.attente === 0 && RP.coupeDedans.progsAvantClic === 0, js(RP.coupeDedans));
  t('B-CCCLXXXV P4 D-027 : même JSON coupé SANS clôture de code (lecture de repli) → aucun bouton, aucune réparation',
    RP.coupeNu.bouton.length === 0 && RP.coupeNu.attente === 0, js(RP.coupeNu));
  t('B-CCCLXXXV P5 D-027 : JSON complet mais schéma VIDE (aucune journée) → aucun bouton',
    RP.schemaVide.bouton.length === 0 && RP.schemaVide.attente === 0, js(RP.schemaVide));
  t('B-CCCLXXXV P6 D-027 : fin NON CONFIRMÉE (refusal) + JSON complet → bouton, sous le marqueur',
    RP.refus.bouton.length === 1 && RP.refus.marqueur && RP.refus.progsAvantClic === 0, js(RP.refus));

  const vide = (x) => x.np === null && x.disque === 'null';
  t('B-CCCLXXXV N1 réponse COMPLÈTE + annonce → S.nextPlanned écrit en mémoire ET sur le disque (témoin de sensibilité)',
    RN.complet.np && RN.complet.np.date === d3 && /Haut du corps/.test(RN.complet.disque || '') && !RN.complet.marqueur, js(RN.complet));
  t('B-CCCLXXXV N2 D-028 : réponse COUPÉE après une annonce complète → RIEN d\'écrit (mémoire, disque), marqueur présent',
    vide(RN.coupeApres) && RN.coupeApres.marqueur, js(RN.coupeApres));
  t('B-CCCLXXXV N3 D-028 : fin NON CONFIRMÉE (refusal) → RIEN d\'écrit', vide(RN.refus) && RN.refus.marqueur, js(RN.refus));
  t('B-CCCLXXXV N4 D-028 : serveur SANS le signal (ancien Worker) → RIEN d\'écrit', vide(RN.ancien) && RN.ancien.marqueur, js(RN.ancien));
  t('B-CCCLXXXV N5 annonce coupée DANS son bloc → rien d\'écrit (comme avant)', vide(RN.coupeDedans), js(RN.coupeDedans));
  t('B-CCCLXXXV N6 D-028 : une annonce DÉJÀ enregistrée n\'est ni remplacée ni effacée par une réponse incomplète',
    RN.garde.np && RN.garde.np.date === d5 && RN.garde.np.label === 'Jambes' && new RegExp(d5).test(RN.garde.disque || ''), js(RN.garde));
  t('B-CCCLXXXV N7 le bloc caché reste retiré de l\'affichage, réponse complète ou non',
    Object.keys(RN).every(k => !RN[k].texteBloc), Object.keys(RN).map(k => k + ':' + RN[k].texteBloc).join(' '));
  const tous = Object.values(RP).concat(Object.values(RN));
  t('B-CCCLXXXV S7 1 seul envoi à Milo par message, et aucune erreur de page',
    tous.every(x => x.appelsCoach === 1 && !x.errs.length), tous.map(x => x.appelsCoach + '/' + x.errs.join('|')).join(' ').slice(0, 200));
};
