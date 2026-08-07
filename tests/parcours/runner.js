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
    if(u.includes('storeHealth')) return J(nom==='ok'
      ? {status:'ok',pourcentPlein:41,totalOctets:210000,nbCles:38,testEcriture:'ok'}
      : {status:'ok',pourcentPlein:102,totalOctets:524000,nbCles:44,testEcriture:'ECHEC: quota'});
    if(u.includes('checkBackup')) return J(nom==='ok'
      ? {status:'ok',triggersInstalled:1,fileCount:34,lastFiles:['backup-'+auj+'.json']}
      : {status:'ok',triggersInstalled:0,fileCount:12,lastFiles:['backup-2026-07-20.json']});
    if(u.includes('mailFails')) return J(nom==='ok'
      ? {status:'ok',fails:[],quotaRestant:98} : {status:'ok',fails:[{d:'a'},{d:'b'}]});
    if(u.includes('aiUsage')) return J({status:'ok',used:127,limit:1000});
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
    hOk.verts===6&&hOk.rouges===0, JSON.stringify(hOk).slice(0,200));
  t('⭐ la carte montre la ligne « Historiques protégés » (le garde-fou zéro perte)',
    /Historiques protégés/.test(hOk.txt), hOk.txt.slice(0,160));
  t('⭐ un déploiement RATÉ est visible (il ne prévient personne autrement)',
    /ÉCHEC/.test(hKo.txt)&&/tes changements ne partent pas/.test(hKo.txt),
    JSON.stringify(hKo).slice(0,240));
  t('témoin : quand les 2 déploiements passent, la ligne est verte',
    /Le site.*OK/.test(hOk.txt)&&/Le serveur.*OK/.test(hOk.txt), hOk.txt.slice(-170));
  t('⭐ la panne du 29/07 (stockage plein, écriture impossible) serait VUE',
    hKo.rouges>=1&&/102 %/.test(hKo.txt)&&/ÉCRITURE IMPOSSIBLE/.test(hKo.txt),
    JSON.stringify(hKo).slice(0,200));
  t('sauvegardes arrêtées et mails en échec sont signalés en rouge',
    hKo.rouges===4&&/AUCUNE programmation/.test(hKo.txt)&&/2 échecs/.test(hKo.txt),
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

// ═══ LE CATALOGUE N'EST ENVOYÉ QUE QUAND IL SERT (ft-v764) ═══════════════════════════════
// Mesuré le 04/08 en exécutant l'app : le contexte fait 60 085 caractères et part EN ENTIER
// à chaque message ; le catalogue d'exercices en pèse 9 507 (16 %), le plus gros bloc du
// prompt. Il ne sert à rien quand la personne écrit « j'ai mal dormi ».
// ⚠️ CE QUE CE TEST PROTÈGE, ET C'EST L'ESSENTIEL : l'erreur n'est PAS symétrique (R29).
// Envoyer le catalogue pour rien ne coûte que des caractères ; l'OUBLIER quand Milo
// construit une séance lui fait nommer un exercice que l'app ne reconnaît pas — le bug que
// ft-v713 avait corrigé (R8). Donc on vérifie D'ABORD les faux négatifs, jamais l'inverse.
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
    const manquesSuite = SUITE.filter(m=>!_ctxEntrainement(m));
    coachHistory.length=0;
    coachHistory.push({role:'user',content:'a'},{role:'assistant',content:'b'});
    return {
      manquesSuite,
      manques: DOIT.filter(m=>!_ctxEntrainement(m)),
      retires: HORS.filter(m=>!_ctxEntrainement(m)).length,
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
  t('⭐ PROMPT : le catalogue est TOUJOURS envoyé dès qu\'il peut servir (10 messages témoins)',
    Array.isArray(r.manques) && r.manques.length===0, JSON.stringify(r.manques||r));
  t('⭐⭐ PROMPT : la CONVERSATION EN COURS compte, pas le seul message (« tu me changes ça ? »)',
    Array.isArray(r.manquesSuite) && r.manquesSuite.length===0, JSON.stringify(r.manquesSuite||r));
  t('PROMPT : il est retiré sur un message franchement hors sujet',
    r.retires===2, JSON.stringify(r));
  t('PROMPT : le gain est réel (> 5 000 caractères en moins)',
    (r.avec-r.sans)>5000, 'avec='+r.avec+' sans='+r.sans);
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
  t('⭐⭐ PROMPT : les blocs « construire une séance » voyagent AVEC le catalogue (jamais l\'un sans l\'autre)',
    r.coherence && r.coherence.chaud.seance===true && r.coherence.chaud.cat===true
                && r.coherence.froid.seance===false && r.coherence.froid.cat===false,
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
    o.series=a?a.sess.exs[0].sets.length:0; o.kg=a?a.sess.exs[0].sets[0].kg:null;
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
  t('les séries et la charge sont lues (4 séries, 60 kg)', r.series===4&&r.kg===60, JSON.stringify(r));
  t('TÉMOIN : une simple conversation ne propose aucune séance', r.bavardage===true, JSON.stringify(r));
  t('TÉMOIN : une seule ligne ne fait pas une séance', r.uneLigne===true, JSON.stringify(r));
  t('⭐ un exercice hors catalogue garde SON nom, il n\'est pas inventé', r.gardeLeNom===true, JSON.stringify(r));
  t('⭐ 0 RÉGRESSION : le bloc caché reste prioritaire quand Milo le fournit',
    r.jsonPrioritaire===true, JSON.stringify(r));
  await c16.close();
}

await b.close(); srv.close();

console.log('\n════ TOTAL CROISÉ : '+ok+' ✅ · '+ko+' ❌ ════');
process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
