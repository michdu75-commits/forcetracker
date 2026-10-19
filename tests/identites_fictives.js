/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   LES IDENTITÉS DE TEST — FICTIVES, SUR UN DOMAINE RÉSERVÉ (D-031-SÉCURITÉ-01, 19/10/2026)
   ═══════════════════════════════════════════════════════════════════════════════════════════════
   ⛔⛔ POURQUOI CE FICHIER EXISTE — un défaut MESURÉ. La passe se connectait sous les adresses RÉELLES du
   fondateur et de trois testeurs (34 occurrences dans runner.js), et la contre-expertise du 19/10 a recompté,
   parmi ses requêtes sortantes, une sauvegarde sous l'adresse réelle d'un testeur. Le garde réseau empêche
   désormais la requête de partir ; ce module empêche l'IDENTITÉ d'être réelle.

   ⭐ COMMENT : l'app reconnaît ses personnes par des LISTES (ADMIN_EMAILS, TESTER_EMAILS…) et par des comparaisons
   écrites en dur (_isChristophe, _isEline, _isEmma…). Ce module LIT ces identités dans le code servi — il ne les
   recopie jamais — et associe à chacune une adresse fictive du domaine réservé example.test (RFC 2606), par RÔLE.
   Le serveur de la passe sert l'app avec les adresses fictives À LA PLACE des réelles : l'app garde SA logique (la
   même comparaison, le même tableau, dans le même ordre), seule la valeur change. Les tests n'écrivent donc que des
   adresses fictives, et l'app les reconnaît comme elle reconnaîtrait les vraies.

   ⛔ FERMÉ PAR DÉFAUT : un rôle introuvable dans le code (fonction renommée, liste déplacée) fait rougir le témoin
   D031S-III ① — on ne retombe pas en silence sur l'adresse réelle.
   ⚠️ CE QU'IL NE COUVRE PAS : Code.js et worker.js lus par un test via `fs` (le test applique `substituer` s'il en a
   besoin) ; les bancs lancés seuls, qui ont leur propre serveur ; le banc d'essai RÉEL de Milo (tests/milo), qui
   envoie de vrais appels et choisit son modèle par l'adresse — hors de ce chantier, signalé à Michel.
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const RACINE = path.join(__dirname, '..');
const DOMAINE = 'example.test';
const RE_ADR = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
/* les adresses déjà fictives : domaines réservés (RFC 2606 / 6761) et exemples manifestes */
const RE_FICTIVE = /@([a-z0-9-]+\.)*(example\.(com|org|net|test)|test|invalid|localhost|test\.internal)$/i;

/* ⭐ LES RÔLES — l'adresse fictive est dite ici, l'adresse réelle n'est JAMAIS écrite : elle est lue dans l'app. */
const ID = {
  fondateur: 'fondateur@' + DOMAINE,          // ADMIN_EMAILS[0]
  christophe: 'christophe@' + DOMAINE,        // _isChristophe()
  eline: 'eline@' + DOMAINE,                  // _isEline()
  emma: 'emma@' + DOMAINE,                    // _isEmma()
  boite: 'boite-idees@' + DOMAINE,            // TESTER_FEEDBACK_EMAIL
  testeur1: 'testeur-1@' + DOMAINE,           // les autres identités des listes, dans l'ordre de constants.js
  testeur2: 'testeur-2@' + DOMAINE,
  testeur3: 'testeur-3@' + DOMAINE,
};

