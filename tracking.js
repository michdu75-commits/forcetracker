// ═══ VERROU SANTÉ — protéger son compte est OBLIGATOIRE pour les données de santé ═══
// Décision de Michel, 04/08/2026 : « à partir du moment qu'une personne veut mettre dans
// l'application une donnée santé, il doit protéger son compte obligatoirement ».
//
// POURQUOI CE DÉCOUPAGE, et pas un mot de passe pour tout le monde. Le code d'accès existe
// depuis longtemps mais il est OPTIONNEL — et une protection optionnelle n'est pas une
// protection, c'est une possibilité : sans code, `_authCheck_` côté serveur répond « autorisé »
// et `loadProfile` sert le compte entier à qui connaît l'adresse e-mail.
// Imposer un code à tout le monde ferait fuir quelqu'un venu noter trois séries de squat
// (et casserait l'ouverture instantanée, règle d'or #4). Mais quelqu'un qui importe un BILAN
// SANGUIN comprend immédiatement pourquoi on lui demande de verrouiller. C'est R29 : le droit
// de deviner — ici, d'être laxiste — dépend du COÛT DE L'ERREUR, et il monte d'un cran dès que
// la donnée devient médicale.
//
// ⚠️ EN CAS DE DOUTE, ON BLOQUE. Un verrou qui s'ouvre quand il n'arrive pas à vérifier n'est
// pas un verrou. Mais on ne bloque JAMAIS sans dire pourquoi ni comment en sortir (R24).
// La réponse « ce compte a un code » est mémorisée localement : une fois protégé, plus aucun
// appel réseau n'est nécessaire — l'app reste utilisable hors ligne.
function _healthLockKnown(){ try{ return localStorage.getItem('ft4_hascode')==='1'; }catch(e){ return false; } }
function _healthLockRemember(){ try{ localStorage.setItem('ft4_hascode','1'); }catch(e){} }
async function _healthGate(){
  if(_healthLockKnown())return true;
  if(!S.email){ _healthLockMsg('email'); return false; }
  let d=null;
  try{ d=await _protectPost({action:'authStatus',email:S.email}); }catch(e){ d=null; }
  if(d&&d.status==='ok'&&d.hasCode){ _healthLockRemember(); return true; }
  // ⚠️ « pas de code » et « pas pu joindre le serveur » ne se confondent pas : on bloque dans
  // les deux cas, mais on ne raconte pas la même chose à la personne.
  _healthLockMsg((d&&d.status==='ok')?'nocode':'offline');
  return false;
}
function _healthLockMsg(cas){
  const o=document.getElementById('ov-health-lock'); if(!o)return;
  const t=document.getElementById('health-lock-txt');
  const b=document.getElementById('health-lock-btn');
  if(t){
    t.innerHTML = cas==='email'
      ? 'Pour protéger ton compte, il faut d\'abord renseigner ton <b>adresse e-mail</b> dans le Profil — c\'est elle qui reçoit le code de vérification.'
      : cas==='offline'
      ? 'Impossible de vérifier si ton compte est protégé (pas de réseau). Par précaution, on n\'enregistre pas de donnée de santé tant qu\'on n\'en est pas sûr. <b>Réessaie quand tu as du réseau.</b>'
      : 'Les données de santé — bilan sanguin, bilan corporel — sont ce que tu as de plus personnel dans l\'application.<br><br>Tant que ton compte n\'a pas de <b>code d\'accès</b>, elles ne sont pas verrouillées côté serveur. <b>On te demande donc de le protéger avant de les enregistrer.</b><br><br>Ça prend 30 secondes : tu reçois un code par e-mail pour confirmer ton adresse, puis tu choisis ton propre code. Personne ne peut le lire, pas même moi — il est chiffré.';
  }
  if(b)b.style.display=(cas==='offline')?'none':'';
  o.classList.add('open');
}
function closeHealthLock(){const o=document.getElementById('ov-health-lock');if(o)o.classList.remove('open');}
function goProtectFromHealth(){ closeHealthLock(); if(typeof openProtect==='function')openProtect(); }
/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── NORMALISATION AVANT SYNC ────────────────────────────────
// Construit les rows pour handleLogSession_ en assurant que chaque champ
// est du bon type et a une valeur par défaut valide.
// Appliqué à TOUTE séance, quelle qu'en soit l'origine (saisie normale,
// brouillon récupéré, import, ancienne version de l'app).
function _buildSyncRows(sess){
  const today_=today();   // date du TÉLÉPHONE (ft-v655) : une séance finie à 00 h 30 était datée de la veille
  const date=typeof sess.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(sess.date)?sess.date:today_;
  const bw=isFinite(Number(S.bw))&&Number(S.bw)>0?Number(S.bw):0;
  const gender=S.gender==='F'?'F':'H';
  const age=isFinite(Number(S.age))&&Number(S.age)>0?Number(S.age):25;
  const rows=[];
  (sess.exs||[]).forEach(ex=>{
    const name=(typeof ex.name==='string'&&ex.name.trim()?ex.name.trim():'Exercice').substring(0,150);
    (ex.sets||[]).forEach((s,i)=>{
      if(!s.done)return;
      const kg=isFinite(Number(s.kg))&&Number(s.kg)>=0?Math.round(Number(s.kg)*10)/10:0;
      const reps=isFinite(Number(s.reps))&&Number(s.reps)>=0?Math.round(Number(s.reps)):0;
      const type=['N','W','E','D'].includes(String(s.type||'').toUpperCase())?String(s.type).toUpperCase():'N';
      const rm1Raw=Number(s.rm1);
      const rm1=isFinite(rm1Raw)&&rm1Raw>0?String(fmt(rm1Raw)):'';
      rows.push({date,exercise:name,set_num:i+1,type,kg,reps,volume:kg*reps,rm1,bw,gender,age});
    });
  });
  return rows;
}

/* ─── GOOGLE SHEETS SYNC ──────────────────────────────────────
   ⭐ L'EMAIL PART DEPUIS ft-v1018, ET IL PART UNE SEULE FOIS. Avant, la ligne écrite dans le
   classeur ne portait AUCUN identifiant : les séances de tous les testeurs s'empilaient dans
   le même onglet `Sessions` sans qu'on puisse savoir qui est qui — le classeur existe pour
   être lu, et il ne pouvait pas l'être.
   ⛔ Il est posé sur l'ENVELOPPE, pas sur chaque ligne (R2) : une séance de 20 séries n'a pas
   à répéter 20 fois la même information. C'est le serveur qui l'étale sur les lignes, parce
   qu'un tableur en a besoin colonne par colonne — et il le fait à UN seul endroit. */
async function syncSheets(sess){
  if(window._demoMode)return{ok:true}; // mode démo : rien n'est envoyé aux Sheets
  if(!S.url)return{ok:false,error:'URL manquante'};
  try{
    const rows=_buildSyncRows(sess);
    const ctrl=new AbortController();
    const tId=setTimeout(()=>ctrl.abort(),8000);
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',signal:ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'logSession',rows,bw:S.bw,date:sess.date,gender:S.gender,age:S.age,email:S.email||''})});
    clearTimeout(tId);
    let rawText='';
    try{rawText=await resp.text();}catch(_){rawText='(body illisible)';}
    console.log('[FT syncSheets]',sess.date,'HTTP',resp.status,rawText.substring(0,300));
    let data;
    try{data=JSON.parse(rawText);}catch(_){return{ok:false,error:'Réponse non-JSON (HTTP '+resp.status+'): '+rawText.substring(0,80)};}
    if(data&&data.status==='ok')return{ok:true,error:null};
    return{ok:false,error:data&&data.error?data.error:'status='+(data&&data.status||'?')};
  }catch(e){
    console.warn('[FT syncSheets] échec:',e.message);
    return{ok:false,error:e.name==='AbortError'?'Timeout (8s)':e.message};
  }
}

// ─── FILE D'ATTENTE SYNC SHEETS ──────────────────────────────
// Resynchro des séances non confirmées (synced:false)
// Appelé au démarrage, au retour en ligne, et via bouton Resynchroniser
async function _retrySheetQueue(){
  if(!S.url||!S.email)return;
  const toSync=(S.sessions||[]).filter(s=>s.synced===false);
  if(!toSync.length){console.log('[FT retry] File vide — tout est OK');_updateAdminSyncInfo();return;}
  console.log('[FT retry]',toSync.length,'séance(s) en attente');
  let synced=0;const errors=[];
  for(const sess of toSync){
    const res=await syncSheets(sess);
    if(res.ok){sess.synced=true;synced++;}
    else errors.push({date:sess.date,error:res.error||'erreur inconnue'});
  }
  if(synced>0){
    try{localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,1500)));}catch(e){}
  }
  _updateAdminSyncInfo(errors);
  if(synced>0&&errors.length===0)toast('☁️ '+synced+' séance'+(synced>1?'s':'')+' synchronisée'+(synced>1?'s':'')+' !','success');
  else if(synced>0)toast('☁️ '+synced+'/'+(synced+errors.length)+' séances sync — '+errors.length+' échec(s)','info');
  else if(errors.length>0)toast('❌ Sync : '+errors[0].error.substring(0,60),'error');
}

function _countUnsyncedSessions(){return(S.sessions||[]).filter(s=>s.synced===false).length;}

function _updateAdminSyncInfo(errors){
  const el=document.getElementById('admin-sync-info');if(!el)return;
  const n=_countUnsyncedSessions();
  const total=(S.sessions||[]).length;
  let html=n===0
    ?'<span style="color:var(--green)">✅ Tout synchronisé ('+total+' séance'+(total>1?'s':'')+')</span>'
    :'<span style="color:var(--gold)">⚠️ '+n+' séance'+(n>1?'s':'')+' non synchronisée'+(n>1?'s':'')+' / '+total+'</span>';
  if(errors&&errors.length)
    html+='<br><span style="color:var(--red);font-size:11px;">'+errors.map(e=>e.date+' : '+e.error).join(' | ')+'</span>';
  else if(n>0)
    html+='<br><span style="color:var(--t3);font-size:11px;">Appuie sur Resynchroniser pour réessayer.</span>';
  el.innerHTML=html;
}

// ─── TOAST ───────────────────────────────────────────────────
let _tt;
function toast(msg,type='info'){const t=document.getElementById('toast');t.textContent=msg;t.className=type+' show';clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),2800);}


// ─── CYCLE DE FORCE ──────────────────────────────────────────
const CYCLE_EXS = ['Squat à la Barre','Développé Couché','Soulevé de Terre','Développé Militaire'];

function phaseDistrib(totalWeeks) {
  const del  = Math.max(1, Math.round(totalWeeks * 0.08));
  const work = totalWeeks - del;
  const acc  = Math.round(work * 0.42);
  const int_ = Math.round(work * 0.33);
  const peak = work - acc - int_;
  return { acc, int: int_, peak, del };
}

function getWeekPlan(weekNum, totalWeeks) {
  const d = phaseDistrib(totalWeeks);
  let phase, sets, reps, pct, cls;
  if (weekNum <= d.acc) {
    const prog = (weekNum - 1) / Math.max(d.acc - 1, 1);
    phase = 'Accumulation'; cls = 'ph-acc'; sets = 4; reps = 8;
    pct = Math.round(70 + prog * 7.5);
  } else if (weekNum <= d.acc + d.int) {
    const prog = (weekNum - d.acc - 1) / Math.max(d.int - 1, 1);
    phase = 'Intensification'; cls = 'ph-int'; sets = 4; reps = 5;
    pct = Math.round(80 + prog * 7.5);
  } else if (weekNum <= d.acc + d.int + d.peak) {
    const prog = (weekNum - d.acc - d.int - 1) / Math.max(d.peak - 1, 1);
    phase = 'Peak'; cls = 'ph-peak'; sets = 3; reps = 2;
    pct = Math.round(90 + prog * 7.5);
  } else {
    phase = 'Décharge'; cls = 'ph-del'; sets = 2; reps = 5; pct = 55;
  }
  return { phase, cls, sets, reps, pct };
}

function round25(kg) { return Math.round(kg / 2.5) * 2.5; }

function projectRM(rm1, totalWeeks) {
  const age = S.age || 30;
  const lvlIdx = Math.min(4, Math.max(0,
    S.prs['Squat à la Barre'] ? (S.prs['Squat à la Barre'].rm1 / (S.bw||80) > 1.5 ? 3 : S.prs['Squat à la Barre'].rm1 / (S.bw||80) > 1.25 ? 2 : S.prs['Squat à la Barre'].rm1 / (S.bw||80) > 1.0 ? 1 : 0) : 0
  ));
  const baseRate = [0.009, 0.007, 0.005, 0.003, 0.002][lvlIdx];
  const ageMult  = age < 30 ? 1.1 : age < 40 ? 1.0 : age < 50 ? 0.80 : age < 60 ? 0.65 : 0.50;
  const gain = baseRate * ageMult * totalWeeks;
  return fmt(rm1 * (1 + gain));
}

function getCurrentCycleWeek() {
  if (!S.cycle || !S.cycle.startDate) return 1;
  const start = new Date(S.cycle.startDate);
  const now = new Date();
  const w = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(Math.max(1, w), S.cycle.weeks);
}

function updCycleWeeks(v) {
  document.getElementById('cycle-weeks-disp').textContent = v;
  const d = phaseDistrib(parseInt(v));
  document.getElementById('cycle-phase-preview').textContent =
    `Accumulation: ${d.acc}s · Intensification: ${d.int}s · Peak: ${d.peak}s · Décharge: ${d.del}s`;
  renderCycleProjections(parseInt(v));
}

function renderCycleSetup() {
  // Fill 1RM inputs
  const inp = document.getElementById('cycle-rm-inputs');
  if (!inp) return;
  inp.innerHTML = CYCLE_EXS.map(ex => {
    const pr = S.prs[ex];
    const rm = pr ? fmt(pr.rm1) : '';
    const ph = ex === 'Squat à la Barre' ? '120' : ex === 'Développé Couché' ? '90' : ex === 'Soulevé de Terre' ? '140' : '65';
    return `<div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:13px;font-weight:600;flex:1;">${ex}</span>
      <input type="text" id="rm-inp-${ex.replace(/ /g,'_')}" value="${rm}" placeholder="${ph}" inputmode="decimal" step="0.5" style="width:90px;text-align:center;padding:8px;" oninput="renderCycleProjections()">
      <span style="font-size:12px;color:var(--t3);">kg</span>
    </div>`;
  }).join('');
  updCycleWeeks(parseInt(document.getElementById('cycle-weeks-slider')?.value || 12));
}

function getCycleInputRM(ex) {
  const el = document.getElementById('rm-inp-' + ex.replace(/ /g,'_'));
  if (!el) return 0;
  return numFR(el.value) || parseFloat(el.placeholder) || 0;
}

function renderCycleProjections(weeks) {
  const w = weeks || parseInt(document.getElementById('cycle-weeks-slider')?.value || 12);
  const el = document.getElementById('cycle-projections');
  if (!el) return;
  el.innerHTML = CYCLE_EXS.map(ex => {
    const rm = getCycleInputRM(ex) || (S.prs[ex] ? S.prs[ex].rm1 : 0);
    const proj = rm ? projectRM(rm, w) : null;
    const gain = rm && proj ? fmt(proj - rm) : null;
    return `<div class="proj-box">
      <span class="proj-label">${ex}</span>
      <span class="proj-val">${proj ? proj + ' kg <span style="font-size:12px;color:var(--green);">(+' + gain + 'kg)</span>' : '—'}</span>
    </div>`;
  }).join('');
}

function startCycle() {
  const weeks = parseInt(document.getElementById('cycle-weeks-slider')?.value || 12);
  const exercises = {};
  let hasAny = false;
  CYCLE_EXS.forEach(ex => {
    const rm = getCycleInputRM(ex);
    if (rm > 0) { exercises[ex] = { rm1: rm, target: projectRM(rm, weeks) }; hasAny = true; }
  });
  if (!hasAny) { toast('Entre au moins un 1RM !', 'error'); return; }
  S.cycle = { startDate: today(), weeks, exercises, active: true };
  persist();
  renderCycleActive();
  toast('Cycle démarré ! 🚀', 'success');
}

function endCycle() {
  S.cycle = null;
  persist();
  renderCycleScreen();
}

function renderCycleScreen() {
  const setup = document.getElementById('cycle-setup-view');
  const active = document.getElementById('cycle-active-view');
  if (!setup || !active) return;
  if (S.cycle && S.cycle.active) {
    setup.style.display = 'none';
    active.style.display = 'flex';
    renderCycleActive();
  } else {
    setup.style.display = 'block';
    active.style.display = 'none';
    renderCycleSetup();
  }
  renderCycleHomeCard();
}

function renderCycleActive() {
  const cyc = S.cycle;
  if (!cyc) return;
  const curW = getCurrentCycleWeek();
  const plan = getWeekPlan(curW, cyc.weeks);
  const pct = Math.round((curW / cyc.weeks) * 100);

  // Header
  document.getElementById('cyc-week-title').textContent = `Semaine ${curW} — ${plan.phase}`;
  document.getElementById('cyc-phase-chip').innerHTML = `<span class="phase-chip ${plan.cls}">${plan.phase}</span>`;
  document.getElementById('cyc-pct-label').textContent = `${plan.pct}% 1RM`;
  document.getElementById('cyc-sets-label').textContent = `${plan.sets} × ${plan.reps} reps`;
  document.getElementById('cyc-prog-fill').style.width = pct + '%';
  document.getElementById('cyc-prog-label').textContent = `Semaine ${curW} / ${cyc.weeks}`;

  // Week loads
  const wl = document.getElementById('cyc-week-loads');
  wl.innerHTML = Object.entries(cyc.exercises).map(([ex, data]) => {
    const load = round25(data.rm1 * plan.pct / 100);
    return `<div class="ex-plan-row">
      <div style="flex:1;"><div class="ex-plan-name">${ex}</div><div class="ex-plan-detail">${plan.sets}×${plan.reps} @ ${plan.pct}% 1RM</div></div>
      <div style="text-align:right;"><div class="ex-plan-load">${load} kg</div><div class="ex-plan-detail">1RM: ${data.rm1} kg</div></div>
    </div>`;
  }).join('');

  // Week tabs
  renderWeekTabs(curW);
  renderSelectedWeekPlan(curW);

  // Projections
  const proj = document.getElementById('cyc-projections');
  proj.innerHTML = Object.entries(cyc.exercises).map(([ex, data]) => {
    return `<div class="proj-box">
      <span class="proj-label">${ex}</span>
      <span class="proj-val">${data.target} kg <span style="font-size:12px;color:var(--green);">(+${fmt(data.target - data.rm1)}kg)</span></span>
    </div>`;
  }).join('');
}

function renderWeekTabs(curW) {
  const bar = document.getElementById('week-tabs-bar');
  if (!bar || !S.cycle) return;
  bar.innerHTML = Array.from({length: S.cycle.weeks}, (_, i) => i + 1).map(w => {
    const cls = w < curW ? 'done' : w === curW ? 'active' : 'future';
    return `<button class="week-tab ${cls}" onclick="renderSelectedWeekPlan(${w})">S${w}</button>`;
  }).join('');
}

