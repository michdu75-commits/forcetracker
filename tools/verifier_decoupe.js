#!/usr/bin/env node
/* OPTI-TEST-02 · FINALISATION — CONTRE-VÉRIFICATION INDÉPENDANTE des copies découpées (ne fait pas confiance au découpeur).
   Pour un runner et ses K copies `runner.part-K-i.js` :
   ① hors de la fonction principale, chaque copie est IDENTIQUE au runner, octet pour octet ;
   ② dans la fonction principale, chaque instruction de premier niveau est soit gardée À L'IDENTIQUE (même texte), soit
      remplacée par une instruction vide « ; » — jamais réécrite ;
   ③ chaque instruction est jouée au moins une fois sur l'ensemble des copies (rien d'OUBLIÉ), et une instruction jouée
      dans plus d'une copie appartient à la liste fermée de l'infrastructure (rien de DOUBLÉ en dehors d'elle) ;
   ④ chaque appel de module awaité est joué exactement une fois, et tous les appels d'un même module dans la même copie.
   Usage : node tools/verifier_decoupe.js <runner.js> <K>   (les copies sont lues à côté du runner) — code 0 = conforme */
'use strict';
const acorn = require('/opt/node-tools/node_modules/acorn'), fs = require('fs'), path = require('path');
const [RUNNER, K_] = process.argv.slice(2); const K = +K_;
const lire = (f) => fs.readFileSync(f, 'utf8');
const principale = (src) => {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true });
  for (const st of ast.body) {
    if (st.type !== 'ExpressionStatement') continue;
    let e = st.expression;
    while (e && e.type === 'CallExpression' && e.callee.type === 'MemberExpression') e = e.callee.object;
    if (e && e.type === 'CallExpression' && /FunctionExpression|ArrowFunctionExpression/.test(e.callee.type) && e.callee.async) return e.callee.body;
  }
  throw new Error('fonction principale introuvable');
};
const src = lire(RUNNER), M = principale(src), S = M.body;
const tx = (s, n) => s.slice(n.start, n.end);
const erreurs = [];
// l'infrastructure (liste FERMÉE, écrite ici indépendamment du découpeur) : ce qui peut légitimement être joué partout
const estInfra = (t, i, iClose) => i < S.findIndex((n) => /^await p\.(addInitScript|goto)\(/.test(tx(src, n))) && !/^await (D031S\.(identites|oracles)|require\()/.test(t) && !/^D031S\.hygiene\(/.test(t)
  || /^await b\.close\(\)/.test(t) || /^srv\.close\(\)/.test(t) || i >= S.findIndex((n) => /TOTAL CROISÉ/.test(tx(src, n)));
const joue = S.map(() => []);
for (let p = 0; p < K; p++) {
  const f = path.join(path.dirname(RUNNER), 'runner.part-' + K + '-' + p + '.js');
  const s = lire(f), m = principale(s), T = m.body;
  if (s.slice(0, m.start) !== src.slice(0, M.start) || s.slice(m.end) !== src.slice(M.end)) erreurs.push('① copie ' + p + ' : le texte hors de la fonction principale diffère');
  if (T.length !== S.length) { erreurs.push('② copie ' + p + ' : ' + T.length + ' instructions au lieu de ' + S.length); continue; }
  for (let i = 0; i < S.length; i++) {
    const a = tx(src, S[i]), b = tx(s, T[i]);
    if (b === a) joue[i].push(p);
    else if (!(T[i].type === 'EmptyStatement' && b === ';')) erreurs.push('② copie ' + p + ' instruction ' + i + ' : ni identique ni vide');
  }
}
const iClose = S.findIndex((n) => /^await b\.close\(\)/.test(tx(src, n)));
const mods = {};
for (let i = 0; i < S.length; i++) {
  const t = tx(src, S[i]);
  if (joue[i].length === 0) erreurs.push('③ OUBLIÉE : instruction ' + i + ' « ' + t.slice(0, 80) + ' »');
  if (joue[i].length > 1 && !estInfra(t, i, iClose)) erreurs.push('③ DOUBLÉE hors infrastructure : instruction ' + i + ' (copies ' + joue[i] + ') « ' + t.slice(0, 80) + ' »');
  const m = /^await require\('(\.\/[\w.-]+\.js)'\)\./.exec(t);
  if (m && i < iClose) {
    if (joue[i].length !== 1) erreurs.push('④ module ' + m[1] + ' (instruction ' + i + ') joué ' + joue[i].length + ' fois');
    (mods[m[1]] = mods[m[1]] || new Set()).add(joue[i][0]);
  }
}
for (const [m, ps] of Object.entries(mods)) if (ps.size !== 1) erreurs.push('④ module ' + m + ' éclaté sur les copies ' + [...ps]);
const bilan = { K, instructions: S.length, jouees_partout: joue.filter((j) => j.length === K).length,
  jouees_une_fois: joue.filter((j) => j.length === 1).length, modules_awaites: Object.keys(mods).length,
  par_copie: [...Array(K).keys()].map((p) => joue.filter((j) => j.includes(p)).length), erreurs };
console.log(JSON.stringify(bilan, null, 1));
process.exitCode = erreurs.length ? 1 : 0;   // exitCode, pas exit() : une sortie longue vers un tube serait tronquée
