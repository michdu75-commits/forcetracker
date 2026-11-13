#!/usr/bin/env node
/* PRÉPARER, puis DÉPLOYER, F2-A′ DANS LE PROJET APPS SCRIPT DE TEST — ET NULLE PART AILLEURS.
   « GO NOUVEAU DÉPLOIEMENT F2-A′ SUR TEST UNIQUEMENT » de Michel (13/11/2026). Branche d'essai test/f2a-prime-*, jamais fusionnée.

   Usage : node p1/deployer_test.js <preparer|deployer> <Script ID du projet de TEST>
     preparer : LECTURE SEULE. Lit le projet de TEST (API Apps Script, GET seulement), refait tous les contrôles, annonce ce que deployer écrirait. N'écrit RIEN.
     deployer : refait les MÊMES contrôles, puis — seulement s'ils sont tous verts ET si CONFIRMER = « DEPLOYER-<empreinte du candidat>-SUR-TEST » — fait TROIS écritures :
                ① PUT du code : seul le fichier « Code » change (neutralisé : feuille de production remplacée) ; « appsscript » et « TestP1 » repartent à l'IDENTIQUE ;
                ② une NOUVELLE version (le numéro suivant) ; ③ un NOUVEAU déploiement web qui sert cette version.
                Puis il COMPARE l'état d'avant et d'après : les déploiements existants (HEAD, @1 à @4) doivent être strictement inchangés.

   ⛔ CE QUE CE SCRIPT NE PEUT PAS FAIRE, PAR CONSTRUCTION (un seul point de passage, `api()`, avec une liste fermée de 7 couples méthode/chemin) :
      · toucher un autre projet que celui de TEST (UN seul Script ID accepté ; celui de la production est refusé avant toute requête) ;
      · modifier, redéployer ou supprimer un déploiement EXISTANT (aucun chemin « /deployments/<id> » n'est permis : @4 est hors d'atteinte) ;
      · écrire quoi que ce soit en mode « preparer », ou en mode « deployer » non confirmé (les écritures sont fermées par défaut) ;
      · lire ou écrire Drive, une feuille Google, une propriété de script, un compte (ce script n'appelle que l'API Apps Script et la route du jeton) ;
      · afficher un secret ou une adresse e-mail.
   ⚠️ Les identifiants de PRODUCTION ci-dessous ne servent qu'à REFUSER. Ils sont LUS dans master par le générateur de ce fichier (jamais tapés à la main) puis RECOMPTÉS
      par le banc local (une faute de frappe dans une garde = une garde qui ne refuse rien : constaté le 13/11/2026 ailleurs). */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const MODE = process.argv[2] || '', SID = process.argv[3] || '';
