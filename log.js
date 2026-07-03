// ─── WORKOUT ─────────────────────────────────────────────────
let _wakeLock=null;
async function _acquireWakeLock(){
  if(!('wakeLock' in navigator))return;
  try{_wakeLock=await navigator.wakeLock.request('screen');}catch(e){}
}
function _releaseWakeLock(){
  if(_wakeLock){_wakeLock.release();_wakeLock=null;}
}

// ─── CHRONO DURÉE SÉANCE ─────────────────────────────────────
let _wktChronoIv=null;
function _fmtElapsed(){
  if(!S.wkt||!S.wkt.startTs)return'0:00';
  const sec=Math.floor((Date.now()-S.wkt.startTs)/1000);
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  if(h>0)return h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  return m+':'+(s<10?'0':'')+s;
}
function _startWktChrono(){
  if(_wktChronoIv)clearInterval(_wktChronoIv);
  _wktChronoIv=setInterval(()=>{
    const el=document.getElementById('wkt-chrono');
    if(!el){clearInterval(_wktChronoIv);_wktChronoIv=null;return;}
    el.textContent=_fmtElapsed();
  },1000);
}
function _stopWktChrono(){if(_wktChronoIv){clearInterval(_wktChronoIv);_wktChronoIv=null;}}

// Ré-acquérir + resync des deux chronos au retour au premier plan
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&window._curScreen==='log'){
    _acquireWakeLock();
    // Wkt chrono : mise à jour immédiate (ne pas attendre le prochain tick)
    const chronoEl=document.getElementById('wkt-chrono');
    if(chronoEl)chronoEl.textContent=_fmtElapsed();
    _startWktChrono();
    // Rest timer : vérification immédiate (bip + affichage)
    if(restIv)_restTick();
  }
});

