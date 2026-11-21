#!/usr/bin/env node
require('../tests/_garde_reseau.js');   // ⛔ GARDE RÉSEAU EN 1ʳᵉ INSTRUCTION (D-031-SÉCURITÉ-01 : un nouveau banc se garde lui-même)
/* BANC — SCMAJ (D-170, 16/11/2026) : aucune mise à jour pendant la séance, son enregistrement, la génération et la consultation du briefing de Milo
   (blocs B-SCMAJ-*). Destiné à la passe complète (tests/parcours/runner.js) ET au contrôle négatif : `python3 tools/mut_seance_maj.py`.
   Usage : node tools/banc_seance_maj.js [pur|ecran]   (depuis la racine du dépôt ou d'un arbre copié ; SCMAJ_SEUL=A,B ne joue que ces scénarios)
   Lancer sous le garde réseau : tools/sous_garde.sh node tools/banc_seance_maj.js
   Le module crée SES serveurs (un par scénario : il simule les publications, comme `maj_version.js`) — il n'utilise pas celui de la passe. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
(async () => {
  const quoi = process.argv[2] || 'tout';
  const T = require(path.join(ROOT, 'tests', 'parcours', 'seance_maj.js'));
  if (quoi === 'tout' || quoi === 'pur') T.pur(t, ROOT, fs, path);
  if (quoi === 'tout' || quoi === 'ecran') {
    const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
    await T.ecran(t, b, 0);
    await b.close();
  }
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
