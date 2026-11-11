#!/usr/bin/env node
/* LECTURE SEULE DU VERDICT DE LA RECETTE P0 ET DE L'ÉTAT DES DOSSIERS — « GO TEST P0 » de Michel (11/11/2026). Aucune écriture, aucun nom de compte, aucune adresse e-mail affichée.
   Dit : (1) la fonction `recetteRestaurationP1` poussée dans le brouillon (HEAD) du projet de TEST est-elle IDENTIQUE au fichier du dépôt (empreinte) ? ;
         (2) que contient le dossier de sauvegarde « FT-TEST-P1… » : les fichiers `backup-…` et surtout les marqueurs « P0-VERDICT-PASS|FAIL-… » écrits par la fonction (le NOM porte le verdict) ;
         (3) le dossier de la PRODUCTION (« ForceTracker-Backups ») : nombre d'éléments et date du plus récent — SEULEMENT des nombres, jamais un nom ni un contenu —, à comparer à l'étape « verifier » d'AVANT.
   ⛔ Refuse le Script ID de PRODUCTION. Usage : node p1/lire_verdict_p0.js <scriptId du projet de TEST> */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const SID = process.argv[2] || '';
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Usage : node p1/lire_verdict_p0.js <scriptId>'); process.exit(64); }
if (SID === '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw') { console.error('⛔ Script ID de PRODUCTION : refus'); process.exit(3); }
const masque = (s) => '…' + String(s).slice(-6);
const sansMail = (s) => String(s).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/gi, '<adresse>');
let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 260) : '')); };
(async () => {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const tj = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } })).json();
  if (!tj.access_token) { console.error('⛔ jeton non obtenu'); process.exit(2); }
  const A = { authorization: 'Bearer ' + tj.access_token };
  const get = async (u, brut) => { const r = await fetch(u, { headers: A }); if (brut) return { s: r.status, txt: await r.text() }; const j = await r.json().catch(() => ({})); return { s: r.status, j }; };
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

  /* (1) la fonction poussée = le fichier du dépôt */
  const c = await get('https://script.googleapis.com/v1/projects/' + SID + '/content');
  const F = {}; (c.j.files || []).forEach((x) => { F[x.name] = x; });
  const poussee = F.TestP1 ? String(F.TestP1.source || '') : '';
  const locale = fs.readFileSync(path.join(__dirname, 'TestP1.js'), 'utf8');
  t('(1) le brouillon (HEAD) du projet de TEST contient la fonction recetteRestaurationP1 (fichiers : ' + Object.keys(F).join(', ') + ')', /function recetteRestaurationP1\(\)/.test(poussee), { http: c.s });
  t('(1b) TestP1 poussé = TestP1.js du dépôt (empreinte ' + sha(poussee.replace(/\r\n/g, '\n')) + ' / dépôt ' + sha(locale.replace(/\r\n/g, '\n')) + ')', sha(poussee.replace(/\r\n/g, '\n')) === sha(locale.replace(/\r\n/g, '\n')));

  /* (2) et (3) les dossiers */
  const lister = async (q, champs) => { let out = [], pt = ''; for (let k = 0; k < 6; k++) { const r2 = await get('https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(q) + '&fields=nextPageToken,files(' + champs + ')&pageSize=200&orderBy=createdTime' + (pt ? '&pageToken=' + pt : '')); if (r2.s !== 200) return { s: r2.s, j: r2.j, files: out }; out = out.concat(r2.j.files || []); pt = r2.j.nextPageToken; if (!pt) break; } return { s: 200, files: out }; };
  const dossiers = await lister("mimeType='application/vnd.google-apps.folder' and trashed=false", 'id,name,createdTime');
  if (dossiers.s !== 200) { t('liste des dossiers Drive', false, { http: dossiers.s }); console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  const tests = dossiers.files.filter((x) => /^FT-TEST-P1/.test(x.name)), prods = dossiers.files.filter((x) => x.name === 'ForceTracker-Backups');
  t('(2) UN dossier de TEST « FT-TEST-P1… » et UN dossier de production repérés', tests.length === 1 && prods.length === 1, { test: tests.map((x) => x.name), prod: prods.length });
  if (tests.length === 1) {
    const f = await lister("'" + tests[0].id + "' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'", 'id,name,size,createdTime');
    const sauv = f.files.filter((x) => /^backup-/.test(x.name)), marq = f.files.filter((x) => /^P0-VERDICT-/.test(x.name));
    console.log('   dossier de TEST « ' + tests[0].name + ' » : ' + f.files.length + ' fichier(s) · sauvegardes « backup-… » : ' + sauv.length + ' · marqueurs de verdict : ' + marq.length);
    sauv.slice(-4).forEach((x) => console.log('       SAUVEGARDE ' + x.name + ' · créée ' + String(x.createdTime).slice(0, 19) + ' · ' + Math.round(Number(x.size || 0) / 1024) + ' Ko'));
    marq.forEach((x) => console.log('       MARQUEUR ' + x.name + ' · créé ' + String(x.createdTime).slice(0, 19) + ' · ' + x.size + ' o'));
    const dernier = marq[marq.length - 1], m = dernier && /^P0-VERDICT-(PASS|FAIL)-(\d{8}T\d{6}Z)-(.*)\.txt$/.exec(dernier.name);
    console.log('   VERDICT_P0 ' + (m ? m[1] + ' · ' + m[2] + ' · ' + m[3] : 'AUCUN (la fonction n\'a pas encore été exécutée, ou elle s\'est arrêtée avant d\'écrire son marqueur)'));
    if (dernier) {
      const med = await get('https://www.googleapis.com/drive/v3/files/' + dernier.id + '?alt=media', true);
      if (med.s === 200) { let v = null; try { v = JSON.parse(med.txt); } catch (e) { /* texte */ } console.log('   contenu du dernier marqueur (sans adresse) : ' + sansMail(v ? JSON.stringify({ pass: v.pass, r: v.r, dureeMs: v.dureeMs, erreur: v.erreur }) : med.txt).slice(0, 600)); }
      else console.log('   (contenu du marqueur non lisible avec ce jeton : HTTP ' + med.s + ' — le NOM suffit)');
    }
  }
  /* la production : des NOMBRES seulement */
  for (const pd of prods) {
    const en = await lister("'" + pd.id + "' in parents and trashed=false", 'id,mimeType,createdTime');
    let n = en.files.length, recent = en.files.length ? en.files[en.files.length - 1].createdTime : '';
    for (const sd of en.files.filter((x) => x.mimeType === 'application/vnd.google-apps.folder')) { const f2 = await lister("'" + sd.id + "' in parents and trashed=false", 'id,createdTime'); n += f2.files.length; if (f2.files.length && String(f2.files[f2.files.length - 1].createdTime) > String(recent)) recent = f2.files[f2.files.length - 1].createdTime; }
    console.log('       PROD_DOSSIER_SAUVEGARDE_COMPTE ' + masque(pd.id) + ' : ' + n + ' élément(s) au total, le plus récent créé ' + String(recent).slice(0, 19) + ' (compte seulement ; à comparer à l\'étape « verifier » d\'avant)');
  }
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); process.exit(2); });
