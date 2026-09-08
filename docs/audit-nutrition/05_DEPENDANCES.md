# 05 — DÉPENDANCES

> Fonctions **appelées** (directement ou en cascade) par les 16 demandées, **et** qui
> touchent à la vérité nutritionnelle (`per100`, `_afRef`, `_efRef`, `_bcNutr`,
> `S.foodLog`, kcal/prot/carbs/fat, ou les champs de quantité de l'écran).

> ⛔ Le critère est mécanique et écrit dans le générateur : une fonction appelée qui
> ne touche à rien de nutritionnel (rendu, toast, date…) n'est **pas** incluse — sinon
> l'extraction ramasserait la moitié de l'application et noierait le sujet.

**6 dépendances retenues.**

---

## `_bcProposerDerniere`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1742 |
| longueur | 12 lignes |
| appelée par | `_offRemplirFormulaire`, `quickFillFood`, `_afSuggPrendreLocale` |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _bcProposerDerniere(q){
  const b=document.getElementById('af-bc-last'); if(!b) return;
  const g=document.getElementById('af-bc-grams');
  /* ⛔ q<=0 → ON CACHE SEULEMENT, on ne touche PAS au champ. C'est ce qui permet d'appeler
     cette fonction depuis le scan neuf (qui pose 100 g ou la portion du fabricant) sans effacer
     sa valeur. *Une fonction qui nettoie plus que son sujet finit par effacer celui d'un autre.* */
  if(!(+q>0)){ b.style.display='none'; b.textContent=''; delete b.dataset.q; return; }
  if(g) g.value='';                       // ⛔ rien de pré-rempli : la personne choisit
  b.dataset.q=String(+q);
  b.textContent='↩ '+(+q)+' g (la dernière fois)';
  b.style.display='inline-block';
}
```

---

## `_afSetSrc`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1128 |
| longueur | 1 lignes |
| appelée par | `_offRemplirFormulaire`, `quickFillFood`, `quickAddFood`, `_afSuggPrendreLocale`, `addFoodEntry` |
| globales LUES | — |
| globales MODIFIÉES | `_afSrc` |

```js
function _afSetSrc(o){ _afSrc=o||null; }
```

---

## `persist`

| | |
|---|---|
| fichier | `state.js` |
| ligne | 615 |
| longueur | 144 lignes |
| appelée par | `quickAddFood`, `addFoodEntry`, `saveEditFood` |
| globales LUES | — |
| globales MODIFIÉES | `S` |

```js
function persist(){
  // Mode démo : on ne sauvegarde RIEN (ni local, ni cloud) — les vraies données restent figées telles quelles
  if(window._demoMode)return;
  // ⛔ un autre onglet a écrit depuis notre dernière sauvegarde → on ajoute, on n'écrase pas
  if(_ftAutreOnglet){ _ftAutreOnglet=false; _fusionnerAvecLeDisque(); }
  try{
    localStorage.setItem('ft4_bw',S.bw);localStorage.setItem('ft4_bar',S.barW);
    localStorage.setItem('ft4_rest',S.defRest);localStorage.setItem('ft4_expandall',S.expandAll?'1':'0');localStorage.setItem('ft4_keto',S.keto?'1':'0');localStorage.setItem('ft4_foodmode',S.foodMode||'');localStorage.setItem('ft4_fasting',S.fasting||'');localStorage.setItem('ft4_gender',S.gender);
    localStorage.setItem('ft4_age',S.age);localStorage.setItem('ft4_ht',S.height);
    localStorage.setItem('ft4_act',S.activityLevel);
    localStorage.setItem('ft4_sessions',JSON.stringify((S.sessions||[]).slice(0,1500)));
    localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
    localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt));
    localStorage.setItem('ft4_nextplanned',JSON.stringify(S.nextPlanned||null)); // séance annoncée à Milo (ft-v601)
    /* ⛔ PLAFOND À 12, et ce n'est pas un garde-fou de taille — c'est un garde-fou de TON.
       Un historique sans fin des séances manquées deviendrait un registre de fautes, et
       personne n'a besoin de se voir rappeler un empêchement d'il y a huit mois (P21, P13). */
    localStorage.setItem('ft4_missed',JSON.stringify((S.missedLog||[]).slice(-12))); // ft-v1050
    localStorage.setItem('ft4_cycle',JSON.stringify(S.cycle||null)); // cycle de force : local-first (était lu mais jamais écrit)
    /* Brouillon de secours — effacé quand séance vide ou après sauvegarde dans finishWorkout().
       ⛔ 04/09/2026 — 4ᵉ endroit qui lisait « des exercices » : une séance de CARDIO SEUL n'avait
       aucune copie de secours, alors que c'est précisément ce qui rattrape un onglet fermé.
       `_seanceOuverte()` (log.js) est le propriétaire unique de la question (R2) ; le repli sert
       aux appels de `persist()` qui pourraient précéder le chargement de log.js. */
    if((typeof _seanceOuverte==='function')?_seanceOuverte():!!(S.wkt&&S.wkt.exs&&S.wkt.exs.length)){
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
    localStorage.setItem('ft4_echelle',S.echelleReserve==='rpe'?'rpe':'rir');
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
    localStorage.setItem('ft4_mens',JSON.stringify(S.mensLog||[]));
    localStorage.setItem('ft4_evalPasses',JSON.stringify(S.evalPasses||[]));
    /* ⛔ `evalHist` est écrit par `_evHistEcrire` (son propriétaire) directement dans
       localStorage ; ici on ne fait que RECOPIER ce que `S` porte, sans jamais écraser
       par un objet vide — sinon un `persist()` déclenché ailleurs effacerait l'historique. */
    if(S.evalHist && Object.keys(S.evalHist).length) localStorage.setItem('ft4_evalHist',JSON.stringify(S.evalHist));
    localStorage.setItem('ft4_goallog',JSON.stringify(S.goalLog||[]));
    localStorage.setItem('ft4_strgoals',JSON.stringify(S.strengthGoals||{}));
    localStorage.setItem('ft4_name',S.name||'');
    localStorage.setItem('ft4_progs',JSON.stringify(S.programmes||[]));
    localStorage.setItem('ft4_tester_ideas',JSON.stringify(S.testerIdeas||[]));
    /* 👎 ft-v1059 — PLAFOND À 40, et c'est un garde-fou de TAILLE autant que de TON.
       Un registre sans fin des ratés de Milo grossirait pour rien (la leçon du réservoir
       plein du 29/07) — et il n'y a aucun usage à relire un « à côté » d'il y a six mois. */
    localStorage.setItem('ft4_milo_rates',JSON.stringify((S.miloRates||[]).slice(-40)));
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
```

---

## `_afPropCacher`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4136 |
| longueur | 10 lignes |
| appelée par | `_afMajAncre` |
| globales LUES | — |
| globales MODIFIÉES | `_afRef` |

```js
function _afPropCacher(){
  _afRef=null;
  /* ⛔ L'UNITÉ SE REMET À ZÉRO AVEC LE BLOC (ft-v1051), sinon l'aliment SUIVANT hérite du
     choix du précédent — et pire, de son poids déclaré. *Un réglage qui survit à son sujet est
     pire qu'un réglage absent : il a l'air d'un fait.* (La même leçon que le poids de l'IA
     périmé, quelques lignes plus haut.) */
  if(typeof _afResetUnite==='function')_afResetUnite();
  const el=document.getElementById('af-prop-row');
  if(el){el.style.display='none';el.innerHTML='';}
}
```

---

## `_afProp`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4050 |
| longueur | 7 lignes |
| appelée par | `_afMajAncre` |
| globales LUES | `_afRef` |
| globales MODIFIÉES | — |

```js
function _afProp(f){
  if(!_afRef) return;
  const b=_afRef.base;
  const P=(id,v)=>{const el=document.getElementById(id);if(el)el.value=Math.round(v);};
  P('af-kcal',b.kcal*f); P('af-prot',b.prot*f); P('af-carbs',b.carbs*f); P('af-fat',b.fat*f);
  _afCoherence();
}
```

---

## `_fusionnerAvecLeDisque`

| | |
|---|---|
| fichier | `state.js` |
| ligne | 497 |
| longueur | 50 lignes |
| appelée par | `persist` |
| globales LUES | — |
| globales MODIFIÉES | `S` |

```js
function _fusionnerAvecLeDisque(){
  const lire=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } };
  try{
    /* ⛔⛔ L'IDENTITÉ D'UNE SÉANCE EST `ts || id`, PAS SON CONTENU (corrigé le 02/09/2026,
       trouvé en relisant ft-v1094 à la demande de Michel).
       La 1ʳᵉ version signait `date|nb exercices|volume` — or **corriger une charge change le
       volume**, donc la version corrigée et celle du disque avaient deux signatures
       différentes et l'union GARDAIT LES DEUX. Mesuré dans un vrai navigateur : même date →
       **2 séances**, volumes [1100, 1000]. 👉 ***Le correctif qui répare une perte de séance
       en fabriquait un DOUBLON*** — c'est-à-dire exactement ce que ft-v1083 venait de nettoyer
       dans le classeur, et le geste qui le déclenche est le plus banal : corriger un poids.
       ⭐ ET LE PROPRIÉTAIRE EXISTAIT DÉJÀ (R2) : `openSessDetail`, la suppression et la mise à
       jour identifient toutes une séance par `s.ts || s.id`. La signature en avait inventé un
       second — et deux propriétaires de la même question finissent toujours par diverger.
       ⚠️ LE REPLI, POUR LES SÉANCES SANS `ts`/`id` (importées avant que l'app en pose un) :
       date + nombre d'exercices + **nom du premier exercice**. ⛔ PAS le volume — c'est la seule
       part qui change quand on corrige une charge, donc c'est précisément elle qu'il fallait
       retirer. ⭐ Et le nom du 1ᵉʳ exercice est ajouté pour le RISQUE SYMÉTRIQUE, mesuré avant
       d'être écrit : sans lui, **deux vraies séances du même jour et de même taille
       fusionneraient en une** — on aurait échangé un doublon contre une perte, ce qui est le
       mauvais sens (**R29**). Mesuré : 2 séances distinctes restent 2.
       ⚠️ LIMITE ÉCRITE PLUTÔT QUE TUE : deux séances le même jour, toutes deux SANS identifiant,
       de même taille ET commençant par le même exercice, fusionneraient encore. Le cas suppose
       des séances d'avant les identifiants ET deux onglets ouverts ; le doublon qu'on répare,
       lui, se déclenche en corrigeant un poids. */
    const sigSess = s => String((s&&(s.ts||s.id))
      || ((s&&s.date||'')+'|'+((s&&s.exs||[]).length)+'|'+(((s&&s.exs||[])[0]||{}).name||'')));
    S.sessions   = _fusionListe(S.sessions,   lire('ft4_sessions',[]), sigSess)
                     .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,1500);
    S.weightLog  = _fusionListe(S.weightLog,  lire('ft4_wlog',[]),  e=>String(e&&e.date||''));
    /* ⛔ SIGNATURE `date+clé`, PAS `date` : deux onglets qui notent le tour de cou ET le tour
       de taille le même jour produisent DEUX entrées légitimes. Une signature sur la seule
       date en garderait une et jetterait l'autre — silencieusement. */
    S.mensLog    = _fusionListe(S.mensLog,    lire('ft4_mens',[]), e=>String(e&&e.d||'')+'|'+String(e&&e.k||''));
    S.sleepLog   = _fusionListe(S.sleepLog,   lire('ft4_sleep',[]), e=>String(e&&e.date||''));
    S.foodLog    = _fusionListe(S.foodLog,    lire('ft4_foodlog',[]),
                     e=>String(e&&e.date||'')+'|'+String(e&&e.name||'')+'|'+String(e&&e.meal||'')+'|'+String(e&&e.kcal||''));
    /* Les records sont un OBJET : pour un exercice connu des deux côtés, on garde le plus
       RÉCENT — sinon un onglet resté ouvert écraserait un record battu ailleurs par son
       ancienne valeur, ce qui est précisément la perte qu'on répare. */
    const dPrs = lire('ft4_prs',{}) || {};
    S.prs = S.prs || {};
    Object.keys(dPrs).forEach(k=>{
      const a=S.prs[k], b=dPrs[k];
      if(!a){ S.prs[k]=b; return; }
      const da=String(a&&a.date||''), db=String(b&&b.date||'');
      if(db>da) S.prs[k]=b;
    });
  }catch(e){ console.warn('[FT fusion onglets]',e); }
}
```

---

# En AMONT — les producteurs de référence que §2 ne pouvait pas atteindre

> §2 suit ce que les 16 fonctions **appellent** (vers l'aval). Mais §5 demande *tous*
> les endroits où une valeur peut **devenir une référence** — et plusieurs sont en
> amont : ce sont eux qui appellent les 16, pas l'inverse (le scan, le calibrage à la
> main, les deux contrôles physiques qui autorisent une saisie à devenir référence).

**23 fonctions.**

---

## `_lookupBarcode`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1478 |
| longueur | 25 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_bcNutr`, `_bcPaquetTxt` |

