// ─── SUPPLÉMENTS & PROTÉINES ──────────────────────────────────
let creatPhase = 'charge';

function updateProteinBar() {
  const macros = calcMacros(S.nutritionPhase || 'charge');
  const target = macros.prot_g || 0;
  const eaten = parseFloat(document.getElementById('prot-eaten')?.value) || 0;
  const pct = target > 0 ? Math.min(Math.round(eaten / target * 100), 100) : 0;
  const remaining = Math.max(0, target - eaten);

  const bar = document.getElementById('prot-bar');
  const pctDisp = document.getElementById('prot-pct-disp');
  const remDisp = document.getElementById('prot-remaining');
  const targDisp = document.getElementById('prot-target-disp');

  if (bar) bar.style.width = pct + '%';
  if (bar) bar.style.background = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)';
  if (pctDisp) { pctDisp.textContent = pct + '%'; pctDisp.style.color = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)'; }
  if (remDisp) remDisp.textContent = remaining + ' g';
  if (targDisp) targDisp.textContent = target + ' g';
}

function setCreatPhase(phase, btn) {
  creatPhase = phase;
  document.querySelectorAll('.phase-toggle-small .ptbtn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSupplements();
}

function renderSupplements() {
  renderCreatine();
  renderWhey();
  updateProteinBar();
}

function renderCreatine() {
  const el = document.getElementById('creat-content');
  if (!el) return;
  const bw = S.bw || 80;

  if (creatPhase === 'charge') {
    const dailyDose = 20; // standard loading
    const perDose = 5;
    el.innerHTML = `
      <div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--blue);">${dailyDose}g / jour</span></div>
      <div class="dose-row"><span class="dose-label">Nombre de prises</span><span class="dose-val">${dailyDose/perDose}× ${perDose}g</span></div>
      <div class="dose-row"><span class="dose-label">Durée phase charge</span><span class="dose-val">5 à 7 jours</span></div>
      <div class="dose-row" style="border-bottom:none;"><span class="dose-label">Moment</span><span class="dose-val" style="font-size:13px;">Avec repas</span></div>
      <div class="tip-box">💡 Prends <strong>5g</strong> avec chaque repas principal (petit-déj, déjeuner, collation, dîner). Les glucides améliorent l'absorption. Après 5-7j, passe en maintenance.</div>`;
  } else {
    const dose = Math.round(bw * 0.05 * 10) / 10;
    const rounded = Math.min(Math.max(dose, 3), 5);
    el.innerHTML = `
      <div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--green);">${rounded}g / jour</span></div>
      <div class="dose-row"><span class="dose-label">Prise recommandée</span><span class="dose-val">1× ${rounded}g</span></div>
      <div class="dose-row" style="border-bottom:none;"><span class="dose-label">Moment idéal</span><span class="dose-val" style="font-size:13px;">Post-workout</span></div>
      <div class="tip-box">✅ Prends <strong>${rounded}g</strong> chaque jour, même les jours sans entraînement. Avec un repas ou post-workout. La constance est clé — les effets sont cumulatifs.</div>`;
  }
}

function renderWhey() {
  const el = document.getElementById('whey-content');
  if (!el) return;
  const bw = S.bw || 80;
  const dose = Math.round(bw * 0.4);
  const daily = calcMacros(S.nutritionPhase || 'charge').prot_g || 0;

  el.innerHTML = `
    <div class="dose-row"><span class="dose-label">Dose post-workout</span><span class="dose-val" style="color:var(--orange);">${dose}g</span></div>
    <div class="dose-row"><span class="dose-label">Fenêtre anabolique</span><span class="dose-val" style="font-size:13px;">0-60 min</span></div>
    <div class="dose-row" style="border-bottom:none;"><span class="dose-label">Contribution protéines</span><span class="dose-val">${dose}g / ${daily}g objectif</span></div>
    <div class="tip-box">🥤 <strong>${dose}g de whey</strong> dans 300ml d'eau ou lait écrémé, dans l'heure qui suit ta séance. Ajoute une banane pour les glucides rapides en phase de charge.</div>`;
}


// ─── CARDIO ───────────────────────────────────────────────────
const CARDIO_MET={
  elliptique:{leger:4.0,modere:6.0,intense:8.5},
  tapis:     {leger:3.5,modere:5.5,intense:9.5},
  velo:      {leger:4.0,modere:6.8,intense:10.0},
  rameur:    {leger:4.5,modere:7.0,intense:10.5},
  corde:     {leger:6.0,modere:9.0,intense:12.0},
  autre:     {leger:3.5,modere:5.5,intense:8.0},
};
const CARDIO_LABELS={elliptique:'Elliptique',tapis:'Tapis',velo:'Vélo',rameur:'Rameur',corde:'Corde',autre:'Autre'};

function calcCardioKcal(c){
  if(!c||!c.duration)return 0;
  const met=(CARDIO_MET[c.type||'elliptique']||CARDIO_MET.autre)[c.intensity||'modere'];
  return Math.round(met*(S.bw||80)*(c.duration/60));
}
function setCardioField(field,val){
  if(!S.wkt)return;
  if(!S.wkt.cardio)S.wkt.cardio={type:'elliptique',intensity:'modere',duration:0};
  S.wkt.cardio[field]=field==='duration'?Math.max(0,Math.min(300,parseInt(val)||0)):val;
  persist();
  // Durée : NE PAS re-render (sinon l'input est détruit à chaque chiffre → focus perdu sur mobile → saisie impossible).
  // On met juste à jour le résumé ; les boutons type/intensité, eux, re-render pour refléter la sélection.
  if(field==='duration')_updateCardioSummary();
  else renderCardioBlock();
  if(typeof renderLogFinish==='function')renderLogFinish(); // le cardio seul suffit pour valider → afficher/màj le bouton
}
function _updateCardioSummary(){
  const c=S.wkt&&S.wkt.cardio;if(!c)return;
  const el=document.getElementById('cardio-summary');
  if(el){
    const kcal=calcCardioKcal(c);
    el.textContent=c.duration?`${CARDIO_LABELS[c.type||'elliptique']} · ${c.duration}min · ~${kcal}kcal`:'optionnel';
    el.style.color=kcal?'var(--green)':'var(--t3)';
  }
  // Bouton « Enregistrer le cardio » : visible dès qu'une durée est saisie (sans re-render → focus gardé)
  const btn=document.getElementById('cardio-save-btn');
  if(btn)btn.style.display=(c.duration>0)?'block':'none';
}
let _cardioOpen=false;
function toggleCardio(){_cardioOpen=!_cardioOpen;renderCardioBlock();}
function renderCardioBlock(){
  const el=document.getElementById('log-cardio');if(!el)return;
  if(!S.wkt){el.innerHTML='';return;}
  if(!S.wkt.cardio)S.wkt.cardio={type:'elliptique',intensity:'modere',duration:0};
  const c=S.wkt.cardio;
  const kcal=calcCardioKcal(c);
  const types=Object.keys(CARDIO_LABELS);
  const summary=c.duration?`${CARDIO_LABELS[c.type||'elliptique']} · ${c.duration}min · ~${kcal}kcal`:'optionnel';
  el.innerHTML=`<div style="background:var(--bg2);border-radius:12px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);">
  <div onclick="toggleCardio()" style="display:flex;align-items:center;gap:13px;padding:12px 16px;cursor:pointer;touch-action:manipulation;">
    <div class="home-row-ic" style="background:rgba(255,138,114,.12);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M10 12L8 20"/><path d="M10 12L13 17L16 12"/><path d="M6 12L8 10L12 12L16 10L18 12"/></svg></div>
    <span class="home-row-ttl" style="flex:1;">Cardio</span>
    <span id="cardio-summary" style="font-size:12px;color:${kcal?'var(--green)':'var(--t3)'};">${summary}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--t3);transition:transform .2s;transform:rotate(${_cardioOpen?-90:0}deg);flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
  ${_cardioOpen?`<div style="padding:0 12px 12px;border-top:1px solid var(--sep);padding-top:10px;">
    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
      ${types.map(t=>`<button onclick="setCardioField('type','${t}')" style="flex-shrink:0;padding:5px 11px;border-radius:20px;border:none;font-size:12px;font-family:var(--font);cursor:pointer;background:${c.type===t?'var(--red)':'var(--bg2)'};color:${c.type===t?'#fff':'var(--t2)'};">${CARDIO_LABELS[t]}</button>`).join('')}
    </div>
    <div style="display:flex;gap:5px;align-items:center;margin-top:8px;">
      ${['leger','modere','intense'].map((iv,i)=>{const lbl=['Léger','Modéré','Intense'][i];return`<button onclick="setCardioField('intensity','${iv}')" style="flex:1;padding:6px 0;border-radius:8px;border:none;font-size:12px;font-family:var(--font);cursor:pointer;background:${c.intensity===iv?'var(--red)':'var(--bg2)'};color:${c.intensity===iv?'#fff':'var(--t2)'};">${lbl}</button>`;}).join('')}
      <div style="display:flex;align-items:center;gap:6px;margin-left:6px;">
        <label style="font-size:12px;color:var(--t2);white-space:nowrap;">Durée</label>
        <input type="number" inputmode="numeric" min="0" max="300" value="${c.duration||''}" placeholder="0" oninput="setCardioField('duration',this.value)" style="width:52px;padding:5px 8px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:14px;font-weight:700;font-family:var(--font);text-align:center;">
        <span style="font-size:12px;color:var(--t3);">min</span>
      </div>
    </div>
    <button id="cardio-save-btn" class="btn btn-red ft-press" onclick="saveCardioEntry()" style="width:100%;margin-top:10px;padding:10px;font-size:14px;display:${c.duration>0?'block':'none'};">✓ Enregistrer le cardio</button>
  </div>`:''}
</div>`;
}
// Valide le cardio : replie le bloc (le résumé reste visible dans l'en-tête) — pas besoin de scroller.
function saveCardioEntry(){
  if(!S.wkt||!S.wkt.cardio||!S.wkt.cardio.duration){toast('Entre une durée de cardio','info');return;}
  _cardioOpen=false;persist();renderCardioBlock();
  if(typeof renderLogFinish==='function')renderLogFinish();
  toast('Cardio enregistré ✅','success');
}

// ─── CALORIES BRÛLÉES ─────────────────────────────────────────
const MET_LOWER = 6.5;  // Squat, Deadlift, Hip Thrust, Leg Press
const MET_UPPER = 5.5;  // Bench, OHP, Rowing, Pull-ups
const MET_OLYMPIC = 8.0; // Arraché, Épaulé-jeté
const MET_ISO = 4.0;    // Isolation: curl, extension...
const MET_REST = 2.0;   // Entre les séries (position debout/assis)

const LOWER_KW = ['Squat','Soulevé','Romanian','Hip Thrust','Leg Press','Hack','Leg Curl','Leg Ext'];
const UPPER_KW = ['Développé','Militaire','Rowing','Traction','Dips','Incliné','Écarté','Face Pull','Tirage'];
const OLYMPIC_KW = ['Arraché','Épaulé','Jeté'];

function getExerciseMET(name) {
  if (OLYMPIC_KW.some(k => name.includes(k))) return MET_OLYMPIC;
  if (LOWER_KW.some(k => name.includes(k))) return MET_LOWER;
  if (UPPER_KW.some(k => name.includes(k))) return MET_UPPER;
  return MET_ISO;
}

function calcSessionCalories(session) {
  const bw = S.bw || 80;
  const restSec = S.defRest || 120;
  const exs = session.exs || session.exercises || [];
  
  let totalCals = 0;
  let totalSets = 0;
  let totalActiveMin = 0;
  let totalRestMin = 0;
  const breakdown = {};

  exs.forEach(ex => {
    const doneSets = (ex.sets || []).filter(s => s.done);
    if (!doneSets.length) return;

    const met = getExerciseMET(ex.name);
    const n = doneSets.length;
    totalSets += n;

    const activeHours = n * 30 / 3600;        // 30s par série
    const restHours = Math.max(0,n-1) * restSec / 3600;

    const calsActive = met * bw * activeHours;
    const calsRest   = MET_REST * bw * restHours;
    const exCals = calsActive + calsRest;

    totalCals += exCals;
    totalActiveMin += n * 30 / 60;
    totalRestMin += Math.max(0,n-1) * restSec / 60;
    breakdown[ex.name] = Math.round(exCals);
  });

  // Échauffement/retour au calme estimé (10 min MET 3.5)
  const warmupCals = 3.5 * bw * (10/60);
  totalCals += warmupCals;

  return {
    total: Math.round(totalCals),
    totalSets,
    activeMin: Math.round(totalActiveMin),
    restMin: Math.round(totalRestMin),
    totalMin: Math.round(totalActiveMin + totalRestMin + 10),
    breakdown
  };
}

function renderCalorieBreakdown(calData) {
  const entries = Object.entries(calData.breakdown);
  if (!entries.length) return '';
  return entries.map(([ex, kcal]) =>
    `<div class="cal-item"><span>${ex}</span><strong>${kcal} kcal</strong></div>`
  ).join('');
}


function toggleTheme(btn) {
  const root = document.getElementById('root');
  const isLight = root.classList.toggle('light-mode');
  document.documentElement.classList.toggle('light-mode', isLight);
  localStorage.setItem('ft4_theme', isLight ? 'light' : 'dark');
  if (btn) btn.innerHTML = isLight ? '🌙 Mode Nuit' : '☀️ Mode Jour';
}

function applyTheme() {
  const saved = localStorage.getItem('ft4_theme');
  const btn = document.getElementById('theme-toggle-btn');
  if (saved === 'light') {
    document.getElementById('root').classList.add('light-mode');
    document.documentElement.classList.add('light-mode');
    if (btn) btn.innerHTML = '🌙 Mode Nuit';
  }
}

// -- Apparence : halo (couleur au choix) ou fond uni + theme Jour/Nuit --
function setHalo(mode){        // 'none' = fond uni ; sinon = halo active (garde la couleur courante)
  S.halo = (mode==='none') ? 'none' : 'on';
  try{ localStorage.setItem('ft4_halo', S.halo); }catch(e){}
  persist();
  _applyHalo();
  toast(S.halo==='none' ? 'Apparence : Fond uni' : 'Apparence : Halo active ✨', 'info');
}
function setHaloColor(rgb){    // couleur de la palette -> active le halo avec cette couleur
  S.halo='on'; S.haloColor=rgb;
  try{ localStorage.setItem('ft4_halo','on'); localStorage.setItem('ft4_haloColor',rgb); }catch(e){}
  persist();
  _applyHalo();
}
function setHaloDir(dir){      // 'top' (normal) | 'bottom' (inverse)
  S.haloDir = (dir==='bottom') ? 'bottom' : 'top';
  try{ localStorage.setItem('ft4_haloDir', S.haloDir); }catch(e){}
  persist();
  _applyHalo();
}
function _applyHalo(){
  const root=document.getElementById('root');
  document.documentElement.classList.toggle('no-halo', S.halo==='none');
  if(root){
    root.style.setProperty('--halo-rgb', S.haloColor||'59,130,246');
    if(S.haloDir==='bottom'){
      root.style.setProperty('--halo-y','100%');
      root.style.setProperty('--halo-h','118%');
      root.style.setProperty('--halo-stop','82%');
    }else{
      root.style.setProperty('--halo-y','0%');
      root.style.setProperty('--halo-h','92%');
      root.style.setProperty('--halo-stop','66%');
    }
  }
  const n=document.getElementById('appr-none');
  if(n) n.classList.toggle('active', S.halo==='none');
  const dn=document.getElementById('appr-dir-normal'), di=document.getElementById('appr-dir-invert');
  if(dn) dn.classList.toggle('active', S.haloDir!=='bottom');
  if(di) di.classList.toggle('active', S.haloDir==='bottom');
  document.querySelectorAll('.appr-color').forEach(function(el){
    el.classList.toggle('active', S.halo!=='none' && el.getAttribute('data-rgb')===S.haloColor);
  });
}
function setTheme(mode){
  const isLight = mode==='light';
  const root=document.getElementById('root');
  root.classList.toggle('light-mode', isLight);
  document.documentElement.classList.toggle('light-mode', isLight);
  try{ localStorage.setItem('ft4_theme', isLight?'light':'dark'); }catch(e){}
  _applyThemeBtns();
  const tb=document.getElementById('theme-toggle-btn'); if(tb) tb.innerHTML = isLight?'🌙 Mode Nuit':'☀️ Mode Jour';
}
function _applyThemeBtns(){
  const isLight=document.getElementById('root') && document.getElementById('root').classList.contains('light-mode');
  const j=document.getElementById('appr-jour'), n=document.getElementById('appr-nuit');
  if(j) j.classList.toggle('active', !!isLight);
  if(n) n.classList.toggle('active', !isLight);
}



function switchNuTab(tab, btn) {
  ['macros','journal','suppl'].forEach(t => {
    const el = document.getElementById('nu-' + t);
    if (el) el.style.display = t === tab ? 'flex' : 'none';
  });
  document.querySelectorAll('.nu-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'suppl') renderSupplements();
  if (tab === 'journal') renderFoodJournal();
}

// ─── JOURNAL ALIMENTAIRE ──────────────────────────────────────
const FOOD_MEALS = [
  {k:'petitdej', ic:'🌅', lbl:'Petit-déj'},
  {k:'dejeuner', ic:'🍽️', lbl:'Déjeuner'},
  {k:'collation',ic:'🍎', lbl:'Collation'},
  {k:'diner',    ic:'🌙', lbl:'Dîner'}
];
let _afMeal='dejeuner';
const FOOD_AI_FREE_LIMIT=25; // ~ une semaine de notes IA en gratuit (illimité en Premium)
function _foodMealInfo(k){return FOOD_MEALS.find(m=>m.k===k)||FOOD_MEALS[1];}
function _foodAiLeft(){return Math.max(0,FOOD_AI_FREE_LIMIT-(S.foodAiUses||0));}
function showFoodWall(){const el=document.getElementById('ov-food-wall');if(el)el.classList.add('open');}
function closeFoodWall(){const el=document.getElementById('ov-food-wall');if(el)el.classList.remove('open');}

// ─── SCAN CODE-BARRES (ZXing local + Open Food Facts) ─────────
let _bcNutr=null; // {name, kcal100, prot100, carbs100, fat100}
function _loadZXing(){
  return new Promise((res,rej)=>{
    if(window.ZXing&&window.ZXing.BrowserMultiFormatReader){res();return;}
    const s=document.createElement('script');
    s.src='./lib/zxing.min.js';
    s.onload=()=>{(window.ZXing&&window.ZXing.BrowserMultiFormatReader)?res():rej(new Error('ZXing indisponible'));};
    s.onerror=()=>rej(new Error('Lecteur code-barres non chargé'));
    document.head.appendChild(s);
  });
}
// Le bouton « Scanner un code-barres » ouvre le scanner EN DIRECT (façon Yuka).
function scanBarcode(){ openBarcodeScanner(); }
// Repli : ancienne méthode photo unique (input file caméra).
function scanBarcodePhoto(){ const inp=document.getElementById('af-bc-input'); if(inp){inp.value='';inp.click();} }
function _bcPhotoFallback(){ closeBarcodeScanner(); scanBarcodePhoto(); }

// ─── SCANNER CODE-BARRES EN DIRECT (caméra live + ZXing continu) ─────────────
let _bcReader=null, _bcScanning=false;
function _bcHints(){
  try{
    const h=new Map();
    h.set(ZXing.DecodeHintType.TRY_HARDER,true);
    h.set(ZXing.DecodeHintType.POSSIBLE_FORMATS,[ZXing.BarcodeFormat.EAN_13,ZXing.BarcodeFormat.EAN_8,ZXing.BarcodeFormat.UPC_A,ZXing.BarcodeFormat.UPC_E]);
    return h;
  }catch(e){ return undefined; }
}
async function openBarcodeScanner(){
  let ov=document.getElementById('ov-bc-scan');
  if(!ov){ov=document.createElement('div');ov.id='ov-bc-scan';ov.className='overlay';ov.style.zIndex='600';document.body.appendChild(ov);}
  ov.innerHTML='<div class="modal" style="max-width:94vw;padding:14px;text-align:center;">'
    +'<div style="font-weight:800;font-size:15px;color:var(--t1);margin-bottom:4px;">📷 Scanne le code-barres</div>'
    +'<div style="font-size:12px;color:var(--t3);margin-bottom:10px;">Cadre le code-barres dans le rectangle rouge, bien net, puis appuie sur « Capturer » (ou attends, ça se lit tout seul).</div>'
    +'<div style="position:relative;width:100%;aspect-ratio:3/4;max-height:56vh;background:#000;border-radius:12px;overflow:hidden;">'
      +'<video id="bc-video" autoplay muted playsinline webkit-playsinline style="width:100%;height:100%;object-fit:cover;"></video>'
      +'<div style="position:absolute;left:6%;right:6%;top:40%;height:20%;border:3px solid rgba(255,45,85,.95);border-radius:8px;pointer-events:none;"></div>'
    +'</div>'
    +'<div id="bc-scan-status" style="font-size:12px;color:var(--t3);margin-top:8px;min-height:16px;">Démarrage de la caméra…</div>'
    +'<button id="bc-capture-btn" class="btn" style="width:100%;margin-top:10px;background:var(--red);color:#fff;font-weight:700;" onclick="_bcCaptureFrame()">📸 Capturer le code</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="_bcPhotoFallback()">🖼️ Prendre une photo à la place</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="closeBarcodeScanner()">Annuler</button>'
    +'</div>';
  ov.classList.add('open');
  try{
    await _loadZXing();
    _bcReader=new ZXing.BrowserMultiFormatReader(_bcHints());
    const video=document.getElementById('bc-video');
    _bcScanning=true;
    // Haute résolution → le code-barres a assez de pixels pour être décodé (sinon « caméra ouverte mais ne lit pas »)
    await _bcReader.decodeFromConstraints({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},advanced:[{focusMode:'continuous'}]}}, video, (result)=>{
      if(result&&_bcScanning){
        const code=result.getText&&result.getText();
        if(code){ _bcScanning=false; closeBarcodeScanner(); _lookupBarcode(code); }
      }
      // erreur "NotFound" entre les frames = normal, on ignore
    });
    try{ const v=document.getElementById('bc-video'); if(v&&v.play)v.play().catch(()=>{}); }catch(e){}
    const st=document.getElementById('bc-scan-status'); if(st)st.textContent='Vise le code-barres… ou appuie sur « Capturer ».';
  }catch(e){
    const st=document.getElementById('bc-scan-status');
    if(st)st.textContent='Caméra indisponible ici — utilise « Prendre une photo » ou saisis à la main.';
    // overlay laissé ouvert avec le bouton photo en repli
  }
}
// Capture manuelle : lit l'image en direct de la caméra (déjà cadrée + focalisée) → décodage ZXing.
async function _bcCaptureFrame(){
  const video=document.getElementById('bc-video');
  const st=document.getElementById('bc-scan-status');
  if(!video||!video.videoWidth){ if(st)st.textContent='Caméra pas encore prête, réessaie dans 1 s…'; return; }
  if(st)st.textContent='Lecture…';
  try{
    const c=document.createElement('canvas');
    c.width=video.videoWidth; c.height=video.videoHeight;
    c.getContext('2d').drawImage(video,0,0,c.width,c.height);
    const url=c.toDataURL('image/jpeg',0.95);
    const reader=new ZXing.BrowserMultiFormatReader(_bcHints());
    let code='';
    try{ const res=await reader.decodeFromImageUrl(url); code=res&&res.getText&&res.getText(); }catch(e){ code=''; }
    try{ reader.reset(); }catch(e){}
    if(code){ _bcScanning=false; closeBarcodeScanner(); _lookupBarcode(code); }
    else if(st){ st.textContent='Pas lu — recule un peu (~15-20 cm), attends la mise au point, remplis le cadre rouge, puis recapture.'; }
  }catch(e){ if(st)st.textContent='Souci de capture — réessaie ou « Prendre une photo ».'; }
}
function closeBarcodeScanner(){
  _bcScanning=false;
  try{ if(_bcReader)_bcReader.reset(); }catch(e){}
  try{ if(_bcReader&&_bcReader.stopStreams)_bcReader.stopStreams(); }catch(e){}
  _bcReader=null;
  const ov=document.getElementById('ov-bc-scan'); if(ov)ov.classList.remove('open');
}
async function onBarcodeFile(input){
  const f=input.files&&input.files[0];if(!f)return;
  const url=URL.createObjectURL(f);
  toast('Lecture du code-barres…','info');
  try{
    await _loadZXing();
    const reader=new ZXing.BrowserMultiFormatReader();
    let code='';
    try{const result=await reader.decodeFromImageUrl(url);code=result&&result.getText&&result.getText();}
    catch(e){code='';}
    try{reader.reset&&reader.reset();}catch(e){}
    URL.revokeObjectURL(url);
    if(!code){toast('Code-barres illisible — rapproche-toi ou saisis à la main','error');return;}
    await _lookupBarcode(code);
  }catch(e){URL.revokeObjectURL(url);toast('Erreur scan : '+(e.message||e),'error');}
}
// Récupère un produit Open Food Facts — essaie l'API v2 (champs) PUIS v0 (repli).
// ⚠️ Tolérant sur le champ « status » : v2 ne renvoie pas toujours status===1 pour un produit trouvé
// (ancien bug : le produit existait mais était rejeté « introuvable »). On considère « trouvé » dès que
// l'objet product contient de vraies données (nom, marque ou nutriments).
async function _offFetchProduct(ean){
  const urls=[
    'https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(ean)+'.json?fields=product_name,product_name_fr,generic_name,generic_name_fr,brands,quantity,nutriments,serving_quantity,nutriscore_grade,nova_group,additives_n,labels_tags,image_front_small_url',
    'https://world.openfoodfacts.org/api/v0/product/'+encodeURIComponent(ean)+'.json'
  ];
  for(let i=0;i<urls.length;i++){
    try{
      const r=await fetch(urls[i],{headers:{'Accept':'application/json'}});
      if(!r.ok)continue;
      const d=await r.json();
      const p=d&&d.product;
      const notFound = !p || (typeof p==='object'&&!Object.keys(p).length) || d.status===0 || d.status==='failure' || d.status_verbose==='product not found';
      if(!notFound && p && (p.product_name||p.product_name_fr||p.generic_name||p.generic_name_fr||p.brands||(p.nutriments&&Object.keys(p.nutriments).length))) return p;
    }catch(e){ /* essaie l'URL suivante */ }
  }
  return null;
}
// Saisie manuelle du code-barres (repli quand le scan galère + test facile)
function _manualBarcode(){
  const inp=document.getElementById('af-bc-manual');
  const code=inp?(inp.value||'').replace(/\D/g,''):'';
  if(code.length<8){toast('Tape le code-barres complet (au moins 8 chiffres)','error');return;}
  _lookupBarcode(code);
}
async function _lookupBarcode(ean){
  toast('Recherche du produit…','info');
  let p=null;
  try{ p=await _offFetchProduct(ean); }
  catch(e){ toast('Réseau indisponible pour la recherche produit','error'); return; }
  if(!p){ toast('Produit introuvable dans la base (code '+ean+') — saisis à la main','error'); return; }
  const n=p.nutriments||{};
  const kcal100=Math.round(n['energy-kcal_100g']||(n['energy_100g']?n['energy_100g']/4.184:0)||0);
  _bcNutr={
    name:((p.product_name_fr||p.product_name||p.generic_name_fr||p.generic_name||'Produit')+(p.brands?' ('+String(p.brands).split(',')[0].trim()+')':'')).slice(0,60),
    kcal100:kcal100,
    prot100:Math.round(n['proteins_100g']||0),
    carbs100:Math.round(n['carbohydrates_100g']||0),
    fat100:Math.round(n['fat_100g']||0)
  };
  if(!_bcNutr.kcal100&&!_bcNutr.prot100&&!_bcNutr.carbs100&&!_bcNutr.fat100){toast('Produit trouvé mais sans infos nutritionnelles — saisis à la main','error');return;}
  // Quantité par défaut : portion si connue, sinon 100 g
  const serv=parseFloat(p.serving_quantity)||0;
  const g=serv>0?serv:100;
  const gramsEl=document.getElementById('af-bc-grams');if(gramsEl)gramsEl.value=g;
  const nameEl=document.getElementById('af-bc-name');if(nameEl)nameEl.textContent=_bcNutr.name+' · '+_bcNutr.kcal100+' kcal/100g';
  const row=document.getElementById('af-bc-row');if(row)row.style.display='block';
  document.getElementById('af-desc').value=_bcNutr.name;
  _bcApplyGrams();
  // Score santé indicatif (Nutri-Score + NOVA + additifs) — module food-health.js
  try{ if(window.FoodHealth)FoodHealth.renderCard(p,'#af-health-card'); }catch(e){}
  toast('Produit trouvé ✅ — ajuste la quantité','success');
}
function _bcApplyGrams(){
  if(!_bcNutr)return;
  const g=parseFloat((document.getElementById('af-bc-grams')||{}).value)||0;
  const f=g/100;
  document.getElementById('af-kcal').value=Math.round(_bcNutr.kcal100*f);
  document.getElementById('af-prot').value=Math.round(_bcNutr.prot100*f);
  document.getElementById('af-carbs').value=Math.round(_bcNutr.carbs100*f);
  document.getElementById('af-fat').value=Math.round(_bcNutr.fat100*f);
}
function _foodTotals(date){
  const t={kcal:0,prot:0,carbs:0,fat:0};
  (S.foodLog||[]).forEach(e=>{if(e.date===date){t.kcal+=e.kcal||0;t.prot+=e.prot||0;t.carbs+=e.carbs||0;t.fat+=e.fat||0;}});
  return t;
}
function openAddFood(){
  const h=new Date().getHours();
  _afMeal = h<11?'petitdej' : h<15?'dejeuner' : h<18?'collation' : 'diner';
  ['af-desc','af-kcal','af-prot','af-carbs','af-fat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  _bcNutr=null;
  const bcRow=document.getElementById('af-bc-row');if(bcRow)bcRow.style.display='none';
  const hc=document.getElementById('af-health-card');if(hc)hc.innerHTML='';
  // Code-barres + score santé : GRATUIT pour tout le monde (client-side, 0 token).
  // Les fonctions IA (📸 étiquette, 🤖 estimation) restent freemium (25 essais puis Premium).
  const bb=document.getElementById('af-barcode-block');
  if(bb)bb.style.display='block';
  const mi=document.getElementById('af-bc-manual');if(mi)mi.value='';
  _renderAfMealChips();
  _renderAfAiNote();
  _renderFoodQuickList();
  document.getElementById('ov-add-food').classList.add('open');
}
function _renderAfAiNote(){
  const el=document.getElementById('af-ai-note');if(!el)return;
  if(S.premium){el.innerHTML='<span style="color:var(--gold);">⭐ Estimations IA illimitées</span>';return;}
  const left=_foodAiLeft();
  el.innerHTML=left>0
    ?`🆓 ${left} estimation${left>1?'s':''} IA restante${left>1?'s':''} · ou saisis à la main (gratuit, illimité)`
    :`Estimations IA gratuites épuisées · ⭐ Premium pour l'illimité · la saisie à la main reste gratuite`;
}
function closeAddFood(){document.getElementById('ov-add-food').classList.remove('open');}
// ─── Aliments récents / favoris — ré-ajout rapide sans re-scanner ────────────
let _afQuickItems=[];
function _buildFoodQuickItems(){
  const favs=(S.savedFoods||[]).map(f=>({name:f.name,kcal:f.kcal||0,prot:f.prot||0,carbs:f.carbs||0,fat:f.fat||0,fav:true}));
  const seen=new Set(favs.map(f=>(f.name||'').toLowerCase()));
  const hidden=new Set((S.hiddenFoods||[]).map(x=>(x||'').toLowerCase()));
  const recent=[];
  (S.foodLog||[]).slice().sort((a,b)=>b.ts-a.ts).forEach(e=>{
    const k=(e.name||'').toLowerCase(); if(!k||seen.has(k)||hidden.has(k))return; seen.add(k);
    recent.push({name:e.name,kcal:e.kcal||0,prot:e.prot||0,carbs:e.carbs||0,fat:e.fat||0,fav:false});
  });
  return favs.concat(recent).slice(0,12);
}
function _renderFoodQuickList(){
  const el=document.getElementById('af-quick-list'); if(!el)return;
  _afQuickItems=_buildFoodQuickItems();
  if(!_afQuickItems.length){el.innerHTML='';return;}
  el.innerHTML='<div style="font-size:12px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:8px;">Mes aliments (récents & favoris)</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">'
    +_afQuickItems.map((it,i)=>'<div style="background:var(--bg2);border-radius:12px;padding:9px 12px;display:flex;align-items:center;gap:8px;box-shadow:inset 0 0 0 1px var(--sep);">'
      +'<button onclick="toggleFavFood('+i+')" title="Favori" style="background:none;border:none;font-size:16px;cursor:pointer;flex-shrink:0;padding:0;line-height:1;color:'+(it.fav?'var(--gold)':'var(--t3)')+';">'+(it.fav?'★':'☆')+'</button>'
      +'<div onclick="quickFillFood('+i+')" style="flex:1;min-width:0;cursor:pointer;">'
        +'<div style="font-size:13px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+_escFood(it.name)+'</div>'
        +'<div style="font-size:11px;color:var(--t3);">'+(it.kcal||0)+' kcal · P '+(it.prot||0)+' · G '+(it.carbs||0)+' · L '+(it.fat||0)+'</div>'
      +'</div>'
      +'<button onclick="quickAddFood('+i+')" style="background:var(--bg3);border:none;border-radius:8px;color:var(--red);font-size:12px;font-weight:700;padding:7px 11px;cursor:pointer;flex-shrink:0;">+ Ajouter</button>'
      +'<button onclick="deleteQuickFood('+i+')" title="Supprimer" style="background:none;border:none;color:var(--t3);font-size:15px;cursor:pointer;flex-shrink:0;padding:2px 3px;line-height:1;">✕</button>'
    +'</div>').join('')
    +'</div>';
}
// Supprime un aliment de la liste (avec confirmation) : favori → retiré des favoris ; récent → masqué des suggestions
function deleteQuickFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  const nm=it.name||''; const key=nm.toLowerCase();
  const msg=it.fav?('« '+nm+' » sera retiré de tes favoris.'):('« '+nm+' » n\'apparaîtra plus dans tes aliments récents.');
  const doit=()=>{
    if(it.fav)S.savedFoods=(S.savedFoods||[]).filter(f=>(f.name||'').toLowerCase()!==key);
    if(!S.hiddenFoods)S.hiddenFoods=[];
    if(!S.hiddenFoods.includes(key))S.hiddenFoods.push(key); // masque aussi un ex-favori pour qu'il ne revienne pas en « récent »
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    _renderFoodQuickList(); toast('Supprimé de la liste','info');
  };
  if(typeof showConfirm==='function') showConfirm('Supprimer de la liste ?',msg,doit,'Supprimer');
  else doit();
}
function _unhideFood(nm){ const k=(nm||'').toLowerCase(); if(k&&S.hiddenFoods&&S.hiddenFoods.length)S.hiddenFoods=S.hiddenFoods.filter(x=>x!==k); }
function quickFillFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  set('af-desc',it.name); set('af-kcal',it.kcal||0); set('af-prot',it.prot||0); set('af-carbs',it.carbs||0); set('af-fat',it.fat||0);
  toast('Pré-rempli — choisis le repas puis « Ajouter au journal » ✅','info');
}
function quickAddFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  if(!S.foodLog)S.foodLog=[];
  S.foodLog.push({date:today(),meal:_afMeal,name:(it.name||'').slice(0,80),kcal:it.kcal||0,prot:it.prot||0,carbs:it.carbs||0,fat:it.fat||0,ts:Date.now()});
  _unhideFood(it.name);
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeAddFood(); renderFoodJournal();
  toast('Ajouté au journal 🍽️','success');
}
function toggleFavFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  if(!S.savedFoods)S.savedFoods=[];
  const key=(it.name||'').toLowerCase();
  const idx=S.savedFoods.findIndex(f=>(f.name||'').toLowerCase()===key);
  if(idx>=0){ S.savedFoods.splice(idx,1); toast('Retiré des favoris','info'); }
  else { S.savedFoods.push({name:it.name,kcal:it.kcal||0,prot:it.prot||0,carbs:it.carbs||0,fat:it.fat||0}); toast('Ajouté aux favoris ⭐','success'); }
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  _renderFoodQuickList();
}
function _renderAfMealChips(){
  const el=document.getElementById('af-meal-chips');if(!el)return;
  el.innerHTML=FOOD_MEALS.map(m=>{
    const sel=m.k===_afMeal;
    return`<button onclick="setFoodMeal('${m.k}')" style="flex:1;min-width:70px;padding:9px 6px;border-radius:12px;border:1px solid ${sel?'var(--red)':'var(--sep)'};background:${sel?'rgba(255,45,85,.12)':'var(--bg2)'};color:${sel?'var(--red)':'var(--t2)'};font-size:12px;font-weight:${sel?700:500};cursor:pointer;font-family:var(--font);touch-action:manipulation;">${m.ic}<br>${m.lbl}</button>`;
  }).join('');
}
function setFoodMeal(k){_afMeal=k;_renderAfMealChips();}
// ─── LECTURE ÉTIQUETTE NUTRITIONNELLE PAR PHOTO (IA vision) ──────────────────
// Redimensionne un fichier image en base64 JPEG (sans le préfixe data:) — assez net pour lire les chiffres.
function _resizeToB64(file, maxPx, quality){
  return new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const scale=Math.min(1, (maxPx||1100)/Math.max(img.width,img.height));
          const c=document.createElement('canvas');
          c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          res(c.toDataURL('image/jpeg', quality||0.85).split(',')[1]);
        }catch(err){rej(err);}
      };
      img.onerror=rej; img.src=e.target.result;
    };
    reader.onerror=rej; reader.readAsDataURL(file);
  });
}
function readFoodLabel(){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const inp=document.getElementById('af-label-input'); if(inp){inp.value='';inp.click();}
}
async function onFoodLabelFile(input){
  const f=input.files&&input.files[0]; if(!f)return;
  if(!S.premium&&(S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  toast('Lecture de l\'étiquette…','info');
  try{
    const b64=await _resizeToB64(f, 1100, 0.85);
    const r=await fetch(_aiUrl('foodLabel'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'foodLabel',image:{data:b64,type:'image/jpeg'},email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'){toast('Étiquette illisible — rapproche-toi, éclaire, ou saisis à la main','error');return;}
    _bcNutr={
      name:(d.name||'Produit').slice(0,60),
      kcal100:Math.round(d.kcal100||0),
      prot100:Math.round((d.prot100||0)*10)/10,
      carbs100:Math.round((d.carbs100||0)*10)/10,
      fat100:Math.round((d.fat100||0)*10)/10
    };
    if(!_bcNutr.kcal100&&!_bcNutr.prot100&&!_bcNutr.carbs100&&!_bcNutr.fat100){toast('Valeurs non lues — réessaie ou saisis à la main','error');return;}
    const g=(parseFloat(d.serving)>0)?parseFloat(d.serving):100;
    const gramsEl=document.getElementById('af-bc-grams');if(gramsEl)gramsEl.value=g;
    const nameEl=document.getElementById('af-bc-name');if(nameEl)nameEl.textContent=_bcNutr.name+' · '+_bcNutr.kcal100+' kcal/100g (lu sur l\'étiquette)';
    const row=document.getElementById('af-bc-row');if(row)row.style.display='block';
    document.getElementById('af-desc').value=_bcNutr.name;
    _bcApplyGrams();
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();if(typeof _renderAfAiNote==='function')_renderAfAiNote();}
    toast('Étiquette lue ✅ — ajuste la quantité','success');
  }catch(e){toast('Erreur : '+(e.message||e),'error');}
}
// ─── Photo du code-barres → l'IA lit les CHIFFRES → recherche produit (gratuite) ───
// Même logique que la lecture d'étiquette : 1 essai IA pour lire le numéro,
// puis la recherche produit + score santé sont gratuites (Open Food Facts).
function scanBarcodeIA(){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const inp=document.getElementById('af-bc-photo-input'); if(inp){inp.value='';inp.click();}
}
async function onBarcodePhotoIA(input){
  const f=input.files&&input.files[0]; if(!f)return;
  if(!S.premium&&(S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  toast('Lecture du code-barres…','info');
  try{
    const b64=await _resizeToB64(f, 1100, 0.85);
    const r=await fetch(_aiUrl('readBarcode'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'readBarcode',image:{data:b64,type:'image/jpeg'},email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'||!d.barcode){toast('Code-barres illisible — rapproche-toi, éclaire bien, ou tape les chiffres','error');return;}
    // L'IA a lu le numéro → décompte 1 essai (comme l'étiquette), la recherche produit reste gratuite
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();if(typeof _renderAfAiNote==='function')_renderAfAiNote();}
    const mi=document.getElementById('af-bc-manual');if(mi)mi.value=d.barcode;
    await _lookupBarcode(d.barcode);
  }catch(e){toast('Erreur : '+(e.message||e),'error');}
}
async function estimateFoodAI(){
  const desc=(document.getElementById('af-desc').value||'').trim();
  if(!desc){toast('Décris d\'abord ce que tu as mangé','error');return;}
  if(!S.url){toast('Connexion requise','error');return;}
  // Limite gratuit : ~1 semaine de notes IA. La saisie manuelle reste illimitée.
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const btn=document.getElementById('af-ai-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Estimation…';}
  try{
    const r=await fetch(_aiUrl('estimateFood'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'estimateFood',description:desc,email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'){toast('Erreur IA : '+(d&&d.error||d&&d.message||'réessaie'),'error');return;}
    document.getElementById('af-kcal').value=d.kcal||0;
    document.getElementById('af-prot').value=d.prot||0;
    document.getElementById('af-carbs').value=d.carbs||0;
    document.getElementById('af-fat').value=d.fat||0;
    if(d.name)document.getElementById('af-desc').value=d.name;
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();}
    _renderAfAiNote();
    toast('Estimé ✅ — ajuste si besoin','success');
  }catch(e){toast('Erreur réseau : '+e.message,'error');}
  finally{if(btn){btn.disabled=false;btn.textContent='🤖 Estimer les calories avec l\'IA';}}
}
function addFoodEntry(){
  const name=(document.getElementById('af-desc').value||'').trim();
  const kcal=parseInt(document.getElementById('af-kcal').value)||0;
  const prot=parseInt(document.getElementById('af-prot').value)||0;
  const carbs=parseInt(document.getElementById('af-carbs').value)||0;
  const fat=parseInt(document.getElementById('af-fat').value)||0;
  if(!name){toast('Donne un nom à l\'aliment','error');return;}
  if(!kcal&&!prot&&!carbs&&!fat){toast('Renseigne au moins les calories','error');return;}
  if(!S.foodLog)S.foodLog=[];
  S.foodLog.push({date:today(),meal:_afMeal,name:name.slice(0,80),kcal,prot,carbs,fat,ts:Date.now()});
  _unhideFood(name);
  persist();
  closeAddFood();
  renderFoodJournal();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  toast('Ajouté au journal 🍽️','success');
}
function removeFoodEntry(ts){
  if(!S.foodLog)return;
  S.foodLog=S.foodLog.filter(e=>e.ts!==ts);
  persist();
  renderFoodJournal();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
}
// Demande confirmation avant de retirer un aliment du journal
function confirmRemoveFood(ts){
  const e=(S.foodLog||[]).find(x=>x.ts===ts);
  const nm=e?e.name:'cet aliment';
  const doit=()=>{ const ov=document.getElementById('ov-edit-food'); if(ov)ov.classList.remove('open'); removeFoodEntry(ts); toast('Aliment supprimé','info'); };
  if(typeof showConfirm==='function') showConfirm('Supprimer l\'aliment ?','« '+nm+' » sera retiré de ton journal.',doit,'Supprimer');
  else doit();
}
// ─── MODIFIER une entrée du journal (repas + nom + valeurs) ──────────────────
let _editFoodTs=null, _editFoodMeal='dejeuner';
function openEditFood(ts){
  const e=(S.foodLog||[]).find(x=>x.ts===ts); if(!e)return;
  _editFoodTs=ts; _editFoodMeal=e.meal||'dejeuner';
  let ov=document.getElementById('ov-edit-food');
  if(!ov){ov=document.createElement('div');ov.id='ov-edit-food';ov.className='overlay';ov.style.zIndex='500';ov.onclick=ev=>{if(ev.target===ov)ov.classList.remove('open');};document.body.appendChild(ov);}
  const fld=(id,lbl,val)=>'<div><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">'+lbl+'</div><input id="'+id+'" type="number" inputmode="numeric" value="'+(val||0)+'" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);"></div>';
  ov.innerHTML='<div class="modal" style="max-width:94vw;width:400px;padding:16px;">'
    +'<div style="font-weight:800;font-size:16px;color:var(--t1);margin-bottom:12px;">Modifier l\'aliment</div>'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Nom</div>'
    +'<input id="ef-name" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);margin-bottom:12px;">'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:6px;">Repas</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'+FOOD_MEALS.map(m=>'<button id="ef-meal-'+m.k+'" onclick="_setEditFoodMeal(\''+m.k+'\')" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;background:var(--bg3);color:var(--t2);">'+m.ic+'<br>'+m.lbl+'</button>').join('')+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">'+fld('ef-kcal','Calories (kcal)',e.kcal)+fld('ef-prot','Protéines (g)',e.prot)+fld('ef-carbs','Glucides (g)',e.carbs)+fld('ef-fat','Lipides (g)',e.fat)+'</div>'
    +'<button class="btn btn-red" onclick="saveEditFood()" style="width:100%;padding:13px;font-size:15px;">✅ Enregistrer</button>'
    +'<button class="btn btn-bg2" onclick="confirmRemoveFood('+ts+')" style="width:100%;margin-top:8px;color:var(--red);">🗑 Supprimer</button>'
    +'<button class="btn btn-bg2" onclick="document.getElementById(\'ov-edit-food\').classList.remove(\'open\')" style="width:100%;margin-top:8px;">Annuler</button>'
    +'</div>';
  document.getElementById('ef-name').value=e.name||''; // évite tout souci d'échappement dans l'attribut
  _renderEditFoodMeals();
  ov.classList.add('open');
}
function _setEditFoodMeal(k){_editFoodMeal=k;_renderEditFoodMeals();}
function _renderEditFoodMeals(){FOOD_MEALS.forEach(m=>{const b=document.getElementById('ef-meal-'+m.k);if(!b)return;const sel=m.k===_editFoodMeal;b.style.background=sel?'var(--red)':'var(--bg3)';b.style.color=sel?'#fff':'var(--t2)';});}
function saveEditFood(){
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e){toast('Entrée introuvable','error');return;}
  const name=(document.getElementById('ef-name').value||'').trim();
  e.name=(name||e.name).slice(0,80);
  e.meal=_editFoodMeal;
  e.kcal=parseInt(document.getElementById('ef-kcal').value)||0;
  e.prot=parseInt(document.getElementById('ef-prot').value)||0;
  e.carbs=parseInt(document.getElementById('ef-carbs').value)||0;
  e.fat=parseInt(document.getElementById('ef-fat').value)||0;
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  const ov=document.getElementById('ov-edit-food'); if(ov)ov.classList.remove('open');
  renderFoodJournal();
  toast('Modifié ✅','success');
}

function renderSupplements() {
  renderCreatine(); renderWhey(); updateProteinBar(); renderSupplCombos();
}

function renderSupplCombos() {
  const el = document.getElementById('suppl-combos');
  if (!el) return;

  const sectionTitle = '<div class="sec" style="margin-top:6px;">Combinaisons Premium</div>';

  if (!S.premium) {
    el.innerHTML = sectionTitle + `
    <div class="combo-gate">
      <div class="combo-gate-blur">
        <div style="display:flex;flex-direction:column;gap:8px;pointer-events:none;">
          <div class="combo-card" style="opacity:.7;"><div class="combo-card-hdr"><span class="combo-card-icon">💪</span><span class="combo-card-title">Prise de muscle</span></div></div>
          <div class="combo-card" style="opacity:.5;"><div class="combo-card-hdr"><span class="combo-card-icon">🏋️</span><span class="combo-card-title">Force maximale</span></div></div>
          <div class="combo-card" style="opacity:.3;"><div class="combo-card-hdr"><span class="combo-card-icon">🏃</span><span class="combo-card-title">Cardio / Endurance</span></div></div>
        </div>
      </div>
      <div style="font-size:28px;margin-bottom:2px;">🔒</div>
      <div style="font-family:var(--font-cond);font-size:18px;font-weight:900;color:var(--t1);">Combinaisons réservées aux membres Premium</div>
      <div style="font-size:13px;color:var(--t2);line-height:1.5;max-width:280px;">Stacks sur-mesure par objectif : dosages précis, timing optimal, synergies et contre-indications.</div>
      <button class="btn" style="background:linear-gradient(135deg,#FFB800,#FF6D00);color:#fff;font-weight:800;font-size:15px;padding:13px 26px;border-radius:14px;margin-top:4px;box-shadow:0 8px 22px -8px rgba(255,109,0,.5);" onclick="showPremiumWall()">⭐ Débloquer Premium — 4,99€ / 2 mois</button>
    </div>`;
    return;
  }

  const COMBOS = [
    {
      id:'muscle', icon:'💪', title:'Prise de muscle',
      items:[
        {name:'Créatine Monohydrate', dose:'3–5 g / jour', info:'Post-workout avec des glucides. Augmente la force de 5–15 % et le volume musculaire sur la durée. Incontournable.'},
        {name:'Whey Protéine', dose:'25–40 g post-workout', info:'Dans les 60 min après la séance. Comble les besoins protéiques si l\'alimentation est insuffisante. Vise 1,6–2 g de protéines/kg/jour au total.'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'30–45 min avant la séance. Améliore la force, la puissance et la concentration. Effet ergogène prouvé.'},
        {name:'BCAA (ratio 2:1:1)', dose:'5–10 g inter-séance', info:'Utile si séance > 90 min à jeun. Limite le catabolisme musculaire. Superflu si apport protéique total suffisant.'},
        {name:'Magnésium glycinate', dose:'300–400 mg le soir', info:'Favorise la récupération musculaire, réduit les crampes et améliore la qualité du sommeil. Forme glycinate = meilleure absorption.'},
      ],
      warn:'⚠️ Évite de prendre créatine et caféine en même temps : la caféine peut réduire l\'absorption de la créatine. Espace-les de 2h minimum.'
    },
    {
      id:'force', icon:'🏋️', title:'Force maximale',
      items:[
        {name:'Créatine Monohydrate', dose:'5 g / jour', info:'Phase maintenance quotidienne. Principal complément validé scientifiquement pour augmenter la force maximale sur les lifts lourds.'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'30–45 min avant. Améliore la force maximale de 5–8 % et le seuil de douleur. Particulièrement efficace pour les efforts courts et intenses.'},
        {name:'Bêta-Alanine', dose:'3,2–6,4 g / jour', info:'Fractionné en 4 prises pour limiter les fourmillements (paresthésie). Augmente les niveaux de carnosine musculaire, retarde la fatigue sur les séries longues.'},
        {name:'ZMA (Zinc + Magnésium + Vit B6)', dose:'1 dose le soir à jeun', info:'Alternative au magnésium seul. Soutient la production hormonale, la récupération nerveuse et la qualité du sommeil. Essentiel si déficit alimentaire en zinc.'},
        {name:'Vitamine D3 + K2', dose:'2 000–5 000 UI D3 + 100 µg K2', info:'Soutient la santé osseuse et tendineuse — critique sous charge lourde. Souvent carencé en Europe. La K2 oriente le calcium vers les os, pas les artères.'},
      ],
      warn:'⚠️ La caféine prise après 14h peut perturber ton sommeil et nuire à la récupération. Adapte l\'heure selon ta sensibilité.'
    },
    {
      id:'cardio', icon:'🏃', title:'Cardio / Endurance',
      items:[
        {name:'Caféine', dose:'200–300 mg pré-effort', info:'30–45 min avant. Améliore l\'endurance de 10–15 %, diminue la perception de l\'effort. Particulièrement efficace pour les efforts > 30 min.'},
        {name:'Bêta-Alanine', dose:'3,2 g / jour', info:'Retarde l\'acidose musculaire lors des efforts intenses de durée moyenne (1–4 min). Utile pour le HIIT, le trail et les courses à allure soutenue.'},
        {name:'BCAA', dose:'5–10 g pendant l\'effort', info:'Pour les efforts > 90 min. Préserve la masse musculaire et fournit un carburant d\'appoint en endurance prolongée. Mélange à ta boisson isotonique.'},
        {name:'Électrolytes', dose:'Sodium + Potassium + Magnésium', info:'Indispensable si sueur abondante ou effort > 60 min. Prévient les crampes et maintient la performance. Pertes estimées : 800–1 500 mg sodium/heure.'},
        {name:'Créatine', dose:'3–5 g / jour', info:'Moins efficace pour l\'endurance pure mais très utile si entraînement intermittent (HIIT, trail, natation). Améliore la récupération entre les sprints.'},
      ],
      warn:'⚠️ Ne teste jamais un nouveau complément le jour d\'une compétition ou d\'un test de performance. Introduis chaque nouveau produit séparément pour identifier d\'éventuelles intolérances.'
    },
    {
      id:'poids', icon:'🔥', title:'Perte de poids',
      items:[
        {name:'Whey Protéine', dose:'25–40 g post-workout', info:'Priorité absolue en déficit calorique. Préserve la masse musculaire et augmente la satiété. Un gramme de protéine = 4 kcal, fort effet thermique (25–30 %).'},
        {name:'Créatine', dose:'3–5 g / jour', info:'Maintient la force et la masse musculaire pendant la restriction calorique. Contre l\'effet catabolique du déficit. Peut causer une légère rétention d\'eau initiale (1–2 kg).'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'Thermogenèse légère (+3–5 % métabolisme), lipolyse accrue et coupe-faim modéré. Améliore aussi les performances à l\'entraînement sous déficit.'},
        {name:'L-Carnitine', dose:'1–2 g avant cardio', info:'Facilite le transport des acides gras vers les mitochondries pour la production d\'énergie. Effet modeste mais synergique avec le cardio modéré. À jeun = meilleure efficacité.'},
        {name:'Oméga-3 (EPA + DHA)', dose:'2–3 g / jour', info:'Réduit l\'inflammation, améliore la sensibilité à l\'insuline et soutient la lipolyse. Anti-catabolique. 3 g d\'EPA+DHA minimum pour un effet métabolique significatif.'},
      ],
      warn:'⚠️ Aucun complément ne remplace un déficit calorique bien géré. L\'alimentation représente 90 % du résultat en perte de poids. Les compléments sont des alliés, pas des raccourcis.'
    }
  ];

  const cardsHtml = COMBOS.map(c => `
    <div class="combo-card" id="combo-${c.id}">
      <div class="combo-card-hdr" onclick="toggleComboCard('${c.id}')">
        <span class="combo-card-icon">${c.icon}</span>
        <span class="combo-card-title">${c.title}</span>
        <span class="combo-card-chev" id="combo-chev-${c.id}">▾</span>
      </div>
      <div class="combo-card-body" id="combo-body-${c.id}">
        ${c.items.map(it => `<div class="combo-item">
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
            <span class="combo-item-name">${it.name}</span>
            <span class="combo-item-dose">${it.dose}</span>
          </div>
          <div class="combo-item-info">${it.info}</div>
        </div>`).join('')}
        <div class="combo-warn">${c.warn}</div>
      </div>
    </div>`).join('');

  el.innerHTML = sectionTitle + `<div style="display:flex;flex-direction:column;gap:8px;">${cardsHtml}</div>`;
}

function toggleComboCard(id) {
  const body = document.getElementById('combo-body-' + id);
  const chev = document.getElementById('combo-chev-' + id);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.classList.toggle('open', !isOpen);
}

function renderCreatine() {
  const el = document.getElementById('creat-content');
  if (!el) return;
  const bw = S.bw || 80;
  if (creatPhase === 'charge') {
    el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--blue);">20g / jour</span></div><div class="dose-row"><span class="dose-label">Prises</span><span class="dose-val">4 × 5g</span></div><div class="dose-row"><span class="dose-label">Durée</span><span class="dose-val">5 à 7 jours</span></div><div class="tip-box">💡 Prends <strong>5g</strong> avec chaque repas principal. Après 5-7j passe en maintenance.</div>';
  } else {
    const dose = Math.min(5, Math.max(3, Math.round(bw * 0.05)));
    el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--green);">'+dose+'g / jour</span></div><div class="dose-row"><span class="dose-label">Moment idéal</span><span class="dose-val">Post-workout</span></div><div class="tip-box">✅ Prends <strong>'+dose+'g</strong> chaque jour même sans entraînement. Constance = résultats.</div>';
  }
}

function renderWhey() {
  const el = document.getElementById('whey-content');
  if (!el) return;
  const dose = Math.round((S.bw || 80) * 0.4);
  const daily = calcMacros ? (calcMacros(S.nutritionPhase || 'charge').prot_g || 0) : 0;
  el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose post-workout</span><span class="dose-val" style="color:var(--orange);">'+dose+'g</span></div><div class="dose-row"><span class="dose-label">Fenêtre</span><span class="dose-val">0-60 min</span></div><div class="tip-box">🥤 <strong>'+dose+'g de whey</strong> dans 300ml eau ou lait, 0-60 min après ta séance.</div>';
}

function setCreatPhase(phase, btn) {
  creatPhase = phase;
  document.querySelectorAll('.phase-toggle-small .ptbtn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCreatine();
}

function updateProteinBar() {
  const macros = calcMacros ? calcMacros(S.nutritionPhase || 'charge') : {prot_g: 0};
  const target = macros.prot_g || 0;
  const eaten = parseFloat(document.getElementById('prot-eaten')?.value) || 0;
  const pct = target > 0 ? Math.min(100, Math.round(eaten / target * 100)) : 0;
  const remaining = Math.max(0, target - eaten);
  const bar = document.getElementById('prot-bar');
  const pctEl = document.getElementById('prot-pct-disp');
  const remEl = document.getElementById('prot-remaining');
  const targEl = document.getElementById('prot-target-disp');
  if (bar) { bar.style.width = pct + '%'; bar.style.background = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)'; }
  if (pctEl) { pctEl.textContent = pct + '%'; pctEl.style.color = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)'; }
  if (remEl) remEl.textContent = remaining + 'g';
  if (targEl) targEl.textContent = target + 'g';
}

// ─── ONBOARDING ──────────────────────────────────────────────
let _obStep=1,_obGender='H',_obGoal='muscle',_obLevel='',_obDataRestored=false;
const _OB_GOALS={muscle:'ob-gm',perte:'ob-gp',recomp:'ob-gr',force:'ob-gf',equilibre:'ob-ge',endurance:'ob-gen'};
const _OB_LEVELS={debutant:'ob-lv-d',intermediaire:'ob-lv-i',confirme:'ob-lv-c'};

function _initOb0(){
  if(_isStandalone())return;
  if(_isIOSInApp())return; // navigateur in-app → géré par le banner
  if(_isFirefoxAndroid())return; // pas de prompt disponible
  const isIOS=_isIOS;
  const ios=document.getElementById('ob0-ios');
  const android=document.getElementById('ob0-android');
  if(ios)ios.style.display=isIOS?'flex':'none';
  if(android)android.style.display=isIOS?'none':'flex';
  const ob1=document.getElementById('ob-1');
  if(ob1)ob1.classList.remove('ob-active');
  const ob0=document.getElementById('ob-0');
  if(ob0)ob0.classList.add('ob-active');
  _obStep=0;
  for(let i=1;i<=5;i++){const d=document.getElementById('od-'+i);if(d)d.classList.remove('ob-active');}
}

function ob0Install(){
  if(window._deferredInstall){
    window._deferredInstall.prompt();
    window._deferredInstall.userChoice.then(r=>{
      window._deferredInstall=null;
      if(r&&r.outcome==='accepted')obGoTo(1);
    });
  } else {
    const fb=document.getElementById('ob0-android-fallback');
    if(fb)fb.style.display='block';
    const btn=document.getElementById('ob0-install-btn');
    if(btn){btn.textContent='Voir les instructions ↑';btn.disabled=true;btn.style.opacity='.5';}
  }
}

function initOnboarding(){
  if(document.documentElement.classList.contains('ob-done'))return;
  // Objectif « Perte de gras + muscle » (recomposition) réservé aux testeurs pour l'instant
  const _obgr=document.getElementById('ob-gr');
  if(_obgr)_obgr.style.display=((typeof _isNutriBeta==='function')&&_isNutriBeta())?'':'none';
  const emailInp=document.getElementById('ob-email');
  if(emailInp){emailInp.setAttribute('enterkeyhint','done');emailInp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();obDoRestore();}});}
  // step 3 : prénom → age → taille → poids → naissance → poids visé en chaîne
  const ob3=[['ob-name','ob-age'],['ob-age','ob-ht'],['ob-ht','ob-bw'],['ob-bw','ob-bday'],['ob-bday','ob-target'],['ob-target',null]];
  // Naissance : insertion auto du "/" après le jour (JJ → JJ/)
  const obBd=document.getElementById('ob-bday');
  if(obBd)obBd.addEventListener('input',e=>{
    let v=e.target.value.replace(/[^\d/]/g,'');
    if(v.length===2&&e.target.value.length>obBd._prevLen)v=v+'/';
    obBd._prevLen=v.length;e.target.value=v.slice(0,5);
  });
  ob3.forEach(([id,nextId])=>{
    const inp=document.getElementById(id);
    if(!inp)return;
    inp.setAttribute('enterkeyhint',nextId?'next':'done');
    inp.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      e.preventDefault();
      if(nextId){const n=document.getElementById(nextId);if(n){n.focus();n.select&&n.select();}}
      else obNext(2);
    });
  });
  const emailFinal=document.getElementById('ob-email-final');
  if(emailFinal){emailFinal.setAttribute('enterkeyhint','done');emailFinal.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();obCheckEmailAndFinish();}});}
  _initOb0();
}

