#!/usr/bin/env node
'use strict';
/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   BANC « ENVOIS DE SYNCHRONISATION » — NUT-SYNC-03 (05/11/2026) — correctifs A (un seul envoi actif) et A2 (un accusé ne relance pas un envoi).
   POURQUOI. Le rapport C1–C6 du 05/11 a mesuré une RÉGRESSION de ft-v1264 (a87cc89d) : quand le serveur tarde, plusieurs `saveProfile` se chevauchent, le 2ᵉ part avec une révision
   périmée, le serveur le traite en CONFLIT contre l'appareil lui-même et garde les deux versions — jusqu'à 8 « Pates » sur le téléphone ET sur le serveur ; ft-v1263, sans révisions, n'en
   souffrait pas. Chaque bug devient un scénario permanent (R17/R35) : ce banc les rejoue tous, avant ET après correction, avec des contrôles négatifs (tools/mut_nut_sync_envoi.py).
   COMMENT. Le VRAI client (arbre `FT_ARBRE_CLIENT`, défaut = ce dépôt) dans Chromium, face à un faux Apps Script qui exécute le VRAI Code.js (voir tools/lib_banc_reseau.js). Le temps du navigateur
   est VIRTUEL (`page.clock`) et les lenteurs du serveur sont des PORTES que le banc ouvre : « réponse retardée de 120 s » se joue en quelques secondes.
   ⛔ TOUT EST SIMULÉ. Aucun test ici n'est une preuve sur réseau mobile (condition C1 : à jouer sur le projet de TEST avec Michel). Un scénario « RÉSIDUEL » documente une limite connue : il vérifie
   l'absence de PERTE, jamais l'absence de doublon.
   Usage : node tools/banc_nut_sync_envoi.js [--only=S03,S05] [--json=sortie.json]      FT_ARBRE_CLIENT=<arbre>  FT_ARBRE_ANCIEN=<arbre ft-v1263, pour S15>
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const L = require('./lib_banc_reseau.js');
const fs = require('fs');
const { verif, pause, J } = L;
const ARGS = process.argv.slice(2);
const ONLY = ((ARGS.find((a) => a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);
const JSONOUT = (ARGS.find((a) => a.startsWith('--json=')) || '').slice(7);
const veut = (id) => !ONLY.length || ONLY.includes(id);
const METR = {};
const metrique = (id, o) => { METR[id] = o; console.log('METRIQUE ' + id + ' ' + J(o)); };

/* ── temps virtuel + portes ───────────────────────────────────────────────────────────────────────────────────── */
async function avancer(D, ms, pas) {
  pas = pas || 1000; let fait = 0;
  while (fait < ms) {
    const p = Math.min(pas, ms - fait); await D.pg.clock.runFor(p); D.v += p; fait += p;
    D.portes = D.portes.filter((g) => { if (g.t <= D.v) { g.ouvrir(); return false; } return true; });
    await pause(25);
  }
  await pause(80);
}
function porte(D, apresMs) { let ouvrir; const pr = new Promise((r) => { ouvrir = r; }); if (apresMs <= 0) ouvrir(); else D.portes.push({ t: D.v + apresMs, ouvrir }); return pr; }

/* ── un appareil prêt : le vrai client chargé, son compte créé au serveur par la synchro de démarrage ───────────── */
async function pret(b, o) {
  o = o || {};
  const srv = o.srv || L.serveurDe(); if (!o.srv) srv.compte(L.EMAIL, { code: L.CODE, foodLog: [] });
  const apps = o.apps || await L.fauxAppsScript(srv);
  const st = await L.servirClient(o.arbre || L.ARBRE, apps.url);
  const D = await L.appareil(b, st.port, apps.url, { clock: true, stockage: L.stockageBase(L.journalReel(o.n || 60), o.seances == null ? 1 : o.seances, o.extra) });
  D.v = 0; D.portes = [];
  await D.charger(1500);
  await avancer(D, 7000); await pause(1500);                       // la synchro de démarrage (4 s virtuelles) part et est acquittée
  const f0 = (await D.fetchLog()).filter((x) => x.action === 'saveProfile').length;
  return { srv, apps, st, D, n0: apps.saves().length, v0: D.v, f0 };
}
async function fin(c) { try { await c.D.fermer(); } catch (e) {} try { c.st.s.close(); } catch (e) {} if (!c.partage) { try { c.apps.fermer(); } catch (e) {} } }

const nomsServeur = (c) => ((c.srv.lireCompte(L.EMAIL).profile.foodLog) || []).map((l) => ({ nom: l.name, q: l.q, rev: l.rev === undefined ? null : l.rev }));
const compte = (liste, nom) => liste.filter((l) => l.nom === nom).length;
const valeurs = (liste, nom) => liste.filter((l) => l.nom === nom).map((l) => l.q).sort((a, b) => a - b);
const cle = (liste) => liste.map((l) => l.nom + ':' + l.q).sort().join('|');
const doublons = (liste) => { const m = {}; liste.forEach((l) => { m[l.nom] = (m[l.nom] || 0) + 1; }); return Object.keys(m).filter((k) => m[k] > 1).map((k) => k + '×' + m[k]); };

async function convergence(c, maxS) {                                 // durée virtuelle jusqu'à ce que le serveur ait tout ce que le téléphone affiche (null = jamais)
  const t0 = c.D.v;
  for (let s = 0; s < maxS; s++) { await avancer(c.D, 1000); if (cle(await c.D.log()) === cle(nomsServeur(c))) return c.D.v - t0; }
  return null;
}
async function calme(c, maxS) {                                       // plus aucun envoi en cours ni nouveau pendant 15 s virtuelles
  maxS = maxS || 600;
  for (let s = 0; s < maxS; s += 15) {
    const n = (await c.D.fetchLog()).length; await avancer(c.D, 15000); await pause(150);
    const ouverts = await c.D.ev(() => window.__ouverts ? window.__ouverts.size : 0);
    if ((await c.D.fetchLog()).length === n && ouverts === 0) return s + 15;
  }
  return null;
}
async function releve(c, extra) {
  const local = await c.D.log(), serveur = nomsServeur(c), e = await c.D.etatNut();
  const fl = (await c.D.fetchLog()).filter((x) => x.action === 'saveProfile');
  const toasts = (await c.D.toasts()).map((x) => x.m);
  return Object.assign({ local, serveur, etat: e, volMax: await c.D.volMax(), envois: c.apps.saves().length - c.n0, octets: c.apps.octetsSave(), toastsConflit: toasts.filter((m) => /autre appareil/.test(m)).length, toasts: toasts.length,
    erreursJS: c.D.erreurs.slice(0, 3), egal: cle(local) === cle(serveur) }, extra || {});
}
const GESTES = [[0, "__ajouter('Pates', 150)"], [6, "__modifier('Pates', 100)"], [12, "__ajouter('Sauce', 100)"], [20, "__modifier('Pates', 80)"], [30, "__ajouter('Yaourt', 125)"]];
/* « tout PENDANT le vol » : la dernière modification tombe dans la fenêtre du 1er envoi (réponse retenue ≥ 20 s) — seule une demande GARDÉE puis rejouée peut la porter au serveur. */
const GESTES_VOL = [[0, "__ajouter('Pates', 150)"], [6, "__modifier('Pates', 100)"], [10, "__ajouter('Sauce', 100)"], [15, "__modifier('Pates', 80)"], [18, "__ajouter('Yaourt', 125)"]];
async function jouerGestes(c, gestes) { const t0 = c.D.v; for (const [t, g] of gestes) { await avancer(c.D, Math.max(0, t0 + t * 1000 - c.D.v)); await c.D.ev(g); } }
/* les invariants communs d'un scénario « Pates / Sauce / Yaourt » */
function inv(id, r, o) {
  o = o || {};
  verif(id + ' un seul envoi actif à la fois (jamais 2 requêtes simultanées de cet appareil)', r.volMax === 1, r.volMax);
  verif(id + ' « Pates » : UNE seule ligne, à la dernière valeur (80), sur le téléphone ET sur le serveur', compte(r.local, 'Pates') === 1 && compte(r.serveur, 'Pates') === 1 && valeurs(r.local, 'Pates')[0] === 80 && valeurs(r.serveur, 'Pates')[0] === 80, [valeurs(r.local, 'Pates'), valeurs(r.serveur, 'Pates')]);
  verif(id + ' « Sauce » et « Yaourt » présents une fois, des deux côtés', ['Sauce', 'Yaourt'].every((n) => compte(r.local, n) === 1 && compte(r.serveur, n) === 1), ['Sauce', 'Yaourt'].map((n) => [compte(r.local, n), compte(r.serveur, n)]));
  verif(id + ' aucun doublon nulle part, téléphone = serveur', doublons(r.local).length === 0 && doublons(r.serveur).length === 0 && r.egal, [doublons(r.local), doublons(r.serveur), r.egal]);
  verif(id + ' aucun faux message « modifié sur un autre appareil » (c\'est le même téléphone)', r.toastsConflit === 0, r.toastsConflit);
  verif(id + ' tout est confirmé à la fin (aucun accusé attendu, aucune suppression en attente)', r.etat.aConfirmer === false && r.etat.nAttente === 0, r.etat);
  if (o.maxEnvois != null) verif(id + ' envois contenus (≤ ' + o.maxEnvois + ')', r.envois <= o.maxEnvois, r.envois);
}

/* ══ S01 → S05 : réponse immédiate, puis retardée de 5 / 20 / 60 / 120 s (le serveur a APPLIQUÉ, la réponse tarde) ═════════════════════════════════════ */
async function sReponse(b, id, X, maxEnvois, gestes) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' && X ? { gateResp: porte(c.D, X * 1000) } : {});
  await jouerGestes(c, gestes || GESTES);
  const conv = await convergence(c, 500);
  await calme(c, 900);
  const r = await releve(c); metrique(id, { X, envois: r.envois, volMax: r.volMax, convergence_s: conv === null ? null : Math.round(conv / 1000), pates: [r.local, r.serveur].map((l) => valeurs(l, 'Pates')), toastsConflit: r.toastsConflit, octets: r.octets });
  inv(id, r, { maxEnvois }); verif(id + ' convergence : tout est au serveur ≤ ' + (2 * X + 60) + ' s virtuelles après la dernière modification (la garde ne retient pas les envois)', conv !== null && conv <= (2 * X + 60) * 1000, conv === null ? 'jamais' : Math.round(conv / 1000) + ' s');
  await fin(c);
}
/* ══ S06 : téléversement lent (le corps est complet côté serveur mais rien n'est appliqué pendant X s) ════════════════════════════════════════════════ */
async function sUpload(b, id, X, maxEnvois) {
  const c = await pret(b, { n: 400 });
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateApply: porte(c.D, X * 1000) } : {});
  await jouerGestes(c, GESTES);
  const conv = await convergence(c, 500);
  await calme(c, 900);
  const r = await releve(c); metrique(id, { X, envois: r.envois, volMax: r.volMax, convergence_s: conv === null ? null : Math.round(conv / 1000), pates: [r.local, r.serveur].map((l) => valeurs(l, 'Pates')), toastsConflit: r.toastsConflit, octets: r.octets });
  inv(id, r, { maxEnvois }); verif(id + ' convergence : tout est au serveur ≤ ' + (2 * X + 60) + ' s virtuelles après la dernière modification', conv !== null && conv <= (2 * X + 60) * 1000, conv === null ? 'jamais' : Math.round(conv / 1000) + ' s');
  await fin(c);
}
/* ══ S07 : réponse ABSENTE (l'écho ne vient jamais) — l'envoi reste « en cours » ; le client ne doit ni se bloquer à vie ni perdre l'ajout fait pendant ce temps ═══ */
async function sAbsente(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' && i.nSave === c.n0 + 1 ? { echo: { mode: 'hang' } } : {});
  await c.D.ev("__ajouter('Premier', 100)"); await avancer(c.D, 6000);              // part, appliqué, mais la réponse n'arrive jamais
  await c.D.ev("__ajouter('Pendant le blocage', 90)");
  const t0 = c.D.v; let delai = null;
  for (let s = 0; s < 400 && delai === null; s += 5) { await avancer(c.D, 5000, 1000); if (nomsServeur(c).some((l) => l.nom === 'Pendant le blocage')) delai = c.D.v - t0; }
  await calme(c, 300); const r = await releve(c);
  metrique('S07', { delai_ms: delai, envois: r.envois, volMax: r.volMax });
  verif('S07 l\'ajout fait PENDANT le blocage finit sur le serveur (jamais abandonné en silence)', delai !== null, delai);
  verif('S07 …dans un délai maîtrisé (≤ 200 s virtuelles : la temporisation libère l\'envoi bloqué)', delai !== null && delai <= 200000, delai);
  verif('S07 aucune perte, aucun doublon, téléphone = serveur', compte(r.serveur, 'Premier') === 1 && compte(r.serveur, 'Pendant le blocage') === 1 && doublons(r.local).length === 0 && r.egal, [doublons(r.local), r.egal]);
  verif('S07 tout est confirmé à la fin', r.etat.aConfirmer === false, r.etat);
  await fin(c);
}
/* ══ S07c : un accusé qui arrive APRÈS l'échéance (réponse très lente) ne doit pas libérer la garde de l'envoi suivant — jamais 2 envois simultanés ══════════════════ */
async function sTardif(b) {
  const c = await pret(b); let ouvrir1 = null; const gate1 = new Promise((r) => { ouvrir1 = r; });
  c.apps.faute = (i) => (i.action === 'saveProfile' ? (i.nSave === c.n0 + 1 ? { gateResp: gate1 } : { gateResp: porte(c.D, 150000) }) : {});
  await c.D.ev("__ajouter('Un', 100)"); await avancer(c.D, 5000);                       // 1er envoi : appliqué, réponse retenue (très lente)
  await c.D.ev("__ajouter('Deux', 90)"); await avancer(c.D, 200000, 2000);                // l'échéance passe (180 s) : « non confirmé », le 2e envoi part (réponse retenue 150 s)
  const enVol2 = (c.apps.saves().length - c.n0) >= 2;
  ouvrir1();                                                                             // la réponse du 1er arrive enfin — pendant le vol du 2e
  await avancer(c.D, 3000, 1000); await c.D.ev("__ajouter('Trois', 80)"); await avancer(c.D, 10000, 1000);
  const pendant = c.apps.saves().length - c.n0;
  await avancer(c.D, 400000, 4000);                                                     // on laisse les portes du temps virtuel se vider : `calme` ne voit pas un envoi dont l'échéance a déjà retiré l'identifiant des « ouverts »
  await calme(c, 900); const r = await releve(c);
  metrique('S07c', { envois: r.envois, pendant, volMax: r.volMax });
  verif('S07c le 2e envoi est bien parti après l\'échéance (le 1er n\'a jamais bloqué la synchro)', enVol2, c.apps.saves().length - c.n0);
  verif('S07c l\'accusé TARDIF du 1er envoi ne libère pas la garde du 2e : jamais 2 envois simultanés', r.volMax === 1 && pendant === 2, [r.volMax, pendant]);
  verif('S07c tout finit au serveur, une fois chacun, aucun doublon', ['Un', 'Deux', 'Trois'].every((n) => compte(r.serveur, n) === 1) && doublons(r.local).length === 0 && r.egal, [doublons(r.local), r.egal]);
  await fin(c);
}
/* ══ S07b RÉSIDUEL : accusé PERDU puis retouche du même repas (la révision du serveur est inconnue du téléphone) ════════════════════════════════════════ */
async function sAccuseePerdu(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' && i.nSave === c.n0 + 1 ? { echo: { mode: 'hang' } } : {});
  await c.D.ev("__ajouter('Perdu', 150)"); await avancer(c.D, 6000);
  await c.D.ev("__modifier('Perdu', 90)"); await avancer(c.D, 240000, 2000); await calme(c, 300);
  const r = await releve(c);
  metrique('S07b', { perdu: valeurs(r.serveur, 'Perdu'), local: valeurs(r.local, 'Perdu') });
  verif('S07b [RÉSIDUEL — protocole, pas la garde] aucune PERTE : la version à 90 g existe sur le serveur et le téléphone', valeurs(r.serveur, 'Perdu').includes(90) && valeurs(r.local, 'Perdu').includes(90), [valeurs(r.serveur, 'Perdu'), valeurs(r.local, 'Perdu')]);
  await fin(c);
}
/* ══ S08 : coupure réseau puis retour de connexion ═════════════════════════════════════════════════════════════════════════════════════════════════ */
async function sCoupure(b, variante) {
  const id = 'S08' + variante, c = await pret(b);
  const victime = (await c.D.log())[7].nom;
  if (variante === 'a') c.apps.faute = (i) => (i.action === 'saveProfile' ? { cutUploadAt: Math.floor(i.contentLength / 2) } : {});
  if (variante === 'b') await c.D.cx.setOffline(true);
  await c.D.ev('__supprimer(' + J(victime) + ')'); await c.D.ev("__ajouter('Hors ligne', 120)");
  await avancer(c.D, 4000); await c.D.ev("__modifier('Hors ligne', 130)");     // une retouche PENDANT l'envoi qui échoue
  await avancer(c.D, 10 * 60000, 5000);
  const tentatives = (await c.D.fetchLog()).filter((x) => x.action === 'saveProfile').length - c.f0;
  const locale = await c.D.log(), disque = await c.D.disque(), vm = await c.D.volMax();
  const perte = { ajout: locale.some((l) => l.nom === 'Hors ligne' && l.q === 130) && disque.some((l) => l.name === 'Hors ligne' && l.q === 130), victime: locale.some((l) => l.nom === victime) || disque.some((l) => l.name === victime) };
  c.apps.faute = null; if (variante === 'b') await c.D.cx.setOffline(false);
  let delai = null;
  for (let s = 0; s < 20 * 60 && delai === null; s += 5) { await avancer(c.D, 5000, 1000); await pause(60); const e = await c.D.etatNut(); const sv = nomsServeur(c); if (e.nAttente === 0 && e.aConfirmer === false && sv.some((l) => l.nom === 'Hors ligne' && l.q === 130) && !sv.some((l) => l.nom === victime)) delai = s + 5; }
  await calme(c, 300); const r = await releve(c);
  metrique(id, { tentativesPendantPanne: tentatives, delaiRetour_s: delai, volMax: r.volMax, envois: r.envois });
  verif(id + ' aucune perte pendant la panne : la retouche (130 g) est à l\'écran ET sur disque, la suppression aussi', perte.ajout && !perte.victime, perte);
  verif(id + ' un seul envoi actif à la fois, même pendant la panne', vm === 1 && r.volMax === 1, [vm, r.volMax]);
  verif(id + ' pas de boucle d\'envois pendant 10 min de panne (≤ 12 tentatives)', tentatives <= 12, tentatives);
  verif(id + ' convergence au retour : l\'ajout (130 g) est au serveur, le repas supprimé n\'y est plus, rien n\'est en attente', delai !== null, delai);
  verif(id + ' aucun doublon, téléphone = serveur', doublons(r.local).length === 0 && doublons(r.serveur).length === 0 && r.egal, [doublons(r.local), r.egal]);
  if (variante === 'b') verif(id + ' retour du réseau (événement « online ») : confirmé en ≤ 60 s virtuelles', delai !== null && delai <= 60, delai);
  await fin(c);
}
/* ══ S09 : douze retouches du même repas en 20 s, réponse lente ═════════════════════════════════════════════════════════════════════════════════ */
async function sRepetee(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 8000) } : {});
  await c.D.ev("__ajouter('Riz', 100)");
  for (let k = 0; k < 12; k++) { await avancer(c.D, 1500); await c.D.ev('__modifier("Riz", ' + (110 + k * 10) + ')'); }
  await calme(c, 600); const r = await releve(c);
  metrique('S09', { envois: r.envois, volMax: r.volMax, riz: valeurs(r.serveur, 'Riz') });
  verif('S09 un seul envoi actif à la fois', r.volMax === 1, r.volMax);
  verif('S09 « Riz » : UNE ligne, à la dernière valeur (220), des deux côtés', compte(r.local, 'Riz') === 1 && compte(r.serveur, 'Riz') === 1 && valeurs(r.serveur, 'Riz')[0] === 220 && valeurs(r.local, 'Riz')[0] === 220, [valeurs(r.local, 'Riz'), valeurs(r.serveur, 'Riz')]);
  verif('S09 aucun faux message de conflit, tout confirmé', r.toastsConflit === 0 && r.etat.aConfirmer === false, [r.toastsConflit, r.etat]);
  verif('S09 envois contenus (≤ 8 pour 13 gestes : les retouches se regroupent)', r.envois <= 8, r.envois);
  await fin(c);
}
/* ══ S10 : ajout, édition et suppression PENDANT un envoi (dont la suppression d'un repas créé pendant cet envoi) ══════════════════════════════════════ */
async function sPendant(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 20000) } : {});
  const j0 = await c.D.log(); const A = j0[3].nom, Bn = j0[4].nom;
  await c.D.ev("__ajouter('Nouveau1', 100)"); await avancer(c.D, 5000);           // l'envoi part, appliqué, réponse retenue 20 s
  await c.D.ev('__modifier(' + J(A) + ', 222)'); await c.D.ev('__supprimer(' + J(Bn) + ')'); await c.D.ev("__ajouter('Nouveau2', 80)"); await c.D.ev("__supprimer('Nouveau1')");
  await calme(c, 900); let r = await releve(c);
  metrique('S10', { envois: r.envois, volMax: r.volMax });
  const attendu = (x) => compte(x, 'Nouveau2') === 1 && compte(x, 'Nouveau1') === 0 && compte(x, Bn) === 0 && valeurs(x, A)[0] === 222 && valeurs(x, A).length === 1;
  verif('S10 un seul envoi actif à la fois', r.volMax === 1, r.volMax);
  verif('S10 téléphone ET serveur : « Nouveau2 » présent, « Nouveau1 » et ' + Bn.slice(0, 18) + '… supprimés, le repas édité à 222 g', attendu(r.local) && attendu(r.serveur), [attendu(r.local), attendu(r.serveur)]);
  verif('S10 les deux suppressions sont CONFIRMÉES par le serveur (rien en attente)', r.etat.nAttente === 0 && r.etat.nSupConf === 2 && r.etat.aConfirmer === false, r.etat);
  verif('S10 aucun doublon, aucun faux message de conflit', doublons(r.local).length === 0 && doublons(r.serveur).length === 0 && r.toastsConflit === 0, [doublons(r.local), r.toastsConflit]);
  const dsk = await c.D.disque();
  verif('S10 les révisions apprises par les accusés sont ÉCRITES sur le téléphone (A2 : on écrit sans renvoyer)', dsk.filter((l) => l.name === 'Nouveau2').every((l) => Number.isSafeInteger(l.rev) && l.rev >= 1) && dsk.some((l) => l.name === 'Nouveau2'), dsk.filter((l) => l.name === 'Nouveau2').map((l) => l.rev));
  await c.D.recharger(1800); await avancer(c.D, 7000); await calme(c, 300); r = await releve(c);   // « restauration » au redémarrage : rien ne ressuscite
  verif('S10 après fermeture/réouverture : les suppressions ne REVIENNENT pas, aucun doublon', attendu(r.local) && attendu(r.serveur) && doublons(r.local).length === 0, [attendu(r.local), attendu(r.serveur), doublons(r.local)]);
  await fin(c);
}
/* ══ S11 : plusieurs appareils (même compte, même serveur) ═══════════════════════════════════════════════════════════════════════════════════════════
   ⚠️ CE QUE LE PRODUIT FAIT VRAIMENT (relu dans app.js, démarrage) : un appareil déjà en service ne TIRE PAS le journal des autres au démarrage — il n'en reçoit que les suppressions, les masquages et le profil ; le journal
   se récupère par « Restaurer ». Chaque appareil envoie donc tout SON journal. Le scénario respecte ça : les deux appareils ne touchent que des lignes DISJOINTES (des ajouts, une suppression), jamais une ligne que l'autre a
   déjà changée — sinon c'est le cas S11d, documenté à part comme limite du protocole (mesurée identique avant/après la correction). */
