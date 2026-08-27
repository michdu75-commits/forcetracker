/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── WORKOUT ─────────────────────────────────────────────────
let _wakeLock=null;
/* 🔆 L'ÉCRAN RESTE ALLUMÉ TANT QU'UNE SÉANCE TOURNE — PAS TANT QU'ON REGARDE L'ÉCRAN SÉANCE
   (18/08/2026). Michel, en pleine séance : *« l'écran s'éteint pendant la séance »*.
   ⚠️⚠️ LA CAUSE N'EST PAS LE VERROU, C'EST CE À QUOI IL ÉTAIT ATTACHÉ : `goScreen` le relâchait
   pour TOUT écran autre que `log`. Or pendant une séance on va justement ailleurs — parler à
   **Milo**, regarder ses records, noter une pesée. On revenait donc à un écran éteint au milieu
   d'un repos, exactement quand on a les mains occupées.
   👉 Le verrou appartient à l'ÉTAT « une séance est en cours », pas à l'écran affiché (R2 : une
   information, un propriétaire — et ici l'information est « je m'entraîne », pas « je regarde »).
   ⚠️ ET IL SE RELÂCHE QUAND LA SÉANCE EST EN PAUSE : une séance en pause n'est pas un
   entraînement, et laisser l'écran d'un téléphone allumé sans raison se paie en batterie. */
/* ⚠️⚠️ DEUX QUESTIONS VOISINES, ET IL NE FAUT PAS LES CONFONDRE (18/08/2026) :
     · `_seanceOuverte()` → « y a-t-il une séance NON TERMINÉE ? » — pause comprise. C'est ce
       qui doit retenir une **mise à jour** : une séance en pause est une séance qu'on n'a pas
       finie, et la recharger coûterait le récapitulatif de fin.
     · `_wktEnCours()`    → « est-ce que je m'entraîne LÀ, maintenant ? » — pause exclue. C'est
       ce qui doit tenir l'**écran allumé** : en pause, on n'a aucune raison de brûler la
       batterie.
   ⚠️ ET « OUVERTE » NE VEUT PAS DIRE « `S.wkt` EXISTE » : `renderLog()` crée un objet vide dès
   qu'on affiche l'écran Séance. Une vraie séance a démarré (`startTs`), porte des exercices, ou
   porte un cardio noté — c'est cette définition-là, et une seule, que tout le monde lit (R2). */
function _seanceOuverte(){
  if(typeof S==='undefined'||!S.wkt)return false;
  return !!(S.wkt.startTs || (S.wkt.exs&&S.wkt.exs.length) || _cardioNoteMin()>0);
}
function _wktEnCours(){
  return _seanceOuverte() && !S.wkt.pausedAt;          // en pause → ce n'est plus un entraînement
}
async function _acquireWakeLock(){
  if(!('wakeLock' in navigator))return;
  if(_wakeLock)return;                                 // déjà tenu : ne pas en empiler un 2ᵉ
  try{
    _wakeLock=await navigator.wakeLock.request('screen');
    /* ⚠️ LE SYSTÈME LE REPREND SANS PRÉVENIR (écran verrouillé, appli en arrière-plan) et il ne
       revient JAMAIS tout seul. Sans ce marqueur, `_wakeLock` resterait un objet mort et le
       garde ci-dessus empêcherait toute reprise — l'écran s'éteindrait pour de bon au 1ᵉʳ
       passage en arrière-plan. */
    _wakeLock.addEventListener('release',()=>{_wakeLock=null;});
  }catch(e){}
}
function _releaseWakeLock(){
  if(_wakeLock){try{_wakeLock.release();}catch(e){} _wakeLock=null;}
}
// Le seul point de décision : on tient l'écran si — et seulement si — une séance tourne,
// ou si on est en train de regarder l'écran Séance.
function _syncWakeLock(){
  if(_wktEnCours()||window._curScreen==='log') _acquireWakeLock();
  else _releaseWakeLock();
}

// ─── CHRONO DURÉE SÉANCE ─────────────────────────────────────
let _wktChronoIv=null;
// Temps écoulé réel (ms), en retirant le temps passé EN PAUSE.
// pausedTotal = pauses déjà cumulées ; pausedAt = timestamp de la pause en cours (ou null).
function _wktElapsedMs(){
  if(!S.wkt||!S.wkt.startTs)return 0;
  const paused=S.wkt.pausedTotal||0;
  const end=S.wkt.pausedAt||Date.now(); // en pause → on fige au moment de la pause
  return Math.max(0,end-S.wkt.startTs-paused);
}
function _isWktPaused(){return!!(S.wkt&&S.wkt.pausedAt);}
/* ⏰ DEPUIS COMBIEN DE TEMPS LA DERNIÈRE SÉRIE A-T-ELLE ÉTÉ VALIDÉE ? (14/08/2026)
   Michel : *« il faut faire penser à l'utilisateur qu'il arrête absolument sa séance à la
   fin »*. Une séance laissée ouverte ne fausse PAS la mesure — l'horloge s'arrête à la
   dernière série validée (ft-v835) et un témoin le fige. Mais elle gêne pour de vrai :
   le chrono tourne à l'écran, la séance suivante s'y ajoute, la synchro attend.
   ⚠️ On mesure depuis la DERNIÈRE SÉRIE, pas depuis le début : une séance de 2 h en cours
   n'est pas un oubli, une séance sans rien depuis 2 h en est un.
   Rend `null` quand on ne peut pas savoir (aucune série horodatée) — jamais un faux signal. */
function _wktInactifMin(){
  if(!S.wkt||!S.wkt.startTs)return null;
  let last=null;
  for(const ex of (S.wkt.exs||[]))
    for(const st of (ex.sets||[]))
      if(st&&st.done&&typeof st.at==='number'&&(last===null||st.at>last)) last=st.at;
  if(last===null)return null;
  return Math.floor((_wktElapsedMs()/1000-last)/60);
}
/* ⏱️ CE QUE LE CHRONO AFFICHE **AVANT** LA 1ʳᵉ SÉRIE (18/08/2026)
   Michel : *« je viens de commencer la séance mais la séance n'a pas commencé »* — il était sur
   son cardio d'avant, et l'écran lui montrait `0:00`, ce qui se lit comme une panne.
   ⚠️ ON NE FAIT PAS DÉMARRER LE CHRONO POUR AUTANT : la règle du 14/08 (il part à la 1ʳᵉ série
   validée) a corrigé la plus grosse erreur de durée du projet, et noter « 20 min » n'est pas la
   preuve qu'on vient de les faire — on peut le saisir avant comme après (R29 : on ne devine pas
   ce qu'on ne mesure pas). On AFFICHE donc ce qui est déjà acquis, et le chrono prend le relais.
   Ces minutes-là sont bien comptées à l'arrivée, par `_dureeTotaleMin` (app.js). */
function _cardioNoteMin(){
  if(!S.wkt)return 0;
  return (+S.wkt.cardioAvant?.duration||0)+(+S.wkt.cardio?.duration||0);
}
function _fmtElapsed(){
  if(!S.wkt||!S.wkt.startTs){
    const c=_cardioNoteMin();
    return c>0 ? '🚴 '+c+' min' : '0:00';
  }
  const sec=Math.floor(_wktElapsedMs()/1000);
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  if(h>0)return h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  return m+':'+(s<10?'0':'')+s;
}
function _startWktChrono(){
  if(_wktChronoIv)clearInterval(_wktChronoIv);
  if(_isWktPaused())return; // en pause : pas de tick (le chrono reste figé)
  _wktChronoIv=setInterval(()=>{
    const el=document.getElementById('wkt-chrono');
    if(!el){clearInterval(_wktChronoIv);_wktChronoIv=null;return;}
    el.textContent=_fmtElapsed();
  },1000);
}
function _stopWktChrono(){if(_wktChronoIv){clearInterval(_wktChronoIv);_wktChronoIv=null;}}
// Bouton Pause/Reprendre (affiché tant que la séance tourne, avec ou sans exos)
function _pauseBtnHtml(){
  if(!S.wkt||!S.wkt.startTs)return'';
  const p=_isWktPaused();
  const ico=p
    ?'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>'
    :'<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  return '<button id="wkt-pause-btn" onclick="toggleWktPause()" style="padding:7px 10px;border-radius:10px;border:1px solid '+(p?'rgba(255,159,10,.45)':'var(--sep)')+';background:'+(p?'rgba(255,159,10,.14)':'var(--bg3)')+';color:'+(p?'var(--orange)':'var(--t2)')+';font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;display:inline-flex;align-items:center;gap:4px;">'+ico+(p?'Reprendre':'Pause')+'</button>';
}
// Rafraîchit l'affichage chrono + bouton sans re-render complet
function _syncWktPauseUI(){
  const c=document.getElementById('wkt-chrono');
  if(c){c.textContent=_fmtElapsed();c.style.color=_isWktPaused()?'var(--orange)':'var(--t3)';}
  const b=document.getElementById('wkt-pause-btn');
  if(b)b.outerHTML=_pauseBtnHtml();
}
// Met la séance en pause ou la reprend — fige/relance le chrono de durée.
// Le temps en pause n'est PAS compté dans la durée finale de la séance.
function toggleWktPause(){
  if(!S.wkt||!S.wkt.startTs)return;
  if(_isWktPaused()){
    // Reprendre : cumule la pause qui vient de se terminer
    S.wkt.pausedTotal=(S.wkt.pausedTotal||0)+(Date.now()-S.wkt.pausedAt);
    S.wkt.pausedAt=null;
    persist();
  _startWktChrono();
    _syncWktPauseUI();
    _syncWakeLock();                 // on reprend l'entraînement → on retient l'écran
    toast('Séance reprise','info');
  }else{
    // Pause : fige le chrono + coupe un éventuel repos en cours
    S.wkt.pausedAt=Date.now();
    _stopWktChrono();
    if(typeof stopRest==='function')stopRest();
    persist();
    _syncWktPauseUI();
    _syncWakeLock();                 // en pause, on n'a plus de raison de tenir l'écran allumé
    toast('Séance en pause ⏸','info');
  }
}

// Ré-acquérir + resync des deux chronos au retour au premier plan
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  _syncWakeLock();   // le système reprend TOUJOURS le verrou en arrière-plan : on le redemande ici
  if(window._curScreen==='log'){
    // Wkt chrono : mise à jour immédiate (ne pas attendre le prochain tick)
    const chronoEl=document.getElementById('wkt-chrono');
    if(chronoEl)chronoEl.textContent=_fmtElapsed();
    _startWktChrono();
  }
  /* ⚠️ LE REPOS SE RESYNCHRONISE SUR TOUS LES ÉCRANS (15/08/2026) — ce contrôle était enfermé
     dans le `if` de l'écran Séance, alors que le décompte final, lui, est VOLONTAIREMENT plein
     écran et global (« le décompte manquait quand on discute avec Milo »). Donc revenir dans
     l'app depuis l'écran Coach ou Accueil ne rattrapait rien, et il fallait attendre le tick
     suivant — jusqu'à 250 ms de trop, mais surtout : c'est ce même chemin qui ouvre désormais
     le décompte quand les minuteurs ont été gelés. */
  if(restIv)_restTick();
});

/* ⏱️ LE CHRONO DÉMARRE À LA 1ʳᵉ SÉRIE VALIDÉE, PLUS À L'OUVERTURE (14/08/2026) ──────────
   Michel : *« quand on incorpore une séance il démarre déjà le chrono et ça c'est chiant ;
   pour moi le chrono devrait démarrer à partir du moment où il commence sa séance, c'est-à-dire
   à partir du moment où il a rentré sa première série »*.
   ⚠️ CE N'EST PAS UN CONFORT, C'EST LA PLUS GROSSE SOURCE D'ERREUR MESURÉE : `startTs` était posé
   à l'OUVERTURE de l'écran, donc il tournait pendant le chargement du programme, l'échauffement,
   la discussion. Croisé avec la Garmin (CALORIES-SOURCES.md §15.5), sa séance du 12/07 affichait
   **254 min pour 96 réelles**. La durée effective partait déjà de la 1ʳᵉ série ; c'est le chrono
   AFFICHÉ et `sess.duration` qui traînaient derrière. Les trois sont maintenant alignés (R1/R2).
   ⚠️ On ne CRÉE plus `startTs` ici — mais on le GARDE s'il existe déjà : une séance en cours au
   moment de la mise à jour ne doit pas voir son chrono repartir de zéro. */
function startWorkout(){
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length) S.wkt={date:today(),exs:[],startHour:new Date().getHours()};
  persist(); goScreen('log',document.getElementById('nb-log'));
  _syncWakeLock();
}
function _fmtWktDate(d){
  const dt=new Date(d+'T12:00:00');
  return dt.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
}
function _setLogDate(d){
  if(S.wkt){S.wkt.date=d;persist();}
  const txt=document.getElementById('s-date-txt');if(txt)txt.textContent=_fmtWktDate(d);
  const inp=document.getElementById('s-date');if(inp)inp.value=d;
}
function resetToday(){_setLogDate(today());}
// ⚠️ « Hier » s'ancre sur today() (l'heure du téléphone) et JAMAIS sur l'heure de Greenwich :
// entre minuit et 2 h, l'ancien calcul datait la séance d'AVANT-HIER — pile le cas d'usage du
// bouton (on rentre de la salle après minuit et on date la séance de la veille). Audit 30/07.
function setLogYesterday(){const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()-1);_setLogDate(d.toISOString().split('T')[0]);}
/* ══ ⑤ « SCANNER » ET « IMPORTER UN JOURNAL » : RANGÉS, PAS RETIRÉS (ft-v1024) ═══════════
   5ᵉ et dernière brique du chantier écran Séance (`docs/SEANCE-DESSAI.md` §8).
   ⛔⛔ MESURÉ AVANT DE TOUCHER AU CODE : ces deux boutons prenaient **200 px pleine largeur**,
   contre ~110 px sur une DEMI-rangée pour « + Créer ma séance ». *La place visuelle disait
   exactement l'inverse de la fréquence d'usage* — l'un sert une fois dans une vie, l'autre à
   chaque séance.
   ⛔ ILS NE SONT PAS SUPPRIMÉS (R30) : un retrait silencieux ressemble à un oubli, et ils
   restent le chemin le plus rapide pour qui arrive d'une autre app ou d'un carnet papier.
   ⭐⭐ ET LE RANGEMENT SUIT L'USAGE, il n'est pas uniforme : quelqu'un de VRAIMENT nouveau
   (aucun programme ET aucune séance) les voit dépliés — c'est sa meilleure porte d'entrée, et
   les replier lui cacherait précisément ce dont il a besoin. Tous les autres ont une ligne
   discrète. *On adapte à ce qu'on SAIT, on ne décide pas pareil pour tout le monde* (R29).
   ⚠️ L'état n'est PAS persisté, comme `_checkinOpen` : c'est un confort de session, pas une
   préférence. Une préférence qu'on n'a jamais demandée est une préférence inventée. */
let _impOuvert=false;
function _renderImportRow(){
  const box=document.getElementById('log-import');
  const tog=document.getElementById('log-import-toggle');
  if(!box||!tog)return;
  const vierge = !((S.programmes||[]).length) && !((S.sessions||[]).length);
  if(vierge){                       // rien à lui montrer d'autre : on laisse ouvert, sans ligne
    tog.style.display='none';
    box.style.display='flex';
    return;
  }
  tog.style.display='flex';
  box.style.display=_impOuvert?'flex':'none';
  const ch=document.getElementById('log-import-chev');
  if(ch)ch.style.transform='rotate('+(_impOuvert?90:0)+'deg)';
  const lb=document.getElementById('log-import-lbl');
  if(lb)lb.textContent=_impOuvert?'📷 Importer un programme ou un historique':'📷 J\'ai déjà un programme ou un historique';
}
function _toggleImport(){_impOuvert=!_impOuvert;_renderImportRow();}
/* ══ 🏋️ LES TYPES DE SÉANCES SUR L'ÉCRAN VIDE (ft-v1026) ══════════════════════════════
   §2.1 du parcours de découverte. Michel, en voyant l'écran : *« quand on arrive c'est vide »* —
   et ranger les imports (ft-v1024) l'a mécaniquement agrandi. On le remplit enfin.

   ⛔ AUCUNE NOUVELLE LISTE DE TYPES (R2) : les 5 viennent de `DISC_LABELS`, leur cadre de
   `DISC_CADRE`, leurs exercices de `DISC_SEANCE`. Une 2ᵉ liste divergerait, et Milo lirait
   l'une pendant que l'écran afficherait l'autre — le doc de cadrage l'interdit nommément.

   ⭐⭐ MICHEL A TRANCHÉ « LES 2 CARRÉMENT » entre deux options : (a) un tap → la séance, et
   (c) un écran qui explique le cadre avant. La carte porte donc **la ligne courte du cadre**
   (reps · charge · repos) — l'information de (c) — et le tap crée la séance — le geste de (a).
   Le cadre COMPLET reste à un tap du « ⓘ » : *la pop-up annonce, l'aide explique* (R25).

   ⛔ ET ON N'ÉCRASE JAMAIS UNE SÉANCE EN COURS. Quelqu'un qui a déjà 3 exercices posés et qui
   tape un type par curiosité perdrait son travail — c'est la règle d'or #3 (zéro perte). Les
   cartes ne s'affichent donc QUE sur un écran vide, et c'est aussi ce qui les empêche de
   gêner : elles disparaissent dès qu'on commence (R24, jamais en travers). */
function _typeSeanceHtml(){
  try{
    if(typeof DISC_SEANCE==='undefined'||typeof DISC_CADRE==='undefined') return '';
    const ordre=['muscu','bodybuilding','powerbuilding','powerlifting','haltero'];
    const ICO={muscu:'🏋️',bodybuilding:'💪',powerbuilding:'⚡',powerlifting:'🥇',haltero:'🤸'};
    const esc=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    /* ⭐ LA LIGNE COURTE SE DÉDUIT DU CADRE, elle ne se réécrit pas : `DISC_CADRE` est la
       source. Réécrire « 1-5 reps » à la main créerait une 2ᵉ vérité qui se périmerait (R2).
       ⚠️⚠️ MAIS ON N'EN TRONQUE PLUS LA PROSE — mon 1ᵉʳ jet coupait à 42 caractères et la
       capture a montré le résultat : « jusqu'à 15- » et « repos 3 à 5 min après un mouvement
       lourd, 90 à 1 ». *Une phrase coupée en plein milieu n'est pas une information courte,
       c'est une information FAUSSE* — « jusqu'à 15- » ne veut rien dire.
       👉 On extrait donc le MOTIF CHIFFRÉ (« 8-12 », « 90 à 150 s »), qui est exact quelle que
       soit la longueur de la phrase autour. Et si aucun chiffre n'est trouvable, on se tait
       plutôt que d'afficher un moignon de phrase (R29). */
    const nb=t=>{ const m=String(t||'').match(/\d+\s*(?:[-–]|\s+à\s+)\s*\d+/); return m?m[0].replace(/\s+à\s+/,'-').replace(/\s+/g,''):''; };
    const unite=t=>/min/.test(String(t||''))?' min':(/\bs\b/.test(String(t||''))?' s':'');
    const cartes=ordre.filter(d=>DISC_SEANCE[d]&&DISC_CADRE[d]).map(d=>{
      const c=DISC_CADRE[d], lbl=(typeof DISC_LABELS!=='undefined'&&DISC_LABELS[d])||d;
      const nEx=(DISC_SEANCE[d]||[]).length;
      const actif=(S.discipline||'muscu')===d;
      return '<button class="ts-carte'+(actif?' ts-actif':'')+'" onclick="lancerTypeSeance(\''+d+'\')">'
        +'<div class="ts-h"><span class="ts-ico">'+ICO[d]+'</span>'
        +'<span class="ts-nom">'+esc(lbl)+'</span>'
        +(actif?'<span class="ts-tag">la tienne</span>':'')
        +'<span class="ts-info" onclick="event.stopPropagation();ouvrirCadreType(\''+d+'\')" '
        +'role="button" aria-label="Voir le cadre complet">ⓘ</span></div>'
        +(function(){ const r=nb(c.reps), q=nb(c.repos);
            if(!r&&!q) return '';                       // rien de chiffrable → on se tait
            return '<div class="ts-cadre">'
              + (r?('<b>'+esc(r)+'</b> reps'):'')
              + (r&&q?' · ':'')
              + (q?('repos <b>'+esc(q)+esc(unite(c.repos))+'</b>'):'')
              + '</div>'; })()
        +'<div class="ts-exs">'+nEx+' exercices · '
        +esc((DISC_SEANCE[d]||[]).slice(0,2).map(x=>x.n).join(' · '))+'…</div>'
        +'</button>';
    }).join('');
    return '<div class="ts-bloc"><div class="ts-titre">Ou pars d\'un type de séance</div>'
      +'<div class="ts-liste">'+cartes+'</div></div>';
  }catch(e){ return ''; }
}
/* Monte la séance du type demandé. ⛔ Rien n'est écrasé : la fonction n'est atteignable que
   depuis l'écran VIDE, et elle le revérifie — un garde-fou qui ne coûte rien contre un appel
   depuis la console ou un futur appelant qui oublierait la condition. */
function lancerTypeSeance(d){
  try{
    const modele=(typeof DISC_SEANCE!=='undefined')?DISC_SEANCE[d]:null;
    if(!modele||!modele.length) return;
    if(S.wkt&&S.wkt.exs&&S.wkt.exs.length){ if(typeof toast==='function')toast('Une séance est déjà commencée','info'); return; }
    if(!S.wkt) S.wkt={date:today(),exs:[]};
    S.wkt.exs=modele.map(function(x){
      const sets=[];
      for(let i=0;i<(x.sets||3);i++) sets.push({kg:0,reps:x.reps||10,type:'N',rest:x.rest||120});
      /* ⚠️ Le nom passe par le résolveur (ft-v996) : si un exercice est renommé au catalogue,
         la séance générée suit au lieu de porter un nom périmé (la dette de ft-v1023). */
      return {name:(typeof exNomCatalogue==='function')?exNomCatalogue(x.n):x.n, sets:sets};
    });
    S.wkt.progLabel=(typeof DISC_LABELS!=='undefined'&&DISC_LABELS[d])||d;
    persist();
    if(typeof renderLog==='function')renderLog();
    if(typeof toast==='function')toast(S.wkt.progLabel+' — '+S.wkt.exs.length+' exercices prêts 💪','success');
  }catch(e){}
}
/* Le cadre COMPLET — option (c). ⭐ Il emprunte le MÊME rendu que l'écran Profil (R2) :
   deux mises en forme du même cadre finiraient par se contredire. */
function ouvrirCadreType(d){
  try{
    const ov=document.getElementById('ov-cadre-type'), b=document.getElementById('cadre-type-body');
    const t=document.getElementById('cadre-type-titre');
    if(!ov||!b) return;
    if(t)t.textContent=((typeof DISC_LABELS!=='undefined'&&DISC_LABELS[d])||d);
    b.innerHTML=(typeof _cadreHtml==='function')?_cadreHtml(d):'';
    b.innerHTML+='<button class="btn btn-red ft-press" style="width:100%;margin-top:14px;padding:14px;font-size:15px;" '
      +'onclick="fermerCadreType();lancerTypeSeance(\''+d+'\')">Créer cette séance 💪</button>';
    ov.classList.add('open');
  }catch(e){}
}
function fermerCadreType(){const o=document.getElementById('ov-cadre-type');if(o)o.classList.remove('open');}
function renderLog(){
  if(!S.wkt) S.wkt={date:today(),exs:[]};
  const d=S.wkt.date||today();
  const txt=document.getElementById('s-date-txt');if(txt)txt.textContent=_fmtWktDate(d);
  const inp=document.getElementById('s-date');
  if(inp){inp.value=d;inp.onchange=()=>{if(inp.value)_setLogDate(inp.value);};}
  /* ⑤ la ligne « Scanner / Importer » suit l'usage (ft-v1024) — voir `_renderImportRow`. */
  try{_renderImportRow();}catch(e){}
  /* 🏋️ Les types de séances : SEULEMENT sur un écran vide (ft-v1026). Dès qu'un exercice
     est posé, ils disparaissent — ils proposent un départ, ils ne commentent pas un travail
     en cours (R24 : jamais en travers). */
  try{
    const _tz=document.getElementById('log-types');
    if(_tz) _tz.innerHTML=(S.wkt&&S.wkt.exs&&S.wkt.exs.length)?'':( (typeof _typeSeanceHtml==='function')?_typeSeanceHtml():'' );
  }catch(e){}
  const hdr=document.getElementById('log-hdr');
  const hasExs=S.wkt&&S.wkt.exs&&S.wkt.exs.length>0;
  if(hdr)hdr.innerHTML='<div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;">'
    +'<span style="font-family:var(--font-cond);font-size:21px;font-weight:800;letter-spacing:-.02em;color:var(--t1);flex:1;">Séance</span>'
    +'<span id="wkt-chrono" style="font-family:\'SF Mono\',ui-monospace,monospace;font-size:14px;font-weight:700;color:'+(_isWktPaused()?'var(--orange)':'var(--t3)')+';letter-spacing:.04em;flex-shrink:0;">'+_fmtElapsed()+'</span>'
    +'<span id="log-hdr-btns" style="display:flex;gap:8px;">'
    +_pauseBtnHtml()
    +(hasExs?'<button onclick="clearWkt()" style="padding:7px 11px;border-radius:10px;border:1px solid rgba(255,45,85,.3);background:rgba(255,45,85,.08);color:var(--red);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">✕</button>':'')
    +(hasExs?'<button onclick="openProgModal()" style="padding:8px 12px;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">📋 Changer</button>':'')
    +'</span>'
    +'</div>';
  _startWktChrono();
  // Refresh immédiat des timers au retour sur l'écran (ne pas attendre le prochain tick)
  if(restIv)_restTick();
  renderCardioBlock();
  renderExBlocks();
}
// ─── SUPERSETS ────────────────────────────────────────────────
function _ssMembers(gid){return S.wkt.exs.map((e,i)=>({e,i})).filter(({e})=>e.group===gid).sort((a,b)=>a.i-b.i);}
function _nextInGroup(ei){const ex=S.wkt.exs[ei];if(!ex||!ex.group)return null;const m=_ssMembers(ex.group);const pos=m.findIndex(({i})=>i===ei);return(pos>=0&&pos<m.length-1)?m[pos+1].i:null;}
function _firstUndoneMember(gid){const m=_ssMembers(gid);for(const {e,i} of m){if(e.sets.some(s=>!s.done))return i;}return null;}
function toggleGroupMode(){_groupMode=!_groupMode;_selectedGroupExs.clear();renderExBlocks();}
function toggleGroupSelect(ei){if(!_groupMode)return;if(_selectedGroupExs.has(ei))_selectedGroupExs.delete(ei);else _selectedGroupExs.add(ei);renderExBlocks();}
function createSuperset(){
  if(_selectedGroupExs.size<2)return;
  const gid='ss'+Date.now();
  _selectedGroupExs.forEach(ei=>{S.wkt.exs[ei].group=gid;S.wkt.exs[ei].groupType='super';});
  const members=_ssMembers(gid);
  if(members.length)_expandedEx=members[0].i;
  _groupMode=false;_selectedGroupExs.clear();
  persist();renderExBlocks();toast('Super Set créé ⚡','success');
}
function dissolveGroup(gid){
  S.wkt.exs.forEach(ex=>{if(ex.group===gid){delete ex.group;delete ex.groupType;}});
  persist();renderExBlocks();toast('Groupe dissous','info');
}
function _roundToGym(kg){return Math.round(kg/2.5)*2.5;}
function createSupersetFrom(ei){
  const gid='ss'+Date.now();
  S.wkt.exs[ei].group=gid;S.wkt.exs[ei].groupType='super';
  _expandedEx=ei;persist();
  _exPickerMode='addToGroup';_addToGroupGid=gid;
  openExPicker();
  toast('Choisis le 2ᵉ exercice de la supersérie','info');
}
// Lie l'exercice avec CELUI DU DESSUS en superset (demande Christophe : « glisser sur le
// précédent »). Ne touche QUE la séance en cours (S.wkt), jamais le programme sauvegardé.
function supersetWithPrev(ei){
  if(!S.wkt||!S.wkt.exs||ei<=0){toast('Aucun exercice au-dessus','info');return;}
  const cur=S.wkt.exs[ei], prev=S.wkt.exs[ei-1];
  if(!cur||!prev)return;
  if(cur.dropset||prev.dropset){toast('Impossible avec un dropset','info');return;}
  // Réutilise le superset du dessus s'il existe (→ tri-set), sinon en crée un neuf.
  let gid=(prev.group&&prev.groupType==='super')?prev.group:null;
  if(!gid){gid='ss'+Date.now();prev.group=gid;prev.groupType='super';}
  cur.group=gid;cur.groupType='super';
  _expandedEx=ei-1;
  persist();renderExBlocks();
  toast('Superset créé ⚡','success');
}
// ─── Superset par GLISSER-DÉPOSER (demande Christophe) ───────────────────────
// On glisse un exercice (via la poignée ⠿) sur un autre → superset entre les deux.
// Ne démarre QUE depuis la poignée (touch-action:none) → n'affecte ni le scroll,
// ni le swipe entre onglets, ni les champs de saisie.
function _dropSuperset(dragEi, targetEi){
  if(!S.wkt||!S.wkt.exs||dragEi===targetEi)return;
  const exs=S.wkt.exs, drag=exs[dragEi], target=exs[targetEi];
  if(!drag||!target)return;
  if(drag.dropset||target.dropset){toast('Impossible avec un dropset','info');return;}
  if(drag.group&&drag.group===target.group){toast('Déjà en superset ensemble','info');return;}
  // Groupe : réutilise celui de la cible si c'est déjà un superset, sinon en crée un neuf
  let gid=(target.group&&target.groupType==='super')?target.group:null;
  if(!gid){gid='ss'+Date.now();target.group=gid;target.groupType='super';}
  drag.group=gid;drag.groupType='super';
  // Rendre contigu : retirer le dragué puis le réinsérer après le dernier membre du groupe
  exs.splice(dragEi,1);
  let insertAt=exs.indexOf(target)+1;
  while(insertAt<exs.length&&exs[insertAt].group===gid)insertAt++;
  exs.splice(insertAt,0,drag);
  _expandedEx=null;
  persist();renderExBlocks();
  if(navigator.vibrate)navigator.vibrate(30);
  toast('Superset créé ⚡','success');
}
// Poignée de glissement (icône SVG 6 points — visible partout, contrairement au braille)
function _gripHtml(ei){
  return `<span class="ex-grip" title="Glisser sur un autre exercice pour créer un superset" ontouchstart="_exDragStart(event,${ei})" onmousedown="_exDragStart(event,${ei})" onclick="event.stopPropagation()"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display:block;pointer-events:none;"><circle cx="5.5" cy="3.5" r="1.5"/><circle cx="10.5" cy="3.5" r="1.5"/><circle cx="5.5" cy="8" r="1.5"/><circle cx="10.5" cy="8" r="1.5"/><circle cx="5.5" cy="12.5" r="1.5"/><circle cx="10.5" cy="12.5" r="1.5"/></svg></span>`;
}
let _dragEx=null; // { ei, ghost, overEi }
function _exDragStart(e,ei){
  if(_groupMode)return;
  const ex=S.wkt&&S.wkt.exs&&S.wkt.exs[ei];
  if(!ex||ex.dropset)return;
  e.preventDefault();e.stopPropagation();
  const pt=e.touches?e.touches[0]:e;
  const ghost=document.createElement('div');
  ghost.className='ex-drag-ghost';ghost.textContent=ex.name;
  document.body.appendChild(ghost);
  _dragEx={ei,ghost,overEi:null};
  _exDragMoveTo(pt.clientX,pt.clientY);
  document.addEventListener('touchmove',_exDragMove,{passive:false});
  document.addEventListener('touchend',_exDragEnd);
  document.addEventListener('touchcancel',_exDragEnd);
  document.addEventListener('mousemove',_exDragMove);
  document.addEventListener('mouseup',_exDragEnd);
  if(navigator.vibrate)navigator.vibrate(15);
}
function _exDragMoveTo(x,y){
  if(!_dragEx)return;
  _dragEx.ghost.style.left=x+'px';_dragEx.ghost.style.top=y+'px';
  // elementsFromPoint (pluriel) : robuste si un élément flottant recouvre le bloc
  let block=null;
  const stack=document.elementsFromPoint(x,y);
  for(let s=0;s<stack.length;s++){const c=stack[s].closest?stack[s].closest('.ex-block'):null;if(c){block=c;break;}}
  document.querySelectorAll('.ex-block.drag-over').forEach(b=>b.classList.remove('drag-over'));
  let overEi=null;
  if(block&&block.id&&block.id.indexOf('ex-block-')===0){
    const tei=parseInt(block.id.slice(9));
    if(!isNaN(tei)&&tei!==_dragEx.ei){block.classList.add('drag-over');overEi=tei;}
  }
  _dragEx.overEi=overEi;
}
function _exDragMove(e){
  if(!_dragEx)return;
  e.preventDefault();
  const pt=e.touches?e.touches[0]:e;
  _exDragMoveTo(pt.clientX,pt.clientY);
}
function _exDragEnd(){
  if(!_dragEx)return;
  const over=_dragEx.overEi, dragEi=_dragEx.ei, ghost=_dragEx.ghost;
  document.removeEventListener('touchmove',_exDragMove);
  document.removeEventListener('touchend',_exDragEnd);
  document.removeEventListener('touchcancel',_exDragEnd);
  document.removeEventListener('mousemove',_exDragMove);
  document.removeEventListener('mouseup',_exDragEnd);
  if(ghost&&ghost.parentNode)ghost.parentNode.removeChild(ghost);
  document.querySelectorAll('.ex-block.drag-over').forEach(b=>b.classList.remove('drag-over'));
  _dragEx=null;
  if(over!==null&&over!==dragEi)_dropSuperset(dragEi,over);
}
let _addToGroupGid=null;
// ─── DROPSET / PYRAMIDE ─────────────────────────────────────────────────────
let _dropCfgEi=null,_dropCfgPaliers=3,_dropCfgPct=20,_dropCfgDir='down';
function openDropsetConfig(ei,dir){
  dir=dir||'down';
  _dropCfgEi=ei;_dropCfgDir=dir;_dropCfgPaliers=3;_dropCfgPct=dir==='up'?10:20;
  let ov=document.getElementById('ov-drop-cfg');
  if(!ov){ov=document.createElement('div');ov.className='overlay';ov.id='ov-drop-cfg';ov.onclick=function(e){if(e.target===ov)closeDropCfg();};document.body.appendChild(ov);}
  _renderDropCfg(ov);ov.classList.add('open');
}
function _renderDropCfg(ov){
  const isDown=_dropCfgDir==='down';
  const pctOpts=isDown?[10,15,20,25,30]:[5,10,15,20];
  const bStyle=(sel)=>`flex:1;padding:10px 2px;border-radius:10px;border:2px solid ${sel?'var(--orange)':'var(--sep)'};background:${sel?'rgba(255,109,0,.12)':'var(--bg3)'};color:${sel?'var(--orange)':'var(--t2)'};font-weight:800;font-size:14px;cursor:pointer;transition:.1s;touch-action:manipulation;`;
  ov.innerHTML=`<div class="modal" style="width:min(400px,94vw);padding:20px 16px;">`
    +`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">`
    +`<span style="font-weight:800;font-size:16px;color:var(--t1);">${isDown?'📉 Dropset':'📈 Pyramide +'}</span>`
    +`<button onclick="closeDropCfg()" style="background:var(--bg3);border:none;width:30px;height:30px;border-radius:50%;font-size:15px;cursor:pointer;color:var(--t2);display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">✕</button>`
    +`</div>`
    +`<div style="font-size:12px;color:var(--t2);margin-bottom:14px;line-height:1.5;">${isDown?'Baisse le poids à chaque palier sans repos — repos unique après le dernier drop.':'Monte le poids à chaque palier avec repos normal entre les séries.'}</div>`
    +`<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px;">Nombre de paliers</div>`
    +`<div style="display:flex;gap:8px;margin-bottom:16px;">`
    +[2,3,4,5].map(n=>`<button style="${bStyle(_dropCfgPaliers===n)}" onclick="_dropCfgPaliers=${n};_renderDropCfg(document.getElementById('ov-drop-cfg'))">${n}</button>`).join('')
    +`</div>`
    +`<div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px;">${isDown?'Baisse par palier':'Hausse par palier'}</div>`
    +`<div style="display:flex;gap:6px;margin-bottom:20px;">`
    +pctOpts.map(p=>`<button style="${bStyle(_dropCfgPct===p)}" onclick="_dropCfgPct=${p};_renderDropCfg(document.getElementById('ov-drop-cfg'))">${isDown?'−':'+'}${p}%</button>`).join('')
    +`</div>`
    +`<button onclick="applyDropset()" style="width:100%;padding:14px;border-radius:12px;background:var(--red);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation;">Créer le ${isDown?'dropset':'pyramide'}</button>`
    +`</div>`;
}
function closeDropCfg(){const ov=document.getElementById('ov-drop-cfg');if(ov)ov.classList.remove('open');}
function applyDropset(){
  closeDropCfg();
  const ei=_dropCfgEi;
  if(ei===null||!S.wkt?.exs[ei])return;
  const ex=S.wkt.exs[ei];
  const baseKg=ex.sets[0]?.kg||(getPrev(ex.name)[0]?.kg)||0;
  const baseReps=ex.sets[0]?.reps||(getPrev(ex.name)[0]?.reps)||8;
  const f=_dropCfgPct/100;const dir=_dropCfgDir;
  const newSets=[];let kg=baseKg;
  for(let i=0;i<_dropCfgPaliers;i++){
    if(i>0)kg=_roundToGym(dir==='down'?kg*(1-f):kg*(1+f));
    newSets.push({kg:kg||0,reps:baseReps,done:false,type:'N'});
  }
  ex.sets=newSets;ex.dropset={paliers:_dropCfgPaliers,pct:_dropCfgPct,direction:dir};
  delete ex.group;delete ex.groupType;
  _expandedEx=ei;persist();renderExBlocks();
  toast((dir==='down'?'Dropset':'Pyramide')+' créé ✓','success');
}
function removeDropset(ei){
  const ex=S.wkt.exs[ei];if(!ex||!ex.dropset)return;
  ex.sets=[{kg:ex.sets[0]?.kg||0,reps:ex.sets[0]?.reps||8,done:false,type:'N'}];
  delete ex.dropset;persist();renderExBlocks();toast('Dropset supprimé','info');
}
function removeFromGroup(ei){
  const gid=S.wkt.exs[ei]?.group;if(!gid)return;
  delete S.wkt.exs[ei].group;delete S.wkt.exs[ei].groupType;
  const left=S.wkt.exs.filter(e=>e.group===gid);
  if(left.length<1)left.forEach(e=>{delete e.group;delete e.groupType;});
  persist();renderExBlocks();toast('Retiré du groupe','info');
}
function moveInGroup(ei,dir){
  const gid=S.wkt.exs[ei]?.group;if(!gid)return;
  const members=_ssMembers(gid);
  const pos=members.findIndex(({i})=>i===ei);
  const swapPos=pos+dir;
  if(swapPos<0||swapPos>=members.length)return;
  const swapEi=members[swapPos].i;
  [S.wkt.exs[ei],S.wkt.exs[swapEi]]=[S.wkt.exs[swapEi],S.wkt.exs[ei]];
  persist();renderExBlocks();
}
// Déplace un exercice (ou tout son superset) vers le haut/bas dans la séance — change l'ordre d'exécution.
// N'affecte QUE la séance en cours (copie) : le programme sauvegardé n'est pas touché.
function moveExBlock(ei,dir){
  if(!S.wkt||!S.wkt.exs)return;
  const exs=S.wkt.exs;
  // Reconstruit les blocs comme le rendu (un superset = un bloc)
  const seen=new Set();const parts=[];
  exs.forEach((ex,i)=>{
    if(seen.has(i))return;
    if(ex.group&&ex.groupType==='super'){const m=_ssMembers(ex.group).map(o=>o.i);m.forEach(x=>seen.add(x));parts.push(m);}
    else{seen.add(i);parts.push([i]);}
  });
  const pIdx=parts.findIndex(p=>p.indexOf(ei)>=0);
  const tgt=pIdx+dir;
  if(pIdx<0||tgt<0||tgt>=parts.length)return; // déjà en haut/bas
  const expandedEx=(_expandedEx!=null&&_expandedEx>=0)?exs[_expandedEx]:null;
  [parts[pIdx],parts[tgt]]=[parts[tgt],parts[pIdx]];
  const newExs=[];parts.forEach(p=>p.forEach(i=>newExs.push(exs[i])));
  S.wkt.exs=newExs;
  if(expandedEx){const ni=newExs.indexOf(expandedEx);if(ni>=0)_expandedEx=ni;} // garde le même exo ouvert
  persist();renderExBlocks();
}
function _groupStatusMeta(ex,pos,total){
  const gt=ex.groupType||'super';
  const done=ex.sets.filter(s=>s.done).length;
  const all=ex.sets.length;
  if(gt==='drop'){
    const stepLbl=pos===0?'Charge de départ':'Drop −20 %';
    let status;
    if(done>=all)status='✓';
    else if(done>0)status='En cours';
    else status=pos<total-1?'À suivre · sans repos':'À suivre';
    const kg=ex.sets[0]?.kg||null;
    return stepLbl+' · '+status+(kg?' · '+kg+'kg':'');
  }
  let status;
  if(done>=all)status='✓ Terminé';
  else if(done>0)status='En cours ('+done+'/'+all+')';
  else status='À suivre';
  const kg=ex.sets[0]?.kg,reps=ex.sets[0]?.reps;
  return status+(kg&&reps?' · '+reps+'×'+kg:'');
}
function addToGroup(gid){
  const members=_ssMembers(gid);if(!members.length)return;
  const gt=members[0].e.groupType||'super';
  if(gt==='super'){_exPickerMode='addToGroup';_addToGroupGid=gid;openExPicker();return;}
  const last=members[members.length-1];
  const lastKg=last.e.sets.slice(-1)[0]?.kg||0;
  const factor=(gt==='drop'||gt==='pyramid-down')?0.9:1.1;
  const newKg=lastKg?_roundToGym(lastKg*factor):0;
  const t=gt==='drop'?'D':'N';
  const clone={name:last.e.name,sets:[{kg:newKg,reps:last.e.sets[0]?.reps||8,done:false,type:t}],group:gid,groupType:gt};
  S.wkt.exs.splice(last.i+1,0,clone);
  persist();renderExBlocks();
}
function _doAddToGroup(name){
  const gid=_addToGroupGid;_addToGroupGid=null;
  const members=_ssMembers(gid);if(!members.length)return;
  const last=members[members.length-1];
  const newEx={name,sets:[{kg:0,reps:5,done:false,type:'N'}],group:gid,groupType:'super'};
  S.wkt.exs.splice(last.i+1,0,newEx);
  persist();renderExBlocks();toast(name+' ajouté à la supersérie','success');
}
function _renderGroupHtml(gid,members){
  const gt=members[0]?.e?.groupType||'super';
  const count=members.length;
  let label,icon,color,connColor,bgColor;
  if(gt==='drop'){
    icon='📉';label='Série Dégressive';color='#BF5AF2';connColor='rgba(191,90,242,.35)';bgColor='rgba(191,90,242,.07)';
  }else if(gt==='pyramid-up'){
    icon='📈';label='Pyramide +';color='var(--green)';connColor='rgba(0,230,118,.3)';bgColor='rgba(0,230,118,.06)';
  }else if(gt==='pyramid-down'){
    icon='📉';label='Pyramide −';color='var(--gold)';connColor='rgba(255,214,0,.3)';bgColor='rgba(255,214,0,.06)';
  }else{
    icon='⚡';label=count===2?'Super Set':count===3?'Tri-set':'Circuit ('+count+')';color='var(--orange)';connColor='rgba(255,109,0,.3)';bgColor='rgba(255,109,0,.07)';
  }

  // ── Progression / tour ───────────────────────────────────────
  let tourInfo='',dotHtml='',bannerHtml='',progressBarHtml='';
  if(gt==='super'){
    const totalTours=Math.max(...members.map(({e})=>e.sets.length),1);
    let completedTours=0;
    for(let t=0;t<totalTours;t++){
      if(members.every(({e})=>e.sets[t]?.done))completedTours=t+1; else break;
    }
    const curTour=Math.min(completedTours+1,totalTours);
    const doneThisTour=members.filter(({e})=>e.sets[completedTours]?.done).length;
    const dotsMax=Math.min(totalTours,10);
    let dots='';
    for(let t=0;t<dotsMax;t++){
      if(t<completedTours)dots+=`<span style="color:#34D399;font-size:7px;line-height:1;">●</span>`;
      else if(t===completedTours)dots+=`<span style="color:${color};font-size:7px;line-height:1;">●</span>`;
      else dots+=`<span style="color:var(--sep);font-size:7px;line-height:1;">●</span>`;
    }
    if(totalTours>10)dots+=`<span style="font-size:9px;color:var(--t3);">+${totalTours-10}</span>`;
    dotHtml=`<div style="display:flex;align-items:center;gap:2px;">${dots}</div>`;
    tourInfo=`<div style="font-size:12px;color:var(--t2);margin-top:2px;">Tour ${curTour} sur ${totalTours} · ${count} exercice${count>1?'s':''}${doneThisTour>0?' · '+doneThisTour+'/'+count+' fait ce tour':''}</div>`;
    const lastName=members[members.length-1].e.name;
    const shortLast=lastName.length>22?lastName.slice(0,20)+'…':lastName;
    bannerHtml=`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:${bgColor};border-top:1px solid ${connColor};border-radius:0 0 10px 10px;">`
      +`<span style="font-size:13px;flex-shrink:0;">⚡</span>`
      +`<span style="font-size:12px;color:var(--t2);line-height:1.4;">Enchaîne les ${count} sans repos — le chrono démarre après <strong style="color:var(--t1);">${shortLast}</strong>.</span>`
      +`</div>`;
    // ── Barre de progression à segments ─────────────────────────
    const nbSegs=Math.min(totalTours,20);
    let segs='';
    for(let t=0;t<nbSegs;t++){
      if(t<completedTours){
        segs+=`<div style="flex:1;height:6px;border-radius:3px;background:#35D08A;"></div>`;
      }else if(t===completedTours){
        const pct=count>0?Math.round(doneThisTour/count*100):0;
        segs+=`<div style="flex:1;height:6px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,.10);">`
          +`<div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#35D08A,var(--red));"></div>`
          +`</div>`;
      }else{
        segs+=`<div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.10);"></div>`;
      }
    }
    progressBarHtml=`<div style="display:flex;gap:3px;padding:5px 10px 4px;background:rgba(255,109,0,.04);">${segs}</div>`;
  }else if(gt==='drop'){
    const doneSteps=members.filter(({e})=>e.sets.some(s=>s.done)).length;
    let dots='';
    members.forEach(({e},i)=>{
      const done=e.sets.some(s=>s.done);
      const isCur=!done&&members.slice(0,i).every(({e:pe})=>pe.sets.some(s=>s.done));
      if(done)dots+=`<span style="color:#34D399;font-size:7px;line-height:1;">●</span>`;
      else if(isCur)dots+=`<span style="color:${color};font-size:7px;line-height:1;">●</span>`;
      else dots+=`<span style="color:var(--sep);font-size:7px;line-height:1;">●</span>`;
    });
    dotHtml=`<div style="display:flex;align-items:center;gap:2px;">${dots}</div>`;
    tourInfo=`<div style="font-size:12px;color:var(--t2);margin-top:2px;">Palier ${Math.min(doneSteps+1,count)} sur ${count}</div>`;
    bannerHtml=`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:${bgColor};border-top:1px solid ${connColor};border-radius:0 0 10px 10px;">`
      +`<span style="font-size:13px;flex-shrink:0;">⬇️</span>`
      +`<span style="font-size:12px;color:var(--t2);line-height:1.4;">Baisse le poids sans repos — le chrono démarre après le <strong style="color:var(--t1);">dernier drop</strong>.</span>`
      +`</div>`;
  }

  const body=members.map(({e,i},pos)=>{
    const conn=pos<members.length-1
      ?`<div style="height:12px;display:flex;align-items:center;padding:0 20px;"><div style="flex:1;border-top:1px dashed ${connColor};"></div><span style="margin:0 6px;font-size:11px;color:${connColor};line-height:1;">↓</span><div style="flex:1;border-top:1px dashed ${connColor};"></div></div>`:`` ;
    return _renderExHtml(i,true,pos,members.length)+conn;
  }).join('');

  const addLabel=gt==='super'?'+ Exo':'+ Step';
  return`<div class="ss-group">`
    +`<div class="ss-grp-hdr">`
    +`<div style="flex:1;min-width:0;">`
    +`<div style="display:flex;align-items:center;gap:6px;">`
    +`<span style="font-size:11px;font-weight:800;color:${color};letter-spacing:.05em;text-transform:uppercase;">${icon} ${label}</span>`
    +dotHtml
    +`</div>`+tourInfo
    +`</div>`
    +`<div style="display:flex;gap:4px;flex-shrink:0;">`
    +`<button class="btn-xs" style="color:${color};font-size:11px;" onclick="addToGroup('${gid}')">${addLabel}</button>`
    +`<button class="btn-xs" style="color:var(--t3);font-size:11px;" onclick="dissolveGroup('${gid}')">Dégrouper</button>`
    +`</div></div>`
    +progressBarHtml
    +`<div style="padding:6px 6px 0;">${body}</div>`
    +bannerHtml
    +`</div>`;
}
function _renderExHtml(ei,inGroup,posInGroup,groupSize,blockIdx,blockCount){
  if(posInGroup===undefined)posInGroup=0;
  if(groupSize===undefined)groupSize=1;
  const ex=S.wkt.exs[ei];
  const exCount=S.wkt.exs.length;
  const prev=getPrev(ex.name);
  const prevAl=_prevAligne(prev, ex.sets);   // rapprochement PAR RÔLE (voir _prevAligne)
  const doneSets=ex.sets.filter(s=>s.done);
  // ⚠️ Même règle que le tonnage de la séance : un unilatéral compte double (la série se
  // refait de l'autre côté). Si ce chiffre-ci ne doublait pas, l'exercice et la séance
  // afficheraient deux tonnages différents pour le même travail — et c'est toujours celui
  // qu'on ne comprend pas qui fait douter du reste.
  const _uni=(typeof estUnilateral==='function')&&estUnilateral(ex.name);
  const vol=doneSets.reduce((a,s)=>a+(s.kg||0)*(s.reps||0),0)*(_uni?2:1);
  const _uniTag=_uni?`<span class="uni-tag" onclick="event.stopPropagation();openUniHelp('${_escAttrJs(ex.name)}')">🔀 ${uniLabel(ex.name)}</span>`:'';
  const maxRM=doneSets.filter(s=>s.kg&&s.reps).reduce((b,s)=>Math.max(b,bz(s.kg,s.reps)),0);
  const _cThumb=_exImg(ex.name)||_exMuscleImg(ex.name); // vignette repliée : photo/gif sinon muscle deviné
  const _cReal=!!_exImg(ex.name);
  const _cThumbHtml=(!_groupMode&&!inGroup)?`<img src="${_cThumb}" draggable="false" onclick="toggleExGif(${ei},'${_escAttrJs(ex.name)}');event.stopPropagation()" style="width:40px;height:40px;object-fit:${_cReal?'cover':'contain'};${_cReal?'':'padding:2px;background:var(--bg2);'}border-radius:8px;flex-shrink:0;border:1px solid var(--sep);margin-right:9px;cursor:pointer;" loading="lazy">`:'';
  // En mode sélection, tout apparaît replié pour faciliter les taps
  // S.expandAll (option « tout dérouler », retour Emma) : tous les exercices ouverts en même temps
  const isExpanded=!_groupMode&&(S.expandAll||ei===_expandedEx||exCount===1);
  const isSelected=_groupMode&&_selectedGroupExs.has(ei);
  const nextEi=ex.group?_nextInGroup(ei):null;
  const nextExName=nextEi!==null?S.wkt.exs[nextEi].name:null;

  /* ⚡ LE BANDEAU D'INTENSITÉ — il doit être lisible AU MOMENT de faire l'exercice, pas
     seulement au chargement de la séance : un toast disparaît avant la 1ʳᵉ série.
     ⛔ ET IL DIT LE CALCUL, PAS UN VERDICT. « 88 % de ton 1RM » se vérifie ; « attention,
     c'est trop lourd » ne se vérifie pas et se lit comme un ordre (R29 : informer sans
     décider). La personne a tout ce qu'il faut pour trancher elle-même. */
  const _intensiteBandeau=(ex)=>{
    // 🛡️ ft-v989 : `seanceWarn` (blessures/exclusions/doublons, la validation unique) se lit
    // ICI AUSSI — même mécanique que `intensiteWarn`, pas un 2ᵉ bandeau (R2/R13). Les lignes
    // de `seanceWarn` portent déjà leur icône (🚫/🛡️/🔁), pas de préfixe supplémentaire.
    const d1=(ex&&Array.isArray(ex.intensiteWarn))?ex.intensiteWarn.map(t=>'⚡ '+t):[];
    const d2=(ex&&Array.isArray(ex.seanceWarn))?ex.seanceWarn:[];
    const d=d1.concat(d2);
    if(!d.length) return '';
    const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<div style="font-size:11.5px;color:var(--orange);line-height:1.45;padding:0 10px 7px;word-break:break-word;" onclick="event.stopPropagation()">${d.map(esc).join('<br>')}</div>`;
  };
  // Vue réduite
  if(!isExpanded){
    const _dsLbl=ex.dropset?'palier':'série';
    const summary=`${doneSets.length}/${ex.sets.length} ${_dsLbl}${ex.sets.length>1?'s':''}${ex.dropset?' · '+ex.dropset.paliers+'P '+(ex.dropset.direction==='down'?'⬇':'⬆'):''}${vol>0?' · '+Math.round(vol)+'kg':''}${maxRM>0?' · ~'+fmt(maxRM)+'kg 1RM':''}`;
    /* ⚠️⚠️ LES PARENTHÈSES NE SONT PAS COSMÉTIQUES — elles corrigent un vrai défaut (ft-v1028).
       C'était écrit `ex.note ? '…' : '' + _intensiteBandeau(ex)`, que JavaScript lit
       `ex.note ? '…' : ('' + _intensiteBandeau(ex))`. 👉 **Un exercice qui portait une consigne
       PERDAIT son bandeau** — or ce bandeau ne porte pas que l'intensité : `seanceWarn` y met les
       🚫 exclusions et les 🛡️ blessures, c'est-à-dire la sortie du Gardien au niveau de la séance.
       Et ce sont précisément les exercices venus d'un PROGRAMME qui ont une consigne : l'avertissement
       disparaissait donc là où il était le plus attendu. Rien ne le signalait — pas d'erreur, juste
       un bloc absent. */
    const notePreview=(ex.note?`<div style="font-size:11.5px;color:var(--gold);font-style:italic;line-height:1.4;padding:0 10px 7px;word-break:break-word;" onclick="event.stopPropagation()">💬 ${(ex.note||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}${_tempoChip(ex)}</div>`:'')
      + _intensiteBandeau(ex);
    const selStyle=isSelected?'box-shadow:inset 0 0 0 2px var(--orange);':(!_groupMode?'opacity:.75':'');
    const clickAttr=_groupMode
      ?` onclick="toggleGroupSelect(${ei})" style="cursor:pointer;${selStyle}"`
      :` onclick="toggleExBlock(${ei})" style="cursor:pointer;${selStyle}"`;
    return`<div class="ex-block${inGroup?(isExpanded?' ss-active':' ss-inactive'):''}" id="ex-block-${ei}"${clickAttr}>`
      +`<div class="ex-hdr" style="pointer-events:${_groupMode||inGroup?'none':'all'};align-items:center;">`
      +_cThumbHtml
      +`<div style="flex:1;min-width:0;">`
      +`<div class="ex-name" style="font-size:14px">${_escNote(ex.name)}${_uniTag} <span style="color:${isSelected?'var(--orange)':'var(--t3)'};font-weight:400;font-size:13px">${_groupMode?(isSelected?'✓':'○'):'▸'}</span></div>`
      +`<div class="ex-meta">${inGroup?_groupStatusMeta(ex,posInGroup,groupSize):(summary||'0 série')}</div>`
      +`</div>`
      +(!_groupMode&&!inGroup?`<div class="ex-hdr-btns" style="pointer-events:auto" onclick="event.stopPropagation()">`
        +((!ex.group&&!ex.dropset&&exCount>1)?_gripHtml(ei):'')
        +((blockCount>1)?`<button class="btn-xs" style="color:var(--t2);padding:4px 7px;${blockIdx===0?'opacity:.25;pointer-events:none;':''}" onclick="event.stopPropagation();moveExBlock(${ei},-1)" title="Monter">↑</button><button class="btn-xs" style="color:var(--t2);padding:4px 7px;${blockIdx===blockCount-1?'opacity:.25;pointer-events:none;':''}" onclick="event.stopPropagation();moveExBlock(${ei},1)" title="Descendre">↓</button>`:'')
        +`<button class="btn-xs" style="color:var(--t2);" onclick="openExHistory('${_escAttrJs(ex.name)}')">📊</button><button class="btn-xs" style="color:var(--red);transition:opacity .1s,transform .1s;" ontouchstart="_rmHoldStart(this,${ei});event.preventDefault()" ontouchend="_rmHoldEnd(this)" ontouchcancel="_rmHoldEnd(this)" onmousedown="_rmHoldStart(this,${ei})" onmouseup="_rmHoldEnd(this)" onmouseleave="_rmHoldEnd(this)">✕</button></div>`:'')
      +`</div>`
      +notePreview
      +(!_groupMode&&!inGroup&&!ex.group&&!ex.dropset
        ?`<div style="display:flex;gap:4px;padding:2px 8px 6px;border-top:1px solid var(--sep);" onclick="event.stopPropagation()">`
          +`<button class="btn-xs" style="font-size:10px;color:var(--orange);border-color:rgba(255,109,0,.2);padding:2px 7px;" onclick="createSupersetFrom(${ei})">⚡ Super</button>`
          +`<button class="btn-xs" style="font-size:10px;color:#BF5AF2;border-color:rgba(191,90,242,.2);padding:2px 7px;" onclick="openDropsetConfig(${ei},'down')">📉 Drop</button>`
          +`<button class="btn-xs" style="font-size:10px;color:var(--green);border-color:rgba(0,230,118,.2);padding:2px 7px;" onclick="openDropsetConfig(${ei},'up')">📈 +%</button>`
          +`</div>`
        :'')
      +`</div>`;
  }

  // Vue développée
  const _exImgSrc=_exImg(ex.name);const hasLocalGif=!!_exImgSrc;
  const _thumbSrc=_exImgSrc||_exMuscleImg(ex.name); // toujours une vignette (photo/gif, sinon muscle deviné)
  const rows=ex.sets.map((set,si)=>{
    const p=prevAl[si];
    const liveRM=set.kg&&set.reps?fmt(bz(set.kg,set.reps)):null;
    return`<div id="sr-wrap-${ei}-${si}">`
      +`<div class="set-row${set.done?' done-row':''}" id="sr-${ei}-${si}">`
      +`<div class="snum">${si+1}</div>`
      +`<div class="sprev" onclick="openSetNote(${ei},${si})" style="cursor:pointer;" title="Ajouter une note">${p?`<div>${p.reps}×${p.kg}${_prevTypeBadge(p)}</div>`:'<div>—</div>'}${_setPrevNote(set,p)}</div>`
      +`<input class="sinp" type="number" value="${set.reps||''}" placeholder="${set.maxi?'max':(p?p.reps:'')}" inputmode="numeric" step="1" enterkeyhint="next" onchange="upSet(${ei},${si},'reps',this.value)" oninput="_onRepsInput(this,${ei},${si})" onfocus="this.select();clearTimeout(_afTimer)" onkeydown="if(event.key==='Enter'){event.preventDefault();clearTimeout(_afTimer);const n=this.nextElementSibling;n.focus();n.select&&n.select();}">`
      +`<input class="sinp" type="number" value="${set.kg||''}" placeholder="${p?p.kg:''}" inputmode="decimal" step="0.5" enterkeyhint="done" onchange="upSet(${ei},${si},'kg',this.value)" oninput="updateRMLive(${ei},${si})" onfocus="this.select()" onkeydown="if(event.key==='Enter'){event.preventDefault();confirmSetAndNext(${ei},${si});}">`
      +`<button class="tbtn ${set.type||'N'}" onclick="cycleType(${ei},${si})" title="${SET_TYPE_LABELS[set.type]||'Normal'}" id="tbtn-${ei}-${si}"><span style="line-height:1">${set.type&&set.type!=='N'?set.type:''}</span><span class="tbtn-rm" id="trm-${ei}-${si}">${set.done&&set.rm1?'~'+fmt(set.rm1):liveRM?'~'+liveRM:''}</span></button>`
      +`<button class="chk${set.done?' done':''}" onclick="toggleSet(${ei},${si})">${set.done?'✓':''}</button>`
      +`</div></div>`;
  }).join('');

  // ─── Override rendu si dropset actif ───────────────────────────────────────
  let useSetsHdr,useRows,useDropBanner='';
  if(ex.dropset){
    const {pct,direction}=ex.dropset;
    const isDown=direction==='down';
    const curPi=ex.sets.findIndex(s=>!s.done);
    useSetsHdr=`<div class="sets-hdr"><span>#</span><span>Palier</span><span>Reps</span><span>KG</span><span></span><span>✓</span></div>`;
    useRows=ex.sets.map((set,si)=>{
      const isDone=set.done;
      const isCur=!isDone&&si===curPi;
      const label=si===0?'Charge de départ':(isDown?`Drop −${pct}%`:`+${pct}%`);
      const isLast=si===ex.sets.length-1;
      const p=prevAl[si];
      if(isCur){
        return`<div id="sr-wrap-${ei}-${si}"><div class="set-row" id="sr-${ei}-${si}" style="background:rgba(255,109,0,.06);">`
          +`<div class="snum" style="color:var(--orange);font-weight:900;">${si+1}</div>`
          +`<div style="font-size:10px;color:var(--orange);font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div>`
          +`<input class="sinp" type="number" value="${set.reps||''}" placeholder="${p?p.reps:''}" inputmode="numeric" step="1" onchange="upSet(${ei},${si},'reps',this.value)" oninput="_onRepsInput(this,${ei},${si})" onfocus="this.select();clearTimeout(_afTimer)">`
          +`<input class="sinp" type="number" value="${set.kg||''}" placeholder="${p?p.kg:''}" inputmode="decimal" step="0.5" onchange="upSet(${ei},${si},'kg',this.value)" oninput="updateRMLive(${ei},${si})" onfocus="this.select()">`
          +`<div></div>`
          +`<button class="chk" onclick="toggleSet(${ei},${si})"></button>`
          +`</div></div>`;
      }else{
        return`<div id="sr-wrap-${ei}-${si}"><div class="set-row${isDone?' done-row':''}" id="sr-${ei}-${si}" style="${!isDone?'opacity:.55;':''}">`
          +`<div class="snum">${si+1}</div>`
          +`<div style="font-size:10px;color:${isDone?'#34D399':'var(--t3)'};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div>`
          +`<div style="text-align:center;font-size:13px;color:${isDone?'var(--t2)':'var(--t3)'};">${set.reps||'?'}</div>`
          +`<div style="text-align:center;font-size:14px;font-weight:700;color:${isDone?'var(--t1)':'var(--t3)'};">${set.kg||'—'}</div>`
          +`<div></div>`
          +`<div style="text-align:center;font-size:${isDone?'14':'10'}px;color:${isDone?'#34D399':'var(--t3)'};">${isDone?'✓':(isLast?'repos':'')}</div>`
          +`</div></div>`;
      }
    }).join('');
    useDropBanner=`<div style="display:flex;align-items:flex-start;gap:6px;padding:8px 10px;background:${isDown?'rgba(191,90,242,.07)':'rgba(0,230,118,.06)'};border-top:1px solid ${isDown?'rgba(191,90,242,.18)':'rgba(0,230,118,.18)'};">`
      +`<span style="font-size:12px;flex-shrink:0;">${isDown?'⬇️':'⬆️'}</span>`
      +`<span style="font-size:11px;color:var(--t2);line-height:1.4;">${isDown?'Baisse le poids sans repos — repos unique après le dernier drop.':'Monte le poids — repos normal entre les séries.'}</span>`
      +`</div>`;
  }else{
    useSetsHdr=`<div class="sets-hdr"><span>#</span><span>Précédent</span><span>Reps</span><span>KG</span><span>Type</span><span>✓</span></div>`;
    useRows=rows;
  }

  // Bandeau "Suite" pour les exos dans un groupe
  const gt=ex.groupType||'super';
  const suiteColor=gt==='drop'?'#BF5AF2':gt==='pyramid-up'?'var(--green)':gt==='pyramid-down'?'var(--gold)':'var(--orange)';
  const suiteIcon=gt==='drop'?'📉':gt==='pyramid-up'?'📈':'→';
  const isLastInSuper=ex.group&&gt==='super'&&nextEi===null;
  const loopTgt=isLastInSuper?_firstUndoneMember(ex.group):null;
  const hasLoop=loopTgt!==null&&loopTgt!==ei;
  const suiteText=nextExName?`${suiteIcon} ${nextExName.length>24?nextExName.slice(0,22)+'…':nextExName}`:hasLoop?'↩ Tour suivant ⏱️':null;
  const suiteBanner=(ex.group&&suiteText)
    ?`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px 2px;font-size:12px;font-weight:700;color:${suiteColor};">`
     +`<span>${suiteText}</span>`
     +`</div>`:`` ;

  return`<div class="ex-block${inGroup?' ss-active':''}" id="ex-block-${ei}">`
    +`<div class="ex-hdr">`
    +`<img src="${_thumbSrc}" draggable="false" onclick="toggleExGif(${ei},'${_escAttrJs(ex.name)}');event.stopPropagation()" style="width:48px;height:48px;object-fit:${hasLocalGif?'cover':'contain'};${hasLocalGif?'':'padding:3px;background:var(--bg2);'}border-radius:8px;flex-shrink:0;cursor:pointer;border:1px solid var(--sep);" loading="lazy">`
    +`<div style="flex:1;min-width:0;">`
    +`<div class="ex-name">${_escNote(ex.name)}${_uniTag} <span style="color:var(--t3);font-weight:400;font-size:13px">▾</span></div>`
    +``
    +`<div class="ex-meta">${doneSets.length}/${ex.sets.length} ${ex.dropset?'palier':'série'}${ex.sets.length>1?'s':''}${ex.dropset?' · '+(ex.dropset.direction==='down'?'⬇':'⬆')+ex.dropset.pct+'%':''}${vol>0?' · '+Math.round(vol)+'kg':''}${maxRM>0?' · 1RM ~'+fmt(maxRM)+'kg':''}</div>`
    +`</div>`
    +`<div style="pointer-events:auto;flex-shrink:0;display:flex;align-items:center;gap:4px;" onclick="event.stopPropagation()">`
    +((!inGroup&&!ex.dropset&&exCount>1)?_gripHtml(ei):'')
    +`<button onclick="openExMenu(${ei},${hasLocalGif})" style="width:34px;height:34px;border-radius:10px;background:var(--bg3);border:1px solid var(--sep);font-size:18px;color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;letter-spacing:2px;line-height:1;">⋯</button>`
    +`</div></div>`
    +`<div id="ex-gif-${ei}" style="display:none;" data-open="0" data-loaded="0"></div>`
    +_intensiteBandeau(ex)          // ⚡ le calcul reste visible aussi dans la carte dépliée
    +useSetsHdr
    +useRows
    +suiteBanner+useDropBanner
    +(()=>{
      const footBtn=ex.dropset
        ?`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="openDropsetConfig(${ei},'${ex.dropset.direction}')">⚙️ Modifier paliers</button>`
        :`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="addSet(${ei})">+ Série</button>${ex.sets.length>1?`<button class="btn-xs" style="color:var(--t3);transition:opacity .1s,transform .1s;" ontouchstart="_rmSetHoldStart(this,${ei});event.preventDefault()" ontouchend="_rmSetHoldEnd(this)" ontouchcancel="_rmSetHoldEnd(this)" onmousedown="_rmSetHoldStart(this,${ei})" onmouseup="_rmSetHoldEnd(this)" onmouseleave="_rmSetHoldEnd(this)">−</button>`:''}`;
      return`<div class="ex-foot">${footBtn}</div>`;
    })()
    +`<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 8px 6px;border-top:1px solid var(--sep);" onclick="event.stopPropagation()">`
    +`<span style="font-size:14px;color:var(--t3);padding-top:5px;flex-shrink:0;">💬</span>`
    +`<textarea id="ex-note-${ei}" rows="1" placeholder="Note perso (trop léger, fatigue, douleur…)" oninput="saveExNote(${ei},this.value);this.style.height='auto';this.style.height=this.scrollHeight+'px'" style="flex:1;resize:none;overflow:hidden;border:none;background:transparent;color:var(--t2);font-size:12px;font-family:inherit;padding:4px 2px;line-height:1.4;min-height:26px;outline:none;caret-color:var(--red);">${(ex.note||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>`
    +_tempoChip(ex)   // 🐢 ce que l'app a COMPRIS de la consigne, à côté de la consigne elle-même
    +`</div>`
    +(!inGroup?(ex.dropset
      ?`<div style="display:flex;gap:5px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--t3);border-color:var(--sep);padding:3px 8px;" onclick="removeDropset(${ei})">✕ Retirer dropset</button>`
        +`</div>`
      :`<div style="display:flex;gap:5px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--orange);border-color:rgba(255,109,0,.3);padding:3px 8px;" onclick="createSupersetFrom(${ei})">⚡ Super</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:#BF5AF2;border-color:rgba(191,90,242,.3);padding:3px 8px;" onclick="openDropsetConfig(${ei},'down')">📉 Drop</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--green);border-color:rgba(0,230,118,.3);padding:3px 8px;" onclick="openDropsetConfig(${ei},'up')">📈 +%</button>`
        +`</div>`)
      :`<div style="display:flex;align-items:center;gap:4px;padding:2px 8px 8px;">`
        +`<button class="btn-xs" style="font-size:11px;padding:3px 7px;${posInGroup===0?'opacity:.3;':''}" onclick="if(${posInGroup}>0)moveInGroup(${ei},-1)">↑</button>`
        +`<button class="btn-xs" style="font-size:11px;padding:3px 7px;${posInGroup===groupSize-1?'opacity:.3;':''}" onclick="if(${posInGroup}<${groupSize-1})moveInGroup(${ei},1)">↓</button>`
        +`<button class="btn-xs" style="font-size:10.5px;color:var(--t3);padding:3px 8px;" onclick="removeFromGroup(${ei})">↩ Retirer</button>`
        +`</div>`)
    +`</div>`;
}
// ─── HISTORIQUE EXERCICE ─────────────────────────────────────
function _getExHistory(name,n){
  const out=[];
  for(const sess of S.sessions){
    const ex=(sess.exs||sess.exercises||[]).find(e=>e.name===name);
    if(!ex)continue;
    const done=(ex.sets||[]).filter(s=>s.done!==false&&(s.kg||0)>0);
    if(!done.length)continue;
    out.push({date:sess.date||'',kg:Math.max(...done.map(s=>s.kg||0))});
    if(out.length>=n)break;
  }
  return out.reverse();
}
function _buildExHistChart(data){
  const W=320,H=110,PX=24,PT=22,PB=20;
  const kgs=data.map(d=>d.kg);
  const lo=Math.min(...kgs),hi=Math.max(...kgs);
  const range=hi===lo?Math.max(hi*0.1,5):hi-lo;
  const loAdj=hi===lo?lo-range/2:lo;
  const n=data.length;
  const px=i=>PX+(n>1?i*(W-2*PX)/(n-1):W/2-PX);
  const py=k=>PT+(1-(k-loAdj)/range)*(H-PT-PB);
  let s=`<svg width="100%" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible;">`;
  if(n>1){
    const area=`M${px(0)},${py(data[0].kg)} `+data.slice(1).map((d,i)=>`L${px(i+1)},${py(d.kg)}`).join(' ')+` L${px(n-1)},${H-PB} L${px(0)},${H-PB} Z`;
    s+=`<path d="${area}" fill="rgba(255,45,85,.08)"/>`;
    const line=data.map((d,i)=>`${i===0?'M':'L'}${px(i)},${py(d.kg)}`).join(' ');
    s+=`<path d="${line}" fill="none" stroke="var(--red)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  data.forEach((d,i)=>{
    const cx=px(i),cy=py(d.kg);
    s+=`<circle cx="${cx}" cy="${cy}" r="4" fill="var(--red)" stroke="var(--bg2)" stroke-width="2"/>`;
    const above=cy>PT+16;
    s+=`<text x="${cx}" y="${above?cy-9:cy+16}" text-anchor="middle" font-size="11" fill="var(--t1)" font-weight="700" font-family="system-ui,sans-serif">${d.kg}kg</text>`;
    const dl=d.date?d.date.split('-').slice(1).reverse().join('/'):'';
    s+=`<text x="${cx}" y="${H-3}" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="system-ui,sans-serif">${dl}</text>`;
  });
  return s+'</svg>';
}
// ─── MENU CONTEXTUEL EXERCICE (⋯) ────────────────────────────────────────────
let _exMenuCtx=null;
function openExMenu(ei,hasGif){
  const ex=S.wkt.exs[ei];if(!ex)return;
  _exMenuCtx={ei,nm:ex.name,hasGif:!!hasGif};
  let ov=document.getElementById('ov-ex-menu');
  if(!ov){
    ov=document.createElement('div');ov.className='overlay';ov.id='ov-ex-menu';
    ov.style.alignItems='flex-end';
    ov.onclick=e=>{if(e.target===ov)closeExMenu();};
    document.body.appendChild(ov);
  }
  const {nm}=_exMenuCtx;
  const safeNm=_escAttrJs(nm);
  const isCustom=(S.customExercises||[]).some(e=>e.n===nm);
  const hasUserPhoto=_hasUserPhoto(nm);
  const mRow=(icon,lbl,action)=>`<button onclick="${action}" style="display:flex;align-items:center;gap:14px;width:100%;padding:13px 18px;background:none;border:none;border-top:1px solid var(--sep);text-align:left;cursor:pointer;touch-action:manipulation;">`
    +`<span style="font-size:19px;width:26px;text-align:center;flex-shrink:0;">${icon}</span>`
    +`<span style="font-size:15px;color:var(--t1);font-weight:500;">${lbl}</span>`
    +`</button>`;
  ov.innerHTML=`<div style="width:100%;max-width:430px;background:var(--bg2);border-radius:16px 16px 0 0;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 30px rgba(0,0,0,.5);">`
    +`<div style="text-align:center;font-size:13px;font-weight:600;color:var(--t2);padding:13px 16px 11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid var(--sep);">${_escNote(nm)}</div>`
    +mRow('🔄','Remplacer l\'exercice',`openExPickerForReplace(${ei})`)
    +((ei>0 && !ex.group && !ex.dropset)?mRow('⚡','Superset avec l\'exercice du dessus',`closeExMenu();supersetWithPrev(${ei})`):'')
    +(hasGif?mRow('🎬','Vidéo / Animation',`closeExMenu();toggleExGif(${ei},'${safeNm}')`):'')
    +(isCustom?mRow('✏️','Modifier l\'exercice',`closeExMenu();openEditCustomEx('${safeNm}')`):'')
    +mRow('📷',hasUserPhoto?'Changer la photo':'Ajouter une photo',`closeExMenu();changeExImg('${safeNm}')`)
    +(hasUserPhoto?mRow('🖼️','Voir la photo',`closeExMenu();_viewExPhoto('${safeNm}')`):'')
    +(hasUserPhoto?mRow('🗑️','Retirer la photo',`closeExMenu();removeExImg('${safeNm}')`):'')
    +mRow('📊','Statistiques',`closeExMenu();openExHistory('${safeNm}')`)
    +mRow('ℹ️','Types de série','closeExMenu();openTypeHelp()')
    +`<button ontouchstart="_rmHoldStart(this,${ei});event.preventDefault()" ontouchmove="event.preventDefault()" ontouchend="_rmHoldEnd(this)" ontouchcancel="_rmHoldEnd(this)" onmousedown="_rmHoldStart(this,${ei})" onmouseup="_rmHoldEnd(this)" onmouseleave="_rmHoldEnd(this)" style="display:flex;align-items:center;gap:14px;width:100%;padding:13px 18px;background:none;border:none;border-top:1px solid var(--sep);text-align:left;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;">`
    +`<span style="font-size:19px;width:26px;text-align:center;flex-shrink:0;">🗑️</span>`
    +`<div style="flex:1;"><div style="font-size:15px;color:var(--red);font-weight:500;">Supprimer l'exercice</div><div style="font-size:11px;color:var(--t3);margin-top:2px;">Maintenir appuyé pour confirmer</div></div>`
    +`</button>`
    +`<button onclick="closeExMenu()" style="display:flex;align-items:center;justify-content:center;width:calc(100% - 32px);margin:10px 16px 0;padding:12px;border-radius:12px;background:var(--bg3);border:none;font-size:15px;font-weight:700;color:var(--t2);cursor:pointer;touch-action:manipulation;">Annuler</button>`
    +`</div>`;
  ov.classList.add('open');
}
function closeExMenu(){const ov=document.getElementById('ov-ex-menu');if(ov)ov.classList.remove('open');}

function openExHistory(name){
  const data=_getExHistory(name,5);
  let el=document.getElementById('ov-ex-hist');
  if(!el){
    el=document.createElement('div');el.className='overlay';el.id='ov-ex-hist';
    el.style.alignItems='flex-end';
    el.onclick=e=>{if(e.target===el)closeExHistory();};
    document.body.appendChild(el);
  }
  const inner=data.length>=2?_buildExHistChart(data)
    :`<div style="text-align:center;padding:20px 0;color:var(--t3);font-size:13px;">Pas encore assez d'historique —<br>reviens après 2 séances !</div>`;
  // Progression des charges en % (1re → dernière séance affichée)
  let progHtml='';
  if(data.length>=2){
    const first=data[0].kg,last=data[data.length-1].kg;
    const diff=Math.round((last-first)*10)/10;
    const pct=first>0?Math.round((last-first)/first*1000)/10:0;
    const col=diff>0?'var(--green)':diff<0?'var(--red)':'var(--t2)';
    const arrow=diff>0?'📈':diff<0?'📉':'➖';
    progHtml=`<div style="text-align:center;margin:-2px 0 12px;font-size:13px;color:var(--t3);line-height:1.5;">`
      +`<b style="color:var(--t1)">${first} kg</b> → <b style="color:var(--t1)">${last} kg</b><br>`
      +`<span style="font-weight:800;color:${col};font-size:14px;">${arrow} ${diff>=0?'+':''}${diff} kg (${pct>=0?'+':''}${pct}%)</span> <span style="font-size:12px;">sur ${data.length} séances</span>`
      +`</div>`;
  }
  el.innerHTML=`<div style="width:100%;max-width:430px;background:var(--bg2);border-radius:16px 16px 0 0;padding:16px 16px 18px;box-shadow:0 -4px 30px rgba(0,0,0,.5);">`
    +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">`
    +`<div style="font-weight:800;font-size:15px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80%;">${_escNote(name)}</div>`
    +`<button onclick="closeExHistory()" style="width:30px;height:30px;border-radius:50%;background:var(--bg3);border:none;font-size:15px;color:var(--t2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;">✕</button>`
    +`</div>${progHtml}${inner}`
    +`<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:6px;">Poids max · 5 dernières séances</div>`
    +`</div>`;
  el.classList.add('open');
}
function closeExHistory(){const el=document.getElementById('ov-ex-hist');if(el)el.classList.remove('open');}

/* 🐢 LA PASTILLE DE TEMPO — ce que l'app a COMPRIS, montré à côté de ce qui l'a produit.
   Pourquoi elle existe : `_tempoSec` (app.js) change désormais la durée et l'intensité comptées
   pour la série. **Un calcul qui change sans que rien ne le dise est indiscernable d'un bug** —
   et surtout, la personne ne pourrait pas corriger sa consigne si elle a été mal lue. C'est la
   doctrine du profil vivant appliquée ici : *ce qu'on ne montre pas ne peut pas être corrigé.*
   ⛔ UN SEUL RENDU pour les deux vues (repliée et dépliée) — deux copies divergeraient (R2).
   ⛔ ET ELLE SE TAIT quand rien n'est chiffrable : pas de pastille « — », pas de « 3 s/rep par
   défaut ». Une pastille absente veut dire « je n'ai rien lu », et c'est la vérité (R29). */
function _tempoChip(ex){
  const t=(typeof _tempoSec==='function'&&ex&&ex.note)?_tempoSec(ex.note):null;
  if(!t)return '';
  const v=(Math.round(t*10)%10===0)?String(Math.round(t)):String(t).replace('.',',');
  return `<div class="tempo-chip" title="Lu dans ta consigne — sert à estimer la durée et l'intensité de la série." onclick="event.stopPropagation()">🐢 ${v} s/rép</div>`;
}
// ── Note par série (dans la colonne « précédent ») ──
function _escNote(t){return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
// Échappe une valeur destinée à un '…' JS DANS un attribut "…" (ex. onclick="f('${_escAttrJs(nom)}')").
// D'abord échappement JS (backslash + apostrophe), puis échappement HTML d'attribut ("<>&) → aucune évasion possible.
function _escAttrJs(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function _setPrevNote(set,p){
  if(set&&set.note)return `<div style="font-size:9.5px;color:var(--gold);line-height:1.2;margin-top:2px;word-break:break-word;">💬 ${_escNote(set.note)}</div>`;
  if(p&&p.note)return `<div style="font-size:9.5px;color:var(--t3);font-style:italic;line-height:1.2;margin-top:2px;word-break:break-word;">💬 ${_escNote(p.note)}</div>`;
  return '';
}
let _setNoteCtx=null;
function openSetNote(ei,si){
  const set=S.wkt&&S.wkt.exs&&S.wkt.exs[ei]&&S.wkt.exs[ei].sets[si];if(!set)return;
  _setNoteCtx={ei,si};
  let ov=document.getElementById('ov-set-note');
  if(!ov){ov=document.createElement('div');ov.className='overlay';ov.id='ov-set-note';ov.onclick=e=>{if(e.target===ov)closeSetNote();};document.body.appendChild(ov);}
  ov.innerHTML=`<div class="modal" style="max-width:360px;">
    <div class="modal-handle"></div>
    <div style="font-weight:900;font-size:16px;margin-bottom:3px;text-align:center;">💬 Note — série ${si+1}</div>
    <div style="font-size:12px;color:var(--t3);text-align:center;margin-bottom:12px;">Une info à retrouver la prochaine fois (réglage machine, sensation, technique…). Elle s'affichera dans « précédent ».</div>
    <textarea id="set-note-ta" rows="3" style="width:100%;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);padding:10px;font-size:15px;font-family:var(--font);resize:none;box-sizing:border-box;outline:none;" placeholder="Ex: cran 4 sur la machine, prise serrée, dos bien calé…">${_escNote(set.note)}</textarea>
    <div style="margin-top:12px;display:flex;gap:8px;">
      ${set.note?`<button class="btn btn-bg2" style="flex:1;color:var(--red);" onclick="deleteSetNote()">🗑 Retirer</button>`:''}
      <button class="btn btn-red" style="flex:2;" onclick="saveSetNote()">Enregistrer</button>
    </div>
  </div>`;
  ov.classList.add('open');
  setTimeout(()=>{const ta=document.getElementById('set-note-ta');if(ta)ta.focus();},80);
}
function closeSetNote(){const ov=document.getElementById('ov-set-note');if(ov)ov.classList.remove('open');_setNoteCtx=null;}
function saveSetNote(){
  if(!_setNoteCtx)return;const {ei,si}=_setNoteCtx;
  const set=S.wkt&&S.wkt.exs&&S.wkt.exs[ei]&&S.wkt.exs[ei].sets[si];if(!set){closeSetNote();return;}
  const ta=document.getElementById('set-note-ta');const v=ta?ta.value.trim():'';
  if(v)set.note=v;else delete set.note;
  persist();closeSetNote();renderExBlocks();
  toast('Note enregistrée 💬','success');
}
function deleteSetNote(){
  if(!_setNoteCtx)return;const {ei,si}=_setNoteCtx;
  const set=S.wkt&&S.wkt.exs&&S.wkt.exs[ei]&&S.wkt.exs[ei].sets[si];if(set)delete set.note;
  persist();closeSetNote();renderExBlocks();
  toast('Note retirée','info');
}

function renderExBlocks(){
  const c=document.getElementById('wkt-exs');
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){
    /* ⚠️ CE MESSAGE DÉSIGNAIT UN BOUTON QUI NE S'APPELAIT PAS COMME ÇA (corrigé le 25/08) :
       il disait « + Ajouter un exercice » alors que le bouton portait « + Ajouter ». Michel :
       *« même le bouton ajouter n'est pas top, plutôt créer sa séance »*. Les deux disent
       désormais la même chose — et ils la disent en termes de ce qu'on VIENT FAIRE (créer une
       séance), pas de la mécanique (ajouter une ligne). */
    /* ⚠️ CE MESSAGE A DÛ ÊTRE RELU (ft-v1026) — il désignait « + Créer ma séance » comme LE
       chemin, alors qu'il y en a maintenant sept : le programme, les 5 types de séance, et
       lui. *Quand on ouvre une porte, on relit ce que disent les panneaux* — la même leçon
       qu'en ft-v1012, où le message envoyait faire un détour juste au-dessus du raccourci.
       ⛔ Et il RÉTRÉCIT : avec les cartes en dessous, l'écran n'est plus vide — un gros bloc
       de texte au milieu du rien était la réponse à un problème qui n'existe plus. */
    c.innerHTML=`<div class="empty">Choisis par quoi tu commences 👇</div>`;
    if(typeof renderLogFinish==='function')renderLogFinish(); // vide le bloc "Terminer la séance" (sinon fantôme après suppression/vidage)
    _syncLogHdrBtns();return;
  }
  const exCount=S.wkt.exs.length;
  if(_expandedEx===null||_expandedEx>=exCount)_expandedEx=exCount-1;

  // Construire l'ordre de rendu (groupes = un seul bloc)
  const seen=new Set();
  const parts=[];
  S.wkt.exs.forEach((ex,ei)=>{
    if(seen.has(ei))return;
    if(ex.group && ex.groupType==='super'){
      const members=_ssMembers(ex.group);
      members.forEach(({i})=>seen.add(i));
      parts.push({type:'group',gid:ex.group,members});
    }else{seen.add(ei);parts.push({type:'single',ei});}
  });

  // Barre de contrôle
  const selCount=_selectedGroupExs.size;
  let topBar='';
  if(_groupMode){
    topBar=`<div style="display:flex;gap:8px;padding:0 0 10px;">`
      +`<button class="btn btn-bg2 btn-sm" style="flex:1;" onclick="toggleGroupMode()">Annuler</button>`
      +(selCount>=2
        ?`<button class="btn btn-sm ft-press" style="flex:2;background:var(--orange);border-color:var(--orange);color:#fff;" onclick="createSuperset()">⚡ Lier en supersérie (${selCount})</button>`
        :`<button class="btn btn-bg2 btn-sm" style="flex:2;opacity:.45;" disabled>Sélectionne 2+ exos</button>`)
      +`</div>`;
  } else if(exCount>=2){
    topBar=`<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:6px;">`
      +`<button class="btn-xs" style="color:var(--t2);border-color:var(--sep);font-size:12px;padding:4px 10px;" onclick="toggleExpandAll()">${S.expandAll?'⊟ Concentration':'⊞ Tout dérouler'}</button>`
      +`<button class="btn-xs" style="color:var(--orange);border-color:rgba(255,109,0,.4);font-size:12px;padding:4px 10px;" onclick="toggleGroupMode()">⚡ Grouper</button>`
      +`</div>`;
  }

  c.innerHTML=topBar+parts.map((part,pIdx)=>{
    if(part.type==='single') return _renderExHtml(part.ei,false,undefined,undefined,pIdx,parts.length);
    return _renderGroupHtml(part.gid,part.members,pIdx,parts.length);
  }).join('');
  // Notes d'exercice affichées EN ENTIER dès le départ (sinon tronquées à 1 ligne jusqu'au 1er tap)
  c.querySelectorAll('textarea[id^="ex-note-"]').forEach(ta=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
  renderLogFinish();
  _syncLogHdrBtns();
}
// ⚠️ LA COLONNE « PRÉCÉDENT » DISAIT « 5×70 » SANS DIRE QUE C'ÉTAIT UN ÉCHAUFFEMENT (ft-v827).
// Retour de Michel, capture à l'appui : « là il n'y a rien de marqué, on ne sait pas si c'est de
// l'échauffement ou un exercice normal ». Et c'est le seul repère qu'on a EN SÉANCE pour savoir
// quoi charger : sans le type, « 5×70 » peut être une série de travail comme une mise en route,
// et on ne peut rien en déduire.
// ⭐ L'INFORMATION ÉTAIT DÉJÀ LÀ : `getPrev` rend les séries COMPLÈTES, avec leur `type`. Le rendu
// n'en gardait que `reps×kg`. Encore une fois, la donnée existait et n'atteignait pas l'écran.
// Le badge reprend la couleur du bouton Type de la même ligne, pour qu'on lise la même chose des
// deux côtés.
function _prevTypeBadge(p){
  const t=p&&p.type;
  if(!t||t==='N') return '';                                  // série normale → rien, pas de bruit
  const col={'É':'var(--blue)','W':'var(--blue)','X':'var(--red)','E':'var(--red)','D':'#BF5AF2'}[t]||'var(--t3)';
  return `<sup style="font-size:9px;font-weight:800;color:${col};margin-left:2px;">${t}</sup>`;
}
/* 🎯 « PRÉCÉDENT » SE LIT PAR RÔLE, PAS PAR POSITION (15/08/2026)
   Capture de Michel, en séance : *« regarde y'a pas une couille là ? »*. Sur ses 6 lignes, les 3
   premières sont une MONTÉE EN CHARGE que l'app venait d'ajouter (5×27,5 · 3×37,5 · 2×50), et la
   colonne Précédent y affichait « 10×52 · 10×56 · 10×60 » — c'est-à-dire ses vraies SÉRIES DE
   TRAVAIL de la dernière fois, collées en face d'un échauffement.
   ⚠️ ET LE PIRE EST PLUS BAS : en insérant 3 lignes en haut, l'app décale TOUT. Sa 1ʳᵉ série de
   travail du jour (8×58) était comparée à la 4ᵉ série d'avant (10×60) au lieu de la 1ʳᵉ (10×52) —
   soit **8 kg d'écart sur le repère qui sert justement à décider quoi charger**.
   *C'est l'app elle-même qui provoque le décalage, en ajoutant les paliers qu'on lui a demandé
   d'ajouter.* R14 : un comportement juste dans un contexte (les séries se suivaient) devient faux
   dans l'autre (on en insère au début). Le rapprochement se fait donc sur le RÔLE de la série :
   échauffement ↔ échauffement, travail ↔ travail, chacun dans son ordre.
   ⚠️ Et si la dernière fois ne contient aucun échauffement (le cas le plus courant — presque
   personne ne les note), la ligne reste VIDE : mieux vaut un tiret qu'un repère faux (R29). */
function _prevAligne(prev, sets){
  const ech = s => !!(s && (s.type==='É' || s.type==='W'));
  const pe=[], pt=[];
  (prev||[]).forEach(s=>{ (ech(s)?pe:pt).push(s); });
  let ie=0, it=0;
  return (sets||[]).map(s=>{
    if(ech(s)){ const p = pe[ie] || pe[pe.length-1] || null; ie++; return p; }
    const p = pt[it] || pt[pt.length-1] || null; it++; return p;
  });
}
function getPrev(name){
  for(const s of S.sessions){
    const ex=(s.exs||s.exercises||[]).find(e=>e.name===name);
    if(ex){const sets=(ex.sets||[]).filter(s=>s.done!==false);if(sets.length)return sets;}
  }return[];
}
function upSet(ei,si,f,v){const s=S.wkt.exs[ei].sets[si];s[f]=parseFloat(v)||0;if(s.kg&&s.reps)s.rm1=bz(s.kg,s.reps);persist();}
function toggleSet(ei,si){
  const set=S.wkt.exs[ei].sets[si];
  const row=document.getElementById(`sr-${ei}-${si}`);
  if(row){const inps=row.querySelectorAll('.sinp');if(!set.reps&&inps[0])set.reps=parseInt(inps[0].value||inps[0].placeholder)||0;if(!set.kg&&inps[1])set.kg=parseFloat(inps[1].value||inps[1].placeholder)||0;}
  set.done=!set.done;if(set.kg&&set.reps)set.rm1=bz(set.kg,set.reps);
  // ── HORODATAGE DE LA SÉRIE (12/08/2026) ────────────────────────────────────────────
  // ⚠️ POURQUOI : jusqu'ici on écrivait `done=true` et RIEN d'autre — l'app ne savait pas
  // QUAND une série avait été faite. Conséquence : elle ne peut pas distinguer 3 minutes de
  // repos d'un appel téléphonique de 20 minutes, ni s'apercevoir qu'on a oublié d'appuyer
  // sur « Terminer ». Aucune formule ne rattrape une donnée absente (R8) — d'où ce champ.
  // ⚠️ ON STOCKE LA LECTURE DU CHRONO, PAS L'HEURE. Trois raisons, toutes vérifiées :
  //   · `_wktElapsedMs()` retire déjà le temps EN PAUSE → c'est exactement la même horloge
  //     que `sess.duration`, donc les deux ne peuvent pas se contredire (R1/R2) ;
  //   · un entier de secondes (`at:1234`) pèse ~4× moins qu'un horodatage absolu — sur 1500
  //     séances × 20 séries, ce n'est pas un détail (le stockage a déjà saturé le 29/07) ;
  //   · aucune histoire de fuseau horaire ni d'horloge qui recule.
  // ⚠️ Et on ne le pose QUE si un chrono tourne : l'édition d'une séance passée (setup.js) et
  // l'import d'historique créent aussi des séries `done` — leur mettre un `at` inventerait une
  // mesure. Pas de mesure → pas de champ, et la lecture doit savoir s'en passer.
  if(set.done){
    // ⏱️ LA 1ʳᵉ SÉRIE VALIDÉE DÉMARRE LE CHRONO (14/08/2026, règle de Michel). Avant, il
    //    partait à l'ouverture de l'écran — voir le commentaire de `startWorkout`.
    if(S.wkt&&!S.wkt.startTs){ S.wkt.startTs=Date.now(); S.wkt.startHour=new Date().getHours(); }
    if(S.wkt&&S.wkt.startTs) set.at=Math.round(_wktElapsedMs()/1000);
  } else delete set.at;   // dévalidée → l'horodatage n'a plus d'objet
  persist();
  if(set.done){
    const exName=S.wkt.exs[ei].name;
    const isAbdo=EXLIB.some(e=>e.n===exName&&e.g==='Abdominaux');
    const savedPref=(S.exRestPref||{})[exName];
    /* ⚠️⚠️ LE RÉGLAGE « REPOS PAR DÉFAUT » NE SERVAIT À RIEN (trouvé le 17/08/2026)
       Le repli était **90 s EN DUR**, alors que la personne règle son repos par défaut dans son
       Profil (`S.defRest`, 130 s à l'installation). Quelqu'un qui met 180 s voyait donc toujours
       90 s au chrono — *un réglage qui ne produit aucun comportement observable* (R3).
       ⚠️⚠️ ET C'ÉTAIT PIRE QUE ÇA : `S.defRest` est bel et bien lu ailleurs — par le calcul des
       CALORIES (`calcSessionCalories`, app.js) et par le rythme de séance envoyé à MILO
       (`_rythmeSeance`, coach.js). Donc l'app comptait ses calories et construisait ses séances
       en croyant un repos que le chrono n'appliquait pas. *Deux sources pour la même information,
       qui se contredisent* — la famille de bugs la plus vicieuse du projet (R2).
       ⚠️ L'ORDRE COMPTE : une préférence posée sur CET exercice gagne (elle est plus précise),
       puis le réglage de la personne, puis 90 s seulement si elle n'a jamais rien réglé. */
    const defForEx=isAbdo?30:(savedPref||S.defRest||90);
    const restByType={N:defForEx,É:45,X:240,W:45,E:240};
    const restLabels={É:'Échauffement',X:'Récup. à l\'échec',W:'Échauffement',E:'Récup. à l\'échec'};
    const lbl=document.getElementById('rest-label');
    if(lbl)lbl.textContent=restLabels[set.type]||(isAbdo?'Abdos':'');
    _restStep=isAbdo?5:15;
    _restEx=isAbdo?null:exName;
    const mb=document.getElementById('rest-btn-minus');const pb=document.getElementById('rest-btn-plus');
    if(mb)mb.textContent=`−${_restStep}s`;if(pb)pb.textContent=`+${_restStep}s`;
    /* ⏱️ LE REPOS REGARDE CE QUI VIENT APRÈS, PAS SEULEMENT CE QU'ON VIENT DE FAIRE (17/08/2026)
       Michel, pendant sa séance du 16/08 : *« si je supprime un échauffement, le temps de repos ne
       sera pas bon entre les deux »*. Il a raison, et c'est structurel : le repos se lisait sur le
       type de la série qu'on vient de VALIDER — un palier d'échauffement donne 45 s. Or dès que le
       dernier palier est suivi de la première SÉRIE DE TRAVAIL (parce qu'on en a supprimé un, ou
       parce que la montée n'en comptait qu'un), ces 45 s tombent juste avant la série la plus
       lourde de l'exercice. *On enchaîne 130 kg 45 secondes après un palier à 110.*
       👉 Entre deux paliers d'échauffement, 45 s restent justes — on est léger, on veut monter vite.
       Avant une série de TRAVAIL, c'est le repos de travail qui s'applique, quel que soit le type
       de la série qu'on vient de faire.
       ⚠️ On ne touche à rien d'autre : un repos écrit EXPRÈS sur la série (`set.rest`) gagne
       toujours — c'est une décision explicite, elle passe avant toute déduction (R29). Et on ne
       RACCOURCIT jamais : on prend le plus long des deux, donc une récup à l'échec (240 s) suivie
       d'une série de travail garde ses 240 s. */
    const _suite=(S.wkt.exs[ei].sets||[]).slice(si+1).filter(x=>x&&!x.done)[0];
    const _versTravail=!!(_suite && _suite.type!=='É' && _suite.type!=='W');
    const _base=(restByType[set.type]||defForEx);
    const sec=(set.rest>0?set.rest:(_versTravail?Math.max(_base,defForEx):_base));
    // ─── Dropset : avance entre paliers ─────────────────────────────────────
    if(S.wkt.exs[ei].dropset){
      const ds=S.wkt.exs[ei].dropset;
      if(ds.direction==='down'){
        // Pas de repos entre paliers : on passe direct au suivant
        const nextSi=S.wkt.exs[ei].sets.findIndex((s,i)=>i>si&&!s.done);
        if(nextSi!==-1){
          if(navigator.vibrate)navigator.vibrate([30]);
          renderExBlocks();
          setTimeout(()=>{const row=document.getElementById(`sr-${ei}-${nextSi}`);const inp=row&&row.querySelector('.sinp');if(inp){inp.focus();inp.select&&inp.select();}},100);
          return;
        }
        // Dernier palier → repos
        if(lbl)lbl.textContent='📉 Série dégressive terminée';
        startRest(sec);
        if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
        if(navigator.vibrate)navigator.vibrate([50]);
        renderExBlocks();return;
      }
      // Pyramide ↑ : repos normal (fall-through vers logique standard ci-dessous)
    }
    // Groupe (super set)
    const groupType=S.wkt.exs[ei].groupType||'super';
    const _ssNext=_nextInGroup(ei);
    const _scrollTo=idx=>setTimeout(()=>{const el=document.getElementById('ex-block-'+idx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},60);
    if(_ssNext!==null){
      if(navigator.vibrate)navigator.vibrate([30]);
      // Pre-fill poids suivant pour drop/pyramide
      if(groupType!=='super'){
        const lastKg=S.wkt.exs[ei].sets.filter(s=>s.done).slice(-1)[0]?.kg||0;
        if(lastKg&&S.wkt.exs[_ssNext]){
          const factor=groupType==='pyramid-up'?1.1:0.9;
          const newKg=_roundToGym(lastKg*factor);
          S.wkt.exs[_ssNext].sets.forEach(s=>{if(!s.done)s.kg=newKg;});
          persist();
        }
      }
      if(groupType==='super'||groupType==='drop'){
        // Avance immédiate sans repos (super : tour suivant, drop : palier suivant)
        _expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;
      }
      // Pyramide : repos + auto-avance
      // ⚠️ APRÈS `startRest`, jamais avant : `startRest()` appelle `stopRest()`, qui remet
      // `_restDoneCb` à null. Posée avant, la consigne d'avance était effacée aussitôt —
      // ce passage automatique n'a donc JAMAIS fonctionné (trouvé le 11/08 en l'ajoutant
      // pour l'exercice ordinaire). Même correctif aux 3 endroits.
      startRest(sec);
      _restDoneCb=()=>{_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);};
      const lbl=document.getElementById('rest-label');
      if(lbl)lbl.textContent=groupType==='pyramid-up'?'📈 Pyramide +':'📉 Pyramide −';
      if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
      if(navigator.vibrate)navigator.vibrate([50]);
      return;
    } else if(groupType==='drop'&&S.wkt.exs[ei].group){
      // Dernier palier : repos complet
      const lbl=document.getElementById('rest-label');
      if(lbl)lbl.textContent='📉 Série dégressive terminée';
    } else if(groupType==='super'&&S.wkt.exs[ei].group){
      // Dernier exo du tour → retour au 1er exercice du groupe pour le tour suivant
      const gMembers=_ssMembers(S.wkt.exs[ei].group);
      const firstIdx=gMembers[0]?.i??null;
      const hasMore=gMembers.some(({e})=>e.sets.some(s=>!s.done));
      if(firstIdx!==null&&hasMore){
        if(navigator.vibrate)navigator.vibrate([30]);
        _expandedEx=firstIdx;renderExBlocks();
        setTimeout(()=>{const el=document.getElementById('ex-block-'+firstIdx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},80);
        startRest(sec);   // ⚠️ la consigne d'avance se pose APRÈS (startRest efface _restDoneCb)
        _restDoneCb=()=>{const el=document.getElementById('ex-block-'+firstIdx);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
        if(lbl)lbl.textContent='⚡ Tour suivant';
        if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
        if(navigator.vibrate)navigator.vibrate([50]);
        return;
      }
      // Tous les sets du groupe terminés → repos normal sans auto-avance
    }
    // ⏭️ PASSAGE AUTOMATIQUE À L'EXERCICE SUIVANT (ft-v825) — retour de Michel, séance du 10/08 :
    // « quand on finit le premier exercice, ça ne bascule pas automatiquement sur le deuxième ;
    //   là par exemple j'ai fait des soulevés de terre et à la dernière série je suis obligé de
    //   cliquer sur l'exercice suivant ».
    // ⚠️ Le mécanisme EXISTAIT DÉJÀ — mais seulement pour les supersets, les dropsets et les
    // pyramides. L'exercice ordinaire, le cas le plus fréquent de tous, était le seul oublié.
    // On réutilise `_restDoneCb`, le même chemin que la pyramide (R2/R13) plutôt que d'inventer
    // un second mécanisme d'avance qui finirait par diverger de celui-ci.
    // 👉 On avance À LA FIN DU REPOS, pas tout de suite : entre deux exercices on se repose
    //    vraiment, et replier sous ses yeux la série qu'on vient de valider est déroutant.
    /* ⚠️⚠️ « TERMINÉ » NE VEUT PAS DIRE « TOUTES LES LIGNES COCHÉES » (18/08/2026).
       Michel : *« quand je valide ma dernière série de couché, ça devrait se réduire et
       l'exercice d'épaules s'ouvrir en grand »* — et *« je n'ai pas vu le message »* non plus.
       ⭐ REPRODUIT AVANT DE TOUCHER À QUOI QUE CE SOIT : avec toutes les lignes cochées, ça
       marche (message + ouverture du suivant) ; en laissant **les paliers d'ÉCHAUFFEMENT non
       cochés**, `every(s=>s.done)` est faux → aucun message, aucune avance. Or depuis ft-v887
       l'app AJOUTE elle-même ces paliers : quelqu'un qui attaque directement à sa charge de
       travail, ou qui échauffe sans le noter, laisse forcément des lignes vides.
       *C'est l'app qui crée les lignes qui l'empêchent ensuite de conclure.*
       👉 On regarde donc les SÉRIES DE TRAVAIL, pas les lignes : l'exercice est fini quand il
       n'en reste aucune à faire. C'est déjà la définition que le reste de l'app emploie —
       `finishWorkout` exclut É et W du décompte comme des records.
       ⚠️ UNE SÉRIE DE TRAVAIL non cochée bloque toujours (elle peut encore être faite), et un
       exercice qui n'aurait QUE des paliers n'avance pas non plus : sans série de travail
       validée, rien ne dit qu'on en a fini avec lui (R29 — le coût de l'erreur décide). */
    const _estEch = s => !!(s && (s.type==='É' || s.type==='W'));
    const _sets = S.wkt.exs[ei].sets || [];
    const _travailRestant = _sets.some(s => !s.done && !_estEch(s));
    const _travailFait     = _sets.some(s =>  s.done && !_estEch(s));
    const _tousFaits = !_travailRestant && _travailFait;
    let _suiv=null;
    if(_tousFaits && !S.wkt.exs[ei].group){
      for(let k=ei+1;k<S.wkt.exs.length;k++){
        if((S.wkt.exs[k].sets||[]).some(s=>!s.done)){ _suiv=k; break; }
      }
      // ⚠️ On n'enroule PAS vers le début : remonter tout seul à un exercice déjà dépassé
      // serait plus déroutant que de ne rien faire (R29 — le coût de l'erreur décide).
    }
    startRest(sec);
    if(_suiv!==null){
      _restDoneCb=()=>{_expandedEx=_suiv;renderExBlocks();_scrollTo(_suiv);};
      const _lb=document.getElementById('rest-label');
      const _n=String(S.wkt.exs[_suiv].name||'');
      if(_lb&&!_lb.textContent)_lb.textContent='⏭️ Ensuite : '+(_n.length>26?_n.slice(0,25).trim()+'…':_n);
    }
    if(!isAbdo&&[60,90,120].includes(sec))_highlightRestPreset(sec);else _highlightRestPreset(-1);
    if(navigator.vibrate)navigator.vibrate([50]);
  }
  renderExBlocks();
}
function cycleType(ei,si){
  const s=S.wkt.exs[ei].sets[si];
  const cur=SET_TYPES.indexOf(s.type);
  s.type=SET_TYPES[(cur===-1?0:cur+1)%SET_TYPES.length];
  toast(SET_TYPE_LABELS[s.type],'info');persist();renderExBlocks();
}
function openTypeHelp(){document.getElementById('ov-type-help').classList.add('open');}
function closeTypeHelp(){document.getElementById('ov-type-help').classList.remove('open');}
// Aide « exercice unilatéral » — ouverte en tapant la pastille 🔀 d'un exercice.
// Elle répond à la SEULE question qui se pose en salle : quel poids je tape ?
function openUniHelp(nom){
  const s=document.getElementById('uni-help-ex');
  if(s)s.textContent=nom?nom+' — '+(uniLabel(nom)||'par côté'):'';
  document.getElementById('ov-uni-help').classList.add('open');
}
function closeUniHelp(){document.getElementById('ov-uni-help').classList.remove('open');}
let _confirmCb=null,_confirmAltCb=null;
function showConfirm(title,msg,cb,okLabel,altLabel,altCb){
  document.getElementById('confirm-title').textContent=title;
  document.getElementById('confirm-msg').textContent=msg;
  _confirmCb=cb;_confirmAltCb=altCb||null;
  document.getElementById('confirm-ok').textContent=okLabel||'Supprimer';
  document.getElementById('confirm-cancel').textContent=altLabel||'Annuler';
  document.getElementById('ov-confirm').classList.add('open');
}
function closeConfirm(){document.getElementById('ov-confirm').classList.remove('open');_confirmCb=null;_confirmAltCb=null;document.getElementById('confirm-ok').textContent='Supprimer';document.getElementById('confirm-cancel').textContent='Annuler';}
function confirmOk(){const cb=_confirmCb;closeConfirm();if(cb)cb();}
function confirmCancel(){const cb=_confirmAltCb;closeConfirm();if(cb)cb();}
// Fuzzy matching pour la détection de doublons d'exercices
function _normEx(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();}
function _lev(a,b){if(a===b)return 0;const la=a.length,lb=b.length;if(!la)return lb;if(!lb)return la;let row=[...Array(lb+1).keys()];for(let i=1;i<=la;i++){let prev=row[0];row[0]=i;for(let j=1;j<=lb;j++){const t=row[j];row[j]=a[i-1]===b[j-1]?prev:1+Math.min(prev,row[j],row[j-1]);prev=t;}}return row[lb];}
function _findSimilar(name,all){const na=_normEx(name);let best=null,bestD=Infinity;all.forEach(ex=>{const nb=_normEx(ex.n);if(nb===na){best=ex.n;bestD=0;return;}const minL=Math.min(na.length,nb.length);if(minL<5)return;const d=_lev(na,nb);if(d<=1&&d<bestD){best=ex.n;bestD=d;}});return best;}

// ═══ VM — Reconnaissance d'exercices (LOCAL d'abord) ═══════════════════════════
// Rattache un nom d'exercice (importé, mal nommé, marque, variante) à un exercice
// EXLIB existant, SANS IA quand c'est possible : exact → synonyme EN → équivalence
// connue → recouvrement de mots (avec garde-fou sur les modificateurs qui CHANGENT
// le mouvement). Renvoie {match, score, via} ou {match:null} (= exercice nouveau).
// L'IA n'intervient QUE sur les cas ambigus (score dans la zone grise) — pas ici.
const _EX_STOP=new Set(['de','du','des','la','le','les','a','au','aux','en','avec','sur','et','l','d','the','with','on','machine','exercice','musculation','barre','bar','barbell','poulie','cable','halteres','haltere','dumbbell','dumbbells','poids','gym',
  // Bruit COMMERCIAL & marques (noms de salle : « Chest Press Evolution X900 », « Pendulum Elite »…) —
  // ignorés pour la reconnaissance. Vérifié : aucun de ces mots n'apparaît dans un vrai nom EXLIB.
  'evolution','ultra','deluxe','elite','infinite','signature','nitro','extreme','eagle','panther','smartline','station','master','motion','axis','smart','series','edition','plus','pro','max','evo','xt','dual','iso','super',
  'technogym','life','fitness','panatta','matrix','cybex','nautilus','atlantis','watson','rhino','prime','hammerstrength']);
// Groupes de modificateurs MUTUELLEMENT EXCLUSIFS : si deux noms portent chacun un
// membre DIFFÉRENT du même groupe → mouvements distincts → JAMAIS fusionner auto.
const _EX_MODGROUPS=[
  ['incline','inclinee','decline','declinee','couche','couchee','plat','horizontal','horizontale','vertical','verticale','45'], // inclinaison du banc/mouvement
  ['pronation','supination','neutre','marteau','hammer','serree','serre','large','inversee','inverse'], // prise
  ['assis','debout','allonge','genou'],                                 // position du corps
  ['haute','basse','high','low'],                                       // hauteur (poulie / barre) : haute ≠ basse (GPT)
  ['sumo','roumain','conventionnel','conventionnelle','deficit','bulgare','hack','front','arriere','nuque','unilateral','unilaterale','pistol','cossack','sissy','belt','safety','overhead','pendulum'] // variante lourde
];
// Léger : retire un 's' final (pluriel). Symétrique (appliqué des 2 côtés) → ne casse jamais un match.
function _exStem(t){return (t.length>=4 && t.endsWith('s'))?t.slice(0,-1):t;}
// Filtre aussi les CODES MODÈLES (x900, v4, evo9…) — 1-3 lettres suivies de chiffres. Les
// nombres seuls (« 45 ») sont GARDÉS (le 45° du Press Jambes 45° est signifiant).
function _exTokens(s){return _normEx(s).split(' ').filter(t=>t&&!_EX_STOP.has(t)&&!/^[a-z]{1,3}\d+$/.test(t)).map(_exStem);}
const _EX_MODS_ALL=new Set(_EX_MODGROUPS.reduce((a,g)=>a.concat(g),[]));
// Conflit si un membre d'un groupe est présent d'UN seul côté (mouvements distincts).
function _exModConflict(a,b){ for(const grp of _EX_MODGROUPS){ for(const m of grp){ if(a.has(m)!==b.has(m))return true; } } return false; }
// Jaccard entre 2 ensembles de tokens. 0 si conflit de modificateurs, OU si le seul
// recoupement porte sur des modificateurs (il faut au moins un mot CŒUR commun — sinon
// « supination » ferait matcher deux mouvements distincts qui partagent juste la prise).
function _exJac(qset,cset){ if(!cset.size)return 0; if(_exModConflict(qset,cset))return 0;
  let inter=0,core=0; qset.forEach(t=>{if(cset.has(t)){inter++; if(!_EX_MODS_ALL.has(t))core++;}});
  if(!core)return 0; const uni=new Set([...qset,...cset]).size; return uni?inter/uni:0; }

// ─── Taxonomie biomécanique (couche « ontologie du mouvement », GPT) ──────────
// Niveau 1 = SCHÉMA MOTEUR (poussée/tirage vertical/horizontal, squat, hip hinge…),
// dérivé du NOM (0 migration, additif). Sert de garde-fou VM (2 mouvements de
// schémas DIFFÉRENTS ne se fusionnent jamais) et prépare l'analyse « par famille ».
// Niveau 3 = résistance (indicatif). Niveaux 2/4/5 = modificateurs / marques / alias
// (déjà couverts par _EX_MODGROUPS et _EX_EQUIV). Ordre = du + spécifique au + générique.
const _MOV_PATTERNS=[
  {id:'elevation-epaules',label:'Élévation / rotation épaule',kw:['elevation laterale','elevation frontale','oiseau','face pull','tirage visage','y raise','around the world','rotation externe','rotation interne','tirage menton','upright row','haussement','shrug','croix de fer','passage d epaule','passage epaule','wall slide','glissement au mur']},
  {id:'flexion-genou',label:'Flexion de genou (ischios)',kw:['leg curl','curl ischio','ischio','nordic']}, // AVANT curl-biceps (« leg curl » ≠ curl de bras)
  // ⚠️ « jefferson » exclu le 02/08 : le Jefferson Curl est une flexion vertébrale chargée
  // (fessiers + lombaires), pas un curl de bras — le mot-clé « curl » l'attrapait. Trouvé
  // par le croisement schéma × muscles, dès le premier lancement de la famille.
  // ⚠️ `poignet`/`wrist` exclus le 02/08 : « Curl Poignet Barre » était classé en FLEXION DU
  //    COUDE parce que le mot « curl » arrive avant la règle du poignet (premier match gagnant),
  //    alors que « Extension Poignet Barre », lui, était bien rangé. Même partie du corps, deux
  //    schémas. ⭐ La même exclusion avait déjà été posée dans `_MEX` (les muscles) en ft-v669 —
  //    mais pas dans cette table-ci. Un correctif appliqué à une table et pas à sa jumelle.
  {id:'curl-biceps',label:'Flexion du coude (biceps)',kw:['marteau','curl','preacher','biceps'],non:['jefferson','leg curl','ischio','poignet','wrist']},
  // ⚠️ `dips` EXCLU (03/08) : un dips est une POUSSÉE, jamais une extension isolée du coude.
  // Le mot-clé large « triceps » l'attrapait depuis que « Dips Parallèles » a été renommé
  // « Dips Triceps (Buste Droit) » la veille — ajouter un mot dans un nom avait changé son
  // schéma EN SILENCE, et le contrôle de l'empreinte ne l'a pas vu parce qu'un renommage s'y
  // lit comme « un exercice disparu + un nouveau ». C'est EXACTEMENT le défaut qui a motivé
  // l'identifiant stable (le nom ne doit pas piloter les calculs) — pris la main dans le sac.
  {id:'extension-triceps',label:'Extension du coude (triceps)',kw:['extension triceps','barre au front','skull crusher','kickback','pushdown','extension nuque','triceps','tate press'],non:['dips','dip ']},
  {id:'mollets',label:'Extension de cheville (mollets)',kw:['mollet','calf','soleus','tibialis','tib raise']},
  {id:'extension-genou',label:'Extension de genou (quadriceps)',kw:['leg extension','extension quadriceps','quad extension','quad ext','sissy squat']},
  // ⚠️ PAS de mot-clé pour le L-Sit : « l sit » attraperait « wa·ll sit » (Chaise / Wall Sit),
  // qui est un SQUAT isométrique. Même piège que `t.?bar` → « poignet barre » (ft-v669) : la
  // recherche teste aussi SANS bornes, donc un mot-clé de 1-2 lettres est intenable ici. Le
  // L-Sit reste sans schéma — il est de toute façon « accessoire », ce qui est juste.
  // ⚠️ Le SUPERMAN est passé de « charnière de hanche » à « gainage » le 02/08 : on est allongé
  //    à plat ventre, la hanche ne se plie pas — c'est un MAINTIEN en extension, l'équivalent
  //    postérieur de la planche. Il gonflait le compte des charnières dans l'équilibre de séance.
  //    Rangé avec le Bird Dog, qui est exactement de la même nature.
  {id:'gainage-abdos',label:'Gainage / abdominaux',kw:['hollow body','windshield','drapeau','dragon flag','grimpeur','mountain climber','chaise romaine','rotation obliques','rotation machine obliques','gainage','planche','plank','crunch','abdo','releve de jambe','releve de genou','russian twist','sit up','vacuum','roue abdo','ab wheel','bird dog','superman']},
  {id:'hip-hinge',label:'Charnière de hanche (hip hinge)',kw:['tirage en rack','rack pull','souleve de terre','deadlift','good morning','hip thrust','poussee de hanche','glute bridge','pont fessier','roumain','romanian','kettlebell swing','swing','pull through','jefferson','hyperextension','extension lombaire','ghd','glute ham']},
  {id:'fente',label:'Fente',kw:['fente','lunge','split squat','bulgare','montee sur box','step up','cossack']},
  {id:'squat',label:'Squat (flexion hanche+genou)',kw:['squat','press jambe','leg press','hack','pendulum','belt squat','presse a cuisse','wall sit','sled']},
  {id:'poussee-verticale',label:'Poussée verticale (au-dessus de la tête)',kw:['developpe haltere assis','developpe assis','developpe landmine','developpe militaire','militaire','developpe epaule','shoulder press','overhead press','developpe nuque','arnold','developpe assis machine','landmine press','thruster','handstand']},
  {id:'poussee-horizontale',label:'Poussée horizontale (pectoraux)',kw:['developpe couche','bench press','couche','chest press','ecarte','pec deck','pompe','push up','dips','croise poulie','crossover','decline','incline','hex press','svend']},
  {id:'tirage-vertical',label:'Tirage vertical',kw:['tirage poulie haute','tirage vertical','pulldown','lat pull','traction','pull up','tirage nuque','tirage poitrine','rocky pull','muscle up','dead hang','suspension passive']},
  {id:'tirage-horizontal',label:'Tirage horizontal',kw:['tirage iso','iso lateral','rowing','tirage horizontal','tirage poulie basse','seal row','meadows','yates','renegade','bent over','bucheron','pull over','pullover','chariot']},
  // ── Deux schémas ajoutés le 29/07/2026 (ft-v670), sur demande de Michel et d'après la
  // taxonomie de référence (pousser · tirer · flexion de genou · charnière de hanche ·
  // ROTATION · PORTER). Il manquait « porter » et l'explosif : 6 exercices n'avaient
  // AUCUN schéma, donc Milo les appelait « accessoire » par défaut et le garde-fou
  // anti-fusion de l'import était désactivé pour eux.
  {id:'hanche-laterale',label:'Abduction / adduction de hanche',kw:['abduction','adduction','abducteur','adducteur']}, // n'avaient AUCUN schéma → invisibles à l'équilibre de séance (audit 02/08)
  {id:'poignet',label:'Flexion / rotation du poignet',kw:['curl poignet','extension poignet','wrist','pronation','supination','avant-bras','avant bras']},
  {id:'porte',label:'Porté (carry)',kw:['farmer','fermier','porte','carry','yoke','valise','suitcase','overhead carry']},
  // Cardio machines et déplacements : ce ne sont pas des schémas de FORCE, mais les laisser sans
  // schéma les rendait invisibles à l'équilibre de séance (mesuré au dump du 01/08).
  {id:'cardio',label:'Cardio / conditionnement',kw:['air bike','assault bike','ski erg','ergometre de ski','bear crawl','marche de l ours','rameur','tapis','elliptique','velo','battle rope','corde ondulatoire']},
  // ⚠️ Les mouvements EXPLOSIFS sont séparés des sauts : l'arraché et l'épaulé-jeté sont
  // des mouvements PRINCIPAUX (voir _EX_ANCRE_PATTERNS), un burpee ou un box jump est du
  // conditionnement — les mélanger ferait bâtir une séance autour d'un burpee.
  {id:'halterophilie',label:'Haltérophilie (explosif)',kw:['arrache','snatch','epaule jete','epaule barre','clean and jerk','clean jerk','clean','jerk','turkish','get up','thruster']},
  // ⚠️ La CORDE ONDULATOIRE (battle rope) est passée de « saut / pliométrie » à « cardio »
  //    le 02/08 : on n'y saute pas, les pieds ne quittent jamais le sol. C'est le croisement
  //    ⑤ (schéma ⟷ muscles) qui l'a signalé, en voyant un schéma de saut sur un exercice
  //    dont les muscles sont les épaules et le gainage.
  {id:'saut-plyo',label:'Saut / pliométrie',kw:['box jump','saut sur box','burpee','saut a la corde','corde a sauter','jump','plyo','sprint','jumping jack','wall ball']}
];
// Stemme les pluriels MAIS garde tous les mots (ne PAS retirer les mots vides ici :
// sinon un mot-clé « curl haltère » se réduirait à « curl » et matcherait « leg curl »).
function _movNorm(s){return _normEx(s).split(' ').filter(Boolean).map(_exStem).join(' ');}
// ─── 🔥 LA MONTÉE EN CHARGE — CALCULÉE PAR LE CODE (10/08/2026) ───────────────────────────
// Michel, après une vraie séance : Milo lui propose « 70×5 (É) → 130×3 ». Il signale le trou,
// Milo répond « t'as raison, j'ai zappé » — et repropose EXACTEMENT LA MÊME CHOSE. Il a fallu
// que Michel écrive « 60 kg d'un coup » pour qu'il corrige.
//
// ⚠️ MILO N'AVAIT RIEN ZAPPÉ : il a suivi la consigne à la lettre. Elle disait
// « échauffement (mobilité + **1-2 séries légères** de montée en charge) ». Une série légère à
// 70, puis le travail — c'est littéralement ce qui était demandé. *Le problème n'était pas le
// modèle, c'était la consigne* : « 1-2 séries » ne veut rien dire sans la charge. Pour 60 kg
// une suffit ; pour 130 kg il en faut quatre. Un NOMBRE FIXE là où il faut une PROGRESSION.
// Michel : « c'est plus un manque d'informations, donc c'est quelque chose qui manque dans le Code. »
//
// 👉 MÊME MOTIF QUE `_dateAnnoncee` : Milo peut produire un résultat PLAUSIBLE MAIS FAUX que
// l'app enregistre sans pouvoir s'en apercevoir. Quand un calcul est déterministe, il revient
// au CODE, pas au modèle. Ici l'erreur ne coûte pas une date fausse — elle coûte une blessure.
//
// 📚 LES RÈGLES, cherchées et croisées (Starting Strength · Bay Strength · Ironside · Hevy ·
//    Wendler 5/3/1), parce qu'inventer des pourcentages sur un sujet de blessure n'est pas une
//    option — c'est Michel qui a demandé la vérification, et il avait raison :
//    · échauffer avec LE MÊME mouvement ;
//    · partir de 40-50 % de la charge du jour ;
//    · monter par paliers de 10-15 % de cette charge ;
//    · dernier palier à 5-10 % SOUS la charge de travail ;
//    · reps décroissantes (5 → 3 → 2 → 1) ;
//    · 2-3 paliers si léger, 4-5 si lourd — au-delà de 5 on fatigue au lieu de préparer ;
//    · au-delà de 85-90 % de la charge, ce n'est plus un échauffement mais une série de TRAVAIL.
const _MONTEE_SEUIL_KG = 40;
/* ⚖️ LE DÉPART DE LA MONTÉE : 62 % DE LA CHARGE (relevé de 55 % le 15/08/2026)
   Michel : *« c'est normal qu'il me chauffe sur le développé couché, mais en même temps il y a
   beaucoup d'échauffement »*. Le seuil de 55 % était la cause d'un palier de trop : Milo proposait
   50 → 65 → 75 → 83 pour 85 kg (une montée en 4 paliers, 11 répétitions, parfaitement dans les
   clous de la littérature : 3 à 5 paliers, 10 à 25 répétitions). Comme 50 kg vaut **59 %** de 85,
   l'app préposait un 5ᵉ palier à 35 kg.
   ⚠️ AUCUNE SOURCE NE RÉCLAME UN POINT DE DÉPART PRÉCIS. Elles parlent d'écarts de 15-20 % de la
   charge de travail entre paliers — et cet écart-là est déjà contrôlé, séparément, par la règle du
   trou. Le départ ne sert qu'à empêcher qu'on attaque la séance à deux tiers de sa charge, articu-
   lation froide. 62 % accepte une montée qui démarre à 59 % (celles de Milo) et refuse un
   démarrage à 70 %. ⚠️ C'est un JUGEMENT, comme le plancher de 15 kg de la règle du trou — il est
   écrit ici pour qu'on sache quoi rouvrir si un jour il gêne.
   ⚠️ Une seule constante pour les DEUX usages (le reproche et l'insertion d'un palier) : ils
   divergeraient sinon, et l'app jugerait selon une règle qu'elle n'applique pas (R2). */
const _MONTEE_DEPART_MAX = 0.62;          // en dessous, une montée en 4 paliers n'a aucun sens
// ⚠️ On réutilise `_movPattern` plutôt que d'écrire une seconde liste d'exercices (R2/R13) :
// deux listes du même métier finiraient par diverger. Seuls les mouvements POLYARTICULAIRES
// méritent une montée — un curl ou une extension de triceps, non.
const _MOV_MONTEE = ['squat','hip-hinge','poussee-horizontale','poussee-verticale',
                     'tirage-horizontal','tirage-vertical','fente','halterophilie'];

/**
 * Construit la montée en charge pour une charge de travail donnée.
 * @param {number} kgTravail — la charge des séries de travail
 * @param {number} [pas=2.5] — l'arrondi (2,5 kg = disques de 1,25 kg de chaque côté)
 * @returns {Array<{kg:number,reps:number,type:'É'}>} — vide si la charge est trop légère
 */
/* ⚖️ LE PAS DE CHARGE DÉPEND DU MATÉRIEL — 27,5 kg EN HALTÈRES N'EXISTE PAS (15/08/2026)
   Michel : *« dans certaines séries il met 82,5 ; dans une salle c'est chiant de trouver les
   poids de 1,25, je perds du temps de fou. Ensuite les haltères : un poids de 27,5 n'existe pas
   tout simplement. Pareil pour les machines à poulies — donc ou on choisit moins ou plus. »*
   ⚠️ CE N'EST PAS UN DÉTAIL DE CONFORT : une charge impossible à charger, c'est du temps perdu à
   fouiller le râtelier au milieu d'une montée en charge, ou un palier sauté. L'app proposait un
   arrondi unique de **2,5 kg** pour tout le monde et tout le matériel.
   ⭐ LES PAS VIENNENT DE SES PROPRES DONNÉES, pas d'une supposition : sur 31 séances, TOUTES ses
   charges d'haltères à deux bras sont des multiples de **4** (Curl 32·40·44 · Couché 44·52·60·68 ·
   Incliné 36·44·48·52·56·60·64) — soit 2 kg par haltère, additionnés. Ses barres tournent à **5**
   (Squat 20·40·60·70·80·90 · SDT Roumain 40→100), ses machines à **5** aussi.
   ⚠️ ET ON ARRONDIT VERS LE BAS. Pour un ÉCHAUFFEMENT, plus léger n'est jamais un risque, tandis
   que plus lourd fatigue avant la série de travail (R29 : le coût de l'erreur n'est pas
   symétrique). C'est aussi ce que Michel demande : « ou on choisit moins ou plus ».
   ⚠️ Ne s'applique QU'AUX CHARGES QUE L'APP FABRIQUE. Une charge écrite par Milo ou saisie à la
   main n'est jamais retouchée : ce serait décider à sa place (PB-008).
   ⭐⭐ ET C'EST EXACTEMENT CE TROU QUI A FAIT REVENIR MICHEL LE 19/08 : *« il ne compte pas le
   déplacement dans la salle, quand il me met 82,5 faut le trouver les poids de 2,5 »*. La règle
   ci-dessus a bien arrêté les 82,5 dans les paliers que l'APP fabrique — mais **Milo, lui, n'a
   jamais reçu cette table**, donc il continuait d'écrire 82,5 et 27,5. `_pasCharge` n'apparaissait
   nulle part dans `coach.js` (vérifié : 0 occurrence).
   👉 Le correctif n'est PAS d'arrondir Milo après coup — ça, ce serait vraiment décider à sa
   place, et PB-008 tient toujours. C'est de lui DONNER la table pour qu'il écrive 80 ou 85 du
   premier coup (R4 : l'information doit descendre jusqu'à la donnée, ici jusqu'au prompt).
   ⚠️ UNE SEULE TABLE, lue par les deux (R2) : `_PAS_CHARGE_TABLE` ci-dessous. La dupliquer dans
   `coach.js` garantirait qu'un jour l'app arrondit à 4 kg pendant que Milo écrit des 2,5. */
const _PAS_CHARGE_TABLE = {
  libre_uni : 2,    // un seul haltère
  libre     : 4,    // haltères 2 bras : 2 kg par haltère, additionnés
  elast     : 2.5,  // élastiques / TRX / poids du corps : pas de disques, on reste fin
  trx       : 2.5,
  corps     : 2.5,
  autre     : 5     // barre, machine, poulie : 2,5 kg par côté, ou cran de 5
};
function _pasCharge(nom){
  let eq='autre'; try{ eq=_exEquip(nom); }catch(e){}
  let uni=false; try{ uni=(typeof estUnilateral==='function') && estUnilateral(nom); }catch(e){}
  const T=_PAS_CHARGE_TABLE;
  if(eq==='libre') return uni ? T.libre_uni : T.libre;
  if(eq==='elast'||eq==='trx'||eq==='corps') return T[eq];
  return T.autre;
}
/* 🔢 LES RÉPÉTITIONS D'UN PALIER SE LISENT SUR SA CHARGE, PAS SUR SA POSITION (17/08/2026)
   Michel, séance du 16/08, Tirage Poulie Haute : **5 · 3 · 5 · 3 · 3** répétitions en montant en
   charge. *Plus lourd et PLUS de répétitions* : ça ne se fait nulle part, et ça se voit au premier
   coup d'œil. La cause était un `reps:3` **en dur** sur chaque palier inséré, qui ne regardait ni
   la charge ni ses voisins.
   ⚠️⚠️ ET LA 1ʳᵉ CORRECTION ÉTAIT PIRE — mesurée, puis jetée (R30) : faire hériter le palier
   inséré des répétitions de son VOISIN donnait « 70 kg × 1 » au milieu d'une montée vers 130.
   *Un voisin n'est pas une raison ; la charge en est une.* Les sources décrivent une décroissance
   liée à l'INTENSITÉ (5 → 3 → 2 → 1 à mesure qu'on approche de la charge du jour), pas au rang du
   palier. Le résultat est décroissant par construction, quel que soit le nombre de paliers.
   ⚠️ UNE SEULE ÉCHELLE POUR LES DEUX USAGES (le barème complet et le palier inséré) : deux
   barèmes de répétitions finiraient par diverger, et l'app produirait une montée que son propre
   contrôleur juge mauvaise — c'est déjà arrivé le 10/08 sur les charges (R2).
   ⚠️ Le palier au-delà de 85 % rend 1 : c'est exactement ce que `_monteeDefauts` exige (« plus de
   2 reps à 85 % de la charge, c'est déjà une série de travail ») — la règle et le contrôle disent
   la même chose parce qu'ils sont écrits une seule fois. */
function _repsPalier(kg, kgTravail){
  const T = +kgTravail || 0, k = +kg || 0;
  if(!(T > 0)) return 5;
  const pct = k/T;
  if(pct >= 0.85) return 1;
  if(pct >= 0.75) return 2;
  if(pct >= 0.60) return 3;
  return 5;
}
/* 🎯 UNE CHARGE QU'ELLE A DÉJÀ CHARGÉE EXISTE FORCÉMENT (17/08/2026)
   Michel, le 15/08 : *« dans une salle c'est chiant de trouver les poids de 1,25, je perds du
   temps de fou »*, et le 16/08 sur son tirage à la poulie, des charges en 0,5 kg qui ne tombent
   sur aucun cran. Le pas par MATÉRIEL (`_pasCharge`) a réglé les haltères et les barres ; il
   suppose 5 kg pour toutes les machines, et beaucoup de piles ne sont pas sur des 5.
   👉 CE QU'ON FAIT : quand l'app FABRIQUE un palier, elle regarde si la personne a déjà chargé
   une valeur proche (±8 %) sur CET exercice, et prend celle-là. *Une charge qu'elle a déjà mise
   existe forcément sur cette machine* — c'est la preuve la plus solide qu'on puisse avoir, et
   elle ne demande aucune supposition.

   ⛔⛔ L'IDÉE ÉVIDENTE A ÉTÉ CONSTRUITE, MESURÉE SUR SES 31 SÉANCES, ET JETÉE (R30).
   Elle consistait à DÉDUIRE le cran de la machine (le plus petit écart entre deux charges déjà
   faites, validé si toutes les charges en sont des multiples). Sur ses vraies données elle
   répond **0,5 kg** pour le tirage poulie, **0,5** pour l'abduction, **1,0** pour le pec deck et
   **10** pour la presse à cuisses — c'est-à-dire du bruit de saisie manuelle pris pour une
   grille. *Une inférence fausse aurait produit des charges aussi impossibles qu'aujourd'hui,
   mais avec l'assurance en plus* (R29 : le droit de deviner dépend du coût de l'erreur, et ici
   l'erreur se paie devant le râtelier). On ne devine donc RIEN : on ne fait que reconnaître.

   ⚠️ ET LE RECALAGE NE PASSE QUE S'IL RESTE VALIDE : la montée recalée doit toujours satisfaire
   `_monteeSuffisante`, sinon on garde l'originale. Sans ce contrôle, un décalage de 8 % pourrait
   creuser un trou que l'app REPROCHERAIT ensuite à Milo — l'app produirait une montée que son
   propre contrôleur juge mauvaise, ce qui est arrivé le 10/08 (R2). */
let _chargesVues=null, _chargesVuesN=-1;
function _chargesDejaFaites(nom){
  const n=(S.sessions||[]).length;
  if(_chargesVues===null || _chargesVuesN!==n){
    _chargesVues={}; _chargesVuesN=n;
    (S.sessions||[]).forEach(function(se){ (se&&se.exs||[]).forEach(function(e){
      if(!e||!e.name) return;
      const a=_chargesVues[e.name]||(_chargesVues[e.name]=[]);
      (e.sets||[]).forEach(function(x){ const k=+((x||{}).kg)||0; if(k>0 && a.indexOf(k)<0) a.push(k); });
    });});
    for(const k in _chargesVues) _chargesVues[k].sort(function(x,y){return x-y;});
  }
  return _chargesVues[nom]||[];
}
function _snapCharge(nom, kg){
  const k=+kg||0; if(!(k>0)) return kg;
  const vues=_chargesDejaFaites(nom);
  if(vues.indexOf(k)>=0 || vues.length<3) return kg;
  let best=null, d=0.08*k;
  vues.forEach(function(c){ const e=Math.abs(c-k); if(e<=d){ d=e; best=c; } });
  return best===null ? kg : best;
}
/** Recale une montée sur les charges déjà faites — et ANNULE tout si le contrôleur n'est plus content. */
function _snapMontee(montee, nom, kgTravail){
  if(!montee||!montee.length) return montee;
  const out=montee.map(function(sx){
    if(sx && sx._fixe) return sx;                       // ce que Milo a écrit ne se recale pas
    const k=_snapCharge(nom, sx.kg);
    return (k===sx.kg) ? sx : Object.assign({}, sx, {kg:k});
  });
  for(let i=0;i<out.length;i++){
    if(!((+out[i].kg||0)>0) || (+out[i].kg||0)>=kgTravail) return montee;   // jamais au-dessus du travail
    if(i && (+out[i].kg||0)<=(+out[i-1].kg||0)) return montee;              // toujours croissant
  }
  return _monteeSuffisante(out, kgTravail) ? out : montee;
}
function _monteeEnCharge(kgTravail, pas, nom){
  pas = pas || 2.5;
  const T = +kgTravail || 0;
  if(!(T >= _MONTEE_SEUIL_KG)) return [];
  // ⚠️⚠️ LE GÉNÉRATEUR PASSE SON PROPRE CONTRÔLE (corrigé le 11/08) — et c'est tout l'intérêt.
  // La 1ʳᵉ version (10/08) portait trois plans écrits à la main : sous 60 kg elle sautait de
  // 50 % à 75 % de la charge, soit **25 %** d'un coup, quand la règle dit 10-15 %. Autrement dit
  // `_monteeSuffisante(_monteeEnCharge(80), 80)` répondait **false** : l'app produisait une
  // montée qu'elle jugeait elle-même mauvaise, et depuis ft-v823 elle l'aurait REPROCHÉE à Milo.
  // *Deux sources qui se contredisent, la famille de bugs la plus vicieuse du projet.*
  // Le test ne l'avait pas vu parce qu'il ne vérifiait la cohérence qu'à **130 kg**, le seul
  // poids où les plans écrits à la main tombaient juste.
  // 👉 On ne CHOISIT plus le nombre de paliers : on prend le plus PETIT qui satisfait la règle.
  // Une seule règle, écrite une seule fois (R2) — le barème ne peut plus diverger du contrôle.
  const depart = T < 60 ? 0.50 : 0.45;      // 40-50 % de la charge du jour
  for(let n=2; n<=5; n++){                  // n = nombre de paliers
    const out = [];
    for(let k=0; k<n; k++){
      /* ⚠️ VERS LE BAS, SAUF LE DERNIER PALIER. Arrondir tout vers le bas allège chaque marche,
         donc CREUSE l'écart avec la charge de travail — et le générateur ajoute alors un palier
         pour le combler. Mesuré : le développé épaules à 72 kg passait de 3 à 4 paliers, soit
         l'inverse de ce qu'on cherche. Le dernier palier a un autre rôle que les précédents : il
         doit être PROCHE de la charge de travail (5-10 % sous), pas léger. Il s'arrondit donc au
         plus proche ; sur 1-2 répétitions ça ne fatigue pas. */
      const arr = (k===n-1) ? Math.round : Math.floor;
      const kg = arr(T*(depart + k*(1-depart)/n)/pas)*pas;
      if(kg <= 0 || kg >= T) continue;                      // jamais au-dessus de la charge du jour
      if(out.length && kg <= out[out.length-1].kg) continue; // jamais deux paliers identiques
      out.push({kg:kg, reps:_repsPalier(kg, T), type:'É'});
    }
    if(out.length && _monteeSuffisante(out, T)) return nom ? _snapMontee(out, nom, T) : out;
  }
  return [];   // aucun découpage ne satisfait la règle → on se tait plutôt que de proposer faux
}

/**
 * La montée déjà présente est-elle acceptable ? Deux conditions, tirées des règles ci-dessus.
 * ⚠️ Le seul test « le dernier palier est proche de la charge » ne suffit PAS : la séance de
 * Michel du 10/08 le passait (115 → 130 = 11,5 %) alors qu'elle avait un trou de 23 % entre 70
 * et 100, et 3 reps à 88 % de la charge. On vérifie donc CHAQUE écart, et les reps du haut.
 */
function _monteeSuffisante(echauffements, kgTravail){
  return _monteeDefauts(echauffements, kgTravail).length === 0;
}

/**
 * Les DÉFAUTS de la montée, en clair. Même règle que ci-dessus — une seule fois écrite (R2) :
 * `_monteeSuffisante` n'est plus qu'un « aucun défaut ». Sert deux choses :
 *   ① décider s'il faut rectifier une séance proposée (`_completerMonteeEnCharge`) ;
 *   ② DIRE à Milo ce qui n'allait pas (coach.js) — sinon il ne voit que des charges brutes et
 *      écrit « la montée était propre » alors que l'app sait qu'elle ne l'était pas.
 *      C'est le motif R4 : l'app SAIT, mais l'info n'atteint jamais la donnée qu'on lui envoie.
 * @returns {string[]} — vide si la montée est bonne
 */
function _monteeDefauts(echauffements, kgTravail){
  const T = +kgTravail || 0;
  const out = [];
  if(!(T > 0)) return out;
  const pct = k => Math.round(100*k/T);
  const paliers = (echauffements||[]).map(s=>+s.kg||0).filter(k=>k>0).sort((a,b)=>a-b);
  if(!paliers.length) return ['aucune montée en charge avant '+T+' kg'];
  if(paliers[0] > _MONTEE_DEPART_MAX*T){                     // on ne démarre pas assez bas
    out.push('démarrage à '+paliers[0]+' kg, soit '+pct(paliers[0])+' % de la charge (viser 40-50 %)');
  }
  const suite = paliers.concat([T]);
  for(let i=1;i<suite.length;i++){
    const dKg = suite[i]-suite[i-1];
    // Un trou = plus de 18 % de la charge **ET** plus de 15 kg d'un coup.
    // ⚠️ Le seuil en % vient des sources (paliers de 10-15 %) ; le plancher de 15 kg est un
    // JUGEMENT de notre part, et il faut savoir pourquoi il est là : sans lui, la règle en %
    // exige 4 paliers pour un mouvement à 50 kg (25 · 32,5 · 37,5 · 45), ce que personne ne
    // fait — et ça allonge une séance dont Michel dit déjà (10/08) qu'elle ne tient pas dans
    // l'heure. Un saut de 12 kg ne blesse pas ; un saut de 30 kg, si.
    // Sa séance du 10/08 reste bien signalée : 70 → 100, c'est 23 % **et** 30 kg.
    if(dKg/T > 0.18 && dKg > 15){
      out.push('saut de '+pct(dKg)+' % entre '+suite[i-1]+' et '+suite[i]+' kg (paliers de 10-15 %)');
    }
  }
  // au-delà de 85 % de la charge, plus de 2 reps ce n'est plus un échauffement (fatigue inutile)
  for(const s of (echauffements||[])){
    const k = +s.kg||0, r = +s.reps||0;
    if(k >= 0.85*T && r > 2){
      out.push(r+' reps à '+k+' kg = '+pct(k)+' % de la charge : c\'est déjà une série de travail');
    }
  }
  return out;
}

/* ═══ LE CONTRÔLE D'INTENSITÉ (ft-v980) ══════════════════════════════════════════════════
   Michel, 23/08/2026 : *« comment il a pu déduire que je pouvais faire 3 séries de 5 reps à
   95, c'est impossible je ne suis pas encore assez fort »*.

   ⭐⭐ ET LA DÉCOUVERTE EST QUE MILO NE L'AVAIT PAS DÉDUIT — IL L'AVAIT LUI-MÊME DÉMENTI.
   Questionné (« tu es sûr de toi ? »), il répond : *« ton record 105×2 → 1RM ~108 · 95×5 ≈
   88 %, très lourd pour 3 séries de 5, on vise 80-85 %, soit 85-90 kg. Je corrige : 3×5 à
   90 kg. »* Michel a dit « ne corrige pas », Milo a obéi — et c'est le bon comportement.
   👉 **Le défaut n'est donc PAS son jugement : c'est que son contrôle ne se déclenche que si
   on le questionne.** Il vérifie APRÈS, jamais AVANT.

   ⭐ LA RÉALITÉ A TRANCHÉ, ET ELLE EST DANS LES DONNÉES : ce jour-là, 95×**3** avec « pose de
   la barre à la rép. 2 », deux fois, puis **90×3**. *Michel avait raison (infaisable) et le
   90 corrigé de Milo est exactement là où il a fini.*

   ⛔⛔ POURQUOI EN CODE ET PAS DANS LE PROMPT — c'est **R7** au pied de la lettre. La question
   « 88 % du 1RM sur 3 séries de 5, est-ce tenable ? » est **arithmétique**. La confier à un
   modèle, c'est la faire dépendre d'un jour de fatigue ; et **R9** rappelle qu'on évalue sur
   le modèle des VRAIS utilisateurs, pas sur celui du fondateur. Durcir la consigne n'aurait
   fait que déplacer le problème d'un cran.

   ⭐⭐ ET LA FORMULE REPRODUIT LA CORRECTION DE MILO, INDÉPENDAMMENT — c'est ce qui la valide.
   On part de `bz()` (Brzycki, state.js) qu'on **inverse** : à partir du 1RM, quelle charge
   constitue une série MAXIMALE à R répétitions ? `1RM × (1,0278 − 0,0278·R)`. Pour Michel :
   108 × 0,889 = **96 kg** — donc son 95×5 est à 99 % de son maximum estimé **pour une seule
   série**. ⛔ Or trois séries ne sont pas une série : on applique un coefficient de tenue.
   108 × 0,889 × 0,93 = **89,3 kg**. *Milo, de son côté, avait dit 90.*
   ⚠️ **R2 : on n'écrit pas une deuxième formule de 1RM.** `bz` est le propriétaire, on ne
   fait que la retourner — sinon les deux divergeraient un jour et on ne saurait plus laquelle
   croire.

   ⚠️ LE COEFFICIENT 0,93 EST UN JUGEMENT, ET IL FAUT SAVOIR POURQUOI IL VAUT ÇA. Vérifié sur
   toute la plage contre les barèmes classiques : 3 reps → 88 % (barème 85-90) · 5 reps →
   83 % (barème 80-85, et c'est **le chiffre que Milo a cité lui-même**) · 8 reps → 75 %
   (barème 72-75). Il tient aux trois bouts ; s'il devait bouger, c'est cette ligne qu'on
   corrige, pas trois seuils dispersés.

   ⛔⛔ ON SIGNALE, ON NE CORRIGE JAMAIS TOUT SEUL (**R29**). Le cas de Michel le prouve : il
   VOULAIT ses 95 kg pour tester son max, et il avait le droit. Une app qui aurait réécrit 90
   à sa place aurait décidé de son entraînement. *On montre le calcul, la personne tranche.*

   ⛔ ET SI ON NE SAIT PAS, ON SE TAIT. Sans 1RM connu pour l'exercice, la fonction rend un
   tableau VIDE — jamais une estimation de repli. Inventer un 1RM à partir de rien, puis
   avertir sur cette base, serait un faux-précis (R29) et détruirait la confiance dans les
   avertissements qui, eux, sont fondés.                                                     */
const _INT_TENUE   = 0.93;   // une série maximale ≠ N séries : coefficient de tenue (voir ci-dessus)
const _INT_LOURD   = 0.80;   // au-delà de ce % du 1RM, on parle de charge lourde
const _INT_REPOS   = 150;    // secondes : en dessous, le repos ne suit pas une charge lourde

/**
 * Les défauts d'INTENSITÉ d'un exercice, en clair. Même forme que `_monteeDefauts` (R13) et
 * même double usage : ① prévenir la personne quand une séance dictée arrive ; ② le DIRE à
 * Milo, pour qu'il corrige SA prescription au lieu de commenter des charges brutes (R4).
 * @param {string} nom   nom de l'exercice (sert à retrouver le 1RM)
 * @param {object[]} sets  séries telles qu'appliquées ({kg, reps, type, rest})
 * @returns {string[]} — vide si tout va bien, VIDE AUSSI si on ne sait pas (R29)
 */
function _intensiteDefauts(nom, sets){
  const out=[];
  try{
    const pr=(S.prs||{})[nom];
    const rm1=pr?(+pr.rm1||0):0;
    if(!(rm1>0)) return out;                       // aucun record : on se tait (R29)
    // Séries de TRAVAIL seulement — un échauffement lourd est déjà l'affaire de `_monteeDefauts`.
    const trav=(sets||[]).filter(s=>s&&s.type!=='É'&&(+s.kg>0)&&(+s.reps>0));
    if(!trav.length) return out;
    // On regroupe par (charge, reps) : « 3 séries de 5 à 95 » est un fait, « une série » en est
    // un autre. C'est le NOMBRE de séries à cette charge qui décide du coefficient de tenue.
    const paq={};
    trav.forEach(s=>{ const k=(+s.kg)+'×'+(+s.reps); (paq[k]=paq[k]||{kg:+s.kg,reps:+s.reps,n:0,rest:[]}).n++;
                      if(s.rest!=null) paq[k].rest.push(+s.rest||0); });
    Object.keys(paq).forEach(k=>{
      const p=paq[k];
      // ⚠️ `bz` INVERSÉE — le même 1,0278/0,0278, jamais recopié en dur ailleurs (R2).
      const maxUneSerie = rm1*(1.0278-0.0278*Math.min(p.reps,20));
      if(!(maxUneSerie>0)) return;
      const plafond = (p.n>=2) ? maxUneSerie*_INT_TENUE : maxUneSerie;
      const pct = Math.round(100*p.kg/rm1);
      if(p.kg > plafond*1.02){                     // 2 % de marge : on n'ergote pas sur un demi-kilo
        const conseil=Math.round(plafond*2)/2;     // arrondi au demi-kilo, comme les disques
        out.push(p.n+'×'+p.reps+' à '+p.kg+' kg = '+pct+' % de ton 1RM estimé ('+Math.round(rm1)+' kg)'
          +(p.n>=2?' — tenable sur UNE série max, pas sur '+p.n+' (viser ~'+conseil+' kg)'
                  :' — au-dessus de ton maximum estimé pour '+p.reps+' reps'));
      }
      // ⛔ LE REPOS QUI NE SUIT PAS L'INTENSITÉ — et c'est MICHEL qui a tranché, pas un barème :
      // « un 3×5 avec 90 secondes de repos c'est IMPOSSIBLE ». Ce n'est donc pas une
      // prescription discutable, c'est une prescription INEXÉCUTABLE — dit par celui qui
      // soulève la barre. ⚠️ Et ce n'est pas la charge seule qui pose problème : c'est le
      // couple charge × répétitions × repos.
      if(p.kg >= rm1*_INT_LOURD && p.rest.length){
        const r=Math.min.apply(null,p.rest);
        if(r>0 && r<_INT_REPOS){
          out.push('repos de '+r+' s à '+pct+' % du 1RM : trop court pour du lourd (viser 3 min)');
        }
      }
    });
  }catch(e){ /* jamais bloquant : c'est un avertissement, pas une fonctionnalité */ }
  return out;
}

/* 📍 UNE CHARGE PRESCRITE SANS REPÈRE LE DIT (27/08/2026, ft-v1033)
   Vient du critère donné par Michel : *« la coach savait que moi je m'y connais ; tout le monde
   ne connaît pas ce que représente le "lourd" »*. Elle écrit « lourd » parce qu'un **référentiel
   commun** existe entre eux — le mot ne se suffit jamais à lui-même. Milo, lui, parle à des gens
   dont il ne sait parfois rien.

   ⛔⛔ LE TROU EST DANS LE VOISIN, ET IL EST MESURÉ : `_intensiteDefauts` commence par
   `if(!(rm1>0)) return out;` — **aucun record, le contrôle se tait ENTIÈREMENT**. Ce silence est
   juste pour SA question (« est-ce trop lourd ? » n'a pas de réponse sans repère), mais il laisse
   passer l'autre : *« 4×8 à 60 kg »* sur un exercice jamais fait, sans un mot. C'est **ft-v980**
   privé de garde-fou — et un chiffre inventé est PIRE que pas de chiffre pour un débutant, qui
   n'a aucun moyen de savoir qu'il est faux.

   ⛔ ON NE RETIRE PAS LE NOMBRE (R24 : informer sans bloquer). Une charge pré-remplie fait gagner
   du temps en salle, c'est le cœur du produit. Ce qui est faux, ce n'est pas le nombre : c'est
   qu'il soit présenté comme s'il était calibré. **On le nomme pour ce qu'il est.**

   ⚠️⚠️ ET LE NOM EST RÉSOLU AVANT DE CONCLURE — sans ça, on dirait « tu n'as pas de repère » à
   quelqu'un qui en a un, c'est-à-dire **un fait faux sur la personne** (R29, le pire coût
   d'erreur). `_startSessionFromMilo` prend `e.name` **brut** : si Milo écrit un nom voisin du
   catalogue, la clé de `S.prs` ne tombe pas juste. On essaie donc les variantes.
   ⭐ Vérifié au passage : un renommage d'exercice MIGRE bien le record (`S.prs[n]=S.prs[o]`),
   donc ce chemin-là ne perd rien.

   ⛔ ET LE REPÈRE N'EST PAS QUE LE 1RM : quelqu'un qui a déjà FAIT l'exercice a une référence,
   même sans record estimé. On regarde donc aussi l'historique — sinon la phrase serait fausse
   pour lui. */
function _repereDefauts(nom, sets){
  const out=[];
  try{
    const variantes=[];
    const push=v=>{ if(v&&variantes.indexOf(v)<0)variantes.push(v); };
    push(nom);
    if(typeof exNomCatalogue==='function') push(exNomCatalogue(nom));
    if(typeof exNomActuel==='function')    push(exNomActuel(nom));
    if(typeof exNomCatalogue==='function'&&typeof exNomActuel==='function')
      push(exNomActuel(exNomCatalogue(nom)));
    /* ⚠️⚠️ ET LA COMPARAISON EST NORMALISÉE, parce que le résolveur NE SUFFIT PAS — mesuré :
       `exNomCatalogue('Developpe Couche')` rend `'Developpe Couche'` tel quel. Il connaît les
       alias DÉCLARÉS, pas les variantes d'accent ou de ponctuation. Sans cette normalisation, on
       annonçait « pas encore de repère » à quelqu'un dont le record existait sous le vrai nom.
       ⭐ `_normEx` existe déjà (minuscules + accents retirés + alphanumérique) — on la réutilise,
       on n'en écrit pas une deuxième (R13/R2). */
    const nz = (typeof _normEx==='function') ? _normEx : (s=>String(s||'').toLowerCase());
    const cibles = variantes.map(nz);
    const memeEx = n => cibles.indexOf(nz(n))>=0;
    const prs=S.prs||{};
    const aRecord = Object.keys(prs).some(k=>memeEx(k)&&(+prs[k].rm1||0)>0);
    /* ⛔ L'historique se lit ICI et pas via `getPrev`, qui compare le nom EXACTEMENT et sert
       ailleurs : le corriger changerait le comportement de tous ses appelants (R14). */
    const aHisto = (S.sessions||[]).some(s=>((s.exs||s.exercises||[])
      .some(e=>e&&memeEx(e.name)&&(e.sets||[]).some(x=>x&&x.done!==false))));
    if(aRecord||aHisto) return out;              // il y a un repère → ce n'est pas notre question
    // Séries de TRAVAIL seulement : un échauffement chiffré ne prétend rien (même règle que le voisin).
    const trav=(sets||[]).filter(s=>s&&s.type!=='É'&&(+s.kg>0));
    if(!trav.length) return out;                 // aucune charge chiffrée → rien à dire (R29)
    const kgs=trav.map(s=>+s.kg).filter(k=>k>0);
    const max=Math.max.apply(null,kgs), min=Math.min.apply(null,kgs);
    const combien=(max===min)?(max+' kg'):(min+' à '+max+' kg');
    /* ⛔⛔ LE MOT DIT OÙ EST L'ABSENCE — correction de Michel, et elle rendait ma 1re version
       FAUSSE. J'avais écrit « Pas encore de repère sur cet exercice », qui se lit *« tu n'as
       jamais fait cet exercice »*. Or quelqu'un qui soulève depuis dix ans et installe l'app
       hier n'a rien dans l'app : lui dire ça, c'est **affirmer un fait faux sur lui** (R29, le
       pire coût d'erreur). L'absence est dans **l'historique de l'app**, pas dans son expérience
       — et c'est exactement ce que le code mesure, ni plus ni moins.
       ⛔ Et on informe sans accuser, comme pour le dépassement de repos : « point de départ à
       ajuster » dit ce que c'est, sans reprocher quoi que ce soit. */
    out.push('📍 Aucun repère dans ton historique pour cet exercice — '+combien+' est un point de départ à ajuster, pas une mesure.');
  }catch(e){ /* jamais bloquant */ }
  return out;
}

/**
 * COMPLÈTE la montée de Milo — elle ne la REMPLACE jamais.
 *
 * ⚠️⚠️ RÉGRESSION DU 10/08, CORRIGÉE LE 11 : la 1ʳᵉ version écrasait les séries d'échauffement
 * de Milo par les siennes. Quand le barème de l'app en produisait MOINS (2 paliers sous 60 kg
 * contre les 3 de Milo), la personne lisait **6 séries** dans le chat et en trouvait **5** dans
 * l'app. Retour de Michel le soir même : *« il me donne 6 séries mais quand j'ajoute la séance
 * il ne m'en donne que 5 »*.
 * *Je m'étais protégé contre l'AJOUT invisible et pas contre le RETRAIT — or le retrait est pire :
 * il fait mentir ce que la personne vient de lire, et rien ne le signale.*
 *
 * L'INVARIANT, tenu par un témoin permanent : **le nombre de séries ne DIMINUE jamais.**
 * On insère les paliers manquants dans l'échelle de Milo, on n'en retire aucun.
 */
function _monteeCompletee(echauffements, kgTravail, pas, nom){
  pas = pas || 2.5;
  const T = +kgTravail || 0;
  const src = (echauffements||[]).filter(s=>s && (+s.kg||0) > 0 && (+s.kg||0) < T);
  if(!src.length) return _monteeEnCharge(T, pas, nom);       // rien à préserver → barème complet (même pas)
  // ⚠️ Les paliers de Milo sont marqués FIXES : le recalage ne touche que ce que l'app fabrique.
  const out = src.slice().sort((a,b)=>(+a.kg||0)-(+b.kg||0)).map(x=>Object.assign({}, x, {_fixe:true}));
  const ARR = k => Math.floor(k/pas)*pas;   // vers le BAS (voir _pasCharge)
  // ⚠️ Les répétitions d'un palier inséré viennent de sa CHARGE (`_repsPalier`), jamais d'un
  // forfait ni de ses voisins — voir la démonstration au-dessus de `_repsPalier`. Et on ne
  // touche JAMAIS aux répétitions que Milo a écrites (PB-008 : on ne décide pas à sa place).
  // ⚠️ PLAFOND À 5 PALIERS : au-delà on fatigue au lieu de préparer (règle des 5 sources).
  // Donc on ne peut pas boucher tous les trous — on bouche les PLUS GROS d'abord.
  const MAX = 5;
  for(let garde=0; garde<4 && out.length<MAX; garde++){
    // ① démarrage trop haut → on prépose un palier bas
    if((+out[0].kg||0) > _MONTEE_DEPART_MAX*T){
      const kg = ARR(0.45*T);
      // le palier le plus bas : au moins autant de répétitions que celui qui le suit
      const r0 = Math.max(_repsPalier(kg, T), +out[0].reps || 0);
      if(kg > 0 && kg < (+out[0].kg||0)){ out.unshift({kg:kg, reps:r0, type:'É', _add:true}); continue; }
    }
    // ② le plus gros trou (paliers + la charge de travail en bout) au-dessus de 18 %
    const suite = out.map(s=>+s.kg||0).concat([T]);
    let iPire=-1, pire=0.18;
    for(let i=1;i<suite.length;i++){
      const e=(suite[i]-suite[i-1])/T;
      if(e>pire){ pire=e; iPire=i; }
    }
    if(iPire<0) break;
    const kg = ARR((suite[iPire]+suite[iPire-1])/2);
    if(!(kg>suite[iPire-1] && kg<suite[iPire])) break;       // pas de place pour un palier
    out.splice(iPire, 0, {kg:kg, reps:_repsPalier(kg, T), type:'É', _add:true});
  }
  /* 🛡️ FILET : la suite reste décroissante, quoi qu'ait écrit Milo — mais on ne corrige QUE nos
     propres paliers. Si Milo lui-même a écrit 3 puis 5, c'est son choix et on ne le réécrit pas
     (PB-008 : on ne décide pas à sa place) ; l'app se contente de ne pas EMPIRER la suite. */
  for(let i=1;i<out.length;i++){
    if(out[i]._add && (+out[i].reps||0) > (+out[i-1].reps||0)) out[i].reps = +out[i-1].reps || out[i].reps;
  }
  const fin = nom ? _snapMontee(out, nom, T) : out;
  fin.forEach(x=>{ delete x._fixe; });
  return fin;
}

/* 🔥 ON NE S'ÉCHAUFFE PAS CINQ FOIS DANS LA MÊME SÉANCE (15/08/2026)
   Michel, devant une séance Push proposée par Milo : *« il me met de l'échauffement partout
   c'est normal ? »*. **Non, et c'est mesurable** : sur cette séance, Milo annonçait **19 séries
   → ~88 min** (il avait fait le calcul avec son rythme réel de 4,6 min/série, à sa demande de
   tenir en 1 h 30). L'app en livrait **29** — soit **+10 séries, ~+46 min**. *L'app défaisait en
   silence exactement ce qu'il venait de demander.*
   DEUX CAUSES, et la 1ʳᵉ est une duplication (R2) :
   ① le filtre lisait `_MOV_MONTEE`, une SECONDE liste de schémas moteurs, alors que l'app a déjà
      `_exRole()` — le classement ancre/accessoire, qui sait précisément qu'un **Pec Deck** ou un
      **Tirage Visage** sont des isolations rangées dans un schéma de « poussée/tirage ». Le
      Pec Deck recevait donc 3 paliers d'échauffement (5×27,5 → 3×37,5 → 2×50) avant 3×12.
      *Le garde-fou existait, il était écrit deux fois, et c'est la mauvaise version qui servait.*
   ② rien ne regardait la SÉANCE, seulement l'exercice. Après un développé couché lourd (4 paliers
      + 3×5 @ 85 kg), le développé incliné qui suit n'a pas besoin d'une 2ᵉ montée : **on est déjà
      chaud sur ce mouvement-là**. Un exercice ne s'échauffe donc que si son schéma moteur n'a pas
      déjà été chargé lourd dans la même séance.
   ⚠️ SEUL UN ANCRE « CHAUFFE » SON SCHÉMA, jamais un accessoire : sinon un Pec Deck placé avant le
   développé couché supprimerait la montée du développé. *Une montée en trop coûte du temps ; une
   montée manquante sur une barre lourde coûte une épaule* (R29 : le droit de deviner dépend du
   coût de l'erreur — ici il n'est pas symétrique).
   ⚠️ RETRAIT VOLONTAIRE (R30) : `_MOV_MONTEE` n'est plus consultée. Elle contenait `fente`, que
   `_exRole` range en accessoire — donc les fentes ne reçoivent plus de montée en charge. C'est
   cohérent avec le vocabulaire de l'app, ce n'est pas un oubli. */
function _completerMonteeEnCharge(sess){
  try{
    if(!sess || !Array.isArray(sess.exs)) return sess;
    const chauffe = {};   // schémas moteurs déjà chargés lourd DANS CETTE SÉANCE
    let dejaChauffe = false;   // un ancre lourd a-t-il déjà été fait ? (→ on est chaud)
    sess.exs.forEach(function(ex){
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      const travail = sets.filter(s=>s && s.type!=='É' && s.type!=='W');
      if(!travail.length) return;
      const kgT = travail.reduce((m,s)=>Math.max(m, +s.kg||0), 0);
      if(!(kgT >= _MONTEE_SEUIL_KG)) return;
      let pat=null; try{ pat=_movPattern(ex.name); }catch(e){}
      let role='accessoire'; try{ role=_exRole(ex.name); }catch(e){}
      if(role !== 'ancre') return;                          // isolation / accessoire → on ne touche pas
      if(pat && chauffe[pat]) return;                       // ce mouvement a déjà été chauffé plus haut
      const premier = !dejaChauffe;                         // est-ce le PREMIER ancre lourd de la séance ?
      if(pat) chauffe[pat] = true;                          // seul un ancre lourd chauffe son schéma
      dejaChauffe = true;
      const ech = sets.filter(s=>s && (s.type==='É'||s.type==='W'));
      if(_monteeSuffisante(ech, kgT)) return;               // sa montée est bonne → on ne touche pas
      /* 🎯 UNE MONTÉE COMPLÈTE POUR LE PREMIER ANCRE, UNE SEULE SÉRIE D'APPROCHE POUR LES SUIVANTS
         (15/08/2026, décision de Michel après recherche)
         Michel : *« il m'a mis l'échauffement partout presque »* — et sur sa séance Push, le
         développé épaules (4ᵉ exercice, sur machine) recevait 3 paliers alors qu'il venait
         d'enchaîner tout un travail de poussée.
         ⭐ CE QUE DIT LA LITTÉRATURE : le mouvement composé déjà fait a augmenté le flux sanguin,
         préparé le neuromusculaire et élevé la température de la zone ; sur un mouvement nouveau,
         « quelques répétitions légères » suffisent — pas un protocole complet. Le protocole
         complet, lui, est celui de la PREMIÈRE série lourde de la séance.
         ⚠️ On ne descend jamais à ZÉRO palier sur un mouvement neuf : le schéma moteur change
         (pousser au-dessus de la tête n'est pas pousser devant soi), et une série d'approche à
         ~85 % coûte 1 minute quand une épaule coûte des mois (R29).
         ⚠️ Et si Milo avait DÉJÀ prévu un échauffement, on n'y touche pas : le nombre de séries
         ne diminue jamais (invariant du 11/08).

         ⭐⭐ LA RÈGLE ÉTAIT ÉCRITE ET COURT-CIRCUITÉE (corrigé le 17/08/2026)
         Michel, séance du 16/08 : *« voir aussi pourquoi il me propose autant d'échauffement…
         j'ai passé presque la moitié de ma séance sur des exercices d'échauffement »*. Mesuré
         sur sa séance : le **Tirage Poulie Haute**, 2ᵉ exercice, sur machine, après un soulevé
         de terre à 130 kg — **5 paliers** d'échauffement pour 3 séries de travail.
         LA CAUSE tient en un `||` : la condition `premier || ech.length` fait basculer dans la
         complétion COMPLÈTE dès que le programme contient déjà des paliers. Or c'est le cas
         normal — Milo en propose presque toujours. *La règle « une seule série d'approche pour
         les suivants », écrite le 15/08, ne s'appliquait donc qu'aux exercices pour lesquels
         Milo n'avait rien prévu du tout, c'est-à-dire presque jamais.*
         ⭐ CE QUE DIT LA LITTÉRATURE (vérifié, demande de Michel : *« voir sur internet si c'est
         réel et prouvé surtout »*) : sur une **2ᵉ grosse barre** on est déjà chaud, 2 à 4 paliers
         suffisent ; sur un **accessoire** 0 à 2 (souvent une seule « feeder set ») ; et sur une
         **machine**, moins encore — elle est moins technique, elle ne demande ni équilibre ni
         coordination. Le protocole complet est celui de la PREMIÈRE série lourde de la séance.
         👉 Un ancre qui n'est pas le premier et qui a DÉJÀ des paliers est donc laissé tel quel.
         On n'en retire aucun (invariant du 11/08), on n'en ajoute plus. Sa montée du 16/08 passe
         de 5 paliers à 3 — ce que Milo avait écrit, ni plus ni moins.
         ⚠️ Le soulevé de terre, lui, GARDE ses 4-5 paliers : c'est la première barre lourde, et
         là les sources sont unanimes. On ne raccourcit pas ce qui est justifié. */
      let montee;
      if(premier){
        montee = _monteeCompletee(ech, kgT, _pasCharge(ex.name), ex.name);
      }else if(ech.length){
        return;                                             // déjà chaud + déjà des paliers → on n'ajoute rien
      }else{
        // ⚠️ On reprend le DERNIER palier du générateur, pas un pourcentage inventé à côté : c'est
        // la même règle, donc l'écart avec la charge de travail reste celui que l'app juge sûr
        // (le contrôle du trou l'a déjà validé pour la montée complète) — R2.
        const complet = _monteeEnCharge(kgT, _pasCharge(ex.name), ex.name);
        if(!complet.length) return;
        const haut = complet[complet.length-1];
        montee = [{kg:haut.kg, reps:2, type:'É', _add:true}];
      }
      if(!montee.length) return;
      const ajoutes = montee.filter(s=>s._add).length;
      // 🛡️ GARDE-FOU DUR : on ne livre JAMAIS moins de séries que ce que la personne a lu.
      if(montee.length + travail.length < sets.length) return;
      ex.sets = montee.concat(travail);
      ex._montee = true;
      // Dire ce qu'on a fait, et le dire JUSTE : « complétée » quand on insère dans l'échelle
      // de Milo, « ajoutée » quand il n'en avait proposé aucune.
      const dit = ech.length
        ? '⚡ Montée en charge complétée par l\'app (+' + ajoutes + ' palier' + (ajoutes>1?'s':'') + ')'
        : '⚡ Montée en charge ajoutée par l\'app';
      ex.note = ex.note ? (String(ex.note).slice(0,90) + ' · ' + dit) : dit;
    });
  }catch(e){ console.warn('[montée en charge]', e); }
  return sess;
}

function _movPattern(name){ const q=' '+_movNorm(name)+' ';
  // Écarté/fly + penché/arrière/inverse = OISEAU (élévation d'épaule), jamais une poussée pectorale.
  // Les mots-clés simples ne savent pas l'exprimer (« Écarté Haltères Buste Penché » a un mot au
  // milieu) et le kw « ecarte » de la poussée horizontale l'attraperait — bug du 30/07 (capture).
  if(/(ecarte|\bfly\b)/.test(q)&&/(penche|arriere|inverse|reverse)/.test(q)) return 'elevation-epaules';
  // Un kickback de FESSIERS n'est pas une extension de triceps : le kw 'kickback' (triceps)
  // attrapait « Extension Fessiers Arrière », « Kickback Machine » et « Kickback Cable »
  // (machines fessiers du catalogue). Même règle que _MEX : sans « triceps » dans le nom,
  // un kickback est une extension de hanche (ft-v686).
  // ⚠️ « L-Sit » ne peut pas être un simple mot-clé : le matcheur teste aussi la SOUS-CHAÎNE,
  // et « l sit » se retrouve dans « waLL SIT » → la Chaise partait en gainage (audit 02/08).
  if(/(^| )l sit( |$)/.test(q)) return 'gainage-abdos';
  // ⚠️ LE CHARIOT DE PUISSANCE (sled) — trouvé le 02/08 en CROISANT le schéma avec les muscles.
  // Le mot-clé générique « chariot » rangeait TOUTE la famille en tirage horizontal, y compris
  // la POUSSÉE et le tirage d'ÉPAULES : l'app croyait qu'on avait tiré alors qu'on avait poussé,
  // et l'équilibre de séance s'en trouvait faussé. Idem « sled » côté squat, qui happait le
  // « Sled Pull ». Le geste est ÉCRIT dans le nom — on le lit au lieu de le deviner.
  if(/chariot|sled|traineau/.test(q)){
    if(/poussee|push/.test(q))   return 'squat';              // poussée entraînée par les jambes
    if(/epaule/.test(q))         return 'elevation-epaules';
    if(/jambe/.test(q))          return 'squat';
    if(/curl/.test(q))           return 'curl-biceps';
    if(/tricep/.test(q))         return 'extension-triceps';
    if(/fente/.test(q))          return 'fente';
    return 'tirage-horizontal';                                // tirage dos / de côté / en avançant
  }
  if(/kickback/.test(q)&&!/tricep/.test(q)) return 'hip-hinge'; // /tricep/ sans s : le stemming réduit « triceps » → « tricep »
  // Un TIRAGE n'est jamais une poussée : « Tirage Incliné Poulie Haute » contenait « incliné »
  // → attrapé par la poussée horizontale (kw 'incline'). Poulie haute → vertical, sinon horizontal (ft-v686).
  if(/(^| )tirage /.test(q)&&/(incline|decline)/.test(q)) return /poulie haute/.test(q)?'tirage-vertical':'tirage-horizontal';
  // ⚠️ La TRACTION AUSTRALIENNE porte le mot « traction » mais le corps est HORIZONTAL : c'est
  // un rowing, pas un tirage vertical. Trouvé le 02/08 en relisant les 52 exercices de dos —
  // le « Rowing Inversé sous une Table », qui est EXACTEMENT le même geste, était bien rangé
  // en horizontal. Deux fiches du même mouvement, deux schémas : c'est la contradiction qui
  // l'a rendu visible, jamais la lecture d'une fiche seule.
  if(/australien|inverted row|rowing inverse/.test(q)) return 'tirage-horizontal';
  for(const p of _MOV_PATTERNS){
    // `non` = mots qui DISQUALIFIENT le schéma (ex. « jefferson » pour le curl de biceps)
    if(p.non&&p.non.some(x=>q.indexOf(_movNorm(x))>=0)) continue;
    for(const k of p.kw){ if(q.indexOf(' '+_movNorm(k)+' ')>=0 || q.indexOf(_movNorm(k))>=0) return p.id; }
  } return null; }
function _movResist(name){ const q=_normEx(name);
  if(/kettlebell/.test(q))return'kettlebell'; if(/elastique|band/.test(q))return'elastique';
  if(/poulie|cable/.test(q))return'poulie'; if(/haltere|dumbbell/.test(q))return'halteres';
  if(/smith|hammer|machine|levier|convergent|leg press|press jambe|pec deck|presse/.test(q))return'machine';
  if(/traction|pompe|dips|gainage|planche|pull up/.test(q))return'poids-du-corps';
  if(/barre|barbell/.test(q))return'barre'; return null; }
function _exTaxo(name){ return {pattern:_movPattern(name), resistance:_movResist(name)}; }
// ─── ANCRE vs ACCESSOIRE (connaissance métier du « cerveau de Milo », brique) ──
// Rôle d'un exercice DANS un programme, dérivé du schéma moteur (0 IA, déterministe).
//  • ANCRE = grand mouvement polyarticulaire de BASE qui PORTE la progression
//    (squat, hip hinge, poussée horizontale/verticale, tirage horizontal/vertical) —
//    fait en 1er, lourd, peu de reps, progression de charge suivie.
//  • ACCESSOIRE = isolation OU mouvement secondaire (curls, extensions, élévations,
//    leg curl/extension, mollets, écarté/pec deck, fentes, gainage) — volume, cible
//    un muscle, complète l'ancre. Un exo inconnu → accessoire (choix prudent).
// Garde-fou : une isolation mono-articulaire rangée dans un schéma « poussée/tirage »
// (écarté, pec deck, croisé poulie, pull-over, face pull) reste un ACCESSOIRE.
// ⚠️ « halterophilie » ajoutée aux ANCRES (ft-v670) : un arraché ou un épaulé-jeté est un
// mouvement PRINCIPAL, jamais un accessoire. En revanche « porte » et « saut-plyo » n'y sont
// PAS : un farmer's walk ou un burpee est du conditionnement — en faire une ancre pousserait
// Milo à bâtir une séance autour. (R29 : le droit de deviner dépend du coût de l'erreur.)
const _EX_ANCRE_PATTERNS=['squat','hip-hinge','poussee-horizontale','poussee-verticale','tirage-horizontal','tirage-vertical','halterophilie'];
function _exRole(name){
  const q=_normEx(name||'');
  if(/ecarte|\bfly\b|pec deck|peck deck|croise poulie|crossover|butterfly|pull ?over|face pull|tirage visage/.test(q)) return 'accessoire';
  return _EX_ANCRE_PATTERNS.includes(_movPattern(name)) ? 'ancre' : 'accessoire';
}
// Table d'équivalences SÉMANTIQUES connues (ce que le lexical ne peut pas deviner).
// clé = forme normalisée d'entrée → nom EXLIB cible. À enrichir au fil des vrais imports.
const _EX_EQUIV={
  'pec deck':'Pec Deck','pec deck fly':'Pec Deck','peck deck':'Pec Deck','ecarte machine':'Pec Deck','ecarte assis machine':'Pec Deck','butterfly':'Pec Deck','pec dec':'Pec Deck',
  'presse a cuisses':'Press Jambes 45°','presse a cuisses 45':'Press Jambes 45°','presse jambes':'Press Jambes 45°','leg press':'Press Jambes 45°','presse a jambes':'Press Jambes 45°','presse cuisse':'Press Jambes 45°',
  'chest press hammer':'Chest Press Machine Horizontale','chest press pronation':'Chest Press Machine Horizontale','developpe convergent machine':'Chest Press Machine Horizontale','developpe convergent':'Chest Press Machine Horizontale',
  'chest incline':'Chest Press Machine Inclinée','chest press incline':'Chest Press Machine Inclinée','chest incline pronation':'Chest Press Machine Inclinée','developpe incline machine':'Chest Press Machine Inclinée',
  'chest decline':'Chest Press Machine Déclinée','chest press decline':'Chest Press Machine Déclinée',
  'tirage poitrine':'Tirage Poulie Haute (Lat Pulldown)','lat pulldown':'Tirage Poulie Haute (Lat Pulldown)','tirage vertical poitrine':'Tirage Poulie Haute (Lat Pulldown)',
  'leg curl':'Curl Ischio-jambiers (Leg Curl)','leg extension':'Extension Quadriceps (Leg Extension)'
};
// Lookup équivalence tolérant au mot « machine » (et autres mots vides génériques) :
// on tente la forme complète, puis la forme réduite aux mots utiles (_exTokens) —
// « peck deck machine » → « peck deck » → Pec Deck. La forme complète gagne d'abord,
// donc « ecarte machine » (clé directe) n'est jamais réduit à tort en « ecarte ».
function _eqLookup(q,name){ if(_EX_EQUIV[q])return _EX_EQUIV[q];
  // Réduction : on enlève seulement les mots vides (dont « machine ») SANS stemmer
  // (« Leg press machine » → « leg press », pas « leg pres » qui corromprait la clé).
  const core=_normEx(name).split(' ').filter(t=>t&&!_EX_STOP.has(t)&&!/^[a-z]{1,3}\d+$/.test(t)).join(' ');
  return (core&&core!==q&&_EX_EQUIV[core])?_EX_EQUIV[core]:null; }
// ─── Enrichissement au fil du réel (stress-test programmes GPT, 20/07) : familles ratées + corrections ───
Object.assign(_EX_EQUIV,{
  // Famille leg press (était laissée « nouveau »)
  'lp45':'Press Jambes 45°','leg press 45':'Press Jambes 45°','leg press hammer':'Press Jambes 45°','presse hammer':'Press Jambes 45°',
  'horizontal leg press':'Press Jambes Horizontale','presse horizontale':'Press Jambes Horizontale',
  'presse inclinee':'Press Jambes Inclinée','vertical leg press':'Press Jambes Verticale',
  // Poulie croisée / écarté câble
  'cable cross':'Croisé Poulie (Cable Crossover)','cable crossover':'Croisé Poulie (Cable Crossover)','cable fly low':'Croisé Poulie (Cable Crossover)','pecfly':'Pec Deck','pec fly':'Pec Deck',
  // Dos poulie basse
  'low row':'Rowing Câble (Tirage Horizontal)',
  // Machine fessier (hip thrust machine)
  'booty builder':'Hip Thrust Machine (Poussée de Hanche)','glute drive':'Hip Thrust Machine (Poussée de Hanche)',
  // CORRECTIONS de mauvais matchs révélés par le stress-test
  'tirage devant':'Tirage Poulie Haute (Lat Pulldown)','lat pull':'Tirage Poulie Haute (Lat Pulldown)',
  'reverse pec fly':'Machine Oiseau','reverse fly':'Machine Oiseau','reverse pec deck':'Machine Oiseau','ecarte inverse machine':'Machine Oiseau',
  // « Butterfly inversé » — le nom que Michel emploie spontanément (08/08), et le seul qu'il
  // ait sous la main : *« son nom je ne le connais pas exactement »*. Nous, on l'appelle
  // « Machine Oiseau ». Si le mot de la salle ne mène nulle part, la personne crée un doublon
  // perso — c'est exactement ce qui vient de se passer avec « Butterfly ».
  // ── ABRÉVIATIONS DE SALLE FRANÇAISES (09/08) — Milo les emploie LUI-MÊME ─────────────
  // Trouvé en relisant ses vrais programmes : il écrit « SDT Sumo + SDJT » dans ses récaps.
  // Aucune ne résolvait. Dans un texte de résumé c'est sans conséquence ; dans un bloc de
  // séance, la ligne serait purement ABANDONNÉE (le montage n'accepte que l'exact).
  // ⚠️ « SDT Roumain » n'est PAS ajouté : le catalogue en a CINQ (barre, haltères, kettlebell,
  // landmine, unilatéral) — choisir à sa place ferait travailler sur un autre matériel (R29).
  'sdt':'Soulevé de Terre','sdt sumo':'Soulevé de Terre Sumo','sdjt':'Soulevé de Terre Jambes Tendues',
  'sdt jambes tendues':'Soulevé de Terre Jambes Tendues','sdt trap bar':'Soulevé de Terre Trap Bar',
  'sdt deficit':'Soulevé de Terre avec Déficit','sdt machine':'Soulevé de Terre Machine',
  // « Curl marteau » : l'exercice s'appelle juste « Marteau » au catalogue — personne ne l'écrit comme ça.
  'curl marteau':'Marteau','hammer curl':'Marteau','curl hammer':'Marteau',
  // « Élévations lat » tombait sur le LAT PULLDOWN (« lat » a gagné contre « latérales ») :
  // deux exercices sans rapport, muscles opposés. Le mot entier lève l'ambiguïté.
  'elevations lat':'Élévations Latérales (Lateral Raise)','elev lat':'Élévations Latérales (Lateral Raise)',
  'elevation lat':'Élévations Latérales (Lateral Raise)',
  'butterfly inverse':'Machine Oiseau','butterfly inversee':'Machine Oiseau','reverse butterfly':'Machine Oiseau',
  'butterfly arriere':'Machine Oiseau','butterfly epaules':'Machine Oiseau','butter fly inverse':'Machine Oiseau',
  'quad extension':'Extension Quadriceps (Leg Extension)',
  'standing soleus press':'Élévations Mollets Debout','soleus press':'Élévations Mollets Debout',
  // Stress-test « Niveau Expert » (2e vague GPT)
  'ischios assis':'Leg Curl Assis Machine','ischio assis':'Leg Curl Assis Machine',
  'hack':'Squat Hack (Hack Squat)','presse':'Press Jambes 45°',
  'high pulley':'Tirage Poulie Haute (Lat Pulldown)','pulley wide':'Tirage Poulie Haute (Lat Pulldown)','wide pulley':'Tirage Poulie Haute (Lat Pulldown)',
  // Abréviations « cas pièges » (Niveau Expert)
  'chest bb':'Développé Couché','hack sq':'Squat Hack (Hack Squat)','lp':'Press Jambes 45°',
  // 3e vague (rapport banc d'essai) : « nouveau » + confirm faux à rattacher
  'dual cable cross':'Croisé Poulie (Cable Crossover)',
  'high pulley close grip':'Tirage Poulie Haute Prise Serrée','close grip pulldown':'Tirage Poulie Haute Prise Serrée',
  'close grip bench':'Développé Couché','incl db press':'Développé Incliné Haltères','bench bb':'Développé Couché','leg ext':'Extension Quadriceps (Leg Extension)',
  'converging press':'Chest Press Machine Horizontale','converging chest press':'Chest Press Machine Horizontale','horizontal press':'Chest Press Machine Horizontale',
  'hammer incline':'Chest Press Machine Inclinée','hammer iso incline':'Chest Press Machine Inclinée',
  'high row':'Rowing Machine (Tirage Horizontal)',
  // 4e vague (rapport « Mon programme » HELL MODE) : abréviations + faux matchs
  'dc bb':'Développé Couché','dev couche':'Développé Couché','cg bench':'Développé Couché',
  'push down':'Triceps Poulie','tri rope':'Triceps Corde Poulie',
  'butter fly':'Pec Deck','butter fly machine':'Pec Deck','pec machine':'Pec Deck','fly machine':'Pec Deck',
  'lat machine':'Tirage Poulie Haute (Lat Pulldown)','lat pd':'Tirage Poulie Haute (Lat Pulldown)','row assis':'Rowing Câble (Tirage Horizontal)',
  // 5e vague (rapport HELL MODE v2, validé GPT) : squat profond + presse mollets
  'atg squat':'Squat à la Barre','mollet presse':'Presse Mollets (Leg Press)',
  // 6e vague (rapport TRX/poids du corps) : 3 suggestions absurdes corrigées (muscle faux)
  'trx ham curl':'Curl Ischio-jambiers (Leg Curl)','nordic curl':'Curl Ischio-jambiers (Leg Curl)',
  'chin up':'Traction Prise Neutre',
  // 7e vague (rapport CrossFit/haltéro) : 5 suggestions absurdes corrigées (muscle/mouvement faux)
  'push press':'Développé Militaire','strict press':'Développé Militaire','push jerk':'Développé Militaire',
  'chest to bar':'Traction Lestée','wall ball':'Thruster',
  // 8e vague (rapport OLD SCHOOL — muscu classique, PRIORITAIRE)
  // abréviations FR de musclé (DC marchait déjà, ses cousins non)
  'di':'Développé Incliné','dd':'Développé Décliné','dm':'Développé Militaire','el':'Élévations Latérales (Lateral Raise)',
  'sdt jt':'Soulevé de Terre Roumain Barre',
  'incline bb':'Développé Incliné','incline bench':'Développé Incliné','decline bench':'Développé Décliné',
  // suggestions fausses corrigées
  'lat raise':'Élévations Latérales (Lateral Raise)',       // « lat » = latéral, PAS latissimus (≠ Lat Pull)
  'planche':'Gainage',                       // planche FR = plank, PAS Planche de Préhension (grip)
  'pec deck inverse':'Machine Oiseau','extension corde':'Triceps Corde Poulie','shoulder bb':'Développé Militaire',
  // corrects mais à fiabiliser (confirm → auto)
  'mollets presse':'Presse Mollets (Leg Press)','row poulie':'Rowing Câble (Tirage Horizontal)','cable row':'Rowing Câble (Tirage Horizontal)','t bar':'Rowing T-Bar Machine',
  // 9e vague (rapport FORCE/HALTÉRO — powerlifting classique)
  'bs':'Squat à la Barre','fs':'Squat Avant','ghr':'Glute Ham Raise (GHD)',
  'comp bench':'Développé Couché','paused bench':'Développé Couché',
  'pendlay row':'Rowing Barre (Tirage Horizontal)',               // row barre strict, PAS poulie
  'conventional dl':'Soulevé de Terre','block pull':'Tirage en Rack (Rack Pull)',
  // 10e vague (rapport PERTE DE POIDS FEMME — fitness/muscu, PRIORITAIRE) : 5 exos qu'on A mais ratés
  'abducteurs machine':'Abduction Cuisses (Leg Abduction)',   // la version DEBOUT est retirée (09/08) ; la machine assise reste
  'tirage horizontal poulie':'Rowing Câble (Tirage Horizontal)','tirage horizontal':'Rowing Câble (Tirage Horizontal)',
  'step ups':'Montée sur Box (Step-up)','step up':'Montée sur Box (Step-up)',
  'extension triceps corde':'Triceps Corde Poulie',
  'corde a sauter':'Sauts à la Corde',         // saut à la corde ≠ Triceps Corde (faux ami « corde »)
  // 11e vague (retour GPT prog femme) : un exo HALTÈRES ne doit pas tomber sur une MACHINE
  'developpe epaules halteres':'Développé Haltères Assis',
  'assis abducteurs machine':'Abduction Cuisses (Leg Abduction)'  // le « assis » (position) ne doit pas gagner sur « abducteurs » (muscle)
});
// ─── EXLIB v3 — alias d'import (dicts GPT, familles spéciales : Add/Abd hanche, Box Jump, Battle Rope, Farmer's) ───
Object.assign(_EX_EQUIV,{
  'cable hip abduction':'Abduction Cuisses (Leg Abduction)','standing hip abduction':'Abduction Cuisses (Leg Abduction)',
  'cable hip adduction':'Adduction Cuisses (Leg Adduction)','standing hip adduction':'Adduction Cuisses (Leg Adduction)',
  'alternating waves':'Battle Rope','battle rope waves':'Battle Rope','double waves':'Battle Rope',
});
// ─── EXLIB v3 — alias d'import (dicts GPT, familles 6-14 + spéciales) → nom canonique EXLIB ───
// Fentes, Quadriceps, Ischios, Mollets, Gainage/Abdos, Curl, Triceps, Épaules, Poussée verticale.
// Même principe : rattache un libellé importé au bon exo EXLIB, ne crée jamais d'exercice.
Object.assign(_EX_EQUIV,{
  'french press':'Barre au Front','lying triceps extension':'Barre au Front','skull crusher':'Barre au Front',
  'battle ropes':'Battle Rope','rope waves':'Battle Rope',
  'jump box':'Box Jump','plyo box jump':'Box Jump',
  'burpee':'Burpees','burpees conditioning':'Burpees',
  'cossack':'Cossack Squat','side squat':'Cossack Squat',
  'abdominal crunch':'Crunch','basic crunch':'Crunch','floor crunch':'Crunch',
  'ab crunch machine':'Crunch Machine','machine crunch':'Crunch Machine',
  'kneeling cable crunch':'Crunch Poulie',
  'spider curl':'Curl Araignée (Spider Curl)','spider db curl':'Curl Araignée (Spider Curl)',
  'arm curl machine':'Curl Barre','barbell curl':'Curl Barre','bb curl':'Curl Barre','biceps curl machine':'Curl Barre','machine curl':'Curl Barre','standing barbell curl':'Curl Barre',
  'concentration curl':'Curl Concentré','concentration db curl':'Curl Concentré',
  // Le Bayesian Curl est retiré du catalogue (09/08) : on redirige vers le curl à la poulie, dont il est une variante.
  'bayesian cable curl':'Curl Poulie','bayesian curl':'Curl Poulie',
  'ez bar curl':'Curl EZ','ez curl':'Curl EZ',
  'db curl':'Curl Haltères','dumbbell curl':'Curl Haltères',
  'incline curl':'Curl Incliné','incline dumbbell curl':'Curl Incliné',
  'cable leg curl':'Curl Ischio-jambiers (Leg Curl)','leg curl poulie':'Curl Ischio-jambiers (Leg Curl)','low cable leg curl':'Curl Ischio-jambiers (Leg Curl)',
  'cable curl':'Curl Poulie','standing cable curl':'Curl Poulie',
  'curl pupitre':'Curl Pupitre Machine','preacher curl':'Curl Pupitre Machine','preacher machine curl':'Curl Pupitre Machine','scott curl':'Curl Pupitre Machine',
  'dragon flag':'Drapeau (Dragon Flag)','dragon flag hold':'Drapeau (Dragon Flag)',
  'competition bench press':'Développé Couché','flat bench':'Développé Couché','powerlifting bench':'Développé Couché',
  'barbell overhead press':'Développé Militaire','developpe militaire barre':'Développé Militaire','machine overhead press':'Développé Militaire','military press':'Développé Militaire','ohp':'Développé Militaire','overhead press':'Développé Militaire','overhead press machine':'Développé Militaire','standing military press':'Développé Militaire',
  'db overhead press':'Développé Militaire Haltères','dumbbell shoulder press':'Développé Militaire Haltères',
  'machine shoulder press':'Développé Épaules Machine','seated shoulder press':'Développé Épaules Machine','shoulder press machine':'Développé Épaules Machine',
  'db overhead extension':'Extension Nuque Haltère','extension nuque poulie':'Extension Nuque Haltère','overhead cable triceps extension':'Extension Nuque Haltère','overhead dumbbell triceps extension':'Extension Nuque Haltère',
  'cable leg extension':'Extension Quadriceps (Leg Extension)','leg extension machine':'Extension Quadriceps (Leg Extension)','leg extension poulie':'Extension Quadriceps (Leg Extension)','leg extension seated':'Extension Quadriceps (Leg Extension)','low cable knee extension':'Extension Quadriceps (Leg Extension)','machine leg extension':'Extension Quadriceps (Leg Extension)','quadriceps extension':'Extension Quadriceps (Leg Extension)','seated leg extension':'Extension Quadriceps (Leg Extension)',
  'cable triceps pushdown':'Extension Triceps','extension triceps poulie':'Extension Triceps','triceps pushdown':'Extension Triceps',
  'cable kickback':'Extension Triceps Arrière (Kickback)','db kickback':'Extension Triceps Arrière (Kickback)','kickback triceps':'Extension Triceps Arrière (Kickback)','triceps kickback':'Extension Triceps Arrière (Kickback)',
  'farmer carry':'Farmer\'s Walk','farmer walk':'Farmer\'s Walk','loaded carry':'Farmer\'s Walk',
  'barbell lunge':'Fentes','bb lunge':'Fentes','db lunge':'Fentes','dumbbell lunge':'Fentes','fentes barre':'Fentes','fentes halteres':'Fentes','forward lunge':'Fentes','lunge':'Fentes','static lunge':'Fentes',
  'backward lunge':'Fentes Arrière','reverse lunge':'Fentes Arrière',
  'kb lunge':'Fentes Kettlebell','kettlebell lunge':'Fentes Kettlebell',
  'cossack lunge':'Fentes Latérales','lateral lunge':'Fentes Latérales','side lunge':'Fentes Latérales',
  'walking lunge':'Fentes Marchées','walking lunges':'Fentes Marchées','walking split squat':'Fentes Marchées',
  'mountain climber':'Grimpeur (Mountain Climber)','mountain climbers':'Grimpeur (Mountain Climber)',
  'jefferson curl mobility':'Jefferson Curl',
  'machine seated leg curl':'Leg Curl Assis Machine','seated hamstring curl':'Leg Curl Assis Machine','seated leg curl':'Leg Curl Assis Machine',
  'leg curl machine':'Leg Curl Couché Machine','lying hamstring curl':'Leg Curl Couché Machine','lying leg curl':'Leg Curl Couché Machine','prone leg curl':'Leg Curl Couché Machine',
  'db hamstring curl':'Leg Curl Haltère','dumbbell leg curl':'Leg Curl Haltère',
  'leg curl debout unilateral':'Leg Curl Unilatéral Debout','one leg standing curl':'Leg Curl Unilatéral Debout','single leg curl':'Leg Curl Unilatéral Debout','standing leg curl':'Leg Curl Unilatéral Debout',
  'band leg curl':'Leg Curl Élastique','resistance band leg curl':'Leg Curl Élastique',
  'calf raise machine':'Mollets Machine Debout','mollets debout machine':'Mollets Machine Debout','standing calf machine':'Mollets Machine Debout','standing calf raise':'Mollets Machine Debout',
  'barbell step up':'Montée sur Box Haltères','bench step up':'Montée sur Box Haltères','box step up':'Montée sur Box Haltères','db step up':'Montée sur Box Haltères','dumbbell step up':'Montée sur Box Haltères','step up':'Montée sur Box Haltères','step up barre':'Montée sur Box Haltères','step up halteres':'Montée sur Box Haltères',
  'bent over reverse fly':'Oiseau','rear delt fly':'Oiseau','reverse fly':'Oiseau',
  // Le Sit-up est retiré (09/08). « sit up » reste un mot de salle TRÈS courant : sans cible il
  // rendrait « Aucun résultat » et la personne créerait un doublon perso. Redirigé vers le Crunch.
  // ✅ VALIDÉ PAR MICHEL le 09/08, et sa formule vaut mieux que mon hésitation :
  //    « sit up c'est un crunch mais total ». Même mouvement, amplitude plus grande — la
  //    redirection est donc juste, ce n'est pas un pis-aller.
  'ab sit up':'Crunch','full sit up':'Crunch','sit up':'Crunch',
  'medicine ball twist':'Rotation Russe (Russian Twist)','russian twist':'Rotation Russe (Russian Twist)','weighted russian twist':'Rotation Russe (Russian Twist)',
  'jump rope':'Sauts à la Corde','rope skipping':'Sauts à la Corde','skipping rope':'Sauts à la Corde',
  'weighted sissy squat':'Sissy Squat',
  'ez bar skull crusher':'Skull Crusher Barre EZ','ez skull crusher':'Skull Crusher Barre EZ','skull crusher ez':'Skull Crusher Barre EZ',
  'backward sled drag':'Sled Pull','sled drag':'Sled Pull',
  'prowler push':'Sled Push','weighted sled push':'Sled Push',
  'fentes smith machine':'Smith Machine Fentes','smith machine lunge':'Smith Machine Fentes','smith split squat':'Smith Machine Fentes',
  'competition deadlift':'Soulevé de Terre','powerlifting deadlift':'Soulevé de Terre',
  'competition squat':'Squat à la Barre','powerlifting squat':'Squat à la Barre','squat':'Squat à la Barre',
  'barbell thruster':'Thruster','dumbbell thruster':'Thruster','squat to press':'Thruster','thruster halteres':'Thruster',
  'high pull upright':'Tirage Menton','rowing menton':'Tirage Menton','upright row':'Tirage Menton',
  'cable face pull':'Tirage Visage (Face Pull)','face pull':'Tirage Visage (Face Pull)','rope face pull':'Tirage Visage (Face Pull)',
  'machine triceps':'Triceps Poulie','seated triceps machine':'Triceps Poulie',
  // 'tgu' retiré le 09/08 avec l'exercice Turkish Get-Up (un synonyme sans cible = « Aucun résultat »)
  'db front raise':'Élévations Frontales','front raise':'Élévations Frontales',
  'db lateral raise':'Élévations Latérales (Lateral Raise)','lateral raise':'Élévations Latérales (Lateral Raise)',
  'donkey calf machine':'Élévations Mollets Penché (Donkey Calf Raise)','donkey calf raise':'Élévations Mollets Penché (Donkey Calf Raise)','donkey raise':'Élévations Mollets Penché (Donkey Calf Raise)',
});
// ─── EXLIB v3 — alias d'import (dicts GPT, 5 familles) → nom canonique EXLIB ───
// Généré depuis les fiches d'alias GPT (Poussées H, Tirages H/V, Squats, Hip Hinge).
// N'ajoute JAMAIS d'exercice : rattache un libellé importé au bon exo EXLIB (stats sur le canonique).
// La table curatée _EX_EQUIV reste prioritaire (ces clés en sont exclues).
Object.assign(_EX_EQUIV,{
  'hip belt squat':'Belt Squat','machine belt squat':'Belt Squat',
  'decline chest press':'Chest Press Machine Déclinée','decline machine press':'Chest Press Machine Déclinée',
  'chest press':'Chest Press Machine Horizontale','developpe machine':'Chest Press Machine Horizontale','hammer chest press':'Chest Press Machine Horizontale','horizontal chest press':'Chest Press Machine Horizontale','machine chest press':'Chest Press Machine Horizontale','machine pectoraux':'Chest Press Machine Horizontale','matrix chest press':'Chest Press Machine Horizontale','panatta chest press':'Chest Press Machine Horizontale','presse poitrine':'Chest Press Machine Horizontale','seated chest press':'Chest Press Machine Horizontale','technogym chest press':'Chest Press Machine Horizontale',
  'incline chest press':'Chest Press Machine Inclinée','incline hammer press':'Chest Press Machine Inclinée','incline machine press':'Chest Press Machine Inclinée','incline matrix press':'Chest Press Machine Inclinée',
  'cable crossover':'Croisé Poulie (Cable Crossover)','cross over':'Croisé Poulie (Cable Crossover)','high cable fly':'Croisé Poulie (Cable Crossover)','low cable fly':'Croisé Poulie (Cable Crossover)','vis a vis':'Croisé Poulie (Cable Crossover)',
  'bodyweight dips':'Dips','chest dips':'Dips','dips pectoraux':'Dips',
  'assisted dip':'Dips Machine Assistée','assisted dip machine':'Dips Machine Assistée','machine dips assistes':'Dips Machine Assistée',
  'barbell bench press':'Développé Couché','bb bench':'Développé Couché','bench':'Développé Couché','bench libre':'Développé Couché','bench press':'Développé Couché','dc':'Développé Couché','developpe barre':'Développé Couché','developpe couche barre':'Développé Couché','developpe poitrine barre':'Développé Couché','flat bench press':'Développé Couché',
  'db bench':'Développé Couché Haltères','db bench press':'Développé Couché Haltères','developpe halteres':'Développé Couché Haltères','developpe poitrine halteres':'Développé Couché Haltères','dumbbell bench press':'Développé Couché Haltères','flat dumbbell press':'Développé Couché Haltères',
  'decline barbell bench':'Développé Décliné','decline bench press':'Développé Décliné','developpe decline barre':'Développé Décliné',
  'decline db press':'Développé Décliné Haltères','decline dumbbell press':'Développé Décliné Haltères',
  'developpe incline barre':'Développé Incliné','incline barbell bench':'Développé Incliné','incline bench press':'Développé Incliné','incline bp':'Développé Incliné','incline press':'Développé Incliné',
  'incline db press':'Développé Incliné Haltères','incline dumbbell bench':'Développé Incliné Haltères','incline dumbbell press':'Développé Incliné Haltères',
  'barbell good morning':'Inclinaison Lombaire (Good Morning)','gm':'Inclinaison Lombaire (Good Morning)','good morning':'Inclinaison Lombaire (Good Morning)','good morning barbell':'Inclinaison Lombaire (Good Morning)',
  'american swing':'Kettlebell Swing','kb swing':'Kettlebell Swing','russian swing':'Kettlebell Swing',
  'landmine meadows row':'Meadows Row',
  'ohs':'Overhead Squat','olympic overhead squat':'Overhead Squat',
  'butterfly machine':'Pec Deck','chest fly machine':'Pec Deck','pec fly machine':'Pec Deck',
  'pendulum':'Pendulum Squat','pendulum machine squat':'Pendulum Squat',
  'diamond push up':'Pompes Diamant','diamond pushup':'Pompes Diamant',
  'pompes avec lest':'Pompes Lestées','weighted push up':'Pompes Lestées','weighted pushup':'Pompes Lestées',
  'bridge':'Pont Fessier (Glute Bridge)','floor bridge':'Pont Fessier (Glute Bridge)','glute bridge':'Pont Fessier (Glute Bridge)',
  'barbell hip thrust':'Hip Thrust Barre (Poussée de Hanche)','db hip thrust':'Hip Thrust Barre (Poussée de Hanche)','dumbbell hip thrust':'Hip Thrust Barre (Poussée de Hanche)','glute thrust':'Hip Thrust Barre (Poussée de Hanche)','hip thrust':'Hip Thrust Barre (Poussée de Hanche)','hip thrust barbell':'Hip Thrust Barre (Poussée de Hanche)','hip thrust halteres':'Hip Thrust Barre (Poussée de Hanche)',
  'hip thrust machine':'Hip Thrust Machine (Poussée de Hanche)','machine hip thrust':'Hip Thrust Machine (Poussée de Hanche)',
  // ⚠️ CORRIGÉ le 25/08 — ces 4 équivalences pointaient vers « Pull-over » tout court, retiré du
  //    catalogue ce jour-là : un import les aurait rattachées à un exercice qui n'existe plus.
  //    ⭐ Et c'était DÉJÀ faux avant le retrait : les quatre décrivent la version POULIE (câble,
  //    bras tendus à la poulie haute). Le retrait n'a pas créé le défaut, il l'a rendu visible.
  //    Trouvé en cherchant les jumelles du retrait (R8), pas après coup.
  'cable pullover':'Pull-over Poulie','pullover poulie':'Pull-over Poulie','straight arm lat pulldown':'Pull-over Poulie','straight arm pulldown':'Pull-over Poulie',
  'machine pullover':'Pullover Machine','nautilus pullover':'Pullover Machine',
  'barbell bent over row':'Rowing Barre (Tirage Horizontal)','barbell row':'Rowing Barre (Tirage Horizontal)','bb row':'Rowing Barre (Tirage Horizontal)','bent over dumbbell row':'Rowing Barre (Tirage Horizontal)','bent over row':'Rowing Barre (Tirage Horizontal)','bent row':'Rowing Barre (Tirage Horizontal)','db row':'Rowing Barre (Tirage Horizontal)','dumbbell row':'Rowing Barre (Tirage Horizontal)','rowing barre pronation':'Rowing Barre (Tirage Horizontal)','rowing deux halteres':'Rowing Barre (Tirage Horizontal)','rowing halteres':'Rowing Barre (Tirage Horizontal)',
  'chest supported row machine':'Rowing Machine (Tirage Horizontal)','machine row':'Rowing Machine (Tirage Horizontal)','row machine':'Rowing Machine (Tirage Horizontal)','seated row machine':'Rowing Machine (Tirage Horizontal)',
  'chest supported t bar row':'Rowing T-Bar Machine','landmine row':'Rowing T-Bar Machine','rowing t bar':'Rowing T-Bar Machine','t bar row':'Rowing T-Bar Machine',
  'safety squat bar':'Safety Bar Squat','ssb squat':'Safety Bar Squat',
  'seal barbell row':'Seal Row','seal bench row':'Seal Row',
  'bodyweight sissy squat':'Sissy Squat',
  'bench smith':'Smith Machine Développé Couché','smith bench press':'Smith Machine Développé Couché','smith machine bench':'Smith Machine Développé Couché',
  'smith machine back squat':'Smith Machine Squat','smith squat':'Smith Machine Squat',
  'barbell deadlift':'Soulevé de Terre','conventional deadlift':'Soulevé de Terre','deadlift':'Soulevé de Terre','dl':'Soulevé de Terre','standard deadlift':'Soulevé de Terre',
  'sldl':'Soulevé de Terre Jambes Tendues','stiff leg deadlift':'Soulevé de Terre Jambes Tendues','straight leg deadlift':'Soulevé de Terre Jambes Tendues',
  'rdl':'Soulevé de Terre Roumain Barre','romanian barbell deadlift':'Soulevé de Terre Roumain Barre','romanian deadlift':'Soulevé de Terre Roumain Barre',
  'db rdl':'Soulevé de Terre Roumain Haltères','dumbbell romanian deadlift':'Soulevé de Terre Roumain Haltères','romanian dumbbell deadlift':'Soulevé de Terre Roumain Haltères',
  'one leg romanian deadlift':'Soulevé de Terre Roumain Unilatéral','single leg rdl':'Soulevé de Terre Roumain Unilatéral','single leg romanian deadlift':'Soulevé de Terre Roumain Unilatéral','sl rdl':'Soulevé de Terre Roumain Unilatéral',
  'sumo deadlift':'Soulevé de Terre Sumo','wide stance deadlift':'Soulevé de Terre Sumo',
  'hex bar deadlift':'Soulevé de Terre Trap Bar','trap bar deadlift':'Soulevé de Terre Trap Bar',
  'barbell front squat':'Squat Avant','front squat':'Squat Avant','olympic front squat':'Squat Avant',
  'dumbbell goblet squat':'Squat Gobelet (Goblet Squat)','goblet squat':'Squat Gobelet (Goblet Squat)','kettlebell goblet squat':'Squat Gobelet (Goblet Squat)',
  'hack squat':'Squat Hack (Hack Squat)','machine hack squat':'Squat Hack (Hack Squat)','plate loaded hack squat':'Squat Hack (Hack Squat)',
  'one leg squat':'Squat Pistol','pistol':'Squat Pistol','pistol squat':'Squat Pistol','single leg squat':'Squat Pistol',
  // ⛔ 'sumo squat' / 'wide stance squat' RETIRÉS le 25/08 : ils visaient « Squat Sumo »,
  //    sorti du catalogue ce jour-là. Aucune autre fiche ne décrit ce geste, donc on ne les
  //    redirige pas — un import « sumo squat » sera proposé comme exercice NOUVEAU, ce qui
  //    est honnête, plutôt que rattaché de force à un squat qui n'est pas le bon.
  'back squat':'Squat à la Barre','barbell back squat':'Squat à la Barre','bb squat':'Squat à la Barre','high bar squat':'Squat à la Barre','low bar squat':'Squat à la Barre',
  'behind neck lat pulldown':'Tirage Nuque','behind neck pulldown':'Tirage Nuque',
  'front lat pulldown':'Tirage Poulie Haute (Lat Pulldown)','front pulldown':'Tirage Poulie Haute (Lat Pulldown)','lat pull front':'Tirage Poulie Haute (Lat Pulldown)',
  'partial deadlift':'Tirage en Rack (Rack Pull)','pin pull':'Tirage en Rack (Rack Pull)','rack pull':'Tirage en Rack (Rack Pull)',
  'assisted chin up':'Traction Assistée','assisted pull up':'Traction Assistée','pull up machine':'Traction Assistée','tractions assistees':'Traction Assistée',
  'chest fly':'Écarté Haltères','db fly':'Écarté Haltères','dumbbell fly':'Écarté Haltères','ecarte poitrine halteres':'Écarté Haltères','pec fly':'Écarté Haltères',
  'cable chest fly':'Écarté Poulie','cable fly':'Écarté Poulie','poulie vis a vis':'Écarté Poulie','standing cable fly':'Écarté Poulie',
});
// tier : 'auto' (≥90 → rattacher direct) · 'confirm' (grise → demander à l'utilisateur) · 'new' (<seuil → créer).
function _matchExercise(name,opts){
  opts=opts||{}; const all=(typeof EXLIB!=='undefined')?EXLIB:[];
  const q=_normEx(name); if(!q)return{match:null,score:0,confidence:0,tier:'new',via:'vide'};
  // 1) exact (après normalisation accents/casse/ponctuation)
  for(const ex of all){ if(_normEx(ex.n)===q) return {match:ex.n,score:1,confidence:100,tier:'auto',via:'exact'}; }
  // 1bis) EXACT SUR LE NOM SANS SA PARENTHÈSE — 77 exercices du catalogue portent une
  // parenthèse EXPLICATIVE (« Rowing Machine (Tirage Horizontal) », « Tractions (Pull-up) »,
  // « Chaise (Wall Sit) »). Elle nomme la famille, elle ne distingue pas l'exercice.
  // ⚠️ POURQUOI C'EST NÉCESSAIRE (retour Michel, 09/08, sur un vrai programme de Milo) :
  // quand Milo écrit un récapitulatif compact, il abrège — « Rowing Machine » au lieu du nom
  // complet. Or le recouvrement de mots jette `machine`, `haltère`, `barre`, `poulie` (ils
  // avaient été mis dans les mots vides pour filtrer le bruit commercial type « Evolution
  // X900 »). « Rowing Machine » et « Rowing Haltère » se réduisaient donc tous deux à
  // « rowing » — la MÊME question — et tombaient sur « Rowing Smith Machine ».
  // Mesuré : **17 des 77 (22 %)** se rattachaient au mauvais exercice une fois abrégés,
  // dont 4 appliqués AUTOMATIQUEMENT à l'import (Élévations Latérales → …Câble,
  // Hip Thrust Haltère → Hip Thrust Barre, Hyperextension → …Machine, Montée sur Box → …Haltères).
  // ⚠️ VÉRIFIÉ AVANT D'ÉCRIRE CETTE RÈGLE : sur les 324 exercices, **zéro collision** — aucun
  // nom sans parenthèse n'égale le nom complet d'un autre exercice, et deux exercices ne
  // partagent jamais la même base. Sans cette vérification, la règle créerait des fusions.
  for(const ex of all){
    const base=_normEx(String(ex.n).replace(/\s*\([^)]*\)\s*$/,''));
    if(base && base!==_normEx(ex.n) && base===q)
      return {match:ex.n,score:1,confidence:100,tier:'auto',via:'exact (sans la parenthèse)'};
  }
  // 2) synonyme anglais EX_EN exact
  if(typeof EX_EN!=='undefined'){ for(const ex of all){ const en=EX_EN[ex.n]; if(en&&_normEx(en)===q) return {match:ex.n,score:.96,confidence:96,tier:'auto',via:'synonyme EN'}; } }
  // 3) équivalence sémantique connue (curatée → fiable), tolérante au mot « machine »
  const eq=_eqLookup(q,name);
  if(eq){ return {match:eq,score:.95,confidence:95,tier:'auto',via:'équivalence connue'}; }
  // 4) recouvrement de mots (Jaccard) contre le NOM FR *et* le synonyme EN, + garde-fou modificateurs
  const qt=_exTokens(name); if(!qt.length)return{match:null,score:0,confidence:0,tier:'new',via:'aucun mot utile'};
  const qset=new Set(qt); let best=null,bestScore=0;
  const hasEN=(typeof EX_EN!=='undefined');
  const qPat=_movPattern(name);   // garde-fou taxonomie : schémas moteurs différents → jamais fusionner
  for(const ex of all){
    if(qPat){ const cPat=_movPattern(ex.n); if(cPat && cPat!==qPat) continue; }
    const jN=_exJac(qset,new Set(_exTokens(ex.n)));                                   // vs nom français
    const jE=hasEN&&EX_EN[ex.n]?_exJac(qset,new Set(_exTokens(EX_EN[ex.n]))):0;       // vs synonyme anglais
    const jac=Math.max(jN,jE);
    if(jac>bestScore){ best=ex.n; bestScore=jac; }
  }
  const conf=Math.round(bestScore*100);
  const AUTO=(opts.auto!=null)?opts.auto:90, CONFIRM=(opts.confirm!=null)?opts.confirm:22;
  if(best && conf>=AUTO) return {match:best,score:+bestScore.toFixed(2),confidence:conf,tier:'auto',via:'mots'};
  if(best && conf>=CONFIRM) return {match:best,score:+bestScore.toFixed(2),confidence:conf,tier:'confirm',via:(conf>=34?'mots':'ambigu → IA')};
  return {match:null,score:+bestScore.toFixed(2),confidence:conf,tier:'new',via:'nouveau'};
}
// Valide le set et focus automatiquement le kg du prochain set non-done
function confirmSetAndNext(ei,si){
  toggleSet(ei,si);
  const exs=S.wkt.exs;
  for(let e=ei;e<exs.length;e++){
    for(let s=(e===ei?si+1:0);s<exs[e].sets.length;s++){
      if(!exs[e].sets[s].done){
        const row=document.getElementById(`sr-${e}-${s}`);
        const inp=row&&row.querySelector('.sinp');
        if(inp){inp.focus();inp.select&&inp.select();}
        return;
      }
    }
  }
}
// Enchaîne la touche Entrée entre une liste d'inputs
function chainInputs(ids,lastFn){
  ids.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el)return;
    const isLast=i===ids.length-1;
    el.setAttribute('enterkeyhint',isLast?'done':'next');
    el.onkeydown=(e)=>{
      if(e.key!=='Enter')return;
      e.preventDefault();
      if(!isLast){const n=document.getElementById(ids[i+1]);if(n){n.focus();if(n.select)n.select();}}
      else if(lastFn)lastFn();
    };
  });
}
function addSet(ei){
  const ex=S.wkt.exs[ei];
  // Nouvelle série basée sur la SÉANCE PRÉCÉDENTE (cohérent avec la colonne « Précédent »).
  const prev=getPrev(ex.name);
  // ⚠️ PAR RÔLE, pas par position (voir _prevAligne) : la nouvelle série est une série de
  // TRAVAIL, elle se compare aux séries de travail d'avant — jamais à un échauffement.
  const p=_prevAligne(prev, ex.sets.concat([{type:'N'}])).pop();
  // Repli si aucune séance précédente : copie la DERNIÈRE série de la séance en cours
  // → une nouvelle série ne repart jamais « à vide » (kg conservé).
  const last=ex.sets.length?ex.sets[ex.sets.length-1]:null;
  const kg   = p ? p.kg   : (last ? (last.kg||0)   : 0);
  const reps = p ? p.reps : (last ? (last.reps||8) : 8);
  ex.sets.push({kg,reps,type:'N',done:false,rm1:0});
  persist();renderExBlocks();
}
function rmLastSet(ei){const ex=S.wkt.exs[ei];if(ex.sets.length>1){ex.sets.pop();persist();renderExBlocks();}}
function rmEx(ei){
  closeExMenu();
  const name=S.wkt.exs[ei]&&S.wkt.exs[ei].name||'cet exercice';
  showConfirm('Supprimer l\'exercice ?',`"${name}" et toutes ses séries seront supprimés de la séance.`,()=>{
    const gid=S.wkt.exs[ei]&&S.wkt.exs[ei].group;
    if(gid){const rem=S.wkt.exs.filter((e,i)=>i!==ei&&e.group===gid);if(rem.length<=1)rem.forEach(e=>delete e.group);}
    S.wkt.exs.splice(ei,1);
    if(ei<_expandedEx)_expandedEx--;
    else if(_expandedEx>=S.wkt.exs.length)_expandedEx=Math.max(0,S.wkt.exs.length-1);
    persist();renderExBlocks();
  });
}
function clearWkt(){
  showConfirm('Annuler la séance ?','Tous les exercices et séries en cours seront perdus.',()=>{
    stopRest();
    S.wkt=null;
    try{localStorage.setItem('ft4_wkt','null');localStorage.removeItem('ft4_wkt_draft');}catch(e){}
    persist();
    _syncWakeLock();          // plus de séance → on rend l'écran (R15 : tout chemin de fermeture)
    renderLog();
    toast('Séance annulée','info');
  },'Abandonner');
}
// Tout effacer : vide les exercices mais GARDE la séance ouverte (ex. mauvais programme chargé).
// Ne touche PAS l'historique ni les records. Distinct de « ✕ Annuler la séance » (qui quitte).
function clearAllEx(){
  if(!(S.wkt&&S.wkt.exs&&S.wkt.exs.length))return;
  showConfirm('Vider la séance ?','Tous les exercices en cours seront retirés — pratique si tu as chargé le mauvais programme. La séance reste ouverte (tu pourras en charger une autre). Ton historique et tes records ne sont pas touchés.',()=>{
    stopRest();
    S.wkt.exs=[];
    _expandedEx=null;
    persist();
    renderLog();
    toast('Séance vidée','info');
  },'Vider');
}
// Sync boutons ✕/Changer dans l'en-tête + repositionne le FAB
// Appellé à chaque renderExBlocks() pour rester cohérent sans passer par renderLog() entier
function _syncLogHdrBtns(){
  const el=document.getElementById('log-hdr-btns');
  if(!el)return;
  const hasExs=!!(S.wkt&&S.wkt.exs&&S.wkt.exs.length);
  el.innerHTML=_pauseBtnHtml()+(hasExs
    ?'<button onclick="clearWkt()" style="padding:7px 11px;border-radius:10px;border:1px solid rgba(255,45,85,.3);background:rgba(255,45,85,.08);color:var(--red);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">✕</button>'
     +'<button onclick="clearAllEx()" style="padding:7px 10px;border-radius:10px;border:1px solid rgba(255,45,85,.3);background:rgba(255,45,85,.08);color:var(--red);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;display:inline-flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Vider</button>'
     +'<button onclick="openProgModal()" style="padding:8px 12px;border-radius:10px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;white-space:nowrap;touch-action:manipulation;">📋 Changer</button>'
    :'');
  // ⛔ `requestAnimationFrame(_positionFab)` retiré le 11/08/2026 avec la fonction elle-même :
  //    elle repositionnait un bouton flottant `#fab-session` qui n'existe plus (docké dans la
  //    barre depuis un redesign). Le bouton central est désormais protégé par la MESURE —
  //    règle d'or #9, témoin permanent dans les tests de parcours. Détail dans `app.js`.
}
// Appui maintenu 400ms requis pour déclencher la suppression (anti-effleurement)
let _rmHoldTimer=null;
function _rmHoldStart(btn,ei){
  _rmHoldTimer=setTimeout(()=>{_rmHoldTimer=null;btn.style.opacity='';btn.style.transform='';rmEx(ei);},400);
  btn.style.opacity='0.4';
  btn.style.transform='scale(0.88)';
}
function _rmHoldEnd(btn){
  if(_rmHoldTimer){clearTimeout(_rmHoldTimer);_rmHoldTimer=null;}
  btn.style.opacity='';btn.style.transform='';
}
let _rmSetHoldTimer=null;
function _rmSetHoldStart(btn,ei){
  _rmSetHoldTimer=setTimeout(()=>{_rmSetHoldTimer=null;btn.style.opacity='';btn.style.transform='';rmLastSet(ei);},400);
  btn.style.opacity='0.4';btn.style.transform='scale(0.88)';
}
function _rmSetHoldEnd(btn){
  if(_rmSetHoldTimer){clearTimeout(_rmSetHoldTimer);_rmSetHoldTimer=null;}
  btn.style.opacity='';btn.style.transform='';
}
let _expandedEx=null;
let _groupMode=false;let _selectedGroupExs=new Set();
let _exPickerMode='workout';
let _replaceEi=null; // index de l'exo à remplacer (menu ⋯ → Remplacer l'exercice)
let _editProgIdx=-1,_editProgData=null,_editDayIdx=0;
function addExercise(name){
  /* ⭐⭐ LE MODE « PROG » RESTE OUVERT LUI AUSSI (25/08) — et c'est ici que ça compte le plus.
     Le sélecteur avait été rendu persistant côté SÉANCE la version d'avant… mais l'éditeur de
     programme, lui, refermait encore à chaque exercice. Or c'est exactement là que Michel monte
     ses listes : *« je vais vouloir créer mon programme et il va falloir que ce soit rapide »*.
     Laisser ce chemin fermer aurait été corriger le symptôme du côté où il gênait le MOINS.
     ⛔ Le mode et le jour cible (`_editDayIdx`) sont CONSERVÉS tant qu'on n'a pas fermé — c'est
     `closeExPicker` qui repasse en 'workout', pas l'ajout. Sinon le 2ᵉ exercice partirait dans
     la séance au lieu du programme, en silence. */
  if(_exPickerMode==='prog'){
    _addExToProgEdit(name);
    const s=document.getElementById('ex-search'); if(s)s.value='';
    filterEx();
    _exAjoutes++; _majTitreExPicker();
    return;
  }
  if(_exPickerMode==='addToGroup'){
    closeExPicker();
    _doAddToGroup(name);
    _exPickerMode='workout';
    return;
  }
  if(_exPickerMode==='replace'){
    _exPickerMode='workout';       // avant closeExPicker (qui nullifie _replaceEi si mode==='replace')
    _replaceExInWorkout(name);     // lit _replaceEi (encore défini)
    closeExPicker();
    return;
  }
  if(_exPickerMode==='replaceSess'){ // remplacement dans une séance passée (setup.js)
    _exPickerMode='workout';
    if(typeof _replaceSessExPick==='function')_replaceSessExPick(name);
    closeExPicker();
    return;
  }
  if(_exPickerMode==='addSess'){ // ajout d'un exercice à une séance passée (setup.js)
    _exPickerMode='workout';
    if(typeof _addSessExPick==='function')_addSessExPick(name);
    closeExPicker();
    return;
  }
  if(!S.wkt)S.wkt={date:today(),exs:[]};
  const prev=getPrev(name);
  // Pré-remplissage PAR SÉRIE depuis la séance précédente (série i → prev[i], repli dernière série).
  const _mod=[0,1,2].map(i=>({type:i===0&&prev.length?'É':'N'}));
  const _pa=_prevAligne(prev,_mod);   // par RÔLE : l'échauffement ne prend pas la 1ʳᵉ série de travail
  const sets=_mod.map((m,i)=>{const pp=_pa[i];return{kg:pp?pp.kg:0,reps:pp?pp.reps:5,type:m.type,done:false,rm1:0};});
  S.wkt.exs.push({name,sets});
  _expandedEx=S.wkt.exs.length-1;
  persist();renderExBlocks();
  /* ⭐⭐ LE SÉLECTEUR RESTE OUVERT (25/08/2026) — c'est le goulot que Michel a senti en premier
     en préparant la création de programmes : *« il va falloir améliorer aussi l'accès aux
     exercices… et il va falloir que ce soit rapide »*.
     AVANT : `closeExPicker()` était appelé ici, à chaque ajout. Monter une séance de 6 exercices
     demandait donc **6 allers-retours** — rouvrir le sélecteur, retaper une recherche, six fois.
     ⛔ SEUL LE MODE « WORKOUT » RESTE OUVERT, et c'est la nuance qui compte : `replace`,
     `replaceSess`, `addSess`, `prog` et `addToGroup` désignent UNE place précise et se ferment
     donc tout seuls, plus haut dans cette fonction. Ils ne passent jamais ici (chacun rend avant).
     ⚠️ ET LE SCROLL A DÛ PARTIR AVEC : `scrollIntoView` faisait défiler l'écran DERRIÈRE la
     modale — un mouvement qu'on ne voit pas, sur une page qu'on ne regarde pas. Il est reporté
     à la fermeture (`closeExPicker`), au moment où l'écran redevient visible.
     ⛔ La sortie reste ÉVIDENTE (R24 : informer sans bloquer) : le bouton « Fermer », la poignée
     et le tap à l'extérieur marchent tous, et le titre dit combien on a ajouté. */
  const s=document.getElementById('ex-search'); if(s){s.value='';}
  filterEx();
  _exAjoutes++;
  _majTitreExPicker();
  if(s&&!('ontouchstart' in window))s.focus();   // ⚠️ pas sur mobile : le clavier masquerait la liste
  toast(name+' ajouté !','info');
}
/* Compteur de ce qui vient d'être ajouté SANS fermer — remis à zéro à chaque ouverture.
   Il sert à deux choses : voir sa progression, et se rappeler qu'on peut continuer. */
let _exAjoutes=0;
function _majTitreExPicker(){
  const h=document.querySelector('#mod-ex .modal h2');
  if(!h)return;
  h.textContent = _exAjoutes>0
    ? 'Choisir un exercice · '+_exAjoutes+' ajouté'+(_exAjoutes>1?'s':'')
    : 'Choisir un exercice';
}
// Remplacer un exercice mal choisi (ex. Développé Décliné → Développé Couché) SANS perdre les séries.
function openExPickerForReplace(ei){
  closeExMenu();
  _replaceEi=ei;
  _exPickerMode='replace';
  openExPicker();
  toast('Choisis le bon exercice','info');
}
function _replaceExInWorkout(name){
  const ei=_replaceEi;_replaceEi=null;
  if(ei===null||!S.wkt||!S.wkt.exs[ei])return;
  const old=S.wkt.exs[ei].name;
  if(name===old){renderExBlocks();return;}
  // On garde toutes les séries (kg/reps/type/note), on change juste le nom.
  S.wkt.exs[ei].name=name;
  // rm1 des séries validées recalculé sous le nouveau nom (inchangé numériquement, mais cohérent)
  S.wkt.exs[ei].sets.forEach(s=>{if(s.kg&&s.reps)s.rm1=bz(s.kg,s.reps);});
  _expandedEx=ei;
  persist();renderExBlocks();
  toast('Exercice remplacé par '+name,'success');
  _demanderPourquoiSwap(old, name);
}

/* 🔁 « POURQUOI J'AI CHANGÉ D'EXERCICE ? » — UN QCM, ZÉRO JETON (17/08/2026)
   Michel : *« peut-être qu'il demande par une question QCM (ça ne coûte rien en token) pourquoi
   j'ai changé d'exercice »*. Le cas qui l'a fait naître est le sien, séance du 16/08 : il a
   remplacé un rowing haltère par un rowing poitrine appuyée, et il avait DÉJÀ dit à Milo que
   l'exercice ne lui convenait pas — *« je lui ai déjà dit que cet exercice ne me convient pas,
   trop long »*. L'information avait été dite, comprise, et n'atteignait aucune DONNÉE : c'est
   R4 dans sa forme la plus pure, la famille de bugs la plus coûteuse du projet.
   ⚠️⚠️ ET LA DISTINCTION QUI FAIT TOUT LE TRAVAIL : « la machine était prise » n'est PAS une
   préférence. Si on rangeait les quatre réponses dans le même panier, Milo finirait par croire
   que la personne refuse la presse à cuisses parce qu'elle était occupée un mardi — et il
   arrêterait de la proposer, sans que personne comprenne pourquoi. Une raison de CIRCONSTANCE
   est comptée mais jamais transformée en goût (R29 : le coût de l'erreur n'est pas symétrique).
   ⚠️ ON NE DEVINE RIEN : sans réponse, rien n'est écrit. « Plus tard » et la fermeture au doigt
   sont strictement équivalents — la question n'a pas d'effet de bord, donc pas de marqueur à
   poser (R15 ne s'applique pas ici, et c'est voulu).
   ⚠️ ET ELLE NE SE POSE QUE PENDANT UNE SÉANCE EN COURS, une fois par exercice et par séance :
   une question qui revient à chaque manipulation devient du bruit, et le bruit se ferme sans
   lire (R24 : informer sans bloquer). */
const _EX_SWAP_RAISONS=[
  {r:'gene',  ico:'😬', txt:'Il me gêne / je le sens mal',        durable:true},
  {r:'long',  ico:'⏳', txt:'Trop long à installer ou à faire',   durable:true},
  {r:'pris',  ico:'🚧', txt:'Machine prise ou absente aujourd\'hui', durable:false},
  {r:'envie', ico:'🔄', txt:'J\'avais juste envie de varier',      durable:false}
];
let _exSwapPaire=null;                       // {de, vers} — la question en cours
const _exSwapDemande={};                     // déjà demandé pour cet exercice DANS cette séance
function _demanderPourquoiSwap(de, vers){
  try{
    if(!de||!vers||de===vers) return;
    if(!S.wkt) return;                                   // hors séance : on ne dérange pas
    if(_exSwapDemande[de]) return;                       // une seule fois par exercice et par séance
    _exSwapDemande[de]=true;
    _exSwapPaire={de:de, vers:vers};
    const sub=document.getElementById('ex-swap-sub');
    if(sub) sub.textContent=de+' → '+vers;
    const box=document.getElementById('ex-swap-btns');
    if(box) box.innerHTML=_EX_SWAP_RAISONS.map(o=>
      '<button class="btn btn-bg2" style="width:100%;text-align:left;padding:12px 14px;" '+
      'onclick="repondreExSwap('+JSON.stringify(o.r)+')">'+o.ico+'&nbsp; '+o.txt+'</button>').join('');
    const ov=document.getElementById('ov-ex-swap');
    if(ov) setTimeout(()=>ov.classList.add('open'), 420);  // après le toast, pas par-dessus
  }catch(e){ console.warn('[swap qcm]', e); }
}
function repondreExSwap(r){
  try{
    const paire=_exSwapPaire; _exSwapPaire=null;
    closeExSwap();
    if(!paire||!r) return;
    S.exSwaps=S.exSwaps||{};
    const av=S.exSwaps[paire.de]||{n:0};
    S.exSwaps[paire.de]={r:r, to:paire.vers, n:(+av.n||0)+1,
                         date:(typeof today==='function')?today():''};
    persist();
    const o=_EX_SWAP_RAISONS.filter(x=>x.r===r)[0];
    // ⚠️ On dit ce qu'on a compris, et on dit surtout ce qu'on N'EN FERA PAS quand la raison est
    // de circonstance — sinon la personne croit avoir posé une règle qui n'existe pas.
    toast(o&&o.durable ? 'C\'est noté : Milo en tiendra compte pour tes prochaines séances'
                       : 'C\'est noté — pour aujourd\'hui seulement, ça ne change pas tes séances',
          'success');
  }catch(e){ console.warn('[swap qcm]', e); }
}
function closeExSwap(){
  _exSwapPaire=null;
  const ov=document.getElementById('ov-ex-swap');
  if(ov) ov.classList.remove('open');
}
// Option « tout dérouler » vs « concentration » (retour Emma) : voir toutes les séries d'un coup
// ou un seul exercice à la fois. Persisté (ft4_expandall).
function toggleExpandAll(){
  S.expandAll=!S.expandAll;
  persist();
  renderExBlocks();
  if(typeof toast==='function')toast(S.expandAll?'Tous les exercices déroulés':'Mode concentration (un exercice à la fois)','info');
}
function toggleExBlock(ei){
  _expandedEx=(_expandedEx===ei)?ei:ei;
  _expandedEx=ei;
  renderExBlocks();
  // Scroll vers le bloc ouvert
  setTimeout(()=>{const el=document.getElementById('ex-block-'+ei);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'});},80);
}
// ─── MUSCLE MAP ──────────────────────────────────────────────
// ⚠️ Les noms sont NORMALISÉS (accents retirés + minuscules) via _naz() dans _mscScores
// AVANT d'être testés ici. Donc TOUS les motifs ci-dessous doivent être SANS accent
// (developpe, ecarte, epaule, elevation, trapeze, releve…). Ne jamais remettre d'accent ici.
// Ordre important : premier motif qui matche gagne (break). Les mollets passent AVANT
// la presse (sinon « extension mollets sur presse » serait rangé en cuisses).
const _MEX=[
  // ⚠️ ROTATION RUSSE EN TOUT PREMIER : « Russian Twist Développé Épaules » est un exercice
  // d'ABDOS. Placée plus bas, la règle « développé épaules » gagnait et il sortait 100 % épaules,
  // sans le moindre abdominal (audit du 02/08). Le mouvement porte l'exercice, pas l'accessoire.
  {re:/russian twist|rotation russe/i,                                          p:['obliques','abs'],                   s:['hip-flexors','front-delt']},
  // Mollets (avant la presse, pour ne pas capter « presse mollets »)
  // ⚠️ ORDRE VOLONTAIRE (20/08/2026) : « mollets ASSIS » doit être testé AVANT la règle
  // générale des mollets, sinon elle gagne et le soléaire n'existe jamais — `_MEX` s'arrête au
  // PREMIER match. C'est la faute que j'ai commise le matin même sur les adducteurs.
  {re:/mollets?\s+(assis|machine assise)|seated calf|calf raise assis/i,       p:['soleus'],   s:['calves']},
  {re:/mollet|calf raise|talon|standing calf|extension mollet/i,                p:['calves'],                           s:[]},
  // Pectoraux — couché / chest press / peck deck / butterfly
  {re:/developpe couche|bench press|chest press|ecarte couche|pec dec|peck deck|butterfly/i, p:['pec'],                  s:['front-delt','triceps'],             i:['lats','biceps','abs','lower-back']},
  // Pectoraux — incliné (variantes d'écriture)
  {re:/^(?!.*(ecarte|tricep)).*(developpe incline|incline bench|incline press|incline halter|chest incline)/i, p:['pec'],            s:['front-delt','triceps']}, // sans « écarté » ni « triceps » : l'Écarté Incliné et l'Extension Triceps Banc Incliné ne sont PAS des développés (01/08 — 3e fois que cette règle attrape une isolation)
  {re:/hex press|svend|squeeze press/i,                                        p:['pec'],                              s:['triceps','front-delt']}, // hex/svend press : serrage de plaque ou haltères (ajout 01/08, les 14 du dossier Michel)
  // Pectoraux — décliné (variantes d'écriture)
  {re:/^(?!.*(ecarte|tricep)).*(developpe decline|decline barre|decline halter|chest decline|chest press decline)/i, p:['pec'],     s:['front-delt','triceps']}, // sans « écarté » ni « triceps » : idem incliné (Écarté Décliné · Extension Triceps Décliné Haltères)
  // ⚠️ Écarté/fly BUSTE PENCHÉ ou ARRIÈRE = un OISEAU (arrière d'épaule), JAMAIS des pectoraux.
  // Doit rester AVANT les règles « écarté → pec » : le 30/07, « Écarté Haltères Buste Penché »
  // (exercice perso, capture de la fille de Michel) affichait la figurine des PECTORAUX — la
  // règle de famille « ecarte » l'attrapait. « Écarté Arrière Élastique » (catalogue) avait le
  // même défaut depuis toujours. Même piège que « poigneT BARre » : un motif trop large, et la
  // règle précise placée APRÈS était morte.
  /* ⚠️ « PEC DECK INVERSE » : PAS DE RÈGLE ICI — RETRAIT VOLONTAIRE, ÉCRIT (R30, 17/08/2026)
     Michel : *« le inversé n'a pas de photo, il est en double avec machine oiseau »*. Le mot
     « inverse » était bien ignoré (la règle du dessous exige « écarté » ou « fly », absents de
     « pec deck inverse »), et j'ai commencé par ajouter un motif ici. **Le test des croisements
     l'a refusé** : il ne matchait AUCUN des 324 exercices du catalogue — donc une règle morte.
     👉 Et il avait raison sur le fond : ce nom-là est un **synonyme**, et les synonymes ont déjà
     leur propriétaire — `EX_IDS` (constants.js), où « Pec deck inverse » est désormais rangé
     derrière « Machine Oiseau ». Le nom est donc converti AVANT d'arriver ici, et un second motif
     n'aurait fait que dupliquer la table de renommage (R2 : une information, un seul propriétaire).
     ⚠️ Si un jour le catalogue accueille un vrai « Pec Deck Inversé » comme entrée à part, c'est
     là qu'il faudra une règle — pas avant. */
  {re:/(ecarte|\bfly\b).*(penche|arriere|inverse|reverse)|bent ?over.*\bfly\b/i, p:['rear-delt'],                      s:['traps','side-delt']},
  // Pectoraux — écartés / fly
  {re:/ecarte incline|cable fly|\bfly\b|pec deck/i,                             p:['pec'],                              s:['front-delt']},
  // Épaules — développé / press épaules
  {re:/developpe militaire|overhead press|press militaire|ohp|presse epaule|developpe epaule|epaules machine/i, p:['front-delt','side-delt','triceps'], s:['traps']},
  // Épaules — élévation frontale (front delt en priorité)
  {re:/elevation frontale|front raise|elevations frontales/i,                   p:['front-delt'],                       s:['side-delt']},
  // Épaules — latéral / arrière / oiseau / écarté inverse / around the world
  // ⚠️ « lateral raise » RETIRÉ d'ici le 02/08 : cette règle est celle du deltoïde ARRIÈRE
  // (face pull, oiseau, écarté inversé). Une élévation latérale simple est une isolation du
  // deltoïde MOYEN — elle a sa propre règle, plus bas et plus précise. Tant que les exercices
  // s'appelaient « Élévations Latérales », le français ne matchait pas ici et tout allait bien ;
  // en ajoutant la traduction « (Lateral Raise) » au nom, l'exercice s'est mis à tomber sur
  // CETTE règle-ci (première gagnante) et gagnait deltoïdes avant + arrière.
  // ⚠️ « elevation laterale » RETIRÉ d'ici le 02/08 (croisement) : cette règle est celle du
  // deltoïde ARRIÈRE. Elle donnait le deltoïde MOYEN en muscle principal aux oiseaux, écartés
  // inversés et face pull — or ce sont des mouvements d'arrière d'épaule (abduction
  // horizontale), pas de côté. Une règle précise `/ecarte arriere|reverse fly|oiseau/` existait
  // plus bas et n'était JAMAIS atteinte : elle était cachée derrière celle-ci.
  // Les élévations latérales, elles, tombent maintenant sur leur propre règle (deltoïde moyen).
  {re:/face pull|rear delt|oiseau|ecarte inverse|reverse fly|around the world/i, p:['rear-delt'], s:['traps','side-delt']},
  // Dos — verticaux / tractions
  {re:/superman/i,                                                              p:['lower-back','glutes'],              s:['hamstrings','rear-delt']}, // à plat VENTRE, bras/jambes levés : chaîne postérieure. Était happé par la règle « gainage|plank » → sortait en ABDOS (audit 02/08)
  {re:/chaise romaine|captain.?s chair/i,                                      p:['abs','hip-flexors'],                s:['obliques']}, // relevé de jambes suspendu. Était happé par la règle de la « Chaise (Wall Sit) » → sortait en QUADRICEPS (audit 02/08)
  {re:/chariot.*(tirage )?epaule|sled shoulder/i,                               p:['front-delt','side-delt'],           s:['traps','biceps']}, // chariot : tirage bras tendus vers le haut = épaules (mesuré en DORSAUX au dump 01/08)
  {re:/chariot.*(inverse|arriere).*jambe|sled reverse drag/i,                   p:['quads'],                            s:['glutes','calves']}, // marche ARRIÈRE en tirant = quadriceps (mesuré en dorsaux)
  {re:/chariot.*(poussee|push)/i,                                              p:['quads','glutes'],                   s:['calves','abs']}, // même chose que « Sled Push », que la règle plus bas ne reconnaissait pas sous « Chariot »
  {re:/air ?bike|assault bike|ski ?erg|ergometre de ski/i,                      p:['quads','front-delt'],               s:['lats','abs','hamstrings']}, // cardio machines bras+jambes — mesurées MUETTES au dump 01/08
  {re:/jumping ?jack|bear ?crawl|marche de l.ours|wall ?ball/i,                 p:['quads','front-delt'],               s:['glutes','abs','calves']}, // cardio poids du corps — mesurées MUETTES
  {re:/muscle.?up/i,                                                            p:['lats','biceps'],                    s:['triceps','pec','front-delt']}, // traction explosive + passage au-dessus de la barre — mesuré MUET au dump du 01/08
  {re:/dead ?hang|suspension passive/i,                                         p:['forearms','lats'],                  s:['traps']}, // suspension bras tendus : avant-bras + dorsaux (grip work)
  {re:/^(?!.*(upright|menton)).*(traction|pull.?up|chin.?up|tirage vertical|lat pulldown|tirage poulie haute)/i, p:['lats','biceps'],             s:['traps','rear-delt','forearms']}, // ⚠️ « Tirage Vertical (Upright Row) » = épaules/trapèzes, PAS un tirage dorsal — sa règle précise vit plus bas (ft-v686)
  // Dos — rowings / tirages horizontaux / bûcheron
  // ⚠️ `\bt[-\s]?bar` et NON `t.?bar` : sans la limite de mot, le motif attrapait
  // « poigne**t bar**re » — « Curl Poignet Barre » et « Extension Poignet Barre » étaient
  // classés en DORSAUX/TRAPÈZES au lieu d'avant-bras (bug trouvé le 29/07/2026 en auditant
  // les tables de classification). Les vrais « Rowing T-Bar » continuent de matcher.
  {re:/^(?!.*(upright|menton)).*(rowing|row barre|\brow\b|\bt[-\s]?bar|tirage horizontal|tirage bucheron|bucheron)/i, p:['lats','traps','rear-delt'],   s:['biceps','lower-back','forearms']}, // ⚠️ \brow\b attrapait « Upright ROW » (épaules/trapèzes, règle précise plus bas — ft-v686)
  // Dos — bras tendu / pull-over
  {re:/bras tendu|straight.?arm|pull.?over/i,                                   p:['lats'],                             s:['triceps','pec','serratus']},
  // Biceps
  {re:/^(?!.*(leg curl|ischio|jambier)).*(curl bicep|bicep curl|curl halter|preacher|curl marteau|hammer curl|curl biceps)/i, p:['biceps'],                s:['forearms']}, // ⚠️ exclusion : « Leg Curl Haltère » contient « curl halter » — un curl de JAMBE n'est pas un biceps (même maladie que poignet/leg curl, ft-v686)
  // Triceps
  {re:/planche inversee|reverse plank/i,                                       p:['glutes','lower-back'],              s:['abs','rear-delt','hamstrings']}, // planche INVERSÉE (face au plafond) : chaîne postérieure — mesuré MUET au dump du 01/08
  {re:/bird ?dog/i,                                                            p:['lower-back','abs'],                 s:['glutes','obliques']}, // quadrupédie bras/jambe opposés — mesuré sans schéma au dump
  {re:/tate press/i,                                                           p:['triceps'],                          s:['front-delt']}, // Tate press : haltères allongé, coudes ouverts — mesuré MUET au dump du 01/08
  {re:/tricep|skull crusher|extension tricep|barre front/i,                     p:['triceps'],                          s:['front-delt']},
  // Abducteurs / adducteurs (fessiers/hanche) — remplace l'ancien mapping erroné
  {re:/^(?!.*(epaule|shoulder|rotation)).*(abducteur|abduction)/i,              p:['glutes'],                           s:[]}, // ⚠️ « Rotation Externe Épaule Abduction » = coiffe des rotateurs, pas les fessiers (ft-v686)
  // ─── ADDUCTEURS vs ABDUCTEURS — deux mouvements OPPOSÉS (corrigé le 20/08/2026) ──
  // ⚠️ Michel : « Abducteur/Adducteur ce n'est pas pareil hein ». Cette règle disait
  // `glutes` + `quads` : l'ADDUCTION ramène la cuisse vers l'INTÉRIEUR — ce sont les
  // adducteurs (long, court, grand, gracile, pectiné), pas les fessiers. Elle n'était pas
  // négligente : le groupe `adductors` N'EXISTAIT PAS dans la figurine avant aujourd'hui,
  // et le commentaire du 02/08 le disait déjà en toutes lettres (constants.js, groupe Jambes).
  // ⚠️ ET ON CORRIGE ICI, on n'ajoute PAS une règle plus bas : `_MEX` s'arrête au PREMIER
  // match (`break`), donc une règle juste placée derrière une règle fausse ne sert à rien.
  // C'est la famille de bugs n°1 du projet — le « premier match gagnant », ≥12 fois (BUGS.md).
  {re:/adducteur|adduction/i,                                                   p:['adductors'],                        s:[]},
  // Jambes — presse (toutes variantes fr/en)
  {re:/leg press|presse cuisse|press jambe|presse jambe|presse horizontale|presse verticale/i, p:['quads','glutes'],   s:['hamstrings','calves']},
  // Jambes — squats (couvre hack/belt/bulgare/sauté/poulie)
  {re:/squat/i,                                                                 p:['quads','glutes'],                   s:['hamstrings','calves','lower-back']},
  // Jambes — fentes
  {re:/fente|lunge|split squat/i,                                               p:['quads','glutes'],                   s:['hamstrings']},
  // Jambes — leg extension (quadriceps)
  {re:/leg extension|extension quadricep|extensions? de jambe/i,                p:['quads'],                            s:[]},
  // Ischios — leg curl / RDL
  // ⚠️ Le LEG CURL a sa propre règle depuis le 02/08 : il partageait celle du soulevé roumain,
  // qui met les FESSIERS en muscle principal. Or une flexion de genou isole les ischios —
  // les fessiers ne font que stabiliser (NASM, BarBend). 7 exercices étaient sur-attribués.
  {re:/leg curl|curl ischio|curl des ischio|nordic/i,                           p:['hamstrings'],                       s:['glutes','calves']},
  {re:/romanian deadlift|rdl|good morning/i,                                   p:['hamstrings','glutes'],              s:['lower-back','calves']},
  // Fessiers — hip thrust / pont
  {re:/hip thrust|glute bridge|fessier|hip extension|pont fessier/i,            p:['glutes'],                           s:['hamstrings','lower-back']},
  // Soulevé de terre
  {re:/souleve de terre|deadlift/i,                                             p:['glutes','hamstrings','lower-back'], s:['quads','traps','lats','forearms']},
  // Dips assis machine (Seated Dip) : pecs primaire, triceps secondaire — AVANT la règle /dips/i générique
  {re:/dips assis|seated dip/i,                                                 p:['pec'],                              s:['triceps','front-delt']},
  // Dips
  {re:/dips/i,                                                                  p:['triceps','pec'],                    s:['front-delt']},
  // Trapèzes — shrug
  {re:/shrug|hausse|haussement|trapeze iso/i,                                   p:['traps'],                            s:['forearms']},
  // Abdos — gainage
  // ⚠️ La PLANCHE LATÉRALE sort du gainage générique (02/08) : le gainage de face travaille
  // les abdos, la version LATÉRALE travaille les OBLIQUES (EMG jusqu'à 107 % d'activation).
  // On les mettait en muscle secondaire — c'est pourtant l'exercice d'obliques par excellence.
  {re:/planche laterale|side plank|gainage lateral/i,                          p:['obliques'],                         s:['abs','glutes','front-delt','lower-back']},
  {re:/gainage|plank|superman|bird.?dog/i,                                      p:['abs','lower-back'],                 s:['obliques','front-delt','glutes']},
  // Abdos — crunch / relevés / twist
  {re:/crunch|abdos|sit.?up|hanging leg|releves? de jambe|releves? de genou|leg raise|twist/i, p:['abs'],               s:['obliques','hip-flexors']},
  // Avant-bras — grip / préhension (Farmer's Walk Grip, dead hang) : la préhension domine
  {re:/grip|prehension|dead ?hang/i,                                            p:['forearms'],                         s:['traps','quads']},
  // Jambes — farmer's walk / marche du fermier / portés : muscle principal = les cuisses (retour Michel)
  // ⚠️ 02/08 : le farmer's walk existait en DOUBLE, une fiche classée avant-bras et l'autre
  // cuisses — deux vérités contradictoires pour le même exercice. Les fiches sont fusionnées ;
  // ce qui limite un farmer's walk c'est la PRISE, pas les jambes (les sources sont unanimes).
  {re:/farmers?|fermier|portes|carry/i,                                         p:['forearms','traps'],                 s:['quads','glutes','abs']},

  // ══════════════════════════════════════════════════════════════════════════
  // RATTRAPAGE PAR FAMILLE DE MOUVEMENT — ft-v667
  // ⚠️ CES RÈGLES DOIVENT RESTER LES DERNIÈRES DE `_MEX`. Le moteur s'arrête au
  // PREMIER motif qui correspond (`break`) : tant qu'elles sont en fin de liste,
  // les règles précises au-dessus gagnent toujours → zéro régression possible.
  // ⚠️ NE JAMAIS insérer une nouvelle règle précise APRÈS ce bloc.
  //
  // Pourquoi ce bloc existe : le 29/07/2026, Michel demande « sur tous les mouvements
  // tu as vérifié ? ». Passage des 287 exercices → **86 (30 %) n'avaient AUCUNE
  // correspondance** : figurine vide, aucune région déduite, calendrier rouge par
  // défaut. Presque tous étaient des VARIANTES dont la version de base était mappée
  // (« Écarté Couché » marchait, « Écarté Haltères » non). Le correctif de ft-v169
  // avait traité les exercices d'ALORS ; le catalogue a grossi depuis.
  // ══════════════════════════════════════════════════════════════════════════

  // — Pectoraux : tout écarté / fly / crossover, et toutes les pompes
  {re:/ecarte|butterfly|\bfly\b|crossover|croise poulie/i,                     p:['pec'],                              s:['front-delt']},
  {re:/handstand|atr/i,                                                        p:['front-delt'],                       s:['triceps','traps']}, // ATR = développé militaire inversé : épaules d'abord, pas des pectoraux (mesuré au dump 01/08)
  {re:/pompe|push.?up|dips? entre|dips? banc/i,                                 p:['pec','triceps'],                    s:['front-delt','serratus']},
  // — Épaules : élévations latérales, tirage menton, rotations, développés restants
  //   ⚠️ « laterale » AVANT le développé générique (une élévation n'est pas un développé)
  {re:/elevation.? laterale|lateral raise|croix de fer/i,                       p:['side-delt'],                        s:['traps']},

  {re:/tirage menton|upright row/i,                                            p:['side-delt','traps'],                s:['biceps']},
  {re:/rotation.* epaule|rotation (interne|externe)|passage d.epaule|face pull|\by raise|\bw raise/i, p:['rear-delt'], s:['traps']},

  // — Biceps : tous les curls de BRAS. ⚠️ DEUX exclusions écrites noir sur blanc :
  //   · les curls de JAMBES (leg curl / ischio) → ce sont des ischio-jambiers ;
  //   · les curls de POIGNET → ce sont des avant-bras, pas du biceps.
  //   Sans elles, « Leg Curl » et « Curl Poignet Barre » seraient classés en biceps.
  {re:/^(?!.*(leg curl|ischio|jambier|poignet|wrist|jefferson)).*(curl|marteau|hammer curl|zottman)/i, p:['biceps'],               s:['forearms']}, // 'jefferson' exclu : le Jefferson Curl est une flexion de colonne (lombaires/ischios), sa règle vit plus bas (ft-v686)
  // — Triceps : barre au front, extensions nuque
  {re:/barre au front|skull ?crusher|extension nuque|extension triceps|french press/i, p:['triceps'],                    s:['front-delt']},
  // — Avant-bras
  // ⚠️ MÊME MOTIF QUE L'ADDUCTEUR : extension et curl de poignet sont OPPOSÉS et rendaient
  // tous deux `forearms:2`. La règle spécifique passe devant la générale (premier match gagnant).
  {re:/extension\s+poignet|wrist extension|curl invers|reverse curl/i,          p:['forearm-ext'], s:[]},
  {re:/pronation|supination|poignet|wrist/i,                                   p:['forearms'],                         s:[]},
  // — Dos : tous les tirages restants (poulie basse, nuque, machine, incliné)
  {re:/tirage en rack|rack pull/i,                                             p:['lower-back','traps'],               s:['lats','glutes','hamstrings']},
  {re:/tirage|pulldown|\brow\b|sled pull/i,                                    p:['lats'],                             s:['biceps','rear-delt','traps']},
  // — Chaîne postérieure : hyperextensions, GHD, Jefferson, kettlebell swing
  // ⚠️ Le GLUTE HAM RAISE sort de la règle des hyperextensions (02/08) : c'est L'exercice
  // d'ischio-jambiers (flexion de genou + extension de hanche en même temps), pas un
  // mouvement lombaire. On l'avait à l'envers : lombaires en principal, ischios en second.
  {re:/glute ham|\bghr\b|\bghd\b/i,                                              p:['hamstrings','glutes'],              s:['lower-back','calves']},
  {re:/hyperextension|back extension|reverse hyper|jefferson|extension lombaire/i, p:['lower-back','glutes'],           s:['hamstrings']},
  {re:/kettlebell swing|swing kettlebell/i,                                    p:['glutes','hamstrings'],              s:['lower-back','quads']},
  // — Fessiers : poussée de hanche et kickbacks restants
  {re:/kickback|extension fessier/i,                                           p:['glutes'],                           s:['hamstrings']},
  // — Jambes : montées sur box, chaise, presse restante, sled push, box jump
  {re:/montee sur box|step.?up|box jump|saut sur box/i,                         p:['quads','glutes'],                   s:['calves','hamstrings']},
  {re:/chaise|wall sit/i,                                                      p:['quads'],                            s:['glutes','abs']},
  {re:/presse a cuisse|leg press|hack/i,                                       p:['quads','glutes'],                   s:['hamstrings','calves']},
  {re:/sled push|pousse traineau/i,                                            p:['quads','glutes'],                   s:['calves','abs']},
  {re:/corde a sauter|sauts? a la corde|jump rope/i,                           p:['calves'],                           s:['quads']},
  // — Gainage / abdos : les mouvements de tronc restants
  {re:/hollow|l.?sit|windshield|obliques|chaise romaine|roue abdominale|ab ?wheel|dragon flag|drapeau|mountain climber|grimpeur/i,
                                                                               p:['abs','obliques'],                   s:['hip-flexors','front-delt']},
  // — Haltérophilie / full body : arraché, épaulé-jeté, thruster, burpees, TGU, battle rope
  {re:/thruster|burpee|arrache|snatch|clean|jerk|turkish|battle ?rope/i,        p:['quads','front-delt'],               s:['glutes','traps','abs','triceps']},
  // — DERNIER RECOURS : tout « développé » non attrapé plus haut est un développé d'ÉPAULES
  //   (Haltères Assis, Arnold, Nuque, Landmine). Les développés de PECS — couché, incliné,
  //   décliné, poitrine machine — ont déjà leur règle bien avant : rien de pectoral ne peut
  //   arriver jusqu'ici. ⚠️ Cette règle doit rester la TOUTE DERNIÈRE de `_MEX`.
  {re:/developpe|shoulder press|overhead press/i,                              p:['front-delt','side-delt','triceps'], s:['traps']},
];
const _MG={
  'pec': {paths:['front_pectoralis_upper_left','front_pectoralis_middle_left','front_pectoralis_lower_left','front_pectoralis_upper_right','front_pectoralis_middle_right','front_pectoralis_lower_right'], label:'Pectoraux'},
  'front-delt': {paths:['front_deltoid_anterior_left','front_deltoid_anterior_right'], label:'Deltoïdes ant.'},
  'side-delt': {paths:['front_deltoid_lateral_left','front_deltoid_lateral_right'], label:'Deltoïdes lat.'},
  'biceps': {paths:['front_biceps_left','front_brachialis_left','front_biceps_right','front_brachialis_right'], label:'Biceps'},
  // ⚠️ `forearms` = la PRISE (fléchisseurs + brachioradial). C'est ce que 93 fiches sur 334
  // désignent quand elles disent « avant-bras » : tenir une barre, un haltère, une poulie.
  'forearms': {paths:['front_forearm_flexor_left','front_forearm_flexor_right','back_forearm_flexor_left','back_forearm_flexor_right'], label:'Avant-bras (prise)'},
  // ─── ✋ EXTENSEURS DU POIGNET — sortis le 20/08/2026 ─────────────────────────────
  // MÊME BUG QUE L'ADDUCTEUR, mesuré : « Curl Poignet » et « Extension Poignet » sont deux
  // mouvements OPPOSÉS et rendaient tous les deux `forearms:2`. Le dessin les sépare pourtant
  // depuis toujours (`back_forearm_extensor_*`, étiquette « Avant-bras — extenseurs »).
  // ⚠️ La scission est PROPRE : les 93 autres fiches parlent de la PRISE, donc des fléchisseurs.
  // Elles ne bougent pas, et elles ont toujours raison sans les extenseurs.
  'forearm-ext': {paths:['back_forearm_extensor_left','back_forearm_extensor_right'], label:'Extenseurs poignet'},
  'abs': {paths:['front_rectus_abdominis_upper_left','front_rectus_abdominis_middle_left','front_rectus_abdominis_upper_right','front_rectus_abdominis_middle_right','front_rectus_abdominis_lower_left','front_rectus_abdominis_lower_right'], label:'Abdominaux'},
  'obliques': {paths:['front_oblique_external_left','front_oblique_internal_left','front_oblique_external_right','front_oblique_internal_right'], label:'Obliques'},
  // ─── 🫁 DENTELÉ ANTÉRIEUR — sorti des OBLIQUES le 20/08/2026 ─────────────────────
  // Ce n'était pas de l'imprécision, c'était un MAUVAIS RANGEMENT : le dentelé antérieur
  // n'est pas un oblique. Il plaque l'omoplate contre la cage (pompes, pull-over) ; les
  // obliques font tourner le tronc. Une rotation russe n'a jamais travaillé le dentelé.
  // ⚠️ Scission PROPRE : les 30 fiches d'obliques (rotations, gainage latéral) gardent leur
  // sens sans lui — c'est exactement ce qui rend la sortie sûre.
  'serratus': {paths:['front_serratus_anterior_left','front_serratus_anterior_right'], label:'Dentelé antérieur'},
  'hip-flexors': {paths:['front_hip_flexor_left','front_hip_flexor_right'], label:'Fléchisseurs'},
  // ─── 🦵 ADDUCTEURS — séparés des fléchisseurs de hanche le 20/08/2026 ─────────────
  // ⚠️ CE MANQUE ÉTAIT ÉCRIT, DATÉ, ET IL ATTENDAIT MICHEL. Le 02/08, la relecture des
  // 58 fiches Jambes s'était arrêtée sur cette limite, en toutes lettres dans constants.js :
  // « les ADDUCTEURS n'existent pas dans la figurine (17 muscles). Ils sont pourtant moteurs
  //   au squat sumo, au cossack, aux fentes latérales et à l'adduction de cuisses. On ne les
  //   invente pas ailleurs : la fiche reste honnête et le manque est nommé. ⏭️ Ajouter un
  //   muscle change ce que voit l'utilisateur, donc c'est l'arbitrage de Michel (R29). »
  // Michel a tranché le 20/08, en une phrase : « Abducteur/Adducteur ce n'est pas pareil hein ».
  //
  // ⚠️ ET LE DESSIN LES CONNAISSAIT DÉJÀ : `front_adductor_left/right` existent depuis
  // toujours, et l'étiquette au survol dit « Adducteurs ». Ils étaient simplement rattachés
  // au groupe « Fléchisseurs » — donc AUCUN exercice ne pouvait les allumer, et l'adduction
  // de cuisses colorait les FESSIERS. C'est **R31** : la figurine est le vocabulaire du
  // système, et un muscle absent du vocabulaire est un muscle dont aucun module ne peut parler.
  'adductors': {paths:['front_adductor_left','front_adductor_right'], label:'Adducteurs'},
  'quads': {paths:['front_vastus_lateralis_left','front_rectus_femoris_left','front_vastus_medialis_left','front_vastus_lateralis_right','front_rectus_femoris_right','front_vastus_medialis_right'], label:'Quadriceps'},
  'tibialis': {paths:['front_tibialis_anterior_left','front_tibialis_anterior_right'], label:'Tibialis'},
  'traps': {paths:['back_trapezius_upper_left','back_trapezius_middle_left','back_trapezius_lower_left','back_trapezius_upper_right','back_trapezius_middle_right','back_trapezius_lower_right'], label:'Trapèzes'},
  'lats': {paths:['back_rhomboid_left','back_rhomboid_right','back_latissimus_dorsi_upper_left','back_teres_major_left','back_latissimus_dorsi_middle_left','back_latissimus_dorsi_lower_left','back_latissimus_dorsi_upper_right','back_teres_major_right','back_latissimus_dorsi_middle_right','back_latissimus_dorsi_lower_right'], label:'Grand dorsal'},
  'rear-delt': {paths:['back_deltoid_posterior_left','back_deltoid_posterior_right'], label:'Deltoïdes post.'},
  'triceps': {paths:['back_triceps_long_left','back_triceps_lateral_left','back_triceps_long_right','back_triceps_lateral_right'], label:'Triceps'},
  'lower-back': {paths:['back_erector_spinae_left','back_quadratus_lumborum_left','back_erector_spinae_right','back_quadratus_lumborum_right'], label:'Bas du dos'},
  'glutes': {paths:['back_gluteus_medius_left','back_gluteus_maximus_left','back_gluteus_medius_right','back_gluteus_maximus_right'], label:'Fessiers'},
  'hamstrings': {paths:['back_hamstring_medial_left','back_hamstring_lateral_left','back_hamstring_medial_right','back_hamstring_lateral_right'], label:'Ischio-jambiers'},
  'calves': {paths:['back_gastrocnemius_medial_left','back_gastrocnemius_lateral_left','back_gastrocnemius_medial_right','back_gastrocnemius_lateral_right'], label:'Mollets (jumeaux)'},
  // ─── 🦵 SOLÉAIRE — sorti des MOLLETS le 20/08/2026 ──────────────────────────────
  // LE CAS D'ÉCOLE, et tout pratiquant le connaît : mollets DEBOUT = jumeaux (genou tendu),
  // mollets ASSIS = SOLÉAIRE (genou fléchi, les jumeaux sont relâchés). Mesuré avant de
  // toucher : « Élévations Mollets Debout » et « Élévations Mollets Assis » rendaient toutes
  // deux `calves:2` — deux exercices que personne ne confond, indistinguables pour l'app.
  // ⚠️ Le soléaire était DÉJÀ DESSINÉ (`back_soleus_*`), rangé avec les jumeaux.
  'soleus': {paths:['back_soleus_left','back_soleus_right'], label:'Soléaire'},
};
// Nom PRÉCIS de chaque tracé (ce que voit la personne quand elle tape un muscle).
const _MSC_LBL={
  'back_deltoid_posterior_left':'Deltoïde postérieur',
  'back_deltoid_posterior_right':'Deltoïde postérieur',
  'back_erector_spinae_left':'Érecteurs du rachis',
  'back_erector_spinae_right':'Érecteurs du rachis',
  'back_forearm_extensor_left':'Avant-bras — extenseurs',
  'back_forearm_extensor_right':'Avant-bras — extenseurs',
  'back_forearm_flexor_left':'Avant-bras — fléchisseurs',
  'back_forearm_flexor_right':'Avant-bras — fléchisseurs',
  'back_gastrocnemius_lateral_left':'Gastrocnémien latéral',
  'back_gastrocnemius_lateral_right':'Gastrocnémien latéral',
  'back_gastrocnemius_medial_left':'Gastrocnémien médial',
  'back_gastrocnemius_medial_right':'Gastrocnémien médial',
  'back_gluteus_maximus_left':'Grand fessier',
  'back_gluteus_maximus_right':'Grand fessier',
  'back_gluteus_medius_left':'Moyen fessier',
  'back_gluteus_medius_right':'Moyen fessier',
  'back_hamstring_lateral_left':'Ischio-jambiers — latéral',
  'back_hamstring_lateral_right':'Ischio-jambiers — latéral',
  'back_hamstring_medial_left':'Ischio-jambiers — médial',
  'back_hamstring_medial_right':'Ischio-jambiers — médial',
  'back_latissimus_dorsi_lower_left':'Grand dorsal — bas',
  'back_latissimus_dorsi_lower_right':'Grand dorsal — bas',
  'back_latissimus_dorsi_middle_left':'Grand dorsal — milieu',
  'back_latissimus_dorsi_middle_right':'Grand dorsal — milieu',
  'back_latissimus_dorsi_upper_left':'Grand dorsal — haut',
  'back_latissimus_dorsi_upper_right':'Grand dorsal — haut',
  'back_quadratus_lumborum_left':'Carré des lombes',
  'back_quadratus_lumborum_right':'Carré des lombes',
  'back_rhomboid_left':'Rhomboïdes',
  'back_rhomboid_right':'Rhomboïdes',
  'back_soleus_left':'Soléaire',
  'back_soleus_right':'Soléaire',
  'back_teres_major_left':'Grand rond',
  'back_teres_major_right':'Grand rond',
  'back_trapezius_lower_left':'Trapèze inférieur',
  'back_trapezius_lower_right':'Trapèze inférieur',
  'back_trapezius_middle_left':'Trapèze moyen',
  'back_trapezius_middle_right':'Trapèze moyen',
  'back_trapezius_upper_left':'Trapèze supérieur',
  'back_trapezius_upper_right':'Trapèze supérieur',
  'back_triceps_lateral_left':'Triceps — vaste latéral',
  'back_triceps_lateral_right':'Triceps — vaste latéral',
  'back_triceps_long_left':'Triceps — longue portion',
  'back_triceps_long_right':'Triceps — longue portion',
  'front_adductor_left':'Adducteurs',
  'front_adductor_right':'Adducteurs',
  'front_biceps_left':'Biceps brachial',
  'front_biceps_right':'Biceps brachial',
  'front_brachialis_left':'Brachial',
  'front_brachialis_right':'Brachial',
  'front_deltoid_anterior_left':'Deltoïde antérieur',
  'front_deltoid_anterior_right':'Deltoïde antérieur',
  'front_deltoid_lateral_left':'Deltoïde latéral',
  'front_deltoid_lateral_right':'Deltoïde latéral',
  'front_forearm_flexor_left':'Avant-bras — fléchisseurs',
  'front_forearm_flexor_right':'Avant-bras — fléchisseurs',
  'front_hip_flexor_left':'Fléchisseurs de hanche',
  'front_hip_flexor_right':'Fléchisseurs de hanche',
  'front_oblique_external_left':'Oblique externe',
  'front_oblique_external_right':'Oblique externe',
  'front_oblique_internal_left':'Oblique interne',
  'front_oblique_internal_right':'Oblique interne',
  'front_pectoralis_lower_left':'Pectoral inférieur',
  'front_pectoralis_lower_right':'Pectoral inférieur',
  'front_pectoralis_middle_left':'Pectoral moyen',
  'front_pectoralis_middle_right':'Pectoral moyen',
  'front_pectoralis_upper_left':'Pectoral supérieur',
  'front_pectoralis_upper_right':'Pectoral supérieur',
  'front_rectus_abdominis_lower_left':'Grand droit — bas',
  'front_rectus_abdominis_lower_right':'Grand droit — bas',
  'front_rectus_abdominis_middle_left':'Grand droit — milieu',
  'front_rectus_abdominis_middle_right':'Grand droit — milieu',
  'front_rectus_abdominis_upper_left':'Grand droit — haut',
  'front_rectus_abdominis_upper_right':'Grand droit — haut',
  'front_rectus_femoris_left':'Droit fémoral',
  'front_rectus_femoris_right':'Droit fémoral',
  'front_serratus_anterior_left':'Dentelé antérieur',
  'front_serratus_anterior_right':'Dentelé antérieur',
  'front_tibialis_anterior_left':'Tibial antérieur',
  'front_tibialis_anterior_right':'Tibial antérieur',
  'front_vastus_lateralis_left':'Vaste externe',
  'front_vastus_lateralis_right':'Vaste externe',
  'front_vastus_medialis_left':'Vaste interne',
  'front_vastus_medialis_right':'Vaste interne',
};
// ═══ LA FIGURINE — v2.1, livrée le 03/08/2026 ═══════════════════════════════════
// Le dessin passe de 18 zones nommées à **41 muscles**. Les adducteurs, le soléaire, le
// trapèze inférieur, la longue portion du triceps, les rhomboïdes, le grand rond, le
// pectoral en trois bandes et le quadriceps en trois faisceaux existent enfin comme
// tracés distincts. R31 : la finesse de la figurine est le PLAFOND de tout le reste.
//
// ⚠️ L'APPLICATION NE PILOTE ENCORE QUE 18 CODES. Plusieurs tracés partagent donc un même
// code et s'allument ensemble (les 3 pectoraux = `pec`). C'est voulu : le dessin a le droit
// de prendre de l'avance sur les données, l'inverse est impossible. Promouvoir un découpage
// en code distinct demande de rouvrir les fiches du catalogue concernées — un chantier par
// découpage, pas un réglage.
//
// Ce qui change POUR L'UTILISATEUR : la figurine est plus détaillée, et taper un muscle
// donne son vrai nom (« Pectoral supérieur ») au lieu du groupe (« Pectoraux »).
// ⚠️ Le ventre change d'aspect : l'ancien découpage haut/bas des abdos était en réalité
// médial/latéral (deux formes côte à côte, pas empilées).
const _FP=[
  ['','m 11.671635,6.3585449 -0.0482,-2.59085 4.20648,-2.46806 4.42769,2.95361 -0.0405,1.94408 0.24197,-3.34467 -2.03129,-2.31103 -2.84508,-0.51629 -2.20423,0.52915 -1.9363,2.63077 z'],
  ['','m 19.748825,6.7034949 0.0203,-2.20747 -3.96689,-2.7637 -3.74099,2.23559 -0.006,2.63528 -0.60741,0.0403 0.27408,1.82447 0.97635,0.33932 0.44244,2.18029 1.82222,2.06556 2.03518,-0.0607 1.79223,-1.94408 0.35957,-2.24066 0.97616,-0.33932 0.25159,-1.78416 z'],
  ['','m 13.304665,11.910505 1.64975,2.35202 0.74426,2.62159 -1.73486,-1.38354 -0.86649,-2.97104 z'],
  ['','m 18.385135,11.910505 -1.64975,2.35202 -0.74538,2.62234 1.73486,-1.38354 0.86649,-2.97104 z'],
  ['','m 21.404635,64.784375 0.1243,1.12295 -0.87118,1.08171 -0.29058,1.70599 -0.58116,0.24933 -0.49774,-2.57866 -0.33182,-0.91486 0.29058,-0.58247 z m -3.85853,0.0832 0.6224,1.74685 1.3273,2.57867 -0.33182,2.37095 -0.95423,-2.66209 -0.78738,-1.49734 z m 4.97811,-2.37039 -0.95423,5.11609 0.62241,-0.33295 0.49773,1.66381 z'],
  ['','m 10.284405,64.784375 -0.12448,1.12295 0.87118,1.08171 0.29058,1.70599 0.58116,0.24933 0.49774,-2.57866 0.33182,-0.91486 -0.29058,-0.58247 z m 3.85854,0.0832 -0.62241,1.74685 -1.32767,2.57867 0.33182,2.37095 0.95423,-2.66209 0.78832,-1.4964 z m -4.9786799,-2.37058 0.9542299,5.11609 -0.6223999,-0.33313 -0.49793,1.6638 z'],
  ['','m 17.255895,87.868445 0.1243,3.45228 0.28983,1.20638 h 0.87136 l 0.24897,-0.83181 0.29058,-0.0416 -0.0624,0.83181 1.09914,-0.33332 0.29058,-0.16629 1.24444,-0.27033 0.0416,-0.97748 -1.20319,-2.03743 -0.82974,-1.0399 -2.03294,-0.83181 z'],
  ['','m 14.433335,87.868265 -0.12448,3.45228 -0.29058,1.20637 h -0.87118 l -0.24877,-0.83181 -0.29059,-0.0416 0.0623,0.83181 -1.09934,-0.33333 -0.29058,-0.16629 -1.2448,-0.27033 -0.0412,-0.97747 1.2031899,-2.03781 0.82975,-1.04009 2.03294,-0.83181 z'],
  ['front_pectoralis_upper_left','m 20.337455,17.085495 1.72942,3.09103 1.890,0.94 -0.5,0.3 -6.8,-2.1 z'],
  ['front_pectoralis_middle_left','M 16.66,19.72 L 23.46,21.82 L 22.81,22.32 L 22.51,23.2 L 16.57,22.05 L 16.66,20.37 Z'],
  ['front_pectoralis_lower_left','M 16.57,22.05 L 22.51,23.2 L 21.904,24.958 L 19.804,25.823 L 16.459,24.168 Z'],
  ['front_pectoralis_upper_right','m 11.351215,17.085495 -1.7294199,3.09103 -1.890,0.94 0.5,0.3 6.8,-2.1 z'],
  ['front_pectoralis_middle_right','M 15.03,19.72 L 8.23,21.82 L 8.88,22.32 L 9.18,23.2 L 15.12,22.05 L 15.03,20.37 Z'],
  ['front_pectoralis_lower_right','M 15.12,22.05 L 9.18,23.2 L 9.786,24.958 L 11.886,25.823 L 15.231,24.168 Z'],
  ['front_deltoid_anterior_left','m 19.047795,13.248365 3.55748,1.97916 0.72653,-0.35074 z m -0.107,0.43288 -0.37119,1.73073 2.1846,0.53561 1.40116,-0.49436 z'],
  ['front_deltoid_lateral_left','m 22.922305,15.657195 0.75814,-0.41 2.40806,1.66799 1.17364,1.50707 0.62662,1.5626 -0.0464,3.70194 -1.3284,-1.72153 0.0407,-2.59376 -0.48842,-0.50049 c 0,0 -3.09778,-3.19058 -3.14371,-3.21401 z m -0.2409,0.10873 c -0.001,0.0525 3.32987,3.54733 3.32987,3.54733 l 0.10067,3.10396 -1.15426,-1.97782 -2.22547,-0.94804 -1.56576,-2.88481 z'],
  ['front_deltoid_anterior_right','m 12.624785,13.248365 -3.5574599,1.97916 -0.72653,-0.35074 z m 0.107,0.43288 0.37119,1.73073 -2.18459,0.53561 -1.4011499,-0.49436 z'],
  ['front_deltoid_lateral_right','m 8.7502951,15.657195 -0.75814,-0.41 -2.40806,1.66799 -1.17364,1.50707 -0.62662,1.56259 0.0464,3.70195 1.3284,-1.72153 -0.0407,-2.59376 0.48843,-0.5005 c 0,0 3.09777,-3.19057 3.1437,-3.214 z m 0.2409,0.10873 c 0.002,0.0525 -3.32987,3.54733 -3.32987,3.54733 l -0.10067,3.10396 1.15426,-1.97782 2.22547,-0.94804 1.5657499,-2.88481 z'],
  ['front_biceps_left','M 24.769,28.205 C 24.743,28.191 24.715,28.18 24.687,28.173 L 23.203,23.218 L 24.208,21.133 L 25.863,22.879 L 28.093,29.555 L 28.135,30.493 C 27.069,29.651 25.945,28.886 24.771,28.205 Z M 26.464,22.449 L 28.112,28.883 L 27.748,23.96 Z'],
  ['front_brachialis_left','M 27.622,30.815 L 27.283,32.52 L 25.464,29.976 L 24.801,28.707 Z'],
  ['front_biceps_right','M 6.921,28.205 C 6.947,28.191 6.975,28.18 7.003,28.173 L 8.487,23.218 L 7.482,21.133 L 5.827,22.879 L 3.597,29.555 L 3.555,30.493 C 4.621,29.651 5.745,28.886 6.919,28.205 Z M 5.226,22.449 L 3.578,28.883 L 3.942,23.96 Z'],
  ['front_brachialis_right','M 4.068,30.815 L 4.407,32.52 L 6.226,29.976 L 6.889,28.707 Z'],
  ['front_forearm_flexor_left','m 26.955425,32.969125 1.30083,10.28927 -1.10778,0.01 -1.89387,-7.99609 0.19174,-4.53719 z m 1.21978,-1.94971 -0.58729,2.58635 1.11876,9.15614 0.55849,-0.21663 0.2304,-6.77018 z'],
  ['front_forearm_flexor_right','m 4.5752651,32.969125 -1.30083,10.28927 1.10778,0.01 1.89387,-7.99609 -0.19174,-4.53719 z m -1.21978,-1.94971 0.58728,2.58635 -1.11875,9.15614 -0.55849,-0.21663 -0.2304,-6.77018 z'],
  ['front_rectus_abdominis_upper_left','M 16.674,35.158 L 18.858,34.083 L 21.455,33.343 L 21.613,35.176 L 22.11,36.094 L 16.674,38.158 Z'],
  ['front_rectus_abdominis_middle_left','M 16.674,38.158 L 22.11,36.094 L 22.899,37.55 L 21.656,39.267 L 16.428,41.251 Z'],
  ['front_rectus_abdominis_upper_right','M 15.016,35.158 L 12.832,34.083 L 10.235,33.343 L 10.077,35.176 L 9.58,36.094 L 15.016,38.158 Z'],
  ['front_rectus_abdominis_middle_right','M 15.016,38.158 L 9.58,36.094 L 8.791,37.55 L 10.034,39.267 L 15.262,41.251 Z'],
  ['front_rectus_abdominis_lower_left','M 16.428,41.251 L 21.656,39.267 L 20.919,40.286 L 19.105,41.113 L 16.052,44.919 Z'],
  ['front_rectus_abdominis_lower_right','M 15.262,41.251 L 10.034,39.267 L 10.771,40.286 L 12.585,41.113 L 15.638,44.919 Z'],
  ['front_oblique_external_left','M 18.791,29.025 l -0.0622,1.62387 -2.30308,-0.49961 -0.12448,-2.21722 z M 18.635,31.429 l 0.0311,1.99844 -2.20953,0.59391 -0.0311,-3.1227 z M 21.290,30.444 l -1.48383,1.03372 -0.20622,2.10905 1.64862,-1.32355 z'],
  ['front_oblique_internal_left','M 18.9,31.1 L 19.55,31.6 L 19.4,33.55 L 18.75,33.35 Z'],
  ['front_oblique_external_right','M 12.897,29.025 l 0.0623,1.62387 2.30327,-0.49961 0.12448,-2.21703 z M 13.053,31.430 l -0.0309,1.99844 2.20973,0.59353 0.0311,-3.1227 z M 10.398,30.445 l 1.48384,1.0339 0.20622,2.10905 -1.64975,-1.32355 z'],
  ['front_oblique_internal_right','M 12.79,31.1 L 12.14,31.6 L 12.29,33.55 L 12.94,33.35 Z'],
  ['front_serratus_anterior_left','M 19.289,26.152 l -3.11202,-1.40604 0.0937,2.27965 2.80119,1.43603 z M 21.224,27.820 l -1.29355,0.7212 0.14997,-1.70898 z M 20.171,26.183 l 2.47968,-1.03241 -0.9336,2.52093 z M 21.702,27.921 l -1.69005,1.03372 -0.28871,2.0678 1.64975,-1.07533 z'],
  ['front_serratus_anterior_right','m 12.399365,26.152365 3.11202,-1.40603 -0.0937,2.27965 -2.80138,1.4364 z m -1.93508,1.6685 1.29355,0.72139 -0.14997,-1.70899 z m 1.05303,-1.637 -2.4793099,-1.03259 0.93361,2.52148 z m -1.5316399,1.73729 1.6900499,1.03372 0.28871,2.06743 -1.64881,-1.07515 z'],
  ['front_hip_flexor_left','m 17.284025,45.040455 -0.0221,-0.0281 0.14867,-0.37926 3.10171,-3.40449 0.23246,-0.0825 -2.05843,5.3199 z m 1.17263,2.01795 -1.27706,3.29948 -0.42631,-4.04843 0.25197,-0.64303 z'],
  ['front_hip_flexor_right','m 14.404465,45.040075 0.0221,-0.0277 -0.14866,-0.37945 -3.10172,-3.40449 -0.23283,-0.0825 2.05918,5.32009 z m -1.17263,2.01833 1.27705,3.29948 0.42631,-4.04862 -0.25196,-0.64303 z'],
  ['front_adductor_left','m 22.063225,39.369605 v 4.21363 l -2.94574,5.82511 -1.86027,5.78349 0.19365,-4.0072 z m -3.24944,13.42596 -0.0649,0.15467 -1.21294,2.90207 0.78325,7.18803 1.23619,-0.66122 -1.0714,-6.69272 z'],
  ['front_adductor_right','m 9.6258251,39.369415 v 4.21363 l 2.9451699,5.8253 1.86028,5.78349 -0.19366,-4.0072 z m 3.2488699,13.42559 0.0647,0.15485 1.21294,2.90207 -0.78307,7.18803 -1.23618,-0.66102 1.0714,-6.69273 z'],
  ['front_vastus_lateralis_left','M 22.837,38.791 L 22.683,42.798 L 24.001,50.729 L 24.62,44.326 Z M 23.419,50.399 L 23.264,55.15 L 20.861,61.76 L 21.597,63.66 L 23.961,55.315 Z'],
  ['front_rectus_femoris_left','M 22.45,43.914 L 19.698,49.986 L 19.187,54.0 L 22.775,54.0 L 22.914,47.549 Z'],
  ['front_vastus_medialis_left','M 19.187,54.0 L 19.078,54.861 L 20.24,61.718 L 22.759,54.737 L 22.775,54.0 Z'],
  ['front_vastus_lateralis_right','M 8.853,38.791 L 9.007,42.798 L 7.689,50.729 L 7.07,44.326 Z M 8.271,50.399 L 8.426,55.15 L 10.829,61.76 L 10.093,63.66 L 7.729,55.315 Z'],
  ['front_rectus_femoris_right','M 9.24,43.914 L 11.992,49.986 L 12.503,54.0 L 8.915,54.0 L 8.776,47.549 Z'],
  ['front_vastus_medialis_right','M 12.503,54.0 L 12.612,54.861 L 11.45,61.718 L 8.931,54.737 L 8.915,54.0 Z'],
  ['front_tibialis_anterior_left','m 18.251375,70.441125 0.29058,0.91486 0.6224,3.8681 0.0829,5.15733 -0.87136,5.03304 0.0412,-6.44714 -0.91242,-2.57848 -0.12561,-2.82837 z m 1.9915,2.32915 -0.20753,7.73637 -1.65949,6.23904 1.80478,-0.853 3.00816,-10.83583 -1.03727,-6.82095 z'],
  ['front_tibialis_anterior_right','m 13.437675,70.440945 -0.29058,0.91486 -0.62241,3.86828 -0.0829,5.15733 0.87174,5.03304 -0.0418,-6.44714 0.91298,-2.57848 0.1243,-2.82837 z m -1.99151,2.32914 0.20735,7.73637 1.65968,6.23904 -1.80497,-0.85299 -3.0079799,-10.83584 1.03728,-6.82095 z'],
];
const _BP=[
  ['','m 48.157455,6.3585449 0.44208,-0.14964 0.16111,0.16427 1.48163,4.04751 2.32401,1.45118 2.39971,-1.52387 0.97577,-3.68969 0.52752,-0.55908 0.23367,0.0981 0.24198,-3.34467 -2.03129,-2.31103 -2.84509,-0.51629 -2.20422,0.52915 -1.93631,2.63077 z'],
  ['','m 52.369695,12.105075 -2.35767,-1.55045 -1.47119,-3.95143 -0.60741,0.0403 0.27409,1.82447 0.97635,0.33932 0.7613,2.21572 0.33017,1.06849 0.0895,2.14894 1.16448,0.008 0.10563,-0.70833 0.54716,-0.0606 z m 1.01793,1.47595 0.23768,0.64982 1.38107,-0.004 0.01,-2.38784 0.25971,-0.79061 0.57215,-2.1698 0.76359,-0.41018 0.25158,-1.78416 -0.62859,0.0193 -1.08488,3.89981 -2.39725,1.46684 0.2768,1.48507 z'],
  ['','m 51.733705,14.788555 0.53876,25.33066 0.48967,-0.0297 0.65658,-25.3387 -0.28147,-0.84188 -1.25059,-0.00049 z'],
  ['','m 51.176145,64.073985 -1.20605,3.01461 0.70738,0.26558 0.89754,3.51771 -0.55801,-4.01191 z m -5.08496,-3.15003 0.63355,1.8609 0.16813,2.03261 0.61314,1.93117 -0.90585,-0.0851 -0.28534,2.15982 z'],
  ['','m 54.019305,64.073985 1.20605,3.01461 -0.70737,0.26558 -0.89755,3.51771 0.55802,-4.01191 z m 5.08496,-3.15003 -0.63355,1.8609 -0.16813,2.03261 -0.61313,1.93117 0.90584,-0.0851 0.28534,2.15982 z'],
  ['','M 50.933115,88.340995 l 0.85194,1.3581 0.37189,0.79238 -0.15588,1.21774 -0.76984,0.74446 -1.51185,0.12543 -1.1299,-0.29192 -0.24225,-0.95894 0.80765,-1.30405 -0.22562,-0.85987 0.29679,-0.84153 -0.0194,-1.81524 1.53568,-0.54817 z'],
  ['','M 54.262335,88.340995 l -0.85194,1.3581 -0.37189,0.79238 0.15589,1.21774 0.76983,0.74446 1.51186,0.12543 1.12989,-0.29192 0.24225,-0.95894 -0.80765,-1.30405 0.22563,-0.85987 -0.29679,-0.84153 0.0194,-1.81524 -1.53568,-0.54817 z'],
  ['back_trapezius_upper_left','M 49.625,14.629 L 49.688,12.005 L 48.974,13.157 L 44.594,14.654 L 45.945,16.925 L 51.222,16.925 L 51.183,14.550 Z'],
  ['back_trapezius_middle_left','M 47.097,17.075 L 49.694,21.465 L 51.303,21.925 L 51.224,17.075 Z'],
  ['back_rhomboid_left','M 45.6,17.668 L 48.6,22.577 L 49.694,21.465 L 47.097,17.1 Z'],
  ['back_trapezius_lower_left','M 49.009,22.075 L 49.572,23.022 L 51.403,28.104 L 51.305,22.075 Z'],
  ['back_trapezius_upper_right','M 55.439,14.729 L 55.376,12.104 L 56.090,13.256 L 60.470,14.754 L 59.179,16.925 L 53.844,16.925 L 53.881,14.649 Z'],
  ['back_trapezius_middle_right','M 57.968,17.075 L 55.371,21.465 L 53.762,21.925 L 53.841,17.075 Z'],
  ['back_rhomboid_right','M 59.465,17.668 L 56.465,22.577 L 55.371,21.465 L 57.968,17.1 Z'],
  ['back_trapezius_lower_right','M 56.114,22.075 L 55.492,23.121 L 53.661,28.203 L 53.761,22.075 Z'],
  ['back_latissimus_dorsi_upper_left','M 44.144,15.285 L 39.888,20.286 L 39.426,22.749 L 41.263,21.510 L 44.025,20.355 L 45.663,23.400 L 49.103,23.400 Z M 43.506,16.035 L 44.953,17.266 L 43.25,19.267 L 41.803,18.036 Z'],
  ['back_teres_major_left','M 43.506,16.035 L 44.953,17.266 L 43.25,19.267 L 41.803,18.036 Z'],
  ['back_latissimus_dorsi_middle_left','M 45.771,23.600 L 45.872,23.789 L 47.009,29.286 L 47.023,30.400 L 51.080,30.400 L 51.053,28.314 L 49.185,23.600 Z'],
  ['back_latissimus_dorsi_lower_left','M 47.026,30.600 L 47.086,35.145 L 51.156,36.255 L 51.082,30.600 Z'],
  ['back_latissimus_dorsi_upper_right','M 60.921,15.384 L 65.176,20.385 L 65.290,22.849 L 63.801,21.609 L 61.039,20.454 L 59.455,23.400 L 56.022,23.400 Z M 61.559,16.035 L 60.112,17.266 L 61.815,19.267 L 63.262,18.036 Z'],
  ['back_teres_major_right','M 61.559,16.035 L 60.112,17.266 L 61.815,19.267 L 63.262,18.036 Z'],
  ['back_latissimus_dorsi_middle_right','M 59.347,23.600 L 59.192,23.888 L 58.055,29.385 L 58.042,30.400 L 53.986,30.400 L 54.012,28.413 L 55.918,23.600 Z'],
  ['back_latissimus_dorsi_lower_right','M 58.039,30.600 L 57.979,35.245 L 53.908,36.354 L 53.983,30.600 Z'],
  ['back_deltoid_posterior_left','M 42.201,16.586 L 40.626,18.152 L 39.736,20.156 L 43.992,15.155 Z'],
  ['back_deltoid_posterior_right','M 62.863,16.686 L 64.438,18.251 L 65.328,20.255 L 61.073,15.254 Z'],
  ['back_triceps_long_left','M 43.593,21.039 L 44.920,23.967 L 43.615,25.653 L 43.186,27.069 L 39.209,29.802 Z'],
  ['back_triceps_lateral_left','M 43.459,20.972 L 39.075,29.735 L 38.871,25.461 L 39.407,23.674 L 41.242,21.927 Z'],
  ['back_triceps_long_right','M 61.376,21.213 L 60.056,24.145 L 61.330,26.199 L 61.657,27.251 L 65.780,29.966 Z'],
  ['back_triceps_lateral_right','M 61.510,21.146 L 65.914,29.899 L 66.108,25.624 L 65.568,23.839 L 63.729,22.096 Z'],
  ['back_forearm_flexor_left','M 40.775,29.006 L 42.870,27.644 L 42.187,29.635 L 42.603,34.383 L 40.799,42.081 L 39.814,42.253 Z'],
  ['back_forearm_extensor_left','M 39.665,42.242 L 38.305,41.501 L 37.998,34.491 L 38.635,31.429 L 39.245,30.209 L 40.625,28.994 Z'],
  ['back_forearm_flexor_right','M 65.204,42.420 L 63.925,29.007 L 61.764,27.798 L 62.786,29.733 L 62.397,34.555 L 64.219,42.248 Z'],
  ['back_forearm_extensor_right','M 64.075,28.993 L 65.353,42.405 L 66.712,41.663 L 67.002,34.653 L 66.358,31.591 L 65.745,30.373 Z'],
  ['back_erector_spinae_left','M 52.100,37.310 L 49.537,36.465 L 50.244,40.788 L 52.200,42.030 L 52.200,40.270 L 52.150,40.280 Z'],
  ['back_quadratus_lumborum_left','M 49.389,36.490 L 46.240,35.460 L 44.720,39.420 L 50.096,40.812 Z'],
  ['back_erector_spinae_right','M 52.800,42.030 L 52.800,40.270 L 52.850,40.260 L 52.900,37.290 L 55.289,36.625 L 54.805,40.801 Z'],
  ['back_quadratus_lumborum_right','M 55.439,36.643 L 55.980,36.470 L 58.320,35.720 L 59.660,39.450 L 54.955,40.819 Z'],
  ['back_gluteus_medius_left','M 50.191,41.481 L 44.740,39.690 L 43.830,41.580 L 43.431,44.301 Z'],
  ['back_gluteus_maximus_left','M 50.249,41.619 L 43.489,44.439 L 44.410,50.520 L 47.180,51.030 L 51.620,49.090 L 52.200,49.480 L 52.200,42.880 Z'],
  ['back_gluteus_medius_right','M 55.274,41.079 L 61.354,45.519 L 60.640,42.150 L 59.740,39.860 Z'],
  ['back_gluteus_maximus_right','M 55.186,41.201 L 52.800,42.880 L 52.800,49.480 L 53.570,49.090 L 57.680,50.760 L 60.500,50.600 L 61.266,45.641 Z'],
  ['back_hamstring_medial_left','M 49.550,50.504 L 51.751,49.461 L 52.389,49.692 L 52.424,51.499 L 52.499,56.145 L 50.521,62.188 L 50.997,63.602 L 49.569,66.897 L 48.755,66.754 Z'],
  ['back_hamstring_lateral_left','M 49.400,50.496 L 48.605,66.746 L 47.803,66.596 L 47.302,64.480 L 47.133,62.723 L 44.712,54.565 L 44.369,50.918 L 47.200,51.500 Z'],
  ['back_hamstring_medial_right','M 57.425,51.196 L 56.565,66.806 L 55.759,66.965 L 54.331,63.670 L 54.807,62.256 L 52.829,56.213 L 52.904,51.567 L 52.956,49.769 L 53.520,49.498 Z'],
  ['back_hamstring_lateral_right','M 57.575,51.204 L 60.625,50.950 L 60.616,54.633 L 58.195,62.791 L 58.026,64.547 L 57.525,66.663 L 56.715,66.814 Z'],
  ['back_gastrocnemius_medial_left','M 50.568,67.512 L 51.669,72.509 L 51.379,75.532 L 51.292,76.825 L 48.983,76.825 Z'],
  ['back_gastrocnemius_lateral_left','M 50.218,67.512 L 48.633,76.825 L 46.283,76.825 L 45.533,74.263 L 46.783,67.088 Z'],
  ['back_soleus_left','M 46.386,77.175 L 51.269,77.175 L 50.701,85.598 L 49.037,86.233 Z'],
  ['back_gastrocnemius_medial_right','M 54.628,67.512 L 53.526,72.509 L 53.816,75.532 L 53.903,76.825 L 56.213,76.825 Z'],
  ['back_gastrocnemius_lateral_right','M 54.978,67.512 L 56.563,76.825 L 58.912,76.825 L 59.662,74.263 L 58.412,67.088 Z'],
  ['back_soleus_right','M 53.927,77.175 L 58.810,77.175 L 56.158,86.233 L 54.495,85.598 Z'],
];
const _DEAD_=[
  ['','M 13,2.5 C 11.5,2.5 10,3.8 10,5.5 C 10,7.5 11.5,9 13,9.5 C 14,9.8 14.5,10.5 14.8,11 L 18.2,11 C 18.5,10.5 19,9.8 20,9.5 C 21.5,9 23,7.5 23,5.5 C 23,3.8 21.5,2.5 20,2.5 C 19.3,2.5 18.7,3 18.2,3.5 C 17.6,3.1 16.5,2.5 13,2.5 Z'],
  ['','M 14.5,11.5 L 18.5,11.5 L 18.5,14.5 L 14.5,14.5 Z'],
  ['','M 12,14.5 Q 9.5,16 8,20 Q 7,24 7.5,30 L 8.5,37 L 10.5,41 L 11.5,37.5 L 10,31 L 9.5,24 Q 9.5,18.5 12,16 Z'],
  ['','M 21,14.5 Q 23.5,16 25,20 Q 26,24 25.5,30 L 24.5,37 L 22.5,41 L 21.5,37.5 L 23,31 L 23.5,24 Q 23.5,18.5 21,16 Z'],
  ['','M 12.5,62 L 11.5,73 L 11,83 L 12,89 L 15,90 L 15.5,83 L 15,73 L 14.5,62 Z'],
  ['','M 20.5,62 L 21.5,73 L 22,83 L 21,89 L 18,90 L 17.5,83 L 18,73 L 18.5,62 Z'],
  ['','M 12,89 L 10,92.5 L 9.5,93.5 L 14,93.5 L 15.5,91 L 15,89 Z'],
  ['','M 21,89 L 23,92.5 L 23.5,93.5 L 19,93.5 L 17.5,91 L 18,89 Z'],
  ['chest-upper-left', 'M 16.5,15.5 L 21.5,16.5 Q 24,18.5 24,22 Q 22,25.5 19,26 L 16.5,26 Z'],
  ['chest-upper-right','M 16.5,15.5 L 11.5,16.5 Q 9,18.5 9,22 Q 11,25.5 14,26 L 16.5,26 Z'],
  ['chest-lower-left', 'M 16.5,26 L 19,26 Q 22,25.5 24,22 L 24,27 Q 22,30 19,30.5 L 16.5,30 Z'],
  ['chest-lower-right','M 16.5,26 L 14,26 Q 11,25.5 9,22 L 9,27 Q 11,30 14,30.5 L 16.5,30 Z'],
  ['shoulder-front-left', 'M 20,14.5 L 23,16 L 24,20 L 21.5,20.5 L 20.5,17 Z'],
  ['shoulder-front-right','M 13,14.5 L 10,16 L 9,20 L 11.5,20.5 L 12.5,17 Z'],
  ['shoulder-side-left',  'M 23,16 L 25,18 L 26,22 L 24.5,22 L 24,19 Z'],
  ['shoulder-side-right', 'M 10,16 L 8,18 L 7,22 L 8.5,22 L 9,19 Z'],
  ['biceps-left', 'M 21.5,20.5 L 25,22 L 26,28.5 L 24,30 L 22.5,24.5 Z'],
  ['biceps-right','M 11.5,20.5 L 8,22 L 7,28.5 L 9,30 L 10.5,24.5 Z'],
  ['forearm-left', 'M 24,30 L 26,29.5 L 27,37 L 25,39.5 L 24,33 Z'],
  ['forearm-right','M 9,30 L 7,29.5 L 6,37 L 8,39.5 L 9,33 Z'],
  ['abs-upper-left', 'M 16.5,17 L 21.5,18 L 22,25.5 L 16.5,26 Z'],
  ['abs-upper-right','M 16.5,17 L 11.5,18 L 11,25.5 L 16.5,26 Z'],
  ['abs-lower-left', 'M 16.5,30 L 19.5,30.5 Q 22,31 22.5,31 L 22.5,36 L 16.5,36 Z'],
  ['abs-lower-right','M 16.5,30 L 13.5,30.5 Q 11,31 10.5,31 L 10.5,36 L 16.5,36 Z'],
  ['obliques-left',          'M 22,18 L 24.5,20.5 L 24,31 L 22,30 Z'],
  ['obliques-right',         'M 11,18 L 8.5,20.5 L 9,31 L 11,30 Z'],
  ['serratus-anterior-left', 'M 22,24 L 24.5,25 L 24.5,30 L 22,29 Z'],
  ['serratus-anterior-right','M 11,24 L 8.5,25 L 8.5,30 L 11,29 Z'],
  ['hip-flexor-left', 'M 16.5,36 L 23.5,36 Q 26,39.5 25,43 L 18.5,44 Z'],
  ['hip-flexor-right','M 16.5,36 L 9.5,36 Q 7,39.5 8,43 L 14.5,44 Z'],
  ['adductors-left',  'M 18.5,44 L 25,45 L 24.5,56 L 18.5,57 Z'],
  ['adductors-right', 'M 14.5,44 L 8,45 L 8.5,56 L 14.5,57 Z'],
  ['quads-left', 'M 18.5,57 L 24.5,56 L 24,63.5 L 21.5,65 L 19,62 Z'],
  ['quads-right','M 14.5,57 L 8.5,56 L 9,63.5 L 11.5,65 L 14,62 Z'],
  ['tibialis-anterior-left', 'M 20,64.5 L 23.5,65 L 23,77 L 21,80 L 20,72 Z'],
];
// ── Zones muscles féminins — image female-body.png (1325×1187, 3 vues)
// viewBox "0 0 200 269" : chaque vue = 100 unités. f=avant x0-100, b=arrière x0-100 (shift +100 en SVG)
const _MG_F_SHAPES={
  pec:          {f:`<ellipse cx="36" cy="68" rx="12" ry="10"/><ellipse cx="64" cy="68" rx="12" ry="10"/>`},
  'front-delt': {f:`<ellipse cx="21" cy="54" rx="8" ry="8"/><ellipse cx="79" cy="54" rx="8" ry="8"/>`},
  'side-delt':  {f:`<ellipse cx="16" cy="64" rx="7" ry="9"/><ellipse cx="84" cy="64" rx="7" ry="9"/>`},
  biceps:       {f:`<rect x="11" y="60" width="9" height="24" rx="4"/><rect x="80" y="60" width="9" height="24" rx="4"/>`},
  forearms:     {f:`<rect x="9"  y="86" width="9" height="26" rx="4"/><rect x="82" y="86" width="9" height="26" rx="4"/>`},
  abs:          {f:`<rect x="38" y="80" width="24" height="36" rx="5"/>`},
  obliques:     {f:`<rect x="26" y="78" width="12" height="38" rx="5"/><rect x="62" y="78" width="12" height="38" rx="5"/>`},
  'hip-flexors':{f:`<ellipse cx="37" cy="122" rx="12" ry="9"/><ellipse cx="63" cy="122" rx="12" ry="9"/>`},
  quads:        {f:`<rect x="29" y="132" width="18" height="65" rx="6"/><rect x="53" y="132" width="18" height="65" rx="6"/>`},
  tibialis:     {f:`<rect x="31" y="210" width="11" height="34" rx="4"/><rect x="58" y="210" width="11" height="34" rx="4"/>`},
  calves:       {f:`<rect x="30" y="210" width="12" height="34" rx="4"/><rect x="58" y="210" width="12" height="34" rx="4"/>`,
                 b:`<rect x="30" y="210" width="12" height="34" rx="4"/><rect x="58" y="210" width="12" height="34" rx="4"/>`},
  traps:        {b:`<ellipse cx="50" cy="58" rx="19" ry="10"/>`},
  'rear-delt':  {b:`<ellipse cx="22" cy="52" rx="8" ry="8"/><ellipse cx="78" cy="52" rx="8" ry="8"/>`},
  triceps:      {b:`<rect x="11" y="58" width="9" height="22" rx="4"/><rect x="80" y="58" width="9" height="22" rx="4"/>`},
  lats:         {b:`<ellipse cx="28" cy="92" rx="12" ry="18"/><ellipse cx="72" cy="92" rx="12" ry="18"/>`},
  'lower-back': {b:`<ellipse cx="50" cy="110" rx="15" ry="9"/>`},
  glutes:       {b:`<ellipse cx="36" cy="132" rx="18" ry="14"/><ellipse cx="64" cy="132" rx="18" ry="14"/>`},
  hamstrings:   {b:`<rect x="30" y="145" width="17" height="60" rx="6"/><rect x="53" y="145" width="17" height="60" rx="6"/>`},
};
function _mscSVG_F({sc,ind}){
  const isLight=document.getElementById('root')?.classList.contains('light-mode');
  let hlF='',hlB='';
  Object.entries(_MG_F_SHAPES).forEach(([g,s])=>{
    const v=sc[g]||0,isI=ind[g]&&!v;
    let c=null,op='0.42';
    if(v>=2){c='#FF2D55';op='0.50';}else if(v>=1){c='#FF9500';op='0.42';}else if(isI){c='#8FB4D8';op='0.32';}
    if(!c)return;
    if(s.f)hlF+=`<g fill="${c}" opacity="${op}">${s.f}</g>`;
    if(s.b)hlB+=`<g fill="${c}" opacity="${op}">${s.b}</g>`;
  });
  // <img> tag pour que filter:invert fonctionne sur iOS/WebKit (SVG <image> ne supporte pas CSS filter)
  // width:150% + overflow:hidden = montre 2/3 de l'image (avant+arrière, cache profil)
  // padding-bottom:134.5% = ratio 1187/(1325*2/3) pour hauteur responsive
  const imgF=isLight?'':'filter:invert(1)';
  return `<div style="position:relative;overflow:hidden;padding-bottom:134.5%;width:100%">
    <img src="female-body.png" style="position:absolute;top:0;left:0;width:150%;height:auto;${imgF}"/>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 269" style="position:absolute;top:0;left:0;width:100%;height:100%">
      ${hlF}<g transform="translate(100,0)">${hlB}</g>
      <text x="50" y="267" text-anchor="middle" font-size="7" fill="#888" font-family="system-ui,sans-serif">VUE AVANT</text>
      <text x="150" y="267" text-anchor="middle" font-size="7" fill="#888" font-family="system-ui,sans-serif">VUE ARRIÈRE</text>
    </svg>
  </div>`;
}
// Normalise un nom d'exercice : retire les accents + minuscules
// → « Développé Incliné » == « developpe incline » == « Developpe incline »
const _naz=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function _mscScores(exs){
  const sc={},ind={};
  (exs||[]).forEach(ex=>{
    if(!(ex.sets||[]).some(s=>s.done))return;
    let matched=false;
    // ── LA DONNÉE ÉCRITE PASSE AVANT LES RÈGLES (02/08/2026) ──────────────────────────
    // Si l'exercice a ses muscles ÉCRITS dans `EX_MUSCLES`, on les prend et on s'arrête là.
    // Les règles ne sont même pas consultées : il n'y a donc plus d'ordre à se tromper, plus
    // de règle à masquer, plus de fragilité — pas parce qu'on les a corrigés, parce qu'ils
    // n'ont plus lieu d'être. Les règles restent pour ce qu'on ne connaît pas (exercices
    // créés par l'utilisateur, noms arrivés par import).
    // ⚠️ LE NOM EST RÉSOLU AVANT DE CHERCHER LA FICHE (24/08/2026, ft-v997). Sans ça, un nom
    // ABRÉGÉ (« Hip Thrust Barre » au lieu de « Hip Thrust Barre (Poussée de Hanche) ») rate la
    // DONNÉE ÉCRITE et retombe deux lignes plus bas sur les règles, qui DEVINENT — c'est-à-dire
    // exactement l'inverse de ce que ce bloc annonce. Mesuré : **55 des 77** abréviations
    // rendaient des muscles différents, et « Inclinaison Lombaire » n'en rendait AUCUN.
    // ⭐ L'exemple qui coûte : « Rowing Poitrine Appuyée » abrégé RECRÉDITAIT le bas du dos,
    // que la fiche du 02/08 avait retiré exprès (poitrine appuyée = colonne non chargée).
    // ⛔ Les deux lignes suivantes gardent le nom D'ORIGINE, exprès : les règles `_MEX` et les
    // exercices perso travaillent sur ce que la personne a écrit, pas sur le catalogue.
    const _ecrit=(typeof exMuscles==='function')
      ?exMuscles((typeof exNomCatalogue==='function')?exNomCatalogue(ex.name):ex.name):null;
    if(_ecrit){
      (_ecrit.p||[]).forEach(m=>{sc[m]=(sc[m]||0)+2;});
      (_ecrit.s||[]).forEach(m=>{sc[m]=(sc[m]||0)+1;});
      return;
    }
    const _nm=_naz(ex.name);
    for(const r of _MEX){if(r.re.test(_nm)){r.p.forEach(m=>{sc[m]=(sc[m]||0)+2;});r.s.forEach(m=>{sc[m]=(sc[m]||0)+1;});(r.i||[]).forEach(m=>{ind[m]=true;});matched=true;break;}}
    if(!matched){
      const cex=(S.customExercises||[]).find(e=>e.n===ex.name);
      if(cex&&cex.muscles){
        (cex.muscles.p||[]).forEach(m=>{sc[m]=(sc[m]||0)+2;});
        (cex.muscles.s||[]).forEach(m=>{sc[m]=(sc[m]||0)+1;});
      }
    }
  });
  return {sc,ind};
}
function showMuscleName(label,evt){
  evt&&evt.stopPropagation();
  const el=document.getElementById('mm-clicked-label');
  if(!el)return;
  el.textContent=label;el.style.display='block';
  clearTimeout(el._t);el._t=setTimeout(()=>{el.style.display='none';},2500);
}
function _mscSVG({sc,ind}){
  const defs=`<defs>
    <linearGradient id="g-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8A888"/><stop offset="100%" stop-color="#B86848"/></linearGradient>
    <linearGradient id="g-base" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C87868"/><stop offset="100%" stop-color="#7A3828"/></linearGradient>
    <linearGradient id="g-prim" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF6868"/><stop offset="100%" stop-color="#C00020"/></linearGradient>
    <linearGradient id="g-sec"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFB040"/><stop offset="100%" stop-color="#C05500"/></linearGradient>
    <linearGradient id="g-ind"  x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9DBBD6"/><stop offset="100%" stop-color="#6E8CA8"/></linearGradient>
    <filter id="f-sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="0.5" stdDeviation="0.8" flood-color="rgba(0,0,0,0.55)"/></filter>
  </defs>`;
  const ps={};
  Object.entries(_MG).forEach(([g,d])=>{
    const v=sc[g]||0;const isI=ind[g]&&!v;
    let gid,sk,filt='';
    if(v>=2){gid='g-prim';sk='#880010';filt=' filter="url(#f-sh)"';}
    else if(v>=1){gid='g-sec';sk='#884400';filt=' filter="url(#f-sh)"';}
    else if(isI){gid='g-ind';sk='#5B7C9E';filt=' opacity="0.5"';}
    else{gid='g-base';sk='#5A2818';}
    d.paths.forEach(id=>{ps[id]={gid,sk,filt,label:(typeof _MSC_LBL!=='undefined'&&_MSC_LBL[id])||d.label};});
  });
  const pt=([id,d])=>{
    if(!id)return `<path d="${d}" fill="url(#g-skin)" stroke="#9A5838" stroke-width="0.15" stroke-linejoin="round"/>`;
    const p=ps[id]||{gid:'g-base',sk:'#5A2818',filt:'',label:''};
    const click=p.label?` onclick="showMuscleName('${p.label}',event)" style="cursor:pointer"`:'';
    return `<path id="${id}" d="${d}" fill="url(#${p.gid})" stroke="${p.sk}" stroke-width="0.22" stroke-linejoin="round"${p.filt}${click}/>`;
  };
  return `<svg viewBox="-1 0 72 96" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block" stroke-linecap="round">${defs}${_FP.map(pt).join('')}${_BP.map(pt).join('')}<text x="17" y="94.5" text-anchor="middle" font-size="2.2" fill="#999" font-family="system-ui,sans-serif">VUE AVANT</text><text x="52" y="94.5" text-anchor="middle" font-size="2.2" fill="#999" font-family="system-ui,sans-serif">VUE ARRIÈRE</text></svg>`;
}
/* ─── FIGURINE VERSION PAPIER (13/08/2026) ────────────────────────────────────────────
   Idée venue d'une maquette externe, et c'est une bonne idée : la figurine est la marque
   de fabrique du produit (R31), elle dit d'un coup d'œil ce que le jour travaille — ce
   qu'aucune liste d'exercices ne fait aussi vite.
   ⚠️ MAIS ON NE PEUT PAS RÉUTILISER _mscSVGmini TEL QUEL, pour deux raisons :
   ① elle ne dessine que la VUE AVANT (`_FP`) — un jour « soulevé de terre » serait donc
      une figurine entièrement grise, c'est-à-dire un mensonge ;
   ② ses couleurs (#FF5555 primaire, #FF9500 secondaire) ont presque la MÊME luminance :
      86 et 88 sur 255 une fois converties en gris. Sur une imprimante noir et blanc —
      et beaucoup le sont — les deux teintes deviennent indiscernables.
   D'où une palette choisie sur la LUMINANCE, pas sur la teinte : rouge FT ≈ 87 · or FT
   ≈ 141 · non sollicité ≈ 225. Trois niveaux nettement séparés, qui restent lisibles en
   couleur ET en gris. C'est la même règle que les fonds : la couleur AJOUTE, elle ne
   porte jamais l'information toute seule. */
const _MSC_PRINT_COL={
  prim:['#D91843','#8E0F2C'],   // gris ≈ 87  — muscle principal
  sec :['#CC8800','#8A5C00'],   // gris ≈ 141 — muscle secondaire
  ind :['#C6C8D2','#8A8D99'],   // sollicité indirectement
  off :['#E8E8ED','#A8A8B4'],   // non sollicité — le trait garde la silhouette lisible
  skin:['#F4F4F7','#B0B0BC']
};
function _mscSVGprint(o){
  const sc=(o&&o.sc)||{}, ind=(o&&o.ind)||{}, pd={};
  Object.entries(_MG).forEach(([g,d])=>{
    const v=sc[g]||0, isI=ind[g]&&!v;
    const c=v>=2?_MSC_PRINT_COL.prim:v>=1?_MSC_PRINT_COL.sec:isI?_MSC_PRINT_COL.ind:_MSC_PRINT_COL.off;
    d.paths.forEach(id=>{pd[id]=c;});
  });
  const pt=([id,d])=>{
    const c=id?(pd[id]||_MSC_PRINT_COL.off):_MSC_PRINT_COL.skin;
    return '<path d="'+d+'" fill="'+c[0]+'" stroke="'+c[1]+'" stroke-width="'+(id?'0.3':'0.22')+'" stroke-linejoin="round"/>';
  };
  return '<svg viewBox="-1 0 72 94" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round">'+
         _FP.map(pt).join('')+_BP.map(pt).join('')+'</svg>';
}
/* Les muscles dominants d'un jour, en clair — sert la ligne « Travaille : … ».
   ⚠️ Rend une chaîne VIDE quand rien n'est reconnu, jamais un libellé inventé (R29) :
   un exercice créé à la main peut n'avoir aucun muscle renseigné, et annoncer un focus
   faux serait pire que de ne rien annoncer. */
function _mscFocus(o,max){
  const sc=(o&&o.sc)||{};
  return Object.keys(sc).filter(g=>sc[g]>=2&&_MG[g])
    .sort((a,b)=>sc[b]-sc[a]).slice(0,max||3)
    .map(g=>_MG[g].label).join(' · ');
}
/* Les exercices d'un jour de PROGRAMME ne sont pas « faits » : `_mscScores` exige un
   `sets[].done`. On lui présente donc le jour comme s'il était réalisé — c'est exactement
   ce que fait déjà la vignette du sélecteur d'exercices (log.js ~5710), on ne réinvente
   pas une 2ᵉ façon de calculer les muscles (R2/R13). */
function _mscScoresPlan(exs){
  return _mscScores((exs||[]).map(e=>({name:e.name,sets:[{done:true}]})));
}

// ─── Figurine « douleur » : réutilise la vraie figurine anatomique (_mscSVG) pour
//     SÉLECTIONNER une zone qui fait mal. Tape un muscle → il devient rouge. (retour Michel, ft-v565)
const _GRP2PAIN={pec:'pectoraux','front-delt':'epaule','side-delt':'epaule','rear-delt':'epaule',traps:'trapeze',abs:'abdos',obliques:'abdos',serratus:'abdos',biceps:'biceps',triceps:'triceps',forearms:'avantbras','forearm-ext':'avantbras',lats:'dorsaux','hip-flexors':'hanche','adductors':'adducteur',quads:'cuisse',tibialis:'mollet','lower-back':'lombaires',glutes:'fessier',hamstrings:'ischio',calves:'mollet',soleus:'mollet'};
function _painFig(painSet){
  painSet=painSet||new Set();
  const p2z={};
  Object.entries(_MG).forEach(([g,d])=>{const z=_GRP2PAIN[g];if(z)d.paths.forEach(id=>{p2z[id]=z;});});
  // ⚠️ L'EXCEPTION MANUELLE A DISPARU (20/08/2026). Elle disait « les adducteurs sont dans le
  // groupe hip-flexors → on les sépare » : c'était un rattrapage à la main, pour un seul
  // usage, d'un manque connu depuis le 02/08. Les adducteurs sont maintenant un GROUPE, donc
  // `_GRP2PAIN` s'en charge tout seul — une information, un seul propriétaire (R2).
  const defs=`<defs>
    <linearGradient id="pg-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8A888"/><stop offset="100%" stop-color="#B86848"/></linearGradient>
    <linearGradient id="pg-base" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C87868"/><stop offset="100%" stop-color="#7A3828"/></linearGradient>
    <linearGradient id="pg-pain" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF6868"/><stop offset="100%" stop-color="#C00020"/></linearGradient>
    <filter id="pg-sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="0.4" stdDeviation="0.7" flood-color="rgba(255,45,85,0.65)"/></filter>
  </defs>`;
  const pt=([id,d])=>{
    if(!id)return `<path d="${d}" fill="url(#pg-skin)" stroke="#9A5838" stroke-width="0.15" stroke-linejoin="round"/>`;
    const z=p2z[id];const on=z&&painSet.has(z);
    const fill=on?'url(#pg-pain)':'url(#pg-base)';
    const sk=on?'#880010':'#5A2818';
    const filt=on?' filter="url(#pg-sh)"':'';
    const click=z?` onclick="toggleDayPain('${z}')" style="cursor:pointer"`:'';
    return `<path id="pn-${id}" d="${d}" fill="${fill}" stroke="${sk}" stroke-width="0.22" stroke-linejoin="round"${filt}${click}/>`;
  };
  return `<svg viewBox="-1 0 72 96" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block" stroke-linecap="round">${defs}${_FP.map(pt).join('')}${_BP.map(pt).join('')}<text x="17" y="94.5" text-anchor="middle" font-size="2.4" fill="var(--t3)" font-family="system-ui,sans-serif">VUE AVANT</text><text x="52" y="94.5" text-anchor="middle" font-size="2.4" fill="var(--t3)" font-family="system-ui,sans-serif">VUE ARRIÈRE</text></svg>`;
}
let _mmCb=null;
function showMuscleMap(exs,cb){
  const {sc,ind}=_mscScores(exs);
  document.getElementById('mm-svg').innerHTML=_mscSVG({sc,ind});
  const pri=Object.entries(_MG).filter(([g])=>(sc[g]||0)>=2).map(([,d])=>d.label);
  const sec=Object.entries(_MG).filter(([g])=>(sc[g]||0)===1).map(([,d])=>d.label);
  const indir=Object.entries(_MG).filter(([g])=>ind[g]&&!(sc[g]>=1)).map(([,d])=>d.label);
  const li=document.getElementById('mm-list');
  li.innerHTML=(pri.length?`<div><span style="color:#FF2D55;font-weight:600">● Primaires : </span>${pri.join(', ')}</div>`:'')+
               (sec.length?`<div style="margin-top:3px"><span style="color:#FF9500;font-weight:600">● Secondaires : </span>${sec.join(', ')}</div>`:'')+
               (indir.length?`<div style="margin-top:3px"><span style="color:#8FB4D8;font-weight:600">● Indirects : </span>${indir.join(', ')}</div>`:'');
  _mmCb=cb||null;
  // Flux (cb) → bouton d'action « Continuer → ». Standalone → pas de bouton : on ferme par la poignée (glisser) ou en tapant à l'extérieur (reco UX GPT).
  const mmBtn=document.getElementById('mm-btn');if(mmBtn){mmBtn.textContent=cb?'Continuer →':'Fermer';mmBtn.style.display=cb?'':'none';}
  document.getElementById('ov-mm').classList.add('open');
  _makeSheetDraggable(document.getElementById('mm-handle'),closeMuscleMap);
}
function closeMuscleMap(){
  document.getElementById('ov-mm').classList.remove('open');
  if(_mmCb){_mmCb();_mmCb=null;}
}
// Rend une feuille (bottom-sheet) glissable par sa poignée : suit le doigt, glisse vers le bas pour fermer (reco UX GPT). Réutilisable sur n'importe quel overlay ayant une .modal-handle. Idempotent.
function _makeSheetDraggable(handleEl,closeFn){
  if(!handleEl||handleEl._sheetBound)return;
  const sheet=handleEl.closest('.modal');if(!sheet)return;
  handleEl._sheetBound=true;
  let startY=0,dy=0,drag=false;
  const start=y=>{startY=y;dy=0;drag=true;sheet.style.transition='none';};
  const move=(y,ev)=>{if(!drag)return;dy=Math.max(0,y-startY);sheet.style.transform='translateY('+dy+'px)';sheet.style.opacity=String(Math.max(.45,1-dy/650));if(ev&&ev.cancelable)ev.preventDefault();};
  const end=()=>{if(!drag)return;drag=false;
    sheet.style.transition='transform .26s cubic-bezier(.32,.72,0,1),opacity .26s';
    if(dy>90){ // franchi le seuil → on ferme (glissement vers le bas)
      sheet.style.transform='translateY(110%)';sheet.style.opacity='0';
      setTimeout(()=>{if(closeFn)closeFn();sheet.style.transition='';sheet.style.transform='';sheet.style.opacity='';},230);
    }else{ // pas assez → retour en place
      sheet.style.transform='translateY(0)';sheet.style.opacity='1';
      setTimeout(()=>{sheet.style.transition='';sheet.style.transform='';sheet.style.opacity='';},270);
    }};
  handleEl.addEventListener('touchstart',e=>start(e.touches[0].clientY),{passive:true});
  handleEl.addEventListener('touchmove',e=>move(e.touches[0].clientY,e),{passive:false});
  handleEl.addEventListener('touchend',end);
  handleEl.addEventListener('touchcancel',end);
  handleEl.addEventListener('mousedown',e=>{start(e.clientY);const mm=ev=>move(ev.clientY,ev);const mu=()=>{end();document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);};document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);e.preventDefault();});
}
// Branche la poignée glissable sur les overlays de CONTENU sûrs (poignée déjà présente).
// ⚠️ Exclus volontairement : confirmations, inscription, murs premium, formulaires, imports, sélecteur d'exos → besoin d'un choix/geste explicite, pas d'un glissé.
function _initSheetHandles(){
  const map=[['ov-milo-knows','closeMiloKnows'],['mod-share','closeShareModal'],['ov-type-help','closeTypeHelp'],['ov-reco-why','closeRecoWhy']];
  map.forEach(([id,fn])=>{
    const el=document.querySelector('#'+id+' .modal-handle');
    if(el)_makeSheetDraggable(el,()=>{try{if(typeof window[fn]==='function')window[fn]();}catch(e){}});
  });
}

// Volume de travail : exclut É (échauffement) et W (legacy)
//
// ⚠️ UNILATÉRAL — le volume est DOUBLÉ (11/08/2026). On ne saisit que 3 séries alors que
// 6 sont réellement faites (3 à gauche, 3 à droite) : le tonnage saisi vaut donc la MOITIÉ
// du travail produit. C'est le TYPE de l'exercice qui porte l'information, pas la saisie.
//
// ⚠️⚠️ ET ÇA NE S'APPLIQUE QU'AUX SÉANCES ENREGISTRÉES APRÈS LA BASCULE (`uniConv`).
// Avant, la charge d'un unilatéral était notée EN TOTAL (le Curl Haltères de Michel est à
// 60 kg = 2 × 30). Doubler ce volume-là le rendrait QUADRUPLE de la vérité. Michel a dit
// « laisse pour l'instant » sur la correction de l'historique : on ne réécrit donc rien,
// et on ne recalcule pas non plus en douce ce qui a été noté sous l'ancienne convention.
// Une courbe qui change toute seule dans le passé est pire qu'une courbe imparfaite.
// → Le jour où on décidera de corriger l'historique, ce sera une migration explicite qui
//   pose `uniConv:1` sur les séances reprises, pas un changement de cette fonction.
function _workVol(sess){
  let v=0;
  const dbl=!!(sess&&sess.uniConv);
  (sess.exs||sess.exercises||[]).forEach(ex=>{
    const k=(dbl&&typeof estUnilateral==='function'&&estUnilateral(ex.name))?2:1;
    (ex.sets||[]).forEach(s=>{
      if(s.done&&s.type!=='É'&&s.type!=='W'&&(s.kg||0)>0&&(s.reps||0)>0)v+=s.kg*s.reps*k;
    });
  });
  return v;
}

let _finishing=false;
async function finishWorkout(){
  if(_finishing)return;
  _finishing=true;
  _stopWktChrono();
  if(!S.wkt){_finishing=false;return;}
  const _hasCardio=!!((S.wkt.cardio&&S.wkt.cardio.duration)||(S.wkt.cardioAvant&&S.wkt.cardioAvant.duration));  // un échauffement SEUL suffit aussi à valider (02/08)
  const _hasExs=!!(S.wkt.exs&&S.wkt.exs.length);
  if(!_hasExs&&!_hasCardio){toast('Ajoute un exercice ou un cardio !','error');_finishing=false;return;}
  const hasDone=_hasExs&&S.wkt.exs.some(ex=>ex.sets.some(s=>s.done));
  if(!hasDone&&!_hasCardio){toast('Valide une série ou ajoute un cardio !','error');_finishing=false;return;}
  /* 🔆 LE VERROU D'ÉCRAN SE REND ICI, APRÈS LES CONTRÔLES — pas avant (18/08). Il était relâché
     dès l'entrée dans la fonction : appuyer sur « Terminer » avec une séance vide affichait le
     message d'erreur ET laissait l'écran s'éteindre, alors que la séance continuait. */
  _releaseWakeLock();
  const duration=Math.floor(_wktElapsedMs()/1000); // durée réelle, hors temps en pause
  // ⚠️ UNE SEULE règle de volume, et elle vit dans `_workVol` (R2). La copie qui était
  // écrite ici disait exactement la même chose… jusqu'au jour où l'unilatéral est arrivé :
  // deux calculs du même chiffre finissent toujours par diverger, la seule question est
  // quand. `uniConv:1` = « cette séance a été notée sous la convention unilatérale »
  // (charge par côté, volume ×2) — c'est ce qui protège l'historique d'avant.
  const vol=_workVol({exs:S.wkt.exs,uniConv:1});
  const sess={id:Date.now(),date:S.wkt.date||today(),exs:S.wkt.exs,volume:Math.round(vol),uniConv:1,synced:false,ts:Date.now(),startHour:S.wkt.startHour,duration,progLabel:S.wkt.progLabel||''};
  sess.exercises=sess.exs.map(ex=>({name:ex.name,sets:ex.sets}));
  // Capturer les PRs avant mise à jour pour détecter les améliorations
  const _oldPrs={};Object.keys(S.prs||{}).forEach(k=>{_oldPrs[k]={...S.prs[k]};});
  sess.exs.forEach(ex=>ex.sets.forEach(s=>{
    if(!s.done||!s.kg||!s.reps||s.type==='É'||s.type==='W')return;
    const rm=bz(s.kg,s.reps),cur=S.prs[ex.name];
    if(!cur||rm>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};
  }));
  let _bestPr=null;const _prExs=new Set();
  sess.exs.forEach(ex=>ex.sets.forEach(s=>{
    if(!s.done||!s.kg||!s.reps||s.type==='É'||s.type==='W')return;
    const rm=bz(s.kg,s.reps),old=_oldPrs[ex.name];
    if(!old||rm>old.rm1){
      _prExs.add(ex.name);
      const gain=rm-(old?old.rm1:0);
      if(!_bestPr||gain>(_bestPr.newRm-(_bestPr.oldRm||0)))_bestPr={ex:ex.name,newRm:rm,oldRm:old?old.rm1:0};
    }
  }));
  const _prCount=_prExs.size;
  stopRest();
  // Deux moments possibles (02/08) : `cardio` = APRÈS (champ historique), `cardioAvant` = échauffement.
  if(S.wkt?.cardio?.duration) sess.cardio={...S.wkt.cardio};
  if(S.wkt?.cardioAvant?.duration) sess.cardioAvant={...S.wkt.cardioAvant};
  const calData=calcSessionCalories(sess);
  const cardioKcal=calcCardioKcal(sess.cardioAvant||null)+calcCardioKcal(sess.cardio||null);
  if(cardioKcal){calData.total+=cardioKcal;calData.cardio=cardioKcal;}
  sess.calories=calData.total;sess.calData=calData;

  // ── SAUVEGARDE LOCALE : séances d'abord, wkt effacé après confirmation ──
  S.sessions.unshift(sess);
  let _savedOk=false;
  try{
    localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,1500)));
    localStorage.setItem('ft4_prs',JSON.stringify(S.prs||{}));
    _savedOk=true;
  }catch(e){
    try{
      localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));
      localStorage.setItem('ft4_prs',JSON.stringify(S.prs||{}));
      _savedOk=true;
      toast('Stockage quasi-plein — historique allégé à 50 séances','info');
    }catch(e2){_savedOk=false;}
  }
  if(!_savedOk){
    // Annuler les mutations en mémoire et proposer le retry
    S.sessions.shift();
    S.prs=_oldPrs;
    _finishing=false;
    _showSaveError();
    return;
  }
  // Séance confirmée en localStorage — on peut effacer le brouillon
  S.wkt=null;
  try{localStorage.setItem('ft4_wkt','null');localStorage.removeItem('ft4_wkt_draft');}catch(e){}
  // DÉBRIEF AUTO : Milo débriefera de lui-même la prochaine fois que l'utilisateur ouvre le Coach
  // (une seule fois par séance ; seulement si de vrais exercices ont été validés, pas un cardio seul).
  // ⚠️ UNE FILE, PLUS UN EMPLACEMENT UNIQUE (ft-v979) : `setItem` n'avait qu'une place, donc
  // deux séances sans ouvrir Milo entre les deux et la première disparaissait SANS BRUIT.
  if(_hasExs&&hasDone){
    const _sid=String(sess.id||sess.ts||sess.date);
    if(typeof _dbfAjouter==='function') _dbfAjouter(_sid);
    else try{localStorage.setItem('ft4_pending_debrief',JSON.stringify([_sid]));}catch(e){}
  }
  persist();
  // Registre Athlète (brique 2) : recalcule les faits mesurés après la séance.
  try{if(typeof computeRegistreFacts==='function'){computeRegistreFacts();persist();}}catch(e){}

  // Quitter l'écran séance immédiatement (évite double-tap sur DOM stale)
  goScreen('home',document.getElementById('nb-home'));
  renderLog();

  checkBadges();
  _checkLevelUp(!!_bestPr);
  _cloudSyncSessions();
  if(S.connected&&S.url){
    /* ⛔⛔ `syncSheets` REND UN OBJET, PAS UN BOOLÉEN (26/08/2026) — et un objet est TOUJOURS vrai.
       L'ancien `const ok=…; if(ok)` prenait donc `{ok:false,error:'Timeout (8s)'}` pour un succès.
       ⚠️ Deux dégâts, et le second est le vrai : ① le toast annonçait « Séance synchronisée ! »
       alors que rien n'était parti ; ② surtout, `synced=true` était posé — or la file de
       rattrapage (`_retrySheetQueue`) filtre `s.synced===false`. **Une séance perdue en route
       n'était donc JAMAIS reprise**, ni au retour du réseau, ni au démarrage suivant : le seul
       mécanisme de secours était désarmé par la ligne censée constater le succès.
       ⭐ L'autre appelant, `_retrySheetQueue` (tracking.js), lisait `res.ok` correctement depuis
       toujours : deux copies du même geste, une juste, une fausse (R2). C'est la copie posée sur
       le chemin le plus fréquent — la fin de séance — qui était la mauvaise.
       ⛔ Mesuré avant/après par le vrai chemin (seul `fetch` remplacé), pas relu. */
    const res=await syncSheets(sess);
    if(res&&res.ok){
      if(S.sessions.length)S.sessions[0].synced=true;
      try{localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,1500)));}catch(e){}
      toast(`Séance synchronisée ! 🔥 ${calData.total} kcal`,'success');
    }else toast(`Séance sauvegardée ! 🔥 ${calData.total} kcal`,'success');
  }else{
    toast(`Séance terminée ! 🔥 ${calData.total} kcal brûlées`,'success');
  }
  // ÉCRAN DE FIN DE SÉANCE (le « moment signature ») — remplace les pop-ups éparses
  // (carte muscles + félicitations record + check-in) par UN écran cohérent :
  // exos + chiffres + débrief de Milo + « comment tu t'es senti ».
  _showSessionEnd(sess,_bestPr,_prCount);
  _finishing=false;
}

// ─── ÉCRAN DE FIN DE SÉANCE (Étape 1) ─────────────────────────────
const _SE_ENERGY=['😴','😐','🙂','⚡'];
function _showSessionEnd(sess,bestPr,prCount){
  const ov=document.getElementById('ov-session-end');if(!ov){goScreen('home',document.getElementById('nb-home'));return;}
  const sub=document.getElementById('se-sub');
  if(sub)sub.textContent=(sess.progLabel?sess.progLabel+' · ':'')+new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  _renderSeStats(sess,prCount||0);
  _renderSeExs(sess);
  _renderSeMood();
  ov.classList.add('open');
  /* Le texte d'attente NU a disparu (ft-v1022) : `_runSeDebrief` pose d'abord le socle
     chiffré — qui ne dépend d'aucun réseau — puis l'attente de l'avis de Milo en dessous. */
  _runSeDebrief(sess,prCount||0);
}
function _renderSeStats(sess,prCount){
  const el=document.getElementById('se-stats');if(!el)return;
  let nSets=0;(sess.exs||[]).forEach(e=>(e.sets||[]).forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')nSets++;}));
  /* ⏱️➕ LA TUILE « DURÉE » COMPTE LE CARDIO (18/08/2026) — une seule source, `_dureeTotaleMin`
     (app.js), qui sait ce qui est déjà dans le chrono et ce qui ne l'est pas. Le chrono démarre
     à la 1ʳᵉ série depuis le 14/08 : sans ça, une séance qui commence par 20 min de vélo affiche
     une durée amputée de ces 20 minutes — et une séance de cardio SEUL n'affichait aucune durée. */
  let dur=sess.duration?Math.max(1,Math.round(sess.duration/60)):null, durSub='Durée';
  if(typeof _dureeTotaleMin==='function'){
    const _t=_dureeTotaleMin(sess,nSets,0);
    if(_t&&_t.cardioMin>0){ dur=Math.max(1,Math.round(_t.min)); durSub='Durée · dont '+_t.cardioMin+' min cardio'; }
  }
  const tiles=[];
  if(prCount>0)tiles.push('<div class="se-stat pr" style="grid-column:1/3;"><div class="se-stat-v">🏆 '+prCount+' record'+(prCount>1?'s':'')+' battu'+(prCount>1?'s':'')+' !</div><div class="se-stat-l">nouveau max</div></div>');
  tiles.push('<div class="se-stat"><div class="se-stat-v">'+(sess.volume||0)+' kg</div><div class="se-stat-l">Volume</div></div>');
  tiles.push('<div class="se-stat"><div class="se-stat-v">'+nSets+'</div><div class="se-stat-l">Séries</div></div>');
  if(dur)tiles.push('<div class="se-stat"><div class="se-stat-v">'+dur+' min</div><div class="se-stat-l">'+durSub+'</div></div>');
  if(sess.calories)tiles.push('<div class="se-stat"><div class="se-stat-v">'+sess.calories+'</div><div class="se-stat-l">kcal brûlées</div></div>');
  el.innerHTML=tiles.join('');
}
function _renderSeExs(sess){
  const el=document.getElementById('se-exs');if(!el)return;
  el.innerHTML=(sess.exs||[]).map(e=>{
    const done=(e.sets||[]).filter(s=>s.done&&s.type!=='É'&&s.type!=='W');
    let best=null;done.forEach(s=>{if(s.kg&&s.reps&&(!best||s.kg>best.kg||(s.kg===best.kg&&s.reps>best.reps)))best=s;});
    const dt=done.length+' série'+(done.length>1?'s':'')+(best?' · top '+best.reps+'×'+best.kg+' kg':'');
    const img=(typeof _exImg==='function')?_exImg(e.name):null;
    const thumb=img?'<img class="se-ex-img" src="'+img+'" alt="" draggable="false">':'<div class="se-ex-img"></div>';
    return '<div class="se-ex">'+thumb+'<div style="min-width:0;"><div class="se-ex-nm">'+_escNote(e.name)+'</div><div class="se-ex-dt">'+dt+'</div></div></div>';
  }).join('');
}
function _renderSeMood(){
  const el=document.getElementById('se-mood');if(!el)return;
  let cur=null;try{const d=(typeof _dayState==='function')?_dayState():null;cur=d?d.energy:null;}catch(e){}
  const btns=_SE_ENERGY.map((e,i)=>'<button class="se-mood-btn'+(cur===i?' on':'')+'" onclick="_seSetMood('+i+')">'+e+'</button>').join('');
  el.innerHTML='<div class="se-mood-q">Comment t\'es-tu senti aujourd\'hui ?</div><div class="se-mood-row">'+btns+'</div>';
}
function _seSetMood(v){ try{ if(typeof setDayEnergy==='function')setDayEnergy(v); }catch(e){} _renderSeMood(); }
function closeSessionEnd(dest){
  const ov=document.getElementById('ov-session-end');if(ov)ov.classList.remove('open');
  try{ if(dest==='coach'){goScreen('coach',document.getElementById('nb-coach'));} else {goScreen('home',document.getElementById('nb-home'));} }catch(e){}
  try{renderLog();}catch(e){}
}
// Débrief de Milo INLINE sur l'écran de fin (local d'abord : un résumé local s'affiche toujours,
// l'IA l'enrichit). Le débrief est POUSSÉ dans coachHistory (mémoire + visible dans le Coach).
// Le cardio RÉELLEMENT noté sur cette séance, en clair — vide s'il n'y en a pas.
// Même lecture que le contexte de Milo (coach.js) : deux moments, échauffement et après-séance.
function _seCardioTxt(sess){
  try{
    const L=(typeof CARDIO_LABELS!=='undefined')?CARDIO_LABELS:{};
    const un=c=>c&&c.duration?`${L[c.type]||c.type||'cardio'} ${c.duration} min${c.intensity?' ('+c.intensity+')':''}`:'';
    const av=un(sess&&sess.cardioAvant), ap=un(sess&&sess.cardio);
    return [av?'échauffement '+av:'', ap?'après séance '+ap:''].filter(Boolean).join(' + ');
  }catch(e){ return ''; }
}
/* ══ 📊 LE DÉBRIEF CHIFFRÉ, CALCULÉ EN LOCAL — TOUJOURS (ft-v1022) ═══════════════════════
   Brique ③ du chantier écran Séance (`docs/SEANCE-DESSAI.md` §4), et la décision qui la porte
   est de Michel : *« pas de réseau, il faut absolument que la personne puisse avoir un débrief »*
   et *« plus on code, moins on consomme d'API »*. ⭐ **Ce sont les deux faces d'une seule ligne
   de code** — c'est `ARCHITECTURE-CERVEAU-CERVELET` appliquée ici : *« est-ce que ça a besoin de
   savoir QUI est la personne ? »* Non → le code. Oui → Milo.

   ⛔⛔ LE DÉFAUT ÉTAIT SYMÉTRIQUE, ET FAUX DES DEUX CÔTÉS :
   · **hors ligne**, on ne rendait que « N exercices · N séries · N kg » — un mode dégradé
     *mutilé*, alors que le code sait calculer bien plus, gratuitement ;
   · **en ligne**, `slot.innerHTML=` **REMPLAÇAIT** ces chiffres par le texte de Milo — donc on
     recevait le jugement **sans les faits**.
   👉 Désormais : les faits en local **toujours**, Milo **ajoute** par-dessus. Personne n'est
   bloqué (règle d'or #3), personne n'est trompé.

   ⛔ RIEN N'EST CALCULÉ DE NEUF — tout est REBRANCHÉ (R13/R2). `_mscScores`/`_mscFocus` pour les
   muscles, `_calSessMix` pour la région et sa répartition, `_dureeTotaleMin` pour la durée
   cardio comprise, `_monteeDefauts` pour l'échauffement, `_intensiteDefauts` pour la charge,
   `DISC_CADRE` pour le repère de la discipline. Une 2ᵉ façon de calculer l'un d'eux
   divergerait, et c'est l'écran de fin qui mentirait.

   ⛔⛔ CE QU'ON N'UTILISE PAS, ET POURQUOI C'EST ÉCRIT : `_validationSeance` (doublons,
   exclusions, blessures) est listée dans le doc de cadrage — mais elle est écrite pour ce que
   Milo **PROPOSE** (son mode `add` compare à la séance EN COURS). L'employer sur une séance
   **FINIE**, ce serait **R14** : un comportement copié dans un contexte où il devient faux.
   *Un doublon peut être voulu ; un exercice « exclu » qu'on a quand même fait est un CHOIX ;
   et signaler après coup qu'on a travaillé une zone sensible est un reproche sans action
   possible.* Rien à en tirer d'actionnable → on se tait (R29).

   ⛔ LE TON NE JUGE PAS. Ce sont des OBSERVATIONS, jamais des reproches : « à regarder la
   prochaine fois », pas « tu as mal fait ». Le débrief d'une séance qu'on vient de finir est
   le pire moment pour culpabiliser quelqu'un (Constitution P13). */
/* ⚠️ `opts.chiffres:false` — LE BLOC ② SE TAIT QUAND L'ÉCRAN LES AFFICHE DÉJÀ. Trouvé en
   regardant la CAPTURE, pas le texte : sur l'écran de fin, les tuiles portent déjà volume,
   séries, durée, kcal et records — les réécrire 15 cm plus bas est un doublon (R25 : gagner
   de la place n'autorise pas à écrire plus long). ⛔ Mais la fonction les GARDE par défaut :
   elle doit rester complète pour les endroits qui n'ont pas de tuiles (la séance d'essai du
   §4). *On adapte l'AFFICHAGE, jamais le calcul.* */
function _debriefLocal(sess, prCount, opts){
  const H=[];
  try{
    const esc = t => String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
    // ── ① CE QUE TU AS TRAVAILLÉ ──────────────────────────────────────────────────────
    let muscles='', region='';
    try{
      const o=(typeof _mscScores==='function')?_mscScores(sess.exs):null;
      if(o && typeof _mscFocus==='function') muscles=_mscFocus(o,3)||'';
    }catch(e){}
    try{
      const m=(typeof _calSessMix==='function')?_calSessMix(sess):null;
      if(m && m.reg){
        const L={haut:'haut du corps',bas:'bas du corps',dos:'dos',tronc:'tronc',full:'full body'};
        const pc=(m.pc&&m.pc[m.reg]!=null&&m.reg!=='full')?' ('+m.pc[m.reg]+' %)':'';
        region=(L[m.reg]||m.reg)+pc;
      }
    }catch(e){}
    if(muscles||region){
      H.push('<p><b>Ce que tu as travaillé</b> — '
        + [region, muscles].filter(Boolean).join(' · ') + '.</p>');
    }
    // ── ② LES CHIFFRES ────────────────────────────────────────────────────────────────
    const nExs=(sess.exs||[]).length;
    let nSets=0;(sess.exs||[]).forEach(e=>(e.sets||[]).forEach(x=>{if(x.done&&x.type!=='É'&&x.type!=='W')nSets++;}));
    const bouts=[nExs+' exercice'+(nExs>1?'s':''), nSets+' série'+(nSets>1?'s':''),
                 (sess.volume||0)+' kg de volume'];
    try{
      const t=(typeof _dureeTotaleMin==='function')?_dureeTotaleMin(sess,nSets,0):null;
      if(t && t.min>0) bouts.push(Math.max(1,Math.round(t.min))+' min'
        + (t.cardioMin>0?' (dont '+t.cardioMin+' de cardio)':''));
    }catch(e){}
    if(sess.calories) bouts.push(sess.calories+' kcal');
    if(!(opts && opts.chiffres===false)){
      H.push('<p>'+bouts.join(' · ')+'.'
        + (prCount>0 ? ' <b>'+prCount+' record'+(prCount>1?'s':'')+' battu'+(prCount>1?'s':'')+' 🏆</b>' : '')
        + '</p>');
    }
    // ── ③ CE QUI MÉRITE UN COUP D'ŒIL — mesuré, jamais deviné ─────────────────────────
    /* ⛔ Les deux détecteurs se taisent tout seuls quand ils ne savent pas : `_intensiteDefauts`
       rend [] sans record (R29), `_monteeDefauts` rend [] sans charge de travail. On ne les
       force jamais à parler. */
    const points=[];
    (sess.exs||[]).forEach(ex=>{
      const sets=ex.sets||[];
      const trav=sets.filter(x=>x&&x.done&&x.type!=='É'&&x.type!=='W'&&+x.kg>0);
      if(!trav.length) return;
      const kgMax=Math.max.apply(null,trav.map(x=>+x.kg));
      try{
        const ech=sets.filter(x=>x&&x.type==='É');
        (( typeof _monteeDefauts==='function')?_monteeDefauts(ech,kgMax):[])
          .forEach(d=>points.push({ex:ex.name, txt:d, quoi:'échauffement'}));
      }catch(e){}
      try{
        (( typeof _intensiteDefauts==='function')?_intensiteDefauts(ex.name,sets):[])
          .forEach(d=>points.push({ex:ex.name, txt:(typeof d==='string'?d:(d&&d.txt)||''), quoi:'charge'}));
      }catch(e){}
    });
    if(points.length){
      /* ⚠️ PLAFONNÉ À 3. Une liste de huit remarques après une séance n'est pas un débrief,
         c'est un procès-verbal — et on cesse de la lire (R19). */
      const l=points.filter(p=>p.txt).slice(0,3)
        .map(p=>'<li><b>'+esc(p.ex)+'</b> — '+esc(p.txt)+'</li>').join('');
      if(l) H.push('<p><b>À regarder la prochaine fois</b></p><ul class="se-dbf-pts">'+l+'</ul>');
    }
    // ── ④ LE REPÈRE DE TA DISCIPLINE — on informe, on ne note pas (R29) ───────────────
    /* ⛔ On AFFICHE le cadre, on ne dit PAS « tu l'as respecté » : `DISC_CADRE` est de la prose
       (« 8-12 répétitions », « 90 à 150 s »), pas des bornes calculables. Prétendre vérifier ce
       qu'on ne peut pas mesurer serait une fausse précision. */
    try{
      const d=(typeof DISC_CADRE!=='undefined')?DISC_CADRE[S.discipline||'muscu']:null;
      if(d && d.reps) H.push('<p class="se-dbf-cadre">Ton cadre <b>'
        + esc(((typeof DISC_LABELS!=='undefined')&&DISC_LABELS[S.discipline||'muscu'])||'musculation')
        + '</b> : ' + esc(d.reps) + ' · repos ' + esc(d.repos||'—') + '.</p>');
    }catch(e){}
  }catch(e){}
  return H.join('');
}
async function _runSeDebrief(sess,prCount){
  const slot=document.getElementById('se-debrief');if(!slot)return;
  const nExs=(sess.exs||[]).length;
  let nSets=0;(sess.exs||[]).forEach(e=>(e.sets||[]).forEach(s=>{if(s.done&&s.type!=='É'&&s.type!=='W')nSets++;}));
  /* ⚠️ QUAND MILO NE RÉPOND PAS, ON LE DIT (13/08/2026) ────────────────────────────────
     Michel : *« le briefing d'après séance a bien disparu »*. Vérifié en rejouant une vraie
     fin de séance : le mécanisme marche — dès que l'API répond, le texte de Milo s'affiche.
     LE DÉFAUT EST AILLEURS : quand l'appel échoue (réseau, quota, backend), on retombait en
     SILENCE sur ce résumé de chiffres. Rien ne distinguait « Milo a répondu court » de
     « Milo n'a jamais répondu » — donc de l'autre côté, le débrief a « disparu » sans que
     personne ne puisse le savoir. C'est la famille de pannes la plus coûteuse du projet
     (la sauvegarde morte 36 jours, le déploiement rouge que personne ne voyait) : *ce qui
     échoue en silence n'est pas rattrapable*.
     Le résumé chiffré RESTE — il est utile — mais il est désormais suivi d'une ligne qui
     dit ce qui s'est passé, et le jeton est toujours rendu : Milo débriefera à l'ouverture
     du Coach. On ne perd rien, on le DIT. */
  /* ⭐⭐ LE SOCLE CHIFFRÉ EST LE MÊME DANS TOUS LES CAS (ft-v1022) — hors ligne, en ligne,
     en échec ou déjà débriefé. Avant, ces trois lignes étaient tout ce qu'on rendait sans
     réseau ; maintenant elles ne sont plus qu'un repli si `_debriefLocal` ne rend rien. */
  const chiffres=(typeof _debriefLocal==='function')
    ? _debriefLocal(sess, prCount||0, {chiffres:false})   // les tuiles de l'écran les portent déjà
    : ('<p>'+nExs+' exercice'+(nExs>1?'s':'')+' · '+nSets+' série'+(nSets>1?'s':'')+' · '+(sess.volume||0)+' kg de volume.'+(prCount>0?' Nouveau record 💪 bien joué !':' Séance bouclée, continue comme ça 👊')+'</p>');
  const avec=(msg,retry)=>chiffres+'<p class="se-dbf-off">'+msg
    +(retry?' <button class="se-dbf-retry" onclick="_retrySeDebrief()">Réessayer</button>':'')+'</p>';
  /* ⛔⛔ ON AFFICHE LES CHIFFRES AVANT MÊME D'APPELER MILO. Ils ne dépendent d'aucun réseau :
     les faire attendre la réponse, c'est retenir en otage une information déjà calculée
     (règle d'or #3). L'attente devient alors une ATTENTE D'AVIS, pas une page vide. */
  slot.innerHTML=chiffres+'<p class="se-dbf-off"><span class="se-load">Milo analyse ta séance…</span></p>';
  _seDbfLast={sess:sess,prCount:prCount||0};   // pour le bouton « Réessayer »
  // Pas de réseau → on le dit, et le jeton reste posé : le Coach débriefera à son ouverture.
  if(!S.url || (typeof navigator!=='undefined' && navigator.onLine===false)){
    slot.innerHTML=avec('📡 Hors ligne — Milo analysera ta séance dès que tu ouvriras le Coach.',false); return; }
  // ⚠️ LE FLAG EST UN JETON : QUI LE PREND FAIT LE DÉBRIEF (ft-v786).
  // Trouvé dans l'export de conversations de Michel : Milo a débriefé DEUX FOIS la même séance,
  // avec deux objectifs mémorisés CONTRADICTOIRES — le second (faux) écrasait le premier, et
  // c'est lui qui lui a fait dire « on avait pas dit samedi les pecs ? ».
  // La cause était une COURSE entre les deux chemins : ici on ne retirait le flag qu'APRÈS la
  // réponse de l'IA (plusieurs secondes). Passer sur l'écran Coach pendant ce temps déclenchait
  // `_maybeAutoDebrief()`, qui voyait le flag encore posé et lançait un DEUXIÈME débrief.
  // On prend donc le jeton AVANT l'appel — exactement ce que fait déjà `_maybeAutoDebrief`
  // (R2 : une seule règle, appliquée pareil des deux côtés) — et on le REND si l'appel échoue.
  // ⚠️ ft-v979 : `_dbfPrendre()` ne DÉTRUIT plus le jeton, il le met « en cours » avec son
  // heure. Un rechargement de mise à jour pendant l'appel ne le fait donc plus disparaître —
  // il retourne dans la file au démarrage suivant (`_dbfRecuperer`).
  const _pid=(typeof _dbfPrendre==='function')?_dbfPrendre():null;
  // Le Coach a déjà débriefé cette séance : on ne repaie pas un appel — mais on le DIT,
  // sinon l'écran de fin paraît vide de l'analyse alors qu'elle existe, dans le Coach.
  if(!_pid){ slot.innerHTML=avec('\ud83d\udcac Milo a déjà débriefé cette séance — retrouve-la dans l\'onglet Coach.',false); return; }
  const instr='[DÉBRIEF AUTO] Je viens de terminer ma séance (la plus récente dans mes dernières séances). '
    +'Débriefe-la MAINTENANT, directement : analyse-la (progression, stabilité, points d\'attention) '
    +'en t\'appuyant sur mes charges par exercice (tu les as), tiens compte d\'une éventuelle douleur du jour, et termine par UNE piste '
    +'pour la prochaine séance. ⚠️ Cette piste doit servir MON objectif : si tu connais mon objectif/mes priorités, aligne-toi dessus ; '
    +'si tu ne les connais PAS (profil pas rempli), ne me fixe pas une direction à ma place (ex. « rattrape ton haut du corps ») — '
    +'reflète ce que tu observes et demande-moi ma priorité. Court (4-6 phrases), direct, motivant. Ne me redemande JAMAIS mes charges.'
    /* 🏃 LE CARDIO DE LA SÉANCE EST NOMMÉ DANS LA CONSIGNE (15/08/2026)
       Michel : *« j'ai l'impression qu'il n'a pas tenu compte de mon cardio »*.
       ⚠️ LA DONNÉE ÉTAIT BIEN LÀ — elle est transmise depuis le 02/08 (`cardio:` en fin de ligne
       de séance). Le défaut est dans la CONSIGNE : elle dit « en t'appuyant sur mes CHARGES par
       exercice », nomme cette source-là et aucune autre, et réclame 4-6 phrases. Sur un débrief
       court, ce qui n'est pas nommé passe à la trappe. *C'est le miroir de R8 : d'habitude la
       consigne nomme une source ABSENTE du contexte ; ici la source est présente et la consigne
       ne la nomme pas.*
       ⚠️ ET ON NE L'AJOUTE QUE S'IL Y EN A UN. Une consigne permanente « parle du cardio »
       pousserait Milo à commenter une ABSENCE — donc à reprocher un cardio non fait, ou pire, à
       en inventer un. On ne parle que de ce qu'on a (R29). */
    +(_seCardioTxt(sess) ? ' J\'ai aussi fait du cardio sur cette séance ('+_seCardioTxt(sess)+') : tiens-en compte, c\'est du travail réel.' : '')
    +((typeof _DEBRIEF_CONTINUITY!=='undefined')?_DEBRIEF_CONTINUITY:'')
    +((typeof _DEBRIEF_MEM_TAIL!=='undefined')?_DEBRIEF_MEM_TAIL:'');
  try{
    const payload={action:'coach',email:S.email||'',message:instr,context:buildCoachContext(instr),history:(typeof _coachHistPayload==='function'?_coachHistPayload(8):coachHistory.slice(-8)),coachMemory:S.coachMemory||''};
    let resp=null,_err=null;
    for(let a=1;a<=2;a++){
      try{ resp=await fetch(_aiUrl('coach'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}); _err=null; break; }
      catch(e){ _err=e; if(a<2)await new Promise(r=>setTimeout(r,1200)); }
    }
    if(_err)throw _err;
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const data=await resp.json();
    let reply=data.reply||'';
    if(!reply)throw new Error('vide');
    const clean=(typeof _stripCoachTech==='function')?_stripCoachTech(reply):reply;
    /* ⛔⛔ MILO S'AJOUTE, IL NE REMPLACE PLUS (ft-v1022). Cette ligne écrasait le socle chiffré :
       en ligne on recevait donc le JUGEMENT SANS LES FAITS, alors que hors ligne on avait les
       faits sans jugement. *Les deux moitiés ne valent que posées ensemble.* */
    const _milo=(typeof _coachFmtHtml==='function')?_coachFmtHtml(clean):('<p>'+clean.replace(/</g,'&lt;')+'</p>');
    slot.innerHTML=chiffres+'<div class="se-dbf-milo">'+_milo+'</div>';
    // Étape 2 — mémoire DURABLE : enregistre {objectif, décision, tendances, ressenti} dans le Registre
    try{ if(typeof _recordDebriefMemory==='function') _recordDebriefMemory(reply, sess); }catch(e){}
    // Mémoire : pousse le débrief dans le fil du Coach (consigne cachée + réponse de Milo)
    try{
      coachHistory.push({role:'user',content:instr,_silent:true});
      coachHistory.push({role:'assistant',content:reply});
      if(coachHistory.length>20)coachHistory=coachHistory.slice(-20);
      if(typeof _saveCoachHist==='function')_saveCoachHist();
      if(coachHistory.length>=4 && S.url && S.email && typeof _saveCoachMemory==='function')_saveCoachMemory();
      const nb=document.getElementById('coach-new-btn'); if(nb)nb.style.display='flex';
    }catch(e){}
    // Livré : le jeton « en cours » disparaît pour de bon (ft-v979).
    try{ if(typeof _dbfFini==='function') _dbfFini(_pid); }catch(e){}
  }catch(e){
    // Échec réseau → résumé local, et on REND le jeton pour que le Coach réessaie à son ouverture
    // On REND le jeton (le Coach réessaiera à son ouverture) ET ON LE DIT. Le `catch`
    // attrape tout — réseau coupé, HTTP 4xx/5xx, quota, réponse vide : on ne prétend pas
    // savoir laquelle, on annonce le fait et on propose un nouvel essai.
    // Échec PROPRE : le jeton repart EN TÊTE de file (ft-v979) — plus un simple `setItem`,
    // qui écrasait la file entière et faisait disparaître les autres séances en attente.
    try{ if(typeof _dbfRendre==='function') _dbfRendre(_pid);
         else localStorage.setItem('ft4_pending_debrief', JSON.stringify([_pid])); }catch(_){}
    slot.innerHTML=avec('\u26a0\ufe0f Milo n\'a pas pu analyser ta séance. Rien n\'est perdu : il le fera à l\'ouverture du Coach.',true);
  }
}

/* Bouton « Réessayer » du débrief : rejoue exactement le même chemin. On garde la séance
   de côté plutôt que de la relire dans S.sessions — celle-ci pourrait avoir changé (une
   nouvelle séance, une restauration), et on débrieferait alors la mauvaise. */
let _seDbfLast=null;
function _retrySeDebrief(){
  if(!_seDbfLast)return;
  const slot=document.getElementById('se-debrief');
  if(slot)slot.innerHTML='<span class="se-load">Milo analyse ta séance…</span>';
  _runSeDebrief(_seDbfLast.sess,_seDbfLast.prCount);
}

// ── Niveau évolutif (débutant → intermédiaire → confirmé) ─────────────
// Promotion automatique selon le nombre de séances OU l'atteinte d'un standard de force.
// N'agit que si un niveau a été déclaré (onboarding ou profil) et pas déjà "confirmé".
function _checkLevelUp(hasPr){
  if(!S.level||S.level==='confirme')return;
  const bw=S.bw||0;
  const nSess=(S.sessions||[]).length;
  const rm=n=>{const p=S.prs&&S.prs[n];return p&&p.rm1?p.rm1:0;};
  const sq=rm('Squat à la Barre'),dc=rm('Développé Couché'),sdt=rm('Soulevé de Terre');
  let target=null,from='';
  if(S.level==='debutant'){
    // → Intermédiaire : ~20 séances OU un Big 3 à ≥1× le poids de corps
    if(nSess>=20 || (bw>0 && (sq>=bw||dc>=bw||sdt>=bw))){target='intermediaire';from='débutant';}
  }else if(S.level==='intermediaire'){
    // → Confirmé : ~75 séances OU standard avancé (Squat 1.5× / DC 1.25× / SDT 1.75× le poids de corps)
    if(nSess>=75 || (bw>0 && (sq>=bw*1.5||dc>=bw*1.25||sdt>=bw*1.75))){target='confirme';from='intermédiaire';}
  }
  if(!target)return;
  S.level=target;S.levelAuto=true;persist();
  const lbl=target==='intermediaire'?'Intermédiaire':'Confirmé';
  // Message de félicitation, décalé pour ne pas se cumuler avec le toast de fin / le popup PR
  setTimeout(()=>toast(`🎉 Bravo ! Tu n'es plus ${from} — tu passes ${lbl} !`,'success'),hasPr?4400:1700);
}

function _showSaveError(){
  const el=document.getElementById('log-finish');if(!el)return;
  el.innerHTML=`<div style="margin-top:12px;background:rgba(255,45,85,.10);border:1.5px solid var(--red);border-radius:14px;padding:16px;">
    <div style="font-weight:700;color:var(--red);margin-bottom:6px;">⚠️ Impossible d'enregistrer la séance</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;">Stockage plein. Ta séance est <strong>toujours là</strong> — libère de l'espace puis réessaie, ou note tes données avant de fermer.</div>
    <button class="btn btn-red" onclick="finishWorkout()" style="width:100%;">🔄 Réessayer</button>
    <button class="btn btn-bg2" onclick="this.closest('div[style]').remove();" style="width:100%;margin-top:8px;">Continuer la séance</button>
  </div>`;
}

// ─── REST TIMER ──────────────────────────────────────────────
// Source de vérité : restStartTs (timestamp) + restTot (durée)
let restIv=null,restTot=120,restStartTs=0;
let _pillIv=null; // interval dédié pill hors écran séance
let _restBeeped=false;
let _restDoneCb=null;
let _countdownSecs=new Set(); // secondes 5..1 déjà vibrées
let _cdownActive=false,_cdownAutoClose=null,_cdownColorTimer=null,_cdownPendingCb=null; // overlay décompte final
let _cdownBeepedSecs=new Set(),_cdownGoDone=false; // vibration overlay
const _isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

function _restLeft(){
  if(!restStartTs)return 0;
  return restTot-Math.floor((Date.now()-restStartTs)/1000);
}
/* ⏹️ 15 min : au-delà, ce n'est plus un repos mais une séance interrompue (ft-v1030).
   Un seul propriétaire pour ce nombre — `_restTick` et `_updPill` le lisent tous les deux. */
const REST_DEPASSEMENT_MAX = 900;

// ─── AUDIO : AUCUN ───────────────────────────────────────────
// ⚠️ Le timer est 100% SILENCIEUX (vibration + visuel uniquement).
// Ne JAMAIS créer d'AudioContext ni d'élément Audio ici : sur iPhone,
// la simple CRÉATION d'un contexte audio coupe la musique de fond de
// l'utilisateur (Spotify/Apple Music) sans jamais la relancer.
// Historique : bips synthétiques + countdown.wav retirés (ft-v166),
// tentative mp3 tick-tock/bell annulée (ft-v163→v165).

// ─── PILL FLOTTANTE ──────────────────────────────────────────
function _updPill(){
  const pill=document.getElementById('rest-pill');
  if(!pill)return;
  const active=!!restIv&&window._curScreen!=='log';
  pill.classList.toggle('show',active);
  if(!active)return;
  const left=_restLeft();
  const pillTime=document.getElementById('rest-pill-time');
  const pillFill=document.getElementById('rest-pill-fill');
  if(!pillTime||!pillFill)return;
  /* ⚠️ ELLE NE DISPARAÎT PLUS À ZÉRO (14/08/2026) — même raison que le chrono principal :
     le dépassement est précisément ce qu'on veut voir. Elle s'efface au-delà de 15 min, où
     il ne s'agit plus d'un repos mais d'une séance interrompue. */
  if(left<=-REST_DEPASSEMENT_MAX){pill.classList.remove('show');return;}
  const _dep=left<0, _abs=Math.abs(left);
  const m=Math.floor(_abs/60),s=_abs%60;
  pillTime.textContent=(_dep?'+':'')+`${m}:${s.toString().padStart(2,'0')}`;
  const pct=Math.max(0,Math.min(100,left/restTot*100));
  pillFill.style.width=pct+'%';
  const c=_dep?'var(--gold)':pct>50?'var(--green)':pct>20?'var(--gold)':'var(--red)';
  pillFill.style.background=c;
  pill.style.borderColor=pct>50?'rgba(52,211,153,.5)':pct>20?'rgba(255,214,0,.4)':'rgba(255,106,115,.7)';
}

function _restTick(){
  const left=_restLeft();
  // Overlay décompte final : 10 dernières secondes (si repos > 10s).
  // Affiché sur TOUS les écrans (retour Michel : le décompte manquait quand on discute avec Milo)
  // — l'overlay est plein écran (z-index 9999), il couvre n'importe quel écran ; tap/Passer pour fermer.
  /* ⏱️ UNE FENÊTRE, PAS UNE ÉGALITÉ STRICTE (15/08/2026)
     Michel : *« si je ne suis pas dans l'application… je n'ai pas le chrono final de 10 à zéro,
     et donc je ne peux pas cliquer sur GO »*.
     LA CAUSE tenait à `left===10` : le décompte ne s'ouvrait QUE si un tick tombait exactement
     sur la 10ᵉ seconde. Dans l'app c'est garanti (le tick est à 250 ms, la valeur 10 passe quatre
     fois) — mais dès que l'app part en arrière-plan, **le navigateur gèle les minuteurs**. On sort
     à 40 s restantes, on revient à 6 : la valeur 10 n'est JAMAIS passée, l'overlay ne s'ouvre pas,
     et l'écran GET/GO n'existe donc pas. *Rien ne plante : le repos se termine en silence.*
     ⚠️ Et c'est précisément le moment où on a le plus besoin de l'écran — téléphone dans la poche
     ou dans la main sur autre chose, c'est le seul signal qui dit « c'est reparti ».
     LE REMÈDE : on ouvre le décompte dès qu'on se trouve DANS la fenêtre des 10 dernières
     secondes, quel que soit le tick qui nous y amène. `_cdownActive` empêche déjà la réouverture.
     ⚠️ On n'ouvre pas au-delà de 0 : un repos déjà terminé n'affiche pas un « GO » en retard —
     le dépassement se lit sur le chrono en négatif (ft-v851), qui est le bon repère. */
  if(left<=10&&left>0&&!_cdownActive&&restTot>10)_showRestCountdown();
  if(_cdownActive)_updateRestCountdown();
  // Décompte 5..1 : vibrations courtes (aucun son)
  if(left>0&&left<=5&&!_countdownSecs.has(left)){
    _countdownSecs.add(left);
    if(navigator.vibrate)navigator.vibrate(60);
  }
  /* ⏳⏳ LE REPOS EST UN MAXIMUM, PAS UN COMPTE À REBOURS (27/08/2026, ft-v1030)
     Décision de Michel : *« on peut repartir avant, c'est autorisé »*. Elle vient des 6
     programmes de sa coach, où la colonne s'intitule littéralement **« Repos maximum »** et
     porte des PLAGES (« 45 sec max », « 1 à 2 min »), jamais un chiffre à respecter.
     *« Reste 30 s » et « il te reste au plus 30 s » ne se lisent pas pareil : le second
     autorise à repartir avant, et il rend le DÉPASSEMENT informatif.*

     ⛔⛔ ON NE S'ARRÊTE PLUS À ZÉRO — et c'est enfin ce que ft-v851 voulait faire.
     ⚠️ MESURÉ AVANT DE TOUCHER AU CODE, sur les deux chemins (repos court sans overlay, repos
     long avec) : le chrono s'arrêtait bel et bien à 0:00, barre masquée, `restIv` vidé.
     👉 ft-v851 (14/08, idée de Michel) avait retiré les bornes `Math.max(0, …)` des DEUX
     fonctions d'AFFICHAGE (`updRest`, `_updPill`) **sans jamais toucher à ce `_restTick`**, qui
     appelait `stopRest()` ici même. *Les afficheurs savaient montrer du négatif ; plus personne
     ne les appelait.* La fonctionnalité n'a donc jamais tourné — famille « le correctif posé
     d'un seul côté » (`BUGS.md`). C'est le geste qui manquait, pas une idée neuve.

     ⛔ CE QUI NE CHANGE PAS, exprès : la vibration de fin, l'écran GO et son cycle de couleurs
     restent le signal « c'est reparti ». On ajoute une information, on n'enlève pas un repère.
     ⚠️ ET LE CALLBACK SUPERSET PART EXACTEMENT UNE FOIS — `_restBeeped` le garantit, et il est
     détaché (`_restDoneCb=null`) au moment où on le confie, pour qu'aucun autre chemin ne
     puisse le rejouer. Vérifié : aucun de ces callbacks ne relance un repos (ce sont des
     déplacements d'écran), donc l'ordre fermeture → callback est sans effet de bord. */
  if(left<=0&&!_restBeeped){
    _restBeeped=true;
    if(navigator.vibrate)navigator.vibrate([300,100,300,100,400]);
    if(_cdownActive){
      // Overlay GO visible : il reste affiché (vert persistant + cycle couleurs). Le callback
      // superset se déclenche à la FERMETURE (tap/Passer), pas automatiquement.
      _cdownPendingCb=_restDoneCb; _restDoneCb=null;
    }else if(_restDoneCb){
      const cb=_restDoneCb;_restDoneCb=null;setTimeout(cb,400);
    }
    // ⛔ AUCUN `return` ICI : le dépassement est précisément ce qu'on veut voir.
  }
  /* ⏹️ L'ARRÊT DE SÉCURITÉ, ET IL N'A QU'UN SEUL PROPRIÉTAIRE (R2) : au-delà de ce délai il ne
     s'agit plus d'un repos mais d'une séance interrompue — un chrono qui tourne toute la nuit
     n'informe personne. `_updPill` employait déjà ce nombre en dur de son côté ; il le lit
     maintenant ici, pour que les deux ne puissent pas diverger. */
  if(left<=-REST_DEPASSEMENT_MAX){ stopRest(); return; }
  updRest();
  _updPill();
}

function saveExNote(ei,val){if(S.wkt?.exs?.[ei]!==undefined){S.wkt.exs[ei].note=val||'';persist();}}

// ── OVERLAY DÉCOMPTE FINAL ────────────────────────────────────────────
// Format « N reps à X kg » (cohérent avec l'affichage reps→kg des programmes,
// demande Christophe). Gère les cas sans poids (poids du corps) / sans reps.
function _fmtNextSet(info){
  if(!info)return '';
  const r=info.reps, k=info.kg;
  if(r&&k) return r+' reps à '+k+' kg';
  if(r) return r+' reps';
  if(k) return k+' kg';
  return '';
}
function _nextSetInfo(){
  const exs=S.wkt&&S.wkt.exs;
  if(!exs||!exs.length)return null;
  const cur=_expandedEx;
  const _row=(ex,si)=>{const set=ex.sets[si];return{name:ex.name,num:si+1,kg:set.kg||'',reps:set.maxi?'max':(set.reps||'')};};
  // 1) Prochaine série NON faite dans l'exercice en cours
  if(exs[cur]){const si=exs[cur].sets.findIndex(s=>!s.done);if(si>=0)return _row(exs[cur],si);}
  // 2) Sinon (exercice terminé) → 1re série non faite de l'exercice suivant (puis n'importe lequel restant)
  const order=[];
  for(let i=(cur||0)+1;i<exs.length;i++)order.push(i);
  for(let i=0;i<exs.length;i++)if(i!==cur&&order.indexOf(i)<0)order.push(i);
  for(let k=0;k<order.length;k++){const ex=exs[order[k]];const si=ex.sets.findIndex(s=>!s.done);if(si>=0)return _row(ex,si);}
  return null;
}
// ─── Cadran à segments du décompte final (style timer digital) ───────
const _CDOWN_TICKS=44;
function _cdownTickColor(i){
  const t=i/(_CDOWN_TICKS-1); // 0 (haut) → 1 (fin) : vert → jaune → orange → rouge
  if(t<0.34) return '#28E070';
  if(t<0.58) return '#B7DE00';
  if(t<0.80) return '#FF9500';
  return '#FF3B30';
}
function _buildCdownTicks(){
  const svg=document.getElementById('rcd-svg');
  if(!svg||svg.getAttribute('data-ticks'))return;
  svg.setAttribute('data-ticks','1');
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const cx=100,cy=100,rI=64,rO=88,NS='http://www.w3.org/2000/svg';
  for(let i=0;i<_CDOWN_TICKS;i++){
    const a=(-90+i*(360/_CDOWN_TICKS))*Math.PI/180;
    const ln=document.createElementNS(NS,'line');
    ln.setAttribute('x1',(cx+rI*Math.cos(a)).toFixed(1));
    ln.setAttribute('y1',(cy+rI*Math.sin(a)).toFixed(1));
    ln.setAttribute('x2',(cx+rO*Math.cos(a)).toFixed(1));
    ln.setAttribute('y2',(cy+rO*Math.sin(a)).toFixed(1));
    ln.setAttribute('stroke-width','5.5');
    ln.setAttribute('stroke-linecap','round');
    ln.setAttribute('stroke','rgba(255,255,255,.09)');
    svg.appendChild(ln);
  }
}
function _paintCdownTicks(litCount){
  const svg=document.getElementById('rcd-svg');if(!svg)return;
  const ln=svg.querySelectorAll('line');
  for(let i=0;i<ln.length;i++) ln[i].setAttribute('stroke', i<litCount?_cdownTickColor(i):'rgba(255,255,255,.09)');
}
function _showRestCountdown(){
  if(_cdownActive)return;
  _cdownActive=true;
  _cdownBeepedSecs=new Set();_cdownGoDone=false;
  const ov=document.getElementById('ov-rest-countdown');
  if(!ov)return;
  const info=_nextSetInfo();
  const nameEl=document.getElementById('rcd-ex-name');
  const nextNumEl=document.getElementById('rcd-next-num');
  const nextDetailEl=document.getElementById('rcd-next-detail');
  if(nameEl)nameEl.textContent=info?info.name:'';
  if(nextNumEl)nextNumEl.textContent=info?'Série '+info.num:'';
  if(nextDetailEl)nextDetailEl.textContent=_fmtNextSet(info);
  // Fond sombre garanti à chaque ouverture (l'inline HTML #0e1016 avait pu être effacé par un GO précédent)
  ov.style.background='#0e1016';ov.style.transition='';ov.classList.remove('go-cycle');
  ov.style.display='block';
  _updateRestCountdown();
}
function _updateRestCountdown(){
  if(!_cdownActive)return;
  const left=_restLeft();
  // Vibration seule : intense sur 3-2-1, GO final
  if(left>0&&left<=3&&!_cdownBeepedSecs.has(left)){
    _cdownBeepedSecs.add(left);
    if(navigator.vibrate)navigator.vibrate(80);
  }
  if(left<=0&&!_cdownGoDone){
    _cdownGoDone=true;
    if(navigator.vibrate)navigator.vibrate([200,60,200,60,300]);
    // Écran vert « GO » — reste vert jusqu'au tap (filet visuel mode silencieux)
    const _ov=document.getElementById('ov-rest-countdown');
    if(_ov){_ov.style.transition='background .22s';_ov.style.background='#00e676';}
    // Après 5 s sans tap : cycle de couleurs (attrape-l'œil, on rappelle que c'est reparti)
    if(_cdownColorTimer)clearTimeout(_cdownColorTimer);
    _cdownColorTimer=setTimeout(()=>{
      const o=document.getElementById('ov-rest-countdown');
      if(o&&_cdownActive){o.style.transition='';o.style.background='';o.classList.add('go-cycle');}
    },5000);
  }
  _buildCdownTicks();
  const numEl=document.getElementById('rcd-num');
  const labelEl=document.getElementById('rcd-label');
  if(left<=0){
    // Écran GO persistant : reste affiché jusqu'au tap / bouton Passer (pas d'auto-close)
    if(labelEl){labelEl.textContent="C'EST REPARTI";labelEl.style.color='rgba(255,255,255,.9)';}
    if(numEl){numEl.textContent='GO';numEl.style.fontSize='80px';numEl.style.color='#fff';}
    _paintCdownTicks(0);
    return;
  }
  // Cadran à segments : le nombre de traits allumés = temps restant (10s → plein)
  const litCount=Math.max(1,Math.round(left/10*_CDOWN_TICKS));
  _paintCdownTicks(litCount);
  const color=left<=3?'#FF3B30':left<=6?'#FF9500':'#28E070';
  // Police adaptée au nombre de chiffres : « 10 » (2 chiffres) plus petit pour
  // ne pas déborder sur l'anneau (retour Christophe) ; 1→9 restent bien gros.
  if(numEl){numEl.textContent=left;numEl.style.fontSize=(left>=10?'82px':'110px');numEl.style.color=color;}
}
// Tap sur l'overlay ou bouton Passer :
// - pendant le décompte (avant 0) → skip anticipé = fin immédiate du repos (timer + pastille effacés)
// - après le GO → simple fermeture de l'écran (timer déjà arrêté)
/* ⏹️ LE TAP ARRÊTE TOUT, DANS LES DEUX CAS (ft-v1030).
   Avant, la branche « GO déjà passé » ne fermait que l'overlay — c'était suffisant parce que
   `_restTick` avait DÉJÀ arrêté le chrono à zéro. Maintenant qu'il continue (le repos est un
   maximum), ne fermer que l'overlay laisserait le compteur tourner derrière.
   ⭐ `stopRest()` fait les deux dans le bon ordre : il ferme l'overlay — ce qui déclenche le
   callback superset mis de côté — puis coupe le chrono. */
function _cdownTap(){ stopRest(); }
function _closeRestCountdown(){
  if(!_cdownActive)return;
  _cdownActive=false;
  if(_cdownAutoClose){clearTimeout(_cdownAutoClose);_cdownAutoClose=null;}
  if(_cdownColorTimer){clearTimeout(_cdownColorTimer);_cdownColorTimer=null;}
  const ov=document.getElementById('ov-rest-countdown');
  if(ov){ov.style.display='none';ov.style.background='#0e1016';ov.style.transition='';ov.classList.remove('go-cycle');} // remet le fond sombre (jamais vide → jamais transparent)
  // reset pour la prochaine fois
  const labelEl=document.getElementById('rcd-label');
  const numEl=document.getElementById('rcd-num');
  if(labelEl){labelEl.textContent='REPRISE DANS';labelEl.style.color='';}
  if(numEl){numEl.style.fontSize='110px';numEl.style.color='#FF6C00';}
  // Callback superset différé (avance à l'exo suivant) — exécuté à la fermeture de l'écran GO
  const _cb=_cdownPendingCb;_cdownPendingCb=null;
  if(_cb)try{_cb();}catch(e){}
}
// ─────────────────────────────────────────────────────────────────────

function startRest(sec){
  stopRest();restTot=sec;restStartTs=Date.now();_restBeeped=false;
  _countdownSecs=new Set();
  const bar=document.getElementById('rest-bar');
  bar.classList.add('show');
  updRest();_updPill();
  restIv=setInterval(_restTick,250);
  if(_pillIv)clearInterval(_pillIv);
  _pillIv=setInterval(_updPill,500);
}

/* ── LE CHRONO CONTINUE EN NÉGATIF (14/08/2026, idée de Michel) ────────────────────────
   *« faudrait peut-être qu'il continue en chiffre négatif jusqu'à ce que la personne
   appuie »*. Il s'arrêtait à 0:00 (`Math.max(0, …)`) : le dépassement était invisible.
   ⭐ POURQUOI C'EST UTILE MAINTENANT : l'analyse croisée Garmin × app du 14/08 a montré que
   le repos RÉELLEMENT pris vaut 2 à 3 fois le repos RÉGLÉ (+35 min par séance en médiane).
   Le voir en direct, c'est reprendre la main dessus.
   ⚠️ ET ÇA NE CHANGE RIEN À LA MESURE : les calories ne s'appuient pas sur ce chrono mais sur
   l'heure de chaque série validée (`set.at`, ft-v835). C'est délibéré, et c'est Michel qui en
   a donné la raison : *« ça peut arriver qu'on démarre une série sans appuyer sur ce fameux
   chrono »*. Un système accroché au bouton serait à la merci de ça ; accroché à la série
   validée, il ne l'est pas. */
function updRest(){
  const bar=document.getElementById('rest-bar');
  const timeEl=document.getElementById('rest-time');
  const fillEl=document.getElementById('rest-fill');
  if(!timeEl||!fillEl)return;
  const reste=_restLeft();                 // peut être NÉGATIF : c'est tout l'intérêt
  const dep=reste<0;
  const abs=Math.abs(reste);
  const m=Math.floor(abs/60),s=abs%60;
  timeEl.textContent=(dep?'+':'')+`${m}:${s.toString().padStart(2,'0')}`;
  /* 🏷️ LE « + » DOIT DIRE CE QU'IL EST (ft-v1030) — sans libellé, un chrono qui repart à
     « +0:12 » se lit comme un bug, ou pire comme un retard qu'on serait en train de prendre.
     ⛔ ET LE MOT COMPTE : « au-delà de ton repos max » informe ; « tu as dépassé » accuse. On
     dit le fait, la personne conclut (R29 : informer sans décider — un repos plus long n'est
     pas une faute, c'est parfois exactement ce qu'il faut).
     ⛔ RIEN AVANT ZÉRO : une mention à chaque repos deviendrait du bruit qu'on ne lit plus
     (R19/R25). L'information n'apparaît qu'au moment où elle est nouvelle.
     ⛔⛔ ET ELLE A SON PROPRE EMPLACEMENT — j'ai failli l'écrire dans `#rest-label`, qui porte
     DÉJÀ « Échauffement », « Récup. à l'échec », « Abdos », « 📈 Pyramide + » et « ⏭️ Ensuite :
     … », posés par `startRest` et ses appelants. Comme `updRest` tourne à chaque tick, elle les
     aurait tous effacés — en silence, sans erreur. *Un élément d'écran a un propriétaire ; on
     n'écrit pas dans celui d'un autre* (R2). */
  const overEl=document.getElementById('rest-over');
  if(overEl) overEl.textContent = dep ? 'au-delà de ton repos max' : '';
  // La barre, elle, reste bornée à 0 : une largeur négative n'a pas de sens.
  const pct=Math.max(0,Math.min(100,reste/restTot*100));
  fillEl.style.width=pct+'%';
  const c=dep?'var(--gold)':pct>50?'var(--green)':pct>20?'var(--gold)':'var(--red)';
  const bc=dep?'rgba(255,214,0,.45)':pct>50?'rgba(0,230,118,.3)':pct>20?'rgba(255,214,0,.3)':'rgba(255,45,85,.4)';
  timeEl.style.color=c;fillEl.style.background=c;if(bar)bar.style.borderColor=bc;
}

// Arrête chrono + barre + pastille SANS fermer l'overlay décompte (utilisé au GO,
// où l'overlay doit rester affiché — GO + flash — jusqu'au tap/Passer)
function _stopRestTimerOnly(){
  clearInterval(restIv);restIv=null;
  clearInterval(_pillIv);_pillIv=null;
  restStartTs=0;
  _restBeeped=false;_restDoneCb=null;_countdownSecs=new Set();
  const bar=document.getElementById('rest-bar');
  if(bar){bar.classList.remove('show');bar.style.borderColor='';}
  const lbl=document.getElementById('rest-label');if(lbl)lbl.textContent='';
  _updPill();
}

function stopRest(){
  _closeRestCountdown();
  _stopRestTimerOnly();
}
let _afTimer=null;
// Après saisie des reps (1re case), auto-focus la case KG (2e case) après un court délai.
function _onRepsInput(el,ei,si){
  updateRMLive(ei,si);
  clearTimeout(_afTimer);
  if(!el.value)return;
  _afTimer=setTimeout(()=>{
    if(document.activeElement!==el)return;
    const row=document.getElementById(`sr-${ei}-${si}`);
    if(!row)return;
    const kgInp=row.querySelectorAll('.sinp')[1];
    if(kgInp){kgInp.focus();kgInp.select&&kgInp.select();}
  },700);
}
function updateRMLive(ei,si){
  const row=document.getElementById(`sr-${ei}-${si}`);
  if(!row)return;
  const inps=row.querySelectorAll('.sinp');
  const reps=parseInt(inps[0]&&(inps[0].value||inps[0].placeholder))||0;
  const kg=parseFloat(inps[1]&&(inps[1].value||inps[1].placeholder))||0;
  const trmEl=document.getElementById(`trm-${ei}-${si}`);
  if(trmEl)trmEl.textContent=kg&&reps?'~'+fmt(bz(kg,reps)):'';
}
let _restStep=15;
let _restEx=null;
let _cexMusclesP=[],_cexMusclesS=[],_cexImg=null,_editingCustomExName=null;
function _highlightRestPreset(sec){
  [60,90,120].forEach(v=>{const b=document.getElementById('rp-'+v);if(b)b.classList.toggle('rp-active',v===sec);});
}
function setRestPreset(sec){
  if(!restStartTs){startRest(sec);return;}
  const elapsed=Math.floor((Date.now()-restStartTs)/1000);
  if(elapsed>=sec){stopRest();return;}
  // Garde restStartTs (début du repos), change seulement la cible totale
  // → _restLeft() = sec - elapsed (temps restant = cible - déjà écoulé)
  restTot=sec;_restBeeped=false;_countdownSecs=new Set();
  if(_restEx){S.exRestPref=S.exRestPref||{};S.exRestPref[_restEx]=sec;persist();}
  _highlightRestPreset(sec);updRest();_updPill();
}
function addRT(s){
  if(!restStartTs)return;
  // Recalcule restStartTs pour que _restLeft() reflète la nouvelle durée
  const newLeft=Math.max(5,Math.min(_restLeft()+s,600));
  restStartTs=Date.now()-(restTot-newLeft)*1000;
  updRest();
}
// ⚠️ « Skip » doit HONORER l'avance en attente, pas la jeter (ft-v825). `stopRest()` remet
// `_restDoneCb` à null : quelqu'un qui écourte son repos restait donc bloqué sur l'exercice
// terminé — exactement le geste que ft-v825 vient de supprimer, et il revenait par la porte
// de derrière. Vaut aussi pour la pyramide et le superset, qui avaient le même trou.
function skipRest(){const cb=_restDoneCb;stopRest();if(cb)cb();}

// ─── Réglage manuel du temps de repos (retour Emma, ft-v438) ──────────────────
// Ouvre un mini-éditeur min:sec → règle la durée du repos en cours (avant, on ne pouvait
// qu'ajouter/retirer 15s à répétition). Mémorise aussi la préférence pour l'exercice.
function openRestEdit(){
  const mi=document.getElementById('re-min'),se=document.getElementById('re-sec');
  const left=restStartTs?Math.max(5,_restLeft()):(restTot||S.defRest||130);
  if(mi)mi.value=Math.floor(left/60);
  if(se)se.value=left%60;
  const ov=document.getElementById('ov-rest-edit');if(ov)ov.classList.add('open');
  setTimeout(()=>{if(mi){mi.focus();mi.select&&mi.select();}},60);
}
function closeRestEdit(){const ov=document.getElementById('ov-rest-edit');if(ov)ov.classList.remove('open');}
function applyRestEdit(){
  const mi=parseInt(document.getElementById('re-min')?.value)||0;
  const se=parseInt(document.getElementById('re-sec')?.value)||0;
  let total=mi*60+se;
  total=Math.max(5,Math.min(total,900)); // borne : 5 s … 15 min
  if(!restStartTs){startRest(total);}
  else{
    // repart du nouveau total (compte à rebours frais depuis la valeur saisie)
    restTot=total;restStartTs=Date.now();_restBeeped=false;_countdownSecs=new Set();
    _closeRestCountdown();
    updRest();_updPill();
  }
  if(_restEx){S.exRestPref=S.exRestPref||{};S.exRestPref[_restEx]=total;persist();}
  _highlightRestPreset(total);
  closeRestEdit();
  if(typeof toast==='function')toast('Repos réglé sur '+(mi?mi+' min ':'')+(se||!mi?se+' s':''),'info');
}

// ─── EXERCISE PICKER ─────────────────────────────────────────
const _IMG=n=>`<img src="muscles/${n}.svg" style="height:46px;width:auto">`;
const EX_GROUPS=[
  {label:'Pectoraux',               tags:['Pectoraux'],           icon:`<img src="muscles/muscle pectoreaux.png" style="width:64px;height:64px;object-fit:cover;">`,        anatomy:'anatomy/pectoreaux/schema pectoreaux.png'},
  {label:'Dos / Dorsaux',           tags:['Dos'],                 icon:`<img src="muscles/muscles dorsaux trapeze.png" style="height:80px;width:auto;object-fit:contain;">`,  anatomy:'anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png'},
  {label:'Épaules / Trapèzes',      tags:['Épaules','Trapèzes'],  icon:`<img src="muscles/epaule trapeze.png" style="width:64px;height:64px;object-fit:cover;">`,              anatomy:'anatomy/epaules/schéma epaule arriere.png'},
  {label:'Bras — Biceps / Triceps', tags:['Biceps','Triceps'],    icon:`<img src="muscles/muscle bras.png" style="height:80px;width:auto;object-fit:contain;">`,               anatomy:'anatomy/bras biceps triceps/schema muscles bras et avant bras.png'},
  {label:'Jambes',                  tags:['Jambes'],              icon:`<img src="muscles/muscle avant cuisse.png" style="height:80px;width:auto;object-fit:contain;">`, anatomy:'anatomy/jambes/jambes avant/jambes face avant.png'},
  {label:'Fessiers / Ischios / Lombaires', tags:['Fessiers','Lombaires'], icon:`<img src="muscles/fessiers ischios.png" style="height:80px;width:auto;object-fit:contain;">`, anatomy:'anatomy/fessiers lombaires/schema lombaires fessiers.png'},
  {label:'Abdominaux',              tags:['Abdominaux'],          icon:`<img src="muscles/muscle abdominaux.png" style="width:64px;height:64px;object-fit:cover;">`,         anatomy:'anatomy/abdominaux/schema abdominaux.png'},
  {label:'Mollets',                 tags:['Mollets'],             icon:`<img src="muscles/muscle mollet.png" style="width:64px;height:64px;object-fit:cover;">`,            anatomy:'anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png'},
];
let _exGrp=null;

// ─── TYPE DE MATÉRIEL (test testeurs) — deviné du nom de l'exercice ──────
const _EQ_META={
  cardio:{lbl:'Cardio',        ic:'🏃', c:'#F43F5E', bg:'rgba(244,63,94,.13)'},
  elast:{lbl:'Élastique',      ic:'🎗️', c:'#FBBF24', bg:'rgba(251,191,36,.13)'},
  trx:{lbl:'TRX / Sangles',    ic:'🪢', c:'#22D3EE', bg:'rgba(34,211,238,.13)'},
  barre:{lbl:'Barre',          ic:'🏋️', c:'#FF6C00', bg:'rgba(255,108,0,.13)'},
  libre:{lbl:'Poids libre',    ic:'💪', c:'#5BA8FF', bg:'rgba(91,168,255,.13)'},
  guide:{lbl:'Guidé',          ic:'⚙️', c:'#A855F7', bg:'rgba(168,85,247,.13)'},
  corps:{lbl:'Poids du corps', ic:'🤸', c:'#34D399', bg:'rgba(52,211,153,.13)'},
  autre:{lbl:'Polyvalent',     ic:'🔀', c:'#8A8F9C', bg:'rgba(255,255,255,.05)'} // ex-« À classer » : décision Michel 01/08 (« les 3 ») — les fentes se font barre, haltères OU poids du corps : pas UNE famille, un choix. Le bac est une catégorie assumée, plus un point d'interrogation.
};
/* ─── LE MATÉRIEL ÉCRIT PASSE AVANT LES RÈGLES (13/08/2026) ────────────────────────────
   Signalé par Michel sur une capture : *« le rowing poitrine appuyé, haltères et pas
   barre »*. Il avait raison, et **l'app se contredisait elle-même** — l'illustration
   qu'elle affiche pour cet exercice est `rowing-halteres-banc-incline-prise-neutre.webp`.
   LA CAUSE : la règle 4 traite `rowing` comme un mot de la famille BARRE, en repli. Un
   rowing qui ne dit ni « barre » ni « haltère » tombait donc en barre par DÉFAUT — et un
   défaut silencieux est indiscernable d'une décision.
   LE REMÈDE est celui qu'on a déjà adopté pour les muscles (`_mscScores` lit `EX_MUSCLES`
   avant de consulter la moindre règle) : ce qui est ÉCRIT gagne, et les règles ne servent
   plus qu'à ce qu'on n'a pas écrit — exercices créés par l'utilisateur, noms arrivés par
   import. Plus d'ordre de règles à se tromper (R13, et le motif « premier match gagnant »
   de `BUGS.md`).
   ⚠️ N'ENTRE ICI QUE CE QUI EST CERTAIN, c'est-à-dire les mouvements qui ne peuvent PAS se
   faire autrement. Un squat sumo illustré avec un haltère reste un mouvement de barre :
   ceux-là restent aux règles, et se tranchent avec Michel (R29). */
const _EQ_ECRIT={
  // Une planche inclinée soutient la poitrine, on tire deux haltères. La version machine
  // existe, mais elle porte « machine » dans son nom et la règle 1 l'attrape déjà.
  'Rowing Poitrine Appuyée (Chest Supported)':'libre',
  // Suspendu SOUS une table : aucun matériel. C'est LA version « je m'entraîne à la
  // maison » — la ranger en barre la cachait précisément à qui la cherche.
  'Rowing Inversé sous une Table':'corps',
  // Le mouvement est DÉFINI par la rotation poignet des haltères (supination → pronation).
  // Impossible avec une barre : ce n'est pas une préférence, c'est le mouvement.
  'Curl Zottman':'libre',
  // Un seul haltère, coude calé à l'intérieur de la cuisse. Une barre ne passe pas.
  'Curl Concentré':'libre',
  // Sur un banc incliné, les bras pendent le long du corps : une barre ne peut pas être
  // curlée depuis cette position (les cuisses et le banc sont dans le chemin). C'est le
  // même critère que les trois du dessus — le mouvement n'existe qu'aux haltères.
  'Curl Incliné':'libre',
  // ⛔ « Pull-over » tout court n'a plus de ligne ici : il a été RETIRÉ DU CHOIX le 25/08
  //    (décision Michel — voir constants.js et RETIRES_VOLONTAIREMENT). Le ranger n'a plus de
  //    sens puisqu'il n'apparaît plus au sélecteur ; son identifiant survit pour l'historique.
};
function _exEquip(name){
  const s=_naz(name);
  const ecrit=_EQ_ECRIT[name];
  if(ecrit)return ecrit;
  // 0) MATÉRIEL ÉCRIT DANS LE NOM — doit passer AVANT tout le reste (premier match gagnant) :
  //    sans ça « Squat TRX » retombe sur la règle « squat » → 🏋️ Barre (mesuré le 02/08).
  if(/trx|sangles|suspension/.test(s)) return 'trx';
  if(/elastique|bande elastique|bandes elastiques/.test(s)) return 'elast';
  // 0bis) CARDIO / conditionnement : ni charge ni série au sens muscu — un bac à part.
  if(/air ?bike|assault|ski ?erg|ergometre|corde a sauter|saut a la corde|sauts a la corde|burpee|jumping jack|bear crawl|marche de l ours|wall ball|battle rope|box jump|jump box|mountain climber|grimpeur|rameur|tapis|elliptique|chariot|sled|traineau/.test(s)) return 'cardio';
  // 0ter) ⚠️ Un ROWING à la barre ou aux haltères est un POIDS LIBRE, pas une machine.
  //    Depuis qu'on écrit le nom français dans le nom (« Rowing Barre (Tirage Horizontal) »),
  //    le mot « tirage » de la TRADUCTION le faisait basculer en ⚙️ Guidé (mesuré le 02/08).
  //    Le matériel réel est dans le nom principal — la traduction ne doit pas le contredire.
  if(/rowing/.test(s)&&!/machine|poulie|smith|cable|hammer|landmine|t ?bar|assist/.test(s)){
    if(/haltere/.test(s)) return 'libre';
    if(/barre/.test(s))   return 'barre';
  }
  // 0quater) ⚠️ Un matériel ÉCRIT dans le nom prime sur la FAMILLE de l'exercice (croisement 02/08) :
  //    « Leg Curl Haltère » partait en ⚙️ Guidé (à cause de « leg curl ») et « Montée sur Box
  //    Haltères » en 🤸 Poids du corps (à cause de « box ») — alors que les deux disent « haltère ».
  if(/haltere|kettlebell/.test(s)&&!/machine|poulie|smith|guide|cable|convergent|hammer|levier|presse/.test(s)) return 'libre';
  // 1) Guidé / machine (le plus spécifique d'abord)
  if(/machine|poulie|smith|guide|pec ?deck|peck ?deck|presse|press[ -]?jambes|leg press|leg extension|extension quadriceps|leg curl|leg abduction|leg adduction|tirage|chest press|hack|convergent|hammer|cable|câble|vis-a-vis|crossover|croise poulie|assist|butterfly|pendulum|belt squat|sled|iso.?laterale?|convergente/.test(s)) return 'guide'; // + press jambes / extension quadriceps (01/08 : ils tombaient dans « à classer »)
  // 2) Poids du corps
  // ⚠️ « Squat Poids du Corps (Air Squat) » était rangé en 🏋️ BARRE — le mot « poids du corps »
  //    est pourtant ÉCRIT dans son nom, mais la règle « squat » (bac Barre) le happait avant.
  //    Conséquence concrète : quelqu'un qui filtre « je m'entraîne à la maison » ne voyait pas
  //    l'air squat. Même cas pour le squat sauté, le sissy squat et le cossack squat.
  //    (Les versions MACHINE restent guidées : la règle 1 passe avant celle-ci.)
  if(/traction|pull-?up|pull up|dips|pompe|push-?up|gainage|planche|plank|pistol|muscle-?up|chaise|wall sit|superman|l-sit|releve.*jambe|leg raise|crunch|russian twist|mountain climber|burpee|hollow|ghd|glute ham|nordic|box|montee|poids du corps|air squat|squat saute|jump squat|sissy|cossack|wall slide|glissement au mur/.test(s)) return 'corps';
  // 3) Poids libre (haltères / kettlebell)
  if(/haltere|dumbbell|kettlebell|goblet|landmine|croix de fer|farmer|marche du fermier|swing|arnold|renegade/.test(s)) return 'libre';
  // 4) Barre (classiques : couché/incliné, squat, soulevé, rowing, militaire, curl…)
  if(/barre|barbell|couche|incline|decline|squat|souleve|deadlift|rowing|militaire|curl|developpe|good morning|hip thrust|zercher|reeves|rack pull|shrug|thruster|meadows|seal row|pull-?over|overhead/.test(s)) return 'barre';
  return 'autre';
}
// Le test n'est visible que pour les testeurs + Michel (pas les utilisateurs normaux)
// ✅ OUVERT À TOUT LE MONDE le 02/08/2026 (décision Michel : « on ouvre à tlm »), après l'audit
// qui a donné au classement ses 3 bacs manquants (Élastique · TRX/Sangles · Cardio) et corrigé
// 59 rangements. C'était une expérimentation réservée aux testeurs depuis ft-v697.
// La fonction est GARDÉE (elle ne renvoie plus que `true`) pour ne pas avoir à chasser ses usages
// — même choix qu'à l'ouverture de la nutrition, `_isNutriBeta()` (ft-v623).
function _eqTestOn(){return true;}
let _eqHideBadge=false; // vrai pendant le rendu groupé : le titre de section porte déjà le type, pas besoin du badge par ligne
function _exEqBadge(name){
  if(_eqHideBadge||!_eqTestOn())return'';
  const m=_EQ_META[_exEquip(name)];
  return m?`<span class="ex-eq" style="color:${m.c};background:${m.bg};">${m.ic} ${m.lbl}</span>`:'';
}
// Rendu du sélecteur groupé par TYPE DE MATÉRIEL (titres de sous-sections colorés)
const _EQ_ORDER=['barre','libre','guide','corps','elast','trx','cardio','autre'];  // maison (élastique/TRX) et cardio en fin de liste : ce sont des familles à part, pas des variantes de charge
// `rangs` (optionnel) = tableau parallèle des rangs de pertinence, fourni pendant une RECHERCHE.
// ⚠️ Sans lui, le regroupement par matériel imposait son propre ordre et ANNULAIT le tri par
// pertinence : on avait beau classer « Pec Deck » premier, il repartait dans le bac ⚙️ Guidé,
// affiché après 🏋️ Barre. Mesuré le 02/08. Pendant une recherche, les BACS sont donc ordonnés
// par leur meilleur résultat ; hors recherche, l'ordre fixe habituel est conservé.
function _renderExGrouped(listArr, rangs){
  const buckets={};
  listArr.forEach((e,i)=>{const k=_exEquip(e.n);(buckets[k]=buckets[k]||[]).push(e);
    if(rangs){e.__r=rangs[i];}});
  let html='';
  _eqHideBadge=true; // les lignes n'affichent pas le badge (le titre de section le porte)
  let ordre=_EQ_ORDER;
  if(rangs){
    const best={}; Object.keys(buckets).forEach(k=>{
      best[k]=Math.min.apply(null,buckets[k].map(e=>e.__r==null?9:e.__r));
      buckets[k].sort((a,b)=>(a.__r==null?9:a.__r)-(b.__r==null?9:b.__r));
    });
    ordre=_EQ_ORDER.slice().sort((a,b)=>(best[a]==null?9:best[a])-(best[b]==null?9:best[b]));
  }
  ordre.forEach(k=>{
    const arr=buckets[k];if(!arr||!arr.length)return;
    const m=_EQ_META[k];
    html+=`<div class="ex-subhdr" style="color:${m.c};background:${m.bg};"><span>${m.ic} ${m.lbl}</span><span class="ex-subhdr-n">${arr.length}</span></div>`
      +arr.map(_exPickRow).join('');
  });
  _eqHideBadge=false;
  return html;
}
function _exPickRow(e){
  const safe=_escAttrJs(e.n);
  // Slot photo TOUJOURS réservé (30px) → toutes les lignes alignées, avec ou sans photo.
  // Tap sur la vignette = VOIR la photo en grand (n'ajoute PAS l'exercice).
  const src=_exImg(e.n);
  const thumb=src
    ?`<img src="${src}" onclick="event.stopPropagation();_viewExPhoto('${safe}')" style="width:30px;height:30px;object-fit:cover;border-radius:6px;flex-shrink:0;margin-right:8px;border:1px solid var(--sep);cursor:zoom-in;">`
    :`<span style="width:30px;flex-shrink:0;margin-right:8px;" aria-hidden="true"></span>`;
  const edit=e.custom?` <span onclick="event.stopPropagation();openEditCustomEx('${safe}')" title="Modifier" style="font-size:13px;color:var(--purp);cursor:pointer;padding:2px 6px;touch-action:manipulation;">✎</span>`:'';
  const fav=(_exFavSet&&_exFavSet.has(e.n))?'<span style="color:var(--gold);margin-right:4px;font-size:12px;" title="Tu l\'utilises souvent">★</span>':'';
  const eqBadge=_exEqBadge(e.n);
  const mid=eqBadge
    ?`<div class="ex-pick-mid"><span class="ex-pick-name">${fav}${_escNote(e.n)}${edit}</span>${eqBadge}</div>`
    :`<span class="ex-pick-name">${fav}${_escNote(e.n)}${edit}</span>`;
  return `<div class="ex-pick" onclick="addExercise('${safe}')" style="display:flex;align-items:center;">${thumb}${mid}<span class="ex-pick-grp">${e.g}</span></div>`;
}
function openExPicker(){
  _exGrp=null;
  const s=document.getElementById('ex-search');if(s)s.value='';
  filterEx();
  _exAjoutes=0; _majTitreExPicker();   // le compteur repart à chaque ouverture
  document.getElementById('mod-ex').classList.add('open');
}
function closeExPicker(){document.getElementById('mod-ex').classList.remove('open');hideCustomExForm();_exGrp=null;if(_exPickerMode==='replace'||_exPickerMode==='replaceSess'||_exPickerMode==='addSess'||_exPickerMode==='prog'){_exPickerMode='workout';_replaceEi=null;}
  /* ⚠️ LE SCROLL SE FAIT ICI, PAS À L'AJOUT (25/08). Tant que le sélecteur reste ouvert, faire
     défiler l'écran du dessous est un mouvement invisible — et à la fermeture on se retrouvait
     n'importe où. On amène donc la vue sur le dernier exercice ajouté au moment où l'écran
     redevient visible, et seulement si on a réellement ajouté quelque chose. */
  if(_exAjoutes>0){
    _exAjoutes=0; _majTitreExPicker();
    setTimeout(()=>{const el=document.getElementById('ex-block-'+_expandedEx);
      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},80);
  }}
// Favoris = exercices les plus utilisés (depuis l'historique) → remontés en tête de recherche + ★ (ft-v562)
let _exFavSet=new Set();
function _exUsageMap(){
  const u={};
  (S.sessions||[]).forEach(s=>{(s.exs||s.exercises||[]).forEach(e=>{if(e&&e.name)u[e.name]=(u[e.name]||0)+1;});});
  return u;
}
function _exDedup(arr){ const vu=new Set(); return arr.filter(e=>{ if(vu.has(e.n))return false; vu.add(e.n); return true; }); }
// ⚠️ LES ANCIENS NOMS RESTENT CHERCHABLES. Quand on renomme ou qu'on fusionne un exercice,
// son ancien nom disparaît de la liste — et quelqu'un qui l'a toujours en tête ne le trouve
// plus. Mesuré le 03/08 : après la fusion des doublons, taper « Triceps Haltère » ou
// « Dips Parallèles » ne rendait plus AUCUN résultat. La table d'identité garde pourtant tous
// les anciens noms ; il suffisait de les lire. Vaut pour tous les renommages, passés et à venir.
function _anciensNoms(nom){
  try{ const id=(typeof exId==='function')?exId(nom):null;
       return (id&&EX_IDS[id])?EX_IDS[id].slice(1):[]; }catch(e){ return []; }
}
function filterEx(){
  const q=(document.getElementById('ex-search').value||'').toLowerCase().trim();
  const all=[...EXLIB,...(S.customExercises||[])].sort((a,b)=>a.n.localeCompare(b.n,'fr'));
  const list=document.getElementById('ex-list');
  // Usage (fréquence) → set des favoris (≥3 utilisations) : ★ affichée partout dans le sélecteur
  const _usage=_exUsageMap();
  _exFavSet=new Set(Object.keys(_usage).filter(n=>_usage[n]>=3));
  // Recherche active → liste plate
  if(q){
    _exGrp=null;
    const qn=_normEx(q);
    // ── RECHERCHE PAR SCHÉMA DE MOUVEMENT (retour Tatiana, 02/08) ────────────────
    // Elle tape « Tirage horizontal » → « Aucun résultat ». Or l'app CONNAÎT ce terme :
    // c'est le nom d'un de ses schémas de mouvement (_MOV_PATTERNS), qui a même « tirage
    // horizontal » dans ses mots-clés. Le mot existait, il ne descendait pas jusqu'à la
    // recherche. On regarde donc aussi le SCHÉMA : taper « tirage horizontal » sort tous
    // les rowings, « poussée verticale » tous les développés épaules, etc.
    // C'est le vocabulaire de salle, celui qu'on emploie naturellement.
    let _patCible=null;
    try{
      if(typeof _MOV_PATTERNS!=='undefined' && qn.length>=4){
        // ⚠️ On n'élargit QUE sur le LIBELLÉ d'une famille (« tirage horizontal », « poussée
        // verticale »…), jamais sur un simple mot-clé. Correctif du 02/08 : les mots-clés
        // contiennent des noms d'exercices PRÉCIS (« svend », « pec deck », « yates »,
        // « meadows », « sled ») — taper l'un d'eux déclenchait l'élargissement et rendait
        // 45 résultats au lieu de 1. Le libellé, lui, EST une intention de famille.
        const p2=_MOV_PATTERNS.find(P=>{
          const lab=_normEx(P.label||'');
          return !!(lab&&(lab.indexOf(qn)>=0||qn.indexOf(lab)>=0));
        });
        if(p2)_patCible=p2.id;
      }
    }catch(e){}
    // ── RECHERCHE PAR SYNONYME DE SALLE (_EX_EQUIV) — retour Michel, 08/08 ───────────────
    // Il tape « Butterfly » → « Aucun résultat ». Il crée donc un exercice PERSO « Butterfly »
    // et le range dans Épaules — alors que c'est un exercice de PECTORAUX qui existe déjà au
    // catalogue sous le nom « Pec Deck ». Le coût n'est pas cosmétique : l'historique se coupe
    // en deux (l'ancien Pec Deck d'un côté, le Butterfly perso de l'autre), la figurine se
    // trompe de muscle, et une ligne de plus part dans la feuille « Exercices manquants ».
    // ⚠️ ET L'APP SAVAIT DÉJÀ : _EX_EQUIV contient 'butterfly' → 'Pec Deck' (et
    // 'pec deck inverse' → 'Machine Oiseau'). Cette table ne servait qu'aux IMPORTS
    // (_matchExercise) ; elle ne descendait pas jusqu'à la RECHERCHE. Mesuré le 08/08 :
    // **371 des 505 synonymes rendaient « Aucun résultat »** — 21 % seulement menaient au bon
    // exercice. C'est mot pour mot le cas Tatiana du 02/08 juste au-dessus (« tirage
    // horizontal ») : autre table, même cause — le mot existait, il n'atteignait pas l'écran.
    // ⚠️ DEUX NIVEAUX, et la distinction n'est pas cosmétique. En ajoutant « butterfly inversé »
    // (→ Machine Oiseau, un exercice d'ÉPAULES), taper « butterfly » s'est mis à sortir Machine
    // Oiseau EN PREMIER — alors que Michel venait précisément de prévenir : *« Butterfly c'est
    // les pecs attention »*. Le mot ENTIER doit donc toujours battre le mot EN COURS DE FRAPPE.
    let _synExact=null, _synDebut=null;
    try{
      if(typeof _EX_EQUIV!=='undefined' && qn.length>=2){
        const ex=new Set(), db=new Set();
        // ⚠️ La table peut viser un ANCIEN nom : 'leg curl' → « Curl Ischio-jambiers (Leg Curl) »,
        // qui n'est plus au catalogue depuis son renommage en « Leg Curl Couché Machine ». Sans
        // exNomActuel, ce synonyme viserait le vide — le correctif serait mort en silence pour
        // lui, sans erreur ni test rouge. (Seul cas au 08/08, vérifié sur les 505 clés.)
        const cibleDe=k=>{const v=_EX_EQUIV[k];return (typeof exNomActuel==='function')?exNomActuel(v):v;};
        for(const k in _EX_EQUIV){
          if(k===qn){ const c=cibleDe(k); if(c)ex.add(c); }
          // Le préfixe (frappe en cours) n'est ouvert qu'à partir de 3 caractères ; en dessous,
          // SEUL le mot entier compte. Sinon « dc » sortirait tout ce qui commence par « dc »…
          // mais les abréviations de salle à 2 lettres sont réelles et nombreuses (dc, lp, bs,
          // fs, gm, di, dd, dm) : les refuser toutes reviendrait à rater ce que les gens tapent
          // vraiment. On garde donc l'exact, on ferme l'à-peu-près.
          else if(qn.length>=3&&k.indexOf(qn)===0){ const c=cibleDe(k); if(c)db.add(c); }
        }
        ex.forEach(c=>db.delete(c));            // un exact ne redescend jamais au rang « début de mot »
        if(ex.size)_synExact=ex;
        if(db.size)_synDebut=db;
      }
    }catch(e){_synExact=null;_synDebut=null;}
    // ── LE RANG DE PERTINENCE (02/08, correctif d'une régression que j'avais créée) ──────
    // La recherche était un FILTRE (oui/non) affiché dans l'ordre ALPHABÉTIQUE, sans aucune
    // notion de « à quel point ça correspond ». Tant que le filtre était étroit, ça passait.
    // En l'élargissant (familles de mouvement, ft-v728), le bruit est devenu ingérable :
    // mesuré, taper « développé couché » rendait 45 résultats dont 8 seulement contenaient
    // ces mots, et « pec deck » ou « svend » — des noms d'exercices PRÉCIS — rendaient 45
    // résultats avec l'exercice cherché en DERNIÈRE position (ces mots sont aussi des
    // mots-clés de famille). Chaque élargissement du filtre aggravait le problème, faute
    // d'un tri pour le compenser.
    // On classe donc par pertinence décroissante ; l'élargissement par famille reste utile
    // mais passe APRÈS tout ce qui correspond vraiment au nom.
    const _rang=e=>{
      const nn=_normEx(e.n);
      if(nn===qn) return 0;                                   // le nom exact
      if(nn.indexOf(qn)===0) return 1;                        // le nom COMMENCE par la recherche
      if(nn.indexOf(qn)>=0) return 2;                         // le nom la CONTIENT
      if(_synExact&&_synExact.has(e.n)) return 3;              // synonyme de salle EXACT (« butterfly » → Pec Deck)
      const en=(typeof EX_EN!=='undefined'&&EX_EN[e.n])?_normEx(EX_EN[e.n]):'';
      if(en&&en.indexOf(qn)>=0) return 4;                     // le terme anglais
      if(_synDebut&&_synDebut.has(e.n)) return 5;             // synonyme dont la frappe n'est pas finie
      if(_anciensNoms(e.n).some(a=>_normEx(a).indexOf(qn)>=0)) return 6;  // un ANCIEN nom
      if(_normEx(e.g).indexOf(qn)>=0) return 7;               // le groupe musculaire
      return 8;                                               // même famille de mouvement
    };
    const f=all.filter(e=>{
      if((_synExact&&_synExact.has(e.n))||(_synDebut&&_synDebut.has(e.n))) return true;
      if(_patCible){ try{ if(_movPattern(e.n)===_patCible) return true; }catch(x){} }
      // Cherche aussi dans les termes ANGLAIS (EX_EN) → « shoulder press », « bench press », « leg press »…
      // trouvent l'exercice même si son nom français ne contient pas le mot anglais.
      const en=(typeof EX_EN!=='undefined'&&EX_EN[e.n])?EX_EN[e.n].toLowerCase():'';
      return e.n.toLowerCase().includes(q)||_normEx(e.n).includes(qn)||e.g.toLowerCase().includes(q)||(en&&(en.includes(q)||_normEx(en).includes(qn)))
        ||_anciensNoms(e.n).some(a=>a.toLowerCase().includes(q)||_normEx(a).includes(qn));
    }).sort((a,b)=>_rang(a)-_rang(b));   // tri STABLE → l'ordre alphabétique est conservé à rang égal
    // Favoris/plus utilisés en PREMIER (tri stable → alpha conservé à usage égal)
    const fd=_exDedup(f);
    // ── LES « MÊME FAMILLE » PASSENT SOUS UNE LIGNE DE SÉPARATION (retour Michel, 09/08) ──
    // Mesuré : taper « squat » rendait **44 résultats, dont 12 sans le mot « squat »** — les
    // Press Jambes, les Presses à Cuisses, la Chaise, le Sled Push. Ils arrivent par FAMILLE
    // de mouvement, ce qui est juste anatomiquement (une presse à cuisses EST un squat guidé)
    // et parfois très utile — mais quelqu'un qui tape « squat » cherche un squat.
    // ⚠️ ON NE LES RETIRE PAS, on les RANGE : c'est l'élargissement qui a sauvé le retour de
    // Tatiana (« tirage horizontal » → aucun résultat). Le supprimer ferait revenir ce bug.
    // Ils gardent juste leur place — après, sous un titre qui dit ce qu'ils sont (R24 :
    // informer sans bloquer ; R26 : le format incite).
    const _vrais=fd.filter(e=>_rang(e)<8), _famille=fd.filter(e=>_rang(e)===8);
    let _html='';
    if(fd.length){
      // ⚠️ Si RIEN ne correspond au nom, c'est que la personne a tapé un nom de FAMILLE
      // (« poussée verticale », « hip hinge ») — la famille EST alors sa réponse, pas un
      // rattrapage. Dans ce cas on affiche normalement : un titre « même famille » posé
      // au-dessus de la seule liste présente ne dirait rien d'utile.
      const _queFamille = !_vrais.length;
      const _liste = _queFamille ? _famille : _vrais;
      _html = _eqTestOn()?_renderExGrouped(_liste,_liste.map(_rang)):_liste.map(_exPickRow).join('');
      if(_famille.length && !_queFamille){
        _html += `<div class="ex-subhdr" style="color:var(--t2);background:var(--bg3);margin-top:10px;">`
              +  `<span>↘ Même famille de mouvement</span><span class="ex-subhdr-n">${_famille.length}</span></div>`
              +  _famille.map(_exPickRow).join('');
      }
    }
    list.innerHTML=_html||'<div style="padding:20px;text-align:center;color:var(--t3);">Aucun résultat</div>';
    return;
  }
  // Groupe sélectionné → exercices du groupe
  if(_exGrp!==null){
    const grp=EX_GROUPS[_exGrp];
    const f=_exDedup(all.filter(e=>grp.tags.includes(e.g)));  // un squat est listé dans Jambes ET Fessiers → une seule ligne
    const anatBtn=grp.anatomy
      ?`<button onclick="openAnatomyImg('${grp.anatomy.replace(/'/g,"\\'")}','${grp.label}')" style="background:rgba(255,45,85,.12);border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;color:var(--red);cursor:pointer;display:flex;align-items:center;gap:5px;flex-shrink:0;">🫀 Anatomie</button>`
      :'';
    list.innerHTML=
      `<button class="ex-grp-back" onclick="_exGrp=null;filterEx();">‹ Groupes musculaires</button>`+
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div class="ex-grp-header" style="margin-bottom:0;">${grp.icon} ${grp.label}</div>
        ${anatBtn}
      </div>`+
      (f.length?(_eqTestOn()?_renderExGrouped(f):f.map(_exPickRow).join('')):'<div style="padding:16px;text-align:center;color:var(--t3);">Aucun exercice — utilise "+ Créer"</div>');
    return;
  }
  // Vue par défaut → tuiles des groupes
  list.innerHTML=EX_GROUPS.map((grp,i)=>{
    return `<div class="ex-grp-tile" onclick="_exGrp=${i};filterEx();">
      <span class="ex-grp-icon">${grp.icon}</span>
      <div class="ex-grp-info"><div class="ex-grp-label">${grp.label}</div></div>
      <span class="ex-grp-arrow">›</span>
    </div>`;
  }).join('');
}
function _renderCexChips(){
  const muscles=Object.entries(_MG).map(([k,d])=>({k,l:d.label}));
  ['p','s'].forEach(type=>{
    const el=document.getElementById('cex-muscles-'+type);
    if(!el)return;
    const arr=type==='p'?_cexMusclesP:_cexMusclesS;
    el.innerHTML=muscles.map(({k,l})=>{
      const active=arr.includes(k);
      const col=type==='p'?'var(--red)':'var(--orange)';
      const bg=active?(type==='p'?'rgba(255,45,85,.85)':'rgba(255,149,0,.85)'):'rgba(255,255,255,.06)';
      return `<button onclick="toggleMuscleChip('${k}','${type}')" style="font-size:11px;padding:4px 8px;border-radius:12px;border:1px solid ${active?col:'var(--sep)'};background:${bg};color:${active?'#fff':'var(--t2)'};cursor:pointer;font-family:var(--font);font-weight:${active?700:400};transition:all .15s;">${l}</button>`;
    }).join('');
  });
}
function toggleMuscleChip(key,type){
  const other=type==='p'?'s':'p';
  const arrP=_cexMusclesP,arrS=_cexMusclesS;
  const arr=type==='p'?arrP:arrS;
  const arrOth=type==='p'?arrS:arrP;
  const othIdx=arrOth.indexOf(key);if(othIdx>-1)arrOth.splice(othIdx,1);
  const idx=arr.indexOf(key);
  if(idx>-1)arr.splice(idx,1);else arr.push(key);
  _renderCexChips();
}
function showCustomExForm(){
  _cexMusclesP=[];_cexMusclesS=[];_cexImg=null;_editingCustomExName=null;
  document.getElementById('custom-ex-form').style.display='flex';
  document.getElementById('custom-ex-add-btn').style.display='none';
  _renderCexChips();_renderCexImgPreview();_setCexFormMode(false);
}
function hideCustomExForm(){
  document.getElementById('custom-ex-form').style.display='none';
  document.getElementById('custom-ex-add-btn').style.display='';
  const n=document.getElementById('custom-ex-name');if(n)n.value='';
  _cexMusclesP=[];_cexMusclesS=[];_cexImg=null;_editingCustomExName=null;_renderCexImgPreview();_setCexFormMode(false);
}
// Bascule le libellé du formulaire perso entre « Créer » et « Enregistrer »
function _setCexFormMode(editing){
  const b=document.getElementById('cex-save-btn');if(b)b.textContent=editing?'Enregistrer':'Créer';
  const t=document.getElementById('cex-form-title');if(t)t.textContent=editing?'Modifier l\'exercice':'Nouvel exercice';
}
// Ouvre le formulaire pré-rempli pour MODIFIER un exercice perso existant
function openEditCustomEx(name){
  const c=(S.customExercises||[]).find(e=>e.n===name);
  if(!c){toast('Seuls les exercices perso sont modifiables','info');return;}
  openExPicker();
  showCustomExForm();
  _editingCustomExName=name;
  const ni=document.getElementById('custom-ex-name');if(ni)ni.value=c.n;
  // ⚠️ Un groupe ABSENT de la liste est refusé EN SILENCE par le navigateur : `gs.value` ne
  // change pas, le menu reste sur l'option précédente… et la sauvegarde écrit CE groupe-là.
  // Modifier un exercice le reclassait donc sans rien dire. On ajoute l'option au besoin.
  const gs=document.getElementById('custom-ex-grp');
  if(gs){
    if(c.g && ![...gs.options].some(o=>o.value===c.g)){
      const o=document.createElement('option'); o.value=c.g; o.textContent=c.g; gs.appendChild(o);
    }
    gs.value=c.g;
  }
  _cexMusclesP=(c.muscles&&c.muscles.p)?[...c.muscles.p]:[];
  _cexMusclesS=(c.muscles&&c.muscles.s)?[...c.muscles.s]:[];
  _cexImg=c.img||null;
  _renderCexChips();_renderCexImgPreview();_setCexFormMode(true);
  setTimeout(()=>{document.getElementById('custom-ex-form')?.scrollIntoView({behavior:'smooth',block:'center'});},90);
}
// Renomme un exercice PARTOUT (historique, PRs, programmes, séance en cours) — pas de perte de données
function _renameExEverywhere(o,n){
  (S.sessions||[]).forEach(s=>{
    (s.exs||[]).forEach(ex=>{if(ex.name===o)ex.name=n;});
    (s.exercises||[]).forEach(ex=>{if(ex.name===o)ex.name=n;});
  });
  if((S.prs||{})[o]){
    if(!S.prs[n]||(S.prs[o].rm1||0)>(S.prs[n].rm1||0))S.prs[n]=S.prs[o];
    delete S.prs[o];
  }
  (S.programmes||[]).forEach(p=>{
    (p.days||[]).forEach(d=>(d.exs||[]).forEach(ex=>{if(ex.name===o)ex.name=n;}));
    (p.exs||[]).forEach(ex=>{if(ex.name===o)ex.name=n;});
  });
  if(S.wkt&&S.wkt.exs)S.wkt.exs.forEach(ex=>{if(ex.name===o)ex.name=n;});
}
// Enregistre les modifs d'un exercice perso existant
function _saveCustomExEdit(newName,grp){
  const oldName=_editingCustomExName;
  const c=(S.customExercises||[]).find(e=>e.n===oldName);
  if(!c){_editingCustomExName=null;hideCustomExForm();return;}
  if(newName.toLowerCase()!==oldName.toLowerCase()){
    const all=[...EXLIB,...(S.customExercises||[])];
    const clash=all.find(e=>e.n.toLowerCase()===newName.toLowerCase());
    if(clash){
      // Nom déjà pris → proposer de FUSIONNER : déplacer l'historique dans l'exercice existant + supprimer le perso
      showConfirm('Fusionner les exercices',
        '« '+clash.n+' » existe déjà. Déplacer l\'historique et les records de « '+oldName+' » dans « '+clash.n+' », puis supprimer « '+oldName+' » ?',
        ()=>_mergeCustomInto(oldName,clash.n),'Fusionner');
      return;
    }
  }
  const muscles=(_cexMusclesP.length||_cexMusclesS.length)?{p:[..._cexMusclesP],s:[..._cexMusclesS]}:null;
  c.g=grp;
  if(muscles)c.muscles=muscles; else delete c.muscles;
  if(_cexImg)c.img=_cexImg; else delete c.img;
  if(newName!==oldName){c.n=newName;_renameExEverywhere(oldName,newName);}
  _editingCustomExName=null;
  persist();
  hideCustomExForm();
  if(document.getElementById('mod-ex')&&document.getElementById('mod-ex').classList.contains('open'))filterEx();
  if(S.wkt)renderExBlocks();
  toast('Exercice modifié ✅','success');
}
// Fusionne un exercice perso dans un autre exercice existant : déplace séances/PRs/programmes,
// TRANSFÈRE la photo sur la cible (si elle n'en a pas déjà une), puis supprime le perso.
function _mergeCustomInto(oldName,targetName){
  // Récupère la photo du perso (img du perso OU exPhotos) AVANT de le supprimer.
  const src=(S.customExercises||[]).find(e=>e.n===oldName);
  const srcImg=(src&&src.img)||(S.exPhotos&&S.exPhotos[oldName])||'';
  _renameExEverywhere(oldName,targetName);
  S.customExercises=(S.customExercises||[]).filter(e=>e.n!==oldName);
  if(S.exPhotos&&S.exPhotos[oldName])delete S.exPhotos[oldName];
  // Transfère la photo sur la cible si elle n'en a pas déjà une (on n'écrase jamais la photo de la cible).
  if(srcImg){
    const tc=(S.customExercises||[]).find(e=>e.n===targetName);
    if(tc){ if(!tc.img)tc.img=srcImg; }                 // cible = exo perso → champ img
    else { if(!S.exPhotos)S.exPhotos={}; if(!S.exPhotos[targetName])S.exPhotos[targetName]=srcImg; } // cible = biblio → exPhotos
  }
  _editingCustomExName=null;
  persist();
  hideCustomExForm();
  if(document.getElementById('mod-ex')&&document.getElementById('mod-ex').classList.contains('open'))filterEx();
  if(S.wkt)renderExBlocks();
  toast('Fusionné dans « '+targetName+' » ✅','success');
}
// ─── PHOTO D'EXERCICE PERSO ───────────────────────────────────
// Réduit une image (fichier) en vignette légère (max 420px, JPEG) → data URI via callback
function _resizeImgFile(file,cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const max=420;let w=img.width,h=img.height;
      if(w>=h){if(w>max){h=Math.round(h*max/w);w=max;}}
      else{if(h>max){w=Math.round(w*max/h);h=max;}}
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      try{cb(cv.toDataURL('image/jpeg',0.72));}catch(err){if(typeof toast==='function')toast('Image trop grande','error');}
    };
    img.onerror=()=>{if(typeof toast==='function')toast('Image illisible','error');};
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
// Photo choisie dans le formulaire de création
function onCexImgSelected(input){
  const file=input.files&&input.files[0];input.value='';
  if(!file)return;
  _resizeImgFile(file,d=>{_cexImg=d;_renderCexImgPreview();});
}
function _renderCexImgPreview(){
  const el=document.getElementById('cex-img-preview');if(!el)return;
  if(_cexImg){
    el.innerHTML='<img src="'+_cexImg+'" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--sep);">'
      +'<button onclick="_clearCexImg()" style="background:none;border:none;color:var(--red);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);touch-action:manipulation;">Retirer</button>';
    el.style.display='flex';
  }else{el.innerHTML='';el.style.display='none';}
}
function _clearCexImg(){_cexImg=null;_renderCexImgPreview();}
// Ajouter/changer la photo de N'IMPORTE quel exercice (perso OU bibliothèque).
// Perso → stockée dans customExercises[].img (déjà synchro). Bibliothèque → dans S.exPhotos[name].
function changeExImg(name){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{
    const file=inp.files&&inp.files[0];if(!file)return;
    _resizeImgFile(file,d=>{
      const c=(S.customExercises||[]).find(e=>e.n===name);
      if(c){c.img=d;}
      else{if(!S.exPhotos)S.exPhotos={};S.exPhotos[name]=d;}
      persist();
      if(S.wkt)renderExBlocks();
      const md=document.getElementById('mod-ex');if(md&&md.classList.contains('open'))filterEx();
      toast('Photo ajoutée ✅','success');
    });
  };
  inp.click();
}
// Alias rétro-compat
function changeCustomExImg(name){ changeExImg(name); }
// Retirer une photo perso (revient à l'image par défaut si l'exercice en a une)
function removeExImg(name){
  const c=(S.customExercises||[]).find(e=>e.n===name);
  if(c&&c.img)delete c.img;
  if(S.exPhotos&&S.exPhotos[name])delete S.exPhotos[name];
  persist();
  if(S.wkt)renderExBlocks();
  const md=document.getElementById('mod-ex');if(md&&md.classList.contains('open'))filterEx();
  toast('Photo retirée','info');
}
// Source image d'un exercice — priorité : photo perso (custom OU bibliothèque) > image par défaut EX_YT
function _exImg(name){
  const c=(S.customExercises||[]).find(e=>e.n===name);
  if(c&&c.img)return c.img;
  if(S.exPhotos&&S.exPhotos[name])return S.exPhotos[name];
  // ⚠️ Les deux lignes ci-dessus restent EXACTES, exprès : elles lisent ce que la personne a
  // rangé sous SON nom. Seul le catalogue est résolu (nom ancien ou abrégé → nom du catalogue).
  const y=EX_YT[exNomCatalogue(name)];if(y&&y.img)return y.img;
  return null;
}
// A-t-il une photo PERSO (pas juste le gif par défaut) ?
function _hasUserPhoto(name){
  const c=(S.customExercises||[]).find(e=>e.n===name);
  return !!((c&&c.img)||(S.exPhotos&&S.exPhotos[name]));
}
// Ouvre la photo d'un exercice en grand (tap sur la vignette) — n'ajoute PAS l'exercice
function _viewExPhoto(name){
  const src=_exImg(name);if(!src)return;
  let ov=document.getElementById('ov-ex-photo');
  if(!ov){ov=document.createElement('div');ov.id='ov-ex-photo';ov.className='overlay';ov.style.zIndex='500';ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};document.body.appendChild(ov);}
  ov.innerHTML='<div class="modal" style="max-width:92vw;padding:14px;text-align:center;">'
    +'<div style="font-weight:800;font-size:15px;color:var(--t1);margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+name+'</div>'
    +'<img src="'+src+'" style="max-width:100%;max-height:68vh;border-radius:12px;display:block;margin:0 auto;">'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:12px;" onclick="document.getElementById(\'ov-ex-photo\').classList.remove(\'open\')">Fermer</button>'
    +'</div>';
  ov.classList.add('open');
}
function _reportCustomEx(name,grp,muscles){
  if(!S.url)return;
  if(!S.reportedCustomEx)S.reportedCustomEx=[];
  if(S.reportedCustomEx.includes(name))return;
  S.reportedCustomEx.push(name);
  localStorage.setItem('ft4_rep_cex',JSON.stringify(S.reportedCustomEx));
  const body={action:'logCustomExercise',anonId:S.anonId||'anon',name,group:grp||'Autres'};
  if(muscles){body.musclesP=muscles.p||[];body.musclesS=muscles.s||[];}
  fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}).catch(()=>{});
}

function saveCustomEx(){
  const name=(document.getElementById('custom-ex-name').value||'').trim();
  const grp=document.getElementById('custom-ex-grp').value;
  if(!name){toast("Entre un nom d'exercice",'error');return;}
  if(_editingCustomExName){ _saveCustomExEdit(name,grp); return; } // mode édition
  const all=[...EXLIB,...(S.customExercises||[])];
  if(all.find(e=>e.n.toLowerCase()===name.toLowerCase())){toast('Exercice déjà existant','error');return;}
  const similar=_findSimilar(name,all);
  if(similar){
    const lbl=similar.length>22?similar.slice(0,22)+'…':similar;
    showConfirm(
      'Exercice similaire trouvé',
      '"'+similar+'" ressemble à "'+name+'". Utiliser l\'exercice existant ?',
      ()=>{hideCustomExForm();addExercise(similar);},
      'Utiliser "'+lbl+'"',
      'Créer quand même',
      ()=>_doCreateCustomEx(name,grp)
    );
    return;
  }
  if(_cexSeraitMuet(name)){
    showConfirm(
      'Ajoute ses muscles ?',
      `L'app ne reconnaît pas « ${name} », et aucun muscle n'est coché. Sans ça il ne comptera pas dans tes statistiques par muscle, ni dans les couleurs de ton calendrier, et ses calories seront sous-estimées.\n\nCoche les muscles travaillés juste au-dessus — ça prend 5 secondes.`,
      ()=>{},                       // « Je coche » → on referme, le formulaire est resté ouvert
      'Je coche les muscles',
      'Créer quand même',
      ()=>_doCreateCustomEx(name,grp)
    );
    return;
  }
  _doCreateCustomEx(name,grp);
}
// Un exercice perso dont le NOM n'est reconnu par aucune règle ET dont les muscles ne sont pas
// cochés est « muet » : figurine grise, absent du volume par muscle et des couleurs du calendrier,
// calories au minimum, et Milo ne sait pas ce que c'est. Mesuré le 02/08 (« Machin Bizarre » :
// aucun muscle, aucun schéma). Rien ne le signalait — la personne ne pouvait pas le deviner.
// ⚠️ On PRÉVIENT, on ne bloque pas (R24 « informer sans bloquer ») : elle peut créer quand même.
function _cexSeraitMuet(name){
  try{
    if(_cexMusclesP.length||_cexMusclesS.length)return false;   // elle a coché : rien à signaler
    const sc=(_mscScores([{name:name,sets:[{done:true}]}])||{}).sc||{};
    return Object.keys(sc).length===0;
  }catch(e){return false;}
}
function _doCreateCustomEx(name,grp){
  if(!S.customExercises)S.customExercises=[];
  const muscles=(_cexMusclesP.length||_cexMusclesS.length)?{p:[..._cexMusclesP],s:[..._cexMusclesS]}:null;
  S.customExercises.push({n:name,g:grp,custom:true,...(muscles&&{muscles}),...(_cexImg&&{img:_cexImg})});
  persist();_reportCustomEx(name,grp,muscles);hideCustomExForm();filterEx();toast(name+' créé !','success');
}

// ─── IMPORT PROGRAMME PAR PHOTO ──────────────────────────────
let _impPhotos=[],_impExtracted=null,_impMode='new';
let _histPhotos=[],_histExtracted=null,_histConflicts=[];

function openImportProg(){
  _impPhotos=[];_impExtracted=null;_impMode='new';
  impGoStep(1);
  document.getElementById('ov-import-prog').classList.add('open');
}
function closeImportProg(){document.getElementById('ov-import-prog').classList.remove('open');}

function impGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('imp-s'+i);
    if(s)s.style.display='none';
    const dot=document.getElementById('imp-dot-'+i);
    if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('imp-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['imp-cam-inp','imp-gal-inp','imp-more-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function addImportPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const _c2d=canvas.getContext('2d');
      if(!_c2d){URL.revokeObjectURL(url);res(null);return;}
      _c2d.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _impPhotos.push(...results.filter(Boolean));
    _renderImpThumbs();
    impGoStep(2);
  });
}

function _loadPDFJS(){
  return new Promise((res,rej)=>{
    if(window.pdfjsLib){res();return;}
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    s.onload=()=>{
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      res();
    };
    s.onerror=()=>rej(new Error('Impossible de charger PDF.js'));
    document.head.appendChild(s);
  });
}
/* 🔐 OUVRIR UN PDF, MÊME PROTÉGÉ PAR MOT DE PASSE — Michel, 21/08 : « j'ai envie de mettre
   ma prise de sang mais c'est protégé par un mot de passe, je vais comment ? ». Les
   laboratoires livrent très souvent leurs bilans en PDF chiffré. Jusqu'ici l'app rendait
   « Souci lecture fichier » : un message qui dit qu'il y a un problème sans dire LEQUEL,
   donc sans dire quoi faire. La personne n'avait aucun moyen de deviner qu'il suffisait
   d'un mot de passe.
   ⭐ LE CORRECTIF VIT ICI, PAS DANS L'IMPORT DU BILAN (R2) : quatre imports lisent des PDF
   (bilan sanguin, programme, historique, repas). Un seul propriétaire de l'ouverture =
   les quatre héritent du même comportement et ne peuvent pas diverger.
   ⛔ LE MOT DE PASSE NE QUITTE JAMAIS LE TÉLÉPHONE. Il sert à déchiffrer le PDF EN LOCAL
   (pdf.js tourne dans le navigateur) ; ce sont les IMAGES rendues qui partent ensuite. Il
   n'est ni stocké, ni synchronisé, ni envoyé — cette fonction ne touche ni `S`, ni le
   réseau. ⚠️ Honnêteté : `prompt()` affiche ce qu'on tape en clair, ce n'est pas un champ
   masqué. Sur son propre téléphone, c'est acceptable ; le dire l'est aussi.
   ⚠️ ET ON NE DEMANDE UN MOT DE PASSE QUE SI C'EN EST UN. pdf.js signale le chiffrement par
   une exception NOMMÉE ; tout autre échec (fichier corrompu, pas un PDF) remonte tel quel.
   Sans cette distinction, un fichier abîmé ferait réclamer un mot de passe qui n'existe pas. */
const _PDF_ESSAIS_MAX = 3;
async function _pdfOuvrir(f){
  await _loadPDFJS();
  const buf=await f.arrayBuffer();
  let mdp;
  for(let essai=0; essai<_PDF_ESSAIS_MAX; essai++){
    try{
      // ⚠️ Une COPIE fraîche à chaque essai : pdf.js prend possession du tampon et le
      // détache. Le réutiliser tel quel ferait échouer la 2ᵉ tentative pour une raison
      // qui n'a rien à voir avec le mot de passe.
      const opts={ data:new Uint8Array(buf.slice(0)) };
      if(mdp!==undefined) opts.password=mdp;
      return await pdfjsLib.getDocument(opts).promise;
    }catch(e){
      const estMdp = !!(e && (e.name==='PasswordException' || e.code===1 || e.code===2));
      if(!estMdp) throw e;
      const rep = prompt(e.code===2
        ? 'Mot de passe incorrect. Réessaie :'
        : 'Ce PDF est protégé par un mot de passe.\n\nEntre-le (souvent ta date de naissance).\n\nIl reste sur ton téléphone : il sert à ouvrir le fichier ici, il n\'est jamais envoyé.');
      // ⛔ Renoncer est une réponse valable : on sort, on ne redemande pas en boucle.
      if(rep===null) throw new Error('mot de passe non saisi');
      mdp=rep;
    }
  }
  // ⛔ Sortie garantie : sans ce plafond, un mot de passe qu'on ne retrouve pas piégerait
  // la personne dans une suite de fenêtres sans fin.
  throw new Error('mot de passe refusé '+_PDF_ESSAIS_MAX+' fois');
}

async function _pdfToImages(f){
  const pdf=await _pdfOuvrir(f);
  const MAX_PAGES=8,MAX_DIM=1200;
  const pages=[];
  for(let i=1;i<=Math.min(pdf.numPages,MAX_PAGES);i++){
    const page=await pdf.getPage(i);
    const vp0=page.getViewport({scale:1});
    const scale=Math.min(MAX_DIM/vp0.width,MAX_DIM/vp0.height,2);
    const vp=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(vp.width);
    canvas.height=Math.round(vp.height);
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    pages.push({
      data:canvas.toDataURL('image/jpeg',0.85).split(',')[1],
      type:'image/jpeg',
      name:f.name+(pdf.numPages>1?' p.'+i:'')
    });
  }
  return pages;
}
// Extraction de la COUCHE TEXTE d'un PDF (100% local, 0 IA) — pour le Mode Test VM.
// Regroupe les fragments par ligne via leur coordonnée Y. Renvoie [] si PDF scanné (pas de texte).
async function _pdfToText(f){
  const pdf=await _pdfOuvrir(f);   // même porte d'entrée que _pdfToImages (R2)
  const MAX_PAGES=15, lines=[];
  for(let i=1;i<=Math.min(pdf.numPages,MAX_PAGES);i++){
    const page=await pdf.getPage(i);
    const tc=await page.getTextContent();
    const rows=[];
    tc.items.forEach(it=>{
      const s=(it.str||''); if(!s.trim())return;
      const y=Math.round(it.transform[5]);
      let row=rows.find(r=>Math.abs(r.y-y)<=3);
      if(!row){ row={y,parts:[]}; rows.push(row); }
      row.parts.push({x:it.transform[4],s});
    });
    rows.sort((a,b)=>b.y-a.y);                        // haut → bas (Y décroissant en repère PDF)
    rows.forEach(r=>{
      r.parts.sort((a,b)=>a.x-b.x);
      const txt=r.parts.map(p=>p.s).join(' ').replace(/\s+/g,' ').trim();
      if(txt) lines.push(txt);
    });
  }
  return lines;
}
async function addImportFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15;
  const results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=f.name.toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){
    _impPhotos.push(...results);
    _renderImpThumbs();
    impGoStep(2);
  }
}

function _renderImpThumbs(){
  const el=document.getElementById('imp-thumbs');if(!el)return;
  el.innerHTML=_impPhotos.map((p,i)=>{
    const fileIcon=p.isXlsx?'📊':p.isText?'📝':'📄';
    const thumb=(p.isPdf||p.isText)
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">${fileIcon}</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escNote(p.name||'Fichier')}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeImpPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}

function removeImpPhoto(i){
  _impPhotos.splice(i,1);
  if(!_impPhotos.length){impGoStep(1);return;}
  _renderImpThumbs();
}

// Décision Michel 31/07 : la lecture IA d'un programme utilise la clé API → 2 imports
// gratuits, ILLIMITÉ en Premium (« sinon les gens vont mettre 200 programmes »).
// Créer/éditer un programme À LA MAIN reste gratuit et illimité.
const PROG_FREE_LIMIT=2;
async function analyzeImportPhotos(){
  if(!_impPhotos.length){toast('Ajoute au moins une photo','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  if(!S.premium&&(S.progImports||0)>=PROG_FREE_LIMIT){
    if(window._premiumPending){toast('Vérification du statut premium…','info');return;}
    toast('Tes '+PROG_FREE_LIMIT+' imports gratuits de programme sont utilisés 🙂 Illimité en Premium.','info');
    if(typeof openPremiumInfo==='function')setTimeout(openPremiumInfo,600);
    return;
  }
  impGoStep(3);
  let _rawResp='';
  try{
    const r=await fetch(_aiUrl('importProgram'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'importProgram',images:_impPhotos})});
    _rawResp=await r.text();
    console.log('[Import] Réponse brute Apps Script :', _rawResp);
    const d=JSON.parse(_rawResp);
    if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
    _impExtracted=d.data;
    if(!S.premium){S.progImports=(S.progImports||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();} // compte l'import réussi (limite gratuite)
    _mergeImportSeances(); // fusionne « Séance 1 - Dorsaux/Biceps/… » en UNE séance (groupes = sections internes)
    _vmMatchExtracted();   // VM : rattache aux références EXLIB (évite les doublons) AVANT l'aperçu
    _renderImpConfirm();
    impGoStep(4);
  }catch(e){
    console.error('[Import] Erreur :', e.message, '| Réponse brute :', _rawResp);
    impGoStep(2);
    toast('Erreur analyse : '+e.message,'error');
  }
}

// Fusionne les « jours » d'import qui partagent le MÊME numéro de séance : « Séance 1 - Dorsaux »
// + « Séance 1 - Biceps » + « Séance 1 - Triceps » = UNE séance (les groupes musculaires sont des
// sections INTERNES, pas des séances distinctes — Règle 0 du projet). Local & déterministe : ne
// dépend pas du modèle, qui découpe parfois à tort quand le doc met un en-tête par groupe.
function _seanceNum(label){ const m=String(label||'').match(/s[ée]ance\s*(\d+)|jour\s*(\d+)|\bday\s*(\d+)|workout\s*(\d+)/i); return m?(m[1]||m[2]||m[3]||m[4]):null; }
function _seanceKw(label){ const m=String(label||'').match(/(s[ée]ance|jour|day|workout)/i); const k=(m?m[1]:'séance').toLowerCase(); return k==='séance'||k==='seance'?'Séance':k.charAt(0).toUpperCase()+k.slice(1); }
function _mergeImportSeances(){
  if(!_impExtracted||!(_impExtracted.days||[]).length)return;
  const out=[]; let merged=0;
  _impExtracted.days.forEach(day=>{
    const n=_seanceNum(day.label), prev=out[out.length-1];
    if(prev && n!=null && _seanceNum(prev.label)===n){
      prev.exercises=(prev.exercises||[]).concat(day.exercises||[]);
      prev.label=_seanceKw(prev.label)+' '+n;   // « Séance N » propre (groupes musculaires = sections internes)
      merged++;
    } else out.push(day);
  });
  _impExtracted.days=out;
  if(merged)console.log('[Import] '+merged+' sous-séance(s) fusionnée(s) par numéro de séance');
}
// VM → import : rattache chaque exercice importé à sa RÉFÉRENCE EXLIB (fini les doublons).
// Palier auto (confiance ≥90) = rattaché direct (nom remplacé, original gardé pour « annuler »).
// Palier confirm (zone grise) = proposé à l'utilisateur (« ≈ Rattacher à X ? »), nom inchangé
// tant qu'il n'a pas dit oui. Palier nouveau = laissé tel quel → exercice créé (comme avant).
function _vmMatchExtracted(){
  if(typeof _matchExercise!=='function'||!_impExtracted)return;
  (_impExtracted.days||[]).forEach(day=>(day.exercises||[]).forEach(ex=>{
    if(!ex||!ex.name)return;
    delete ex._vmFrom; delete ex._vmSuggest; delete ex._vmConf;
    let r; try{ r=_matchExercise(ex.name); }catch(e){ return; }
    if(!r||!r.match||r.match===ex.name)return; // rien à faire / déjà EXACTEMENT le nom canonique
    // (une simple différence de casse/accents « Pec deck » → « Pec Deck » est un rattachement utile :
    //  sinon l'exo importé ne partagerait ni stats ni figurine avec la référence EXLIB)
    if(r.tier==='auto'){ ex._vmFrom=ex.name; ex._vmConf=r.confidence; ex.name=r.match; }
    else if(r.tier==='confirm'){ ex._vmSuggest=r.match; ex._vmConf=r.confidence; }
  }));
}
function _impSetDayLabel(di,val){
  if(_impExtracted&&_impExtracted.days[di]) _impExtracted.days[di].label=(val||'').trim()||('Jour '+(di+1));
}
function _setProgDayLabel(di,val){
  if(_editProgData&&_editProgData.days&&_editProgData.days[di]) _editProgData.days[di].label=(val||'').trim()||('Jour '+(di+1));
}
function impAcceptMatch(di,ei){
  const ex=_impExtracted&&_impExtracted.days[di]&&_impExtracted.days[di].exercises[ei];
  if(!ex||!ex._vmSuggest)return;
  ex._vmFrom=ex.name; ex.name=ex._vmSuggest; delete ex._vmSuggest;
  _renderImpConfirm();
}
function impUndoMatch(di,ei){
  const ex=_impExtracted&&_impExtracted.days[di]&&_impExtracted.days[di].exercises[ei];
  if(!ex||!ex._vmFrom)return;
  ex.name=ex._vmFrom; delete ex._vmFrom; delete ex._vmConf;
  _renderImpConfirm();
}
// Refus d'une suggestion (zone grise) → on garde le nom importé tel quel (exo à part).
function impRejectMatch(di,ei){
  const ex=_impExtracted&&_impExtracted.days[di]&&_impExtracted.days[di].exercises[ei];
  if(!ex)return;
  delete ex._vmSuggest; delete ex._vmConf;
  _renderImpConfirm();
}
// ── Confirm « en un geste » (étape 2 industrialisation) : montre la FIGURINE de l'exo
// proposé (gif/photo si dispo, sinon muscle deviné) + ✓ Oui / ✕ Non explicites. Pensé
// pour un sportif fatigué : décider d'un coup d'œil, aucun formulaire. Partagé programme+journal.
// acceptCall / rejectCall = chaînes d'appel déjà construites (évite l'imbrication de gabarits).
// Vignette d'aperçu d'import : vraie image > muscle deviné SEULEMENT si fiable > icône haltère neutre
// (ne tombe JAMAIS sur le défaut « chest.svg » de _exMuscleImg → plus de torse rouge pour un exo inconnu)
function _impThumb(name){
  const box='width:36px;height:36px;border-radius:8px;flex-shrink:0;background:var(--bg3);box-sizing:border-box;';
  let gif=''; try{ gif=_exImg(name)||''; }catch(e){}
  if(gif) return `<img src="${gif}" onerror="this.style.visibility='hidden'" style="${box}object-fit:cover;">`;
  let musc=''; try{ const {sc}=_mscScores([{name,sets:[{done:true}]}]); const top=Object.entries(sc||{}).sort((a,b)=>b[1]-a[1])[0]; if(top&&_MG_IMG[top[0]]) musc=_MG_IMG[top[0]]; }catch(e){}
  if(musc) return `<img src="${musc}" onerror="this.style.visibility='hidden'" style="${box}object-fit:contain;padding:3px;">`;
  // exo RÉEL de la biblio (sans gif ni muscle deviné) → silhouette de son GROUPE (figurine pertinente, jamais le défaut chest global)
  let grp=''; try{ const cn=exNomCatalogue(name); const ex=EXLIB.find(e=>e.n===cn); if(ex&&_MUSCLE_FILE[ex.g]) grp=_MUSCLE_FILE[ex.g]; }catch(e){}
  if(grp) return `<img src="${grp}" onerror="this.style.visibility='hidden'" style="${box}object-fit:contain;padding:4px;">`;
  // vraiment inconnu (hors biblio) → icône haltère neutre
  return `<div style="${box}display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2" stroke-linecap="round"><path d="M6 9v6M9 7v10M15 7v10M18 9v6M9 12h6"/></svg></div>`;
}
function _vmConfirmRow(suggest, acceptCall, rejectCall, noThumb){
  let img='';
  if(!noThumb){ let thumb=''; try{ thumb=_exImg(suggest)||_exMuscleImg(suggest)||''; }catch(e){}
    img=thumb?`<img src="${thumb}" style="width:34px;height:34px;border-radius:7px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">`:''; }
  return `<div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;">`
    +img
    +`<span style="font-size:11px;color:var(--gold);flex:1;min-width:110px;">≈ Rattacher à « <b>${_escNote(suggest)}</b> » ?</span>`
    +`<button onclick="${acceptCall}" style="background:var(--green);border:none;color:#fff;border-radius:6px;padding:3px 12px;font-size:12px;font-weight:700;cursor:pointer;">✓ Oui</button>`
    +`<button onclick="${rejectCall}" style="background:var(--bg3);border:1px solid var(--sep);color:var(--t2);border-radius:6px;padding:3px 12px;font-size:12px;font-weight:700;cursor:pointer;">✕ Non</button>`
    +`</div>`;
}
function _renderImpConfirm(){
  const d=_impExtracted;if(!d)return;
  const nameEl=document.getElementById('imp-prog-name');
  if(nameEl)nameEl.textContent=d.name||'Programme importé';
  const el=document.getElementById('imp-preview');if(!el)return;
  el.innerHTML=(d.days||[]).map((day,di)=>`
    <div style="background:var(--bg3);border-radius:10px;padding:10px 12px;">
      <input value="${_escNote(day.label||'Jour '+(di+1)).replace(/"/g,'&quot;')}" onchange="_impSetDayLabel(${di},this.value)" title="Renomme la séance si besoin" style="width:100%;font-weight:700;font-size:13px;color:var(--red);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;background:transparent;border:none;border-bottom:1px dashed var(--sep);padding:2px 0;font-family:inherit;">
      <div id="imp-day-${di}">
        ${(day.exercises||[]).map((ex,ei)=>`
          <div id="imp-ex-${di}-${ei}" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg2);border-radius:8px;margin-bottom:5px;">
            ${_impThumb(ex._vmSuggest||ex.name)}
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;">${_escNote(ex.name)}</div>
              <div style="font-size:12px;color:var(--t2);">${ex.sets}×${ex.reps} reps${ex.kg?' · '+ex.kg+' kg':''}</div>
              ${ex._vmFrom?`<div style="font-size:11px;color:var(--green);margin-top:3px;">↔ reconnu depuis « ${_escNote(ex._vmFrom)} » · <span onclick="impUndoMatch(${di},${ei})" style="color:var(--t3);cursor:pointer;text-decoration:underline;">annuler</span></div>`:''}
              ${ex._vmSuggest?_vmConfirmRow(ex._vmSuggest,'impAcceptMatch('+di+','+ei+')','impRejectMatch('+di+','+ei+')',true):''}
              ${ex.note?`<div style="font-size:11px;color:var(--gold);margin-top:2px;font-style:italic;">📋 ${_escNote(ex.note)}</div>`:''}
            </div>
            <button onclick="removeImpEx(${di},${ei})" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:4px;flex-shrink:0;line-height:1;">✕</button>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function removeImpEx(di,ei){
  if(!_impExtracted||!_impExtracted.days[di])return;
  _impExtracted.days[di].exercises.splice(ei,1);
  if(!_impExtracted.days[di].exercises.length)_impExtracted.days.splice(di,1);
  if(!_impExtracted.days.length){toast('Plus aucun exercice','info');impGoStep(2);return;}
  _renderImpConfirm();
}

function _setImpMode(mode){
  _impMode=mode;
  const btnN=document.getElementById('imp-mode-new');
  const btnR=document.getElementById('imp-mode-replace');
  const sel=document.getElementById('imp-replace-sel');
  if(mode==='replace'){
    const progs=S.programmes||[];
    if(!progs.length){toast('Aucun programme existant à remplacer','info');_setImpMode('new');return;}
    sel.innerHTML=progs.map((p,i)=>`<option value="${i}">${_escNote(p.name)}</option>`).join('');
    sel.style.display='block';
    if(btnN)btnN.className='btn btn-bg2';
    if(btnR)btnR.className='btn btn-red';
  } else {
    sel.style.display='none';
    if(btnN)btnN.className='btn btn-red';
    if(btnR)btnR.className='btn btn-bg2';
  }
}

function finalImportProg(){
  if(!_impExtracted||!(_impExtracted.days||[]).length){toast('Aucun programme à importer','error');return;}
  if(!S.programmes)S.programmes=[];
  const name=(_impExtracted.name||'Programme '+new Date().toLocaleDateString('fr-FR')).trim();
  const allEx=[...EXLIB,...(S.customExercises||[])].map(e=>e.n.toLowerCase());
  const toCreate=[];
  _impExtracted.days.forEach(day=>(day.exercises||[]).forEach(ex=>{
    const low=ex.name.toLowerCase();
    if(!allEx.includes(low)&&!toCreate.find(n=>n.toLowerCase()===low))toCreate.push(ex.name);
  }));
  if(toCreate.length){
    if(!S.customExercises)S.customExercises=[];
    toCreate.forEach(n=>{S.customExercises.push({n,g:'Autres',custom:true});_reportCustomEx(n,'Autres',null);});
    toast(toCreate.length+' exercice'+(toCreate.length>1?'s':'')+" créé"+(toCreate.length>1?'s':'')+" automatiquement",'info');
  }
  // Construire le programme avec groupes supersets et dropsets
  const _buildProgDay=(day,di)=>{
    const groupMap={};const gSeed=Date.now()+di;
    return{
      label:day.label||'Jour '+(di+1),
      exs:(day.exercises||[]).map(ex=>{
        // Groupe superset/tri-set
        let group;
        if(ex.supersetGroup){
          if(!groupMap[ex.supersetGroup])groupMap[ex.supersetGroup]='ss'+gSeed+'_'+ex.supersetGroup;
          group=groupMap[ex.supersetGroup];
        }
        // Type de série (dropset D, méthode M, etc.)
        const baseType=ex.setType||'N';
        // Séries avec reps+kg par palier (dropsets) ou repsPerSet
        let sets;
        // Repos par série : backend peut fournir restPerSet[] (secondes) ou rest unique — sinon 0 (défaut par type)
        const _restAt=si=>(ex.restPerSet&&ex.restPerSet[si]!=null?_secRepos(ex.restPerSet[si]):_secRepos(ex.rest));
        if(ex.repsPerSet&&ex.repsPerSet.length>0){
          sets=ex.repsPerSet.map((r,si)=>({
            kg:(ex.kgPerSet&&ex.kgPerSet[si]!=null?ex.kgPerSet[si]:(ex.kg||0)),
            reps:parseInt(r)||10,
            type:baseType, /* échec auto à l'import désactivé (ft-v292) — ex.specialSets plus converti en 'E' */
            rest:_restAt(si)
          }));
        }else{
          sets=Array.from({length:Math.max(1,ex.sets||3)},(_,si)=>({
            kg:(ex.kgPerSet&&ex.kgPerSet[si]!=null?ex.kgPerSet[si]:(ex.kg||0)),
            reps:ex.reps||10,
            type:baseType, /* échec auto à l'import désactivé (ft-v292) — ex.specialSets plus converti en 'E' */
            rest:_restAt(si)
          }));
        }
        const obj={name:ex.name,note:ex.note||'',sets};
        if(group){obj.group=group;obj.groupType='super';} // FIX Emma : sans groupType='super' le superset importé n'était pas reconnu
        return obj;
      })
    };
  };
  const prog={id:'p'+Date.now(),name,
    weeks:_impExtracted.weeks||0,
    startDate:_impExtracted.startDate||'',
    days:_impExtracted.days.map((day,di)=>_buildProgDay(day,di))
  };
  if(_impMode==='replace'){
    const idx=parseInt((document.getElementById('imp-replace-sel')||{}).value);
    if(!isNaN(idx)&&S.programmes[idx]){
      const oldName=S.programmes[idx].name;
      prog.name=prog.name||oldName;
      S.programmes[idx]=prog;
      persist();closeImportProg();
      toast('"'+oldName+'" mis à jour ✅','success');
      openProgModal();return;
    }
  }
  S.programmes.push(prog);
  persist();
  closeImportProg();
  toast('"'+name+'" importé ! 💪','success');
  openProgModal();
}

// ─── IMPORT HISTORIQUE (flow isolé — ne touche pas au flow programme) ─────────

function openImportHist(){
  _histPhotos=[];_histExtracted=null;_histConflicts=[];
  histGoStep(1);
  document.getElementById('ov-import-hist').classList.add('open');
}
function closeImportHist(){document.getElementById('ov-import-hist').classList.remove('open');}

function histGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('hist-s'+i);
    if(s)s.style.display='none';
    const dot=document.getElementById('hist-dot-'+i);
    if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('hist-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['hist-cam-inp','hist-gal-inp','hist-more-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function addHistPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');
      if(!ctx){URL.revokeObjectURL(url);res(null);return;}
      ctx.drawImage(img,0,0,w,h);
      URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _histPhotos.push(...results.filter(Boolean));
    _renderHistThumbs();
    histGoStep(2);
  });
}

async function addHistFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15;
  const results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=f.name.toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){
    _histPhotos.push(...results);
    _renderHistThumbs();
    histGoStep(2);
  }
}

function _renderHistThumbs(){
  const el=document.getElementById('hist-thumbs');if(!el)return;
  el.innerHTML=_histPhotos.map((p,i)=>{
    const thumb=(p.isPdf||p.isText)
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">📄</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escNote(p.name||'Page')}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeHistPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}

function removeHistPhoto(i){
  _histPhotos.splice(i,1);
  if(!_histPhotos.length){histGoStep(1);return;}
  _renderHistThumbs();
}

// Analyse par LOTS de 3 pages max : la réponse IA a une taille limitée (8192 tokens
// côté backend @58) — un gros journal envoyé d'un coup rend un JSON tronqué/invalide.
// Chaque lot est analysé séparément, puis les séances de tous les lots sont fusionnées.
const _HIST_BATCH=3;
async function _histAnalyzeBatch(imgs){
  const r=await fetch(_aiUrl('importHistory'),{method:'POST',redirect:'follow',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action:'importHistory',images:imgs})});
  const raw=await r.text();
  console.log('[ImportHist] Réponse brute lot :', raw.slice(0,500));
  const d=JSON.parse(raw);
  if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
  return (d.data.sessions||[]);
}
// Limite premium : import de journal gratuit = 1 seul au total (illimité en premium).
// ⚠️ Ne concerne QUE l'import de journal — l'import de PROGRAMME n'est pas limité.
const HIST_FREE_LIMIT=1;
function showHistWall(){const el=document.getElementById('ov-hist-wall');if(el)el.classList.add('open');}
function closeHistWall(){const el=document.getElementById('ov-hist-wall');if(el)el.classList.remove('open');}
async function analyzeHistPhotos(){
  if(!_histPhotos.length){toast('Ajoute au moins une photo ou un PDF','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  // Mur premium au 2e import d'un utilisateur gratuit → ne PAS lancer l'analyse
  if(!S.premium&&(S.histImports||0)>=HIST_FREE_LIMIT){
    if(window._premiumPending){toast('Vérification du statut premium…','info');return;}
    closeImportHist();
    showHistWall();
    return;
  }
  histGoStep(3);
  const statusEl=document.getElementById('hist-s3-status');
  const batches=[];
  for(let i=0;i<_histPhotos.length;i+=_HIST_BATCH)batches.push(_histPhotos.slice(i,i+_HIST_BATCH));
  const allSessions=[];let failed=0,lastErr='';
  for(let b=0;b<batches.length;b++){
    if(statusEl)statusEl.textContent=batches.length>1
      ?`Analyse du lot ${b+1} / ${batches.length} (${batches[b].length} page${batches[b].length>1?'s':''})…`
      :'Milo extrait les séances et leurs dates depuis tes pages';
    try{
      const sess=await _histAnalyzeBatch(batches[b]);
      // Coupure de séance entre 2 lots (une séance à cheval sur 2 pages) :
      // même date en fin de lot précédent et début de lot suivant → fusion des exercices
      if(allSessions.length&&sess.length){
        const prev=allSessions[allSessions.length-1],next=sess[0];
        if(prev.date&&prev.date===next.date&&!next.estimatedDate){
          prev.exercises=(prev.exercises||[]).concat(next.exercises||[]);
          sess.shift();
        }
      }
      allSessions.push(...sess);
    }catch(e){
      failed++;lastErr=e.message||String(e);
      console.error('[ImportHist] Lot',b+1,'en échec :',lastErr);
    }
  }
  if(statusEl)statusEl.textContent='Milo extrait les séances et leurs dates depuis tes pages';
  if(!allSessions.length){
    histGoStep(2);
    const dense=/JSON invalide|tronqu/i.test(lastErr);
    toast(dense?'Pages trop denses pour l\'analyse — réessaie avec moins de pages à la fois':'Erreur analyse : '+lastErr,'error');
    return;
  }
  if(failed)toast(failed+' lot'+(failed>1?'s':'')+' non lu'+(failed>1?'s':'')+' — vérifie l\'aperçu, tu pourras réimporter les pages manquantes','info');
  _histExtracted={sessions:allSessions};
  _vmMatchHist();   // VM : rattache les exos aux références EXLIB (mêmes stats, pas de doublon) AVANT l'aperçu
  _renderHistPreview();
  histGoStep(4);
}

// VM → import HISTORIQUE : même logique que _vmMatchExtracted (programme), mais sur
// _histExtracted.sessions[].exercises[]. Auto (≥90) = nom remplacé par la référence EXLIB
// (original gardé pour « annuler ») ; confirm (zone grise) = proposé ; nouveau = laissé tel quel.
// ⚠️ Câbler l'historique évite de fragmenter les stats/PRs (finalImportHist ne crée un exo perso
// que pour un nom absent d'EXLIB → un rattachement auto vers un nom EXLIB supprime le doublon).
function _vmMatchHist(){
  if(typeof _matchExercise!=='function'||!_histExtracted)return;
  (_histExtracted.sessions||[]).forEach(sess=>(sess.exercises||[]).forEach(ex=>{
    if(!ex||!ex.name)return;
    delete ex._vmFrom; delete ex._vmSuggest; delete ex._vmConf;
    let r; try{ r=_matchExercise(ex.name); }catch(e){ return; }
    if(!r||!r.match||r.match===ex.name)return;
    if(r.tier==='auto'){ ex._vmFrom=ex.name; ex._vmConf=r.confidence; ex.name=r.match; }
    else if(r.tier==='confirm'){ ex._vmSuggest=r.match; ex._vmConf=r.confidence; }
  }));
}
function histAcceptMatch(si,ei){
  const ex=_histExtracted&&_histExtracted.sessions[si]&&(_histExtracted.sessions[si].exercises||[])[ei];
  if(!ex||!ex._vmSuggest)return;
  ex._vmFrom=ex.name; ex.name=ex._vmSuggest; delete ex._vmSuggest;
  _renderHistPreview();
}
function histUndoMatch(si,ei){
  const ex=_histExtracted&&_histExtracted.sessions[si]&&(_histExtracted.sessions[si].exercises||[])[ei];
  if(!ex||!ex._vmFrom)return;
  ex.name=ex._vmFrom; delete ex._vmFrom; delete ex._vmConf;
  _renderHistPreview();
}
function histRejectMatch(si,ei){
  const ex=_histExtracted&&_histExtracted.sessions[si]&&(_histExtracted.sessions[si].exercises||[])[ei];
  if(!ex)return;
  delete ex._vmSuggest; delete ex._vmConf;
  _renderHistPreview();
}

function _renderHistPreview(){
  const sessions=(_histExtracted&&_histExtracted.sessions)||[];
  if(!sessions.length)return;

  // Détection conflits
  _histConflicts=[];
  sessions.forEach((sess,i)=>{
    const existing=(S.sessions||[]).find(s=>s.date===sess.date);
    if(existing)_histConflicts.push({idx:i,existing,resolution:'add'});
  });

  // Résumé
  const dates=sessions.map(s=>s.date).filter(Boolean).sort();
  const from=dates.length?_histFmtDate(dates[0]):'?';
  const to=dates.length?_histFmtDate(dates[dates.length-1]):'?';
  const summEl=document.getElementById('hist-summary');
  if(summEl)summEl.textContent=sessions.length+' séance'+(sessions.length>1?'s':'')+' trouvée'+(sessions.length>1?'s':'')+' · '+from+' → '+to;

  const el=document.getElementById('hist-preview');if(!el)return;
  el.innerHTML=sessions.map((sess,i)=>{
    const conflict=_histConflicts.find(c=>c.idx===i);
    const dateLabel=sess.date?_histFmtDate(sess.date):'Date inconnue';
    const estBadge=sess.estimatedDate?'<span style="color:var(--gold);font-size:11px;margin-left:6px;">📅 estimée</span>':'';
    const exList=(sess.exercises||[]).slice(0,3).map(e=>e.name).join(', ')
      +((sess.exercises||[]).length>3?' +'+((sess.exercises||[]).length-3):'');
    // Rattachements VM (seulement les exos concernés → aperçu compact)
    const vmRows=(sess.exercises||[]).map((ex,ei)=>{
      if(ex._vmFrom)return`<div style="font-size:11px;color:var(--green);margin-top:3px;">↔ « ${_escNote(ex._vmFrom)} » → <b>${_escNote(ex.name)}</b> · <span onclick="histUndoMatch(${i},${ei})" style="color:var(--t3);cursor:pointer;text-decoration:underline;">annuler</span></div>`;
      if(ex._vmSuggest)return _vmConfirmRow(ex._vmSuggest,'histAcceptMatch('+i+','+ei+')','histRejectMatch('+i+','+ei+')');
      return'';
    }).filter(Boolean).join('');
    const conflictHtml=conflict?`
      <div style="background:rgba(255,45,85,.08);border:1px solid rgba(255,45,85,.25);border-radius:8px;padding:8px 10px;margin-top:6px;">
        <div style="color:var(--red);font-weight:600;font-size:12px;margin-bottom:6px;">⚠️ Séance déjà existante ce jour</div>
        <div style="display:flex;gap:6px;">
          <button id="hist-cf-${i}-replace" class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'replace')">🔄 Remplacer</button>
          <button id="hist-cf-${i}-keep"    class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'keep')">✋ Garder</button>
          <button id="hist-cf-${i}-add"     class="btn btn-bg2" style="flex:1;padding:6px 4px;font-size:11px;" onclick="_setHistConflict(${i},'add')">➕ Les 2</button>
        </div>
        <div id="hist-conflict-status-${i}" style="font-size:11px;color:var(--gold);margin-top:4px;text-align:center;">➕ Ajouter les 2 (par défaut)</div>
      </div>`:'';
    return`<div style="background:var(--bg3);border-radius:10px;padding:10px 12px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;margin-bottom:3px;">
        <span style="font-weight:700;font-size:14px;">${dateLabel}</span>${estBadge}
      </div>
      <div style="font-size:12px;color:var(--t2);">${sess.label||''}</div>
      <div style="font-size:12px;color:var(--t3);margin-top:2px;">${exList}</div>
      ${vmRows}
      ${conflictHtml}
    </div>`;
  }).join('');
}

function _histFmtDate(iso){
  if(!iso)return'?';
  const p=iso.split('-');
  return(p[2]||'?')+'/'+(p[1]||'?')+'/'+(p[0]||'');
}

function _setHistConflict(sessIdx,choice){
  const c=_histConflicts.find(x=>x.idx===sessIdx);
  if(c)c.resolution=choice;
  const lbl=document.getElementById('hist-conflict-status-'+sessIdx);
  if(lbl){
    const labels={replace:'🔄 Remplace la séance existante',keep:'✋ Séance existante conservée',add:'➕ Les 2 séances coexisteront'};
    lbl.textContent=labels[choice]||'';
  }
  ['replace','keep','add'].forEach(ch=>{
    const btn=document.getElementById('hist-cf-'+sessIdx+'-'+ch);
    if(!btn)return;
    btn.style.background=ch===choice?'var(--red)':'var(--bg3)';
    btn.style.color=ch===choice?'#fff':'var(--t1)';
  });
}

function finalImportHist(){
  const sessions=(_histExtracted&&_histExtracted.sessions)||[];
  if(!sessions.length){toast('Aucune séance à importer','error');return;}

  // Créer les exercices personnalisés manquants
  const allExNames=new Set([...EXLIB,...(S.customExercises||[])].map(e=>e.n.toLowerCase()));
  const toCreate=[];
  sessions.forEach(sess=>(sess.exercises||[]).forEach(ex=>{
    const low=(ex.name||'').toLowerCase();
    if(low&&!allExNames.has(low)&&!toCreate.find(n=>n.toLowerCase()===low))toCreate.push(ex.name);
  }));
  if(toCreate.length){
    if(!S.customExercises)S.customExercises=[];
    toCreate.forEach(n=>{S.customExercises.push({n,g:'Autres',custom:true});_reportCustomEx(n,'Autres',null);});
  }

  const now=Date.now();
  let addedCount=0;

  // Trier par date ASC pour insertion + calcul PRs chronologique
  const sessionsAsc=[...sessions].sort((a,b)=>(a.date||'').localeCompare(b.date||''));

  sessionsAsc.forEach((sess,si)=>{
    const origIdx=sessions.indexOf(sess);
    const conflict=_histConflicts.find(c=>c.idx===origIdx);

    if(conflict&&conflict.resolution==='keep')return;
    if(conflict&&conflict.resolution==='replace'){
      const idx=(S.sessions||[]).findIndex(s=>s.date===sess.date);
      if(idx>=0)S.sessions.splice(idx,1);
    }

    // Construire la séance au format attendu par l'app
    let vol=0;
    const exs=(sess.exercises||[]).map(ex=>{
      const sets=(ex.sets||[]).map(s=>{
        const kg=s.kg||0,reps=s.reps||0;
        const type=s.type==='D'?'D':'';
        // Volume : tout sauf Échauffement (W). Drop set D compte.
        if(type!=='W'&&type!=='É')vol+=kg*reps;
        return{kg,reps,done:true,type,rm1:bz(kg,reps),note:s.note||''};
      });
      return{name:ex.name,note:ex.note||'',sets};
    });

    const dateTs=sess.date?new Date(sess.date).getTime():now;
    const sessionObj={
      id:now+si,
      date:sess.date||today(),
      ts:dateTs+si,
      exs,
      volume:Math.round(vol),
      synced:false,
      startHour:null,
      duration:0,
      importedHistory:true
    };
    if(!S.sessions)S.sessions=[];
    S.sessions.push(sessionObj);
    addedCount++;
  });

  if(!addedCount){
    toast('Aucune séance importée (toutes conservées)','info');
    closeImportHist();
    return;
  }

  // Trier S.sessions par date DESC (plus récente en tête, comme finishWorkout)
  S.sessions.sort((a,b)=>{
    const ta=a.ts||new Date(a.date||'').getTime()||0;
    const tb=b.ts||new Date(b.date||'').getTime()||0;
    return tb-ta;
  });

  // Recalculer les PRs depuis toutes les séances importées (chrono ASC, jamais écraser + élevé)
  if(!S.prs)S.prs={};
  const importedAsc=S.sessions.filter(s=>s.importedHistory).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  importedAsc.forEach(sess=>{
    (sess.exs||[]).forEach(ex=>{
      (ex.sets||[]).forEach(s=>{
        if(!s.done||!s.kg||!s.reps)return;
        const rm=bz(s.kg,s.reps);
        const cur=S.prs[ex.name];
        if(!cur||rm>cur.rm1)S.prs[ex.name]={kg:s.kg,reps:s.reps,rm1:rm,date:sess.date};
      });
    });
  });

  // Compte l'import journal réussi (limite premium : 1 gratuit au total)
  S.histImports=(S.histImports||0)+1;

  try{if(typeof computeRegistreFacts==='function')computeRegistreFacts();}catch(e){}
  persist();
  _cloudSyncSessions();
  checkBadges(true);
  closeImportHist();
  toast(addedCount+' séance'+(addedCount>1?'s':'')+' importée'+(addedCount>1?'s':'')+' dans l\'historique ✅','success');
}

// ─── SÉLECTION DU JOUR ────────────────────────────────────────
let _daySelProgIdx=-1;

function openDaySel(progIdx){
  const prog=(S.programmes||[])[progIdx];if(!prog||!prog.days)return;
  _daySelProgIdx=progIdx;
  const nameEl=document.getElementById('day-sel-prog-name');
  if(nameEl)nameEl.textContent=prog.name;
  const btns=document.getElementById('day-sel-btns');
  if(btns)btns.innerHTML=(prog.days||[]).map((d,i)=>`
    <button class="btn btn-bg2" style="padding:14px 16px;text-align:left;" onclick="loadProgDay(${progIdx},${i})">
      <div style="font-weight:700;font-size:14px;">${_escNote(d.label)}</div>
      <div style="font-size:12px;color:var(--t2);margin-top:3px;">${_escNote((d.exs||[]).slice(0,3).map(e=>e.name).join(', '))}${(d.exs||[]).length>3?' +'+((d.exs||[]).length-3):''}</div>
    </button>`).join('');
  document.getElementById('ov-day-sel').classList.add('open');
}

function closeDaySel(){document.getElementById('ov-day-sel').classList.remove('open');}

// ─── SÉANCE DU JOUR proposée par Milo → injection directe dans S.wkt (demande Michel) ───
// _pendingMiloSessions est rempli côté coach.js ; ces 2 fonctions vivent ici pour accéder
// aux globals de la séance (getPrev, today, _expandedEx, renderExBlocks…).
function _normalizeMiloSession(sess){
  const T={N:1,'É':1,X:1,D:1,W:1}; // types de série valides
  const norm=ex=>({
    name:String(ex.name||'Exercice'),
    // 💬 ft-v628 : la CONSIGNE de Milo (cue technique : « omoplates serrées », « amplitude contrôlée »…)
    // devient la note de l'exercice — avant, elle était jetée (`note:''`) alors que Milo la donne dans le chat.
    note:String(ex.note||'').slice(0,300),
    sets:(Array.isArray(ex.sets)?ex.sets:[]).map(s=>({
      // 0 = « Milo n'a rien précisé » (le repli sur l'historique se décide dans _startSessionFromMilo).
      // ⚠️ Ne PAS mettre 10 par défaut ici : on ne pourrait plus distinguer « Milo a dit 10 » de « Milo n'a rien dit ».
      reps:s.maxi?0:(parseInt(s.reps)||0),
      kg:parseFloat(s.kg)||0,
      maxi:!!s.maxi,
      type:(s&&T[s.type])?s.type:'N',
      rest:_secRepos(s.rest)
    }))
  });
  return {
    label:String(sess.label||'Séance de Milo'),
    exs:(Array.isArray(sess.exs)?sess.exs:[]).filter(e=>e&&e.name).map(norm).filter(e=>e.sets.length)
  };
}
function _startSessionFromMilo(idx,btn){
  const data=(typeof _pendingMiloSessions!=='undefined')?_pendingMiloSessions[idx]:null;
  if(!data){toast('Séance introuvable','error');return;}
  // 🐛 FIX ft-v625 (retour Michel) : CE QUE MILO DIT PRIME sur l'historique.
  // Avant, on copiait le pré-remplissage de loadProgDay (`pp ? pp.kg : s.kg`) → dès qu'une séance
  // précédente existait, elle ÉCRASAIT la proposition de Milo (il annonçait 4×6 à 60/70/80/85 kg
  // et l'écran Séance affichait l'ancienne séance). Or Milo choisit ses charges/reps EXPRÈS
  // (reprise après coupure, épaule à protéger, « pas de tentative 105 aujourd'hui »…).
  // Règle : si Milo a précisé une valeur → on la respecte ; sinon SEULEMENT, on reprend la dernière fois.
  // (Différent d'un PROGRAMME, qui dit « 4×8 » sans charge → là, le pré-remplissage garde tout son sens.)
  const buildEx=e=>{
    const prev=(typeof getPrev==='function')?(getPrev(e.name)||[]):[];
    const _pa=_prevAligne(prev, e.sets||[]);   // par RÔLE (voir _prevAligne)
    /* 🏷️ ON GARDE L'AUTEUR DE LA SÉANCE (18/08/2026) — `_milo:true` dit « ces charges viennent
       d'une prescription de Milo, pas d'un choix de la personne ». Sans ce marqueur, le débrief
       lui reproche une montée en charge trop courte qu'il a lui-même écrite (arrivé le 18/08,
       après le même incident le 15/08 côté app). Il suit la séance jusque dans l'historique,
       puisque `sess.exs` est copié depuis `S.wkt.exs`. Lu par `_verdictMontee` (coach.js). */
    return {name:e.name,note:e.note||'',_milo:true,sets:(e.sets||[]).map((s,i)=>{
      const pp=_pa[i];
      const kg=(s.kg>0)?s.kg:(pp?pp.kg:0);                                   // Milo d'abord, sinon la dernière fois
      const reps=s.maxi?0:((s.reps>0)?s.reps:(pp?pp.reps:10));               // idem (série « maxi » = vide, à saisir)
      return {kg,reps,maxi:!!s.maxi,type:s.type||'N',done:false,rm1:0,rest:_secRepos(s.rest)};
    })};
  };
  const newExs=(data.exs||[]).map(buildEx);
  if(!newExs.length){toast('Aucun exercice à ajouter','error');return;}
  const active=S.wkt&&Array.isArray(S.wkt.exs)&&S.wkt.exs.length;
  // ─── SÉANCE DÉJÀ EN COURS → ON DEMANDE (ft-v750, retour de Michel EN PLEINE SÉANCE) ───
  // Avant : on AJOUTAIT toujours, sans rien demander. L'intention était bonne (règle d'or #3,
  // ne jamais écraser une séance en cours) mais elle rendait un cas impossible : quand on
  // demande à Milo de CHANGER un exercice, il renvoie la séance corrigée… qui venait s'empiler
  // sur l'ancienne. L'échange qu'il avait parfaitement compris n'atteignait jamais la donnée (R4).
  // Et le bouton disait « Commencer cette séance » alors qu'il ajoutait — une promesse fausse.
  // Désormais : c'est la personne qui tranche, avec sous les yeux ce qu'elle risque de perdre (R29).
  if(active){ _miloPendingIdx=idx; _miloPendingBtn=btn||null; _askMiloSeanceMode(newExs.length); return; }
  _appliqueMiloSession(newExs, data, 'start', btn);
}

let _miloPendingIdx=-1, _miloPendingBtn=null;

/** Ouvre la question « ajouter ou remplacer ? » en montrant l'état RÉEL de la séance en cours.
 *  On n'interdit rien : on AFFICHE ce qui est en jeu et la personne décide (R29 — informer sans
 *  décider). Une séance dont aucune série n'est validée ne se remplace pas au même prix qu'une
 *  séance où l'on a déjà travaillé 40 minutes. */
function _askMiloSeanceMode(nNew){
  const exs=(S.wkt&&S.wkt.exs)||[];
  let faites=0; exs.forEach(e=>(e.sets||[]).forEach(st=>{if(st.done)faites++;}));
  const et=document.getElementById('milo-seance-etat');
  const av=document.getElementById('milo-seance-avert');
  if(et)et.innerHTML='Ta séance en cours a <b>'+exs.length+' exercice'+(exs.length>1?'s':'')+'</b>'
    +(faites?' et <b>'+faites+' série'+(faites>1?'s':'')+' déjà validée'+(faites>1?'s':'')+'</b>':'')
    +'.<br>Milo t\'en propose <b>'+nNew+'</b>.';
  // ⚠️ ON AVERTIT TOUJOURS, MÊME SANS SÉRIE VALIDÉE. L'ancien texte ne s'affichait que si
  // `faites > 0` — or « Remplacer » RETIRE les exercices dans tous les cas. Quelqu'un qui a
  // composé sa séance sans encore rien valider la perdait donc en silence.
  // ⚠️ Et on ne compte QUE les séries validées : les autres sont PRÉ-REMPLIES depuis la séance
  // précédente (kg et reps déjà renseignés, `done:false`). Les compter ferait annoncer « tu vas
  // perdre 12 séries » à quelqu'un qui n'a rien fait — et une alerte qui crie au loup finit par
  // ne plus être lue du tout.
  if(av){
    const s=faites>1?'s':'', e=exs.length>1?'s':'';
    av.textContent='⚠️ « Remplacer » retire tes '+exs.length+' exercice'+e+' en cours'
      +(faites?(' et efface tes '+faites+' série'+s+' déjà validée'+s):'')+'.';
  }
  // Ce que Michel cherchait vraiment le 08/08 : changer UN exercice, pas toute la séance. L'app
  // sait déjà le faire sans rien perdre (⋯ → « Remplacer l'exercice », qui garde les séries) —
  // mais rien ne le disait ICI, au moment précis où la question se pose.
  const as=document.getElementById('milo-seance-astuce');
  if(as)as.textContent='Pour changer un seul exercice sans rien perdre : ⋯ sur l\'exercice → « Remplacer l\'exercice ».';
  const ov=document.getElementById('ov-milo-seance'); if(ov)ov.classList.add('open');
}
function closeMiloSeance(){
  const ov=document.getElementById('ov-milo-seance'); if(ov)ov.classList.remove('open');
  _miloPendingIdx=-1; _miloPendingBtn=null;
}
// ─── SUPERSET : les mouvements qu'on ne groupe JAMAIS (12/08/2026) ──────────────────
// La méta-analyse (Sports Medicine 2025, 19 études) est nette : le superset ne fait pas
// gagner de muscle à volume égal — il fait gagner du TEMPS, au prix d'une performance
// dégradée sur le second exercice. Sur un squat ou un soulevé lourd, cette dégradation
// est exactement ce qu'on ne veut pas : c'est là que la charge et la technique comptent.
// Retour de Michel (powerlifting) : « je peux en faire ou pas ? » → sur les accessoires
// oui, sur les trois mouvements jamais.
// ⚠️ POURQUOI LE CODE ET PAS LE PROMPT : le prompt est probabiliste, ce refus ne doit pas
// dépendre d'un jour de fatigue du modèle (R7 — le prompt est le dernier levier). On
// RÉUTILISE `BIG4` et `_movPattern`, on ne recrée pas une 3ᵉ liste d'exercices (R2/R13).
function _supersetInterdit(name){
  if(!name) return false;
  if(typeof BIG4!=='undefined' && BIG4.indexOf(name)>=0) return true;
  try{ const p=(typeof _movPattern==='function')?_movPattern(name):null;
       return p==='squat'||p==='hip-hinge'; }catch(e){ return false; }
}

/* 🛡️ VALIDATION UNIQUE, DÉTERMINISTE, AVANT L'ACTIVATION D'UNE SÉANCE DE MILO (24/08/2026)
   PRIORITÉ 1 tranchée par Michel après le contre-audit du 24/08 : « une validation
   déterministe unique avant l'activation de la séance : blessures, exclusions, doublons ».

   ⛔⛔ POSÉE AU MÊME ENDROIT QUE LE CONTRÔLE D'INTENSITÉ (ft-v980), et pour la MÊME raison
   écrite juste en dessous, dans `_appliqueMiloSession` : c'est le SEUL point que les deux
   portes (`_startSessionFromMilo` — aucune séance en cours, le cas normal — et
   `_applyMiloSession` — une séance tourne déjà) traversent. La poser ailleurs la ferait
   manquer sur l'une des deux (R2 : un seul propriétaire par comportement — c'est exactement
   l'erreur que le contrôle d'intensité avait faite une première fois, le 23/08).

   ⚠️ ON SIGNALE, ON NE BLOQUE PAS (R24 — informer sans bloquer ; Constitution P13 — adapter,
   jamais interdire). La séance démarre normalement ; chaque avertissement reste attaché à
   l'exercice concerné, comme le fait déjà `intensiteWarn` — un toast seul aurait disparu
   avant la 1ʳᵉ série.

   ⛔ ET ELLE NE RÉINVENTE RIEN (R2/R13) : les trois catégories réutilisent chacune un
   mécanisme qui existe déjà ailleurs dans le dépôt pour un autre usage —
   · DOUBLONS   : comparaison directe des noms, rien d'externe ;
   · EXCLUSIONS : `S.exSwaps` + `_EX_SWAP_RAISONS` (log.js) — la case `durable` existe déjà,
     c'est la MÊME liste que `coach.js` filtre localement pour le contexte de Milo (`DUR`) ;
   · BLESSURES  : `_gardienZones()` + `_GARDIEN_CONSTRAINTS` (coach.js) — la mécanique qui
     construit déjà « dans sa séance du jour : … sollicite ton épaule » envoyée à Milo.
   ⚠️ Ces fonctions vivent dans `coach.js`, chargé APRÈS `log.js` dans `index.html` — un appel
   au chargement du script échouerait. Ici l'appel se fait au CLIC, bien après que tous les
   scripts sont chargés : `typeof X==='function'` protège seulement contre leur absence
   éventuelle, pas contre un ordre de chargement (même garde que partout ailleurs, R13). */
function _validationSeance(newExs, mode){
  const out={doublons:[], exclusions:[], blessures:[]};
  try{
    // ── DOUBLONS : le même exercice cité deux fois dans ce que Milo propose ──
    // (mode 'add' : on compare AUSSI à ce qui tourne déjà, sinon on rate le cas le plus probable)
    const vus={};
    (newExs||[]).forEach(o=>{ const k=(o&&o.name||'').trim().toLowerCase(); if(k) vus[k]=(vus[k]||0)+1; });
    if(mode==='add' && S.wkt && Array.isArray(S.wkt.exs)){
      S.wkt.exs.forEach(e=>{ const k=(e&&e.name||'').trim().toLowerCase(); if(k) vus[k]=(vus[k]||0)+1; });
    }
    (newExs||[]).forEach(o=>{
      const k=(o&&o.name||'').trim().toLowerCase();
      if(k && vus[k]>1 && out.doublons.indexOf(o.name)<0) out.doublons.push(o.name);
    });

    // ── EXCLUSIONS DURABLES : un exercice déjà refusé pour une raison qui TIENT DANS LE TEMPS ──
    // ⚠️ Seules les raisons DURABLES comptent (« il me gêne », « trop long ») — pas « machine
    // prise » ni « envie de varier », sans quoi on avertirait pour un mardi où la salle était
    // pleine (même exclusion que le contexte de Milo, coach.js).
    const durables=(typeof _EX_SWAP_RAISONS!=='undefined')
      ? _EX_SWAP_RAISONS.filter(x=>x.durable).map(x=>x.r) : [];
    const sw=S.exSwaps||{};
    (newExs||[]).forEach(o=>{
      const info=sw[o&&o.name];
      if(info && durables.indexOf(info.r)>=0) out.exclusions.push({nom:o.name, vers:info.to||''});
    });

    // ── BLESSURES : un exercice qui sollicite une zone ACTIVE ou douloureuse AUJOURD'HUI ──
    // ⚠️ Seul l'actif/aujourd'hui compte ici — une fragilité DURABLE mais calme reste couverte
    // par le Gardien de Milo dans la conversation ; la resignaler à chaque séance serait du
    // bruit qui finit par ne plus être lu (R19).
    if(typeof _gardienZones==='function' && typeof _GARDIEN_CONSTRAINTS!=='undefined' && typeof _gzNaz==='function'){
      const zones=_gardienZones();
      (newExs||[]).forEach(o=>{
        const nz=_gzNaz(o&&o.name);
        const touchees=[];
        _GARDIEN_CONSTRAINTS.forEach(c=>{
          if(!c.rx.test(nz)) return;
          c.zones.forEach(z=>{
            const info=zones[z];
            if(info && (info.active||info.today) && touchees.indexOf(z)<0) touchees.push(z);
          });
        });
        if(touchees.length){
          const lbl=(typeof _GARDIEN_ZLABEL!=='undefined')?_GARDIEN_ZLABEL:{};
          out.blessures.push({nom:o.name, zones:touchees.map(z=>lbl[z]||z)});
        }
      });
    }
  }catch(e){ console.warn('[FT validation séance]', e); }
  return out;
}

function _applyMiloSession(mode){
  const idx=_miloPendingIdx, btn=_miloPendingBtn;
  const data=(typeof _pendingMiloSessions!=='undefined')?_pendingMiloSessions[idx]:null;
  closeMiloSeance();
  if(!data){toast('Séance introuvable','error');return;}
  const prev=(typeof getPrev==='function')?getPrev:null;
  // ── SUPERSETS DEMANDÉS PAR MILO ────────────────────────────────────────────────────
  // ⚠️ LE TROU QU'ON BOUCHE ICI (constaté le 12/08) : `loadProgDay` lit déjà
  // `supersetGroup` pour un programme importé, mais ce chemin-ci — la séance dictée dans
  // le chat — ne lisait RIEN. Le même superset survivait à une porte et s'évaporait à
  // l'autre. On emploie donc EXACTEMENT le même nom de champ que l'import, pour que les
  // deux entrées de l'app parlent la même langue (R2).
  // Les étiquettes de Milo ("A", "B"…) deviennent des identifiants uniques : sans ça,
  // deux séances chargées à la suite auraient des groupes qui se confondent.
  const gMap={}, gSeed=Date.now();
  const bloque=[];
  const newExs=(data.exs||[]).map(e=>{
    const pv=prev?(prev(e.name)||[]):[];
    /* ⛔ `_milo:true` MANQUAIT SUR CETTE PORTE (trouvé le 23/08 en branchant le contrôle
       d'intensité). `_startSessionFromMilo` le pose, `_applyMiloSession` ne le posait pas —
       donc une séance chargée en mode « remplacer » perdait son AUTEUR en route, et Milo
       reprochait ensuite à la personne des charges qu'il avait lui-même prescrites. C'est
       très exactement l'incident du 18/08, par une porte qu'on n'avait pas regardée.
       *Le même marqueur, deux portes, une seule équipée* — R8 encore. */
    const obj={name:e.name,note:e.note||'',_milo:true,sets:(e.sets||[]).map((s,i)=>{
      const pp=pv.length?(pv[i]||pv[pv.length-1]):null;
      return {kg:(s.kg>0)?s.kg:(pp?pp.kg:0),
              reps:s.maxi?0:((s.reps>0)?s.reps:(pp?pp.reps:10)),
              maxi:!!s.maxi,type:s.type||'N',done:false,rm1:0,rest:_secRepos(s.rest)};
    })};
    const lbl=e.supersetGroup;
    if(lbl!==undefined&&lbl!==null&&String(lbl).trim()!==''){
      if(_supersetInterdit(e.name)) bloque.push(e.name);   // refus dur, voir plus haut
      else{
        const k=String(lbl).trim();
        if(!gMap[k]) gMap[k]='ss'+gSeed+'_'+k;
        obj.group=gMap[k]; obj.groupType='super';
      }
    }
    return obj;
  });
  // ⚠️ UN GROUPE ORPHELIN N'EST PAS UN SUPERSET. Si le garde-fou (ou Milo) laisse un seul
  // exercice portant une étiquette, l'écran afficherait un « superset » d'un seul membre —
  // un bloc qui promet un enchaînement qui n'existe pas. On délie ce qui reste seul.
  const compte={};
  newExs.forEach(o=>{ if(o.group) compte[o.group]=(compte[o.group]||0)+1; });
  newExs.forEach(o=>{ if(o.group&&compte[o.group]<2){ delete o.group; delete o.groupType; } });
  // On le DIT, on ne le fait pas en douce (R24 : la personne doit comprendre ce qu'elle voit)
  if(bloque.length&&typeof toast==='function')
    toast('Superset retiré sur '+bloque.join(', ')+' — pas sur les mouvements lourds','info');
  _appliqueMiloSession(newExs, data, mode, btn);
}
/** L'écriture elle-même. `mode` : 'start' (aucune séance) · 'add' · 'replace'. */
/* 🏃 LE CARDIO DE MILO VA DANS LE BLOC CARDIO, PAS DANS LA LISTE DES EXERCICES (ft-v995).
   Michel, en salle le 24/08, capture à l'appui : « il me rajoute le vélo elliptique alors qu'on a
   un onglet exprès pour le cardio ». Sur sa séance : « Elliptique — 0/1 série », type É, note
   « 8 min léger » — posé comme un exercice de musculation, pendant que le bloc Cardio restait vide.
   ⭐⭐ SA RAISON, ET ELLE DÉCIDE DE TOUT : « si on fait une séance cardio toute seule, on veut
   qu'elle soit comptabilisée. Mais je ne veux pas que la course, le vélo elliptique ou peu importe
   arrive dans un exercice de musculation, ça n'a strictement rien à voir. » Le cardio a donc sa
   place dans l'app — dans SA fenêtre, celle de ft-v720, qui distingue AVANT et APRÈS.
   ⛔⛔ CE N'ÉTAIT PAS UN DÉFAUT DE JUGEMENT DE MILO : les deux bouts du chemin manquaient. Le
   prompt ne lui dit nulle part qu'un bloc cardio existe pour ce qu'il PROPOSE (il ne le lit que
   pour raconter le passé), et `_appliqueMiloSession` ne regardait jamais un champ cardio. Milo
   n'avait donc aucun moyen de faire autrement. Même forme que le pont blessure de ft-v982.
   ⭐ R13 — RIEN N'EST RÉINVENTÉ : `_exEquip()` range déjà elliptique, tapis, rameur, corde à
   sauter, air bike… dans un bac 'cardio' depuis ft-v712. On lui demande, on ne redevine pas.
   ⛔⛔ ET C'EST POSÉ ICI, dans `_appliqueMiloSession`, PARCE QUE C'EST LE SEUL POINT QUE LES DEUX
   PORTES TRAVERSENT — la correction que le témoin avait déjà imposée en ft-v980. Il y a deux
   chemins par lesquels une séance de Milo arrive : le bloc JSON (modèles capables) et le REPLI DE
   LECTURE DU TEXTE (modèles légers). *Corriger seulement le JSON n'aurait rien changé pour Eline* —
   c'est le biais R9 déjà vécu avec le bouton « Commencer cette séance », que Michel avait et sa
   fille jamais. Ici, on agit APRÈS les deux.
   ⚠️ AVANT **ET** APRÈS (précision de Michel le même soir) : « il peut y avoir une séance avec un
   cardio au tout début ET un cardio à la fin ». On tranche par POSITION — avant le 1ᵉʳ exercice de
   muscu → échauffement ; après le dernier → cardio de fin.
   ⛔ ET UN CARDIO AU MILIEU RESTE UN EXERCICE (R29) : on ne sait pas ce que la personne voulait, et
   deviner coûterait plus cher que ne rien faire. Idem sans durée lisible : jamais de durée inventée. */
const _CARDIO_TYPES=[[/elliptique|crosstrainer/,'elliptique'],[/tapis|course|courir|running|marche/,'tapis'],
  [/velo|bike|cycl|assault|air ?bike/,'velo'],[/rameur|rowerg|ergometre/,'rameur'],
  [/corde a sauter|saut a la corde|sauts a la corde/,'corde']];
function _cardioDepuisEx(o){
  // Ce qu'on sait lire : le TYPE (nom), la DURÉE et l'INTENSITÉ (note ou nom). Rien d'autre.
  const nom=(typeof _naz==='function')?_naz(o.name||''):String(o.name||'').toLowerCase();
  /* ⛔⛔ LA NOTE DOIT ÊTRE DÉSACCENTUÉE COMME LE NOM — mesuré, pas supposé. `_naz()` retire les
     accents du NOM, mais une note passée seulement en minuscules garde les siens : « 8 min léger »
     ne matchait donc PAS le motif `leger`, et l'intensité retombait sur « modéré » par défaut.
     ⚠️ Et ce n'est pas cosmétique : léger = 4,0 MET, modéré = 6,0 → **50 % d'écart sur les
     calories** de ce cardio. *Même famille que l'apostrophe courbe du banc d'essai : un caractère
     non normalisé rend un motif aveugle sans que rien ne le signale.* */
  const _sansAccent=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const txt=nom+' '+_sansAccent(o.note);
  const m=txt.match(/(\d{1,3})\s*(?:min|minutes?|')/);
  if(!m)return null;                                   // ⛔ pas de durée lisible → on ne devine pas
  const duration=+m[1];
  if(!(duration>0&&duration<=180))return null;         // hors bornes : ce n'est pas une durée
  let type='autre';
  for(const [re,t] of _CARDIO_TYPES){ if(re.test(nom)){ type=t; break; } }
  const intensity=/intense|fort|rapide|hiit|sprint/.test(txt)?'intense'
                 :/leger|legere|tranquille|doux|facile|echauffement/.test(txt)?'leger':'modere';
  return {type,intensity,duration};
}
function _extraireCardioMilo(newExs){
  const exs=Array.isArray(newExs)?newExs.slice():[];
  const out={exs:exs,avant:null,apres:null,restes:[]};
  if(!exs.length||typeof _exEquip!=='function')return out;
  const estCardio=o=>{ try{ return _exEquip(o&&o.name)==='cardio'; }catch(e){ return false; } };
  // Les BORNES de la partie musculation — c'est elles qui disent « avant » et « après ».
  let premierMuscu=-1, dernierMuscu=-1;
  exs.forEach((o,i)=>{ if(!estCardio(o)){ if(premierMuscu<0)premierMuscu=i; dernierMuscu=i; } });
  const garde=[];
  exs.forEach((o,i)=>{
    if(!estCardio(o)){ garde.push(o); return; }
    // ⚠️ Sans AUCUNE muscu, la séance est un cardio seul : tout part dans l'échauffement, et
    // c'est exactement le cas que Michel veut voir comptabilisé (« une séance cardio toute seule »).
    const avant = (premierMuscu<0) || (i<premierMuscu);
    const apres = (premierMuscu>=0) && (i>dernierMuscu);
    const c=_cardioDepuisEx(o);
    if(!c||(!avant&&!apres)){ garde.push(o); out.restes.push(o.name); return; }  // milieu, ou durée illisible
    if(avant&&!out.avant) out.avant=c;
    else if(apres&&!out.apres) out.apres=c;
    else { garde.push(o); out.restes.push(o.name); return; }   // 2ᵉ cardio du même côté : une seule place
  });
  out.exs=garde;
  return out;
}
function _appliqueMiloSession(newExs, data, mode, btn){
  /* 🏃 LE CARDIO SORT DE LA LISTE AVANT TOUT LE RESTE (ft-v995) — avant le contrôle d'intensité
     et avant la validation, qui n'ont aucun sens sur un elliptique (il n'a ni charge ni 1RM). */
  {
    var cd=_extraireCardioMilo(newExs);
    if(cd.avant||cd.apres) newExs=cd.exs;
    /* ⚠️ ET CE QU'ON N'A PAS SU PLACER SE VOIT, il ne se perd pas en silence : un cardio au
       milieu de la séance, sans durée lisible, ou un 2ᵉ du même côté (le bloc n'a qu'UNE place
       par moment) reste un exercice — et on le dit, plutôt que de le déplacer au hasard (R29). */
    if(cd.restes.length&&typeof toast==='function')
      toast('🏃 '+cd.restes[0]+' est resté dans les exercices (place du bloc déjà prise, ou durée non précisée)','info');
  }

  /* ⚡ LE CONTRÔLE D'INTENSITÉ (ft-v980) — il se déclenche À LA PROPOSITION, c'est tout son
     intérêt. Milo sait faire ce calcul (il l'a fait dès que Michel a demandé) ; ce qu'il ne
     fait pas, c'est le faire de lui-même. Le code, lui, le fait à chaque fois.

     ⛔⛔ ET IL EST POSÉ **ICI**, PAS PLUS HAUT — un témoin me l'a fait corriger, et c'est
     exactement l'erreur de la semaine reproduite une 4ᵉ fois. Il y a **DEUX** portes vers une
     séance de Milo : `_startSessionFromMilo` (aucune séance en cours — **le cas normal**, celui
     de Michel) et `_applyMiloSession` (une séance tourne déjà, on a demandé remplacer/ajouter).
     Je l'avais mis sur la seconde seulement : le contrôle n'aurait jamais tourné dans le cas
     le plus fréquent. **`_appliqueMiloSession` est le seul point que les deux traversent** —
     donc le seul endroit juste (R2 : un propriétaire par comportement).

     ⛔ ON N'A RIEN CHANGÉ DANS `newExs` : les charges de Milo partent INTACTES. On ATTACHE un
     avertissement, la personne décide (R29). Michel voulait ses 95 kg — il les a eus. */
  const alertes=[];
  (newExs||[]).forEach(o=>{
    const d=(typeof _intensiteDefauts==='function')?_intensiteDefauts(o.name,o.sets):[];
    if(d.length){ o.intensiteWarn=d; alertes.push(o.name); }
    /* 📍 ft-v1033 : et là où le contrôle d'intensité SE TAIT faute de repère, on dit qu'il n'y
       en a pas. Les deux ne se recouvrent jamais — `_repereDefauts` rend `[]` dès qu'un record
       ou un historique existe, `_intensiteDefauts` rend `[]` quand il n'y en a aucun.
       ⛔ Le message part dans `seanceWarn` et non `intensiteWarn` : il porte son propre 📍, et
       `intensiteWarn` est préfixé d'un ⚡ par `_intensiteBandeau`. Un seul propriétaire par
       forme d'affichage (R2). ⛔ Et on AJOUTE, on n'écrase pas : `_validationSeance` remplit ce
       même champ juste en dessous. */
    const r=(typeof _repereDefauts==='function')?_repereDefauts(o.name,o.sets):[];
    if(r.length) o.seanceWarn=(o.seanceWarn||[]).concat(r);
  });
  /* ⚠️ ON PRÉVIENT, ON NE BLOQUE PAS (R24 : informer sans bloquer). La séance démarre
     normalement ; l'avertissement reste attaché à l'exercice, donc lisible AU MOMENT de le
     faire — un toast seul aurait disparu avant la première série. */
  if(alertes.length&&typeof toast==='function')
    toast('⚡ Charge élevée sur '+alertes[0]+(alertes.length>1?' (+'+(alertes.length-1)+')':'')+' — détail dans la séance','info');

  // 🛡️ LA VALIDATION UNIQUE (ft-v989) — même point, même philosophie que ci-dessus.
  const verdict=(typeof _validationSeance==='function')?_validationSeance(newExs,mode):{doublons:[],exclusions:[],blessures:[]};
  (newExs||[]).forEach(o=>{
    const w=[];
    const excl=verdict.exclusions.find(x=>x.nom===o.name);
    if(excl) w.push('🚫 Tu avais écarté cet exercice'+(excl.vers?' — tu lui préfères « '+excl.vers+' »':'')+'.');
    const bl=verdict.blessures.find(x=>x.nom===o.name);
    if(bl) w.push('🛡️ Sollicite '+bl.zones.join(', ')+' — une zone que tu protèges en ce moment.');
    if(verdict.doublons.indexOf(o.name)>=0) w.push('🔁 Déjà présent ailleurs dans cette séance.');
    /* ⚠️ ON CONCATÈNE, ON N'AFFECTE PAS (ft-v1033) — c'était `o.seanceWarn=w`, une affectation.
       Tant que ce bloc était le seul à écrire ici, c'était sans conséquence ; depuis que
       `_repereDefauts` y met sa ligne juste au-dessus, une affectation l'EFFACERAIT en silence.
       *Un champ partagé se remplit par ajout, jamais par remplacement* (R2). */
    if(w.length) o.seanceWarn=(o.seanceWarn||[]).concat(w);
  });
  const nAlerte=verdict.doublons.length+verdict.exclusions.length+verdict.blessures.length;
  if(nAlerte&&typeof toast==='function')
    toast('🛡️ '+nAlerte+' point'+(nAlerte>1?'s':'')+' à vérifier dans ta séance — détail sur l\'exercice concerné','info');
  if(mode==='add'){
    S.wkt.exs=S.wkt.exs.concat(newExs);
  }else if(mode==='replace'){
    // ⚠️ On remplace les EXERCICES, pas la séance : le chrono, l'heure de début et le cardio
    // déjà noté sont conservés. Quelqu'un qui échange un exercice au bout de 40 minutes ne
    // recommence pas sa séance à zéro.
    S.wkt.exs=newExs;
    if(data.label)S.wkt.progLabel=data.label;
    _expandedEx=0;
  }else{
    // ⏱️ pas de startTs : le chrono démarrera à la 1ʳᵉ série validée (règle du 14/08).
    S.wkt={date:today(),progLabel:data.label||'Séance de Milo',exs:newExs,startHour:new Date().getHours()};
    _expandedEx=0;
  }
  /* 🏃 ⛔⛔ LE CARDIO S'ÉCRIT **ICI**, PAS PLUS HAUT — et c'est la mesure qui l'a dit, pas ma
     relecture. Posé avant, il était perdu : en mode « start », `S.wkt` est RECONSTRUIT À NEUF
     quelques lignes au-dessus (`S.wkt={date,progLabel,exs,startHour}`), ce qui écrase tout ce
     qu'on y avait mis. Le cardio sortait donc bien de la liste des exercices… et n'arrivait
     nulle part. *C'est R4 dans sa forme la plus bête : l'information était calculée et
     n'atteignait pas la donnée.* Mesuré sur la capture de Michel : exercices ["Hip Thrust
     Barre"] (correct) mais cardioAvant `null`. */
  if(cd&&(cd.avant||cd.apres)){
    /* ⛔ ON N'ÉCRASE JAMAIS UN CARDIO DÉJÀ NOTÉ par la personne : en mode « replace », le
       commentaire d'origine le dit — quelqu'un qui échange un exercice au bout de 40 minutes
       ne perd pas le vélo qu'il a vraiment fait. */
    if(cd.avant&&!(S.wkt.cardioAvant&&+S.wkt.cardioAvant.duration)) S.wkt.cardioAvant=cd.avant;
    if(cd.apres&&!(S.wkt.cardio&&+S.wkt.cardio.duration))          S.wkt.cardio=cd.apres;
    const _n=(cd.avant?1:0)+(cd.apres?1:0);
    if(typeof toast==='function')
      toast('🏃 '+(_n>1?'Cardio placé avant et après la séance':'Cardio placé dans son bloc')+' — pas dans les exercices','info');
  }
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  if(btn){btn.textContent=(mode==='replace')?'✅ Séance remplacée':'✅ Ajouté à ta séance';btn.disabled=true;btn.style.opacity='.7';}
  goScreen('log',document.getElementById('nb-log'));
  if(typeof renderLog==='function')renderLog();else if(typeof renderExBlocks==='function')renderExBlocks();
  const n=newExs.length;
  toast(mode==='add'?(n+' exercice'+(n>1?'s':'')+' ajouté'+(n>1?'s':'')+' 💪')
       :mode==='replace'?'Séance remplacée — c\'est reparti ! 💪'
       :'Séance prête — c\'est parti ! 💪','success');
}

function loadProgDay(progIdx,dayIdx){
  const prog=(S.programmes||[])[progIdx];
  if(!prog||!prog.days||!prog.days[dayIdx])return;
  const day=prog.days[dayIdx];
  S.wkt={date:today(),progLabel:day.label||('Jour '+(dayIdx+1)),exs:(day.exs||[]).map(e=>{
    const prev=getPrev(e.name);
    // Pré-remplissage PAR SÉRIE depuis la séance précédente (comme la colonne « Précédent »
    // et addSet) — série i → prev[i], repli sur la dernière série précédente, sinon valeur du programme.
    const _pa=_prevAligne(prev, e.sets||[]);   // par RÔLE (voir _prevAligne)
    const obj={name:e.name,note:e.note||'',sets:(e.sets||[]).map((s,i)=>{
      const pp=_pa[i];
      return {
        kg:pp?pp.kg:(s.kg||0),
        reps:s.maxi?0:(pp?pp.reps:(s.reps||10)), // série "maxi" : reps vide, elle saisit ce qu'elle a fait
        maxi:!!s.maxi,
        type:s.type||'N',done:false,rm1:0,rest:_secRepos(s.rest)
      };
    })};
    if(e.group){obj.group=e.group;obj.groupType=e.groupType||'super';} // propage le superset
    return obj;
  })};
  persist();closeDaySel();closeProgModal();
  _expandedEx=0;
  goScreen('log',document.getElementById('nb-log'));
  renderExBlocks();
  toast('"'+prog.name+' — '+day.label+'" chargé ! 💪','success');
}

// ─── PARCOURS DÉBUTANT — Étape 1 « Découverte » (gratuit) ─────
// Programme adapté : choix de fréquence (2/3 séances) + style (Full Body / Split),
// nuance femme (un exo fessier en plus), machines guidées uniquement.
// Objectif = 3 semaines. Les mouvements techniques (squat/couché/soulevé) et les
// étapes suivantes (volume ↑, passage Intermédiaire) arrivent plus tard.
const BEGINNER_PHASE1_WEEKS=3;
/* ══ 🔀 MACHINES ↔ POIDS LIBRES — la 3ᵉ question du générateur (ft-v1023) ═══════════════
   Brique ④ du chantier écran Séance (`docs/SEANCE-DESSAI.md` §5) : *sortir le générateur du
   cadre « débutant »*.
   ⚠️ EN MESURANT, LE VERROU N'ÉTAIT PAS LA PORTE. Le bouton était déjà visible pour tout le
   monde ; ce qui enfermait le générateur, c'était **le vocabulaire** (« parcours débutant »,
   « Premiers pas »), **le contenu** — 100 % machines guidées — le **blocage one-shot**, et un
   `beginnerJourney` posé même pour un confirmé.
   ⛔⛔ OUVRIR LA PORTE SANS TOUCHER AU CONTENU AURAIT ÉTÉ PIRE QUE DE NE RIEN FAIRE : on aurait
   livré un programme tout-machines à quelqu'un qui squatte à la barre. *C'est la leçon du 3ᵉ cas
   de R30 — promouvoir un essai incomplet coûte plus cher que de le laisser fermé.*
   ⛔ TOUTES LES CIBLES SONT VÉRIFIÉES AU CATALOGUE (les 324 noms, depuis `export/`), pas écrites
   de mémoire : un nom inventé produirait un programme dont les exercices n'ont ni animation, ni
   muscles, ni MET — et personne ne le verrait avant la salle (R29).
   ⭐ Et `Curl Machine` est devenu `Curl Pupitre Machine` : l'ancien nom se résout encore
   (fusion du 09/08), mais écrire un nom PÉRIMÉ dans un programme NEUF est une dette gratuite. */
/* ⭐ UN SEUL PROPRIÉTAIRE POUR « EST-CE UN PARCOURS DÉBUTANT ? » (R2). Trois endroits en
   dépendent — le nom du programme, le drapeau `beginner`, et `S.beginnerJourney`. Trois
   copies de la même condition finiraient par diverger, et c'est la DONNÉE qui mentirait. */
function _bgEstParcoursDebutant(matos){
  return (S.level==='debutant' || !S.level) && (matos||'machines')==='machines';
}
/* Le nom SUIT le choix : « Premiers pas » est une promesse d'accompagnement, pas une étiquette
   décorative. Un confirmé qui génère un Push/Pull/Legs à la barre lit le nom de ce qu'il a
   demandé. */
function _bgNom(matos, structure){
  if(_bgEstParcoursDebutant(matos)) return 'Premiers pas — '+structure;
  return structure + ((matos||'machines')==='libre' ? ' — barres et haltères' : ' — machines');
}
const _EX_LIBRE={
  'Chest Press Machine Horizontale':'Développé Couché',
  'Chest Press Machine Inclinée':'Développé Incliné Haltères',
  'Pec Deck':'Écarté Haltères',
  'Développé Épaules Machine':'Développé Militaire Haltères',
  'Élévations Latérales Machine':'Élévations Latérales (Lateral Raise)',
  'Tirage Poulie Haute (Lat Pulldown)':'Traction Assistée',
  'Tirage Poulie Haute Prise Serrée':'Tirage Poulie Basse Prise Serrée',
  'Rowing Machine (Tirage Horizontal)':'Rowing Haltère (Tirage Horizontal)',
  'Curl Pupitre Machine':'Curl Haltères',
  'Triceps Machine':'Extension Triceps',
  'Press Jambes 45°':'Squat à la Barre',
  'Extension Quadriceps (Leg Extension)':'Fentes',
  'Leg Curl Assis Machine':'Soulevé de Terre Roumain Haltères',
  'Hip Thrust Machine (Poussée de Hanche)':'Hip Thrust Barre (Poussée de Hanche)',
  'Abduction Cuisses (Leg Abduction)':'Fentes Latérales',
  'Crunch Machine':'Crunch'
  /* ⛔ « Curl Incliné » et « Gainage » n'ont PAS d'entrée : ils sont déjà en poids libre / au
     poids du corps. Une équivalence vers eux-mêmes serait du bruit qu'il faudrait maintenir. */
};
function _beginnerProg(gender, style, freq, matos){
  const F = gender==='F';
  freq = (freq===2)?2:3;
  /* ⭐ UNE SEULE LISTE, TRADUITE À LA SORTIE (R2). Écrire deux catalogues parallèles — un
     « machines » et un « libre » — les ferait diverger : on corrigerait un déséquilibre d'un
     côté et pas de l'autre. La structure de la séance est la même, seul l'outil change. */
  const _tr = n => (matos==='libre' && _EX_LIBRE[n]) ? _EX_LIBRE[n] : n;
  const _s3=(reps)=>[{kg:0,reps,type:'N',rest:0},{kg:0,reps,type:'N',rest:0},{kg:0,reps,type:'N',rest:0}];
  const ex=(name,reps)=>({name:_tr(name),sets:_s3(reps||12)}); // objet frais à chaque appel (pas de référence partagée)
  let days, name;
  if(style==='split'){
    if(freq===3){
      // Push / Pull / Legs
      name=_bgNom(matos,'Push/Pull/Legs');
      const legs=[ex('Press Jambes 45°'),ex('Leg Curl Assis Machine'),ex('Extension Quadriceps (Leg Extension)'),ex('Hip Thrust Machine (Poussée de Hanche)')];
      if(F)legs.push(ex('Abduction Cuisses (Leg Abduction)'));
      legs.push(ex('Gainage',30));
      days=[
        {label:'Poussée',exs:[ex('Chest Press Machine Horizontale'),ex('Pec Deck'),ex('Développé Épaules Machine'),ex('Élévations Latérales Machine'),ex('Triceps Machine')]},
        {label:'Tirage',exs:[ex('Tirage Poulie Haute (Lat Pulldown)'),ex('Rowing Machine (Tirage Horizontal)'),ex('Tirage Poulie Haute Prise Serrée'),ex('Curl Pupitre Machine'),ex('Curl Incliné')]},
        {label:'Jambes',exs:legs},
      ];
    }else{
      // Haut / Bas (2 jours)
      name=_bgNom(matos,'Haut/Bas');
      const bas=[ex('Press Jambes 45°'),ex('Leg Curl Assis Machine'),ex('Extension Quadriceps (Leg Extension)'),ex('Hip Thrust Machine (Poussée de Hanche)')];
      if(F)bas.push(ex('Abduction Cuisses (Leg Abduction)'));
      bas.push(ex('Gainage',30));
      days=[
        {label:'Haut du corps',exs:[ex('Chest Press Machine Horizontale'),ex('Tirage Poulie Haute (Lat Pulldown)'),ex('Développé Épaules Machine'),ex('Curl Pupitre Machine'),ex('Triceps Machine')]},
        {label:'Bas du corps',exs:bas},
      ];
    }
  }else{
    // Full Body (tout le corps à chaque séance)
    name=_bgNom(matos,'Full Body');
    const fb1=[ex('Press Jambes 45°'),ex('Chest Press Machine Horizontale'),ex('Tirage Poulie Haute (Lat Pulldown)'),ex('Développé Épaules Machine')];
    if(F)fb1.push(ex('Hip Thrust Machine (Poussée de Hanche)'));
    fb1.push(ex('Gainage',30));
    const fb2=[ex('Leg Curl Assis Machine'),ex('Pec Deck'),ex('Rowing Machine (Tirage Horizontal)'),ex('Curl Pupitre Machine'),ex('Crunch Machine',15)];
    const fb3=[ex('Extension Quadriceps (Leg Extension)'),ex('Chest Press Machine Inclinée'),ex('Tirage Poulie Haute Prise Serrée'),ex('Triceps Machine'),ex('Gainage',30)];
    days=(freq===2)?[{label:'Séance A',exs:fb1},{label:'Séance B',exs:fb2}]
                   :[{label:'Séance A',exs:fb1},{label:'Séance B',exs:fb2},{label:'Séance C',exs:fb3}];
  }
  /* ⛔ `beginner:true` NE SE POSE PLUS D'OFFICE (ft-v1023). Ce drapeau sert au parcours en
     12 semaines et à `_hasBeginnerProg` : le coller sur le programme d'un confirmé, c'est
     écrire un fait faux dans ses données — et il verrait apparaître un objectif d'étape 1
     qu'il n'a jamais demandé. */
  const prog={id:'p_beginner_'+Date.now(),name,bgStyle:style,bgFreq:freq,bgMatos:matos||'machines',days};
  if(_bgEstParcoursDebutant(matos)) prog.beginner=true;
  return prog;
}
function _hasBeginnerProg(){return (S.programmes||[]).some(p=>p&&(p.beginner||(p.name||'').indexOf('Premiers pas')===0));}

// ── Setup du parcours débutant (les 2 questions) ──
let _bgFreq=3,_bgStyle='fullbody',_bgMatos='machines';
function openBeginnerSetup(){
  /* ⛔ LE BLOCAGE ONE-SHOT A SAUTÉ (ft-v1023). Il rendait la main avec « Tu as déjà ton
     programme débutant » — vrai pour un parcours en 12 semaines, absurde pour un générateur :
     on change de salle, on passe des machines à la barre, on veut un 2ᵉ format. *Un outil
     qu'on ne peut utiliser qu'une fois n'est pas un outil, c'est une étape.* */
  _bgFreq=3; _bgStyle='fullbody';
  /* Le défaut de la 3ᵉ question suit le niveau DÉCLARÉ — on ne devine pas, on propose le plus
     sûr à qui débute et le plus probable aux autres. Elle reste modifiable en un tap. */
  _bgMatos=(S.level==='debutant'||!S.level)?'machines':'libre';
  _renderBeginnerSetup();
  document.getElementById('ov-beginner-setup').classList.add('open');
}
function _bgSetMatos(m){_bgMatos=(m==='libre')?'libre':'machines';_renderBeginnerSetup();}
function closeBeginnerSetup(){document.getElementById('ov-beginner-setup').classList.remove('open');}
function _bgSetFreq(n){_bgFreq=(n===2)?2:3;_renderBeginnerSetup();}
function _bgSetStyle(s){_bgStyle=(s==='split')?'split':'fullbody';_renderBeginnerSetup();}
function _renderBeginnerSetup(){
  const tg=(id,on)=>{const e=document.getElementById(id);if(e)e.classList.toggle('active',on);};
  tg('bg-freq-2',_bgFreq===2);tg('bg-freq-3',_bgFreq===3);
  tg('bg-style-fullbody',_bgStyle==='fullbody');tg('bg-style-split',_bgStyle==='split');
  tg('bg-matos-machines',_bgMatos==='machines');tg('bg-matos-libre',_bgMatos==='libre');
  /* Le titre DIT ce qui va être créé — sinon quelqu'un qui n'est pas débutant lit
     « Ton parcours débutant » et referme (R23 : un libellé qui ment fait fuir). */
  const ti=document.getElementById('bg-titre');
  if(ti)ti.textContent=_bgEstParcoursDebutant(_bgMatos)?'🌱 Ton parcours débutant':'🏗️ Créer un programme';
  const so=document.getElementById('bg-sous');
  if(so)so.textContent=_bgEstParcoursDebutant(_bgMatos)
    ? 'On te crée un programme sur mesure, sur machines (en sécurité). 3 petites questions 👇'
    : 'On te monte un programme complet et équilibré. 3 questions, aucune IA — c\'est instantané et ça marche hors ligne 👇';
  const md=document.getElementById('bg-matos-desc');
  if(md)md.textContent=_bgMatos==='machines'
    ? 'Machines guidées : le mouvement est tenu pour toi. Le plus sûr pour apprendre, et pour reprendre.'
    : 'Barres et haltères : plus de muscles stabilisateurs, plus de transfert — il faut maîtriser la technique.';
  const sl=document.getElementById('bg-style-split-lbl');if(sl)sl.textContent=_bgFreq===3?'Push / Pull / Legs':'Haut / Bas';
  const d=document.getElementById('bg-style-desc');
  if(d){
    d.textContent = _bgStyle==='fullbody'
      ? 'Tout le corps à chaque séance. Le plus simple pour débuter et bien apprendre les mouvements.'
      : (_bgFreq===3
          ? 'Une séance par zone : Poussée (pecs/épaules) · Tirage (dos/biceps) · Jambes. Facile à suivre.'
          : 'Une séance haut du corps, une séance bas du corps — bon compromis sur 2 jours.');
  }
}
function createBeginnerProg(){
  if(!S.programmes)S.programmes=[];
  const prog=_beginnerProg(S.gender,_bgStyle,_bgFreq,_bgMatos);
  S.programmes.push(prog);
  /* ⛔⛔ LE PARCOURS EN 12 SEMAINES NE SE POSE QUE S'IL EST DEMANDÉ (ft-v1023). Avant, cette
     ligne s'exécutait pour TOUT LE MONDE : un confirmé qui générait un programme se retrouvait
     inscrit en « phase 1 débutant », avec l'objectif d'étape affiché dans la modale. *C'est
     écrire un fait faux sur quelqu'un* (R29) — et il n'avait aucun moyen d'en sortir.
     ⛔ Et on n'écrase pas un parcours déjà commencé : il porte une date de départ. */
  if(_bgEstParcoursDebutant(_bgMatos) && !S.beginnerJourney)
    S.beginnerJourney={style:_bgStyle,freq:_bgFreq,startDate:today(),phase:1};
  persist();
  closeBeginnerSetup();
  openProgModal();
  toast('Ton programme est prêt ! '+(prog.beginner?'🌱 ':'')+_bgFreq+' séances/semaine','success');
}
// Ancien point d'entrée conservé (bouton) → ouvre désormais le setup
function addBeginnerProg(){openBeginnerSetup();}
// Objectif de fin d'étape 1, affiché dans le modal Programmes tant que le parcours est actif
function _beginnerGoalText(){
  const j=S.beginnerJourney;if(!j||j.phase!==1)return '';
  const start=j.startDate?new Date(j.startDate):null;
  let weekTxt='';
  if(start){const w=Math.floor((Date.now()-start.getTime())/(7*86400000))+1;weekTxt=' (semaine '+Math.min(w,BEGINNER_PHASE1_WEEKS)+' / '+BEGINNER_PHASE1_WEEKS+')';}
  return '🎯 Objectif '+BEGINNER_PHASE1_WEEKS+' semaines'+weekTxt+' : tiens tes '+j.freq+' séances/semaine et augmente les charges quand tu réussis tes séries (+2,5 kg haut du corps, +5 kg jambes). Après, Milo t\'ouvre la suite du parcours. 💪';
}

// ─── PROGRAMMES ──────────────────────────────────────────────
function openProgModal(){
  renderProgModal();
  document.getElementById('mod-prog').classList.add('open');
}
function closeProgModal(){
  document.getElementById('mod-prog').classList.remove('open');
}
function renderProgModal(){
  if(!S.programmes)S.programmes=[];
  const progs=S.programmes;
  const begBtn=document.getElementById('prog-beginner-btn');
  /* ⛔ LE BOUTON NE DISPARAÎT PLUS (ft-v1023) : il s'effaçait dès qu'un programme « débutant »
     existait, ce qui fermait le générateur à vie. Son LIBELLÉ suit le contexte. */
  if(begBtn){
    begBtn.style.display='block';
    begBtn.textContent=_hasBeginnerProg()||!(S.level==='debutant'||!S.level)
      ? '🏗️ Générer un programme complet'
      : '🌱 Créer mon parcours débutant';
  }
  const begGoal=document.getElementById('prog-beginner-goal');
  if(begGoal){const g=_beginnerGoalText();begGoal.style.display=g?'block':'none';begGoal.textContent=g;}
  const list=document.getElementById('prog-list-modal');
  if(!progs.length){
    /* ⚠️ CE MESSAGE EST DEVENU FAUX LE JOUR OÙ LE BOUTON EST ARRIVÉ (25/08) : il disait
       « Crée une séance et utilise "Sauvegarder" » — c'était le SEUL chemin, il ne l'est plus.
       Le laisser aurait envoyé les gens faire le détour juste au-dessous du raccourci.
       *Quand on ouvre une porte, on relit ce que disent les panneaux.* */
    list.innerHTML='<div style="text-align:center;color:var(--t3);padding:14px 0;font-size:14px;">Aucun programme pour l\'instant.<br>Crée-en un ci-dessus, ou sauvegarde une séance en cours.</div>';
  }else{
    list.innerHTML=progs.map((p,i)=>{
      const isMulti=p.days&&p.days.length;
      let detail='';
      if(isMulti){
        detail=p.days.length+' jour'+(p.days.length>1?'s':'')+' · '+p.days.map(d=>d.label).join(' / ');
      }else{
        const exs=p.exs||[];
        const exNames=exs.slice(0,3).map(e=>e.name).join(', ')+(exs.length>3?' +'+(exs.length-3):'');
        detail=exs.length+' exercice'+(exs.length>1?'s':'')+' · '+exNames;
      }
      const hasCycle=p.weeks>0;
      const curW=hasCycle?getProgCurrentWeek(p):0;
      const pct=hasCycle?Math.round(curW/p.weeks*100):0;
      const fmt_d=s=>s?new Date(s).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'';
      // La période vient de `progPeriode` — la même fonction que la feuille imprimée (R2).
      const _per=progPeriode(p);
      const endDate=_per?new Date(_per.end):null;
      const cycleHtml=hasCycle?`<div style="margin-top:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:12px;font-weight:700;color:var(--t1);">Semaine ${curW} / ${p.weeks}</span>
          <div style="display:flex;align-items:center;gap:5px;">
            ${p.startDate?`<span style="font-size:11px;color:var(--t3);">${fmt_d(p.startDate)}${endDate?' → '+fmt_d(endDate.toISOString().split('T')[0]):''}</span>`:''}
            <button onclick="event.stopPropagation();shiftProgStart(${i},-1)" style="width:22px;height:22px;border-radius:5px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:13px;cursor:pointer;padding:0;line-height:1;font-family:var(--font);">−</button>
            <button onclick="event.stopPropagation();shiftProgStart(${i},1)" style="width:22px;height:22px;border-radius:5px;border:1px solid var(--sep);background:var(--bg3);color:var(--t2);font-size:13px;cursor:pointer;padding:0;line-height:1;font-family:var(--font);">+</button>
          </div>
        </div>
        <div style="height:5px;background:var(--sep);border-radius:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:var(--red);border-radius:3px;"></div></div>
      </div>`:'';
      return `<div class="prog-card" style="flex-direction:column;align-items:stretch;">
        <div class="prog-card-name">${isMulti?'📅 ':'📋 '}${_escNote(p.name)}</div>
        <div class="prog-card-detail">${_escNote(detail)}</div>
        <div style="display:flex;gap:6px;margin-top:10px;align-items:center;">
          <button class="btn-xs" style="flex:1;background:rgba(255,45,85,.12);border-color:rgba(255,45,85,.4);color:var(--red);" onclick="loadProg(${i})">▶ Charger</button>
          <button class="btn-xs" style="color:var(--t2);" onclick="editProg(${i})" title="Modifier">✏️</button>
          <button class="btn-xs" style="color:var(--t2);" onclick="exportProgPdf(${i})" title="Exporter en PDF">📄 PDF</button>
          ${S.premium?`<button class="btn-xs" style="color:#AF52DE;" onclick="analyzeProgIa(${i})" title="Analyser avec le Coach IA">🤖</button>`:''}
          <button class="btn-xs" style="color:var(--red);border-color:rgba(255,45,85,.3);" onclick="deleteProg(${i})" title="Supprimer">✕</button>
        </div>
        ${cycleHtml}
      </div>`;
    }).join('');
  }
  // Affiche la section "Sauvegarder" seulement si une séance est en cours
  const saveSection=document.getElementById('prog-save-section');
  if(saveSection){
    const hasExs=S.wkt&&S.wkt.exs&&S.wkt.exs.length>0;
    saveSection.style.display=hasExs?'flex':'none';
    const inp=document.getElementById('prog-name-inp');
    if(inp&&!inp.value)inp.value='';
  }
}
function saveAsProg(){
  const name=(document.getElementById('prog-name-inp').value||'').trim();
  if(!name){toast('Donne un nom au programme','error');return;}
  if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){toast('Aucun exercice dans la séance','error');return;}
  if(!S.programmes)S.programmes=[];
  const prog={
    id:'p'+Date.now(),name,
    exs:S.wkt.exs.map(ex=>{
      // note conservée : sous le MÊME nom, saveAsProg REMPLACE le programme — sans elle, la
      // consigne posée dans l'éditeur serait détruite au premier « Sauvegarder » (perte silencieuse).
      const o={name:ex.name,sets:ex.sets.map(s=>({kg:s.kg||0,reps:s.reps||5,maxi:!!s.maxi,type:s.type||'N',rest:_secRepos(s.rest)}))};
      if(ex.note)o.note=String(ex.note).slice(0,300);
      if(ex.group){o.group=ex.group;o.groupType=ex.groupType||'super';} // conserve le superset
      return o;
    })
  };
  const idx=S.programmes.findIndex(p=>p.name.toLowerCase()===name.toLowerCase());
  if(idx>=0){S.programmes[idx]=prog;toast('"'+name+'" mis à jour ✅','success');}
  else{S.programmes.push(prog);toast('"'+name+'" sauvegardé ✅','success');}
  persist();
  renderProgModal();
}
function loadProg(idx){
  const prog=(S.programmes||[])[idx];
  if(!prog)return;
  if(prog.days&&prog.days.length){closeProgModal();openDaySel(idx);return;}
  S.wkt={
    date:today(),
    progLabel:prog.name,
    exs:(prog.exs||[]).map(e=>{
      const prev=getPrev(e.name);
      // Pré-remplissage PAR SÉRIE depuis la séance précédente (voir loadProgDay).
      // note : recopiée comme dans loadProgDay — elle manquait ICI seulement (trouvé 01/08
      // en ajoutant le champ 💬 de l'éditeur : un programme à 1 jour perdait son commentaire).
      const _pa=_prevAligne(prev, e.sets||[]);   // par RÔLE (voir _prevAligne)
      const obj={name:e.name,note:e.note||'',sets:(e.sets||[]).map((s,i)=>{
        const pp=_pa[i];
        return {
          kg:pp?pp.kg:(s.kg||0),
          reps:s.maxi?0:(pp?pp.reps:(s.reps||5)),
          maxi:!!s.maxi,
          type:s.type||'N',done:false,rm1:0,rest:_secRepos(s.rest)
        };
      })};
      if(e.group){obj.group=e.group;obj.groupType=e.groupType||'super';} // propage le superset
      return obj;
    })
  };
  persist();
  closeProgModal();
  goScreen('log',document.getElementById('nb-log'));
  renderExBlocks();
  toast('"'+prog.name+'" chargé ! 💪','success');
}
function deleteProg(idx){
  if(!S.programmes)return;
  const name=S.programmes[idx].name;
  S.programmes.splice(idx,1);
  persist();renderProgModal();
  toast('"'+name+'" supprimé','info');
}
// Impression / export PDF d'un programme — génère une feuille propre puis window.print()
// (le navigateur propose « Imprimer » ou « Enregistrer en PDF » ; sur iPhone : Partager → Imprimer → PDF)
function printProg(idx){
  const p=(S.programmes||[])[idx];if(!p)return;
  const esc=_escNote;
  const days=(p.days&&p.days.length)?p.days:[{label:p.name||'Séance',exs:p.exs||[]}];
  const scheme=(sets)=>{
    const s=sets||[];if(!s.length)return '';
    const reps=s.map(x=>x.reps);
    const val=reps.every(r=>r===reps[0])?reps[0]:reps.join('/');
    return s.length+' × '+val;
  };
  // ── UNE CASE PAR SÉRIE, pas une seule colonne « Poids » (12/08/2026) ────────────────
  // Demande de Michel : « il faut créer aussi des lignes pour l'entraînement ». Une case
  // unique ne permet de noter qu'un chiffre, alors qu'on monte en charge série après série
  // (70 · 100 · 115 · 130). C'est la feuille de salle classique : une colonne par série.
  // ⚠️ BORNÉ À 6 : au-delà, les colonnes deviennent trop étroites pour qu'on écrive dedans
  // au stylo — une case illisible ne sert à rien. Les séries au-delà se notent dans la marge.
  const nCol=Math.min(6,Math.max(1,...days.map(d=>Math.max(1,...(d.exs||[]).map(e=>(e.sets||[]).length||1)))));
  const daysHtml=days.map(d=>{
    const exRows=(d.exs||[]).map(e=>{
      let sc=scheme(e.sets);
      if(sc&&/gainage|planche/i.test(e.name))sc=sc.replace(/(\d+)$/,'$1 s'); // gainage = secondes
      // LA CONSIGNE ÉCRITE À LA CRÉATION DU PROGRAMME S'IMPRIME (2ᵉ demande de Michel).
      // Elle existait dans l'éditeur (`prog-note-…`) et n'atteignait pas le papier — donc
      // elle n'existait pas là où on en a besoin : à la salle, la barre dans les mains.
      const note=e.note?'<div class="prt-note">'+esc(e.note)+'</div>':'';
      const n=Math.min(nCol,(e.sets||[]).length||1);
      const cases=Array.from({length:nCol},(_,i)=>'<td class="w'+(i<n?'':' off')+'"></td>').join('');
      return '<tr><td class="ex">'+esc(e.name)+note+'</td><td class="c">'+sc+'</td>'+cases+'</tr>';
    }).join('');
    const th=Array.from({length:nCol},(_,i)=>'<th class="w">'+(i+1)+'</th>').join('');
    // ── LA FIGURINE DU JOUR — ce que ce jour travaille, vu d'un coup d'œil ────────────
    // Le calcul est le nôtre (`_mscScores`), donc la feuille dit exactement ce que dit
    // l'app : pas de 2ᵉ vérité sur le papier (R1).
    // ⚠️ Silence si rien n'est reconnu : ni figurine grise, ni focus inventé (R29).
    let fig='',focus='';
    try{
      const _s=_mscScoresPlan(d.exs);
      if(Object.keys(_s.sc||{}).length){
        fig='<figure class="prt-fig">'+_mscSVGprint(_s)+'</figure>';
        const f=_mscFocus(_s,3);
        if(f)focus='<span class="prt-focus">'+esc(f)+'</span>';
      }
    }catch(e){}
    return '<section class="prt-day">'+
             '<div class="prt-dayh">'+fig+'<div class="prt-dayt"><h3>'+esc(d.label||'Séance')+'</h3>'+focus+'</div></div>'+
             '<table><thead><tr><th>Exercice</th><th class="c">Séries × Reps</th>'+th+'</tr></thead><tbody>'+exRows+'</tbody></table>'+
           '</section>';
  }).join('');
  // Légende du code couleur de la figurine. Elle explique la CONVENTION (principal /
  // secondaire), pas la liste des muscles — ceux-là sont déjà nommés jour par jour.
  /* ⚠️ LES PASTILLES SONT DES SVG, PAS DES FONDS CSS (13/08/2026).
     Constaté en produisant le rendu fonds coupés : la figurine, elle, garde ses couleurs
     — un `fill` SVG est du CONTENU, il s'imprime toujours. Des pastilles en `background`
     devenaient au contraire trois anneaux vides identiques : la légende mourait alors que
     ce qu'elle explique survivait. Elles reprennent donc exactement les couleurs de
     `_MSC_PRINT_COL`, sans les recopier (R2). */
  const past=c=>'<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="'+c[0]+'" stroke="'+c[1]+'" stroke-width="1.5"/></svg>';
  const legende='<div class="prt-leg">'+
    '<span>'+past(_MSC_PRINT_COL.prim)+'Muscle principal</span>'+
    '<span>'+past(_MSC_PRINT_COL.sec )+'Muscle secondaire</span>'+
    '<span>'+past(_MSC_PRINT_COL.off )+'Non sollicité</span></div>';
  // Les champs qu'on remplit au stylo en haut de la feuille — sans eux, deux tirages du
  // même programme sont indiscernables une fois posés sur le banc.
  /* ── LA PÉRIODE DU PROGRAMME S'IMPRIME (13/08/2026, demande de Michel) ───────────────
     « la date de début du programme et la date de fin avec le nombre de semaines ».
     ⚠️ CE QUE L'APP SAIT, ELLE L'ÉCRIT ; CE QU'ELLE NE SAIT PAS, ELLE LE LAISSE EN BLANC.
     Faire remplir au stylo une date que le programme connaît déjà serait absurde — et
     imprimer une échéance inventée pour un programme sans dates le serait plus encore
     (R29). Un programme sans période garde donc l'ancienne case « Semaine ___ / ___ ».
     La case « Date » du jour reste dans les deux cas : c'est la date de LA SÉANCE qu'on
     note (on tire la même feuille plusieurs fois), pas celle du bloc. */
  const per=progPeriode(p);
  const jm=s=>{const d=new Date(s);return isNaN(d)?'':d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});};
  const bloc=per
    ? '<span class="prt-per"><b>Du '+jm(per.start)+' au '+jm(per.end)+'</b> · '+per.weeks+' semaine'+(per.weeks>1?'s':'')+'</span>'
    : '<span>Semaine <i class="s"></i> / <i class="s"></i></span>';
  const meta='<div class="prt-meta">'+bloc+'<span>Date <i></i></span><span>Poids du corps <i></i> kg</span></div>';
  const sub=p.beginner?('Parcours débutant — Étape 1'+(p.bgFreq?' · '+p.bgFreq+' séances/semaine':'')):'';
  const area=document.getElementById('print-area');if(!area)return;
  area.innerHTML='<div class="prt-doc">'+
    '<div class="prt-h"><span class="prt-logo">FORCE TRACKER</span><span class="prt-name">'+esc(p.name)+'</span></div>'+
    '<div class="prt-sub">'+(sub||'Programme d\'entraînement')+'</div>'+
    meta+
    daysHtml+
    // Les 3 blocs du bas. « Notes » manquait : à la salle on a toujours quelque chose à
    // noter (une douleur, un réglage de machine) et on l'écrivait dans la marge.
    '<div class="prt-bas">'+
      '<div class="prt-bloc"><h4>Règle de progression</h4>'+
        '<p>Quand tu réussis <b>toutes</b> tes séries proprement :</p>'+
        '<p><b>+2,5 kg</b> haut du corps &nbsp;·&nbsp; <b>+5 kg</b> jambes</p></div>'+
      '<div class="prt-bloc"><h4>Notes</h4><i></i><i></i><i></i></div>'+
      '<div class="prt-bloc"><h4>Légende</h4>'+legende+'</div>'+
    '</div>'+
    '<div class="prt-foot"><span>Une case par série : note la charge de chaque série au fur et à mesure.</span>'+
      '<span class="prt-contact">'+PDF_CONTACT.replace(' · ','<br>')+'</span></div>'+
    '</div>';
  window.print();
}

// ── Vrai PDF (jsPDF hébergé en local → marche hors-ligne) ──────
// Charge la lib à la demande depuis ./lib (précachée par le SW), génère un vrai
// fichier PDF, puis feuille de partage iPhone (navigator.share) ou téléchargement.
let _jspdfLoad=null;
function _loadJsPdf(){
  if(window.jspdf&&window.jspdf.jsPDF)return Promise.resolve();
  if(_jspdfLoad)return _jspdfLoad;
  const load=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});
  _jspdfLoad=load('./lib/jspdf.umd.min.js').then(()=>load('./lib/jspdf.plugin.autotable.min.js')).catch(e=>{_jspdfLoad=null;throw e;});
  return _jspdfLoad;
}
// Logo Force Tracker en dataURL (pour l'en-tête des PDF) — chargé une fois, échec silencieux.
let _logoDataUrl=null,_logoTried=false;
function _loadLogoDataURL(){
  if(_logoDataUrl||_logoTried)return Promise.resolve(_logoDataUrl);
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{ _logoTried=true; try{
      const MAX=120,sc=Math.min(1,MAX/Math.max(img.naturalWidth||MAX,img.naturalHeight||MAX));
      const c=document.createElement('canvas');c.width=Math.round((img.naturalWidth||MAX)*sc);c.height=Math.round((img.naturalHeight||MAX)*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);_logoDataUrl=c.toDataURL('image/png');
    }catch(e){_logoDataUrl=null;} res(_logoDataUrl); };
    img.onerror=()=>{ _logoTried=true; res(null); };
    img.src='./force-tracker-logo-final.png';
  });
}
// Contact affiché en pied de PDF
const PDF_CONTACT='forcetracker.app@gmail.com · michdu75-commits.github.io/forcetracker';

/* ─── IDENTITÉ DES PDF — UNE SEULE SOURCE (12/08/2026) ────────────────────────────────
   AVANT : les 4 exports (chat de Milo, étude du corps, rapport PT-001, programme)
   dessinaient CHACUN leur en-tête, avec les mêmes 6 lignes recopiées. Quatre copies de la
   même chose divergent toujours — la seule question est quand (R2). Elles partagent donc
   maintenant la palette, l'en-tête et le pied.
   Les couleurs sont celles du MODE CLAIR de l'app (--red #D91843, --gold #CC8800), les
   mêmes que la feuille d'impression de ft-v838 : un PDF de Force Tracker doit se
   reconnaître, qu'il sorte de l'imprimante ou de jsPDF. */
const PDF_COL={
  rouge:[217,24,67],      // --red (mode clair)
  or:[204,136,0],         // --gold
  encre:[18,18,30],       // --t1
  gris:[74,74,106],       // --t2
  pale:[136,136,170],     // --t3
  zebre:[246,246,249],    // --bg2 — fond des lignes alternées
  filet:[220,221,228]     // --bg3 — séparateurs de tableau
};
/* En-tête commun. Rend le Y où le contenu peut commencer.
   ⚠️ Le double filet (rouge épais + or fin) porte l'identité SANS aucun aplat : c'est la
   même règle qu'en ft-v838 — une bordure s'imprime toujours, un fond peut être désactivé. */
async function _pdfEntete(doc,{titre,sousTitre,droite,M}={}){
  const W=doc.internal.pageSize.getWidth(); M=M||44;
  let hx=M;
  try{ const logo=await _loadLogoDataURL();
       if(logo){ doc.addImage(logo,'PNG',M,22,34,34); hx=M+44; } }catch(e){}
  doc.setFont('helvetica','bold');doc.setFontSize(12.5);doc.setTextColor(...PDF_COL.rouge);
  doc.text('FORCE TRACKER',hx,40);
  if(sousTitre){ doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...PDF_COL.gris);
                 doc.text(sousTitre,hx,54); }
  if(titre){ doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(...PDF_COL.encre);
             doc.text(titre,W-M,40,{align:'right'}); }
  if(droite){ doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...PDF_COL.gris);
              doc.text(droite,W-M,titre?55:40,{align:'right'}); }
  const yF=sousTitre?64:60;
  doc.setLineWidth(1.8);doc.setDrawColor(...PDF_COL.rouge);doc.line(M,yF,W-M,yF);
  doc.setLineWidth(.8); doc.setDrawColor(...PDF_COL.or);   doc.line(M,yF+2.6,W-M,yF+2.6);
  return yF+22;
}
/* Pied commun, posé sur TOUTES les pages — à appeler en dernier, quand leur nombre est connu. */
function _pdfPied(doc,{M,mention}={}){
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(); M=M||44;
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);
    doc.setLineWidth(.8);doc.setDrawColor(...PDF_COL.or);doc.line(M,H-34,W-M,H-34);
    doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...PDF_COL.pale);
    doc.text(PDF_CONTACT,M,H-23);
    doc.text('Page '+i+'/'+n,W-M,H-23,{align:'right'});
    if(mention){ doc.setFont('helvetica','italic');doc.setFontSize(7);
                 doc.text(mention,M,H-14); }
  }
}
async function exportProgPdf(idx){
  const p=(S.programmes||[])[idx];if(!p)return;
  toast('Génération du PDF…','info');
  try{ await _loadJsPdf(); }
  catch(e){ toast('PDF indisponible ici — on passe par l\'impression','info'); printProg(idx); return; }
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt',format:'a4'});
    const W=doc.internal.pageSize.getWidth(), M=40;
    const sub=p.beginner?('Parcours débutant — Étape 1'+(p.bgFreq?' · '+p.bgFreq+' séances/semaine':'')):'Programme d\'entraînement';
    let y=await _pdfEntete(doc,{titre:(p.name||'Programme'),sousTitre:sub,M});
    // Les champs à remplir au stylo — mêmes que la feuille d'impression (ft-v839).
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...PDF_COL.gris);
    doc.text('Date',M,y); doc.text('Poids du corps',M+120,y); doc.text('Semaine',M+270,y);
    doc.setLineWidth(.6);doc.setDrawColor(...PDF_COL.pale);
    doc.line(M+26,y+2,M+110,y+2); doc.line(M+188,y+2,M+258,y+2); doc.line(M+318,y+2,M+392,y+2);
    y+=18;
    const days=(p.days&&p.days.length)?p.days:[{label:p.name||'Séance',exs:p.exs||[]}];
    // UNE COLONNE PAR SÉRIE (ft-v839) — voir la même décision dans `printProg` : on monte
    // en charge série après série, une case unique ne permettait d'en noter qu'une.
    const nCol=Math.min(6,Math.max(1,...days.map(d=>Math.max(1,...(d.exs||[]).map(e=>(e.sets||[]).length||1)))));
    days.forEach(d=>{
      const body=(d.exs||[]).map(e=>{
        const s=e.sets||[],reps=s.map(x=>x.reps);
        const val=reps.length?(reps.every(r=>r===reps[0])?reps[0]:reps.join('/')):'';
        let sc=s.length?(s.length+' × '+val):'';
        if(sc&&/gainage|planche/i.test(e.name))sc=String(sc).replace(/(\d+)$/,'$1 s');
        // La consigne saisie dans l'éditeur de programme s'imprime SOUS le nom : elle sert
        // à la salle, pas dans l'app (2ᵉ demande de Michel, 12/08).
        const nom=e.note?(e.name+'\n'+e.note):e.name;
        return [nom,sc].concat(Array.from({length:nCol},()=>''));
      });
      const colStyles={1:{halign:'center',cellWidth:82}};
      for(let i=0;i<nCol;i++) colStyles[2+i]={halign:'center',cellWidth:34};
      doc.autoTable({
        startY:y, margin:{left:M,right:M},
        head:[
          [{content:(d.label||'Séance'),colSpan:2+nCol,styles:{halign:'left',fillColor:PDF_COL.zebre,textColor:PDF_COL.rouge,fontStyle:'bold',fontSize:11.5}}],
          ['Exercice','Séries × Reps'].concat(Array.from({length:nCol},(_,i)=>String(i+1)))
        ],
        body,
        styles:{fontSize:9.5,cellPadding:4.5,overflow:'linebreak',textColor:PDF_COL.encre,
                lineColor:PDF_COL.filet,lineWidth:{bottom:0.5}},
        headStyles:{fillColor:PDF_COL.zebre,textColor:PDF_COL.rouge,fontStyle:'bold',fontSize:8.5,
                    lineColor:PDF_COL.rouge,lineWidth:{bottom:1.2}},
        alternateRowStyles:{fillColor:[250,250,252]},
        columnStyles:colStyles,
        theme:'plain',                       // aucune cloison verticale (règle de ft-v838)
        // La consigne, 2ᵉ ligne de la cellule, en or et en italique — comme sur la feuille.
        didParseCell:h=>{ if(h.section==='body'&&h.column.index===0&&/\n/.test(h.cell.raw||'')) h.cell.styles.cellPadding={top:4.5,bottom:4.5,left:4.5,right:4.5}; },
        didDrawCell:h=>{
          if(h.section!=='body'||h.column.index<2) return;
          // le trait pointillé où l'on écrit la charge de CETTE série
          const ex=(d.exs||[])[h.row.index], n=ex?((ex.sets||[]).length||1):0;
          doc.setLineWidth(.7);
          if(h.column.index-2 < n){ doc.setDrawColor(139,141,160); doc.setLineDashPattern([1.6,1.6],0); }
          else { doc.setDrawColor(236,236,241); doc.setLineDashPattern([],0); }
          const yb=h.cell.y+h.cell.height-3.5;
          doc.line(h.cell.x+3,yb,h.cell.x+h.cell.width-3,yb);
          doc.setLineDashPattern([],0);
        }
      });
      y=doc.lastAutoTable.finalY+15;
    });
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...PDF_COL.gris);
    doc.text(doc.splitTextToSize('Une case par série : note la charge de chaque série au fur et à mesure. Progression : quand tu réussis toutes tes séries proprement, ajoute +2,5 kg (haut du corps) ou +5 kg (jambes) la fois suivante.',W-2*M),M,y+6);
    _pdfPied(doc,{M});
    const fname=((p.name||'programme').replace(/[^\w\-]+/g,'_').replace(/^_+|_+$/g,''))+'.pdf';
    const blob=doc.output('blob');
    const file=new File([blob],fname,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file]}); return; }
      catch(err){ if(err&&err.name==='AbortError')return; }
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=fname;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1500);
    toast('PDF enregistré 📄','success');
  }catch(e){ console.warn('[FT pdf]',e); toast('Souci PDF — on passe par l\'impression','error'); printProg(idx); }
}
function editProg(idx){
  const prog=(S.programmes||[])[idx];
  if(!prog)return;
  _editProgIdx=idx;
  _editProgData=JSON.parse(JSON.stringify(prog));
  _renderProgEdit();
  document.getElementById('ov-prog-edit').classList.add('open');
}
/* ⭐⭐ CRÉER UN PROGRAMME DEPUIS ZÉRO (25/08/2026) — la porte qui manquait.
   AVANT, il n'existait AUCUN chemin pour créer un programme : la modale « Mes Programmes »
   ne proposait que « 💾 Sauvegarder comme programme », c'est-à-dire qu'il fallait d'abord
   monter une SÉANCE complète à la main pour obtenir un PROGRAMME. L'éditeur, lui, existait
   déjà en entier (`_renderProgEdit`) — mais il n'était atteignable que par le ✏️ d'un
   programme DÉJÀ créé. *Une porte manquait, pas une fonctionnalité* (R13 : on n'écrit pas
   un 2ᵉ éditeur, on ouvre celui qui est là).

   ⛔⛔ RIEN N'EST ÉCRIT TANT QU'ON N'A PAS SAUVEGARDÉ, et c'est ce qui rend l'annulation
   propre : on pointe `_editProgIdx` sur un index qui N'EXISTE PAS ENCORE (la longueur du
   tableau). `saveProgEdit` fait `S.programmes[_editProgIdx]=…` — sur cet index-là, ça AJOUTE.
   Si la personne ferme sans sauvegarder, `closeProgEdit` remet l'index à -1 et il ne reste
   RIEN : pas de programme fantôme à moitié rempli dans sa liste. */
function creerProgramme(){
  if(!S.programmes)S.programmes=[];
  closeProgModal();
  _editProgIdx=S.programmes.length;          // index encore libre → « sauvegarder » ajoutera
  _editProgData={id:'p'+Date.now(), name:'', exs:[]};
  _renderProgEdit();
  document.getElementById('ov-prog-edit').classList.add('open');
  // Le nom est le seul champ obligatoire : on y met le curseur, sauf sur mobile où le
  // clavier masquerait l'éditeur qu'on vient d'ouvrir (même raison qu'au sélecteur).
  const n=document.getElementById('prog-edit-name');
  if(n&&!('ontouchstart' in window))setTimeout(()=>n.focus(),120);
}
function _renderProgEdit(){
  const d=_editProgData;if(!d)return;
  const nameInp=document.getElementById('prog-edit-name');
  if(nameInp)nameInp.value=d.name;
  const el=document.getElementById('prog-edit-content');if(!el)return;
  const isMulti=d.days&&d.days.length;
  const cycleSection=`<div style="background:var(--bg3);border-radius:12px;padding:12px;margin-bottom:14px;">
    <div style="font-size:11px;font-weight:800;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">📅 Cycle</div>
    <div style="display:flex;gap:8px;">
      <div style="flex:1;">
        <div style="font-size:12px;color:var(--t3);margin-bottom:4px;">Durée (sem.)</div>
        <input id="prog-edit-weeks" type="number" min="1" max="52" value="${d.weeks||''}" placeholder="ex: 7" style="width:100%;background:var(--bg2);border:1px solid var(--sep);border-radius:8px;padding:9px 6px;color:var(--t1);font-size:15px;font-weight:700;font-family:var(--font);outline:none;text-align:center;box-sizing:border-box;">
      </div>
      <div style="flex:2;">
        <div style="font-size:12px;color:var(--t3);margin-bottom:4px;">Date de début</div>
        <input id="prog-edit-start" type="date" value="${d.startDate||''}" style="width:100%;background:var(--bg2);border:1px solid var(--sep);border-radius:8px;padding:9px 8px;color:var(--t1);font-size:14px;font-family:var(--font);outline:none;box-sizing:border-box;-webkit-appearance:none;">
      </div>
    </div>
  </div>`;
  const _INP='padding:5px 4px;font-size:13px;text-align:center;border:1px solid var(--sep);border-radius:6px;background:var(--bg2);color:var(--t1);font-family:var(--font);outline:none;';
  const _nbMaxi=(typeof _isNutriBeta==='function')&&_isNutriBeta(); // « maxi » reps réservé aux testeurs pour l'instant
  const exCard=(ex,di,ei)=>{
    const sets=ex.sets||[];
    const nextEx=_progEditEx(di,ei+1);
    const hasNext=!!nextEx;
    const linkedNext=hasNext&&ex.group&&ex.group===nextEx.group;
    const inSuper=!!ex.group;
    const dayLen=(_progDayExs(di)||[]).length;
    return`<div class="prog-ex-card" data-di="${di}" data-ei="${ei}" style="padding:9px 11px;background:var(--bg3);border-radius:10px;margin-bottom:${linkedNext?'2px':'6px'};${inSuper?'box-shadow:inset 3px 0 0 var(--orange);':''}">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;">
      ${dayLen>1?_progGripHtml(di,ei):''}
      ${_progExThumb(ex.name)}
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escNote(ex.name)}</div>
        ${inSuper?'<div style="font-size:10px;color:var(--orange);font-weight:800;letter-spacing:.03em;">⚡ SUPERSET</div>':''}
      </div>
      <button onclick="_removeExFromProgEdit(${di},${ei})" style="background:none;border:none;color:var(--t3);font-size:20px;line-height:1;cursor:pointer;padding:2px 4px;flex-shrink:0;">×</button>
    </div>
    <div style="display:flex;gap:6px;font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;padding:0 2px 3px;">
      <span style="width:30px;">Série</span><span style="width:58px;text-align:center;">Reps</span>${_nbMaxi?'<span style="width:36px;"></span>':''}<span style="flex:1;text-align:right;">Repos</span><span style="width:22px;"></span>
    </div>
    ${sets.map((s,si)=>`<div style="display:flex;align-items:center;gap:6px;padding:2px 2px;">
      <span style="width:30px;font-size:12px;color:var(--t2);">${si+1}</span>
      ${(_nbMaxi&&s.maxi)
        ? `<div onclick="_toggleProgSetMaxi(${di},${ei},${si})" title="Répétitions au maximum — touche pour revenir à un nombre" style="width:58px;text-align:center;padding:6px 0;background:rgba(255,109,0,.14);border:1px solid var(--orange);border-radius:8px;color:var(--orange);font-size:12px;font-weight:800;cursor:pointer;box-sizing:border-box;">maxi</div>`
        : `<input type="number" min="1" inputmode="numeric" value="${s.reps||''}" onchange="_setProgSetReps(${di},${ei},${si},this.value)" style="width:58px;${_INP}">`}
      ${_nbMaxi?`<button onclick="_toggleProgSetMaxi(${di},${ei},${si})" title="Nombre max de répétitions" style="width:36px;flex-shrink:0;background:${s.maxi?'rgba(255,109,0,.14)':'transparent'};border:1px ${s.maxi?'solid var(--orange)':'dashed var(--sep)'};border-radius:8px;color:${s.maxi?'var(--orange)':'var(--t3)'};font-size:10px;font-weight:800;cursor:pointer;padding:5px 0;">max</button>`:''}
      <span style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:5px;">
        <input type="number" min="0" step="5" inputmode="numeric" value="${s.rest||''}" placeholder="${_defRestForType(s.type)}" onchange="_setProgSetRest(${di},${ei},${si},this.value)" style="width:56px;${_INP}">
        <span style="font-size:11px;color:var(--t3);white-space:nowrap;min-width:44px;">s${s.rest>0?' '+_fmtRest(s.rest):''}</span>
      </span>
      <button onclick="_removeProgSet(${di},${ei},${si})" title="Retirer la série" style="width:22px;background:none;border:none;color:var(--t3);font-size:16px;line-height:1;cursor:pointer;padding:0;">×</button>
    </div>`).join('')}
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:5px;">
      <button onclick="_addProgSet(${di},${ei})" style="padding:5px 12px;background:transparent;border:1px dashed var(--sep);border-radius:8px;color:var(--t2);font-size:12px;cursor:pointer;">+ série</button>
      ${hasNext?`<button onclick="_toggleProgSuperset(${di},${ei})" style="padding:5px 12px;border-radius:8px;font-size:12px;cursor:pointer;background:${linkedNext?'rgba(255,109,0,.14)':'transparent'};border:1px ${linkedNext?'solid var(--orange)':'dashed var(--sep)'};color:${linkedNext?'var(--orange)':'var(--t2)'};">⚡ ${linkedNext?'En superset ✓':'Superset avec le suivant'}</button>`:''}
    </div>
    <div style="display:flex;align-items:flex-start;gap:6px;margin-top:6px;padding-top:4px;border-top:1px dashed var(--sep);">
      <span style="font-size:13px;color:var(--t3);padding-top:5px;flex-shrink:0;">💬</span>
      <textarea id="prog-note-${di}-${ei}" rows="1" placeholder="Commentaire / consigne (ex : dos calé, cran 4, prise serrée…)" oninput="_setProgExNote(${di},${ei},this.value);this.style.height='auto';this.style.height=this.scrollHeight+'px'" style="flex:1;resize:none;overflow:hidden;border:none;background:transparent;color:var(--t2);font-size:12px;font-family:inherit;padding:4px 2px;line-height:1.4;min-height:24px;outline:none;caret-color:var(--red);">${(ex.note||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
    </div>
  </div>`;};
  const addBtn=(di)=>`<button onclick="_openExPickerForProg(${di})" style="width:100%;padding:10px;background:transparent;border:1px dashed var(--sep);border-radius:10px;color:var(--t2);font-size:13px;cursor:pointer;margin-top:2px;">+ Ajouter un exercice</button>`;
  // Bouton « rattacher » (VM) — dans l'éditeur, pas sur la carte (évite d'empiler les boutons)
  const cleanupBtn=`<button onclick="_cleanProgEditExercises()" class="btn btn-bg2" style="width:100%;padding:10px;font-size:13px;margin-bottom:14px;">🧹 Rattacher les exercices reconnus (évite les doublons)</button>`;
  if(isMulti){
    el.innerHTML=cleanupBtn+cycleSection+d.days.map((day,di)=>`<div style="margin-bottom:16px;">
      <input value="${_escNote(day.label||'Jour '+(di+1)).replace(/"/g,'&quot;')}" onchange="_setProgDayLabel(${di},this.value)" title="Renomme la séance" style="width:100%;font-size:11px;font-weight:800;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;background:transparent;border:none;border-bottom:1px dashed var(--sep);padding:2px 0;font-family:inherit;">
      ${(day.exs||[]).map((ex,ei)=>exCard(ex,di,ei)).join('')}
      ${addBtn(di)}
    </div>${di<d.days.length-1?'<hr style="border:none;border-top:1px solid var(--sep);margin:0 0 16px;">':''}`).join('');
  }else{
    el.innerHTML=cleanupBtn+cycleSection+(d.exs||[]).map((ex,ei)=>exCard(ex,0,ei)).join('')+addBtn(0);
  }
  // Un commentaire existant peut faire plusieurs lignes : ajuste la hauteur des champs 💬 au rendu
  el.querySelectorAll('textarea[id^="prog-note-"]').forEach(ta=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
}
// VM sur un programme DÉJÀ enregistré (dans l'éditeur) : rattache les exos aux références EXLIB
// (palier auto ≥90 uniquement → sûr). N'écrit que dans la copie d'édition → validé par « Enregistrer ».
function _cleanProgEditExercises(){
  if(!_editProgData||typeof _matchExercise!=='function'){toast('Indisponible','error');return;}
  let n=0;
  const doEx=ex=>{ if(!ex||!ex.name)return; let r; try{r=_matchExercise(ex.name);}catch(e){return;}
    if(r&&r.match&&r.tier==='auto'&&r.match!==ex.name){ ex.name=r.match; n++; } };
  if(_editProgData.days&&_editProgData.days.length) _editProgData.days.forEach(day=>(day.exs||[]).forEach(doEx));
  else (_editProgData.exs||[]).forEach(doEx);
  if(n){ _renderProgEdit(); toast(n+' exercice'+(n>1?'s':'')+' rattaché'+(n>1?'s':'')+' — 💾 enregistre pour valider','success'); }
  else toast('Aucun doublon évident à rattacher 👍','info');
}
// Repos par défaut selon le type de série (pour le placeholder de l'éditeur)
function _defRestForType(type){return type==='É'||type==='W'?45:((type==='X'||type==='E')?240:(type==='D'?20:90));}
// Formate des secondes en 1'30 / 45s (affichage type PDF)
function _fmtRest(sec){sec=parseInt(sec)||0;if(sec<=0)return'';if(sec<60)return sec+'s';const m=Math.floor(sec/60),s=sec%60;return m+"'"+String(s).padStart(2,'0');}
// Retourne l'exercice ciblé dans l'éditeur (multi-jours ou à plat)
function _progEditEx(di,ei){
  const d=_editProgData;if(!d)return null;
  const exs=(d.days&&d.days.length)?(d.days[di]&&d.days[di].exs):d.exs;
  return exs&&exs[ei]?exs[ei]:null;
}
// Édite le repos (secondes) d'une série — pas de re-render (garde le focus)
function _setProgSetRest(di,ei,si,val){
  const ex=_progEditEx(di,ei);if(!ex||!ex.sets||!ex.sets[si])return;
  ex.sets[si].rest=parseInt(val)||0;
}
// Édite le commentaire/consigne d'un exercice du programme (retour Christophe + Michel, 01/08).
// Pas de re-render (garde le focus). Même plafond de 300 caractères que l'import de programme.
// Le commentaire suit l'exercice quand le programme est chargé en séance (recopié dans wkt.exs[].note).
function _setProgExNote(di,ei,val){
  const ex=_progEditEx(di,ei);if(!ex)return;
  const v=(val||'').trim();
  if(v)ex.note=v.slice(0,300);else delete ex.note;
}
// Édite les reps d'une série — pas de re-render (garde le focus)
function _setProgSetReps(di,ei,si,val){
  const ex=_progEditEx(di,ei);if(!ex||!ex.sets||!ex.sets[si])return;
  ex.sets[si].reps=parseInt(val)||0;
  if(ex.sets[si].reps>0)ex.sets[si].maxi=false; // saisir un nombre annule le mode « maxi »
}
// Bascule une série en « maxi » (nombre max de répétitions) ou revient à un nombre — re-render
function _toggleProgSetMaxi(di,ei,si){
  const ex=_progEditEx(di,ei);if(!ex||!ex.sets||!ex.sets[si])return;
  const s=ex.sets[si];
  s.maxi=!s.maxi;
  if(s.maxi)s.reps=0; // en mode maxi, pas de nombre cible
  _renderProgEdit();
}
// Ajoute une série (copie la dernière) puis re-render
function _addProgSet(di,ei){
  const ex=_progEditEx(di,ei);if(!ex)return;
  if(!ex.sets)ex.sets=[];
  const l=ex.sets[ex.sets.length-1];
  ex.sets.push({kg:l?l.kg||0:0,reps:l?l.reps||10:10,type:l?l.type||'N':'N',rest:l?l.rest||0:0});
  _renderProgEdit();
}
// Retire une série (garde au moins 1) puis re-render
function _removeProgSet(di,ei,si){
  const ex=_progEditEx(di,ei);if(!ex||!ex.sets)return;
  if(ex.sets.length<=1){toast('Au moins 1 série','info');return;}
  ex.sets.splice(si,1);
  _renderProgEdit();
}
// ── Supersets dans l'éditeur de programme ──
// Un superset = exercices consécutifs partageant le même `group`. On lie/délie un exo avec le suivant.
function _progDayExs(di){
  const d=_editProgData;if(!d)return null;
  return (d.days&&d.days.length)?(d.days[di]&&d.days[di].exs):d.exs;
}
function _rebuildProgGroups(exs,links){
  for(let k=0;k<exs.length;k++){delete exs[k].group;delete exs[k].groupType;}
  let gid=null;
  for(let k=0;k<exs.length-1;k++){
    if(links[k]){
      if(!gid)gid='sg'+Date.now().toString(36)+k;
      exs[k].group=gid;exs[k].groupType='super';
      exs[k+1].group=gid;exs[k+1].groupType='super';
    }else gid=null;
  }
}
// Retire les groupes qui ne comptent plus qu'un membre (après suppression d'un exo)
function _normalizeProgGroups(exs){
  if(!exs)return;
  const count={};exs.forEach(e=>{if(e.group)count[e.group]=(count[e.group]||0)+1;});
  exs.forEach(e=>{if(e.group&&count[e.group]<2){delete e.group;delete e.groupType;}});
}
function _toggleProgSuperset(di,ei){
  const exs=_progDayExs(di);if(!exs||ei>=exs.length-1)return;
  const links=[];
  for(let k=0;k<exs.length-1;k++)links[k]=!!(exs[k].group&&exs[k].group===exs[k+1].group);
  links[ei]=!links[ei];
  _rebuildProgGroups(exs,links);
  _renderProgEdit();
}
// ── Superset par GLISSER-DÉPOSER dans l'éditeur de programme (demande Christophe) ──
// Glisser une carte exercice sur une autre (même jour) → superset. Réutilise le
// modèle groupe consécutif (_rebuildProgGroups compatible : membres contigus + même group).
function _dropProgSuperset(di, dragEi, targetEi){
  const exs=_progDayExs(di); if(!exs||dragEi===targetEi)return;
  const drag=exs[dragEi], target=exs[targetEi];
  if(!drag||!target)return;
  if(drag.group&&drag.group===target.group){toast('Déjà en superset ensemble','info');return;}
  let gid=(target.group&&target.groupType==='super')?target.group:null;
  if(!gid){gid='sg'+Date.now().toString(36);target.group=gid;target.groupType='super';}
  drag.group=gid;drag.groupType='super';
  exs.splice(dragEi,1);
  let insertAt=exs.indexOf(target)+1;
  while(insertAt<exs.length&&exs[insertAt].group===gid)insertAt++;
  exs.splice(insertAt,0,drag);
  _renderProgEdit();
  if(navigator.vibrate)navigator.vibrate(30);
  toast('Superset créé ⚡','success');
}
function _progGripHtml(di,ei){
  return `<span class="ex-grip" title="Glisser sur un autre exercice pour créer un superset" ontouchstart="_progDragStart(event,${di},${ei})" onmousedown="_progDragStart(event,${di},${ei})" onclick="event.stopPropagation()"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display:block;pointer-events:none;"><circle cx="5.5" cy="3.5" r="1.5"/><circle cx="10.5" cy="3.5" r="1.5"/><circle cx="5.5" cy="8" r="1.5"/><circle cx="10.5" cy="8" r="1.5"/><circle cx="5.5" cy="12.5" r="1.5"/><circle cx="10.5" cy="12.5" r="1.5"/></svg></span>`;
}
let _progDrag=null; // { di, ei, ghost, over:{di,ei}|null }
function _progDragStart(e,di,ei){
  const ex=_progEditEx(di,ei); if(!ex)return;
  e.preventDefault();e.stopPropagation();
  const pt=e.touches?e.touches[0]:e;
  const ghost=document.createElement('div'); ghost.className='ex-drag-ghost'; ghost.textContent=ex.name;
  document.body.appendChild(ghost);
  _progDrag={di,ei,ghost,over:null};
  _progDragMoveTo(pt.clientX,pt.clientY);
  document.addEventListener('touchmove',_progDragMove,{passive:false});
  document.addEventListener('touchend',_progDragEnd);
  document.addEventListener('touchcancel',_progDragEnd);
  document.addEventListener('mousemove',_progDragMove);
  document.addEventListener('mouseup',_progDragEnd);
  if(navigator.vibrate)navigator.vibrate(15);
}
function _progDragMoveTo(x,y){
  if(!_progDrag)return;
  _progDrag.ghost.style.left=x+'px';_progDrag.ghost.style.top=y+'px';
  // elementsFromPoint (pluriel) : robuste si un élément flottant recouvre la carte
  let card=null;
  const stack=document.elementsFromPoint(x,y);
  for(let s=0;s<stack.length;s++){const c=stack[s].closest?stack[s].closest('.prog-ex-card'):null;if(c){card=c;break;}}
  document.querySelectorAll('.prog-ex-card.drag-over').forEach(c=>c.classList.remove('drag-over'));
  let over=null;
  if(card){
    const di=parseInt(card.dataset.di), ei=parseInt(card.dataset.ei);
    if(!isNaN(di)&&!isNaN(ei)&&di===_progDrag.di&&ei!==_progDrag.ei){card.classList.add('drag-over');over={di,ei};}
  }
  _progDrag.over=over;
}
function _progDragMove(e){ if(!_progDrag)return; e.preventDefault(); const pt=e.touches?e.touches[0]:e; _progDragMoveTo(pt.clientX,pt.clientY); }
function _progDragEnd(){
  if(!_progDrag)return;
  const over=_progDrag.over, di=_progDrag.di, ei=_progDrag.ei, ghost=_progDrag.ghost;
  document.removeEventListener('touchmove',_progDragMove);
  document.removeEventListener('touchend',_progDragEnd);
  document.removeEventListener('touchcancel',_progDragEnd);
  document.removeEventListener('mousemove',_progDragMove);
  document.removeEventListener('mouseup',_progDragEnd);
  if(ghost&&ghost.parentNode)ghost.parentNode.removeChild(ghost);
  document.querySelectorAll('.prog-ex-card.drag-over').forEach(c=>c.classList.remove('drag-over'));
  _progDrag=null;
  if(over&&over.di===di&&over.ei!==ei)_dropProgSuperset(di,ei,over.ei);
}
function _openExPickerForProg(dayIdx){
  _editDayIdx=dayIdx;
  _exPickerMode='prog';
  openExPicker();
}
function _removeExFromProgEdit(dayIdx,exIdx){
  const d=_editProgData;if(!d)return;
  if(d.days&&d.days.length)(d.days[dayIdx].exs||[]).splice(exIdx,1);
  else(d.exs||[]).splice(exIdx,1);
  _normalizeProgGroups(_progDayExs(dayIdx)); // évite un superset orphelin (1 seul membre)
  _renderProgEdit();
}
function _addExToProgEdit(name){
  const d=_editProgData;if(!d)return;
  const newEx={name,sets:[{kg:0,reps:10,type:'N'},{kg:0,reps:10,type:'N'},{kg:0,reps:10,type:'N'}]};
  if(d.days&&d.days.length){
    if(!d.days[_editDayIdx])return;
    if(!d.days[_editDayIdx].exs)d.days[_editDayIdx].exs=[];
    d.days[_editDayIdx].exs.push(newEx);
  }else{
    if(!d.exs)d.exs=[];
    d.exs.push(newEx);
  }
  _renderProgEdit();
  document.getElementById('ov-prog-edit').classList.add('open');
  toast(name+' ajouté !','info');
}
function saveProgEdit(){
  if(!_editProgData||_editProgIdx<0)return;
  const nameInp=document.getElementById('prog-edit-name');
  if(nameInp&&nameInp.value.trim())_editProgData.name=nameInp.value.trim();
  /* ⚠️ LE NOM DEVIENT OBLIGATOIRE (25/08) — il ne l'était pas, et ça ne se voyait pas tant
     qu'on ne pouvait éditer QUE des programmes déjà nommés. Depuis qu'on peut en créer un de
     zéro (`creerProgramme`), un nom vide produirait une ligne SANS TITRE dans « Mes
     Programmes » — impossible à reconnaître, et impossible à distinguer d'un bug.
     ⛔ On prévient et on rend la main sur le champ, on ne détruit rien (R24). */
  if(!String(_editProgData.name||'').trim()){
    toast('Donne un nom à ton programme','error');
    if(nameInp)nameInp.focus();
    return;
  }
  const weeksInp=document.getElementById('prog-edit-weeks');
  const startInp=document.getElementById('prog-edit-start');
  if(weeksInp)_editProgData.weeks=parseInt(weeksInp.value)||0;
  if(startInp)_editProgData.startDate=startInp.value||'';
  S.programmes[_editProgIdx]=_editProgData;
  persist();
  closeProgEdit();
  toast('Programme mis à jour ✅','success');
  openProgModal();
}
function closeProgEdit(){
  document.getElementById('ov-prog-edit').classList.remove('open');
  _editProgIdx=-1;_editProgData=null;
}
function getProgCurrentWeek(prog){
  if(!prog.startDate||!prog.weeks)return 1;
  const days=Math.floor((new Date()-new Date(prog.startDate))/(86400000));
  return Math.max(1,Math.min(prog.weeks,Math.ceil((days+1)/7)));
}
/* ─── LA PÉRIODE D'UN PROGRAMME — UNE SEULE SOURCE (13/08/2026) ────────────────────────
   La date de fin se déduisait « à la volée » dans la carte du programme
   (`new Date(startDate) + weeks*7*86400000`). Au moment d'imprimer la même information
   sur la feuille, la recopier aurait fait DEUX formules pour une seule vérité — et deux
   copies divergent toujours, la seule question est quand (R2). Les deux lisent donc ceci.
   ⚠️ Rend `null` quand la date ou le nombre de semaines manque : un programme sans dates
   est parfaitement normal (on en fait souvent), et inventer une échéance serait pire que
   de n'en afficher aucune (R29). C'est à l'appelant de prévoir le cas. */
function progPeriode(prog){
  if(!prog)return null;
  const w=parseInt(prog.weeks)||0;
  if(!prog.startDate||!w)return null;
  const d0=new Date(prog.startDate);
  if(isNaN(d0))return null;
  // La fin, c'est le DERNIER JOUR de la dernière semaine, pas le lendemain : un bloc de
  // 6 semaines commencé un lundi finit le dimanche de la 6ᵉ, donc +6×7−1 jours.
  const d1=new Date(d0.getTime()+(w*7-1)*86400000);
  const iso=d=>d.toISOString().split('T')[0];
  return {weeks:w, start:iso(d0), end:iso(d1), semaine:getProgCurrentWeek(prog)};
}
function shiftProgStart(idx,delta){
  const prog=(S.programmes||[])[idx];if(!prog)return;
  if(!prog.startDate)prog.startDate=today();
  const d=new Date(prog.startDate);
  d.setDate(d.getDate()+delta*7);
  prog.startDate=d.toISOString().split('T')[0];
  persist();renderProgModal();
}
let _lastProgAnalysisProg=null,_lastProgAnalysisReply='';
function _formatProgForAnalysis(prog){
  if(prog.days&&prog.days.length){
    return prog.days.map(day=>{
      const exs=(day.exs||[]).map(ex=>{
        const sets=ex.sets?ex.sets.length:3;
        const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;
        const kg=ex.sets&&ex.sets[0]&&ex.sets[0].kg?' × '+ex.sets[0].kg+'kg':'';
        return '  - '+ex.name+' : '+sets+'×'+reps+kg;
      }).join('\n');
      return '📅 '+day.label+'\n'+exs;
    }).join('\n\n');
  }
  return (prog.exs||[]).map(ex=>{
    const sets=ex.sets?ex.sets.length:3;
    const reps=ex.sets&&ex.sets[0]?ex.sets[0].reps:10;
    const kg=ex.sets&&ex.sets[0]&&ex.sets[0].kg?' × '+ex.sets[0].kg+'kg':'';
    return '  - '+ex.name+' : '+sets+'×'+reps+kg;
  }).join('\n');
}
function _coachFmtHtml(text){
  let html=text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>');
  if(!html.includes('<p>')&&!html.includes('<ul>'))html='<p>'+html+'</p>';
  return html;
}
async function analyzeProgIa(idx){
  if(!S.premium){toast('Fonctionnalité Premium ⭐','info');return;}
  const prog=(S.programmes||[])[idx];
  if(!prog){toast('Programme introuvable','error');return;}
  if(!S.url){toast('Configure ton URL Apps Script dans Profil','error');return;}
  const ov=document.getElementById('ov-prog-analysis');
  const content=document.getElementById('prog-analysis-content');
  const footer=document.getElementById('prog-analysis-footer');
  const titleEl=document.getElementById('prog-analysis-title');
  if(!ov||!content)return;
  if(titleEl)titleEl.textContent=prog.name;
  content.innerHTML='<div style="text-align:center;padding:32px 0;"><div style="font-size:32px;margin-bottom:12px;">🤖</div><div style="color:var(--t2);font-size:14px;">Analyse en cours…</div></div>';
  if(footer)footer.style.display='none';
  ov.classList.add('open');
  const progText=_formatProgForAnalysis(prog);
  const message='Analyse ce programme d\'entraînement en tant que coach expert. Réponds en 4 parties :\n\n🎯 VERDICT GLOBAL (1 phrase directe et honnête)\n✅ POINTS FORTS\n⚠️ POINTS À AMÉLIORER\n💡 RECOMMANDATIONS CONCRÈTES (actions à faire)\n\nSois direct, concret et personnalisé selon mon profil.\n\nProgramme : "'+prog.name+'"\n'+progText;
  try{
    const resp=await fetch(_aiUrl('coach'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'coach',message,context:buildCoachContext(message),history:[]})});
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const data=await resp.json();
    const reply=data.reply||'Erreur lors de l\'analyse.';
    _lastProgAnalysisReply=reply;_lastProgAnalysisProg=prog;
    content.innerHTML='<div style="font-size:14px;line-height:1.7;color:var(--t1);">'+_coachFmtHtml(reply)+'</div>';
    if(footer)footer.style.display='block';
  }catch(e){
    content.innerHTML='<div style="color:var(--red);padding:20px;text-align:center;">Erreur de connexion. Vérifie ta connexion et réessaie.</div>';
  }
}
function continueInCoach(){
  document.getElementById('ov-prog-analysis').classList.remove('open');
  if(_lastProgAnalysisReply&&_lastProgAnalysisProg){
    coachHistory=[
      {role:'user',content:'Analyse mon programme "'+_lastProgAnalysisProg.name+'".'},
      {role:'assistant',content:_lastProgAnalysisReply}
    ];
    const msgs=document.getElementById('coach-msgs');
    if(msgs){
      msgs.innerHTML='';
      renderCoachMsg('user','Analyse mon programme "'+_lastProgAnalysisProg.name+'".');
      renderCoachMsg('coach',_lastProgAnalysisReply);
    }
    const suggs=document.getElementById('coach-suggs');
    if(suggs)suggs.style.display='none';
  }
  goScreen('coach',document.getElementById('nb-coach'));
}

// ─── EXERCISE VIDEO / IMAGE ───────────────────────────────────
const gifCache={};

// ─── MUSCLE GROUP SVG TEMPLATES (fallback si aucune image trouvée) ───
const _MUSCLE_SVG=(function(){
  // Silhouette masculine — épaules larges, hanches étroites
  const BDY=`<g fill="var(--bg3)" stroke="var(--sep)" stroke-width="1.2">
<circle cx="50" cy="14" r="11"/>
<path d="M44 25 L56 25 L58 34 L42 34Z"/>
<path d="M24 38 Q50 33 76 38 L76 98 Q50 102 24 98Z"/>
<path d="M24 38 L16 40 L10 86 L22 88 L24 38Z"/>
<path d="M76 38 L84 40 L90 86 L78 88 L76 38Z"/>
<path d="M10 86 L22 88 L21 114 L9 112Z"/>
<path d="M90 86 L78 88 L79 114 L91 112Z"/>
<rect x="27" y="99" width="19" height="52" rx="6"/>
<rect x="54" y="99" width="19" height="52" rx="6"/>
<rect x="28" y="153" width="17" height="38" rx="6"/>
<rect x="55" y="153" width="17" height="38" rx="6"/>
</g>`;
  function t(hl,lbl,note){
    return `<svg viewBox="0 0 100 202" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:158px;display:block;margin:0 auto">${BDY}<g fill="#FF2D55" opacity="0.85">${hl}</g><text x="50" y="196" text-anchor="middle" font-size="10" fill="var(--t1)" font-weight="700" font-family="sans-serif">${lbl}</text>${note?`<text x="50" y="201" text-anchor="middle" font-size="7" fill="var(--t3)" font-family="sans-serif">${note}</text>`:''}</svg>`;
  }
  return {
    'Pectoraux': t(`<ellipse cx="37" cy="56" rx="13" ry="11"/><ellipse cx="63" cy="56" rx="13" ry="11"/>`,'Pectoraux'),
    'Dos':       t(`<ellipse cx="37" cy="64" rx="12" ry="14"/><ellipse cx="63" cy="64" rx="12" ry="14"/>`,'Dos','(vue dos)'),
    'Trapèzes':  t(`<path d="M34 29 Q50 23 66 29 L63 50 Q50 54 37 50Z"/>`,'Trapèzes','(vue dos)'),
    'Épaules':   t(`<ellipse cx="20" cy="45" rx="9" ry="8"/><ellipse cx="80" cy="45" rx="9" ry="8"/>`,'Épaules'),
    'Biceps':    t(`<rect x="13" y="46" width="10" height="22" rx="4"/><rect x="77" y="46" width="10" height="22" rx="4"/>`,'Biceps'),
    'Triceps':   t(`<rect x="13" y="46" width="10" height="22" rx="4"/><rect x="77" y="46" width="10" height="22" rx="4"/>`,'Triceps','(vue dos)'),
    'Avant-bras':t(`<rect x="11" y="70" width="10" height="26" rx="4"/><rect x="79" y="70" width="10" height="26" rx="4"/>`,'Avant-bras'),
    'Abdominaux':t(`<rect x="35" y="68" width="30" height="28" rx="5"/>`,'Abdominaux'),
    'Jambes':    t(`<rect x="28" y="100" width="18" height="50" rx="6"/><rect x="54" y="100" width="18" height="50" rx="6"/>`,'Jambes'),
    'Fessiers':  t(`<ellipse cx="38" cy="104" rx="14" ry="12"/><ellipse cx="62" cy="104" rx="14" ry="12"/>`,'Fessiers','(vue dos)'),
    'Mollets':   t(`<rect x="29" y="154" width="16" height="36" rx="5"/><rect x="55" y="154" width="16" height="36" rx="5"/>`,'Mollets'),
    'Full Body': t(`<ellipse cx="37" cy="56" rx="13" ry="11" opacity="0.55"/><ellipse cx="63" cy="56" rx="13" ry="11" opacity="0.55"/><ellipse cx="20" cy="45" rx="9" ry="8" opacity="0.55"/><ellipse cx="80" cy="45" rx="9" ry="8" opacity="0.55"/><rect x="28" y="100" width="18" height="50" rx="6" opacity="0.55"/><rect x="54" y="100" width="18" height="50" rx="6" opacity="0.55"/><rect x="13" y="46" width="10" height="22" rx="4" opacity="0.55"/><rect x="77" y="46" width="10" height="22" rx="4" opacity="0.55"/>`,'Full Body'),
  };
})();
const _MUSCLE_SVG_F=(function(){
  // Silhouette féminine — épaules étroites, taille marquée, hanches plus larges, suggestion poitrine
  const BDY=`<g fill="var(--bg3)" stroke="var(--sep)" stroke-width="1.2">
<circle cx="50" cy="13" r="10"/>
<path d="M45 23 L55 23 L56 31 L44 31Z"/>
<path d="M31 35 Q50 30 69 35 L68 54 Q61 59 57 62 Q53 66 50 64 Q47 66 43 62 Q39 59 32 54Z"/>
<path d="M32 54 Q23 69 22 93 L78 93 Q77 69 68 54 Q61 59 57 62 Q53 66 50 64 Q47 66 43 62 Q39 59 32 54Z"/>
<path d="M31 35 L22 38 L16 84 L26 86Z"/>
<path d="M69 35 L78 38 L84 84 L74 86Z"/>
<path d="M16 84 L26 86 L25 110 L15 108Z"/>
<path d="M84 84 L74 86 L75 110 L85 108Z"/>
<rect x="23" y="94" width="21" height="50" rx="7"/>
<rect x="56" y="94" width="21" height="50" rx="7"/>
<rect x="25" y="146" width="17" height="37" rx="6"/>
<rect x="58" y="146" width="17" height="37" rx="6"/>
</g>`;
  function t(hl,lbl,note){
    return `<svg viewBox="0 0 100 202" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-height:158px;display:block;margin:0 auto">${BDY}<g fill="#FF2D55" opacity="0.85">${hl}</g><text x="50" y="196" text-anchor="middle" font-size="10" fill="var(--t1)" font-weight="700" font-family="sans-serif">${lbl}</text>${note?`<text x="50" y="201" text-anchor="middle" font-size="7" fill="var(--t3)" font-family="sans-serif">${note}</text>`:''}</svg>`;
  }
  return {
    'Pectoraux': t(`<ellipse cx="37" cy="50" rx="11" ry="10"/><ellipse cx="63" cy="50" rx="11" ry="10"/>`,'Pectoraux'),
    'Dos':       t(`<ellipse cx="37" cy="65" rx="11" ry="13"/><ellipse cx="63" cy="65" rx="11" ry="13"/>`,'Dos','(vue dos)'),
    'Trapèzes':  t(`<path d="M36 27 Q50 21 64 27 L62 48 Q50 52 38 48Z"/>`,'Trapèzes','(vue dos)'),
    'Épaules':   t(`<ellipse cx="22" cy="43" rx="8" ry="7"/><ellipse cx="78" cy="43" rx="8" ry="7"/>`,'Épaules'),
    'Biceps':    t(`<rect x="15" y="45" width="9" height="21" rx="4"/><rect x="76" y="45" width="9" height="21" rx="4"/>`,'Biceps'),
    'Triceps':   t(`<rect x="15" y="45" width="9" height="21" rx="4"/><rect x="76" y="45" width="9" height="21" rx="4"/>`,'Triceps','(vue dos)'),
    'Avant-bras':t(`<rect x="13" y="68" width="9" height="24" rx="4"/><rect x="78" y="68" width="9" height="24" rx="4"/>`,'Avant-bras'),
    'Abdominaux':t(`<rect x="38" y="65" width="24" height="22" rx="4"/>`,'Abdominaux'),
    'Jambes':    t(`<rect x="24" y="95" width="19" height="48" rx="6"/><rect x="57" y="95" width="19" height="48" rx="6"/>`,'Jambes'),
    'Fessiers':  t(`<ellipse cx="36" cy="100" rx="16" ry="13"/><ellipse cx="64" cy="100" rx="16" ry="13"/>`,'Fessiers','(vue dos)'),
    'Mollets':   t(`<rect x="26" y="147" width="15" height="34" rx="5"/><rect x="59" y="147" width="15" height="34" rx="5"/>`,'Mollets'),
    'Full Body': t(`<ellipse cx="37" cy="50" rx="11" ry="10" opacity="0.55"/><ellipse cx="63" cy="50" rx="11" ry="10" opacity="0.55"/><ellipse cx="22" cy="43" rx="8" ry="7" opacity="0.55"/><ellipse cx="78" cy="43" rx="8" ry="7" opacity="0.55"/><rect x="24" y="95" width="19" height="48" rx="6" opacity="0.55"/><rect x="57" y="95" width="19" height="48" rx="6" opacity="0.55"/><rect x="15" y="45" width="9" height="21" rx="4" opacity="0.55"/><rect x="76" y="45" width="9" height="21" rx="4" opacity="0.55"/>`,'Full Body'),
  };
})();
function _groupTemplateSvg(name){
  const ex=EXLIB.find(e=>e.n===exNomCatalogue(name));
  const file=_MUSCLE_FILE[ex?.g]||'muscles/chest.svg';
  return `<div style="text-align:center;padding:6px 0;"><img src="${file}" style="width:140px;height:auto;display:block;margin:0 auto;"></div>`;
}
// Codes muscles (_MG) → image muscle réaliste (PNG anatomie de Michel)
const _MG_IMG={
  pec:'muscles/muscle pectoreaux.png',
  lats:'muscles/muscles dorsaux trapeze.png',
  traps:'muscles/epaule trapeze.png','front-delt':'muscles/epaule trapeze.png','side-delt':'muscles/epaule trapeze.png','rear-delt':'muscles/epaule trapeze.png',
  biceps:'muscles/muscle bras.png',triceps:'muscles/muscle bras.png',forearms:'muscles/muscle bras.png',
  quads:'muscles/muscle avant cuisse.png','hip-flexors':'muscles/muscle avant cuisse.png',
  glutes:'muscles/fessiers ischios.png',hamstrings:'muscles/fessiers ischios.png','lower-back':'muscles/fessiers ischios.png',
  abs:'muscles/muscle abdominaux.png',obliques:'muscles/muscle abdominaux.png',
  calves:'muscles/muscle mollet.png',tibialis:'muscles/muscle mollet.png',
};
// SRC de secours quand un exo n'a pas d'image dédiée : devine le muscle principal depuis le nom
// (moteur _mscScores/_MEX) → image muscle réaliste (PNG anatomie) ; sinon silhouette du groupe.
// → une machine importée (« Chest press machine convergente… ») a TOUJOURS une figurine pertinente.
function _exMuscleImg(name){
  try{
    const {sc}=_mscScores([{name,sets:[{done:true}]}]);
    const top=Object.entries(sc||{}).sort((a,b)=>b[1]-a[1])[0];
    if(top&&_MG_IMG[top[0]])return _MG_IMG[top[0]];
  }catch(e){}
  const ex=EXLIB.find(e=>e.n===exNomCatalogue(name));
  return _MUSCLE_FILE[ex&&ex.g]||'muscles/chest.svg';
}
// Vignette d'exercice : photo locale > image muscle réaliste (muscle deviné du nom) > figurine — 100% hors-ligne
function _progExThumb(name){
  const box='width:46px;height:46px;border-radius:8px;background:var(--bg2);border:1px solid var(--sep);flex-shrink:0;box-sizing:border-box;';
  const cimg=_exImg(name);
  if(cimg) return `<img src="${cimg}" onerror="this.style.visibility='hidden'" style="${box}object-fit:cover;">`;
  // Muscle principal deviné depuis le nom (_MEX, insensible aux accents) → image muscle réaliste
  let src='';
  try{
    const {sc}=_mscScores([{name,sets:[{done:true}]}]);
    const top=Object.entries(sc||{}).sort((a,b)=>b[1]-a[1])[0];
    if(top)src=_MG_IMG[top[0]]||'';
  }catch(e){}
  if(src) return `<img src="${src}" onerror="this.style.visibility='hidden'" style="${box}object-fit:contain;padding:3px;">`;
  // Repli ultime : figurine anatomique colorée
  let fig='';
  try{if(typeof _mscSVGmini==='function')fig=_mscSVGmini(_mscScores([{name,sets:[{done:true}]}])).replace('width:32px','width:38px');}catch(e){}
  return `<div style="${box}display:flex;align-items:center;justify-content:center;overflow:hidden;">${fig}</div>`;
}
function _genderGroupSvg(groupName){
  const svgSet=(S&&S.gender==='F')?_MUSCLE_SVG_F:_MUSCLE_SVG;
  const svg=svgSet[groupName];
  if(!svg)return '';
  return svg
    .replace('width:100%;max-height:158px','height:68px;width:auto;display:block;margin:0 auto')
    .replace(/<text[^>]*>[^<]*<\/text>/g,'');
}

// Vidéos YouTube Demic — {id, s:true si Short, s:false si vidéo normale}
// Images locales d'exercices (GIF/webp/png) — disponibles hors connexion
const EX_YT={
  'Curl Zottman':                  {img:'exercises/curl-zottman.webp'},
  'Curl Poulie':                   {img:'exercises/curl-poulie.webp'},
  'Curl Barre':                    {img:'exercises/curl-barre.webp'},
  'Smith Machine Développé Incliné': {img:'exercises/smith-machine-developpe-incline.webp'},
  'Battle Rope':                   {img:'exercises/battle-rope.webp'},
  'Hyperextension Inverse (Reverse Hyper)': {img:'exercises/hyperextension-inverse-reverse-hyper.webp'},
  'Développé Couché':              {img:'exercises/developpe-couche.webp'},
  'Développé Couché Haltères':     {img:'exercises/developpe-couche-halteres-exercice-musculation.webp'},
  'Smith Machine Développé Couché':{img:'exercises/developpe-couche-smith-machine.webp'},
  'Développé Décliné':             {img:'exercises/developpe-decline-barre.webp'},
  'Développé Incliné':             {img:'exercises/developpe-incline-barre.webp'},
  'Développé Incliné Haltères':    {img:'exercises/developpe-incline-halteres-exercice-musculation.webp'},
  'Écarté Poulie':                 {img:'exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.webp'},
  // ✅ REBRANCHÉ le 25/08 — et c'est le commentaire du 02/08 qui a dit quand le faire.
  // Il disait : « "Écarté Haltères" affichait l'animation de l'écarté DÉCLINÉ (les deux fiches
  // pointaient le même fichier). Aucune animation vaut mieux qu'une fausse ; à rebrancher le
  // jour où on a une vraie démo d'écarté à plat. » ⭐ Ce jour est arrivé : Michel a envoyé la
  // démo du couché à PLAT (25/08), vérifiée image par image avant de la rattacher — banc
  // horizontal, pas décliné. *Un retrait dont la condition de retour est ÉCRITE se referme
  // tout seul le jour venu ; sans cette phrase, on aurait cru à un oubli et remis n'importe
  // quoi* (R30).
  'Écarté Haltères':               {img:'exercises/ecarte-couche-halteres.webp'},
  'Croisé Poulie (Cable Crossover)':{img:'exercises/ecartes-poulie-vis-a-vis.webp'},
  'Pec Deck':                      {img:'exercises/pec-deck-butterfly-exercice-musculation.webp'},
  'Chest Press Machine Horizontale':{img:'exercises/developpe-machine-assis-pectoraux.webp'},
  'Chest Press Machine Inclinée':  {img:'exercises/developpe-incline-machine-convergente-exercice-musculation.webp'},
  'Dips':                          {img:'exercises/dips-pectoraux.webp'},
  'Pont Fessier (Glute Bridge)':   {img:'exercises/glute-bridge.webp'},
  'Press Jambes 45°':              {img:'exercises/presse-a-cuisse-exercice-musculation.webp'}, // animation (zip Michel 01/08) — remplace la photo fixe
  'Press Jambes Horizontale':      {img:'machine/press-jambes-2.jpg'},
  'Press Jambes Verticale':        {img:'exercises/presse-a-cuisses-verticale.webp'}, // animation (zip Michel 01/08)
  'Press Jambes Inclinée':         {img:'exercises/presse-a-cuisses-inclinee.webp'}, // animation (zip Michel 01/08)
  'Squat Hack (Hack Squat)':       {img:'exercises/hack-squat.webp'}, // animation (zip Michel 01/08)
  'Press Jambes Levier':           {img:'machine/press-jambes-6.jpg'},
  // ── Fessiers / Ischios / Jambes / Soulevés de terre (lot 2026-07-04) ──
  'Soulevé de Terre':              {img:'exercises/souleve-de-terre.webp'},
  'Soulevé de Terre Sumo':         {img:'exercises/souleve-de-terre-sumo.webp'},
  'Tirage en Rack (Rack Pull)':    {img:'exercises/rack-pull.webp'},
  'Inclinaison Lombaire (Good Morning)':{img:'exercises/good-morning-exercice.webp'},
  'Hyperextension (Back Extension)':{img:'exercises/extension-lombaire-au-banc-45.webp'},
  'Squat à la Barre':              {img:'exercises/homme-faisant-un-squat-avec-barre.webp'},
  'Squat Avant':                   {img:'exercises/squat-barre-devant-front.webp'}, // la vraie version BARRE (zip Michel 01/08 — avant : version haltères)
  'Squat Gobelet (Goblet Squat)':  {img:'exercises/squat-goblet-kettlebell.webp'},
  /* ⛔⛔ « Squat Sumo » N'EST PLUS AU CATALOGUE (25/08/2026, décision Michel : « squat sumo
     on supprime »). L'entrée d'image a donc disparu avec lui, et le fichier
     `exercises/squat-sumo-avec-haltere.webp` a été retiré du dépôt ET du cache du service
     worker — il y dormait depuis le 13/08 et était téléchargé par tout le monde pour rien.
     HISTORIQUE, pour ne pas le redécouvrir : le 13/08 l'image avait déjà été retirée parce
     qu'elle montrait un HALTÈRE entre les jambes, c'est-à-dire le geste du « Squat Gobelet »
     qui existe déjà. On attendait une figurine À LA BARRE ; elle n'est jamais venue, et au
     bout de 12 jours Michel a préféré retirer l'exercice. ⭐ Son identifiant `squat-sumo`
     survit dans EX_IDS : les séances déjà faites gardent tout. */
  'Fentes':                        {img:'exercises/fente-avant-barre-femme.webp'},
  'Leg Curl Couché Machine':       {img:'exercises/leg-curl-allonge.webp'},
  'Curl Ischio-jambiers (Leg Curl)':{img:'exercises/leg-curl-allonge.webp'},
  'Leg Curl Assis Machine':        {img:'exercises/leg-curl-assis-machine.webp'},
  // Nouveaux exercices (figurines fournies)
  'Soulevé de Terre Jambes Tendues':{img:'exercises/souleve-de-terre-jambes-tendues.webp'},
  'Soulevé de Terre Roumain Kettlebell':{img:'exercises/souleve-de-terre-roumain-kettlebell.webp'},
  'Soulevé de Terre Roumain Landmine':{img:'exercises/souleve-de-terre-roumain-landmine.webp'},
  'Soulevé de Terre Sumo Haltères':{img:'exercises/deadlift-sumo-halteres-exercice-jambes-fessiers.webp'},
  'Soulevé de Terre Sumo Kettlebell':{img:'exercises/souleve-de-terre-sumo-kettlebell.webp'},
  'Soulevé de Terre Sumo Landmine':{img:'exercises/souleve-de-terre-sumo-landmine.webp'},
  'Soulevé de Terre Trap Bar':     {img:'exercises/souleve-de-terre-a-la-trap-bar.webp'},
  'Soulevé de Terre avec Déficit': {img:'exercises/souleve-de-terre-avec-deficit.webp'},
  'Soulevé de Terre Machine':      {img:'exercises/souleve-de-terre-avec-machine.webp'},
  'Zercher Deadlift':              {img:'exercises/zercher-deadlift.webp'},
  'Reeves Deadlift':               {img:'exercises/reeves-deadlift.webp'},
  'Glute Ham Raise (GHD)':         {img:'exercises/glute-ham-developer-ghd.webp'},
  'Kettlebell Swing':              {img:'exercises/kettlebell-swing.webp'},
  'Squat Pistol':                  {img:'exercises/squat-pistol.webp'},
  'Squat Kettlebell':              {img:'exercises/kettlebell-back-squat.webp'},
  'Fentes Kettlebell':             {img:'exercises/fentes-avant-kettlebell.webp'},
  'Leg Curl Élastique':            {img:'exercises/leg-curl-avec-elastique-musculation.webp'},
  'Leg Curl Haltère':              {img:'exercises/leg-curl-decline-haltere.webp'},
  'Leg Curl Inversé':              {img:'exercises/leg-curl-inverse-machine-tirage-vertical.webp'},
  'Leg Curl Unilatéral Debout':    {img:'exercises/leg-curl-unilateral-debout-machine.webp'},
  // ── Dos / Trapèzes / Lombaires (lot 2026-07-04) ──
  'Rowing Barre (Tirage Horizontal)':                  {img:'exercises/rowing-barre.webp'},
  // Fourni par Michel le 08/08/2026 (GIF 700×700, 764 Ko) → converti en WebP animé 480 px, 111 Ko :
  // 85 % de moins, au format des 283 autres (médiane 96 Ko). Un GIF brut dans le dossier ferait
  // grossir le cache du service worker pour rien — l'app doit s'ouvrir vite, même en 4G (règle d'or #4).
  'Rowing Yates (Supination)':                         {img:'exercises/rowing-yates-barre.webp'},
  'Rowing Haltère (Tirage Horizontal)':                {img:'exercises/rowing-haltere-un-bras.webp'},
  'Rowing Câble (Tirage Horizontal)':                  {img:'exercises/tirage-horizontal-poulie.webp'},
  'Rowing Machine (Tirage Horizontal)':                {img:'exercises/rowing-assis-machine-prise-pronation.webp'},
  'Rowing Hammer Strength':        {img:'exercises/rowing-assis-machine-hammer-strenght.webp'},
  'Rowing Poitrine Appuyée (Chest Supported)':{img:'exercises/rowing-halteres-banc-incline-prise-neutre.webp'},
  'Tirage Poulie Haute (Lat Pulldown)':           {img:'exercises/tirage-vertical-poitrine.webp'},
  'Tirage Poulie Haute Prise Serrée':{img:'exercises/tirage-vertical-prise-serree.webp'},
  'Tirage Poulie Basse Prise Large':{img:'exercises/tirage-horizontal-prise-large.webp'},
  // ⚠️ NE PAS CONFONDRE AVEC `tirage-vertical-prise-serree.webp` (ligne au-dessus) : celui-là est
  // la poulie HAUTE. Ici c'est la poulie BASSE, assis, poignée en V — envoi Michel 25/08, il
  // l'appelle « tirage horizontal prise serrée ». Vérifié image par image avant de la rattacher :
  // montrer l'animation d'un AUTRE exercice est pire que n'en montrer aucune (R29).
  'Tirage Poulie Basse Prise Serrée':{img:'exercises/tirage-horizontal-poulie-prise-serree.webp'},
  // ⚠️ CORRIGÉ le 01/08 : cette ligne portait `traction-musculation-dos.webp`, qui montre une
  // traction CLASSIQUE sans lest. La cause : « Tractions (Pull-up) » n'existait pas au catalogue,
  // la démo de la traction de base s'était donc posée sur la variante lestée, faute de place.
  // Les deux ont maintenant chacune la leur (nouveau nom de fichier — cache d'images, ft-v437).
  'Traction Lestée':               {img:'exercises/traction-lestee-vraie.webp'},
  'Tractions (Pull-up)':           {img:'exercises/traction-musculation-dos.webp'},
  'Traction Assistée':             {img:'exercises/traction-assistee-machine.webp'},
  'Traction Prise Neutre':         {img:'exercises/traction-prise-neutre.webp'},
  'Pull-over Haltère':             {img:'exercises/pullover-haltere.webp'},
  'Pullover Machine':              {img:'exercises/musculation-pull-over-assis-machine.webp'},
  'Haussements d\'Épaules Barre':  {img:'exercises/shrug-barre.webp'},
  'Haussements d\'Épaules Haltères':{img:'exercises/shrugs-avec-halteres.webp'},
  'Haussements d\'Épaules Câble':  {img:'exercises/shrug-poulie-haussement-epaules.webp'},
  'Hyperextension Machine':        {img:'exercises/extension-lombaire-a-la-machine.webp'},
  // Nouveaux exercices Dos/Trapèzes/Lombaires
  'Rowing Smith Machine':          {img:'exercises/rowing-smith-machine.webp'},
  'Rowing T-Bar Machine':          {img:'exercises/rowing-t-bar-machine.webp'},
  'Rowing Landmine (T-Bar)':       {img:'exercises/rowing-barre-t-landmine.webp'},
  'Rowing Haltères Buste Penché':  {img:'exercises/bent-over-row-avec-halteres.webp'},
  'Meadows Row':                   {img:'exercises/rowing-unilateral-landmine-meadows-row.webp'},
  'Seal Row':                      {img:'exercises/seal-row-halteres.webp'},
  'Renegade Row':                  {img:'exercises/renegade-row.webp'},
  'Tirage Iso-Latéral Hammer Strength':{img:'exercises/tirage-avant-iso-laterale-hammer-strength.webp'},
  'Tirage Incliné Poulie Haute':   {img:'exercises/tirage-incline-poulie-haute.webp'},
  'Tirage Poulie Haute Prise Inversée':{img:'exercises/tirage-vertical-prise-inversee.webp'},
  'Traction Derrière la Nuque':    {img:'exercises/traction-barre-derriere-rear-oull-up.webp'},
  'Rocky Pull-up':                 {img:'exercises/rocky-pull-up.webp'},
  'Sled Pull':                     {img:'exercises/sled-pull.webp'},
  'Pull-over Barre':               {img:'exercises/pull-over-barre.webp'},
  'Pull-over Poulie':              {img:'exercises/pull-over-poulie.webp'},
  'Superman':                      {img:'exercises/superman.webp'},
  // Fournie en PNG FIXE et TRANSPARENT (08/08), avec les deux poses côte à côte. Trois corrections
  // avant intégration, chacune trouvée en mesurant l'existant plutôt qu'en supposant :
  //   ① fond APLATI sur blanc — les 296 autres images ont un fond blanc opaque, et l'app est sombre
  //      par défaut : laissée transparente, la figurine serait apparue sur fond noir, seule du lot ;
  //   ② rendue ANIMÉE (demande de Michel) — les deux poses découpées et alignées sur la marche, qui
  //      ne bouge donc pas d'une image à l'autre ;
  //   ③ recadrée en CARRÉ. La première version faisait 184×480 (rapport 0,38), la plus étroite des
  //      296 — or la vignette est un carré en `object-fit:cover` (ligne ~508) : elle aurait ROGNÉ
  //      la tête et la marche. La médiane des autres images est 1,00 : ce n'est pas un hasard.
  // 185 Ko → 16 Ko.
  'Jefferson Curl':                {img:'exercises/jefferson-curl.webp'},
  'Haussements d\'Épaules Overhead':{img:'exercises/overhead-shrug.webp'},
  // ── Cuisses / Quadriceps (lot 2026-07-04) ──
  'Squat Bulgare':                 {img:'exercises/squat-bulgare-halteres-exercice-musculation.webp'},
  'Smith Machine Squat':           {img:'exercises/squat-smith-machine-exercice-musculation.webp'},
  'Extension Quadriceps (Leg Extension)':{img:'exercises/leg-extension-exercice-musculation.webp'},
  'Fentes Marchées':               {img:'exercises/fentes-marchees-avec-sandbag.webp'},
  'Smith Machine Fentes':          {img:'exercises/split-squat-smith-machine.webp'},
  'Hip Thrust Machine (Poussée de Hanche)':     {img:'exercises/hip-thrust-a-la-machine.webp'},
  'Farmer\'s Walk':                {img:'exercises/marche-du-fermier-avec-kettlebells.webp'},
  // Nouveaux exercices cuisses
  'Extension Quadriceps Unilatérale':{img:'exercises/leg-extension-iso-lateral-unilateral-hammer-strenght.webp'},
  'Hack Squat Inversé':            {img:'exercises/hack-squat-inverse.webp'},
  'Pendulum Squat':                {img:'exercises/pendulum-squat.webp'},
  'Belt Squat':                    {img:'exercises/belt-squat.webp'},
  'Safety Bar Squat':              {img:'exercises/safety-bar-squat.webp'},
  'Overhead Squat':                {img:'exercises/overhead-squat.webp'},
  'Pin Squat':                     {img:'exercises/pin-squat.webp'},
  'Sissy Squat':                   {img:'exercises/sissy-squat.webp'},
  'Cossack Squat':                 {img:'exercises/cossack-squat.webp'},
  'Squat Bande Élastique':         {img:'exercises/squat-bande-elastique.webp'},
  'Chaise (Wall Sit)':             {img:'exercises/squat-statique-contre-mur-exercice-chaise.webp'},
  'Presse à Cuisses Iso-Latérale': {img:'exercises/presse-cuisse-iso-laterale-hammer-stenght.webp'},
  'Sled Push':                     {img:'exercises/sled-push-hyrox.webp'},
  'Croix de Fer Haltères':         {img:'exercises/croix-de-fer-halteres.webp'},
  // ⚠️ Fichiers -v2 (01/08/2026, l'œil de Michel en séance) : les DEUX animations d'origine
  // étaient INVERSÉES à la source (le fichier « abduction » montrait une adduction et vice
  // versa). Renommés en -v2 plutôt que permutés sur place : le cache d'images des téléphones
  // (ft-images, jamais vidé) aurait continué de servir l'ancienne image inversée à l'infini.
  'Abduction Cuisses (Leg Abduction)':{img:'exercises/leg-abduction-machine-v2.webp'},
  'Adduction Cuisses (Leg Adduction)':{img:'exercises/leg-adduction-machine-v2.webp'},
  'Chest Press Machine Déclinée':  {img:'exercises/chest-press-machine-declinee.webp'},
  'Dips Triceps (Buste Droit)':    {img:'exercises/dips-triceps-paralleles.webp'},
  'Montée sur Box (Step-up)':      {img:'exercises/montee-sur-box-barre.webp'}, // version barre (envoi Michel 01/08)
  'Montée sur Box Haltères':       {img:'exercises/montee-sur-box-halteres-classique.webp'}, // la montée CLASSIQUE remplace l'ancienne démo latérale (01/08)
  'Dips Machine Assistée':         {img:'exercises/dips-assiste-machine.webp'},
  'Dips Assis Machine (Seated Dip)':{img:'exercises/dips-assis-machine-avec-poids.webp'},
  'Développé Nuque':               {img:'exercises/developpe-nuque-barre-guidee.webp'},
  // ── Épaules + Trapèzes (lot 2026-07-06) ──
  'Développé Arnold (Arnold Press)':{img:'exercises/developpe-arnold-exercice-musculation.webp'},
  'Développé Militaire Haltères':{img:'exercises/developpe-epaule-halteres.webp'},
  'Développé Militaire':{img:'exercises/developpe-militaire-exercice-musculation.webp'},
  'Élévations Latérales Machine':{img:'exercises/elevation-laterale-machine.webp'},
  'Élévations Frontales':{img:'exercises/elevations-frontales-exercice-musculation.webp'},
  'Élévations Latérales (Lateral Raise)':{img:'exercises/elevations-laterales-exercice-musculation.webp'},
  'Élévations Latérales Câble':{img:'exercises/elevations-laterales-poulie.webp'},
  'Tirage Visage (Face Pull)':{img:'exercises/face-pull.webp'},
  'Machine Oiseau':{img:'exercises/pec-deck-inverse.webp'},
  'Développé Épaules Machine':{img:'exercises/presse-epaule-exercice-musculation.webp'},
  'Y Raise / W Raise':{img:'exercises/elevation-en-y-a-la-poulie.webp'},
  'Oiseau':{img:'exercises/oiseau-assis-sur-banc.webp'},
  'Tirage Menton':{img:'exercises/tirage-menton-machine-guidee.webp'},
  'Tirage Menton Kettlebell':{img:'exercises/tirage-menton-avec-kettlebell.webp'},
  'Développé Épaules Kettlebell':{img:'exercises/developpe-epaule-avec-kettlebell.webp'},
  'Développé Landmine (Épaules)':{img:'exercises/developpe-landmine.webp'},
  'Écarté Arrière Élastique':{img:'exercises/ecarte-arriere-elastique.webp'},
  'Élévation Frontale Allongée Barre':{img:'exercises/elevation-frontale-allongee-a-la-barre.webp'},
  'Élévation Latérale Poulie Inclinée':{img:'exercises/elevation-laterale-a-la-poulie-en-inclinaison.webp'},
  'Élévation Latérale Landmine':{img:'exercises/elevation-laterale-landmine-exercice-musculation.webp'},
  'Élévations Latérales Kettlebell':{img:'exercises/elevation-laterales-avec-kettlebell.webp'},
  'Rotation Interne Épaule Élastique':{img:'exercises/exercice-rotation-interne-epaule-elastique-renforcement-coiffe-rotateurs-prevention-blessures-musculation.webp'},
  'Face Pull Couché Poulie':{img:'exercises/face-pull-couche-a-la-poulie.webp'},
  'Oiseau Poulie 45°':{img:'exercises/oiseau-a-la-poulie-a-45.webp'},
  'Passage d\'Épaule Élastique':{img:'exercises/passage-depaule-avec-elastique.webp'},
  // Deux exercices qui n'avaient AUCUNE démo — trouvées dans le dossier source de Michel (01/08) :
  'Clean & Jerk':{img:'exercises/epaule-jete-halterophilie.webp'},
  // ⚠️ CORRIGÉ le 01/08 : cette ligne pointait sur `shrug-machine-mollets.webp` — une animation qui
  // montre un HAUSSEMENT D'ÉPAULES (trapèzes en rouge) fait SUR la machine à mollets, pas une
  // élévation de mollets. Le nom du fichier le disait déjà. Erreur posée en ft-v693, repérée en
  // vérifiant le contenu à l'arrivée du vrai fichier. L'ancien fichier reste sur le disque, débranché.
  // (Nouveau NOM de fichier obligatoire : le cache d'images des téléphones ne se vide jamais — ft-v437.)
  'Mollets Machine Debout':{img:'exercises/elevations-mollets-debout-machine.webp'},
  'Mollets Machine Assise':{img:'exercises/elevations-mollets-assis-machine.webp'},
  'Élévations Mollets Penché (Donkey Calf Raise)':{img:'exercises/elevations-mollets-donkey.webp'},
  'Presse Mollets (Leg Press)':{img:'exercises/elevations-mollets-presse-45.webp'},
  // Les 14 exercices AJOUTÉS au catalogue le 01/08 (animations du dossier source de Michel) :
  'Pompes (Push-up)':{img:'exercises/pompe-musculation.webp'},
  'Hip Thrust Barre (Poussée de Hanche)':{img:'exercises/hip-thrust-barre.webp'}, // la version BARRE (envoi Michel 01/08 — la machine, elle, vit sur « Poussée de Hanche Machine »)
  'Pompes Déficit (Deficit Push-up)':{img:'exercises/pompes-deficit.webp'},
  'Pompes Diamant':{img:'exercises/pompes-diamant.webp'},
  'Pompes Lestées':{img:'exercises/pompes-lestees.webp'},
  'Développé Couché avec Chaînes':{img:'exercises/developpe-couche-avec-chaines.webp'},
  'Développé Couché Larsen (Larsen Press)':{img:'exercises/developpe-couche-larsen.webp'},
  'Développé Couché Unilatéral Kettlebell':{img:'exercises/developpe-couche-unilateral-kettlebell.webp'},
  'Développé Incliné Poulie':{img:'exercises/developpe-incline-poulie.webp'},
  'Écarté Incliné Haltères':{img:'exercises/ecartes-incline-avec-halteres.webp'},
  'Écarté Décliné Haltères':{img:'exercises/ecartes-decline-avec-halteres.webp'},
  'Développé Décliné Haltères':{img:'exercises/developpe-decline-halteres.webp'},
  'Soulevé de Terre Roumain Barre':{img:'exercises/souleve-de-terre-roumain-barre.webp'},
  // Roumain Haltères : animation FABRIQUÉE (01/08) depuis l'infographie de Michel (2 poses + fondu)
  // — la vraie animation 12 images n'existe pas chez sa source ; à remplacer si elle apparaît un jour.
  'Soulevé de Terre Roumain Haltères':{img:'exercises/souleve-de-terre-roumain-halteres.webp'},
  'Soulevé de Terre Roumain Unilatéral':{img:'exercises/souleve-de-terre-roumain-unilateral.webp'}, // style vidéo sombre (seule dispo) — à remplacer si mieux un jour
  'Hip Thrust Unilatéral (Poussée de Hanche)':{img:'exercises/hip-thrust-barre-unilateral.webp'},
  // Lots « cardio » et « chariot » du 01/08 — dont 4 exercices du catalogue qui n'avaient AUCUNE
  // démo (Burpees, Sauts à la Corde, Grimpeur, Box Jump) : le cardio était le parent pauvre.
  'Burpees':{img:'exercises/burpees.webp'},
  'Sauts à la Corde':{img:'exercises/sauts-a-la-corde.webp'},
  'Grimpeur (Mountain Climber)':{img:'exercises/grimpeur-mountain-climber.webp'},
  // ─── Abdominaux illustrés le 08/08/2026 (archive fournie par Michel) ──────────────────────
  // Le groupe le plus démuni du catalogue : 16 exercices sur 19 sans démonstration, alors que
  // ce sont les mouvements des débutants. Chaque image a été VUE avant d'être inscrite (planche
  // de vignettes), jamais rattachée sur la foi du nom de fichier.
  // GIF 700×700 (~700 Ko) → WebP animé 480 px : 7,1 Mo devenus 902 Ko, −88 %, animation intacte
  // (règle d'or #4 : l'app doit s'ouvrir vite, même en 4G).
  'Crunch':                     {img:'exercises/crunch-au-sol.webp'},
  'Crunch Machine':             {img:'exercises/crunch-machine.webp'},
  'Crunch Poulie':              {img:'exercises/crunch-poulie-haute.webp'},
  'Drapeau (Dragon Flag)':      {img:'exercises/dragon-flag.webp'},
  'Gainage':                    {img:'exercises/planche-gainage.webp'},
  'Hollow Body':                {img:'exercises/hollow-hold.webp'},
  'Planche Latérale (Side Plank)':{img:'exercises/planche-laterale.webp'},
  'Roue Abdominale (Ab Wheel)': {img:'exercises/roue-abdominale.webp'},
  'Chaise Romaine':             {img:'exercises/chaise-romaine-releve-jambes.webp'},
  'Relevé de Jambes':           {img:'exercises/releve-de-jambes-suspendu.webp'},
  // ⚠️ Rattaché en DEUXIÈME lecture, après correction de Michel. À la vignette j'avais lu « rotation
  // assise sur un banc » et je l'avais écartée ; en zoomant, la personne est assise AU SOL, buste
  // incliné en arrière, **pieds bloqués sous les cales du banc**, un disque en main. Le banc ne sert
  // qu'à caler les pieds : c'est la rotation russe classique. Une vignette de 200 px ne suffit pas
  // toujours — quand un détail décide du rattachement, il faut zoomer.
  'Rotation Russe (Russian Twist)':{img:'exercises/rotation-russe.webp'},
  'Box Jump':{img:'exercises/box-jump.webp'},
  'Assault Air Bike':{img:'exercises/assault-air-bike.webp'},
  'Ergomètre de Ski (Ski Erg)':{img:'exercises/ergometre-de-ski.webp'},
  'Jumping Jack':{img:'exercises/jumping-jack.webp'},
  'Marche de l\'Ours (Bear Crawl)':{img:'exercises/marche-de-lours-bear-crawl.webp'},
  'Wall Ball':{img:'exercises/wall-ball.webp'},
  'Chariot de Puissance — Poussée':{img:'exercises/chariot-poussee.webp'},
  'Chariot de Puissance — Tirage en Avançant':{img:'exercises/chariot-tirage-avance.webp'},
  'Chariot de Puissance — Tirage Dos':{img:'exercises/chariot-tirage-dos.webp'},
  'Chariot de Puissance — Tirage de Côté':{img:'exercises/chariot-tirage-de-cote.webp'},
  'Chariot de Puissance — Tirage Inversé Jambes':{img:'exercises/chariot-tirage-inverse-jambes.webp'},
  'Chariot de Puissance — Tirage Épaules':{img:'exercises/chariot-tirage-epaules.webp'},
  'Chariot de Puissance — Fentes Arrière':{img:'exercises/chariot-fentes-arriere.webp'},
  'Chariot de Puissance — Curl Biceps':{img:'exercises/chariot-curl-biceps.webp'},
  'Chariot de Puissance — Extension Triceps':{img:'exercises/chariot-extension-triceps.webp'},
  // Lots « dos », « épaules » et « pecs » du 01/08 (fin de soirée) — beaucoup d'ÉLASTIQUE et de
  // TRX : le matériel est dans le nom, une vignette élastique sur l'exercice classique mentirait.
  'Traction Supination (Chin-up)':{img:'exercises/traction-supination-chin-up.webp'},
  'Muscle-up':{img:'exercises/muscle-up.webp'},
  'Tractions aux Anneaux':{img:'exercises/tractions-aux-anneaux.webp'},
  'Traction Australienne (Poids du Corps)':{img:'exercises/traction-australienne.webp'},
  'Traction Assistée avec Banc':{img:'exercises/traction-assistee-avec-banc.webp'},
  'Suspension Passive (Dead Hang)':{img:'exercises/suspension-passive-dead-hang.webp'},
  'Rowing Inversé sous une Table':{img:'exercises/rowing-inverse-sous-table.webp'},
  'Rowing Buste Penché Élastique':{img:'exercises/rowing-buste-penche-elastique.webp'},
  'Rowing Horizontal Élastique':{img:'exercises/rowing-horizontal-elastique.webp'},
  'Rowing Unilatéral Élastique':{img:'exercises/rowing-unilateral-elastique.webp'},
  'Tirage Vertical Alterné Élastique':{img:'exercises/tirage-vertical-alterne-elastique.webp'},
  'Rowing TRX (Sangles)':{img:'exercises/rowing-trx-sangles.webp'},
  'Traction Australienne TRX (Sangles)':{img:'exercises/traction-australienne-trx-sangles.webp'},
  'Bird Dog':{img:'exercises/bird-dog.webp'},
  'Extension Lombaire sur Ballon':{img:'exercises/extension-lombaire-ballon.webp'},
  'Planche Inversée':{img:'exercises/planche-inversee.webp'},
  'Développé Épaules Élastique':{img:'exercises/developpe-epaules-elastique.webp'},
  'Développé Épaules Assis Élastique':{img:'exercises/developpe-epaules-assis-elastique.webp'},
  'Développé Épaules Unilatéral Élastique':{img:'exercises/developpe-epaules-unilateral-elastique.webp'},
  'Élévations Latérales Unilatérale Poulie':{img:'exercises/elevations-laterales-unilaterale-poulie.webp'},
  'Oiseau Élastique':{img:'exercises/oiseau-elastique.webp'},
  'Oiseau Inversé TRX (Sangles)':{img:'exercises/oiseau-inverse-trx-sangles.webp'},
  'Rotation Externe Épaule Poulie':{img:'exercises/rotation-externe-epaule-poulie.webp'},
  'Handstand Push-up Suspendu (Sangles)':{img:'exercises/handstand-push-up-suspendu.webp'},
  'Développé Couché au Sol (Floor Press)':{img:'exercises/developpe-couche-au-sol-floor-press.webp'},
  'Développé Couché Élastique':{img:'exercises/developpe-couche-elastique.webp'},
  'Développé Décliné Élastique':{img:'exercises/developpe-decline-elastique.webp'},
  'Écarté Poulie Haute à Genoux':{img:'exercises/ecarte-poulie-haute-a-genoux.webp'},
  'Écarté Élastique':{img:'exercises/ecarte-elastique.webp'},
  'Écarté TRX (Sangles)':{img:'exercises/ecarte-trx-sangles.webp'},
  'Chest Press TRX (Sangles)':{img:'exercises/chest-press-trx-sangles.webp'},
  'Pompes Inclinées TRX (Sangles)':{img:'exercises/pompes-inclinees-trx-sangles.webp'},
  // Lot « triceps » du 01/08 — ① 11 exercices du catalogue qui n'avaient AUCUNE démo (le plus gros
  // rattrapage du soir : la famille triceps était presque entièrement muette) ; ② 11 nouveaux.
  // Restent volontairement SANS démo, faute de fichier correspondant : Dips Lestés · Skull Crusher
  // Barre EZ · Triceps Corde Poulie (pushdown à la corde) — mieux vaut aucune vignette qu'une fausse.
  'Bench Dips':{img:'exercises/bench-dips-sur-banc.webp'},
  'Extension Nuque Haltère':{img:'exercises/extension-nuque-haltere-assis.webp'},
  'Extension Nuque Poulie Haute':{img:'exercises/extension-nuque-poulie-haute-corde.webp'},
  'Extension Triceps':{img:'exercises/extension-triceps-verticale-haltere.webp'},
  'Extension Triceps Arrière (Kickback)':{img:'exercises/triceps-kickback-debout-halteres.webp'},
  'Extension Triceps Couché Haltères':{img:'exercises/extension-triceps-couche-halteres.webp'},
  'Triceps Poulie':{img:'exercises/triceps-poulie-haute-barre.webp'},
  'Triceps Machine':{img:'exercises/triceps-machine.webp'},
  'Triceps Poulie Basse':{img:'exercises/triceps-poulie-basse-verticale.webp'},
  'Dips aux Anneaux':{img:'exercises/dips-aux-anneaux.webp'},
  'Dips entre Deux Bancs':{img:'exercises/dips-entre-deux-bancs.webp'},
  'Tate Press':{img:'exercises/tate-press.webp'},
  'Handstand Push-up (ATR)':{img:'exercises/handstand-push-up.webp'},
  'Extension Triceps Banc Incliné Haltères':{img:'exercises/extension-triceps-banc-incline-halteres.webp'},
  'Extension Triceps Décliné Haltères':{img:'exercises/extension-triceps-decline-halteres.webp'},
  'Extension Triceps Concentrée Poulie':{img:'exercises/extension-triceps-concentree-poulie.webp'},
  'Extension Triceps Nuque Élastique':{img:'exercises/extension-triceps-nuque-elastique.webp'},
  'Extension Triceps Verticale Élastique':{img:'exercises/extension-triceps-verticale-elastique.webp'},
  'Extension Triceps TRX (Sangles)':{img:'exercises/extension-triceps-trx-sangles.webp'},
  'Extension Triceps Allongée TRX (Sangles)':{img:'exercises/extension-triceps-trx-allonge.webp'},
  // Lot « quadri » du 01/08 : 16 exercices qui ENTRENT au catalogue avec leur animation (8 vrais
  // manquants + 5 élastique + 3 TRX). Le matériel est dans le nom — une vignette élastique sur un
  // exercice classique mentirait sur l'exercice (leçon du curl incliné poulie, ft-v703).
  'Squat Poids du Corps (Air Squat)':{img:'exercises/squat-poids-du-corps-air-squat.webp'},
  'Fentes Croisées (Curtsy Lunge)':{img:'exercises/fentes-croisees-curtsy-lunge.webp'},
  'Jefferson Squat':{img:'exercises/jefferson-squat.webp'},
  'Soulevé de Terre Valise (Suitcase)':{img:'exercises/souleve-de-terre-valise.webp'},
  'Squat Sauté (Jump Squat)':{img:'exercises/squat-saute-jump-squat.webp'},
  'Squat avec Rotation du Tronc':{img:'exercises/squat-avec-rotation-du-tronc.webp'},
  'Sissy Squat Machine':{img:'exercises/sissy-squat-machine.webp'},
  'Extension Quadriceps Unilatérale Machine à Dips':{img:'exercises/extension-quadriceps-unilaterale-machine-dips.webp'},
  'Squat Bulgare Élastique':{img:'exercises/squat-bulgare-elastique.webp'},
  'Extension Quadriceps Élastique':{img:'exercises/extension-quadriceps-elastique.webp'},
  'Overhead Squat Élastique':{img:'exercises/overhead-squat-elastique.webp'},
  'Split Squat Élastique (Fente Statique)':{img:'exercises/split-squat-elastique.webp'},
  'Squat Barre avec Bandes Élastiques':{img:'exercises/squat-barre-avec-bandes-elastiques.webp'},
  'Squat TRX (Sangles)':{img:'exercises/squat-trx-sangles.webp'},
  'Split Squat TRX (Sangles)':{img:'exercises/split-squat-trx-sangles.webp'},
  'Squat Pistol TRX (Sangles)':{img:'exercises/squat-pistol-trx-sangles.webp'},
  // Lot mollets + triceps (01/08, envoi du soir) — chaque animation vérifiée AVANT branchement :
  // le « barre au front » est bien la version allongée au banc (skull crusher), et les deux mollets
  // sont les versions BARRE (debout sur les épaules / assis barre sur les genoux). Le mouvement est
  // le même que sur machine → branchés sur les exercices génériques existants, rien à créer.
  'Barre au Front':{img:'exercises/barre-au-front-triceps.webp'},
  'Élévations Mollets Debout':{img:'exercises/elevations-mollets-debout-barre.webp'},
  'Élévations Mollets Assis':{img:'exercises/elevations-mollets-assis-barre.webp'},
  // Lot biceps (01/08) : 6 branchements + 2 nouveaux exercices
  'Curl Haltères':{img:'exercises/curl-halteres-alterne.webp'},
  'Curl Incliné':{img:'exercises/curl-haltere-incline.webp'},
  'Curl Concentré':{img:'exercises/curl-concentre.webp'},
  'Curl Araignée (Spider Curl)':{img:'exercises/curl-araignee-spider.webp'},
  'Marteau':{img:'exercises/curl-marteau.webp'},
  'Curl Pupitre Machine':{img:'exercises/curl-pupitre-machine.webp'},
  'Curl Pupitre Barre EZ (Larry Scott)':{img:'exercises/curl-pupitre-barre-ez-larry-scott.webp'},
  'Waiter Curl':{img:'exercises/waiter-curl.webp'},
  'Écarté Hyght (Hyght Fly)':{img:'exercises/hyght-dumbell-fly.webp'},
  'Hex Press Smith Machine':{img:'exercises/hex-press-a-la-smith-machine.webp'},
  'Chest Press Poulie Assis':{img:'exercises/chest-press-poulie-assis.webp'},
  'Svend Press (Serrage de Plaque)':{img:'exercises/svend-press.webp'},
  'Presse à Cuisses sur le Côté':{img:'exercises/presse-a-cuisse-sur-le-cote.webp'},
  'Hack Squat Assis':{img:'exercises/hack-squat-assis.webp'},
  'Overhead Squat Haltères':{img:'exercises/overhead-squat-halteres.webp'},
  'Arraché Debout (Muscle Snatch)':{img:'exercises/muscle-snatch-halterophilie.webp'},
  'Rotation Externe Épaule Abduction':{img:'exercises/rotation-externe-de-epaule-en-abduction.webp'},
  'Rotation Externe Épaule Élastique':{img:'exercises/rotation-externe-epaule-exercice-renforcement-elastique.webp'},
  'Rotation Interne 90° Poulie':{img:'exercises/rotation-interne-a-90-a-la-poulie.webp'},
  // ── Épaules + Trapèzes — 2e partie (lot 2026-07-06) ──
  'Smith Machine Développé Militaire':{img:'exercises/developpe-epaules-smith-machine.webp'},
  'Élévations Frontales Câble':{img:'exercises/elevation-frontale-poulie-basse.webp'},
  'Élévation Frontale Banc Incliné':{img:'exercises/elevation-frontale-banc-incline.webp'},
  'Élévation Latérale Inclinée Haltère':{img:'exercises/elevation-laterale-incline-haltere.webp'},
  'Rotation Externe Épaule Haltère':{img:'exercises/rotation-externe-epaule-haltere.webp'},
  'Développé Épaules Assis Machine (Shoulder Press)':{img:'exercises/shoulder-press-machine.webp'},
  'Tirage Menton Élastique':{img:'exercises/tirage-menton-avec-elastique.webp'},
  'Thruster':{img:'exercises/thruster.webp'},
  'Thruster Kettlebell':{img:'exercises/thruster-kettlebell.webp'},
  'Russian Twist Développé Épaules':{img:'exercises/russian-twist-avec-developpe-epaule.webp'},
  'Développé Haltères Assis':{img:'exercises/developpe-halteres-assis.webp'},   // 2 poses animées — banc incliné, deltoïde ANTÉRIEUR en rouge (vérifié au zoom, 09/08)
  'Skull Crusher Barre EZ':{img:'exercises/skull-crusher-barre-ez.webp'},   // 2 poses animées — barre EZ, ondulation vérifiée au zoom (09/08)
  'Extension Fessiers Arrière (Kickback)':{img:'exercises/kickback-cable-fessiers.webp'},   // 2 poses CÔTE À CÔTE (pas animées : zooms et angles différents, la figurine sautait) · figurine féminine
  'Hip Thrust Haltère (Poussée de Hanche)':{img:'exercises/hip-thrust-haltere.webp'},   // 2 poses ANIMÉES (même cadrage, banc immobile → alignement propre) · figurine féminine (2ᵉ du catalogue)
};
// Mapping groupe musculaire → SVG local (hors connexion)
const _MUSCLE_FILE={
  'Pectoraux':'muscles/chest.svg','Dos':'muscles/back.svg','Trapèzes':'muscles/back.svg',
  'Épaules':'muscles/shoulders.svg','Biceps':'muscles/arms.svg','Triceps':'muscles/arms.svg',
  'Avant-bras':'muscles/arms.svg','Jambes':'muscles/legs.svg','Fessiers':'muscles/glutes.svg',
  'Abdominaux':'muscles/abs.svg','Mollets':'muscles/calves.svg','Full Body':'muscles/chest.svg',
};

const EX_EN={
  // Pectoraux
  'Développé Couché':'bench press barbell','Développé Couché Haltères':'bench press dumbbell',
  // — les 14 du 01/08/2026 —
  'Pompes (Push-up)':'push up','Développé Couché avec Chaînes':'bench press with chains',
  'Développé Couché Larsen (Larsen Press)':'larsen press','Développé Couché Unilatéral Kettlebell':'single arm kettlebell bench press',
  'Développé Incliné Poulie':'incline cable press','Écarté Incliné Haltères':'incline dumbbell fly',
  'Écarté Hyght (Hyght Fly)':'hyght dumbbell fly','Écarté Décliné Haltères':'decline dumbbell fly','Hip Thrust Unilatéral (Poussée de Hanche)':'single leg barbell hip thrust','Curl Pupitre Barre EZ (Larry Scott)':'ez bar preacher curl','Waiter Curl':'waiter curl dumbbell','Hex Press Smith Machine':'hex press smith machine',
  'Chest Press Poulie Assis':'seated cable chest press','Svend Press (Serrage de Plaque)':'svend press plate',
  'Presse à Cuisses sur le Côté':'side leg press machine','Hack Squat Assis':'seated hack squat machine',
  'Overhead Squat Haltères':'dumbbell overhead squat','Arraché Debout (Muscle Snatch)':'barbell muscle snatch',
  'Développé Incliné':'incline bench press','Développé Incliné Haltères':'incline bench press dumbbell',
  'Développé Décliné':'decline bench press','Développé Décliné Haltères':'decline bench press dumbbell',
  'Écarté Haltères':'dumbbell fly chest','Écarté Poulie':'cable fly chest',
  'Croisé Poulie (Cable Crossover)':'cable crossover',
  'Pec Deck':'pec deck fly','Chest Press Machine Horizontale':'chest press machine',
  'Chest Press Machine Inclinée':'incline chest press machine','Chest Press Machine Déclinée':'decline chest press machine',
  'Dips':'chest dips','Dips Triceps (Buste Droit)':'parallel bar dip','Dips Assis Machine (Seated Dip)':'seated dip machine',
  'Dips Machine Assistée':'assisted dip machine',
  'Pompes Lestées':'push up weighted','Pompes Déficit (Deficit Push-up)':'deficit push up','Pompes Diamant':'diamond push up',
  'Smith Machine Développé Couché':'smith machine bench press','Smith Machine Développé Incliné':'smith machine incline bench press',
  // Dos
  'Soulevé de Terre':'deadlift conventional','Soulevé de Terre Sumo':'sumo deadlift',
  'Tirage en Rack (Rack Pull)':'rack pull barbell',
  'Inclinaison Lombaire (Good Morning)':'good morning barbell',
  'Rowing Barre (Tirage Horizontal)':'barbell row bent over','Rowing Haltère (Tirage Horizontal)':'dumbbell row one arm','Rowing Câble (Tirage Horizontal)':'cable row seated',
  'Rowing Yates (Supination)':'yates row barbell',
  'Rowing Poitrine Appuyée (Chest Supported)':'chest supported row',
  'Rowing Machine (Tirage Horizontal)':'seated row machine','Rowing Hammer Strength':'hammer strength row',
  'Tirage Poulie Haute (Lat Pulldown)':'lat pulldown cable','Tirage Poulie Haute Prise Serrée':'lat pulldown close grip',
  'Tirage Nuque':'behind neck pulldown',
  'Tirage Poulie Basse Prise Large':'seated cable row wide grip','Tirage Poulie Basse Prise Serrée':'seated cable row close grip',
  'Traction Lestée':'pull-up weighted','Traction Assistée':'assisted pull up machine','Traction Prise Neutre':'neutral grip pull up',
  'Pull-over':'pullover barbell','Pull-over Haltère':'pullover dumbbell','Pullover Machine':'pullover machine',
  // Trapèzes
  'Haussements d\'Épaules (Shrugs)':'barbell shrug',
  'Haussements d\'Épaules Barre':'barbell shrug','Haussements d\'Épaules Haltères':'dumbbell shrug',
  'Haussements d\'Épaules Câble':'cable shrug','Tirage Menton':'upright row barbell',
  'Farmer\'s Walk':'farmers walk',
  // Épaules
  'Développé Militaire':'overhead press barbell','Développé Militaire Haltères':'overhead press dumbbell',
  'Développé Haltères Assis':'seated dumbbell press',
  'Développé Arnold (Arnold Press)':'arnold press','Développé Épaules Machine':'shoulder press machine',
  'Développé Épaules Assis Machine (Shoulder Press)':'seated machine shoulder press',
  'Smith Machine Développé Militaire':'smith machine overhead press',
  'Élévations Latérales (Lateral Raise)':'lateral raise dumbbell','Élévations Latérales Câble':'cable lateral raise',
  'Élévations Latérales Machine':'machine lateral raise',
  'Élévations Frontales':'front raise dumbbell','Élévations Frontales Câble':'cable front raise',
  'Élévations Frontales Machine':'machine front raise',
  'Oiseau':'rear delt fly dumbbell','Machine Oiseau':'rear delt fly machine',
  'Tirage Visage (Face Pull)':'face pull cable','Tirage Menton Kettlebell':'upright row kettlebell',
  'Y Raise / W Raise':'y raise band','Glissement au Mur (Wall Slide)':'wall slide scapular',
  // Biceps
  'Curl Barre':'barbell bicep curl','Curl Haltères':'dumbbell bicep curl',
  'Curl Poulie':'cable bicep curl','Curl EZ':'ez bar curl',
  'Curl Barre EZ Prise Large':'ez bar curl wide grip',
  'Curl Incliné':'incline dumbbell curl','Curl Concentré':'concentration curl',
  'Curl Câble en Croix (Bayesian Curl)':'bayesian curl cable','Curl Araignée (Spider Curl)':'spider curl',
  'Curl Zottman':'zottman curl','Marteau':'hammer curl',
  'Curl Machine':'bicep curl machine','Curl Pupitre Machine':'preacher curl machine',
  // Triceps
  'Dips Lestés':'dips weighted','Bench Dips':'bench dip',
  'Barre au Front':'skull crusher','Skull Crusher Barre EZ':'skull crusher ez bar',
  'Extension Triceps':'triceps extension overhead','Extension Triceps Couché Haltères':'lying triceps extension dumbbell',
  'Extension Nuque Haltère':'overhead triceps extension dumbbell',
  'Extension Nuque Poulie Haute':'overhead cable triceps extension',
  'Triceps Poulie':'triceps pushdown cable','Triceps Corde Poulie':'triceps rope pushdown',
  'Triceps Poulie Basse':'low cable triceps extension',
  'Extension Triceps Arrière (Kickback)':'triceps kickback dumbbell',
  'Triceps Machine':'triceps machine',
  // Jambes
  // — cardio + chariot (01/08) —
  'Assault Air Bike':'assault air bike','Ergomètre de Ski (Ski Erg)':'ski erg',
  'Jumping Jack':'jumping jack','Marche de l\'Ours (Bear Crawl)':'bear crawl','Wall Ball':'wall ball shot',
  'Chariot de Puissance — Poussée':'power sled push','Chariot de Puissance — Tirage en Avançant':'power sled pull forward',
  'Chariot de Puissance — Tirage Dos':'power sled row','Chariot de Puissance — Tirage de Côté':'power sled lateral pull',
  'Chariot de Puissance — Tirage Inversé Jambes':'power sled reverse drag','Chariot de Puissance — Tirage Épaules':'power sled shoulder raise',
  'Chariot de Puissance — Fentes Arrière':'power sled reverse lunge','Chariot de Puissance — Curl Biceps':'power sled biceps curl',
  'Chariot de Puissance — Extension Triceps':'power sled triceps extension',
  // — les 32 nouveaux des lots dos / épaules / pecs (01/08) —
  'Tractions (Pull-up)':'pull up','Traction Supination (Chin-up)':'chin up','Muscle-up':'muscle up bar',
  'Tractions aux Anneaux':'ring pull up','Traction Australienne (Poids du Corps)':'australian pull up',
  'Traction Assistée avec Banc':'assisted pull up bench','Suspension Passive (Dead Hang)':'dead hang',
  'Rowing Inversé sous une Table':'inverted row under table','Rowing Buste Penché Élastique':'bent over row resistance band',
  'Rowing Horizontal Élastique':'seated row resistance band','Rowing Unilatéral Élastique':'single arm row resistance band',
  'Tirage Vertical Alterné Élastique':'alternating lat pulldown resistance band','Rowing TRX (Sangles)':'trx row',
  'Traction Australienne TRX (Sangles)':'trx inverted row','Bird Dog':'bird dog exercise',
  'Extension Lombaire sur Ballon':'back extension stability ball','Planche Inversée':'reverse plank',
  'Développé Épaules Élastique':'shoulder press resistance band','Développé Épaules Assis Élastique':'seated shoulder press resistance band',
  'Développé Épaules Unilatéral Élastique':'single arm shoulder press resistance band',
  'Élévations Latérales Unilatérale Poulie':'single arm cable lateral raise','Oiseau Élastique':'reverse fly resistance band',
  'Oiseau Inversé TRX (Sangles)':'trx reverse fly','Rotation Externe Épaule Poulie':'cable external rotation',
  'Handstand Push-up Suspendu (Sangles)':'suspended handstand push up',
  'Développé Couché au Sol (Floor Press)':'floor press barbell','Développé Couché Élastique':'bench press resistance band',
  'Développé Décliné Élastique':'decline press resistance band','Écarté Poulie Haute à Genoux':'kneeling high cable fly',
  'Écarté Élastique':'chest fly resistance band','Écarté TRX (Sangles)':'trx chest fly',
  'Chest Press TRX (Sangles)':'trx chest press','Pompes Inclinées TRX (Sangles)':'trx incline push up',
  // — les 11 nouveaux du lot « triceps » (01/08) —
  'Dips aux Anneaux':'ring dips','Dips entre Deux Bancs':'bench dips between two benches',
  'Tate Press':'tate press dumbbell','Handstand Push-up (ATR)':'handstand push up',
  'Extension Triceps Banc Incliné Haltères':'incline dumbbell triceps extension',
  'Extension Triceps Décliné Haltères':'decline dumbbell triceps extension',
  'Extension Triceps Concentrée Poulie':'concentration cable triceps extension',
  'Extension Triceps Nuque Élastique':'overhead triceps extension resistance band',
  'Extension Triceps Verticale Élastique':'triceps pushdown resistance band',
  'Extension Triceps TRX (Sangles)':'trx triceps extension','Extension Triceps Allongée TRX (Sangles)':'trx lying triceps extension',
  // — les 16 du lot « quadri » (01/08) —
  'Squat Poids du Corps (Air Squat)':'air squat bodyweight','Fentes Croisées (Curtsy Lunge)':'curtsy lunge',
  'Jefferson Squat':'jefferson squat','Soulevé de Terre Valise (Suitcase)':'suitcase deadlift',
  'Squat Sauté (Jump Squat)':'jump squat','Squat avec Rotation du Tronc':'squat with torso rotation',
  'Sissy Squat Machine':'sissy squat machine','Extension Quadriceps Unilatérale Machine à Dips':'single leg extension assisted dip machine',
  'Squat Bulgare Élastique':'bulgarian split squat resistance band','Extension Quadriceps Élastique':'leg extension resistance band',
  'Overhead Squat Élastique':'overhead squat resistance band','Split Squat Élastique (Fente Statique)':'split squat resistance band',
  'Squat Barre avec Bandes Élastiques':'banded barbell squat',
  'Squat TRX (Sangles)':'trx squat','Split Squat TRX (Sangles)':'trx split squat','Squat Pistol TRX (Sangles)':'trx pistol squat',
  'Squat à la Barre':'squat barbell','Squat Avant':'front squat','Squat Bulgare':'bulgarian split squat',
  'Squat Gobelet (Goblet Squat)':'goblet squat',
  'Smith Machine Squat':'smith machine squat','Squat Hack (Hack Squat)':'hack squat',
  'Leg Press':'leg press machine',
  'Extension Quadriceps (Leg Extension)':'leg extension machine',
  'Leg Curl Couché Machine':'lying leg curl machine','Leg Curl Assis Machine':'seated leg curl machine',
  'Fentes':'lunge barbell','Fentes Marchées':'walking lunge',
  'Fentes Arrière':'reverse lunge','Fentes Latérales':'lateral lunge',
  'Smith Machine Fentes':'smith machine lunge',
  'Montée sur Box (Step-up)':'box step up','Montée sur Box Haltères':'step up dumbbell',
  'Abduction Cuisses (Leg Abduction)':'hip abduction machine',
  'Adduction Cuisses (Leg Adduction)':'hip adduction machine',
  // Fessiers
  'Hip Thrust Barre (Poussée de Hanche)':'hip thrust barbell','Hip Thrust Haltère (Poussée de Hanche)':'hip thrust dumbbell',
  'Hip Thrust Machine (Poussée de Hanche)':'hip thrust machine',
  'Pont Fessier (Glute Bridge)':'glute bridge',
  'Extension Fessiers Arrière (Kickback)':'glute kickback cable',
  'Kickback Machine':'glute kickback machine',
  'Soulevé de Terre Roumain Barre':'romanian deadlift barbell',
  'Soulevé de Terre Roumain Haltères':'romanian deadlift dumbbell',
  'Soulevé de Terre Roumain Unilatéral':'single leg romanian deadlift',
  'Tirage Cable Fessiers (Cable Pull Through)':'cable pull through glute',
  'Curl Ischio-jambiers (Leg Curl)':'leg curl machine',
  'Abducteurs Machine Debout':'standing hip abduction machine',
  // Abdominaux
  'Gainage':'plank core','Planche Latérale (Side Plank)':'side plank',
  'Hollow Body':'hollow body hold','L-Sit':'l-sit',
  'Windshield Wiper':'windshield wiper ab',
  'Crunch':'crunch abdominal','Crunch Poulie':'cable crunch','Crunch Oblique':'oblique crunch',
  'Crunch Machine':'crunch machine',
  'Rotation Machine Obliques':'oblique twist machine',
  'Relevé de Jambes':'hanging leg raise','Relevé de Buste (Sit-up)':'sit up',
  'Chaise Romaine':'captain chair leg raise',
  'Roue Abdominale (Ab Wheel)':'ab wheel rollout',
  'Rotation Russe (Russian Twist)':'russian twist','Drapeau (Dragon Flag)':'dragon flag',
  'Grimpeur (Mountain Climber)':'mountain climber',
  // Mollets
  'Élévations Mollets Debout':'standing calf raise','Élévations Mollets Assis':'seated calf raise',
  'Élévations Mollets Unilatéral':'single leg calf raise',
  'Presse Mollets (Leg Press)':'calf press leg press','Élévations Mollets Penché (Donkey Calf Raise)':'donkey calf raise',
  'Mollets Machine Debout':'standing calf raise machine','Mollets Machine Assise':'seated calf raise machine',
  'Sauts à la Corde':'jump rope',
  // Avant-bras
  'Curl Poignet Barre':'wrist curl barbell','Extension Poignet Barre':'wrist extension barbell',
  'Pronation Supination Haltère':'forearm rotation dumbbell',
  'Farmer\'s Walk (Grip)':'farmers walk','Planche de Préhension':'dead hang grip',
  // Full Body
  'Burpees':'burpee','Kettlebell Swing':'kettlebell swing',
  'Arraché Haltère (Dumbbell Snatch)':'dumbbell snatch','Thrusters Haltères':'dumbbell thruster',
  'Clean & Jerk':'clean and jerk','Turkish Get-Up':'turkish get up',
  'Battle Rope':'battle rope waves','Box Jump':'box jump plyometric',
};

async function fetchExImage(name){
  if(gifCache[name]!==undefined)return gifCache[name];
  gifCache[name]=null;
  const term=EX_EN[name]||name;
  try{
    const r=await fetch(`https://wger.de/api/v2/exercisesearch/?term=${encodeURIComponent(term)}&language=2&format=json`,{signal:AbortSignal.timeout(5000)});
    if(!r.ok)return null;
    const d=await r.json();
    const first=d.suggestions&&d.suggestions[0];
    if(!first||!first.data)return null;
    const baseId=first.data.base_id;
    if(!baseId)return null;
    const r2=await fetch(`https://wger.de/api/v2/exerciseimage/?exercise_base=${baseId}&format=json`,{signal:AbortSignal.timeout(5000)});
    if(!r2.ok)return null;
    const d2=await r2.json();
    const imgs=d2.results||[];
    // Préférer l'image principale
    const main=imgs.find(i=>i.is_main)||imgs[0];
    if(main&&main.image){gifCache[name]=main.image;return main.image;}
  }catch(e){}
  return null;
}

function _ytSearchUrl(name){
  const term='Demic '+(EX_EN[exNomCatalogue(name)]||name);
  return 'https://www.youtube.com/results?search_query='+encodeURIComponent(term);
}

function _exVideoHtml(name){
  const v=EX_YT[exNomCatalogue(name)];
  if(v&&v.img){
    // Image locale
    return `<div>
      <img src="${v.img}" style="width:100%;border-radius:8px;display:block;margin-bottom:8px;" loading="lazy">
      <a href="${_ytSearchUrl(name)}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#FF0000;color:#fff;border-radius:8px;padding:10px 14px;font-size:14px;font-weight:700;text-decoration:none;-webkit-tap-highlight-color:transparent;">▶&nbsp;Voir le tutoriel</a>
    </div>`;
  }
  if(v&&v.id){
    const watchUrl=v.s?'https://www.youtube.com/shorts/'+v.id:'https://www.youtube.com/watch?v='+v.id;
    const thumb='https://img.youtube.com/vi/'+v.id+'/mqdefault.jpg';
    return `<a href="${watchUrl}" target="_blank" rel="noopener" style="display:block;position:relative;border-radius:10px;overflow:hidden;text-decoration:none;-webkit-tap-highlight-color:transparent;">
      <img src="${thumb}" style="width:100%;display:block;" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.28);">
        <div style="width:54px;height:54px;background:#FF0000;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.4);">
          <div style="width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid #fff;margin-left:5px;"></div>
        </div>
      </div>
    </a>`;
  }
  return `<a href="${_ytSearchUrl(name)}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#FF0000;color:#fff;border-radius:8px;padding:11px 14px;font-size:14px;font-weight:700;text-decoration:none;-webkit-tap-highlight-color:transparent;">▶&nbsp;Voir le tutoriel</a>`;
}

function toggleExGif(ei,name){
  const panel=document.getElementById(`ex-gif-${ei}`);
  if(!panel)return;
  if(panel.dataset.open==='1'){panel.style.display='none';panel.dataset.open='0';return;}
  panel.style.display='block';panel.dataset.open='1';
  if(panel.dataset.loaded==='1')return;
  panel.dataset.loaded='1';

  const local=_exImg(name);
  let html='<div style="padding:10px;background:var(--bg3);border-radius:10px;">';
  if(local){
    // ⚠️ `contain`, JAMAIS `cover` — retour Michel 09/08 (« dommage problème de cadrage ») :
    // sur le Jefferson Curl, la TÊTE était coupée. Ce n'était pas l'image (son dessin s'arrête
    // à 8 px du bord) mais CETTE boîte : `width:100%` + `max-height:240px` donne un cadre de
    // ~340×240 (rapport 1,42) alors que la médiane des figurines est **1,00**. Avec `cover`,
    // une image carrée perdait **30 % de sa hauteur**, moitié en haut, moitié en bas.
    // Mesuré : **269 des 294 figurines (91 %)** étaient rognées — têtes et pieds compris.
    // C'est l'inverse du but d'une démonstration : on la montre pour voir le mouvement ENTIER.
    // Le fond blanc est explicite : toutes les figurines ont un fond blanc opaque, donc les
    // bandes latérales du `contain` se confondent avec l'image au lieu de faire des barres.
    // (La vignette 40/48 px garde `cover`, elle : sur un carré, une image carrée n'y perd rien.)
    html+=`<img src="${local}" style="width:100%;border-radius:8px;max-height:240px;object-fit:contain;background:#fff;display:block;" loading="lazy">`;
  } else {
    // Pas de photo/gif dédié → figurine du muscle deviné du nom (taxonomie) — jamais vide
    const file=_exMuscleImg(name);
    const ex=EXLIB.find(e=>e.n===exNomCatalogue(name));
    html+=`<div style="text-align:center;padding:8px 0;"><img src="${file}" style="width:160px;height:auto;display:block;margin:0 auto;"></div>`;
    html+=`<div style="text-align:center;font-size:12px;color:var(--t3);margin-top:2px;">${ex?ex.g:'Muscle principal deviné'}</div>`;
    // Machine importée sans image dédiée → proposer d'ajouter la vraie photo (deviendra la vignette + le grand format)
    html+=`<button class="btn btn-bg2" style="width:100%;margin-top:10px;font-size:13px;" onclick="event.stopPropagation();changeExImg(${JSON.stringify(name)})">📷 Ajouter la photo de ta machine</button>`;
  }
  html+='</div>';
  panel.innerHTML=html;
}

// ─── PLATE CALCULATOR ────────────────────────────────────────
let plateExIdx=null;
function openPlateCalc(kg,ei){plateExIdx=ei;document.getElementById('plate-kg').value=kg||'';document.getElementById('bar-disp').textContent=S.barW;document.getElementById('plate-apply').style.display=ei!==null&&ei!==undefined?'':'none';renderPlates();document.getElementById('mod-plate').classList.add('open');}
function closePlate(){document.getElementById('mod-plate').classList.remove('open');}
function calcPlatesArr(t,bar){const ps=[25,20,15,10,5,2.5,1.25,0.5];let r=(t-bar)/2;if(r<0)return null;const res=[];for(const p of ps){while(r>=p-.001){res.push(p);r=Math.round((r-p)*1000)/1000;}}return res;}
function plateCls(p){return p>=25?'p25':p>=20?'p20':p>=15?'p15':p>=10?'p10':p>=5?'p5':p>=2?'p2':'p1';}
function renderPlates(){
  const t=parseFloat(document.getElementById('plate-kg').value);
  const viz=document.getElementById('plate-viz'),res=document.getElementById('plate-result');
  if(!t||t<S.barW){viz.innerHTML='';res.textContent=t&&t<S.barW?`Min: ${S.barW}kg (barre seule)`:'';return;}
  const arr=calcPlatesArr(t,S.barW);
  if(!arr){viz.innerHTML='';res.textContent='Impossible';return;}
  viz.innerHTML=`<div class="plate-bar">${arr.map(p=>`<div class="plate ${plateCls(p)}">${p}</div>`).join('')}<div class="bar-shaft"></div>${[...arr].reverse().map(p=>`<div class="plate ${plateCls(p)}">${p}</div>`).join('')}</div>`;
  const total=S.barW+arr.reduce((a,b)=>a+b,0)*2;
  res.textContent=arr.length?`Chaque côté: ${arr.map(p=>p+'kg').join('+')} = ${fmt(total)}kg total`:`Barre seule = ${S.barW}kg`;
}
function applyPlate(){if(plateExIdx===null)return;const t=parseFloat(document.getElementById('plate-kg').value);if(!t)return;S.wkt.exs[plateExIdx].sets.forEach(s=>{if(!s.done)s.kg=t;});persist();closePlate();renderExBlocks();toast('Charge appliquée !','success');}

// (Déblocage audio supprimé — le timer est 100% silencieux, voir bloc AUDIO : AUCUN plus haut)