function obGoTo(step){
  const prev=document.getElementById('ob-'+_obStep);
  if(prev){prev.classList.remove('ob-active');prev.classList.add('ob-prev');}
  setTimeout(()=>{if(prev)prev.classList.remove('ob-prev');},400);
  const next=document.getElementById('ob-'+step);
  if(next){next.classList.add('ob-active');}
  if(step===5){const ef=document.getElementById('ob-email-final');if(ef&&S.email)ef.value=S.email;}
  _obStep=step;
  // ordre d'affichage : ob-1 (compte) → ob-3 (profil) → ob-2 (niveau) → ob-4 (objectif) → ob-5 (email)
  const dotMap={1:1,3:2,2:3,4:4,5:5};
  const dotNum=dotMap[step]||0;
  for(let i=1;i<=5;i++){const d=document.getElementById('od-'+i);if(d)d.classList.toggle('ob-active',dotNum>0&&i===dotNum);}
}

function obNext(step){
  if(_obStep===3){
    const name=(document.getElementById('ob-name').value||'').trim();
    if(name){
      S.name=name;
      const cta=document.getElementById('ob-cta-title');
      if(cta)cta.textContent='C\'est parti, '+name+' !';
    }
    const age=parseInt(document.getElementById('ob-age').value)||0;
    const ht=parseFloat(document.getElementById('ob-ht').value)||0;
    const bw=parseFloat(document.getElementById('ob-bw').value)||0;
    S.gender=_obGender;
    if(age>=14&&age<=80)S.age=age;
    if(ht>=100&&ht<=250)S.height=ht;
    if(bw>=20&&bw<=300){S.bw=bw;}
    // Nouveaux champs (onboarding enrichi) — tous optionnels
    const tw=parseFloat((document.getElementById('ob-target')||{}).value)||0;
    if(tw>=20&&tw<=300)S.targetWeight=tw;
    const bd=((document.getElementById('ob-bday')||{}).value||'').trim();
    if(/^\d{1,2}\/\d{1,2}$/.test(bd))S.bday=bd;
  }else if(_obStep===2){
    // étape Niveau (son propre écran) — le niveau est déjà posé par obSetLevel
    if(_obLevel)S.level=_obLevel;
  }else if(_obStep===4){
    S.goal=_obGoal;
  }
  if(step===5){
    const emailSec=document.getElementById('ob-email-section');
    if(emailSec)emailSec.style.display='';
  }
  obGoTo(step);
}

