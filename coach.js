// ─── COACH IA ─────────────────────────────────────────────────
const COACH_FREE_LIMIT = 10;
let coachHistory = [];
let coachBusy = false;
let _coachHistLoaded = false;

// ═══ QUESTIONNAIRE « Milo apprend à te connaître » ═══════════════════════
// 100% GRATUIT et hors quota : ce sont des choix stockés en local (pas d'appel IA),
// puis injectés dans le contexte que reçoit Milo. Une série gratuite + une série
// premium plus poussée. type: 'single' | 'multi' | 'text'.
const COACH_QUIZ = [
  {id:'xp', q:'Depuis combien de temps tu t\'entraînes ?', t:'single', opts:[['debut','Je débute (ou je reprends)'],['6m','Moins de 6 mois'],['2a','6 mois à 2 ans'],['5a','2 à 5 ans'],['5p','Plus de 5 ans']]},
  {id:'freq', q:'Combien de séances par semaine tu peux vraiment tenir ?', t:'single', opts:[['1','1 à 2'],['3','3'],['4','4'],['5','5 ou plus']]},
  {id:'place', q:'Où tu t\'entraînes le plus souvent ?', t:'single', opts:[['salle','Salle complète'],['basic','Salle basique / peu de machines'],['maison','Maison avec du matériel'],['pdc','Maison sans matériel (poids du corps)']]},
  {id:'time', q:'Combien de temps dure une séance en général ?', t:'single', opts:[['30','~30 min'],['45','~45 min'],['60','~1 h'],['90','1 h 30 ou plus']]},
  {id:'bar', q:'Ton aisance avec les mouvements à la barre (squat, soulevé, développé) ?', t:'single', opts:[['jamais','Jamais essayé'],['debut','Débutant, pas à l\'aise'],['ok','Ça va'],['pro','Très à l\'aise']]},
  {id:'motiv', q:'Qu\'est-ce qui te motive le plus ?', t:'single', opts:[['fort','Me sentir plus fort'],['corps','Me sentir mieux dans mon corps'],['sante','La santé, le bien-être'],['esth','L\'esthétique, la définition'],['perf','La compétition / la performance']]},
  {id:'weak', q:'Quel groupe tu trouves le plus dur à faire progresser ?', t:'single', opts:[['pecs','Pectoraux'],['dos','Dos'],['jambes','Jambes'],['epaules','Épaules'],['bras','Bras'],['abdos','Abdos'],['nsp','Je ne sais pas']]},
  {id:'cardio', q:'Ta relation avec le cardio ?', t:'single', opts:[['jamais','J\'en fais jamais'],['peu','Un peu à l\'échauffement'],['reg','Régulièrement'],['deteste','Je déteste ça']]},
  {id:'pain', q:'Des zones sensibles / anciennes blessures à ménager ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['aucune','Aucune'],['epaules','Épaules'],['dos','Dos / lombaires'],['genoux','Genoux'],['poignets','Poignets'],['coudes','Coudes'],['hanches','Hanches'],['cou','Cou / nuque']]},
  {id:'energy', q:'En ce moment, ton énergie et ton sommeil, c\'est plutôt…', t:'single', opts:[['top','Au top'],['ok','Correct'],['fatigue','Souvent fatigué'],['dors_mal','Je dors mal']]},
  {id:'goalfeel', q:'Ton objectif du moment, en une idée ?', t:'single', opts:[['muscle','Prendre du muscle'],['force','Devenir plus fort'],['secher','Perdre du gras / sécher'],['forme','Me remettre en forme'],['maintien','Entretenir / rester au niveau']]},
  {id:'diet0', q:'Ton alimentation en ce moment ?', t:'single', opts:[['propre','Plutôt propre / je fais attention'],['moyen','Ça dépend des jours'],['relax','Je mange ce que je veux'],['nsp','Je ne sais pas trop']]},
  {id:'tone', q:'Comment tu veux que Milo te parle ?', t:'single', opts:[['cash','Cash et direct'],['motiv','Motivant et encourageant'],['tech','Technique et précis'],['fun','Détendu, avec de l\'humour']]},
];
const COACH_QUIZ_PRO = [
  {id:'job', q:'Ton quotidien (hors sport) est plutôt…', t:'single', opts:[['bureau','Sédentaire / bureau'],['debout','Debout, peu de déplacements'],['actif','Actif, en mouvement (serveuse, infirmier…)'],['physique','Travail physique dur']]},
  {id:'stress', q:'Ton niveau de stress général ?', t:'single', opts:[['bas','Faible'],['moy','Modéré'],['haut','Élevé']]},
  {id:'sleep', q:'Tu dors combien d\'heures par nuit en moyenne ?', t:'single', opts:[['5','Moins de 6 h'],['7','6 à 7 h'],['8','7 à 8 h'],['9','Plus de 8 h']]},
  {id:'prot', q:'Tu atteins tes protéines la plupart du temps ?', t:'single', opts:[['oui','Oui, presque toujours'],['souvent','Souvent'],['rare','Rarement'],['nsp','Je ne sais pas']]},
  {id:'split', q:'Ta façon de découper tes séances préférée ?', t:'single', opts:[['full','Full body (tout le corps)'],['hb','Haut / Bas'],['ppl','Push / Pull / Legs'],['split','Un muscle par séance'],['nsp','Je ne sais pas']]},
  {id:'deadline', q:'Tu as une échéance précise ?', t:'single', opts:[['compet','Oui, une compétition'],['event','Oui, un événement (vacances, photo…)'],['non','Non, sur le long terme']]},
  {id:'progr', q:'Tu as déjà suivi un vrai programme structuré ?', t:'single', opts:[['ok','Oui, et ça a marché'],['abandon','Oui, mais abandonné'],['jamais','Jamais vraiment']]},
  {id:'block', q:'Là où tu bloques le plus ?', t:'single', opts:[['regul','La régularité'],['tech','La technique'],['recup','La récup / le sommeil'],['nut','La nutrition'],['plateau','Un plateau de force'],['motiv','La motivation']]},
  {id:'supp', q:'Tu prends des compléments ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['aucun','Aucun'],['whey','Protéine / whey'],['crea','Créatine'],['prewk','Pré-workout'],['omega','Oméga 3'],['vitd','Vitamine D'],['autre','Autres']]},
  {id:'equip', q:'Matériel dispo (en plus des machines) ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['barre','Barre olympique'],['halteres','Haltères lourds'],['poulies','Poulies'],['elastiques','Élastiques'],['kb','Kettlebell'],['rack','Rack / cage'],['rien','Rien de spécial']]},
  {id:'like', q:'Les exercices que tu ADORES (facultatif)', t:'text', hint:'Dis à Milo ce que tu préfères — il en tiendra compte.'},
  {id:'hate', q:'Les exercices que tu ÉVITES ou détestes (facultatif)', t:'text', hint:'Il évitera de te les imposer.'},
];
// Libellé lisible d'une réponse (pour le contexte Milo)
function _cqLabel(quiz,qid,val){
  const q=quiz.find(x=>x.id===qid); if(!q||!q.opts)return val;
  const find=v=>{const o=q.opts.find(o=>o[0]===v);return o?o[1]:v;};
  return Array.isArray(val)?val.map(find).join(', '):find(val);
}
// Bloc de contexte injecté dans buildCoachContext
function _coachQuizContext(){
  const out=[];
  const fmt=(quiz,ans)=>{
    quiz.forEach(q=>{
      const v=ans[q.id];
      if(v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length))return;
      const val=q.t==='text'?String(v):_cqLabel(quiz,q.id,v);
      if(val&&String(val).trim())out.push(`- ${q.q.replace(/\s*\(facultatif\)/i,'')} → ${val}`);
    });
  };
  if(S.coachQuiz&&S.coachQuiz.answers)fmt(COACH_QUIZ,S.coachQuiz.answers);
  if(S.coachQuizPro&&S.coachQuizPro.answers)fmt(COACH_QUIZ_PRO,S.coachQuizPro.answers);
  if(!out.length)return '';
  return '\n🗣️ CE QUE LA PERSONNE A DIT SUR ELLE (questionnaire) — utilise-le pour vraiment personnaliser (ne le récite pas bêtement, sers-t\'en) :\n'+out.join('\n')+'\n';
}

// ── Réponses qui font AUSSI partie du profil → écrites direct dans le profil ──
// (évite de redemander une info déjà connue, et remplit le profil au passage)
const _CQ_PROFILE = {
  goalfeel: { set:'setGoal',     map:{muscle:'muscle',force:'force',secher:'perte',forme:'equilibre'},
              from:()=>({muscle:'muscle',force:'force',perte:'secher',equilibre:'forme'}[S.goal]) },
  job:      { set:'setWorkType', map:{bureau:'bureau',debout:'debout',actif:'actif',physique:'physique'},
              from:()=>({bureau:'bureau',debout:'debout',actif:'actif',physique:'physique'}[S.workType]) },
};
function _applyQuizToProfile(quiz,ans){
  quiz.forEach(q=>{
    const m=_CQ_PROFILE[q.id]; if(!m)return;
    const v=ans[q.id]; if(v===undefined||v==='')return;
    const target=m.map[v]; if(target===undefined)return;
    try{ if(typeof window[m.set]==='function')window[m.set](target); else S[m.set==='setGoal'?'goal':'workType']=target; }catch(e){}
  });
}

// ── UI du questionnaire ──────────────────────────────────────────────────
let _cqSet='free';      // 'free' | 'pro'
let _cqIdx=0;
let _cqAns={};          // copie de travail
let _cqSingle=false;    // mode "1 seule question" (question de la semaine premium)
function _cqQuiz(){return _cqSet==='pro'?COACH_QUIZ_PRO:COACH_QUIZ;}
// Première question avancée sans réponse (clé absente) — null si toutes posées
function _nextProUnanswered(){
  const a=(S.coachQuizPro&&S.coachQuizPro.answers)||{};
  return COACH_QUIZ_PRO.find(q=>!Object.prototype.hasOwnProperty.call(a,q.id))||null;
}
function _proAnsweredCount(){
  const a=(S.coachQuizPro&&S.coachQuizPro.answers)||{};
  return COACH_QUIZ_PRO.filter(q=>Object.prototype.hasOwnProperty.call(a,q.id)).length;
}
// Question de la semaine "due" : premium, reste des questions, et ≥7 j depuis la dernière posée
function _weeklyDue(){
  if(!S.premium)return false;
  if(!_nextProUnanswered())return false;
  const la=S.coachQuizPro&&S.coachQuizPro.lastAsked;
  if(!la)return true;
  return (Date.now()-new Date(la).getTime())/86400000 >= 7;
}
function _renderCoachQuizCard(){
  const el=document.getElementById('coach-quiz-card'); if(!el)return;
  const freeDone=!!(S.coachQuiz&&S.coachQuiz.done);
  let html='';
  if(!freeDone){
    html=`<button class="cq-card" onclick="openCoachQuiz('free')">
      <div class="cq-card-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 0 1-9 9 9.5 9.5 0 0 1-4-.9L3 21l1.9-5A9 9 0 1 1 21 12z"/></svg></div>
      <div style="flex:1;min-width:0;"><div class="cq-card-ttl">Milo veut apprendre à te connaître</div><div class="cq-card-sub">Quelques questions rapides (gratuit, ça ne compte pas dans tes questions) pour des conseils sur-mesure.</div></div></button>`;
    el.innerHTML=html; return;
  }
  // Série gratuite faite
  html=`<button class="cq-card done" onclick="openCoachQuiz('free')">
    <div class="cq-card-ic" style="background:rgba(52,211,153,.16);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <div style="flex:1;min-width:0;"><div class="cq-card-ttl">Milo te connaît ✅</div><div class="cq-card-sub">Tape pour revoir ou modifier tes réponses.</div></div></button>`;
  const cnt=_proAnsweredCount(), tot=COACH_QUIZ_PRO.length;
  const proAllAsked=!_nextProUnanswered();
  const gem='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  const chk='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const cal='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  if(proAllAsked){
    html+=`<button class="cq-card done" style="margin-top:8px;" onclick="openCoachQuiz('pro')">
      <div class="cq-card-ic" style="background:rgba(52,211,153,.16);">${chk}</div>
      <div style="flex:1;min-width:0;"><div class="cq-card-ttl">Questions avancées ✅</div><div class="cq-card-sub">Tape pour revoir tes réponses.</div></div></button>`;
  } else if(!S.premium){
    html+=`<button class="cq-card" style="margin-top:8px;opacity:.92;" onclick="openCoachQuiz('pro')">
      <div class="cq-card-ic" style="background:rgba(234,179,8,.16);">${gem}</div>
      <div style="flex:1;min-width:0;"><div class="cq-card-ttl">Questions avancées <span style="color:var(--gold);">⭐ Premium</span></div><div class="cq-card-sub">Va plus loin : nutrition, récup, matériel, préférences… pour un ciblage encore plus fin.</div></div></button>`;
  } else if(_weeklyDue()){
    // Question de la semaine (une seule, pas tous les jours)
    html+=`<button class="cq-card" style="margin-top:8px;" onclick="openWeeklyProQuestion()">
      <div class="cq-card-ic" style="background:rgba(234,179,8,.16);">${cal}</div>
      <div style="flex:1;min-width:0;"><div class="cq-card-ttl">La question de la semaine de Milo</div><div class="cq-card-sub">1 petite question pour mieux te connaître · ${cnt}/${tot} déjà répondues. Tu peux aussi tout remplir d'un coup.</div></div></button>`;
  } else {
    // Déjà posée cette semaine — bilan discret, remplissage groupé possible
    html+=`<button class="cq-card done" style="margin-top:8px;" onclick="openCoachQuiz('pro')">
      <div class="cq-card-ic" style="background:rgba(234,179,8,.16);">${gem}</div>
      <div style="flex:1;min-width:0;"><div class="cq-card-ttl">Questions avancées · ${cnt}/${tot}</div><div class="cq-card-sub">Milo t'a posé sa question de la semaine 👍 Reviens la semaine prochaine, ou tape pour tout remplir maintenant.</div></div></button>`;
  }
  el.innerHTML=html;
}
function openCoachQuiz(set){
  if(set==='pro'&&!S.premium){ if(typeof showPremiumWall==='function')showPremiumWall(); return; }
  _cqSet=set; _cqSingle=false;
  const store=set==='pro'?S.coachQuizPro:S.coachQuiz;
  _cqAns=(store&&store.answers)?JSON.parse(JSON.stringify(store.answers)):{};
  // reprend à la 1re question avancée non posée (sinon au début)
  if(set==='pro'){ const nx=_nextProUnanswered(); _cqIdx=nx?COACH_QUIZ_PRO.indexOf(nx):0; }
  else _cqIdx=0;
  _cqPrefillFromProfile();
  const ov=document.getElementById('ov-coach-quiz'); if(ov)ov.classList.add('open');
  _renderCoachQuizStep();
}
// Question de la semaine premium : une seule question (la prochaine non posée)
function openWeeklyProQuestion(){
  if(!S.premium){ if(typeof showPremiumWall==='function')showPremiumWall(); return; }
  const q=_nextProUnanswered(); if(!q){ _renderCoachQuizCard(); return; }
  _cqSet='pro'; _cqSingle=true;
  _cqAns=(S.coachQuizPro&&S.coachQuizPro.answers)?JSON.parse(JSON.stringify(S.coachQuizPro.answers)):{};
  _cqIdx=COACH_QUIZ_PRO.indexOf(q);
  _cqPrefillFromProfile();
  // marque "posée cette semaine" tout de suite → pas de relance même si fermée sans répondre
  if(!S.coachQuizPro)S.coachQuizPro={answers:{},done:false};
  S.coachQuizPro.lastAsked=new Date().toISOString().slice(0,10);
  if(typeof persist==='function')persist();
  const ov=document.getElementById('ov-coach-quiz'); if(ov)ov.classList.add('open');
  _renderCoachQuizStep();
}
// Pré-sélectionne depuis le profil les questions qui recoupent le profil (si pas déjà répondues)
function _cqPrefillFromProfile(){
  _cqQuiz().forEach(q=>{
    const m=_CQ_PROFILE[q.id]; if(!m)return;
    if(_cqAns[q.id]!==undefined)return;
    try{ const v=m.from&&m.from(); if(v)_cqAns[q.id]=v; }catch(e){}
  });
}
function closeCoachQuiz(){ const ov=document.getElementById('ov-coach-quiz'); if(ov)ov.classList.remove('open'); _cqSingle=false; }
function _renderCoachQuizStep(){
  const quiz=_cqQuiz();
  const total=quiz.length;
  const q=quiz[_cqIdx];
  const titleEl=document.getElementById('cq-title');
  if(titleEl){
    if(_cqSingle){
      titleEl.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Question de la semaine';
    } else {
      titleEl.innerHTML=(_cqSet==='pro'
        ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Questions avancées'
        :'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9 9.5 9.5 0 0 1-4-.9L3 21l1.9-5A9 9 0 1 1 21 12z"/></svg>Milo te connaît')
        +` <span style="color:var(--t3);font-weight:600;font-size:13px;">${_cqIdx+1}/${total}</span>`;
    }
  }
  const fill=document.getElementById('cq-progress-fill'); if(fill)fill.style.width=(_cqSingle?(_proAnsweredCount()/total*100):(_cqIdx/total*100))+'%';
  const step=document.getElementById('cq-step'); if(!step)return;
  const cur=_cqAns[q.id];
  let body=`<div class="cq-q">${q.q}</div>`;
  if(q.hint)body+=`<div class="cq-hint">${q.hint}</div>`;
  if(q.t==='text'){
    body+=`<textarea class="cq-textarea" id="cq-text" placeholder="Écris ici…" oninput="_cqAns['${q.id}']=this.value">${cur?String(cur).replace(/</g,'&lt;'):''}</textarea>`;
  } else {
    body+='<div class="cq-opts">';
    q.opts.forEach(o=>{
      const sel=q.t==='multi'?(Array.isArray(cur)&&cur.includes(o[0])):(cur===o[0]);
      body+=`<button class="cq-opt${sel?' sel':''}" onclick="_coachQuizPick('${q.id}','${o[0]}',${q.t==='multi'})">${o[1]}<span class="cq-check">✓</span></button>`;
    });
    body+='</div>';
  }
  step.innerHTML=body;
  // Boutons nav
  const prev=document.getElementById('cq-prev'); if(prev)prev.style.visibility=(_cqSingle||_cqIdx===0)?'hidden':'visible';
  const last=_cqIdx===total-1;
  const next=document.getElementById('cq-next'); if(next)next.innerHTML=(_cqSingle?'Enregistrer ✓':(last?'Terminer ✓':'Suivant ▸'));
  const skip=document.getElementById('cq-skip'); if(skip)skip.style.display=(q.t==='text')?'none':'';
}
function _coachQuizPick(qid,val,multi){
  if(multi){
    let arr=Array.isArray(_cqAns[qid])?_cqAns[qid].slice():[];
    // "aucune"/"aucun"/"rien" = exclusif
    const excl=['aucune','aucun','rien'];
    if(excl.includes(val)){ arr=[val]; }
    else { arr=arr.filter(x=>!excl.includes(x)); const i=arr.indexOf(val); if(i>=0)arr.splice(i,1); else arr.push(val); }
    _cqAns[qid]=arr;
    _renderCoachQuizStep();
  } else {
    _cqAns[qid]=val;
    _renderCoachQuizStep();
    // avance auto après un court délai (single choice) — en mode "1 question" ça termine
    setTimeout(()=>{ const ov=document.getElementById('ov-coach-quiz'); if(ov&&ov.classList.contains('open')) _coachQuizNext(); },230);
  }
}
function _coachQuizPrev(){ if(_cqIdx>0){_cqIdx--;_renderCoachQuizStep();} }
function _coachQuizNext(skip){
  if(_cqSingle){ _finishCoachQuiz(); return; }
  const quiz=_cqQuiz();
  if(_cqIdx<quiz.length-1){ _cqIdx++; _renderCoachQuizStep(); }
  else { _finishCoachQuiz(); }
}
function _finishCoachQuiz(){
  const today=new Date().toISOString().slice(0,10);
  // En mode "1 question", marque la question posée (même si passée sans répondre) pour ne pas la reproposer
  if(_cqSingle){ const q=COACH_QUIZ_PRO[_cqIdx]; if(q&&_cqAns[q.id]===undefined)_cqAns[q.id]=''; }
  if(_cqSet==='pro'){
    const prev=S.coachQuizPro||{};
    S.coachQuizPro={ answers:JSON.parse(JSON.stringify(_cqAns)),
      done: COACH_QUIZ_PRO.every(q=>Object.prototype.hasOwnProperty.call(_cqAns,q.id)),
      lastAsked: today, date: prev.date||today };
    _applyQuizToProfile(COACH_QUIZ_PRO,_cqAns);
  } else {
    S.coachQuiz={ answers:JSON.parse(JSON.stringify(_cqAns)), done:true, date:today };
    _applyQuizToProfile(COACH_QUIZ,_cqAns);
  }
  if(typeof persist==='function')persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  const single=_cqSingle;
  closeCoachQuiz();
  _renderCoachQuizCard();
  if(typeof toast==='function')toast(single?'Merci ! Milo en sait un peu plus 👍':(_cqSet==='pro'?'Milo en sait encore plus sur toi 💪':'Milo te connaît mieux maintenant 💪'),'success');
}

// ─── Historique du chat persisté (survit à la fermeture de l'appli) ───
// Stocké local (ft4_coach_hist). Léger : les photos deviennent "[photo]" (pas de base64 stocké).
function _loadCoachHist(){
  try{
    const raw = localStorage.getItem('ft4_coach_hist');
    if(raw){ const arr = JSON.parse(raw); if(Array.isArray(arr)) coachHistory = arr; }
  }catch(e){ coachHistory = []; }
}
function _saveCoachHist(){
  try{
    const light = coachHistory.slice(-20).map(m=>({
      role: m.role,
      content: (typeof m.content === 'string') ? m.content
             : (Array.isArray(m.content) ? ((m.content.find(p=>p&&p.type==='text')||{}).text ? '[photo] ' + (m.content.find(p=>p&&p.type==='text').text) : '[photo]') : '')
    }));
    localStorage.setItem('ft4_coach_hist', JSON.stringify(light));
  }catch(e){}
}
// Reconstruit les bulles à l'écran depuis coachHistory (à l'ouverture de l'appli)
function _renderCoachThread(){
  const msgs = document.getElementById('coach-msgs');
  if(!msgs) return;
  msgs.innerHTML = '';
  coachHistory.forEach(m=>{
    const t = (typeof m.content === 'string') ? m.content
            : (Array.isArray(m.content) ? ((m.content.find(p=>p&&p.type==='text')||{}).text || '[photo]') : '');
    if(m.role === 'user') renderCoachMsg('user', t || '[photo]');
    else if(t) renderCoachMsg('coach', t);
  });
  msgs.scrollTop = msgs.scrollHeight;
}
// Nouvelle discussion : vide le fil (garde la mémoire long-terme de Milo intacte)
function newCoachChat(){
  const go=()=>{
    coachHistory = [];
    try{ localStorage.removeItem('ft4_coach_hist'); }catch(e){}
    const msgs=document.getElementById('coach-msgs'); if(msgs) msgs.innerHTML='';
    updateCoachHeader();
    if(typeof toast==='function') toast('Nouvelle discussion','info');
  };
  if(coachHistory.length && typeof showConfirm==='function'){
    showConfirm('Nouvelle discussion ?','Le fil affiché sera effacé. Milo garde quand même l\'essentiel de vos échanges en mémoire.',go);
  } else go();
}

function _showCoachChat(){
  const home=document.getElementById('coach-home');
  const msgs=document.getElementById('coach-msgs');
  const suggs=document.getElementById('coach-suggs');
  if(home)home.style.display='none';
  if(msgs){msgs.style.display='flex';msgs.style.flexDirection='column';}
  if(suggs)suggs.style.display='flex';
}
function _updateCoachCtxTags(){
  const morphoTag=document.getElementById('coach-ctx-morpho');
  const cycleTag=document.getElementById('coach-ctx-cycle');
  if(morphoTag)morphoTag.style.display=(S.morpho||S.morphotype)?'':'none';
  if(cycleTag)cycleTag.style.display=(S.gender==='F'&&S.mensCycleStart)?'':'none';
}
function coachAction(type){
  const prompts={
    programme:'Génère-moi un programme d\'entraînement personnalisé basé sur mes 1RM actuels, mon niveau et mon objectif. Donne-moi les exercices, séries×reps et %1RM pour chaque séance.',
    analyse:'Analyse ma progression sur les 4 dernières semaines : volume total, tendances 1RM, points forts et points à améliorer. Donne des recommandations concrètes.',
    nutrition:'Conseille mes macros en fonction de ma phase actuelle (charge/décharge), mon TDEE et mon objectif. Donne le timing optimal des repas autour de l\'entraînement.',
    morpho:null
  };
  if(type==='morpho'){openMorphoAnalysis();return;}
  if(!S.premium&&(S.coachFree||0)>=COACH_FREE_LIMIT){showPremiumWall();return;}
  _showCoachChat();
  if(type==='force'){ _forceProgReq=true; sendToCoach(_buildForceMessage(),_forceDisplayMsg()); return; }
  sendToCoach(prompts[type]);
}

// ─── Progresser en force (Big 3) — programme téléchargeable ───────────────
let _forceProgReq=false;      // vrai le temps d'une génération de programme force
let _pendingForceProgs=[];    // programmes parsés en attente d'enregistrement
function _forceRM(n){const p=S.prs&&S.prs[n];return p&&p.rm1?Math.round(p.rm1):null;}
function _forceDisplayMsg(){
  const sq=_forceRM('Squat à la Barre'),dc=_forceRM('Développé Couché'),sdt=_forceRM('Soulevé de Terre');
  const parts=[];if(sq)parts.push('Squat '+sq);if(dc)parts.push('DC '+dc);if(sdt)parts.push('SDT '+sdt);
  return '🏋️ Génère-moi un programme pour gagner en force'+(parts.length?' (mes maxes : '+parts.join(', ')+' kg)':'')+'.';
}
function _buildForceMessage(){
  const sq=_forceRM('Squat à la Barre'),dc=_forceRM('Développé Couché'),sdt=_forceRM('Soulevé de Terre');
  const f=v=>v?(v+' kg'):'inconnu (estime-le à partir de mes séances)';
  return 'Je fais de la FORCE ATHLÉTIQUE et je veux augmenter mes maxes (1RM) sur les 3 mouvements de compétition. '
    +'Mes 1RM actuels : Squat '+f(sq)+', Développé Couché '+f(dc)+', Soulevé de Terre '+f(sdt)+'.\n'
    +'Donne-moi (1) un court conseil personnalisé, puis (2) un PROGRAMME de force structuré et progressif '
    +'(périodisation accumulation → intensification → peak) pour faire monter ces 3 lifts.\n'
    +'IMPORTANT : termine ta réponse par un bloc de code json (entre ```json et ```) au format EXACT suivant, pour que je puisse l\'enregistrer dans l\'app :\n'
    +'{"name":"Force Big 3","days":[{"label":"Jour 1 — Squat","exs":[{"name":"Squat à la Barre","sets":[{"kg":0,"reps":5,"type":"N","rest":180}]}]}]}\n'
    +'Règles du json : "type" = "N" (série normale) ou "W" (échauffement) ; "kg" = charge conseillée en kg calculée depuis mon 1RM (un pourcentage réaliste) ; "reps" entier ; "rest" en secondes ; 3 à 4 séances (days) par semaine ; '
    +'utilise EXACTEMENT ces noms pour les mouvements principaux : "Squat à la Barre", "Développé Couché", "Soulevé de Terre".';
}
// Extrait le programme JSON de la réponse + renvoie le texte visible nettoyé
function _extractForceProgram(reply){
  try{
    let m=reply.match(/```json\s*([\s\S]*?)```/i);
    let jsonStr=m?m[1]:null;
    if(!jsonStr){const m2=reply.match(/\{[\s\S]*?"days"[\s\S]*\}/);jsonStr=m2?m2[0]:null;}
    if(!jsonStr){const m3=reply.match(/\{[\s\S]*?"exs"[\s\S]*\}/);jsonStr=m3?m3[0]:null;}
    if(!jsonStr)return null;
    const prog=JSON.parse(jsonStr.trim());
    if(!prog||(!prog.days&&!prog.exs))return null;
    let clean=reply.replace(/```json[\s\S]*?```/i,'').replace(/```[\s\S]*?```/g,'').trim();
    if(!clean)clean=reply.replace(/\{[\s\S]*\}/,'').trim();
    return {prog,clean};
  }catch(e){console.warn('[force prog] parse',e);return null;}
}
// Normalise le JSON du modèle vers la structure S.programmes
function _normalizeForceProg(prog){
  const norm=ex=>({name:String(ex.name||'Exercice'),
    sets:(Array.isArray(ex.sets)?ex.sets:[]).map(s=>({kg:parseFloat(s.kg)||0,reps:parseInt(s.reps)||5,type:(s.type==='W'?'W':'N'),rest:parseInt(s.rest)||0}))});
  const out={id:'p'+Date.now(),name:String(prog.name||'Programme Force'),force:true};
  if(Array.isArray(prog.days)&&prog.days.length){
    out.days=prog.days.map((d,i)=>({label:String(d.label||('Jour '+(i+1))),exs:(Array.isArray(d.exs)?d.exs:[]).map(norm)}));
    if(prog.weeks)out.weeks=parseInt(prog.weeks)||0;
  }else{
    out.exs=(Array.isArray(prog.exs)?prog.exs:[]).map(norm);
  }
  return out;
}
// Ajoute le bouton « Enregistrer ce programme » sous la dernière bulle coach
function _appendSaveProgBtn(prog){
  const norm=_normalizeForceProg(prog);
  if((!norm.days||!norm.days.length)&&(!norm.exs||!norm.exs.length))return;
  const idx=_pendingForceProgs.push(norm)-1;
  const msgs=document.getElementById('coach-msgs');if(!msgs)return;
  const bubbles=msgs.querySelectorAll('.msg-coach');
  const last=bubbles[bubbles.length-1];if(!last)return;
  const nDays=norm.days?norm.days.length:1;
  const wrap=document.createElement('div');
  wrap.className='coach-prog-save';
  wrap.innerHTML='<button class="btn btn-red" style="width:100%;margin-top:10px;padding:11px;font-size:14px;border-radius:12px;" onclick="_saveForceProgram('+idx+',this)">💾 Enregistrer ce programme ('+nDays+(nDays>1?' séances':' séance')+')</button>';
  last.appendChild(wrap);
  msgs.scrollTop=msgs.scrollHeight;
}
function _saveForceProgram(idx,btn){
  const prog=_pendingForceProgs[idx];
  if(!prog){toast('Programme introuvable','error');return;}
  if(!S.programmes)S.programmes=[];
  let name=prog.name,n=2;
  while(S.programmes.some(p=>p.name===name)){name=prog.name+' '+n;n++;}
  prog.name=name;
  S.programmes.push(prog);
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  if(btn){btn.textContent='✅ Enregistré dans Mes programmes';btn.disabled=true;btn.style.opacity='.7';}
  toast('"'+name+'" ajouté à Mes programmes 💪','success');
}

function updateCoachHeader() {
  if(!_coachHistLoaded){ _loadCoachHist(); _coachHistLoaded = true; }
  _updateCoachMorphoBtn();
  _updateCoachCtxTags();
  try{_renderCoachQuizCard();}catch(e){}
  // Cache le mur premium si l'utilisateur est maintenant premium
  if(S.premium){const wall=document.getElementById('coach-wall');if(wall)wall.style.display='none';}
  // Afficher accueil ou chat selon l'historique
  const newBtn=document.getElementById('coach-new-btn');
  if(coachHistory.length===0){
    const home=document.getElementById('coach-home');
    const msgs=document.getElementById('coach-msgs');
    const suggs=document.getElementById('coach-suggs');
    if(home)home.style.display='flex';
    if(msgs)msgs.style.display='none';
    if(suggs)suggs.style.display='none';
    if(newBtn)newBtn.style.display='none';
  } else {
    _showCoachChat();
    // Reconstruire le fil si l'écran est vide (ex. après réouverture de l'appli)
    const msgs=document.getElementById('coach-msgs');
    if(msgs && msgs.children.length===0) _renderCoachThread();
    if(newBtn)newBtn.style.display='flex';
  }
  const badge = document.getElementById('coach-quota-badge');
  if (!badge) return;
  if (S.premium) {
    if (S.premiumExpiry) {
      const msLeft = new Date(S.premiumExpiry) - new Date();
      const daysLeft = Math.ceil(msLeft / 86400000);
      badge.innerHTML = `<div class="coach-quota is-premium">⭐ Premium · ${daysLeft}j</div>`;
    } else {
      badge.innerHTML = '<div class="coach-quota is-premium">⭐ Premium</div>';
    }
  } else {
    const left = Math.max(0, COACH_FREE_LIMIT - (S.coachFree || 0));
    badge.innerHTML = `<div class="coach-quota">${left} question${left!==1?'s':''} gratuite${left!==1?'s':''}</div>`;
  }
}

function checkPremiumExpiry() {
  if (!S.premium || !S.premiumExpiry) return;
  const todayStr = new Date().toISOString().split('T')[0];
  if (S.premiumExpiry < todayStr) {
    S.premium = false;
    S.premiumExpiry = '';
    persist();
    updateCoachHeader();
    toast('Ton accès Premium a expiré. Renouvelle sur Ko-fi pour continuer.', 'info');
  }
}

function showPremiumWall() {
  // Ne pas afficher avant que le check serveur ait répondu
  if (window._premiumPending) return;
  const wall = document.getElementById('coach-wall');
  if (wall) wall.style.display = 'flex';
}

async function activatePremium() {
  const inp = document.getElementById('premium-code-inp');
  const code = (inp ? inp.value.trim() : '').toUpperCase();
  if (!code) { toast('Entre un code d\'accès', 'error'); return; }
  try {
    const resp = await fetch(S.url, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'validateCode', code, email: S.email })
    });
    const data = await resp.json();
    if (data.status === 'ok') {
      S.premium = true; persist();
      const wall = document.getElementById('coach-wall');
      if (wall) wall.style.display = 'none';
      updateCoachHeader();
      toast('🎉 Premium activé ! Coach IA illimité débloqué.', 'success');
    } else {
      toast('Code invalide ou expiré.', 'error');
    }
  } catch(e) { toast('Erreur de connexion', 'error'); }
}

