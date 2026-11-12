/* ═════════════════════════════════════════════════════════════════════════════════════════════
   🧷 F2-A′ — les séances se FUSIONNENT par identifiant : plus aucune séance supprimée en silence (12/11/2026, décision de Michel)
   Bloc : B-F2A. Banc : tools/banc_f2_seances_union.js · contrôle négatif : tools/mut_f2_seances_union.py
   « Perdre encore 1 ou 2 séances n'est pas acceptable » : TOLÉRANCE ZÉRO. Le serveur garde TOUTES ses séances, ajoute celles de l'envoi, ne duplique pas.

   CONDUIT : le VRAI Code.js exécuté en local (vm Node, `serveur()` de nut_secu_p1.js) par sa vraie porte `doPost` (saveProfile) et `doGet` (loadProfile) ;
     pour la concurrence, DE VRAIS PROCESSUS (`tools/nut_serveur_proc.js`) sur des propriétés PARTAGÉES et un VRAI verrou entre processus (`mkdir`).
     Le « serveur d'AVANT » (master fd8bf703, ft-v1266) est RECONSTRUIT depuis le Code.js courant en remettant l'ancien bloc à sa place ; la reconstruction est comparée octet pour octet
     à `git show fd8bf703:Code.js` quand git est disponible (sinon dite « non vérifiable ici », jamais comptée comme un succès).
   OBSERVE : la liste des séances du compte telle que stockée (après décompression réelle), chaque réponse brute, le journal `Logger`, la télémétrie `HIST_SHRINK`, les octets du compte
     avant/après une panne d'écriture, les appels au verrou (pris / rendus).
   SIMULÉ : les services Google (propriétés en mémoire ou en fichiers, compression réelle zlib, Drive en mémoire), le quota de stockage (un plafond choisi par le banc : ce n'est PAS le plafond d'Apps Script).
   NE COUVRE PAS : le vrai déploiement Apps Script (son LockService réel, ses délais, ses vraies Script Properties et leur plafond de 512 Ko), le vrai Google, l'iPhone, le CLIENT (log.js n'est pas modifié :
     aucune troncature n'est rejouée ici — seulement ce que le serveur reçoit), le miroir Supabase (SR-b de tools/chaos/banc.js : il accepte toujours 500 → 50), les suppressions voulues (non propagées : F2-B).
   ⛔ DOCUMENTÉ, PAS GUÉRI : (1) une suppression volontaire ne se propage plus au serveur (section D) ; (2) le dernier arrivé gagne encore sur un MÊME identifiant modifié : l'ENSEMBLE des identifiants ne dépend pas
     de l'ordre des appareils, la VERSION d'une séance modifiée, si (section B) ; (3) une séance SANS identifiant modifiée reste en deux versions (un doublon vaut mieux qu'une perte) ; (4) une base ne fait que croître.
   ⛔⛔ DONNÉES INVENTÉES SEULEMENT : adresses du domaine réservé example.test (RFC 2606), séances « Développé couché » de chiffres fabriqués.
   ═════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { fork, execFileSync } = require('child_process');
const RACINE = path.join(__dirname, '..', '..');
const P1 = require('./nut_secu_p1.js');
const J = JSON.stringify;
const copie = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const SECT = process.env.F2A_SEULEMENT || '';
const voulu = (x) => !SECT || SECT.split(',').indexOf(x) >= 0;
const info = (m) => console.log('   INFO ' + m);

/* ───────────── Données inventées : la forme réelle d'une séance (log.js `finishWorkout`) ───────────── */
const JOUR = 86400000, T0 = Date.UTC(2026, 7, 1);
const dateDe = (i) => new Date(T0 + i * JOUR).toISOString().slice(0, 10);
const seance = (i, p, o) => Object.assign({ id: (p || 's') + String(i).padStart(4, '0'), date: dateDe(i), ts: T0 + i * JOUR, startHour: 18, duration: 3600, volume: 500 + i, uniConv: 1, progLabel: 'Push',
  exs: [{ name: 'Développé couché', sets: [{ kg: 60 + (i % 20), reps: 8, done: true, type: 'normal' }] }], synced: true }, o || {});
const seances = (a, b, p) => { const l = []; for (let i = a; i <= b; i++) l.push(seance(i, p)); return l; };
const sansId = (i, o) => { const s = seance(i, 'x', o); delete s.id; delete s.ts; return s; };           // très ancienne séance : ni `id` ni `ts`
const seanceRiche = (i, rnd) => { const exs = []; for (let e = 0; e < 6; e++) { const sets = []; for (let k = 0; k < 4; k++) sets.push({ kg: Math.round((20 + rnd() * 100) * 2) / 2, reps: 5 + Math.floor(rnd() * 8), done: true, type: 'normal', rm1: Math.round(rnd() * 1500) / 10 }); exs.push({ name: ['Squat', 'Développé couché', 'Soulevé de terre', 'Tractions', 'Rowing barre', 'Dips', 'Curl', 'Extensions triceps'][(i + e) % 8], sets, note: '' }); }
  return { id: 1700000000000 + i * 86400000 + Math.floor(rnd() * 1000), date: dateDe(i), ts: T0 + i * JOUR, exs, volume: 3000 + i, uniConv: 1, synced: true, startHour: 18, duration: 4200, progLabel: 'Push A', calories: 300 + (i % 90) }; };   // une séance « réaliste » : 6 exercices × 4 séries de chiffres variés (le pire cas pour la taille et le temps)
const modifie = (s, note) => Object.assign(copie(s), { volume: (s.volume || 0) + 1, note: note || 'corrigée' });
const idsDe = (l) => l.filter((s) => s && typeof s === 'object').map((s) => s.id);

/* ───────────── LE CONTRAT, écrit À PART du code et par une AUTRE voie (boucles naïves, pas de tables) : c'est ce que le serveur doit faire ───────────── */
const canon = (v, sansSynced) => {
  if (Array.isArray(v)) return '[' + v.map((x) => canon(x, sansSynced)).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).filter((k) => !(sansSynced && k === 'synced')).sort().map((k) => J(k) + ':' + canon(v[k], sansSynced)).join(',') + '}';
  return String(J(v));
};
const valide = (s) => !!s && typeof s === 'object' && !Array.isArray(s);
const idOk = (id) => (typeof id === 'string' && id.trim() !== '') || (typeof id === 'number' && isFinite(id));
const ident = (s) => (idOk(s.id) ? 'id:' + String(s.id) : 'fp:' + canon(s, true));
/** La liste EXACTE (ordre compris) que le contrat prescrit : la base intacte (remplacements en place) + les séances inconnues de l'envoi, ajoutées à la fin. */
function attendu(base, envoi) {
  const res = base.slice(), pris = new Set();
  (Array.isArray(envoi) ? envoi : []).forEach((s) => {
    if (!valide(s)) return;
    const k = ident(s);
    if (k.indexOf('id:') === 0) {
      const i = res.findIndex((r) => valide(r) && ident(r) === k);
      if (i < 0) res.push(s); else if (J(res[i]) !== J(s)) res[i] = s;
    } else {
      const i = res.findIndex((r, n) => n < base.length && !pris.has(n) && valide(r) && ident(r) === k);
      if (i < 0) res.push(s); else { pris.add(i); if (J(res[i]) !== J(s)) res[i] = s; }
    }
  });
  return res;
}
/** Les INVARIANTS, indépendants de toute implémentation. Rend la liste des invariants violés ([] = tout tenu).
    N jamais moins de séances · I1 chaque séance de la base est toujours là · I2 chaque séance de l'envoi est là · I3 la version de l'envoi l'emporte sur un même identifiant
    · I4 aucun identifiant n'est dupliqué au-delà de ce que la base avait · I5 l'ordre de la base est conservé · REF identique au contrat ci-dessus. */
function verifier(base, envoi, apres) {
  const ko = [], ev = (Array.isArray(envoi) ? envoi : []).filter(valide);
  if (apres.length < base.length) ko.push('N');
  const compter = (l) => { const m = new Map(); l.filter(valide).forEach((s) => m.set(ident(s), (m.get(ident(s)) || 0) + 1)); return m; };
  const A = compter(apres), B = compter(base), E = compter(ev);
  B.forEach((n, k) => { if ((A.get(k) || 0) < n) ko.push('I1'); });
  E.forEach((n, k) => { if ((A.get(k) || 0) < (k.indexOf('fp:') === 0 ? n : 1)) ko.push('I2'); });
  const derniere = new Map(); ev.forEach((s) => { if (idOk(s.id)) derniere.set(ident(s), s); });
  derniere.forEach((s, k) => { if (!apres.some((a) => valide(a) && ident(a) === k && J(a) === J(s))) ko.push('I3'); });
  A.forEach((n, k) => { if (k.indexOf('id:') === 0 && n > Math.max(B.get(k) || 0, 1)) ko.push('I4'); });
  for (let i = 0; i < base.length && i < apres.length; i++) {
    const ok = valide(base[i]) ? (valide(apres[i]) && ident(apres[i]) === ident(base[i])) : J(apres[i]) === J(base[i]);
    if (!ok) { ko.push('I5'); break; }
  }
  if (J(apres) !== J(attendu(base, envoi))) ko.push('REF');
  return Array.from(new Set(ko));
}