function obSetGender(g){
  _obGender=g;
  document.getElementById('ob-gt-h').classList.toggle('ob-sel',g==='H');
  document.getElementById('ob-gt-f').classList.toggle('ob-sel',g==='F');
}

function obSetGoal(g){
  _obGoal=g;
  Object.values(_OB_GOALS).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('ob-sel');});
  const el=document.getElementById(_OB_GOALS[g]);if(el)el.classList.add('ob-sel');
}

function obSetLevel(l){
  _obLevel=l;
  Object.values(_OB_LEVELS).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('ob-sel');});
  const el=document.getElementById(_OB_LEVELS[l]);if(el)el.classList.add('ob-sel');
}

function obShowRestore(){
  document.getElementById('ob-1-choice').style.display='none';
  const r=document.getElementById('ob-1-restore');
  r.style.display='flex';
  setTimeout(()=>{const e=document.getElementById('ob-email');if(e)e.focus();},120);
}

function obHideRestore(){
  document.getElementById('ob-1-restore').style.display='none';
  document.getElementById('ob-1-choice').style.display='flex';
}

async function obDoRestore(){
  const email=(document.getElementById('ob-email').value||'').trim();
  if(!email){toast('Entre ton adresse email','error');return;}
  if(!S.url){toast('URL Google Sheets manquante','error');return;}
  S.email=email;persist();
  toast('Restauration en cours…','info');
  try{
    const data=await _fetchRestoreRaw(email);
    if(data&&data.error==='auth'){ const hadCode=!!_authCode(); if(hadCode)_setAuthCode(''); _obShowCodePrompt(hadCode); return; }
    if(!data||data.error||data.status==='not_found'){toast(data&&data.error?data.error:'Aucun profil trouvé pour cet email. Enregistre d\'abord ton profil depuis l\'appli.','error');return;}
    _obDataRestored=true;
    _applyRestoreData(data);
    const cta=document.getElementById('ob-cta-title');
    if(cta)cta.textContent=S.name?'Content de te revoir, '+S.name+' ! 💪':'Content de te revoir ! 💪';
    const emailSec=document.getElementById('ob-email-section');
    if(emailSec)emailSec.style.display='none';
    obGoTo(5);
    toast('Profil restauré ✅','success');
  }catch(e){toast(e.message,'error');}
}

