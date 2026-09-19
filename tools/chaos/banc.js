/* ════════════════════════════════════════════════════════════════════════════════════════
   BANC DE CHAOS — INTEGRITE, MULTI-APPAREILS ET REPRISE APRES PANNE
   Force Tracker — nuit du 18 au 19/09/2026.

   ⛔⛔ ENVIRONNEMENT LOCAL ISOLE UNIQUEMENT. Aucune donnee reelle, aucune ecriture sur
   l'instance Supabase, aucun appel reseau. Les adresses employees sont en `.invalid`
   (RFC 2606), donc non routables par construction.

   ⭐⭐ CE QUI REND CE BANC DIFFERENT D'UNE RELECTURE : les deux destinations sont les VRAIES.
      • Apps Script : le fichier `Code.js` SERVI est charge dans un contexte `vm` et c'est
        `handleSaveProfile_` qui ecrit — pas une reecriture « fidele ».
      • Supabase : un vrai PostgreSQL 16 avec les migrations `supabase/migrations/` appliquees
        telles quelles, et les RPC appelees comme le Worker les appelle.

   ⭐ CHAQUE GARANTIE DOIT POUVOIR ROUGIR : `tools/chaos/mutations.py` rejoue ce banc sur un
      arbre ou une garantie a ete cassee, et exige que LE temoin correspondant tombe.
   ════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const PG = require('./pg.js');
const HA = require('./harness_appsscript.js');

const BASE = process.env.FT_PGBASE || 'chaos';
const CPT = 'chaos.compte@exemple.invalid';
const AUTRE = 'chaos.autre@exemple.invalid';
const H_A = 'a'.repeat(64);
const H_B = 'b'.repeat(64);
/* ⭐ UN HACHE DEDIE A LA REVOCATION, ET C'EST UNE CORRECTION DE BANC PAYEE CASH.
   Ma premiere version revoquait H_A puis tentait de le remettre actif par un `update`. Or la
   table porte une contrainte `revoque_le is null or revoque` : l'update ETAIT REFUSE — donc
   H_A restait revoque pour tout le reste de la passe, et QUATRE temoins suivants rougissaient
   sur du code parfaitement sain. Pire, je ne lisais pas le code retour de cet `update`.
   >> *Une ecriture de banc dont on ne lit pas le retour fabrique un faux rouge en aval.*
   La contrainte, elle, faisait exactement son travail : on ne « de-revoque » pas un appareil. */
const H_C = 'c'.repeat(64);
const H_INCONNU = 'f'.repeat(64);

let OK = 0;
const KO = [];
const FAITS = [];          // pour le rapport : {id, verdict, detail}

function t(id, nom, cond, detail) {
  if (cond) { OK++; console.log('  OK   ' + id + ' ' + nom); }
  else { KO.push(id + ' ' + nom); console.log('  !!   ' + id + ' ' + nom + '\n       ' + String(detail === undefined ? '' : JSON.stringify(detail)).slice(0, 240)); }
  FAITS.push({ id, nom, ok: !!cond });
  return !!cond;
}

function note(id, texte) { console.log('  ..   ' + id + ' ' + texte); FAITS.push({ id, nom: texte, ok: null }); }

const clone = (o) => JSON.parse(JSON.stringify(o));

/* ── LE COMPTE SYNTHETIQUE ─────────────────────────────────────────────────────────────
   Chaque entree porte un identifiant reconnaissable a l'oeil : si une valeur disparait ou
   revient, on voit LAQUELLE sans avoir a comparer deux blobs. */