function renderSelectedWeekPlan(w) {
  const el = document.getElementById('cyc-selected-week-plan');
  if (!el || !S.cycle) return;
  const plan = getWeekPlan(w, S.cycle.weeks);
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <span style="font-size:14px;font-weight:700;">Semaine ${w}</span>
    <span class="phase-chip ${plan.cls}">${plan.phase} · ${plan.sets}×${plan.reps} · ${plan.pct}%</span>
  </div>` +
  Object.entries(S.cycle.exercises).map(([ex, data]) => {
    const load = round25(data.rm1 * plan.pct / 100);
    return `<div class="ex-plan-row">
      <div style="flex:1;"><div class="ex-plan-name">${ex}</div></div>
      <div class="ex-plan-load">${load} kg</div>
    </div>`;
  }).join('');
}

function renderCycleHomeCard() {
  const title = document.getElementById('cycle-home-title');
  const sub = document.getElementById('cycle-home-sub');
  if (!title || !sub) return;
  if (S.cycle && S.cycle.active) {
    const curW = getCurrentCycleWeek();
    const plan = getWeekPlan(curW, S.cycle.weeks);
    title.textContent = `📊 Semaine ${curW}/${S.cycle.weeks} — ${plan.phase}`;
    sub.textContent = `${plan.sets}×${plan.reps} @ ${plan.pct}% 1RM · Voir le plan →`;
  } else {
    title.textContent = '📊 Cycle de Force';
    sub.textContent = 'Planifie ta progression sur mesure →';
  }
}


// ─── POST-WORKOUT CHECK-IN ───────────────────────────────────
let _ciSessId=null,_ciSleepVal=null;
function openCheckin(sess){
  _ciSessId=sess?sess.id:null;_ciSleepVal=null;
  const hasSleepToday=!!(S.sleepLog&&S.sleepLog.find(e=>e.date===today()));
  document.getElementById('ci-step-sleep').style.display=hasSleepToday?'none':'block';
  document.getElementById('ci-step-energy').style.display=hasSleepToday?'block':'none';
  document.getElementById('ci-subtitle').textContent=hasSleepToday?'1 question rapide':'2 questions rapides';
  document.querySelectorAll('.ci-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('mod-checkin').classList.add('open');
}
function skipCheckin(){
  document.getElementById('mod-checkin').classList.remove('open');
  goScreen('progress',document.getElementById('nb-progress'));
}
function ciPickSleep(q){
  _ciSleepVal=q;
  // Update sleep log (quality, default 7.5h if not yet logged)
  if(!S.sleepLog)S.sleepLog=[];
  const d=today();const idx=S.sleepLog.findIndex(e=>e.date===d);
  /* ⛔⛔ LA MESURE PASSE DEVANT LE 7,5 PAR DÉFAUT (30/08). Répondre à la seule question de
     QUALITÉ du check-in écrivait `hours = 7,5` — un chiffre que personne n'a donné, qui partait
     ensuite dans le score ET chez Milo (R29). Inoffensif tant qu'il n'y avait rien d'autre ;
     franchement nuisible depuis qu'une durée MESURÉE existe, car l'app aurait alors affiché
     « tu avais noté 7,5 h » en face de la montre — un écart entièrement fabriqué par ce défaut.
     👉 Ordre : ce qu'elle a déjà saisi · sinon la mesure de la nuit · sinon seulement 7,5. */
  const _mes=((S.healthDaily||[]).find(x=>x&&x.date===d&&x.sleep>0)||{}).sleep;
  const hours=(S.sleepLog.find(e=>e.date===d)||{}).hours||_mes||7.5;
  const entry={date:d,hours,quality:q};
  if(idx>=0)S.sleepLog[idx]=entry;else S.sleepLog.unshift(entry);
  S.sleepLog=S.sleepLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  // Mark sleep step as answered, show energy step
  document.getElementById('ci-step-sleep').style.display='none';
  document.getElementById('ci-step-energy').style.display='block';
  document.getElementById('ci-subtitle').textContent='Dernière question';
}
function ciPickEnergy(e){
  // Save checkin on session
  if(_ciSessId){
    const si=S.sessions.findIndex(s=>s.id===_ciSessId);
    if(si>=0)S.sessions[si].checkin={sleep:_ciSleepVal,energy:e};
  }
  persist();
  document.getElementById('mod-checkin').classList.remove('open');
  toast('Check-in enregistré ✓','success');
  setTimeout(()=>goScreen('progress',document.getElementById('nb-progress')),400);
}

// ─── WEIGHT TRACKER ──────────────────────────────────────────
function linearRegression(pts){
  const n=pts.length;if(n<2)return{slope:0,intercept:pts[0]?pts[0].y:0};
  const sx=pts.reduce((a,p)=>a+p.x,0),sy=pts.reduce((a,p)=>a+p.y,0);
  const sxy=pts.reduce((a,p)=>a+p.x*p.y,0),sx2=pts.reduce((a,p)=>a+p.x*p.x,0);
  const slope=(n*sxy-sx*sy)/(n*sx2-sx*sx)||0;
  return{slope,intercept:(sy-slope*sx)/n};
}
function saveWeightEntry(){
  const inp=document.getElementById('wentry-inp');
  const kg=numFR(inp?inp.value:0);
  if(!kg||kg<20||kg>300){toast('Poids invalide (20–300 kg)','error');return;}
  if(!S.weightLog)S.weightLog=[];
  const d=today();const idx=S.weightLog.findIndex(w=>w.date===d);
  if(idx>=0)S.weightLog[idx].kg=kg;else S.weightLog.unshift({date:d,kg});
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  S.bw=kg;persist();
  renderWeightTab();renderHome();
  toast('Poids enregistré !','success');
}
function renderWeightTab(){
  /* 🚶 AU DÉBUT, PAS À LA FIN — et ce n'est pas cosmétique : cette fonction sort par un `return`
     quand il y a moins de 2 pesées. Accrochée en bas, la carte des pas n'apparaîtrait JAMAIS chez
     quelqu'un qui ne se pèse pas — une dépendance invisible entre deux données qui n'ont rien à
     voir. Elle ne dépend que de `S.healthDaily`, elle se rend donc en premier. */
  try{ if(typeof renderPasCard==='function') renderPasCard(); }catch(e){}
  const entryEl=document.getElementById('weight-entry-card');
  const chartEl=document.getElementById('weight-chart-box');
  const corrEl=document.getElementById('weight-correlations');
  if(!entryEl)return;
  const d=today();
  const todayW=S.weightLog&&S.weightLog.find(w=>w.date===d);
  const lastW=S.weightLog&&S.weightLog.length?S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]:null;
  const prefill=todayW?todayW.kg:(lastW?lastW.kg:(S.bw||''));
  entryEl.innerHTML=`
  <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
    <div>
      <div style="font-size:14px;font-weight:800;color:var(--t1);">Pesée du jour</div>
      <div style="font-size:13px;color:var(--t3);margin-top:2px;">${todayW?'✓ Enregistré : '+todayW.kg+' kg':'Pas encore saisie aujourd\'hui'}</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
      <input type="text" id="wentry-inp" value="${prefill}" placeholder="${S.bw||80}" step="0.1" min="20" max="300" inputmode="decimal" enterkeyhint="done" onkeydown="if(event.key==='Enter'){event.preventDefault();saveWeightEntry();}" style="width:76px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">
      <button class="btn-xs btn-red" onclick="saveWeightEntry()" style="background:linear-gradient(135deg,#FF2D55,#FF4D6D);color:#fff;border:none;padding:10px 14px;font-size:16px;">✓</button>
    </div>
  </div>`;
  renderWeightTarget();
  renderBodyFatCard();
  renderBodyScanCard();
  renderBloodCard();
  const sorted=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];
  // Bascule Poids ↔ Masse grasse
  const metricEl=document.getElementById('weight-metric');
  if(metricEl){
    if(sorted.length<2)metricEl.innerHTML='';
    else metricEl.innerHTML=[['kg','Poids'],['bf','Masse grasse'],['both','Les 2']]
      .map(function(m){return '<button class="wmetric-chip'+(_wMetric===m[0]?' active':'')+'" onclick="setWeightMetric(\''+m[0]+'\')">'+m[1]+'</button>';}).join('');
  }
  // ── Fenêtre temporelle : navigation dans l'historique + zoom ──
  // _wSpanDays = largeur de la fenêtre en jours (null = tout) · _wEndOff = décalage du bord droit (jours) vs aujourd'hui
  const _isoD=dt=>dt.toISOString().split('T')[0];
  // Référence de la fenêtre (bornes + zoom) : en Masse grasse ET « Les 2 », on cadre sur les mesures
  // de MG (souvent récentes/clairsemées) — sinon le zoom traverse des années sans MG et semble figé.
  // Repli sur tout le poids si moins de 2 mesures de MG (pas de régression).
  let refSource=sorted;
  if(_wMetric==='bf'||_wMetric==='both'){const bfr=sorted.filter(p=>p.bf!=null);if(bfr.length>=2)refSource=bfr;}
  // Ce qui est tracé : MG seule en vue « bf » ; toutes les pesées (courbe dense) sinon.
  const plotSource=(_wMetric==='bf')?sorted.filter(p=>p.bf!=null):sorted;
  const firstD=refSource.length?new Date(refSource[0].date+'T12:00:00'):new Date();
  const nowD=new Date(today()+'T12:00:00');
  const fullSpan=Math.max(1,Math.round((nowD-firstD)/86400000));
  const eff=(_wSpanDays!=null)?_wSpanDays:(fullSpan+1);
  const maxOff=Math.max(0,fullSpan-eff);
  if(_wEndOff>maxOff)_wEndOff=maxOff;
  if(_wEndOff<0)_wEndOff=0;
  const rightD=new Date(nowD);rightD.setDate(rightD.getDate()-_wEndOff);
  const leftD=new Date(rightD);leftD.setDate(leftD.getDate()-eff);
  const lStr=_isoD(leftD),rStr=_isoD(rightD);
  let pts=(_wSpanDays!=null)?plotSource.filter(p=>p.date>=lStr&&p.date<=rStr):plotSource.slice();
  // Sous-échantillonnage pour l'affichage si trop de points (garde toujours le dernier)
  if(pts.length>160){const k=Math.ceil(pts.length/160);pts=pts.filter((_,i)=>i%k===0||i===pts.length-1);}
  // Chips de période (préréglages)
  const rangeEl=document.getElementById('weight-range');
  if(rangeEl){
    if(sorted.length<2)rangeEl.innerHTML='';
    else rangeEl.innerHTML=[['1w','1 sem.'],['1m','1 mois'],['3m','3 mois'],['6m','6 mois'],['all','Tout']]
      .map(function(r){return '<button class="wrange-chip'+(_wRange===r[0]?' active':'')+'" onclick="setWeightRange(\''+r[0]+'\')">'+r[1]+'</button>';}).join('');
  }
  // Ligne de navigation ◀ 🔍− [dates] 🔍+ ▶ (revenir dans le temps + zoomer le graphique)
  const navEl=document.getElementById('weight-nav');
  if(navEl){
    if(sorted.length<2){navEl.style.display='none';}
    else{
      navEl.style.display='flex';
      const allShown=(_wSpanDays==null),atNewest=(_wEndOff<=0),atOldest=(_wEndOff>=maxOff);
      const nb=(lbl,fn,dis,title)=>'<button class="wnav-btn" title="'+title+'"'+(dis?' disabled':'')+' onclick="'+fn+'">'+lbl+'</button>';
      const rangeLbl=pts.length?(_fmtWNav(pts[0].date)+' → '+_fmtWNav(pts[pts.length-1].date)):'—';
      navEl.innerHTML=
        nb('◀','weightPan(-1)',allShown||atOldest,'Reculer dans le temps')
        +nb('🔍−','weightZoom(-1)',allShown,'Dézoomer')
        +'<span style="flex:1;text-align:center;font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+rangeLbl+'</span>'
        +nb('🔍+','weightZoom(1)',pts.length<3,'Zoomer')
        +nb('▶','weightPan(1)',allShown||atNewest,'Avancer dans le temps');
    }
  }
  // Vue « Masse grasse » : on trace les pesées qui ont une valeur bf
  if(_wMetric==='bf'){
    const bfpts=pts.filter(p=>p.bf!=null);
    if(bfpts.length<2){
      if(chartEl)chartEl.innerHTML='<div class="empty" style="padding:20px 0;">Enregistre ta masse grasse sur au moins 2 mesures pour voir la courbe 📊</div>';
      if(corrEl)corrEl.innerHTML='';
      return;
    }
    if(chartEl)renderWeightChart(bfpts,chartEl,'bf');
    if(corrEl)corrEl.innerHTML='';
    return;
  }
  // Vue « Les 2 » : poids + masse grasse superposés (2 axes)
  // La courbe de poids s'affiche toujours ; la masse grasse dès qu'il y a ≥2 mesures.
  if(_wMetric==='both'){
    if(pts.length<2){
      if(chartEl)chartEl.innerHTML='<div class="empty" style="padding:20px 0;">Ajoute au moins 2 pesées pour voir le graphique 📊</div>';
      if(corrEl)corrEl.innerHTML='';
      return;
    }
    if(chartEl)renderCompareChart(pts,chartEl);
    if(corrEl)corrEl.innerHTML='';
    return;
  }
  if(pts.length<2){
    if(chartEl)chartEl.innerHTML='<div class="empty" style="padding:20px 0;">'+(sorted.length>=2?'Pas assez de pesées sur cette période 📊':'Ajoute au moins 2 pesées pour voir le graphique 📊')+'</div>';
    if(corrEl)corrEl.innerHTML='';
    return;
  }
  if(chartEl)renderWeightChart(pts,chartEl,'kg');
  if(corrEl)renderWeightCorrelations(corrEl,pts);
}
let _wRange='1w'; // préréglage actif : '1w' | '1m' | '3m' | '6m' | 'all' | '' (zoom/pan custom) — défaut = 1 semaine
let _wSpanDays=7; // largeur de la fenêtre en jours (null = tout l'historique) — défaut = 7 jours
let _wEndOff=0;      // décalage du bord droit de la fenêtre (jours) vs aujourd'hui
function setWeightRange(r){_wRange=r;_wSpanDays={'1w':7,'1m':30,'3m':90,'6m':180,'all':null}[r];_wEndOff=0;renderWeightTab();}
function _fmtWNav(d){const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'});}
function _wFullSpan(){let s=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];if(_wMetric==='bf'||_wMetric==='both'){const b=s.filter(p=>p.bf!=null);if(b.length>=2)s=b;}if(!s.length)return 1;const f=new Date(s[0].date+'T12:00:00'),n=new Date(today()+'T12:00:00');return Math.max(1,Math.round((n-f)/86400000));}
function weightZoom(dir){
  const full=_wFullSpan();
  const eff=(_wSpanDays!=null)?_wSpanDays:full;
  let ns=dir>0?Math.max(7,Math.round(eff/1.6)):Math.round(eff*1.6);
  if(ns>=full){_wSpanDays=null;_wEndOff=0;_wRange='all';}
  else{_wSpanDays=ns;_wRange='';}
  renderWeightTab();
}
function weightPan(dir){
  if(_wSpanDays==null)return; // déjà tout affiché
  // Se déplace d'une FENÊTRE COMPLÈTE (ex. période 3 mois → recule/avance de 3 mois pile)
  const step=Math.max(1,_wSpanDays);
  _wEndOff=Math.max(0,_wEndOff+(dir<0?step:-step)); // ◀ = reculer (offset↑) · ▶ = avancer (offset↓)
  // On garde _wRange : le bouton de période reste allumé pendant la navigation (on ne change que la position, pas le zoom)
  renderWeightTab();
}
let _wMetric='kg'; // métrique affichée : 'kg' (poids) | 'bf' (masse grasse)
function setWeightMetric(m){_wMetric=m;renderWeightTab();}

// ── Poids objectif (futur souhaité) ──
function renderWeightTarget(){
  const el=document.getElementById('weight-target');if(!el)return;
  const cur=(S.weightLog&&S.weightLog.length)?S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0].kg:(S.bw||0);
  const tw=S.targetWeight||0;
  let sub='Optionnel — fixe un poids à viser';
  if(tw&&cur){
    const rem=Math.round((cur-tw)*10)/10;
    if(Math.abs(rem)<0.1)sub='🎉 Objectif atteint !';
    else if(rem>0)sub=rem+' kg à perdre';
    else sub=Math.abs(rem)+' kg à prendre';
  }else if(tw)sub='Objectif fixé';
  el.innerHTML=
    '<div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">'
     +'<div><div style="font-size:14px;font-weight:800;color:var(--t1);">🎯 Poids objectif</div>'
     +'<div style="font-size:12px;color:var(--t3);margin-top:2px;">'+sub+'</div></div>'
     +'<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">'
       +'<input type="text" id="target-inp" value="'+(tw||'')+'" placeholder="kg" step="0.1" min="20" max="300" inputmode="decimal" style="width:70px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">'
       +'<button class="btn-xs btn-red" onclick="setTargetWeight()" style="background:linear-gradient(135deg,#FF2D55,#FF4D6D);color:#fff;border:none;padding:10px 14px;font-size:16px;">✓</button>'
     +'</div>'
    +'</div>';
}
function setTargetWeight(){
  const v=numFR((document.getElementById('target-inp')||{}).value);
  if(!v){S.targetWeight=0;persist();renderWeightTab();toast('Objectif retiré','info');return;}
  if(v<20||v>300){toast('Objectif invalide (20–300 kg)','error');return;}
  S.targetWeight=v;persist();renderWeightTab();
  toast('Objectif : '+v+' kg 🎯','success');
}

// ── Masse grasse : calcul US Navy + saisie + suivi dans le temps ──
function _bfNavy(neck,waist,hip,ht,gender){
  neck=parseFloat(neck);waist=parseFloat(waist);hip=parseFloat(hip);ht=parseFloat(ht);
  if(!ht||!neck||!waist)return null;
  try{
    let bf;
    if(gender==='F'){ if(!hip||waist+hip<=neck)return null; bf=495/(1.29579-0.35004*Math.log10(waist+hip-neck)+0.22100*Math.log10(ht))-450; }
    else{ if(waist<=neck)return null; bf=495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(ht))-450; }
    if(!isFinite(bf)||bf<=2||bf>70)return null;
    return Math.round(bf*10)/10;
  }catch(e){return null;}
}
function _bfMeasInput(id,label,val){
  return '<div style="flex:1;"><div style="font-size:10px;color:var(--t3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em;">'+label+'</div>'
    +'<input type="text" id="'+id+'" value="'+(val||'')+'" placeholder="cm" step="0.5" inputmode="decimal" oninput="_recalcNavyBf()" style="width:100%;padding:8px 6px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:15px;font-family:var(--font);text-align:center;box-sizing:border-box;"></div>';
}
function _navyBfHtml(){
  const navy=_bfNavy(S.neck,S.waist,S.hip,S.height,S.gender);
  return navy==null?'<span style="font-size:12px;color:var(--t3);">— (renseigne cou + taille)</span>':('~'+navy+' %');
}
// Recalcule à chaque saisie de mesure ET remplit automatiquement la case « Masse grasse du jour »
function _recalcNavyBf(){
  const neck=(document.getElementById('bf-neck')||{}).value,waist=(document.getElementById('bf-waist')||{}).value,hip=(document.getElementById('bf-hip')||{}).value;
  const navy=_bfNavy(neck,waist,hip,S.height,S.gender);
  const el=document.getElementById('bf-navy-val');if(el)el.innerHTML=navy==null?'<span style="font-size:12px;color:var(--t3);">—</span>':('~'+navy+' %');
  if(navy!=null){const i=document.getElementById('bf-inp');if(i)i.value=navy;}
}
function renderBodyFatCard(){
  const el=document.getElementById('bodyfat-card');if(!el)return;
  const d=today();
  const todayW=(S.weightLog||[]).find(w=>w.date===d);
  const isF=S.gender==='F';
  const savedToday=(todayW&&todayW.bf!=null);
  const navyNow=_bfNavy(S.neck,S.waist,S.hip,S.height,S.gender);
  // Case pré-remplie : valeur enregistrée du jour, sinon calcul US Navy (prêt à valider)
  const prefill=savedToday?todayW.bf:(navyNow!=null?navyNow:'');
  const sub=savedToday?('✓ Enregistrée : '+todayW.bf+' %')
    :(navyNow!=null?('Estimée ~'+navyNow+' % — appuie sur ✓ pour enregistrer')
    :'Entre ton cou et ta taille ci-dessous');
  el.innerHTML=
    '<div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">'
     +'<div><div style="font-size:14px;font-weight:800;color:var(--t1);">Masse grasse du jour</div>'
     +'<div style="font-size:12px;color:var(--t3);margin-top:2px;">'+sub+'</div></div>'
     +'<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">'
       +'<input type="text" id="bf-inp" value="'+prefill+'" placeholder="%" step="0.1" min="2" max="70" inputmode="decimal" style="width:70px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">'
       +'<button class="btn-xs btn-red" onclick="saveBodyFat()" style="background:linear-gradient(135deg,#FF2D55,#FF4D6D);color:#fff;border:none;padding:10px 14px;font-size:16px;">✓</button>'
     +'</div>'
    +'</div>'
    +'<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--sep);">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">'
        +'<span style="font-size:12px;color:var(--t3);">Calcul auto (méthode US Navy) — remplit la case ci-dessus</span>'
        +'<span id="bf-navy-val" style="font-size:14px;font-weight:800;color:var(--blue);">'+_navyBfHtml()+'</span>'
      +'</div>'
      +'<div style="display:flex;gap:6px;">'
        +_bfMeasInput('bf-neck','Cou',S.neck)
        +_bfMeasInput('bf-waist','Tour de taille',S.waist)
        +(isF?_bfMeasInput('bf-hip','Hanches',S.hip):'')
      +'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:6px;">Mesures en cm, à jeun le matin. <b>Valeur indicative</b> — pas une science exacte. Vise la régularité : c\'est la tendance qui compte.</div>'
    +'</div>';
}
function saveBodyFat(){
  // Mensurations saisies (aussi utilisées pour le calcul US Navy de secours)
  const nk=numFR((document.getElementById('bf-neck')||{}).value),wa=numFR((document.getElementById('bf-waist')||{}).value),hp=numFR((document.getElementById('bf-hip')||{}).value);
  let bf=numFR((document.getElementById('bf-inp')||{}).value);
  // Rien tapé à la main → on prend directement le calcul US Navy des mesures
  if(!bf){const navy=_bfNavy(nk||S.neck,wa||S.waist,hp||S.hip,S.height,S.gender);if(navy!=null)bf=navy;}
  if(!bf||bf<2||bf>70){toast('Entre un % ou tes mesures (cou + taille)','error');return;}
  if(!S.weightLog)S.weightLog=[];
  const d=today();
  let e=S.weightLog.find(w=>w.date===d);
  if(!e){
    const last=S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
    const kg=last?last.kg:(S.bw||0);
    if(!kg){toast('Enregistre d\'abord ton poids du jour','info');return;}
    e={date:d,kg:kg};S.weightLog.unshift(e);
  }
  e.bf=Math.round(bf*10)/10;
  // Mémorise les mensurations saisies (garde le profil à jour)
  if(nk>20&&nk<80)S.neck=nk;if(wa>40&&wa<200)S.waist=wa;if(hp>40&&hp<200)S.hip=hp;
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  persist();renderWeightTab();
  toast('Masse grasse enregistrée ✅','success');
}
// ── Édition d'une pesée (tap sur un point du graphique) ──
let _weighEditDate=null;
function openWeighEdit(date){
  const w=(S.weightLog||[]).find(x=>x.date===date);if(!w)return;
  _weighEditDate=date;
  const di=document.getElementById('weigh-edit-date');if(di)di.value=date;
  const ki=document.getElementById('weigh-edit-kg');if(ki)ki.value=w.kg;
  const bi=document.getElementById('weigh-edit-bf');if(bi)bi.value=(w.bf!=null?w.bf:'');
  const ov=document.getElementById('ov-weigh-edit');if(ov)ov.classList.add('open');
  if(typeof _weighNavUpd==='function')_weighNavUpd();  // état des flèches ‹ › + « Pesée 12 sur 42 »
}
function closeWeighEdit(){const ov=document.getElementById('ov-weigh-edit');if(ov)ov.classList.remove('open');_weighEditDate=null;}
// ── Navigation entre pesées : flèches ‹ › + glissement gauche/droite (idée Christophe, boîte à
// idées 29/07 — sa capture montrait cette fenêtre). S.weightLog est trié du plus RÉCENT au plus
// ancien → index+1 = pesée plus ANCIENNE. Naviguer CHARGE la pesée visée (une modif non
// enregistrée est abandonnée — les flèches servent à CONSULTER, « Enregistrer » reste explicite).
function _weighIdx(){return (S.weightLog||[]).findIndex(x=>x.date===_weighEditDate);}
function _weighNav(dir){ // +1 = plus ancienne (‹) · −1 = plus récente (›)
  const log=S.weightLog||[];const i=_weighIdx();if(i<0)return;
  const j=i+dir;if(j<0||j>=log.length)return;
  openWeighEdit(log[j].date);
}
function _weighNavUpd(){
  const log=S.weightLog||[];const i=_weighIdx();
  const p=document.getElementById('weigh-nav-prev'),n=document.getElementById('weigh-nav-next');
  const okP=i>=0&&i+1<log.length, okN=i>0;
  if(p){p.style.opacity=okP?'1':'.25';p.style.pointerEvents=okP?'':'none';}
  if(n){n.style.opacity=okN?'1':'.25';n.style.pointerEvents=okN?'':'none';}
  const pos=document.getElementById('weigh-nav-pos');
  if(pos)pos.textContent=(i>=0&&log.length>1)?('Pesée '+(log.length-i)+' sur '+log.length):'';
}
let _weighTouchX=null,_weighTouchY=null;
function _weighTS(e){const t=e.touches&&e.touches[0];if(t){_weighTouchX=t.clientX;_weighTouchY=t.clientY;}}
function _weighTE(e){
  if(_weighTouchX==null)return;
  const t=e.changedTouches&&e.changedTouches[0];if(!t)return;
  const dx=t.clientX-_weighTouchX,dy=t.clientY-_weighTouchY;
  _weighTouchX=null;_weighTouchY=null;
  if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*2)return;  // geste franc et bien HORIZONTAL (ne vole pas le glisser-fermer vertical)
  _weighNav(dx>0?1:-1);                                     // glisser vers la droite = remonter vers la plus ancienne
}
function saveWeighEdit(){
  const kg=numFR((document.getElementById('weigh-edit-kg')||{}).value);
  const newDate=(document.getElementById('weigh-edit-date')||{}).value;
  if(!kg||kg<20||kg>300){toast('Poids invalide (20–300 kg)','error');return;}
  if(!newDate){toast('Date invalide','error');return;}
  if(newDate>today()){toast('Date dans le futur','error');return;}
  const bfv=numFR((document.getElementById('weigh-edit-bf')||{}).value);
  const entry={date:newDate,kg:kg};
  if(bfv>=2&&bfv<=70)entry.bf=bfv;
  // retire l'ancienne entrée + toute entrée sur la nouvelle date, puis ré-insère
  S.weightLog=(S.weightLog||[]).filter(x=>x.date!==_weighEditDate&&x.date!==newDate);
  S.weightLog.unshift(entry);
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  if(S.weightLog[0])S.bw=S.weightLog[0].kg;
  persist();closeWeighEdit();renderWeightTab();renderHome();
  toast('Pesée mise à jour ✅','success');
}
function deleteWeighEntry(){
  const dt=_weighEditDate;if(!dt)return;
  showConfirm('Supprimer cette pesée ?','Le '+new Date(dt+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+' — action définitive.',function(){
    S.weightLog=(S.weightLog||[]).filter(x=>x.date!==dt);
    if(S.weightLog[0])S.bw=S.weightLog[0].kg;
    persist();closeWeighEdit();renderWeightTab();renderHome();
    toast('Pesée supprimée','info');
  });
}
// ─── BILAN CORPOREL (balance pro / impédancemètre) ───────────────
const _BS_FIELDS=[
  {k:'weight',l:'Poids',u:'kg',good:'down',req:true},
  {k:'bf',l:'Graisse',u:'%',good:'down'},
  {k:'fatMass',l:'Masse grasse',u:'kg',good:'down'},
  {k:'muscle',l:'Muscle',u:'kg',good:'up'},
  {k:'skMuscle',l:'Muscle squel.',u:'kg',good:'up'},
  {k:'bone',l:'Masse osseuse',u:'kg',good:'up'},
  {k:'water',l:'Eau',u:'kg',good:'up'},
  {k:'protein',l:'Protéine',u:'kg',good:'up'},
  {k:'visceral',l:'Graisse viscérale',u:'',good:'down'},
  {k:'bmr',l:'Métabolisme base',u:'kcal',good:'up'},
  {k:'metaAge',l:'Âge corporel',u:'ans',good:'down'},
  {k:'imc',l:'IMC',u:'',good:'down'},
  {k:'bodyScore',l:'Score corporel',u:'/100',good:'up'},
  {k:'leanMass',l:'Masse maigre',u:'kg',good:'up'},
  {k:'subFat',l:'Graisse sous-cutanée',u:'%',good:'down'},
  {k:'smi',l:'Indice muscle squel.',u:'kg/m²',good:'up'}
];
// Détail par segment (optionnel) — muscle & graisse par zone (gauche/droite pour l'équilibre)
const _BS_SEG_FIELDS=[
  {k:'armMuscleL',l:'Muscle bras G',u:'kg'},{k:'armMuscleR',l:'Muscle bras D',u:'kg'},
  {k:'trunkMuscle',l:'Muscle tronc',u:'kg'},
  {k:'legMuscleL',l:'Muscle jambe G',u:'kg'},{k:'legMuscleR',l:'Muscle jambe D',u:'kg'},
  {k:'armFatL',l:'Graisse bras G',u:'kg'},{k:'armFatR',l:'Graisse bras D',u:'kg'},
  {k:'trunkFat',l:'Graisse tronc',u:'kg'},
  {k:'legFatL',l:'Graisse jambe G',u:'kg'},{k:'legFatR',l:'Graisse jambe D',u:'kg'}
];
let _bsEditIdx=-1;
let _bsSource='manuel';   // 'manuel' · 'ocr' · 'ia' — provenance du bilan en cours de saisie (R33)
let _bsLmDeduite=false;  // 🏷️ true si la masse maigre a été DÉDUITE (poids − gras) et non lue (R33)
let _bsListOpen=false; // liste des bilans/pesées de la balance : réduite par défaut (gagne de la place), tap pour ouvrir
function toggleBsList(){_bsListOpen=!_bsListOpen;renderBodyScanCard();}
function renderBodyScanCard(){
  const el=document.getElementById('bodyscan-section');if(!el)return;
  // Import CSV de balance (historique complet) — réservé aux testeurs
  const csvBtn=_isScaleCsvBeta()?`<button class="btn btn-bg2" style="width:100%;margin-top:8px;font-size:13px;" onclick="openScaleCsvImport()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg> Importer un fichier balance (CSV ou Excel)</button>`:'';
  // Import PHOTO du bilan : ACTIF en prod depuis 2026-07-14 — la lecture passe par le serveur IA
  // Cloudflare (worker.js, action importBodyScan) qui appelle Anthropic en direct → marche en 4G/5G.
  const bsPhotoBtn=(label)=>`<button class="btn btn-red" style="width:100%;" onclick="importBodyScanPhoto()">📷 ${label}</button>`;
  const scaleSel=_scaleTypeSelector();
  const scans=(S.bodyScans||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  if(!scans.length){
    el.innerHTML=`<div class="card cp" style="text-align:center;">
      <div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:10px;">Tu passes sur une balance pro (impédancemètre) ? Enregistre ton bilan — graisse viscérale, muscle, métabolisme… — pour suivre son évolution dans le temps et que Milo s'en serve.</div>
      <div style="text-align:left;">${scaleSel}</div>
      ${bsPhotoBtn('Importer depuis une photo')}
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-bg2" style="flex:1;font-size:13px;" onclick="openBodyScanForm(-1)">✏️ À la main</button>
        <button class="btn btn-bg2" style="flex:1;font-size:13px;" onclick="pasteBodyScan()">📋 Coller un code</button>
      </div>${csvBtn}</div>`;
    return;
  }
  const last=scans[0], prev=scans[1];
  const showKeys=['weight','bf','muscle','visceral','bmr','metaAge'];
  const cell=(f)=>{
    const v=last[f.k]; if(v==null||v==='')return '';
    let ev='';
    if(prev&&prev[f.k]!=null&&prev[f.k]!==''){
      const d=+(v-prev[f.k]).toFixed(1);
      if(d!==0){
        const goodDir=f.good==='up'?d>0:d<0;
        const col=goodDir?'#22C55E':'var(--t3)';
        ev=`<span style="font-size:10px;color:${col};font-weight:700;"> ${d>0?'▲':'▼'}${Math.abs(d)}</span>`;
      }
    }
    return `<div style="background:var(--bg3);border-radius:10px;padding:9px 4px;text-align:center;">
      <div style="font-size:15px;font-weight:800;color:var(--t1);white-space:nowrap;">${v}<span style="font-size:9px;color:var(--t3);font-weight:600;">${f.u?' '+f.u:''}</span>${ev}</div>
      <div style="font-size:9px;color:var(--t3);margin-top:2px;">${f.l}</div></div>`;
  };
  const cells=_BS_FIELDS.filter(f=>showKeys.includes(f.k)).map(cell).join('');
  const dstr=new Date(last.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  let html=`<div class="card cp">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-weight:800;font-size:14px;">Dernier bilan · ${dstr}</div>
      <button class="btn-xs btn-bg2" onclick="openBodyScanForm(${S.bodyScans.indexOf(last)})" style="padding:5px 10px;font-size:12px;">✎</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">${cells}</div>
    ${prev?'<div style="font-size:10px;color:var(--t3);text-align:center;margin-top:9px;">▲▼ = évolution depuis le bilan précédent (vert = dans le bon sens)</div>':''}
  </div>`;
  if(scans.length>1){
    const LIST_MAX=24;                       // liste plafonnée (les courbes gardent tout l'historique)
    const shown=scans.slice(0,LIST_MAX);
    // En-tête repliable : la liste est RÉDUITE par défaut (gagne de la place) → tap pour l'ouvrir/fermer.
    html+=`<div onclick="toggleBsList()" style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:10px;padding:11px 12px;cursor:pointer;box-shadow:inset 0 0 0 1px var(--sep);user-select:none;-webkit-user-select:none;margin-top:2px;">
      <span style="font-size:13px;font-weight:800;color:var(--t1);">📋 Historique des pesées · ${scans.length}</span>
      <span style="font-size:12px;color:var(--t3);font-weight:700;">${_bsListOpen?'Réduire':'Voir'} <span style="display:inline-block;transition:transform .2s;transform:rotate(${_bsListOpen?90:0}deg);">›</span></span>
    </div>`;
    if(_bsListOpen){
      html+=`<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">`;
      shown.forEach(s=>{
        const i=S.bodyScans.indexOf(s);
        const dd=new Date(s.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'});
        html+=`<div onclick="openBodyScanForm(${i})" style="display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:10px;padding:10px 12px;cursor:pointer;box-shadow:inset 0 0 0 1px var(--sep);">
          <span style="font-size:13px;font-weight:700;color:var(--t1);">${dd}</span>
          <span style="font-size:12px;color:var(--t2);">${s.weight?s.weight+' kg':''}${s.bf?' · '+s.bf+'%':''}${s.muscle?' · '+s.muscle+' kg musc.':''}</span>
        </div>`;
      });
      if(scans.length>LIST_MAX)
        html+=`<div style="font-size:11.5px;color:var(--t3);text-align:center;padding:6px;">+ ${scans.length-LIST_MAX} autres bilans plus anciens — visibles sur la courbe ci-dessus 📈</div>`;
      html+=`</div>`;
    }
  }
  html+=scaleSel;
  html+=`${bsPhotoBtn('Nouveau bilan (photo)')}
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="btn btn-bg2" style="flex:1;font-size:13px;" onclick="openBodyScanForm(-1)">✏️ À la main</button>
      <button class="btn btn-bg2" style="flex:1;font-size:13px;" onclick="pasteBodyScan()">📋 Coller un code</button>
    </div>${csvBtn}`;
  el.innerHTML=html;
}
// ─── Import CSV de balance connectée (Tanita/impédancemètre) — testeurs, historique complet ───
function _isScaleCsvBeta(){
  const e=(S.email||'').trim().toLowerCase();
  if(e==='michdu75@gmail.com')return true;
  return typeof TESTER_EMAILS!=='undefined' && TESTER_EMAILS.indexOf(e)>=0;
}
// Type de balance à impédance — change beaucoup la lecture de la masse grasse (Milo en tient compte)
const SCALE_TYPE_LABELS={feet:'Pieds seulement (2 électrodes)',handsfeet:'Mains + pieds (segmentaire)'};
function setScaleType(t){ S.scaleType=(S.scaleType===t?'':t); if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); renderBodyScanCard(); if(typeof toast==='function'&&S.scaleType)toast('Balance : '+SCALE_TYPE_LABELS[t],'info'); }
function _scaleTypeSelector(){
  const t=S.scaleType||'';
  const opt=(v,l)=>`<button onclick="setScaleType('${v}')" class="btn ${t===v?'btn-red':'btn-bg2'}" style="flex:1;font-size:12px;padding:8px 6px;line-height:1.25;">${l}</button>`;
  return `<div style="margin-bottom:12px;">
    <div style="font-size:11.5px;color:var(--t3);margin-bottom:6px;line-height:1.4;">Ta balance à impédance (aide à bien lire la masse grasse — les modèles donnent des % différents) :</div>
    <div style="display:flex;gap:6px;">${opt('feet','👣 Pieds')}${opt('handsfeet','🖐️ Mains + pieds')}</div>
  </div>`;
}
function _csvSplit(line){
  const out=[]; let cur='', q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(q){ if(c==='"'){ if(line[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
    else { if(c==='"')q=true; else if(c===','){out.push(cur);cur='';} else cur+=c; }
  }
  out.push(cur); return out;
}
function _scaleDate(s){
  s=(s||'').trim();
  let m=s.match(/(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);   // AAAA-MM-JJ ou AAAA/MM/JJ (année d'abord)
  if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  m=s.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);     // JJ/MM/AAAA (jour d'abord)
  if(m){ let y=m[3]; if(y.length===2)y='20'+y; return y+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'); }
  return null;
}
// Trouve l'indice des colonnes par nom d'en-tête (robuste, multi-marques). Exclut les colonnes segmentaires.
function _scaleColMap(headers){
  const H=headers.map(h=>(h||'').trim().toLowerCase());
  const noSeg=h=>!h.includes(' - ')&&!h.includes('- right')&&!h.includes('- left')&&!h.includes('bras')&&!h.includes('jambe')&&!h.includes('tronc');
  const find=pred=>{ for(let i=0;i<H.length;i++){ if(pred(H[i]))return i; } return -1; };
  return {
    date:    find(h=>h==='date'||h.startsWith('date')||h.includes('time')||h.includes('temps')||h.includes('mesure')),
    weight:  find(h=>noSeg(h)&&(h.includes('weight')||h.includes('poids'))),
    imc:     find(h=>h==='bmi'||h.includes('imc')||h==='bmi '),
    bf:      find(h=>noSeg(h)&&(h.includes('body fat')||(h.includes('graisse')&&!h.includes('visc')&&!h.includes('masse')))&&h.includes('%')),
    visceral:find(h=>h.includes('visc')),
    muscle:  find(h=>noSeg(h)&&(h.includes('muscle mass')||h.includes('masse musc'))),
    bone:    find(h=>h.includes('bone')||h.includes('osseu')),
    bmr:     find(h=>h.includes('bmr')||(h.includes('metab')&&(h.includes('base')||h.includes('kcal')))||(h.includes('métab')&&(h.includes('base')||h.includes('kcal')))),
    metaAge: find(h=>h.includes('metab age')||h.includes('metabolic age')||((h.includes('metab')||h.includes('métab'))&&h.includes('age'))||((h.includes('âge')||h.includes('age'))&&h.includes('métab')))
  };
}
function _parseScaleCsv(text){
  const lines=String(text||'').split(/\r?\n/).filter(l=>l.trim());
  if(!lines.length)return {rows:[],err:'fichier vide'};
  const col=_scaleColMap(_csvSplit(lines[0]));
  if(col.date<0||col.weight<0)return {rows:[],err:'colonnes Date/Poids introuvables'};
  const num=v=>{ v=(v||'').trim(); if(v===''||v==='-')return null; const n=parseFloat(v.replace(',','.')); return isNaN(n)?null:n; };
  const keys=['bf','imc','visceral','muscle','bone','bmr','metaAge'];
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const c=_csvSplit(lines[i]);
    const date=_scaleDate(c[col.date]); if(!date)continue;
    const w=num(c[col.weight]); if(w==null)continue;
    const r={date,weight:w};
    keys.forEach(k=>{ if(col[k]>=0){ const v=num(c[col[k]]); if(v!=null)r[k]=v; } });
    rows.push(r);
  }
  return {rows};
}
// Range les lignes lues dans S.bodyScans + S.weightLog (1 par jour, garde tout l'historique)
function _importScaleRows(rows){
  const byDay={}; rows.forEach(r=>{ if(r.date)byDay[r.date]=r; }); // dernière du jour gagne
  const days=Object.keys(byDay).sort();
  S.bodyScans=S.bodyScans||[]; S.weightLog=S.weightLog||[];
  const bsIdx={}; S.bodyScans.forEach((s,i)=>{bsIdx[s.date]=i;});
  const wIdx={};  S.weightLog.forEach((w,i)=>{wIdx[w.date]=i;});
  days.forEach(d=>{
    const r=byDay[d];
    const scan={date:d};
    ['weight','bf','imc','visceral','muscle','bone','bmr','metaAge'].forEach(k=>{ if(r[k]!=null)scan[k]=r[k]; });
    if(bsIdx[d]!=null)S.bodyScans[bsIdx[d]]=scan; else {S.bodyScans.push(scan);bsIdx[d]=S.bodyScans.length-1;}
    if(r.weight!=null){
      if(wIdx[d]!=null){ S.weightLog[wIdx[d]].kg=r.weight; if(r.bf!=null)S.weightLog[wIdx[d]].bf=r.bf; }
      else { const wl={date:d,kg:r.weight}; if(r.bf!=null)wl.bf=r.bf; S.weightLog.push(wl); wIdx[d]=S.weightLog.length-1; }
    }
  });
  S.bodyScans.sort((a,b)=>b.date.localeCompare(a.date));
  S.weightLog.sort((a,b)=>b.date.localeCompare(a.date));
  const latest=days[days.length-1]; if(byDay[latest]&&byDay[latest].weight)S.bw=Math.round(byDay[latest].weight*10)/10;
  if(typeof persist==='function')persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  return {days:days.length};
}
// Charge SheetJS (lecteur Excel) hébergé en local — comme jsPDF, marche hors-ligne
let _xlsxLoad=null;
function _loadXlsx(){
  if(window.XLSX)return Promise.resolve();
  if(_xlsxLoad)return _xlsxLoad;
  _xlsxLoad=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='./lib/xlsx.full.min.js'; s.onload=res; s.onerror=()=>{_xlsxLoad=null;rej(new Error('load xlsx'));}; document.head.appendChild(s); });
  return _xlsxLoad;
}
function openScaleCsvImport(){
  if(!_isScaleCsvBeta()){ if(typeof toast==='function')toast('Réservé aux testeurs','info'); return; }
  let inp=document.getElementById('_scale-csv-input');
  if(!inp){ inp=document.createElement('input'); inp.type='file'; inp.accept='.csv,.xlsx,.xls,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; inp.id='_scale-csv-input'; inp.style.display='none'; inp.onchange=()=>onScaleCsvFile(inp); document.body.appendChild(inp); }
  inp.value=''; inp.click();
}
// Traite le texte CSV (peu importe l'origine : CSV direct ou Excel converti) → confirm + import
function _scaleCsvImportFromText(text){
  const res=_parseScaleCsv(text);
  if(res.err){ toast('Fichier : '+res.err,'error'); return; }
  const rows=res.rows;
  if(!rows.length){ toast('Aucune pesée lue dans ce fichier','error'); return; }
  const dates=rows.map(r=>r.date).sort();
  const days=new Set(dates).size;
  const doImport=()=>{ const r=_importScaleRows(rows); renderBodyScanCard(); if(typeof renderWeightTab==='function')renderWeightTab(); toast('✅ '+r.days+' pesées importées','success'); };
  if(typeof showConfirm==='function')
    showConfirm('Importer '+days+' pesées ?', rows.length+' mesures lues ('+dates[0]+' → '+dates[dates.length-1]+'). On garde une pesée par jour, tout l\'historique. Les dates déjà présentes sont mises à jour, rien n\'est effacé.', doImport,'Importer');
  else doImport();
}
function onScaleCsvFile(input){
  const f=input.files&&input.files[0]; if(!f)return;
  const isXlsx=/\.xlsx?$/i.test(f.name||'');
  if(isXlsx){
    _loadXlsx().then(()=>{
      const reader=new FileReader();
      reader.onload=e=>{
        try{
          const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
          const ws=wb.Sheets[wb.SheetNames[0]];
          _scaleCsvImportFromText(XLSX.utils.sheet_to_csv(ws));
        }catch(ex){ if(typeof toast==='function')toast('Excel illisible','error'); console.warn('[scale xlsx]',ex); }
      };
      reader.readAsArrayBuffer(f);
    }).catch(()=>{ if(typeof toast==='function')toast('Lecteur Excel indisponible (réseau ?)','error'); });
  } else {
    const reader=new FileReader();
    reader.onload=e=>{ try{ _scaleCsvImportFromText(String(e.target.result||'')); }catch(ex){ if(typeof toast==='function')toast('Erreur lecture','error'); console.warn('[scale csv]',ex); } };
    reader.readAsText(f);
  }
}
// Import photo : lire un rapport de balance pro via l'IA → pré-remplit le formulaire
// Prépare la photo du rapport pour l'IA. Les rapports de balance sont souvent TRÈS hauts :
// on garde une largeur lisible et on DÉCOUPE en tranches (~1300px) pour ne pas perdre le texte.
function _resizeReport(file,cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      try{
        // Largeur cible LISIBLE (1000 px), puis DÉCOUPAGE VERTICAL en tranches ≤ 1400 px de haut.
        // ⚠️ Les exports « vue appli » des rapports sont ÉNORMÉMENT longs (ex. 1290×7623) : réduits
        // en une seule image ils deviennent un filet illisible. On les découpe en tranches lisibles,
        // tirées DIRECTEMENT de la source (pas de canvas géant → sûr sur iOS). 2026-07-13.
        const TW=1000;
        const scale=Math.min(1,TW/img.width);
        const w=Math.round(img.width*scale);
        const fullH=Math.round(img.height*scale);
        const TILE=1400;
        const tiles=[];
        if(fullH<=TILE){
          const c=document.createElement('canvas');c.width=w;c.height=fullH;
          c.getContext('2d').drawImage(img,0,0,w,fullH);
          tiles.push(c.toDataURL('image/jpeg',0.78).split(',')[1]);
        }else{
          const srcTileH=Math.round(TILE/scale), srcOver=Math.round(60/scale);
          let sy=0;
          while(sy<img.height){
            const sh=Math.min(srcTileH,img.height-sy);
            const th=Math.max(1,Math.round(sh*scale));
            const c=document.createElement('canvas');c.width=w;c.height=th;
            c.getContext('2d').drawImage(img,0,sy,img.width,sh,0,0,w,th);
            tiles.push(c.toDataURL('image/jpeg',0.75).split(',')[1]);
            if(sy+sh>=img.height)break;
            sy+=srcTileH-srcOver;
          }
        }
        cb({tiles:tiles, full:tiles[0]});
      }catch(err){if(typeof toast==='function')toast('Image trop grande','error');}
    };
    img.onerror=()=>{if(typeof toast==='function')toast('Image illisible','error');};
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ══════════════════════════════════════════════════════════════════════════════
   🔤 LIRE UN RAPPORT DE BALANCE SUR LE TÉLÉPHONE — sans appel IA (23/08, ft-v974)

   Michel : *« on construit, parce que je l'utilise souvent »*. Jusqu'ici, chaque photo de
   rapport partait vers le serveur IA : un appel facturé, du réseau obligatoire, un quota.

   ⭐ L'ÉCHELLE DES SOURCES (R33) : donnée structurée → texte → OCR → IA → échec propre.
   On descend d'un cran SEULEMENT quand le précédent échoue. L'OCR local est donc essayé
   d'abord ; l'appel IA reste là, intact, pour tout ce que le lecteur ne sait pas lire.

   ⛔ RIEN AU DÉMARRAGE (règle d'or #4) : le moteur (≈ 2,5 Mo) ne se télécharge qu'au premier
   rapport scanné, comme CIQUAL et le lecteur Excel. Il vit ensuite dans un tiroir de cache
   STABLE (`ft-ocr`, voir sw.js) — sinon il repartirait à chaque livraison.

   ⭐⭐ ET LE LECTEUR VÉRIFIE SA PROPRE LECTURE. C'est ce qui sépare « lu » de « juste » :
   mesuré sur les 5 rapports de Michel, une virgule perdue par l'OCR donne un nombre
   parfaitement CRÉDIBLE (sa protéine à 13,8 est sortie à 18,8 en résolution réduite). Aucune
   borne n'attrape ça. Les lignes du rapport, elles, se recoupent — et à 0,05 kg près. Si
   l'arithmétique ne ferme pas, on refuse la lecture et on passe la main à l'IA.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ⚠️ CE QU'ON NE LIT JAMAIS (R32) : « Poids cible », « Mon coaching Expert », « Corpulence ».
   Ce sont des valeurs PROPRIÉTAIRES, sorties d'un modèle du fabricant qu'on ne peut pas ouvrir.
   Le poids cible d'une balance ne devient JAMAIS l'objectif de la personne. */

// Le vocabulaire du fabricant ne devient jamais le vocabulaire interne (R33) : la traduction se
// fait ICI, une fois. Aucun autre module n'a à connaître les mots de MyBodyCheck.
const _MBC_TABLE=[
  {re:/^poids\s/i,                 kg:'weight'},
  {re:/^graisse\s+corporelle\s/i,  kg:'fatMass', pct:'bf'},
  {re:/^masse\s+osseuse\s/i,       kg:'bone'},
  {re:/^prot[ée]ine\s/i,           kg:'protein'},
  {re:/^eau\s+corporelle\s/i,      kg:'water'},
  {re:/^muscle\s+squelettique\s/i, kg:'skMuscle'},
  {re:/^muscle\s/i,                kg:'muscle'}        // APRÈS « muscle squelettique »
];
const _MBC_INDIC=[
  {re:/indice\s+de\s+graisse\s+visc[ée]rale\D{0,4}([\d.,]+)/i,            k:'visceral'},
  {re:/taux\s+m[ée]tabolique\s+de\s+base\D{0,4}([\d.,]+)\s*k?cal/i,       k:'bmr'},
  {re:/masse\s+maigre\D{0,4}([\d.,]+)\s*kg/i,                             k:'leanMass'},
  {re:/indice\s+de\s+masse\s+musculaire\s+squelettique\D{0,4}([\d.,]+)/i, k:'smi'},
  {re:/[ÂA]ge\s+corporel\D{0,4}([\d.,]+)/i,                               k:'metaAge'}
];
/* ⛔ AUCUNE VALEUR N'EST ACCEPTÉE HORS DE SON DOMAINE PHYSIQUE.
   ⛔⛔ ET « GRAISSE SOUS-CUTANÉE » N'EST PAS LUE DU TOUT (R30 — un retrait s'écrit). Mesuré sur
   les 5 rapports : 13,5 / 14,0 / 14,3 / 14,0 sortent en « 135 », « 140 », « 43 », « 140 » — la
   virgule est mangée à chaque fois, parce que la ligne chevauche le tableau d'impédance juste à
   côté. Quatre lectures fausses sur cinq, et « 43 » tombe DANS le domaine plausible. Or aucune
   équation du rapport ne la recoupe : rien ne pourrait la démentir.
   *Une valeur qu'on ne sait ni lire ni vérifier ne s'affiche pas.* Le champ reste saisissable. */
const _MBC_BORNES={
  weight:[20,300], bf:[2,70], fatMass:[0.5,150], muscle:[10,120], skMuscle:[5,80],
  bone:[0.3,8], water:[10,120], protein:[1,40], visceral:[1,60], bmr:[600,4500],
  metaAge:[10,110], bodyScore:[20,130], leanMass:[15,150], smi:[2,25]
};
/* ⛔⛔ LES 8 VALEURS DU TABLEAU PRINCIPAL SONT OBLIGATOIRES. Sans elles, on ne présente PAS une
   lecture « vérifiée » : un champ écarté par ses bornes emporte avec lui l'équation qui l'aurait
   démasqué — donc l'absence se déguiserait en succès. Trouvé en ÉTENDANT le contrôle positif
   (« Muscle 4.5 » passait pour une lecture correcte). Rapport incomplet → on passe la main. */
const _MBC_ESSENTIELS=['weight','bf','fatMass','bone','protein','water','muscle','skMuscle'];
const _MBC_MOIS={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};

function _mbcNum(s){const n=parseFloat(String(s).replace(/\s/g,'').replace(',','.'));return isNaN(n)?null:n;}
function _mbcBorne(k,v){const b=_MBC_BORNES[k];if(v==null)return null;if(b&&(v<b[0]||v>b[1]))return null;return v;}

/* Est-ce bien un rapport de composition corporelle ? On ne devine pas : deux marqueurs. */
function _mbcReconnu(txt){
  const t=String(txt||'').toLowerCase();
  return /composition\s+corporelle/.test(t) && /muscle\s+squelettique/.test(t);
}

function _mbcLire(txt){
  const lignes=String(txt||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const o={}, lus=[];
  const pose=(k,v)=>{v=_mbcBorne(k,v);if(v!=null&&o[k]==null){o[k]=v;lus.push(k);}};

  /* 1. Le tableau principal : « Libellé  <kg> (<plage>)  <part %>  <évaluation> »
     ⚠️ LA PLAGE ENTRE PARENTHÈSES EST UN PIÈGE CONNU (corrigé côté serveur en @71) : elle est
     consommée explicitement par le motif, jamais laissée au hasard d'un « premier nombre ». */
  lignes.forEach(l=>{
    for(const d of _MBC_TABLE){
      if(!d.re.test(l))continue;
      const m=l.match(/^\D+?([\d.,]+)\s*\(\s*[\d.,]+\s*[-–]\s*[\d.,]+\s*\)\s*([\d.,]+)?/);
      if(!m)break;
      pose(d.kg,_mbcNum(m[1]));
      if(d.pct&&m[2]!=null)pose(d.pct,_mbcNum(m[2]));
      break;                                   // une ligne = un libellé
    }
  });

  const plat=lignes.join('\n');
  // 2. « Autres indicateurs » — une paire libellé/valeur par ligne
  _MBC_INDIC.forEach(d=>{const m=plat.match(d.re);if(m)pose(d.k,_mbcNum(m[1]));});

  /* 3. Le score corporel (« 83/100Points »). ⚠️ L'OCR coupe parfois le nombre en deux
     (« 8 1 100Points » sur le rapport du 27/07) : la borne basse à 20 refuse ce « 1 » — le champ
     reste vide plutôt que d'annoncer un score corporel de 1 sur 100. */
  const sc=plat.match(/(\d{1,3})\s*[\/|]?\s*100\s*Points/i);
  if(sc)pose('bodyScore',_mbcNum(sc[1]));

  // 4. La date de la mesure — mois en anglais abrégé dans ce rapport
  const dm=plat.match(/mesures?\s*:?\s*([A-Za-zÉé]{3})\w*\.?\s*(\d{1,2})\s*,\s*(\d{4})/);
  if(dm){
    const mo=_MBC_MOIS[dm[1].slice(0,3).toLowerCase()];
    if(mo)o.date=dm[3]+'-'+String(mo).padStart(2,'0')+'-'+String(+dm[2]).padStart(2,'0');
  }

  /* 5. LA MASSE MAIGRE SE RETROUVE PAR SOUSTRACTION quand l'OCR la perd (les deux colonnes du
     rapport s'entrelacent parfois). Même repli déterministe que le backend depuis le 30/07/2026 :
     jamais d'IA là où une soustraction suffit. */
  if(o.leanMass==null&&o.weight!=null&&o.fatMass!=null){
    pose('leanMass',Math.round((o.weight-o.fatMass)*10)/10);
    o._maigreDeduite=true;   // ⚠️ marquée DÉDUITE : elle ne peut plus servir à se vérifier elle-même
  }
  return {champs:o,lus:lus};
}

function _mbcVerifier(o){
  const T=0.35, ctrl=[];
  const dit=(nom,a,b)=>{if(a==null||b==null)return;ctrl.push({nom:nom,ecart:Math.round(Math.abs(a-b)*100)/100,ok:Math.abs(a-b)<=T});};
  if(o.weight!=null&&o.bf!=null) dit('gras = poids × %',o.weight*o.bf/100,o.fatMass);
  /* ⛔⛔ UN CONTRÔLE CIRCULAIRE EST UN FAUX VERT. Quand la masse maigre a été DÉDUITE par
     soustraction, « maigre = poids − gras » se vérifie lui-même : il ne peut pas échouer, donc
     il ne mesure rien. On ne le compte que si la valeur a vraiment été LUE sur le rapport. */
  if(o.weight!=null&&o.fatMass!=null&&!o._maigreDeduite)
    dit('maigre = poids − gras',o.weight-o.fatMass,o.leanMass);
  if(o.fatMass!=null&&o.water!=null&&o.protein!=null&&o.bone!=null)
    dit('gras+eau+protéine+os = poids',o.fatMass+o.water+o.protein+o.bone,o.weight);
  if(o.muscle!=null&&o.bone!=null&&o.fatMass!=null)
    dit('muscle+os+gras = poids',o.muscle+o.bone+o.fatMass,o.weight);
  const manque=_MBC_ESSENTIELS.filter(k=>o[k]==null);
  return {ok:manque.length===0&&ctrl.length>=2&&ctrl.every(c=>c.ok),ctrl:ctrl,manque:manque};
}

/* ── Le moteur, chargé à la demande (même motif que le lecteur Excel `_loadXlsx`) ────────── */
let _ocrLoad=null;
function _loadOcr(){
  if(window.Tesseract)return Promise.resolve();
  if(_ocrLoad)return _ocrLoad;
  _ocrLoad=new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='./lib/ocr/tesseract.min.js';
    s.onload=res;
    s.onerror=()=>{_ocrLoad=null;rej(new Error('moteur de lecture indisponible'));};
    document.head.appendChild(s);
  });
  return _ocrLoad;
}

/* ⚠️ L'OCR NE LIT PAS L'IMAGE RÉDUITE DE `_resizeReport` (1000 px de large) : c'est EXACTEMENT à
   cette largeur que les virgules disparaissent — mesuré, la protéine sortait à 18,8 au lieu de
   13,8. On repart donc de la photo d'origine, plafonnée à 1900 px. R14 : une image préparée pour
   l'IA n'est pas une image préparée pour l'OCR. */
const _OCR_LARGEUR=1900;
function _ocrImage(dataUrl){
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onerror=()=>rej(new Error('image illisible'));
    img.onload=()=>{
      try{
        if(img.width<=_OCR_LARGEUR)return res(img);
        const sc=_OCR_LARGEUR/img.width;
        const c=document.createElement('canvas');
        c.width=_OCR_LARGEUR; c.height=Math.round(img.height*sc);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        const out=new Image();
        out.onload=()=>res(out);
        out.onerror=()=>rej(new Error('image illisible'));
        out.src=c.toDataURL('image/png');
      }catch(err){rej(new Error('image trop grande'));}
    };
    img.src=dataUrl;
  });
}
// Lit le fichier UNE fois en dataURL : la même sert à l'aperçu du scan et à l'OCR (R2).
function _ocrDataUrl(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onerror=()=>rej(new Error('image illisible'));
    r.onload=e=>res(e.target.result);
    r.readAsDataURL(file);
  });
}

