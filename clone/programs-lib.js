// ─── Bibliothèque de programmes de FORCE reconnus (powerlifting) ─────────────
// Programmes éprouvés et documentés. L'app calcule les charges depuis les 1RM
// de l'utilisateur (S.prs) puis génère un programme normal (S.programmes) —
// chargeable/éditable/PDF comme les autres. 100% client, 0 token, 0 backend.
//
// Chaque set porté par un programme de la biblio a un poids PRESCRIT (calculé) :
// le programme généré est marqué prescribed:true → loadProgDay utilise ce poids
// (et non la séance précédente).

// Lifts de référence (noms EXLIB exacts)
const PG_SQUAT='Squat à la Barre', PG_BENCH='Développé Couché',
      PG_DEAD='Soulevé de Terre', PG_PRESS='Développé Militaire';

function _pgRound(kg){return Math.round((kg||0)/2.5)*2.5;}
function _pgShort(lift){return lift===PG_SQUAT?'Squat':lift===PG_BENCH?'Couché':lift===PG_DEAD?'ST':lift===PG_PRESS?'Militaire':lift;}
// set prescrit : {kg, reps, type, rest, note}
function _pgSet(kg,reps,o){o=o||{};return {kg:_pgRound(kg),reps:reps,type:o.type||'N',rest:o.rest||0,note:o.note||''};}
// 1RM par défaut à partir du poids de corps si aucun PR (ratios prudents débutant)
function _pgDefaults(){
  const bw=S.bw||75;
  return {squat:_pgRound(bw*1.0), bench:_pgRound(bw*0.75), dead:_pgRound(bw*1.2), press:_pgRound(bw*0.5)};
}
// Lit les 1RM connus (S.prs) sinon défauts
function _pgUser1RM(){
  const d=_pgDefaults();
  const g=(name,def)=>{const p=S.prs&&S.prs[name];return (p&&p.rm1)?_pgRound(p.rm1):def;};
  return {squat:g(PG_SQUAT,d.squat), bench:g(PG_BENCH,d.bench), dead:g(PG_DEAD,d.dead), press:g(PG_PRESS,d.press)};
}

// ─── 5/3/1 Boring But Big (Jim Wendler) ──────────────────────────────────────
const _W531=[
  {lbl:'S1',        sets:[[0.65,5,0],[0.75,5,0],[0.85,5,1]]},   // le 3e = AMRAP (5+)
  {lbl:'S2',        sets:[[0.70,3,0],[0.80,3,0],[0.90,3,1]]},
  {lbl:'S3',        sets:[[0.75,5,0],[0.85,3,0],[0.95,1,1]]},
  {lbl:'S4 décharge',sets:[[0.40,5,0],[0.50,5,0],[0.60,5,0]]},
];
function _build531(rm){
  const days=[];
  // Accessoire léger (poids libre au choix) : n séries × reps
  const A=(name,n,reps,rest)=>({name,sets:Array.from({length:n},()=>_pgSet(0,reps,{rest:rest||60}))});
  // Assistance par jour = tirer + bras/épaules + gainage (esprit 5/3/1 : push/pull/core)
  const plan=[
    {lift:PG_PRESS,rm:rm.press,assist:[A('Tirage Poulie Haute',4,10,90),A('Élévations Latérales Machine',3,15),A('Crunch Machine',3,15)]},
    {lift:PG_DEAD, rm:rm.dead, assist:[A('Leg Curl Assis Machine',4,10,90),A('Superman',3,12),A('Gainage',3,40)]},
    {lift:PG_BENCH,rm:rm.bench,assist:[A('Rowing Barre',4,10,90),A('Dips Parallèles',3,12),A('Curl Haltères',3,12)]},
    {lift:PG_SQUAT,rm:rm.squat,assist:[A('Leg Curl Assis Machine',4,10,90),A('Extension Quadriceps (Leg Extension)',3,15),A('Crunch Machine',3,15)]},
  ];
  _W531.forEach((wk,wi)=>{
    const deload=(wi===3);
    plan.forEach(L=>{
      const tm=(L.rm||0)*0.9; // Training Max = 90% du 1RM
      const mainSets=wk.sets.map(([p,r,amrap])=>_pgSet(tm*p,r,{
        rest: deload?90:180,
        note: Math.round(p*100)+'% TM'+(amrap?' · MAX de reps (min '+r+')':'')
      }));
      // BBB : 5×10 @ 50% TM sur le même lift (sauf semaine de décharge)
      if(!deload){for(let s=0;s<5;s++)mainSets.push(_pgSet(tm*0.5,10,{rest:90,note:'BBB 50% TM · volume'}));}
      const exs=[{name:L.lift,note:deload?'Décharge — léger':'Force (5/3/1) puis volume (BBB 5×10)',sets:mainSets}];
      if(!deload)L.assist.forEach(a=>exs.push(a)); // pas d'assistance en semaine de décharge
      days.push({label:wk.lbl+' · '+_pgShort(L.lift),exs});
    });
  });
  return days;
}

// ─── Texas Method (intermédiaire, 3 j/sem) ───────────────────────────────────
function _buildTexas(rm){
  const V=0.80, L=0.62, I=0.90; // % du 1RM : Volume / Léger / Intensité
  const s5=(kg,n,note,rest)=>Array.from({length:n},()=>_pgSet(kg,5,{note:note||'',rest:rest||0}));
  const acc=(name,n,reps,rest)=>({name,sets:Array.from({length:n},()=>_pgSet(0,reps,{rest:rest||60}))});
  return [
    {label:'Lundi · Volume', exs:[
      {name:PG_SQUAT,note:'5×5 lourd — base de la semaine',sets:s5(rm.squat*V,5,'~80% · même poids les 5 séries',210)},
      {name:PG_BENCH,sets:s5(rm.bench*V,5,'~80%',180)},
      {name:PG_DEAD, sets:s5(rm.dead*V,1,'~80% · 1 série',0)},
      acc('Tirage Poulie Haute',3,10,90), acc('Gainage',3,40),
    ]},
    {label:'Mercredi · Léger (récup)', exs:[
      {name:PG_SQUAT,note:'Léger — récupération, technique',sets:s5(rm.squat*L,2,'~62% · facile',120)},
      {name:PG_PRESS,sets:s5(rm.press*V,3,'~80%',150)},
      acc('Tirage Poulie Haute',3,10,90), acc('Curl Haltères',3,12),
    ]},
    {label:'Vendredi · Intensité (PR)', exs:[
      {name:PG_SQUAT,note:'1×5 le plus lourd possible (nouveau record de série)',sets:[_pgSet(rm.squat*I,5,{note:'~90% · série record',rest:240})]},
      {name:PG_BENCH,sets:[_pgSet(rm.bench*(I-0.03),5,{note:'~87% · série record',rest:210})]},
      {name:PG_DEAD, sets:[_pgSet(rm.dead*(I-0.03),3,{note:'~87% · 1×3 lourd',rest:0})]},
      acc('Crunch Machine',3,15,60),
    ]},
  ];
}