function startWorkout(){
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length) S.wkt={date:today(),exs:[],startHour:new Date().getHours(),startTs:Date.now()};
  if(!S.wkt.startTs)S.wkt.startTs=Date.now();
  persist(); goScreen('log',document.getElementById('nb-log'));
  _acquireWakeLock();
}
function _fmtWktDate(d){
  const dt=new Date(d+'T12:00:00');
  return dt.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
}
function _setLogDate(d){
  if(S.wkt){S.wkt.date=d;persist();}
  const txt=document.getElementById('s-date-txt');if(txt)txt.textContent=_fmtWktDate(d);
  const inp=document.getElementById('s-date');if(inp)inp.value=d;
}
function resetToday(){_setLogDate(today());}
function setLogYesterday(){const d=new Date();d.setDate(d.getDate()-1);_setLogDate(d.toISOString().split('T')[0]);}
function renderLog(){
  if(!S.wkt) S.wkt={date:today(),exs:[]};
  const d=S.wkt.date||today();
  const txt=document.getElementById('s-date-txt');if(txt)txt.textContent=_fmtWktDate(d);
  const inp=document.getElementById('s-date');
  if(inp){inp.value=d;inp.onchange=()=>{if(inp.value)_setLogDate(inp.value);};}
  const hdr=document.getElementById('log-hdr');
  const hasExs=S.wkt&&S.wkt.exs&&S.wkt.exs.length>0;
  if(hdr)hdr.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;">'
    +'<span style="font-family:var(--font-cond);font-size:21px;font-weight:800;letter-spacing:-.02em;color:var(--t1);flex:1;">Séance</span>'
    +'<span id="wkt-chrono" style="font-family:\'SF Mono\',ui-monospace,monospace;font-size:14px;font-weight:700;color:var(--t3);letter-spacing:.04em;flex-shrink:0;">'+_fmtElapsed()+'</span>'
    +'<span id="log-hdr-btns" style="display:flex;gap:8px;">'
    +(hasExs?'<button onclick="clearWkt()" style="padding:7px 11px;border-radius:10px;border:1px solid rgba(255,45,85,.3);background:rgba(255,45,85,.08);color:var(--red);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">✕</button>':'')
    +(hasExs?'<button onclick="openProgModal()" style="padding:8px 12px;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">📋 Changer</button>':'')
    +'</span>'
    +'</div>';
  _startWktChrono();
  // Refresh immédiat des timers au retour sur l'écran (ne pas attendre le prochain tick)
  if(restIv)_restTick();
  renderLogSleep();
  renderCardioBlock();
  renderExBlocks();
}
// ─── SUPERSETS ────────────────────────────────────────────────
function _ssMembers(gid){return S.wkt.exs.map((e,i)=>({e,i})).filter(({e})=>e.group===gid).sort((a,b)=>a.i-b.i);}
function _nextInGroup(ei){const ex=S.wkt.exs[ei];if(!ex||!ex.group)return null;const m=_ssMembers(ex.group);const pos=m.findIndex(({i})=>i===ei);return(pos>=0&&pos<m.length-1)?m[pos+1].i:null;}
function _firstUndoneMember(gid){const m=_ssMembers(gid);for(const {e,i} of m){if(e.sets.some(s=>!s.done))return i;}return null;}
function toggleGroupMode(){_groupMode=!_groupMode;_selectedGroupExs.clear();renderExBlocks();}
function toggleGroupSelect(ei){if(!_groupMode)return;if(_selectedGroupExs.has(ei))_selectedGroupExs.delete(ei);else _selectedGroupExs.add(ei);renderExBlocks();}
function createSuperset(){
  if(_selectedGroupExs.size<2)return;
  const gid='ss'+Date.now();
  _selectedGroupExs.forEach(ei=>{S.wkt.exs[ei].group=gid;S.wkt.exs[ei].groupType='super';});
  const members=_ssMembers(gid);
  if(members.length)_expandedEx=members[0].i;
  _groupMode=false;_selectedGroupExs.clear();
  persist();renderExBlocks();toast('Super Set créé ⚡','success');
}
function dissolveGroup(gid){
  S.wkt.exs.forEach(ex=>{if(ex.group===gid){delete ex.group;delete ex.groupType;}});
  persist();renderExBlocks();toast('Groupe dissous','info');
}
function _roundToGym(kg){return Math.round(kg/2.5)*2.5;}
function createSupersetFrom(ei){
  const gid='ss'+Date.now();
  S.wkt.exs[ei].group=gid;S.wkt.exs[ei].groupType='super';
  _expandedEx=ei;persist();
  _exPickerMode='addToGroup';_addToGroupGid=gid;
  openExPicker();
  toast('Choisis le 2ᵉ exercice de la supersérie','info');
}
let _addToGroupGid=null;
// ─── DROPSET / PYRAMIDE ─────────────────────────────────────────────────────
let _dropCfgEi=null,_dropCfgPaliers=3,_dropCfgPct=20,_dropCfgDir='down';
function openDropsetConfig(ei,dir){
  dir=dir||'down';
  _dropCfgEi=ei;_dropCfgDir=dir;_dropCfgPaliers=3;_dropCfgPct=dir==='up'?10:20;
  let ov=document.getElementById('ov-drop-cfg');
  if(!ov){ov=document.createElement('div');ov.className='overlay';ov.id='ov-drop-cfg';ov.onclick=function(e){if(e.target===ov)closeDropCfg();};document.body.appendChild(ov);}
  _renderDropCfg(ov);ov.classList.add('open');
}
function _renderDropCfg(ov){
  const isDown=_dropCfgDir==='down';
  const pctOpts=isDown?[10,15,20,25,30]:[5,10,15,20];
  const bStyle=(sel)=>`flex:1;padding:10px 2px;border-radius:10px;border:2px solid ${sel?'var(--orange)':'var(--sep)'};background:${sel?'rgba(255,109,0,.12)':'var(--bg3)'};color:${sel?'var(--orange)':'var(--t2)'};font-weight:800;font-size:14px;cursor:pointer;transition:.1s;touch-action:manipulation;`;
  ov.innerHTML=`<div class="modal" style="width:min(400px,94vw);padding:20px 16px;">`
    +`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">`
    +`<span style="font-weight:800;font-size:16px;color:var(--t1);">${isDown?'📉 Dropset':'📈 Pyramide +'}</span>`
    +`<button onclick="closeDropCfg()" style="background:var(--bg3);border:none;width:30px;height:30px;border-radius:50%;font-size:15px;cursor:pointer;color:var(--t2);display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">✕</button>`
    +`</div>`
    +`<div style="font-size:12px;color:var(--t2);margin-bottom:14px;line-height:1.5;">${isDown?'Baisse le poids à chaque palier sans repos — repos unique après le dernier drop.':'Monte le poids à chaque palier avec repos normal entre les séries.'}</div>`
    +`<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px;">Nombre de paliers</div>`
    +`<div style="display:flex;gap:8px;margin-bottom:16px;">`
    +[2,3,4,5].map(n=>`<button style="${bStyle(_dropCfgPaliers===n)}" onclick="_dropCfgPaliers=${n};_renderDropCfg(document.getElementById('ov-drop-cfg'))">${n}</button>`).join('')
    +`</div>`
    +`<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px;">${isDown?'Baisse par palier':'Hausse par palier'}</div>`
    +`<div style="display:flex;gap:6px;margin-bottom:20px;">`
    +pctOpts.map(p=>`<button style="${bStyle(_dropCfgPct===p)}" onclick="_dropCfgPct=${p};_renderDropCfg(document.getElementById('ov-drop-cfg'))">${isDown?'−':'+'}${p}%</button>`).join('')
    +`</div>`
    +`<button onclick="applyDropset()" style="width:100%;padding:14px;border-radius:12px;background:var(--red);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation;">Créer le ${isDown?'dropset':'pyramide'}</button>`
    +`</div>`;
}
function closeDropCfg(){const ov=document.getElementById('ov-drop-cfg');if(ov)ov.classList.remove('open');}
function applyDropset(){
  closeDropCfg();
  const ei=_dropCfgEi;
  if(ei===null||!S.wkt?.exs[ei])return;
  const ex=S.wkt.exs[ei];
  const baseKg=ex.sets[0]?.kg||(getPrev(ex.name)[0]?.kg)||0;
  const baseReps=ex.sets[0]?.reps||(getPrev(ex.name)[0]?.reps)||8;
  const f=_dropCfgPct/100;const dir=_dropCfgDir;
  const newSets=[];let kg=baseKg;
  for(let i=0;i<_dropCfgPaliers;i++){
    if(i>0)kg=_roundToGym(dir==='down'?kg*(1-f):kg*(1+f));
    newSets.push({kg:kg||0,reps:baseReps,done:false,type:'N'});
  }
  ex.sets=newSets;ex.dropset={paliers:_dropCfgPaliers,pct:_dropCfgPct,direction:dir};
  delete ex.group;delete ex.groupType;
  _expandedEx=ei;persist();renderExBlocks();
  toast((dir==='down'?'Dropset':'Pyramide')+' créé ✓','success');
}
function removeDropset(ei){
  const ex=S.wkt.exs[ei];if(!ex||!ex.dropset)return;
  ex.sets=[{kg:ex.sets[0]?.kg||0,reps:ex.sets[0]?.reps||8,done:false,type:'N'}];
  delete ex.dropset;persist();renderExBlocks();toast('Dropset supprimé','info');
}
function removeFromGroup(ei){
  const gid=S.wkt.exs[ei]?.group;if(!gid)return;
  delete S.wkt.exs[ei].group;delete S.wkt.exs[ei].groupType;
  const left=S.wkt.exs.filter(e=>e.group===gid);
  if(left.length<1)left.forEach(e=>{delete e.group;delete e.groupType;});
  persist();renderExBlocks();toast('Retiré du groupe','info');
}
function moveInGroup(ei,dir){
  const gid=S.wkt.exs[ei]?.group;if(!gid)return;
  const members=_ssMembers(gid);
  const pos=members.findIndex(({i})=>i===ei);
  const swapPos=pos+dir;
  if(swapPos<0||swapPos>=members.length)return;
  const swapEi=members[swapPos].i;
  [S.wkt.exs[ei],S.wkt.exs[swapEi]]=[S.wkt.exs[swapEi],S.wkt.exs[ei]];
  persist();renderExBlocks();
}
function _groupStatusMeta(ex,pos,total){
  const gt=ex.groupType||'super';
  const done=ex.sets.filter(s=>s.done).length;
  const all=ex.sets.length;
  if(gt==='drop'){
    const stepLbl=pos===0?'Charge de départ':'Drop −20 %';
    let status;
    if(done>=all)status='✓';
    else if(done>0)status='En cours';
    else status=pos<total-1?'À suivre · sans repos':'À suivre';
    const kg=ex.sets[0]?.kg||null;
    return stepLbl+' · '+status+(kg?' · '+kg+'kg':'');
  }
  let status;
  if(done>=all)status='✓ Terminé';
  else if(done>0)status='En cours ('+done+'/'+all+')';
  else status='À suivre';
  const kg=ex.sets[0]?.kg,reps=ex.sets[0]?.reps;
  return status+(kg&&reps?' · '+kg+'×'+reps:'');
}
function addToGroup(gid){
  const members=_ssMembers(gid);if(!members.length)return;
  const gt=members[0].e.groupType||'super';
  if(gt==='super'){_exPickerMode='addToGroup';_addToGroupGid=gid;openExPicker();return;}
  const last=members[members.length-1];
  const lastKg=last.e.sets.slice(-1)[0]?.kg||0;
  const factor=(gt==='drop'||gt==='pyramid-down')?0.9:1.1;
  const newKg=lastKg?_roundToGym(lastKg*factor):0;
  const t=gt==='drop'?'D':'N';
  const clone={name:last.e.name,sets:[{kg:newKg,reps:last.e.sets[0]?.reps||8,done:false,type:t}],group:gid,groupType:gt};
  S.wkt.exs.splice(last.i+1,0,clone);
  persist();renderExBlocks();
}
function _doAddToGroup(name){
  const gid=_addToGroupGid;_addToGroupGid=null;
  const members=_ssMembers(gid);if(!members.length)return;
  const last=members[members.length-1];
  const newEx={name,sets:[{kg:0,reps:5,done:false,type:'N'}],group:gid,groupType:'super'};
  S.wkt.exs.splice(last.i+1,0,newEx);
  persist();renderExBlocks();toast(name+' ajouté à la supersérie','success');
}
function _renderGroupHtml(gid,members){
  const gt=members[0]?.e?.groupType||'super';
  const count=members.length;
  let label,icon,color,connColor,bgColor;
  if(gt==='drop'){
    icon='📉';label='Série Dégressive';color='#BF5AF2';connColor='rgba(191,90,242,.35)';bgColor='rgba(191,90,242,.07)';
  }else if(gt==='pyramid-up'){
    icon='📈';label='Pyramide +';color='var(--green)';connColor='rgba(0,230,118,.3)';bgColor='rgba(0,230,118,.06)';
  }else if(gt==='pyramid-down'){
    icon='📉';label='Pyramide −';color='var(--gold)';connColor='rgba(255,214,0,.3)';bgColor='rgba(255,214,0,.06)';
  }else{
    icon='⚡';label=count===2?'Super Set':count===3?'Tri-set':'Circuit ('+count+')';color='var(--orange)';connColor='rgba(255,109,0,.3)';bgColor='rgba(255,109,0,.07)';
  }

  // ── Progression / tour ───────────────────────────────────────
  let tourInfo='',dotHtml='',bannerHtml='',progressBarHtml='';
  if(gt==='super'){
    const totalTours=Math.max(...members.map(({e})=>e.sets.length),1);
    let completedTours=0;
    for(let t=0;t<totalTours;t++){
      if(members.every(({e})=>e.sets[t]?.done))completedTours=t+1; else break;
    }
    const curTour=Math.min(completedTours+1,totalTours);
    const doneThisTour=members.filter(({e})=>e.sets[completedTours]?.done).length;
    const dotsMax=Math.min(totalTours,10);
    let dots='';
    for(let t=0;t<dotsMax;t++){
      if(t<completedTours)dots+=`<span style="color:#34D399;font-size:7px;line-height:1;">●</span>`;
      else if(t===completedTours)dots+=`<span style="color:${color};font-size:7px;line-height:1;">●</span>`;
      else dots+=`<span style="color:var(--sep);font-size:7px;line-height:1;">●</span>`;
    }
    if(totalTours>10)dots+=`<span style="font-size:9px;color:var(--t3);">+${totalTours-10}</span>`;
    dotHtml=`<div style="display:flex;align-items:center;gap:2px;">${dots}</div>`;
    tourInfo=`<div style="font-size:12px;color:var(--t2);margin-top:2px;">Tour ${curTour} sur ${totalTours} · ${count} exercice${count>1?'s':''}${doneThisTour>0?' · '+doneThisTour+'/'+count+' fait ce tour':''}</div>`;
    const lastName=members[members.length-1].e.name;
    const shortLast=lastName.length>22?lastName.slice(0,20)+'…':lastName;
    bannerHtml=`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:${bgColor};border-top:1px solid ${connColor};border-radius:0 0 10px 10px;">`
      +`<span style="font-size:13px;flex-shrink:0;">⚡</span>`
      +`<span style="font-size:12px;color:var(--t2);line-height:1.4;">Enchaîne les ${count} sans repos — le chrono démarre après <strong style="color:var(--t1);">${shortLast}</strong>.</span>`
      +`</div>`;
    // ── Barre de progression à segments ─────────────────────────
    const nbSegs=Math.min(totalTours,20);
    let segs='';
    for(let t=0;t<nbSegs;t++){
      if(t<completedTours){
        segs+=`<div style="flex:1;height:6px;border-radius:3px;background:#35D08A;"></div>`;
      }else if(t===completedTours){
        const pct=count>0?Math.round(doneThisTour/count*100):0;
        segs+=`<div style="flex:1;height:6px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,.10);">`
          +`<div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#35D08A,var(--red));"></div>`
          +`</div>`;
      }else{
        segs+=`<div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.10);"></div>`;
      }
    }
    progressBarHtml=`<div style="display:flex;gap:3px;padding:5px 10px 4px;background:rgba(255,109,0,.04);">${segs}</div>`;
  }else if(gt==='drop'){
    const doneSteps=members.filter(({e})=>e.sets.some(s=>s.done)).length;
    let dots='';
    members.forEach(({e},i)=>{
      const done=e.sets.some(s=>s.done);
      const isCur=!done&&members.slice(0,i).every(({e:pe})=>pe.sets.some(s=>s.done));
      if(done)dots+=`<span style="color:#34D399;font-size:7px;line-height:1;">●</span>`;
      else if(isCur)dots+=`<span style="color:${color};font-size:7px;line-height:1;">●</span>`;
      else dots+=`<span style="color:var(--sep);font-size:7px;line-height:1;">●</span>`;
    });
    dotHtml=`<div style="display:flex;align-items:center;gap:2px;">${dots}</div>`;
    tourInfo=`<div style="font-size:12px;color:var(--t2);margin-top:2px;">Palier ${Math.min(doneSteps+1,count)} sur ${count}</div>`;
    bannerHtml=`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:${bgColor};border-top:1px solid ${connColor};border-radius:0 0 10px 10px;">`
      +`<span style="font-size:13px;flex-shrink:0;">⬇️</span>`
      +`<span style="font-size:12px;color:var(--t2);line-height:1.4;">Baisse le poids sans repos — le chrono démarre après le <strong style="color:var(--t1);">dernier drop</strong>.</span>`
      +`</div>`;
  }

  const body=members.map(({e,i},pos)=>{
    const conn=pos<members.length-1
      ?`<div style="height:12px;display:flex;align-items:center;padding:0 20px;"><div style="flex:1;border-top:1px dashed ${connColor};"></div><span style="margin:0 6px;font-size:11px;color:${connColor};line-height:1;">↓</span><div style="flex:1;border-top:1px dashed ${connColor};"></div></div>`:`` ;
    return _renderExHtml(i,true,pos,members.length)+conn;
  }).join('');

  const addLabel=gt==='super'?'+ Exo':'+ Step';
  return`<div class="ss-group">`
    +`<div class="ss-grp-hdr">`
    +`<div style="flex:1;min-width:0;">`
    +`<div style="display:flex;align-items:center;gap:6px;">`
    +`<span style="font-size:11px;font-weight:800;color:${color};letter-spacing:.05em;text-transform:uppercase;">${icon} ${label}</span>`
    +dotHtml
    +`</div>`+tourInfo
    +`</div>`
    +`<div style="display:flex;gap:4px;flex-shrink:0;">`
    +`<button class="btn-xs" style="color:${color};font-size:11px;" onclick="addToGroup('${gid}')">${addLabel}</button>`
    +`<button class="btn-xs" style="color:var(--t3);font-size:11px;" onclick="dissolveGroup('${gid}')">Dégrouper</button>`
    +`</div></div>`
    +progressBarHtml
    +`<div style="padding:6px 6px 0;">${body}</div>`
    +bannerHtml
    +`</div>`;
}
function _renderExHtml(ei,inGroup,posInGroup,groupSize){
  if(posInGroup===undefined)posInGroup=0;
  if(groupSize===undefined)groupSize=1;
  const ex=S.wkt.exs[ei];
  const exCount=S.wkt.exs.length;
  const prev=getPrev(ex.name);
  const doneSets=ex.sets.filter(s=>s.done);
  const vol=doneSets.reduce((a,s)=>a+(s.kg||0)*(s.reps||0),0);
  const maxRM=doneSets.filter(s=>s.kg&&s.reps).reduce((b,s)=>Math.max(b,bz(s.kg,s.reps)),0);
  // En mode sélection, tout apparaît replié pour faciliter les taps
  const isExpanded=!_groupMode&&(ei===_expandedEx||exCount===1);
  const isSelected=_groupMode&&_selectedGroupExs.has(ei);
  const nextEi=ex.group?_nextInGroup(ei):null;
  const nextExName=nextEi!==null?S.wkt.exs[nextEi].name:null;

  // Vue réduite
  if(!isExpanded){
    const _dsLbl=ex.dropset?'palier':'série';
    const summary=`${doneSets.length}/${ex.sets.length} ${_dsLbl}${ex.sets.length>1?'s':''}${ex.dropset?' · '+ex.dropset.paliers+'P '+(ex.dropset.direction==='down'?'⬇':'⬆'):''}${vol>0?' · '+Math.round(vol)+'kg':''}${maxRM>0?' · ~'+fmt(maxRM)+'kg 1RM':''}${ex.note?' 💬':''}`;
    const selStyle=isSelected?'box-shadow:inset 0 0 0 2px var(--orange);':(!_groupMode?'opacity:.75':'');
    const clickAttr=_groupMode
      ?` onclick="toggleGroupSelect(${ei})" style="cursor:pointer;${selStyle}"`
      :` onclick="toggleExBlock(${ei})" style="cursor:pointer;${selStyle}"`;
    return`<div class="ex-block${inGroup?(isExpanded?' ss-active':' ss-inactive'):''}" id="ex-block-${ei}"${clickAttr}>`
      +`<div class="ex-hdr" style="pointer-events:${_groupMode||inGroup?'none':'all'}">`
      +`<div style="flex:1;min-width:0;">`
      +`<div class="ex-name" style="font-size:14px">${ex.name} <span style="color:${isSelected?'var(--orange)':'var(--t3)'};font-weight:400;font-size:13px">${_groupMode?(isSelected?'✓':'○'):'▸'}</span></div>`
      +`<div class="ex-meta">${inGroup?_groupStatusMeta(ex,posInGroup,groupSize):(summary||'0 série')}</div>`
      +`</div>`
      +(!_groupMode&&!inGroup?`<div class="ex-hdr-btns" style="pointer-events:auto" onclick="event.stopPropagation()"><button class="btn-xs" style="color:var(--t2);" onclick="openExHistory('${ex.name.replace(/'/g,"\\'")}')">📊</button><button class="btn-xs" style="color:var(--red);transition:opacity .1s,transform .1s;" ontouchstart="_rmHoldStart(this,${ei});event.preventDefault()" ontouchend="_rmHoldEnd(this)" ontouchcancel="_rmHoldEnd(this)" onmousedown="_rmHoldStart(this,${ei})" onmouseup="_rmHoldEnd(this)" onmouseleave="_rmHoldEnd(this)">✕</button></div>`:'')
      +`</div>`
      +(!_groupMode&&!inGroup&&!ex.group&&!ex.dropset
        ?`<div style="display:flex;gap:4px;padding:2px 8px 6px;border-top:1px solid var(--sep);" onclick="event.stopPropagation()">`
          +`<button class="btn-xs" style="font-size:10px;color:var(--orange);border-color:rgba(255,109,0,.2);padding:2px 7px;" onclick="createSupersetFrom(${ei})">⚡ Super</button>`
          +`<button class="btn-xs" style="font-size:10px;color:#BF5AF2;border-color:rgba(191,90,242,.2);padding:2px 7px;" onclick="openDropsetConfig(${ei},'down')">📉 Drop</button>`
          +`<button class="btn-xs" style="font-size:10px;color:var(--green);border-color:rgba(0,230,118,.2);padding:2px 7px;" onclick="openDropsetConfig(${ei},'up')">📈 +%</button>`
          +`</div>`
        :'')
      +`</div>`;
  }

  // Vue développée
  const _exyt=EX_YT[ex.name];const hasLocalGif=!!(_exyt&&_exyt.img);
  const rows=ex.sets.map((set,si)=>{
    const p=prev[si]||prev[Math.max(0,prev.length-1)];
    const liveRM=set.kg&&set.reps?fmt(bz(set.kg,set.reps)):null;
    return`<div id="sr-wrap-${ei}-${si}">`
      +`<div class="set-row${set.done?' done-row':''}" id="sr-${ei}-${si}">`
      +`<div class="snum">${si+1}</div>`
      +`<div class="sprev">${p?`<div>${p.kg}×${p.reps}</div>`:'<div>—</div>'}</div>`
      +`<input class="sinp" type="number" value="${set.kg||''}" placeholder="${p?p.kg:''}" inputmode="decimal" step="0.5" enterkeyhint="next" onchange="upSet(${ei},${si},'kg',this.value)" oninput="_onKgInput(this,${ei},${si})" onfocus="this.select();clearTimeout(_afTimer)" onkeydown="if(event.key==='Enter'){event.preventDefault();clearTimeout(_afTimer);const n=this.nextElementSibling;n.focus();n.select&&n.select();}">`
      +`<input class="sinp" type="number" value="${set.reps||''}" placeholder="${p?p.reps:''}" inputmode="numeric" step="1" enterkeyhint="done" onchange="upSet(${ei},${si},'reps',this.value)" oninput="updateRMLive(${ei},${si})" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();confirmSetAndNext(${ei},${si});}">`
      +`<button class="tbtn ${set.type||'N'}" onclick="cycleType(${ei},${si})" title="${SET_TYPE_LABELS[set.type]||'Normal'}" id="tbtn-${ei}-${si}"><span style="line-height:1">${set.type&&set.type!=='N'?set.type:''}</span><span class="tbtn-rm" id="trm-${ei}-${si}">${set.done&&set.rm1?'~'+fmt(set.rm1):liveRM?'~'+liveRM:''}</span></button>`
      +`<button class="chk${set.done?' done':''}" onclick="toggleSet(${ei},${si})">${set.done?'✓':''}</button>`
      +`</div></div>`;
  }).join('');

  // ─── Override rendu si dropset actif ───────────────────────────────────────
  let useSetsHdr,useRows,useDropBanner='';
  if(ex.dropset){
    const {pct,direction}=ex.dropset;
    const isDown=direction==='down';
    const curPi=ex.sets.findIndex(s=>!s.done);
    useSetsHdr=`<div class="sets-hdr"><span>#</span><span>Palier</span><span>KG</span><span>Reps</span><span></span><span>✓</span></div>`;
    useRows=ex.sets.map((set,si)=>{
      const isDone=set.done;
      const isCur=!isDone&&si===curPi;
      const label=si===0?'Charge de départ':(isDown?`Drop −${pct}%`:`+${pct}%`);
      const isLast=si===ex.sets.length-1;
      const p=prev[si]||prev[Math.max(0,prev.length-1)];
      if(isCur){
        return`<div id="sr-wrap-${ei}-${si}"><div class="set-row" id="sr-${ei}-${si}" style="background:rgba(255,109,0,.06);">`
          +`<div class="snum" style="color:var(--orange);font-weight:900;">${si+1}</div>`
          +`<div style="font-size:10px;color:var(--orange);font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div>`
          +`<input class="sinp" type="number" value="${set.kg||''}" placeholder="${p?p.kg:''}" inputmode="decimal" step="0.5" onchange="upSet(${ei},${si},'kg',this.value)" oninput="_onKgInput(this,${ei},${si})" onfocus="this.select();clearTimeout(_afTimer)">`
          +`<input class="sinp" type="number" value="${set.reps||''}" placeholder="${p?p.reps:''}" inputmode="numeric" step="1" onchange="upSet(${ei},${si},'reps',this.value)" onfocus="this.select()">`
          +`<div></div>`
          +`<button class="chk" onclick="toggleSet(${ei},${si})"></button>`
          +`</div></div>`;
      }else{
        return`<div id="sr-wrap-${ei}-${si}"><div class="set-row${isDone?' done-row':''}" id="sr-${ei}-${si}" style="${!isDone?'opacity:.55;':''}">`
          +`<div class="snum">${si+1}</div>`
          +`<div style="font-size:10px;color:${isDone?'#34D399':'var(--t3)'};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div>`
          +`<div style="text-align:center;font-size:14px;font-weight:700;color:${isDone?'var(--t1)':'var(--t3)'};">${set.kg||'—'}</div>`
          +`<div style="text-align:center;font-size:13px;color:${isDone?'var(--t2)':'var(--t3)'};">${set.reps||'?'}</div>`
          +`<div></div>`
          +`<div style="text-align:center;font-size:${isDone?'14':'10'}px;color:${isDone?'#34D399':'var(--t3)'};">${isDone?'✓':(isLast?'repos':'')}</div>`
          +`</div></div>`;
      }
    }).join('');
    useDropBanner=`<div style="display:flex;align-items:flex-start;gap:6px;padding:8px 10px;background:${isDown?'rgba(191,90,242,.07)':'rgba(0,230,118,.06)'};border-top:1px solid ${isDown?'rgba(191,90,242,.18)':'rgba(0,230,118,.18)'};">`
      +`<span style="font-size:12px;flex-shrink:0;">${isDown?'⬇️':'⬆️'}</span>`
      +`<span style="font-size:11px;color:var(--t2);line-height:1.4;">${isDown?'Baisse le poids sans repos — repos unique après le dernier drop.':'Monte le poids — repos normal entre les séries.'}</span>`
      +`</div>`;
  }else{
    useSetsHdr=`<div class="sets-hdr"><span>#</span><span>Précédent</span><span>KG</span><span>Reps</span><span>Type</span><span>✓</span></div>`;
    useRows=rows;
  }

  // Bandeau "Suite" pour les exos dans un groupe
  const gt=ex.groupType||'super';
  const suiteColor=gt==='drop'?'#BF5AF2':gt==='pyramid-up'?'var(--green)':gt==='pyramid-down'?'var(--gold)':'var(--orange)';
  const suiteIcon=gt==='drop'?'📉':gt==='pyramid-up'?'📈':'→';
  const isLastInSuper=ex.group&&gt==='super'&&nextEi===null;
  const loopTgt=isLastInSuper?_firstUndoneMember(ex.group):null;
  const hasLoop=loopTgt!==null&&loopTgt!==ei;
  const suiteText=nextExName?`${suiteIcon} ${nextExName.length>24?nextExName.slice(0,22)+'…':nextExName}`:hasLoop?'↩ Tour suivant ⏱️':null;
  const suiteBanner=(ex.group&&suiteText)
    ?`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px 2px;font-size:12px;font-weight:700;color:${suiteColor};">`
     +`<span>${suiteText}</span>`
     +`</div>`:`` ;

  return`<div class="ex-block${inGroup?' ss-active':''}" id="ex-block-${ei}">`
    +`<div class="ex-hdr">`
    +`${hasLocalGif?'<img src="'+_exyt.img+'" onclick="toggleExGif('+ei+',\''+ex.name.replace(/'/g,"\\'")+'\');event.stopPropagation()" style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0;cursor:pointer;border:1px solid var(--sep);" loading="lazy">':''}`
    +`<div style="flex:1;min-width:0;">`
    +`<div class="ex-name">${ex.name} <span style="color:var(--t3);font-weight:400;font-size:13px">▾</span></div>`
    +``
    +`<div class="ex-meta">${doneSets.length}/${ex.sets.length} ${ex.dropset?'palier':'série'}${ex.sets.length>1?'s':''}${ex.dropset?' · '+(ex.dropset.direction==='down'?'⬇':'⬆')+ex.dropset.pct+'%':''}${vol>0?' · '+Math.round(vol)+'kg':''}${maxRM>0?' · 1RM ~'+fmt(maxRM)+'kg':''}</div>`
    +`</div>`
    +`<div style="pointer-events:auto;flex-shrink:0;" onclick="event.stopPropagation()">`
    +`<button onclick="openExMenu(${ei},${hasLocalGif})" style="width:34px;height:34px;border-radius:10px;background:var(--bg3);border:1px solid var(--sep);font-size:18px;color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;letter-spacing:2px;line-height:1;">⋯</button>`
    +`</div></div>`
    +`<div id="ex-gif-${ei}" style="display:none;" data-open="0" data-loaded="0"></div>`
    +useSetsHdr
    +useRows
    +suiteBanner+useDropBanner
    +(()=>{
      const footBtn=ex.dropset
        ?`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="openDropsetConfig(${ei},'${ex.dropset.direction}')">⚙️ Modifier paliers</button>`
        :`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="addSet(${ei})">+ Série</button>${ex.sets.length>1?`<button class="btn-xs" style="color:var(--t3);transition:opacity .1s,transform .1s;" ontouchstart="_rmSetHoldStart(this,${ei});event.preventDefault()" ontouchend="_rmSetHoldEnd(this)" ontouchcancel="_rmSetHoldEnd(this)" onmousedown="_rmSetHoldStart(this,${ei})" onmouseup="_rmSetHoldEnd(this)" onmouseleave="_rmSetHoldEnd(this)">−</button>`:''}`;
      return`<div class="ex-foot">${footBtn}</div>`;
    })()
    +`<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 8px 6px;border-top:1px solid var(--sep);" onclick="event.stopPropagation()">`
    +`<span style="font-size:14px;color:var(--t3);padding-top:5px;flex-shrink:0;">💬</span>`
    +`<textarea id="ex-note-${ei}" rows="1" placeholder="Note perso (trop léger, fatigue, douleur…)" oninput="saveExNote(${ei},this.value);this.style.height='auto';this.style.height=this.scrollHeight+'px'" style="flex:1;resize:none;overflow:hidden;border:none;background:transparent;color:var(--t2);font-size:12px;font-family:inherit;padding:4px 2px;line-height:1.4;min-height:26px;outline:none;caret-color:var(--red);">${(ex.note||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>`
    +`</div>`
    +(!inGroup?(ex.dropset
      ?`<div style="display:flex;gap:5px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--t3);border-color:var(--sep);padding:3px 8px;" onclick="removeDropset(${ei})">✕ Retirer dropset</button>`
        +`</div>`
      :`<div style="display:flex;gap:5px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--orange);border-color:rgba(255,109,0,.3);padding:3px 8px;" onclick="createSupersetFrom(${ei})">⚡ Super</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:#BF5AF2;border-color:rgba(191,90,242,.3);padding:3px 8px;" onclick="openDropsetConfig(${ei},'down')">📉 Drop</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--green);border-color:rgba(0,230,118,.3);padding:3px 8px;" onclick="openDropsetConfig(${ei},'up')">📈 +%</button>`
        +`</div>`)
      :`<div style="display:flex;align-items:center;gap:4px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:11px;padding:3px 7px;${posInGroup===0?'opacity:.3;':''}" onclick="if(${posInGroup}>0)moveInGroup(${ei},-1)">↑</button>`
        +`<button class="btn-xs" style="font-size:11px;padding:3px 7px;${posInGroup===groupSize-1?'opacity:.3;':''}" onclick="if(${posInGroup}<${groupSize-1})moveInGroup(${ei},1)">↓</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--t3);padding:3px 8px;" onclick="removeFromGroup(${ei})">↩ Retirer</button>`
        +`</div>`)
    +`</div>`;
}
// ─── HISTORIQUE EXERCICE ─────────────────────────────────────
function _getExHistory(name,n){
  const out=[];
  for(const sess of S.sessions){
    const ex=(sess.exs||sess.exercises||[]).find(e=>e.name===name);
    if(!ex)continue;
    const done=(ex.sets||[]).filter(s=>s.done!==false&&(s.kg||0)>0);
    if(!done.length)continue;
    out.push({date:sess.date||'',kg:Math.max(...done.map(s=>s.kg||0))});
    if(out.length>=n)break;
  }
  return out.reverse();
}
function _buildExHistChart(data){
  const W=320,H=110,PX=24,PT=22,PB=20;
  const kgs=data.map(d=>d.kg);
  const lo=Math.min(...kgs),hi=Math.max(...kgs);
  const range=hi===lo?Math.max(hi*0.1,5):hi-lo;
  const loAdj=hi===lo?lo-range/2:lo;
  const n=data.length;
  const px=i=>PX+(n>1?i*(W-2*PX)/(n-1):W/2-PX);
  const py=k=>PT+(1-(k-loAdj)/range)*(H-PT-PB);
  let s=`<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible;">`;
  if(n>1){
    const area=`M${px(0)},${py(data[0].kg)} `+data.slice(1).map((d,i)=>`L${px(i+1)},${py(d.kg)}`).join(' ')+` L${px(n-1)},${H-PB} L${px(0)},${H-PB} Z`;
    s+=`<path d="${area}" fill="rgba(255,45,85,.08)"/>`;
    const line=data.map((d,i)=>`${i===0?'M':'L'}${px(i)},${py(d.kg)}`).join(' ');
    s+=`<path d="${line}" fill="none" stroke="var(--red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  data.forEach((d,i)=>{
    const cx=px(i),cy=py(d.kg);
    s+=`<circle cx="${cx}" cy="${cy}" r="4" fill="var(--red)" stroke="var(--bg2)" stroke-width="2"/>`;
    const above=cy>PT+16;
    s+=`<text x="${cx}" y="${above?cy-9:cy+16}" text-anchor="middle" font-size="11" fill="var(--t1)" font-weight="700" font-family="system-ui,sans-serif">${d.kg}kg</text>`;
    const dl=d.date?d.date.split('-').slice(1).reverse().join('/'):'';
    s+=`<text x="${cx}" y="${H-3}" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="system-ui,sans-serif">${dl}</text>`;
  });
  return s+'</svg>';
}
// ─── MENU CONTEXTUEL EXERCICE (⋯) ────────────────────────────────────────────
let _exMenuCtx=null;
function openExMenu(ei,hasGif){
  const ex=S.wkt.exs[ei];if(!ex)return;
  _exMenuCtx={ei,nm:ex.name,hasGif:!!hasGif};
  let ov=document.getElementById('ov-ex-menu');
  if(!ov){
    ov=document.createElement('div');ov.className='overlay';ov.id='ov-ex-menu';
    ov.style.alignItems='flex-end';
    ov.onclick=e=>{if(e.target===ov)closeExMenu();};
    document.body.appendChild(ov);
  }
  const {nm}=_exMenuCtx;
  const safeNm=nm.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const mRow=(icon,lbl,action)=>`<button onclick="${action}" style="display:flex;align-items:center;gap:14px;width:100%;padding:13px 18px;background:none;border:none;border-top:1px solid var(--sep);text-align:left;cursor:pointer;touch-action:manipulation;">`
    +`<span style="font-size:19px;width:26px;text-align:center;flex-shrink:0;">${icon}</span>`
    +`<span style="font-size:15px;color:var(--t1);font-weight:500;">${lbl}</span>`
    +`</button>`;
  ov.innerHTML=`<div style="width:100%;max-width:430px;background:var(--bg2);border-radius:16px 16px 0 0;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 30px rgba(0,0,0,.5);">`
    +`<div style="text-align:center;font-size:13px;font-weight:600;color:var(--t2);padding:13px 16px 11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid var(--sep);">${nm}</div>`
    +(hasGif?mRow('🎬','Vidéo / Animation',`closeExMenu();toggleExGif(${ei},'${safeNm}')`):'')
    +mRow('📊','Statistiques',`closeExMenu();openExHistory('${safeNm}')`)
    +mRow('ℹ️','Types de série','closeExMenu();openTypeHelp()')
    +`<button ontouchstart="_rmHoldStart(this,${ei});event.preventDefault()" ontouchmove="event.preventDefault()" ontouchend="_rmHoldEnd(this)" ontouchcancel="_rmHoldEnd(this)" onmousedown="_rmHoldStart(this,${ei})" onmouseup="_rmHoldEnd(this)" onmouseleave="_rmHoldEnd(this)" style="display:flex;align-items:center;gap:14px;width:100%;padding:13px 18px;background:none;border:none;border-top:1px solid var(--sep);text-align:left;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;">`
    +`<span style="font-size:19px;width:26px;text-align:center;flex-shrink:0;">🗑️</span>`
    +`<div style="flex:1;"><div style="font-size:15px;color:var(--red);font-weight:500;">Supprimer l'exercice</div><div style="font-size:11px;color:var(--t3);margin-top:2px;">Maintenir appuyé pour confirmer</div></div>`
    +`</button>`
    +`<button onclick="closeExMenu()" style="display:flex;align-items:center;justify-content:center;width:calc(100% - 32px);margin:10px 16px 0;padding:12px;border-radius:12px;background:var(--bg3);border:none;font-size:15px;font-weight:700;color:var(--t2);cursor:pointer;touch-action:manipulation;">Annuler</button>`
    +`</div>`;
  ov.classList.add('open');
}
function closeExMenu(){const ov=document.getElementById('ov-ex-menu');if(ov)ov.classList.remove('open');}

function openExHistory(name){
  const data=_getExHistory(name,5);
  let el=document.getElementById('ov-ex-hist');
  if(!el){
    el=document.createElement('div');el.className='overlay';el.id='ov-ex-hist';
    el.style.alignItems='flex-end';
    el.onclick=e=>{if(e.target===el)closeExHistory();};
    document.body.appendChild(el);
  }
  const inner=data.length>=2?_buildExHistChart(data)
    :`<div style="text-align:center;padding:20px 0;color:var(--t3);font-size:13px;">Pas encore assez d'historique —<br>reviens après 2 séances !</div>`;
  el.innerHTML=`<div style="width:100%;max-width:430px;background:var(--bg2);border-radius:16px 16px 0 0;padding:16px 16px 18px;box-shadow:0 -4px 30px rgba(0,0,0,.5);">`
    +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">`
    +`<div style="font-weight:800;font-size:15px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80%;">${name}</div>`
    +`<button onclick="closeExHistory()" style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:none;font-size:15px;color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">✕</button>`
    +`</div>${inner}`
    +`<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:6px;">Poids max · 5 dernières séances</div>`
    +`</div>`;
  el.classList.add('open');
}
function closeExHistory(){const el=document.getElementById('ov-ex-hist');if(el)el.classList.remove('open');}

function renderExBlocks(){
  const c=document.getElementById('wkt-exs');
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){
    c.innerHTML=`<div class="empty">Appuie sur "+ Ajouter un exercice"<br>pour démarrer ta séance 💪</div>`;
    _syncLogHdrBtns();return;
  }
  const exCount=S.wkt.exs.length;
  if(_expandedEx===null||_expandedEx>=exCount)_expandedEx=exCount-1;

  // Construire l'ordre de rendu (groupes = un seul bloc)
  const seen=new Set();
  const parts=[];
  S.wkt.exs.forEach((ex,ei)=>{
    if(seen.has(ei))return;
    if(ex.group && ex.groupType==='super'){
      const members=_ssMembers(ex.group);
      members.forEach(({i})=>seen.add(i));
      parts.push({type:'group',gid:ex.group,members});
    }else{seen.add(ei);parts.push({type:'single',ei});}
  });

  // Barre de contrôle
  const selCount=_selectedGroupExs.size;
  let topBar='';
  if(_groupMode){
    topBar=`<div style="display:flex;gap:8px;padding:0 0 10px;">`
      +`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="toggleGroupMode()">Annuler</button>`
      +(selCount>=2
        ?`<button class="btn btn-sm ft-press" style="flex:2;background:var(--orange);border-color:var(--orange);color:#fff;" onclick="createSuperset()">⚡ Lier en supersérie (${selCount})</button>`
        :`<button class="btn btn-bg2 btn-sm" style="flex:2;opacity:.45;" disabled>Sélectionne 2+ exos</button>`)
      +`</div>`;
  } else if(exCount>=2){
    topBar=`<div style="display:flex;justify-content:flex-end;margin-bottom:6px;">`
      +`<button class="btn-xs" style="color:var(--orange);border-color:rgba(255,109,0,.4);font-size:12px;padding:4px 10px;" onclick="toggleGroupMode()">⚡ Grouper</button>`
      +`</div>`;
  }

  c.innerHTML=topBar+parts.map(part=>{
    if(part.type==='single') return _renderExHtml(part.ei,false);
    return _renderGroupHtml(part.gid,part.members);
  }).join('');
  renderLogFinish();
  _syncLogHdrBtns();
}
function getPrev(name){
  for(const s of S.sessions){
    const ex=(s.exs||s.exercises||[]).find(e=>e.name===name);
    if(ex){const sets=(ex.sets||[]).filter(s=>s.done!==false);if(sets.length)return sets;}
  }return[];
}
function upSet(ei,si,f,v){const s=S.wkt.exs[ei].sets[si];s[f]=parseFloat(v)||0;if(s.kg&&s.reps)s.rm1=bz(s.kg,s.reps);persist();}
function toggleSet(ei,si){
  const set=S.wkt.exs[ei].sets[si];
  const row=document.getElementById(`sr-${ei}-${si}`);
  if(row){const inps=row.querySelectorAll('.sinp');if(!set.kg&&inps[0])set.kg=parseFloat(inps[0].value||inps[0].placeholder)||0;if(!set.reps&&inps[1])set.reps=parseInt(inps[1].value||inps[1].placeholder)||0;}
  set.done=!set.done;if(set.kg&&set.reps)set.rm1=bz(set.kg,set.reps);persist();
  if(set.done){
    const exName=S.wkt.exs[ei].name;
    const isAbdo=EXLIB.some(e=>e.n===exName&&e.g==='Abdominaux');
    const savedPref=(S.exRestPref||{})[exName];
    const defForEx=isAbdo?30:(savedPref||90);
    const restByType={N:defForEx,É:45,X:240,W:45,E:240};
    const restLabels={É:'Échauffement',X:'Récup. à l\'échec',W:'Échauffement',E:'Récup. à l\'échec'};
    const lbl=document.getElementById('rest-label');
    if(lbl)lbl.textContent=restLabels[set.type]||(isAbdo?'Abdos':'');
    _restStep=isAbdo?5:15;
    _restEx=isAbdo?null:exName;
    const mb=document.getElementById('rest-btn-minus');const pb=document.getElementById('rest-btn-plus');
    if(mb)mb.textContent=`−${_restStep}s`;if(pb)pb.textContent=`+${_restStep}s`;
    const sec=restByType[set.type]||defForEx;
    // ─── Dropset : avance entre paliers ─────────────────────────────────────
    if(S.wkt.exs[ei].dropset){
      const ds=S.wkt.exs[ei].dropset;
      if(ds.direction==='down'){
        // Pas de repos entre paliers : on passe direct au suivant
        const nextSi=S.wkt.exs[ei].sets.findIndex((s,i)=>i>si&&!s.done);
        if(nextSi!==-1){
          if(navigator.vibrate)navigator.vibrate([30]);
          renderExBlocks();
          setTimeout(()=>{const row=document.getElementById(`sr-${ei}-${nextSi}`);const inp=row&&row.querySelector('.sinp');if(inp){inp.focus();inp.select&&inp.select();}},100);
          return;
        }
        // Dernier palier → repos
        if(lbl)lbl.textContent='📉 Série dégressive terminée';
        startRest(sec);
        if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
        if(navigator.vibrate)navigator.vibrate([50]);
        renderExBlocks();return;
      }
      // Pyramide ↑ : repos normal (fall-through vers logique standard ci-dessous)
    }
    // Groupe (super set)
    const groupType=S.wkt.exs[ei].groupType||'super';
    const _ssNext=_nextInGroup(ei);
    const _scrollTo=idx=>setTimeout(()=>{const el=document.getElementById('ex-block-'+idx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},60);
    if(_ssNext!==null){
      if(navigator.vibrate)navigator.vibrate([30]);
      // Pre-fill poids suivant pour drop/pyramide
      if(groupType!=='super'){
        const lastKg=S.wkt.exs[ei].sets.filter(s=>s.done).slice(-1)[0]?.kg||0;
        if(lastKg&&S.wkt.exs[_ssNext]){
          const factor=groupType==='pyramid-up'?1.1:0.9;
          const newKg=_roundToGym(lastKg*factor);
          S.wkt.exs[_ssNext].sets.forEach(s=>{if(!s.done)s.kg=newKg;});
          persist();
        }
      }
      if(groupType==='super'||groupType==='drop'){
        // Avance immédiate sans repos (super : tour suivant, drop : palier suivant)
        _expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;
      }
      // Pyramide : repos + auto-avance
      _restDoneCb=()=>{_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);};
      startRest(sec);
      const lbl=document.getElementById('rest-label');
      if(lbl)lbl.textContent=groupType==='pyramid-up'?'📈 Pyramide +':'📉 Pyramide −';
      if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
      if(navigator.vibrate)navigator.vibrate([50]);
      return;
    } else if(groupType==='drop'&&S.wkt.exs[ei].group){
      // Dernier palier : repos complet
      const lbl=document.getElementById('rest-label');
      if(lbl)lbl.textContent='📉 Série dégressive terminée';
    } else if(groupType==='super'&&S.wkt.exs[ei].group){
      // Dernier exo du tour → retour au 1er exercice du groupe pour le tour suivant
      const gMembers=_ssMembers(S.wkt.exs[ei].group);
      const firstIdx=gMembers[0]?.i??null;
      const hasMore=gMembers.some(({e})=>e.sets.some(s=>!s.done));
      if(firstIdx!==null&&hasMore){
        if(navigator.vibrate)navigator.vibrate([30]);
        _expandedEx=firstIdx;renderExBlocks();
        setTimeout(()=>{const el=document.getElementById('ex-block-'+firstIdx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},80);
        _restDoneCb=()=>{const el=document.getElementById('ex-block-'+firstIdx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
        startRest(sec);
        if(lbl)lbl.textContent='⚡ Tour suivant';
        if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
        if(navigator.vibrate)navigator.vibrate([50]);
        return;
      }
      // Tous les sets du groupe terminés → repos normal sans auto-avance
    }
    startRest(sec);
    if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
    if(navigator.vibrate)navigator.vibrate([50]);
  }
  renderExBlocks();
}
function cycleType(ei,si){
  const s=S.wkt.exs[ei].sets[si];
  const cur=SET_TYPES.indexOf(s.type);
  s.type=SET_TYPES[(cur===-1?0:cur+1)%SET_TYPES.length];
  toast(SET_TYPE_LABELS[s.type],'info');persist();renderExBlocks();
}
function openTypeHelp(){document.getElementById('ov-type-help').classList.add('open');}
function closeTypeHelp(){document.getElementById('ov-type-help').classList.remove('open');}
let _confirmCb=null,_confirmAltCb=null;
function showConfirm(title,msg,cb,okLabel,altLabel,altCb){
  document.getElementById('confirm-title').textContent=title;
  document.getElementById('confirm-msg').textContent=msg;
  _confirmCb=cb;_confirmAltCb=altCb||null;
  document.getElementById('confirm-ok').textContent=okLabel||'Supprimer';
  document.getElementById('confirm-cancel').textContent=altLabel||'Annuler';
  document.getElementById('ov-confirm').classList.add('open');
}
function closeConfirm(){document.getElementById('ov-confirm').classList.remove('open');_confirmCb=null;_confirmAltCb=null;document.getElementById('confirm-ok').textContent='Supprimer';document.getElementById('confirm-cancel').textContent='Annuler';}
function confirmOk(){const cb=_confirmCb;closeConfirm();if(cb)cb();}
function confirmCancel(){const cb=_confirmAltCb;closeConfirm();if(cb)cb();}
// Fuzzy matching pour la détection de doublons d'exercices
function _normEx(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();}
function _lev(a,b){if(a===b)return 0;const la=a.length,lb=b.length;if(!la)return lb;if(!lb)return la;let row=[...Array(lb+1).keys()];for(let i=1;i<=la;i++){let prev=row[0];row[0]=i;for(let j=1;j<=lb;j++){const t=row[j];row[j]=a[i-1]===b[j-1]?prev:1+Math.min(prev,row[j],row[j-1]);prev=t;}}return row[lb];}
function _findSimilar(name,all){const na=_normEx(name);let best=null,bestD=Infinity;all.forEach(ex=>{const nb=_normEx(ex.n);if(nb===na){best=ex.n;bestD=0;return;}const minL=Math.min(na.length,nb.length);if(minL<5)return;const d=_lev(na,nb);if(d<=1&&d<bestD){best=ex.n;bestD=d;}});return best;}
// Valide le set et focus automatiquement le kg du prochain set non-done
function confirmSetAndNext(ei,si){
  toggleSet(ei,si);
  const exs=S.wkt.exs;
  for(let e=ei;e<exs.length;e++){
    for(let s=(e===ei?si+1:0);s<exs[e].sets.length;s++){
      if(!exs[e].sets[s].done){
        const row=document.getElementById(`sr-${e}-${s}`);
        const inp=row&&row.querySelector('.sinp');
        if(inp){inp.focus();inp.select&&inp.select();}
        return;
      }
    }
  }
}
// Enchaîne la touche Entrée entre une liste d'inputs
function chainInputs(ids,lastFn){
  ids.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el)return;
    const isLast=i===ids.length-1;
    el.setAttribute('enterkeyhint',isLast?'done':'next');
    el.onkeydown=(e)=>{
      if(e.key!=='Enter')return;
      e.preventDefault();
      if(!isLast){const n=document.getElementById(ids[i+1]);if(n){n.focus();if(n.select)n.select();}}
      else if(lastFn)lastFn();
    };
  });
}
function addSet(ei){const ex=S.wkt.exs[ei];const l=ex.sets[ex.sets.length-1];ex.sets.push({kg:l?l.kg:0,reps:l?l.reps:5,type:'N',done:false,rm1:0});persist();renderExBlocks();}
function rmLastSet(ei){const ex=S.wkt.exs[ei];if(ex.sets.length>1){ex.sets.pop();persist();renderExBlocks();}}
function rmEx(ei){
  closeExMenu();
  const name=S.wkt.exs[ei]&&S.wkt.exs[ei].name||'cet exercice';
  showConfirm('Supprimer l\'exercice ?',`"${name}" et toutes ses séries seront supprimés de la séance.`,()=>{
    const gid=S.wkt.exs[ei]&&S.wkt.exs[ei].group;
    if(gid){const rem=S.wkt.exs.filter((e,i)=>i!==ei&&e.group===gid);if(rem.length<=1)rem.forEach(e=>delete e.group);}
    S.wkt.exs.splice(ei,1);
    if(ei<_expandedEx)_expandedEx--;
    else if(_expandedEx>=S.wkt.exs.length)_expandedEx=Math.max(0,S.wkt.exs.length-1);
    persist();renderExBlocks();
  });
}
function clearWkt(){
  showConfirm('Annuler la séance ?','Tous les exercices et séries en cours seront perdus.',()=>{
    stopRest();
    S.wkt=null;
    try{localStorage.setItem('ft4_wkt','null');localStorage.removeItem('ft4_wkt_draft');}catch(e){}
    persist();
    renderLog();
    toast('Séance annulée','info');
  });
}
// Sync boutons ✕/Changer dans l'en-tête + repositionne le FAB
// Appellé à chaque renderExBlocks() pour rester cohérent sans passer par renderLog() entier
function _syncLogHdrBtns(){
  const el=document.getElementById('log-hdr-btns');
  if(!el)return;
  const hasExs=!!(S.wkt&&S.wkt.exs&&S.wkt.exs.length);
  el.innerHTML=hasExs
    ?'<button onclick="clearWkt()" style="padding:7px 11px;border-radius:10px;border:1px solid rgba(255,45,85,.3);background:rgba(255,45,85,.08);color:var(--red);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">✕</button>'
     +'<button onclick="openProgModal()" style="padding:8px 12px;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">📋 Changer</button>'
    :'';
  requestAnimationFrame(_positionFab);
}
// Appui maintenu 400ms requis pour déclencher la suppression (anti-effleurement)
let _rmHoldTimer=null;
function _rmHoldStart(btn,ei){
  _rmHoldTimer=setTimeout(()=>{_rmHoldTimer=null;btn.style.opacity='';btn.style.transform='';rmEx(ei);},400);
  btn.style.opacity='0.4';
  btn.style.transform='scale(0.88)';
}
function _rmHoldEnd(btn){
  if(_rmHoldTimer){clearTimeout(_rmHoldTimer);_rmHoldTimer=null;}
  btn.style.opacity='';btn.style.transform='';
}
let _rmSetHoldTimer=null;
function _rmSetHoldStart(btn,ei){
  _rmSetHoldTimer=setTimeout(()=>{_rmSetHoldTimer=null;btn.style.opacity='';btn.style.transform='';rmLastSet(ei);},400);
  btn.style.opacity='0.4';btn.style.transform='scale(0.88)';
}
function _rmSetHoldEnd(btn){
  if(_rmSetHoldTimer){clearTimeout(_rmSetHoldTimer);_rmSetHoldTimer=null;}
  btn.style.opacity='';btn.style.transform='';
}
let _expandedEx=null;
let _groupMode=false;let _selectedGroupExs=new Set();
let _exPickerMode='workout';
let _editProgIdx=-1,_editProgData=null,_editDayIdx=0;
function addExercise(name){
  if(_exPickerMode==='prog'){
    closeExPicker();
    _addExToProgEdit(name);
    _exPickerMode='workout';
    return;
  }
  if(_exPickerMode==='addToGroup'){
    closeExPicker();
    _doAddToGroup(name);
    _exPickerMode='workout';
    return;
  }
  if(!S.wkt)S.wkt={date:today(),exs:[]};
  const prev=getPrev(name);
  const sets=[0,1,2].map((_,i)=>({kg:prev.length?prev[0].kg:0,reps:prev.length?prev[0].reps:5,type:i===0&&prev.length?'É':'N',done:false,rm1:0}));
  S.wkt.exs.push({name,sets});
  _expandedEx=S.wkt.exs.length-1;
  persist();closeExPicker();renderExBlocks();
  setTimeout(()=>{const el=document.getElementById('ex-block-'+_expandedEx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},80);
  toast(name+' ajouté !','info');
}
function toggleExBlock(ei){
  _expandedEx=(_expandedEx===ei)?ei:ei;
  _expandedEx=ei;
  renderExBlocks();
  // Scroll vers le bloc ouvert
  setTimeout(()=>{const el=document.getElementById('ex-block-'+ei);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'});},80);
}
// ─── MUSCLE MAP ──────────────────────────────────────────────
// ⚠️ Les noms sont NORMALISÉS (accents retirés + minuscules) via _naz() dans _mscScores
// AVANT d'être testés ici. Donc TOUS les motifs ci-dessous doivent être SANS accent
// (developpe, ecarte, epaule, elevation, trapeze, releve…). Ne jamais remettre d'accent ici.
// Ordre important : premier motif qui matche gagne (break). Les mollets passent AVANT
// la presse (sinon « extension mollets sur presse » serait rangé en cuisses).
const _MEX=[
  // Mollets EN PREMIER (avant la presse, pour ne pas capter « presse mollets »)
  {re:/mollet|calf raise|talon|standing calf|extension mollet/i,                p:['calves'],                           s:[]},
  // Pectoraux — couché / chest press / peck deck / butterfly
  {re:/developpe couche|bench press|chest press|ecarte couche|pec dec|peck deck|butterfly/i, p:['pec'],                  s:['front-delt','triceps'],             i:['lats','biceps','abs','lower-back']},
  // Pectoraux — incliné (variantes d'écriture)
  {re:/developpe incline|incline bench|incline press|incline halter|chest incline/i, p:['pec'],                          s:['front-delt','triceps']},
  // Pectoraux — décliné (variantes d'écriture)
  {re:/developpe decline|decline barre|decline halter|chest decline|chest press decline/i, p:['pec'],                    s:['front-delt','triceps']},
  // Pectoraux — écartés / fly
  {re:/ecarte incline|cable fly|\bfly\b|pec deck/i,                             p:['pec'],                              s:['front-delt']},
  // Épaules — développé / press épaules
  {re:/developpe militaire|overhead press|press militaire|ohp|presse epaule|developpe epaule|epaules machine/i, p:['front-delt','side-delt','triceps'], s:['traps']},
  // Épaules — élévation frontale (front delt en priorité)
  {re:/elevation frontale|front raise|elevations frontales/i,                   p:['front-delt'],                       s:['side-delt']},
  // Épaules — latéral / arrière / oiseau / écarté inverse / around the world
  {re:/elevation laterale|lateral raise|face pull|rear delt|oiseau|ecarte inverse|reverse fly|around the world/i, p:['side-delt','rear-delt'], s:['front-delt','traps']},
  // Dos — verticaux / tractions
  {re:/traction|pull.?up|chin.?up|tirage vertical|lat pulldown|tirage poulie haute/i, p:['lats','biceps'],             s:['traps','rear-delt','forearms']},
  // Dos — rowings / tirages horizontaux / bûcheron
  {re:/rowing|row barre|\brow\b|t.?bar|tirage horizontal|tirage bucheron|bucheron/i, p:['lats','traps','rear-delt'],   s:['biceps','lower-back','forearms']},
  // Dos — bras tendu / pull-over
  {re:/bras tendu|straight.?arm|pull.?over/i,                                   p:['lats'],                             s:['triceps','pec']},
  // Biceps
  {re:/curl bicep|bicep curl|curl halter|preacher|curl marteau|hammer curl|curl biceps/i, p:['biceps'],                s:['forearms']},
  // Triceps
  {re:/tricep|skull crusher|extension tricep|barre front/i,                     p:['triceps'],                          s:['front-delt']},
  // Abducteurs / adducteurs (fessiers/hanche) — remplace l'ancien mapping erroné
  {re:/abducteur|abduction/i,                                                   p:['glutes'],                           s:[]},
  {re:/adducteur|adduction/i,                                                   p:['glutes'],                           s:['quads']},
  // Jambes — presse (toutes variantes fr/en)
  {re:/leg press|presse cuisse|press jambe|presse jambe|presse horizontale|presse verticale/i, p:['quads','glutes'],   s:['hamstrings','calves']},
  // Jambes — squats (couvre hack/belt/bulgare/sauté/poulie)
  {re:/squat/i,                                                                 p:['quads','glutes'],                   s:['hamstrings','calves','lower-back']},
  // Jambes — fentes
  {re:/fente|lunge|split squat/i,                                               p:['quads','glutes'],                   s:['hamstrings']},
  // Jambes — leg extension (quadriceps)
  {re:/leg extension|extension quadricep|extensions? de jambe/i,                p:['quads'],                            s:[]},
  // Ischios — leg curl / RDL
  {re:/romanian deadlift|rdl|good morning|leg curl|nordic/i,                    p:['hamstrings','glutes'],              s:['lower-back','calves']},
  // Fessiers — hip thrust / pont
  {re:/hip thrust|glute bridge|fessier|hip extension|pont fessier/i,            p:['glutes'],                           s:['hamstrings','lower-back']},
  // Soulevé de terre
  {re:/souleve de terre|deadlift/i,                                             p:['glutes','hamstrings','lower-back'], s:['quads','traps','lats','forearms']},
  // Dips
  {re:/dips/i,                                                                  p:['triceps','pec'],                    s:['front-delt']},
  // Trapèzes — shrug
  {re:/shrug|hausse|haussement|trapeze iso/i,                                   p:['traps'],                            s:['forearms']},
  // Abdos — gainage
  {re:/gainage|plank|superman|bird.?dog/i,                                      p:['abs','lower-back'],                 s:['obliques','front-delt','glutes']},
  // Abdos — crunch / relevés / twist
  {re:/crunch|abdos|sit.?up|hanging leg|releves? de jambe|releves? de genou|leg raise|twist/i, p:['abs'],               s:['obliques','hip-flexors']},
  // Avant-bras — farmers / carry
  {re:/farmers?|portes|carry/i,                                                 p:['forearms','traps'],                 s:['quads','glutes']},
];
const _MG={
  pec:           {paths:['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'],                                                                                          label:'Pectoraux'},
  'front-delt':  {paths:['shoulder-front-left','shoulder-front-right'],                                                                                                                           label:'Deltoïdes ant.'},
  'side-delt':   {paths:['shoulder-side-left','shoulder-side-right'],                                                                                                                             label:'Deltoïdes lat.'},
  biceps:        {paths:['biceps-left','biceps-right'],                                                                                                                                           label:'Biceps'},
  forearms:      {paths:['forearm-left','forearm-right','forearm-flexors-left','forearm-flexors-right','forearm-extensors-left','forearm-extensors-right'],                                       label:'Avant-bras'},
  abs:           {paths:['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right'],                                                                                                  label:'Abdominaux'},
  obliques:      {paths:['obliques-left','obliques-right','serratus-anterior-left','serratus-anterior-right'],                                                                                   label:'Obliques'},
  quads:         {paths:['quads-left','quads-right'],                                                                                                                                            label:'Quadriceps'},
  'hip-flexors': {paths:['hip-flexor-left','hip-flexor-right','adductors-left','adductors-right'],                                                                                               label:'Fléchisseurs'},
  tibialis:      {paths:['tibialis-anterior-left','tibialis-anterior-right'],                                                                                                                    label:'Tibialis'},
  traps:         {paths:['traps-upper-left','traps-mid-left','traps-lower-left','traps-upper-right','traps-mid-right','traps-lower-right'],                                                      label:'Trapèzes'},
  lats:          {paths:['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'],                                                            label:'Grand dorsal'},
  'rear-delt':   {paths:['deltoid-rear-left','deltoid-rear-right'],                                                                                                                              label:'Deltoïdes post.'},
  triceps:       {paths:['triceps-long-left','triceps-lateral-left','triceps-long-right','triceps-lateral-right'],                                                                               label:'Triceps'},
  'lower-back':  {paths:['lower-back-erectors-left','lower-back-ql-left','lower-back-erectors-right','lower-back-ql-right'],                                                                    label:'Bas du dos'},
  glutes:        {paths:['gluteus-maximus-left','gluteus-maximus-right','gluteus-medius-left','gluteus-medius-right'],                                                                           label:'Fessiers'},
  hamstrings:    {paths:['hamstrings-medial-left','hamstrings-lateral-left','hamstrings-medial-right','hamstrings-lateral-right'],                                                               label:'Ischio-jambiers'},
  calves:        {paths:['calves-gastroc-medial-left','calves-gastroc-lateral-left','calves-soleus-left','calves-gastroc-medial-right','calves-gastroc-lateral-right','calves-soleus-right'],   label:'Mollets'},
};
const _FP=[
  ['','m 11.671635,6.3585449 -0.0482,-2.59085 4.20648,-2.46806 4.42769,2.95361 -0.0405,1.94408 0.24197,-3.34467 -2.03129,-2.31103 -2.84508,-0.51629 -2.20423,0.52915 -1.9363,2.63077 z'],
  ['','m 19.748825,6.7034949 0.0203,-2.20747 -3.96689,-2.7637 -3.74099,2.23559 -0.006,2.63528 -0.60741,0.0403 0.27408,1.82447 0.97635,0.33932 0.44244,2.18029 1.82222,2.06556 2.03518,-0.0607 1.79223,-1.94408 0.35957,-2.24066 0.97616,-0.33932 0.25159,-1.78416 z'],
  ['','m 13.304665,11.910505 1.64975,2.35202 0.74426,2.62159 -1.73486,-1.38354 -0.86649,-2.97104 z'],
  ['','m 18.385135,11.910505 -1.64975,2.35202 -0.74538,2.62234 1.73486,-1.38354 0.86649,-2.97104 z'],
  ['','m 21.404635,64.784375 0.1243,1.12295 -0.87118,1.08171 -0.29058,1.70599 -0.58116,0.24933 -0.49774,-2.57866 -0.33182,-0.91486 0.29058,-0.58247 z m -3.85853,0.0832 0.6224,1.74685 1.3273,2.57867 -0.33182,2.37095 -0.95423,-2.66209 -0.78738,-1.49734 z m 4.97811,-2.37039 -0.95423,5.11609 0.62241,-0.33295 0.49773,1.66381 z'],
  ['','m 10.284405,64.784375 -0.12448,1.12295 0.87118,1.08171 0.29058,1.70599 0.58116,0.24933 0.49774,-2.57866 0.33182,-0.91486 -0.29058,-0.58247 z m 3.85854,0.0832 -0.62241,1.74685 -1.32767,2.57867 0.33182,2.37095 0.95423,-2.66209 0.78832,-1.4964 z m -4.9786799,-2.37058 0.9542299,5.11609 -0.6223999,-0.33313 -0.49793,1.6638 z'],
  ['','m 17.255895,87.868445 0.1243,3.45228 0.28983,1.20638 h 0.87136 l 0.24897,-0.83181 0.29058,-0.0416 -0.0624,0.83181 1.09914,-0.33332 0.29058,-0.16629 1.24444,-0.27033 0.0416,-0.97748 -1.20319,-2.03743 -0.82974,-1.0399 -2.03294,-0.83181 z'],
  ['','m 14.433335,87.868265 -0.12448,3.45228 -0.29058,1.20637 h -0.87118 l -0.24877,-0.83181 -0.29059,-0.0416 0.0623,0.83181 -1.09934,-0.33333 -0.29058,-0.16629 -1.2448,-0.27033 -0.0412,-0.97747 1.2031899,-2.03781 0.82975,-1.04009 2.03294,-0.83181 z'],
  ['chest-upper-left','m 20.337455,17.085495 1.72942,3.09103 1.890,0.94 -0.5,0.3 -6.8,-2.1 z'],
  ['chest-lower-left','m 16.66,19.72 6.8,2.1 -0.65,0.5 -0.90604,2.63773 -2.09968,0.86537 -3.34524,-1.655 0.2,-3.8 z'],
  ['chest-upper-right','m 11.351215,17.085495 -1.7294199,3.09103 -1.890,0.94 0.5,0.3 6.8,-2.1 z'],
  ['chest-lower-right','m 15.03,19.72 -6.8,2.1 0.65,0.5 0.90586,2.63773 2.0996699,0.86537 3.34636,-1.655 -0.2,-3.8 z'],
  ['shoulder-front-left','m 19.047795,13.248365 3.55748,1.97916 0.72653,-0.35074 z m -0.107,0.43288 -0.37119,1.73073 2.1846,0.53561 1.40116,-0.49436 z'],
  ['shoulder-side-left','m 22.922305,15.657195 0.75814,-0.41 2.40806,1.66799 1.17364,1.50707 0.62662,1.5626 -0.0464,3.70194 -1.3284,-1.72153 0.0407,-2.59376 -0.48842,-0.50049 c 0,0 -3.09778,-3.19058 -3.14371,-3.21401 z m -0.2409,0.10873 c -0.001,0.0525 3.32987,3.54733 3.32987,3.54733 l 0.10067,3.10396 -1.15426,-1.97782 -2.22547,-0.94804 -1.56576,-2.88481 z'],
  ['shoulder-front-right','m 12.624785,13.248365 -3.5574599,1.97916 -0.72653,-0.35074 z m 0.107,0.43288 0.37119,1.73073 -2.18459,0.53561 -1.4011499,-0.49436 z'],
  ['shoulder-side-right','m 8.7502951,15.657195 -0.75814,-0.41 -2.40806,1.66799 -1.17364,1.50707 -0.62662,1.56259 0.0464,3.70195 1.3284,-1.72153 -0.0407,-2.59376 0.48843,-0.5005 c 0,0 3.09777,-3.19057 3.1437,-3.214 z m 0.2409,0.10873 c 0.002,0.0525 -3.32987,3.54733 -3.32987,3.54733 l -0.10067,3.10396 1.15426,-1.97782 2.22547,-0.94804 1.5657499,-2.88481 z'],
  ['biceps-left','m 27.621665,30.814715 -0.33838,1.70499 -1.81932,-2.54418 -0.6629,-1.26895 z m -2.85271,-2.6096 c -0.0259,-0.0144 -0.0536,-0.0254 -0.0824,-0.0324 l -1.48333,-4.95503 1.00456,-2.08428 1.65511,1.74532 2.23034,6.67667 0.0415,0.93739 c -1.06528,-0.84215 -2.18962,-1.60679 -3.36434,-2.28803 z m 1.6945,-5.75654 1.64893,6.43421 -0.36469,-4.92266 z'],
  ['biceps-right','m 4.0746451,30.814715 0.33838,1.70499 1.81931,-2.54418 0.66289,-1.26895 z m 2.8527,-2.6096 c 0.0259,-0.0144 0.0536,-0.0254 0.0824,-0.0324 l 1.48332,-4.95503 -1.00455,-2.08428 -1.65509,1.74532 -2.23034,6.67667 -0.0415,0.93739 c 1.06528,-0.84215 2.18961,-1.60679 3.36433,-2.28803 z m -1.6945,-5.75654 -1.64891,6.43421 0.36468,-4.92266 z'],
  ['forearm-left','m 26.955425,32.969125 1.30083,10.28927 -1.10778,0.01 -1.89387,-7.99609 0.19174,-4.53719 z m 1.21978,-1.94971 -0.58729,2.58635 1.11876,9.15614 0.55849,-0.21663 0.2304,-6.77018 z'],
  ['forearm-right','m 4.5752651,32.969125 -1.30083,10.28927 1.10778,0.01 1.89387,-7.99609 -0.19174,-4.53719 z m -1.21978,-1.94971 0.58728,2.58635 -1.11875,9.15614 -0.55849,-0.21663 -0.2304,-6.77018 z'],
  ['abs-upper-left','m 19.641935,34.707615 1.81341,-1.36479 0.15748,1.83347 1.28642,2.37338 -1.98044,2.73652 -1.03109,0.16554 -0.37026,-3.88816 z'],
  ['abs-upper-right','m 12.045985,34.707615 -1.81341,-1.36479 -0.15748,1.83347 -1.2856799,2.37432 1.9804499,2.73595 1.03109,0.16554 0.37119,-3.88721 z'],
  ['abs-lower-left','m 16.051865,44.919165 0.60628,-5.91209 0.0154,-3.84915 2.18404,-1.07515 0.24746,7.03017 z'],
  ['abs-lower-right','m 15.636055,44.919735 -0.60647,-5.91209 -0.015,-3.84879 -2.18479,-1.07533 -0.24746,7.03017 z'],
  ['obliques-left','M 18.791,29.025 l -0.0622,1.62387 -2.30308,-0.49961 -0.12448,-2.21722 z M 18.635,31.429 l 0.0311,1.99844 -2.20953,0.59391 -0.0311,-3.1227 z M 21.290,30.444 l -1.48383,1.03372 -0.20622,2.10905 1.64862,-1.32355 z'],
  ['obliques-right','M 12.897,29.025 l 0.0623,1.62387 2.30327,-0.49961 0.12448,-2.21703 z M 13.053,31.430 l -0.0309,1.99844 2.20973,0.59353 0.0311,-3.1227 z M 10.398,30.445 l 1.48384,1.0339 0.20622,2.10905 -1.64975,-1.32355 z'],
  ['serratus-anterior-left','M 19.289,26.152 l -3.11202,-1.40604 0.0937,2.27965 2.80119,1.43603 z M 21.224,27.820 l -1.29355,0.7212 0.14997,-1.70898 z M 20.171,26.183 l 2.47968,-1.03241 -0.9336,2.52093 z M 21.702,27.921 l -1.69005,1.03372 -0.28871,2.0678 1.64975,-1.07533 z'],
  ['serratus-anterior-right','m 12.399365,26.152365 3.11202,-1.40603 -0.0937,2.27965 -2.80138,1.4364 z m -1.93508,1.6685 1.29355,0.72139 -0.14997,-1.70899 z m 1.05303,-1.637 -2.4793099,-1.03259 0.93361,2.52148 z m -1.5316399,1.73729 1.6900499,1.03372 0.28871,2.06743 -1.64881,-1.07515 z'],
  ['hip-flexor-left','m 17.284025,45.040455 -0.0221,-0.0281 0.14867,-0.37926 3.10171,-3.40449 0.23246,-0.0825 -2.05843,5.3199 z m 1.17263,2.01795 -1.27706,3.29948 -0.42631,-4.04843 0.25197,-0.64303 z'],
  ['hip-flexor-right','m 14.404465,45.040075 0.0221,-0.0277 -0.14866,-0.37945 -3.10172,-3.40449 -0.23283,-0.0825 2.05918,5.32009 z m -1.17263,2.01833 1.27705,3.29948 0.42631,-4.04862 -0.25196,-0.64303 z'],
  ['adductors-left','m 22.063225,39.369605 v 4.21363 l -2.94574,5.82511 -1.86027,5.78349 0.19365,-4.0072 z m -3.24944,13.42596 -0.0649,0.15467 -1.21294,2.90207 0.78325,7.18803 1.23619,-0.66122 -1.0714,-6.69272 z'],
  ['adductors-right','m 9.6258251,39.369415 v 4.21363 l 2.9451699,5.8253 1.86028,5.78349 -0.19366,-4.0072 z m 3.2488699,13.42559 0.0647,0.15485 1.21294,2.90207 -0.78307,7.18803 -1.23618,-0.66102 1.0714,-6.69273 z'],
  ['quads-left','m 23.419015,50.399125 -0.15504,4.75091 -2.40263,6.60949 0.7362,1.90021 2.36401,-8.34435 z m -0.58154,-11.60825 -0.15485,4.00722 1.31793,7.93154 0.61977,-6.40308 z m -0.38731,5.12268 -2.75152,6.07258 -0.62015,4.87425 1.16232,6.85771 2.51886,-6.98144 0.15504,-7.18764 z'],
  ['quads-right','m 8.2694651,50.399125 0.15504,4.75053 2.4026299,6.60968 -0.73638,1.90021 -2.3640099,-8.34435 z m 0.58117,-11.60768 0.15503,4.00684 -1.31754,7.93154 -0.61978,-6.40308 z m 0.38769,5.1223 2.7515099,6.07239 0.61997,4.87425 -1.16232,6.85771 -2.5190499,-6.98163 -0.15504,-7.18801 z'],
  ['tibialis-anterior-left','m 18.251375,70.441125 0.29058,0.91486 0.6224,3.8681 0.0829,5.15733 -0.87136,5.03304 0.0412,-6.44714 -0.91242,-2.57848 -0.12561,-2.82837 z m 1.9915,2.32915 -0.20753,7.73637 -1.65949,6.23904 1.80478,-0.853 3.00816,-10.83583 -1.03727,-6.82095 z'],
  ['tibialis-anterior-right','m 13.437675,70.440945 -0.29058,0.91486 -0.62241,3.86828 -0.0829,5.15733 0.87174,5.03304 -0.0418,-6.44714 0.91298,-2.57848 0.1243,-2.82837 z m -1.99151,2.32914 0.20735,7.73637 1.65968,6.23904 -1.80497,-0.85299 -3.0079799,-10.83584 1.03728,-6.82095 z'],
];
const _BP=[
  ['','m 48.157455,6.3585449 0.44208,-0.14964 0.16111,0.16427 1.48163,4.04751 2.32401,1.45118 2.39971,-1.52387 0.97577,-3.68969 0.52752,-0.55908 0.23367,0.0981 0.24198,-3.34467 -2.03129,-2.31103 -2.84509,-0.51629 -2.20422,0.52915 -1.93631,2.63077 z'],
  ['','m 52.369695,12.105075 -2.35767,-1.55045 -1.47119,-3.95143 -0.60741,0.0403 0.27409,1.82447 0.97635,0.33932 0.7613,2.21572 0.33017,1.06849 0.0895,2.14894 1.16448,0.008 0.10563,-0.70833 0.54716,-0.0606 z m 1.01793,1.47595 0.23768,0.64982 1.38107,-0.004 0.01,-2.38784 0.25971,-0.79061 0.57215,-2.1698 0.76359,-0.41018 0.25158,-1.78416 -0.62859,0.0193 -1.08488,3.89981 -2.39725,1.46684 0.2768,1.48507 z'],
  ['','m 51.733705,14.788555 0.53876,25.33066 0.48967,-0.0297 0.65658,-25.3387 -0.28147,-0.84188 -1.25059,-0.00049 z'],
  ['','m 51.176145,64.073985 -1.20605,3.01461 0.70738,0.26558 0.89754,3.51771 -0.55801,-4.01191 z m -5.08496,-3.15003 0.63355,1.8609 0.16813,2.03261 0.61314,1.93117 -0.90585,-0.0851 -0.28534,2.15982 z'],
  ['','m 54.019305,64.073985 1.20605,3.01461 -0.70737,0.26558 -0.89755,3.51771 0.55802,-4.01191 z m 5.08496,-3.15003 -0.63355,1.8609 -0.16813,2.03261 -0.61313,1.93117 0.90584,-0.0851 0.28534,2.15982 z'],
  ['','M 50.933115,88.340995 l 0.85194,1.3581 0.37189,0.79238 -0.15588,1.21774 -0.76984,0.74446 -1.51185,0.12543 -1.1299,-0.29192 -0.24225,-0.95894 0.80765,-1.30405 -0.22562,-0.85987 0.29679,-0.84153 -0.0194,-1.81524 1.53568,-0.54817 z'],
  ['','M 54.262335,88.340995 l -0.85194,1.3581 -0.37189,0.79238 0.15589,1.21774 0.76983,0.74446 1.51186,0.12543 1.12989,-0.29192 0.24225,-0.95894 -0.80765,-1.30405 0.22563,-0.85987 -0.29679,-0.84153 0.0194,-1.81524 -1.53568,-0.54817 z'],
  ['traps-upper-left','M 49.625,14.629 L 49.688,12.005 L 48.974,13.157 L 44.594,14.654 L 45.945,16.925 L 51.222,16.925 L 51.183,14.550 Z'],
  ['traps-mid-left','M 46.034,17.075 L 48.920,21.925 L 51.303,21.925 L 51.224,17.075 Z'],
  ['traps-lower-left','M 49.009,22.075 L 49.572,23.022 L 51.403,28.104 L 51.305,22.075 Z'],
  ['traps-upper-right','M 55.439,14.729 L 55.376,12.104 L 56.090,13.256 L 60.470,14.754 L 59.179,16.925 L 53.844,16.925 L 53.881,14.649 Z'],
  ['traps-mid-right','M 59.089,17.075 L 56.204,21.925 L 53.763,21.925 L 53.842,17.075 Z'],
  ['traps-lower-right','M 56.114,22.075 L 55.492,23.121 L 53.661,28.203 L 53.761,22.075 Z'],
  ['lats-upper-left','M 44.144,15.285 L 39.888,20.286 L 39.426,22.749 L 41.263,21.510 L 44.025,20.355 L 45.663,23.400 L 49.103,23.400 Z'],
  ['lats-mid-left','M 45.771,23.600 L 45.872,23.789 L 47.009,29.286 L 47.023,30.400 L 51.080,30.400 L 51.053,28.314 L 49.185,23.600 Z'],
  ['lats-lower-left','M 47.026,30.600 L 47.086,35.145 L 51.156,36.255 L 51.082,30.600 Z'],
  ['lats-upper-right','M 60.921,15.384 L 65.176,20.385 L 65.290,22.849 L 63.801,21.609 L 61.039,20.454 L 59.455,23.400 L 56.022,23.400 Z'],
  ['lats-mid-right','M 59.347,23.600 L 59.192,23.888 L 58.055,29.385 L 58.042,30.400 L 53.986,30.400 L 54.012,28.413 L 55.918,23.600 Z'],
  ['lats-lower-right','M 58.039,30.600 L 57.979,35.245 L 53.908,36.354 L 53.983,30.600 Z'],
  ['deltoid-rear-left','M 42.201,16.586 L 40.626,18.152 L 39.736,20.156 L 43.992,15.155 Z'],
  ['deltoid-rear-right','M 62.863,16.686 L 64.438,18.251 L 65.328,20.255 L 61.073,15.254 Z'],
  ['triceps-long-left','M 43.593,21.039 L 44.920,23.967 L 43.615,25.653 L 43.186,27.069 L 39.209,29.802 Z'],
  ['triceps-lateral-left','M 43.459,20.972 L 39.075,29.735 L 38.871,25.461 L 39.407,23.674 L 41.242,21.927 Z'],
  ['triceps-long-right','M 61.376,21.213 L 60.056,24.145 L 61.330,26.199 L 61.657,27.251 L 65.780,29.966 Z'],
  ['triceps-lateral-right','M 61.510,21.146 L 65.914,29.899 L 66.108,25.624 L 65.568,23.839 L 63.729,22.096 Z'],
  ['forearm-flexors-left','M 40.775,29.006 L 42.870,27.644 L 42.187,29.635 L 42.603,34.383 L 40.799,42.081 L 39.814,42.253 Z'],
  ['forearm-extensors-left','M 39.665,42.242 L 38.305,41.501 L 37.998,34.491 L 38.635,31.429 L 39.245,30.209 L 40.625,28.994 Z'],
  ['forearm-flexors-right','M 65.204,42.420 L 63.925,29.007 L 61.764,27.798 L 62.786,29.733 L 62.397,34.555 L 64.219,42.248 Z'],
  ['forearm-extensors-right','M 64.075,28.993 L 65.353,42.405 L 66.712,41.663 L 67.002,34.653 L 66.358,31.591 L 65.745,30.373 Z'],
  ['lower-back-erectors-left','M 52.100,37.310 L 49.537,36.465 L 50.244,40.788 L 52.200,42.030 L 52.200,40.270 L 52.150,40.280 Z'],
  ['lower-back-ql-left','M 49.389,36.490 L 46.240,35.460 L 44.720,39.420 L 50.096,40.812 Z'],
  ['lower-back-erectors-right','M 52.800,42.030 L 52.800,40.270 L 52.850,40.260 L 52.900,37.290 L 55.289,36.625 L 54.805,40.801 Z'],
  ['lower-back-ql-right','M 55.439,36.643 L 55.980,36.470 L 58.320,35.720 L 59.660,39.450 L 54.955,40.819 Z'],
  ['gluteus-medius-left','M 50.191,41.481 L 44.740,39.690 L 43.830,41.580 L 43.431,44.301 Z'],
  ['gluteus-maximus-left','M 50.249,41.619 L 43.489,44.439 L 44.410,50.520 L 47.180,51.030 L 51.620,49.090 L 52.200,49.480 L 52.200,42.880 Z'],
  ['gluteus-medius-right','M 55.274,41.079 L 61.354,45.519 L 60.640,42.150 L 59.740,39.860 Z'],
  ['gluteus-maximus-right','M 55.186,41.201 L 52.800,42.880 L 52.800,49.480 L 53.570,49.090 L 57.680,50.760 L 60.500,50.600 L 61.266,45.641 Z'],
  ['hamstrings-medial-left','M 49.550,50.504 L 51.751,49.461 L 52.389,49.692 L 52.424,51.499 L 52.499,56.145 L 50.521,62.188 L 50.997,63.602 L 49.569,66.897 L 48.755,66.754 Z'],
  ['hamstrings-lateral-left','M 49.400,50.496 L 48.605,66.746 L 47.803,66.596 L 47.302,64.480 L 47.133,62.723 L 44.712,54.565 L 44.369,50.918 L 47.200,51.500 Z'],
  ['hamstrings-medial-right','M 57.425,51.196 L 56.565,66.806 L 55.759,66.965 L 54.331,63.670 L 54.807,62.256 L 52.829,56.213 L 52.904,51.567 L 52.956,49.769 L 53.520,49.498 Z'],
  ['hamstrings-lateral-right','M 57.575,51.204 L 60.625,50.950 L 60.616,54.633 L 58.195,62.791 L 58.026,64.547 L 57.525,66.663 L 56.715,66.814 Z'],
  ['calves-gastroc-medial-left','M 50.568,67.512 L 51.669,72.509 L 51.379,75.532 L 51.292,76.825 L 48.983,76.825 Z'],
  ['calves-gastroc-lateral-left','M 50.218,67.512 L 48.633,76.825 L 46.283,76.825 L 45.533,74.263 L 46.783,67.088 Z'],
  ['calves-soleus-left','M 46.386,77.175 L 51.269,77.175 L 50.701,85.598 L 49.037,86.233 Z'],
  ['calves-gastroc-medial-right','M 54.628,67.512 L 53.526,72.509 L 53.816,75.532 L 53.903,76.825 L 56.213,76.825 Z'],
  ['calves-gastroc-lateral-right','M 54.978,67.512 L 56.563,76.825 L 58.912,76.825 L 59.662,74.263 L 58.412,67.088 Z'],
  ['calves-soleus-right','M 53.927,77.175 L 58.810,77.175 L 56.158,86.233 L 54.495,85.598 Z'],
];
const _DEAD_=[
  ['','M 13,2.5 C 11.5,2.5 10,3.8 10,5.5 C 10,7.5 11.5,9 13,9.5 C 14,9.8 14.5,10.5 14.8,11 L 18.2,11 C 18.5,10.5 19,9.8 20,9.5 C 21.5,9 23,7.5 23,5.5 C 23,3.8 21.5,2.5 20,2.5 C 19.3,2.5 18.7,3 18.2,3.5 C 17.6,3.1 16.5,2.5 13,2.5 Z'],
  ['','M 14.5,11.5 L 18.5,11.5 L 18.5,14.5 L 14.5,14.5 Z'],
  ['','M 12,14.5 Q 9.5,16 8,20 Q 7,24 7.5,30 L 8.5,37 L 10.5,41 L 11.5,37.5 L 10,31 L 9.5,24 Q 9.5,18.5 12,16 Z'],
  ['','M 21,14.5 Q 23.5,16 25,20 Q 26,24 25.5,30 L 24.5,37 L 22.5,41 L 21.5,37.5 L 23,31 L 23.5,24 Q 23.5,18.5 21,16 Z'],
  ['','M 12.5,62 L 11.5,73 L 11,83 L 12,89 L 15,90 L 15.5,83 L 15,73 L 14.5,62 Z'],
  ['','M 20.5,62 L 21.5,73 L 22,83 L 21,89 L 18,90 L 17.5,83 L 18,73 L 18.5,62 Z'],
  ['','M 12,89 L 10,92.5 L 9.5,93.5 L 14,93.5 L 15.5,91 L 15,89 Z'],
  ['','M 21,89 L 23,92.5 L 23.5,93.5 L 19,93.5 L 17.5,91 L 18,89 Z'],
  ['chest-upper-left', 'M 16.5,15.5 L 21.5,16.5 Q 24,18.5 24,22 Q 22,25.5 19,26 L 16.5,26 Z'],
  ['chest-upper-right','M 16.5,15.5 L 11.5,16.5 Q 9,18.5 9,22 Q 11,25.5 14,26 L 16.5,26 Z'],
  ['chest-lower-left', 'M 16.5,26 L 19,26 Q 22,25.5 24,22 L 24,27 Q 22,30 19,30.5 L 16.5,30 Z'],
  ['chest-lower-right','M 16.5,26 L 14,26 Q 11,25.5 9,22 L 9,27 Q 11,30 14,30.5 L 16.5,30 Z'],
  ['shoulder-front-left', 'M 20,14.5 L 23,16 L 24,20 L 21.5,20.5 L 20.5,17 Z'],
  ['shoulder-front-right','M 13,14.5 L 10,16 L 9,20 L 11.5,20.5 L 12.5,17 Z'],
  ['shoulder-side-left',  'M 23,16 L 25,18 L 26,22 L 24.5,22 L 24,19 Z'],
  ['shoulder-side-right', 'M 10,16 L 8,18 L 7,22 L 8.5,22 L 9,19 Z'],
  ['biceps-left', 'M 21.5,20.5 L 25,22 L 26,28.5 L 24,30 L 22.5,24.5 Z'],
  ['biceps-right','M 11.5,20.5 L 8,22 L 7,28.5 L 9,30 L 10.5,24.5 Z'],
  ['forearm-left', 'M 24,30 L 26,29.5 L 27,37 L 25,39.5 L 24,33 Z'],
  ['forearm-right','M 9,30 L 7,29.5 L 6,37 L 8,39.5 L 9,33 Z'],
  ['abs-upper-left', 'M 16.5,17 L 21.5,18 L 22,25.5 L 16.5,26 Z'],
  ['abs-upper-right','M 16.5,17 L 11.5,18 L 11,25.5 L 16.5,26 Z'],
  ['abs-lower-left', 'M 16.5,30 L 19.5,30.5 Q 22,31 22.5,31 L 22.5,36 L 16.5,36 Z'],
  ['abs-lower-right','M 16.5,30 L 13.5,30.5 Q 11,31 10.5,31 L 10.5,36 L 16.5,36 Z'],
  ['obliques-left',          'M 22,18 L 24.5,20.5 L 24,31 L 22,30 Z'],
  ['obliques-right',         'M 11,18 L 8.5,20.5 L 9,31 L 11,30 Z'],
  ['serratus-anterior-left', 'M 22,24 L 24.5,25 L 24.5,30 L 22,29 Z'],
  ['serratus-anterior-right','M 11,24 L 8.5,25 L 8.5,30 L 11,29 Z'],
  ['hip-flexor-left', 'M 16.5,36 L 23.5,36 Q 26,39.5 25,43 L 18.5,44 Z'],
  ['hip-flexor-right','M 16.5,36 L 9.5,36 Q 7,39.5 8,43 L 14.5,44 Z'],
  ['adductors-left',  'M 18.5,44 L 25,45 L 24.5,56 L 18.5,57 Z'],
  ['adductors-right', 'M 14.5,44 L 8,45 L 8.5,56 L 14.5,57 Z'],
  ['quads-left', 'M 18.5,57 L 24.5,56 L 24,63.5 L 21.5,65 L 19,62 Z'],
  ['quads-right','M 14.5,57 L 8.5,56 L 9,63.5 L 11.5,65 L 14,62 Z'],
  ['tibialis-anterior-left', 'M 20,64.5 L 23.5,65 L 23,77 L 21,80 L 20,72 Z'],
];
// ── Zones muscles féminins — image female-body.png (1325×1187, 3 vues)
// viewBox "0 0 200 269" : chaque vue = 100 unités. f=avant x0-100, b=arrière x0-100 (shift +100 en SVG)
const _MG_F_SHAPES={
  pec:          {f:`<ellipse cx="36" cy="68" rx="12" ry="10"/><ellipse cx="64" cy="68" rx="12" ry="10"/>`},
  'front-delt': {f:`<ellipse cx="21" cy="54" rx="8" ry="8"/><ellipse cx="79" cy="54" rx="8" ry="8"/>`},
  'side-delt':  {f:`<ellipse cx="16" cy="64" rx="7" ry="9"/><ellipse cx="84" cy="64" rx="7" ry="9"/>`},
  biceps:       {f:`<rect x="11" y="60" width="9" height="24" rx="4"/><rect x="80" y="60" width="9" height="24" rx="4"/>`},
  forearms:     {f:`<rect x="9"  y="86" width="9" height="26" rx="4"/><rect x="82" y="86" width="9" height="26" rx="4"/>`},
  abs:          {f:`<rect x="38" y="80" width="24" height="36" rx="5"/>`},
  obliques:     {f:`<rect x="26" y="78" width="12" height="38" rx="5"/><rect x="62" y="78" width="12" height="38" rx="5"/>`},
  'hip-flexors':{f:`<ellipse cx="37" cy="122" rx="12" ry="9"/><ellipse cx="63" cy="122" rx="12" ry="9"/>`},
  quads:        {f:`<rect x="29" y="132" width="18" height="65" rx="6"/><rect x="53" y="132" width="18" height="65" rx="6"/>`},
  tibialis:     {f:`<rect x="31" y="210" width="11" height="34" rx="4"/><rect x="58" y="210" width="11" height="34" rx="4"/>`},
  calves:       {f:`<rect x="30" y="210" width="12" height="34" rx="4"/><rect x="58" y="210" width="12" height="34" rx="4"/>`,
                 b:`<rect x="30" y="210" width="12" height="34" rx="4"/><rect x="58" y="210" width="12" height="34" rx="4"/>`},
  traps:        {b:`<ellipse cx="50" cy="58" rx="19" ry="10"/>`},
  'rear-delt':  {b:`<ellipse cx="22" cy="52" rx="8" ry="8"/><ellipse cx="78" cy="52" rx="8" ry="8"/>`},
  triceps:      {b:`<rect x="11" y="58" width="9" height="22" rx="4"/><rect x="80" y="58" width="9" height="22" rx="4"/>`},
  lats:         {b:`<ellipse cx="28" cy="92" rx="12" ry="18"/><ellipse cx="72" cy="92" rx="12" ry="18"/>`},
  'lower-back': {b:`<ellipse cx="50" cy="110" rx="15" ry="9"/>`},
  glutes:       {b:`<ellipse cx="36" cy="132" rx="18" ry="14"/><ellipse cx="64" cy="132" rx="18" ry="14"/>`},
  hamstrings:   {b:`<rect x="30" y="145" width="17" height="60" rx="6"/><rect x="53" y="145" width="17" height="60" rx="6"/>`},
};
function _mscSVG_F({sc,ind}){
  const isLight=document.getElementById('root')?.classList.contains('light-mode');
  let hlF='',hlB='';
  Object.entries(_MG_F_SHAPES).forEach(([g,s])=>{
    const v=sc[g]||0,isI=ind[g]&&!v;
    let c=null,op='0.42';
    if(v>=2){c='#FF2D55';op='0.50';}else if(v>=1){c='#FF9500';op='0.42';}else if(isI){c='#8FB4D8';op='0.32';}
    if(!c)return;
    if(s.f)hlF+=`<g fill="${c}" opacity="${op}">${s.f}</g>`;
    if(s.b)hlB+=`<g fill="${c}" opacity="${op}">${s.b}</g>`;
  });
  // <img> tag pour que filter:invert fonctionne sur iOS/WebKit (SVG <image> ne supporte pas CSS filter)
  // width:150% + overflow:hidden = montre 2/3 de l'image (avant+arrière, cache profil)
  // padding-bottom:134.5% = ratio 1187/(1325*2/3) pour hauteur responsive
  const imgF=isLight?'':'filter:invert(1)';
  return `<div style="position:relative;overflow:hidden;padding-bottom:134.5%;width:100%">
    <img src="female-body.png" style="position:absolute;top:0;left:0;width:150%;height:auto;${imgF}"/>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 269" style="position:absolute;top:0;left:0;width:100%;height:100%">
      ${hlF}<g transform="translate(100,0)">${hlB}</g>
      <text x="50" y="267" text-anchor="middle" font-size="7" fill="#888" font-family="system-ui,sans-serif">VUE AVANT</text>
      <text x="150" y="267" text-anchor="middle" font-size="7" fill="#888" font-family="system-ui,sans-serif">VUE ARRIÈRE</text>
    </svg>
  </div>`;
}
// Normalise un nom d'exercice : retire les accents + minuscules
// → « Développé Incliné » == « developpe incline » == « Developpe incline »
const _naz=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function _mscScores(exs){
  const sc={},ind={};
  (exs||[]).forEach(ex=>{
    if(!(ex.sets||[]).some(s=>s.done))return;
    let matched=false;
    const _nm=_naz(ex.name);
    for(const r of _MEX){if(r.re.test(_nm)){r.p.forEach(m=>{sc[m]=(sc[m]||0)+2;});r.s.forEach(m=>{sc[m]=(sc[m]||0)+1;});(r.i||[]).forEach(m=>{ind[m]=true;});matched=true;break;}}
    if(!matched){
      const cex=(S.customExercises||[]).find(e=>e.n===ex.name);
      if(cex&&cex.muscles){
        (cex.muscles.p||[]).forEach(m=>{sc[m]=(sc[m]||0)+2;});
        (cex.muscles.s||[]).forEach(m=>{sc[m]=(sc[m]||0)+1;});
      }
    }
  });
  return {sc,ind};
}
function showMuscleName(label,evt){
  evt&&evt.stopPropagation();
  const el=document.getElementById('mm-clicked-label');
  if(!el)return;
  el.textContent=label;el.style.display='block';
  clearTimeout(el._t);el._t=setTimeout(()=>{el.style.display='none';},2500);
}
function _mscSVG({sc,ind}){
  const defs=`<defs>
    <linearGradient id="g-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8A888"/><stop offset="100%" stop-color="#B86848"/></linearGradient>
    <linearGradient id="g-base" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C87868"/><stop offset="100%" stop-color="#7A3828"/></linearGradient>
    <linearGradient id="g-prim" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF6868"/><stop offset="100%" stop-color="#C00020"/></linearGradient>
    <linearGradient id="g-sec"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFB040"/><stop offset="100%" stop-color="#C05500"/></linearGradient>
    <linearGradient id="g-ind"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9DBBD6"/><stop offset="100%" stop-color="#6E8CA8"/></linearGradient>
    <filter id="f-sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="0.5" stdDeviation="0.8" flood-color="rgba(0,0,0,0.55)"/></filter>
  </defs>`;
  const ps={};
  Object.entries(_MG).forEach(([g,d])=>{
    const v=sc[g]||0;const isI=ind[g]&&!v;
    let gid,sk,filt='';
    if(v>=2){gid='g-prim';sk='#880010';filt=' filter="url(#f-sh)"';}
    else if(v>=1){gid='g-sec';sk='#884400';filt=' filter="url(#f-sh)"';}
    else if(isI){gid='g-ind';sk='#5B7C9E';filt=' opacity="0.5"';}
    else{gid='g-base';sk='#5A2818';}
    d.paths.forEach(id=>{ps[id]={gid,sk,filt,label:d.label};});
  });
  const pt=([id,d])=>{
    if(!id)return `<path d="${d}" fill="url(#g-skin)" stroke="#9A5838" stroke-width="0.15" stroke-linejoin="round"/>`;
    const p=ps[id]||{gid:'g-base',sk:'#5A2818',filt:'',label:''};
    const click=p.label?` onclick="showMuscleName('${p.label}',event)" style="cursor:pointer"`:'';
    return `<path id="${id}" d="${d}" fill="url(#${p.gid})" stroke="${p.sk}" stroke-width="0.22" stroke-linejoin="round"${p.filt}${click}/>`;
  };
  return `<svg viewBox="-1 0 72 96" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block" stroke-linecap="round">${defs}${_FP.map(pt).join('')}${_BP.map(pt).join('')}<text x="17" y="94.5" text-anchor="middle" font-size="2.2" fill="#999" font-family="system-ui,sans-serif">VUE AVANT</text><text x="52" y="94.5" text-anchor="middle" font-size="2.2" fill="#999" font-family="system-ui,sans-serif">VUE ARRIÈRE</text></svg>`;
}
let _mmCb=null;
function showMuscleMap(exs,cb){
  const {sc,ind}=_mscScores(exs);
  document.getElementById('mm-svg').innerHTML=_mscSVG({sc,ind});
  const pri=Object.entries(_MG).filter(([g])=>(sc[g]||0)>=2).map(([,d])=>d.label);
  const sec=Object.entries(_MG).filter(([g])=>(sc[g]||0)===1).map(([,d])=>d.label);
  const indir=Object.entries(_MG).filter(([g])=>ind[g]&&!(sc[g]>=1)).map(([,d])=>d.label);
  const li=document.getElementById('mm-list');
  li.innerHTML=(pri.length?`<div><span style="color:#FF2D55;font-weight:600">● Primaires : </span>${pri.join(', ')}</div>`:'')+
               (sec.length?`<div style="margin-top:3px"><span style="color:#FF9500;font-weight:600">● Secondaires : </span>${sec.join(', ')}</div>`:'')+
               (indir.length?`<div style="margin-top:3px"><span style="color:#8FB4D8;font-weight:600">● Indirects : </span>${indir.join(', ')}</div>`:'');
  _mmCb=cb||null;
  const mmBtn=document.getElementById('mm-btn');if(mmBtn)mmBtn.textContent=cb?'Continuer →':'Fermer';
  document.getElementById('ov-mm').classList.add('open');
}
function closeMuscleMap(){
  document.getElementById('ov-mm').classList.remove('open');
  if(_mmCb){_mmCb();_mmCb=null;}
}

// Volume de travail : exclut É (échauffement) et W (legacy)
function _workVol(sess){
  let v=0;
  (sess.exs||sess.exercises||[]).forEach(ex=>{
    (ex.sets||[]).forEach(s=>{
      if(s.done&&s.type!=='É'&&s.type!=='W'&&(s.kg||0)>0&&(s.reps||0)>0)v+=s.kg*s.reps;
    });
  });
  return v;
}

let _finishing=false;
async function finishWorkout(){
  if(_finishing)return;
  _finishing=true;
  _releaseWakeLock();
  _stopWktChrono();
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){toast('Ajoute un exercice !','error');_finishing=false;return;}
  const hasDone=S.wkt.exs.some(ex=>ex.sets.some(s=>s.done));
  if(!hasDone){toast('Valide au moins une série !','error');_finishing=false;return;}
  const duration=S.wkt.startTs?Math.floor((Date.now()-S.wkt.startTs)/1000):0;
  let vol=0;
  S.wkt.exs.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')vol+=(s.kg||0)*(s.reps||0);}));
  const sess={id:Date.now(),date:S.wkt.date||today(),exs:S.wkt.exs,volume:Math.round(vol),synced:false,ts:Date.now(),startHour:S.wkt.startHour,duration};
  sess.exercises=sess.exs.map(ex=>({name:ex.name,sets:ex.sets}));
  // Capturer les PRs avant mise à jour pour détecter les améliorations
  const _oldPrs={};Object.keys(S.prs||{}).forEach(k=>{_oldPrs[k]={...S.prs[k]};});
  sess.exs.forEach(ex=>ex.sets.forEach(s=>{
    if(!s.done||!s.kg||!s.reps||s.type==='É'||s.type==='W')return;
    const rm=bz(s.kg,s.reps),cur=S.prs[ex.name];
    if(!cur||rm>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};
  }));
  let _bestPr=null;
  sess.exs.forEach(ex=>ex.sets.forEach(s=>{
    if(!s.done||!s.kg||!s.reps||s.type==='É'||s.type==='W')return;
    const rm=bz(s.kg,s.reps),old=_oldPrs[ex.name];
    if(!old||rm>old.rm1){
      const gain=rm-(old?old.rm1:0);
      if(!_bestPr||gain>(_bestPr.newRm-(_bestPr.oldRm||0)))_bestPr={ex:ex.name,newRm:rm,oldRm:old?old.rm1:0};
    }
  }));
  stopRest();
  if(S.wkt?.cardio?.duration) sess.cardio={...S.wkt.cardio};
  const calData=calcSessionCalories(sess);
  const cardioKcal=calcCardioKcal(sess.cardio||null);
  if(cardioKcal){calData.total+=cardioKcal;calData.cardio=cardioKcal;}
  sess.calories=calData.total;sess.calData=calData;

  // ── SAUVEGARDE LOCALE : séances d'abord, wkt effacé après confirmation ──
  S.sessions.unshift(sess);
  let _savedOk=false;
  try{
    localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,200)));
    localStorage.setItem('ft4_prs',JSON.stringify(S.prs||{}));
    _savedOk=true;
  }catch(e){
    try{
      localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));
      localStorage.setItem('ft4_prs',JSON.stringify(S.prs||{}));
      _savedOk=true;
      toast('Stockage quasi-plein — historique allégé à 50 séances','info');
    }catch(e2){_savedOk=false;}
  }
  if(!_savedOk){
    // Annuler les mutations en mémoire et proposer le retry
    S.sessions.shift();
    S.prs=_oldPrs;
    _finishing=false;
    _showSaveError();
    return;
  }
  // Séance confirmée en localStorage — on peut effacer le brouillon
  S.wkt=null;
  try{localStorage.setItem('ft4_wkt','null');localStorage.removeItem('ft4_wkt_draft');}catch(e){}
  persist();

  // Quitter l'écran séance immédiatement (évite double-tap sur DOM stale)
  goScreen('home',document.getElementById('nb-home'));
  renderLog();

  checkBadges();
  _cloudSyncSessions();
  if(S.connected&&S.url){
    const ok=await syncSheets(sess);
    if(ok){
      if(S.sessions.length)S.sessions[0].synced=true;
      try{localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,200)));}catch(e){}
      toast(`Séance synchronisée ! 🔥 ${calData.total} kcal`,'success');
    }else toast(`Séance sauvegardée ! 🔥 ${calData.total} kcal`,'success');
  }else{
    toast(`Séance terminée ! 🔥 ${calData.total} kcal brûlées`,'success');
  }
  setTimeout(()=>showMuscleMap(sess.exs,()=>openCheckin(sess)),800);
  if(_bestPr)setTimeout(()=>showPrCongrats(_bestPr),2400);
  _finishing=false;
}
function _showSaveError(){
  const el=document.getElementById('log-finish');if(!el)return;
  el.innerHTML=`<div style="margin-top:12px;background:rgba(255,45,85,.10);border:1.5px solid var(--red);border-radius:14px;padding:16px;">
    <div style="font-weight:700;color:var(--red);margin-bottom:6px;">⚠️ Impossible d'enregistrer la séance</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;">Stockage plein. Ta séance est <strong>toujours là</strong> — libère de l'espace puis réessaie, ou note tes données avant de fermer.</div>
    <button class="btn btn-red" onclick="finishWorkout()" style="width:100%;">🔄 Réessayer</button>
    <button class="btn btn-bg2" onclick="this.closest('div[style]').remove();" style="width:100%;margin-top:8px;">Continuer la séance</button>
  </div>`;
}

