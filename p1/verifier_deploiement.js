#!/usr/bin/env node
/* VÉRIFICATION D'UN DÉPLOIEMENT DE TEST + SON ISOLEMENT — LECTURE SEULE (API Apps Script + un GET test=1). Aucune écriture, aucune adresse e-mail affichée.
   Dit : (1) le déploiement appartient-il bien au projet de TEST (et à aucun autre) ; (2) quelle version il sert et avec quelle configuration d'accès ;
         (3) le CODE servi : feuille de production neutralisée ? identifiants de production absents ? égal au Code.js du candidat à UNE ligne près ? TestP1 présent ?
         (4) la dernière version du brouillon (HEAD) est-elle neutralisée aussi ; (5) ce que Google répond pour un GET test=1 (sans jeton) ; (6) le dossier de sauvegarde Drive du projet de TEST existe-t-il et est-il « FT-TEST-P1… » (si l'API Drive le permet).
   ⛔ Refuse le Script ID et l'adresse de PRODUCTION. Usage : node p1/verifier_deploiement.js <scriptId de TEST> <adresse /exec du déploiement à vérifier> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const SID = process.argv[2] || '', URL_EXEC = process.argv[3] || '';
const PROD_SID = '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw', PROD_DEP = 'AKfycbxWUsEFIlmx', PROD_SHEET = '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID) || !/^https:\/\/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)\/exec$/.test(URL_EXEC)) { console.error('Usage : node p1/verifier_deploiement.js <scriptId> <https://script.google.com/macros/s/…/exec>'); process.exit(64); }
if (SID === PROD_SID || URL_EXEC.includes(PROD_DEP)) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
const DEP = /\/s\/([A-Za-z0-9_-]+)\/exec/.exec(URL_EXEC)[1];
const masque = (s) => '…' + String(s).slice(-8);
let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 260) : '')); };
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const tj = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } })).json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu'); process.exit(2); }
  const A = { authorization: 'Bearer ' + tj.access_token };
  const get = async (u) => { const r = await fetch(u, { headers: A }); const j = await r.json().catch(() => ({})); return { s: r.status, j }; };
  const API = 'https://script.googleapis.com/v1/projects/' + SID;
  /* (1) le déploiement est-il dans le projet de TEST ? */
  const d = await get(API + '/deployments?pageSize=50');
  const dep = (d.j.deployments || []).find((x) => x.deploymentId === DEP);
  t('(1) le déploiement ' + masque(DEP) + ' appartient au projet de TEST (liste de ses déploiements : ' + (d.j.deployments || []).length + ')', !!dep, { http: d.s, deploiements: (d.j.deployments || []).map((x) => masque(x.deploymentId) + (x.deploymentConfig && x.deploymentConfig.versionNumber !== undefined ? '@' + x.deploymentConfig.versionNumber : ' HEAD')).join(' ') });
  if (!dep) { console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  const cfg = dep.deploymentConfig || {}, ep = (dep.entryPoints || []).find((e) => e.webApp) || {};
  const w = (ep.webApp && ep.webApp.entryPointConfig) || {};
  t('(2) version servie @' + cfg.versionNumber + ' · accès=' + w.access + ' · exécuté par=' + w.executeAs + ' · description « ' + String(cfg.description || '').slice(0, 30) + ' » · maj ' + dep.updateTime, cfg.versionNumber !== undefined && w.access === 'ANYONE_ANONYMOUS' && w.executeAs === 'USER_DEPLOYING', w);
  /* (3) le code servi par CETTE version */
  const lire = async (qs) => { const c = await get(API + '/content' + qs); const f = {}; (c.j.files || []).forEach((x) => { f[x.name] = x; }); return { s: c.s, f }; };
  const V = await lire('?versionNumber=' + cfg.versionNumber), H = await lire('');
  const analyse = (etiquette, F) => {
    const code = F.Code ? String(F.Code.source || '') : '';
    const ligne = (code.match(/^var SHEET_ID_ = '([^']*)';/m) || [, ''])[1];
    t(etiquette + ' : la feuille de production est NEUTRALISÉE (SHEET_ID_ = « ' + ligne.slice(0, 40) + ' »)', ligne === 'TEST-SANS-FEUILLE-DE-PRODUCTION', { ligne: ligne.slice(0, 40) });
    t(etiquette + ' : l\'identifiant de la feuille de production n\'apparaît NULLE PART dans le code (' + code.length + ' octets)', !code.includes(PROD_SHEET));
    t(etiquette + ' : aucun identifiant de déploiement ni de projet de PRODUCTION dans le code', !code.includes(PROD_DEP) && !code.includes(PROD_SID));
    return code;
  };
  console.log('   (la version servie @' + cfg.versionNumber + ' : HTTP ' + V.s + ' · fichiers : ' + Object.keys(V.f).join(', ') + ')');
  const codeV = analyse('(3) version servie @' + cfg.versionNumber, V.f);
  t('(3b) TestP1 présent dans la version servie (c\'est lui qui prépare l\'isolement : dossier de récupération de TEST)', !!V.f.TestP1);
  const codeH = analyse('(4) brouillon (HEAD)', H.f);
  /* égalité au candidat à une ligne près */
  const cand = path.join(__dirname, '..', 'Code.js');
  if (fs.existsSync(cand)) {
    const attendu = fs.readFileSync(cand, 'utf8').replace(/^var SHEET_ID_ = '[^']*';/m, "var SHEET_ID_ = 'TEST-SANS-FEUILLE-DE-PRODUCTION';");
    const h = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
    t('(3c) le code servi = Code.js du CANDIDAT du dépôt, à la seule ligne SHEET_ID_ près (empreinte ' + h(codeV) + ' / attendu ' + h(attendu) + ')', h(codeV.replace(/\r\n/g, '\n')) === h(attendu.replace(/\r\n/g, '\n')));
    t('(4b) idem pour le brouillon (HEAD)', h(codeH.replace(/\r\n/g, '\n')) === h(attendu.replace(/\r\n/g, '\n')));
  } else console.log('   (Code.js du dépôt absent : égalité au candidat non vérifiée)');
  const man = V.f.appsscript ? JSON.parse(V.f.appsscript.source) : {};
  console.log('   manifeste servi : webapp=' + JSON.stringify(man.webapp) + ' · ' + ((man.oauthScopes || []).length) + ' portée(s)');
  /* (5) ce que Google répond, sans jeton */
  const r = await fetch(URL_EXEC + '?test=1', { redirect: 'follow' }); const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) { /* html */ }
  t('(5) GET ?test=1 sans jeton : HTTP ' + r.status + ' · JSON « online »', r.status === 200 && j && j.status === 'online', j || txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160));
  /* (6) le dossier de sauvegarde Drive du projet de TEST : lecture seule, nom uniquement */
  const dr = await get('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name contains 'FT-TEST-P1' and trashed=false") + '&fields=files(id,name,createdTime,ownedByMe)&pageSize=10');
  if (dr.s === 200) t('(6) dossier(s) « FT-TEST-P1… » dans le Drive du compte : ' + (dr.j.files || []).length + ' (créés par preparerEssaiP1)', (dr.j.files || []).length >= 1, (dr.j.files || []).map((x) => x.name + ' · ' + String(x.createdTime).slice(0, 10) + ' · à moi=' + x.ownedByMe));
  else console.log('   (6) liste des dossiers Drive : HTTP ' + dr.s + ' — non vérifiable avec ce jeton (portée drive.file seulement) : l\'isolement du dossier sera prouvé par le scénario P1-00 / un envoi réel');
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
