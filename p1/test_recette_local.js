#!/usr/bin/env node
/* ÉPREUVE LOCALE DE `recetteRestaurationP1` (p1/TestP1.js) SUR UN FAUX GOOGLE (p1/shim_gas_local.js) — avant de la donner à Michel.
   Trois familles, parce qu'un test qui ne peut pas rougir ne prouve rien :
     ① CHEMIN SAIN : le vrai Code.js + la vraie fonction → PASS 10/10, fichiers écrits UNIQUEMENT dans le dossier de TEST, dossier « de production » intact, jeton retiré, aucun déclencheur ajouté.
     ② GARDES : chacune des conditions d'arrêt (10 cas) → la fonction REFUSE et RIEN n'est écrit (propriétés, Drive, déclencheurs : instantané avant = après).
     ③ PANNES INJECTÉES : on casse la restauration, la sauvegarde, le marqueur, le témoin, le jeton, le verrou… → le verdict doit passer à FAIL sur LE bon critère, et le jeton jetable doit être retiré.
   Usage : node p1/test_recette_local.js */
'use strict';
const { creer } = require('./shim_gas_local');
let ok = 0, rouge = 0;
const t = (nom, cond, det) => { cond ? ok++ : rouge++; console.log((cond ? '   OK  ' : '❌ ROUGE ') + nom + (det !== undefined && det !== '' ? '   >> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 230) : '')); };
const rid = () => 'rq' + require('crypto').randomBytes(8).toString('hex');

function monde(o) {
  o = o || {};
  const w = creer(o);
  const dossier = w.nouveauDossier(o.nomDossier || 'FT-TEST-P1-RECUP-local');
  const prod = w.nouveauDossier('ForceTracker-Backups');                       // le dossier « de la production » : il existe dans le même Drive, et NE DOIT JAMAIS bouger
  ['backup-2026-11-10.json', 'backup-2026-11-11.json'].forEach((n) => prod.createFile(n, '{"users":[]}', 'application/json'));
  w.etat.ecritures.length = 0;
  w.props.set('LECTURE_STRICTE', 'off');
  if (!o.sansTest) w.props.set('FT_P1_TEST', '1');
  if (!o.sansDossier) w.props.set('ft_backup_drive_folder_id', o.idDossier || dossier.getId());
  for (let i = 0; i < (o.anciens === undefined ? 4 : o.anciens); i++) {              // des restes d'essais d'avant, comme dans le vrai projet de TEST
    const c = w.ctx.recetteP0Champs_(8 + i, 3, 2, 'Ancien ' + i);
    const r = w.sauver(Object.assign({ action: 'saveProfile', email: 'p1-ancien' + i + '-ab12@example.invalid', foodLogV: 3, requestId: rid() }, JSON.parse(JSON.stringify(c))));
    if (!r.ok) throw new Error('préparation du monde : ' + JSON.stringify(r).slice(0, 120));
  }
  return Object.assign(w, { dossier, prod });
}
const lancer = (w) => JSON.parse(JSON.stringify(w.ctx.recetteRestaurationP1()));
const noms = (d) => d._d.fichiers.map((f) => f.nom);
const ids = (d) => d._d.fichiers.map((f) => f.id).join(',');
const R = (v) => Array.from({ length: 10 }, (_, i) => 'R' + (i + 1)).filter((k) => !v.r[k]);

/* ══════════ ① CHEMIN SAIN ══════════ */
console.log('\n=== ① CHEMIN SAIN — le vrai Code.js, la vraie fonction, un faux Google ===');
{
  const w = monde(); const avantProd = ids(w.prod), declAvant = w.declencheurs.length;
  const v = lancer(w);
  t('PASS 10/10 (R1 à R10 tous vrais, aucune erreur, gardes passées)', v.pass === true && R(v).length === 0 && v.gardes === true && v.erreur === undefined, { ko: R(v), erreur: v.erreur });
  const n = noms(w.dossier);
  t('le dossier de TEST reçoit exactement : 2 sauvegardes + 1 marqueur de verdict « P0-VERDICT-PASS-…-10sur10.txt »', n.length === 3 && n.filter((x) => /^backup-\d{4}-\d{2}-\d{2}(-\d{2}-\d{2})?\.json$/.test(x)).length === 2 && n.filter((x) => /^P0-VERDICT-PASS-\d{8}T\d{6}Z-10sur10\.txt$/.test(x)).length === 1, n);
  t('AUCUNE écriture hors du dossier de TEST (toutes les écritures Drive visent le dossier désigné)', w.etat.ecritures.length === 3 && w.etat.ecritures.every((e) => e.dossierId === w.dossier.getId()), w.etat.ecritures.map((e) => e.dossier));
  t('le dossier « ForceTracker-Backups » (production) est INTACT : mêmes fichiers, aucun de plus', ids(w.prod) === avantProd && w.prod._d.fichiers.length === 2);
  t('le jeton jetable est retiré (ADMIN_TOKEN absent) et aucun déclencheur n\'a été ajouté', !w.props.has('ADMIN_TOKEN') && w.declencheurs.length === declAvant);
  const A = v.comptes.A, B = v.comptes.B, d = w.ctx.loadUserData_(A);
  t('le compte A finit à S1 (63 séances : l\'annulation a bien remis le point de retour) et le témoin B existe, intact', d && d.sessions.length === 63 && w.props.has('u_' + B), { sessionsA: d && d.sessions.length });
  t('comptes fictifs seulement (@example.invalid) et aucun courriel envoyé', /@example\.invalid$/.test(A) && /@example\.invalid$/.test(B) && w.courriels.length === 0);
  const marq = w.dossier._d.fichiers.find((f) => /^P0-VERDICT/.test(f.nom)), mj = marq ? JSON.parse(marq.buf.toString('utf8')) : null;
  t('le marqueur contient le verdict complet (même critères, même PASS) ; la propriété FT_P1_RECETTE_P0 aussi', mj && mj.pass === true && Object.keys(mj.r).length === 10 && JSON.parse(w.props.get('FT_P1_RECETTE_P0')).pass === true);
  t('chaque critère porte sa preuve chiffrée (détails non vides pour R1 à R10)', Array.from({ length: 10 }, (_, i) => v.d['R' + (i + 1)]).every((x) => typeof x === 'string' && x.length > 5), v.d);
  t('durée < 120 s et aucun « verrou occupé »', v.dureeMs < 120000 && v.verrouOccupe === false, v.dureeMs + ' ms');
  /* rejouable : une 2ᵉ exécution (autres comptes, même dossier, backups du même jour suffixés) passe aussi */
  const v2 = lancer(w);
  t('REJOUABLE : une 2ᵉ exécution le même jour passe aussi (nouveaux comptes, sauvegardes suffixées -HH-mm)', v2.pass === true && v2.comptes.A !== v.comptes.A, { ko: R(v2), erreur: v2.erreur });
}

/* ══════════ ② GARDES : la fonction refuse, RIEN n'est écrit ══════════ */
console.log('\n=== ② GARDES — chaque condition d\'arrêt : refus, et instantané des propriétés / de Drive / des déclencheurs INCHANGÉ ===');
const refus = (nom, o, prep, motif) => {
  const w = monde(o); if (prep) prep(w);
  const av = JSON.stringify(w.instantane()), avProd = ids(w.prod), avTest = ids(w.dossier);
  let v, erreurThrown = null;
  try { v = lancer(w); } catch (e) { erreurThrown = e; }
  const ap = JSON.stringify(w.instantane());
  t(nom + ' → REFUS (FAIL, gardes non passées, message « ⛔ … rien n\'a été écrit »)', !erreurThrown && v && v.pass === false && v.gardes === false && /⛔/.test(v.erreur || '') && (!motif || motif.test(v.erreur)), v ? v.erreur : String(erreurThrown));
  t(nom + ' → RIEN écrit : propriétés, fichiers, déclencheurs identiques ; dossiers de TEST et de « production » intacts', av === ap && ids(w.prod) === avProd && ids(w.dossier) === avTest, { avant: av.length, apres: ap.length });
  return w;
};
refus('G1 projet non préparé (FT_P1_TEST absent)', { sansTest: true }, null, /FT_P1_TEST/);
creerRefus: {
  const w = monde({ sheetId: '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg' }), av = JSON.stringify(w.instantane());
  const v = lancer(w);
  t('G2 feuille de production NON neutralisée → REFUS, rien d\'écrit', v.pass === false && v.gardes === false && /SHEET_ID_/.test(v.erreur) && av === JSON.stringify(w.instantane()), v.erreur);
}
refus('G3 la propriété désigne « ForceTracker-Backups » (le dossier de la production)', {}, (w) => w.props.set('ft_backup_drive_folder_id', w.prod.getId()), /FT-TEST-P1/);
refus('G4 aucune propriété de dossier (le serveur retomberait sur « ForceTracker-Backups » par son nom)', { sansDossier: true }, null, /ft_backup_drive_folder_id/);
refus('G5 identifiant de dossier illisible (même repli dangereux)', {}, (w) => w.props.set('ft_backup_drive_folder_id', 'D999999-introuvable'), /FT-TEST-P1/);
refus('G6 un jeton d\'administration existe déjà (on n\'y touche pas)', {}, (w) => w.props.set('ADMIN_TOKEN', 'un-vrai-jeton-existant-0123456789'), /jeton d'administration existe déjà/);
refus('G7 un compte NON fictif est présent', {}, (w) => w.props.set('u_quelquun@exemple-reel.test', 'x'), /FICTIFS/);
refus('G8 un secret est présent (clé du fournisseur d\'IA)', {}, (w) => w.props.set('ANTHROPIC_API_KEY', 'sk-test-0000'), /FICTIFS|secret/);
refus('G9 stockage des propriétés trop plein', {}, (w) => w.props.set('RESTE_ENORME', 'x'.repeat(400000)), /trop plein/);
refus('G10 le dossier de TEST est à la corbeille', {}, (w) => w.dossier.setTrashed(true), /corbeille/);
{
  const w = monde({}); w.props.set('ADMIN_TOKEN', 'un-vrai-jeton-existant-0123456789'); lancer(w);
  t('G6b le jeton existant n\'a PAS été retiré par la fonction (on ne supprime que son propre jeton jetable)', w.props.get('ADMIN_TOKEN') === 'un-vrai-jeton-existant-0123456789');
}

/* ══════════ ③ PANNES INJECTÉES : le verdict doit passer à FAIL sur le bon critère ══════════ */
console.log('\n=== ③ PANNES INJECTÉES — chaque défaut doit être VU (FAIL sur le bon critère), et le jeton jetable retiré ===');
function panne(nom, o, bricoler, critere, extra) {
  const w = monde(o); const etatAppels = { restauration: 0, sauvegarde: 0 }; bricoler(w, etatAppels);
  const v = lancer(w), ko = R(v);
  t(nom + ' → FAIL, et ' + critere + ' est KO', v.pass === false && (Array.isArray(critere) ? critere : [critere]).every((c) => ko.indexOf(c) >= 0) && (!extra || extra(w, v, etatAppels)), { ko, erreur: (v.erreur || '').slice(0, 90) });
  return { w, v, etatAppels };
}
const sansJeton = (w) => !w.props.has('ADMIN_TOKEN');
panne('P1 la restauration ne restaure rien (répond « ok » à vide)', {}, (w) => { w.ctx.handleAdminRestore_ = (b) => w.ctx.json_({ status: 'ok', sessions: 60, prs: 3, name: 'x' }); }, 'R5', sansJeton);
panne('P2 la sauvegarde n\'écrit aucun fichier', {}, (w, a) => { w.ctx.backupAllUserData_ = () => { a.sauvegarde++; }; }, 'R2', (w, v, a) => sansJeton(w) && a.restauration === 0 && !w.props.has('u_' + v.comptes.B + '_restaure'));
panne('P3 la sauvegarde écrit dans UN AUTRE dossier (pas celui du TEST)', {}, (w) => { const autre = w.nouveauDossier('Autre-dossier'); w.ctx.backupAllUserData_ = () => { autre.createFile('backup-ailleurs.json', '{"users":[]}', 'application/json'); }; }, 'R2');
panne('P4 la restauration abaisse le marqueur v3', {}, (w) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { const o = r(b); const d = w.ctx.loadUserData_(b.email); delete d.nutProto; w.ctx.saveUserData_(b.email, d); return o; }; }, 'R6', sansJeton);
panne('P5 la restauration de A écrit aussi dans le compte témoin B', {}, (w) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { const o = r(b); const k = Array.from(w.props.keys()).find((x) => /^u_p0r-b-/.test(x)); w.props.set(k, w.props.get(k) + ' '); return o; }; }, 'R7', sansJeton);
{
  const { w, v } = panne('P6 le jeton jetable ne peut pas être retiré', { ecritureRefusee: (k, op) => k === 'ADMIN_TOKEN' && op === 'delete' }, () => {}, 'R9');
  t('P6b … et la fonction DIT que le jeton est resté (détail de R9)', /jeton jetable absent : false/.test(v.d.R9 || ''), v.d.R9);
}
panne('P7 le verrou est occupé (NUT_LOCK_BUSY dès le départ)', {}, (w) => { w.etat.verrouOccupe = true; }, 'R10', (w, v) => sansJeton(w) && !!v.erreur);
panne('P8 la restauration annonce 61 séances au lieu de 60', {}, (w) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { const o = JSON.parse(r(b).getContent()); o.sessions = 61; return w.ctx.json_(o); }; }, 'R4', sansJeton);
panne('P9 l\'annulation (3ᵉ restauration, depuis le point de retour) ne fait rien', {}, (w, a) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { a.restauration++; return a.restauration === 3 ? w.ctx.json_({ status: 'ok', sessions: 60, prs: 3, name: 'x' }) : r(b); }; }, 'R8', sansJeton);
panne('P10 la restauration oublie une séance (59 au lieu de 60)', {}, (w) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { const c = JSON.parse(JSON.stringify(b.data)); if ((c.sessions || []).length === 60) c.sessions.pop(); return r(Object.assign({}, b, { data: c })); }; }, ['R4', 'R5'], sansJeton);
panne('P11 la sauvegarde préalable est illisible (JSON cassé)', {}, (w) => { const r = w.ctx.backupAllUserData_; w.ctx.backupAllUserData_ = () => { r(); const f = w.dossier._d.fichiers; f[f.length - 1].buf = Buffer.from('{"users":[ pas du json'); }; }, 'R2', (w, v) => sansJeton(w) && /ILLISIBLE|ABSENT|a pas/.test((v.d.R2 || '') + (v.erreur || '')));
panne('P12 un déclencheur apparaît pendant la recette', {}, (w) => { const r = w.ctx.handleAdminRestore_; w.ctx.handleAdminRestore_ = (b) => { w.ajouterDeclencheur('backupAllUserData_'); return r(b); }; }, 'R9', sansJeton);
panne('P13 le compte A n\'est pas dans la sauvegarde (la sauvegarde écrit un fichier vide de comptes)', {}, (w) => { w.ctx.backupAllUserData_ = () => { w.dossier.createFile('backup-vide.json', '{"user_count":0,"users":[]}', 'application/json'); }; }, 'R2', sansJeton);
{
  /* le jeton posé est bien celui que `handleAdminRestore_` accepte (et aucun autre) : un mauvais jeton ferait échouer R4 ; vérifié par l'inverse — le chemin sain passe */
  const w = monde({}); const r = w.ctx.handleAdminRestore_; let vus = [];
  w.ctx.handleAdminRestore_ = (b) => { vus.push(String(b.adminToken).length); return r(b); };
  const v = lancer(w);
  t('le jeton jetable fait 36 caractères (≥ 12 exigés par `_checkTok_`), identique aux 3 restaurations', v.pass === true && vus.length === 3 && vus.every((n) => n === 36), vus);
}

console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────');
process.exit(rouge ? 1 : 0);