// ─── REST TIMER ──────────────────────────────────────────────
// Source de vérité : restStartTs (timestamp) + restTot (durée)
let restIv=null,restTot=120,restStartTs=0;
let _pillIv=null; // interval dédié pill hors écran séance
let _restBeeped=false;
let _restDoneCb=null;
let _countdownSecs=new Set(); // secondes 5..1 déjà vibrées
let _cdownActive=false,_cdownAutoClose=null; // overlay décompte final
let _cdownBeepedSecs=new Set(),_cdownGoDone=false; // vibration overlay
const _isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

function _restLeft(){
  if(!restStartTs)return 0;
  return restTot-Math.floor((Date.now()-restStartTs)/1000);
}

// ─── AUDIO : AUCUN ───────────────────────────────────────────
// ⚠️ Le timer est 100% SILENCIEUX (vibration + visuel uniquement).
// Ne JAMAIS créer d'AudioContext ni d'élément Audio ici : sur iPhone,
// la simple CRÉATION d'un contexte audio coupe la musique de fond de
// l'utilisateur (Spotify/Apple Music) sans jamais la relancer.
// Historique : bips synthétiques + countdown.wav retirés (ft-v166),
// tentative mp3 tick-tock/bell annulée (ft-v163→v165).

// ─── PILL FLOTTANTE ──────────────────────────────────────────
function _updPill(){
  const pill=document.getElementById('rest-pill');
  if(!pill)return;
  const active=!!restIv&&window._curScreen!=='log';
  pill.classList.toggle('show',active);
  if(!active)return;
  const left=_restLeft();
  const pillTime=document.getElementById('rest-pill-time');
  const pillFill=document.getElementById('rest-pill-fill');
  if(!pillTime||!pillFill)return;
  // Disparaît quand le temps est écoulé
  if(left<=0){pill.classList.remove('show');return;}
  const m=Math.floor(left/60),s=left%60;
  pillTime.textContent=`${m}:${s.toString().padStart(2,'0')}`;
  const pct=left/restTot*100;
  pillFill.style.width=pct+'%';
  const c=pct>50?'var(--green)':pct>20?'var(--gold)':'var(--red)';
  pillFill.style.background=c;
  pill.style.borderColor=pct>50?'rgba(52,211,153,.5)':pct>20?'rgba(255,214,0,.4)':'rgba(255,106,115,.7)';
}