/* Lit la photo SUR LE TÉLÉPHONE. Rend `null` — jamais une exception — dès que quoi que ce soit
   cloche : ce chemin est un BONUS, il ne doit jamais empêcher la lecture IA de se produire. */
async function _ocrRapportBalance(dataUrl){
  try{
    await _loadOcr();
    const img=await _ocrImage(dataUrl);
    const w=await window.Tesseract.createWorker('fra',1,{
      workerPath:'./lib/ocr/worker.min.js',
      corePath:'./lib/ocr/',
      langPath:'./lib/ocr/',
      logger:function(){}
    });
    let txt='';
    try{ const r=await w.recognize(img); txt=(r&&r.data&&r.data.text)||''; }
    finally{ try{ await w.terminate(); }catch(_){} }
    if(!_mbcReconnu(txt))return null;                    // pas un rapport de ce type → échec propre
    const lu=_mbcLire(txt);
    const v=_mbcVerifier(lu.champs);
    window._ocrDernier={lus:lu.lus.length,ok:v.ok,ctrl:v.ctrl,manque:v.manque};  // diagnostic
    if(!v.ok)return null;                                // l'arithmétique ne ferme pas → on passe la main
    /* 🏷️ ON NE JETTE PLUS LE MARQUEUR « VALEUR DÉDUITE » (23/08/2026, ft-v978).
       Il était supprimé ici même, en ft-v974 : la masse maigre retrouvée par SOUSTRACTION
       arrivait donc au formulaire indiscernable d'une valeur LUE sur le rapport. Or R33 demande
       que ce qui est normalisé garde d'où il vient — *sinon, six mois plus tard, 68,7 kg ne dira
       plus s'il a été lu, calculé ou tapé.* Et Milo, lui, la présente comme « MESURÉE ». */
    return lu.champs;
  }catch(e){
    window._ocrDernier={erreur:(e&&e.message)||'inconnue'};
    return null;
  }
}

/* R2 — UN SEUL ENDROIT QUI REMPLIT LE FORMULAIRE, que la lecture vienne de l'OCR ou de l'IA.
   Deux chemins séparés finiraient par diverger, et le correctif d'ordonnancement de ft-v971
   (« openBodyScanForm est async, il faut l'attendre ») ne tiendrait plus que d'un côté. */
async function _bsRemplirFormulaire(o,source){
  await openBodyScanForm(-1);
  /* ⚠️ Si le verrou santé a refusé, la modale n'est pas ouverte : on ne remplit pas des champs
     invisibles et on ne prétend pas que le rapport est prêt. */
  const ouvert=document.getElementById('ov-bodyscan-form');
  if(!ouvert||!ouvert.classList.contains('open'))return 0;
  _bsSource=source||'manuel';     // APRÈS l'ouverture, qui vient de le remettre à « manuel »
  _bsLmDeduite=!!(o&&o._maigreDeduite);   // 🏷️ la masse maigre a-t-elle été DÉDUITE (poids − gras) ?
  if(o.date){const dEl=document.getElementById('bs-date');if(dEl)dEl.value=o.date;}
  let remplis=0;
  _BS_FIELDS.concat(_BS_SEG_FIELDS).forEach(f=>{
    const el=document.getElementById('bs-'+f.k);
    if(el&&o[f.k]!=null&&o[f.k]!==''){el.value=o[f.k];remplis++;}
  });
  /* ⛔ ON NE DIT PAS « Rapport lu ✅ » SI RIEN N'A ÉTÉ REMPLI. C'est précisément ce silence qui a
     masqué le bug de ft-v971 pendant deux imports : le message de succès s'affichait devant un
     formulaire vide, donc rien ne signalait que l'appel venait d'être gaspillé. */
  if(!remplis){toast('Rapport lu mais aucune valeur reconnue — saisis à la main','warn');return 0;}
  toast((source==='ocr'?'Rapport lu sur ton téléphone ✅ ':'Rapport lu ✅ ')
        +remplis+' valeurs — vérifie puis Enregistre','success');
  return remplis;
}

