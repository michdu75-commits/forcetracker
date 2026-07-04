// ─── NAVIGATION ──────────────────────────────────────────────
// _curScreen : initialisé sur window dans <head> de index.html (window._curScreen='home')
function _closeAllPanels(){
  ['menu-drawer','menu-drawer-bd'].forEach(id=>{document.getElementById(id)?.classList.remove('open');});
  if(window._curScreen!=='setup')document.getElementById('nb-setup')?.classList.remove('active');
  document.getElementById('ov-drawer-cnt')?.classList.remove('open');
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-backdrop')?.classList.remove('open');
}
function _markScreenSeen(screen){
  const unseen=NEW_FEATURES.filter(f=>f.screen===screen&&!(S.seenFeatures||[]).includes(f.id));
  if(!unseen.length)return;
  S.seenFeatures=[...(S.seenFeatures||[]),...unseen.map(f=>f.id)];
  localStorage.setItem('ft4_seen_ft',JSON.stringify(S.seenFeatures));
  _updateNewBadges();
}
function _updateNewBadges(){
  const seen=S.seenFeatures||[];
  ['home','progress','log','nutrition','coach','setup'].forEach(sc=>{
    const btn=document.getElementById('nb-'+sc);if(!btn)return;
    const hasNew=NEW_FEATURES.some(f=>f.screen===sc&&!seen.includes(f.id));
    let dot=btn.querySelector('.new-dot');
    if(hasNew&&!dot){dot=document.createElement('span');dot.className='new-dot';btn.appendChild(dot);}
    else if(!hasNew&&dot)dot.remove();
  });
}

