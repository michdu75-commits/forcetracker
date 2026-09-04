#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════
   A/B « AVEC MÉMOIRE FORCE TRACKER » vs « SANS »  —  2 appels par cas, ~0,25 €
   ═══════════════════════════════════════════════════════════════════════════════

   LA QUESTION, ET ELLE N'A JAMAIS ÉTÉ MESURÉE :
     « Les données de Force Tracker rendent-elles la séance MEILLEURE que celle
       produite sans elles ? »
   Les 52 réponses du 01/09 montrent que la mémoire est utilisée — mais elles
   viennent TOUTES de personas AVEC contexte. Il n'y a jamais eu de comparaison.

   ⛔⛔ CE QU'ON RETIRE EN B, ET CE QU'ON NE RETIRE PAS.
   On enlève **la connaissance du sportif** (historique, records, blessures, état
   du jour, préférences), PAS les règles ni les instructions de Milo. C'est la
   consigne explicite de GPT : *« l'objectif est de retirer la connaissance du
   sportif, pas de transformer artificiellement Milo en mauvais chatbot »*.
   ⭐ C'est GRATUIT à obtenir : `_vcApplyPersona` remet TOUT à neutre puis applique
   la fixture. Une fixture nue laisse donc les règles intactes (elles vivent dans
   le bloc COMMUN du contexte) et vide le bloc PERSONNE. Mesuré le 03/09 :
   bloc commun 43 473 car. dans les deux cas, bloc personne 25 136 → 30 482.

   ⛔ POURQUOI CE FICHIER N'AJOUTE PAS SES CAS AU BANC DES 55 : ils seraient
   rejoués — et REPAYÉS — à chaque passe future, pour une mesure qu'on ne fait
   qu'une fois. Ici on réutilise `_vcApplyPersona` et `_vcAsk`, les MÊMES fonctions
   que `eval.js` (R13/R2) : ce n'est pas un 2ᵉ chemin, c'est le même, appelé
   autrement.

   ⚠️⚠️ CE SCRIPT NE PEUT PAS TOURNER DEPUIS UN CONTENEUR CLAUDE. Mesuré le
   03/09 : le Worker `dry-field-e931.forcetracker-app.workers.dev` est refusé par
   la politique réseau (`CONNECT tunnel failed, 403` · `connect_rejected` dans
   `__agentproxy/status`).
   ⭐⭐ ET C'EST PRÉCISÉMENT POURQUOI L'APP A REÇU SON BOUTON le 04/09 : « écrit pour
   être lancé par Michel » était FAUX tant qu'il fallait un terminal pour le lancer.
   Le bouton « 🧠 A/B mémoire » (Laboratoire Milo) joue les mêmes cas depuis son
   téléphone. Ce script garde ce que le bouton ne sait pas faire : le mode à blanc
   et le fichier relisible hors ligne.

   USAGE
     node tests/milo/ab-memoire.js            → à blanc : 0 appel, 0 €, montre
                                                les contextes et le devis
     node tests/milo/ab-memoire.js --go       → les appels réels (2 par cas)
   Le résultat brut est écrit dans tests/milo/ab-report.json (réponses entières,
   pour pouvoir les relire et les comparer sans rappeler l'API).
   ═══════════════════════════════════════════════════════════════════════════════ */

const path = require('path');
const fs   = require('fs');
const http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
const GO   = process.argv.includes('--go');

/* ⛔⛔ LES DEUX CAS NE SONT PLUS DÉFINIS ICI (04/09/2026) — ils vivent dans `coach.js`,
   sous le nom `_AB_CAS`, parce que l'app a reçu son BOUTON « 🧠 A/B mémoire » et qu'il joue
   exactement les mêmes. **Deux copies des mêmes fixtures divergeraient** : l'une gagnerait
   un correctif, l'autre non, et on comparerait deux expériences différentes en croyant
   comparer deux mémoires (**R2**). Ce script les LIT donc depuis la page.
   ⛔ Et il ÉCHOUE bruyamment si elles manquent, au lieu de se rabattre sur une copie locale :
   *un repli silencieux ferait tourner l'ancienne version des cas sans que personne le voie.*
   ⭐ CE QUI RESTE PROPRE À CE SCRIPT, et qui justifie qu'il survive au bouton : le **mode à
   blanc** (0 appel, 0 €) qui montre les contextes et le devis sans rien payer, et le fichier
   `ab-report.json` relisible hors ligne. Le bouton, lui, ne sait pas ne pas payer. */

/* ── Le serveur local + le navigateur : copié de eval.js, même mécanique ── */
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
              '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};

async function main(){
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  const srv = http.createServer((q,r)=>{
    let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
    r.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream'});
    fs.createReadStream(f).pipe(r);
  });
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;

  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const c = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, timezoneId:'Europe/Paris' });
  const page = await c.newPage();
  await page.goto('http://localhost:' + PORT + '/index.html');
  await page.waitForTimeout(2500);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  A/B MÉMOIRE FORCE TRACKER — ' + (GO ? '⚠️ APPELS RÉELS' : 'À BLANC (0 appel, 0 €)'));
  console.log('═══════════════════════════════════════════════════════════════');

  const sortie = { date:new Date().toISOString().slice(0,10), mode: GO ? 'reel' : 'blanc', cas: [] };

  /* ⛔⛔ LES CAS VIENNENT DE L'APP, PAS D'ICI (R2) — et l'absence est FATALE, pas silencieuse.
     Si `_AB_CAS` disparaissait de `coach.js` (renommé, déplacé, retiré), un repli sur une
     copie locale ferait tourner d'anciennes fixtures en affichant un résultat parfaitement
     crédible. *Un test qui se rabat sans le dire ne mesure plus ce qu'il annonce.* */
  /* ⚠️ RÉFÉRENCE NUE, PAS `window._AB_CAS` : un `const` au niveau global d'un script classique
     vit dans la portée lexicale globale et **n'est PAS posé sur `window`**. `window._AB_CAS`
     rendrait donc toujours `undefined`, et ce script conclurait « les cas ont disparu » sur un
     code parfaitement sain. (Les `function`, elles, sont bien sur `window` — d'où le mélange
     des deux styles dans les tests du projet.) */
  const CAS = await page.evaluate(() =>
    (typeof _AB_CAS !== 'undefined' && Array.isArray(_AB_CAS)) ? _AB_CAS : null);
  if (!CAS || !CAS.length) {
    console.error('\n⛔ `_AB_CAS` introuvable dans la page — les cas vivent dans coach.js depuis');
    console.error('   le 04/09/2026 (le bouton « 🧠 A/B mémoire » les joue). Rien n\'a été lancé.');
    await b.close(); srv.close(); process.exit(2);
  }
  console.log('  ' + CAS.length + ' cas lus depuis coach.js (`_AB_CAS`) — aucune copie locale.');

  for (const cas of CAS) {
    console.log('\n▸ ' + cas.id + ' — ' + cas.titre);
    console.log('  demande : « ' + cas.demande + ' »');
    const paire = {};
    for (const cote of ['avec', 'sans']) {
      const r = await page.evaluate(async ({ apply, demande, pourDeVrai }) => {
        const manque = ['_vcApplyPersona','_vcAsk','buildCoachContext','_abMesureContexte'].filter(f => typeof window[f] !== 'function');
        if (manque.length) return { erreur: 'fonction(s) absente(s) : ' + manque.join(', ') };
        window._demoMode = true;
        try {
          _vcApplyPersona({ apply });
          /* ⭐ LA MESURE APPARTIENT À L'APP (`_abMesureContexte`, coach.js) — on ne recalcule
             pas le découpage ici. Elle était recopiée jusqu'au 04/09, et les deux copies
             avaient DÉJÀ divergé (le marqueur « SITUATION DE L'INSTANT » manquait d'un côté) :
             *deux formules qui ne comptent pas pareil rendent deux écarts de mémoire
             différents pour la même passe* — le chiffre même qui dit si l'expérience a un sens. */
          const mesure = _abMesureContexte(buildCoachContext(demande));
          if (!pourDeVrai) return { blanc:true, mesure };
          const rep = await _vcAsk({ scenario: demande, coachEmail:'', history:[] });
          return { ok: !!rep.ok, reply: rep.reply || '', err: rep.err || '',
                   ms: rep.ms || 0, modele: rep.modele || '', mesure };
        } catch (e) { return { erreur: (e && e.message) || String(e) }; }
        finally { window._demoMode = false; try { if (typeof load === 'function') load(); } catch(e){} }
      }, { apply: cas[cote], demande: cas.demande, pourDeVrai: GO });

      if (r.erreur) { console.log('  ⛔ ' + cote + ' : ' + r.erreur); paire[cote] = r; continue; }
      const m = r.mesure || {};
      console.log('  ' + (cote === 'avec' ? 'A — AVEC mémoire ' : 'B — SANS mémoire ') +
                  ': contexte ' + m.total + ' car. (dont ' + m.propre + ' propres à la personne)' +
                  (r.reply ? ('  · réponse ' + r.reply.length + ' car. en ' + r.ms + ' ms') : ''));
      if (r.err) console.log('     ⚠️ ' + r.err);
      paire[cote] = r;
    }
    /* ⭐ LE CHIFFRE QUI DIT SI L'EXPÉRIENCE A UN SENS : si les deux contextes se
       ressemblent, on ne mesure rien du tout. On le dit AVANT de lire les réponses. */
    const dA = (paire.avec && paire.avec.mesure) || {}, dB = (paire.sans && paire.sans.mesure) || {};
    if (dA.propre && dB.propre) {
      console.log('  ⭐ écart de mémoire : +' + (dA.propre - dB.propre) + ' car. côté A' +
                  ((dA.propre - dB.propre) < 2000 ? '   ⛔ TROP FAIBLE : la fixture ne porte pas assez' : ''));
    }
    sortie.cas.push({ id:cas.id, titre:cas.titre, demande:cas.demande,
                      attendus:cas.attendus, avec:paire.avec, sans:paire.sans });
  }

  const dest = path.join(__dirname, 'ab-report.json');
  fs.writeFileSync(dest, JSON.stringify(sortie, null, 1), 'utf8');
  console.log('\n📄 ' + dest);
  if (!GO) {
    console.log('\n  Rien n\'a été appelé. Pour lancer les 4 appels (~0,25 €) :');
    console.log('     node tests/milo/ab-memoire.js --go\n');
  } else {
    console.log('\n  ⚠️ Les réponses ENTIÈRES sont dans le fichier — c\'est ce qu\'il faut relire.');
    console.log('     La comparaison structurelle se fait sur ce fichier, sans rappeler l\'API.\n');
  }
  await b.close(); srv.close();
}

main().catch(e => { console.error(e); process.exit(2); });
