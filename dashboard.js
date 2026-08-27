/* ════════════════════════════════════════════════════════════════════════════
   TABLEAU DE BORD ORDINATEUR — le rendu (04/08/2026)

   ⚠️ CE FICHIER NE CALCULE RIEN. Il lit `S` et appelle les fonctions de l'app
   (`calcTDEE`, `calcMacros`, `calcRecoveryScore`…). Si un chiffre est faux ici,
   il est faux dans l'app aussi — et c'est voulu : une seule source de vérité
   (R1/R2). Le jour où un calcul est corrigé, cette page en profite le jour même.

   ⚠️ AUCUNE COULEUR EN DUR. Tout passe par les variables de `style.css`
   (--red, --green, --t1…), donc le mode clair marche sans effort et l'identité
   Force Tracker est respectée — la maquette d'origine était bleue, l'app est
   rouge (échec du 21/07, cf. docs/DESIGN-KIT.md).

   ⚠️ SI UNE DONNÉE MANQUE, ON LE DIT. Une tuile sans donnée affiche « — » et son
   explication, jamais un zéro ni une valeur inventée : un tableau de bord qui
   montre 0 kg alors qu'on n'a jamais pesé ment (R29 — si on ne sait pas, on le dit).
   ═══════════════════════════════════════════════════════════════════════════ */

