#!/usr/bin/env node
/* PREUVE D'ISOLEMENT PAR LE COMPORTEMENT — serveur de TEST seulement, comptes FICTIFS (@example.invalid) seulement.
   Le code serveur n'écrit dans Drive (sous-dossier « recup-nut » du dossier désigné par `ft_backup_drive_folder_id`) que lorsque la zone de récupération DÉBORDE (200 000 caractères pour le journal).
   Ce script fait déborder la zone d'un compte fictif (un compte « d'avant » : envois sans foodLogV, qui retirent à chaque tour les 200 repas du tour précédent), puis lit Drive :
     · le fichier de débordement doit apparaître dans « FT-TEST-P1-RECUP-… / recup-nut » ;
     · le dossier de sauvegarde de la PRODUCTION (« ForceTracker-Backups ») ne doit gagner AUCUN élément (comptage avant / après, NOMS ET CONTENUS jamais lus ni affichés).
   ⛔ Refuse l'adresse de PRODUCTION. Usage : node p1/prouver_isolement.js <URL /exec de TEST> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const URL_EXEC = process.argv[2] || '';
if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(URL_EXEC)) { console.error('Usage : node p1/prouver_isolement.js https://script.google.com/macros/s/…/exec'); process.exit(64); }
if (URL_EXEC.includes('AKfycbxWUsEFIlmx')) { console.error('⛔ adresse de PRODUCTION : refus'); process.exit(3); }
let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 300) : '')); };
const masque = (s) => '…' + String(s).slice(-6);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const tj = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } })).json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu'); process.exit(2); }
  const A = { authorization: 'Bearer ' + tj.access_token };
  const lister = async (q, champs) => { let out = [], pt = ''; for (let k = 0; k < 6; k++) { const r = await fetch('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(q) + '&fields=nextPageToken,files(' + champs + ')&pageSize=200&orderBy=createdTime' + (pt ? '&pageToken=' + pt : ''), { headers: A }); const j = await r.json().catch(() => ({})); if (r.status !== 200) return { s: r.status, files: out }; out = out.concat(j.files || []); pt = j.nextPageToken; if (!pt) break; } return { s: 200, files: out }; };
  /* les dossiers */
  const dossiers = await lister("mimeType='application/vnd.google-apps.folder' and trashed=false", 'id,name,createdTime');
  const prod = dossiers.files.filter((x) => x.name === 'ForceTracker-Backups'), test = dossiers.files.filter((x) => /^FT-TEST-P1/.test(x.name));
  t('dossiers : 1 dossier de TEST « FT-TEST-P1… » et le dossier de la production repéré', test.length === 1 && prod.length === 1, { test: test.map((x) => x.name), prod: prod.length });
  if (test.length !== 1 || prod.length !== 1) { console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  const comptePROD = async () => { const en = await lister("'" + prod[0].id + "' in parents and trashed=false", 'id,mimeType,createdTime'); let n = en.files.length, recent = en.files.length ? en.files[en.files.length - 1].createdTime : ''; for (const sd of en.files.filter((x) => x.mimeType === 'application/vnd.google-apps.folder')) { const f2 = await lister("'" + sd.id + "' in parents and trashed=false", 'id,createdTime'); n += f2.files.length; if (f2.files.length && String(f2.files[f2.files.length - 1].createdTime) > String(recent)) recent = f2.files[f2.files.length - 1].createdTime; } return { n, recent: String(recent).slice(0, 19) }; };
  const contenuTEST = async () => { const en = await lister("'" + test[0].id + "' in parents and trashed=false", 'id,name,mimeType,createdTime'); const sous = en.files.filter((x) => x.mimeType === 'application/vnd.google-apps.folder'); let fichiers = []; for (const sd of sous) { const f2 = await lister("'" + sd.id + "' in parents and trashed=false", 'id,name,createdTime,size'); fichiers = fichiers.concat(f2.files.map((x) => Object.assign({ dossier: sd.name }, x))); } return { sous: sous.map((x) => x.name), fichiers }; };
  const avantPROD = await comptePROD(), avantTEST = await contenuTEST();
  console.log('   AVANT : dossier de la production = ' + avantPROD.n + ' élément(s), le plus récent ' + avantPROD.recent + ' · dossier de test = ' + avantTEST.fichiers.length + ' fichier(s) de récupération');
  /* faire déborder la zone d'un compte fictif « d'avant » */
  const email = 'iso-' + crypto.randomBytes(4).toString('hex') + '@example.invalid';
  const ligne = (tag, i) => ({ id: tag + String(i).padStart(4, '0') + '-' + String(10000000 + i), date: '2026-11-01', meal: 'dejeuner', name: 'Repas isolement ' + tag + i + ' ' + 'x'.repeat(150), q: 100, u: 'g', kcal: 130, prot: 3, carbs: 28, fat: 1, ts: 1760000000000, per100: null, v: 1, saisie: 'liste', origine: 'reprise', n2: { s: 1, m: 'd', no: [], st: 'declaree' } });
  const post = async (c) => { try { const r = await fetch(URL_EXEC, { method: 'POST', body: JSON.stringify(c), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' }); const txt = await r.text(); try { return JSON.parse(txt); } catch (e) { return { brut: txt.slice(0, 120) }; } } catch (e) { return { err: String(e.message || e) }; } };
  const SEANCE = { date: '2026-10-20', exs: [{ name: 'Squat (test)', sets: [{ kg: 100, reps: 5, done: true, type: 'normal' }] }], vol: 500 };
  let dernier = null, suspendu = false, tour = 0, apparu = false;
  for (tour = 0; tour < 8 && !apparu; tour++) {
    const lignes = []; for (let i = 0; i < 200; i++) lignes.push(ligne('t' + tour + 'x', i));
    dernier = await post({ action: 'saveProfile', email, foodLog: lignes, sessions: [SEANCE], prs: {}, weightLog: [] });
    if (dernier && (dernier.code === 'NUT_SUSPENDU')) { suspendu = true; break; }
    if (!dernier || dernier.ok === false || dernier.status === 'error') { console.log('   tour ' + tour + ' : réponse inattendue ' + JSON.stringify(dernier).slice(0, 200)); if (dernier && dernier.code === 'NUT_ZONE_DRIVE') { t('la zone a tenté Drive mais Drive a refusé (NUT_ZONE_DRIVE)', false, dernier); break; } }
    await pause(2500);
    const c = await contenuTEST(); apparu = c.fichiers.length > avantTEST.fichiers.length;
    console.log('   tour ' + tour + ' : 200 repas envoyés (les 200 du tour précédent sont retirés → zone) · fichiers de récupération dans le dossier de test : ' + c.fichiers.length);
  }
  if (suspendu) { t('BLOQUÉ : le serveur est en créneau de suspension — à rejouer hors créneau', false, 'NUT_SUSPENDU'); console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(4); }
  await pause(3000);
  const apresTEST = await contenuTEST(), apresPROD = await comptePROD();
  const nouveaux = apresTEST.fichiers.slice(avantTEST.fichiers.length);
  t('le débordement de la zone a bien écrit un fichier « recup-nut-….json » dans le sous-dossier « recup-nut » du dossier de TEST', nouveaux.length >= 1 && nouveaux.every((x) => /^recup-nut-.*\.json$/.test(x.name) && x.dossier === 'recup-nut'), { nouveaux: nouveaux.map((x) => x.name.replace(/\d{6}-[0-9a-f]{8}/, '<hms>-<id>') + ' · ' + x.size + ' o · ' + String(x.createdTime).slice(0, 19)), sousDossiers: apresTEST.sous });
  t('le dossier de sauvegarde de la PRODUCTION n\'a gagné AUCUN élément (comptage avant ' + avantPROD.n + ' / après ' + apresPROD.n + ' ; plus récent avant ' + avantPROD.recent + ' / après ' + apresPROD.recent + ')', apresPROD.n === avantPROD.n && apresPROD.recent === avantPROD.recent);
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
