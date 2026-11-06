/* AUTO-CONTRÔLE LOCAL de `isolerEtProgrammerEssaiP1` (faux services Google : aucun réseau). Usage : node p1/test_isoler.js [fichier TestP1.js] */
'use strict';
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2] || 'p1/TestP1.js', 'utf8');
function monde(opt) {
  opt = opt || {}; const props = Object.assign({}, opt.props || {}); let triggers = []; let T = Date.UTC(2026, 10, 6, 23, 0, 0);
  const dossiers = {}; (opt.dossiers || []).forEach((d) => { dossiers[d.id] = { nom: d.nom }; }); const ecritures = []; let n = 0;
  const ctx = { PropertiesService: { getScriptProperties: () => ({ getKeys: () => Object.keys(props), getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: (k) => { delete props[k]; } }) },
    ScriptApp: { getProjectTriggers: () => triggers.slice(), deleteTrigger: (t) => { triggers = triggers.filter((x) => x !== t); }, newTrigger: (h) => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => { triggers.push({ getHandlerFunction: () => h }); } }) }) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    DriveApp: { getFolderById: (id) => { if (!dossiers[id]) throw new Error('introuvable'); return { getName: () => dossiers[id].nom, getId: () => id }; },
      createFolder: (nom) => { const id = 'nouveau' + (++n); dossiers[id] = { nom }; ecritures.push('createFolder:' + nom); return { getId: () => id, getName: () => nom }; } },
    Logger: { log() {} }, SHEET_ID_: opt.sheet === undefined ? 'TEST-SANS-FEUILLE-DE-PRODUCTION' : opt.sheet,
    Date: class extends Date { constructor(...a) { if (a.length) super(...a); else super(T); } static now() { return T; } }, JSON, Error, Number, String, Object };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  return { ctx, props, dossiers, ecritures, triggers: () => triggers };
}
let ok = 0, ko = 0; const t = (n, c, d) => { c ? ok++ : ko++; console.log((c ? '  OK   ' : '  ROUGE ') + n + (d !== undefined ? '  >> ' + JSON.stringify(d) : '')); };
const essai = (w) => { try { return { r: w.ctx.isolerEtProgrammerEssaiP1() }; } catch (e) { return { e: String(e.message) }; } };
/* A : une propriété périmée désigne le dossier de la PRODUCTION */
const A = monde({ props: { ft_backup_drive_folder_id: 'prod1', 'u_c1-aaa@example.invalid': '{}' }, dossiers: [{ id: 'prod1', nom: 'ForceTracker-Backups' }] }); const a = essai(A);
const nomA = A.dossiers[A.props.ft_backup_drive_folder_id] && A.dossiers[A.props.ft_backup_drive_folder_id].nom;
t('A : la propriété désigne maintenant un dossier « FT-TEST-P1… » NEUF (plus celui de la production)', !a.e && /^FT-TEST-P1/.test(nomA) && A.props.ft_backup_drive_folder_id !== 'prod1', { nomA, e: a.e });
t('A : le dossier de la PRODUCTION n\'a reçu AUCUNE écriture (la seule création est le dossier de test)', A.ecritures.length === 1 && /^createFolder:FT-TEST-P1/.test(A.ecritures[0]), A.ecritures);
t('A : LECTURE_STRICTE=off, FT_P1_TEST=1, bascule programmée (1 déclencheur), ancien dossier rapporté comme « ForceTracker-Backups »', A.props.LECTURE_STRICTE === 'off' && A.props.FT_P1_TEST === '1' && A.triggers().length === 1 && a.r && a.r.ancienDossier === 'ForceTracker-Backups', a.r && { ancien: a.r.ancienDossier, cree: a.r.dossierCree });
/* B : un vrai compte */
const B = monde({ props: { 'u_michel@gmail.com': '{}', ft_backup_drive_folder_id: 'prod1' }, dossiers: [{ id: 'prod1', nom: 'ForceTracker-Backups' }] }); const b = essai(B);
t('B : un compte RÉEL dans le projet → refus, RIEN modifié (propriété de dossier inchangée, aucun dossier créé, aucun déclencheur)', /FICTIFS/.test(b.e || '') && B.props.ft_backup_drive_folder_id === 'prod1' && B.ecritures.length === 0 && B.triggers().length === 0, b.e && b.e.slice(0, 80));
/* C : un secret */
const C = monde({ props: { ANTHROPIC_API_KEY: 'x' } }); const c = essai(C);
t('C : un secret dans le projet → refus, rien modifié', /FICTIFS|secret/.test(c.e || '') && C.ecritures.length === 0 && C.triggers().length === 0, c.e && c.e.slice(0, 60));
/* D : feuille de production */
const D = monde({ sheet: '1b0kuCk6kuNi26hMJq5Q5R6-mKFeXEexfm2P9SryJ-eg' }); const d = essai(D);
t('D : la feuille de PRODUCTION non neutralisée → refus, rien créé', /SHEET_ID_/.test(d.e || '') && D.ecritures.length === 0 && D.triggers().length === 0, d.e && d.e.slice(0, 60));
/* E : déjà isolé → réutilisé */
const E = monde({ props: { ft_backup_drive_folder_id: 'test1' }, dossiers: [{ id: 'test1', nom: 'FT-TEST-P1-RECUP-2026-11-04' }] }); const e = essai(E);
t('E : un dossier « FT-TEST-P1… » déjà désigné est RÉUTILISÉ (aucun dossier créé)', !e.e && E.ecritures.length === 0 && E.props.ft_backup_drive_folder_id === 'test1' && e.r && e.r.dossierCree === false, e.e);
/* F : propriété absente */
const F = monde({}); const f = essai(F);
t('F : propriété absente → dossier de test créé et désigné', !f.e && /^FT-TEST-P1/.test((F.dossiers[F.props.ft_backup_drive_folder_id] || {}).nom || '') && F.ecritures.length === 1, f.e);
console.log('\n' + ok + ' OK / ' + ko + ' ROUGE'); process.exit(ko ? 1 : 0);