```js
async function _lookupBarcode(ean, saisie, codeDouteux){
  if(!codeDouteux) toast('Recherche du produit…','info');
  let p=null;
  try{ p=await _offFetchProduct(ean); }
  catch(e){ toast('Réseau indisponible pour la recherche produit','error'); return; }
  if(!p){ toast('Produit introuvable dans la base (code '+ean+') — saisis à la main','error'); return; }
  /* 📦 ft-v1174 — MIS DE CÔTÉ **AVANT** LE BRANCHEMENT « aucune valeur », et c'est le point.
     Une fiche sans tableau nutritionnel part au calibrage (ft-v1165) et l'objet produit
     disparaît avec elle — or c'est précisément ce produit-là qui a le plus besoin de son poids. */
  _bcPaquetTxt = String((p&&p.quantity)||'');
  const n=p.nutriments||{};
  const kcal100=_per100d1(n['energy-kcal_100g']||(n['energy_100g']?n['energy_100g']/4.184:0)||0);
  _bcNutr={
    name:((p.product_name_fr||p.product_name||p.generic_name_fr||p.generic_name||'Produit')+(p.brands?' ('+String(p.brands).split(',')[0].trim()+')':'')).slice(0,60),
    kcal100:kcal100,
    prot100:_per100d1(n['proteins_100g']),
    carbs100:_per100d1(n['carbohydrates_100g']),
    fat100:_per100d1(n['fat_100g'])
  };
  if(!_bcNutr.kcal100&&!_bcNutr.prot100&&!_bcNutr.carbs100&&!_bcNutr.fat100)
    return _bcSansValeurs(_bcNutr.name, {saisie:saisie||'scan', origine:'off', sourceId:ean,
      codeDouteux:codeDouteux===true, cause:'« '+_bcNutr.name+' » trouvé, mais sa fiche n\'a aucune valeur.'});
  _offRemplirFormulaire(p, ean, saisie||'scan', codeDouteux===true);
  toast('Produit trouvé ✅ — ajuste la quantité','success');
}
```

