#!/usr/bin/env node
/* Banc S2-B phase 4 — la bascule du client vers `cloudSave` : source + comportement.
 *
 * [!!] BANC A PART parce que le bloc de comportement est ASYNCHRONE. Le runner imprime son
 *      total de facon SYNCHRONE : y greffer un bloc async ferait imprimer le total AVANT la
 *      fin des temoins, c'est-a-dire un total tronque qui ressemble a un total vert
 *      (BUGS.md §61). Le bloc de SOURCE, lui, est branche dans le runner.
 *
 * Usage : node tools/banc_s2b_bascule.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
let ok = 0;
const ko = [];

function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  OK   ' + nom); }
  else { ko.push(nom); console.log('  !!   ' + nom + '   ' + (detail || '')); }
}

(async () => {
  const M = require(path.join(ROOT, 'tests/parcours/s2b_bascule.js'));
  M.source(t, ROOT, fs, path);
  await M.reel(t, ROOT, fs, path);
  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  // [!!] UN PLANTAGE N'EST PAS UN VERT : une passe interrompue ressemble a une passe verte.
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  process.exit(2);
});