function importBodyScanPhoto(){const inp=document.getElementById('bs-photo-input');if(inp){inp.value='';inp.click();}}
const BODYSCAN_FREE_LIMIT=2; // décision Michel 31/07 : 2 lectures photo gratuites, ILLIMITÉ en Premium (avant : 10 pour tous, le Premium ne levait même pas la limite). Saisie main/code toujours gratuite.
function _bodyScanPhotoUnlimited(){return !!S.premium||(typeof _isSuperTester==='function'&&_isSuperTester());}
async function onBodyScanPhoto(input){
  const file=input.files&&input.files[0];if(!file)return;input.value='';

  /* ⭐ ÉTAGE 1 — LA LECTURE SUR LE TÉLÉPHONE (ft-v974). Gratuite, hors ligne, sans quota.
     ⛔⛔ ET ELLE PASSE AVANT LES DEUX VERROUS DU DESSOUS, EXPRÈS : ni `S.url` (elle n'a besoin
     d'aucun serveur) ni le quota de lectures IA (elle ne coûte aucun appel). Quelqu'un qui a
     épuisé ses lectures gratuites peut donc quand même scanner son rapport.
     ⛔ Si quoi que ce soit cloche — moteur indisponible, document non reconnu, arithmétique qui
     ne ferme pas — `_ocrRapportBalance` rend `null` et on descend d'un cran (R33). */
  let apercu=null;
  try{ apercu=await _ocrDataUrl(file); }catch(_){}
  if(apercu){
    _showBsScan(apercu,'🔍 Lecture du rapport…','Sur ton téléphone, sans réseau','Chargement du lecteur…');
    const local=await _ocrRapportBalance(apercu);
    if(local){
      _hideBsScan(()=>{ _bsRemplirFormulaire(local,'ocr'); });
      return;                                   // 0 appel IA, 0 quota consommé
    }
    /* ⛔ ON NE FERME PAS L'ÉCRAN DE SCAN ICI. `_hideBsScan` attend 1,4 s AVANT de fermer : la
       lecture IA rouvrirait l'écran juste après, et le minuteur le refermerait en pleine
       analyse. On laisse l'écran ouvert et on change seulement son texte — il sera fermé par le
       chemin IA, ou tout de suite par les deux sorties ci-dessous. */
    const st=document.getElementById('bs-scan-sub');
    if(st)st.textContent='Lecture approfondie…';
  }
  const _fermeScan=()=>{const ov=document.getElementById('ov-bs-scan');if(ov)ov.classList.remove('open');};

  /* ÉTAGE 2 — la lecture par l'IA, inchangée : c'est elle qui traite tout ce que le lecteur
     local ne sait pas lire (autres marques, photos de travers, rapports partiels). */
  if(!S.url){_fermeScan();toast('Coach non configuré (Profil > Admin)','error');return;}
  // Lecture photo : illimitée pour super-testeurs (Michel/Christophe), 1 seule fois pour les autres. Saisie main/code = gratuite.
  const unlimited=_bodyScanPhotoUnlimited();
  if(!unlimited&&(S.bodyScanImports||0)>=BODYSCAN_FREE_LIMIT){
    _fermeScan();
    toast('Lecture photo : tes '+BODYSCAN_FREE_LIMIT+' lectures gratuites sont utilisées 🙂 Illimitée en Premium — la saisie à la main reste gratuite.','info');
    if(typeof openPremiumInfo==='function')setTimeout(openPremiumInfo,600);
    return;
  }
  _resizeReport(file,async(out)=>{
    try{
      const tiles=(out&&out.tiles)?out.tiles:(Array.isArray(out)?out:[out]);
      const full=(out&&out.full)?out.full:tiles[0];
      _showBsScan('data:image/jpeg;base64,'+full); // retour visuel : scan du rapport pendant la lecture IA
      // ENVOI comme l'import de programme (qui MARCHE) : plusieurs images en tranches lisibles.
      // ⚠️ On lit .text() (pas .json() direct) → si le serveur renvoie autre chose que du JSON
      // (page d'erreur, redirection), on VOIT le contenu au lieu d'un « Load failed » opaque.
      // + 3 tentatives : sur 4G capricieuse, un « Load failed » réseau réussit souvent au 2e essai.
      const images=tiles.map(t=>({data:t,type:'image/jpeg'}));
      const payload=JSON.stringify({action:'importBodyScan',images,email:S.email||''});
      window._bsLastKb=Math.round(payload.length/1024); window._bsLastTiles=tiles.length; // diagnostic
      let raw='', netErr=null;
      for(let attempt=1;attempt<=3;attempt++){
        try{
          const r=await fetch(_aiUrl('importBodyScan'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:payload});
          raw=await r.text(); netErr=null; break;               // réponse reçue (JSON ou pas)
        }catch(err){
          netErr=err;                                            // « Load failed » = échec réseau AVANT toute réponse
          if(attempt<3) await new Promise(res=>setTimeout(res,1200*attempt)); // backoff 1,2s puis 2,4s
        }
      }
      if(netErr) throw new Error('réseau ('+((netErr&&netErr.message)||'échec')+') après 3 essais');
      let data;
      try{ data=JSON.parse(raw); }
      catch(_){ throw new Error('réponse serveur : '+(raw?raw.slice(0,70):'(vide)')); }
      if(data.status!=='ok'||!data.data)throw new Error(data.error||'lecture impossible');
      const o=data.data;
      if(!unlimited){S.bodyScanImports=(S.bodyScanImports||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();}
      /* ⛔⛔ `openBodyScanForm` EST `async` — IL FAUT L'ATTENDRE (23/08/2026, ft-v971).
         Michel : *« c'est la 2ᵉ fois que je scanne, mes poids ne prennent pas sur la première
         analyse, il faut que je remette une 2ᵉ fois — ça fait 4 appels API au lieu de 2 »*.
         ⭐ MESURÉ DANS UN VRAI NAVIGATEUR, pas déduit : à la 1ʳᵉ passe, **0 champ sur 16** est
         trouvé, et à la 2ᵉ les 16 sont remplis **puis effacés**.
         👉 LA CAUSE : `openBodyScanForm` est devenue `async` en ft-v758 (le verrou santé y a
         ajouté `await _healthGate()`). Appelée SANS `await`, elle rend la main **avant** de
         construire la grille de champs — donc `getElementById('bs-weight')` renvoie `null`, rien
         n'est rempli, puis la construction repart et remplace tout par des champs VIDES.
         ⚠️ *Le drame est qu'aucune erreur n'est levée* : `if(el && ...)` avale silencieusement
         l'absence, et la lecture IA — qui a bien réussi et coûté son appel — est jetée. **C'est
         `R14` : rendre une fonction asynchrone change le contrat de TOUS ses appelants**, et
         celui-ci n'avait pas été revu.
         ⛔ ET ÇA COÛTE DE L'ARGENT, pas seulement du confort : chaque tentative est un appel
         vision facturé. Un défaut d'ordonnancement se payait en quota IA. */
      /* R2 — LE MÊME REMPLISSAGE QUE LA LECTURE LOCALE. `_bsRemplirFormulaire` porte le
         `await openBodyScanForm(-1)` de ft-v971, le refus silencieux du verrou santé et le
         compte de valeurs. Deux copies finiraient par diverger, et le correctif ne tiendrait
         plus que d'un côté. */
      _hideBsScan(()=>{ _bsRemplirFormulaire(o,'ia'); });
    }catch(e){
      // Diagnostic : nb de tranches + poids du paquet + type d'erreur → on voit tout de suite si c'est la taille.
      const detail=(e&&e.message)||'erreur inconnue';
      const info=window._bsLastTiles?(' ['+window._bsLastTiles+' img · '+window._bsLastKb+' Ko]'):'';
      _hideBsScan(()=>toast('Souci lecture'+info+' : '+detail,'error'));
    }
  });
}
// POST du rapport corporel avec retry réseau (3 tentatives, backoff). Fetch IDENTIQUE au Coach
// photo (qui marche) : pas d'AbortController. Ne retente QUE sur échec réseau (fetch rejeté) ;
// une réponse reçue mais illisible n'est pas retentée.
// Envoi via XMLHttpRequest (et non fetch) : sur iOS Safari, un POST cross-origin avec un corps
// « image » peut être rejeté INSTANTANÉMENT par fetch (« envoi 1s : TypeError: Load failed »)
// alors que XHR passe — stack réseau différente. XHR suit le redirect Apps Script tout seul.
function _xhrPostText(url,body,timeoutMs){
  return new Promise((resolve,reject)=>{
    try{
      const xhr=new XMLHttpRequest();
      xhr.open('POST',url,true);
      try{ xhr.setRequestHeader('Content-Type','text/plain;charset=utf-8'); }catch(e){}
      if(timeoutMs)xhr.timeout=timeoutMs;
      xhr.onload=()=>resolve({status:xhr.status,text:xhr.responseText||''});
      xhr.onerror=()=>reject(new Error('XHR onerror'+(xhr.status?' '+xhr.status:'')));
      xhr.ontimeout=()=>reject(new Error('XHR timeout'));
      xhr.onabort=()=>reject(new Error('XHR abort'));
      xhr.send(body);
    }catch(e){ reject(e); }
  });
}
async function _postBodyScan(payload){
  let lastErr;
  for(let attempt=0;attempt<3;attempt++){
    if(attempt>0)await new Promise(r=>setTimeout(r,attempt*1500)); // backoff 1,5 s puis 3 s
    const t0=Date.now();
    let r;
    try{
      r=await _xhrPostText(S.url,payload,90000);
    }catch(e){ lastErr=new Error('envoi '+Math.round((Date.now()-t0)/1000)+'s ('+(e.message||'?')+')'); continue; } // échec → on retente
    try{ return JSON.parse(r.text); }
    catch(e){ throw new Error('réponse illisible (HTTP '+(r.status||'?')+')'); } // réponse reçue → pas de retry
  }
  throw lastErr||new Error('réseau');
}
// Overlay « analyse en cours » (min ~1,4 s pour un retour visible même si le serveur répond vite)
let _bsScanStart=0;
function _showBsScan(src,title,sub,foot){
  const img=document.getElementById('bs-scan-img');if(img)img.src=src||'';
  const t=document.getElementById('bs-scan-title');if(t)t.textContent=title||'🔍 Analyse du rapport…';
  const s=document.getElementById('bs-scan-sub');if(s)s.textContent=sub||'L\'IA lit tes chiffres';
  const f=document.getElementById('bs-scan-foot');if(f)f.innerHTML='<span class="bs-scan-dot"></span>'+(foot||'Détection des valeurs…');
  const ov=document.getElementById('ov-bs-scan');if(ov)ov.classList.add('open');
  _bsScanStart=Date.now();
}
// Alias générique pour toutes les analyses IA (photos incluses)
function showScanOverlay(src,title,sub,foot){_showBsScan(src,title,sub,foot);}
function hideScanOverlay(cb){_hideBsScan(cb);}
function _hideBsScan(cb){
  const wait=Math.max(0,1400-(Date.now()-_bsScanStart));
  setTimeout(()=>{const ov=document.getElementById('ov-bs-scan');if(ov)ov.classList.remove('open');if(cb)cb();},wait);
}
// Import rapide : coller un code "date=...;weight=...;bf=..." (préparé par Claude) → remplit le formulaire
function _parseBilanCode(str){
  const o={};
  String(str||'').split(/[;\n,]+/).forEach(pair=>{
    const i=pair.indexOf('=');if(i<0)return;
    const k=pair.slice(0,i).trim();const v=pair.slice(i+1).trim();
    if(k==='date'){o.date=v;return;}
    const n=parseFloat(v.replace(',','.'));if(!isNaN(n))o[k]=n;
  });
  return o;
}
function pasteBodyScan(){
  const t=prompt('Colle ici le code du bilan (fourni par Claude) :');
  if(!t)return;
  const o=_parseBilanCode(t);
  if(!o||!o.weight){toast('Code non reconnu — vérifie le collage','error');return;}
  openBodyScanForm(-1);
  if(o.date){const dEl=document.getElementById('bs-date');if(dEl)dEl.value=o.date;}
  _BS_FIELDS.forEach(f=>{const e=document.getElementById('bs-'+f.k);if(e&&o[f.k]!=null)e.value=o[f.k];});
  toast('Vérifie puis Enregistre ✅','info');
}
async function openBodyScanForm(idx){
  if(!await _healthGate())return;          // verrou santé (Michel, 04/08)
  /* 🏷️ D'OÙ VIENT CE BILAN (R33) — remis à « saisie main » à CHAQUE ouverture, et reposé
     ensuite par `_bsRemplirFormulaire` si la lecture vient de l'OCR ou de l'IA. Sans ce
     retour à zéro, un bilan tapé à la main hériterait de la provenance du précédent. */
  _bsSource='manuel'; _bsLmDeduite=false;
  _bsEditIdx=idx;
  const grid=document.getElementById('bs-grid');
  const dateEl=document.getElementById('bs-date');
  const delBtn=document.getElementById('bs-del-btn');
  const sc=(idx>=0&&S.bodyScans&&S.bodyScans[idx])?S.bodyScans[idx]:null;
  if(dateEl)dateEl.value=sc?sc.date:today();   // date du TÉLÉPHONE (ft-v655)
  const inpHtml=f=>`<div>
    <label style="font-size:11px;color:var(--t3);display:block;margin-bottom:3px;">${f.l}${f.u?' ('+f.u+')':''}${f.req?' *':''}</label>
    <input type="text" id="bs-${f.k}" step="0.1" inputmode="decimal" value="${sc&&sc[f.k]!=null?sc[f.k]:''}" placeholder="—" style="width:100%;padding:9px 10px;border-radius:9px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);box-sizing:border-box;">
  </div>`;
  if(grid)grid.innerHTML=_BS_FIELDS.map(inpHtml).join('');
  const seg=document.getElementById('bs-seg-grid');
  if(seg)seg.innerHTML=_BS_SEG_FIELDS.map(inpHtml).join('');
  if(delBtn)delBtn.style.display=sc?'block':'none';
  const ov=document.getElementById('ov-bodyscan-form');if(ov)ov.classList.add('open');
}
function closeBodyScanForm(){const ov=document.getElementById('ov-bodyscan-form');if(ov)ov.classList.remove('open');}
function saveBodyScan(){
  const dEl=document.getElementById('bs-date');const date=dEl?dEl.value:'';
  if(!date){toast('Choisis une date','error');return;}
  const wEl=document.getElementById('bs-weight');const weight=wEl?numFR(wEl.value):NaN;
  if(!weight||weight<=0){toast('Le poids est obligatoire','error');return;}
  const obj={date};
  _BS_FIELDS.concat(_BS_SEG_FIELDS).forEach(f=>{const e=document.getElementById('bs-'+f.k);if(!e)return;const v=numFR(e.value);if(!isNaN(v))obj[f.k]=v;});
  if((obj.imc==null||isNaN(obj.imc))&&S.height){obj.imc=+(weight/Math.pow(S.height/100,2)).toFixed(1);}
  /* 🏷️ CE QUI EST NORMALISÉ GARDE D'OÙ IL VIENT (R33). Sans ça, impossible d'auditer plus tard
     une valeur douteuse — ni de savoir si elle a été LUE, CALCULÉE ou tapée à la main. */
  if(_bsSource&&_bsSource!=='manuel')obj.src=_bsSource;
  /* 🏷️ ET SI LA MASSE MAIGRE A ÉTÉ DÉDUITE, LE BILAN LE DIT (ft-v978). Elle n'est alors pas une
     lecture mais une soustraction (poids − masse grasse), elle-même issue d'un pourcentage de
     gras ESTIMÉ par la balance. ✅ LU DEPUIS ft-v991 : `leanMassRecente()` le transporte en
     `nature:'deduite'` et Milo l'apprend en toutes lettres. Le comportement différé annoncé ici
     par ft-v978 est donc HONORÉ — le prompt ne dit plus « MESURÉE … SOLIDE … sans réserve ». */
  if(_bsLmDeduite&&obj.leanMass!=null)obj.lmDeduite=true;
  S.bodyScans=S.bodyScans||[];
  if(_bsEditIdx>=0&&S.bodyScans[_bsEditIdx]){S.bodyScans[_bsEditIdx]=obj;}
  else{const ex=S.bodyScans.findIndex(s=>s.date===date);if(ex>=0)S.bodyScans[ex]=obj;else S.bodyScans.push(obj);}
  S.bodyScans.sort((a,b)=>b.date.localeCompare(a.date));
  // Le bilan sert aussi de pesée du jour : met à jour poids + masse grasse (courbes)
  if(!S.weightLog)S.weightLog=[];
  const wi=S.weightLog.findIndex(w=>w.date===date);
  const wentry=wi>=0?S.weightLog[wi]:{date};
  wentry.kg=weight;
  if(obj.bf!=null)wentry.bf=obj.bf;
  if(wi<0)S.weightLog.unshift(wentry);
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  if(S.weightLog[0])S.bw=S.weightLog[0].kg;
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeBodyScanForm();
  if(typeof renderWeightTab==='function')renderWeightTab(); else renderBodyScanCard();
  if(typeof renderHome==='function')renderHome();
  toast('Bilan enregistré ✅ (poids + masse grasse mis à jour)','success');
}
function deleteBodyScan(){
  if(_bsEditIdx<0||!S.bodyScans||!S.bodyScans[_bsEditIdx])return;
  showConfirm('Supprimer ce bilan ?','Action définitive.',function(){
    S.bodyScans.splice(_bsEditIdx,1);persist();
    if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    closeBodyScanForm();renderBodyScanCard();toast('Bilan supprimé','info');
  });
}

// ─── BILAN SANGUIN (bêta : Michel + Christophe) — PDF/photo → masquage identité → lecture IA ───
function _isBloodBeta(){
  // Décision Michel 31/07 : la carte prise de sang est VISIBLE PAR TOUS (fin de la bêta à
  // 2 emails) — mais l'ANALYSE IA est réservée aux Premium (porte dans _analyzeBloodRedacted).
  // Fonction gardée pour ne pas chasser les usages (même principe que _isNutriBeta).
  return true;
}
let _bloodPages=[], _bloodRects=[], _bloodPageIdx=0, _bloodImg=null, _bloodEditIdx=-1;
function _bloodOut(m){ if(!m||m.value==null)return false; if(m.low!=null&&m.value<m.low)return true; if(m.high!=null&&m.value>m.high)return true; return false; }
function renderBloodCard(){
  const titleEl=document.getElementById('bloodtest-sec-title');
  const el=document.getElementById('bloodtest-section');
  if(!el)return;
  if(!_isBloodBeta()){ if(titleEl)titleEl.style.display='none'; el.innerHTML=''; return; }
  if(titleEl)titleEl.style.display='';
  const tests=(S.bloodTests||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(!tests.length){
    el.innerHTML=`<div class="card cp" style="text-align:center;">
      <div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:10px;">Importe ton bilan sanguin (PDF ou photo). Tu masques d'abord tes infos perso 🔒, puis l'appli lit tous les marqueurs et suit leur évolution. Bêta — visible rien que pour toi.</div>
      <button class="btn btn-red" style="width:100%;" onclick="openBloodImport()">🩸 Importer un bilan sanguin</button></div>`;
    return;
  }
  const last=tests[0];
  const nOut=(last.markers||[]).filter(_bloodOut).length;
  const dstr=last.date?new Date(last.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):'—';
  let html=`<div class="card cp" onclick="openBloodTest(${S.bloodTests.indexOf(last)})" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-weight:800;font-size:14px;">Dernier bilan · ${dstr}</div>
      <div style="font-size:12px;color:var(--t2);margin-top:3px;">${(last.markers||[]).length} marqueurs${nOut?` · <span style="color:#FF9500;">${nOut} hors norme</span>`:` · <span style="color:#22C55E;">tous dans la norme</span>`}</div></div>
    <span style="color:var(--t3);font-size:20px;">›</span></div>`;
  if(tests.length>1){
    html+=`<div style="display:flex;flex-direction:column;gap:6px;">`;
    tests.forEach(t=>{const i=S.bloodTests.indexOf(t);const dd=t.date?new Date(t.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'}):'—';
      html+=`<div onclick="openBloodTest(${i})" style="display:flex;justify-content:space-between;background:var(--bg2);border-radius:10px;padding:10px 12px;cursor:pointer;box-shadow:inset 0 0 0 1px var(--sep);"><span style="font-size:13px;font-weight:700;">${dd}</span><span style="font-size:12px;color:var(--t2);">${(t.markers||[]).length} marqueurs</span></div>`;});
    html+=`</div>`;
  }
  html+=`<button class="btn btn-red" style="width:100%;" onclick="openBloodImport()">🩸 Importer un bilan sanguin</button>`;
  el.innerHTML=html;
}
async function openBloodImport(){
  if(!await _healthGate())return;          // verrou santé (Michel, 04/08)
  const inp=document.getElementById('blood-file-input');if(inp){inp.value='';inp.click();}
}
async function onBloodFile(input){
  const f=input.files&&input.files[0];if(!f)return;input.value='';
  toast('Préparation du fichier…','info');
  try{
    let pages=[];
    if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){
      const imgs=await _pdfToImages(f); pages=imgs.map(p=>p.data);
    }else{ pages=[await _bloodResizeImg(f)]; }
    if(!pages.length){toast('Fichier illisible','error');return;}
    _bloodPages=pages; _bloodRects=pages.map(()=>[]); _bloodPageIdx=0;
    _showBloodRedact();
  }catch(e){toast('Souci lecture fichier : '+(e.message||'réessaie'),'error');}
}
function _bloodResizeImg(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,h=img.height;if(w>=h){if(w>max){h=Math.round(h*max/w);w=max;}}else{if(h>max){w=Math.round(w*max/h);h=max;}}const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);res(cv.toDataURL('image/jpeg',0.85).split(',')[1]);};img.onerror=rej;img.src=e.target.result;};r.onerror=rej;r.readAsDataURL(f);});}
function _showBloodRedact(){const ov=document.getElementById('ov-blood-redact');if(ov)ov.classList.add('open');_bloodDrawPage();}
function closeBloodRedact(){const ov=document.getElementById('ov-blood-redact');if(ov)ov.classList.remove('open');}
function _bloodRedactNav(d){const n=_bloodPageIdx+d;if(n<0||n>=_bloodPages.length)return;_bloodPageIdx=n;_bloodDrawPage();}
function _bloodRedactUndo(){const r=_bloodRects[_bloodPageIdx];if(r&&r.length){r.pop();_bloodRedraw();}}
function _bloodDrawPage(){
  const cv=document.getElementById('blood-redact-canvas');const pg=document.getElementById('blood-redact-page');
  if(pg)pg.textContent='Page '+(_bloodPageIdx+1)+' / '+_bloodPages.length;
  const img=new Image();
  img.onload=()=>{ _bloodImg=img; cv.width=img.naturalWidth; cv.height=img.naturalHeight; _bloodRedraw(); _bloodBindTouch(cv); };
  img.src='data:image/jpeg;base64,'+_bloodPages[_bloodPageIdx];
}
function _bloodRedraw(dragRect){
  const cv=document.getElementById('blood-redact-canvas');if(!cv||!_bloodImg)return;const ctx=cv.getContext('2d');
  ctx.drawImage(_bloodImg,0,0,cv.width,cv.height);
  ctx.fillStyle='#000';
  (_bloodRects[_bloodPageIdx]||[]).forEach(r=>ctx.fillRect(r.x*cv.width,r.y*cv.height,r.w*cv.width,r.h*cv.height));
  if(dragRect){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(dragRect.x*cv.width,dragRect.y*cv.height,dragRect.w*cv.width,dragRect.h*cv.height);}
}
function _normRect(a,b){return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)};}
function _bloodBindTouch(cv){
  if(cv._bloodBound)return; cv._bloodBound=true;
  let start=null;
  const pt=(ev)=>{const rect=cv.getBoundingClientRect();const t=ev.touches?ev.touches[0]:ev;return {x:(t.clientX-rect.left)/rect.width,y:(t.clientY-rect.top)/rect.height};};
  const down=(ev)=>{ev.preventDefault();start=pt(ev);};
  const move=(ev)=>{if(!start)return;ev.preventDefault();_bloodRedraw(_normRect(start,pt(ev)));};
  const up=(ev)=>{if(!start)return;ev.preventDefault();const r=_normRect(start,pt(ev));if(r.w>0.008&&r.h>0.004)(_bloodRects[_bloodPageIdx]=_bloodRects[_bloodPageIdx]||[]).push(r);start=null;_bloodRedraw();};
  cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up,{passive:false});
  cv.addEventListener('mousedown',down);cv.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
}
function _bloodApplyRedact(i){return new Promise(res=>{const img=new Image();img.onload=()=>{const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const ctx=cv.getContext('2d');ctx.drawImage(img,0,0);ctx.fillStyle='#000';(_bloodRects[i]||[]).forEach(r=>ctx.fillRect(r.x*cv.width,r.y*cv.height,r.w*cv.width,r.h*cv.height));res(cv.toDataURL('image/jpeg',0.85).split(',')[1]);};img.src='data:image/jpeg;base64,'+_bloodPages[i];});}
async function _analyzeBloodRedacted(){
  if(!S.url){toast('Coach non configuré (Profil > Admin)','error');return;}
  // Décision Michel 31/07 : visible par tous, mais l'ANALYSE (lecture IA) est Premium.
  if(!S.premium){
    if(window._premiumPending){toast('Vérification du statut premium…','info');return;}
    closeBloodRedact();
    toast('Analyse de prise de sang réservée aux membres Premium ⭐','info');
    if(typeof openPremiumInfo==='function')setTimeout(openPremiumInfo,600);
    return;
  }
  const imgs=[];
  for(let i=0;i<_bloodPages.length;i++){ imgs.push({data:await _bloodApplyRedact(i),type:'image/jpeg'}); }
  closeBloodRedact();
  _showBsScan('data:image/jpeg;base64,'+imgs[0].data,'🩸 Analyse du bilan sanguin…','Lecture des marqueurs','Extraction des valeurs…');
  try{
    const resp=await fetch(_aiUrl('importBloodTest'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'importBloodTest',images:imgs,image:imgs[0].data,imageType:'image/jpeg',email:S.email||''})});
    const txt=await resp.text();let data;try{data=JSON.parse(txt);}catch(e){throw new Error('réponse illisible');}
    if(data.status!=='ok'||!data.data)throw new Error(data.error||'lecture impossible');
    const d=data.data;
    _hideBsScan(()=>{ _saveBloodTest(d); });
  }catch(e){_hideBsScan(()=>toast('Souci lecture : '+(e.message||'réessaie'),'error'));}
}
function _saveBloodTest(d){
  const markers=(d.markers||[]).filter(m=>m&&m.name);
  const obj={date:d.date||today(),ts:Date.now(),markers:markers};
  S.bloodTests=S.bloodTests||[];
  const ex=S.bloodTests.findIndex(t=>t.date===obj.date);
  if(ex>=0)S.bloodTests[ex]=obj; else S.bloodTests.push(obj);
  S.bloodTests.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  renderBloodCard();
  toast(markers.length+' marqueurs enregistrés ✅','success');
  openBloodTest(S.bloodTests.indexOf(obj));
}
async function openBloodTest(idx){
  if(!await _healthGate())return;          // verrou santé (Michel, 04/08)
  _bloodEditIdx=idx;const t=(S.bloodTests||[])[idx];if(!t)return;
  const prev=(S.bloodTests||[]).filter(x=>x!==t&&(x.date||'')<(t.date||'')).sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]||null;
  const dEl=document.getElementById('blood-test-date');if(dEl)dEl.textContent=t.date?new Date(t.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):'';
  const esc=(typeof _escNote==='function')?_escNote:(x=>x);
  const groups={};(t.markers||[]).forEach(m=>{const g=m.group||'Autres';(groups[g]=groups[g]||[]).push(m);});
  let html='';
  Object.keys(groups).forEach(g=>{
    html+=`<div style="font-size:12px;font-weight:800;color:var(--t3);letter-spacing:.04em;text-transform:uppercase;margin:12px 0 4px;">${esc(g)}</div>`;
    groups[g].forEach(m=>{
      const out=_bloodOut(m); const col=out?'#FF9500':'#22C55E';
      const range=(m.low!=null||m.high!=null)?('réf. '+(m.low!=null?m.low:'')+(m.low!=null&&m.high!=null?'–':(m.high!=null?'< ':''))+(m.high!=null?m.high:(m.low!=null?' +':''))+' '+(m.unit||'')):'';
      let ev='';
      if(prev){const pm=(prev.markers||[]).find(x=>x.name===m.name);if(pm&&pm.value!=null&&m.value!=null){const dd=+(m.value-pm.value).toFixed(2);if(dd!==0)ev=`<span style="font-size:10px;color:var(--t3);"> ${dd>0?'▲':'▼'}${Math.abs(dd)}</span>`;}}
      html+=`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--sep);">
        <span style="width:9px;height:9px;border-radius:50%;background:${col};flex-shrink:0;"></span>
        <div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--t1);">${esc(m.name)}</div>${range?`<div style="font-size:10px;color:var(--t3);">${esc(range)}</div>`:''}</div>
        <div style="text-align:right;white-space:nowrap;"><span style="font-size:14px;font-weight:800;color:${out?'#FF9500':'var(--t1)'};">${m.value}</span><span style="font-size:10px;color:var(--t3);"> ${esc(m.unit||'')}</span>${ev}</div></div>`;
    });
  });
  const bodyEl=document.getElementById('blood-test-body');if(bodyEl)bodyEl.innerHTML=html||'<div style="color:var(--t3);text-align:center;padding:20px;">Aucun marqueur lu.</div>';
  const ov=document.getElementById('ov-blood-test');if(ov)ov.classList.add('open');
}
function closeBloodTest(){const ov=document.getElementById('ov-blood-test');if(ov)ov.classList.remove('open');}
function deleteBloodTest(){
  if(_bloodEditIdx<0)return;
  showConfirm('Supprimer ce bilan sanguin ?','Action définitive.',function(){S.bloodTests.splice(_bloodEditIdx,1);persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();closeBloodTest();renderBloodCard();toast('Bilan supprimé','info');});
}
function renderWeightChart(pts,box,metric){
  metric=metric||'kg';
  const field=metric==='bf'?'bf':'kg';
  const unit=metric==='bf'?'%':'kg';
  const noun=metric==='bf'?'mesures':'pesées';
  const baseColor=metric==='bf'?'--orange':'--blue';
  const W=340,H=160,pad={t:18,r:14,b:32,l:44},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const vals=pts.map(p=>p[field]);
  // Poids objectif (ligne repère) — uniquement en vue Poids
  const tw=(metric==='kg'&&S.targetWeight)?S.targetWeight:null;
  const rangeV=vals.concat(tw!=null?[tw]:[]);
  const span=Math.max(...rangeV)-Math.min(...rangeV)||1;
  const minY=Math.min(...rangeV)-span*.08,maxY=Math.max(...rangeV)+span*.08,rY=maxY-minY||1;
  const xS=pts.length>1?iW/(pts.length-1):0;
  const toX=i=>pad.l+(pts.length>1?i*xS:iW/2);
  const toY=v=>pad.t+iH-((v-minY)/rY)*iH;
  // Catmull-Rom bezier
  const P=pts.map((p,i)=>({x:toX(i),y:toY(p[field])}));
  let path='M'+P[0].x+' '+P[0].y;
  for(let i=0;i<P.length-1;i++){
    const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
    const t=0.35;
    const cp1x=p1.x+(p2.x-p0.x)*t/2,cp1y=p1.y+(p2.y-p0.y)*t/2;
    const cp2x=p2.x-(p3.x-p1.x)*t/2,cp2y=p2.y-(p3.y-p1.y)*t/2;
    path+=` C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  const area=path+` L${toX(pts.length-1)} ${pad.t+iH} L${toX(0)} ${pad.t+iH} Z`;
  // Linear regression trend
  const reg=linearRegression(pts.map((p,i)=>({x:i,y:p[field]})));
  const weeklyChange=Math.round(reg.slope*7*100)/100;
  const tY0=toY(reg.intercept),tY1=toY(reg.intercept+reg.slope*(pts.length-1));
  // Y-axis ticks
  const ticks=4;const tickStep=(maxY-minY)/ticks;
  const yTicks=Array.from({length:ticks+1},(_,i)=>minY+tickStep*i);
  // X-axis labels (first, mid, last)
  const xLabels=[0,Math.floor((pts.length-1)/2),pts.length-1].map(i=>({i,d:pts[i].date}));
  const fmtW=d=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  // Tendance : pour le poids, baisse = vert ; pour la masse grasse aussi (baisser la MG = positif)
  const trendColor=weeklyChange>0.1?'var(--red)':weeklyChange<-0.1?'var(--green)':'var(--blue)';
  const gid=metric==='bf'?'wg-bf':'wg';
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible;">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(${baseColor})" stop-opacity=".25"/><stop offset="100%" stop-color="var(${baseColor})" stop-opacity=".02"/></linearGradient></defs>
    ${yTicks.map(v=>`<line x1="${pad.l}" y1="${toY(v)}" x2="${W-pad.r}" y2="${toY(v)}" stroke="var(--sep)" stroke-width=".5"/><text x="${pad.l-4}" y="${toY(v)+4}" text-anchor="end" font-size="9" style="fill:var(--t3)">${Math.round(v*10)/10}</text>`).join('')}
    ${xLabels.map(({i,d})=>`<text x="${toX(i)}" y="${H-4}" text-anchor="middle" font-size="9" style="fill:var(--t3)">${fmtW(d)}</text>`).join('')}
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${path}" fill="none" style="stroke:var(${baseColor})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="${pad.l}" y1="${tY0}" x2="${W-pad.r}" y2="${tY1}" stroke="${trendColor}" stroke-width="1.5" stroke-dasharray="5 3" opacity=".6"/>
    ${tw!=null?`<line x1="${pad.l}" y1="${toY(tw)}" x2="${W-pad.r}" y2="${toY(tw)}" stroke="var(--green)" stroke-width="1.2" stroke-dasharray="2 3" opacity=".85"/><text x="${W-pad.r}" y="${toY(tw)-4}" text-anchor="end" font-size="9" style="fill:var(--green);font-weight:700">🎯 ${tw}</text>`:''}
    ${P.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="12" fill="transparent" style="cursor:pointer" onclick="openWeighEdit('${pts[i].date}')"><title>${fmtW(pts[i].date)} · ${pts[i][field]} ${unit} — modifier</title></circle><circle cx="${p.x}" cy="${p.y}" r="3.6" style="fill:var(${baseColor});stroke:var(--bg2);stroke-width:1.5;pointer-events:none"/>`).join('')}
  </svg>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:13px;color:var(--t3);">
    <span>${pts.length} ${noun} · min ${Math.min(...vals).toFixed(1)} ${unit} · max ${Math.max(...vals).toFixed(1)} ${unit}</span>
    <span style="color:${trendColor};font-weight:800;">${weeklyChange>=0?'+':''}${weeklyChange} ${unit}/sem</span>
  </div>`;
}
// Vue « Les 2 » : poids (bleu, axe gauche kg) + masse grasse (orange, axe droit %) superposés
function renderCompareChart(pts,box){
  const W=340,H=176,pad={t:16,r:38,b:34,l:38},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const kgs=pts.map(p=>p.kg);
  const bfPts=pts.map((p,i)=>({i:i,bf:p.bf})).filter(o=>o.bf!=null);
  const hasBf=bfPts.length>0;          // au moins 1 point → axe droit + dots
  const bfLine=bfPts.length>=2;        // ≥2 → on trace la courbe orange
  const kMin0=Math.min(...kgs),kMax0=Math.max(...kgs),kSp=(kMax0-kMin0)||1;
  const kMin=kMin0-kSp*.12,kMax=kMax0+kSp*.12;
  let bMin=0,bMax=1;
  if(hasBf){const bfVals=bfPts.map(o=>o.bf);const bMin0=Math.min(...bfVals),bMax0=Math.max(...bfVals),bSp=(bMax0-bMin0)||2;const padB=Math.max(bSp*.12,1);bMin=bMin0-padB;bMax=bMax0+padB;}
  const xS=pts.length>1?iW/(pts.length-1):0;
  const toX=i=>pad.l+(pts.length>1?i*xS:iW/2);
  const toYk=v=>pad.t+iH-((v-kMin)/(kMax-kMin||1))*iH;
  const toYb=v=>pad.t+iH-((v-bMin)/(bMax-bMin||1))*iH;
  const kPath='M'+pts.map((p,i)=>toX(i)+' '+toYk(p.kg)).join(' L');
  const bPath=bfLine?('M'+bfPts.map(o=>toX(o.i)+' '+toYb(o.bf)).join(' L')):'';
  const fmtW=d=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  const xLabels=[0,Math.floor((pts.length-1)/2),pts.length-1].map(i=>({i:i,d:pts[i].date}));
  const ticks=4;
  const gl=[];for(let t=0;t<=ticks;t++){const y=pad.t+iH*(t/ticks);const kv=kMax-(kMax-kMin)*(t/ticks);const bv=bMax-(bMax-bMin)*(t/ticks);gl.push({y:y,kv:kv,bv:bv});}
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible;">
    ${gl.map(g=>`<line x1="${pad.l}" y1="${g.y}" x2="${W-pad.r}" y2="${g.y}" stroke="var(--sep)" stroke-width=".5"/><text x="${pad.l-4}" y="${g.y+3}" text-anchor="end" font-size="8.5" style="fill:var(--blue)">${Math.round(g.kv*10)/10}</text>${hasBf?`<text x="${W-pad.r+4}" y="${g.y+3}" text-anchor="start" font-size="8.5" style="fill:var(--orange)">${Math.round(g.bv*10)/10}</text>`:''}`).join('')}
    ${xLabels.map(o=>`<text x="${toX(o.i)}" y="${H-4}" text-anchor="middle" font-size="9" style="fill:var(--t3)">${fmtW(o.d)}</text>`).join('')}
    <path d="${kPath}" fill="none" style="stroke:var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${bPath?`<path d="${bPath}" fill="none" style="stroke:var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`:''}
    ${pts.map((p,i)=>`<circle cx="${toX(i)}" cy="${toYk(p.kg)}" r="2.6" style="fill:var(--blue)"/>`).join('')}
    ${bfPts.map(o=>`<circle cx="${toX(o.i)}" cy="${toYb(o.bf)}" r="2.6" style="fill:var(--orange)"/>`).join('')}
  </svg>
  <div style="display:flex;justify-content:center;gap:18px;align-items:center;margin-top:6px;font-size:12px;color:var(--t2);">
    <span style="display:inline-flex;align-items:center;gap:5px;"><span style="width:10px;height:3px;border-radius:2px;background:var(--blue);display:inline-block;"></span>Poids (kg)</span>
    <span style="display:inline-flex;align-items:center;gap:5px;opacity:${bfLine?1:.5};"><span style="width:10px;height:3px;border-radius:2px;background:var(--orange);display:inline-block;"></span>Masse grasse (%)</span>
  </div>
  ${bfLine?'':'<div style="text-align:center;margin-top:6px;font-size:11px;color:var(--t3);">🟠 Ajoute une 2ᵉ mesure de masse grasse pour voir sa courbe.</div>'}`;
}

// ─── REGISTRE ATHLÈTE — FAITS MESURÉS (Dossier Athlète, brique 2) ─────────────
// Calcule des faits FIABLES depuis les vraies données et les range dans
// S.registre.facts (RECALCUL COMPLET à chaque fois → jamais périmé/en double).
// Règle d'or (Constitution) : chaque fait doit servir une décision de Milo,
// sinon on ne le produit pas. Que du MESURÉ, aucune déduction (ça = brique 5).
// Si une donnée manque (pas assez de séances), le fait n'est simplement pas produit.
function computeRegistreFacts(){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    const sess=(S.sessions||[]).filter(s=>s&&(s.date||s.ts));
    const F={};
    const now=new Date(), dayMs=864e5;
    const sdate=s=>new Date(s.date?s.date+'T12:00:00':new Date(s.ts).toISOString());
    // 1) Nombre de séances (total + ce mois)
    if(sess.length){
      const ym=today().slice(0,7); // mois LOCAL (le 1ᵉʳ du mois entre minuit et 2 h, l'UTC donnait encore le mois d'avant)
      const nMonth=sess.filter(s=>(s.date||dayOfTs(s.ts)).slice(0,7)===ym).length;
      F.seances={label:'Séances',value:`${sess.length} au total, ${nMonth} ce mois-ci`};
    }
    // 2) Régularité (28 derniers jours / 4)
    if(sess.length>=3){
      const c28=sess.filter(s=>{const d=now-sdate(s);return d>=0&&d<=28*dayMs;}).length;
      if(c28>0){const perWk=Math.round(c28/4*10)/10;F.regularite={label:'Régularité',value:`~${perWk} séance${perWk>1?'s':''}/semaine`};}
    }
    // 3) Durée moyenne d'une séance (duration en secondes, >1 min) → minutes
    const durs=sess.map(s=>s.duration).filter(d=>d&&d>60);
    if(durs.length>=3){const avgMin=Math.round(durs.reduce((a,b)=>a+b,0)/durs.length/60);F.duree_moyenne={label:"Durée moyenne d'une séance",value:`~${avgMin} min`};}
    // 4) Exercices préférés (top 3 par nb de séances où présents)
    if(sess.length>=5){
      const freq={};
      sess.forEach(s=>{const seen=new Set();(s.exs||s.exercises||[]).forEach(ex=>{if(ex&&ex.name&&!seen.has(ex.name)){seen.add(ex.name);freq[ex.name]=(freq[ex.name]||0)+1;}});});
      const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
      if(top.length)F.exos_preferes={label:'Exercices préférés',value:top.join(', ')};
    }
    // 5) Groupe musculaire le plus / le moins travaillé (30 derniers jours, via EXLIB)
    const allEx=[...(typeof EXLIB!=='undefined'?EXLIB:[]),...(S.customExercises||[])];
    const grpOf=n=>{const e=allEx.find(x=>x.n===n);return e?e.g:null;};
    const recent=sess.filter(s=>{const d=now-sdate(s);return d>=0&&d<=30*dayMs;});
    if(recent.length>=3){
      const g={};
      recent.forEach(s=>(s.exs||s.exercises||[]).forEach(ex=>{
        const done=(ex.sets||[]).some(st=>st&&st.done&&st.type!=='É'&&st.type!=='W');
        if(!done)return;const grp=grpOf(ex.name);if(!grp)return;g[grp]=(g[grp]||0)+1;
      }));
      const ent=Object.entries(g);
      if(ent.length>=2){ent.sort((a,b)=>b[1]-a[1]);F.groupe_travail={label:'Groupes musculaires (30 j)',value:`le plus : ${ent[0][0]} · le moins : ${ent[ent.length-1][0]}`};}
    }
    // 6) Sommeil moyen (7 dernières nuits renseignées)
    /* ⭐ MÊME SOURCE QUE LE SCORE ET QUE MILO (30/08, R2) : ce fait part dans le registre, donc
       dans le contexte. Le laisser sur `sleepLog` aurait fait dire à Milo une moyenne — et à son
       bloc RÉCUPÉRATION une autre, pour les mêmes nuits. */
    const sl=(typeof _nuitsRecentes==='function')?_nuitsRecentes(today(),7)
             :(S.sleepLog||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
    if(sl.length>=2){const avgH=sl.reduce((a,e)=>a+(e.hours||0),0)/sl.length;const h=Math.floor(avgH),m=Math.round((avgH-h)*60);F.sommeil_moyen={label:'Sommeil moyen',value:`~${h} h${m?(' '+String(m).padStart(2,'0')):''} / nuit (${sl.length} nuits)`};}
    // 7) Ancienneté sportive CALCULÉE (depuis la 1re séance) — ≠ niveau déclaré (déjà connu de Milo)
    if(sess.length>=3){
      let first=sdate(sess[0]);sess.forEach(s=>{const d=sdate(s);if(d<first)first=d;});
      const months=Math.floor((now-first)/dayMs/30.44);
      let anc;if(months<1)anc="moins d'un mois";else if(months<12)anc=`~${months} mois`;else{const y=Math.floor(months/12),mo=months%12;anc=`~${y} an${y>1?'s':''}${mo?(' '+mo+' mois'):''}`;}
      F.anciennete={label:'Ancienneté (depuis la 1re séance)',value:`${anc} · ${sess.length} séances`};
    }
    S.registre.facts=F;
    S.registre.updatedAt=today();   // usage NOMMÉ (audit données mortes 27/07) : rien ne la lit aujourd'hui.
    // Elle existe pour le jour où le registre sera synchronisé entre DEUX appareils :
    // c'est elle qui dira lequel est le plus frais, au lieu d'écraser au hasard (règle R3 :
    // comportement DIFFÉRÉ mais NOMMABLE). Si ce besoin disparaît → la retirer.
  }catch(e){console.warn('[FT registre] computeRegistreFacts',e);}
}

// ─── OBSERVATIONS DE MILO (Dossier Athlète, brique 5A) ────────────────────────
// Milo REMARQUE une tendance ancrée dans les données → PROPOSE (hypothèse humble)
// → l'utilisateur VALIDE → l'observation devient une mémoire durable réutilisée.
// Rien n'est mémorisé sans validation. 4 règles ChatGPT : humilité, UNE à la fois,
// le bon moment (assez de séances + espacement), seuil de confiance interne.
// Chaque candidate a : ask (question montrée) + fact (phrase injectée à Milo si validée).
function _obsCandidates(){
  const out=[];
  try{
    const sess=(S.sessions||[]).filter(s=>s&&(s.date||s.ts));
    if(sess.length<4)return out; // le bon moment : pas avant 4 séances (baissé de 8 → 4 pour que Milo commence à apprendre plus tôt ; l'espacement 3 j + le seuil de confiance protègent la qualité)
    const now=new Date(), dayMs=864e5, N=sess.length;
    const sdate=s=>new Date(s.date?s.date+'T12:00:00':new Date(s.ts).toISOString());
    // A) Semaine vs week-end
    let we=0;sess.forEach(s=>{const d=sdate(s).getDay();if(d===0||d===6)we++;});
    const weShare=we/N;
    if(weShare<=0.12)out.push({key:'weekday_only',source:'jours',confidence:Math.min(1,0.72+(0.12-weShare)*2),ask:"J'ai l'impression que tu t'entraînes surtout en semaine, très rarement le week-end. C'est le cas ?",fact:"S'entraîne surtout en semaine, très rarement le week-end."});
    else if(weShare>=0.6)out.push({key:'weekend_pref',source:'jours',confidence:Math.min(1,0.7+(weShare-0.6)),ask:"On dirait que le week-end est ton moment pour t'entraîner. Je me trompe ?",fact:"S'entraîne surtout le week-end."});
    // B) Matin vs soir (via startHour, fallback heure du ts)
    const hrs=sess.map(s=>{const h=(s.startHour!=null?s.startHour:new Date(s.ts||s.id||sdate(s)).getHours());return h;}).filter(h=>h>=0&&h<=23);
    if(hrs.length>=4){
      const mShare=hrs.filter(h=>h<12).length/hrs.length, eShare=hrs.filter(h=>h>=18).length/hrs.length;
      if(mShare>=0.65)out.push({key:'morning',source:'horaires',confidence:Math.min(1,0.7+(mShare-0.65)),ask:"J'ai remarqué que tu t'entraînes plutôt le matin, on dirait. Ça te correspond ?",fact:"S'entraîne plutôt le matin."});
      else if(eShare>=0.65)out.push({key:'evening',source:'horaires',confidence:Math.min(1,0.7+(eShare-0.65)),ask:"Tu sembles être plutôt du soir pour tes séances. C'est bien ça ?",fact:"S'entraîne plutôt le soir."});
    }
    // C) Haut vs bas du corps (via EXLIB)
    const allEx=[...(typeof EXLIB!=='undefined'?EXLIB:[]),...(S.customExercises||[])];
    const grpOf=n=>{const e=allEx.find(x=>x.n===n);return e?e.g:null;};
    const UP=['Pectoraux','Dos','Trapèzes','Épaules','Biceps','Triceps','Avant-bras'],LO=['Jambes','Fessiers','Mollets'];
    let up=0,lo=0;
    sess.forEach(s=>(s.exs||s.exercises||[]).forEach(ex=>{
      const done=(ex.sets||[]).some(st=>st&&st.done&&st.type!=='É'&&st.type!=='W');
      if(!done)return;const g=grpOf(ex.name);if(!g)return;
      if(UP.indexOf(g)>=0)up++;else if(LO.indexOf(g)>=0)lo++;
    }));
    if(up+lo>=20){
      if(up>=lo*2.2)out.push({key:'upper_dom',source:'groupes',confidence:0.75,ask:"En regardant tes séances, tu travailles bien plus souvent le haut du corps que les jambes. C'est un choix, ou on rééquilibre un peu ?",fact:"Travaille beaucoup plus le haut du corps que les jambes."});
      else if(lo>=up*2.2)out.push({key:'lower_dom',source:'groupes',confidence:0.75,ask:"Tu mets beaucoup l'accent sur les jambes par rapport au haut du corps, on dirait. C'est voulu ?",fact:"Met beaucoup l'accent sur les jambes par rapport au haut du corps."});
    }
    // D) Très régulier (10+ séances sur 28 jours)
    const c28=sess.filter(s=>{const d=now-sdate(s);return d>=0&&d<=28*dayMs;}).length;
    if(c28>=10)out.push({key:'very_regular',source:'régularité',confidence:0.75,ask:"T'es quelqu'un de très régulier — plusieurs séances par semaine sans lâcher. J'ai bon ?",fact:"Très régulier(e) : plusieurs séances par semaine, avec constance."});
  }catch(e){console.warn('[FT obs] candidates',e);}
  return out;
}
// Décide s'il faut PROPOSER une nouvelle observation (le bon moment + une à la fois + seuil de confiance).
function maybeProposeObservation(){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    if(!Array.isArray(S.registre.observations))S.registre.observations=[];
    const obs=S.registre.observations;
    if(obs.some(o=>o&&o.status==='pending'))return;                 // une à la fois
    if((S.sessions||[]).filter(s=>s&&(s.date||s.ts)).length<4)return; // le bon moment (baissé de 8 → 4)
    const last=S.registre.lastObsAt;                                 // PROACTIF : au plus 1 question/semaine
    if(last){const dl=(new Date(today())-new Date(last))/864e5;if(dl>=0&&dl<7)return;}
    const known=new Set(obs.map(o=>o&&o.key));                       // ne jamais re-proposer une clé déjà décidée
    const cands=_obsCandidates().filter(c=>c.confidence>=0.7&&!known.has(c.key));
    if(!cands.length)return;
    cands.sort((a,b)=>b.confidence-a.confidence);
    const c=cands[0];
    obs.push({id:'ob'+Date.now().toString(36),key:c.key,ask:c.ask,fact:c.fact,confidence:Math.round(c.confidence*100)/100,status:'pending',source:c.source,proposedAt:today()});
    S.registre.lastObsAt=today();
    persist();
  }catch(e){console.warn('[FT obs] propose',e);}
}
function _pendingObs(){const o=(S.registre&&S.registre.observations)||[];return o.find(x=>x&&x.status==='pending')||null;}
function _validatedObs(){const o=(S.registre&&S.registre.observations)||[];return o.filter(x=>x&&x.status==='validated');}
function validateObs(id){
  const o=(S.registre&&S.registre.observations)||[];const x=o.find(e=>e&&e.id===id);if(!x)return;
  x.status='validated';x.validatedAt=today();persist();
  if(typeof _renderObsCard==='function')_renderObsCard();
  if(typeof toast==='function')toast('Milo te connaît un peu mieux 👊','success');
}
function rejectObs(id){
  const o=(S.registre&&S.registre.observations)||[];const x=o.find(e=>e&&e.id===id);if(!x)return;
  x.status='rejected';x.rejectedAt=today();persist();
  if(typeof _renderObsCard==='function')_renderObsCard();
  if(typeof toast==='function')toast("Noté, j'oublie ça.",'info');
}
function deleteObs(id){
  if(!S.registre||!Array.isArray(S.registre.observations))return;
  S.registre.observations=S.registre.observations.filter(o=>o&&o.id!==id);
  persist();
  if(typeof _renderMiloKnows==='function')_renderMiloKnows();
}

// ─── PROFIL VIVANT — mode « COMPLÉTER » (docs/PROFIL-VIVANT.md) ───
// Les champs de base (lieu/fréquence/durée d'entraînement) sont normalement posés à l'inscription (écran
// ob-7). S'ils sont VIDES (inscription zappée, ancien compte), Milo les rattrape en douceur sur l'Accueil,
// en 1 tap, et écrit DIRECTEMENT dans S.coachQuiz.answers (déjà persisté + synchronisé cloud → 0 backend).
// Réutilise EXACTEMENT les options de l'inscription (COACH_QUIZ) → une seule source de vérité.
function _profileGapSpecs(){
  const q=(typeof COACH_QUIZ!=='undefined')?COACH_QUIZ:[];
  const byId=id=>q.find(x=>x&&x.id===id);
  return [
    {field:'place', ask:"Pour mieux te conseiller — où t'entraînes-tu le plus souvent ?", q:byId('place')},
    {field:'freq',  ask:"Combien de séances par semaine tu tiens, en général ?",          q:byId('freq')},
    {field:'time',  ask:"Et une séance, ça dure combien de temps chez toi ?",              q:byId('time')},
  ].filter(g=>g.q&&Array.isArray(g.q.opts)&&g.q.opts.length);
}
function _pendingGap(){
  try{
    if(!S.registre)return null;
    const ans=(S.coachQuiz&&S.coachQuiz.answers)||{};
    // Priorité absolue : un champ que l'utilisateur vient de déclarer « changé » (mode Confirmer → Non) → on
    // affiche ses options TOUT DE SUITE (bypass du plafond hebdo, c'est la suite directe de son action).
    const gf=S.registre.gapForce;
    if(gf&&!ans[gf]){
      const spec=_profileGapSpecs().find(g=>g.field===gf);
      if(spec)return {field:spec.field, ask:spec.ask, options:spec.q.opts};
    }
    // le bon moment : quelques séances derrière soi (pas dès le tout 1er jour)
    if((S.sessions||[]).filter(s=>s&&(s.date||s.ts)).length<3)return null;
    // PROACTIF : au plus 1 question par SEMAINE (filet de sécurité — cf. docs/PROFIL-VIVANT.md).
    // Partagé (via lastObsAt) avec les observations → jamais deux questions proactives la même semaine.
    // (Les futures questions CONTEXTUELLES — déclaré/réalisé — pourront passer outre ce plafond.)
    const last=S.registre.lastObsAt;
    if(last){const dl=(new Date(today())-new Date(last))/864e5;if(dl>=0&&dl<7)return null;}
    const skips=S.registre.gapSkips||{};
    for(const g of _profileGapSpecs()){
      if(ans[g.field])continue;                       // déjà rempli → ce n'est plus un manque
      const sk=skips[g.field];                         // « Plus tard » → on laisse ~7 jours avant de re-proposer
      if(sk){const dl=(new Date(today())-new Date(sk))/864e5;if(dl>=0&&dl<7)continue;}
      return {field:g.field, ask:g.ask, options:g.q.opts};
    }
    return null;
  }catch(e){return null;}
}
// Backbone du profil vivant : date de dernière confirmation par champ (pilote le mode « Confirmer » + la fiabilité).
function _stampConfirmed(field){
  try{ S.coachQuiz=S.coachQuiz||{answers:{},done:false}; S.coachQuiz.confirmedAt=S.coachQuiz.confirmedAt||{}; S.coachQuiz.confirmedAt[field]=today(); }catch(e){}
}
// Date de VRAI apprentissage d'un champ (≠ confirmedAt) : posée UNIQUEMENT quand l'info est réellement
// apprise/changée via une réponse (fillGap/fillEnrich/applyFreqContext), JAMAIS par le lazy-init ni une
// simple re-confirmation → alimente la liste honnête « Milo a appris récemment » (Brique 2).
function _stampLearned(field){
  try{ if(!S.registre)return; S.registre.learnedAt=S.registre.learnedAt||{}; S.registre.learnedAt[field]=today(); }catch(e){}
}
function fillGap(field,value){
  try{
    S.coachQuiz=S.coachQuiz||{answers:{},done:false};
    S.coachQuiz.answers=S.coachQuiz.answers||{};
    S.coachQuiz.answers[field]=value;
    if(!S.coachQuiz.date)S.coachQuiz.date=today();
    _stampConfirmed(field);
    if(S.registre){S.registre.lastObsAt=today(); if(S.registre.gapSkips)delete S.registre.gapSkips[field]; if(S.registre.gapForce===field)S.registre.gapForce=null;}
    _stampLearned(field);
    persist();
    if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderObsCard==='function')_renderObsCard();
    // feedback de VALEUR (profil vivant) : montrer que la réponse sert vraiment
    const msg={place:'Parfait 👍 Milo en tient compte pour tes séances.',freq:'Noté 👍 Milo cale ses conseils sur ce rythme.',time:'Top 👍 Milo adapte la durée de tes séances.'}[field]||'Parfait 👍 Profil mis à jour.';
    if(typeof toast==='function')toast(msg,'success');
  }catch(e){console.warn('[FT gap] fill',e);}
}
function skipGap(field){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    if(!S.registre.gapSkips)S.registre.gapSkips={};
    S.registre.gapSkips[field]=today();
    if(S.registre.gapForce===field)S.registre.gapForce=null;
    S.registre.lastObsAt=today();                     // respecte le plafond (pas d'autre question avant 3 jours)
    persist();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Pas de souci, on verra plus tard.",'info');
  }catch(e){console.warn('[FT gap] skip',e);}
}

// ─── PROFIL VIVANT — questions CONTEXTUELLES : « déclaré vs réalisé » (docs/PROFIL-VIVANT.md) ───
// Le super-pouvoir : l'app MESURE la réalité (séances loggées) et la compare au DÉCLARÉ. Sur un écart
// STABLE (pas un pic — « la cohérence avant la réactivité »), Milo PROPOSE de mettre à jour (jamais auto).
// 1ʳᵉ détection = la FRÉQUENCE (factuelle, mesurable). Contextuel = passe OUTRE le plafond hebdo proactif,
// mais garde son propre anti-nag (on ne redemande pas pour un écart déjà tranché).
const _FREQ_RANGE={'1':[1,2],'3':[3,3],'4':[4,4],'5':[5,99]};       // déclaré → nb de séances/sem
function _freqBucketOf(n){return n<=2?'1':n===3?'3':n===4?'4':'5';}
function _freqBucketLabel(b){return{'1':'1 à 2 fois','3':'3 fois','4':'4 fois','5':'5 fois ou plus'}[b]||b;}
function _weeklyCounts(nWeeks){
  const counts=new Array(nWeeks).fill(0);
  const now=new Date(today()+'T12:00:00');
  (S.sessions||[]).forEach(s=>{
    const ds=s&&(s.date||(s.ts?dayOfTs(s.ts):null)); // jour LOCAL du ts (une séance de 00 h 30 est d'aujourd'hui)
    if(!ds)return;
    const d=new Date(ds+'T12:00:00'); if(isNaN(d))return;
    const wk=Math.floor((now-d)/864e5/7);
    if(wk>=0&&wk<nWeeks)counts[wk]++;
  });
  return counts; // [semaine 0 = 7 derniers jours, 1, 2, 3]
}
function _pendingFreqContext(){
  try{
    const declared=(S.coachQuiz&&S.coachQuiz.answers&&S.coachQuiz.answers.freq)||'';
    if(!declared||!_FREQ_RANGE[declared])return null;                 // pas de déclaré → c'est le mode Compléter
    const wk=_weeklyCounts(4);
    if(wk.filter(c=>c>0).length<3)return null;                        // pas assez d'historique pour juger une tendance
    const[dMin,dMax]=_FREQ_RANGE[declared];
    const more=wk.filter(c=>c>dMax).length;                           // semaines où il s'entraîne PLUS que déclaré
    const less=wk.filter(c=>c<dMin).length;                           // … MOINS que déclaré
    let dir=null;
    if(more>=3&&less===0)dir='up'; else if(less>=3&&more===0)dir='down'; else return null; // exige la STABILITÉ (≥3/4 même sens)
    const avg=wk.reduce((a,b)=>a+b,0)/wk.length;
    const observed=_freqBucketOf(Math.round(avg));
    if(observed===declared)return null;                               // même « case » → pas de vrai changement
    const cx=S.registre&&S.registre.ctxFreq;                          // anti-nag : déjà tranché pour CE niveau observé
    if(cx&&cx.bucket===observed)return null;
    return {declared, observed, observedLabel:_freqBucketLabel(observed), declaredLabel:_freqBucketLabel(declared), dir};
  }catch(e){return null;}
}
function applyFreqContext(observed){
  try{
    if(!S.coachQuiz)S.coachQuiz={answers:{},done:false};
    if(!S.coachQuiz.answers)S.coachQuiz.answers={};
    S.coachQuiz.answers.freq=observed;
    _stampConfirmed('freq'); _stampLearned('freq');
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.ctxFreq={bucket:observed,at:today(),result:'updated'};
    S.registre.lastObsAt=today();
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast('Mis à jour 👍 Je cale mes conseils et ta récup sur ce rythme.','success');
  }catch(e){console.warn('[FT ctx] freq apply',e);}
}
function dismissFreqContext(observed){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.ctxFreq={bucket:observed,at:today(),result:'kept'};    // on ne redemandera pas pour CE niveau
    S.registre.lastObsAt=today();
    persist();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Ok, je garde ce que tu avais indiqué 👍",'info');
  }catch(e){console.warn('[FT ctx] freq dismiss',e);}
}

// ─── PROFIL VIVANT — détecteur CONTEXTUEL « style » : force vs hypertrophie (docs/PROFIL-VIVANT.md) ───
// L'app OBSERVE la signature d'entraînement (reps des séries faites). ⚠️ « observé ≠ intention » : le style
// est un INDICE FORT, jamais une preuve → Milo ne bascule JAMAIS l'objectif tout seul (Constitution), il
// CONSTATE et DEMANDE. Ne s'active que si l'objectif est muscle/force ET que le style observé est clairement
// l'AUTRE (stable sur plusieurs séances). Anti-nag : une fois tranché pour un style, on ne redemande pas.
function _sessionStyleStats(nSess){
  let force=0,hyp=0,endur=0,tot=0;
  const sess=(S.sessions||[]).filter(s=>s&&(s.date||s.ts)).slice(0,nSess); // sessions récentes (unshift → les + récentes en tête)
  sess.forEach(s=>{
    (s.exs||s.exercises||[]).forEach(ex=>{
      (ex.sets||[]).forEach(st=>{
        if(!st||!st.done)return;
        if(st.type==='É'||st.type==='W')return;                // échauffement exclu
        const r=+st.reps; if(!r||r<=0)return;                  // « maxi »/vide exclu
        tot++;
        if(r<=5)force++; else if(r<=12)hyp++; else endur++;
      });
    });
  });
  return {force,hyp,endur,tot};
}
function _pendingStyleContext(){
  try{
    const goal=S.goal||'';
    if(goal!=='muscle'&&goal!=='force')return null;            // le style ne « mappe » l'objectif que sur ces 2
    const st=_sessionStyleStats(10);
    if(st.tot<25)return null;                                  // pas assez de séries pour juger une signature
    const fPct=st.force/st.tot, hPct=st.hyp/st.tot;
    let observed=null, newGoal=null;
    if(goal==='muscle'&&fPct>=0.60)      { observed='force'; newGoal='force'; }   // s'entraîne en force mais vise le muscle
    else if(goal==='force'&&hPct>=0.60)  { observed='hyp';   newGoal='muscle'; }  // s'entraîne en volume mais vise la force
    else return null;
    const cx=S.registre&&S.registre.ctxStyle;                  // anti-nag : déjà tranché pour CE style observé
    if(cx&&cx.observed===observed)return null;
    const GL=(typeof GOAL_LABELS!=='undefined')?GOAL_LABELS:{muscle:'prise de muscle',force:'force'};
    return {observed, newGoal, goalLabel:(GL[goal]||goal), newGoalLabel:(GL[newGoal]||newGoal),
            styleLabel:(observed==='force'?'travail de force (séries lourdes, peu de reps)':'travail de volume / hypertrophie (séries plus longues)')};
  }catch(e){return null;}
}
function applyStyleContext(newGoal,observed){
  try{
    _goalSet(newGoal,'observation');   // ⚠️ seulement sur action explicite de l'utilisateur — et
                                       //    journalisé par le propriétaire unique (R2, ft-v1010)
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.ctxStyle={observed,at:today(),result:'updated'};
    S.registre.lastObsAt=today();
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof renderNutrition==='function'){try{renderNutrition();}catch(e){}}  // les macros suivent l'objectif
    if(typeof _renderObsCard==='function')_renderObsCard();
    const GL=(typeof GOAL_LABELS!=='undefined')?GOAL_LABELS:{};
    if(typeof toast==='function')toast('Objectif mis à jour 👍 « '+((GL[newGoal])||newGoal)+' » — j\'adapte conseils et nutrition.','success');
  }catch(e){console.warn('[FT ctx] style apply',e);}
}
function dismissStyleContext(observed){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.ctxStyle={observed,at:today(),result:'kept'};  // on garde l'objectif déclaré, on ne redemande pas
    S.registre.lastObsAt=today();
    persist();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast('Ok, je garde ton objectif actuel 👍','info');
  }catch(e){console.warn('[FT ctx] style dismiss',e);}
}

// ─── PROFIL VIVANT — mode « ENRICHIR » (docs/PROFIL-VIVANT.md) ───
// Des infos qu'on ne peut PAS déduire des données (donc Milo DEMANDE, il ne détecte pas) mais qui enrichissent
// le coaching. 1ʳᵉ : un AUTRE SPORT pratiqué (foot/vélo/course… → influe sur la récup et la dépense énergétique,
// cf. NUTRITION-PHILOSOPHIE). Proactif (partage le plafond hebdo), 1 tap, écrit dans S.coachQuiz.answers.
const _OTHERSPORT_LBL={aucun:'aucun autre sport',velo:'vélo',course:'course à pied',foot:'foot',natation:'natation',martiaux:'arts martiaux',rando:'randonnée',autre:'un autre sport'};
function _enrichSpecs(){
  return [
    {field:'othersport', ask:"Tu pratiques un autre sport à côté de la muscu ? Ça m'aide à ajuster ta récup et tes calories.",
     options:[['aucun','Aucun'],['velo','Vélo'],['course','Course'],['foot','Foot'],['natation','Natation'],['martiaux','Arts martiaux'],['rando','Rando'],['autre','Un autre']]},
  ];
}
function _pendingEnrich(){
  try{
    if(!S.registre)return null;
    const ans=(S.coachQuiz&&S.coachQuiz.answers)||{};
    // Priorité : un champ que l'utilisateur vient de déclarer « changé » (Confirmer → Non) → options tout de suite.
    const gf=S.registre.gapForce;
    if(gf&&!ans[gf]){
      const spec=_enrichSpecs().find(g=>g.field===gf);
      if(spec)return {field:spec.field, ask:spec.ask, options:spec.options};
    }
    if((S.sessions||[]).filter(s=>s&&(s.date||s.ts)).length<3)return null;
    const last=S.registre.lastObsAt;                                  // PROACTIF : au plus 1 question/semaine (partagé)
    if(last){const dl=(new Date(today())-new Date(last))/864e5;if(dl>=0&&dl<7)return null;}
    const skips=S.registre.gapSkips||{};
    for(const g of _enrichSpecs()){
      if(ans[g.field])continue;                                       // déjà répondu → on ne redemande pas
      const sk=skips[g.field];
      if(sk){const dl=(new Date(today())-new Date(sk))/864e5;if(dl>=0&&dl<7)continue;}
      return {field:g.field, ask:g.ask, options:g.options};
    }
    return null;
  }catch(e){return null;}
}
function fillEnrich(field,value){
  try{
    S.coachQuiz=S.coachQuiz||{answers:{},done:false};
    S.coachQuiz.answers=S.coachQuiz.answers||{};
    S.coachQuiz.answers[field]=value;
    if(!S.coachQuiz.date)S.coachQuiz.date=today();
    _stampConfirmed(field);
    if(S.registre){S.registre.lastObsAt=today(); if(S.registre.gapSkips)delete S.registre.gapSkips[field]; if(S.registre.gapForce===field)S.registre.gapForce=null;}
    _stampLearned(field);
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderObsCard==='function')_renderObsCard();
    let msg='Noté 👍 Milo en tient compte.';
    if(field==='othersport')msg=(value==='aucun')?'Noté 👍':('Top 👍 Ton '+(_OTHERSPORT_LBL[value]||'autre sport')+' est compté dans tes besoins caloriques, et Milo en tient compte pour ta récup.');
    if(typeof toast==='function')toast(msg,'success');
  }catch(e){console.warn('[FT enrich] fill',e);}
}
function skipEnrich(field){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    if(!S.registre.gapSkips)S.registre.gapSkips={};
    S.registre.gapSkips[field]=today();
    if(S.registre.gapForce===field)S.registre.gapForce=null;
    S.registre.lastObsAt=today();
    persist();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Pas de souci, on verra plus tard.",'info');
  }catch(e){console.warn('[FT enrich] skip',e);}
}

// ─── PROFIL VIVANT — mode « CONFIRMER » (docs/PROFIL-VIVANT.md) ───
// Une info ENCORE là mais ANCIENNE : Milo la re-valide en douceur. « Oui » ne change RIEN — il rafraîchit
// juste la date de dernière confirmation (backbone) → on évite de re-poser sans cesse les mêmes questions.
// « Non » → bascule direct vers COMPLÉTER (les options réapparaissent tout de suite via gapForce).
// Proactif (partage le plafond hebdo). N'agit PAS sur la fréquence (déjà couverte par déclaré/réalisé).
const _CONFIRM_AGE_DAYS=90;                                        // au-delà, on re-valide (fiabilité qui décroît avec le temps)
function _confirmLabelOf(field,value){
  if(field==='othersport')return _OTHERSPORT_LBL[value]||value;
  const spec=_profileGapSpecs().find(g=>g.field===field);
  if(spec){const o=(spec.q.opts||[]).find(x=>x[0]===value);if(o)return o[1];}
  return value;
}
function _confirmPromptOf(field,label){
  if(field==='place')return "Tu t'entraînes toujours plutôt en "+label+" ?";
  if(field==='time')return "Une séance dure toujours à peu près "+label+" ?";
  if(field==='othersport')return (label&&label!=='aucun autre sport')
    ? ("Tu pratiques toujours "+label+" à côté ?")
    : "Toujours pas d'autre sport à côté de la muscu ?";
  return "C'est toujours d'actualité : "+label+" ?";
}
function _pendingConfirm(){
  try{
    if(!S.registre)return null;
    if((S.sessions||[]).filter(s=>s&&(s.date||s.ts)).length<3)return null;
    const ans=(S.coachQuiz&&S.coachQuiz.answers)||{};
    const conf=(S.coachQuiz&&S.coachQuiz.confirmedAt)||{};
    const last=S.registre.lastObsAt;                               // PROACTIF : ≤1 question/semaine (partagé)
    if(last){const dl=(new Date(today())-new Date(last))/864e5;if(dl>=0&&dl<7)return null;}
    const skips=S.registre.confirmSkips||{};
    let lazy=false;
    for(const field of ['place','time','othersport']){
      const v=ans[field];
      if(v===undefined||v===null||v==='')continue;                 // vide → c'est COMPLÉTER, pas Confirmer
      if(!conf[field]){ _stampConfirmed(field); lazy=true; continue; } // pas de date → on l'ancre à aujourd'hui (aucune question immédiate)
      const age=(new Date(today())-new Date(conf[field]))/864e5;
      if(age<_CONFIRM_AGE_DAYS)continue;                            // encore frais → rien
      const sk=skips[field];
      if(sk){const dl=(new Date(today())-new Date(sk))/864e5;if(dl>=0&&dl<30)continue;} // « Plus tard » → ~1 mois
      return {field, value:v, label:_confirmLabelOf(field,v)};
    }
    if(lazy){ try{persist();}catch(e){} }                          // enregistre les dates ancrées à aujourd'hui
    return null;
  }catch(e){return null;}
}
function confirmField(field){
  try{
    _stampConfirmed(field);                                        // « Oui » : on ne change RIEN, on rafraîchit la date
    if(S.registre){S.registre.lastObsAt=today(); if(S.registre.confirmSkips)delete S.registre.confirmSkips[field];}
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Parfait, c'est toujours à jour 👍",'success');
  }catch(e){console.warn('[FT confirm] yes',e);}
}
function unconfirmField(field){
  try{
    S.coachQuiz=S.coachQuiz||{answers:{},done:false};
    if(S.coachQuiz.answers)delete S.coachQuiz.answers[field];      // « Non » : la valeur n'est plus valable
    if(S.coachQuiz.confirmedAt)delete S.coachQuiz.confirmedAt[field];
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.gapForce=field;                                     // → les options réapparaissent TOUT DE SUITE (Compléter/Enrichir)
    if(S.registre.gapSkips)delete S.registre.gapSkips[field];
    if(S.registre.confirmSkips)delete S.registre.confirmSkips[field];
    S.registre.lastObsAt=today();
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Ok, dis-moi ce qui a changé 👍",'info');
  }catch(e){console.warn('[FT confirm] no',e);}
}
function skipConfirm(field){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    if(!S.registre.confirmSkips)S.registre.confirmSkips={};
    S.registre.confirmSkips[field]=today();
    S.registre.lastObsAt=today();
    persist();
    if(typeof _renderObsCard==='function')_renderObsCard();
    if(typeof toast==='function')toast("Pas de souci, on verra plus tard.",'info');
  }catch(e){console.warn('[FT confirm] skip',e);}
}

function renderWeightCorrelations(el,pts){
  if(!pts||pts.length<3){el.innerHTML='';return;}
  const cards=[];
  const vals=pts.map(p=>p.kg);
  const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
  // 1. Trend card
  const reg=linearRegression(pts.map((p,i)=>({x:i,y:p.kg})));
  const weeklyChange=Math.round(reg.slope*7*100)/100;
  const goal=S.goal||'muscle';
  /* 📉 `recomp` MANQUAIT ICI — la carte disait « l'évolution attendue est variable » à
     quelqu'un qui a un objectif parfaitement défini. Les bornes viennent de `state.js`
     (`_GOAL_TREND_RECOMP`), jamais réécrites ici : Milo lit les mêmes (R2). */
  const _tr=(typeof _GOAL_TREND_RECOMP!=='undefined')?_GOAL_TREND_RECOMP:{min:-0.3,max:0,txt:'stable à légèrement négative (0 à −0.3 kg/sem)'};
  const goalDir={muscle:'légèrement positive (+0.1–0.3 kg/sem)',perte:'négative (−0.3–0.7 kg/sem)',recomp:_tr.txt,force:'légèrement positive',equilibre:'stable (±0.1 kg/sem)',endurance:'stable ou légèrement positive'};
  /* ⛔ ET LA BALANCE EST LE MAUVAIS INSTRUMENT ICI, il faut le DIRE : en recomposition le
     gras qui part et le muscle qui vient s'annulent sur le pèse-personne. Sans cette
     phrase, une balance immobile se lit comme « il ne se passe rien » — alors que c'est
     exactement le résultat attendu. (Barakat et al. 2020, revue sur la recomposition.) */
  const goalNote={recomp:` En recomposition, la balance seule ne montre presque rien : le gras qui part et le muscle qui vient s'annulent dessus. Ce sont tes charges et tes mensurations qui le disent.`};
  const _dansLaCible=goal==='recomp'&&weeklyChange>=_tr.min&&weeklyChange<=_tr.max;
  const trendColor=goal==='perte'&&weeklyChange<0?'var(--green)':goal==='muscle'&&weeklyChange>0?'var(--green)':_dansLaCible?'var(--green)':Math.abs(weeklyChange)>0.8?'var(--orange)':'var(--t2)';
  cards.push({icon:'📈',title:`${weeklyChange>=0?'+':''}${weeklyChange} kg / semaine`,text:`Tendance sur ${pts.length} mesures. Pour ton objectif "${GOAL_LABELS[goal]}", l'évolution attendue est ${goalDir[goal]||'variable'}.${goalNote[goal]||''}`,color:trendColor});
  // 2. Training days correlation
  const sessDates=new Set(S.sessions.map(s=>s.date));
  const afterSess=pts.filter(w=>{const prev=new Date(w.date+'T12:00:00');prev.setDate(prev.getDate()-1);return sessDates.has(prev.toISOString().split('T')[0]);});
  const noSess=pts.filter(w=>{const prev=new Date(w.date+'T12:00:00');prev.setDate(prev.getDate()-1);return !sessDates.has(prev.toISOString().split('T')[0]);});
  if(afterSess.length>=2&&noSess.length>=2){
    const diff=Math.round((avg(afterSess.map(w=>w.kg))-avg(noSess.map(w=>w.kg)))*100)/100;
    if(Math.abs(diff)>=0.1)cards.push({icon:'💪',title:`${diff>=0?'+':''}${diff} kg le lendemain d'une séance`,text:`Tu pèses en moyenne ${Math.abs(diff)} kg ${diff>0?'de plus':'de moins'} après une séance d'entraînement. ${diff>0?'Rétention d\'eau musculaire normale — pas de vraie prise de masse.':'Bonne hydratation et récupération rapide.'}`,color:'var(--blue)'});
  }
  // 3. Sleep correlation
  const goodSl=new Set((S.sleepLog||[]).filter(e=>e.hours>=7||e.quality>=3).map(e=>e.date));
  const badSl=new Set((S.sleepLog||[]).filter(e=>e.hours<7&&e.quality<3).map(e=>e.date));
  const wGood=pts.filter(w=>goodSl.has(w.date)),wBad=pts.filter(w=>badSl.has(w.date));
  if(wGood.length>=2&&wBad.length>=2){
    const diff=Math.round((avg(wBad.map(w=>w.kg))-avg(wGood.map(w=>w.kg)))*100)/100;
    if(Math.abs(diff)>=0.1)cards.push({icon:'😴',title:`Sommeil & rétention d'eau`,text:`Après une bonne nuit : ${avg(wGood.map(w=>w.kg)).toFixed(1)} kg · Après mauvaise nuit : ${avg(wBad.map(w=>w.kg)).toFixed(1)} kg (${diff>=0?'+':''}${diff} kg). ${diff>0.2?'Le manque de sommeil élève le cortisol et favorise la rétention d\'eau.':'Ton corps régule bien le poids indépendamment du sommeil.'}`,color:diff>0.3?'var(--orange)':'var(--t3)'});
  }
  // 4. Energy from check-ins
  const sessWithCI=S.sessions.filter(s=>s.checkin&&s.checkin.energy);
  const highEnergySess=new Set(sessWithCI.filter(s=>s.checkin.energy>=3).map(s=>s.date));
  const lowEnergySess=new Set(sessWithCI.filter(s=>s.checkin.energy<=2).map(s=>s.date));
  if(highEnergySess.size>=2&&lowEnergySess.size>=2){
    const wHigh=pts.filter(w=>highEnergySess.has(w.date)),wLow=pts.filter(w=>lowEnergySess.has(w.date));
    if(wHigh.length>=1&&wLow.length>=1){const diff=Math.round((avg(wHigh.map(w=>w.kg))-avg(wLow.map(w=>w.kg)))*100)/100;if(Math.abs(diff)>=0.1)cards.push({icon:'⚡',title:`Énergie séance & poids`,text:`Les jours où tu te sens en forme : ${avg(wHigh.map(w=>w.kg)).toFixed(1)} kg · Jours fatigués : ${avg(wLow.map(w=>w.kg)).toFixed(1)} kg. ${diff<0?'Tu performes mieux avec un poids légèrement bas.':'Le surplus calorique te donne de l\'énergie mais pèse un peu plus.'}`,color:'var(--purp)'});}
  }
  // 5. Range
  const range=Math.round((Math.max(...vals)-Math.min(...vals))*10)/10;
  cards.push({icon:'📊',title:`Plage : ${Math.min(...vals).toFixed(1)} – ${Math.max(...vals).toFixed(1)} kg (${range} kg)`,text:range>4?'Variation importante — pèse-toi toujours le matin à jeun pour des données fiables.':range>1.5?'Variation normale selon hydratation et repas.':'Poids très stable — excellente régularité nutritionnelle.',color:range>4?'var(--orange)':'var(--t3)'});
  el.innerHTML=cards.map(c=>`<div class="corr-card"><span style="font-size:20px;flex-shrink:0;">${c.icon}</span><div><div style="font-size:14px;font-weight:800;color:${c.color};margin-bottom:3px;">${c.title}</div><div style="font-size:13px;color:var(--t2);line-height:1.5;">${c.text}</div></div></div>`).join('');
}

