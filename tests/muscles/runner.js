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
  // ⚠️ ATTENTE RÉVISÉE le 02/08 (pas une régression) : en poussée verticale le deltoïde
  // ANTÉRIEUR est le moteur, le LATÉRAL n'est qu'un assistant — il passe donc de 2 à 1.
  // Ce que ce test protège n'a pas changé : c'est bien un exercice d'épaules, pas de pecs.
  temoins.dArnold['front-delt']===2&&temoins.dArnold['side-delt']===1&&!temoins.dArnold.pec,
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
    presseMollets:g('Presse Mollets (Leg Press)'), elevLat:g('Élévations Latérales (Lateral Raise)'),
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
          upright:g('Tirage Menton Kettlebell'),      uprightMov:_movPattern('Tirage Menton Kettlebell'),
          traction:g('Traction Lestée'),                   rowing:g('Rowing Barre (Tirage Horizontal)'),
          jeff:g('Jefferson Curl'),
          kbFess:_movPattern('Extension Fessiers Arrière (Kickback)'),
          kbMachine:_movPattern('Kickback Machine'),
          kbTri:_movPattern('Extension Triceps Arrière (Kickback)'),
          tirInc:_movPattern('Tirage Incliné Poulie Haute')};
});
t('⭐ « Leg Curl Haltère » = ISCHIOS, plus jamais le biceps (« curl halter » l\'attrapait)',
  // ⚠️ ATTENTE RÉVISÉE le 02/08 (pas une régression) : le leg curl a désormais SA règle, il
  // ne partage plus celle du soulevé roumain — donc plus de « lombaires », et les fessiers
  // passent en stabilisateur. Ce que ce test protège reste le même : ce n'est PAS du biceps.
  // ⚠️ ATTENTE RÉVISÉE le 02/08 (2ᵉ fois, et pas une régression) : les FESSIERS sont retirés —
  // au leg curl la hanche ne bouge pas, le fessier n'y a rien à faire. Ce que ce test protège
  // reste le même depuis le début : ce n'est PAS du biceps.
  au.legCurlH==='calves,hamstrings'&&au.legCurlHMov==='flexion-genou', au.legCurlH+' / '+au.legCurlHMov);
t('témoin : « Curl Haltères » reste un biceps', au.curlH==='biceps,forearms', 'reçu '+au.curlH);
t('⭐ « Rotation Externe Épaule Abduction » = coiffe des rotateurs, plus jamais les FESSIERS',
  au.rotAbd==='rear-delt,traps', 'reçu '+au.rotAbd);
t('témoin : « Abduction Cuisses » reste des fessiers', au.abdCuisses.indexOf('glutes')===0, 'reçu '+au.abdCuisses);
t('⭐ « Tirage Vertical (Upright Row) » = épaules/trapèzes + élévation, plus jamais un tirage dorsal',
  // ⚠️ ATTENTE RÉVISÉE le 02/08 : le deltoïde ANTÉRIEUR a été ajouté (les coudes montent
  // DEVANT le corps, il y participe). ⭐ Au passage ce test prouve la table d'identité :
  // « Tirage Vertical (Upright Row) » est l'ANCIEN nom de « Tirage Menton Kettlebell », et
  // il retrouve bien les muscles ÉCRITS de sa fiche actuelle.
  au.upright==='biceps,front-delt,side-delt,traps'&&au.uprightMov==='elevation-epaules', au.upright+' / '+au.uprightMov);
t('témoins : traction et rowing restent des dorsaux',
  au.traction.indexOf('lats')>=0&&au.rowing.indexOf('lats')>=0, au.traction+' / '+au.rowing);
t('⭐ « Jefferson Curl » = lombaires/ischios (mobilité), plus jamais un biceps',
  // ⚠️ ATTENTE RÉVISÉE le 02/08 : la PRISE est ajoutée (on tient une charge à bout de bras
  // pendant tout le déroulé). Ce que ce test protège reste le même : ce n'est PAS un biceps.
  au.jeff==='forearms,glutes,hamstrings,lower-back', 'reçu '+au.jeff);
t('⭐ un kickback de FESSIERS = charnière de hanche, plus jamais une extension de triceps',
  au.kbFess==='hip-hinge'&&au.kbMachine==='hip-hinge', au.kbFess+' / '+au.kbMachine);
t('témoin : le kickback TRICEPS garde son schéma (malgré le stemming « triceps » → « tricep »)',
  au.kbTri==='extension-triceps', 'reçu '+au.kbTri);
t('⭐ « Tirage Incliné Poulie Haute » = un TIRAGE, plus jamais une poussée (kw « incline »)',
  au.tirInc==='tirage-vertical', 'reçu '+au.tirInc);

