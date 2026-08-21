/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── STATE ───────────────────────────────────────────────────
// Code perso de protection du compte (stocké UNIQUEMENT en local sur l'appareil,
// JAMAIS envoyé au cloud comme donnée — seulement joint aux requêtes pour prouver l'accès).
function _authCode(){ try{ return localStorage.getItem('ft4_authcode')||''; }catch(e){ return ''; } }
function _setAuthCode(c){ try{ if(c) localStorage.setItem('ft4_authcode',c); else localStorage.removeItem('ft4_authcode'); }catch(e){} }
let _chartPts=[];
let S={
  bw:80,barW:20,defRest:130,
  gender:'H',age:30,height:175,activityLevel:1.55,
  workType:'bureau',smoker:false,halo:'on',haloColor:'59,130,246',haloDir:'top',
  mensCycleStart:'',mensCycleDur:28,contraception:'',morpho:'',morphotype:'',
  sessions:[],prs:{},wkt:null,programmes:[],progExos:null,seenFeatures:[],reportedCustomEx:[],
  url:DEFAULT_URL,email:'',connected:false,
  nutritionPhase:'charge',
  creatDose:null,        // dose de créatine réglée à la main (null = suggestion de l'app)
  customExercises:[],exPhotos:{},
  neck:0,waist:0,hip:0,
  goal:'muscle',
  goal2:'',
  priorities:[],
  sleepLog:[],
  weightLog:[],
  dayStateLog:[],
  healthInbox:[],   // ⌚ activités reçues du téléphone (raccourci iOS → Santé) — voir app.js `_majHealthInbox`
  healthDaily:[],   // ❤️😴🚶 une entrée par jour venue de Santé ({date, rhr, sleep, steps}) — FC au
                     // repos exploitée par tracking.js `_rhrEcart` ; sleep/steps reçus (ft-v916) mais
                     // pas encore affichés côté app — ils dorment dans le compte, prêts pour la
                     // comparaison avec `S.sleepLog` le jour où l'écran sera construit (R30 : pas un
                     // oubli, une étape suivante non codée).
  strengthGoals:{},
  name:'',
  coachFree:0,
  histImports:0,
  bodyScanImports:0,
  premium:false,
  premiumExpiry:'',
  exRestPref:{},
  /* 🔁 POURQUOI CETTE PERSONNE REMPLACE CET EXERCICE-LÀ (17/08/2026)
     Michel : *« peut-être qu'il demande par une question QCM (ça ne coûte rien en token) pourquoi
     j'ai changé d'exercice »*. Rangé PAR NOM D'EXERCICE, comme `exRestPref` — c'est la même
     nature d'information (une préférence attachée à un mouvement), et elle migre donc avec les
     renommages du catalogue par le même chemin (R2).
     { 'Nom de l'exercice remplacé': {r:'gene'|'long'|'pris'|'envie', to:'Nom choisi', n:2, date} } */
  exSwaps:{},
  mealPlan:null,
  foodLog:[],
  foodAiUses:0,
  healthProfile:null,
  a11y:false,
  colorblind:'',
  leftHand:false
};

// 🛡️ Lecture JSON sécurisée (audit 27/07) : une clé localStorage corrompue rend SA valeur par défaut
// au lieu de faire échouer tout load() — l'app ne démarre plus jamais « vidée » à cause d'une seule clé.
function _lsJson(k,fb){
  try{
    const raw=localStorage.getItem(k);
    if(raw===null||raw===undefined)return fb;
    const v=JSON.parse(raw);
    return (v===null||v===undefined)?fb:v;
  }catch(e){try{console.warn('[FT load] clé illisible, valeur par défaut :',k,e);}catch(_){}return fb;}
}