// Onboarding : compte protégé → demander le code perso et réessayer
function _obShowCodePrompt(wrong){
  const host=document.getElementById('ob-1-restore');if(!host)return;
  let el=document.getElementById('ob-code-wrap');
  if(!el){el=document.createElement('div');el.id='ob-code-wrap';el.style.marginTop='10px';host.appendChild(el);}
  el.innerHTML='<div style="font-size:13px;color:var(--gold);font-weight:700;margin-bottom:6px;line-height:1.4;">'+(wrong?'❌ Code incorrect.':'🔒 Ce compte est protégé.')+' Entre ton code perso&nbsp;:</div>'
    +'<input class="ob-inp" id="ob-code-inp" type="password" inputmode="numeric" autocomplete="off" placeholder="Ton code" style="font-size:16px;">'
    +'<button class="btn btn-red" onclick="_obSubmitCode()" style="width:100%;margin-top:8px;padding:14px;font-size:16px;">Valider le code</button>';
  const c=document.getElementById('ob-code-inp');
  if(c){setTimeout(()=>c.focus(),120);c.addEventListener('keydown',e=>{if(e.key==='Enter')_obSubmitCode();});}
}
function _obSubmitCode(){
  const c=document.getElementById('ob-code-inp');const code=(c?c.value:'').trim();
  if(!code){toast('Entre ton code','error');return;}
  _setAuthCode(code);obDoRestore();
}
async function obCheckEmailAndFinish(){
  const emailFinal=(document.getElementById('ob-email-final')||{}).value.trim();
  if(!emailFinal){finishOnboarding();return;}
  const btn=document.getElementById('ob-start-btn');
  btn.disabled=true;btn.textContent='Vérification…';
  try{
    const data=await _fetchRestoreRaw(emailFinal);
    if(data&&data.status==='ok'){
      // Compte existant → restauration automatique + entrée directe
      S.email=emailFinal;persist();
      _obDataRestored=true;
      _applyRestoreData(data);
      toast('Profil restauré ✅','success');
      finishOnboarding();
    }else{
      finishOnboarding();
    }
  }catch(e){
    finishOnboarding();
  }
}

function finishOnboarding(){
  const btn=document.getElementById('ob-start-btn');
  if(btn){btn.style.display='';btn.disabled=false;btn.textContent='⚡ COMMENCER';}
  if(!_obDataRestored){S.goal=_obGoal;S.gender=_obGender;}
  const emailFinal=(document.getElementById('ob-email-final')||{}).value||'';
  if(emailFinal&&!S.email){S.email=emailFinal.trim();}
  else if(emailFinal){S.email=emailFinal.trim();}
  persist();
  if(S.email&&S.url&&!_obDataRestored){
    // Nouveau profil uniquement — si restauration depuis cloud, on ne réécrit JAMAIS le Sheet
    const p={action:'saveProfile',email:S.email,name:S.name,bw:S.bw,age:S.age,height:S.height,gender:S.gender,goal:S.goal,level:S.level||'',targetWeight:S.targetWeight||0,bday:S.bday||'',activityLevel:S.activityLevel,workType:S.workType,smoker:S.smoker,neck:S.neck,waist:S.waist,hip:S.hip,nutritionPhase:S.nutritionPhase,barW:S.barW,defRest:S.defRest,mensCycleStart:S.mensCycleStart,mensCycleDur:S.mensCycleDur,contraception:S.contraception||'',customExercises:S.customExercises,authCode:_authCode(),welcome:true};
    fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).catch(()=>{});
    // Confirmation d'email (soft) : on envoie un code en fond — l'inscription n'est JAMAIS bloquée
    if(!S.emailVerified){ try{ _sendEmailConfirm(true); }catch(e){} }
  }
  localStorage.setItem('ft4_ob2','1');
  try{localStorage.setItem('ft4_whatsnew_v2','1');localStorage.setItem('ft4_wn_seen',String(typeof WHATS_NEW_MAX==='number'?WHATS_NEW_MAX:0));}catch(e){} // nouvel inscrit : pas de « Quoi de neuf » (il a le guide-film)
  document.documentElement.classList.add('ob-done');
  const ob=document.getElementById('onboarding');
  if(ob){ob.style.transition='opacity .4s';ob.style.opacity='0';setTimeout(()=>{ob.style.display='none';ob.style.opacity='';ob.style.transition='';},400);}
  renderHome();renderNutrition();renderSetup();
  // Nouvel inscrit → guide-film de l'application automatiquement (une seule fois),
  // puis on enchaîne le prompt d'installation à la fermeture du guide.
  // (Pas pour une restauration de compte existant : _obDataRestored.)
  if(!_obDataRestored && !localStorage.getItem('ft4_guide_shown') && typeof openAppGuide==='function'){
    try{localStorage.setItem('ft4_guide_shown','1');}catch(e){}
    window._afterAppGuide=function(){setTimeout(showInstallPrompt,800);};
    setTimeout(function(){try{openAppGuide();}catch(e){setTimeout(showInstallPrompt,1400);}},700);
  }else{
    setTimeout(showInstallPrompt,1400);
  }
}

// ── Confirmation d'email (soft) — bonus sécurité, ne bloque JAMAIS l'app ──
function _sendEmailConfirm(silent){
  if(!S.email||!S.url)return;
  fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'sendConfirmCode',email:S.email})})
    .then(r=>r.json()).then(d=>{
      if(silent)return;
      if(d&&d.status==='ok')toast('📧 Code envoyé — regarde ta boîte mail','success');
      else toast('Envoi impossible pour l\'instant, réessaie plus tard','error');
    }).catch(()=>{ if(!silent)toast('Réseau indisponible','error'); });
}
function openEmailConfirm(){
  if(S.emailVerified){ if(typeof toast==='function')toast('Ton email est déjà confirmé ✅','info'); return; }
  if(!S.email){ if(typeof toast==='function')toast('Ajoute d\'abord ton email dans le profil','info'); return; }
  const em=document.getElementById('ec-email'); if(em)em.textContent=S.email;
  const inp=document.getElementById('ec-code'); if(inp)inp.value='';
  const ov=document.getElementById('ov-email-confirm'); if(ov)ov.classList.add('open');
  _sendEmailConfirm(true); // (re)envoie un code à l'ouverture (respecte le cooldown serveur)
}
function closeEmailConfirm(){ const ov=document.getElementById('ov-email-confirm'); if(ov)ov.classList.remove('open'); }
function resendEmailConfirm(){ _sendEmailConfirm(false); }
function verifyEmailCode(){
  const inp=document.getElementById('ec-code'); const code=(inp?inp.value:'').trim();
  if(!/^\d{6}$/.test(code)){ toast('Entre le code à 6 chiffres reçu par email','error'); return; }
  if(!S.url){ toast('Hors ligne — réessaie connecté','error'); return; }
  const btn=document.getElementById('ec-verify-btn'); if(btn){btn.disabled=true;btn.textContent='Vérification…';}
  fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'verifyConfirmCode',email:S.email,code:code})})
    .then(r=>r.json()).then(d=>{
      if(btn){btn.disabled=false;btn.textContent='Vérifier';}
      if(d&&d.status==='ok'){ S.emailVerified=true; persist(); closeEmailConfirm(); _renderEmailVerifyCard(); toast('✅ Email confirmé, merci !','success'); }
      else if(d&&d.status==='expired'){ toast('Code expiré — renvoie-en un nouveau','error'); }
      else if(d&&d.status==='toomany'){ toast('Trop d\'essais — renvoie un nouveau code','error'); }
      else if(d&&d.status==='nocode'){ toast('Aucun code en attente — clique « Renvoyer »','error'); }
      else { toast('Code incorrect, réessaie','error'); }
    }).catch(()=>{ if(btn){btn.disabled=false;btn.textContent='Vérifier';} toast('Réseau indisponible','error'); });
}
function _renderEmailVerifyCard(){
  const el=document.getElementById('email-verify-card'); if(!el)return;
  if(!S.email){ el.innerHTML=''; return; }
  // Compte protégé (code perso) = email déjà vérifié → pas de prompt redondant.
  if(_authCode()){ el.innerHTML=''; return; }
  if(S.emailVerified){
    el.innerHTML='<div style="display:flex;align-items:center;gap:7px;justify-content:center;font-size:13px;color:var(--green);font-weight:700;padding:8px;">✅ Email confirmé</div>';
    return;
  }
  el.innerHTML='<button class="btn" onclick="openEmailConfirm()" style="width:100%;background:rgba(234,179,8,.10);border:1.5px solid rgba(234,179,8,.4);color:var(--gold);font-size:13.5px;font-weight:700;padding:13px;border-radius:14px;touch-action:manipulation;">📧 Confirme ton email — sécurise ta sauvegarde</button>';
}

// ─── PROTÉGER MON COMPTE (code perso) ────────────────────────
let _protectStatus=null;
function _protectPost(payload){
  return fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(r=>r.json());
}
function _protectErr(d){
  const m={nocode:'Demande d\'abord un code par email',expired:'Code expiré — redemande-en un',toomany:'Trop d\'essais — redemande un code',invalid:'Code email incorrect',court:'Ton code perso : au moins 4 chiffres',params:'Champs manquants'};
  return (d&&m[d.error])||'Une erreur est survenue';
}
function openProtect(){
  if(!S.email){toast('Ajoute d\'abord ton email dans le Profil','info');return;}
  const ov=document.getElementById('ov-protect');if(!ov)return;
  ov.classList.add('open');
  const b=document.getElementById('protect-body');
  if(b)b.innerHTML='<div style="text-align:center;color:var(--t3);padding:24px 0;">Chargement…</div>';
  _protectPost({action:'authStatus',email:S.email})
    .then(d=>{_protectStatus=d&&d.status==='ok'?d:{hasCode:!!_authCode(),emailVerified:!!S.emailVerified};_renderProtect();})
    .catch(()=>{_protectStatus={hasCode:!!_authCode(),emailVerified:!!S.emailVerified};_renderProtect();});
}
function closeProtect(){const ov=document.getElementById('ov-protect');if(ov)ov.classList.remove('open');}
function _renderProtect(mode){
  const b=document.getElementById('protect-body');if(!b)return;
  const st=_protectStatus||{};
  const inpS='width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid var(--sep);border-radius:10px;background:var(--bg2);color:var(--t1);font-size:16px;margin-top:8px;';
  const btnR='width:100%;padding:13px;border:none;border-radius:11px;background:var(--red);color:#fff;font-weight:800;font-size:15px;cursor:pointer;margin-top:12px;touch-action:manipulation;';
  const btnG='width:100%;padding:12px;border:1.5px solid var(--sep);border-radius:11px;background:var(--bg3);color:var(--t2);font-weight:700;font-size:14px;cursor:pointer;margin-top:8px;touch-action:manipulation;';
  // Vue "déjà protégé"
  if(st.hasCode && mode!=='change' && mode!=='disable'){
    b.innerHTML='<div style="background:rgba(48,209,88,.08);border:1px solid rgba(48,209,88,.3);border-radius:12px;padding:14px;text-align:center;color:var(--green);font-weight:700;font-size:15px;">✅ Ton compte est protégé par un code perso.</div>'
      +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin-top:12px;">Sur un nouveau téléphone, on te demandera ce code pour récupérer tes données. Personne d\'autre ne peut y accéder.</div>'
      +'<button onclick="_renderProtect(\'change\')" style="'+btnG+'">🔑 Changer mon code</button>'
      +'<button onclick="_renderProtect(\'disable\')" style="'+btnG+'color:var(--red);border-color:rgba(255,45,85,.3);">🔓 Désactiver la protection</button>';
    return;
  }
  const isDisable=(mode==='disable');
  const isChange=(mode==='change');
  const title=isDisable?'Désactiver la protection':(isChange?'Changer ton code':'Activer la protection');
  const intro=isDisable
    ?'Pour désactiver, on vérifie que c\'est bien toi : reçois un code par email, puis confirme.'
    :'Pour '+(isChange?'changer ton code':'protéger ton compte')+', on vérifie d\'abord ton email (pour pouvoir te dépanner si tu oublies ton code un jour).';
  b.innerHTML='<div style="font-weight:800;font-size:15px;color:var(--t1);margin-bottom:6px;">'+title+'</div>'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;">'+intro+'</div>'
    +'<div style="font-size:12px;color:var(--t3);margin-top:10px;">📧 '+(_escNote(S.email||''))+'</div>'
    +'<button id="protect-send-btn" onclick="protectSendEmail()" style="'+btnG+'">📩 Recevoir le code par email</button>'
    +'<div style="font-size:11px;color:var(--t3);margin-top:6px;text-align:center;">Pas reçu ? Regarde tes <b>spams</b> et marque « non-spam ».</div>'
    +'<div style="font-weight:700;font-size:13px;color:var(--t1);margin-top:14px;">1️⃣ Le code reçu par email</div>'
    +'<div style="font-size:11.5px;color:var(--t3);margin-top:1px;">Les 6 chiffres du mail — temporaire, juste pour vérifier que c\'est toi.</div>'
    +'<input id="protect-emailcode" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="Ex : 483920" style="'+inpS+'">'
    +(isDisable?''
      :'<div style="font-weight:700;font-size:13px;color:var(--t1);margin-top:14px;">2️⃣ TON code perso</div>'
       +'<div style="font-size:11.5px;color:var(--t3);margin-top:1px;">Celui que tu inventes et que tu retiendras (min 4 chiffres).</div>'
       +'<input id="protect-newcode" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Choisis ton code" style="'+inpS+'">')
    +'<button id="protect-activate-btn" onclick="'+(isDisable?'protectDisable()':'protectActivate()')+'" style="'+btnR+(isDisable?'background:var(--red);':'')+'">'+(isDisable?'🔓 Désactiver':(isChange?'✅ Changer mon code':'✅ Activer la protection'))+'</button>'
    +(st.hasCode?'<button onclick="_renderProtect()" style="'+btnG+'">‹ Retour</button>':'');
}
function protectSendEmail(){
  const btn=document.getElementById('protect-send-btn');
  if(btn){btn.disabled=true;btn.textContent='Envoi…';}
  _protectPost({action:'sendConfirmCode',email:S.email})
    .then(d=>{
      if(d&&d.cooldown)toast('Patiente 1 min avant un nouvel envoi','info');
      else toast('Code envoyé 📩 (checke tes spams)','success');
      if(btn){btn.disabled=false;btn.textContent='📩 Renvoyer le code';}
    })
    .catch(()=>{toast('Envoi impossible, réessaie','error');if(btn){btn.disabled=false;btn.textContent='📩 1. Recevoir le code par email';}});
}
function protectActivate(){
  const ec=((document.getElementById('protect-emailcode')||{}).value||'').trim();
  const nc=((document.getElementById('protect-newcode')||{}).value||'').trim();
  if(!ec){toast('Entre le code reçu par email','error');return;}
  if(nc.length<4){toast('Ton code perso : au moins 4 chiffres','error');return;}
  const btn=document.getElementById('protect-activate-btn');
  if(btn){btn.disabled=true;btn.textContent='Activation…';}
  _protectPost({action:'setAccessCode',email:S.email,code:ec,newCode:nc})
    .then(d=>{
      if(d&&d.status==='ok'){
        _setAuthCode(nc);S.emailVerified=true;persist();
        try{_renderEmailVerifyCard();}catch(e){}
        _protectStatus={hasCode:true,emailVerified:true};_renderProtect();
        toast('Compte protégé ✅','success');
      }else{toast(_protectErr(d),'error');if(btn){btn.disabled=false;btn.textContent='✅ Activer la protection';}}
    })
    .catch(()=>{toast('Erreur réseau, réessaie','error');if(btn){btn.disabled=false;btn.textContent='✅ Activer la protection';}});
}
function protectDisable(){
  const ec=((document.getElementById('protect-emailcode')||{}).value||'').trim();
  if(!ec){toast('Entre le code reçu par email','error');return;}
  const btn=document.getElementById('protect-activate-btn');
  if(btn){btn.disabled=true;btn.textContent='Désactivation…';}
  _protectPost({action:'setAccessCode',email:S.email,code:ec,remove:true})
    .then(d=>{
      if(d&&d.status==='ok'){
        _setAuthCode('');
        _protectStatus={hasCode:false,emailVerified:true};_renderProtect();
        toast('Protection désactivée','info');
      }else{toast(_protectErr(d),'error');if(btn){btn.disabled=false;btn.textContent='🔓 Désactiver';}}
    })
    .catch(()=>{toast('Erreur réseau, réessaie','error');if(btn){btn.disabled=false;btn.textContent='🔓 Désactiver';}});
}

// ─── PWA INSTALL ─────────────────────────────────────────────
// _isIOS : const booléen déclaré dans log.js (top-level, partagé)
function _isStandalone(){return window.matchMedia('(display-mode:standalone)').matches||!!navigator.standalone;}
function _isIOSInApp(){
  if(!_isIOS) return false;
  const ua = navigator.userAgent;
  // Navigateurs in-app connus sur iOS
  if(/FBAN|FBAV|Instagram|Twitter|Snapchat|TikTok|Musical\.ly|Line\/|LinkedIn|Pinterest|Threads/.test(ua)) return true;
  // Chrome iOS, Firefox iOS, Edge iOS, Google App — ne supportent pas l'install PWA
  if(/CriOS|FxiOS|OPiOS|EdgiOS|GSA/.test(ua)) return true;
  // WebView générique iOS : pas de "Safari" dans le UA
  if(!/Safari/i.test(ua)) return true;
  return false;
}

function _isFirefoxAndroid(){
  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /Firefox/i.test(ua);
}

const APP_URL = 'https://michdu75-commits.github.io/forcetracker/';

function tryOpenSafari(){
  // La seule méthode fiable : Web Share API → feuille de partage iOS → "Ouvrir dans Safari"
  if(navigator.share){
    navigator.share({title:'Force Tracker',url:APP_URL}).catch(()=>{});
  } else {
    // Fallback : copier le lien + instruction
    copyAppLink('safari');
    toast('Lien copié — ouvre Safari et colle dans la barre d\'adresse','info');
  }
}

function tryOpenChrome(){
  if(navigator.share){
    navigator.share({title:'Force Tracker',url:APP_URL}).catch(()=>{});
  } else {
    copyAppLink('chrome');
    toast('Lien copié — ouvre Chrome et colle dans la barre d\'adresse','info');
  }
}

function copyAppLink(target){
  const msg = target==='safari' ? 'Lien copié — colle-le dans Safari' : target==='chrome' ? 'Lien copié — colle-le dans Chrome' : 'Lien copié !';
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(APP_URL).then(()=>toast(msg,'success'));
  } else {
    try{const t=document.createElement('textarea');t.value=APP_URL;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);toast(msg,'success');}catch(e){}
  }
}