function _restTick(){
  const left=_restLeft();
  // Overlay décompte final : 10 dernières secondes (seulement si repos > 10s)
  if(left===10&&!_cdownActive&&restTot>10&&window._curScreen==='log')_showRestCountdown();
  if(_cdownActive)_updateRestCountdown();
  // Décompte 5..1 : vibrations courtes (aucun son)
  if(left>0&&left<=5&&!_countdownSecs.has(left)){
    _countdownSecs.add(left);
    if(navigator.vibrate)navigator.vibrate(60);
  }
  // GO : vibration + arrêt du timer (plus de dépassement/overtime, aucun son)
  if(left<=0&&!_restBeeped){
    _restBeeped=true;
    if(navigator.vibrate)navigator.vibrate([300,100,300,100,400]);
    if(_restDoneCb){const cb=_restDoneCb;_restDoneCb=null;setTimeout(()=>{stopRest();cb();},400);return;}
    if(_cdownActive){
      // Overlay GO visible : on arrête chrono + pastille mais on laisse l'overlay
      // affiché (GO + flash) — il se ferme au tap ou bouton Passer
      _stopRestTimerOnly();
    }else{
      stopRest();
    }
    return;
  }
  updRest();
  _updPill();
}

function saveExNote(ei,val){if(S.wkt?.exs?.[ei]!==undefined){S.wkt.exs[ei].note=val||'';persist();}}