function load(){
  try{
    S.bw=parseFloat(localStorage.getItem('ft4_bw')||'0')||0;
    S.barW=parseFloat(localStorage.getItem('ft4_bar')||'20')||20;
    S.defRest=parseInt(localStorage.getItem('ft4_rest')||'130')||130;
    S.expandAll=localStorage.getItem('ft4_expandall')==='1'; // option « tout dérouler » les exercices en séance (retour Emma)
    // MODE alimentaire — un seul à la fois : ils se contredisent (on n'est pas kéto ET low carb).
    // '' | keto | lowcarb | paleo | mediterraneen. ⚠️ RÉTROCOMPAT : les comptes qui avaient
    // l'ancien interrupteur `ft4_keto` basculent en mode 'keto' sans rien perdre.
    S.foodMode=localStorage.getItem('ft4_foodmode')||(localStorage.getItem('ft4_keto')==='1'?'keto':'');
    S.keto=(S.foodMode==='keto'); // alias conservé : plusieurs endroits le lisent encore
    // JEÛNE INTERMITTENT — indépendant du mode : c'est une question d'HORAIRES, pas de macros.
    // '' | 16-8 | 18-6 | 20-4 (heures de jeûne / fenêtre où l'on mange).
    S.fasting=localStorage.getItem('ft4_fasting')||'';
    S.gender=localStorage.getItem('ft4_gender')||'H';
    S.age=parseInt(localStorage.getItem('ft4_age')||'0')||0;
    S.height=parseFloat(localStorage.getItem('ft4_ht')||'0')||0;
    S.activityLevel=parseFloat(localStorage.getItem('ft4_act')||'1.55')||1.55;
    S.workType=localStorage.getItem('ft4_work')||'bureau';
    S.halo=localStorage.getItem('ft4_halo')||'on';
    if(S.halo==='blue')S.halo='on';                 // migration ancien nom
    if(S.halo!=='none'&&S.halo!=='on')S.halo='on';
    S.haloColor=localStorage.getItem('ft4_haloColor')||'59,130,246';
    // Apparence de la carte récup : 'anneau' (défaut, ft-v642) | 'moniteur' (ft-v645).
    // Défaut volontaire : personne ne change d'apparence sans l'avoir choisi.
    S.ringStyle=localStorage.getItem('ft4_ringstyle')==='moniteur'?'moniteur':'anneau';
    // Tracé d'ECG figé (style moniteur). Défaut : il défile.
    S.ecgStill=localStorage.getItem('ft4_ecgstill')==='1';
    S.haloDir=localStorage.getItem('ft4_haloDir')||'top';
    S.smoker=localStorage.getItem('ft4_smoker')==='1';
    S.mensCycleStart=localStorage.getItem('ft4_mcstart')||'';
    S.mensCycleDur=parseInt(localStorage.getItem('ft4_mcdur')||'28')||28;
    S.contraception=localStorage.getItem('ft4_contra')||'';
    S.morpho=localStorage.getItem('ft4_morpho')||'';
    S.morphotype=localStorage.getItem('ft4_morphot')||'';
    // 🛡️ Audit 27/07 : chaque GROSSE clé est lue dans son propre try (_lsJson) → une clé corrompue
    // ne court-circuite plus le chargement de tout le reste (l'app semblait « vidée » sans raison).
    S.sessions=_lsJson('ft4_sessions',[]);
    S.prs=_lsJson('ft4_prs',{});
    S.wkt=_lsJson('ft4_wkt',null);
    S.nextPlanned=_lsJson('ft4_nextplanned',null); // séance annoncée à Milo (ft-v601) : {date:'YYYY-MM-DD',label}
    S.url=DEFAULT_URL;
    S.email=localStorage.getItem('ft4_email')||'';
    S.connected=localStorage.getItem('ft4_ok')==='1';
    S.cycle=_lsJson('ft4_cycle',null);
    S.nutritionPhase=localStorage.getItem('ft4_nphase')||'charge';
    S.creatDose=parseFloat(localStorage.getItem('ft4_creatdose'))||null;
    S.customExercises=_lsJson('ft4_cuex',[]);
    S.exPhotos=_lsJson('ft4_exphotos',{});
    S.neck=parseFloat(localStorage.getItem('ft4_neck')||'0')||0;
    S.waist=parseFloat(localStorage.getItem('ft4_waist')||'0')||0;
    S.hip=parseFloat(localStorage.getItem('ft4_hip')||'0')||0;
    S.targetWeight=parseFloat(localStorage.getItem('ft4_target')||'0')||0;
    S.manualKcal=parseFloat(localStorage.getItem('ft4_manualkcal')||'0')||0; // 0 = calories auto
    S.goal=localStorage.getItem('ft4_goal')||'muscle';
    S.goal2=localStorage.getItem('ft4_goal2')||'';
    try{S.priorities=JSON.parse(localStorage.getItem('ft4_priorities')||'[]');}catch(e){S.priorities=[];}
    if(!Array.isArray(S.priorities))S.priorities=[];
    S.discipline=localStorage.getItem('ft4_discipline')||'muscu';
    S.level=localStorage.getItem('ft4_level')||''; // '' | 'debutant' | 'intermediaire' | 'confirme' (niveau déclaré, évolue avec les séances)
    S.coachTone=localStorage.getItem('ft4_coachtone')||''; // '' (défaut, comportement actuel) | 'cool' | 'classique' | 'dynamique' | 'scientifique' — ton de Milo (Dossier Athlète, brique 0)
    // Registre Athlète (Dossier Athlète, brique 1) : mémoire durable consultée par Milo.
    // facts = faits mesurés (brique 2, à venir) ; observations = observations validées (brique 5, à venir). Vide pour l'instant.
    S.registre=_lsJson('ft4_registre',null)||{facts:{},observations:[],updatedAt:''};
    // ADN sportif (Dossier Athlète, brique 4A) : portrait DURABLE déclaré par l'utilisateur, injecté dans le briefing de Milo.
    // Différent du profil (déclaré général), des faits (mesurés) et de l'état du jour (ponctuel). Tout optionnel, vide = comportement identique.
    S.adn=_lsJson('ft4_adn',null)||{motivation:'',lifestyle:'',preferences:'',experience:'',fragile:''};
    // État du jour (Dossier Athlète, brique 3B) : énergie + douleurs du JOUR (ponctuel, repart à zéro chaque jour). Optionnel.
    S.dayState=_lsJson('ft4_daystate',null);
    // Historique du check-in du jour (brique 7 « Ton histoire sportive ») : on GARDE chaque jour renseigné (énergie/moral/douleur) au lieu de l'effacer chaque nuit. [{date,energy,mood,pains,note}]
    S.dayStateLog=_lsJson('ft4_dayslog',[]);
    /* ⌚⚠️ CLÉ PROPRE — `ft4_healthbox`, PAS `ft4_health` (corrigé le 17/08/2026).
       ft-v880 a fait lire ET écrire la boîte de la montre dans `ft4_health`… la clé du PROFIL
       SANTÉ (blessures, conditions, notes), qui existe depuis des mois. Deux données, un seul
       propriétaire de clé : c'est **R2**, et ça ne lève aucune erreur.
       CE QUE ÇA FAISAIT, mesuré : dans `persist()`, la boîte est écrite ligne ~414 puis le profil
       santé RÉÉCRIT la même clé ligne ~444 — le dernier gagne. Donc **la boîte de la montre ne
       survivait à AUCUNE sauvegarde** : la fonctionnalité livrée hier ne pouvait pas marcher.
       Et au chargement, `S.healthInbox` recevait l'OBJET du profil santé au lieu d'un tableau.
       🛟 MIGRATION SANS PERTE : si l'ancienne clé contient un TABLEAU, c'est une boîte laissée par
       une version où elle avait gagné la course — on la récupère. Si c'est un objet, c'est le
       profil santé et on n'y touche pas. Le profil santé, lui, garde `ft4_health` : c'est le
       propriétaire historique, et déplacer une donnée de SANTÉ pour faire de la place à une boîte
       de réception serait l'inverse de la bonne priorité. */
    S.healthInbox=_lsJson('ft4_healthbox',null);
    if(!Array.isArray(S.healthInbox)){
      const _anc=_lsJson('ft4_health',null);
      S.healthInbox=Array.isArray(_anc)?_anc:[];
    }
    S.healthDaily=_lsJson('ft4_healthd',[]);
    S.levelAuto=localStorage.getItem('ft4_levelAuto')==='1'; // true si le niveau a été promu automatiquement (évite de re-fêter)
    S.beginnerJourney=_lsJson('ft4_bjourney',null); // parcours débutant : {style,freq,startDate,phase}
    S.sleepLog=_lsJson('ft4_sleep',[]);
    S.weightLog=_lsJson('ft4_wlog',[]);
    S.strengthGoals=_lsJson('ft4_strgoals',{}); // objectif de 1RM par exercice {nom:kg}
    S.name=localStorage.getItem('ft4_name')||'';
    S.programmes=_lsJson('ft4_progs',[]);
    S.progExos=_lsJson('ft4_progexos',null)||[...BIG4];
    S.seenFeatures=JSON.parse(localStorage.getItem('ft4_seen_ft')||'[]');
    S.menuAck=JSON.parse(localStorage.getItem('ft4_menu_ack')||'[]'); // features setup « vues au niveau onglet Menu » (le point onglet s'éteint à l'ouverture du Menu ; les points de ligne restent)
    S.reportedCustomEx=JSON.parse(localStorage.getItem('ft4_rep_cex')||'[]');
    // ID anonyme persistant — jamais lié à l'email
    S.anonId=localStorage.getItem('ft4_auid')||(()=>{const id='u_'+Math.random().toString(36).slice(2,11);localStorage.setItem('ft4_auid',id);return id;})();
    S.coachFree=parseInt(localStorage.getItem('ft4_coachFree')||'0')||0;
    S.histImports=parseInt(localStorage.getItem('ft4_histImp')||'0')||0;
    S.bodyScanImports=parseInt(localStorage.getItem('ft4_bsimports')||'0')||0;
    S.progImports=parseInt(localStorage.getItem('ft4_progimports')||'0')||0; // imports IA de programme (limite gratuite, décision 31/07)
    S.coachMemory=localStorage.getItem('ft4_coach_mem')||'';
    /* 🛡️ Compteur du Gardien — DES NOMBRES, jamais une phrase (ft-v944/945). Écrit par
       `_gardienCompter` (coach.js), reflété ici pour partir avec la sauvegarde : c'est ce
       qui permet une mesure CONTINUE chez les vrais utilisateurs, et pas seulement chez le
       fondateur — dont le Milo est débridé, donc pas représentatif (cousin de R9). */
    try{ S.gardienStats=JSON.parse(localStorage.getItem('ft4_gardienStats')||'null'); }catch(e){ S.gardienStats=null; }
    try{S.coachConversations=JSON.parse(localStorage.getItem('ft4_coach_convs')||'[]')||[];}catch(e){S.coachConversations=[];}
    S.premium=localStorage.getItem('ft4_premium')==='1';
    // Fondateurs/testeurs premium à vie : premium accordé côté client (indépendant du serveur, cf. PREMIUM_CLIENT_EMAILS)
    if(typeof _isClientPremium==='function'&&_isClientPremium())S.premium=true;
    S.premiumExpiry=localStorage.getItem('ft4_premiumExp')||'';
    S.exRestPref=JSON.parse(localStorage.getItem('ft4_exRp')||'{}');
    S.exSwaps=JSON.parse(localStorage.getItem('ft4_exswaps')||'{}');
    // Drapeau « historique local incomplet » (posé quand le stockage du téléphone a saturé).
    // Il protège la sauvegarde cloud tant qu'on n'a pas restauré : voir persist() et _cloudSync().
    S.histTronque=localStorage.getItem('ft4_hist_tronque')==='1';
    // ── Renommages d'exercices (01/08/2026, Michel : « des noms chelou, c'est galère à retrouver ») ──
    // TOUT l'historique est rangé par NOM d'exercice : à chaque renommage du catalogue, les données
    // locales migrent ici (séances, records, programmes, brouillon, photos, repos préférés).
    // Le cloud suit à la prochaine sauvegarde.
    // ⚠️ Depuis le 02/08, la liste des anciens noms se tient dans `EX_IDS` (constants.js) et
    // NULLE PART AILLEURS : renommer un exercice = modifier son nom dans EX_IDS et pousser
    // l'ancien derrière. Cette boucle n'a plus rien à maintenir.
    (function(){
      // ⚠️ La table des renommages VIT DÉSORMAIS DANS `EX_IDS` (constants.js), rangée par
      // IDENTIFIANT : ['nom actuel', ...anciens noms]. Elle était ici en double, rangée par nom
      // — donc elle cassait au renommage suivant, et il fallait penser à la tenir à jour à deux
      // endroits (R2 : une information, un seul propriétaire). `exNomActuel` la lit pour nous ;
      // un exercice inconnu (perso) est rendu inchangé, jamais deviné.
      const ren=(typeof exNomActuel==='function')?exNomActuel:(function(n){return n;});
      const renKeys=o=>{if(!o)return o;const out={};Object.keys(o).forEach(k=>{out[ren(k)]=o[k];});return out;};
      try{
        (S.sessions||[]).forEach(sess=>(sess.exs||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);}));
        S.prs=renKeys(S.prs);
        (S.programmes||[]).forEach(p=>{if(!p)return;
          (p.exs||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);});
          (p.days||[]).forEach(d=>((d&&d.exs)||[]).forEach(e=>{if(e&&e.name)e.name=ren(e.name);}));});
        if(S.wkt&&S.wkt.exs)S.wkt.exs.forEach(e=>{if(e&&e.name)e.name=ren(e.name);});
        S.exPhotos=renKeys(S.exPhotos);
        S.exRestPref=renKeys(S.exRestPref);
        S.exSwaps=renKeys(S.exSwaps);
        /* 🧹 UN EXERCICE PERSO QUI PORTE UN NOM DU CATALOGUE EST UN DOUBLON (17/08/2026)
           Michel : *« le inversé n'a pas de photo, il est en double avec machine oiseau »* — puis
           *« comment je fais pour supprimer l'exercice, je ne peux pas »*. Il avait raison sur les
           deux points, et le second est le plus grave.
           ⭐ CE QU'IL A TROUVÉ : il avait créé « Butterfly » et « Pec deck inverse », qui sont les
           noms courants du **Pec Deck** et de la **Machine Oiseau** — déjà au catalogue, avec leurs
           photos et les bons muscles. Ses deux fiches perso, elles, portaient les muscles
           **PERMUTÉS** (l'ouverture arrière classée en deltoïde AVANT, le pec deck en ARRIÈRE).
           ⛔ ET AUCUN CHEMIN NE PERMETTAIT DE LES SUPPRIMER. `openEditCustomEx()` existe, complète
           et fonctionnelle — elle n'est appelée de NULLE PART. La seule porte vers la fusion est
           « Analyser les doublons », qui compare les noms à une lettre près : « Pec deck inverse »
           et « Machine Oiseau » n'ont pas un mot en commun, elle ne les trouvera jamais. Un outil
           qui existe, qui marche, et qu'on ne peut pas atteindre.
           👉 LA RÈGLE, ET ELLE EST GÉNÉRALE : dès qu'un exercice perso porte un nom que le
           catalogue connaît (ou un ancien nom d'un exercice du catalogue), c'est un doublon. La
           fiche du catalogue gagne — elle a les bons muscles, sa photo et son identifiant.
           ⚠️ RIEN N'EST PERDU : les séances, records, programmes et préférences viennent d'être
           renommés juste au-dessus, donc ils pointent déjà sur la bonne fiche. Et la PHOTO du perso
           est transférée si la cible n'en a pas — on n'écrase jamais celle de la cible.
           ⚠️ UN VRAI EXERCICE PERSO N'EST JAMAIS TOUCHÉ : `exId()` rend `null` sur un nom inconnu,
           donc « ISO latérale incline press » reste exactement où il est. */
        if(Array.isArray(S.customExercises) && typeof exId==='function'){
          S.customExercises=S.customExercises.filter(function(c){
            if(!c||!c.n) return true;
            const nom=ren(c.n);
            if(!exId(nom)) return true;                 // inconnu du catalogue → vrai exo perso
            if(c.img){                                  // la photo suit, sans écraser la cible
              S.exPhotos=S.exPhotos||{};
              if(!S.exPhotos[nom]) S.exPhotos[nom]=c.img;
            }
            return false;                               // le catalogue gagne
          });
        }
      }catch(e){console.warn('[FT renames]',e);}
    })();
    S.badges=JSON.parse(localStorage.getItem('ft4_badges')||'{}');
    S.testerIdeas=JSON.parse(localStorage.getItem('ft4_tester_ideas')||'[]'); // boîte à idées (super testeur)
    S.bodySeries=JSON.parse(localStorage.getItem('ft4_body_series')||'[]'); // séries photos (super testeur) — local uniquement (photos lourdes)
    S.bday=localStorage.getItem('ft4_bday')||'';
    S.lastWeekSummary=localStorage.getItem('ft4_lws')||'';
    S.lastMonthSummary=localStorage.getItem('ft4_lms')||'';   // dernier mois ANNONCÉ (ft-v872)
    S.mealPlan=JSON.parse(localStorage.getItem('ft4_mealplan')||'null');
    S.foodLog=JSON.parse(localStorage.getItem('ft4_foodlog')||'[]');
    S.savedFoods=JSON.parse(localStorage.getItem('ft4_savedfoods')||'[]');
    S.hiddenFoods=JSON.parse(localStorage.getItem('ft4_hiddenfoods')||'[]');
    S.foodAiUses=parseInt(localStorage.getItem('ft4_foodai')||'0')||0;
    /* ⚠️ UN TABLEAU N'EST PAS UN PROFIL SANTÉ (17/08/2026, ceinture et bretelles).
       Tant que `ft4_health` a été partagée avec la boîte de la montre (ft-v880 → ft-v895), la clé
       a pu se retrouver avec un TABLEAU dedans. Sans ce garde-fou, `S.healthProfile` deviendrait ce
       tableau, `hp.injuries` serait `undefined`, et `_gardienRules()` rendrait une chaîne vide :
       **le bloc de sécurité disparaîtrait en silence**. Ce n'est pas un cas théorique gratuit —
       c'est le seul endroit où une clé mal partagée pouvait coûter autre chose que des données. */
    S.healthProfile=(function(){ const v=JSON.parse(localStorage.getItem('ft4_health')||'null');
      return (v&&typeof v==='object'&&!Array.isArray(v))?v:null; })();
    S.bodyStudy=JSON.parse(localStorage.getItem('ft4_bodystudy')||'null');
    // Historique des études corporelles (le plus récent en tête). Migration : si pas encore
    // d'historique mais un dernier bilan existe, on l'initialise avec ce bilan.
    S.bodyStudies=JSON.parse(localStorage.getItem('ft4_bodystudies')||'null')||(S.bodyStudy?[S.bodyStudy]:[]);
    S.bodyScans=JSON.parse(localStorage.getItem('ft4_bodyscans')||'[]');
    // Migration 30/07/2026 (retour Eline, décision Michel : « si on peut le faire par calcul,
    // le faire de suite et sur les anciennes pesées ») : masse maigre = poids − masse grasse.
    // Complète les bilans DÉJÀ importés où le lecteur l'avait ratée — même formule que le
    // backend (repli déterministe @auto 30/07). On ne touche jamais une valeur déjà lue.
    (S.bodyScans||[]).forEach(sc=>{
      if(!sc)return;
      const W=Number(sc.weight);
      // Étendu 31/07/2026 (même famille que le bug d'Eline, audit) : la masse grasse en kg
      // et le % de masse grasse se déduisent l'un de l'autre quand le poids est lu — beaucoup
      // de balances n'affichent que l'un des deux. L'ordre compte : on complète fatMass/bf
      // AVANT la masse maigre, pour que la chaîne aboutisse (bf → fatMass → leanMass).
      if((sc.fatMass==null||!isFinite(Number(sc.fatMass)))
         &&isFinite(W)&&W>0
         &&isFinite(Number(sc.bf))&&Number(sc.bf)>0&&Number(sc.bf)<100){
        sc.fatMass=Math.round(W*Number(sc.bf)/100*10)/10;
      }
      if((sc.bf==null||!isFinite(Number(sc.bf)))
         &&isFinite(W)&&W>0
         &&isFinite(Number(sc.fatMass))&&Number(sc.fatMass)>0
         &&Number(sc.fatMass)<W){
        sc.bf=Math.round(Number(sc.fatMass)/W*1000)/10;
      }
      if((sc.leanMass==null||!isFinite(Number(sc.leanMass)))
         &&isFinite(W)&&W>0
         &&isFinite(Number(sc.fatMass))&&Number(sc.fatMass)>0
         &&Number(sc.fatMass)<W){
        sc.leanMass=Math.round((W-Number(sc.fatMass))*10)/10;
      }
    });
    S.bloodTests=JSON.parse(localStorage.getItem('ft4_bloodtests')||'[]');
    S.coachQuiz=JSON.parse(localStorage.getItem('ft4_coachquiz')||'null');
    S.coachQuizPro=JSON.parse(localStorage.getItem('ft4_coachquizpro')||'null');
    S.scaleType=localStorage.getItem('ft4_scaletype')||''; // '' | 'feet' | 'handsfeet'
    S.emailVerified=localStorage.getItem('ft4_email_verified')==='1';
    S.diet=localStorage.getItem('ft4_diet')||''; // '' | omnivore | vegetarien | vegan | pescetarien
    S.dietRestrictions=JSON.parse(localStorage.getItem('ft4_diet_restr')||'[]'); // halal, casher, sansporc, ...
    S.dietNotes=localStorage.getItem('ft4_diet_notes')||'';
    S.a11y=localStorage.getItem('ft4_a11y')==='1';
    S.colorblind=localStorage.getItem('ft4_cb')||'';
    S.leftHand=localStorage.getItem('ft4_lh')==='1';
    // Migration one-time : exercices EN → FR
    if(!localStorage.getItem('ft4_exmig2')){
      const _REN={'Rack Pull':'Tirage en Rack (Rack Pull)','Good Morning':'Inclinaison Lombaire (Good Morning)',
        'Rowing Chest Supported':'Rowing Poitrine Appuyée (Chest Supported)','Shrugs':'Haussements d\'Épaules (Shrugs)',
        'Arnold Press':'Développé Arnold (Arnold Press)','Face Pull':'Tirage Visage (Face Pull)',
        'Upright Row':'Tirage Menton Kettlebell','Kickback Triceps':'Extension Triceps Arrière (Kickback)',
        'Hack Squat':'Squat Hack (Hack Squat)','Step-up':'Montée sur Box (Step-up)',
        'Leg Extension':'Extension Quadriceps (Leg Extension)','Leg Abduction':'Abduction Cuisses (Leg Abduction)',
        'Leg Adduction':'Adduction Cuisses (Leg Adduction)','Hip Thrust':'Poussée de Hanche (Hip Thrust)',
        'Glute Bridge':'Pont Fessier (Glute Bridge)','Kickback Fessiers':'Extension Fessiers Arrière (Kickback)',
        'Leg Curl':'Curl Ischio-jambiers (Leg Curl)','Side Plank':'Planche Latérale (Side Plank)',
        'Ab Wheel':'Roue Abdominale (Ab Wheel)','Russian Twist':'Rotation Russe (Russian Twist)',
        'Dragon Flag':'Drapeau (Dragon Flag)','Mountain Climber':'Grimpeur (Mountain Climber)',
        'Leg Press Mollets':'Presse Mollets (Leg Press)','Donkey Calf Raise':'Élévations Mollets Penché (Donkey Calf Raise)'
      };
      Object.keys(_REN).forEach(old=>{if(S.prs[old]){S.prs[_REN[old]]=S.prs[old];delete S.prs[old];}});
      (S.sessions||[]).forEach(sess=>{(sess.exs||sess.exercises||[]).forEach(ex=>{if(_REN[ex.name])ex.name=_REN[ex.name];});});
      localStorage.setItem('ft4_exmig2','1');
      localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
      localStorage.setItem('ft4_sessions',JSON.stringify(S.sessions));
    }
    // Migration one-time : « Press » (exo perso) → « Press Jambes 45° » (biblio) — sans perte de données
    if(!localStorage.getItem('ft4_pressmig1')){
      const _OLD='Press',_NEW='Press Jambes 45°';
      // PR : garder le plus élevé si les deux existent (jamais écraser à la baisse)
      if(S.prs&&S.prs[_OLD]){
        const cur=S.prs[_NEW];
        if(!cur||(S.prs[_OLD].rm1||0)>(cur.rm1||0))S.prs[_NEW]=S.prs[_OLD];
        delete S.prs[_OLD];
      }
      // Historique des séances
      (S.sessions||[]).forEach(sess=>(sess.exs||sess.exercises||[]).forEach(ex=>{if(ex.name===_OLD)ex.name=_NEW;}));
      // Programmes sauvegardés (structure à jours OU exs à plat)
      (S.programmes||[]).forEach(p=>{
        (p.exs||[]).forEach(ex=>{if(ex.name===_OLD)ex.name=_NEW;});
        (p.days||[]).forEach(d=>(d.exs||[]).forEach(ex=>{if(ex.name===_OLD)ex.name=_NEW;}));
      });
      // Retirer l'entrée perso « Press » (le nouvel exo est dans EXLIB)
      if(S.customExercises)S.customExercises=S.customExercises.filter(e=>e.n!==_OLD);
      localStorage.setItem('ft4_pressmig1','1');
      localStorage.setItem('ft4_prs',JSON.stringify(S.prs||{}));
      localStorage.setItem('ft4_sessions',JSON.stringify(S.sessions||[]));
      localStorage.setItem('ft4_progs',JSON.stringify(S.programmes||[]));
      localStorage.setItem('ft4_cuex',JSON.stringify(S.customExercises||[]));
    }
    // Migration : « zones fragiles » déplacées de l'ADN sportif → Profil Santé (séparation ADN/Santé, cf. Gardien 6A).
    // Idempotente + robuste au cloud : tant qu'un ADN a un `fragile` rempli, on le bascule dans les notes Santé et on le vide.
    if(typeof _migrateFragileToHealth==='function')_migrateFragileToHealth();
    // Migration set-tags : W→É, E→X, D→N (one-time)
    if(!localStorage.getItem('ft4_stmig1')){
      const _migSet=s=>{if(s.type==='W')s.type='É';else if(s.type==='E')s.type='X';else if(s.type==='D')s.type='N';};
      (S.sessions||[]).forEach(sess=>(sess.exs||sess.exercises||[]).forEach(ex=>(ex.sets||[]).forEach(_migSet)));
      if(S.wkt&&S.wkt.exs)S.wkt.exs.forEach(ex=>(ex.sets||[]).forEach(_migSet));
      localStorage.setItem('ft4_stmig1','1');
      localStorage.setItem('ft4_sessions',JSON.stringify(S.sessions));
      if(S.wkt)localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt));
    }
    // Registre Athlète (brique 2) : recalcule les faits mesurés au démarrage.
    try{if(typeof computeRegistreFacts==='function')computeRegistreFacts();}catch(e){}
  }catch(e){}
}
// Bascule le champ « zones fragiles » de l'ADN sportif vers les notes du Profil Santé (séparation ADN/Santé).
// Idempotente : ne fait rien si l'ADN n'a pas de `fragile`. Appelée au load ET après une restauration cloud
// (robuste : même si le cloud renvoie un vieil ADN avec `fragile` rempli, on le déplace vers la Santé).
function _migrateFragileToHealth(){
  try{
    const frag=((S.adn&&S.adn.fragile)||'').trim();
    if(!frag){if(!localStorage.getItem('ft4_fragmig1'))localStorage.setItem('ft4_fragmig1','1');return;}
    const hp=S.healthProfile||{conditions:[],injuries:[],notes:''};
    hp.conditions=hp.conditions||[];hp.injuries=hp.injuries||[];
    const notes=(hp.notes||'').trim();
    if(notes.indexOf(frag)<0)hp.notes=(notes?notes+'\n':'')+'Zones fragiles : '+frag;
    S.healthProfile=hp;
    S.adn.fragile='';
    localStorage.setItem('ft4_health',JSON.stringify(S.healthProfile));
    localStorage.setItem('ft4_adn',JSON.stringify(S.adn));
    localStorage.setItem('ft4_fragmig1','1');
  }catch(e){console.warn('[FT fragmig]',e);}
}
function persist(){
  // Mode démo : on ne sauvegarde RIEN (ni local, ni cloud) — les vraies données restent figées telles quelles
  if(window._demoMode)return;
  try{
    localStorage.setItem('ft4_bw',S.bw);localStorage.setItem('ft4_bar',S.barW);
    localStorage.setItem('ft4_rest',S.defRest);localStorage.setItem('ft4_expandall',S.expandAll?'1':'0');localStorage.setItem('ft4_keto',S.keto?'1':'0');localStorage.setItem('ft4_foodmode',S.foodMode||'');localStorage.setItem('ft4_fasting',S.fasting||'');localStorage.setItem('ft4_gender',S.gender);
    localStorage.setItem('ft4_age',S.age);localStorage.setItem('ft4_ht',S.height);
    localStorage.setItem('ft4_act',S.activityLevel);
    localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,1500)));
    localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
    localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt));
    localStorage.setItem('ft4_nextplanned',JSON.stringify(S.nextPlanned||null)); // séance annoncée à Milo (ft-v601)
    localStorage.setItem('ft4_cycle',JSON.stringify(S.cycle||null)); // cycle de force : local-first (était lu mais jamais écrit)
    // Brouillon de secours — effacé quand séance vide ou après sauvegarde dans finishWorkout()
    if(S.wkt&&S.wkt.exs&&S.wkt.exs.length){
      localStorage.setItem('ft4_wkt_draft',JSON.stringify(S.wkt));
    }else{
      localStorage.removeItem('ft4_wkt_draft');
    }
    localStorage.setItem('ft4_email',S.email);localStorage.setItem('ft4_ok',S.connected?'1':'0');
    // Stockage redondant email (cookie + IDB) — silencieux si _saveEmailRedundant pas encore chargé
    if(S.email&&typeof _saveEmailRedundant==='function')_saveEmailRedundant(S.email);
    // Flag "l'utilisateur a eu des données" — survit aux purges partielles
    if(S.sessions&&S.sessions.length>0){try{localStorage.setItem('ft4_had_data','1');}catch(e){}}
    localStorage.setItem('ft4_nphase',S.nutritionPhase);
    if(S.creatDose)localStorage.setItem('ft4_creatdose',String(S.creatDose));else localStorage.removeItem('ft4_creatdose');
    localStorage.setItem('ft4_work',S.workType);
    localStorage.setItem('ft4_halo',S.halo);
    localStorage.setItem('ft4_haloColor',S.haloColor);
    localStorage.setItem('ft4_haloDir',S.haloDir);
    localStorage.setItem('ft4_smoker',S.smoker?'1':'0');
    localStorage.setItem('ft4_mcstart',S.mensCycleStart);
    localStorage.setItem('ft4_mcdur',S.mensCycleDur);
    localStorage.setItem('ft4_contra',S.contraception||'');
    localStorage.setItem('ft4_morpho',S.morpho||'');
    localStorage.setItem('ft4_morphot',S.morphotype||'');
    localStorage.setItem('ft4_cuex',JSON.stringify(S.customExercises||[]));
    localStorage.setItem('ft4_exphotos',JSON.stringify(S.exPhotos||{}));
    localStorage.setItem('ft4_neck',S.neck||0);
    localStorage.setItem('ft4_waist',S.waist||0);
    localStorage.setItem('ft4_hip',S.hip||0);
    localStorage.setItem('ft4_target',S.targetWeight||0);
    localStorage.setItem('ft4_manualkcal',S.manualKcal||0);
    localStorage.setItem('ft4_goal',S.goal||'muscle');
    localStorage.setItem('ft4_goal2',S.goal2||'');
    localStorage.setItem('ft4_priorities',JSON.stringify(S.priorities||[]));
    localStorage.setItem('ft4_discipline',S.discipline||'muscu');
    localStorage.setItem('ft4_level',S.level||'');
    localStorage.setItem('ft4_coachtone',S.coachTone||'');
    localStorage.setItem('ft4_registre',JSON.stringify(S.registre||{facts:{},observations:[],updatedAt:''}));
    localStorage.setItem('ft4_adn',JSON.stringify(S.adn||{motivation:'',lifestyle:'',preferences:'',experience:'',fragile:''}));
    localStorage.setItem('ft4_daystate',JSON.stringify(S.dayState||null));
    localStorage.setItem('ft4_dayslog',JSON.stringify(S.dayStateLog||[]));
    localStorage.setItem('ft4_healthbox',JSON.stringify(S.healthInbox||[]));   // ⌚ voir load() : PAS ft4_health
    localStorage.setItem('ft4_healthd',JSON.stringify(S.healthDaily||[]));
    localStorage.setItem('ft4_levelAuto',S.levelAuto?'1':'0');
    localStorage.setItem('ft4_bjourney',JSON.stringify(S.beginnerJourney||null));
    localStorage.setItem('ft4_sleep',JSON.stringify(S.sleepLog||[]));
    localStorage.setItem('ft4_wlog',JSON.stringify(S.weightLog||[]));
    localStorage.setItem('ft4_strgoals',JSON.stringify(S.strengthGoals||{}));
    localStorage.setItem('ft4_name',S.name||'');
    localStorage.setItem('ft4_progs',JSON.stringify(S.programmes||[]));
    localStorage.setItem('ft4_tester_ideas',JSON.stringify(S.testerIdeas||[]));
    localStorage.setItem('ft4_body_series',JSON.stringify(S.bodySeries||[]));
    localStorage.setItem('ft4_progexos',JSON.stringify(S.progExos||BIG4));
    localStorage.setItem('ft4_coachFree',S.coachFree||0);
    localStorage.setItem('ft4_histImp',S.histImports||0);
    localStorage.setItem('ft4_bsimports',S.bodyScanImports||0);
    localStorage.setItem('ft4_progimports',S.progImports||0);
    localStorage.setItem('ft4_coach_mem',S.coachMemory||'');
    localStorage.setItem('ft4_exRp',JSON.stringify(S.exRestPref||{}));
    localStorage.setItem('ft4_exswaps',JSON.stringify(S.exSwaps||{}));
    localStorage.setItem('ft4_premium',S.premium?'1':'0');
    localStorage.setItem('ft4_premiumExp',S.premiumExpiry||'');
    localStorage.setItem('ft4_badges',JSON.stringify(S.badges||{}));
    localStorage.setItem('ft4_bday',S.bday||'');
    localStorage.setItem('ft4_lws',S.lastWeekSummary||'');
    localStorage.setItem('ft4_lms',S.lastMonthSummary||'');
    localStorage.setItem('ft4_mealplan',JSON.stringify(S.mealPlan||null));
    localStorage.setItem('ft4_foodlog',JSON.stringify(S.foodLog||[]));
    localStorage.setItem('ft4_savedfoods',JSON.stringify(S.savedFoods||[]));
    localStorage.setItem('ft4_hiddenfoods',JSON.stringify(S.hiddenFoods||[]));
    localStorage.setItem('ft4_foodai',String(S.foodAiUses||0));
    localStorage.setItem('ft4_health',JSON.stringify(S.healthProfile||null));
    localStorage.setItem('ft4_bodystudy',JSON.stringify(S.bodyStudy||null));
    localStorage.setItem('ft4_bodystudies',JSON.stringify(S.bodyStudies||[]));
    localStorage.setItem('ft4_bodyscans',JSON.stringify(S.bodyScans||[]));
    localStorage.setItem('ft4_bloodtests',JSON.stringify(S.bloodTests||[]));
    localStorage.setItem('ft4_coachquiz',JSON.stringify(S.coachQuiz||null));
    localStorage.setItem('ft4_coachquizpro',JSON.stringify(S.coachQuizPro||null));
    localStorage.setItem('ft4_scaletype',S.scaleType||'');
    localStorage.setItem('ft4_email_verified',S.emailVerified?'1':'0');
    localStorage.setItem('ft4_diet',S.diet||'');
    localStorage.setItem('ft4_diet_restr',JSON.stringify(S.dietRestrictions||[]));
    localStorage.setItem('ft4_diet_notes',S.dietNotes||'');
    localStorage.setItem('ft4_a11y',S.a11y?'1':'0');
    localStorage.setItem('ft4_cb',S.colorblind||'');
    localStorage.setItem('ft4_lh',S.leftHand?'1':'0');
  }catch(e){
    if(e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22)){
      try{
        // Fallback : allège les sessions à 50 et réessaie les clés critiques
        // ⚠️ 02/08 : on POSE UN DRAPEAU. Sans lui, au redémarrage suivant l'app ne connaissait
        // plus que 50 séances, les renvoyait au serveur, et le cloud était écrasé par la version
        // tronquée — alors que le message ci-dessous promet l'inverse. Tant que ce drapeau est
        // levé, `_cloudSync` n'envoie PLUS les séances (règle d'or n°1 : zéro perte).
        localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,50)));
        localStorage.setItem('ft4_hist_tronque','1'); S.histTronque=true;
        localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
        localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt));
        if(typeof toast==='function')toast('⚠️ Stockage du téléphone plein — seules tes 50 dernières séances restent SUR LE TÉLÉPHONE. Ta sauvegarde en ligne est intacte et protégée : fais « Restaurer » dans Profil pour tout récupérer.','error');
      }catch(e2){}
    }else{
      // 🛡️ Audit 27/07 : une erreur NON-quota était 100 % silencieuse → au moins une trace console
      try{console.warn('[FT persist] échec de sauvegarde locale :',e);}catch(_){}
    }
  }
  // Mise à jour reportée (app.js) : elle ne s'applique QUE sur l'accueil, sans séance en cours ni
  // récapitulatif ouvert — voir `_majPeutSAppliquer`. Une seule décision, un seul endroit (R2).
  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}
  _cloudSyncDebounced();
}

