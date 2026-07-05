// ─── NORMALISATION AVANT SYNC ────────────────────────────────
// Construit les rows pour handleLogSession_ en assurant que chaque champ
// est du bon type et a une valeur par défaut valide.
// Appliqué à TOUTE séance, quelle qu'en soit l'origine (saisie normale,
// brouillon récupéré, import, ancienne version de l'app).
function _buildSyncRows(sess){
  const today_=new Date().toISOString().split('T')[0];
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

// ─── GOOGLE SHEETS SYNC ──────────────────────────────────────
async function syncSheets(sess){
  if(window._demoMode)return{ok:true}; // mode démo : rien n'est envoyé aux Sheets
  if(!S.url)return{ok:false,error:'URL manquante'};
  try{
    const rows=_buildSyncRows(sess);
    const ctrl=new AbortController();
    const tId=setTimeout(()=>ctrl.abort(),8000);
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',signal:ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'logSession',rows,bw:S.bw,date:sess.date,gender:S.gender,age:S.age})});
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
    try{localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,200)));}catch(e){}
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
      <input type="number" id="rm-inp-${ex.replace(/ /g,'_')}" value="${rm}" placeholder="${ph}" inputmode="decimal" step="0.5" style="width:90px;text-align:center;padding:8px;" oninput="renderCycleProjections()">
      <span style="font-size:12px;color:var(--t3);">kg</span>
    </div>`;
  }).join('');
  updCycleWeeks(parseInt(document.getElementById('cycle-weeks-slider')?.value || 12));
}

function getCycleInputRM(ex) {
  const el = document.getElementById('rm-inp-' + ex.replace(/ /g,'_'));
  if (!el) return 0;
  return parseFloat(el.value) || parseFloat(el.placeholder) || 0;
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
  const hours=(S.sleepLog.find(e=>e.date===d)||{}).hours||7.5;
  const entry={date:d,hours,quality:q};
  if(idx>=0)S.sleepLog[idx]=entry;else S.sleepLog.unshift(entry);
  S.sleepLog=S.sleepLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
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
  const kg=parseFloat(inp?inp.value:0);
  if(!kg||kg<20||kg>300){toast('Poids invalide (20–300 kg)','error');return;}
  if(!S.weightLog)S.weightLog=[];
  const d=today();const idx=S.weightLog.findIndex(w=>w.date===d);
  if(idx>=0)S.weightLog[idx].kg=kg;else S.weightLog.unshift({date:d,kg});
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,365);
  S.bw=kg;persist();
  renderWeightTab();renderHome();
  toast('Poids enregistré !','success');
}
function renderWeightTab(){
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
      <input type="number" id="wentry-inp" value="${prefill}" placeholder="${S.bw||80}" step="0.1" min="20" max="300" inputmode="decimal" enterkeyhint="done" onkeydown="if(event.key==='Enter'){event.preventDefault();saveWeightEntry();}" style="width:76px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">
      <button class="btn-xs btn-red" onclick="saveWeightEntry()" style="background:linear-gradient(135deg,#FF2D55,#FF4D6D);color:#fff;border:none;padding:10px 14px;font-size:16px;">✓</button>
    </div>
  </div>`;
  renderWeightTarget();
  renderBodyFatCard();
  const sorted=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];
  // Bascule Poids ↔ Masse grasse
  const metricEl=document.getElementById('weight-metric');
  if(metricEl){
    if(sorted.length<2)metricEl.innerHTML='';
    else metricEl.innerHTML=[['kg','Poids'],['bf','Masse grasse'],['both','Les 2']]
      .map(function(m){return '<button class="wmetric-chip'+(_wMetric===m[0]?' active':'')+'" onclick="setWeightMetric(\''+m[0]+'\')">'+m[1]+'</button>';}).join('');
  }
  // Chips de navigation par période (1 mois / 3 mois / 6 mois / Tout)
  const rangeEl=document.getElementById('weight-range');
  if(rangeEl){
    if(sorted.length<2)rangeEl.innerHTML='';
    else rangeEl.innerHTML=[['1m','1 mois'],['3m','3 mois'],['6m','6 mois'],['all','Tout']]
      .map(function(r){return '<button class="wrange-chip'+(_wRange===r[0]?' active':'')+'" onclick="setWeightRange(\''+r[0]+'\')">'+r[1]+'</button>';}).join('');
  }
  // Filtre selon la période choisie
  let pts=sorted;
  const days={'1m':30,'3m':90,'6m':180}[_wRange];
  if(days){const cut=new Date(today()+'T12:00:00');cut.setDate(cut.getDate()-days);const c=cut.toISOString().split('T')[0];pts=sorted.filter(p=>p.date>=c);}
  pts=pts.slice(-120);
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
let _wRange='all'; // période affichée : '1m' | '3m' | '6m' | 'all'
function setWeightRange(r){_wRange=r;renderWeightTab();}
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
       +'<input type="number" id="target-inp" value="'+(tw||'')+'" placeholder="kg" step="0.1" min="20" max="300" inputmode="decimal" style="width:70px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">'
       +'<button class="btn-xs btn-red" onclick="setTargetWeight()" style="background:linear-gradient(135deg,#FF2D55,#FF4D6D);color:#fff;border:none;padding:10px 14px;font-size:16px;">✓</button>'
     +'</div>'
    +'</div>';
}
function setTargetWeight(){
  const v=parseFloat((document.getElementById('target-inp')||{}).value);
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
    +'<input type="number" id="'+id+'" value="'+(val||'')+'" placeholder="cm" step="0.5" inputmode="decimal" oninput="_recalcNavyBf()" style="width:100%;padding:8px 6px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:15px;font-family:var(--font);text-align:center;box-sizing:border-box;"></div>';
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
       +'<input type="number" id="bf-inp" value="'+prefill+'" placeholder="%" step="0.1" min="2" max="70" inputmode="decimal" style="width:70px;padding:9px 10px;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);text-align:center;">'
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
  const nk=parseFloat((document.getElementById('bf-neck')||{}).value),wa=parseFloat((document.getElementById('bf-waist')||{}).value),hp=parseFloat((document.getElementById('bf-hip')||{}).value);
  let bf=parseFloat((document.getElementById('bf-inp')||{}).value);
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
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,365);
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
}
function closeWeighEdit(){const ov=document.getElementById('ov-weigh-edit');if(ov)ov.classList.remove('open');_weighEditDate=null;}
function saveWeighEdit(){
  const kg=parseFloat((document.getElementById('weigh-edit-kg')||{}).value);
  const newDate=(document.getElementById('weigh-edit-date')||{}).value;
  if(!kg||kg<20||kg>300){toast('Poids invalide (20–300 kg)','error');return;}
  if(!newDate){toast('Date invalide','error');return;}
  if(newDate>today()){toast('Date dans le futur','error');return;}
  const bfv=parseFloat((document.getElementById('weigh-edit-bf')||{}).value);
  const entry={date:newDate,kg:kg};
  if(bfv>=2&&bfv<=70)entry.bf=bfv;
  // retire l'ancienne entrée + toute entrée sur la nouvelle date, puis ré-insère
  S.weightLog=(S.weightLog||[]).filter(x=>x.date!==_weighEditDate&&x.date!==newDate);
  S.weightLog.unshift(entry);
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,365);
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
function renderWeightCorrelations(el,pts){
  if(!pts||pts.length<3){el.innerHTML='';return;}
  const cards=[];
  const vals=pts.map(p=>p.kg);
  const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
  // 1. Trend card
  const reg=linearRegression(pts.map((p,i)=>({x:i,y:p.kg})));
  const weeklyChange=Math.round(reg.slope*7*100)/100;
  const goal=S.goal||'muscle';
  const goalDir={muscle:'légèrement positive (+0.1–0.3 kg/sem)',perte:'négative (−0.3–0.7 kg/sem)',force:'légèrement positive',equilibre:'stable (±0.1 kg/sem)',endurance:'stable ou légèrement positive'};
  const trendColor=goal==='perte'&&weeklyChange<0?'var(--green)':goal==='muscle'&&weeklyChange>0?'var(--green)':Math.abs(weeklyChange)>0.8?'var(--orange)':'var(--t2)';
  cards.push({icon:'📈',title:`${weeklyChange>=0?'+':''}${weeklyChange} kg / semaine`,text:`Tendance sur ${pts.length} mesures. Pour ton objectif "${GOAL_LABELS[goal]}", l'évolution attendue est ${goalDir[goal]||'variable'}.`,color:trendColor});
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

function renderLogSleep(){
  const el=document.getElementById('log-sleep');if(!el)return;
  const todayStr=today();
  const ts=S.sleepLog&&S.sleepLog.find(e=>e.date===todayStr);
  const qLabels={1:'Mauvais',2:'Moyen',3:'Bon',4:'Excellent'};
  const moonSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="color:var(--purp);flex-shrink:0;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  if(ts&&!_sleepEditLog){
    el.innerHTML='<div style="background:var(--bg2);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);">'
      +'<div style="display:flex;align-items:center;gap:13px;">'
      +'<div class="home-row-ic" style="background:rgba(168,85,247,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purp)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div>'
      +'<div><div class="home-row-ttl">'+ts.hours+'h · '+qLabels[ts.quality||2]+'</div>'
      +'<div class="home-row-sub">Sommeil de cette nuit</div></div>'
      +'</div>'
      +'<button style="font-size:12px;font-weight:600;color:var(--t3);background:none;border:none;cursor:pointer;padding:4px 8px;touch-action:manipulation;" onclick="_sleepEditLog=true;renderLogSleep()">Modifier</button>'
      +'</div>';
  }else{
    _sleepQual=(ts&&ts.quality)||3;
    const bars=function(n){
      const h=[6,9,12,15];
      return '<div class="slq-bars">'+h.map(function(height,i){return'<div class="slq-bar'+(i>=n?' slq-bar-off':'')+'" style="height:'+height+'px;"></div>';}).join('')+'</div>';
    };
    el.innerHTML='<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);padding:16px;">'
      +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:12px;">'+moonSvg
      +'<span style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);">Sommeil de cette nuit</span></div>'
      +'<div style="display:flex;gap:6px;margin-bottom:12px;">'
      +'<button class="slq-btn" id="sq-1" onclick="setSleepQual(1)">'+bars(1)+'Mauvais</button>'
      +'<button class="slq-btn" id="sq-2" onclick="setSleepQual(2)">'+bars(2)+'Moyen</button>'
      +'<button class="slq-btn" id="sq-3" onclick="setSleepQual(3)">'+bars(3)+'Bon</button>'
      +'<button class="slq-btn" id="sq-4" onclick="setSleepQual(4)">'+bars(4)+'Excellent</button>'
      +'</div>'
      +'<div style="display:flex;gap:8px;align-items:center;">'
      +'<input type="number" id="sleep-hours" placeholder="7.5" step="0.5" min="2" max="14" inputmode="decimal" enterkeyhint="done" onkeydown="if(event.key===\'Enter\'){event.preventDefault();saveSleepEntry();}" style="flex:1;padding:11px 12px;border-radius:10px;border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);background:var(--bg3);color:var(--t1);font-family:var(--font);font-size:16px;" value="'+(ts?ts.hours:'')+'">'
      +'<span style="font-size:13px;color:var(--t2);white-space:nowrap;">h de sommeil</span>'
      +(ts?'<button class="btn btn-bg2 btn-sm" onclick="_sleepEditLog=false;renderLogSleep()" style="flex-shrink:0;font-size:12px;padding:8px 12px;">Annuler</button>':'')
      +'</div>'
      +'<button class="btn btn-red ft-press" onclick="saveSleepEntry()" style="margin-top:10px;padding:14px;">Enregistrer</button>'
      +'</div>';
    updateSleepQualBtns();
  }
}

