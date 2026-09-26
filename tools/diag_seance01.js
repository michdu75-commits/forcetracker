#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-01 — DIAGNOSTIC FORENSIQUE : OÙ UNE SÉANCE PERD-ELLE DES EXERCICES ? (26/09/2026)

   ⛔ INSTRUMENT DE MESURE, PAS UN TÉMOIN : il ne rend ni vert ni rouge, il COMPTE. Il n'est pas
   branché dans la passe complète — certaines mesures décrivent un défaut que Michel n'a pas encore
   décidé de corriger, et un témoin rouge bloquerait toute publication.
   ⛔ 0 appel réel : l'app servie est conduite dans un navigateur, le Worker est SIMULÉ.

   Ce qu'il CONDUIT : les fonctions réelles de l'app (coach.js, log.js) — `_ressembleASeance`,
   `_seanceDepuisTexte`, `_extractDaySession`, `_cerveletFidele`, `_normalizeMiloSession`,
   `_startSessionFromMilo` → `S.wkt` ; puis `sendToCoach` de bout en bout (arrivée, traduction
   réussie / lente / en panne, carte, tap, rechargement du fil, « Mes discussions »).
   Ce qu'il OBSERVE : le NOMBRE d'exercices à chaque étage, les cartes posées, les appels.
   Ce qu'il NE COUVRE PAS : la qualité de la traduction réelle (un modèle), la latence réelle
   du service, et le texte exact que Milo a écrit pendant la vérification de ft-v1235 (non gardé).

   Usage : node tools/diag_seance01.js [--vite]   (--vite : saute les parcours à 12 s d'attente)
   ═══════════════════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const VITE = process.argv.includes('--vite');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png',
  '.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.jpg':'image/jpeg'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });

