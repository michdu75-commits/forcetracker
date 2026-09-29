#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════════════════
   🔬 MILO-SEANCE-FP-01 — cas mixte : la règle de STRUCTURE n'élargit rien (mesure, session-B, 29/09/2026)

   Compare `_demandeUneSeance` du code actuel à deux références, sur un corpus GÉNÉRÉ (~70 800 phrases :
   préfixes × modal × infinitif × complément × suffixe, plus les plaintes « le bouton pour … » et les
   impératifs) :
     · AVANT FP-01 (7a71649e) — la règle ne doit RIEN détecter de plus qu'avant FP-01 ;
     · FP-01 (5158c582)       — elle ne doit changer le résultat QUE dans un message qui porte aussi
                                un marqueur de discussion (bouton · bug · affiché · apparu · négation).
   Code de sortie 1 si l'une des deux propriétés tombe. ⛔ Ni navigateur, ni réseau : la fonction est
   extraite du fichier et évaluée seule (elle ne dépend de rien d'autre).
   ⚠️ Ce que ça ne dit PAS : si une phrase réelle, hors de ce corpus, se comporte bien — le corpus est
   combinatoire, pas un échantillon de vrais messages. Les témoins d'écran sont dans
   tests/parcours/seance_fp01.js (B-CDX · B-CDXI).
   Usage : node tools/corpus_fp01.js [AVANT] [FP01]
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const [AVANT = '7a71649e', FP01 = '5158c582'] = process.argv.slice(2);

const srcOf = rev => rev === 'WT' ? fs.readFileSync(path.join(ROOT, 'coach.js'), 'utf8')
  : execSync('git show ' + rev + ':coach.js', { cwd: ROOT, maxBuffer: 1e8 }).toString();
const fnOf = src => {
  const i = src.indexOf('function _demandeUneSeance(');
  if (i < 0) throw new Error('_demandeUneSeance introuvable');
  const j = src.indexOf('\nfunction ', i + 10);
  return new Function(src.slice(i, j < 0 ? undefined : j) + '\nreturn _demandeUneSeance;')();
};
const f0 = fnOf(srcOf(AVANT)), f1 = fnOf(srcOf(FP01)), fx = fnOf(srcOf('WT'));

// le marqueur de discussion tel que le garde FP-01 le lit (sur la copie sans accents)
const MARQUEUR = /\bbouton|\bb(?:u|eu)g\b|\baffich|\bapparu|\bapparai|\b(?:demande|veux|voulais|voudrais)\s+pas\b|\bpas\s+besoin\b/i;
const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const pre = ['', 'Pourquoi ', 'Stp ', 'Non ', 'Ok ', 'Du coup '];
const mod = ['tu peux', 'peux-tu', 'pourrais-tu', 'tu pourrais', 'peux tu', 'est-ce que tu peux'];
const inf = ['faire', 'préparer', 'proposer', 'donner', 'créer', 'construire', 'monter', 'écrire', 'lancer', 'balancer',
             'envoyer', 'générer', 'refaire', 'montrer', 'expliquer', 'dire'];
const obj = ['une séance', 'ma séance', 'ta séance', 'la séance', 'une petite séance', 'une séance jambes', 'ma séance du jour',
             'un résumé de ma séance', 'un résumé de la séance', 'un bilan de cette séance', 'ton avis sur ma dernière séance',
             'un plan de séance', 'une nouvelle séance', 'vite une séance', 'un entraînement'];
const suf = ['', ' ?', ' ? le bouton bug', ' même si le bouton bug', ', ça affiche un bug', ' le bouton est apparu', ' stp',
             ' je veux pas de carte'];
const corpus = [];
for (const a of pre) for (const m of mod) for (const v of inf) for (const o of obj) for (const s of suf) {
  const me = /^[aeéiou]/i.test(v) ? "m'" : 'me ';
  const x = a + m + ' ' + me + v + ' ' + o + s;
  corpus.push(a ? x : x[0].toUpperCase() + x.slice(1));
}
for (const v of inf) for (const o of obj) for (const s of [' bug', ' ne marche plus', ' est affiché', '']) corpus.push('Le bouton pour ' + v + ' ' + o + s);
for (const v of ['Fais-moi', 'Prépare-moi', 'Donne-moi', 'Propose-moi', 'Lance', 'Envoie-moi']) for (const o of obj) for (const s of suf) corpus.push(v + ' ' + o + s);

let plusQuAvant = [], changeSansMarqueur = [], perduDepuisFp01 = [], retrouves = 0, rejetees = 0;
for (const x of corpus) {
  const a = f0(x), b = f1(x), c = fx(x), marque = MARQUEUR.test(sansAccents(x));
  if (c && !a) plusQuAvant.push(x);
  if (b !== c && !marque) changeSansMarqueur.push(x);
  if (b && !c) perduDepuisFp01.push(x);
  if (!b && c) retrouves++;
  if (a && !c) rejetees++;
}
console.log('corpus : ' + corpus.length + ' phrases · références ' + AVANT + ' (avant FP-01) et ' + FP01 + ' (FP-01)');
console.log('  détectées maintenant, PAS avant FP-01 ............ ' + plusQuAvant.length + '   (attendu 0)', plusQuAvant.slice(0, 3));
console.log('  changées depuis FP-01 SANS marqueur de discussion  ' + changeSansMarqueur.length + '   (attendu 0)', changeSansMarqueur.slice(0, 3));
console.log('  demandes de FP-01 perdues maintenant ............. ' + perduDepuisFp01.length + '   (attendu 0)', perduDepuisFp01.slice(0, 3));
console.log('  demandes retrouvées depuis FP-01 (cas mixte) ..... ' + retrouves);
console.log('  détectées avant FP-01, rejetées maintenant ....... ' + rejetees + '   (toutes avec un marqueur : c\'est FP-01)');
const ok = !plusQuAvant.length && !changeSansMarqueur.length && !perduDepuisFp01.length;
console.log(ok ? '──── PROPRIÉTÉS TENUES ────' : '──── ❌ PROPRIÉTÉ TOMBÉE ────');
process.exit(ok ? 0 : 1);