/* ───────────── Le serveur : le vrai Code.js, et le serveur d'AVANT reconstruit ───────────── */
const SHA_ANCIEN = 'fd8bf7039fff0aae4564bb585dd5e1f13c84da4e';
const BLOC_ANCIEN = `    if (body.sessions !== undefined) {
      const inSess = body.sessions || [], exSess = existing.sessions || [];
      // ⚠️ GARDE-FOU ÉLARGI le 02/08. Il ne refusait qu'un envoi VIDE — donc un envoi de 50
      // séances remplaçait sans broncher un historique de 500. Chemin réel : le stockage du
      // téléphone sature, l'app tronque l'historique local à 50, et la sauvegarde suivante
      // écrasait le cloud. On refuse maintenant tout RÉTRÉCISSEMENT BRUTAL (règle d'or n°1).
      // Seuils : on ne juge que si le cloud a déjà un vrai historique (>= 30 séances), et on
      // laisse passer les suppressions ordinaires (jusqu'à 40 % en une fois).
      const SEUIL_MINI = 30, PART_MINI = 0.6;
      const vide      = inSess.length === 0 && exSess.length > 0;
      const retreci   = exSess.length >= SEUIL_MINI && inSess.length < exSess.length * PART_MINI;
      if (vide || retreci) {
        Logger.log('[FT GARDE-FOU sessions] refusé : ' + inSess.length + ' reçues contre ' +
                   exSess.length + ' en base — historique conservé');
        _logHistShrink_(email, inSess.length, exSess.length);
      } else { existing.sessions = inSess; }
    }
`;
const CODE_NEUF = fs.readFileSync(path.join(RACINE, 'Code.js'), 'utf8');
const unique = (src, motif) => src.split(motif).length === 2;
/** Le Code.js d'AVANT F2-A′ : le bloc « sessions » d'origine remis, les fonctions de fusion retirées. `null` si les repères ont bougé (le banc le dit, il ne devine pas). */
function reconstruireAncien(neuf) {
  const D = '    if (body.sessions !== undefined) {\n', F = '    if (body.prs !== undefined) {\n', H0 = '/* 🧷 F2-A′ (12/11/2026', H1 = '/* 🙈 D-141 MINIMAL';
  if (![D, F, H0, H1].every((m) => unique(neuf, m))) return null;
  const a = neuf.indexOf(D), b = neuf.indexOf(F);
  if (!(a < b)) return null;
  const s = neuf.slice(0, a) + BLOC_ANCIEN + neuf.slice(b), h0 = s.indexOf(H0), h1 = s.indexOf(H1);
  return (h0 >= 0 && h0 < h1) ? s.slice(0, h0) + s.slice(h1) : null;
}
const ANCIEN_BRUT = reconstruireAncien(CODE_NEUF);
const ANCIEN = ANCIEN_BRUT ? P1.preparerCode(ANCIEN_BRUT) : null;
const ancienDeGit = () => { try { return execFileSync('git', ['show', SHA_ANCIEN + ':Code.js'], { cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }); } catch (e) { return null; } };

let _n = 0;
const mailDe = (tag) => 'f2a-' + (tag || 'x') + '-' + (++_n) + '@example.test';
const graine = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const compteAvec = (X, mail, sessions, extra) => X.ctx.saveUserData_(mail, Object.assign({ email: mail, profile: { name: 'N' }, prs: {}, sessions: copie(sessions) }, extra || {}));
const envoyer = (X, mail, sessions, champs) => X.envoi(mail, Object.assign(sessions === undefined ? {} : { sessions: copie(sessions) }, champs || {}));
const lire = (X, mail) => (X.lireCompte(mail) || {}).sessions;
/** `loadProfile` n'est lisible qu'avec le code perso du compte (lecture stricte, 07/08/2026) : on en pose un, comme `compte()` de nut_secu_p1.js. */
const CODE = '4242';
const poserCode = (X, mail) => { const sel = 'f2asel01'; X.props['auth_' + mail] = sel + '$' + X.ctx._sha256hex_(sel + '|' + CODE); };
const lireProfil = (X, mail) => X.get({ action: 'loadProfile', email: mail, authCode: CODE });
/** Un compte amorcé avec `base`, un envoi, la lecture, puis le MÊME envoi rejoué : { mail, r, apres, rejeu } */
function essai(X, base, envoi, tag) {
  const mail = mailDe(tag);
  compteAvec(X, mail, base);
  const r = envoyer(X, mail, envoi), apres = lire(X, mail);
  envoyer(X, mail, envoi);
  return { mail, r, apres, rejeu: J(lire(X, mail)) === J(apres) };
}
const nbPerdues = (base, apres) => { const A = new Set(apres.filter(valide).map(ident)); return base.filter(valide).filter((s) => !A.has(ident(s))).length; };

/* ═══════════════════════════════ Z — le banc sait ROUGIR : l'oracle et les invariants sont éprouvés sans serveur ═══════════════════════════════ */
function sectionZ(t) {
  console.log('\n── Z · l\'oracle sait réussir ET échouer (aucun serveur) ──');
  const b = seances(1, 5), e = b.slice(2).concat([seance(1, 'n')]), bon = attendu(b, e);
  t('F2A-Z01 · un résultat correct ne viole aucun invariant', verifier(b, e, bon).length === 0, verifier(b, e, bon));
  t('F2A-Z02 · une séance de la base disparue : I1 et REF violés ; deux disparues (moins de séances qu\'avant) : N aussi', verifier(b, e, bon.slice(1)).indexOf('I1') >= 0 && verifier(b, e, bon.slice(1)).indexOf('REF') >= 0 && verifier(b, e, bon.slice(2)).indexOf('N') >= 0);
  t('F2A-Z03 · la séance neuve de l\'envoi disparue : I2 violé', verifier(b, e, bon.slice(0, -1)).indexOf('I2') >= 0);
  t('F2A-Z04 · l\'envoi recopié tel quel (remplacement) : I1 violé', verifier(b, e, copie(e)).indexOf('I1') >= 0);
  t('F2A-Z05 · un identifiant dupliqué : I4 violé', verifier(b, e, bon.concat([copie(bon[0])])).indexOf('I4') >= 0);
  t('F2A-Z06 · l\'ordre de la base changé : I5 violé', verifier(b, e, [bon[1], bon[0]].concat(bon.slice(2))).indexOf('I5') >= 0);
  const m = [modifie(b[1])], bonM = attendu(b, m);
  t('F2A-Z07 · une séance modifiée : la version de l\'envoi doit l\'emporter (I3) — la version de la base conservée viole I3', verifier(b, m, bonM).length === 0 && verifier(b, m, b).indexOf('I3') >= 0);
  t('F2A-Z08 · le contrat : base intacte + inconnues à la fin, remplacement en place, entrées invalides ignorées, vide sans effet',
    J(attendu([seance(1), seance(2)], [seance(3), null, 42, modifie(seance(1))])) === J([modifie(seance(1)), seance(2), seance(3)]) && J(attendu(b, [])) === J(b) && J(attendu(b, undefined)) === J(b));
  t('F2A-Z09 · sans identifiant : une copie identique (hors « synced ») est la même séance, une séance modifiée en est une autre, une copie de plus s\'ajoute (multi-ensemble)',
    attendu([sansId(1)], [sansId(1, { synced: false })]).length === 1 && attendu([sansId(1)], [sansId(1), sansId(1)]).length === 2 && attendu([sansId(1)], [modifie(sansId(1))]).length === 2);
}

