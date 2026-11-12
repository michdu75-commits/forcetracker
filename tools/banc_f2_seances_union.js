#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01)
/* BANC — F2-A′ (12/11/2026) : les séances se fusionnent par identifiant, plus aucune séance supprimée en silence (B-F2A, vrai Code.js en local, données inventées).
   Aucun navigateur : le banc est 100 % serveur (vm Node ; la section F lance de VRAIS processus avec un vrai verrou entre processus).
   Contrôle négatif : `python3 tools/mut_f2_seances_union.py`.
   Usage : node tools/banc_f2_seances_union.js   (depuis la racine du dépôt ou d'une copie) — `F2A_SEULEMENT=A,B,F` (liste) ne rejoue que ces sections (Z, A, B, C, D, E, G, H, F). */
const path = require('path');
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det !== undefined ? '  >> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 400) : '')); } };
require(path.join(path.dirname(__dirname), 'tests', 'parcours', 'f2_seances_union.js')).jouer(t).then(() => {
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
}).catch((e) => { console.error('PLANTAGE : ' + (e && e.stack || e)); process.exit(2); });
