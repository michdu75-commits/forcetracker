// ─── PROGRESS SCREEN ─────────────────────────────────────────
let _progEx=BIG4[0];

function _renderProgChips(chips){
  const exos=S.progExos||BIG4;
  chips.innerHTML=exos.map((n,i)=>`<button onclick="selectProgEx('${n.replace(/'/g,"\\'")}',${i})" id="pchip-${i}" style="flex:1;min-width:0;padding:9px 6px;border-radius:14px;font-size:12px;font-weight:700;font-family:var(--font);border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);background:var(--bg3);color:var(--t3);cursor:pointer;touch-action:manipulation;transition:all .18s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent;">${n}</button>`).join('')
  +`<button onclick="openProgExoEditor()" title="Personnaliser" style="flex-shrink:0;width:36px;border-radius:14px;border:none;background:var(--bg3);color:var(--t2);cursor:pointer;touch-action:manipulation;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);-webkit-tap-highlight-color:transparent;">✏️</button>`;
}

function renderProgress(){
  switchProgTab('exo',document.getElementById('ptab-exo'));
  const chips=document.getElementById('big4-chips');
  if(chips)_renderProgChips(chips);
  // Dropdown tous les autres exercices
  const sel=document.getElementById('prog-sel');
  const exos=S.progExos||BIG4;
  const others=[...new Set([...EXLIB.map(e=>e.n),...(S.customExercises||[]).map(e=>e.n)])].filter(n=>!exos.includes(n)).sort((a,b)=>a.localeCompare(b,'fr'));
  sel.innerHTML=`<option value="">— Autre exercice… —</option>`+others.map(n=>`<option value="${n}">${n}</option>`).join('');
  selectProgEx(_progEx);
  renderSessions();
  _updateProgCycleBanner();
}

function selectProgEx(name){
  if(!name)return;
  _progEx=name;
  const exos=S.progExos||BIG4;
  exos.forEach((n,i)=>{
    const c=document.getElementById('pchip-'+i);if(!c)return;
    const active=n===name;
    c.style.background=active?'linear-gradient(135deg,#FF6A73,#EF3E57)':'var(--bg3)';
    c.style.color=active?'#fff':'var(--t3)';
    c.style.boxShadow=active?'0 4px 12px -4px rgba(239,62,87,.5)':'inset 0 0 0 1px rgba(255,255,255,.08)';
  });
  const sel=document.getElementById('prog-sel');
  if(sel&&exos.includes(name))sel.value='';
  renderChart();
}

function openProgExoEditor(){
  const exos=S.progExos||BIG4;
  const all=[...new Set([...EXLIB.map(e=>e.n),...(S.customExercises||[]).map(e=>e.n)])].sort((a,b)=>a.localeCompare(b,'fr'));
  let el=document.getElementById('ov-progexo-edit');
  if(!el){
    el=document.createElement('div');el.className='overlay';el.id='ov-progexo-edit';
    el.style.alignItems='flex-end';
    el.onclick=e=>{if(e.target===el)el.classList.remove('open');};
    document.body.appendChild(el);
  }
  const opts=all.map(n=>`<option value="${n}">${n}</option>`).join('');
  el.innerHTML=`<div style="width:100%;max-width:430px;background:var(--bg2);border-radius:16px 16px 0 0;padding:16px 16px 28px;box-shadow:0 -4px 30px rgba(0,0,0,.5);">`
    +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">`
    +`<div style="font-weight:800;font-size:15px;color:var(--t1);">Personnaliser les 4 exercices</div>`
    +`<button onclick="document.getElementById('ov-progexo-edit').classList.remove('open')" style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:none;font-size:15px;color:var(--t2);cursor:pointer;touch-action:manipulation;">✕</button>`
    +`</div>`
    +exos.map((n,i)=>`<div style="margin-bottom:12px;">`
      +`<div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;">Emplacement ${i+1}</div>`
      +`<select onchange="_saveProgExoSlot(${i},this.value)" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:14px;font-family:var(--font);">${opts.replace(`value="${n}"`,`value="${n}" selected`)}</select>`
      +`</div>`).join('')
    +`</div>`;
  el.classList.add('open');
}

