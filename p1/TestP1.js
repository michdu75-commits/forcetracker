/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
   FICHIER DU PROJET APPS SCRIPT DE TEST UNIQUEMENT — essai P1 de la publication Nutrition (04/11/2026).
   ⛔ N'EST JAMAIS POUSSÉ EN PRODUCTION : le workflow de production ne pousse que Code.js + appsscript.json (.claspignore).
   Il prépare le projet de TEST pour que l'essai NE TOUCHE RIEN DE RÉEL :
     · `ft_backup_drive_folder_id` → un dossier Drive NEUF « FT-TEST-P1-… » (sinon Code.js écrirait la zone de récupération dans le vrai dossier « ForceTracker-Backups », trouvé par son nom) ;
     · `LECTURE_STRICTE` = off → loadProfile rend un compte fictif sans code (sinon « needsCode »), comme la « soupape » prévue par le serveur ;
     · (la Sheet de production est neutralisée à la poussée, par le workflow : `var SHEET_ID_` → un identifiant factice ; ici on le VÉRIFIE).
   À LANCER UNE FOIS, À LA MAIN, dans l'éditeur du projet de TEST : fonction `preparerEssaiP1` → Exécuter → accepter les autorisations
   (c'est AUSSI l'autorisation du projet pour la web app : sans elle, la web app répond « autorisation requise »).
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
function preparerEssaiP1() {
  var sp = PropertiesService.getScriptProperties();
  // ① GARDE : ce projet doit être VIERGE. Un projet de production porte des comptes (u_…), des secrets ou la liste premium : on s'arrête.
  var cles = sp.getKeys();
  var interdites = cles.filter(function (k) { return /^(u_|h_|auth_|prem_)/.test(k) || k === 'ANTHROPIC_API_KEY' || k === 'ADMIN_TOKEN' || k === 'PREMIUM_EMAILS' || k === 'PREMIUM_CODES' || k === 'KOFI_TOKEN'; });
  if (interdites.length) throw new Error('⛔ Ce projet porte déjà des comptes ou des secrets (' + interdites.length + ' propriété(s) comme « ' + interdites[0].slice(0, 2) + '… ») : ce n\'est PAS un projet de test vierge. On s\'arrête, rien n\'a été écrit.');
  if (sp.getProperty('ft_backup_drive_folder_id')) throw new Error('⛔ Ce projet a déjà un dossier de sauvegarde (ft_backup_drive_folder_id) : ce n\'est pas un projet de test vierge. On s\'arrête.');
  // ② la Sheet de production doit être neutralisée (le workflow remplace la constante à la poussée)
  if (typeof SHEET_ID_ !== 'undefined' && SHEET_ID_ === '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg') throw new Error('⛔ SHEET_ID_ est celui de la PRODUCTION : le code poussé n\'a pas été neutralisé. On s\'arrête.');
  // ③ un dossier Drive NEUF pour la zone de récupération
  var d = DriveApp.createFolder('FT-TEST-P1-RECUP-' + new Date().toISOString().slice(0, 10));
  sp.setProperty('ft_backup_drive_folder_id', d.getId());
  sp.setProperty('LECTURE_STRICTE', 'off');
  sp.setProperty('FT_P1_TEST', '1');
  // ④ la sonde de verrou : c'est ELLE qui demande (et prouve) l'autorisation de LockService dans ce projet, sous les portées de appsscript.json
  var v = LockService.getScriptLock();
  var ok = v.tryLock(5000);
  if (ok) v.releaseLock();
  var rep = { pret: true, verrou: ok, dossierTest: d.getId(), sheetNeutralisee: (typeof SHEET_ID_ !== 'undefined' ? SHEET_ID_ : '?') };
  Logger.log('PRÊT : ' + JSON.stringify(rep));
  return rep;
}
/* Suspension : poser / retirer NUT_SUSPENDU (ce que Michel fera en production dans « Propriétés du script ») — pour le scénario P1-09. */
function suspendreEssaiP1() { PropertiesService.getScriptProperties().setProperty('NUT_SUSPENDU', '1'); Logger.log('NUT_SUSPENDU = 1'); }
function reprendreEssaiP1() {
  PropertiesService.getScriptProperties().deleteProperty('NUT_SUSPENDU'); Logger.log('NUT_SUSPENDU retirée');
  /* ménage : les programmations d'essai ne servent qu'une fois */
  ScriptApp.getProjectTriggers().forEach(function (t) { var h = t.getHandlerFunction(); if (h === 'suspendreEssaiP1' || h === 'reprendreEssaiP1') ScriptApp.deleteTrigger(t); });
}
/* ESSAI C5 — UNE SEULE ACTION DE L'OPÉRATEUR : lancer cette fonction (éditeur du projet de TEST → Exécuter, accepter les autorisations si Google les demande).
   Elle (1) remet l'état de départ « actif » (retire NUT_SUSPENDU), (2) programme la SUSPENSION dans 8 minutes et la REPRISE dans 18 minutes (déclencheurs uniques, exécutés par Google tout seuls).
   Le banc `p1/c1_reel.js --c5` détecte chaque bascule par un envoi-sonde (compte fictif) : il n'a besoin d'aucune horloge ni de la présence de l'opérateur. */
