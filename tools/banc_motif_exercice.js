#!/usr/bin/env node
/* BANC CIBLÉ — « qu'est-ce qu'un exercice chiffré pour le banc de Milo ? »
   Joue les blocs B-CCCXLII et B-CCCXLIII seuls, sans navigateur et SANS AUCUN APPEL À MILO.
   Usage : node tools/banc_motif_exercice.js
   Sort en code 1 dès qu'un témoin rougit. */
const fs = require('fs');
const path = require('path');
const ROOT = path.dirname(__dirname);

let ok = 0, ko = 0;
function t(nom, cond, detail) {
  if (cond) { ok++; console.log('  ✅ ' + nom); }
  else { ko++; console.log('  ❌ ' + nom + (detail ? '\n       → ' + detail : '')); }
}

console.log('\n-- B-CCCXLII / B-CCCXLIII. Le contrat « exercice chiffré » du banc --\n');
require(path.join(ROOT, 'tests/parcours/motif_exercice.js')).source(t, ROOT, fs, path);
console.log('\n  ' + ok + ' OK / ' + ko + ' rouge(s)\n');
process.exit(ko ? 1 : 0);
