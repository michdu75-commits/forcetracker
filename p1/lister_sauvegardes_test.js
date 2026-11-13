#!/usr/bin/env node
/* SAUVEGARDES DU PROJET DE TEST — LECTURE SEULE (Drive : métadonnées, puis UNE tentative de lecture de la plus récente). Aucune écriture, aucune adresse e-mail affichée.
   « GO NOUVEAU DÉPLOIEMENT F2-A′ SUR TEST UNIQUEMENT » de Michel (13/11/2026), point 2 : « confirmer qu'une sauvegarde TEST est lisible et exploitable ».
   Usage : node p1/lister_sauvegardes_test.js <Script ID du projet de TEST>     (le Script ID ne sert qu'à REFUSER la production et tout autre projet)

   CE QU'IL FAIT : (S1) cherche les dossiers dont le nom contient « FT-TEST-P1 » (la requête ne peut rien lister d'autre) ; (S2) liste leur contenu (nom, taille, date) et repère
   les fichiers « backup-AAAA-MM-JJ[-HH-mm].json » écrits par `backupAllUserData_` ; (S3) tente de lire le contenu de la PLUS RÉCENTE et dit ce que Google répond.
     · lisible → il en vérifie la FORME (backed_up_at, user_count = nombre de comptes, chaque compte a email/data/sante) et que TOUS les comptes sont fictifs (@example.invalid) :
       il n'affiche que des NOMBRES, jamais une adresse ni une donnée ;
     · non lisible → il le dit avec la cause exacte de Google (jamais « je ne peux pas » sans cause : règle d'or #16).
   ⚠️ Ce que le jeton clasp ne peut pas faire : lire le contenu d'un fichier créé par Apps Script (portées Drive : « metadata.readonly » + « drive.file » = les fichiers que CET outil a créés).
      Si la lecture est refusée, la lisibilité réelle se prouve autrement (la recette P0 du 12/11 a lu, analysé et restauré une sauvegarde DANS le projet de TEST : PASS 10/10).
   ⛔ Ne peut pas : écrire, supprimer, déplacer, renommer, partager ; lire un dossier qui n'est pas « FT-TEST-P1… » (le dossier de sauvegardes de la production n'est PAS lu) ;
      lire le contenu d'un fichier qui n'a pas été listé sous un dossier « FT-TEST-P1… ». */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const SID = process.argv[2] || '';
const PROD_SID = '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw', TEST_SID = '1gBAmFDy2iEtsM8i5qeBTU5x2RckHqchkizUYgOurhKHw9C-Ymvis8C6m';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Usage : node p1/lister_sauvegardes_test.js <Script ID du projet de TEST>'); process.exit(64); }
if (SID === PROD_SID) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
if (SID !== TEST_SID) { console.error('⛔ ce n\'est pas le Script ID du projet de TEST : refus'); process.exit(3); }
const DRIVE = 'https://www.googleapis.com/drive/v3/files';
const masque = (s) => '…' + String(s).slice(-8);
let ok = 0, rouge = 0;
const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 300) : '')); return !!c; };
const idsTest = new Set();      // les SEULS identifiants dont on a le droit de lire le contenu : dossiers « FT-TEST-P1… » et ce qu'ils contiennent
let TOKEN = '';

async function jeton() {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new Error('jeton non obtenu');
  return j.access_token;
}
/* le SEUL point de passage vers Drive : GET, et deux formes d'adresse (une liste, ou le contenu d'UN fichier déjà listé sous un dossier de TEST) */
async function dget(url) {
  const m = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\/([A-Za-z0-9_-]+)\?alt=media$/.exec(url);
  if (!(url.startsWith(DRIVE + '?') || (m && idsTest.has(m[1])))) throw new Error('requête Drive non permise');
  const r = await fetch(url, { method: 'GET', headers: { authorization: 'Bearer ' + TOKEN }, signal: AbortSignal.timeout(90000) });
  const texte = await r.text();
  let j = null; try { j = JSON.parse(texte); } catch (e) { /* contenu non JSON ou erreur HTML */ }
  return { s: r.status, j, texte };
}
async function lister(q) {
  let out = [], pt = '';
  for (let k = 0; k < 10; k++) {
    const r = await dget(DRIVE + '?q=' + encodeURIComponent(q) + '&fields=' + encodeURIComponent('nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime)') + '&pageSize=200&orderBy=createdTime' + (pt ? '&pageToken=' + encodeURIComponent(pt) : ''));
    if (r.s !== 200) return { s: r.s, files: out, err: r.j && r.j.error };
    out = out.concat((r.j && r.j.files) || []);
    pt = r.j && r.j.nextPageToken;
    if (!pt) break;
  }
  return { s: 200, files: out };
}
const dossiersTest = () => lister("mimeType='application/vnd.google-apps.folder' and trashed=false and name contains 'FT-TEST-P1'");
const enfants = (id) => { if (!idsTest.has(id)) throw new Error('dossier non autorisé'); return lister("'" + id + "' in parents and trashed=false"); };