function _applyScreen(id,btn){
  window._curScreen=id;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+id)?.classList.add('active');
  if(btn)btn.classList.add('active');
  document.getElementById('root').classList.toggle('on-home',id==='home');
  document.getElementById('root').classList.toggle('on-log',id==='log');
  document.getElementById('root').classList.toggle('on-setup',id==='setup');
  if(id!=='log')_releaseWakeLock();
  if(id==='home')renderHome();
  if(id==='log')renderLog();
  if(id==='progress')renderProgress();
  if(id==='nutrition'){renderNutrition();switchNuTab('macros',document.getElementById('ntab-macros'));}
  if(id==='setup'){_resetMenuView();renderSetup();}
  if(id==='cycle')renderCycleScreen();
  if(id==='coach'){const suggs=document.getElementById('coach-suggs');if(suggs&&coachHistory.length>0)suggs.style.display='none';updateCoachHeader();_updateCoachMorphoBtn();}
  _markScreenSeen(id);
  // Pill chrono flottante : show hors log, hide sur log
  if(typeof _updPill==='function')_updPill();
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
      {i:'📊',t:'Les 4 stats du mois (volume, Big3, séances, poids) se calculent depuis tes séances et ton journal de poids.'},
      {i:'😴',t:'Le score de récupération vient du check-in post-séance (sommeil + énergie). Remplis-le après chaque séance pour un suivi fiable.'},
      {i:'🏆',t:'Les PRs se mettent à jour automatiquement. Le Big 3 (Squat + DC + SDT) est ton indicateur de force globale.'},
      {i:'🔄',t:'Le cycle de force (Accumulation → Intensification → Peak → Décharge) se configure dans Profil → Cycle de force.'},
      {i:'🏅',t:'Tes badges débloqués récemment apparaissent ici. Consulte l\'onglet Badges dans Progrès pour tout voir.'},
    ],
    female:[
      {i:'🌙',t:'La carte de ton cycle menstruel s\'affiche ici — remplis la date de tes règles dans Profil pour l\'activer.'},
      {i:'💡',t:'Tes performances varient naturellement selon ta phase. C\'est normal, pas un signe de régression.'},
    ]
  },
  setup:{
    title:'👤 Profil',
    tips:[
      {i:'⚖️',t:'Poids, taille et âge sont indispensables pour calculer ton TDEE (besoins caloriques) dans Nutrition.'},
      {i:'🎯',t:'L\'objectif (muscle, perte de poids, force, rééquilibrage...) adapte tes macros et les conseils du Coach IA.'},
      {i:'🏃',t:'Niveau d\'activité : sois honnête — le sous-estimer te fera manger trop peu, le surestimer trop.'},
      {i:'📏',t:'Tour de cou + taille (+ hanches) → composition corporelle automatique (% graisse, masse maigre, méthode US Navy).'},
      {i:'🧬',t:'Remplis ta morphologie (H/A/V/X/O) et ton morphotype (ecto/méso/endo) pour des conseils Coach IA vraiment personnalisés. Bouton 📸 pour analyse IA sur 3 photos.'},
      {i:'🎂',t:'Renseigne ta date d\'anniversaire (JJ/MM) pour débloquer le badge spécial si tu t\'entraînes le jour J.'},
    ],
    female:[
      {i:'🌸',t:'La date de tes premières règles permet à l\'app d\'adapter tes macros et conseils selon ta phase de cycle.'},
      {i:'💊',t:'Si tu prends une contraception hormonale, coche-le — le suivi de phase est désactivé car les fluctuations naturelles sont masquées.'},
      {i:'📐',t:'Les hanches sont indispensables au calcul du % de graisse pour les femmes (méthode US Navy).'},
      {i:'🧬',t:'La morphologie féminine (Poire/Sablier/Rectangle/Triangle inv./Ronde) affine les recommandations d\'exercices et de nutrition du Coach IA.'},
    ]
  },
  nutrition:{
    title:'🍽️ Nutrition',
    tips:[
      {i:'⚠️',t:'Les macros s\'affichent correctement uniquement si le Profil est complet (âge, poids, taille, activité, objectif).'},
      {i:'📈',t:'Phase Charge = surplus calorique pour prendre du muscle. Phase Décharge = déficit pour perdre du gras. Alterne selon tes cycles.'},
      {i:'💊',t:'Suppléments : créatine (phases charge/entretien) et whey dosés selon ton poids. Combinaisons Premium : 4 stacks complets (muscle, force, cardio, perte de poids).'},
      {i:'🔥',t:'Les calories brûlées au cardio (bloc cardio dans ta séance) s\'ajoutent à ton TDEE estimé du jour.'},
      {i:'🍽️',t:'Le plan de repas détaillé (5 repas) est généré depuis tes macros — adapté à ta phase et ton objectif.'},
    ],
    female:[
      {i:'🌙',t:'Tes macros s\'adaptent automatiquement : plus de glucides en folliculaire (énergie haute), légère hausse en lutéale.'},
      {i:'🔥',t:'En phase lutéale, ton métabolisme est naturellement plus élevé (+100 à 200 kcal/j). L\'app en tient compte.'},
      {i:'💧',t:'Envies de sucre et rétention d\'eau en fin de cycle sont normales. Adapte tes portions sans culpabilité.'},
    ]
  },
  progress:{
    title:'📈 Progrès',
    tips:[
      {i:'💪',t:'Le graphique affiche ton 1RM estimé (Brzycki) par exercice — sans avoir besoin de tester à l\'échec.'},
      {i:'⚖️',t:'Log ton poids régulièrement (idéalement le matin à jeun) pour une courbe fiable. Tap sur une entrée pour la corriger.'},
      {i:'🏅',t:'18 badges en 4 catégories : évolution, performance, streak, spécial. Vérifie l\'onglet Badges pour les débloquer.'},
      {i:'📋',t:'Tap sur une séance passée dans l\'historique pour voir et modifier les kg/reps de chaque série.'},
      {i:'📉',t:'Un plateau sur plusieurs semaines est normal — le progrès n\'est jamais linéaire. Varie les charges et les volumes.'},
    ],
    female:[
      {i:'⚖️',t:'Variations de poids ±1 à 3 kg en cours de cycle = rétention d\'eau, pas de la graisse. Compare la même phase entre cycles.'},
      {i:'📊',t:'Pour comparer tes performances objectivement, rapproche les séances de la même phase de cycle entre elles.'},
    ]
  },
  log:{
    title:'⚡ Séance',
    tips:[
      {i:'🔤',t:'Tags de série : É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Appuie sur la pastille pour changer, le nom complet s\'affiche en toast.'},
      {i:'⏱️',t:'Timer adaptatif : É = 45s · N = 2:10 · X = 4min. Boutons −15s/+15s et presets 1:00/1:30/2:00.'},
      {i:'⚡',t:'Super-séries : bouton "⚡ Grouper" dès 2 exercices → sélectionne-les → "Lier en supersérie". Enchaînement automatique sans repos. Boutons 📉 Drop / 📈 +10% / 📉 −10% pour pyramides et drop sets.'},
      {i:'📊',t:'Bouton 📊 sur chaque exercice → graphique du poids max sur les 5 dernières séances.'},
      {i:'🏋️',t:'Le 1RM (Brzycki) s\'affiche en temps réel sous le type — utilise-le pour calibrer tes charges. Appuie sur ℹ️ pour l\'aide sur les types.'},
      {i:'📸',t:'Bouton 📸 pour importer un programme depuis une photo, un fichier Word ou Excel — l\'IA le convertit en séance automatiquement.'},
    ],
    female:[]
  },
  coach:{
    title:'🤖 Coach IA',
    tips:[
      {i:'💬',t:'Ton profil complet (poids, objectif, PRs, morphologie) est injecté automatiquement — pas besoin de te présenter à chaque fois.'},
      {i:'🧠',t:'Mémoire intelligente (Premium) : le Coach résume et retient le fil de vos échanges entre sessions.'},
      {i:'📸',t:'Bouton 📷 pour envoyer une photo (analyse corpo ou morphologie). Bouton 📸 "Analyser ma morphologie" pour l\'analyse 3 angles (Premium).'},
      {i:'📋',t:'Analyse de programme IA (bouton 🤖 dans Programmes) : le Coach évalue ton programme et propose des améliorations.'},
      {i:'🔓',t:'10 questions gratuites, puis Premium illimité (4,99 € / 2 mois via Ko-fi).'},
    ],
    female:[
      {i:'🌸',t:'Mentionne ta phase de cycle ("je suis en phase lutéale") pour des conseils nutrition et entraînement adaptés à ton moment.'},
      {i:'🧬',t:'L\'analyse de morphologie 3 photos (Premium) te donne un profil silhouette détaillé avec axes de progression spécifiques.'},
    ]
  }
};

