// ─── NAVIGATION ──────────────────────────────────────────────
let _curScreen='home';
function _closeAllPanels(){
  ['menu-drawer','menu-drawer-bd'].forEach(id=>{document.getElementById(id)?.classList.remove('open');});
  if(_curScreen!=='setup')document.getElementById('nb-setup')?.classList.remove('active');
  document.getElementById('ov-drawer-cnt')?.classList.remove('open');
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-backdrop')?.classList.remove('open');
}
function _applyScreen(id,btn){
  _curScreen=id;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+id)?.classList.add('active');
  if(btn)btn.classList.add('active');
  document.getElementById('root').classList.toggle('on-home',id==='home');
  document.getElementById('root').classList.toggle('on-log',id==='log');
  document.getElementById('root').classList.toggle('on-setup',id==='setup');
  if(id==='home')renderHome();
  if(id==='log')renderLog();
  if(id==='progress')renderProgress();
  if(id==='nutrition'){renderNutrition();switchNuTab('macros',document.getElementById('ntab-macros'));}
  if(id==='setup'){_resetMenuView();renderSetup();}
  if(id==='cycle')renderCycleScreen();
  if(id==='coach'){const suggs=document.getElementById('coach-suggs');if(suggs&&coachHistory.length>0)suggs.style.display='none';updateCoachHeader();_updateCoachMorphoBtn();}
}
function goScreen(id,btn){
  _closeAllPanels();
  if(_screenHistory[_screenHistory.length-1]!==id){
    _screenHistory.push(id);
    if(_screenHistory.length>20)_screenHistory.shift();
  }
  _applyScreen(id,btn);
}
function navBack(){
  _closeAllPanels();
  if(_screenHistory.length>1)_screenHistory.pop();
  const prev=_screenHistory[_screenHistory.length-1]||'home';
  _applyScreen(prev,document.getElementById('nb-'+prev));
}

