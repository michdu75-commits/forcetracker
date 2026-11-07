/* RELEVÉ LECTURE SEULE du compteur « noté N fois » — à coller dans la console de l'app (ou via un banc), AVANT puis APRÈS une synchronisation.
   Il ne rend QUE DES NOMBRES (aucun nom d'aliment, aucun contenu du journal) : rien à effacer, rien à exporter, rien à écrire. */
(() => {
  const L = (S.foodLog || []).filter(e => e && typeof e === 'object');
  const ids = L.map(e => e.id).filter(Boolean);
  const dups = ids.length - new Set(ids).size;
  const jours = new Set(L.map(e => e.date)), couples = new Set(L.map(e => e.date + '|' + (e.meal || '')));
  const par = {}; L.forEach(e => { const k = e.date + '|' + (e.meal || ''); (par[k] = par[k] || []).push(e); });
  const norm = n => String(n || '').toLowerCase().trim();
  const sigs = {}; Object.keys(par).forEach(k => { const s = k.split('|')[1] + '::' + par[k].map(e => norm(e.name)).sort().join('+'); sigs[s] = (sigs[s] || 0) + 1; });
  const hab = (typeof _repasHabituels === 'function') ? _repasHabituels() : [];
  const masques = Array.isArray(S.hiddenFoods) ? S.hiddenFoods : [];
  return {
    quand: new Date().toISOString(), lignes: L.length, idsUniques: new Set(ids).size, collisionsId: dups, sansId: L.length - ids.length,
    joursDistincts: jours.size, couplesJourRepas: couples.size, signaturesNormalisees: Object.keys(sigs).length,
    habitudes: hab.map(r => r.n),                       // les compteurs affichés, sans les noms
    masquages: masques.length, remiseAZero: (masques.find(x => x && x.k === '*') || {}).t || 0,
    supprimesEnAttente: (S.foodSupprimes || []).length, plusAncienJour: [...jours].sort()[0] || null, plusRecentJour: [...jours].sort().slice(-1)[0] || null
  };
})();