---

## `_bcSansValeurs`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1455 |
| longueur | 23 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_bcNutr` |

```js
function _bcSansValeurs(nom, opts){
  opts=opts||{};
  /* ⛔⛔ D'ABORD ON RETIRE LE MENSONGE : sans ça, tout le reste est inutile (mutation M2). */
  _bcNutr=null;
  /* ⛔ « Produit » est le mot par défaut quand rien n'a été lu — ce n'est pas un nom, on ne le
     pose pas. Et on n'écrase jamais ce que la personne a déjà tapé (R29 : on complète, on ne
     décide pas). */
  const d=document.getElementById('af-desc');
  if(d && !d.value && nom && nom!=='Produit') d.value=nom;
  /* ⭐ LA PROVENANCE EST VRAIE ET UTILE : le chemin a bien identifié CE produit, seules ses
     valeurs manquent. ⛔ Aucun `per100` n'est posé — on ne sait pas, et on ne fait pas semblant.
     Si la personne calibre, `_calAppliquer` réécrit tout proprement par-dessus. */
  if(typeof _afSetSrc==='function') _afSetSrc({saisie:opts.saisie||'scan', origine:opts.origine||'off',
    sourceId:opts.sourceId?String(opts.sourceId).slice(0,32):null, etat:null,
    ...(opts.codeDouteux?{codeDouteux:true}:{})});
  /* ⛔ `_calOuvrir` est une BASCULE : l'appeler sur un bloc déjà ouvert le refermerait — c'est-à-dire
     que le scan fermerait la porte au lieu de l'ouvrir. On ne l'appelle que s'il est fermé. */
  const row=document.getElementById('af-cal-row');
  if(row && row.style.display==='none' && typeof _calOuvrir==='function') _calOuvrir();
  /* ⭐ ET ON DIT POURQUOI, avec ce qu'on y gagne — sinon recopier une étiquette ressemble à une
     corvée de plus au lieu d'un réglage qui ne se refait jamais (R24 : informer, pas bloquer). */
  toast((opts.cause||'Valeurs introuvables.')+' Recopie l\'étiquette pour 100 g : une fois, et ce produit sera juste pour toujours.','info');
}
```

---

## `_calOuvrir`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1566 |
| longueur | 18 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _calOuvrir(){
  const row=document.getElementById('af-cal-row'), btn=document.getElementById('af-cal-btn');
  if(!row) return;
  const ouvert=row.style.display!=='none';
  row.style.display=ouvert?'none':'block';
  if(btn) btn.textContent=ouvert?'⚖️ Saisir les valeurs pour 100 g (étiquette)':'⚖️ Masquer la saisie pour 100 g';
  if(!ouvert){
    /* ⭐ On pré-remplit avec ce qui est DÉJÀ à l'écran seulement si la quantité affichée vaut
       100 g : dans ce cas les 4 champs SONT un pour-100 g, et le retaper serait absurde. Sinon
       on laisse vide — proposer les valeurs d'une dose de 30 g comme un « pour 100 g » serait
       exactement l'erreur qu'on essaie de réparer (R29). */
    const q=_qtyGrammesEcran('af');
    if(q===100){ ['kcal','prot','carbs','fat'].forEach(k=>{
      const src=document.getElementById('af-'+k), dst=document.getElementById('af-cal-'+k);
      if(src&&dst&&!dst.value) dst.value=src.value; }); }
    const err=document.getElementById('af-cal-err'); if(err) err.style.display='none';
  }
}
```