// Les entrées de la barre latérale. ⚠️ PAS de « Coach » : décision de Michel,
// la version ordinateur est sans Milo. Les écrans pas encore portés sont
// marqués `soon` — on les affiche quand même pour montrer la structure, mais
// on ne fait pas croire qu'ils fonctionnent.
const DASH_NAV = [
  {id:'home',   t:'Tableau de bord', i:'M3 10.5 12 3l9 7.5V21H3z'},
  {id:'seances',t:'Séances',         i:'M4 7v10M20 7v10M7 9v6M17 9v6M7 12h10', soon:true},
  {id:'exos',   t:'Exercices',       i:'M12 5v14M5 12h14', soon:true},
  {id:'prog',   t:'Progression',     i:'M4 19V5M4 19h16M7 16l4-5 3 3 5-7', soon:true},
  {id:'nutri',  t:'Nutrition',       i:'M12 3c3 0 5 2 5 6s-2 12-5 12-5-8-5-12 2-6 5-6z', soon:true},
  {id:'cardio', t:'Cardio',          i:'M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z', soon:true},
  {id:'mens',   t:'Mensurations',    i:'M4 8h16v8H4zM8 8v3M12 8v5M16 8v3', soon:true},
  {id:'stats',  t:'Statistiques',    i:'M5 20V9M12 20V4M19 20v-7', soon:true},
  {id:'records',t:'Records',         i:'M8 4h8v4a4 4 0 0 1-8 0zM12 12v5M9 21h6', soon:true},
  {id:'photos', t:'Photos',          i:'M4 8h4l1.5-2h5L16 8h4v11H4zM12 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', soon:true},
  {id:'param',  t:'Paramètres',      i:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2 1.5-2 3.5-2.4-.7a7 7 0 0 1-2 1.2L14 20h-4l-.6-2.5a7 7 0 0 1-2-1.2L5 17 3 13.5 5 12l-2-1.5L5 7l2.4.7a7 7 0 0 1 2-1.2L10 4h4l.6 2.5a7 7 0 0 1 2 1.2L19 7l2 3.5z', soon:true}
];

function _dNav(){
  const n=document.getElementById('dash-nav'); if(!n)return;
  n.innerHTML=DASH_NAV.map((e,i)=>
    `<button class="nav-i${i===0?' on':''}" data-id="${e.id}"${e.soon?' title="Pas encore porté sur la version ordinateur"':''}>
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${e.i}"/></svg>
       <span>${e.t}</span>${e.soon?'<span style="margin-left:auto;font-size:10px;font-weight:800;color:var(--t3);">bientôt</span>':''}
     </button>`).join('');
}

// Un petit graphique de tendance. Rend '' s'il n'y a pas au moins 2 points :
// une courbe tracée sur une seule valeur donne l'illusion d'une tendance.
function _dSpark(vals, coul){
  const v=(vals||[]).filter(x=>typeof x==='number'&&isFinite(x));
  if(v.length<2)return '';
  const mn=Math.min(...v), mx=Math.max(...v), amp=(mx-mn)||1, W=100, H=30;
  const pts=v.map((y,i)=>[(i/(v.length-1))*W, H-((y-mn)/amp)*(H-4)-2]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <path d="${d}" fill="none" stroke="${coul}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// L'anneau de récupération — même logique de couleur que l'app : rouge en bas,
// or au milieu, vert en haut. On ne réinvente pas un barème ici.
function _dRing(score){
  const s=Math.max(0,Math.min(100,+score||0)), R=34, C=2*Math.PI*R;
  const coul=s>=70?'var(--green)':(s>=45?'var(--gold)':'var(--red)');
  return `<svg class="ring" viewBox="0 0 84 84">
    <circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--bg3)" stroke-width="8"/>
    <circle cx="42" cy="42" r="${R}" fill="none" stroke="${coul}" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${(C*s/100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 42 42)"/>
    <text class="ring-n" x="42" y="45" text-anchor="middle">${Math.round(s)}</text>
    <text class="ring-u" x="42" y="57" text-anchor="middle">/100</text></svg>`;
}

// 7,2 h → « 7h12 ». Écrire « 7 h 2 » laisse croire à 7 h 02 : deux minutes d'écart
// pour un affichage, mais c'est le genre de détail qui fait douter de tout le reste.
function _dHeures(h){
  const t=Math.max(0,Math.round(h*60));
  return Math.floor(t/60)+'<small>h</small>'+String(t%60).padStart(2,'0');
}
function _dTuile(o){
  return `<div class="kpi">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <span class="kpi-t">${o.titre}</span>${o.ic?`<span class="kpi-ic">${o.ic}</span>`:''}
    </div>
    ${o.corps}
  </div>`;
}


/* ════════════════════════════════════════════════════════════════════════════
   LES GRANDS BLOCS — graphiques, calendrier, figurine, records
   ⚠️ Toujours la même règle : aucun calcul ici. La figurine est rendue par
   `_mscSVG` de log.js — CELLE de l'app, avec ses 41 muscles. Si on la corrige
   là-bas, elle est corrigée ici le jour même.
   ═══════════════════════════════════════════════════════════════════════════ */

// Séances triées de la plus ANCIENNE à la plus récente, sur N jours.
function _dSess(jours){
  const lim=Date.now()-jours*864e5;
  return (S.sessions||[]).filter(s=>s&&s.date&&Date.parse(s.date+'T12:00:00')>=lim)
    .slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

// Courbe : le 1RM estimé le plus lourd de chaque séance. On passe par `bz`,
// la formule de l'app — pas une deuxième version maison.
function _dCourbe(sess){
  const pts=[];
  sess.forEach(s=>{ let best=0;
    (s.exs||[]).forEach(e=>(e.sets||[]).forEach(x=>{
      if(!x||!x.done||x.type==='É'||x.type==='W')return;
      const r=(typeof bz==='function')?bz(+x.kg||0,+x.reps||0):0; if(r>best)best=r; }));
    if(best>0)pts.push({d:s.date,v:best});
  });
  if(pts.length<2)return '<div class="vide">Pas encore assez de séances pour tracer une courbe.</div>';
  const W=900,H=210,P=34, mx=Math.max(...pts.map(p=>p.v)), mn=Math.min(...pts.map(p=>p.v));
  const amp=(mx-mn)||1, hi=mx+amp*.15, lo=Math.max(0,mn-amp*.25), a=(hi-lo)||1;
  const X=i=>P+ (i/(pts.length-1))*(W-P-12), Y=v=>H-24-((v-lo)/a)*(H-42);
  const d=pts.map((p,i)=>(i?'L':'M')+X(i).toFixed(1)+','+Y(p.v).toFixed(1)).join(' ');
  const aire=d+` L${X(pts.length-1).toFixed(1)},${H-24} L${X(0).toFixed(1)},${H-24} Z`;
  let axes='';
  for(let k=0;k<=3;k++){ const v=lo+(a*k/3), y=Y(v);
    axes+=`<line x1="${P}" y1="${y.toFixed(1)}" x2="${W-12}" y2="${y.toFixed(1)}" stroke="var(--sep)" stroke-width="1"/>`
        +`<text x="4" y="${(y+3.5).toFixed(1)}" font-size="10" fill="var(--t3)">${Math.round(v)} kg</text>`; }
  const lab=(iso)=>{const dt=new Date(iso+'T12:00:00');return dt.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});};
  let xs='';
  [0,Math.floor(pts.length/3),Math.floor(2*pts.length/3),pts.length-1].forEach(i=>{
    xs+=`<text x="${X(i).toFixed(1)}" y="${H-6}" font-size="10" fill="var(--t3)" text-anchor="middle">${lab(pts[i].d)}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--red)" stop-opacity=".38"/>
      <stop offset="100%" stop-color="var(--red)" stop-opacity="0"/></linearGradient></defs>
    ${axes}<path d="${aire}" fill="url(#gA)"/>
    <path d="${d}" fill="none" stroke="var(--red)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(pts.length-1).toFixed(1)}" cy="${Y(pts[pts.length-1].v).toFixed(1)}" r="4" fill="var(--red)"/>
    ${xs}</svg>`;
}

// Barres : le volume (kg soulevés) de chaque séance.
// Courbe du poids de corps — même rendu, autre donnée.
function _dCourbePoids(){
  const w=(S.weightLog||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)))
    .filter(x=>+x.kg||+x.bw);
  if(w.length<2)return '<div class="vide">Pas assez de pesées pour tracer une courbe.</div>';
  return _dCourbe(w.map(x=>({date:x.date,exs:[{sets:[{kg:+x.kg||+x.bw,reps:1,done:true,type:'N'}]}]})));
}
function _dBarres(sess){
  const v=sess.map(s=>+s.volume||+s.vol||0).filter(x=>x>=0);
  if(!v.length)return '<div class="vide">Aucun volume enregistré.</div>';
  const W=560,H=190,mx=Math.max(...v)||1, n=v.length, bw=Math.max(2,(W-24)/n-2);
  let b='';
  v.forEach((y,i)=>{ const h=Math.max(1,(y/mx)*(H-34)), x=12+i*((W-24)/n);
    b+=`<rect x="${x.toFixed(1)}" y="${(H-22-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"
         rx="2" fill="var(--red)" opacity="${(0.45+0.55*(y/mx)).toFixed(2)}"/>`; });
  let axes='';
  for(let k=1;k<=3;k++){ const y=H-22-((H-34)*k/3);
    axes+=`<line x1="10" y1="${y.toFixed(1)}" x2="${W-8}" y2="${y.toFixed(1)}" stroke="var(--sep)" stroke-width="1"/>`
        +`<text x="${W-6}" y="${(y-3).toFixed(1)}" font-size="9.5" fill="var(--t3)" text-anchor="end">${Math.round(mx*k/3/1000)} T</text>`; }
  return `<svg class="bars" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${axes}${b}</svg>`;
}

// Calendrier du mois — un point rouge les jours de séance, le jour cerclé.
function _dCal(){
  const now=new Date(), an=now.getFullYear(), mo=now.getMonth();
  const prem=new Date(an,mo,1), dec=(prem.getDay()+6)%7, nb=new Date(an,mo+1,0).getDate();
  const faits=new Set((S.sessions||[]).map(s=>s&&s.date).filter(Boolean));
  const iso=d=>`${an}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  let h=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(j=>`<b>${j}</b>`).join('');
  for(let i=0;i<dec;i++)h+='<i class="off"></i>';
  for(let d=1;d<=nb;d++){
    const cl=[]; if(faits.has(iso(d)))cl.push('did');
    if(d===now.getDate())cl.push('today');
    h+=`<i class="${cl.join(' ')}">${d}</i>`;
  }
  return `<div class="cal">${h}</div>`;
}

// La figurine — ⚠️ celle de l'app (`_mscSVG`, 41 muscles depuis ft-v751).
// ⚠️ `_mscScores` attend des EXERCICES, pas des séances. Je lui passais des séances :
// la figurine restait quasi vierge et la liste des muscles sortait vide, sans aucune
// erreur JS. Une fonction qui reçoit le mauvais type et rend un résultat plausible est
// plus difficile à repérer qu'une qui plante (trouvé le 04/08 en regardant le rendu).
function _dExsDe(sess){ const o=[]; sess.forEach(s=>(s.exs||s.exercices||[]).forEach(e=>o.push(e))); return o; }
function _dFigurine(sess){
  if(typeof _mscScores!=='function'||typeof _mscSVG!=='function')
    return '<div class="vide">Figurine indisponible.</div>';
  const douze=sess.slice(-12), exs=_dExsDe(douze);
  if(!exs.length)return '<div class="vide">Aucune séance récente à représenter.</div>';
  const d=_mscScores(exs)||{};
  const svg=`<div class="fig">${_mscSVG({sc:d.sc||{},ind:d.ind||{}})}</div>`;
  // Combien de fois chaque groupe a été sollicité sur ces 12 séances, en % du plus travaillé.
  const noms=(typeof _MG!=='undefined')?_MG:{}, cnt={};
  douze.forEach(s=>{ const x=_mscScores(_dExsDe([s]))||{};
    Object.entries(x.sc||{}).forEach(([k,v])=>{ cnt[k]=(cnt[k]||0)+(v>=2?2:1); }); });
  const mx=Math.max(1,...Object.values(cnt));
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,7)
    .map(([k,v])=>{const p=Math.round(100*v/mx);
      return `<div class="mus"><span class="n">${(noms[k]&&noms[k].label)||k}</span>
        <span class="bar"><span style="width:${p}%"></span></span><span class="p">${p}%</span></div>`;}).join('');
  return svg+(top?`<div style="margin-top:14px">${top}</div>`:'');
}

// ── La fenêtre de la courbe, pilotée par les boutons (7J … Tout) ────────────
let _dPer=90, _dMet='force';
const _D_PER=[{j:7,t:'7J'},{j:30,t:'1M'},{j:90,t:'3M'},{j:180,t:'6M'},{j:365,t:'1A'},{j:99999,t:'Tout'}];
function _dSetPer(j){ _dPer=j; renderDashBlocs(); }
function _dSetMet(m){ _dMet=m; renderDashBlocs(); }
function _dSeg(){
  return `<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
    <div style="display:flex;gap:3px;background:var(--bg3);border-radius:9px;padding:3px">
      ${['force','volume','poids'].map(m=>`<button onclick="_dSetMet('${m}')" class="seg${_dMet===m?' on':''}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}
    </div>
    <div style="display:flex;gap:3px;margin-left:auto;background:var(--bg3);border-radius:9px;padding:3px">
      ${_D_PER.map(p=>`<button onclick="_dSetPer(${p.j})" class="seg${_dPer===p.j?' on':''}">${p.t}</button>`).join('')}
    </div></div>`;
}


// Médiane — même principe qu'en ft-v753 : on ne compare jamais deux points isolés,
// une seule séance atypique renverserait le verdict.
function _dMed(a){ const t=a.slice().sort((x,y)=>x-y), m=t.length>>1;
  return t.length?(t.length%2?t[m]:(t[m-1]+t[m])/2):0; }
function _dEvol(vals){
  if(vals.length<5)return null;                       // sous 5 points, pas de tendance honnête
  const w=Math.min(3,Math.floor(vals.length/2));
  const a=_dMed(vals.slice(0,w)), b=_dMed(vals.slice(-w));
  return a>0?Math.round((b-a)/a*100):null;
}
function _dPct(v){ return v==null?'—':(v>0?'+':'')+v+' %'; }

// La rangée du bas : 4 indicateurs sur 30 jours + la bande de l'année.
function _dBas(){
  const s30=_dSess(30);
  const rm=[],vol=[];
  s30.forEach(s=>{ let best=0;
    (s.exs||[]).forEach(e=>(e.sets||[]).forEach(x=>{ if(!x||!x.done||x.type==='É'||x.type==='W')return;
      const r=(typeof bz==='function')?bz(+x.kg||0,+x.reps||0):0; if(r>best)best=r; }));
    if(best>0)rm.push(best); vol.push(+s.volume||+s.vol||0); });
  // Régularité = semaines avec au moins une séance, sur les 8 dernières.
  // ⚠️ Définition écrite exprès : « 94 % » ne veut rien dire si on ne dit pas de quoi.
  const sem=new Set(); _dSess(56).forEach(s=>{ const d=new Date(s.date+'T12:00:00');
    const t=new Date(d); t.setDate(d.getDate()-((d.getDay()+6)%7)); sem.add(t.toISOString().slice(0,10)); });
  const reg=Math.round(100*Math.min(8,sem.size)/8);
  const charge=vol.reduce((a,b)=>a+b,0);
  const T=[['Force',_dPct(_dEvol(rm)),'sur 30 jours'],
           ['Volume',_dPct(_dEvol(vol)),'sur 30 jours'],
           ['Régularité',reg+' %','semaines avec séance (8 dern.)'],
           ['Charge totale',(charge/1000).toFixed(1)+' T','sur 30 jours']];
  // Bande de l'année. Les calories viennent de `calcSessionCalories` (app.js) — la MÊME
  // fonction que l'app, avec les MET par exercice. Si elle n'est pas disponible, la tuile
  // n'est pas affichée : on préfère 4 chiffres justes à 5 dont un inventé.
  const an=new Date().getFullYear();
  const sa=(S.sessions||[]).filter(s=>s&&s.date&&+s.date.slice(0,4)===an);
  const min=sa.reduce((a,s)=>a+(+s.duration||0),0);
  const volAn=sa.reduce((a,s)=>a+(+s.volume||+s.vol||0),0);
  let cardio=0; sa.forEach(s=>['cardio','cardioPre','cardioPost'].forEach(k=>{const c=s[k];
    if(c&&typeof c==='object'&&+c.min)cardio+=+c.min; else if(+c)cardio+=+c;}));
  let kcal=null;
  if(typeof calcSessionCalories==='function'){
    /* ⚠️ `calcSessionCalories` rend un OBJET ({total, breakdown, dureeMin…}), pas un nombre.
       `+objet` vaut NaN, donc la somme valait NaN, donc `kcal>0` était faux, donc la tuile
       « Calories » de l'année ne s'est JAMAIS affichée — depuis toujours, sans aucune erreur.
       ⭐ Le repli « on préfère 4 chiffres justes à 5 dont un inventé » (juste au-dessus) est ce qui
       a rendu la panne invisible : le code de secours a fait exactement son travail, et personne
       n'a pu voir que le chemin normal était mort. *Un repli silencieux cache la panne qu'il
       compense* — c'est la famille du garde-fou branché sur un chemin mort (04/08). */
    try{ kcal=sa.reduce((a,s)=>{const c=calcSessionCalories(s);
      return a+(+(c&&typeof c==='object'?c.total:c)||0);},0); }catch(e){ kcal=null; }
  }
  const A=[['Séances',sa.length],['Temps',Math.round(min/60)+' h'],
           ['Volume',(volAn/1000).toFixed(1)+' T']];
  if(kcal!=null&&kcal>0)A.push(['Calories',Math.round(kcal).toLocaleString('fr-FR')+' kcal']);
  A.push(['Cardio',Math.round(cardio/60)+' h']);
  return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))">
      ${T.map(x=>`<div class="card2"><h3>${x[0]}</h3>
        <div class="kpi-v">${x[1]}</div><div class="kpi-s">${x[2]}</div></div>`).join('')}
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
      ${A.map(x=>`<div class="card2" style="padding:13px 16px"><h3 style="margin-bottom:8px">${x[0]} — ${an}</h3>
        <div class="kpi-v" style="font-size:23px">${x[1]}</div></div>`).join('')}
    </div>`;
}

// « Top records » — les plus LOURDS. À ne pas confondre avec « derniers records »,
// qui sont les plus RÉCENTS : deux listes, deux questions différentes.
function _dTop(){
  const p=Object.entries(S.prs||{}).map(([n,x])=>({n,kg:+((x&&(x.kg||x.rm1))||0),
      ev:(x&&x.delta)||null})).filter(x=>x.kg>0).sort((a,b)=>b.kg-a.kg).slice(0,5);
  if(!p.length)return '';
  return `<div class="card2" style="margin-top:14px"><h3>Top records</h3><div class="lst">${
    p.map(x=>`<div><span class="n">${x.n}</span><span class="v">${Math.round(x.kg)} kg</span></div>`).join('')
  }</div></div>`;
}

// La carte « prochaine séance », avec ses exercices.
function _dProchaine(){
  let n=null; try{ n=(typeof _nextPlannedActive==='function')?_nextPlannedActive():(S.nextPlanned||null); }catch(e){ n=S.nextPlanned||null; }
  if(!n||!n.label)return `<div class="card2"><h3>Prochaine séance</h3>
    <div class="vide">Rien d'annoncé. Dis-le à l'app et ça s'affichera ici.</div></div>`;
  const ex=(n.exs||n.exercices||[]).slice(0,6)
    .map(e=>`<div style="padding:5px 0;font-size:13px;color:var(--t1)">• ${(e.name||e)||''}</div>`).join('');
  return `<div class="card2"><h3>Prochaine séance</h3>
    <div style="font-size:19px;font-weight:800;margin-bottom:2px">${n.label}</div>
    <div class="kpi-s" style="margin-bottom:10px">${n.date?new Date(n.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}):''}</div>
    ${ex||'<div class="vide">Les exercices ne sont pas encore détaillés.</div>'}</div>`;
}

function renderDashBlocs(){
  const box=document.getElementById('dash-blocs'); if(!box)return;
  const sPer=_dSess(_dPer);

  // ── Records (les 4 plus récents) ─────────────────────────────────────────
  const prs=Object.entries(S.prs||{})
    .map(([n,p])=>({n, kg:+((p&&(p.kg||p.rm1))||0), d:(p&&p.date)||''}))
    .filter(p=>p.kg>0).sort((a,b)=>String(b.d).localeCompare(String(a.d))).slice(0,5);
  const recHtml=prs.length
    ? `<div class="lst">${prs.map(p=>`<div><span class="n">${p.n}</span>
        <span class="v">${p.kg} kg</span><span class="d">${p.d?p.d.slice(8,10)+'/'+p.d.slice(5,7):''}</span></div>`).join('')}</div>`
    : '<div class="vide">Aucun record enregistré.</div>';

  // ── Dernières séances ────────────────────────────────────────────────────
  const der=(S.sessions||[]).slice(0,6);
  const derHtml=der.length
    ? `<div class="lst">${der.map(s=>{
        const nEx=(s.exs||[]).length, nSets=(s.exs||[]).reduce((a,e)=>a+((e.sets||[]).filter(x=>x.done).length),0);
        return `<div><span class="d" style="text-align:left;min-width:46px">${s.date.slice(8,10)}/${s.date.slice(5,7)}</span>
          <span class="n">${nEx} exercice${nEx>1?'s':''}</span><span class="v">${nSets} séries</span></div>`;}).join('')}</div>`
    : '<div class="vide">Aucune séance.</div>';

  // ── Objectifs — ⚠️ on n'affiche QUE ceux qui existent vraiment.
  //    Il n'y a pas d'objectif « X séances par mois » dans l'app : on ne l'invente pas.
  const O=[];
  if(+S.target>0&&+S.bw>0){ const p=Math.max(0,Math.min(100,Math.round(100-Math.abs(S.bw-S.target)/Math.max(1,S.target)*100*3)));
    O.push({n:'Poids', t:`${(+S.bw).toFixed(1)} / ${(+S.target).toFixed(0)} kg`, p, c:'var(--gold)'}); }
  Object.entries(S.strengthGoals||{}).slice(0,3).forEach(([ex,cible])=>{
    const pr=(S.prs||{})[ex], act=pr?+(pr.rm1||pr.kg||0):0, c=+cible||0;
    if(c>0&&act>0)O.push({n:ex.slice(0,14), t:`${Math.round(act)} / ${c} kg`,
      p:Math.min(100,Math.round(100*act/c)), c:'var(--red)'}); });
  const objHtml=O.length
    ? O.map(o=>`<div class="obj"><span class="n">${o.n}</span>
        <span class="bar"><span style="width:${o.p}%;background:${o.c}"></span></span>
        <span class="p">${o.p}%</span></div><div style="font-size:11.5px;color:var(--t3);margin:-6px 0 4px 96px">${o.t}</div>`).join('')
    : '<div class="vide">Aucun objectif chiffré. Tu peux en fixer dans le Profil.</div>';

  // ── La disposition suit le schéma fourni par Michel le 04/08 (fil de discussion).
  //    Un schéma en texte vaut mieux qu'une image : il dit la STRUCTURE sans imposer
  //    une esthétique qui ne serait pas celle de l'app.
  box.innerHTML=`
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card2"><h3>Progression</h3>${_dSeg()}
        ${_dMet==='volume'?_dBarres(sPer):(_dMet==='poids'?_dCourbePoids():_dCourbe(sPer))}</div>
      <div class="card2"><h3>Volume d'entraînement</h3>${_dBarres(sPer)}</div>
    </div>
    <div class="grid g-4">
      <div class="card2"><h3>Silhouette musculaire — 12 dernières séances</h3>${_dFigurine(_dSess(365))}</div>
      <div class="card2"><h3>Derniers records</h3>${recHtml}</div>
      <div class="card2"><h3>Dernières séances</h3>${derHtml}</div>
      <div class="card2"><h3>Objectifs</h3>${objHtml}</div>
    </div>
    <div class="grid" style="grid-template-columns:minmax(0,2.1fr) minmax(0,1fr)">
      <div class="card2"><h3>Calendrier d'entraînement</h3>${_dCal()}</div>
      <div>${_dProchaine()}${_dTop()}</div>
    </div>
    ${_dBas()}`;
}

function renderDashboard(){
  // On lit l'état de l'app, exactement comme l'app le fait.
  try{ if(typeof load==='function')load(); }catch(e){}
  const S_=(typeof S!=='undefined')?S:{};

  const prenom=(S_.name||'').trim();
  document.getElementById('dash-hello').textContent='Bonjour'+(prenom?' '+prenom:'')+' 👋';
  const d=new Date();
  document.getElementById('dash-date').textContent=
    d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
     .replace(/^./,c=>c.toUpperCase());
  document.getElementById('dash-user').textContent=prenom||'Athlète';
  document.getElementById('dash-plan').textContent=S_.premium?'Premium':'';

  const T=[];

  // ── RÉCUPÉRATION ──────────────────────────────────────────────────────────
  let rec=null; try{ if(typeof calcRecoveryScore==='function')rec=calcRecoveryScore(); }catch(e){}
  T.push(_dTuile({titre:'Récupération', corps: (rec==null||isNaN(rec))
    ? `<div class="vide">Pas encore de quoi l'estimer — note une séance et une nuit de sommeil.</div>`
    : `<div class="ring-wrap">${_dRing(rec)}
        <div><div class="kpi-s" style="font-weight:800;color:${rec>=70?'var(--green)':(rec>=45?'var(--gold)':'var(--red)')};">
          ${rec>=70?'Bonne récupération':(rec>=45?'Récupération moyenne':'Récupération basse')}</div>
        <div class="kpi-s">${rec>=70?'Prêt à performer':'Ménage-toi aujourd\'hui'}</div></div></div>`}));

  // ── SÉANCE DU JOUR / PROCHAINE ───────────────────────────────────────────
  let prochaine=null;
  try{ prochaine=(typeof _nextPlannedActive==='function')?_nextPlannedActive():(S_.nextPlanned||null); }catch(e){ prochaine=S_.nextPlanned||null; }
  T.push(_dTuile({titre:'Séance du jour', ic:'⚡', corps: prochaine&&prochaine.label
    ? `<div class="kpi-v" style="font-size:20px;">${String(prochaine.label).slice(0,40)}</div>
       <div class="kpi-s">${prochaine.date||''}</div>`
    : `<div class="vide">Rien d'annoncé pour aujourd'hui.</div>`}));

  // ── NUTRITION ─────────────────────────────────────────────────────────────
  let kcal=null,prot=null;
  try{ const m=(typeof calcMacros==='function')?calcMacros(S_.nutritionPhase||'charge'):null;
       if(m){kcal=m.kcal||m.cal||null; prot=m.prot||m.p||null;} }catch(e){}
  if(kcal==null){ try{ kcal=(typeof calcTDEE==='function')?calcTDEE():null; }catch(e){} }
  T.push(_dTuile({titre:'Nutrition', ic:'🍏', corps: kcal
    ? `<div class="kpi-v">${Math.round(kcal)}<small>kcal</small></div>
       <div class="kpi-s">${prot?('Protéines '+Math.round(prot)+' g'):'Objectif du jour'}</div>`
    : `<div class="vide">Complète ton profil (âge, taille, poids) pour l'estimer.</div>`}));

  // ── CARDIO (7 derniers jours) ────────────────────────────────────────────
  let minCardio=0;
  try{ const lim=Date.now()-7*864e5;
    (S_.sessions||[]).forEach(s=>{ if(!s||!s.date)return;
      if(Date.parse(s.date+'T12:00:00')<lim)return;
      ['cardio','cardioPre','cardioPost'].forEach(k=>{ const c=s[k];
        if(c&&typeof c==='object'&&+c.min)minCardio+=+c.min; else if(+c)minCardio+=+c; }); });
  }catch(e){}
  T.push(_dTuile({titre:'Cardio', ic:'❤️', corps: minCardio>0
    ? `<div class="kpi-v">${minCardio>=60?(Math.floor(minCardio/60)+'<small>h</small> '+String(minCardio%60).padStart(2,'0')):(minCardio+'<small>min</small>')}</div>
       <div class="kpi-s">Cette semaine</div>`
    : `<div class="vide">Aucun cardio noté ces 7 derniers jours.</div>`}));

  // ── SOMMEIL ───────────────────────────────────────────────────────────────
  const sl=(S_.sleepLog||[]).slice(0,14);
  T.push(_dTuile({titre:'Sommeil', ic:'🌙', corps: sl.length
    ? `<div class="kpi-v">${_dHeures(+sl[0].hours||0)}</div>
       <div class="kpi-s">Dernière nuit</div>${_dSpark(sl.slice().reverse().map(x=>+x.hours),'var(--red)')}`
    : `<div class="vide">Aucune nuit notée.</div>`}));

  // ── POIDS ─────────────────────────────────────────────────────────────────
  const wl=(S_.weightLog||[]).slice(0,20);
  T.push(_dTuile({titre:'Poids', ic:'⚖️', corps: wl.length
    ? `<div class="kpi-v">${(+wl[0].kg||+wl[0].bw||0).toFixed(1)}<small>kg</small></div>
       <div class="kpi-s">${wl.length>1?'Dernière pesée':'Première pesée'}</div>
       ${_dSpark(wl.slice().reverse().map(x=>+x.kg||+x.bw),'var(--red)')}`
    : (S_.bw?`<div class="kpi-v">${(+S_.bw).toFixed(1)}<small>kg</small></div><div class="kpi-s">Poids du profil</div>`
            :`<div class="vide">Aucune pesée enregistrée.</div>`)}));

  document.getElementById('dash-kpis').innerHTML=T.join('');

  try{ renderDashBlocs(); }catch(e){ console.warn('blocs',e); }

  const nb=(S_.sessions||[]).length;
  document.getElementById('dash-note').innerHTML=
    `<b>Première brique.</b> La barre latérale et la bande du haut, avec <b>tes vraies données</b> `
    +`(${nb} séance${nb>1?'s':''} lue${nb>1?'s':''} depuis ce navigateur) et les couleurs de Force Tracker. `
    +`Les écrans marqués « bientôt » ne sont pas encore portés — ils sont là pour montrer la structure, `
    +`pas pour faire croire qu'ils marchent. À suivre : les graphiques, le calendrier, la figurine.`;
}

document.addEventListener('DOMContentLoaded',()=>{ _dNav(); try{ renderDashboard(); }catch(e){
  const n=document.getElementById('dash-note');
  if(n)n.innerHTML='<b style="color:var(--red)">Le tableau de bord n\'a pas pu se construire.</b><br>'+String(e&&e.message||e);
}});
