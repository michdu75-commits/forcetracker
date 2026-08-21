#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 TIER 2 — LE BENCHMARK : on fait parler le VRAI Milo et on vérifie sa réponse.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * `tests/milo/runner.js` (Tier 1) prouve qu'une règle est PRÉSENTE dans le prompt.
 * Celui-ci mesure si elle est SUIVIE. Voir l'en-tête de `eval-scenarios.js` pour ce
 * que ça vaut (⚠️ un vert vaut moins qu'un rouge) et pourquoi il n'y a PAS de juge IA.
 *
 * ⚠️ CE RUNNER COÛTE DE L'ARGENT — c'est le seul du dépôt. D'où deux garde-fous :
 *   ① il ne part PAS tout seul : sans `--go`, il tourne À BLANC (0 appel, 0 €) et se
 *      contente d'annoncer ce qu'il ferait et ce que ça coûterait. Le chiffre annoncé
 *      est MESURÉ, pas deviné : le contexte réel de chaque scénario est construit
 *      pour de bon (c'est gratuit, tout est local) et on compte ses caractères.
 *   ② il n'est PAS branché sur la suite de tests de livraison. Un test qui dépense
 *      à chaque `git push` finirait par être coupé — et c'est le seul qui mesure
 *      vraiment Milo.
 *
 * ⚠️ ET IL NE RÉUTILISE AUCUNE DONNÉE RÉELLE : chaque scénario passe par
 *    `_vcApplyPersona`, qui remet à neutre TOUT ce que lit `buildCoachContext`.
 *    Le navigateur est jetable, rien n'est écrit sur le compte de personne.
 *
 * ⚠️ ET IL SAIT COMPARER DEUX MODÈLES (`--compare`) — c'est ce qui permet de MESURER la
 *    décision « Sonnet pour tout le monde » au lieu d'en rediscuter. La comparaison est
 *    ASYMÉTRIQUE, et c'est écrit partout où elle apparaît : Haiku nettement plus rouge
 *    **confirme** R9 et ferme la question ; Haiku aussi vert ne **rouvre rien** (un vert ne
 *    dit que « aucune violation détectable sur 15 pièges », et ce qui fait Milo — le ton, le
 *    naturel, le refus d'insister — n'est dans aucun de ces 15 motifs).
 *
 * Usage :
 *   node tests/milo/eval.js                     → à blanc (0 €), liste + devis
 *   node tests/milo/eval.js --go                → lance les 15 sur le modèle de production
 *   node tests/milo/eval.js --go --modele haiku → les 15 sur Haiku (~3× moins cher)
 *   node tests/milo/eval.js --go --compare      → les deux, côte à côte (2× le coût)
 *   node tests/milo/eval.js --go --only EV-001,EV-006
 *   node tests/milo/eval.js --go --n 4          → les 4 premiers seulement
 *   node tests/milo/eval.js --rejouer <fichier> → 🔬 REJOUE LES VÉRIFICATEURS, 0 appel, 0 €
 *
 * ⭐ `--rejouer` EST LE MODE LE PLUS RENTABLE, et il n'existait pas jusqu'à ft-v938.
 *    Une passe coûte 0,25-0,95 € et produit 15 vraies réponses de Milo — qui étaient JETÉES.
 *    Elles sont désormais gardées par l'app (bouton « 📥 Copier les réponses »), et ce mode
 *    les relit pour repasser les motifs dessus SANS rien redemander à Milo. On paie une
 *    fois, on exploite dix fois : corriger un faux rouge, ou élargir un motif, se vérifie
 *    alors sur du VRAI texte au lieu de se faire à l'aveugle.
 * ⚠️ ET CE N'EST PAS UNE MESURE DE MILO : il n'a pas reparlé. Ce mode mesure le
 *    VÉRIFICATEUR. Un rouge qui apparaît ici veut dire « mon motif attrape ça maintenant »,
 *    jamais « Milo s'est dégradé ».
 *
 * Sortie : console + tests/milo/eval-report.json + tests/milo/eval-report.md
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENARIOS = require('./eval-scenarios.js');

// ── Tarifs (vérifiés le 20/08/2026) — worker.js sert claude-sonnet-4-6 à TOUT LE MONDE ──
// ⚠️ La liste blanche du Worker ne contient que des modèles MOINS CHERS que le défaut : toute
//    entrée ajoutée ici doit l'être là-bas AUSSI, et jamais au-dessus du prix de production.
const MODELES = {
  prod : { id:'',                  nom:'Sonnet 4.6 (production)', entree:3.00, sortie:15.00 },
  haiku: { id:'claude-haiku-4-5',  nom:'Haiku 4.5',               entree:1.00, sortie: 5.00 },
};
const CACHE_LECTURE = 0.1;   // multiplicateur d'une lecture de cache
const CAR_PAR_TOKEN = 3.6;   // français, mesuré à la louche — sert au DEVIS, pas à la facture
const SORTIE_ATTENDUE = 700; // tokens de réponse typiques d'un débrief/séance Milo

// ── Arguments ──
const ARGV = process.argv.slice(2);
const GO   = ARGV.includes('--go');
const ONLY = (ARGV.find(a=>a.startsWith('--only='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--only')+1] && !ARGV[ARGV.indexOf('--only')+1].startsWith('--') ? ARGV[ARGV.indexOf('--only')+1] : '');
const NMAX = parseInt((ARGV.find(a=>a.startsWith('--n='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--n')+1]||''), 10);
const COMPARE = ARGV.includes('--compare');
// 🔁 RÉPÉTITION — Michel, 21/08 : « sinon on passe à 20 passes non ? ». L'intuition est juste :
// répéter est la SEULE façon de battre le bruit (deux passes du même modèle ont donné 3 puis
// 4 rouges). Mais répéter les 15 coûte cher ET dépasse le plafond anti-abus (50 appels/jour/
// personne, 600 au total) : 20 × 15 = 300 appels.
// ⭐ La bonne façon est donc de répéter CE QUI COMPTE, pas tout : `--only EV-012 --repeat 20`
//    = 20 appels (~0,30 €), et ça répond à la vraie question — « ce rouge tombe-t-il À CHAQUE
//    FOIS, ou une fois sur cinq ? ». Un rouge intermittent et un rouge systématique ne se
//    corrigent pas pareil.
// ⚠️ Le verdict devient un TAUX, plus un booléen : « rouge 8 fois sur 10 ».
const REPEAT = Math.max(1, parseInt((ARGV.find(a=>a.startsWith('--repeat='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--repeat')+1]||''), 10) || 1);
// ⚠️⚠️ LE BENCHMARK RÉEL TOURNE SUR L'APP DÉPLOYÉE, PAS SUR UN SERVEUR LOCAL — et ce n'est
//    pas un choix de confort. Le Worker porte un verrou anti-abus depuis le 27/07 :
//    `ALLOWED_ORIGIN = 'https://michdu75-commits.github.io'`, et il refuse AVANT tout appel
//    payant (403) toute origine inconnue. Depuis `http://localhost`, chaque scénario rendait
//    « réseau: Failed to fetch » — le verrou faisait exactement son travail.
//    ⭐ Et c'est plus honnête ainsi : on mesure le Milo que les gens ont vraiment, pas une
//      copie de travail non déployée.
//    ⚠️ CONSÉQUENCE À NE PAS OUBLIER : une modification locale du prompt n'est PAS mesurée
//      tant qu'elle n'est pas en ligne (R18 — vérifier le déploiement, pas le push).
// Le run À BLANC, lui, reste local : il ne fait aucun appel, donc aucun verrou à franchir,
// et il continue de marcher hors ligne.
const APP_LIVE = 'https://michdu75-commits.github.io/forcetracker/index.html';
const LOCAL = ARGV.includes('--local');
const MOD_ARG = ((ARGV.find(a=>a.startsWith('--modele='))||'').split('=')[1]
          || (ARGV[ARGV.indexOf('--modele')+1] && !ARGV[ARGV.indexOf('--modele')+1].startsWith('--') ? ARGV[ARGV.indexOf('--modele')+1] : '')
          || 'prod').toLowerCase();
if (!MODELES[MOD_ARG]) { console.error('Modèle inconnu : ' + MOD_ARG + ' (attendu : ' + Object.keys(MODELES).join(' | ') + ')'); process.exit(2); }
// --compare joue TOUJOURS la production en premier : c'est la référence, pas le challenger.
const PASSES = COMPARE ? ['prod','haiku'] : [MOD_ARG];

let liste = SCENARIOS.slice();
if (ONLY) { const ids = ONLY.split(',').map(s=>s.trim().toUpperCase()); liste = liste.filter(s=>ids.includes(s.id)); }
if (Number.isFinite(NMAX) && NMAX > 0) liste = liste.slice(0, NMAX);

/* 🔬 REJEU DES VÉRIFICATEURS — 0 appel, 0 €, et pas même un navigateur.
   Le fichier attendu a la forme d'un `eval-report.json` (clé `parPasse`), qui est aussi
   celle que l'app exporte — MÊME FORME DES DEUX CÔTÉS (R2). Deux formats finiraient par
   diverger, et le jour où l'un des deux ne serait plus relu, rien ne le signalerait. */
const REJOUER = (ARGV.find(a=>a.startsWith('--rejouer='))||'').split('=')[1]
        || (ARGV[ARGV.indexOf('--rejouer')+1] && !ARGV[ARGV.indexOf('--rejouer')+1].startsWith('--') ? ARGV[ARGV.indexOf('--rejouer')+1] : '');
if (REJOUER) {
  let src;
  try { src = JSON.parse(fs.readFileSync(path.resolve(REJOUER), 'utf8')); }
  catch (e) { console.error('Fichier illisible : ' + REJOUER + ' — ' + e.message); process.exit(2); }
  const pp = src.parPasse || {};
  const cles = Object.keys(pp);
  if (!cles.length) { console.error('Aucune réponse dans ' + REJOUER + ' (clé `parPasse` attendue).'); process.exit(2); }
  console.log('');
  console.log('🔬 REJEU DES VÉRIFICATEURS — 0 appel, 0 €');
  console.log('   Source : ' + REJOUER + (src.date ? '   (réponses du ' + src.date + ')' : ''));
  console.log('   ⚠️ Ce n\'est PAS une mesure de Milo — il n\'a pas reparlé. On mesure les MOTIFS.\n');
  let nRej = 0, nSansTexte = 0, nInconnus = 0;
  cles.forEach(k => {
    const rs = (pp[k]||[]).filter(r => r && r.reply);
    nSansTexte += (pp[k]||[]).length - rs.length;
    const verts = [], rouges = [];
    rs.forEach(r => {
      const sc = SCENARIOS.find(x => x.id === r.id);
      if (!sc) { nInconnus++; return; }              // scénario retiré du corpus depuis la passe
      nRej++;
      const v = verifier(sc, r.reply);
      const ko = v.filter(x => !x.ok);
      (ko.length ? rouges : verts).push({ sc, ko });
    });
    console.log('── ' + k.toUpperCase() + ' : ' + verts.length + ' vert(s) · ' + rouges.length + ' rouge(s) ──');
    rouges.forEach(x => {
      console.log('  ❌ ' + x.sc.id + ' (' + x.sc.origin + ') — ' + x.sc.titre);
      x.ko.forEach(v => console.log('       ↳ ' + v.nom + (v.detail ? '\n         → ' + v.detail : '')));
    });
    verts.forEach(x => console.log('  ✅ ' + x.sc.id + ' — ' + x.sc.titre));
    console.log('');
  });
  if (nSansTexte) console.log('  ⚠️ ' + nSansTexte + ' entrée(s) sans texte de réponse — ignorées (un run à blanc n\'en produit aucun).');
  if (nInconnus)  console.log('  ⚠️ ' + nInconnus + ' réponse(s) d\'un scénario absent du corpus actuel — ignorées.');
  console.log('  ' + nRej + ' réponse(s) rejouée(s). Rien n\'a été appelé, rien n\'a été facturé.\n');
  process.exit(0);
}

// ── Playwright ──
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright/index.js').chromium; }
const CHROME_PATHS = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'];
const execPath = CHROME_PATHS.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.wav':'audio/wav' };
function serve() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' || p.endsWith('/')) p += 'index.html';
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
}

// ── Ce qui tourne DANS la page : on réutilise le laboratoire VC de l'app (R13) ──
// `_vcApplyPersona` remet à neutre tout ce que lit buildCoachContext puis applique le
// persona ; `_vcAsk` fait l'appel réel avec le MÊME contexte que le vrai chemin.
// window._demoMode gèle toute écriture locale/cloud pendant la manœuvre.
async function jouerDansLaPage(page, sc, pourDeVrai, idModele) {
  return page.evaluate(async ({ sc, pourDeVrai, idModele }) => {
    const manque = ['_vcApplyPersona','_vcAsk','buildCoachContext'].filter(f=>typeof window[f]!=='function');
    if (manque.length) return { erreur:'fonction(s) absente(s) : '+manque.join(', ') };
    window._demoMode = true;
    try {
      _vcApplyPersona({ apply: sc.apply || {} });
      const persona = { scenario: sc.scenario, coachEmail: sc.coachEmail || '',
                        history: sc.history || [], evalModel: idModele || '' };
      if (!pourDeVrai) {
        // À BLANC : on construit le contexte réel (gratuit, local) pour MESURER le devis.
        const ctx = buildCoachContext(sc.scenario);
        return { blanc:true, carContexte: ctx.length,
                 carHistorique: JSON.stringify(sc.history || []).length,
                 carMessage: (sc.scenario||'').length };
      }
      const r = await _vcAsk(persona);
      return { ok:!!r.ok, reply:r.reply||'', err:r.err||'', kind:r.kind||'',
               ms:r.ms||0, carContexte:(r.ctx||'').length, modele:r.modele||'' };
    } catch (e) {
      return { erreur: (e && e.message) || String(e) };
    } finally {
      window._demoMode = false;
      try { if (typeof load === 'function') load(); } catch (e) {}
    }
  }, { sc, pourDeVrai, idModele });
}

function euros(usd){ return (usd * 0.92).toFixed(2); } // ordre de grandeur, pas une facture

// ── Les vérificateurs tournent ICI, dans Node : du code, pas un juge ──
function verifier(sc, reply) {
  return sc.verifs.map(v => {
    let out; try { out = v.fn(reply); } catch (e) { out = { ok:false, detail:'vérificateur cassé : '+e.message }; }
    if (out === true)  out = { ok:true };
    if (out === false) out = { ok:false };
    return { nom:v.nom, ok:!!out.ok, detail:out.detail || '' };
  });
}

(async () => {
  if (!liste.length) { console.log('Aucun scénario ne correspond.'); process.exit(0); }

  const srv = serve();
  await new Promise(r => srv.listen(0, r));
  const port = srv.address().port;
  const nav = await chromium.launch(execPath ? { executablePath: execPath } : {});

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 BENCHMARK MILO (Tier 2) — est-ce qu\'il SUIT ses règles ?     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  if (!GO) console.log('  Mode : À BLANC — aucun appel, aucun coût. Ajoute --go pour lancer.\n');
  else {
    const _n = liste.length * REPEAT;
    if (COMPARE) console.log('  Mode : COMPARAISON — ' + (_n*2) + ' appels (' + _n + ' par modèle).');
    else console.log('  Mode : RÉEL — ' + _n + ' appel(s) sur ' + MODELES[MOD_ARG].nom + '.');
    if (REPEAT > 1) console.log('  🔁 Chaque scénario est rejoué ' + REPEAT + ' fois — le verdict devient un TAUX.');
    /* ⛔ PLAFOND ANTI-ABUS : 50 appels/jour/personne, 600 au total (worker.js). Au-delà, le
       benchmark se ferait couper EN COURS et on paierait des appels pour un rapport tronqué. */
    if (_n * (COMPARE?2:1) > 45) {
      console.log('\n  ⛔ ' + (_n*(COMPARE?2:1)) + ' appels : au-dessus du plafond de 50/jour/personne.');
      console.log('     Le run serait coupé en cours de route. Réduis --repeat ou --only.\n');
      process.exit(2);
    }
    console.log('  App testée : ' + (LOCAL ? 'LOCALE ⚠️ (le Worker refusera : origine non autorisée)' : APP_LIVE));
    console.log('  ⚠️ C\'est le Milo EN LIGNE qui est mesuré — une modif locale non déployée ne l\'est pas.\n');
  }

  async function ouvrirPage() {
    const ctx = await nav.newContext({ serviceWorkers:'block', viewport:{width:390,height:844} });
    await ctx.addInitScript(() => {
      // Compte minimal « déjà connecté » : le laboratoire écrase de toute façon tout le profil.
      const b = { ft4_name:'Test', ft4_bw:'80', ft4_age:'35', ft4_height:'175',
                  ft4_gender:'h', ft4_ok:'1', ft4_premium:'1', ft4_email:'' };
      for (const k in b) localStorage.setItem(k, b[k]);
    });
    const page = await ctx.newPage();
    await page.goto((GO && !LOCAL) ? APP_LIVE : ('http://localhost:' + port + '/index.html'));
    await page.waitForTimeout(2300);
    await page.evaluate(() => { document.querySelectorAll('.overlay').forEach(x => x.classList.remove('open')); });
    return { page, ctx };
  }

  const parPasse = {};   // { prod: [...], haiku: [...] }
  let totalCar = 0;

  for (const passe of (GO ? PASSES : ['prod'])) {
    const M = MODELES[passe];
    if (GO && PASSES.length > 1) console.log('  ── ' + M.nom + ' ' + '─'.repeat(Math.max(0, 52 - M.nom.length)));
    const resultats = [];

    for (const sc of liste) {
      /* 🔁 On rejoue le MÊME scénario REPEAT fois. Chaque passe est un navigateur neuf : aucun
         état ne fuit de l'une à l'autre, sinon on mesurerait la mémoire et pas la règle. */
      const passes = [];
      let r = null;
      for (let k = 0; k < (GO ? REPEAT : 1); k++) {
        const { page, ctx } = await ouvrirPage();
        r = await jouerDansLaPage(page, {
          apply: sc.apply, scenario: sc.scenario, coachEmail: sc.coachEmail, history: sc.history
        }, GO, M.id);
        await ctx.close();
        if (GO && r && r.ok) passes.push(verifier(sc, r.reply));
        if (GO && REPEAT > 1) await new Promise(z => setTimeout(z, 400)); // on ne mitraille pas
      }

      if (r.erreur) {
        console.log('  ⛔ ' + sc.id + ' — ' + r.erreur);
        resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'erreur', detail:r.erreur });
        continue;
      }

      if (!GO) {
        const car = (r.carContexte||0) + (r.carHistorique||0) + (r.carMessage||0);
        totalCar += car;
        console.log('  · ' + sc.id + '  ' + String(Math.round(car/1000)).padStart(3) + ' k car.  ' + sc.titre);
        resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'blanc', carContexte:r.carContexte });
        continue;
      }

      if (!r.ok) {
        console.log('  ⛔ ' + sc.id + ' — pas de réponse (' + r.kind + ') : ' + r.err);
        resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat:'muet', detail:r.err });
        continue;
      }

      // ⚠️ On vérifie que le modèle DEMANDÉ est bien celui qui a SERVI. Sans ça, un repli
      // silencieux ferait annoncer « testé en Haiku » une passe entièrement jouée en Sonnet —
      // et on comparerait un modèle avec lui-même sans le voir.
      const servi = r.modele || '(non rapporté)';
      const attendu = M.id || 'claude-sonnet-4-6';
      const bonModele = (servi === attendu);

      const verdicts = passes[passes.length-1] || verifier(sc, r.reply);
      const rouges = verdicts.filter(v => !v.ok);
      /* Sur plusieurs passes, ce qui compte n'est plus « rouge ou vert » mais COMBIEN DE FOIS. */
      const nbRouges = passes.filter(vs => vs.some(v => !v.ok)).length;
      const taux = passes.length > 1 ? '  🔁 rouge ' + nbRouges + '/' + passes.length : '';
      console.log((nbRouges ? '  ❌ ' : '  ✅ ') + sc.id + ' — ' + sc.titre
        + (passes.length > 1 ? taux : '  (' + r.ms + ' ms)')
        + (bonModele ? '' : '   ⚠️ servi par ' + servi + ' au lieu de ' + attendu));
      /* On montre les motifs de la DERNIÈRE passe rouge, pas d'une passe verte au hasard. */
      const montre = passes.find(vs => vs.some(v => !v.ok)) || verdicts;
      montre.forEach(v => {
        if (!v.ok) console.log('       ↳ ' + v.nom + (v.detail ? '\n         → ' + v.detail : ''));
        else if (v.detail) console.log('       · ' + v.nom + ' — ' + v.detail);
      });
      totalCar += (r.carContexte||0) * (passes.length||1);
      resultats.push({ id:sc.id, titre:sc.titre, origin:sc.origin, etat: nbRouges?'rouge':'vert',
                       ms:r.ms, modele:servi, bonModele, verdicts:montre, reply:r.reply,
                       passes:passes.length, nbRouges });
    }

    parPasse[passe] = resultats;
    if (GO) {
      const verts = resultats.filter(r=>r.etat==='vert').length;
      const rouges= resultats.filter(r=>r.etat==='rouge');
      const muets = resultats.filter(r=>r.etat==='muet'||r.etat==='erreur').length;
      console.log('\n  ══ ' + M.nom + ' : ' + verts + ' vert(s) · ' + rouges.length + ' rouge(s)'
        + (muets?' · '+muets+' sans réponse':''));
      if (rouges.length) rouges.forEach(r => console.log('     🔴 ' + r.id + ' (' + r.origin + ') — ' + r.titre));
      const faux = resultats.filter(r=>r.bonModele===false);
      if (faux.length) console.log('     ⚠️ ' + faux.length + ' réponse(s) servies par un AUTRE modèle que celui demandé — résultat non comparable.');
      console.log('');
    }
  }

  await nav.close(); srv.close();

  // ── Devis (à blanc) ──
  if (!GO) {
    const tk = Math.round(totalCar * REPEAT / CAR_PAR_TOKEN);
    console.log('\n  📐 DEVIS MESURÉ (contexte réel construit, ' + Math.round(totalCar/1000) + ' k caractères au total)');
    console.log('     ≈ ' + tk.toLocaleString('fr-FR') + ' tokens d\'entrée + ' + (liste.length*REPEAT*SORTIE_ATTENDUE).toLocaleString('fr-FR') + ' de sortie');
    Object.keys(MODELES).forEach(k => {
      const M = MODELES[k];
      const haut = (tk/1e6)*M.entree, bas = haut*CACHE_LECTURE;
      const sortie = (liste.length*REPEAT*SORTIE_ATTENDUE/1e6)*M.sortie;
      console.log('     · ' + M.nom.padEnd(26) + ' entre ' + euros(bas+sortie) + ' € (cache chaud) et ' + euros(haut+sortie) + ' € (rien en cache)');
    });
    console.log('     ⚠️ Ordre de grandeur, pas une facture — le découpage en tokens est estimé.');
    console.log('\n  Rien n\'a été appelé. Pour lancer :  node tests/milo/eval.js --go   (ou --go --compare)\n');
  }

  // ── Comparaison des deux passes ──
  if (GO && COMPARE && parPasse.prod && parPasse.haiku) {
    console.log('  ══════════ SONNET (production) vs HAIKU ══════════');
    console.log('  ' + 'Scénario'.padEnd(9) + 'Sonnet  Haiku');
    let ecart = 0;
    liste.forEach(sc => {
      const a = (parPasse.prod .find(r=>r.id===sc.id)||{}).etat;
      const b = (parPasse.haiku.find(r=>r.id===sc.id)||{}).etat;
      const ic = e => ({vert:'  ✅  ',rouge:'  ❌  ',muet:'  ⛔  ',erreur:'  ⛔  '}[e]||'  ?   ');
      if (a !== b) ecart++;
      console.log('  ' + sc.id.padEnd(9) + ic(a) + ic(b) + (a!==b ? '  ← diffère' : ''));
    });
    const rp = parPasse.prod .filter(r=>r.etat==='rouge').length;
    const rh = parPasse.haiku.filter(r=>r.etat==='rouge').length;
    const idsR = k => new Set(parPasse[k].filter(r=>r.etat==='rouge').map(r=>r.id));
    const propreHaiku = [...idsR('haiku')].filter(i=>!idsR('prod').has(i));
    const propreProd  = [...idsR('prod')].filter(i=>!idsR('haiku').has(i));
    console.log('\n  Rouges : Sonnet ' + rp + ' · Haiku ' + rh + '   (' + ecart + ' scénario(s) où les deux diffèrent)');
    if (propreHaiku.length) console.log('  Rouges propres à Haiku  : ' + propreHaiku.join(', '));
    if (propreProd.length)  console.log('  Rouges propres à Sonnet : ' + propreProd.join(', '));
    console.log('');
    // ⚠️⚠️ LA LECTURE EST ASYMÉTRIQUE, et c'est le message le plus important du rapport.
    // ⚠️ ET ELLE A UN SEUIL, MESURÉ : deux passes du MÊME modèle ont donné 3 puis 4 rouges
    //    le 20/08 — la variation naturelle est de ±1. On n'annonce donc rien en dessous de
    //    SCENARIOS.ECART_MINIMAL rouges d'écart. Ce qui reste lisible sous ce seuil, ce n'est
    //    pas le COMPTE, c'est la NATURE des rouges propres à chaque modèle (ci-dessus).
    if (rh - rp >= SCENARIOS.ECART_MINIMAL) {
      console.log('  👉 Haiku est plus rouge de ' + (rh-rp) + ' (seuil ' + SCENARIOS.ECART_MINIMAL + ') : R9 est CONFIRMÉ par un chiffre.');
      console.log('     La question « et si on passait tout le monde en Haiku ? » est close.');
    } else if (rh > rp) {
      console.log('  ⚠️ Haiku est plus rouge de ' + (rh-rp) + ' seulement — CE N\'EST PAS CONCLUANT.');
      console.log('     Deux passes du même modèle varient déjà de ±1 (mesuré le 20/08 : 3 puis 4).');
      console.log('     Il faut ' + SCENARIOS.ECART_MINIMAL + ' rouges d\'écart, ou plusieurs passes, pour conclure.');
      console.log('     ⭐ Regarde plutôt QUELS rouges sont propres à Haiku : leur nature dit plus');
      console.log('       que le compte (une charge impossible ou 3 questions d\'affilée, c\'est R9).');
    } else {
      console.log('  ⚠️ Haiku n\'est pas plus rouge — et ça ne ROUVRE RIEN.');
      console.log('     Un vert dit seulement « aucune violation détectable sur ' + liste.length + ' pièges ».');
      console.log('     Ce qui fait Milo (le ton, le naturel, le refus d\'insister) n\'est dans AUCUN');
      console.log('     de ces motifs — et l\'argument de Michel du 10/08 n\'était pas technique :');
      console.log('     « si les gens trouvent Milo nul ils ne vont pas le prendre ».');
      console.log('     👉 Ce test peut CONFIRMER la décision, il ne peut pas la renverser.');
    }
    console.log('');
  }

  // ── Rapports ──
  const ymd = new Date().toISOString().slice(0,10);
  const json = { date:ymd, mode: GO?(COMPARE?'comparaison':'reel'):'blanc',
                 modeles: (GO?PASSES:['prod']).map(k=>MODELES[k].nom), nb:liste.length, parPasse };
  fs.writeFileSync(path.join(__dirname,'eval-report.json'), JSON.stringify(json,null,2));

  const ic = e => ({vert:'✅',rouge:'❌',muet:'⛔',erreur:'⛔',blanc:'·'}[e]||'?');
  const md = ['# 🧪 Benchmark Milo (Tier 2) — ' + ymd,'',
    '**Mode :** ' + json.mode + ' · **Modèle(s) :** ' + json.modeles.join(' vs ') + ' · **Scénarios :** ' + liste.length,'',
    '> ⚠️ Un ROUGE est une preuve qu\'une règle a été violée. Un VERT dit seulement',
    '> « aucune violation détectable » — jamais « Milo respecte ses règles ».',
    (COMPARE ? '>\n> ⚠️⚠️ La comparaison est ASYMÉTRIQUE : Haiku plus rouge **confirme** R9 ; Haiku aussi\n> vert ne **rouvre rien** (le ton et le naturel ne sont dans aucun de ces motifs).' : ''),'',
    '| Scénario | Origine | ' + (GO?PASSES:['prod']).map(k=>MODELES[k].nom).join(' | ') + ' | Détail |',
    '|---|---|' + (GO?PASSES:['prod']).map(()=>'---|').join('') + '---|']
    .concat(liste.map(sc => {
      const cells = (GO?PASSES:['prod']).map(k => ic(((parPasse[k]||[]).find(r=>r.id===sc.id)||{}).etat));
      const det = (GO?PASSES:['prod']).map(k => {
        const r = (parPasse[k]||[]).find(x=>x.id===sc.id) || {};
        return (r.verdicts||[]).filter(v=>!v.ok).map(v=>v.nom+(v.detail?' ('+v.detail+')':'')).join(' · ') || r.detail || '';
      }).filter(Boolean).join(' — ');
      return '| ' + sc.id + ' — ' + sc.titre.replace(/\|/g,'/') + ' | ' + sc.origin + ' | ' + cells.join(' | ') + ' | ' + det + ' |';
    }));
  fs.writeFileSync(path.join(__dirname,'eval-report.md'), md.filter(l=>l!=='').join('\n') + '\n');
  console.log('  📄 tests/milo/eval-report.json + eval-report.md\n');

  const aDesRouges = Object.keys(parPasse).some(k => parPasse[k].some(r=>r.etat==='rouge'));
  process.exit(GO && aDesRouges ? 1 : 0);
})().catch(e => { console.error('💥 ' + (e && e.stack || e)); process.exit(2); });
