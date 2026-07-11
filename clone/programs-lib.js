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
  const plan=[
    {lift:PG_PRESS,rm:rm.press,acc:'Dips Triceps Parallèles'},
    {lift:PG_DEAD, rm:rm.dead, acc:'Rowing Barre'},
    {lift:PG_BENCH,rm:rm.bench,acc:'Dips Triceps Parallèles'},
    {lift:PG_SQUAT,rm:rm.squat,acc:'Extension Quadriceps (Leg Extension)'},
  ];
  _W531.forEach((wk,wi)=>{
    plan.forEach(L=>{
      const tm=(L.rm||0)*0.9; // Training Max = 90% du 1RM
      const mainSets=wk.sets.map(([p,r,amrap])=>_pgSet(tm*p,r,{
        rest: wi===3?90:180,
        note: Math.round(p*100)+'% TM'+(amrap?' · MAX de reps (min '+r+')':'')
      }));
      // BBB : 5×10 @ 50% TM sur le même lift (sauf semaine de décharge)
      if(wi<3){
        for(let s=0;s<5;s++)mainSets.push(_pgSet(tm*0.5,10,{rest:90,note:'BBB 50% TM · volume'}));
      }
      const exs=[{name:L.lift,note:wi<3?'Force (5/3/1) puis volume (BBB 5×10)':'Décharge — léger',sets:mainSets}];
      exs.push({name:L.acc,sets:[_pgSet(0,12,{rest:60}),_pgSet(0,12,{rest:60}),_pgSet(0,12,{rest:60})]});
      days.push({label:wk.lbl+' · '+_pgShort(L.lift),exs});
    });
  });
  return days;
}

// ─── Texas Method (intermédiaire, 3 j/sem) ───────────────────────────────────
function _buildTexas(rm){
  const V=0.80, L=0.62, I=0.90; // % du 1RM : Volume / Léger / Intensité
  const s5=(kg,n,note,rest)=>Array.from({length:n},()=>_pgSet(kg,5,{note:note||'',rest:rest||0}));
  return [
    {label:'Lundi · Volume', exs:[
      {name:PG_SQUAT,note:'5×5 lourd — base de la semaine',sets:s5(rm.squat*V,5,'~80% · même poids les 5 séries',210)},
      {name:PG_BENCH,sets:s5(rm.bench*V,5,'~80%',180)},
      {name:PG_DEAD, sets:s5(rm.dead*V,1,'~80% · 1 série',0)},
    ]},
    {label:'Mercredi · Léger (récup)', exs:[
      {name:PG_SQUAT,note:'Léger — récupération, technique',sets:s5(rm.squat*L,2,'~62% · facile',120)},
      {name:PG_PRESS,sets:s5(rm.press*V,3,'~80%',150)},
      {name:'Tirage Vertical Poitrine',sets:[_pgSet(0,10,{rest:90}),_pgSet(0,10,{rest:90}),_pgSet(0,10,{rest:90})]},
    ]},
    {label:'Vendredi · Intensité (PR)', exs:[
      {name:PG_SQUAT,note:'1×5 le plus lourd possible (nouveau record de série)',sets:[_pgSet(rm.squat*I,5,{note:'~90% · série record',rest:240})]},
      {name:PG_BENCH,sets:[_pgSet(rm.bench*(I-0.03),5,{note:'~87% · série record',rest:210})]},
      {name:PG_DEAD, sets:[_pgSet(rm.dead*(I-0.03),3,{note:'~87% · 1×3 lourd',rest:0})]},
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

// ─── Catalogue ───────────────────────────────────────────────────────────────
const PROG_LIB=[
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
    el.onclick=e=>{if(e.target===el)closeProgLib();};document.body.appendChild(el);}
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
      +'<div style="font-size:13px;color:var(--t3);line-height:1.5;margin-bottom:14px;">Des programmes reconnus et éprouvés. L\'app calcule tes charges à partir de tes 1RM. Choisis-en un pour voir le détail.</div>'
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
    const inp=(id,lbl,val)=>'<div style="flex:1;min-width:0;"><div style="font-size:11px;color:var(--t3);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+lbl+'</div>'
      +'<div style="display:flex;align-items:center;gap:3px;"><input id="'+id+'" type="number" inputmode="numeric" value="'+val+'" oninput="_pgRecalc()" style="width:100%;box-sizing:border-box;padding:8px 6px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:15px;text-align:center;font-family:var(--font);"><span style="font-size:11px;color:var(--t3);">kg</span></div></div>';
    el.innerHTML='<div class="pglib-sheet">'
      +_pgHdr(p.name,'backProgLib()')
      +'<div style="font-size:12px;color:var(--t3);margin:-6px 0 10px;">par '+p.author+' · '+p.level+' · '+p.freq+'</div>'
      +'<div class="pglib-block"><div style="font-size:13.5px;color:var(--t1);line-height:1.55;">'+p.desc+'</div></div>'
      +'<div class="pglib-block" style="background:rgba(234,179,8,.08);border-color:rgba(234,179,8,.3);"><div style="font-weight:800;font-size:13px;color:var(--gold);margin-bottom:5px;">📐 Comment ça marche</div><div style="font-size:13px;color:var(--t2);line-height:1.55;">'+p.how+'</div></div>'
      +'<div style="font-weight:800;font-size:14px;color:var(--t1);margin:14px 0 4px;">Tes 1RM (records)</div>'
      +'<div style="font-size:11.5px;color:var(--t3);margin-bottom:8px;">Vérifie/ajuste — les charges du programme en découlent. Pré-remplis depuis tes records (ou une estimation).</div>'
      +'<div style="display:flex;gap:8px;margin-bottom:16px;">'
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
  const days=p.build(_pgReadInputs());
  const box=document.getElementById('pg-preview');if(!box)return;
  box.innerHTML=days.map(d=>{
    return '<div class="pglib-day"><div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:6px;">'+_escNote(d.label)+'</div>'
      +d.exs.map(ex=>{
        const sets=ex.sets||[];
        // regroupe les séries identiques (kg×reps) pour un aperçu compact
        const parts=[];let run=null;
        sets.forEach(s=>{const k=s.kg+'x'+s.reps;if(run&&run.k===k){run.n++;}else{run={k,n:1,kg:s.kg,reps:s.reps,note:s.note};parts.push(run);}});
        const line=parts.map(r=>(r.n>1?r.n+'×':'')+(r.kg>0?r.kg+'kg':'—')+' × '+r.reps).join('  ·  ');
        const amrap=sets.some(s=>/MAX/.test(s.note||''));
        return '<div style="font-size:12.5px;color:var(--t1);margin-bottom:3px;"><b>'+_escNote(ex.name)+'</b> <span style="color:var(--t3)">'+line+'</span>'+(amrap?' <span style="color:var(--gold);font-weight:700;">· dernière série MAX</span>':'')+'</div>';
      }).join('')
      +'</div>';
  }).join('');
}
function addLibProgram(){
  const p=_pgFind(_pgSelKey);if(!p)return;
  const rm=_pgReadInputs();
  const days=p.build(rm);
  if(!S.programmes)S.programmes=[];
  S.programmes.unshift({
    id:'p_lib_'+p.key+'_'+Date.now(),
    name:p.name,
    libKey:p.key, author:p.author, prescribed:true,
    baseRM:rm,
    days:days
  });
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeProgLib();
  if(typeof renderProgModal==='function')renderProgModal();
  toast('« '+p.name+' » ajouté à tes programmes 💪','success');
}