async function sMulti(b) {
  const srv = L.serveurDe(); srv.compte(L.EMAIL, { code: L.CODE, foodLog: [] });
  const apps = await L.fauxAppsScript(srv);
  const A = await pret(b, { srv, apps }); A.partage = true;
  const B = await pret(b, { srv, apps }); B.partage = true;
  const jr = await A.D.log(); const m3 = jr[3].nom;
  A.n0 = B.n0 = apps.saves().length;
  apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(A.D, 15000) } : {});    // A.D.v et B.D.v avancent ensemble ci-dessous
  B.D.portes = A.D.portes;
  const ensemble = async (ms) => { for (let s = 0; s < ms; s += 1000) { await Promise.all([A.D.pg.clock.runFor(1000), B.D.pg.clock.runFor(1000)]); A.D.v += 1000; B.D.v += 1000; A.D.portes = A.D.portes.filter((g) => { if (g.t <= A.D.v) { g.ouvrir(); return false; } return true; }); B.D.portes = A.D.portes; await pause(30); } await pause(100); };
  await A.D.ev("__ajouter('AjoutA', 50)"); await B.D.ev('__supprimer(' + J(m3) + ')'); await B.D.ev("__ajouter('AjoutB', 60)");
  await ensemble(4000); await A.D.ev("__ajouter('AjoutA2', 55)"); await B.D.ev("__ajouter('AjoutB2', 65)"); await ensemble(3000); await B.D.ev("__modifier('AjoutB', 70)");
  await ensemble(120000);
  for (const X of [A, B]) { await X.D.recharger(1800); }
  await ensemble(9000); await ensemble(60000);
  const sv = nomsServeur(A), la = await A.D.log(), lb = await B.D.log();
  const bonS = (x) => ['AjoutA', 'AjoutA2', 'AjoutB', 'AjoutB2'].every((n) => compte(x, n) === 1) && valeurs(x, 'AjoutB')[0] === 70 && compte(x, m3) === 0;
  metrique('S11', { volMax: [await A.D.volMax(), await B.D.volMax()], doublons: [doublons(la), doublons(lb), doublons(sv)], nA: la.length, nB: lb.length, nS: sv.length });
  verif('S11 serveur : tous les ajouts des DEUX appareils, la retouche (AjoutB à 70 g) et la suppression, chacun UNE fois', bonS(sv), [sv.filter((l) => /^Ajout/.test(l.nom)).map((l) => l.nom + ':' + l.q), compte(sv, m3)]);
  verif('S11 chaque appareil garde SES ajouts (aucune perte) ; la suppression de B est arrivée sur A par le profil, sans ressusciter', ['AjoutA', 'AjoutA2'].every((n) => compte(la, n) === 1) && ['AjoutB', 'AjoutB2'].every((n) => compte(lb, n) === 1) && compte(la, m3) === 0 && compte(lb, m3) === 0, [compte(la, m3), compte(lb, m3)]);
  verif('S11 un seul envoi actif à la fois sur CHAQUE appareil', (await A.D.volMax()) === 1 && (await B.D.volMax()) === 1, [await A.D.volMax(), await B.D.volMax()]);
  verif('S11 aucun doublon (appareils et serveur)', doublons(la).length === 0 && doublons(lb).length === 0 && doublons(sv).length === 0, [doublons(la), doublons(lb), doublons(sv)]);
  // S11b : VRAI conflit — les deux appareils retouchent le MÊME repas, différemment : les deux versions sont gardées au serveur (c'est voulu), aucun appareil ne perd la sienne
  apps.faute = null; const m5 = jr[5].nom;
  await A.D.ev('__modifier(' + J(m5) + ', 333)'); await B.D.ev('__modifier(' + J(m5) + ', 444)'); await ensemble(40000);
  const sv2 = nomsServeur(A), la2 = await A.D.log(), lb2 = await B.D.log();
  verif('S11b vrai conflit (même repas, deux valeurs) : les DEUX versions sont au serveur, chaque appareil garde la sienne, aucune perte', valeurs(sv2, m5).join() === '333,444' && valeurs(la2, m5).includes(333) && valeurs(lb2, m5).includes(444), [valeurs(sv2, m5), valeurs(la2, m5), valeurs(lb2, m5)]);
  // S11d RÉSIDUEL : appareil PÉRIMÉ — B n'a pas vu la retouche faite par A sur m1 ; en envoyant un ajout sans rapport, B renvoie sa vieille copie de m1 : conflit (mesuré identique avant/après la correction)
  const m1 = jr[1].nom; await A.D.ev('__modifier(' + J(m1) + ', 111)'); await ensemble(30000); await B.D.ev("__ajouter('AjoutB3', 40)"); await ensemble(40000);
  const sv3 = nomsServeur(A), lb3 = await B.D.log();
  metrique('S11d', { m1_serveur: valeurs(sv3, m1), m1_B: valeurs(lb3, m1) });
  verif('S11d [RÉSIDUEL — protocole : un appareil périmé renvoie ses vieilles lignes] aucune PERTE : la retouche de A (111 g) est au serveur, l\'ajout de B aussi', valeurs(sv3, m1).includes(111) && compte(sv3, 'AjoutB3') === 1, [valeurs(sv3, m1), compte(sv3, 'AjoutB3')]);
  await fin(A); await fin(B); apps.fermer();
}
/* ══ S11c : « modifié ici, supprimé ailleurs » — la suppression gagne, et A2 n'ajoute AUCUN envoi (la suppression vient du compte : déjà confirmée) ═══════════════════════ */
async function sRejet(b) {
  const srv = L.serveurDe(); srv.compte(L.EMAIL, { code: L.CODE, foodLog: [] });
  const apps = await L.fauxAppsScript(srv);
  const A = await pret(b, { srv, apps }); A.partage = true; const B = await pret(b, { srv, apps }); B.partage = true;
  const m = (await A.D.log())[2].nom; A.n0 = B.n0 = apps.saves().length;
  await A.D.ev('__supprimer(' + J(m) + ')'); await avancer(A.D, 9000); await pause(800);          // A supprime, le serveur l'enregistre
  const nB0 = apps.saves().length;
  await B.D.ev('__modifier(' + J(m) + ', 999)'); await avancer(B.D, 9000); await pause(800);      // B (qui l'ignore) retouche : le serveur refuse (NUT_ENTRY_DELETED)
  await calme(B, 300); const lb = await B.D.log(), eb = await B.D.etatNut();
  metrique('S11c', { envoisB: apps.saves().length - nB0, etatB: eb });
  verif('S11c la ligne retouchée ici mais supprimée ailleurs part du téléphone B (la suppression gagne)', !lb.some((l) => l.nom === m), lb.length);
  verif('S11c la suppression gagnée du compte est déjà CONFIRMÉE sur B (rien en attente, aucun accusé attendu)', eb.nAttente === 0 && eb.nSupConf >= 1 && eb.aConfirmer === false, eb);
  verif('S11c A2 : aucun envoi de plus pour ça — B n\'envoie qu\'une fois (avant correction : 2)', apps.saves().length - nB0 <= 1, apps.saves().length - nB0);
  await fin(A); await fin(B); apps.fermer();
}
/* ══ S12 : fermeture / réouverture, retour au premier plan ═══════════════════════════════════════════════════════════════════════════════════════════ */
async function sFermeture(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 600000) } : {});          // la réponse ne viendra jamais avant la fermeture
  await c.D.ev("__ajouter('Avant fermeture', 100)"); await avancer(c.D, 5000);
  await c.D.ev("__ajouter('Pendant', 70)");
  const disque = await c.D.disque();
  verif('S12a les deux repas sont déjà SUR LE DISQUE avant la fermeture (local d\'abord)', disque.some((l) => l.name === 'Avant fermeture') && disque.some((l) => l.name === 'Pendant'), disque.length);
  c.apps.faute = null; await c.D.recharger(1800); await avancer(c.D, 8000); await calme(c, 300);
  const r = await releve(c);
  verif('S12a après réouverture : les deux repas sont au serveur, une fois chacun, aucun doublon', compte(r.serveur, 'Avant fermeture') === 1 && compte(r.serveur, 'Pendant') === 1 && doublons(r.local).length === 0 && r.egal, [doublons(r.local), r.egal]);
  // S12b : retour au premier plan / retour réseau PENDANT un envoi — jamais un 2ᵉ envoi simultané
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 40000) } : {});
  const sup = (await c.D.log())[10].nom; await c.D.ev('__supprimer(' + J(sup) + ')'); await avancer(c.D, 5000);
  for (let k = 0; k < 5; k++) { await c.D.ev(() => { window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange')); }); await avancer(c.D, 3000); }
  c.apps.faute = null; await calme(c, 600); const r2 = await releve(c);
  verif('S12b retour au premier plan et retour réseau répétés PENDANT un envoi : un seul envoi actif à la fois', r2.volMax === 1, r2.volMax);
  verif('S12b la suppression est confirmée, aucun doublon', r2.etat.nAttente === 0 && doublons(r2.local).length === 0 && doublons(r2.serveur).length === 0, [r2.etat, doublons(r2.local)]);
  await fin(c);
}
async function sFermetureResiduel(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 600000) } : {});
  await c.D.ev("__ajouter('Pates', 150)"); await avancer(c.D, 5000); await c.D.ev("__modifier('Pates', 100)");
  c.apps.faute = null; await c.D.recharger(1800); await avancer(c.D, 8000); await calme(c, 300);
  const r = await releve(c);
  metrique('S12c', { pates: valeurs(r.serveur, 'Pates') });
  verif('S12c [RÉSIDUEL — l\'accusé est perdu avec la page fermée] aucune PERTE : la version à 100 g existe au serveur et sur le téléphone', valeurs(r.serveur, 'Pates').includes(100) && valeurs(r.local, 'Pates').includes(100), [valeurs(r.serveur, 'Pates'), valeurs(r.local, 'Pates')]);
  await fin(c);
}
/* ══ S13 : accusés périmés, doublés, reçus dans le désordre (appel direct de `_nutTraiterReponse`) ═════════════════════════════════════════════════════ */
async function sAccuses(b) {
  const c = await pret(b); await c.D.ev("__ajouter('Cible', 100)"); await avancer(c.D, 6000); await calme(c, 120);
  const L0 = (await c.D.log()).find((l) => l.nom === 'Cible'); const r0 = L0.rev;
  const rejouer = (rev, extra, rid) => c.D.ev((a) => { const envoi = { requestId: a.rid, sup: [], favoris: null }; const d = { ok: true, requestId: a.rid, nut: Object.assign({ acks: [{ i: S.foodLog.find((l) => l.name === 'Cible').id, r: a.rev }], conflits: [], rejets: [], complet: false, tomb: { v: 1, ok: [], diff: [], n: 0 } }, a.extra || {}) }; return _nutTraiterReponse(d, envoi); }, { rev, extra, rid: rid || 'rq' + Math.random().toString(36).slice(2, 12) });
  const revDe = async () => (await c.D.log()).find((l) => l.nom === 'Cible').rev;
  const n0 = (await c.D.fetchLog()).length;
  await rejouer(r0 + 2); verif('S13 un accusé qui fait avancer la révision est appliqué', (await revDe()) === r0 + 2, [r0, await revDe()]);
  await rejouer(r0 + 1); verif('S13 accusé PÉRIMÉ (révision plus ancienne) : jamais en arrière', (await revDe()) === r0 + 2, await revDe());
  await rejouer(r0 + 2); verif('S13 accusé DOUBLÉ : sans effet', (await revDe()) === r0 + 2, await revDe());
  await rejouer(r0 + 4); await rejouer(r0 + 3); verif('S13 accusés dans le DÉSORDRE (r+4 puis r+3) : la plus haute reste', (await revDe()) === r0 + 4, await revDe());
  await avancer(c.D, 30000); const n1 = (await c.D.fetchLog()).length;
  verif('S13 aucun de ces accusés ne déclenche un nouvel envoi (révision seule → pas de renvoi)', n1 === n0, [n0, n1]);
  // un conflit doublé : le serveur rend sa version ; la 1re fois la version de la personne devient un repas neuf, la 2ᵉ n'en refait pas
  const idc = await c.D.ev(() => S.foodLog.find((l) => l.name === 'Cible').id);
  const ligneServeur = await c.D.ev(() => { const l = JSON.parse(JSON.stringify(S.foodLog.find((x) => x.name === 'Cible'))); l.q = 777; l.kcal = 1; l.rev = 9; return l; });
  const avantN = (await c.D.log()).length;
  await rejouer(r0 + 5, { conflits: [{ i: idc, r: 9, ligne: ligneServeur }] }, 'rqconf0001');
  const apres1 = (await c.D.log()).length; await rejouer(r0 + 5, { conflits: [{ i: idc, r: 9, ligne: ligneServeur }] }, 'rqconf0002');
  const apres2 = (await c.D.log()).length;
  verif('S13 conflit rendu DEUX FOIS : la version de la personne est gardée UNE fois (pas de 2ᵉ copie)', apres1 === avantN + 1 && apres2 === apres1, [avantN, apres1, apres2]);
  const rid = 'rq' + 'z'.repeat(10);
  await c.D.ev((a) => { const envoi = { requestId: a, sup: [], favoris: null }; _nutTraiterReponse({ ok: true, requestId: 'autrechose00', nut: { acks: [{ i: S.foodLog[0].id, r: 99 }] } }, envoi); }, rid);
  verif('S13 accusé d\'une AUTRE requête : ignoré (aucune révision apprise)', (await c.D.log())[0].rev !== 99, (await c.D.log())[0].rev);
  await fin(c);
}
/* ══ S14 : séances, records, pesées voyagent dans le même envoi — jamais perdus (envoi lent ; puis suspension Nutrition du serveur) ══════════════════════ */
async function sAutres(b) {
  const extra = { ft4_wlog: J([{ date: '2026-10-01', kg: 80.2 }, { date: '2026-10-08', kg: 79.9 }]) };
  const c = await pret(b, { seances: 150, extra });
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 20000) } : {});
  await c.D.ev("__ajouter('Pates', 150)"); await avancer(c.D, 5000);
  await c.D.ev(() => { S.weightLog.push({ date: '2026-11-05', kg: 79.5 }); S.prs['Développé couché'] = { rm1: 100, kg: 90, reps: 3, date: '2026-11-05' }; S.sessions.unshift({ id: 'sneuve', ts: Date.now(), date: '2026-11-05', exs: [{ name: 'Squat', sets: [{ kg: 100, reps: 5, done: true, type: 'N', rm1: 117 }] }], vol: 500, duration: 3000 }); persist(); });
  await c.D.ev("__modifier('Pates', 100)"); await calme(c, 900);
  const p = c.srv.lireCompte(L.EMAIL); const loc = await c.D.ev(() => ({ s: S.sessions.length, w: S.weightLog.length, p: Object.keys(S.prs).length }));
  verif('S14a séance, record et pesée ajoutés PENDANT un envoi lent : au serveur après la réponse (151 séances, 3 pesées, 2 records)', (p.sessions || []).length === 151 && (p.weightLog || p.profile.weightLog || []).length === 3 && Object.keys(p.prs || {}).length === 2, [(p.sessions || []).length, (p.weightLog || p.profile.weightLog || []).length, Object.keys(p.prs || {}).length, loc]);
  verif('S14a téléphone = serveur (séances) et un seul envoi actif', loc.s === (p.sessions || []).length && (await c.D.volMax()) === 1, [loc.s, (p.sessions || []).length]);
  // S14b : le serveur SUSPEND le Nutrition (NUT_SUSPENDU) : séances/pesées passent, le Nutrition attend, puis reprend sans doublon
  c.srv.props.NUT_SUSPENDU = '1'; c.apps.faute = null;
  await c.D.ev("__ajouter('Pendant suspension', 60)"); await c.D.ev(() => { S.weightLog.push({ date: '2026-11-06', kg: 79.4 }); persist(); });
  await avancer(c.D, 60000, 2000); const pS = c.srv.lireCompte(L.EMAIL); const sv1 = nomsServeur(c);
  const tent = (await c.D.fetchLog()).filter((x) => x.action === 'saveProfile').length;
  verif('S14b pendant la suspension : la pesée est enregistrée, le repas n\'y est PAS (refus Nutrition), rien de perdu localement', (pS.weightLog || pS.profile.weightLog || []).length === 4 && compte(sv1, 'Pendant suspension') === 0 && (await c.D.log()).some((l) => l.nom === 'Pendant suspension'), [(pS.weightLog || pS.profile.weightLog || []).length, compte(sv1, 'Pendant suspension')]);
  verif('S14b la suspension ne provoque pas de boucle d\'envois (≤ 8 en 60 s virtuelles)', tent - c.n0 <= 8, tent - c.n0);
  delete c.srv.props.NUT_SUSPENDU; await avancer(c.D, 20 * 60000, 10000); await calme(c, 600);
  const r = await releve(c);
  verif('S14b reprise : le repas retenu arrive UNE fois, tout converge, aucun doublon', compte(r.serveur, 'Pendant suspension') === 1 && doublons(r.local).length === 0 && r.egal && r.etat.aConfirmer === false, [compte(r.serveur, 'Pendant suspension'), r.egal, r.etat]);
  await fin(c);
}
/* ══ S15 : ANCIEN client ft-v1263 contre le serveur @194 — inchangé par cette correction ══════════════════════════════════════════════════════════════════ */
async function sAncien(b) {
  const arbre = process.env.FT_ARBRE_ANCIEN;
  if (!arbre) { console.log('NON JOUÉ  S15 (FT_ARBRE_ANCIEN absent : arbre ft-v1263 non fourni)'); return; }
  const c = await pret(b, { arbre, seances: 20 });
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 20000) } : {});
  await jouerGestes(c, GESTES); await calme(c, 900); const r = await releve(c);
  metrique('S15', { envois: r.envois, pates: [r.local, r.serveur].map((l) => valeurs(l, 'Pates')) });
  verif('S15 ancien client (ft-v1263) face à @194, réponse lente : « Pates » UNE ligne à 80 g des deux côtés, aucun doublon, aucun message', compte(r.local, 'Pates') === 1 && compte(r.serveur, 'Pates') === 1 && valeurs(r.serveur, 'Pates')[0] === 80 && doublons(r.local).length === 0 && r.egal && r.toasts === 0, [valeurs(r.local, 'Pates'), valeurs(r.serveur, 'Pates'), r.toasts]);
  verif('S15 ses séances sont enregistrées (20 au serveur)', (c.srv.lireCompte(L.EMAIL).sessions || []).length === 20, (c.srv.lireCompte(L.EMAIL).sessions || []).length);
  await fin(c);
}
/* ══ S16 : A2 — un accusé qui ne change qu'une révision ne relance AUCUN envoi (10 ajouts espacés, réponse immédiate : 10 envois, pas 20) ═══════════════ */
async function sA2(b) {
  const c = await pret(b);
  for (let k = 0; k < 10; k++) { await c.D.ev("__ajouter('Repas " + k + "', " + (50 + k) + ')'); await avancer(c.D, 12000); await pause(120); }   // 12 s > 8 s : le minuteur d'un renvoi causé par l'accusé a le temps de tirer (à 7 s, la geste suivante le repoussait et masquait le défaut — mesuré par la mutation M7)
  await calme(c, 120); const r = await releve(c);
  metrique('S16', { gestes: 10, envois: r.envois, octets: r.octets });
  verif('S16 10 gestes espacés → au plus 11 envois (A2 : l\'accusé ne relance pas un envoi complet ; avant correction : ≈ 20)', r.envois <= 11, r.envois);
  verif('S16 …et rien n\'est perdu : 10 repas au serveur, aucun doublon', [...Array(10).keys()].every((k) => compte(r.serveur, 'Repas ' + k) === 1) && doublons(r.serveur).length === 0 && r.egal, [r.egal]);
  await fin(c);
}