// ─── Starting Strength (débutant, linéaire A/B) ──────────────────────────────
function _buildSS(rm){
  const w=0.80; // point de départ prudent (~5RM), on ajoute du poids CHAQUE séance
  const x=(kg,n,reps,note,rest)=>Array.from({length:n},()=>_pgSet(kg,reps,{note:note||'',rest:rest||0}));
  return [
    {label:'Séance A', exs:[
      {name:PG_SQUAT,note:'+2,5 à 5 kg à CHAQUE séance tant que les 3×5 passent',sets:x(rm.squat*w,3,5,'3×5 · ajoute du poids chaque séance',180)},
      {name:PG_BENCH,sets:x(rm.bench*w,3,5,'3×5',180)},
      {name:PG_DEAD, sets:x(rm.dead*0.85,1,5,'1×5 lourd',0)},
    ]},
    {label:'Séance B', exs:[
      {name:PG_SQUAT,note:'+2,5 à 5 kg à CHAQUE séance',sets:x(rm.squat*w,3,5,'3×5 · ajoute du poids chaque séance',180)},
      {name:PG_PRESS,sets:x(rm.press*w,3,5,'3×5',180)},
      {name:PG_DEAD, sets:x(rm.dead*0.85,1,5,'1×5 lourd',0)},
    ]},
  ];
}

// ─── Powerbuilding (force + muscu) — Haut/Bas, 4 jours ───────────────────────
// Chaque séance : 1 MOUVEMENT DE FORCE lourd (calculé sur le 1RM) PUIS du
// volume hypertrophie (musculation). Le pont entre force athlé et muscu.
function _buildPowerbuilding(rm){
  const A=(name,n,reps,rest)=>({name,sets:Array.from({length:n},()=>_pgSet(0,reps,{rest:rest||75}))});
  const F=(lift,rmv,pct,n,reps,rest)=>({name:lift,note:'FORCE — lourd et contrôlé',sets:Array.from({length:n},()=>_pgSet(rmv*pct,reps,{note:Math.round(pct*100)+'% · force',rest:rest||180}))});
  return [
    {label:'J1 · Bas — Squat force + jambes',note:'Force puis volume (bas du corps)',exs:[
      F(PG_SQUAT,rm.squat,0.80,4,5,210),
      A('Press Jambes 45°',4,10,120), A('Leg Curl Assis Machine',3,12),
      A('Extension Quadriceps (Leg Extension)',3,15), A('Élévations Mollets Debout',4,15,60),
      A('Gainage',3,45,60),
    ]},
    {label:'J2 · Haut poussée — Couché force + pecs/épaules',note:'Force puis volume (poussée)',exs:[
      F(PG_BENCH,rm.bench,0.80,4,5,180),
      A('Développé Incliné',3,10,120), A('Développé Militaire',3,10,120),
      A('Dips Parallèles',3,12), A('Élévations Latérales Machine',3,15,60), A('Triceps Poulie',3,12,60),
    ]},
    {label:'J3 · Bas — Soulevé force + chaîne postérieure',note:'Force puis volume (soulevé)',exs:[
      F(PG_DEAD,rm.dead,0.82,4,4,210),
      A('Soulevé de Terre Roumain Barre',3,8,150), A('Fentes',3,12),
      A('Leg Curl Assis Machine',3,12), A('Superman',3,12,60), A('Relevé de Jambes',3,15,60),
    ]},
    {label:'J4 · Haut tirage — Militaire force + dos/bras',note:'Force puis volume (tirage/épaules)',exs:[
      F(PG_PRESS,rm.press,0.78,4,5,150),
      A('Rowing Barre',4,8,120), A('Tirage Poulie Haute',4,10),
      A('Rowing Machine',3,12), A('Curl Barre',4,10,60), A('Crunch Machine',3,15,60),
    ]},
  ];
}