let _etat = null;
function lire(f) { try { return fs.readFileSync(path.join(RACINE, f), 'utf8'); } catch (e) { return ''; } }
function construire() {
  const C = lire('constants.js'), A = lire('app.js');
  const liste = (nom) => { const m = C.match(new RegExp('const ' + nom + '=\\[([^\\]]*)\\];')); return m ? (m[1].match(RE_ADR) || []).map(x => x.toLowerCase()) : null; };
  const predicat = (nom) => { const m = A.match(new RegExp('function ' + nom + "\\(\\)\\{return \\(S\\.email\\|\\|''\\)\\.trim\\(\\)\\.toLowerCase\\(\\)==='([^']+)'")); return m ? m[1].toLowerCase() : null; };
  const boite = (C.match(/const TESTER_FEEDBACK_EMAIL='([^']+)'/) || [])[1];
  const listes = { ADMIN_EMAILS: liste('ADMIN_EMAILS'), TESTER_EMAILS: liste('TESTER_EMAILS'),
    SUPER_TESTER_EMAILS: liste('SUPER_TESTER_EMAILS'), PREMIUM_CLIENT_EMAILS: liste('PREMIUM_CLIENT_EMAILS') };
  const sources = {
    fondateur: listes.ADMIN_EMAILS && listes.ADMIN_EMAILS[0],
    christophe: predicat('_isChristophe'), eline: predicat('_isEline'), emma: predicat('_isEmma'),
    boite: boite ? boite.toLowerCase() : null,
  };
  const table = new Map();                       // réelle (minuscules) → fictive
  for (const [role, reelle] of Object.entries(sources)) if (reelle && !RE_FICTIVE.test(reelle) && !table.has(reelle)) table.set(reelle, ID[role]);
  let n = 0;
  for (const nom of Object.keys(listes)) for (const a of (listes[nom] || [])) {
    if (RE_FICTIVE.test(a) || table.has(a)) continue;
    n++; table.set(a, ID['testeur' + n] || ('testeur-' + n + '@' + DOMAINE));
  }
  const roles = {}; for (const r of Object.keys(sources)) roles[r] = !!sources[r];
  for (const nom of Object.keys(listes)) roles[nom] = Array.isArray(listes[nom]) && listes[nom].length > 0;
  /* une seule expression, la plus longue d'abord : une adresse ne peut pas être remplacée à moitié */
  const motif = table.size ? new RegExp([...table.keys()].sort((a, b) => b.length - a.length).map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi') : null;
  return { table, roles, motif };
}
const etat = () => _etat || (_etat = construire());

/* remplace, dans un texte, chaque identité réelle par son adresse fictive (insensible à la casse) */
function substituer(texte) {
  const { table, motif } = etat();
  if (!motif || typeof texte !== 'string' || texte.indexOf('@') < 0) return texte;
  return texte.replace(motif, (m) => table.get(m.toLowerCase()) || m);
}
/* les adresses réelles que l'app reconnaît — pour les TÉMOINS seulement, jamais affichées ni écrites */
const adressesReelles = () => [...etat().table.keys()];
const roles = () => Object.assign({}, etat().roles);
/* une adresse réelle (ou sa forme échappée dans une expression rationnelle) est-elle écrite dans ce texte ? → nombre */
function compterReelles(texte) {
  let n = 0; const t = String(texte || '').toLowerCase();
  for (const a of adressesReelles()) { n += t.split(a).length - 1; n += t.split(a.replace(/\./g, '\\.')).length - 1; }
  return n;
}

/* ce que le serveur d'un test doit ENVOYER À LA PLACE du fichier : le texte avec les identités fictives — ou `null`
   quand le fichier n'en porte aucune, et le serveur le sert alors EXACTEMENT comme avant (mêmes octets, même façon).
   Une seule fonction pour tous les serveurs de test (R2). */
const _servi = new Map();
function servir(fichier) {
  if (!/\.(js|mjs|html|json|css|txt|webmanifest)$/i.test(fichier)) return null;
  const st = fs.statSync(fichier), cle = st.mtimeMs + '|' + st.size;
  const deja = _servi.get(fichier); if (deja && deja.cle === cle) return deja.octets;
  let octets = null;
  const brut = fs.readFileSync(fichier);
  if (brut.includes(64)) {                                    // 64 = « @ »
    const s = brut.toString('utf8'), t = substituer(s);
    if (t !== s) octets = Buffer.from(t, 'utf8');
  }
  _servi.set(fichier, { cle, octets });
  return octets;
}

module.exports = { ID, DOMAINE, substituer, servir, adressesReelles, roles, compterReelles, RE_FICTIVE };