function renderLogFinish(){
  const el=document.getElementById('log-finish');if(!el)return;
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){el.innerHTML='';return;}
  const hasDone=S.wkt.exs.some(ex=>ex.sets.some(s=>s.done));
  if(!hasDone){el.innerHTML='';return;}
  const nEx=S.wkt.exs.filter(ex=>ex.sets.some(s=>s.done)).length;
  const nSets=S.wkt.exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const vol=Math.round(S.wkt.exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done&&s.type!=='É'&&s.type!=='W').reduce((b,s)=>b+(s.kg||0)*(s.reps||0),0),0));
  el.innerHTML=`<div style="border-top:1px solid var(--sep);padding-top:14px;margin-top:4px;">
    <div style="text-align:center;font-size:13px;color:var(--t2);margin-bottom:10px;font-weight:600;">${nEx} exercice${nEx>1?'s':''} · ${nSets} série${nSets>1?'s':''} · ${vol} kg de volume</div>
    <button class="btn btn-red" onclick="finishWorkout()" style="font-size:17px;padding:16px;letter-spacing:.3px;">🏁 Terminer la séance</button>
  </div>`;
}

function calcRecoveryScore(){
  if(!S.sleepLog||!S.sleepLog.length)return null;
  const sorted=S.sleepLog.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  const scores=sorted.map(e=>{
    const h=e.hours||0;
    const hScore=h<4?5:h<6?35:h<7?60:h<=9?100:85;
    const qScore=((e.quality||2)/4)*100;
    return Math.round(hScore*0.6+qScore*0.4);
  });
  const weights=[0.6,0.3,0.1].slice(0,scores.length);
  const wTotal=weights.reduce((a,b)=>a+b,0);
  const wScore=scores.reduce((a,s,i)=>a+s*weights[i],0)/wTotal;
  // Ajustement selon la dernière séance : entraîné récemment → fatigue, jours de repos → bonus.
  // La pénalité du jour même est PROPORTIONNELLE au volume de la séance (nb de séries de travail),
  // pondérée par l'intensité (échec ×1.5, drop ×1.3) → juste des abdos pénalise peu, un gros leg day pénalise beaucoup.
  const lastSess=S.sessions&&S.sessions[0];
  let sessAdj=0;
  if(lastSess&&lastSess.date){
    const d=Math.floor((new Date()-new Date(lastSess.date+'T12:00:00'))/864e5);
    if(d<=0){
      let load=0;
      (lastSess.exs||lastSess.exercises||[]).forEach(ex=>(ex.sets||[]).forEach(s=>{
        if(!s.done||s.type==='W'||s.type==='É')return;      // exclut échauffement
        load += s.type==='E'?1.5:s.type==='D'?1.3:1;         // échec/drop = plus fatigant
      }));
      sessAdj = -Math.max(6,Math.min(30,Math.round(load*1.7))); // ~ -10 (abdos) à -30 (grosse séance), min -6
    } else if(d===1){ sessAdj=-8; }
    else { sessAdj=Math.min(d,4)*3; }                          // 2j +6 · 3j +9 · 4j+ +12
  }
  return Math.max(0,Math.min(100,Math.round(wScore+sessAdj)));
}
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
      <div style="font-family:var(--font-cond);font-size:17px;font-weight:900;color:${info.color};line-height:1;">${scoreDisp}</div>
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
  const hours=parseFloat(hEl?hEl.value:0)||0;
  if(!hours||hours<2||hours>14){toast('Heures invalides (entre 2 et 14h)','error');return;}
  if(!S.sleepLog)S.sleepLog=[];
  const todayStr=today();
  const idx=S.sleepLog.findIndex(e=>e.date===todayStr);
  const entry={date:todayStr,hours,quality:_sleepQual};
  if(idx>=0)S.sleepLog[idx]=entry;else S.sleepLog.unshift(entry);
  S.sleepLog=S.sleepLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
  _sleepEditLog=false;
  persist();
  renderLogSleep();renderRecoveryCard();
  toast('Sommeil enregistré !','success');
}

