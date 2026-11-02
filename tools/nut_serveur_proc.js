'use strict';
/* PROCESSUS SERVEUR DU BANC DE CONCURRENCE (NUT-SYNC-01 FINAL, 01/11/2026).
   Le VRAI Code.js (par `serveur()` de tests/parcours/nut_secu_p1.js) dans un PROCESSUS à lui, sur des propriétés PARTAGÉES (un fichier par propriété, écriture atomique par renommage)
   avec un VRAI verrou entre processus (`mkdir` est atomique) — c'est ce qui rend une concurrence réelle : deux de ces processus, lancés ensemble, lisent et écrivent le même compte.
   Usage : node tools/nut_serveur_proc.js <dossier-de-stockage>   — dialogue par messages IPC (fork) :
     {id, op:'post', corps, barriere?}  → {id, t}            un `doPost` ; `barriere:N` = après CHAQUE lecture du compte, attendre (≤ 400 ms) que N processus aient fait la même lecture avant de continuer
                                                              (sans verrou, tous écrivent alors à partir du MÊME état périmé — la perte de mise à jour est quasi certaine ; avec verrou, un seul lit à la fois)
     {id, op:'get',  q}      → {id, t}            un `doGet`
     {id, op:'init', email, code, profile, extra}  → {id, ok}  crée un compte (comme `compte()` mais dans le stockage partagé)
     {id, op:'lire', email}  → {id, compte}       le compte tel que stocké
     {id, op:'regler', nom, valeur} → {id, ok}    règle une variable globale de Code.js (ex. NUT_VERROU_MS_)
   ⛔ Aucun réseau, aucune donnée réelle : adresses example.test. */
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const P1 = require('../tests/parcours/nut_secu_p1.js');
const dort = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };
const fichier = (k) => path.join(dir, 'p_' + encodeURIComponent(k));
const sp = {
  getProperty: (k) => {
    let v = null; try { v = fs.readFileSync(fichier(k), 'utf8'); } catch (e) { v = null; }
    if (v !== null && /^u_/.test(k) && global.__barriere) {            // BARRIÈRE : « j'ai lu le compte » — on attend les autres (≤ 400 ms), À CHAQUE LECTURE (la 2ᵉ est celle sur laquelle la décision est prise)
      const n = (global.__lectures = (global.__lectures || 0) + 1);
      fs.writeFileSync(path.join(dir, 'lu_' + n + '_' + process.pid), '1');
      const t0 = Date.now(), motif = new RegExp('^lu_' + n + '_');
      while (Date.now() - t0 < 400) { if (fs.readdirSync(dir).filter((f) => motif.test(f)).length >= global.__barriere) break; dort(5); }
    }
    return v;
  },
  setProperty: (k, v) => { const tmp = fichier(k) + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, String(v)); fs.renameSync(tmp, fichier(k)); },
  deleteProperty: (k) => { try { fs.unlinkSync(fichier(k)); } catch (e) { /* absent */ } },
  getProperties: () => { const o = {}; fs.readdirSync(dir).filter((f) => /^p_/.test(f) && !/\.tmp$/.test(f)).forEach((f) => { o[decodeURIComponent(f.slice(2))] = fs.readFileSync(path.join(dir, f), 'utf8'); }); return o; },
  getKeys: () => Object.keys(sp.getProperties()),
};
const verrouDir = path.join(dir, 'verrou');
const LockService = { getScriptLock: () => {
  let tenu = false;
  return {
    tryLock: (ms) => {
      if (process.env.NUT_SANS_VERROU === '1') { tenu = true; return true; }   // AUTO-CONTRÔLE du banc : un verrou qui ne verrouille rien — la perte de mise à jour DOIT alors apparaître
      const t0 = Date.now();
      for (;;) {
        try { fs.mkdirSync(verrouDir); tenu = true; return true; }
        catch (e) {
          try { if (Date.now() - fs.statSync(verrouDir).mtimeMs > 15000) fs.rmdirSync(verrouDir); } catch (x) { /* déjà libéré */ }   // verrou orphelin (processus mort) : périmé après 15 s
        }
        if (Date.now() - t0 >= ms) return false;
        dort(5);
      }
    },
    waitLock(ms) { if (!this.tryLock(ms)) throw new Error('Lock timeout'); },
    releaseLock: () => { if (tenu) { try { fs.rmdirSync(verrouDir); } catch (e) { /* déjà libéré */ } tenu = false; } },
    hasLock: () => tenu,
  };
} };
const X = P1.serveur({ sp, LockService });
process.on('message', (m) => {
  try {
    if (m.op === 'post') { global.__barriere = m.barriere || 0; global.__lectures = 0; const r = X.post(m.corps); global.__barriere = 0; process.send({ id: m.id, t: r.t }); }
    else if (m.op === 'get') { const r = X.get(m.q); process.send({ id: m.id, t: r.t }); }
    else if (m.op === 'init') {
      X.ctx.saveUserData_(m.email, Object.assign({ email: m.email, profile: Object.assign({ name: 'N' }, m.profile || {}), prs: {}, sessions: [] }, m.extra || {}));
      if (m.code) { const salt = require('crypto').randomBytes(8).toString('hex'); sp.setProperty('auth_' + m.email, salt + '$' + X.ctx._sha256hex_(salt + '|' + m.code)); }
      process.send({ id: m.id, ok: true });
    }
    else if (m.op === 'lire') process.send({ id: m.id, compte: X.ctx.loadUserData_(m.email) });
    else if (m.op === 'regler') { X.ctx[m.nom] = m.valeur; process.send({ id: m.id, ok: true }); }
    else process.send({ id: m.id, erreur: 'op inconnue' });
  } catch (e) { process.send({ id: m.id, erreur: String(e && e.stack || e) }); }
});
process.send({ pret: true });