// Décrit le temps écoulé depuis le dernier échange avec Milo (pour qu'il reprenne naturellement)
function _coachGapText() {
  let last = 0;
  try { last = parseInt(localStorage.getItem('ft4_coach_lastts') || '0') || 0; } catch(e) {}
  if (!last || !coachHistory.length) return '';
  const ms = Date.now() - last;
  const mins = ms / 60000;
  if (mins < 20) return ''; // conversation en cours : rien à signaler
  const d1 = new Date(last), d2 = new Date();
  const dayDiff = Math.floor((new Date(d2.getFullYear(),d2.getMonth(),d2.getDate()) - new Date(d1.getFullYear(),d1.getMonth(),d1.getDate())) / 86400000);
  let g;
  if (dayDiff === 0)      g = 'plus tôt aujourd\'hui (il y a ~' + Math.max(1, Math.round(ms/3600000)) + 'h)';
  else if (dayDiff === 1) g = 'hier';
  else if (dayDiff < 7)   g = 'il y a ' + dayDiff + ' jours';
  else if (dayDiff < 14)  g = 'il y a une semaine environ';
  else if (dayDiff < 60)  g = 'il y a ' + Math.round(dayDiff/7) + ' semaines';
  else                    g = 'il y a un moment (plus d\'un mois)';
  return '\n- VOTRE DERNIER ÉCHANGE remonte à ' + g + '. Rends-toi compte de ce délai : accueille la personne en fonction (ex. « content de te revoir », « alors, cette séance d\'hier ? », « ça faisait un moment ! ») — naturellement, sans en faire trop, et NE fais PAS comme si la conversation venait de s\'interrompre il y a 5 min.';
}
function buildCoachContext() {
  const bmr = calcBMR ? calcBMR() : '—';
  const tdee = calcTDEE ? calcTDEE() : '—';
  const macros = calcMacros ? calcMacros(S.nutritionPhase || 'charge') : {};
  const curWeek = S.cycle ? getCurrentCycleWeek() : null;
  const cyclePlan = S.cycle && curWeek ? getWeekPlan(curWeek, S.cycle.weeks) : null;

  // Moment de la journée (heure locale de la personne) — pour que Milo adapte salutation + conseils
  const _now = new Date();
  const _h = _now.getHours();
  const _period = _h < 5 ? 'nuit' : _h < 12 ? 'matin' : _h < 18 ? 'après-midi' : _h < 22 ? 'soirée' : 'nuit';
  const _dateStr = _now.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
  const _timeStr = _h + 'h' + String(_now.getMinutes()).padStart(2, '0');

  const prsText = Object.entries(S.prs).length > 0
    ? Object.entries(S.prs).map(([ex, d]) => `${ex}: ${d.kg}kg×${d.reps} (~${fmt(d.rm1)}kg 1RM)`).join(', ')
    : 'Aucun PR enregistré';

  const recentSessions = S.sessions.slice(0, 3).map(s => {
    const exStr = (s.exs||s.exercises||[]).map(e => {
      const ds = e.sets.filter(x => x.done);
      const nNorm = ds.filter(x => x.type==='N'||!x.type).length;
      const nFail = ds.filter(x => x.type==='X'||x.type==='E').length;
      const nWarm = ds.filter(x => x.type==='É'||x.type==='W').length;
      let tech = nNorm ? `${nNorm}s` : '';
      if (nWarm) tech += `+${nWarm}É`;
      if (nFail) tech += `+${nFail}X`;
      return `${e.name}(${tech})${e.note?' [note: '+e.note+']':''}`;
    }).join(', ');
    return `${s.date}: ${exStr} — ${s.volume}kg vol`;
  }).join(' | ') || 'Aucune séance';

  // Séance EN COURS (S.wkt) — permet au Coach d'aider PENDANT l'entraînement
  let wktText='';
  const _wkt=(typeof S!=='undefined')?S.wkt:null;
  if(_wkt&&_wkt.exs&&_wkt.exs.length){
    const _fmt=arr=>arr.map(x=>`${x.kg||'?'}×${x.reps||'?'}${(x.type&&x.type!=='N')?'('+x.type+')':''}`).join(', ');
    const exLines=_wkt.exs.map(e=>{
      const sets=e.sets||[];
      const done=sets.filter(x=>x.done);
      const todo=sets.filter(x=>!x.done);
      let l=`- ${e.name}`;
      if(done.length)l+=` — fait: ${_fmt(done)}`;
      if(todo.length)l+=` — à faire: ${_fmt(todo)}`;
      if(e.group)l+=' [superset]';
      if(e.dropset)l+=' [dropset]';
      if(e.note)l+=` [note: ${e.note}]`;
      return l;
    }).join('\n');
    wktText=`\nSÉANCE EN COURS — l'athlète s'entraîne MAINTENANT${_wkt.progLabel?' (programme: '+_wkt.progLabel+')':''}. Aide-le en DIRECT : proposer un exercice équivalent si une machine est prise, ajuster une charge (ex. "+2,5 kg vs la dernière fois"), conseiller l'ordre des exercices, gérer la fatigue.\n${exLines}\n`;
  }

  return `Tu es ${(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo')}, le coach personnel de cet athlète (expert en force athlétique et musculation). Tu réponds TOUJOURS en français. Maximum 200 mots sauf si l'athlète demande plus de détails.

TA PERSONNALITÉ :
- Ton naturel : franc, direct, avec un brin d'humour — jamais langue de bois, mais TOUJOURS bienveillant, jamais méchant ni rabaissant.
- Tu t'ADAPTES à la personne en face de toi (c'est le plus important) :
  • Niveau (lis ses records/séances) : débutant → sois pédagogue, rassurant, explique les bases sans jargon. Confirmé/avancé → sois technique, cash, va droit au but.
  • État du jour (lis récupération/sommeil/check-in) : fatigué, mauvaise nuit, moral bas → passe en mode soutien, allège, encourage. En forme → pousse-le, challenge-le.
  • Sa façon de parler : cale-toi sur son registre. Détendu s'il est détendu, sérieux s'il est sérieux. S'il est cash, familier, voire GROSSIER/vulgaire (jurons), tu peux l'être aussi — dans la complicité, pour créer le lien, JAMAIS pour rabaisser ni insulter la personne. S'il reste poli et posé, garde un langage propre. Miroir de son énergie, pas plus.
- Tu peux te référer à ce que tu sais de lui (ses records, ses dernières séances, ses objectifs) comme un vrai coach qui le suit.
- Sécurité avant tout : tu ne poses JAMAIS de diagnostic médical et tu ne remplaces pas un médecin. En cas de douleur/blessure, tu conseilles la prudence et un professionnel de santé.
- Français soigné : orthographe et accords corrects. Évite les anglicismes inutiles — dis « gainage » ou « sangle abdominale » (pas « core »), « à la suite » (pas « d'affilée » si ça sonne mal), « ischio-jambiers », etc. Un mot anglais est toléré seulement s'il est vraiment usuel en salle (dropset, hip thrust, pull-up…).

MOMENT PRÉSENT (heure locale de la personne) :
- On est ${_dateStr}, il est ${_timeStr} — c'est ${_period === 'nuit' && _h >= 22 ? 'le soir/la nuit (tard)' : _period}. Adapte ta salutation à l'heure (jamais « bonjour » le soir, plutôt « bonsoir » ; « salut » passe partout). ${_period === 'soirée' || _period === 'nuit' ? 'En soirée/la nuit : pense au sommeil et à la récupération ; une séance ou des stimulants (café, pré-workout) trop tard peuvent gêner l\'endormissement — mentionne-le avec tact si pertinent.' : _period === 'matin' ? 'Le matin : tu peux évoquer l\'énergie du réveil, un petit-déjeuner adapté avant/après séance.' : ''}${_coachGapText()}

PROFIL ATHLÈTE:
- Sexe: ${S.gender === 'H' ? 'Homme' : 'Femme'} | Âge: ${S.age} ans | Taille: ${S.height}cm | Poids: ${S.bw}kg
- BMR: ${bmr} kcal | TDEE: ${tdee} kcal
- Niveau activité sportive: ${S.activityLevel} | Type travail: ${{bureau:'Bureau/Sédentaire',debout:'Debout/Statique',actif:'Actif/En mouvement (serveur, infirmier…)',physique:'Travail Physique'}[S.workType]||'Bureau'} (+${calcWorkExtra()} kcal NEAT)
- Tabac: ${S.smoker?'Fumeur (BMR +7%, impact cardiovasculaire — adapter l\'intensité et conseiller l\'arrêt)':'Non-fumeur'}
- Objectif: ${GOAL_LABELS[S.goal||'muscle']} | Phase: ${S.nutritionPhase === 'charge' ? 'Charge (+100 kcal)' : 'Décharge (−100 kcal)'}
- Discipline pratiquée: ${(typeof DISC_LABELS!=='undefined'&&DISC_LABELS[S.discipline])||'Musculation'} — adapte tes conseils (exercices, répétitions, périodisation) à cette discipline
${S.level?`- Niveau: ${{debutant:'Débutant (encore récent en muscu — sois pédagogue, explique la technique, ne suppose pas les termes acquis, propose des charges prudentes)',intermediaire:'Intermédiaire (bases acquises — tu peux être plus technique et pousser la progression)',confirme:'Confirmé (expérimenté — parle-lui d\'égal à égal, techniques avancées bienvenues)'}[S.level]}`:''}
${S.gender==='F'?'- Ton ton avec elle: un peu plus à l\'écoute, doux et attentif — tout en restant franc, motivant et complice. Propose ton aide, demande comment elle se sent. (Sans jamais la materner ni la sous-estimer.)':''}
${S.level==='debutant'?`- Débutant·e : un « parcours débutant » (Étape 1 gratuite, machines guidées, 2 ou 3 séances/sem au choix, avec gainage/abdos) est disponible dans ses programmes — oriente-le/la dessus, explique les mouvements et rassure. Recommande aussi 10 à 15 min de cardio léger en fin de séance (bloc Cardio de l'app). Progression: +2,5 kg haut du corps / +5 kg jambes quand les séries passent (plus vite les premières semaines).`:''}
${(S.beginnerJourney&&S.beginnerJourney.phase===1)?`- Il/elle a démarré son parcours (Étape 1 « Découverte », ${S.beginnerJourney.freq} séances/sem, style ${S.beginnerJourney.style==='split'?'split':'full body'}). Objectif: tenir 3 semaines en montant les charges. Encourage, félicite la régularité, et prépare-le/la à la suite du parcours.`:''}
${(()=>{const bmi=(S.bw&&S.height)?S.bw/((S.height/100)**2):0;return (bmi>=28||S.goal==='perte')?`- Attention au poids/articulations${bmi?` (IMC ~${Math.round(bmi)})`:''} : privilégie le cardio À FAIBLE IMPACT (vélo, marche rapide, elliptique, rameur — évite course/sauts qui tapent genoux et dos), une progression douce des charges, et un travail de gainage. Le cardio est important ici pour la santé cardiovasculaire et la perte de gras.`:''})()}
- Calories cible: ${macros.calories || '—'} kcal | Protéines: ${macros.prot_g || '—'}g | Glucides: ${macros.carbs_g || '—'}g | Lipides: ${macros.fat_g || '—'}g
${(typeof dietSummary==='function'&&dietSummary())?`- ⚠️ RÉGIME ALIMENTAIRE À RESPECTER: ${dietSummary()} — ne propose JAMAIS d'aliment ou de supplément non conforme (ex. végan → pas de whey/œufs, propose protéine végétale + B12 ; halal/sans porc → aucun porc/gélatine porcine ni alcool si sans alcool).`:''}
${(()=>{
  const bf_n=S.neck,bf_w=S.waist,bf_h=S.hip,bf_ht=S.height;
  let bf=null;
  if(bf_ht&&bf_n&&bf_w){
    try{if(S.gender==='H'&&bf_w>bf_n){bf=Math.round((495/(1.0324-0.19077*Math.log10(bf_w-bf_n)+0.15456*Math.log10(bf_ht))-450)*10)/10;}
    else if(S.gender==='F'&&bf_h&&bf_w+bf_h>bf_n){bf=Math.round((495/(1.29579-0.35004*Math.log10(bf_w+bf_h-bf_n)+0.22100*Math.log10(bf_ht))-450)*10)/10;}
    }catch(e){}
  }
  if(bf===null)return '';
  const cats=S.gender==='H'?[[6,'Essentiel'],[14,'Athlète'],[18,'Fitness'],[25,'Moyen'],[99,'Élevé']]:[[11,'Essentiel'],[21,'Athlète'],[25,'Fitness'],[32,'Moyen'],[99,'Élevé']];
  const cat=(cats.find(c=>bf<c[0])||cats[cats.length-1])[1];
  return `- Masse grasse: ${Math.max(2,bf)}% (${cat}, Méthode Marine US) — Masse maigre ~${Math.round(S.bw*(1-Math.max(2,bf)/100))}kg`;
})()}
${(()=>{const cp=getMensCyclePhase();return cp?`- Phase cycle menstruel: ${cp.phase} (Jour ${cp.day}/${S.mensCycleDur}) — ${cp.nutrition}`:'';})()}
${(()=>{
  const hasBf=((S.weightLog||[]).some(w=>w&&w.bf!=null))||((S.bodyScans||[]).length>0);
  if(!hasBf&&!S.scaleType)return '';
  const st=(typeof SCALE_TYPE_LABELS!=='undefined'&&SCALE_TYPE_LABELS[S.scaleType])||null;
  return '\n⚖️ MASSE GRASSE — à interpréter avec prudence : ses % de masse grasse viennent d\'une balance à impédance'+(st?' ('+st+')':'')+'. C\'est une mesure INDICATIVE, TRÈS variable d\'un modèle à l\'autre (une balance mains+pieds/segmentaire lit souvent PLUS HAUT qu\'une balance pieds seuls). Devant un SAUT de masse grasse, pense d\'ABORD à un changement de balance ou d\'hydratation — PAS à une vraie prise de gras, ne l\'alarme jamais là-dessus. Fie-toi à la TENDANCE sur une même balance. Le poids (kg) est fiable, le % de gras beaucoup moins.';
})()}
${(()=>{
  const MT={ecto:'Ectomorphe (ossature légère, métabolisme rapide, difficultés à prendre du muscle)',meso:'Mésomorphe (corps athlétique naturel, réagit vite à l\'entraînement)',endo:'Endomorphe (métabolisme lent, prend du poids facilement, difficultés à perdre de la graisse)'};
  const MH={H:'Rectangle (épaules/taille/hanches similaires)',A:'Triangle (hanches plus larges que les épaules)',T:'Trapèze (épaules légèrement plus larges que les hanches)',V:'Triangle inversé (épaules beaucoup plus larges que les hanches)',O:'Ovale (ventre et torse proéminents)'};
  const MF={H:'Rectangle',A:'Poire (hanches et cuisses plus larges)',V:'Triangle inversé (épaules plus larges)',X:'Sablier (taille très marquée)',O:'Ronde (poids concentré autour du ventre)'};
  const mt=S.morphotype?`- Morphotype: ${MT[S.morphotype]||S.morphotype}`:'';
  const mm=S.morpho?`- Silhouette: ${(S.gender==='F'?MF:MH)[S.morpho]||S.morpho} (type ${S.morpho})`:'';
  return [mt,mm].filter(Boolean).join('\n');
})()}
${(()=>{
  const hp=S.healthProfile;
  if(!hp||(!(hp.conditions||[]).length&&!(hp.injuries||[]).length&&!(hp.notes||'').trim()))return '';
  const cL={cardio:'Cardiologie/HTA',diabete:'Diabète',hernie:'Hernie discale',asthme:'Asthme',arthrite:'Arthrose/Arthrite',osteo:'Ostéoporose',epilepsie:'Épilepsie',migraine:'Migraines (éviter les efforts très intenses en apnée/Valsalva qui peuvent déclencher une crise, bien s\'hydrater — adapter en cas de crise)',endometriose:'Endométriose (peut freiner la perte de poids et jouer sur la fatigue/inflammation — en tenir compte pour la nutrition et l\'intensité)'};
  const zL={epaule_d:'Épaule D',epaule_g:'Épaule G',genou_d:'Genou D',genou_g:'Genou G',dos_bas:'Lombaires',dos_haut:'Dorsaux',hanche_d:'Hanche D',hanche_g:'Hanche G',cheville_d:'Cheville D',cheville_g:'Cheville G',coude_d:'Coude D',coude_g:'Coude G',poignet_d:'Poignet D',poignet_g:'Poignet G',cou:'Cou/Cervicales',autre:'Autre'};
  const sL={active:'active ⚠️',recente:'récente',ancienne:'ancienne/guérie'};
  const parts=[];
  if((hp.conditions||[]).length)parts.push('Conditions: '+(hp.conditions||[]).map(c=>cL[c]||c).join(', '));
  if((hp.injuries||[]).length)parts.push('Blessures: '+(hp.injuries||[]).map(i=>`${zL[i.zone]||i.zone} (${sL[i.status]||i.status})`).join(', '));
  if((hp.notes||'').trim())parts.push('Notes: '+hp.notes.trim());
  return '\n⚠️ PROFIL SANTÉ — adapter les conseils en conséquence:\n- '+parts.join('\n- ');
})()}
${(()=>{
  // Bilan visuel du corps : « Étude du corps » (S.bodyStudy) OU « Suivi photos »
  // super-testeur (S.bodySeries[].report). On prend le plus récent des deux.
  let bs=S.bodyStudy||null;
  const ser=(S.bodySeries||[]).filter(s=>s&&s.report).slice(-1)[0];
  if(ser){const r=Object.assign({date:ser.date},ser.report); if(!bs||!bs.date||(r.date&&r.date>=bs.date))bs=r;}
  if(!bs)return '';
  const L=[];
  if(bs.stature)L.push('Stature/posture: '+bs.stature);
  if(bs.insertions)L.push('Insertions: '+bs.insertions);
  if(bs.balance)L.push('Équilibre: '+bs.balance);
  if(bs.strengths)L.push('Points forts: '+bs.strengths);
  if(bs.weaknesses)L.push('À travailler: '+bs.weaknesses);
  if(bs.evolution)L.push('Évolution vs bilan précédent: '+bs.evolution);
  if(bs.summary)L.push('Résumé: '+bs.summary);
  if(bs.healthNotes)L.push('Santé prise en compte: '+bs.healthNotes);
  if(!L.length)return '';
  // Consigne ferme : Milo DOIT reconnaître et utiliser le bilan (ne jamais nier l'avoir).
  return '\n📐 ÉTUDE DU CORPS DE L\'UTILISATEUR — tu AS ce bilan (résumé texte de ses photos, réalisé le '+(bs.date||'?')+'). Tu DOIS t\'en servir pour cibler ses déséquilibres et proposer des exercices correctifs. NE DIS JAMAIS que tu n\'as pas accès à son bilan ni à ses photos : tu en as le résumé complet ci-dessous.\n- '+L.join('\n- ');
})()}
${_coachQuizContext()}
RECORDS PERSONNELS (1RM estimés):
${prsText}

CYCLE DE FORCE:
${S.cycle && S.cycle.active ? `Actif - Semaine ${curWeek}/${S.cycle.weeks} - Phase ${cyclePlan ? cyclePlan.phase : '—'} - ${cyclePlan ? cyclePlan.sets+'×'+cyclePlan.reps+' @ '+cyclePlan.pct+'%' : '—'}` : 'Aucun cycle actif'}

${wktText}
DERNIÈRES SÉANCES:
${recentSessions}

RÉCUPÉRATION & SOMMEIL:
${(()=>{
  const score=calcRecoveryScore();
  const info=getRecoveryInfo(score);
  const todayStr=today();
  const ts=S.sleepLog&&S.sleepLog.find(e=>e.date===todayStr);
  const qLabels={1:'Mauvais',2:'Moyen',3:'Bon',4:'Excellent'};
  const last3=S.sleepLog&&S.sleepLog.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  const avgH=last3&&last3.length?Math.round(last3.reduce((a,e)=>a+e.hours,0)/last3.length*10)/10:null;
  return `- Score récupération: ${score!==null?score+'/100 ('+info.label+')':'Non renseigné — données de sommeil manquantes'}
- Sommeil cette nuit: ${ts?ts.hours+'h | Qualité: '+qLabels[ts.quality||2]:'Non enregistré'}
${avgH?'- Moyenne sommeil (3j): '+avgH+'h':''}
- Conseil récupération: ${info.rec}
- Implication entraînement: ${score===null?'Demander les données de sommeil à l\'athlète':score<40?'Proposer UNIQUEMENT repos actif, étirements ou séance très légère. Déconseiller fortement tout effort maximal.':score<60?'Séance possible mais pas de records. Volume modéré, technique, pas de maxima.':score<80?'Séance normale. Peut progresser mais réserver les PRs pour les jours optimal.':'JOUR IDÉAL pour PRs et séances intensives. Corps en pleine capacité de récupération.'}`;
})()}

POIDS & COMPOSITION:
${(()=>{
  const wlog=S.weightLog?S.weightLog.slice().sort((a,b)=>a.date.localeCompare(b.date)):[];
  if(wlog.length<2)return '- Suivi de poids: Pas assez de données';
  const reg=linearRegression(wlog.map((p,i)=>({x:i,y:p.kg})));
  const weeklyChange=Math.round(reg.slope*7*100)/100;
  const latest=wlog[wlog.length-1];
  const goal=S.goal||'muscle';
  const onTrack=goal==='perte'&&weeklyChange<-0.1?true:goal==='muscle'&&weeklyChange>0.05?true:Math.abs(weeklyChange)<0.2;
  return `- Poids actuel: ${latest.kg} kg (${wlog.length} mesures)
- Tendance: ${weeklyChange>=0?'+':''}${weeklyChange} kg/semaine — ${onTrack?'✓ dans la bonne direction':'⚠ à ajuster selon objectif'}`;
})()}

CHECK-IN SÉANCES RÉCENTES:
${(()=>{
  const qE={1:'Épuisé',2:'Moyen',3:'Bien',4:'Optimal'};
  const qS={1:'Mauvais',2:'Moyen',3:'Bon',4:'Excellent'};
  const recent=S.sessions.filter(s=>s.checkin).slice(0,3);
  if(!recent.length)return '- Aucun check-in enregistré pour l\'instant';
  return recent.map(s=>`- ${s.date}: Énergie ${qE[s.checkin.energy]||'?'} · Sommeil ${qS[s.checkin.sleep]||'?'}`).join('\n');
})()}

${(()=>{
  const sc=(S.bodyScans||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  if(!sc.length)return '';
  const L=sc[0],P=sc[1];
  const p=(k,lbl,u)=>{if(L[k]==null)return '';let e='';if(P&&P[k]!=null){const d=+(L[k]-P[k]).toFixed(1);if(d!==0)e=` (${d>0?'+':''}${d} vs bilan préc.)`;}return `${lbl}: ${L[k]}${u||''}${e}`;};
  const parts=[p('weight','poids','kg'),p('bf','graisse','%'),p('fatMass','masse grasse','kg'),p('muscle','muscle','kg'),p('skMuscle','muscle squelettique','kg'),p('leanMass','masse maigre','kg'),p('bone','masse osseuse','kg'),p('water','eau','kg'),p('protein','protéine','kg'),p('visceral','graisse viscérale',''),p('subFat','graisse sous-cutanée','%'),p('bmr','métabolisme de base','kcal'),p('smi','indice muscle squelettique','kg/m²'),p('metaAge','âge corporel','ans'),p('imc','IMC',''),p('bodyScore','score corporel','/100')].filter(Boolean);
  const seg=[];
  const sp=(k,lbl,u)=>{if(L[k]!=null)seg.push(`${lbl}: ${L[k]}${u||''}`);};
  sp('armMuscleL','muscle bras G','kg');sp('armMuscleR','muscle bras D','kg');sp('trunkMuscle','muscle tronc','kg');sp('legMuscleL','muscle jambe G','kg');sp('legMuscleR','muscle jambe D','kg');
  sp('armFatL','graisse bras G','kg');sp('armFatR','graisse bras D','kg');sp('trunkFat','graisse tronc','kg');sp('legFatL','graisse jambe G','kg');sp('legFatR','graisse jambe D','kg');
  const segTxt=seg.length?`\nDÉTAIL PAR SEGMENT:\n- ${seg.join('\n- ')}`:'';
  return `\nBILAN CORPOREL (balance pro, le ${L.date}):\n- ${parts.join('\n- ')}${segTxt}\n⚠️ IMPORTANT: utilise UNIQUEMENT les chiffres ci-dessus. N'invente JAMAIS une valeur qui n'y figure pas (ni masse osseuse, ni détail bras/tronc/jambes, ni autre) — si tu ne l'as pas, ne cite aucun chiffre pour ça, parle en termes généraux. Rappelle que l'IMC seul est trompeur chez une personne musclée. Ne pose jamais de diagnostic médical.\n`;
})()}
${(()=>{
  const bt=(S.bloodTests||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(!bt.length)return '';
  const t=bt[0];const ms=(t.markers||[]);
  if(!ms.length)return '';
  const out=(m)=>{if(m.value==null)return false;if(m.low!=null&&m.value<m.low)return true;if(m.high!=null&&m.value>m.high)return true;return false;};
  const line=(m)=>`${m.name}: ${m.value}${m.unit?(' '+m.unit):''}${(m.low!=null||m.high!=null)?` (réf. ${m.low!=null?m.low:''}${(m.low!=null&&m.high!=null)?'-':''}${m.high!=null?m.high:''})`:''}${out(m)?' [hors norme]':''}`;
  const outs=ms.filter(out);
  const keys=['ferritine','glyc','cholest','hdl','ldl','triglyc','tsh','hémoglobine','vitamine d','testost','crp','asat','alat','ggt','créatinine'];
  const key=ms.filter(m=>keys.some(k=>String(m.name||'').toLowerCase().indexOf(k)>=0));
  const sel=[];const seen={};
  outs.concat(key).forEach(m=>{if(!seen[m.name]){seen[m.name]=1;sel.push(m);}});
  if(!sel.length)return '';
  return `\nBILAN SANGUIN (labo, le ${t.date||'?'}) — marqueurs clés:\n- ${sel.slice(0,16).map(line).join('\n- ')}\n⚠️ MÉDICAL : ce sont des chiffres recopiés du labo. Tu peux en parler en lien avec l'entraînement/récup/nutrition (ex. ferritine, glycémie, cholestérol) MAIS tu ne poses JAMAIS de diagnostic, tu ne dis jamais si c'est grave. Pour toute valeur [hors norme] ou toute inquiétude, renvoie SYSTÉMATIQUEMENT vers le médecin. Ne remplace jamais un professionnel de santé.\n`;
})()}
${S.premium&&S.coachMemory?`\nMÉMOIRE CONVERSATIONS PRÉCÉDENTES:\n${S.coachMemory}\n`:''}
MÉTHODE DE COACHING (très important) :
- ADAPTE la profondeur à son niveau : débutant → simple, pédagogue, priorité technique + sécurité ; intermédiaire/confirmé → technique, périodisation (phases de charge/décharge), notion de RPE et d'autorégulation. Jamais de conseils « bateau » servis à tout le monde.
- COMME UN VRAI COACH, quand ta réponse dépend d'infos que tu n'as pas (ressenti, douleur, matériel dispo, sensations, temps, objectif du jour), POSE 1 ou 2 questions ciblées AVANT de trancher — ne devine pas à l'aveugle. (Mais pas de question inutile si tu as déjà de quoi répondre.)
- Connais et PROPOSE spontanément les mouvements FONDAMENTAUX, pas seulement les machines : au-delà du Big 3 (squat, développé couché, soulevé de terre), les incontournables — tractions, dips, pompes, rowing, développé militaire, fentes — pour construire une vraie base. Un débutant qui ne fait que des machines, oriente-le progressivement vers ces basiques.
- NUANCES à connaître : le cardio LÉGER (échauffement 5-10 min, marche en pente, vélo/elliptique tranquille, LISS) est BON et n'abîme pas une séance de force — au contraire il prépare le corps. Seul le cardio LONG et INTENSE juste AVANT du lourd nuit (interférence/fatigue). Distingue bien travail de FORCE (lourd, peu de reps, longue récup) et HYPERTROPHIE (volume, reps modérées).${S.premium?'\n- PREMIUM : tu peux t\'appuyer sur des programmes reconnus et validés par le monde sportif (5/3/1 de Wendler, StrongLifts 5x5, Push/Pull/Legs, PHUL, GZCLP…) et les ADAPTER à la personne (niveau, dispo, matériel, objectif) — jamais copier-coller sans adapter.':''}
Utilise ces données pour personnaliser tes réponses et t'adapter à la personne en face. Reste toi-même : ${(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo')}, franc et pratique, mais calibré sur son niveau et son état du jour.`;
}

// Retire tout bloc technique (JSON de programme, blocs de code ```…```) — Milo ne doit JAMAIS montrer de JSON.
function _stripCoachTech(text){
  let t = String(text||'');
  t = t.replace(/```[\s\S]*?```/g, '');                       // blocs de code fermés
  t = t.replace(/```[a-zA-Z]*[\s\S]*$/g, '');                 // bloc de code non fermé (tronqué)
  t = t.replace(/\{[\s\S]*?"(?:days|exs|sets|weeks)"[\s\S]*\}/g, ''); // objet JSON programme (fermé)
  t = t.replace(/\{(?=[\s\S]*?"(?:days|exs|sets|weeks)")[\s\S]*$/, ''); // objet JSON programme tronqué
  return t.replace(/\n{3,}/g, '\n\n').trim();
}
function renderCoachMsg(role, text) {
  const msgs = document.getElementById('coach-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-bubble ' + (role === 'user' ? 'msg-user' : 'msg-coach');
  if (role === 'coach') {
    text = _stripCoachTech(text); // jamais de JSON brut à l'écran ni au partage (dataset.raw)
    div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    if (!div.querySelector('p') && !div.querySelector('ul')) {
      div.innerHTML = '<p>' + div.innerHTML + '</p>';
    }
    // Bouton Partager/Exporter — sauf sur un message d'erreur
    if (!/^Erreur\s*:/.test(text)) {
      div.dataset.raw = text;
      const foot = document.createElement('div');
      foot.className = 'coach-msg-foot';
      foot.innerHTML = '<button class="coach-share-btn" onclick="exportCoachPdf(this)" aria-label="Exporter en PDF"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</button>'
        + '<button class="coach-share-btn" onclick="shareCoachReply(this)" aria-label="Partager cette réponse"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Partager</button>';
      div.appendChild(foot);
    }
  } else {
    div.textContent = text;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
// Nettoie le markdown pour un partage texte propre (+ sécurité : retire tout bloc technique)
function _coachPlain(text){
  return _stripCoachTech(String(text||''))
    .replace(/\*\*(.*?)\*\*/g,'$1')
    .replace(/^\s*-\s+/gm,'• ')
    .trim();
}
// Partage (Web Share API sur iPhone) ou copie dans le presse-papier
async function shareCoachReply(btn){
  const bubble = btn.closest('.msg-coach');
  const raw = bubble ? bubble.dataset.raw : '';
  if(!raw) return;
  const txt = '💬 Mon Coach IA — Force Tracker\n\n' + _coachPlain(raw) + '\n\n— via Force Tracker';
  // 1) Partage natif (feuille de partage iOS/Android)
  if(navigator.share){
    try{ await navigator.share({text:txt}); return; }
    catch(e){ if(e && e.name==='AbortError') return; } // l'utilisateur a annulé
  }
  // 2) Presse-papier
  try{
    await navigator.clipboard.writeText(txt);
    if(typeof toast==='function') toast('Réponse copiée ✅','success');
    return;
  }catch(e){}
  // 3) Dernier recours (anciens navigateurs)
  try{
    const ta=document.createElement('textarea');
    ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    document.execCommand('copy'); ta.remove();
    if(typeof toast==='function') toast('Réponse copiée ✅','success');
  }catch(e){ if(typeof toast==='function') toast('Copie impossible','error'); }
}
// Texte prêt pour le PDF : sans JSON/markdown, sans emojis (non gérés par la police PDF), flèches en ASCII.
function _coachPdfText(raw){
  let t=_coachPlain(raw);
  t=t.replace(/→/g,'->').replace(/←/g,'<-').replace(/[’]/g,"'");
  t=t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu,'');
  return t.replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}
// Export PDF propre d'une réponse de Milo (vrai PDF vectoriel, accents OK, aucun caractère cassé).
async function exportCoachPdf(btn){
  const bubble=btn.closest('.msg-coach');
  const raw=bubble?bubble.dataset.raw:'';
  if(!raw){toast('Rien à exporter','error');return;}
  toast('Génération du PDF…','info');
  try{ await _loadJsPdf(); }
  catch(e){ toast('PDF indisponible ici','error'); return; }
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), M=48;
    const coach=(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo');
    const d=new Date();
    const logo=await _loadLogoDataURL();
    let hx=M;
    if(logo){ try{ doc.addImage(logo,'PNG',M,24,36,36); hx=M+46; }catch(e){} }
    doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(20);doc.text('FORCE TRACKER',hx,42);
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(120);doc.text('Coach '+coach,hx,57);
    doc.setFontSize(9);doc.text(d.toLocaleDateString('fr-FR')+(S.name?(' · '+S.name):''),W-M,42,{align:'right'});
    doc.setLineWidth(1.2);doc.setDrawColor(20);doc.line(M,68,W-M,68);
    doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(30);
    const lines=doc.splitTextToSize(_coachPdfText(raw),W-2*M);
    let y=90;const lh=16;
    lines.forEach(line=>{ if(y>H-64){doc.addPage();y=56;} doc.text(line,M,y); y+=lh; });
    // Pied de page (sur toutes les pages) : contact + disclaimer
    const pages=doc.getNumberOfPages();
    for(let i=1;i<=pages;i++){
      doc.setPage(i);
      doc.setLineWidth(.5);doc.setDrawColor(210);doc.line(M,H-38,W-M,H-38);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(150);doc.text(PDF_CONTACT,M,H-26);
      doc.setFont('helvetica','italic');doc.setFontSize(7.5);doc.setTextColor(160);doc.text('Conseil indicatif — ne remplace pas l\'avis d\'un professionnel.',M,H-16);
      doc.setTextColor(150);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('Page '+i+'/'+pages,W-M,H-16,{align:'right'});
    }
    const fname='coach-'+coach.toLowerCase()+'-'+d.toISOString().slice(0,10)+'.pdf';
    const blob=doc.output('blob');
    const file=new File([blob],fname,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file],title:'Conseil de '+coach}); return; }
      catch(err){ if(err&&err.name==='AbortError')return; }
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=fname;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1500);
    toast('PDF enregistré 📄','success');
  }catch(e){ console.warn('[FT coach pdf]',e); toast('Souci PDF','error'); }
}