// ─── Catalogue ───────────────────────────────────────────────────────────────
const PROG_LIB=[
  {
    key:'powerbuilding', name:'Powerbuilding', author:'Force + Muscu', level:'Intermédiaire',
    days:4, freq:'4 séances / semaine (Haut/Bas)', duration:'Progression continue',
    tag:'Le meilleur des deux mondes : la FORCE des gros mouvements ET le MUSCLE.',
    lifts:[PG_SQUAT,PG_BENCH,PG_DEAD,PG_PRESS],
    desc:'Chaque séance commence par un mouvement de FORCE lourd (squat/couché/soulevé/militaire en 4-5 reps, calculé sur ton 1RM), PUIS du volume de musculation (8-15 reps) pour construire le muscle. Idéal si tu veux être fort ET musclé.',
    how:'Le mouvement de force est calculé depuis ton 1RM (~78-82%). Ajoute du poids quand les séries passent proprement. Le volume hypertrophie (accessoires) : charge « à la sensation », 8-15 reps propres, proche de l\'échec sur les dernières séries.',
    build:_buildPowerbuilding
  },
  {
    key:'ss', name:'Starting Strength', author:'Mark Rippetoe', level:'Débutant',
    days:3, freq:'3 séances / semaine (A-B-A puis B-A-B)', duration:'Linéaire (tant que ça progresse)',
    tag:'La référence pour prendre de la force vite quand on débute.',
    lifts:[PG_SQUAT,PG_BENCH,PG_DEAD,PG_PRESS],
    desc:'Programme linéaire : on ajoute du poids à CHAQUE séance. Deux séances (A et B) qu\'on alterne, 3 fois par semaine. Squat à toutes les séances, développé couché et militaire en alternance, soulevé de terre pour le dos.',
    how:'Départ prudent (~80% de ton 1RM). Ajoute 2,5 kg (haut du corps) à 5 kg (squat/soulevé) à chaque séance tant que tu réussis tes 3×5. Quand tu bloques : baisse de 10% et remonte.',
    build:_buildSS
  },
  {
    key:'texas', name:'Texas Method', author:'Mark Rippetoe / Glenn Pendlay', level:'Intermédiaire',
    days:3, freq:'3 séances / semaine (Volume · Léger · Intensité)', duration:'Progression hebdomadaire',
    tag:'Le classique intermédiaire quand la progression séance par séance s\'arrête.',
    lifts:[PG_SQUAT,PG_BENCH,PG_DEAD,PG_PRESS],
    desc:'Progression sur la SEMAINE (plus séance par séance). Lundi = gros volume (5×5), mercredi = léger (récupération), vendredi = série record (PR).',
    how:'Charges calculées depuis tes 1RM (Volume ~80%, Léger ~62%, Intensité ~90%). Chaque semaine, ajoute ~2,5 kg au 5×5 du lundi et à la série record du vendredi.',
    build:_buildTexas
  },
  {
    key:'531bbb', name:'5/3/1 Boring But Big', author:'Jim Wendler', level:'Intermédiaire',
    days:4, freq:'4 séances / semaine · cycle de 4 semaines', duration:'Cycle de 4 semaines (répétable)',
    tag:'Le programme de force le plus utilisé au monde — force + gros volume.',
    lifts:[PG_SQUAT,PG_BENCH,PG_DEAD,PG_PRESS],
    desc:'Un gros mouvement par séance (Militaire · Soulevé · Couché · Squat). Cycle de 4 semaines basé sur le « Training Max » (90% de ton 1RM). Chaque semaine monte en intensité, la 4e est une décharge. « Boring But Big » = 5×10 en volume après la force.',
    how:'Training Max = 90% de ton 1RM. Sem 1 : 65/75/85% · Sem 2 : 70/80/90% · Sem 3 : 75/85/95% (dernière série = MAX de reps) · Sem 4 : décharge. Puis BBB 5×10 à 50% du TM. À la fin du cycle : +2,5 kg (haut) / +5 kg (bas) au Training Max.',
    build:_build531
  },
];