function showHelp(){
  const screen=window._curScreen==='cycle'?'home':(window._curScreen||'home');
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

// ─── SWIPE ENTRE ONGLETS ─────────────────────────────────────
const _SWIPE_ORDER=['home','progress','log','nutrition','coach'];

function _hScrollParent(el){
  while(el&&el!==document.body){
    if(el.scrollWidth>el.clientWidth+4){
      const ox=getComputedStyle(el).overflowX;
      if(ox==='auto'||ox==='scroll')return true;
    }
    el=el.parentElement;
  }
  return false;
}

function _initSwipe(){
  let _sx=null,_sy=null,_sel=null;
  const root=document.getElementById('root');
  if(!root)return;
  root.addEventListener('touchstart',e=>{
    const t=e.touches[0];_sx=t.clientX;_sy=t.clientY;_sel=e.target;
  },{passive:true});
  root.addEventListener('touchend',e=>{
    if(_sx===null)return;
    const dx=e.changedTouches[0].clientX-_sx;
    const dy=e.changedTouches[0].clientY-_sy;
    _sx=_sy=_sel=null;
    if(document.querySelector('.overlay.open'))return; // overlay ouvert → pas de navigation
    if(Math.abs(dx)<55)return;
    if(Math.abs(dy)>Math.abs(dx)*0.65)return;
    if(_hScrollParent(_sel))return;
    const idx=_SWIPE_ORDER.indexOf(window._curScreen);
    if(idx<0)return;
    if(dx<0&&idx<_SWIPE_ORDER.length-1){
      const next=_SWIPE_ORDER[idx+1];
      goScreen(next,document.getElementById('nb-'+next));
    }else if(dx>0&&idx>0){
      const prev=_SWIPE_ORDER[idx-1];
      goScreen(prev,document.getElementById('nb-'+prev));
    }
  },{passive:true});
}

// ─── PULL-TO-DISMISS ─────────────────────────────────────────
function _initPullToDismiss(){
  let _p0y=null,_p0x=null,_pOv=null,_pCnt=null,_pLocked=false;

  document.addEventListener('touchstart',e=>{
    const ov=e.target.closest('.overlay.open');
    if(!ov||ov.hasAttribute('data-no-dismiss')){_p0y=null;return;}
    // Annule si le scroll interne est déjà descendu
    let el=e.target;
    while(el&&el!==ov){if(el.scrollTop>4){_p0y=null;return;}el=el.parentElement;}
    _p0y=e.touches[0].clientY;_p0x=e.touches[0].clientX;
    _pOv=ov;_pCnt=ov.firstElementChild;_pLocked=false;
  },{passive:true});

  document.addEventListener('touchmove',e=>{
    if(_p0y===null||!_pCnt)return;
    const dy=e.touches[0].clientY-_p0y;
    const dx=e.touches[0].clientX-_p0x;
    if(!_pLocked){
      if(Math.abs(dy)<8&&Math.abs(dx)<8)return;
      if(dy<=0||Math.abs(dx)>dy*0.8){_p0y=null;return;} // vers le haut ou trop horizontal
      _pLocked=true;
    }
    if(dy<=0)return;
    e.preventDefault();
    const t=Math.pow(dy,0.78);
    _pCnt.style.transform='translateY('+t+'px)';
    _pCnt.style.transition='none';
    _pCnt.style.opacity=Math.max(0.3,1-dy/350).toFixed(2);
  },{passive:false});

  document.addEventListener('touchend',e=>{
    if(_p0y===null||!_pCnt){_p0y=null;return;}
    const dy=e.changedTouches[0].clientY-_p0y;
    const ov=_pOv,cnt=_pCnt;
    _p0y=_p0x=_pOv=_pCnt=null;_pLocked=false;
    cnt.style.transition='transform .25s cubic-bezier(.3,0,.2,1),opacity .25s';
    if(dy>100){
      cnt.style.transform='translateY('+window.innerHeight+'px)';
      cnt.style.opacity='0';
      setTimeout(()=>{ov.classList.remove('open');cnt.style.transform='';cnt.style.opacity='';cnt.style.transition='';},260);
    }else{
      cnt.style.transform='';cnt.style.opacity='';
      setTimeout(()=>{cnt.style.transition='';},260);
    }
  },{passive:true});
}

// ─── HOME ────────────────────────────────────────────────────
function _renderHomeHdr(){
  const el=document.getElementById('home-hdr');if(!el)return;
  // « Bonjour + prénom » retiré (demande Michel) — l'écran commence direct sur « CE MOIS »
  el.innerHTML='';
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
  // Restylage maquette : gros chiffre + barre de progression (au lieu de l'anneau). Mêmes données, CTA conservé.
  const barW=score!==null?score:0;
  el.innerHTML='<div style="padding:20px;border-radius:20px;background:radial-gradient(130% 100% at 0% 0%,rgba('+accent+',.10),transparent 55%),var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);" class="ft-rise">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;">'
    +'<div style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--t3);">AUJOURD\'HUI</div>'
    +pillHtml+'</div>'
    +'<div style="display:flex;align-items:flex-start;gap:16px;margin-top:14px;">'
    +'<div style="flex:none;display:flex;align-items:baseline;gap:2px;">'
    +'<span style="font-family:var(--font-cond);font-size:'+(score!==null?42:30)+'px;font-weight:800;color:var(--t1);line-height:.9;">'+(score!==null?score:'—')+'</span>'
    +(score!==null?'<span style="font-size:13px;color:var(--t3);font-weight:700;">/100</span>':'')
    +'</div>'
    +'<div style="flex:1;"><div style="font-size:16px;font-weight:700;color:var(--t1);">'+heroLabel+'</div>'
    +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:3px;">'+heroDesc+'</div></div></div>'
    +'<div style="margin-top:14px;height:7px;border-radius:4px;background:var(--bg3);overflow:hidden;"><div style="height:100%;width:'+barW+'%;background:'+ringColor+';border-radius:4px;transition:width .4s;"></div></div>'
    +'<button onclick="startWorkout()" class="ft-press" style="margin-top:16px;width:100%;height:54px;border-radius:16px;background:linear-gradient(135deg,var(--red),#EF3E57);box-shadow:0 12px 28px -10px rgba(239,62,87,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg>'
    +'<span style="font-size:16px;font-weight:700;color:#fff;font-family:var(--font);">'+ctaLabel+'</span></button></div>';
}

function renderHome(){try{
  _renderHomeHdr();
  _renderHomeHero();
  const now=new Date();
  const mo=S.sessions.filter(s=>{const d=new Date(s.date+'T12:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const vol=mo.reduce((a,s)=>a+(_workVol(s)||s.volume||0),0);
  const b3=BIG3.map(e=>S.prs[e]?S.prs[e].rm1:0).reduce((a,b)=>a+b,0);
  const latestW=S.weightLog&&S.weightLog.length?S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]:null;
  const bwDisp=latestW?latestW.kg:(S.bw||'—');
  const volDisp=vol>9999?(Math.round(vol/100)/10)+'k':Math.round(vol);
  const statsEl=document.getElementById('home-stats');
  // Restylage maquette : grille 2×2 de cartes (icône + chiffre + label) — mêmes données, mêmes clics
  const _sc=(oc,ic,icBg,icStroke,valHtml,label)=>'<div'+(oc?' onclick="'+oc+'" style="cursor:pointer;':' style="')+'background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px var(--sep);padding:13px 14px;-webkit-tap-highlight-color:transparent;">'
    +'<div style="width:32px;height:32px;border-radius:9px;background:'+icBg+';display:flex;align-items:center;justify-content:center;margin-bottom:10px;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="'+icStroke+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+ic+'</svg></div>'
    +'<div style="font-family:var(--font-cond);font-size:22px;font-weight:800;line-height:1;">'+valHtml+'</div>'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);margin-top:6px;">'+label+'</div></div>';
  const _moName=now.toLocaleDateString('fr-FR',{month:'long'});
  if(statsEl)statsEl.innerHTML='<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 3px 9px;"><span style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.16em;color:var(--t3);">CE MOIS</span><span style="font-size:12.5px;color:var(--t3);text-transform:capitalize;">'+_moName+'</span></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
    +_sc("goScreen('progress',document.getElementById('nb-progress'))",'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>','rgba(255,106,115,.14)','var(--red)','<span id="h-vol" style="color:var(--t1)">'+volDisp+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Volume')
    +_sc("goScreen('progress',document.getElementById('nb-progress'))",'<path d="M6 12h12M4 9v6M8 8v8M16 8v8M20 9v6"/>','rgba(234,179,8,.14)','var(--gold)','<span id="h-big3" style="color:var(--orange)">'+(b3>0?Math.round(b3):'—')+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Big 3 · 1RM')
    +_sc(null,'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','rgba(168,85,247,.14)','var(--purp)','<span id="h-sess" style="color:var(--t1)">'+mo.length+'</span>','Séances ce mois')
    +_sc("goWeightTab()",'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9.5a3 3 0 0 1 6 0"/><line x1="12" y1="9.5" x2="13.8" y2="8"/>','rgba(91,168,255,.14)','#5BA8FF','<span id="h-bw" style="color:var(--t1)">'+fmt(bwDisp)+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Poids de corps')
    +'</div>';
  const b3Lvl=BIG3.map(ex=>{const pr=S.prs[ex];const rm=pr?pr.rm1:0;return(S.bw&&S.age&&rm)?getLevel(ex,rm,S.bw,S.gender,S.age).name:'—';});
  const lvlSub=b3Lvl.some(l=>l!=='—')?b3Lvl.join(' · '):'Log tes séances pour voir ton niveau';
  const prCount=Object.keys(S.prs||{}).length;
  const prSub=prCount>0?prCount+' exercice'+(prCount>1?'s':'')+' traqé'+(prCount>1?'s':''):'Commence à logger tes séances';
  const chevSvg='<svg class="home-row-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  const secEl=document.getElementById('home-secondary');
  // Restylage maquette : 3 cartes séparées (au lieu d'une carte avec traits)
  const _nc='<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px var(--sep);overflow:hidden;">';
  if(secEl)secEl.innerHTML='<div style="display:flex;flex-direction:column;gap:10px;">'
    +_nc+'<div class="home-row ft-press" onclick="goScreen(\'cycle\',null)">'
    +'<div class="home-row-ic" style="background:rgba(239,62,87,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl" id="cycle-home-title">Cycle de Force</div><div class="home-row-sub" id="cycle-home-sub">Planifie ta progression sur mesure</div></div>'+chevSvg+'</div></div>'
    +_nc+'<div class="home-row ft-press" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div class="home-row-ic" style="background:rgba(234,179,8,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl">Niveau de force</div><div class="home-row-sub">'+lvlSub+'</div></div>'+chevSvg+'</div></div>'
    +_nc+'<div class="home-row ft-press" onclick="goScreen(\'progress\',document.getElementById(\'nb-progress\'))">'
    +'<div class="home-row-ic" style="background:rgba(168,85,247,.14);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purp)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 22l4-2.5L16 22l-1-8.5"/></svg></div>'
    +'<div class="home-row-cnt"><div class="home-row-ttl">Records personnels</div><div class="home-row-sub">'+prSub+'</div></div>'+chevSvg+'</div></div>'
    +'</div>';
  renderCycleHomeCard();
  updatePill();
}catch(e){console.error('[FT] renderHome:',e);}}

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

function renderNutrition(){try{
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
  // Barres macros = part des calories (prot/glucides 4 kcal/g, lipides 9 kcal/g)
  (function(){
    const kP=(macros.prot_g||0)*4, kC=(macros.carbs_g||0)*4, kF=(macros.fat_g||0)*9;
    const tot=kP+kC+kF||1;
    const set=(barId,pctId,kcal)=>{
      const pct=Math.round(kcal/tot*100);
      const bar=document.getElementById(barId), lbl=document.getElementById(pctId);
      if(bar)bar.style.width=pct+'%';
      if(lbl)lbl.textContent='· '+pct+'%';
    };
    set('m-prot-bar','m-prot-pct',kP);
    set('m-carbs-bar','m-carbs-pct',kC);
    set('m-fat-bar','m-fat-pct',kF);
    const hb=document.getElementById('nu-hydra-bar');
    if(hb)hb.style.width=Math.min(100,Math.round((parseFloat(hydra)||0)/3.5*100))+'%';
    // Anneau hero : arcs = part des calories (prot vert, glucides orange, lipides or)
    const C=2*Math.PI*52; // circonférence r=52
    const arc=(id,kcal,startKcal)=>{
      const el=document.getElementById(id);if(!el)return;
      const len=kcal/tot*C;
      el.style.strokeDasharray=len.toFixed(1)+' '+(C-len).toFixed(1);
      el.style.strokeDashoffset=(-(startKcal/tot*C)).toFixed(1);
    };
    arc('ring-prot',kP,0);
    arc('ring-carb',kC,kP);
    arc('ring-fat',kF,kP+kC);
    const pctP=Math.round(kP/tot*100),pctC=Math.round(kC/tot*100),pctF=Math.round(kF/tot*100);
    const lp=document.getElementById('ring-lg-p'),lcg=document.getElementById('ring-lg-c'),lf=document.getElementById('ring-lg-f');
    if(lp)lp.textContent=pctP+'%';
    if(lcg)lcg.textContent=pctC+'%';
    if(lf)lf.textContent=pctF+'%';
  })();

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

  // Meal plan statique
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
  renderMealPlanIA();
}catch(e){console.error('[FT] renderNutrition:',e);}}

// ─── PLAN DE REPAS IA ────────────────────────────────────────
let _mpDay=0;
function setMpDay(i){_mpDay=i;renderMealPlanIA();}
function renderMealPlanIA(){
  const el=document.getElementById('meal-plan-ia');if(!el)return;
  const isPrem=S.premium,plan=S.mealPlan,td=today();
  const DAY=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  if(!plan||!plan.days||!plan.days.length){
    el.innerHTML=`<div style="background:var(--bg2);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="font-size:13px;color:var(--t2);line-height:1.5;text-align:center;">Plan de repas personnalisé par l'IA, adapté à tes macros et ton objectif.</div>`
      +`<button class="btn btn-red" id="mp-gen-btn" onclick="generateMealPlan()" style="padding:14px;font-size:15px;">🍽️ Générer${isPrem?' ma semaine':' mon repas du jour'}</button>`
      +(!isPrem?`<div style="font-size:11px;color:var(--t3);text-align:center;">🆓 Gratuit : repas du jour · 1 régénération/j &nbsp;·&nbsp; ⭐ Premium : semaine + illimité</div>`:'')
      +`</div>`;
    return;
  }
  const days=isPrem?plan.days:plan.days.slice(0,1);
  const canRegen=isPrem||(plan.regenDate!==td||(plan.regenCount||0)<1);
  let html=`<div style="display:flex;flex-direction:column;gap:8px;">`;
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:11px;color:var(--t3);">Généré le ${fmtD(plan.generatedAt)}</span>
    <button class="btn-xs" style="color:var(--red);border-color:rgba(255,45,85,.3);" onclick="generateMealPlan()">🔄 Tout régénérer</button>
  </div>`;
  if(isPrem&&days.length>1){
    if(_mpDay>=days.length)_mpDay=0;
    html+=`<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:2px;">`;
    days.forEach((d,i)=>{
      const wd=new Date(d.date+'T12:00:00').getDay(),isT=d.date===td,sel=i===_mpDay;
      html+=`<button onclick="setMpDay(${i})" style="flex-shrink:0;padding:5px 10px;border-radius:20px;border:1px solid ${sel?'var(--red)':'var(--sep)'};background:${sel?'rgba(255,45,85,.12)':'var(--bg3)'};color:${sel?'var(--red)':isT?'var(--t1)':'var(--t2)'};font-size:12px;font-weight:${sel||isT?700:500};cursor:pointer;touch-action:manipulation;">${DAY[wd]}${isT?'·':''}</button>`;
    });
    html+=`</div>`;
    html+=_renderMealDay(days[_mpDay],isPrem,true);
  }else{
    html+=_renderMealDay(days[0],isPrem,canRegen);
  }
  if(!isPrem){
    html+=`<div style="background:rgba(255,214,0,.07);border:1px solid rgba(255,214,0,.15);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">⭐</span>
      <div style="font-size:12px;color:var(--t2);">Premium : semaine complète + régénérations illimitées — <strong style="color:var(--gold);">4,99€/2 mois</strong></div>
    </div>`;
  }
  el.innerHTML=html+`</div>`;
}
function _renderMealDay(day,isPrem,canRegen){
  if(!day)return'';
  let h=`<div style="display:flex;flex-direction:column;gap:6px;">`;
  (day.meals||[]).forEach(m=>{
    const enc=m.name.replace(/'/g,"\\'");
    h+=`<div style="background:var(--bg2);border-radius:12px;padding:12px 14px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">`
      +`<div style="font-weight:700;font-size:13px;color:var(--t1);">${m.name}</div>`
      +`<div style="display:flex;align-items:center;gap:6px;">`
      +`<span style="font-size:12px;font-weight:700;color:var(--red);">${m.kcal||0} kcal</span>`
      +(canRegen?`<button onclick="generateMealPlan('${day.date}','${enc}')" style="background:none;border:none;padding:2px 6px;color:var(--t3);cursor:pointer;font-size:14px;touch-action:manipulation;" title="Régénérer ce repas">🔄</button>`:'')
      +`</div></div>`
      +`<ul style="margin:0;padding:0 0 0 14px;display:flex;flex-direction:column;gap:1px;">`
      +(m.foods||[]).map(f=>`<li style="font-size:12px;color:var(--t2);">${f}</li>`).join('')
      +`</ul>`
      +`<div style="font-size:11px;color:var(--t3);margin-top:5px;">P ${m.prot||0}g · G ${m.carbs||0}g · L ${m.fat||0}g</div>`
      +`</div>`;
  });
  return h+`</div>`;
}

