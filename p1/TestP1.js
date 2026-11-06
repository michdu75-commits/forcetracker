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