// ─── UI : catalogue + détail + génération ────────────────────────────────────
let _pgView='list', _pgSelKey=null;
function _pgFind(key){return PROG_LIB.find(p=>p.key===key);}
function openProgLib(){
  _pgView='list';_pgSelKey=null;
  let el=document.getElementById('ov-prog-lib');
  if(!el){el=document.createElement('div');el.id='ov-prog-lib';el.className='overlay';el.style.zIndex='400';
    document.body.appendChild(el);} // pas de fermeture au tap sur le fond (le pinch-zoom/scroll la fermait) → on ferme par la croix ✕
  _renderProgLib();el.classList.add('open');
}
function closeProgLib(){const el=document.getElementById('ov-prog-lib');if(el)el.classList.remove('open');}
function _pgHdr(title,back){
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">'
    +(back?'<button onclick="'+back+'" style="width:32px;height:32px;border-radius:9px;border:none;background:var(--bg3);color:var(--t1);font-size:17px;cursor:pointer;flex-shrink:0;">‹</button>':'')
    +'<div style="font-weight:800;font-size:18px;color:var(--t1);flex:1;">'+title+'</div>'
    +'<button onclick="closeProgLib()" style="width:32px;height:32px;border-radius:50%;border:none;background:var(--bg3);color:var(--t2);font-size:15px;cursor:pointer;flex-shrink:0;">✕</button>'
    +'</div>';
}
function _renderProgLib(){
  const el=document.getElementById('ov-prog-lib');if(!el)return;
  if(_pgView==='list'){
    el.innerHTML='<div class="pglib-sheet">'
      +_pgHdr('📚 Programmes de force')
      +'<div style="font-size:13px;color:var(--t3);line-height:1.5;margin-bottom:12px;">Des programmes reconnus et éprouvés. L\'app calcule tes charges à partir de tes 1RM. Choisis-en un pour voir le détail.</div>'
      +(S.trainingProfile
        ?'<div onclick="openTrainQuiz()" class="ft-press" style="background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.3);border-radius:12px;padding:10px 12px;margin-bottom:14px;cursor:pointer;"><div style="font-weight:800;font-size:12.5px;color:#34c759;">🎯 Programmes adaptés à toi <span style="float:right;color:var(--blue);font-weight:700;">modifier ›</span></div><div style="font-size:12px;color:var(--t2);margin-top:2px;">'+_escNote(_pgAdaptSummary(S.trainingProfile))+'</div></div>'
        :'<div onclick="openTrainQuiz()" class="ft-press" style="background:rgba(91,168,255,.08);border:1px solid rgba(91,168,255,.3);border-radius:12px;padding:11px 12px;margin-bottom:14px;cursor:pointer;"><div style="font-weight:800;font-size:13px;color:var(--blue);">🧩 Adapte les programmes à ta vie ›</div><div style="font-size:12px;color:var(--t2);margin-top:2px;">5 questions (jours, durée, matériel, zones sensibles) → chaque programme ajusté à toi.</div></div>')
      // Programme Force Athlétique périodisé (compétition) — carte vedette
      +'<div class="pglib-card ft-press" onclick="openForceAthle()" style="background:linear-gradient(135deg,rgba(255,45,85,.12),rgba(255,45,85,.04));box-shadow:inset 0 0 0 1.5px rgba(255,45,85,.4);"><div style="display:flex;justify-content:space-between;align-items:start;gap:8px;"><div style="font-weight:800;font-size:16px;color:var(--t1);">🔴 Force Athlétique</div><span style="font-size:10.5px;font-weight:800;color:var(--red);border:1px solid var(--red);border-radius:20px;padding:2px 8px;white-space:nowrap;">Compétition</span></div><div style="font-size:12px;color:var(--t3);margin:3px 0 8px;">Programme périodisé — 3 blocs sur ~12 semaines</div><div style="font-size:13px;color:var(--t2);line-height:1.45;margin-bottom:8px;">Le vrai programme de compét : Accumulation → Force → Peak. Variantes, abdos/lombaires/cardio, rotation Sem A/B. Ce n\'est PAS de la muscu.</div><div style="font-size:11.5px;color:var(--t3);">🗓️ 4 à 5 séances / semaine</div><div style="text-align:right;margin-top:4px;font-size:12px;color:var(--red);font-weight:700;">Voir le programme ›</div></div>'
      +PROG_LIB.map(p=>{
        const badge={'Débutant':'#34D399','Intermédiaire':'var(--gold)','Avancé':'var(--red)'}[p.level]||'var(--t3)';
        return '<div class="pglib-card ft-press" onclick="openProgLibDetail(\''+p.key+'\')">'
          +'<div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">'
            +'<div style="font-weight:800;font-size:16px;color:var(--t1);">'+p.name+'</div>'
            +'<span style="font-size:10.5px;font-weight:800;color:'+badge+';border:1px solid '+badge+';border-radius:20px;padding:2px 8px;white-space:nowrap;">'+p.level+'</span>'
          +'</div>'
          +'<div style="font-size:12px;color:var(--t3);margin:3px 0 8px;">par '+p.author+'</div>'
          +'<div style="font-size:13px;color:var(--t2);line-height:1.45;margin-bottom:8px;">'+p.tag+'</div>'
          +'<div style="font-size:11.5px;color:var(--t3);">🗓️ '+p.freq+'</div>'
          +'<div style="text-align:right;margin-top:4px;font-size:12px;color:var(--red);font-weight:700;">Voir le programme ›</div>'
          +'</div>';
      }).join('')
      +'</div>';
  } else {
    const p=_pgFind(_pgSelKey);if(!p)return;
    const rm=_pgUser1RM();
    // font-size 16px : empêche le zoom automatique d'iPhone au focus (qui faisait « sauter »/fermer la fenêtre)
    const inp=(id,lbl,val)=>'<div style="min-width:0;"><div style="font-size:12px;color:var(--t3);margin-bottom:4px;">'+lbl+'</div>'
      +'<div style="display:flex;align-items:center;gap:4px;"><input id="'+id+'" type="number" inputmode="numeric" value="'+val+'" oninput="_pgRecalc()" style="flex:1;min-width:0;box-sizing:border-box;padding:12px 8px;border-radius:10px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:16px;text-align:center;font-family:var(--font);"><span style="font-size:12px;color:var(--t3);">kg</span></div></div>';
    el.innerHTML='<div class="pglib-sheet">'
      +_pgHdr(p.name,'backProgLib()')
      +'<div style="font-size:12px;color:var(--t3);margin:-6px 0 10px;">par '+p.author+' · '+p.level+' · '+p.freq+'</div>'
      +'<div class="pglib-block"><div style="font-size:13.5px;color:var(--t1);line-height:1.55;">'+p.desc+'</div></div>'
      +'<div class="pglib-block" style="background:rgba(234,179,8,.08);border-color:rgba(234,179,8,.3);"><div style="font-weight:800;font-size:13px;color:var(--gold);margin-bottom:5px;">📐 Comment ça marche</div><div style="font-size:13px;color:var(--t2);line-height:1.55;">'+p.how+'</div></div>'
      +'<div style="font-weight:800;font-size:14px;color:var(--t1);margin:14px 0 4px;">Tes 1RM (records)</div>'
      +'<div style="font-size:11.5px;color:var(--t3);margin-bottom:8px;">Vérifie/ajuste — les charges du programme en découlent. Pré-remplis depuis tes records (ou une estimation).</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">'
        +inp('pg-rm-squat','Squat',rm.squat)+inp('pg-rm-bench','Couché',rm.bench)+inp('pg-rm-dead','Soulevé',rm.dead)+inp('pg-rm-press','Militaire',rm.press)
      +'</div>'
      +'<div style="font-weight:800;font-size:14px;color:var(--t1);margin-bottom:8px;">Aperçu du programme</div>'
      +'<div id="pg-preview"></div>'
      +'<button onclick="addLibProgram()" style="width:100%;margin-top:16px;padding:14px;border-radius:13px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">➕ Ajouter à mes programmes</button>'
      +'<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:8px;line-height:1.4;">Il sera enregistré dans « Mes programmes » — chargeable en séance, modifiable, exportable en PDF.</div>'
      +'</div>';
    _pgRecalc();
  }
}
function openProgLibDetail(key){_pgView='detail';_pgSelKey=key;_renderProgLib();const el=document.getElementById('ov-prog-lib');if(el)el.scrollTop=0;}
function backProgLib(){_pgView='list';_renderProgLib();}
function _pgReadInputs(){
  const v=id=>{const e=document.getElementById(id);return e?Math.max(0,parseFloat(e.value)||0):0;};
  const d=_pgDefaults();
  return {squat:v('pg-rm-squat')||d.squat, bench:v('pg-rm-bench')||d.bench, dead:v('pg-rm-dead')||d.dead, press:v('pg-rm-press')||d.press};
}
function _pgRecalc(){
  const p=_pgFind(_pgSelKey);if(!p)return;
  const ad=_pgAdapt(p.build(_pgReadInputs()), S.trainingProfile);
  const days=ad.days;
  const box=document.getElementById('pg-preview');if(!box)return;
  let head='';
  if(S.trainingProfile){
    head='<div style="background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.3);border-radius:12px;padding:10px 12px;margin-bottom:10px;">'
      +'<div style="font-weight:800;font-size:12.5px;color:#34c759;margin-bottom:4px;">🎯 Adapté à ton profil <button onclick="openTrainQuiz()" style="float:right;border:none;background:none;color:var(--blue);font-size:11.5px;font-weight:700;cursor:pointer;font-family:var(--font);">modifier</button></div>'
      +'<div style="font-size:12px;color:var(--t2);line-height:1.5;">'+_escNote(_pgAdaptSummary(S.trainingProfile))+'</div>'
      +(ad.changes.length?'<ul style="margin:6px 0 0;padding-left:18px;font-size:11.5px;color:var(--t3);line-height:1.5;">'+ad.changes.map(c=>'<li>'+_escNote(c)+'</li>').join('')+'</ul>':'')
      +'</div>';
  }else{
    head='<div onclick="openTrainQuiz()" class="ft-press" style="background:rgba(91,168,255,.08);border:1px solid rgba(91,168,255,.3);border-radius:12px;padding:11px 12px;margin-bottom:10px;cursor:pointer;">'
      +'<div style="font-weight:800;font-size:12.5px;color:var(--blue);">🧩 Adapter ce programme à toi ›</div>'
      +'<div style="font-size:12px;color:var(--t2);margin-top:2px;">Réponds à 5 questions (jours, durée, matériel, zones sensibles) → exos et volume ajustés à ta vie.</div></div>';
  }
  box.innerHTML=head+_pgDaysHtml(days);
}
// Rendu compact d'une liste de jours (aperçu) — partagé biblio + force athlé
function _pgDaysHtml(days){
  return days.map(d=>{
    return '<div class="pglib-day"><div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:6px;">'+_escNote(d.label)+'</div>'
      +(d.note?'<div style="font-size:11px;color:var(--t3);font-style:italic;margin:-3px 0 6px;">'+_escNote(d.note)+'</div>':'')
      +d.exs.map(ex=>{
        const sets=ex.sets||[];
        const parts=[];let run=null;
        sets.forEach(s=>{const k=s.kg+'x'+s.reps;if(run&&run.k===k){run.n++;}else{run={k,n:1,kg:s.kg,reps:s.reps,note:s.note};parts.push(run);}});
        const line=parts.map(r=>(r.n>1?r.n+'×':'')+(r.kg>0?r.kg+'kg':'—')+' × '+r.reps).join('  ·  ');
        const amrap=sets.some(s=>/MAX/.test(s.note||''));
        return '<div style="font-size:12.5px;color:var(--t1);margin-bottom:3px;"><b>'+_escNote(ex.name)+'</b> <span style="color:var(--t3)">'+line+'</span>'+(amrap?' <span style="color:var(--gold);font-weight:700;">· dernière série MAX</span>':'')+'</div>';
      }).join('')
      +'</div>';
  }).join('');
}
function _pgRenderDays(days,box){if(box)box.innerHTML=_pgDaysHtml(days);}
function addLibProgram(){
  const p=_pgFind(_pgSelKey);if(!p)return;
  const rm=_pgReadInputs();
  const ad=_pgAdapt(p.build(rm), S.trainingProfile);   // sauvegarde la version ADAPTÉE au profil
  if(!S.programmes)S.programmes=[];
  S.programmes.unshift({
    id:'p_lib_'+p.key+'_'+Date.now(),
    name:p.name,
    libKey:p.key, author:p.author, prescribed:true,
    baseRM:rm,
    adaptedTo:S.trainingProfile?_pgAdaptSummary(S.trainingProfile):'',
    days:ad.days
  });
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeProgLib();
  if(typeof renderProgModal==='function')renderProgModal();
  toast('« '+p.name+' » ajouté à tes programmes 💪','success');
}

