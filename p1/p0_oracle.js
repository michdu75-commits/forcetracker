#!/usr/bin/env node
/* ORACLE ET CAS DES TÉMOINS D'ÉCRASEMENT DES SÉANCES (P0 — « GO TEST P0 » de Michel, 11/11/2026). UNE SEULE SOURCE pour les trois joueurs (R2 : une information, un propriétaire) :
     · tools/chaos/ecrasement_sessions.js — en local, le VRAI Code.js dans le harnais en mémoire (13 cas + tirage à graine fixe) ;
     · p1/p0_ecrasement.js — par HTTP contre le projet Apps Script de TEST (comptes fictifs) ou contre le serveur local à vrais processus ;
     · l'auto-test ci-dessous (`node p1/p0_oracle.js`) : l'oracle SAIT réussir et SAIT échouer, sans aucun serveur.
   ⛔ Ce fichier ne contient AUCUNE copie de la règle proposée (F2) : seulement (1) la règle ACTUELLE de Code.js (refus si vide ou < 60 % d'une base ≥ 30, sinon remplacement), transcrite pour PRÉDIRE ce que
   le serveur actuel doit faire, et (2) les INVARIANTS du PDF « P0 » (§ 4), qui ne dépendent d'aucune implémentation :
     I1 existantes : après tout envoi, chaque séance présente en base y est encore, à TOL (2) près (comptes ≥ 30 séances) ;
     I2 nouvelles  : chaque séance de l'envoi est en base après ;
     I3 rejeu      : le même envoi rejoué ne change rien (mesuré par les joueurs) ;
     I4 inchangé   : un envoi qui contient toute la base à TOL près, ou un compte < 30 séances, est enregistré tel quel ; un envoi vide est refusé (la base est gardée).
   Sur le code ACTUEL, certains cas doivent donc être ROUGES (invariant violé) — c'est la preuve que le témoin sait échouer ; après une éventuelle correction (GO CODE), les mêmes cas doivent passer VERTS. */
'use strict';
const SEUIL = 30, PART = 0.6, TOL = 2;

const canon = (v) => Array.isArray(v) ? v.map(canon) : (v && typeof v === 'object') ? Object.keys(v).sort().reduce((o, k) => { if (k !== 'synced') o[k] = canon(v[k]); return o; }, {}) : v;
/** identité d'une séance : `id` ; sans `id`, copie identique hors `synced` (comme le client) */
const cle = (s) => (s && s.id != null) ? 'id:' + String(s.id) : 'fp:' + JSON.stringify(canon(s));
const compte = (liste) => { const m = new Map(); (liste || []).forEach((s) => m.set(cle(s), (m.get(cle(s)) || 0) + 1)); return m; };
const memes = (a, b) => { const x = compte(a), y = compte(b); if (x.size !== y.size) return false; for (const [k, n] of x) if (y.get(k) !== n) return false; return true; };

const pad = (i, p) => (p || 's') + String(i).padStart(4, '0');
const seance = (i, p) => ({ id: pad(i, p), date: new Date(Date.UTC(2026, 7, 1) + i * 86400000).toISOString().slice(0, 10), ts: Date.UTC(2026, 7, 1) + i * 86400000, vol: 500 + i, synced: true });
const seances = (a, b, p) => { const l = []; for (let i = a; i <= b; i++) l.push(seance(i, p)); return l; };
const sansId = (i) => ({ date: new Date(Date.UTC(2026, 7, 1) + i * 86400000).toISOString().slice(0, 10), vol: 500 + i, exs: [{ name: 'Squat (sans id)', sets: [{ kg: 100 + i, reps: 5 }] }], synced: true });

/** La règle ACTUELLE de Code.js (handleSaveProfile_, garde-fou « sessions »), transcrite pour PRÉDIRE le résultat. `envoi === undefined` = champ absent. */
function predireActuel(base, envoi) {
  if (envoi === undefined) return { decision: 'intact', apres: base };
  const vide = envoi.length === 0 && base.length > 0;
  const retreci = base.length >= SEUIL && envoi.length < base.length * PART;
  return (vide || retreci) ? { decision: 'refusé', apres: base } : { decision: 'accepté', apres: envoi };
}
/** Les invariants I1, I2, I4 pour un envoi donné (I3, le rejeu, est mesuré à part par les joueurs). */
function juger(base, envoi, apres) {
  if (envoi === undefined) return { perdues: 0, nouvellesPerdues: 0, i1: true, i2: true, i4: memes(apres, base), absentes: 0 };
  const res = compte(apres), env = compte(envoi);
  const perdues = base.filter((s) => !res.has(cle(s))).length;
  const nouvellesPerdues = envoi.filter((s) => !res.has(cle(s))).length;
  const absentes = base.filter((s) => !env.has(cle(s))).length;
  const i1 = base.length < SEUIL || perdues <= TOL;
  const i2 = envoi.length === 0 || nouvellesPerdues === 0;
  const i4 = (envoi.length > 0 && (base.length < SEUIL || absentes <= TOL)) ? memes(apres, envoi) : (envoi.length === 0 && base.length > 0) ? memes(apres, base) : true;
  return { perdues, nouvellesPerdues, i1, i2, i4, absentes };
}