function programmerSuspensionEssaiP1() {
  var sp = PropertiesService.getScriptProperties();
  if (sp.getProperty('FT_P1_TEST') !== '1') throw new Error('⛔ Ce projet n\'est pas le projet de TEST préparé (FT_P1_TEST absent) : on s\'arrête, rien n\'a été programmé.');
  sp.deleteProperty('NUT_SUSPENDU');
  ScriptApp.getProjectTriggers().forEach(function (t) { var h = t.getHandlerFunction(); if (h === 'suspendreEssaiP1' || h === 'reprendreEssaiP1') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('suspendreEssaiP1').timeBased().after(8 * 60 * 1000).create();
  ScriptApp.newTrigger('reprendreEssaiP1').timeBased().after(18 * 60 * 1000).create();
  Logger.log('PROGRAMMÉ à ' + new Date().toISOString() + ' : suspension dans 8 min, reprise dans 18 min. NUT_SUSPENDU actuellement : ' + (sp.getProperty('NUT_SUSPENDU') || '(absente)'));
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   06/11/2026 — C5 SANS HORLOGE NI PRÉSENCE : UNE SEULE ACTION DE L'OPÉRATEUR, ET C'EST AUSSI CELLE QUI RENDORT L'AUTORISATION DU PROJET.
   Pourquoi : le 06/11 la web app du projet de TEST répondait « Access Denied » à tout le monde et « Authorization needed » au propriétaire : le script n'était plus
   autorisé par son propriétaire (consentement Google, non automatisable). Lancer N'IMPORTE QUELLE fonction de ce projet dans l'éditeur, en étant connecté avec le
   compte PROPRIÉTAIRE, ouvre la fenêtre de consentement ; une fois acceptée, la web app se remet à répondre.
   Cette fonction : (1) vérifie que ce projet est bien le projet de TEST préparé ; (2) touche en LECTURE les services du serveur (verrou, dossier de récupération, déclencheurs) ;
   (3) programme la suspension / reprise de NUT_SUSPENDU : le premier créneau de suspension commence dans 60 min (le temps de jouer C1), puis 3 créneaux de 12 min, un toutes les 45 min,
   le tout sur 2 h 30 ; à la fin, la propriété est retirée et le déclencheur supprimé tout seul. Le banc c1_reel.js --c5 détecte chaque bascule par une sonde : il n'a pas besoin d'horloge.
   ⛔ Refuse de tourner hors du projet de TEST préparé (FT_P1_TEST absent) : rien n'est alors programmé.
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
var BASC_ATTENTE_MIN_ = 60, BASC_CYCLE_MIN_ = 45, BASC_SUSP_MIN_ = 12, BASC_CYCLES_ = 3;
function autoriserEtProgrammerEssaiP1() {
  var sp = PropertiesService.getScriptProperties();
  if (sp.getProperty('FT_P1_TEST') !== '1') throw new Error('⛔ Ce projet n\'est pas le projet de TEST préparé (FT_P1_TEST absent) : on s\'arrête, rien n\'a été programmé.');
  if (typeof SHEET_ID_ !== 'undefined' && SHEET_ID_ === '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg') throw new Error('⛔ SHEET_ID_ est celui de la PRODUCTION : on s\'arrête.');
  /* (2) lectures seules : elles prouvent que l'autorisation couvre bien ces services */
  var v = LockService.getScriptLock(); var verrou = v.tryLock(5000); if (verrou) v.releaseLock();
  var dossier = sp.getProperty('ft_backup_drive_folder_id'), dossierNom = '(absent)';
  if (dossier) { try { dossierNom = DriveApp.getFolderById(dossier).getName(); } catch (e) { dossierNom = '(illisible : ' + String(e.message || e).slice(0, 60) + ')'; } }
  if (dossierNom.indexOf('FT-TEST-P1') !== 0) throw new Error('⛔ Le dossier de récupération de ce projet n\'est pas un dossier « FT-TEST-P1… » (' + dossierNom + ') : on s\'arrête, rien n\'a été programmé.');
  var nbDecl = ScriptApp.getProjectTriggers().length;
  /* (3) la programmation */
  ScriptApp.getProjectTriggers().forEach(function (t) { var h = t.getHandlerFunction(); if (h === 'basculeEssaiP1' || h === 'suspendreEssaiP1' || h === 'reprendreEssaiP1') ScriptApp.deleteTrigger(t); });
  sp.deleteProperty('NUT_SUSPENDU');
  var maintenant = Date.now(), debut = maintenant + BASC_ATTENTE_MIN_ * 60000, fin = debut + BASC_CYCLES_ * BASC_CYCLE_MIN_ * 60000;
  sp.setProperty('FT_P1_BASC_DEBUT', String(debut)); sp.setProperty('FT_P1_BASC_FIN', String(fin));
  ScriptApp.newTrigger('basculeEssaiP1').timeBased().everyMinutes(5).create();
  var rep = { autorise: true, verrou: verrou, dossierTest: dossierNom, declencheursAvant: nbDecl, premiereSuspension: new Date(debut).toISOString(), fin: new Date(fin).toISOString(), creneaux: BASC_CYCLES_ + ' × ' + BASC_SUSP_MIN_ + ' min toutes les ' + BASC_CYCLE_MIN_ + ' min' };
  Logger.log('AUTORISÉ ET PROGRAMMÉ : ' + JSON.stringify(rep));
  return rep;
}
/* Appelée par le déclencheur toutes les 5 min : pose NUT_SUSPENDU pendant les créneaux, la retire en dehors, et se supprime à la fin. N'écrit que si l'état doit changer. */
function basculeEssaiP1() {
  var sp = PropertiesService.getScriptProperties();
  if (sp.getProperty('FT_P1_TEST') !== '1') return;
  var debut = Number(sp.getProperty('FT_P1_BASC_DEBUT')), fin = Number(sp.getProperty('FT_P1_BASC_FIN')), now = Date.now();
  if (!debut || !fin) return;
  var suspendu = sp.getProperty('NUT_SUSPENDU') === '1';
  if (now >= fin) { if (suspendu) sp.deleteProperty('NUT_SUSPENDU'); ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'basculeEssaiP1') ScriptApp.deleteTrigger(t); }); Logger.log('FIN DE LA BASCULE : propriété retirée, déclencheur supprimé'); return; }
  var voulu = now >= debut && ((now - debut) % (BASC_CYCLE_MIN_ * 60000)) < BASC_SUSP_MIN_ * 60000;
  if (voulu && !suspendu) { sp.setProperty('NUT_SUSPENDU', '1'); Logger.log('NUT_SUSPENDU = 1 (créneau de suspension)'); }
  else if (!voulu && suspendu) { sp.deleteProperty('NUT_SUSPENDU'); Logger.log('NUT_SUSPENDU retirée (fin de créneau)'); }
}
/* Arrêt d'urgence (facultatif) : retire la propriété et supprime la bascule. */
function arreterBasculeEssaiP1() {
  PropertiesService.getScriptProperties().deleteProperty('NUT_SUSPENDU');
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'basculeEssaiP1') ScriptApp.deleteTrigger(t); });
  Logger.log('BASCULE ARRÊTÉE : NUT_SUSPENDU retirée, déclencheur supprimé');
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   06/11/2026 (soir) — ISOLER LE PROJET DE TEST *PUIS* PROGRAMMER C5 : UNE SEULE ACTION, À FAIRE AVANT TOUT ESSAI D'ÉCRITURE.
   Pourquoi : le projet de TEST s'exécute AVEC LE COMPTE DE MICHEL (« Moi »). Le code serveur cherche son dossier de sauvegarde PAR SON NOM (« ForceTracker-Backups ») dans le Drive
   de ce compte — c'est-à-dire le dossier de la PRODUCTION, qui y existe. Sans propriété `ft_backup_drive_folder_id` pointant vers un dossier de TEST, un essai qui fait écrire la zone de
   récupération (« recup-nut ») écrirait dans le dossier de sauvegarde de la production. Le contrôle du 06/11 (étape « verifier ») n'a trouvé AUCUN dossier « FT-TEST-P1… » dans ce Drive :
   l'isolement n'était donc pas en place. Cette fonction le met en place, le RELIT, et ne programme C5 qu'ensuite.
   Ce qu'elle fait : (1) refuse si le projet porte autre chose que des comptes FICTIFS (@example.invalid) ou un secret ; (2) refuse si la feuille n'est pas neutralisée ; (3) crée un dossier NEUF
   « FT-TEST-P1-RECUP-… » (sauf si la propriété en désigne déjà un) et pointe `ft_backup_drive_folder_id` dessus — l'ancienne valeur est ÉCARTÉE (jamais lue, jamais écrite) ; (4) relit et exige un nom « FT-TEST-P1… » ;
   (5) pose LECTURE_STRICTE=off et FT_P1_TEST=1 ; (6) appelle autoriserEtProgrammerEssaiP1 (qui reteste le dossier, touche le verrou et programme les créneaux de suspension).
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
function isolerEtProgrammerEssaiP1() {
  var sp = PropertiesService.getScriptProperties();
  /* ① que des comptes fictifs, aucun secret */
  var interdit = sp.getKeys().filter(function (k) {
    if (/^(ANTHROPIC_API_KEY|ADMIN_TOKEN|PREMIUM_EMAILS|PREMIUM_CODES|KOFI_TOKEN)$/.test(k)) return true;
    var m = /^(u_|h_|auth_|prem_|confirmed_)(.*)$/.exec(k);
    return !!m && !/@example\.invalid$/i.test(m[2]);
  });
  if (interdit.length) throw new Error('⛔ Ce projet porte autre chose que des comptes FICTIFS ou un secret (' + interdit.length + ' propriété(s) comme « ' + interdit[0].slice(0, 3) + '… ») : ce n\'est pas un projet de test. On s\'arrête, rien n\'a été modifié.');
  /* ② la feuille de production neutralisée */
  if (typeof SHEET_ID_ === 'undefined' || SHEET_ID_ !== 'TEST-SANS-FEUILLE-DE-PRODUCTION') throw new Error('⛔ SHEET_ID_ n\'est pas la valeur neutralisée du projet de test : on s\'arrête, rien n\'a été modifié.');
  /* ③ un dossier de récupération de TEST — l'ancienne valeur n'est jamais ouverte en écriture */
  var ancien = sp.getProperty('ft_backup_drive_folder_id'), ancienNom = '(absent)';
  if (ancien) { try { ancienNom = DriveApp.getFolderById(ancien).getName(); } catch (e) { ancienNom = '(illisible)'; } }
  var reutilise = !!ancien && ancienNom.indexOf('FT-TEST-P1') === 0, dossier;
  if (reutilise) dossier = DriveApp.getFolderById(ancien);
  else { dossier = DriveApp.createFolder('FT-TEST-P1-RECUP-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')); sp.setProperty('ft_backup_drive_folder_id', dossier.getId()); }
  /* ④ on RELIT : la propriété doit désigner un dossier « FT-TEST-P1… » */
  var nomRelu = '';
  try { nomRelu = DriveApp.getFolderById(sp.getProperty('ft_backup_drive_folder_id')).getName(); } catch (e) { nomRelu = '(illisible)'; }
  if (nomRelu.indexOf('FT-TEST-P1') !== 0) throw new Error('⛔ La propriété de dossier ne désigne pas un dossier « FT-TEST-P1… » après écriture (' + nomRelu + ') : on s\'arrête, rien n\'a été programmé.');
  /* ⑤ le réglage du projet de test */
  sp.setProperty('LECTURE_STRICTE', 'off'); sp.setProperty('FT_P1_TEST', '1');
  Logger.log('ISOLÉ : ancienne valeur de ft_backup_drive_folder_id = « ' + ancienNom + ' » (écartée, jamais lue ni écrite) · dossier de TEST = « ' + nomRelu + ' » (' + (reutilise ? 'déjà là' : 'créé') + ')');
  /* ⑥ la bascule de C5 */
  var rep = autoriserEtProgrammerEssaiP1();
  rep.isole = true; rep.ancienDossier = ancienNom; rep.dossierCree = !reutilise;
  Logger.log('ISOLÉ ET PROGRAMMÉ : ' + JSON.stringify(rep));
  return rep;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   11/11/2026 — P0 SAUVEGARDES : RECETTE DE RESTAURATION (« GO TEST P0 » de Michel). PROJET DE TEST ISOLÉ SEULEMENT, COMPTES FICTIFS SEULEMENT.
   UNE SEULE ACTION DE L'OPÉRATEUR : éditeur du projet FT-TEST-P1 → choisir `recetteRestaurationP1` → Exécuter (les autorisations sont déjà données : aucune fenêtre ne devrait s'ouvrir).
   Elle joue, avec les VRAIES fonctions de production (`handleSaveProfile_`, `backupAllUserData_`, `handleAdminRestore_`), sur deux comptes fictifs « p0r-a/b-<horodatage>@example.invalid » :
     0 gardes (si l'une tombe : STOP, RIEN n'est écrit) · 1 état S0 (compte A : 60 séances, 3 records, 4 pesées, 5 repas v3 ; compte témoin B) · 2 sauvegarde préalable
     3 activité plus récente S1 (+3 séances, +2 repas, +1 pesée) · 4 sauvegarde fraîche F (le point de retour) · 5 restauration de A depuis la sauvegarde du point 2
     6 variante « ancienne sauvegarde » (sans le marqueur v3) · 7 annulation : restauration de A depuis F · 8 ménage (jeton jetable retiré, déclencheurs comptés).
   Critères R1–R10 : voir le PDF « P0 — Sécurisation des sauvegardes » du 10/11 (§ 2). R9 (« dossier de production inchangé ») ne se voit pas d'ici : c'est l'étape `verifier`, avant et après.
   Le verdict est écrit TROIS fois : dans le journal d'exécution (ligne « VERDICT P0-RESTAURATION »), dans la propriété FT_P1_RECETTE_P0, et dans un petit fichier du dossier de TEST dont le NOM dit
   PASS ou FAIL (« P0-VERDICT-PASS-… ») : l'étape `verifier` le liste, l'opérateur n'a rien à copier.
   ⛔ N'OUVRE JAMAIS le dossier « ForceTracker-Backups » : le dossier est relu PAR SON IDENTIFIANT (propriété `ft_backup_drive_folder_id`) et son NOM doit commencer par « FT-TEST-P1 » ; `_getDriveBackupFolder_`
      (qui retomberait sur « ForceTracker-Backups » par son nom si l'identifiant devenait illisible) n'est appelée par `backupAllUserData_` qu'APRÈS cette garde.
   ⛔ Le jeton d'administration est JETABLE : posé juste avant la première restauration, retiré dans `finally` (même si tout casse) ; si un jeton existe déjà, on s'arrête sans rien écrire.
   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
var RECETTE_P0_STOCKAGE_MAX_ = 380000;      // octets (clés + valeurs) de propriétés au-delà desquels on ne commence pas : le quota d'Apps Script est de 500 000
var RECETTE_P0_DUREE_MAX_MS_ = 120000;
var RECETTE_P0_NOUVELLES_ = ['r0061', 'r0062', 'r0063'];

function recetteP0Sha_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function recetteP0Canon_(v) {
  if (Array.isArray(v)) return v.map(recetteP0Canon_);
  if (v && typeof v === 'object') { var o = {}; Object.keys(v).sort().forEach(function (k) { o[k] = recetteP0Canon_(v[k]); }); return o; }
  return v;
}
function recetteP0Analyse_(sortie) {
  var txt = (sortie && typeof sortie.getContent === 'function') ? sortie.getContent() : String(sortie);
  try { return JSON.parse(txt); } catch (e) { return { status: 'illisible', brut: String(txt).slice(0, 160) }; }
}
function recetteP0Rid_() { return 'rq' + Utilities.getUuid().replace(/-/g, '').slice(0, 16); }
function recetteP0Handlers_() { return ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); }).sort(); }
function recetteP0Stockage_(props) {
  var n = 0; Object.keys(props).forEach(function (k) { n += k.length + String(props[k]).length; }); return n;
}
/* ── GARDE DES PROPRIÉTÉS — « GO CODE OPTION A » de Michel (12/11/2026), après l'arrêt de la recette à 11:52 sur une propriété « PRE… » ──
   POURQUOI : le serveur de production, servi tel quel par ce projet de TEST, RÉÉCRIT la propriété `PREMIUM_EMAILS` à CHAQUE POST (`ensurePremiumEmails_()`, appelée par `doPost`) avec la liste codée
   en dur `PREMIUM_HARDCODED_`. Les essais par HTTP (scénarios P1, C1, C5, témoins d'écrasement) l'y ont donc créée : une COPIE d'une constante du code, aucune donnée de la production (rejoué en local
   avec le vrai Code.js : un seul POST la crée, identique à `PREMIUM_HARDCODED_.join(',')`). La garde l'interdisait par son NOM ; elle la juge désormais sur son CONTENU.
   RÈGLE : `PREMIUM_EMAILS` n'est tolérée QUE si, adresse par adresse, son contenu est EXACTEMENT l'ensemble de `PREMIUM_HARDCODED_` (casse et espaces normalisés comme le fait le serveur, un doublon est sans effet).
   Une adresse de trop, une de moins, un autre séparateur, une valeur vide, ou une liste codée en dur illisible d'ici = refus (le refus est le côté sûr : il n'écrit rien).
   ⛔ RIEN d'autre n'est assoupli : `PREMIUM_CODES`, les clés et jetons, tout compte u_ / h_ / auth_ / prem_ / confirmed_ qui n'est pas en @example.invalid restent refusés.
   ⛔ JAMAIS une adresse ni un secret dans le journal : le contenu de `PREMIUM_EMAILS` n'est pas recopié (des NOMBRES seulement) ; pour les autres propriétés on dit le NOM d'un secret fixe (une constante de
      ce fichier) ou la CLASSE d'un compte (« u_… »), pas même la première lettre d'une adresse (l'ancien message en donnait trois caractères, « u_m » par exemple).
   ⛔ Les trois motifs de refus (propriétés interdites · PREMIUM_EMAILS · stockage) sont TOUS évalués avant de s'arrêter : un seul passage dit tout, au lieu d'un aller-retour par blocage. */