// ═══ ÉTAPE 1 : QUESTIONNAIRE ADAPTATIF + MOTEUR D'ADAPTATION ═════════════════
// S.trainingProfile = {days, duration, timeOfDay, equipment, zones:[]}
// (niveau=S.level, objectif=S.goal, travail=S.workType, santé=S.healthProfile réutilisés)

// Remplacements par ZONE SENSIBLE (mécanique, PAS un avis médical — prudence)
const _PG_ZONE_SWAP={
  genou:  {'Squat à la Barre':'Press Jambes 45°','Extension Quadriceps (Leg Extension)':'Press Jambes 45°'},
  epaule: {'Développé Militaire':'Développé Épaules Machine','Développé Couché':'Chest Press Machine Horizontale','Dips Parallèles':'Triceps Poulie'},
  dos:    {'Soulevé de Terre':'Rack Pull','Squat à la Barre':'Press Jambes 45°','Rowing Barre':'Rowing Machine'},
  poignet:{'Développé Couché':'Chest Press Machine Horizontale','Développé Militaire':'Développé Épaules Machine'},
  hanche: {'Soulevé de Terre':'Rack Pull','Squat à la Barre':'Press Jambes 45°'},
  coude:  {'Dips Parallèles':'Triceps Poulie'},
};
// Remplacements ÉQUIPEMENT maison (pas de barre)
const _PG_EQUIP_HOME={
  'Squat à la Barre':'Squat Goblet Kettlebell','Développé Couché':'Développé Couché Haltères',
  'Développé Militaire':'Développé Militaire Haltères','Soulevé de Terre':'Soulevé de Terre Roumain Kettlebell',
  'Rowing Barre':'Rowing Haltère Un Bras',
};
const _PG_ZONE_LBL={genou:'genou',epaule:'épaule',dos:'dos',poignet:'poignet',hanche:'hanche',coude:'coude'};

function _pgPhysicalJob(){return S.workType==='actif'||S.workType==='physique';}

// Adapte des jours générés au profil. Retourne {days, changes:[texte…]}
function _pgAdapt(rawDays, prof){
  prof=prof||S.trainingProfile||{};
  const zones=prof.zones||[], equip=prof.equipment||'full';
  // Le VOLUME est un CHOIX de l'utilisateur (pas déduit du travail physique).
  const lowVol=(prof.intensity==='low'), highVol=(prof.intensity==='high');
  const changeSet={};
  const swapName=(name)=>{
    let n=name, whys=[];
    zones.forEach(z=>{const m=_PG_ZONE_SWAP[z];if(m&&m[n]){n=m[n];whys.push(_PG_ZONE_LBL[z]||z);}});
    if(equip==='home'&&_PG_EQUIP_HOME[n]){n=_PG_EQUIP_HOME[n];whys.push('maison');}
    if(n!==name)changeSet[name+'→'+n]='« '+name+' » → « '+n+' » ('+whys.join(', ')+')';
    return n;
  };
  let volReduced=false;
  const days=rawDays.map(d=>({label:d.label,note:d.note||'',exs:d.exs.map(ex=>{
    const nm=swapName(ex.name);
    let sets=ex.sets.slice();
    // Réduction de volume UNIQUEMENT si l'utilisateur l'a demandé (« moins de volume »).
    if(lowVol){
      const bbbIdx=sets.map((s,i)=>/BBB/.test(s.note||'')?i:-1).filter(i=>i>=0);
      if(bbbIdx.length>3){const drop=bbbIdx.slice(3);sets=sets.filter((_,i)=>drop.indexOf(i)<0);volReduced=true;}
    }
    return {name:nm,note:ex.note||'',sets:sets};
  })}));
  const changes=Object.values(changeSet);
  if(volReduced)changes.push('Volume allégé (à ta demande) — moins de séries de volume.');
  else if(highVol)changes.push('Gros volume gardé (à ta demande) — programme complet.');
  return {days,changes};
}