function _saveProgExoSlot(idx,name){
  if(!name)return;
  const old=S.progExos[idx];
  S.progExos[idx]=name;
  localStorage.setItem('ft4_progexos',JSON.stringify(S.progExos));
  // Re-render chips
  const chips=document.getElementById('big4-chips');
  if(chips)_renderProgChips(chips);
  // Mettre à jour le dropdown (exclure les nouvelles chips)
  const sel=document.getElementById('prog-sel');
  if(sel){
    const others=[...new Set([...EXLIB.map(e=>e.n),...(S.customExercises||[]).map(e=>e.n)])].filter(n=>!S.progExos.includes(n)).sort((a,b)=>a.localeCompare(b,'fr'));
    sel.innerHTML=`<option value="">— Autre exercice… —</option>`+others.map(n=>`<option value="${n}">${n}</option>`).join('');
    if(!S.progExos.includes(_progEx))sel.value=_progEx;
  }
  // Si l'exercice affiché était dans ce slot, switcher vers le nouveau
  if(_progEx===old)selectProgEx(name);
  else selectProgEx(_progEx);
}
function switchProgTab(tab,btn){
  const exo=document.getElementById('prog-exo'),pw=document.getElementById('prog-poids'),bg=document.getElementById('prog-badges');
  if(exo){exo.style.display=tab==='exo'?'flex':'none';exo.style.flexDirection='column';exo.style.gap='10px';}
  if(pw){pw.style.display=tab==='poids'?'flex':'none';pw.style.flexDirection='column';pw.style.gap='10px';}
  if(bg){bg.style.display=tab==='badges'?'flex':'none';bg.style.flexDirection='column';bg.style.gap='12px';}
  document.getElementById('ptab-exo').classList.toggle('active',tab==='exo');
  document.getElementById('ptab-poids').classList.toggle('active',tab==='poids');
  const ptBadges=document.getElementById('ptab-badges');if(ptBadges)ptBadges.classList.toggle('active',tab==='badges');
  if(tab==='poids')renderWeightTab();
  if(tab==='badges')renderBadges();
}
function goWeightTab(){goScreen('progress',document.getElementById('nb-progress'));setTimeout(()=>switchProgTab('poids',document.getElementById('ptab-poids')),80);}
function renderChart(){
  const name=_progEx,box=document.getElementById('chart-box');
  if(!box)return;
  if(!name){box.innerHTML='<div class="empty">Sélectionne un exercice</div>';return;}
  const pts=[];
  [...S.sessions].reverse().forEach(s=>{
    const ex=(s.exs||s.exercises||[]).find(e=>e.name===name);if(!ex)return;
    const best=(ex.sets||[]).filter(s=>s.done!==false&&s.kg&&s.reps).reduce((b,s)=>{const r=bz(s.kg,s.reps);return r>(b?bz(b.kg,b.reps):0)?s:b;},null);
    if(best)pts.push({date:s.date,kg:best.kg,reps:best.reps,rm1:bz(best.kg,best.reps)});
  });
  const pr=S.prs[name];const prStr=pr?fmt(pr.rm1)+' kg':'—';
  if(!pts.length){box.innerHTML=`<div class="chart-hdr"><span class="chart-title">${name}</span><span class="badge-gold">PR: ${prStr}</span></div><div class="empty" style="padding:20px 0;">Aucune donnée — commence à logger !</div>`;return;}
  _chartPts=pts;
  const last=pts[pts.length-1],maxPt=pts.reduce((m,p)=>p.rm1>m.rm1?p:m,pts[0]);
  const delta=pts.length>1?fmt(last.rm1-pts[0].rm1):null;
  const deltaPct=pts.length>1?Math.round((last.rm1-pts[0].rm1)/pts[0].rm1*100):null;
  const pos=delta!==null&&parseFloat(delta)>=0;
  const W=340,H=170,pad={t:18,r:14,b:32,l:44},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const vals=pts.map(p=>p.rm1);
  const minY=Math.floor(Math.min(...vals)*.94),maxY=Math.ceil(Math.max(...vals)*1.06),rY=maxY-minY||1;
  const xS=pts.length>1?iW/(pts.length-1):0;
  const toX=i=>pad.l+(pts.length>1?i*xS:iW/2);
  const toY=v=>pad.t+iH-((v-minY)/rY)*iH;
  const xs=pts.map((_,i)=>toX(i)),ys=pts.map(p=>toY(p.rm1));
  const tk=0.35;
  let line=`M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  for(let i=0;i<pts.length-1;i++){
    const x0=xs[Math.max(0,i-1)],y0=ys[Math.max(0,i-1)];
    const x1=xs[i],y1=ys[i],x2=xs[i+1],y2=ys[i+1];
    const x3=xs[Math.min(pts.length-1,i+2)],y3=ys[Math.min(pts.length-1,i+2)];
    line+=` C${(x1+(x2-x0)*tk).toFixed(1)},${(y1+(y2-y0)*tk).toFixed(1)} ${(x2-(x3-x1)*tk).toFixed(1)},${(y2-(y3-y1)*tk).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  const area=line+` L${xs[pts.length-1].toFixed(1)},${(pad.t+iH).toFixed(1)} L${xs[0].toFixed(1)},${(pad.t+iH).toFixed(1)} Z`;
  const ticks=Array.from({length:5},(_,i)=>minY+rY*i/4);
  const n=Math.min(4,pts.length);
  const xIdxs=[...new Set(pts.length===1?[0]:Array.from({length:n},(_,i)=>Math.round(i*(pts.length-1)/(n-1))))];
  const prIdx=vals.indexOf(Math.max(...vals));
  const trend=pts.length>1?(pos?'📈 +':'📉 ')+fmt(last.rm1-pts[0].rm1)+' kg':'—';
  box.innerHTML=`
<div class="chart-hdr" style="margin-bottom:12px;"><span class="chart-title">${name}</span><span class="badge-gold">🏆 ${prStr}</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
  <div style="text-align:center;background:var(--bg3);border-radius:10px;padding:9px 4px;border:1px solid var(--sep);">
    <div style="font-size:11px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px;">Actuel</div>
    <div style="font-family:var(--font-cond);font-size:20px;font-weight:900;">${fmt(last.rm1)}</div>
    <div style="font-size:11px;color:var(--t3);">kg 1RM</div>
  </div>
  <div style="text-align:center;background:rgba(255,214,0,.1);border-radius:10px;padding:9px 4px;border:1px solid rgba(255,214,0,.25);">
    <div style="font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px;">Record</div>
    <div style="font-family:var(--font-cond);font-size:20px;font-weight:900;color:var(--gold);">${fmt(maxPt.rm1)}</div>
    <div style="font-size:11px;color:var(--t3);">kg 1RM</div>
  </div>
  <div style="text-align:center;background:${pos?'rgba(0,230,118,.1)':'rgba(255,45,85,.1)'};border-radius:10px;padding:9px 4px;border:1px solid ${pos?'rgba(0,230,118,.25)':'rgba(255,45,85,.25)'};">
    <div style="font-size:11px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px;">Progrès</div>
    <div style="font-family:var(--font-cond);font-size:20px;font-weight:900;color:${pos?'var(--green)':'var(--red)'};">${delta!==null?(pos?'+':'')+delta:'—'}</div>
    <div style="font-size:11px;color:var(--t3);">${deltaPct!==null?(deltaPct>=0?'+':'')+deltaPct+'%':'—'}</div>
  </div>
</div>
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;overflow:visible;">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF2D55" stop-opacity=".45"/>
      <stop offset="70%" stop-color="#FF2D55" stop-opacity=".06"/>
      <stop offset="100%" stop-color="#FF2D55" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${ticks.map(v=>`<line x1="${pad.l}" y1="${toY(v).toFixed(1)}" x2="${W-pad.r}" y2="${toY(v).toFixed(1)}" style="stroke:var(--sep);" stroke-width="1" stroke-dasharray="4 3"/>`).join('')}
  ${ticks.filter((_,i)=>i%2===0).map(v=>`<text x="${pad.l-6}" y="${(toY(v)+3.5).toFixed(1)}" text-anchor="end" style="fill:var(--t3);font-size:9.5px;font-family:-apple-system,sans-serif;font-weight:600;">${Math.round(v)}</text>`).join('')}
  <path d="${area}" fill="url(#cg)"/>
  <path d="${line}" style="stroke:var(--red);" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${pts.map((p,i)=>{const cx=toX(i).toFixed(1),cy=toY(p.rm1).toFixed(1),isPR=i===prIdx;return(isPR?`<circle cx="${cx}" cy="${cy}" r="11" fill="rgba(255,214,0,.18)"/>`:'')+'<circle cx="'+cx+'" cy="'+cy+'" r="'+(isPR?6:4)+'" style="fill:'+(isPR?'var(--gold)':'var(--red)')+';stroke:var(--bg);" stroke-width="2.5"/><circle cx="'+cx+'" cy="'+cy+'" r="16" fill="transparent" style="cursor:pointer;" onclick="showChartTooltip('+i+')"/>';}).join('')}
  ${xIdxs.map(i=>`<text x="${toX(i).toFixed(1)}" y="${H-6}" text-anchor="middle" style="fill:var(--t3);font-size:9px;font-family:-apple-system,sans-serif;">${new Date(pts[i].date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</text>`).join('')}
</svg>
<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(41,121,255,.06);border:1px solid rgba(41,121,255,.15);border-radius:10px;padding:9px 12px;margin-top:8px;min-height:42px;">
  <span style="font-size:12px;color:var(--t3);font-weight:600;" id="tt-hint">Tape un point pour les détails</span>
  <div style="text-align:right;display:none;" id="tt-vals">
    <div style="font-family:var(--font-cond);font-size:17px;font-weight:900;color:var(--red);" id="tt-rm"></div>
    <div style="font-size:13px;color:var(--t2);" id="tt-set"></div>
  </div>
</div>
<div class="chart-meta" style="margin-top:10px;"><span>${pts.length} séance${pts.length>1?'s':''}</span><span>${trend}</span></div>`;
}
function showChartTooltip(i){
  const p=_chartPts[i];if(!p)return;
  const hint=document.getElementById('tt-hint'),rm=document.getElementById('tt-rm'),set=document.getElementById('tt-set'),vals=document.getElementById('tt-vals');
  if(!hint)return;
  hint.textContent=new Date(p.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'});
  if(rm)rm.textContent=fmt(p.rm1)+' kg 1RM';
  if(set)set.textContent=p.kg+' kg × '+p.reps+' reps';
  if(vals)vals.style.display='block';
}
// ─── SESSION DETAIL / EDIT ───────────────────────────────────
let _sessId=null,_sessEdits=null,_sdDelConfirm=false,_sdDelTimer=null;

function _cloudSync(){
  if(!S.email||!S.url)return;
  fetch(S.url,{method:'POST',mode:'no-cors',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({
      action:'saveProfile',email:S.email,
      name:S.name,bw:S.bw,age:S.age,height:S.height,gender:S.gender,goal:S.goal,
      activityLevel:S.activityLevel,workType:S.workType,smoker:S.smoker,
      neck:S.neck,waist:S.waist,hip:S.hip,nutritionPhase:S.nutritionPhase,
      barW:S.barW,defRest:S.defRest,mensCycleStart:S.mensCycleStart,mensCycleDur:S.mensCycleDur,contraception:S.contraception||'',
      morpho:S.morpho||'',morphotype:S.morphotype||'',
      bday:S.bday||'',badges:S.badges||{},
      coachMemory:S.coachMemory||'',
      customExercises:S.customExercises||[],
      sessions:(S.sessions||[]).slice(0,100),
      prs:S.prs||{},
      weightLog:(S.weightLog||[]).slice(-365),
      sleepLog:(S.sleepLog||[]).slice(-365),
      cycle:S.cycle||null,
      healthProfile:S.healthProfile||null,
      a11y:S.a11y||false,
      colorblind:S.colorblind||'',
      leftHand:S.leftHand||false
    })
  }).catch(()=>{});
}
// Alias pour compatibilité
function _cloudSyncSessions(){_cloudSync();}
let _syncTimer=null;
function _cloudSyncDebounced(){clearTimeout(_syncTimer);_syncTimer=setTimeout(_cloudSync,4000);}

function openSessDetail(id){
  const sess=S.sessions.find(s=>(s.ts||s.id)===id);
  if(!sess)return;
  _sessId=id;
  _sessEdits=JSON.parse(JSON.stringify(sess));
  _sdDelConfirm=false;
  if(_sdDelTimer)clearTimeout(_sdDelTimer);
  const db=document.getElementById('sd-del-btn');
  if(db){db.textContent='🗑️ Supprimer';db.style.color='var(--red)';}
  document.getElementById('sd-title').textContent=fmtD(sess.date);
  const cals=sess.calories?` · 🔥 ${sess.calories} kcal`:'';
  document.getElementById('sd-sub').textContent=`${Math.round(sess.volume||0)} kg total${cals}`;

  _updateSdMuscles(sess);
  _renderSessDetailContent();
  document.getElementById('ov-sess-detail').classList.add('open');
}

function _updateSdMuscles(sess){
  const exNames=(sess.exs||sess.exercises||[]).map(e=>e.name);
  const grpMap={};
  EXLIB.forEach(e=>{if(exNames.includes(e.n))grpMap[e.g]=true;});
  const workedGroups=Object.keys(grpMap);
  const muscleEl=document.getElementById('sd-muscles');
  if(!muscleEl)return;
  if(workedGroups.length===0){muscleEl.style.display='none';return;}
  muscleEl.style.display='flex';
  muscleEl.style.cursor='pointer';
  muscleEl.title='Voir la carte musculaire';
  muscleEl.onclick=()=>showMuscleMap(sess.exs||sess.exercises||[],null);
  muscleEl.innerHTML=EX_GROUPS
    .filter(g=>g.tags.some(t=>workedGroups.includes(t)))
    .map(g=>{
      const s=_genderGroupSvg(g.tags[0])||g.icon.replace('height:46px','height:56px');
      return`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:44px">
        ${s}
        <span style="font-size:10px;color:var(--t2);text-align:center;line-height:1.2">${g.label.replace(' / ','\n').split('\n')[0]}</span>
      </div>`;
    }).join('');
}

function _renderSessDetailContent(){
  const el=document.getElementById('sd-content');
  if(!_sessEdits||!el)return;
  el.innerHTML=(_sessEdits.exs||[]).map((ex,ei)=>{
    const done=ex.sets.filter(s=>s.done);
    return`<div class="card" style="margin-bottom:8px;padding:10px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:700;font-size:14px">${ex.name}</div>
        <button class="btn btn-bg2" style="padding:3px 10px;font-size:12px;color:var(--red)" onclick="deleteSessEx(${ei})">✕</button>
      </div>
      ${ex.sets.map((s,si)=>!s.done?'':`<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
        <span style="font-size:11px;color:var(--t3);min-width:14px">${si+1}</span>
        <span style="font-size:11px;background:var(--bg3);padding:2px 5px;border-radius:4px;color:var(--t2);min-width:22px;text-align:center">${s.type||'N'}</span>
        <input type="number" step="0.5" min="0" inputmode="decimal" value="${s.kg}"
               style="width:58px;padding:6px 4px;font-size:14px;text-align:center;border:1px solid var(--bg3);border-radius:6px;background:var(--bg2);color:var(--t1)"
               onchange="updateSessSet(${ei},${si},'kg',+this.value)">
        <span style="color:var(--t2);font-size:12px">kg ×</span>
        <input type="number" min="1" inputmode="numeric" value="${s.reps}"
               style="width:46px;padding:6px 4px;font-size:14px;text-align:center;border:1px solid var(--bg3);border-radius:6px;background:var(--bg2);color:var(--t1)"
               onchange="updateSessSet(${ei},${si},'reps',+this.value)">
        <span style="color:var(--t2);font-size:12px">reps</span>
        ${s.kg&&s.reps?`<span style="font-size:11px;color:var(--t3);margin-left:2px">~${fmt(s.rm1||bz(s.kg,s.reps))}kg</span>`:''}
        <button class="btn btn-bg2" style="padding:3px 7px;font-size:11px;color:var(--red);margin-left:auto" onclick="deleteSessSet(${ei},${si})">✕</button>
      </div>`).join('')}
      ${done.length===0?'<div style="font-size:12px;color:var(--t3);text-align:center;padding:4px 0">Aucune série</div>':''}
    </div>`;
  }).join('');
}

function updateSessSet(ei,si,field,val){
  if(_sessEdits&&_sessEdits.exs[ei]&&_sessEdits.exs[ei].sets[si])_sessEdits.exs[ei].sets[si][field]=val;
}
function deleteSessSet(ei,si){
  if(!_sessEdits)return;
  _sessEdits.exs[ei].sets.splice(si,1);
  _renderSessDetailContent();
}
function deleteSessEx(ei){
  if(!_sessEdits)return;
  const name=_sessEdits.exs[ei]&&_sessEdits.exs[ei].name||'cet exercice';
  showConfirm('Supprimer l\'exercice ?',`"${name}" sera retiré de cette séance.`,()=>{_sessEdits.exs.splice(ei,1);_renderSessDetailContent();_updateSdMuscles(_sessEdits);});
}

function deleteSessOrConfirm(){
  if(!_sdDelConfirm){
    _sdDelConfirm=true;
    const btn=document.getElementById('sd-del-btn');
    btn.textContent='⚠️ Confirmer ?';btn.style.color='#FF9500';
    _sdDelTimer=setTimeout(()=>{_sdDelConfirm=false;btn.textContent='🗑️ Supprimer';btn.style.color='var(--red)';},3000);
    return;
  }
  if(_sdDelTimer)clearTimeout(_sdDelTimer);
  S.sessions=S.sessions.filter(s=>(s.ts||s.id)!==_sessId);
  persist();_cloudSyncSessions();renderSessions();closeSessDetail();
  toast('Séance supprimée','info');
}

function saveSessEdits(){
  if(!_sessEdits||_sessId===null)return;
  const idx=S.sessions.findIndex(s=>(s.ts||s.id)===_sessId);
  if(idx===-1)return;
  let vol=0;
  _sessEdits.exs.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')vol+=(s.kg||0)*(s.reps||0);}));
  _sessEdits.volume=Math.round(vol);
  _sessEdits.exs.forEach(ex=>ex.sets.forEach(s=>{
    if(s.done&&s.kg&&s.reps&&s.type!=='É'&&s.type!=='W'){
      s.rm1=bz(s.kg,s.reps);
      const cur=S.prs[ex.name];
      if(!cur||s.rm1>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:s.rm1,date:_sessEdits.date};
    }
  }));
  const calData=calcSessionCalories(_sessEdits);
  _sessEdits.calories=calData.total;
  _sessEdits.calData=calData;
  S.sessions[idx]=_sessEdits;
  persist();_cloudSyncSessions();renderSessions();closeSessDetail();
  toast('Séance mise à jour ✓','success');
}

function closeSessDetail(){
  document.getElementById('ov-sess-detail').classList.remove('open');
  _sessId=null;_sessEdits=null;_sdDelConfirm=false;
  if(_sdDelTimer){clearTimeout(_sdDelTimer);_sdDelTimer=null;}
}

function _mscSVGmini({sc,ind}){
  const pd={};
  Object.entries(_MG).forEach(([g,d])=>{const v=sc[g]||0;const isI=ind[g]&&!v;const[f,k]=v>=2?['#FF5555','#AA0010']:v>=1?['#FF9500','#AA5500']:isI?['#4488FF','#0030AA']:['#C07060','#7A3828'];d.paths.forEach(id=>{pd[id]={f,k};});});
  const pt=([id,d])=>{const c=id?(pd[id]||{f:'#C07060',k:'#7A3828'}):{f:'#D89070',k:'#A86040'};return `<path d="${d}" fill="${c.f}" stroke="${c.k}" stroke-width="${id?'0.28':'0.18'}" stroke-linejoin="round"/>`;};
  return `<svg viewBox="1 0 32 94" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:auto;display:block;flex-shrink:0" stroke-linecap="round">${_FP.map(pt).join('')}</svg>`;
}
function showSessMuscleMap(i,ev){
  ev&&ev.stopPropagation();
  const s=S.sessions[i];
  if(!s)return;
  showMuscleMap(s.exs||s.exercises||[],null);
}
function renderSessions(){
  const el=document.getElementById('sess-list');
  if(!S.sessions.length){el.innerHTML='<div class="empty">Aucune séance encore</div>';return;}
  el.innerHTML=S.sessions.slice(0,20).map((s,i)=>{
    const exs=(s.exs||s.exercises||[]).map(e=>e.name).join(', ');
    const sync=s.synced?'<span class="synced-pill">☁️ Sheets</span>':'';
    const cals = s.calories ? ` · 🔥${s.calories}kcal` : '';
    const sc=_mscScores(s.exs||s.exercises||[]);
    const mini=_mscSVGmini(sc);
    return`<div class="sess-card" onclick="openSessDetail(${s.ts||s.id||0})" style="cursor:pointer"><div class="sess-hdr"><span class="sess-date">${fmtD(s.date)}${sync}</span><span class="sess-vol">${Math.round(s.volume||0)}kg${cals}</span></div><div style="display:flex;align-items:center;gap:8px;padding:0 10px 10px 0"><div class="sess-exs" style="flex:1;min-width:0">${exs||'—'}</div><div onclick="showSessMuscleMap(${i},event)" style="cursor:zoom-in;flex-shrink:0">${mini}</div></div></div>`;
  }).join('');
}

// ─── 1RM CALCULATOR ──────────────────────────────────────────
function calcRM(){
  const kg=parseFloat(document.getElementById('rm-kg').value);
  const r=parseInt(document.getElementById('rm-reps').value);
  const rm=bz(kg,r);
  document.getElementById('rm-out').textContent=rm?fmt(rm)+' kg':'— kg';
  PCT_IDS.forEach((id,i)=>{document.getElementById(id).textContent=rm?fmt(rm*PCT_VALS[i]/100)+' kg':'—';});
}

// ─── SETUP ───────────────────────────────────────────────────
function genderEditMode(){
  document.getElementById('gender-ro').style.display='none';
  document.getElementById('gender-edit').style.display='flex';
}
function _updateGenderRO(g){
  const ro=document.getElementById('gender-ro-txt');
  if(ro)ro.textContent=g==='H'?'♂ Homme':'♀ Femme';
}
function setGender(g){
  S.gender=g;persist();
  _updateGenderRO(g);
  if(!_adminMode){
    document.getElementById('gender-edit').style.display='none';
    document.getElementById('gender-ro').style.display='flex';
  }
  const gtH=document.getElementById('gt-h');if(gtH)gtH.classList.toggle('active',g==='H');
  const gtF=document.getElementById('gt-f');if(gtF)gtF.classList.toggle('active',g==='F');
  const cs=document.getElementById('cycle-section');
  if(cs)cs.style.display=g==='F'?'flex':'none';
  const hf=document.getElementById('hip-fg');
  if(hf)hf.style.display=g==='F'?'':'none';
  renderBFCard();
}
function setWorkType(t){
  S.workType=t;persist();
  ['bureau','debout','physique'].forEach(x=>{const el=document.getElementById('wt-'+x);if(el)el.classList.toggle('active',x===t);});
}
function setSmoker(v){
  S.smoker=v;persist();
  const n=document.getElementById('sm-non'),o=document.getElementById('sm-oui');
  if(n)n.classList.toggle('active',!v);
  if(o)o.classList.toggle('active',v);
}
function setContraception(val){
  S.contraception=val;persist();
  const hormonal=['pill-combo','pill-prog','implant','iud-hormonal'].includes(val);
  const trackEl=document.getElementById('cycle-tracking-section');
  if(trackEl)trackEl.style.display=hormonal?'none':'';
  renderCycleProfileCard();
  renderHome();renderNutrition();
  _updateProgCycleBanner();
}

const _MORPHOTYPE_DATA={
  ecto:{label:'Ectomorphe',icon:'🦴',desc:'Ossature légère, métabolisme rapide. Tu restes naturellement mince et as du mal à prendre du muscle. Besoin de beaucoup de calories et de glucides.'},
  meso:{label:'Mésomorphe',icon:'💪',desc:'Corps athlétique naturel, muscles bien dessinés. Tu prends et perds du muscle facilement. Réagit vite à l\'entraînement.'},
  endo:{label:'Endomorphe',icon:'🔥',desc:'Corps rond, métabolisme lent. Tu prends du poids facilement et as du mal à perdre de la graisse. Besoin de contrôler les calories.'}
};
const _MORPHO_DATA_H={
  H:{label:'Rectangle',icon:'▬',desc:'Épaules, taille et hanches de largeur similaire. Corps équilibré, facile à sculpter.'},
  A:{label:'Triangle',icon:'▲',desc:'Hanches et taille plus larges que les épaules. Travail des épaules et du haut du corps recommandé.'},
  T:{label:'Trapèze',icon:'⬠',desc:'Épaules légèrement plus larges que les hanches. Proche du V, silhouette naturellement masculine.'},
  V:{label:'Triangle inversé',icon:'▽',desc:'Épaules beaucoup plus larges que hanches et taille. Travailler les jambes pour équilibrer.'},
  O:{label:'Ovale',icon:'⬭',desc:'Ventre et bas du torse plus larges que les épaules. Priorité cardio + déficit calorique + gainage.'}
};
const _MORPHO_DATA_F={
  H:{label:'Rectangle',icon:'▬',desc:'Épaules, taille et hanches de largeur similaire. Définir les courbes avec travail des épaules et des hanches.'},
  A:{label:'Poire',icon:'🍐',desc:'Hanches et cuisses plus larges que les épaules. Développer le haut du corps pour équilibrer.'},
  V:{label:'Triangle inversé',icon:'▽',desc:'Épaules plus larges que les hanches. Travailler les fessiers et l\'intérieur cuisses.'},
  X:{label:'Sablier',icon:'⏳',desc:'Épaules et hanches équilibrées, taille très marquée. Silhouette idéale — entretenir les proportions.'},
  O:{label:'Ronde',icon:'⬭',desc:'Poids concentré autour du ventre et du torse. Cardio régulier + musculation full body.'}
};

// ── Main dominante ────────────────────────────────────────────
function _applyLeftHand(){
  const r=document.getElementById('root');
  if(!r)return;
  if(S.leftHand)r.classList.add('lh');else r.classList.remove('lh');
  const on='padding:8px 12px;border-radius:10px;border:1.5px solid var(--purp);background:rgba(170,0,255,.1);font-size:13px;font-weight:700;cursor:pointer;color:var(--purp);font-family:var(--font);';
  const off='padding:8px 12px;border-radius:10px;border:1.5px solid var(--sep);background:var(--bg2);font-size:13px;font-weight:700;cursor:pointer;color:var(--t2);font-family:var(--font);';
  const rBtn=document.getElementById('lh-right-btn');
  const lBtn=document.getElementById('lh-left-btn');
  if(rBtn)rBtn.style.cssText=!S.leftHand?on:off;
  if(lBtn)lBtn.style.cssText=S.leftHand?on:off;
}
function setHandedness(side){
  S.leftHand=side==='left';persist();_applyLeftHand();
  toast(S.leftHand?'Mode gaucher activé 🤛':'Mode droitier activé 🤜','info');
}

// ── Daltonisme ────────────────────────────────────────────────
const _CB_DESC={
  deut:'Deutéranopie — confusion rouge/vert (8% des hommes). Rouge → orange, vert → bleu.',
  prot:'Protanopie — cécité au rouge (1% des hommes). Rouge → orange-brun, vert → bleu.',
  trit:'Tritanopie — confusion bleu/jaune (rare). Bleu → rose, or/jaune → émeraude.'
};
function _applyColorblind(){
  const r=document.getElementById('root');
  if(!r)return;
  ['cb-deut','cb-prot','cb-trit'].forEach(c=>r.classList.remove(c));
  if(S.colorblind)r.classList.add('cb-'+S.colorblind);
  const active='padding:8px 4px;border-radius:8px;border:1.5px solid var(--red);background:rgba(255,45,85,.1);font-size:11px;font-weight:700;cursor:pointer;color:var(--red);font-family:var(--font);';
  const idle='padding:8px 4px;border-radius:8px;border:1.5px solid var(--sep);background:var(--bg2);font-size:11px;font-weight:700;cursor:pointer;color:var(--t2);font-family:var(--font);';
  [['cb-none',''],['cb-deut-btn','deut'],['cb-prot-btn','prot'],['cb-trit-btn','trit']].forEach(([id,v])=>{
    const b=document.getElementById(id);if(b)b.style.cssText=S.colorblind===v?active:idle;
  });
  const desc=document.getElementById('cb-desc');
  if(desc){
    if(S.colorblind&&_CB_DESC[S.colorblind]){desc.textContent=_CB_DESC[S.colorblind];desc.style.display='';}
    else desc.style.display='none';
  }
}
function setColorblind(type){
  S.colorblind=type;persist();_applyColorblind();
  const label={deut:'Deutéranopie',prot:'Protanopie',trit:'Tritanopie'}[type];
  toast(label?`Mode ${label} activé 🎨`:'Couleurs normales rétablies','info');
}

// ── Accessibilité ─────────────────────────────────────────────
function _applyA11y(){
  const r=document.getElementById('root');
  if(!r)return;
  if(S.a11y)r.classList.add('a11y-lv');
  else r.classList.remove('a11y-lv');
  const btn=document.getElementById('a11y-btn');
  if(!btn)return;
  if(S.a11y){
    btn.textContent='Activé ✓';
    btn.style.cssText='padding:8px 16px;border-radius:20px;border:2px solid var(--purp);background:rgba(170,0,255,.12);color:var(--purp);font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .2s;min-width:80px;';
  }else{
    btn.textContent='Désactivé';
    btn.style.cssText='padding:8px 16px;border-radius:20px;border:2px solid var(--sep);background:var(--bg2);color:var(--t3);font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .2s;min-width:80px;';
  }
}
function toggleA11y(){
  S.a11y=!S.a11y;persist();_applyA11y();
  toast(S.a11y?'Affichage agrandi activé ♿':'Affichage normal rétabli','info');
}

// ── Profil Santé ──────────────────────────────────────────────
const _HC=[
  {id:'cardio',label:'Cardio/HTA',icon:'❤️'},
  {id:'diabete',label:'Diabète',icon:'🩸'},
  {id:'hernie',label:'Hernie discale',icon:'🦴'},
  {id:'asthme',label:'Asthme',icon:'🫁'},
  {id:'arthrite',label:'Arthrose',icon:'🦵'},
  {id:'osteo',label:'Ostéoporose',icon:'💀'},
  {id:'epilepsie',label:'Épilepsie',icon:'⚡'},
];
const _HIZ=[
  {id:'epaule_d',label:'Épaule droite'},{id:'epaule_g',label:'Épaule gauche'},
  {id:'genou_d',label:'Genou droit'},{id:'genou_g',label:'Genou gauche'},
  {id:'dos_bas',label:'Bas du dos (lombaires)'},{id:'dos_haut',label:'Haut du dos'},
  {id:'hanche_d',label:'Hanche droite'},{id:'hanche_g',label:'Hanche gauche'},
  {id:'cheville_d',label:'Cheville droite'},{id:'cheville_g',label:'Cheville gauche'},
  {id:'coude_d',label:'Coude droit'},{id:'coude_g',label:'Coude gauche'},
  {id:'poignet_d',label:'Poignet droit'},{id:'poignet_g',label:'Poignet gauche'},
  {id:'cou',label:'Cou/Cervicales'},{id:'autre',label:'Autre zone'},
];
const _HIS=[
  {id:'active',label:'Active',bg:'rgba(255,45,85,.15)',color:'#FF2D55'},
  {id:'recente',label:'Récente',bg:'rgba(255,149,0,.15)',color:'#FF9500'},
  {id:'ancienne',label:'Ancienne',bg:'rgba(48,209,88,.15)',color:'#30D158'},
];
let _addingInjury=false;

function _getHP(){if(!S.healthProfile)S.healthProfile={conditions:[],injuries:[],notes:''};return S.healthProfile;}

function _renderHealthSection(){
  const el=document.getElementById('health-section');
  if(!el)return;
  const hp=_getHP();
  const conds=hp.conditions||[];
  const injs=hp.injuries||[];

  const condHtml=_HC.map(c=>{
    const on=conds.includes(c.id);
    return `<button onclick="toggleHC('${c.id}')" style="padding:6px 10px;border-radius:20px;border:1.5px solid ${on?'#FF2D55':'var(--sep)'};background:${on?'rgba(255,45,85,.12)':'var(--bg3)'};font-size:12px;font-weight:600;cursor:pointer;color:${on?'#FF2D55':'var(--t2)'};display:inline-flex;align-items:center;gap:4px;">${c.icon} ${c.label}</button>`;
  }).join('');

  const injHtml=injs.length?injs.map((inj,i)=>{
    const z=_HIZ.find(x=>x.id===inj.zone);
    const s=_HIS.find(x=>x.id===inj.status);
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:8px;">
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--t1);">${z?z.label:inj.zone}</span>
      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:${s?s.bg:'rgba(120,120,120,.15)'};color:${s?s.color:'var(--t3)'};">${s?s.label:inj.status}</span>
      <button onclick="removeHI(${i})" style="background:none;border:none;color:var(--t3);font-size:18px;line-height:1;cursor:pointer;padding:0 2px;">×</button>
    </div>`;
  }).join(''):'<div style="font-size:12px;color:var(--t3);padding:4px 0;">Aucune blessure renseignée</div>';

  const addFormHtml=_addingInjury?`<div style="background:var(--bg3);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;">
    <select id="hi-zone-sel" style="padding:8px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:13px;">
      ${_HIZ.map(z=>`<option value="${z.id}">${z.label}</option>`).join('')}
    </select>
    <select id="hi-status-sel" style="padding:8px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:13px;">
      ${_HIS.map(s=>`<option value="${s.id}">${s.label}</option>`).join('')}
    </select>
    <div style="display:flex;gap:8px;">
      <button onclick="saveHI()" style="flex:1;padding:8px;border-radius:8px;background:#FF2D55;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Ajouter</button>
      <button onclick="cancelHI()" style="flex:1;padding:8px;border-radius:8px;background:var(--bg2);border:1px solid var(--sep);color:var(--t2);font-size:13px;cursor:pointer;">Annuler</button>
    </div>
  </div>`:`<button onclick="openHI()" style="padding:8px 14px;border-radius:8px;border:1.5px dashed var(--sep);background:var(--bg3);font-size:13px;font-weight:600;cursor:pointer;color:var(--t2);width:100%;">+ Ajouter une blessure</button>`;

  el.innerHTML=`
    <div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:6px;">Conditions médicales</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">${condHtml}</div>
    <div style="font-size:13px;font-weight:700;color:var(--t2);margin-top:14px;margin-bottom:6px;">Blessures & douleurs</div>
    <div style="display:flex;flex-direction:column;gap:6px;">${injHtml}</div>
    <div style="margin-top:8px;">${addFormHtml}</div>
    <div style="font-size:13px;font-weight:700;color:var(--t2);margin-top:14px;margin-bottom:4px;">Notes santé libres</div>
    <textarea id="health-notes-ta" rows="2" style="width:100%;border-radius:8px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);padding:8px 10px;font-size:13px;resize:none;box-sizing:border-box;" placeholder="Ex: allergie au lactose, prise de statines, glycémie à surveiller..." oninput="saveHN()">${hp.notes||''}</textarea>
  `;
}

function toggleHC(id){
  const hp=_getHP();const idx=(hp.conditions||[]).indexOf(id);
  if(idx>=0)hp.conditions.splice(idx,1);else(hp.conditions=hp.conditions||[]).push(id);
  persist();_renderHealthSection();
}
function openHI(){_addingInjury=true;_renderHealthSection();}
function cancelHI(){_addingInjury=false;_renderHealthSection();}
function saveHI(){
  const zone=(document.getElementById('hi-zone-sel')||{}).value;
  const status=(document.getElementById('hi-status-sel')||{}).value;
  if(!zone)return;
  const hp=_getHP();(hp.injuries=hp.injuries||[]).push({zone,status,since:today()});
  _addingInjury=false;persist();_renderHealthSection();
}
function removeHI(i){
  const hp=_getHP();if(!hp.injuries)return;hp.injuries.splice(i,1);persist();_renderHealthSection();
}
function saveHN(){
  const ta=document.getElementById('health-notes-ta');if(!ta)return;_getHP().notes=ta.value;persist();
}

function _renderMorphoSection(){
  const mtEl=document.getElementById('morphotype-btns');
  const moEl=document.getElementById('morpho-btns');
  if(!mtEl||!moEl)return;
  // Morphotype buttons
  mtEl.innerHTML=Object.entries(_MORPHOTYPE_DATA).map(([k,d])=>`
    <button onclick="setMorphotype('${k}')" id="mt-btn-${k}" style="padding:10px 6px;border-radius:10px;border:2px solid ${S.morphotype===k?'var(--red)':'var(--sep)'};background:${S.morphotype===k?'rgba(255,45,85,.08)':'var(--bg3)'};font-size:13px;font-weight:700;cursor:pointer;color:var(--t1);display:flex;flex-direction:column;align-items:center;gap:4px;">
      <span style="font-size:20px;">${d.icon}</span>${d.label}
    </button>`).join('');
  const mtDesc=document.getElementById('morphotype-desc');
  if(mtDesc){
    if(S.morphotype&&_MORPHOTYPE_DATA[S.morphotype]){
      mtDesc.style.display='block';
      mtDesc.textContent=_MORPHOTYPE_DATA[S.morphotype].desc;
    }else{mtDesc.style.display='none';}
  }
  // Morphology buttons (gender-aware)
  const morphoData=S.gender==='F'?_MORPHO_DATA_F:_MORPHO_DATA_H;
  const keys=Object.keys(morphoData);
  moEl.style.gridTemplateColumns=`repeat(${keys.length},1fr)`;
  moEl.innerHTML=keys.map(k=>`
    <button onclick="setMorpho('${k}')" id="mo-btn-${k}" style="padding:10px 6px;border-radius:10px;border:2px solid ${S.morpho===k?'var(--orange)':'var(--sep)'};background:${S.morpho===k?'rgba(255,149,0,.08)':'var(--bg3)'};font-size:13px;font-weight:700;cursor:pointer;color:var(--t1);display:flex;flex-direction:column;align-items:center;gap:4px;">
      <span style="font-size:18px;">${morphoData[k].icon}</span>${morphoData[k].label}
    </button>`).join('');
  const moDesc=document.getElementById('morpho-desc');
  if(moDesc){
    if(S.morpho&&morphoData[S.morpho]){
      moDesc.style.display='block';
      moDesc.textContent=morphoData[S.morpho].desc;
    }else{moDesc.style.display='none';}
  }
}

function setMorphotype(val){
  S.morphotype=val;persist();_renderMorphoSection();
}
function setMorpho(val){
  S.morpho=val;persist();_renderMorphoSection();
  _cloudSyncDebounced();
}

// ── Morpho photo analysis ──────────────────────────────────────
let _morphoPhotos=[null,null,null];
function openMorphoAnalysis(){
  if(!S.premium){toast('Analyse morphologique réservée aux membres Premium ⭐','info');return;}
  _morphoPhotos=[null,null,null];
  [0,1,2].forEach(i=>{
    const sl=document.getElementById('morpho-slot-'+i);
    if(sl){sl.innerHTML='<span style="font-size:22px;">📷</span>';sl.style.border='2px dashed var(--sep)';}
    const fi=document.getElementById('morpho-file-'+i);
    if(fi)fi.value='';
  });
  const res=document.getElementById('morpho-result');
  if(res){res.style.display='none';res.innerHTML='';}
  const btn=document.getElementById('morpho-analyze-btn');
  if(btn){btn.textContent='🔍 Analyser';btn.disabled=false;}
  document.getElementById('ov-morpho-analysis').classList.add('open');
}
function closeMorphoAnalysis(){document.getElementById('ov-morpho-analysis').classList.remove('open');}

function addMorphoPhoto(input,slot){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const MAX=800;
      const scale=Math.min(1,MAX/Math.max(img.width,img.height));
      const c=document.createElement('canvas');
      c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
      const _mc2d=c.getContext('2d');if(!_mc2d)return;
      _mc2d.drawImage(img,0,0,c.width,c.height);
      const b64=c.toDataURL('image/jpeg',0.8).split(',')[1];
      _morphoPhotos[slot]=b64;
      const slotEl=document.getElementById('morpho-slot-'+slot);
      if(slotEl){
        slotEl.style.border='2px solid var(--green)';
        slotEl.innerHTML=`<img src="${c.toDataURL('image/jpeg',0.8)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`;
      }
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

async function analyzeMorphoPhotos(){
  const filled=_morphoPhotos.filter(Boolean);
  if(filled.length===0){toast('Ajoute au moins une photo','error');return;}
  const btn=document.getElementById('morpho-analyze-btn');
  if(btn){btn.textContent='⏳ Analyse…';btn.disabled=true;}
  const res=document.getElementById('morpho-result');
  if(res){res.style.display='none';res.innerHTML='';}
  showMorphoLoading(_morphoPhotos);
  try{
    const labels=['face','dos','profil'];
    const images=_morphoPhotos.map((b,i)=>b?{data:b,type:'image/jpeg',label:labels[i]}:null).filter(Boolean);
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'morphoAnalysis',images,gender:S.gender||'H',email:S.email||''})
    });
    const txt=await resp.text();
    let data;
    try{data=JSON.parse(txt);}catch(e){throw new Error('Réponse non-JSON: '+txt.substring(0,120));}
    if(data.status!=='ok'||!data.data)throw new Error(data.error||'Erreur analyse');
    const d=data.data;
    applyMorphoResult(d);
    if(res){
      res.style.display='block';
      res.innerHTML=''
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
          +'<div style="width:28px;height:28px;border-radius:50%;background:rgba(52,211,153,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
            +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          +'</div>'
          +'<span style="font-weight:700;font-size:14px;color:#5be3b4;">Profil morphologique mis à jour</span>'
        +'</div>'
        +(d.morphotype?'<div style="margin-bottom:6px;font-size:14px;"><b>Morphotype :</b> '+d.morphotype+'</div>':'')
        +(d.morpho?'<div style="margin-bottom:6px;font-size:14px;"><b>Silhouette :</b> '+d.morpho+'</div>':'')
        +(d.bodyComp?'<div style="margin-bottom:6px;font-size:14px;"><b>Composition estimée :</b> '+d.bodyComp+'</div>':'')
        +(d.strengths?'<div style="margin-bottom:6px;font-size:14px;"><b>Points forts :</b> '+d.strengths+'</div>':'')
        +(d.advice?'<div style="font-size:14px;"><b>Conseils :</b> '+d.advice+'</div>':'');
    }
  }catch(e){
    hideMorphoLoading();
    if(res){res.style.display='block';res.innerHTML=`<div style="color:var(--red);">Erreur : ${e.message}</div>`;}
    toast('Erreur analyse: '+e.message,'error');
  }finally{
    hideMorphoLoading();
    if(btn){btn.textContent='🔍 Analyser';btn.disabled=false;}
  }
}

function applyMorphoResult(d){
  const morphoData=S.gender==='F'?_MORPHO_DATA_F:_MORPHO_DATA_H;
  const mtMap={'ecto':'ecto','ectomorphe':'ecto','meso':'meso','mésomorphe':'meso','endo':'endo','endomorphe':'endo'};
  const moMap={...Object.fromEntries(Object.keys(morphoData).map(k=>[k.toLowerCase(),k]))};
  if(d.morphotype){const k=mtMap[(d.morphotype+'').toLowerCase().split(' ')[0]];if(k)S.morphotype=k;}
  if(d.morpho){const k=moMap[(d.morpho+'').toLowerCase().trim()];if(k)S.morpho=k;}
  persist();_cloudSyncDebounced();
  _renderMorphoSection();
}

function _updateCoachMorphoBtn(){
  const w=document.getElementById('coach-morpho-btn-wrap');
  if(!w)return;
  w.style.display='block';
  if(S.premium){
    w.innerHTML=`<button class="btn btn-bg2" style="width:100%;padding:11px;font-size:14px;border-radius:12px;" onclick="openMorphoAnalysis()">📸 Analyser ma morphologie (3 photos)</button>`;
  }else{
    w.innerHTML=`<button class="btn btn-bg2" style="width:100%;padding:11px;font-size:14px;border-radius:12px;opacity:.45;cursor:default;" onclick="showPremiumWall()">🔒 Analyser ma morphologie (3 photos) <span style="font-size:11px;background:rgba(255,184,0,.15);color:#FFB800;border-radius:6px;padding:1px 6px;margin-left:4px;">Premium</span></button>`;
  }
}

function _updateProgCycleBanner(){
  const el=document.getElementById('prog-cycle-banner');if(!el)return;
  const cp=getMensCyclePhase();
  if(!cp||S.gender!=='F'){el.style.display='none';return;}
  el.style.display='block';
  const advice=cp.hormonal?'Entraîne-toi selon ta forme du jour.':cp.training;
  const label=cp.hormonal?'Contraception hormonale':`${cp.icon} ${cp.phase} — Jour ${cp.day}/${cp.dur}`;
  el.innerHTML=`<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 12px;border-radius:10px;background:rgba(170,0,255,.07);border:1px solid rgba(170,0,255,.15);margin-bottom:2px;">
    <div style="flex:1;min-width:0;">
      <span style="font-size:12px;font-weight:700;color:${cp.color};">${label}</span>
      <span style="font-size:12px;color:var(--t2);"> · ${advice}</span>
    </div>
  </div>`;
}

function renderCycleProfileCard(){
  const el=document.getElementById('cycle-phase-card');
  if(!el)return;
  const cp=getMensCyclePhase();
  if(!cp||cp.hormonal){el.innerHTML='';return;}
  el.innerHTML=`<div style="font-size:12px;color:${cp.color};font-weight:700;margin-top:2px;">${cp.icon} ${cp.phase} — Jour ${cp.day}/${cp.dur}</div>`;
}

function renderBFCard(){
  const el=document.getElementById('bf-result-card');if(!el)return;
  const neck=parseFloat((document.getElementById('neck-inp')||{}).value)||S.neck||0;
  const waist=parseFloat((document.getElementById('waist-inp')||{}).value)||S.waist||0;
  const hip=parseFloat((document.getElementById('hip-inp')||{}).value)||S.hip||0;
  const ht=parseFloat((document.getElementById('ht-inp')||{}).value)||S.height||0;
  const bw=parseFloat((document.getElementById('bw-inp')||{}).value)||S.bw||0;
  if(!ht||!neck||!waist){el.innerHTML='';return;}
  let bf;
  if(S.gender==='H'){
    if(waist<=neck){el.innerHTML='';return;}
    bf=495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(ht))-450;
  }else{
    if(!hip||waist+hip<=neck){el.innerHTML='';return;}
    bf=495/(1.29579-0.35004*Math.log10(waist+hip-neck)+0.22100*Math.log10(ht))-450;
  }
  bf=Math.max(2,Math.round(bf*10)/10);
  const cats=S.gender==='H'
    ?[[6,'Essentiel','var(--purp)'],[14,'Athlète','var(--green)'],[18,'Fitness','var(--blue)'],[25,'Moyen','var(--orange)'],[99,'Élevé','var(--red)']]
    :[[11,'Essentiel','var(--purp)'],[21,'Athlète','var(--green)'],[25,'Fitness','var(--blue)'],[32,'Moyen','var(--orange)'],[99,'Élevé','var(--red)']];
  const cat=cats.find(c=>bf<c[0])||cats[cats.length-1];
  const grasse=bw?Math.round(bw*bf/100):0;
  const maigre=bw?Math.round(bw*(1-bf/100)):0;
  el.innerHTML=`<div style="background:rgba(41,121,255,.08);border:1px solid rgba(41,121,255,.2);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
    <div><div style="font-size:28px;font-weight:900;font-family:var(--font-cond);color:${cat[2]};">${bf}%</div>
    <div style="font-size:13px;color:var(--t3);margin-top:1px;">Masse grasse (Marine US)</div></div>
    <div style="text-align:right;"><span style="background:${cat[2]};color:#fff;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:800;">${cat[1]}</span>
    ${bw?`<div style="font-size:13px;color:var(--t3);margin-top:6px;">${grasse} kg gras · ${maigre} kg maigre</div>`:''}
    </div>
  </div>`;
}