/* ═══════════════════════════════ A — P0 EN TOLÉRANCE ZÉRO, sur le vrai Code.js ═══════════════════════════════ */
const CAS = [
  { id: 'C01', nom: 'croissance normale 40 → 41', base: () => seances(1, 40), envoi: () => seances(1, 40).concat([seance(1, 'n')]), n: 41 },
  { id: 'C02a', nom: '50 envoyées sur 70 : les 70 restent (avant : 20 effacées)', base: () => seances(1, 70), envoi: () => seances(1, 70).slice(-50), n: 70 },
  { id: 'C02b', nom: '50 envoyées sur 83 : les 83 restent (avant : 33 effacées)', base: () => seances(1, 83), envoi: () => seances(1, 83).slice(-50), n: 83 },
  { id: 'C03', nom: '50 envoyées sur 84 : les 84 restent', base: () => seances(1, 84), envoi: () => seances(1, 84).slice(-50), n: 84 },
  { id: 'C04', nom: '50 + 1 neuve sur 79 (le compte de Michel : 73 + 6) : 80 (avant : 51, 29 effacées)', base: () => seances(1, 79), envoi: () => seances(1, 79).slice(-50).concat([seance(1, 'n')]), n: 80 },
  { id: 'C05', nom: '50 + 1 neuve sur 86 : 87 — la neuve est AJOUTÉE (avant : refus, la neuve perdue)', base: () => seances(1, 86), envoi: () => seances(1, 86).slice(-50).concat([seance(1, 'n')]), n: 87 },
  { id: 'C06a', nom: '1 suppression voulue (60 → 59) : NON propagée, les 60 restent — DOCUMENTÉ (F2-B)', base: () => seances(1, 60), envoi: () => seances(1, 60).slice(1), n: 60 },
  { id: 'C06b', nom: '2 suppressions voulues (60 → 58) : NON propagées, les 60 restent — DOCUMENTÉ (F2-B)', base: () => seances(1, 60), envoi: () => seances(1, 60).slice(2), n: 60 },
  { id: 'C07', nom: '3 retirées d\'un coup (60 → 57) : les 60 restent — DOCUMENTÉ (F2-B)', base: () => seances(1, 60), envoi: () => seances(1, 60).slice(3), n: 60 },
  { id: 'C08a', nom: 'envoi vide (60 → 0) : les 60 restent', base: () => seances(1, 60), envoi: () => [], n: 60 },
  { id: 'C08b', nom: 'champ « sessions » absent : rien ne change', base: () => seances(1, 60), envoi: () => undefined, n: 60 },
  { id: 'C09', nom: 'petit compte (20 → 10) : les 20 restent (avant : 10) — DOCUMENTÉ (F2-B)', base: () => seances(1, 20), envoi: () => seances(1, 20).slice(-10), n: 20 },
  { id: 'C10', nom: 'écritures croisées de même taille (3 neuves de chaque appareil) : 66 (avant : 3 effacées)', base: () => seances(1, 60).concat(seances(1, 3, 'a')), envoi: () => seances(1, 60).concat(seances(1, 3, 'b')), n: 66 },
  { id: 'C11', nom: 'séances sans identifiant, copies ne différant que par « synced » : 60, aucun doublon', base: () => seances(1, 50).concat(Array.from({ length: 10 }, (_, i) => sansId(i + 1))),
    envoi: () => seances(1, 50).concat(Array.from({ length: 10 }, (_, i) => sansId(i + 1, { synced: false }))), n: 60 },
  { id: 'C13', nom: 'rejeu du même envoi (79 → 50 + 1 neuve, deux fois) : 80 les deux fois', base: () => seances(1, 79), envoi: () => seances(1, 79).slice(-50).concat([seance(1, 'n')]), n: 80 },
];
function tirage(rnd) {
  const pick = (l) => l[Math.floor(rnd() * l.length)];
  const nb = pick([0, 1, 5, 20, 29, 30, 31, 49, 50, 51, 60, 83, 84, 85, 120]), sans = Math.min(nb, pick([0, 0, 0, 3, 8]));
  const base = seances(1, nb - sans).concat(Array.from({ length: sans }, (_, i) => sansId(i + 1)));
  if (rnd() < 0.1) base.push(null, 7);                                      // une base DOUTEUSE : jamais jugée, jamais retirée
  if (rnd() < 0.1 && nb > 2) base.push(copie(base[0]));                      // un identifiant déjà en double dans la base
  const melange = (l) => { const c = l.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };
  const garde = pick([0, 1, 3, 10, 30, 50, base.length, base.length - 1, base.length - 3]);
  const envoi = melange(base.filter(valide)).slice(0, Math.max(0, garde)).map((s) => (rnd() < 0.15 ? modifie(s) : copie(s)));
  seances(1, pick([0, 0, 1, 2, 5]), 'n').forEach((s) => envoi.push(s));
  if (rnd() < 0.1) envoi.push(null, 'x', [1], 42, true);                    // entrées invalides
  if (rnd() < 0.1 && envoi.length) envoi.push(copie(envoi[0]));              // doublon dans l'envoi
  return { base, envoi: melange(envoi) };
}
function sectionA(t) {
  console.log('\n── A · les 13 cas P0 sur le vrai Code.js, TOLÉRANCE ZÉRO (le 12ᵉ, la concurrence, est en F) ──');
  const X = P1.serveur();
  t('F2A-A00 · harnais valide : liste premium en dur remplacée une fois, fusion présente dans le Code.js servi', typeof X.ctx._sessFusion_ === 'function' && typeof X.ctx._sessIdentite_ === 'function');
  CAS.forEach((c) => {
    const base = c.base(), envoi = c.envoi(), e = essai(X, base, envoi, c.id), ko = verifier(base, envoi, e.apres);
    t('F2A-A·' + c.id + ' · ' + c.nom, ko.length === 0 && nbPerdues(base, e.apres) === 0 && e.apres.length === c.n && e.rejeu && e.r.j.ok === true,
      { violes: ko, perdues: nbPerdues(base, e.apres), apres: e.apres.length, attendu: c.n, rejeu: e.rejeu, reponse: e.r.t.slice(0, 80) });
  });
  console.log('\n── A2 · la frontière de l\'ancien garde-fou : 50 envoyées (ou toute la base) contre n en base, avec et sans séance neuve ──');
  const tailles = [29, 30, 31, 49, 50, 51, 52, 53, 83, 84, 85, 120, 500];
  const nok = []; const nokNeuve = [];
  tailles.forEach((n) => {
    const base = seances(1, n), envoi = base.slice(-50);
    const e = essai(X, base, envoi, 'f' + n), ko = verifier(base, envoi, e.apres);
    if (ko.length || e.apres.length !== n || nbPerdues(base, e.apres)) nok.push({ n, ko, apres: e.apres.length });
    const envoi2 = envoi.concat([seance(1, 'n')]), e2 = essai(X, base, envoi2, 'g' + n), ko2 = verifier(base, envoi2, e2.apres);
    if (ko2.length || e2.apres.length !== n + 1 || nbPerdues(base, e2.apres)) nokNeuve.push({ n, ko: ko2, apres: e2.apres.length });
  });
  t('F2A-A2a · 50 envoyées contre n ∈ {' + tailles.join(', ') + '} : les n séances restent TOUTES, à chaque taille', nok.length === 0, nok);
  t('F2A-A2b · … et avec UNE séance neuve en plus : n + 1, la neuve est toujours ajoutée (avant : perdue dès 84)', nokNeuve.length === 0, nokNeuve);
  console.log('\n── A3 · 600 tirages à graine fixe : le vrai serveur = le contrat, tous invariants tenus, rejeu inchangé ──');
  const rnd = graine(20261112), exemples = []; let nBad = 0, rejeuKo = 0, perdTot = 0;
  for (let i = 0; i < 600; i++) {
    const { base, envoi } = tirage(rnd), e = essai(X, base, envoi, 'r');
    const ko = verifier(base, envoi, e.apres);
    perdTot += nbPerdues(base, e.apres);
    if (ko.length) { nBad++; if (exemples.length < 3) exemples.push({ i, ko, base: base.length, envoi: envoi.length, apres: e.apres.length }); }
    if (!e.rejeu) rejeuKo++;
  }
  t('F2A-A3a · 600 tirages (tailles 0…120, séances sans id, base douteuse, doublons, entrées invalides, séances modifiées) : AUCUN invariant violé', nBad === 0, { violes: nBad, exemples });
  t('F2A-A3b · … zéro séance de la base perdue, sur les 600', perdTot === 0, perdTot);
  t('F2A-A3c · … et rejouer le même envoi ne change rien, sur les 600', rejeuKo === 0, rejeuKo);
  console.log('\n── A4 · la fonction de fusion seule : 20 000 tirages, mêmes invariants, aucune séance de moins, jamais plus lente que 5 ms par tirage en moyenne ──');
  if (typeof X.ctx._sessFusion_ !== 'function') t('F2A-A4 · la fonction de fusion existe dans le Code.js servi', false, '_sessFusion_ absente');
  else {
  const rnd2 = graine(7), t0 = Date.now(); let n4 = 0, mal = 0, exemple = null;
  for (let i = 0; i < 20000; i++) {
    const { base, envoi } = tirage(rnd2);
    const bj = copie(base), ej = copie(envoi);
    const res = X.ctx._sessFusion_(bj, Array.isArray(ej) ? ej : []).liste;
    const ko = verifier(bj, ej, res);
    if (J(bj) !== J(base)) { mal++; exemple = exemple || { i, motif: 'la base a été MODIFIÉE en place' }; }
    if (ko.length) { mal++; exemple = exemple || { i, ko }; }
    n4++;
  }
  const ms = Date.now() - t0;
  t('F2A-A4a · 20 000 tirages de la fonction pure : invariants tenus, la liste d\'entrée n\'est jamais modifiée en place', mal === 0, exemple);
  t('F2A-A4b · coût : ' + n4 + ' fusions en ' + ms + ' ms (' + (ms / n4).toFixed(2) + ' ms chacune) — sous le verrou global, une fusion reste négligeable', ms / n4 < 5, ms);
  const rr = graine(3), baseR = Array.from({ length: 2000 }, (_, i) => seanceRiche(i, rr)), tousModifies = baseR.map((x) => Object.assign({}, x, { synced: false, note: 'x' }));
  const tA = Date.now(), identiques = X.ctx._sessFusion_(baseR, copie(baseR)), msA = Date.now() - tA, tB = Date.now(), modifs = X.ctx._sessFusion_(baseR, tousModifies), msB = Date.now() - tB;
  info('pire cas mesuré (Node local, pas Apps Script) : 2 000 séances riches — 2 000 identiques : ' + msA + ' ms ; 2 000 toutes modifiées : ' + msB + ' ms');
  t('F2A-A4c · le PIRE CAS (2 000 séances riches, le maximum que le client envoie) : un envoi identique laisse la liste inchangée, un envoi où TOUTES sont modifiées la remplace par les versions envoyées (2 000 séances, même ordre), chacune des deux fusions sous 2 s (sous le verrou global)',
    J(identiques.liste) === J(baseR) && J(modifs.liste) === J(tousModifies) && msA < 2000 && msB < 2000, { msA, msB, n1: identiques.liste.length, n2: modifs.liste.length });
  }
  /* ⭐ L'INDÉPENDANCE À L'ORDRE, dite exactement : l'ENSEMBLE des identifiants ne dépend pas de l'ordre d'arrivée des appareils (toutes les permutations), la VERSION d'un identifiant modifié, si. */
  const rnd3 = graine(99); let ordreKo = 0, exOrdre = null;
  for (let i = 0; i < 40; i++) {
    const base = seances(1, 30 + Math.floor(rnd3() * 60)), appareils = [0, 1, 2].map((k) => base.filter(() => rnd3() < 0.5).concat(seances(1, Math.floor(rnd3() * 4), 'd' + k)));
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]; const ens = [];
    perms.forEach((p) => { const mail = mailDe('o'); compteAvec(X, mail, base); p.forEach((k) => envoyer(X, mail, appareils[k])); ens.push(J(idsDe(lire(X, mail)).slice().sort())); });
    if (new Set(ens).size !== 1) { ordreKo++; exOrdre = exOrdre || i; }
  }
  t('F2A-A5 · 3 appareils dans les 6 ordres d\'arrivée, 40 tirages : le même ENSEMBLE d\'identifiants à chaque fois (toutes les séances, quel que soit l\'ordre)', ordreKo === 0, exOrdre);
}