// Un résumé « Adapté à ton profil » pour l'aperçu
function _pgAdaptSummary(prof){
  prof=prof||S.trainingProfile;if(!prof)return '';
  const bits=[];
  if(prof.days)bits.push(prof.days+' j/sem');
  if(prof.duration)bits.push(prof.duration+' min');
  if(prof.timeOfDay)bits.push({matin:'matin',aprem:'après-midi',soir:'soir'}[prof.timeOfDay]||'');
  if(prof.equipment&&prof.equipment!=='full')bits.push(prof.equipment==='home'?'à la maison':'matériel basique');
  if(prof.intensity==='high')bits.push('gros volume');
  else if(prof.intensity==='low')bits.push('volume allégé');
  if((prof.zones||[]).length)bits.push('zones : '+prof.zones.map(z=>_PG_ZONE_LBL[z]||z).join(', '));
  return bits.join(' · ');
}

// ─── Questionnaire ───────────────────────────────────────────────────────────
let _tqDraft=null;
function openTrainQuiz(){
  _tqDraft=Object.assign({days:3,duration:60,timeOfDay:'soir',equipment:'full',zones:[],intensity:'standard'}, S.trainingProfile||{});
  let el=document.getElementById('ov-train-quiz');
  if(!el){el=document.createElement('div');el.id='ov-train-quiz';el.className='overlay';el.style.zIndex='410';
    document.body.appendChild(el);} // pas de fermeture au tap sur le fond → croix ✕ uniquement
  _renderTrainQuiz();el.classList.add('open');
}
function closeTrainQuiz(){const el=document.getElementById('ov-train-quiz');if(el)el.classList.remove('open');}
function _tqChip(field,val,lbl){
  const on=_tqDraft[field]===val;
  return '<button onclick="_tqSet(\''+field+'\',\''+val+'\')" style="padding:9px 12px;border-radius:10px;border:1.5px solid '+(on?'var(--red)':'var(--sep)')+';background:'+(on?'rgba(255,45,85,.12)':'var(--bg2)')+';color:'+(on?'var(--red)':'var(--t2)')+';font-weight:700;font-size:13px;font-family:var(--font);cursor:pointer;">'+lbl+'</button>';
}
function _tqZone(z){
  const on=(_tqDraft.zones||[]).indexOf(z)>=0;
  return '<button onclick="_tqToggleZone(\''+z+'\')" style="padding:8px 12px;border-radius:20px;border:1.5px solid '+(on?'var(--gold)':'var(--sep)')+';background:'+(on?'rgba(234,179,8,.12)':'var(--bg2)')+';color:'+(on?'var(--gold)':'var(--t2)')+';font-weight:700;font-size:12.5px;font-family:var(--font);cursor:pointer;">'+(_PG_ZONE_LBL[z]||z)+'</button>';
}
function _tqSet(f,v){_tqDraft[f]=(f==='days'||f==='duration')?parseInt(v):v;_renderTrainQuiz();}
function _tqToggleZone(z){const a=_tqDraft.zones||(_tqDraft.zones=[]);const i=a.indexOf(z);if(i>=0)a.splice(i,1);else a.push(z);_renderTrainQuiz();}
function _renderTrainQuiz(){
  const el=document.getElementById('ov-train-quiz');if(!el)return;
  const lvl={debutant:'Débutant',intermediaire:'Intermédiaire',confirme:'Confirmé'}[S.level]||'non renseigné';
  const goal={muscle:'Muscle',perte:'Perte de poids',force:'Force',reeq:'Rééquilibrage',endurance:'Endurance'}[S.goal]||'—';
  const nCond=((S.healthProfile&&S.healthProfile.conditions)||[]).length;
  const sec=(t)=>'<div style="font-weight:800;font-size:14px;color:var(--t1);margin:16px 0 8px;">'+t+'</div>';
  const row='display:flex;gap:8px;flex-wrap:wrap;';
  el.innerHTML='<div class="pglib-sheet">'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
      +'<div style="font-weight:800;font-size:18px;color:var(--t1);flex:1;">🧩 Adapter mes programmes</div>'
      +'<button onclick="closeTrainQuiz()" style="width:32px;height:32px;border-radius:50%;border:none;background:var(--bg3);color:var(--t2);font-size:15px;cursor:pointer;">✕</button></div>'
    +'<div style="font-size:13px;color:var(--t3);line-height:1.5;margin-bottom:6px;">Quelques questions pour que les programmes collent à ta vie. Tu peux revenir les changer quand tu veux.</div>'
    +sec('Combien de jours par semaine ?')+'<div style="'+row+'">'+[2,3,4,5,6].map(n=>_tqChip('days',n,n+' j')).join('')+'</div>'
    +sec('Durée d\'une séance')+'<div style="'+row+'">'+[[30,'30 min'],[45,'45 min'],[60,'1 h'],[90,'1 h 30']].map(([v,l])=>_tqChip('duration',v,l)).join('')+'</div>'
    +sec('Tu t\'entraînes plutôt…')+'<div style="'+row+'">'+[['matin','🌅 Matin'],['aprem','☀️ Après-midi'],['soir','🌙 Soir']].map(([v,l])=>_tqChip('timeOfDay',v,l)).join('')+'</div>'
    +sec('Matériel dispo')+'<div style="'+row+'">'+[['full','🏋️ Salle complète'],['basic','Haltères + banc'],['home','🏠 Maison (peu de matériel)']].map(([v,l])=>_tqChip('equipment',v,l)).join('')+'</div>'
    +sec('Ton volume d\'entraînement')+'<div style="'+row+'">'+[['high','💪 Je pousse fort'],['standard','Standard'],['low','Moins de volume']].map(([v,l])=>_tqChip('intensity',v,l)).join('')+'</div>'
    +'<div style="font-size:11.5px;color:var(--t3);margin-top:6px;">C\'est TOI qui choisis. « Je pousse fort » = tout le volume. « Moins » = on allège (reprise, récup difficile…). Ton travail physique ne change rien ici — beaucoup de gens bossent dur ET poussent fort. 💪</div>'
    +sec('Zones sensibles / blessures (optionnel)')+'<div style="font-size:11.5px;color:var(--t3);margin-bottom:8px;">On remplacera les exos à risque par des équivalents. ⚠️ Ce n\'est pas un avis médical — en cas de vraie blessure, vois un pro.</div><div style="'+row+'">'+['genou','epaule','dos','poignet','hanche','coude'].map(_tqZone).join('')+'</div>'
    +'<div style="margin-top:16px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:11px 13px;font-size:12.5px;color:var(--t2);line-height:1.6;">On réutilise aussi ton profil : <b>niveau</b> '+lvl+' · <b>objectif</b> '+goal+(nCond?' · <b>santé</b> '+nCond+' point'+(nCond>1?'s':''):'')+'.<br><span style="color:var(--t3);">(modifiables dans ton Profil)</span></div>'
    +'<button onclick="saveTrainQuiz()" style="width:100%;margin-top:16px;padding:14px;border-radius:13px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">Enregistrer</button>'
    +'</div>';
}
function saveTrainQuiz(){
  S.trainingProfile=Object.assign({}, _tqDraft);
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeTrainQuiz();
  toast('Profil d\'entraînement enregistré ✅','success');
  // rafraîchit la biblio si ouverte
  if(document.getElementById('ov-prog-lib')&&document.getElementById('ov-prog-lib').classList.contains('open'))_renderProgLib();
}