function closeBanner(){
  const b=document.getElementById('install-banner');
  if(b)b.classList.add('hidden');
}

function openShareModal(){
  document.getElementById('mod-share').classList.add('open');
}
function closeShareModal(){
  document.getElementById('mod-share').classList.remove('open');
}
function shareAppNative(){
  if(navigator.share){
    navigator.share({title:'Force Tracker',text:'Suis ta progression en musculation 💪',url:APP_URL}).catch(()=>{});
  } else {
    copyAppLink('share');
  }
}

function _showInstallBanner(title, desc, openAction, copyTarget){
  const b=document.getElementById('install-banner');
  if(!b)return;
  document.getElementById('ib-title').textContent=title;
  document.getElementById('ib-desc').textContent=desc;
  document.getElementById('ib-btn-open').onclick=openAction;
  document.getElementById('ib-btn-copy').onclick=()=>copyAppLink(copyTarget);
  const qr=document.getElementById('ib-qr-img');
  if(qr&&!qr.src.includes('qrserver')){
    qr.src='https://api.qrserver.com/v1/create-qr-code/?size=60x60&data='+encodeURIComponent(APP_URL);
  }
  b.classList.remove('hidden');
}

// Alias maintenu pour compatibilité avec le code de détection précoce
function _showInAppOverlay(icon, title, desc, btnLabel, btnAction, copyTarget){
  const descPlain=desc.replace(/<[^>]+>/g,'');
  _showInstallBanner(title, descPlain, btnAction, copyTarget);
}

function showInstallPrompt(){
  if(_isStandalone())return;
  if(_isIOSInApp()){
    _showInstallBanner(
      'Installer sur iPhone',
      'Ouvre dans Safari → ⬆️ Partager → Sur l\'écran d\'accueil',
      tryOpenSafari, 'safari');
    return;
  }
  if(_isIOS){
    document.getElementById('install-popup').classList.remove('hidden');
    return;
  }
  if(_isFirefoxAndroid()){
    _showInstallBanner(
      'Installer sur Android',
      'Ouvre dans Chrome → ⋮ Menu → Ajouter à l\'écran d\'accueil',
      tryOpenChrome, 'chrome');
    return;
  }
  if(window._deferredInstall){
    window._deferredInstall.prompt();
    window._deferredInstall.userChoice.then(()=>{window._deferredInstall=null;});
  }
}

function closeInstall(){
  const el=document.getElementById('install-popup');
  if(el){el.style.transition='opacity .3s';el.style.opacity='0';setTimeout(()=>{el.classList.add('hidden');el.style.opacity='';el.style.transition='';},300);}
}

// ─── ADMIN MODE ──────────────────────────────────────────────
// _adminMode : initialisé sur window dans <head> de index.html (window._adminMode=false)
var _adminTaps=0,_adminTimer=null;
// L'appareil est-il autorisé à ouvrir l'admin ? (email admin OU déverrouillé une fois par code)
function _isAdminEmail(){
  const e=(S.email||'').trim().toLowerCase();
  return (typeof ADMIN_EMAILS!=='undefined'?ADMIN_EMAILS:['michdu75@gmail.com']).indexOf(e)>=0;
}
function _isAdminUnlocked(){
  try{ if(localStorage.getItem('ft4_admin_ok')==='1')return true; }catch(e){}
  return _isAdminEmail();
}
function onLogoTap(){
  _adminTaps++;
  clearTimeout(_adminTimer);
  if(_adminTaps>=5){
    _adminTaps=0;
    if(!_isAdminUnlocked()){ _promptAdminCode(); return; } // ni email admin ni code → demander le code
    _toggleAdminMode();
    return;
  }
  _adminTimer=setTimeout(()=>{_adminTaps=0;},1500);
}
function _toggleAdminMode(){
  window._adminMode=!window._adminMode;
  const bar=document.getElementById('setup-tabs-bar');
  if(bar)bar.style.display=window._adminMode?'flex':'none';
  if(window._adminMode){
    if(!S.email){S.email='michdu75@gmail.com';persist();}
    const eInp=document.getElementById('email-inp');
    if(eInp)eInp.value=S.email||'michdu75@gmail.com';
    goScreen('setup',document.getElementById('nb-setup'));
    switchSetupTab('connexion',document.getElementById('stab-connexion'));
  }else{
    switchSetupTab('profil',document.getElementById('stab-profil'));
  }
  toast(window._adminMode?'🔧 Mode admin activé':'Mode admin désactivé','info');
}

// ── MODE DÉMO (super admin) ──────────────────────────────────
// Montrer les fonctions à quelqu'un SANS toucher son compte : gèle toute sauvegarde
// (local + cloud). En quittant, on recharge les vraies données depuis localStorage.
function enterDemoMode(){
  if(!_isAdminUnlocked()){toast('Réservé à l\'admin','error');return;}
  if(window._demoMode)return;
  // S'assurer que le localStorage contient bien les vraies données à jour AVANT de geler
  try{persist();}catch(e){}
  window._demoMode=true;
  const rt=document.getElementById('root');if(rt)rt.classList.add('demo-on');
  toast('🎬 Mode démo activé — rien ne sera enregistré','info');
}
function exitDemoMode(){
  if(!window._demoMode)return;
  window._demoMode=false;
  // Recharge les vraies données depuis localStorage → annule tout ce qui a été fait en démo
  try{load();}catch(e){}
  const rt=document.getElementById('root');if(rt)rt.classList.remove('demo-on');
  try{renderHome();}catch(e){}
  try{renderNutrition();}catch(e){}
  try{renderSetup();}catch(e){}
  try{renderLog();}catch(e){}
  try{goScreen('home',document.getElementById('nb-home'));}catch(e){}
  toast('✅ Tes vraies données sont de retour','success');
}
// ── GUIDE DE L'APPLICATION (diaporama, Menu → Outils) ────────
// Guide-film : chaque slide = un vrai écran de l'app (guide/*.jpg) + un doigt animé (tap) + une phrase.
const APP_GUIDE_SLIDES=[
  {img:'guide/home.jpg',       tap:[.5,.945],  t:'Ton accueil',            cap:'Tes stats du mois et ta <b>récup du jour</b> d\'un coup d\'œil. Le gros <b>+</b> démarre une séance.'},
  {img:'guide/profil.jpg',     tap:[.5,.60],   t:'Remplis bien ton profil ⭐', cap:'<b>Le plus important !</b> Plus ton profil est complet, plus <b>Milo, ton coach IA</b>, est précis et personnalisé (récup et calories aussi). Un <b>% de remplissage</b> t\'aide à ne rien oublier.'},
  {img:'guide/seance.jpg',     tap:[.875,.305],t:'Ta séance',              cap:'Note tes séries — <b>poids × reps</b> — et coche. Tes <b>records</b> se calculent tout seuls.'},
  {img:'guide/programmes.jpg', tap:[.5,.42],   t:'Tes programmes',         cap:'Crée, <b>importe</b> (photo/Word/PDF) ou charge un programme en 1 tap. Débutant ? Un parcours guidé t\'attend.'},
  {img:'guide/progres.jpg',    tap:[.5,.32],   t:'Tes progrès',            cap:'Tes <b>records</b>, ton poids, ta masse grasse et tes badges — tout en graphiques clairs.'},
  {img:'guide/bilan.jpg',      tap:[.5,.72],   t:'Ton bilan corporel',     cap:'Balance pro (impédance) ? Enregistre tes chiffres — <b>📷 photo</b>, à la main ou code. Poids, graisse, muscle, métabolisme… Tu suis l\'<b>évolution</b> et <b>Milo s\'en sert</b>.'},
  {img:'guide/coach.jpg',      tap:[.5,.86],   t:'Milo, ton coach IA',     cap:'Une <b>question</b> ? Besoin d\'un <b>conseil</b> ou d\'un guide ? Milo répond à tout — il connaît ton profil.'},
  {secure:true, t:'Protège ton compte 🔒', cap:'Ajoute un <b>code perso</b> pour que <b>toi seul</b> accèdes à tes données — même depuis un autre téléphone. Va dans <b>Profil → 🔒 Protéger mon compte</b> : on vérifie ton email une fois (pense à tes spams), puis tu choisis ton code. Ça protège tes séances, ton poids et tes infos.'},
  {premium:true, t:'Passe au niveau supérieur ⭐', cap:'Avec <b>Premium</b> : Milo en <b>illimité</b> + les <b>analyses photo</b> (morphologie, étude du corps) pour un vrai coaching perso.'},
];
let _agIdx=0,_agSwipeInit=false;
function openAppGuide(){
  try{if(typeof closeMenuDrawer==='function')closeMenuDrawer();}catch(e){}
  try{if(typeof _markAnchorSeen==='function')_markAnchorSeen('menu-row-appguide');}catch(e){}
  _agIdx=0;_renderAppGuide();
  const ov=document.getElementById('ov-appguide');if(ov)ov.classList.add('open');
  if(!_agSwipeInit){
    const sl=document.getElementById('ag-slide');
    if(sl){
      let x0=null;
      sl.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
      sl.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>45)_agGo(dx<0?1:-1);},{passive:true});
    }
    _agSwipeInit=true;
  }
}
function closeAppGuide(){
  const ov=document.getElementById('ov-appguide');if(ov)ov.classList.remove('open');
  // Callback à la fermeture (ex. nouvel inscrit : enchaîner le prompt d'installation)
  if(window._afterAppGuide){const f=window._afterAppGuide;window._afterAppGuide=null;try{f();}catch(e){}}
}
function _agGo(d){
  const n=_agIdx+d;
  if(n<0)return;
  if(n>=APP_GUIDE_SLIDES.length){closeAppGuide();return;}
  _agIdx=n;_renderAppGuide();
}
function _renderAppGuide(){
  const s=APP_GUIDE_SLIDES[_agIdx];if(!s)return;
  const set=(id,html,prop)=>{const el=document.getElementById(id);if(el)el[prop||'textContent']=html;};
  const phone=document.getElementById('ag-phone'),prem=document.getElementById('ag-premium');
  const img=document.getElementById('ag-img'),tap=document.getElementById('ag-tap');
  if(s.premium||s.secure){
    if(phone)phone.style.display='none';
    if(prem){prem.style.display='flex';prem.textContent=s.secure?'🔒':'⭐';}
  } else {
    if(prem)prem.style.display='none';
    if(phone)phone.style.display='block';
    if(img&&s.img&&img.getAttribute('src')!==s.img){img.style.opacity='0';img.onload=function(){img.style.opacity='1';};img.src=s.img;}
    if(tap){
      // re-trigger l'animation du doigt à chaque slide
      if(s.tap){tap.style.display='block';tap.style.left=(s.tap[0]*100)+'%';tap.style.top=(s.tap[1]*100)+'%';tap.classList.remove('on');void tap.offsetWidth;tap.classList.add('on');}
      else tap.style.display='none';
    }
  }
  set('ag-title',s.t);set('ag-cap',s.cap,'innerHTML');
  set('ag-count',(_agIdx+1)+' / '+APP_GUIDE_SLIDES.length);
  const dots=document.getElementById('ag-dots');
  if(dots)dots.innerHTML=APP_GUIDE_SLIDES.map((_,i)=>'<span class="ag-dot'+(i===_agIdx?' on':'')+'"></span>').join('');
  const prev=document.getElementById('ag-prev');if(prev)prev.style.visibility=_agIdx===0?'hidden':'visible';
  const next=document.getElementById('ag-next');
  if(next){
    if(s.premium){next.textContent='⭐ Voir le Premium';next.onclick=_agPremiumCta;}
    else if(_agIdx===APP_GUIDE_SLIDES.length-1){next.textContent='Terminer ✓';next.onclick=function(){_agGo(1);};}
    else {next.textContent='Suivant →';next.onclick=function(){_agGo(1);};}
  }
}
// Fin du guide → emmène l'utilisateur vers Milo (Coach IA) où se trouve l'accès Premium.
function _agPremiumCta(){
  closeAppGuide();
  try{goScreen('coach',document.getElementById('nb-coach'));}catch(e){}
}

// ── OUTILS CLONE DE TEST (visibles uniquement dans /clone/) ───
// Affiche les éléments réservés au clone (le clone pose window.__FT_CLONE__=true dans son shim).
function _initCloneTools(){
  if(!window.__FT_CLONE__)return;
  const c=document.getElementById('admin-clone-reset-card');
  if(c)c.style.display='flex';
}
// Efface les données de CE clone et relance l'inscription depuis zéro (comme un nouvel inscrit, sans email).
function resetOnboardingTest(){
  if(!window.__FT_CLONE__){toast('Réservé au clone de test','error');return;}
  showConfirm('Refaire l\'inscription ?','Les données de ce clone vont être effacées et l\'inscription repartira de zéro (comme un nouvel inscrit).',()=>{
    try{localStorage.clear();}catch(e){}   // dans le clone : n'efface que les clés cl_ (stockage isolé)
    try{document.documentElement.classList.remove('ob-done');}catch(e){}
    location.reload();
  });
}
// Demande le code de secours (appareil sans email admin) — overlay simple
function _promptAdminCode(){
  let ov=document.getElementById('ov-admin-code');
  if(!ov){
    ov=document.createElement('div');ov.className='overlay';ov.id='ov-admin-code';
    ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};
    document.body.appendChild(ov);
  }
  ov.innerHTML='<div class="modal" style="max-width:340px;padding:22px 18px;">'
    +'<div style="font-size:17px;font-weight:800;color:var(--t1);margin-bottom:6px;">🔒 Accès admin</div>'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:16px;">Réservé au propriétaire. Entre le code d\'accès.</div>'
    +'<input type="password" id="admin-code-inp" inputmode="numeric" autocomplete="off" placeholder="Code" style="width:100%;box-sizing:border-box;margin-bottom:14px;" onkeydown="if(event.key===\'Enter\')_submitAdminCode()">'
    +'<button class="btn btn-red" style="width:100%;" onclick="_submitAdminCode()">Déverrouiller</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="document.getElementById(\'ov-admin-code\').classList.remove(\'open\')">Annuler</button>'
    +'</div>';
  ov.classList.add('open');
  setTimeout(()=>{const i=document.getElementById('admin-code-inp');if(i)i.focus();},80);
}
function _submitAdminCode(){
  const inp=document.getElementById('admin-code-inp');
  const val=inp?inp.value:'';
  const code=(typeof ADMIN_CODE!=='undefined')?ADMIN_CODE:'';
  if(val&&code&&val===code){
    try{localStorage.setItem('ft4_admin_ok','1');}catch(e){}
    document.getElementById('ov-admin-code')?.classList.remove('open');
    _toggleAdminMode();
  }else{
    toast('Code incorrect','error');
    if(inp){inp.value='';inp.focus();}
  }
}