// ── OVERLAY DÉCOMPTE FINAL ────────────────────────────────────────────
function _nextSetInfo(){
  const ex=S.wkt?.exs?.[_expandedEx];
  if(!ex)return null;
  const si=ex.sets.findIndex(s=>!s.done);
  if(si<0)return null;
  const set=ex.sets[si];
  return{name:ex.name,num:si+1,kg:set.kg||'',reps:set.reps||''};
}
function _showRestCountdown(){
  if(_cdownActive)return;
  _cdownActive=true;
  _cdownBeepedSecs=new Set();_cdownGoDone=false;
  const ov=document.getElementById('ov-rest-countdown');
  if(!ov)return;
  const info=_nextSetInfo();
  const nameEl=document.getElementById('rcd-ex-name');
  const nextNumEl=document.getElementById('rcd-next-num');
  const nextDetailEl=document.getElementById('rcd-next-detail');
  if(nameEl)nameEl.textContent=info?info.name:'';
  if(nextNumEl)nextNumEl.textContent=info?'Série '+info.num:'';
  if(nextDetailEl)nextDetailEl.textContent=info?(info.kg+' kg × '+info.reps):'';
  ov.style.display='block';
  _updateRestCountdown();
}
function _updateRestCountdown(){
  if(!_cdownActive)return;
  const left=_restLeft();
  // Vibration seule : intense sur 3-2-1, GO final
  if(left>0&&left<=3&&!_cdownBeepedSecs.has(left)){
    _cdownBeepedSecs.add(left);
    if(navigator.vibrate)navigator.vibrate(80);
  }
  if(left<=0&&!_cdownGoDone){
    _cdownGoDone=true;
    if(navigator.vibrate)navigator.vibrate([200,60,200,60,300]);
    // Flash vert — filet de sécurité mode silencieux iPhone
    const _ov=document.getElementById('ov-rest-countdown');
    if(_ov){_ov.style.transition='background .05s';_ov.style.background='#00e676';setTimeout(()=>{_ov.style.background='#0e1016';setTimeout(()=>{_ov.style.transition='';},200);},200);}
  }
  const ring=document.getElementById('rcd-ring');
  const numEl=document.getElementById('rcd-num');
  const labelEl=document.getElementById('rcd-label');
  if(left<=0){
    // Écran GO persistant : reste affiché jusqu'au tap / bouton Passer (pas d'auto-close)
    if(labelEl)labelEl.textContent="C'EST REPARTI";
    if(numEl){numEl.textContent='GO';numEl.style.fontSize='80px';numEl.style.color='#fff';}
    if(ring){ring.style.stroke='var(--red)';ring.setAttribute('stroke-dashoffset','534');}
    return;
  }
  const circ=534;
  const offset=((10-left)/10*circ).toFixed(1);
  const color=left<=3?'#FF2D55':'#FF6C00';
  if(ring){ring.setAttribute('stroke-dashoffset',offset);ring.style.stroke=color;}
  if(numEl){numEl.textContent=left;numEl.style.fontSize='110px';numEl.style.color=color;}
}
// Tap sur l'overlay ou bouton Passer :
// - pendant le décompte (avant 0) → skip anticipé = fin immédiate du repos (timer + pastille effacés)
// - après le GO → simple fermeture de l'écran (timer déjà arrêté)
function _cdownTap(){
  if(_cdownGoDone){_closeRestCountdown();return;}
  stopRest();
}
function _closeRestCountdown(){
  if(!_cdownActive)return;
  _cdownActive=false;
  if(_cdownAutoClose){clearTimeout(_cdownAutoClose);_cdownAutoClose=null;}
  const ov=document.getElementById('ov-rest-countdown');
  if(ov)ov.style.display='none';
  // reset pour la prochaine fois
  const labelEl=document.getElementById('rcd-label');
  const numEl=document.getElementById('rcd-num');
  if(labelEl)labelEl.textContent='REPRISE DANS';
  if(numEl){numEl.style.fontSize='110px';numEl.style.color='#FF6C00';}
}
// ─────────────────────────────────────────────────────────────────────

function startRest(sec){
  stopRest();restTot=sec;restStartTs=Date.now();_restBeeped=false;
  _countdownSecs=new Set();
  const bar=document.getElementById('rest-bar');
  bar.classList.add('show');
  updRest();_updPill();
  restIv=setInterval(_restTick,250);
  if(_pillIv)clearInterval(_pillIv);
  _pillIv=setInterval(_updPill,500);
}

function updRest(){
  const bar=document.getElementById('rest-bar');
  const timeEl=document.getElementById('rest-time');
  const fillEl=document.getElementById('rest-fill');
  if(!timeEl||!fillEl)return;
  const left=Math.max(0,_restLeft());
  const m=Math.floor(left/60),s=left%60;
  timeEl.textContent=`${m}:${s.toString().padStart(2,'0')}`;
  const pct=left/restTot*100;
  fillEl.style.width=pct+'%';
  const c=pct>50?'var(--green)':pct>20?'var(--gold)':'var(--red)';
  const bc=pct>50?'rgba(0,230,118,.3)':pct>20?'rgba(255,214,0,.3)':'rgba(255,45,85,.4)';
  timeEl.style.color=c;fillEl.style.background=c;if(bar)bar.style.borderColor=bc;
}

// Arrête chrono + barre + pastille SANS fermer l'overlay décompte (utilisé au GO,
// où l'overlay doit rester affiché — GO + flash — jusqu'au tap/Passer)
function _stopRestTimerOnly(){
  clearInterval(restIv);restIv=null;
  clearInterval(_pillIv);_pillIv=null;
  restStartTs=0;
  _restBeeped=false;_restDoneCb=null;_countdownSecs=new Set();
  const bar=document.getElementById('rest-bar');
  if(bar){bar.classList.remove('show');bar.style.borderColor='';}
  const lbl=document.getElementById('rest-label');if(lbl)lbl.textContent='';
  _updPill();
}

function stopRest(){
  _closeRestCountdown();
  _stopRestTimerOnly();
}
let _afTimer=null;
function _onKgInput(el,ei,si){
  updateRMLive(ei,si);
  clearTimeout(_afTimer);
  if(!el.value)return;
  _afTimer=setTimeout(()=>{
    if(document.activeElement!==el)return;
    const row=document.getElementById(`sr-${ei}-${si}`);
    if(!row)return;
    const repsInp=row.querySelectorAll('.sinp')[1];
    if(repsInp){repsInp.focus();repsInp.select&&repsInp.select();}
  },700);
}
function updateRMLive(ei,si){
  const row=document.getElementById(`sr-${ei}-${si}`);
  if(!row)return;
  const inps=row.querySelectorAll('.sinp');
  const kg=parseFloat(inps[0]&&(inps[0].value||inps[0].placeholder))||0;
  const reps=parseInt(inps[1]&&(inps[1].value||inps[1].placeholder))||0;
  const trmEl=document.getElementById(`trm-${ei}-${si}`);
  if(trmEl)trmEl.textContent=kg&&reps?'~'+fmt(bz(kg,reps)):'';
}
let _restStep=15;
let _restEx=null;
let _cexMusclesP=[],_cexMusclesS=[];
function _highlightRestPreset(sec){
  [60,90,120].forEach(v=>{const b=document.getElementById('rp-'+v);if(b)b.classList.toggle('rp-active',v===sec);});
}
function setRestPreset(sec){
  if(!restStartTs){startRest(sec);return;}
  const elapsed=Math.floor((Date.now()-restStartTs)/1000);
  if(elapsed>=sec){stopRest();return;}
  // Garde restStartTs (début du repos), change seulement la cible totale
  // → _restLeft() = sec - elapsed (temps restant = cible - déjà écoulé)
  restTot=sec;_restBeeped=false;_countdownSecs=new Set();
  if(_restEx){S.exRestPref=S.exRestPref||{};S.exRestPref[_restEx]=sec;persist();}
  _highlightRestPreset(sec);updRest();_updPill();
}
function addRT(s){
  if(!restStartTs)return;
  // Recalcule restStartTs pour que _restLeft() reflète la nouvelle durée
  const newLeft=Math.max(5,Math.min(_restLeft()+s,600));
  restStartTs=Date.now()-(restTot-newLeft)*1000;
  updRest();
}
function skipRest(){stopRest();}

// ─── EXERCISE PICKER ─────────────────────────────────────────
const _IMG=n=>`<img src="muscles/${n}.svg" style="height:46px;width:auto">`;
const EX_GROUPS=[
  {label:'Pectoraux',               tags:['Pectoraux'],           icon:`<img src="muscles/muscle pectoreaux.png" style="width:64px;height:64px;object-fit:cover;">`,        anatomy:'anatomy/pectoreaux/schema pectoreaux.png'},
  {label:'Dos / Dorsaux',           tags:['Dos'],                 icon:`<img src="muscles/muscles dorsaux trapeze.png" style="height:80px;width:auto;object-fit:contain;">`,  anatomy:'anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png'},
  {label:'Épaules / Trapèzes',      tags:['Épaules','Trapèzes'],  icon:`<img src="muscles/epaule trapeze.png" style="width:64px;height:64px;object-fit:cover;">`,              anatomy:'anatomy/epaules/schéma epaule arriere.png'},
  {label:'Bras — Biceps / Triceps', tags:['Biceps','Triceps'],    icon:`<img src="muscles/muscle bras.png" style="height:80px;width:auto;object-fit:contain;">`,               anatomy:'anatomy/bras biceps triceps/schema muscles bras et avant bras.png'},
  {label:'Jambes',                  tags:['Jambes'],              icon:`<img src="muscles/muscle avant cuisse.png" style="height:80px;width:auto;object-fit:contain;">`, anatomy:'anatomy/jambes/jambes avant/jambes face avant.png'},
  {label:'Fessiers / Ischios / Lombaires', tags:['Fessiers','Lombaires'], icon:`<img src="muscles/fessiers ischios.png" style="height:80px;width:auto;object-fit:contain;">`, anatomy:'anatomy/fessiers lombaires/schema lombaires fessiers.png'},
  {label:'Abdominaux',              tags:['Abdominaux'],          icon:`<img src="muscles/muscle abdominaux.png" style="width:64px;height:64px;object-fit:cover;">`,         anatomy:'anatomy/abdominaux/schema abdominaux.png'},
  {label:'Mollets',                 tags:['Mollets'],             icon:`<img src="muscles/muscle mollet.png" style="width:64px;height:64px;object-fit:cover;">`,            anatomy:'anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png'},
];
let _exGrp=null;

