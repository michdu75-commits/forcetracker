#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
/* BANC — NUT-SECURISATION-P1 (session-B, 23/10/2026) : le journal alimentaire et les favoris ne perdent plus rien en
   silence (B-NSP1, vrai Code.js en local, données inventées). Aucun navigateur : le banc est 100 % serveur.
   Destiné à la passe complète (tests/parcours/runner.js). Contrôle négatif : `python3 tools/mut_nut_secu_p1.py`.
   Usage : node tools/banc_nut_secu_p1.js   (depuis la racine du dépôt ou d'une copie) */
const path = require('path');
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
try {
  require(path.join(path.dirname(__dirname), 'tests', 'parcours', 'nut_secu_p1.js')).serveurTests(t);
} catch (e) { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); }
console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
process.exit(ko ? 1 : 0);