// ─── SLEEP & RECOVERY ─────────────────────────────────────────
let _sleepQual=3;
let _sleepEditLog=false;
let _sleepEditDate=null; // jour ciblé pour saisir/modifier un sommeil (null = cette nuit)

// Jour effectivement en cours de saisie (par défaut : cette nuit)
function _sleepDateFor(){ return _sleepEditDate||today(); }

// Libellé humain d'une date de sommeil : « cette nuit » / « nuit d'hier » / « nuit du JJ/MM »
function _fmtSleepDay(d){
  const t=today();
  if(d===t)return'cette nuit';
  const y=new Date(new Date(t+'T12:00:00')-864e5).toISOString().slice(0,10);
  if(d===y)return"nuit d'hier";
  const p=d.split('-'); // YYYY-MM-DD
  return'nuit du '+p[2]+'/'+p[1];
}

// « Noter un jour oublié » → ouvre l'éditeur pré-réglé sur hier
function _openForgottenSleep(){
  const t=today();
  _sleepEditDate=new Date(new Date(t+'T12:00:00')-864e5).toISOString().slice(0,10);
  _sleepEditLog=true;
  renderLogSleep();
  const el=document.getElementById('log-sleep');
  if(el)try{el.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
}
// Ouvre l'éditeur sur un jour précis (depuis la liste/graphique d'historique)
function editSleepDay(d){
  _sleepEditDate=(d===today())?null:d;
  _sleepEditLog=true;
  renderLogSleep();
  const el=document.getElementById('log-sleep');
  if(el)try{el.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
}

/* 🚶 LA COURBE DES PAS (30/08/2026, ft-v1071)
   Michel, juste après ft-v1070 : *« les pas vont s'afficher où ? »*. ⛔⛔ **La réponse honnête
   était NULLE PART** : le surplus n'apparaissait qu'en petit sous le TDEE, et **seulement les
   jours de grosse marche**. L'app recevait la donnée, s'en servait pour ses calories, la donnait
   à Milo — et ne la lui montrait jamais. *C'est R5 sous une forme atténuée : la donnée produisait
   un comportement, mais pas celui qu'il attendait.* Il a choisi entre 4 emplacements : *« dans
   Progrès, avec une courbe »*.

   ⭐ POURQUOI L'ONGLET POIDS : mesuré avant de choisir — ni les pas ni la FC au repos n'avaient
   d'écran, et cet onglet est le seul qui porte les MESURES (poids, masse grasse, bilan corporel,
   prise de sang). Les pas viennent de la même montre.

   ⭐ R13 — C'EST `_sleepChartHtml` TRANSPOSÉ, pas un composant neuf : barres SVG, ligne repère,
   moyenne dessous, fenêtre 7/30. Comportement déjà éprouvé, cohérence visuelle gratuite.
   ⛔⛔ ET `_pasEcart` RESTE LE SEUL PROPRIÉTAIRE DU SURPLUS (R2) : cette carte l'AFFICHE, elle ne
   le recalcule jamais. Deux calculs du même surplus finiraient par afficher un chiffre ici et un
   autre sous le TDEE — le défaut que ce projet passe son temps à rattraper. */
let _pasHistOpen=false;   // replié par défaut : on ne pousse pas une carte de plus à tout le monde
let _pasHistDays=7;
function togglePasHist(){_pasHistOpen=!_pasHistOpen;renderPasCard();}
function setPasHistRange(n){_pasHistDays=n;renderPasCard();}
function _pasDaysArr(){
  const t=new Date(today()+'T12:00:00').getTime();
  const byDate={};((typeof S!=='undefined'&&S.healthDaily)||[]).forEach(x=>{ if(x&&x.date&&x.steps>0) byDate[x.date]=x.steps; });
  const arr=[];
  for(let i=_pasHistDays-1;i>=0;i--){
    const d=new Date(t-i*864e5).toISOString().slice(0,10);
    arr.push({date:d, pas:byDate[d]||null});
  }
  return arr;
}
function _pasChartHtml(){
  const arr=_pasDaysArr();
  const avec=arr.filter(a=>a.pas);
  if(!avec.length) return '<div style="text-align:center;font-size:13px;color:var(--t3);padding:16px 0;line-height:1.5;">Aucun pas reçu sur cette période.<br>Ils arrivent de Santé, avec ton sommeil.</div>';
  /* ⛔ LA LIGNE REPÈRE EST SA BASE, PAS UN OBJECTIF. On ne dessine JAMAIS un « 10 000 pas »
     ici : ce serait une cible que personne n'a choisie, sur un écran qui ne fait que décrire
     (R29, et la Vision — l'app ne dit pas qui tu dois devenir). La base vient de `_pasEcart`,
     donc c'est EXACTEMENT le chiffre qui sert au calcul des calories. */
  const e=(typeof _pasEcart==='function')?_pasEcart():null;
  const base=e?e.base:null;
  const maxP=Math.max(...avec.map(a=>a.pas), base||0);
  const W=320,H=120,pad={t:10,r:6,b:18,l:30},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const step=iW/arr.length, bw=Math.max(3,Math.min(22,step-2));
  const toY=v=>pad.t+iH-(Math.min(v,maxP)/maxP)*iH;
  const fmtD=d=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  const nb=n=>n.toLocaleString('fr-FR');
  const bars=arr.map((a,i)=>{
    if(!a.pas) return '';
    const x=pad.l+i*step+(step-bw)/2, y=toY(a.pas), bh=pad.t+iH-y;
    /* ⭐ VERT quand la journée dépasse la base : c'est ce qui a compté dans ses calories. On ne
       colorie PAS en rouge une journée calme — un jour de repos n'est pas un échec (R24). */
    const col=(base!=null && a.pas>base) ? 'var(--green)' : 'var(--t3)';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2,bh).toFixed(1)}" rx="2" fill="${col}" opacity=".85"><title>${fmtD(a.date)} · ${nb(a.pas)} pas</title></rect>`;
  }).join('');
  const moy=Math.round(avec.reduce((s,a)=>s+a.pas,0)/avec.length);
  const yb=base!=null?toY(base):null;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible;">
    <line x1="${pad.l}" y1="${toY(maxP)}" x2="${W-pad.r}" y2="${toY(maxP)}" stroke="var(--sep)" stroke-width=".5"/>
    <text x="${pad.l-4}" y="${toY(maxP)+3}" text-anchor="end" font-size="8.5" style="fill:var(--t3)">${nb(maxP)}</text>
    ${yb!=null?`<line x1="${pad.l}" y1="${yb}" x2="${W-pad.r}" y2="${yb}" stroke="var(--green)" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`:''}
    <line x1="${pad.l}" y1="${pad.t+iH}" x2="${W-pad.r}" y2="${pad.t+iH}" stroke="var(--sep)" stroke-width=".5"/>
    ${bars}
    <text x="${pad.l}" y="${H-4}" text-anchor="start" font-size="8.5" style="fill:var(--t3)">${fmtD(arr[0].date)}</text>
    <text x="${W-pad.r}" y="${H-4}" text-anchor="end" font-size="8.5" style="fill:var(--t3)">${fmtD(arr[arr.length-1].date)}</text>
  </svg>
  <div style="text-align:center;margin-top:6px;font-size:13px;color:var(--t2);">Moyenne : <b style="color:var(--t1)">${nb(moy)}</b> pas / jour · ${avec.length} jour${avec.length>1?'s':''} reçu${avec.length>1?'s':''}</div>
  ${base!=null?`<div style="text-align:center;margin-top:2px;font-size:12px;color:var(--t3);">Le trait vert = <b style="color:var(--green)">ton habitude, ${nb(base)} pas/jour</b> (sur ${e.n} jours)</div>`:''}`;
}
function renderPasCard(){
  const el=document.getElementById('pas-card'); if(!el) return;
  const j=((typeof S!=='undefined'&&S.healthDaily)||[]).filter(x=>x&&x.steps>0);
  /* ⛔ RIEN REÇU → RIEN AFFICHÉ. Une carte vide chez quelqu'un qui n'a pas de montre est du
     bruit permanent : elle lui parle d'une chose qu'il n'a pas (R24). */
  if(!j.length){ el.style.display='none'; el.innerHTML=''; return; }
  el.style.display='block';
  const e=(typeof _pasEcart==='function')?_pasEcart():null;
  const nb=n=>n.toLocaleString('fr-FR');
  /* ⭐ LE RÉSUMÉ REPLIÉ DIT L'ESSENTIEL : les pas du jour, et ce qu'ils ont ajouté. ⛔ Et quand
     l'app n'a pas encore 7 jours, elle le DIT au lieu d'afficher un surplus qu'elle ne sait pas
     calculer (R29) — sinon la personne croirait que sa journée n'a rien valu. */
  const dernier=j.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  const resume = e
    ? (e.kcal>0 ? `${nb(e.pas)} pas · <span style="color:var(--green);font-weight:700">+${e.kcal} kcal</span>`
                : `${nb(e.pas)} pas · journée ordinaire`)
    : `${nb(dernier.steps)} pas · <span style="color:var(--t3)">habitude pas encore connue</span>`;
  el.innerHTML =
    `<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);overflow:hidden;">`
    + `<button id="pas-hist-toggle" onclick="togglePasHist()" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;padding:13px 16px;font-family:var(--font);touch-action:manipulation;">`
    +   `<span style="display:flex;align-items:center;gap:9px;"><span style="font-size:15px;">🚶</span>`
    +   `<span style="text-align:left;"><span style="display:block;font-size:13.5px;font-weight:700;color:var(--t1);">Tes pas</span>`
    +   `<span style="display:block;font-size:12px;color:var(--t2);margin-top:1px;">${resume}</span></span></span>`
    +   `<span style="font-size:13px;color:var(--t3);transform:rotate(${_pasHistOpen?90:0}deg);transition:transform .15s;">›</span>`
    + `</button>`
    + (_pasHistOpen
        ? `<div style="padding:0 16px 14px;">`
          + `<div style="display:flex;gap:6px;margin-bottom:10px;">`
          +   [[7,'7 jours'],[30,'30 jours']].map(r=>`<button class="wrange-chip${_pasHistDays===r[0]?' active':''}" onclick="setPasHistRange(${r[0]})">${r[1]}</button>`).join('')
          + `</div>`
          + _pasChartHtml()
          /* ⛔ ON DIT CE QUE LA COURBE NE PROUVE PAS : des pas ne disent pas ce qui a été fait.
             La même honnêteté que dans le contexte de Milo — l'app ne doit pas affirmer plus
             que ce qu'elle sait, même en vert et même joliment dessiné. */
          + `<div style="font-size:11.5px;color:var(--t3);line-height:1.5;margin-top:10px;">`
          +   `Les jours <span style="color:var(--green);font-weight:700">en vert</span> dépassent ton habitude : c'est ce qui s'ajoute à ta dépense (onglet Nutrition). `
          +   `⚠️ Des pas ne disent pas <b>ce que</b> tu as fait — ils disent seulement que tu as bougé plus que d'ordinaire.`
          + `</div></div>`
        : '')
    + `</div>`;
}
// ── Historique du sommeil (repliable, façon graphique de poids) ──
let _sleepHistOpen=false;   // panneau replié par défaut (gagne de la place)
let _sleepHistDays=7;       // fenêtre affichée : 7 ou 30 jours (défaut 7 = cohérent avec l'aperçu mini-courbe)
function toggleSleepHist(){_sleepHistOpen=!_sleepHistOpen;renderLogSleep();}
function setSleepHistRange(n){_sleepHistDays=n;renderLogSleep();}
const _SLP_QCOL={1:'var(--red)',2:'var(--orange)',3:'var(--purp)',4:'var(--green)'};
const _SLP_QLBL={1:'Mauvais',2:'Moyen',3:'Bon',4:'Excellent'};

