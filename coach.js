// ─── COACH IA ─────────────────────────────────────────────────
const COACH_FREE_LIMIT = 10;
let coachHistory = [];
let coachBusy = false;

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
  sendToCoach(prompts[type]);
}

function updateCoachHeader() {
  _updateCoachMorphoBtn();
  _updateCoachCtxTags();
  // Cache le mur premium si l'utilisateur est maintenant premium
  if(S.premium){const wall=document.getElementById('coach-wall');if(wall)wall.style.display='none';}
  // Afficher accueil ou chat selon l'historique
  if(coachHistory.length===0){
    const home=document.getElementById('coach-home');
    const msgs=document.getElementById('coach-msgs');
    const suggs=document.getElementById('coach-suggs');
    if(home)home.style.display='flex';
    if(msgs)msgs.style.display='none';
    if(suggs)suggs.style.display='none';
  } else {
    _showCoachChat();
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

function buildCoachContext() {
  const bmr = calcBMR ? calcBMR() : '—';
  const tdee = calcTDEE ? calcTDEE() : '—';
  const macros = calcMacros ? calcMacros(S.nutritionPhase || 'charge') : {};
  const curWeek = S.cycle ? getCurrentCycleWeek() : null;
  const cyclePlan = S.cycle && curWeek ? getWeekPlan(curWeek, S.cycle.weeks) : null;

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

  return `Tu es un coach expert en force athlétique et musculation. Tu réponds TOUJOURS en français, de façon directe, précise et motivante. Maximum 200 mots sauf si l'athlète demande plus de détails.

PROFIL ATHLÈTE:
- Sexe: ${S.gender === 'H' ? 'Homme' : 'Femme'} | Âge: ${S.age} ans | Taille: ${S.height}cm | Poids: ${S.bw}kg
- BMR: ${bmr} kcal | TDEE: ${tdee} kcal
- Niveau activité sportive: ${S.activityLevel} | Type travail: ${{bureau:'Bureau/Sédentaire',debout:'Debout/Marchant',physique:'Travail Physique'}[S.workType]||'Bureau'} (+${calcWorkExtra()} kcal NEAT)
- Tabac: ${S.smoker?'Fumeur (BMR +7%, impact cardiovasculaire — adapter l\'intensité et conseiller l\'arrêt)':'Non-fumeur'}
- Objectif: ${GOAL_LABELS[S.goal||'muscle']} | Phase: ${S.nutritionPhase === 'charge' ? 'Charge (+100 kcal)' : 'Décharge (−100 kcal)'}
- Calories cible: ${macros.calories || '—'} kcal | Protéines: ${macros.prot_g || '—'}g | Glucides: ${macros.carbs_g || '—'}g | Lipides: ${macros.fat_g || '—'}g
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
  const cL={cardio:'Cardiologie/HTA',diabete:'Diabète',hernie:'Hernie discale',asthme:'Asthme',arthrite:'Arthrose/Arthrite',osteo:'Ostéoporose',epilepsie:'Épilepsie'};
  const zL={epaule_d:'Épaule D',epaule_g:'Épaule G',genou_d:'Genou D',genou_g:'Genou G',dos_bas:'Lombaires',dos_haut:'Dorsaux',hanche_d:'Hanche D',hanche_g:'Hanche G',cheville_d:'Cheville D',cheville_g:'Cheville G',coude_d:'Coude D',coude_g:'Coude G',poignet_d:'Poignet D',poignet_g:'Poignet G',cou:'Cou/Cervicales',autre:'Autre'};
  const sL={active:'active ⚠️',recente:'récente',ancienne:'ancienne/guérie'};
  const parts=[];
  if((hp.conditions||[]).length)parts.push('Conditions: '+(hp.conditions||[]).map(c=>cL[c]||c).join(', '));
  if((hp.injuries||[]).length)parts.push('Blessures: '+(hp.injuries||[]).map(i=>`${zL[i.zone]||i.zone} (${sL[i.status]||i.status})`).join(', '));
  if((hp.notes||'').trim())parts.push('Notes: '+hp.notes.trim());
  return '\n⚠️ PROFIL SANTÉ — adapter les conseils en conséquence:\n- '+parts.join('\n- ');
})()}

RECORDS PERSONNELS (1RM estimés):
${prsText}

CYCLE DE FORCE:
${S.cycle && S.cycle.active ? `Actif - Semaine ${curWeek}/${S.cycle.weeks} - Phase ${cyclePlan ? cyclePlan.phase : '—'} - ${cyclePlan ? cyclePlan.sets+'×'+cyclePlan.reps+' @ '+cyclePlan.pct+'%' : '—'}` : 'Aucun cycle actif'}

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

${S.premium&&S.coachMemory?`\nMÉMOIRE CONVERSATIONS PRÉCÉDENTES:\n${S.coachMemory}\n`:''}
Utilise ces données pour personnaliser tes réponses. Sois direct et pratique.`;
}

function renderCoachMsg(role, text) {
  const msgs = document.getElementById('coach-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-bubble ' + (role === 'user' ? 'msg-user' : 'msg-coach');
  if (role === 'coach') {
    div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    if (!div.querySelector('p') && !div.querySelector('ul')) {
      div.innerHTML = '<p>' + div.innerHTML + '</p>';
    }
  } else {
    div.textContent = text;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
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

async function sendToCoach(customMsg) {
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
    renderCoachMsg('user', msg);
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
    renderCoachMsg('coach', reply);
    coachHistory.push({ role: 'assistant', content: reply });
    if (coachHistory.length > 20) coachHistory = coachHistory.slice(-20);

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
  help: {
    title:'❓ Aide détaillée',
    html:`<div style="display:flex;flex-direction:column;gap:10px;padding:0 2px 8px;">
      ${[
        {ic:'⚡',t:'Démarrer une séance',d:'Bouton rouge central ⚡ ou "Commencer une séance" depuis l\'accueil. Ajoute tes exercices, saisis kg × reps, valide chaque série avec ✓. Le timer de repos se lance automatiquement entre les séries.'},
        {ic:'🏋️',t:'Tags de série',d:'É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Tape la pastille pour changer. Timer : É 45s · N 2:10 · X 4min.'},
        {ic:'⚡',t:'Super-séries & Pyramides',d:'Bouton "⚡ Grouper" (dès 2 exercices) → sélectionne les exercices → "Lier en supersérie" : enchaînement sans repos entre eux. Sous chaque exercice : 📉 Drop set (−10% auto) · 📈 Pyramide + (+10%) · 📉 Pyramide − (−10%). Avance automatique et vibration entre les blocs.'},
        {ic:'📊',t:'Historique par exercice',d:'Bouton 📊 sur chaque exercice en séance → graphique du poids max sur les 5 dernières séances. Pratique pour calibrer sa charge du jour.'},
        {ic:'🏃',t:'Cardio en séance',d:'Bloc cardio en haut de séance (replié par défaut). Choisis le type (elliptique, tapis, vélo, rameur, corde...), l\'intensité (léger/modéré/intense) et la durée. Les calories brûlées sont calculées et ajoutées à ton TDEE.'},
        {ic:'📋',t:'Programmes',d:'Sauvegarde ta séance en cours comme programme réutilisable. Charge-le pour retrouver les exercices avec les poids de la dernière fois. Bouton 🤖 pour une analyse IA de ton programme. Bouton ✏️ pour modifier les exercices.'},
        {ic:'📸',t:'Import de programme',d:'Bouton 📸 dans la séance pour importer depuis une photo, un fichier Word (.docx) ou Excel (.xlsx). Le Coach IA extrait automatiquement les exercices, séries et charges.'},
        {ic:'📈',t:'Progrès & PRs',d:'Les PRs se calculent automatiquement via Brzycki (1RM estimé). Onglet Progrès → graphique par exercice · Onglet Poids → courbe de poids · Onglet Badges → 18 récompenses à débloquer. Tap sur une séance pour voir/modifier les séries.'},
        {ic:'🏅',t:'Badges & Streaks',d:'18 badges en 4 catégories : évolution (1re séance, 10/25/50/100 séances), performance (PRs, clubs 100/140 kg), streak (7/30/90 jours), spécial (lève-tôt, noctambule, anniversaire, premium). Un résumé hebdomadaire s\'affiche le lundi.'},
        {ic:'🍽️',t:'Nutrition',d:'TDEE adaptatif (Harris-Benedict) calculé depuis ton profil. Phase Charge = surplus · Phase Décharge = déficit. Plan 5 repas détaillé. Créatine et whey dosés selon ton poids. Combinaisons Premium : 4 stacks (muscle, force, cardio, perte de poids).'},
        {ic:'🧬',t:'Morphologie',d:'Dans Profil → section Morphologie : choisis ta forme (H/A/V/X/O) et ton morphotype (ecto/méso/endo). Bouton 📸 "Analyser ma morphologie" (Premium) → analyse IA sur 3 photos (face/dos/profil) → mise à jour automatique.'},
        {ic:'🤖',t:'Coach IA',d:'Ton profil complet est injecté automatiquement. Mémoire intelligente Premium : résumé entre sessions. Envoie une photo avec 📷 pour analyse corporelle. 10 questions gratuites, illimité en Premium (4,99 € / 2 mois).'},
        {ic:'☁️',t:'Synchronisation cloud',d:'Données sauvegardées localement (localStorage) ET sur Google Sheets. Sync automatique après chaque séance. Restauration complète sur un nouvel appareil : entre ton email à l\'onboarding ou dans Profil → Admin.'},
        {ic:'💡',t:'Astuces',d:'• 1RM Brzycki = kg × (36 / (37 − reps)) · • Swipe gauche/droite pour changer d\'onglet · • Tap sur une séance passée pour corriger des séries · • Menu ☰ → Anatomie pour visualiser les muscles · • Calculateur 1RM disponible depuis Menu ☰'},
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
      return`<div style="text-align:center;padding:10px 0 20px;">
      <img src="logo.png" style="width:80px;height:80px;border-radius:20px;margin-bottom:16px;">
      <div style="font-family:var(--font-cond);font-size:28px;font-weight:900;background:linear-gradient(135deg,#FF2D55,#FF6D00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px;">Force Tracker</div>
      <div id="_about-ver" style="display:inline-block;background:rgba(255,45,85,.12);color:var(--red);font-family:var(--font-cond);font-size:15px;font-weight:800;padding:5px 16px;border-radius:20px;letter-spacing:.05em;border:1px solid rgba(255,45,85,.22);margin-bottom:20px;">…</div>
      <div style="background:var(--bg3);border-radius:12px;padding:16px;text-align:left;margin-bottom:12px;font-size:13px;line-height:1.7;color:var(--t2);">
        Application de suivi de musculation Progressive Web App.<br>
        Fonctionne hors connexion · Synchronisation Google Sheets<br>
        Coach IA propulsé par Claude (Anthropic)
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
  if(modal)_addSwipeClose(modal,closeDrawerContent,modal,null,modal.querySelector('.modal-handle'),120);
}
function closeDrawerContent(){document.getElementById('ov-drawer-cnt').classList.remove('open');}


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




