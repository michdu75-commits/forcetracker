#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════════════════
   OÙ LE CACHE DE MILO SE COUPE — mesuré, jamais estimé.     node tools/cache-coupure.js

   POURQUOI CET OUTIL EXISTE (17/08/2026, suite de docs/AUDIT-CONTEXTE-MILO.md §8bis).
   Le cache d'un prompt est un cache de PRÉFIXE : tout ce qui précède le premier caractère
   qui change est réutilisé, tout ce qui suit est refacturé. La question utile n'est donc
   jamais « quelle proportion du bloc est stable ? » mais « À QUELLE POSITION tombe la
   première différence ? » — une seule ligne mutable rangée trop haut fait payer les
   40 000 caractères parfaitement stables qui la suivent.

   ⚠️ CE QUE L'OUTIL NE FAIT PAS : il ne réordonne rien et ne juge pas. Il mesure la
   coupure pour une MUTATION donnée (valider une série, battre un record…) et dit quels
   blocs sont stables mais rangés APRÈS elle — c'est-à-dire ce qu'on paye pour rien.
   La décision de déplacer reste humaine : l'ordre du contexte n'est pas neutre pour un
   modèle, et un gain de facturation ne vaut pas une réponse moins bonne (R29).
   ════════════════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
              '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv = http.createServer((q,r)=>{
  let p = decodeURIComponent(q.url.split('?')[0]); if (p==='/') p='/index.html';
  const f = path.join(ROOT,p);
  if (!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});

/* Les trois zones, découpées comme le fait worker.js (repères EXACTS, pas approchés). */
const MARQUE_PERSO   = 'PROFIL ATHLÈTE:';
const MARQUE_INSTANT = "═══ SITUATION DE L'INSTANT ═══";

/* Les mutations qu'on mesure. La 1ʳᵉ est de loin la plus fréquente : toutes les ~90 s. */
const MUTATIONS = [
  {nom:'valider une série',   freq:'toutes les ~90 s pendant une séance', fn:'serie'},
  {nom:'battre un record',    freq:'quelques fois par mois',              fn:'record'},
  {nom:'noter une pesée',     freq:'une fois par jour au plus',           fn:'pesee'},
];

