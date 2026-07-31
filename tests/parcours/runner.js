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
  out.prix=ov.textContent.includes('4,99');
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

await b.close(); srv.close();
console.log('\n════ TOTAL CROISÉ : '+ok+' ✅ · '+ko+' ❌ ════');
process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