---

## `_calAppliquer`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1584 |
| longueur | 45 lignes |
| globales LUES | `_bcPaquetTxt` |
| globales MODIFIÉES | `_bcNutr` |

```js
function _calAppliquer(){
  const lu=k=>numFR((document.getElementById('af-cal-'+k)||{}).value)||0;
  const kcal=lu('kcal'), prot=lu('prot'), carbs=lu('carbs'), fat=lu('fat');
  const err=document.getElementById('af-cal-err');
  const dire=m=>{ if(err){err.textContent=m; err.style.display='block';} };
  if(err) err.style.display='none';
  /* ⛔ On refuse le vide plutôt que d'enregistrer un produit « calibré » à zéro : ce serait une
     fausse certitude, et elle se propagerait à tous les repas suivants. */
  if(!(kcal>0 || prot>0 || carbs>0 || fat>0)){ dire('Recopie au moins une valeur du tableau.'); return; }
  /* ⛔⛔ LA MÊME RÈGLE PHYSIQUE QU'À LA SAISIE (ft-v1103, propriétaire unique) : dans 100 g de
     produit il ne peut pas y avoir plus de 100 g de matière. C'est ce qui attrape la colonne
     « par portion » recopiée dans la colonne « pour 100 g » — l'erreur la plus probable ici. */
  const imp=_masseImpossibleVals(100, prot, carbs, fat);
  if(imp){ dire('⚖️ '+imp.somme+' g de macros pour 100 g de produit : impossible. Tu as peut-être recopié la colonne « par portion » — reprends celle qui dit « pour 100 g ».'); return; }
  /* ⚡ ET LE PLAFOND PHYSIQUE DES CALORIES, AU MÊME ENDROIT (ft-v1162) — c'est ici qu'entre une
     étiquette recopiée à la main, donc c'est ici que se glisse une ligne lue de travers. La
     règle de masse attrape « la colonne par portion dans la colonne pour 100 g » ; celle-ci
     attrape la **ligne des calories** prise sur la mauvaise colonne, que la masse laisse passer. */
  const kimp=_kcalImpossibleVals(100, kcal, prot, carbs, fat);
  if(kimp){ dire('⚡ '+kimp.kcal+' kcal pour 100 g : impossible avec ces macros. Elles valent '+kimp.theo+' kcal, et les '+kimp.libre+' g restants ne peuvent pas dépasser '+kimp.plafond+' kcal au total. Vérifie la ligne des calories — elle vient peut-être d\'une autre colonne.'); return; }
  const nom=String((document.getElementById('af-desc')||{}).value||'').trim();
  if(!nom){ dire('Donne d\'abord un nom à l\'aliment, au-dessus.'); return; }
  /* ⛔⛔ UNE DÉCIMALE GARDÉE, ET CE N'EST PAS DU ZÈLE (ft-v1111). Mesuré sur le vrai pot de
     Michel : son étiquette dit **2,8 g de glucides et 3,3 g de lipides pour 100 g**, et
     l'arrondi à l'entier les rangeait tous les deux à **3**. Sur une poudre de protéine ça ne
     se voit pas ; sur une huile à **0,4 g/100 g**, la valeur qu'il a lue deviendrait **0** —
     l'app effacerait un chiffre qu'il vient de recopier.
     👉 *On transcrit ce que la personne a lu, on ne l'arrondit pas à sa place* (la leçon de
     ft-v1100 : transcrire, pas décider).
     ⭐ Et ça ne change rien à l'affichage : `_qtyRescale` arrondit déjà les 4 champs à l'entier
     au moment de les écrire. La décimale ne sert qu'à ce qui est CONSERVÉ. */
  _bcNutr={name:nom.slice(0,80), kcal100:_per100d1(kcal), prot100:_per100d1(prot),
           carbs100:_per100d1(carbs), fat100:_per100d1(fat)};
  /* ⭐ LE CHEMIN DE CIQUAL, MOT POUR MOT — produit vide, pas de portion déclarée (donc 100 g
     par défaut, que la personne remplace par sa dose), et une provenance qui dit la vérité. */
  /* 📦 ft-v1174 — LE POIDS DU PAQUET TRAVERSE LE CALIBRAGE, et c'est LE cas de Michel. Sa
     ratatouille était **trouvée** par le code-barres mais sa fiche n'avait aucune valeur : elle
     part donc ici (ft-v1165), et l'objet produit d'Open Food Facts n'existe plus. Sans ce
     report, le produit qui a le PLUS besoin de son poids serait justement le seul à le perdre.
     ⛔ Et c'est bien le texte BRUT qu'on repasse, pas des grammes : `_offRemplirFormulaire`
     reste le seul endroit qui interprète (R2). */
  _offRemplirFormulaire({serving_quantity:0, quantity:_bcPaquetTxt, nutriments:{}}, null, 'etiquette-main', false, 'etiquette');
  _calOuvrir();   // on referme : le bloc quantité prend le relais juste au-dessus
  toast('Produit calibré ⚖️ — tape ta quantité','success');
}
```