(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const c = await b.newContext({serviceWorkers:'block', viewport:{width:390,height:844},
                                timezoneId:'Europe/Paris'});
  const p = await c.newPage();
  const seed = {ft4_name:'Testeur', ft4_bw:'80', ft4_age:'30', ft4_ht:'178', ft4_gender:'H',
                ft4_act:'1.55', ft4_work:'bureau', ft4_goal:'muscle', ft4_rest:'120', ft4_ob2:'1'};
  await p.addInitScript(`(()=>{try{${Object.entries(seed).map(([k,v])=>
    `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')}
    window._demoMode=true;}catch(e){}})();`);
  await p.goto('http://localhost:'+PORT+'/index.html');
  await p.waitForTimeout(2500);

  const res = await p.evaluate(async ({MARQUE_PERSO, MARQUE_INSTANT, MUTATIONS}) => {
    // Un historique réaliste : le contexte doit contenir des séances, sinon les blocs
    // qu'on cherche à situer n'existent pas et la mesure ne veut rien dire.
    const j = d => {const x=new Date(); x.setDate(x.getDate()-d); return x.toISOString().slice(0,10);};
    S.sessions = []; S.prs = {};
    for (let k = 1; k <= 24; k++) {
      const ts = Date.now() - k*3*864e5;
      S.sessions.push({id:ts, ts, date:j(k*3), volume:5200+k*20, calories:340, duration:3600,
        startHour:18, exs:[
          {name:'Développé Couché', sets:[{kg:80,reps:8,done:true,type:'N'},{kg:85,reps:6,done:true,type:'N'}]},
          {name:'Squat à la Barre',  sets:[{kg:100,reps:6,done:true,type:'N'},{kg:105,reps:5,done:true,type:'N'}]}]});
    }
    S.prs = {'Développé Couché':{rm1:101,kg:85,reps:6,date:j(3)},
             'Squat à la Barre':{rm1:118,kg:105,reps:5,date:j(6)}};
    S.weightLog = [{date:j(2), kg:80}];
    persist();

    const zones = txt => {
      const iP = txt.indexOf(MARQUE_PERSO), iI = txt.indexOf(MARQUE_INSTANT);
      return {commun: txt.slice(0, iP), perso: txt.slice(iP, iI), instant: txt.slice(iI)};
    };
    const premiereDiff = (a, b) => {
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
      return a.length === b.length ? -1 : n;
    };

    /* ⚠️ CHAQUE MUTATION A UN « AVANT » À METTRE EN PLACE, sinon on mesure autre chose.
       Premier essai raté, gardé en mémoire : `serie()` démarrait la séance entre les deux
       relevés → le bloc SÉANCE EN COURS apparaissait, et je mesurais « démarrer une
       séance » (une fois par jour) en croyant mesurer « valider une série » (toutes les
       90 s). La coupure tombait au point d'INSERTION du bloc, pas au point de mutation. */
    const prepare = {
      serie(){ if(!S.wkt) startWorkout();
        S.wkt.exs = [{name:'Développé Couché', sets:[
          {kg:80,reps:8,done:true,type:'N'},
          {kg:82.5,reps:8,done:false,type:'N'}]}];
        persist(); },
    };
    const mutations = {
      // La série suivante passe à « faite » : la séance existait déjà des deux côtés.
      serie(){ S.wkt.exs[0].sets[1].done = true; persist(); },
      // Un nouveau record : il touche RECORDS PERSONNELS, plus haut dans le bloc.
      record(){ S.prs['Développé Couché'] = {rm1:104, kg:87.5, reps:6, date:new Date().toISOString().slice(0,10)};
        persist(); },
      pesee(){ S.weightLog.push({date:new Date().toISOString().slice(0,10), kg:80.6}); persist(); },
    };

    const REPERES = ['PROFIL ATHLÈTE:','RECORDS PERSONNELS','DERNIÈRES SÉANCES','SÉANCE EN COURS',
      'CALENDRIER','CATALOGUE','BIBLIOTHÈQUE','MÉTHODE','UNILAT','CHECK-IN','BILAN',
      'PROGRAMME','OBSERVATIONS','MÉMOIRE','REGISTRE','ADN','RÉPARTITION','PROFIL SANTÉ',
      'ANCRE','CARDIO','NUTRITION','SOMMEIL','RÉCUP'];
    const out = {mesures:[]};
    for (const m of MUTATIONS) {
      // état de départ propre à chaque mesure, PUIS mise en place de l'« avant »
      S.wkt = null; persist();
      if (prepare[m.fn]) prepare[m.fn]();
      const avant = buildCoachContext();
      mutations[m.fn]();
      const apres = buildCoachContext();
      const zA = zones(avant), zB = zones(apres);
      const cut = premiereDiff(zA.perso, zB.perso);
      out.mesures.push({
        nom: m.nom, freq: m.freq,
        total: avant.length,
        commun: zA.commun.length,
        perso: zA.perso.length,
        instant: zA.instant.length,
        coupure: cut,
        reecrit: cut < 0 ? 0 : zA.perso.length - cut,
        /* ⚠️ La carte des blocs se calcule sur l'« avant » de CETTE mutation, jamais sur
           un contexte reconstruit à côté : une séance en cours décale tout ce qui suit,
           et une carte prise dans un autre état situerait la coupure au mauvais endroit. */
        blocs: REPERES.map(r => ({nom:r, pos: zA.perso.indexOf(r)}))
                      .filter(x => x.pos >= 0).sort((a,b) => a.pos - b.pos),
      });
      // on remet l'état d'origine pour ne pas polluer la mesure suivante
      S.prs['Développé Couché'] = {rm1:101, kg:85, reps:6, date:j(3)};
      S.weightLog = [{date:j(2), kg:80}];
      S.wkt = null; persist();
    }

    return out;
  }, {MARQUE_PERSO, MARQUE_INSTANT, MUTATIONS});

  const n = x => x.toLocaleString('fr-FR');
  console.log('\n═══ OÙ LE CACHE SE COUPE — bloc personnel ═══\n');
  for (const m of res.mesures) {
    const pct = m.perso ? Math.round(m.reecrit / m.perso * 100) : 0;
    console.log(`  ${m.nom.padEnd(22)} coupure à ${n(m.coupure).padStart(7)} / ${n(m.perso)}`
      + `   → ${n(m.reecrit).padStart(6)} car. réécrits (${String(pct).padStart(2)} %)`);
    console.log(`  ${''.padEnd(22)} ${m.freq}`);
  }
  const m0 = res.mesures[0];
  console.log(`\n  Contexte total ${n(m0.total)} car. — commun ${n(m0.commun)}`
    + ` · personnel ${n(m0.perso)} · instant ${n(m0.instant)}`);

  console.log('\n═══ ORDRE DES BLOCS — état « ' + m0.nom + ' » ═══\n');
  const cut = m0.coupure;
  for (const b of m0.blocs) {
    const cote = b.pos < cut ? '✅ avant la coupure (gratuit)' : '💸 APRÈS la coupure (refacturé)';
    console.log(`  ${n(b.pos).padStart(7)}  ${b.nom.padEnd(20)} ${cote}`);
  }
  console.log('\n  ✅ = réutilisé depuis le cache · 💸 = repayé à chaque validation de série');
  console.log('  Un bloc STABLE marqué 💸 est de l\'argent perdu : il suffit de le remonter,'
    + '\n  ou de descendre le bloc mutable qui le précède.\n');

  await b.close(); srv.close();
})();
