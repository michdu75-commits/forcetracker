#!/usr/bin/env node
/* OPTI-TEST-02 · FINALISATION (23/10/2026) — DÉCOUPEUR de la passe D-031 en K processus, adapté au runner D031S.
   ⛔ Il ne modifie AUCUN fichier existant : il écrit K NOUVEAUX fichiers `tests/parcours/runner.part-<K>-<i>.js` dans une
   COPIE, chacun identique au runner, sauf que certaines instructions de premier niveau de la fonction principale sont
   remplacées par « ; » (retirées, jamais réécrites). Les copies se suppriment après la passe.

   LES RÈGLES (fermées par défaut : toute instruction qu'il ne sait pas classer ARRÊTE la découpe)
   · INFRASTRUCTURE (dans TOUS les processus) : serveur, navigateur, enveloppes du garde, la PREUVE du garde
     (`D031S.debut`, D031S-I) et, par l'enveloppe de `b.close`, sa vérification de fin (D031S-II). ⛔ Un processus sans
     garde prouvé ne joue rien : chaque processus doit donc se prouver lui-même. Leurs témoins comptent K fois.
   · les autres contrôles du garde (`D031S.identites` · `hygiene` · `oracles` : D031S-III, IV, V, VII) : processus 0, UNE fois.
   · chaque appel de MODULE AWAITÉ de premier niveau (`await require('./x.js').f(t, b, PORT)`) : dans UN SEUL processus,
     selon la répartition ; ⛔ tous les appels d'un même module vont au MÊME processus, dans leur ordre (état du module).
   · tout le reste (les blocs du runner, la chaîne de la page partagée `p`, les contrôles de source après `b.close()`) :
     processus 0, dans l'ordre.
   · `b.close()`, `srv.close()`, la ligne de TOTAL et `process.exit` : dans TOUS les processus.
   CONTRÔLES (refus = arrêt, code 3) : un module reçoit autre chose que l'infrastructure ; une instruction d'installation
   inconnue qui produit des témoins (`t(`) ou charge un module ; une instruction non partagée gardée 0 ou 2 fois ; un module
   de la répartition absent du runner ; un repère introuvable.
   Usage : node tools/decouper_passe.js <runner.js> <K> <repartition.json> [--simuler]   (--simuler : n'écrit rien, rend le bilan) */
