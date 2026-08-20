#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 TIER 2 — LE BENCHMARK : on fait parler le VRAI Milo et on vérifie sa réponse.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `tests/milo/runner.js` (Tier 1) prouve qu'une règle est PRÉSENTE dans le prompt.
 * Celui-ci mesure si elle est SUIVIE. Voir l'en-tête de `eval-scenarios.js` pour ce
 * que ça vaut (⚠️ un vert vaut moins qu'un rouge) et pourquoi il n'y a PAS de juge IA.
 *
 * ⚠️ CE RUNNER COÛTE DE L'ARGENT — c'est le seul du dépôt. D'où deux garde-fous :
 *   ① il ne part PAS tout seul : sans `--go`, il tourne À BLANC (0 appel, 0 €) et se
 *      contente d'annoncer ce qu'il ferait et ce que ça coûterait. Le chiffre annoncé
 *      est MESURÉ, pas deviné : le contexte réel de chaque scénario est construit
 *      pour de bon (c'est gratuit, tout est local) et on compte ses caractères.
 *   ② il n'est PAS branché sur la suite de tests de livraison. Un test qui dépense
 *      à chaque `git push` finirait par être coupé — et c'est le seul qui mesure
 *      vraiment Milo.
 *
 * ⚠️ ET IL NE RÉUTILISE AUCUNE DONNÉE RÉELLE : chaque scénario passe par
 *    `_vcApplyPersona`, qui remet à neutre TOUT ce que lit `buildCoachContext`.
 *    Le navigateur est jetable, rien n'est écrit sur le compte de personne.
 *
 * Usage :
 *   node tests/milo/eval.js                     → à blanc (0 €), liste + devis
 *   node tests/milo/eval.js --go                → lance les 15
 *   node tests/milo/eval.js --go --only EV-001,EV-006
 *   node tests/milo/eval.js --go --n 4          → les 4 premiers seulement
 *
 * Sortie : console + tests/milo/eval-report.json + tests/milo/eval-report.md
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENARIOS = require('./eval-scenarios.js');

// ── Tarifs (vérifiés le 20/08/2026) — worker.js sert claude-sonnet-4-6 à TOUT LE MONDE ──
const PRIX = { entree: 3.00, sortie: 15.00, cacheEcriture: 2.0, cacheLecture: 0.1 }; // $/M tokens, multiplicateurs
const CAR_PAR_TOKEN = 3.6;   // français, mesuré à la louche — sert au DEVIS, pas à la facture
const SORTIE_ATTENDUE = 700; // tokens de réponse typiques d'un débrief/séance Milo

// ── Arguments ──
const ARGV = process.argv.slice(2);
const GO   = ARGV.includes('--go');
const ONLY = (ARGV.find(a=>a.startsWith('--only='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--only')+1] && !ARGV[ARGV.indexOf('--only')+1].startsWith('--') ? ARGV[ARGV.indexOf('--only')+1] : '');
const NMAX = parseInt((ARGV.find(a=>a.startsWith('--n='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--n')+1]||''), 10);

let liste = SCENARIOS.slice();
if (ONLY) { const ids = ONLY.split(',').map(s=>s.trim().toUpperCase()); liste = liste.filter(s=>ids.includes(s.id)); }
if (Number.isFinite(NMAX) && NMAX > 0) liste = liste.slice(0, NMAX);

// ── Playwright ──
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright/index.js').chromium; }
const CHROME_PATHS = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'];
const execPath = CHROME_PATHS.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.wav':'audio/wav' };
function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p.endsWith('/')) p += 'index.html';
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
}

// ── Ce qui tourne DANS la page : on réutilise le laboratoire VC de l'app (R13) ──
// `_vcApplyPersona` remet à neutre tout ce que lit buildCoachContext puis applique le
// persona ; `_vcAsk` fait l'appel réel avec le MÊME contexte que le vrai chemin.
// window._demoMode gèle toute écriture locale/cloud pendant la manœuvre.
async function jouerDansLaPage(page, sc, pourDeVrai) {
  return page.evaluate(async ({ sc, pourDeVrai }) => {
    const manque = ['_vcApplyPersona','_vcAsk','buildCoachContext'].filter(f=>typeof window[f]!=='function');
    if (manque.length) return { erreur:'fonction(s) absente(s) : '+manque.join(', ') };
    window._demoMode = true;
    try {
      _vcApplyPersona({ apply: sc.apply || {} });
      const persona = { scenario: sc.scenario, coachEmail: sc.coachEmail || '', history: sc.history || [] };
      if (!pourDeVrai) {
        // À BLANC : on construit le contexte réel (gratuit, local) pour MESURER le devis.
        const ctx = buildCoachContext(sc.scenario);
        const hist = JSON.stringify(sc.history || []).length;
        return { blanc:true, carContexte: ctx.length, carHistorique: hist, carMessage: (sc.scenario||'').length };
      }
      const r = await _vcAsk(persona);
      return { ok:!!r.ok, reply:r.reply||'', err:r.err||'', kind:r.kind||'', ms:r.ms||0, carContexte:(r.ctx||'').length };
    } catch (e) {
      return { erreur: (e && e.message) || String(e) };
    } finally {
      window._demoMode = false;
      try { if (typeof load === 'function') load(); } catch (e) {}
    }
  }, { sc, pourDeVrai });
}

function euros(usd){ return (usd * 0.92).toFixed(2); } // ordre de grandeur, pas une facture

(async () => {
  if (!liste.length) { console.log('Aucun scénario ne correspond.'); process.exit(0); }

  const srv = serve();
  await new Promise(r => srv.listen(0, r));
  const port = srv.address().port;
  const nav = await chromium.launch(execPath ? { executablePath: execPath } : {});

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 BENCHMARK MILO (Tier 2) — est-ce qu\'il SUIT ses règles ?     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(GO ? '  Mode : RÉEL — '+liste.length+' appel(s) à Milo vont être facturés.\n'
                 : '  Mode : À BLANC — aucun appel, aucun coût. Ajoute --go pour lancer.\n');

  const resultats = [];
  let totalCar = 0;

  for (const sc of liste) {
    const ctx = await nav.newContext({ serviceWorkers:'block', viewport:{width:390,height:844} });
    await ctx.addInitScript(() => {
      // Compte minimal « déjà connecté » : le laboratoire écrase de toute façon tout le profil.
      const b = { ft4_name:'Test', ft4_bw:'80', ft4_age:'35', ft4_height:'175',
                  ft4_gender:'h', ft4_ok:'1', ft4_premium:'1', ft4_email:'' };
      for (const k in b) localStorage.setItem(k, b[k]);
    });
    const page = await ctx.newPage();
    const erreursPage = []; page.on('pageerror', e => erreursPage.push(e.message));
    await page.goto('http://localhost:' + port + '/index.html');
    await page.waitForTimeout(2300);
    await page.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.classList.remove('open')); });

    const r = await jouerDansLaPage(page, {
      apply: sc.apply, scenario: sc.scenario, coachEmail: sc.coachEmail, history: sc.history
    }, GO);
    await ctx.close();

    if (r.erreur) {
      console.log('  ⛔ ' + sc.id + ' — ' + r.erreur);
      resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'erreur', detail:r.erreur });
      continue;
    }

    if (!GO) {
      const car = (r.carContexte||0) + (r.carHistorique||0) + (r.carMessage||0);
      totalCar += car;
      console.log('  · ' + sc.id + '  ' + String(Math.round(car/1000)).padStart(3) + ' k car.  ' + sc.titre);
      resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'blanc', carContexte:r.carContexte });
      continue;
    }

    if (!r.ok) {
      console.log('  ⛔ ' + sc.id + ' — pas de réponse (' + r.kind + ') : ' + r.err);
      resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'muet', detail:r.err });
      continue;
    }

    // ── Les vérificateurs tournent ICI, dans Node : du code, pas un juge ──
    const verdicts = sc.verifs.map(v => {
      let out; try { out = v.fn(r.reply); } catch (e) { out = { ok:false, detail:'vérificateur cassé : '+e.message }; }
      if (out === true)  out = { ok:true };
      if (out === false) out = { ok:false };
      return { nom:v.nom, ok:!!out.ok, detail:out.detail || '' };
    });
    const rouges = verdicts.filter(v => !v.ok);
    console.log((rouges.length ? '  ❌ ' : '  ✅ ') + sc.id + ' — ' + sc.titre + '  (' + r.ms + ' ms)');
    verdicts.forEach(v => {
      if (!v.ok) console.log('       ↳ ' + v.nom + (v.detail ? '\n         → ' + v.detail : ''));
      else if (v.detail) console.log('       · ' + v.nom + ' — ' + v.detail);
    });
    totalCar += (r.carContexte||0);
    resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat: rouges.length?'rouge':'vert',
                     ms:r.ms, verdicts, reply:r.reply });
  }

  await nav.close(); srv.close();

  // ── Devis (à blanc) ou bilan (réel) ──
  console.log('');
  if (!GO) {
    const tk = Math.round(totalCar / CAR_PAR_TOKEN);
    const hautEntree = (tk / 1e6) * PRIX.entree;                       // pire cas : aucun cache
    const basEntree  = (tk / 1e6) * PRIX.entree * PRIX.cacheLecture;   // meilleur cas : tout en cache
    const sortie     = (liste.length * SORTIE_ATTENDUE / 1e6) * PRIX.sortie;
    console.log('  📐 DEVIS MESURÉ (contexte réel construit, ' + Math.round(totalCar/1000) + ' k caractères au total)');
    console.log('     ≈ ' + tk.toLocaleString('fr-FR') + ' tokens d\'entrée + ' + (liste.length*SORTIE_ATTENDUE).toLocaleString('fr-FR') + ' de sortie');
    console.log('     Coût d\'une passe : entre ' + euros(basEntree+sortie) + ' € (cache chaud) et ' + euros(hautEntree+sortie) + ' € (rien en cache)');
    console.log('     ⚠️ Ordre de grandeur, pas une facture — le découpage en tokens est estimé.');
    console.log('\n  Rien n\'a été appelé. Pour lancer pour de vrai :  node tests/milo/eval.js --go\n');
  } else {
    const verts = resultats.filter(r=>r.etat==='vert').length;
    const rouges= resultats.filter(r=>r.etat==='rouge');
    const muets = resultats.filter(r=>r.etat==='muet'||r.etat==='erreur').length;
    console.log('  ══ BILAN : ' + verts + ' vert(s) · ' + rouges.length + ' rouge(s)' + (muets?' · '+muets+' sans réponse':''));
    if (rouges.length) {
      console.log('\n  🔴 RÈGLES NON SUIVIES (ce sont des PREUVES) :');
      rouges.forEach(r => console.log('     ' + r.id + ' (' + r.origin + ') — ' + r.titre));
    } else {
      console.log('     Aucune violation DÉTECTABLE. ⚠️ Ça ne veut pas dire « Milo respecte ses règles » :');
      console.log('     ça veut dire que ces ' + liste.length + ' pièges-là n\'ont pas pris (voir l\'en-tête de eval-scenarios.js).');
    }
    console.log('');
  }

  // ── Rapports ──
  const ymd = new Date().toISOString().slice(0,10);
  const json = { date:ymd, mode: GO?'reel':'blanc', modele:'claude-sonnet-4-6', nb:liste.length, resultats };
  fs.writeFileSync(path.join(__dirname,'eval-report.json'), JSON.stringify(json,null,2));
  const md = ['# 🧪 Benchmark Milo (Tier 2) — ' + ymd,'',
    '**Mode :** ' + (GO?'réel':'à blanc') + ' · **Modèle :** claude-sonnet-4-6 · **Scénarios :** ' + liste.length,'',
    '> ⚠️ Un ROUGE est une preuve qu\'une règle a été violée. Un VERT dit seulement',
    '> « aucune violation détectable » — jamais « Milo respecte ses règles ».','',
    '| Scénario | Origine | État | Détail |','|---|---|---|---|']
    .concat(resultats.map(r => '| ' + r.id + ' — ' + r.titre.replace(/\|/g,'/') + ' | ' + r.origin + ' | '
      + ({vert:'✅',rouge:'❌',muet:'⛔',erreur:'⛔',blanc:'·'}[r.etat]||'?') + ' | '
      + ((r.verdicts||[]).filter(v=>!v.ok).map(v=>v.nom+(v.detail?' ('+v.detail+')':'')).join(' · ') || r.detail || '') + ' |'));
  fs.writeFileSync(path.join(__dirname,'eval-report.md'), md.join('\n') + '\n');
  console.log('  📄 tests/milo/eval-report.json + eval-report.md\n');

  process.exit(GO && resultats.some(r=>r.etat==='rouge') ? 1 : 0);
})().catch(e => { console.error('💥 ' + (e && e.stack || e)); process.exit(2); });