// Tableau des N derniers jours (du plus ancien au plus récent) avec l'entrée sommeil ou null
function _sleepDaysArr(){
  const days=_sleepHistDays;
  const t=new Date(today()+'T12:00:00').getTime();
  const byDate={};(S.sleepLog||[]).forEach(e=>{byDate[e.date]=e;});
  const arr=[];
  for(let i=days-1;i>=0;i--){
    const d=new Date(t-i*864e5).toISOString().slice(0,10);
    arr.push({date:d,e:byDate[d]||null});
  }
  return arr;
}
function _sleepChartHtml(){
  const arr=_sleepDaysArr();
  const withData=arr.filter(a=>a.e);
  if(!withData.length)return'<div style="text-align:center;font-size:13px;color:var(--t3);padding:16px 0;line-height:1.5;">Aucune nuit renseignée sur cette période.<br>Choisis un jour dans la liste pour l\'ajouter.</div>';
  const maxH=Math.max(10,...withData.map(a=>a.e.hours||0));
  const W=320,H=120,pad={t:10,r:6,b:18,l:22},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const step=iW/arr.length;
  const bw=Math.max(3,Math.min(22,step-2));
  const toY=h=>pad.t+iH-(Math.min(h,maxH)/maxH)*iH;
  const y8=toY(8);
  const fmtD=d=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  const bars=arr.map((a,i)=>{
    if(!a.e)return'';
    const x=pad.l+i*step+(step-bw)/2,y=toY(a.e.hours),bh=pad.t+iH-y;
    return`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2,bh).toFixed(1)}" rx="2" fill="${_SLP_QCOL[a.e.quality||2]}" style="cursor:pointer" onclick="editSleepDay('${a.date}')"><title>${fmtD(a.date)} · ${a.e.hours}h · ${_SLP_QLBL[a.e.quality||2]}</title></rect>`;
  }).join('');
  const avg=Math.round(withData.reduce((s,a)=>s+(a.e.hours||0),0)/withData.length*10)/10;
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible;">
    <line x1="${pad.l}" y1="${toY(maxH)}" x2="${W-pad.r}" y2="${toY(maxH)}" stroke="var(--sep)" stroke-width=".5"/>
    <text x="${pad.l-4}" y="${toY(maxH)+3}" text-anchor="end" font-size="8.5" style="fill:var(--t3)">${maxH}h</text>
    <line x1="${pad.l}" y1="${y8}" x2="${W-pad.r}" y2="${y8}" stroke="var(--purp)" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>
    <text x="${W-pad.r}" y="${y8-3}" text-anchor="end" font-size="8.5" style="fill:var(--purp);font-weight:700">8h</text>
    <line x1="${pad.l}" y1="${pad.t+iH}" x2="${W-pad.r}" y2="${pad.t+iH}" stroke="var(--sep)" stroke-width=".5"/>
    ${bars}
    <text x="${pad.l}" y="${H-4}" text-anchor="start" font-size="8.5" style="fill:var(--t3)">${fmtD(arr[0].date)}</text>
    <text x="${W-pad.r}" y="${H-4}" text-anchor="end" font-size="8.5" style="fill:var(--t3)">${fmtD(arr[arr.length-1].date)}</text>
  </svg>
  <div style="text-align:center;margin-top:6px;font-size:13px;color:var(--t2);">Moyenne : <b style="color:var(--t1)">${avg}h</b> / nuit · ${withData.length} nuit${withData.length>1?'s':''} renseignée${withData.length>1?'s':''}</div>`;
}
function _sleepListHtml(){
  const arr=_sleepDaysArr().slice().reverse(); // plus récent en tête
  const rows=arr.map(a=>{
    const lbl=_fmtSleepDay(a.date);const label=lbl.charAt(0).toUpperCase()+lbl.slice(1);
    if(a.e){
      return`<button onclick="editSleepDay('${a.date}')" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;border-bottom:1px solid var(--sep);cursor:pointer;padding:10px 4px;font-family:var(--font);touch-action:manipulation;">
        <span style="font-size:13px;color:var(--t1);font-weight:600;">${label}</span>
        <span style="font-size:13px;color:var(--t2);"><b style="color:var(--t1)">${a.e.hours}h</b> · <span style="color:${_SLP_QCOL[a.e.quality||2]};font-weight:700;">${_SLP_QLBL[a.e.quality||2]}</span> <span style="color:var(--t3)">›</span></span>
      </button>`;
    }
    return`<button onclick="editSleepDay('${a.date}')" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;border-bottom:1px solid var(--sep);cursor:pointer;padding:10px 4px;font-family:var(--font);touch-action:manipulation;">
      <span style="font-size:13px;color:var(--t3);">${label}</span>
      <span style="font-size:12px;color:var(--purp);font-weight:700;">＋ à renseigner</span>
    </button>`;
  }).join('');
  return`<div style="max-height:240px;overflow-y:auto;margin-top:12px;border-top:1px solid var(--sep);-webkit-overflow-scrolling:touch;">${rows}</div>`;
}
// Mini-courbe (aperçu) des 7 dernières nuits — barres colorées par qualité, jour vide = trait fin
function _sleepSparkline(){
  const t=new Date(today()+'T12:00:00').getTime();
  const byDate={};(S.sleepLog||[]).forEach(e=>{byDate[e.date]=e;});
  let bars='';
  for(let i=6;i>=0;i--){
    const d=new Date(t-i*864e5).toISOString().slice(0,10);
    const e=byDate[d];
    if(e){const h=Math.max(5,Math.min(28,(Math.min(e.hours,10)/10)*28));bars+='<div style="width:6px;height:'+h.toFixed(0)+'px;border-radius:2px;background:'+_SLP_QCOL[e.quality||2]+';"></div>';}
    else bars+='<div style="width:6px;height:4px;border-radius:2px;background:var(--sep);"></div>';
  }
  return '<div style="display:flex;align-items:flex-end;gap:4px;height:28px;">'+bars+'</div>';
}
// Section historique — un seul bloc avec la carte sommeil (pas de carte ni de trait à part)
function _sleepHistInner(){
  const n=(S.sleepLog||[]).length;
  const chev=`<span style="display:inline-block;transition:transform .2s;transform:rotate(${_sleepHistOpen?90:0}deg);">›</span>`;
  let html='<div>';
  if(!_sleepHistOpen){
    // Aperçu repliable : la mini-courbe (ou un libellé si aucune nuit) + chevron — tap = déplier
    html+=`<button id="sleep-hist-toggle" onclick="toggleSleepHist()" style="width:100%;display:flex;align-items:center;gap:12px;background:none;border:none;cursor:pointer;padding:4px 16px 14px;font-family:var(--font);touch-action:manipulation;">`
      +(n?_sleepSparkline():'<span style="font-size:13px;font-weight:700;color:var(--t2);">📊 Historique du sommeil</span>')
      +`<span style="margin-left:auto;font-size:12px;color:var(--t3);font-weight:700;white-space:nowrap;">${n?'Historique · '+n+' nuit'+(n>1?'s':''):'Ajouter'} ${chev}</span>`
      +`</button>`;
  }else{
    html+=`<button id="sleep-hist-toggle" onclick="toggleSleepHist()" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;cursor:pointer;padding:4px 16px 10px;font-family:var(--font);touch-action:manipulation;">
      <span style="font-size:13px;font-weight:700;color:var(--t2);">📊 Historique du sommeil${n?' · '+n+' nuit'+(n>1?'s':''):''}</span>
      <span style="font-size:12px;color:var(--t3);font-weight:700;">Réduire ${chev}</span>
    </button>`;
    html+='<div style="padding:0 16px 14px;">'
      +'<div style="display:flex;gap:6px;margin-bottom:12px;">'
      +[[7,'7 jours'],[30,'30 jours']].map(r=>`<button onclick="setSleepHistRange(${r[0]})" class="wrange-chip${_sleepHistDays===r[0]?' active':''}">${r[1]}</button>`).join('')
      +'</div>'
      +_sleepChartHtml()
      +_sleepListHtml()
      +'</div>';
  }
  html+='</div>';
  return html;
}

function renderLogSleep(){
  const el=document.getElementById('log-sleep');if(!el)return;
  const todayStr=today();
  const dateStr=_sleepDateFor();
  /* ⭐ LA VUE COMPACTE LIT `_nuit` (30/08) : une nuit MESURÉE mais jamais saisie doit s'afficher,
     sinon l'app dirait « à noter » alors qu'elle connaît déjà la durée. ⛔ En revanche l'ÉDITEUR
     en dessous continue de lire `S.sleepLog` : c'est le champ de SA saisie, on n'y pré-remplit
     jamais la mesure — sinon un simple « Enregistrer » recopierait le chiffre de la montre dans
     sa saisie, et l'écart qu'on cherche justement à voir disparaîtrait pour toujours. */
  const tsToday=(typeof _nuit==='function')?_nuit(todayStr):null;
  const ts=S.sleepLog&&S.sleepLog.find(e=>e.date===dateStr);
  const qLabels={1:'Mauvais',2:'Moyen',3:'Bon',4:'Excellent'};
  const moonSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="color:var(--purp);flex-shrink:0;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  let inner,pad;
  /* ⛔ COMPACT SEULEMENT QUAND ON SAIT TOUT (30/08). Une nuit purement MESURÉE donne la durée
     mais pas la QUALITÉ : passer en compact afficherait « 5,63 h » et n'inviterait plus jamais à
     dire comment on a dormi — l'app aurait l'air satisfaite d'une information qu'elle n'a pas.
     *Ce que la montre ne sait pas, c'est justement ce qu'il faut continuer à demander.* */
  const isCompact=tsToday&&tsToday.quality!=null&&!_sleepEditLog;
  // Vue compacte : cette nuit déjà renseignée et on n'édite pas
  if(isCompact){
    pad='12px 16px 0';
    inner='<div style="display:flex;justify-content:space-between;align-items:center;">'
      +'<div style="display:flex;align-items:center;gap:13px;">'
      +'<div class="home-row-ic" style="background:rgba(168,85,247,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purp)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div>'
      +'<div><div class="home-row-ttl">'+String(tsToday.hours).replace('.',',')+'h'
        +(tsToday.quality!=null?(' · '+qLabels[tsToday.quality]):'')+'</div>'
      /* ⛔ On NOMME la source quand c'est une mesure, et on montre l'écart. Sans ça, le chiffre
         change sous ses yeux sans explication — et l'écart est justement l'information utile
         (« je me croyais à 6 h 43, j'étais à 5 h 38 »). Jamais formulé comme une erreur : on ne
         note pas ses nuits au chronomètre. */
      +'<div class="home-row-sub">'+(tsToday.source==='mesure'
          ? ('Mesuré par ta montre'+(tsToday.ecart!=null&&Math.abs(tsToday.ecart)>=0.5
              ? (' · tu avais noté '+String(tsToday.hSaisie).replace('.',',')+'h') : ''))
          : 'Sommeil de cette nuit')+'</div></div>'
      +'</div>'
      +'<button style="font-size:12px;font-weight:600;color:var(--t3);background:none;border:none;cursor:pointer;padding:4px 8px;touch-action:manipulation;" onclick="_sleepEditDate=null;_sleepEditLog=true;renderLogSleep()">Modifier</button>'
      +'</div>';
  }else{
    pad='16px 16px 4px';
    _sleepQual=(ts&&ts.quality)||3;
    const bars=function(n){
      const h=[6,9,12,15];
      return '<div class="slq-bars">'+h.map(function(height,i){return'<div class="slq-bar'+(i>=n?' slq-bar-off':'')+'" style="height:'+height+'px;"></div>';}).join('')+'</div>';
    };
    const editingPast=dateStr!==todayStr;
    /* ⭐ PRÉ-REMPLI PAR LA MONTRE, ET DIT COMME TEL — mais SEULEMENT s'il n'y a aucune saisie
       pour ce jour-là. ⛔ Pré-remplir PAR-DESSUS une saisie existante ferait qu'un simple
       « Enregistrer » recopierait le chiffre de la montre dans sa saisie : l'écart qu'on cherche
       justement à lui montrer disparaîtrait pour toujours, et sans qu'il l'ait décidé (R29). */
    const _mesNuit = ts ? null : ((S.healthDaily||[]).find(x=>x&&x.date===dateStr&&x.sleep>0)||{}).sleep;
    inner='<div style="display:flex;align-items:center;gap:7px;margin-bottom:12px;">'+moonSvg
      +'<span style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);">Sommeil — '+_fmtSleepDay(dateStr)+'</span></div>'
      +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">'
      +'<span style="font-size:12px;color:var(--t2);white-space:nowrap;">Jour :</span>'
      +'<input type="date" id="sleep-date" max="'+todayStr+'" value="'+dateStr+'" onchange="_sleepEditDate=(this.value&&this.value!==\''+todayStr+'\')?this.value:null;renderLogSleep()" style="flex:1;padding:9px 10px;border-radius:10px;border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);background:var(--bg3);color:var(--t1);font-family:var(--font);font-size:15px;">'
      +'</div>'
      +'<div style="display:flex;gap:6px;margin-bottom:12px;">'
      +'<button class="slq-btn" id="sq-1" onclick="setSleepQual(1)">'+bars(1)+'Mauvais</button>'
      +'<button class="slq-btn" id="sq-2" onclick="setSleepQual(2)">'+bars(2)+'Moyen</button>'
      +'<button class="slq-btn" id="sq-3" onclick="setSleepQual(3)">'+bars(3)+'Bon</button>'
      +'<button class="slq-btn" id="sq-4" onclick="setSleepQual(4)">'+bars(4)+'Excellent</button>'
      +'</div>'
      +(_mesNuit!=null?('<div style="font-size:11.5px;color:var(--t3);line-height:1.5;margin-bottom:8px;">'
         +'\u231A <b>'+String(_mesNuit).replace('.',',')+' h</b> mesur\u00e9es par ta montre \u2014 dis juste '
         +'comment tu as dormi, la dur\u00e9e est d\u00e9j\u00e0 l\u00e0.</div>'):'')
      +'<div style="display:flex;gap:8px;align-items:center;">'
      +'<input type="text" id="sleep-hours" placeholder="7.5" step="0.5" min="2" max="14" inputmode="decimal" enterkeyhint="done" oninput="_toggleSleepSaveBtn(this.value)" onkeydown="if(event.key===\'Enter\'){event.preventDefault();saveSleepEntry();}" style="flex:1;padding:11px 12px;border-radius:10px;border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);background:var(--bg3);color:var(--t1);font-family:var(--font);font-size:16px;" value="'+(ts?String(ts.hours).replace('.',','):(_mesNuit!=null?String(_mesNuit).replace('.',','):''))+'">'
      +'<span style="font-size:13px;color:var(--t2);white-space:nowrap;">h de sommeil</span>'
      +((ts||editingPast)?'<button class="btn btn-bg2 btn-sm" onclick="_sleepEditDate=null;_sleepEditLog=false;renderLogSleep()" style="flex-shrink:0;font-size:12px;padding:8px 12px;">Annuler</button>':'')
      +'</div>'
      +'<button id="sleep-save-btn" class="btn btn-red ft-press" onclick="saveSleepEntry()" style="margin-top:10px;padding:10px;font-size:14px;display:'+((ts&&ts.hours)?'block':'none')+';">Enregistrer</button>';
  }
  // UNE seule carte : le résumé/éditeur du jour EN HAUT, puis l'historique sous un séparateur.
  el.innerHTML='<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);overflow:hidden;">'
    +'<div style="padding:'+pad+';">'+inner+'</div>'
    +_sleepHistInner()
    +'</div>';
  if(!isCompact)updateSleepQualBtns();
  // La carte sommeil = partie basse du « check-in du jour » : cachée tant que le check-in est replié (ft-v547).
  try{if(typeof _checkinOpen!=='undefined')el.style.display=_checkinOpen?'':'none';}catch(e){}
}

// Bouton « Enregistrer » du sommeil : visible seulement quand une valeur d'heures est saisie.
function _toggleSleepSaveBtn(v){
  const b=document.getElementById('sleep-save-btn');
  if(b)b.style.display=(parseFloat(v)>0)?'block':'none';
}

function renderLogFinish(){
  const el=document.getElementById('log-finish');if(!el)return;
  if(!S.wkt){el.innerHTML='';return;}
  const hasCardio=!!((S.wkt.cardio&&S.wkt.cardio.duration)||(S.wkt.cardioAvant&&S.wkt.cardioAvant.duration));
  const hasDone=!!(S.wkt.exs&&S.wkt.exs.some(ex=>ex.sets.some(s=>s.done)));
  if(!hasDone&&!hasCardio){el.innerHTML='';return;} // rien à enregistrer (ni série validée, ni cardio)
  let summary='';
  if(hasDone){
    const nEx=S.wkt.exs.filter(ex=>ex.sets.some(s=>s.done)).length;
    const nSets=S.wkt.exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
    const vol=Math.round(S.wkt.exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done&&s.type!=='É'&&s.type!=='W').reduce((b,s)=>b+(s.kg||0)*(s.reps||0),0),0));
    summary=`${nEx} exercice${nEx>1?'s':''} · ${nSets} série${nSets>1?'s':''} · ${vol} kg de volume`;
  }
  if(hasCardio){
    // Les deux moments sont nommés dans le résumé : « avant 10min · après 20min » — sans ça,
    // deux cardios se seraient additionnés en silence sous un seul chiffre.
    const kcal=(typeof calcCardioKcalTotal==='function')?calcCardioKcalTotal():0;
    const bouts=[];
    if(S.wkt.cardioAvant&&S.wkt.cardioAvant.duration)bouts.push('avant '+S.wkt.cardioAvant.duration+'min');
    if(S.wkt.cardio&&S.wkt.cardio.duration)bouts.push('après '+S.wkt.cardio.duration+'min');
    const cardioTxt=`🏃 Cardio ${bouts.join(' · ')}${kcal?` · ~${kcal}kcal`:''}`;
    summary = summary ? summary+' · '+cardioTxt : cardioTxt;
  }
  const label = hasDone ? '🏁 Terminer la séance' : '🏁 Enregistrer le cardio';
  el.innerHTML=`<div style="border-top:1px solid var(--sep);padding-top:14px;margin-top:4px;">
    <div style="text-align:center;font-size:13px;color:var(--t2);margin-bottom:10px;font-weight:600;">${summary}</div>
    <button class="btn btn-red" onclick="finishWorkout()" style="font-size:17px;padding:16px;letter-spacing:.3px;">${label}</button>
  </div>`;
}

// Note de sommeil selon la DURÉE — interpolation linéaire entre points d'ancrage, donc
// AUCUN saut : une minute de sommeil en plus ne peut jamais valoir 24 points (bug du 02/08).
// Les ancres disent le barème en clair : 6 h est insuffisant (55), 7 h correct sans plus (72),
// 8 h bien (90), 9 h optimal (100) ; au-delà, dormir beaucoup n'est pas un gain (fatigue/maladie).
const _SLEEP_ANCHORS=[[0,0],[4,18],[5,35],[6,55],[7,72],[8,90],[9,100],[10,96],[12,85]];
function _sleepCurve(h){
  const A=_SLEEP_ANCHORS;
  if(h<=A[0][0])return A[0][1];
  if(h>=A[A.length-1][0])return A[A.length-1][1];
  for(let i=1;i<A.length;i++){
    if(h<=A[i][0]){
      const [x0,y0]=A[i-1],[x1,y1]=A[i];
      return Math.round(y0+(y1-y0)*(h-x0)/(x1-x0));
    }
  }
  return 70;
}
/* 😴 UNE NUIT, DEUX SOURCES, UN SEUL PROPRIÉTAIRE (30/08/2026)
   Michel : *« les pas et le sommeil, c'est hyper important »*.

   ⛔⛔ LE DÉFAUT ÉTAIT MESURÉ ET ÉCRIT DEPUIS ONZE JOURS, DANS `Code.js`. La saisie manuelle est
   bonne EN MOYENNE (+12 min sur 10 semaines) mais elle **aplatit les mauvaises semaines** :
   corrélation sommeil réel / erreur de saisie **r = −0,96**. Du 6 au 12 août, Garmin disait
   **5 h 38**, l'app **6 h 43**. Or `S.sleepLog` est LA BASE du score de récup **et** part chez
   Milo. 👉 ***Le score et Milo étaient donc les plus faux exactement les semaines où ils
   comptaient le plus.*** La donnée qui corrige ça arrivait depuis ft-v916 et **personne ne la
   lisait** : seul `rhr` était exploité (R5 — une donnée qui n'atteint aucun comportement
   n'existe pas).

   ⭐⭐ LA MESURE GAGNE SUR LA DÉCLARATION, ET L'APP LE DIT — décision de Michel, et c'est **R32**
   (mesuré > estimé > déclaré). ⛔ Mais elle ne gagne QUE sur la DURÉE : la montre sait combien de
   temps tu as dormi, **elle ne sait pas comment tu t'es senti**. La qualité reste donc toujours
   celle que la personne a donnée, jamais dérivée d'une mesure.

   ⚠️⚠️ LE PIÈGE QUI M'ATTENDAIT, TROUVÉ EN LISANT LE BARÈME AVANT D'ÉCRIRE : le scoreur faisait
   `e.quality||2`, donc une qualité **inconnue** valait silencieusement « Moyen » — soit **45/100
   sur un axe qui pèse 40 %**. Injecter des nuits mesurées sans qualité aurait donc **FAIT BAISSER
   le score de quelqu'un qui a bien dormi**, en silence, au moment même où on prétendait le rendre
   plus juste. 👉 Une nuit sans qualité connue est notée **sur sa seule durée** — on ne remplace
   pas une inconnue par une valeur moyenne, c'est un fait inventé (**R29**).
   ⛔ Et ça ne change RIEN pour l'existant : les deux seuls écrivains de `sleepLog`
   (`ciPickSleep`, `saveSleepEntry`) posent TOUJOURS une qualité. Le chemin « durée seule » ne
   peut concerner qu'une nuit purement mesurée. Vérifié avant d'y toucher, pas supposé.

   ⚠️ `hours` PEUT ÊTRE UN DÉFAUT QUE PERSONNE N'A CHOISI : `ciPickSleep` écrit `hours||7.5` quand
   on ne répond qu'à la question de qualité du check-in. La mesure ne remplace donc pas seulement
   un chiffre approximatif — elle remplace parfois un chiffre que la personne n'a jamais donné. */
function _nuit(dateStr){
  try{
    const saisie=(typeof S!=='undefined'&&S.sleepLog||[]).find(e=>e&&e.date===dateStr)||null;
    const mes=(typeof S!=='undefined'&&S.healthDaily||[]).find(x=>x&&x.date===dateStr&&x.sleep>0)||null;
    if(!saisie&&!mes) return null;
    const hSaisie=(saisie&&saisie.hours>0)?saisie.hours:null;
    const hMes=mes?mes.sleep:null;
    if(hMes==null&&hSaisie==null) return null;
    return {date:dateStr,
            hours:  hMes!=null?hMes:hSaisie,
            quality:(saisie&&saisie.quality!=null)?saisie.quality:null,  // ⛔ jamais dérivée d'une mesure
            source: hMes!=null?'mesure':'saisie',
            hSaisie, hMes,
            // l'écart n'existe que si les DEUX existent — sinon il n'y a rien à comparer
            ecart:(hMes!=null&&hSaisie!=null)?Math.round((hMes-hSaisie)*100)/100:null};
  }catch(e){ return null; }
}
/* Les nuits récentes, de la plus proche à la plus lointaine, TOUTES SOURCES CONFONDUES.
   ⛔ On part de l'UNION des dates : partir de `sleepLog` seul raterait une nuit mesurée que la
   personne n'a pas saisie — c'est-à-dire précisément le cas qu'on vient d'ouvrir. */
function _nuitsRecentes(auj, n){
  try{
    const d={};
    ((typeof S!=='undefined'&&S.sleepLog)||[]).forEach(e=>{ if(e&&e.date&&e.date<=auj) d[e.date]=1; });
    ((typeof S!=='undefined'&&S.healthDaily)||[]).forEach(x=>{ if(x&&x.date&&x.sleep>0&&x.date<=auj) d[x.date]=1; });
    return Object.keys(d).sort((a,b)=>b.localeCompare(a)).slice(0,n||3)
             .map(_nuit).filter(Boolean);
  }catch(e){ return []; }
}
/* ❤️ LA FRÉQUENCE CARDIAQUE AU REPOS — LE 1ᵉʳ SIGNAL MESURÉ DU SCORE DE RÉCUP (16/08/2026)
   Michel, devant la liste des types que Raccourcis sait lire : *« Fréquence cardiaque c'est pas
   bon ? »*. Pour son cardio, non — un rythme ne dit pas si c'était une marche ou un vélo. Mais
   au REPOS, si.

   ⭐ CE QUE ÇA CHANGE VRAIMENT : jusqu'ici le score de récup se calculait sur du **déclaratif**
   (sommeil noté, séance récente, âge, jours enchaînés, humeur du jour). **Aucune mesure du
   corps.** La FC au repos est le premier signal physiologique qui y entre — et c'est le seul
   que la voie gratuite permette, puisque les entraînements ne sont pas lisibles par Raccourcis.

   ⚠️⚠️ ON COMPARE LA PERSONNE À ELLE-MÊME, JAMAIS À UNE NORME. Une FC de repos de 62 ne veut
   rien dire dans l'absolu — chez un athlète c'est haut, chez un sédentaire c'est bas. Ce qui
   parle, c'est l'ÉCART à SA propre base (médiane des 30 derniers jours). C'est aussi ce qui
   rend la chose honnête : on ne classe personne, on suit une tendance (**R12**).
   ⚠️ IL FAUT UNE BASE AVANT DE JUGER : moins de 7 jours d'historique → on ne fait RIEN. Un écart
   calculé sur deux nuits serait du bruit présenté comme un signal (**R29**).
   ⚠️ LA MÉDIANE, PAS LA MOYENNE : une nuit de fièvre ne doit pas déplacer la référence.
   ⚠️ L'AJUSTEMENT EST BORNÉ À ±8 POINTS : c'est un indice parmi d'autres, pas un verdict. Une FC
   élevée peut venir d'un rhume, d'un verre de trop ou d'une pièce trop chaude — l'app ne le sait
   pas et ne doit surtout pas prétendre le savoir (Constitution : aucun diagnostic).
   ⚠️ ET ELLE N'ENTRE DANS AUCUN CALCUL DE CALORIES. Michel, le même soir : *« si la fréquence
   cardiaque pendant la séance c'est utile pour rajouter à nos affinages de calculs, je ne suis
   pas d'accord »*. C'est la position du projet depuis le début, et elle est mesurée : r = 0,10
   à 0,34 entre les calories d'un bracelet et la calorimétrie indirecte en résistance. */
/* 🚶 LES PAS — LE SURPLUS SUR SA PROPRE BASE, JAMAIS LE TOTAL (30/08/2026)
   Michel : *« si on rajoute les pas ça rajoute forcément des calories dépensées dans la journée,
   et ça montre aussi l'activité en l'absence de données rentrées dans l'application. Exemple :
   on a marché 15 000 pas parce qu'on a fait une randonnée — à l'heure actuelle on ne peut pas
   le renseigner. **Attention, il faut que ça soit cohérent** : la montre prend en compte aussi
   le nombre de pas si on fait du tapis à la salle, ou de la course, ou du vélo elliptique. »*

   ⛔⛔ IL A NOMMÉ LE PIÈGE DE ft-v949 AVANT QU'ON LE TROUVE, et il est plus large que le tapis.
   `calcTDEE = BMR × activityLevel + workExtra + sportExtra` — **aucun terme de séance**, parce
   que ft-v949 l'a retiré : le multiplicateur s'appelle littéralement « Modéré (3-4j) », les
   séances sont dedans. Or il contient aussi **la marche ordinaire** d'une journée normale.
   👉 ***Ajouter les pas BRUTS facturerait une deuxième fois la marche que le multiplicateur
   couvre déjà*** — le même défaut, sur une autre grandeur.

   ⭐⭐ D'OÙ LE SURPLUS, ET IL RÉPOND AUX DEUX CAS DE MICHEL D'UN SEUL COUP :
   · la RANDONNÉE — 15 000 pas quand il en fait 6 000 → 9 000 pas réellement **non comptés** ;
   · le TAPIS — s'il en fait régulièrement, c'est **dans sa base**, donc surplus nul, donc rien
     n'est compté deux fois. Et s'il n'en fait jamais, ce jour-là EST une dépense en plus.
   *La base n'est pas une norme : c'est SA journée ordinaire à lui.*

   ⭐ R13 — RIEN N'EST INVENTÉ : c'est le motif de `_rhrEcart`, dix lignes plus bas (médiane sur
   une fenêtre, minimum de jours avant de se prononcer, effet borné). La MÉDIANE et pas la
   moyenne, pour la même raison : un déménagement ou une journée à Disney ne doit pas déplacer
   la référence.
   ⛔ MINIMUM 7 JOURS, sinon on se tait : un surplus calculé sur deux jours est du bruit présenté
   comme un signal (R29). ⛔ Et le seuil de 1 500 pas évite de commenter chaque pas — une
   variation quotidienne normale n'est pas une information (R12 : la tendance, pas le bruit).
   ⛔ BORNÉ À 500 kcal : un GPS qui déraille, un trajet en voiture compté en pas, une journée de
   déménagement ne doivent pas faire exploser une cible calorique. *Le coût de l'erreur porte sur
   ce que la personne mange* (R29).
   ⚠️ ET C'EST UNE ESTIMATION, DITE COMME TELLE : ~1 300 pas au kilomètre, ~0,5 kcal par kg et
   par km. On ne prétend pas mesurer une dépense, on l'approche. */
const PAS_JOURS_BASE = 30;   // fenêtre de référence, comme la FC au repos
const PAS_MIN_JOURS  = 7;    // en dessous, on ne se prononce pas
const PAS_SEUIL      = 1500; // en deçà, c'est la variation d'une journée ordinaire
const PAS_MAX_KCAL   = 500;  // borne dure : une cible calorique ne s'envole pas sur un capteur
const PAS_PAR_KM     = 1300;
function _pasEcart(refTs){
  try{
    const j=(typeof S!=='undefined'&&S.healthDaily)||[];
    const auj=(typeof today==='function')?today(refTs)
             :new Date(refTs==null?Date.now():refTs).toISOString().slice(0,10);
    /* ⛔ Les jours POSTÉRIEURS sont exclus : sans ce filtre, rejouer une journée d'il y a une
       semaine la calculerait avec les marches d'après (la leçon de `_rhrEcart`, ft-v1017). */
    const rec=j.filter(x=>x&&x.date&&x.steps>0&&x.date<=auj)
               .sort((a,b)=>b.date.localeCompare(a.date));
    if(!rec.length) return null;
    const jour=rec[0];
    const age=(Date.parse(auj+'T12:00:00')-Date.parse(jour.date+'T12:00:00'))/86400000;
    if(!(age>=0)||age>1) return null;             // trop vieux → on ne dit rien (R29)
    const base=rec.slice(1).filter(x=>{
      const d=(Date.parse(jour.date+'T12:00:00')-Date.parse(x.date+'T12:00:00'))/86400000;
      return d>0 && d<=PAS_JOURS_BASE;
    }).map(x=>x.steps);
    if(base.length<PAS_MIN_JOURS) return null;    // pas de base → pas de surplus (R29)
    const t=base.slice().sort((a,b)=>a-b), m=t.length>>1;
    const med=t.length%2 ? t[m] : Math.round((t[m-1]+t[m])/2);
    const surplus=jour.steps-med;
    return {pas:jour.steps, base:med, surplus:surplus, n:base.length, date:jour.date,
            /* ⛔ SEULEMENT LE SURPLUS POSITIF entre dans les calories. Une journée SOUS sa base
               ne se DÉFALQUE pas : le multiplicateur est une moyenne, il absorbe déjà les jours
               creux — retrancher reviendrait à punir un jour de repos, et à faire baisser une
               cible alimentaire un jour de fatigue. */
            kcal: surplus>=PAS_SEUIL
                  ? Math.min(PAS_MAX_KCAL,
                      Math.round((surplus/PAS_PAR_KM)*((typeof S!=='undefined'&&S.bw)||80)*0.5))
                  : 0};
  }catch(e){ return null; }
}
const RHR_JOURS_BASE = 30;   // fenêtre de référence
const RHR_MIN_JOURS  = 7;    // en dessous, on ne se prononce pas
const RHR_MAX_ADJ    = 8;    // borne de l'ajustement, dans les deux sens
/* ⭐ `refTs` optionnel (ft-v1017) : rejoue l'écart de FC tel qu'il était à une date passée,
   pour l'historique du score de récup. ⛔ Et il ne regarde QUE les jours <= à cette date —
   sinon une mesure prise depuis influencerait un score d'il y a une semaine, ce qui serait
   un fait faux présenté comme un calcul (R29). */
function _rhrEcart(refTs){
  try{
    const j=(typeof S!=='undefined'&&S.healthDaily)||[];
    if(j.length<RHR_MIN_JOURS+1) return null;
    const auj=(typeof today==='function')?today(refTs):new Date(refTs==null?Date.now():refTs).toISOString().slice(0,10);
    // la valeur du jour, ou celle d'hier si la nuit n'est pas encore remontée
    const rec=j.filter(x=>x&&x.date&&x.rhr>0&&x.date<=auj).sort((a,b)=>b.date.localeCompare(a.date));
    if(!rec.length) return null;
    const jour=rec[0];
    const age=(Date.parse(auj+'T12:00:00')-Date.parse(jour.date+'T12:00:00'))/86400000;
    if(!(age>=0) || age>2) return null;                 // trop vieux → on ne dit rien (R29)
    const base=rec.slice(1).filter(x=>{
      const d=(Date.parse(jour.date+'T12:00:00')-Date.parse(x.date+'T12:00:00'))/86400000;
      return d>0 && d<=RHR_JOURS_BASE;
    }).map(x=>x.rhr);
    if(base.length<RHR_MIN_JOURS) return null;
    const t=base.slice().sort((a,b)=>a-b), m=t.length>>1;
    const med=t.length%2 ? t[m] : (t[m-1]+t[m])/2;
    return {rhr:jour.rhr, base:Math.round(med*10)/10, ecart:Math.round((jour.rhr-med)*10)/10,
            n:base.length, date:jour.date};
  }catch(e){ return null; }
}
/* La pente : neutre tant qu'on reste à ±2 bpm de sa base (variation normale d'une nuit à
   l'autre), puis 2 points par battement, borné. Au-dessus de sa base = récupération incomplète,
   en dessous = plutôt frais. ⚠️ Le seuil de 2 bpm n'est pas cosmétique : sans lui, l'app
   commenterait chaque battement et le score bougerait sans raison (R12 : tendance, pas bruit). */
function _rhrAjust(e){
  if(!e) return 0;
  const d=e.ecart;
  if(Math.abs(d)<=2) return 0;
  const brut=(d>0 ? -(d-2) : -(d+2))*2;
  return Math.max(-RHR_MAX_ADJ, Math.min(RHR_MAX_ADJ, Math.round(brut)));
}
/* Le COÛT en fatigue d'une séance, en points. Sortie de `calcRecoveryDetail` le 21/08 pour
   que la PROJECTION (« quand serai-je au max ? ») lise exactement le même chiffre : deux
   formules de fatigue finiraient par annoncer une date qui ne correspond pas au score (R2). */
/* ⭐ « LA DERNIÈRE SÉANCE » VUE DEPUIS UN INSTANT DONNÉ (ft-v1017). Sortie en fonction pour
   que le SCORE et la PROJECTION lisent la même règle (R2) — c'est déjà ce qu'on avait fait
   pour `_penaliteSeance` le 21/08, pour la même raison.
   ⚠️ `S.sessions` est rangé du plus RÉCENT au plus ancien : on rend donc la première qui
   passe le filtre, pas la dernière.
   ⚠️ Deux critères, et pas un seul : une séance qui porte son heure (`ts`) se compare à la
   MINUTE — c'est ce qui permet de rejouer une matinée avant la séance du soir. Une vieille
   séance sans heure n'a que sa DATE, on la compare donc au jour. */
function _derniereSeanceAvant(refTs, auj){
  const L=(typeof S!=='undefined'&&S.sessions)||[];
  if(refTs==null) return L[0];
  for(let i=0;i<L.length;i++){
    const x=L[i]; if(!x||!x.date) continue;
    const ts=x.ts||x.id;
    if(ts ? (ts<=refTs) : (x.date<=auj)) return x;
  }
  return null;
}
function _penaliteSeance(sess){
  let load=0;
  ((sess&&(sess.exs||sess.exercises))||[]).forEach(ex=>(ex.sets||[]).forEach(s=>{
    if(!s.done||s.type==='W'||s.type==='É')return;      // exclut échauffement
    load += s.type==='E'?1.5:s.type==='D'?1.3:1;         // échec/drop = plus fatigant
  }));
  // Plafond relevé de 30 à 38 (02/08) : mesuré, une séance de 24 séries de squat la veille
  // ne coûtait que 10 points — l'app affichait « Bonne récup » le lendemain d'un gros leg day.
  return Math.max(6,Math.min(38,Math.round(load*1.7))); // ~ -10 (abdos) à -38 (grosse séance), min -6
}
/* ⭐⭐ `refTs` = L'INSTANT AUQUEL ON SE PLACE (ft-v1017), optionnel. Sans argument, la
   fonction se comporte EXACTEMENT comme avant — c'est ce qui rend le changement sûr : les
   10 appels existants ne bougent pas.
   ⛔⛔ POURQUOI CE PARAMÈTRE PLUTÔT QU'UN JOURNAL DE SCORES : le score est une FONCTION
   DÉTERMINISTE de données déjà stockées (sommeil, séances, état du jour, FC, âge…). Écrire
   un `recupLog` en plus, ce serait une SECONDE source de vérité pour un chiffre qu'on sait
   recalculer — elle divergerait le jour où un barème change (R2). En le rejouant, on gagne
   aussi l'historique RÉTROACTIF : la courbe existe dès la 1ʳᵉ ouverture, pas à partir
   d'aujourd'hui.
   ⚠️⚠️ ET DEUX LIMITES HONNÊTES, ÉCRITES PLUTÔT QUE TUES :
   ① si une nuit est notée APRÈS COUP, le score rejoué pour ce jour-là n'est pas celui que
      l'app avait affiché sur le moment — il est plus juste, mais il a changé ;
   ② `age`, `level` et `smoker` n'ont PAS d'historique : un score rejoué les prend dans leur
      valeur d'aujourd'hui. L'écart est borné (±3 pts par palier d'âge, −4 pour le tabac) et
      il ne peut pas déformer une TENDANCE, puisqu'il décale toute la courbe pareil. */
function calcRecoveryDetail(refTs){
  /* Les DEUX seuls repères de temps de la fonction. Tout ce qui suit les lit, plus jamais
     `Date.now()` ni `today()` directement — sinon une moitié du calcul se placerait
     aujourd'hui et l'autre à la date demandée, et personne ne le verrait. */
  const _now = (refTs==null) ? Date.now() : refTs;
  const _auj = today(_now);
  // Sommeil non renseigné → base neutre « invisible » (70) : le score reste
  // fonctionnel pour tout le monde, les autres facteurs (séance, âge, cycle…)
  // s'appliquent quand même, et un conseil discret invite à renseigner le sommeil.
  /* ⛔ Les nuits POSTÉRIEURES à la date demandée sont exclues : sans ce filtre, un score
     d'il y a une semaine se calculerait avec les nuits d'après (R29). */
  /* ⭐ LES NUITS VIENNENT MAINTENANT DES DEUX SOURCES (30/08) — `_nuitsRecentes` est le seul
     propriétaire de « qu'est-ce qu'on sait de cette nuit-là » (R2). Avant, cette ligne ne lisait
     que `S.sleepLog` : une nuit MESURÉE mais non saisie n'existait pas pour le score. */
  const sorted=_nuitsRecentes(_auj,3);
  const hasSleep = !!sorted.length;
  let wScore;
  if(hasSleep){
    const scores=sorted.map(e=>{
      const h=e.hours||0;
      // ⚠️ COURBE CONTINUE (02/08, retour Michel : « le prêt à performer est trop optimiste »).
      // AVANT, un barème en PALIERS : h<7 → 60, h>=7 → 100. Mesuré : 6 h 54 donnait 53 et
      // 7 h 00 donnait 77 — **24 points pour six minutes de sommeil**. C'est exactement le
      // défaut de la « marche de midi » corrigée le 30/07 : un saut au lieu d'une pente.
      // Et 7 h valait la note MAXIMALE, alors que c'est le minimum recommandé, pas l'optimum :
      // il faut maintenant 8 h pour approcher le haut du barème, 9 h pour l'atteindre.
      const hScore=_sleepCurve(h);
      /* ⛔⛔ QUALITÉ INCONNUE → LA DURÉE SEULE (30/08). Avant, `e.quality||2` faisait valoir
         « Moyen » (45/100, sur un axe qui pèse 40 %) à une qualité qu'on n'avait pas. Inoffensif
         tant que TOUTES les nuits venaient d'une saisie — les deux écrivains posent toujours une
         qualité. Mais une nuit purement MESURÉE n'en a aucune : la garder aurait fait BAISSER le
         score de quelqu'un qui a bien dormi, en silence, dans la version censée le rendre juste.
         *On ne remplace pas une inconnue par une moyenne : c'est un fait inventé* (R29). */
      if(e.quality==null) return Math.round(hScore);
      // La QUALITÉ ressentie pèse plus lourd dans le bas : dire « j'ai mal dormi » (1/4) ne
      // doit pas laisser un score flatteur. Avant, 1/4 valait encore 25 points sur 100.
      const qScore=[15,15,45,75,100][Math.max(0,Math.min(4,Math.round(e.quality)))];
      return Math.round(hScore*0.6+qScore*0.4);
    });
    const weights=[0.6,0.3,0.1].slice(0,scores.length);
    const wTotal=weights.reduce((a,b)=>a+b,0);
    wScore=scores.reduce((a,s,i)=>a+s*weights[i],0)/wTotal;
  } else {
    wScore=70; // base neutre par défaut (sommeil inconnu)
  }
  // Ajustement selon la dernière séance : entraîné récemment → fatigue, jours de repos → bonus.
  // La pénalité est PROPORTIONNELLE au volume de la séance (nb de séries de travail), pondérée
  // par l'intensité (échec ×1.5, drop ×1.3) → juste des abdos pénalise peu, un gros leg day beaucoup.
  // ⚠️ FIN DE LA « MARCHE DE MIDI » (audit 30/07, validé Michel) : avant, les jours écoulés se
  // comptaient depuis MIDI de la date de séance → le score sautait de +7 points à 12 h 01, et les
  // jours de repos se créditaient avec une demi-journée de retard. MAINTENANT :
  //  · quand on connaît l'HEURE de la séance (ts), la fatigue s'efface EN CONTINU sur 36 h —
  //    pleine juste après, ~ -8 à 27 h (comme l'ancien « lendemain »), nulle à 36 h. Aucun saut,
  //    ni à midi ni à minuit ;
  //  · les jours de REPOS se comptent en jours CALENDAIRES (today()), crédités dès le matin ;
  //  · une vieille séance SANS heure garde l'ancien barème par jour (rien ne change pour elle).
  /* ⛔⛔ « LA DERNIÈRE SÉANCE » DÉPEND DE QUAND ON REGARDE. `S.sessions[0]` est la dernière
     tout court : rejouer un jeudi avec la séance du samedi suivant pénaliserait le jeudi
     pour un effort pas encore fourni. On prend donc la dernière séance ANTÉRIEURE à
     l'instant demandé. Sans `refTs`, c'est bien `S.sessions[0]` — comportement inchangé. */
  const lastSess=_derniereSeanceAvant(_now,_auj);
  let sessAdj=0;
  if(lastSess&&lastSess.date){
    const dCal=Math.round((new Date(_auj+'T12:00:00')-new Date(lastSess.date+'T12:00:00'))/864e5);
    const tsSess=lastSess.ts||lastSess.id;
    const calcPen0=()=>_penaliteSeance(lastSess);
    if(tsSess){
      // Effacement sur 48 h et non 36 h (02/08) : à 36 h, une grosse séance de jambes pesait
      // déjà zéro. 48 h correspond mieux à ce qu'on ressent réellement après du lourd.
      const hrs=Math.max(0,(_now-tsSess)/36e5);
      if(hrs<48){ sessAdj=-Math.max(0,Math.round(calcPen0()*(48-hrs)/48)); }
      else if(dCal>=2){ sessAdj=Math.min(dCal,4)*3; }        // 2j +6 · 3j +9 · 4j+ +12 (inchangé)
    } else {
      if(dCal<=0){ sessAdj=-calcPen0(); }
      else if(dCal===1){ sessAdj=-12; }   // séance d'hier sans heure connue : alignée sur le nouveau barème
      else { sessAdj=Math.min(dCal,4)*3; }
    }
  }
  // Niveau : un débutant récupère plus lentement d'un même volume, un confirmé a plus de capacité de travail
  const lvlF = S.level==='debutant'?1.15 : S.level==='confirme'?0.85 : 1;
  if(sessAdj<0) sessAdj=Math.round(sessAdj*lvlF); // n'affecte que la pénalité de fatigue, pas le bonus repos
  // Âge : la récupération ralentit avec l'âge
  const age=S.age||0;
  const ageAdj = age>=60?-9 : age>=50?-6 : age>=40?-3 : 0;
  // Cycle menstruel (femmes) : la phase influence la readiness (règles/lutéale ↓, ovulation ↑)
  let cycleAdj=0,cpPhase='';
  try{
    const cp=(typeof getMensCyclePhase==='function')?getMensCyclePhase(_now):null;
    if(cp&&cp.perf){ cycleAdj = cp.perf==='low'?-10 : cp.perf==='declining'?-5 : cp.perf==='peak'?4 : cp.perf==='rising'?2 : 0; cpPhase=cp.phase||''; }
  }catch(e){}
  // Fatigue accumulée : plusieurs séances sur les 3 derniers jours (enchaîner sans repos)
  const recentDays=new Set((S.sessions||[]).filter(s=>s&&s.date&&(()=>{const dd=Math.round((new Date(_auj+'T12:00:00')-new Date(s.date+'T12:00:00'))/864e5);return dd>=0&&dd<=2;})()).map(s=>s.date)).size; // jours CALENDAIRES (fin de la marche de midi)
  const accumAdj = recentDays>=3?-8 : recentDays>=2?-4 : 0;
  // Tabac : la récupération est altérée
  const smokerAdj = S.smoker?-4:0;
  // Énergie ressentie (check-in de la dernière séance, si récente) : signal direct de la forme
  let energyAdj=0;
  const ls0=lastSess;
  if(ls0&&ls0.date&&ls0.checkin&&ls0.checkin.energy){
    const dd=Math.round((new Date(_auj+'T12:00:00')-new Date(ls0.date+'T12:00:00'))/864e5); // jours calendaires
    if(dd<=1) energyAdj = ls0.checkin.energy<=1?-6 : ls0.checkin.energy===2?-3 : ls0.checkin.energy>=4?4 : 0;
  }
  // État du jour ressenti (brique 3B). On SÉPARE deux natures (retour ChatGPT + Michel) :
  //  • l'ÉNERGIE du jour est un signal de readiness → elle ajuste le score, en DOUCEUR
  //    (😴 crevé = vraiment moins prêt ; ⚡ = un peu plus prêt).
  //  • une DOULEUR/GÊNE n'est PAS un manque de récup → elle ne touche PAS le chiffre.
  //    Elle devient un AVERTISSEMENT contextuel (bandeau ⚠️) : « adapter, pas interdire ».
  let dayEnergyAdj=0, dayPains=[];
  try{
    /* L'état du jour vit dans `S.dayState` pour AUJOURD'HUI et dans `S.dayStateLog` pour les
       jours passés (ft-v549). Rejouer une date ancienne doit lire le journal, sinon le
       ressenti d'aujourd'hui teinterait toute la courbe. */
    const ds=(refTs==null||_auj===today())
      ? S.dayState
      : (S.dayStateLog||[]).find(e=>e&&e.date===_auj);
    const tday=_auj;
    if(ds&&(!tday||ds.date===tday)){
      if(ds.energy!=null) dayEnergyAdj = ds.energy===0?-10 : ds.energy===1?-4 : ds.energy===3?4 : 0; // 😴 −10 · 😐 −4 · 🙂 0 · ⚡ +4
      const _ZL={epaule:'épaule',trapeze:'trapèze',cervicales:'nuque',pectoraux:'pectoraux',dorsaux:'dorsaux',biceps:'biceps',triceps:'triceps',avantbras:'avant-bras',coude:'coude',poignet:'poignet',lombaires:'bas du dos',abdos:'abdos',hanche:'hanche',fessier:'fessier',cuisse:'cuisse',ischio:'ischio',adducteur:'adducteur',genou:'genou',mollet:'mollet',cheville:'cheville'};
      const _SW=s=>s==='L'?' (côté gauche)':s==='R'?' (côté droit)':'';
      (ds.pains||[]).forEach(p=>{if(p&&p.zone)dayPains.push((_ZL[p.zone]||p.zone)+_SW(p.side));});
    }
  }catch(e){}
  const base=Math.round(wScore);
  const rhrE=(typeof _rhrEcart==='function')?_rhrEcart(_now):null, rhrAdj=_rhrAjust(rhrE);
  const score=Math.max(0,Math.min(100,Math.round(wScore+sessAdj+ageAdj+cycleAdj+accumAdj+smokerAdj+energyAdj+dayEnergyAdj+rhrAdj)));
  // Détail des facteurs (pour afficher le « pourquoi » sous le score)
  // `why` = raison en clair (français simple), utilisée par l'explication « Pourquoi ce score ? ».
  /* ⭐ L'APP DIT D'OÙ VIENT LE CHIFFRE (30/08) — c'est la moitié de la décision de Michel :
     *« la montre gagne, ET l'app le dit »*. Un score qui change parce qu'une mesure a pris la
     main, sans que rien ne l'explique, se lit comme un bug. */
  const _nMes=sorted.filter(n=>n.source==='mesure').length;
  const _nEcart=sorted.find(n=>n.ecart!=null&&Math.abs(n.ecart)>=0.5);
  const factors=[{ic:'😴',label:hasSleep?('Sommeil'+(_nMes?' (mesuré)':'')):'Récup de base',val:base,base:true,
    why:!hasSleep
      ? 'Tu n\'as pas encore renseigné ton sommeil, donc on part d\'une base neutre. Renseigne-le pour un score plus juste.'
      : (_nMes
          ? ('Le point de départ : tes 3 dernières nuits. '+(_nMes>1?_nMes+' durées viennent':'Une durée vient')
             +' de ta montre (via Santé), pas de ta saisie — une mesure passe devant une estimation.'
             /* ⛔ EN FRANÇAIS, PAS EN SIGNE. « −65 min » oblige à décoder une convention (mesuré
                moins déclaré) ; « 65 min de moins que ce que tu avais noté » se lit du premier
                coup. Michel n'est pas développeur — règle d'or #10. Trouvé À LA CAPTURE : la
                chaîne était parfaitement correcte, c'est sa LECTURE qui ne l'était pas. */
             +(_nEcart?(' Cette nuit-là, tu as dormi '+Math.abs(Math.round(_nEcart.ecart*60))
               +' min '+(_nEcart.ecart<0?'de MOINS':'de PLUS')+' que ce que tu avais noté.'):''))
          : 'Le point de départ : la qualité et la durée de tes 3 dernières nuits.')}];
  if(sessAdj) factors.push({ic:sessAdj<0?'🏋️':'🛌',label:sessAdj<0?'Séance récente':'Repos',val:sessAdj,
    why:sessAdj<0?'Tu as une séance récente : tes muscles récupèrent encore. Ce malus s\'efface en continu au fil des heures (parti au bout de ~36 h).':'Des jours de repos depuis ta dernière séance : ton corps est plus frais.'});
  if(ageAdj) factors.push({ic:'🎂',label:'Âge',val:ageAdj,why:'La récupération ralentit un peu avec l\'âge.'});
  if(cycleAdj) factors.push({ic:'🌙',label:'Cycle'+(cpPhase?' ('+cpPhase+')':''),val:cycleAdj,
    why:cycleAdj<0?'Ta phase de cycle demande plus de récup en ce moment.':'Ta phase de cycle est plutôt favorable à la performance.'});
  if(accumAdj) factors.push({ic:'🔥',label:'Jours enchaînés',val:accumAdj,why:'Tu enchaînes plusieurs jours de suite : la fatigue s\'accumule.'});
  if(smokerAdj) factors.push({ic:'🚬',label:'Tabac',val:smokerAdj,why:'Le tabac freine un peu la récupération.'});
  if(energyAdj) factors.push({ic:'⚡',label:'Énergie',val:energyAdj,why:'Ton niveau d\'énergie noté au dernier check-in de séance.'});
  if(dayEnergyAdj) factors.push({ic:'🌡️',label:'Forme du jour',val:dayEnergyAdj,why:'Comment tu te sens aujourd\'hui (ton check-in du jour sur l\'Accueil).'});
  /* ⚠️ ON MONTRE LES CHIFFRES, PAS UN VERDICT. La personne doit pouvoir contredire : sa base, sa
     valeur du jour, l'écart. Sans ça, un score qui baisse sans explication fait douter du reste
     de l'app — et une FC élevée a dix causes possibles que l'app ne connaît pas. */
  if(rhrAdj) factors.push({ic:'❤️',label:'FC au repos',val:rhrAdj,
    why:(rhrAdj<0
      ? 'Ta fréquence cardiaque au repos est à '+rhrE.rhr+' bpm cette nuit, contre '+String(rhrE.base).replace('.',',')+' habituellement (ta moyenne sur '+rhrE.n+' jours). Quand elle monte, c\'est souvent que le corps n\'a pas fini de récupérer — mais ça peut aussi venir d\'un rhume, d\'un verre de trop ou d\'une chambre trop chaude. C\'est un indice, pas un diagnostic.'
      : 'Ta fréquence cardiaque au repos est à '+rhrE.rhr+' bpm cette nuit, sous ta moyenne de '+String(rhrE.base).replace('.',',')+' bpm. Bon signe : ton corps est plutôt frais.')});
  // Conseils pour remonter le score (les plus pertinents)
  const tips=[];
  if(!hasSleep) tips.push('💤 Renseigne ton sommeil pour un score personnalisé et plus précis.');
  if(hasSleep&&base<70) tips.push('Vise 7–9 h de sommeil de qualité — c\'est le plus gros levier.');
  if(sessAdj<=-18) tips.push('Grosse séance récente : laisse 1–2 jours avant de reprendre lourd.');
  if(accumAdj<0) tips.push('Tu enchaînes les jours — un jour de repos complet te ferait du bien.');
  if(cycleAdj<=-10) tips.push('Pendant les règles : repos actif ou séances légères, évite les charges max.');
  else if(cycleAdj<0) tips.push('Phase prémenstruelle : volume modéré et bonne récup entre les séances.');
  if(smokerAdj<0) tips.push('Réduire le tabac améliorerait nettement ta récupération.');
  if(energyAdj<0) tips.push('Énergie basse au dernier check-in — écoute ton corps, séance légère.');
  if(dayEnergyAdj<0) tips.push('Journée sans énergie — une séance plus courte reste bénéfique.');
  if(rhrAdj<=-5) tips.push('Ta FC au repos est nettement au-dessus de ta normale — séance allégée, et regarde comment tu te sens.');
  if(!tips.length) tips.push(score>=80?'Tu es au top — profites-en pour une séance intensive ! 💪':'Récup correcte — séance normale, et une bonne nuit ce soir.');
  /* 🔋 « OÙ ON ARRIVE À 100 » (21/08/2026) — Michel : « on a le score de récupération mais il
     faudrait rajouter la donnée où on arrive à 100 (bon sauf moi qui suis fumeur) ».
     ⭐ LE SCORE DONNE UN NOMBRE, IL NE DIT PAS CE QUI COÛTE LES POINTS MANQUANTS — or c'est la
     seule chose sur laquelle on peut agir. *Un 72 sans explication est un jugement ; « 72, il te
     manque surtout du sommeil » est un levier.* C'est « informer sans décider » (R29/R24) : on
     AFFICHE les éléments, la personne tranche.
     ⭐⭐ ET SA PARENTHÈSE EST LE POINT PRINCIPAL, PAS UNE BLAGUE — elle est même CALCULABLE.
     Deux facteurs sont PERMANENTS et toujours négatifs : l'âge et le tabac. Pour quelqu'un de
     48 ans qui fume, le maximum atteignable n'est pas 100, c'est **93** — et jusqu'ici rien ne
     le disait. *Un plafond invisible transforme un outil de progrès en reproche quotidien* :
     on vise chaque jour un 100 qui n'existe pas, et on ne comprend pas pourquoi on n'y arrive
     jamais. C'est exactement ce que la Constitution interdit (P21 : le suivi ne doit pas coûter
     plus de stress qu'il n'apporte).
     ⛔⛔ ON NE RE-BARÈME PAS LE SCORE POUR AUTANT. Ramener le score « sur 93 » réécrirait
     silencieusement TOUT l'historique : un 85 d'il y a trois mois ne voudrait plus dire la même
     chose, et les courbes deviendraient fausses sans que rien ne le signale. On garde l'échelle
     absolue et on AJOUTE le plafond — la personne sait alors ce que 100 veut dire POUR ELLE.
     ⛔ ET AUCUN CONSEIL D'ARRÊTER DE FUMER ICI. On nomme le fait, sans le commenter et sans le
     répéter : ce n'est ni le rôle de l'app ni celui de Milo (Constitution P13, accompagnement
     jamais thérapie). Le facteur est déjà listé plus haut avec sa raison, ça suffit. */
  const permanents=factors.filter(f=>!f.base&&f.val<0&&(f.label==='Âge'||f.label==='Tabac'));
  /* ⚠️⚠️ CORRECTION DU 21/08, LE LENDEMAIN DE ft-v952 : ce plafond N'EST PAS le maximum absolu,
     et l'annoncer comme tel était FAUX. Le bonus de REPOS (`sessAdj` positif : +6 à +12 après
     2 à 4 jours sans séance) peut compenser les permanents — 100 de sommeil + 12 de repos − 3
     d'âge − 4 de tabac = 105, ramené à 100. **Donc 100 EST atteignable, mais seulement en ne
     s'entraînant pas pendant 4 jours.** C'est pour ça qu'on nomme ce chiffre `plafond` « en
     t'entraînant régulièrement » et qu'on affiche l'autre à côté quand ils diffèrent : *un
     plafond annoncé trop bas est aussi trompeur qu'un plafond invisible — il ferait renoncer à
     un chiffre réellement atteignable.* */
  const plafond=Math.max(0,Math.min(100,100+permanents.reduce((a,f)=>a+f.val,0)));
  const BONUS_REPOS_MAX=12;   // 4 jours sans séance — voir `sessAdj` plus haut
  const plafondAbsolu=Math.max(0,Math.min(100,100+permanents.reduce((a,f)=>a+f.val,0)+BONUS_REPOS_MAX));
  /* Ce qui coûte les points manquants AUJOURD'HUI — donc hors permanents (eux ne se rattrapent
     pas : ils fixent le plafond, ils ne sont pas un « manque »). Le sommeil compte pour ce qui
     lui manque jusqu'à 100, puisque c'est LUI la base. */
  const manque=[];
  if(base<100) manque.push({ic:'😴',label:hasSleep?'Sommeil':'Sommeil non renseigné',cout:100-base});
  factors.forEach(f=>{ if(!f.base&&f.val<0&&permanents.indexOf(f)<0) manque.push({ic:f.ic,label:f.label,cout:-f.val}); });
  manque.sort((a,b)=>b.cout-a.cout);
  return {score,base,factors,tips:tips.slice(0,2),dayPains,
          plafond, plafondAbsolu,
          plafondFacteurs:permanents.map(f=>({ic:f.ic,label:f.label,val:f.val})), manque};
}
/* ⏳ QUAND SERAI-JE REVENU AU MAX ? (21/08/2026) — Michel : « peut-on rajouter un indicateur où
   l'on peut retrouver 100 % de notre forme ? en plus de ce qu'il y a actuellement, parce que là
   on ne sait pas quand on aura récupéré au max ».
   ⭐ LE SCORE DIT OÙ ON EN EST, PAS QUAND ÇA SERA FINI. Or c'est la question qu'on se pose
   vraiment le lendemain d'un gros leg day — et la réponse est CALCULABLE, exactement.
   ⛔⛔ ET ON NE PROJETTE AUCUN CHIFFRE, C'EST LA DÉCISION CENTRALE. Annoncer « tu seras à 93
   jeudi » supposerait de connaître **les nuits qui n'ont pas encore eu lieu** — or le sommeil
   est la BASE du score, et c'est la part qu'on ne peut pas prévoir. Un nombre projeté serait
   une invention présentée comme un calcul (R29, et Principe 18 : ne jamais faire semblant de
   savoir). 👉 On rend donc ce qui est EXACT — le moment où la fatigue MÉCANIQUE sera partie —
   et on dit en clair ce qui, lui, dépendra de la personne.
   ⭐ DEUX SOURCES MÉCANIQUES, et on prend la PLUS TARDIVE : la fatigue de la dernière séance
   (elle s'efface en continu sur 48 h, donc l'heure est connue à la minute) et l'enchaînement de
   jours (il se vide quand la fenêtre de 3 jours glisse). Les deux se lisent dans les mêmes
   fonctions que le score — pas de deuxième barème (R2). */
function projectionRecup(d){
  try{
    d = d || calcRecoveryDetail();
    const now=Date.now();
    let finFat=null;
    const ls=S.sessions&&S.sessions[0];
    if(ls&&ls.date){
      const ts=ls.ts||ls.id;
      const pen=_penaliteSeance(ls);
      if(ts){
        /* La pénalité vaut `round(pen*(48−h)/48)` : elle tombe à zéro dès que ce produit passe
           sous 0,5, donc un peu AVANT 48 h. On rend l'instant exact plutôt que « 48 h », sinon
           on annoncerait une attente que le code n'applique pas. */
        /* ⚠️ +1 MINUTE, ET CE N'EST PAS DE LA COQUETTERIE. À l'instant EXACT `48 − 24/pen`, le
           produit vaut pile 0,5 — et `Math.round(0.5)` rend **1**, pas 0. Sans cette minute,
           on annoncerait la fin de la fatigue une minute avant qu'elle ne parte vraiment.
           *Un témoin l'a attrapé ; à la relecture, la formule semblait juste.* */
        const hFin=Math.max(0,48-24/Math.max(1,pen))+1/60;
        const t=ts+hFin*36e5;
        if(t>now) finFat=t;
      }else{
        // Séance sans heure connue : l'ancien barème par jour, la fatigue part à J+2.
        const t=new Date(ls.date+'T12:00:00').getTime()+2*864e5;
        if(t>now) finFat=t;
      }
    }
    /* L'enchaînement : `accumAdj` s'annule dès qu'il reste moins de 2 jours de séance distincts
       dans la fenêtre des 3 derniers jours. On fait GLISSER la fenêtre au lieu de refaire le
       calcul à la main — c'est la même règle, jouée en avant. */
    let finAcc=null;
    const dates=[...new Set((S.sessions||[]).filter(s=>s&&s.date).map(s=>s.date))];
    for(let d=0; d<=7; d++){
      const ref=new Date(today()+'T12:00:00').getTime()+d*864e5;
      const n=dates.filter(ds=>{
        const dd=Math.round((ref-new Date(ds+'T12:00:00').getTime())/864e5);
        return dd>=0&&dd<=2;
      }).length;
      if(n<2){ if(d>0) finAcc=ref; break; }
    }
    const quand=Math.max(finFat||0, finAcc||0)||null;
    /* Ce qui restera à la charge de la personne — nommé, jamais chiffré à l'avance. */
    const restant=[];
    if(d && d.base<100) restant.push('tes nuits');
    if(S.dayState&&S.dayState.date===today()&&S.dayState.energy!=null&&S.dayState.energy<=1) restant.push('ta forme du jour');
    return {quand:quand, dejaAuMax:!quand, source:(finFat&&(!finAcc||finFat>=finAcc))?'seance':'jours', restant};
  }catch(e){ return {quand:null, dejaAuMax:true, source:null, restant:[]}; }
}

/* ══ 📉 L'HISTORIQUE DU SCORE DE RÉCUP (ft-v1017) ═══════════════════════════════════════
   Michel : « sur accueil et récupération… j'ai l'impression qu'il n'y a pas d'historique ou
   c'est moi ? » — il avait raison : le score était calculé, affiché, puis JETÉ. Cinq
   modules le lisaient en direct, aucun ne le gardait.

   ⛔⛔ ON NE STOCKE RIEN, ON REJOUE. Le score est une fonction déterministe de données déjà
   là ; un journal de scores serait une 2ᵉ source de vérité pour un chiffre calculable (R2),
   et il ne commencerait qu'aujourd'hui. En rejouant, la courbe existe RÉTROACTIVEMENT.

   ⭐⭐ ET TOUS LES POINTS SONT PRIS À LA MÊME HEURE — c'est la décision qui rend la courbe
   honnête. Mesuré : la même journée, mêmes nuits, une séance la veille à 18 h, le score va
   de 44 à 6 h à 56 à 22 h. **12 points d'écart sans que rien du corps n'ait changé** : la
   fatigue s'efface en continu (ft-v718). Comparer un relevé du matin à un relevé du soir
   montrerait donc L'HEURE DE LA JOURNÉE, pas la récupération.
   👉 On prend l'heure QU'IL EST MAINTENANT, sur chacun des jours. La courbe répond alors à
   une question qui a un sens : « à cette heure-ci, où j'en étais ? »

   ⛔ ET AVANT LA PREMIÈRE DONNÉE, ON NE REND RIEN (`null`, pas un chiffre). Sans nuit ni
   séance, le calcul retombe sur sa base neutre de 70 et sortirait un score d'apparence
   normale pour des jours où la personne n'utilisait pas encore l'app — *une invention
   présentée comme une mesure* (R29, et Principe 18 : ne jamais faire semblant de savoir). */
function recupHistorique(nbJours){
  const n=Math.max(1,Math.min(120,nbJours||7));
  const out=[];
  try{
    const now=Date.now();
    /* Le 1ᵉʳ jour où l'app a quelque chose à dire = la plus ancienne nuit ou séance notée. */
    const dates=[]
      .concat(((S&&S.sleepLog)||[]).map(e=>e&&e.date))
      .concat(((S&&S.sessions)||[]).map(e=>e&&e.date))
      .filter(Boolean).sort();
    const debut=dates[0]||null;
    for(let i=n-1;i>=0;i--){
      const ts=now-i*864e5;               // même heure locale, i jours plus tôt
      const d=today(ts);
      out.push({date:d, score:(debut&&d>=debut)?calcRecoveryDetail(ts).score:null});
    }
  }catch(e){}
  return out;
}
/* La mini-courbe des N derniers jours — même grammaire que `_sleepSparkline` (R13) : des
   barres, la couleur du score, un trait fin quand on ne sait pas. Aucun chiffre, aucun
   jugement : elle se lit d'un coup d'œil ou pas du tout. */
function _recupSparkline(h){
  const pts=recupHistorique(7);
  const H=h||26;
  const bars=pts.map(p=>{
    if(p.score==null) return '<div style="width:6px;height:4px;border-radius:2px;background:var(--sep);"></div>';
    const ht=Math.max(5,Math.round((p.score/100)*H));
    const c=(typeof _ringScale==='function')?_ringScale(p.score):'var(--t2)';
    return '<div title="'+p.date+' · '+p.score+'/100" style="width:6px;height:'+ht+'px;border-radius:2px;background:'+c+';"></div>';
  }).join('');
  return '<div style="display:flex;align-items:flex-end;gap:4px;height:'+H+'px;">'+bars+'</div>';
}
function calcRecoveryScore(){return calcRecoveryDetail().score;}
function getRecoveryInfo(score){
  if(score===null)return{label:'—',color:'var(--t3)',icon:'❓',rec:'Enregistre ton sommeil pour obtenir ton score de récupération.'};
  if(score<40)return{label:'Fatigué',color:'var(--red)',icon:'🔴',rec:'Récupération insuffisante — séance légère ou repos complet recommandé. Priorise le sommeil ce soir.'};
  if(score<60)return{label:'Modéré',color:'var(--orange)',icon:'🟠',rec:'Récupération partielle — évite les charges maximales. Séance technique ou volume modéré.'};
  if(score<80)return{label:'Bon',color:'var(--gold)',icon:'🟡',rec:'Bonne récupération — séance normale possible. Pas le moment idéal pour des PRs.'};
  return{label:'Optimal',color:'var(--green)',icon:'🟢',rec:'Récupération excellente ! Corps prêt pour une séance intensive — idéal pour tenter des records.'};
}

function renderRecoveryCard(){
  if(window._curScreen==='home'){_renderHomeHero();return;}
  const el=document.getElementById('recovery-card');if(!el)return;
  const score=calcRecoveryScore();
  const info=getRecoveryInfo(score);
  const todayStr=today();
  const ts=S.sleepLog&&S.sleepLog.find(e=>e.date===todayStr);
  const qLabels={1:'😴 Mauvais',2:'😐 Moyen',3:'😊 Bon',4:'⚡ Excellent'};
  const scoreDisp=score!==null?score:'—';
  el.innerHTML=`
  <div style="display:flex;align-items:center;gap:14px;">
    <div style="width:56px;height:56px;border-radius:50%;border:3px solid ${info.color};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:${info.color}1a;">
      <div style="font-family:var(--font-cond);font-size:17px;font-weight:700;color:${info.color};line-height:1;">${scoreDisp}</div>
      ${score!==null?`<div style="font-size:11px;color:${info.color};font-weight:700;">/100</div>`:''}
    </div>
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:800;color:${info.color};">${info.icon} ${info.label}</div>
      <div style="font-size:13px;color:var(--t2);margin-top:3px;line-height:1.4;">${info.rec}</div>
    </div>
  </div>
  ${ts?`
  <div style="background:var(--bg3);border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:13px;color:var(--t2);">🌙 Cette nuit : <strong style="color:var(--t1);">${ts.hours}h</strong> · <strong style="color:var(--t1);">${qLabels[ts.quality||2]}</strong></div>
    <button style="font-size:13px;color:var(--t3);background:none;border:none;cursor:pointer;padding:4px 8px;touch-action:manipulation;" onclick="goScreen('log',document.getElementById('nb-log'));_sleepEditLog=true;setTimeout(renderLogSleep,80);">Modifier</button>
  </div>`:`
  <button class="btn btn-bg2" onclick="goScreen('log',document.getElementById('nb-log'))" style="margin-top:0;">😴 Enregistrer mon sommeil →</button>`}`;
  if(ts)updateSleepQualBtns();
}
function showSleepForm(){
  _sleepQual=3;
  const f=document.getElementById('sleep-form');
  if(f){f.style.display='flex';updateSleepQualBtns();}
}
function hideSleepForm(){
  const f=document.getElementById('sleep-form');if(f)f.style.display='none';
}
function editSleepToday(){
  const ts=S.sleepLog&&S.sleepLog.find(e=>e.date===today());
  if(ts){_sleepQual=ts.quality||3;const h=document.getElementById('sleep-hours');if(h)h.value=ts.hours||'';}
  else _sleepQual=3;
  const f=document.getElementById('sleep-form');if(f){f.style.display='flex';updateSleepQualBtns();}
}
function setSleepQual(q){_sleepQual=q;updateSleepQualBtns();}
function updateSleepQualBtns(){
  [1,2,3,4].forEach(q=>{const el=document.getElementById('sq-'+q);if(el)el.classList.toggle('active',q===_sleepQual);});
}
function saveSleepEntry(){
  const hEl=document.getElementById('sleep-hours');
  const hours=numFR(hEl?hEl.value:0)||0;
  if(!hours||hours<2||hours>14){toast('Heures invalides (entre 2 et 14h)','error');return;}
  if(!S.sleepLog)S.sleepLog=[];
  const dateStr=_sleepDateFor();
  const forPast=dateStr!==today();
  const idx=S.sleepLog.findIndex(e=>e.date===dateStr);
  const entry={date:dateStr,hours,quality:_sleepQual};
  if(idx>=0)S.sleepLog[idx]=entry;else S.sleepLog.unshift(entry);
  S.sleepLog=S.sleepLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4000);
  _sleepEditLog=false;_sleepEditDate=null;
  persist();
  renderLogSleep();renderRecoveryCard();
  // Le sommeil est maintenant sur l'Accueil → rafraîchir le score de récup visible juste au-dessus
  try{if(typeof _renderHomeHero==='function')_renderHomeHero();}catch(e){}
  // la carte du check-in se replie : c'était le dernier champ à remplir (retour Michel 18/08)
  try{if(typeof closeCheckin==='function')closeCheckin();}catch(e){}
  toast(forPast?'Sommeil du '+dateStr.split('-').reverse().slice(0,2).join('/')+' enregistré !':'Sommeil enregistré !','success');
}