/* ═══════════════════════════════ B — un même identifiant, des contenus différents ═══════════════════════════════ */
function sectionB(t) {
  console.log('\n── B · même identifiant, contenus différents : la version de l\'ENVOI remplace, à sa place — le dernier arrivé gagne (limite écrite) ──');
  const X = P1.serveur(), base = seances(1, 3);
  let e = essai(X, base, [modifie(base[1])], 'b01');
  t('F2A-B01 · une séance corrigée remplace la version de la base, À SA PLACE, sans changer le nombre ni l\'ordre', e.apres.length === 3 && J(idsDe(e.apres)) === J(['s0001', 's0002', 's0003']) && e.apres[1].note === 'corrigée' && e.apres[1].volume === 503, J(e.apres.map((s) => s.note)));
  const v1 = modifie(base[1], 'v1'), v2 = modifie(base[1], 'v2');
  let mail = mailDe('b02'); compteAvec(X, mail, base); envoyer(X, mail, [v1]); envoyer(X, mail, [v2]);
  const ab = lire(X, mail);
  mail = mailDe('b02'); compteAvec(X, mail, base); envoyer(X, mail, [v2]); envoyer(X, mail, [v1]);
  const ba = lire(X, mail);
  t('F2A-B02 · ⛔ LIMITE DOCUMENTÉE : deux appareils modifient la même séance — c\'est le DERNIER ARRIVÉ qui l\'emporte (v1 puis v2 → v2 ; v2 puis v1 → v1)', ab[1].note === 'v2' && ba[1].note === 'v1', [ab[1].note, ba[1].note]);
  t('F2A-B02b · … mais aucune séance n\'est perdue ni dupliquée dans aucun des deux ordres (3 séances, mêmes identifiants)', ab.length === 3 && ba.length === 3 && J(idsDe(ab).slice().sort()) === J(idsDe(ba).slice().sort()));
  e = essai(X, base, copie(base), 'b03');
  t('F2A-B03 · un envoi identique à la base ne change rien (contenu et ordre)', J(e.apres) === J(base));
  e = essai(X, [seance(1, 's', { synced: false })], [seance(1, 's', { synced: true })], 'b04');
  t('F2A-B04 · seul « synced » diffère : la version de l\'envoi l\'emporte (le drapeau suit le téléphone, comme avant — une séance restaurée ne repart pas vers le classeur Google)', e.apres.length === 1 && e.apres[0].synced === true);
  e = essai(X, [seance(1, 'x', { id: 1700000000000 })], [seance(1, 'x', { id: '1700000000000' })], 'b05');
  t('F2A-B05 · normalisation : l\'identifiant 1700000000000 (nombre) et "1700000000000" (texte) sont LA MÊME séance (1, pas 2)', e.apres.length === 1);
  e = essai(X, [seance(1, 'x', { id: '1700000000000' })], [seance(1, 'x', { id: 1700000000000 })], 'b05b');
  t('F2A-B05b · … dans l\'autre sens aussi', e.apres.length === 1);
  e = essai(X, [seance(1, 'x', { id: 'Abc' })], [seance(1, 'x', { id: 'abc' }), seance(1, 'x', { id: ' abc' })], 'b06');
  t('F2A-B06 · ni la casse ni les espaces ne sont « normalisés » (comme le client) : « Abc », « abc », « abc » avec espace = 3 séances — un doublon vaut mieux qu\'une fusion à tort', e.apres.length === 3);
  e = essai(X, [seance(1, 'x', { id: '' })], [seance(2, 'x', { id: '' })], 'b07a');
  t('F2A-B07a · un identifiant VIDE n\'en est pas un : deux séances différentes d\'identifiant « » ne se confondent pas (2)', e.apres.length === 2);
  e = essai(X, [seance(1, 'x', { id: '  ' }), seance(2, 'x', { id: null }), seance(3, 'x', { id: { a: 1 } })], [seance(1, 'x', { id: '  ' }), seance(2, 'x', { id: null }), seance(3, 'x', { id: { a: 1 } }), seance(4, 'x', { id: [] }), seance(5, 'x', { id: { b: 2 } })], 'b07b');
  t('F2A-B07b · « espaces », null, objet, liste : pas des identifiants — empreinte du contenu : les 3 copies identiques ne se dupliquent pas, et les 2 séances DIFFÉRENTES à identifiant liste / objet ({ b: 2 } ≠ { a: 1 }) s\'ajoutent sans se confondre (5)', e.apres.length === 5, e.apres.length);
  e = essai(X, [seance(1, 'x', { id: 0 })], [seance(1, 'x', { id: 0, note: 'z' })], 'b07c');
  t('F2A-B07c · l\'identifiant 0 EST un identifiant : la séance corrigée remplace (1 séance, version corrigée)', e.apres.length === 1 && e.apres[0].note === 'z');
  e = essai(X, base, [modifie(base[0], 'p1'), modifie(base[0], 'p2')], 'b08');
  t('F2A-B08 · deux versions du même identifiant DANS un envoi : une seule séance, la dernière de la liste', e.apres.length === 3 && e.apres[0].note === 'p2');
  const dup = [seance(1, 'x'), modifie(seance(1, 'x'), 'autre'), seance(2, 'x')];
  e = essai(X, dup, [modifie(seance(1, 'x'), 'v3')], 'b09');
  t('F2A-B09 · des doublons DÉJÀ en base sont gardés (jamais touchés) : la version envoyée remplace la 1ʳᵉ copie seulement', e.apres.length === 3 && e.apres[0].note === 'v3' && e.apres[1].note === 'autre');
  e = essai(X, [sansId(1)], [modifie(sansId(1))], 'b10');
  t('F2A-B10 · ⛔ LIMITE DOCUMENTÉE : une séance SANS identifiant corrigée reste en DEUX versions (un doublon vaut mieux qu\'une perte) — jamais d\'effacement', e.apres.length === 2);
  const c2 = (n) => Array.from({ length: n }, () => sansId(1));
  t('F2A-B11 · sans identifiant, au plus UNE copie par copie (multi-ensemble) : [X, X] reçoit [X, X] → 2 ; reçoit [X, X, X] → 3 ; reçoit [X] → 2',
    essai(X, c2(2), c2(2), 'b11a').apres.length === 2 && essai(X, c2(2), c2(3), 'b11b').apres.length === 3 && essai(X, c2(2), c2(1), 'b11c').apres.length === 2);
}

