#!/usr/bin/env node
/* MESURE — combien pèsent les versions d'un programme (LOT 1 IMPORT PROGRAMME, 07/10/2026).
   Utilise les VRAIES fonctions de log.js (`_progNouveau`, `_progNouvelleVersion`, `_progContenu`),
   extraites du fichier servi et exécutées dans un bac à sable : la structure mesurée est celle que
   l'app écrit réellement dans `ft4_progs` (et envoie au cloud dans `programmes`).
   Programmes représentatifs : un « simple à plat » (6 exercices × 3 séries) et un « type
   Powerbuilding » (4 jours × 9 exercices, montées d'échauffement, notes de consigne, repos) — la
   forme exacte d'un import réel après regroupement des échauffements. ⛔ Aucun programme réel de
   Michel n'est lu (ils ne sont pas dans le dépôt) : ce sont des gabarits de même forme.
   Usage : node tools/mesure_versions_programme.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'log.js'), 'utf8');
const a = src.indexOf('const PROG_SCHEMA=1;'), b = src.indexOf('function _progContenuVenuDUnImport(p){');
if (a < 0 || b < 0) { console.error('Bloc LOT 1 introuvable dans log.js'); process.exit(2); }
const ctx = { S: { programmes: [] }, console, JSON, Math, Date, Set, Object, String, parseInt, Array };
vm.createContext(ctx);
vm.runInContext(src.slice(a, b), ctx);
const L = (n, sets, reps, kg, note, typeE) => ({ name: n, note: note || '', sets: Array.from({ length: sets }, (_, i) => ({ kg: kg, reps: reps, type: (typeE && i < typeE) ? 'É' : 'N', rest: (typeE && i < typeE) ? 60 : 150 })) });
function plat(seed) {
  return { name: 'Haut du corps', exs: ['Développé Couché', 'Rowing Barre', 'Développé Militaire', 'Tirage Vertical', 'Curl Barre', 'Extension Triceps Poulie'].map((n, i) => L(n, 3, 10, 40 + i * 5 + seed, '')) };
}
function powerbuilding(seed) {
  const noms = [['Squat à la Barre', 'Presse à Cuisses', 'Fentes Marchées', 'Leg Curl Assis', 'Leg Extension', 'Mollets Debout', 'Hip Thrust Barre', 'Abduction Cuisses', 'Gainage'],
    ['Développé Couché', 'Développé Incliné Haltères', 'Dips', 'Écarté Poulie', 'Développé Militaire', 'Élévations Latérales', 'Extension Triceps Poulie', 'Barre au Front', 'Pompes'],
    ['Soulevé de Terre', 'Tractions', 'Rowing Barre', 'Tirage Vertical', 'Rowing Haltère', 'Face Pull', 'Curl Barre', 'Curl Marteau', 'Shrugs'],
    ['Squat Avant', 'Développé Couché Prise Serrée', 'Rowing Poitrine Appuyée', 'Développé Épaules Assis Machine', 'Leg Curl Couché', 'Tirage Poulie Haute', 'Curl Pupitre', 'Extension Triceps Haltère', 'Crunch Poulie']];
  return { name: 'Powerbuilding 6 semaines', weeks: 6, startDate: '2026-10-05', days: noms.map((jour, d) => ({ label: 'Séance ' + (d + 1) + ' - ' + ['Jambes', 'Push', 'Pull', 'Mix'][d],
    exs: jour.map((n, i) => L(n, i < 2 ? 7 : 4, i < 2 ? 4 : 10, 60 + i * 7 + seed, i < 2 ? 'Montée 50/65/80 % puis 3 séries de travail · RIR 1-2 · repos 3 min entre les séries lourdes' : 'RIR 2 · tempo contrôlé', i < 2 ? 3 : 0)) })) };
}
const DOC = { id: 'd1791375775251abcd', hash: 'f'.repeat(64), pages: 6, files: [{ name: 'programme.pdf', hash: 'e'.repeat(64) }], at: '2026-10-07T12:00:00.000Z' };
function mesurer(gabarit, nVersions) {
  ctx.S.programmes = [];
  const p = ctx._progNouveau(gabarit(0), 'import', 'import', DOC); ctx.S.programmes.push(p);
  for (let v = 2; v <= nVersions; v++) ctx._progNouvelleVersion(p, gabarit(v), v % 3 === 0 ? 'restore' : 'update', DOC);
  return Buffer.byteLength(JSON.stringify(p), 'utf8');
}
const o = (n) => (n / 1024).toFixed(1) + ' Ko';
const lignes = [];
for (const [nom, g] of [['simple à plat (6 ex. × 3 séries)', plat], ['type Powerbuilding (4 j × 9 ex., échauffements, notes)', powerbuilding]]) {
  const t1 = mesurer(g, 1), t5 = mesurer(g, 5), t10 = mesurer(g, 10);
  lignes.push({ nom, t1, t5, t10, parVersion: Math.round((t10 - t1) / 9) });
}
console.log('Taille JSON d\'UN programme (telle qu\'écrite dans ft4_progs et envoyée au cloud) :');
lignes.forEach(l => console.log('  · ' + l.nom + ' : 1 version ' + o(l.t1) + ' · 5 versions ' + o(l.t5) + ' · 10 versions ' + o(l.t10) + ' (≈ ' + o(l.parVersion) + ' par version)'));
const pb = lignes[1], pl = lignes[0];
const scen = [
  ['Michel aujourd\'hui (ordre de grandeur : 3 copies d\'un Powerbuilding + 3 programmes simples), 1 version chacun', 3 * pb.t1 + 3 * pl.t1],
  ['les mêmes après 5 versions chacun', 3 * pb.t5 + 3 * pl.t5],
  ['les mêmes après 10 versions chacun', 3 * pb.t10 + 3 * pl.t10],
  ['cas lourd : 10 programmes Powerbuilding × 10 versions', 10 * pb.t10]
];
console.log('\nft4_progs (et le champ `programmes` du corps envoyé au cloud), selon l\'usage :');
scen.forEach(([n, t]) => console.log('  · ' + n + ' : ' + o(t)));
console.log('\nRepère : le quota localStorage d\'un navigateur mobile est d\'environ 5 Mo pour TOUTE l\'app (séances, journal alimentaire, etc.).');
/* ⭐ Côté SERVEUR, ce n'est pas la taille brute qui compte : Code.js range chaque compte dans les Script
   Properties, GZIPPÉ puis en base64 (`_packUser_`) — un réservoir COMMUN à tous les comptes (≈ 500 Ko,
   plein à 102 % le 29/07/2026). On mesure donc aussi la taille emballée, avec la même recette. */