const GOAL_LABELS={muscle:'Prise de muscle',perte:'Perte de poids',force:'Force maximale',equilibre:'Rééquilibrage',endurance:'Endurance'};
const GOAL_DESCS={
  muscle:'Surplus de +350 kcal · Protéines 2.2 g/kg · Macros orientées hypertrophie avec charge glucidique.',
  perte:'Déficit de −450 kcal · Protéines 2.5 g/kg (préservation musculaire) · Glucides réduits, satiété maximale.',
  force:'Surplus léger +200 kcal · Protéines 2.0 g/kg · Lipides élevés pour le support hormonal, énergie maximale.',
  equilibre:'Maintenance calorique · Protéines 2.0 g/kg · Améliorer la composition corporelle sans prise/perte de masse.',
  endurance:'Surplus modéré +100 kcal · Protéines 1.7 g/kg · Glucides élevés pour le glycogène musculaire.',
};
function setGoal(g){
  S.goal=g;persist();
  ['muscle','perte','force','equilibre','endurance'].forEach(x=>{
    const el=document.getElementById('g-'+x);if(el)el.classList.toggle('active',x===g);
  });
  const el=document.getElementById('goal-desc');
  if(el)el.textContent=GOAL_DESCS[g]||'';
}

let _screenHistory=['home'];
function openMenuDrawer(){
  const _ob=document.getElementById('onboarding');
  if(_ob&&window.getComputedStyle(_ob).display!=='none')return;
  const _ip=document.getElementById('install-popup');
  if(_ip&&!_ip.classList.contains('hidden'))return;
  document.getElementById('menu-drawer').classList.add('open');
  document.getElementById('menu-drawer-bd').classList.add('open');
  document.getElementById('nb-setup').classList.add('active');
  // Mettre à jour la carte profil dans le drawer
  const _mn=document.getElementById('menu-name-lbl');
  const _ms=document.getElementById('menu-profile-sub');
  const _ma=document.getElementById('menu-avatar');
  const _mpb=document.getElementById('menu-premium-banner');
  if(_mn)_mn.textContent=S.name||'Athlète';
  if(_ma)_ma.textContent=(S.name||'A').charAt(0).toUpperCase();
  if(_ms){
    const GOAL_SHORT={muscle:'💪 Prise de muscle',perte:'🔥 Perte de poids',force:'🏋️ Force max',equilibre:'⚖️ Rééquilibrage',endurance:'🏃 Endurance'};
    const parts=[];
    if(S.goal)parts.push(GOAL_SHORT[S.goal]||'');
    if(S.bw)parts.push(S.bw+' kg');
    if(S.height)parts.push(S.height+' cm');
    _ms.textContent=parts.length?parts.join(' · '):'Profil non configuré';
  }
  if(_mpb)_mpb.style.display=S.premium?'none':'flex';
}
function closeMenuDrawer(){
  document.getElementById('menu-drawer').classList.remove('open');
  document.getElementById('menu-drawer-bd').classList.remove('open');
  if(_curScreen!=='setup')document.getElementById('nb-setup').classList.remove('active');
}
function toggleMenuDrawer(){
  const d=document.getElementById('menu-drawer');
  if(d.classList.contains('open'))closeMenuDrawer();
  else openMenuDrawer();
}
function _resetMenuView(){}
function openProfil(){
  closeMenuDrawer();
  closeDrawer();
  closeDrawerContent();
  goScreen('setup',null);
  document.getElementById('s-setup')?.scrollTo(0,0);
}
function closeProfil(){ navBack(); }
function renderSetup(){
  // Update menu profile card
  const _mn=document.getElementById('menu-name-lbl');
  const _ms=document.getElementById('menu-profile-sub');
  const _ma=document.getElementById('menu-avatar');
  const _mpb=document.getElementById('menu-premium-banner');
  if(_mn)_mn.textContent=S.name||'Athlète';
  if(_ma)_ma.textContent=(S.name||'A').charAt(0).toUpperCase();
  if(_ms){
    const GOAL_SHORT={muscle:'💪 Prise de muscle',perte:'🔥 Perte de poids',force:'🏋️ Force max',equilibre:'⚖️ Rééquilibrage',endurance:'🏃 Endurance'};
    const parts=[];
    if(S.goal)parts.push(GOAL_SHORT[S.goal]||'');
    if(S.bw)parts.push(S.bw+' kg');
    if(S.height)parts.push(S.height+' cm');
    _ms.textContent=parts.length?parts.join(' · '):'Profil non configuré';
  }
  if(_mpb)_mpb.style.display=S.premium?'none':'flex';
  _updateGenderRO(S.gender);
  const ro=document.getElementById('gender-ro');
  const ed=document.getElementById('gender-edit');
  if(ro)ro.style.display=_adminMode?'none':'flex';
  if(ed)ed.style.display=_adminMode?'flex':'none';
  setGender(S.gender);
  const ageEl=document.getElementById('age-inp');if(ageEl)ageEl.value=S.age||'';
  const htEl=document.getElementById('ht-inp');if(htEl)htEl.value=S.height||'';
  const bwEl=document.getElementById('bw-inp');if(bwEl)bwEl.value=S.bw||'';
  const actEl=document.getElementById('act-sel');if(actEl)actEl.value=S.activityLevel;
  const barEl=document.getElementById('bar-inp');if(barEl)barEl.value=S.barW;
  const restEl=document.getElementById('rest-sel');if(restEl)restEl.value=S.defRest;
  const emailEl=document.getElementById('email-inp');if(emailEl)emailEl.value=S.email||'';
  const profilEmailLbl=document.getElementById('profil-email-lbl');
  const profilSyncDot=document.getElementById('profil-sync-dot');
  if(profilEmailLbl){
    profilEmailLbl.textContent=S.email||'Non connecté';
    if(profilSyncDot)profilSyncDot.style.background=S.email&&S.connected?'#34c759':S.email?'#ff9500':'var(--t3)';
  }
  setWorkType(S.workType);
  setSmoker(S.smoker);
  const csEl=document.getElementById('cycle-start-inp');if(csEl)csEl.value=S.mensCycleStart||'';
  const cdEl=document.getElementById('cycle-dur-inp');if(cdEl)cdEl.value=S.mensCycleDur||28;
  const contraEl=document.getElementById('contra-sel');if(contraEl)contraEl.value=S.contraception||'';
  const _hormonal=['pill-combo','pill-prog','implant','iud-hormonal'].includes(S.contraception||'');
  const _trackEl=document.getElementById('cycle-tracking-section');
  if(_trackEl)_trackEl.style.display=_hormonal?'none':'';
  const neckEl=document.getElementById('neck-inp');if(neckEl)neckEl.value=S.neck||'';
  const waistEl=document.getElementById('waist-inp');if(waistEl)waistEl.value=S.waist||'';
  const hipEl=document.getElementById('hip-inp');if(hipEl)hipEl.value=S.hip||'';
  const bdayEl=document.getElementById('bday-inp');if(bdayEl)bdayEl.value=S.bday||'';
  renderCycleProfileCard();
  setGoal(S.goal||'muscle');
  renderBFCard();
  _renderMorphoSection();
  _renderHealthSection();
  _applyA11y();
  _applyColorblind();
  _applyLeftHand();
  updSetup();
  chainInputs(['age-inp','ht-inp','bw-inp'],saveProfile);
  const bfIds=S.gender==='F'?['neck-inp','waist-inp','hip-inp']:['neck-inp','waist-inp'];
  chainInputs(bfIds,saveProfile);
}
function updSetup(){
  const d=document.getElementById('setup-dot'),t=document.getElementById('setup-txt');if(!d)return;
  if(S.connected){d.className='sdot g';t.textContent='Connecté — sync automatique active ✓';}
  else{d.className='sdot';t.textContent='Non connecté — clique Tester la connexion';}
}
async function testConn(){
  document.getElementById('setup-dot').className='sdot a';document.getElementById('setup-txt').textContent='Test…';toast('Test…','info');
  try{
    await fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'test'})});
    S.connected=true;persist();updSetup();updatePill();toast('Serveur joignable ✅','success');
  }catch(e){S.connected=false;persist();updSetup();toast('Erreur de connexion : '+e.message,'error');}
}
function saveProfile(){
  const age=parseInt(document.getElementById('age-inp').value);
  const ht=parseFloat(document.getElementById('ht-inp').value);
  const bw=parseFloat(document.getElementById('bw-inp').value);
  const actEl=document.getElementById('act-sel');
  const barEl=document.getElementById('bar-inp');
  const restEl=document.getElementById('rest-sel');
  const act=actEl?parseFloat(actEl.value):S.activityLevel;
  const bar=barEl?parseFloat(barEl.value):S.barW;
  const rest=restEl?parseInt(restEl.value):S.defRest;
  if(age){if(age>13&&age<100)S.age=age;else{toast('Âge invalide (14–99 ans)','error');return;}}
  if(ht){if(ht>100&&ht<230)S.height=ht;else{toast('Taille invalide (100–229 cm)','error');return;}}
  if(bw){if(bw>20&&bw<300)S.bw=bw;else{toast('Poids invalide (20–299 kg)','error');return;}}
  if(act) S.activityLevel=act;
  if(bar&&bar>0) S.barW=bar;
  if(rest) S.defRest=rest;
  const csEl=document.getElementById('cycle-start-inp');
  const cdEl=document.getElementById('cycle-dur-inp');
  const contraEl2=document.getElementById('contra-sel');
  if(csEl&&csEl.value)S.mensCycleStart=csEl.value;
  if(cdEl&&cdEl.value){const d=parseInt(cdEl.value);if(d>=18&&d<=45)S.mensCycleDur=d;}
  if(contraEl2)S.contraception=contraEl2.value||'';
  const neckEl=document.getElementById('neck-inp');
  const waistEl=document.getElementById('waist-inp');
  const hipEl=document.getElementById('hip-inp');
  if(neckEl&&neckEl.value){const v=parseFloat(neckEl.value);if(v>20&&v<60)S.neck=v;}
  if(waistEl&&waistEl.value){const v=parseFloat(waistEl.value);if(v>40&&v<200)S.waist=v;}
  if(hipEl&&hipEl.value){const v=parseFloat(hipEl.value);if(v>40&&v<200)S.hip=v;}
  persist();renderHome();renderNutrition();
  renderCycleProfileCard();renderBFCard();
  const saveBtn=document.querySelector('[onclick="saveProfile()"]');
  if(saveBtn){saveBtn.textContent='✅ Profil enregistré !';saveBtn.disabled=true;setTimeout(()=>{saveBtn.innerHTML='💾 Enregistrer le profil';saveBtn.disabled=false;},2000);}
  _cloudSync();
}