/* ═══════════════════════════════ C — les anciens clients et les formes douteuses ═══════════════════════════════ */
function sectionC(t) {
  console.log('\n── C · anciens clients, envois douteux : jamais une séance de moins, jamais de plantage ──');
  const X = P1.serveur(), base = seances(1, 60);
  const sur = (champs, tag) => { const mail = mailDe(tag); compteAvec(X, mail, base); const r = X.envoi(mail, champs); return { r, apres: lire(X, mail), mail }; };
  let s = sur({ name: 'Ancien' }, 'c01');
  t('F2A-C01 · un envoi SANS le champ « sessions » (l\'appareil à historique tronqué, ou un ancien client) : les 60 restent, le profil est enregistré', s.apres.length === 60 && s.r.j.ok === true && X.lireCompte(s.mail).profile.name === 'Ancien');
  s = sur({ sessions: null }, 'c02');
  t('F2A-C02 · « sessions: null » : traité comme vide — les 60 restent', s.apres.length === 60 && s.r.j.ok === true);
  s = sur({ sessions: [] }, 'c03');
  t('F2A-C03 · « sessions: [] » : les 60 restent, la télémétrie signale l\'appareil amputé (envoi vide)', s.apres.length === 60 && /\{"d":"[^"]+","e":"[^"]+","recues":0,"enBase":60\}/.test(X.props.HIST_SHRINK || ''), (X.props.HIST_SHRINK || '').slice(0, 120));
  const invalides = [{}, 'texte', 42, true, 'n\'importe quoi'];
  const kos = invalides.filter((v, i) => { const x = sur({ sessions: v }, 'c04' + i); return x.apres.length !== 60 || x.r.j.ok !== true; });
  t('F2A-C04 · une liste INVALIDE (objet, texte, nombre, booléen) est ignorée : les 60 restent, la réponse est « ok », rien n\'est écrit à la place', kos.length === 0, kos.length);
  t('F2A-C04b · … et le serveur le dit dans son journal (sans donnée ni adresse)', X.journal.some((l) => /\[FT sessions\] liste reçue invalide/.test(l)) && X.journal.filter((l) => /\[FT sessions\]/.test(l)).every((l) => !/example\.test/.test(l)));
  s = sur({ sessions: [null, 42, 'x', [1], true, seance(1, 'n')] }, 'c05');
  t('F2A-C05 · des entrées invalides dans la liste sont IGNORÉES (jamais écrites) ; la séance valide est ajoutée : 61', s.apres.length === 61 && s.apres.every(valide));
  const douteuse = [null, 7, { id: 'a' }];
  const mail = mailDe('c06'); compteAvec(X, mail, douteuse); envoyer(X, mail, [{ id: 'b' }]);
  t('F2A-C06 · ce que la base contient déjà, même douteux (null, 7), n\'est JAMAIS retiré : [null, 7, a] + b → [null, 7, a, b]', J(lire(X, mail)) === J([null, 7, { id: 'a' }, { id: 'b' }]), J(lire(X, mail)));
  s = sur({ sessions: seances(1, 60).map((x) => Object.assign({}, x, { exercises: x.exs })) }, 'c07');
  t('F2A-C07 · un ancien format (champ « exercises » en plus) : les séances connues sont remplacées par leur version envoyée, rien de perdu, rien de dupliqué (60)', s.apres.length === 60 && s.apres.every((x) => x.exercises));
  const grosse = seances(1, 2000); const mailG = mailDe('c08'); compteAvec(X, mailG, []); const tG = Date.now(); const rG = envoyer(X, mailG, grosse);
  t('F2A-C08 · un envoi de 2 000 séances (le maximum du client : `slice(0, 2000)`) sur un compte vide : 2 000 enregistrées, une seule requête (' + (Date.now() - tG) + ' ms)', rG.j.ok === true && lire(X, mailG).length === 2000);
  const g = X.get({ action: 'testGardeFou', token: X.props.IDEES_TOKEN2 });
  t('F2A-C09 · la route de diagnostic « testGardeFou » (envoi vide sur un compte à 1 séance) reste verte', g.j.status === 'ok' && g.j.gardeFouUniversel === true, g.t.slice(0, 120));
  const mailN = mailDe('c10'); const rN = envoyer(X, mailN, seances(1, 3), { name: 'Neuf' }); poserCode(X, mailN);
  t('F2A-C10 · un compte NEUF (aucune séance en base) enregistre l\'envoi tel quel : 3 séances, dans l\'ordre', rN.j.ok === true && J(idsDe(lire(X, mailN))) === J(['s0001', 's0002', 's0003']));
  const lp = lireProfil(X, mailN);
  t('F2A-C11 · loadProfile rend la liste fusionnée (forme inchangée : « sessions » au premier niveau)', lp.j.status === 'ok' && Array.isArray(lp.j.sessions) && lp.j.sessions.length === 3, lp.t.slice(0, 120));
}

/* ═══════════════════════════════ D — les suppressions voulues : NON PROPAGÉES, et c'est écrit ═══════════════════════════════ */
function sectionD(t) {
  console.log('\n── D · suppressions volontaires : DOCUMENTÉ, pas guéri — elles ne se propagent plus au serveur avant F2-B (le registre de suppressions) ──');
  const X = P1.serveur(), base = seances(1, 60);
  let mail = mailDe('d01'); compteAvec(X, mail, base); poserCode(X, mail);
  envoyer(X, mail, base.filter((s) => s.id !== 's0030'), { authCode: CODE });
  t('F2A-D01 · ⛔ DOCUMENTÉ — supprimer UNE séance sur le téléphone : le serveur la GARDE (60). Elle reviendra à une restauration ou sur un nouvel appareil.', lire(X, mail).length === 60 && idsDe(lire(X, mail)).indexOf('s0030') >= 0);
  const lp = lireProfil(X, mail);
  t('F2A-D01b · … et loadProfile la rend (c\'est ce que lit « Restaurer »)', Array.isArray(lp.j.sessions) && lp.j.sessions.some((s) => s.id === 's0030'), lp.t.slice(0, 100));
  const activite = seance(31, 'a', { autre: { type: 'marche', duration: 40 } });
  mail = mailDe('d02'); compteAvec(X, mail, base.concat([activite])); envoyer(X, mail, base);
  t('F2A-D02 · ⛔ DOCUMENTÉ — supprimer une « Autre activité » : le serveur la GARDE (61)', lire(X, mail).length === 61 && idsDe(lire(X, mail)).indexOf('a0031') >= 0);
  const importees = base.slice(0, 5).map((s, i) => Object.assign(copie(s), { id: 1700000000000 + i }));
  mail = mailDe('d03'); compteAvec(X, mail, base); envoyer(X, mail, importees.concat(base.slice(5)));
  t('F2A-D03 · ⛔ DOCUMENTÉ — l\'import « Remplacer » (anciennes séances retirées, nouvelles avec d\'autres identifiants) : le serveur garde les 5 anciennes ET ajoute les 5 neuves (65) — des doublons de contenu à une restauration', lire(X, mail).length === 65);
  mail = mailDe('d04'); compteAvec(X, mail, base);
  envoyer(X, mail, base.filter((s) => s.id !== 's0030').concat([seance(1, 'n')]));
  t('F2A-D04 · après une suppression, un envoi qui AJOUTE une séance fonctionne : la neuve est enregistrée (61), la supprimée est toujours là', lire(X, mail).length === 61 && idsDe(lire(X, mail)).indexOf('n0001') >= 0 && idsDe(lire(X, mail)).indexOf('s0030') >= 0);
  envoyer(X, mail, base.filter((s) => s.id !== 's0030'));
  t('F2A-D05 · … et la suppression n\'est jamais « rejouée » contre elle-même : renvoyer le même envoi ne retire rien non plus (61)', lire(X, mail).length === 61);
}