function switchSetupTab(tab,btn){
  const cx=document.getElementById('setup-connexion');
  const pr=document.getElementById('setup-profil');
  if(tab==='connexion'){
    if(pr)pr.style.display='none';
    if(cx){cx.style.display='flex';cx.style.flexDirection='column';cx.style.gap='12px';}
    if(typeof _showAdminPremiumStatic==='function')_showAdminPremiumStatic();
  } else {
    if(cx)cx.style.display='none';
    if(pr){pr.style.display='flex';pr.style.flexDirection='column';}
  }
  document.querySelectorAll('.setup-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

// ─── BADGES ──────────────────────────────────────────────────
const BADGES=[
  {id:'first_session',icon:'🏋️',name:'Premier soulevé',desc:'Première séance enregistrée',cat:'evolution'},
  {id:'fire',icon:'🔥',name:'En feu',desc:'3 séances dans la même semaine',cat:'evolution'},
  {id:'regular_10',icon:'💪',name:'Régulier',desc:'10 séances au total',cat:'evolution'},
  {id:'assidu_25',icon:'⚡',name:'Assidu',desc:'25 séances au total',cat:'evolution'},
  {id:'veteran_50',icon:'🏆',name:'Vétéran',desc:'50 séances au total',cat:'evolution'},
  {id:'legend_100',icon:'💎',name:'Légende',desc:'100 séances au total',cat:'evolution'},
  {id:'first_pr',icon:'🎯',name:'Premier PR',desc:'Premier record personnel battu',cat:'perf'},
  {id:'prog_5',icon:'📈',name:'En progression',desc:'5 PRs battus',cat:'perf'},
  {id:'machine_20',icon:'🚀',name:'Machine',desc:'20 PRs battus',cat:'perf'},
  {id:'club_100',icon:'💯',name:'Club des 100kg',desc:'Squat ou Développé Couché à 100kg',cat:'perf'},
  {id:'club_140',icon:'🔱',name:'Club des 140kg',desc:'Soulevé de Terre à 140kg',cat:'perf'},
  {id:'streak_7',icon:'📅',name:'Streak 7 jours',desc:'7 jours consécutifs d\'entraînement',cat:'streak'},
  {id:'streak_30',icon:'🌟',name:'Streak 30 jours',desc:'30 jours consécutifs',cat:'streak'},
  {id:'streak_90',icon:'🎖️',name:'Streak 90 jours',desc:'90 jours consécutifs',cat:'streak'},
  {id:'early_bird',icon:'🌅',name:'Lève-tôt',desc:'Séance avant 7h du matin',cat:'special'},
  {id:'night_owl',icon:'🌙',name:'Noctambule',desc:'Séance après 22h',cat:'special'},
  {id:'birthday',icon:'🎂',name:'Bon anniversaire',desc:'Séance le jour de ton anniversaire',cat:'special'},
  {id:'premium_badge',icon:'👑',name:'Premium',desc:'Badge doré pour les utilisateurs Premium',cat:'special'},
  {id:'super_admin',icon:'🦸',name:'Super Admin',desc:'Le boss de Force Tracker 😎',cat:'special'},
];

function _getMaxStreak(){
  if(!S.sessions||!S.sessions.length)return 0;
  const dates=[...new Set(S.sessions.map(s=>s.date).filter(Boolean))].sort();
  if(!dates.length)return 0;
  let max=1,cur=1;
  for(let i=1;i<dates.length;i++){
    const diff=(new Date(dates[i]+'T12:00:00')-new Date(dates[i-1]+'T12:00:00'))/(864e5);
    if(Math.round(diff)===1){cur++;if(cur>max)max=cur;}else if(diff>1)cur=1;
  }
  return max;
}

function _checkBadgeCond(badge){
  const prCount=Object.keys(S.prs||{}).length;
  switch(badge.id){
    case 'first_session':return (S.sessions||[]).length>=1;
    case 'fire':{
      const wk={};
      (S.sessions||[]).forEach(sess=>{
        const d=new Date((sess.date||'')+'T12:00:00');if(isNaN(d))return;
        const m=new Date(d);m.setDate(d.getDate()-((d.getDay()+6)%7));
        const k=m.toISOString().slice(0,10);wk[k]=(wk[k]||0)+1;
      });
      return Object.values(wk).some(c=>c>=3);
    }
    case 'regular_10':return (S.sessions||[]).length>=10;
    case 'assidu_25':return (S.sessions||[]).length>=25;
    case 'veteran_50':return (S.sessions||[]).length>=50;
    case 'legend_100':return (S.sessions||[]).length>=100;
    case 'first_pr':return prCount>=1;
    case 'prog_5':return prCount>=5;
    case 'machine_20':return prCount>=20;
    case 'club_100':{
      const sq=S.prs['Squat à la Barre'],bp=S.prs['Développé Couché'];
      return !!(sq&&sq.kg>=100)||(bp&&bp.kg>=100);
    }
    case 'club_140':{const dl=S.prs['Soulevé de Terre'];return !!(dl&&dl.kg>=140);}
    case 'streak_7':return _getMaxStreak()>=7;
    case 'streak_30':return _getMaxStreak()>=30;
    case 'streak_90':return _getMaxStreak()>=90;
    case 'early_bird':return (S.sessions||[]).some(s=>{const h=typeof s.startHour==='number'?s.startHour:(s.ts||s.id?new Date(s.ts||s.id).getHours():-1);return h>=0&&h<7;});
    case 'night_owl':return (S.sessions||[]).some(s=>{const h=typeof s.startHour==='number'?s.startHour:(s.ts||s.id?new Date(s.ts||s.id).getHours():-1);return h>=22;});
    case 'birthday':{
      if(!S.bday)return false;
      const parts=(S.bday||'').split('/');if(parts.length<2)return false;
      const bd=parseInt(parts[0]),bm=parseInt(parts[1]);
      return (S.sessions||[]).some(sess=>{
        if(!sess.date)return false;
        const dt=new Date(sess.date+'T12:00:00');
        return dt.getDate()===bd&&(dt.getMonth()+1)===bm;
      });
    }
    case 'premium_badge':return !!S.premium;
    case 'super_admin':return typeof _isAdminUnlocked==='function' && _isAdminUnlocked();
    default:return false;
  }
}

// Progression vers un badge verrouillé (compteur + barre). null = badge sans progression (booléen).
function _badgeProgress(badge){
  const nS=(S.sessions||[]).length;
  const prCount=Object.keys(S.prs||{}).length;
  switch(badge.id){
    case 'first_session':return {cur:Math.min(nS,1),target:1};
    case 'regular_10':  return {cur:nS,target:10};
    case 'assidu_25':   return {cur:nS,target:25};
    case 'veteran_50':  return {cur:nS,target:50};
    case 'legend_100':  return {cur:nS,target:100};
    case 'first_pr':    return {cur:Math.min(prCount,1),target:1};
    case 'prog_5':      return {cur:prCount,target:5};
    case 'machine_20':  return {cur:prCount,target:20};
    case 'streak_7':    return {cur:_getMaxStreak(),target:7};
    case 'streak_30':   return {cur:_getMaxStreak(),target:30};
    case 'streak_90':   return {cur:_getMaxStreak(),target:90};
    case 'fire':{
      const wk={};(S.sessions||[]).forEach(sess=>{const d=new Date((sess.date||'')+'T12:00:00');if(isNaN(d))return;const m=new Date(d);m.setDate(d.getDate()-((d.getDay()+6)%7));const k=m.toISOString().slice(0,10);wk[k]=(wk[k]||0)+1;});
      const best=Object.values(wk).reduce((a,c)=>Math.max(a,c),0);
      return {cur:Math.min(best,3),target:3};
    }
    case 'club_100':{
      const sq=S.prs['Squat à la Barre'],bp=S.prs['Développé Couché'];
      return {cur:Math.round(Math.max(sq?sq.kg||0:0, bp?bp.kg||0:0)),target:100,unit:' kg'};
    }
    case 'club_140':{const dl=S.prs['Soulevé de Terre'];return {cur:Math.round(dl?dl.kg||0:0),target:140,unit:' kg'};}
    default:return null; // lève-tôt, noctambule, anniversaire, premium, super admin
  }
}

function checkBadges(silent){
  if(!S.badges)S.badges={};
  const newOnes=[];
  BADGES.forEach(b=>{
    if(S.badges[b.id])return;
    try{if(_checkBadgeCond(b)){S.badges[b.id]={unlockedAt:today()};newOnes.push(b);}}catch(e){}
  });
  if(newOnes.length)persist();
  if(!silent&&newOnes.length){
    newOnes.forEach((b,i)=>setTimeout(()=>toast(`${b.icon} Badge débloqué : ${b.name} !`,'success'),i*1000));
  }
}

function renderBadges(){
  const grid=document.getElementById('badge-grid');
  if(!grid)return;
  if(!S.badges)S.badges={};
  grid.innerHTML=BADGES.map(b=>{
    const unlocked=!!S.badges[b.id];
    const d=unlocked?S.badges[b.id].unlockedAt:'';
    let progHtml='';
    if(!unlocked){
      const p=(typeof _badgeProgress==='function')?_badgeProgress(b):null;
      if(p&&p.target>1){
        const cur=Math.max(0,Math.min(p.cur,p.target));
        const pct=Math.round(cur/p.target*100);
        progHtml=`<div class="badge-prog"><div class="badge-prog-bar"><div class="badge-prog-fill" style="width:${pct}%"></div></div><div class="badge-prog-txt">${cur}/${p.target}${p.unit||''}</div></div>`;
      }
    }
    return `<div class="badge-card ${unlocked?'unlocked':'locked'}">
      ${unlocked?'<div class="badge-glow"></div>':''}
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      ${d?`<div class="badge-date">${fmtD(d)}</div>`:''}
      ${progHtml}
    </div>`;
  }).join('');
}

function showPrCongrats(pr){
  if(!pr||!pr.newRm)return;
  document.getElementById('pr-name-txt').textContent=S.name||'Champion';
  document.getElementById('pr-ex-txt').textContent='Nouveau record sur '+pr.ex+' !';
  document.getElementById('pr-old-txt').textContent=pr.oldRm>0?fmt(pr.oldRm)+'kg':'–';
  document.getElementById('pr-new-txt').textContent=fmt(pr.newRm)+'kg';
  const delta=pr.oldRm>0?' (+'+fmt(pr.newRm-pr.oldRm)+'kg)':'';
  document.getElementById('pr-delta-txt').textContent='1RM estimé'+delta;
  const lvlEl=document.getElementById('pr-lvl-txt');if(lvlEl)lvlEl.style.display='none';
  document.getElementById('ov-pr-congrats').classList.add('open');
}

function fmtBday(el){
  const prev=el.value;
  let digits=prev.replace(/\D/g,'');
  if(digits.length>4)digits=digits.slice(0,4);
  let out=digits;
  if(digits.length>2)out=digits.slice(0,2)+'/'+digits.slice(2);
  if(out!==prev)el.value=out;
  saveBday(out);
}
function saveBday(val){
  S.bday=val;persist();
  checkBadges();
}

let _weekSumText='';
// Badge « ✅ Application mise à jour » : affiché une fois au reboot qui suit une mise à jour du code
// (le flag ft4_just_updated est posé juste avant le reload de MAJ). Pas au tout 1er install (on se
// base sur la présence d'un compte existant pour distinguer install ≠ mise à jour).
function checkJustUpdated(){
  try{
    const isUpdate=localStorage.getItem('ft4_just_updated')==='1';
    const existing=localStorage.getItem('ft4_app_seen')==='1'||!!localStorage.getItem('ft4_name');
    if(isUpdate){
      localStorage.removeItem('ft4_just_updated');
      if(existing)setTimeout(()=>{ if(typeof toast==='function')toast('✅ Application mise à jour','success'); },800);
    }
    localStorage.setItem('ft4_app_seen','1');
  }catch(e){}
}
function checkWeeklySummary(){
  const now=new Date();
  if(now.getDay()!==1)return; // lundi seulement
  const thisMonday=today();
  if(S.lastWeekSummary===thisMonday)return;
  // Semaine précédente : lundi-dimanche
  const prevMon=new Date(now);prevMon.setDate(now.getDate()-7);
  const prevSun=new Date(now);prevSun.setDate(now.getDate()-1);
  const ws=prevMon.toISOString().slice(0,10);
  const we=prevSun.toISOString().slice(0,10);
  const lastWeekSess=(S.sessions||[]).filter(s=>s.date&&s.date>=ws&&s.date<=we);
  if(!lastWeekSess.length)return;
  S.lastWeekSummary=thisMonday;persist();
  const sessCount=lastWeekSess.length;
  const totalVol=lastWeekSess.reduce((a,s)=>a+(_workVol(s)||s.volume||0),0);
  const totalCal=lastWeekSess.reduce((a,s)=>a+(s.calories||0),0);
  const newBadges=Object.entries(S.badges||{})
    .filter(([,v])=>v.unlockedAt&&v.unlockedAt>=ws&&v.unlockedAt<=we)
    .map(([id])=>BADGES.find(b=>b.id===id)).filter(Boolean);
  const el=document.getElementById('week-sum-content');if(!el)return;
  el.innerHTML=`
    <div style="font-size:13px;color:var(--t3);font-weight:700;margin-bottom:4px;">Semaine du ${fmtD(ws)} au ${fmtD(we)}</div>
    <div class="week-sum-row"><span class="week-sum-lbl">🏋️ Séances</span><span class="week-sum-val">${sessCount}</span></div>
    <div class="week-sum-row"><span class="week-sum-lbl">📦 Volume total</span><span class="week-sum-val">${Math.round(totalVol)} kg</span></div>
    ${totalCal?`<div class="week-sum-row"><span class="week-sum-lbl">🔥 Calories</span><span class="week-sum-val">${totalCal} kcal</span></div>`:''}
    ${newBadges.length?`<div class="week-badge-pill">🏅 ${newBadges.map(b=>b.icon+' '+b.name).join(' · ')}</div>`:''}
  `;
  _weekSumText=`Force Tracker — Semaine du ${fmtD(ws)}\n🏋️ ${sessCount} séance${sessCount>1?'s':''}\n📦 Volume : ${Math.round(totalVol)} kg\n${totalCal?'🔥 Calories : '+totalCal+' kcal\n':''}${newBadges.length?'🏅 Badges : '+newBadges.map(b=>b.icon+' '+b.name).join(', ')+'\n':''}💪 Force Tracker`;
  setTimeout(()=>document.getElementById('ov-week-summary').classList.add('open'),1500);
}

function copyWeekSummary(){
  navigator.clipboard.writeText(_weekSumText).then(()=>toast('Résumé copié !','success')).catch(()=>toast('Copie impossible','error'));
  document.getElementById('ov-week-summary').classList.remove('open');
}

// ─── PLAN DE REPAS IA ────────────────────────────────────────
// ── Régime alimentaire + restrictions (végé, halal, allergies…) ──
function _renderDietCard(){
  const el=document.getElementById('diet-card'); if(!el)return;
  const diet=S.diet||'';
  const dietBtn=(v,l)=>`<button onclick="setDiet('${v}')" class="btn ${diet===v?'btn-red':'btn-bg2'}" style="font-size:13px;padding:10px 6px;letter-spacing:0;">${l}</button>`;
  const restr=S.dietRestrictions||[];
  const rBtn=(k,l)=>`<button onclick="toggleDietRestriction('${k}')" class="btn ${restr.includes(k)?'btn-red':'btn-bg2'}" style="width:auto;flex:0 0 auto;font-size:12px;padding:8px 12px;border-radius:20px;">${l}</button>`;
  el.innerHTML=`<div class="card cp" style="display:flex;flex-direction:column;gap:13px;">
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Type d'alimentation</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">${dietBtn('omnivore','Omnivore')}${dietBtn('vegetarien','Végétarien')}${dietBtn('vegan','Végan')}${dietBtn('pescetarien','Pescétarien')}</div>
    </div>
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Restrictions (plusieurs possibles)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${rBtn('halal','🕌 Halal')}${rBtn('casher','✡️ Casher')}${rBtn('sansporc','Sans porc')}${rBtn('sansboeuf','Sans bœuf')}${rBtn('sansalcool','Sans alcool')}${rBtn('sanslactose','Sans lactose')}${rBtn('sansgluten','Sans gluten')}</div>
    </div>
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Allergies / aliments à éviter</div>
      <input id="diet-notes-inp" type="text" value="${(S.dietNotes||'').replace(/"/g,'&quot;')}" oninput="saveDietNotes(this.value)" placeholder="ex. fruits à coque, fruits de mer…" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--sep);background:var(--bg2);color:var(--t1);font-family:var(--font);font-size:13.5px;box-sizing:border-box;">
    </div>
    <div style="font-size:11px;color:var(--t3);line-height:1.45;">🥗 Milo et le plan de repas respectent tout ça — jamais un aliment que tu ne manges pas.</div>
    ${diet==='vegan'?'<div style="font-size:11.5px;color:var(--gold);line-height:1.45;">💊 Végan : protéine végétale (pois/riz) au lieu de la whey · pense B12, oméga-3 (algues), vitamine D, fer.</div>':diet==='vegetarien'?'<div style="font-size:11.5px;color:var(--gold);line-height:1.45;">💊 Végétarien : whey/œufs OK · surveille le fer et la B12.</div>':''}
  </div>`;
}
function setDiet(v){ S.diet=(S.diet===v?'':v); if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); _renderDietCard(); }
function toggleDietRestriction(k){
  const a=(S.dietRestrictions||[]).slice(); const i=a.indexOf(k);
  if(i>=0)a.splice(i,1); else a.push(k);
  S.dietRestrictions=a; if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); _renderDietCard();
}
let _dietNotesT=null;
function saveDietNotes(v){ S.dietNotes=v; if(_dietNotesT)clearTimeout(_dietNotesT); _dietNotesT=setTimeout(function(){ if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); },600); }