'use strict';
const acorn = require('/opt/node-tools/node_modules/acorn'), fs = require('fs'), path = require('path');
const [RUNNER, K_, REP, OPT] = process.argv.slice(2); const K = +K_;
const stop = (m) => { console.error('DÉCOUPE REFUSÉE : ' + m); process.exit(3); };
if (!RUNNER || !(K >= 1)) stop('usage : decouper_passe.js <runner.js> <K> <repartition.json> [--simuler]');
const src = fs.readFileSync(RUNNER, 'utf8');
const rep = REP ? JSON.parse(fs.readFileSync(REP, 'utf8')) : {};
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true, locations: true });
let main = null;
for (const st of ast.body) {
  if (st.type !== 'ExpressionStatement') continue;
  let e = st.expression;
  while (e && e.type === 'CallExpression' && e.callee.type === 'MemberExpression') e = e.callee.object;
  if (e && e.type === 'CallExpression' && /FunctionExpression|ArrowFunctionExpression/.test(e.callee.type) && e.callee.async) main = e.callee.body;
}
if (!main) stop('fonction principale introuvable');
const S = main.body, texte = (n) => src.slice(n.start, n.end);
const appel = (n) => {            // `await require('./x.js').f(...)` (ou sans await) au premier niveau
  let e = n.type === 'ExpressionStatement' ? n.expression : null; if (!e) return null;
  const aw = e.type === 'AwaitExpression'; if (aw) e = e.argument;
  if (!e || e.type !== 'CallExpression' || e.callee.type !== 'MemberExpression') return null;
  const o = e.callee.object;
  if (o.type !== 'CallExpression' || o.callee.name !== 'require' || !o.arguments[0] || o.arguments[0].type !== 'Literal') return null;
  if (!/^\.\/[\w.-]+\.js$/.test(o.arguments[0].value)) return null;
  return { mod: o.arguments[0].value, fn: e.callee.property.name, aw, args: e.arguments.map(texte) };
};
const garde = (n) => {             // un appel `D031S.x(...)` au premier niveau (await ou non)
  let e = n.type === 'ExpressionStatement' ? n.expression : null; if (!e) return null;
  if (e.type === 'AwaitExpression') e = e.argument;
  if (!e || e.type !== 'CallExpression' || e.callee.type !== 'MemberExpression' || e.callee.object.name !== 'D031S') return null;
  return e.callee.property.name;
};
const iInstall = S.findIndex((n) => /^await p\.(addInitScript|goto)\(/.test(texte(n)));
const iClose = S.findIndex((n) => /^await b\.close\(\)/.test(texte(n)));
const iSrvClose = S.findIndex((n) => /^srv\.close\(\)/.test(texte(n)));
const iTotal = S.findIndex((n) => /TOTAL CROISÉ/.test(texte(n)));
const iDebut = S.findIndex((n) => n.type === 'BlockStatement' && /await D031S\.debut\(t, b, PORT, chromium\)/.test(texte(n)));
if ([iInstall, iClose, iSrvClose, iTotal, iDebut].some((x) => x < 0)) stop('repères introuvables ' + [iInstall, iClose, iSrvClose, iTotal, iDebut]);
if (!(iDebut < iInstall && iInstall < iClose && iClose < iTotal)) stop('repères dans un ordre inattendu');
if (!/b\.close=async\(\.\.\.a\)=>\{ await D031S\.fin\(t\); return _fermeNav\(\.\.\.a\); \};/.test(src)) stop('enveloppe de b.close (D031S.fin) introuvable');
// ROOT, fs, path : constantes du fichier, IDENTIQUES dans chaque copie (même dossier tests/parcours, même calcul de ROOT)
const INFRA = new Set(['t', 'b', 'PORT', 'ROOT', 'fs', 'path']);
const classe = S.map((n, i) => {
  const a = appel(n), g = garde(n), tx = texte(n);
  if (i >= iTotal) return { k: 'fin', tous: true };
  if (i === iClose || i === iSrvClose) return { k: 'fermeture', tous: true };
  if (a && a.aw && i < iClose) {
    for (const x of a.args) if (!INFRA.has(x)) stop('module ' + a.mod + ' reçoit « ' + x + ' » (pas l\'infrastructure t, b, PORT, ROOT, fs, path)');
    return { k: 'module', mod: a.mod, fn: a.fn, part: rep[a.mod] || 0 };
  }
  if (i === iDebut) return { k: 'preuve-garde', tous: true };
  if (g) {
    if (g === 'debut' || g === 'fin') stop('appel D031S.' + g + ' hors de son emplacement prévu (instruction ' + i + ')');
    return { k: 'garde-controle', fn: g, part: 0 };
  }
  if (i < iInstall) {
    // installation : uniquement de l'infrastructure, sans témoin ni module
    if (/\bt\(/.test(tx) || /require\('\.\/[\w.-]+\.js'\)\.(?!.*garde_reseau)/.test(tx)) stop('instruction d\'installation inconnue qui produit des témoins ou charge un module : ' + tx.slice(0, 120));
    return { k: 'installation', tous: true };
  }
  return { k: 'runner', part: 0 };
});
// la répartition ne cite que des modules du runner
const presents = new Set(classe.filter((c) => c.k === 'module').map((c) => c.mod));
for (const m of Object.keys(rep)) if (!presents.has(m)) stop('module de la répartition absent du runner : ' + m);
for (const m of Object.keys(rep)) if (!(rep[m] >= 0 && rep[m] < K)) stop('processus hors bornes pour ' + m + ' : ' + rep[m]);
// chaque instruction non partagée est gardée dans exactement 1 processus
for (let i = 0; i < S.length; i++) { const c = classe[i]; if (c.tous) continue;
  const n = [...Array(K).keys()].filter((p) => c.part === p).length;
  if (n !== 1) stop('instruction ' + i + ' gardée ' + n + ' fois'); }
const bilan = { K, runner: path.basename(RUNNER), instructions: S.length,
  infrastructure: classe.filter((c) => c.tous).length,
  modules: [...presents].length, appelsModules: classe.filter((c) => c.k === 'module').length,
  repartis: classe.filter((c) => c.k === 'module').reduce((o, c) => { o[c.part] = (o[c.part] || 0) + 1; return o; }, {}),
  parts: [] };
for (let p = 0; p < K; p++) {
  let out = src; const retirees = [];
  for (let i = S.length - 1; i >= 0; i--) {
    const c = classe[i];
    if (!(c.tous || c.part === p)) { out = out.slice(0, S[i].start) + ';' + out.slice(S[i].end); retirees.push(i); }
  }
  const f = path.join(path.dirname(RUNNER), 'runner.part-' + K + '-' + p + '.js');
  if (OPT !== '--simuler') fs.writeFileSync(f, out);
  bilan.parts.push({ part: p, fichier: path.basename(f), instructionsGardees: S.length - retirees.length,
    modules: [...new Set(classe.filter((c) => c.k === 'module' && c.part === p).map((c) => c.mod))] });
}
console.log(JSON.stringify(bilan, null, 1));
