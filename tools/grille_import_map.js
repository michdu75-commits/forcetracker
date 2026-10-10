#!/usr/bin/env node
/* GRILLE AVANT / APRÈS — IMPORT-MAP-01 (session-B, 10/10/2026).
   Rejoue LES MÊMES entrées sur deux arbres — le dépôt tel quel (« après ») et une copie dont `log.js` vient
   d'une référence git (« avant », master b280ea5d par défaut) — dans la vraie page, et compare.
   Entrées : ① grille fabriquée depuis le catalogue (nom sans parenthèse ; matériel ajouté ou remplacé par
   machine / barre / haltères / poulie / smith) ; ② noms GÉNÉRIQUES (le matériel écrit retiré du nom :
   « Développé Épaules Machine » → « Développé Épaules ») ; ③ `VM_CASES` (cas curés avec la réponse
   attendue) ; ④ `VM_BENCH` (6 jeux de vrais noms de salle) ; ⑤ les alias `_EX_EQUIV` ; ⑥ les synonymes EN.
   Sortie : total, AUTO, AUTO inter-matériel (+ liste), rapprochements SAINS perdus (+ liste, classés),
   changements voulus par la décision de Michel (nom sans matériel → confirmation).
   Le classement du matériel vient du témoin (`tests/parcours/import_map.js`), pas de l'app : la mesure
   n'est pas la formule qu'elle vérifie.
   Usage : node tools/grille_import_map.js [ref_avant]      (ex. : b280ea5d) */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.dirname(__dirname);
const REF = process.argv[2] || 'b280ea5d';
const { materielEcrit } = require(path.join(ROOT, 'tests', 'parcours', 'import_map.js'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.wasm': 'application/wasm' };
const serveur = root => http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(root, p); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });

// Copie « avant » : le dépôt servi, avec le log.js de la référence (rien d'autre ne change).
function copieAvant() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'grille_imap_')), a = path.join(tmp, 'a');
  fs.cpSync(ROOT, a, { recursive: true, filter: s => !/[\\/](\.git|node_modules)([\\/]|$)/.test(s) });
  fs.writeFileSync(path.join(a, 'log.js'), cp.execFileSync('git', ['show', REF + ':log.js'], { cwd: ROOT, maxBuffer: 64 << 20 }));
  return { tmp, a };
}

async function mesurer(b, root) {
  const srv = serveur(root); await new Promise(r => srv.listen(0, r));
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|supabase\.co|workers\.dev|anthropic\.com/, r => r.abort());
  const pg = await cx.newPage(); await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
  const R = await pg.evaluate(() => {
    const RE_MAT = /\b(machine|barre|barbell|halteres?|haltère|haltères|dumbbells?|poulie|câble|cable|smith|guidé|guidée)\b/i;
    const MOTS = ['machine', 'barre', 'haltères', 'poulie', 'smith'];
    const entrees = [], vus = new Set();
    const ajoute = (v, src, kind, expect) => { const k = kind + '|' + v.toLowerCase(); if (vus.has(k)) return; vus.add(k); entrees.push({ v, src, kind, expect }); };
    (EXLIB || []).forEach(ex => {
      const n = String(ex.n), base = n.replace(/\s*\([^)]*\)\s*$/, '').trim();
      if (base !== n) ajoute(base, n, 'grille');
      if (RE_MAT.test(base)) { MOTS.forEach(w => ajoute(base.replace(RE_MAT, w), n, 'grille')); ajoute(base.replace(RE_MAT, '').replace(/\s+/g, ' ').trim(), n, 'generique'); }
      else MOTS.forEach(w => ajoute(base + ' ' + w, n, 'grille'));
    });
    (typeof VM_CASES !== 'undefined' ? VM_CASES : []).forEach(c => ajoute(c.input, '', 'vm_cases', c.expect === undefined ? null : c.expect));
    Object.keys(typeof VM_BENCH !== 'undefined' ? VM_BENCH : {}).forEach(k => VM_BENCH[k].forEach(n => ajoute(n, k, 'vm_bench')));
    Object.keys(_EX_EQUIV).forEach(k => ajoute(k, _EX_EQUIV[k], 'alias'));
    (EXLIB || []).forEach(ex => { if (typeof EX_EN !== 'undefined' && EX_EN[ex.n]) ajoute(EX_EN[ex.n], ex.n, 'en'); });
    return entrees.map(e => { const r = _matchExercise(e.v) || {}; return Object.assign(e, { tier: r.tier, match: r.match || null, via: r.via || '',
      eq: r.match ? _exEquip(r.match) : null, cle: !!_EX_EQUIV[_normEx(e.v)] }); });
  });
  await cx.close(); srv.close(); return R;
}