async function generateMealPlan(regenDay,regenMeal){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.bw||!S.age||!S.height){toast('Complète ton profil d\'abord (âge, taille, poids)','error');return;}
  const isPrem=S.premium,td=today();
  const isRegen=!!(regenDay&&regenMeal);
  if(isRegen&&!isPrem){
    if(S.mealPlan&&S.mealPlan.regenDate===td&&(S.mealPlan.regenCount||0)>=1){
      toast('1 régénération/jour en gratuit · Premium = illimité ⭐','info');return;
    }
  }
  const btn=isRegen?null:document.getElementById('mp-gen-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Génération...';}
  const macros=calcMacros(S.nutritionPhase);
  const cp=getMensCyclePhase();
  const _diet=(typeof dietSummary==='function')?dietSummary():'';
  const ctx=`Profil: ${S.gender==='H'?'Homme':'Femme'}, ${S.age} ans, ${S.bw}kg, objectif: ${GOAL_LABELS[S.goal]||S.goal}, phase: ${S.nutritionPhase}`
    +`\nMacros/jour: ${macros.calories} kcal · P ${macros.prot_g}g · G ${macros.carbs_g}g · L ${macros.fat_g}g`
    +(cp&&cp.phase?`\nCycle: phase ${cp.phase} (jour ${cp.day}/${S.mensCycleDur})`:'')
    +(S.morphotype?` · Morphotype: ${S.morphotype}`:'')
    +(_diet?`\n⚠️ RÉGIME À RESPECTER ABSOLUMENT: ${_diet}. N'inclus AUCUN aliment interdit ni non conforme.`:'');
  try{
    const body={action:'generateMealPlan',context:ctx,scope:isPrem?'week':'day',startDate:td};
    if(isRegen){body.regenDay=regenDay;body.regenMeal=regenMeal;}
    const resp=await fetch(_aiUrl('generateMealPlan'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
    const data=await resp.json();
    if(!data||data.status!=='ok'||!data.plan){toast('Erreur IA : '+(data&&data.message||'réessaie'),'error');return;}
    if(isRegen){
      if(!S.mealPlan)S.mealPlan={days:[],generatedAt:td,regenDate:null,regenCount:0};
      const newDay=data.plan.days&&data.plan.days[0];
      if(newDay){
        const ex=S.mealPlan.days.find(d=>d.date===regenDay);
        if(ex){const nm=newDay.meals&&newDay.meals[0];if(nm){const idx=ex.meals.findIndex(m=>m.name===regenMeal);if(idx>=0)ex.meals[idx]=nm;else ex.meals.push(nm);}}
      }
      if(!isPrem){if(S.mealPlan.regenDate!==td){S.mealPlan.regenDate=td;S.mealPlan.regenCount=0;}S.mealPlan.regenCount=(S.mealPlan.regenCount||0)+1;}
      toast('Repas régénéré ✅','success');
    }else{
      S.mealPlan={days:data.plan.days||[],generatedAt:td,regenDate:null,regenCount:0};
      toast(isPrem?'Semaine générée ✅':'Repas du jour généré ✅','success');
    }
    persist();renderMealPlanIA();
  }catch(e){toast('Erreur réseau : '+e.message,'error');}
  finally{if(btn){btn.disabled=false;btn.textContent='🍽️ Générer'+(isPrem?' ma semaine':' mon repas du jour');}}
}

// ─── IMPORT PLAN ALIMENTAIRE (photo/PDF d'un diététicien) ──────────────
let _mealImpPhotos=[],_mealImpExtracted=null;
function openImportMeal(){
  _mealImpPhotos=[];_mealImpExtracted=null;
  mealImpGoStep(1);
  document.getElementById('ov-import-meal').classList.add('open');
}
function closeImportMeal(){document.getElementById('ov-import-meal').classList.remove('open');}
function mealImpGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('mimp-s'+i);if(s)s.style.display='none';
    const dot=document.getElementById('mimp-dot-'+i);if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('mimp-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['mimp-cam-inp','mimp-gal-inp','mimp-file-inp','mimp-more-inp','mimp-more-file-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}
function addMealImportPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const c2d=canvas.getContext('2d');
      if(!c2d){URL.revokeObjectURL(url);res(null);return;}
      c2d.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _mealImpPhotos.push(...results.filter(Boolean));
    _renderMealImpThumbs();mealImpGoStep(2);
  });
}
async function addMealImportFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15,results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=(f.name||'').toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){_mealImpPhotos.push(...results);_renderMealImpThumbs();mealImpGoStep(2);}
}
function _renderMealImpThumbs(){
  const el=document.getElementById('mimp-thumbs');if(!el)return;
  el.innerHTML=_mealImpPhotos.map((p,i)=>{
    const isDoc=p.type==='application/pdf'||p.isText;
    const thumb=isDoc
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">📄</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name||'Page'}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeMealImpPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}
function removeMealImpPhoto(i){
  _mealImpPhotos.splice(i,1);
  if(!_mealImpPhotos.length){mealImpGoStep(1);return;}
  _renderMealImpThumbs();
}
async function analyzeMealImport(){
  if(!_mealImpPhotos.length){toast('Ajoute au moins une photo','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  mealImpGoStep(3);
  let raw='';
  try{
    const diet=(typeof dietSummary==='function')?dietSummary():'';
    const r=await fetch(_aiUrl('importMealPlan'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'importMealPlan',images:_mealImpPhotos,diet})});
    raw=await r.text();
    console.log('[ImportMeal] Réponse brute :',raw);
    const d=JSON.parse(raw);
    if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
    _mealImpExtracted=d.data;
    _renderMealImpConfirm();
    mealImpGoStep(4);
  }catch(e){
    console.error('[ImportMeal] Erreur :',e.message,'| Brut :',raw);
    mealImpGoStep(2);
    toast('Erreur analyse : '+e.message,'error');
  }
}
function _renderMealImpConfirm(){
  const d=_mealImpExtracted;if(!d)return;
  const nameEl=document.getElementById('mimp-plan-name');
  if(nameEl)nameEl.textContent=d.planName||'Plan alimentaire importé';
  const el=document.getElementById('mimp-preview');if(!el)return;
  el.innerHTML=(d.days||[]).map((day,di)=>`
    <div style="background:var(--bg3);border-radius:10px;padding:10px 12px;">
      <div style="font-weight:700;font-size:13px;color:var(--red);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">${_escNote(day.label||'Jour '+(di+1))}</div>
      ${(day.meals||[]).map(m=>`
        <div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:13px;font-weight:600;">${_escNote(m.name)}</div>
            <span style="font-size:12px;font-weight:700;color:var(--red);">${m.kcal||0} kcal</span>
          </div>
          <ul style="margin:4px 0 0;padding:0 0 0 16px;">${(m.foods||[]).map(f=>`<li style="font-size:12px;color:var(--t2);">${_escNote(f)}</li>`).join('')}</ul>
          <div style="font-size:11px;color:var(--t3);margin-top:4px;">P ${m.prot||0}g · G ${m.carbs||0}g · L ${m.fat||0}g</div>
        </div>`).join('')}
    </div>`).join('');
}
function finalImportMeal(){
  const d=_mealImpExtracted;
  if(!d||!(d.days||[]).length){toast('Aucun repas à importer','error');return;}
  const td=today();
  const days=d.days.map((day,i)=>{
    const dt=new Date();dt.setDate(dt.getDate()+i);
    const date=dt.toISOString().slice(0,10);
    return{date,label:day.label||'',meals:(day.meals||[]).map(m=>({
      name:m.name||'Repas',foods:m.foods||[],kcal:m.kcal||0,prot:m.prot||0,carbs:m.carbs||0,fat:m.fat||0
    }))};
  });
  S.mealPlan={days,generatedAt:td,regenDate:null,regenCount:0,imported:true,planName:d.planName||''};
  persist();
  closeImportMeal();
  if(typeof renderMealPlanIA==='function')renderMealPlanIA();
  toast('Plan alimentaire importé ! 🍽️','success');
}

// ─── AUTO-RESTAURATION ───────────────────────────────────────
let _lastSavedEmail='';
function _saveEmailRedundant(email){
  if(!email||email===_lastSavedEmail)return;
  _lastSavedEmail=email;
  try{document.cookie='ft_email='+encodeURIComponent(email)+';max-age=31536000;samesite=strict;path=/';}catch(e){}
  if(S.sessions&&S.sessions.length>0){try{document.cookie='ft_had_data=1;max-age=31536000;samesite=strict;path=/';}catch(e){}}
  try{
    var req=indexedDB.open('ft_meta',1);
    req.onupgradeneeded=function(e){e.target.result.createObjectStore('meta',{keyPath:'key'});};
    req.onsuccess=function(e){try{e.target.result.transaction('meta','readwrite').objectStore('meta').put({key:'email',value:email});}catch(e2){}};
  }catch(e){}
}
async function _getEmailFromIDB(){
  return new Promise(function(resolve){
    try{
      var req=indexedDB.open('ft_meta',1);
      req.onupgradeneeded=function(e){e.target.result.createObjectStore('meta',{keyPath:'key'});};
      req.onsuccess=function(e){
        try{var g=e.target.result.transaction('meta','readonly').objectStore('meta').get('email');g.onsuccess=function(r){resolve(r.result?r.result.value:null);};g.onerror=function(){resolve(null);};}catch(e2){resolve(null);}
      };
      req.onerror=function(){resolve(null);};
      setTimeout(function(){resolve(null);},600);
    }catch(e){resolve(null);}
  });
}
async function _silentCloudRestore(email){
  if(!S.url)return false;
  try{
    const ctrl=new AbortController();const tId=setTimeout(()=>ctrl.abort(),5000);
    const r=await fetch(S.url,{method:'POST',redirect:'follow',signal:ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email,authCode:_authCode()})});
    clearTimeout(tId);const d=await r.json();
    if(d.status!=='ok'||!d.sessions||d.sessions.length===0)return false;
    S.email=email;
    try{localStorage.setItem('ft4_email',email);localStorage.setItem('ft4_ob2','1');document.documentElement.classList.add('ob-done');}catch(e){}
    _applyRestoreData(d);
    _saveEmailRedundant(email);
    try{document.getElementById('ov-reconnect')?.classList.remove('open');}catch(e){}
    toast('✅ Données resynchronisées','success');
    try{renderHome();}catch(e){}try{if(typeof renderSetup==='function')renderSetup();}catch(e){}
    return true;
  }catch(e){console.warn('[FT auto-restore]',e.message);return false;}
}
function _showReconnectOverlay(){
  const ov=document.getElementById('ov-reconnect');if(ov)ov.classList.add('open');
}
window.doReconnect=async function(){
  const inp=document.getElementById('reconnect-email-inp');if(!inp)return;
  const email=inp.value.trim().toLowerCase();
  if(!email||!email.includes('@')){toast('Email invalide','error');return;}
  const btn=document.getElementById('reconnect-btn');const st=document.getElementById('reconnect-status');
  if(btn){btn.disabled=true;btn.textContent='🔄 Recherche…';}
  if(st){st.style.display='block';st.textContent='Connexion en cours…';}
  const ok=await _silentCloudRestore(email);
  if(!ok){if(st){st.style.display='block';st.textContent='❌ Aucun compte trouvé pour cet email.';}toast('Aucun compte trouvé','error');}
  if(btn){btn.disabled=false;btn.textContent='🔄 Retrouver mes données';}
};
window.closeReconnect=function(){try{document.getElementById('ov-reconnect')?.classList.remove('open');}catch(e){}};

// ─── INIT ────────────────────────────────────────────────────
load();
// ─ Récupération brouillon après crash de finishWorkout ────────
(function _recoverDraft(){
  try{
    const draftStr=localStorage.getItem('ft4_wkt_draft');
    if(!draftStr||draftStr==='null')return;
    const draft=JSON.parse(draftStr);
    if(!draft||!draft.exs||!draft.exs.length)return;
    // Si S.wkt est null mais que le brouillon existe → finishWorkout a crashé
    // Vérifier que la séance n'est pas déjà enregistrée (même date + volume proche)
    const lastSess=S.sessions&&S.sessions[0];
    const draftDate=draft.date||today();
    const alreadySaved=lastSess&&lastSess.date===draftDate&&lastSess.exs&&lastSess.exs.length>=draft.exs.length;
    if(alreadySaved){localStorage.removeItem('ft4_wkt_draft');return;}
    // Restaurer S.wkt depuis le brouillon si pas déjà actif
    if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){
      S.wkt=draft;
      try{localStorage.setItem('ft4_wkt',draftStr);}catch(e){}
    }
  }catch(e){}
})();
// Remplit les libellés de version (.app-ver) avec le VRAI build tournant (cache SW ft-vNN) → jamais périmé
function _setAppVersionEls(){
  if(!('caches' in window))return;
  caches.keys().then(keys=>{
    const ft=(keys||[]).find(k=>k&&k.startsWith('ft-v'));
    if(!ft)return;
    document.querySelectorAll('.app-ver').forEach(el=>{el.textContent=ft;});
  }).catch(()=>{});
}
(async()=>{let cv='?';try{const ks=await caches.keys();cv=ks.find(k=>k.startsWith('ft-v'))||'?';}catch(e){}try{_setAppVersionEls();}catch(e){}console.log('[FT] boot',cv,'— _adminMode=',window._adminMode,'_curScreen=',window._curScreen,'_premiumPending=',window._premiumPending,'openRestoreAccount=',typeof openRestoreAccount);})();
// Garantie : le timer de repos ne survit jamais à un redémarrage ni à un retour au premier plan
stopRest();
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&restStartTs&&_restLeft()<=-5)stopRest();
});
document.getElementById('tb-date').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
applyTheme();
if(typeof _applyHalo==='function')_applyHalo();
if(typeof _applyThemeBtns==='function')_applyThemeBtns();
if(typeof _applyA11y==='function')_applyA11y();
if(typeof _applyColorblind==='function')_applyColorblind();
if(typeof _applyLeftHand==='function')_applyLeftHand();
filterEx();
goScreen('home', document.getElementById('nb-home'));
// Notifier l'utilisateur s'il y a une séance en cours non terminée
if(S.wkt&&S.wkt.exs&&S.wkt.exs.length){
  const nEx=S.wkt.exs.length;
  const nDone=S.wkt.exs.reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s.done).length,0);
  setTimeout(()=>toast('Séance en cours — '+nEx+' exercice'+(nEx>1?'s':'')+(nDone?' · '+nDone+' séries validées':'')+' · Appuie sur Reprendre','info'),1000);
}
_initSwipe();
_blockEdgeBackSwipe(); // iOS : neutralise le geste "retour" bord gauche (page blanche)
_initPullToDismiss();
// Bouton retour Android / navigateur → ferme overlay ou revient à l'écran précédent
history.pushState(null,'',location.href);
window.addEventListener('popstate',()=>{
  // Blur l'input actif avant tout — évite le dialog iOS "annuler la saisie ?"
  if(document.activeElement&&(document.activeElement.tagName==='INPUT'||document.activeElement.tagName==='TEXTAREA'))document.activeElement.blur();
  history.pushState(null,'',location.href);
  const ov=[...document.querySelectorAll('.overlay.open')].pop();
  if(ov){ov.classList.remove('open');return;}
  if(window._curScreen!=='home')navBack();
});
// Trick iOS Safari : garde les inputs "propres" → plus de dialog "Voulez-vous annuler la saisie ?"
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.defaultValue=el.value;
},true);
_updateNewBadges();
checkBadges(true); // check silencieux au démarrage
checkWeeklySummary(); // résumé lundi matin
checkJustUpdated();   // badge « Application mise à jour » après un reboot de mise à jour
checkSuperTesterWelcome(); // message « super testeur » une seule fois (Christophe)
checkEmmaWelcome(); // pop perso Emma : bienvenue Espace Testeur + boîte à idées (une seule fois)
checkTesterGuide(); // guide testeuses (Eline, Emma, Tanna) : tour de l'app + boîte à idées (une seule fois)
checkAnnouncements(); // pop perso Christophe + « Quoi de neuf » pour tous (une seule fois)
checkTesterEq();      // pop testeurs : différenciation des types de matériel (test, une seule fois)
// checkBirthdayDedication(); // 🗄️ Anniversaire Eline archivé (passé) — code + overlay #ov-bday conservés, réactiver en décommentant
initCoachInput();
initOnboarding();
_initCloneTools(); // affiche les outils réservés au clone de test (bouton « Refaire l'inscription »)
// ─── ESPACE SUPER TESTEUR (Christophe) — analyse photos + boîte à idées ──
let _testerIdeaFiles=[];
function checkSuperTesterWelcome(){
  try{
    // Le message « Michel te remercie » est réservé aux vrais testeurs récompensés (pas à Michel lui-même).
    if(!_isSuperTester()||!(typeof _isTester==='function'&&_isTester()))return;
    if(_isEmma())return; // Emma a son propre message perso (checkEmmaWelcome)
    if(localStorage.getItem('ft4_super_welcome_v1'))return;
    setTimeout(showSuperWelcome,900);
  }catch(e){}
}
function showSuperWelcome(){const o=document.getElementById('ov-super-welcome');if(o)o.classList.add('open');}
function closeSuperWelcome(){try{localStorage.setItem('ft4_super_welcome_v1','1');}catch(e){}const o=document.getElementById('ov-super-welcome');if(o)o.classList.remove('open');}
// ─── Pop-up perso Emma : bienvenue Espace Testeur + boîte à idées (une seule fois) ──
// ⚠️ Remplacé par le guide testeuses unifié (checkTesterGuide) : Emma est une « guided tester »,
//    donc son ancienne pop perso ne se déclenche plus (le guide la couvre).
function _isEmma(){return (S.email||'').trim().toLowerCase()==='emma.david16@gmail.com';}
function checkEmmaWelcome(){
  try{
    if(_isGuidedTester())return; // le guide testeuses unifié couvre Emma
    if(!_isEmma())return;
    if(localStorage.getItem('ft4_emma_welcome_v1'))return;
    setTimeout(function(){const o=document.getElementById('ov-emma-welcome');if(o)o.classList.add('open');},1000);
  }catch(e){}
}
function closeEmmaWelcome(){try{localStorage.setItem('ft4_emma_welcome_v1','1');}catch(e){}const o=document.getElementById('ov-emma-welcome');if(o)o.classList.remove('open');}
// ─── Guide testeuses (Eline, Emma, Tanna) : bienvenue + tour de l'app + boîte à idées (une seule fois) ──
function _isGuidedTester(){
  var e=(S.email||'').trim().toLowerCase();
  return ['elineazs32@gmail.com','emma.david16@gmail.com','tanna.valery.studio@gmail.com'].indexOf(e)>=0;
}
function checkTesterGuide(){
  try{
    if(!_isGuidedTester())return;
    if(localStorage.getItem('ft4_tester_guide_v1'))return;
    setTimeout(showTesterGuide,1100);
  }catch(e){}
}
function showTesterGuide(){
  // Ne pas s'empiler sur une autre pop-up de démarrage : on réessaie un peu plus tard
  var busy=['ov-whatsnew','ov-super-welcome','ov-emma-welcome','ov-billoute','ov-bday','ov-tester-eq'].some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('open');});
  if(busy){setTimeout(showTesterGuide,2500);return;}
  var span=document.getElementById('tguide-name');
  if(span){var f=((S.name||'').trim().split(/\s+/)[0]||'').replace(/[<>&]/g,'');span.textContent=f?(', '+f):'';}
  var o=document.getElementById('ov-tester-guide');if(o)o.classList.add('open');
}
function closeTesterGuide(){
  try{localStorage.setItem('ft4_tester_guide_v1','1');localStorage.setItem('ft4_emma_welcome_v1','1');}catch(e){}
  var o=document.getElementById('ov-tester-guide');if(o)o.classList.remove('open');
}
// ─── Annonces : pop-up perso Christophe + « Quoi de neuf » pour tous (une seule fois) ──
function _isChristophe(){return (S.email||'').trim().toLowerCase()==='christophe@famillelanglois.fr';}
function checkAnnouncements(){
  try{
    // Testeuses (Eline/Emma/Tanna) : leur guide passe en priorité — pas de « Quoi de neuf » par-dessus tant qu'elles ne l'ont pas vu.
    if(_isGuidedTester()&&!localStorage.getItem('ft4_tester_guide_v1'))return;
    // Christophe : son pop perso « billoute » d'abord ; une fois vu, il reçoit les annonces générales comme tout le monde.
    if(_isChristophe()&&!localStorage.getItem('ft4_billoute_v3')){
      setTimeout(showBilloute,1000);
      return;
    }
    // Christophe : pop perso « supprimer une série photo » (une seule fois, après le billoute)
    if(_isChristophe()&&!localStorage.getItem('ft4_christophe_photodel_v1')){
      setTimeout(showChristophePhotos,1000);
      return;
    }
    if(_whatsNewUnseen().length) setTimeout(showWhatsNew,1000);
  }catch(e){}
}
function showBilloute(){const o=document.getElementById('ov-billoute');if(o)o.classList.add('open');}
function closeBilloute(){try{localStorage.setItem('ft4_billoute_v3','1');}catch(e){}const o=document.getElementById('ov-billoute');if(o)o.classList.remove('open');}
function showChristophePhotos(){const o=document.getElementById('ov-christophe-photos');if(o)o.classList.add('open');}
function closeChristophePhotos(){try{localStorage.setItem('ft4_christophe_photodel_v1','1');}catch(e){}const o=document.getElementById('ov-christophe-photos');if(o)o.classList.remove('open');}
// ─── « Quoi de neuf » versionné : montre toutes les nouveautés non vues d'un coup ──
function _whatsNewSeen(){
  try{
    var s=localStorage.getItem('ft4_wn_seen');
    if(s!==null&&s!=='') return parseInt(s)||0;
    // Migration : l'ancien flag ft4_whatsnew_v2 = a déjà vu le lot Nutrition (v≤4)
    if(localStorage.getItem('ft4_whatsnew_v2')) return 4;
  }catch(e){}
  return 0;
}
function _whatsNewUnseen(){
  if(typeof WHATS_NEW==='undefined') return [];
  var seen=_whatsNewSeen();
  var list=WHATS_NEW.filter(function(f){return f.v>seen;});
  if(typeof WHATS_NEW_SHOW_MAX==='number') list=list.slice(0,WHATS_NEW_SHOW_MAX);
  return list;
}
function showWhatsNew(){
  var items=_whatsNewUnseen();
  if(!items.length){_whatsNewMarkSeen();return;}
  var box=document.getElementById('whatsnew-list');
  if(box){
    box.innerHTML=items.map(function(f){
      return '<div class="sw-feat"><span>'+f.ic+'</span><div><b>'+f.t+'</b><small>'+f.d+'</small></div></div>';
    }).join('');
  }
  var sub=document.getElementById('whatsnew-sub');
  if(sub) sub.textContent=items.length>1?('Voici les '+items.length+' dernières nouveautés 👇'):'Une nouveauté pour toi 👇';
  var o=document.getElementById('ov-whatsnew');if(o)o.classList.add('open');
}
function _whatsNewMarkSeen(){try{localStorage.setItem('ft4_wn_seen',String(typeof WHATS_NEW_MAX==='number'?WHATS_NEW_MAX:0));localStorage.setItem('ft4_whatsnew_v2','1');}catch(e){}}
function closeWhatsNew(){_whatsNewMarkSeen();const o=document.getElementById('ov-whatsnew');if(o)o.classList.remove('open');}
// ─── Pop testeurs : différenciation des types de matériel (test, une seule fois) ──
function checkTesterEq(){
  try{
    if(!(typeof _eqTestOn==='function'&&_eqTestOn()))return;      // testeurs + Michel uniquement
    if(localStorage.getItem('ft4_tester_eq_v1'))return;           // déjà vu
    setTimeout(showTesterEq,1400);
  }catch(e){}
}
function showTesterEq(){
  // Ne pas s'empiler sur une autre pop-up de démarrage : on réessaie un peu plus tard
  const busy=['ov-whatsnew','ov-super-welcome','ov-emma-welcome','ov-tester-guide','ov-billoute','ov-bday'].some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('open');});
  if(busy){setTimeout(showTesterEq,2500);return;}
  const o=document.getElementById('ov-tester-eq');if(o)o.classList.add('open');
}
function closeTesterEq(){try{localStorage.setItem('ft4_tester_eq_v1','1');}catch(e){}const o=document.getElementById('ov-tester-eq');if(o)o.classList.remove('open');}
function openTesterSpace(){
  // L'Espace Testeur (dont la boîte à idées) est ouvert à TOUS les testeurs récompensés.
  // Le suivi photos à l'intérieur reste réservé aux super testeurs (voir _renderTesterSpace).
  // Michel a le suivi photos via le panneau Admin.
  const isTester=(typeof _isTester==='function'&&_isTester());
  if(!isTester&&!(typeof _isSuperTester==='function'&&_isSuperTester())){toast('Espace réservé aux testeurs','info');return;}
  _renderTesterSpace();const o=document.getElementById('ov-tester-space');if(o)o.classList.add('open');}
function closeTesterSpace(){const o=document.getElementById('ov-tester-space');if(o)o.classList.remove('open');}
function _openTesterPhotoAnalysis(){ if(typeof openBodySeries==='function')openBodySeries(); else if(typeof openBodyStudy==='function')openBodyStudy(); else toast('Analyse photos bientôt disponible','info'); }
function _renderTesterSpace(){
  const body=document.getElementById('tester-space-body');if(!body)return;
  const esc=(t)=>(typeof _escNote==='function'?_escNote(t):(t||'')).replace(/\n/g,'<br>');
  const ideas=(S.testerIdeas||[]).slice().reverse();
  const ideasHtml=ideas.length?ideas.map(it=>'<div class="tsp-idea">'+esc(it.text)+'<span class="tsp-idea-date">'+(it.date||'')+(it.photos?' · '+it.photos+' photo'+(it.photos>1?'s':''):'')+(it.sent?' · envoyée ✓':'')+'</span></div>').join(''):'';
  // Le suivi photos approfondi reste réservé aux super testeurs (coûteux) ; la boîte à idées est pour tous les testeurs.
  const photoCard=(typeof _isSuperTester==='function'&&_isSuperTester())
    ? '<div class="tsp-card">'
      +'<h4>🔬 Analyse approfondie de tes photos</h4>'
      +'<p>En avant-première rien que pour toi. Prends une série de 4 photos (face relâché, face contracté, dos contracté, profil) — l’IA fait un bilan complet. <b>Jusqu’à 4 séries par mois</b>, comparées entre elles pour suivre ton évolution.</p>'
      +'<button class="btn" onclick="closeTesterSpace();_openTesterPhotoAnalysis();" style="width:100%;padding:12px;background:rgba(234,179,8,.16);border:1px solid rgba(234,179,8,.42);color:var(--gold);font-weight:800;">📸 Mon suivi photos</button>'
      +'</div>'
    : '';
  body.innerHTML=
    photoCard
    +'<div class="tsp-card">'
    +'<h4>💡 Ta boîte à idées</h4>'
    +'<p>Écris ce que tu aimerais, joins des photos ou des captures d’écran. Ça remonte direct à Michel.</p>'
    +'<textarea id="tester-idea-input" placeholder="Ton idée, une remarque, un bug, un truc qui te manque…" style="width:100%;min-height:72px;background:var(--bg2);border:1px solid var(--sep);border-radius:10px;padding:10px;color:var(--t1);font-family:var(--font);font-size:13.5px;resize:vertical;box-sizing:border-box;"></textarea>'
    +'<div id="tester-idea-thumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>'
    +'<div style="display:flex;gap:8px;margin-top:8px;">'
    +'<button class="btn btn-bg2" onclick="document.getElementById(\'tester-idea-photos\').click()" style="width:auto;flex:none;padding:11px 14px;font-size:14px;">📎 Photo</button>'
    +'<button class="btn btn-red" onclick="sendTesterIdea()" style="width:auto;flex:1;padding:11px;font-size:14px;">📩 Envoyer à Michel</button>'
    +'</div>'
    +'<input type="file" id="tester-idea-photos" accept="image/*" multiple style="display:none;" onchange="onTesterIdeaPhotos(this)">'
    +(ideas.length?'<div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;font-weight:700;">Tes idées envoyées</div>'+ideasHtml:'')
    +'</div>';
  _renderTesterIdeaThumbs();
}
function onTesterIdeaPhotos(input){
  [...(input.files||[])].forEach(f=>{if(f&&f.type&&f.type.indexOf('image')===0)_testerIdeaFiles.push(f);});
  input.value='';
  _renderTesterIdeaThumbs();
}
function _renderTesterIdeaThumbs(){
  const el=document.getElementById('tester-idea-thumbs');if(!el)return;
  const thumbs=_testerIdeaFiles.map((f,i)=>{
    const url=URL.createObjectURL(f);
    return '<div style="position:relative;width:58px;height:58px;border-radius:9px;overflow:hidden;border:1px solid var(--sep);"><img src="'+url+'" style="width:100%;height:100%;object-fit:cover;"><button onclick="removeTesterIdeaPhoto('+i+')" style="position:absolute;top:1px;right:1px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;border:none;font-size:12px;line-height:1;cursor:pointer;padding:0;">×</button></div>';
  }).join('');
  // Plus de bouton de partage séparé : les photos partent AVEC l'idée (bouton « Envoyer »).
  el.innerHTML=thumbs;
}
function removeTesterIdeaPhoto(i){_testerIdeaFiles.splice(i,1);_renderTesterIdeaThumbs();}
async function sendTesterIdea(){
  const inp=document.getElementById('tester-idea-input');
  const txt=inp?(inp.value||'').trim():'';
  if(!txt&&!_testerIdeaFiles.length){toast('Écris ton idée ou joins une photo 🙂','info');return;}
  const who=(S.name||'Testeur');
  const nPhotos=_testerIdeaFiles.length;
  toast(nPhotos?'Envoi de ton idée + photos…':'Envoi de ton idée…','info');
  // Photos → base64 (comme l'import de programme) pour partir AVEC le texte, en 1 seul envoi
  let images=[];
  try{ images=await Promise.all(_testerIdeaFiles.map(f=>_resizeToB64(f,1100,0.82).then(data=>({data,type:'image/jpeg'})))); }
  catch(e){ images=[]; }
  // Trace locale
  S.testerIdeas=S.testerIdeas||[];
  S.testerIdeas.push({text:txt||'(photos jointes)',date:new Date().toLocaleDateString('fr-FR'),photos:nPhotos,sent:true});
  persist();
  // Envoi serveur : texte + photos → mail à Michel AVEC les photos en pièces jointes (fix #13)
  let ok=false;
  try{
    const r=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'testerIdea',email:S.email||'',name:who,text:txt||'(photos jointes)',photos:images.length,images,date:new Date().toISOString()})});
    const d=await r.json(); ok=!!(d&&d.status==='ok');
  }catch(e){ ok=false; }
  _testerIdeaFiles=[];
  if(inp)inp.value=''; _renderTesterSpace();
  if(ok){
    toast(nPhotos?('Idée + '+nPhotos+' photo'+(nPhotos>1?'s':'')+' envoyées à Michel ✅'):'Idée envoyée à Michel ✅','success');
  }else{
    // Repli : mail texte si le serveur est injoignable (au moins l'idée part)
    _testerIdeaMailto('💡 Idée Force Tracker — '+who,'Idée de '+who+' ('+(S.email||'')+') :\n\n'+(txt||'(voir photos)')+'\n\n— boîte à idées Force Tracker',nPhotos);
    toast('Serveur injoignable — idée envoyée par mail (texte)','info');
  }
}
// Partage optionnel des photos/captures (bouton séparé) — l'utilisateur choisit Mail/Messages.
function shareTesterPhotos(){
  if(!_testerIdeaFiles.length){toast('Ajoute d’abord une photo 🙂','info');return;}
  const who=(S.name||'Testeur');
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:_testerIdeaFiles})){
    navigator.share({files:_testerIdeaFiles.slice(),title:'💡 Photos idée Force Tracker — '+who,text:'Photos pour Michel (Force Tracker)'})
      .then(()=>{ _testerIdeaFiles=[]; _renderTesterSpace(); toast('Photos partagées ✅','success'); })
      .catch(err=>{ if(!(err&&err.name==='AbortError'))toast('Partage impossible sur cet appareil','error'); });
  } else { toast('Le partage de photos n’est pas dispo sur cet appareil','info'); }
}
function _testerIdeaMailto(subject,bodyM,nPhotos){
  let b=bodyM; if(nPhotos)b+='\n\n('+nPhotos+' photo'+(nPhotos>1?'s':'')+' à joindre depuis ta galerie)';
  const mail='mailto:'+TESTER_FEEDBACK_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(b);
  try{window.location.href=mail;}catch(e){}
}

