#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : tout NOUVEAU banc se garde lui-même)
/* BANC CIBLÉ — IMPORT-IA-FIDELITE-01 · LOT A : le contrat d'import de programme du Worker.
   ⭐ Il existe pour deux raisons : le contrôle négatif (`tools/mut_import_worker_contrat.py`) et parce que
   le bloc de COMPORTEMENT (`.reel`) est asynchrone — le total de la passe complète s'imprime de façon
   synchrone, y greffer un bloc async imprimerait un total tronqué qui ressemble à un total vert
   (même raison que `tools/banc_s2b_worker.js`). `.source` est synchrone : il peut rejoindre la passe.
   Aucun navigateur, aucun appel réseau réel : le vrai worker.js est conduit dans un `vm`, avec une API
   Anthropic et un Apps Script SIMULÉS.
   Usage : tools/sous_garde.sh node tools/banc_import_worker_contrat.js   (depuis la racine du dépôt ou d'une copie) */
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
let ok = 0, ko = 0;
const t = (nom, cond, det) => {
  if (cond) { ok++; console.log('   OK  ' + nom); }
  else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); }
};
(async () => {
  const mod = require(path.join(ROOT, 'tests', 'parcours', 'import_worker_contrat.js'));
  mod.source(t, ROOT, fs, path);
  await mod.reel(t, ROOT, fs, path);
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => {
  // ⛔ UN PLANTAGE N'EST PAS UN VERT : on le dit et on sort en échec (une passe interrompue ressemble à une passe verte).
  console.error('PLANTAGE : ' + (e && e.stack || e));
  console.log('\n──── ' + ok + ' OK / ' + (ko + 1) + ' rouge ────');
  process.exit(2);
});