// ─── UTILS ───────────────────────────────────────────────────
const fmt=n=>Math.round(n*10)/10;
const bz=(kg,r)=>(!kg||!r||r<1)?0:(r===1?kg:fmt(kg/(1.0278-0.0278*Math.min(r,20))));
// ⚠️ LA DATE DU JOUR EST CELLE DU TÉLÉPHONE, JAMAIS CELLE DE GREENWICH (ft-v655).
// toISOString() renvoie la date UTC : en France (UTC+2 l'été), entre MINUIT et 2 H du matin
// il est encore « hier » à Greenwich → une séance finie à 00 h 30 était datée de la veille,
// et le check-in / le sommeil / les badges tombaient dans le mauvais jour. Bug SILENCIEUX :
// rien ne plante, la date est juste fausse. On décale de l'écart horaire local avant de couper.
// 🚫 Ne JAMAIS revenir à `new Date().toISOString()` pour obtenir un jour calendaire.
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().split('T')[0];};
// Jour calendaire LOCAL d'un timestamp (même règle que today() : l'heure du téléphone, pas Greenwich).
// Sert aux replis « séance sans date » — un ts de 00 h 30 doit donner le jour d'aujourd'hui, pas la veille.
const dayOfTs=ts=>{const d=new Date(ts);return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().split('T')[0];};
const fmtD=d=>d?new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}):'';