function _applyRestoreData(raw){
  // Le serveur retourne {status:'ok', profile:{name,bw,...}, prs:{}, sessions:[], ...}
  // ou un ancien format plat {name, bw, ...}
  let d, prs, sessions, weightLog, sleepLog;
  if(raw&&typeof raw.profile==='object'){
    d=raw.profile||{};
    prs=raw.prs||{};
    sessions=raw.sessions||[];
    weightLog=raw.weightLog||[];
    sleepLog=raw.sleepLog||[];
  }else{
    d=raw||{};
    prs=d.prs||{};
    sessions=d.sessions||[];
    weightLog=d.weightLog||[];
    sleepLog=d.sleepLog||[];
  }
  const hasProfile=d.name||d.bw||d.age||d.gender||d.goal;
  if(!hasProfile)throw new Error('Aucun profil trouvé sur le serveur pour cet email. Enregistre d\'abord ton profil depuis l\'appli.');
  if(d.name)S.name=d.name;
  if(d.bw)S.bw=parseFloat(d.bw)||S.bw;
  if(d.age)S.age=parseInt(d.age)||S.age;
  if(d.height)S.height=parseFloat(d.height)||S.height;
  if(d.gender){S.gender=d.gender;_obGender=d.gender;}
  if(d.goal){S.goal=d.goal;_obGoal=d.goal;}
  if(d.activityLevel)S.activityLevel=parseFloat(d.activityLevel)||S.activityLevel;
  if(d.workType)S.workType=d.workType;
  if(d.smoker!==undefined)S.smoker=!!d.smoker;
  if(d.neck)S.neck=parseFloat(d.neck)||0;
  if(d.waist)S.waist=parseFloat(d.waist)||0;
  if(d.hip)S.hip=parseFloat(d.hip)||0;
  if(d.nutritionPhase)S.nutritionPhase=d.nutritionPhase;
  if(d.barW)S.barW=parseFloat(d.barW)||20;
  if(d.defRest)S.defRest=parseInt(d.defRest)||120;
  if(d.mensCycleStart)S.mensCycleStart=d.mensCycleStart;
  if(d.mensCycleDur)S.mensCycleDur=parseInt(d.mensCycleDur)||28;
  if(d.contraception!==undefined)S.contraception=d.contraception||'';
  if(d.morpho)S.morpho=d.morpho;
  if(d.morphotype)S.morphotype=d.morphotype;
  if(d.bday)S.bday=d.bday;
  if(d.badges&&Object.keys(d.badges).length)S.badges=d.badges;
  if(d.customExercises&&d.customExercises.length)S.customExercises=d.customExercises;
  if(prs&&Object.keys(prs).length)S.prs=prs;
  if(sessions&&sessions.length)S.sessions=sessions;
  if(weightLog&&weightLog.length)S.weightLog=weightLog;
  if(sleepLog&&sleepLog.length)S.sleepLog=sleepLog;
  if(raw&&raw.cycle)S.cycle=raw.cycle;
  if(raw&&raw.premium===true){S.premium=true;}
  if(raw&&raw.premiumExpiry){S.premiumExpiry=raw.premiumExpiry;}
  if(raw&&raw.coachMemory)S.coachMemory=raw.coachMemory;
  if(d.healthProfile)S.healthProfile=d.healthProfile;
  if(d.a11y!==undefined)S.a11y=!!d.a11y;
  if(d.colorblind!==undefined)S.colorblind=d.colorblind||'';
  if(d.leftHand!==undefined)S.leftHand=!!d.leftHand;
  persist();
  _applyA11y();
  _applyColorblind();
  _applyLeftHand();
  updateCoachHeader();
}

