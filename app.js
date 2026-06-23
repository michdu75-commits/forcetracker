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
  S.wkt.cardio[field]=field==='duration'?Math.max(0,Math.min(120,parseInt(val)||0)):val;
  persist();renderCardioBlock();
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
  <div onclick="toggleCardio()" style="display:flex;align-items:center;gap:9px;padding:12px 16px;cursor:pointer;touch-action:manipulation;">
    <div style="width:32px;height:32px;border-radius:9px;background:rgba(255,138,114,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M10 12L8 20"/><path d="M10 12L13 17L16 12"/><path d="M6 12L8 10L12 12L16 10L18 12"/></svg></div>
    <span style="font-weight:700;font-size:13px;flex:1;color:var(--t1);">Cardio</span>
    <span style="font-size:12px;color:${kcal?'var(--green)':'var(--t3)'};">${summary}</span>
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
        <input type="number" inputmode="numeric" min="0" max="300" value="${c.duration||0}" oninput="setCardioField('duration',this.value)" style="width:52px;padding:5px 8px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:14px;font-weight:700;font-family:var(--font);text-align:center;">
        <span style="font-size:12px;color:var(--t3);">min</span>
      </div>
    </div>
  </div>`:''}
</div>`;
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


function switchNuTab(tab, btn) {
  ['macros','suppl'].forEach(t => {
    const el = document.getElementById('nu-' + t);
    if (el) el.style.display = t === tab ? 'flex' : 'none';
  });
  document.querySelectorAll('.nu-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'suppl') renderSupplements();
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
let _obStep=1,_obGender='H',_obGoal='muscle',_obDataRestored=false;
const _OB_GOALS={muscle:'ob-gm',perte:'ob-gp',force:'ob-gf',equilibre:'ob-ge',endurance:'ob-gen'};

function _initOb0(){
  if(_isStandalone())return;
  if(_isIOSInApp())return; // navigateur in-app → géré par le banner
  if(_isFirefoxAndroid())return; // pas de prompt disponible
  const isIOS=_isIOS();
  const ios=document.getElementById('ob0-ios');
  const android=document.getElementById('ob0-android');
  if(ios)ios.style.display=isIOS?'flex':'none';
  if(android)android.style.display=isIOS?'none':'flex';
  const ob1=document.getElementById('ob-1');
  if(ob1)ob1.classList.remove('ob-active');
  const ob0=document.getElementById('ob-0');
  if(ob0)ob0.classList.add('ob-active');
  _obStep=0;
  for(let i=1;i<=4;i++){const d=document.getElementById('od-'+i);if(d)d.classList.remove('ob-active');}
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
  const emailInp=document.getElementById('ob-email');
  if(emailInp){emailInp.setAttribute('enterkeyhint','done');emailInp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();obDoRestore();}});}
  // step 3 : prénom → age → taille → poids en chaîne
  const ob3=[['ob-name','ob-age'],['ob-age','ob-ht'],['ob-ht','ob-bw'],['ob-bw',null]];
  ob3.forEach(([id,nextId])=>{
    const inp=document.getElementById(id);
    if(!inp)return;
    inp.setAttribute('enterkeyhint',nextId?'next':'done');
    inp.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      e.preventDefault();
      if(nextId){const n=document.getElementById(nextId);if(n){n.focus();n.select&&n.select();}}
      else obNext(4);
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
  // ob-0 → pas de dot actif, ob-1 → dot1, ob-3 → dot2, ob-4 → dot3, ob-5 → dot4
  const dotMap={1:1,3:2,4:3,5:4};
  const dotNum=dotMap[step]||0;
  for(let i=1;i<=4;i++){const d=document.getElementById('od-'+i);if(d)d.classList.toggle('ob-active',dotNum>0&&i===dotNum);}
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
  if(S.email&&S.url){
    const p={action:'saveProfile',email:S.email,name:S.name,bw:S.bw,age:S.age,height:S.height,gender:S.gender,goal:S.goal,activityLevel:S.activityLevel,workType:S.workType,smoker:S.smoker,neck:S.neck,waist:S.waist,hip:S.hip,nutritionPhase:S.nutritionPhase,barW:S.barW,defRest:S.defRest,mensCycleStart:S.mensCycleStart,mensCycleDur:S.mensCycleDur,contraception:S.contraception||'',customExercises:S.customExercises};
    if(!_obDataRestored)p.welcome=true;
    fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).catch(()=>{});
  }
  localStorage.setItem('ft4_ob2','1');
  document.documentElement.classList.add('ob-done');
  const ob=document.getElementById('onboarding');
  if(ob){ob.style.transition='opacity .4s';ob.style.opacity='0';setTimeout(()=>{ob.style.display='none';ob.style.opacity='';ob.style.transition='';},400);}
  renderHome();renderNutrition();renderSetup();
  setTimeout(showInstallPrompt,1400);
}

