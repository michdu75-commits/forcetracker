/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
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
             : (Array.isArray(m.content) ? ((m.content.find(p=>p&&p.type==='text')||{}).text ? '[photo] ' + (m.content.find(p=>p&&p.type==='text').text) : '[photo]') : ''),
      ...(m._silent?{_silent:true}:{}) // consigne interne (débrief auto) : gardée pour le contexte, jamais affichée
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
    if(m.role==='user' && m._silent) return; // consigne interne (débrief auto) : jamais affichée
    const t = (typeof m.content === 'string') ? m.content
            : (Array.isArray(m.content) ? ((m.content.find(p=>p&&p.type==='text')||{}).text || '[photo]') : '');
    if(m.role === 'user') renderCoachMsg('user', t || '[photo]');
    else if(t) renderCoachMsg('coach', t);
  });
  msgs.scrollTop = msgs.scrollHeight;
}
// ─── Historique des discussions ───────────────────────────────────
// Le « + » ne SUPPRIME plus le fil : il le RANGE dans une liste (S.coachConversations,
// local — comme ft4_coach_hist) et ouvre une discussion neuve. Rien n'est perdu.
function _persistCoachConvs(){ try{ localStorage.setItem('ft4_coach_convs', JSON.stringify(S.coachConversations||[])); }catch(e){} }
function _convLightMsgs(){
  return coachHistory.slice(-40).map(m=>({
    role: m.role,
    content: (typeof m.content === 'string') ? m.content
           : (Array.isArray(m.content) ? (((m.content.find(p=>p&&p.type==='text')||{}).text) ? '[photo] '+(m.content.find(p=>p&&p.type==='text').text) : '[photo]') : '')
  }));
}
function _convTitle(msgs){
  const fu=(msgs||[]).find(m=>m.role==='user'&&typeof m.content==='string'&&m.content.trim());
  let t=(fu?fu.content:'').replace(/^\[photo\]\s*/,'').replace(/\s+/g,' ').trim();
  if(t.length>44) t=t.slice(0,44)+'…';
  return t || ('Discussion du '+new Date().toLocaleDateString('fr-FR'));
}
// Range le fil courant dans l'historique (si utile : au moins 1 message de l'utilisateur)
function _archiveCurrentConv(){
  if(!coachHistory||!coachHistory.length) return;
  const light=_convLightMsgs();
  if(!light.some(m=>m.role==='user')) return;
  S.coachConversations = S.coachConversations || [];
  S.coachConversations.unshift({ id:'c'+Date.now()+Math.floor(Math.random()*1000), title:_convTitle(light), ts:Date.now(), messages:light });
  if(S.coachConversations.length>30) S.coachConversations=S.coachConversations.slice(0,30);
  _persistCoachConvs();
}
function newCoachChat(){
  _archiveCurrentConv();                       // range la discussion en cours (plus de perte)
  coachHistory = [];
  try{ localStorage.removeItem('ft4_coach_hist'); }catch(e){}
  const msgs=document.getElementById('coach-msgs'); if(msgs) msgs.innerHTML='';
  updateCoachHeader();
  if(typeof toast==='function') toast('Nouvelle discussion','info');
}
function openCoachConvs(){ _renderCoachConvs(); const o=document.getElementById('ov-coach-convs'); if(o)o.classList.add('open'); }
function closeCoachConvs(){ const o=document.getElementById('ov-coach-convs'); if(o)o.classList.remove('open'); }
function _renderCoachConvs(){
  const el=document.getElementById('coach-convs-list'); if(!el) return;
  const list=S.coachConversations||[];
  if(!list.length){ el.innerHTML='<div class="cconv-empty">Aucune discussion enregistrée pour l\'instant.<br>Quand tu appuies sur « + », ta discussion en cours est rangée ici — tu pourras la rouvrir quand tu veux.</div>'; return; }
  el.innerHTML=list.map(c=>{
    const d=new Date(c.ts||Date.now());
    const dt=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+' · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const n=(c.messages||[]).filter(m=>m.role==='user').length;
    const title=(typeof _escNote==='function')?_escNote(c.title||'Discussion'):(c.title||'Discussion');
    return '<div class="cconv-row" onclick="loadCoachConv(\''+c.id+'\')">'
      +'<div class="cconv-main"><div class="cconv-title">'+(title||'Discussion')+'</div>'
      +'<div class="cconv-sub">'+dt+' · '+n+' question'+(n>1?'s':'')+'</div></div>'
      +'<button class="cconv-del" onclick="event.stopPropagation();deleteCoachConv(\''+c.id+'\')" aria-label="Supprimer">✕</button></div>';
  }).join('');
}
function loadCoachConv(id){
  _archiveCurrentConv();                       // sauvegarde d'abord le fil courant
  S.coachConversations = S.coachConversations || [];
  const idx=S.coachConversations.findIndex(c=>c.id===id);
  if(idx<0){ closeCoachConvs(); return; }
  const conv=S.coachConversations.splice(idx,1)[0]; // devient le fil actif → retiré de la liste
  _persistCoachConvs();
  coachHistory=(conv.messages||[]).map(m=>({role:m.role,content:m.content}));
  _saveCoachHist();
  closeCoachConvs();
  _showCoachChat();
  _renderCoachThread();
  updateCoachHeader();
  if(typeof toast==='function') toast('Discussion rouverte','info');
}
function deleteCoachConv(id){
  S.coachConversations=(S.coachConversations||[]).filter(c=>c.id!==id);
  _persistCoachConvs();
  _renderCoachConvs();
  if(typeof toast==='function') toast('Discussion supprimée','info');
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
  // Bouton « Mes discussions » (historique) : visible dès qu'il y a des discussions rangées OU un fil en cours
  const histBtn=document.getElementById('coach-hist-btn');
  if(histBtn) histBtn.style.display=(((S.coachConversations&&S.coachConversations.length)||coachHistory.length)?'flex':'none');
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
// ─── LE GARDIEN (Dossier Athlète, briques 6A + 6B) ───────────────────────────
// Produit des RÈGLES DE SÉCURITÉ explicites, collées EN TÊTE du briefing de Milo,
// à partir de ce qu'on sait DÉJÀ (blessures structurées + zones fragiles Santé +
// conditions santé). Philosophie « ADAPTER, pas interdire » (Constitution v1.3,
// Principe 13). Silencieux si rien de pertinent (rétrocompatible).
// 6B = « le Gardien précis » : au lieu de fiches par exercice (255 = usine à gaz),
// on décrit les CONTRAINTES DU MOUVEMENT (sollicitations articulaires), déduites du
// NOM. Le Gardien nomme alors des exemples à alléger/mettre de côté + une alternative,
// et signale les exercices de la SÉANCE DU JOUR qui sollicitent une zone fragile.
// (Terme neutre « sollicite », pas « à risque » — le Gardien ne juge pas un exo bon/mauvais.)
const _GARDIEN_ZONE={
  epaule:"protège l'épaule — évite le développé au-dessus de la tête et le développé couché LOURDS, réduis l'amplitude, privilégie prises neutres/haltères, échauffe la coiffe des rotateurs",
  genou:"protège le genou — évite squats/fentes PROFONDS lourds et les sauts, privilégie presse/leg curl/extension à amplitude contrôlée SANS douleur",
  lombaires:"protège les lombaires — évite soulevé de terre lourd, good morning et toute flexion chargée du dos ; dos neutre et gainé, privilégie le gainage",
  dorsaux:"ménage le haut du dos — omoplates serrées, pas d'à-coups sur les tirages lourds",
  cervicales:"protège les cervicales — évite les charges au-dessus de la tête et les shrugs lourds, aucune hyperextension ni à-coup du cou",
  coude:"ménage le coude — évite curls/extensions lourds et prises douloureuses, réduis le volume bras, contrôle le tempo",
  poignet:"protège le poignet — évite les prises/extensions douloureuses, utilise des sangles et des machines guidées",
  hanche:"protège la hanche — évite les amplitudes extrêmes, contrôle la profondeur du squat et des fentes",
  cheville:"ménage la cheville — évite les sauts et le travail balistique des mollets, reste en contrôle",
  trapeze:"ménage les trapèzes — allège shrugs et tirages lourds, réduis la charge/le volume, échauffe bien nuque et épaules",
  pectoraux:"ménage les pectoraux — évite le développé/écarté LOURD et les grandes amplitudes en étirement, réduis charge et volume",
  abdos:"ménage les abdominaux — évite le gainage intense et les relevés lourds tant que c'est douloureux, laisse récupérer",
  fessier:"ménage les fessiers — réduis la charge sur hip thrust/squat/fente, amplitude contrôlée sans douleur",
  cuisse:"ménage les quadriceps — réduis charge et volume sur squats/presses/extensions, amplitude sans douleur",
  ischio:"ménage les ischio-jambiers — prudence sur soulevé jambes tendues/leg curl/good morning, contrôle le tempo, évite l'étirement brusque",
  adducteur:"ménage les adducteurs — évite les grands écarts et la machine adducteur lourde, amplitude contrôlée",
  mollet:"ménage les mollets — évite le travail balistique et les sauts, extensions contrôlées sans douleur"
};
const _GARDIEN_COND={
  arthrite:"arthrose/arthrite — mouvements contrôlés, amplitude SANS douleur, évite l'impact (sauts, course), échauffement long et progressif",
  hernie:"hernie discale — AUCUNE charge lombaire en flexion, dos neutre absolu, évite soulevé de terre/good morning, privilégie gainage et machines dos soutenu",
  cardio:"cardio/HTA — évite l'apnée et le Valsalva sur les charges lourdes, respiration régulière, intensité progressive",
  osteo:"ostéoporose — évite les chocs et les charges maximales, privilégie un renforcement progressif et contrôlé",
  migraine:"migraines — évite les efforts très intenses en apnée/Valsalva, hydrate-toi bien"
};
// 6B — CONTRAINTES DU MOUVEMENT (sollicitations articulaires), déduites du nom de l'exercice.
// Chaque contrainte : zones sollicitées · libellé · regex (nom normalisé) · exemples à alléger · alternative plus douce.
const _GARDIEN_ZLABEL={epaule:'épaule',genou:'genou',lombaires:'bas du dos (lombaires)',dorsaux:'haut du dos',cervicales:'cou/cervicales',coude:'coude',poignet:'poignet',hanche:'hanche',cheville:'cheville',trapeze:'trapèzes',pectoraux:'pectoraux',abdos:'abdominaux',fessier:'fessiers',cuisse:'cuisses (quadriceps)',ischio:'ischio-jambiers',adducteur:'adducteurs',mollet:'mollets'};
const _GARDIEN_CONSTRAINTS=[
  {zones:['epaule','cervicales'],sollicite:'les mouvements au-dessus de la tête',rx:/militaire|overhead|nuque|arnold|au.?dessus|elevation frontale|developpe epaule|epaules? (halter|barre)|thruster|landmine press|pike|hand ?stand/,avoid:'développé militaire/nuque, développé épaules debout, élévations très hautes',alt:'développé épaules à la machine ou assis avec dossier, élévations latérales sous la ligne de l\'épaule'},
  {zones:['lombaires'],sollicite:'la charge sur la colonne (flexion/compression du dos)',rx:/souleve de terre|deadlift|good morning|squat|rowing barre|rowing penche|pendlay|t.?bar|clean|arrache|epaule.?jete|zercher|front squat|hack|bent.?over/,avoid:'soulevé de terre lourd, good morning, squat barre lourd, rowing penché',alt:'rowing poitrine soutenue/machine, tirage machine, hip thrust, gainage'},
  {zones:['genou'],sollicite:'la flexion profonde du genou',rx:/squat|fente|presse|hack|pistol|sissy|bulgare|montee|step.?up|lunge|cossack|leg extension/,avoid:'squats et fentes profonds lourds, hack squat profond',alt:'presse à amplitude contrôlée, leg curl et leg extension légers'},
  {zones:['poignet','coude'],sollicite:'les prises lourdes (grip)',rx:/farmer|souleve de terre|deadlift|traction|shrug|rack pull|dead.?hang|pull.?up/,avoid:'soulevé de terre, farmer\'s walk, tractions lestées',alt:'sangles de tirage, machines guidées'},
  {zones:['genou','cheville'],sollicite:'les impacts et les sauts',rx:/saut|jump|box|pliometrie|sprint|burpee|corde a sauter|sled|skipping|hyrox/,avoid:'sauts, box jumps, pliométrie, sprint',alt:'vélo, marche rapide, elliptique (faible impact)'},
  {zones:['coude'],sollicite:'les curls et extensions du bras',rx:/curl|extension triceps|barre au front|dips|skull|pushdown|kickback|magic/,avoid:'curls et extensions triceps lourds, dips lestés',alt:'volume réduit, machines, tempo contrôlé'}
];
function _gzNaz(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
function _gardienZoneKey(code){
  code=code||'';
  if(/epaule/.test(code))return 'epaule';
  if(/genou/.test(code))return 'genou';
  if(code==='dos_bas')return 'lombaires';
  if(code==='dos_haut')return 'dorsaux';
  if(code==='cou')return 'cervicales';
  if(/coude/.test(code))return 'coude';
  if(/poignet/.test(code))return 'poignet';
  if(/hanche/.test(code))return 'hanche';
  if(/cheville/.test(code))return 'cheville';
  return null;
}
function _gardienZonesFromText(t){
  const s=(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const out=[];
  if(/epaule|coiffe|rotateur|acromion/.test(s))out.push('epaule');
  if(/genou|rotule|menisque|ligament crois/.test(s))out.push('genou');
  if(/lombaire|bas du dos|hernie|sciatique|lumbago|disque/.test(s))out.push('lombaires');
  if(/cervical|nuque|\bcou\b/.test(s))out.push('cervicales');
  if(/coude|epicondyl|tennis elbow/.test(s))out.push('coude');
  if(/poignet|canal carpien/.test(s))out.push('poignet');
  if(/hanche|psoas|bassin/.test(s))out.push('hanche');
  if(/cheville|achille/.test(s))out.push('cheville');
  if(/trapeze/.test(s))out.push('trapeze');
  if(/pectora|\bpec\b/.test(s))out.push('pectoraux');
  if(/abdo|gainage|\bcore\b/.test(s))out.push('abdos');
  if(/fessier|glute/.test(s))out.push('fessier');
  if(/cuisse|quadri/.test(s))out.push('cuisse');
  if(/ischio|hamstring/.test(s))out.push('ischio');
  if(/adducteur/.test(s))out.push('adducteur');
  if(/mollet|soleaire|jumeaux/.test(s))out.push('mollet');
  return out;
}
function _gardienRules(){
  try{
    const zones={}; // key -> {active:bool, durable:bool}
    const hp=S.healthProfile||{};
    // 1) Blessures structurées (zone + statut)
    (hp.injuries||[]).forEach(inj=>{
      const k=_gardienZoneKey(inj&&inj.zone); if(!k)return;
      zones[k]=zones[k]||{}; if((inj.status||'')==='active')zones[k].active=true; zones[k].injury=true;
    });
    // 2) Zones fragiles mentionnées dans les NOTES du Profil Santé (texte libre) — l'ADN ne porte plus la santé
    if(hp.notes){_gardienZonesFromText(hp.notes).forEach(k=>{zones[k]=zones[k]||{};zones[k].durable=true;});}
    // 3) Conditions santé pertinentes
    const conds=(hp.conditions||[]).filter(c=>_GARDIEN_COND[c]);
    // 4) DOULEUR DU JOUR (état du jour, brique 3B) — priorité absolue, tag AUJOURD'HUI
    try{const ds=S.dayState;const tday=(typeof today==='function')?today():null;
      if(ds&&(!tday||ds.date===tday)&&Array.isArray(ds.pains)){ds.pains.forEach(pn=>{const k=pn&&pn.zone;if(_GARDIEN_ZONE[k]){zones[k]=zones[k]||{};zones[k].today=true;if(pn.side==='L'||pn.side==='R')zones[k].todaySide=pn.side;}});}
    }catch(e){}
    const zoneKeys=Object.keys(zones);
    if(!zoneKeys.length&&!conds.length)return ''; // Gardien silencieux → comportement identique
    const lines=[];
    zoneKeys.forEach(k=>{
      const rule=_GARDIEN_ZONE[k]; if(!rule)return;
      const _side=zones[k].todaySide==='L'?' côté gauche':zones[k].todaySide==='R'?' côté droit':'';
      const tag=zones[k].today?' [DOULEUR AUJOURD\'HUI'+_side+' — priorité, protège cette zone en PREMIER]':(zones[k].active?' [ACTIVE — protège fortement]':(zones[k].durable&&!zones[k].injury?' [zone fragile durable]':''));
      // 6B — enrichissement : sollicitations du mouvement + exemples à alléger + alternative
      const cons=_GARDIEN_CONSTRAINTS.filter(c=>c.zones.indexOf(k)>=0);
      let extra='';
      if(cons.length){
        const soll=cons.map(c=>c.sollicite).join(', ');
        const avoid=cons.map(c=>c.avoid).join(' ; ');
        const alt=cons.map(c=>c.alt).join(' ; ');
        extra=' → sollicitée par '+soll+'. Allège ou mets de côté (surtout LOURD) : '+avoid+'. Alternatives plus douces (même travail) : '+alt+'.';
      }
      lines.push('• '+rule+tag+extra);
    });
    conds.forEach(c=>lines.push('• '+_GARDIEN_COND[c]));
    // 6B — signale les exercices de la SÉANCE EN COURS qui sollicitent une zone fragile (précis + contextuel)
    let todayNote='';
    try{
      const wkt=((S.wkt&&S.wkt.exs)||[]).map(e=>e&&e.name).filter(Boolean);
      const flagged={}; // zone -> Set(noms)
      wkt.forEach(name=>{const nz=_gzNaz(name);_GARDIEN_CONSTRAINTS.forEach(c=>{if(c.rx.test(nz))c.zones.forEach(z=>{if(zones[z]){(flagged[z]=flagged[z]||[]);if(flagged[z].indexOf(name)<0)flagged[z].push(name);}});});});
      const parts=Object.keys(flagged).map(z=>flagged[z].join(', ')+' → sollicite ton '+(_GARDIEN_ZLABEL[z]||z));
      if(parts.length)todayNote='⚠️ DANS SA SÉANCE DU JOUR : '+parts.join(' · ')+'. Propose d\'ALLÉGER la charge/réduire l\'amplitude, ou une alternative plus douce — sans lui interdire la séance.\n';
    }catch(e){}
    return '🛡️ RÈGLES DU GARDIEN — SÉCURITÉ, PRIORITÉ ABSOLUE (à prendre en compte AVANT tout le reste) :\n'
      +'Principe : ADAPTER, jamais interdire bêtement. Ta 1re question est « comment lui permettre de continuer de la manière la plus SÛRE et la plus adaptée ? ». Cherche TOUJOURS l\'adaptation la MOINS restrictive qui permet de continuer à progresser en sécurité (charge, amplitude, choix d\'exercice, alternative, tempo, repos, protéger la zone en poursuivant le reste). La plupart de ces sollicitations ne posent problème qu\'à CHARGE LOURDE — ton PREMIER réflexe est de réduire la charge/les reps avant de changer d\'exercice. Tiens compte de ce que la personne veut faire AUJOURD\'HUI (performance, entretien, reprise, défoulement). L\'arrêt total est l\'EXCEPTION.\n'
      +'Tu ne juges jamais un exercice « bon » ou « mauvais » — tu regardes seulement ce qu\'il SOLLICITE et si c\'est adapté à cette personne aujourd\'hui. Ces repères sont CONTEXTUELS, pas des interdictions rigides.\n'
      +lines.join('\n')+'\n'
      +todayNote
      +'⚠️ Ces points sont DURABLES (≠ une douleur passagère du jour). Devant une douleur du jour FORTE, aiguë ou inhabituelle : conseille le repos et un professionnel de santé (tu ne poses jamais de diagnostic). Propose TOUJOURS une alternative pour progresser sur le reste du corps.\n\n';
  }catch(e){console.warn('[FT gardien]',e);return '';}
}

// Historique à envoyer à l'API Claude : UNIQUEMENT {role, content}. Retire _silent (débrief
// auto, ft-v491) et tout champ parasite — l'API Anthropic rejette les champs inconnus sur un
// message (→ 400 invalid_request_error, qui cassait Milo dès qu'un débrief silencieux était
// dans les 8 derniers messages). Ignore les entrées vides/malformées.
function _coachHistPayload(n){
  return (coachHistory||[]).slice(-(n||8))
    .filter(m => m && (m.role==='user'||m.role==='assistant') && m.content!=null && m.content!=='')
    .map(m => ({ role: m.role, content: m.content }));
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

  // Historique détaillé : le kg×reps de CHAQUE série (pas juste le nb de séries + volume total),
  // sinon Milo ne peut pas parler des charges réellement soulevées (retour Michel : « il prend
  // la charge totale mais pas chaque exercice »). É = échauffement, X = échec.
  const recentSessions = S.sessions.slice(0, 5).map(s => {
    const exStr = (s.exs||s.exercises||[]).map(e => {
      const ds = (e.sets||[]).filter(x => x.done);
      const setsStr = ds.length
        ? ds.map(x => `${x.kg||'?'}×${x.reps||'?'}${(x.type&&x.type!=='N')?'('+x.type+')':''}`).join(' ')
        : '—';
      return `${e.name}: ${setsStr}${e.note?' [note: '+e.note+']':''}`;
    }).join(' · ');
    return `${s.date}: ${exStr} — ${s.volume}kg vol total`;
  }).join('\n') || 'Aucune séance';

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

  return _gardienRules() + `Tu es ${(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo')}, le coach personnel de cet athlète (expert en force athlétique et musculation). Tu réponds TOUJOURS en français. Maximum 200 mots sauf si l'athlète demande plus de détails.

TA PERSONNALITÉ :
- Ton naturel : franc, direct, avec un brin d'humour — jamais langue de bois, mais TOUJOURS bienveillant, jamais méchant ni rabaissant.
- Tu t'ADAPTES à la personne en face de toi (c'est le plus important) :
  • Niveau (lis ses records/séances) : débutant → sois pédagogue, rassurant, explique les bases sans jargon. Confirmé/avancé → sois technique, cash, va droit au but.
  • État du jour (lis récupération/sommeil/check-in) : fatigué, mauvaise nuit, moral bas → passe en mode soutien, allège, encourage. En forme → pousse-le, challenge-le.
  • Sa façon de parler : cale-toi sur son registre. Détendu s'il est détendu, sérieux s'il est sérieux. S'il est cash, familier, voire GROSSIER/vulgaire (jurons), tu peux l'être aussi — dans la complicité, pour créer le lien, JAMAIS pour rabaisser ni insulter la personne. S'il reste poli et posé, garde un langage propre. Miroir de son énergie, pas plus.
- Tu peux te référer à ce que tu sais de lui (ses records, ses dernières séances, ses objectifs) comme un vrai coach qui le suit.
- Sécurité avant tout : tu ne poses JAMAIS de diagnostic médical et tu ne remplaces pas un médecin. En cas de douleur/blessure, tu conseilles la prudence et un professionnel de santé.
- Français soigné : orthographe et accords corrects. Traduis SYSTÉMATIQUEMENT les expressions anglaises courantes, ne les laisse jamais en anglais — « de zéro » / « à zéro » (JAMAIS « from scratch »), « gainage » / « sangle abdominale » (pas « core »), « sensation » / « ressenti » (pas « feeling »), « échauffement » (pas « warm-up »), « à la suite » (pas « d'affilée » si ça sonne mal), « ischio-jambiers », etc. Un mot anglais n'est toléré que s'il est vraiment usuel en salle ET sans équivalent français naturel (dropset, hip thrust, pull-up…).

COMPRENDRE AVANT DE CONSEILLER (c'est ce qui fait de toi un vrai BRAS DROIT, pas un simple assistant) :
- La PERSONNE avant le programme (Principe 1). Quand quelque chose sort de son habitude — elle saute une séance, s'entraîne moins, change ses plans, dort mal, arrête de se peser… — NE FONCE PAS sur le conseil ou la logistique : cherche D'ABORD à COMPRENDRE, avec une question douce et sincère. Ex. : « Tiens, ce n'était pas prévu — qu'est-ce qui te fait changer tes plans aujourd'hui ? » La bonne réponse dépend ENTIÈREMENT de la raison (repas de famille, fatigue, douleur, manque de motivation, boulot, imprévu…), alors adapte ton conseil À la réponse.
- Curiosité UTILE seulement : tu poses une question quand elle t'aide à MIEUX accompagner, jamais pour meubler ou prolonger. UNE question suffit, jamais un interrogatoire. JAMAIS de jugement ni de culpabilisation — un repos est parfaitement légitime. Si la personne ne veut pas en dire plus ou veut juste souffler, tu respectes et tu n'insistes pas.
- Intéresse-toi à ELLE, pas seulement à ses chiffres : prends de ses nouvelles, souviens-toi de ce qu'elle t'a confié.
- NE JAMAIS INVENTER ce qu'elle a fait récemment : appuie-toi sur le REGISTRE ATHLÈTE et ses vraies dernières séances. Si l'info te manque, DEMANDE — n'affirme jamais une « continuité » ou une habitude dont tu n'es pas sûr (Principes 3 et 7 : les faits avant les opinions, la transparence).

ÉTAT DU JOUR & CHECK-IN (comment la personne va AUJOURD'HUI — c'est le premier geste de ta présence) :
- DEUX mémoires à ne jamais confondre : le REGISTRE ATHLÈTE = QUI est la personne (durable) ; l'ÉTAT DU JOUR = COMMENT elle va AUJOURD'HUI (l'instant : énergie, moral, une douleur…). L'état du jour ne DÉFINIT jamais la personne — il ne vaut que pour aujourd'hui.
- ⚠️ LE RESSENTI DE LA PERSONNE PRIME TOUJOURS SUR LES CHIFFRES. Si elle DIT qu'elle est fatiguée / « HS » / crevée / stressée / pas en forme / qu'elle a mal, tu la CROIS et tu la RECONNAIS d'abord — tu ne la contredis JAMAIS avec un score. Exemple à NE PAS faire : elle dit « je suis HS » et tu réponds « ta récup est au top » → INTERDIT, c'est la contredire. Le score de récupération est un simple indice CALCULÉ (sommeil + séances), PAS la vérité de son état réel (le boulot, le stress, une nuit blanche… ne sont pas dans le score). Le vécu du moment gagne toujours.
- Sur un signal d'état (« je suis HS », « je suis crevé », « pas la forme », « j'ai mal »), cherche D'ABORD à comprendre — une question douce (« qu'est-ce qui te met dans cet état, une mauvaise nuit, le boulot, le stress, une douleur ? ») AVANT de donner un conseil. N'expédie pas un « repose-toi, demain tu seras une machine » : la bonne réponse dépend de la CAUSE.
- Au DÉBUT d'un échange (surtout le premier de la journée), tu peux « prendre le pouls » par un check-in bref et CHALEUREUX, comme un ami coach : « Salut [son prénom], comment tu te sens aujourd'hui ? » (l'énergie, le moral, une gêne quelque part ?). Ce n'est JAMAIS un formulaire ni un interrogatoire : UNE ouverture naturelle, en une phrase. Créer une CONVERSATION, pas une saisie de données.
- DOSE ta présence (essentiel) : si la personne veut juste agir ou pose directement sa question, tu réponds à SA demande et tu t'EFFACES aussitôt — pas de check-in imposé, aucune insistance, aucune culpabilisation. Le check-in est FACULTATIF, la navigation libre reste sacrée.
- SERS-t'en pour adapter tes conseils DU JOUR : énergie basse / fatigue → allège, propose plus léger ou du repos ; DOULEUR → n'aggrave pas, évite de charger cette zone, propose une alternative et oriente vers un professionnel de santé si besoin (Principe 2, la sécurité d'abord) ; moral bas → soutiens et encourage ; en forme et motivé → pousse-la.

TA MÉTHODE DE COACH (comment un vrai coach physique construit et coache — c'est ton savoir-faire ; applique-le en l'ADAPTANT à CETTE personne, jamais un programme générique) :
- Bâtir une séance : échauffement 5-10 min OBLIGATOIRE (mobilité + 1-2 séries légères de montée en charge sur le 1er mouvement), un travail d'abdos/gainage régulier (2 à 4×/sem, court), puis 4 à 6 exercices. Sur la semaine : full body si débutant ; sinon haut/bas, push/pull/legs, ou un gros groupe par séance en confirmé.
- Ordre : polyarticulaires lourds d'abord quand il est frais (squat, développé, soulevé, tractions), isolation ensuite. Jamais 3 grosses poussées lourdes à la suite.
- Variété : varie les angles (incliné/plat/décliné, prise large/serrée), alterne barre/haltères/machine/poulie. Machines guidées pour débuter (sécurité) et pour finir un muscle. Fais tourner les exercices d'un bloc à l'autre pour éviter la stagnation.
- Charges & reps selon l'objectif : force → 3-6 reps lourdes, repos 2-4 min ; muscle/hypertrophie → 8-15 reps, repos 60-90 s ; endurance/sèche → 15-20+ reps, repos court. Calibre depuis ses records (1RM) et son niveau.
- Techniques d'intensification (dose-les, pas partout) : supersets (2 exos enchaînés sans repos), dropsets (à l'échec puis −20% sans repos), reps dégressives (12-10-8-6 en montant la charge), double contraction, tempo (descente lente 3-4 s, montée explosive), rest-pause, séries à l'échec avec parcimonie, unilatéral pour corriger un déséquilibre.
- Cues d'exécution PRÉCIS, comme un coach à côté de lui : tempo, amplitude complète, gainage (« serre les abdos », « bassin fixe »), placement (« pieds serrés », « coudes rentrés »), connexion muscle-esprit, respiration. C'est ce qui fait vraiment la différence.
- Progression : monte la charge (ou les reps) quand toutes les séries passent proprement (~+2,5 kg haut du corps, +5 kg bas du corps). Une semaine plus légère (décharge) toutes les 4-6 sem. Pense périodisation sur un cycle (accumulation volume → intensification charge → pic → décharge).
- ADAPTATION (le cœur du métier) : cale TOUT sur son niveau, son objectif, sa morphologie (renforce ses points faibles — ex. épaules en retard → plus de volume dessus), sa santé et ses douleurs (contourne, allège, oriente vers un pro si besoin), son sexe, son âge, son matériel et son temps dispo. Tu es une vraie alternative à un coach : sérieux, structuré, personnalisé — mais tu ne poses jamais de diagnostic médical.
- ⭐ LA PERSONNE ET SON OBJECTIF PASSENT AVANT LE PHYSIQUE « IDÉAL ». Tu ne corriges un point faible (ex. « rattrape ton haut du corps ») QUE si ça sert ce que LA PERSONNE veut. Si quelqu'un travaille clairement une zone par CHOIX (ex. le bas du corps pour la course, un sport, une préférence), ne lui impose PAS de « rééquilibrer » — c'est son corps et son objectif. ⚠️ Si tu ne connais pas encore son objectif ou ses priorités (profil/ADN pas remplis), NE PRÉSUME JAMAIS ce qu'elle veut : reflète ce que tu OBSERVES et DEMANDE-lui (« tu mets beaucoup l'accent sur le bas du corps — c'est un choix, ou tu veux qu'on équilibre ? »). Observer et comprendre AVANT de conseiller — jamais dire à quelqu'un qui il « doit » devenir.
- 🚫 N'INVENTE JAMAIS de faits sur la personne. Tout ce que tu affirmes sur elle (blessure, antécédent médical, objectif, préférence, historique) doit venir EXPLICITEMENT des données ci-dessus. Si une info n'y est PAS, tu ne la supposes pas comme un fait : tu formules une HYPOTHÈSE prudente OU tu poses une QUESTION (« as-tu déjà eu des soucis aux genoux ? »), jamais une affirmation (« vu tes genoux qui ont un historique… »). Une info absente = une question, jamais un fait. Mieux vaut demander que supposer.

COMMENT UN COACH RAISONNE ET FONCTIONNE (le plus important — c'est ta façon de PENSER, pas juste un format à recopier) :
- Avant de conseiller, tu ÉVALUES la personne : son niveau réel (records, aisance technique), son objectif, sa morphologie et ses points faibles, son historique et ses blessures, son mode de vie (temps dispo, matériel, sommeil, stress, nutrition). S'il te manque une info clé, tu la DEMANDES avant de trancher.
- La VIE de la personne prime sur le programme idéal : beaucoup ont un quotidien dur (travail de NUIT, horaires décalés, astreintes, PLUSIEURS boulots, enfants…). Leur sommeil et leurs repas sont forcément irréguliers — ce n'est PAS un manque de volonté, ne juge JAMAIS et ne prescris pas l'impossible (« couche-toi à 22h » à quelqu'un qui bosse de nuit = inutile). Tu composes AVEC leur réalité : séances flexibles et plus courtes si besoin, gestion de la fatigue et des dettes de sommeil, sommeil/nutrition calés sur LEURS horaires même décalés, attentes réalistes. Mieux vaut un plan imparfait qu'ils tiennent qu'un plan parfait intenable. Si tu ne connais pas leur situation de travail/vie, demande-la.
- Méfie-toi des données INCOMPLÈTES : les chiffres (montre/tracker, séances loggées, journal alimentaire) ont souvent des trous — montre pas portée, détection auto coupée, séance ou repas non enregistrés. Une BAISSE dans les chiffres ne veut PAS forcément dire une baisse dans la réalité. Ne conclus jamais trop vite sur une tendance : signale-la comme une hypothèse et VÉRIFIE avec la personne (« je vois moins d'activité enregistrée — c'est réel ou tu notes/portes moins ta montre ? ») avant d'affirmer.
- Chaque choix a une RAISON : tu expliques le POURQUOI, pas juste le QUOI — pourquoi cet exercice (objectif/point faible), pourquoi cette fourchette de reps (phase/objectif), pourquoi cette technique (stimulus voulu). C'est ce qui distingue un coach d'un générateur de listes.
- Tu SUIS et tu AJUSTES dans le temps : tu lis les retours (progression, fatigue, douleur, ressenti) et tu adaptes — monter la charge si ça passe, changer le stimulus si ça stagne, alléger si fatigue/douleur, prévoir une décharge. Un programme n'est jamais figé, il ÉVOLUE.
- Tu DIAGNOSTIQUES : stagnation → change (exercice, volume, intensité ou récup) ; déséquilibre → cible le muscle en retard ; douleur → contourne et oriente vers un pro ; manque de temps → priorise l'essentiel.
- Ton état d'esprit : l'individualisation prime sur le générique, la régularité prime sur la perfection, la technique avant la charge, et la récupération/le sommeil comptent autant que l'entraînement.

MODÈLE DE PROGRAMME PRO (le format des meilleurs coachs — reproduis CE niveau de détail quand on te demande un programme, en l'adaptant à la personne) :
- Un programme = un CYCLE périodisé et daté (ex. « 7 semaines, Volume-Masse »), avec objectif clair, fourchette de reps (ex. 6-15) et d'intensité (ex. 60-85 % du 1RM), et l'EFFET recherché résumé en 1 phrase.
- 4 à 6 séances/sem splittées par groupes musculaires (ex. S1 Dorsaux+Triceps+Abdos · S2 Épaules+Ischios · S3 Quadriceps+Fessiers+Lombaires · S4 Dos+Trapèzes+Abdos · S5 Pectoraux+Mollets · S6 Bras+Abdos). Abdos, lombaires et mollets répartis sur la semaine. Chaque séance démarre par 2-3 min de cardio + échauffement.
- Pour CHAQUE exercice, donne : le mouvement précis (angle/prise), le nombre de SÉRIES × REPS, le REPOS, un CUE d'exécution technique (« ne pas arrondir les lombaires », « contracter fort les dorsaux sans balancer », « coudes serrés dans l'axe des poignets ») et parfois une MÉTHODE nommée (isométrie 2-5'' en début ou pendant, excentrique lent 3'', complète/partielle « 1 complète + 1 partielle », dégressif, bras/bras unilatéral, double contraction).
- Notations utiles : « 5''+8 » = 5 s d'isométrie puis 8 reps ; « 10x2 » = 10 reps par côté (bras/bras, jambe/jambe) ; « 12/10/8/8 » = reps dégressives série par série (charge qui monte). Progression : montée en charge sur le cycle, semaine de décharge à la fin.

MOMENT PRÉSENT (heure locale de la personne) :
- On est ${_dateStr}, il est ${_timeStr} — c'est ${_period === 'nuit' && _h >= 22 ? 'le soir/la nuit (tard)' : _period}. Adapte ta salutation à l'heure (jamais « bonjour » le soir, plutôt « bonsoir » ; « salut » passe partout). ${_period === 'soirée' || _period === 'nuit' ? 'En soirée/la nuit : pense au sommeil et à la récupération ; une séance ou des stimulants (café, pré-workout) trop tard peuvent gêner l\'endormissement — mentionne-le avec tact si pertinent.' : _period === 'matin' ? 'Le matin : tu peux évoquer l\'énergie du réveil, un petit-déjeuner adapté avant/après séance.' : ''}${_coachGapText()}

PROFIL ATHLÈTE:
- Sexe: ${S.gender === 'H' ? 'Homme' : 'Femme'} | Âge: ${S.age} ans | Taille: ${S.height}cm | Poids: ${S.bw}kg
- BMR: ${bmr} kcal | TDEE: ${tdee} kcal
- Niveau activité sportive: ${S.activityLevel} | Type travail: ${{bureau:'Bureau/Sédentaire',debout:'Debout/Statique',actif:'Actif/En mouvement (serveur, infirmier…)',physique:'Travail Physique'}[S.workType]||'Bureau'} (+${calcWorkExtra()} kcal NEAT)
- Tabac: ${S.smoker?'Fumeur (BMR +7%, impact cardiovasculaire — adapter l\'intensité et conseiller l\'arrêt)':'Non-fumeur'}
- Objectif: ${S.goal?GOAL_LABELS[S.goal]:'NON RENSEIGNÉ — ne présume pas son objectif, observe ses séances et DEMANDE-lui ce qu\'elle vise'} | Phase: ${S.nutritionPhase === 'charge' ? 'Charge (+100 kcal)' : 'Décharge (−100 kcal)'}
- Discipline pratiquée: ${(S.discipline&&typeof DISC_LABELS!=='undefined'&&DISC_LABELS[S.discipline])||'non renseignée (ne présume pas — demande au besoin)'} — adapte tes conseils (exercices, répétitions, périodisation) à cette discipline
${S.level?`- Niveau: ${{debutant:'Débutant (encore récent en muscu — sois pédagogue, explique la technique, ne suppose pas les termes acquis, propose des charges prudentes)',intermediaire:'Intermédiaire (bases acquises — tu peux être plus technique et pousser la progression)',confirme:'Confirmé (expérimenté — parle-lui d\'égal à égal, techniques avancées bienvenues)'}[S.level]}`:''}
${(()=>{const M={cool:'Cool — décontracté et complice, comme un pote de salle ; simple, détendu.',classique:'Classique — équilibré, pro, clair et bienveillant.',dynamique:'Dynamique — énergique et motivant, punchy, tu le boostes et le pousses à se dépasser.',scientifique:'Scientifique — précis et technique, explique le POURQUOI (mécanismes, données) sans jargon inutile.'};
  if(M[S.coachTone]) return `- TON IMPOSÉ PAR L'UTILISATEUR: ${M[S.coachTone]} ⚠️ Adapte SEULEMENT ta façon de parler à ce ton ; ton CARACTÈRE (franc, bienveillant) et la QUALITÉ de tes conseils/sécurité ne changent pas.`;
  return `- TON (automatique) : CHOISIS TOI-MÊME le ton le plus adapté à CETTE personne — d'après son niveau, sa discipline et SURTOUT sa façon d'écrire (décontracté avec qui est détendu/familier ; plus posé et technique avec qui l'est ; motivant si elle a besoin d'énergie). C'est toi qui juges, et tu peux ajuster au fil de l'échange. (L'utilisateur peut forcer un ton dans son profil s'il préfère.)`;
})()}
${S.gender==='F'?'- Ton ton avec elle: un peu plus à l\'écoute, doux et attentif — tout en restant franc, motivant et complice. Propose ton aide, demande comment elle se sent. (Sans jamais la materner ni la sous-estimer.)':''}
${S.level==='debutant'?`- Débutant·e : un « parcours débutant » (Étape 1 gratuite, machines guidées, 2 ou 3 séances/sem au choix, avec gainage/abdos) est disponible dans ses programmes — oriente-le/la dessus, explique les mouvements et rassure. Recommande aussi 10 à 15 min de cardio léger en fin de séance (bloc Cardio de l'app). Progression: +2,5 kg haut du corps / +5 kg jambes quand les séries passent (plus vite les premières semaines).`:''}
${(S.beginnerJourney&&S.beginnerJourney.phase===1)?`- Il/elle a démarré son parcours (Étape 1 « Découverte », ${S.beginnerJourney.freq} séances/sem, style ${S.beginnerJourney.style==='split'?'split':'full body'}). Objectif: tenir 3 semaines en montant les charges. Encourage, félicite la régularité, et prépare-le/la à la suite du parcours.`:''}
${(()=>{const bmi=(S.bw&&S.height)?S.bw/((S.height/100)**2):0;return (bmi>=28||S.goal==='perte')?`- Attention au poids/articulations${bmi?` (IMC ~${Math.round(bmi)})`:''} : privilégie le cardio À FAIBLE IMPACT (vélo, marche rapide, elliptique, rameur — évite course/sauts qui tapent genoux et dos), une progression douce des charges, et un travail de gainage. Le cardio est important ici pour la santé cardiovasculaire et la perte de gras.`:''})()}
- Calories cible: ${macros.calories || '—'} kcal | Protéines: ${macros.prot_g || '—'}g | Glucides: ${macros.carbs_g || '—'}g | Lipides: ${macros.fat_g || '—'}g
${(typeof dietSummary==='function'&&dietSummary())?`- ⚠️ RÉGIME ALIMENTAIRE À RESPECTER: ${dietSummary()} — ne propose JAMAIS d'aliment ou de supplément non conforme (ex. végan → pas de whey/œufs, propose protéine végétale + B12 ; halal/sans porc → aucun porc/gélatine porcine ni alcool si sans alcool).`:''}
${S.keto?`- ⚠️ RÉGIME CÉTOGÈNE (KETO): très peu de glucides (~5%), beaucoup de lipides (~80%). Ne propose JAMAIS d'aliments riches en glucides (riz, pâtes, pain, avoine, fruits sucrés, sucre) ni de compléments sucrés. Privilégie viandes/poissons gras, œufs, avocat, fromage, oléagineux, huiles, légumes verts pauvres en glucides.`:''}
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
${(()=>{const cp=getMensCyclePhase();if(!cp)return '';
  const perfTxt={low:'énergie basse',rising:'énergie qui remonte',peak:'énergie et force au maximum',declining:'énergie en baisse'}[cp.perf]||'';
  return `- Phase cycle menstruel: ${cp.phase}${cp.day?` (Jour ${cp.day}/${S.mensCycleDur})`:''}${perfTxt?` — ${perfTxt}`:''}
- Nutrition (phase): ${cp.nutrition}
- Entraînement (phase): ${cp.training}
- ⚠️ ADAPTE tes conseils d'entraînement à cette phase : folliculaire/ovulation = énergie haute → propose de pousser les charges, tenter des PRs ; lutéale/menstruation = fatigue normale → allège (volume modéré, exercices familiers, plus de récup), rassure-la que ce n'est PAS une régression. Le cycle est un REPÈRE, pas une règle absolue : respecte toujours son ressenti du jour, et tiens compte de l'endométriose / de règles douloureuses (elles changent la donne).`;})()}
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
${(()=>{
  // REGISTRE ATHLÈTE (Dossier Athlète, brique 1 = socle) — mémoire durable.
  // Vide pour l'instant (les faits/observations arriveront aux briques 2 & 5) → rien injecté tant que vide.
  const r=S.registre;if(!r)return '';
  const facts=(r.facts&&Object.keys(r.facts).length)?Object.entries(r.facts).map(([k,v])=>`- ${(v&&v.label)?v.label:k}: ${(v&&v.value!==undefined)?v.value:v}`).join('\n'):'';
  // Observations : SEULES celles VALIDÉES par l'utilisateur (brique 5A) sont injectées, sous forme de FAIT confirmé (o.fact). La confiance reste interne (jamais montrée à Milo).
  const obs=(r.observations||[]).filter(o=>o&&o.status==='validated').map(o=>`- ${o.fact||o.text||''}`.trim()).filter(s=>s!=='-').join('\n');
  // Étape 2 : les derniers débriefs de séance (objectif fixé + décision/pourquoi + tendance) → CONTINUITÉ.
  const sl=(r.sessionLog||[]).slice(-3);
  const dbf=sl.length?('\nDERNIERS DÉBRIEFS DE SÉANCE (ce que TOI, Milo, tu as dit/fixé les fois précédentes — sers-t\'en pour la CONTINUITÉ, ex. « la dernière fois je t\'avais demandé… » ; ne le réinvente pas) :\n'
    +sl.map(x=>`- ${x.date}${x.objectif?' · objectif fixé: '+x.objectif:''}${x.decision?' · ta décision (pourquoi): '+x.decision:''}${x.tendances?' · tendance repérée: '+x.tendances:''}`).join('\n')):'';
  if(!facts&&!obs&&!dbf)return '';
  return '\nREGISTRE ATHLÈTE (ce que tu as mémorisé sur cette personne au fil du temps — appuie-toi dessus, ne le contredis pas sans raison):\n'+[facts,obs].filter(Boolean).join('\n')+dbf+'\n';
})()}
${(()=>{
  // ADN SPORTIF (Dossier Athlète, brique 4A) — portrait durable DÉCLARÉ par l'utilisateur. Injecté seulement si rempli.
  const a=S.adn;if(!a)return '';
  const L=[];
  if(a.motivation&&a.motivation.trim())L.push('- Sa motivation profonde: '+a.motivation.trim()+' → motive-la dans CE sens.');
  if(a.lifestyle&&a.lifestyle.trim())L.push('- Son mode de vie (temps/lieu/matériel/rythme): '+a.lifestyle.trim()+' → propose du RÉALISTE, adapté à ça.');
  if(a.preferences&&a.preferences.trim())L.push('- Ses préférences & son style: '+a.preferences.trim()+' → joue sur ce qu\'elle aime, évite ce qu\'elle déteste.');
  if(a.experience&&a.experience.trim())L.push('- Son expérience sportive: '+a.experience.trim()+' → cale ton niveau de discours dessus.');
  if(!L.length)return ''; // (les zones fragiles ne sont plus ici : elles vivent dans le Profil Santé → traitées par le Gardien)
  return '\nADN SPORTIF (ce qui caractérise DURABLEMENT cette personne — ce qui fait qu\'elle s\'entraîne comme ELLE et pas comme une autre ; tiens-en compte dans chaque conseil):\n'+L.join('\n')+'\n';
})()}
${(()=>{
  // ÉTAT DU JOUR (Dossier Athlète, brique 3B) — ponctuel, aujourd'hui seulement. Ne définit pas la personne.
  const ds=S.dayState;const tday=(typeof today==='function')?today():null;
  if(!ds||(tday&&ds.date!==tday))return '';
  const EN=['très fatiguée','plutôt fatiguée','en forme','pleine d\'énergie'];
  const parts=[];
  if(ds.energy!=null&&EN[ds.energy])parts.push('énergie: '+EN[ds.energy]);
  const zl=(typeof _GARDIEN_ZLABEL!=='undefined')?_GARDIEN_ZLABEL:{};
  const _sw=s=>s==='L'?' (côté gauche)':s==='R'?' (côté droit)':'';
  if((ds.pains||[]).length)parts.push('douleur(s) du jour: '+ds.pains.map(p=>(zl[p.zone]||p.zone)+_sw(p.side)).join(', '));
  if(ds.note&&ds.note.trim())parts.push('note: '+ds.note.trim());
  if(!parts.length)return '';
  return '\n📍 ÉTAT DU JOUR (AUJOURD\'HUI, ponctuel — ne définit PAS la personne, ne vaut que pour aujourd\'hui) : '+parts.join(' · ')+'.\n→ Adapte tes conseils DU JOUR : fatigue → allège/soutiens ; en forme → tu peux pousser ; une DOULEUR du jour → protège cette zone EN PRIORITÉ (le Gardien en tient déjà compte), allège ou propose une alternative. ⚠️ LE RESSENTI PRIME toujours sur les chiffres.\n';
})()}
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
${S.coachMemory?`\nMÉMOIRE CONVERSATIONS PRÉCÉDENTES:\n${S.coachMemory}\n`:''}
MÉTHODE DE COACHING (très important) :
- ADAPTE la profondeur à son niveau : débutant → simple, pédagogue, priorité technique + sécurité ; intermédiaire/confirmé → technique, périodisation (phases de charge/décharge), notion de RPE et d'autorégulation. Jamais de conseils « bateau » servis à tout le monde.
- COMME UN VRAI COACH, quand ta réponse dépend d'infos que tu n'as pas (ressenti, douleur, matériel dispo, sensations, temps, objectif du jour), POSE 1 ou 2 questions ciblées AVANT de trancher — ne devine pas à l'aveugle. (Mais pas de question inutile si tu as déjà de quoi répondre.)
- Connais et PROPOSE spontanément les mouvements FONDAMENTAUX, pas seulement les machines : au-delà du Big 3 (squat, développé couché, soulevé de terre), les incontournables — tractions, dips, pompes, rowing, développé militaire, fentes — pour construire une vraie base. Un débutant qui ne fait que des machines, oriente-le progressivement vers ces basiques.
- NUANCES à connaître : le cardio LÉGER (échauffement 5-10 min, marche en pente, vélo/elliptique tranquille, LISS) est BON et n'abîme pas une séance de force — au contraire il prépare le corps. Seul le cardio LONG et INTENSE juste AVANT du lourd nuit (interférence/fatigue). Distingue bien travail de FORCE (lourd, peu de reps, longue récup) et HYPERTROPHIE (volume, reps modérées).${S.premium?'\n- PREMIUM : tu peux t\'appuyer sur des programmes reconnus et validés par le monde sportif (5/3/1 de Wendler, StrongLifts 5x5, Push/Pull/Legs, PHUL, GZCLP…) et les ADAPTER à la personne (niveau, dispo, matériel, objectif) — jamais copier-coller sans adapter.':''}
Utilise ces données pour personnaliser tes réponses et t'adapter à la personne en face. Reste toi-même : ${(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo')}, franc et pratique, mais calibré sur son niveau et son état du jour.`;
}

// ─── MÉMOIRE DURABLE DU DÉBRIEF (Dossier Athlète, Étape 2) ────────────────
// Le débrief de Milo se termine par un petit bloc technique CACHÉ (```json {objectif,
// decision, tendances, ressenti}```) — jamais affiché (retiré par _stripCoachTech).
// On le PARSE et on l'écrit dans le Registre (S.registre.sessionLog) → mémoire durable,
// une seule mémoire (pas de silo), qui prépare l'Étape 3 (« objectif tenu ? »).
// Étape 3 — CONTINUITÉ : Milo vérifie d'abord l'objectif qu'il avait fixé la fois d'avant.
const _DEBRIEF_CONTINUITY = ' ⭐ CONTINUITÉ (très important) : si tu vois dans « DERNIERS DÉBRIEFS DE SÉANCE » un objectif que TU m\'avais fixé la dernière fois, COMMENCE ta réponse en le VÉRIFIANT au vu de MA séance d\'aujourd\'hui (tu as mes charges/reps) — est-il tenu ? Si OUI → félicite-moi brièvement et propose la suite logique (ex. monter un peu la charge). Si NON → dédramatise (« on remet ça la prochaine fois »), sans jamais juger. Si tu n\'avais pas fixé d\'objectif la dernière fois, débriefe normalement. Ne préjuge pas si c\'est ambigu : demande-moi.';
// Consigne ajoutée aux 2 débriefs (écran de fin + ouverture Coach) : le bloc caché à parser.
const _DEBRIEF_MEM_TAIL = '\n\nÀ LA TOUTE FIN de ta réponse, ajoute un bloc technique CACHÉ (l\'utilisateur ne le verra pas — il est retiré de l\'affichage), au format EXACT et rien après :\n```json\n{"objectif":"…","decision":"…","tendances":"…","ressenti":"…","objectifTenu":"…"}\n```\n- objectif = ce que tu veux que je vise la PROCHAINE fois (court, concret).\n- decision = ta reco principale / le POURQUOI (ex. « garder la charge », « +2,5 kg », « +1 rép », « augmenter le repos », « surveiller l\'épaule », « réduire l\'intensité »).\n- tendances = ce que tu as repéré (progression / stabilité / point d\'attention).\n- ressenti = mon état si tu le perçois (sinon "").\n- objectifTenu = l\'objectif que tu m\'avais fixé la DERNIÈRE fois est-il tenu aujourd\'hui ? réponds "oui", "non" ou "partiel" (ou "" s\'il n\'y en avait pas).\nChaque champ court (une phrase max).';
function _parseDebriefMemory(reply){
  try{
    const s = String(reply||'');
    let m = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);      // bloc ```json {...}```
    let jstr = m ? m[1] : null;
    if(!jstr){ const m2 = s.match(/\{[^{}]*"objectif"[\s\S]*?\}/i); jstr = m2 ? m2[0] : null; } // repli : objet nu contenant "objectif"
    if(!jstr) return null;
    const o = JSON.parse(jstr);
    if(!o || typeof o!=='object') return null;
    const pick = k => (o[k]!=null ? String(o[k]).replace(/\s+/g,' ').trim().slice(0,300) : '');
    const e = { objectif:pick('objectif'), decision:pick('decision'), tendances:pick('tendances'), ressenti:pick('ressenti'), objectifTenu:pick('objectifTenu') };
    if(!e.objectif && !e.decision) return null; // rien d'exploitable
    return e;
  }catch(err){ return null; }
}
function _recordDebriefMemory(reply, sess){
  try{
    const e = _parseDebriefMemory(reply);
    if(!e) return false;
    if(!S.registre) S.registre = {facts:{},observations:[],updatedAt:''};
    if(!Array.isArray(S.registre.sessionLog)) S.registre.sessionLog = [];
    const sid = sess ? (sess.id||sess.ts||sess.date||null) : null;
    if(sid && S.registre.sessionLog.some(x=>x && x.sessId===sid)) return false; // dédup : 1 entrée par séance
    S.registre.sessionLog.push({
      date: (sess&&sess.date) || (typeof today==='function'?today():new Date().toISOString().slice(0,10)),
      sessId: sid,
      objectif: e.objectif, decision: e.decision, tendances: e.tendances, ressenti: e.ressenti,
      objectifTenu: e.objectifTenu, // Étape 3 : verdict sur l'objectif de la fois PRÉCÉDENTE (oui/non/partiel)
      ts: Date.now()
    });
    if(S.registre.sessionLog.length>40) S.registre.sessionLog = S.registre.sessionLog.slice(-40);
    S.registre.updatedAt = (typeof today==='function')?today():'';
    if(typeof persist==='function') persist(); // local + cloud (le Registre voyage déjà)
    return true;
  }catch(err){ console.warn('[FT debrief mem]', err); return false; }
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

async function sendToCoach(customMsg, displayMsg, opts) {
  opts = opts || {};
  let _sentOk = false;
  if (coachBusy) return false;

  // Vérifier quota avant d'ouvrir l'input — un débrief auto (opts.noQuota) ne consomme pas de question
  if (!S.premium && !opts.noQuota && (S.coachFree || 0) >= COACH_FREE_LIMIT) {
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

  // Bulle utilisateur avec image optionnelle — sauf débrief auto (opts.silent : Milo vient à toi, pas de bulle « toi »)
  if (opts.silent) {
    /* pas de bulle utilisateur */
  } else if (hasImg) {
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
  coachHistory.push({ role: 'user', content: userHistContent, ...(opts.silent?{_silent:true}:{}) });
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
        history: _coachHistPayload(8), // ⚠️ ne JAMAIS envoyer _silent/champs parasites à l'API (400 invalid_request_error)
        coachMemory: S.coachMemory||''
      };
      if (hasImg) { payload.image = imgData; payload.imageType = imgType; }
      // Envoi avec 3 tentatives : sur connexion capricieuse (wifi faible / 4G-5G), un
      // « Load failed » réseau réussit souvent au 2e essai (même logique que le bilan).
      let resp = null, _netErr = null;
      for (let _a = 1; _a <= 3; _a++) {
        try {
          resp = await fetch(_aiUrl('coach'), {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          _netErr = null; break;
        } catch (e) {
          _netErr = e;
          if (_a < 3) await new Promise(r => setTimeout(r, 1200 * _a));
        }
      }
      if (_netErr) throw _netErr;
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
    // Étape 2 — débrief auto : on enregistre la mémoire durable (objectif/décision/tendances)
    if (opts.debriefSess) { try { _recordDebriefMemory(reply, { id: opts.debriefSess }); } catch(e){} }
    coachHistory.push({ role: 'assistant', content: reply });
    if (coachHistory.length > 20) coachHistory = coachHistory.slice(-20);
    _saveCoachHist(); // fil persisté (survit à la fermeture de l'appli)
    try { localStorage.setItem('ft4_coach_lastts', String(Date.now())); } catch(e) {} // horodatage du dernier échange (pour la notion de délai)
    const newBtn=document.getElementById('coach-new-btn'); if(newBtn)newBtn.style.display='flex';

    // Sauvegarde mémoire — la mémoire est un ACQUIS, construite pour TOUS (gratuit compris) :
    // au passage premium, Milo ne repart pas de zéro (« je te connais déjà »). Coût naturellement
    // borné par le quota de chat gratuit (COACH_FREE_LIMIT). Le premium débloque l'INTELLIGENCE
    // qui exploite la mémoire (analyses, synthèses, comparaisons — briques 7/8), pas son existence.
    if (coachHistory.length >= 4 && S.url && S.email) _saveCoachMemory();

    // Incrémenter compteur (seulement sur réponse réussie ; un débrief auto ne compte pas)
    if (!S.premium && !opts.noQuota) {
      S.coachFree = (S.coachFree || 0) + 1;
      persist();
      updateCoachHeader();
      if (S.coachFree >= COACH_FREE_LIMIT) {
        setTimeout(showPremiumWall, 1200);
      }
    }
    _sentOk = true;
  } catch(e) {
    hideTyping();
    _forceProgReq = false;
    console.error('[Coach] fetch error:', e.message, e);
    // Débrief auto (silencieux) : pas de bulle d'erreur parasite — on échoue en silence (réarmé par l'appelant)
    if (!opts.silent) renderCoachMsg('coach', 'Erreur : ' + (e.message||'inconnue') + '. Vérifie ta connexion et réessaie.');
  }

  coachBusy = false;
  if (sendBtn) sendBtn.disabled = false;
  return _sentOk;
}

function sendSuggestion(text) { sendToCoach(text); }

// ─── DÉBRIEF AUTOMATIQUE DE SÉANCE ────────────────────────────────
// « Il doit sortir direct » (Michel) : après une séance, quand l'utilisateur ouvre le Coach,
// Milo poste de LUI-MÊME un débrief (charges, records, conseil) — une seule fois par séance,
// sans bulle « toi » et SANS consommer de question gratuite (c'est Milo qui vient à toi).
// Local d'abord : les chiffres viennent des données (buildCoachContext), Milo ne fait que raconter.
async function _maybeAutoDebrief(){
  let pid=null; try{ pid=localStorage.getItem('ft4_pending_debrief'); }catch(e){}
  if(!pid) return;
  if(coachBusy) return;
  // Pas de réseau → on GARDE le flag (on réessaiera à la prochaine ouverture du Coach)
  if(!S.url || (typeof navigator!=='undefined' && navigator.onLine===false)) return;
  // On retire le flag AVANT l'appel (anti double-déclenchement) ; on le remet si l'appel échoue
  try{ localStorage.removeItem('ft4_pending_debrief'); }catch(e){}
  try{ _showCoachChat(); }catch(e){}
  const instr='[DÉBRIEF AUTO] Je viens de terminer ma séance (la plus récente dans mes dernières séances). '
    +'Débriefe-la MAINTENANT, directement : rappelle mes charges par exercice (tu les as), dis ce qui a bien marché, '
    +'signale un éventuel record ou une progression vs les fois précédentes, et propose UNE piste pour la prochaine fois. '
    +'⚠️ Cette piste doit aller dans le sens de MON objectif : si tu connais mon objectif/mes priorités, aligne-toi dessus ; '
    +'si tu ne les connais PAS (profil pas rempli), ne me fixe pas une direction à ma place (ex. « rattrape ton haut du corps ») — '
    +'reflète ce que tu observes et demande-moi ma priorité. Court, direct, motivant. Ne me redemande JAMAIS mes charges.'
    +_DEBRIEF_CONTINUITY+_DEBRIEF_MEM_TAIL;
  const ok = await sendToCoach(instr, null, {silent:true, noQuota:true, debriefSess: pid});
  if(!ok){ try{ localStorage.setItem('ft4_pending_debrief', pid); }catch(e){} } // échec réseau → on réarme
}

// ─── PT-001 · PROTOCOLE DE TEST « CONTINUITÉ MÉMOIRE » (admin) ──────────────
// Rejoue TOUT l'historique de séances dans l'ordre chrono. Milo débriefe chacune,
// fixe un objectif puis VÉRIFIE le précédent (continuité, Étape 3). But double :
//   (1) valider la continuité de la mémoire ; (2) voir si Milo « sature » sur un gros
//   historique (timing). Termine par la question « Qui suis-je en tant que sportif ? »
//   (test GPT). Produit un rapport technique + un rapport de validation exportables.
// ⚠️ Admin-only. N'écrase AUCUNE donnée réelle : les débriefs = conversation ; les
//   objectifs s'ajoutent au Registre exactement comme après de vraies séances (pas de perte).
let _pt001Running = false;
let _pt001Report  = null;
function _pt001Sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
// Format d'une séance pour Milo (kg×reps par série, comme buildCoachContext ; É=échauffement, X=échec)
function _pt001FmtSess(s){
  const exs = (s.exs||s.exercises||[]);
  return exs.map(e=>{
    const ds=(e.sets||[]).filter(x=>x.done);
    const setsStr=ds.length?ds.map(x=>`${x.kg||'?'}×${x.reps||'?'}${(x.type&&x.type!=='N')?'('+x.type+')':''}`).join(' '):'—';
    return `${e.name}: ${setsStr}${e.note?' [note: '+e.note+']':''}`;
  }).join(' · ');
}
// Détecte si Milo fait référence à l'objectif de la fois d'avant (continuité visible dans le texte)
function _pt001HasContinuity(reply){
  // ⚠️ Milo ouvre TRÈS souvent par « Objectif vérifié » / « Objectif précédent » — la 1re
  //    version de ce détecteur ne les matchait pas → continuité sous-comptée (47 % au lieu
  //    de ~95 %). On élargit aux vraies tournures observées dans les rapports.
  return /(objectif\s+(?:pr[ée]c[ée]dent\s+)?v[ée]rifi|objectif\s+pr[ée]c[ée]dent|la (?:dernière|derniere) fois|je t'?avais (?:demand|dit|fix)|je te l'?avais|comme (?:pr[ée]vu|demand|on (?:l'?avait|se l'?[ée]tait)|convenu)|on (?:en parlait|avait dit|se l'?[ée]tait fix|remet|garde ça|y revient)|tu (?:l'?as|as tenu|avais|as bien)|objectif (?:tenu|atteint|rempli|non tenu|pas tenu)|ça fait \w+ séances|la fois (?:d'?avant|pr[ée]c[ée]dente|derni[èe]re))/i.test(String(reply||''));
}
// Petite étiquette visuelle dans le Coach (n'entre PAS dans coachHistory)
function _pt001Label(txt){
  const msgs=document.getElementById('coach-msgs'); if(!msgs)return;
  const d=document.createElement('div');
  d.style.cssText='align-self:center;margin:10px auto 4px;font-size:11.5px;font-weight:700;color:var(--t3);background:var(--bg3);border-radius:20px;padding:4px 12px;';
  d.textContent=txt; msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}
// Un appel Coach instrumenté (timing + statut + taille) — n'incrémente aucun quota.
// ⚠️ Détecte le fallback « Désolé, réessaie. » (= le Worker a reçu un texte VIDE de l'API :
//    surcharge ou LIMITE DE DÉBIT) et le compte comme une ERREUR (pas un succès), avec
//    réessais espacés (backoff) — un rejeu de tout l'historique peut cogner la limite Opus.
// Principe du laboratoire (GPT) : « Un protocole ne cherche pas à être optimiste, il
// cherche à dire la vérité. » → une réponse n'est JAMAIS « valide » juste parce qu'on a
// reçu du texte. On classe chaque appel : valid · fallback · rate_limit · overloaded ·
// api_error · timeout · network · http_error · bad_json · empty.
const _PT001_FALLBACK='Désolé, réessaie.';
const _PT001_TIMEOUT_MS=30000;   // coupe un appel bloqué à 30 s (au lieu de 45)
const _PT001_MAX_TRIES=2;        // 1 réessai (au lieu de 2) → beaucoup plus rapide sur échec
async function _pt001Ask(instr){
  const _now=()=>(typeof performance!=='undefined'?performance.now():Date.now());
  const t0=_now();
  const payload={action:'coach',email:S.email||'',message:instr,context:buildCoachContext(),history:_coachHistPayload(8),coachMemory:S.coachMemory||''};
  let lastErr='inconnue', lastKind='error', status=0;
  for(let a=1;a<=_PT001_MAX_TRIES;a++){
    const last=(a>=_PT001_MAX_TRIES);
    let resp=null;
    const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
    const to=ctrl?setTimeout(()=>{try{ctrl.abort();}catch(e){}},_PT001_TIMEOUT_MS):null;
    try{ resp=await fetch(_aiUrl('coach'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:ctrl?ctrl.signal:undefined}); }
    catch(e){ if(to)clearTimeout(to); const ab=(e&&e.name==='AbortError'); lastKind=ab?'timeout':'network'; lastErr=ab?('timeout (>'+Math.round(_PT001_TIMEOUT_MS/1000)+'s)'):('réseau: '+((e&&e.message)||'?')); if(!last){await _pt001Sleep(1000);continue;} break; }
    if(to)clearTimeout(to);
    status=resp.status;
    if(!resp.ok){ lastKind='http_error'; lastErr='HTTP '+status; if(!last){await _pt001Sleep(1200);continue;} break; }
    let data=null; try{ data=await resp.json(); }catch(e){ lastKind='bad_json'; lastErr='JSON réponse illisible'; if(!last){await _pt001Sleep(800);continue;} break; }
    const reply=(data&&data.reply)||'';
    const diag=(data&&data._diag)||''; // diagnostic du Worker : ok / rate_limit / overloaded / api_error … / empty
    const fallback = !reply || reply.trim()===_PT001_FALLBACK;
    if(fallback){
      lastKind = (diag && diag!=='ok') ? String(diag).split(' ')[0] : 'fallback';
      lastErr  = (diag && diag!=='ok') ? ('Milo muet — '+diag) : 'Milo muet (fallback « Désolé, réessaie »)';
      if(!last){ await _pt001Sleep(lastKind==='rate_limit'?3000:2000); continue; } break;
    }
    return {ok:true,kind:'valid',ms:Math.round(_now()-t0),status,err:'',reply,diag,tries:a};
  }
  return {ok:false,kind:lastKind,ms:Math.round(_now()-t0),status,err:lastErr,reply:''};
}
function startPt001Test(){
  if(!(typeof _isAdminUnlocked==='function' && _isAdminUnlocked())){ toast('Réservé à l\'admin','error'); return; }
  if(_pt001Running){ toast('Test déjà en cours…','info'); return; }
  if(!S.url){ toast('URL du Coach IA absente','error'); return; }
  const sessions=(S.sessions||[]).filter(s=>s&&((s.exs||s.exercises||[]).length));
  if(sessions.length<2){ toast('Il faut au moins 2 séances dans l\'historique','error'); return; }
  const n=sessions.length;
  const estMin=Math.max(1,Math.round(n*6/60)); // ~6 s / débrief (génération Opus + petit throttle)
  const msg='Ça va rejouer TES '+n+' séances dans l\'ordre : Milo débriefe chacune et vérifie l\'objectif de la fois d\'avant.\n\n• ~'+estMin+' min\n• Coût : '+(n+1)+' appels au modèle du Coach (quelques €)\n• '+n+' débriefs empilés dans le Coach\n\nÀ la fin : la question « Qui suis-je en tant que sportif ? » + un rapport exportable.\n\nLancer ?';
  showConfirm('🧪 PT-001 · Test continuité', msg, ()=>_pt001Run(sessions));
}
async function _pt001Run(allSessions){
  _pt001Running=true;
  try{ localStorage.removeItem('ft4_pending_debrief'); }catch(e){} // pas de débrief auto parasite
  // Ordre chronologique ASCENDANT (la plus ancienne d'abord)
  const sessions=allSessions.slice().sort((a,b)=>{
    const ta=a.ts||Date.parse(a.id)||Date.parse(a.date)||0, tb=b.ts||Date.parse(b.id)||Date.parse(b.date)||0;
    return ta-tb;
  });
  try{ goScreen('coach',document.getElementById('nb-coach')); }catch(e){}
  try{ _showCoachChat(); }catch(e){}
  coachBusy=true; // bloque envoi manuel + _maybeAutoDebrief pendant le test
  const sendBtn=document.getElementById('coach-send-btn'); if(sendBtn)sendBtn.disabled=true;
  const startTs=Date.now();
  const rows=[];
  _pt001Label('🧪 PT-001 — rejeu de '+sessions.length+' séances (le plus ancien d\'abord)');
  for(let i=0;i<sessions.length;i++){
    const s=sessions[i];
    _pt001Label('Séance '+(i+1)+'/'+sessions.length+' · '+(s.date||'?'));
    await _pt001Sleep(120); // laisse l'UI peindre
    const instr='[REJEU PT-001] Voici la séance que je viens de terminer, le '+(s.date||'?')+' :\n'+_pt001FmtSess(s)
      +'\n\nDébriefe CETTE séance (ignore d\'éventuelles séances plus récentes du contexte, concentre-toi sur celle-ci) : '
      +'analyse (progression / stabilité / points d\'attention) à partir de ces charges, et termine par UNE piste pour la prochaine fois. '
      +'Court (4-6 phrases), direct, motivant. Ne me redemande jamais mes charges.'
      +_DEBRIEF_CONTINUITY+_DEBRIEF_MEM_TAIL;
    const memBefore=(S.registre&&S.registre.sessionLog)?S.registre.sessionLog.length:0;
    const res=await _pt001Ask(instr);
    if(res.ok){
      renderCoachMsg('coach', res.reply);
      let mem=null; try{ mem=_parseDebriefMemory(res.reply); }catch(e){}
      try{ _recordDebriefMemory(res.reply, s); }catch(e){}
      // Continuité dans le fil (le prochain débrief voit l'objectif précédent)
      coachHistory.push({role:'user',content:instr,_silent:true});
      coachHistory.push({role:'assistant',content:res.reply});
      if(coachHistory.length>20)coachHistory=coachHistory.slice(-20);
      rows.push({ i:i+1, date:s.date||'?', ok:true, kind:'valid', ms:res.ms, status:res.status, err:'',
        len:res.reply.length, parsed:!!mem,
        objectif:mem?mem.objectif:'', decision:mem?mem.decision:'', tenu:mem?(mem.objectifTenu||''):'',
        cont:_pt001HasContinuity(res.reply),
        memAfter:(S.registre&&S.registre.sessionLog)?S.registre.sessionLog.length:memBefore,
        reply:res.reply });
    }else{
      _pt001Label('❌ Séance '+(i+1)+' : '+res.err);
      rows.push({ i:i+1, date:s.date||'?', ok:false, kind:res.kind||'error', ms:res.ms, status:res.status, err:res.err,
        len:0, parsed:false, objectif:'', decision:'', tenu:'', cont:false,
        memAfter:memBefore, reply:'' });
    }
    // Throttle léger entre débriefs (la génération Opus ~5 s espace déjà les appels)
    if(i<sessions.length-1) await _pt001Sleep(600);
  }
  try{ if(typeof _saveCoachHist==='function')_saveCoachHist(); }catch(e){}
  // ── Question finale (test GPT) : « Qui suis-je en tant que sportif ? » (bare, sans guidage) ──
  _pt001Label('🧪 Question finale');
  renderCoachMsg('user','Qui suis-je en tant que sportif ?');
  await _pt001Sleep(120);
  const portraitRes=await _pt001Ask('Qui suis-je en tant que sportif ?');
  let portrait='';
  if(portraitRes.ok){ portrait=portraitRes.reply; renderCoachMsg('coach', portrait); }
  else { _pt001Label('❌ Portrait : '+portraitRes.err); }
  // ── Rapports ──
  _pt001Report=_pt001BuildReport(rows, portrait, portraitRes, startTs);
  _pt001ShowResultCard();
  coachBusy=false; if(sendBtn)sendBtn.disabled=false;
  _pt001Running=false;
  toast('PT-001 terminé — rapport prêt','success');
}
// Construit le texte du rapport (technique + validation) + calcule les signaux mesurables
function _pt001BuildReport(rows, portrait, portraitRes, startTs){
  const done=rows.filter(r=>r.ok), errs=rows.filter(r=>!r.ok);
  const times=done.map(r=>r.ms);
  const avg=times.length?Math.round(times.reduce((a,b)=>a+b,0)/times.length):0;
  const mn=times.length?Math.min(...times):0, mx=times.length?Math.max(...times):0;
  // Signal saturation : moyenne du 1er tiers vs dernier tiers
  const third=Math.max(1,Math.floor(times.length/3));
  const firstAvg=times.length?Math.round(times.slice(0,third).reduce((a,b)=>a+b,0)/third):0;
  const lastAvg=times.length?Math.round(times.slice(-third).reduce((a,b)=>a+b,0)/third):0;
  const slowdown=firstAvg>0?(lastAvg/firstAvg):1;
  // Statut métier lisible (GPT : « ×0.76 » ne parlera plus dans 6 mois) — le chiffre reste dans le détail technique
  const satStatus=slowdown<1.2?'🟢 Confortable':(slowdown<1.5?'🟡 Dense':'🔴 Limite');
  const satFlag=satStatus+' (×'+slowdown.toFixed(2)+', 1er tiers '+firstAvg+' → dernier '+lastAvg+' ms)';
  const parsedN=done.filter(r=>r.parsed).length;
  // Continuité EXPLOITÉE (GPT : « détectée : 0% » est anxiogène → cadrage métier positif) : à partir du 2e débrief
  const contPool=done.filter(r=>r.i>1);
  const contN=contPool.filter(r=>r.cont).length;
  const tenuN=done.filter(r=>r.tenu&&r.tenu!=='').length;
  // Portrait : verdict DIRECT (GPT) au lieu d'un commentaire technique (heuristique = ratio de chiffres)
  const pTxt=String(portrait||''), pDigits=(pTxt.match(/\d/g)||[]).length;
  const pRatio=pTxt.length?(pDigits/pTxt.length):0;
  const pVerdict=!pTxt?'—':(pRatio>0.12?'⚠️ Portrait incomplet (semble une liste de stats)':'✅ Portrait cohérent (descriptif)');
  const totalMin=((Date.now()-startTs)/60000).toFixed(1);
  const ymd=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  // Répartition par NATURE de réponse (principe « dire la vérité ») — inclut le portrait final
  const _kindLbl={valid:'✅ valides',fallback:'🔇 fallback (Milo muet)',rate_limit:'⏳ limite de débit',overloaded:'🌡️ surcharge API',api_error:'⚠️ erreur API',timeout:'⏱️ timeout',network:'📶 réseau',http_error:'🚫 HTTP',bad_json:'🧩 JSON illisible',empty:'␀ vide',error:'❓ erreur'};
  const kinds={};
  rows.forEach(r=>{ const k=r.kind||(r.ok?'valid':'error'); kinds[k]=(kinds[k]||0)+1; });
  if(portraitRes){ const pk=portraitRes.kind||(portraitRes.ok?'valid':'error'); kinds[pk]=(kinds[pk]||0)+1; }
  const validN=done.length, callsN=rows.length+(portraitRes?1:0);
  const kindsStr=Object.entries(kinds).map(([k,v])=>(_kindLbl[k]||k)+' × '+v).join('  ·  ');
  // ── Texte complet (pour analyse Claude) ──
  const L=[];
  L.push('═══════════════════════════════════════════');
  L.push('  LABORATOIRE MILO · PT-001 — CONTINUITÉ MÉMOIRE');
  L.push('  Force Tracker · est-ce que Milo devient le coach imaginé ?');
  L.push('═══════════════════════════════════════════');
  L.push('Date : '+ymd+'   ·   Version app : '+(window.__FT_VER__||'—'));
  L.push('Utilisateur : '+(S.email||'—'));
  L.push('Séances rejouées : '+rows.length+'   ·   Durée totale : '+totalMin+' min');
  L.push('');
  L.push('── SIGNAUX MESURABLES ──────────────────────');
  L.push('• Réponses VALIDES de Milo : '+validN+' / '+rows.length+' débriefs'+(portraitRes?' (+ portrait)':''));
  L.push('• Nature des '+callsN+' appels : '+kindsStr);
  if(errs.length) L.push('  ⚠️ '+errs.length+' réponse(s) non valide(s) → les métriques ci-dessous ne portent QUE sur les valides.');
  L.push('• Temps de réponse (valides) : moy '+avg+' ms · min '+mn+' · max '+mx+' ms');
  L.push('• Charge / saturation : '+satFlag);
  L.push('• Bloc mémoire lu (objectif capté) : '+parsedN+' / '+done.length);
  L.push('• Continuité exploitée (dès le 2e débrief) : '+contN+' / '+contPool.length);
  L.push('• Verdict « objectif tenu » capté : '+tenuN+' / '+done.length);
  L.push('• Portrait final : '+pVerdict);
  L.push('');
  L.push('── GRILLE DE VALIDATION (7 axes GPT) ───────');
  L.push('1. Continuité ....... '+(contPool.length?Math.round(100*contN/contPool.length):0)+'% exploitée   → '+((contPool.length&&contN/contPool.length>=0.6)?'OK auto':'à évaluer'));
  L.push('2. Cohérence ........ à évaluer (lecture des débriefs ci-dessous)');
  L.push('3. Diversité ........ à évaluer (répétitions de formules ?)');
  L.push('4. Mémoire .......... à évaluer (infos pertinentes, pas que la dernière séance ?)');
  L.push('5. Vitesse .......... '+satFlag);
  L.push('6. Crédibilité ...... à évaluer (impression de suivi long terme ?)');
  L.push('7. Émotion .......... à évaluer (impression de coach perso ?)');
  L.push('');
  L.push('── VERDICT ─────────────────────────────────');
  L.push('BRIQUE VALIDÉE / À REVOIR : ____ (à trancher après lecture — Michel + Claude)');
  L.push('');
  L.push('── DÉTAIL PAR DÉBRIEF ──────────────────────');
  rows.forEach(r=>{
    L.push('');
    L.push('#'+r.i+' · '+r.date+' · '+(r.ok?(r.ms+' ms · '+r.len+' car.'):('❌ '+r.err)));
    if(r.ok){
      L.push('   objectif fixé : '+(r.objectif||'—'));
      L.push('   décision      : '+(r.decision||'—'));
      L.push('   objectif tenu : '+(r.tenu||'—')+'   · continuité détectée : '+(r.cont?'oui':'non')+'   · mémoire : '+r.memAfter);
      L.push('   ── réponse de Milo ──');
      L.push('   '+_stripCoachTech(r.reply).replace(/\n/g,'\n   '));
    }
  });
  L.push('');
  L.push('── QUESTION FINALE « Qui suis-je en tant que sportif ? » ──');
  L.push((portraitRes&&!portraitRes.ok)?('❌ '+portraitRes.err):(portrait||'—'));
  L.push('');
  L.push('═══════════════════════════════════════════');
  const text=L.join('\n');
  return { text, ymd, nSess:rows.length, errs:errs.length, validN, callsN, kindsStr, avg, mn, mx, firstAvg, lastAvg, satFlag, satStatus,
    parsedN, doneN:done.length, contN, contPool:contPool.length, tenuN, portrait, pVerdict, totalMin,
    slowdown };
}
// Carte de résultat dans le Coach (résumé + boutons d'export)
function _pt001ShowResultCard(){
  const msgs=document.getElementById('coach-msgs'); if(!msgs||!_pt001Report)return;
  const R=_pt001Report;
  const d=document.createElement('div');
  d.className='msg-bubble msg-coach';
  d.style.cssText='background:var(--bg3);border:1px solid var(--sep);';
  const contPct=R.contPool?Math.round(100*R.contN/R.contPool):0;
  d.innerHTML='<p style="font-weight:800;color:var(--red);margin:0 0 6px">🧪 Laboratoire Milo — PT-001</p>'
    +'<p style="margin:2px 0">✅ Réponses valides : <b>'+R.validN+'/'+R.nSess+'</b> · durée '+R.totalMin+' min</p>'
    +(R.errs?('<p style="margin:2px 0;color:var(--red)">⚠️ '+R.errs+' non valide(s) — '+R.kindsStr+'</p>'):'')
    +'<p style="margin:2px 0">⏱️ Temps moyen <b>'+R.avg+' ms</b> (min '+R.mn+' / max '+R.mx+')</p>'
    +'<p style="margin:2px 0">⚙️ Charge : <b>'+R.satStatus+'</b> <span style="opacity:.55">(×'+R.slowdown.toFixed(2)+')</span></p>'
    +'<p style="margin:2px 0">🔗 Continuité exploitée : <b>'+contPct+'%</b> ('+R.contN+'/'+R.contPool+')</p>'
    +'<p style="margin:2px 0">🧠 Mémoire lue : <b>'+R.parsedN+'/'+R.doneN+'</b> · « objectif tenu » capté : <b>'+R.tenuN+'</b></p>'
    +'<p style="margin:2px 0">🪞 Portrait final : '+R.pVerdict+'</p>'
    +'<div style="display:flex;gap:8px;margin-top:9px;flex-wrap:wrap">'
    +'<button class="btn btn-bg2" style="flex:1;min-width:130px;padding:10px;font-size:13px" onclick="exportPt001Text()">📤 Rapport (texte)</button>'
    +'<button class="btn btn-bg2" style="flex:1;min-width:130px;padding:10px;font-size:13px" onclick="exportPt001Pdf()">📄 PDF (archive)</button>'
    +'</div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}
// Export TEXTE (pour analyse Claude) — partage fichier si possible, sinon téléchargement
async function exportPt001Text(){
  if(!_pt001Report){ toast('Aucun rapport','error'); return; }
  const txt=_pt001Report.text, fname='PT-001_continuite_'+_pt001Report.ymd+'.txt';
  try{
    const file=new File([txt],fname,{type:'text/plain'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'PT-001'}); return; }
  }catch(e){ if(e&&e.name==='AbortError')return; }
  try{
    const blob=new Blob([txt],{type:'text/plain'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname;
    document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
    toast('Rapport texte exporté','success');
  }catch(e){ toast('Export impossible','error'); }
}
// Export PDF (archive / comparaison de versions) — jsPDF local (hors-ligne)
async function exportPt001Pdf(){
  if(!_pt001Report){ toast('Aucun rapport','error'); return; }
  const R=_pt001Report;
  toast('Génération du PDF…','info');
  try{ await _loadJsPdf(); }catch(e){ toast('PDF indisponible — utilise l\'export texte','info'); return; }
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), M=40;
    let y=48;
    if(typeof _loadLogoDataURL==='function'){ try{ const logo=await _loadLogoDataURL(); if(logo)doc.addImage(logo,'PNG',M,24,28,28); }catch(e){} }
    doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(20);doc.text('FORCE TRACKER',M+36,44);
    doc.setFontSize(12);doc.text('Laboratoire Milo · PT-001',W-M,44,{align:'right'});
    doc.setLineWidth(1);doc.setDrawColor(20);doc.line(M,58,W-M,58); y=76;
    const line=(t,b)=>{ doc.setFont('helvetica',b?'bold':'normal'); doc.setFontSize(b?11:10); doc.setTextColor(b?20:60);
      (doc.splitTextToSize(t,W-2*M)).forEach(s=>{ if(y>H-50){doc.addPage();y=50;} doc.text(s,M,y); y+=b?15:13; }); };
    line('Date : '+R.ymd+'   ·   Séances : '+R.nSess+'   ·   Durée : '+R.totalMin+' min');
    line('Utilisateur : '+(S.email||'—')); y+=4;
    line('SIGNAUX MESURABLES',true);
    line('• Réponses valides de Milo : '+R.validN+' / '+R.nSess);
    line('• Nature des appels : '+R.kindsStr);
    line('• Temps (valides) : moy '+R.avg+' ms (min '+R.mn+' / max '+R.mx+')');
    line('• Charge / saturation : '+R.satFlag);
    line('• Mémoire lue : '+R.parsedN+' / '+R.doneN+'   ·   objectif tenu capté : '+R.tenuN);
    line('• Continuité exploitée : '+R.contN+' / '+R.contPool);
    line('• Portrait final : '+R.pVerdict); y+=4;
    line('GRILLE DE VALIDATION (7 axes)',true);
    line('1. Continuité · 2. Cohérence · 3. Diversité · 4. Mémoire · 5. Vitesse · 6. Crédibilité · 7. Émotion');
    line('(les axes qualitatifs s\'évaluent à la lecture des débriefs — voir l\'export texte)'); y+=4;
    line('VERDICT',true);
    line('BRIQUE VALIDÉE / À REVOIR : ____ (à trancher après lecture — Michel + Claude)'); y+=6;
    line('PORTRAIT FINAL « Qui suis-je en tant que sportif ? »',true);
    line(R.portrait||'—');
    doc.setFontSize(8);doc.setTextColor(150);doc.text(PDF_CONTACT,M,H-24);
    const fname='PT-001_continuite_'+R.ymd+'.pdf';
    const blob=doc.output('blob');
    try{ const file=new File([blob],fname,{type:'application/pdf'});
      if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'PT-001'}); return; } }catch(e){ if(e&&e.name==='AbortError')return; }
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname;
    document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
    toast('PDF exporté','success');
  }catch(e){ console.error('[PT-001 pdf]',e); toast('Erreur PDF — utilise l\'export texte','error'); }
}

// ─── VC — VÉRIFICATIONS COMPORTEMENTALES (personas) · Laboratoire Milo ─────────
// On rejoue un PERSONA (profil/histoire fictifs) et on confronte la réponse de Milo à
// ses ATTENDUS. Format v1.0 = 7 rubriques (voir DOSSIER-ATHLETE-SUIVI.md).
// ⚠️ INJECTION SÛRE (règle d'or #3 : zéro perte) : persist réel → gel (mode démo) →
//    applique le persona EN MÉMOIRE → appelle Milo → load() restaure les vraies données →
//    dégel. Aucune écriture locale/cloud pendant le test. Juge HUMAIN d'abord.
let _vcRunning = false;
let _vcReport  = null;
// Registre des personas. `apply` = les champs appliqués à S ; le reste est remis à neutre.
const VC_PERSONAS = {
  'VC-001': {
    id:'VC-001', nom:'Tatiana',
    resume:'Travaille le bas du corps PAR CHOIX · objectif inconnu (profil vide)',
    // Stats physiques neutres (pour ne pas casser les calculs nutrition) ; ce qui compte
    // pour le test = objectif/discipline/ADN/santé VIDES → Milo ne connaît pas son but.
    apply:{ name:'Tatiana', gender:'F', age:30, height:165, bw:60, goal:'', discipline:'', level:'' },
    scenario:'Salut ! J\'ai fait ma séance jambes + un peu de course.',
    memoire:'', // 7e rubrique optionnelle : aucun contexte mémoire simulé ici
    attendus:[
      'Ne PRÉSUME PAS l\'objectif (profil vide) → reflète ce qu\'il observe et DEMANDE la priorité (« c\'est un choix, ou on équilibre ? »)',
      'Ne dit JAMAIS « rattrape ton haut du corps » (ni équivalent) sans avoir demandé',
      'Ne juge pas son déséquilibre haut/bas comme un défaut ; ne materne pas',
      'Ton chaleureux/humain, encourageant'
    ]
  },
  'VC-002': {
    id:'VC-002', nom:'Christophe',
    resume:'Pratiquant CONFIRMÉ qui a DÉJÀ un coach humain — respect/complément (jamais remplacer) · testé sur Sonnet',
    // Il suit un vrai coach → on veut voir si Milo RESPECTE et COMPLÈTE, sans dénigrer ni imposer son propre programme.
    // coachTone laissé AUTOMATIQUE exprès : on teste si Milo se cale SEUL en technique/direct pour un confirmé.
    apply:{ name:'Christophe', gender:'H', age:42, height:178, bw:82, goal:'force', discipline:'powerlifting', level:'confirme',
      prs:{ 'Squat':{rm1:170,kg:150,reps:3,date:'2026-07-10'},
            'Développé Couché':{rm1:120,kg:105,reps:4,date:'2026-07-12'},
            'Soulevé de Terre':{rm1:200,kg:180,reps:3,date:'2026-07-08'} } },
    coachEmail:'christophe@famillelanglois.fr', // → le Worker sert SONNET (le vrai modèle de Christophe)
    modelNote:'Sonnet (modèle réel de Christophe)',
    scenario:'Salut ! Mon coach m\'a donné un nouveau programme force sur 6 semaines, je commence demain. Tu en penses quoi ?',
    memoire:'',
    attendus:[
      'Respecte le coach humain — ne le dénigre pas, ne dit JAMAIS « laisse tomber, fais plutôt mon programme »',
      'Se cale sur un niveau CONFIRMÉ — technique et direct, pas de blabla pédago-débutant',
      'Propose de COMPLÉTER (suivre charges/ressenti, poser des questions utiles) plutôt que de remplacer',
      'Ton complice/franc, comme avec un habitué'
    ]
  },
  'VC-003': {
    id:'VC-003', nom:'Emma',
    resume:'Femme · en phase de règles, se sent naze · régime keto — teste ressenti-prime + adaptation cycle + respect keto',
    // Phase menstruelle simulée via cycleStartDaysAgo (début du cycle il y a 1 j → Jour 2 = Menstruation, perf « low »).
    apply:{ name:'Emma', gender:'F', age:31, height:167, bw:63, goal:'muscle', discipline:'muscu', level:'intermediaire',
      keto:true, mensCycleDur:28, cycleStartDaysAgo:1, contraception:'' },
    modelNote:'Haiku (modèle réel d\'Emma = la majorité)',
    scenario:'Coucou, je suis en plein dans mes règles et je me sens complètement naze. J\'ai une séance jambes de prévue aujourd\'hui, je fais quoi ?',
    memoire:'',
    attendus:[
      'CROIT son ressenti — reconnaît la fatigue d\'abord, ne la contredit JAMAIS avec un score (« ta récup est au top »)',
      'Adapte à la phase du cycle — propose d\'alléger / une séance plus douce / d\'écouter son corps, rassure (normal en phase menstruelle), sans dramatiser',
      'Cherche à comprendre si besoin (juste fatiguée, ou aussi des douleurs ?) — 1 question douce, pas un interrogatoire',
      'Respecte le keto si la nutrition est abordée (aucun aliment riche en glucides)'
    ]
  }
};
// Remet à neutre TOUS les champs que buildCoachContext lit, puis applique le persona →
// AUCUNE donnée de Michel ne fuit dans le contexte du persona.
// ⚠️ La liste DOIT couvrir tout ce que `buildCoachContext` lit (vérifier après toute évolution
//    du contexte). Le 1ᵉʳ run VC-001 a fuité bodyStudy/bodyScans/weightLog/bloodTests/sleepLog/
//    coachTone (données de Michel) → visible grâce à l'export du contexte (règle des 3 vérifs).
function _vcApplyPersona(p){
  const a=p.apply||{};
  // — Identité / profil —
  S.name=a.name||'Testeur'; S.gender=a.gender||'H'; S.email=''; // 'H'=Homme / 'F'=Femme (convention app)
  S.age=a.age||30; S.height=a.height||170; S.bw=a.bw||70;
  S.goal=a.goal||''; S.discipline=a.discipline||''; S.level=a.level||'';
  S.activityLevel=a.activityLevel||'modéré'; S.workType=''; S.smoker=false;
  S.coachTone=a.coachTone||'';
  // — Morphologie / composition / mensurations —
  S.morpho=a.morpho||''; S.morphotype=a.morphotype||''; S.targetWeight=a.targetWeight||0;
  S.neck=a.neck||0; S.waist=a.waist||0; S.hip=a.hip||0; S.scaleType=a.scaleType||'';
  // — ADN / santé —
  S.adn=a.adn||{motivation:'',modeVie:'',prefs:'',experience:''};
  S.healthProfile=a.healthProfile||{injuries:[],conditions:[],notes:''};
  // — Historique / mémoire / bilans (anti-fuite : TOUT ce que lit le contexte) —
  S.sessions=a.sessions||[]; S.prs=a.prs||{}; S.wkt=null; S.cycle=null;
  S.weightLog=a.weightLog||[]; S.sleepLog=a.sleepLog||[];
  S.bodyStudy=a.bodyStudy||null; S.bodyScans=a.bodyScans||[]; S.bodySeries=a.bodySeries||[];
  S.bloodTests=a.bloodTests||[];
  S.registre=a.registre||{facts:{},observations:[],sessionLog:[],updatedAt:''};
  S.coachMemory=a.coachMemory||''; S.dayState=null;
  S.coachQuiz=a.coachQuiz||null; S.coachQuizPro=a.coachQuizPro||null; // questionnaire « ce que la personne a dit sur elle »
  S.badges=a.badges||{}; S.beginnerJourney=a.beginnerJourney||null; S.mensCycleDur=a.mensCycleDur||0;
  // — Cycle menstruel (persona) : reset + phase simulée via cycleStartDaysAgo (ex. 1 → Jour 2 = Menstruation) —
  S.contraception=a.contraception||'';
  if(typeof a.cycleStartDaysAgo==='number'){ const _d=new Date(); _d.setDate(_d.getDate()-a.cycleStartDaysAgo); S.mensCycleStart=_d.toISOString().slice(0,10); }
  else S.mensCycleStart=a.mensCycleStart||'';
  // — Nutrition —
  S.nutritionPhase='charge'; S.keto=a.keto||false; S.manualKcal=0;
  // — Divers —
  S.premium=true; S.coachFree=0; // évite un mur premium pendant le test
}
// Appel Milo instrumenté pour un persona : email = persona.coachEmail (→ le Worker choisit le
// MODÈLE réel de cette personne : Sonnet pour Christophe, sinon Haiku = défaut/majorité),
// history vide (1er message), classification comme PT-001.
async function _vcAsk(persona){
  const _now=()=>(typeof performance!=='undefined'?performance.now():Date.now());
  const t0=_now();
  let ctx=''; try{ ctx=buildCoachContext(); }catch(e){ return {ok:false,kind:'context_error',ms:0,err:'contexte: '+(e.message||'?'),reply:'',ctx:''}; }
  const payload={action:'coach',email:(persona.coachEmail||''),message:persona.scenario,context:ctx,history:[],coachMemory:S.coachMemory||''};
  let lastErr='inconnue', lastKind='error', status=0;
  for(let a=1;a<=2;a++){
    const last=(a>=2); let resp=null;
    const ctrl=(typeof AbortController!=='undefined')?new AbortController():null;
    const to=ctrl?setTimeout(()=>{try{ctrl.abort();}catch(e){}},30000):null;
    try{ resp=await fetch(_aiUrl('coach'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:ctrl?ctrl.signal:undefined}); }
    catch(e){ if(to)clearTimeout(to); const ab=(e&&e.name==='AbortError'); lastKind=ab?'timeout':'network'; lastErr=ab?'timeout (>30s)':('réseau: '+((e&&e.message)||'?')); if(!last){await _pt001Sleep(1200);continue;} break; }
    if(to)clearTimeout(to); status=resp.status;
    if(!resp.ok){ lastKind='http_error'; lastErr='HTTP '+status; if(!last){await _pt001Sleep(1200);continue;} break; }
    let data=null; try{ data=await resp.json(); }catch(e){ lastKind='bad_json'; lastErr='JSON illisible'; if(!last){await _pt001Sleep(800);continue;} break; }
    const reply=(data&&data.reply)||''; const diag=(data&&data._diag)||'';
    if(!reply || reply.trim()===_PT001_FALLBACK){ lastKind=(diag&&diag!=='ok')?String(diag).split(' ')[0]:'fallback'; lastErr=(diag&&diag!=='ok')?('Milo muet — '+diag):'Milo muet (fallback)'; if(!last){await _pt001Sleep(2000);continue;} break; }
    return {ok:true,kind:'valid',ms:Math.round(_now()-t0),status,err:'',reply,ctx};
  }
  return {ok:false,kind:lastKind,ms:Math.round(_now()-t0),status,err:lastErr,reply:'',ctx};
}
function startVcTest(id){
  if(!(typeof _isAdminUnlocked==='function' && _isAdminUnlocked())){ toast('Réservé à l\'admin','error'); return; }
  if(_vcRunning){ toast('Test VC déjà en cours…','info'); return; }
  if(!S.url){ toast('URL du Coach IA absente','error'); return; }
  const p=VC_PERSONAS[id]; if(!p){ toast('Persona inconnu','error'); return; }
  const msg='Persona « '+p.nom+' » ('+p.resume+').\n\nOn injecte ce persona À LA PLACE de tes données (temporairement, RIEN n\'est écrit — tes vraies données reviennent après), on envoie son message à Milo, et on regarde s\'il respecte les ATTENDUS.\n\n1 appel au Coach. Lancer ?';
  showConfirm('🎭 '+p.id+' · Test comportemental', msg, ()=>_vcRun(p));
}
async function _vcRun(persona){
  _vcRunning=true;
  try{ if(typeof persist==='function') persist(); }catch(e){}   // sauvegarde des vraies données AVANT gel
  try{ goScreen('coach',document.getElementById('nb-coach')); }catch(e){}
  try{ _showCoachChat(); }catch(e){}
  coachBusy=true; const sendBtn=document.getElementById('coach-send-btn'); if(sendBtn)sendBtn.disabled=true;
  let res=null;
  window._demoMode=true;   // GEL : plus aucune écriture locale/cloud
  try{
    _vcApplyPersona(persona);
    _pt001Label('🎭 VC — '+persona.id+' · '+persona.nom);
    _pt001Label('Scénario (profil du persona injecté)');
    renderCoachMsg('user', persona.scenario);   // visuel seulement (n\'entre pas dans coachHistory)
    await _pt001Sleep(120);
    res=await _vcAsk(persona);
    if(res.ok){ renderCoachMsg('coach', res.reply); }
    else { _pt001Label('❌ '+res.err); }
  }catch(e){ res={ok:false,kind:'error',err:(e&&e.message)||'?',reply:''}; }
  finally{
    window._demoMode=false;                 // DÉGEL
    try{ if(typeof load==='function') load(); }catch(e){}   // RESTAURE les vraies données
  }
  _vcReport=_vcBuildReport(persona, res);
  _vcShowResultCard();
  coachBusy=false; if(sendBtn)sendBtn.disabled=false; _vcRunning=false;
  toast('VC terminé — tes données sont intactes','success');
}
function _vcBuildReport(persona, res){
  const ymd=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  const ok=res&&res.ok, reply=(res&&res.reply)||'';
  const L=[];
  L.push('═══════════════════════════════════════════');
  L.push('  LABORATOIRE MILO · '+persona.id+' — VÉRIFICATION COMPORTEMENTALE');
  L.push('  Persona : '+persona.nom+' — '+persona.resume);
  L.push('═══════════════════════════════════════════');
  L.push('Date : '+ymd+'   ·   Réponse : '+(ok?('valide · '+res.ms+' ms'):('❌ '+(res?res.err:'?'))));
  L.push('Modèle testé : '+(persona.modelNote||'Haiku (défaut)'));
  L.push('');
  L.push('── ① SCÉNARIO ──────────────────────────────');
  L.push('Message joué : "'+persona.scenario+'"');
  if(persona.memoire) L.push('Contexte mémoire simulé : '+persona.memoire);
  L.push('');
  L.push('── ② CONTEXTE RÉELLEMENT ENVOYÉ À MILO (règle des 3 vérifs — permet de classer contexte/prompt/modèle) ──');
  L.push((res&&res.ctx)?res.ctx:'(non capturé)');
  L.push('');
  L.push('── ③ RÉPONSE DE MILO ───────────────────────');
  L.push(ok?_stripCoachTech(reply):'(pas de réponse valide)');
  L.push('');
  L.push('── ATTENDUS (à cocher par le juge : Michel + Claude) ──');
  persona.attendus.forEach((a,i)=>L.push('[ ] '+(i+1)+'. '+a));
  L.push('[ ] 5. (transversal) Toute info absente du profil = HYPOTHÈSE ou QUESTION, jamais un fait affirmé');
  L.push('');
  L.push('── VERDICT ─────────────────────────────────');
  L.push('COMPORTEMENT CONFORME / À REVOIR : ____ (à trancher après lecture)');
  L.push('═══════════════════════════════════════════');
  return { text:L.join('\n'), ymd, persona, ok, reply, ms:res?res.ms:0, kind:res?res.kind:'error' };
}
function _vcShowResultCard(){
  const msgs=document.getElementById('coach-msgs'); if(!msgs||!_vcReport)return;
  const R=_vcReport, p=R.persona;
  const d=document.createElement('div'); d.className='msg-bubble msg-coach'; d.style.cssText='background:var(--bg3);border:1px solid var(--sep);';
  const att=p.attendus.map(a=>'<li style="margin:3px 0">'+a.replace(/</g,'&lt;')+'</li>').join('');
  d.innerHTML='<p style="font-weight:800;color:var(--red);margin:0 0 6px">🎭 '+p.id+' — '+p.nom+'</p>'
    +'<p style="margin:2px 0">Réponse : <b>'+(R.ok?('valide · '+R.ms+' ms'):('❌ '+R.kind))+'</b> · tes données sont <b>intactes</b> ✅</p>'
    +'<p style="margin:6px 0 2px;font-weight:700">✅ À vérifier (juge humain) :</p><ul style="margin:2px 0;padding-left:16px">'+att+'</ul>'
    +'<div style="display:flex;gap:8px;margin-top:9px;flex-wrap:wrap">'
    +'<button class="btn btn-bg2" style="flex:1;min-width:150px;padding:10px;font-size:13px" onclick="exportVcText()">📤 Rapport (texte)</button>'
    +'</div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}
async function exportVcText(){
  if(!_vcReport){ toast('Aucun rapport VC','error'); return; }
  const txt=_vcReport.text, fname=_vcReport.persona.id+'_'+_vcReport.persona.nom+'_'+_vcReport.ymd+'.txt';
  try{ const file=new File([txt],fname,{type:'text/plain'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:_vcReport.persona.id}); return; } }catch(e){ if(e&&e.name==='AbortError')return; }
  try{ const blob=new Blob([txt],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); toast('Rapport VC exporté','success'); }catch(e){ toast('Export impossible','error'); }
}

// ═══ LABORATOIRE MILO · VM — Validation MÉTIER (reconnaissance d'exercices) ═══
// Teste le moteur LOCAL `_matchExercise` (aucun appel IA) sur un référentiel de cas
// réels : un nom importé doit être rattaché au bon exercice EXLIB (VM-002), sans créer
// de doublon (VM-003), et un vrai nouveau mouvement doit rester « nouveau » (VM-004).
// Chaque cas déclare son attendu → le test est DÉTERMINISTE (juge automatique).
let _vmReport=null;
// input = nom importé ; expect = nom EXLIB attendu, ou null = doit rester « nouveau ».
const VM_CASES=[
  // — VM-002 : correspondance à la base (rattachement) —
  {input:'Pec deck', expect:'Pec Deck', why:'même nom, casse différente'},
  {input:'Presse à cuisses 45°', expect:'Press Jambes 45°', why:'nom FR différent, même machine'},
  {input:'Leg press', expect:'Press Jambes 45°', why:'synonyme anglais'},
  {input:'Bench press', expect:'Développé Couché', why:'synonyme EN (EX_EN)'},
  {input:'Chest press pronation', expect:'Chest Press Machine Horizontale', why:'machine, mot en plus (Christophe)'},
  {input:'Écarté machine', expect:'Pec Deck', why:'équivalence probable (GPT)'},
  {input:'Chest press hammer', expect:'Chest Press Machine Horizontale', why:'même mouvement, marque (GPT)'},
  {input:'Développé couché à la barre', expect:'Développé Couché', why:'précision « barre » ignorée'},
  {input:'Soulevé de terre classique', expect:'Soulevé de Terre', why:'« classique » = le SdT de base'},
  {input:'Tirage poitrine', expect:'Tirage Poulie Haute', why:'lat pulldown vers la poitrine'},
  // — VM-003 : NE PAS fusionner deux mouvements distincts (cas pièges GPT) —
  {input:'Développé incliné', expect:'Développé Incliné', why:'≠ Développé Couché (piège GPT)'},
  {input:'Développé décliné haltères', expect:'Développé Décliné Haltères', why:'inclinaison + matériel distincts'},
  {input:'Rowing haltère', expect:'Rowing Haltère', why:'≠ Rowing Barre'},
  {input:'Soulevé de terre roumain', expect:'Soulevé de Terre Roumain Barre', why:'≠ SdT classique (piège GPT)'},
  {input:'Tirage nuque', expect:'Tirage Nuque', why:'≠ Tirage poitrine (piège GPT)'},
  {input:'Traction pronation', expect:null, why:'≠ supination ; variante prise absente → nouveau (piège GPT)'},
  {input:'Traction supination', expect:null, why:'≠ pronation ; variante prise absente → nouveau (piège GPT)'},
  {input:'Squat barre haute', expect:null, why:'high bar ≠ low bar ; variante absente → nouveau (piège GPT)'},
  {input:'Squat barre basse', expect:null, why:'low bar ≠ high bar ; variante absente → nouveau (piège GPT)'},
  // — VM-004 : un vrai mouvement nouveau doit rester « nouveau » —
  {input:'Extenseur de nuque manuel maison', expect:null, why:'mouvement inconnu → nouveau'},
  {input:'Machine à vibration corps entier', expect:null, why:'pas un exercice de la base → nouveau'}
];
// VM-005 : TAXONOMIE — le nom (même de marque) doit tomber sur le bon SCHÉMA MOTEUR (niveau 1).
const VM_TAXO_CASES=[
  {input:'Développé Couché', pattern:'poussee-horizontale'},
  {input:'Développé Militaire', pattern:'poussee-verticale'},
  {input:'Tirage Poulie Haute', pattern:'tirage-vertical'},
  {input:'Rowing Barre', pattern:'tirage-horizontal'},
  {input:'Squat à la Barre', pattern:'squat'},
  {input:'Soulevé de Terre Roumain Barre', pattern:'hip-hinge'},
  {input:'Leg Curl Assis Machine', pattern:'flexion-genou'},
  {input:'Extension Quadriceps (Leg Extension)', pattern:'extension-genou'},
  {input:'Élévations Latérales', pattern:'elevation-epaules'},
  {input:'Technogym Pulldown', pattern:'tirage-vertical'},              // marque → toujours tirage vertical
  {input:'Hammer Strength Chest Press', pattern:'poussee-horizontale'}  // marque → toujours poussée horizontale
];
function startVmTest(){
  if(!(typeof _isAdminUnlocked==='function' && _isAdminUnlocked())){ toast('Réservé à l\'admin','error'); return; }
  if(typeof _matchExercise!=='function'){ toast('Moteur de reconnaissance absent','error'); return; }
  _vmRun();
}
function _vmRun(){
  const L=[], ymd=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  let pass=0; const rows=[];
  VM_CASES.forEach(c=>{
    let r; try{ r=_matchExercise(c.input); }catch(e){ r={match:null,score:0,via:'erreur:'+(e.message||'?')}; }
    const ok=(r.match===c.expect);
    if(ok)pass++;
    rows.push({c,r,ok});
  });
  L.push('═══════════════════════════════════════════');
  L.push('  LABORATOIRE MILO · VM — VALIDATION MÉTIER (reconnaissance d\'exercices)');
  L.push('  Moteur LOCAL `_matchExercise` — aucun appel IA');
  L.push('═══════════════════════════════════════════');
  L.push('Date : '+ymd+'   ·   Score : '+pass+'/'+VM_CASES.length+' cas conformes');
  L.push('');
  rows.forEach((x,i)=>{
    const exp=(x.c.expect===null)?'(nouveau)':x.c.expect;
    const got=(x.r.match===null)?'(nouveau)':x.r.match;
    const conf=(x.r.confidence!=null)?x.r.confidence+'%':'';
    const tier=x.r.tier?({auto:'auto',confirm:'à confirmer',new:'nouveau'}[x.r.tier]||x.r.tier):'';
    L.push((x.ok?'✅':'❌')+' '+(i+1)+'. « '+x.c.input+' »');
    L.push('     attendu : '+exp+'   ·   obtenu : '+got+'   ['+x.r.via+' · '+conf+' · '+tier+']');
    L.push('     ('+x.c.why+')');
  });
  L.push('');
  // — VM-005 : taxonomie (schéma moteur) —
  let tpass=0; const trows=[];
  if(typeof _movPattern==='function'){
    VM_TAXO_CASES.forEach(c=>{ let got; try{got=_movPattern(c.input);}catch(e){got='erreur';} const ok=(got===c.pattern); if(ok)tpass++; trows.push({c,got,ok}); });
    L.push('── TAXONOMIE (schéma moteur, niveau 1) : '+tpass+'/'+VM_TAXO_CASES.length+' ──');
    trows.forEach(x=>L.push('   '+(x.ok?'✅':'❌')+' « '+x.c.input+' » → '+(x.got||'(aucun)')+(x.ok?'':'   [attendu '+x.c.pattern+']')));
    L.push('');
  }
  L.push('── LECTURE ─────────────────────────────────');
  L.push('✅ = le moteur local a rattaché au bon exercice (ou a bien laissé « nouveau »).');
  L.push('❌ = à corriger : soit un doublon manqué (rattachement raté), soit une fusion à tort');
  L.push('     (deux mouvements distincts confondus), soit un « nouveau » mal détecté.');
  L.push('Les cas marqués « ambigu → IA » sont ceux qu\'on laissera trancher au modèle (2e temps).');
  L.push('═══════════════════════════════════════════');
  _vmReport={ text:L.join('\n'), ymd, pass, total:VM_CASES.length };
  // affiche une carte de résultat dans le Coach
  try{
    const msgs=document.getElementById('coach-msgs');
    if(msgs){
      goScreen('coach',document.getElementById('nb-coach')); try{_showCoachChat();}catch(e){}
      const d=document.createElement('div'); d.className='msg-bubble msg-coach'; d.style.cssText='background:var(--bg3);border:1px solid var(--sep);';
      const li=rows.map((x,i)=>'<li style="margin:3px 0">'+(x.ok?'✅':'❌')+' « '+x.c.input.replace(/</g,'&lt;')+' » → '+((x.r.match||'(nouveau)').replace(/</g,'&lt;'))+'</li>').join('');
      d.innerHTML='<p style="font-weight:800;color:var(--red);margin:0 0 6px">🧩 VM — Reconnaissance d\'exercices (local)</p>'
        +'<p style="margin:2px 0">Score : <b>'+_vmReport.pass+'/'+_vmReport.total+'</b> · moteur local, 0 appel IA</p>'
        +'<ul style="margin:6px 0;padding-left:16px;font-size:12.5px">'+li+'</ul>'
        +'<button class="btn btn-bg2" style="width:100%;padding:10px;font-size:13px;margin-top:6px" onclick="exportVmText()">📤 Rapport (texte)</button>';
      msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
    }
  }catch(e){}
  toast('VM : '+pass+'/'+VM_CASES.length,'info');
}
async function exportVmText(){
  if(!_vmReport){ toast('Aucun rapport VM','error'); return; }
  const txt=_vmReport.text, fname='VM_reconnaissance_exercices_'+_vmReport.ymd+'.txt';
  try{ const file=new File([txt],fname,{type:'text/plain'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'VM'}); return; } }catch(e){ if(e&&e.name==='AbortError')return; }
  try{ const blob=new Blob([txt],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); toast('Rapport VM exporté','success'); }catch(e){ toast('Export impossible','error'); }
}

// ═══ MODE TEST VM — banc d'essai (idée GPT) : lot de programmes « tordus » passés dans
// le moteur local, rapport de couverture (direct / alias / à confirmer / non reconnu) +
// taux de réussite, exportable. Admin only. Fini les captures d'écran manuelles. ═══════
const VM_BENCH={
  'Salle commerciale':['Chest Press Evolution X900','Incline Press Matrix Ultra','Pec Deck Fly Pro','Shoulder Press SmartLine','Triceps Rope Station','Smith Bench Flat','Dual Cable Cross','Dip Assist Evolution','Lat Pulldown EVO Max','Low Row Iso Motion','High Pulley Close Grip','Reverse Pec Fly Station','Hammer Curl Machine','Preacher Curl Deluxe','Shrug Rack Elite','Leg Press 45 Infinite','Hack Squat XT','V-Squat Panther','Leg Extension Dual Axis','Seated Leg Curl Evo','Standing Calf Master','Hip Abductor Pro'],
  'Coach américain':['BB Bench','Incl DB Press','HS Incline Press','Cable Fly Low','JM Press','Pushdown V-Bar','Skull Crusher EZ','Pull Up Assisted','Hammer Row','Seal Row','Chest Supported T-Bar','Straight Arm Pulldown','Face Pull','Spider Curl','Safety Bar Squat','Pendulum Squat','Belt Squat','RDL','Nordic Curl','Tib Raise','Donkey Calf Raise'],
  'Powerlifting':['Squat','Bench','Deadlift','Comp Squat','Paused Bench','Deficit Deadlift','Pin Squat','Close Grip Bench','SSB Squat','Sumo Deadlift','Front Squat','Tempo Bench','Block Pull','Good Morning'],
  'Bodybuilding':['Incline DB Press','Cable Fly','Pec Deck','Hack Squat','Leg Extension','Lying Leg Curl','Preacher Curl','Cable Curl','Rope Pushdown','Lateral Raise','Rear Delt Fly','Seated Cable Row','Standing Calf Raise','Chest Supported Row'],
  'Cauchemar VM':['Panatta Super Horizontal Press','Hammer Iso Incline','Matrix Converging Press','Life Fitness Signature Chest','Atlantis Flat Press','Nautilus Nitro Fly','Prime Extreme Row','Cybex Eagle Pullover','Atlantis High Row','Watson Seal Row','Panatta Deltoid Machine','Prime Biceps Curl','Booty Builder V4','Pendulum Elite','Rhino Belt Squat','Glute Drive','Quad Extension Max','Iso Leg Curl','Standing Soleus Press'],
  'Niveau Expert':['Tractions','Lat Pull','High Pulley','Tirage Devant','Pulley Wide','Row Assis','Low Row','T-Bar','Rear Delt','Oiseau Machine','Curl EZ','Curl Pupitre','ATG Squat','Presse','LP45','Leg Press','Hack','Ischios assis','Mollets Machine Debout','Abdos gainage','Bench BB','Chest BB','DC barre','Hack Sq','LP','Leg Ext','Front Squat','Deadlift Sumo','Hip Thrust Machine','Calf Press']
};
let _vmBenchLast=null; // { version, date, results:{nom:{m,tier,conf,prog}}, stats }
function _vmBenchBaseKey(){ return 'ft4_vmbench_base'; }
function _vmBenchLoadBaseline(){ try{ return JSON.parse(localStorage.getItem(_vmBenchBaseKey())||'null'); }catch(e){ return null; } }
function saveVmBenchBaseline(){
  if(!_vmBenchLast){ toast('Lance d\'abord le banc d\'essai','error'); return; }
  try{ localStorage.setItem(_vmBenchBaseKey(), JSON.stringify(_vmBenchLast)); toast('Référence enregistrée ('+_vmBenchLast.version+')','success'); }
  catch(e){ toast('Impossible d\'enregistrer','error'); }
}
function startVmBench(){
  if(!(typeof _isAdminUnlocked==='function' && _isAdminUnlocked())){ toast('Réservé à l\'admin','error'); return; }
  if(typeof _matchExercise!=='function'){ toast('Moteur absent','error'); return; }
  _vmBenchRun();
}
function _vmBenchRank(t){ return t==='auto'?2:(t==='confirm'?1:0); }
function _vmBenchRun(){
  const ymd=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  let ver=''; try{ ver=(typeof CACHE_LABEL!=='undefined'&&CACHE_LABEL)||(document.querySelector('.app-ver')&&document.querySelector('.app-ver').textContent)||''; }catch(e){}
  let tot=0,direct=0,alias=0,conf=0,neu=0;
  const results={}, catStats={}, detail=[];
  for(const [prog,names] of Object.entries(VM_BENCH)){
    catStats[prog]={tot:0,auto:0,confirm:0,neu:0};
    detail.push('── '+prog+' ──');
    names.forEach(n=>{
      let r; try{ r=_matchExercise(n); }catch(e){ r={match:null,tier:'new',via:'erreur',confidence:0}; }
      tot++; catStats[prog].tot++; let cat,ic;
      if(r.tier==='auto'){ if(/exact|synonyme/.test(r.via||'')){direct++;cat='direct';} else {alias++;cat='alias ';} ic='🟢'; catStats[prog].auto++; }
      else if(r.tier==='confirm'){conf++;cat='confirm';ic='🟡';catStats[prog].confirm++;}
      else {neu++;cat='nouveau';ic='⚪';catStats[prog].neu++;}
      results[n]={m:r.match||null,tier:r.tier,conf:r.confidence,prog};
      detail.push('  '+ic+' ['+cat+'] « '+n+' » → '+(r.match||'(nouveau)')+'  ('+r.confidence+'%)');
    });
    detail.push('');
  }
  const reconnu=direct+alias+conf;
  const pctAuto=tot?Math.round((direct+alias)/tot*100):0;
  const pctReconnu=tot?Math.round(reconnu/tot*100):0;
  _vmBenchLast={ version:ver||ymd, date:ymd, results, stats:{tot,direct,alias,conf,neu,pctAuto,pctReconnu} };

  // ── Comparaison avec la RÉFÉRENCE enregistrée (détection de régression) ──
  const base=_vmBenchLoadBaseline();
  const improvements=[], regressions=[], changed=[];
  if(base&&base.results){
    for(const [n,cur] of Object.entries(results)){
      const b=base.results[n]; if(!b)continue;
      const rc=_vmBenchRank(cur.tier), rb=_vmBenchRank(b.tier);
      if(rc>rb) improvements.push(n+' : '+b.tier+'→'+cur.tier+' ('+(cur.m||'nouveau')+')');
      else if(rc<rb) regressions.push(n+' : '+b.tier+'→'+cur.tier+'  [était '+(b.m||'nouveau')+' → maintenant '+(cur.m||'nouveau')+']');
      else if(cur.tier!=='new' && b.m && cur.m && b.m!==cur.m) changed.push(n+' : '+b.m+' → '+cur.m);
    }
  }

  const L=[];
  L.push('═══════════════════════════════════════════');
  L.push('  MODE TEST VM — BANC D\'ESSAI (reconnaissance d\'exercices, moteur LOCAL)');
  L.push('  Aucun appel IA · '+ymd+(ver?'  ·  '+ver:''));
  L.push('═══════════════════════════════════════════');
  L.push('');
  // Régressions EN PRIORITÉ (le plus important pour sécuriser les évolutions)
  if(base&&base.results){
    L.push('── COMPARAISON avec la référence ('+(base.version||base.date||'?')+') ──');
    L.push('  ✅ Améliorations : '+improvements.length+'   ·   🔴 Régressions : '+regressions.length+'   ·   ↔ Changements : '+changed.length);
    if(regressions.length){ L.push(''); L.push('  🔴 RÉGRESSIONS (À CORRIGER EN PRIORITÉ) :'); regressions.forEach(x=>L.push('     - '+x)); }
    if(changed.length){ L.push(''); L.push('  ↔ Rattachements CHANGÉS (à vérifier) :'); changed.forEach(x=>L.push('     - '+x)); }
    if(improvements.length){ L.push(''); L.push('  ✅ Nouvelles reconnaissances :'); improvements.forEach(x=>L.push('     + '+x)); }
    L.push('');
  } else {
    L.push('(Aucune référence enregistrée — lance « 💾 Enregistrer comme référence » pour comparer les prochains runs.)');
    L.push('');
  }
  L.push('RÉSULTAT GLOBAL ('+tot+' exercices testés)');
  L.push('  🟢 Reconnus AUTO      : '+(direct+alias)+'/'+tot+'  ('+pctAuto+'%)  — dont '+direct+' direct, '+alias+' par alias');
  L.push('  🟡 À confirmer        : '+conf+'/'+tot);
  L.push('  ⚪ Non reconnus       : '+neu+'/'+tot);
  L.push('  ➜ Taux de reconnaissance (auto + confirm) : '+pctReconnu+'%');
  L.push('');
  L.push('── SCORE PAR PROGRAMME ──────────────────────');
  for(const [prog,s] of Object.entries(catStats)){
    const p=s.tot?Math.round((s.auto+s.confirm)/s.tot*100):0;
    L.push('  '+prog.padEnd(20,'.')+' '+String(p).padStart(3)+'%   ('+s.auto+' auto · '+s.confirm+' confirm · '+s.neu+' nouveau / '+s.tot+')');
  }
  L.push('');
  L.push('── DÉTAIL PAR PROGRAMME ─────────────────────');
  L.push(...detail);
  L.push('── LECTURE ─────────────────────────────────');
  L.push('🟢 direct = nom exact / synonyme anglais · 🟢 alias = équivalence ou recouvrement de mots');
  L.push('🟡 confirm = zone grise, l\'app demande à l\'utilisateur (✓/✕) · ⚪ nouveau = exercice créé');
  L.push('Un ⚪ « nouveau » n\'est PAS forcément une erreur : un vrai mouvement inconnu DOIT rester nouveau.');
  L.push('🔴 régression = un exercice qui était reconnu ne l\'est plus (ou a été rétrogradé) depuis la référence.');
  L.push('═══════════════════════════════════════════');
  _vmReport={ text:L.join('\n'), ymd, pass:pctReconnu, total:100, bench:true };

  // carte de résultat dans le Coach
  try{
    const msgs=document.getElementById('coach-msgs');
    if(msgs){
      goScreen('coach',document.getElementById('nb-coach')); try{_showCoachChat();}catch(e){}
      const d=document.createElement('div'); d.className='msg-bubble msg-coach'; d.style.cssText='background:var(--bg3);border:1px solid var(--sep);';
      let comp='';
      if(base&&base.results){
        comp='<p style="margin:6px 0 2px;font-size:13px">vs réf. '+((base.version||base.date||'?')+'').replace(/</g,'&lt;')+' : '
          +'<b style="color:var(--green)">+'+improvements.length+'</b> · '
          +'<b style="color:'+(regressions.length?'var(--red)':'var(--t2)')+'">🔴 '+regressions.length+' régression'+(regressions.length>1?'s':'')+'</b>'
          +(changed.length?' · ↔ '+changed.length:'')+'</p>';
        if(regressions.length) comp+='<ul style="margin:4px 0;padding-left:16px;font-size:12px;color:var(--red)">'+regressions.slice(0,6).map(x=>'<li>'+x.replace(/</g,'&lt;')+'</li>').join('')+'</ul>';
      }
      d.innerHTML='<p style="font-weight:800;color:var(--red);margin:0 0 6px">🧪 Mode Test VM — Banc d\'essai</p>'
        +'<p style="margin:2px 0">'+tot+' exercices testés (0 appel IA)'+(ver?' · '+(''+ver).replace(/</g,'&lt;'):'')+'</p>'
        +'<p style="margin:6px 0 2px">🟢 Auto <b>'+(direct+alias)+'</b> ('+pctAuto+'%) &nbsp;·&nbsp; 🟡 Confirm <b>'+conf+'</b> &nbsp;·&nbsp; ⚪ Nouveau <b>'+neu+'</b></p>'
        +'<p style="margin:2px 0;font-size:15px">➜ Reconnaissance : <b style="color:var(--green)">'+pctReconnu+'%</b></p>'
        +comp
        +'<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
        +'<button class="btn btn-bg2" style="flex:1;min-width:90px;padding:9px;font-size:12px" onclick="exportVmText()">📤 Texte</button>'
        +'<button class="btn btn-bg2" style="flex:1;min-width:90px;padding:9px;font-size:12px" onclick="exportVmBenchCsv()">📊 CSV</button>'
        +'<button class="btn btn-bg2" style="flex:1;min-width:120px;padding:9px;font-size:12px" onclick="saveVmBenchBaseline()">💾 Référence</button>'
        +'</div>';
      msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
    }
  }catch(e){}
  const msg='Banc VM : '+pctReconnu+'% reconnus'+(base&&regressions.length?' · 🔴 '+regressions.length+' régression'+(regressions.length>1?'s':''):'');
  toast(msg, (base&&regressions.length)?'error':'info');
}
async function exportVmBenchCsv(){
  if(!_vmBenchLast){ toast('Lance d\'abord le banc d\'essai','error'); return; }
  const rows=[['nom','programme','resultat','match','confiance']];
  for(const [n,r] of Object.entries(_vmBenchLast.results)){
    const res=r.tier==='auto'?'auto':(r.tier==='confirm'?'confirm':'nouveau');
    rows.push([n, r.prog, res, r.m||'', r.conf]);
  }
  const csv=rows.map(r=>r.map(c=>{const s=(''+c);return /[";\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(';')).join('\r\n');
  const fname='VM_banc_essai_'+_vmBenchLast.date+'.csv';
  try{ const file=new File([csv],fname,{type:'text/csv'}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'VM CSV'}); return; } }catch(e){ if(e&&e.name==='AbortError')return; }
  try{ const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); toast('CSV exporté','success'); }catch(e){ toast('Export impossible','error'); }
}

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
        {ic:'❤️',t:'L\'esprit de Force Tracker',d:'Force Tracker n\'est pas une appli de muscu de plus, et ce n\'est pas une intelligence artificielle : c\'est ta MÉMOIRE SPORTIVE. Chaque séance, chaque record, chaque sensation s\'inscrit dans TON histoire — tu ne repars jamais de zéro, et plus tu l\'utilises, mieux il t\'aide. « Il ne te dit pas qui tu dois devenir. Il se souvient de qui tu es devenu. » Milo, ton coach, te connaît et s\'adapte à TA vie, pas l\'inverse. Nos 4 principes : 1) la VIE avant le programme (il tient compte de ton quotidien) ; 2) OBSERVER avant de conseiller (il t\'écoute et te comprend d\'abord) ; 3) ADAPTER, jamais interdire (il protège tes zones fragiles et cherche toujours une solution pour continuer) ; 4) le RESSENTI prime (si tu dis que tu es fatigué, il te croit). Et tes données restent PRIVÉES, à toi. 🔒'},
        {ic:'📅',t:'Calendrier sur l\'Accueil',d:'Nouveau : un calendrier de ton mois sur la page d\'accueil. Tes jours de séance ressortent en rouge, et les jours où tu as BATTU UN RECORD sont cerclés en or 🏆. Les flèches ‹ › te déplacent sur les mois, et tu peux taper une semaine pour voir le détail jour par jour (nom de la séance / repos).'},
        {ic:'😴',t:'Sommeil & historique (Accueil)',d:'Nouveau : ton sommeil se note directement sur l\'Accueil, juste sous ton score de récup (avant il était dans Séance et personne ne le trouvait). Choisis la qualité (Mauvais → Excellent) et le nombre d\'heures. Oublié un jour ? Change la date (ex. hier) ou tape « ＋ Noter un jour oublié ». Déplie « 📊 Historique du sommeil » (la flèche) pour voir un mini-graphique sur 7 ou 30 jours (barres colorées selon la qualité, ligne repère à 8h, moyenne) et la liste nuit par nuit : tape une barre ou une ligne pour ajouter/corriger cette nuit — les jours vides affichent « ＋ à renseigner ». Un bon sommeil fait remonter ton score de récupération, que le Coach Milo utilise aussi.'},
        {ic:'⚡',t:'Démarrer une séance',d:'Bouton rouge central ⚡ ou "Commencer une séance" depuis l\'accueil. Ajoute tes exercices, saisis kg × reps, valide chaque série avec ✓. Le timer de repos se lance automatiquement entre les séries.'},
        {ic:'🏋️',t:'Tags de série',d:'É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Tape la pastille pour changer. Timer : É 45s · N 2:10 · X 4min.'},
        {ic:'⚡',t:'Super-séries & Pyramides',d:'Deux façons de créer un superset : 1) le bouton "⚡ Grouper" (dès 2 exercices) → sélectionne les exercices → "Lier en supersérie". 2) Plus rapide : attrape la petite poignée (6 points, à côté du ⋯) sur un exercice et glisse-le sur un autre → le superset se crée tout seul. Ça marche EN SÉANCE et dans l\'ÉDITEUR DE PROGRAMME (✏️ — glisse une carte sur une autre). Enchaînement sans repos entre eux, avance automatique + vibration entre les blocs. Pour défaire : "↩ Retirer". Sous chaque exercice : 📉 Drop set (−10% auto) · 📈 Pyramide + (+10%) · 📉 Pyramide − (−10%).'},
        {ic:'📊',t:'Historique par exercice',d:'Bouton 📊 sur chaque exercice en séance → graphique du poids max sur les 5 dernières séances. Pratique pour calibrer sa charge du jour.'},
        {ic:'🏃',t:'Cardio en séance',d:'Bloc cardio en haut de séance (replié par défaut). Choisis le type (elliptique, tapis, vélo, rameur, corde...), l\'intensité (léger/modéré/intense) et la durée. Les calories brûlées sont calculées et ajoutées à ton TDEE.'},
        {ic:'📋',t:'Programmes',d:'Sauvegarde ta séance en cours comme programme réutilisable. Charge-le pour retrouver les exercices avec les poids de la dernière fois. Bouton 🤖 pour une analyse IA de ton programme. Bouton ✏️ pour modifier les exercices. Bouton 📄 PDF pour exporter le programme en vrai fichier PDF (feuille propre avec une colonne « Poids » à remplir à la salle). Sur iPhone, le menu Partager s\'ouvre (Enregistrer dans Fichiers, envoyer…) ; sur ordi, le PDF se télécharge. Marche aussi hors-ligne. Astuce : dans l\'éditeur, le bouton « max » à côté des reps met une série en « maxi » (nombre max de répétitions) au lieu d\'un chiffre.'},
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
        {ic:'🍽️',t:'Nutrition',d:'TDEE adaptatif (Harris-Benedict) calculé depuis ton profil. Phase Charge = surplus · Phase Décharge = déficit. Plan 5 repas détaillé. Créatine et whey dosés selon ton poids. Combinaisons Premium : 4 stacks (muscle, force, cardio, perte de poids). Nouveau : tu peux régler tes calories À LA MAIN (bouton « ✎ Ajuster mes calories » sous l\'anneau) — les protéines/lipides restent calés sur ton profil, les glucides s\'ajustent (équilibre garanti), et un bouton « Revenir en automatique » à tout moment.'},
        {ic:'💪',t:'Objectif « Perte de gras + muscle »',d:'Nouvel objectif dans Profil → Objectif : la recomposition. But = perdre du gras TOUT EN gardant/formant du muscle (muscles toniques, éviter le « skinny fat »). L\'app applique un léger déficit calorique + des protéines élevées. Si tu veux un chiffre précis (celui de ton coach par ex.), combine-le avec le réglage manuel des calories.'},
        {ic:'📓',t:'Journal alimentaire',d:'Onglet « Journal » dans Nutrition : note tes repas et suis tes calories/macros du jour vs tes objectifs. Ajoute un aliment de 3 façons : à la main (gratuit, illimité), estimation IA (🤖 décris ton repas → l\'IA remplit les calories, 25 gratuites puis Premium), ou par code-barres (produit reconnu automatiquement, tu ajustes la quantité). Tout est sauvegardé dans ton compte.'},
        {ic:'📷',t:'Code-barres : chiffres ou photo',d:'Deux façons de passer par le code-barres d\'un produit. 1) Tape les chiffres écrits sous le code → recherche gratuite (aucun crédit IA). 2) Nouveau : appuie sur « 📷 Photographier le code-barres » et prends-le en photo → l\'IA lit le numéro à ta place (pratique si les chiffres sont petits ou abîmés). La lecture par photo utilise 1 essai IA ; ensuite le produit et son score santé s\'affichent gratuitement.'},
        {ic:'🥗',t:'Score santé des produits',d:'Nouveau : dans le Journal, tape le code-barres d\'un produit → tu vois son SCORE SANTÉ : Nutri-Score (A à E) et niveau de transformation (aliment brut ou ultra-transformé). Pour repérer d\'un coup d\'œil ce qui est sain. Gratuit pour tout le monde (aucune limite), ça n\'utilise pas de crédit IA. Pour lire une étiquette en photo ou estimer un plat, c\'est l\'IA (📸/🤖, 25 essais gratuits puis Premium).'},
        {ic:'📥',t:'Importer un plan alimentaire',d:'Un plan de diététicienne (photo ou PDF) ? Bouton « Importer un plan » sous Plan de repas IA : l\'IA lit le document et range les repas jour par jour, en tenant compte de ton régime.'},
        {ic:'👤',t:'Ton Profil',d:'Menu ☰ → Profil. Organisé en sections repliables (tape un titre pour l\'ouvrir) : Identité · Objectif · Discipline · Composition corporelle · Morphologie · Santé · Cycle menstruel (femmes) · Accessibilité. Le bouton "Enregistrer le profil" confirme par une notification verte. Ton profil nourrit le Coach IA, la nutrition et tes stats.'},
        {ic:'⚧',t:'Profil homme / femme',d:'Certaines sections s\'adaptent à ton sexe. Femmes : section Cycle menstruel (règles, contraception) pour ajuster macros et conseils selon la phase ; hanches demandées pour le calcul du % de graisse (US Navy) ; condition Endométriose dans Santé (le Coach en tient compte, elle peut freiner la perte de poids). Hommes : composition corporelle sur cou + taille seulement (les hanches ne servent pas).'},
        {ic:'🩺',t:'Santé (privé)',d:'Section Santé du Profil : conditions médicales et blessures, optionnelles. 🔒 Visibles seulement par toi (ton téléphone + ta sauvegarde perso). Le Coach IA les utilise pour éviter les mouvements à risque — il ne pose jamais de diagnostic et ne remplace pas un médecin.'},
        {ic:'🎽',t:'Discipline',d:'Nouveau : dans Profil → Discipline, choisis ta pratique — Musculation · Bodybuilding/Culturisme · Force athlétique · Haltérophilie. Le Coach IA adapte ses conseils (exercices, répétitions, périodisation) à ta discipline.'},
        {ic:'🥉',t:'Ton niveau (évolutif)',d:'Nouveau : dans Profil → Discipline, indique ton niveau — Débutant · Intermédiaire · Confirmé. Le Coach (Milo) s\'adapte : plus pédagogue si tu débutes, plus technique si tu es confirmé. Et surtout : ton niveau évolue tout seul ! À force de séances et de progrès sur les gros mouvements (squat, développé couché, soulevé de terre), l\'app te félicite et te fait passer au niveau supérieur. 🎉'},
        {ic:'🧬',t:'Mon ADN sportif',d:'Section « Mon ADN sportif » dans ton Profil. Tu y dis à Milo ce qui te caractérise DURABLEMENT dans ta façon de t\'entraîner — ta motivation profonde, ton mode de vie (temps dispo, salle/maison, matériel, rythme), tes préférences (exos que tu aimes/détestes, ton style) et ton expérience. Milo s\'en sert pour des conseils vraiment personnels ET réalistes : il ne te proposera pas une séance d\'1h30 si tu as 45 min, ni des squats si tu les détestes. Tout est optionnel et privé. C\'est différent de ton humeur du jour (dis-la lui dans le chat) ET de ta santé (tes zones fragiles/blessures vont dans Profil → Santé).'},
        {ic:'🧠',t:'Milo apprend à te connaître',d:'Au fil de tes séances, Milo repère des tendances (par ex. que tu t\'entraînes plutôt le matin, ou plus le haut du corps que les jambes) et te pose une petite question sur l\'Accueil pour vérifier — une à la fois, seulement quand une tendance est claire. Si tu réponds « Oui, c\'est vrai », il le RETIENT et s\'en sert pour mieux te conseiller. Si tu réponds « Pas vraiment », il oublie et ne re-pose plus la question. RIEN n\'est mémorisé sans ton accord. Tu peux revoir et effacer tout ce qu\'il a retenu dans Menu → « Ce que Milo sait de toi ». C\'est ta mémoire, tu en gardes le contrôle. 🔒'},
        {ic:'🌡️',t:'Comment tu te sens aujourd\'hui',d:'Sur ton Accueil, une petite carte optionnelle « Comment tu te sens aujourd\'hui ? ». En 1-2 taps : ton énergie du jour (😴 → ⚡) et, si besoin, une gêne ou douleur — tape la zone (trapèze, épaule, pectoraux, dos, cuisse, ischio, fessier, adducteur, genou, mollet, cheville…) et, pour une zone comme le genou ou l\'épaule, précise le CÔTÉ (gauche / droite / les deux). Milo adapte alors ses conseils DU JOUR : fatigue → il allège et te soutient ; en forme → il te pousse. Et surtout, si tu signales une DOULEUR, le Gardien PROTÈGE cette zone en priorité (il allège ou propose une alternative, jamais il ne t\'interdit de bouger). Ça repart à zéro chaque jour — c\'est ponctuel, ça ne te définit pas. Le ressenti prime toujours. C\'est différent de tes zones fragiles DURABLES (Profil → Santé) : là c\'est juste pour aujourd\'hui.'},
        {ic:'🛡️',t:'Milo veille sur ta sécurité',d:'Milo place TA sécurité en priorité : il tient compte de ta santé et de tes zones fragiles (Profil → Santé — blessures, zones fragiles, arthrose, hernie…) AVANT de te conseiller. Sa règle : ADAPTER, jamais t\'interdire bêtement. Face à une épaule sensible, un genou fragile ou des lombaires, il cherche le moyen le MOINS contraignant de continuer à progresser en sécurité (réduire la charge/l\'amplitude, changer d\'exercice, protéger la zone tout en travaillant le reste) et te propose des alternatives. L\'arrêt total reste l\'exception. ⚠️ Il ne pose jamais de diagnostic : devant une douleur forte ou inhabituelle, il te conseille le repos et un professionnel de santé. Plus tu renseignes tes zones fragiles et ta santé, mieux il te protège.'},
        {ic:'🧬',t:'Morphologie',d:'Dans Profil → section Morphologie : choisis ta forme (H/A/V/X/O) et ton morphotype (ecto/méso/endo). Bouton 📸 "Analyser ma morphologie" (Premium) → analyse IA sur 3 photos (face/dos/profil) → mise à jour automatique.'},
        {ic:'🤖',t:'Coach IA — Milo',d:'Ton coach s\'appelle Milo. Il est franc et direct, mais il s\'adapte à toi : ton niveau (via tes records), ton état du jour (via ta récup/sommeil) et ta façon de parler. Nouveau : il coache comme un VRAI coach — il t\'évalue avant de conseiller (et te pose des questions au besoin), croise tes données (records, morpho, bilan corporel), justifie ses choix, s\'adapte à ta vie (horaires, travail de nuit, temps dispo) et te dit la vérité sans langue de bois. Ton profil complet est injecté automatiquement. Mémoire intelligente Premium : résumé entre sessions. Envoie une photo avec 📷 pour analyse corporelle. Bouton "Partager" sous chaque réponse. 10 questions gratuites, illimité en Premium (4,99 € / 2 mois).'},
        {ic:'💾',t:'Mémoire & historique de Milo',d:'Milo se souvient de l\'essentiel de vos échanges — MÊME sans être Premium (c\'est un acquis : il te connaît un peu plus à chaque conversation, et si tu passes Premium un jour, il ne repart pas de zéro). Tes discussions sont gardées : le bouton « + » (nouvelle discussion) ne les efface plus, il les RANGE dans « Mes discussions » (l\'icône horloge en haut à droite du Coach) — tape-la pour rouvrir une ancienne discussion, ✕ pour la supprimer. Sous chaque réponse : boutons « Partager » et « 📄 PDF » pour l\'exporter proprement.'},
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
        Coach IA propulsé par Claude (Anthropic)<br>
        <span style="color:var(--t3);">🎂 Né le 17 juin 2026 · conçu avec Claude</span>
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
  if(!S.url||!S.email)return; // construite pour TOUS (mémoire = acquis) — plus de barrière premium
  try{
    const resp=await fetch(_aiUrl('summarizeCoach'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'summarizeCoach',email:S.email,
        history:_coachHistPayload(16),existingMemory:S.coachMemory||''})
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