function compteBase() {
  return {
    action: 'saveProfile',
    email: CPT,
    name: 'BASE', bw: 80, age: 40, height: 175, gender: 'H', goal: 'force',
    sessions: [{ id: 'S_BASE_1', d: '2026-09-01' }, { id: 'S_BASE_2', d: '2026-09-02' }],
    prs: { squat: { id: 'PR_BASE', rm1: 140 } },
    programmes: [{ id: 'PROG_BASE', name: 'base' }],
    weightLog: [{ date: '2026-09-01', kg: 80, id: 'W_BASE' }],
    sleepLog: [{ date: '2026-09-01', hours: 7, id: 'SL_BASE' }],
    dayStateLog: [{ date: '2026-09-01', id: 'DS_BASE' }],
    goalLog: [{ date: '2026-09-01', id: 'GL_BASE' }],
    foodLog: [{ ts: 1, id: 'F_BASE', n: 'pain' }],
    savedFoods: [{ id: 'SF_BASE' }],
    bodyScans: [{ id: 'BS_BASE' }],
    bloodTests: [{ id: 'BT_BASE' }],
    customExercises: [{ id: 'CE_BASE', name: 'ex base' }],
    priorities: [{ id: 'PRI_BASE' }],
    registre: { cle: 'REG_BASE', sousobjet: { a: 1, b: 2 } },
    healthProfile: { blessures: [{ id: 'BL_BASE' }], note: 'HP_BASE' },
  };
}

/* ── UNE DESTINATION = UNE FONCTION ────────────────────────────────────────────────────
   On ecrit le MEME corps aux deux destinations, comme le client le fait (R2). */
function ecrireDeuxCotes(h, corps, hache, options) {
  const o = options || {};
  const res = { as: null, sb: null };
  if (!o.sansAppsScript) res.as = h.sauver(clone(corps));
  if (!o.sansSupabase) {
    const sansJustif = clone(corps);
    // le client retire deja les justificatifs ; la porte les retire a nouveau
    res.sb = PG.enregistrer(BASE, hache, sansJustif);
  }
  return res;
}

function etatFinal(h) {
  return { as: h.lire(CPT), sb: PG.lireBlob(BASE, CPT) };
}

function reinit(h) {
  h.vider();
  PG.vider(BASE);
}