(async () => {
  TOKEN = await jeton();
  console.log('════ sauvegardes du projet de TEST · lecture seule ════');
  const D = await dossiersTest();
  if (D.s !== 200) { t('(S1) la liste des dossiers « FT-TEST-P1… » est lue (HTTP ' + D.s + ')', false, D.err && D.err.status); process.exit(1); }
  const dossiers = D.files.filter((x) => /^FT-TEST-P1/.test(x.name));
  t('(S1) dossier(s) dont le nom commence par « FT-TEST-P1 » : ' + dossiers.length + ' (la requête ne liste RIEN d\'autre ; dossier de la production : NON LU)', dossiers.length >= 1, dossiers.map((x) => x.name + ' · créé ' + String(x.createdTime).slice(0, 16) + ' · ' + masque(x.id)));
  if (!dossiers.length) process.exit(1);
  dossiers.forEach((x) => idsTest.add(x.id));
  let tous = [];
  for (const d of dossiers) {
    const E = await enfants(d.id);
    if (E.s !== 200) { t('(S2) le contenu de ' + d.name + ' est lu (HTTP ' + E.s + ')', false); continue; }
    E.files.forEach((f) => idsTest.add(f.id));
    const sous = E.files.filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
    let dessous = [];
    for (const sd of sous) { const F = await enfants(sd.id); if (F.s === 200) { F.files.forEach((f) => idsTest.add(f.id)); dessous = dessous.concat(F.files.map((f) => Object.assign({ dans: sd.name }, f))); } }
    console.log('       contenu de ' + d.name + ' : ' + E.files.length + ' élément(s) · sous-dossiers : ' + (sous.map((x) => x.name).join(', ') || 'aucun') + ' · fichiers dans les sous-dossiers : ' + dessous.length);
    tous = tous.concat(E.files.filter((f) => f.mimeType !== 'application/vnd.google-apps.folder').map((f) => Object.assign({ dans: d.name }, f)));
  }
  const sauv = tous.filter((f) => /^backup-\d{4}-\d{2}-\d{2}(-\d{2}-\d{2})?\.json$/.test(f.name)).sort((a, b) => String(a.createdTime).localeCompare(String(b.createdTime)));
  const octets = sauv.reduce((s, f) => s + (parseInt(f.size, 10) || 0), 0);
  t('(S2) fichiers « backup-….json » dans le dossier de TEST : ' + sauv.length + ' · ' + octets + ' octets au total · tous non vides', sauv.length >= 1 && sauv.every((f) => (parseInt(f.size, 10) || 0) > 0), sauv.slice(-5).map((f) => f.name + ' · ' + f.size + ' o · créé ' + String(f.createdTime).slice(0, 19)));
  if (!sauv.length) { console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  const dernier = sauv[sauv.length - 1];
  console.log('   la plus récente : ' + dernier.name + ' · ' + dernier.size + ' octets · créée ' + String(dernier.createdTime).slice(0, 19) + ' · modifiée ' + String(dernier.modifiedTime).slice(0, 19));
  /* (S3) UNE tentative de lecture du contenu de la plus récente */
  const L = await dget(DRIVE + '/' + dernier.id + '?alt=media');
  if (L.s !== 200) {
    const e = (L.j && L.j.error) || {}, cause = ((e.errors || [])[0] || {}).reason || e.status || '';
    console.log('   (S3) lecture du CONTENU : HTTP ' + L.s + ' · cause Google : « ' + cause + ' » · ' + String(e.message || '').replace(/[A-Za-z0-9_-]{25,}/g, '…').slice(0, 140));
    console.log('\n   VERDICT : PRÉSENTES (' + sauv.length + ' fichier(s), non vides, créées par le serveur de TEST) — CONTENU NON LISIBLE AVEC CE JETON (HTTP ' + L.s + ').');
    console.log('   La lisibilité réelle n\'est donc PAS prouvée par ce contrôle : elle l\'a été DANS le projet de TEST (recette P0 du 12/11/2026, lecture + analyse + restauration, PASS 10/10).');
    console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
  }
  /* lisible : on ne montre que des NOMBRES */
  const o = L.j;
  const us = o && Array.isArray(o.users) ? o.users : null;
  t('(S3) le contenu est du JSON de la forme attendue (backed_up_at, user_count, users[])', !!o && typeof o.backed_up_at === 'string' && Array.isArray(o.users) && typeof o.user_count === 'number');
  if (!us) { console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  const fictifs = us.filter((u) => u && typeof u.email === 'string' && /@example\.invalid$/i.test(u.email)).length;
  const complets = us.filter((u) => u && typeof u.email === 'string' && u.data && typeof u.data === 'object' && 'sante' in u).length;
  t('(S4) user_count (' + o.user_count + ') = nombre de comptes (' + us.length + ') · ' + complets + ' compte(s) complet(s) (email + data + sante)', o.user_count === us.length && complets === us.length);
  t('(S5) TOUS les comptes sont fictifs (@example.invalid) : ' + fictifs + ' sur ' + us.length + ' — aucun compte réel dans le projet de TEST', fictifs === us.length && us.length >= 1);
  console.log('\n   VERDICT : ' + (rouge ? 'ANOMALIE — voir les lignes rouges' : 'LISIBLE ET EXPLOITABLE : fichier lu, forme valide, ' + us.length + ' compte(s), tous fictifs.'));
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