/* ══ S17 : DEUX ONGLETS du même navigateur (ft-v1094) — un accusé qui arrive pendant qu'un autre onglet a écrit ne doit PAS effacer son repas (relecture indépendante : A2 avait contourné la fusion de `persist()`) ═══ */
async function sOnglets(b) {
  const c = await pret(b);
  c.apps.faute = (i) => (i.action === 'saveProfile' ? { gateResp: porte(c.D, 20000) } : {});
  await c.D.ev("__ajouter('RepasA', 100)"); await avancer(c.D, 5000);                    // envoi en vol : appliqué, réponse retenue
  const ligneB = L.ligneReelle(9000, { name: 'RepasB', q: 60, kcal: 80 });
  const pB = await c.D.cx.newPage(); await pB.goto('http://127.0.0.1:' + c.st.port + '/rien-ici');   // même origine, donc même stockage : l'AUTRE onglet écrit dans le journal du disque
  await pB.evaluate((l) => { const j = JSON.parse(localStorage.getItem('ft4_foodlog') || '[]'); j.push(l); localStorage.setItem('ft4_foodlog', JSON.stringify(j)); }, ligneB); await pB.close();
  await avancer(c.D, 25000);                                                              // la réponse arrive : l'accusé apprend la révision de RepasA (écriture locale)
  const dsk = await c.D.disque(), loc = await c.D.log();
  verif('S17 le repas de l\'AUTRE onglet est toujours SUR LE DISQUE après l\'accusé (A2 garde la fusion « deux onglets »)', dsk.some((l) => l.name === 'RepasB') && dsk.some((l) => l.name === 'RepasA'), dsk.filter((l) => /^Repas/.test(l.name)).map((l) => l.name));
  verif('S17 …et en mémoire dans cet onglet', loc.some((l) => l.nom === 'RepasB'), loc.filter((l) => /^Repas/.test(l.nom)).map((l) => l.nom));
  await calme(c, 300); const r = await releve(c);
  verif('S17 …et il part au serveur par la synchro suivante, une fois, sans doublon', compte(r.serveur, 'RepasB') === 1 && compte(r.serveur, 'RepasA') === 1 && doublons(r.serveur).length === 0 && r.egal, [compte(r.serveur, 'RepasB'), r.egal]);
  await fin(c);
}