const matCible = (n, eq) => materielEcrit(n) || ((!eq || eq === 'autre') ? null : eq);
const inter = r => { if (r.tier !== 'auto' || !r.match) return false; const a = materielEcrit(r.v), c = matCible(r.match, r.eq);
  if (!a || !c || a === c) return false; if (c === 'guide') return !['machine', 'poulie', 'smith'].includes(a); return true; };

(async () => {
  const { tmp, a } = copieAvant();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const AV = await mesurer(b, a), AP = await mesurer(b, ROOT);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  const cle = r => r.kind + '|' + r.v.toLowerCase(), apres = new Map(AP.map(r => [cle(r), r]));
  const bilan = (L, nom) => { const g = L.filter(r => r.kind === 'grille'); const i = g.filter(inter);
    console.log(`  ${nom.padEnd(6)} grille ${g.length} variantes · ${g.filter(r => r.tier === 'auto').length} AUTO · ${i.length} AUTO inter-matériel (${i.filter(r => r.via === 'mots' || (r.via === 'équivalence connue' && !r.cle)).length} par rapprochement)`);
    return i; };
  console.log('\n═══ GRILLE IMPORT-MAP-01 — avant (' + REF + ') / après (arbre de travail) ═══');
  bilan(AV, 'avant'); const iAp = bilan(AP, 'après');
  console.log('\n  AUTO inter-matériel restants (après) :'); iAp.forEach(r => console.log('    · ' + r.v + ' → ' + r.match + '  [' + r.via + (r.cle ? ', alias complet' : '') + ']'));
  // Rapprochements SAINS perdus : AUTO avant, de matériel compatible, et plus AUTO vers la même cible après.
  const perdus = AV.filter(r => r.tier === 'auto' && !inter(r)).map(r => [r, apres.get(cle(r))]).filter(([r, s]) => !s || s.tier !== 'auto' || s.match !== r.match);
  const decision = perdus.filter(([r, s]) => !materielEcrit(r.v) && materielEcrit(r.match) && s && s.tier === 'confirm' && s.match === r.match);
  const autres = perdus.filter(p => !decision.includes(p));
  console.log('\n  Rapprochements AUTO sains perdus (hors décision de Michel) : ' + autres.length);
  autres.forEach(([r, s]) => console.log('    · [' + r.kind + '] ' + r.v + ' : avant AUTO ' + r.match + ' → après ' + (s ? s.tier + ' ' + s.match : '?')));
  console.log('\n  Changés par la décision de Michel (nom sans matériel → confirmation vers la même cible) : ' + decision.length);
  decision.forEach(([r]) => console.log('    · [' + r.kind + '] ' + r.v + ' → ' + r.match));
  const gagnes = AP.filter(s => s.tier === 'auto' && !inter(s)).filter(s => { const r = AV.find(x => cle(x) === cle(s)); return !r || r.tier !== 'auto' || r.match !== s.match; });
  console.log('\n  Nouveaux AUTO sains (après, pas avant) : ' + gagnes.length); gagnes.forEach(s => console.log('    · [' + s.kind + '] ' + s.v + ' → ' + s.match));
  const alC = AP.filter(r => r.kind === 'alias' && inter(r));
  console.log('\n  Alias DÉCLARÉS (`_EX_EQUIV`) qui contredisent le matériel écrit de leur clé — étage conservé, dette : ' + alC.length);
  alC.forEach(r => console.log('    · ' + r.v + ' → ' + r.match));
  const vmc = L => L.filter(r => r.kind === 'vm_cases'), okc = L => vmc(L).filter(r => r.match === r.expect).length;
  console.log('\n  VM_CASES (réponse attendue) : avant ' + okc(AV) + '/' + vmc(AV).length + ' · après ' + okc(AP) + '/' + vmc(AP).length);
  vmc(AP).filter(r => r.match !== r.expect).forEach(r => { const x = AV.find(y => cle(y) === cle(r)); console.log('    · ' + r.v + ' attendu ' + r.expect + ' : avant ' + (x && x.match) + ' · après ' + r.tier + ' ' + r.match); });
  console.log('\n──── total entrées ' + AP.length + ' · AUTO inter-matériel après ' + iAp.length + ' · sains perdus ' + autres.length + ' · décision ' + decision.length + ' ────');
})().catch(e => { console.error('PLANTAGE ' + (e && e.message || e)); process.exit(2); });
