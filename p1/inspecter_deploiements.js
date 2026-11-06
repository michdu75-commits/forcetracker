#!/usr/bin/env node
/* INSPECTION DES DÉPLOIEMENTS DU PROJET DE TEST — LECTURE SEULE (API Apps Script : projects.deployments.list + projects.versions.list).
   Dit, pour chaque déploiement : version, description, date, et la configuration D'ACCÈS de l'entrée web (access / executeAs) — c'est ce qui explique un « Access Denied ».
   Utilise le jeton de clasp (~/.clasprc.json, restauré depuis le secret par le workflow) pour obtenir un jeton d'accès COURT ; AUCUN secret n'est affiché ni écrit.
   ⛔ Refuse le Script ID de PRODUCTION. Usage : node p1/inspecter_deploiements.js <scriptId du projet de TEST> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const SID = process.argv[2] || '';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Usage : node p1/inspecter_deploiements.js <scriptId>'); process.exit(64); }
if (SID === '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw') { console.error('⛔ Script ID de PRODUCTION : refus'); process.exit(3); }
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const t = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const corps = new URLSearchParams({ client_id: t.client_id, client_secret: t.client_secret, refresh_token: t.refresh_token, grant_type: 'refresh_token' });
  const tk = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: corps, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const tj = await tk.json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu : HTTP ' + tk.status + ' ' + String(tj.error || '') + ' ' + String(tj.error_description || '').slice(0, 120)); process.exit(2); }
  const get = async (p) => { const r = await fetch('https://script.googleapis.com/v1/projects/' + SID + p, { headers: { authorization: 'Bearer ' + tj.access_token } }); const j = await r.json().catch(() => ({})); return { s: r.status, j }; };
  const d = await get('/deployments?pageSize=50');
  console.log('deployments.list : HTTP ' + d.s + (d.j.error ? ' · ' + JSON.stringify(d.j.error).slice(0, 300) : ''));
  for (const x of (d.j.deployments || [])) {
    const cfg = x.deploymentConfig || {}, ep = (x.entryPoints || []).map((e) => e.entryPointType + (e.webApp ? ' access=' + (e.webApp.entryPointConfig && e.webApp.entryPointConfig.access) + ' executeAs=' + (e.webApp.entryPointConfig && e.webApp.entryPointConfig.executeAs) : '')).join(' | ');
    console.log('  · …' + String(x.deploymentId).slice(-8) + ' · version ' + (cfg.versionNumber === undefined ? '(HEAD)' : '@' + cfg.versionNumber) + ' · « ' + String(cfg.description || '').slice(0, 40) + ' » · maj ' + x.updateTime + ' · ' + (ep || '(aucune entrée)') + ' · manifeste ' + cfg.manifestFileName);
  }
  const v = await get('/versions?pageSize=50');
  console.log('versions.list : HTTP ' + v.s + ' · ' + (v.j.versions || []).length + ' version(s) : ' + (v.j.versions || []).map((x) => '@' + x.versionNumber).join(' '));
  const pj = await get('');
  console.log('projet : HTTP ' + pj.s + ' · titre « ' + String(pj.j.title || '?').slice(0, 60) + ' » · créé ' + pj.j.createTime + ' · mis à jour ' + pj.j.updateTime + ' · scriptId …' + String(pj.j.scriptId || '').slice(-8));
  const c = await get('/content');
  (c.j.files || []).filter((f) => f.type === 'SERVER_JS').forEach((f) => { const fn = (String(f.source || '').match(/^function\s+([A-Za-z0-9_$]+)/gm) || []).map((x) => x.replace(/^function\s+/, '')); console.log('fichier ' + f.name + ' : ' + fn.length + ' fonction(s) de premier niveau' + (f.name === 'TestP1' ? ' → ' + fn.join(', ') : '')); });
  const man = (c.j.files || []).find((f) => f.name === 'appsscript');
  if (man) { try { const m = JSON.parse(man.source); console.log('manifeste du projet (HEAD) : webapp=' + JSON.stringify(m.webapp) + ' · scopes=' + (m.oauthScopes || []).length); } catch (e) { console.log('manifeste illisible'); } }
  console.log('fichiers du projet : ' + (c.j.files || []).map((f) => f.name + '(' + f.type + ')').join(', '));
  process.exit(d.s === 200 ? 0 : 1);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