function _exPickRow(e){
  return `<div class="ex-pick" onclick="addExercise('${e.n.replace(/'/g,"\\'")}')"><span class="ex-pick-name">${e.n}${e.custom?' <span style="font-size:10px;color:var(--purp);">✎</span>':''}</span><span class="ex-pick-grp">${e.g}</span></div>`;
}
function openExPicker(){
  _exGrp=null;
  const s=document.getElementById('ex-search');if(s)s.value='';
  filterEx();
  document.getElementById('mod-ex').classList.add('open');
}
function closeExPicker(){document.getElementById('mod-ex').classList.remove('open');hideCustomExForm();_exGrp=null;}
function filterEx(){
  const q=(document.getElementById('ex-search').value||'').toLowerCase().trim();
  const all=[...EXLIB,...(S.customExercises||[])].sort((a,b)=>a.n.localeCompare(b.n,'fr'));
  const list=document.getElementById('ex-list');
  // Recherche active → liste plate
  if(q){
    _exGrp=null;
    const qn=_normEx(q);const f=all.filter(e=>e.n.toLowerCase().includes(q)||_normEx(e.n).includes(qn)||e.g.toLowerCase().includes(q));
    list.innerHTML=f.length?f.map(_exPickRow).join(''):'<div style="padding:20px;text-align:center;color:var(--t3);">Aucun résultat</div>';
    return;
  }
  // Groupe sélectionné → exercices du groupe
  if(_exGrp!==null){
    const grp=EX_GROUPS[_exGrp];
    const f=all.filter(e=>grp.tags.includes(e.g));
    const anatBtn=grp.anatomy
      ?`<button onclick="openAnatomyImg('${grp.anatomy.replace(/'/g,"\\'")}','${grp.label}')" style="background:rgba(255,45,85,.12);border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;color:var(--red);cursor:pointer;display:flex;align-items:center;gap:5px;flex-shrink:0;">🫀 Anatomie</button>`
      :'';
    list.innerHTML=
      `<button class="ex-grp-back" onclick="_exGrp=null;filterEx();">‹ Groupes musculaires</button>`+
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div class="ex-grp-header" style="margin-bottom:0;">${grp.icon} ${grp.label}</div>
        ${anatBtn}
      </div>`+
      (f.length?f.map(_exPickRow).join(''):'<div style="padding:16px;text-align:center;color:var(--t3);">Aucun exercice — utilise "+ Créer"</div>');
    return;
  }
  // Vue par défaut → tuiles des groupes
  list.innerHTML=EX_GROUPS.map((grp,i)=>{
    return `<div class="ex-grp-tile" onclick="_exGrp=${i};filterEx();">
      <span class="ex-grp-icon">${grp.icon}</span>
      <div class="ex-grp-info"><div class="ex-grp-label">${grp.label}</div></div>
      <span class="ex-grp-arrow">›</span>
    </div>`;
  }).join('');
}
function _renderCexChips(){
  const muscles=Object.entries(_MG).map(([k,d])=>({k,l:d.label}));
  ['p','s'].forEach(type=>{
    const el=document.getElementById('cex-muscles-'+type);
    if(!el)return;
    const arr=type==='p'?_cexMusclesP:_cexMusclesS;
    el.innerHTML=muscles.map(({k,l})=>{
      const active=arr.includes(k);
      const col=type==='p'?'var(--red)':'var(--orange)';
      const bg=active?(type==='p'?'rgba(255,45,85,.85)':'rgba(255,149,0,.85)'):'rgba(255,255,255,.06)';
      return `<button onclick="toggleMuscleChip('${k}','${type}')" style="font-size:11px;padding:4px 8px;border-radius:12px;border:1px solid ${active?col:'var(--sep)'};background:${bg};color:${active?'#fff':'var(--t2)'};cursor:pointer;font-family:var(--font);font-weight:${active?700:400};transition:all .15s;">${l}</button>`;
    }).join('');
  });
}
function toggleMuscleChip(key,type){
  const other=type==='p'?'s':'p';
  const arrP=_cexMusclesP,arrS=_cexMusclesS;
  const arr=type==='p'?arrP:arrS;
  const arrOth=type==='p'?arrS:arrP;
  const othIdx=arrOth.indexOf(key);if(othIdx>-1)arrOth.splice(othIdx,1);
  const idx=arr.indexOf(key);
  if(idx>-1)arr.splice(idx,1);else arr.push(key);
  _renderCexChips();
}
function showCustomExForm(){
  _cexMusclesP=[];_cexMusclesS=[];
  document.getElementById('custom-ex-form').style.display='flex';
  document.getElementById('custom-ex-add-btn').style.display='none';
  _renderCexChips();
}
function hideCustomExForm(){
  document.getElementById('custom-ex-form').style.display='none';
  document.getElementById('custom-ex-add-btn').style.display='';
  const n=document.getElementById('custom-ex-name');if(n)n.value='';
  _cexMusclesP=[];_cexMusclesS=[];
}
function _reportCustomEx(name,grp,muscles){
  if(!S.url)return;
  if(!S.reportedCustomEx)S.reportedCustomEx=[];
  if(S.reportedCustomEx.includes(name))return;
  S.reportedCustomEx.push(name);
  localStorage.setItem('ft4_rep_cex',JSON.stringify(S.reportedCustomEx));
  const body={action:'logCustomExercise',anonId:S.anonId||'anon',name,group:grp||'Autres'};
  if(muscles){body.musclesP=muscles.p||[];body.musclesS=muscles.s||[];}
  fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}).catch(()=>{});
}

function saveCustomEx(){
  const name=(document.getElementById('custom-ex-name').value||'').trim();
  const grp=document.getElementById('custom-ex-grp').value;
  if(!name){toast("Entre un nom d'exercice",'error');return;}
  const all=[...EXLIB,...(S.customExercises||[])];
  if(all.find(e=>e.n.toLowerCase()===name.toLowerCase())){toast('Exercice déjà existant','error');return;}
  const similar=_findSimilar(name,all);
  if(similar){
    const lbl=similar.length>22?similar.slice(0,22)+'…':similar;
    showConfirm(
      'Exercice similaire trouvé',
      '"'+similar+'" ressemble à "'+name+'". Utiliser l\'exercice existant ?',
      ()=>{hideCustomExForm();addExercise(similar);},
      'Utiliser "'+lbl+'"',
      'Créer quand même',
      ()=>_doCreateCustomEx(name,grp)
    );
    return;
  }
  _doCreateCustomEx(name,grp);
}
function _doCreateCustomEx(name,grp){
  if(!S.customExercises)S.customExercises=[];
  const muscles=(_cexMusclesP.length||_cexMusclesS.length)?{p:[..._cexMusclesP],s:[..._cexMusclesS]}:null;
  S.customExercises.push({n:name,g:grp,custom:true,...(muscles&&{muscles})});
  persist();_reportCustomEx(name,grp,muscles);hideCustomExForm();filterEx();toast(name+' créé !','success');
}

// ─── IMPORT PROGRAMME PAR PHOTO ──────────────────────────────
let _impPhotos=[],_impExtracted=null,_impMode='new';
let _histPhotos=[],_histExtracted=null,_histConflicts=[];

function openImportProg(){
  _impPhotos=[];_impExtracted=null;_impMode='new';
  impGoStep(1);
  document.getElementById('ov-import-prog').classList.add('open');
}
function closeImportProg(){document.getElementById('ov-import-prog').classList.remove('open');}

function impGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('imp-s'+i);
    if(s)s.style.display='none';
    const dot=document.getElementById('imp-dot-'+i);
    if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('imp-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['imp-cam-inp','imp-gal-inp','imp-more-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function addImportPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const _c2d=canvas.getContext('2d');
      if(!_c2d){URL.revokeObjectURL(url);res(null);return;}
      _c2d.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _impPhotos.push(...results.filter(Boolean));
    _renderImpThumbs();
    impGoStep(2);
  });
}

function _loadPDFJS(){
  return new Promise((res,rej)=>{
    if(window.pdfjsLib){res();return;}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    s.onload=()=>{
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      res();
    };
    s.onerror=()=>rej(new Error('Impossible de charger PDF.js'));
    document.head.appendChild(s);
  });
}
async function _pdfToImages(f){
  await _loadPDFJS();
  const buf=await f.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf)}).promise;
  const MAX_PAGES=8,MAX_DIM=1200;
  const pages=[];
  for(let i=1;i<=Math.min(pdf.numPages,MAX_PAGES);i++){
    const page=await pdf.getPage(i);
    const vp0=page.getViewport({scale:1});
    const scale=Math.min(MAX_DIM/vp0.width,MAX_DIM/vp0.height,2);
    const vp=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(vp.width);
    canvas.height=Math.round(vp.height);
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    pages.push({
      data:canvas.toDataURL('image/jpeg',0.85).split(',')[1],
      type:'image/jpeg',
      name:f.name+(pdf.numPages>1?' p.'+i:'')
    });
  }
  return pages;
}
async function addImportFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15;
  const results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=f.name.toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){
    _impPhotos.push(...results);
    _renderImpThumbs();
    impGoStep(2);
  }
}

function _renderImpThumbs(){
  const el=document.getElementById('imp-thumbs');if(!el)return;
  el.innerHTML=_impPhotos.map((p,i)=>{
    const fileIcon=p.isXlsx?'📊':p.isText?'📝':'📄';
    const thumb=(p.isPdf||p.isText)
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">${fileIcon}</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name||'Fichier'}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeImpPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}

function removeImpPhoto(i){
  _impPhotos.splice(i,1);
  if(!_impPhotos.length){impGoStep(1);return;}
  _renderImpThumbs();
}

async function analyzeImportPhotos(){
  if(!_impPhotos.length){toast('Ajoute au moins une photo','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  impGoStep(3);
  let _rawResp='';
  try{
    const r=await fetch(S.url,{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'importProgram',images:_impPhotos})});
    _rawResp=await r.text();
    console.log('[Import] Réponse brute Apps Script :', _rawResp);
    const d=JSON.parse(_rawResp);
    if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
    _impExtracted=d.data;
    _renderImpConfirm();
    impGoStep(4);
  }catch(e){
    console.error('[Import] Erreur :', e.message, '| Réponse brute :', _rawResp);
    impGoStep(2);
    toast('Erreur analyse : '+e.message,'error');
  }
}

function _renderImpConfirm(){
  const d=_impExtracted;if(!d)return;
  const nameEl=document.getElementById('imp-prog-name');
  if(nameEl)nameEl.textContent=d.name||'Programme importé';
  const el=document.getElementById('imp-preview');if(!el)return;
  el.innerHTML=(d.days||[]).map((day,di)=>`
    <div style="background:var(--bg3);border-radius:10px;padding:10px 12px;">
      <div style="font-weight:700;font-size:13px;color:var(--red);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">${day.label||'Jour '+(di+1)}</div>
      <div id="imp-day-${di}">
        ${(day.exercises||[]).map((ex,ei)=>`
          <div id="imp-ex-${di}-${ei}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg2);border-radius:8px;margin-bottom:5px;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;">${ex.name}</div>
              <div style="font-size:12px;color:var(--t2);">${ex.sets}×${ex.reps} reps${ex.kg?' · '+ex.kg+' kg':''}</div>
              ${ex.note?`<div style="font-size:11px;color:var(--gold);margin-top:2px;font-style:italic;">📋 ${ex.note}</div>`:''}
            </div>
            <button onclick="removeImpEx(${di},${ei})" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:4px;flex-shrink:0;line-height:1;">✕</button>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function removeImpEx(di,ei){
  if(!_impExtracted||!_impExtracted.days[di])return;
  _impExtracted.days[di].exercises.splice(ei,1);
  if(!_impExtracted.days[di].exercises.length)_impExtracted.days.splice(di,1);
  if(!_impExtracted.days.length){toast('Plus aucun exercice','info');impGoStep(2);return;}
  _renderImpConfirm();
}

function _setImpMode(mode){
  _impMode=mode;
  const btnN=document.getElementById('imp-mode-new');
  const btnR=document.getElementById('imp-mode-replace');
  const sel=document.getElementById('imp-replace-sel');
  if(mode==='replace'){
    const progs=S.programmes||[];
    if(!progs.length){toast('Aucun programme existant à remplacer','info');_setImpMode('new');return;}
    sel.innerHTML=progs.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');
    sel.style.display='block';
    if(btnN)btnN.className='btn btn-bg2';
    if(btnR)btnR.className='btn btn-red';
  } else {
    sel.style.display='none';
    if(btnN)btnN.className='btn btn-red';
    if(btnR)btnR.className='btn btn-bg2';
  }
}

function finalImportProg(){
  if(!_impExtracted||!(_impExtracted.days||[]).length){toast('Aucun programme à importer','error');return;}
  if(!S.programmes)S.programmes=[];
  const name=(_impExtracted.name||'Programme '+new Date().toLocaleDateString('fr-FR')).trim();
  const allEx=[...EXLIB,...(S.customExercises||[])].map(e=>e.n.toLowerCase());
  const toCreate=[];
  _impExtracted.days.forEach(day=>(day.exercises||[]).forEach(ex=>{
    const low=ex.name.toLowerCase();
    if(!allEx.includes(low)&&!toCreate.find(n=>n.toLowerCase()===low))toCreate.push(ex.name);
  }));
  if(toCreate.length){
    if(!S.customExercises)S.customExercises=[];
    toCreate.forEach(n=>{S.customExercises.push({n,g:'Autres',custom:true});_reportCustomEx(n,'Autres',null);});
    toast(toCreate.length+' exercice'+(toCreate.length>1?'s':'')+" créé"+(toCreate.length>1?'s':'')+" automatiquement",'info');
  }
  // Construire le programme avec groupes supersets et dropsets
  const _buildProgDay=(day,di)=>{
    const groupMap={};const gSeed=Date.now()+di;
    return{
      label:day.label||'Jour '+(di+1),
      exs:(day.exercises||[]).map(ex=>{
        // Groupe superset/tri-set
        let group;
        if(ex.supersetGroup){
          if(!groupMap[ex.supersetGroup])groupMap[ex.supersetGroup]='ss'+gSeed+'_'+ex.supersetGroup;
          group=groupMap[ex.supersetGroup];
        }
        // Type de série (dropset D, méthode M, etc.)
        const baseType=ex.setType||'N';
        // Séries avec reps+kg par palier (dropsets) ou repsPerSet
        let sets;
        if(ex.repsPerSet&&ex.repsPerSet.length>0){
          sets=ex.repsPerSet.map((r,si)=>({
            kg:(ex.kgPerSet&&ex.kgPerSet[si]!=null?ex.kgPerSet[si]:(ex.kg||0)),
            reps:parseInt(r)||10,
            type:baseType==='N'?((ex.specialSets&&ex.specialSets.includes(si))?'E':'N'):baseType
          }));
        }else{
          sets=Array.from({length:Math.max(1,ex.sets||3)},(_,si)=>({
            kg:(ex.kgPerSet&&ex.kgPerSet[si]!=null?ex.kgPerSet[si]:(ex.kg||0)),
            reps:ex.reps||10,
            type:baseType==='N'?((ex.specialSets&&ex.specialSets.includes(si))?'E':'N'):baseType
          }));
        }
        const obj={name:ex.name,note:ex.note||'',sets};
        if(group)obj.group=group;
        return obj;
      })
    };
  };
  const prog={id:'p'+Date.now(),name,
    weeks:_impExtracted.weeks||0,
    startDate:_impExtracted.startDate||'',
    days:_impExtracted.days.map((day,di)=>_buildProgDay(day,di))
  };
  if(_impMode==='replace'){
    const idx=parseInt((document.getElementById('imp-replace-sel')||{}).value);
    if(!isNaN(idx)&&S.programmes[idx]){
      const oldName=S.programmes[idx].name;
      prog.name=prog.name||oldName;
      S.programmes[idx]=prog;
      persist();closeImportProg();
      toast('"'+oldName+'" mis à jour ✅','success');
      openProgModal();return;
    }
  }
  S.programmes.push(prog);
  persist();
  closeImportProg();
  toast('"'+name+'" importé ! 💪','success');
  openProgModal();
}

// ─── IMPORT HISTORIQUE (flow isolé — ne touche pas au flow programme) ─────────

function openImportHist(){
  _histPhotos=[];_histExtracted=null;_histConflicts=[];
  histGoStep(1);
  document.getElementById('ov-import-hist').classList.add('open');
}
function closeImportHist(){document.getElementById('ov-import-hist').classList.remove('open');}

function histGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('hist-s'+i);
    if(s)s.style.display='none';
    const dot=document.getElementById('hist-dot-'+i);
    if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('hist-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['hist-cam-inp','hist-gal-inp','hist-more-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function addHistPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');
      if(!ctx){URL.revokeObjectURL(url);res(null);return;}
      ctx.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _histPhotos.push(...results.filter(Boolean));
    _renderHistThumbs();
    histGoStep(2);
  });
}

async function addHistFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15;
  const results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=f.name.toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){
    _histPhotos.push(...results);
    _renderHistThumbs();
    histGoStep(2);
  }
}

function _renderHistThumbs(){
  const el=document.getElementById('hist-thumbs');if(!el)return;
  el.innerHTML=_histPhotos.map((p,i)=>{
    const thumb=(p.isPdf||p.isText)
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">📄</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name||'Page'}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeHistPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}

function removeHistPhoto(i){
  _histPhotos.splice(i,1);
  if(!_histPhotos.length){histGoStep(1);return;}
  _renderHistThumbs();
}

// Analyse par LOTS de 3 pages max : la réponse IA a une taille limitée (8192 tokens
// côté backend @58) — un gros journal envoyé d'un coup rend un JSON tronqué/invalide.
// Chaque lot est analysé séparément, puis les séances de tous les lots sont fusionnées.
const _HIST_BATCH=3;
async function _histAnalyzeBatch(imgs){
  const r=await fetch(S.url,{method:'POST',redirect:'follow',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action:'importHistory',images:imgs})});
  const raw=await r.text();
  console.log('[ImportHist] Réponse brute lot :', raw.slice(0,500));
  const d=JSON.parse(raw);
  if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
  return (d.data.sessions||[]);
}
// Limite premium : import de journal gratuit = 1 seul au total (illimité en premium).
// ⚠️ Ne concerne QUE l'import de journal — l'import de PROGRAMME n'est pas limité.
const HIST_FREE_LIMIT=1;
function showHistWall(){const el=document.getElementById('ov-hist-wall');if(el)el.classList.add('open');}
function closeHistWall(){const el=document.getElementById('ov-hist-wall');if(el)el.classList.remove('open');}
async function analyzeHistPhotos(){
  if(!_histPhotos.length){toast('Ajoute au moins une photo ou un PDF','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  // Mur premium au 2e import d'un utilisateur gratuit → ne PAS lancer l'analyse
  if(!S.premium&&(S.histImports||0)>=HIST_FREE_LIMIT){
    if(window._premiumPending){toast('Vérification du statut premium…','info');return;}
    closeImportHist();
    showHistWall();
    return;
  }
  histGoStep(3);
  const statusEl=document.getElementById('hist-s3-status');
  const batches=[];
  for(let i=0;i<_histPhotos.length;i+=_HIST_BATCH)batches.push(_histPhotos.slice(i,i+_HIST_BATCH));
  const allSessions=[];let failed=0,lastErr='';
  for(let b=0;b<batches.length;b++){
    if(statusEl)statusEl.textContent=batches.length>1
      ?`Analyse du lot ${b+1} / ${batches.length} (${batches[b].length} page${batches[b].length>1?'s':''})…`
      :'Claude extrait les séances et leurs dates depuis tes pages';
    try{
      const sess=await _histAnalyzeBatch(batches[b]);
      // Coupure de séance entre 2 lots (une séance à cheval sur 2 pages) :
      // même date en fin de lot précédent et début de lot suivant → fusion des exercices
      if(allSessions.length&&sess.length){
        const prev=allSessions[allSessions.length-1],next=sess[0];
        if(prev.date&&prev.date===next.date&&!next.estimatedDate){
          prev.exercises=(prev.exercises||[]).concat(next.exercises||[]);
          sess.shift();
        }
      }
      allSessions.push(...sess);
    }catch(e){
      failed++;lastErr=e.message||String(e);
      console.error('[ImportHist] Lot',b+1,'en échec :',lastErr);
    }
  }
  if(statusEl)statusEl.textContent='Claude extrait les séances et leurs dates depuis tes pages';
  if(!allSessions.length){
    histGoStep(2);
    const dense=/JSON invalide|tronqu/i.test(lastErr);
    toast(dense?'Pages trop denses pour l\'analyse — réessaie avec moins de pages à la fois':'Erreur analyse : '+lastErr,'error');
    return;
  }
  if(failed)toast(failed+' lot'+(failed>1?'s':'')+' non lu'+(failed>1?'s':'')+' — vérifie l\'aperçu, tu pourras réimporter les pages manquantes','info');
  _histExtracted={sessions:allSessions};
  _renderHistPreview();
  histGoStep(4);
}

function _renderHistPreview(){
  const sessions=(_histExtracted&&_histExtracted.sessions)||[];
  if(!sessions.length)return;

  // Détection conflits
  _histConflicts=[];
  sessions.forEach((sess,i)=>{
    const existing=(S.sessions||[]).find(s=>s.date===sess.date);
    if(existing)_histConflicts.push({idx:i,existing,resolution:'add'});
  });

  // Résumé
  const dates=sessions.map(s=>s.date).filter(Boolean).sort();
  const from=dates.length?_histFmtDate(dates[0]):'?';
  const to=dates.length?_histFmtDate(dates[dates.length-1]):'?';
  const summEl=document.getElementById('hist-summary');
  if(summEl)summEl.textContent=sessions.length+' séance'+(sessions.length>1?'s':'')+' trouvée'+(sessions.length>1?'s':'')+' · '+from+' → '+to;

  const el=document.getElementById('hist-preview');if(!el)return;
  el.innerHTML=sessions.map((sess,i)=>{
    const conflict=_histConflicts.find(c=>c.idx===i);
    const dateLabel=sess.date?_histFmtDate(sess.date):'Date inconnue';
    const estBadge=sess.estimatedDate?'<span style="color:var(--gold);font-size:11px;margin-left:6px;">📅 estimée</span>':'';
    const exList=(sess.exercises||[]).slice(0,3).map(e=>e.name).join(', ')
      +((sess.exercises||[]).length>3?' +'+((sess.exercises||[]).length-3):'');
    const conflictHtml=conflict?`
      <div style="background:rgba(255,45,85,.08);border:1px solid rgba(255,45,85,.25);border-radius:8px;padding:8px 10px;margin-top:6px;">
        <div style="color:var(--red);font-weight:600;font-size:12px;margin-bottom:6px;">⚠️ Séance déjà existante ce jour</div>
        <div style="display:flex;gap:6px;">
          <button id="hist-cf-${i}-replace" class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'replace')">🔄 Remplacer</button>
          <button id="hist-cf-${i}-keep"    class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'keep')">✋ Garder</button>
          <button id="hist-cf-${i}-add"     class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'add')">➕ Les 2</button>
        </div>
        <div id="hist-conflict-status-${i}" style="font-size:11px;color:var(--gold);margin-top:4px;text-align:center;">➕ Ajouter les 2 (par défaut)</div>
      </div>`:'';
    return`<div style="background:var(--bg3);border-radius:10px;padding:10px 12px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;margin-bottom:3px;">
        <span style="font-weight:700;font-size:14px;">${dateLabel}</span>${estBadge}
      </div>
      <div style="font-size:12px;color:var(--t2);">${sess.label||''}</div>
      <div style="font-size:12px;color:var(--t3);margin-top:2px;">${exList}</div>
      ${conflictHtml}
    </div>`;
  }).join('');
}

function _histFmtDate(iso){
  if(!iso)return'?';
  const p=iso.split('-');
  return(p[2]||'?')+'/'+(p[1]||'?')+'/'+(p[0]||'');
}

function _setHistConflict(sessIdx,choice){
  const c=_histConflicts.find(x=>x.idx===sessIdx);
  if(c)c.resolution=choice;
  const lbl=document.getElementById('hist-conflict-status-'+sessIdx);
  if(lbl){
    const labels={replace:'🔄 Remplace la séance existante',keep:'✋ Séance existante conservée',add:'➕ Les 2 séances coexisteront'};
    lbl.textContent=labels[choice]||'';
  }
  ['replace','keep','add'].forEach(ch=>{
    const btn=document.getElementById('hist-cf-'+sessIdx+'-'+ch);
    if(!btn)return;
    btn.style.background=ch===choice?'var(--red)':'var(--bg3)';
    btn.style.color=ch===choice?'#fff':'var(--t1)';
  });
}

function finalImportHist(){
  const sessions=(_histExtracted&&_histExtracted.sessions)||[];
  if(!sessions.length){toast('Aucune séance à importer','error');return;}

  // Créer les exercices personnalisés manquants
  const allExNames=new Set([...EXLIB,...(S.customExercises||[])].map(e=>e.n.toLowerCase()));
  const toCreate=[];
  sessions.forEach(sess=>(sess.exercises||[]).forEach(ex=>{
    const low=(ex.name||'').toLowerCase();
    if(low&&!allExNames.has(low)&&!toCreate.find(n=>n.toLowerCase()===low))toCreate.push(ex.name);
  }));
  if(toCreate.length){
    if(!S.customExercises)S.customExercises=[];
    toCreate.forEach(n=>{S.customExercises.push({n,g:'Autres',custom:true});_reportCustomEx(n,'Autres',null);});
  }

  const now=Date.now();
  let addedCount=0;

  // Trier par date ASC pour insertion + calcul PRs chronologique
  const sessionsAsc=[...sessions].sort((a,b)=>(a.date||'').localeCompare(b.date||''));

  sessionsAsc.forEach((sess,si)=>{
    const origIdx=sessions.indexOf(sess);
    const conflict=_histConflicts.find(c=>c.idx===origIdx);

    if(conflict&&conflict.resolution==='keep')return;
    if(conflict&&conflict.resolution==='replace'){
      const idx=(S.sessions||[]).findIndex(s=>s.date===sess.date);
      if(idx>=0)S.sessions.splice(idx,1);
    }

    // Construire la séance au format attendu par l'app
    let vol=0;
    const exs=(sess.exercises||[]).map(ex=>{
      const sets=(ex.sets||[]).map(s=>{
        const kg=s.kg||0,reps=s.reps||0;
        const type=s.type==='D'?'D':'';
        // Volume : tout sauf Échauffement (W). Drop set D compte.
        if(type!=='W'&&type!=='É')vol+=kg*reps;
        return{kg,reps,done:true,type,rm1:bz(kg,reps),note:s.note||''};
      });
      return{name:ex.name,note:ex.note||'',sets};
    });

    const dateTs=sess.date?new Date(sess.date).getTime():now;
    const sessionObj={
      id:now+si,
      date:sess.date||today(),
      ts:dateTs+si,
      exs,
      volume:Math.round(vol),
      synced:false,
      startHour:null,
      duration:0,
      importedHistory:true
    };
    if(!S.sessions)S.sessions=[];
    S.sessions.push(sessionObj);
    addedCount++;
  });

  if(!addedCount){
    toast('Aucune séance importée (toutes conservées)','info');
    closeImportHist();
    return;
  }

  // Trier S.sessions par date DESC (plus récente en tête, comme finishWorkout)
  S.sessions.sort((a,b)=>{
    const ta=a.ts||new Date(a.date||'').getTime()||0;
    const tb=b.ts||new Date(b.date||'').getTime()||0;
    return tb-ta;
  });

  // Recalculer les PRs depuis toutes les séances importées (chrono ASC, jamais écraser + élevé)
  if(!S.prs)S.prs={};
  const importedAsc=S.sessions.filter(s=>s.importedHistory).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  importedAsc.forEach(sess=>{
    (sess.exs||[]).forEach(ex=>{
      (ex.sets||[]).forEach(s=>{
        if(!s.done||!s.kg||!s.reps)return;
        const rm=bz(s.kg,s.reps);
        const cur=S.prs[ex.name];
        if(!cur||rm>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};
      });
    });
  });

  // Compte l'import journal réussi (limite premium : 1 gratuit au total)
  S.histImports=(S.histImports||0)+1;

  persist();
  _cloudSyncSessions();
  checkBadges(true);
  closeImportHist();
  toast(addedCount+' séance'+(addedCount>1?'s':'')+' importée'+(addedCount>1?'s':'')+' dans l\'historique ✅','success');
}

// ─── SÉLECTION DU JOUR ────────────────────────────────────────
let _daySelProgIdx=-1;

function openDaySel(progIdx){
  const prog=(S.programmes||[])[progIdx];if(!prog||!prog.days)return;
  _daySelProgIdx=progIdx;
  const nameEl=document.getElementById('day-sel-prog-name');
  if(nameEl)nameEl.textContent=prog.name;
  const btns=document.getElementById('day-sel-btns');
  if(btns)btns.innerHTML=(prog.days||[]).map((d,i)=>`
    <button class="btn btn-bg2" style="padding:14px 16px;text-align:left;" onclick="loadProgDay(${progIdx},${i})">
      <div style="font-weight:700;font-size:14px;">${d.label}</div>
      <div style="font-size:12px;color:var(--t2);margin-top:3px;">${(d.exs||[]).slice(0,3).map(e=>e.name).join(', ')}${(d.exs||[]).length>3?' +'+((d.exs||[]).length-3):''}</div>
    </button>`).join('');
  document.getElementById('ov-day-sel').classList.add('open');
}

function closeDaySel(){document.getElementById('ov-day-sel').classList.remove('open');}

function loadProgDay(progIdx,dayIdx){
  const prog=(S.programmes||[])[progIdx];
  if(!prog||!prog.days||!prog.days[dayIdx])return;
  const day=prog.days[dayIdx];
  S.wkt={date:today(),exs:(day.exs||[]).map(e=>{
    const prev=getPrev(e.name);
    const obj={name:e.name,note:e.note||'',sets:(e.sets||[]).map(s=>({
      kg:prev.length?prev[0].kg:(s.kg||0),
      reps:prev.length?prev[0].reps:(s.reps||10),
      type:s.type||'N',done:false,rm1:0
    }))};
    if(e.group)obj.group=e.group; // propage le groupe superset
    return obj;
  })};
  persist();closeDaySel();closeProgModal();
  _expandedEx=0;
  goScreen('log',document.getElementById('nb-log'));
  renderExBlocks();
  toast('"'+prog.name+' — '+day.label+'" chargé ! 💪','success');
}

// ─── PROGRAMMES ──────────────────────────────────────────────
function openProgModal(){
  renderProgModal();
  document.getElementById('mod-prog').classList.add('open');
}
function closeProgModal(){
  document.getElementById('mod-prog').classList.remove('open');
}
function renderProgModal(){
  if(!S.programmes)S.programmes=[];
  const progs=S.programmes;
  const list=document.getElementById('prog-list-modal');
  if(!progs.length){
    list.innerHTML='<div style="text-align:center;color:var(--t3);padding:14px 0;font-size:14px;">Aucun programme sauvegardé.<br>Crée une séance et utilise "Sauvegarder" !</div>';
  }else{
    list.innerHTML=progs.map((p,i)=>{
      const isMulti=p.days&&p.days.length;
      let detail='';
      if(isMulti){
        detail=p.days.length+' jour'+(p.days.length>1?'s':'')+' · '+p.days.map(d=>d.label).join(' / ');
      }else{
        const exs=p.exs||[];
        const exNames=exs.slice(0,3).map(e=>e.name).join(', ')+(exs.length>3?' +'+(exs.length-3):'');
        detail=exs.length+' exercice'+(exs.length>1?'s':'')+' · '+exNames;
      }
      const hasCycle=p.weeks>0;
      const curW=hasCycle?getProgCurrentWeek(p):0;
      const pct=hasCycle?Math.round(curW/p.weeks*100):0;
      const fmt_d=s=>s?new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'';
      const endDate=p.startDate&&p.weeks?new Date(new Date(p.startDate).getTime()+p.weeks*7*86400000):null;
      const cycleHtml=hasCycle?`<div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:12px;font-weight:700;color:var(--t1);">Semaine ${curW} / ${p.weeks}</span>
          <div style="display:flex;align-items:center;gap:5px;">
            ${p.startDate?`<span style="font-size:11px;color:var(--t3);">${fmt_d(p.startDate)}${endDate?' → '+fmt_d(endDate.toISOString().split('T')[0]):''}</span>`:''}
            <button onclick="event.stopPropagation();shiftProgStart(${i},-1)" style="width:22px;height:22px;border-radius:5px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:13px;cursor:pointer;padding:0;line-height:1;font-family:var(--font);">−</button>
            <button onclick="event.stopPropagation();shiftProgStart(${i},1)" style="width:22px;height:22px;border-radius:5px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:13px;cursor:pointer;padding:0;line-height:1;font-family:var(--font);">+</button>
          </div>
        </div>
        <div style="height:5px;background:var(--sep);border-radius:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:var(--red);border-radius:3px;"></div></div>
      </div>`:'';
      return `<div class="prog-card" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <div class="prog-card-name">${isMulti?'📅 ':'📋 '}${p.name}</div>
            <div class="prog-card-detail">${detail}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <button class="btn-xs" style="background:rgba(255,45,85,.12);border-color:rgba(255,45,85,.4);color:var(--red);" onclick="loadProg(${i})">▶ Charger</button>
            <button class="btn-xs" style="color:var(--t2);" onclick="editProg(${i})">✏️</button>
            ${S.premium?`<button class="btn-xs" style="color:#AF52DE;" onclick="analyzeProgIa(${i})" title="Analyser avec le Coach IA">🤖</button>`:''}
            <button class="btn-xs" style="color:var(--red);border-color:rgba(255,45,85,.3);" onclick="deleteProg(${i})">✕</button>
          </div>
        </div>
        ${cycleHtml}
      </div>`;
    }).join('');
  }
  // Affiche la section "Sauvegarder" seulement si une séance est en cours
  const saveSection=document.getElementById('prog-save-section');
  if(saveSection){
    const hasExs=S.wkt&&S.wkt.exs&&S.wkt.exs.length>0;
    saveSection.style.display=hasExs?'flex':'none';
    const inp=document.getElementById('prog-name-inp');
    if(inp&&!inp.value)inp.value='';
  }
}
function saveAsProg(){
  const name=(document.getElementById('prog-name-inp').value||'').trim();
  if(!name){toast('Donne un nom au programme','error');return;}
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){toast('Aucun exercice dans la séance','error');return;}
  if(!S.programmes)S.programmes=[];
  const prog={
    id:'p'+Date.now(),name,
    exs:S.wkt.exs.map(ex=>({
      name:ex.name,
      sets:ex.sets.map(s=>({kg:s.kg||0,reps:s.reps||5,type:s.type||'N'}))
    }))
  };
  const idx=S.programmes.findIndex(p=>p.name.toLowerCase()===name.toLowerCase());
  if(idx>=0){S.programmes[idx]=prog;toast('"'+name+'" mis à jour ✅','success');}
  else{S.programmes.push(prog);toast('"'+name+'" sauvegardé ✅','success');}
  persist();
  renderProgModal();
}
function loadProg(idx){
  const prog=(S.programmes||[])[idx];
  if(!prog)return;
  if(prog.days&&prog.days.length){closeProgModal();openDaySel(idx);return;}
  S.wkt={
    date:today(),
    exs:(prog.exs||[]).map(e=>{
      const prev=getPrev(e.name);
      return{name:e.name,sets:(e.sets||[]).map(s=>({
        kg:prev.length?prev[0].kg:(s.kg||0),
        reps:prev.length?prev[0].reps:(s.reps||5),
        type:s.type||'N',done:false,rm1:0
      }))};
    })
  };
  persist();
  closeProgModal();
  goScreen('log',document.getElementById('nb-log'));
  renderExBlocks();
  toast('"'+prog.name+'" chargé ! 💪','success');
}
function deleteProg(idx){
  if(!S.programmes)return;
  const name=S.programmes[idx].name;
  S.programmes.splice(idx,1);
  persist();renderProgModal();
  toast('"'+name+'" supprimé','info');
}
function editProg(idx){
  const prog=(S.programmes||[])[idx];
  if(!prog)return;
  _editProgIdx=idx;
  _editProgData=JSON.parse(JSON.stringify(prog));
  _renderProgEdit();
  document.getElementById('ov-prog-edit').classList.add('open');
}
function _renderProgEdit(){
  const d=_editProgData;if(!d)return;
  const nameInp=document.getElementById('prog-edit-name');
  if(nameInp)nameInp.value=d.name;
  const el=document.getElementById('prog-edit-content');if(!el)return;
  const isMulti=d.days&&d.days.length;
  const cycleSection=`<div style="background:var(--bg3);border-radius:12px;padding:12px;margin-bottom:14px;">
    <div style="font-size:11px;font-weight:800;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">📅 Cycle</div>
    <div style="display:flex;gap:8px;">
      <div style="flex:1;">
        <div style="font-size:12px;color:var(--t3);margin-bottom:4px;">Durée (sem.)</div>
        <input id="prog-edit-weeks" type="number" min="1" max="52" value="${d.weeks||''}" placeholder="ex: 7" style="width:100%;background:var(--bg2);border:1px solid var(--sep);border-radius:8px;padding:9px 6px;color:var(--t1);font-size:15px;font-weight:700;font-family:var(--font);outline:none;text-align:center;box-sizing:border-box;">
      </div>
      <div style="flex:2;">
        <div style="font-size:12px;color:var(--t3);margin-bottom:4px;">Date de début</div>
        <input id="prog-edit-start" type="date" value="${d.startDate||''}" style="width:100%;background:var(--bg2);border:1px solid var(--sep);border-radius:8px;padding:9px 8px;color:var(--t1);font-size:14px;font-family:var(--font);outline:none;box-sizing:border-box;-webkit-appearance:none;">
      </div>
    </div>
  </div>`;
  const exCard=(ex,di,ei)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:10px;margin-bottom:5px;">
    <div style="flex:1;min-width:0;overflow:hidden;">
      <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ex.name}</div>
      <div style="font-size:12px;color:var(--t2);">${ex.sets?ex.sets.length:0} série${(ex.sets&&ex.sets.length>1)?'s':''} · ${ex.sets&&ex.sets[0]?ex.sets[0].reps:10} reps</div>
    </div>
    <button onclick="_removeExFromProgEdit(${di},${ei})" style="background:none;border:none;color:var(--t3);font-size:20px;line-height:1;cursor:pointer;padding:4px;">×</button>
  </div>`;
  const addBtn=(di)=>`<button onclick="_openExPickerForProg(${di})" style="width:100%;padding:10px;background:transparent;border:1px dashed var(--sep);border-radius:10px;color:var(--t2);font-size:13px;cursor:pointer;margin-top:2px;">+ Ajouter un exercice</button>`;
  if(isMulti){
    el.innerHTML=cycleSection+d.days.map((day,di)=>`<div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:800;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">${day.label}</div>
      ${(day.exs||[]).map((ex,ei)=>exCard(ex,di,ei)).join('')}
      ${addBtn(di)}
    </div>${di<d.days.length-1?'<hr style="border:none;border-top:1px solid var(--sep);margin:0 0 16px;">':''}`).join('');
  }else{
    el.innerHTML=cycleSection+(d.exs||[]).map((ex,ei)=>exCard(ex,0,ei)).join('')+addBtn(0);
  }
}
function _openExPickerForProg(dayIdx){
  _editDayIdx=dayIdx;
  _exPickerMode='prog';
  openExPicker();
}
function _removeExFromProgEdit(dayIdx,exIdx){
  const d=_editProgData;if(!d)return;
  if(d.days&&d.days.length)(d.days[dayIdx].exs||[]).splice(exIdx,1);
  else(d.exs||[]).splice(exIdx,1);
  _renderProgEdit();
}
function _addExToProgEdit(name){
  const d=_editProgData;if(!d)return;
  const newEx={name,sets:[{kg:0,reps:10,type:'N'},{kg:0,reps:10,type:'N'},{kg:0,reps:10,type:'N'}]};
  if(d.days&&d.days.length){
    if(!d.days[_editDayIdx])return;
    if(!d.days[_editDayIdx].exs)d.days[_editDayIdx].exs=[];
    d.days[_editDayIdx].exs.push(newEx);
  }else{
    if(!d.exs)d.exs=[];
    d.exs.push(newEx);
  }
  _renderProgEdit();
  document.getElementById('ov-prog-edit').classList.add('open');
  toast(name+' ajouté !','info');
}
function saveProgEdit(){
  if(!_editProgData||_editProgIdx<0)return;
  const nameInp=document.getElementById('prog-edit-name');
  if(nameInp&&nameInp.value.trim())_editProgData.name=nameInp.value.trim();
  const weeksInp=document.getElementById('prog-edit-weeks');
  const startInp=document.getElementById('prog-edit-start');
  if(weeksInp)_editProgData.weeks=parseInt(weeksInp.value)||0;
  if(startInp)_editProgData.startDate=startInp.value||'';
  S.programmes[_editProgIdx]=_editProgData;
  persist();
  closeProgEdit();
  toast('Programme mis à jour ✅','success');
  openProgModal();
}
function closeProgEdit(){
  document.getElementById('ov-prog-edit').classList.remove('open');
  _editProgIdx=-1;_editProgData=null;
}
function getProgCurrentWeek(prog){
  if(!prog.startDate||!prog.weeks)return 1;
  const days=Math.floor((new Date()-new Date(prog.startDate))/(86400000));
  return Math.max(1,Math.min(prog.weeks,Math.ceil((days+1)/7)));
}
function shiftProgStart(idx,delta){
  const prog=(S.programmes||[])[idx];if(!prog)return;
  if(!prog.startDate)prog.startDate=today();
  const d=new Date(prog.startDate);
  d.setDate(d.getDate()+delta*7);
  prog.startDate=d.toISOString().split('T')[0];
  persist();renderProgModal();
}
let _lastProgAnalysisProg=null,_lastProgAnalysisReply='';
function _formatProgForAnalysis(prog){
  if(prog.days&&prog.days.length){
    return prog.days.map(day=>{
      const exs=(day.exs||[]).map(ex=>{
        const sets=ex.sets?ex.sets.length:3;
        const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;
        const kg=ex.sets&&ex.sets[0]&&ex.sets[0].kg?' × '+ex.sets[0].kg+'kg':'';
        return '  - '+ex.name+' : '+sets+'×'+reps+kg;
      }).join('\n');
      return '📅 '+day.label+'\n'+exs;
    }).join('\n\n');
  }
  return (prog.exs||[]).map(ex=>{
    const sets=ex.sets?ex.sets.length:3;
    const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;
    const kg=ex.sets&&ex.sets[0]&&ex.sets[0].kg?' × '+ex.sets[0].kg+'kg':'';
    return '  - '+ex.name+' : '+sets+'×'+reps+kg;
  }).join('\n');
}
function _coachFmtHtml(text){
  let html=text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>');
  if(!html.includes('<p>')&&!html.includes('<ul>'))html='<p>'+html+'</p>';
  return html;
}
async function analyzeProgIa(idx){
  if(!S.premium){toast('Fonctionnalité Premium ⭐','info');return;}
  const prog=(S.programmes||[])[idx];
  if(!prog){toast('Programme introuvable','error');return;}
  if(!S.url){toast('Configure ton URL Apps Script dans Profil','error');return;}
  const ov=document.getElementById('ov-prog-analysis');
  const content=document.getElementById('prog-analysis-content');
  const footer=document.getElementById('prog-analysis-footer');
  const titleEl=document.getElementById('prog-analysis-title');
  if(!ov||!content)return;
  if(titleEl)titleEl.textContent=prog.name;
  content.innerHTML='<div style="text-align:center;padding:32px 0;"><div style="font-size:32px;margin-bottom:12px;">🤖</div><div style="color:var(--t2);font-size:14px;">Analyse en cours…</div></div>';
  if(footer)footer.style.display='none';
  ov.classList.add('open');
  const progText=_formatProgForAnalysis(prog);
  const message='Analyse ce programme d\'entraînement en tant que coach expert. Réponds en 4 parties :\n\n🎯 VERDICT GLOBAL (1 phrase directe et honnête)\n✅ POINTS FORTS\n⚠️ POINTS À AMÉLIORER\n💡 RECOMMANDATIONS CONCRÈTES (actions à faire)\n\nSois direct, concret et personnalisé selon mon profil.\n\nProgramme : "'+prog.name+'"\n'+progText;
  try{
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'coach',message,context:buildCoachContext(),history:[]})});
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const data=await resp.json();
    const reply=data.reply||'Erreur lors de l\'analyse.';
    _lastProgAnalysisReply=reply;_lastProgAnalysisProg=prog;
    content.innerHTML='<div style="font-size:14px;line-height:1.7;color:var(--t1);">'+_coachFmtHtml(reply)+'</div>';
    if(footer)footer.style.display='block';
  }catch(e){
    content.innerHTML='<div style="color:var(--red);padding:20px;text-align:center;">Erreur de connexion. Vérifie ta connexion et réessaie.</div>';
  }
}
function continueInCoach(){
  document.getElementById('ov-prog-analysis').classList.remove('open');
  if(_lastProgAnalysisReply&&_lastProgAnalysisProg){
    coachHistory=[
      {role:'user',content:'Analyse mon programme "'+_lastProgAnalysisProg.name+'".'},
      {role:'assistant',content:_lastProgAnalysisReply}
    ];
    const msgs=document.getElementById('coach-msgs');
    if(msgs){
      msgs.innerHTML='';
      renderCoachMsg('user','Analyse mon programme "'+_lastProgAnalysisProg.name+'".');
      renderCoachMsg('coach',_lastProgAnalysisReply);
    }
    const suggs=document.getElementById('coach-suggs');
    if(suggs)suggs.style.display='none';
  }
  goScreen('coach',document.getElementById('nb-coach'));
}