// ─── DÉDICACE ANNIVERSAIRE — Eline (2 juillet) ───────────────
let _bdayCandlesLeft=19;
const _bdayCandles=[];

function checkBirthdayDedication(){
  if(!S.email||S.email.toLowerCase()!=='elineazs32@gmail.com')return;
  if(localStorage.getItem('ft4_bday_eline_2026'))return;
  const now=new Date();
  const m=now.getMonth()+1,d=now.getDate();
  // Fenêtre : 2–5 juillet (jour J + 3 jours de rattrapage si app pas ouverte le jour J)
  if(!(m===7&&d>=2&&d<=5))return;
  setTimeout(showBirthdayScreen,600);
}

function showBirthdayScreen(){
  const el=document.getElementById('ov-bday');
  if(!el)return;
  el.style.display='block';
  el.style.opacity='0';
  el.style.transition='opacity .7s ease';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity='1';}));
  _spawnBdayParticles();
  _initBdayCandles();
}

function closeBirthdayScreen(){
  const btn=document.getElementById('bday-btn');
  if(btn&&btn.disabled)return; // bouton verrouillé = bougies pas encore toutes soufflées
  localStorage.setItem('ft4_bday_eline_2026','1');
  const el=document.getElementById('ov-bday');
  if(!el)return;
  el.style.transition='opacity .5s ease';
  el.style.opacity='0';
  setTimeout(()=>{el.style.display='none';},530);
}

function _spawnBdayParticles(){
  const c=document.getElementById('bday-particles');
  if(!c)return;
  c.innerHTML='';
  // Étoiles scintillantes
  for(let i=0;i<55;i++){
    const s=document.createElement('div');
    const sz=1+Math.random()*2.5;
    s.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:#fff;border-radius:50%;'
      +'left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;'
      +'animation:bday-twinkle '+(1.2+Math.random()*2.4)+'s '+(Math.random()*2.5)+'s ease-in-out infinite;';
    c.appendChild(s);
  }
  // Confettis qui tombent
  const cols=['#ffd700','#ff6b9d','#00d4ff','#7bed9f','#ff4757','#a29bfe','#ff9f43','#fff','#fd79a8'];
  for(let i=0;i<65;i++){
    const cf=document.createElement('div');
    const w=5+Math.random()*8,h=w*(0.3+Math.random()*.35);
    cf.style.cssText='position:absolute;width:'+w+'px;height:'+h+'px;'
      +'background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:2px;'
      +'left:'+Math.random()*100+'%;top:-20px;'
      +'animation:bday-fall '+(3.5+Math.random()*4.5)+'s '+(Math.random()*4)+'s linear infinite;'
      +'transform:rotate('+Math.floor(Math.random()*360)+'deg);opacity:'+(0.55+Math.random()*0.45)+';';
    c.appendChild(cf);
  }
  // Ballons qui montent
  const emojis=['🎈','🎈','🎈','🎀','🎊','🎉'];
  for(let i=0;i<6;i++){
    const b=document.createElement('div');
    b.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    b.style.cssText='position:absolute;font-size:'+(18+Math.random()*16)+'px;pointer-events:none;'
      +'left:'+(4+Math.random()*92)+'%;bottom:-60px;'
      +'animation:bday-rise '+(5+Math.random()*6)+'s '+(Math.random()*5)+'s ease-in infinite;';
    c.appendChild(b);
  }
}

function _initBdayCandles(){
  const container=document.getElementById('bday-candles');
  const sparkleZone=document.getElementById('bday-sparkle-zone');
  if(!container)return;
  container.innerHTML='';
  if(sparkleZone)sparkleZone.innerHTML='';
  _bdayCandlesLeft=19;
  _bdayCandles.length=0;
  const colors=['#ff6b6b','#ffd700','#74b9ff','#ff9f43','#7bed9f','#a29bfe','#fd79a8','#fdcb6e','#55efc4','#fd79a8','#ffd700','#6c5ce7','#f9ca24','#00cec9','#e17055','#4bcffa','#f53b57','#0be881','#fd9644'];
  for(let i=0;i<19;i++){
    const wrap=document.createElement('div');
    wrap.className='bday-candle';
    wrap.dataset.idx=String(i);
    wrap.style.cssText='position:relative;flex:1;max-width:14px;display:flex;flex-direction:column;align-items:center;';
    // Flamme
    const flame=document.createElement('div');
    flame.className='bday-flame';
    const dur=(0.28+Math.random()*.32).toFixed(2),del=(Math.random()*.5).toFixed(2);
    flame.style.cssText='width:10px;height:16px;flex-shrink:0;border-radius:50% 50% 35% 35%;'
      +'background:radial-gradient(ellipse at bottom,#fffbe0 0%,#ffe566 28%,#ff9900 65%,rgba(255,60,0,.1) 100%);'
      +'box-shadow:0 0 7px 2px rgba(255,190,0,.55);'
      +'animation:bday-flicker '+dur+'s '+del+'s ease-in-out infinite alternate;';
    // Corps de la bougie
    const body=document.createElement('div');
    const h=38+Math.round(Math.random()*18);
    body.style.cssText='width:8px;height:'+h+'px;flex-shrink:0;border-radius:3px 3px 2px 2px;'
      +'background:linear-gradient(to right,'+colors[i]+'cc,'+colors[i]+','+colors[i]+'cc);';
    // Fumée (cachée tant que la bougie est allumée)
    const smoke=document.createElement('div');
    smoke.className='bday-smoke-el';
    smoke.style.cssText='position:absolute;top:-4px;left:50%;transform:translateX(-50%);'
      +'width:8px;height:24px;opacity:0;pointer-events:none;'
      +'background:radial-gradient(ellipse at bottom,rgba(200,200,200,.65) 0%,transparent 80%);border-radius:50%;';
    wrap.appendChild(flame);
    wrap.appendChild(body);
    wrap.appendChild(smoke);
    container.appendChild(wrap);
    // Étincelle dorée dans la zone au-dessus
    let sparkle=null;
    if(sparkleZone){
      sparkle=document.createElement('div');
      const sz=1.5+Math.random()*2.5;
      const pct=((i+0.5)/19*100).toFixed(1);
      sparkle.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:#ffd700;border-radius:50%;'
        +'left:'+pct+'%;top:'+(8+Math.random()*72)+'%;pointer-events:none;'
        +'animation:bday-sparkle '+(0.4+Math.random()*.7)+'s '+(Math.random()*.5)+'s ease-in-out infinite;';
      sparkleZone.appendChild(sparkle);
    }
    _bdayCandles.push({wrap,flame,smoke,sparkle,lit:true});
  }
}

// Détection du passage du doigt sur les bougies
function _bdayTouch(e){
  e.preventDefault();
  const touches=e.changedTouches||e.touches;
  for(let i=0;i<touches.length;i++){
    const t=touches[i];
    let el=document.elementFromPoint(t.clientX,t.clientY);
    // Remonter jusqu'au conteneur .bday-candle
    while(el&&!el.classList.contains('bday-candle'))el=el.parentElement;
    if(!el||!el.classList.contains('bday-candle'))continue;
    const idx=parseInt(el.dataset.idx);
    if(isNaN(idx)||idx<0||idx>=_bdayCandles.length||!_bdayCandles[idx].lit)continue;
    _blowCandle(idx);
  }
}

function _blowCandle(idx){
  const c=_bdayCandles[idx];
  if(!c||!c.lit)return;
  c.lit=false;
  c.flame.style.display='none';
  if(c.sparkle)c.sparkle.style.display='none';
  c.smoke.style.opacity='1';
  c.smoke.style.animation='bday-smoke 1.4s ease-out forwards';
  _bdayCandlesLeft--;
  if(navigator.vibrate)navigator.vibrate(18);
  const n=document.getElementById('bday-n');
  if(n)n.textContent=_bdayCandlesLeft;
  if(_bdayCandlesLeft===0){
    const instr=document.getElementById('bday-instr-txt');
    if(instr)instr.textContent='✨ Bravo ! Toutes soufflées !';
    const nb=document.getElementById('bday-n');if(nb)nb.style.display='none';
    const wrap=document.getElementById('bday-instr-wrap');if(wrap)wrap.style.color='#7bed9f';
    setTimeout(()=>{
      const btn=document.getElementById('bday-btn');
      if(!btn)return;
      btn.disabled=false;
      btn.style.cssText='width:100%;max-width:270px;padding:16px 20px;border:none;border-radius:50px;'
        +'background:linear-gradient(135deg,#FF2D55,#ff6b8a);color:#fff;font-size:15px;font-weight:800;'
        +'cursor:pointer;font-family:system-ui,sans-serif;touch-action:manipulation;letter-spacing:.02em;'
        +'box-shadow:0 6px 24px rgba(255,45,85,.4);animation:bday-btn-pop .5s cubic-bezier(.25,.46,.45,.94);'
        +'-webkit-tap-highlight-color:transparent;';
      btn.textContent='✨ Bravo ! Entrer dans l\'appli';
    },700);
  }
}

// _premiumPending : initialisé sur window dans <head> de index.html — accessible depuis coach.js sans TDZ
window._premiumPending=!!S.email;
// Ping silencieux — fire-and-forget (no-cors peut bloquer sur iOS Safari PWA)
(async function autoConnect(){
  if(!S.url)return;
  // Ping non-bloquant : n'attend pas la réponse pour continuer
  fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'test'})})
    .then(()=>{if(!S.connected){S.connected=true;persist();updatePill();}})
    .catch(()=>{});
  // Vérif premium + sync au démarrage — timeout 3s pour ne pas bloquer sur réseau faible
  if(S.email){
    try{
      const _ctrl=new AbortController();
      const _tId=setTimeout(()=>_ctrl.abort(),3000);
      const r2=await fetch(S.url,{method:'POST',redirect:'follow',signal:_ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email:S.email,authCode:_authCode()})});
      clearTimeout(_tId);
      const d2=await r2.json();
      console.log('[FT premium check]',{email:S.email,status:d2.status,premium:d2.premium,expiry:d2.premiumExpiry});
      if(d2.status==='ok'||d2.status==='not_found'){
        const wasPremium=S.premium;
        S.premium=d2.premium===true;
        S.premiumExpiry=d2.premiumExpiry||'';
        if(d2.profile&&d2.profile.emailVerified)S.emailVerified=true; // confirmé côté cloud
        persist();
        try{if(typeof _renderEmailVerifyCard==='function')_renderEmailVerifyCard();}catch(e){}
        window._premiumPending=false;
        updateCoachHeader();
        if(S.premium&&!wasPremium){
          toast('🎉 Accès Premium activé !','success');
          const wall=document.getElementById('coach-wall');
          if(wall)wall.style.display='none';
        }
        // Mur différé : si non-premium confirmé et quota dépassé, afficher maintenant
        if(!S.premium&&(S.coachFree||0)>=COACH_FREE_LIMIT){
          if(typeof showPremiumWall==='function')showPremiumWall();
        }
        console.log('[FT premium]',S.premium?'activé':'désactivé','(was:',wasPremium,')');
        // Auto-restauration silencieuse — local-first : ne pull que si local VRAIMENT vide
        // (sessions + prs + programmes tous à 0 → purge totale confirmée)
        const _localEmpty=(!S.sessions||S.sessions.length===0)&&(!S.prs||!Object.keys(S.prs).length)&&(!S.programmes||S.programmes.length===0);
        if(d2.status==='ok'&&d2.sessions&&d2.sessions.length>0&&_localEmpty){
          console.log('[FT auto-restore] local vide, cloud a',d2.sessions.length,'séances — restauration');
          _applyRestoreData(d2);_saveEmailRedundant(S.email);
          toast('✅ Données resynchronisées','success');
          try{renderHome();}catch(e){}try{if(typeof renderSetup==='function')renderSetup();}catch(e){}
        }
        // Réseau disponible → tenter la resynchro des séances en attente
        if(typeof _retrySheetQueue==='function')setTimeout(_retrySheetQueue,1500);
      }else{window._premiumPending=false;}
    }catch(e){
      console.warn('[FT premium check] échec réseau (timeout ou panne):',e.message);
      window._premiumPending=false;
      checkPremiumExpiry();
      // En cas d'erreur réseau : si l'état local dit non-premium et quota dépassé, afficher le mur
      if(!S.premium&&(S.coachFree||0)>=COACH_FREE_LIMIT){
        if(typeof showPremiumWall==='function')showPremiumWall();
      }
    }
  } else {
    window._premiumPending=false;
    checkPremiumExpiry();
  }
})();
// Fallback IDB — si localStorage ET cookie vidés mais IDB survit (iOS purge complète localstorage/cookie)
(async function _autoRestoreFromIDB(){
  if(window.__FT_CLONE__)return; // clone de test : jamais hériter de l'identité/données de la prod (cookie + IDB partagés par origine)
  if(S.email||(S.sessions&&S.sessions.length>0))return; // email dispo ou données intactes
  const email=await _getEmailFromIDB();
  if(!email){
    // Aucun email nulle part — montrer overlay reconnect si on sait qu'il y avait des données
    const hadData=document.cookie.includes('ft_had_data=1')||localStorage.getItem('ft4_had_data')==='1';
    if(hadData)setTimeout(_showReconnectOverlay,600);
    return;
  }
  console.log('[FT auto-restore] email récupéré depuis IDB:',email);
  localStorage.setItem('ft4_email',email);S.email=email;
  const ok=await _silentCloudRestore(email);
  if(!ok){const hadData=document.cookie.includes('ft_had_data=1');if(hadData)_showReconnectOverlay();}
})();
document.addEventListener('pointerdown',function(e){
  const btn=e.target.closest('button');
  if(!btn||btn.disabled)return;
  const r=btn.getBoundingClientRect();
  const w=document.createElement('span');
  w.className='btn-ripple';
  w.style.left=(e.clientX-r.left)+'px';
  w.style.top=(e.clientY-r.top)+'px';
  btn.appendChild(w);
  setTimeout(()=>w.remove(),520);
});

// ─── ORIENTATION ─────────────────────────────────────────────
if(screen.orientation&&screen.orientation.lock){screen.orientation.lock('portrait').catch(()=>{});}

// ─── GESTIONNAIRE D'ERREURS GLOBAL ───────────────────────────
window.addEventListener('error',e=>{
  // Ignore les erreurs d'assets externes (images, scripts tiers)
  if(e.filename&&!e.filename.includes(location.hostname))return;
  console.error('[FT] Erreur JS non rattrapée:',e.message,'@',e.filename,e.lineno);
  if(typeof toast==='function')toast('Erreur — si l\'appli ne répond plus, rechargez la page','error');
});
window.addEventListener('unhandledrejection',e=>{
  console.error('[FT] Promise rejetée:',e.reason);
});

// ─── SERVICE WORKER ──────────────────────────────────────────
// Ne jamais recharger l'appli en pleine séance (perte de saisie / interruption d'un superset).
// Si une séance est en cours, on reporte le rechargement — persist() (state.js) le déclenchera
// dès que S.wkt redevient vide (fin de séance ou annulation).
window._swReloadPending=false;
function _reloadForUpdate(){
  const _wktActive=!!(S.wkt&&S.wkt.exs&&S.wkt.exs.length);
  if(_wktActive){
    window._swReloadPending=true;
    if(typeof toast==='function')toast('Mise à jour disponible — appliquée à la fin de la séance','info');
  }else{
    try{localStorage.setItem('ft4_just_updated','1');}catch(e){} // → badge « Application mise à jour » au reboot
    window.location.reload();
  }
}
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    // updateViaCache:'none' → le navigateur NE met JAMAIS le fichier sw.js en cache HTTP
    // pour les vérifs de mise à jour. Corrige le bug iOS « app collée à l'ancienne version »
    // (GitHub Pages cachait sw.js ~10 min → les updates n'étaient pas détectées tout de suite).
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
      if(!reg)return; // garde-fou : certains contextes résolvent sans registration
      reg.update(); // vérification immédiate au démarrage (PWA standalone inclus)
      setInterval(()=>reg.update(), 5*60*1000); // re-vérif toutes les 5 min
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='visible')reg.update();
      });
      window.addEventListener('online',()=>{
        reg.update(); // vérifie si nouveau SW disponible
        // Retour réseau → retry des séances non synchronisées (délai 1s pour stabilisation)
        setTimeout(()=>{if(typeof _retrySheetQueue==='function')_retrySheetQueue();},1000);
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange',_reloadForUpdate);
    navigator.serviceWorker.addEventListener('message',e=>{
      if(!e.data)return;
      if(e.data.type==='SW_UPDATED')_reloadForUpdate();
      else if(e.data.type==='PRECACHE_PROGRESS')_showInstallProgress(e.data.done,e.data.total);
      else if(e.data.type==='PRECACHE_DONE')_hideInstallProgress();
    });
    // Auto-réparation : si le cache a été vidé (bouton, vidage navigateur, ou iOS qui purge
    // tout seul sous pression mémoire), on redemande au SW de réinstaller les figurines.
    navigator.serviceWorker.ready.then(reg=>{
      if(reg&&reg.active)reg.active.postMessage({type:'ENSURE_PRECACHE'});
    }).catch(()=>{});
  });
}
// Demande au Service Worker de réinstaller tous les fichiers (figurines incluses)
function _reprecacheSW(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.ready.then(reg=>{
    const sw=reg.active||navigator.serviceWorker.controller;
    if(sw)sw.postMessage({type:'REPRECACHE'});
  }).catch(()=>{});
}
// Affiche la place occupée par l'appli sur le téléphone (dans « À propos »)
function _fillStorageInfo(){
  const el=document.getElementById('_about-storage');if(!el)return;
  if(navigator.storage&&navigator.storage.estimate){
    navigator.storage.estimate().then(est=>{
      const mb=(est.usage||0)/1048576;
      el.textContent=mb>=1?mb.toFixed(0)+' Mo':Math.max(1,Math.round((est.usage||0)/1024))+' Ko';
    }).catch(()=>{el.textContent='—';});
  } else { el.textContent='—'; }
}
// Vide le cache des fichiers de l'appli (PAS les données) puis réinstalle les figurines
function clearAppCache(){
  const go=async()=>{
    try{
      if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); }
    }catch(e){}
    // Relance la réinstallation → la barre de progression réapparaît via les messages SW
    _reprecacheSW();
    if(typeof toast==='function')toast('Cache vidé — réinstallation des figurines…','info');
    setTimeout(_fillStorageInfo,1500);
  };
  if(typeof showConfirm==='function'){
    showConfirm('Vider le cache ?','Ça libère de la place et réinstalle les figurines. Tes séances, records et réglages ne sont PAS touchés.',go);
  } else go();
}
// Barre d'installation : se remplit pendant que le Service Worker met les fichiers en cache (1re visite / mise à jour)
function _showInstallProgress(done,total){
  if(!total)return;
  const pct=Math.max(1,Math.round(done/total*100));
  let el=document.getElementById('install-progress');
  if(!el){
    el=document.createElement('div');el.id='install-progress';
    el.innerHTML='<div class="ip-label">📦 Installation de l\'appli… <span id="ip-pct">0%</span></div><div class="ip-track"><div id="ip-bar" class="ip-bar"></div></div>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
  }
  const bar=document.getElementById('ip-bar');if(bar)bar.style.width=pct+'%';
  const p=document.getElementById('ip-pct');if(p)p.textContent=pct+'%';
}
function _hideInstallProgress(){
  const el=document.getElementById('install-progress');if(!el)return;
  const bar=document.getElementById('ip-bar');if(bar)bar.style.width='100%';
  const p=document.getElementById('ip-pct');if(p)p.textContent='100%';
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{if(el.parentNode)el.remove();},400);},600);
}

// ─── POSITION FAB ────────────────────────────────────────────
function _positionFab(){
  const seance=document.getElementById('nb-log');
  const fab=document.getElementById('fab-session');
  if(!seance||!fab)return;
  const nr=seance.closest('nav').getBoundingClientRect();
  const sr=seance.getBoundingClientRect();
  if(!sr.width||!nr.width)return;
  const cx=sr.left-nr.left+sr.width/2+8;
  fab.style.left=cx+'px';
  fab.style.transform='translateX(-50%)';
}
// Appels multiples pour garantir un layout stable sur iOS PWA
document.addEventListener('DOMContentLoaded',_positionFab);
window.addEventListener('load',_positionFab);
window.addEventListener('load',()=>{setTimeout(_positionFab,300);});
window.addEventListener('resize',_positionFab);