/* ═══════════════════════════════ E — quotas de stockage et erreurs d'écriture ═══════════════════════════════ */
function stockPlafonne(o) {
  const props = Object.create(null), cfg = Object.assign({ total: 0, valeur: 0, panne: null }, o || {});
  const taille = () => Object.keys(props).reduce((a, k) => a + k.length + props[k].length, 0);
  const sp = {
    getProperty: (k) => (k in props ? props[k] : null),
    setProperty: (k, v) => {
      v = String(v);
      if (cfg.panne && cfg.panne(k)) throw new Error('Exception: écriture refusée (panne simulée)');
      if (cfg.valeur && v.length > cfg.valeur) throw new Error('Exception: valeur trop grande (limite simulée)');
      const apres = taille() - (k in props ? k.length + props[k].length : 0) + k.length + v.length;
      if (cfg.total && apres > cfg.total) throw new Error('Exception: quota de stockage des propriétés dépassé (plafond simulé)');
      props[k] = v;
    },
    deleteProperty: (k) => { delete props[k]; }, getProperties: () => Object.assign({}, props), getKeys: () => Object.keys(props),
  };
  return { sp, props, cfg, taille };
}
const verrouEspion = () => { const st = { prises: 0, rendus: 0 }; return { st, LockService: { getScriptLock: () => ({ tryLock: () => { st.prises++; return true; }, waitLock() { st.prises++; }, releaseLock() { st.rendus++; }, hasLock: () => true }) } }; };
function sectionE(t) {
  console.log('\n── E · quotas et erreurs d\'écriture : l\'échec est HAUT ET CLAIR, rien n\'est écrit à moitié, le verrou est rendu, la nouvelle tentative réussit ──');
  const base = seances(1, 70), envoi = base.slice(-50).concat(seances(1, 4, 'n'));
  { // E1 — l'écriture du compte (`u_…`) est refusée
    const stock = stockPlafonne(), v = verrouEspion(), X = P1.serveur({ sp: stock.sp, LockService: v.LockService }), mail = mailDe('e01');
    compteAvec(X, mail, base); const avant = stock.props['u_' + mail];
    stock.cfg.panne = (k) => k === 'u_' + mail; const lock0 = Object.assign({}, v.st);
    const r = envoyer(X, mail, envoi);
    t('F2A-E01 · écriture du compte REFUSÉE : réponse d\'erreur explicite, réessayable (status « error », ok:false, code SERVER_ERROR, retryable)', r.j.status === 'error' && r.j.ok === false && r.j.code === 'SERVER_ERROR' && r.j.retryable === true, r.t.slice(0, 160));
    t('F2A-E01b · … le compte stocké est IDENTIQUE octet pour octet (rien n\'est écrit à moitié : 70 séances, aucune des 4 neuves, aucune perte)', stock.props['u_' + mail] === avant && lire(X, mail).length === 70);
    t('F2A-E01c · … le verrou pris pendant cet envoi est RENDU (' + (v.st.prises - lock0.prises) + ' pris, ' + (v.st.rendus - lock0.rendus) + ' rendu)', v.st.prises - lock0.prises === 1 && v.st.rendus - lock0.rendus === 1, v.st);
    t('F2A-E01d · … et le journal du serveur dit l\'échec, sans adresse ni donnée de compte', X.journal.some((l) => /\[FT saveProfile\] ERREUR/.test(l)) && X.journal.every((l) => l.indexOf(mail) < 0), X.journal.slice(-2));
    stock.cfg.panne = null; const r2 = envoyer(X, mail, envoi), a2 = lire(X, mail);
    t('F2A-E01e · la NOUVELLE TENTATIVE (même envoi, après la panne) réussit : 74 séances, les 70 d\'avant + les 4 neuves, aucune perte', r2.j.ok === true && a2.length === 74 && verifier(base, envoi, a2).length === 0, verifier(base, envoi, a2));
    envoyer(X, mail, envoi);
    t('F2A-E01f · … et la rejouer encore ne change rien (idempotent)', lire(X, mail).length === 74 && J(lire(X, mail)) === J(a2));
  }
  { // E2 — le stockage est plein : la fusion fait grossir le compte
    const plein = stockPlafonne(), X = P1.serveur({ sp: plein.sp }), mail = mailDe('e02'), autre = mailDe('e02autre');
    compteAvec(X, autre, seances(1, 30)); envoyer(X, autre, seances(1, 30)); compteAvec(X, mail, base); envoyer(X, mail, base);   // un premier envoi chacun : le compte prend sa forme complète (champs standard)
    const avantA = plein.props['u_' + autre], avantM = plein.props['u_' + mail];
    plein.cfg.total = plein.taille() + 80;                                      // 80 octets de marge : l'envoi ci-dessous ne peut PAS tenir, un renvoi à l'identique, si
    const r = envoyer(X, mail, envoi.concat(seances(1, 40, 'q')));
    t('F2A-E02 · stockage PLEIN : échec explicite (SERVER_ERROR, réessayable), le compte et les autres comptes sont INCHANGÉS (octet pour octet)', r.j.ok === false && r.j.code === 'SERVER_ERROR' && plein.props['u_' + mail] === avantM && plein.props['u_' + autre] === avantA && lire(X, mail).length === 70, r.t.slice(0, 140));
    const rAutre = envoyer(X, autre, seances(1, 30));
    t('F2A-E02b · … un envoi qui ne grossit PAS le compte passe encore (les autres comptes ne sont pas bloqués par celui-là)', rAutre.j.ok === true);
    plein.cfg.total = 0; const r2 = envoyer(X, mail, envoi.concat(seances(1, 40, 'q')));
    t('F2A-E02c · une fois de la place libérée, la nouvelle tentative réussit : 114 séances (70 + 4 + 40), rien perdu', r2.j.ok === true && lire(X, mail).length === 114);
  }
  { // E3 — la télémétrie (HIST_SHRINK) ne peut pas faire échouer l'enregistrement
    const stock = stockPlafonne({ panne: (k) => k === 'HIST_SHRINK' }), X = P1.serveur({ sp: stock.sp }), mail = mailDe('e03');
    compteAvec(X, mail, seances(1, 83)); const r = envoyer(X, mail, seances(1, 83).slice(-30));
    t('F2A-E03 · la trace « appareil amputé » (HIST_SHRINK) ne peut pas être écrite : l\'envoi réussit quand même, les 83 séances sont là', r.j.ok === true && lire(X, mail).length === 83 && stock.props.HIST_SHRINK === undefined);
  }
  { // E4 — le verrou occupé : rien n'est écrit, réponse réessayable
    const stock = stockPlafonne(), X = P1.serveur({ sp: stock.sp, LockService: { getScriptLock: () => ({ tryLock: () => false, releaseLock() { throw new Error('ne doit pas être rendu'); } }) } }), mail = mailDe('e04');
    compteAvec(X, mail, base); const avant = stock.props['u_' + mail]; const r = envoyer(X, mail, envoi);
    t('F2A-E04 · verrou occupé : « NUT_LOCK_BUSY » réessayable, rien n\'est écrit (octet pour octet), un verrou jamais pris n\'est pas « rendu »', r.j.code === 'NUT_LOCK_BUSY' && r.j.retryable === true && stock.props['u_' + mail] === avant);
  }
  { // E5 — la croissance n'a pas de plafond : on la MESURE
    const X = P1.serveur(), rnd = graine(5), riche = (i) => seanceRiche(i, rnd);
    const tailles = {}; const toutes = []; for (let i = 0; i < 2000; i++) toutes.push(riche(i));
    [100, 500, 1000, 2000].forEach((n) => { const mail = mailDe('e05'); compteAvec(X, mail, []); envoyer(X, mail, toutes.slice(0, n)); tailles[n] = X.brut(mail).length; });
    info('taille du compte compressé (séances de 6 exercices × 4 séries) : ' + Object.keys(tailles).map((n) => n + ' séances = ' + (tailles[n] / 1024).toFixed(0) + ' Ko').join(' · ') + ' — plafond du magasin d\'Apps Script : 500 Ko pour TOUS les comptes');
    t('F2A-E05 · la taille d\'un compte croît avec ses séances (jamais de plafond ni de purge côté serveur : mesuré, dit dans le rapport)', tailles[100] < tailles[500] && tailles[500] < tailles[1000] && tailles[1000] < tailles[2000], tailles);
    const mail = mailDe('e05b'); compteAvec(X, mail, []); let prev = 0, mono = true;
    for (let k = 0; k < 30; k++) { envoyer(X, mail, k % 3 === 0 ? [] : toutes.slice(0, 5 + k * 7)); const n = lire(X, mail).length; if (n < prev) mono = false; prev = n; }
    t('F2A-E05b · 30 envois quelconques (vides, courts, longs) : le nombre de séances du compte ne diminue JAMAIS', mono && prev === 5 + 29 * 7, prev);
  }
}

/* ═══════════════════════════════ G — les AUTRES données du profil : rien ne change (ancien serveur contre nouveau) ═══════════════════════════════ */
const sansTemps = (v) => { const o = JSON.parse(J(v)); const net = (x) => { if (Array.isArray(x)) x.forEach(net); else if (x && typeof x === 'object') { ['updatedAt', 'modifiedAt', 'createdAt'].forEach((k) => { delete x[k]; }); Object.keys(x).forEach((k) => net(x[k])); } }; net(o); return o; };
const PROFIL = () => ({ name: 'Alice F2', gender: 'f', goal: 'muscle', goal2: 'force', priorities: ['dos', 'jambes'], workType: 'sedentaire', foodMode: 'keto', fasting: '16/8', nutritionPhase: 'seche', bday: '12/03', bw: 62.5, age: 31, height: 168,
  activityLevel: 1.55, barW: 20, defRest: 130, neck: 33, waist: 70, hip: 95, coachMemory: 'préfère les séances courtes', morpho: 'mesomorphe', colorblind: '' });
const LISTES = () => ({ prs: { Squat: { rm1: 100, kg: 80, reps: 6, date: '2026-09-01' } }, programmes: [{ name: 'PPL', exs: ['Squat'] }], weightLog: [{ date: '2026-09-01', kg: 62.5 }], sleepLog: [{ date: '2026-09-01', hours: 7, energy: 4 }],
  dayStateLog: [{ d: '2026-09-01', s: 'ok' }], goalLog: [{ date: '2026-08-01', goal: 'muscle' }], mensLog: [{ date: '2026-09-01', waist: 70 }], missedLog: [{ date: '2026-09-02' }], evalPasses: [{ id: 1 }], evalHist: { s1: { ok: true } },
  exRestPref: { Squat: 150 }, exSwaps: { A: 'B' }, cycle: { startDate: '2026-09-01', weeks: 8, rm1s: { Squat: 100 } } });