// ─── AIDE CONTEXTUELLE ───────────────────────────────────────
const _HELP_DATA={
  home:{
    title:'🏠 Accueil',
    tips:[
      {i:'📊',t:'Les stats du mois se calculent depuis tes séances enregistrées et ton poids loggé.'},
      {i:'😴',t:'Le score de récupération vient du check-in post-séance (sommeil + énergie subjective).'},
      {i:'🏆',t:'Les PRs (records personnels) se mettent à jour automatiquement après chaque séance.'},
      {i:'🔄',t:'Le cycle de force (Accumulation → Peak → Décharge) se configure dans Profil → Cycle.'},
    ],
    female:[
      {i:'🌙',t:'La carte de ton cycle menstruel s\'affiche ici — remplis la date de tes règles dans Profil pour l\'activer.'},
      {i:'💡',t:'Tes performances varient naturellement selon ta phase. C\'est normal, pas un signe de régression.'},
    ]
  },
  setup:{
    title:'👤 Profil — bien le remplir',
    tips:[
      {i:'⚖️',t:'Ton poids, taille et âge sont essentiels : ils servent à calculer tes besoins caloriques (TDEE) dans Nutrition.'},
      {i:'🎯',t:'L\'objectif (muscle, perte de poids, force...) détermine la répartition de tes macronutriments.'},
      {i:'🏃',t:'Le niveau d\'activité est crucial — sous-estimer revient à manger trop. Sois honnête.'},
      {i:'📏',t:'Tour de cou + taille (+ hanches pour les femmes) → calcul automatique de ta composition corporelle (% graisse, masse maigre).'},
    ],
    female:[
      {i:'🌸',t:'La date de tes premières règles permet à l\'app d\'adapter tes macros et conseils selon ta phase de cycle. C\'est la donnée la plus importante pour un suivi féminin précis.'},
      {i:'💊',t:'Si tu prends une contraception hormonale (pilule, implant, DIU hormonal), coche-le — le suivi de phase est désactivé car les fluctuations naturelles sont masquées.'},
      {i:'📐',t:'Pour les femmes, les hanches sont indispensables au calcul du % de graisse (méthode US Navy). Sans elles, la formule est moins précise.'},
      {i:'🧬',t:'Remplis ta morphologie (forme du corps) pour que le Coach IA te donne des conseils vraiment adaptés à ta silhouette.'},
    ]
  },
  nutrition:{
    title:'🍽️ Nutrition',
    tips:[
      {i:'⚠️',t:'Les macros ne s\'affichent correctement que si ton Profil est complet (âge, poids, taille, niveau d\'activité).'},
      {i:'📈',t:'Phase Charge = surplus calorique pour prendre du muscle. Phase Décharge = déficit pour perdre du gras. Alterne selon tes objectifs.'},
      {i:'💪',t:'Les suppléments (créatine, whey) sont dosés automatiquement selon ton poids et ton objectif.'},
      {i:'🔥',t:'Les calories brûlées à la séance sont estimées et ajoutées à ton TDEE du jour.'},
    ],
    female:[
      {i:'🌙',t:'Tes macros s\'adaptent automatiquement selon ta phase de cycle : plus de glucides en phase folliculaire (énergie haute), légère augmentation des calories en phase lutéale.'},
      {i:'🔥',t:'En phase lutéale (avant les règles), ton métabolisme est naturellement plus élevé (+100 à 200 kcal/jour). L\'app en tient compte.'},
      {i:'💧',t:'Les envies de sucre et la rétention d\'eau en fin de cycle sont normales. Adapte tes portions sans culpabilité.'},
    ]
  },
  progress:{
    title:'📈 Progrès',
    tips:[
      {i:'💪',t:'Le graphique montre ton 1RM estimé (formule Brzycki) calculé depuis tes séances — pas besoin de tester à l\'échec.'},
      {i:'⚖️',t:'Log ton poids régulièrement (idéalement le matin à jeun) pour voir une courbe fiable sur la durée.'},
      {i:'🏅',t:'Les badges se débloquent automatiquement : régularité, PRs, streaks... vérifie l\'onglet Badges.'},
      {i:'📉',t:'Un plateau sur plusieurs semaines est normal — le progrès n\'est pas linéaire.'},
    ],
    female:[
      {i:'⚖️',t:'Les variations de poids de ±1 à 3 kg en cours de cycle sont normales. C\'est de la rétention d\'eau, pas de la graisse. Compare ton poids à la même phase du cycle précédent.'},
      {i:'📊',t:'Tes performances (force, endurance) peuvent varier selon la phase. Pour comparer objectivement, rapproche les séances de la même phase entre elles.'},
    ]
  },
  log:{
    title:'⚡ Séance',
    tips:[
      {i:'🔤',t:'Types de série : N = Normal · W = Échauffement (exclu des PRs, compté dans le volume) · E = Échec · D = Drop set'},
      {i:'⏱️',t:'Le timer s\'adapte au type : Échauffement 45s · Normal 130s · Échec 4min · Drop 20s'},
      {i:'🏆',t:'Le 1RM s\'affiche en temps réel sous le type de série — utilise-le pour calibrer tes charges.'},
      {i:'📷',t:'Bouton 📸 pour importer un programme depuis une photo (planning, tableau...).'},
    ],
    female:[]
  },
  coach:{
    title:'🤖 Coach IA',
    tips:[
      {i:'💬',t:'Donne un maximum de contexte dans tes messages : exercices actuels, douleurs, objectif précis, plateau.'},
      {i:'📸',t:'Envoie une photo (Premium) pour une analyse de composition corporelle ou de ta morphologie.'},
      {i:'🔓',t:'10 questions gratuites puis abonnement Premium pour un accès illimité.'},
    ],
    female:[
      {i:'🌸',t:'Mentionne ta phase de cycle dans ton message ("je suis en phase lutéale") pour des conseils nutrition et entraînement vraiment adaptés à ton moment.'},
      {i:'🧬',t:'L\'analyse de morphologie (Premium, bouton 📸 dans le chat) te donne un profil personnalisé : silhouette, forces, axes de progression spécifiques.'},
    ]
  }
};