function showTyping() {
  const msgs = document.getElementById('coach-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-typing'; div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

let _coachImg = null;
let _coachImgType = 'image/jpeg';

function openCoachCamera() {
  document.getElementById('coach-cam-input').click();
}
function openCoachGallery() {
  document.getElementById('coach-gallery-input').click();
}

function clearCoachImg() {
  _coachImg = null;
  const prev = document.getElementById('coach-img-preview');
  if (prev) prev.style.display = 'none';
  const inp = document.getElementById('coach-cam-input');
  if (inp) inp.value = '';
  const inp2 = document.getElementById('coach-gallery-input');
  if (inp2) inp2.value = '';
}

async function _resizeImageBase64(file, maxSize) {
  maxSize = maxSize || 800;
  return new Promise(function(resolve) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h / w * maxSize); w = maxSize; }
          else { w = Math.round(w / h * maxSize); h = maxSize; }
        }
        canvas.width = w; canvas.height = h;
        const ctx2d=canvas.getContext('2d');
        if(!ctx2d){reject(new Error('Canvas indisponible'));return;}
        ctx2d.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onCoachImgSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  _coachImgType = file.type || 'image/jpeg';
  _coachImg = await _resizeImageBase64(file);
  const thumb = document.getElementById('coach-img-thumb');
  const prev = document.getElementById('coach-img-preview');
  if (thumb) thumb.src = 'data:' + _coachImgType + ';base64,' + _coachImg;
  if (prev) prev.style.display = 'block';
}

