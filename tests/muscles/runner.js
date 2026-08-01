#!/usr/bin/env node
/**
 * LE MOTEUR « MUSCLES TRAVAILLÉS » — garde-fou sur TOUT le catalogue (ft-v666).
 *
 * Pourquoi ce test existe : le 29/07/2026, après avoir déplacé les érecteurs du
 * rachis de « dos » vers « gainage » (ft-v665), j'avais vérifié sur **9 types de
 * séances** et conclu « aucune couleur ne change ». Michel a demandé : *« sur tous
 * les mouvements tu as vérifié ? »* — non. En passant les **287 exercices** du
 * catalogue, 4 changeaient bel et bien de couleur.
 * *Tester des archétypes n'est pas tester le catalogue.*
 *
 * Ce passage a révélé que **86 exercices sur 287 (30 %)** n'avaient AUCUNE
 * correspondance musculaire — comblé en ft-v667 (rattrapage par famille).
 *
 * Il fige quatre choses :
 *   1. la FIGURINE ne dépend jamais du découpage en régions (elle lit les muscles) ;
 *   2. les 4 exercices de fessiers restent classés « bas du corps » (et non full body) ;
 *   3. **TOUT** le catalogue a une correspondance musculaire — ce compte ne doit
 *      jamais remonter au-dessus de 0 ;
 *   4. les EXCLUSIONS des règles génériques tiennent (le « leg curl » n'est pas
 *      du biceps, le développé couché n'est pas de l'épaule) — et la règle de
 *      rattrapage reste la DERNIÈRE de `_MEX`, sinon elle serait morte.
 *
 * Lancer : node tests/muscles/runner.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};

// ✅ ft-v667 : le trou est COMBLÉ — 0 exercice sans correspondance musculaire.
// Ce chiffre ne doit JAMAIS remonter : tout exercice ajouté au catalogue doit être
// attrapé par `_MEX` (au pire par une règle générique de fin de liste).
const SANS_MUSCLES_CONNUS = 0;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);

console.log('\n─── MOTEUR MUSCLES — TOUT LE CATALOGUE ───────────────────');
const r=await p.evaluate(()=>{
  const noms=[]; try{ (EXLIB||[]).forEach(e=>{ if(e&&e.n)noms.push(e.n); }); }catch(e){}
  const E=n=>({name:n,sets:[{kg:100,reps:8,done:true,type:'N'}]});
  const out={total:noms.length, sansMuscles:[], figKo:[], regions:{}};
  for(const n of noms){
    const d=_mscScores([E(n)])||{}; const sc=d.sc||{};
    if(!Object.keys(sc).length){ out.sansMuscles.push(n); continue; }
    // la figurine se rend depuis les MUSCLES : elle doit être stable et non vide
    const svg=_mscSVG({sc:sc, ind:d.ind||{}});
    if(!svg||svg.length<200||svg!==_mscSVG({sc:sc, ind:d.ind||{}})) out.figKo.push(n);
    out.regions[n]=_calSessRegion({date:'2026-07-29',exs:[E(n)]});
  }
  return out;
});

t('le catalogue est bien chargé (> 250 exercices)', r.total>250, 'reçu '+r.total);
t('⭐ la FIGURINE se rend pour TOUS les exercices reconnus (stable, non vide)',
  r.figKo.length===0, r.figKo.slice(0,8).join(', '));

// ── Les 4 exercices de FESSIERS : « bas du corps », jamais « full body » ─────
// Avant ft-v665 ils étaient classés full body parce que le bas du dos gonflait la
// part « haut+dos ». Un hip thrust n'est pas une séance full body.
for(const ex of ['Hip Thrust Barre (Poussée de Hanche)','Pont Fessier (Glute Bridge)',
                 'Extension Fessiers Arrière (Kickback)','Tirage Cable Fessiers (Cable Pull Through)']){
  const reg=r.regions[ex];
  t('« '+ex.replace(/\s*\(.*\)/,'')+' » = bas du corps (et non full body)',
    reg==='bas', 'reçu '+reg);
}
// les grands mouvements gardent leur classement
t('le squat reste « bas du corps »', r.regions['Squat à la Barre']==='bas', 'reçu '+r.regions['Squat à la Barre']);
t('le développé couché reste « haut du corps »', r.regions['Développé Couché']==='haut', 'reçu '+r.regions['Développé Couché']);
t('le soulevé de terre reste « full body »', r.regions['Soulevé de Terre']==='full', 'reçu '+r.regions['Soulevé de Terre']);

// ── Aucune figurine vide : le trou de 86 exercices est comblé (ft-v667) ─────
console.log('     ℹ️  ' + r.sansMuscles.length + ' exercice(s) sur ' + r.total +
            ' sans correspondance musculaire (86 avant ft-v667)');
t('⭐ TOUT le catalogue a une correspondance musculaire (aucune figurine vide)',
  r.sansMuscles.length<=SANS_MUSCLES_CONNUS,
  'reçu ' + r.sansMuscles.length + ' — nouveaux non mappés : ' + r.sansMuscles.slice(0,6).join(', '));
// ── Les exclusions qui doivent TENIR malgré les règles génériques (ft-v667) ──
// ⚠️ Le piège du rattrapage : une règle « curl » trop large attraperait le LEG curl
// (ischio-jambiers) et le classerait en biceps. Ces témoins figent les cas limites.
const temoins=await p.evaluate(()=>{
  const E=n=>({name:n,sets:[{kg:100,reps:8,done:true,type:'N'}]});
  const sc=n=>(_mscScores([E(n)])||{}).sc||{};
  return {
    legCurl:sc('Leg Curl Couché Machine'), curlIschio:sc('Curl Ischio-jambiers (Leg Curl)'),
    curlBiceps:sc('Curl Barre'), dcCouche:sc('Développé Couché'),
    dArnold:sc('Développé Arnold (Arnold Press)'), presseCuisses:sc('Presse à Cuisses'),
    // la dernière règle de _MEX doit rester le rattrapage « développé » (sinon règle morte)
    nbRegles:(typeof _MEX!=='undefined')?_MEX.length:0,
    derniereAttrape:(typeof _MEX!=='undefined')&&_MEX[_MEX.length-1].re.test('developpe halteres assis')
  };
});
t('⚠️ le LEG curl reste des ISCHIOS (pas du biceps)',
  temoins.legCurl.hamstrings===2&&!temoins.legCurl.biceps, JSON.stringify(temoins.legCurl));
t('⚠️ « Curl Ischio-jambiers » aussi', temoins.curlIschio.hamstrings===2&&!temoins.curlIschio.biceps,
  JSON.stringify(temoins.curlIschio));
t('un curl de BRAS est bien du biceps', temoins.curlBiceps.biceps===2, JSON.stringify(temoins.curlBiceps));
t('le développé COUCHÉ reste des pectoraux', temoins.dcCouche.pec===2&&!temoins.dcCouche['side-delt'],
  JSON.stringify(temoins.dcCouche));
t('un développé d\'ÉPAULES est bien des épaules',
  temoins.dArnold['front-delt']===2&&temoins.dArnold['side-delt']===2&&!temoins.dArnold.pec,
  JSON.stringify(temoins.dArnold));
t('la presse à cuisses reste des quadriceps', temoins.presseCuisses.quads===2, JSON.stringify(temoins.presseCuisses));
t('⚠️ la DERNIÈRE règle de _MEX est bien le rattrapage générique (sinon règle morte)',
  temoins.derniereAttrape===true, 'nb règles : '+temoins.nbRegles);

// ── Les motifs TROP LARGES : deux bugs trouvés en auditant les tables (ft-v669) ──
const larges=await p.evaluate(()=>{
  const E=n=>({name:n,sets:[{done:true}]});
  const sc=n=>(_mscScores([E(n)])||{}).sc||{};
  return {extPoignet:sc('Extension Poignet Barre'), curlPoignet:sc('Curl Poignet Barre'),
          tbarMachine:sc('Rowing T-Bar Machine'), tbarLandmine:sc('Rowing Landmine (T-Bar)')};
});
// `t.?bar` (écrit pour le T-Bar Row) attrapait « poigneT BARre » → dorsaux/trapèzes.
t('⭐ « Extension Poignet Barre » = avant-bras (pas du dos !)',
  larges.extPoignet.forearms===2&&!larges.extPoignet.lats, JSON.stringify(larges.extPoignet));
t('⭐ « Curl Poignet Barre » = avant-bras (ni dos, ni biceps)',
  larges.curlPoignet.forearms===2&&!larges.curlPoignet.lats&&!larges.curlPoignet.biceps,
  JSON.stringify(larges.curlPoignet));
t('… et les VRAIS T-Bar Row restent du dos', larges.tbarMachine.lats===2&&larges.tbarLandmine.lats===2,
  JSON.stringify(larges.tbarMachine));

// ── L'INTENSITÉ (MET) se déduit des MUSCLES, plus d'une 2ᵉ liste (ft-v668) ───
// Avant : 142 exercices sur 249 tombaient sur « isolation » par défaut, dont 56 gros
// mouvements. Retour Michel : « le calcul des calories est bien respecté ? » — non.
const met=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e&&e.n).filter(Boolean))];
  const par={}; for(const n of noms){ const m=getExerciseMET(n); par[m]=(par[m]||0)+1; }
  const g=n=>getExerciseMET(n);
  return {par, total:noms.length,
    squat:g('Squat à la Barre'), dc:g('Développé Couché'), souleve:g('Soulevé de Terre'),
    fentes:g('Fentes'), presse:g('Presse à Cuisses'), thruster:g('Thruster'),
    curl:g('Curl Biceps'), curlIncline:g('Curl Incliné'), legExt:g('Extension Quadriceps (Leg Extension)'),
    presseMollets:g('Presse Mollets (Leg Press)'), elevLat:g('Élévations Latérales'),
    inconnu:g('Un exercice qui n\'existe pas')};
});
t('⭐ le squat reste à l\'intensité « bas du corps » (6,5)', met.squat===6.5, 'reçu '+met.squat);
t('⭐ le développé couché reste « haut du corps » (5,5)', met.dc===5.5, 'reçu '+met.dc);
t('le soulevé de terre reste à 6,5', met.souleve===6.5, 'reçu '+met.souleve);
t('⭐ CORRIGÉ : les fentes passent d\'isolation à « bas du corps »', met.fentes===6.5, 'reçu '+met.fentes);
t('⭐ CORRIGÉ : la presse à cuisses est un gros mouvement', met.presse===6.5, 'reçu '+met.presse);
t('⭐ CORRIGÉ : le thruster passe en haltérophilie (8)', met.thruster===8, 'reçu '+met.thruster);
t('un curl de biceps reste de l\'isolation (4)', met.curl===4, 'reçu '+met.curl);
t('⭐ CORRIGÉ : « Curl Incliné » n\'est plus pris pour un développé incliné',
  met.curlIncline===4, 'reçu '+met.curlIncline);
t('⭐ CORRIGÉ : le leg extension est bien de l\'isolation', met.legExt===4, 'reçu '+met.legExt);
t('⭐ CORRIGÉ : « Presse Mollets » n\'est plus prise pour une presse à jambes',
  met.presseMollets===4, 'reçu '+met.presseMollets);
t('les élévations latérales restent de l\'isolation', met.elevLat===4, 'reçu '+met.elevLat);
t('un exercice inconnu ne se voit PAS attribuer une grosse dépense',
  met.inconnu===4, 'reçu '+met.inconnu);
console.log('     ℹ️  intensités : ' + Object.keys(met.par).sort().map(k=>k+' → '+met.par[k]).join(' · ')
            + '   (avant ft-v668 : 4 → 142)');
t('la valeur par défaut ne couvre plus la majorité du catalogue',
  (met.par['4']||0) < met.total/2, (met.par['4']||0)+' sur '+met.total);

// ── SCHÉMAS DE MOUVEMENT : couverture + les pièges de mots-clés (ft-v670) ────
// Taxonomie de référence : pousser · tirer · flexion de genou · charnière de hanche ·
// rotation · PORTER. Il manquait « porter » et l'explosif → 27 exercices sans schéma,
// donc « accessoire » par défaut pour Milo et garde-fou anti-fusion désactivé.
const mov=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e&&e.n).filter(Boolean))];
  const sans=noms.filter(n=>!_movPattern(n));
  const g=n=>_movPattern(n)+'|'+_exRole(n);
  return {total:noms.length, sans:sans.length, sansListe:sans,
    rackPull:g('Tirage en Rack (Rack Pull)'), devAssis:g('Développé Haltères Assis'),
    isoLat:g('Tirage Iso-Latéral Hammer Strength'), arrache:g('Arraché Haltère (Dumbbell Snatch)'),
    cleanJerk:g('Clean & Jerk'), farmer:g("Farmer's Walk"), boxJump:g('Box Jump'),
    burpee:g('Burpees'), hollow:g('Hollow Body'),
    // ⚠️ les deux pièges : « wall sit » ne doit pas devenir du gainage, et une mobilité
    // d'épaule ne doit pas devenir de l'haltérophilie ANCRE.
    wallSit:g('Chaise (Wall Sit)'), passageEpaule:_movPattern("Passage d'Épaule Élastique"),
    squat:g('Squat à la Barre'), dc:g('Développé Couché')};
});
console.log('     ℹ️  ' + mov.sans + ' exercice(s) sur ' + mov.total + ' sans schéma de mouvement (27 avant ft-v670)');
t('⭐ moins de 10 exercices sans schéma de mouvement', mov.sans<10, mov.sansListe.join(', '));
t('⭐ « Tirage en Rack » est une charnière de hanche, et une ANCRE', mov.rackPull==='hip-hinge|ancre', mov.rackPull);
t('⭐ « Développé Haltères Assis » = poussée verticale, ANCRE', mov.devAssis==='poussee-verticale|ancre', mov.devAssis);
t('⭐ « Tirage Iso-Latéral » = tirage horizontal, ANCRE', mov.isoLat==='tirage-horizontal|ancre', mov.isoLat);
t('⭐ l\'arraché et l\'épaulé-jeté sont de l\'haltérophilie, et des ANCRES',
  mov.arrache==='halterophilie|ancre'&&mov.cleanJerk==='halterophilie|ancre', mov.arrache+' / '+mov.cleanJerk);
t('⭐ le farmer\'s walk est un PORTÉ — accessoire, pas une ancre', mov.farmer==='porte|accessoire', mov.farmer);
t('⭐ box jump et burpees = saut/pliométrie, JAMAIS des ancres',
  mov.boxJump==='saut-plyo|accessoire'&&mov.burpee==='saut-plyo|accessoire', mov.boxJump+' / '+mov.burpee);
t('le hollow body est du gainage', mov.hollow==='gainage-abdos|accessoire', mov.hollow);
// les deux pièges de mots-clés trop courts, chacun trouvé par ce test avant livraison
t('⚠️ PIÈGE : « Chaise (Wall Sit) » reste un SQUAT (pas du gainage via « l sit »)',
  mov.wallSit==='squat|ancre', mov.wallSit);
t('⚠️ PIÈGE : une mobilité d\'épaule n\'est PAS de l\'haltérophilie',
  mov.passageEpaule!=='halterophilie', 'reçu '+mov.passageEpaule);
t('les fondamentaux ne bougent pas', mov.squat==='squat|ancre'&&mov.dc==='poussee-horizontale|ancre',
  mov.squat+' / '+mov.dc);

// ── L'ÉCARTÉ BUSTE PENCHÉ n'est PAS un exercice de pectoraux (30/07, capture de la fille de
// Michel) : la règle de famille « ecarte → pec » attrapait « Écarté Haltères Buste Penché »
// (exercice PERSO → figurine des pecs) et « Écarté Arrière Élastique » (catalogue). Même
// piège que « poigneT BARre » : la règle précise placée APRÈS la générique était morte.
const ois=await p.evaluate(()=>{
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  return {perso:g('Écarté Haltères Buste Penché'), persoMov:_movPattern('Écarté Haltères Buste Penché'),
          arriere:g('Écarté Arrière Élastique'), arriereMov:_movPattern('Écarté Arrière Élastique'),
          temoin:g('Écarté Haltères'), temoinMov:_movPattern('Écarté Haltères'),
          oiseau:_movPattern('Oiseau')};
});
t('⭐ « Écarté Haltères Buste Penché » (perso) = ARRIÈRE d\'épaule, plus jamais les pecs',
  ois.perso==='rear-delt,side-delt,traps', 'reçu '+ois.perso);
t('⭐ … et son schéma = élévation d\'épaule, pas une poussée pectorale',
  ois.persoMov==='elevation-epaules', 'reçu '+ois.persoMov);
t('⭐ « Écarté Arrière Élastique » (catalogue) = arrière d\'épaule aussi',
  ois.arriere==='rear-delt,side-delt,traps'&&ois.arriereMov==='elevation-epaules', ois.arriere+' / '+ois.arriereMov);
t('témoin : « Écarté Haltères » (couché) RESTE des pectoraux',
  ois.temoin==='front-delt,pec'&&ois.temoinMov==='poussee-horizontale', ois.temoin+' / '+ois.temoinMov);
t('témoin : l\'Oiseau garde son schéma élévation d\'épaule', ois.oiseau==='elevation-epaules', 'reçu '+ois.oiseau);

// ── AUDIT DU 31/07 (demande Michel : « revérifie bien les exercices ») : 6 exercices de plus
// avaient la MÊME maladie (règle générique avant la précise). Chacun figé ici, avec son témoin.
const au=await p.evaluate(()=>{
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  return {legCurlH:g('Leg Curl Haltère'),                  legCurlHMov:_movPattern('Leg Curl Haltère'),
          curlH:g('Curl Haltères'),
          rotAbd:g('Rotation Externe Épaule Abduction'),
          abdCuisses:g('Abduction Cuisses (Leg Abduction)'),
          upright:g('Tirage Vertical (Upright Row)'),      uprightMov:_movPattern('Tirage Vertical (Upright Row)'),
          traction:g('Traction Lestée'),                   rowing:g('Rowing Barre'),
          jeff:g('Jefferson Curl'),
          kbFess:_movPattern('Extension Fessiers Arrière (Kickback)'),
          kbMachine:_movPattern('Kickback Machine'),
          kbTri:_movPattern('Extension Triceps Arrière (Kickback)'),
          tirInc:_movPattern('Tirage Incliné Poulie Haute')};
});
t('⭐ « Leg Curl Haltère » = ISCHIOS, plus jamais le biceps (« curl halter » l\'attrapait)',
  au.legCurlH==='calves,glutes,hamstrings,lower-back'&&au.legCurlHMov==='flexion-genou', au.legCurlH+' / '+au.legCurlHMov);
t('témoin : « Curl Haltères » reste un biceps', au.curlH==='biceps,forearms', 'reçu '+au.curlH);
t('⭐ « Rotation Externe Épaule Abduction » = coiffe des rotateurs, plus jamais les FESSIERS',
  au.rotAbd==='rear-delt,traps', 'reçu '+au.rotAbd);
t('témoin : « Abduction Cuisses » reste des fessiers', au.abdCuisses.indexOf('glutes')===0, 'reçu '+au.abdCuisses);
t('⭐ « Tirage Vertical (Upright Row) » = épaules/trapèzes + élévation, plus jamais un tirage dorsal',
  au.upright==='biceps,side-delt,traps'&&au.uprightMov==='elevation-epaules', au.upright+' / '+au.uprightMov);
t('témoins : traction et rowing restent des dorsaux',
  au.traction.indexOf('lats')>=0&&au.rowing.indexOf('lats')>=0, au.traction+' / '+au.rowing);
t('⭐ « Jefferson Curl » = lombaires/ischios (mobilité), plus jamais un biceps',
  au.jeff==='glutes,hamstrings,lower-back', 'reçu '+au.jeff);
t('⭐ un kickback de FESSIERS = charnière de hanche, plus jamais une extension de triceps',
  au.kbFess==='hip-hinge'&&au.kbMachine==='hip-hinge', au.kbFess+' / '+au.kbMachine);
t('témoin : le kickback TRICEPS garde son schéma (malgré le stemming « triceps » → « tricep »)',
  au.kbTri==='extension-triceps', 'reçu '+au.kbTri);
t('⭐ « Tirage Incliné Poulie Haute » = un TIRAGE, plus jamais une poussée (kw « incline »)',
  au.tirInc==='tirage-vertical', 'reçu '+au.tirInc);

// ── LES 14 EXERCICES AJOUTÉS le 01/08/2026 (animations du dossier source de Michel) :
// chacun doit être classé (muscles + schéma) dès son entrée au catalogue — jamais d'exercice muet.
const quatorze=await p.evaluate(()=>{
  const noms=['Pompes','Développé Couché avec Chaînes','Développé Couché Larsen (Larsen Press)',
    'Développé Couché Unilatéral Kettlebell','Développé Incliné Poulie','Écarté Incliné Haltères',
    'Écarté Hyght (Hyght Fly)','Hex Press Smith Machine','Chest Press Poulie Assis',
    'Svend Press (Serrage de Plaque)','Presse à Cuisses sur le Côté','Hack Squat Assis',
    'Overhead Squat Haltères','Arraché Debout (Muscle Snatch)'];
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{});};
  const out={dansExlib:0,avecMuscles:0,avecPattern:0,details:{}};
  for(const n of noms){
    if((EXLIB||[]).some(e=>e&&e.n===n))out.dansExlib++;
    const m=g(n); if(m.length)out.avecMuscles++;
    if(_movPattern(n))out.avecPattern++;
  }
  out.svend=g('Svend Press (Serrage de Plaque)').sort().join(',');
  out.ecarteIncline=g('Écarté Incliné Haltères').sort().join(',');
  out.snatchPat=_movPattern('Arraché Debout (Muscle Snatch)');
  return out;
});
t('⭐ les 14 exercices du 01/08 sont au catalogue, TOUS avec muscles ET schéma',
  quatorze.dansExlib===14&&quatorze.avecMuscles===14&&quatorze.avecPattern===14,
  JSON.stringify(quatorze));
t('le Svend Press = pectoraux (nouvelle règle hex/svend)', quatorze.svend==='front-delt,pec,triceps', quatorze.svend);
t('l\'Écarté Incliné reste un ÉCARTÉ (pas un développé — pec sans triceps)',
  quatorze.ecarteIncline==='front-delt,pec', quatorze.ecarteIncline);
// 01/08 après-midi (envoi Michel « sans rien te dire ») : le Développé Décliné Haltères a sa
// démo, et l'Écarté Décliné Haltères ENTRE au catalogue — même piège que l'incliné : la règle
// des développés déclinés l'attrapait (triceps + MET 5,5 pour une isolation).
const decl=await p.evaluate(()=>{
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  return {ecarte:g('Écarté Décliné Haltères'),
          dev:g('Développé Décliné Haltères'),
          dansExlib:(EXLIB||[]).some(e=>e&&e.n==='Écarté Décliné Haltères')};
});
t('⭐ l\'Écarté DÉCLINÉ est au catalogue, classé ÉCARTÉ (pec sans triceps)',
  decl.dansExlib&&decl.ecarte==='front-delt,pec', decl.ecarte);
t('témoin : le Développé Décliné Haltères reste un développé', decl.dev==='front-delt,pec,triceps', decl.dev);
t('le Muscle Snatch = haltérophilie', quatorze.snatchPat==='halterophilie', quatorze.snatchPat);

// ── LOT « QUADRI » du 01/08 (soir) : 16 exercices jambes, dont 5 ÉLASTIQUE et 3 TRX.
// Le matériel est dans le NOM (décision Michel) — donc ces noms passent par les mêmes règles que
// les exercices classiques : on vérifie que « élastique »/« TRX » ne dérègle RIEN au classement.
const quadri=await p.evaluate(()=>{
  const noms=['Squat Poids du Corps (Air Squat)','Fentes Croisées (Curtsy Lunge)','Jefferson Squat',
    'Soulevé de Terre Valise (Suitcase)','Squat Sauté (Jump Squat)','Squat avec Rotation du Tronc',
    'Sissy Squat Machine','Extension Quadriceps Unilatérale Machine à Dips','Squat Bulgare Élastique',
    'Extension Quadriceps Élastique','Overhead Squat Élastique','Split Squat Élastique (Fente Statique)',
    'Squat Barre avec Bandes Élastiques','Squat TRX (Sangles)','Split Squat TRX (Sangles)',
    'Squat Pistol TRX (Sangles)'];
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  const out={dansExlib:0,avecMuscles:0,avecPattern:0};
  for(const n of noms){
    if((EXLIB||[]).some(e=>e&&e.n===n))out.dansExlib++;
    if(g(n).length)out.avecMuscles++;
    if(_movPattern(n))out.avecPattern++;
  }
  // la version élastique doit se classer comme sa version classique (même mouvement, autre charge)
  out.legExtElast=g('Extension Quadriceps Élastique');
  out.legExtClass=g('Extension Quadriceps (Leg Extension)');
  out.bulgareElast=_movPattern('Squat Bulgare Élastique');
  out.bulgareClass=_movPattern('Squat Bulgare');
  out.trxSquat=_movPattern('Squat TRX (Sangles)');
  out.valise=_movPattern('Soulevé de Terre Valise (Suitcase)');
  return out;
});
t('⭐ les 16 exercices « quadri » sont au catalogue, TOUS avec muscles ET schéma',
  quadri.dansExlib===16&&quadri.avecMuscles===16&&quadri.avecPattern===16, JSON.stringify(quadri));
t('la version ÉLASTIQUE se classe comme la version classique (leg extension = quads seuls)',
  quadri.legExtElast==='quads'&&quadri.legExtClass==='quads', quadri.legExtElast+' vs '+quadri.legExtClass);
t('témoin : « Élastique » ne change pas le schéma de mouvement (bulgare = fente des 2 côtés)',
  quadri.bulgareElast==='fente'&&quadri.bulgareClass==='fente', quadri.bulgareElast+' vs '+quadri.bulgareClass);
t('« TRX (Sangles) » reste un squat · le Soulevé de Terre Valise est une charnière de hanche',
  quadri.trxSquat==='squat'&&quadri.valise==='hip-hinge', quadri.trxSquat+' / '+quadri.valise);

t('0 erreur JS', errs.length===0, errs.join(' | '));

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