function sectionG(t) {
  console.log('\n── G · non-régression des AUTRES données du profil : le serveur d\'avant et le nouveau produisent le MÊME compte (hors séances) ──');
  if (!ANCIEN) { t('F2A-G00 · le serveur d\'AVANT se reconstruit depuis le Code.js courant (repères présents)', false, 'repères du bloc « sessions » introuvables'); return; }
  const SEQ = [
    ['profil complet', Object.assign({ sessions: seances(1, 5) }, PROFIL(), LISTES())],
    ['listes vides sur listes pleines (garde-fous « le vide ne gagne jamais »)', { sessions: seances(1, 5), prs: {}, programmes: [], weightLog: [], sleepLog: [], dayStateLog: [], goalLog: [], mensLog: [], missedLog: [], evalPasses: [], evalHist: {} }],
    ['chaînes vides et zéros sur valeurs pleines', { name: '', gender: '', goal: '', bw: 0, age: 0, height: 0, activityLevel: 0 }],
    ['réglages qui se décochent (jeûne, mode alimentaire)', { foodMode: '', fasting: '' }],
    ['changements de valeurs', { name: 'Alice 2', bw: 61.8, goal: 'seche', prs: { Squat: { rm1: 105, kg: 85, reps: 5, date: '2026-10-01' }, Bench: { rm1: 70, kg: 60, reps: 6, date: '2026-10-01' } }, weightLog: [{ date: '2026-09-01', kg: 62.5 }, { date: '2026-10-01', kg: 61.8 }], cycle: null }],
    ['séances en croissance normale', { sessions: seances(1, 6) }],
    ['journal alimentaire (volet Nutrition, protocole v3)', { foodLogV: 3, requestId: 'rq' + 'a'.repeat(16), foodLog: [{ id: 'm-1', date: '2026-10-01', meal: 'midi', name: 'repas-fictif-1', ts: 1759300000000, kcal: 500, prot: 30, carbs: 50, fat: 15, q: 100, u: 'g', v: 1 }], savedFoods: [{ name: 'fav-fictif-1', kcal: 100 }], hiddenFoods: [] }],
    ['loadProfile', null],
  ];
  const N = P1.serveur(), A = P1.serveur({ code: ANCIEN }), mail = 'g-alice@example.test';
  let diffs = []; const reponses = [];
  SEQ.forEach(([nom, champs]) => {
    if (champs === null) { poserCode(N, mail); poserCode(A, mail); const rn = lireProfil(N, mail), ra = lireProfil(A, mail); const a = sansTemps(Object.assign({}, ra.j, { sessions: undefined })), b = sansTemps(Object.assign({}, rn.j, { sessions: undefined })); if (J(a) !== J(b)) diffs.push(nom); return; }
    const rn = N.envoi(mail, copie(champs)), ra = A.envoi(mail, copie(champs));
    reponses.push([nom, rn.j.status, ra.j.status]);
    const cn = sansTemps(N.lireCompte(mail)), ca = sansTemps(A.lireCompte(mail)); delete cn.sessions; delete ca.sessions;
    if (J(cn) !== J(ca)) diffs.push(nom + ' : ' + Object.keys(cn).concat(Object.keys(ca)).filter((k, i, l) => l.indexOf(k) === i && J(cn[k]) !== J(ca[k])).join(','));
  });
  t('F2A-G01 · ' + SEQ.length + ' envois (profil complet, vides sur pleins, zéros, réglages décochés, changements, Nutrition, loadProfile) : le compte est IDENTIQUE ancien/nouveau, séances exceptées', diffs.length === 0, diffs);
  t('F2A-G02 · … et chaque réponse a le même statut (ok partout)', reponses.every((r) => r[1] === r[2] && r[1] === 'ok'), reponses);
  const sn = lire(N, mail), sa = lire(A, mail);
  t('F2A-G03 · les séances, sur ces envois en CROISSANCE NORMALE : même ensemble d\'identifiants et mêmes contenus ancien/nouveau', J(sn.map((s) => s.id).sort()) === J(sa.map((s) => s.id).sort()) && J(sn.map((s) => canon(s)).sort()) === J(sa.map((s) => canon(s)).sort()), [sn.length, sa.length]);
  const rnd = graine(31); let bad = 0;
  for (let i = 0; i < 60; i++) {   // croissance normale : l'envoi contient TOUTE la base (+ neuves) : ancien et nouveau doivent coïncider (comme ensemble)
    const base = seances(1, 30 + Math.floor(rnd() * 80)), envoi = base.map((s) => (rnd() < 0.1 ? modifie(s) : s)).concat(seances(1, Math.floor(rnd() * 4), 'n'));
    const m2 = mailDe('g'); compteAvec(N, m2, base); compteAvec(A, m2, base); envoyer(N, m2, envoi); envoyer(A, m2, envoi);
    if (J(lire(N, m2).map(canon).sort()) !== J(lire(A, m2).map(canon).sort())) bad++;
  }
  t('F2A-G04 · 60 envois en croissance normale (l\'envoi contient toute la base, des séances corrigées, des neuves) : MÊME résultat qu\'avant (comme ensemble) — le comportement ordinaire n\'a pas bougé', bad === 0, bad);
  const traces = N.journal.filter((l) => /FT sessions|GARDE-FOU sessions/.test(l)).length;
  t('F2A-G05 · aucune trace « envoi plus court » sur ces envois ordinaires (la télémétrie ne parle que d\'un appareil amputé)', traces === 0 && !N.props.HIST_SHRINK, traces);
  const X = P1.serveur(), m3 = mailDe('g06'); compteAvec(X, m3, seances(1, 83)); envoyer(X, m3, seances(1, 83).slice(-30));
  const hs = JSON.parse(X.props.HIST_SHRINK || '[]');
  t('F2A-G06 · le SIGNAL est conservé : un appareil amputé (30 envoyées sur 83) laisse la même trace datée qu\'avant { d, e, recues:30, enBase:83 } pour la carte « Santé du système » (la carte dit encore « refusée » : texte de app.js, hors périmètre)',
    hs.length === 1 && hs[0].recues === 30 && hs[0].enBase === 83 && typeof hs[0].d === 'string' && Object.keys(hs[0]).sort().join() === 'd,e,enBase,recues' && X.journal.some((l) => /envoi plus court que la base : 30 reçues contre 83 en base — aucune séance retirée/.test(l)), X.props.HIST_SHRINK);
}

/* ═══════════════════════════════ H — le RETOUR ARRIÈRE : l'ancien serveur réintroduit la perte (démontré) ═══════════════════════════════ */
function sectionH(t) {
  console.log('\n── H · « remettre la version précédente » n\'est PAS un retour arrière sans perte : l\'ancien serveur perd des séances (mesuré sur les mêmes cas) ──');
  const reco = ANCIEN_BRUT ? reconstruireAncien(CODE_NEUF) : null; const git = ancienDeGit();
  t('F2A-H00 · le serveur d\'AVANT se reconstruit depuis le Code.js courant (repères du bloc « sessions » et des fonctions F2-A′ présents)', ANCIEN !== null);
  if (!ANCIEN) return;
  if (git === null) info('H00b non vérifiable ici : `git show ' + SHA_ANCIEN.slice(0, 8) + ':Code.js` indisponible (pas de dépôt, ou objet absent) — la reconstruction n\'est PAS comparée au vrai ancien fichier');
  else t('F2A-H00b · la reconstruction est IDENTIQUE octet pour octet au vrai Code.js de master fd8bf703 (ft-v1266)', reco === git, { reconstruit: reco && reco.length, git: git.length });
  const A = P1.serveur({ code: ANCIEN }), N = P1.serveur();
  const rouges = CAS.filter((c) => c.id !== 'C06a' && c.id !== 'C06b' && c.id !== 'C07' && c.id !== 'C09').map((c) => {
    const base = c.base(), envoi = c.envoi(), ea = essai(A, base, envoi, 'h' + c.id), en = essai(N, base, envoi, 'h' + c.id);
    return { id: c.id, ancien: verifier(base, envoi, ea.apres).filter((x) => x !== 'REF'), nouveau: verifier(base, envoi, en.apres), perduesAncien: nbPerdues(base, ea.apres), neuvesPerduesAncien: envoi ? (envoi.filter(valide).filter((s) => !ea.apres.some((a) => valide(a) && ident(a) === ident(s))).length) : 0 };
  });
  const parId = (id) => rouges.find((r) => r.id === id);
  t('F2A-H01 · l\'ANCIEN serveur efface des séances sur C02a (20), C02b (33), C04 (29), C10 (3) ; le nouveau : 0', [['C02a', 20], ['C02b', 33], ['C04', 29], ['C10', 3]].every(([id, n]) => parId(id).perduesAncien === n && parId(id).nouveau.length === 0), rouges.map((r) => [r.id, r.perduesAncien]));
  t('F2A-H02 · l\'ANCIEN serveur PERD la séance neuve (C05 : refus total de l\'envoi) ; le nouveau l\'ajoute', parId('C05').neuvesPerduesAncien === 1 && parId('C05').ancien.indexOf('I2') >= 0 && parId('C05').nouveau.length === 0, parId('C05'));
  t('F2A-H03 · sur 13 cas P0, l\'ancien serveur viole au moins un invariant dans ' + rouges.filter((r) => r.ancien.length).length + ' ; le nouveau dans ' + rouges.filter((r) => r.nouveau.length).length + ' (attendu 0)', rouges.filter((r) => r.nouveau.length).length === 0 && rouges.filter((r) => r.ancien.length).length >= 4, rouges.filter((r) => r.ancien.length).map((r) => r.id));
  /* La séquence réelle d'un retour arrière : MÊMES propriétés, le nouveau serveur d'abord, l'ancien ensuite (le dépôt de code change, pas les données). */
  const stock = stockPlafonne(), N2 = P1.serveur({ sp: stock.sp }), A2 = P1.serveur({ sp: stock.sp, code: ANCIEN }), mail = mailDe('h04'), base = seances(1, 83);
  compteAvec(N2, mail, []); envoyer(N2, mail, base);
  const avantRetour = lire(N2, mail).length; envoyer(A2, mail, base.slice(-50)); const apresRetour = lire(A2, mail).length;
  t('F2A-H04 · RETOUR ARRIÈRE joué sur les mêmes propriétés : 83 séances avec le nouveau serveur ; on remet l\'ancien ; un appareil à 50 séances se synchronise → ' + apresRetour + ' (33 effacées). Le retour arrière réintroduit la perte.', avantRetour === 83 && apresRetour === 50, { avantRetour, apresRetour });
  envoyer(N2, mail, base.slice(-50));
  t('F2A-H05 · … et ce que le retour arrière a effacé ne revient pas tout seul : le nouveau serveur, remis, ne retrouve pas les 33 (il garde ce qu\'il a, il n\'invente pas) — la sauvegarde nocturne ou « Restaurer » depuis un appareil complet les rend', lire(N2, mail).length === 50);
}