// ── LA SÉANCE DU BRIEF (§5) : 4 exercices, charges, repos, consignes ──────────────────────────
const E = [
  { n: 'Développé couché', s: 4, r: 6, kg: 80, rest: '2 min 30', sec: 150, cue: 'omoplates serrées, pieds ancrés au sol' },
  { n: 'Rowing barre', s: 4, r: 8, kg: 60, rest: '2 min', sec: 120, cue: 'dos neutre, tire la barre vers le nombril' },
  { n: 'Développé militaire', s: 3, r: 8, kg: 40, rest: '2 min', sec: 120, cue: 'gainage fort, ne cambre pas' },
  { n: 'Extension triceps', s: 3, r: 12, kg: 20, rest: '90 s', sec: 90, cue: 'coudes fixes, descente contrôlée' },
];
const INTRO = 'Voilà ta séance haut du corps pour ce soir 💪\n\n', FIN = '\n\nBonne séance, concentre-toi sur la technique.';
const F = {
  'F1 une ligne complète, numérotée (format demandé par le prompt)': E.map((e, i) => `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n'),
  'F2 une ligne complète, puces': E.map(e => `- ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n'),
  'F3 une ligne courte « @ »': E.map(e => `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg`).join('\n'),
  'F4 bloc : nom / séries / consigne': E.map(e => `**${e.n}**\n${e.s}×${e.r} à ${e.kg} kg — repos ${e.rest}\n${e.cue}`).join('\n\n'),
  'F5 « 4 séries de 6 à 80 kg »': E.map(e => `${e.n} — ${e.s} séries de ${e.r} à ${e.kg} kg — repos ${e.rest}`).join('\n'),
  'F6 gras en ligne + parenthèse': E.map(e => `- **${e.n}** : ${e.s} × ${e.r} à ${e.kg} kg (repos ${e.rest})`).join('\n'),
  'F7 mixte : 2 courtes + 2 complètes': E.map((e, i) => i < 2 ? `${e.n} : ${e.s}×${e.r} @ ${e.kg} kg` : `${i + 1}. ${e.n} — ${e.s}×${e.r} à ${e.kg} kg, repos ${e.rest} — ${e.cue}`).join('\n'),
  'F8 tableau Markdown': '| Exercice | Séries × reps | Charge | Repos |\n|---|---|---|---|\n' + E.map(e => `| ${e.n} | ${e.s}×${e.r} | ${e.kg} kg | ${e.rest} |`).join('\n'),
  'F9 gras + points médians': E.map(e => `**${e.n}** — ${e.s}×${e.r} · ${e.kg} kg · repos ${e.rest}`).join('\n'),
  'F10 nom sans charge « 4×6 »': E.map(e => `${e.n} 4×6`.replace('4×6', `${e.s}×${e.r}`)).join('\n'),
};
// ── LES CAS LIMITES DU BRIEF (§6), chacun avec son attendu ──────────────────────────────────
const S = {
  'S1 4 exercices simples': { n: 4, t: 'Développé couché 4×6 80 kg\nRowing barre 4×8 60 kg\nDéveloppé militaire 3×8 40 kg\nExtension triceps 3×12 20 kg' },
  'S2 accent': { n: 4, t: 'Élévations latérales 3×15 8 kg\nDéveloppé couché 4×6 80 kg\nTirage vertical 4×10 50 kg\nÉcarté poulie 3×12 15 kg' },
  'S3 nom hors catalogue': { n: 4, t: 'Pompes diamant lestées 3×10 10 kg\nDéveloppé couché 4×6 80 kg\nRowing Yates tempo 3×8 50 kg\nExtension triceps 3×12 20 kg' },
  'S4 séries 3×12': { n: 4, t: 'Curl biceps 3×12 12 kg\nExtension triceps 3×12 20 kg\nÉlévations latérales 3×12 8 kg\nFace pull 3×12 20 kg' },
  'S5 notation 12/10/8/8': { n: 4, t: 'Développé couché — 12/10/8/8 à 60 kg\nRowing barre — 12/10/8/8 à 50 kg\nDéveloppé militaire — 12/10/8 à 30 kg\nExtension triceps — 15/12/10 à 15 kg' },
  'S6 repos 90 s': { n: 4, t: 'Développé couché 4×6 80 kg, repos 90 s\nRowing barre 4×8 60 kg, repos 90 s\nDéveloppé militaire 3×8 40 kg, repos 90 s\nExtension triceps 3×12 20 kg, repos 90 s' },
  'S7 charge au ressenti': { n: 4, t: 'Développé couché — 4×6 au ressenti\nRowing barre — 4×8 au ressenti\nDéveloppé militaire — 3×8 au ressenti\nExtension triceps — 3×12 au ressenti' },
  'S8 superset accessoires': { n: 4, t: 'Développé couché 4×6 80 kg\nRowing barre 4×8 60 kg\nCurl biceps 3×12 12 kg (en superset avec l\'extension)\nExtension triceps 3×12 20 kg (en superset avec le curl)' },
  'S9 cardio avant + 4 + cardio après': { n: 4, t: 'Échauffement : 8 min de vélo léger\nDéveloppé couché 4×6 80 kg\nRowing barre 4×8 60 kg\nDéveloppé militaire 3×8 40 kg\nExtension triceps 3×12 20 kg\nRetour au calme : 10 min d\'elliptique' },
  'S10 texte entre les exercices': { n: 4, t: 'On commence lourd.\nDéveloppé couché 4×6 80 kg\nPrends ton temps entre les séries, c\'est la clé du jour.\nRowing barre 4×8 60 kg\nEnsuite on passe aux épaules.\nDéveloppé militaire 3×8 40 kg\nEt pour finir les bras :\nExtension triceps 3×12 20 kg' },
  'S11 Markdown puces / numéros / gras': { n: 4, t: '1. **Développé couché** 4×6 80 kg\n2. **Rowing barre** 4×8 60 kg\n- **Développé militaire** 3×8 40 kg\n- **Extension triceps** 3×12 20 kg' },
  'S12 longue réponse, 3 et 4 à la fin': { n: 4, t: 'Développé couché 4×6 80 kg\nRowing barre 4×8 60 kg\n' + 'Quelques mots sur la récupération : dors bien, hydrate-toi, et garde une alimentation riche en protéines pour soutenir le travail de la semaine.\n'.repeat(12) + 'Développé militaire 3×8 40 kg\nExtension triceps 3×12 20 kg' },
};
const CERVELET_OK = { status: 'ok', seance: { label: 'Haut du corps', exs: E.map(e => ({ name: e.n, note: e.cue,
  sets: Array.from({ length: e.s }, () => ({ reps: e.r, kg: e.kg, type: 'N', rest: e.sec })) })) } };
const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

(async () => {
  await new Promise(r => srv.listen(0, r)); const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ouvrir = async (routeur) => {
    const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
    await cx.route(/script\.google\.com|supabase\.co/, r => r.abort());
    const appels = [];
    await cx.route(/workers\.dev/, async r => { let c = {}; try { c = r.request().postDataJSON() || {}; } catch (e) {}
      const t0 = Date.now(); appels.push({ action: c.action || '', t: t0 });
      return routeur(r, c); });
    const pg = await cx.newPage(); const errs = []; pg.on('pageerror', x => errs.push(x.message));
    await pg.addInitScript(`(()=>{try{ if(sessionStorage.getItem('_d01'))return; sessionStorage.setItem('_d01','1'); localStorage.clear();
      const D={ft4_bw:'80',ft4_age:'40',ft4_ht:'178',ft4_gender:'H',ft4_goal:'force',ft4_ob2:'1',ft4_name:'Test','ft4_devtoken':'${'f'.repeat(64)}'};
      Object.keys(D).forEach(k=>localStorage.setItem(k,D[k]));}catch(e){}})();`);
    await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open')); S.premium = true; window._premiumPending = false; });
    return { cx, pg, appels, errs };
  };

  // ═══ A. LES ÉTAGES, UN PAR UN (fonctions réelles, aucun réseau) ═══════════════════════════════
  const { cx: cxA, pg: pgA } = await ouvrir(r => r.abort());
  const etages = async (texte, attendus) => pgA.evaluate(([texte, attendus]) => {
    const n0 = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const lu = (liste, nom) => (liste || []).some(e => { const a = n0(e.name), x = n0(nom); return a.includes(x) || x.includes(a); });
    const out = { ressemble: _ressembleASeance(texte) };
    const f = _seanceDepuisTexte(texte); out.filet = f ? f.exs.length : 0; out.filetNoms = f ? f.exs.map(e => e.name) : [];
    const d = _extractDaySession(texte); out.extract = d && d.sess ? d.sess.exs.length : 0;
    const nz = d && d.sess ? _normalizeMiloSession(d.sess) : null; out.normalise = nz ? nz.exs.length : 0;
    out.wkt = 0; out.cardio = null; out.wktNoms = [];
    if (nz && nz.exs.length) { S.wkt = null; const i = _pendingMiloSessions.push(nz) - 1; try { _startSessionFromMilo(i); } catch (e) { out.err = e.message; }
      out.wkt = (S.wkt && S.wkt.exs || []).length; out.wktNoms = (S.wkt && S.wkt.exs || []).map(e => e.name);
      out.cardio = S.wkt ? Object.keys(S.wkt).filter(k => /cardio/i.test(k)).map(k => k + ':' + JSON.stringify(S.wkt[k])).join(' ') : null; S.wkt = null; }
    // pour chaque exercice ATTENDU absent du filet : la ligne qui le porte, sa longueur, et si elle se lit SEULE
    out.manquants = (attendus || []).filter(nom => !lu(f && f.exs, nom)).map(nom => {
      const l = String(texte).split('\n').find(x => n0(x).includes(n0(nom))) || '';
      const seule = _seanceDepuisTexte(l + '\n' + l); return { nom, long: l.replace(/\*\*/g, '').trim().length, seuleLue: !!(seule && seule.exs.length) }; });
    return out;
  }, [texte, attendus]);
  console.log('\n═══ A. FORMATS DE LA SÉANCE DU BRIEF (4 exercices) — nombre à chaque étage ═══');
  console.log('   format'.padEnd(64) + 'ress. filet extr. norm. S.wkt   manquants (longueur · lu seul ?)');
  const RA = {};
  for (const [k, corps] of Object.entries(F)) {
    const x = await etages(INTRO + corps + FIN, E.map(e => e.n)); RA[k] = x;
    console.log('   ' + k.padEnd(61) + String(x.ressemble).padEnd(6) + String(x.filet).padStart(5) + String(x.extract).padStart(6)
      + String(x.normalise).padStart(6) + String(x.wkt).padStart(6) + '   ' + x.manquants.map(m => m.nom + ' (' + m.long + ' car · ' + (m.seuleLue ? 'oui' : 'non') + ')').join(' ; '));
  }
  console.log('\n═══ A. CAS LIMITES §6 — attendu / détecté / normalisé / chargé ═══');
  const RS = {};
  for (const [k, c] of Object.entries(S)) {
    const noms = c.t.split('\n').map(l => (l.match(/^(?:\d+\.\s*|-\s*)?(?:\*\*)?([A-Za-zÀ-ÿ' ]+?)(?:\*\*)?\s*(?:—|\s\d)/) || [])[1]).filter(Boolean).filter(n => !/^(Échauffement|Retour|On|Prends|Ensuite|Et|Quelques)/.test(n));
    const x = await etages(INTRO + c.t + FIN, noms); RS[k] = x;
    console.log('   ' + k.padEnd(40) + ' attendu ' + c.n + ' · ressemble ' + x.ressemble + ' · filet ' + x.filet + ' · extr ' + x.extract + ' · norm ' + x.normalise
      + ' · S.wkt ' + x.wkt + (x.cardio ? ' · cardio ' + x.cardio : '') + (x.manquants.length ? '  ⟶ manquants : ' + x.manquants.map(m => m.nom + ' (' + m.long + ' car, seule ' + (m.seuleLue ? 'lue' : 'NON lue') + ')').join(' ; ') : ''));
  }
  // le cervelet PARFAIT : combien en garde `_cerveletFidele` face à chaque format ?
  console.log('\n═══ A. TRADUCTION PARFAITE (4 noms exacts) filtrée par `_cerveletFidele` contre chaque format ═══');
  for (const [k, corps] of Object.entries(F)) {
    const n = await pgA.evaluate(([s, t]) => { const r = _cerveletFidele(s, t); return r ? r.exs.length : 'null (→ filet)'; }, [CERVELET_OK.seance, INTRO + corps + FIN]);
    console.log('   ' + k.padEnd(61) + ' garde ' + n);
  }
  const equip = await pgA.evaluate(n => n.map(x => x + ' → ' + (typeof _exEquip === 'function' ? _exEquip(x) : '?')), E.map(e => e.n).concat(['Rameur', 'Vélo']));
  console.log('\n   _exEquip (étage cardio de _appliqueMiloSession) : ' + equip.join(' · '));
  await cxA.close();

  // ═══ B. DE BOUT EN BOUT : sendToCoach, Worker simulé ════════════════════════════════════════
  const DEMANDE = 'Donne-moi une séance haut du corps pour ce soir, 4 exercices';
  const env = (reply, stop) => ({ reply, _diag: 'ok', _model: 'claude-sonnet-4-6', stopReason: stop || 'end_turn',
    truncated: stop === 'max_tokens', complete: (stop || 'end_turn') === 'end_turn', continued: false });
  const parcours = async (nom, texte, cervelet, suite) => {
    const t0 = Date.now();
    const { cx, pg, appels, errs } = await ouvrir(async (r, c) => {
      if (c.action === 'coach') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(env(texte, suite && suite.stop)) });
      if (c.action === 'seanceJson') {
        if (cervelet === 'panne') return r.abort('failed');
        if (cervelet === 'lent') { await new Promise(z => setTimeout(z, 13000)); try { await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CERVELET_OK) }); } catch (e) {} return; }
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CERVELET_OK) });
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
    });
    const res = await pg.evaluate(async ([DEMANDE, suite]) => {
      const attendre = async (f, ms) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = f(); if (v) return v; } catch (e) {} await new Promise(z => setTimeout(z, 200)); } return null; };
      const bulle = () => { const b = document.querySelectorAll('.msg-coach'); return b[b.length - 1]; };
      const etat = () => { const x = bulle(); if (!x) return {};
        const bt = [...x.querySelectorAll('.coach-prog-save button')].map(e => e.textContent.trim());
        return { cartes: x.querySelectorAll('.coach-prog-save').length, questions: (x.textContent.match(/Cette séance te convient/g) || []).length,
                 oui: bt.filter(s => /Oui, (on démarre|utiliser)/.test(s)), echec: !!x.querySelector('.milo-ask-fail'), marqueur: !!x.querySelector('.coach-coupee') }; };
      const nEx = s => { const m = String(s || '').match(/\((\d+) exercices?\)/); return m ? +m[1] : null; };
      const T = Date.now(); const jal = [];
      await sendToCoach(DEMANDE);
      jal.push(['arrivée', Date.now() - T, etat()]);
      await attendre(() => { const e = etat(); return e.oui && e.oui.length; }, 16000);
      jal.push(['carte', Date.now() - T, etat()]);
      await new Promise(z => setTimeout(z, 2500));                       // un résultat tardif poserait-il une 2ᵉ carte ?
      jal.push(['+2,5 s', Date.now() - T, etat()]);
      let wkt = null, e = etat(); const x = bulle();
      let b1 = x && [...x.querySelectorAll('.coach-prog-save button')].find(z => /Oui, (on démarre|utiliser)/.test(z.textContent));
      if (b1 && nEx(b1.textContent) == null) {                            // la question : construite AU TAP
        b1.click(); await attendre(() => [...x.querySelectorAll('.coach-prog-save button')].find(z => nEx(z.textContent) != null) || x.querySelector('.milo-ask-fail'), 16000);
        jal.push(['après tap', Date.now() - T, etat()]);
        b1 = [...x.querySelectorAll('.coach-prog-save button')].find(z => nEx(z.textContent) != null);
      }
      const carteN = b1 ? nEx(b1.textContent) : null;
      if (suite && suite.recharger) {                                     // rechargement du fil
        for (let k = 0; k < suite.recharger; k++) { _saveCoachHist(); coachHistory = []; _pendingMiloSessions.length = 0; _loadCoachHist(); _renderCoachThread(); await new Promise(z => setTimeout(z, 300)); }
        const x2 = bulle(); const bb = x2 && [...x2.querySelectorAll('.coach-prog-save button')].find(z => /Oui/.test(z.textContent));
        jal.push(['rechargé ×' + suite.recharger, Date.now() - T, etat()]); b1 = bb || null;
      }
      if (suite && suite.discussions) {                                   // « Mes discussions » : ranger puis rouvrir
        newCoachChat(); const id = (S.coachConversations[0] || {}).id; loadCoachConv(id); await new Promise(z => setTimeout(z, 400));
        const x2 = bulle(); const bb = x2 && [...x2.querySelectorAll('.coach-prog-save button')].find(z => /Oui/.test(z.textContent));
        jal.push(['Mes discussions', Date.now() - T, etat()]); b1 = bb || null;
      }
      const carteFinale = b1 ? nEx(b1.textContent) : null;
      if (b1 && carteFinale != null) { S.wkt = null; b1.click(); wkt = await attendre(() => (S.wkt && S.wkt.exs && S.wkt.exs.length) || 0, 6000) || 0; }
      return { jal, carteN, carteFinale, wkt, noms: (S.wkt && S.wkt.exs || []).map(e => e.name) };
    }, [DEMANDE, suite || {}]);
    res.appels = appels.map(a => a.action + '@' + Math.round((a.t - t0) / 100) / 10 + 's'); res.errs = errs;
    await cx.close();
    const court = j => j.map(([k, ms, e]) => k + ' ' + (ms / 1000).toFixed(1) + 's [cartes ' + e.cartes + ', questions ' + e.questions + ', oui ' + JSON.stringify(e.oui) + (e.echec ? ', ÉCHEC LECTURE' : '') + (e.marqueur ? ', marqueur' : '') + ']').join(' → ');
    console.log('\n   ' + nom + '\n      ' + court(res.jal) + '\n      carte « Oui » : ' + res.carteN + ' ex. · carte finale : ' + res.carteFinale + ' ex. · S.wkt : ' + res.wkt
      + ' · appels : ' + res.appels.filter(a => !/^(|summarizeCoach)@/.test(a)).join(', ') + (res.errs.length ? ' · ERREURS ' + res.errs.join(' | ') : ''));
    return res;
  };
  console.log('\n═══ B. DE BOUT EN BOUT (sendToCoach, Worker simulé, 0 appel réel) ═══');
  const t7 = INTRO + F['F7 mixte : 2 courtes + 2 complètes'] + FIN, t1 = INTRO + F['F1 une ligne complète, numérotée (format demandé par le prompt)'] + FIN;
  const RB = {};
  RB.b1 = await parcours('B1 F7 (le filet en lit 2) + traduction RÉUSSIE', t7, 'ok');
  RB.b3 = await parcours('B3 F7 + traduction EN PANNE (réseau)', t7, 'panne');
  RB.b5 = await parcours('B5 F7 + traduction réussie, puis fil RECHARGÉ deux fois', t7, 'ok', { recharger: 2 });
  RB.b6 = await parcours('B6 F7 + traduction réussie, puis rangée et rouverte depuis « Mes discussions »', t7, 'ok', { discussions: true });
  RB.b7 = await parcours('B7 F1 (le filet en lit 0) + traduction EN PANNE → question, tap', t1, 'panne');
  RB.b8 = await parcours('B8 F1 + traduction réussie', t1, 'ok');
  const tMem = INTRO + F['F3 une ligne courte « @ »'] + FIN + '\n```json\n{"retiens":["préfère les séances courtes le soir"]}\n```';
  RB.b9 = await parcours('B9 F3 + une proposition de MÉMOIRE dans la même réponse, traduction réussie', tMem, 'ok');
  RB.b10 = await parcours('B10 F3 + réponse COUPÉE (max_tokens), rangée et rouverte depuis « Mes discussions »', INTRO + F['F3 une ligne courte « @ »'] + FIN, 'ok', { stop: 'max_tokens', discussions: true });
  if (!VITE) {
    RB.b2 = await parcours('B2 F7 + traduction LENTE (13 s > délai de 12 s)', t7, 'lent');
    RB.b4 = await parcours('B4 F1 + traduction LENTE à l\'arrivée ET au tap', t1, 'lent');
  }
  await b.close(); srv.close();
  fs.writeFileSync(path.join(process.env.DIAG_OUT || '/tmp', 'diag_seance01.json'), JSON.stringify({ RA, RS, RB }, null, 1));
  console.log('\n(résultats bruts : ' + path.join(process.env.DIAG_OUT || '/tmp', 'diag_seance01.json') + ')');
})().catch(e => { console.error('PLANTAGE ' + (e && e.stack || e)); process.exit(2); });
