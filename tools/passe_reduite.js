#!/usr/bin/env node
/* PASSE RÉDUITE — D031S (D-031-SÉCURITÉ-01, 19/10/2026) : écrit, À CÔTÉ du runner, une copie qui ne garde que
   l'installation (serveur, garde, navigateur, page partagée), les BLOCS NOMMÉS et la fin (fermeture, TOTAL).
   Sert aux contrôles négatifs ciblés (tools/mut_faux_verts.py) : une mutation se juge sur LES témoins qu'elle vise,
   en 30 secondes, au lieu d'une passe complète. ⛔ Ne remplace JAMAIS la passe complète (protocole D-031).
   Les instructions retirées sont remplacées par « ; » — rien n'est réécrit, l'ordre et le texte des blocs gardés
   sont ceux du runner.
   Usage : node tools/passe_reduite.js <runner.js> <sortie.js> "<titre 1>" ["<titre 2>" …]
     un titre est un morceau de l'en-tête du bloc (« CLXXII. », « B-CCCXII. »…) ; un titre introuvable est une ERREUR. */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('/opt/node-tools/node_modules/acorn');
const [R, SORTIE, ...TITRES] = process.argv.slice(2);
if (!R || !SORTIE || !TITRES.length) { console.error('usage : passe_reduite.js <runner.js> <sortie.js> <titre>…'); process.exit(2); }
const src = fs.readFileSync(R, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true });
let main = null;
for (const st of ast.body) { if (st.type !== 'ExpressionStatement') continue; let e = st.expression;
  while (e && e.type === 'CallExpression' && e.callee.type === 'MemberExpression') e = e.callee.object;
  if (e && e.type === 'CallExpression' && /FunctionExpression|ArrowFunctionExpression/.test(e.callee.type) && e.callee.async) main = e.callee.body; }
if (!main) { console.error('fonction principale introuvable'); process.exit(2); }
const S = main.body, tx = n => src.slice(n.start, n.end);
const EN_TETE = /console\.log\(\s*'\\n(?:═══|--|──|════)/;
const iA = S.findIndex(n => /═══ A\. PARCOURS CROISÉ/.test(tx(n)));
if (iA < 0) { console.error('bloc A introuvable : l\'installation ne peut pas être délimitée'); process.exit(2); }
const garder = new Set();
for (let i = 0; i < iA; i++) garder.add(i);
for (const titre of TITRES) {
  const k = S.findIndex(n => tx(n).includes(titre) && EN_TETE.test(tx(n)));
  if (k < 0) { console.error('bloc introuvable : ' + titre); process.exit(3); }
  garder.add(k);
  for (let j = k + 1; j < S.length && !EN_TETE.test(tx(S[j]).slice(0, 400)); j++) garder.add(j);
}
S.forEach((n, i) => { if (/^await b\.close\(\)|^srv\.close\(\)|TOTAL CROISÉ|^process\.exit/.test(tx(n))) garder.add(i); });
let out = src;
for (let i = S.length - 1; i >= 0; i--) if (!garder.has(i)) out = out.slice(0, S[i].start) + ';' + out.slice(S[i].end);
fs.writeFileSync(SORTIE, out);
console.log(path.basename(SORTIE) + ' : ' + garder.size + ' instructions gardées sur ' + S.length + ' (installation + ' + TITRES.length + ' bloc(s) + fin)');