// ── LES 14 EXERCICES AJOUTÉS le 01/08/2026 (animations du dossier source de Michel) :
// chacun doit être classé (muscles + schéma) dès son entrée au catalogue — jamais d'exercice muet.
const quatorze=await p.evaluate(()=>{
  const noms=['Pompes (Push-up)','Développé Couché avec Chaînes','Développé Couché Larsen (Larsen Press)',
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

// ── LOT « TRICEPS » du 01/08 : 11 nouveaux — et 2 pièges attrapés PAR LA MESURE, pas par l'œil.
// ① la règle des développés inclinés/déclinés happait les EXTENSIONS TRICEPS sur banc (3e fois
//    qu'elle attrape une isolation : écarté incliné ft-v694, écarté décliné ft-v698, celle-ci) ;
// ② le Tate Press était MUET (aucun muscle, aucun schéma) ; ③ le Handstand Push-up partait en
//    « pompe » (pectoraux, poussée horizontale) alors que c'est un développé militaire inversé.
const tri=await p.evaluate(()=>{
  const noms=['Dips aux Anneaux','Dips entre Deux Bancs','Tate Press','Handstand Push-up (ATR)',
    'Extension Triceps Banc Incliné Haltères','Extension Triceps Décliné Haltères',
    'Extension Triceps Concentrée Poulie','Extension Triceps Nuque Élastique',
    'Extension Triceps Verticale Élastique','Extension Triceps TRX (Sangles)',
    'Extension Triceps Allongée TRX (Sangles)'];
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  const out={dansExlib:0,avecMuscles:0,avecPattern:0};
  for(const n of noms){
    if((EXLIB||[]).some(e=>e&&e.n===n))out.dansExlib++;
    if(g(n).length)out.avecMuscles++;
    if(_movPattern(n))out.avecPattern++;
  }
  out.triIncline=g('Extension Triceps Banc Incliné Haltères');
  out.triDecline=g('Extension Triceps Décliné Haltères');
  out.devIncline=g('Développé Incliné');            // témoin : le vrai développé ne bouge pas
  out.tate=g('Tate Press'); out.tatePat=_movPattern('Tate Press');
  out.atr=g('Handstand Push-up (ATR)'); out.atrPat=_movPattern('Handstand Push-up (ATR)');
  return out;
});
t('⭐ les 11 exercices « triceps » sont au catalogue, TOUS avec muscles ET schéma',
  tri.dansExlib===11&&tri.avecMuscles===11&&tri.avecPattern===11, JSON.stringify(tri));
t('⭐ une EXTENSION TRICEPS sur banc incliné/décliné n\'est PAS un développé (pas de pec)',
  tri.triIncline==='front-delt,triceps'&&tri.triDecline==='front-delt,triceps',
  tri.triIncline+' / '+tri.triDecline);
t('témoin : le vrai Développé Incliné reste un développé (pec + triceps)',
  tri.devIncline==='front-delt,pec,triceps', tri.devIncline);
t('le Tate Press n\'est plus MUET (triceps + extension du coude)',
  tri.tate==='front-delt,triceps'&&tri.tatePat==='extension-triceps', tri.tate+' / '+tri.tatePat);
t('le Handstand Push-up = ÉPAULES en poussée verticale (pas une pompe)',
  // ⚠️ ATTENTE RÉVISÉE le 02/08 : le GAINAGE et le deltoïde latéral ont été ajoutés — en
  // équilibre sur les mains, le tronc tient tout le corps aligné, et c'est ce qui limite la
  // plupart des gens. Ce que ce test protège reste le même : ce n'est pas une pompe.
  tri.atr==='abs,front-delt,side-delt,traps,triceps'&&tri.atrPat==='poussee-verticale', tri.atr+' / '+tri.atrPat);

// ── LOTS « DOS · ÉPAULES · PECS » du 01/08 (fin de soirée) : 33 nouveaux, très majoritairement
// des versions ÉLASTIQUE et TRX. ⚠️ Le trou le plus gênant trouvé ce soir : « Tractions (Pull-up) »
// n'existait PAS au catalogue — la démo de la traction classique s'était donc posée sur
// « Traction Lestée », qui montrait une traction SANS lest. 5 exercices étaient MUETS à la mesure.
const dep=await p.evaluate(()=>{
  const noms=['Tractions (Pull-up)','Traction Supination (Chin-up)','Muscle-up','Tractions aux Anneaux',
    'Traction Australienne (Poids du Corps)','Traction Assistée avec Banc','Suspension Passive (Dead Hang)',
    'Rowing Inversé sous une Table','Rowing Buste Penché Élastique','Rowing Horizontal Élastique',
    'Rowing Unilatéral Élastique','Tirage Vertical Alterné Élastique','Rowing TRX (Sangles)',
    'Traction Australienne TRX (Sangles)','Bird Dog','Extension Lombaire sur Ballon','Planche Inversée',
    'Développé Épaules Élastique','Développé Épaules Assis Élastique','Développé Épaules Unilatéral Élastique',
    'Élévations Latérales Unilatérale Poulie','Oiseau Élastique','Oiseau Inversé TRX (Sangles)',
    'Rotation Externe Épaule Poulie','Handstand Push-up Suspendu (Sangles)',
    'Développé Couché au Sol (Floor Press)','Développé Couché Élastique','Développé Décliné Élastique',
    'Écarté Poulie Haute à Genoux','Écarté Élastique','Écarté TRX (Sangles)','Chest Press TRX (Sangles)',
    'Pompes Inclinées TRX (Sangles)'];
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  const out={n:noms.length,dansExlib:0,avecMuscles:0,avecPattern:0,muets:[]};
  for(const n of noms){
    if((EXLIB||[]).some(e=>e&&e.n===n))out.dansExlib++;
    const m=g(n), pt=_movPattern(n);
    if(m.length)out.avecMuscles++; if(pt)out.avecPattern++;
    if(!m.length||!pt)out.muets.push(n);
  }
  out.muscleUp=g('Muscle-up'); out.muscleUpPat=_movPattern('Muscle-up');
  out.birdDog=g('Bird Dog');
  out.oiseauElast=g('Oiseau Élastique');
  out.oiseauClass=g('Oiseau (Rear Delt Fly)')||g('Machine Oiseau');
  return out;
});
t('⭐ les 33 exercices dos/épaules/pecs sont au catalogue, TOUS avec muscles ET schéma',
  dep.dansExlib===33&&dep.avecMuscles===33&&dep.avecPattern===33, JSON.stringify(dep.muets));
t('le Muscle-up n\'est plus MUET (dorsaux + biceps, tirage vertical)',
  // ⚠️ ATTENTE RÉVISÉE le 02/08 : le GAINAGE a été ajouté — la transition d'un muscle-up
  //    (passer au-dessus de la barre) est ce qui demande le plus de tronc.
  dep.muscleUp==='abs,biceps,front-delt,lats,pec,triceps'&&dep.muscleUpPat==='tirage-vertical',
  dep.muscleUp+' / '+dep.muscleUpPat);
t('le Bird Dog n\'est plus MUET (lombaires + abdos)',
  dep.birdDog==='abs,glutes,lower-back,obliques', dep.birdDog);
t('l\'Oiseau ÉLASTIQUE se classe comme l\'oiseau classique (arrière d\'épaule)',
  dep.oiseauElast.indexOf('rear-delt')>=0, dep.oiseauElast);
// La correction du soir : chaque traction a SA vignette (la lestée montrait une traction sans lest)
const trac=await p.evaluate(()=>({
  lestee:(EX_YT['Traction Lestée']||{}).img,
  classique:(EX_YT['Tractions (Pull-up)']||{}).img}));
t('⭐ « Traction Lestée » et « Tractions (Pull-up) » ont chacune LEUR démo (correction 01/08)',
  trac.lestee==='exercises/traction-lestee-vraie.webp'
  &&trac.classique==='exercises/traction-musculation-dos.webp', JSON.stringify(trac));

// ── LOTS « CARDIO » et « CHARIOT » du 01/08 : 14 nouveaux + 4 démos sur des exercices qui n'en
// avaient aucune (Burpees, Sauts à la Corde, Grimpeur, Box Jump — le cardio était le parent pauvre).
// ⚠️ La famille CHARIOT a rappelé la maladie du « premier match gagne » : mes règles précises
// étaient posées APRÈS la règle générique « tirage », donc jamais atteintes — « Tirage Épaules »
// sortait en dorsaux. Elles sont remontées AVANT.
const card=await p.evaluate(()=>{
  const noms=['Assault Air Bike','Ergomètre de Ski (Ski Erg)','Jumping Jack','Marche de l\'Ours (Bear Crawl)',
    'Wall Ball','Chariot de Puissance — Poussée','Chariot de Puissance — Tirage en Avançant','Chariot de Puissance — Tirage Dos',
    'Chariot de Puissance — Tirage de Côté','Chariot de Puissance — Tirage Inversé Jambes','Chariot de Puissance — Tirage Épaules',
    'Chariot de Puissance — Fentes Arrière','Chariot de Puissance — Curl Biceps','Chariot de Puissance — Extension Triceps'];
  const g=n=>{const d=_mscScores([{name:n,sets:[{done:true}]}])||{};return Object.keys(d.sc||{}).sort().join(',');};
  const out={dansExlib:0,avecMuscles:0,avecPattern:0,muets:[]};
  for(const n of noms){
    if((EXLIB||[]).some(e=>e&&e.n===n))out.dansExlib++;
    const m=g(n),pt=_movPattern(n);
    if(m.length)out.avecMuscles++; if(pt)out.avecPattern++;
    if(!m.length||!pt)out.muets.push(n);
  }
  out.chEpaules=g('Chariot de Puissance — Tirage Épaules');
  out.chJambes=g('Chariot de Puissance — Tirage Inversé Jambes');
  out.chDos=g('Chariot de Puissance — Tirage Dos');           // témoin : le tirage DOS reste dorsal
  out.airbike=_movPattern('Assault Air Bike');
  out.demos={burpees:(EX_YT['Burpees']||{}).img,corde:(EX_YT['Sauts à la Corde']||{}).img,
             grimpeur:(EX_YT['Grimpeur (Mountain Climber)']||{}).img,box:(EX_YT['Box Jump']||{}).img};
  return out;
});
t('⭐ les 14 exercices cardio/chariot sont au catalogue, TOUS avec muscles ET schéma',
  card.dansExlib===14&&card.avecMuscles===14&&card.avecPattern===14, JSON.stringify(card.muets));
t('⭐ chariot : « Tirage Épaules » = épaules et « Tirage Inversé Jambes » = quadriceps (pas dorsaux)',
  card.chEpaules.indexOf('front-delt')>=0&&card.chJambes.indexOf('quads')>=0
  &&card.chEpaules.indexOf('lats')<0&&card.chJambes.indexOf('lats')<0,
  card.chEpaules+' / '+card.chJambes);
// ── NOM DE LA MACHINE (retour Michel 02/08, photo de sa source à l'appui : « EXERCICES AVEC
// POWER SLED ») : « Chariot » tout court était imprécis → « Chariot de Puissance ». On vérifie
// que les 4 façons de la chercher marchent, y compris le terme anglais de la machine.
const chariot=await p.evaluate(()=>{
  const noms=[...new Set(EXLIB.map(e=>e.n))].filter(n=>/Chariot/.test(n));
  const cherche=q=>{document.getElementById('ex-search').value=q;filterEx();
    const n=(document.getElementById('ex-list').innerHTML.match(/class="ex-pick-name">Chariot/g)||[]).length;
    document.getElementById('ex-search').value='';filterEx();return n;};
  return {nb:noms.length, ancienNom:noms.some(n=>!/Chariot de Puissance/.test(n)),
          demos:noms.filter(n=>EX_YT[n]).length,
          chariot:cherche('chariot'), puissance:cherche('puissance'),
          powerSled:cherche('power sled'), sled:cherche('sled')};
});
t('⭐ les 9 exercices s\'appellent « Chariot de Puissance » (plus « Chariot » seul)',
  chariot.nb===9&&!chariot.ancienNom, JSON.stringify(chariot));
t('⭐ ils se trouvent par « chariot », « puissance », « sled » ET « power sled »',
  chariot.chariot===9&&chariot.puissance===9&&chariot.sled===9&&chariot.powerSled===9,
  JSON.stringify(chariot));
t('le renommage n\'a fait perdre aucune démo', chariot.demos===9, 'démos : '+chariot.demos+'/9');
t('témoin : le « Chariot de Puissance — Tirage Dos » reste bien dorsal',
  card.chDos.indexOf('lats')>=0, card.chDos);
t('les machines cardio ont un schéma « cardio » (plus invisibles à l\'équilibre de séance)',
  card.airbike==='cardio', card.airbike);
t('les 4 exercices cardio qui n\'avaient AUCUNE démo en ont une',
  !!(card.demos.burpees&&card.demos.corde&&card.demos.grimpeur&&card.demos.box),
  JSON.stringify(card.demos));

// ══ AUDIT COMPLET DU CATALOGUE (Michel, 02/08 : « refais un tour complet d'analyse sur tous les
// exercices ») — ce bloc fige les 6 constats de l'audit pour qu'ils ne puissent plus revenir.
const aud=await p.evaluate(()=>{
  const noms=[...new Set(EXLIB.map(e=>e.n))];
  const mus=n=>Object.keys((_mscScores([{name:n,sets:[{done:true}]}])||{}).sc||{});
  const o={total:noms.length,entrees:EXLIB.length,sansMus:[],sansPat:[],sansMet:[]};
  noms.forEach(n=>{
    if(!mus(n).length)o.sansMus.push(n);
    if(!_movPattern(n))o.sansPat.push(n);
    if(!getExerciseMET(n))o.sansMet.push(n);
  });
  // ① le sélecteur dédoublonne-t-il ? (37 exercices sont listés dans DEUX groupes)
  document.getElementById('ex-search').value='squat'; filterEx();
  const h=document.getElementById('ex-list').innerHTML;
  o.ligneSquatBarre=(h.match(/class="ex-pick-name">Squat à la Barre</g)||[]).length;
  document.getElementById('ex-search').value='';
  const iF=EX_GROUPS.findIndex(g=>g.tags.indexOf('Fessiers')>=0);
  _exGrp=iF; filterEx();
  const h2=document.getElementById('ex-list').innerHTML;
  o.ligneSDT=(h2.match(/class="ex-pick-name">Soulevé de Terre</g)||[]).length;
  _exGrp=null;
  // ② les 3 nouveaux bacs de matériel
  o.eqSquatTrx=_exEquip('Squat TRX (Sangles)');
  o.eqRowingTrx=_exEquip('Rowing TRX (Sangles)');
  o.eqCurlElast=_exEquip('Curl Élastique')||_exEquip('Écarté Élastique');
  o.eqCorde=_exEquip('Sauts à la Corde');
  o.eqSquatBarre=_exEquip('Squat à la Barre');   // témoin : un vrai squat barre reste « barre »
  // ③ les 3 erreurs de classement trouvées par l'audit
  o.superman=mus('Superman').sort().join(',');
  o.chaiseRom=mus('Chaise Romaine').sort().join(',');
  o.rtEpaules=mus('Russian Twist Développé Épaules').sort().join(',');
  // ④ calories du cardio
  o.metCorde=getExerciseMET('Sauts à la Corde');
  o.metBurpee=getExerciseMET('Burpees');
  o.metCurl=getExerciseMET('Curl Haltères');      // témoin : une isolation reste à 4
  o.metSquat=getExerciseMET('Squat à la Barre');  // témoin : le bas du corps reste à 6,5
  // ⑤ le piège de sous-chaîne
  o.patWallSit=_movPattern('Chaise (Wall Sit)');
  o.patLSit=_movPattern('L-Sit');
  return o;
});
t('⭐ AUDIT : les '+aud.total+' exercices ont TOUS muscles + schéma + calories',
  aud.sansMus.length===0&&aud.sansPat.length===0&&aud.sansMet.length===0,
  'muscles:'+aud.sansMus+' schéma:'+aud.sansPat+' met:'+aud.sansMet);
t('⭐ le sélecteur DÉDOUBLONNE (un squat est listé dans Jambes ET Fessiers → une seule ligne)',
  aud.ligneSquatBarre===1&&aud.ligneSDT===1,
  'Squat à la Barre ×'+aud.ligneSquatBarre+' · Soulevé de Terre ×'+aud.ligneSDT);
t('⭐ TRX, élastique et cardio ont leur propre bac (avant : « Squat TRX » était rangé en BARRE)',
  aud.eqSquatTrx==='trx'&&aud.eqRowingTrx==='trx'&&aud.eqCurlElast==='elast'&&aud.eqCorde==='cardio',
  [aud.eqSquatTrx,aud.eqRowingTrx,aud.eqCurlElast,aud.eqCorde].join(' / '));
t('témoin : un vrai squat à la barre reste dans « Barre »', aud.eqSquatBarre==='barre', aud.eqSquatBarre);
t('⭐ Superman = chaîne postérieure (il sortait en ABDOS)',
  aud.superman==='glutes,hamstrings,lower-back,rear-delt', aud.superman);
t('⭐ Chaise Romaine = abdos (elle sortait en QUADRICEPS, volée par la Chaise murale)',
  aud.chaiseRom==='abs,hip-flexors,obliques', aud.chaiseRom);
t('⭐ Russian Twist Développé Épaules = abdos (il sortait 100 % ÉPAULES)',
  aud.rtEpaules.indexOf('obliques')>=0&&aud.rtEpaules.indexOf('abs')>=0, aud.rtEpaules);
t('⭐ le cardio ne compte plus comme une isolation (corde à sauter : 4 → 8)',
  aud.metCorde===8&&aud.metBurpee===8, 'corde='+aud.metCorde+' burpee='+aud.metBurpee);
t('témoins calories : une isolation reste à 4 · un squat reste à 6,5',
  aud.metCurl===4&&aud.metSquat===6.5, 'curl='+aud.metCurl+' squat='+aud.metSquat);
t('⭐ piège de sous-chaîne : « waLL SIT » ne doit pas être happé par « l sit »',
  aud.patWallSit==='squat'&&aud.patLSit==='gainage-abdos',
  aud.patWallSit+' / '+aud.patLSit);

// ── OUVERT À TOUT LE MONDE (Michel, 02/08 : « on ouvre à tlm ») : le classement par matériel
// était réservé aux testeurs depuis ft-v697. On vérifie avec un compte QUI N'EST PAS testeur.
const ouvert=await p.evaluate(()=>{
  S.email='quelquun.de.normal@example.com';
  const o={estTesteur:(typeof _isTester==='function')?!!_isTester():null, materielVisible:_eqTestOn()};
  document.getElementById('ex-search').value='trx'; filterEx();
  const h=document.getElementById('ex-list').innerHTML;
  o.aLesSousTitres=/ex-subhdr/.test(h);
  o.bacTRX=/TRX \/ Sangles/.test(h);
  document.getElementById('ex-search').value=''; _exGrp=null; filterEx();
  return o;
});
t('⭐ le classement par matériel est visible par TOUT LE MONDE (pas seulement les testeurs)',
  ouvert.estTesteur===false&&ouvert.materielVisible===true&&ouvert.aLesSousTitres,
  JSON.stringify(ouvert));
t('un compte normal voit bien le bac « TRX / Sangles »', ouvert.bacTRX, JSON.stringify(ouvert));

// ── RECHERCHE PAR SCHÉMA DE MOUVEMENT (retour de Tatiana, 02/08) ──────────────────
// Elle tape « Tirage horizontal » dans le sélecteur → « Aucun résultat ». Or l'app
// CONNAÎT ce terme depuis toujours : c'est le libellé d'un de ses schémas de mouvement
// (`_MOV_PATTERNS`), qui l'a même dans ses mots-clés. Le mot existait, il ne descendait
// simplement pas jusqu'à la recherche (R4 : l'info doit descendre jusqu'à la DONNÉE).
// Les témoins comptent autant que le cas : une recherche qui ne correspond à rien doit
// toujours rendre 0, et une recherche par nom ne doit pas se mettre à tout ramener.
const rech=await p.evaluate(()=>{
  const cherche=q=>{
    const i=document.getElementById('ex-search'); i.value=q; _exGrp=null;
    const t0=performance.now(); filterEx(); const ms=performance.now()-t0;
    const h=document.getElementById('ex-list').innerHTML;
    const n=(h.match(/class="ex-pick-name"/g)||[]).length;   // une occurrence par LIGNE
    return {n:n, ms:Math.round(ms), vide:/Aucun résultat/.test(h), h:h};
  };
  const o={};
  const th=cherche('Tirage horizontal');
  o.tirageH=th.n; o.tirageHvide=th.vide; o.tirageHms=th.ms;
  o.tirageHaRowing=/Rowing/.test(th.h);          // le mouvement qu'elle cherchait
  // ⚠️ Les vraies tractions (verticales) NE doivent PAS y être. La « Traction Australienne »
  //    fait exception : malgré son nom, le corps est à l'horizontale — c'est un rowing,
  //    reclassé le 02/08. On l'exclut du test pour qu'il continue de dire ce qu'il visait.
  o.tirageHaTraction=/Traction(?! Australienne)/.test(th.h);
  o.tirageHaAustralienne=/Traction Australienne/.test(th.h);
  const pv=cherche('poussée verticale');
  o.poussV=pv.n; o.poussVaDevEp=/Développé Épaules|Développé Militaire/.test(pv.h);
  const ch=cherche('charnière de hanche');
  o.charn=ch.n; o.charnaSDT=/Soulevé de Terre/.test(ch.h);
  // témoins
  const sq=cherche('squat');  o.squat=sq.n; o.squataSquat=/Squat/.test(sq.h);
  const zz=cherche('zzzz');   o.rien=zz.n;  o.rienVide=zz.vide;
  const cu=cherche('curl');   o.curl=cu.n;
  const i=document.getElementById('ex-search'); i.value=''; _exGrp=null; filterEx();
  return o;
});
t('⭐ RETOUR TATIANA : « Tirage horizontal » sort les rowings (avant : « Aucun résultat »)',
  rech.tirageH>=20&&!rech.tirageHvide&&rech.tirageHaRowing,
  rech.tirageH+' résultats · vide='+rech.tirageHvide+' · rowing='+rech.tirageHaRowing);
t('… et il ne ramasse PAS les tirages VERTICAUX (une traction n\'est pas un tirage horizontal)',
  rech.tirageHaTraction===false, 'traction présente='+rech.tirageHaTraction);
t('… mais il ramasse bien la TRACTION AUSTRALIENNE, qui est un rowing malgré son nom',
  rech.tirageHaAustralienne===true, String(rech.tirageHaAustralienne));
t('les autres familles de mouvement marchent aussi (« poussée verticale », « charnière de hanche »)',
  rech.poussV>=10&&rech.poussVaDevEp&&rech.charn>=15&&rech.charnaSDT,
  'poussée verticale='+rech.poussV+'/'+rech.poussVaDevEp+' · charnière='+rech.charn+'/'+rech.charnaSDT);
t('témoin : une recherche qui ne correspond à rien rend toujours 0 (pas de faux positif)',
  rech.rien===0&&rech.rienVide, rech.rien+' résultats');
t('témoin : la recherche par NOM n\'a pas changé (« squat », « curl »)',
  rech.squat>=25&&rech.squataSquat&&rech.curl>=15&&rech.curl<60,
  'squat='+rech.squat+' curl='+rech.curl);
t('la recherche reste instantanée (< 250 ms sur le catalogue entier)',
  rech.tirageHms<250, rech.tirageHms+' ms');

// La promesse écrite dans l'aide doit correspondre à ce que l'app fait VRAIMENT :
// l'aide « Quel poids noter ? » renvoyait encore au calculateur de plaques, retiré en
// ft-v726. Une promesse fausse à l'utilisateur, comme le plan de repas de ft-v723.
const aide=await p.evaluate(()=>{
  const txt=(_HELP_DATA.log.tips||[]).map(x=>x.t).join(' ');
  return {parlePlaques:/calculateur de plaques/i.test(txt), parlePoids:/Quel poids noter/i.test(txt)};
});
t('l\'aide Séance ne promet plus le calculateur de plaques (retiré en ft-v726, R30)',
  aide.parlePlaques===false&&aide.parlePoids===true, JSON.stringify(aide));

// ── LES DEUX NOMS, FRANÇAIS + ANGLAIS (décision Michel, 02/08) ────────────────────
// « c'est le problème d'avoir des noms en anglais et des noms en français » : 2/3 du
// catalogue portait un mot anglais, et selon l'exercice c'est le français OU l'anglais
// qui trouvait. On écrit désormais les deux — nom courant + l'autre langue entre
// parenthèses — sur les exercices les plus répandus.
// ⚠️ CE QUE CES TESTS PROTÈGENT VRAIMENT : tout le classement de l'app LIT LE NOM.
// Ajouter « (Tirage Horizontal) » a fait basculer le rowing barre en ⚙️ Guidé, et
// « (Lateral Raise) » a donné 4 muscles à une isolation. Corrigé par deux règles
// précises — ces témoins interdisent que ça revienne au prochain renommage.
const deuxNoms=await p.evaluate(()=>{
  const N=['Rowing Barre (Tirage Horizontal)','Rowing Haltère (Tirage Horizontal)',
           'Rowing Câble (Tirage Horizontal)','Rowing Machine (Tirage Horizontal)',
           'Tirage Poulie Haute (Lat Pulldown)','Élévations Latérales (Lateral Raise)',
           'Pompes (Push-up)'];
  const noms=new Set((EXLIB||[]).map(e=>e.n));
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const o={present:N.filter(n=>noms.has(n)).length, attendus:N.length,
    // les anciens noms ne doivent plus exister dans le catalogue
    anciens:['Rowing Barre','Rowing Cable','Rowing Machine','Tirage Poulie Haute','Pompes',
             'Élévations Latérales'].filter(n=>noms.has(n)),
    // le matériel réel vient du nom principal, JAMAIS de la traduction
    eqRowBarre:_exEquip('Rowing Barre (Tirage Horizontal)'),
    eqRowHalt:_exEquip('Rowing Haltère (Tirage Horizontal)'),
    eqRowMach:_exEquip('Rowing Machine (Tirage Horizontal)'),   // témoin : celui-là EST guidé
    eqPompes:_exEquip('Pompes (Push-up)'),
    // une élévation latérale reste une ISOLATION du deltoïde moyen
    musElev:Object.keys((_mscScores([E('Élévations Latérales (Lateral Raise)')])||{}).sc||{}).sort().join(','),
    metElev:getExerciseMET('Élévations Latérales (Lateral Raise)'),
    // témoin : la règle du deltoïde ARRIÈRE n'a pas été abîmée en retirant « lateral raise »
    musFacePull:Object.keys((_mscScores([E('Tirage Visage (Face Pull)')])||{}).sc||{}).sort().join(','),
    // les schémas de mouvement ne bougent pas
    patRow:_movPattern('Rowing Barre (Tirage Horizontal)'),
    patLat:_movPattern('Tirage Poulie Haute (Lat Pulldown)'),
    demos:N.filter(n=>typeof EX_YT!=='undefined'&&EX_YT[n]).length};
  // les DEUX langues doivent trouver l'exercice
  const ch=q=>{const i=document.getElementById('ex-search');i.value=q;_exGrp=null;filterEx();
    return document.getElementById('ex-list').innerHTML;};
  o.frTrouve=['tirage horizontal|Rowing Barre (Tirage Horizontal)','lat pulldown|Tirage Poulie Haute (Lat Pulldown)',
              'lateral raise|Élévations Latérales (Lateral Raise)','push up|Pompes (Push-up)',
              'rowing|Rowing Barre (Tirage Horizontal)','pompes|Pompes (Push-up)',
              'élévations latérales|Élévations Latérales (Lateral Raise)']
    .filter(x=>{const[q,att]=x.split('|');return ch(q).indexOf(att)>=0;}).length;
  const i=document.getElementById('ex-search');i.value='';_exGrp=null;filterEx();
  return o;
});
t('⭐ les 7 exercices portent les DEUX noms (français + anglais)',
  deuxNoms.present===deuxNoms.attendus&&deuxNoms.anciens.length===0,
  deuxNoms.present+'/'+deuxNoms.attendus+' · anciens restants : '+deuxNoms.anciens.join(', '));
t('⭐ le MATÉRIEL vient du nom principal, pas de la traduction (« Tirage » n\'en fait pas une poulie)',
  deuxNoms.eqRowBarre==='barre'&&deuxNoms.eqRowHalt==='libre'&&deuxNoms.eqPompes==='corps',
  'barre='+deuxNoms.eqRowBarre+' haltère='+deuxNoms.eqRowHalt+' pompes='+deuxNoms.eqPompes);
t('témoin : le rowing MACHINE, lui, reste bien rangé en « Guidé »',
  deuxNoms.eqRowMach==='guide', deuxNoms.eqRowMach);
t('⭐ l\'élévation latérale reste une ISOLATION du deltoïde moyen (elle avait gagné 2 muscles)',
  deuxNoms.musElev==='side-delt,traps'&&deuxNoms.metElev===4,
  deuxNoms.musElev+' · MET '+deuxNoms.metElev);
t('témoin : la règle du deltoïde ARRIÈRE (face pull, oiseau) n\'a pas été abîmée',
  deuxNoms.musFacePull.indexOf('rear-delt')>=0, deuxNoms.musFacePull);
t('les schémas de mouvement ne bougent pas (horizontal reste horizontal)',
  deuxNoms.patRow==='tirage-horizontal'&&deuxNoms.patLat==='tirage-vertical',
  deuxNoms.patRow+' / '+deuxNoms.patLat);
t('les démos suivent le renommage (aucune vignette perdue)',
  deuxNoms.demos===7, deuxNoms.demos+'/7');
t('⭐ les DEUX langues trouvent l\'exercice (7 recherches sur 7)',
  deuxNoms.frTrouve===7, deuxNoms.frTrouve+'/7');

// ── LA MIGRATION : renommer ne doit RIEN faire perdre ─────────────────────────────
// Tout l'historique est rangé par NOM. Sans la table de renommage de `state.js`, un
// record enregistré sous « Rowing Barre » deviendrait orphelin et l'exercice
// apparaîtrait deux fois dans les progrès.
const migr=await p.evaluate(()=>{
  localStorage.setItem('ft4_prs',JSON.stringify({'Rowing Barre':{rm1:95,kg:80,reps:8,date:'2026-06-01'}}));
  localStorage.setItem('ft4_sessions',JSON.stringify([{date:'2026-06-01',exs:[
    {name:'Rowing Barre',sets:[{kg:80,reps:8,done:true,type:'N'}]},
    {name:'Tirage Poulie Haute',sets:[{kg:60,reps:10,done:true,type:'N'}]}],vol:1240}]));
  localStorage.setItem('ft4_exRp',JSON.stringify({'Pompes':90}));
  load();
  return {pr:S.prs['Rowing Barre (Tirage Horizontal)'], ancienPr:S.prs['Rowing Barre'],
          sess:(S.sessions[0].exs||[]).map(e=>e.name),
          repos:S.exRestPref['Pompes (Push-up)']};
});
t('⭐ MIGRATION : un record enregistré sous l\'ancien nom SUIT le renommage',
  !!(migr.pr&&migr.pr.kg===80)&&!migr.ancienPr, JSON.stringify(migr.pr)+' · orphelin='+JSON.stringify(migr.ancienPr));
t('⭐ MIGRATION : les séances passées et les repos préférés suivent aussi',
  migr.sess[0]==='Rowing Barre (Tirage Horizontal)'&&migr.sess[1]==='Tirage Poulie Haute (Lat Pulldown)'&&migr.repos===90,
  migr.sess.join(' / ')+' · repos='+migr.repos);


// ── LA PERTINENCE DE LA RECHERCHE (02/08, après le retour « je n'ai pas trouvé ») ──────
// La recherche était un FILTRE (oui/non) rendu dans l'ordre ALPHABÉTIQUE : aucune notion de
// « à quel point ça correspond ». Tant que le filtre restait étroit ça passait ; en
// l'élargissant aux familles de mouvement (ft-v728), le bruit est devenu ingérable.
// MESURÉ AVANT correctif : « pec deck » et « svend » — des noms d'exercices PRÉCIS —
// rendaient 45 résultats avec l'exercice cherché en DERNIÈRE position, parce que ces mots
// sont aussi des mots-clés de famille. « développé couché » rendait 45 résultats dont 8
// seulement contenaient ces mots.
// Deux correctifs : ① un rang de pertinence (nom exact > commence par > contient > terme
// anglais > groupe > famille), qui traverse aussi le regroupement par matériel ;
// ② l'élargissement par famille ne se déclenche QUE sur le libellé d'une famille.
const pert=await p.evaluate(()=>{
  const i=document.getElementById('ex-search');
  const ch=q=>{i.value=q;_exGrp=null;filterEx();
    const h=document.getElementById('ex-list').innerHTML;
    const l=[...h.matchAll(/class="ex-pick-name"[^>]*>([^<]+)</g)].map(z=>z[1].trim());
    return {n:l.length, premier:l[0]||null};};
  const o={};
  [['svend','Svend Press (Serrage de Plaque)'],['pec deck','Pec Deck'],
   ['yates','Rowing Yates (Supination)'],['meadows','Meadows Row'],
   ['développé couché','Développé Couché'],['squat à la barre','Squat à la Barre']]
    .forEach(([q,att])=>{const r=ch(q);o[q]={n:r.n, bon:r.premier===att, premier:r.premier};});
  // les familles doivent continuer de marcher (le retour qui a tout déclenché)
  const th=ch('tirage horizontal'); o.familleN=th.n; o.familleRowing=/Rowing/.test(th.premier||'');
  const pv=ch('poussée verticale'); o.poussV=pv.n;
  o.rien=ch('zzzz').n;
  i.value='';_exGrp=null;filterEx();
  return o;
});
t('⭐ taper le nom d\'un exercice le met en PREMIER (il arrivait en 45ᵉ position)',
  pert['svend'].bon&&pert['pec deck'].bon&&pert['yates'].bon&&pert['meadows'].bon,
  ['svend→'+pert['svend'].premier,'pec deck→'+pert['pec deck'].premier,
   'yates→'+pert['yates'].premier,'meadows→'+pert['meadows'].premier].join(' · '));
t('⭐ … et ne rend plus 45 résultats pour un nom précis',
  pert['svend'].n<=3&&pert['pec deck'].n<=3&&pert['yates'].n<=3&&pert['meadows'].n<=3,
  'svend='+pert['svend'].n+' pec deck='+pert['pec deck'].n+' yates='+pert['yates'].n+' meadows='+pert['meadows'].n);
t('⭐ « développé couché » ne rend que des développés couchés (45 → 8)',
  pert['développé couché'].n<=12&&pert['développé couché'].bon, 
  pert['développé couché'].n+' résultats · 1er : '+pert['développé couché'].premier);
t('le Big 3 se trouve en tapant son nom', pert['squat à la barre'].bon, pert['squat à la barre'].premier);
t('⭐ la recherche par FAMILLE marche toujours (le retour de Tatiana)',
  pert.familleN>=20&&pert.familleRowing&&pert.poussV>=10,
  'tirage horizontal='+pert.familleN+' rowing 1er='+pert.familleRowing+' poussée verticale='+pert.poussV);
t('témoin : une recherche qui ne correspond à rien rend toujours 0', pert.rien===0, String(pert.rien));

// ── ÉPAULES : les 5 corrections trouvées en relisant les 47 fiches une par une (02/08).
// Elles sont FIGÉES ici, en plus de l'empreinte : l'empreinte se régénère d'une commande,
// ces attentes-ci demandent qu'on les réécrive à la main. (R17 : un bug trouvé devient un test.)
const ep=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>{const sc=(_mscScores([E(n)])||{}).sc||{}; return sc;};
  return {rotExt:f('Rotation Externe Épaule Élastique'), rotInt:f('Rotation Interne Épaule Élastique'),
          nuque:f('Développé Nuque'), militaire:f('Développé Militaire'),
          y:f('Y Raise / W Raise'), chariot:f('Chariot de Puissance — Tirage Épaules'),
          atrAbs:f('Handstand Push-up (ATR)').abs, landmine:f('Développé Landmine (Épaules)').pec,
          latDroit:f('Élévations Latérales (Lateral Raise)')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(ep.erreur) console.log('     ⚠️  bloc épaules en ERREUR : '+ep.erreur);
t('⭐ ROTATION INTERNE ≠ ROTATION EXTERNE (elles avaient EXACTEMENT le même classement)',
  !ep.erreur && ep.rotExt['rear-delt']===2 && ep.rotInt['front-delt']===2 && !ep.rotInt['rear-delt'],
  'externe '+JSON.stringify(ep.rotExt)+' · interne '+JSON.stringify(ep.rotInt)
  +'\n         → le deltoïde postérieur est l\'ANTAGONISTE d\'une rotation interne : il la freine, il ne la produit pas.');
t('⭐ en poussée verticale, seul le deltoïde ANTÉRIEUR est moteur',
  !ep.erreur && ep.militaire['front-delt']===2 && ep.militaire['side-delt']===1 && ep.militaire.triceps===1,
  JSON.stringify(ep.militaire));
t('⭐ … SAUF le Développé NUQUE, où les bras travaillent dans le plan frontal',
  // ⚠️ Ce test compare le nuque au militaire au lieu de le regarder seul : sinon il passait
  //    AUSSI avec l'ancien classement (où les 13 développés étaient identiques), et un test
  //    qui ne distingue pas l'exception de la règle ne protège rien.
  !ep.erreur && ep.nuque['front-delt']===2 && ep.nuque['side-delt']===2
  && ep.militaire['side-delt']===1,
  'nuque '+JSON.stringify(ep.nuque)+' · militaire '+JSON.stringify(ep.militaire));
t('témoin : l\'élévation latérale reste LA source du deltoïde latéral (isolation intacte)',
  !ep.erreur && ep.latDroit['side-delt']===2 && Object.keys(ep.latDroit).length===2,
  JSON.stringify(ep.latDroit));
t('⭐ le Y Raise est un exercice de TRAPÈZES (c\'est sa seule raison d\'être)',
  !ep.erreur && ep.y.traps===2, JSON.stringify(ep.y));
t('le chariot « Tirage Épaules » n\'a plus de BICEPS (il venait du mot « tirage »)',
  !ep.erreur && !ep.chariot.biceps && ep.chariot.abs===1, JSON.stringify(ep.chariot));
t('le gainage manquait : handstand push-up et développé landmine',
  !ep.erreur && ep.atrAbs===1 && ep.landmine===1, 'atr.abs='+ep.atrAbs+' landmine.pec='+ep.landmine);

// ── DOS : les corrections trouvées en relisant les 52 fiches une par une (02/08).
const ds=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  return {row:f('Rowing Barre (Tirage Horizontal)'), seal:f('Seal Row'),
          chest:f('Rowing Poitrine Appuyée (Chest Supported)'),
          pulldown:f('Tirage Poulie Haute (Lat Pulldown)'), chin:f('Traction Supination (Chin-up)'),
          renegade:f('Renegade Row'), hang:f('Suspension Passive (Dead Hang)'),
          sumo:f('Soulevé de Terre Sumo'), conv:f('Soulevé de Terre'),
          austral:_movPattern('Traction Australienne (Poids du Corps)'),
          australTrx:_movPattern('Traction Australienne TRX (Sangles)'),
          table:_movPattern('Rowing Inversé sous une Table'),
          traction:_movPattern('Tractions (Pull-up)')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(ds.erreur) console.log('     ⚠️  bloc dos en ERREUR : '+ds.erreur);
t('⭐ dans un ROWING, le deltoïde postérieur ASSISTE, il n\'est plus moteur',
  !ds.erreur && ds.row.lats===2 && ds.row.traps===2 && ds.row['rear-delt']===1, JSON.stringify(ds.row));
t('⭐ dans un TIRAGE VERTICAL, le BICEPS assiste, il n\'est plus moteur',
  !ds.erreur && ds.pulldown.lats===2 && ds.pulldown.biceps===1, JSON.stringify(ds.pulldown));
t('⭐ … SAUF en prise SUPINÉE (chin-up), où il l\'est vraiment',
  // comparé au tirage pronation : un test qui regarde le chin-up seul ne prouverait rien.
  !ds.erreur && ds.chin.biceps===2 && ds.pulldown.biceps===1,
  'chin '+JSON.stringify(ds.chin)+' · pulldown '+JSON.stringify(ds.pulldown));
t('⭐ un rowing à POITRINE APPUYÉE ne compte plus le bas du dos (c\'est ce qu\'il supprime)',
  !ds.erreur && !ds.seal['lower-back'] && !ds.chest['lower-back'] && ds.row['lower-back']===1,
  'seal '+JSON.stringify(ds.seal)+' · témoin rowing libre lower-back='+ds.row['lower-back']);
t('le Renegade Row est un ANTI-ROTATION (gainage, pas de lombaires)',
  !ds.erreur && ds.renegade.abs===1 && ds.renegade.obliques===1 && !ds.renegade['lower-back'],
  JSON.stringify(ds.renegade));
t('⭐ en SUSPENSION PASSIVE on TIENT, on ne tire pas : la prise est le moteur',
  !ds.erreur && ds.hang.forearms===2 && ds.hang.lats===1, JSON.stringify(ds.hang));
t('⭐ le SUMO n\'est pas un soulevé conventionnel (quadriceps moteurs, ischios en soutien)',
  !ds.erreur && ds.sumo.quads===2 && ds.sumo.hamstrings===1
  && ds.conv.hamstrings===2 && ds.conv.quads===1,
  'sumo '+JSON.stringify(ds.sumo)+' · conventionnel '+JSON.stringify(ds.conv));
t('⭐ une TRACTION AUSTRALIENNE est un tirage HORIZONTAL (le corps est à l\'horizontale)',
  !ds.erreur && ds.austral==='tirage-horizontal' && ds.australTrx==='tirage-horizontal'
  && ds.table==='tirage-horizontal',
  'australienne='+ds.austral+' trx='+ds.australTrx+' table='+ds.table);
t('témoin : une vraie traction reste un tirage VERTICAL',
  !ds.erreur && ds.traction==='tirage-vertical', String(ds.traction));

// ── JAMBES : les corrections trouvées en relisant les 58 fiches une par une (02/08).
const jb=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  return {sissy:f('Sissy Squat'), sissyM:f('Sissy Squat Machine'), squat:f('Squat à la Barre'),
          hack:f('Squat Hack (Hack Squat)'), belt:f('Belt Squat'), presse:f('Press Jambes 45°'),
          avant:f('Squat Avant'), ohs:f('Overhead Squat'), valise:f('Soulevé de Terre Valise (Suitcase)'),
          jeff:f('Jefferson Squat'), rot:f('Squat avec Rotation du Tronc'), fente:f('Fentes'),
          legext:f('Extension Quadriceps (Leg Extension)'),
          eqAir:_exEquip('Squat Poids du Corps (Air Squat)'),
          eqSaut:_exEquip('Squat Sauté (Jump Squat)'),
          eqSissy:_exEquip('Sissy Squat'), eqSissyM:_exEquip('Sissy Squat Machine'),
          eqSquat:_exEquip('Squat à la Barre'),
          metLegext:getExerciseMET('Extension Quadriceps (Leg Extension)'),
          metSissy:getExerciseMET('Sissy Squat')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(jb.erreur) console.log('     ⚠️  bloc jambes en ERREUR : '+jb.erreur);
t('⭐ le SISSY SQUAT est une isolation du QUADRICEPS (la hanche reste étendue)',
  // comparé au squat : un test qui regarde le sissy seul ne prouverait pas la distinction.
  !jb.erreur && jb.sissy.quads===2 && !jb.sissy.glutes && !jb.sissy.hamstrings
  && jb.sissyM.quads===2 && !jb.sissyM.glutes && jb.squat.glutes===2,
  'sissy '+JSON.stringify(jb.sissy)+' · témoin squat glutes='+jb.squat.glutes);
t('⭐ dos APPUYÉ (hack, pendulum, belt squat) → plus de bas du dos, comme les presses',
  !jb.erreur && !jb.hack['lower-back'] && !jb.belt['lower-back'] && !jb.presse['lower-back']
  && jb.squat['lower-back']===1,
  'hack '+JSON.stringify(jb.hack)+' · témoin squat barre lower-back='+jb.squat['lower-back']);
t('⭐ le SQUAT AVANT retient la barre devant (haut du dos + gainage)',
  !jb.erreur && jb.avant.abs===1 && jb.avant.traps===1 && !jb.squat.abs,
  'avant '+JSON.stringify(jb.avant));
t('⭐ l\'OVERHEAD SQUAT tient la barre au-dessus de la tête (épaules + gainage)',
  !jb.erreur && jb.ohs['front-delt']===1 && jb.ohs.abs===1, JSON.stringify(jb.ohs));
t('⭐ le SOULEVÉ VALISE est un ANTI-INCLINAISON (chargé d\'un seul côté)',
  !jb.erreur && jb.valise.obliques===1 && jb.valise.forearms===1 && !jb.valise.lats,
  JSON.stringify(jb.valise));
t('le Jefferson Squat et le squat avec rotation ont bien des OBLIQUES',
  !jb.erreur && jb.jeff.obliques===1 && jb.rot.obliques===1,
  'jefferson '+JSON.stringify(jb.jeff));
t('une FENTE demande de l\'équilibre : mollets et gainage (ils manquaient)',
  !jb.erreur && jb.fente.calves===1 && jb.fente.abs===1, JSON.stringify(jb.fente));
t('⭐ MATÉRIEL : « Squat Poids du Corps » n\'est plus rangé en BARRE',
  !jb.erreur && jb.eqAir==='corps' && jb.eqSaut==='corps' && jb.eqSissy==='corps',
  'air='+jb.eqAir+' sauté='+jb.eqSaut+' sissy='+jb.eqSissy);
t('témoins : le Sissy Squat MACHINE reste guidé, le Squat à la Barre reste une barre',
  !jb.erreur && jb.eqSissyM==='guide' && jb.eqSquat==='barre',
  'sissy machine='+jb.eqSissyM+' squat barre='+jb.eqSquat);
t('les extensions de quadriceps restent une ISOLATION (aucun 3ᵉ muscle ajouté)',
  !jb.erreur && Object.keys(jb.legext).length===1 && jb.metLegext===4 && jb.metSissy===6.5,
  JSON.stringify(jb.legext)+' · MET '+jb.metLegext+' · sissy MET '+jb.metSissy);

// ── FESSIERS : les corrections trouvées en relisant les 34 fiches une par une (02/08).
const fs2=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  const m=n=>getExerciseMET(n);
  return {curl:f('Leg Curl Couché Machine'), ext:f('Extension Quadriceps (Leg Extension)'),
          metCurl:m('Leg Curl Couché Machine'), metExt:m('Extension Quadriceps (Leg Extension)'),
          kbA:f('Extension Fessiers Arrière (Kickback)'), kbB:f('Kickback Machine'),
          metKbA:m('Extension Fessiers Arrière (Kickback)'), metKbB:m('Kickback Machine'),
          rdl:f('Soulevé de Terre Roumain Barre'), conv:f('Soulevé de Terre'),
          metRdl:m('Soulevé de Terre Roumain Barre'), metRack:m('Tirage en Rack (Rack Pull)'),
          rdlUni:f('Soulevé de Terre Roumain Unilatéral'),
          sumoH:f('Soulevé de Terre Sumo Haltères'), sumoB:f('Soulevé de Terre Sumo'),
          trap:f('Soulevé de Terre Trap Bar'), zercher:f('Zercher Deadlift'),
          reeves:f('Reeves Deadlift'), gm:f('Inclinaison Lombaire (Good Morning)'),
          swing:f('Kettlebell Swing'), hipU:f('Hip Thrust Unilatéral (Poussée de Hanche)'),
          abd:f('Abduction Cuisses (Leg Abduction)'), add:f('Adduction Cuisses (Leg Adduction)')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(fs2.erreur) console.log('     ⚠️  bloc fessiers en ERREUR : '+fs2.erreur);
t('⭐ le LEG CURL ne compte plus les FESSIERS (la hanche ne bouge pas)',
  !fs2.erreur && fs2.curl.hamstrings===2 && !fs2.curl.glutes && fs2.curl.calves===1,
  JSON.stringify(fs2.curl));
t('⭐ … et il redevient une ISOLATION, comme l\'extension de quadriceps (son miroir)',
  !fs2.erreur && fs2.metCurl===4 && fs2.metExt===4, 'curl MET '+fs2.metCurl+' · extension MET '+fs2.metExt);
t('⭐ les 3 KICKBACKS sont enfin traités pareil (ils étaient 6,5 et 4 pour le même geste)',
  !fs2.erreur && fs2.metKbA===4 && fs2.metKbB===4 && !fs2.kbA['lower-back'] && !fs2.kbB['lower-back'],
  'MET '+fs2.metKbA+' / '+fs2.metKbB);
t('⭐ le ROUMAIN n\'a plus de QUADRICEPS (pas de poussée des jambes : c\'est sa définition)',
  !fs2.erreur && !fs2.rdl.quads && fs2.conv.quads===1,
  'roumain '+JSON.stringify(fs2.rdl)+' · témoin conventionnel quads='+fs2.conv.quads);
t('⭐ … sans que ça déplace ses CALORIES : une charnière de hanche reste un mouvement du bas',
  !fs2.erreur && fs2.metRdl===6.5 && fs2.metRack===6.5, 'roumain '+fs2.metRdl+' · rack pull '+fs2.metRack);
t('le roumain UNILATÉRAL est aussi un exercice d\'équilibre (obliques + gainage)',
  !fs2.erreur && fs2.rdlUni.obliques===1 && fs2.rdlUni.abs===1, JSON.stringify(fs2.rdlUni));
t('⭐ les variantes SUMO disent enfin la même chose que le sumo à la barre',
  !fs2.erreur && fs2.sumoH.quads===2 && fs2.sumoB.quads===2 && fs2.sumoH.hamstrings===1,
  'haltères '+JSON.stringify(fs2.sumoH));
t('le TRAP BAR est quadriceps-dominant, le ZERCHER n\'a pas d\'avant-bras (barre aux coudes)',
  !fs2.erreur && fs2.trap.quads===2 && !fs2.zercher.forearms && fs2.zercher.biceps===1,
  'trap '+JSON.stringify(fs2.trap)+' · zercher '+JSON.stringify(fs2.zercher));
t('le REEVES tient les DISQUES : la prise et le haut du dos sont ce qui lâche',
  !fs2.erreur && fs2.reeves.forearms===1 && fs2.reeves['rear-delt']===1, JSON.stringify(fs2.reeves));
t('au GOOD MORNING les érecteurs sont MOTEURS, et le SWING a prise + gainage',
  !fs2.erreur && fs2.gm['lower-back']===2 && fs2.swing.forearms===1 && fs2.swing.abs===1,
  'good morning '+JSON.stringify(fs2.gm)+' · swing '+JSON.stringify(fs2.swing));
t('le hip thrust UNILATÉRAL retient le bassin (obliques), le bilatéral a le quadriceps',
  !fs2.erreur && fs2.hipU.obliques===1 && fs2.hipU.quads===1, JSON.stringify(fs2.hipU));
t('⚠️ témoin honnête : l\'ABDUCTION est juste (moyen fessier), l\'ADDUCTION reste fausse',
  // l'adducteur n'existe pas dans la figurine — arbitrage Michel en attente (R29).
  // Ce test FIGE le fait qu'on le sait : le jour où les adducteurs entrent, il rougit.
  !fs2.erreur && fs2.abd.glutes===2 && fs2.add.glutes===2,
  'abduction '+JSON.stringify(fs2.abd)+' · adduction '+JSON.stringify(fs2.add));

// ── TRICEPS : les corrections trouvées en relisant les 25 fiches une par une (02/08).
const tr2=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  return {kick:f('Extension Triceps Arrière (Kickback)'), nuque:f('Extension Nuque Haltère'),
          pushdown:f('Triceps Poulie'), corde:f('Triceps Corde Poulie'),
          benchDips:f('Bench Dips'), dips:f('Dips Lestés'), anneaux:f('Dips aux Anneaux'),
          trx:f('Extension Triceps TRX (Sangles)'),
          metTrx:getExerciseMET('Extension Triceps TRX (Sangles)'),
          metAnneaux:getExerciseMET('Dips aux Anneaux'), metPush:getExerciseMET('Triceps Poulie')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(tr2.erreur) console.log('     ⚠️  bloc triceps en ERREUR : '+tr2.erreur);
t('⭐ le KICKBACK triceps tient le bras DERRIÈRE : c\'est le deltoïde POSTÉRIEUR',
  // comparé à l'extension nuque : le test doit distinguer les deux positions de bras,
  // sinon il passerait aussi avec l'ancien classement (les 25 fiches étaient identiques).
  !tr2.erreur && tr2.kick['rear-delt']===1 && !tr2.kick['front-delt']
  && tr2.nuque['front-delt']===1,
  'kickback '+JSON.stringify(tr2.kick)+' · témoin nuque '+JSON.stringify(tr2.nuque));
t('⭐ un PUSHDOWN n\'a pas de deltoïde antérieur (le coude est collé au buste)',
  !tr2.erreur && Object.keys(tr2.pushdown).length===1 && Object.keys(tr2.corde).length===1
  && tr2.metPush===4,
  JSON.stringify(tr2.pushdown)+' · MET '+tr2.metPush);
t('⭐ les DIPS SUR BANC sont un exercice de TRICEPS, pas de pectoraux',
  !tr2.erreur && tr2.benchDips.triceps===2 && tr2.benchDips.pec===1 && tr2.dips.pec===2,
  'bench '+JSON.stringify(tr2.benchDips)+' · témoin dips barres pec='+tr2.dips.pec);
t('les DIPS AUX ANNEAUX demandent du gainage (rien n\'est fixe) — sans changer les calories',
  !tr2.erreur && tr2.anneaux.abs===1 && tr2.metAnneaux===5.5,
  JSON.stringify(tr2.anneaux)+' · MET '+tr2.metAnneaux);
t('⚠️ … mais PAS l\'extension triceps TRX : le 3ᵉ muscle doublerait sa dépense (4 → 5,5)',
  !tr2.erreur && !tr2.trx.abs && tr2.metTrx===4, JSON.stringify(tr2.trx)+' · MET '+tr2.metTrx);

// ── ABDOMINAUX : les corrections trouvées en relisant les 20 fiches une par une (02/08).
const ab=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  return {crunch:f('Crunch'), situp:f('Relevé de Buste (Sit-up)'), oblique:f('Crunch Oblique'),
          jambes:f('Relevé de Jambes'), chaise:f('Chaise Romaine'), rota:f('Rotation Machine Obliques'),
          gainage:f('Gainage'), lsit:f('L-Sit'), roue:f('Roue Abdominale (Ab Wheel)'),
          metCrunch:getExerciseMET('Crunch'), metSitup:getExerciseMET('Relevé de Buste (Sit-up)'),
          metRota:getExerciseMET('Rotation Machine Obliques'),
          metGrimpeur:getExerciseMET('Grimpeur (Mountain Climber)')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(ab.erreur) console.log('     ⚠️  bloc abdos en ERREUR : '+ab.erreur);
t('⭐ un CRUNCH n\'a pas de fléchisseurs de hanche — c\'est ce qui le distingue du SIT-UP',
  // comparé au sit-up : seul le rapprochement prouve la distinction (les 6 fiches étaient
  // identiques avant, donc un test qui regarde le crunch seul passerait aussi à l'ancien code).
  !ab.erreur && !ab.crunch['hip-flexors'] && ab.situp['hip-flexors']===1,
  'crunch '+JSON.stringify(ab.crunch)+' · sit-up '+JSON.stringify(ab.situp));
t('⭐ … et le crunch redevient une ISOLATION (il coûtait autant qu\'un développé couché)',
  !ab.erreur && ab.metCrunch===4 && ab.metSitup===5.5 && ab.metRota===4,
  'crunch '+ab.metCrunch+' · sit-up '+ab.metSitup+' · rotation machine '+ab.metRota);
t('⭐ le crunch OBLIQUE et la machine à rotation sont des exercices d\'OBLIQUES',
  !ab.erreur && ab.oblique.obliques===2 && ab.rota.obliques===2 && !ab.rota['hip-flexors'],
  'oblique '+JSON.stringify(ab.oblique)+' · machine '+JSON.stringify(ab.rota));
t('⭐ « Relevé de Jambes » et « Chaise Romaine » sont le MÊME mouvement, enfin rangés pareil',
  !ab.erreur && ab.jambes['hip-flexors']===2 && ab.chaise['hip-flexors']===2,
  'jambes '+JSON.stringify(ab.jambes)+' · chaise '+JSON.stringify(ab.chaise));
t('au GAINAGE les érecteurs ne sont pas moteurs (ils co-contractent)',
  !ab.erreur && ab.gainage.abs===2 && ab.gainage['lower-back']===1, JSON.stringify(ab.gainage));
t('le L-SIT tient sur les MAINS (triceps) et la ROUE ramène avec les DORSAUX',
  !ab.erreur && ab.lsit.triceps===1 && ab.lsit['hip-flexors']===2 && ab.roue.lats===1,
  'l-sit '+JSON.stringify(ab.lsit)+' · roue '+JSON.stringify(ab.roue));
t('témoin : le grimpeur reste du CARDIO (ses calories ne viennent pas de ses muscles)',
  !ab.erreur && ab.metGrimpeur===8, String(ab.metGrimpeur));

// ── FULL BODY : les corrections trouvées en relisant les 17 fiches une par une (02/08).
//    C'était le plus gros bloc identique du catalogue : 13 fiches sur 17 disaient la même chose.
const fb=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  return {tgu:f('Turkish Get-Up'), rope:f('Battle Rope'), ski:f('Ergomètre de Ski (Ski Erg)'),
          burpee:f('Burpees'), jack:f('Jumping Jack'), ours:f('Marche de l\'Ours (Bear Crawl)'),
          snatch:f('Arraché Haltère (Dumbbell Snatch)'), thruster:f('Thruster'),
          sled:f('Chariot de Puissance — Tirage en Avançant'),
          sledDos:f('Chariot de Puissance — Tirage Dos'),
          patRope:_movPattern('Battle Rope'), patCorde:_movPattern('Sauts à la Corde'),
          metRope:getExerciseMET('Battle Rope'), metTgu:getExerciseMET('Turkish Get-Up')};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(fb.erreur) console.log('     ⚠️  bloc full body en ERREUR : '+fb.erreur);
t('⭐ les 13 fiches identiques ne le sont plus : chaque mouvement a ses muscles',
  !fb.erreur && JSON.stringify(fb.tgu)!==JSON.stringify(fb.rope)
  && JSON.stringify(fb.rope)!==JSON.stringify(fb.ski)
  && JSON.stringify(fb.ski)!==JSON.stringify(fb.jack),
  'tgu '+JSON.stringify(fb.tgu)+' · rope '+JSON.stringify(fb.rope));
t('⭐ le TURKISH GET-UP est un exercice d\'ÉPAULE et d\'OBLIQUES (ils manquaient)',
  !fb.erreur && fb.tgu.obliques===2 && fb.tgu['front-delt']===2, JSON.stringify(fb.tgu));
t('⭐ la CORDE ONDULATOIRE n\'a plus les QUADRICEPS en moteur (les jambes tiennent, elles ne produisent rien)',
  !fb.erreur && fb.rope.quads===1 && fb.rope['front-delt']===2 && fb.rope.lats===1,
  JSON.stringify(fb.rope));
t('⭐ … et ce n\'est pas un SAUT : les pieds ne quittent jamais le sol',
  // témoin : la corde à sauter, elle, reste bien un saut.
  !fb.erreur && fb.patRope==='cardio' && fb.patCorde==='saut-plyo' && fb.metRope===8,
  'battle rope='+fb.patRope+' · témoin corde à sauter='+fb.patCorde);
t('⭐ l\'ERGOMÈTRE DE SKI est un TIRAGE (il était classé épaules + quadriceps)',
  !fb.erreur && fb.ski.lats===2 && fb.ski.triceps===2 && fb.ski.quads===1, JSON.stringify(fb.ski));
t('il y a une POMPE dans les burpees (les pectoraux n\'étaient nulle part)',
  !fb.erreur && fb.burpee.pec===1 && fb.burpee.quads===2, JSON.stringify(fb.burpee));
t('au JUMPING JACK les bras montent SUR LES CÔTÉS (deltoïde moyen) et les MOLLETS sautent',
  !fb.erreur && fb.jack['side-delt']===2 && fb.jack.calves===2, JSON.stringify(fb.jack));
t('la MARCHE DE L\'OURS est d\'abord un anti-rotation (gainage moteur, obliques)',
  !fb.erreur && fb.ours.abs===2 && fb.ours.obliques===1, JSON.stringify(fb.ours));
t('un ARRACHÉ part d\'une charnière de hanche : les ISCHIOS et les TRAPÈZES sont moteurs',
  !fb.erreur && fb.snatch.hamstrings===2 && fb.snatch.traps===2, JSON.stringify(fb.snatch));
t('un THRUSTER est un squat COMPLET : les fessiers sont moteurs',
  !fb.erreur && fb.thruster.glutes===2 && fb.thruster['front-delt']===2, JSON.stringify(fb.thruster));
t('les 4 tirages de CHARIOT disent enfin la même chose',
  !fb.erreur && fb.sled.traps===2 && fb.sledDos.traps===2, JSON.stringify(fb.sled));

// ── LES 5 DERNIERS GROUPES (biceps · lombaires · mollets · trapèzes · avant-bras), 02/08.
//    Avec eux, le catalogue est ENTIÈREMENT écrit : 337/337.
const fin=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))];
  return {marteau:f('Marteau'), zottman:f('Curl Zottman'), curl:f('Curl Haltères'),
          reverse:f('Hyperextension Inverse (Reverse Hyper)'), hyper:f('Hyperextension (Back Extension)'),
          jeff:f('Jefferson Curl'), pince:f('Planche de Préhension'),
          menton:f('Tirage Menton'), mentonKb:f('Tirage Menton Kettlebell'),
          metPince:getExerciseMET('Planche de Préhension'),
          patPoignet:_movPattern('Curl Poignet Barre'), patExt:_movPattern('Extension Poignet Barre'),
          patCurl:_movPattern('Curl Barre'), patSuper:_movPattern('Superman'),
          patBird:_movPattern('Bird Dog'), patSouleve:_movPattern('Soulevé de Terre'),
          ecrits:noms.filter(n=>exMuscles(n)).length, total:noms.length};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(fin.erreur) console.log('     ⚠️  bloc final en ERREUR : '+fin.erreur);
t('⭐⭐ LE CATALOGUE ENTIER a ses muscles ÉCRITS — plus un seul exercice deviné',
  // ⚠️ On ne fige PLUS le nombre (il était à 337, il est à 334 depuis la fusion des doublons
  //    du 03/08). Le catalogue a le droit de bouger ; ce qui ne doit jamais bouger, c'est que
  //    CHAQUE exercice ait sa fiche. La protection contre un rétrécissement en douce est déjà
  //    portée par les croisements ⑦ (empreinte) et ⑨ (identifiants), à leur place.
  !fin.erreur && fin.ecrits===fin.total && fin.total>300,
  fin.ecrits+'/'+fin.total+' — si ce test rougit, c\'est qu\'un exercice a été ajouté sans sa fiche.');
t('⭐ le MARTEAU et le ZOTTMAN font travailler l\'avant-bras en MOTEUR, pas en soutien',
  // comparé au curl classique : sans lui, le test passerait aussi à l'ancien code.
  !fin.erreur && fin.marteau.forearms===2 && fin.zottman.forearms===2 && fin.curl.forearms===1,
  'marteau '+JSON.stringify(fin.marteau)+' · témoin curl '+JSON.stringify(fin.curl));
t('⭐ à l\'HYPEREXTENSION INVERSE ce sont les JAMBES qui montent (fessiers + ischios moteurs)',
  !fin.erreur && fin.reverse.hamstrings===2 && fin.reverse['lower-back']===1
  && fin.hyper['lower-back']===2,
  'inverse '+JSON.stringify(fin.reverse)+' · témoin hyperextension '+JSON.stringify(fin.hyper));
t('le JEFFERSON CURL tient une charge à bout de bras (la prise manquait)',
  !fin.erreur && fin.jeff.forearms===1 && fin.jeff.hamstrings===2, JSON.stringify(fin.jeff));
t('⭐ la PLANCHE DE PRÉHENSION n\'a plus de QUADRICEPS (on est debout, immobile)',
  !fin.erreur && !fin.pince.quads && fin.metPince===4,
  JSON.stringify(fin.pince)+' · MET '+fin.metPince);
t('les 3 TIRAGES MENTON disent enfin la même chose',
  !fin.erreur && fin.menton['front-delt']===1 && fin.mentonKb['front-delt']===1,
  JSON.stringify(fin.menton));
t('⭐ SCHÉMA : un CURL DE POIGNET n\'est pas une flexion du coude (le mot « curl » l\'attrapait)',
  // le même correctif existait dans _MEX depuis ft-v669 — mais pas dans la table des schémas.
  !fin.erreur && fin.patPoignet==='poignet' && fin.patExt==='poignet' && fin.patCurl==='curl-biceps',
  'curl poignet='+fin.patPoignet+' · extension poignet='+fin.patExt+' · témoin curl barre='+fin.patCurl);
t('⭐ SCHÉMA : le SUPERMAN est un MAINTIEN, pas une charnière de hanche',
  !fin.erreur && fin.patSuper==='gainage-abdos' && fin.patBird==='gainage-abdos'
  && fin.patSouleve==='hip-hinge',
  'superman='+fin.patSuper+' · témoin soulevé de terre='+fin.patSouleve);

// ── LES DOUBLONS FUSIONNÉS (03/08) — trouvés par Michel, plus un par le contrôle renforcé.
const fus=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>(_mscScores([E(n)])||{}).sc||{};
  const noms=new Set((EXLIB||[]).map(e=>e.n));
  const cherche=q=>{const i=document.getElementById('ex-search'); i.value=q; _exGrp=null; filterEx();
    const h=document.getElementById('ex-list').innerHTML;
    const l=[...h.matchAll(/class="ex-pick-name"[^>]*>([^<]+)</g)].map(z=>z[1].trim());
    return l[0]||null;};
  const r={ retires:['Câble Crunch','Kickback Cable','Triceps Haltère','Dips Parallèles'].filter(n=>noms.has(n)),
    mig:{}, rech:{} };
  ['Câble Crunch','Kickback Cable','Triceps Haltère','Dips Parallèles'].forEach(n=>{
    r.mig[n]=exNomActuel(n); r.rech[n]=cherche(n); });
  r.dipsPec=f('Dips'); r.dipsTri=f('Dips Triceps (Buste Droit)');
  r.dipsLest=f('Dips Lestés'); r.dipsMach=f('Dips Machine Assistée');
  r.patDipsTri=_movPattern('Dips Triceps (Buste Droit)'); r.patKick=_movPattern('Extension Triceps Arrière (Kickback)');
  r.groupeDipsTri=(EXLIB.find(e=>e.n==='Dips Triceps (Buste Droit)')||{}).g;
  r.wall=f('Glissement au Mur (Wall Slide)'); r.metWall=getExerciseMET('Glissement au Mur (Wall Slide)');
  r.patWall=_movPattern('Glissement au Mur (Wall Slide)'); r.eqWall=_exEquip('Glissement au Mur (Wall Slide)');
  r.patWallSit=_movPattern('Chaise (Wall Sit)'); r.patWallBall=_movPattern('Wall Ball');
  r.rechWall=cherche('wall slide'); r.rechGliss=cherche('glissement');
  const i=document.getElementById('ex-search'); i.value=''; _exGrp=null; filterEx();
  return r;
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(fus.erreur) console.log('     ⚠️  bloc fusions en ERREUR : '+fus.erreur);
t('⭐ les 3 doublons ont disparu du catalogue',
  !fus.erreur && fus.retires.length===0, 'encore présents : '+(fus.retires||[]).join(', '));
t('⭐⭐ ZÉRO PERTE : un record enregistré sous l\'ancien nom retrouve sa fiche',
  !fus.erreur && fus.mig['Câble Crunch']==='Crunch Poulie'
  && fus.mig['Kickback Cable']==='Extension Fessiers Arrière (Kickback)'
  && fus.mig['Triceps Haltère']==='Extension Nuque Haltère'
  && fus.mig['Dips Parallèles']==='Dips Triceps (Buste Droit)', JSON.stringify(fus.mig));
t('⭐ … et TAPER l\'ancien nom le retrouve aussi (il ne disparaît pas de la recherche)',
  !fus.erreur && fus.rech['Triceps Haltère']==='Extension Nuque Haltère'
  && fus.rech['Dips Parallèles']==='Dips Triceps (Buste Droit)'
  && fus.rech['Câble Crunch']==='Crunch Poulie', JSON.stringify(fus.rech));
t('⭐ les deux DIPS ne disent plus la même chose (penché = pec · buste droit = triceps)',
  !fus.erreur && fus.dipsPec.pec===2 && fus.dipsTri.triceps===2 && fus.dipsTri.pec===1,
  'dips '+JSON.stringify(fus.dipsPec)+' · buste droit '+JSON.stringify(fus.dipsTri));
t('⭐ les dips LIBRES demandent du gainage — pas les versions calées sur une machine',
  // sources apportées par Michel (03/08) : suspendu aux barres, la sangle abdominale
  // empêche les jambes de partir devant. Sur la machine assistée, on est calé : rien à tenir.
  !fus.erreur && fus.dipsPec.abs===1 && fus.dipsTri.abs===1
  && fus.dipsLest.abs===1 && !fus.dipsMach.abs,
  'dips '+JSON.stringify(fus.dipsPec)+' · témoin machine assistée '+JSON.stringify(fus.dipsMach));

t('⭐⭐ un DIPS reste une POUSSÉE, même renommé « Dips Triceps »',
  // ⚠️ Le renommage de la veille avait fait basculer son schéma en « extension du coude » :
  //    le mot « triceps » ajouté dans le nom pilotait le calcul. C'est le défaut même qui a
  //    motivé l'identifiant stable, pris la main dans le sac. Le kickback, lui, reste une
  //    extension — c'est le témoin qui prouve que l'exclusion ne va pas trop loin.
  !fus.erreur && fus.patDipsTri==='poussee-horizontale' && fus.patKick==='extension-triceps',
  'dips='+fus.patDipsTri+' · témoin kickback='+fus.patKick);
t('le Dips Triceps est rangé dans le groupe TRICEPS (arbitrage Michel, 03/08)',
  !fus.erreur && fus.groupeDipsTri==='Triceps', String(fus.groupeDipsTri));
t('⭐ le GLISSEMENT AU MUR est au catalogue (mobilité d\'épaule, trapèze inférieur)',
  !fus.erreur && fus.wall.traps===2 && fus.wall['rear-delt']===2 && fus.metWall===4
  && fus.patWall==='elevation-epaules' && fus.eqWall==='corps',
  JSON.stringify(fus.wall)+' · MET '+fus.metWall+' · '+fus.patWall+' · '+fus.eqWall);
t('… et il se trouve en tapant « wall slide » comme « glissement »',
  !fus.erreur && fus.rechWall==='Glissement au Mur (Wall Slide)' && fus.rechGliss==='Glissement au Mur (Wall Slide)',
  'wall slide → '+fus.rechWall+' · glissement → '+fus.rechGliss);
t('témoins : « Wall Sit » reste un squat et « Wall Ball » un saut (le mot « wall » ne déborde pas)',
  !fus.erreur && fus.patWallSit==='squat' && fus.patWallBall==='saut-plyo',
  'wall sit='+fus.patWallSit+' · wall ball='+fus.patWallBall);

// ── LA FIGURINE v2.1 (03/08) : le dessin passe de 18 zones à 41 muscles.
const fg=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const d=_mscScores([E('Squat à la Barre')])||{};
  const svg=_mscSVG({sc:d.sc||{}, ind:d.ind||{}});
  const ids=[...svg.matchAll(/<path id="([^"]+)"/g)].map(m=>m[1]);
  const rouges=[...svg.matchAll(/<path id="([^"]+)"[^>]*url\(#g-prim\)/g)].map(m=>m[1]);
  return {nbTraces:_FP.length+_BP.length, nbIds:ids.length,
    codes:Object.keys(_MG).length,
    lbls:Object.keys(_MSC_LBL).length,
    sansLbl:ids.filter(i=>!_MSC_LBL[i]),
    // les 9 découpages qui comptent existent-ils comme TRACÉS ?
    fins:['adductor','soleus','trapezius_lower','triceps_long','rhomboid','teres_major',
          'pectoralis_middle','vastus_medialis','forearm_flexor']
         .filter(k=>ids.some(i=>i.indexOf(k)>=0)).length,
    quadsRouges:rouges.filter(i=>/vastus|rectus_femoris/.test(i)).length,
    lblPrecis:_MSC_LBL['front_pectoralis_upper_left']||null,
    mini:(typeof _mscSVGmini==='function')?_mscSVGmini({sc:d.sc||{},ind:d.ind||{}}).length>500:null};
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
if(fg.erreur) console.log('     ⚠️  bloc figurine en ERREUR : '+fg.erreur);
t('⭐⭐ la FIGURINE v2.1 est branchée : 41 muscles dessinés au lieu de 18 zones',
  !fg.erreur && fg.nbTraces>=95 && fg.fins===9,
  fg.nbTraces+' tracés · '+fg.fins+'/9 découpages fins présents');
t('⭐ l\'app pilote toujours ses 18 codes (le dessin a pris de l\'avance, pas les données)',
  !fg.erreur && fg.codes===18, String(fg.codes));
t('⭐ taper un muscle donne son nom PRÉCIS, pas celui du groupe',
  !fg.erreur && fg.lblPrecis==='Pectoral supérieur' && fg.sansLbl.length===0,
  'exemple : '+fg.lblPrecis+' · sans libellé : '+(fg.sansLbl||[]).slice(0,5).join(', '));
t('⭐ un squat allume bien les TROIS faisceaux du quadriceps',
  !fg.erreur && fg.quadsRouges===6, fg.quadsRouges+' tracés (3 muscles × 2 côtés)');
t('la figurine MINI (cartes d\'historique) suit le nouveau dessin',
  !fg.erreur && fg.mini===true, String(fg.mini));

t('0 erreur JS', errs.length===0, errs.join(' | '));

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
