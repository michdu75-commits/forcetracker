#!/usr/bin/env node
/* BANC CIBLÉ — CCXXVIII bis (13/10/2026) : qui est un générateur ? Sans navigateur : le dépôt est lu tel quel.
   Il existe pour que le contrôle négatif (`tools/mut_gouv_generateurs.py`) rejoue ses mutations en secondes.
   Usage : node tools/banc_gouv_generateurs.js */
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
let ok = 0, ko = 0;
const t = (nom, cond, det) => {
  if (cond) { ok++; console.log('   OK  ' + nom); }
  else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); }
};
try {
  require(path.join(ROOT, 'tests', 'parcours', 'gouv_generateurs.js')).source(t, ROOT, fs, path);
} catch (e) { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); }
console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
process.exit(ko ? 1 : 0);