// ═══ FORCE ATHLÉTIQUE (compétition) — programme périodisé, gate profil ═══════
// Différent de la muscu : maximiser la force sur Squat/Couché/Soulevé.
// Niveau 1 (règles, gratuit). Bloc 1 = Accumulation (volume). Rotation Sem A/B.
// Abdos + lombaires + cardio léger dans chaque séance.

// Profil « rempli correctement » pour débloquer le VRAI programme
function _forceReady(){
  const miss=[];
  const has=n=>{const p=S.prs&&S.prs[n];return !!(p&&p.rm1>0);};
  if(!S.level)miss.push('ton niveau (Profil)');
  if(!S.trainingProfile||!S.trainingProfile.days)miss.push('le questionnaire 🧩 (jours/semaine)');
  else if(S.trainingProfile.days<4)miss.push('au moins 4 jours/semaine (force athlé)');
  if(!has(PG_SQUAT))miss.push('ton record Squat');
  if(!has(PG_BENCH))miss.push('ton record Développé couché');
  if(!has(PG_DEAD))miss.push('ton record Soulevé de terre');
  return {ready:miss.length===0, missing:miss};
}

// Bloc 1 — Accumulation (4 ou 5 jours) — charges depuis les 1RM
function _forceBlock1(rm, prof){
  const d5=!!(prof&&prof.days>=5);
  const A=(name,n,reps,rest,note)=>({name,sets:Array.from({length:n},()=>_pgSet(0,reps,{rest:rest||90,note:note||''}))});
  const W=(lift,kg,n,reps,note,rest)=>({name:lift,sets:Array.from({length:n},()=>_pgSet(kg,reps,{note:note||'',rest:rest||180}))});
  const cardio=(min)=>({name:'Cardio (vélo / marche / elliptique)',note:'récup active, faible impact',sets:[_pgSet(0,min,{rest:0,note:'~'+min+' min'})]});
  const s=rm.squat,b=rm.bench,dl=rm.dead,pr=rm.press;
  const days=[
    {label:'J1 · Squat',note:'Squat lourd + chaîne antérieure',exs:[
      W(PG_SQUAT,s*0.75,4,6,'~75% · MOUVEMENT PRINCIPAL',210),
      {name:PG_SQUAT,note:'Variante — pause 2 s en bas (force dans le trou)',sets:Array.from({length:3},()=>_pgSet(s*0.65,5,{note:'Pause 2 s · ~65%',rest:180}))},
      A('Press Jambes 45°',3,10,120),
      A('Leg Curl Assis Machine',3,12,90,'ischios (isolation légère)'),
      A('Inclinaison Lombaire (Good Morning)',3,10,90,'lombaires — léger'),
      A('Gainage',3,45,60,'abdos — gainage (secondes)'),
      cardio(10),
    ]},
    {label:'J2 · Couché',note:'Développé couché lourd + poussée',exs:[
      W(PG_BENCH,b*0.75,4,6,'~75% · MOUVEMENT PRINCIPAL',180),
      A('Développé Incliné',3,8,150,'haut des pecs / carryover épaules'),
      A('Rowing Barre',4,8,120,'équilibre dos ↔ pecs'),
      A('Dips Parallèles',3,10,90,'triceps / verrouillage'),
      A('Élévations Latérales Machine',3,15,60,'épaules'),
      A('Relevé de Jambes',3,15,60,'abdos'),
      cardio(10),
    ]},
    {label:'J3 · Soulevé',note:'Soulevé de terre lourd + chaîne postérieure',exs:[
      W(PG_DEAD,dl*0.75,4,5,'~75% · PRINCIPAL (peu de séries, lourd)',210),
      A('Soulevé de Terre Roumain Barre',3,6,150,'ischios/fessiers (~65%)'),
      A('Rowing Barre',4,8,120,'dos épais'),
      A('Tirage Poulie Haute',3,10,90,'dos large'),
      A('Superman',3,12,60,'lombaires'),
      A('Crunch Machine',3,15,60,'abdos'),
      cardio(15),
    ]},
    {label:'J4 · Volume (Sem A — horizontal)',note:'SEMAINE A : accent développé couché',exs:[
      W(PG_BENCH,b*0.68,4,8,'~68% · volume',150),
      W(PG_SQUAT,s*0.68,3,6,'~68% · volume',180),
      A('Développé Incliné',3,10,120),
      A('Curl Haltères',3,12,60,'biceps'),
      A('Gainage',3,45,60,'abdos'),
      A('Superman',3,12,60,'lombaires'),
      cardio(20),
    ]},
    {label:'J4 · Volume (Sem B — vertical)',note:'SEMAINE B : accent militaire (alterne avec Sem A chaque semaine)',exs:[
      W(PG_PRESS,pr*0.72,4,8,'~72% · volume vertical',150),
      W(PG_SQUAT,s*0.68,3,6,'~68% · volume',180),
      A('Élévations Latérales Machine',3,15,60,'épaules'),
      A('Dips Parallèles',3,10,90,'triceps'),
      A('Relevé de Buste (Sit-up)',3,15,60,'abdos'),
      A('Superman',3,12,60,'lombaires'),
      cardio(20),
    ]},
  ];
  if(d5){
    days.push({label:'J5 · Vitesse / point faible',note:'Force-vitesse : barre rapide, technique parfaite',exs:[
      W(PG_SQUAT,s*0.60,6,3,'~60% · EXPLOSIF (vitesse)',120),
      W(PG_BENCH,b*0.60,6,3,'~60% · EXPLOSIF',120),
      A('Soulevé de Terre Roumain Barre',3,8,120,'renforcement chaîne postérieure'),
      A('Gainage',3,45,60,'abdos'),
      cardio(15),
    ]});
  }
  return days;
}