const CONFIRMER = process.env.CONFIRMER || '';
const EMP_CAND = process.env.EMPREINTE_CANDIDAT || '', EMP_BASE = process.env.EMPREINTE_BASE || '', BLOB_CAND = process.env.BLOB_CANDIDAT || '';
const SHA8 = String(process.env.GITHUB_SHA || 'local').slice(0, 8);
const PROD_SID = '1RwE46heNmZrykInYcrMgm1OZWt4NmS6NjTqttvAevZLuqo2v6EEb1Drw', PROD_DEP = 'AKfycbxWUsEFIlmx', PROD_SHEET = '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg';   // REFUS seulement
const TEST_SID = '1gBAmFDy2iEtsM8i5qeBTU5x2RckHqchkizUYgOurhKHw9C-Ymvis8C6m';                       // liste blanche : le SEUL projet que ce script a le droit de toucher
const TITRE = 'FT-TEST-P1';
const TESTP1_SHA12 = '4642c165ddce';               // TestP1.js de la branche test/p0-… (recette de restauration), tel que poussé dans le TEST le 12/11/2026
const NEUTRE = 'TEST-SANS-FEUILLE-DE-PRODUCTION';
const VERSIONS_MAX_AVANT = 190;                        // la limite de Google est de 200 versions par projet : on refuse au-delà de 190 (marge de 9)
const DESC_DEPLOIEMENT = 'FT-TEST-P1-F2A-PRIME-13-11-2026';
const MARQUE = 'F2A-PRIME';                            // présente dans la description de la version ET du déploiement : sert d'anti-doublon (un seul déploiement par candidat)
const BASE4 = { description: 'FT-TEST-P1-C1-C5-06-11-2026', maj: '2026-11-06T22:40:30.239Z' };   // le déploiement @4, tel qu'observé le 13/11/2026 (run n°197)
const ATTENDU_ACCES = { access: 'ANYONE_ANONYMOUS', executeAs: 'USER_DEPLOYING' };
const ROOT = 'https://script.googleapis.com/v1/projects/' + SID;
/* LISTE FERMÉE : sept couples méthode/chemin, pas un de plus. Pas de « /deployments/<id> » (donc ni mise à jour, ni suppression), pas de DELETE, pas de PATCH. */
const PERMIS = [['GET', /^$/], ['GET', /^\/deployments$/], ['GET', /^\/versions$/], ['GET', /^\/content$/], ['PUT', /^\/content$/], ['POST', /^\/versions$/], ['POST', /^\/deployments$/]];
let TOKEN = '', ecrituresOuvertes = false;
const ecritures = [];                                  // ce qui a réellement été écrit, dans l'ordre
let ok = 0, rouge = 0;
const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 320) : '')); return !!c; };
const h12 = (s) => crypto.createHash('sha256').update(String(s).replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
const masque = (s) => '…' + String(s).slice(-8);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const canon = (o) => (Array.isArray(o) ? o.map(canon) : (o && typeof o === 'object') ? Object.keys(o).sort().reduce((a, k) => { a[k] = canon(o[k]); return a; }, {}) : o);
const canonJSON = (s) => { try { return JSON.stringify(canon(JSON.parse(s))); } catch (e) { return 'ILLISIBLE'; } };

/* ── 0 · refus d'entrée : AVANT toute requête ─────────────────────────────────────────────────────────────────────────────────────────────── */
if (MODE !== 'preparer' && MODE !== 'deployer') { console.error('Usage : node p1/deployer_test.js <preparer|deployer> <Script ID du projet de TEST>'); process.exit(64); }
if (!/^1[A-Za-z0-9_-]{40,60}$/.test(SID)) { console.error('Script ID : format inattendu'); process.exit(64); }
if (SID === PROD_SID) { console.error('⛔ PRODUCTION : refus'); process.exit(3); }
if (SID !== TEST_SID) { console.error('⛔ ce n\'est pas le Script ID du projet de TEST : refus'); process.exit(3); }
if (process.env.GITHUB_REF && !/^refs\/heads\/test\/f2a-prime-/.test(process.env.GITHUB_REF)) { console.error('⛔ ce script ne tourne que sur une branche test/f2a-prime-* : refus'); process.exit(3); }
if (!/^[0-9a-f]{12}$/.test(EMP_CAND) || !/^[0-9a-f]{12}$/.test(EMP_BASE) || !/^[0-9a-f]{7,40}$/.test(BLOB_CAND)) { console.error('empreintes attendues (EMPREINTE_CANDIDAT, EMPREINTE_BASE, BLOB_CANDIDAT) absentes ou mal formées'); process.exit(64); }

/* ── le SEUL point de passage vers Google ─────────────────────────────────────────────────────────────────────────────────────────────────── */
async function api(methode, suffixe, opt) {
  const { query = '', corps } = opt || {};
  if (!PERMIS.some(([m, rx]) => m === methode && rx.test(suffixe))) throw new Error('requête non permise : ' + methode + ' ' + suffixe);
  if (methode !== 'GET' && !ecrituresOuvertes) throw new Error('écriture refusée : le mode « ' + MODE + ' » (ou l\'absence de confirmation) les interdit');
  const r = await fetch(ROOT + suffixe + query, { method: methode, headers: Object.assign({ authorization: 'Bearer ' + TOKEN }, corps ? { 'content-type': 'application/json' } : {}), body: corps ? JSON.stringify(corps) : undefined, signal: AbortSignal.timeout(90000) });
  const j = await r.json().catch(() => ({}));
  if (methode !== 'GET') ecritures.push(methode + ' ' + suffixe + ' → HTTP ' + r.status);
  return { s: r.status, j };
}
async function jeton() {
  const rc = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
  const tk = (rc.tokens && (rc.tokens.default || Object.values(rc.tokens)[0])) || rc;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: tk.client_id, client_secret: tk.client_secret, refresh_token: tk.refresh_token, grant_type: 'refresh_token' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new Error('jeton non obtenu');
  return j.access_token;
}
async function lister(suffixe, cle) {
  let out = [], pt = '';
  for (let k = 0; k < 20; k++) {
    const r = await api('GET', suffixe, { query: '?pageSize=50' + (pt ? '&pageToken=' + encodeURIComponent(pt) : '') });
    if (r.s !== 200) return { s: r.s, items: out };
    out = out.concat(r.j[cle] || []);
    pt = r.j.nextPageToken || '';
    if (!pt) break;
  }
  return { s: 200, items: out };
}
async function contenu(version) {
  const r = await api('GET', '/content', { query: version === undefined ? '' : '?versionNumber=' + version });
  const ordre = [], f = {};
  (r.j.files || []).forEach((x) => { ordre.push(x.name); f[x.name] = x; });
  return { s: r.s, f, ordre };
}
const resume = (d) => {
  const c = d.deploymentConfig || {}, ep = (d.entryPoints || []).find((e) => e.webApp) || {}, w = (ep.webApp && ep.webApp.entryPointConfig) || {};
  return { id: d.deploymentId, version: c.versionNumber === undefined ? 'HEAD' : c.versionNumber, description: c.description || '', maj: d.updateTime || '', access: w.access || '', executeAs: w.executeAs || '' };
};
const cleDep = (d) => d.version === 'HEAD' ? [d.id, 'HEAD'].join('|') : [d.id, d.version, d.description, d.maj, d.access, d.executeAs].join('|');   // HEAD : sa date n'a pas de sens (1970)
const ligneDep = (d) => '      · ' + masque(d.id) + ' · ' + (d.version === 'HEAD' ? 'HEAD' : '@' + d.version) + ' · « ' + d.description + ' » · maj ' + d.maj + (d.access ? ' · ' + d.access + '/' + d.executeAs : '');
const ordreNum = (a, b) => (a.version === 'HEAD' ? -1 : b.version === 'HEAD' ? 1 : a.version - b.version);

/* neutralisation : EXACTEMENT une ligne change (la feuille de production devient une valeur inerte) */
function neutraliser(code) {
  const n = (code.match(/^var SHEET_ID_ = '[^']*';/gm) || []).length;
  const sortie = code.replace(/^var SHEET_ID_ = '[^']*';/m, "var SHEET_ID_ = '" + NEUTRE + "';");
  const A = code.split('\n'), B = sortie.split('\n');
  const diff = A.length === B.length ? A.reduce((s, l, i) => s + (l === B[i] ? 0 : 1), 0) : -1;
  return { n, code: sortie, diff };
}

/* ── tous les contrôles d'AVANT (lecture seule) ; rend l'état lu, ou null si un contrôle est rouge ────────────────────────────────────────── */
async function controlerAvant() {
  const rep = path.join(__dirname, '..');
  const codeBuf = fs.readFileSync(path.join(rep, 'Code.js')), codeDepot = codeBuf.toString('utf8');
  const manifDepot = fs.readFileSync(path.join(rep, 'appsscript.json'), 'utf8');
  const blob = crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob ' + codeBuf.length + '\0'), codeBuf])).digest('hex');
  console.log('── A · le projet, ses déploiements, ses versions (lecture seule) ──');
  const P = await api('GET', '');
  t('(A1) le projet porte le titre « ' + TITRE + ' » et le Script ID de TEST', P.s === 200 && P.j.title === TITRE && P.j.scriptId === SID, { http: P.s, titre: P.j.title });
  const D = await lister('/deployments', 'deployments'), V = await lister('/versions', 'versions');
  if (!t('(A2) les listes de déploiements et de versions sont lues en entier', D.s === 200 && V.s === 200, { deploiements: D.s, versions: V.s })) return null;
  const dep = D.items.map(resume).sort(ordreNum), ver = V.items.map((x) => ({ n: x.versionNumber, description: x.description || '', createTime: x.createTime || '' })).sort((a, b) => a.n - b.n);
  console.log('   déploiements (' + dep.length + ') :\n' + dep.map(ligneDep).join('\n'));
  const maxV = ver.length ? ver[ver.length - 1].n : 0;
  t('(A3) budget de versions : ' + ver.length + ' existante(s), numéro le plus haut @' + maxV + ' ; limite de Google 200 ; refus au-delà de ' + VERSIONS_MAX_AVANT, ver.length <= VERSIONS_MAX_AVANT && maxV < 200);
  t('(A4) AUCUN déploiement n\'a un identifiant de PRODUCTION', dep.every((d) => !String(d.id).includes(PROD_DEP)));
  const num = dep.filter((d) => d.version !== 'HEAD'), d4 = num.filter((d) => d.version === 4);
  t('(A5) tous les déploiements versionnés sont des web apps anonymes exécutées par le déployeur', num.every((d) => d.access === ATTENDU_ACCES.access && d.executeAs === ATTENDU_ACCES.executeAs));
  t('(A6) le déploiement @4 existe une seule fois, tel qu\'observé le 13/11 (« ' + BASE4.description + ' », maj ' + BASE4.maj + ')', d4.length === 1 && d4[0].description === BASE4.description && d4[0].maj === BASE4.maj, d4.map((d) => ({ description: d.description, maj: d.maj })));
  t('(A7) PAS DÉJÀ DÉPLOYÉ : aucune version ni aucun déploiement ne porte la marque « ' + MARQUE + ' » (un seul déploiement par candidat)', !ver.some((x) => x.description.includes(MARQUE)) && !dep.some((d) => d.description.includes(MARQUE)));
  t('(A8) l\'état est EXACTEMENT celui observé le 13/11 : ' + dep.length + ' déploiement(s) dont un seul HEAD, versions ' + ver.map((x) => x.n).join(','), dep.length === 5 && dep.filter((d) => d.version === 'HEAD').length === 1 && ver.map((x) => x.n).join(',') === '1,2,3,4');
  console.log('── B · le brouillon (HEAD) et la version @4 ──');
  const H = await contenu(), V4 = await contenu(4);
  if (!t('(B0) le contenu du brouillon et de @4 est lu (HTTP ' + H.s + ' / ' + V4.s + ')', H.s === 200 && V4.s === 200)) return null;
  const noms = H.ordre.slice().sort().join(',');
  t('(B1) le brouillon ne contient EXACTEMENT que trois fichiers : Code, TestP1, appsscript (rien à supprimer, rien d\'inconnu)', noms === 'Code,TestP1,appsscript', H.ordre.join(','));
  t('(B2) TestP1 du brouillon = celui de la recette P0 (empreinte ' + (H.f.TestP1 ? h12(H.f.TestP1.source) : 'absent') + ' / attendue ' + TESTP1_SHA12 + ') : il repartira à l\'identique', !!H.f.TestP1 && h12(H.f.TestP1.source) === TESTP1_SHA12);
  const champsDiff = (a, b) => { try { const A = JSON.parse(a), B = JSON.parse(b); return Array.from(new Set(Object.keys(A).concat(Object.keys(B)))).filter((k) => JSON.stringify(canon(A[k])) !== JSON.stringify(canon(B[k]))); } catch (e) { return ['illisible']; } };
  t('(B3) le manifeste du brouillon = celui du candidat (mêmes portées, même accès web) : aucune nouvelle autorisation à redonner', !!H.f.appsscript && canonJSON(H.f.appsscript.source) === canonJSON(manifDepot) && canonJSON(manifDepot) !== 'ILLISIBLE', H.f.appsscript ? 'champs qui diffèrent : ' + (champsDiff(H.f.appsscript.source, manifDepot).join(', ') || 'aucun') : 'manifeste absent');
  const man = (() => { try { return JSON.parse(manifDepot); } catch (e) { return {}; } })();
  t('(B4) le manifeste du candidat : web app « ' + (man.webapp && man.webapp.access) + ' / ' + (man.webapp && man.webapp.executeAs) + ' », ' + ((man.oauthScopes || []).length) + ' portée(s)', !!man.webapp && man.webapp.access === ATTENDU_ACCES.access && man.webapp.executeAs === ATTENDU_ACCES.executeAs && (man.oauthScopes || []).length >= 1);
  t('(B5) @4 sert le code de MASTER (empreinte ' + (V4.f.Code ? h12(V4.f.Code.source) : 'absent') + ' / attendue ' + EMP_BASE + ') : c\'est l\'état qu\'on promet de ne pas toucher', !!V4.f.Code && h12(V4.f.Code.source) === EMP_BASE);
  t('(B6) le manifeste de @4 = celui du candidat', !!V4.f.appsscript && canonJSON(V4.f.appsscript.source) === canonJSON(manifDepot));
  console.log('   (information : le brouillon porte aujourd\'hui un Code d\'empreinte ' + (H.f.Code ? h12(H.f.Code.source) : 'absent') + ')');
  console.log('── C · le candidat du dépôt ──');
  t('(C1) le Code.js du dépôt est bien le candidat F2-A′ (blob Git ' + blob.slice(0, 8) + ' / attendu ' + BLOB_CAND.slice(0, 8) + ')', blob.startsWith(BLOB_CAND));
  const N = neutraliser(codeDepot);
  t('(C2) la feuille de production est neutralisée sur UNE ligne et une seule (' + N.n + ' ligne(s) SHEET_ID_, ' + N.diff + ' ligne(s) modifiée(s))', N.n === 1 && N.diff === 1);
  t('(C3) aucun identifiant de PRODUCTION (feuille, projet, déploiement) ne subsiste dans le code poussé (' + N.code.length + ' caractères)', !N.code.includes(PROD_SHEET) && !N.code.includes(PROD_SID) && !N.code.includes(PROD_DEP) && N.code.includes("var SHEET_ID_ = '" + NEUTRE + "';"));
  t('(C4) l\'empreinte du code poussé est celle du candidat (' + h12(N.code) + ' / attendue ' + EMP_CAND + ') et diffère de celle de @4 (' + EMP_BASE + ')', h12(N.code) === EMP_CAND && EMP_CAND !== EMP_BASE);
  const phrase = 'DEPLOYER-' + EMP_CAND + '-SUR-TEST';
  if (MODE === 'deployer') t('(C5) la confirmation est la phrase exacte « ' + phrase + ' »', CONFIRMER === phrase);
  else console.log('   (phrase de confirmation exigée par « deployer » : ' + phrase + ')');
  if (rouge) return null;
  return { dep, ver, maxV, H, V4, codeNeutre: N.code, manifDepot };
}

/* ── les trois écritures, chacune vérifiée avant la suivante ──────────────────────────────────────────────────────────────────────────────── */
class Partiel extends Error {}
async function deployer(E) {
  ecrituresOuvertes = true;
  const avant = E.H.ordre.map((n) => E.H.f[n]);
  /* ① le code : seul « Code » change ; les deux autres fichiers repartent avec la source EXACTE lue dans le brouillon */
  const files = avant.map((f) => ({ name: f.name, type: f.type || (f.name === 'appsscript' ? 'JSON' : 'SERVER_JS'), source: f.name === 'Code' ? E.codeNeutre : f.source }));
  const r1 = await api('PUT', '/content', { corps: { files } });
  if (r1.s !== 200) throw new Partiel('① PUT /content : HTTP ' + r1.s + ' — AUCUN changement n\'a eu lieu (un PUT refusé n\'écrit rien)');
  let H1 = null;
  for (let k = 0; k < 4; k++) { H1 = await contenu(); if (H1.s === 200 && H1.f.Code && h12(H1.f.Code.source) === EMP_CAND) break; await attendre(1500); }
  const intact = (n) => !!H1.f[n] && !!E.H.f[n] && H1.f[n].source === E.H.f[n].source;
  if (!(H1.s === 200 && H1.f.Code && h12(H1.f.Code.source) === EMP_CAND && intact('TestP1') && intact('appsscript') && H1.ordre.length === E.H.ordre.length)) throw new Partiel('① le brouillon relu n\'est pas celui qu\'on vient d\'écrire — état partiel : le brouillon a changé, AUCUN déploiement n\'a été créé');
  console.log('   ✅ ① brouillon écrit et relu : Code = empreinte ' + EMP_CAND + ' · TestP1 et appsscript identiques à l\'octet');
  /* ② la version */
  const r2 = await api('POST', '/versions', { corps: { description: MARQUE + ' TEST ' + SHA8 + ' ' + EMP_CAND } });
  const nv = r2.j && r2.j.versionNumber;
  if (r2.s !== 200 || nv !== E.maxV + 1) throw new Partiel('② POST /versions : HTTP ' + r2.s + ', numéro rendu ' + nv + ' (attendu ' + (E.maxV + 1) + ') — le brouillon est écrit, AUCUN déploiement n\'a été créé');
  let Vn = null;
  for (let k = 0; k < 4; k++) { Vn = await contenu(nv); if (Vn.s === 200 && Vn.f.Code && h12(Vn.f.Code.source) === EMP_CAND) break; await attendre(1500); }
  const intactV = (n) => !!Vn.f[n] && !!E.H.f[n] && Vn.f[n].source === E.H.f[n].source;
  if (!(Vn.s === 200 && Vn.f.Code && h12(Vn.f.Code.source) === EMP_CAND && intactV('TestP1') && intactV('appsscript') && Object.keys(Vn.f).length === E.H.ordre.length)) throw new Partiel('② la version @' + nv + ' ne contient pas ce qu\'on attend — la version existe (1 sur le budget), AUCUN déploiement n\'a été créé');
  console.log('   ✅ ② version @' + nv + ' créée et relue : même contenu que le brouillon écrit');
  /* ③ le NOUVEAU déploiement : jamais un identifiant existant (aucun chemin « /deployments/<id> » n'est permis) */
  const r3 = await api('POST', '/deployments', { corps: { versionNumber: nv, manifestFileName: 'appsscript', description: DESC_DEPLOIEMENT } });
  const nd = r3.j && r3.j.deploymentId, cfg = (r3.j && r3.j.deploymentConfig) || {};
  if (r3.s !== 200 || !nd) throw new Partiel('③ POST /deployments : HTTP ' + r3.s + ' — la version @' + nv + ' existe, AUCUN déploiement n\'a été créé');
  if (E.dep.some((d) => d.id === nd) || String(nd).includes(PROD_DEP)) throw new Partiel('③ l\'identifiant de déploiement rendu (' + masque(nd) + ') est déjà connu ou ressemble à la production — STOP, rien d\'autre n\'est fait');
  const url = 'https://script.google.com/macros/s/' + nd + '/exec';
  const ep = ((r3.j.entryPoints || []).find((e) => e.webApp) || {}).webApp || {};
  console.log('   ✅ ③ NOUVEAU déploiement ' + masque(nd) + ' → version @' + cfg.versionNumber + ' · accès ' + (ep.entryPointConfig && ep.entryPointConfig.access) + ' / ' + (ep.entryPointConfig && ep.entryPointConfig.executeAs));
  console.log('ADRESSE_EXEC=' + url);
  if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, 'ADRESSE_EXEC=' + url + '\n');
  return { nv, nd, url, cfg, ep };
}

/* ── comparaison d'APRÈS : l'existant n'a pas bougé, il y a exactement un déploiement et une version de plus ──────────────────────────────── */
async function controlerApres(E, R) {
  console.log('── D · l\'état d\'APRÈS comparé à celui d\'AVANT ──');
  let D1 = null, V1 = null;
  for (let k = 0; k < 5; k++) { D1 = await lister('/deployments', 'deployments'); V1 = await lister('/versions', 'versions'); if (D1.s === 200 && V1.s === 200 && D1.items.some((d) => d.deploymentId === R.nd && (d.entryPoints || []).some((e) => e.webApp))) break; await attendre(2000); }
  const dep1 = D1.items.map(resume).sort(ordreNum), ver1 = V1.items.map((x) => ({ n: x.versionNumber, description: x.description || '', createTime: x.createTime || '' })).sort((a, b) => a.n - b.n);
  console.log('   déploiements (' + dep1.length + ') :\n' + dep1.map(ligneDep).join('\n'));
  const avantCles = new Set(E.dep.map(cleDep)), nouveaux = dep1.filter((d) => !avantCles.has(cleDep(d)));
  t('(D1) il y a exactement UN déploiement de plus (' + dep1.length + ' contre ' + E.dep.length + ') et c\'est le nouveau (' + masque(R.nd) + ')', dep1.length === E.dep.length + 1 && nouveaux.length === 1 && nouveaux[0].id === R.nd);
  t('(D2) les ' + E.dep.length + ' déploiements d\'avant (HEAD, @1 à @4) sont STRICTEMENT inchangés (identifiant, version, description, date, accès)', E.dep.every((d) => dep1.some((x) => cleDep(x) === cleDep(d))));
  t('(D3) le nouveau déploiement sert la version @' + R.nv + ' en web app « ' + (nouveaux[0] && nouveaux[0].access) + ' / ' + (nouveaux[0] && nouveaux[0].executeAs) + ' »', !!nouveaux[0] && nouveaux[0].version === R.nv && nouveaux[0].access === ATTENDU_ACCES.access && nouveaux[0].executeAs === ATTENDU_ACCES.executeAs && nouveaux[0].description === DESC_DEPLOIEMENT);
  t('(D4) il y a exactement UNE version de plus (@' + R.nv + ') et les anciennes sont inchangées', ver1.length === E.ver.length + 1 && E.ver.every((v) => ver1.some((x) => x.n === v.n && x.description === v.description && x.createTime === v.createTime)));
  const V4b = await contenu(4);
  t('(D5) @4 sert TOUJOURS le code de master (empreinte ' + (V4b.f.Code ? h12(V4b.f.Code.source) : 'absent') + ' / attendue ' + EMP_BASE + ')', V4b.s === 200 && !!V4b.f.Code && h12(V4b.f.Code.source) === EMP_BASE);
  const Vn = await contenu(R.nv);
  t('(D6) la version @' + R.nv + ' sert le CANDIDAT F2-A′ (empreinte ' + (Vn.f.Code ? h12(Vn.f.Code.source) : 'absent') + ' / attendue ' + EMP_CAND + ')', Vn.s === 200 && !!Vn.f.Code && h12(Vn.f.Code.source) === EMP_CAND);
  t('(D7) l\'adresse rendue par Google correspond à l\'identifiant du déploiement', !R.ep.url || R.ep.url === R.url, R.ep.url ? 'adresse Google = ' + masque(R.ep.url.replace(/\/exec$/, '')) : 'Google n\'a pas rendu d\'adresse : construite à partir de l\'identifiant');
}

(async () => {
  TOKEN = await jeton();
  console.log('════ ' + MODE + ' · projet …' + SID.slice(-8) + ' · code ' + SHA8 + ' · candidat ' + EMP_CAND + ' ════');
  const E = await controlerAvant();
  if (!E) { console.log('\n⛔ STOP : au moins un contrôle d\'AVANT est rouge. ÉCRITURES EFFECTUÉES : aucune.\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(1); }
  if (MODE === 'preparer') {
    console.log('\n   plan de « deployer » (rien de cela n\'est fait ici) : ① PUT /content (seul Code change) · ② POST /versions (→ @' + (E.maxV + 1) + ') · ③ POST /deployments (NOUVEAU, version @' + (E.maxV + 1) + ')');
    console.log('\n──── PRÊT : ' + ok + ' OK / 0 ROUGE · ÉCRITURES EFFECTUÉES : aucune ────'); process.exit(0);
  }
  let R = null;
  try { R = await deployer(E); }
  catch (e) {
    console.log('\n⛔ ARRÊT PENDANT LES ÉCRITURES : ' + (e && e.message || e));
    console.log('   écritures réellement faites : ' + (ecritures.length ? ecritures.join(' · ') : 'aucune'));
    console.log('   les déploiements existants (HEAD, @1 à @4) n\'ont été ni modifiés ni supprimés : aucun chemin du script ne le permet.');
    process.exit(e instanceof Partiel ? 4 : 2);
  }
  try { await controlerApres(E, R); }
  catch (e) { console.log('⛔ contrôle d\'après interrompu : ' + (e && e.message || e)); rouge++; }
  console.log('\n   écritures effectuées : ' + ecritures.join(' · '));
  console.log('\n──── ' + (rouge ? 'ROUGE : ' + ok + ' OK / ' + rouge + ' ROUGE (le déploiement existe : voir ci-dessus avant toute autre action)' : 'DÉPLOYÉ : ' + ok + ' OK / 0 ROUGE · version @' + R.nv + ' · déploiement ' + masque(R.nd)) + ' ────');
  process.exit(rouge ? 1 : 0);
})().catch((e) => { console.error('⛔ ' + (e && e.message || e)); console.error('   écritures réellement faites : ' + (ecritures.length ? ecritures.join(' · ') : 'aucune')); process.exit(2); });