async function _fetchRestoreRaw(email){
  const resp=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email})});
  const txt=await resp.text();
  let data;
  try{data=JSON.parse(txt);}catch(e){throw new Error('Réponse non-JSON : '+txt.substring(0,120));}
  return data;
}

async function restoreFromEmail(){
  if(!S.email){toast('Entre ton email dans le champ Email Admin','error');return;}
  if(!S.url){toast('URL Apps Script manquante','error');return;}
  toast('Restauration en cours…','info');
  try{
    const data=await _fetchRestoreRaw(S.email);
    if(!data||data.error||data.status==='not_found'){toast(data&&data.error?data.error:'Aucun profil trouvé pour cet email.','error');return;}
    _applyRestoreData(data);
    renderSetup();renderHome();renderNutrition();
    toast('Profil restauré ✅','success');
  }catch(e){toast(e.message,'error');}
}

async function debugRestore(){
  if(!S.email){toast('Pas d\'email configuré','error');return;}
  toast('Test API en cours…','info');
  try{
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email:S.email})});
    const txt=await resp.text();
    console.log('[FT debug restore]',txt);
    toast('Réponse API : '+txt.substring(0,80),'info');
  }catch(e){toast('Erreur réseau : '+e.message,'error');}
}

function detectDuplicates(){
  const seen=new Map();
  (S.sessions||[]).forEach(s=>(s.exs||[]).forEach(ex=>{if(ex.name)seen.set(ex.name,ex.name);}));
  Object.keys(S.prs||{}).forEach(n=>seen.set(n,n));
  (S.customExercises||[]).forEach(e=>seen.set(e.n,e.n));
  EXLIB.forEach(e=>seen.set(e.n,e.n));
  const arr=[...seen.values()];
  const pairs=[];
  for(let i=0;i<arr.length;i++){
    const na=_normEx(arr[i]);
    for(let j=i+1;j<arr.length;j++){
      const nb=_normEx(arr[j]);
      if(na===nb){pairs.push([arr[i],arr[j],0]);continue;}
      const minL=Math.min(na.length,nb.length);
      if(minL<5)continue;
      const d=_lev(na,nb);
      if(d<=1)pairs.push([arr[i],arr[j],d]);
    }
  }
  const el=document.getElementById('admin-dupes');
  el.style.display='flex';
  if(!pairs.length){el.innerHTML='<div style="color:var(--t3);padding:8px 0;">Aucun doublon détecté ✅</div>';return;}
  el.innerHTML=pairs.map(([a,b,d])=>{
    const la=a.length>18?a.slice(0,18)+'…':a;
    const lb=b.length>18?b.slice(0,18)+'…':b;
    return '<div style="background:var(--bg3);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;">'
      +'<div style="color:var(--t3);font-size:11px;">dist.'+d+'</div>'
      +'<div style="color:var(--t1);font-weight:600;font-size:13px;">'+a+' <span style="color:var(--t3);font-weight:400;">≈</span> '+b+'</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
      +'<button class="btn btn-bg2" onclick="mergeExercises('+JSON.stringify(a)+','+JSON.stringify(b)+')" style="padding:7px 10px;font-size:12px;flex:1;">Garder "'+la+'"</button>'
      +'<button class="btn btn-bg2" onclick="mergeExercises('+JSON.stringify(b)+','+JSON.stringify(a)+')" style="padding:7px 10px;font-size:12px;flex:1;">Garder "'+lb+'"</button>'
      +'</div></div>';
  }).join('');
}

function mergeExercises(keep,remove){
  const sessCount=(S.sessions||[]).reduce((n,s)=>n+(s.exs||[]).filter(e=>e.name===remove).length,0);
  const hasPr=!!(S.prs||{})[remove];
  const details=[];
  if(sessCount)details.push(sessCount+' séance'+(sessCount>1?'s':''));
  if(hasPr)details.push('1 PR');
  const desc=details.length?' ('+details.join(', ')+')':'';
  showConfirm(
    'Fusionner les exercices',
    'Renommer "'+remove+'"'+desc+' en "'+keep+'" ? Cette action est irréversible.',
    ()=>{
      (S.sessions||[]).forEach(s=>(s.exs||[]).forEach(ex=>{if(ex.name===remove)ex.name=keep;}));
      if((S.prs||{})[remove]){
        const pr=S.prs[remove];
        if(!S.prs[keep]||pr.rm1>(S.prs[keep].rm1||0))S.prs[keep]=pr;
        delete S.prs[remove];
      }
      S.customExercises=(S.customExercises||[]).filter(e=>e.n!==remove);
      persist();
      toast('"'+remove+'" fusionné dans "'+keep+'" ✅','success');
      detectDuplicates();
    }
  );
}