const zlib = require('zlib');
const emballe = obj => ('GZ:' + zlib.gzipSync(Buffer.from(JSON.stringify(obj), 'utf8')).toString('base64')).length;
function liste(gabarits) { ctx.S.programmes = []; gabarits.forEach(([g, n]) => { const p = ctx._progNouveau(g(0), 'import', 'import', DOC); ctx.S.programmes.push(p); for (let v = 2; v <= n; v++) ctx._progNouvelleVersion(p, g(v), 'update', DOC); }); return JSON.parse(JSON.stringify(ctx.S.programmes)); }
const cas = [
  ['3 Powerbuilding + 3 simples, 1 version', liste([[powerbuilding, 1], [powerbuilding, 1], [powerbuilding, 1], [plat, 1], [plat, 1], [plat, 1]])],
  ['3 Powerbuilding + 3 simples, 5 versions', liste([[powerbuilding, 5], [powerbuilding, 5], [powerbuilding, 5], [plat, 5], [plat, 5], [plat, 5]])],
  ['3 Powerbuilding + 3 simples, 10 versions', liste([[powerbuilding, 10], [powerbuilding, 10], [powerbuilding, 10], [plat, 10], [plat, 10], [plat, 10]])],
  ['10 Powerbuilding × 10 versions', liste(Array.from({ length: 10 }, () => [powerbuilding, 10]))]
];
console.log('\nCôté serveur (Script Properties, emballé GZ+base64 comme `_packUser_`) — la seule part `programmes` :');
const emb = cas.map(([n, l]) => { const e = emballe(l); console.log('  · ' + n + ' : brut ' + o(Buffer.byteLength(JSON.stringify(l))) + ' → emballé ' + o(e)); return { n, brut: Buffer.byteLength(JSON.stringify(l)), emballe: e }; });
console.log(JSON.stringify({ lignes, scen: scen.map(([n, t]) => ({ n, octets: t })), emb }));
