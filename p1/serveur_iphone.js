#!/usr/bin/env node
/* SERVEUR D'ESSAI iPHONE (C1) — sert le candidat A/A2 depuis TON ORDINATEUR, branché sur le projet Apps Script de TEST (jamais la production).
   Zéro dépendance (Node seulement). Il ne MODIFIE AUCUN fichier du dépôt : il remplace en MÉMOIRE, à la volée,
     · `DEFAULT_URL` (constants.js) par l'adresse /exec de TEST ;
     · et ajoute à `index.html` (1) une Content-Security-Policy qui INTERDIT toute sortie hors de TEST (le Worker de Milo, Supabase, les polices… sont refusés par le NAVIGATEUR),
       (2) le panneau de mesure « C1 » (p1/c1_panneau.js) : compte fictif @example.invalid, boutons de gestes, journal des envois, rapport à copier.
   Les données de l'iPhone ne quittent jamais cette origine (http://<ordinateur>:8080) : le stockage local de l'app y est SÉPARÉ de celui de la vraie app (autre origine).
   ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/serveur_iphone.js <URL /exec de TEST> [--port 8080]
   Ne protège que ce serveur : il n'ouvre rien d'autre. Ctrl+C pour l'arrêter. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const RACINE = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webp': 'image/webp', '.ico': 'image/x-icon', '.gif': 'image/gif', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json' };

function csp(exec, extra) {
  const m = /^https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)\/exec$/.exec(exec);
  const connect = m ? ["'self'", 'https://script.google.com/macros/s/' + m[1] + '/', 'https://script.googleusercontent.com'] : ["'self'"].concat(extra || []);
  return ["default-src 'none'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:", "media-src 'self' data: blob:",
    'connect-src ' + connect.join(' '), "worker-src 'self' blob:", "manifest-src 'self'", "frame-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"].join('; ');
}

function demarrer(o) {
  const exec = o.exec, port = (o.port === undefined ? 8080 : o.port), email = o.email || ('c1-iphone-' + crypto.randomBytes(3).toString('hex') + '@example.invalid');
  if (!/^https?:\/\//.test(exec)) throw new Error('adresse /exec invalide');
  if (/AKfycbxWUsEFIlmx/.test(exec)) throw new Error('⛔ adresse de PRODUCTION : refus');
  if (!o.local && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(exec)) throw new Error('adresse /exec invalide (https://script.google.com/macros/s/…/exec attendue)');
  const politique = csp(exec, o.extraConnect);
  const panneau = fs.readFileSync(path.join(__dirname, 'c1_panneau.js'), 'utf8');
  const vues = { requetes: 0, dernier: '' };
  const s = http.createServer((q, r) => {
    vues.requetes++;
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    if (p === '/__c1/panneau.js') { r.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-store' }); return r.end(panneau); }
    if (p === '/__c1/ping') { r.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); return r.end('ok'); }
    const f = path.join(RACINE, p);
    if (!f.startsWith(RACINE + path.sep) || f.includes(path.sep + '.git' + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404, { 'Cache-Control': 'no-store' }); return r.end('404'); }
    let corps = fs.readFileSync(f); const type = MIME[path.extname(f).toLowerCase()] || 'application/octet-stream';
    if (p === '/constants.js') {
      const t = corps.toString('utf8'), re = /const DEFAULT_URL='[^']+';/g, n = (t.match(re) || []).length;
      if (n !== 1) { r.writeHead(500); return r.end('DEFAULT_URL : ' + n + ' occurrence(s) — attendu 1'); }
      corps = Buffer.from(t.replace(re, "const DEFAULT_URL='" + exec + "';"), 'utf8');
    } else if (p === '/index.html') {
      let t = corps.toString('utf8');
      const marque = /<head[^>]*>/i; if (!marque.test(t)) { r.writeHead(500); return r.end('index.html : balise <head> introuvable'); }
      const ins = '<meta http-equiv="Content-Security-Policy" content="' + politique.replace(/"/g, '&quot;') + '">\n<script>window.__C1_CFG=' + JSON.stringify({ exec, email }) + ';</script>\n<script src="/__c1/panneau.js"></script>\n';
      t = t.replace(marque, (m0) => m0 + '\n' + ins); corps = Buffer.from(t, 'utf8');
    }
    r.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }); r.end(corps);
  });
  return new Promise((res) => s.listen(port, o.hote || '0.0.0.0', () => res({ s, port: s.address().port, email, politique, vues })));
}
module.exports = { demarrer, csp };

if (require.main === module) {
  const argv = process.argv.slice(2); const exec = argv.find((a) => /^https?:\/\//.test(a));
  const i = argv.indexOf('--port'); const port = i >= 0 ? Number(argv[i + 1]) : 8080;
  if (!exec) { console.error('Usage : node p1/serveur_iphone.js https://script.google.com/macros/s/…/exec [--port 8080]'); process.exit(64); }
  demarrer({ exec, port }).then((d) => {
    const ips = [].concat(...Object.values(os.networkInterfaces())).filter((x) => x && x.family === 'IPv4' && !x.internal).map((x) => x.address);
    console.log('\n✅ Serveur d\'essai prêt (candidat A/A2 → projet de TEST).  Compte fictif : ' + d.email);
    console.log('   Sur l\'iPhone, EN WI-FI (même réseau que cet ordinateur), ouvre dans Safari :');
    (ips.length ? ips : ['<adresse de cet ordinateur>']).forEach((ip) => console.log('      http://' + ip + ':' + d.port + '/'));
    console.log('   Attends que l\'app soit entièrement chargée, PUIS coupe le Wi-Fi (garde les données cellulaires) et suis la procédure.');
    console.log('   (Ctrl+C pour arrêter. Aucun fichier du dépôt n\'est modifié.)\n');
  }).catch((e) => { console.error(String(e && e.message || e)); process.exit(2); });
}