---

## `_offFetchProduct`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1339 |
| longueur | 17 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
async function _offFetchProduct(ean){
  const urls=[
    'https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(ean)+'.json?fields=product_name,product_name_fr,generic_name,generic_name_fr,brands,quantity,nutriments,serving_quantity,nutriscore_grade,nova_group,additives_n,labels_tags,image_front_small_url',
    'https://world.openfoodfacts.org/api/v0/product/'+encodeURIComponent(ean)+'.json'
  ];
  for(let i=0;i<urls.length;i++){
    try{
      const r=await fetch(urls[i],{headers:{'Accept':'application/json'}});
      if(!r.ok)continue;
      const d=await r.json();
      const p=d&&d.product;
      const notFound = !p || (typeof p==='object'&&!Object.keys(p).length) || d.status===0 || d.status==='failure' || d.status_verbose==='product not found';
      if(!notFound && p && (p.product_name||p.product_name_fr||p.generic_name||p.generic_name_fr||p.brands||(p.nutriments&&Object.keys(p.nutriments).length))) return p;
    }catch(e){ /* essaie l'URL suivante */ }
  }
  return null;
}
```

---

## `_offRechercher`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3253 |
| longueur | 14 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
async function _offRechercher(q){
  const url='https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)
    +'&search_simple=1&action=process&json=1&page_size=6&sort_by=unique_scans_n'
    +'&fields=code,product_name,product_name_fr,generic_name,generic_name_fr,brands,quantity,serving_quantity,nutriments,nutriscore_grade,nova_group,additives_n,labels_tags';
  try{
    const r=await fetch(url,{headers:{'Accept':'application/json'}});
    if(!r.ok) return [];
    const d=await r.json();
    return (d&&d.products||[]).filter(p=>{
      const nn=p&&p.nutriments||{};
      return (p.product_name_fr||p.product_name) && (nn['energy-kcal_100g']||nn['energy_100g']);
    }).slice(0,6);
  }catch(e){ return []; }   // hors ligne : on garde les suggestions locales, on ne bloque rien
}
```

---