function showHelp(){
  const screen=_curScreen==='cycle'?'home':(_curScreen||'home');
  const data=_HELP_DATA[screen];
  if(!data)return;
  const isFemale=S&&S.gender==='F';
  document.getElementById('help-title').textContent=data.title;
  let html='';
  if(isFemale&&data.female&&data.female.length){
    html+=`<div class="help-female-block">
      <div class="help-female-hdr">♀ Spécial femmes</div>
      ${data.female.map(t=>`<div class="help-item"><span class="help-item-icon">${t.i}</span><span class="help-item-text">${t.t}</span></div>`).join('')}
    </div>`;
  }
  html+=`<div>${data.tips.map(t=>`<div class="help-item"><span class="help-item-icon">${t.i}</span><span class="help-item-text">${t.t}</span></div>`).join('')}</div>`;
  document.getElementById('help-content').innerHTML=html;
  document.getElementById('ov-help').classList.add('open');
}
function closeHelp(){document.getElementById('ov-help').classList.remove('open');}

// ─── HOME ────────────────────────────────────────────────────
function _renderHomeHdr(){
  const el=document.getElementById('home-hdr');if(!el)return;
  const isConn=S.connected;
  const pillBg=isConn?'rgba(52,211,153,.1)':'rgba(255,255,255,.06)';
  const pillBorder=isConn?'rgba(52,211,153,.22)':'rgba(255,255,255,.08)';
  const dotBg=isConn?'#34d399':'var(--t3)';
  const dotShadow=isConn?'0 0 8px #34d399':'none';
  const lbl=isConn?'Sheets ✓':'Sheets';
  const lblColor=isConn?'#5be3b4':'var(--t2)';
  el.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;">'
    +'<div style="display:flex;align-items:center;gap:13px;">'
    +'<img src="force-tracker-logo-topbar.gif" onclick="onLogoTap()" style="width:58px;height:58px;border-radius:17px;object-fit:cover;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);flex:none;cursor:pointer;-webkit-tap-highlight-color:transparent;">'
    +'<div><div style="font-family:var(--font-cond);font-size:18px;font-weight:700;color:var(--red);letter-spacing:.005em;white-space:nowrap;">Force Tracker</div>'
    +'<div style="font-size:13.5px;font-weight:500;color:var(--t2);margin-top:1px;">'+(S.name?'Bonjour '+S.name:'Bonjour')+'</div></div></div>'
    +'<button onclick="goScreen(\'setup\',document.getElementById(\'nb-setup\'))" id="home-sheets-pill" style="display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:'+pillBg+';box-shadow:inset 0 0 0 1px '+pillBorder+';border:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">'
    +'<span id="home-sync-dot" style="width:6px;height:6px;border-radius:50%;background:'+dotBg+';box-shadow:'+dotShadow+';flex:none;display:inline-block;"></span>'
    +'<span id="home-sync-lbl" style="font-size:12px;font-weight:600;color:'+lblColor+';">'+lbl+'</span></button></div>';
}

function _renderHomeHero(){
  const el=document.getElementById('home-hero');if(!el)return;
  const score=calcRecoveryScore();
  const info=getRecoveryInfo(score);
  const circ=188.5;
  const offset=score!==null?+(circ*(1-score/100)).toFixed(1):circ;
  const ringColor=score!==null?info.color:'var(--t3)';
  let accent='52,211,153';
  if(score!==null&&score<40)accent='255,106,115';
  else if(score!==null&&score<60)accent='255,138,114';
  else if(score!==null&&score<80)accent='234,179,8';
  const hasPending=S.wkt&&S.wkt.exs&&S.wkt.exs.length;
  const ctaLabel=hasPending?'↩ Reprendre la séance':'Commencer une séance';
  const heroLabel=score===null?'Enregistre ton sommeil':score>=80?'Prêt à performer':score>=60?'Bonne récupération':score>=40?'Récupération modérée':'Fatigué';
  const heroDesc=score===null?'Renseigne ton sommeil ce soir pour obtenir ton score de récupération.':info.rec.length>90?info.rec.substring(0,90)+'…':info.rec;
  const pillHtml=score!==null?'<div style="display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:50%;background:'+ringColor+';box-shadow:0 0 8px '+ringColor+';"></span><span style="font-size:12px;font-weight:700;color:'+ringColor+';">Récup '+info.label+'</span></div>':'';
  el.innerHTML='<div style="padding:20px;border-radius:22px;background:radial-gradient(130% 100% at 0% 0%,rgba('+accent+',.10),transparent 55%),var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);" class="ft-rise">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;">'
    +'<div style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--t3);">AUJOURD\'HUI</div>'
    +pillHtml+'</div>'
    +'<div style="display:flex;align-items:center;gap:16px;margin-top:16px;">'
    +'<div style="position:relative;width:72px;height:72px;flex:none;">'
    +'<svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg);">'
    +'<circle cx="36" cy="36" r="30" fill="none" stroke="#23262e" stroke-width="6"/>'
    +'<circle cx="36" cy="36" r="30" fill="none" stroke="'+ringColor+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'"/>'
    +'</svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">'
    +'<span style="font-family:var(--font-cond);font-size:'+(score!==null?24:18)+'px;font-weight:600;color:var(--t1);line-height:1;">'+(score!==null?score:'—')+'</span>'
    +(score!==null?'<span style="font-size:9px;color:var(--t3);font-weight:600;">/100</span>':'')
    +'</div></div>'
    +'<div style="flex:1;"><div style="font-size:16px;font-weight:700;color:var(--t1);">'+heroLabel+'</div>'
    +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:4px;">'+heroDesc+'</div></div></div>'
    +'<button onclick="startWorkout()" class="ft-press" style="margin-top:18px;width:100%;height:54px;border-radius:16px;background:linear-gradient(135deg,var(--red),#EF3E57);box-shadow:0 12px 28px -10px rgba(239,62,87,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg>'
    +'<span style="font-size:16px;font-weight:700;color:#fff;font-family:var(--font);">'+ctaLabel+'</span></button></div>';
}

