#!/usr/bin/env node
/**
 * LE PARCOURS COMPLET — tests CROISÉS (audit du 29-30/07/2026, demandé par Michel).
 *
 * Un vrai parcours de bout en bout par les VRAIES fonctions : profil →
 * startWorkout() → séries → finishWorkout() → PR → badges → récup → Accueil →
 * calendrier → Progrès → Nutrition → contexte de Milo → RECHARGEMENT de la page.
 * Tous les écrans doivent raconter LA MÊME histoire (R2), et rien ne se perd.
 *
 * Contient aussi :
 *   · le contrôle « autre sport / discipline » : ce qui atteint Milo (le texte)
 *     et ce qui n'atteint PAS les chiffres (récup, TDEE) — constat R4 assumé ;
 *   · la mesure de PERFORMANCE avec 200 séances chargées (Accueil < 50 ms,
 *     contexte Milo < 50 ms, persist < 30 ms) — l'app ne doit jamais ralentir.
 *
 * Lancer : node tests/parcours/runner.js
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

function seedScript(extra){
  const base={ft4_name:'Testeur',ft4_bw:'80',ft4_age:'30',ft4_ht:'178',ft4_gender:'H',
    ft4_act:'1.55',ft4_work:'bureau',ft4_goal:'muscle',ft4_rest:'120'};
  const all=Object.assign({},base,extra||{});
  return `(()=>{try{${Object.entries(all).map(([k,v])=>`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')}
    window._demoMode=true;}catch(e){}})();`;
}

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(seedScript({}));
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ A. PARCOURS CROISÉ : profil → séance → PR → accueil → Milo ═══');
const A=await p.evaluate(async()=>{
  const out={};
  out.recAvant=calcRecoveryScore();
  // 1. Démarrer une vraie séance par la vraie fonction
  startWorkout();
  out.wktCree=!!(S.wkt&&S.wkt.date&&typeof S.wkt.startHour==='number');
  // 2. Deux exercices, saisis comme le ferait l'app
  S.wkt.exs.push({name:'Développé Couché',sets:[
    {kg:60,reps:10,done:true,type:'W'},
    {kg:100,reps:5,done:true,type:'N'},
    {kg:100,reps:5,done:true,type:'N'},
    {kg:102.5,reps:3,done:true,type:'N'}]});
  S.wkt.exs.push({name:'Curl Biceps',sets:[
    {kg:20,reps:12,done:true,type:'N'},
    {kg:20,reps:10,done:false,type:'N'}]});
  // 3. Terminer par la vraie fonction (async : sync réseau coupée par _demoMode)
  await finishWorkout();
  const sess=S.sessions[0];
  out.nSess=S.sessions.length;
  out.sessDate=sess&&sess.date;
  out.volume=sess&&sess.volume;                       // 100*5+100*5+102.5*3 + 20*12 = 1547.5 → 1548 (W exclu, série non faite exclue)
  out.calories=sess&&sess.calories;
  out.duration=typeof sess.duration==='number';
  // 4. Le PR : la meilleure série AU SENS DU 1RM ESTIMÉ — 100×5 (112.5) bat 102.5×3 (108.5)
  out.pr=S.prs['Développé Couché'];
  out.bzAttendu=Math.max(bz(102.5,3),bz(100,5));
  out.prCurl=S.prs['Curl Biceps'];                    // 20×12 (seule série FAITE)
  out.curlAttendu=bz(20,12);
  // l'échauffement (W) ne fait jamais un PR
  out.prPasW=!(out.pr&&out.pr.kg===60);
  // 5. Badges
  out.badges=Object.keys(S.badges||{});
  // 6. Le brouillon est vidé — renderLog() en recrée un VIDE dans la foulée (quirk, sans danger)
  out.wktVide=!S.wkt||!(S.wkt.exs&&S.wkt.exs.length);
  // 7. Récup APRÈS séance : doit avoir baissé
  out.recApres=calcRecoveryScore();
  // 8. Accueil + calendrier
  try{renderHome();out.homeOk=true;}catch(e){out.homeOk=false;out.homeErr=e.message;}
  out.region=_calSessRegion(sess);
  out.mixTxt=_calSessMixTxt(sess);
  out.couleur=!!_calSessColor(sess);
  // 9. Progrès (graphique 1RM)
  try{if(typeof renderProgress==='function'){renderProgress();}out.progOk=true;}catch(e){out.progOk=false;out.progErr=e.message;}
  // 10. Le contexte de Milo raconte la MÊME histoire
  const ctx=buildCoachContext();
  out.ctxLen=ctx.length;
  out.ctxNom=ctx.includes('Testeur');
  out.ctxSeance=ctx.includes('Développé Couché');
  out.ctxRecord=/Dernier RECORD en date/i.test(ctx);
  out.ctxRecup=/Score récupération: \d+\/100/.test(ctx);
  out.ctxCal=/CALENDRIER/.test(ctx);
  out.ctxVol=ctx.includes(String(sess.volume));
  const m=ctx.match(/Score récupération: (\d+)\/100/);
  out.ctxRecVal=m?+m[1]:null;
  // 11. Nutrition : l'écran affiche les MÊMES calories que le calcul (avec SA phase mémorisée)
  const mac=calcMacros(S.nutritionPhase||'charge');
  try{renderNutrition();out.nutriOk=true;}catch(e){out.nutriOk=false;}
  const nEl=document.getElementById('s-nutrition');
  out.nutriAffiche=nEl?nEl.textContent.includes(mac.calories.toLocaleString('fr-FR')):false; // « 3 190 » à la française
  out.macCal=mac.calories;
  return out;
});
t('la séance démarre par startWorkout() (date + heure posées)', A.wktCree);
t('séance enregistrée : 1 séance en mémoire, datée aujourd\'hui', A.nSess===1&&!!A.sessDate);
t('volume juste : échauffement et série non faite EXCLUS (1548 kg)', A.volume===1548, 'reçu '+A.volume);
t('calories calculées et posées sur la séance', A.calories>0, 'reçu '+A.calories);
t('durée réelle enregistrée', A.duration);
t('PR Développé Couché = le MEILLEUR 1RM estimé (100×5 bat 102.5×3)', A.pr&&A.pr.rm1===A.bzAttendu,
  JSON.stringify(A.pr)+' vs '+A.bzAttendu);
t('PR Curl = bz(20,12) — la série non faite ne compte pas', A.prCurl&&A.prCurl.rm1===A.curlAttendu,
  JSON.stringify(A.prCurl));
t('l\'échauffement ne fait jamais un PR', A.prPasW);
t('badges débloqués dans la foulée : 1ʳᵉ séance + 1ᵉʳ PR', A.badges.includes('first_session')&&A.badges.includes('first_pr'),
  JSON.stringify(A.badges));
t('le brouillon de séance est vidé après enregistrement', A.wktVide);
t('la récupération BAISSE après la séance ('+A.recAvant+' → '+A.recApres+')', A.recApres<A.recAvant);
t('l\'Accueil se rend sans erreur', A.homeOk, A.homeErr);
t('calendrier : séance DC+curl classée « haut du corps »', A.region==='haut', 'reçu '+A.region);
t('répartition en clair disponible (« '+A.mixTxt+' »)', !!A.mixTxt&&/%/.test(A.mixTxt));
t('couleur de calendrier posée', A.couleur);
t('l\'écran Progrès se rend sans erreur', A.progOk, A.progErr);
t('MILO : reçoit le prénom', A.ctxNom);
t('MILO : voit la séance du jour (Développé Couché)', A.ctxSeance);
t('MILO : reçoit le dernier record daté', A.ctxRecord);
t('MILO : reçoit le score de récupération', A.ctxRecup);
t('MILO : score de récup du contexte = celui de l\'Accueil ('+A.ctxRecVal+' vs '+A.recApres+')', A.ctxRecVal===A.recApres);
t('MILO : reçoit le calendrier (jours en clair)', A.ctxCal);
t('Nutrition : l\'écran affiche les calories du calcul ('+A.macCal+')', A.nutriOk&&A.nutriAffiche);
t('0 erreur JS sur tout le parcours', errs.length===0, errs.join(' | '));

// ── Persistance : on recharge la page, rien ne se perd ──
await p.reload(); await p.waitForTimeout(2200);
const P=await p.evaluate(()=>({
  nSess:(S.sessions||[]).length,
  pr:S.prs&&S.prs['Développé Couché']&&S.prs['Développé Couché'].rm1,
  badges:Object.keys(S.badges||{}).length,
  cal:S.sessions[0]&&S.sessions[0].calories,
}));
t('après RECHARGEMENT : la séance est toujours là', P.nSess===1, 'reçu '+P.nSess);
t('après rechargement : le PR est toujours là', !!P.pr);
t('après rechargement : badges et calories conservés', P.badges>=2&&P.cal>0);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ B. DISCIPLINES / AUTRE SPORT → récup + calories (contrôle demandé) ═══');
const B=await p.evaluate(()=>{
  const out={};
  // L'utilisateur déclare un autre sport (vélo)
  S.coachQuiz=S.coachQuiz||{answers:{},done:false};S.coachQuiz.answers=S.coachQuiz.answers||{};
  const avant={rec:calcRecoveryScore(),tdee:calcTDEE()};
  S.coachQuiz.answers.othersport='velo';
  const apres={rec:calcRecoveryScore(),tdee:calcTDEE()};
  out.recChange=apres.rec!==avant.rec;
  out.tdeeDelta=apres.tdee-avant.tdee;
  const ctx=buildCoachContext();
  out.ctxVelo=/Autre sport pratiqué → vélo/.test(ctx);
  out.ctxConsigne=/DÉJÀ compté dans ses besoins caloriques|couvert par son niveau d'activité/.test(ctx);
  // « aucun » ne doit PAS produire de ligne
  S.coachQuiz.answers.othersport='aucun';
  out.ctxAucun=!/Autre sport pratiqué/.test(buildCoachContext());
  delete S.coachQuiz.answers.othersport;
  // La discipline (muscu/powerlifting/haltéro) atteint Milo
  S.discipline='halterophilie';
  out.ctxDisc=/Discipline pratiquée/.test(buildCoachContext());
  S.discipline='muscu';
  // Les MET du cardio distinguent bien les types et intensités (monotone)
  out.metMono=Object.entries(CARDIO_MET).every(([k,v])=>v.leger<v.modere&&v.modere<v.intense);
  // Les MET de muscu distinguent les familles
  out.mets={squat:getExerciseMET('Squat à la Barre'),dc:getExerciseMET('Développé Couché'),
            curl:getExerciseMET('Curl Biceps'),arr:getExerciseMET('Arraché (Snatch)')};
  return out;
});
// Décision Michel 30/07 (audit, point 2) : les CALORIES descendent dans le chiffre (+150 kcal/j),
// la RÉCUP reste chez Milo (l'app ne sait pas QUAND la personne pratique — pas de malus inventé).
t('⭐ l\'autre sport DESCEND dans le TDEE : +150 kcal/j', B.tdeeDelta===150, 'reçu +'+B.tdeeDelta);
t('la récup ne reçoit PAS de malus aveugle (décision assumée, pas un oubli)', B.recChange===false);
t('Milo le reçoit + sait que les calories sont DÉJÀ comptées (pas de double ajout)', B.ctxVelo&&B.ctxConsigne);
t('« aucun autre sport » → aucune ligne parasite chez Milo', B.ctxAucun);
t('la discipline déclarée atteint Milo', B.ctxDisc);
t('cardio : léger < modéré < intense pour TOUS les types', B.metMono);
t('muscu : MET par famille (squat 6.5 · DC 5.5 · curl 4.0 · arraché 8.0)',
  B.mets.squat===6.5&&B.mets.dc===5.5&&B.mets.curl===4&&B.mets.arr===8, JSON.stringify(B.mets));

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ D. Navigation entre pesées — ‹ › + glissement (idée Christophe) ═══');
const D=await p.evaluate(()=>{
  const out={};
  S.weightLog=[{date:'2026-07-29',kg:84.2},{date:'2026-07-27',kg:84.5,bf:17.2},{date:'2026-07-24',kg:85}];
  openWeighEdit('2026-07-27');
  const val=id=>String(document.getElementById(id).value);
  out.ouvert={date:val('weigh-edit-date'),kg:val('weigh-edit-kg'),bf:val('weigh-edit-bf')};
  out.pos=document.getElementById('weigh-nav-pos').textContent;
  _weighNav(1);  out.ancienne=val('weigh-edit-date');       // ‹ = plus ancienne
  _weighNav(1);  out.butoir=val('weigh-edit-date');         // déjà au bout → ne bouge pas
  out.prevOff=document.getElementById('weigh-nav-prev').style.pointerEvents==='none';
  _weighNav(-1);_weighNav(-1); out.recente=val('weigh-edit-date');
  out.nextOff=document.getElementById('weigh-nav-next').style.pointerEvents==='none';
  _weighTS({touches:[{clientX:200,clientY:300}]});          // glisser vers la DROITE = plus ancienne
  _weighTE({changedTouches:[{clientX:290,clientY:305}]});
  out.swipe=val('weigh-edit-date');
  _weighTS({touches:[{clientX:200,clientY:100}]});          // glissement VERTICAL (fermeture) → ne navigue pas
  _weighTE({changedTouches:[{clientX:230,clientY:400}]});
  out.swipeVert=val('weigh-edit-date');
  closeWeighEdit(); S.weightLog=[];
  return out;
});
t('la pesée s\'ouvre pré-remplie (date, poids, masse grasse)',
  D.ouvert.date==='2026-07-27'&&D.ouvert.kg==='84.5'&&D.ouvert.bf==='17.2', JSON.stringify(D.ouvert));
t('compteur « Pesée 2 sur 3 »', D.pos==='Pesée 2 sur 3', D.pos);
t('‹ recule vers la pesée plus ancienne', D.ancienne==='2026-07-24', D.ancienne);
t('au bout de l\'historique : on ne bouge plus + flèche éteinte', D.butoir==='2026-07-24'&&D.prevOff===true);
t('› revient jusqu\'à la plus récente + flèche éteinte', D.recente==='2026-07-29'&&D.nextOff===true);
t('glisser vers la droite → pesée plus ancienne', D.swipe==='2026-07-27', D.swipe);
t('un glissement VERTICAL (celui qui ferme) ne navigue PAS', D.swipeVert==='2026-07-27', D.swipeVert);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ E. Boîte à idées — anti double-envoi ═══');
// 2 idées de Christophe sont parties EN DOUBLE (taps rapprochés pendant l'envoi) : un verrou
// doit garantir qu'un double-tap ne produit qu'UN seul envoi serveur.
const E=await p.evaluate(async()=>{
  let envois=0;
  const orig=window.fetch;
  window.fetch=(u,o)=>{if(o&&o.body&&String(o.body).indexOf('testerIdea')>=0)envois++;
    return new Promise(r=>setTimeout(()=>r({}),250));};
  if(!document.getElementById('tester-idea-input'))
    document.body.insertAdjacentHTML('beforeend','<textarea id="tester-idea-input"></textarea>');
  document.getElementById('tester-idea-input').value='essai double-tap';
  const p1=sendTesterIdea(); const p2=sendTesterIdea();   // double-tap : 2 appels quasi simultanés
  await Promise.all([p1,p2]);
  const apres=envois;
  document.getElementById('tester-idea-input').value='second envoi voulu';
  await sendTesterIdea();                                  // après l'envoi, le verrou doit être RETOMBÉ
  window.fetch=orig;
  return {doubleTap:apres, total:envois};
});
t('un DOUBLE-TAP ne produit qu\'UN envoi', E.doubleTap===1, 'reçu '+E.doubleTap);
t('le verrou retombe : un envoi VOULU ensuite passe normalement', E.total===2, 'reçu '+E.total);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ F. Annonces CIBLÉES boîte à idées (Christophe + Eline seulement) ═══');
const F=await p.evaluate(async()=>{
  const out={};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const open=id=>{const o=document.getElementById(id);return !!(o&&o.classList.contains('open'));};
  // R15 : les deux pop-ups DOIVENT être dans la table des fermetures propres
  out.closers=!!(_OVERLAY_CLOSERS['ov-pesee-nav-c']&&_OVERLAY_CLOSERS['ov-pesee-nav-e']);
  // un utilisateur LAMBDA ne voit RIEN
  S.email='quelquun@example.com';localStorage.setItem('ft4_wn_seen','999');
  checkAnnouncements();await wait(1300);
  out.lambda=!open('ov-pesee-nav-c')&&!open('ov-pesee-nav-e');
  // Christophe (ses pop-ups perso précédentes déjà vues) → la sienne s'ouvre
  S.email='christophe@famillelanglois.fr';
  localStorage.setItem('ft4_billoute_v3','1');localStorage.setItem('ft4_christophe_photodel_v1','1');
  checkAnnouncements();await wait(1300);
  out.chris=open('ov-pesee-nav-c')&&!open('ov-pesee-nav-e');
  closePeseeNavC();
  out.chrisMarque=localStorage.getItem('ft4_pesee_nav_c_v1')==='1';
  checkAnnouncements();await wait(1300);
  out.chrisUneFois=!open('ov-pesee-nav-c');
  // Eline (guide testeuse déjà vu) → la sienne s'ouvre, avec le mot « masse maigre »
  S.email='elineazs32@gmail.com';localStorage.setItem('ft4_tester_guide_v1','1');
  checkAnnouncements();await wait(1300);
  out.eline=open('ov-pesee-nav-e')&&!open('ov-pesee-nav-c');
  out.elineTxt=(document.getElementById('ov-pesee-nav-e').textContent||'').includes('masse maigre');
  closePeseeNavE();
  out.elineUneFois=localStorage.getItem('ft4_pesee_nav_e_v1')==='1';
  S.email='';
  return out;
});
t('R15 : les 2 pop-ups sont dans la table des fermetures propres', F.closers);
t('un utilisateur lambda ne voit AUCUNE des deux annonces', F.lambda);
t('Christophe voit SON annonce (et pas celle d\'Eline)', F.chris);
t('fermer pose le marqueur → l\'annonce ne revient pas', F.chrisMarque&&F.chrisUneFois);
t('Eline voit LA SIENNE (masse maigre) et pas celle de Christophe', F.eline&&F.elineTxt);
t('… et une seule fois aussi', F.elineUneFois);

// ════ F bis. Espace testeur & suivi photos (31/07 : « ça n'a plus lieu d'être ») ════
// La carte « Analyse approfondie — en avant-première rien que pour toi » datait d'avant
// l'Étude du corps Premium. Retirée de l'Espace testeur ; le suivi photos des super
// testeurs vit dans le menu photos du Profil ; l'historique de l'Étude du corps
// apparaît dès le PREMIER bilan (avant : à partir de 2).
const FB=await p.evaluate(()=>{
  const out={};
  S.email='christophe@famillelanglois.fr';
  _renderTesterSpace();
  const tsp=document.getElementById('tester-space-body').innerHTML;
  out.carteRetiree=!/Analyse approfondie/.test(tsp);
  out.boiteLa=/Envoyer à Michel/.test(tsp);
  S.premium=true;_renderPhotoMenu();
  out.menuSuivi=/Mon suivi photos/.test(document.getElementById('photo-menu-body').innerHTML);
  S.email='quelquun@example.com';_renderPhotoMenu();
  out.menuLambda=!/Mon suivi photos/.test(document.getElementById('photo-menu-body').innerHTML);
  S.bodyStudies=[{date:'2026-07-30',stature:'x'}];S.bodyStudy=S.bodyStudies[0];
  _renderBodyStudyReport(S.bodyStudies[0],true);
  out.histo1=/Historique — 1 bilan</.test(document.getElementById('body-result').innerHTML);
  // 31/07 : « je ne trouve pas l'historique » (Michel, 2 bilans) — le bilan et son bouton
  // Historique vivaient SOUS les 4 cases photos, un écran plus bas. L'accès vit maintenant
  // AUSSI tout en haut de la fenêtre, et il suit le nombre de bilans.
  S.bodyStudies=[{date:'2026-07-30',stature:'x'},{date:'2026-07-20',stature:'y'}];S.bodyStudy=S.bodyStudies[0];
  openBodyStudy();
  out.topBtn=/2 bilans/.test(document.getElementById('body-history-top').innerHTML);
  out.ouvert=document.getElementById('ov-body-study').classList.contains('open');
  closeBodyStudy();
  // bodyStudy PERDU mais l'historique existe → le plus récent est rappelé quand même
  S.bodyStudy=null;
  openBodyStudy();
  out.rappelSansDernier=document.getElementById('body-result').style.display!=='none'
    &&/Historique/.test(document.getElementById('body-result').innerHTML);
  closeBodyStudy();
  // aucun bilan → pas de bouton en haut
  S.bodyStudies=[];S.bodyStudy=null;
  openBodyStudy();
  out.topVide=(document.getElementById('body-history-top').innerHTML||'')==='';
  closeBodyStudy();
  S.email='';S.premium=false;
  return out;
});
t('⭐ l\'accès à l\'historique vit AUSSI en HAUT de l\'Étude du corps (« 2 bilans » visibles sans défiler)',
  FB.topBtn&&FB.ouvert);
t('bodyStudy perdu mais historique présent → le dernier bilan est rappelé quand même',
  FB.rappelSansDernier);
t('aucun bilan → pas de bouton en haut', FB.topVide);
t('⭐ l\'Espace testeur ne contient PLUS la carte « Analyse approfondie » (la boîte à idées reste)',
  FB.carteRetiree&&FB.boiteLa);
t('⭐ le suivi photos vit dans le menu photos du Profil (super testeur seulement)',
  FB.menuSuivi&&FB.menuLambda);
t('⭐ l\'historique de l\'Étude du corps apparaît dès le PREMIER bilan (au singulier)',
  FB.histo1);
// 31/07 : « c'est mal informé » (Michel cherchait ses bilans Étude du corps dans le Suivi photos).
// Le Suivi photos VIDE doit dire où sont les bilans, et le menu photos doit dire qui garde quoi.
// 01/08 : « quand il y a une mise à jour, on repart sur le logo de départ » (Christophe + Michel).
// Le reload auto post-MAJ pose ft4_just_updated AVANT de recharger → le splash iOS doit LIRE ce
// flag et se sauter au redémarrage de mise à jour (double logo = double démarrage perçu).
// 01/08 : les animations abduction/adduction étaient INVERSÉES à la source (l'œil de Michel
// en séance). Fichiers permutés sous des noms -v2 (le cache d'images ft-images ne se vide
// jamais → un simple échange sur place aurait servi l'ancienne image inversée à l'infini).
// 01/08 : le dossier source de Michel contenait 7 animations jamais branchées (les presses à
// cuisses et le hack squat n'avaient que des PHOTOS FIXES, le Squat Avant montrait la version
// haltères, l'épaulé-jeté et les mollets machine n'avaient RIEN).
// 01/08 : « pourquoi à classer ? » (Michel) — les Press Jambes et l'Extension Quadriceps
// Unilatérale tombaient dans le bac « ❓ À classer » (mots-clés manquants), et les fentes
// y restent PAR CHOIX (décision Michel « les 3 ») → le bac s'assume en « 🔀 Polyvalent ».
const EQ=await p.evaluate(()=>({
  p45:_exEquip('Press Jambes 45°'), ext:_exEquip('Extension Quadriceps Unilatérale'),
  fentes:_exEquip('Fentes'), lbl:_EQ_META.autre.lbl}));
t('les Press Jambes et l\'Extension Quadriceps sont classés « Guidé »',
  EQ.p45==='guide'&&EQ.ext==='guide', EQ.p45+' / '+EQ.ext);
t('les Fentes restent volontairement multi-matériel, dans un bac assumé « Polyvalent »',
  EQ.fentes==='autre'&&EQ.lbl==='Polyvalent', EQ.fentes+' / '+EQ.lbl);
t('le Hip Thrust BARRE a sa démo (distincte de la machine — envoi Michel 01/08)',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        return lg.indexOf("'Hip Thrust Barre (Poussée de Hanche)':{img:'exercises/hip-thrust-barre.webp'}")>=0
            && lg.indexOf("'Hip Thrust Machine (Poussée de Hanche)':")>=0
            && fs.existsSync(path.join(ROOT,'exercises/hip-thrust-barre.webp'));})());

// ════ Renommage Hip Thrust (01/08, Michel : « des noms chelou c'est galère ») ════
// L'historique est rangé par NOM : une séance/un record sous l'ANCIEN nom doit migrer
// au chargement — sinon les records et les courbes se déconnectent du nouveau nom.
{
  const c2=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const p2=await c2.newPage();
  await p2.addInitScript(seedScript({
    ft4_sessions:JSON.stringify([{date:'2026-07-20',exs:[{name:'Poussée de Hanche (Hip Thrust)',sets:[{kg:80,reps:10,done:true,type:'N'}]}],volume:800}]),
    ft4_prs:JSON.stringify({'Poussée de Hanche (Hip Thrust)':{rm1:106.7,kg:80,reps:10,date:'2026-07-20'}}),
    ft4_exRp:JSON.stringify({'Poussée de Hanche Machine':90}),
  }));
  await p2.goto('http://localhost:'+PORT+'/index.html');
  await p2.waitForTimeout(2200);
  const M2=await p2.evaluate(()=>({
    sess:S.sessions[0].exs[0].name,
    pr:Object.keys(S.prs)[0],
    prVal:S.prs['Hip Thrust Barre (Poussée de Hanche)']&&S.prs['Hip Thrust Barre (Poussée de Hanche)'].rm1,
    rest:Object.keys(S.exRestPref)[0],
  }));
  t('⭐ une vieille séance « Poussée de Hanche (Hip Thrust) » migre vers le nouveau nom',
    M2.sess==='Hip Thrust Barre (Poussée de Hanche)', 'reçu '+M2.sess);
  t('⭐ le RECORD migre avec sa valeur (les courbes ne se déconnectent pas)',
    M2.pr==='Hip Thrust Barre (Poussée de Hanche)'&&M2.prVal===106.7, M2.pr+' / '+M2.prVal);
  t('le repos préféré de la version Machine migre aussi',
    M2.rest==='Hip Thrust Machine (Poussée de Hanche)', 'reçu '+M2.rest);
  await c2.close();
}
t('les 3 variantes de pompes ont leur démo (déficit, diamant, lestées — envoi Michel 01/08)',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        return ['pompes-deficit','pompes-diamant','pompes-lestees']
          .every(f=>lg.indexOf("exercises/"+f+".webp")>=0&&fs.existsSync(path.join(ROOT,'exercises/'+f+'.webp')));})());
t('lot mollets + triceps (01/08 soir) : les 3 démos branchées et présentes',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        const map={'Barre au Front':'barre-au-front-triceps',
                   'Élévations Mollets Debout':'elevations-mollets-debout-barre',
                   'Élévations Mollets Assis':'elevations-mollets-assis-barre'};
        return Object.entries(map).every(([n,f])=>
          lg.indexOf("'"+n+"':{img:'exercises/"+f+".webp'}")>=0
          && fs.existsSync(path.join(ROOT,'exercises/'+f+'.webp')));})());
t('⭐ la famille MOLLETS au complet — dont la démo « machine debout » CORRIGÉE (c\'était un shrug)',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        const map={'Mollets Machine Debout':'elevations-mollets-debout-machine',
                   'Mollets Machine Assise':'elevations-mollets-assis-machine',
                   'Élévations Mollets Penché (Donkey Calf Raise)':'elevations-mollets-donkey',
                   'Presse Mollets (Leg Press)':'elevations-mollets-presse-45'};
        return Object.entries(map).every(([n,f])=>
                 lg.indexOf("'"+n+"':{img:'exercises/"+f+".webp'}")>=0
                 && fs.existsSync(path.join(ROOT,'exercises/'+f+'.webp')))
            // le fichier fautif ne doit plus être branché nulle part (il reste sur le disque, débranché)
            && lg.indexOf("'exercises/shrug-machine-mollets.webp'")<0;})());
t('⭐ les 7 animations du zip de Michel sont branchées et présentes (presses, hack, front squat barre, épaulé-jeté, mollets)',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        // « shrug-machine-mollets » a quitté cette liste le 01/08 : c'était un HAUSSEMENT D'ÉPAULES
        // branché par erreur sur Mollets Machine Debout (corrigé, voir le test « famille MOLLETS »).
        const files=['presse-a-cuisse-exercice-musculation','presse-a-cuisses-inclinee','presse-a-cuisses-verticale',
                     'hack-squat','squat-barre-devant-front','epaule-jete-halterophilie'];
        return files.every(f=>lg.indexOf("exercises/"+f+".webp")>=0&&fs.existsSync(path.join(ROOT,'exercises/'+f+'.webp')))
            && /'Clean & Jerk':\{img:/.test(lg)
            && /'Mollets Machine Debout':\{img:/.test(lg)
            && lg.indexOf("'Squat Hack (Hack Squat)':       {img:'machine/")<0;})());
t('⭐ démos abduction/adduction remises à l\'endroit : fichiers -v2 mappés, présents, anciens noms partis',
  (()=>{const lg=fs.readFileSync(path.join(ROOT,'log.js'),'utf8');
        const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
        return /'Abduction Cuisses \(Leg Abduction\)':\{img:'exercises\/leg-abduction-machine-v2\.webp'\}/.test(lg)
            && /'Adduction Cuisses \(Leg Adduction\)':\{img:'exercises\/leg-adduction-machine-v2\.webp'\}/.test(lg)
            && fs.existsSync(path.join(ROOT,'exercises/leg-abduction-machine-v2.webp'))
            && fs.existsSync(path.join(ROOT,'exercises/leg-adduction-machine-v2.webp'))
            && !fs.existsSync(path.join(ROOT,'exercises/leg-abduction-machine.webp'))
            && lg.indexOf("'exercises/leg-abduction-machine.webp'")<0
            && sw.indexOf('leg-abduction-machine.webp')<0;})());
t('⭐ le splash iOS est SAUTÉ au redémarrage de mise à jour (flag ft4_just_updated lu en tête)',
  (()=>{const s=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
        const m=s.match(/navigator\.standalone===true&&localStorage\.getItem\('ft4_just_updated'\)!=='1'\)document\.documentElement\.classList\.add\('ios-boot'\)/);
        return !!m;})());
t('⭐ le Suivi photos vide renvoie vers l\'Étude du corps (« c\'est mal informé », Michel 31/07)',
  (()=>{const s=fs.readFileSync(path.join(ROOT,'setup.js'),'utf8');
        return /Tu cherches tes bilans « Étude du corps »/.test(s)
            && /closeBodySeries\(\);openBodyStudy\(\);/.test(s)
            && /photos gardées sur CE téléphone uniquement/.test(s)
            && /historique de tes bilans/.test(s);})());

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ G. Premium visible — ligne Menu + fiche « pourquoi » ═══');
const G=await p.evaluate(()=>{
  const out={};
  out.row=!!document.getElementById('menu-row-premium');
  out.oldBanner=!document.getElementById('menu-premium-banner');
  // pas premium → la fiche vend (prix + contact + code), aucun statut
  S.premium=false;
  openPremiumInfo();
  const ov=document.getElementById('ov-premium-info');
  out.open=ov.classList.contains('open');
  out.prix=ov.textContent.includes('6,99')&&/\/ mois/.test(ov.textContent)&&!/2 mois/.test(ov.textContent)&&/6 mois/.test(ov.textContent); // 6,99/mois + formule 6 mois (décision 31/07)
  out.essai=ov.textContent.includes('1,99')&&!ov.textContent.includes('0,99'); // essai 3 jours à 1,99 € (0,99 impayable sur Ko-fi — décision Michel 31/07)
  out.code2=!!document.getElementById('premium-code-inp2');
  out.ctaVisible=document.getElementById('premium-info-cta').style.display!=='none';
  out.statutVide=(document.getElementById('premium-info-status').innerHTML||'')==='';
  // la liste des avantages : SOURCE UNIQUE (PREMIUM_PERKS) → fiche et mur identiques et complets
  out.nbPerks=PREMIUM_PERKS.length;
  out.nbFiche=document.getElementById('premium-info-perks').childElementCount;
  if(typeof showPremiumWall==='function'){window._premiumPending=false;_renderPremiumPerks();}
  out.nbWall=document.getElementById('coach-wall-perks').childElementCount;
  const txt=document.getElementById('premium-info-perks').textContent;
  out.recap=/récap/i.test(txt); out.etude=/Étude du corps/i.test(txt);
  out.nutri=/Nutrition IA/i.test(txt); out.journal=/journal de séances/i.test(txt);
  closePremiumInfo();
  out.ferme=!ov.classList.contains('open');
  // premium ACTIF → statut vert, plus d'appel à l'action, sous-titre du Menu à jour
  S.premium=true;
  openPremiumInfo();
  out.actif=document.getElementById('premium-info-status').textContent.includes('actif');
  out.ctaCache=document.getElementById('premium-info-cta').style.display==='none';
  out.sub=document.getElementById('menu-premium-sub').textContent.includes('Actif');
  closePremiumInfo();
  S.premium=false;_premiumInfoRender();
  return out;
});
t('la ligne ⭐ Premium existe dans le Menu (sous le profil)', G.row);
t('l\'ancienne bannière « Coach IA Premium » a disparu (une seule porte, R2)', G.oldBanner);
t('la fiche s\'ouvre : prix affiché + champ code + appel à l\'action', G.open&&G.prix&&G.code2&&G.ctaVisible&&G.statutVide);
t('l\'essai est à 1,99 € (0,99 € impayable sur Ko-fi — décision Michel 31/07)', G.essai);
// Audit 31/07 : le mur des COMBINAISONS de suppléments affichait encore « 4,99€ / 2 mois »
// (échappé au balayage ft-v684). Test STRUCTUREL : plus aucun vieux prix dans AUCUN fichier.
t('plus AUCUN vieux prix (« 4,99 » / « 2 mois ») dans tout le frontend — mur des combos compris',
  ['index.html','app.js','screens.js','coach.js','tracking.js','log.js','setup.js','constants.js','state.js']
  .every(f=>{const s=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/34,99/g,'');
             return !/4,99/.test(s)&&!/2 mois/.test(s);}));
// 31/07 : le message de Christophe n'est jamais arrivé — l'échec du mail de la boîte à idées
// était avalé par un catch VIDE (panne invisible). Structurel : le mail part vers les 2 boîtes,
// l'échec est TRACÉ (_logMailFail_), et la route de diagnostic mailFails existe.
// 31/07 : le réservoir Script Properties était PLEIN (102 %) → plus aucune écriture depuis le
// 29/07. Structurel : les comptes se stockent compressés (pack auto-vérifié), TOUS les lecteurs
// décompressent (chargement, backup nocturne, liste admin), et la migration one-shot existe.
t('comptes compressés : pack auto-vérifié + les 3 lecteurs décompressent + migration compressStore',
  (()=>{const s=fs.readFileSync(path.join(ROOT,'Code.js'),'utf8');
        return /_packUser_\(JSON\.stringify\(data\)\)/.test(s)
            && /_unpackUser_\(PropertiesService\.getScriptProperties\(\)\.getProperty\(userKey_\(email\)\)\)/.test(s)
            && (s.match(/JSON\.parse\(_unpackUser_\(/g)||[]).length>=2
            && /_unpackUser_\(gz\) === json/.test(s)
            && /action === 'compressStore'/.test(s);})());
t('boîte à idées : échec de mail tracé (plus de catch vide) + 2 destinataires + route mailFails',
  (()=>{const s=fs.readFileSync(path.join(ROOT,'Code.js'),'utf8');
        return !/catch \(eMail\) \{\}/.test(s)
            && /_logMailFail_\('idee/.test(s)
            && /forcetracker\.app@gmail\.com,michdu75@gmail\.com/.test(s)
            && /action === 'mailFails'/.test(s);})());
t('⭐ la liste des avantages vient de PREMIUM_PERKS (source unique) : fiche ET mur du Coach au complet',
  G.nbFiche===G.nbPerks&&G.nbWall===G.nbPerks&&G.nbPerks>=10, JSON.stringify({perks:G.nbPerks,fiche:G.nbFiche,mur:G.nbWall}));
t('les manques signalés par Michel y sont : récap séances · étude du corps 4 photos · nutrition IA · journal illimité',
  G.recap&&G.etude&&G.nutri&&G.journal);
t('la fiche se ferme', G.ferme);
t('déjà Premium → « actif » affiché, l\'appel à l\'action disparaît', G.actif&&G.ctaCache);
t('… et le sous-titre du Menu passe à « Actif ✓ »', G.sub);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ H. Portes Premium (décisions Michel 31/07) ═══');
const H=await p.evaluate(()=>{
  const out={};
  // Pesée photo : 2 gratuites, ILLIMITÉ en Premium (le Premium ne levait même pas l'ancienne limite)
  S.premium=true;  out.bsPremium=_bodyScanPhotoUnlimited();
  S.premium=false; out.bsGratuit=(typeof _isSuperTester==='function'&&_isSuperTester())?null:_bodyScanPhotoUnlimited();
  // Prise de sang : visible par TOUS (fin de la bêta à 2 emails)
  S.email='quelconque@example.com';
  out.bloodVisible=_isBloodBeta();
  // Compteur d'imports de programme : persisté + repart au cloud
  S.progImports=2;persist();
  out.progPersist=localStorage.getItem('ft4_progimports')==='2';
  S.progImports=0;persist();
  return out;
});
t('pesée photo : le Premium lève la limite (illimité)', H.bsPremium===true);
t('pesée photo : un compte gratuit reste limité', H.bsGratuit===false, 'reçu '+H.bsGratuit);
t('prise de sang : la carte est visible par TOUT LE MONDE', H.bloodVisible===true);
t('compteur d\'imports de programme : persisté', H.progPersist);
// vérifications STRUCTURELLES (les portes sont dans le code, aux bons endroits)
const _fs=require('fs'),_path=require('path');
const _src=f=>_fs.readFileSync(_path.join(ROOT,f),'utf8');
const _log=_src('log.js'),_trk=_src('tracking.js'),_cod=_src('Code.js');
t('programmes : 2 imports gratuits puis Premium (porte posée avant la lecture IA)',
  /PROG_FREE_LIMIT=2/.test(_log)&&/S\.progImports\|\|0\)>=PROG_FREE_LIMIT/.test(_log));
t('pesée : la limite gratuite est bien 2', /BODYSCAN_FREE_LIMIT=2;/.test(_trk));
t('prise de sang : l\'ANALYSE est verrouillée Premium', /_analyzeBloodRedacted\(\)\{[\s\S]{0,400}?if\(!S\.premium\)/.test(_trk));
t('le compteur de programmes part au cloud (backend)', /body\.progImports/.test(_cod));

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ B ter. COMMENTAIRE d\'exercice dans l\'éditeur de programme (Christophe + Michel, 01/08) ═══');
const N=await p.evaluate(()=>{
  const out={};
  // Un programme enregistré (1 seul jour), sans commentaire au départ
  S.programmes=[{id:'pN',name:'Prog Note',exs:[
    {name:'Développé Couché',sets:[{kg:80,reps:8,type:'N'},{kg:80,reps:8,type:'N'}]},
    {name:'Curl Biceps',sets:[{kg:20,reps:12,type:'N'}]}]}];
  persist();
  // 1. L'éditeur s'ouvre et montre un champ 💬 par exercice
  editProg(0);
  out.champ0=!!document.getElementById('prog-note-0-0');
  out.champ1=!!document.getElementById('prog-note-0-1');
  // 2. La consigne écrite survit à un re-render de l'éditeur (ajout de série, superset…)
  _setProgExNote(0,0,'Dos calé, cran 4, prise serrée');
  _renderProgEdit();
  out.reRender=(document.getElementById('prog-note-0-0')||{}).value==='Dos calé, cran 4, prise serrée';
  // 3. Plafond 300 caractères (le même que l'import de programme) + champ vidé = note retirée
  _setProgExNote(0,1,'x'.repeat(400));
  out.cap=(_progEditEx(0,1).note||'').length===300;
  _setProgExNote(0,1,'   ');
  out.vide=_progEditEx(0,1).note===undefined;
  // 4. « Enregistrer » écrit la consigne dans le programme
  saveProgEdit();
  out.sauve=S.programmes[0].exs[0].note==='Dos calé, cran 4, prise serrée';
  out.sansNote=S.programmes[0].exs[1].note===undefined;
  // 5. Programme 1 jour chargé en séance : la consigne SUIT (bug jumeau de loadProgDay, corrigé 01/08)
  loadProg(0);
  out.enSeance=!!(S.wkt&&S.wkt.exs&&S.wkt.exs[0].note==='Dos calé, cran 4, prise serrée');
  // 6. « Sauvegarder comme programme » sous le MÊME nom remplace le programme : la consigne survit
  const inp=document.getElementById('prog-name-inp');if(inp)inp.value='Prog Note';
  saveAsProg();
  out.survitResave=S.programmes.length===1&&S.programmes[0].exs[0].note==='Dos calé, cran 4, prise serrée';
  S.wkt=null;S.programmes=[];persist(); // nettoyage pour la suite
  return out;
});
t('l\'éditeur montre un champ 💬 par exercice', N.champ0&&N.champ1);
t('la consigne survit à un re-render de l\'éditeur', N.reRender);
t('plafond 300 caractères (comme l\'import)', N.cap);
t('champ vidé = note retirée du programme', N.vide);
t('« Enregistrer » écrit la consigne dans le programme (et pas ailleurs)', N.sauve&&N.sansNote);
t('programme 1 jour chargé en séance : la consigne suit (bug jumeau loadProg corrigé)', N.enSeance);
t('re-sauvegarder sous le même nom garde la consigne (pas de perte silencieuse)', N.survitResave);

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ C. PERFORMANCES — l\'app et Milo sont-ils ralentis ? ═══');
// Profil réaliste chargé : 200 séances, 3 ans de sommeil/poids, historique de chat
const C=await p.evaluate(()=>{
  const out={};
  const mk=(d,n)=>({date:d,ts:new Date(d+'T18:00:00').getTime(),volume:5000,calories:400,
    exs:[{name:'Squat à la Barre',sets:[1,2,3,4].map(()=>({kg:100,reps:8,done:true,type:'N'}))},
         {name:'Développé Couché',sets:[1,2,3,4].map(()=>({kg:90,reps:6,done:true,type:'N'}))},
         {name:'Rowing T-Bar',sets:[1,2,3].map(()=>({kg:60,reps:10,done:true,type:'N'}))},
         {name:'Curl Biceps',sets:[1,2].map(()=>({kg:20,reps:12,done:true,type:'N'}))}]});
  const sess=[];const d0=new Date('2026-07-29T12:00:00');
  for(let i=0;i<200;i++){const d=new Date(d0);d.setDate(d0.getDate()-i*2);sess.push(mk(d.toISOString().slice(0,10)));}
  S.sessions=sess;
  S.weightLog=[];S.sleepLog=[];
  for(let i=0;i<400;i++){const d=new Date(d0);d.setDate(d0.getDate()-i);const ds=d.toISOString().slice(0,10);
    S.weightLog.push({date:ds,kg:80+Math.sin(i/30)});S.sleepLog.push({date:ds,hours:7.5,quality:3});}
  const time=(f,n)=>{const t0=performance.now();for(let i=0;i<n;i++)f();return Math.round((performance.now()-t0)/n*100)/100;};
  out.persist=time(()=>persist(),5);
  out.home=time(()=>renderHome(),10);
  out.recov=time(()=>calcRecoveryScore(),50);
  out.ctx=time(()=>buildCoachContext(),10);
  out.ctxLen=buildCoachContext().length;
  out.calSess=time(()=>calcSessionCalories(S.sessions[0]),50);
  out.progress=time(()=>{try{renderProgress();}catch(e){}},5);
  // taille du stockage
  let sz=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);sz+=k.length+(localStorage.getItem(k)||'').length;}
  out.lsKo=Math.round(sz/1024);
  return out;
});
console.log('     ℹ️  persist() : '+C.persist+' ms · renderHome() : '+C.home+' ms · récup : '+C.recov+' ms');
console.log('     ℹ️  buildCoachContext() : '+C.ctx+' ms ('+C.ctxLen+' caractères) · calcSessionCalories : '+C.calSess+' ms');
console.log('     ℹ️  renderProgress() : '+C.progress+' ms · localStorage : '+C.lsKo+' Ko');
t('Accueil < 50 ms avec 200 séances (aucun ralentissement perceptible)', C.home<50, C.home+' ms');
t('persist() < 30 ms (sauvegarde invisible)', C.persist<30, C.persist+' ms');
t('score de récup < 5 ms', C.recov<5, C.recov+' ms');
t('contexte de Milo construit < 50 ms', C.ctx<50, C.ctx+' ms');
t('calories d\'une séance < 5 ms', C.calSess<5, C.calSess+' ms');
t('stockage local raisonnable (< 2 Mo pour 200 séances)', C.lsKo<2048, C.lsKo+' Ko');

// ── EXERCICE PERSO « MUET » : l'app prévient avant de le créer ─────────────────
// (02/08, question Michel sur une routine de vérification des exercices perso. Mesuré : un
// exercice perso au nom non reconnu ET sans muscles cochés est muet — figurine grise, absent
// du volume par muscle, calories au minimum, et Milo ne sait pas ce que c'est. Rien ne le
// signalait. On PRÉVIENT sans bloquer : « Créer quand même » reste possible — R24.)
{
  const c3=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const p3=await c3.newPage();
  await p3.addInitScript(seedScript({}));
  await p3.goto('http://localhost:'+PORT+'/index.html');
  await p3.waitForTimeout(2200);
  // ⚠️ try/catch : si la fonction disparaît, on veut un ❌ LISIBLE, pas un plantage du runner
  // (constaté au contrôle négatif du 02/08 : le crash masquait le fait que le test discrimine).
  const r=await p3.evaluate(()=>{
   try{
    const o={};
    if(typeof _cexSeraitMuet!=='function')return {erreur:'_cexSeraitMuet absente'};
    _cexMusclesP=[];_cexMusclesS=[];S.customExercises=[];
    o.muet=_cexSeraitMuet('Machin Bizarre');
    o.nomReconnuOk=_cexSeraitMuet('Presse à Cuisses Technogym');
    _cexMusclesP=['pec']; o.musclesCochesOk=_cexSeraitMuet('Machin Bizarre'); _cexMusclesP=[];
    const nm=document.getElementById('custom-ex-name'); if(nm)nm.value='Machin Bizarre';
    const gp=document.getElementById('custom-ex-grp'); if(gp)gp.value='Dos';
    saveCustomEx();
    const cf=document.getElementById('ov-confirm')||document.querySelector('.overlay.open');
    o.prevenu=!!(cf&&/muscle/i.test(cf.textContent||''));
    o.rienCreeDansLeDos=(S.customExercises||[]).length===0;
    o.sortiePossible=!!(cf&&/Créer quand même/i.test(cf.textContent||''));
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ un exercice perso qui serait MUET est détecté', r.muet, String(r.muet));
  t("un nom que l'app reconnaît ne déclenche RIEN (pas de friction inutile)",
    r.nomReconnuOk===false, String(r.nomReconnuOk));
  t('des muscles cochés ne déclenchent RIEN non plus', r.musclesCochesOk===false, String(r.musclesCochesOk));
  t('⭐ la personne est prévenue AVANT la création', r.prevenu&&r.rienCreeDansLeDos, JSON.stringify(r));
  t("on prévient sans BLOQUER : « Créer quand même » reste offert (R24)", r.sortiePossible, String(r.sortiePossible));

  // ── Les exercices demandés remontent DANS L'APP (Michel : « je ne vais jamais dans Google
  // Sheet »). La remontée existait, mais dans un onglet qu'il n'ouvre pas.
  await p3.route('**/*exec*', route => route.fulfill({status:200,contentType:'application/json',
    body: route.request().url().includes('getCustomEx')
      ? JSON.stringify({status:'ok',count:2,exercices:[
          {name:'Presse Oblique Technogym',group:'Jambes',count:3,last:'2026-08-01',musclesP:'quads',musclesS:'glutes'},
          {name:'Machin Bizarre',group:'Dos',count:1,last:'2026-08-01',musclesP:'',musclesS:''}]})
      : '{"status":"ok"}'}));
  const adm=await p3.evaluate(async()=>{
   try{
    if(typeof loadCustomExAdmin!=='function')return {erreur:'loadCustomExAdmin absente'};
    S.url=S.url||'https://example.invalid/exec';
    localStorage.setItem('ft4_admin_ok','1');   // c'est ce que lit _isAdminUnlocked()
    await loadCustomExAdmin();
    const box=document.getElementById('admin-cex-list'); const t=box.textContent||'';
    return {lignes:(box.innerHTML.match(/margin-bottom:8px/g)||[]).length,
            trie:t.indexOf('Presse Oblique')<t.indexOf('Machin Bizarre'),
            muscles:/quads/.test(t), signale:/muscles non renseignés/.test(t),
            compte:/3×/.test(t)};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ les exercices demandés s\'affichent DANS l\'app (plus besoin du Google Sheet)',
    adm.lignes===2, JSON.stringify(adm));
  t('les plus demandés en haut, avec leur nombre', adm.trie&&adm.compte, JSON.stringify(adm));
  t('les muscles cochés sont montrés · ceux qui manquent sont signalés',
    adm.muscles&&adm.signale, JSON.stringify(adm));

  // ── SANTÉ DU SYSTÈME : les 4 sondes existaient, mais il fallait taper une URL avec un jeton
  // à la main → jamais consultées. La panne du 29/07 (stockage plein à 102 %, plus aucune
  // écriture pendant 2 jours) était lisible dès le 1ᵉʳ jour par `storeHealth`.
  // ⚠️ la date doit venir de la PAGE (fuseau Europe/Paris), pas du conteneur Node (UTC) :
  // sinon le test échoue entre minuit et 2 h du matin — constaté le 02/08.
  const aujPage = await p3.evaluate(()=>today());
  const scenario = (nom) => p3.route('**/*exec*', route => {
    const u=route.request().url();
    const J=o=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});
    const auj=aujPage;
    /* ⚠️ LA SONDE DU JOUR (13/08/2026) — « le serveur répond-il MAINTENANT ? ». Elle
       manquait : la carte lisait l'historique des déploiements GitHub et affichait « serveur
       OK » (avant-hier) pendant qu'un appel échouait sous les yeux de Michel. */
    if(u.includes('test=1')) return nom==='ok'
      ? J({status:'online',version:'3.5'})
      : route.fulfill({status:503,contentType:'text/plain',body:'indisponible'});
    if(u.includes('storeHealth')) return J(nom==='ok'
      ? {status:'ok',pourcentPlein:41,totalOctets:210000,nbCles:38,testEcriture:'ok'}
      : {status:'ok',pourcentPlein:102,totalOctets:524000,nbCles:44,testEcriture:'ECHEC: quota'});
    if(u.includes('checkBackup')) return J(nom==='ok'
      ? {status:'ok',triggersInstalled:1,fileCount:34,lastFiles:['backup-'+auj+'.json']}
      : {status:'ok',triggersInstalled:0,fileCount:12,lastFiles:['backup-2026-07-20.json']});
    if(u.includes('mailFails')) return J(nom==='ok'
      ? {status:'ok',fails:[],quotaRestant:98} : {status:'ok',fails:[{d:'a'},{d:'b'}]});
    // ⚠️ Le plafond de dépense fait partie de la SANTÉ depuis le 11/08 : il ne sert à rien
    //    s'il est désarmé, et cet état n'était visible nulle part (Michel a posé le secret
    //    sans aucun moyen de vérifier qu'il avait pris).
    // ⚠️ date RÉCENTE (calculée, pas figée) : une date en dur finirait par périmer toute
    //    seule et ferait rougir le témoin de péremption des mois plus tard.
    if(u.includes('aiUsage')) return J({status:'ok',used:127,limit:1000,
      capKnown:true, capArmed:(nom==='ok'), capSeenAt:new Date(Date.now()-3600000).toISOString()});
    return J({status:'ok'});
  });
  // Les MISES EN LIGNE sont lues sur l'API publique de GitHub (dépôt public, aucun jeton).
  // Un déploiement raté est totalement silencieux : c'est arrivé 3 fois (ft-v600, ft-v619, et
  // le backend qui ne partait plus depuis mi-juillet, vu seulement le 21/07).
  const deploys = (nom) => p3.route('https://api.github.com/**', route =>
    route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({workflow_runs:[
      {path:'.github/workflows/deploy-pages.yml',status:'completed',conclusion:(nom==='ok'?'success':'failure'),created_at:'2026-08-02T00:01:43Z'},
      {path:'.github/workflows/deploy-appsscript.yml',status:'completed',conclusion:'success',created_at:'2026-08-02T00:01:43Z'}]})}));
  const lire=async()=>p3.evaluate(async()=>{
   try{
    if(typeof loadHealthAdmin!=='function')return {erreur:'loadHealthAdmin absente'};
    S.url='https://example.invalid/exec';
    localStorage.setItem('ft4_admin_ok','1');
    await loadHealthAdmin();
    const box=document.getElementById('admin-health');
    return {rouges:(box.innerHTML.match(/🔴/g)||[]).length,
            verts:(box.innerHTML.match(/🟢/g)||[]).length,
            txt:(box.textContent||'').replace(/\s+/g,' ')};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  await scenario('ok');   await deploys('ok');   const hOk=await lire();
  await scenario('panne'); await deploys('panne'); const hKo=await lire();
  // ⚠️ ATTENTE RÉVISÉE le 02/08 (pas une régression) : la carte compte une 6ᵉ ligne,
  // « 🛡️ Historiques protégés », qui remonte les sauvegardes refusées par le garde-fou.
  t('⭐ le tableau de santé s\'affiche et tout est vert quand tout va bien',
    hOk.verts===8&&hOk.rouges===0, JSON.stringify(hOk).slice(0,200));
  t('⭐⭐ le PLAFOND DE DÉPENSE est visible, et dit ARMÉ quand il l\'est',
    /ARM[ÉE]/.test(hOk.txt)&&!/D[ÉE]SARM/.test(hOk.txt), hOk.txt.slice(0,200));
  t('⭐⭐ … et DÉSARMÉ en rouge quand le secret manque (le cas du 11/08)',
    /D[ÉE]SARM[ÉE]/.test(hKo.txt)&&/FT_COUNT_TOKEN/.test(hKo.txt), hKo.txt.slice(0,240));
  /* ⚠️ UN CONSTAT PÉRIMÉ NE DOIT PAS AVOIR L'AIR ACTUEL (14/08/2026). L'état du plafond n'est
     relevé qu'à l'occasion d'un appel à Milo : sans question posée, la carte réaffiche
     indéfiniment le dernier constat. Michel a lu « DÉSARMÉ » sur une capture alors que le
     constat datait de la veille et n'incluait pas la clé qu'il venait de poser. */
  t('⚠️ un constat RÉCENT ne déclenche aucune mention de péremption',
    !/Ce constat date/.test(hOk.txt)&&!/Ce constat date/.test(hKo.txt),
    'les scénarios utilisent une date de moins de 6 h');
  t('⭐ la carte montre la ligne « Historiques protégés » (le garde-fou zéro perte)',
    /Historiques protégés/.test(hOk.txt), hOk.txt.slice(0,160));
  t('⭐ un déploiement RATÉ est visible (il ne prévient personne autrement)',
    /ÉCHEC/.test(hKo.txt)&&/tes changements ne partent pas/.test(hKo.txt),
    JSON.stringify(hKo).slice(0,240));
  t('témoin : quand les 2 déploiements passent, la ligne est verte',
    /Dernière mise en ligne de l'app.*OK/.test(hOk.txt)&&/Dernière mise en ligne du serveur.*OK/.test(hOk.txt),
    hOk.txt.slice(-190));
  /* ── LA SONDE « LE SERVEUR RÉPOND » (13/08/2026) ─────────────────────────────────────
     Michel, capture à l'appui : la carte disait « Le serveur (Milo, sync, premium) : ✅ OK
     — 11/08 16:26 » à la seconde où un appel au backend échouait. Les deux ne mesurent pas
     la même chose : GitHub dit qu'un DÉPLOIEMENT s'est bien passé, pas que le service tourne.
     Un indicateur qui rassure sans rien mesurer est pire qu'un indicateur absent. */
  t('⭐⭐ la carte demande VRAIMENT au serveur s\'il répond (?test=1)',
    /Le serveur répond/.test(hOk.txt)&&/En ligne/.test(hOk.txt), hOk.txt.slice(0,240));
  t('⭐⭐ … et le dit INJOIGNABLE quand il ne répond pas, même si le déploiement est vert',
    /INJOIGNABLE/.test(hKo.txt), hKo.txt.slice(0,240));
  t('… en disant ce qu\'on perd (sauvegarde, premium, synchro) et ce qui reste sauf',
    /pas de sauvegarde cloud/.test(hKo.txt)&&/sur le téléphone/.test(hKo.txt), hKo.txt.slice(0,300));
  t('⚠️ les libellés de déploiement ne se font plus passer pour l\'état du jour',
    !/Le serveur \(Milo, sync, premium\)/.test(hOk.txt), hOk.txt.slice(-190));
  t('⭐ la panne du 29/07 (stockage plein, écriture impossible) serait VUE',
    hKo.rouges>=1&&/102 %/.test(hKo.txt)&&/ÉCRITURE IMPOSSIBLE/.test(hKo.txt),
    JSON.stringify(hKo).slice(0,200));
  t('sauvegardes arrêtées et mails en échec sont signalés en rouge',
    hKo.rouges===6&&/AUCUNE programmation/.test(hKo.txt)&&/2 échecs/.test(hKo.txt),
    JSON.stringify(hKo).slice(0,220));
  t('une sauvegarde faite aujourd\'hui se lit « aujourd\'hui », pas « il y a 1 j »',
    /aujourd/.test(hOk.txt)&&!/il y a 1 j/.test(hOk.txt), hOk.txt.slice(0,160));
  await c3.close();
}

// ── CARDIO : DEUX MOMENTS (Michel 02/08 : « avant et après séance ce n'est pas pareil ») ──
// L'échauffement d'avant et le cardio de fin ne sont ni la même intention ni la même durée.
// `cardio` reste le champ historique (= APRÈS) → toutes les séances déjà enregistrées sont
// intactes ; `cardioAvant` est le nouveau. Vérifié : addition des calories, résumé qui NOMME
// les deux, échauffement seul suffisant pour valider, et transmission à Milo.
{
  const c4=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const p4=await c4.newPage();
  await p4.addInitScript(seedScript({}));
  await p4.goto('http://localhost:'+PORT+'/index.html');
  await p4.waitForTimeout(2200);
  const cd=await p4.evaluate(()=>{
   try{
    if(typeof calcCardioKcalTotal!=='function')return {erreur:'calcCardioKcalTotal absente'};
    const o={};
    S.wkt={exs:[],start:Date.now()};
    setCardioField('type','velo','avant');setCardioField('intensity','leger','avant');setCardioField('duration','10','avant');
    setCardioField('type','tapis','apres');setCardioField('intensity','modere','apres');setCardioField('duration','25','apres');
    o.deuxNotes=!!(S.wkt.cardioAvant&&S.wkt.cardioAvant.duration===10&&S.wkt.cardio&&S.wkt.cardio.duration===25);
    o.kAv=calcCardioKcal(S.wkt.cardioAvant);o.kAp=calcCardioKcal(S.wkt.cardio);
    o.total=calcCardioKcalTotal(); o.addition=(o.total===o.kAv+o.kAp);
    o.resume=_cardioResume();
    renderLogFinish();
    o.finish=(document.getElementById('log-finish')||{textContent:''}).textContent.replace(/\s+/g,' ');
    // RÉTROCOMPATIBILITÉ : une séance d'avant n'a que `cardio` → elle compte toujours
    S.wkt={exs:[],cardio:{type:'tapis',intensity:'modere',duration:20},start:Date.now()};
    o.ancienKcal=calcCardioKcalTotal(); o.ancienResume=_cardioResume();
    // un échauffement SEUL doit permettre de valider la séance
    S.wkt={exs:[],cardioAvant:{type:'velo',intensity:'leger',duration:10},start:Date.now()};
    renderLogFinish();
    o.echauffSeul=/cardio/i.test((document.getElementById('log-finish')||{textContent:''}).textContent);
    // ce que MILO en voit
    const j=(()=>{const x=new Date();return new Date(x.getTime()-x.getTimezoneOffset()*6e4).toISOString().slice(0,10);})();
    S.wkt=null;
    S.sessions=[{date:j,exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:8,done:true,type:'N'}]}],
      cardioAvant:{type:'velo',intensity:'leger',duration:10},
      cardio:{type:'tapis',intensity:'modere',duration:25},volume:800}];
    const ctx=buildCoachContext();
    o.miloTapis=/Tapis 25min/.test(ctx); o.miloEchauff=/échauffement Vélo 10min/.test(ctx);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ on peut noter un cardio AVANT et un cardio APRÈS dans la même séance',
    cd.deuxNotes, JSON.stringify(cd).slice(0,200));
  t('les calories des deux moments s\'additionnent', cd.addition,
    cd.kAv+' + '+cd.kAp+' = '+cd.total);
  t('le résumé NOMME les deux moments (pas un total muet)',
    /avant 10min/.test(cd.resume||'')&&/après 25min/.test(cd.resume||''), cd.resume);
  t('l\'écran de fin de séance affiche les deux',
    /avant 10min/.test(cd.finish||'')&&/après 25min/.test(cd.finish||''), (cd.finish||'').slice(0,120));
  t('⭐ RÉTROCOMPATIBLE : une séance d\'avant (un seul cardio) compte toujours',
    cd.ancienKcal>0&&/après 20min/.test(cd.ancienResume||''), cd.ancienResume+' → '+cd.ancienKcal+' kcal');
  t('un échauffement SEUL suffit à valider la séance', cd.echauffSeul, String(cd.echauffSeul));
  t('⭐ Milo voit le cardio de la séance, et sait lequel est l\'échauffement',
    cd.miloTapis&&cd.miloEchauff, 'tapis:'+cd.miloTapis+' échauffement:'+cd.miloEchauff);
  await c4.close();
}

// ── LE CALCULATEUR DE PLAQUES EST VOLONTAIREMENT INACCESSIBLE (décision Michel, 02/08) ──
// Il avait été RETIRÉ exprès (« ça ne servait à rien »). Je l'ai remis en ft-v725 en croyant
// réparer un oubli — c'était une décision, pas un bug. Ce test fige le choix pour qu'il ne soit
// pas « réparé » une troisième fois : le code de la modale reste (rien à nettoyer d'urgent),
// mais AUCUN chemin de l'app ne doit y mener.
{
  const c5=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const p5=await c5.newPage();
  await p5.addInitScript(seedScript({}));
  await p5.goto('http://localhost:'+PORT+'/index.html');
  await p5.waitForTimeout(2200);
  const pc=await p5.evaluate(()=>{
   try{
    document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));
    S.wkt={exs:[{name:'Squat à la Barre',sets:[{kg:80,reps:8,done:true,type:'N'}]}],start:Date.now()};
    goScreen('s-log'); renderLog(); openExMenu(0,false);
    const menu=document.getElementById('ov-exmenu')||document.querySelector('.overlay.open');
    const dansMenu=/plaque/i.test(menu?menu.textContent:'');
    closeExMenu();
    // et aucun bouton ailleurs dans l'app ne doit appeler openPlateCalc
    const html=document.documentElement.innerHTML;
    return {dansMenu, ailleurs:/openPlateCalc\s*\(/.test(html), champBarre:!!document.getElementById('bar-inp')};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ le calculateur de plaques reste INACCESSIBLE (retrait volontaire de Michel)',
    pc.dansMenu===false&&pc.ailleurs===false, JSON.stringify(pc));
  t('… et son réglage de poids de barre ne traîne plus dans l\'interface',
    pc.champBarre===false, String(pc.champBarre));
  await c5.close();
}


// ═══ ZÉRO PERTE : le stockage du téléphone sature (règle d'or n°1) ═══════════════
// LE CHEMIN RÉEL, trouvé le 02/08 en vérifiant une intuition de Michel :
//   1. le stockage du téléphone se remplit → l'app ramène l'historique LOCAL à 50 séances
//   2. au redémarrage, l'app ne connaît plus que ces 50
//   3. à la première sauvegarde, elle les envoie au serveur
//   4. le serveur ne refusait QUE les envois vides → 50 remplaçaient 500, en silence
// Et le message affiché promettait « tes séances restent sauvegardées dans le cloud » :
// une promesse qui devenait fausse à l'étape 4.
{
  const c6=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p6=await c6.newPage();
  await p6.goto('http://localhost:'+PORT+'/index.html'); await p6.waitForTimeout(2200);
  const r=await p6.evaluate(()=>{
   try{
    const o={};
    // ① la troncature de secours pose le drapeau
    localStorage.setItem('ft4_hist_tronque','1');
    load();
    o.drapeauRelu = S.histTronque===true;
    // ② tant qu'il est levé, la sauvegarde cloud n'envoie PLUS les séances.
    //    On intercepte l'appel réseau au lieu de le laisser partir.
    S.sessions=[{date:'2026-08-01',exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true}]}],vol:2000}];
    // ⚠️ DEPUIS ft-v763, `_cloudSync` déclenche DEUX appels réseau : Apps Script puis le
    // miroir Supabase. Un intercepteur qui garde « le dernier corps vu » mesurerait donc
    // le mauvais. On range par DESTINATION. (Le test avait rougi exactement là-dessus :
    // il était juste la veille, il est devenu faux le jour où une 2ᵉ destination est née.)
    const vraiFetch=window.fetch;
    let vus={};
    const espion=(u,opt)=>{ const url=String(u||'');
      const ou = url.indexOf('exemple.invalid')>=0 ? 'apps' : (url.indexOf('supabase')>=0 ? 'sb' : 'autre');
      if(opt&&opt.body)vus[ou]=opt.body;
      return Promise.resolve({ok:true,status:201,text:()=>Promise.resolve('')}); };
    window.fetch=espion;
    S.url='https://exemple.invalid/exec'; S.email='test@example.com';
    _cloudSync();
    window.fetch=vraiFetch;
    o.aEnvoye = !!vus.apps;
    o.sessionsDansPayload = vus.apps ? (JSON.parse(vus.apps).sessions!==undefined) : null;
    // ⭐ LE MIROIR HÉRITE DE LA PROTECTION, il ne la contourne pas. C'est gratuit
    //    parce que le corps est construit UNE SEULE FOIS et servi aux deux (R2) —
    //    mais si un jour quelqu'un le reconstruit pour Supabase, ce témoin rougira.
    o.miroirAppele = !!vus.sb;
    o.miroirSansSessions = vus.sb ? (JSON.parse(vus.sb).p_data.sessions===undefined) : null;
    // ③ témoin : SANS le drapeau, les séances repartent normalement
    S.histTronque=false; localStorage.removeItem('ft4_hist_tronque');
    vus={}; window.fetch=espion;
    _cloudSync();
    window.fetch=vraiFetch;
    o.temoinSessionsEnvoyees = vus.apps ? (JSON.parse(vus.apps).sessions||[]).length : null;
    o.temoinMiroirSessions   = vus.sb   ? (JSON.parse(vus.sb).p_data.sessions||[]).length : null;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ ZÉRO PERTE : le drapeau « historique tronqué » est relu au démarrage',
    r.drapeauRelu===true, JSON.stringify(r));
  t('⭐ ZÉRO PERTE : tant qu\'il est levé, la sauvegarde N\'ENVOIE PLUS les séances (le cloud est protégé)',
    r.aEnvoye===true && r.sessionsDansPayload===false, JSON.stringify(r));
  t('témoin : sans le drapeau, les séances repartent normalement au cloud',
    r.temoinSessionsEnvoyees===1, JSON.stringify(r));
  t('⭐ MIROIR : le miroir Supabase reçoit AUSSI la sauvegarde',
    r.miroirAppele===true && r.temoinMiroirSessions===1, JSON.stringify(r));
  t('⭐ MIROIR : il HÉRITE de la protection « historique tronqué » (aucune séance envoyée non plus)',
    r.miroirSansSessions===true, JSON.stringify(r));
  await c6.close();
}

// ═══ LE CATALOGUE EST TOUJOURS LÀ — ET C'EST MOINS CHER (ft-v764 → RETOURNÉ le 10/08) ════
// ⚠️⚠️ RÈGLE RETOURNÉE, PAS SUPPRIMÉE (R30). Le 04/08 on avait décidé de n'envoyer le
// catalogue QUE quand il pouvait servir, pour économiser 9 507 caractères. C'était juste
// **tant qu'on raisonnait en caractères**. En prix, c'est l'inverse : un bloc envoyé
// « parfois » ne peut pas être mis en cache (le cache exige un texte RIGOUREUSEMENT
// identique d'un message à l'autre), donc il était payé PLEIN TARIF à chaque envoi —
// 0,015 $ le message, soit la moitié du prix d'un message une fois le reste optimisé.
// Envoyé TOUJOURS, il rentre dans la zone cachée et tombe à 0,0015 $ : **10× moins cher**.
// *Ce n'est pas la quantité qui fixe le prix, c'est le fait de pouvoir réutiliser.*
// ⚠️ CE QUE CES TÉMOINS PROTÈGENT MAINTENANT : que le catalogue soit là POUR TOUS les
// messages — y compris « j'ai mal dormi ». L'oublier quand Milo construit une séance lui
// fait nommer un exercice que l'app ne reconnaît pas (bug ft-v713, R8) ; les 19 messages
// témoins ci-dessous, hérités du 04/08, gardent ce risque sous surveillance.
{
  const c7=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p7=await c7.newPage();
  await p7.goto('http://localhost:'+PORT+'/index.html'); await p7.waitForTimeout(2200);
  const r=await p7.evaluate(()=>{
   try{
    // Un historique + un échange déjà entamé : sans ça on envoie tout par prudence (voulu).
    S.sessions=[]; for(let i=0;i<10;i++)S.sessions.push({date:'2026-07-0'+(i%9+1),vol:3000,
      exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]});
    if(typeof coachHistory!=='undefined'){coachHistory.length=0;
      coachHistory.push({role:'user',content:'a'},{role:'assistant',content:'b'});}
    const DOIT=["fais-moi une séance pour aujourd'hui s'il te plaît",
      "je voudrais un programme sur 4 semaines pour progresser",
      "tu peux me remplacer le développé couché par autre chose ?",
      "j'aimerais travailler mes épaules et mon dos cette semaine",
      "quoi faire à la salle ce soir, j'ai 45 minutes devant moi",
      "je stagne au squat depuis un mois, une idée pour débloquer ?",
      "je n'ai qu'un élastique chez moi, tu proposes quoi comme routine",
      "salut","ok",""];
    const HORS=["j'ai très mal dormi cette nuit, je suis complètement épuisé aujourd'hui",
      "je suis stressé par le boulot en ce moment et ça me pèse beaucoup"];
    // ⚠️ LE CAS QUI AVAIT ÉTÉ RATÉ — trouvé sur une question de Michel (« tu es sûr de toi ? »).
    // La 1ʳᵉ version ne lisait que le message du moment : au 2ᵉ tour, après que Milo vient de
    // proposer une séance, 6 réponses réelles sur 10 perdaient le catalogue — dont « tu me
    // changes ça ? » et « je ne peux pas faire le deuxième, j'ai mal », c'est-à-dire
    // précisément les messages où Milo doit nommer un exercice de remplacement (ft-v750).
    const SUITE=["ok mais je préfère quelque chose de plus court",
      "c'est un peu trop pour aujourd'hui, tu peux alléger ?",
      "j'aime pas trop le premier, tu me changes ça ?",
      "et sinon je fais quoi à la place",
      "je ne peux pas faire le deuxième, j'ai mal",
      "tu peux m'en mettre un autre pour le haut",
      "plutôt trois fois par semaine"];
    coachHistory.length=0;
    coachHistory.push({role:'user',content:'fais-moi une séance jambes'},
                      {role:'assistant',content:'ok voilà'},
                      {role:'user',content:'x'},{role:'assistant',content:'y'});
    // ⚠️ On mesure désormais la PRÉSENCE RÉELLE du catalogue dans le contexte, plus le verdict
    // d'une fonction intermédiaire : depuis le 10/08 il n'y a plus de condition, et un test qui
    // interroge une fonction que le prompt n'appelle plus ne teste rien.
    const _aCat = m => buildCoachContext(m).indexOf('EXERCICES DISPONIBLES')>=0;
    const manquesSuite = SUITE.filter(m=>!_aCat(m));
    coachHistory.length=0;
    coachHistory.push({role:'user',content:'a'},{role:'assistant',content:'b'});
    return {
      manquesSuite,
      manques: DOIT.filter(m=>!_aCat(m)),
      retires: HORS.filter(m=>!_aCat(m)).length,
      triNom: ['backup-2026-08-05.json','backup-migration-2026-06-29-2003.json','backup-2026-08-04.json']
                .sort().slice(-1)[0],
      // ⚠️⚠️ L'INVARIANT DU CACHE DE PROMPT (05/08) — celui qui coûte le plus cher s'il casse.
      // Le serveur IA met en cache TOUT ce qui précède « ═══ SITUATION DE L'INSTANT ═══ » :
      // facturé ~10× moins cher, mais SEULEMENT si ce préfixe est RIGOUREUSEMENT identique
      // d'un message à l'autre. Or l'injection conditionnelle livrée la veille (ft-v764→773)
      // retirait des blocs AU-DESSUS du marqueur : mesuré, les préfixes faisaient 58 182 et
      // 43 159 caractères selon le sujet → cache manqué à chaque changement de sujet, et une
      // réécriture de cache facturée PLUS CHER qu'une entrée normale. L'allègement se battait
      // contre le cache, et le cache pèse bien plus lourd. Les blocs conditionnels sont
      // désormais SOUS le marqueur : on garde les deux gains.
      // ⚠️ Un avertissement existait déjà dans le prompt — il interdisait d'AJOUTER une valeur
      // changeante au-dessus. Personne n'avait prévu qu'on en RETIRE. Le garde-fou était écrit
      // pour le mauvais sens ; ce test couvre les deux.
      cachePrefixe: (()=>{ const MK="═══ SITUATION DE L'INSTANT ═══"; const av=coachHistory.slice();
        const pre=t=>{ const i=t.indexOf(MK); return i<0?null:t.slice(0,i); };
        coachHistory.length=0; for(let i=0;i<10;i++)coachHistory.push({role:'user',content:'squat séance jambes'});
        const A=pre(buildCoachContext('fais-moi une séance jambes ce soir'));
        coachHistory.length=0; for(let i=0;i<10;i++)coachHistory.push({role:'user',content:'la vie courante'});
        const B=pre(buildCoachContext("j'ai très mal dormi cette nuit et je suis à plat"));
        coachHistory.length=0;
        const D=pre(buildCoachContext('salut'));
        coachHistory.length=0; av.forEach(x=>coachHistory.push(x));
        return {trouve:A!==null&&B!==null&&D!==null, tailles:[A&&A.length,B&&B.length,D&&D.length],
                identiques: A===B && A===D}; })(),
      // ⚠️ COHÉRENCE : les blocs « construire une séance » et le CATALOGUE d'exercices
      // doivent voyager ENSEMBLE. Le bloc séance dit « un nom le plus proche possible de la
      // bibliothèque » — s'il part sans la bibliothèque, on rejoue exactement R8 (une consigne
      // qui nomme une source absente), c'est-à-dire le bug corrigé par ft-v713.
      coherence: (()=>{ const av=coachHistory.slice();
        coachHistory.length=0; for(let i=0;i<10;i++)coachHistory.push({role:'user',content:'la vie courante'});
        const froid=buildCoachContext("j'ai très mal dormi cette nuit et je suis à plat");
        const chaud=buildCoachContext("fais-moi une séance jambes pour ce soir stp");
        coachHistory.length=0; av.forEach(x=>coachHistory.push(x));
        const a=t=>({seance:/INTÉGRER LA SÉANCE DU JOUR/.test(t), cat:/EXERCICES DISPONIBLES/.test(t)});
        return {froid:a(froid), chaud:a(chaud), gain:chaud.length-froid.length}; })(),
      // « CRÉER LE PREMIER MOMENT MILO » dit lui-même « au TOUT PREMIER échange » : il ne doit
      // plus partir au 10ᵉ tour. 972 caractères sur la première impression, envoyés pour toujours.
      momentMilo: (()=>{ const av=coachHistory.slice();
        coachHistory.length=0;
        const debut=/MOMENT MILO/.test(buildCoachContext('salut'));
        for(let i=0;i<10;i++)coachHistory.push({role:'user',content:'x'});
        const tard=/MOMENT MILO/.test(buildCoachContext('fais-moi une séance jambes ce soir'));
        coachHistory.length=0; av.forEach(x=>coachHistory.push(x));
        return {debut, tard}; })(),
      // ⚠️⚠️ LE BLOC COMMUN À TOUS LES UTILISATEURS (05/08) — question de Michel : « demain une
      // autre personne discute comme moi, il se passe quoi ? ». Mesuré : les 37 261 premiers
      // caractères sont STRICTEMENT identiques d'un profil à l'autre (84 % du préfixe caché) ;
      // la divergence commence au prénom, dans « PROFIL ATHLÈTE: ». Le serveur IA pose donc
      // une DEUXIÈME coupure de cache à cette frontière : le bloc de consignes devient UNE
      // entrée partagée par tout le monde au lieu d'être refacturée par utilisateur.
      // ⚠️ Ce témoin protège la FRONTIÈRE : si « PROFIL ATHLÈTE: » disparaissait, ou si une
      // donnée personnelle remontait AVANT lui, le partage tomberait en silence.
      blocCommun: (()=>{
        const t=buildCoachContext('fais-moi une séance jambes ce soir');
        const pi=t.indexOf('PROFIL ATHLÈTE:');
        const mk=t.indexOf("═══ SITUATION DE L'INSTANT ═══");
        const avant=t.slice(0,pi);
        // aucune donnée personnelle ne doit apparaître avant la frontière
        const nom=(S.name||'').trim();
        return { trouve: pi>1000 && mk>pi,
                 taille: pi,
                 sansNom: !nom || avant.indexOf(nom)<0 };
      })(),
      // ⚠️ EXPORT DES CONVERSATIONS (05/08, demande de Michel). Le fil vit UNIQUEMENT sur le
      // téléphone : un changement d'appareil l'efface. On donne un fichier, on n'envoie rien
      // sur un serveur — envoyer des conversations de santé dans la sauvegarde cloud serait
      // aujourd'hui une mauvaise idée (`loadProfile` sert encore un compte à qui connaît
      // l'adresse). Ce témoin vérifie le contenu ET l'invariant « ça ne part nulle part ».
      exportConv: (()=>{
        try{
          // ⚠️ Les discussions RANGÉES doivent être dans l'export aussi (corrigé le 05/08) :
          // le « + » ne supprime pas le fil, il le range dans S.coachConversations (30 max).
          // La 1ʳᵉ version n'exportait que le fil EN COURS — donc presque rien.
          S.coachConversations=[{id:'c1',title:'Ma séance de mardi',ts:Date.now()-864e5,
            messages:[{role:'user',content:'une vieille question rangée'},{role:'assistant',content:'une vieille réponse'}]}];
          localStorage.setItem('ft4_coach_hist', JSON.stringify([
            {role:'user',content:'salut Milo'},
            {role:'assistant',content:'Salut ! Comment tu vas ?'},
            {role:'user',content:'consigne interne',_silent:true},
            {role:'assistant',content:'Débrief automatique'}
          ]));
          let nom='', contenu='';
          const vraiCreate=URL.createObjectURL, vraiA=document.createElement.bind(document);
          URL.createObjectURL=(b)=>{ contenu='(blob)'; return 'blob:faux'; };
          document.createElement=(t)=>{ const el=vraiA(t); if(t==='a'){ el.click=()=>{ nom=el.download; }; } return el; };
          let envoye=false; const vf=window.fetch; window.fetch=()=>{ envoye=true; return Promise.resolve({ok:true,text:()=>Promise.resolve('')}); };
          let texte='';
          const vraiBlob=window.Blob;
          window.Blob=function(parts,opts){ texte=(parts&&parts[0])||''; return new vraiBlob(parts,opts); };
          exporterConversationsMilo();
          window.Blob=vraiBlob;
          window.fetch=vf; URL.createObjectURL=vraiCreate; document.createElement=vraiA;
          return { nomOk:/^mes-conversations-milo-\d{4}-\d{2}-\d{2}\.txt$/.test(nom), rienEnvoye:envoye===false,
                   contientRangee: texte.indexOf('une vieille question rangée')>=0,
                   contientCourante: texte.indexOf('salut Milo')>=0,
                   sansSilent: texte.indexOf('consigne interne')<0 };
        }catch(e){ return {erreur:String(e&&e.message||e)}; }
      })(),
      // ⚠️ LA DURÉE DE CARDIO LEVAIT UNE ERREUR (07/08) — trouvée dans le journal d'erreurs de
      // l'Admin, pas par un test : `ReferenceError: Can't find variable: c` (app.js:76). Le code
      // lisait `c.duration` dans une fonction où `c` n'existe pas. L'erreur interrompait la suite
      // de setCardioField(), donc `renderLogFinish()` n'était jamais appelé. ⚠️ Le témoin doit
      // CRÉER le bouton : sans lui, `if(btn)` court-circuite et le bug ne se déclenche pas.
      cardioDuree: (()=>{
        const vw=S.wkt;
        try{
          S.wkt={exs:[],cardio:null,cardioAvant:null};
          ['cardio-summary','cardio-save-btn'].forEach(id=>{
            if(!document.getElementById(id)){
              const d=document.createElement('div'); d.id=id; document.body.appendChild(d);
            }
          });
          let err='';
          try{ setCardioField('duration','12','apres'); }catch(e){ err=String(e&&e.message||e); }
          const btn=document.getElementById('cardio-save-btn');
          return { erreur:err, visible:btn?btn.style.display:'(absent)',
                   duree:(S.wkt&&S.wkt.cardio&&S.wkt.cardio.duration)||0 };
        }catch(e){ return {erreur:'test:'+String(e&&e.message||e)}; }
        finally{ S.wkt=vw; }
      })(),
      // ⚠️ « C'ÉTAIT CELLE-LÀ ? » POSÉE À TORT (06/08) — trouvé dans les VRAIES conversations
      // exportées par Michel : séance annoncée pour SAMEDI, faite le MERCREDI, et l'Accueil
      // demandait si celle de mercredi était celle de samedi. On appelle le VRAI `_miloMessage()`
      // (pas une copie de sa logique dans le test — l'erreur de ft-v760/770) sur deux états.
      celleLa: (()=>{
        const vs=S.sessions, vn=S.nextPlanned;
        const j=n=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+n);
                    return d.toISOString().slice(0,10);};
        try{
          S.sessions=[{date:today(),exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:8,done:true}]}],vol:1}];
          S.nextPlanned={date:j(3),label:'Larsen Press'};
          const loin=_miloMessage();
          S.nextPlanned={date:j(1),label:'bas du corps'};
          const demain=_miloMessage();
          return { loinId:(loin&&loin.id)||'', demainId:(demain&&demain.id)||'' };
        }catch(e){ return {erreur:String(e&&e.message||e)}; }
        finally{ S.sessions=vs; S.nextPlanned=vn; }
      })(),
      // ⚠️ LE BLOC CACHÉ INCOMPLET (05/08) — relevé par Gemini ET Mistral. Le prompt demande
      // au modèle de se relire (« Vérifie avant d'envoyer : même nombre d'exercices… »).
      // S'il oublie un exercice, la personne démarre une séance AMPUTÉE de ce qu'elle vient
      // de lire, sans que rien ne le signale. Le code compare désormais au texte visible —
      // et ne bascule QUE dans le cas certain : le texte en trouve strictement plus ET tous
      // ceux du bloc s'y retrouvent (bloc tronqué). Sinon on garde le bloc, plus riche.
      coherenceSeance: (()=>{
        const txt='Voici ta séance :\n- Squat à la Barre 4×8 @ 100 kg\n- Développé Couché 4×8 @ 80 kg\n'
                 +'- Rowing Barre 4×10 @ 60 kg\n- Curl Barre 3×12 @ 30 kg\n';
        const bloc3='\n```json\n{"seance":{"label":"Full","exs":['
          +'{"name":"Squat à la Barre","sets":[{"reps":8,"kg":100,"type":"N","rest":180}]},'
          +'{"name":"Développé Couché","sets":[{"reps":8,"kg":80,"type":"N","rest":180}]},'
          +'{"name":"Rowing Barre","sets":[{"reps":10,"kg":60,"type":"N","rest":120}]},'
          +'{"name":"Curl Barre","sets":[{"reps":12,"kg":30,"type":"N","rest":90}]}]}}\n```';
        const blocTronque='\n```json\n{"seance":{"label":"Full","exs":['
          +'{"name":"Squat à la Barre","sets":[{"reps":8,"kg":100,"type":"N","rest":180}]},'
          +'{"name":"Développé Couché","sets":[{"reps":8,"kg":80,"type":"N","rest":180}]}]}}\n```';
        const complet=_extractDaySession(txt+bloc3);
        const ampute =_extractDaySession(txt+blocTronque);
        return { completGarde: !!complet && complet.sess.exs.length===4 && !complet.recolle,
                 amputeRecolle: !!ampute && ampute.recolle===true && ampute.sess.exs.length===4 };
      })(),
      // ⚠️ LA DATE ANNONCÉE, CALCULÉE PAR LE CODE (05/08). L'app n'acceptait que YYYY-MM-DD :
      // Milo devait traduire lui-même « mercredi » en date. Famille ft-v658/660 — et le pire
      // n'est pas qu'il échoue, c'est qu'il peut produire une date VALIDE mais FAUSSE, que
      // l'app enregistre sans pouvoir s'en apercevoir. Désormais le code traduit.
      dateAnnoncee: (typeof _dateAnnoncee==='function') ? (()=>{
        const t=today(); const j=n=>{const d=new Date(t+'T12:00:00'); d.setDate(d.getDate()+n);
          const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4); return z.toISOString().slice(0,10); };
        return { iso:_dateAnnoncee('2026-12-25')==='2026-12-25',
                 demain:_dateAnnoncee('demain')===j(1),
                 apres:_dateAnnoncee('après-demain')===j(2),
                 aujourdhui:_dateAnnoncee("aujourd'hui")===j(0),
                 dans3:_dateAnnoncee('dans 3 jours')===j(3),
                 jour:/^\d{4}-\d{2}-\d{2}$/.test(_dateAnnoncee('vendredi')),
                 vide:_dateAnnoncee('')==='' , flou:_dateAnnoncee('bientôt')==='' };
      })() : null,
      // ⚠️ L'AMBIGUÏTÉ DU TON (05/08) — relevée par Gemini ET Mistral, citations exactes des
      // deux côtés, vérifiées. Deux blocs employaient le mot « énergie » en sens OPPOSÉ :
      // « Miroir de son énergie, pas plus » (TA PERSONNALITÉ) contre « motivant si elle a
      // besoin d'énergie » (PROFIL ATHLÈTE). Ce n'est pas une contradiction — le premier parle
      // du REGISTRE DE LANGAGE, le second de la POSTURE — mais rien ne le disait, et ça se joue
      // là où ça compte : face à quelqu'un qui est à plat, faut-il refléter sa fatigue ou le
      // porter ? Aucune règle retirée : on a NOMMÉ la portée de chacune.
      ton: (()=>{ const r0=buildCoachContext('fais-moi une séance jambes pour ce soir stp'); return {
        registre: /porte sur le REGISTRE DE LANGAGE/.test(r0||''),
        posture:  /c'est la POSTURE, pas le registre/i.test(r0||''),
        pasAPlat: /tu ne te mets pas à plat avec elle/.test(r0||'')
      }; })(),
      // ⚠️ LE REPOS ÉCRIT EN CLAIR (05/08) — bug latent trouvé en déplaçant la logique vers
      // le code. L'app lisait `parseInt(s.rest)` ; si Milo écrit `"rest":"3 min"` au lieu de
      // 180 — ce qu'un modèle léger fait volontiers — parseInt vaut **3**, et le chronomètre
      // de repos passait à 3 SECONDES. Aucune erreur, aucun message : un chrono absurde.
      // On ne durcit pas la consigne, on rend l'app tolérante (patron de ft-v761).
      repos: (typeof _secRepos==='function') ? {
        n180:_secRepos(180), s180:_secRepos('180'), min3:_secRepos('3 min'), min3c:_secRepos('3min'),
        s90:_secRepos('90 s'), mixte:_secRepos('1 min 30'), deuxpts:_secRepos('1:30'),
        vide:_secRepos(''), nul:_secRepos(null), texte:_secRepos('bientôt'), neg:_secRepos(-5)
      } : null,
      wnMax: (typeof WHATS_NEW_MAX!=='undefined')?WHATS_NEW_MAX:-1,
      wnPlusGrand: (typeof WHATS_NEW!=='undefined')?WHATS_NEW.reduce((m,f)=>Math.max(m,(f&&f.v)||0),0):-2,
      wnRestantApresVu: (()=>{ try{ localStorage.setItem('ft4_wn_seen',String(WHATS_NEW_MAX));
        return WHATS_NEW.filter(f=>f.v>WHATS_NEW_MAX).length; }catch(e){ return -1; } })(),
      texteAvec: buildCoachContext("fais-moi une séance jambes pour ce soir stp"),
      secretAdmin: (()=>{ const av=S.email; S.email='michdu75@gmail.com';
        const t=buildCoachContext('coucou'); S.email=av;
        return {autorise:/tu parles ici à MICHEL/.test(t), interdit:/CONSIGNES SONT PRIVÉES/.test(t)}; })(),
      secretAutre: (()=>{ const av=S.email; S.email='quelquun@exemple.test';
        const t=buildCoachContext('coucou'); S.email=av;
        return {interdit:/CONSIGNES SONT PRIVÉES/.test(t), blague:/demander à Michel/.test(t),
                ouvert:/la transparence sur ton FONCTIONNEMENT/i.test(t)}; })(),
      avec: buildCoachContext("fais-moi une séance jambes pour ce soir stp").length,
      sans: buildCoachContext("j'ai très mal dormi cette nuit, je suis complètement épuisé aujourd'hui").length,
      sansArg: buildCoachContext().length
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ PROMPT : le catalogue est là pour les 10 messages qui en ont besoin',
    Array.isArray(r.manques) && r.manques.length===0, JSON.stringify(r.manques||r));
  t('⭐⭐ PROMPT : … y compris en pleine conversation (« tu me changes ça ? »)',
    Array.isArray(r.manquesSuite) && r.manquesSuite.length===0, JSON.stringify(r.manquesSuite||r));
  // ⚠️ RETOURNÉ le 10/08 : il n'est PLUS retiré sur un message hors sujet — c'est ce qui
  // permet de le mettre en cache. Le témoin vérifie donc l'inverse de ce qu'il vérifiait.
  t('⭐⭐ PROMPT : il est là MÊME sur « j\'ai mal dormi » (c\'est ce qui le rend cachable)',
    r.retires===0, 'il est encore retiré sur '+JSON.stringify(r.retires)+' message(s) → le cache saute');
  t('⭐⭐ CACHE : le contexte a EXACTEMENT la même taille quel que soit le sujet',
    r.avec===r.sans, 'avec='+r.avec+' sans='+r.sans+' → préfixe variable = cache manqué');
  t('⭐ PROMPT : un appelant SANS message reçoit le contexte COMPLET (diagnostic, laboratoire)',
    r.sansArg===r.avec, 'sansArg='+r.sansArg+' avec='+r.avec);
  // ⚠️ SÉCURITÉ (04/08) — Michel : « si c'est le cas c'est un point de sécurité ». Vérifié ce
  // soir-là : AUCUNE consigne n'empêchait Milo de réciter ses propres instructions. Le prompt
  // ne contient aucun secret (0 clé, 0 e-mail, 0 URL, et jamais les données d'un autre
  // utilisateur — mesuré), mais il porte LES GARDE-FOUS eux-mêmes : santé, blessures, limites
  // de rôle. Or *qui lit les garde-fous sait comment les contourner* — quelqu'un qui veut faire
  // dire à Milo ce qu'il ne doit pas dire commence par lui demander ses règles.
  // ⚠️ Ce n'est PAS étanche (une consigne de prompt se contourne) : c'est un ralentisseur.
  // La vraie réponse est le Gardien de la Constitution en SORTIE, déterministe (cf. CLAUDE.md).
  // ⚠️ CONTRADICTION, pas doublon (05/08) — trouvée en vérifiant l'audit que Milo a fait de son
  // propre prompt. Il disait DEUX choses opposées : « POSE 1 ou 2 questions ciblées AVANT de
  // trancher » (Méthode de coaching, Savoir raisonner) contre « AU PLUS UNE question, APRÈS ta
  // proposition seulement, UNE seule, jamais deux » (Interdiction d'interrogatoire). Opposées
  // sur le NOMBRE et sur le MOMENT. C'est le bug de l'« interrogatoire » qui avait résisté à
  // trois durcissements de prompt (ft-v602/603/606) : on avait conclu « c'est le modèle » (R9),
  // c'était vrai — ET il y avait une contradiction dedans. Un modèle puissant tranche entre deux
  // règles opposées ; un modèle léger, non. Michel venait de passer en Sonnet.
  // ⚠️ LA POP-UP QUI REVENAIT À CHAQUE OUVERTURE (05/08) — signalée par Michel : « à chaque
  // mise à jour j'ai la pop-up, c'est relou ». Les entrées 53 et 54 avaient été ajoutées la
  // veille sans incrémenter `WHATS_NEW_MAX`, resté à 52. À la fermeture, l'app note « vu
  // jusqu'à 52 » → 53 et 54 restent éternellement non vues → la pop-up revient toujours.
  // Aucune erreur, aucun test rouge : juste une pop-up qui harcèle tout le monde.
  // Le nombre est désormais CALCULÉ (R2) ; ce témoin garantit qu'il ne peut plus mentir.
  // ⚠️ LE VOYANT DE SAUVEGARDE QUI MENTAIT (05/08) — le serveur triait les fichiers par NOM :
  // « backup-MIGRATION-2026-06-29 » passait APRÈS « backup-2026-08-05 » (car « m » > « 2 »).
  // Le fichier de migration du 29 juin était donc annoncé « le plus récent » POUR TOUJOURS,
  // et le voyant serait resté rouge même avec des sauvegardes parfaites. Une alarme qui crie
  // pour rien est celle qu'on apprend à ignorer — c'est ce qui a coûté 36 jours sans filet.
  // ⚠️ LE NUAGE BLANC (05/08) — la pastille « séance synchronisée » portait color:var(--green)
  // mais contenait l'EMOJI ☁️, qui garde ses propres couleurs : nuage blanc sur fond vert.
  // Un SVG hérite de `currentColor`, donc il suit la pastille en clair comme en sombre.
  const srcSet=await p.evaluate(async()=>{ const r=await fetch('setup.js'); return await r.text(); });
  t('⭐ HISTORIQUE : la pastille de synchro est un SVG (currentColor), plus un emoji non colorable',
    /synced-pill[^]{0,200}<svg/.test(srcSet) && !/synced-pill">☁️/.test(srcSet),
    'la pastille contient encore un emoji');
  t('⭐ SAUVEGARDE : le tri par NOM place bien la migration en dernier (le piège à figer)',
    r.triNom === 'backup-migration-2026-06-29-2003.json', JSON.stringify(r.triNom));
  // ⚠️ ON LIT LE VRAI `app.js` SERVI — surtout pas une copie de la logique dans le test.
  // Première version de ce témoin : je rejouais le calcul ici → contrôle négatif à 0 rouge,
  // c'est-à-dire un test qui teste sa propre copie (même erreur qu'à ft-v760, refaite).
  const srcBk=await p.evaluate(async()=>{ const r=await fetch('app.js'); return await r.text(); });
  t('⭐ SAUVEGARDE : l\'app lit la date FOURNIE par le serveur (bk.lastDate), jamais celle du nom',
    /bk\.lastDate\s*\?/.test(srcBk) && /bk\.lastName\s*\|\|/.test(srcBk),
    'app.js ne lit pas bk.lastDate / bk.lastName');
  // ⚠️ LE DOUBLE DÉBRIEF (07/08) — trouvé dans l'export de conversations de Michel : Milo a
  // débriefé DEUX FOIS la même séance, avec deux objectifs mémorisés contradictoires (le second,
  // faux, écrasait le premier). Course entre `_runSeDebrief` (écran de fin) et `_maybeAutoDebrief`
  // (écran Coach) : le premier ne rendait le jeton `ft4_pending_debrief` qu'APRÈS la réponse de
  // l'IA, plusieurs secondes plus tard. ⚠️ On reproduit la course avec un appel réseau LENT —
  // sans la lenteur, le bug ne se déclenche pas et le témoin serait vert des deux côtés.
  const dbl=await p.evaluate(async()=>{
    const vf=window.fetch, vs=S.url;
    try{
      S.url='https://exemple.invalide/exec';
      localStorage.setItem('ft4_pending_debrief','SEANCE-TEST');
      if(!document.getElementById('se-debrief')){
        const d=document.createElement('div'); d.id='se-debrief'; document.body.appendChild(d);
      }
      let appels=0;
      window.fetch=()=>{ appels++; return new Promise(r=>setTimeout(()=>r({
        ok:true, json:()=>Promise.resolve({reply:'Débrief de test.'})
      }),400)); };
      const p1=_runSeDebrief({exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}],
                              volume:500,id:'SEANCE-TEST'},0);
      const p2=_maybeAutoDebrief();      // le Coach s'ouvre PENDANT que le premier attend
      await Promise.all([p1,p2]);
      return {appels:appels, jeton:localStorage.getItem('ft4_pending_debrief')};
    }catch(e){ return {erreur:String(e&&e.message||e)}; }
    finally{ window.fetch=vf; S.url=vs; localStorage.removeItem('ft4_pending_debrief'); }
  });
  t('⭐⭐ DÉBRIEF : la séance n\'est débriefée QU\'UNE FOIS, même si le Coach s\'ouvre pendant l\'appel',
    dbl && dbl.appels===1, JSON.stringify(dbl));
  t('DÉBRIEF : une fois fait, le jeton est consommé (pas de débrief au prochain lancement)',
    dbl && dbl.jeton===null, JSON.stringify(dbl));
  // ⚠️ LE REFUS D'AUTHENTIFICATION NE DOIT JAMAIS ÊTRE SILENCIEUX (ft-v788). Avant de poser un
  // code perso sur un compte, il fallait s'assurer qu'un appareil SANS le code le VOIE : le refus
  // tombait dans un `else` vide, donc la synchro mourait sans un mot. Et `_cloudSync` envoie en
  // `no-cors`, donc elle est aveugle par construction : ce contrôle du démarrage est le seul
  // endroit qui peut voir le refus.
  const refus = await p.evaluate(async()=>{
    const vf=window.fetch, vs=S.url, ve=S.email;
    try{
      S.url='https://exemple.invalide/exec'; S.email='x@y.z';
      const el=document.getElementById('email-verify-card');
      let toasts=[]; const vt=window.toast; window.toast=(m)=>toasts.push(String(m));
      window.fetch=()=>Promise.resolve({json:()=>Promise.resolve({status:'error',error:'auth'})});
      // on rejoue le SEUL chemin qui voit le refus : la réponse est traitée par le même code
      const r=await fetch(S.url); const d=await r.json();
      let vu=false;
      if(d.status==='error'&&d.error==='auth'){ _renderAuthRefusCard(); vu=true; }
      window.toast=vt;
      return { traite:vu, carte:!!(el&&/pause/i.test(el.innerHTML)),
               local:(typeof _cloudSync==='function') };
    }catch(e){ return {erreur:String(e&&e.message||e)}; }
    finally{ window.fetch=vf; S.url=vs; S.email=ve; }
  });
  t('⭐⭐ SÉCURITÉ : un refus d\'authentification s\'AFFICHE (plus de synchro morte en silence)',
    refus && refus.carte===true, JSON.stringify(refus));
  // ⚠️ DEUX CAS À NE PAS CONFONDRE (ft-v789) : réclamer « ton code » à quelqu'un qui n'en a
  // jamais posé, c'est l'envoyer chercher un truc qui n'existe pas. Le serveur renvoie donc
  // `needsCode`, et l'app doit proposer de PROTÉGER le compte, pas de saisir un code.
  const deuxCas = await p.evaluate(()=>{
    const el=document.getElementById('email-verify-card');
    const lire=()=>el?el.innerHTML:'';
    window._ftAuthNeedsCode=true;  _renderAuthRefusCard(); const neuf=lire();
    window._ftAuthNeedsCode=false; _renderAuthRefusCard(); const connu=lire();
    window._ftAuthNeedsCode=false;
    return { neufProtege:/openProtect\(\)/.test(neuf) && /protèges ton compte/i.test(neuf),
             connuDemandeCode:/_saisirCodeResync\(\)/.test(connu) && /saisir le code/i.test(connu),
             differents: neuf!==connu };
  });
  t('⭐⭐ SÉCURITÉ : un compte SANS code se voit proposer de le protéger, pas de taper un code',
    deuxCas && deuxCas.neufProtege===true && deuxCas.differents===true, JSON.stringify(deuxCas));
  t('SÉCURITÉ : un compte AVEC code, sur un appareil qui ne l\'a pas, se voit demander le code',
    deuxCas && deuxCas.connuDemandeCode===true, JSON.stringify(deuxCas));
  // ⚠️ LE BOUTON DISAIT TOUJOURS LA MÊME CHOSE (ft-v790) — Michel : « je n'ai pas retiré mon code
  // perso », alors que son compte ÉTAIT protégé. Le libellé était en dur dans index.html.
  const btnProt = await p.evaluate(()=>{
    const b=document.getElementById('btn-protect-account'); if(!b) return {absent:true};
    // ⚠️ le témoin doit SURVIVRE à l'absence de la fonction : sans ce catch, le contrôle négatif
    // fait planter tout le runner au lieu d'afficher un rouge (constaté en le lançant).
    if(typeof _majBoutonProtect!=='function') return {absente:true};
    const vs=(typeof _protectStatus!=='undefined')?_protectStatus:null;
    try{
      _protectStatus={hasCode:true};  _majBoutonProtect(); const oui=b.textContent;
      _protectStatus={hasCode:false}; _majBoutonProtect(); const non=b.textContent;
      return { protege:/protégé/i.test(oui), pasProtege:/Protéger mon compte/i.test(non), differents:oui!==non };
    }catch(e){ return {erreur:String(e&&e.message||e)}; }
    finally { _protectStatus=vs; }
  });
  t('⭐ PROTECTION : le bouton dit si le compte EST protégé (il affichait toujours la même chose)',
    btnProt && btnProt.protege===true && btnProt.differents===true, JSON.stringify(btnProt));
  const srcPrem = await p.evaluate(async()=>{ const r=await fetch('app.js'); return await r.text(); });
  t('⭐ SÉCURITÉ : le premium ne tombe PAS avec la lecture (on ne punit pas deux fois)',
    /needsCode[^]{0,900}_isClientPremium/.test(srcPrem),
    'le repli premium client manque dans la branche de refus');
  const srcAuth = await p.evaluate(async()=>{ const r=await fetch('app.js'); return await r.text(); });
  t('SÉCURITÉ : le démarrage traite bien le cas error/auth (le `else` vide est fermé)',
    /d2\.error===['"]auth['"]/.test(srcAuth), 'app.js ne traite pas error:auth au démarrage');
  t('SÉCURITÉ : le code saisi est VÉRIFIÉ avant d\'être enregistré (un code faux ne se fige pas)',
    /_saisirCodeResync/.test(srcAuth) && /_setAuthCode\(c\)/.test(srcAuth),
    'la saisie du code n\'est pas vérifiée avant enregistrement');
  // ⚠️ AUCUN SECRET DANS LES FICHIERS LIVRÉS (07/08) — le jeton d'administration `FT_IDEES_2026`
  // était écrit en clair dans `app.js`, servi publiquement par GitHub Pages et présent dans un
  // dépôt public : `?action=getIdees` livrait donc le nom, l'e-mail et le message de chaque
  // testeur à qui savait lire le fichier. Ce qui a manqué ici n'est pas une idée, c'est un
  // CONTRÔLE — d'où ce témoin. On lit les fichiers RÉELLEMENT SERVIS, pas le disque.
  const fichiersServis = {};
  for (const f of ['app.js','constants.js','coach.js','setup.js','log.js','screens.js','state.js','tracking.js']) {
    fichiersServis[f] = await p.evaluate(async n=>{ const r=await fetch(n); return await r.text(); }, f);
  }
  const motifsSecrets = [
    [/FT_IDEES_2026/, 'l\'ancien jeton admin en clair'],
    [/FT_BACKUP_INIT_\w+/, 'le jeton de sauvegarde en clair'],
    [/sk-ant-[A-Za-z0-9]/, 'une clé API Anthropic'],
    [/service_role/, 'la clé service_role de Supabase'],
  ];
  const fuites = [];
  for (const [f, src] of Object.entries(fichiersServis))
    for (const [re, quoi] of motifsSecrets)
      if (re.test(src)) fuites.push(f + ' → ' + quoi);
  t('⭐⭐ SÉCURITÉ : aucun secret en clair dans les fichiers servis publiquement',
    fuites.length === 0, fuites.join(' · '));
  t('SÉCURITÉ : le jeton admin est demandé une fois et gardé sur l\'appareil, jamais dans le code',
    /_adminTok\s*\(\s*\)/.test(fichiersServis['app.js']) &&
    /ft4_admin_tok/.test(fichiersServis['app.js']),
    'app.js n\'utilise pas _adminTok()');
  t('⭐⭐ CARDIO : saisir une durée ne lève AUCUNE erreur (le « variable c » du journal Admin)',
    r.cardioDuree && r.cardioDuree.erreur==='', JSON.stringify(r.cardioDuree));
  t('CARDIO : le bouton « Enregistrer le cardio » apparaît dès qu\'une durée est saisie',
    r.cardioDuree && r.cardioDuree.visible==='block' && r.cardioDuree.duree===12,
    JSON.stringify(r.cardioDuree));
  t('⭐⭐ ACCUEIL : une séance annoncée DANS 3 JOURS ne déclenche plus « c\'était celle-là ? »',
    r.celleLa && r.celleLa.loinId==='prevu', JSON.stringify(r.celleLa));
  t('ACCUEIL : annoncée pour DEMAIN et faite aujourd\'hui → la question reste posée (non-régression)',
    r.celleLa && r.celleLa.demainId==='seance-faite', JSON.stringify(r.celleLa));
  t('⭐⭐ CACHE PARTAGÉ : la frontière « PROFIL ATHLÈTE: » existe et précède le marqueur d\'instant',
    r.blocCommun && r.blocCommun.trouve===true, JSON.stringify(r.blocCommun));
  t('⭐⭐ CACHE PARTAGÉ : AUCUNE donnée personnelle avant cette frontière (sinon le partage tombe)',
    r.blocCommun && r.blocCommun.sansNom===true, JSON.stringify(r.blocCommun));
  t('⭐ EXPORT : « Exporter mes conversations » produit bien un fichier daté',
    r.exportConv && r.exportConv.nomOk===true, JSON.stringify(r.exportConv));
  t('⭐⭐ EXPORT : les discussions RANGÉES y sont aussi, pas seulement le fil en cours',
    r.exportConv && r.exportConv.contientRangee===true && r.exportConv.contientCourante===true,
    JSON.stringify(r.exportConv));
  t('EXPORT : les consignes internes (jamais affichées) en sont exclues',
    r.exportConv && r.exportConv.sansSilent===true, JSON.stringify(r.exportConv));
  t('⭐⭐ EXPORT : il n\'ENVOIE RIEN sur le réseau — les conversations ne quittent pas l\'appareil',
    r.exportConv && r.exportConv.rienEnvoye===true, JSON.stringify(r.exportConv));
  t('⭐⭐ SÉANCE : un bloc caché INCOMPLET est rattrapé par le texte visible (séance jamais amputée)',
    r.coherenceSeance && r.coherenceSeance.amputeRecolle===true, JSON.stringify(r.coherenceSeance));
  t('⭐ SÉANCE : quand le bloc est complet, on le garde (il est plus riche : repos, types)',
    r.coherenceSeance && r.coherenceSeance.completGarde===true, JSON.stringify(r.coherenceSeance));
  t('⭐⭐ DATE : le CODE traduit « demain », « vendredi », « dans 3 jours » — Milo ne calcule plus',
    r.dateAnnoncee && r.dateAnnoncee.iso && r.dateAnnoncee.demain && r.dateAnnoncee.apres
      && r.dateAnnoncee.aujourdhui && r.dateAnnoncee.dans3 && r.dateAnnoncee.jour,
    JSON.stringify(r.dateAnnoncee));
  t('DATE : ce qui est illisible ne produit AUCUNE date (on n\'invente jamais)',
    r.dateAnnoncee && r.dateAnnoncee.vide===true && r.dateAnnoncee.flou===true,
    JSON.stringify(r.dateAnnoncee));
  t('⭐ TON : la portée de chaque règle est NOMMÉE (registre de langage vs posture)',
    r.ton && r.ton.registre===true && r.ton.posture===true, JSON.stringify(r.ton));
  t('⭐ TON : face à quelqu\'un à plat, Milo ne se met pas à plat avec lui',
    r.ton && r.ton.pasAPlat===true, JSON.stringify(r.ton));
  t('⭐⭐ REPOS : « 3 min » vaut 180 s, pas 3 (le chrono ne peut plus tomber à 3 secondes)',
    r.repos && r.repos.min3===180 && r.repos.min3c===180 && r.repos.n180===180 && r.repos.s180===180,
    JSON.stringify(r.repos));
  t('⭐ REPOS : les autres écritures humaines sont comprises (90 s · 1 min 30 · 1:30)',
    r.repos && r.repos.s90===90 && r.repos.mixte===90 && r.repos.deuxpts===90, JSON.stringify(r.repos));
  t('REPOS : ce qui est illisible rend 0 → l\'app garde son réglage habituel',
    r.repos && r.repos.vide===0 && r.repos.nul===0 && r.repos.texte===0 && r.repos.neg===0,
    JSON.stringify(r.repos));
  t('⭐⭐ CACHE : le préfixe mis en cache est IDENTIQUE quel que soit le sujet du message',
    r.cachePrefixe && r.cachePrefixe.trouve===true && r.cachePrefixe.identiques===true,
    JSON.stringify(r.cachePrefixe));
  // ⚠️ RETOURNÉ le 10/08 : les deux sont maintenant TOUJOURS présents (ils sont en cache).
  // Ce qu'on protège n'a pas changé — ils ne doivent jamais se retrouver l'un sans l'autre.
  t('⭐⭐ PROMPT : les blocs « construire une séance » et le catalogue sont là DANS TOUS LES CAS',
    r.coherence && r.coherence.chaud.seance===true && r.coherence.chaud.cat===true
                && r.coherence.froid.seance===true && r.coherence.froid.cat===true,
    JSON.stringify(r.coherence));
  t('⭐ PROMPT : « le premier MOMENT MILO » ne part plus qu\'au DÉBUT de la conversation',
    r.momentMilo && r.momentMilo.debut===true && r.momentMilo.tard===false,
    JSON.stringify(r.momentMilo));
  t('⭐ POP-UP : « vu » couvre bien TOUTES les nouveautés (sinon elle revient à chaque ouverture)',
    r.wnMax===r.wnPlusGrand && r.wnRestantApresVu===0,
    JSON.stringify({max:r.wnMax, plusGrand:r.wnPlusGrand, restant:r.wnRestantApresVu}));
  t('⭐⭐ PROMPT : plus AUCUNE consigne « 1 ou 2 questions » (elle contredisait « au plus UNE »)',
    !/1 ou 2 questions/i.test(r.texteAvec||''), 'occurrences trouvées');
  // ⚠️ 3ᵉ FORMULATION DU MÊME CONFLIT (05/08, trouvée par un audit externe et VÉRIFIÉE) :
  // « S'il te manque une info clé, tu la DEMANDES avant de trancher » — dans le bloc que le
  // prompt appelle lui-même « le plus important » — contre la règle cardinale « propose
  // d'abord, AU PLUS UNE question APRÈS ». Mon correctif de ft-v768 ne l'avait pas vue :
  // il cherchait « verbe + NOMBRE », et cette phrase-là n'a pas de nombre.
  t('⭐⭐ PROMPT : plus aucune consigne « DEMANDE avant de trancher » (elle contredit « propose d\'abord »)',
    !/DEMANDES?\s+avant de trancher/i.test(r.texteAvec||''), 'la formulation est revenue');
  t('PROMPT : la règle cardinale « au plus UNE question » est toujours là',
    /AU PLUS UNE question/i.test(r.texteAvec||''), 'règle cardinale absente !');
  t('⭐ SÉCURITÉ : pour TOUT LE MONDE, le texte des consignes est interdit… avec le sourire',
    r.secretAutre && r.secretAutre.interdit===true && r.secretAutre.blague===true,
    JSON.stringify(r.secretAutre));
  t('⭐ SÉCURITÉ : …mais expliquer son FONCTIONNEMENT reste ouvert (on ne casse pas la transparence)',
    r.secretAutre && r.secretAutre.ouvert===true, JSON.stringify(r.secretAutre));
  t('⭐ SÉCURITÉ : le SUPER-ADMIN (Michel) n\'est PAS bridé — et lui seul',
    r.secretAdmin && r.secretAdmin.autorise===true && r.secretAdmin.interdit===false,
    JSON.stringify(r.secretAdmin));
  await c7.close();
}

// ═══ 🚧 LE HORS-SUJET EST REFUSÉ EN LOCAL, AVANT LE RÉSEAU (ft-v817) ═════════════════════
// Michel : « les garde-fous c'est tout ce qui ne concerne pas le sport, à part pour moi »,
// puis « ah merde si le premier message ne parle pas de sport ça me coûte quand même ».
// ⚠️ CE QUE CE TEST PROTÈGE AVANT TOUT, ET DANS CET ORDRE : les FAUX POSITIFS. Refuser un
// vrai sportif est bien plus grave que laisser passer un poème (R29). Une liste blanche
// (« il faut un mot de sport ») bloquait 10 messages légitimes sur 10 — le contrôle
// ci-dessous fige ces 10 cas pour que personne ne retente l'inversion.
{
  const c9=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p9=await c9.newPage();
  await p9.goto('http://localhost:'+PORT+'/index.html'); await p9.waitForTimeout(2200);
  const r=await p9.evaluate(()=>{
   try{
    S.email='pas-michel@exemple.fr';                       // surtout PAS le super-admin
    const LEGIT=[
      "j'ai mal dormi cette nuit et je suis vraiment épuisé",
      "je suis stressé par le boulot en ce moment",
      "je pars en vacances pendant deux semaines",
      "je stagne depuis un mois et je ne comprends pas",
      "combien de protéines est-ce que je dois manger par jour ?",
      "je me sens nul, j'ai envie de tout arrêter",
      "j'ai 45 ans, est-ce que c'est trop tard pour commencer ?",
      "est-ce que la créatine vaut le coup ou pas ?",
      "mon genou me lance depuis hier soir",
      "je mange quoi avant d'y aller ?",
      "donne-moi une recette de porridge s'il te plaît",   // nutrition = DANS le périmètre
      "écris-moi un programme sur quatre semaines",         // « écris-moi » mais c'est du sport
      "raconte-moi ta séance type pour le dos",             // « raconte-moi » idem
      "dis-moi si je dois augmenter les charges"
    ];
    const HS=[
      "écris-moi un poème sur l'automne s'il te plaît",
      "tu peux m'aider pour mes devoirs de maths ?",
      "traduis-moi ce texte en anglais",
      "code-moi une fonction qui trie un tableau",
      "raconte-moi une blague pour rigoler un peu",
      "quel modèle d'IA est-ce que tu utilises exactement ?",
      "tu es chatgpt ou pas ?",
      "écris une chanson pour l'anniversaire de ma soeur"
    ];
    return {
      fauxPositifs: LEGIT.filter(m=>_estHorsSujet(m,false,{})),
      rates:        HS.filter(m=>!_estHorsSujet(m,false,{})),
      // les portes de sortie, une par une
      avecPhoto:    _estHorsSujet("écris-moi un poème sur l'automne", true, {}),
      debriefAuto:  _estHorsSujet("écris-moi un poème sur l'automne", false, {silent:true}),
      // Michel doit pouvoir tout tester
      admin: (()=>{ const av=S.email; S.email='michdu75@gmail.com';
        const v=_estHorsSujet("écris-moi un poème sur l'automne",false,{}); S.email=av; return v; })(),
      // la consigne de recentrage est-elle dans le prompt ? et LARGE pour la vraie vie ?
      prompt: (()=>{ const av=S.email; S.email='pas-michel@exemple.fr';
        const t=buildCoachContext('salut'); S.email=av;
        return { perimetre:/TON PÉRIMÈTRE, C'EST LE SPORT/.test(t),
                 sourire:/RECENTRE AVEC LE SOURIRE/.test(t),
                 vie:/TOUT CE QUE LA VIE DE LA PERSONNE FAIT À SON SPORT/.test(t) }; })(),
      promptAdmin: (()=>{ const av=S.email; S.email='michdu75@gmail.com';
        const t=buildCoachContext('salut'); S.email=av;
        return /aucune restriction de sujet/.test(t); })()
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ AUCUN message légitime n\'est refusé (14 témoins, dont les 10 qu\'une liste blanche bloquait)',
    Array.isArray(r.fauxPositifs) && r.fauxPositifs.length===0, JSON.stringify(r.fauxPositifs||r));
  t('⭐ les demandes franchement hors sujet sont refusées EN LOCAL (zéro appel, zéro euro)',
    Array.isArray(r.rates) && r.rates.length===0, JSON.stringify(r.rates||r));
  t('une PHOTO n\'est jamais refusée (corps, repas, programme : c\'est du métier)',
    r.avecPhoto===false, JSON.stringify(r));
  t('un débrief automatique de l\'app n\'est jamais refusé',
    r.debriefAuto===false, JSON.stringify(r));
  t('⭐ MICHEL n\'est jamais bridé — il doit pouvoir tout tester',
    r.admin===false, JSON.stringify(r));
  t('⭐ PROMPT : la consigne de recentrage est bien envoyée à Milo',
    r.prompt && r.prompt.perimetre===true && r.prompt.sourire===true, JSON.stringify(r.prompt));
  t('⭐⭐ PROMPT : … et elle dit EXPLICITEMENT que la vie de la personne EST dans le périmètre',
    r.prompt && r.prompt.vie===true,
    'sans cette phrase, Milo recadre quelqu\'un qui parle de son boulot ou de ses vacances');
  t('⭐ PROMPT : le super-admin reçoit la version sans restriction',
    r.promptAdmin===true, JSON.stringify(r));
  await c9.close();
}

// ═══ 💬 LES FORMULES DE POLITESSE SONT TRAITÉES EN LOCAL (ft-v818) ═══════════════════════
// Michel : « il va falloir mettre des phrases types en code pour éviter que Milo interroge
// l'API ». Mesuré sur son export : « salut ça va » = 0,147 $, dont 0,4 % pour la réponse.
// ⚠️ CE QUE CE TEST PROTÈGE EN PREMIER : le cas où Milo ATTEND une réponse. Un « ok merci »
// après « tu veux qu'on prépare lundi ? » doit partir chez Milo — répondre « avec plaisir »
// à ça laisse la personne en plan, ce qui coûte bien plus cher que 0,15 $ (R29).
{
  const c10=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p10=await c10.newPage();
  await p10.goto('http://localhost:'+PORT+'/index.html'); await p10.waitForTimeout(2200);
  const r=await p10.evaluate(()=>{
   try{
    const vide=()=>{ if(typeof coachHistory!=='undefined')coachHistory.length=0; };
    const miloDit=(t)=>{ vide(); coachHistory.push({role:'user',content:'x'},{role:'assistant',content:t}); };

    vide();
    const FORMULES=["salut","bonjour","coucou","salut ça va","ça va ?","hello","yo",
      "merci","merci beaucoup","ok merci","super merci","thanks",
      "à demain","bonne soirée","bonne nuit","ciao","à plus"];
    const local = FORMULES.filter(m=>_reponseLocale(m,false,{}));

    // ⚠️ Les VRAIS messages : aucun ne doit être court-circuité.
    const VRAIS=["ok","d'accord","ça marche","parfait","nickel","oui","non",
      "merci mais je voulais dire autre chose","salut, tu peux me faire une séance ?",
      "bonjour j'ai mal au genou","ça va pas fort aujourd'hui","à demain je fais quoi ?",
      "bonne séance ?","je te remercie de me faire un programme sur 4 semaines"];
    const fauxPositifs = VRAIS.filter(m=>_reponseLocale(m,false,{}));

    // ⚠️⚠️ LE VERROU : Milo vient de poser une question → tout part chez lui.
    miloDit("Voilà ta séance. Tu veux qu'on prépare lundi maintenant ?");
    const pendantQuestion = ["merci","ok merci","salut","à demain"].filter(m=>_reponseLocale(m,false,{}));
    // … et quand il n'attend rien, ça repasse en local
    miloDit("Voilà ta séance de demain. Bon entraînement 💪");
    const sansQuestion = ["merci","à demain"].filter(m=>_reponseLocale(m,false,{}));

    vide();
    return {
      local, manques: FORMULES.filter(m=>!_reponseLocale(m,false,{})), fauxPositifs,
      pendantQuestion, sansQuestion,
      avecPhoto: !!_reponseLocale("merci", true, {}),
      debriefAuto: !!_reponseLocale("merci", false, {silent:true}),
      // la réponse varie (sinon ça sonne robot au 3ᵉ « merci »)
      variees: new Set(Array.from({length:40},()=>_reponseLocale("merci",false,{}))).size
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ AUCUN vrai message n\'est court-circuité (« ok », « oui », « bonjour j\'ai mal au genou »…)',
    Array.isArray(r.fauxPositifs) && r.fauxPositifs.length===0, JSON.stringify(r.fauxPositifs||r));
  t('⭐⭐ quand Milo POSE UNE QUESTION, même « merci » repart chez lui',
    Array.isArray(r.pendantQuestion) && r.pendantQuestion.length===0,
    'répondu en local alors que Milo attendait : '+JSON.stringify(r.pendantQuestion||r));
  t('⭐ … et quand il n\'attend rien, la formule est traitée en local (zéro appel)',
    Array.isArray(r.sansQuestion) && r.sansQuestion.length===2, JSON.stringify(r.sansQuestion||r));
  t('⭐ les 17 formules de politesse sont reconnues',
    Array.isArray(r.manques) && r.manques.length===0, 'non reconnues : '+JSON.stringify(r.manques||r));
  t('une PHOTO n\'est jamais court-circuitée',
    r.avecPhoto===false, JSON.stringify(r));
  t('un débrief automatique n\'est jamais court-circuité',
    r.debriefAuto===false, JSON.stringify(r));
  t('la réponse VARIE (sinon ça sonne robot au 3ᵉ « merci »)',
    r.variees>=2, 'une seule réponse possible');
  await c10.close();
}

// ═══ 🔥 LA MONTÉE EN CHARGE EST CALCULÉE PAR LE CODE (ft-v822) ══════════════════════════
// Cas réel du 10/08 : Milo propose « 70×5 (É) → 130×3 ». Michel signale, Milo dit « t'as
// raison » et REPROPOSE LA MÊME CHOSE. Il n'avait rien zappé : la consigne disait « 1-2 séries
// légères » — un NOMBRE FIXE là où il faut une PROGRESSION liée à la charge.
// ⚠️ CE QUE CES TÉMOINS PROTÈGENT : un calcul déterministe ne doit plus dépendre du modèle
// (même motif que `_dateAnnoncee`), parce qu'ici une erreur plausible coûte une blessure.
{
  const c12=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p12=await c12.newPage();
  await p12.goto('http://localhost:'+PORT+'/index.html'); await p12.waitForTimeout(2200);
  const r=await p12.evaluate(()=>{
   try{
    const T=130;
    const m=_monteeEnCharge(T);
    const kgs=m.map(s=>s.kg), reps=m.map(s=>s.reps);
    const suite=kgs.concat([T]);
    const ecarts=[]; for(let i=1;i<suite.length;i++)ecarts.push(Math.round(1000*(suite[i]-suite[i-1])/T)/10);
    return {
      // — le calcul lui-même —
      paliers:kgs, reps:reps, ecarts:ecarts,
      depart:Math.round(100*kgs[0]/T),
      dernier:Math.round(100*kgs[kgs.length-1]/T),
      repsDecroissantes: reps.every((v,i)=>i===0||v<=reps[i-1]),
      arrondi: kgs.every(k=>Math.abs(k/2.5-Math.round(k/2.5))<1e-9),
      jamaisAuDessus: kgs.every(k=>k<T),
      // — les seuils —
      legerAucune: _monteeEnCharge(25).length===0,
      moyen: _monteeEnCharge(80).length,
      lourd: _monteeEnCharge(130).length,
      // — LA SÉANCE RÉELLE DU 10/08 : elle doit être jugée INSUFFISANTE —
      seanceDeMichel: _monteeSuffisante(
        [{kg:70,reps:5,type:'É'},{kg:100,reps:3,type:'É'},{kg:115,reps:3,type:'É'}], 130),
      // … et une montée correcte doit être ACCEPTÉE telle quelle
      monteeCorrecte: _monteeSuffisante(_monteeEnCharge(130), 130),
      // — la complétion sur une séance entière —
      complete: (()=>{
        const s={label:'test',exs:[
          {name:'Squat à la Barre', sets:[{kg:130,reps:3,type:'N'},{kg:130,reps:3,type:'N'}]},
          {name:'Curl Haltères',    sets:[{kg:45,reps:10,type:'N'}]},          // isolation → intact
          {name:'Développé Couché', sets:[{kg:30,reps:12,type:'N'}]}           // trop léger → intact
        ]};
        _completerMonteeEnCharge(s);
        return { squatSets:s.exs[0].sets.length, squatMontee:!!s.exs[0]._montee,
                 squatNote:/Montée en charge/.test(s.exs[0].note||''),
                 curlSets:s.exs[1].sets.length, curlMontee:!!s.exs[1]._montee,
                 legerSets:s.exs[2].sets.length, legerMontee:!!s.exs[2]._montee };
      })()
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ RÈGLE : aucun écart ne dépasse 15 % de la charge (les sources disent 10-15 %)',
    Array.isArray(r.ecarts) && r.ecarts.every(e=>e<=15.5), 'écarts : '+JSON.stringify(r.ecarts));
  t('⭐ RÈGLE : on démarre entre 40 et 50 % de la charge du jour',
    r.depart>=40 && r.depart<=50, 'départ à '+r.depart+' %');
  t('⭐ RÈGLE : le dernier palier est 5-15 % SOUS la charge de travail',
    r.dernier>=85 && r.dernier<=95, 'dernier palier à '+r.dernier+' %');
  t('RÈGLE : les répétitions décroissent (5 → 3 → 2 → 1)',
    r.repsDecroissantes===true, JSON.stringify(r.reps));
  t('RÈGLE : les charges sont arrondies à 2,5 kg (des disques qui existent)',
    r.arrondi===true, JSON.stringify(r.paliers));
  t('RÈGLE : aucun palier n\'atteint la charge de travail',
    r.jamaisAuDessus===true, JSON.stringify(r.paliers));
  t('⭐ SEUILS : rien sous 40 kg · 3 paliers en moyen · 4 en lourd',
    r.legerAucune===true && r.moyen===3 && r.lourd===4,
    'léger='+r.legerAucune+' moyen='+r.moyen+' lourd='+r.lourd);
  t('⭐⭐ LE CAS RÉEL DU 10/08 est bien jugé INSUFFISANT (trou de 23 % + 3 reps à 88 %)',
    r.seanceDeMichel===false, 'la montée 70/100/115 → 130 a été acceptée, elle ne devrait pas');
  t('⭐ … et une montée correcte est acceptée telle quelle (on ne réécrit pas pour rien)',
    r.monteeCorrecte===true, JSON.stringify(r));
  t('⭐⭐ SÉANCE : le gros mouvement lourd reçoit sa montée, ET l\'app le DIT',
    r.complete && r.complete.squatSets===6 && r.complete.squatMontee===true
                && r.complete.squatNote===true, JSON.stringify(r.complete));
  t('⭐ SÉANCE : un mouvement d\'ISOLATION n\'est pas touché (un curl n\'a pas besoin de 4 paliers)',
    r.complete && r.complete.curlSets===1 && r.complete.curlMontee===false, JSON.stringify(r.complete));
  t('⭐ SÉANCE : une charge LÉGÈRE n\'est pas touchée non plus',
    r.complete && r.complete.legerSets===1 && r.complete.legerMontee===false, JSON.stringify(r.complete));
  await c12.close();
}

// ═══ 🛡️ L'APP NE RETIRE JAMAIS UNE SÉRIE QUE MILO A ANNONCÉE (ft-v824) ═════════════════
// Régression livrée le 10/08 et trouvée par Michel LE SOIR MÊME, pendant sa séance :
// « il me donne 6 séries mais quand j'ajoute la séance il ne m'en donne que 5 ».
// `_completerMonteeEnCharge` REMPLAÇAIT l'échauffement de Milo par le sien ; sous 60 kg le
// barème en produisait 2 là où Milo en avait mis 3 → une série disparaissait EN SILENCE.
// ⚠️ Le journal de ft-v822 disait « l'app le DIT, elle n'ajoute jamais en douce » : je m'étais
// protégé contre l'AJOUT invisible et pas contre le RETRAIT — or le retrait fait mentir ce que
// la personne vient de lire.
// ET, en corrigeant, un second défaut est apparu : le barème produisait des montées que le
// contrôleur jugeait lui-même insuffisantes. Le test de ft-v822 ne vérifiait cette cohérence
// qu'à 130 kg — le seul poids où les plans écrits à la main tombaient juste.
{
  const c14=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p14=await c14.newPage();
  await p14.goto('http://localhost:'+PORT+'/index.html'); await p14.waitForTimeout(2200);
  const r=await p14.evaluate(()=>{
   try{
    const pertes=[];
    for(const kg of [40,45,50,60,70,80,100,120,130,150,180]){
      for(const nEch of [0,1,2,3,4]){
        for(const nTrav of [1,3,5]){
          const sets=[];
          for(let i=0;i<nEch;i++) sets.push({reps:5,kg:Math.round(kg*0.5),type:'É'});
          for(let i=0;i<nTrav;i++) sets.push({reps:8,kg:kg,type:'N'});
          const avant=sets.length;
          const s={label:'t',exs:[{name:'Rowing Barre (Tirage Horizontal)',sets:JSON.parse(JSON.stringify(sets))}]};
          _completerMonteeEnCharge(s);
          const apres=s.exs[0].sets.length;
          if(apres<avant) pertes.push(kg+'kg '+nEch+'E+'+nTrav+'N : '+avant+'->'+apres);
          const apresKg=s.exs[0].sets.map(x=>x.kg);
          for(const k of sets.map(x=>x.kg)) if(apresKg.indexOf(k)<0) pertes.push('charge '+k+' perdue ('+kg+'kg)');
        }
      }
    }
    const incoherents=[];
    for(let T=40;T<=200;T+=2.5){
      const m=_monteeEnCharge(T);
      if(!m.length || !_monteeSuffisante(m,T)) incoherents.push(T);
    }
    const cas50=(()=>{const s={label:'t',exs:[{name:'Rowing Barre (Tirage Horizontal)',sets:[
      {reps:5,kg:25,type:'É'},{reps:5,kg:25,type:'É'},{reps:5,kg:25,type:'É'},
      {reps:8,kg:50,type:'N'},{reps:8,kg:50,type:'N'},{reps:8,kg:50,type:'N'}]}]};
      _completerMonteeEnCharge(s); return s.exs[0].sets.length;})();
    const note=(()=>{const s={label:'t',exs:[{name:'Rowing Barre (Tirage Horizontal)',sets:[
      {reps:5,kg:25,type:'É'},{reps:8,kg:50,type:'N'}]}]};
      _completerMonteeEnCharge(s); return s.exs[0].note||'';})();
    return {pertes:pertes.slice(0,6), nbPertes:pertes.length,
            incoherents:incoherents.slice(0,6), nbIncoherents:incoherents.length,
            paliers:[_monteeEnCharge(50).length,_monteeEnCharge(80).length,_monteeEnCharge(130).length],
            cas50:cas50, note:note};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('\u2B50\u2B50 INVARIANT : le nombre de séries ne DIMINUE jamais (165 combinaisons)',
    r.nbPertes===0, r.nbPertes+' perte(s) : '+JSON.stringify(r.pertes));
  t('\u2B50\u2B50 LE BARÈME PASSE SON PROPRE CONTRÔLE à tous les poids (40 à 200 kg)',
    r.nbIncoherents===0, r.nbIncoherents+' poids incohérents : '+JSON.stringify(r.incoherents));
  t('\u2B50 2 paliers à 50 kg, 3 à 80, 4 à 130 (les sources disent 2-3 léger, 4-5 lourd)',
    JSON.stringify(r.paliers)==='[2,3,4]', JSON.stringify(r.paliers));
  t('\u2B50\u2B50 LE CAS RÉEL DU 10/08 : 6 séries annoncées, jamais moins de 6',
    r.cas50>=6, 'reçu '+r.cas50+' séries');
  t('\u2B50 l app DIT ce qu elle a complété (et dit « complétée », pas « ajoutée »)',
    /compl[ée]t[ée]e par l'app \(\+\d+ palier/.test(r.note||''), JSON.stringify(r.note));
  await c14.close();
}

// ═══ ⏭️ PASSAGE AUTOMATIQUE À L'EXERCICE SUIVANT (ft-v825) ═══════════════════════════════
// Retour de Michel, séance du 10/08 : « quand on finit le premier exercice ça ne bascule pas
// automatiquement sur le deuxième ; je suis obligé de cliquer sur l'exercice suivant ».
// ⭐ LE MÉCANISME EXISTAIT — pour les supersets, dropsets et pyramides. L'exercice ORDINAIRE,
// le cas le plus fréquent de tous, était le seul oublié.
// ⚠️⚠️ ET IL NE POUVAIT PAS MARCHER NON PLUS AILLEURS : les 3 endroits posaient `_restDoneCb`
// AVANT `startRest()`, or `startRest()` appelle `stopRest()` qui le remet à null. Le passage
// automatique après repos n'avait donc JAMAIS fonctionné, pour personne, depuis son écriture.
// Trouvé en ajoutant la même chose pour l'exercice ordinaire.
{
  const c15=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p15=await c15.newPage();
  await p15.goto('http://localhost:'+PORT+'/index.html'); await p15.waitForTimeout(2200);
  const r=await p15.evaluate(()=>{
   try{
    const box=()=>{const e=document.getElementById('nb-log');if(!e)return '';const b=e.getBoundingClientRect();
      return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)].join(',');};
    S.wkt={label:'Dos',start:Date.now(),exs:[
      {name:'Soulevé de Terre',sets:[{kg:100,reps:5,type:'N'},{kg:100,reps:5,type:'N'}]},
      {name:'Rowing Barre (Tirage Horizontal)',sets:[{kg:60,reps:8,type:'N'}]},
      {name:'Curl Barre',sets:[{kg:30,reps:10,type:'N'}]}]};
    _expandedEx=0; goScreen('s-log'); renderLog();
    const fabAvant=box();
    toggleSet(0,0);
    const milieu={cb:!!_restDoneCb, exp:_expandedEx};      // série intermédiaire : rien
    toggleSet(0,1);
    const fin={cb:!!_restDoneCb, exp:_expandedEx,
               lbl:(document.getElementById('rest-label')||{}).textContent||''};
    skipRest();                                            // on écourte le repos
    const apresSkip=_expandedEx;
    const fabApres=box();
    // dernier exercice : on ne doit PAS revenir en arrière
    _expandedEx=2; S.wkt.exs[1].sets.forEach(x=>x.done=true);
    toggleSet(2,0); const cbDernier=!!_restDoneCb;
    return {milieu, fin, apresSkip, cbDernier,
            fabBouge: fabAvant!==fabApres, fabAvant, fabApres};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('une série INTERMÉDIAIRE ne déclenche aucune avance',
    r.milieu && r.milieu.cb===false && r.milieu.exp===0, JSON.stringify(r.milieu));
  t('\u2B50\u2B50 la DERNIÈRE série d un exercice arme le passage au suivant',
    r.fin && r.fin.cb===true, JSON.stringify(r.fin));
  t('\u2B50 … et le repos ANNONCE ce qui vient ensuite',
    /Ensuite\s*:/.test((r.fin&&r.fin.lbl)||''), JSON.stringify(r.fin&&r.fin.lbl));
  t('\u2B50\u2B50 « Skip » HONORE l avance au lieu de la jeter (startRest effaçait la consigne)',
    r.apresSkip===1, 'exercice ouvert : '+r.apresSkip);
  t('\u2B50 au DERNIER exercice, on ne remonte pas au début',
    r.cbDernier===false, 'une avance a été armée alors qu il n y a plus rien après');
  t('\u2B50\u2B50 RÈGLE D OR #9 : le bouton central ne bouge PAS (mesuré, pas regardé)',
    r.fabBouge===false, r.fabAvant+' → '+r.fabApres);
  await c15.close();
}

// ═══ ⏱️ MILO SAIT COMBIEN DE TEMPS COÛTE UNE SÉRIE, CHEZ CETTE PERSONNE (ft-v826) ═════════
// 3ᵉ retour de la séance du 10/08 : « il ne prend pas en considération la phase de charge et de
// décharge des poids ; sur une séance d'une heure j'ai 8 min de cardio au début et 15-20 min à
// la fin, ça ne me laisse pas grand-chose pour la muscu ».
// ⚠️ Écrire « pense au temps de chargement » dans le prompt aurait été R8 exactement : un prompt
// ne compense pas une donnée absente. Milo n'avait AUCUN moyen de chiffrer. L'app, si :
// `sess.duration` mesure la durée réelle depuis toujours.
{
  const c16=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p16=await c16.newPage();
  await p16.goto('http://localhost:'+PORT+'/index.html'); await p16.waitForTimeout(2200);
  const r=await p16.evaluate(()=>{
   try{
    const mk=(dureeMin,nSets,cardio)=>({date:'2026-08-05',vol:3000,duration:dureeMin*60,
      cardioAvant:cardio?{type:'tapis',duration:cardio}:null,
      exs:[{name:'Squat à la Barre',sets:Array.from({length:nSets},()=>({kg:100,reps:5,done:true,type:'N'}))}]});
    S.sessions=[]; const vide=_rythmeSeance();
    S.sessions=[mk(60,18,8),mk(62,18,8),mk(58,17,8),mk(75,22,10),mk(55,16,5)];
    const plein=_rythmeSeance(); const txt=_ctxRythme();
    S.sessions=[mk(60,18,8),mk(62,18,8),mk(58,17,8),mk(600,5,0)];
    const aberrant=_rythmeSeance();
    // le bloc doit être dans la zone PERSONNELLE, jamais dans le commun (cache partagé)
    S.name='Michel'; S.bw=84; S.age=45; S.height=178; S.gender='H'; S.goal='muscle';
    S.sessions=[mk(60,18,8),mk(62,18,8),mk(58,17,8)];
    const ctx=buildCoachContext();
    const iP=ctx.indexOf('PROFIL ATHLÈTE:'), iR=ctx.indexOf('SON RYTHME RÉEL');
    return {vide, plein, aberrant, dansPersonnel:(iR>iP && iP>=0 && iR>=0),
            ditEstime:/ESTIM[ÉE]/.test(txt)===false, // ici il est mesuré
            aLArithmetique:/ARITHM[ÉE]TIQUE OBLIGATOIRE/.test(txt),
            compteEchauffement:/s[ée]ries d.ÉCHAUFFEMENT comptent/i.test(txt),
            ditLeCardio:/cardio d.[ée]chauffement . cardio de fin/i.test(txt)};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('\u2B50\u2B50 le rythme est MESURÉ sur ses vraies séances, pas supposé',
    r.plein && r.plein.mesure===true && r.plein.min>=2 && r.plein.min<=4,
    JSON.stringify(r.plein));
  t('\u2B50 sans historique, on donne quand même un chiffre — en DISANT que c est une estimation',
    r.vide && r.vide.mesure===false && r.vide.min>0, JSON.stringify(r.vide));
  t('\u2B50\u2B50 une séance aberrante (chrono oublié) est ÉCARTÉE, pas moyennée',
    r.aberrant && r.aberrant.n===3 && r.aberrant.min<5, JSON.stringify(r.aberrant));
  t('\u2B50 le calcul est IMPOSÉ à Milo, pas suggéré',
    r.aLArithmetique===true && r.compteEchauffement===true, JSON.stringify(r));
  t('\u2B50 … et le cardio est retiré du budget (c est le cœur du retour)',
    r.ditLeCardio===true, JSON.stringify(r));
  t('\u2B50\u2B50 le rythme est dans le bloc PERSONNEL (sinon le cache partagé meurt)',
    r.dansPersonnel===true, JSON.stringify(r));
  await c16.close();
}

// ═══ 🔵 LA COLONNE « PRÉCÉDENT » DIT LE TYPE DE LA SÉRIE (ft-v827) ═══════════════════════
// Retour de Michel, capture à l'appui : « là il n'y a rien de marqué, on ne sait pas si c'est de
// l'échauffement ou un exercice normal ». C'est le seul repère qu'on a EN SÉANCE pour savoir quoi
// charger — sans le type, « 5×70 » peut être une série de travail comme une mise en route.
// ⭐ L'information était DÉJÀ récupérée (`getPrev` rend les séries complètes) : c'est le rendu qui
// n'en gardait que reps×kg.
{
  const c17=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p17=await c17.newPage();
  await p17.goto('http://localhost:'+PORT+'/index.html'); await p17.waitForTimeout(2200);
  const r=await p17.evaluate(()=>{
   try{
    S.sessions=[{id:1,ts:1,date:'2026-08-10',volume:2610,duration:3600,
      exs:[{name:'Soulevé de Terre',sets:[
        {kg:70,reps:5,done:true,type:'É'},{kg:100,reps:3,done:true,type:'É'},
        {kg:130,reps:3,done:true,type:'N'},{kg:130,reps:3,done:true,type:'X'}]}]}];
    S.wkt={label:'Dos',start:Date.now(),exs:[{name:'Soulevé de Terre',sets:[
      {kg:0,reps:0,type:'É'},{kg:0,reps:0,type:'É'},{kg:0,reps:0,type:'N'},{kg:0,reps:0,type:'N'}]}]};
    _expandedEx=0; goScreen('s-log'); renderLog();
    const cells=[...document.querySelectorAll('.sprev')].map(e=>e.innerText.trim());
    return {cells,
            badgeVide:_prevTypeBadge({type:'N'}),
            badgeSansType:_prevTypeBadge({}),
            badgeEch:_prevTypeBadge({type:'É'}),
            badgeEchec:_prevTypeBadge({type:'X'})};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('\u2B50\u2B50 la colonne PRÉCÉDENT marque l échauffement (5×70 É)',
    Array.isArray(r.cells) && /5.70/.test(r.cells[0]||'') && /É/.test(r.cells[0]||''), JSON.stringify(r.cells));
  t('\u2B50 … et une série de TRAVAIL reste nue (pas de bruit sur le cas courant)',
    Array.isArray(r.cells) && /3.130/.test(r.cells[2]||'') && !/[ÉXWED]/.test(r.cells[2]||''), JSON.stringify(r.cells));
  t('\u2B50 l échec est marqué aussi, dans SA couleur',
    /var\(--red\)/.test(r.badgeEchec||'') && /var\(--blue\)/.test(r.badgeEch||''), JSON.stringify([r.badgeEch,r.badgeEchec]));
  t('une série sans type ne casse rien',
    r.badgeVide==='' && r.badgeSansType==='', JSON.stringify([r.badgeVide,r.badgeSansType]));
  await c17.close();
}

// ═══ ⏳ UNE QUESTION D'HIER NE BLOQUE PLUS LE RACCOURCI LOCAL (ft-v829) ═══════════════════
// Michel tape « salut ça va » le matin — et l'export API montre un VRAI appel à 0,16 $, alors que
// ft-v818 devait le traiter en local, sans réseau.
// LA CAUSE : `coachHistory` survit à la fermeture de l'app (`ft4_coach_hist`). La question posée
// par Milo la VEILLE au soir était donc toujours la dernière — et `_miloAttendUneReponse()` la
// prenait pour une question en attente.
// ⚠️ UNE MINUTERIE A ÉTÉ ESSAYÉE PUIS REJETÉE (elle a fait rougir le témoin « même merci repart
// chez lui ») : quelqu'un qui répond 40 min après une VRAIE question se serait fait renvoyer une
// formule toute faite. Ce qui compte n'est pas l'heure, c'est la SESSION.
{
  const c18=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p18=await c18.newPage();
  await p18.goto('http://localhost:'+PORT+'/index.html'); await p18.waitForTimeout(2200);
  const r=await p18.evaluate(()=>{
   try{
    // ① LE CAS RÉEL : conversation d'hier rechargée, la dernière réplique de Milo est une question
    coachHistory.length=0;
    coachHistory.push({role:'user',content:'ok'});
    coachHistory.push({role:'assistant',content:"Bien joué. On prépare lundi ?"});
    _histAuChargement = coachHistory.length;          // ce que fait `_loadCoachHist` à l'ouverture
    const hier = !!_reponseLocale('salut ca va',false,{});
    // ② MÊME SESSION : Milo vient de poser la question → on ne coupe pas
    coachHistory.push({role:'user',content:'salut'});
    coachHistory.push({role:'assistant',content:"Tu veux qu'on regarde ça ?"});
    const memeSession = !!_reponseLocale('merci',false,{});
    // ③ les pastilles à l'écran restent prioritaires
    const d=document.createElement('div'); d.className='coach-qr'; document.body.appendChild(d);
    const pastilles = !!_reponseLocale('salut ca va',false,{});
    d.remove();
    // ④ les 8 formes de salutation restent reconnues
    coachHistory.length=0; _histAuChargement=0;
    const formes=['salut ca va','salut ça va','salut ça va ?','Salut ca va','salut','ca va','coucou','bonjour']
      .map(m=>!!_reponseLocale(m,false,{}));
    return {hier,memeSession,pastilles,formes};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('\u2B50\u2B50 une question d HIER ne bloque plus « salut ça va » (le cas réel du 11/08)',
    r.hier===true, JSON.stringify(r));
  t('\u2B50\u2B50 … mais une question posée DANS LA SESSION bloque toujours (même 40 min après)',
    r.memeSession===false, JSON.stringify(r));
  t('\u2B50 les pastilles à l écran restent PRIORITAIRES',
    r.pastilles===false, JSON.stringify(r));
  t('les 8 formes de salutation restent reconnues',
    Array.isArray(r.formes) && r.formes.every(Boolean), JSON.stringify(r.formes));
  await c18.close();
}

// ═══ 😄 LES QUESTIONS SOCIALES POSÉES À MILO (ft-v830) ════════════════════════════════════
// Michel : « et genre hello ça va, tu as bien dormi, des questions à la con ». Elles partaient
// toutes au serveur à ~0,16 $ pièce pour une réponse que l'app peut donner elle-même.
// ⚠️ LE CRITÈRE EST LE PRONOM, et c'est lui qui rend la chose sûre : « TU as bien dormi ? » est
// une politesse adressée au logiciel et n'attend aucune information ; « J'AI mal dormi » est un
// FAIT sur la personne et doit toujours partir — c'est même le 1ᵉʳ des messages légitimes que le
// garde-fou de ft-v817 protège.
{
  const c19=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p19=await c19.newPage();
  await p19.goto('http://localhost:'+PORT+'/index.html'); await p19.waitForTimeout(2200);
  const r=await p19.evaluate(()=>{
   try{
    coachHistory.length=0; _histAuChargement=0;
    const L=m=>!!_reponseLocale(m,false,{});
    const SOCIAL=['hello ca va','tu as bien dormi',"t'as bien dormi ?",'bien dormi ?','ça roule',
      'ca roule ?','ça gaze','comment tu vas','comment vas-tu ?',"t'es là ?",'tout va bien ?','et toi ?'];
    // ⚠️ CES 12-LÀ DOIVENT TOUJOURS PARTIR — dont 4 pièges construits exprès :
    const LEGIT=["j'ai mal dormi cette nuit et je suis vraiment épuisé","j'ai mal dormi",
      'je suis stressé par le boulot en ce moment','je stagne depuis un mois et je ne comprends pas',
      'mon genou me lance depuis hier soir',"je me sens nul, j'ai envie de tout arrêter",
      'combien de protéines est-ce que je dois manger par jour ?',"je mange quoi avant d'y aller ?",
      "tu as bien dormi mais moi non, j'ai mal au dos",   // piège : commence comme une politesse
      'ça roule pour lundi 18h ?',                        // piège : « ça roule » + une vraie demande
      'comment tu vas construire mon programme ?',        // piège : « comment tu vas » + la suite
      'je pars en vacances pendant deux semaines'];
    return {social:SOCIAL.filter(m=>!L(m)), legit:LEGIT.filter(m=>L(m)),
            nSocial:SOCIAL.length, nLegit:LEGIT.length};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('\u2B50\u2B50 les 12 questions sociales sont traitées EN LOCAL (0 appel, 0 centime)',
    Array.isArray(r.social) && r.social.length===0, 'pas attrapées : '+JSON.stringify(r.social));
  t('\u2B50\u2B50 … et les 12 messages LÉGITIMES partent toujours chez Milo',
    Array.isArray(r.legit) && r.legit.length===0, 'coupées à tort : '+JSON.stringify(r.legit));
  await c19.close();
}

// ═══ 📣 LE VERDICT DE LA MONTÉE ARRIVE JUSQU'À MILO (ft-v823) ═══════════════════════════
// Le soir du 10/08, Milo débriefe la vraie séance de Michel : « la montée en charge était propre
// (70→100→115→130) ». L'app savait le contraire — `_monteeSuffisante` répond false sur EXACTEMENT
// ces chiffres. Le calcul existait depuis le matin, il n'atteignait simplement pas ce qu'on envoie
// à Milo (5ᵉ fois que R4 se répète : l'app SAIT, mais l'info reste dans le code).
{
  const c13=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p13=await c13.newPage();
  await p13.goto('http://localhost:'+PORT+'/index.html'); await p13.waitForTimeout(2200);
  const r=await p13.evaluate(()=>{
   try{
    const D=(d,exs)=>({date:d,vol:5000,exs:exs});
    const S1=(kg,reps,type)=>({kg:kg,reps:reps,done:true,type:type||'N'});
    // ① la séance RÉELLE du 10/08 : trou de 23 % entre 70 et 100, et 3 reps à 88 %
    const michel=D('2026-08-10',[{name:'Soulevé de Terre',sets:[
      S1(70,5,'É'),S1(100,3,'É'),S1(115,3,'É'),S1(130,3),S1(130,3),S1(130,3)]}]);
    // ② une montée PROPRE sur la même charge → aucune remarque attendue
    const propre=D('2026-08-09',[{name:'Squat à la Barre',sets:
      _monteeEnCharge(130).map(x=>S1(x.kg,x.reps,'É')).concat([S1(130,3),S1(130,3)])}]);
    // ③ AUCUN échauffement noté → on se TAIT (elle s'est peut-être échauffée sans le noter)
    const muet=D('2026-08-08',[{name:'Développé Couché',sets:[S1(100,5),S1(100,5)]}]);
    // ④ isolation lourde → hors périmètre (un curl n'a pas de montée en 4 paliers)
    const iso=D('2026-08-07',[{name:'Curl Barre',sets:[S1(30,10,'É'),S1(50,10),S1(50,10)]}]);
    const ctx=t=>{S.sessions=[t];return buildCoachContext();};
    // ⚠️ On ne garde QUE les lignes de séances : la consigne juste en dessous CITE le marqueur
    // (« quand une ligne porte ⚠️ montée en charge insuffisante… ») — une fenêtre trop large
    // le trouvait donc TOUJOURS, et les 3 témoins « on se tait » passaient au vert à tort.
    const bloc=t=>{const c=ctx(t);const i=c.indexOf('DERNIÈRES SÉANCES:');if(i<0)return '';
      const s=c.slice(i+18); const j=s.indexOf('\n→'); return j<0?s:s.slice(0,j);};
    return {
      michel: /montée en charge insuffisante/.test(bloc(michel)),
      michelDetail: (bloc(michel).match(/saut de \d+ % entre 70 et 100 kg/)||[''])[0],
      michelReps:   /3 reps à 115 kg/.test(bloc(michel)),
      propre: /montée en charge insuffisante/.test(bloc(propre)),
      muet:   /montée en charge insuffisante/.test(bloc(muet)),
      iso:    /montée en charge insuffisante/.test(bloc(iso)),
      // la consigne qui dit à Milo quoi en faire
      consigne: /MONTÉE EN CHARGE[\s\S]{0,400}JAMAIS écrire que la montée était propre/.test(ctx(michel))
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ LA SÉANCE RÉELLE DU 10/08 est signalée à Milo (il avait écrit « montée propre »)',
    r.michel===true, JSON.stringify(r));
  t('⭐ … et le DÉFAUT est nommé, pas juste signalé (« saut de 23 % entre 70 et 100 kg »)',
    r.michelDetail==='saut de 23 % entre 70 et 100 kg', 'reçu : '+JSON.stringify(r.michelDetail));
  t('⭐ … y compris les 3 reps à 88 % de la charge (c\'est déjà une série de travail)',
    r.michelReps===true, JSON.stringify(r));
  t('⭐ une montée PROPRE ne reçoit AUCUNE remarque (sinon Milo commente pour rien)',
    r.propre===false, JSON.stringify(r));
  t('⭐⭐ AUCUN échauffement noté → l\'app se TAIT (R29 : on ne juge que ce qu\'on voit)',
    r.muet===false, JSON.stringify(r));
  t('⭐ un mouvement d\'ISOLATION reste hors périmètre',
    r.iso===false, JSON.stringify(r));
  t('⭐ la consigne dit à Milo de ne JAMAIS écrire « montée propre » sur une ligne marquée',
    r.consigne===true, JSON.stringify(r));
  await c13.close();
}

// ═══ 🧠 LE BLOC PERSONNEL EST STABLE — la mémoire n'est plus dedans (ft-v819) ════════════
// L'explication qui manquait à ft-v816 : le pari du cache 1 h n'a pas échoué parce que « le
// bloc personnel change par nature », mais parce qu'UNE LIGNE dedans changeait — la mémoire de
// Milo, que l'app réécrit APRÈS CHAQUE MESSAGE. Un bloc caché se compare octet par octet :
// une ligne qui bouge et c'est tout le bloc qui est réécrit (1,25×) au lieu d'être relu (0,1×).
{
  const c11=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p11=await c11.newPage();
  await p11.goto('http://localhost:'+PORT+'/index.html'); await p11.waitForTimeout(2200);
  const r=await p11.evaluate(()=>{
   try{
    const MK="═══ SITUATION DE L'INSTANT ═══";
    const perso=t=>{const a=t.indexOf('PROFIL ATHLÈTE:'),b=t.indexOf(MK);return (a<0||b<0)?null:t.slice(a,b);};
    S.name='Michel'; S.bw=84; S.age=45; S.height=178; S.gender='H'; S.goal='muscle';
    S.sessions=[]; for(let i=0;i<12;i++)S.sessions.push({date:'2026-08-0'+((i%9)+1),vol:3200,
      exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]});
    if(typeof coachHistory!=='undefined'){coachHistory.length=0;
      coachHistory.push({role:'user',content:'a'},{role:'assistant',content:'b'},
                        {role:'user',content:'c'},{role:'assistant',content:'d'});}
    S.coachMemory="Michel vise la prise de muscle. Séance dos lundi.";
    const A=buildCoachContext('fais-moi une séance jambes');
    const B=buildCoachContext("j'ai mal dormi cette nuit");
    S.coachMemory="Michel vise la prise de muscle. Séance dos lundi. Il a demandé un point cardio.";
    const C=buildCoachContext('fais-moi une séance jambes');
    return {
      stableEntreSujets: perso(A)===perso(B),
      stableApresMemoire: perso(A)===perso(C),
      memoireHorsDuBloc: perso(A).indexOf('MÉMOIRE CONVERSATIONS')<0,
      // la mémoire ne doit plus être dans le contexte du tout : le serveur l'ajoute lui-même,
      // et l'avoir aux deux endroits la faisait lire DEUX FOIS par Milo (R2).
      memoireAbsenteDuContexte: A.indexOf('MÉMOIRE CONVERSATIONS')<0,
      tailleBloc: perso(A).length
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ CACHE : le bloc PERSONNEL ne bouge plus quand la mémoire de Milo est mise à jour',
    r.stableApresMemoire===true,
    'il change encore → il sera réécrit à chaque message au lieu d\'être relu 10× moins cher');
  t('⭐ CACHE : … et il ne dépend toujours pas du sujet du message',
    r.stableEntreSujets===true, JSON.stringify(r));
  t('⭐ la mémoire de Milo est SORTIE du bloc caché',
    r.memoireHorsDuBloc===true, JSON.stringify(r));
  t('⭐ … et elle n\'est plus EN DOUBLE (le serveur l\'ajoute, le contexte ne la porte plus)',
    r.memoireAbsenteDuContexte===true,
    'elle est encore dans buildCoachContext → Milo la lit deux fois');
  {
    const w = fs.readFileSync(path.join(ROOT,'worker.js'),'utf8');
    // ⚠️⚠️ LES RENVOIS DU PROMPT DOIVENT POINTER DANS LE BON SENS (trouvé le 10/08).
  // Le 08/08, en coupant le prompt en [commun][personnel] pour le mettre en cache, les
  // CONSIGNES sont passées AU-DESSUS des DONNÉES. Personne n'a relu les renvois : trois
  // d'entre eux disaient encore « ci-dessus » / « plus haut » alors que leur cible était
  // 131 lignes PLUS BAS — dont les deux règles anti-invention (« tout ce que tu affirmes sur
  // elle doit venir des données ci-dessus ») et la règle de sécurité sur les blessures.
  // *Une consigne qui envoie Milo chercher au mauvais endroit est une consigne affaiblie* —
  // c'est le miroir de R8 : un prompt qui cite une source introuvable.
  // Ce témoin vérifie la DIRECTION de chaque renvoi nommé, pour que ça ne repasse pas.
  {
    const rr = await (async()=>{
      const cxx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
      const pp=await cxx.newPage();
      await pp.goto('http://localhost:'+PORT+'/index.html'); await pp.waitForTimeout(2000);
      const out=await pp.evaluate(()=>{
        S.name='Michel';S.bw=84;S.age=45;S.height=178;S.gender='H';S.goal='muscle';
        S.healthProfile={injuries:[{zone:'epaule',side:'D'}]};   // pour que PROFIL SANTÉ existe
        S.sessions=[];for(let i=0;i<12;i++)S.sessions.push({date:'2026-08-0'+((i%9)+1),vol:3200,
          exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]});
        const L=buildCoachContext('fais-moi une séance jambes').split('\n');
        const ou=s=>L.findIndex(l=>l.indexOf(s)>=0);
        const CIBLES={'PROFIL ATHLÈTE':ou('PROFIL ATHLÈTE:'),'PROFIL SANTÉ':ou('⚠️ PROFIL SANTÉ'),
                      'CALENDRIER':ou('CALENDRIER'),'PERMISSIONS BORNÉES':ou('PERMISSIONS BORNÉES')};
        const faux=[];
        L.forEach((l,i)=>{
          const m=/(ci-dessus|plus haut|plus bas|ci-dessous)/i.exec(l); if(!m)return;
          const versLeHaut = /ci-dessus|plus haut/i.test(m[1]);
          const avant=l.slice(Math.max(0,m.index-90), m.index);
          for(const nom in CIBLES){
            const pos=CIBLES[nom]; if(pos<0)continue;
            // la cible est-elle NOMMÉE juste avant le renvoi ? ⚠️ « les données ci-dessus » ne
            // nomme rien : c'est pourtant LE cas qui a été trouvé le 10/08 (les deux règles
            // anti-invention). On le rattache donc explicitement au PROFIL ATHLÈTE.
            const nommee = avant.indexOf(nom)>=0
              || (nom==='PROFIL ATHLÈTE' && /\b(les|des) donn[ée]es\s*$/i.test(avant));
            if(!nommee)continue;
            if(pos===i)continue;                       // le renvoi et le titre sur la même ligne
            const ok = versLeHaut ? (pos<i) : (pos>i);
            if(!ok) faux.push(nom+' : « '+m[1]+' » ligne '+i+' mais la cible est ligne '+pos);
          }
        });
        return {faux, cibles:CIBLES};
      });
      await cxx.close(); return out;
    })();
    t('⭐⭐ PROMPT : tous les renvois « ci-dessus / plus bas » pointent dans le BON SENS',
      Array.isArray(rr.faux) && rr.faux.length===0,
      'renvois à l\'envers : '+JSON.stringify(rr.faux)+' · positions '+JSON.stringify(rr.cibles));
  }
  t('⭐⭐ SERVEUR : la mémoire est ajoutée au bloc NON caché, pas au bloc personnel',
      /slice\(_pi,\s*_mi\),\s*cache_control:\s*_TTL_PERSO/.test(w)
      && /slice\(_mi\)\s*\+\s*\(memory/.test(w),
      'la mémoire est revenue dans le bloc caché — elle le fera réécrire à chaque message');
  }
  await c11.close();
}

// ═══ MILO PROPOSE UNE SÉANCE ALORS QU'UNE SÉANCE EST DÉJÀ EN COURS (ft-v750) ═══
// Retour de Michel EN PLEINE SÉANCE : « je lui ai demandé de changer l'exercice, il me propose
// bien une nouvelle séance mais ça ne met pas à jour la séance actuelle ». Le bouton ne savait
// qu'AJOUTER — l'échange que Milo avait compris n'atteignait jamais la donnée (R4).
{
  const c7=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p7=await c7.newPage();
  await p7.goto('http://localhost:'+srv.address().port+'/index.html');
  await p7.waitForTimeout(2200);
  const r=await p7.evaluate(()=>{
   try{
    const o={};
    const propose={label:'Séance allégée',exs:[{name:'Développé Couché',sets:[{kg:60,reps:10}]},
                                                {name:'Rowing Barre (Tirage Horizontal)',sets:[{kg:50,reps:10}]}]};
    // ① AUCUNE séance en cours → ça démarre directement, sans rien demander
    S.wkt=null; _pendingMiloSessions=[propose];
    _startSessionFromMilo(0,null);
    o.demarreSeul = !!(S.wkt&&S.wkt.exs&&S.wkt.exs.length===2);
    o.pasDeQuestion = !document.getElementById('ov-milo-seance').classList.contains('open');
    // ② SÉANCE EN COURS → on ne touche à RIEN, on demande
    const t0=Date.now()-1800000;   // commencée il y a 30 minutes
    S.wkt={date:today(),progLabel:'Ma séance',startTs:t0,startHour:9,
           exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true},{kg:100,reps:5,done:true}]}]};
    _pendingMiloSessions=[propose];
    _startSessionFromMilo(0,null);
    o.demandeConfirmation = document.getElementById('ov-milo-seance').classList.contains('open');
    o.rienModifie = S.wkt.exs.length===1 && S.wkt.exs[0].name==='Squat à la Barre';
    o.avertit = /2 séries déjà validées/.test(document.getElementById('milo-seance-avert').textContent);
    o.etatLu = /1 exercice/.test(document.getElementById('milo-seance-etat').textContent);
    // ③ « Ajouter » → les exercices s'empilent, le chrono ne bouge pas
    _applyMiloSession('add');
    o.ajout = S.wkt.exs.length===3 && S.wkt.exs[0].name==='Squat à la Barre';
    o.chronoIntactAdd = S.wkt.startTs===t0;
    // ④ « Remplacer » → les exercices sont remplacés, MAIS le chrono est conservé
    S.wkt={date:today(),progLabel:'Ma séance',startTs:t0,startHour:9,
           exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true}]}]};
    _pendingMiloSessions=[propose]; _startSessionFromMilo(0,null);
    _applyMiloSession('replace');
    o.remplace = S.wkt.exs.length===2 && S.wkt.exs[0].name==='Développé Couché';
    o.chronoIntactRempl = S.wkt.startTs===t0;
    // ⑤ « Annuler » → rien ne bouge
    S.wkt={date:today(),progLabel:'Ma séance',startTs:t0,exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5}]}]};
    _pendingMiloSessions=[propose]; _startSessionFromMilo(0,null);
    closeMiloSeance();
    o.annuleSansRien = S.wkt.exs.length===1 && S.wkt.exs[0].name==='Squat à la Barre';
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ sans séance en cours, la séance de Milo démarre directement (0 régression)',
    r.demarreSeul===true && r.pasDeQuestion===true, JSON.stringify(r));
  t('⭐⭐ AVEC une séance en cours, Milo DEMANDE au lieu d\'ajouter en silence',
    r.demandeConfirmation===true && r.rienModifie===true, JSON.stringify(r));
  t('⭐ la question MONTRE ce qui est en jeu (exercices en cours, séries déjà validées)',
    r.etatLu===true && r.avertit===true, JSON.stringify(r));
  t('« Ajouter » empile les exercices', r.ajout===true, JSON.stringify(r));
  t('⭐ « Remplacer » remplace les exercices…', r.remplace===true, JSON.stringify(r));
  t('⭐⭐ … SANS remettre le chrono à zéro (on n\'a pas recommencé sa séance)',
    r.chronoIntactRempl===true && r.chronoIntactAdd===true, JSON.stringify(r));
  t('« Annuler » ne touche à rien', r.annuleSansRien===true, JSON.stringify(r));
  await c7.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// H. LA MÉMOIRE DE MILO — il ne doit PLUS croire qu'il ne voit qu'une semaine
// Bug du 03/08 (capture de Michel) : « Je vois tes séances sur les 5 dernières… donc environ
// une semaine en arrière. » Or la mémoire longue lui donne TOUT le parcours depuis l'inscription.
// Cause : deux sources qui se contredisent — juste sous la liste, le prompt affirmait « ces
// séances sont les SEULES réellement FAITES ». Il croit toujours la plus restrictive.
// ⚠️ Et la même phrase disait « si aucune séance n'est listée pour un jour, c'était un REPOS » :
// au-delà de la fenêtre, Milo déclarait donc en repos des jours d'entraînement.
console.log('\n═══ H. La mémoire de Milo — la fenêtre étroite ne doit plus passer pour tout l\'historique ═══');
{
  const c8=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p8=await c8.newPage();
  await p8.goto('http://localhost:'+srv.address().port+'/index.html');
  await p8.waitForTimeout(2200);
  const r=await p8.evaluate(()=>{
   try{
    const o={};
    // 24 séances étalées du 17 juin au 3 août — bien au-delà de la fenêtre de détail
    const sess=[]; const d0=new Date('2026-06-17T12:00:00');
    for(let i=0;i<40;i++){
      const d=new Date(d0.getTime()+i*2*86400000);
      if(d>new Date('2026-08-03T12:00:00'))break;
      sess.push({date:d.toISOString().slice(0,10),volume:5000,
        exs:[{name:'Squat',sets:[{kg:100+i,reps:5,done:true,type:'N'}]}]});
    }
    sess.reverse(); S.sessions=sess; o.nb=sess.length;
    const ctx=buildCoachContext();
    o.plusDeSeules = !/sont les seules réellement FAITES/.test(ctx);
    o.ditLeTotal   = new RegExp('a fait '+sess.length+' séances au total').test(ctx);
    o.interditUneSemaine = /Ne dis JAMAIS que tu ne vois qu'une semaine/.test(ctx);
    o.reposBorne  = /ne conclus JAMAIS « repos » pour un jour PLUS ANCIEN/.test(ctx);
    o.memoireLongue = /MÉMOIRE LONGUE/.test(ctx);
    // le repos reste affirmable DANS la fenêtre (on n'a pas cassé le correctif du 30/07)
    o.reposDansFenetre = /COMPRIS DANS LA PÉRIODE ci-dessus.{0,80}REPOS/s.test(ctx);
    // TÉMOIN : avec moins de séances que la fenêtre, on n'annonce pas un total trompeur
    S.sessions=sess.slice(0,3);
    // ⚠️ viser NOTRE phrase et pas « X séances au total » tout court : la mémoire longue
    // emploie les mêmes mots, le témoin rougissait sur elle (attrapé le 03/08).
    o.peuDeSeances = !/a fait \d+ séances au total/.test(buildCoachContext());
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ la phrase « ces séances sont les SEULES faites » a disparu du contexte',
    r.plusDeSeules===true, JSON.stringify(r));
  t('⭐ Milo reçoit le NOMBRE TOTAL de séances, pas seulement les 5 détaillées',
    r.ditLeTotal===true, JSON.stringify(r));
  t('⭐ il lui est explicitement interdit de dire « je ne vois qu\'une semaine »',
    r.interditUneSemaine===true, JSON.stringify(r));
  t('⭐⭐ il ne peut plus conclure « repos » pour un jour hors de la fenêtre',
    r.reposBorne===true, JSON.stringify(r));
  t('… mais le repos reste affirmable DANS la fenêtre (correctif du 30/07 intact)',
    r.reposDansFenetre===true, JSON.stringify(r));
  t('la mémoire longue est bien là, à côté (les 2 sources ne se contredisent plus)',
    r.memoireLongue===true, JSON.stringify(r));
  t('TÉMOIN : avec 3 séances seulement, aucun « X séances au total » trompeur',
    r.peuDeSeances===true, JSON.stringify(r));
  await c8.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// I. LA PROGRESSION NE DOIT PLUS BASCULER SUR UNE SEULE SÉANCE
// Retour de Michel, 03/08, capture à l'appui : « je trouve ça super vache et hyper démotivant ».
// La 1ʳᵉ version comparait la TOUTE PREMIÈRE séance à la TOUTE DERNIÈRE. Mesuré : pour une même
// progression réelle de 100 → 123 kg sur 24 séances, le verdict passait de +23 % à −20 % selon
// que la dernière séance était allégée. Milo en construisait ensuite un DIAGNOSTIC.
console.log('\n═══ I. La progression de la mémoire longue — tendance, pas bruit (R12) ═══');
{
  const c9=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p9=await c9.newPage();
  await p9.goto('http://localhost:'+srv.address().port+'/index.html');
  await p9.waitForTimeout(2200);
  const r=await p9.evaluate(()=>{
   try{
    const pose=(deload,nb)=>{
      const sess=[]; const d0=new Date('2026-06-01T12:00:00');
      for(let i=0;i<nb;i++){
        const d=new Date(d0.getTime()+i*2*86400000);
        let kg=100+i;                       // progression réelle, régulière
        if(deload&&i===nb-1)kg=80;          // dernière séance allégée
        sess.push({date:d.toISOString().slice(0,10),volume:5000,
          exs:[{name:'Squat',sets:[{kg,reps:5,done:true,type:'N'}]}]});
      }
      sess.reverse(); S.sessions=sess;
      const m=_memoireLongue(), x=m.match(/Squat : ([^\n]+)/);
      return {ligne:x?x[1]:'', pct:(()=>{const y=/([+-]\d+) %/.exec(x?x[1]:'');return y?+y[1]:null;})(), bloc:m};
    };
    const o={};
    const normal=pose(false,24), deload=pose(true,24);
    o.pctNormal=normal.pct; o.pctDeload=deload.pct;
    o.ecart=(normal.pct!=null&&deload.pct!=null)?Math.abs(normal.pct-deload.pct):null;
    o.resteMontant = deload.pct!=null && deload.pct>0;   // une vraie progression reste une progression
    // moins de 5 passages : aucun pourcentage annoncé (on ne commente pas du bruit)
    const court=pose(false,4);
    o.pasDePctSiPeu = !/Squat :/.test(court.bloc);
    // les libellés qui empêchent de confondre avec le RECORD, et le garde-fou anti-diagnostic
    o.ditHabituel = /niveau de travail HABITUEL/.test(normal.bloc);
    o.ditPasLeRecord = /ce n'est PAS son record/.test(normal.bloc);
    o.antiDiagnostic = /ne conclus JAMAIS à une régression sans un autre signe/.test(normal.bloc);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ une séance allégée ne renverse plus le verdict (écart ≤ 3 points)',
    r.ecart!=null && r.ecart<=3, JSON.stringify(r));
  t('⭐⭐ … et une vraie progression reste annoncée comme une progression',
    r.resteMontant===true, JSON.stringify(r));
  t('⭐ moins de 5 passages sur un exercice → aucun pourcentage (R12 : pas de bruit)',
    r.pasDePctSiPeu===true, JSON.stringify(r));
  t('⭐ le chiffre est nommé « niveau de travail habituel »…', r.ditHabituel===true, JSON.stringify(r));
  t('… et explicitement distingué du RECORD (Milo donnait les 2 dans la même réponse)',
    r.ditPasLeRecord===true, JSON.stringify(r));
  t('⭐ interdiction d\'ériger une baisse en diagnostic (c\'est ce qui démotive)',
    r.antiDiagnostic===true, JSON.stringify(r));
  await c9.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// J. L'ÉTAGE DU MILIEU — le détail au-delà des 5 dernières séances (michdu75 + christophe)
// Michel, 03/08 : « oui tu peux élargir à moi et Christophe ». Milo avait le DÉTAIL sur ~1 semaine
// et un RÉSUMÉ du parcours, avec un trou entre les deux : impossible de répondre « le 15 juillet
// tu as fait squat 110×5 ». ⚠️ Le budget du prompt est le grand chantier ouvert — donc on mesure.
console.log('\n═══ J. L\'étage du milieu — les séances plus anciennes, en une ligne chacune ═══');
{
  const c10=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p10=await c10.newPage();
  await p10.goto('http://localhost:'+srv.address().port+'/index.html');
  await p10.waitForTimeout(2200);
  const r=await p10.evaluate(()=>{
   try{
    const j=d=>{const x=new Date();x.setDate(x.getDate()-d);return new Date(x.getTime()-x.getTimezoneOffset()*6e4).toISOString().slice(0,10);};
    const sess=[];
    for(let i=0;i<120;i++){                       // 8 mois d'historique, compte bien rempli
      sess.push({date:j(i*2),volume:5200,exs:[
        {name:'Squat à la Barre',sets:[{kg:60,reps:8,done:true,type:'É'},{kg:110,reps:5,done:true,type:'N'}]},
        {name:'Développé Couché',sets:[{kg:85,reps:6,done:true,type:'N'}]},
        {name:'Rowing Barre',sets:[{kg:70,reps:10,done:true,type:'N'}]},
        {name:'Curl Biceps Haltères',sets:[{kg:14,reps:12,done:true,type:'N'}]}]});
    }
    S.sessions=sess;
    const o={};
    S.email='quelquun@exemple.com';
    const sans=buildCoachContext(); o.tailleSans=sans.length;
    o.absentPourLesAutres=!/SÉANCES PLUS ANCIENNES/.test(sans);
    S.email='michdu75@gmail.com';
    const avec=buildCoachContext(); o.tailleAvec=avec.length;
    o.presentPourMichel=/SÉANCES PLUS ANCIENNES/.test(avec);
    o.surcoutPct=Math.round(100*(avec.length-sans.length)/sans.length);
    const i=avec.indexOf('📖 SES SÉANCES PLUS ANCIENNES');
    const blocSeul=avec.slice(i, avec.indexOf('\n\n',i));     // ⚠️ borné au bloc : un témoin
    o.nbLignes=(blocSeul.match(/\n  · /g)||[]).length;        // qui déborde mesure autre chose
    o.pasDechauffement=!/60×8/.test(blocSeul);                // (attrapé en le mesurant, 03/08)
    o.aUneDate=/\n  · \d\d\/\d\d /.test(blocSeul);
    o.antiInvention=/ne l'invente pas/.test(blocSeul);
    // ⚠️ pas de doublon avec les 5 séances DÉTAILLÉES juste après (R2)
    const j5=avec.indexOf('DERNIÈRES SÉANCES:');
    const dates5=(avec.slice(j5,j5+900).match(/\d{4}-(\d\d)-(\d\d)/g)||[]).map(d=>d.slice(8)+'/'+d.slice(5,7));
    o.aucunDoublon=dates5.every(d=>!blocSeul.includes('\n  · '+d+' '));
    S.email='christophe@famillelanglois.fr';
    o.presentPourChristophe=/SÉANCES PLUS ANCIENNES/.test(buildCoachContext());
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ Milo reçoit une ligne par séance au-delà des 5 détaillées', r.presentPourMichel===true, JSON.stringify(r));
  t('⭐ … et Christophe l\'a aussi', r.presentPourChristophe===true, JSON.stringify(r));
  t('⭐ TÉMOIN : personne d\'autre ne l\'a (réservé, le temps de mesurer)',
    r.absentPourLesAutres===true, JSON.stringify(r));
  t('⭐⭐ le surcoût reste sous 8 % du contexte (le budget du prompt est un chantier ouvert)',
    r.surcoutPct!=null && r.surcoutPct<=8, 'surcoût +'+r.surcoutPct+' %');
  t('borné : 30 lignes au plus, même avec 120 séances', r.nbLignes>0 && r.nbLignes<=30, JSON.stringify(r));
  t('⭐ les séries d\'ÉCHAUFFEMENT sont exclues (on donne la vraie charge de travail)',
    r.pasDechauffement===true, JSON.stringify(r));
  t('chaque ligne porte sa date (c\'est tout l\'intérêt : « le 15 juillet »)', r.aUneDate===true, JSON.stringify(r));
  t('⭐ aucune séance en double avec les 5 détaillées (R2)', r.aucunDoublon===true, JSON.stringify(r));
  t('interdiction d\'inventer le détail des séries qu\'il n\'a pas', r.antiInvention===true, JSON.stringify(r));
  await c10.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// K. CRÉER SON PROPRE EXERCICE — la liste des groupes doit être COMPLÈTE
// Idée de Christophe (04/08) : « il manque lombaires ». Vérifié : il en manquait TROIS —
// Lombaires (12 exercices au catalogue), Full Body (18) et Avant-bras (5). Un groupe existait
// donc dans l'app sans qu'on puisse le choisir en créant son exercice.
console.log('\n═══ K. Créer son exercice — tous les groupes du catalogue doivent être proposés ═══');
{
  const c11=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p11=await c11.newPage();
  await p11.goto('http://localhost:'+srv.address().port+'/index.html');
  await p11.waitForTimeout(2200);
  const r=await p11.evaluate(()=>{
   try{
    const o={};
    const sel=document.getElementById('custom-ex-grp');
    const opts=[...sel.options].map(x=>x.value);
    const cat=[...new Set((EXLIB||[]).map(e=>e.g))];
    o.manquants=cat.filter(g=>!opts.includes(g));
    o.nbOptions=opts.length; o.nbGroupes=cat.length;
    o.lombaires=opts.includes('Lombaires');
    // ⚠️ le bug silencieux : un groupe hors liste est refusé sans erreur, et la sauvegarde
    // écrivait alors le groupe affiché → l'exercice changeait de groupe tout seul.
    S.customExercises=[{n:'Mon Exo Exotique',g:'Groupe Inconnu',muscles:{p:[],s:[]}}];
    openEditCustomEx('Mon Exo Exotique');
    o.grpConserve=document.getElementById('custom-ex-grp').value;
    o.pasReclasse=(o.grpConserve==='Groupe Inconnu');
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ tous les groupes du catalogue sont proposés à la création (idée Christophe)',
    Array.isArray(r.manquants) && r.manquants.length===0, 'manquants : '+JSON.stringify(r.manquants));
  t('⭐ « Lombaires » est bien là — c\'est ce qu\'il cherchait', r.lombaires===true, JSON.stringify(r));
  t('⭐⭐ modifier un exercice ne le RECLASSE plus en silence (groupe hors liste)',
    r.pasReclasse===true, 'groupe après ouverture : '+r.grpConserve);
  await c11.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// L. LES ANNONCES AUX UTILISATEURS (règle d'or #11) — une annonce invisible ne prévient personne
// Trouvé le 04/08 en livrant les annonces du chantier figurine : 2 points rouges portaient
// screen:'menu', valeur comparée NULLE PART → jamais affichés depuis leur écriture.
console.log('\n═══ L. Les annonces aux utilisateurs — aucune ne doit être invisible ═══');
{
  const c12=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p12=await c12.newPage();
  await p12.goto('http://localhost:'+srv.address().port+'/index.html');
  await p12.waitForTimeout(2200);
  const r=await p12.evaluate(()=>{
   try{
    const o={};
    const VALIDES=['home','progress','log','nutrition','coach','setup'];
    o.ecransInconnus=[...new Set(NEW_FEATURES.map(f=>f.screen))].filter(s=>!VALIDES.includes(s));
    const ids=NEW_FEATURES.map(f=>f.id);
    o.idsEnDouble=ids.filter((x,i)=>ids.indexOf(x)!==i);
    o.sansDesc=NEW_FEATURES.filter(f=>!f.desc||!f.desc.trim()).map(f=>f.id);
    const vs=WHATS_NEW.map(w=>w.v);
    o.versionsEnDouble=vs.filter((x,i)=>vs.indexOf(x)!==i);
    // R25 : la pop-up ANNONCE (court), l'aide EXPLIQUE. 600 caractères ≈ le pavé.
    // ⚠️ R25 (« la pop-up ANNONCE, l'aide EXPLIQUE ») a été adoptée à ft-v632, le 28/07 — donc
    // APRÈS l'écriture des annonces v1→v48. On applique la règle aux nouvelles, on ne réécrit
    // pas en douce des textes déjà validés et déjà lus par les utilisateurs.
    // Mesuré le 04/08 : 19 entrées anciennes dépassent 420 caractères, dont une (v38) 639.
    // C'est un ménage à faire avec Michel, pas une correction de nuit.
    o.popupsTropLongues=WHATS_NEW.filter(w=>w.v>=49&&(w.d||'').length>600).map(w=>w.v);
    o.legacyLongues=WHATS_NEW.filter(w=>w.v<49&&(w.d||'').length>420).length;
    o.toutesOntTitre=WHATS_NEW.every(w=>w.t&&w.ic);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ aucun point rouge ne vise un écran inexistant (il ne s\'afficherait jamais)',
    Array.isArray(r.ecransInconnus) && r.ecransInconnus.length===0, 'inconnus : '+JSON.stringify(r.ecransInconnus));
  t('aucun identifiant de point rouge en double', Array.isArray(r.idsEnDouble)&&r.idsEnDouble.length===0, JSON.stringify(r.idsEnDouble));
  t('aucun point rouge sans texte', Array.isArray(r.sansDesc)&&r.sansDesc.length===0, JSON.stringify(r.sansDesc));
  t('aucune version « Quoi de neuf » en double', Array.isArray(r.versionsEnDouble)&&r.versionsEnDouble.length===0, JSON.stringify(r.versionsEnDouble));
  t('⭐ R25 : les NOUVELLES pop-ups annoncent sans expliquer (≤ 600 caractères)',
    Array.isArray(r.popupsTropLongues)&&r.popupsTropLongues.length===0, 'trop longues : '+JSON.stringify(r.popupsTropLongues));
  t('CONSTAT (pas un échec) : 19 annonces d\'avant la règle R25 restent longues',
    r.legacyLongues===19, 'mesuré : '+r.legacyLongues+' — si ce nombre BAISSE, mets-le à jour ; s\'il MONTE, une nouvelle est passée par la mauvaise porte');
  t('chaque « Quoi de neuf » a son titre et son icône', r.toutesOntTitre===true, JSON.stringify(r));
  await c12.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// M. QUI A PROTÉGÉ SON COMPTE — la carte Admin née de la faille du 04/08
// `loadProfile` sert un compte ENTIER quand la personne n'a pas de code perso. Il fallait
// pouvoir savoir QUI est protégé — sans ouvrir les Script Properties (qui affichent aussi
// ANTHROPIC_API_KEY en clair) et sans lire la moindre donnée personnelle.
console.log('\n═══ M. Admin : qui a protégé son compte (aucune donnée personnelle lue) ═══');
{
  const c13=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p13=await c13.newPage();
  await p13.goto('http://localhost:'+srv.address().port+'/index.html');
  await p13.waitForTimeout(2200);
  const r=await p13.evaluate(async()=>{
   try{
    const o={};
    o.carte=!!document.getElementById('admin-auth-list');
    // ① réservé à l'admin
    window._isAdminUnlocked=()=>false;
    await loadAuthStatusAdmin();
    o.refuseSansAdmin=/Réservé à l/.test(document.getElementById('admin-auth-list').innerHTML);
    // ② trois cas : protégé · ouvert · injoignable
    window._isAdminUnlocked=()=>true;
    const rep={'christophe@famillelanglois.fr':{status:'ok',hasCode:true},
               'elineazs32@gmail.com':{status:'ok',hasCode:false}};
    window._protectPost=async(pl)=>{ if(pl.email==='emma.david16@gmail.com') throw new Error('réseau');
                                     return rep[pl.email]||{status:'ok',hasCode:false}; };
    await loadAuthStatusAdmin();
    const h=document.getElementById('admin-auth-list').innerHTML;
    o.protege=/christophe[\s\S]{0,240}protégé/.test(h);
    o.ouvert=/elineazs32[\s\S]{0,240}OUVERT/.test(h);
    // ⚠️ le point qui compte : une PANNE ne doit pas s'afficher comme « protégé » NI comme
    // « ouvert » — on agirait sur du faux dans les deux sens.
    o.pannePasConfondue=/emma\.david16[\s\S]{0,240}non vérifié/.test(h);
    // 3 ouverts dans ce scénario : eline + tanna + michdu75 (le cas par défaut du simulateur)
    o.compteLesOuverts=/3 comptes sans code/.test(h);
    // ⚠️ le résumé doit AUSSI annoncer les non vérifiés — « 1 sans code » à côté de 4 inconnus
    // laisse croire que le reste est protégé (capture Michel, 04/08).
    o.diteLesInconnus=/1 non vérifié/.test(h) && /On ne sait pas/.test(h);
    // 2 essais avant de déclarer « non vérifié » : un échec transitoire ne doit pas trancher
    let n=0; window._protectPost=async(pl)=>{ n++; if(n===1) throw new Error('transitoire');
                                              return {status:'ok',hasCode:true}; };
    await loadAuthStatusAdmin();
    o.reessaie=!/non vérifié/.test(document.getElementById('admin-auth-list').innerHTML);
    o.aucuneDonneePerso=!/kg|séance|poids|bilan/i.test(h);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ la carte « qui a protégé son compte » existe dans l\'Admin', r.carte===true, JSON.stringify(r));
  t('⭐ elle est refusée sans déverrouillage admin', r.refuseSansAdmin===true, JSON.stringify(r));
  t('un compte AVEC code est marqué protégé', r.protege===true, JSON.stringify(r));
  t('⭐ un compte SANS code est marqué OUVERT', r.ouvert===true, JSON.stringify(r));
  t('⭐⭐ une panne réseau n\'est confondue NI avec protégé NI avec ouvert',
    r.pannePasConfondue===true, JSON.stringify(r));
  t('le nombre de comptes ouverts est annoncé', r.compteLesOuverts===true, JSON.stringify(r));
  t('⭐ AUCUNE donnée personnelle n\'est lue ni affichée (authStatus ne renvoie que hasCode)',
    r.aucuneDonneePerso===true, JSON.stringify(r));
  t('⭐⭐ le résumé annonce AUSSI les non vérifiés (sinon on croit le reste protégé)',
    r.diteLesInconnus===true, JSON.stringify(r));
  t('⭐ un échec transitoire ne fait pas conclure « non vérifié » (2 essais)',
    r.reessaie===true, JSON.stringify(r));
  await c13.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// N. VERROU SANTÉ — protéger son compte est OBLIGATOIRE pour une donnée de santé
// Décision de Michel, 04/08 : « à partir du moment qu'une personne veut mettre dans
// l'application une donnée santé, il doit protéger son compte obligatoirement ».
console.log('\n═══ N. Verrou santé — pas de bilan sanguin ni corporel sur un compte ouvert ═══');
{
  const c14=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p14=await c14.newPage();
  await p14.goto('http://localhost:'+srv.address().port+'/index.html');
  await p14.waitForTimeout(2200);
  const r=await p14.evaluate(async()=>{
   try{
    const o={}; const ouv=()=>document.getElementById('ov-health-lock').classList.contains('open');
    S.email='test@exemple.com'; S.bodyScans=[]; S.bloodTests=[{date:'2026-07-01',markers:[]}];
    localStorage.removeItem('ft4_hascode');
    // ① compte SANS code → les 3 portes sont fermées
    window._protectPost=async()=>({status:'ok',hasCode:false});
    await openBodyScanForm(-1);
    o.bloqueBodyScan=ouv() && !document.getElementById('ov-bodyscan-form').classList.contains('open');
    o.expliquePourquoi=/code d.accès/.test(document.getElementById('health-lock-txt').textContent);
    closeHealthLock();
    await openBloodTest(0);   o.bloqueBilan=ouv();  closeHealthLock();
    await openBloodImport();  o.bloqueImport=ouv(); closeHealthLock();
    // ② ⚠️ réseau en panne → on bloque AUSSI (un verrou qui s'ouvre quand il ne sait pas n'en
    //    est pas un), mais le message est différent et le bouton « protéger » est masqué.
    window._protectPost=async()=>{throw new Error('réseau');};
    await openBodyScanForm(-1);
    o.bloqueSiPanne=ouv();
    o.messageDePanne=/pas de réseau/.test(document.getElementById('health-lock-txt').textContent);
    o.pasDeBoutonSiPanne=document.getElementById('health-lock-btn').style.display==='none';
    closeHealthLock();
    // ③ compte AVEC code → ça passe, et c'est mémorisé (l'app reste utilisable hors ligne)
    window._protectPost=async()=>({status:'ok',hasCode:true});
    await openBodyScanForm(-1);
    o.passeAvecCode=!ouv() && document.getElementById('ov-bodyscan-form').classList.contains('open');
    closeBodyScanForm();
    let appels=0; window._protectPost=async()=>{appels++;return {status:'ok',hasCode:true};};
    await openBodyScanForm(-1); o.plusAucunAppel=(appels===0);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ compte SANS code : le bilan corporel ne s\'ouvre pas', r.bloqueBodyScan===true, JSON.stringify(r));
  t('⭐ … le bilan sanguin non plus (consultation)', r.bloqueBilan===true, JSON.stringify(r));
  t('⭐ … ni son import', r.bloqueImport===true, JSON.stringify(r));
  t('on explique POURQUOI, on ne bloque pas en silence (R24)', r.expliquePourquoi===true, JSON.stringify(r));
  t('⭐⭐ réseau en panne : on bloque AUSSI (un verrou qui s\'ouvre dans le doute n\'en est pas un)',
    r.bloqueSiPanne===true, JSON.stringify(r));
  t('⭐ … mais avec un message de panne, sans proposer de poser un code',
    r.messageDePanne===true && r.pasDeBoutonSiPanne===true, JSON.stringify(r));
  t('⭐ compte AVEC code : rien ne change, ça s\'ouvre', r.passeAvecCode===true, JSON.stringify(r));
  t('⭐ une fois vérifié, plus aucun appel réseau (utilisable hors ligne, règle d\'or #4)',
    r.plusAucunAppel===true, JSON.stringify(r));
  await c14.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// O. LE JOURNAL D'ERREURS NE DOIT PAS SE REMPLIR DE BRUIT ATTENDU
// Capture de Michel (04/08) : « Script …/sw.js load failed » répété à 14:22, 15:08 et la veille
// à 18:06 — le rythme des re-vérifications du service worker (5 min + retour sur l'app + retour
// réseau). Aucun de ces appels n'avait de `catch` : chaque échec réseau finissait dans le
// journal. Une vérification qui n'aboutit pas hors réseau est le fonctionnement NORMAL d'une
// app local-first (règle d'or #4) — le dégât n'est pas l'erreur, c'est le bruit qui masque les
// vraies pannes.
console.log('\n═══ O. Service worker — un échec de mise à jour ne doit pas polluer le journal ═══');
{
  const c15=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p15=await c15.newPage();
  await p15.goto('http://localhost:'+srv.address().port+'/index.html');
  await p15.waitForTimeout(2200);
  // ⚠️ CE TEST LIT LE CODE RÉELLEMENT SERVI, pas une copie. Première version écrite le 04/08 :
  // elle rejouait le helper recopié dans le test → le contrôle négatif donnait 0 rouge, donc
  // le test ne testait rien. *Un test qui contient sa propre copie du code teste sa copie.*
  const srcApp=await p15.evaluate(async()=>{ const r=await fetch('app.js'); return await r.text(); });
  const r=await p15.evaluate(async()=>{
   try{
    const o={};
    const nb=()=>(JSON.parse(localStorage.getItem('ft4_errlog')||'[]')).length;
    const av2=nb();
    if(typeof _logErr==='function')_logErr({m:'erreur de contrôle',f:'',l:0});
    o.vraieErreurJournalisee=(nb()>av2);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  // ① l'enregistrement du service worker doit avoir son .catch
  const zone=srcApp.slice(srcApp.indexOf("serviceWorker.register('./sw.js'"), srcApp.indexOf("serviceWorker.register('./sw.js'")+1400);
  t('⭐⭐ l\'enregistrement du service worker a un .catch (sinon l\'échec part dans le journal)',
    /\}\)\.catch\(/.test(zone), 'extrait : '+zone.slice(0,80));
  // ② plus aucun `reg.update()` nu — ils passent tous par le helper qui avale l'échec
  // ⚠️ on retire d'abord la ligne du helper : SON `reg.update()` est celui qui est rattrapé,
  // c'est le seul légitime. Première version de l'assertion : elle le comptait aussi et rougissait
  // à tort. *Quand un test rougit, la 1ʳᵉ question reste « qui a tort, le code ou le test ? »*
  const sansHelper=srcApp.split('\n').filter(l=>!/const _swMaj=/.test(l)).join('\n');
  const nus=(sansHelper.match(/(?<![_\w])reg\.update\(\)/g)||[]).length;
  t('⭐⭐ aucun reg.update() nu hors du helper (tous avalent leur échec)',
    nus===0, nus+' appel(s) nu(s) restant(s)');
  t('le helper _swMaj existe et rattrape la promesse',
    /const _swMaj=reg=>\{[^}]*p\.catch\(\(\)=>\{\}\)/.test(srcApp.replace(/\n/g,' ')), '');
  t('TÉMOIN : une vraie erreur est toujours journalisée (on n\'a pas rendu le journal aveugle)',
    r.vraieErreurJournalisee===true, JSON.stringify(r));
  await c15.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// P. LA SÉANCE DE MILO LUE DANS LE TEXTE — pour que ça marche sur TOUS les modèles
// Retour de Michel (04/08) : sa FILLE demande une séance à Milo, Milo la lui écrit très
// bien, et le bouton « Commencer cette séance » n'apparaît pas. Cause : le bouton dépend
// d'un bloc JSON caché que seul un modèle capable produit fidèlement — lui est sur Opus,
// elle sur Haiku. C'est R9 (le modèle est une variable structurelle) et R7 (le prompt est
// le dernier levier). La réponse : lire la séance dans le TEXTE VISIBLE.
console.log('\n═══ P. La séance de Milo lue dans le texte (tous modèles) ═══');
{
  const c16=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const p16=await c16.newPage();
  await p16.goto('http://localhost:'+srv.address().port+'/index.html');
  await p16.waitForTimeout(2200);
  const r=await p16.evaluate(()=>{
   try{
    const o={};
    const rep="Voici ta séance du jour : Haut du corps\n\n- Développé Couché 4×8 @ 60 kg\n"
      +"- Rowing Barre 4x10\n- Élévations Latérales 3 séries de 12\n- Curl Biceps Haltères 3×12\n\nBonne séance !";
    const a=_extractDaySession(rep);
    o.trouve=!!a; o.viaTexte=!!(a&&a.fromText); o.nb=a?a.sess.exs.length:0;
    o.noms=a?a.sess.exs.map(e=>e.name).join('|'):'';
    // ⚠️ ADAPTÉ le 10/08 : la séance reçoit désormais sa MONTÉE EN CHARGE (ft-v822), donc
    // `sets` contient les paliers d'échauffement PUIS les séries de travail. Ce qu'on veut
    // vérifier ici n'a pas changé — que le TEXTE a bien été lu — donc on compte les séries de
    // TRAVAIL, et on vérifie séparément que la montée a bien été ajoutée. (R30 : on adapte le
    // témoin à la nouvelle réalité, on ne le supprime pas.)
    const _trav=a?a.sess.exs[0].sets.filter(x=>x.type!=='É'&&x.type!=='W'):[];
    o.series=_trav.length; o.kg=_trav.length?_trav[0].kg:null;
    o.monteeAjoutee=!!(a&&a.sess.exs[0]._montee);
    o.monteeAvantTravail=!!(a&&a.sess.exs[0].sets[0]&&a.sess.exs[0].sets[0].type==='É');
    // un mouvement d'isolation de la même séance ne doit RIEN recevoir
    o.isoIntacte=!!(a&&a.sess.exs[3]&&!a.sess.exs[3]._montee);
    // ⚠️ AUCUNE SUBSTITUTION : mesuré le 04/08, le rapprochement « par mots » changeait
    // « Curl Biceps Haltères » en « Curl Barre ». On travaillerait sur un autre exercice.
    o.pasDeSubstitution=/Curl Biceps Haltères/.test(o.noms)&&!/Curl Barre/.test(o.noms);
    // TÉMOINS : ne rien proposer quand il n'y a pas de séance
    o.bavardage=!_extractDaySession("Salut ! Comment tu te sens ? On peut parler de ton sommeil.");
    o.uneLigne=!_extractDaySession("Tu peux faire du Développé Couché 4×8 aujourd'hui.");
    // un nom hors catalogue est GARDÉ tel quel, jamais remplacé
    const inc=_extractDaySession("- Machin Truc 4×8\n- Bidule Chose 3×10");
    o.gardeLeNom=!!(inc&&inc.sess.exs[0].name==='Machin Truc');
    // le bloc caché reste prioritaire quand il est là (0 régression)
    const j=_extractDaySession('Voilà.\n```json\n{"seance":{"label":"Test","exs":[{"name":"Squat à la Barre","sets":[{"reps":5,"kg":100,"type":"N"}]}]}}\n```');
    o.jsonPrioritaire=!!(j&&!j.fromText&&j.sess.label==='Test');
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐⭐ une séance écrite en TEXTE par Milo est reconnue (le cas de la fille de Michel)',
    r.trouve===true && r.viaTexte===true && r.nb===4, JSON.stringify(r));
  t('⭐⭐ aucun exercice n\'est remplacé par un autre (« Curl Biceps Haltères » reste lui-même)',
    r.pasDeSubstitution===true, r.noms);
  t('les séries de TRAVAIL et la charge sont lues (4 séries, 60 kg)',
    r.series===4&&r.kg===60, JSON.stringify(r));
  t('⭐⭐ … et la MONTÉE EN CHARGE a été ajoutée devant (60 kg sur un développé = gros mouvement)',
    r.monteeAjoutee===true && r.monteeAvantTravail===true, JSON.stringify(r));
  t('⭐ … sans toucher au Curl Biceps de la même séance (isolation)',
    r.isoIntacte===true, JSON.stringify(r));
  t('TÉMOIN : une simple conversation ne propose aucune séance', r.bavardage===true, JSON.stringify(r));
  t('TÉMOIN : une seule ligne ne fait pas une séance', r.uneLigne===true, JSON.stringify(r));
  t('⭐ un exercice hors catalogue garde SON nom, il n\'est pas inventé', r.gardeLeNom===true, JSON.stringify(r));
  t('⭐ 0 RÉGRESSION : le bloc caché reste prioritaire quand Milo le fournit',
    r.jsonPrioritaire===true, JSON.stringify(r));
  await c16.close();
}

// ═══ P. Le compteur d'appels IA est branché sur le chemin RÉEL ═══
// Le garde-fou de coût (600/jour) vivait dans Apps Script, où plus AUCUN appel IA ne passe
// depuis la migration 4G du 13/07 : il n'a rien protégé pendant trois semaines, en silence.
// Ces témoins figent le rebranchement — et surtout la DÉRIVE qui l'avait causé (deux listes
// d'actions qui s'éloignent l'une de l'autre sans que rien ne le signale).
console.log('\n═══ P. Compteur IA — branché là où passent vraiment les appels ═══');
{
  const w  = fs.readFileSync(path.join(ROOT,'worker.js'),'utf8');
  const cs = fs.readFileSync(path.join(ROOT,'constants.js'),'utf8');
  const cj = fs.readFileSync(path.join(ROOT,'Code.js'),'utf8');
  const lst = s => new Set((s.match(/'([a-zA-Z]+)'/g)||[]).map(x=>x.slice(1,-1)));
  const proxy   = lst((cs.match(/AI_PROXY_ACTIONS\s*=\s*\[([^\]]*)\]/)||[,''])[1]);
  const comptees= lst((w.match(/_ACTIONS_IA\s*=\s*new Set\(\[([\s\S]*?)\]\)/)||[,''])[1]);
  const manquantes = [...proxy].filter(a=>!comptees.has(a));

  t('⭐⭐ TOUTE action IA qui part vers le Worker y est comptée (la dérive du 13/07 ne peut plus revenir)',
    proxy.size===13 && manquantes.length===0, 'non comptées : '+(manquantes.join(', ')||'aucune'));
  t('⭐ le comptage ne retarde JAMAIS la réponse de Milo (waitUntil, règle d\'or #4)',
    /ctx\.waitUntil\(\s*_compterIA\(/.test(w), 'waitUntil absent');
  t('⭐⭐ REPLI OUVERT : une panne du compteur ne coupe pas Milo (règle d\'or #3)',
    /catch\(e\)\{[^}]*repli ouvert/.test(w), 'le catch de _compterIA ne dit pas son intention');
  t('le refus se lit sans appel réseau (zéro latence ajoutée)',
    /if\s*\(_plafondAtteint\(\)\)/.test(w), '_plafondAtteint non consulté avant l\'appel');
  // ⚠️ TÉMOIN RETOURNÉ le 11/08 (R30), pas supprimé : le secret ne vit plus dans une Script
  // Property mais sous forme d'EMPREINTE en dur dans Code.js. Raison : Michel s'en méfie
  // (« sur Google rien n'est enregistré ») — son expérience porte sur `PREMIUM_EMAILS`,
  // réécrite par un déclencheur fantôme, d'où déjà `PREMIUM_HARDCODED_`. Même motif ici.
  // Ce que le témoin protège n'a PAS changé : le blocage ne doit jamais pouvoir être
  // déclenché par n'importe qui, alors que l'URL Apps Script est publique.
  t('⭐⭐ le plafond reste DÉSARMÉ tant que le bon secret n\'est pas présenté',
    /_sha256hex_\(_recu\) === _HASH_COUNT/.test(cj) && /blocked: _arme && _q2\.blocked/.test(cj),
    'le blocage pourrait être déclenché par n\'importe qui — l\'URL Apps Script est publique');
  t('⭐ l\'empreinte est en dur dans le code, hors d\'atteinte d\'un déclencheur fantôme',
    /_HASH_COUNT = '[0-9a-f]{64}'/.test(cj), 'empreinte absente ou mal formée');
  t('⭐⭐ l\'état du plafond est MÉMORISÉ pour être affichable (sinon on ne peut pas le vérifier)',
    /AI_CAP_SEEN/.test(cj) && /capArmed:/.test(cj), 'l\'état armé/désarmé n\'est exposé nulle part');
  t('le compteur réutilise `ai_quota` (celui que lit déjà le panneau Admin), pas un second compteur',
    /action === 'aiCount'/.test(cj) && /_aiQuotaBlock_\(body\.email\)/.test(cj), 'route aiCount absente');
}

// ═══ Q. Le bloc COMMUN doit rester partageable entre TOUS les utilisateurs ═══
// C'est la promesse de ft-v782 : les ~37 000 premiers caractères du contexte sont censés être
// IDENTIQUES pour tout le monde, donc mis en cache UNE fois et relus par tous — 2,8× moins cher
// à l'échelle (mesuré le 08/08 : 10,2 centimes le message sans, 3,7 avec).
//
// ⚠️ POURQUOI CE TÉMOIN EXISTE : ajouter au-dessus de « PROFIL ATHLÈTE: » la moindre ligne qui
// dépend de la personne (prénom, sexe, objectif, niveau…) fait exploser le bloc commun en autant
// d'entrées de cache qu'il y a d'utilisateurs. Ça ne casse RIEN, ça ne lève aucune erreur, Milo
// répond pareil — seule la facture monte, en silence. C'est exactement la famille de bugs de la
// semaine du 04/08 (sauvegarde morte 36 jours, garde-fou branché sur un chemin mort).
// Vérifié le 08/08 : 2 empreintes seulement (admin / non-admin), la 2ᵉ partagée par 3 profils
// opposés (homme 42 / femme 30 / homme 28, objectifs différents).
console.log('\n═══ Q. Le bloc commun de Milo reste partagé par tous ═══');
{
  const empreinte = async (seed) => {
    const cx = await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
    const pg = await cx.newPage();
    await pg.addInitScript(seedScript(seed));
    await pg.goto('http://localhost:'+PORT+'/index.html');
    await pg.waitForTimeout(2200);
    const r = await pg.evaluate(()=>{
      if(typeof buildCoachContext!=='function') return {err:'buildCoachContext absent'};
      const ctx = buildCoachContext('je fais quoi comme séance ?');
      const i = ctx.indexOf('PROFIL ATHLÈTE:');
      return i<1000 ? {err:'marqueur PROFIL ATHLÈTE introuvable'} : {commun: ctx.slice(0,i)};
    });
    await cx.close();
    return r;
  };
  // Trois profils volontairement opposés, aucun admin.
  const a = await empreinte({ft4_name:'Christophe',ft4_gender:'H',ft4_age:'42',ft4_bw:'80',ft4_goal:'muscle',   ft4_email:'a@test.z'});
  const b2= await empreinte({ft4_name:'Tatiana',   ft4_gender:'F',ft4_age:'30',ft4_bw:'60',ft4_goal:'perte',    ft4_email:'b@test.z'});
  const c3= await empreinte({ft4_name:'Paul',      ft4_gender:'H',ft4_age:'28',ft4_bw:'75',ft4_goal:'',         ft4_email:'c@test.z'});

  const err = a.err||b2.err||c3.err;
  t('le contexte de Milo se construit et porte son repère « PROFIL ATHLÈTE: »', !err, err||'');
  if(!err){
    t('⭐⭐ le bloc commun est IDENTIQUE pour 3 profils opposés (sinon le cache partagé meurt en silence)',
      a.commun===b2.commun && b2.commun===c3.commun,
      'tailles : '+[a,b2,c3].map(x=>x.commun.length).join(' / ')+' — une donnée personnelle est remontée au-dessus du repère');
    // Garde-fou de taille : le bloc commun est le gros morceau, il ne doit pas dériver sans qu'on le voie.
    // ⚠️ SEUIL RELEVÉ 45 000 → 46 500 le 12/08/2026, DÉLIBÉRÉMENT et pour une seule raison :
    // la spécification du superset (~970 caractères) est entrée dans le bloc SÉANCE. Le garde-fou
    // a fait exactement son travail — il a refusé la livraison et m'a obligé à regarder. J'ai
    // d'abord compressé la spec (1 806 → 970) et retiré du prompt les définitions que Milo connaît
    // déjà (R20 : une règle entre, une règle sort), puis constaté que le reste était utile.
    // ⚠️ Ce bloc est MIS EN CACHE (1 h) et facturé au dixième : sa taille coûte peu, mais elle
    // dilue les règles entre elles, et c'est ÇA le vrai prix (R20 encore). À 45 651 aujourd'hui,
    // il mérite une relecture dédiée — pas un relèvement de seuil de plus.
    t('le bloc commun garde une taille raisonnable (< 46 500 caractères)',
      a.commun.length < 46500, a.commun.length+' caractères');
    // Aucun prénom de test ne doit apparaître dans la partie censée être commune.
    t('⭐ aucun prénom ne fuit dans le bloc commun',
      !/Christophe|Tatiana|Paul/.test(a.commun+b2.commun+c3.commun),
      'un prénom a été trouvé au-dessus de « PROFIL ATHLÈTE: »');
  }

  // ⏰ LE BLOC COMMUN NE DOIT PAS DÉPENDRE DE L'HEURE (trouvé le 08/08 via une remarque de GPT).
  // Le témoin ci-dessus compare 3 personnes AU MÊME INSTANT — il ne verrait pas une horloge
  // glissée au-dessus du repère. Or le cache vit 5 minutes : un bloc qui change à l'HEURE casse
  // le cache à CHAQUE message (la régression la plus chère possible), alors qu'un bloc qui change
  // une fois par JOUR — comme le calendrier, qui existe pour ft-v658/660 — ne coûte rien.
  // Donc : les seules différences autorisées entre deux heures sont des lignes de DATE.
  {
    const cx = await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
    const pg = await cx.newPage();
    await pg.addInitScript(seedScript({ft4_name:'Alex',ft4_gender:'H',ft4_email:'d@test.z'}));
    await pg.goto('http://localhost:'+PORT+'/index.html');
    await pg.waitForTimeout(2200);
    const r = await pg.evaluate(()=>{
      const tete = () => { const c = buildCoachContext('je fais quoi ?'); return c.slice(0, c.indexOf('PROFIL ATHLÈTE:')); };
      const avant = tete();
      const RD = Date, delta = 3*3600*1000;          // +3 h, même journée dans la grande majorité des cas
      function FD(...a){ return a.length ? new RD(...a) : new RD(RD.now()+delta); }
      FD.now = () => RD.now()+delta; FD.parse = RD.parse; FD.UTC = RD.UTC; FD.prototype = RD.prototype;
      let apres;
      try { window.Date = FD; apres = tete(); } finally { window.Date = RD; }
      if(avant===apres) return {ecarts:[]};
      const A = avant.split('\n'), B = apres.split('\n'), sB = new Set(B);
      return {ecarts: A.filter(l => !sB.has(l) && l.trim()).slice(0,5)};
    });
    await cx.close();
    // Une ligne de date (calendrier) a le droit de changer ; tout le reste, non.
    const estDate = l => /20\d\d-\d\d-\d\d|hier|AUJOURD'HUI|demain|après-demain/i.test(l);
    const fautifs = r.ecarts.filter(l => !estDate(l));
    t('⭐⭐ le bloc commun ne dépend pas de l\'HEURE (sinon le cache saute à chaque message)',
      fautifs.length===0, fautifs.map(l=>l.trim().slice(0,90)).join(' ⏐ '));
  }

  // ⏳ Les DEUX durées de cache, dans le bon sens (08/08). Le bloc commun — partagé par tous et
  // stable toute la journée — est en 1 h ; le bloc personnel reste en 5 min, son écriture étant
  // bon marché. Inverser les deux coûterait plus cher sans rien apporter, et ne se verrait NULLE
  // PART : mêmes réponses, aucun test rouge, seule la facture change. D'où ce témoin.
  {
    const w = fs.readFileSync(path.join(ROOT,'worker.js'),'utf8');
    t('⭐ le bloc COMMUN de Milo est mis en cache 1 h (le pari du 08/08)',
      /_TTL_COMMUN\s*=\s*\{\s*type:\s*'ephemeral',\s*ttl:\s*'1h'\s*\}/.test(w)
      && /slice\(0,\s*_pi\),\s*cache_control:\s*_TTL_COMMUN/.test(w),
      'le bloc commun n\'est plus en 1 h — si c\'est voulu, mettre à jour ce témoin et le journal');
    // ⏱️ RETOURNÉ DEUX FOIS, ET C'EST LA MESURE QUI TRANCHE (R30 — on retourne, on ne supprime pas).
    //   08/08 → 5 min (état d'origine)
    //   09/08 matin → 1 h (pari : « les 5 min expirent pendant qu'on LIT la réponse »)
    //   09/08 soir → RETOUR à 5 min. Conversation comparable : avant 0,12-0,17 $, après **0,43 $**.
    //     L'écriture 5 min est bien tombée à 0 — mais l'écriture 1 h a pris **0,29 $** à elle seule.
    // ⚠️ LA RÈGLE APPRISE : allonger un cache ne sert QUE si le contenu est stable. Le bloc commun
    // l'est (0 réécriture mesurée sur 3 conversations) ; le bloc PERSONNEL change d'un message à
    // l'autre — un TTL long n'évite alors aucune réécriture, il les rend 1,6× plus chères (2 vs 1,25).
    t('⭐⭐ le bloc PERSONNEL est en 5 min (le pari 1 h a été MESURÉ et PERDU le 09/08)',
      /_TTL_PERSO\s*=\s*\{\s*type:\s*'ephemeral'\s*\}/.test(w)
      && !/_TTL_PERSO\s*=\s*\{[^}]*ttl:/.test(w)
      && /slice\(_pi,\s*_mi\)[\s\S]{0,200}?cache_control:\s*_TTL_PERSO/.test(w),
      'le bloc personnel est repassé en 1 h — ça a été essayé le 09/08 et ça a coûté 2,5× plus cher');
    t('la raison du retour en arrière est ÉCRITE dans worker.js (sinon on le refera)',
      /PARI PERDU/.test(w) && /0,43/.test(w),
      'sans la mesure écrite à côté du code, quelqu\'un retentera le 1 h dans six mois');
  }
}

// ── « REMPLACER MA SÉANCE » PRÉVIENT AVANT, PAS APRÈS (bug vécu par Michel, 08/08) ──────
// En pleine séance, il demande à Milo de remplacer un exercice. La modale lui propose
// « Ajouter » ou « Remplacer », il choisit Remplacer — et perd tout ce qu'il avait fait.
// ⚠️ L'avertissement EXISTAIT depuis le début. Il était écrit SOUS les deux boutons : on ne
// peut pas le lire après avoir tapé, la modale est déjà fermée. Et il ne s'affichait QUE si
// au moins une série était validée — alors que « Remplacer » retire les exercices dans tous
// les cas. Règle d'or #3 (zéro perte de séance) : la perte reste possible, elle doit être ANNONCÉE.
{
  const av=await p.evaluate(()=>{
   try{
    S.wkt={date:'2026-08-08',progLabel:'Test',startTs:Date.now(),exs:[
      {name:'Développé Couché',sets:[{kg:80,reps:8,done:true},{kg:80,reps:8,done:true}]},
      {name:'Rowing Barre (Tirage Horizontal)',sets:[{kg:60,reps:10,done:false}]}]};
    _pendingMiloSessions=[{label:'Séance de Milo',exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5}]}]}];
    _askMiloSeanceMode(1);
    const m=document.getElementById('ov-milo-seance');
    const html=m.innerHTML;
    const iAv=html.indexOf('id="milo-seance-avert"'), iBtn=html.indexOf("_applyMiloSession('add')");
    const o={avertAvantBoutons:iAv>=0&&iBtn>=0&&iAv<iBtn,
             texte:(document.getElementById('milo-seance-avert')||{}).textContent||'',
             astuce:(document.getElementById('milo-seance-astuce')||{}).textContent||''};
    // même question, mais AUCUNE série validée : l'ancien code ne disait plus rien du tout
    S.wkt.exs.forEach(e=>e.sets.forEach(s=>s.done=false));
    _askMiloSeanceMode(1);
    o.texteSansValidee=(document.getElementById('milo-seance-avert')||{}).textContent||'';
    closeMiloSeance(); S.wkt=null;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(av.erreur) console.log('     ⚠️  bloc « remplacer » en ERREUR : '+av.erreur);
  t('⭐⭐ l\'avertissement est AU-DESSUS des boutons (il était en dessous : illisible avant de décider)',
    !av.erreur && av.avertAvantBoutons,
    av.erreur?'—':'position avert/boutons incorrecte');
  t('⭐ il annonce les séries validées qui seront effacées',
    !av.erreur && /2 séries déjà validées/.test(av.texte), av.erreur?'—':av.texte);
  t('⭐⭐ … et il prévient MÊME sans série validée (les exercices partent quand même)',
    !av.erreur && /retire tes 2 exercices/.test(av.texteSansValidee), av.erreur?'—':av.texteSansValidee);
  t('⭐ la modale rappelle qu\'on peut changer UN exercice sans rien perdre',
    !av.erreur && /Remplacer l'exercice/.test(av.astuce), av.erreur?'—':av.astuce);
}

// ── UNE DISCUSSION ROUVERTE NE PART PLUS EN TRAVERS (bug Michel, 08/08) ────────────────
// « Quand je reprends une archive de Milo l'image va dans tous les sens » — capture à l'appui :
// les bulles coupées à GAUCHE. Deux causes empilées : ① `.msg-bubble` bornait la BULLE
// (max-width:86%) mais pas son CONTENU — une barre « ═══ » écrite par Milo la traversait ;
// ② `.coach-messages` n'avait qu'`overflow-y:scroll`, ce qui met l'axe horizontal en `auto`
// tout seul → le fil devenait GLISSABLE de côté, avec le geste même qui sert à changer d'écran.
{
  const ov=await p.evaluate(()=>{
   try{
    goScreen('coach',document.getElementById('nb-coach'));
    coachHistory=[];
    S.coachConversations=[{id:'t-ovf',ts:Date.now()-86400000,messages:[
      {role:'user',content:"Je fais quoi aujourd'hui ?"},
      {role:'assistant',content:'Réponse.\n\n═══════════════════════════════════════ SÉANCE ═══\n\nhyperextensionlombairemachineinclineeavecmaintiendescuisses'}]}];
    loadCoachConv('t-ovf');
    const m=document.getElementById('coach-msgs');
    const u=m.querySelector('.msg-user'), r=u?u.getBoundingClientRect():null;
    return {axeH:getComputedStyle(m).overflowX, debord:m.scrollWidth-m.clientWidth,
            gauche:r?Math.round(r.left):null, coupee:r?r.left<0:null};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(ov.erreur) console.log('     ⚠️  bloc « archive » en ERREUR : '+ov.erreur);
  t('⭐⭐ une discussion rouverte ne déborde plus sur les côtés (barre « ═══ » + mot très long)',
    !ov.erreur && ov.debord===0, ov.erreur?'—':(ov.debord+' px de débordement'));
  t('⭐ le fil de discussion ne peut PLUS être glissé à l\'horizontale',
    !ov.erreur && ov.axeH==='hidden',
    ov.erreur?'—':('overflow-x = '+ov.axeH+" — `overflow-y:scroll` seul remet l'axe horizontal en auto"));
  t('la bulle de l\'utilisateur reste entièrement visible (elle était coupée à gauche)',
    !ov.erreur && ov.coupee===false, ov.erreur?'—':('bord gauche à '+ov.gauche+' px'));
}

// ── LA GRANDE DÉMO NE ROGNE PLUS LA FIGURINE (retour Michel, 09/08) ────────────────────
// « Dommage problème de cadrage » — sur le Jefferson Curl, la TÊTE était coupée. Ce n'était
// pas l'image (son dessin s'arrête à 8 px du bord) mais la boîte : width:100% + max-height:240
// donne ~340×240 (rapport 1,42) alors que la médiane des figurines est 1,00. Avec `cover`, une
// image carrée perdait 30 % de sa hauteur — mesuré : 269 des 294 figurines (91 %) rognées.
// Une démonstration qui coupe le mouvement rate exactement ce pour quoi elle existe.
{
  const cad=await p.evaluate(()=>{
   try{
    document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));
    const ob=document.getElementById('onboarding'); if(ob)ob.style.display='none';
    S.wkt={date:today(),progLabel:'T',startTs:Date.now(),startHour:0,
      exs:[{name:'Jefferson Curl',sets:[{kg:0,reps:5,done:false,type:'N'}]}]};
    _expandedEx=0; goScreen('log',document.getElementById('nb-log')); renderLog();
    toggleExGif(0,'Jefferson Curl');
    const im=document.querySelector('#ex-gif-0 img');
    if(!im) return {erreur:"pas d'image dans le panneau"};
    const cs=getComputedStyle(im);
    // la VIGNETTE, elle, doit rester en `cover` : sur un carré, une image carrée n'y perd rien
    const v=document.querySelector('.ex-head img, .exb-head img')||
            [...document.querySelectorAll('#s-log img')].find(x=>x.clientWidth<=60&&x.clientWidth>0);
    return {grande:cs.objectFit, fond:cs.backgroundColor,
            vignette:v?getComputedStyle(v).objectFit:null};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(cad.erreur) console.log('     ⚠️  bloc « cadrage » en ERREUR : '+cad.erreur);
  t('⭐⭐ la grande démo affiche la figurine ENTIÈRE (elle en rognait 30 % en hauteur)',
    !cad.erreur && cad.grande==='contain',
    cad.erreur?'—':('object-fit = '+cad.grande+" — `cover` recoupe 91 % des figurines"));
  t('⭐ … sur fond blanc, pour que les bandes du « contain » se confondent avec l\'image',
    !cad.erreur && /255,\s*255,\s*255/.test(cad.fond||''), cad.erreur?'—':String(cad.fond));
  t('la petite vignette garde « cover » (un carré dans un carré ne perd rien)',
    !cad.erreur && (cad.vignette===null || cad.vignette==='cover'),
    cad.erreur?'—':String(cad.vignette));
}

// ── L'ACCUEIL DU COACH N'EST PLUS INATTEIGNABLE (retour Michel, 09/08) ─────────────────
// « J'ai découvert ça en archivant ma conversation. Quand je discute avec Milo je ne le vois
// pas. » L'accueil du Coach ne s'affiche que si `coachHistory.length===0` (coach.js:1284), et
// l'historique est SAUVEGARDÉ → après la toute première discussion il ne revient jamais, sauf
// à archiver. Le questionnaire et l'analyse morpho n'avaient pas d'autre entrée : elles
// devenaient donc invisibles pour toujours (R23). Deux pastilles d'ACTION les ramènent dans la
// barre déjà visible pendant le chat.
{
  const ch=await p.evaluate(()=>{
   try{
    document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));
    const ob=document.getElementById('onboarding'); if(ob)ob.style.display='none';
    S.premium=true;
    coachHistory=[{role:'user',content:'salut'},{role:'assistant',content:'Salut !'}];
    goScreen('coach',document.getElementById('nb-coach'));
    if(typeof updateCoachHeader==='function')updateCoachHeader();
    const home=document.getElementById('coach-home'), suggs=document.getElementById('coach-suggs');
    const act=[...suggs.querySelectorAll('.sugg-chip-act')];
    const o={accueilCache:getComputedStyle(home).display==='none',
             barreVisible:getComputedStyle(suggs).display!=='none',
             n:act.length, libelles:act.map(e=>e.textContent.trim()),
             // la couleur SÉPARE action et question : sans ça on tape en croyant écrire à Milo
             distinctes: act.length? getComputedStyle(act[0]).color
                         !== getComputedStyle(suggs.querySelector('.sugg-chip:not(.sugg-chip-act)')).color : false};
    // et elles OUVRENT vraiment quelque chose
    act[0].click(); o.ouvre1=[...document.querySelectorAll('.overlay.open')].some(x=>x.id==='ov-coach-quiz');
    document.querySelectorAll('.overlay.open').forEach(x=>x.classList.remove('open'));
    act[1].click(); o.ouvre2=[...document.querySelectorAll('.overlay.open')].some(x=>x.id==='ov-morpho-analysis');
    document.querySelectorAll('.overlay.open').forEach(x=>x.classList.remove('open'));
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(ch.erreur) console.log('     ⚠️  bloc « pastilles Coach » en ERREUR : '+ch.erreur);
  t('⭐⭐ pendant une conversation, le questionnaire et la morpho restent ATTEIGNABLES',
    !ch.erreur && ch.accueilCache && ch.barreVisible && ch.n===2,
    ch.erreur?'—':('accueil caché='+ch.accueilCache+' · pastilles d\'action='+ch.n+' '+JSON.stringify(ch.libelles)
    +'\n         → sans elles, ces deux écrans disparaissent dès la 1ʳᵉ discussion et ne reviennent qu\'en ARCHIVANT.'));
  t('⭐ … et elles ouvrent vraiment leur écran (pas un message envoyé à Milo)',
    !ch.erreur && ch.ouvre1 && ch.ouvre2,
    ch.erreur?'—':('questionnaire='+ch.ouvre1+' · morpho='+ch.ouvre2));
  t('une pastille d\'ACTION ne se confond pas avec une pastille de QUESTION (couleur)',
    !ch.erreur && ch.distinctes, ch.erreur?'—':'même couleur que les questions');
}

// ── « GAGNER EN FORCE (BIG 3) » SUIT LA DISCIPLINE (retour Michel, 09/08) ──────────────
// « L'appli était pour la force athlétique au départ, mais plus vraiment maintenant. » Cette
// carte demande un programme de COMPÉTITION périodisé sur Squat/DC/SDT — elle s'affichait à
// tout le monde, y compris en bodybuilding ou fitness. ⚠️ Le témoin fige AUSSI le cas
// « discipline non renseignée » → VISIBLE : cacher à tort ce que quelqu'un cherchait coûte
// plus cher que de le montrer à qui l'ignorera (R29).
{
  const di=await p.evaluate(()=>{
   try{
    document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));
    const ob=document.getElementById('onboarding'); if(ob)ob.style.display='none';
    const o={};
    ['','muscu','bodybuilding','powerbuilding','powerlifting','haltero'].forEach(d=>{
      S.discipline=d; coachHistory=[];
      goScreen('coach',document.getElementById('nb-coach'));
      if(typeof updateCoachHeader==='function')updateCoachHeader();
      const f=document.getElementById('coach-action-force');
      o[d||'vide']= !!f && getComputedStyle(f).display!=='none';
    });
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(di.erreur) console.log('     ⚠️  bloc « discipline » en ERREUR : '+di.erreur);
  t('⭐⭐ le programme de FORCE ne s\'affiche plus en musculation / bodybuilding',
    !di.erreur && di.muscu===false && di.bodybuilding===false,
    di.erreur?'—':('muscu='+di.muscu+' · bodybuilding='+di.bodybuilding));
  t('⭐ … et il reste pour force athlétique, powerbuilding et haltérophilie',
    !di.erreur && di.powerlifting && di.powerbuilding && di.haltero,
    di.erreur?'—':JSON.stringify(di));
  t('⭐ discipline NON renseignée → on affiche quand même (on ne cache pas à l\'aveugle)',
    !di.erreur && di.vide===true, di.erreur?'—':('vide='+di.vide));
}

// ═════════════════════════════════════════════════════════════════════════════
// U. LES EXERCICES UNILATÉRAUX (11/08/2026) — 48 exercices tranchés un par un par Michel.
// Le critère est de lui : « met uni vu que ça doit être fait de l'autre côté aussi ».
// ⚠️ CE QUE CES TÉMOINS PROTÈGENT VRAIMENT, ce n'est pas le doublement du volume : c'est
// le fait qu'il ne s'applique QUE là où il faut. Les 9 « faux amis » (Marteau, Seal Row,
// machines iso-latérales…) verraient leurs charges doublées à tort, et 4 des 9 venaient
// de MES paris — corrigés par Michel ou par le dessin animé de la figurine (R28).
// ⚠️⚠️ Et le témoin qui compte le plus est celui de l'HISTORIQUE : avant la bascule, un
// unilatéral était noté EN TOTAL (le curl de Michel à 60 = 2 × 30). Doubler ce volume-là
// le rendrait QUADRUPLE. Michel a dit « laisse pour l'instant » — donc le passé ne bouge
// pas, et rien ne doit le faire bouger en douce.
console.log('\n═══ U. Unilatéral — 3 séries saisies, 6 réellement faites ═══');
{
  const cu=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pu=await cu.newPage(); const eu=[]; pu.on('pageerror',e=>eu.push(e.message));
  await pu.addInitScript(seedScript({}));
  await pu.goto('http://localhost:'+PORT+'/index.html');
  await pu.waitForTimeout(2200);
  const U=await pu.evaluate(async()=>{
   try{
    const o={};
    // ── La classification elle-même
    o.nbUni=Object.keys(EX_UNI).length;
    o.rowing=estUnilateral('Rowing Haltère (Tirage Horizontal)');
    o.bulgare=estUnilateral('Squat Bulgare');
    o.curl=estUnilateral('Curl Haltères');
    // les 9 FAUX AMIS — aucun ne doit être unilatéral
    o.fauxAmis=['Curl Zottman','Marteau','Extension Triceps Arrière (Kickback)','Leg Curl Haltère',
      'Seal Row','Rowing Landmine (T-Bar)','Presse à Cuisses Iso-Latérale',
      'Tirage Iso-Latéral Hammer Strength','Élévations Mollets Penché (Donkey Calf Raise)']
      .filter(n=>estUnilateral(n));
    // un exercice inconnu ne double JAMAIS un volume au hasard (R29)
    o.inconnu=estUnilateral('Mon Exercice Perso À Moi');
    // les libellés
    o.lblBras=uniLabel('Rowing Haltère (Tirage Horizontal)');
    o.lblJambe=uniLabel('Squat Bulgare');
    o.lblCote=uniLabel('Soulevé de Terre Valise (Suitcase)');   // 2 jambes poussent → « par côté »
    o.lblVide=uniLabel('Développé Couché');
    // un nom ANCIEN garde son marqueur (la clé est l'identifiant, pas le nom)
    o.viaAlias=estUnilateral('Rowing Haltère');

    // ── Le volume : 3 séries saisies, 6 réellement faites
    S.sessions=[]; S.prs={};
    startWorkout();
    S.wkt.exs.push({name:'Rowing Haltère (Tirage Horizontal)',sets:[
      {kg:28,reps:8,done:true,type:'N'},{kg:28,reps:8,done:true,type:'N'},{kg:28,reps:8,done:true,type:'N'}]});
    S.wkt.exs.push({name:'Développé Couché',sets:[{kg:100,reps:5,done:true,type:'N'}]});
    await finishWorkout();
    const s=S.sessions[0];
    o.volume=s.volume;                       // (28×8×3)×2 + 100×5 = 1344 + 500 = 1844
    o.attendu=28*8*3*2+100*5;
    o.marque=s.uniConv===1;
    // le RECORD reste calculé sur la charge d'UN côté (28), jamais sur 56
    o.pr=S.prs['Rowing Haltère (Tirage Horizontal)'];
    o.prAttendu=bz(28,8);

    // ── L'HISTORIQUE D'AVANT ne bouge pas : même séance, sans le marqueur
    o.volAncien=_workVol({exs:[{name:'Rowing Haltère (Tirage Horizontal)',
      sets:[{kg:28,reps:8,done:true,type:'N'},{kg:28,reps:8,done:true,type:'N'},{kg:28,reps:8,done:true,type:'N'}]}]});
    o.volAncienAttendu=28*8*3;               // PAS doublé

    // ── Ce qui atteint Milo (R4 : l'info doit descendre jusqu'à la DONNÉE)
    const ctx=buildCoachContext();
    o.ctxLigne=/Rowing Haltère \(Tirage Horizontal\): [^\n]*\[par bras, 3 séries DE CHAQUE CÔTÉ\]/.test(ctx);
    o.ctxListe=/🔀 EXERCICES UNILATÉRAUX/.test(ctx);
    o.ctxRegle=/on note le poids qui BOUGE pendant la répétition/.test(ctx);
    o.ctxPasDouble=/N'?E COMPTE PAS LES SÉRIES EN DOUBLE|NE COMPTE PAS LES SÉRIES EN DOUBLE/.test(ctx);
    o.ctxTemps=/2× plus longtemps|2× plus de temps/.test(ctx);
    // ⚠️ le nom ne doit JAMAIS être suffixé dans les bacs du catalogue : Milo le recopierait
    o.pasDeSuffixe=!/Rowing Haltère \(Tirage Horizontal\) \(uni\)/.test(ctx);

    // ── L'écran Séance : la pastille est là, et le tonnage de l'exercice double aussi
    startWorkout();
    S.wkt.exs.push({name:'Rowing Haltère (Tirage Horizontal)',sets:[{kg:28,reps:8,done:true,type:'N'}]});
    S.wkt.exs.push({name:'Développé Couché',sets:[{kg:100,reps:5,done:true,type:'N'}]});
    S.expandAll=true; renderLog();
    const el=document.getElementById('s-log');
    o.pastille=/🔀 par bras/.test(el.innerHTML);
    o.pastilleUneSeule=(el.innerHTML.match(/uni-tag/g)||[]).length; // le DC n'en a pas
    o.volExo=/448kg/.test(el.textContent);   // 28×8 = 224, doublé = 448
    // l'aide s'ouvre et nomme l'exercice
    openUniHelp('Rowing Haltère (Tirage Horizontal)');
    o.aideOuverte=document.getElementById('ov-uni-help').classList.contains('open');
    o.aideNomme=/Rowing Haltère \(Tirage Horizontal\) — par bras/.test(document.getElementById('uni-help-ex').textContent);
    o.aidePoids=/poids qui BOUGE/.test(document.getElementById('ov-uni-help').textContent);
    closeUniHelp();
    o.aideFermee=!document.getElementById('ov-uni-help').classList.contains('open');
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  // ⚠️ FAUX-VERT ATTRAPÉ AU CONTRÔLE NÉGATIF : si le bloc plante, `U` ne contient que
  // `erreur` — et `U.volume===U.attendu` devient `undefined===undefined`, donc VERT.
  // Deux témoins passaient ainsi sur du code qui ne connaissait même pas l'unilatéral.
  // Un test qui réussit parce qu'il n'a rien mesuré est pire qu'un test absent.
  if(U.erreur){ console.log('     ⚠️  bloc « unilatéral » en ERREUR : '+U.erreur);
    t('⛔ le bloc unilatéral s\'exécute (aucun témoin ci-dessous ne vaut sans ça)', false, U.erreur); }
  const tu=(n,c,x)=>t(n, !U.erreur && c, U.erreur?'bloc en erreur':x);
  tu('les 48 exercices tranchés par Michel sont bien dans le code', U.nbUni===48, 'reçu '+U.nbUni);
  tu('⭐⭐ AUCUN des 9 « faux amis » n\'est unilatéral (leurs charges seraient doublées à tort)',
    Array.isArray(U.fauxAmis)&&U.fauxAmis.length===0, JSON.stringify(U.fauxAmis));
  tu('rowing haltère · squat bulgare · curl haltères = unilatéraux',
    U.rowing===true&&U.bulgare===true&&U.curl===true, JSON.stringify(U));
  tu('⭐ un exercice INCONNU ne double jamais un volume au hasard (R29)', U.inconnu===false);
  tu('les libellés : par bras · par jambe · par côté, et rien pour un bilatéral',
    U.lblBras==='par bras'&&U.lblJambe==='par jambe'&&U.lblCote==='par côté'&&U.lblVide==='',
    JSON.stringify([U.lblBras,U.lblJambe,U.lblCote,U.lblVide]));
  tu('⭐ un ANCIEN nom garde son marqueur (la clé est l\'identifiant, pas le nom)', U.viaAlias===true);
  tu('⭐⭐ 3 séries saisies → volume DOUBLÉ (1344 + 500 = 1844 kg)',
    U.volume===U.attendu, 'reçu '+U.volume+' attendu '+U.attendu);
  tu('la séance porte le marqueur de convention (uniConv)', U.marque===true);
  tu('⭐ le RECORD reste calculé sur la charge d\'UN côté (28 kg, jamais 56)',
    U.pr&&U.pr.kg===28&&U.pr.rm1===U.prAttendu, JSON.stringify(U.pr));
  tu('⭐⭐ une séance D\'AVANT la bascule n\'est PAS recalculée (le curl à 60 deviendrait quadruple)',
    U.volAncien===U.volAncienAttendu, 'reçu '+U.volAncien+' attendu '+U.volAncienAttendu);
  tu('⭐⭐ Milo voit « par bras » SUR LA LIGNE de la séance (R4)', U.ctxLigne===true);
  tu('⭐ … la liste des unilatéraux disponibles', U.ctxListe===true);
  tu('⭐⭐ … la règle « on note le poids qui BOUGE » (sinon il parle une autre langue que l\'app)',
    U.ctxRegle===true);
  tu('⭐ … l\'interdiction de compter les séries en double', U.ctxPasDouble===true);
  tu('… et que ça prend 2× plus de temps (déterminant pour tenir dans 1 h)', U.ctxTemps===true);
  tu('⭐⭐ le nom n\'est JAMAIS suffixé « (uni) » dans le catalogue (Milo le recopierait)',
    U.pasDeSuffixe===true);
  tu('la pastille 🔀 s\'affiche en séance…', U.pastille===true);
  tu('… et SEULEMENT sur l\'unilatéral (le développé couché n\'en a pas)', U.pastilleUneSeule===1,
    'reçu '+U.pastilleUneSeule);
  tu('⭐ le tonnage de l\'EXERCICE double aussi (sinon 2 chiffres pour le même travail)',
    U.volExo===true);
  tu('l\'aide s\'ouvre, nomme l\'exercice et dit quel poids noter',
    U.aideOuverte===true&&U.aideNomme===true&&U.aidePoids===true, JSON.stringify(U));
  tu('… et se referme', U.aideFermee===true);
  tu('0 erreur JS sur tout le bloc unilatéral', eu.length===0, eu.join(' | '));
  await cu.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// V. LE MÉTABOLISME DE BASE — l'écran le DIT, et Milo le sait (11/08/2026)
// Le calcul lui-même est figé dans tests/calculs (bloc 2 bis). ICI on protège la seule
// chose qui fait la différence entre une amélioration et une trahison : que le chiffre
// ne change JAMAIS en silence. Michel a passé la nuit à exiger des données « prouvées ET
// prouvables » — un nombre qui bouge de 180 kcal sans dire pourquoi est l'inverse de ça.
console.log('\n═══ V. Métabolisme de base — d\'où vient le chiffre ═══');
{
  const cv=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pv=await cv.newPage(); const ev=[]; pv.on('pageerror',e=>ev.push(e.message));
  await pv.addInitScript(seedScript({}));
  await pv.goto('http://localhost:'+PORT+'/index.html');
  await pv.waitForTimeout(2200);
  const V=await pv.evaluate(async()=>{
   try{
    const o={};
    const jour=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10);};
    document.querySelectorAll('.overlay.open').forEach(x=>x.classList.remove('open'));
    const ob=document.getElementById('onboarding'); if(ob)ob.style.display='none';

    // ── ① SANS mesure : l'écran n'écrit RIEN (on n'inquiète pas pour rien, R24)
    S.bodyScans=[]; S.weightLog=[]; renderNutrition();
    o.sansMesureVide=(document.getElementById('nu-bmr-src').textContent||'').trim()==='';
    o.sansMesureCtx=/ESTIMÉ sur poids\/taille\/âge/.test(buildCoachContext());

    // ── ② AVEC un bilan récent : l'écran le dit, Milo le sait, et il connaît l'ÉCART
    S.bodyScans=[{date:jour(10),weight:80,leanMass:65}]; renderNutrition();
    o.ditMasseMaigre=/masse maigre/i.test(document.getElementById('nu-bmr-src').textContent||'');
    o.affiche=document.getElementById('nu-bmr').textContent;
    o.attendu=Math.round(370+21.6*65).toLocaleString('fr-FR');
    const ctx=buildCoachContext();
    o.ctxKatch=/CALCULÉ SUR SA MASSE MAIGRE MESURÉE/.test(ctx);
    o.ctxFormule=/Katch-McArdle/.test(ctx);
    o.ctxEcart=/kcal\/jour/.test(ctx);
    o.ctxPasDeuxFois=!/ESTIMÉ sur poids\/taille\/âge/.test(ctx);   // jamais les deux à la fois

    // ── ③ BILAN TROP VIEUX : l'écran signale que le bilan n'a PAS servi (il y a une action)
    S.bodyScans=[{date:jour(200),weight:80,leanMass:65}]; renderNutrition();
    o.ditNonUtilise=/non utilisé/i.test(document.getElementById('nu-bmr-src').textContent||'');
    o.ctxVieux=/ESTIMÉ sur poids\/taille\/âge/.test(buildCoachContext());

    // ── ④ L'AIDE POSE LE CALCUL avec ses vrais nombres (sinon elle demande de croire)
    S.bodyScans=[{date:jour(10),weight:80,leanMass:65}]; renderNutrition();
    openBmrHelp();
    const m=document.getElementById('ov-bmr-help');
    o.aideOuverte=m.classList.contains('open');
    const txt=document.getElementById('bmr-help-body').textContent;
    o.aideCalcul=/370 \+ 21,6 × 65 kg/.test(txt);
    o.aideCompare=/Mifflin-St Jeor/.test(txt);
    o.aideBalance=/formule secrète, invérifiable/.test(txt);
    closeBmrHelp(); o.aideFermee=!m.classList.contains('open');
    S.bodyScans=[]; S.weightLog=[]; renderNutrition();
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tv=(n,c2,x)=>t(n, !V.erreur && c2, V.erreur?'bloc en erreur':x);
  if(V.erreur){ console.log('     ⚠️  bloc « BMR » en ERREUR : '+V.erreur);
    t('⛔ le bloc BMR s\'exécute (aucun témoin ci-dessous ne vaut sans ça)', false, V.erreur); }
  tv('sans aucune mesure : l\'écran n\'écrit rien (pas d\'inquiétude gratuite)', V.sansMesureVide===true);
  tv('… mais Milo, lui, sait que le chiffre est estimé sur le poids total', V.sansMesureCtx===true);
  tv('⭐⭐ bilan récent : l\'écran affiche « selon ta masse maigre »', V.ditMasseMaigre===true);
  tv('… et c\'est bien le chiffre de Katch qui s\'affiche', V.affiche===V.attendu, V.affiche+' vs '+V.attendu);
  tv('⭐⭐ Milo reçoit la méthode ET la formule nommée', V.ctxKatch===true&&V.ctxFormule===true);
  tv('⭐ … et l\'ÉCART avec l\'autre formule (sinon il ne peut pas nuancer)', V.ctxEcart===true);
  tv('⭐ jamais les deux versions dans le même contexte (deux sources = il croit la pire)',
    V.ctxPasDeuxFois===true);
  tv('⭐⭐ bilan trop vieux : l\'écran DIT qu\'il n\'a pas servi (là, il y a une action possible)',
    V.ditNonUtilise===true);
  tv('… et Milo repasse en « estimé »', V.ctxVieux===true);
  tv('⭐⭐ l\'aide POSE le calcul avec ses vrais nombres', V.aideCalcul===true);
  tv('… compare à l\'autre formule', V.aideCompare===true);
  tv('⭐ … et dit pourquoi on n\'avale pas le chiffre de la balance', V.aideBalance===true);
  tv('l\'aide s\'ouvre et se referme', V.aideOuverte===true&&V.aideFermee===true);
  t('0 erreur JS sur tout le bloc BMR', ev.length===0, ev.join(' | '));
  await cv.close();
}


// ═════════════════════════════════════════════════════════════════════════════
// VI. LE SUPERSET DE MILO — et le refus sur les mouvements lourds (12/08/2026)
// Né de la question de Michel (powerlifting) : « je peux en faire ou pas ? ». La réponse
// des méta-analyses : sur les accessoires oui, sur les trois mouvements jamais — le
// superset fait gagner du TEMPS, pas du muscle, au prix de la performance du 2ᵉ exercice.
// Le trou qu'on bouche : `loadProgDay` lisait déjà `supersetGroup` pour un programme
// importé, la séance dictée dans le chat ne lisait RIEN. Même objet, deux portes, une
// seule qui marchait.
console.log('\n═══ VI. Superset dicté par Milo ═══');
{
  const cw=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pw=await cw.newPage(); const ew=[]; pw.on('pageerror',e=>ew.push(e.message));
  await pw.addInitScript(seedScript({}));
  await pw.goto('http://localhost:'+PORT+'/index.html');
  await pw.waitForTimeout(2200);
  const W=await pw.evaluate(async()=>{
   try{
    const o={};
    document.querySelectorAll('.overlay.open').forEach(x=>x.classList.remove('open'));
    const ob=document.getElementById('onboarding'); if(ob)ob.style.display='none';
    const fab=()=>{const e=document.getElementById('nb-log');if(!e)return '?';
      const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)].join(',');};
    o.fabAvant=fab();

    S.wkt=null;
    _pendingMiloSessions=[{label:'Push',exs:[
      {name:'Développé Couché',sets:[{reps:5,kg:100,type:'N'}]},
      {name:'Squat à la Barre',supersetGroup:'A',sets:[{reps:5,kg:130,type:'N'}]},
      {name:'Soulevé de Terre',supersetGroup:'A',sets:[{reps:5,kg:140,type:'N'}]},
      {name:'Curl Biceps Haltères',supersetGroup:'B',sets:[{reps:12,kg:14,type:'N'}]},
      {name:'Extension Triceps Poulie',supersetGroup:'B',sets:[{reps:12,kg:25,type:'N'}]},
      {name:'Élévations Latérales',supersetGroup:'C',sets:[{reps:15,kg:8,type:'N'}]}]}];
    _miloPendingIdx=0;_miloPendingBtn=null;
    _applyMiloSession('new');
    await new Promise(r=>setTimeout(r,600));
    const ex=S.wkt.exs;
    o.n         = ex.length;
    o.sansEtiq  = ex[0].group===undefined;                       // rien demandé → rien posé
    o.squat     = ex[1].group===undefined;                       // INTERDIT
    o.souleve   = ex[2].group===undefined;                       // INTERDIT
    o.lies      = !!(ex[3].group && ex[3].group===ex[4].group);  // accessoires → LIÉS
    o.type      = ex[3].groupType;
    o.orphelin  = ex[5].group===undefined;                       // seul de son groupe → délié
    o.idUnique  = /^ss\d+_B$/.test(ex[3].group||'');             // identifiant, pas l'étiquette brute
    o.fabApres  = fab();
    await new Promise(r=>setTimeout(r,200));
    if(typeof toggleSet==='function') toggleSet(3,0);
    await new Promise(r=>setTimeout(r,400));
    o.fabSerie  = fab();

    // ── la spec doit être DANS le contexte, sinon Milo ne peut pas l'employer (R8)
    const ctx=(typeof buildCoachContext==='function')?buildCoachContext(''):'';
    o.specDite  = ctx.indexOf('supersetGroup')>=0;
    o.regleTemps= /ne rentre pas dans le temps/i.test(ctx);
    o.regleLourd= /JAMAIS sur un mouvement lourd/i.test(ctx) && /l'app REFUSE ces groupes/i.test(ctx);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  let okw=0,kow=0; const tw=(n,c,d)=>{ if(c){okw++;ok++;console.log('  ✅ '+n);} else {kow++;ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(W.erreur){ t('⛔ le bloc superset s\'exécute (aucun témoin ne vaut sans ça)', false, W.erreur); }
  tw('les 6 exercices de Milo arrivent bien dans la séance', W.n===6, 'reçu '+W.n);
  tw('sans étiquette, aucun groupe n\'est posé (non-régression)', W.sansEtiq===true);
  tw('⭐⭐ REFUS du superset sur le SQUAT (mouvement lourd)', W.squat===true);
  tw('⭐⭐ REFUS sur le SOULEVÉ DE TERRE', W.souleve===true);
  tw('⭐⭐ les deux ACCESSOIRES sont réellement LIÉS (curl + triceps)', W.lies===true&&W.type==='super',
    'group '+W.lies+' · type '+W.type);
  tw('… avec un identifiant unique, pas l\'étiquette brute de Milo', W.idUnique===true);
  tw('⭐ un groupe resté SEUL est délié (pas de superset à un membre)', W.orphelin===true);
  tw('⭐ RÈGLE D\'OR #9 : le bouton central ne bouge pas ('+W.fabAvant+')',
    W.fabAvant===W.fabApres&&W.fabApres===W.fabSerie,
    W.fabAvant+' → '+W.fabApres+' → '+W.fabSerie);
  tw('⭐ Milo REÇOIT la clé `supersetGroup` (sinon il ne peut pas s\'en servir — R8)', W.specDite===true);
  tw('… et la règle « seulement quand le temps manque »', W.regleTemps===true);
  tw('… et l\'interdiction sur les mouvements lourds', W.regleLourd===true);
  tw('0 erreur JS sur tout le bloc superset', ew.length===0, ew.join(' | '));
  await cw.close();
}

// ═════════════════════════════════════════════════════════════════════════════
// VII. LA DURÉE RÉELLE DES SÉANCES → MILO (12/08/2026)
// Le questionnaire demande la durée DÉCLARÉE et l'envoyait ; la durée CHRONOMÉTRÉE
// (`sess.duration`) existait depuis des mois et ne partait pas. Milo planifiait donc
// contre un budget annoncé au lieu du budget vécu.
console.log('\n═══ VII. Durée réelle des séances ═══');
{
  const cx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const px=await cx.newPage(); const ex_=[]; px.on('pageerror',e=>ex_.push(e.message));
  await px.addInitScript(seedScript({}));
  await px.goto('http://localhost:'+PORT+'/index.html');
  await px.waitForTimeout(2200);
  const X=await px.evaluate(async()=>{
   try{
    const o={};
    const mk=(d,min)=>({date:d,duration:min*60,exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]});
    S.sessions=[mk('2026-08-10',72),mk('2026-08-07',68),mk('2026-08-04',75),mk('2026-08-01',70),mk('2026-07-29',66)];
    S.coachQuiz={answers:{time:'30-45 min'},done:true};
    let c=_ctxDureeSeance();
    o.mediane   = /médiane 70 min/.test(c);
    o.fourchette= /de 66 à 75 min/.test(c);
    o.ecart     = /DÉCLARÉ « 30-45 min »/.test(c) && /25 min/.test(c);
    S.coachQuiz={answers:{time:'60-75 min'},done:true};
    o.pasDAlerte= _ctxDureeSeance().indexOf('DÉCLARÉ')<0;       // écart faible → on n'embête pas
    S.sessions=[mk('2026-08-10',72),mk('2026-08-07',68)];
    o.tropPeu   = _ctxDureeSeance()==='';                        // < 3 séances → silence (R29)
    S.sessions=[mk('2026-08-10',9),mk('2026-08-07',400),mk('2026-08-04',9)];
    o.aberrantes= _ctxDureeSeance()==='';                        // 9 min / 6h40 → écartées
    S.sessions=[mk('2026-08-10',72),mk('2026-08-07',68),mk('2026-08-04',75)];
    o.dansCtx   = (typeof buildCoachContext==='function') &&
                  buildCoachContext('').indexOf('DURÉE RÉELLE DE SES SÉANCES')>=0;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  let okx=0; const tx=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(X.erreur){ t('⛔ le bloc durée s\'exécute (aucun témoin ne vaut sans ça)', false, X.erreur); }
  tx('⭐ la MÉDIANE est envoyée (pas la moyenne : un chrono oublié la ferait exploser)', X.mediane===true);
  tx('… avec la fourchette min-max', X.fourchette===true);
  tx('⭐⭐ l\'écart DÉCLARÉ vs RÉEL est signalé quand il dépasse 15 min', X.ecart===true);
  tx('… et on n\'embête PAS la personne quand l\'écart est faible', X.pasDAlerte===true);
  tx('⭐ moins de 3 séances → SILENCE, jamais une tendance inventée (R29)', X.tropPeu===true);
  tx('⭐ durées aberrantes (9 min, 6 h 40) écartées → silence', X.aberrantes===true);
  tx('⭐ et ça atteint vraiment le contexte de Milo (R4)', X.dansCtx===true);
  tx('0 erreur JS sur tout le bloc durée', ex_.length===0, ex_.join(' | '));
  await cx.close();
}


// ═════════════════════════════════════════════════════════════════════════════
// VIII. LES TEMPS DE REPOS RÉGLÉS PAR EXERCICE → MILO (12/08/2026)
// Le DERNIER des deux trous connus du garde-fou tests/donnees (R4a), ouvert depuis qu'il
// existe : « Tu as mis 240 s au squat, il l'ignore ». `S.exRestPref` s'écrit tout seul dès
// qu'on règle le chrono en séance, et l'app le réapplique — c'est une décision DÉJÀ PRISE,
// que Milo contredisait sans le savoir.
console.log('\n═══ VIII. Temps de repos réglés par exercice ═══');
{
  const cy=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const py=await cy.newPage(); const ey=[]; py.on('pageerror',e=>ey.push(e.message));
  await py.addInitScript(seedScript({}));
  await py.goto('http://localhost:'+PORT+'/index.html');
  await py.waitForTimeout(2200);
  const Y=await py.evaluate(async()=>{
   try{
    const o={};
    const DE=(typeof _ctxReposRegles==='function')?_ctxReposRegles:()=>'FONCTION ABSENTE';
    S.exRestPref={};
    o.vide = DE()==='';                                   // rien de réglé → rien à dire
    S.exRestPref={'Squat à la Barre':240,'Développé Couché':180,'Curl Biceps Haltères':60,
                  'Soulevé de Terre':300,'Exercice Abandonné':120};
    S.sessions=[{date:'2026-08-10',exs:[{name:'Squat à la Barre',sets:[{done:true}]},
                {name:'Développé Couché',sets:[{done:true}]},{name:'Curl Biceps Haltères',sets:[{done:true}]}]}];
    const t=DE();
    o.squat   = /Squat à la Barre → 4 min/.test(t);        // 240 s lisible en clair
    o.curl    = /Curl Biceps Haltères → 1 min/.test(t);
    o.consigne= /REPRENDS CES VALEURS/.test(t) && /DIS POURQUOI/.test(t);
    o.duree   = /calcul de durée/.test(t);                 // le lien avec « ça rentre ou pas »
    o.ordre   = t.indexOf('Squat à la Barre') < t.indexOf('Exercice Abandonné');
    // borne de coût : ce bloc est PERSONNEL, donc payé plein tarif à chaque message
    const gros={}; for(let i=0;i<15;i++) gros['Exo '+i]=60+i;
    S.exRestPref=gros;
    const g=DE();
    o.borne   = /… et 5 autres/.test(g) && (g.match(/→/g)||[]).length<=11;
    // et ça doit ATTEINDRE le contexte, sinon la fonction ne sert à rien (R4)
    S.exRestPref={'Squat à la Barre':240};
    const ctx=(typeof buildCoachContext==='function')?buildCoachContext(''):'';
    o.dansCtx = ctx.indexOf('TEMPS DE REPOS RÉGLÉS')>=0;
    // ⚠️ donnée PERSONNELLE : elle ne doit jamais monter dans le bloc commun (cache partagé)
    const i=ctx.indexOf('PROFIL ATHLÈTE:');
    o.pasCommun = i>0 && ctx.slice(0,i).indexOf('TEMPS DE REPOS RÉGLÉS')<0;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const ty=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(Y.erreur){ t('⛔ le bloc repos réglés s\'exécute (aucun témoin ne vaut sans ça)', false, Y.erreur); }
  ty('aucun réglage → SILENCE (on ne meuble pas le contexte)', Y.vide===true);
  ty('⭐⭐ « 240 s au squat » arrive enfin chez Milo, lisible (4 min)', Y.squat===true);
  ty('… et les valeurs courtes aussi (curl 1 min)', Y.curl===true);
  ty('⭐ la consigne dit de les REPRENDRE, et d\'expliquer si Milo s\'en écarte', Y.consigne===true);
  ty('⭐ … et de les compter dans la durée (un squat à 4 min coûte plus qu\'un curl)', Y.duree===true);
  ty('les exercices RÉCENTS passent devant ceux qu\'on ne fait plus', Y.ordre===true);
  ty('⭐ la liste est BORNÉE à 10 + « et N autres » (ce bloc est payé plein tarif)', Y.borne===true);
  ty('⭐ et ça atteint vraiment le contexte de Milo (R4)', Y.dansCtx===true);
  ty('⭐⭐ … dans le bloc PERSONNEL, jamais le commun (cache partagé entre tous)', Y.pasCommun===true);
  t('0 erreur JS sur tout le bloc repos réglés', ey.length===0, ey.join(' | '));
  await cy.close();
}


/* ══ BLOC IX — LA FEUILLE IMPRIMÉE DU PROGRAMME (13/08/2026) ═══════════════════════════
   Trois choses à protéger, et la première a coûté cher :
   ① `html,body{height:100%;overflow:hidden}` sert à l'app (PWA plein écran qui ne défile
      pas) et COUPE la feuille à une page. Mesuré sur le code d'avant : 8 jours → 3 perdus,
      12 jours → 7 perdus, en silence. C'est le témoin le plus important du bloc.
   ② aucune information ne repose sur un FOND (case décochée par défaut à l'impression) ;
   ③ une case par série RÉELLE — jamais une case pour une série qui n'existe pas.        */
{
  console.log('\n── IX. La feuille imprimée du programme ──');
  const cz=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pz=await cz.newPage(); const ez=[];
  pz.on('pageerror',e=>ez.push(String(e.message)));
  await pz.addInitScript(seedScript());
  await pz.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pz.waitForTimeout(1200);

  const jour=(n,ex)=>({label:'Jour '+n,exs:ex});
  const EX=[{name:'Squat à la Barre',note:'Dos calé',sets:[{reps:5},{reps:5},{reps:5},{reps:5}]},
            {name:'Presse à Cuisses',sets:[{reps:10},{reps:10},{reps:10}]},
            {name:'Leg Curl Allongé',sets:[{reps:12},{reps:12},{reps:12}]}];

  const Z=await pz.evaluate(async EXS=>{
   try{
    const o={};
    const mk=n=>({name:'T',days:Array.from({length:n},(_,i)=>({label:'Jour '+(i+1),exs:EXS}))});
    if(typeof printProg!=='function')return {erreur:'printProg absente'};
    const rp=window.print; window.print=()=>{};
    printProg.call(null,0);           // amorce (S.programmes vide → sort tout seul)
    S.programmes=[mk(3)]; printProg(0);
    window.print=rp;
    const a=document.getElementById('print-area');

    // ① LA FEUILLE N'EST PAS ENFERMÉE DANS UNE PAGE — on lit le CSS d'impression réel.
    let vis=false,haut=false;
    for(const sh of document.styleSheets){
      let rr; try{rr=sh.cssRules;}catch(e){continue;}
      for(const r of rr||[]){
        if(r.type!==4||!/print/.test(r.conditionText||''))continue;
        for(const q of r.cssRules||[]){
          if(!/(^|,)\s*(html|body)\b/.test(q.selectorText||''))continue;
          if(/visible/.test(q.style.overflow||''))vis=true;
          if(/auto/.test(q.style.height||''))haut=true;
        }
      }
    }
    o.overflowVisible=vis; o.hauteurAuto=haut;

    // ② AUCUN TEXTE CLAIR SUR FOND SOMBRE : c'est le défaut qui rend un bloc invisible
    //    quand les graphiques d'arrière-plan ne sont pas imprimés.
    const lum=c=>{const m=(c||'').match(/[\d.]+/g);return m&&m.length>=3?(+m[0]*299+ +m[1]*587+ +m[2]*114)/1000:null;};
    const opaque=c=>{const m=(c||'').match(/[\d.]+/g);return !(m&&m.length>3&&+m[3]===0);};
    o.blancSurSombre=[];
    for(const el of a.querySelectorAll('*')){
      const st=getComputedStyle(el), lt=lum(st.color), lf=lum(st.backgroundColor);
      if(lt===null||lf===null||!opaque(st.backgroundColor))continue;
      if((el.textContent||'').trim().length<2)continue;
      if(lt>150&&lf<140)o.blancSurSombre.push((el.className||el.tagName)+' : '+st.color+' sur '+st.backgroundColor);
    }

    // ③ UNE CASE PAR SÉRIE RÉELLE (4 · 3 · 3), et les colonnes en trop sont neutralisées.
    o.cases=[...a.querySelectorAll('.prt-day')][0]
      ? [...a.querySelectorAll('.prt-day')][0].querySelectorAll('tbody tr')
        && [...[...a.querySelectorAll('.prt-day')][0].querySelectorAll('tbody tr')]
           .map(tr=>tr.querySelectorAll('td.w:not(.off)').length)
      : [];

    // ④ LA FIGURINE : présente, et elle DIT quelque chose (des muscles colorés, pas un
    //    corps tout gris) — sinon elle décore au lieu d'informer.
    const f=a.querySelector('.prt-fig svg');
    o.figurine=!!f;
    o.figurineParle=!!f&&/#D91843/i.test(f.outerHTML);
    o.focus=(a.querySelector('.prt-focus')||{}).textContent||'';

    // ⑤ La légende doit être en SVG : un fill s'imprime toujours, un background non.
    o.legendeSVG=a.querySelectorAll('.prt-leg svg').length===3;
    o.legendeFond=[...a.querySelectorAll('.prt-leg *')].some(e=>{
      const b=getComputedStyle(e).backgroundColor;return b&&b!=='rgba(0, 0, 0, 0)'&&b!=='transparent';});

    // ⑦ LA PÉRIODE DU PROGRAMME (13/08/2026) — ce que l'app sait, elle l'écrit ; ce
    //    qu'elle ne sait pas, elle le laisse à remplir. Jamais une échéance inventée.
    const dat={name:'T',startDate:'2026-08-17',weeks:6,days:[{label:'Jour 1',exs:EXS}]};
    o.periode=(typeof progPeriode==='function')?progPeriode(dat):'progPeriode absente';
    S.programmes=[dat]; const rp3=window.print; window.print=()=>{}; printProg(0); window.print=rp3;
    o.enteteDatee=document.getElementById('print-area').querySelector('.prt-meta').textContent;
    const sans={name:'T',days:[{label:'Jour 1',exs:EXS}]};
    o.periodeSans=(typeof progPeriode==='function')?progPeriode(sans):'x';
    S.programmes=[sans]; window.print=()=>{}; printProg(0); window.print=rp3;
    o.enteteSans=document.getElementById('print-area').querySelector('.prt-meta').textContent;
    // ⑧ UNE SEULE SOURCE : la carte du programme dans l'app doit lire la MÊME période.
    o.cartePartage=/progPeriode\(p\)/.test(String(renderProgModal));

    // ⑥ On PRÉPARE le gros programme ; le comptage se fait sur le PDF, pas ici —
    //    le découpage en pages n'existe pas dans le DOM (voir plus bas).
    S.programmes=[mk(12)]; const rp2=window.print; window.print=()=>{}; printProg(0); window.print=rp2;
    o.jours12DOM=new Set((document.getElementById('print-area').textContent.match(/Jour \d+/g)||[])).size;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  },EX);

  const tz=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(Z.erreur){ t('⛔ la feuille imprimée se construit (aucun témoin ne vaut sans ça)', false, Z.erreur); }
  tz('⭐⭐ la feuille n\'est PAS enfermée dans une page (overflow:visible)', Z.overflowVisible===true,
     'sans ça, tout ce qui dépasse une page est coupé et perdu, en silence');
  tz('⭐⭐ … et sa hauteur n\'est pas bloquée à 100 % (height:auto)', Z.hauteurAuto===true);
  /* ⚠️ CE TÉMOIN A ÉTÉ REFAIT (13/08/2026) — sa 1ʳᵉ version comptait les jours dans le
     HTML et passait au VERT sur le code bogué : le découpage en pages n'existe tout
     simplement pas dans le DOM. Un test qui réussit parce qu'il regarde au mauvais endroit
     est pire qu'un test absent. On produit donc le VRAI PDF et on compte dedans. */
  await pz.emulateMedia({media:'print'});
  const buf=await pz.pdf({format:'A4',printBackground:true,
                          margin:{top:'14mm',bottom:'14mm',left:'13mm',right:'13mm'}});
  const nPages=(buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
  /* ⚠️ L'ATTENDU EST CALCULÉ, PAS ÉCRIT À LA MAIN : ma 1ʳᵉ version exigeait « ≥ 4 pages »,
     un chiffre relevé sur un programme à 4 exercices par jour alors que le test en met 3.
     Un seuil recopié casse au premier changement de jeu d'essai et ne protège plus rien.
     On mesure donc la hauteur réelle du document et on en déduit le minimum de pages.
     Chrome peut en produire DAVANTAGE (un tableau ne se coupe pas n'importe où) — jamais
     moins. Le code bogué, lui, en rend 1 quoi qu'il arrive. */
  const hDoc=await pz.evaluate(()=>document.getElementById('print-area').scrollHeight);
  const utile=Math.round(1122.5-2*(14/25.4*96));        // A4 96 dpi − marges 14 mm
  const mini=Math.max(2,Math.floor(hDoc/utile));
  tz('⭐⭐ 12 jours s\'étalent sur plusieurs pages (le PDF, pas le HTML)', nPages>=mini,
     nPages+' page(s) pour '+hDoc+' px de contenu — il en faut au moins '+mini);
  tz('… et les 12 jours sont bien dans le document', Z.jours12DOM===12, 'trouvé : '+Z.jours12DOM);
  tz('⭐ aucun texte clair sur fond sombre (le défaut invisible)', (Z.blancSurSombre||[]).length===0,
     (Z.blancSurSombre||[]).join(' | '));
  tz('une case par série RÉELLE : 4 · 3 · 3', JSON.stringify(Z.cases)==='[4,3,3]', JSON.stringify(Z.cases));
  tz('⭐ la figurine du jour est là', Z.figurine===true);
  tz('⭐⭐ … et elle PARLE (muscles colorés, pas un corps tout gris)', Z.figurineParle===true);
  tz('… et les muscles du jour sont nommés en clair', /Quadriceps|Fessiers/.test(Z.focus||''), Z.focus);
  tz('⭐ la légende est en SVG (un fill s\'imprime, un fond non)', Z.legendeSVG===true);
  // ⚠️ On exige que la légende EXISTE : sinon « aucun fond » est vrai pour rien — c'est
  //    le motif de faux-vert déjà rencontré en ft-v832 et ft-v835.
  tz('… et ne repose sur AUCUN fond', Z.legendeSVG===true&&Z.legendeFond===false);
  /* ⚠️ L'ATTENDU EST CALCULÉ, PAS RECOPIÉ : 6 semaines à partir du lundi 17/08/2026 se
     terminent le DIMANCHE 27/09 (42 jours pile), pas le lundi 28. Écrire « 27/09 » à la
     main marcherait tant que personne ne change la date de départ du test. */
  const d0=new Date('2026-08-17'), attFin=new Date(d0.getTime()+(6*7-1)*86400000).toISOString().split('T')[0];
  tz('⭐ la période se calcule : début + N semaines → dernier jour, pas le lendemain',
     Z.periode&&Z.periode.end===attFin, JSON.stringify(Z.periode)+' — attendu fin='+attFin);
  tz('⭐⭐ … et elle est IMPRIMÉE, au lieu d\'être à remplir au stylo',
     /Du 17\/08\/2026 au 27\/09\/2026/.test(Z.enteteDatee||'')&&/6 semaines/.test(Z.enteteDatee||''), Z.enteteDatee);
  tz('⚠️ un programme SANS dates n\'invente rien (période = null)', Z.periodeSans===null);
  tz('… et garde sa case « Semaine __ / __ » à remplir', /Semaine/.test(Z.enteteSans||'')&&!/Du /.test(Z.enteteSans||''), Z.enteteSans);
  tz('⭐ la carte du programme lit la MÊME période que la feuille (R2)', Z.cartePartage===true,
     'sinon deux formules pour une seule vérité — elles divergeront');
  t('0 erreur JS sur toute la feuille imprimée', ez.length===0, ez.join(' | '));
  await cz.close();
}


/* ══ BLOC X — LE DÉBRIEF DE FIN DE SÉANCE (13/08/2026) ══════════════════════════════════
   Michel : *« le briefing d'après séance a bien disparu »*. Vérifié en rejouant une vraie
   fin de séance : le mécanisme MARCHE — dès que l'API répond, le texte de Milo s'affiche.
   Le défaut était que l'ÉCHEC était SILENCIEUX : on retombait sur un résumé de chiffres,
   et rien ne distinguait « Milo a répondu court » de « Milo n'a jamais répondu ».
   Ce bloc fige les 4 chemins, y compris celui du silence — c'est le seul qui manquait.  */
{
  console.log('\n── X. Le débrief de fin de séance ──');
  const seance=()=>{ startWorkout();
    S.wkt.exs=[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}];
    return finishWorkout(); };
  const lire=()=>({txt:(document.getElementById('se-debrief')||{}).innerText||'',
                   retry:!!document.querySelector('.se-dbf-retry'),
                   jeton:!!localStorage.getItem('ft4_pending_debrief')});
  // Un contexte par scénario : le jeton et l'historique ne doivent pas déborder de l'un à l'autre.
  const jouer=async(nAbort,offline)=>{
    const cx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
    const pg=await cx.newPage(); const errs=[];
    pg.on('pageerror',e=>errs.push(String(e.message)));
    let n=0;
    await pg.route(u=>String(u).indexOf('127.0.0.1:'+PORT)<0, r=>{
      if(!/"action"\s*:\s*"coach"/.test(r.request().postData()||''))
        return r.fulfill({status:200,contentType:'application/json',body:'{}'});
      n++;
      if(n<=nAbort) return r.abort();
      r.fulfill({status:200,contentType:'application/json',
                 body:JSON.stringify({reply:'Belle séance : 100 kg × 5, propre. Vise 102,5 kg.'})});
    });
    await pg.addInitScript(seedScript());
    await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1200);
    if(offline) await cx.setOffline(true);
    await pg.evaluate(seance);
    await pg.waitForTimeout(2500);
    const r1=await pg.evaluate(lire);
    let r2=null;
    if(r1.retry){ await pg.evaluate(()=>_retrySeDebrief()); await pg.waitForTimeout(2200);
                  r2=await pg.evaluate(lire); }
    await cx.close();
    return {r1,r2,errs,appels:n};
  };

  const OK   = await jouer(0,false);   // Milo répond
  const KO   = await jouer(9,false);   // toutes les tentatives échouent
  const HORS = await jouer(0,true);    // hors ligne
  const RATT = await jouer(2,false);   // les 2 essais auto échouent, le rattrapage réussit

  const tz=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  tz('⭐ quand Milo répond, son analyse s\'affiche', /102,5 kg/.test(OK.r1.txt), OK.r1.txt);
  tz('… et le jeton est consommé (pas de 2ᵉ débrief de la même séance)', OK.r1.jeton===false);
  tz('⭐⭐ quand l\'appel ÉCHOUE, l\'écran le DIT (ne fait plus semblant)',
     /n'a pas pu analyser/.test(KO.r1.txt), KO.r1.txt);
  tz('… les chiffres de la séance restent quand même affichés', /kg de volume/.test(KO.r1.txt));
  tz('… le jeton est RENDU : Milo débriefera à l\'ouverture du Coach', KO.r1.jeton===true);
  tz('… et un bouton « Réessayer » est proposé', KO.r1.retry===true);
  tz('⭐ hors ligne : on l\'annonce, sans bouton (ça ne servirait à rien)',
     /Hors ligne/.test(HORS.r1.txt)&&HORS.r1.retry===false, HORS.r1.txt);
  tz('… et le jeton reste posé', HORS.r1.jeton===true);
  tz('⭐ « Réessayer » relance vraiment et affiche l\'analyse',
     !!RATT.r2 && /102,5 kg/.test(RATT.r2.txt), RATT.r2?RATT.r2.txt:'(pas de bouton)');
  tz('… et le message d\'échec disparaît après le rattrapage',
     !!RATT.r2 && RATT.r2.retry===false && RATT.r2.jeton===false);
  t('0 erreur JS sur les 4 scénarios de débrief',
    [OK,KO,HORS,RATT].every(x=>x.errs.length===0),
    [].concat(...[OK,KO,HORS,RATT].map(x=>x.errs)).join(' | '));
}


/* ══ BLOC XI — D'OÙ L'APP EST-ELLE OUVERTE ? (13/08/2026) ══════════════════════════════
   Michel : *« mais sur mon appli comment je le sais ? »* — une PWA installée n'a pas de
   barre d'adresse, et « À propos » n'affichait que la version. Or le Worker de Milo
   n'autorise QUE michdu75-commits.github.io : ouverte ailleurs, l'app a l'air normale mais
   Milo répond « Accès refusé », sans que rien ne l'explique.                              */
{
  console.log('\n── XI. L\'adresse d\'ouverture est visible ──');
  const ca=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pa=await ca.newPage(); const ea=[];
  pa.on('pageerror',e=>ea.push(String(e.message)));
  await pa.addInitScript(seedScript());
  await pa.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pa.waitForTimeout(1200);
  const A=await pa.evaluate(off=>{
   try{
    if(typeof openDrawerContent!=='function')return {erreur:'openDrawerContent absente'};
    openDrawerContent('about');
    const t=(document.getElementById('drawer-cnt-body')||{}).innerText||'';
    return { montre:t.indexOf(location.host)>=0, avertit:/Accès refusé/.test(t) };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  },'https://michdu75-commits.github.io');

  const ta=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(A.erreur){ t('⛔ l\'écran « À propos » s\'ouvre', false, A.erreur); }
  ta('⭐⭐ « À propos » affiche l\'adresse d\'où l\'app est ouverte',
     A.montre===true, JSON.stringify(A));
  ta('⭐ … et PRÉVIENT quand ce n\'est pas l\'adresse officielle (Milo refusera)',
     A.avertit===true, JSON.stringify(A));
  /* ⚠️ LE TÉMOIN QUI COMPTE VRAIMENT — DEUX FICHIERS, UNE SEULE VÉRITÉ (R2).
     L'adresse annoncée dans « À propos » et celle qu'autorise le Worker doivent être
     IDENTIQUES. Si l'une change sans l'autre, l'avertissement se met à mentir : soit il
     alarme sur la bonne adresse, soit il se tait sur une mauvaise. Le pire des deux
     mondes, et parfaitement silencieux.
     (La 1ʳᵉ version de ce témoin simulait `window.location` pour vérifier qu'on n'alarme
     pas sur la bonne adresse — Chromium refuse de la redéfinir. Ce contrôle-ci est plus
     fiable : il lit les deux sources au lieu de mimer un navigateur.) */
  {
    const _app=fs.readFileSync(path.join(ROOT,'coach.js'),'utf8').match(/_MILO_ORIGINE\s*=\s*'([^']+)'/);
    const _wk =fs.readFileSync(path.join(ROOT,'worker.js'),'utf8').match(/ALLOWED_ORIGIN\s*=\s*'([^']+)'/);
    ta('⭐⭐ l\'adresse annoncée est EXACTEMENT celle qu\'autorise le Worker (R2)',
       !!_app&&!!_wk&&_app[1]===_wk[1],
       'app: '+(_app?_app[1]:'introuvable')+' · worker: '+(_wk?_wk[1]:'introuvable'));
  }
  t('0 erreur JS sur l\'écran À propos', ea.length===0, ea.join(' | '));
  await ca.close();
}


/* ══ BLOC XII — LE BOUTON « COPIER » DU PARTAGE (13/08/2026) ═══════════════════════════
   Michel : *« seconde qui ne fonctionne pas d'ailleurs je crois »*. Vérifié : sur iOS,
   `writeText()` est refusé dès que l'appel n'est pas jugé assez proche du geste ; il n'y
   avait aucun `.catch()` → rien ne se passait. Et le repli `execCommand` n'était atteint
   que si `navigator.clipboard` était ABSENT, jamais s'il ÉCHOUAIT — donc jamais sur iPhone.
   ⚠️ Le témoin qui compte est le 2ᵉ : un bouton MUET est le vrai défaut, pas l'échec. */
{
  console.log('\n── XII. Le bouton « Copier » du partage ──');
  const jouer=async(prep)=>{
    const cx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
    const pg=await cx.newPage(); const errs=[];
    pg.on('pageerror',e=>errs.push(String(e.message)));
    if(prep) await pg.addInitScript(prep);
    await pg.addInitScript(seedScript());
    await pg.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1100);
    const msgs=await pg.evaluate(async()=>{
      if(typeof copyAppLink!=='function')return ['__absente__'];
      window.__t=[]; const vrai=window.toast; window.toast=m=>window.__t.push(String(m));
      copyAppLink('share'); await new Promise(r=>setTimeout(r,500));
      window.toast=vrai; return window.__t;
    });
    await cx.close();
    return {msgs,errs};
  };
  const OK   = await jouer(null);
  const KO   = await jouer(()=>{ Object.defineProperty(navigator,'clipboard',{configurable:true,
                 value:{writeText:()=>Promise.reject(new Error('NotAllowedError'))}});
                 document.execCommand=()=>false; });
  const REPL = await jouer(()=>{ Object.defineProperty(navigator,'clipboard',{configurable:true,
                 value:{writeText:()=>Promise.reject(new Error('NotAllowedError'))}});
                 document.execCommand=()=>true; });

  const tc=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  tc('quand le presse-papier marche, on confirme la copie',
     OK.msgs.some(m=>/copié/i.test(m)), JSON.stringify(OK.msgs));
  tc('⭐⭐ quand iOS REFUSE, le bouton n\'est plus MUET',
     KO.msgs.length>0, 'aucun message — c\'est exactement « le bouton ne fait rien »');
  tc('… et il dit quoi faire (le lien est écrit sous le QR code)',
     KO.msgs.some(m=>/sous le QR code/i.test(m)), JSON.stringify(KO.msgs));
  tc('⭐ le repli execCommand est ATTEINT quand writeText échoue (il ne l\'était jamais)',
     REPL.msgs.some(m=>/copié/i.test(m)), JSON.stringify(REPL.msgs));
  t('0 erreur JS sur les 3 scénarios de copie',
    [OK,KO,REPL].every(x=>x.errs.length===0),
    [].concat(...[OK,KO,REPL].map(x=>x.errs)).join(' | '));
}


/* ══ BLOC XIII — LA DURÉE DE SÉANCE REMONTE ENFIN (13/08/2026) ═════════════════════════
   Michel, en relevant ses calories contre sa Garmin : *« pas de durée sur l'application »*.
   Or `sess.duration` est écrite à CHAQUE fin de séance depuis toujours (chrono réel, temps
   en pause déduit) — elle ne servait qu'à l'écran de fin, qui disparaît aussitôt. La donnée
   descendait jusqu'au fichier et ne remontait jamais jusqu'à la personne (R4).            */
{
  console.log('\n── XIII. La durée de séance est visible ──');
  const cd=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pd=await cd.newPage(); const ed=[];
  pd.on('pageerror',e=>ed.push(String(e.message)));
  await pd.addInitScript(seedScript({ft4_sessions:JSON.stringify([
    {id:1,date:'2026-08-10',volume:5000,calories:248,duration:5460,exs:[{name:'Squat à la Barre',sets:[{kg:90,reps:5,done:true,type:'N'}]}]},
    {id:2,date:'2026-08-08',volume:4800,calories:248,duration:4260,exs:[{name:'Squat à la Barre',sets:[{kg:90,reps:5,done:true,type:'N'}]}]},
    {id:3,date:'2026-08-01',volume:4000,calories:200,exs:[{name:'Squat à la Barre',sets:[{kg:80,reps:5,done:true,type:'N'}]}]}
  ])}));
  await pd.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pd.waitForTimeout(1200);
  const D=await pd.evaluate(()=>{
   try{
    goScreen('progress'); renderSessions();
    const liste=document.getElementById('sess-list').innerText;
    openSessDetail(1);
    return { liste, detail:(document.getElementById('sd-sub')||{}).textContent||'',
             sansDuree:(liste.match(/⏱/g)||[]).length };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const td=(n,c,x)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(x?'\n       → '+x:''));} };
  if(D.erreur){ t('⛔ l\'historique s\'affiche', false, D.erreur); }
  td('⭐⭐ la durée apparaît dans l\'historique (1h31 et 1h11)',
     /1h31/.test(D.liste||'')&&/1h11/.test(D.liste||''), (D.liste||'').slice(0,140));
  td('⭐ … et dans le détail d\'une séance, à côté du volume et des calories',
     /1 h 31/.test(D.detail||'')&&/kg total/.test(D.detail||''), D.detail);
  td('⚠️ une séance SANS durée n\'affiche rien (aucun chiffre inventé)',
     D.sansDuree===2, 'trouvé '+D.sansDuree+' durées pour 3 séances dont 1 sans');
  t('0 erreur JS sur l\'historique', ed.length===0, ed.join(' | '));
  await cd.close();
}


/* ══ BLOC XIV — LE CHRONO DE REPOS CONTINUE EN NÉGATIF (14/08/2026) ════════════════════
   Idée de Michel : *« faudrait peut-être qu'il continue en chiffre négatif jusqu'à ce que la
   personne appuie »*. Il s'arrêtait à 0:00, donc le dépassement était invisible — or l'analyse
   croisée du jour montre que le repos PRIS vaut 2 à 3 fois le repos RÉGLÉ (+35 min/séance).  */
{
  console.log('\n── XIV. Le chrono de repos affiche le dépassement ──');
  const cw=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pw=await cw.newPage(); const ew=[];
  pw.on('pageerror',e=>ew.push(String(e.message)));
  await pw.addInitScript(seedScript());
  await pw.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pw.waitForTimeout(1200);
  const W=await pw.evaluate(()=>{
   try{
    if(typeof startRest!=='function')return {erreur:'startRest absente'};
    const lire=()=>({t:document.getElementById('rest-time').textContent,
                     w:document.getElementById('rest-fill').style.width});
    startWorkout(); startRest(90);
    const o={};
    restStartTs=Date.now()-60000;  updRest(); o.avant=lire();
    restStartTs=Date.now()-90000;  updRest(); o.zero =lire();
    restStartTs=Date.now()-120000; updRest(); o.dep30=lire();   // l'exemple de Michel
    restStartTs=Date.now()-330000; updRest(); o.dep4m=lire();
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tw=(n,c,x)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(x?'\n       → '+x:''));} };
  if(W.erreur){ t('⛔ le chrono de repos démarre', false, W.erreur); }
  else{
    tw('le décompte normal est inchangé (1 min écoulée sur 1 min 30 → 0:30)',
       W.avant.t==='0:30', JSON.stringify(W.avant));
    tw('⭐⭐ 1 min 30 réglées + 30 s de plus → « +0:30 » (l\'exemple de Michel)',
       W.dep30.t==='+0:30', JSON.stringify(W.dep30));
    tw('⭐ le dépassement continue de courir (+4:00)', W.dep4m.t==='+4:00', JSON.stringify(W.dep4m));
    tw('⚠️ la barre reste bornée à 0 % (une largeur négative n\'a pas de sens)',
       W.dep30.w==='0%'&&W.dep4m.w==='0%', JSON.stringify([W.dep30.w,W.dep4m.w]));
    tw('pile à zéro, on affiche 0:00 sans signe', W.zero.t==='0:00', JSON.stringify(W.zero));
  }
  t('0 erreur JS sur le chrono de repos', ew.length===0, ew.join(' | '));
  await cw.close();
}


/* ══ BLOC XV — LES 3 DEMANDES DE MICHEL SUR LE CHRONO (14/08/2026) ═════════════════════
   ① le chrono démarre à la 1ʳᵉ série validée, plus à l'ouverture de l'écran ;
   ② un rappel apparaît quand la séance est restée ouverte sans rien valider ;
   ③ une séance importée (photo d'une feuille) peut recevoir sa durée à la main.        */
{
  console.log('\n── XV. Chrono : départ, oubli, saisie ──');
  const cq=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pq=await cq.newPage(); const eq=[];
  pq.on('pageerror',e=>eq.push(String(e.message)));
  await pq.addInitScript(seedScript({ft4_sessions:JSON.stringify([
    {id:1,ts:1,date:'2026-07-20',volume:4000,calories:200,importedHistory:true,duration:0,
     exs:[{name:'Squat à la Barre',sets:[{kg:90,reps:5,done:true,type:'N'}]}]}])}));
  await pq.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pq.waitForTimeout(1200);
  const Q=await pq.evaluate(()=>{
   try{
    const o={};
    // ① le chrono ne part PAS à l'ouverture
    startWorkout();
    S.wkt.exs=[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:false,type:'N'},{kg:100,reps:5,done:false,type:'N'}]}];
    o.avantValidation={chrono:_fmtElapsed(), demarre:!!S.wkt.startTs};
    toggleSet(0,0);
    o.apresValidation={demarre:!!S.wkt.startTs, at:S.wkt.exs[0].sets[0].at};
    // ② le rappel d'oubli
    const rappel=min=>{ S.wkt.startTs=Date.now()-min*60000; goScreen('home'); renderHome();
      return /pense à/.test(document.getElementById('s-home').innerText); };
    o.rappel20=rappel(20); o.rappel60=rappel(60); o.rappel150=rappel(150);
    o.inactif=(S.wkt.startTs=Date.now()-150*60000, _wktInactifMin());
    // ③ la saisie de durée sur une séance importée
    S.wkt=null;
    goScreen('progress'); renderSessions(); openSessDetail(1);
    o.importAvant=document.getElementById('sd-sub').innerText;
    window.prompt=()=>'75';
    editSessDuree();
    const s=S.sessions.find(x=>(x.ts||x.id)===1);
    o.importApres={txt:document.getElementById('sd-sub').innerText, dur:s.duration, dite:!!s.durationDite};
    // une saisie aberrante est refusée
    window.prompt=()=>'999';
    editSessDuree();
    o.refuse=(S.sessions.find(x=>(x.ts||x.id)===1).duration===4500);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tq=(n,c,x)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(x?'\n       → '+x:''));} };
  if(Q.erreur){ t('⛔ le bloc chrono s\'exécute', false, Q.erreur); }
  else{
    tq('⭐⭐ le chrono NE démarre PAS à l\'ouverture de l\'écran',
       Q.avantValidation.demarre===false&&Q.avantValidation.chrono==='0:00', JSON.stringify(Q.avantValidation));
    tq('⭐⭐ … il démarre à la 1ʳᵉ série validée (qui porte donc at=0)',
       Q.apresValidation.demarre===true&&Q.apresValidation.at===0, JSON.stringify(Q.apresValidation));
    tq('⭐ aucun rappel sur une séance active (20 min, 1 h)',
       Q.rappel20===false&&Q.rappel60===false, JSON.stringify([Q.rappel20,Q.rappel60]));
    tq('⭐⭐ rappel « pense à terminer » au-delà de 90 min sans série',
       Q.rappel150===true&&Q.inactif>=150, 'inactif='+Q.inactif);
    tq('⭐ une séance IMPORTÉE propose « ajouter la durée »',
       /ajouter la durée/.test(Q.importAvant||''), Q.importAvant);
    tq('⭐⭐ … la durée saisie est enregistrée et marquée « (saisie) »',
       Q.importApres.dur===4500&&Q.importApres.dite===true&&/saisie/.test(Q.importApres.txt),
       JSON.stringify(Q.importApres));
    tq('⚠️ une durée aberrante (999 min) est refusée, l\'ancienne est gardée', Q.refuse===true);
  }
  t('0 erreur JS sur le bloc chrono', eq.length===0, eq.join(' | '));
  await cq.close();
}


/* ══ BLOC XVI — MILO NE PARLE PAS DU FONCTIONNEMENT INTERNE DE L'APP (14/08/2026) ══════
   PB-007 élargi. La règle du 13/08 couvrait les PANNES (« c'est un bug d'affichage »).
   Le 14/08 Milo a fait autre chose : il a expliqué COMMENT l'app calcule — *« les 249 kcal,
   c'est le calcul basé sur le volume soulevé (tonnes × distance estimée) »*. C'est FAUX :
   `calcSessionCalories` fait MET × poids de corps × durée, le volume n'y entre jamais.
   ⚠️ Plus dangereux que le premier cas : une explication technique inventée sonne juste, et
   personne ne peut la vérifier. Ici elle contredisait un diagnostic établi sur 19 séances.  */
{
  console.log('\n── XVI. Milo n\'explique pas le fonctionnement de l\'app ──');
  const cm=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const pm=await cm.newPage(); const em=[];
  pm.on('pageerror',e=>em.push(String(e.message)));
  await pm.addInitScript(seedScript());
  await pm.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await pm.waitForTimeout(1200);
  const M=await pm.evaluate(()=>{
   try{
    if(typeof buildCoachContext!=='function')return {erreur:'buildCoachContext absente'};
    const ctx=buildCoachContext('test');
    return { interne:/FONCTIONNEMENT INTERNE DE L.APP/.test(ctx),
             calcul:/comment un chiffre est obtenu/i.test(ctx),
             exemple:/volume soulev/.test(ctx),
             commenter:/COMMENTER un chiffre/.test(ctx),
             pannes:/bug d.affichage/.test(ctx) };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tm=(n,c,x)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(x?'\n       → '+x:''));} };
  if(M.erreur){ t('⛔ le contexte de Milo se construit', false, M.erreur); }
  else{
    tm('⭐⭐ la règle vise le FONCTIONNEMENT INTERNE, plus seulement les pannes',
       M.interne===true&&M.calcul===true, JSON.stringify(M));
    tm('⭐ … avec l\'exemple qui a servi (« basé sur le volume soulevé »)', M.exemple===true);
    tm('⚠️ mais Milo garde le droit de COMMENTER un chiffre qu\'on lui donne',
       M.commenter===true, 'sinon on l\'empêcherait de faire son métier');
    tm('la règle d\'origine sur les pannes est conservée', M.pannes===true);
  }
  t('0 erreur JS sur le contexte de Milo', em.length===0, em.join(' | '));
  await cm.close();
}


/* ══ BLOC XVII — « COMMENCER CETTE SÉANCE » SURVIT À LA FERMETURE DE L'APP (14/08/2026) ══
   Michel, en allant à la salle : *« je lui ai demandé de me lancer la séance, je ferme
   l'application, et Commencer la séance a disparu »*. Le bouton n'était ajouté qu'à
   l'ARRIVÉE de la réponse, et la séance analysée vivait dans une variable en mémoire. Au
   rechargement, le TEXTE de la séance restait visible mais devenait inutilisable — pire que
   s'il avait disparu.                                                                    */
{
  console.log('\n── XVII. Le bouton « Commencer cette séance » après rechargement ──');
  const REP='Voilà ta séance :\n\n1. Squat à la Barre — 4×5 @ 90 kg\n2. Rowing Barre — 4×8\n\n'
    +'```json\n{"seance":{"label":"Jambes","exs":['
    +'{"name":"Squat à la Barre","sets":[{"reps":5,"kg":90,"type":"N"},{"reps":5,"kg":90,"type":"N"}]},'
    +'{"name":"Rowing Barre","sets":[{"reps":8,"kg":60,"type":"N"}]}]}}\n```';
  const cs=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const ps=await cs.newPage(); const es=[];
  ps.on('pageerror',e=>es.push(String(e.message)));
  await ps.addInitScript(seedScript({ft4_coach_hist:JSON.stringify(
    [{role:'user',content:'donne-moi ma séance'},{role:'assistant',content:REP}])}));
  await ps.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await ps.waitForTimeout(1200);
  const X=await ps.evaluate(()=>{
   try{
    goScreen('coach');
    if(typeof _loadCoachHist==='function')_loadCoachHist();
    if(typeof _renderCoachThread!=='function')return {erreur:'_renderCoachThread absente'};
    _renderCoachThread();
    const btn=document.querySelector('.coach-prog-save button');
    const txt=document.getElementById('coach-msgs').innerText;
    return { bouton:btn?btn.textContent.trim():'', texte:/Squat à la Barre/.test(txt),
             jsonCache:!/"seance"/.test(txt),
             // le bouton doit MARCHER, pas seulement s'afficher
             marche:(()=>{ try{ if(!btn)return false; btn.click();
               return !!(S.wkt&&S.wkt.exs&&S.wkt.exs.length===2); }catch(e){ return String(e.message); } })() };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tx=(n,c,d)=>{ if(c){ok++;console.log('  ✅ '+n);} else {ko++;console.log('  ❌ '+n+(d?'\n       → '+d:''));} };
  if(X.erreur){ t('⛔ la conversation se reconstruit', false, X.erreur); }
  else{
    tx('le texte de la séance est bien réaffiché', X.texte===true);
    tx('⭐⭐ … et le bouton « Commencer cette séance » est LÀ après rechargement',
       /Commencer cette séance|Utiliser cette séance/.test(X.bouton), 'reçu : '+(X.bouton||'(aucun bouton)'));
    tx('⭐ … et il fonctionne vraiment (2 exercices injectés)', X.marche===true, String(X.marche));
    tx('⚠️ le bloc technique reste caché à l\'écran', X.jsonCache===true);
  }
  t('0 erreur JS sur la reconstruction du fil', es.length===0, es.join(' | '));
  await cs.close();
}

/* ══ BLOC XVIII — LA DISCUSSION S'OUVRE SUR LE DERNIER MESSAGE (15/08/2026) ══
   Michel : *« quand je vais dormir, il remonte tout en haut la discussion »*. Au démarrage,
   `autoConnect()` reconstruit le fil pendant qu'on est encore sur l'ACCUEIL : l'écran Coach est
   caché, sa hauteur vaut 0, et le défilement vers le bas ne fait rien. On ouvre ensuite le Coach
   sur le PREMIER message d'une conversation de 40 bulles.
   ⚠️ Le 2ᵉ témoin est le plus important : on ne redescend PAS de force à chaque visite — qui
   remonte lire un vieux message doit retrouver sa place en revenant.                          */
{
  console.log('\n── XVIII. La discussion s\'ouvre sur le dernier message, pas sur le premier ──');
  const H=[];
  for(let i=1;i<=20;i++){
    H.push({role:'user',content:'Question numéro '+i+' — un texte assez long pour que la bulle occupe de la place et que le fil déborde largement de l\'écran.'});
    H.push({role:'assistant',content:'Réponse numéro '+i+' — encore un texte long, sur plusieurs lignes, pour forcer le défilement du fil de discussion.'});
  }
  const cs=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const ps=await cs.newPage(); const es=[];
  ps.on('pageerror',e=>es.push(String(e.message)));
  await ps.addInitScript(seedScript({ft4_coach_hist:JSON.stringify(H)}));
  await ps.goto('http://127.0.0.1:'+PORT+'/index.html',{waitUntil:'load'});
  await ps.waitForTimeout(1200);
  const Y=await ps.evaluate(async()=>{
   try{
    const msgs=document.getElementById('coach-msgs');
    if(!msgs) return {erreur:'#coach-msgs absent'};
    const o={ecran:window._curScreen};
    // ① ce que fait autoConnect() au démarrage : le fil se construit ALORS QU'ON EST SUR L'ACCUEIL
    updateCoachHeader();
    o.bulles=msgs.children.length;
    o.hauteurCache=msgs.scrollHeight;              // 0 : l'écran est caché, rien n'est défilable
    // ② la personne ouvre le Coach
    goScreen('coach'); await new Promise(r=>setTimeout(r,250));
    o.restant=msgs.scrollHeight-msgs.clientHeight-msgs.scrollTop;   // 0 = sur le dernier message
    o.aRemonter=msgs.scrollTop;
    // ③ elle remonte lire un vieux message, va sur Séance, revient
    msgs.scrollTop=1200;
    goScreen('log'); await new Promise(r=>setTimeout(r,150));
    goScreen('coach'); await new Promise(r=>setTimeout(r,250));
    o.retour=msgs.scrollTop;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(Y.erreur){ t('⛔ le fil se reconstruit au démarrage', false, Y.erreur); }
  else{
    t('le fil est bien reconstruit au démarrage (40 bulles)', Y.bulles===40, 'reçu : '+Y.bulles);
    t('⚠️ … et il l\'est pendant que l\'écran Coach est CACHÉ (hauteur 0)', Y.hauteurCache===0, 'reçu : '+Y.hauteurCache);
    t('⭐⭐ à l\'ouverture, la discussion est sur le DERNIER message',
      Y.restant<5, 'il restait '+Math.round(Y.restant)+' px à descendre (le fil s\'ouvrait '+Math.round(Y.aRemonter)+' px trop haut)');
    t('⭐ … et on ne redescend PAS de force : la place de lecture est gardée au retour',
      Math.abs(Y.retour-1200)<5, 'reçu : '+Y.retour+' (attendu 1200)');
  }
  t('0 erreur JS sur l\'ouverture du fil', es.length===0, es.join(' | '));
  await cs.close();
}

/* ══ BLOC XIX — « PRÉCÉDENT » SE LIT PAR RÔLE, PAS PAR POSITION (15/08/2026) ══
   Capture de Michel en séance : 3 lignes de montée en charge ajoutées par l'app, et la colonne
   Précédent y affichait ses vraies séries de TRAVAIL de la dernière fois. Pire : en insérant 3
   lignes en haut, tout était décalé — sa 1ʳᵉ série de travail (8×58) se comparait à la 4ᵉ d'avant
   (10×60) au lieu de la 1ʳᵉ (10×52), soit 8 kg d'écart sur le repère qui sert à charger la barre. */
{
  console.log('\n── XIX. La colonne « Précédent » se lit par rôle, pas par position ──');
  const Z=await p.evaluate(()=>{
   try{
    const lire=()=>[...document.querySelectorAll('#s-log .set-row')].map(r=>{
      const e=r.querySelector('.sprev'); return e?e.innerText.trim().split('\n')[0]:'?'; });
    const monter=(nom,prevSets,sets)=>{
      S.sessions=[{date:'2026-08-12',exs:[{name:nom,sets:prevSets.map(s=>Object.assign({done:true},s))}]}];
      S.wkt={date:today(),exs:[{name:nom,sets:sets.map(s=>Object.assign({done:false},s))}]};
      _expandedEx=0; goScreen('log'); renderExBlocks(); return lire();
    };
    const o={};
    // ① LE CAS DE MICHEL : la dernière fois = 6 séries de travail ; aujourd'hui = 3 paliers + 3 séries
    o.michel=monter('Développé Couché Haltères',
      [{kg:52,reps:10,type:'N'},{kg:56,reps:10,type:'N'},{kg:60,reps:10,type:'N'},
       {kg:60,reps:10,type:'N'},{kg:60,reps:10,type:'N'},{kg:60,reps:10,type:'N'}],
      [{kg:27.5,reps:5,type:'É'},{kg:37.5,reps:3,type:'É'},{kg:50,reps:2,type:'É'},
       {kg:58,reps:8,type:'N'},{kg:58,reps:8,type:'N'},{kg:60,reps:8,type:'N'}]);
    // ② LE CAS INVERSE : la dernière fois avait des paliers, aujourd'hui non
    o.inverse=monter('Squat à la Barre',
      [{kg:40,reps:5,type:'É'},{kg:70,reps:3,type:'É'},{kg:100,reps:5,type:'N'},{kg:100,reps:5,type:'N'}],
      [{kg:105,reps:5,type:'N'},{kg:105,reps:5,type:'N'}]);
    // ③ NON-RÉGRESSION : aucun échauffement des deux côtés → rien ne doit changer
    o.simple=monter('Rowing Barre',
      [{kg:60,reps:10,type:'N'},{kg:65,reps:10,type:'N'}],
      [{kg:62,reps:10,type:'N'},{kg:67,reps:10,type:'N'}]);
    // ④ REPLI : plus de séries de travail qu'avant → on répète la DERNIÈRE série de travail
    o.repli=monter('Soulevé de Terre',
      [{kg:50,reps:5,type:'É'},{kg:120,reps:5,type:'N'}],
      [{kg:130,reps:5,type:'N'},{kg:130,reps:5,type:'N'},{kg:130,reps:5,type:'N'}]);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(Z.erreur){ t('⛔ la colonne « Précédent » se rend', false, Z.erreur); }
  else{
    t('⭐⭐ les 3 paliers de montée ne réclament plus une série de travail passée',
      Z.michel.slice(0,3).every(x=>x==='—'), 'reçu : '+Z.michel.slice(0,3).join(' · '));
    t('⭐⭐ … et la 1ʳᵉ série de TRAVAIL retrouve la 1ʳᵉ série de travail d\'avant (10×52, pas 10×60)',
      Z.michel[3]==='10×52' && Z.michel[4]==='10×56' && Z.michel[5]==='10×60',
      'reçu : '+Z.michel.slice(3).join(' · '));
    t('⭐ cas inverse : aujourd\'hui sans paliers → on lit le travail d\'avant, pas son échauffement',
      Z.inverse[0]==='100×5'||Z.inverse[0]==='5×100', 'reçu : '+Z.inverse.join(' · '));
    t('⚠️ non-régression : sans échauffement des deux côtés, rien ne change',
      Z.simple[0]==='10×60' && Z.simple[1]==='10×65', 'reçu : '+Z.simple.join(' · '));
    t('⚠️ repli : une série de travail en plus répète la dernière série de TRAVAIL (jamais un palier)',
      Z.repli.every(x=>x==='5×120'), 'reçu : '+Z.repli.join(' · '));
  }
}

/* ══ BLOC XX — ON NE S'ÉCHAUFFE PAS CINQ FOIS DANS LA MÊME SÉANCE (15/08/2026) ══
   Michel : *« il me met de l'échauffement partout c'est normal ? »*. Sur sa séance Push, Milo
   annonçait 19 séries / ~88 min ; l'app en livrait 29 (+10, ~+46 min) — elle défaisait en silence
   la séance courte qu'il venait de demander. Un Pec Deck recevait 3 paliers de montée en charge. */
{
  console.log('\n── XX. La montée en charge ne s\'ajoute pas sur tous les exercices ──');
  const W=await p.evaluate(()=>{
   try{
    const push=()=>({exs:[
      {name:'Développé Couché Larsen',sets:[{kg:50,reps:5,type:'É'},{kg:65,reps:3,type:'É'},{kg:75,reps:2,type:'É'},{kg:83,reps:1,type:'É'},
        {kg:85,reps:5,type:'N'},{kg:85,reps:5,type:'N'},{kg:85,reps:5,type:'N'}]},
      {name:'Développé Incliné Haltères',sets:[{kg:58,reps:8,type:'N'},{kg:58,reps:8,type:'N'},{kg:60,reps:8,type:'N'}]},
      {name:'Pec Deck',sets:[{kg:61,reps:12,type:'N'},{kg:61,reps:12,type:'N'},{kg:61,reps:12,type:'N'}]},
      {name:'Développé Épaules Assis Machine',sets:[{kg:72,reps:10,type:'N'},{kg:72,reps:10,type:'N'},{kg:72,reps:10,type:'N'}]},
      {name:'Tirage Visage',sets:[{kg:27.5,reps:12,type:'N'},{kg:27.5,reps:12,type:'N'},{kg:27.5,reps:12,type:'N'}]}
    ]});
    const nEch=e=>(e.sets||[]).filter(s=>s.type==='É'||s.type==='W').length;
    const tot=s=>s.exs.reduce((a,e)=>a+e.sets.length,0);
    const r=_completerMonteeEnCharge(push());
    const o={ total:tot(r), incline:nEch(r.exs[1]), pecdeck:nEch(r.exs[2]), larsen:nEch(r.exs[0]) };
    // ⚠️ un accessoire placé AVANT l'ancre ne doit PAS supprimer la montée de l'ancre
    const inverse=_completerMonteeEnCharge({exs:[
      {name:'Pec Deck',sets:[{kg:61,reps:12,type:'N'}]},
      {name:'Développé Couché',sets:[{kg:100,reps:5,type:'N'},{kg:100,reps:5,type:'N'}]}
    ]});
    o.ancreApresAccessoire=nEch(inverse.exs[1]);
    // ⚠️ non-régression : un squat lourd seul garde sa montée complète
    const squat=_completerMonteeEnCharge({exs:[{name:'Squat à la Barre',sets:[{kg:120,reps:5,type:'N'},{kg:120,reps:5,type:'N'}]}]});
    o.squatSeul=nEch(squat.exs[0]);
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(W.erreur){ t('⛔ la montée en charge se calcule', false, W.erreur); }
  else{
    t('⭐⭐ la séance Push de Michel ne gonfle plus de 19 à 29 séries',
      W.total===23, 'reçu : '+W.total+' séries (19 annoncées par Milo, 29 avant le correctif)');
    t('⭐⭐ le Pec Deck (isolation) ne reçoit AUCUNE montée en charge',
      W.pecdeck===0, 'reçu : '+W.pecdeck+' paliers');
    t('⭐ le développé incliné n\'est pas ré-échauffé (déjà chaud sur ce mouvement)',
      W.incline===0, 'reçu : '+W.incline+' paliers');
    t('⚠️ non-régression : l\'ancre du jour garde bien sa montée complétée',
      W.larsen===5, 'reçu : '+W.larsen+' paliers');
    t('⚠️ un accessoire AVANT l\'ancre ne supprime pas la montée de l\'ancre (une montée manquante coûte plus cher qu\'une de trop)',
      W.ancreApresAccessoire>=2, 'reçu : '+W.ancreApresAccessoire+' paliers');
    t('⚠️ non-régression : un squat lourd seul garde sa montée complète',
      W.squatSeul>=2, 'reçu : '+W.squatSeul+' paliers');
  }
}

/* ══ BLOC XXI — LE DÉCOMPTE FINAL SURVIT AU GEL DES MINUTEURS (15/08/2026) ══
   Michel : *« si je ne suis pas dans l'application… je n'ai pas le chrono final de 10 à zéro, et
   donc je ne peux pas cliquer sur GO »*. Le décompte ne s'ouvrait que si un tick tombait EXACTEMENT
   sur la 10ᵉ seconde ; en arrière-plan le navigateur gèle les minuteurs, on sort à 40 s et on
   revient à 6 — la valeur 10 n'est jamais passée, et le repos se termine en silence. */
{
  console.log('\n── XXI. Le décompte final des 10 s quand on sort de l\'application ──');
  const V=await p.evaluate(()=>{
   try{
    const vu=()=>{const o=document.getElementById('ov-rest-countdown');return !!(o&&o.style.display==='block');};
    const num=()=>{const n=document.getElementById('rcd-num');return n?n.textContent:'';};
    const raz=()=>{ stopRest(); if(typeof _closeRestCountdown==='function')_closeRestCountdown(); };
    const o={};
    if(!S.wkt)startWorkout();
    if(!S.wkt.exs.length)S.wkt.exs.push({name:'Squat à la Barre',sets:[{kg:100,reps:5,type:'N'},{kg:100,reps:5,type:'N'}]});
    goScreen('log');
    // ① NON-RÉGRESSION : le tick tombe pile sur 10 → décompte, comme avant
    raz(); startRest(130); restStartTs=Date.now()-120*1000; _restTick();
    o.pile10=vu(); o.num10=num();
    // ② NON-RÉGRESSION : à 40 s restantes, RIEN ne s'ouvre
    raz(); startRest(130); restStartTs=Date.now()-90*1000; _restTick();
    o.a40=vu();
    // ③ LE CAS DE MICHEL : minuteurs gelés, aucun tick entre 40 s et 6 s
    o.avant=vu();                                  // (toujours à 40 s : rien)
    restStartTs=Date.now()-124*1000; _restTick();   // 1er tick au retour dans l'app
    o.retour6=vu(); o.num6=num();
    // ④ … et il va bien jusqu'au GO, donc il y a quelque chose à taper
    restStartTs=Date.now()-131*1000; _restTick();
    o.go=num();
    // ⑤ un repos DÉJÀ terminé n'ouvre pas un « GO » en retard (le dépassement se lit au chrono)
    raz(); startRest(130); restStartTs=Date.now()-200*1000; _restTick();
    o.tropTard=vu();
    // ⑥ le retour au premier plan resynchronise AUSSI hors de l'écran Séance (ex. discussion avec Milo)
    raz(); goScreen('coach'); startRest(130); restStartTs=Date.now()-124*1000;
    o.avantEvt=vu();                                // rien tant qu'aucun tick n'a eu lieu
    document.dispatchEvent(new Event('visibilitychange'));
    o.apresEvt=vu();                                // le retour au premier plan doit suffire
    raz(); goScreen('home');
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(V.erreur){ t('⛔ le décompte de repos se rend', false, V.erreur); }
  else{
    t('⚠️ non-régression : un tick pile sur 10 s ouvre le décompte', V.pile10===true && V.num10==='10', 'reçu : '+V.num10);
    t('⚠️ non-régression : à 40 s restantes, aucun décompte', V.a40===false);
    t('⭐⭐ minuteurs gelés (hors de l\'app) : on revient à 6 s et le décompte s\'ouvre quand même',
      V.retour6===true && V.num6==='6', 'reçu : '+(V.retour6?V.num6:'AUCUN DÉCOMPTE'));
    t('⭐⭐ … et il va jusqu\'au GO, donc il y a bien quelque chose à taper', V.go==='GO', 'reçu : '+V.go);
    t('⚠️ un repos déjà fini depuis longtemps n\'affiche PAS un GO en retard', V.tropTard===false);
    t('⭐ le retour au premier plan resynchronise aussi depuis l\'écran Coach',
      V.avantEvt===false && V.apresEvt===true, 'avant : '+V.avantEvt+' · après : '+V.apresEvt);
  }
}

/* ══ BLOC XXII — UNE MISE À JOUR NE COUPE PAS LE RÉCAPITULATIF DE FIN DE SÉANCE (15/08/2026) ══
   Michel, en rentrant de la salle : *« putain la mise à jour s'est faite au moment où j'ai terminé
   ma séance, donc j'ai pas vu mon récapitulatif »*. Le garde-fou « ne pas recharger en pleine
   séance » se relâchait à la milliseconde où S.wkt se vide — c'est-à-dire juste avant que l'écran
   de fin s'ouvre. Le garde-fou protégeait la SAISIE, pas la RESTITUTION.
   ⚠️ On teste la DÉCISION (`_majPeutSAppliquer`), pas le rechargement : recharger la page en plein
   test ne prouverait rien et casserait le scénario. */
{
  console.log('\n── XXII. La mise à jour attend un moment neutre ──');
  const U=await p.evaluate(()=>{
   try{
    if(typeof _majPeutSAppliquer!=='function') return {erreur:'_majPeutSAppliquer absente'};
    const ov=document.getElementById('ov-session-end');
    const o={};
    window._swReloadPending=true;
    // ① séance EN COURS → on n'interrompt pas (non-régression du garde-fou d'origine)
    S.wkt={date:today(),exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,type:'N',done:false}]}]};
    goScreen('home'); o.pendantSeance=_majPeutSAppliquer();
    // ② séance terminée MAIS le récapitulatif est à l'écran → on attend
    S.wkt=null; if(ov)ov.classList.add('open');
    o.pendantRecap=_majPeutSAppliquer();
    // ③ récapitulatif fermé, mais la personne est partie lire le Coach → on attend
    if(ov)ov.classList.remove('open'); goScreen('coach');
    o.surCoach=_majPeutSAppliquer();
    // ④ de retour à l'accueil, rien en cours → c'est le moment
    // ⚠️ on pose l'écran DIRECTEMENT : passer par goScreen() appliquerait vraiment la mise à jour
    // (donc rechargerait la page en plein test). Ce qu'on veut mesurer, c'est la DÉCISION.
    window._curScreen='home'; o.surAccueil=_majPeutSAppliquer();
    // ⑤ et rien ne s'applique si aucune mise à jour n'attend
    window._swReloadPending=false; o.sansMaj=_majPeutSAppliquer();
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(U.erreur){ t('⛔ la décision de mise à jour existe', false, U.erreur); }
  else{
    t('⚠️ non-régression : pendant une séance, aucune mise à jour', U.pendantSeance===false);
    t('⭐⭐ le récapitulatif de fin de séance n\'est plus coupé par la mise à jour', U.pendantRecap===false);
    t('⭐ on ne recharge pas non plus pendant qu\'on lit le Coach', U.surCoach===false);
    t('⭐ de retour à l\'accueil, rien en cours : la mise à jour s\'applique', U.surAccueil===true);
    t('⚠️ sans mise à jour en attente, il ne se passe rien', U.sansMaj===false);
  }
  try{ await p.evaluate(()=>{ S.wkt=null; window._swReloadPending=false; }); }catch(e){}
}

/* ══ BLOC XXIII — L'APP NE REPROCHE PAS SA PROPRE MONTÉE EN CHARGE (15/08/2026) ══
   Dans son débrief, Milo reprochait à Michel une montée en charge « démarrée à 36 kg au lieu de
   28 » sur le développé incliné — montée que l'APP avait ajoutée elle-même (note « ⚡ Montée en
   charge ajoutée par l'app » sur sa capture). Le verdict part du contexte envoyé à Milo. */
{
  console.log('\n── XXIII. Le reproche sur la montée en charge ──');
  const X23=await p.evaluate(()=>{
   try{
    // ⚠️ on lit la LIGNE de l'exercice, pas tout le contexte : l'historique du parcours contient
    // d'autres séances, et un reproche légitime ailleurs ferait passer le témoin au vert pour une
    // mauvaise raison. Un test qui regarde au mauvais endroit est pire qu'un test absent.
    const ctx=(exs,motif,extra)=>{ S.sessions=[Object.assign({date:today(),ts:Date.now(),volume:1000,exs:exs},extra||{})];
      const lignes=buildCoachContext().split('\n').filter(l=>l.indexOf(motif)>=0);
      return lignes.join(' ¶ '); };
    const monte=[{kg:36,reps:5,type:'É',done:true},{kg:46,reps:3,type:'É',done:true},{kg:56,reps:5,type:'É',done:true}];
    const trav=[{kg:60,reps:8,type:'N',done:true},{kg:60,reps:8,type:'N',done:true}];
    const o={};
    // ① montée écrite par la PERSONNE et vraiment bancale → le verdict reste (c'est utile)
    o.perso=/montée en charge insuffisante/.test(ctx([{name:'Développé Incliné Haltères',sets:monte.concat(trav)}],'Développé Incliné Haltères:'));
    // ② EXACTEMENT la même, mais ajoutée par l'app → aucun reproche
    o.parLApp=/montée en charge insuffisante/.test(ctx([{name:'Développé Incliné Haltères',_montee:true,sets:monte.concat(trav)}],'Développé Incliné Haltères:'));
    // ③ un accessoire (Pec Deck) n'est plus jugé — même règle que le générateur (ft-v858)
    o.pecDeck=/montée en charge insuffisante/.test(ctx([{name:'Pec Deck',sets:
      [{kg:45,reps:5,type:'É',done:true}].concat([{kg:61,reps:12,type:'N',done:true}])}],'Pec Deck:'));
    /* 💬 LES ANNOTATIONS DE SÉRIE (15/08/2026) — Michel : « il ne lit pas les notes qu'on peut
       faire ; sur la 4ᵉ série j'ai mis que j'avais dû poser la barre au support à la 4ᵉ rep ».
       Sans elle, « 85×5 » se lit comme une série propre : ce n'est pas la même séance. */
    const l=ctx([{name:'Développé Couché',sets:[
      {kg:85,reps:5,type:'N',done:true},
      {kg:85,reps:5,type:'N',done:true,note:'posé la barre au support à la 4e rep, repris pour la 5e'}
    ]}],'Développé Couché:');
    o.noteVue=/posé la barre au support/.test(l);
    o.ligne=l.slice(0,200);
    /* 🏃 LE CARDIO (15/08/2026) — Michel : « j'ai l'impression qu'il n'a pas tenu compte de mon
       cardio ». La donnée est bien transmise depuis le 02/08 ; c'est la CONSIGNE du débrief qui ne
       la nommait pas. On vérifie les deux : la ligne de séance, et le texte de la consigne. */
    const _ex1=[{name:'Développé Couché',sets:[{kg:85,reps:5,type:'N',done:true}]}];
    const lcSans=ctx(_ex1,'Développé Couché:');
    const lcAvec=ctx(_ex1,'Développé Couché:',{cardioAvant:{type:'ellip',duration:8,intensity:'modere'}});
    o.cardioLigne=/cardio/.test(lcAvec) && !/cardio/.test(lcSans);
    o.cardioDetail=lcAvec.slice(-90);
    o.cardioConsigne=(typeof _seCardioTxt==='function')
      ? [_seCardioTxt({cardioAvant:{type:'ellip',duration:8}}), _seCardioTxt({})] : ['(absente)',''];
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(X23.erreur){ t('⛔ le contexte de Milo se construit', false, X23.erreur); }
  else{
    t('⚠️ non-régression : une montée bancale NOTÉE PAR LA PERSONNE est toujours signalée', X23.perso===true);
    t('⭐⭐ la même montée, ajoutée par l\'app, n\'est PAS reprochée', X23.parLApp===false);
    t('⭐ un accessoire n\'est plus jugé sur sa montée (même règle que le générateur)', X23.pecDeck===false);
    t('⭐⭐ l\'annotation écrite sur une série atteint enfin Milo', X23.noteVue===true, 'ligne reçue : '+X23.ligne);
    t('⚠️ non-régression : le cardio de la séance est bien dans la ligne envoyée', X23.cardioLigne===true, 'fin de ligne : '+X23.cardioDetail);
    t('⭐⭐ la consigne du débrief NOMME le cardio quand il y en a un',
      /8 min/.test(String(X23.cardioConsigne[0])), 'reçu : '+X23.cardioConsigne[0]);
    t('⭐ … et ne dit RIEN quand il n\'y en a pas (jamais reprocher une absence)',
      X23.cardioConsigne[1]==='', 'reçu : "'+X23.cardioConsigne[1]+'"');
  }
  try{ await p.evaluate(()=>{ S.sessions=[]; }); }catch(e){}
}

/* ══ BLOC XXIV — LES CHARGES PROPOSÉES DOIVENT EXISTER DANS UNE SALLE (15/08/2026) ══
   Michel : « il met 82,5 ; dans une salle c'est chiant de trouver les poids de 1,25, je perds du
   temps de fou. Ensuite les haltères : 27,5 n'existe pas tout simplement. »
   Les pas viennent de SES données : toutes ses charges d'haltères à deux bras sont des multiples
   de 4 (2 kg par haltère), ses barres et machines tournent à 5. */
{
  console.log('\n── XXIV. Les charges de la montée en charge sont chargeables ──');
  const P=await p.evaluate(()=>{
   try{
    if(typeof _pasCharge!=='function') return {erreur:'_pasCharge absente'};
    const o={pas:{}, trous:[], horsPas:[], hausse:[]};
    o.pas.barre=_pasCharge('Squat à la Barre');
    o.pas.halteres=_pasCharge('Développé Incliné Haltères');
    o.pas.uni=_pasCharge('Rowing Haltère (Tirage Horizontal)');
    o.pas.machine=_pasCharge('Pec Deck');
    for(const n of ['Squat à la Barre','Développé Incliné Haltères','Rowing Haltère (Tirage Horizontal)','Pec Deck']){
      const pas=_pasCharge(n);
      for(let T=40;T<=200;T+=pas){
        const m=_monteeEnCharge(T,pas);
        if(!m.length){ o.trous.push(n+' @'+T); continue; }
        // toutes les charges doivent être des multiples du pas
        if(m.some(x=>Math.abs(x.kg/pas-Math.round(x.kg/pas))>1e-9)) o.horsPas.push(n+' @'+T+' → '+m.map(x=>x.kg).join('/'));
        // et jamais AU-DESSUS de ce que l'arrondi exact aurait donné (on arrondit vers le bas)
        if(m.some(x=>x.kg>=T)) o.hausse.push(n+' @'+T);
      }
    }
    o.exemple85=_monteeEnCharge(85,_pasCharge('Développé Couché')).map(x=>x.kg).join('/');
    o.exempleHalt=_monteeEnCharge(60,_pasCharge('Développé Incliné Haltères')).map(x=>x.kg).join('/');
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(P.erreur){ t('⛔ le pas de charge existe', false, P.erreur); }
  else{
    t('⭐⭐ le pas vient du MATÉRIEL : barre 5 · haltères 2 bras 4 · haltère 1 bras 2 · machine 5',
      P.pas.barre===5 && P.pas.halteres===4 && P.pas.uni===2 && P.pas.machine===5, JSON.stringify(P.pas));
    t('⭐⭐ aucune charge proposée n\'est impossible à charger (40 → 200 kg, 4 matériels)',
      P.horsPas.length===0, P.horsPas.slice(0,3).join(' | '));
    t('⚠️ non-régression : il y a toujours une montée pour chaque charge (aucun trou)',
      P.trous.length===0, P.trous.slice(0,5).join(' | '));
    t('⚠️ un palier ne dépasse jamais la charge de travail', P.hausse.length===0, P.hausse.slice(0,3).join(' | '));
    t('⭐ 85 kg à la barre → que des multiples de 5', /^(\d+\/)*\d+$/.test(P.exemple85) && P.exemple85.split('/').every(v=>+v%5===0), 'reçu : '+P.exemple85);
    t('⭐ 60 kg en haltères → que des multiples de 4 (2 kg par haltère)',
      P.exempleHalt.split('/').every(v=>+v%4===0), 'reçu : '+P.exempleHalt);
  }
}

await b.close(); srv.close();

console.log('\n════ TOTAL CROISÉ : '+ok+' ✅ · '+ko+' ❌ ════');
process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