## `_offPoidsPaquet`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1048 |
| longueur | 26 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _offPoidsPaquet(txt){
  const t=String(txt==null?'':txt).trim().toLowerCase().replace(',','.');
  if(!t) return 0;
  /* ⛔ LES VOLUMES SONT EXCLUS EXPRÈS (R30 : un retrait volontaire s'écrit, sinon il redevient un
     bug). « 1 L » n'est pas « 1000 g » : ça dépend de la densité — 1,0 pour l'eau, 0,92 pour
     l'huile, 1,4 pour le miel. *Convertir reviendrait à inventer une densité qu'on ne connaît
     pas*, et l'app afficherait un poids crédible et faux. Le sujet est noté, pas pris.

     ⛔⛔ ET LES LOTS SONT REFUSÉS PAR L'ANCRAGE, PAS PAR UNE GARDE — c'est le contrôle négatif
     qui me l'a appris. J'avais écrit un `if(/[x×*]/.test(t)) return 0;` au-dessus, avec sa
     justification (« 6 x 125 g » vaut 750 g en paquet et 125 g en unité, donc ambigu). **La
     mutation qui le retirait ne faisait rougir personne** : l'expression ci-dessous est ancrée
     `^…$` sur *un* nombre et *une* unité, donc aucun lot ne peut la traverser de toute façon.
     👉 *Une garde qu'aucun témoin ne peut faire rougir n'est pas une sécurité, c'est de la
     décoration* — et elle laisse croire que le sujet est traité. Elle est donc retirée, et c'est
     le TÉMOIN (« 6 x 125 g » et « 6 × 125 g » rendent 0) qui fige la règle : si quelqu'un
     desserre un jour cet ancrage, il rougira. */
  const m=t.match(/^([0-9]+(?:\.[0-9]+)?)\s*(kg|kilogrammes?|g|gr|grammes?)\s*e?$/);
  if(!m) return 0;
  let g=parseFloat(m[1]); if(!(g>0)) return 0;
  if(m[2][0]==='k') g*=1000;
  /* ⛔ BORNES : au-delà de 5 kg ce n'est plus une référence de portion (sac, format restauration),
     et en dessous du gramme c'est une coquille. On se tait dans les deux cas. */
  if(g<_PAQUET_MIN_G || g>_PAQUET_MAX_G) return 0;
  return Math.round(g*10)/10;
}
```

---

## `_afSuggPrendreOff`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3491 |
| longueur | 11 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_bcNutr` |

```js
function _afSuggPrendreOff(i){
  const p=_afSuggOff[i]; if(!p) return;
  const n=p.nutriments||{};
  _bcNutr={ name:_afSuggNom(p), kcal100:_per100d1(_afSuggKcal100(p)),
            prot100:_per100d1(n['proteins_100g']),
            carbs100:_per100d1(n['carbohydrates_100g']),
            fat100:_per100d1(n['fat_100g']) };
  _offRemplirFormulaire(p, p.code||null, 'recherche');
  _afSuggVider();
  toast('Ajuste la quantité ✅','success');
}
```

---

## `_afSuggPrendreCiqual`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3117 |
| longueur | 19 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_bcNutr` |

```js
function _afSuggPrendreCiqual(i){
  const a=_afSuggCiq[i]; if(!a) return;
  /* ⛔⛔ LE PLUS COÛTEUX DES SIX : `data/ciqual.json` porte les décimales (3 298 aliments sur
     3 484), et on les jetait ici même, à la lecture. */
  _bcNutr={ name:a[1].slice(0,60), kcal100:_per100d1(a[3]),
            prot100:_per100d1(a[4]), carbs100:_per100d1(a[5]), fat100:_per100d1(a[6]) };
  /* ⚠️ PAS D'ÉTAT « tel-que-vendu » DANS LA PROVENANCE, et c'est une vraie différence avec
     Open Food Facts : un produit emballé donne toujours ses valeurs TELLES QUE VENDUES (donc
     sèches pour des pâtes), alors que CIQUAL dit l'état EN TOUTES LETTRES dans le nom — « Riz
     blanc, cuit, sans sel ajouté ». Marquer `tel-que-vendu` serait donc faux ici.
     ⭐ La NOTE d'avertissement, elle, continue de se lever (elle lit le nom) : c'est utile,
     puisqu'un « Riz blanc, cru » pèse bien 3 fois moins que le même riz cuit. */
  _offRemplirFormulaire({serving_quantity:0, nutriments:{}}, 'ciqual:'+a[0], 'ciqual');
  _afSetSrc({saisie:'ciqual', origine:'ciqual', sourceId:'ciqual:'+a[0], etat:null,
             per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
             attendu:_afLuFormulaire()});
  _afSuggVider();
  toast('Ajuste la quantité ✅','success');
}
```

---

## `_afSuggPrendreMarque`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3093 |
| longueur | 24 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_bcNutr` |

```js
function _afSuggPrendreMarque(i){
  const idx=_afSuggMarq[i]; if(idx==null || !_marques) return;
  const a=_marques.a[idx];
  _bcNutr={ name:(a[1]+' · '+a[0]).slice(0,60), kcal100:_per100d1(a[3]),
            prot100:_per100d1(a[4]), carbs100:_per100d1(a[5]), fat100:_per100d1(a[6]) };
  const sid=('marque:'+a[0]+':'+a[1]).slice(0,32);
  _offRemplirFormulaire({serving_quantity:a[7]||0, nutriments:{}}, sid, 'marque', false, 'marque');
  /* ⛔ LA PROVENANCE DIT CE QU'ELLE EST, y compris quand les kcal ont été DÉRIVÉES des macros
     (R32 : mesuré / estimé / propriétaire). On ne présente jamais un calcul comme une
     publication. */
  /* ⛔ LE DOUTE DESCEND JUSQU'À LA DONNÉE (R4) : il ne suffit pas de l'afficher dans la liste,
     il doit rester attaché à la ligne enregistrée — sinon on ne saura plus, dans trois mois,
     qu'un chiffre du journal était signalé comme douteux le jour où on l'a pris. */
  _afSetSrc({saisie:'marque', origine:'marque', sourceId:sid, etat:null,
             ...(a[9]? {doute:String(a[9]).slice(0,90)} : {}),
             ...(a[8]? {kcalDerivee:true} : {}),
             per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
             attendu:_afLuFormulaire()});
  /* ⚠️ ET IL SE REDIT DANS LE FORMULAIRE, là où on appuie sur « Ajouter » : la liste défile,
     le formulaire est le dernier écran avant l'enregistrement. */
  _afNoteEtat(a[9] ? ('⚠️ '+String(a[9])+'. Valeur publiée par '+a[0]+' : à toi de juger.') : _bcNutr.name);
  _afSuggVider();
  toast(a[9] ? 'Valeur signalée — vérifie avant d\'ajouter ⚠️' : 'Ajuste la quantité ✅', a[9]?'info':'success');
}
```