// ─── UI Force Athlétique ─────────────────────────────────────────────────────
function openForceAthle(){
  _pgView='force';_pgSelKey='force';
  let el=document.getElementById('ov-prog-lib');
  if(!el){el=document.createElement('div');el.id='ov-prog-lib';el.className='overlay';el.style.zIndex='400';document.body.appendChild(el);}
  _renderForceAthle();el.classList.add('open');
  el.scrollTop=0;
}
function _renderForceAthle(){
  const el=document.getElementById('ov-prog-lib');if(!el)return;
  const rdy=_forceReady();
  const pedago='<div class="pglib-block" style="background:rgba(255,45,85,.07);border-color:rgba(255,45,85,.3);"><div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:5px;">⚠️ La force athlétique, ce n\'est pas de la musculation</div><div style="font-size:12.5px;color:var(--t2);line-height:1.55;">C\'est <b>maximiser ta force</b> sur 3 mouvements (Squat · Couché · Soulevé) : basses répétitions, hautes charges, périodisation, travail de vitesse et affûtage. Plus technique et plus exigeant que se muscler. Un vrai programme de compét.</div></div>';
  let html='<div class="pglib-sheet">'+_pgHdr('🔴 Force Athlétique','backProgLib()')+pedago;
  if(!rdy.ready){
    // Profil incomplet → programme basique + message clair
    html+='<div class="pglib-block" style="background:rgba(234,179,8,.08);border-color:rgba(234,179,8,.35);">'
      +'<div style="font-weight:800;font-size:14px;color:var(--gold);margin-bottom:6px;">🔒 Le vrai programme est verrouillé</div>'
      +'<div style="font-size:13px;color:var(--t2);line-height:1.55;margin-bottom:8px;">Pour te bâtir un programme de force athlétique <b>sérieux</b>, l\'app a besoin de te connaître. Il te manque :</div>'
      +'<ul style="margin:0 0 4px;padding-left:20px;font-size:13px;color:var(--t1);line-height:1.7;">'+rdy.missing.map(m=>'<li>'+_escNote(m)+'</li>').join('')+'</ul>'
      +'<div style="font-size:12px;color:var(--t3);line-height:1.5;margin-top:8px;">Sans ces infos, un vrai programme de force n\'aurait aucun sens (les charges se calculent sur tes records).</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">'
      +'<button onclick="openTrainQuiz()" style="width:100%;padding:12px;border-radius:11px;border:1.5px solid rgba(91,168,255,.4);background:rgba(91,168,255,.1);color:var(--blue);font-weight:700;font-size:13px;cursor:pointer;font-family:var(--font);">🧩 Remplir le questionnaire</button>'
      +'<button onclick="closeProgLib();openProfil&&openProfil()" style="width:100%;padding:12px;border-radius:11px;border:1.5px solid var(--sep);background:var(--bg2);color:var(--t2);font-weight:700;font-size:13px;cursor:pointer;font-family:var(--font);">👤 Compléter mon profil (records, niveau)</button>'
      +'</div>'
      +'<div style="font-weight:800;font-size:13px;color:var(--t1);margin:18px 0 6px;">En attendant : un programme basique</div>'
      +'<div style="font-size:12.5px;color:var(--t3);line-height:1.5;margin-bottom:8px;">Commence par <b>Starting Strength</b> — le programme de base pour construire de la force et apprendre les mouvements. Tu reviendras au vrai programme de force athlé une fois ton profil complet.</div>'
      +'<button onclick="openProgLibDetail(\'ss\')" style="width:100%;padding:13px;border-radius:12px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:14px;cursor:pointer;font-family:var(--font);">▶ Voir Starting Strength (programme de base)</button>';
  }else{
    // Profil OK → le vrai programme
    const rm=_pgUser1RM();
    const days=_pgAdapt(_forceBlock1(rm, S.trainingProfile), S.trainingProfile).days;
    html+='<div style="font-size:12px;color:var(--t3);margin:2px 0 10px;">Cycle de ~12 semaines · 3 blocs · Bloc 1 ci-dessous (Accumulation)</div>'
      +'<div class="pglib-block" style="background:rgba(52,199,89,.08);border-color:rgba(52,199,89,.3);"><div style="font-weight:800;font-size:12.5px;color:#34c759;margin-bottom:4px;">🧠 Rendre ce programme VRAIMENT sur-mesure</div><div style="font-size:12px;color:var(--t2);line-height:1.55;">Fais ton <b>analyse morpho</b> + l\'<b>étude du corps (4 photos)</b> → Milo pourra adapter les charges et les exos à TON corps (ex. bras longs → plus de volume couché). Sinon on part sur une base standard solide.</div></div>'
      +'<div style="font-weight:800;font-size:14px;color:var(--t1);margin:8px 0 4px;">Bloc 1 — Accumulation (volume)</div>'
      +'<div style="font-size:12px;color:var(--t3);line-height:1.5;margin-bottom:8px;">4 semaines · reps 5-8 · ~65-75%. On construit le muscle et la caisse. +2,5 kg (haut) / +5 kg (bas) chaque semaine. Sem A / Sem B en alternance. Puis Bloc 2 (Force) et Bloc 3 (Peak).</div>'
      +'<div id="pg-preview"></div>'
      +'<button onclick="addForceAthle()" style="width:100%;margin-top:16px;padding:14px;border-radius:13px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:15px;cursor:pointer;">➕ Ajouter à mes programmes</button>';
  }
  html+='</div>';
  el.innerHTML=html;
  if(rdy.ready)_pgRenderDays(_pgAdapt(_forceBlock1(_pgUser1RM(),S.trainingProfile),S.trainingProfile).days,document.getElementById('pg-preview'));
}
function addForceAthle(){
  const rm=_pgUser1RM();
  const ad=_pgAdapt(_forceBlock1(rm,S.trainingProfile),S.trainingProfile);
  if(!S.programmes)S.programmes=[];
  S.programmes.unshift({id:'p_force_b1_'+Date.now(),name:'Force Athlétique — Bloc 1 (Accumulation)',libKey:'force',prescribed:true,baseRM:rm,forceBlock:1,days:ad.days});
  persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeProgLib();if(typeof renderProgModal==='function')renderProgModal();
  toast('Force Athlétique Bloc 1 ajouté 💪','success');
}
