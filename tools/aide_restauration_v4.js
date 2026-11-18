/* CONTRAT v4 DE LA RESTAURATION ADMIN — ce que l'OUTIL qualifié ajoute à CHAQUE requête `adminRestore` (18/11/2026, P1 + P3) :
     · `sourceEmail`  : l'adresse de l'ENTRÉE de la sauvegarde d'où viennent les données (identité source, jamais devinée) ;
     · `etatAttendu`  : l'état du compte lu par `adminReadAccount` juste avant (précondition d'état, sous verrou, sur u_ ET h_).
   Les bancs qui APPELLENT `adminRestore` pour autre chose que ces deux gardes (santé, relecture, verrou, masquages…) les ajoutent comme le fait l'outil : ce fichier le fait en UN endroit.
   `X.postBrut` envoie la requête TELLE QUELLE (les témoins P1–P4 s'en servent pour éprouver les refus). Aucun réseau, aucune donnée réelle. */
'use strict';
function etatDe(postBrut, adminToken, email) { const r = postBrut({ action: 'adminReadAccount', adminToken, email }); return r && r.j ? r.j.etat : undefined; }
/** La requête qualifiée : `sourceEmail` et `etatAttendu` ajoutés s'ils ne sont pas déjà donnés. Les autres actions passent sans changement. */
function completer(postBrut, corps) {
  if (!corps || corps.action !== 'adminRestore') return corps;
  const c = Object.assign({}, corps);
  if (c.sourceEmail === undefined) c.sourceEmail = c.email;
  if (c.etatAttendu === undefined) c.etatAttendu = etatDe(postBrut, c.adminToken, c.email);
  return c;
}
/** Enveloppe un serveur de banc : `X.post` qualifie les `adminRestore`, `X.postBrut` n'y touche pas. */
function envelopper(X) {
  const brut = X.post.bind(X);
  X.postBrut = brut;
  X.post = (corps) => brut(completer(brut, corps));
  return X;
}
module.exports = { completer, envelopper, etatDe };