---

## `_afPropSetBase`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4044 |
| longueur | 4 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _afPropSetBase(){
  const n=id=>parseInt((document.getElementById(id)||{}).value)||0;
  return {kcal:n('af-kcal'),prot:n('af-prot'),carbs:n('af-carbs'),fat:n('af-fat')};
}
```

---

## `_efPropSetBase`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3703 |
| longueur | 4 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _efPropSetBase(){
  const n=id=>parseInt((document.getElementById(id)||{}).value)||0;
  return {kcal:n('ef-kcal'),prot:n('ef-prot'),carbs:n('ef-carbs'),fat:n('ef-fat')};
}
```

---

## `_afDeclarePoids`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4125 |
| longueur | 11 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_afPoidsDeclare`, `_afPoidsPose` |

```js
function _afDeclarePoids(){
  /* ⛔⛔ ft-v1159 — NE REDESSINE PLUS RIEN (jumelle de `_efDeclarePoids`). `_afMajAncre()`
     reconstruit le bloc et remplace le champ : appelée à chaque frappe, elle le détruirait au
     premier chiffre. Elle enregistre, elle DIT, et le rendu attend le `blur`. */
  const v=numFR((document.getElementById('af-poids')||{}).value);
  const aide=document.getElementById('af-poids-aide');
  if(!(v>0)){ _afPoidsDeclare=0; if(aide) aide.innerHTML=_AIDE_POIDS_AF; return; }
  _afPoidsDeclare=v;
  _afPoidsPose=true;   // ⚖️ ft-v1172 — à partir d'ici, la référence ne se relit plus à l'écran (ft-v1061)
  if(aide) aide.innerHTML=_aidePoidsPose(v);
}
```

---

## `_efDeclarePoids`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3674 |
| longueur | 20 lignes |
| globales LUES | — |
| globales MODIFIÉES | `_efPoidsDeclare`, `_efPoidsPose` |

```js
function _efDeclarePoids(){
  /* ⛔⛔ ft-v1159 — CETTE FONCTION NE REDESSINE PLUS RIEN, et c'est TOUT le correctif.
     Elle appelait `_efQtyRender()`, ce qui reconstruit le bloc et REMPLACE le champ : appelée à
     chaque frappe (le comportement qu'on veut), elle détruirait le champ au premier chiffre et
     on ne pourrait jamais taper le second. *Le correctif évident était le piège.*
     👉 Elle enregistre le poids et le DIT sous le champ. Le rendu, lui, attend le `blur`. */
  const v=numFR((document.getElementById('ef-poids')||{}).value);
  const aide=document.getElementById('ef-poids-aide');
  if(!(v>0)){                       // champ vidé ou illisible → on revient à la question
    _efPoidsDeclare=0;
    if(aide) aide.innerHTML=_AIDE_POIDS_EF;
    return;
  }
  _efPoidsDeclare=v;
  _efPoidsPose=true;   // ⚖️ ft-v1172 — à partir d'ici, la référence ne se relit plus à l'écran (ft-v1061)
  /* ⭐ LE RETOUR VISIBLE QUI MANQUAIT : avant, taper « 50 » ne changeait RIEN à l'écran — ni les
     4 valeurs (c'est normal, elles se calent), ni un mot. On ne pouvait pas savoir si l'app avait
     entendu. *Un champ qui ne répond pas ressemble à un champ cassé.* */
  if(aide) aide.innerHTML=_aidePoidsPose(v);
}
```

---

## `_masseImpossible`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3884 |
| longueur | 5 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _masseImpossible(pfx){
  const q=_qtyGrammesEcran(pfx); if(!(q>0)) return null;
  const lu=id=>numFR((document.getElementById(pfx+'-'+id)||{}).value)||0;
  return _masseImpossibleVals(q, lu('prot'), lu('carbs'), lu('fat'));
}
```

---

## `_masseImpossibleVals`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3894 |
| longueur | 6 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _masseImpossibleVals(q, prot, carbs, fat){
  if(!(q>0)) return null;
  const somme=(+prot||0)+(+carbs||0)+(+fat||0);
  if(!(somme>0) || somme<=q+2) return null;      // +2 g : l'arrondi des 4 champs, rien de plus
  return {q:q, somme:Math.round(somme*10)/10};
}
```

---

## `_kcalImpossible`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3958 |
| longueur | 5 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _kcalImpossible(pfx){
  const q=_qtyGrammesEcran(pfx); if(!(q>0)) return null;
  const lu=id=>numFR((document.getElementById(pfx+'-'+id)||{}).value)||0;
  return _kcalImpossibleVals(q, lu('kcal'), lu('prot'), lu('carbs'), lu('fat'));
}
```

---

