#!/usr/bin/env node
/* DIAGNOSTIC AVANCÉ DU PROJET DE TEST — LECTURE SEULE, TEST SEULEMENT (aucune écriture, aucune donnée de compte, aucune adresse e-mail affichée).
   Dit pourquoi un déploiement répond « Access Denied » : (1) les portées du jeton de clasp ; (2) l'état du FICHIER Drive du projet (corbeille ? propriétaire ? partagé ?) ;
   (3) l'espace Drive du compte (quota) ; (4) pour CHAQUE déploiement : la chaîne de redirections réelle de Google, les liens et le texte de la page d'erreur, avec et sans le jeton du propriétaire.
   ⛔ Refuse le Script ID de PRODUCTION. Usage : node p1/diag_avance.js <scriptId du projet de TEST> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const SID = process.argv[2] || '';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Usage : node p1/diag_avance.js <scriptId>'); process.exit(64); }
if (SID === '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw') { console.error('⛔ Script ID de PRODUCTION : refus'); process.exit(3); }
const masque = (s) => { s = String(s || ''); return s.length > 12 ? '…' + s.slice(-6) : s; };
const sansMail = (s) => String(s).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/gi, '<adresse>');
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const t = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const corps = new URLSearchParams({ client_id: t.client_id, client_secret: t.client_secret, refresh_token: t.refresh_token, grant_type: 'refresh_token' });
  const tk = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: corps, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const tj = await tk.json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu : HTTP ' + tk.status + ' ' + String(tj.error || '')); process.exit(2); }
  const A = { authorization: 'Bearer ' + tj.access_token };
  const get = async (u) => { const r = await fetch(u, { headers: A }); const j = await r.json().catch(() => ({})); return { s: r.status, j }; };
  /* (1) portées du jeton */
  try { const ti = await (await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + tj.access_token)).json(); console.log('(1) portées du jeton : ' + String(ti.scope || '?').split(' ').map((x) => x.replace('https://www.googleapis.com/auth/', '')).join(' · ') + ' · expire dans ' + ti.expires_in + ' s'); } catch (e) { console.log('(1) tokeninfo impossible'); }
  /* (2) le fichier Drive du projet */
  const f = await get('https://www.googleapis.com/drive/v3/files/' + SID + '?supportsAllDrives=true&fields=id,name,mimeType,trashed,explicitlyTrashed,ownedByMe,shared,createdTime,modifiedTime,driveId,parents,capabilities(canEdit,canShare,canCopy),permissions(type,role,allowFileDiscovery),owners(me),viewersCanCopyContent,copyRequiresWriterPermission,contentRestrictions,permissionIds');
  if (f.s === 200) { const p = (f.j.permissions || []).map((x) => x.type + ':' + x.role + (x.allowFileDiscovery === undefined ? '' : ':découvrable=' + x.allowFileDiscovery)).join(' | ');
    console.log('(2) fichier Drive du projet : HTTP 200 · type ' + f.j.mimeType + ' · corbeille=' + f.j.trashed + '/' + f.j.explicitlyTrashed + ' · à moi=' + f.j.ownedByMe + ' · partagé=' + f.j.shared + ' · dossier parent=' + ((f.j.parents || []).length) + ' · lecteur partagé=' + (f.j.driveId ? 'OUI' : 'non') + ' · créé ' + f.j.createdTime + ' · modifié ' + f.j.modifiedTime + ' · permissions : ' + (p || '(aucune autre que le propriétaire)') + ' · restrictions de contenu : ' + JSON.stringify(f.j.contentRestrictions || []).slice(0, 120)); }
  else console.log('(2) fichier Drive du projet : HTTP ' + f.s + ' ' + sansMail(JSON.stringify(f.j.error || {})).slice(0, 220));
  /* (3) espace Drive */
  const ab = await get('https://www.googleapis.com/drive/v3/about?fields=storageQuota');
  if (ab.s === 200) { const q = ab.j.storageQuota || {}; const go = (n) => (n === undefined ? '?' : (Number(n) / 1e9).toFixed(2) + ' Go'); console.log('(3) espace Drive : limite ' + go(q.limit) + ' · utilisé ' + go(q.usage) + ' (Drive ' + go(q.usageInDrive) + ', corbeille ' + go(q.usageInDriveTrash) + ')'); }
  else console.log('(3) quota Drive : HTTP ' + ab.s);
  /* (4) chaque déploiement */
  const d = await get('https://script.googleapis.com/v1/projects/' + SID + '/deployments?pageSize=50');
  console.log('(4) déploiements : HTTP ' + d.s + ' · ' + (d.j.deployments || []).length);
  for (const x of (d.j.deployments || [])) {
    const id = x.deploymentId, v = x.deploymentConfig && x.deploymentConfig.versionNumber;
    const eps = (x.entryPoints || []).map((e) => e.entryPointType + (e.webApp ? ' url=' + masque(String(e.webApp.url || '')) : '')).join(' | ');
    console.log('\n── déploiement …' + masque(id) + ' · ' + (v === undefined ? 'HEAD' : '@' + v) + ' · ' + eps);
    for (const variante of ['sans jeton', 'avec le jeton du propriétaire']) {
      let url = 'https://script.google.com/macros/s/' + id + '/exec?test=1', ent = variante === 'sans jeton' ? {} : A;
      for (let saut = 0; saut < 5; saut++) {
        let r; try { r = await fetch(url, { redirect: 'manual', headers: ent }); } catch (e) { console.log('   [' + variante + '] ERREUR RÉSEAU ' + String(e.message || e).slice(0, 80)); break; }
        const loc = r.headers.get('location'); const h = new URL(url).host;
        console.log('   [' + variante + '] ' + (saut + 1) + '. ' + h + ' → HTTP ' + r.status + (loc ? ' → ' + new URL(loc, url).host : '') + ' · ' + r.headers.get('content-type'));
        if (loc) { url = new URL(loc, url).href; if (variante !== 'sans jeton' && new URL(url).host !== 'script.google.com') ent = {}; continue; }
        const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) { /* page HTML */ }
        if (j) { console.log('      JSON : ' + sansMail(JSON.stringify(j)).slice(0, 160)); break; }
        const titre = (/<title>([^<]*)<\/title>/i.exec(txt) || [, ''])[1];
        const visible = sansMail(txt.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim());
        const liens = [...new Set([...txt.matchAll(/(?:href|src|action)="(https?:\/\/[^"]+)"/g)].map((m) => { try { const u = new URL(m[1].replace(/&amp;/g, '&')); return u.host + u.pathname.slice(0, 40).replace(/[A-Za-z0-9_-]{20,}/g, (z) => masque(z)) + (u.search ? '?' + [...u.searchParams.keys()].join(',') : ''); } catch (e) { return ''; } }).filter(Boolean))].slice(0, 12);
        console.log('      TITRE : ' + titre + ' · ' + txt.length + ' octets');
        console.log('      TEXTE : ' + visible.slice(0, 420));
        console.log('      LIENS : ' + liens.join('  ·  '));
        break;
      }
    }
  }
  process.exit(0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