// ─── PROCHAINE SÉANCE ANNONCÉE — la règle « cette annonce tient-elle encore ? » (ft-v654) ───
// ⚠️ SOURCE DE VÉRITÉ UNIQUE (R2). L'Accueil ET le chat de Milo doivent répondre PAREIL :
// jusqu'à ft-v654 l'Accueil disait « séance prévue lundi, je m'en souviens » pendant que le
// chat n'avait jamais reçu l'info → Milo affirmait se souvenir de ce qu'il n'avait pas (R4a).
// PURE et SANS EFFET DE BORD : elle ne nettoie rien (c'est l'Accueil qui nettoie, lui seul écrit).
// Périmée = date passée, illisible, OU une séance déjà enregistrée le jour prévu ou après.
function plannedSession(){
  try{
    const np=S.nextPlanned;
    if(!np||!np.date)return null;
    const t=today();
    const days=Math.round((new Date(np.date+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);
    if(isNaN(days)||days<0)return null;
    const sess=(S.sessions||[]).filter(s=>s.date);
    const lastDate=sess.length?sess.map(s=>s.date).sort().slice(-1)[0]:null;
    if(lastDate&&lastDate>=np.date)return null;   // annonce honorée : la séance a été faite
    return {date:np.date,label:String(np.label||''),days:days};
  }catch(e){return null;}
}

// ─── NUTRITION CALCULATIONS ──────────────────────────────────
//
// ═══════════════════════════════════════════════════════════════════════════════════
// LE MÉTABOLISME DE BASE — deux formules, et on DIT laquelle on emploie (11/08/2026)
// ═══════════════════════════════════════════════════════════════════════════════════
// D'OÙ ÇA VIENT. Michel, après une nuit passée à chercher des sources sur les calories :
// « on tient compte dans l'appli de la valeur de base du métabolisme de la balance ? »
// Réponse honnête : NON. Le métabolisme lu sur sa balance à impédance était stocké,
// affiché dans le Bilan corporel, envoyé à Milo… et n'entrait dans AUCUN calcul.
// Une donnée gardée et jamais exploitée — exactement ce que R5 demande de chercher.
//
// ⚠️ POURQUOI ÇA COMPTE, et ce n'est pas un détail d'expert : Mifflin-St Jeor ne connaît
// que le POIDS TOTAL. Il traite 84 kg de muscle comme 84 kg de gras. Sur quelqu'un de
// musclé il SOUS-ESTIME — mesuré sur un gabarit 84 kg / 178 cm / 45 ans à 15 % de masse
// grasse : 1732 contre 1912, soit ~180 kcal PAR JOUR. Et le métabolisme de base pèse
//   ⚠️⚠️ CE GABARIT EST UN MANNEQUIN DE CALCUL, PAS MICHEL. C'est un jeu de valeurs rondes
//   choisi pour que l'écart entre les deux formules soit refaisable à la main par n'importe
//   qui. Michel n'a PAS 45 ans, et son âge ne doit jamais se lire ici : il vit dans `S.age`,
//   saisi dans son profil. Le 12/08/2026 j'ai fait exactement cette confusion en lui donnant
//   un conseil d'entraînement « à 45 ans » — il a dû me corriger (il en a 48). Un chiffre
//   d'exemple posé à côté d'un vrai calcul finit toujours par être pris pour une donnée.
// 60-70 % de la dépense totale : c'est le seul endroit où on peut gagner en précision
// sans montre, sans ceinture et sans API.
//
// ⚠️ ON N'AVALE PAS LE CHIFFRE DE LA BALANCE. Il sort d'une boîte noire propre au
// fabricant, invérifiable. On utilise à la place **KATCH-McARDLE** — formule publiée,
// citable, qu'on peut poser sur une table : BMR = 370 + 21,6 × masse maigre (kg).
// C'est le standard de sa question de la nuit : « scientifiquement prouvé ET prouvable ».
// La masse maigre, elle, on l'a déjà : la balance la donne, et l'app la complète toute
// seule depuis la correction du 30/07 (retour Eline).
//
// ⚠️⚠️ ET ON SE TAIT DÈS QUE LA MESURE N'EST PLUS « LA SIENNE D'AUJOURD'HUI » (R29) :
//   · plus de 90 jours → on retombe sur Mifflin. Une composition corporelle du printemps
//     n'est pas la sienne en août, et un chiffre faux présenté comme précis est pire
//     qu'un chiffre approximatif présenté comme tel ;
//   · plus de 5 % d'écart entre le poids du bilan et le poids d'aujourd'hui → Mifflin
//     aussi. On ne sait PAS si les 4 kg pris sont du muscle ou du gras ; extrapoler
//     reviendrait à inventer la seule chose qu'on cherchait à mesurer.
// Dans les deux cas l'app le DIT (voir `bmrMethode`), elle ne bascule jamais en silence.
const BMR_LM_JOURS = 90;     // fraîcheur maximale d'un bilan corporel pour servir au calcul
const BMR_LM_ECART = 0.05;   // écart de poids toléré entre le bilan et aujourd'hui (5 %)

/** La mesure de composition corporelle la PLUS RÉCENTE, d'où qu'elle vienne — ou `null`.
 *  Deux sources possibles (bilan de balance, ou une pesée où le % de gras a été noté) :
 *  on prend la plus récente des deux, jamais deux fois la même information (R2). */
function leanMassRecente(){
  const cand=[];
  (S.bodyScans||[]).forEach(sc=>{
    if(!sc||!sc.date)return;
    const lm=Number(sc.leanMass);
    if(isFinite(lm)&&lm>0)cand.push({date:sc.date,lm:lm,poids:Number(sc.weight)||null,src:'bilan corporel'});
  });
  (S.weightLog||[]).forEach(w=>{
    if(!w||!w.date)return;
    const bf=Number(w.bf),bw=Number(w.bw);
    if(!(isFinite(bf)&&bf>0&&bf<70&&isFinite(bw)&&bw>0))return;
    cand.push({date:w.date,lm:Math.round(bw*(1-bf/100)*10)/10,poids:bw,src:'pesée'});
  });
  if(!cand.length)return null;
  cand.sort((a,b)=>b.date.localeCompare(a.date));
  return cand[0];
}

/** Le métabolisme de base AVEC sa provenance — pour que l'app puisse l'AFFICHER.
 *  `methode` vaut 'katch' ou 'mifflin' ; `raison` dit pourquoi quand on n'a pas pris Katch. */
function bmrDetail(){
  if(!S.bw||!S.height||!S.age) return {kcal:0,methode:null,raison:'profil incomplet'};
  const base=10*S.bw+6.25*S.height-5*S.age;
  const mifflin=Math.round(S.gender==='H'?base+5:base-161);
  const fin=v=>S.smoker?Math.round(v*1.07):v;   // le +7 % fumeur est un effet du tabac sur le
                                                // métabolisme, pas un correctif de formule :
                                                // il s'applique donc AUX DEUX, sinon arrêter de
                                                // fumer ferait « sauter » 100 kcal en changeant
                                                // simplement de source de mesure.
  const lm=leanMassRecente();
  if(!lm) return {kcal:fin(mifflin),methode:'mifflin',raison:'aucune mesure de composition corporelle',mifflin:fin(mifflin)};
  const jours=Math.round((new Date(today()+'T12:00:00')-new Date(lm.date+'T12:00:00'))/864e5);
  if(!(jours>=0&&jours<=BMR_LM_JOURS))
    return {kcal:fin(mifflin),methode:'mifflin',raison:'dernier bilan trop ancien ('+(isNaN(jours)?'?':jours)+' j)',mifflin:fin(mifflin),lm:lm};
  if(lm.poids&&S.bw&&Math.abs(S.bw-lm.poids)/lm.poids>BMR_LM_ECART)
    return {kcal:fin(mifflin),methode:'mifflin',raison:'ton poids a changé de plus de 5 % depuis ce bilan',mifflin:fin(mifflin),lm:lm};
  const katch=Math.round(370+21.6*lm.lm);
  return {kcal:fin(katch),methode:'katch',raison:'',mifflin:fin(mifflin),lm:lm,jours:jours};
}

function calcBMR(){ return bmrDetail().kcal; }
function calcWorkExtra(){return{bureau:0,debout:200,actif:325,physique:450}[S.workType]||0;}
// AUTRE SPORT déclaré (profil vivant, « vélo/course/foot… ») → la dépense DESCEND dans le chiffre
// (audit 30/07, R4 : l'aide promettait « change tes calories » alors que rien ne bougeait).
// +150 kcal/j : moyenne prudente d'une pratique loisir (~2-3 fois/sem), soit une DEMI-marche du
// multiplicateur d'activité (~310 kcal). ⚠️ PAS de double comptage : à « Actif (5-6j) » ou
// « Très actif » (≥ 1.725), les jours d'entraînement déclarés couvrent déjà l'autre sport → +0.
// La RÉCUPÉRATION, elle, ne reçoit AUCUN malus aveugle : l'app ne sait pas QUAND la personne
// pratique — inventer une fatigue permanente serait faire semblant de savoir (Principe 18, R29).
// C'est Milo qui en tient compte dans ses conseils (il reçoit l'info dans son contexte).
function calcSportExtra(){
  const os=S.coachQuiz&&S.coachQuiz.answers&&S.coachQuiz.answers.othersport;
  if(!os||os==='aucun')return 0;
  return (S.activityLevel||1.55)>=1.725?0:150;
}
function calcTDEE(){return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra());}

/* 🏋️ LE NIVEAU D'ACTIVITÉ CONTIENT DÉJÀ L'ENTRAÎNEMENT — et il ne se mettait JAMAIS à jour
   (21/08/2026). Michel : « bon la nutrition lol ? ».
   ⭐⭐ J'AI D'ABORD ANNONCÉ L'INVERSE, ET LE CODE M'A CONTREDIT. Je lui ai dit « la nutrition
   ignore complètement l'entraînement ». C'est FAUX : l'écran Nutrition affichait déjà
   « Total = dépense + séance ». Le vrai défaut est le contraire — cette addition COMPTE LA
   SÉANCE DEUX FOIS. Le multiplicateur s'appelle littéralement « Modéré (3-4j) » : les 3-4
   séances par semaine sont DÉJÀ dedans, lissées sur la semaine. Y rajouter la séance du jour
   la facture une seconde fois. *Une vérification a retourné le diagnostic — c'est exactement
   pour ça que R28 existe : on ne code pas sur une limite qu'on n'a pas ouverte.*
   ⚠️⚠️ ET LE DÉFAUT DE FOND EST AILLEURS, IL EST PLUS GRAVE : `applyFreqContext` (tracking.js)
   demande à la personne « tu t'entraînes plutôt 5 fois maintenant, on met à jour ? », elle
   répond OUI… et ça n'écrit que `coachQuiz.answers.freq`. **`S.activityLevel` ne bouge pas.**
   Donc le TDEE, les macros et l'anneau restent calés sur une fréquence que la personne a
   elle-même corrigée. C'est **R4 dans sa forme la plus pure** : l'info est collectée, validée
   par la personne, stockée — et n'atteint jamais le calcul qui en a besoin. Doublé de **R2** :
   deux déclarations du MÊME fait (`coachQuiz.answers.freq` et `S.activityLevel`) qui peuvent
   diverger sans que rien ne le signale.
   ⛔ ON PROPOSE, ON N'APPLIQUE JAMAIS TOUT SEUL. Changer une cible calorique dans le dos de la
   personne est typiquement « l'erreur qui la touche » (**R29**) : on montre les chiffres, elle
   tranche. Même règle que `manualKcal`, qu'on ne relève jamais en douce. */
const _ACT_PAR_FREQ={'1':1.375,'3':1.55,'4':1.55,'5':1.725};
const ACT_LABELS={1.375:'Léger (1-2j)',1.55:'Modéré (3-4j)',1.725:'Actif (5-6j)',1.9:'Très actif'};
function ecartNiveauActivite(){
  try{
    // R2/R13 : on RÉUTILISE le comptage du détecteur de fréquence (tracking.js) au lieu d'en
    // écrire un second. Deux comptages de séances finiraient par ne plus dire la même chose.
    if(typeof _weeklyCounts!=='function'||typeof _freqBucketOf!=='function')return null;
    const wk=_weeklyCounts(4);
    if(wk.filter(c=>c>0).length<3)return null;      // pas assez d'historique pour juger (même seuil)
    /* ⚠️ LA COHÉRENCE AVANT LA RÉACTIVITÉ (R12) : il faut le MÊME rythme sur au moins 3 des 4
       semaines. Une semaine chargée, une coupure, des vacances ne doivent pas déplacer une
       cible calorique — sinon on change ce que la personne mange sur du bruit. */
    const cnt={};
    wk.forEach(c=>{ const b=_freqBucketOf(c); cnt[b]=(cnt[b]||0)+1; });
    const bucket=Object.keys(cnt).find(b=>cnt[b]>=3);
    const suggere=bucket?_ACT_PAR_FREQ[bucket]:null;
    if(!suggere)return null;
    const actuel=+S.activityLevel||1.55;
    /* ⛔ « Très actif » (1.9) ne se redescend PAS sur un simple comptage de séances : c'est un
       profil (double séance, métier physique, sport à côté) que le nombre de séances de
       musculation ne mesure pas. On ne devine pas ce qu'on ne sait pas (R29). */
    if(actuel>=1.9||suggere===actuel)return null;
    /* ⛔ ANTI-HARCÈLEMENT : on ne repropose pas un niveau déjà REFUSÉ. Une carte qui revient
       après un « Garder » se lit comme une insistance, et un garde-fou qui insiste finit
       ignoré ou désactivé (R19/R24). Même mécanique que `registre.ctxFreq`. */
    const cx=S.registre&&S.registre.ctxAct;
    if(cx&&cx.result==='kept'&&+cx.niveau===suggere)return null;
    const moy=wk.reduce((a,b)=>a+b,0)/wk.length;
    return {actuel, suggere, moy:Math.round(moy*10)/10, semaines:wk,
            labelActuel:ACT_LABELS[actuel]||String(actuel), labelSuggere:ACT_LABELS[suggere]};
  }catch(e){ return null; }
}
/* Combien la bascule changerait la CIBLE — calculé, jamais annoncé au doigt mouillé : la
   personne décide sur ce chiffre, donc il doit être le vrai. */
function ecartNiveauKcal(ec){
  try{
    if(!ec)return 0;
    const av=autoKcal(S.nutritionPhase);
    const gard=S.activityLevel; S.activityLevel=ec.suggere;
    const ap=autoKcal(S.nutritionPhase);
    S.activityLevel=gard;                          // ⛔ on REMET, toujours : on simule, on n'applique pas
    return ap-av;
  }catch(e){ try{ S.activityLevel=(ec&&ec.actuel)||S.activityLevel; }catch(e2){} return 0; }
}

// ── Régime alimentaire + restrictions (végé, halal, allergies…) ──
const DIET_LABELS={omnivore:'Omnivore',vegetarien:'Végétarien',vegan:'Végan',pescetarien:'Pescétarien'};
const DIET_RESTR_LABELS={halal:'Halal',casher:'Casher',sansporc:'Sans porc',sansboeuf:'Sans bœuf / viande rouge',sansalcool:'Sans alcool',sanslactose:'Sans lactose',sansgluten:'Sans gluten'};
// Résumé lisible du régime pour l'IA (plan de repas + Milo). Vide si rien de renseigné.
function dietSummary(){
  const parts=[];
  if(S.diet&&DIET_LABELS[S.diet])parts.push(DIET_LABELS[S.diet]);
  const rs=(S.dietRestrictions||[]).map(r=>DIET_RESTR_LABELS[r]||r).filter(Boolean);
  if(rs.length)parts.push(rs.join(', '));
  const n=(S.dietNotes||'').trim();
  if(n)parts.push('à éviter: '+n);
  return parts.join(' · ');
}

function getMensCyclePhase(){
  if(S.gender!=='F')return null;
  const hormonalContra=['pill-combo','pill-prog','implant','iud-hormonal'];
  if(hormonalContra.includes(S.contraception||'')){
    return{hormonal:true,phase:'Contraception hormonale',day:null,dur:null,icon:'💊',color:'var(--t2)',perf:null,
      nutrition:'Avec une contraception hormonale, les phases naturelles du cycle sont modifiées. Maintiens une alimentation équilibrée et écoute ton corps au quotidien.',
      training:'Les fluctuations hormonales liées au cycle naturel sont atténuées. Entraîne-toi selon ta forme du jour.'};
  }
  if(!S.mensCycleStart)return null;
  const elapsed=Math.floor((new Date()-new Date(S.mensCycleStart+'T12:00:00'))/864e5);
  if(elapsed<0)return null;
  const dur=S.mensCycleDur||28;
  const day=(elapsed%dur)+1;
  const ovDay=Math.max(10,dur-14);
  const copper=S.contraception==='iud-copper';
  const copperNote=copper?' (Règles potentiellement plus abondantes avec DIU cuivre)':'';
  if(day<=5) return{phase:'Menstruation',day,dur,ovDay,icon:'🔴',color:'var(--red)',perf:'low',
    nutrition:'Privilégie le fer (viande rouge, légumineuses), magnésium et oméga-3 anti-inflammatoires. Réduis légèrement les glucides.'+copperNote,
    training:'Repos actif ou séances légères. Yoga, marche, mobilité. Évite les charges maximales et le surentraînement.'};
  if(day<ovDay) return{phase:'Folliculaire',day,dur,ovDay,icon:'🌱',color:'var(--green)',perf:'rising',
    nutrition:'Phase anabolique optimale. Augmente glucides complexes et protéines pour soutenir la progression musculaire.',
    training:'Période idéale pour les records et la progression. Corps en phase anabolique, récupération accélérée — pousse les charges.'};
  if(day<=ovDay+2) return{phase:'Ovulation',day,dur,ovDay,icon:'⚡',color:'var(--gold)',perf:'peak',
    nutrition:'Pic de performance. Maintiens les macros habituelles. Hydratation renforcée (+0.5L/j).',
    training:'Énergie et force au maximum. Séances intensives recommandées — c\'est le meilleur moment pour tenter des PRs.'};
  return{phase:'Lutéale',day,dur,ovDay,icon:'🌙',color:'var(--purp)',perf:'declining',
    nutrition:'+150 kcal/j appliqués automatiquement. Augmente protéines et magnésium pour réduire les symptômes prémenstruels.',
    training:'Fatigue accrue est normale. Privilégie volume modéré, exercices familiers et bonne récupération entre les séances.'};
}

// Protéines + lipides calés sur le profil (g/kg selon l'objectif) ; les glucides
// complètent le total calorique. Sert au calcul auto ET à l'aperçu du réglage manuel.
function macrosForKcal(kcal){
  const goal=S.goal||'muscle';
  // Régime cétogène (keto, retour Emma) : répartition par POURCENTAGES de calories au lieu du g/kg
  // — 5% glucides / 15% protéines / 80% lipides (standard keto, celui de sa nutritionniste).
  if(S.foodMode==='keto'||S.keto){
    const carbs_g=Math.max(0,Math.round(kcal*0.05/4));
    /* 🛡️ 15 % DE PROTÉINES PASSE SOUS LE SEUIL DU GARDIEN CHEZ QUELQU'UN DE LOURD (18/08/2026).
       Même défaut que le plancher calorique, sur un autre levier : le Gardien alerte sous
       **0,8 g/kg**, et une répartition kéto à 15 % descend en dessous dès que le poids est élevé
       par rapport aux calories — 100 kg à 1 950 kcal donne 73 g, soit 0,73 g/kg. *L'app générait
       la répartition qui déclenche sa propre alerte.* On remonte au plancher, et les LIPIDES
       absorbent la différence : ce sont eux la variable d'ajustement d'un régime cétogène, pas
       les glucides (5 % est la contrainte qui définit le régime, on n'y touche pas). */
    const protMini=Math.round((S.bw||0)*0.8);
    const prot_g =Math.max(0,Math.round(kcal*0.15/4),protMini);
    const reste  =kcal-prot_g*4-carbs_g*4;
    const fat_g  =Math.max(0,Math.round(reste/9));
    return{prot_g,fat_g,carbs_g};
  }
  // LOW CARB : glucides réduits SANS viser la cétose — 25 % glucides / 30 % protéines / 45 % lipides.
  // C'est le choix de ceux à qui le kéto est trop dur à tenir : on garde assez de glucides pour
  // l'entraînement en force, ce que 5 % ne permet pas confortablement.
  if(S.foodMode==='lowcarb'){
    const carbs_g=Math.max(0,Math.round(kcal*0.25/4));
    const prot_g =Math.max(0,Math.round(kcal*0.30/4));
    const fat_g  =Math.max(0,Math.round(kcal*0.45/9));
    return{prot_g,fat_g,carbs_g};
  }
  // PALÉO et MÉDITERRANÉEN ne fixent PAS de répartition de macros : ce sont des choix
  // d'ALIMENTS. On garde donc le calcul normal et on change seulement les repas suggérés —
  // inventer une répartition « paléo » serait un faux-précis (principe 5 de la philosophie).
  const cp=getMensCyclePhase();
  const lutealProt=cp&&cp.phase==='Lutéale'?0.2:0;
  const protRatio=({muscle:2.2,perte:2.5,recomp:2.6,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)+lutealProt;
  const fatRatio={muscle:0.9,perte:0.8,recomp:0.85,force:1.0,equilibre:0.85,endurance:0.75}[goal]||0.9;
  const prot_g=Math.round((S.bw||0)*protRatio);
  const fat_g=Math.round((S.bw||0)*fatRatio);
  const carbs_g=Math.max(0,Math.round((kcal-prot_g*4-fat_g*9)/4));
  return{prot_g,fat_g,carbs_g};
}
// Objectif calorique auto (TDEE + objectif + phase + cycle). Isolé pour l'aperçu « auto ».
// ⚠️ `autoKcal` = la cible RETENUE (plancher compris). `_autoKcalBrut` = le calcul nu, qui
//    n'existe que pour pouvoir DIRE de combien le plancher a relevé la cible. Une seule table
//    d'objectifs, lue par les deux — la recopier serait R2 dans sa forme la plus banale.
function autoKcal(phase){ return _plancherKcal(_autoKcalBrut(phase)); }
function _autoKcalBrut(phase){
  const tdee=calcTDEE();
  const goal=S.goal||'muscle';
  const cp=getMensCyclePhase();
  const lutealBonus=cp&&cp.phase==='Lutéale'?150:0;
  // recomp (perte de gras + muscle) : léger déficit — le corps pioche dans le gras,
  // les protéines élevées (voir macrosForKcal) protègent le muscle → pas de « skinny fat ».
  const goalDelta={muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100}[goal]||350;
  const phaseAdj=phase==='charge'?100:-100;
  return tdee+goalDelta+phaseAdj+lutealBonus;
}
/* 🛡️ L'APP NE PRESCRIT PLUS UNE CIBLE QU'ELLE QUALIFIERAIT D'ALERTE (18/08/2026)
   Trouvé par un contre-audit extérieur, **vérifié ici dans le code** : `autoKcal` était une
   addition sans plancher (TDEE + objectif + phase + cycle). Le Gardien de Milo, lui, alerte
   sous **1500 kcal/j chez un homme et 1200 chez une femme** (coach.js, GARDE-FOUS SANTÉ).
   Les deux ne se parlaient pas. Refait avec nos propres règles :
     · femme 55 kg / 160 cm / 45 ans, sédentaire, objectif perte → **947 kcal** affichés ;
     · la même en phase de décharge → **847 kcal**.
   *L'application prescrivait une cible qu'elle aurait signalée si la personne l'avait mangée.*
   ⚠️⚠️ ET L'ASYMÉTRIE EST PIRE QUE ÇA : le Gardien ne s'allume que si la personne TIENT son
   journal. Or le principe 4 assume qu'une bonne partie ne le tiendra pas — ceux-là voyaient la
   cible et n'avaient **aucun** garde-fou. Le Gardien protégeait la population qui en avait le
   moins besoin. C'est **R2** (deux sources pour la même règle de sécurité) doublé de **R4**.
   ⚠️ LE PLANCHER NE S'APPLIQUE QU'À CE QUE L'APP CALCULE, JAMAIS À `manualKcal` : un chiffre
   saisi à la main est celui de la personne, et le lui relever en douce serait décider à sa
   place (R29 + Constitution — on adapte, on n'interdit pas). Il est en revanche EXPLIQUÉ à
   l'écran, parce qu'une cible qui bouge sans raison visible est pire que pas de plancher. */
const PLANCHER_KCAL={H:1500,F:1200};
function _plancherKcal(k){
  const p=PLANCHER_KCAL[(S.gender==='F')?'F':'H'];
  return Math.max(Math.round(k), p);
}
// Le plancher a-t-il mordu ? (pour l'expliquer à l'écran — jamais un relèvement silencieux)
function plancherKcalActif(phase){
  const brut=_autoKcalBrut(phase);
  const p=PLANCHER_KCAL[(S.gender==='F')?'F':'H'];
  return brut<p?{brut:Math.round(brut),plancher:p}:null;
}
function calcMacros(phase){
  const auto=autoKcal(phase);
  // Réglage manuel (comme MyFitnessPal) : si l'utilisateur a fixé ses calories à la main,
  // on les utilise ; les protéines/lipides restent sains, les glucides s'ajustent.
  const manual=(typeof S.manualKcal==='number'&&S.manualKcal>0)?Math.round(S.manualKcal):0;
  const calories=manual||auto;
  const m=macrosForKcal(calories);
  return{calories,prot_g:m.prot_g,fat_g:m.fat_g,carbs_g:m.carbs_g,autoCalories:auto,isManual:!!manual};
}

// ─── LES REPAS SUGGÉRÉS DOIVENT RESPECTER LE RÉGIME (02/08, retour Emma via Michel) ──────
// Mesuré avant correction : Emma est en KÉTO (18 g de glucides autorisés) et l'app lui proposait
// « pain complet », « légumineuses » et « quinoa » — 5 repas sur 6 contredisaient son régime.
// Un VÉGAN se voyait proposer œufs, yaourt et poulet (5 sur 6). L'app collectait le régime,
// calculait juste, le disait à Milo… et l'oubliait au moment de suggérer. C'est R4 : l'info doit
// descendre jusqu'au bout, sinon elle n'existe pas.
//
// Deux mécanismes, volontairement différents :
//  · le KÉTO a son PROPRE plan — substituer mot à mot donnerait « Œufs brouillés + œufs » ;
//  · les autres régimes gardent la structure du plan et changent l'ALIMENT (une source de
//    protéines reste une source de protéines) — c'est suffisant et ça reste maintenable.
const FOOD_MODE_LABELS={keto:'Cétogène (keto)',lowcarb:'Low carb',paleo:'Paléo',mediterraneen:'Méditerranéen'};
const FASTING_LABELS={'16-8':'16/8 (fenêtre de 8 h)','18-6':'18/6 (fenêtre de 6 h)','20-4':'20/4 (fenêtre de 4 h)'};
const KETO_MEALS=[
  [0.25,'🌅 Petit-déjeuner','Œufs brouillés au beurre + avocat — Démarrage sans glucides'],
  [0.10,'🥜 Collation','Amandes + fromage à pâte dure — Lipides et satiété'],
  [0.30,'🍽️ Déjeuner','Poulet à la crème + brocolis + huile d\'olive — Repas complet cétogène'],
  [0.10,'🧀 Collation 2','Yaourt grec entier + noix de macadamia'],
  [0.25,'🌙 Dîner','Saumon + épinards à la crème + avocat — Riche en oméga-3'],
];
// LOW CARB : moins strict que le kéto — les glucides restent, mais peu et bien placés
// (autour de l'entraînement, là où ils servent).
const LOWCARB_MEALS=[
  [0.25,'🌅 Petit-déjeuner','Œufs + avocat + quelques fruits rouges — Peu de glucides au réveil'],
  [0.10,'🥜 Collation','Fromage blanc + noix — Protéines et satiété'],
  [0.30,'🍽️ Déjeuner','Poulet + légumes verts + une portion de riz — Glucides mesurés'],
  [0.10,'⚡ Autour de la séance','Fruit + protéine — Les glucides là où ils servent'],
  [0.25,'🌙 Dîner','Poisson + légumes rôtis + huile d\'olive — Léger le soir'],
];
// PALÉO : ni céréales, ni laitages, ni produits transformés. Pas de répartition macro imposée —
// c'est une liste d'aliments, donc seuls les repas changent.
const PALEO_MEALS=[
  [0.25,'🌅 Petit-déjeuner','Œufs + patate douce + fruits — Sans céréales ni laitage'],
  [0.10,'🥜 Collation','Fruits à coque + fruit de saison'],
  [0.30,'🍽️ Déjeuner','Viande ou poisson + légumes + huile d\'olive — Aliments bruts'],
  [0.10,'🥑 Collation 2','Avocat + amandes'],
  [0.25,'🌙 Dîner','Poisson + légumes racines rôtis — Simple et non transformé'],
];
// MÉDITERRANÉEN : beaucoup de végétaux, poisson, huile d'olive. Le mieux documenté côté santé
// cardio-vasculaire — d'où sa place ici, sans en faire une promesse médicale.
const MEDITERRANEEN_MEALS=[
  [0.25,'🌅 Petit-déjeuner','Pain complet + huile d\'olive + tomates + fromage de brebis'],
  [0.10,'🍎 Collation','Fruits frais + une poignée de noix'],
  [0.30,'🍽️ Déjeuner','Poisson + légumes + pois chiches + huile d\'olive — Le cœur du modèle'],
  [0.10,'🫒 Collation 2','Yaourt nature + olives'],
  [0.25,'🌙 Dîner','Légumes farcis + lentilles + filet d\'huile d\'olive'],
];
const _MODE_MEALS={keto:KETO_MEALS,lowcarb:LOWCARB_MEALS,paleo:PALEO_MEALS,mediterraneen:MEDITERRANEEN_MEALS};
// [contrainte, ce qu'on remplace, par quoi]. Appliqué dans l'ordre : le premier qui matche gagne
// pour un aliment donné, donc on met les régimes les plus restrictifs en premier.
const _DIET_SWAPS=[
  // Végan : plus aucun produit animal
  // ⚠️ « Œufs brouillés » d'abord, sinon seul « Œufs » est remplacé et « brouillés » reste
  //    derrière : « Tofu brouillé brouillés » (vu au test croisé kéto + végan du 02/08).
  ['vegan',/Œufs brouillés/gi,'Tofu brouillé'],['vegan',/Œufs entiers|Œufs/gi,'Tofu'],['vegan',/Poulet\/thon|Poulet|Dinde/gi,'Tempeh'],
  ['vegan',/Saumon\/bœuf|Bœuf|Saumon|Poisson maigre|Poisson|Thon/gi,'Pois chiches'],
  ['vegan',/Whey|whey/gi,'protéine de pois'],['vegan',/Yaourt grec|Fromage blanc 0%|Fromage blanc/gi,'Yaourt de soja'],
  ['vegan',/lait entier/gi,'lait de soja'],
  // le miel est un produit animal : on le remplace par un sucre deja connu des tables
  ['vegan',/\bmiel\b/gi,'dattes'],
  // Les aliments du plan KÉTO (fromage, beurre, crème) : sans eux, le cas croisé kéto + végan
  // laissait passer « Amandes + fromage à pâte dure » — trouvé par le test croisé, pas à l'œil.
  ['vegan',/fromage à pâte dure/gi,'noix de cajou'],['vegan',/au beurre/gi,"à l'huile de coco"],
  ['vegan',/à la crème(?! de coco)/gi,'à la crème de coco'],
  ['sanslactose',/fromage à pâte dure/gi,'fromage affiné (sans lactose)'],
  ['sanslactose',/au beurre/gi,"à l'huile d'olive"],['sanslactose',/à la crème(?! de coco)/gi,'à la crème de coco'],
  // Végétarien : ni viande ni poisson, mais œufs et laitages restent
  ['vegetarien',/Poulet\/thon|Poulet|Dinde/gi,'Tofu'],['vegetarien',/Saumon\/bœuf|Bœuf|Saumon|Poisson maigre|Poisson|Thon/gi,'Œufs'],
  // Pescétarien : plus de viande, le poisson reste
  ['pescetarien',/Poulet\/thon|Poulet|Dinde/gi,'Poisson blanc'],['pescetarien',/Saumon\/bœuf|Bœuf/gi,'Saumon'],
  // Restrictions
  ['sansgluten',/pain complet|Pain complet/gi,'pain sans gluten'],['sansgluten',/Pâtes/gi,'Pâtes de riz'],
  ['sansgluten',/flocons d\'avoine|Avoine/gi,'Flocons de sarrasin'],['sansgluten',/céréale complète/gi,'riz complet'],
  ['sanslactose',/Yaourt grec|Fromage blanc 0%|Fromage blanc/gi,'Yaourt de soja'],
  ['sanslactose',/lait entier/gi,'lait sans lactose'],['sanslactose',/Whey|whey/gi,'protéine de pois'],
  ['sansporc',/Jambon/gi,'Blanc de dinde'],
  ['sansboeuf',/Saumon\/bœuf/gi,'Saumon'],['sansboeuf',/Bœuf/gi,'Poulet'],
];
// ─── ALIMENTS À ÉVITER (champ libre « Allergies / aliments à éviter ») ───────────────────
// Michel, 02/08 : « dans le profil aussi on met les aliments qu'on ne mange pas ». Mesuré :
// Emma déclarait « fruits à coque » et le plan kéto lui proposait « Amandes + fromage » puis
// « noix de macadamia » — 2 repas sur 5 contenaient précisément son allergène. Et la carte
// du profil PROMET juste en dessous : « jamais un aliment que tu ne manges pas ».
//
// ⚠️ Ici l'erreur peut être GRAVE (allergie) : on ne devine donc pas à sa place (R29).
//  · quand un remplacement évident existe, on l'applique ;
//  · dans TOUS les cas où l'aliment reste présent, on le SIGNALE au lieu de faire semblant.
// Une catégorie déclarée (« fruits à coque ») doit attraper ses membres (amandes, noix…) :
// sans ça, écrire la catégorie ne servirait à rien.
const _ALLERGENES={
  'fruits a coque':['amande','noix','noisette','macadamia','cajou','pistache','pecan'],
  'fruits de mer':['crevette','moule','huitre','crabe','homard','gambas','saint-jacques'],
  'arachide':['arachide','cacahuete'],
  'poisson':['saumon','thon','poisson','cabillaud','maquereau','sardine'],
  'oeuf':['oeuf','œuf'],
  'soja':['soja','tofu','tempeh','edamame'],
  'lactose':['lait','yaourt','fromage','whey','creme'],
  'gluten':['pain','pate','avoine','ble','seigle','orge','semoule','couscous'],
};
// Remplacements sûrs quand l'aliment évité apparaît dans NOS plans (jamais une invention :
// si on ne sait pas par quoi remplacer, on ne remplace pas — on signale).
const _EVIT_SWAPS=[
  [/amandes?/gi,'graines de courge'],[/noix de macadamia/gi,'olives'],[/noix de cajou/gi,'graines de tournesol'],
  [/\bnoix\b/gi,'graines de courge'],
];
function _normAli(t){return (t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
// Les termes réellement à éviter = ce que la personne a écrit + les membres des catégories.
function _termesAEviter(){
  const brut=_normAli(S.dietNotes||'').split(/[,;]/).map(x=>x.trim()).filter(x=>x.length>2);
  const out=[];
  brut.forEach(t=>{
    out.push(t);
    Object.keys(_ALLERGENES).forEach(cat=>{
      // « fruits à coque » écrit → on ajoute amande, noix, macadamia… ; et l'inverse marche aussi
      if(t.indexOf(cat)>=0||cat.indexOf(t)>=0) _ALLERGENES[cat].forEach(m=>out.push(m));
    });
  });
  return [...new Set(out)];
}
// Ce qui reste d'interdit dans une suggestion, APRÈS remplacement — sert à afficher l'alerte.
function mealAlertes(desc){
  const termes=_termesAEviter(); if(!termes.length)return [];
  const d=_normAli(desc);
  return termes.filter(t=>d.indexOf(t)>=0);
}
function _adaptMealDesc(desc){
  const actifs=[S.diet||'', ...(S.dietRestrictions||[])].filter(Boolean);
  let out=desc;
  // La casse du mot d'origine est conservée : « poulet » au milieu d'une phrase ne doit pas
  // devenir « Tofu » avec une majuscule parachutée.
  // Dans les DEUX sens : « poulet » ne doit pas devenir « Tofu » au milieu d'une phrase, et
  // « Amandes » en début de ligne ne doit pas devenir « graines de courge » en minuscule.
  const memeCasse=(orig,rempl)=>(/^[a-zàâäéèêëïîôöùûüç]/.test(orig)
    ? rempl.charAt(0).toLowerCase()+rempl.slice(1)
    : rempl.charAt(0).toUpperCase()+rempl.slice(1));
  _DIET_SWAPS.forEach(([contrainte,rx,par])=>{
    if(actifs.indexOf(contrainte)<0)return;
    out=out.replace(rx,m=>memeCasse(m,par));
  });
  // Aliments à éviter : on remplace SEULEMENT ce qu'on sait remplacer sans inventer.
  const evit=_termesAEviter();
  if(evit.length){
    _EVIT_SWAPS.forEach(([rx,par])=>{
      const test=_normAli(rx.source.replace(/\\b|\?|s\?/g,''));
      if(evit.some(t=>test.indexOf(t)>=0||t.indexOf(test.split(' ')[0])>=0))
        out=out.replace(rx,m=>memeCasse(m,par));
    });
  }
  return out;
}
/* ═══ LES PORTIONS DU PLAN DE REPAS (18/08/2026, retour Michel : « dans nutrition le plan
   alimentaire du jour il n'y a pas les proportions »).

   ⚠️⚠️ TOUT EN GRAMMES, JAMAIS EN NOMBRE DE PIÈCES — et ce n'est pas une préférence de style.
   Les descriptions passent par `_adaptMealDesc()`, qui REMPLACE des aliments (végan, sans
   gluten, allergies). « Œufs (3) » deviendrait « Tofu (3) » : trois tofus. Une quantité en
   grammes, elle, survit à la substitution ; c'est pourquoi les portions sont calculées
   APRÈS l'adaptation, sur l'aliment RÉELLEMENT affiché.

   ⚠️ ON N'INVENTE RIEN : un aliment absent de la table ne reçoit AUCUNE quantité (R29). Mieux
   vaut « + légumes » que « + légumes 137 g » sorti de nulle part. Et les bornes évitent
   l'absurde (« Avoine 12 g », « Riz 940 g ») quand les calories du repas sont extrêmes.

   Les grammes sont une SUGGESTION ; la ligne « P / G / L » du repas reste la référence. */
const _PORTIONS=[
  // [ motif , kcal/100 g , poids relatif , pas , mini , maxi , PORTION FIXE , liquide ]
  // ⚠️ La 7ᵉ colonne existe parce que répartir les calories AU PRORATA gonfle absurdement les
  //    aliments peu caloriques : un fruit à 60 kcal/100 g devait peser 280 g pour « prendre sa
  //    part » d'un petit-déjeuner. Les légumes et les fruits ont une portion STANDARD, et ce
  //    sont les aliments denses qui portent l'énergie du repas. (Mesuré, pas supposé.)
  // — féculents / céréales
  [/flocons de sarrasin|porridge|avoine/i,          370, 1.0, 10,  30, 150, 0, 0, 'cru'],
  [/p[âa]tes de riz|p[âa]tes compl[èe]tes|p[âa]tes/i,350, 1.1, 10,  40, 200, 0, 0, 'cru'],
  [/riz basmati|riz complet|riz blanc|riz/i,        350, 1.1, 10,  40, 200, 0, 0, 'cru'],
  [/quinoa/i,                                       368, 1.0, 10,  30, 150, 0, 0, 'cru'],
  [/semoule|couscous/i,                             360, 1.0, 10,  30, 150, 0, 0, 'cru'],
  [/pain sans gluten|pain complet|pain/i,           250, 0.8, 10,  30, 120, 0, 0, ''],
  [/patate douce/i,                                  86, 1.2, 10,  80, 350, 0, 0, 'cru'],
  [/pomme de terre/i,                                77, 1.2, 10,  80, 350, 0, 0, 'cru'],
  [/l[ée]gumineuses|lentilles|pois chiches|haricots rouges/i, 116, 1.0, 10, 50, 250, 0, 0, 'cuit'],
  [/barre c[ée]r[ée]ale maison|c[ée]r[ée]ale compl[èe]te/i, 350, 0.7, 10, 25, 120, 0, 0, ''],
  // — protéines animales
  [/blanc de dinde|dinde/i,                         110, 1.0, 10,  80, 250, 0, 0, 'cru'],
  [/poulet\/thon|poulet/i,                          120, 1.0, 10,  80, 250, 0, 0, 'cru'],
  [/b(œ|oe)uf/i,                                    180, 0.9, 10,  70, 220, 0, 0, 'cru'],   // ⚠️ « bœuf » = b+œ+u+f : `b[œo]euf` ne matchait JAMAIS
  [/saumon/i,                                       200, 0.9, 10,  70, 200, 0, 0, 'cru'],
  [/poisson blanc|poisson maigre|poisson|cabillaud|thon/i, 105, 1.0, 10, 80, 250, 0, 0, 'cru'],
  [/jambon/i,                                       120, 0.7, 10,  40, 150, 0, 0, ''],
  [/[œo]ufs? brouill[ée]s?|[œo]ufs? entiers?|[œo]ufs?/i,143, 0.9, 10, 50, 200, 0, 0, 'cru'],
  // — protéines végétales / substituts
  [/tofu brouill[ée]|tofu/i,                        145, 0.9, 10,  60, 250, 0, 0, ''],
  [/seitan/i,                                       140, 0.9, 10,  60, 200, 0, 0, ''],
  [/tempeh/i,                                       190, 0.9, 10,  50, 180, 0, 0, ''],
  // — laitages et poudres
  [/yaourt de soja|yaourt grec|yaourt/i,             90, 0.9, 10,  80, 300],
  [/fromage blanc 0%|fromage blanc/i,                75, 0.9, 10,  80, 350],
  [/fromage affin[ée][^,+]*|fromage [àa] p[âa]te dure|fromage/i, 380, 0.5, 5, 20, 80],
  [/prot[ée]ine de pois|whey shake|whey/i,          390, 0.6,  5,  15,  60],
  [/lait sans lactose|lait de soja|lait entier|lait/i, 62, 0.8, 10, 100, 400, 0, 1],
  // — lipides
  [/huile d'olive|huile de coco|huile olive|huile/i, 890, 0.25, 5,  5,  30, 0, 1],
  [/graines de courge|graines de tournesol/i,       560, 0.35, 5,  10,  50],
  [/noix de cajou|amandes?|noisettes?|\bnoix\b/i,   600, 0.35, 5,  10,  50],
  [/olives/i,                                       150, 0.4,  5,  20,  80],
  // — fruits et légumes
  [/banane/i,                                        90, 0.8, 10,  60, 250, 120],
  [/dattes/i,                                       280, 0.4,  5,  15,  80],
  [/fruits? secs?/i,                                300, 0.4,  5,  15,  80],
  [/jus de fruit/i,                                  45, 0.6, 10, 100, 400, 200, 1],
  [/miel/i,                                         320, 0.3,  5,  10,  50],
  [/fruits?/i,                                       60, 0.8, 10,  80, 300, 150],
  [/[ée]pinards|brocolis|haricots verts|concombre/i, 30, 0.7, 10, 100, 300, 150],
  [/l[ée]gumes? r[ôo]tis|l[ée]gumes? vapeur|l[ée]gumes? vari[ée]s|l[ée]gumes?/i, 35, 0.7, 10, 100, 350, 150],
];
/* Rend la description AVEC les portions. `desc` est déjà ADAPTÉE au régime : on quantifie
   donc ce que la personne verra vraiment, jamais l'aliment d'origine. */
function _portionner(desc, kcalRepas){
  if(!desc || !kcalRepas || kcalRepas<=0) return desc;
  const coupe=String(desc).split('—');
  const gauche=coupe[0], suffixe=coupe.slice(1).join('—');
  const items=gauche.split('+').map(x=>x.trim()).filter(Boolean);
  if(items.length<2) return desc;                     // une phrase, pas une liste d'aliments
  // on ne quantifie que ce qu'on CONNAÎT ; le reste passe tel quel
  const arrondi=(g,pas)=>Math.max(pas,Math.round(g/pas)*pas);
  const connus=items.map(txt=>{
    // ⚠️ Une quantité DÉJÀ ÉCRITE dans le plan a été posée exprès (« Amandes (20g) ») :
    //    on n'en superpose pas une seconde, on respecte la décision d'origine (R30).
    if(/\d\s*(g|ml|cl)\b|\(\s*\d/.test(txt)) return {txt,poids:0,fixe:0,dejaChiffre:true};
    const p=_PORTIONS.find(([rx])=>rx.test(txt));
    if(!p) return {txt,poids:0,fixe:0};
    const m=txt.match(p[0]);
    // ⚠️ « Saumon/bœuf » propose un CHOIX entre deux aliments : la quantité vaut pour les
    //    deux, elle se met donc AU BOUT (« Saumon/bœuf 70 g ») et jamais au milieu.
    const fin=/\//.test(txt) ? txt.length : m.index+m[0].length;
    return {txt,kcal100:p[1],poids:p[2],pas:p[3],min:p[4],max:p[5],fixe:p[6]||0,
            fin, liquide:!!p[7], etat:p[8]||''};
  });
  // les portions STANDARD (légumes, fruits) sont posées d'abord ; elles ne se disputent pas
  // les calories du repas, ce sont les aliments denses qui les portent
  let reste=kcalRepas;
  connus.forEach(c=>{ if(c.fixe){ c.g=c.fixe; reste-=c.fixe/100*c.kcal100; } });
  const total=connus.reduce((a,c)=>a+((c.fixe||c.dejaChiffre)?0:(c.poids||0)),0);
  if(!total && !connus.some(c=>c.g)) return desc;     // aucun aliment reconnu → on n'invente pas
  if(total>0){
    const dispo=Math.max(reste, kcalRepas*0.25);      // jamais moins d'un quart : sinon portions ridicules
    connus.forEach(c=>{
      if(c.fixe||c.dejaChiffre||!c.poids) return;
      const part=dispo*(c.poids/total);
      c.g=Math.min(c.max, Math.max(c.min, arrondi(part/c.kcal100*100, c.pas)));
    });
  }
  const out=connus.map(c=>{
    if(!c.g) return c.txt;                            // inconnu ou déjà chiffré : on laisse tel quel
    /* ⚠️ LA QUANTITÉ SE POSE JUSTE APRÈS L'ALIMENT, PAS À LA FIN DU MORCEAU. « Œufs brouillés
       à l'huile d'olive » est une PRÉPARATION : mettre « 200 g » au bout donnerait « …à
       l'huile d'olive 200 g », soit 200 g d'huile. Trouvé par le test croisé kéto + sans
       lactose, pas à l'œil. Et l'unité vient de la TABLE, jamais d'une relecture du texte :
       le mot « huile » apparaît dans cette phrase alors que l'aliment mesuré est l'œuf. */
    const unite=c.liquide?' ml':' g';
    /* ⚖️ L'ÉTAT EST ÉCRIT, JAMAIS CONVERTI (19/08/2026 — le défaut mesuré le 18/08).
       La table mélangeait le cru et le cuit SANS LE DIRE : riz 350 kcal/100 g (cru), pâtes 350
       (sèches), quinoa 368 (sec) — mais légumineuses 116 (**cuites**). Une ligne « Riz 80 g +
       lentilles 120 g » demandait donc de peser l'un cru et l'autre cuit, sans un mot.
       ⭐ ET CE N'EST PAS DU BRUIT QUI S'ANNULE SUR LA SEMAINE : c'est un biais SYSTÉMATIQUE,
       toujours dans le même sens — la seule classe d'erreur que « cohérence > réactivité » ne
       peut pas absorber. Des pâtes pesées cuites sur une valeur « sèche » comptent ×2,7.
       ⛔ ON NE CONVERTIT PAS, ON NOMME. Convertir supposerait un ratio d'absorption d'eau qu'on
       n'a pas (il dépend de la cuisson de chacun) — ce serait inventer un chiffre (R29). Écrire
       l'état coûte trois mots et rend la pesée reproductible.
       ⚠️ ET LA CONVENTION SUIT L'ALIMENT, PAS UNE RÈGLE GLOBALE : le riz s'achète sec et se pèse
       cru, les lentilles arrivent souvent cuites en boîte. Forcer une convention unique
       obligerait à mentir sur l'un des deux. Chaque ligne porte donc SON état, modifiable seule.
       ⚠️ « pesé cru / pesé cuit » est INVARIABLE, exprès : « (cuites) » pour les lentilles et
       « (cru) » pour le riz demanderait d'accorder en genre et en nombre un texte déjà passé par
       les substitutions de régime — un accord faux se verrait plus qu'il n'aiderait. Et la forme
       verbale dit l'ACTION à faire, pas seulement l'état de l'aliment. */
    const etat=c.etat?' ('+(c.etat==='cru'?'pesé cru':'pesé cuit')+')':'';
    return c.txt.slice(0,c.fin)+' '+c.g+unite+etat+c.txt.slice(c.fin);
  });
  return out.join(' + ')+(suffixe?' —'+suffixe:'');
}
/* ═══ LE PLAN CHANGE TOUS LES JOURS (18/08/2026, demande de Michel).

   ⚠️⚠️ AUCUN APPEL IA, et c'est un choix : ce bloc est calculé par l'app, HORS LIGNE et
   gratuitement. Le faire générer coûterait à chaque jour et ne marcherait plus à la salle
   sans réseau (règle d'or #4). Le « Plan de repas IA » existe déjà, séparément, pour ça.

   ⚠️⚠️ LES VARIANTES N'UTILISENT QUE DES ALIMENTS DÉJÀ PRÉSENTS DANS LES PLANS. C'est LA
   règle de sécurité de cette brique : chaque aliment doit être connu des tables de
   substitution (`_DIET_SWAPS`) ET d'allergènes (`_ALLERGENES`), sinon un végan voit de la
   viande ou quelqu'un qui a déclaré « fruits à coque » voit des amandes — c'est le bug
   d'Emma du 02/08. En n'introduisant AUCUN mot nouveau, le risque est nul par construction.
   ⛔ Deux pièges relevés en écrivant : « Thon » SEUL n'est couvert par aucune substitution
   (seul « Poulet/thon » l'est), et « Porridge » n'a pas d'équivalent sans gluten. Ne pas
   les employer dans une variante.

   La variante du jour est choisie par la DATE : elle change chaque jour, mais elle est
   stable toute la journée — sinon le plan changerait à chaque affichage. */
function _jourPlan(d){
  try{
    const s=d||((typeof today==='function')?today():new Date().toISOString().slice(0,10));
    const t=new Date(s+'T12:00:00');
    return Math.floor((t-new Date(t.getFullYear(),0,0))/864e5);   // quantième de l'année
  }catch(e){ return 0; }
}
/* Un repas peut porter UNE description (comportement d'origine) ou PLUSIEURS : on prend
   celle du jour. Les deux formes cohabitent — inutile de convertir tous les plans. */
function _varianteDuJour(desc, jour){
  if(!Array.isArray(desc)) return desc;
  if(!desc.length) return '';
  return desc[((jour%desc.length)+desc.length)%desc.length];
}
/* @param jourForce — n'existe QUE pour les tests : il leur permet de parcourir TOUTES les
   variantes. Sans lui, un test de régime ne vérifierait que la variante du jour où il
   tourne, et une variante dangereuse ne sortirait que certains jours. */
function getMeals(macros,phase,jourForce){
  const goal=S.goal||'muscle';
  const _jour=(jourForce==null)?_jourPlan():jourForce;
  const plans={
    muscle:[
      [0.20,'🌅 Petit-déjeuner',['Avoine + œufs + fruit — Glucides complexes',
        'Pain complet + œufs + banane — Départ rapide',
        'Yaourt grec + avoine + fruit — Frais et protéiné']],
      [0.10,'🍎 Collation matin',['Yaourt grec + noix — Protéines rapides',
        'Fromage blanc 0% + amandes — Satiété longue',
        'Whey + banane — Le plus rapide']],
      [0.25,'🍽️ Déjeuner',['Riz + poulet + légumes — Repas complet',
        'Pâtes + bœuf + légumes vapeur — Plus dense',
        'Quinoa + saumon + brocolis — Oméga 3']],
      [0.15,'⚡ Pré-entraînement',['Banane + flocons d\'avoine — Énergie maximale',
        'Pain complet + miel — Sucre disponible vite',
        'Riz blanc + dattes — Charge glycogène']],
      [0.20,'💪 Post-entraînement',['Whey + riz + banane — Récupération anabolique',
        'Poulet + patate douce + légumes — Vrai repas de récup',
        'Yaourt grec + fruit + miel — Léger et efficace']],
      [0.10,'🌙 Dîner',['Saumon/bœuf + légumes + patate douce',
        'Poisson maigre + haricots verts + quinoa',
        'Œufs + épinards + riz complet']],
    ],
    perte:[
      [0.25,'🌅 Petit-déjeuner',['Œufs entiers + épinards + pain complet — Rassasiant, riche en protéines',
        'Fromage blanc 0% + fruit + avoine — Volume et satiété',
        'Œufs + légumes + pain complet — Salé, tient au corps']],
      [0.10,'🍎 Collation',['Fromage blanc 0% + concombre — Volume sans calories',
        'Yaourt grec + fruit — Frais et léger',
        'Whey + concombre — Protéines pures']],
      [0.30,'🍽️ Déjeuner',['Poulet/thon + légumes vapeur + légumineuses — Satiété maximale',
        'Dinde + brocolis + quinoa — Léger et complet',
        'Poisson maigre + légumes + lentilles — Faible densité']],
      [0.10,'🍎 Collation 2',['Amandes (20g) + whey shake — Anti-fringales',
        'Yaourt grec + noix — Coupe-faim gras/protéines',
        'Fromage blanc 0% + fruit — Sucré sans excès']],
      [0.25,'🌙 Dîner',['Poisson maigre + légumes rôtis + quinoa — Faible IG',
        'Œufs + épinards + patate douce — Réconfortant',
        'Poulet + haricots verts + lentilles — Protéines et fibres']],
    ],
    force:[
      [0.20,'🌅 Petit-déjeuner',['Avoine + œufs + lait entier — Base énergétique dense',
        'Œufs + pain complet + lait entier — Simple et lourd',
        'Avoine + whey + banane — Rapide avant une grosse journée']],
      [0.15,'⚡ Pré-entraînement',['Riz blanc + bœuf + banane — Charge glycogène maximale',
        'Pâtes + poulet + miel — Carburant classique',
        'Riz blanc + dattes + whey — Léger sur l\'estomac']],
      [0.25,'🍽️ Déjeuner',['Pâtes + poulet + huile olive — Carburant pour les charges lourdes',
        'Riz + bœuf + légumes — Dense en protéines',
        'Patate douce + saumon + épinards — Récup et micronutriments']],
      [0.25,'💪 Post-entraînement',['Whey + riz blanc + dattes — Récupération rapide',
        'Poulet + riz + fruit — Vrai repas de récup',
        'Yaourt grec + avoine + miel — Facile à avaler']],
      [0.15,'🌙 Dîner',['Œufs + patate douce + légumes — Récupération nocturne',
        'Saumon/bœuf + quinoa + brocolis',
        'Dinde + riz + haricots verts']],
    ],
    equilibre:[
      [0.25,'🌅 Petit-déjeuner',['Œufs + avoine + fruits — Équilibre parfait macro/micro',
        'Yaourt grec + pain complet + fruit — Léger et complet',
        'Œufs + épinards + avoine — Salé, riche en fibres']],
      [0.30,'🍽️ Déjeuner',['Protéine + céréale complète + légumes variés — Coloré et complet',
        'Poulet + quinoa + légumes vapeur — Simple et net',
        'Poisson maigre + riz + brocolis — Digeste']],
      [0.15,'🍎 Collation',['Yaourt grec + noix ou fruit de saison',
        'Fromage blanc 0% + fruit',
        'Amandes (20g) + banane']],
      [0.30,'🌙 Dîner',['Poisson + légumes + riz complet ou lentilles',
        'Œufs + légumes rôtis + patate douce',
        'Dinde + haricots verts + quinoa']],
    ],
    endurance:[
      [0.25,'🌅 Petit-déjeuner',['Porridge + miel + banane + fruit sec — Réserve glycogène',
        'Avoine + lait entier + fruit sec — Même but, autre texture',
        'Pain complet + miel + banane — Rapide avant de partir']],
      [0.15,'⚡ Pré-entraînement',['Barre céréale maison + jus de fruit — Énergie rapide',
        'Banane + dattes — Le plus simple',
        'Pain complet + miel — Sucre disponible vite']],
      [0.25,'🍽️ Déjeuner',['Pâtes complètes + thon + légumes — Glucides dominants',
        'Riz + poulet + légumes vapeur — Digeste avant l\'effort',
        'Quinoa + saumon + épinards — Plus de micronutriments']],
      [0.20,'💪 Post-entraînement',['Boisson récup + banane + pain complet — Réhydratation',
        'Whey + riz + fruit — Reconstruction',
        'Yaourt grec + avoine + miel — Sucres et protéines']],
      [0.15,'🌙 Dîner',['Riz + poulet + légumes — Reconstruction musculaire nocturne',
        'Poisson maigre + patate douce + haricots verts',
        'Œufs + quinoa + légumes rôtis']],
    ],
  };
  // Le KÉTO prime sur l'objectif : sa structure de repas est dictée par les macros (5/15/80),
  // pas par le but recherché — un plan « force » plein de riz n'aurait aucun sens en cétogène.
  // Le MODE alimentaire prime sur l'objectif : un plan « force » plein de riz n'aurait aucun
  // sens en cétogène, ni un petit-déjeuner de céréales en paléo.
  const plan=_MODE_MEALS[S.foodMode]||(S.keto?KETO_MEALS:null)||(plans[goal]||(goal==='recomp'?plans.perte:plans.muscle)); // recomp → plan orienté satiété/perte de gras
  // ── JEÛNE INTERMITTENT : ce n'est PAS une question de macros mais d'HORAIRES. Les calories
  // de la journée ne changent pas — elles se concentrent dans la fenêtre où l'on mange. Le
  // petit-déjeuner disparaît donc, et ses calories sont redistribuées sur les repas restants
  // (sinon on afficherait une journée incomplète, ce qui pousserait à sous-manger).
  let plan2=plan;
  if(S.fasting){
    const FEN={'16-8':'12 h → 20 h','18-6':'13 h → 19 h','20-4':'15 h → 19 h'}[S.fasting]||'';
    const restants=plan.filter(([,nom])=>!/petit-déjeuner/i.test(nom));
    if(restants.length){
      const perdu=plan.filter(([,nom])=>/petit-déjeuner/i.test(nom)).reduce((a,[p])=>a+p,0);
      const bonus=perdu/restants.length;
      plan2=restants.map(([p,nom,d],i)=>[p+bonus, (i===0?'⏳ Rupture du jeûne'+(FEN?' ('+FEN.split('→')[0].trim()+')':''):nom), d]);
    }
  }
  return plan2.map(([pct,name,descBrut])=>{
    const desc0=_varianteDuJour(descBrut,_jour);
    const kcal=Math.round(macros.calories*pct);
    // ⚠️ ORDRE OBLIGATOIRE : on ADAPTE au régime, PUIS on quantifie. L'inverse collerait les
    // grammes sur l'aliment d'origine, et la substitution laisserait une quantité qui ne
    // correspond plus à ce qui est affiché.
    const desc=_portionner(_adaptMealDesc(desc0), kcal);
    const prot=Math.round(macros.prot_g*pct);
    const carbs=Math.round(macros.carbs_g*pct);
    const fat=Math.round(macros.fat_g*pct);
    return{name,desc,kcal,prot,carbs,fat};
  });
}

