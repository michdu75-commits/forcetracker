#!/usr/bin/env node
/**
 * INSTANTANE DE L'ETAPE 5 — LA DOUANE DU JOURNAL ALIMENTAIRE.
 *
 * Michel, feu vert du 13/09/2026 : la douane est un point d'OBSERVATION pose juste avant
 * l'ecriture finale dans `S.foodLog`. Elle ne corrige rien, ne bloque rien, ne change aucun
 * resultat enregistre. Le critere de reussite est donc binaire et il porte sur UNE seule chose :
 *
 *     ⭐ LA LIGNE REELLEMENT ECRITE DANS `S.foodLog` NE BOUGE PAS D'UN OCTET.
 *
 *   node tools/instantane_douane.js > /tmp/avant_douane.json    (AVANT de toucher a app.js)
 *   node tools/instantane_douane.js > /tmp/apres_douane.json    (APRES)
 *   diff /tmp/avant_douane.json /tmp/apres_douane.json          -> DOIT etre vide
 *
 * ⛔⛔ CE FICHIER NE DOIT JAMAIS IMPRIMER LE RESULTAT DE LA DOUANE.
 *    Ce resultat n'existe pas dans l'arbre d'AVANT, donc l'y mettre rendrait la comparaison
 *    impossible et le critere binaire inutilisable. C'est la lecon de ft-v1196 prise par l'autre
 *    bout : on etend la sonde AVANT le BEFORE, mais on n'y met que ce qui existe des deux cotes.
 *    L'observation de la douane elle-meme (etat, non-mutation de son entree) est prouvee par les
 *    TEMOINS du bloc CCCIII, et listee par `node tools/instantane_douane.js --douane`.
 *
 * ⚠️ LES 4 ECRIVAINS SONT CONDUITS PAR LEUR VRAIE PORTE, jamais simules :
 *    - `addFoodEntry`  : l'ecran d'ajout (champs du DOM remplis, comme la personne le ferait)
 *    - `quickAddFood`  : l'ajout direct depuis « Mes aliments », sans ecran
 *    - `rejouerRepas`  : le rejeu d'un repas habituel — elle pousse DANS UNE BOUCLE
 *    - `saveEditFood`  : l'edition d'une ligne deja enregistree — elle ne POUSSE RIEN, elle mute
 *                        en place. Une sonde qui ne regarderait que `push` la raterait.
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const AVEC_DOUANE = process.argv.includes('--douane');
const M = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
            '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, { 'Content-Type': M[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});

const seed = `(()=>{try{
  localStorage.setItem('ft4_name','Testeur');localStorage.setItem('ft4_bw','80');
  localStorage.setItem('ft4_age','30');localStorage.setItem('ft4_ht','178');
  localStorage.setItem('ft4_gender','H');localStorage.setItem('ft4_act','1.55');
  localStorage.setItem('ft4_goal','muscle');window._demoMode=true;
}catch(e){}})();`;

(async () => {
await new Promise(r => srv.listen(0, r));
const PORT = srv.address().port;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const c = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Europe/Paris' });
const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.addInitScript(seed);
await p.goto('http://localhost:' + PORT + '/index.html');
await p.waitForTimeout(2500);

const snap = await p.evaluate(async (AVEC_DOUANE) => {
  const out = {};
  const J = x => JSON.parse(JSON.stringify(x === undefined ? null : x));

  /* ⚠️ `ts` vient de `Date.now()` et `date` du jour courant : les garder rendrait l'instantane
     different a chaque seconde et a chaque jour. On les NEUTRALISE, mais on garde leur PRESENCE
     — un champ qui disparaitrait se verrait. */
  const fige = (l) => {
    if (!l) return null;
    const o = {};
    Object.keys(l).sort().forEach(k => {
      o[k] = (k === 'ts') ? (l.ts ? 'TS' : l.ts)
           : (k === 'date') ? (l.date ? 'DATE' : l.date)
           : J(l[k]);
    });
    return o;
  };
  const derniere = () => fige((S.foodLog || [])[(S.foodLog || []).length - 1]);

  /* ══════════════ LES 8 FORMES DEMANDEES PAR MICHEL ══════════════
     grammes · portions · per100 present · per100 absent · provenance presente · provenance
     absente · quantite valide · quantite absente ou incoherente.
     ⛔ On n'invente pas de cas « joli » : chacun correspond a une forme qu'un ecrivain peut
        reellement produire aujourd'hui, mesuree sur `_provFood`. */
  const P100 = { kcal: 133, prot: 6.7, carbs: 13.3, fat: 3.3 };
  const CAS = [
    { cle: 'a_grammes_per100_provenance',
      it: { name: 'Poulet roti', kcal: 200, prot: 30, carbs: 0, fat: 8, q: 150, u: 'g',
            per100: P100, origine: 'off', sourceId: 'off:3017620422003', etat: 'valide' } },
    { cle: 'b_grammes_sans_per100',
      it: { name: 'Ratatouille maison', kcal: 180, prot: 4, carbs: 20, fat: 9, q: 250, u: 'g' } },
    { cle: 'c_portions_definition_complete',
      it: { name: 'Part de quiche', kcal: 300, prot: 12, carbs: 25, fat: 17, q: 2, u: 'portion',
            portionLabel: 'part', portionWeightG: 120, per100: P100, origine: 'ciqual',
            sourceId: 'ciqual:25601' } },
    { cle: 'd_portions_sans_poids',
      it: { name: 'Bol de soupe', kcal: 120, prot: 3, carbs: 14, fat: 5, q: 2, u: 'portion',
            portionLabel: 'bol' } },
    { cle: 'e_sans_provenance_ni_quantite',
      it: { name: 'Cafe noir', kcal: 2, prot: 0, carbs: 0, fat: 0 } },
    { cle: 'f_quantite_zero',
      it: { name: 'Eau', kcal: 0, prot: 0, carbs: 0, fat: 0, q: 0, u: 'g' } },
    { cle: 'g_unite_non_reprenable',
      it: { name: 'Lait demi-ecreme', kcal: 92, prot: 6.4, carbs: 9.2, fat: 3, q: 200, u: 'ml' } },
    /* ⚠️ LE CAS QUE MICHEL A NOMME : 48 kcal/100 g avec des macros incompatibles.
       Il doit rester une ALERTE, jamais un refus — aucune regle produit n'a decide quelle
       source a raison entre les calories affichees et les macros. */
    { cle: 'h_energie_incoherente',
      it: { name: 'Yaourt douteux', kcal: 48, prot: 20, carbs: 30, fat: 15, q: 100, u: 'g',
            per100: { kcal: 48, prot: 20, carbs: 30, fat: 15 } } },
  ];

  const remise = () => {
    S.foodLog = []; S.savedFoods = [];
    try { _afSetSrc(null); } catch (e) {}
    try { _afOublierAliment(); } catch (e) {}
  };

  /* ══ ECRIVAIN 1 — `quickAddFood` : l'ajout DIRECT depuis « Mes aliments », sans ecran ══ */
  const parQuickAdd = [];
  CAS.forEach(cs => {
    try {
      remise();
      _afQuickItems = [Object.assign({ fav: false }, cs.it)];
      _afMeal = 'dejeuner';
      quickAddFood(0);
      parQuickAdd.push([cs.cle, derniere() || 'RIEN ECRIT']);
    } catch (e) { parQuickAdd.push([cs.cle, 'LEVE : ' + String(e && e.message || e)]); }
  });
  out['ecrivain_1_quickAddFood'] = J(parQuickAdd);

  /* ══ ECRIVAIN 2 — `rejouerRepas` : elle pousse DANS UNE BOUCLE.
     ⚠️ `_repasHabituels` exige la MEME signature sur 2 dates : on conduit donc la vraie porte
        avec sa vraie condition d'entree, jamais un appel force. */
  const parRejeu = [];
  CAS.forEach(cs => {
    try {
      remise();
      S.foodLog = [Object.assign({ date: '2026-09-01', meal: 'dejeuner', ts: 1 }, cs.it),
                   Object.assign({ date: '2026-09-02', meal: 'dejeuner', ts: 2 }, cs.it)];
      const sig = (_repasHabituels()[0] || {}).sig || '';
      if (!sig) throw new Error('aucun repas habituel — la sonde ne conduirait rien');
      const avant = S.foodLog.length;
      rejouerRepas(sig, 'dejeuner');
      parRejeu.push([cs.cle, S.foodLog.length > avant ? derniere() : 'RIEN ECRIT']);
    } catch (e) { parRejeu.push([cs.cle, 'LEVE : ' + String(e && e.message || e)]); }
  });
  out['ecrivain_2_rejouerRepas'] = J(parRejeu);

  /* ══ ECRIVAIN 3 — `addFoodEntry` : l'ecran d'ajout, conduit par une VRAIE porte.
     On passe par `quickFillFood` (« Mes aliments ») pour que la provenance soit posee par la
     production et non par la sonde — la lecon de 1b-ii. */
  const parAjout = [];
  CAS.forEach(cs => {
    try {
      remise();
      openAddFood();
      _afQuickItems = [Object.assign({ fav: false }, cs.it)];
      quickFillFood(0);
      _afMeal = 'dejeuner';
      const avant = (S.foodLog || []).length;
      addFoodEntry();
      parAjout.push([cs.cle, (S.foodLog || []).length > avant ? derniere() : 'REFUSE PAR L ECRAN']);
    } catch (e) { parAjout.push([cs.cle, 'LEVE : ' + String(e && e.message || e)]); }
  });
  out['ecrivain_3_addFoodEntry'] = J(parAjout);

  /* ══ ECRIVAIN 4 — `saveEditFood` : elle ne POUSSE RIEN, elle mute en place.
     ⛔ C'est l'ecrivain qu'une recherche sur `S.foodLog.push` rate completement. */
  const parEdition = [];
  CAS.forEach(cs => {
    try {
      remise();
      S.foodLog = [Object.assign({ date: '2026-09-01', meal: 'dejeuner', ts: 4242 }, cs.it)];
      openEditFood(4242);
      /* on ne retouche RIEN a l'ecran : on enregistre tel quel, pour mesurer ce que
         l'edition fait d'une ligne qu'on ne modifie pas. */
      saveEditFood();
      parEdition.push([cs.cle, fige((S.foodLog || [])[0]) || 'RIEN']);
    } catch (e) { parEdition.push([cs.cle, 'LEVE : ' + String(e && e.message || e)]); }
  });
  out['ecrivain_4_saveEditFood'] = J(parEdition);

  /* ══════════ SECTION DE DIAGNOSTIC — JAMAIS DANS L'INSTANTANE COMPARE ══════════
     Elle n'existe que sous `--douane`, parce qu'elle lit quelque chose qui n'existe pas dans
     l'arbre d'AVANT. C'est elle qui sert a REPARTIR les lignes en OK / WARN / INVALID, et a
     prouver que la douane ne mute pas son entree. */
  if (AVEC_DOUANE) {
    const dispo = (typeof _douaneLigne === 'function');
    out['zz_douane_disponible'] = dispo;
    if (dispo) {
      /* ⭐ LES 4 ECRIVAINS, SUR LES 8 MEMES FORMES : c'est la repartition OK / WARN / INVALID
         que Michel a demandee, et elle se mesure sur ce qui est REELLEMENT ecrit, jamais sur
         des objets fabriques par la sonde. */
      const conduire = {
        quickAddFood: (cs) => { remise();
          _afQuickItems = [Object.assign({ fav: false }, cs.it)]; _afMeal = 'dejeuner';
          quickAddFood(0); return (S.foodLog || [])[0]; },
        rejouerRepas: (cs) => { remise();
          S.foodLog = [Object.assign({ date: '2026-09-01', meal: 'dejeuner', ts: 1 }, cs.it),
                       Object.assign({ date: '2026-09-02', meal: 'dejeuner', ts: 2 }, cs.it)];
          const sig = (_repasHabituels()[0] || {}).sig || '';
          if (!sig) return null;
          const av = S.foodLog.length; rejouerRepas(sig, 'dejeuner');
          return S.foodLog.length > av ? S.foodLog[S.foodLog.length - 1] : null; },
        addFoodEntry: (cs) => { remise(); openAddFood();
          _afQuickItems = [Object.assign({ fav: false }, cs.it)]; quickFillFood(0);
          _afMeal = 'dejeuner';
          const av = (S.foodLog || []).length; addFoodEntry();
          return (S.foodLog || []).length > av ? S.foodLog[S.foodLog.length - 1] : null; },
        saveEditFood: (cs) => { remise();
          S.foodLog = [Object.assign({ date: '2026-09-01', meal: 'dejeuner', ts: 4242 }, cs.it)];
          openEditFood(4242); saveEditFood(); return (S.foodLog || [])[0]; },
      };
      const obs = [];
      Object.keys(conduire).forEach(nom => {
        CAS.forEach(cs => {
          let l = null;
          try { l = conduire[nom](cs); } catch (e) { obs.push([nom, cs.cle, 'LEVE', String(e && e.message || e)]); return; }
          if (!l) { obs.push([nom, cs.cle, 'RIEN ECRIT', '']); return; }
          /* ⭐ LA PREUVE OCTET POUR OCTET DEMANDEE PAR MICHEL : on serialise l'objet AVANT
             l'appel, on appelle la douane, on re-serialise APRES, et on compare les chaines.
             ⛔ Les cles sont triees des deux cotes : sinon un simple reordonnancement
             passerait pour une mutation, et une vraie mutation pourrait passer inapercue. */
          const tri = (o) => JSON.stringify(o, Object.keys(o).sort());
          const avant = tri(l);
          const r = _douaneLigne(l, 'sonde');
          const apres = tri(l);
          obs.push([nom, cs.cle, r && r.etat,
                    (r && r.regles || []).slice().sort().join('+'),
                    avant === apres ? 'ENTREE INTACTE' : 'MUTEE !!']);
        });
      });
      out['zz_douane_observation'] = J(obs);
    }
  }

  return out;
}, AVEC_DOUANE);

snap['zz_erreurs_js'] = errs.length ? errs : 0;
console.log(JSON.stringify(snap, null, 1));
await b.close(); srv.close();
})();