function renderHome(){
  _renderHomeHdr();
  _renderHomeHero();
  const now=new Date();
  const mo=S.sessions.filter(s=>{const d=new Date(s.date+'T12:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const vol=mo.reduce((a,s)=>a+(s.volume||0),0);
  const b3=BIG3.map(e=>S.prs[e]?S.prs[e].rm1:0).reduce((a,b)=>a+b,0);
  const latestW=S.weightLog&&S.weightLog.length?S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]:null;
  const bwDisp=latestW?latestW.kg:(S.bw||'—');
  const volDisp=vol>9999?(Math.round(vol/100)/10)+'k':Math.round(vol);
  const statsEl=document.getElementById('home-stats');
  if(statsEl)statsEl.innerHTML='<div style="display:flex;border-radius:16px;background:var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);padding:14px 0;">'
    +'<div style="flex:1;text-align:center;cursor:pointer;" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div id="h-vol" style="font-family:var(--font-cond);font-size:19px;font-weight:600;color:var(--t1);">'+volDisp+'</div>'
    +'<div style="font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:3px;">Volume</div></div>'
    +'<div style="width:1px;background:rgba(255,255,255,.07);"></div>'
    +'<div style="flex:1;text-align:center;cursor:pointer;" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div id="h-big3" style="font-family:var(--font-cond);font-size:19px;font-weight:600;color:var(--orange);">'+(b3>0?Math.round(b3):'—')+'</div>'
    +'<div style="font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:3px;">Big 3</div></div>'
    +'<div style="width:1px;background:rgba(255,255,255,.07);"></div>'
    +'<div style="flex:1;text-align:center;">'
    +'<div id="h-sess" style="font-family:var(--font-cond);font-size:19px;font-weight:600;color:var(--t1);">'+mo.length+'</div>'
    +'<div style="font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:3px;">Séances</div></div>'
    +'<div style="width:1px;background:rgba(255,255,255,.07);"></div>'
    +'<div style="flex:1;text-align:center;cursor:pointer;" onclick="goWeightTab()">'
    +'<div style="font-family:var(--font-cond);font-size:19px;font-weight:600;color:var(--t1);"><span id="h-bw">'+fmt(bwDisp)+'</span><span style="font-size:11px;color:var(--t2);font-weight:500;">kg</span></div>'
    +'<div style="font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-top:3px;">Poids</div></div></div>';
  const b3Lvl=BIG3.map(ex=>{const pr=S.prs[ex];const rm=pr?pr.rm1:0;return(S.bw&&S.age&&rm)?getLevel(ex,rm,S.bw,S.gender,S.age).name:'—';});
  const lvlSub=b3Lvl.some(l=>l!=='—')?b3Lvl.join(' · '):'Log tes séances pour voir ton niveau';
  const prCount=Object.keys(S.prs||{}).length;
  const prSub=prCount>0?prCount+' exercice'+(prCount>1?'s':'')+' traqé'+(prCount>1?'s':''):'Commence à logger tes séances';
  const chevSvg='<svg class="home-row-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  const secEl=document.getElementById('home-secondary');
  if(secEl)secEl.innerHTML='<div style="border-radius:16px;background:var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);overflow:hidden;">'
    +'<div class="home-row ft-press" onclick="goScreen(\'cycle\',null)">'
    +'<div class="home-row-ic" style="background:rgba(239,62,87,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl" id="cycle-home-title">Cycle de Force</div><div class="home-row-sub" id="cycle-home-sub">Planifie ta progression sur mesure</div></div>'+chevSvg+'</div>'
    +'<div style="height:1px;background:var(--sep);margin:0 16px;"></div>'
    +'<div class="home-row ft-press" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div class="home-row-ic" style="background:rgba(234,179,8,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl">Niveau de force</div><div class="home-row-sub">'+lvlSub+'</div></div>'+chevSvg+'</div>'
    +'<div style="height:1px;background:var(--sep);margin:0 16px;"></div>'
    +'<div class="home-row ft-press" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div class="home-row-ic" style="background:rgba(168,85,247,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purp)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 22l4-2.5L16 22l-1-8.5"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl">Records personnels</div><div class="home-row-sub">'+prSub+'</div></div>'+chevSvg+'</div></div>';
  renderCycleHomeCard();
  updatePill();
}

function updatePill(){
  const p=document.getElementById('sync-pill'),d=document.getElementById('sync-dot'),l=document.getElementById('sync-lbl');
  if(p){if(S.connected){p.className='sync-pill ok';if(d)d.style.background='var(--green)';if(l)l.textContent='Sheets ✓';}
  else{p.className='sync-pill';if(d)d.style.background='var(--t3)';if(l)l.textContent='Sheets';}}
  // Inline home pill
  const hp=document.getElementById('home-sheets-pill'),hd=document.getElementById('home-sync-dot'),hl=document.getElementById('home-sync-lbl');
  if(S.connected){
    if(hp){hp.style.background='rgba(52,211,153,.1)';hp.style.boxShadow='inset 0 0 0 1px rgba(52,211,153,.22)';}
    if(hd){hd.style.background='#34d399';hd.style.boxShadow='0 0 8px #34d399';}
    if(hl){hl.textContent='Sheets ✓';hl.style.color='#5be3b4';}
  }else{
    if(hp){hp.style.background='rgba(255,255,255,.06)';hp.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,.08)';}
    if(hd){hd.style.background='var(--t3)';hd.style.boxShadow='none';}
    if(hl){hl.textContent='Sheets';hl.style.color='var(--t2)';}
  }
}

// ─── NUTRITION SCREEN ────────────────────────────────────────
function setNuPhase(phase){
  S.nutritionPhase=phase; persist();
  document.getElementById('pb-charge').classList.toggle('active',phase==='charge');
  document.getElementById('pb-decharge').classList.toggle('active',phase==='decharge');
  renderNutrition();
}

function renderNutrition(){
  renderSupplements();
  // Phase buttons
  document.getElementById('pb-charge').classList.toggle('active',S.nutritionPhase==='charge');
  document.getElementById('pb-decharge').classList.toggle('active',S.nutritionPhase==='decharge');
  // Goal banner
  const goal=S.goal||'muscle';
  const goalDelta={muscle:350,perte:-450,force:200,equilibre:0,endurance:100}[goal]||350;
  const goalColors={muscle:'rgba(255,45,85,.1)',perte:'rgba(255,149,0,.1)',force:'rgba(41,121,255,.1)',equilibre:'rgba(52,199,89,.1)',endurance:'rgba(170,0,255,.1)'};
  const goalBorderColors={muscle:'rgba(255,45,85,.3)',perte:'rgba(255,149,0,.3)',force:'rgba(41,121,255,.3)',equilibre:'rgba(52,199,89,.3)',endurance:'rgba(170,0,255,.3)'};
  const goalIcons={muscle:'💪',perte:'🔥',force:'🏋️',equilibre:'⚖️',endurance:'🏃'};
  const nuGoal=document.getElementById('nu-goal-info');
  if(nuGoal)nuGoal.textContent=`${goalIcons[goal]||'💪'} ${GOAL_LABELS[goal]||'Prise de muscle'}`;
  // Dynamic phase labels + delta chip
  const lc=document.getElementById('pb-charge-lbl'),ld=document.getElementById('pb-decharge-lbl');
  const cv=goalDelta+100,dv=goalDelta-100;
  if(lc)lc.textContent=`${cv>=0?'+':''}${cv} kcal`;
  if(ld)ld.textContent=`${dv>=0?'+':''}${dv} kcal`;
  const currentDelta=S.nutritionPhase==='charge'?cv:dv;
  const isPos=currentDelta>=0;
  const dChip=document.getElementById('nu-delta-chip'),dVal=document.getElementById('nu-delta-val'),dLbl=document.getElementById('nu-delta-lbl');
  if(dChip){dChip.style.background=isPos?'rgba(255,106,115,.1)':'rgba(52,211,153,.1)';dChip.style.boxShadow=isPos?'inset 0 0 0 1px rgba(255,106,115,.2)':'inset 0 0 0 1px rgba(52,211,153,.2)';}
  if(dVal){dVal.style.color=isPos?'var(--red)':'var(--green)';dVal.textContent=(isPos?'+':'')+currentDelta;}
  if(dLbl)dLbl.textContent=isPos?'Surplus':'Déficit';

  const bmr=calcBMR(), tdee=calcTDEE();
  const hydra=fmt((S.bw*0.035)+0.5);
  document.getElementById('nu-bmr').textContent=bmr.toLocaleString('fr-FR');
  document.getElementById('nu-tdee').textContent=tdee.toLocaleString('fr-FR');
  const todayStr=today();
  const todaySess=S.sessions.find(s=>s.date===todayStr);
  const sessCals=todaySess&&todaySess.calories?todaySess.calories:0;
  const totalCals=tdee+sessCals;
  document.getElementById('nu-session-cal').textContent=sessCals>0?sessCals.toLocaleString('fr-FR')+' kcal':'— (pas de séance)';
  document.getElementById('nu-total-cal').textContent=(sessCals>0?totalCals:tdee).toLocaleString('fr-FR')+' kcal';
  document.getElementById('nu-hydra').textContent=hydra;

  const macros=calcMacros(S.nutritionPhase);
  document.getElementById('m-kcal').textContent=macros.calories.toLocaleString('fr-FR');
  document.getElementById('m-prot').textContent=macros.prot_g;
  document.getElementById('m-carbs').textContent=macros.carbs_g;
  document.getElementById('m-fat').textContent=macros.fat_g;

  // Cycle menstruel banner
  const nuCycleBanner=document.getElementById('nu-cycle-banner');
  if(nuCycleBanner){
    const cp=getMensCyclePhase();
    if(cp){
      nuCycleBanner.style.display='block';
      nuCycleBanner.innerHTML=`<div class="cycle-phase-banner" style="background:rgba(170,0,255,.08);border:1px solid rgba(170,0,255,.2);">
        <span style="font-size:26px;flex-shrink:0;">${cp.icon}</span>
        <div style="flex:1;">
          <div style="font-family:var(--font-cond);font-size:16px;font-weight:900;color:${cp.color};">${cp.phase} — Jour ${cp.day}/${S.mensCycleDur}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:4px;line-height:1.5;"><strong style="color:var(--t1);">Nutrition :</strong> ${cp.nutrition}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px;line-height:1.5;"><strong style="color:var(--t1);">Entraînement :</strong> ${cp.training}</div>
        </div>
      </div>`;
    } else { nuCycleBanner.style.display='none'; }
  }

  // Meal plan
  const meals=getMeals(macros,S.nutritionPhase);
  document.getElementById('meal-plan').innerHTML=meals.map(m=>`
    <div class="meal-row">
      <div style="flex:1;">
        <div class="meal-name">${m.name}</div>
        <div class="meal-detail">${m.desc}</div>
        <div class="meal-detail" style="margin-top:3px;color:var(--t3);">P: ${m.prot}g · G: ${m.carbs}g · L: ${m.fat}g</div>
      </div>
      <div class="meal-kcal">${m.kcal} kcal</div>
    </div>`).join('');
}