async function sendToCoach(customMsg, displayMsg) {
  if (coachBusy) return;

  // Vérifier quota avant d'ouvrir l'input
  if (!S.premium && (S.coachFree || 0) >= COACH_FREE_LIMIT) {
    if (window._premiumPending) {
      toast('Vérification premium en cours…', 'info'); return;
    }
    showPremiumWall(); return;
  }

  const inp = document.getElementById('coach-inp');
  const msg = customMsg || (inp ? inp.value.trim() : '');
  const hasImg = !!_coachImg;
  if (!msg && !hasImg) return;

  // Capturer l'image avant de la vider
  const imgData = _coachImg;
  const imgType = _coachImgType;

  coachBusy = true;
  if (inp) inp.value = '';
  clearCoachImg();
  const sendBtn = document.getElementById('coach-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  // Passer de l'accueil au chat au 1er envoi
  if(coachHistory.length===0)_showCoachChat();
  const suggs = document.getElementById('coach-suggs');

  // Bulle utilisateur avec image optionnelle
  if (hasImg) {
    const msgs = document.getElementById('coach-msgs');
    if (msgs) {
      const div = document.createElement('div');
      div.className = 'msg-bubble msg-user';
      div.innerHTML = (msg ? '<p style="margin:0 0 6px">' + msg.replace(/</g,'&lt;') + '</p>' : '') +
        '<img src="data:' + imgType + ';base64,' + imgData + '" style="max-width:180px;border-radius:8px;display:block;">';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
  } else {
    renderCoachMsg('user', displayMsg || msg);
  }

  const userHistContent = hasImg
    ? [{ type: 'image', source: { type: 'base64', media_type: imgType, data: imgData } },
       { type: 'text', text: msg || 'Analyse cette photo.' }]
    : msg;
  coachHistory.push({ role: 'user', content: userHistContent });
  showTyping();

  try {
    let reply = '';
    if (!S.url) {
      reply = '⚙️ Configure ton URL Google Apps Script dans Profil (Admin) pour activer le Coach IA.';
    } else {
      const payload = {
        action: 'coach',
        email: S.email || '',
        message: msg || 'Analyse cette photo de mon corps.',
        context: buildCoachContext(),
        history: coachHistory.slice(-8),
        coachMemory: S.premium ? (S.coachMemory||'') : ''
      };
      if (hasImg) { payload.image = imgData; payload.imageType = imgType; }
      const resp = await fetch(S.url, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      reply = data.reply || '🔑 Le Coach IA nécessite une clé API Anthropic. Crée un compte gratuit sur console.anthropic.com, génère une clé, et ajoute-la dans le script Google Apps Script ligne 2.';
    }
    hideTyping();
    // Programme de force : extraire le bloc JSON pour proposer un enregistrement
    let _disp = reply, _fp = null;
    if (_forceProgReq) {
      _forceProgReq = false;
      const ext = _extractForceProgram(reply);
      if (ext && ext.prog) { _fp = ext.prog; if (ext.clean) _disp = ext.clean; }
    }
    renderCoachMsg('coach', _disp);
    if (_fp) _appendSaveProgBtn(_fp);
    coachHistory.push({ role: 'assistant', content: reply });
    if (coachHistory.length > 20) coachHistory = coachHistory.slice(-20);
    _saveCoachHist(); // fil persisté (survit à la fermeture de l'appli)
    try { localStorage.setItem('ft4_coach_lastts', String(Date.now())); } catch(e) {} // horodatage du dernier échange (pour la notion de délai)
    const newBtn=document.getElementById('coach-new-btn'); if(newBtn)newBtn.style.display='flex';

    // Sauvegarde mémoire intelligente (Premium, fire-and-forget)
    if (S.premium && coachHistory.length >= 4 && S.url && S.email) _saveCoachMemory();

    // Incrémenter compteur (seulement sur réponse réussie)
    if (!S.premium) {
      S.coachFree = (S.coachFree || 0) + 1;
      persist();
      updateCoachHeader();
      if (S.coachFree >= COACH_FREE_LIMIT) {
        setTimeout(showPremiumWall, 1200);
      }
    }
  } catch(e) {
    hideTyping();
    _forceProgReq = false;
    console.error('[Coach] fetch error:', e.message, e);
    renderCoachMsg('coach', 'Erreur : ' + (e.message||'inconnue') + '. Vérifie ta connexion et réessaie.');
  }

  coachBusy = false;
  if (sendBtn) sendBtn.disabled = false;
}

function sendSuggestion(text) { sendToCoach(text); }

// ─── DRAWER ───────────────────────────────────────────────────
function openDrawer(){
  const dr=document.getElementById('drawer');
  dr.classList.add('open');
  document.getElementById('drawer-backdrop').classList.add('open');
  document.body.style.overflow='hidden';
  _addSwipeClose(dr,closeDrawer,dr,null,dr.querySelector('.drawer-hd'),120);
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-backdrop').classList.remove('open');
  document.body.style.overflow='';
}

const _DRAWER_CONTENT = {
  anatomy: {
    title:'🫀 Anatomie du corps humain',
    html:(()=>{
      const groups=[
        {name:'Corps entier',    img:'anatomy/corps entier/schema homme entier face avant arriere et côté.png', full:true},
        {name:'Pectoraux',       img:'anatomy/pectoreaux/schema pectoreaux.png'},
        {name:'Dos & Trapèzes',  img:'anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png'},
        {name:'Épaules',         img:'anatomy/epaules/schéma epaule arriere.png'},
        {name:'Bras & Avant-bras',img:'anatomy/bras biceps triceps/schema muscles bras et avant bras.png'},
        {name:'Abdominaux',      img:'anatomy/abdominaux/schema abdominaux.png'},
        {name:'Jambes (avant)',  img:'anatomy/jambes/jambes avant/jambes face avant.png'},
        {name:'Jambes & Mollets',img:'anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png'},
        {name:'Fessiers & Lombaires',img:'anatomy/fessiers lombaires/schema lombaires fessiers.png'},
        {name:'Vue des Nerfs',       img:'anatomy/Vue des Nerfs/vue nerf.png'},
        {name:'Os & Nerfs sciatiques',img:'anatomy/Vue des Os avec nerfs sciatiques/os et nerfs.png'},
      ];
      const card=(g)=>g.img
        ?`<div onclick="openAnatomyImg('${g.img.replace(/'/g,"\\'")}','${g.name}')" style="background:var(--bg3);border-radius:12px;overflow:hidden;cursor:pointer;border:1px solid var(--sep);${g.full?'grid-column:span 2;':''}" >
            <img src="${g.img}" style="width:100%;${g.full?'max-height:260px;':'max-height:160px;'}object-fit:contain;display:block;background:#0a0a14;" loading="lazy">
            <div style="padding:8px 10px;font-size:12px;font-weight:700;color:var(--t2);">${g.name} <span style="color:var(--t3);font-weight:400;">— tap pour agrandir</span></div>
          </div>`
        :`<div style="background:var(--bg3);border-radius:12px;padding:20px 10px;text-align:center;border:1px solid var(--sep);color:var(--t3);font-size:12px;${g.full?'grid-column:span 2;':''}">
            <div style="font-size:22px;margin-bottom:6px;">🚧</div>${g.name}<br>Image à venir
          </div>`;
      return`<div style="background:rgba(255,184,0,.08);border:1px solid rgba(255,184,0,.25);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--t2);line-height:1.5;">
        ⚠️ <strong>À titre informatif uniquement.</strong> Ces schémas anatomiques sont des références éducatives et ne remplacent pas l'avis d'un professionnel de santé.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 2px 8px;">${groups.map(card).join('')}</div>`;
    })()
  },
  proteins: {
    title:'🥛 Protéines en poudre',
    html:`<div style="display:flex;flex-direction:column;gap:12px;padding:0 2px 8px;">
      ${[
        {n:'Whey Concentrate',ic:'🥛',desc:'La plus commune. 70-80% de protéines. Absorption rapide (1-2h). Idéale post-workout. Contient lactose.',pros:'Prix abordable · Large choix de goûts',cons:'Moins bien tolérée si intolérance lactose'},
        {n:'Whey Isolate',ic:'⚡',desc:'90%+ de protéines, très peu de glucides/lipides. Absorption ultra-rapide. Convient aux intolérants au lactose.',pros:'Macros optimales · Digestion facile',cons:'Plus chère que le concentrate'},
        {n:'Caséine',ic:'🌙',desc:'Protéine lente (6-8h d\'absorption). Parfaite avant le coucher pour limiter le catabolisme nocturne.',pros:'Satiété prolongée · Anti-catabolisme nuit',cons:'Texture épaisse · Moins appétissante'},
        {n:'Whey Hydrolysate',ic:'🚀',desc:'Whey pré-digérée, absorption la plus rapide. Idéale pour récupération immédiate post-entraînement intensif.',pros:'Absorption maximale · Récupération rapide',cons:'Goût amer · Prix élevé'},
        {n:'Protéine Végétale',ic:'🌱',desc:'Pois, riz, soja, chanvre. Sans lactose, vegan-friendly. Profil d\'acides aminés variable selon la source.',pros:'Vegan · Sans lactose · Durable',cons:'Profil AA incomplet seul (combiner pois+riz)'},
      ].map(p=>`<div style="background:var(--bg3);border-radius:12px;padding:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:26px;">${p.ic}</span>
          <span style="font-weight:800;font-size:17px;">${p.n}</span>
        </div>
        <p style="font-size:15px;color:var(--t2);margin-bottom:10px;line-height:1.6;">${p.desc}</p>
        <div style="font-size:14px;color:var(--green);">✓ ${p.pros}</div>
        <div style="font-size:14px;color:var(--t3);margin-top:4px;">✗ ${p.cons}</div>
      </div>`).join('')}
    </div>`
  },
  supplements: {
    title:'💊 Compléments alimentaires',
    html:`<div style="display:flex;flex-direction:column;gap:12px;padding:0 2px 8px;">
      ${[
        {n:'Créatine Monohydrate',ic:'⚡',cat:'Force & Puissance',desc:'Le complément le plus étudié et efficace. Augmente les réserves de phosphocréatine → plus d\'ATP disponible pour les efforts courts et intenses.',dose:'3-5g/jour (phase entretien). Phase de charge optionnelle : 20g/j pendant 5 jours.'},
        {n:'BCAA (Leucine/Isoleucine/Valine)',ic:'🔗',cat:'Récupération',desc:'Acides aminés ramifiés. Limitent le catabolisme musculaire en période de restriction calorique. Moins utiles si apport protéique suffisant.',dose:'5-10g avant/pendant l\'entraînement si à jeun.'},
        {n:'Caféine',ic:'☕',cat:'Performance & Concentration',desc:'Stimulant éprouvé : réduit la perception de l\'effort, améliore focus et endurance. Tolérance développée rapidement.',dose:'3-6mg/kg, 30-60 min avant l\'entraînement. Cycler pour éviter la tolérance.'},
        {n:'Bêta-Alanine',ic:'🌊',cat:'Endurance musculaire',desc:'Précurseur de la carnosine. Tampon contre l\'acidose musculaire → retarde la fatigue sur des efforts de 1-4 minutes. Picotements normaux.',dose:'3,2-6,4g/jour. Fractionner les prises pour réduire les picotements.'},
        {n:'Magnésium',ic:'🪨',cat:'Récupération & Sommeil',desc:'Cofacteur de +300 réactions enzymatiques. Souvent déficitaire chez les sportifs (pertes sudorales). Améliore la qualité du sommeil et réduit les crampes.',dose:'300-400mg/jour le soir. Préférer le bisglycinate (mieux absorbé).'},
        {n:'Vitamine D3 + K2',ic:'☀️',cat:'Santé générale & Force',desc:'La D3 est essentielle à la santé osseuse, à la testostérone et à la force musculaire. K2 oriente le calcium vers les os et non les artères.',dose:'2000-5000 UI D3 + 100-200µg K2 MK-7 par jour, avec un repas gras.'},
        {n:'Oméga-3 (EPA+DHA)',ic:'🐟',cat:'Anti-inflammatoire',desc:'Réduisent l\'inflammation chronique liée à l\'entraînement intensif. Améliorent la sensibilité à l\'insuline et la santé cardiovasculaire.',dose:'2-4g EPA+DHA/jour avec les repas. Préférer l\'huile de poisson concentrée.'},
        {n:'L-Citrulline / Citrulline Malate',ic:'🩸',cat:'Congestion & Endurance',desc:'Booste la production d\'oxyde nitrique → meilleure circulation, plus de « pump » et un peu plus de reps sur les séries longues.',dose:'6-8g de citrulline malate, 30-45 min avant l\'entraînement.'},
        {n:'Ashwagandha (KSM-66)',ic:'🌿',cat:'Stress & Récupération',desc:'Plante adaptogène : réduit le cortisol (stress), améliore le sommeil et la récupération. Effet modeste mais réel sur la force chez certains.',dose:'300-600mg/jour d\'extrait standardisé, plutôt le soir.'},
        {n:'ZMA (Zinc + Magnésium + B6)',ic:'🌙',cat:'Sommeil & Hormones',desc:'Combo pensé pour le sommeil profond et la récupération, surtout si tu es déficitaire en zinc/magnésium (fréquent chez les sportifs).',dose:'À jeun le soir, ~30 min avant de dormir. Pas avec des produits laitiers (calcium gêne l\'absorption).'},
        {n:'Électrolytes (sodium/potassium)',ic:'🧂',cat:'Hydratation & Crampes',desc:'Utiles si tu transpires beaucoup ou t\'entraînes longtemps/à jeun : évitent la baisse de perf et les crampes liées aux pertes minérales.',dose:'Autour de l\'entraînement selon la sudation. Le sel de table compte aussi.'},
        {n:'Collagène + Vitamine C',ic:'🦵',cat:'Tendons & Articulations',desc:'Pour la santé des tendons et articulations, surtout en force athlétique/charges lourdes. La vitamine C aide la synthèse du collagène.',dose:'10-15g de collagène + 50mg de vitamine C, ~45-60 min avant l\'entraînement.'},
        {n:'⚠️ Pré-workout « tout-en-un »',ic:'🔋',cat:'À utiliser avec tête',desc:'Souvent = caféine + citrulline + bêta-alanine + arômes. Pratique, mais tu paies cher des doses parfois faibles. Regarde les grammages réels — et méfie-toi de l\'excès de stimulants.',dose:'Pas plus d\'1 dose, jamais tard dans la journée. Fais des pauses pour garder l\'effet de la caféine.'},
      ].map(p=>`<div style="background:var(--bg3);border-radius:12px;padding:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <span style="font-size:26px;">${p.ic}</span>
          <div><div style="font-weight:800;font-size:17px;">${p.n}</div><div style="font-size:13px;color:var(--red);font-weight:700;">${p.cat}</div></div>
        </div>
        <p style="font-size:15px;color:var(--t2);margin:10px 0 8px;line-height:1.6;">${p.desc}</p>
        <div style="font-size:14px;color:var(--t3);"><strong style="color:var(--t2);">Dose :</strong> ${p.dose}</div>
      </div>`).join('')}
    </div>`
  },
  guide: {
    title:'📚 Guide de la muscu',
    html:(function(){
      const card=(ic,t,d)=>'<div style="background:var(--bg3);border-radius:12px;padding:14px;">'
        +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-size:22px;">'+ic+'</span><div style="font-weight:800;font-size:15.5px;color:var(--t1);">'+t+'</div></div>'
        +'<div style="font-size:14px;color:var(--t2);line-height:1.55;">'+d+'</div></div>';
      // Carte avec photo(s) — chaque image se cache toute seule si le fichier n'existe pas encore (pas de vignette cassée)
      const _gimg=(src,cap)=>'<figure style="margin:0;flex:1;min-width:0;"><img src="'+src+'" loading="lazy" onerror="this.parentElement.style.display=\'none\'" style="width:100%;height:92px;object-fit:cover;border-radius:9px;display:block;background:var(--bg2);border:1px solid var(--sep);">'+(cap?'<figcaption style="font-size:10.5px;color:var(--t3);text-align:center;margin-top:4px;line-height:1.2;">'+cap+'</figcaption>':'')+'</figure>';
      const pcard=(ic,t,d,imgs)=>'<div style="background:var(--bg3);border-radius:12px;padding:14px;">'
        +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-size:22px;">'+ic+'</span><div style="font-weight:800;font-size:15.5px;color:var(--t1);">'+t+'</div></div>'
        +'<div style="font-size:14px;color:var(--t2);line-height:1.55;">'+d+'</div>'
        +((imgs&&imgs.length)?'<div style="display:flex;gap:8px;margin-top:10px;">'+imgs.map(function(im){return _gimg(im.src,im.cap);}).join('')+'</div>':'')
        +'</div>';
      const sec=(t)=>'<div style="font-size:12px;font-weight:800;color:var(--red);text-transform:uppercase;letter-spacing:.06em;margin:6px 2px 2px;">'+t+'</div>';
      return '<div style="display:flex;flex-direction:column;gap:11px;padding:0 2px 8px;">'
        +'<div style="font-size:13px;color:var(--t3);line-height:1.5;padding:0 2px;">Un tour d\'horizon simple et concret : trouve ton style, connais ton matériel, et pimente tes séances. 💪</div>'
        +sec('🥇 Les disciplines — trouve ton style')
        +card('🏋️','Musculation / Bodybuilding','Objectif : faire GROSSIR le muscle (hypertrophie) et sculpter la silhouette. Séries moyennes (8-12 reps), beaucoup de volume, on cherche la « sensation » et la congestion. C\'est la base de Force Tracker.')
        +card('🏆','Force athlétique (Powerlifting)','Objectif : soulever le plus LOURD possible sur 3 mouvements — Squat, Développé Couché, Soulevé de Terre. Séries courtes (1-5 reps), charges maximales, longues récup entre les séries.')
        +card('⚡','Haltérophilie (Weightlifting)','Les 2 mouvements olympiques : Arraché et Épaulé-Jeté. Explosivité, vitesse et technique avant tout. Très exigeant techniquement — souvent avec un coach.')
        +card('🤸','Fitness / Cross-training','Condition physique GÉNÉRALE : on mélange muscu, cardio, gainage et circuits. Objectif polyvalence, endurance et santé plutôt que la performance pure sur un lift.')
        +card('🧗','Callisthénie / Street workout','Musculation au POIDS DU CORPS (tractions, dips, pompes, figures). Force relative, contrôle et mobilité. Peu de matériel, beaucoup de progression.')
        +sec('🎒 Le matériel — tes outils')
        +pcard('🎗️','Ceinture de force','Elle t\'aide à GAINER le tronc sur les gros soulevés (squat, soulevé de terre lourds). Tu pousses le ventre contre la ceinture → plus de pression = dos plus stable. À garder pour les séries lourdes, pas pour l\'échauffement. Il en existe plusieurs : <b>souple</b> (nylon, confort, polyvalente) et <b>cuir rigide</b> avec fermeture à <b>levier</b> (rapide à mettre/enlever) ou à <b>ardillon/boucle</b> (réglage plus précis).',[{src:'accessoires/ceinture-souple.jpg',cap:'Souple (nylon)'},{src:'accessoires/ceinture-cuir-levier.jpg',cap:'Cuir · levier'},{src:'accessoires/ceinture-cuir-ardillon.jpg',cap:'Cuir · ardillon'}])
        +pcard('🤚','Bandes de poignets (wrist wraps)','Soutiennent le poignet sur les pressions lourdes (développé couché, militaire). Elles évitent que le poignet parte en arrière. Utiles quand ça charge, inutiles léger.',[{src:'accessoires/wrist-wraps.jpg'}])
        +pcard('🦵','Genouillères / bandes de genoux','Manchons (sleeves) : chaleur + maintien + un peu de rebond au squat, protègent l\'articulation. Bandes (wraps) : très serrées, gros rebond, réservées à la force athlétique lourde.',[{src:'accessoires/genouilleres.jpg'}])
        +pcard('🪢','Sangles / straps (grip)','Elles accrochent la barre à tes poignets quand tes mains lâchent avant tes muscles (tirages, soulevés, shrugs lourds). Pratique pour le dos — mais travaille aussi ta prise sans, pour ne pas la négliger.',[{src:'accessoires/sangles.jpg'}])
        +card('👕','Maillot / combinaison de force','En force athlétique « équipée » : des combinaisons/chemises très rigides qui renvoient de la force. Il y a un modèle <b>par mouvement</b> — une chemise pour le <b>développé couché</b>, une combinaison pour le <b>squat</b> et une pour le <b>soulevé de terre</b>. C\'est un monde à part (compétitions spécifiques), pas nécessaire pour progresser.')
        +pcard('👟','Les chaussures','Haltéro/squat : chaussure à talon rigide (meilleure profondeur, buste plus droit). Soulevé de terre : semelle PLATE et fine (chausson, Converse) pour être stable et proche du sol. Évite les grosses semelles moelleuses sous la barre.',[{src:'accessoires/chaussures.jpg'}])
        +pcard('🧗‍♂️','Craie / magnésie','Assèche les mains → bien meilleure prise sur la barre. Indispensable sur les soulevés lourds. Existe en <b>bloc/poudre</b> (le plus efficace) ou en <b>version liquide</b>, plus propre et souvent autorisée quand ta salle interdit la poudre.',[{src:'accessoires/magnesie-bloc.jpg',cap:'Bloc / poudre'},{src:'accessoires/magnesie-liquide.jpg',cap:'Liquide'}])
        +sec('🔥 Les techniques — monte en intensité')
        +card('⚡','Superset','Deux exercices ENCHAÎNÉS sans repos (ex. biceps + triceps). Gain de temps + grosse congestion. Dans Force Tracker : bouton « ⚡ Grouper » en séance, ou « Superset » dans l\'éditeur de programme.')
        +card('📉','Drop set','Tu vas à l\'échec, puis tu BAISSES la charge (~20%) et tu continues sans repos, une ou plusieurs fois. Brutal pour finir un muscle. Dispo via le bouton 📉 Drop.')
        +card('⏸️','Rest-pause','À l\'échec, tu poses la barre 10-15s, puis tu arraches quelques reps de plus. Permet plus de reps avec la même charge lourde.')
        +card('🔺','Pyramide','Tu montes la charge en baissant les reps série après série (ex. 12→10→8→6), ou l\'inverse. Bon mélange volume + force. Bouton 📈 +% en séance.')
        +card('🐢','Tempo / Isométrie','Tu contrôles la vitesse (ex. 3s en descente) ou tu bloques en position basse quelques secondes. Plus de tension, meilleure technique, muscle sous pression plus longtemps.')
        +card('💥','Pré-fatigue','Tu fatigues d\'abord le muscle avec un exercice d\'isolation, PUIS tu fais le polyarticulaire. Ex. écarté avant le développé couché → les pecs travaillent plus que les épaules/triceps.')
        +'<div style="font-size:12px;color:var(--t3);line-height:1.5;padding:6px 2px 0;font-style:italic;">💡 Une technique à la fois, bien maîtrisée. L\'intensité, c\'est du bonus : la régularité et la progression des charges restent la base.</div>'
        +'</div>';
    })()
  },
  help: {
    title:'❓ Aide détaillée',
    html:`<div style="display:flex;flex-direction:column;gap:10px;padding:0 2px 8px;">
      ${[
        {ic:'📅',t:'Calendrier sur l\'Accueil',d:'Nouveau : un calendrier de ton mois sur la page d\'accueil. Tes jours de séance ressortent en rouge, et les jours où tu as BATTU UN RECORD sont cerclés en or 🏆. Les flèches ‹ › te déplacent sur les mois, et tu peux taper une semaine pour voir le détail jour par jour (nom de la séance / repos).'},
        {ic:'⚡',t:'Démarrer une séance',d:'Bouton rouge central ⚡ ou "Commencer une séance" depuis l\'accueil. Ajoute tes exercices, saisis kg × reps, valide chaque série avec ✓. Le timer de repos se lance automatiquement entre les séries.'},
        {ic:'🏋️',t:'Tags de série',d:'É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Tape la pastille pour changer. Timer : É 45s · N 2:10 · X 4min.'},
        {ic:'⚡',t:'Super-séries & Pyramides',d:'Deux façons de créer un superset : 1) le bouton "⚡ Grouper" (dès 2 exercices) → sélectionne les exercices → "Lier en supersérie". 2) Plus rapide : attrape la petite poignée (6 points, à côté du ⋯) sur un exercice et glisse-le sur un autre → le superset se crée tout seul. Enchaînement sans repos entre eux, avance automatique + vibration entre les blocs. Pour défaire : "↩ Retirer". Sous chaque exercice : 📉 Drop set (−10% auto) · 📈 Pyramide + (+10%) · 📉 Pyramide − (−10%).'},
        {ic:'📊',t:'Historique par exercice',d:'Bouton 📊 sur chaque exercice en séance → graphique du poids max sur les 5 dernières séances. Pratique pour calibrer sa charge du jour.'},
        {ic:'🏃',t:'Cardio en séance',d:'Bloc cardio en haut de séance (replié par défaut). Choisis le type (elliptique, tapis, vélo, rameur, corde...), l\'intensité (léger/modéré/intense) et la durée. Les calories brûlées sont calculées et ajoutées à ton TDEE.'},
        {ic:'📋',t:'Programmes',d:'Sauvegarde ta séance en cours comme programme réutilisable. Charge-le pour retrouver les exercices avec les poids de la dernière fois. Bouton 🤖 pour une analyse IA de ton programme. Bouton ✏️ pour modifier les exercices. Bouton 📄 PDF pour exporter le programme en vrai fichier PDF (feuille propre avec une colonne « Poids » à remplir à la salle). Sur iPhone, le menu Partager s\'ouvre (Enregistrer dans Fichiers, envoyer…) ; sur ordi, le PDF se télécharge. Marche aussi hors-ligne.'},
        {ic:'🌱',t:'Parcours débutant',d:'Nouveau : dans 📋 Mes Programmes, un bouton vert « Créer mon parcours débutant ». On te pose 2 questions — combien de séances par semaine (2 ou 3) et quel style (Full Body = tout le corps à chaque séance, ou Split = une zone par jour) — et on te crée un programme sur mesure, sur machines guidées (sécurité, pas de technique compliquée), adapté à ton profil (homme/femme, santé). C\'est l\'Étape 1 « Découverte », gratuite, sur 3 semaines. Progression : +2,5 kg sur le haut du corps, +5 kg sur les jambes quand tes séries passent (et plus vite les premières semaines). Pense à finir par 10-15 min de cardio léger, surtout en objectif perte de poids. Les mouvements techniques (squat, couché, soulevé) et la suite du parcours se débloquent ensuite.'},
        {ic:'📸',t:'Import de programme',d:'Bouton 📸 dans la séance pour importer depuis une photo, un fichier Word (.docx) ou Excel (.xlsx). Le Coach IA extrait automatiquement les exercices, séries et charges.'},
        {ic:'📷',t:'Photo sur tes exercices',d:'Tu peux coller une photo sur N\'IMPORTE quel exercice (perso OU de la bibliothèque) : ⋯ sur l\'exercice → "Ajouter/Changer la photo". Idéal pour reconnaître TA machine sur un exercice existant (ex. ta chest press sur "Chest Press Machine Inclinée"). Dans la liste de choix, tape la vignette à gauche pour voir la photo en grand (sans ajouter l\'exercice). Ta photo est privée à ton compte. Pour créer un exercice inexistant : "+ Créer un exercice".'},
        {ic:'✏️',t:'Modifier un exercice perso',d:'Tape le ⋯ sur un exercice perso → "Modifier l\'exercice" (ou le ✎ dans la liste de choix). Tu peux changer son nom, son groupe musculaire et les muscles ciblés — ton historique et tes records suivent le nouveau nom, rien n\'est perdu. Ça ne touche que TES exercices perso (privés à ton compte).'},
        {ic:'⏸️',t:'Pause & Vider la séance',d:'Nouveau : en haut de la séance, "Pause" fige le chrono de durée si tu t\'interromps (le temps en pause n\'est pas compté) — "Reprendre" relance. "Vider" retire tous les exercices d\'un coup (utile si tu as chargé le mauvais programme), la séance reste ouverte et ton historique n\'est pas touché. Le "✕" annule complètement la séance.'},
        {ic:'📈',t:'Progrès & PRs',d:'Les PRs se calculent automatiquement via Brzycki (1RM estimé). Onglet Progrès → graphique par exercice · Onglet Poids → courbe de poids · Onglet Badges → 18 récompenses à débloquer. Tap sur une séance pour voir/modifier les séries — et sur chaque exercice de cette séance, l\'icône 📊 t\'ouvre sa progression (ton poids sur les dernières séances).'},
        {ic:'⚖️',t:'Graphique de poids',d:'Onglet Progrès → Poids. Tape un point de la courbe pour modifier ou supprimer cette pesée (poids + date). Les boutons 1 mois / 3 mois / 6 mois / Tout choisissent la période affichée.'},
        {ic:'📉',t:'Suivi de la masse grasse',d:'Onglet Progrès → Poids, carte « Masse grasse ». Enregistre ton % de graisse au fil du temps : soit calculé automatiquement (méthode US Navy — tu entres tour de cou + taille, l\'app calcule), soit à la main (ton chiffre de balance/caliper). La bascule « Poids / Masse grasse / Les 2 » au-dessus du graphique choisit ce qu\'on affiche — « Les 2 » superpose les deux courbes (tu peux prendre du poids en perdant de la graisse). ⚠️ Valeur INDICATIVE, pas une science exacte — et la balance à impédance par les pieds est peu fiable. Vise la RÉGULARITÉ (même méthode, le matin à jeun) : c\'est la tendance qui compte.'},
        {ic:'🎯',t:'Poids objectif',d:'Onglet Progrès → Poids, carte « Poids objectif ». Fixe le poids que tu vises : une ligne repère verte apparaît sur le graphique et l\'app affiche les kg restants. Laisse vide (✓) pour le retirer.'},
        {ic:'🧪',t:'Bilan corporel (balance pro)',d:'Nouveau : Onglet Progrès → Poids → section « Bilan corporel ». Tu passes sur une balance à impédance (InBody, MyBodyCheck…) ? Enregistre tes chiffres pour suivre leur évolution : poids, % de graisse, masse grasse & maigre, muscle, muscle squelettique, masse osseuse, eau, protéine, graisse viscérale, métabolisme de base, âge corporel, IMC, score corporel — et même le détail par segment (bras/tronc/jambes gauche-droite). Trois façons de remplir : 📷 Photo (l\'IA lit ton rapport toute seule), ✏️ à la main, ou 📋 coller un code. Le bilan sert AUSSI de pesée du jour (poids + masse grasse alimentent tes courbes, pas de double saisie). Bilan après bilan, des flèches vertes montrent ce qui va dans le bon sens (muscle ↑, gras ↓). Et Milo s\'en sert pour te conseiller — avec de vrais chiffres, sans jamais en inventer ni poser de diagnostic médical.'},
        {ic:'🏅',t:'Badges & Streaks',d:'18 badges en 4 catégories : évolution (1re séance, 10/25/50/100 séances), performance (PRs, clubs 100/140 kg), streak (7/30/90 jours), spécial (lève-tôt, noctambule, anniversaire, premium). Un résumé hebdomadaire s\'affiche le lundi.'},
        {ic:'🍽️',t:'Nutrition',d:'TDEE adaptatif (Harris-Benedict) calculé depuis ton profil. Phase Charge = surplus · Phase Décharge = déficit. Plan 5 repas détaillé. Créatine et whey dosés selon ton poids. Combinaisons Premium : 4 stacks (muscle, force, cardio, perte de poids).'},
        {ic:'📓',t:'Journal alimentaire',d:'Onglet « Journal » dans Nutrition : note tes repas et suis tes calories/macros du jour vs tes objectifs. Ajoute un aliment de 3 façons : à la main (gratuit, illimité), estimation IA (🤖 décris ton repas → l\'IA remplit les calories, 25 gratuites puis Premium), ou par code-barres (produit reconnu automatiquement, tu ajustes la quantité). Tout est sauvegardé dans ton compte.'},
        {ic:'📷',t:'Code-barres : chiffres ou photo',d:'Deux façons de passer par le code-barres d\'un produit. 1) Tape les chiffres écrits sous le code → recherche gratuite (aucun crédit IA). 2) Nouveau : appuie sur « 📷 Photographier le code-barres » et prends-le en photo → l\'IA lit le numéro à ta place (pratique si les chiffres sont petits ou abîmés). La lecture par photo utilise 1 essai IA ; ensuite le produit et son score santé s\'affichent gratuitement.'},
        {ic:'🥗',t:'Score santé des produits',d:'Nouveau : dans le Journal, tape le code-barres d\'un produit → tu vois son SCORE SANTÉ : Nutri-Score (A à E) et niveau de transformation (aliment brut ou ultra-transformé). Pour repérer d\'un coup d\'œil ce qui est sain. Gratuit pour tout le monde (aucune limite), ça n\'utilise pas de crédit IA. Pour lire une étiquette en photo ou estimer un plat, c\'est l\'IA (📸/🤖, 25 essais gratuits puis Premium).'},
        {ic:'📥',t:'Importer un plan alimentaire',d:'Un plan de diététicienne (photo ou PDF) ? Bouton « Importer un plan » sous Plan de repas IA : l\'IA lit le document et range les repas jour par jour, en tenant compte de ton régime.'},
        {ic:'👤',t:'Ton Profil',d:'Menu ☰ → Profil. Organisé en sections repliables (tape un titre pour l\'ouvrir) : Identité · Objectif · Discipline · Composition corporelle · Morphologie · Santé · Cycle menstruel (femmes) · Accessibilité. Le bouton "Enregistrer le profil" confirme par une notification verte. Ton profil nourrit le Coach IA, la nutrition et tes stats.'},
        {ic:'⚧',t:'Profil homme / femme',d:'Certaines sections s\'adaptent à ton sexe. Femmes : section Cycle menstruel (règles, contraception) pour ajuster macros et conseils selon la phase ; hanches demandées pour le calcul du % de graisse (US Navy) ; condition Endométriose dans Santé (le Coach en tient compte, elle peut freiner la perte de poids). Hommes : composition corporelle sur cou + taille seulement (les hanches ne servent pas).'},
        {ic:'🩺',t:'Santé (privé)',d:'Section Santé du Profil : conditions médicales et blessures, optionnelles. 🔒 Visibles seulement par toi (ton téléphone + ta sauvegarde perso). Le Coach IA les utilise pour éviter les mouvements à risque — il ne pose jamais de diagnostic et ne remplace pas un médecin.'},
        {ic:'🎽',t:'Discipline',d:'Nouveau : dans Profil → Discipline, choisis ta pratique — Musculation · Bodybuilding/Culturisme · Force athlétique · Haltérophilie. Le Coach IA adapte ses conseils (exercices, répétitions, périodisation) à ta discipline.'},
        {ic:'🥉',t:'Ton niveau (évolutif)',d:'Nouveau : dans Profil → Discipline, indique ton niveau — Débutant · Intermédiaire · Confirmé. Le Coach (Milo) s\'adapte : plus pédagogue si tu débutes, plus technique si tu es confirmé. Et surtout : ton niveau évolue tout seul ! À force de séances et de progrès sur les gros mouvements (squat, développé couché, soulevé de terre), l\'app te félicite et te fait passer au niveau supérieur. 🎉'},
        {ic:'🧬',t:'Morphologie',d:'Dans Profil → section Morphologie : choisis ta forme (H/A/V/X/O) et ton morphotype (ecto/méso/endo). Bouton 📸 "Analyser ma morphologie" (Premium) → analyse IA sur 3 photos (face/dos/profil) → mise à jour automatique.'},
        {ic:'🤖',t:'Coach IA — Milo',d:'Ton coach s\'appelle Milo. Il est franc et direct, mais il s\'adapte à toi : ton niveau (via tes records), ton état du jour (via ta récup/sommeil) et ta façon de parler. Ton profil complet est injecté automatiquement. Mémoire intelligente Premium : résumé entre sessions. Envoie une photo avec 📷 pour analyse corporelle. Bouton "Partager" sous chaque réponse. 10 questions gratuites, illimité en Premium (4,99 € / 2 mois).'},
        {ic:'💾',t:'Historique de Milo',d:'Nouveau : tes conversations avec Milo restent sauvegardées — tu retrouves ton fil même après avoir fermé et rouvert l\'appli. Le bouton « + » en haut à droite du Coach démarre une nouvelle discussion (Milo garde quand même l\'essentiel de vos échanges en mémoire). Sous chaque réponse : boutons « Partager » et « 📄 PDF » pour l\'exporter proprement.'},
        {ic:'💬',t:'Petits mots de Milo (Accueil)',d:'Nouveau : Milo t\'envoie parfois un petit mot en haut de l\'Accueil au bon moment — te relancer après quelques jours sans séance, te féliciter après une séance, te conseiller une séance légère après une nuit courte, ou t\'encourager quand tu enchaînes. Tape le message pour lui parler, ou la croix pour le fermer.'},
        {ic:'📐',t:'Étude du corps (Premium)',d:'Nouveau : dans le Coach, bouton « Étude du corps ». Prends 4 photos (face relâché, face contracté, dos contracté, profil) et l\'IA te fait un bilan complet : posture/stature, insertions musculaires, équilibre du corps (gauche/droite, haut/bas, avant/arrière), points forts, points à travailler et exercices suggérés — en tenant compte de ta santé (blessures/conditions du profil). Les photos ne sont pas stockées. Tu peux ensuite « en parler avec Milo ».'},
        {ic:'🏋️',t:'Gagner en force (Big 3)',d:'Nouveau : dans le Coach, bouton « Gagner en force (Big 3) ». Milo lit tes maxes (1RM) au Squat, Développé Couché et Soulevé de Terre depuis tes records, puis te donne un conseil ET un programme de force progressif (accumulation → intensification → peak). Un bouton « 💾 Enregistrer ce programme » l\'ajoute dans « Mes programmes » — prêt à charger en séance avec les charges.'},
        {ic:'☁️',t:'Synchronisation cloud',d:'Données sauvegardées localement (localStorage) ET sur Google Sheets. Sync automatique après chaque séance. Restauration complète sur un nouvel appareil : entre ton email à l\'onboarding ou dans Profil → Admin.'},
        {ic:'💡',t:'Astuces',d:'• Texte trop petit ? Profil → Accessibilité → "Affichage agrandi" · • 1RM Brzycki = kg × (36 / (37 − reps)) · • Swipe gauche/droite pour changer d\'onglet · • Tap sur une séance passée pour corriger des séries · • Menu ☰ → Anatomie pour visualiser les muscles · • Calculateur 1RM depuis Menu ☰ · • Les points rouges signalent les nouveautés'},
      ].map(h=>`<div style="background:var(--bg3);border-radius:12px;padding:14px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-size:20px;">${h.ic}</span><strong style="font-size:14px;">${h.t}</strong></div>
        <p style="font-size:13px;color:var(--t2);line-height:1.5;margin:0;">${h.d}</p>
      </div>`).join('')}
    </div>`
  },
  rm1calc: {
    title:'🔢 Calculateur 1RM',
    html:()=>`<div style="display:flex;flex-direction:column;gap:14px;padding:4px 0;">
      <div style="font-size:13px;color:var(--t2);line-height:1.5;">Formule de Brzycki — entre ta charge et tes reps pour estimer ton max sur 1 répétition.</div>
      <div class="two-col">
        <div class="fg"><label>Charge (kg)</label><input type="number" id="rm-kg" placeholder="100" step="0.5" inputmode="decimal" oninput="calcRM()"></div>
        <div class="fg"><label>Reps</label><input type="number" id="rm-reps" placeholder="5" min="1" max="20" inputmode="numeric" oninput="calcRM()"></div>
      </div>
      <div class="rm-hero"><div class="lbl">1RM ESTIMÉ</div><div class="val" id="rm-out">— kg</div></div>
      <div class="sec">Pourcentages</div>
      <div class="pct-grid">
        <div class="pct-item"><span class="pct-lbl">100% — 1 rep</span><span class="pct-val" id="p100">—</span></div>
        <div class="pct-item"><span class="pct-lbl">95% — 2 reps</span><span class="pct-val" id="p95">—</span></div>
        <div class="pct-item"><span class="pct-lbl">90% — 3 reps</span><span class="pct-val" id="p90">—</span></div>
        <div class="pct-item"><span class="pct-lbl">85% — 5 reps</span><span class="pct-val" id="p85">—</span></div>
        <div class="pct-item"><span class="pct-lbl">80% — 6 reps</span><span class="pct-val" id="p80">—</span></div>
        <div class="pct-item"><span class="pct-lbl">75% — 8 reps</span><span class="pct-val" id="p75">—</span></div>
        <div class="pct-item"><span class="pct-lbl">70% — 10 reps</span><span class="pct-val" id="p70">—</span></div>
        <div class="pct-item"><span class="pct-lbl">60% — 15 reps</span><span class="pct-val" id="p60">—</span></div>
      </div>
    </div>`
  },
  about: {
    title:'ℹ️ À propos',
    html:()=>{
      // Lit le cache SW actif → version réelle chargée sur ce téléphone
      if('caches' in window){
        caches.keys().then(keys=>{
          const ft=keys.find(k=>k.startsWith('ft-v'));
          const el=document.getElementById('_about-ver');
          if(el&&ft)el.textContent=ft;
        });
      }
      // Remplit la taille du stockage (asynchrone)
      if(typeof _fillStorageInfo==='function')setTimeout(_fillStorageInfo,50);
      return`<div style="text-align:center;padding:10px 0 20px;">
      <img src="logo.png" style="width:80px;height:80px;border-radius:20px;margin-bottom:16px;">
      <div style="font-family:var(--font-cond);font-size:28px;font-weight:900;background:linear-gradient(135deg,#FF2D55,#FF6D00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px;">Force Tracker</div>
      <div id="_about-ver" style="display:inline-block;background:rgba(255,45,85,.12);color:var(--red);font-family:var(--font-cond);font-size:15px;font-weight:800;padding:5px 16px;border-radius:20px;letter-spacing:.05em;border:1px solid rgba(255,45,85,.22);margin-bottom:20px;">…</div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;text-align:left;margin-bottom:12px;font-size:13px;line-height:1.7;color:var(--t2);">
        Application de suivi de musculation Progressive Web App.<br>
        Fonctionne hors connexion · Synchronisation Google Sheets<br>
        Coach IA propulsé par Claude (Anthropic)
      </div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;text-align:left;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--t1);margin-bottom:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5BA8FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
          Stockage sur ton téléphone
        </div>
        <div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:12px;">
          L'appli garde les <strong>figurines d'exercices</strong> et les écrans sur ton téléphone pour marcher <strong>hors connexion</strong> et s'ouvrir vite.<br>
          Espace utilisé : <strong id="_about-storage" style="color:var(--t1);">calcul…</strong>
        </div>
        <button onclick="clearAppCache()" style="width:100%;padding:11px;border:none;border-radius:10px;background:rgba(255,149,0,.14);color:var(--orange);font-weight:700;font-size:13.5px;font-family:var(--font);cursor:pointer;">🧹 Vider le cache (garde tes données)</button>
        <div style="font-size:11.5px;color:var(--t3);line-height:1.5;margin-top:8px;">Vide seulement les fichiers de l'appli (figurines, images). <strong>Tes séances, records et réglages ne sont pas touchés.</strong> Les figurines se réinstallent aussitôt (une barre s'affiche).</div>
      </div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;text-align:left;font-size:13px;color:var(--t2);">
        <div style="margin-bottom:6px;">✉️ <strong>Contact :</strong> michdu75@gmail.com</div>
        <div style="margin-bottom:6px;">⭐ <strong>Premium :</strong> ko-fi.com/michel2176</div>
        <div>🐛 <strong>Bugs / suggestions :</strong> par email</div>
      </div>
    </div>`;
    }
  }
};

function openDrawerContent(key){
  closeMenuDrawer();
  const cnt=_DRAWER_CONTENT[key];if(!cnt)return;
  closeDrawer();
  const body=document.getElementById('drawer-cnt-body');
  const htmlContent=typeof cnt.html==='function'?cnt.html():cnt.html;
  if(body)body.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--sep);"><span style="font-weight:900;font-size:17px;">${cnt.title}</span><button onclick="closeDrawerContent()" style="width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--sep);color:var(--t2);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button></div>${htmlContent}`;
  const ov=document.getElementById('ov-drawer-cnt');
  ov.classList.add('open');
  const modal=ov.querySelector('.modal');
  // Swipe : le geste anime déjà le glissé → fermeture immédiate (pas de double animation)
  if(modal)_addSwipeClose(modal,function(){const o=document.getElementById('ov-drawer-cnt');if(o)o.classList.remove('open','dc-closing');},modal,null,modal.querySelector('.modal-handle'),120);
}
function closeDrawerContent(){
  const ov=document.getElementById('ov-drawer-cnt');
  if(!ov||!ov.classList.contains('open'))return;
  ov.classList.add('dc-closing');           // joue le glissé vers le bas
  setTimeout(()=>{ov.classList.remove('open','dc-closing');},250);
}


/* ── Swipe-down pour fermer (drawer / modales / lightbox) ── */
function _addSwipeClose(el,closeFn,scrollEl,canClose,handleEl,threshold){
  if(!el||el._scd)return;el._scd=true;
  threshold=threshold||160;
  let y0=0,go=false;
  const trigger=handleEl||el;
  trigger.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    y0=e.touches[0].clientY;go=true;
  },{passive:true});
  el.addEventListener('touchmove',e=>{
    if(!go||e.touches.length!==1)return;
    if(canClose&&!canClose())return;
    const dy=e.touches[0].clientY-y0;
    const st=(scrollEl||el).scrollTop||0;
    if(dy>0&&st<=2){
      e.preventDefault();
      el.style.transition='none';
      el.style.transform=`translateY(${Math.min(dy*.55,200)}px)`;
    }
  },{passive:false});
  el.addEventListener('touchend',e=>{
    if(!go)return;go=false;
    if(canClose&&!canClose()){el.style.transition='';el.style.transform='';return;}
    const dy=e.changedTouches[0].clientY-y0;
    if(dy>threshold){
      el.style.transition='transform .22s ease';
      el.style.transform='translateY(100vh)';
      setTimeout(()=>{el.style.transition='';el.style.transform='';closeFn();},220);
    }else{el.style.transition='';el.style.transform='';}
  },{passive:true});
}
let _aZoom=1,_aTx=0,_aTy=0,_aLastDist=0,_aTsX=0,_aTsY=0,_aTsTx=0,_aTsTy=0,_aTapT=0;
function openAnatomyImg(path,title){
  const ov=document.getElementById('ov-anatomy-img');
  const img=document.getElementById('anatomy-full-img');
  const ttl=document.getElementById('anatomy-full-title');
  if(img){img.src=path;img.style.transform='';}
  if(ttl)ttl.textContent=title;
  _aZoom=1;_aTx=0;_aTy=0;
  if(ov){ov.style.display='flex';_addSwipeClose(ov,closeAnatomyImg,null,()=>_aZoom<=1.05);}
  _aInitZoom();
}
function closeAnatomyImg(){const ov=document.getElementById('ov-anatomy-img');if(ov)ov.style.display='none';}
function _aApply(){const img=document.getElementById('anatomy-full-img');if(img)img.style.transform=`translate(${_aTx}px,${_aTy}px) scale(${_aZoom})`;}
function _aReset(){_aZoom=1;_aTx=0;_aTy=0;_aApply();}
function _aInitZoom(){
  const img=document.getElementById('anatomy-full-img');
  if(!img||img._zi)return;img._zi=true;
  img.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      e.preventDefault();
      _aLastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    } else if(e.touches.length===1){
      const now=Date.now();
      if(now-_aTapT<300){_aReset();_aTapT=0;}
      else{_aTapT=now;_aTsX=e.touches[0].clientX;_aTsY=e.touches[0].clientY;_aTsTx=_aTx;_aTsTy=_aTy;}
    }
  },{passive:false});
  img.addEventListener('touchmove',e=>{
    if(e.touches.length===2){
      e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(_aLastDist>0)_aZoom=Math.max(1,Math.min(6,_aZoom*(d/_aLastDist)));
      _aLastDist=d;_aApply();
    } else if(e.touches.length===1&&_aZoom>1.05){
      e.preventDefault();
      _aTx=_aTsTx+(e.touches[0].clientX-_aTsX);
      _aTy=_aTsTy+(e.touches[0].clientY-_aTsY);
      _aApply();
    }
  },{passive:false});
  img.addEventListener('touchend',()=>{_aLastDist=0;if(_aZoom<1.05)_aReset();});
}

function exportData(){
  closeDrawer();
  try{
    const payload={
      exportDate:new Date().toISOString(),
      profile:{name:S.name,age:S.age,height:S.height,bw:S.bw,gender:S.gender,goal:S.goal,contact:'forcetracker.app@gmail.com'},
      sessions:S.sessions||[],
      prs:S.prs||{},
      weightLog:S.weightLog||[],
      sleepLog:S.sleepLog||[],
      badges:S.badges||{}
    };
    const json=JSON.stringify(payload,null,2);
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='forcetracker_'+today()+'.json';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},500);
    toast('Données exportées en JSON ✓','success');
  }catch(e){toast('Erreur export : '+e.message,'error');}
}

async function _saveCoachMemory(){
  if(!S.premium||!S.url||!S.email)return;
  try{
    const resp=await fetch(S.url,{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'summarizeCoach',email:S.email,
        history:coachHistory.slice(-16),existingMemory:S.coachMemory||''})
    });
    const data=await resp.json();
    if(data.summary){S.coachMemory=data.summary;localStorage.setItem('ft4_coach_mem',data.summary);}
  }catch(e){}
}

const _ML_MSGS=['Analyse de ta morphologie en cours...','Détection des groupes musculaires...','Calcul de la composition corporelle...','Génération de tes recommandations...'];
let _mlTimer=null,_mlBarTimer=null;

function showMorphoLoading(photos){
  const ov=document.getElementById('ov-morpho-loading');if(!ov)return;
  const ph=document.getElementById('ml-photos');
  const scan=document.getElementById('ml-scan-line');
  if(ph){
    ph.innerHTML=photos.filter(Boolean).map(b64=>`<img src="data:image/jpeg;base64,${b64}" style="flex:1;height:88px;object-fit:cover;border-radius:8px;max-width:108px;">`).join('');
    if(scan)ph.appendChild(scan);
  }
  const msgEl=document.getElementById('ml-msg');
  const bar=document.getElementById('ml-bar');
  let msgIdx=0;
  const barPct=[5,20,38,55,70,82,90,95];
  let barIdx=0;
  if(msgEl)msgEl.textContent=_ML_MSGS[0];
  if(bar)bar.style.width=(barPct[barIdx++]||5)+'%';
  _mlTimer=setInterval(()=>{
    msgIdx=(msgIdx+1)%_ML_MSGS.length;
    if(msgEl){msgEl.style.opacity='0';setTimeout(()=>{msgEl.textContent=_ML_MSGS[msgIdx];msgEl.style.opacity='1';},200);}
    if(bar&&barIdx<barPct.length)bar.style.width=barPct[barIdx++]+'%';
  },2000);
  ov.classList.add('open');
}

function hideMorphoLoading(){
  clearInterval(_mlTimer);_mlTimer=null;
  const ov=document.getElementById('ov-morpho-loading');
  const bar=document.getElementById('ml-bar');
  if(bar)bar.style.width='5%';
  if(ov)ov.classList.remove('open');
}

function initCoachInput() {
  const inp = document.getElementById('coach-inp');
  if (inp) {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToCoach(); }
    });
  }
}