// ─── PWA INSTALL ─────────────────────────────────────────────
function _isStandalone(){return window.matchMedia('(display-mode:standalone)').matches||!!navigator.standalone;}
function _isIOS(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)&&!window.MSStream;}
function _isIOSInApp(){
  if(!_isIOS()) return false;
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
  if(_isIOS()){
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
let _adminTaps=0,_adminTimer=null,_adminMode=false;
function onLogoTap(){
  _adminTaps++;
  clearTimeout(_adminTimer);
  if(_adminTaps>=5){
    _adminTaps=0;
    _adminMode=!_adminMode;
    const bar=document.getElementById('setup-tabs-bar');
    if(bar)bar.style.display=_adminMode?'flex':'none';
    if(_adminMode){
      if(!S.email){S.email='michdu75@gmail.com';persist();}
      const eInp=document.getElementById('email-inp');
      if(eInp)eInp.value=S.email||'michdu75@gmail.com';
      goScreen('setup',document.getElementById('nb-setup'));
      switchSetupTab('connexion',document.getElementById('stab-connexion'));
    }else{
      switchSetupTab('profil',document.getElementById('stab-profil'));
    }
    toast(_adminMode?'🔧 Mode admin activé':'Mode admin désactivé','info');
    return;
  }
  _adminTimer=setTimeout(()=>{_adminTaps=0;},1500);
}

function switchSetupTab(tab,btn){
  const cx=document.getElementById('setup-connexion');
  const pr=document.getElementById('setup-profil');
  if(tab==='connexion'){
    if(pr)pr.style.display='none';
    if(cx){cx.style.display='flex';cx.style.flexDirection='column';cx.style.gap='12px';}
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
    default:return false;
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
    return `<div class="badge-card ${unlocked?'unlocked':'locked'}">
      ${unlocked?'<div class="badge-glow"></div>':''}
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      ${d?`<div class="badge-date">${fmtD(d)}</div>`:''}
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
  const totalVol=lastWeekSess.reduce((a,s)=>a+(s.volume||0),0);
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

// ─── INIT ────────────────────────────────────────────────────
load();
document.getElementById('tb-date').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
applyTheme();
filterEx();
goScreen('home', document.getElementById('nb-home'));
checkBadges(true); // check silencieux au démarrage
checkWeeklySummary(); // résumé lundi matin
initCoachInput();
initOnboarding();
// Ping silencieux — mode no-cors car la redirection AS strip Origin sur le ping
(async function autoConnect(){
  if(!S.url)return;
  try{
    // no-cors : réponse opaque (status 0) mais aucune erreur console CORS
    await fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'test'})});
    if(!S.connected){S.connected=true;persist();updatePill();}
  }catch(e){}
  // Vérif premium : si email connu ET (pas premium OU premium daté) → refresh serveur
  if(S.email&&(!S.premium||S.premiumExpiry)){
    try{
      const r2=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email:S.email})});
      const d2=await r2.json();
      if(d2.status==='ok'||d2.status==='not_found'){
        const wasPremium=S.premium;
        S.premium=d2.premium===true;
        S.premiumExpiry=d2.premiumExpiry||'';
        if(wasPremium!==S.premium||d2.premiumExpiry){persist();updateCoachHeader();}
      }
    }catch(e){
      checkPremiumExpiry(); // fallback local si réseau indisponible
    }
  } else {
    checkPremiumExpiry(); // vérif locale si premium indéfini
  }
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

// ─── SERVICE WORKER ──────────────────────────────────────────
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js');
    navigator.serviceWorker.addEventListener('controllerchange',()=>window.location.reload());
    navigator.serviceWorker.addEventListener('message',e=>{
      if(e.data&&e.data.type==='SW_UPDATED')window.location.reload();
    });
  });
}