/** Les 13 cas du PDF « P0 » § 4 (le 12ᵉ, la vraie concurrence, ne se joue que par HTTP). `rouge` = violation attendue AUJOURD'HUI. */
const CAS = [
  { id: 'C01', nom: 'Croissance normale (40 → 41)', rouge: false, faire: () => { const b = seances(1, 40); return { base: b, envoi: b.concat([seance(1, 'n')]) }; } },
  { id: 'C02a', nom: '50 envoyées sur 70', rouge: true, faire: () => { const b = seances(1, 70); return { base: b, envoi: b.slice(-50) }; } },
  { id: 'C02b', nom: '50 envoyées sur 83', rouge: true, faire: () => { const b = seances(1, 83); return { base: b, envoi: b.slice(-50) }; } },
  { id: 'C03', nom: '50 envoyées sur 84 (refus actuel)', rouge: false, faire: () => { const b = seances(1, 84); return { base: b, envoi: b.slice(-50) }; } },
  { id: 'C04', nom: '50 + 1 neuve sur 79 (le compte de Michel : 73 + 6)', rouge: true, faire: () => { const b = seances(1, 79); return { base: b, envoi: b.slice(-50).concat([seance(1, 'n')]) }; } },
  { id: 'C05', nom: '50 + 1 neuve sur 86 (le refus fait perdre la neuve)', rouge: true, faire: () => { const b = seances(1, 86); return { base: b, envoi: b.slice(-50).concat([seance(1, 'n')]) }; } },
  { id: 'C06a', nom: '1 suppression ordinaire (60 → 59)', rouge: false, faire: () => { const b = seances(1, 60); return { base: b, envoi: b.slice(1) }; } },
  { id: 'C06b', nom: '2 suppressions ordinaires (60 → 58)', rouge: false, faire: () => { const b = seances(1, 60); return { base: b, envoi: b.slice(2) }; } },
  { id: 'C07', nom: '3 séances retirées d\'un coup (60 → 57) — changement voulu, à confirmer', rouge: true, faire: () => { const b = seances(1, 60); return { base: b, envoi: b.slice(3) }; } },
  { id: 'C08a', nom: 'Envoi vide (60 → 0)', rouge: false, faire: () => ({ base: seances(1, 60), envoi: [] }) },
  { id: 'C08b', nom: 'Champ « sessions » absent', rouge: false, faire: () => ({ base: seances(1, 60), envoi: undefined }) },
  { id: 'C09', nom: 'Petit compte (20 → 10)', rouge: false, faire: () => { const b = seances(1, 20); return { base: b, envoi: b.slice(-10) }; } },
  { id: 'C10', nom: 'Écritures croisées de même taille (3 neuves de chaque appareil)', rouge: true, faire: () => { const c = seances(1, 60); return { base: c.concat(seances(1, 3, 'a')), envoi: c.concat(seances(1, 3, 'b')) }; } },
  { id: 'C11', nom: 'Séances sans identifiant, copies ne différant que par « synced »', rouge: false, faire: () => { const b = seances(1, 50).concat(Array.from({ length: 10 }, (_, i) => sansId(i + 1))); return { base: b, envoi: b.map((s) => Object.assign({}, s, { synced: false })) }; } },
  { id: 'C13', nom: 'Rejeu du même envoi (79 → 50 + 1 neuve, deux fois)', rouge: true, rejeu: true, faire: () => { const b = seances(1, 79); return { base: b, envoi: b.slice(-50).concat([seance(1, 'n')]) }; } },
];

/* tirage à graine fixe, mêmes familles de cas que le modèle du PDF (tailles de base, envois partiels, séances neuves, séances sans identifiant) */
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function tirage(rnd) {
  const pick = (l) => l[Math.floor(rnd() * l.length)];
  const nb = pick([0, 5, 20, 29, 30, 31, 40, 52, 60, 63, 79, 83, 84, 85, 86, 90, 120]), sans = Math.min(nb, pick([0, 0, 0, 5, 12]));
  const base = seances(1, nb - sans).concat(Array.from({ length: sans }, (_, i) => sansId(i + 1)));
  const m = Math.max(0, Math.min(pick([0, 1, 2, 3, 10, 30, 50, base.length, base.length - 1, base.length - 3, base.length - 6]), base.length));
  const copie = base.slice(); for (let i = copie.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [copie[i], copie[j]] = [copie[j], copie[i]]; }
  const nouv = pick([0, 0, 1, 2, 3, 4]), envoi = copie.slice(0, m).concat(seances(1, nouv, 'n'));
  for (let i = envoi.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [envoi[i], envoi[j]] = [envoi[j], envoi[i]]; }
  return { base, envoi };
}

module.exports = { SEUIL, PART, TOL, canon, cle, memes, seance, seances, sansId, predireActuel, juger, CAS, mulberry32, tirage };