var RECETTE_P0_SECRETS_ = /^(ANTHROPIC_API_KEY|ADMIN_TOKEN|PREMIUM_CODES|KOFI_TOKEN|IDEES_TOKEN2|BACKUP_TOKEN)$/;
function recetteP0Premium_(valeur) {
  var norm = function (s) { return String(s).trim().toLowerCase(); };
  var codee = (typeof PREMIUM_HARDCODED_ !== 'undefined' && Array.isArray(PREMIUM_HARDCODED_)) ? PREMIUM_HARDCODED_ : [];
  var attendues = [], presentes = [], inconnues = 0, manquantes = 0;
  codee.forEach(function (e) { var n = norm(e); if (n && attendues.indexOf(n) < 0) attendues.push(n); });
  String(valeur === undefined || valeur === null ? '' : valeur).split(',').forEach(function (e) { var n = norm(e); if (n && presentes.indexOf(n) < 0) presentes.push(n); });
  presentes.forEach(function (n) { if (attendues.indexOf(n) < 0) inconnues++; });
  attendues.forEach(function (n) { if (presentes.indexOf(n) < 0) manquantes++; });
  return { attendues: attendues.length, presentes: presentes.length, inconnues: inconnues, manquantes: manquantes,
           ok: attendues.length > 0 && presentes.length > 0 && inconnues === 0 && manquantes === 0 };
}
function recetteP0Proprietes_(props) {
  var classes = {}, n = 0;
  Object.keys(props).forEach(function (k) {
    if (k === 'PREMIUM_EMAILS') return;                                // jugée sur son CONTENU (recetteP0Premium_), plus sur son nom
    var c = null;
    if (RECETTE_P0_SECRETS_.test(k)) c = k;                            // le NOM d'un secret fixe est une constante du code : le dire n'est pas le divulguer
    else { var m = /^(u_|h_|auth_|prem_|confirmed_)(.*)$/.exec(k); if (m && !/@example\.invalid$/i.test(m[2])) c = m[1] + '…'; }   // compte non fictif : la CLASSE seulement
    if (c) { classes[c] = (classes[c] || 0) + 1; n++; }
  });
  return { interdites: n, classes: Object.keys(classes).sort().map(function (c) { return c + ' ×' + classes[c]; }).join(', '),
           premium: Object.prototype.hasOwnProperty.call(props, 'PREMIUM_EMAILS') ? recetteP0Premium_(props.PREMIUM_EMAILS) : null };
}
/* une séance fictive : identifiant « r0001 »…, dates étalées, forme de celles de la production (id, date, ts, exs, vol, synced) */
function recetteP0Seance_(i) {
  var ts = Date.UTC(2026, 7, 1) + i * 86400000;
  return { id: 'r' + ('0000' + i).slice(-4), date: new Date(ts).toISOString().slice(0, 10), ts: ts, uniConv: 1, synced: true, vol: 500 + i,
           exs: [{ name: 'Squat (recette P0)', sets: [{ kg: 100 + (i % 7), reps: 5, done: true, type: 'normal' }] }] };
}
/* une ligne de journal v3 : copie de `ligne()` de p1_scenarios.js (éprouvée contre le vrai serveur) */
function recetteP0Repas_(i) {
  return { id: 'rp' + ('0000' + i).slice(-4) + '-' + String(10000000 + i), date: '2026-11-01', meal: 'dejeuner', name: 'Repas recette P0 ' + i, q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1,
           ts: 1760000000000 + i, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } };
}
function recetteP0Champs_(nSeances, nRepas, nPesees, nom) {
  var s = [], r = [], p = [], i;
  for (i = 1; i <= nSeances; i++) s.push(recetteP0Seance_(i));
  for (i = 1; i <= nRepas; i++) r.push(recetteP0Repas_(i));
  for (i = 1; i <= nPesees; i++) p.push({ date: '2026-10-' + ('0' + (10 + i)).slice(-2), kg: 80 + i / 10 });
  return { name: nom, sessions: s, prs: { 'Squat (recette P0)': { rm1: 117, kg: 100, reps: 5, date: '2026-10-20' }, 'Developpe (recette P0)': { rm1: 90, kg: 80, reps: 5, date: '2026-10-21' },
           'Souleve (recette P0)': { rm1: 150, kg: 130, reps: 5, date: '2026-10-22' } }, weightLog: p, foodLog: r, savedFoods: [], foodSupprimes: [] };
}
/* ce que le serveur retient d'un compte, réduit à ce qu'on compare : nombre, identifiants triés, empreintes SHA-256 du contenu canonique */
function recetteP0Etat_(email) {
  var d = loadUserData_(email) || {}, p = d.profile || {};
  var ses = (d.sessions || []).slice().sort(function (a, b) { return String(a && a.id) < String(b && b.id) ? -1 : 1; });
  var repas = (p.foodLog || d.foodLog || []).map(function (l) { return String(l && l.id); }).sort();
  var pesees = d.weightLog || p.weightLog || [];
  return { n: ses.length, ids: ses.map(function (s) { return String(s && s.id); }), emp: recetteP0Sha_(JSON.stringify(recetteP0Canon_(ses))),
           prsEmp: recetteP0Sha_(JSON.stringify(recetteP0Canon_(d.prs || {}))), nPrs: Object.keys(d.prs || {}).length,
           peseesEmp: recetteP0Sha_(JSON.stringify(recetteP0Canon_(pesees))), nPesees: pesees.length, repas: repas, nutProto: Number(d.nutProto) || 0 };
}
function recetteP0Egal_(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function recetteP0Fichiers_(dossier) {
  var it = dossier.getFiles(), out = [];
  while (it.hasNext()) { var f = it.next(); out.push({ id: f.getId(), nom: f.getName(), f: f }); }
  return out;
}
/* UNE sauvegarde par la vraie fonction (qui ne rend rien, journalise et avale ses erreurs) : on vérifie l'EFFET — exactement un fichier de plus dans le dossier de TEST, relu et analysé */
function recetteP0Sauvegarder_(dossier) {
  var vus = {}; recetteP0Fichiers_(dossier).forEach(function (f) { vus[f.id] = 1; });
  backupAllUserData_();
  var nouveaux = [];
  for (var essai = 0; essai < 3; essai++) {
    nouveaux = recetteP0Fichiers_(dossier).filter(function (f) { return !vus[f.id]; });
    if (nouveaux.length) break;
    Utilities.sleep(1500);
  }
  var res = { nouveaux: nouveaux.length, fichier: null, sauv: null };
  if (nouveaux.length !== 1) return res;
  res.fichier = nouveaux[0].nom;
  try { res.sauv = JSON.parse(nouveaux[0].f.getBlob().getDataAsString()); } catch (e) { res.illisible = String(e && e.message || e).slice(0, 80); }
  return res;
}
function recetteP0Compte_(sauv, email) {
  var us = (sauv && sauv.users) || [];
  for (var i = 0; i < us.length; i++) { if (String(us[i] && us[i].email || '').toLowerCase() === email) return us[i]; }
  return null;
}

function recetteRestaurationP1() {
  var t0 = Date.now(), sp = PropertiesService.getScriptProperties();
  var V = { version: 1, debut: new Date(t0).toISOString(), r: {}, d: {}, gardes: false, verrouOccupe: false };
  var jetonPose = false, dossier = null, A = '', B = '', S0 = null, S1 = null, S2 = null, S3 = null;
  function note(id, cond, detail) {                       // UN critère : une valeur fausse reste fausse
    V.r[id] = (V.r[id] === undefined) ? !!cond : (V.r[id] && !!cond);
    if (detail !== undefined) V.d[id] = (V.d[id] ? V.d[id] + ' ; ' : '') + detail;
    Logger.log((cond ? '   OK  ' : '❌ KO  ') + id + (detail !== undefined ? ' — ' + detail : ''));
    return !!cond;
  }
  function stop(msg) { throw new Error(msg); }
  var declAvant = [];
  try {
    /* ── 0 · GARDES — rien n'est écrit tant qu'elles ne sont pas TOUTES passées ── */
    if (sp.getProperty('FT_P1_TEST') !== '1') stop('⛔ Ce projet n\'est pas le projet de TEST préparé (FT_P1_TEST absent) : on s\'arrête, rien n\'a été écrit.');
    if (typeof SHEET_ID_ === 'undefined' || SHEET_ID_ !== 'TEST-SANS-FEUILLE-DE-PRODUCTION') stop('⛔ SHEET_ID_ n\'est pas la valeur neutralisée du projet de test : on s\'arrête, rien n\'a été écrit.');
    var idDossier = sp.getProperty('ft_backup_drive_folder_id');
    if (!idDossier) stop('⛔ Aucun dossier de sauvegarde désigné (ft_backup_drive_folder_id) : le serveur retomberait sur « ForceTracker-Backups » par son nom. On s\'arrête, rien n\'a été écrit.');
    var nomDossier = '(illisible)';
    try { dossier = DriveApp.getFolderById(idDossier); nomDossier = dossier.getName(); } catch (eD) { dossier = null; }
    if (!dossier || nomDossier.indexOf('FT-TEST-P1') !== 0) stop('⛔ Le dossier de sauvegarde désigné n\'est pas un dossier « FT-TEST-P1… » (' + nomDossier + ') : on s\'arrête, rien n\'a été écrit.');
    var corbeille = false; try { corbeille = dossier.isTrashed(); } catch (eT) { corbeille = true; }
    if (corbeille) stop('⛔ Le dossier de sauvegarde de TEST est à la corbeille : on s\'arrête, rien n\'a été écrit.');
    if (sp.getProperty('ADMIN_TOKEN')) stop('⛔ Un jeton d\'administration existe déjà dans ce projet : ce n\'est pas un projet de test vierge (on n\'y touche pas). On s\'arrête, rien n\'a été écrit.');
    var props = sp.getProperties(), cles = Object.keys(props);
    var an = recetteP0Proprietes_(props), refus = [];
    V.stockageAvant = recetteP0Stockage_(props);
    V.premium = an.premium;                                                  // des NOMBRES seulement : jamais une adresse (voir recetteP0Premium_)
    if (an.interdites) refus.push('Ce projet porte autre chose que des comptes FICTIFS ou un secret (' + an.interdites + ' : ' + an.classes + ')');
    if (an.premium && !an.premium.ok) refus.push('PREMIUM_EMAILS ≠ liste codée en dur (' + (an.premium.attendues ? 'attendues ' + an.premium.attendues + ', présentes ' + an.premium.presentes + ', inconnues ' + an.premium.inconnues + ', manquantes ' + an.premium.manquantes : 'liste illisible d\'ici') + ')');
    if (V.stockageAvant > RECETTE_P0_STOCKAGE_MAX_) refus.push('stockage des propriétés trop plein (' + V.stockageAvant + ' octets > ' + RECETTE_P0_STOCKAGE_MAX_ + ' ; quota 500 000 ; faire de la place = décision de Michel)');
    if (refus.length) stop('⛔ ' + refus.join(' · ') + ' — on s\'arrête, rien n\'a été écrit.');
    declAvant = recetteP0Handlers_();
    V.gardes = true; V.dossier = nomDossier;
    note('R1', true, 'projet de TEST préparé · dossier « ' + nomDossier + ' » · ' + cles.length + ' propriété(s), ' + V.stockageAvant + ' octets · ' + declAvant.length + ' déclencheur(s)' + (an.premium ? ' · PREMIUM_EMAILS = copie exacte de la liste codée en dur (' + an.premium.presentes + ' entrées, aucune inconnue)' : ''));

    /* ── 1 · ÉTAT S0 : deux comptes fictifs, écrits par le chemin RÉEL d'écriture ── */
    var stamp = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHHmmss') + '-' + Utilities.getUuid().slice(0, 4);      // jamais deux fois les mêmes comptes, même si on relance dans la seconde
    A = 'p0r-a-' + stamp + '@example.invalid'; B = 'p0r-b-' + stamp + '@example.invalid';
    var envoyer = function (email, champs) {
      var corps = { action: 'saveProfile', email: email, foodLogV: 3, requestId: recetteP0Rid_() };
      Object.keys(champs).forEach(function (k) { corps[k] = champs[k]; });
      var rep = recetteP0Analyse_(handleSaveProfile_(corps));
      if (rep && rep.code === 'NUT_LOCK_BUSY') V.verrouOccupe = true;
      return rep;
    };
    var rA0 = envoyer(A, recetteP0Champs_(60, 5, 4, 'Compte A (recette P0)')), rB0 = envoyer(B, recetteP0Champs_(5, 2, 1, 'Compte témoin B (recette P0)'));
    if (!(rA0 && rA0.ok === true && rB0 && rB0.ok === true)) stop('⛔ L\'état de départ n\'a pas pu être écrit (A : ' + JSON.stringify(rA0).slice(0, 120) + ' · B : ' + JSON.stringify(rB0).slice(0, 120) + ') — on s\'arrête.');
    S0 = recetteP0Etat_(A);
    if (S0.n !== 60 || S0.repas.length !== 5 || S0.nPesees !== 4 || S0.nPrs !== 3) stop('⛔ L\'état de départ relu ne correspond pas à ce qui a été envoyé (séances ' + S0.n + ', repas ' + S0.repas.length + ', pesées ' + S0.nPesees + ', records ' + S0.nPrs + ') — on s\'arrête.');
    var rawB0 = sp.getProperty('u_' + B), rawH0 = sp.getProperty('h_' + A);
    Logger.log('S0 · A = ' + S0.n + ' séances (' + S0.emp.slice(0, 12) + ') · ' + S0.repas.length + ' repas · ' + S0.nPrs + ' records · ' + S0.nPesees + ' pesées · nutProto ' + S0.nutProto);

    /* ── 2 · SAUVEGARDE PRÉALABLE B ── */
    var sB = recetteP0Sauvegarder_(dossier);
    var uB = sB.sauv ? recetteP0Compte_(sB.sauv, A) : null, eB = uB && uB.data ? { ids: (uB.data.sessions || []).map(function (s) { return String(s && s.id); }).sort(), n: (uB.data.sessions || []).length } : null;
    note('R2', sB.nouveaux === 1 && !!sB.sauv && !!uB && !!eB && recetteP0Egal_(eB.ids, S0.ids) && recetteP0Sha_(JSON.stringify(recetteP0Canon_((uB.data.sessions || []).slice().sort(function (a, b) { return String(a && a.id) < String(b && b.id) ? -1 : 1; })))) === S0.emp,
         'fichier « ' + sB.fichier + ' » (' + sB.nouveaux + ' nouveau) · A dans la sauvegarde : ' + (eB ? eB.n + ' séances, identiques à S0 : ' + recetteP0Egal_(eB.ids, S0.ids) : 'ABSENT') + (sB.illisible ? ' · ILLISIBLE : ' + sB.illisible : ''));
    if (!uB || !uB.data) stop('⛔ La sauvegarde préalable ne contient pas le compte A — rien à restaurer, on s\'arrête.');
    var dataB = JSON.parse(JSON.stringify(uB.data));

    /* ── 3 · ACTIVITÉ PLUS RÉCENTE S1 : +3 séances, +2 repas, +1 pesée ── */
    var rA1 = envoyer(A, recetteP0Champs_(63, 7, 5, 'Compte A (recette P0)'));
    S1 = recetteP0Etat_(A);
    var s1Ok = !!(rA1 && rA1.ok === true) && S1.n === 63 && S1.repas.length === 7 && S1.nPesees === 5;
    if (!s1Ok) stop('⛔ L\'activité plus récente n\'a pas été enregistrée comme prévu (réponse ' + JSON.stringify(rA1).slice(0, 100) + ' ; séances ' + S1.n + ', repas ' + S1.repas.length + ', pesées ' + S1.nPesees + ') — on s\'arrête.');

    /* ── 4 · SAUVEGARDE FRAÎCHE F = le point de retour ── */
    var sF = recetteP0Sauvegarder_(dossier);
    var uF = sF.sauv ? recetteP0Compte_(sF.sauv, A) : null;
    var fOk = sF.nouveaux === 1 && !!sF.sauv && !!uF && !!uF.data && recetteP0Egal_((uF.data.sessions || []).map(function (s) { return String(s && s.id); }).sort(), S1.ids);
    note('R3', s1Ok && fOk, 'après l\'activité : A = ' + S1.n + ' séances · fichier de point de retour « ' + sF.fichier + ' » (' + sF.nouveaux + ' nouveau) contient ces ' + (uF && uF.data ? (uF.data.sessions || []).length : '?') + ' séances : ' + fOk);
    if (!uF || !uF.data) stop('⛔ Le point de retour ne contient pas le compte A — on ne restaure rien sans point de retour, on s\'arrête.');
    var dataF = JSON.parse(JSON.stringify(uF.data));

    /* ── 5 · RESTAURATION de A depuis la sauvegarde du point 2 (jeton jetable) ── */
    var jeton = Utilities.getUuid();
    sp.setProperty('ADMIN_TOKEN', jeton); jetonPose = true;
    var restaurer = function (donnees) {
      var rep = recetteP0Analyse_(handleAdminRestore_({ adminToken: jeton, email: A, data: donnees }));
      if (rep && rep.code === 'NUT_LOCK_BUSY') V.verrouOccupe = true;
      return rep;
    };
    var rR = restaurer(dataB);
    note('R4', !!rR && rR.status === 'ok' && rR.sessions === 60, 'réponse : ' + JSON.stringify(rR).slice(0, 90));
    S2 = recetteP0Etat_(A);
    var nouvellesAbsentes = RECETTE_P0_NOUVELLES_.every(function (id) { return S2.ids.indexOf(id) < 0; }) && S2.repas.indexOf(recetteP0Repas_(6).id) < 0 && S2.repas.indexOf(recetteP0Repas_(7).id) < 0;
    note('R5', S2.n === 60 && recetteP0Egal_(S2.ids, S0.ids) && S2.emp === S0.emp && S2.prsEmp === S0.prsEmp && S2.peseesEmp === S0.peseesEmp && recetteP0Egal_(S2.repas, S0.repas) && nouvellesAbsentes,
         'après restauration : ' + S2.n + ' séances = S0 : ' + (S2.emp === S0.emp) + ' · records = S0 : ' + (S2.prsEmp === S0.prsEmp) + ' · pesées = S0 : ' + (S2.peseesEmp === S0.peseesEmp) + ' · journal = S0 : ' + recetteP0Egal_(S2.repas, S0.repas) + ' · les 3 séances et 2 repas plus récents ABSENTS (destruction documentée, STOCKAGE-COMPTES §8) : ' + nouvellesAbsentes);
    var r6a = S2.nutProto >= S1.nutProto;

    /* ── 6 · VARIANTE « ancienne sauvegarde » : la même restauration avec une copie SANS le marqueur v3 ── */
    var dataAncienne = JSON.parse(JSON.stringify(dataB)); delete dataAncienne.nutProto;
    var rV = restaurer(dataAncienne);
    var Sv = recetteP0Etat_(A);
    note('R6', r6a && !!rV && rV.status === 'ok' && Sv.nutProto >= S1.nutProto && Sv.nutProto > 0, 'marqueur v3 : avant ' + S1.nutProto + ' · après la restauration ' + S2.nutProto + ' · après la variante sans marqueur ' + Sv.nutProto + ' (jamais abaissé)');

    /* ── 7 · ANNULATION : restauration de A depuis le point de retour F ── */
    var rU = restaurer(dataF);
    S3 = recetteP0Etat_(A);
    note('R8', !!rU && rU.status === 'ok' && S3.n === 63 && recetteP0Egal_(S3.ids, S1.ids) && S3.emp === S1.emp && S3.prsEmp === S1.prsEmp && S3.peseesEmp === S1.peseesEmp && recetteP0Egal_(S3.repas, S1.repas) && S3.nutProto >= S1.nutProto,
         'après annulation : ' + S3.n + ' séances = S1 : ' + (S3.emp === S1.emp) + ' · journal = S1 : ' + recetteP0Egal_(S3.repas, S1.repas) + ' · réponse ' + JSON.stringify(rU).slice(0, 60));
    note('R7', sp.getProperty('h_' + A) === rawH0 && sp.getProperty('u_' + B) === rawB0, 'santé du compte A (h_) inchangée : ' + (sp.getProperty('h_' + A) === rawH0) + ' · compte témoin B inchangé : ' + (sp.getProperty('u_' + B) === rawB0));
  } catch (e) {
    V.erreur = String(e && e.message || e).slice(0, 400);
    Logger.log('⛔ ' + V.erreur);
  } finally {
    if (jetonPose) { try { sp.deleteProperty('ADMIN_TOKEN'); } catch (e2) { Logger.log('⛔ le jeton jetable n\'a pas pu être retiré : ' + String(e2 && e2.message || e2).slice(0, 80)); } }
  }
  /* ── 8 · MÉNAGE ET VERDICT ── */
  if (V.gardes) {
    var declApres = []; try { declApres = recetteP0Handlers_(); } catch (e3) { declApres = ['(illisible)']; }
    var restants = declAvant.slice(); var ajoutes = [];
    declApres.forEach(function (h) { var i = restants.indexOf(h); if (i >= 0) restants.splice(i, 1); else ajoutes.push(h); });
    var jetonAbsent = sp.getProperty('ADMIN_TOKEN') === null || sp.getProperty('ADMIN_TOKEN') === undefined;
    note('R9', jetonAbsent && ajoutes.length === 0, 'jeton jetable absent : ' + jetonAbsent + ' · déclencheur(s) ajouté(s) : ' + ajoutes.length + ' (le dossier de production se vérifie à part : étape verifier avant/après)');
    V.dureeMs = Date.now() - t0;
    note('R10', !V.verrouOccupe && V.dureeMs < RECETTE_P0_DUREE_MAX_MS_, 'aucun NUT_LOCK_BUSY : ' + !V.verrouOccupe + ' · durée ' + V.dureeMs + ' ms (limite ' + RECETTE_P0_DUREE_MAX_MS_ + ')');
  } else { V.dureeMs = Date.now() - t0; }
  var tous = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10'];
  tous.forEach(function (id) { if (V.r[id] === undefined) V.r[id] = false; });          // un critère non évalué (arrêt anticipé) est un critère KO
  var ko = tous.filter(function (id) { return !V.r[id]; });
  V.pass = ko.length === 0 && V.erreur === undefined && V.gardes === true;
  V.comptes = { A: A, B: B };
  var stampFin = Utilities.formatDate(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  var nomMarqueur = 'P0-VERDICT-' + (V.pass ? 'PASS' : 'FAIL') + '-' + stampFin + '-' + (V.pass ? '10sur10' : ((V.gardes ? 'KO-' + ko.join('-') : 'GARDES') + (V.erreur ? '-ERREUR' : ''))) + '.txt';
  var resume = 'VERDICT P0-RESTAURATION : ' + (V.pass ? 'PASS (10/10)' : 'FAIL (KO : ' + (V.gardes ? ko.join(', ') : 'gardes') + ')') + ' · ' + V.dureeMs + ' ms' + (V.erreur ? ' · ' + V.erreur.slice(0, 120) : '');
  Logger.log(resume);
  if (V.gardes && dossier) {          // on n'écrit le verdict QUE si les gardes sont passées (sinon : rien n'est écrit nulle part)
    try { sp.setProperty('FT_P1_RECETTE_P0', JSON.stringify({ pass: V.pass, ko: ko, ms: V.dureeMs, fin: stampFin, marqueur: nomMarqueur }).slice(0, 2000)); } catch (e4) { Logger.log('(propriété de verdict non écrite : ' + String(e4 && e4.message || e4).slice(0, 80) + ')'); }
    try { dossier.createFile(nomMarqueur, JSON.stringify(V, null, 1), 'text/plain'); Logger.log('Marqueur de verdict écrit dans le dossier de TEST : ' + nomMarqueur); } catch (e5) { Logger.log('(marqueur de verdict non écrit : ' + String(e5 && e5.message || e5).slice(0, 80) + ')'); }
  }
  return V;
}
