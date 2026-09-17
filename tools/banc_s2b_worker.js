#!/usr/bin/env node
/* Banc S2-B — la route de sauvegarde du Worker : source + comportement.
 *
 * [!!] POURQUOI UN BANC À PART PLUTÔT QU'UN AJOUT AU RUNNER. Le bloc de comportement est
 *      ASYNCHRONE. Le runner imprime son total de façon SYNCHRONE : y greffer un bloc async
 *      ferait imprimer le total AVANT la fin des témoins — c'est-à-dire produirait un total
 *      tronqué qui ressemble trait pour trait à un total vert (BUGS.md §61).
 *      >> Le bloc de SOURCE, lui, est synchrone : il est bien branché dans le runner.
 *
 * Usage : node tools/banc_s2b_worker.js
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
  require(path.join(ROOT, 'tests/parcours/s2b_worker.js')).source(t, ROOT, fs, path);
  await require(path.join(ROOT, 'tests/parcours/s2b_worker_reel.js')).reel(t, ROOT, fs, path);
  console.log('\n' + ok + ' OK / ' + ko.length + ' rouge');
  ko.forEach((k) => console.log('  rouge : ' + k));
  process.exit(ko.length ? 1 : 0);
})().catch((e) => {
  // [!!] UN PLANTAGE N'EST PAS UN VERT. On le dit explicitement et on sort en échec :
  //      une passe interrompue ressemble trait pour trait à une passe verte.
  console.error('CRASH : ' + (e && e.stack || e));
  console.log('\n0 OK / 1 rouge');
  process.exit(2);
});
