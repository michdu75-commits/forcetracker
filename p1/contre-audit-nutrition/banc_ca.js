#!/usr/bin/env node
/* CONTRE-AUDIT NUTRITION (07/11/2026) — banc de REPRODUCTION, lecture seule sur le code applicatif.
   Données FICTIVES uniquement (noms et codes-barres inventés), réseau coupé par le garde des tests, navigateur local.
   Usage : node banc_ca.js <RACINE du dépôt à examiner> <étiquette>
   Il charge l'app RÉELLE de la racine donnée (master ou candidat), pose un journal fictif dans `S.foodLog`, appelle les fonctions
   réelles de l'app et imprime ce qu'elles rendent. Il n'écrit rien dans le dépôt examiné. */
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
const ROOT = path.resolve(process.argv[2] || '.');
const LABEL = process.argv[3] || path.basename(ROOT);
require(path.join(ROOT, 'tests/_garde_reseau.js'));   // le garde réseau des tests du dépôt examiné : fermé par défaut
let chromium; try { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); } catch (e) { ({ chromium } = require('playwright')); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

const OUT = {};
const J = (x) => JSON.stringify(x);

/* ── fabrique de lignes FICTIVES, au format réel d'une ancienne ligne du journal ── */
const FAB = `
window.__FAB = (() => {
  const pad = n => String(n).padStart(2,'0');
  const jour = k => { const t = new Date(); t.setDate(t.getDate()-k); return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate()); };
  let seq = 0;
  const N_OFF = { s:1, m:'p', st:'fiable', qo:'tapee', manque:[], no:[], corr:[], f:{ src:'off', ver:null, fiab:'source', base:'g' } };
  const N_DEC = { s:1, m:'p', st:'declaree', qo:'tapee', manque:[], no:[], corr:[], f:{ src:'utilisateur', ver:null, fiab:'declaree', base:'g' } };
  const N_CIQ = { s:1, m:'p', st:'fiable', qo:'tapee', manque:[], no:[], corr:[], f:{ src:'ciqual', ver:null, fiab:'source', base:'g' } };
  const R = Math.round;
  /* base : 'off' (copie d'un scan, sans preuve indépendante) | 'dec' (déclarée) | 'ciq' */
  function ligne(o) {
    const q = o.q, p = o.p100, u = o.u || 'g';
    seq++;
    const e = { id: 'ca-' + o.tag + '-' + String(seq).padStart(6,'0') + '-' + (10000000 + seq), ts: 1760000000000 + seq * 60000 + (o.k || 0) * 86400000,
      date: jour(o.k), meal: o.meal || 'dejeuner', name: o.name,
      kcal: R(p.kcal * q / 100), prot: R(p.prot * q / 100), carbs: R(p.carbs * q / 100), fat: R(p.fat * q / 100),
      q: q, u: u, per100: p, v: 1,
      saisie: o.base === 'dec' ? 'manuel' : 'code-tape', origine: o.base === 'dec' ? 'utilisateur' : (o.base === 'ciq' ? 'ciqual' : 'off'),
      sourceId: o.sid === undefined ? null : o.sid, etat: o.base === 'dec' ? null : 'tel-que-vendu',
      n2: o.base === 'dec' ? N_DEC : (o.base === 'ciq' ? N_CIQ : N_OFF) };
    return e;
  }
  return { ligne: ligne, jour: jour };
})();
`;

(async () => {
  await new Promise((r) => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: process.env.FT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await cx.newPage();
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push(String(e && e.message || e).slice(0, 200)));
  pg.on('dialog', (d) => d.accept());
  await pg.addInitScript(`(() => { try { if (sessionStorage.getItem('__ca')) return; sessionStorage.setItem('__ca','1'); localStorage.clear();
    localStorage.setItem('ft4_ob2','1'); localStorage.setItem('ft4_guide_shown','1'); localStorage.setItem('ft4_wn_seen','99');
    localStorage.setItem('ft4_foodlog','[]'); localStorage.setItem('ft4_savedfoods','[]'); } catch (e) {} })();` + FAB);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(1500);
  const E = (f, a) => pg.evaluate(f, a);
  /* la table CIQUAL (locale) pour les fiches vérifiables */
  await E(async () => { if (typeof _ciqualCharger === 'function') await _ciqualCharger(); });
  const ciq = await E(() => { const a = (typeof _ciqual === 'object' && _ciqual && _ciqual.a) || []; return { n: a.length }; });
  OUT.ciqual = ciq;
  /* repartir d'un état propre à chaque scénario */
  const reset = (lignes) => E((L) => { window.__ERR = []; S.foodLog = L; S.savedFoods = []; S.hiddenFoods = []; try { _habDernier = { cle: '', t: 0 }; _habEnCours = 0; } catch (e) {} }, lignes);
  const mk = (o) => E((o2) => window.__FAB.ligne(o2), o);

  /* ══════ A. SUGGESTIONS « Ce qu'il te reste » : fiche refusée par le moteur mais utilisée ? ══════ */
  {
    const P_SHAKE = { kcal: 380, prot: 85, carbs: 3, fat: 2 };
    const A1 = [await mk({ tag: 'A1', k: 1, name: 'Isolat fictif A', base: 'off', sid: '3000000000901', p100: P_SHAKE, q: 30 })];
    const A1b = [await mk({ tag: 'A1b', k: 2, name: 'Isolat fictif A', base: 'off', sid: '3000000000901', p100: P_SHAKE, q: 30 })];
    /* témoin vert : même forme, mais déclarée par la personne */
    const A0 = [await mk({ tag: 'A0', k: 1, name: 'Skyr fictif declare', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 150 })];
    await reset(A1.concat(A1b, A0));
    OUT.A_off = await E(() => {
      const vf = _n2FichesVerifiees();
      const al = _mesAliments(40);
      const idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12);
      const ap = (nom) => { const l = S.foodLog.find(x => x.name === nom); const a = _n2Apercu(l, vf); return { ok: a.ok, raison: a.raison && a.raison.code, ligne: !!a.ligne }; };
      const R = _n2Reprise(S.foodLog.find(x => x.name === 'Isolat fictif A'));
      return {
        reprise: { ok: R && R.ok, statut: R && R.statut, fiche: !!(R && R.fiche), ctl: R && R.controleReference && R.controleReference.etat, fn: _n2FicheNonVerifiee(R) },
        mesAliments: al.map(a => ({ n: a.name, per100: !!a.per100, fiche: !!a._fiche, freq: a.freq })),
        apercuIsolat: ap('Isolat fictif A'), apercuSkyr: ap('Skyr fictif declare'),
        idees: idees.map(i => ({ macro: i.macro, texte: i.idee, couvert: i.couvert }))
      };
    });
    /* A2 — CIQUAL : une copie de la ligne qui contredit la TABLE, la plus récente */
    const probe = await E(() => { const a = _ciqual.a; const r = a.find(x => x[4] >= 18 && x[4] <= 30 && x[3] > 0 && x[3] < 220); return r ? { code: r[0], nom: r[1] } : null; });
    if (probe) {
      const tab = await E((c) => { const r = _n2Ctx().ciqual(String(c)); return r ? { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat, nom: r.nom } : null; }, probe.code);
      OUT.A_ciqual_probe = { code: probe.code, table: tab };
      const bon = await mk({ tag: 'A2ok', k: 3, name: 'Poulet fictif T', base: 'ciq', sid: 'ciqual:' + probe.code, p100: { kcal: tab.kcal, prot: tab.prot, carbs: tab.carbs, fat: tab.fat }, q: 100 });
      /* la copie discordante : mêmes nom + identifiant, valeurs différentes (plus récente) */
      const mauvais = await mk({ tag: 'A2bad', k: 0, name: 'Poulet fictif T', base: 'ciq', sid: 'ciqual:' + probe.code, p100: { kcal: Math.round(tab.kcal * 0.62), prot: Math.round(tab.prot * 0.62 * 10) / 10, carbs: tab.carbs, fat: Math.round(tab.fat * 0.62 * 10) / 10 }, q: 100 });
      mauvais.ts = 1760000000000 + 9e9;   // la plus récente
      await reset([bon, mauvais]);
      OUT.A_ciqual = await E(() => {
        const vf = _n2FichesVerifiees();
        const al = _mesAliments(40);
        const l = S.foodLog.filter(x => x.name === 'Poulet fictif T');
        const ap = l.map(x => { const a = _n2Apercu(x, vf); return { id: x.id.slice(0, 12), kcal100: x.per100.kcal, ok: a.ok, raison: a.raison && a.raison.code, nonVerif: _n2FicheNonVerifiee(_n2Reprise(x)) }; });
        const idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12);
        return { apercus: ap, candidat: al.filter(a => a.name === 'Poulet fictif T').map(a => ({ kcal100: a.per100 && a.per100.kcal, prot100: a.per100 && a.per100.prot })), idees: idees.map(i => ({ macro: i.macro, texte: i.idee })) };
      });
    }
  }

  /* ══════ A'. DÉDUPLICATION PAR NOM : un favori non fiable masque-t-il un produit vérifié ? ══════ */
  {
    const probe = await E(() => { const a = _ciqual.a; const r = a.find(x => x[4] >= 18 && x[4] <= 30 && x[3] > 0 && x[3] < 220); return r ? { code: r[0] } : null; });
    const tab = await E((c) => { const r = _n2Ctx().ciqual(String(c)); return { kcal: r.kcal, prot: r.prot, carbs: r.carbs, fat: r.fat }; }, probe.code);
    const ver = await mk({ tag: 'D1', k: 1, name: 'Poulet fictif F', base: 'ciq', sid: 'ciqual:' + probe.code, p100: tab, q: 100 });
    const fav = { name: 'Poulet fictif F', kcal: 200, prot: 20, carbs: 1, fat: 8, t: 1760000000000, q: 100, u: 'g', per100: { kcal: 200, prot: 20, carbs: 1, fat: 8 }, v: 1 };
    await reset([ver]);
    OUT.Aprime = await E((f) => {
      S.savedFoods = [f];
      const al = _mesAliments(40).filter(a => a.name === 'Poulet fictif F');
      const idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12);
      return { candidats: al.map(a => ({ fav: a.fav, fiche: !!a._fiche, per100: !!a.per100 })), idees: idees.map(i => i.idee) };
    }, fav);
  }

  /* ══════ B. IDENTITÉ D'UN REPAS HABITUEL : par le nom seul ══════ */
  {
    const P1 = { kcal: 380, prot: 85, carbs: 3, fat: 2 }, P2 = { kcal: 330, prot: 70, carbs: 10, fat: 3 };
    const L = [];
    /* produit 1 (déclaré, admissible) noté trois jours, produit 2 (copie OFF sans preuve) les deux derniers jours, MÊME NOM */
    for (const k of [6, 5, 4]) L.push(await mk({ tag: 'B1a', k, meal: 'collation', name: 'Isolat fictif B', base: 'dec', sid: null, p100: P1, q: 30 }));
    for (const k of [2, 1]) L.push(await mk({ tag: 'B1b', k, meal: 'collation', name: 'Isolat fictif B', base: 'off', sid: '3000000000911', p100: P2, q: 30 }));
    await reset(L);
    OUT.B_nom = await E(() => {
      const h = _repasHabituels(); const vf = _n2FichesVerifiees();
      return h.map(r => ({ sig: r.sig, n: r.n, meal: r.meal, dernier: r.dernier, items: r.items.map(i => ({ n: i.name, sid: i.sourceId, origine: i.origine })), apercu: (() => { const a = _habApercu(r, vf); return { n: a.n, aVerifier: a.aVerifier, aCompleter: a.aCompleter }; })() }));
    });
    /* collision de signatures : un aliment au nom « Riz+Poulet » contre deux aliments « Riz » et « Poulet » */
    const L2 = [];
    for (const k of [3, 2]) L2.push(await mk({ tag: 'B2a', k, meal: 'diner', name: 'Poulet+Riz', base: 'dec', p100: { kcal: 150, prot: 12, carbs: 15, fat: 3 }, q: 200 }));
    for (const k of [5, 4]) { L2.push(await mk({ tag: 'B2b', k, meal: 'diner', name: 'Riz', base: 'dec', p100: { kcal: 130, prot: 3, carbs: 28, fat: 0.3 }, q: 150 })); L2.push(await mk({ tag: 'B2c', k, meal: 'diner', name: 'Poulet', base: 'dec', p100: { kcal: 165, prot: 31, carbs: 0, fat: 3.6 }, q: 120 })); }
    await reset(L2);
    OUT.B_plus = await E(() => _repasHabituels().map(r => ({ sig: r.sig, n: r.n, items: r.items.map(i => i.name) })));
    /* un nom contenant « :: » */
    const L3 = [];
    for (const k of [3, 2]) L3.push(await mk({ tag: 'B3a', k, meal: 'diner', name: 'Ratio::1', base: 'dec', p100: { kcal: 150, prot: 12, carbs: 15, fat: 3 }, q: 200 }));
    for (const k of [5, 4]) L3.push(await mk({ tag: 'B3b', k, meal: 'diner', name: 'Ratio::2', base: 'dec', p100: { kcal: 130, prot: 3, carbs: 28, fat: 0.3 }, q: 150 }));
    await reset(L3);
    OUT.B_deuxpoints = await E(() => _repasHabituels().map(r => ({ sig: r.sig, n: r.n, items: r.items.map(i => i.name) })));
  }

  /* ══════ C. PORTIONS : g et ml mélangés, lignes masquées ══════ */
  {
    const L = [];
    L.push(await mk({ tag: 'C1a', k: 3, name: 'Shake fictif C', base: 'dec', p100: { kcal: 380, prot: 80, carbs: 5, fat: 4 }, q: 40, u: 'g' }));
    L.push(await mk({ tag: 'C1b', k: 2, name: 'Shake fictif C', base: 'dec', p100: { kcal: 60, prot: 12, carbs: 1, fat: 1 }, q: 200, u: 'ml' }));
    await reset(L);
    OUT.C_gml = await E(() => {
      const o = _portionObservee('Shake fictif C');
      const idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12);
      return { notees: _portionsNotees('Shake fictif C'), obs: o, idees: idees.map(i => i.idee), candidats: _mesAliments(40).map(a => ({ n: a.name, per100: !!a.per100, base: a._fiche && a._fiche.base })) };
    });
    /* ligne MASQUÉE : une ancienne grosse prise, puis masquage, puis une seule prise normale */
    const L2 = [];
    L2.push(await mk({ tag: 'C2a', k: 9, name: 'Skyr fictif C', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 500, u: 'g' }));
    const nv = await mk({ tag: 'C2b', k: 0, name: 'Skyr fictif C', base: 'dec', p100: { kcal: 60, prot: 11, carbs: 4, fat: 0.2 }, q: 100, u: 'g' });
    nv.ts = Date.now() + 1000;
    L2.push(nv);
    await reset(L2);
    OUT.C_masque = await E(() => {
      S.hiddenFoods = [{ k: 'nom:skyr fictif c', t: Date.now() - 100000 }];   // masqué après l'ancienne prise, avant la nouvelle
      const al = _mesAliments(40).filter(a => a.name === 'Skyr fictif C');
      const o = _portionObservee('Skyr fictif C');
      const idees = _ideesPourLeReste({ prot: 70, carbs: 0, fat: 0, kcal: 400 }, 12);
      return { propose_ancienne: _n2Propose(S.foodLog[0], S.foodLog[0].ts), propose_nouvelle: _n2Propose(S.foodLog[1], S.foodLog[1].ts), candidats: al.length, obs: o, notees: _portionsNotees('Skyr fictif C'), idees: idees.map(i => i.idee) };
    });
    /* portion extrême (P3) : 250 g habituels → 500 g ? */
    const L3 = [];
    for (const k of [4, 3, 2]) L3.push(await mk({ tag: 'C3', k, name: 'Riz fictif C', base: 'dec', p100: { kcal: 350, prot: 7, carbs: 78, fat: 1 }, q: 250, u: 'g' }));
    await reset(L3);
    OUT.C_extreme = await E(() => ({ obs: _portionObservee('Riz fictif C'), idees: _ideesPourLeReste({ prot: 0, carbs: 400, fat: 0, kcal: 1500 }, 12).map(i => i.idee), idees_soir: _ideesPourLeReste({ prot: 0, carbs: 400, fat: 0, kcal: 1500 }, 21).map(i => i.idee) }));
  }

  /* ══════ D. LIMITE DE TROIS, ORDRE, EXCLUSION DU JOUR ══════ */
  {
    const L = [];
    const P = { kcal: 130, prot: 3, carbs: 28, fat: 0.3 };
    /* H1 : bloquée (copie OFF sans preuve), notée 6 jours ; H2 : 5 ; H3 : 4 ; H4 : 3 — toutes les trois dernières valides (déclarées) */
    for (const k of [10, 9, 8, 7, 6, 5]) L.push(await mk({ tag: 'D1', k, meal: 'collation', name: 'Bloquee fictif D1', base: 'off', sid: '3000000000921', p100: { kcal: 380, prot: 85, carbs: 3, fat: 2 }, q: 30 }));
    for (const k of [10, 9, 8, 7, 6]) L.push(await mk({ tag: 'D2', k, meal: 'petitdej', name: 'Avoine fictif D2', base: 'dec', p100: P, q: 80 }));
    for (const k of [10, 9, 8, 7]) L.push(await mk({ tag: 'D3', k, meal: 'dejeuner', name: 'Riz fictif D3', base: 'dec', p100: P, q: 150 }));
    for (const k of [10, 9, 8]) L.push(await mk({ tag: 'D4', k, meal: 'diner', name: 'Pates fictif D4', base: 'dec', p100: P, q: 120 }));
    await reset(L);
    OUT.D_top3 = await E(() => { const h = _repasHabituels(); const vf = _n2FichesVerifiees(); return h.map(r => ({ nom: r.items.map(i => i.name).join('+'), n: r.n, apercu: (() => { const a = _habApercu(r, vf); return { n: a.n, aVerifier: a.aVerifier }; })() })); });
    /* aujourd'hui : D2 notée ce matin → disparaît-elle ? */
    OUT.D_aujourdhui = await E(async () => {
      const ajd = today(); const e = window.__FAB.ligne({ tag: 'D2t', k: 0, meal: 'petitdej', name: 'Avoine fictif D2', base: 'dec', p100: { kcal: 130, prot: 3, carbs: 28, fat: 0.3 }, q: 80 });
      e.date = ajd; S.foodLog.push(e);
      const h = _repasHabituels();
      return h.map(r => ({ nom: r.items.map(i => i.name).join('+'), n: r.n }));
    });
  }

  /* ══════ E. MASQUER : ce que produit « ✕ » (hiddenFoods) sur les autres surfaces ══════ */
  {
    const P = { kcal: 130, prot: 3, carbs: 28, fat: 0.3 };
    const L = [];
    for (const k of [10, 9, 8]) L.push(await mk({ tag: 'E1', k, meal: 'petitdej', name: 'Avoine fictif E', base: 'dec', p100: P, q: 80 }));
    for (const k of [10, 9, 8]) L.push(await mk({ tag: 'E2', k, meal: 'petitdej', name: 'Lait fictif E', base: 'dec', p100: { kcal: 46, prot: 3.3, carbs: 4.8, fat: 1.5 }, q: 200 }));
    await reset(L);
    OUT.E_avant = await E(() => ({ habitudes: _repasHabituels().length, mesAliments: _mesAliments(40).map(a => a.name) }));
    OUT.E_apres = await E(() => {
      /* ce que fait « ✕ » sur UN aliment d'une habitude : on masque « Lait fictif E » par la porte existante */
      const src = typeof deleteQuickFood === 'function' ? deleteQuickFood.toString().slice(0, 400) : '';
      S.hiddenFoods = _nutMasquesFusion(S.hiddenFoods, [{ k: _n2Cle({ name: 'Lait fictif E' }), t: Date.now() }], Date.now());
      const h = _repasHabituels();
      return { habitudes: h.length, items: h.map(r => r.items.map(i => i.name)), mesAliments: _mesAliments(40).map(a => a.name), masques: S.hiddenFoods, src: src };
    });
    OUT.E_ui = await E(() => { goScreen('s-nutrition'); renderFoodJournal(); const c = document.querySelectorAll('.hab-moments'); const html = document.getElementById('s-nutrition') ? document.getElementById('s-nutrition').innerHTML : ''; return { cartes: c.length, boutonsMasquer: (html.match(/masquer|✕|Supprimer/gi) || []).length }; });
  }

  /* ══════ F. ÉCHAPPEMENT DES NOMS DANS onclick="rejouerRepas('…')" ══════ */
  {
    const P = { kcal: 130, prot: 3, carbs: 28, fat: 0.3 };
    const cas = {
      guillemet: 'Lait "Bio" fictif',
      apostrophe: "Pain d'Anaïs fictif",
      plus: 'Whey+Creatine fictif',
      antislash: 'Dos\\Ligne fictif',
      antislash_apostrophe: "Faux\\');window.__ca_pwn=(window.__ca_pwn||0)+1;//",
      entite_apostrophe: "Faux&#39;);window.__ca_pwn=(window.__ca_pwn||0)+1;//"
    };
    OUT.F = {};
    for (const [cle, nom] of Object.entries(cas)) {
      const L = [];
      for (const k of [3, 2]) L.push(await mk({ tag: 'F' + cle, k, meal: 'dejeuner', name: nom, base: 'dec', p100: P, q: 100 }));
      await reset(L);
      await E(() => { window.__ca_pwn = 0; window.__appels = []; if (!window.__rejouerOrig) { window.__rejouerOrig = window.rejouerRepas; window.rejouerRepas = function () { window.__appels.push(Array.prototype.slice.call(arguments).map(String)); return window.__rejouerOrig.apply(this, arguments); }; } });
      const r = await E(() => {
        goScreen('s-nutrition'); renderFoodJournal();
        const bs = [...document.querySelectorAll('.hab-moments button')];
        return { boutons: bs.length, attr: bs[0] ? bs[0].getAttribute('onclick').slice(0, 160) : null, cartes: document.querySelectorAll('.hab-moments').length };
      });
      let clic = null, err = null;
      try {
        err = await E(() => { window.__e = null; const h = (ev) => { window.__e = String(ev.message || ev); }; window.addEventListener('error', h); try { const b = document.querySelectorAll('.hab-moments button')[0]; if (b) { b.style.display = 'block'; b.click(); } } catch (x) { window.__e = String(x); } window.removeEventListener('error', h); return window.__e; });
        await pg.waitForTimeout(300);
        clic = await E(() => ({ appels: window.__appels, pwn: window.__ca_pwn, ajoutes: S.foodLog.filter(x => x.date === today()).length }));
      } catch (x) { clic = { crash: String(x).slice(0, 120) }; }
      OUT.F[cle] = { nom: nom, rendu: r, erreur: err, clic: clic };
    }
  }


  /* ══════ H. LE « + » d'une habitude contenant un aliment refusé : ce que fait réellement le geste (master ≠ candidat) ══════ */
  {
    const L = [];
    for (const k of [3, 2]) { L.push(await mk({ tag: 'H1', k, meal: 'dejeuner', name: 'Avoine fictif H', base: 'dec', p100: { kcal: 380, prot: 13, carbs: 60, fat: 7 }, q: 80 })); L.push(await mk({ tag: 'H2', k, meal: 'dejeuner', name: 'Isolat fictif H', base: 'off', sid: '3000000000931', p100: { kcal: 380, prot: 85, carbs: 3, fat: 2 }, q: 30 })); }
    await reset(L);
    OUT.H_rejeu = await E(async () => {
      window.__toasts = []; const vt = window.toast; window.toast = function (m) { window.__toasts.push(String(m)); try { return vt.apply(this, arguments); } catch (e) {} };
      goScreen('s-nutrition'); renderFoodJournal();
      const h = _repasHabituels(); const sig = h[0].sig;
      const avant = S.foodLog.length;
      rejouerRepas(sig, 'dejeuner');
      await new Promise(r => setTimeout(r, 600));
      const aj = S.foodLog.filter(x => x.date === today()).map(x => x.name);
      const panneau = !!document.querySelector('.hab-choix');
      return { sig: sig, ajoutes: aj, delta: S.foodLog.length - avant, panneauChoix: panneau, toasts: window.__toasts.slice(), carte: (() => { const a = _habApercu(h[0], _n2FichesVerifiees()); return { n: a.n, aVerifier: a.aVerifier, aCompleter: a.aCompleter }; })() };
    });
  }


  /* ══════ F2. Un VRAI libellé de la table CIQUAL embarquée qui contient un guillemet droit (27 sur 3 484) ══════ */
  {
    const r0 = await E(() => { const a = _ciqual.a; const x = a.find(y => String(y[1]).indexOf('"') >= 0 && y[3] > 0); const t = _n2Ctx().ciqual(String(x[0])); return { code: x[0], nom: String(x[1]), p: { kcal: t.kcal, prot: t.prot, carbs: t.carbs, fat: t.fat } }; });
    const L = [];
    for (const k of [3, 2]) L.push(await mk({ tag: 'F2', k, meal: 'dejeuner', name: r0.nom, base: 'ciq', sid: 'ciqual:' + r0.code, p100: r0.p, q: 100 }));
    await reset(L);
    const res = await E(() => { goScreen('s-nutrition'); renderFoodJournal(); const b = document.querySelector('.hab-moments button'); return { cartes: document.querySelectorAll('.hab-moments').length, attr: b ? b.getAttribute('onclick').slice(0, 90) : null }; });
    let err = null; try { err = await E(() => { window.__e = null; const h = (ev) => { window.__e = String(ev.message || ev); }; window.addEventListener('error', h); try { document.querySelector('.hab-moments button').click(); } catch (x) { window.__e = String(x); } window.removeEventListener('error', h); return window.__e; }); } catch (x) { err = String(x).slice(0, 80); }
    OUT.F2_ciqual = { libelle: r0.nom, rendu: res, erreurClic: err };
  }

  /* ══════ G. COMPTEUR « noté N fois » : ce qui le fait bouger ══════ */
  {
    const P = { kcal: 380, prot: 85, carbs: 3, fat: 2 };
    const L = [];
    for (const k of [20, 18, 16, 14, 12, 10, 8]) L.push(await mk({ tag: 'G7', k, meal: 'collation', name: 'Shaker fictif G', base: 'dec', p100: P, q: 30 }));
    await reset(L);
    const n = () => E(() => { const h = _repasHabituels(); return h.length ? h[0].n : 0; });
    OUT.G = { base7: await n() };
    /* (1) cinq journées plus anciennes réapparaissent (synchronisation / restauration) */
    const anc = [];
    for (const k of [40, 38, 36, 34, 32]) anc.push(await mk({ tag: 'G12', k, meal: 'collation', name: 'Shaker fictif G', base: 'dec', p100: P, q: 30 }));
    OUT.G.apres_anciens_jours = await E((a) => { S.foodLog = S.foodLog.concat(a); const h = _repasHabituels(); return h.length ? h[0].n : 0; }, anc);
    /* (2) la date de remise à zéro (masquage global) recule : des lignes exclues redeviennent comptées */
    await reset(L.concat(anc));
    OUT.G.reset_au_milieu = await E(() => { S.hiddenFoods = [{ k: '*', t: Date.now() }]; const h = _repasHabituels(); return h.length ? h[0].n : 0; });
    OUT.G.reset_recule = await E((a) => { S.hiddenFoods = [{ k: '*', t: 1760000000000 + 60000 * 25 + 25 * 86400000 }]; const h = _repasHabituels(); const m = h.length ? h[0].n : 0; S.hiddenFoods = []; const h2 = _repasHabituels(); return { avec_reset: m, sans_reset: h2.length ? h2[0].n : 0 }; });
    /* (3) le même shaker noté à DEUX moments le même jour compte deux fois */
    await reset(L);
    OUT.G.deux_moments_meme_jour = await E(() => { const b = S.foodLog[0]; const c = JSON.parse(JSON.stringify(b)); c.id = 'ca-G-dup-0001-20000001'; c.meal = 'collation2'; S.foodLog.push(c); const h = _repasHabituels(); return h[0].n; });
    /* (4) renommer un seul aliment d'une journée change la signature et fait baisser le compteur */
    await reset(L);
    OUT.G.apres_renommage = await E(() => { S.foodLog[0].name = 'Shaker fictif G (bis)'; const h = _repasHabituels(); return h.map(r => ({ n: r.n, noms: r.items.map(i => i.name) })); });
  }


  /* ══════ validation du relevé en lecture seule (nombres uniquement) ══════ */
  {
    const L = [];
    for (const k of [20, 18, 16]) L.push(await mk({ tag: 'R7', k, meal: 'collation', name: 'Shaker fictif R', base: 'dec', p100: { kcal: 380, prot: 85, carbs: 3, fat: 2 }, q: 30 }));
    await reset(L);
    const src = require('fs').readFileSync(path.join(__dirname, 'releve_compteur.js'), 'utf8');
    OUT.releve = await E((s) => (0, eval)(s), src);
  }

  OUT.erreursPage = erreurs.slice(0, 5);
  await b.close(); srv.close();
  console.log(J({ etiquette: LABEL, racine: ROOT, resultats: OUT }, null, 0));
})().catch((e) => { console.error('CRASH : ' + (e && e.stack || e)); try { srv.close(); } catch (x) {} process.exit(2); });