/* ── AUTO-TEST : l'oracle sait RÉUSSIR et sait ÉCHOUER, sans serveur et sans la correction proposée ── */
if (require.main === module) {
  let ok = 0, rouge = 0; const t = (n, c, d) => { c ? ok++ : rouge++; console.log((c ? '   OK  ' : '❌ ROUGE ') + n + (d !== undefined ? '   >> ' + JSON.stringify(d) : '')); };
  const b = seances(1, 70), e = b.slice(-50), n1 = seance(1, 'n');
  const union = b.concat([n1]);
  t('un « après » qui garde tout et ajoute la neuve : I1, I2 tenus', (() => { const j = juger(b, e.concat([n1]), union); return j.i1 && j.i2 && j.perdues === 0; })());
  t('un « après » = l\'envoi (20 anciennes perdues) : I1 VIOLÉ (20 perdues)', (() => { const j = juger(b, e, e); return !j.i1 && j.perdues === 20; })());
  t('un refus qui garde la base mais perd la neuve : I2 VIOLÉ', (() => { const j = juger(seances(1, 86), seances(1, 86).slice(-50).concat([n1]), seances(1, 86)); return !j.i2 && j.nouvellesPerdues === 1; })());
  t('un envoi vide qui efface la base : I4 VIOLÉ ; refusé (base gardée) : I4 tenu', !juger(b, [], []).i4 && juger(b, [], b).i4);
  t('un envoi qui contient toute la base mais est « corrigé » par le serveur : I4 VIOLÉ', !juger(b, b, b.slice(0, 60)).i4);
  t('une suppression ordinaire (1) acceptée telle quelle : I1, I4 tenus', (() => { const j = juger(b, b.slice(1), b.slice(1)); return j.i1 && j.i4 && j.perdues === 1; })());
  t('un petit compte (< 30) remplacé tel quel : I1 non exigé, I4 tenu', (() => { const p = seances(1, 20), j = juger(p, p.slice(-10), p.slice(-10)); return j.i1 && j.i4; })());
  t('l\'identité des séances sans identifiant ignore « synced » (pas de fausse absence) et distingue le contenu', memes([sansId(1)], [Object.assign({}, sansId(1), { synced: false })]) && !memes([sansId(1)], [sansId(2)]));
  t('la règle ACTUELLE transcrite : 50 sur 83 accepté, 50 sur 84 refusé, 51 sur 86 refusé, vide refusé, champ absent intact', predireActuel(seances(1, 83), seances(1, 50)).decision === 'accepté' && predireActuel(seances(1, 84), seances(1, 50)).decision === 'refusé' && predireActuel(seances(1, 86), seances(1, 51)).decision === 'refusé' && predireActuel(seances(1, 60), []).decision === 'refusé' && predireActuel(seances(1, 60), undefined).decision === 'intact');
  /* les 15 cas sont rouges / verts comme annoncé quand le serveur fait ce que fait le code ACTUEL ; et TOUS verts quand le serveur « garde tout et ajoute » (un serveur fictif, SANS rapport avec F2 : une simple union) */
  const rougesAuj = CAS.filter((c) => { const { base, envoi } = c.faire(); const j = juger(base, envoi, predireActuel(base, envoi).apres); return !(j.i1 && j.i2 && j.i4); }).map((c) => c.id);
  t('sur la règle actuelle transcrite : rouges = ' + CAS.filter((c) => c.rouge).map((c) => c.id).join(', '), JSON.stringify(rougesAuj) === JSON.stringify(CAS.filter((c) => c.rouge).map((c) => c.id)), rougesAuj);
  const unionServeur = (base, envoi) => { if (envoi === undefined) return base; if (envoi.length === 0) return base; const res = compte(envoi), plus = base.filter((s) => !res.has(cle(s))); return (base.length < SEUIL || plus.length <= TOL) ? envoi : envoi.concat(plus); };
  const rougesUnion = CAS.filter((c) => { const { base, envoi } = c.faire(); const j = juger(base, envoi, unionServeur(base, envoi)); return !(j.i1 && j.i2 && j.i4); }).map((c) => c.id);
  t('sur un serveur fictif « tout garder + ajouter l\'envoi » (simple union, aucun lien avec F2) : AUCUN cas rouge — les témoins SAVENT passer au vert', rougesUnion.length === 0, rougesUnion);
  const rnd = mulberry32(20261110), cas = Array.from({ length: 2000 }, () => tirage(rnd));
  const nAct = cas.filter(({ base, envoi }) => { const j = juger(base, envoi, predireActuel(base, envoi).apres); return !(j.i1 && j.i2 && j.i4); }).length;
  const nUn = cas.filter(({ base, envoi }) => { const j = juger(base, envoi, unionServeur(base, envoi)); return !(j.i1 && j.i2 && j.i4); }).length;
  t('tirage à graine fixe (2 000 cas) : la règle actuelle viole des invariants (' + nAct + ' cas), le serveur « union » aucun (' + nUn + ')', nAct > 0 && nUn === 0, { actuelle: nAct, union: nUn });
  console.log('\n──── ' + ok + ' OK / ' + rouge + ' ROUGE ────'); process.exit(rouge ? 1 : 0);
}
