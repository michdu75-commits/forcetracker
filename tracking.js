// ─── GOOGLE SHEETS SYNC ──────────────────────────────────────
async function syncSheets(sess){
  if(!S.url)return false;
  try{
    const rows=[];
    (sess.exs||[]).forEach(ex=>ex.sets.forEach((s,i)=>{
      if(!s.done)return;
      rows.push({date:sess.date,exercise:ex.name,set_num:i+1,type:s.type||'N',kg:s.kg,reps:s.reps,volume:(s.kg||0)*(s.reps||0),rm1:s.rm1?fmt(s.rm1):'',bw:S.bw,gender:S.gender,age:S.age});
    }));
    await fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'logSession',rows,bw:S.bw,date:sess.date,gender:S.gender,age:S.age})});
    return true;
  }catch(e){return false;}
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
  const sorted=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];
  const pts=sorted.slice(-60);
  if(pts.length<2){
    if(chartEl)chartEl.innerHTML='<div class="empty" style="padding:20px 0;">Ajoute au moins 2 pesées pour voir le graphique 📊</div>';
    if(corrEl)corrEl.innerHTML='';
    return;
  }
  if(chartEl)renderWeightChart(pts,chartEl);
  if(corrEl)renderWeightCorrelations(corrEl,pts);
}
function renderWeightChart(pts,box){
  const W=340,H=160,pad={t:18,r:14,b:32,l:44},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const vals=pts.map(p=>p.kg);
  const span=Math.max(...vals)-Math.min(...vals)||1;
  const minY=Math.min(...vals)-span*.08,maxY=Math.max(...vals)+span*.08,rY=maxY-minY||1;
  const xS=pts.length>1?iW/(pts.length-1):0;
  const toX=i=>pad.l+(pts.length>1?i*xS:iW/2);
  const toY=v=>pad.t+iH-((v-minY)/rY)*iH;
  // Catmull-Rom bezier
  const P=pts.map((p,i)=>({x:toX(i),y:toY(p.kg)}));
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
  const reg=linearRegression(pts.map((p,i)=>({x:i,y:p.kg})));
  const weeklyChange=Math.round(reg.slope*7*100)/100;
  const tY0=toY(reg.intercept),tY1=toY(reg.intercept+reg.slope*(pts.length-1));
  // Y-axis ticks
  const ticks=4;const tickStep=(maxY-minY)/ticks;
  const yTicks=Array.from({length:ticks+1},(_,i)=>minY+tickStep*i);
  // X-axis labels (first, mid, last)
  const xLabels=[0,Math.floor((pts.length-1)/2),pts.length-1].map(i=>({i,d:pts[i].date}));
  const fmtW=d=>{const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  const trendColor=weeklyChange>0.1?'var(--red)':weeklyChange<-0.1?'var(--green)':'var(--blue)';
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;overflow:visible;">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--blue)" stop-opacity=".25"/><stop offset="100%" stop-color="var(--blue)" stop-opacity=".02"/></linearGradient></defs>
    ${yTicks.map(v=>`<line x1="${pad.l}" y1="${toY(v)}" x2="${W-pad.r}" y2="${toY(v)}" stroke="var(--sep)" stroke-width=".5"/><text x="${pad.l-4}" y="${toY(v)+4}" text-anchor="end" font-size="9" style="fill:var(--t3)">${Math.round(v*10)/10}</text>`).join('')}
    ${xLabels.map(({i,d})=>`<text x="${toX(i)}" y="${H-4}" text-anchor="middle" font-size="9" style="fill:var(--t3)">${fmtW(d)}</text>`).join('')}
    <path d="${area}" fill="url(#wg)"/>
    <path d="${path}" fill="none" style="stroke:var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="${pad.l}" y1="${tY0}" x2="${W-pad.r}" y2="${tY1}" stroke="${trendColor}" stroke-width="1.5" stroke-dasharray="5 3" opacity=".6"/>
    ${P.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="3" style="fill:var(--blue)" opacity=".7"/>`).join('')}
  </svg>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:13px;color:var(--t3);">
    <span>${pts.length} pesées · min ${Math.min(...vals).toFixed(1)} kg · max ${Math.max(...vals).toFixed(1)} kg</span>
    <span style="color:${trendColor};font-weight:800;">${weeklyChange>=0?'+':''}${weeklyChange} kg/sem</span>
  </div>`;
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
      +'<div style="display:flex;align-items:center;gap:9px;">'
      +moonSvg
      +'<div><div style="font-size:13px;font-weight:600;color:var(--t1);">'+ts.hours+'h · '+qLabels[ts.quality||2]+'</div>'
      +'<div style="font-size:11.5px;color:var(--t3);margin-top:1px;">Sommeil de cette nuit</div></div>'
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
  const lastSess=S.sessions[0];
  let restBonus=0;
  if(lastSess){const d=Math.floor((new Date()-new Date(lastSess.date+'T12:00:00'))/864e5);restBonus=Math.min(d,3)*3;}
  return Math.min(100,Math.round(wScore+restBonus));
}
function getRecoveryInfo(score){
  if(score===null)return{label:'—',color:'var(--t3)',icon:'❓',rec:'Enregistre ton sommeil pour obtenir ton score de récupération.'};
  if(score<40)return{label:'Fatigué',color:'var(--red)',icon:'🔴',rec:'Récupération insuffisante — séance légère ou repos complet recommandé. Priorise le sommeil ce soir.'};
  if(score<60)return{label:'Modéré',color:'var(--orange)',icon:'🟠',rec:'Récupération partielle — évite les charges maximales. Séance technique ou volume modéré.'};
  if(score<80)return{label:'Bon',color:'var(--gold)',icon:'🟡',rec:'Bonne récupération — séance normale possible. Pas le moment idéal pour des PRs.'};
  return{label:'Optimal',color:'var(--green)',icon:'🟢',rec:'Récupération excellente ! Corps prêt pour une séance intensive — idéal pour tenter des records.'};
}

function renderRecoveryCard(){
  if(_curScreen==='home'){_renderHomeHero();return;}
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

