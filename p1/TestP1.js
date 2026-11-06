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
