// ─── Commandes vocales — logger une série à la voix pendant la séance ────────
// 100% client (Web Speech API), zéro token, zéro backend. Push-to-talk : on
// appuie sur le micro, on parle une fois, l'app agit. iOS Safari supporte
// webkitSpeechRecognition (14.5+) mais de façon capricieuse → on reste sur du
// court et précis. Le cœur (_handleVoiceTranscript) est testable sans micro.

let _voiceRec=null, _voiceListening=false;

function _voiceSupported(){
  return typeof window!=='undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

// ─── Mots-nombres FR → chiffres (assez pour poids & reps, 0-999) ─────────────
const _VNUM={
  'zero':0,'zéro':0,'un':1,'une':1,'deux':2,'trois':3,'quatre':4,'cinq':5,'six':6,'sept':7,'huit':8,'neuf':9,
  'dix':10,'onze':11,'douze':12,'treize':13,'quatorze':14,'quinze':15,'seize':16,'dix-sept':17,'dix-huit':18,'dix-neuf':19,
  'vingt':20,'trente':30,'quarante':40,'cinquante':50,'soixante':60,'quatre-vingt':80,'quatre-vingts':80,'cent':100,'cents':100
};
// Convertit les mots-nombres FR d'une chaîne en chiffres (gère "quatre-vingt-dix",
// "soixante-quinze", "cent dix", "vingt-cinq", "et un"…). Approche par segments.
function _frWordsToNum(str){
  // normalise séparateurs : "quatre vingt dix" → "quatre-vingt-dix"
  let s=' '+str.toLowerCase().replace(/\bet\b/g,' ').replace(/[-]/g,' ')+' ';
  // remplace les séquences de mots-nombres par leur valeur
  return s.replace(/(?:zéro|zero|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|vingts|trente|quarante|cinquante|soixante|cent|cents)(?:\s+(?:zéro|zero|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|vingts|trente|quarante|cinquante|soixante|cent|cents))*/g,
    m=>{ const v=_frPhraseToNum(m.trim()); return v==null?m:(' '+v+' '); });
}
function _frPhraseToNum(phrase){
  const words=phrase.split(/\s+/).filter(Boolean);
  if(!words.some(w=>w in _VNUM))return null;
  let total=0, cur=0, lastUnit=0;
  for(const w of words){
    if(!(w in _VNUM))return null;
    const v=_VNUM[w];
    if(v===100){ cur=(cur||1)*100; total+=cur; cur=0; lastUnit=0; }
    else if(v===20){ cur += (lastUnit===4?76:20); lastUnit=0; } // "quatre-vingt" = 4×20 = 80
    else { cur+=v; lastUnit=v; }
  }
  total+=cur;
  return total;
}

// ─── Parse une phrase → intention {kg, reps, validate, rest} ─────────────────
function _parseVoiceCmd(raw){
  if(!raw)return {};
  let t=_frWordsToNum(raw).toLowerCase();
  const res={};
  // validation ?  (valide, ok, suivant, c'est bon, terminé…)
  if(/\b(valide|valid[eé]s?|valider|ok|okay|c'?est bon|cest bon|suivant|termin[eé]|next)\b/.test(t)) res.validate=true;
  // repos / chrono ?
  if(/\b(repos|pause|r[eé]cup(?:[eé]ration)?|chrono|minuteur)\b/.test(t)) res.rest=true;
  // poids explicite : "80 kilo(s)/kg"
  let m=t.match(/(\d+(?:[.,]\d+)?)\s*(?:kilo?s?|kg)\b/);
  if(m) res.kg=parseFloat(m[1].replace(',','.'));
  // reps explicite : "8 rep(s)/répétition(s)/fois"
  m=t.match(/(\d+)\s*(?:r[eé]p(?:[eé]tition)?s?|fois)\b/);
  if(m) res.reps=parseInt(m[1]);
  // Si ni kg ni reps taggés → 2 nombres = poids puis reps (positionnel)
  if(res.kg==null && res.reps==null){
    const nums=(t.match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>parseFloat(x.replace(',','.')));
    if(nums.length>=2){ res.kg=nums[0]; res.reps=Math.round(nums[1]); }
    else if(nums.length===1 && !res.validate && !res.rest){ res.kg=nums[0]; } // 1 nombre seul = poids
  } else if(res.kg==null && res.reps!=null){
    // reps taggé mais pas kg : cherche un autre nombre non tagué pour le poids
    const nums=(t.replace(/(\d+)\s*(?:r[eé]p(?:[eé]tition)?s?|fois)\b/,'').match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>parseFloat(x.replace(',','.')));
    if(nums.length) res.kg=nums[0];
  } else if(res.reps==null && res.kg!=null){
    const nums=(t.replace(/(\d+(?:[.,]\d+)?)\s*(?:kilo?s?|kg)\b/,'').match(/\d+/g)||[]).map(x=>parseInt(x));
    if(nums.length) res.reps=nums[0];
  }
  return res;
}

// ─── Trouve la série active (exercice ouvert, 1re série non faite) ───────────
function _voiceCurrentSet(){
  const exs=S.wkt&&S.wkt.exs; if(!exs||!exs.length)return null;
  let ei=(typeof _expandedEx!=='undefined'&&_expandedEx!=null)?_expandedEx:null;
  if(ei==null||!exs[ei]||!exs[ei].sets.some(s=>!s.done)){
    ei=exs.findIndex(e=>e.sets.some(s=>!s.done));
  }
  if(ei<0||ei==null)return null;
  const si=exs[ei].sets.findIndex(s=>!s.done);
  if(si<0)return null;
  return {ei,si};
}

// ─── Cœur : applique une phrase reconnue. Retourne un résumé (pour les tests) ─
function _handleVoiceTranscript(raw){
  const cmd=_parseVoiceCmd(raw);
  const done=[];
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){
    if(typeof toast==='function')toast('Démarre une séance d\'abord','error');
    return {error:'no-workout',cmd};
  }
  const cur=_voiceCurrentSet();
  // 1) Remplir kg / reps sur la série active
  if((cmd.kg!=null||cmd.reps!=null)){
    if(!cur){ if(typeof toast==='function')toast('Aucune série à remplir','error'); return {error:'no-set',cmd}; }
    const set=S.wkt.exs[cur.ei].sets[cur.si];
    if(cmd.kg!=null){set.kg=cmd.kg;done.push(cmd.kg+' kg');}
    if(cmd.reps!=null){set.reps=cmd.reps;done.push(cmd.reps+' reps');}
    if(set.kg&&set.reps)set.rm1=bz(set.kg,set.reps);
    persist();
    if(typeof renderExBlocks==='function')renderExBlocks();
  }
  // 2) Validation (après remplissage éventuel)
  if(cmd.validate){
    const c=_voiceCurrentSet();
    if(c && typeof confirmSetAndNext==='function'){confirmSetAndNext(c.ei,c.si);done.push('série validée ✅');}
  }
  // 3) Repos
  if(cmd.rest && !cmd.validate){
    const secs=_voiceRestSecs(cur?cur.ei:null);
    if(typeof startRest==='function'){startRest(secs);done.push('repos '+secs+'s');}
  }
  if(navigator.vibrate)navigator.vibrate(done.length?[40]:[80,40,80]);
  if(typeof toast==='function'){
    if(done.length)toast('🎤 '+done.join(' · '),'success');
    else toast('🎤 Pas compris : « '+raw+' »','info');
  }
  return {cmd,done};
}
function _voiceRestSecs(ei){
  const exs=S.wkt&&S.wkt.exs;
  if(exs&&ei!=null&&exs[ei]){
    const name=exs[ei].name;
    const isAbdo=(typeof EXLIB!=='undefined')&&EXLIB.some(e=>e.n===name&&e.g==='Abdominaux');
    const pref=(S.exRestPref||{})[name];
    return isAbdo?30:(pref||90);
  }
  return S.defRest||130;
}

// ─── Micro : push-to-talk (une écoute) ───────────────────────────────────────
let _voiceHeardFinal='', _voiceWatchdog=null, _voiceGotEvent=false;
// iPhone en mode « app installée » (écran d'accueil) : la dictée web est souvent bloquée.
function _voiceStandalone(){
  return (window.navigator.standalone===true) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
}
function startVoiceLog(){
  if(!_voiceSupported()){_voiceShowOverlay();_voiceStatus('Ton navigateur ne gère pas la commande vocale.',true);return;}
  if(_voiceListening){_voiceStop();return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  _voiceHeardFinal='';_voiceGotEvent=false;
  _voiceShowOverlay();
  _voiceStatus('Démarrage du micro…');
  try{
    _voiceRec=new SR();
    _voiceRec.lang='fr-FR';
    _voiceRec.continuous=false;
    _voiceRec.interimResults=false;   // iOS : plus fiable sans résultats intermédiaires
    _voiceRec.maxAlternatives=1;
    _voiceRec.onstart=()=>{_voiceGotEvent=true;_voiceListening=true;_voiceStatus('');_voiceSetPhase('listening');};
    _voiceRec.onaudiostart=()=>{_voiceGotEvent=true;};
    _voiceRec.onspeechstart=()=>{_voiceGotEvent=true;_voiceStatus('Je t\'entends…');};
    _voiceRec.onresult=(e)=>{
      _voiceGotEvent=true;
      let txt='';for(let i=0;i<e.results.length;i++)txt+=e.results[i][0].transcript;
      _voiceSetHeard(txt);
      if(e.results[e.results.length-1].isFinal)_voiceHeardFinal=txt;
    };
    _voiceRec.onerror=(e)=>{
      _voiceGotEvent=true;_voiceListening=false;
      _voiceClearWatchdog();
      const err=e&&e.error||'?';
      const msg=err==='not-allowed'||err==='service-not-allowed'
          ?'Micro bloqué. Sur iPhone : Réglages → Général → Clavier → active « Dictée » ; et utilise l\'app dans Safari (pas en app installée).'
        :err==='no-speech'?'Rien entendu — réessaie en parlant juste après avoir appuyé.'
        :err==='audio-capture'?'Micro introuvable sur cet appareil.'
        :err==='network'?'Pas de réseau — la dictée iPhone a besoin d\'un peu d\'internet.'
        :'Micro indisponible ('+err+').';
      _voiceStatus(msg,true);_voiceSetPhase('error');
    };
    _voiceRec.onend=()=>{
      _voiceListening=false;_voiceClearWatchdog();
      if(_voiceHeardFinal){const t=_voiceHeardFinal;_voiceHeardFinal='';_voiceHideOverlay();_handleVoiceTranscript(t);}
      else if(_voiceGotEvent){_voiceStatus('Rien compris — appuie et réessaie.',true);_voiceSetPhase('error');}
      // si !_voiceGotEvent : le watchdog affiche déjà le message « ne démarre pas »
    };
    _voiceRec.start();
    // Watchdog : si aucun événement en 2,5 s → le micro n'a pas démarré (cas iPhone app installée)
    _voiceClearWatchdog();
    _voiceWatchdog=setTimeout(()=>{
      if(!_voiceGotEvent){
        _voiceSetPhase('error');
        _voiceStatus(_voiceStandalone()
          ? 'Le micro ne démarre pas. Sur iPhone, la dictée vocale marche mieux en ouvrant l\'app dans Safari (pas depuis l\'icône installée sur l\'écran d\'accueil).'
          : 'Le micro ne démarre pas. Vérifie que la dictée est activée (iPhone : Réglages → Général → Clavier → Dictée) et l\'autorisation micro du site.');
        try{_voiceRec&&_voiceRec.stop();}catch(e){}
      }
    },2500);
  }catch(err){_voiceStatus('Erreur micro : '+(err.message||err),true);_voiceSetPhase('error');_voiceListening=false;}
}
function _voiceClearWatchdog(){if(_voiceWatchdog){clearTimeout(_voiceWatchdog);_voiceWatchdog=null;}}
function _voiceStop(){_voiceClearWatchdog();try{if(_voiceRec)_voiceRec.stop();}catch(e){}_voiceListening=false;_voiceHideOverlay();}

// ─── Overlay « je t'écoute » (avec statut + phases) ──────────────────────────
function _voiceShowOverlay(){
  let el=document.getElementById('ov-voice');
  if(!el){
    el=document.createElement('div');el.id='ov-voice';el.className='overlay';el.style.zIndex='9998';
    el.onclick=(e)=>{if(e.target===el)_voiceStop();};
    document.body.appendChild(el);
  }
  el.innerHTML='<div style="background:var(--bg2);border-radius:20px;padding:26px 22px;max-width:340px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);">'
    +'<div id="voice-orb" class="voice-pulse" style="width:76px;height:76px;margin:0 auto 16px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;">'
    +'<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg></div>'
    +'<div style="font-weight:800;font-size:17px;color:var(--t1);margin-bottom:6px;">Commande vocale</div>'
    +'<div id="voice-status" style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:8px;min-height:18px;"></div>'
    +'<div id="voice-heard" style="font-size:15px;color:var(--red);font-weight:700;min-height:20px;margin-bottom:10px;"></div>'
    +'<div style="font-size:12px;color:var(--t3);line-height:1.5;">Dis par exemple :<br>« 80 kilos 8 reps » · « valide » · « repos »</div>'
    +'<div style="display:flex;gap:8px;margin-top:14px;">'
    +'<button onclick="startVoiceLog()" style="flex:1;padding:10px;border-radius:10px;border:none;background:var(--red);color:#fff;font-weight:800;font-size:13px;cursor:pointer;">🎤 Réessayer</button>'
    +'<button onclick="_voiceStop()" style="flex:1;padding:10px;border-radius:10px;border:none;background:var(--bg3);color:var(--t2);font-weight:700;font-size:13px;cursor:pointer;">Fermer</button>'
    +'</div></div>';
  el.classList.add('open');
}
function _voiceStatus(t,isErr){const s=document.getElementById('voice-status');if(s){s.textContent=t||'';s.style.color=isErr?'var(--red)':'var(--t2)';}}
function _voiceSetPhase(ph){const o=document.getElementById('voice-orb');if(!o)return;o.style.background=ph==='error'?'var(--t3)':'var(--red)';o.classList.toggle('voice-pulse',ph==='listening');}
function _voiceSetHeard(t){const h=document.getElementById('voice-heard');if(h)h.textContent=t;}
function _voiceHideOverlay(){const el=document.getElementById('ov-voice');if(el)el.classList.remove('open');}
