// 🧪 Runner Tier 1 (déterministe) — validation de Milo. Voir docs/FRAMEWORK-TESTS-MILO.md
// Une commande :  node tests/milo/runner.js
// Il lance un petit serveur statique local + un navigateur sans tête, charge l'app, injecte
// l'état de chaque scénario, appelle buildCoachContext() / _gardienSortie(), exécute les
// assertions déterministes, et écrit un rapport (console + tests/milo/report.json + .md).

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');           // racine du repo
const SCENARIOS = require('./scenarios.js');
const PORT = 8731;

// ── Playwright (chemin normal, sinon chemin absolu de l'environnement) ──
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright/index.js').chromium; }
const CHROME_PATHS = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];
const execPath = CHROME_PATHS.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });

// ── Serveur statique minimal (zéro dépendance) ──
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

// ── La logique de check tourne DANS la page (accès à buildCoachContext, _gardienSortie, S) ──
function inPageCheck(scenario) {
  const res = { failures: [] };
  try {
    const su = scenario.setup || {};
    if (su.profile) Object.assign(S, su.profile);
    if (su.quiz)   S.coachQuiz = { answers: su.quiz, done: true };
    if (su.health) S.healthProfile = Object.assign({ injuries: [], conditions: [], notes: '' }, su.health);
    const c = scenario.checks || {};
    const needCtx = (c.contextMustContain && c.contextMustContain.length) || (c.contextMustNotContain && c.contextMustNotContain.length);
    if (needCtx) {
      const ctx = (typeof buildCoachContext === 'function') ? buildCoachContext() : '';
      (c.contextMustContain || []).forEach(s => { if (ctx.indexOf(s) < 0) res.failures.push('contexte MANQUE: « ' + s + ' »'); });
      (c.contextMustNotContain || []).forEach(s => { if (ctx.indexOf(s) >= 0) res.failures.push('contexte contient (INTERDIT): « ' + s + ' »'); });
    }
    const needG = (c.gardienFlagsExpected && c.gardienFlagsExpected.length) || (c.gardienFlagsAbsent && c.gardienFlagsAbsent.length) || (c.replyMustNotContain && c.replyMustNotContain.length);
    if (needG) {
      const g = (typeof _gardienSortie === 'function') ? _gardienSortie((su.reply || '')) : { text: (su.reply || ''), flags: [] };
      const codes = (g.flags || []).map(f => f.code);
      (c.gardienFlagsExpected || []).forEach(f => { if (codes.indexOf(f) < 0) res.failures.push('Gardien MANQUE le flag « ' + f + ' »'); });
      (c.gardienFlagsAbsent   || []).forEach(f => { if (codes.indexOf(f) >= 0) res.failures.push('Gardien flag INATTENDU « ' + f + ' »'); });
      (c.replyMustNotContain  || []).forEach(s => { if ((g.text || '').indexOf(s) >= 0) res.failures.push('sortie contient (INTERDIT): « ' + s + ' »'); });
    }
  } catch (e) { res.failures.push('ERREUR d\'exécution: ' + (e && e.message || e)); }
  return res;
}

(async () => {
  const server = serve();
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch(execPath ? { executablePath: execPath } : {});

  const results = [];
  for (const sc of SCENARIOS) {
    const ctx = await browser.newContext({ serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(e.message));
    const base = sc.clone ? '/clone/index.html' : '/index.html';
    try {
      await page.goto(`http://localhost:${PORT}${base}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(900);
      const r = await page.evaluate(inPageCheck, sc);
      if (jsErrors.length) r.failures.push('erreur JS page: ' + jsErrors[0]);
      results.push({ ...sc, failures: r.failures, passed: r.failures.length === 0 });
    } catch (e) {
      results.push({ ...sc, failures: ['navigation/évaluation: ' + (e && e.message || e)], passed: false });
    }
    await ctx.close();
  }

  await browser.close();
  server.close();

  // ── Rapport ──
  const core   = results.filter(r => r.criticality === 'critique');
  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const coreFailed = core.filter(r => !r.passed);
  const byCrit = c => failed.filter(r => r.criticality === c).length;

  const lines = [];
  lines.push('# 🧪 Rapport de validation de Milo — Tier 1 (déterministe)');
  lines.push('');
  lines.push(`Date : ${new Date().toISOString()}`);
  lines.push(`Total : ${results.length} · ✅ réussis : ${passed.length} · ❌ échecs : ${failed.length}`);
  lines.push(`Noyau dur (critiques) : ${core.length} · échecs critiques : ${coreFailed.length}`);
  lines.push(`Par criticité — critique : ${byCrit('critique')} · majeur : ${byCrit('majeur')} · mineur : ${byCrit('mineur')}`);
  lines.push('');
  if (failed.length) {
    lines.push('## ❌ Échecs (origin = version du bug qui régresse)');
    failed.forEach(r => {
      lines.push(`- **${r.id}** [${r.criticality}] (${r.category}, origin ${r.origin}) — ${r.description}`);
      r.failures.forEach(f => lines.push(`    - ${f}`));
    });
  } else {
    lines.push('## ✅ Aucun échec — tout le corpus est vert.');
  }
  const md = lines.join('\n') + '\n';
  fs.writeFileSync(path.join(__dirname, 'report.md'), md);
  fs.writeFileSync(path.join(__dirname, 'report.json'),
    JSON.stringify({ date: new Date().toISOString(), total: results.length, passed: passed.length,
      failed: failed.length, coreFailed: coreFailed.length,
      results: results.map(r => ({ id: r.id, criticality: r.criticality, category: r.category,
        origin: r.origin, passed: r.passed, failures: r.failures })) }, null, 2));

  // ── Console ──
  console.log('\n' + '─'.repeat(60));
  results.forEach(r => console.log(`${r.passed ? '✅' : '❌'} ${r.id} [${r.criticality}] ${r.category} (${r.origin})${r.passed ? '' : '\n     → ' + r.failures.join('\n     → ')}`));
  console.log('─'.repeat(60));
  console.log(`Total ${results.length} · ✅ ${passed.length} · ❌ ${failed.length} · échecs critiques : ${coreFailed.length}`);
  console.log(`Rapport : tests/milo/report.md + report.json`);

  // Sortie non-zéro si un scénario CRITIQUE régresse (le gate bloque la release)
  process.exit(coreFailed.length > 0 ? 1 : 0);
})();
