#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
/* BANC — NUT-D141-MINIMAL (29/10/2026, GO tests de Michel) : la fusion SERVEUR des masquages `hiddenFoods` (B-ND141) — vrai Code.js en local
   (vm Node), données inventées, aucun navigateur, aucun réseau. Contrôle négatif : `python3 tools/mut_nut_d141_minimal.py`.
   Usage : node tools/banc_nut_d141_minimal.js */
const path = require('path');
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
try {
  require(path.join(path.dirname(__dirname), 'tests', 'parcours', 'nut_d141_minimal.js')).serveurTests(t);
} catch (e) { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); }
console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
process.exit(ko ? 1 : 0);