/* ══ le programme ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCEN = [
  ['S01', (b) => sReponse(b, 'S01', 0, 6)], ['S02', (b) => sReponse(b, 'S02', 5, 6)], ['S03', (b) => sReponse(b, 'S03', 20, 6)], ['S03v', (b) => sReponse(b, 'S03v', 20, 4, GESTES_VOL)], ['S04', (b) => sReponse(b, 'S04', 60, 6, GESTES_VOL)], ['S05', (b) => sReponse(b, 'S05', 120, 6, GESTES_VOL)],
  ['S06', (b) => sUpload(b, 'S06', 10, 6)], ['S06b', (b) => sUpload(b, 'S06b', 60, 6)], ['S07', sAbsente], ['S07c', sTardif], ['S07b', sAccuseePerdu], ['S08a', (b) => sCoupure(b, 'a')], ['S08b', (b) => sCoupure(b, 'b')],
  ['S09', sRepetee], ['S10', sPendant], ['S11', sMulti], ['S11c', sRejet], ['S12', sFermeture], ['S12c', sFermetureResiduel], ['S13', sAccuses], ['S14', sAutres], ['S15', sAncien], ['S16', sA2], ['S17', sOnglets],
];
(async () => {
  const b = await L.lancer(); const t0 = Date.now();
  try {
    for (const [id, f] of SCEN) {
      if (!veut(id)) continue;
      const ts = Date.now(); console.log('\n── ' + id + ' ──');
      try { await f(b); } catch (e) { console.log('CRASH ' + id + ' ' + (e && e.stack || e)); verif(id + ' ne plante pas', false, String(e && e.message || e).slice(0, 160)); }
      console.log('(' + id + ' : ' + Math.round((Date.now() - ts) / 1000) + ' s réelles)');
    }
  } finally { await b.close(); }
  if (JSONOUT) fs.writeFileSync(JSONOUT, J({ arbre: L.ARBRE, metriques: METR, ok: L.R.ok, rouge: L.R.rouge }, null, 1));
  const r = L.bilan('NUT-SYNC-03 envois (' + Math.round((Date.now() - t0) / 1000) + ' s)'); process.exit(r.rouge ? 1 : 0);
})();