// ════════════════════════════════════════════════════════════════════════════════════════
function main() {
  console.log('=== MONTAGE (vraies migrations + vrai Code.js) ===');
  const m = PG.monter(BASE, process.env.FT_MIG);
  if (!t('M0', 'les migrations s appliquent sur PostgreSQL local', m.ok, m.sortie)) return 1;
  const h = HA.creer();
  const jA = h.poserJeton(CPT, 'appareil A');
  const jB = h.poserJeton(CPT, 'appareil B');
  t('M0b', 'deux jetons distincts pour le MEME compte', jA && jB && jA !== jB,
    { a: String(jA).length, b: String(jB).length });
  PG.poserJeton(BASE, H_A, CPT);
  PG.poserJeton(BASE, H_B, CPT);

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== M1 — B sauvegarde un etat ANCIEN apres A ===');
  reinit(h);
  const base = compteBase();
  ecrireDeuxCotes(h, Object.assign({}, base, { token: jA }), H_A);
  const etatA = Object.assign({}, clone(base), { token: jA });
  etatA.sessions = etatA.sessions.concat([{ id: 'S_ADDED_BY_A', d: '2026-09-03' }]);
  ecrireDeuxCotes(h, etatA, H_A);
  const etatB = Object.assign({}, clone(base), { token: jB });   // B n'a jamais vu l'ajout
  ecrireDeuxCotes(h, etatB, H_B);
  let e = etatFinal(h);
  const perduAS = !(e.as.sessions || []).some((s) => s.id === 'S_ADDED_BY_A');
  const perduSB = !(e.sb.sessions || []).some((s) => s.id === 'S_ADDED_BY_A');
  t('M1a', 'PERTE MESUREE cote Apps Script : l ajout de A disparait', perduAS,
    (e.as.sessions || []).map((s) => s.id));
  t('M1b', 'PERTE MESUREE cote Supabase : l ajout de A disparait aussi', perduSB,
    (e.sb.sessions || []).map((s) => s.id));

  console.log('\n=== M2 — B modifie un AUTRE champ ===');
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  const a2 = Object.assign({}, clone(base), { token: jA, name: 'MODIFIE_PAR_A' });
  ecrireDeuxCotes(h, a2, H_A);
  const b2 = Object.assign({}, clone(base), { token: jB, bw: 99 });  // B part de l ancien name
  ecrireDeuxCotes(h, b2, H_B);
  e = etatFinal(h);
  t('M2a', 'la modification independante de A est PERDUE (Apps Script)',
    e.as.profile.name === 'BASE', e.as.profile.name);
  t('M2b', 'la modification de B est bien prise', e.as.profile.bw === 99, e.as.profile.bw);
  t('M2c', 'meme perte cote Supabase', e.sb.name === 'BASE', e.sb.name);

  console.log('\n=== M3 — RESURRECTION d une entree supprimee, liste par liste ===');
  const listes = ['sessions', 'weightLog', 'sleepLog', 'dayStateLog', 'foodLog',
                  'savedFoods', 'bodyScans', 'bloodTests', 'customExercises', 'programmes'];
  const ressuscitees = [];
  for (const L of listes) {
    reinit(h);
    const dep = clone(base);
    dep[L] = dep[L].concat([{ id: 'DELETED_BY_A_' + L }]);
    ecrireDeuxCotes(h, Object.assign({}, dep, { token: jA }), H_A);
    const supp = clone(dep);
    supp[L] = supp[L].filter((x) => x.id !== 'DELETED_BY_A_' + L);   // A supprime
    ecrireDeuxCotes(h, Object.assign({}, supp, { token: jA }), H_A);
    ecrireDeuxCotes(h, Object.assign({}, dep, { token: jB }), H_B);  // B a l ancienne copie
    e = etatFinal(h);
    const rAS = ((e.as[L] || e.as.profile[L] || [])).some((x) => x.id === 'DELETED_BY_A_' + L);
    const rSB = ((e.sb[L] || [])).some((x) => x.id === 'DELETED_BY_A_' + L);
    if (rAS || rSB) ressuscitees.push(L + (rAS ? '/AS' : '') + (rSB ? '/SB' : ''));
  }
  t('M3', 'RESURRECTION reproduite sur les ' + listes.length + ' listes, des DEUX cotes',
    ressuscitees.length === listes.length * 1 && ressuscitees.every((x) => x.includes('/AS') && x.includes('/SB')),
    ressuscitees);

  console.log('\n=== M4 — A vide COMPLETEMENT une liste ===');
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  const vide = Object.assign({}, clone(base), { token: jA, weightLog: [] });
  ecrireDeuxCotes(h, vide, H_A);
  e = etatFinal(h);
  t('M4a', 'Apps Script REFUSE le vidage total (garde-fou volontaire)',
    (e.as.weightLog || []).length === 1, e.as.weightLog);
  t('M4b', 'Supabase ACCEPTE le vidage total — les deux destinations divergent',
    (e.sb.weightLog || []).length === 0, e.sb.weightLog);
  /* ⭐⭐ TROU COMBLE PAR LE CONTROLE NEGATIF, ET IL ETAIT REEL. Mes temoins ne visaient que
     des listes a garde EN LIGNE (`sessions`, `weightLog`). Or la moitie des listes passe par
     l'aide `_pa_`, et CASSER `_pa_` ne faisait rougir personne : le banc ne la conduisait
     jamais. >> *Un garde qu'aucun temoin ne traverse est un garde qu'on peut retirer sans
     que rien ne le dise.* */
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA, foodLog: [] }), H_A);
  e = etatFinal(h);
  t('M4c', 'une liste geree par `_pa_` refuse elle aussi le vidage total (foodLog)',
    ((e.as.profile || {}).foodLog || e.as.foodLog || []).length === 1,
    (e.as.profile || {}).foodLog);

  console.log('\n=== M5 — A et B ajoutent chacun une entree, dans les deux ordres ===');
  for (const ordre of [['A', 'B'], ['B', 'A']]) {
    reinit(h);
    ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
    const pA = clone(base); pA.sessions = pA.sessions.concat([{ id: 'A_ONLY' }]);
    const pB = clone(base); pB.sessions = pB.sessions.concat([{ id: 'B_ONLY' }]);
    const suite = ordre[0] === 'A' ? [[pA, jA, H_A], [pB, jB, H_B]] : [[pB, jB, H_B], [pA, jA, H_A]];
    for (const [p, j, hh] of suite) ecrireDeuxCotes(h, Object.assign({}, p, { token: j }), hh);
    e = etatFinal(h);
    const ids = (e.as.sessions || []).map((s) => s.id);
    const dernier = ordre[1] === 'A' ? 'A_ONLY' : 'B_ONLY';
    const premier = ordre[1] === 'A' ? 'B_ONLY' : 'A_ONLY';
    t('M5-' + ordre.join(''), 'seul le DERNIER ecrivain survit (' + dernier + ' present, ' +
      premier + ' perdu)', ids.includes(dernier) && !ids.includes(premier), ids);
  }

  console.log('\n=== M6 — A et B modifient la MEME entree ===');
  for (const ordre of [['A', 'B'], ['B', 'A']]) {
    reinit(h);
    ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
    const pA = clone(base); pA.prs = { squat: { id: 'PR_BASE', rm1: 150 } };
    const pB = clone(base); pB.prs = { squat: { id: 'PR_BASE', rm1: 160 } };
    const suite = ordre[0] === 'A' ? [[pA, jA, H_A], [pB, jB, H_B]] : [[pB, jB, H_B], [pA, jA, H_A]];
    for (const [p, j, hh] of suite) ecrireDeuxCotes(h, Object.assign({}, p, { token: j }), hh);
    e = etatFinal(h);
    const attendu = ordre[1] === 'A' ? 150 : 160;
    t('M6-' + ordre.join(''), 'dernier ecrivain gagnant, sans fusion (' + attendu + ')',
      e.as.prs.squat.rm1 === attendu && e.sb.prs.squat.rm1 === attendu,
      { as: e.as.prs.squat.rm1, sb: e.sb.prs.squat.rm1 });
  }

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== S1/S2/S3 — `sessions` omis, stockage sature ===');
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  const tronque = clone(base);
  delete tronque.sessions;                       // exactement ce que fait `S.histTronque`
  ecrireDeuxCotes(h, Object.assign({}, tronque, { token: jA }), H_A);
  e = etatFinal(h);
  t('S1a', 'Apps Script conserve l historique quand `sessions` est ABSENT',
    (e.as.sessions || []).length === 2, e.as.sessions);
  t('S1b', '⭐ Supabase le conserve AUSSI depuis la migration 0003',
    (e.sb.sessions || []).length === 2, e.sb.sessions);
  /* meme trou que M4c, autre moitie : un champ ABSENT sur une liste geree par `_pa_`. */
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  const sansFood = clone(base); delete sansFood.foodLog;
  ecrireDeuxCotes(h, Object.assign({}, sansFood, { token: jA }), H_A);
  e = etatFinal(h);
  t('S1c', 'un champ ABSENT gere par `_pa_` conserve l existant (foodLog)',
    ((e.as.profile || {}).foodLog || e.as.foodLog || []).length === 1,
    (e.as.profile || {}).foodLog);
  t('S1d', '⭐ et Supabase le conserve aussi', (e.sb.foodLog || []).length === 1, e.sb.foodLog);

  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  const videSess = Object.assign({}, clone(base), { token: jA, sessions: [] });
  ecrireDeuxCotes(h, videSess, H_A);
  e = etatFinal(h);
  t('S3a', 'un `sessions: []` EXPLICITE est refuse par Apps Script',
    (e.as.sessions || []).length === 2, e.as.sessions);
  t('S3b', 'un `sessions: []` EXPLICITE est ecrit par Supabase (absence != vide)',
    (e.sb.sessions || []).length === 0, e.sb.sessions);

  console.log('\n=== S-RETRECI — envoi ampute (50 sur 500), pas vide ===');
  reinit(h);
  const gros = clone(base);
  gros.sessions = Array.from({ length: 500 }, (_, i) => ({ id: 'S' + i }));
  ecrireDeuxCotes(h, Object.assign({}, gros, { token: jA }), H_A);
  const amp = clone(gros); amp.sessions = amp.sessions.slice(0, 50);
  ecrireDeuxCotes(h, Object.assign({}, amp, { token: jA }), H_A);
  e = etatFinal(h);
  t('SR-a', 'Apps Script REFUSE un retrecissement brutal (500 -> 50)',
    (e.as.sessions || []).length === 500, (e.as.sessions || []).length);
  t('SR-b', '⛔ Supabase l ACCEPTE : le miroir tombe a 50',
    (e.sb.sessions || []).length === 50, (e.sb.sessions || []).length);

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== J1..J4 — jetons et multi-appareils ===');
  reinit(h);
  PG.poserJeton(BASE, H_C, CPT);
  let r = PG.enregistrer(BASE, H_C, { k: 'parC' });
  const r2 = PG.enregistrer(BASE, H_B, { k: 'parB' });
  t('J1', 'deux jetons actifs du meme compte ecrivent tous les deux', r.ok && r2.ok,
    [r.sortie, r2.sortie]);
  PG.revoquer(BASE, H_C);
  const rA = PG.enregistrer(BASE, H_C, { k: 'parC2' });
  const rB = PG.enregistrer(BASE, H_B, { k: 'parB2' });
  t('J2a', 'le jeton REVOQUE est refuse', !rA.ok, rA.sortie.slice(0, 80));
  t('J2b', 'l autre appareil du MEME compte continue', rB.ok, rB.sortie.slice(0, 80));
  t('J3', 'un jeton revoque ne peut plus ecraser un etat recent',
    (PG.lireBlob(BASE, CPT) || {}).k === 'parB2', PG.lireBlob(BASE, CPT));
  const rI = PG.enregistrer(BASE, H_INCONNU, { k: 'intrus' });
  t('J4a', 'un jeton INCONNU est refuse', !rI.ok, rI.sortie.slice(0, 80));
  t('J4b', 'et le refus est le MEME que pour un revoque (aucun oracle)',
    /identite/.test(rA.sortie) && /identite/.test(rI.sortie), [rA.sortie.slice(0, 40), rI.sortie.slice(0, 40)]);
  /* ⛔ ON NE REMET PAS H_C ACTIF : la contrainte de la table l'interdit, et c'est juste.
     H_A et H_B n'ont jamais ete touches, donc la suite du banc part d'un etat sain. */
  t('J5', 'une revocation ne se defait pas (contrainte de la table)',
    !PG.sql("update public.ft_jetons set revoque=false where hachage='" + H_C + "'", BASE).ok,
    'la contrainte ft_jetons_revocation_coherente doit refuser');

  console.log('\n=== I4 — un appareil ne choisit jamais le compte cible ===');
  PG.poserJeton(BASE, H_B, CPT);
  reinit(h);
  PG.enregistrer(BASE, H_B, { k: 'ecrit_par_B', email: AUTRE, compte: AUTRE });
  t('I4a', 'une adresse GLISSEE dans la charge ne detourne pas l ecriture',
    PG.lireBlob(BASE, AUTRE) === null && (PG.lireBlob(BASE, CPT) || {}).k === 'ecrit_par_B',
    { autre: PG.lireBlob(BASE, AUTRE), cpt: PG.lireBlob(BASE, CPT) });
  // cote Apps Script : jeton A + email B
  h.vider();
  const jAutre = h.poserJeton(AUTRE, 'appareil de l autre');
  h.sauver({ action: 'saveProfile', token: jAutre, email: CPT, name: 'TENTATIVE' });
  t('I4b', 'Apps Script ecrit le compte DU JETON, pas celui de la charge',
    (h.lire(AUTRE) || {}).profile !== undefined && h.lire(CPT) === null,
    { autre: !!h.lire(AUTRE), cpt: !!h.lire(CPT) });

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== ANCIEN CLIENT — il appelle encore `ft_miroir` ===');
  reinit(h);
  PG.enregistrer(BASE, H_A, clone(base));
  PG.miroirAncien(BASE, CPT, { name: 'ECRIT_PAR_ANCIEN_CLIENT' });
  let blob = PG.lireBlob(BASE, CPT);
  t('AC1', '⛔ l ancien client ECRASE tout le blob (remplacement integral)',
    blob && blob.name === 'ECRIT_PAR_ANCIEN_CLIENT' && blob.sessions === undefined, Object.keys(blob || {}));
  const rAnc = PG.miroirAncien(BASE, AUTRE, { name: 'COMPTE_CHOISI_PAR_LE_NAVIGATEUR' });
  t('AC2', '⛔⛔ et il choisit le compte cible librement (V2, toujours ouverte)',
    rAnc.ok && PG.lireBlob(BASE, AUTRE) !== null, rAnc.sortie.slice(0, 60));
  PG.miroirAncien(BASE, CPT, { name: 'X', token: 'FUITE_PAR_ANCIEN' });
  blob = PG.lireBlob(BASE, CPT);
  t('AC3', '⛔⛔⛔ l ancienne porte n a AUCUN filtre : un justificatif y entre',
    blob && blob.token === 'FUITE_PAR_ANCIEN', Object.keys(blob || {}));

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== I2 / S2-A — les justificatifs ne survivent pas a une ecriture moderne ===');
  const SENS = ['token', 'authCode', 'code', 'confirmCode', 'apikey', 'authorization'];
  reinit(h);
  const sale = {}; SENS.forEach((k) => { sale[k] = 'FUITE_' + k; }); sale.bw = 70;
  PG.miroirAncien(BASE, CPT, sale);                       // la fuite est posee par l ancienne porte
  PG.enregistrer(BASE, H_A, { bw: 80 });                  // une sauvegarde moderne passe
  blob = PG.lireBlob(BASE, CPT);
  t('I2a', '⭐ la sauvegarde moderne PURGE les 6 justificatifs deja presents',
    SENS.every((k) => !(k in (blob || {}))), Object.keys(blob || {}));
  t('I2b', 'et elle n emporte pas la donnee metier', blob && blob.bw === 80, blob);
  PG.enregistrer(BASE, H_A, sale);
  blob = PG.lireBlob(BASE, CPT);
  t('I2c', 'un justificatif ENVOYE par la voie moderne n entre pas non plus',
    SENS.every((k) => !(k in (blob || {}))), Object.keys(blob || {}));
  /* ⭐ TROU COMBLE : I2c ecrit sur une ligne EXISTANTE, donc il ne traverse que la branche
     `do update`. La branche `insert` (ligne NEUVE) a son propre retrait, et rien ne
     l'eprouvait — une mutation l'a montre en laissant I2c parfaitement vert. */
  PG.vider(BASE);
  PG.enregistrer(BASE, H_A, sale);
  const blobNeuf = PG.lireBlob(BASE, CPT);
  t('I2e', 'sur une ligne NEUVE aussi, aucun justificatif n entre',
    SENS.every((k) => !(k in (blobNeuf || {}))), Object.keys(blobNeuf || {}));
  const sale2 = {}; SENS.forEach((k) => { sale2[k] = null; });
  PG.enregistrer(BASE, H_A, sale2);
  blob = PG.lireBlob(BASE, CPT);
  t('I2d', 'meme a `null`, un justificatif n entre pas', SENS.every((k) => !(k in (blob || {}))),
    Object.keys(blob || {}));

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== OBJETS IMBRIQUES — la fusion est de SURFACE ===');
  reinit(h);
  PG.enregistrer(BASE, H_A, { registre: { cle: 'REG_BASE', sousobjet: { a: 1, b: 2 } } });
  PG.enregistrer(BASE, H_A, { registre: { sousobjet: { a: 9 } } });   // client partiel
  blob = PG.lireBlob(BASE, CPT);
  /* ⚠️ On ne dereference jamais un blob sans l avoir teste : une etape qui PLANTE ressemble
     trait pour trait a une passe verte (BUGS.md §61). */
  t('OI1', 'un client PARTIEL ecrase tout l objet imbrique (surface, mesure)',
    !!blob && !!blob.registre && blob.registre.cle === undefined
    && (blob.registre.sousobjet || {}).b === undefined, blob && blob.registre);
  // ⭐ et le contrat reel du client : envoie-t-il l objet complet ?
  const fs2 = require('fs');
  const setup = fs2.readFileSync(require('path').join(__dirname, '..', '..', 'setup.js'), 'utf8');
  t('OI2', 'le client servi envoie bien les objets ENTIERS (`registre:S.registre`)',
    /registre\s*:\s*S\.registre\b/.test(setup) || /registre\s*:\s*\(S\.registre/.test(setup),
    'motif cherche dans setup.js');

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== PANNES ET REPRISE ===');
  reinit(h);
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA }), H_A);
  // P1 : Supabase indisponible
  const p1 = ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA, bw: 81 }), H_A,
                             { sansSupabase: true });
  t('P1', 'Supabase absent : Apps Script recoit quand meme', p1.as.status === 'ok', p1.as);
  // P2 : Apps Script indisponible
  const p2 = ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA, bw: 82 }), H_A,
                             { sansAppsScript: true });
  t('P2', 'Apps Script absent : le miroir recoit quand meme', p2.sb.ok, p2.sb.sortie);
  t('P2b', '⛔ mais les deux destinations DIVERGENT pendant la panne',
    h.lire(CPT).profile.bw === 81 && PG.lireBlob(BASE, CPT).bw === 82,
    { as: h.lire(CPT).profile.bw, sb: PG.lireBlob(BASE, CPT).bw });
  // P6 : reprise — une sauvegarde complete recolle les deux
  ecrireDeuxCotes(h, Object.assign({}, clone(base), { token: jA, bw: 83 }), H_A);
  t('P6', 'la reprise recolle les deux destinations',
    h.lire(CPT).profile.bw === 83 && PG.lireBlob(BASE, CPT).bw === 83,
    { as: h.lire(CPT).profile.bw, sb: PG.lireBlob(BASE, CPT).bw });
  // I5 : l etat local n est jamais detruit par une panne cloud (aucun chemin n efface le local)
  note('I5', 'l etat local n est pas touche par ces chemins : `persist()` ecrit AVANT toute '
           + 'requete, et aucune reponse serveur ne declenche d effacement local (prouve par code)');

  // P5 / retry : le serveur a accepte, la reponse est perdue, le client rejoue
  console.log('\n=== RETRY / DOUBLE ECRITURE ===');
  reinit(h);
  const corpsR = Object.assign({}, clone(base), { token: jA });
  ecrireDeuxCotes(h, corpsR, H_A);
  /* ⚠️ CE TEMOIN A ETE CORRIGE APRES AVOIR ROUGI SUR DU CODE PARFAITEMENT SAIN.
     Ma premiere version comparait les deux etats EN ENTIER. Le seul ecart mesure etait
     `updatedAt`, l'horodatage d'ecriture serveur — qui DOIT bouger : c'est la trace du
     « derniere ecriture recue », pas une donnee metier.
     >> *Un temoin qui fige l'instantane entier mesure ma formulation, pas l'idempotence.*
     L'invariant juste a deux moities : ① les donnees METIER sont identiques ; ② aucune liste
     n'a grandi — c'est ainsi qu'un doublon se verrait. */
  const sansHorodatage = (x) => {
    const c = clone(x);
    if (c && c.as) { delete c.as.updatedAt; if (c.as.profile) delete c.as.profile.updatedAt; }
    return JSON.stringify(c);
  };
  const tailles = (x) => Object.keys(x.as || {}).filter((k) => Array.isArray(x.as[k]))
                           .map((k) => k + ':' + x.as[k].length).join(',');
  const e1 = etatFinal(h);
  const apres1 = sansHorodatage(e1); const t1 = tailles(e1);
  ecrireDeuxCotes(h, corpsR, H_A);          // le client rejoue EXACTEMENT le meme corps
  const e2 = etatFinal(h);
  const apres2 = sansHorodatage(e2); const t2 = tailles(e2);
  t('R1a', 'rejouer la MEME sauvegarde ne change AUCUNE donnee metier', apres1 === apres2,
    { taille1: apres1.length, taille2: apres2.length });
  t('R1b', 'et aucune liste n a grandi (donc aucun doublon)', t1 === t2 && t1.length > 0,
    { avant: t1, apres: t2 });
  t('R1c', 'seul l horodatage d ecriture bouge, et c est son role',
    e1.as.updatedAt !== undefined && e2.as.updatedAt !== undefined,
    { a: e1.as.updatedAt, b: e2.as.updatedAt });

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== RESTAURATION ET RESURRECTION ===');
  reinit(h);
  const dep = clone(base);
  dep.weightLog = dep.weightLog.concat([{ date: '2026-09-02', kg: 81, id: 'W_DELETED' }]);
  ecrireDeuxCotes(h, Object.assign({}, dep, { token: jA }), H_A);
  const sup = clone(dep); sup.weightLog = sup.weightLog.filter((x) => x.id !== 'W_DELETED');
  ecrireDeuxCotes(h, Object.assign({}, sup, { token: jA }), H_A);
  e = etatFinal(h);
  t('RS1', 'apres suppression + sauvegarde, la donnee est partie des DEUX destinations',
    !(e.as.weightLog || []).some((x) => x.id === 'W_DELETED')
    && !(e.sb.weightLog || []).some((x) => x.id === 'W_DELETED'),
    { as: e.as.weightLog, sb: e.sb.weightLog });
  // ... mais B, reste en arriere, la fait revenir
  ecrireDeuxCotes(h, Object.assign({}, dep, { token: jB }), H_B);
  e = etatFinal(h);
  t('RS2', '⛔ un appareil reste en arriere la fait REVENIR des deux cotes',
    (e.as.weightLog || []).some((x) => x.id === 'W_DELETED')
    && (e.sb.weightLog || []).some((x) => x.id === 'W_DELETED'), null);
  // I6 : une restauration n invente rien
  const idsAS = new Set((e.as.weightLog || []).map((x) => x.id));
  t('I6', 'la restauration ne rend que des entrees vues dans une source',
    Array.from(idsAS).every((i) => ['W_BASE', 'W_DELETED'].includes(i)), Array.from(idsAS));

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== CONCURRENCE REELLE (ecritures paralleles sur PostgreSQL) ===');
  reinit(h);
  PG.enregistrer(BASE, H_A, clone(base));
  const { execFileSync } = require('child_process');
  const N = 24;
  const cmds = Array.from({ length: N }, (_, i) =>
    `psql -h ${process.env.FT_PGSOCK || '/tmp/pg_s2b'} -p ${process.env.FT_PGPORT || '55432'} -U postgres -d ${BASE} -v ON_ERROR_STOP=1 -tA -c "select public.ft_enregistrer_instantane('${i % 2 ? H_A : H_B}', '{\\"tour\\":${i}}'::jsonb)" >/dev/null 2>&1 &`);
  let concOK = true; let concErr = '';
  try {
    execFileSync('bash', ['-c',
      'export PATH=/usr/lib/postgresql/16/bin:$PATH; ' + cmds.join(' ') + ' wait'],
      { encoding: 'utf8' });
  } catch (err) { concOK = false; concErr = String(err.message).slice(0, 120); }
  blob = PG.lireBlob(BASE, CPT);
  t('C1', N + ' ecritures concurrentes : aucune erreur SQL, aucun blocage', concOK, concErr);
  t('C2', 'l etat final reste un objet COHERENT (pas de blob corrompu)',
    blob && typeof blob === 'object' && typeof blob.tour === 'number', blob && Object.keys(blob));
  const cnt = PG.sql(`select count(*) from public.ft_comptes where email='${CPT}'`, BASE);
  t('C3', 'une seule ligne par compte, malgre la concurrence', cnt.sortie === '1', cnt.sortie);

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n=== FUZZ DETERMINISTE ===');
  const fuzz = require('./fuzz.js');
  const res = fuzz.lancer({ h, PG, BASE, H_A, H_B, jA, jB, CPT, compteBase, clone,
                            graines: (process.env.FT_GRAINES || '1,2,3,4,5,6,7,8')
                                       .split(',').map(Number),
                            parGraine: Number(process.env.FT_PAR_GRAINE || 60) });
  t('FZ1', 'aucun invariant viole sur ' + res.sequences + ' sequences ('
    + res.graines.length + ' graines)', res.violations.length === 0,
    res.violations.slice(0, 3));
  note('FZ2', 'graines employees : ' + res.graines.join(', ') + ' — '
       + res.etapes + ' etapes au total');

  // ─────────────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(74));
  console.log('TOTAL CHAOS : ' + OK + ' OK, ' + KO.length + ' rouge(s)');
  KO.forEach((k) => console.log('  - ' + k));
  return KO.length ? 1 : 0;
}

process.exit(main());