// ─── EXERCISE VIDEO / IMAGE ───────────────────────────────────
const gifCache={};

// ─── MUSCLE GROUP SVG TEMPLATES (fallback si aucune image trouvée) ───
const _MUSCLE_SVG=(function(){
  // Silhouette masculine — épaules larges, hanches étroites
  const BDY=`<g fill="var(--bg3)" stroke="var(--sep)" stroke-width="1.2">
<circle cx="50" cy="14" r="11"/>
<path d="M44 25 L56 25 L58 34 L42 34Z"/>
<path d="M24 38 Q50 33 76 38 L76 98 Q50 102 24 98Z"/>
<path d="M24 38 L16 40 L10 86 L22 88 L24 38Z"/>
<path d="M76 38 L84 40 L90 86 L78 88 L76 38Z"/>
<path d="M10 86 L22 88 L21 114 L9 112Z"/>
<path d="M90 86 L78 88 L79 114 L91 112Z"/>
<rect x="27" y="99" width="19" height="52" rx="6"/>
<rect x="54" y="99" width="19" height="52" rx="6"/>
<rect x="28" y="153" width="17" height="38" rx="6"/>
<rect x="55" y="153" width="17" height="38" rx="6"/>
</g>`;
  function t(hl,lbl,note){
    return `<svg viewBox="0 0 100 202" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:158px;display:block;margin:0 auto">${BDY}<g fill="#FF2D55" opacity="0.85">${hl}</g><text x="50" y="196" text-anchor="middle" font-size="10" fill="var(--t1)" font-weight="700" font-family="sans-serif">${lbl}</text>${note?`<text x="50" y="201" text-anchor="middle" font-size="7" fill="var(--t3)" font-family="sans-serif">${note}</text>`:''}</svg>`;
  }
  return {
    'Pectoraux': t(`<ellipse cx="37" cy="56" rx="13" ry="11"/><ellipse cx="63" cy="56" rx="13" ry="11"/>`,'Pectoraux'),
    'Dos':       t(`<ellipse cx="37" cy="64" rx="12" ry="14"/><ellipse cx="63" cy="64" rx="12" ry="14"/>`,'Dos','(vue dos)'),
    'Trapèzes':  t(`<path d="M34 29 Q50 23 66 29 L63 50 Q50 54 37 50Z"/>`,'Trapèzes','(vue dos)'),
    'Épaules':   t(`<ellipse cx="20" cy="45" rx="9" ry="8"/><ellipse cx="80" cy="45" rx="9" ry="8"/>`,'Épaules'),
    'Biceps':    t(`<rect x="13" y="46" width="10" height="22" rx="4"/><rect x="77" y="46" width="10" height="22" rx="4"/>`,'Biceps'),
    'Triceps':   t(`<rect x="13" y="46" width="10" height="22" rx="4"/><rect x="77" y="46" width="10" height="22" rx="4"/>`,'Triceps','(vue dos)'),
    'Avant-bras':t(`<rect x="11" y="70" width="10" height="26" rx="4"/><rect x="79" y="70" width="10" height="26" rx="4"/>`,'Avant-bras'),
    'Abdominaux':t(`<rect x="35" y="68" width="30" height="28" rx="5"/>`,'Abdominaux'),
    'Jambes':    t(`<rect x="28" y="100" width="18" height="50" rx="6"/><rect x="54" y="100" width="18" height="50" rx="6"/>`,'Jambes'),
    'Fessiers':  t(`<ellipse cx="38" cy="104" rx="14" ry="12"/><ellipse cx="62" cy="104" rx="14" ry="12"/>`,'Fessiers','(vue dos)'),
    'Mollets':   t(`<rect x="29" y="154" width="16" height="36" rx="5"/><rect x="55" y="154" width="16" height="36" rx="5"/>`,'Mollets'),
    'Full Body': t(`<ellipse cx="37" cy="56" rx="13" ry="11" opacity="0.55"/><ellipse cx="63" cy="56" rx="13" ry="11" opacity="0.55"/><ellipse cx="20" cy="45" rx="9" ry="8" opacity="0.55"/><ellipse cx="80" cy="45" rx="9" ry="8" opacity="0.55"/><rect x="28" y="100" width="18" height="50" rx="6" opacity="0.55"/><rect x="54" y="100" width="18" height="50" rx="6" opacity="0.55"/><rect x="13" y="46" width="10" height="22" rx="4" opacity="0.55"/><rect x="77" y="46" width="10" height="22" rx="4" opacity="0.55"/>`,'Full Body'),
  };
})();
const _MUSCLE_SVG_F=(function(){
  // Silhouette féminine — épaules étroites, taille marquée, hanches plus larges, suggestion poitrine
  const BDY=`<g fill="var(--bg3)" stroke="var(--sep)" stroke-width="1.2">
<circle cx="50" cy="13" r="10"/>
<path d="M45 23 L55 23 L56 31 L44 31Z"/>
<path d="M31 35 Q50 30 69 35 L68 54 Q61 59 57 62 Q53 66 50 64 Q47 66 43 62 Q39 59 32 54Z"/>
<path d="M32 54 Q23 69 22 93 L78 93 Q77 69 68 54 Q61 59 57 62 Q53 66 50 64 Q47 66 43 62 Q39 59 32 54Z"/>
<path d="M31 35 L22 38 L16 84 L26 86Z"/>
<path d="M69 35 L78 38 L84 84 L74 86Z"/>
<path d="M16 84 L26 86 L25 110 L15 108Z"/>
<path d="M84 84 L74 86 L75 110 L85 108Z"/>
<rect x="23" y="94" width="21" height="50" rx="7"/>
<rect x="56" y="94" width="21" height="50" rx="7"/>
<rect x="25" y="146" width="17" height="37" rx="6"/>
<rect x="58" y="146" width="17" height="37" rx="6"/>
</g>`;
  function t(hl,lbl,note){
    return `<svg viewBox="0 0 100 202" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:158px;display:block;margin:0 auto">${BDY}<g fill="#FF2D55" opacity="0.85">${hl}</g><text x="50" y="196" text-anchor="middle" font-size="10" fill="var(--t1)" font-weight="700" font-family="sans-serif">${lbl}</text>${note?`<text x="50" y="201" text-anchor="middle" font-size="7" fill="var(--t3)" font-family="sans-serif">${note}</text>`:''}</svg>`;
  }
  return {
    'Pectoraux': t(`<ellipse cx="37" cy="50" rx="11" ry="10"/><ellipse cx="63" cy="50" rx="11" ry="10"/>`,'Pectoraux'),
    'Dos':       t(`<ellipse cx="37" cy="65" rx="11" ry="13"/><ellipse cx="63" cy="65" rx="11" ry="13"/>`,'Dos','(vue dos)'),
    'Trapèzes':  t(`<path d="M36 27 Q50 21 64 27 L62 48 Q50 52 38 48Z"/>`,'Trapèzes','(vue dos)'),
    'Épaules':   t(`<ellipse cx="22" cy="43" rx="8" ry="7"/><ellipse cx="78" cy="43" rx="8" ry="7"/>`,'Épaules'),
    'Biceps':    t(`<rect x="15" y="45" width="9" height="21" rx="4"/><rect x="76" y="45" width="9" height="21" rx="4"/>`,'Biceps'),
    'Triceps':   t(`<rect x="15" y="45" width="9" height="21" rx="4"/><rect x="76" y="45" width="9" height="21" rx="4"/>`,'Triceps','(vue dos)'),
    'Avant-bras':t(`<rect x="13" y="68" width="9" height="24" rx="4"/><rect x="78" y="68" width="9" height="24" rx="4"/>`,'Avant-bras'),
    'Abdominaux':t(`<rect x="38" y="65" width="24" height="22" rx="4"/>`,'Abdominaux'),
    'Jambes':    t(`<rect x="24" y="95" width="19" height="48" rx="6"/><rect x="57" y="95" width="19" height="48" rx="6"/>`,'Jambes'),
    'Fessiers':  t(`<ellipse cx="36" cy="100" rx="16" ry="13"/><ellipse cx="64" cy="100" rx="16" ry="13"/>`,'Fessiers','(vue dos)'),
    'Mollets':   t(`<rect x="26" y="147" width="15" height="34" rx="5"/><rect x="59" y="147" width="15" height="34" rx="5"/>`,'Mollets'),
    'Full Body': t(`<ellipse cx="37" cy="50" rx="11" ry="10" opacity="0.55"/><ellipse cx="63" cy="50" rx="11" ry="10" opacity="0.55"/><ellipse cx="22" cy="43" rx="8" ry="7" opacity="0.55"/><ellipse cx="78" cy="43" rx="8" ry="7" opacity="0.55"/><rect x="24" y="95" width="19" height="48" rx="6" opacity="0.55"/><rect x="57" y="95" width="19" height="48" rx="6" opacity="0.55"/><rect x="15" y="45" width="9" height="21" rx="4" opacity="0.55"/><rect x="76" y="45" width="9" height="21" rx="4" opacity="0.55"/>`,'Full Body'),
  };
})();
function _groupTemplateSvg(name){
  const ex=EXLIB.find(e=>e.n===name);
  const file=_MUSCLE_FILE[ex?.g]||'muscles/chest.svg';
  return `<div style="text-align:center;padding:6px 0;"><img src="${file}" style="width:140px;height:auto;display:block;margin:0 auto;"></div>`;
}
function _genderGroupSvg(groupName){
  const svgSet=(S&&S.gender==='F')?_MUSCLE_SVG_F:_MUSCLE_SVG;
  const svg=svgSet[groupName];
  if(!svg)return '';
  return svg
    .replace('width:100%;max-height:158px','height:68px;width:auto;display:block;margin:0 auto')
    .replace(/<text[^>]*>[^<]*<\/text>/g,'');
}

