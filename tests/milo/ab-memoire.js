#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════════
   A/B « AVEC MÉMOIRE FORCE TRACKER » vs « SANS »  —  4 appels, ~0,25 €
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

   ⛔ POURQUOI CE FICHIER N'AJOUTE PAS 4 SCÉNARIOS AU BANC DES 55 : ils seraient
   rejoués — et REPAYÉS — à chaque passe future, pour une mesure qu'on ne fait
   qu'une fois. Ici on réutilise `_vcApplyPersona` et `_vcAsk`, les MÊMES fonctions
   que `eval.js` (R13/R2) : ce n'est pas un 2ᵉ chemin, c'est le même, appelé
   autrement.

   ⚠️⚠️ CE SCRIPT NE PEUT PAS TOURNER DEPUIS UN CONTENEUR CLAUDE. Mesuré le
   03/09 : le Worker `dry-field-e931.forcetracker-app.workers.dev` est refusé par
   la politique réseau (`CONNECT tunnel failed, 403` · `connect_rejected` dans
   `__agentproxy/status`). Il est donc écrit pour être lancé PAR MICHEL, et
   éprouvé ici hors ligne (`fetch` remplacé) — tout est vérifié sauf les 4 appels.

   USAGE
     node tests/milo/ab-memoire.js            → à blanc : 0 appel, 0 €, montre
                                                les contextes et le devis
     node tests/milo/ab-memoire.js --go       → 4 appels réels
   Le résultat brut est écrit dans tests/milo/ab-report.json (réponses entières,
   pour pouvoir les relire et les comparer sans rappeler l'API).
   ═══════════════════════════════════════════════════════════════════════════════ */

const path = require('path');
const fs   = require('fs');
const http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
const GO   = process.argv.includes('--go');

/* ── LES DEUX CAS, CHOISIS PARCE QUE LA MÉMOIRE PEUT Y CHANGER LA SÉANCE ──
   GPT : « ne choisis pas quatre demandes génériques ». Chaque cas est construit
   pour qu'une information de Force Tracker ait une raison de modifier la
   prescription — sinon on mesurerait du bruit. */

const j = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0,10); };

/* Le socle IDENTIQUE des deux côtés : ce qu'un chatbot saurait de toute façon. */
const SOCLE = { name:'Michel', gender:'H', age:46, height:178, bw:85,
                goal:'muscle', discipline:'muscu', level:'confirme' };

/* ⚠️ 24 séances sur 10 semaines, avec des charges qui PROGRESSENT : sans
   progression, « exploiter l'historique » n'aurait rien à exploiter. */
function historiqueDC(){
  const s = [];
  for (let i = 0; i < 24; i++) {
    const semaine = Math.floor(i / 2.4);
    const kg = 80 + semaine * 1.5;                       // 80 → 93,5
    s.push({ ts: 9000 + i, date: j(i * 3 + 1), volume: 8200, synced: true, duration: 62,
             exs: [{ name:'Développé Couché',
                     sets: Array.from({length:4}, () => ({ kg: Math.round(kg/2.5)*2.5, reps:5, done:true, type:'N' })) }] });
  }
  return s;
}

const CAS = [
  {
    id: 'AB-1',
    titre: 'Historique de performance — la séance exploite-t-elle les charges réelles ?',
    demande: 'Crée-moi ma séance développé couché aujourd\'hui.',
    /* A : il sait où elle en est. B : il ne sait rien d'elle. */
    avec: Object.assign({}, SOCLE, {
      sessions: historiqueDC(),
      prs: { 'Développé Couché': { kg:95, reps:4, rm1:110, date:j(9) } },
      weightLog: [ {date:j(21), kg:85.4}, {date:j(7), kg:85.1}, {date:j(0), kg:85} ],
      defRest: 180
    }),
    sans: Object.assign({}, SOCLE),
    /* ce qu'on regardera : les charges prescrites sont-elles calées sur 95×4 / 1RM 110 ? */
    attendus: ['charge prescrite cohérente avec un 1RM de 110 kg (≈ 85-95 kg sur 5 reps)',
               'les paliers partent d\'une charge réaliste, pas d\'un chiffre rond arbitraire']
  },
  {
    id: 'AB-2',
    titre: 'Douleur active — la séance CHANGE-t-elle, ou juste le commentaire ?',
    demande: 'Fais-moi une séance haut du corps pour ce soir.',
    avec: Object.assign({}, SOCLE, {
      sessions: historiqueDC(),
      prs: { 'Développé Couché': { kg:95, reps:4, rm1:110, date:j(9) } },
      healthProfile: { injuries:[{ zone:'epaule', status:'active', since:j(20) }],
                       conditions:[], notes:'' },
      /* ⭐ possible seulement depuis ft-v1106 : avant, `dayState` était forcé à null */
      dayState: { date:new Date().toISOString().slice(0,10), energy:2, sleep:5,
                  pains:[{ zone:'epaule', side:'R' }] },
      sleepLog: [{ date:j(0), hours:5, energy:2 }],
      defRest: 180
    }),
    sans: Object.assign({}, SOCLE),
    attendus: ['le développé au-dessus de la tête disparaît ou s\'allège',
               'le volume de poussée baisse',
               'la différence est DANS la séance, pas seulement dans une phrase']
  }
];

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

  for (const cas of CAS) {
    console.log('\n▸ ' + cas.id + ' — ' + cas.titre);
    console.log('  demande : « ' + cas.demande + ' »');
    const paire = {};
    for (const cote of ['avec', 'sans']) {
      const r = await page.evaluate(async ({ apply, demande, pourDeVrai }) => {
        const manque = ['_vcApplyPersona','_vcAsk','buildCoachContext'].filter(f => typeof window[f] !== 'function');
        if (manque.length) return { erreur: 'fonction(s) absente(s) : ' + manque.join(', ') };
        window._demoMode = true;
        try {
          _vcApplyPersona({ apply });
          const ctx = buildCoachContext(demande);
          /* on découpe comme worker.js découpe, pour dire ce que la mémoire PÈSE */
          const pi = ctx.indexOf('PROFIL ATHLÈTE:');
          const mi = ctx.indexOf("═══ SITUATION DE L'INSTANT ═══");
          const mesure = { total: ctx.length,
                           commun: pi > 0 ? pi : 0,
                           propre: (pi > 0 && mi > pi) ? (ctx.length - pi) : 0 };
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
