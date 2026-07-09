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
  const firstD=sorted.length?new Date(sorted[0].date+'T12:00:00'):new Date();
  const nowD=new Date(today()+'T12:00:00');
  const fullSpan=Math.max(1,Math.round((nowD-firstD)/86400000));
  const eff=(_wSpanDays!=null)?_wSpanDays:(fullSpan+1);
  const maxOff=Math.max(0,fullSpan-eff);
  if(_wEndOff>maxOff)_wEndOff=maxOff;
  if(_wEndOff<0)_wEndOff=0;
  const rightD=new Date(nowD);rightD.setDate(rightD.getDate()-_wEndOff);
  const leftD=new Date(rightD);leftD.setDate(leftD.getDate()-eff);
  const lStr=_isoD(leftD),rStr=_isoD(rightD);
  let pts=(_wSpanDays!=null)?sorted.filter(p=>p.date>=lStr&&p.date<=rStr):sorted.slice();
  // Sous-échantillonnage pour l'affichage si trop de points (garde toujours le dernier)
  if(pts.length>160){const k=Math.ceil(pts.length/160);pts=pts.filter((_,i)=>i%k===0||i===pts.length-1);}
  // Chips de période (préréglages)
  const rangeEl=document.getElementById('weight-range');
  if(rangeEl){
    if(sorted.length<2)rangeEl.innerHTML='';
    else rangeEl.innerHTML=[['1m','1 mois'],['3m','3 mois'],['6m','6 mois'],['all','Tout']]
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
let _wRange='all'; // préréglage actif : '1m' | '3m' | '6m' | 'all' | '' (zoom/pan custom)
let _wSpanDays=null; // largeur de la fenêtre en jours (null = tout l'historique)
let _wEndOff=0;      // décalage du bord droit de la fenêtre (jours) vs aujourd'hui
function setWeightRange(r){_wRange=r;_wSpanDays={'1m':30,'3m':90,'6m':180,'all':null}[r];_wEndOff=0;renderWeightTab();}
function _fmtWNav(d){const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'2-digit'});}
function _wFullSpan(){const s=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];if(!s.length)return 1;const f=new Date(s[0].date+'T12:00:00'),n=new Date(today()+'T12:00:00');return Math.max(1,Math.round((n-f)/86400000));}
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
  const eff=_wSpanDays;
  const step=Math.max(1,Math.round(eff*0.5));
  _wEndOff=Math.max(0,_wEndOff+(dir<0?step:-step)); // ◀ = reculer (offset↑) · ▶ = avancer (offset↓)
  _wRange='';
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
function renderBodyScanCard(){
  const el=document.getElementById('bodyscan-section');if(!el)return;
  // Import CSV de balance (historique complet) — réservé aux testeurs
  const csvBtn=_isScaleCsvBeta()?`<button class="btn btn-bg2" style="width:100%;margin-top:8px;font-size:13px;" onclick="openScaleCsvImport()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg> Importer un fichier balance (CSV ou Excel)</button>`:'';
  const scaleSel=_scaleTypeSelector();
  const scans=(S.bodyScans||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  if(!scans.length){
    el.innerHTML=`<div class="card cp" style="text-align:center;">
      <div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:10px;">Tu passes sur une balance pro (impédancemètre) ? Enregistre ton bilan — graisse viscérale, muscle, métabolisme… — pour suivre son évolution dans le temps et que Milo s'en serve.</div>
      <div style="text-align:left;">${scaleSel}</div>
      <button class="btn btn-red" style="width:100%;" onclick="importBodyScanPhoto()">📷 Importer depuis une photo</button>
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
    html+=`<div style="display:flex;flex-direction:column;gap:6px;">`;
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
  html+=scaleSel;
  html+=`<button class="btn btn-red" style="width:100%;" onclick="importBodyScanPhoto()">📷 Nouveau bilan (photo)</button>
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
    showConfirm('Importer '+days+' pesées ?', rows.length+' mesures lues ('+dates[0]+' → '+dates[dates.length-1]+'). On garde une pesée par jour, tout l\'historique. Les dates déjà présentes sont mises à jour, rien n\'est effacé.', doImport);
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
        const TW=1000;                 // largeur cible (nette après downscale API)
        const scale=Math.min(1,TW/img.width);
        const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
        // Canvas complet redimensionné
        const full=document.createElement('canvas');full.width=w;full.height=h;
        full.getContext('2d').drawImage(img,0,0,w,h);
        const TILE=1300, OVER=70;       // hauteur max par tuile + recouvrement
        const tiles=[];
        if(h<=TILE){
          tiles.push(full.toDataURL('image/jpeg',0.85).split(',')[1]);
        }else{
          let y=0;
          while(y<h){
            const th=Math.min(TILE,h-y);
            const t=document.createElement('canvas');t.width=w;t.height=th;
            t.getContext('2d').drawImage(full,0,y,w,th,0,0,w,th);
            tiles.push(t.toDataURL('image/jpeg',0.85).split(',')[1]);
            if(y+th>=h)break;
            y+=TILE-OVER;
          }
        }
        // Image entière de secours (pour un backend pas encore à jour : lit comme avant, pas pire)
        let whole;
        {const m=1500;let ww=w,hh=h;if(ww>=hh){if(ww>m){hh=Math.round(hh*m/ww);ww=m;}}else{if(hh>m){ww=Math.round(ww*m/hh);hh=m;}}
          const fc=document.createElement('canvas');fc.width=ww;fc.height=hh;fc.getContext('2d').drawImage(img,0,0,ww,hh);
          whole=fc.toDataURL('image/jpeg',0.85).split(',')[1];}
        cb({tiles:tiles, full:whole});
      }catch(err){if(typeof toast==='function')toast('Image trop grande','error');}
    };
    img.onerror=()=>{if(typeof toast==='function')toast('Image illisible','error');};
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function importBodyScanPhoto(){const inp=document.getElementById('bs-photo-input');if(inp){inp.value='';inp.click();}}
const BODYSCAN_FREE_LIMIT=10; // lectures photo gratuites pour les non super-testeurs (saisie main/code toujours illimitée)
function _bodyScanPhotoUnlimited(){return (typeof _isSuperTester==='function'&&_isSuperTester());}
function onBodyScanPhoto(input){
  const file=input.files&&input.files[0];if(!file)return;input.value='';
  if(!S.url){toast('Coach non configuré (Profil > Admin)','error');return;}
  // Lecture photo : illimitée pour super-testeurs (Michel/Christophe), 1 seule fois pour les autres. Saisie main/code = gratuite.
  const unlimited=_bodyScanPhotoUnlimited();
  if(!unlimited&&(S.bodyScanImports||0)>=BODYSCAN_FREE_LIMIT){
    toast('Lecture photo : tes '+BODYSCAN_FREE_LIMIT+' lectures gratuites sont utilisées 🙂 Continue à la main ou par code (gratuit).','info');
    return;
  }
  _resizeReport(file,async(out)=>{
    try{
      const tiles=(out&&out.tiles)?out.tiles:(Array.isArray(out)?out:[out]);
      const full=(out&&out.full)?out.full:tiles[0];
      _showBsScan('data:image/jpeg;base64,'+full); // retour visuel : scan du rapport pendant la lecture IA
      const images=tiles.map(t=>({data:t,type:'image/jpeg'}));
      const resp=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'importBodyScan',images,image:full,imageType:'image/jpeg',email:S.email||''})});
      const txt=await resp.text();let data;try{data=JSON.parse(txt);}catch(e){throw new Error('réponse illisible');}
      if(data.status!=='ok'||!data.data)throw new Error(data.error||'lecture impossible');
      const o=data.data;
      if(!unlimited){S.bodyScanImports=(S.bodyScanImports||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();}
      _hideBsScan(()=>{
        openBodyScanForm(-1);
        if(o.date){const dEl=document.getElementById('bs-date');if(dEl)dEl.value=o.date;}
        _BS_FIELDS.forEach(f=>{const el=document.getElementById('bs-'+f.k);if(el&&o[f.k]!=null&&o[f.k]!=='')el.value=o[f.k];});
        _BS_SEG_FIELDS.forEach(f=>{const el=document.getElementById('bs-'+f.k);if(el&&o[f.k]!=null&&o[f.k]!=='')el.value=o[f.k];});
        toast('Rapport lu ✅ Vérifie puis Enregistre','success');
      });
    }catch(e){_hideBsScan(()=>toast('Souci lecture : '+(e.message||'réessaie'),'error'));}
  });
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
function openBodyScanForm(idx){
  _bsEditIdx=idx;
  const grid=document.getElementById('bs-grid');
  const dateEl=document.getElementById('bs-date');
  const delBtn=document.getElementById('bs-del-btn');
  const sc=(idx>=0&&S.bodyScans&&S.bodyScans[idx])?S.bodyScans[idx]:null;
  if(dateEl)dateEl.value=sc?sc.date:new Date().toISOString().slice(0,10);
  const inpHtml=f=>`<div>
    <label style="font-size:11px;color:var(--t3);display:block;margin-bottom:3px;">${f.l}${f.u?' ('+f.u+')':''}${f.req?' *':''}</label>
    <input type="number" id="bs-${f.k}" step="0.1" inputmode="decimal" value="${sc&&sc[f.k]!=null?sc[f.k]:''}" placeholder="—" style="width:100%;padding:9px 10px;border-radius:9px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:16px;font-family:var(--font);box-sizing:border-box;">
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
  const wEl=document.getElementById('bs-weight');const weight=wEl?parseFloat(wEl.value):NaN;
  if(!weight||weight<=0){toast('Le poids est obligatoire','error');return;}
  const obj={date};
  _BS_FIELDS.concat(_BS_SEG_FIELDS).forEach(f=>{const e=document.getElementById('bs-'+f.k);if(!e)return;const v=parseFloat(e.value);if(!isNaN(v))obj[f.k]=v;});
  if((obj.imc==null||isNaN(obj.imc))&&S.height){obj.imc=+(weight/Math.pow(S.height/100,2)).toFixed(1);}
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
  S.weightLog=S.weightLog.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,365);
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
  const e=(S.email||'').trim().toLowerCase();
  return e==='michdu75@gmail.com' || e==='christophe@famillelanglois.fr';
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
function openBloodImport(){const inp=document.getElementById('blood-file-input');if(inp){inp.value='';inp.click();}}
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
  const imgs=[];
  for(let i=0;i<_bloodPages.length;i++){ imgs.push({data:await _bloodApplyRedact(i),type:'image/jpeg'}); }
  closeBloodRedact();
  _showBsScan('data:image/jpeg;base64,'+imgs[0].data,'🩸 Analyse du bilan sanguin…','Lecture des marqueurs','Extraction des valeurs…');
  try{
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
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
function openBloodTest(idx){
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

function calcRecoveryDetail(){
  // Sommeil non renseigné → base neutre « invisible » (70) : le score reste
  // fonctionnel pour tout le monde, les autres facteurs (séance, âge, cycle…)
  // s'appliquent quand même, et un conseil discret invite à renseigner le sommeil.
  const hasSleep = !!(S.sleepLog && S.sleepLog.length);
  let wScore;
  if(hasSleep){
    const sorted=S.sleepLog.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    const scores=sorted.map(e=>{
      const h=e.hours||0;
      const hScore=h<4?5:h<6?35:h<7?60:h<=9?100:85;
      const qScore=((e.quality||2)/4)*100;
      return Math.round(hScore*0.6+qScore*0.4);
    });
    const weights=[0.6,0.3,0.1].slice(0,scores.length);
    const wTotal=weights.reduce((a,b)=>a+b,0);
    wScore=scores.reduce((a,s,i)=>a+s*weights[i],0)/wTotal;
  } else {
    wScore=70; // base neutre par défaut (sommeil inconnu)
  }
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
      let pen = Math.max(6,Math.min(30,Math.round(load*1.7))); // ~ -10 (abdos) à -30 (grosse séance), min -6
      // La fatigue s'efface au fil des heures APRÈS la séance : le score remonte
      // progressivement dans la journée (jusqu'à ~-50% de la pénalité ~14 h après).
      const tsSess = lastSess.ts || lastSess.id;
      if(tsSess){
        const hrs = Math.max(0,(Date.now()-tsSess)/36e5);
        pen = Math.max(4, Math.round(pen * (1 - Math.min(0.5, hrs/14*0.5))));
      }
      sessAdj = -pen;
    } else if(d===1){ sessAdj=-8; }
    else { sessAdj=Math.min(d,4)*3; }                          // 2j +6 · 3j +9 · 4j+ +12
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
    const cp=(typeof getMensCyclePhase==='function')?getMensCyclePhase():null;
    if(cp&&cp.perf){ cycleAdj = cp.perf==='low'?-10 : cp.perf==='declining'?-5 : cp.perf==='peak'?4 : cp.perf==='rising'?2 : 0; cpPhase=cp.phase||''; }
  }catch(e){}
  // Fatigue accumulée : plusieurs séances sur les 3 derniers jours (enchaîner sans repos)
  const recentDays=new Set((S.sessions||[]).filter(s=>s&&s.date&&(()=>{const dd=Math.floor((new Date()-new Date(s.date+'T12:00:00'))/864e5);return dd>=0&&dd<=2;})()).map(s=>s.date)).size;
  const accumAdj = recentDays>=3?-8 : recentDays>=2?-4 : 0;
  // Tabac : la récupération est altérée
  const smokerAdj = S.smoker?-4:0;
  // Énergie ressentie (check-in de la dernière séance, si récente) : signal direct de la forme
  let energyAdj=0;
  const ls0=S.sessions&&S.sessions[0];
  if(ls0&&ls0.date&&ls0.checkin&&ls0.checkin.energy){
    const dd=Math.floor((new Date()-new Date(ls0.date+'T12:00:00'))/864e5);
    if(dd<=1) energyAdj = ls0.checkin.energy<=1?-6 : ls0.checkin.energy===2?-3 : ls0.checkin.energy>=4?4 : 0;
  }
  const base=Math.round(wScore);
  const score=Math.max(0,Math.min(100,Math.round(wScore+sessAdj+ageAdj+cycleAdj+accumAdj+smokerAdj+energyAdj)));
  // Détail des facteurs (pour afficher le « pourquoi » sous le score)
  const factors=[{ic:'😴',label:hasSleep?'Sommeil':'Récup de base',val:base,base:true}];
  if(sessAdj) factors.push({ic:sessAdj<0?'🏋️':'🛌',label:sessAdj<0?'Séance récente':'Repos',val:sessAdj});
  if(ageAdj) factors.push({ic:'🎂',label:'Âge',val:ageAdj});
  if(cycleAdj) factors.push({ic:'🌙',label:'Cycle'+(cpPhase?' ('+cpPhase+')':''),val:cycleAdj});
  if(accumAdj) factors.push({ic:'🔥',label:'Jours enchaînés',val:accumAdj});
  if(smokerAdj) factors.push({ic:'🚬',label:'Tabac',val:smokerAdj});
  if(energyAdj) factors.push({ic:'⚡',label:'Énergie',val:energyAdj});
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
  if(!tips.length) tips.push(score>=80?'Tu es au top — profites-en pour une séance intensive ! 💪':'Récup correcte — séance normale, et une bonne nuit ce soir.');
  return {score,base,factors,tips:tips.slice(0,2)};
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