/* ═══════════════════════════════ F — la VRAIE concurrence : de vrais processus, un vrai verrou ═══════════════════════════════ */
function lancerPool(dir, n, env) {
  const att = new Map(); let seq = 0; const procs = [], prets = [];
  for (let k = 0; k < n; k++) {
    const c = fork(path.join(RACINE, 'tools', 'nut_serveur_proc.js'), [dir], { env: Object.assign({}, process.env, env || {}), stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    prets.push(new Promise((r) => { c.__pret = r; }));
    c.on('message', (m) => { if (m.pret) return c.__pret(); const f = att.get(m.id); if (f) { att.delete(m.id); f(m); } });
    procs.push(c);
  }
  const appel = (k, m) => new Promise((r) => { const id = ++seq; att.set(id, r); procs[k].send(Object.assign({ id }, m)); });
  const pool = {
    dir, n, prets: Promise.all(prets), appel,
    post: (k, corps, barriere) => appel(k, { op: 'post', corps: typeof corps === 'string' ? corps : J(corps), barriere }),
    init: (k, mail, o) => appel(k, Object.assign({ op: 'init', email: mail }, o || {})),
    lire: async (k, mail) => (await appel(k, { op: 'lire', email: mail })).compte,
    simultane: async (envois, barriere) => {
      fs.readdirSync(dir).filter((f) => /^lu_/.test(f)).forEach((f) => { try { fs.unlinkSync(path.join(dir, f)); } catch (e) { /* déjà parti */ } });
      return Promise.all(envois.map((e) => pool.post(e.k, e.corps, barriere ? envois.length : 0)));
    },
    tuer: () => procs.forEach((c) => { try { c.kill(); } catch (e) { /* déjà mort */ } }),
  };
  return pool;
}
const corps = (mail, sessions, champs) => Object.assign({ action: 'saveProfile', email: mail, sessions: copie(sessions) }, champs || {});
const lj = (r) => { try { return JSON.parse(r.t); } catch (e) { return {}; } };
async function sectionF(t) {
  console.log('\n── F · concurrence RÉELLE (processus séparés, propriétés partagées, verrou mkdir) : deux appareils écrivent ENSEMBLE à partir du même état périmé ──');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f2a_')), dirSans = fs.mkdtempSync(path.join(os.tmpdir(), 'f2asans_'));
  const pool = lancerPool(dir, 3); let poolSans = null;
  try {
    await pool.prets;
    const base = seances(1, 70);
    let mail = mailDe('f1'); await pool.init(0, mail, { extra: { sessions: base } });
    let rs = await pool.simultane([{ k: 0, corps: corps(mail, base.concat(seances(1, 3, 'a'))) }, { k: 1, corps: corps(mail, base.concat(seances(1, 3, 'b'))) }], true);
    let fin = (await pool.lire(0, mail)).sessions;
    t('F2A-F1 · C12 : deux appareils envoient ENSEMBLE (70 + 3 neuves « a » / 70 + 3 neuves « b ») à partir du MÊME état lu : 76 séances, aucune perdue, aucun doublon', rs.every((r) => lj(r).ok === true) && fin.length === 76 && new Set(idsDe(fin)).size === 76 && verifier(base, base.concat(seances(1, 3, 'a'), seances(1, 3, 'b')), fin).filter((x) => x !== 'REF').length === 0, { reponses: rs.map((r) => lj(r).status), n: fin.length });
    mail = mailDe('f2'); await pool.init(1, mail, { extra: { sessions: seances(1, 80) } });
    const amput = seances(1, 80).slice(-50).concat(seances(1, 1, 'a')), plein = seances(1, 80).concat(seances(1, 1, 'b'));
    rs = await pool.simultane([{ k: 0, corps: corps(mail, amput) }, { k: 2, corps: corps(mail, plein) }], true); fin = (await pool.lire(1, mail)).sessions;
    t('F2A-F2 · un appareil AMPUTÉ (50 sur 80 + 1 neuve) et un appareil complet (80 + 1 neuve) en même temps : 82 séances, aucune perdue', rs.every((r) => lj(r).ok === true) && fin.length === 82 && new Set(idsDe(fin)).size === 82, fin.length);
    /* F3 — 4 tours de trois appareils simultanés, chacun envoie un sous-ensemble amputé de ce que le serveur avait + 1 à 2 séances neuves. Tout ce qui a été envoyé doit être là à la fin. */
    mail = mailDe('f3'); let connu = seances(1, 60); await pool.init(0, mail, { extra: { sessions: connu } });
    const rnd = graine(424242); let attendus = new Set(idsDe(connu)); let ok3 = true, det3 = [];
    for (let tour = 0; tour < 4; tour++) {
      const envois = [0, 1, 2].map((k) => { const sub = connu.filter(() => rnd() < 0.55).concat(seances(1, 1 + Math.floor(rnd() * 2), 't' + tour + 'k' + k)); sub.forEach((s) => attendus.add(s.id)); return { k, corps: corps(mail, sub), sub }; });
      const r = await pool.simultane(envois.map((e) => ({ k: e.k, corps: e.corps })), true);
      envois.forEach((e) => e.sub.forEach((s) => { if (!connu.some((c) => c.id === s.id)) connu.push(s); }));
      const cloud = (await pool.lire(0, mail)).sessions; const ids = idsDe(cloud);
      if (!r.every((x) => lj(x).ok === true) || ids.length !== attendus.size || new Set(ids).size !== ids.length || Array.from(attendus).some((id) => ids.indexOf(id) < 0)) { ok3 = false; det3.push({ tour, ids: ids.length, attendus: attendus.size }); }
    }
    t('F2A-F3 · 4 tours × 3 appareils simultanés (envois amputés à ~55 % + neuves) : à chaque tour, le serveur contient EXACTEMENT l\'union de tout ce qui a été envoyé — rien de perdu, rien de dupliqué', ok3, det3);
    mail = mailDe('f4'); await pool.init(2, mail, { extra: { sessions: seances(1, 60) } });
    const P = seances(1, 60).slice(-50).concat(seances(1, 2, 'n'));
    await pool.simultane([0, 1, 2].map((k) => ({ k, corps: corps(mail, P) })), true); await pool.simultane([0, 1, 2].map((k) => ({ k, corps: corps(mail, P) })), true);
    fin = (await pool.lire(0, mail)).sessions;
    t('F2A-F4 · le MÊME envoi lancé par 3 processus à la fois, deux fois : 62 séances exactement (60 + 2), aucun doublon — les rejeux concurrents sont inoffensifs', fin.length === 62 && new Set(idsDe(fin)).size === 62, fin.length);
    /* L'AUTO-CONTRÔLE DU BANC : sans verrou, la mise à jour perdue DOIT apparaître — sinon F1 n'aurait rien prouvé. */
    poolSans = lancerPool(dirSans, 2, { NUT_SANS_VERROU: '1' }); await poolSans.prets;
    mail = mailDe('f5'); await poolSans.init(0, mail, { extra: { sessions: base } });
    await poolSans.simultane([{ k: 0, corps: corps(mail, base.concat(seances(1, 3, 'a'))) }, { k: 1, corps: corps(mail, base.concat(seances(1, 3, 'b'))) }], true);
    const finSans = (await poolSans.lire(0, mail)).sessions;
    t('F2A-F5 · AUTO-CONTRÔLE : SANS verrou (processus identiques, verrou neutralisé), la même concurrence PERD des séances (' + finSans.length + ' sur 76 attendues) — le banc sait voir la perte, F1 est donc une vraie preuve du verrou', finSans.length < 76, finSans.length);
  } finally {
    pool.tuer(); if (poolSans) poolSans.tuer();
    [dir, dirSans].forEach((d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } });
  }
}

/** Une section qui PLANTE ne doit pas cacher les autres : le plantage est un rouge nommé, la suite est jouée. */
async function garde(nom, f, t) { try { await f(); } catch (e) { t('F2A-' + nom + '-PLANTAGE · la section ' + nom + ' s\'est arrêtée sur une erreur (ne prouve rien : les tests suivants de la section n\'ont pas tourné)', false, String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } }
async function jouer(t) {
  console.log('\n═══ B-F2A. F2-A′ — fusion des séances par identifiant, zéro suppression implicite (le vrai Code.js) ═══');
  if (voulu('Z')) await garde('Z', () => sectionZ(t), t);
  if (voulu('A')) await garde('A', () => sectionA(t), t);
  if (voulu('B')) await garde('B', () => sectionB(t), t);
  if (voulu('C')) await garde('C', () => sectionC(t), t);
  if (voulu('D')) await garde('D', () => sectionD(t), t);
  if (voulu('E')) await garde('E', () => sectionE(t), t);
  if (voulu('G')) await garde('G', () => sectionG(t), t);
  if (voulu('H')) await garde('H', () => sectionH(t), t);
  if (voulu('F')) await garde('F', () => sectionF(t), t);
}
module.exports = { jouer, seance, seances, sansId, modifie, attendu, verifier, ident };