// Vidéos YouTube Demic — {id, s:true si Short, s:false si vidéo normale}
// Images locales d'exercices (GIF/webp/png) — disponibles hors connexion
const EX_YT={
  'Développé Couché':              {img:'exercises/developpe-couche.gif'},
  'Développé Couché Haltères':     {img:'exercises/developpe-couche-halteres-exercice-musculation.gif'},
  'Smith Machine Développé Couché':{img:'exercises/developpe-couche-smith-machine.gif'},
  'Développé Décliné':             {img:'exercises/developpe-decline-barre.gif'},
  'Développé Incliné':             {img:'exercises/developpe-incline-barre.gif'},
  'Écarté Poulie':                 {img:'exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.gif'},
  'Écarté Haltères':               {img:'exercises/ecartes-decline-avec-halteres.gif'},
  'Pec Deck':                      {img:'exercises/pec-deck-butterfly-exercice-musculation.gif'},
  'Pont Fessier (Glute Bridge)':   {img:'exercises/glute-bridge.webp'},
  'Press Jambes 45°':              {img:'machine/press-jambes-1.png'},
  'Press Jambes Horizontale':      {img:'machine/press-jambes-2.jpg'},
  'Press Jambes Verticale':        {img:'machine/press-jambes-3.jpg'},
  'Press Jambes Inclinée':         {img:'machine/press-jambes-4.jpg'},
  'Squat Hack (Hack Squat)':       {img:'machine/press-jambes-5.jpg'},
  'Press Jambes Levier':           {img:'machine/press-jambes-6.jpg'},
};
// Mapping groupe musculaire → SVG local (hors connexion)
const _MUSCLE_FILE={
  'Pectoraux':'muscles/chest.svg','Dos':'muscles/back.svg','Trapèzes':'muscles/back.svg',
  'Épaules':'muscles/shoulders.svg','Biceps':'muscles/arms.svg','Triceps':'muscles/arms.svg',
  'Avant-bras':'muscles/arms.svg','Jambes':'muscles/legs.svg','Fessiers':'muscles/glutes.svg',
  'Abdominaux':'muscles/abs.svg','Mollets':'muscles/calves.svg','Full Body':'muscles/chest.svg',
};

const EX_EN={
  // Pectoraux
  'Développé Couché':'bench press barbell','Développé Couché Haltères':'bench press dumbbell',
  'Développé Incliné':'incline bench press','Développé Incliné Haltères':'incline bench press dumbbell',
  'Développé Décliné':'decline bench press','Développé Décliné Haltères':'decline bench press dumbbell',
  'Écarté Haltères':'dumbbell fly chest','Écarté Poulie':'cable fly chest',
  'Croisé Poulie (Cable Crossover)':'cable crossover',
  'Pec Deck':'pec deck fly','Chest Press Machine Horizontale':'chest press machine',
  'Chest Press Machine Inclinée':'incline chest press machine','Chest Press Machine Déclinée':'decline chest press machine',
  'Dips':'chest dips','Dips Parallèles':'parallel bar dip',
  'Dips Machine Assistée':'assisted dip machine',
  'Pompes Lestées':'push up weighted','Pompes Déficit (Deficit Push-up)':'deficit push up','Pompes Diamant':'diamond push up',
  'Smith Machine Développé Couché':'smith machine bench press','Smith Machine Développé Incliné':'smith machine incline bench press',
  // Dos
  'Soulevé de Terre':'deadlift conventional','Soulevé de Terre Sumo':'sumo deadlift',
  'Tirage en Rack (Rack Pull)':'rack pull barbell',
  'Inclinaison Lombaire (Good Morning)':'good morning barbell',
  'Rowing Barre':'barbell row bent over','Rowing Haltère':'dumbbell row one arm','Rowing Cable':'cable row seated',
  'Rowing Yates (Supination)':'yates row barbell',
  'Rowing Poitrine Appuyée (Chest Supported)':'chest supported row',
  'Rowing Machine':'seated row machine','Rowing Hammer Strength':'hammer strength row',
  'Tirage Poulie Haute':'lat pulldown cable','Tirage Poulie Haute Prise Serrée':'lat pulldown close grip',
  'Tirage Nuque':'behind neck pulldown',
  'Tirage Poulie Basse Prise Large':'seated cable row wide grip','Tirage Poulie Basse Prise Serrée':'seated cable row close grip',
  'Traction Lestée':'pull-up weighted','Traction Assistée':'assisted pull up machine','Traction Prise Neutre':'neutral grip pull up',
  'Pull-over':'pullover barbell','Pull-over Haltère':'pullover dumbbell','Pullover Machine':'pullover machine',
  // Trapèzes
  'Haussements d\'Épaules (Shrugs)':'barbell shrug',
  'Haussements d\'Épaules Barre':'barbell shrug','Haussements d\'Épaules Haltères':'dumbbell shrug',
  'Haussements d\'Épaules Câble':'cable shrug','Tirage Menton':'upright row barbell',
  'Farmer\'s Walk':'farmers walk',
  // Épaules
  'Développé Militaire':'overhead press barbell','Développé Militaire Haltères':'overhead press dumbbell',
  'Développé Haltères Assis':'seated dumbbell press',
  'Développé Arnold (Arnold Press)':'arnold press','Développé Épaules Machine':'shoulder press machine',
  'Smith Machine Développé Militaire':'smith machine overhead press',
  'Élévations Latérales':'lateral raise dumbbell','Élévations Latérales Câble':'cable lateral raise',
  'Élévations Latérales Machine':'machine lateral raise',
  'Élévations Frontales':'front raise dumbbell','Élévations Frontales Câble':'cable front raise',
  'Élévations Frontales Machine':'machine front raise',
  'Oiseau':'rear delt fly dumbbell','Machine Oiseau':'rear delt fly machine',
  'Tirage Visage (Face Pull)':'face pull cable','Tirage Vertical (Upright Row)':'upright row barbell',
  'Y Raise / W Raise':'y raise band',
  // Biceps
  'Curl Barre':'barbell bicep curl','Curl Haltères':'dumbbell bicep curl',
  'Curl Poulie':'cable bicep curl','Curl EZ':'ez bar curl',
  'Curl Barre EZ Prise Large':'ez bar curl wide grip',
  'Curl Incliné':'incline dumbbell curl','Curl Concentré':'concentration curl',
  'Curl Câble en Croix (Bayesian Curl)':'bayesian curl cable','Curl Araignée (Spider Curl)':'spider curl',
  'Curl Zottman':'zottman curl','Marteau':'hammer curl',
  'Curl Machine':'bicep curl machine','Curl Pupitre Machine':'preacher curl machine',
  // Triceps
  'Dips Lestés':'dips weighted','Bench Dips':'bench dip',
  'Barre au Front':'skull crusher','Skull Crusher Barre EZ':'skull crusher ez bar',
  'Extension Triceps':'triceps extension overhead','Extension Triceps Couché Haltères':'lying triceps extension dumbbell',
  'Extension Nuque Haltère':'overhead triceps extension dumbbell',
  'Extension Nuque Poulie Haute':'overhead cable triceps extension',
  'Triceps Poulie':'triceps pushdown cable','Triceps Corde Poulie':'triceps rope pushdown',
  'Triceps Poulie Basse':'low cable triceps extension',
  'Extension Triceps Arrière (Kickback)':'triceps kickback dumbbell',
  'Triceps Haltère':'triceps overhead extension dumbbell','Triceps Machine':'triceps machine',
  // Jambes
  'Squat à la Barre':'squat barbell','Squat Avant':'front squat','Squat Bulgare':'bulgarian split squat',
  'Squat Gobelet (Goblet Squat)':'goblet squat','Squat Sumo':'sumo squat',
  'Smith Machine Squat':'smith machine squat','Squat Hack (Hack Squat)':'hack squat',
  'Leg Press':'leg press machine',
  'Extension Quadriceps (Leg Extension)':'leg extension machine',
  'Leg Curl Couché Machine':'lying leg curl machine','Leg Curl Assis Machine':'seated leg curl machine',
  'Fentes':'lunge barbell','Fentes Marchées':'walking lunge',
  'Fentes Arrière':'reverse lunge','Fentes Latérales':'lateral lunge',
  'Smith Machine Fentes':'smith machine lunge',
  'Montée sur Box (Step-up)':'box step up','Montée sur Box Haltères':'step up dumbbell',
  'Abduction Cuisses (Leg Abduction)':'hip abduction machine',
  'Adduction Cuisses (Leg Adduction)':'hip adduction machine',
  // Fessiers
  'Poussée de Hanche (Hip Thrust)':'hip thrust barbell','Poussée de Hanche Haltère':'hip thrust dumbbell',
  'Poussée de Hanche Machine':'hip thrust machine',
  'Pont Fessier (Glute Bridge)':'glute bridge',
  'Extension Fessiers Arrière (Kickback)':'glute kickback cable',
  'Kickback Machine':'glute kickback machine','Kickback Cable':'cable glute kickback',
  'Soulevé de Terre Roumain Barre':'romanian deadlift barbell',
  'Soulevé de Terre Roumain Haltères':'romanian deadlift dumbbell',
  'Soulevé de Terre Roumain Unilatéral':'single leg romanian deadlift',
  'Tirage Cable Fessiers (Cable Pull Through)':'cable pull through glute',
  'Curl Ischio-jambiers (Leg Curl)':'leg curl machine',
  'Abducteurs Machine Debout':'standing hip abduction machine',
  // Abdominaux
  'Gainage':'plank core','Planche Latérale (Side Plank)':'side plank',
  'Hollow Body':'hollow body hold','L-Sit':'l-sit',
  'Windshield Wiper':'windshield wiper ab',
  'Crunch':'crunch abdominal','Crunch Poulie':'cable crunch','Crunch Oblique':'oblique crunch',
  'Crunch Machine':'crunch machine','Câble Crunch':'cable crunch abdominal',
  'Rotation Machine Obliques':'oblique twist machine',
  'Relevé de Jambes':'hanging leg raise','Relevé de Buste (Sit-up)':'sit up',
  'Chaise Romaine':'captain chair leg raise',
  'Roue Abdominale (Ab Wheel)':'ab wheel rollout',
  'Rotation Russe (Russian Twist)':'russian twist','Drapeau (Dragon Flag)':'dragon flag',
  'Grimpeur (Mountain Climber)':'mountain climber',
  // Mollets
  'Élévations Mollets Debout':'standing calf raise','Élévations Mollets Assis':'seated calf raise',
  'Élévations Mollets Unilatéral':'single leg calf raise',
  'Presse Mollets (Leg Press)':'calf press leg press','Élévations Mollets Penché (Donkey Calf Raise)':'donkey calf raise',
  'Mollets Machine Debout':'standing calf raise machine','Mollets Machine Assise':'seated calf raise machine',
  'Sauts à la Corde':'jump rope',
  // Avant-bras
  'Curl Poignet Barre':'wrist curl barbell','Extension Poignet Barre':'wrist extension barbell',
  'Pronation Supination Haltère':'forearm rotation dumbbell',
  'Farmer\'s Walk (Grip)':'farmers walk','Planche de Préhension':'dead hang grip',
  // Full Body
  'Burpees':'burpee','Kettlebell Swing':'kettlebell swing',
  'Arraché Haltère (Dumbbell Snatch)':'dumbbell snatch','Thrusters Haltères':'dumbbell thruster',
  'Clean & Jerk':'clean and jerk','Turkish Get-Up':'turkish get up',
  'Battle Rope':'battle rope waves','Box Jump':'box jump plyometric',
};

async function fetchExImage(name){
  if(gifCache[name]!==undefined)return gifCache[name];
  gifCache[name]=null;
  const term=EX_EN[name]||name;
  try{
    const r=await fetch(`https://wger.de/api/v2/exercisesearch/?term=${encodeURIComponent(term)}&language=2&format=json`,{signal:AbortSignal.timeout(5000)});
    if(!r.ok)return null;
    const d=await r.json();
    const first=d.suggestions&&d.suggestions[0];
    if(!first||!first.data)return null;
    const baseId=first.data.base_id;
    if(!baseId)return null;
    const r2=await fetch(`https://wger.de/api/v2/exerciseimage/?exercise_base=${baseId}&format=json`,{signal:AbortSignal.timeout(5000)});
    if(!r2.ok)return null;
    const d2=await r2.json();
    const imgs=d2.results||[];
    // Préférer l'image principale
    const main=imgs.find(i=>i.is_main)||imgs[0];
    if(main&&main.image){gifCache[name]=main.image;return main.image;}
  }catch(e){}
  return null;
}

function _ytSearchUrl(name){
  const term='Demic '+(EX_EN[name]||name);
  return 'https://www.youtube.com/results?search_query='+encodeURIComponent(term);
}

function _exVideoHtml(name){
  const v=EX_YT[name];
  if(v&&v.img){
    // Image locale
    return `<div>
      <img src="${v.img}" style="width:100%;border-radius:8px;display:block;margin-bottom:8px;" loading="lazy">
      <a href="${_ytSearchUrl(name)}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#FF0000;color:#fff;border-radius:8px;padding:10px 14px;font-size:14px;font-weight:700;text-decoration:none;-webkit-tap-highlight-color:transparent;">▶&nbsp;Voir le tutoriel</a>
    </div>`;
  }
  if(v&&v.id){
    const watchUrl=v.s?'https://www.youtube.com/shorts/'+v.id:'https://www.youtube.com/watch?v='+v.id;
    const thumb='https://img.youtube.com/vi/'+v.id+'/mqdefault.jpg';
    return `<a href="${watchUrl}" target="_blank" rel="noopener" style="display:block;position:relative;border-radius:10px;overflow:hidden;text-decoration:none;-webkit-tap-highlight-color:transparent;">
      <img src="${thumb}" style="width:100%;display:block;" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.28);">
        <div style="width:54px;height:54px;background:#FF0000;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.4);">
          <div style="width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid #fff;margin-left:5px;"></div>
        </div>
      </div>
    </a>`;
  }
  return `<a href="${_ytSearchUrl(name)}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#FF0000;color:#fff;border-radius:8px;padding:11px 14px;font-size:14px;font-weight:700;text-decoration:none;-webkit-tap-highlight-color:transparent;">▶&nbsp;Voir le tutoriel</a>`;
}

function toggleExGif(ei,name){
  const panel=document.getElementById(`ex-gif-${ei}`);
  if(!panel)return;
  if(panel.dataset.open==='1'){panel.style.display='none';panel.dataset.open='0';return;}
  panel.style.display='block';panel.dataset.open='1';
  if(panel.dataset.loaded==='1')return;
  panel.dataset.loaded='1';

  const local=EX_YT[name]?.img;
  let html='<div style="padding:10px;background:var(--bg3);border-radius:10px;">';
  if(local){
    html+=`<img src="${local}" style="width:100%;border-radius:8px;max-height:240px;object-fit:cover;display:block;" loading="lazy">`;
  } else {
    const ex=EXLIB.find(e=>e.n===name);
    const file=_MUSCLE_FILE[ex?.g]||'muscles/chest.svg';
    html+=`<div style="text-align:center;padding:8px 0;"><img src="${file}" style="width:160px;height:auto;display:block;margin:0 auto;"></div>`;
    html+=`<div style="text-align:center;font-size:12px;color:var(--t3);margin-top:2px;">${ex?.g||''}</div>`;
  }
  html+='</div>';
  panel.innerHTML=html;
}

// ─── PLATE CALCULATOR ────────────────────────────────────────
let plateExIdx=null;
function openPlateCalc(kg,ei){plateExIdx=ei;document.getElementById('plate-kg').value=kg||'';document.getElementById('bar-disp').textContent=S.barW;document.getElementById('plate-apply').style.display=ei!==null&&ei!==undefined?'':'none';renderPlates();document.getElementById('mod-plate').classList.add('open');}
function closePlate(){document.getElementById('mod-plate').classList.remove('open');}
function calcPlatesArr(t,bar){const ps=[25,20,15,10,5,2.5,1.25,0.5];let r=(t-bar)/2;if(r<0)return null;const res=[];for(const p of ps){while(r>=p-.001){res.push(p);r=Math.round((r-p)*1000)/1000;}}return res;}
function plateCls(p){return p>=25?'p25':p>=20?'p20':p>=15?'p15':p>=10?'p10':p>=5?'p5':p>=2?'p2':'p1';}
function renderPlates(){
  const t=parseFloat(document.getElementById('plate-kg').value);
  const viz=document.getElementById('plate-viz'),res=document.getElementById('plate-result');
  if(!t||t<S.barW){viz.innerHTML='';res.textContent=t&&t<S.barW?`Min: ${S.barW}kg (barre seule)`:'';return;}
  const arr=calcPlatesArr(t,S.barW);
  if(!arr){viz.innerHTML='';res.textContent='Impossible';return;}
  viz.innerHTML=`<div class="plate-bar">${arr.map(p=>`<div class="plate ${plateCls(p)}">${p}</div>`).join('')}<div class="bar-shaft"></div>${[...arr].reverse().map(p=>`<div class="plate ${plateCls(p)}">${p}</div>`).join('')}</div>`;
  const total=S.barW+arr.reduce((a,b)=>a+b,0)*2;
  res.textContent=arr.length?`Chaque côté: ${arr.map(p=>p+'kg').join('+')} = ${fmt(total)}kg total`:`Barre seule = ${S.barW}kg`;
}
function applyPlate(){if(plateExIdx===null)return;const t=parseFloat(document.getElementById('plate-kg').value);if(!t)return;S.wkt.exs[plateExIdx].sets.forEach(s=>{if(!s.done)s.kg=t;});persist();closePlate();renderExBlocks();toast('Charge appliquée !','success');}

// (Déblocage audio supprimé — le timer est 100% silencieux, voir bloc AUDIO : AUCUN plus haut)