## `_kcalImpossibleVals`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3943 |
| longueur | 13 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _kcalImpossibleVals(q, kcal, prot, carbs, fat){
  if(!(q>0) || !(kcal>0)) return null;
  const p=+prot||0, c=+carbs||0, f=+fat||0, somme=p+c+f;
  /* ⛔ La masse ne tient déjà pas dans la portion : `_masseImpossible` a la parole, pas nous.
     Deux alertes pour un seul défaut, ce serait dire deux fois la même chose plus mal. */
  if(!(somme>0) || somme>q) return null;
  const theo=4*p+4*c+9*f;
  const plafond=theo+_KCAL_PAR_G_MAX*(q-somme);
  const tol=0.5+5*0.5+5*0.5+_KCAL_PAR_G_MAX*0.5;   // = 10 kcal, dérivé de l'arrondi (voir ci-dessus)
  if(kcal<=plafond+tol) return null;
  return {q:q, kcal:Math.round(kcal), plafond:Math.round(plafond),
          theo:Math.round(theo), libre:Math.round((q-somme)*10)/10};
}
```

---

## `_qtyGrammesEcran`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3858 |
| longueur | 23 lignes |
| globales LUES | `_afRef`, `_efRef` |
| globales MODIFIÉES | — |

```js
function _qtyGrammesEcran(pfx){
  /* ⛔⛔ UN CHAMP INVISIBLE PORTE ENCORE SA VALEUR, ET C'EST UN FAUX NÉGATIF SILENCIEUX.
     `af-bc-grams` est écrit `value="100"` dans le HTML : quand son bloc est CACHÉ, il contient
     quand même « 100 ». Mon premier jet lisait donc une portion de 100 g qui n'est nulle part à
     l'écran — et 37 g de macros « tenaient » confortablement dedans. *Le contrôle ne rougissait
     pas : il mesurait un champ que personne ne voyait.* On ne lit que ce qui est AFFICHÉ. */
  const lu=id=>{const el=document.getElementById(pfx+'-'+id);
                if(!el || el.offsetParent===null) return 0;      // caché = pas une quantité
                return numFR(el.value);};
  /* ⛔⛔ LES DEUX NOMS DU MÊME CHAMP, ET C'EST UNE JUMELLE MANQUÉE (R8, corrigée le jour même) :
     la modale de modification l'appelle `ef-grams`, le formulaire d'ajout `af-bc-grams`. Mon
     premier jet ne lisait que le premier — donc le contrôle était **aveugle sur tout le chemin
     code-barres / étiquette de l'écran d'ajout**, c'est-à-dire précisément là où arrivent les
     valeurs d'un produit emballé. *J'ai écrit la règle de la jumelle dans le journal la veille,
     et je l'ai manquée le lendemain.*
     ⛔ Ces deux champs n'existent que sur un pour-100 g : ils sont TOUJOURS en grammes.
     `-prop` suit l'unité de son ancre — on ne la devine pas, on la lit. */
  const g=lu('grams')||lu('bc-grams'); if(g>0) return g;
  const ref=(pfx==='af')?(typeof _afRef!=='undefined'&&_afRef):(typeof _efRef!=='undefined'&&_efRef);
  const prop=lu('prop');
  if(prop>0 && ref && (ref.u||'g')==='g' && ref.q>0) return prop;
  return 0;                       // ⛔ portions, millilitres, rien de déclaré : on se tait
}
```

---

## `_per100d1`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1412 |
| longueur | 1 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _per100d1(x){ const v=+x||0; return Math.round(v*10)/10; }
```

---

## `_afLuFormulaire`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1631 |
| longueur | 4 lignes |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _afLuFormulaire(){
  const g=id=>parseInt((document.getElementById(id)||{}).value)||0;
  return {kcal:g('af-kcal'),prot:g('af-prot'),carbs:g('af-carbs'),fat:g('af-fat')};
}
```

---

## `_efSetUnite`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3663 |
| longueur | 11 lignes |
| globales LUES | `_efPoidsPose` |
| globales MODIFIÉES | `_efPoidsDeclare`, `_efUnite` |

```js
function _efSetUnite(u){
  if(u===_efUnite) return;
  _efUnite=(u==='g')?'g':'portion';
  /* ⛔ On ne rescale RIEN en changeant d'unité : ça ne change pas ce qu'on a mangé, ça change la
     façon de le compter. (Même décision qu'en ft-v1056.)
     ⛔⛔ ft-v1172 — LA JUMELLE DE `_afSetUnite` (R8), ET ELLE ÉTAIT SILENCIEUSE. Ici rien ne
     tombait à l'écran : c'est la RÉFÉRENCE qui se désappairait, et le rescale suivant divisait
     depuis la mauvaise base (50 g rendait 78 au lieu de 156). *Un défaut qui ne se voit pas est
     pire que celui qui se voit : personne ne peut le signaler.* */
  _efPoidsDeclare=0; _efQtyRender(!_efPoidsPose);
}
```

---

## `_efProp`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3788 |
| longueur | 7 lignes |
| globales LUES | `_efRef` |
| globales MODIFIÉES | — |

```js
function _efProp(f){
  if(!_efRef) return;
  const b=_efRef.base;
  const P=(id,v)=>{const el=document.getElementById(id);if(el)el.value=Math.round(v);};
  P('ef-kcal',b.kcal*f); P('ef-prot',b.prot*f); P('ef-carbs',b.carbs*f); P('ef-fat',b.fat*f);
  _efCoherence();
}
```
