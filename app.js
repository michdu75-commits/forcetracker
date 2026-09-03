/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── SUPPLÉMENTS & PROTÉINES ──────────────────────────────────
/* 💊 LE DÉFAUT EST L'ENTRETIEN, PLUS LA CHARGE (19/08/2026).
   Découvert grâce à une revue UX extérieure : mes trois captures « entretien / dose à 8 g /
   charge » étaient IDENTIQUES, et c'est en cherchant pourquoi que le défaut est apparu — la
   fiche s'ouvrait sur la phase de CHARGE, donc l'app recommandait **20 g/jour, 4 × 5 g** à
   quiconque ouvrait simplement l'onglet.
   ⚠️⚠️ ET ÇA CONTREDISAIT L'APP ELLE-MÊME : depuis ft-v910 elle AVERTIT au-delà de 5 g — elle
   affichait donc par défaut quatre fois la dose qu'elle signale quand on la règle à la main
   (R2 : deux endroits qui disent l'inverse l'un de l'autre).
   ⚠️ La charge n'est pas retirée : elle reste à un appui. C'est le DÉFAUT qui change, et il n'a
   jamais eu de raison d'être la dose la plus haute — la charge n'a jamais fait mieux que
   l'entretien, seulement plus vite (Hultman 1996). */
let creatPhase = 'maintenance';

// ⚠️ Les 5 fonctions suppléments (renderSupplements, renderCreatine, renderWhey,
// setCreatPhase, updateProteinBar) vivent PLUS BAS dans ce fichier (une seule
// définition chacune). Un premier jeu de définitions vivait ici : il était MORT
// (écrasé silencieusement par le second) — retiré le 31/07/2026 (ft-v686), sinon
// on éditait la version fantôme sans effet.

// ─── CARDIO ───────────────────────────────────────────────────
const CARDIO_MET={
  elliptique:{leger:4.0,modere:6.0,intense:8.5},
  tapis:     {leger:3.5,modere:5.5,intense:9.5},
  velo:      {leger:4.0,modere:6.8,intense:10.0},
  rameur:    {leger:4.5,modere:7.0,intense:10.5},
  corde:     {leger:6.0,modere:9.0,intense:12.0},
  autre:     {leger:3.5,modere:5.5,intense:8.0},
};
const CARDIO_LABELS={elliptique:'Elliptique',tapis:'Tapis',velo:'Vélo',rameur:'Rameur',corde:'Corde',autre:'Autre'};

function calcCardioKcal(c){
  if(!c||!c.duration)return 0;
  const met=(CARDIO_MET[c.type||'elliptique']||CARDIO_MET.autre)[c.intensity||'modere'];
  return Math.round(met*(S.bw||80)*(c.duration/60));
}
// Deux moments de cardio (02/08) : l'échauffement AVANT et le cardio APRÈS la muscu ne sont
// pas la même chose — ni la même intention, ni la même durée. `cardio` = APRÈS (champ
// historique, inchangé pour toutes les séances déjà enregistrées) · `cardioAvant` = nouveau.
const _CK={avant:'cardioAvant', apres:'cardio'};
function _cardioObj(moment,creer){
  const k=_CK[moment]||'cardio';
  if(!S.wkt)return null;
  if(!S.wkt[k]&&creer)S.wkt[k]={type:'elliptique',intensity:'modere',duration:0};
  return S.wkt[k]||null;
}
function setCardioField(field,val,moment){
  if(!S.wkt)return;
  const c=_cardioObj(moment||'apres',true);
  c[field]=field==='duration'?Math.max(0,Math.min(300,parseInt(val)||0)):val;
  persist();
  // Durée : NE PAS re-render (sinon l'input est détruit à chaque chiffre → focus perdu sur mobile → saisie impossible).
  // On met juste à jour le résumé ; les boutons type/intensité, eux, re-render pour refléter la sélection.
  if(field==='duration')_updateCardioSummary();
  else renderCardioBlock();
  if(typeof renderLogFinish==='function')renderLogFinish(); // le cardio seul suffit pour valider → afficher/màj le bouton
}
// Total des deux moments — utilisé partout où l'on parle des calories du cardio.
function calcCardioKcalTotal(src){
  const o=src||S.wkt||{};
  return (typeof calcCardioKcal==='function')
    ? calcCardioKcal(o.cardioAvant||null)+calcCardioKcal(o.cardio||null) : 0;
}
function _cardioResume(){
  const a=S.wkt&&S.wkt.cardioAvant, b=S.wkt&&S.wkt.cardio;
  const bout=[];
  if(a&&a.duration)bout.push(`avant ${a.duration}min`);
  if(b&&b.duration)bout.push(`après ${b.duration}min`);
  if(!bout.length)return 'optionnel';
  return bout.join(' · ')+` · ~${calcCardioKcalTotal()}kcal`;
}
// « Y a-t-il un cardio saisi ? » — UNE seule définition, lue par le rendu ET par la mise à jour
// en direct (R2 : deux endroits qui répondent à la même question finissent par diverger).
// ⚠️ Couvre les DEUX moments (avant + après) : le total suffit, ne pas regarder un seul objet.
function _aUnCardio(){ return calcCardioKcalTotal()>0; }
function _updateCardioSummary(){
  const el=document.getElementById('cardio-summary');
  const oui=_aUnCardio();
  if(el){
    el.textContent=_cardioResume();
    el.style.color=oui?'var(--green)':'var(--t3)';
  }
  // Bouton « Enregistrer le cardio » : visible dès qu'une durée est saisie (sans re-render → focus gardé)
  // ⚠️ ft-v785 — ici on lisait `c.duration`, une variable qui n'existe PAS dans cette fonction
  // (reste d'un remaniement, ft-v670). Chaque chiffre tapé dans la durée levait donc une erreur,
  // qui interrompait la suite de setCardioField() : `renderLogFinish()` n'était jamais appelé, et
  // le bouton « terminer la séance » n'apparaissait pas alors que le cardio seul suffit à valider.
  // Silencieux à l'écran, visible seulement dans le journal d'erreurs de l'Admin.
  const btn=document.getElementById('cardio-save-btn');
  if(btn)btn.style.display=oui?'block':'none';
}
let _cardioOpen=false;
function toggleCardio(){_cardioOpen=!_cardioOpen;renderCardioBlock();}
function renderCardioBlock(){
  const el=document.getElementById('log-cardio');if(!el)return;
  if(!S.wkt){el.innerHTML='';return;}
  const types=Object.keys(CARDIO_LABELS);
  // Un sous-bloc par MOMENT. L'échauffement est présenté en premier parce que c'est l'ordre
  // dans lequel ça se passe — et son libellé dit à quoi il sert, pour ne pas le confondre
  // avec le cardio de fin de séance.
  const volet=(moment,titre,aide)=>{
    const c=_cardioObj(moment,false)||{type:'elliptique',intensity:'modere',duration:0};
    const k=calcCardioKcal(c.duration?c:null);
    return `<div style="margin-top:10px;">
      <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:6px;">
        <span style="font-size:12.5px;font-weight:700;color:var(--t1);">${titre}</span>
        <span style="font-size:11px;color:var(--t3);flex:1;">${aide}</span>
        ${k?`<span style="font-size:11.5px;color:var(--green);font-weight:700;">~${k} kcal</span>`:''}
      </div>
      <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
        ${types.map(t=>`<button onclick="setCardioField('type','${t}','${moment}')" style="flex-shrink:0;padding:5px 11px;border-radius:20px;border:none;font-size:12px;font-family:var(--font);cursor:pointer;background:${c.type===t?'var(--red)':'var(--bg2)'};color:${c.type===t?'#fff':'var(--t2)'};">${CARDIO_LABELS[t]}</button>`).join('')}
      </div>
      <div style="display:flex;gap:5px;align-items:center;margin-top:8px;">
        ${['leger','modere','intense'].map((iv,i)=>{const lbl=['Léger','Modéré','Intense'][i];return`<button onclick="setCardioField('intensity','${iv}','${moment}')" style="flex:1;padding:6px 0;border-radius:8px;border:none;font-size:12px;font-family:var(--font);cursor:pointer;background:${c.intensity===iv?'var(--red)':'var(--bg2)'};color:${c.intensity===iv?'#fff':'var(--t2)'};">${lbl}</button>`;}).join('')}
        <div style="display:flex;align-items:center;gap:6px;margin-left:6px;">
          <label style="font-size:12px;color:var(--t2);white-space:nowrap;">Durée</label>
          <input type="number" inputmode="numeric" min="0" max="300" value="${c.duration||''}" placeholder="0" oninput="setCardioField('duration',this.value,'${moment}')" style="width:52px;padding:5px 8px;border-radius:8px;border:1px solid var(--sep);background:var(--bg2);color:var(--t1);font-size:14px;font-weight:700;font-family:var(--font);text-align:center;">
          <span style="font-size:12px;color:var(--t3);">min</span>
        </div>
      </div>
    </div>`;
  };
  const aUnCardio=_aUnCardio();   // même définition que la mise à jour en direct (R2)
  el.innerHTML=`<div style="background:var(--bg2);border-radius:12px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);">
  <div onclick="toggleCardio()" style="display:flex;align-items:center;gap:13px;padding:12px 16px;cursor:pointer;touch-action:manipulation;">
    <div class="home-row-ic" style="background:rgba(255,138,114,.12);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M10 12L8 20"/><path d="M10 12L13 17L16 12"/><path d="M6 12L8 10L12 12L16 10L18 12"/></svg></div>
    <span class="home-row-ttl" style="flex:1;">Cardio</span>
    <span id="cardio-summary" style="font-size:12px;color:${aUnCardio?'var(--green)':'var(--t3)'};">${_cardioResume()}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--t3);transition:transform .2s;transform:rotate(${_cardioOpen?-90:0}deg);flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
  ${_cardioOpen?`<div style="padding:0 12px 12px;border-top:1px solid var(--sep);padding-top:4px;">
    ${volet('avant','🔥 Avant la séance','échauffement')}
    ${volet('apres','🧊 Après la séance','cardio de fin')}
    <button id="cardio-save-btn" class="btn btn-red ft-press" onclick="saveCardioEntry()" style="width:100%;margin-top:12px;padding:10px;font-size:14px;display:${aUnCardio?'block':'none'};">✓ Enregistrer le cardio</button>
  </div>`:''}
</div>`;
}
// Valide le cardio : replie le bloc (le résumé reste visible dans l'en-tête) — pas besoin de scroller.
function saveCardioEntry(){
  if(!S.wkt||!calcCardioKcalTotal()){toast('Entre une durée de cardio','info');return;}
  _cardioOpen=false;persist();renderCardioBlock();
  if(typeof renderLogFinish==='function')renderLogFinish();
  toast('Cardio enregistré ✅','success');
}

// ─── CALORIES BRÛLÉES ─────────────────────────────────────────
const MET_LOWER = 6.5;  // Squat, Deadlift, Hip Thrust, Leg Press
const MET_UPPER = 5.5;  // Bench, OHP, Rowing, Pull-ups
const MET_OLYMPIC = 8.0; // Arraché, Épaulé-jeté
const MET_CARDIO  = 8.0; // Corde à sauter, burpees, air bike… (voir CARDIO_KW plus bas)
const MET_ISO = 4.0;    // Isolation: curl, extension...
/* 🛋️ ENTRE LES SÉRIES — 1,5 ET PLUS 2,0 (16/08/2026, ft-v875)
   Le 2,0 n'était ancré nulle part : il dépassait TOUTES les postures publiées du Compendium
   2024 — assis 1,0 (07021) · debout tranquille 1,3 (07040) · **debout en bougeant un peu 1,5
   (07041)**. Or entre deux séries on est exactement là : debout, on range un disque, on boit,
   on regarde son téléphone. 2,0 correspond à de la marche lente, ce qu'on ne fait pas.
   ⚠️⚠️ ET C'EST LE 2ᵉ TEMPS D'UNE SÉQUENCE QUI NE POUVAIT PAS S'INVERSER. Livré AVANT la durée
   (ft-v874), ce changement aurait retiré ~23 kcal à un chiffre déjà 39 % sous la montre — on
   aurait dégradé le résultat visible pour améliorer l'ancrage, et personne n'aurait compris.
   Maintenant que le temps de repos est RÉEL, l'effet est presque deux fois plus fort (~43 kcal
   médians) parce qu'il y a bien plus de minutes de repos qu'avant. *La bonne correction au
   mauvais moment est une mauvaise correction.*
   ⚠️ ET ON NE LE CHOISIT PAS POUR LE SCORE — il DÉGRADE le résultat visible, c'est mesuré :
   sur 27 séances chronométrées à la montre, biais **−5,1 % → −15,8 %**, ±20 % **17 → 16**,
   **−36 kcal** par séance en médiane. On le fait quand même parce qu'une montre n'est pas une
   référence métabolique en résistance (r = 0,10-0,34 contre calorimétrie indirecte) alors que
   le Compendium en est une. *La physiologie ne se règle pas sur un bracelet.*

   ⏭️⏭️ MAIS ÇA REND VISIBLE LE VRAI TROU, ET IL N'EST PAS ICI. Le repos occupe ~80 % du temps,
   donc le MET de SÉANCE que ce modèle produit vaut `0,2 × met_exercice + 0,8 × MET_REST` :
   **2,74 avant, 2,36 après** — contre **3,5** publié pour « resistance training, moderate »
   (Compendium 02054), qui est une valeur de séance, repos compris. On s'en éloigne donc.
   La cause n'est PAS `MET_REST` : ce sont les **30 s par série en dur**, qui ne comptent ni
   l'installation, ni le déchargement, ni les séries longues. C'est le prochain chantier, et il
   se mesurera sur les horodatages — pas au jugé. NE PAS « corriger » ça en remontant `MET_REST`,
   ce serait remettre un chiffre faux pour compenser un autre chiffre faux. */
/* 🫀 3,0 ET PLUS 1,5 — ENTRE DEUX SÉRIES LOURDES, LE CORPS NE REVIENT PAS AU REPOS (16/08/2026)
   Michel : *« oui pour le MET »*, après qu'on ait posé le calcul ensemble.

   ⭐⭐ CE QUI A CHANGÉ D'AVIS, C'EST UNE ARITHMÉTIQUE, PAS UNE INTUITION. Le 1,5 de ft-v875 était
   correctement ancré — Compendium 07041, « debout, activité légère ». Mais il décrit **quelqu'un
   qui ne fait rien**, et pas **quelqu'un qui récupère d'un triple à 130 kg**. Deux états
   différents, et on avait pris le mauvais.
   LA DÉMONSTRATION, en une ligne : le Compendium publie **3,5** pour une séance de musculation
   modérée — et c'est une valeur de SÉANCE, repos compris. Sur la séance du 16/08, le temps actif
   ne pèse que **19 %**, à ~5,1 MET. Pour que le total fasse 3,5 :
       0,19 × 5,1  +  0,81 × x  =  3,5   →   **x ≈ 3,1**
   *La valeur publiée implique donc que le temps entre les séries coûte environ 3 MET.* Décomposer
   une valeur de séance en y remettant une posture de repos, c'est la « double dilution » — on
   retire deux fois le même repos.
   ⚠️ ET UNE 2ᵉ ROUTE, INDÉPENDANTE, TOMBE AU MÊME ENDROIT : la consommation d'oxygène pendant les
   intervalles de récupération en résistance reste à ~50 % de l'écart à l'effort. Avec un exercice
   à 5,5 MET : 1,0 + 0,5 × (5,5 − 1,0) = **3,25**. Deux raisonnements sans rapport, ~3,0-3,2.
   ⚠️ CONSÉQUENCE ASSUMÉE : ce taux rejoint celui du temps de TRANSITION (ft-v876). Les deux états
   coûtent désormais pareil, et la distinction ne survit que dans le RELEVÉ (`transitionMin` reste
   mesuré à part). On garde deux constantes parce qu'elles sont ancrées sur des sources
   différentes et peuvent diverger demain — pas pour faire joli.
   ⛔ NE PAS remonter au-delà de 3,0 pour se rapprocher d'une montre : au-dessus, le total dépasse
   la valeur publiée, et on aurait calé la physiologie sur un bracelet (r = 0,10-0,34 en
   résistance). Le plafond de ce raisonnement, c'est le Compendium, pas Garmin. */
const MET_REST = 3.0;   // récupération entre séries — voir la démonstration ci-dessus

/* 🔄 LE TEMPS ENTRE DEUX EXERCICES N'EST PAS DU REPOS (16/08/2026, ft-v876)
   Michel, et c'est une vraie nuance que le modèle ne faisait pas : *« des fois entre chaque
   série il y a 1 min 30 de repos, c'est à peine le temps pour charger une machine. Par contre
   quand je fais un soulevé de terre à 140 kg, le temps de décharger la barre et d'aller à
   l'autre exercice, ça peut prendre 5 à 7 minutes. Et là ce n'est PAS du repos. »*

   ⭐ IL A RAISON, ET ÇA EXPLIQUE LE TROU QU'ON AVAIT LAISSÉ OUVERT EN ft-v875. Le modèle n'avait
   que **deux** états — on soulève, ou on est debout à 1,5 MET. Or il y en a **trois** :
     ① la série ....................... le MET de l'exercice
     ② le repos ENTRE deux séries ..... 1,5 (debout, on souffle) — c'est bien ce qu'on fait
     ③ le passage d'un exercice à l'autre : on décharge 140 kg de disques, on les range, on
        traverse la salle, on recharge. **C'est du port de charge, pas du repos.**
   Le ③ était compté comme du ② ou dilué dans la moyenne. C'est précisément pour ça que le MET de
   séance produit tombait à 2,4 quand la valeur publiée d'une séance est 3,5 : *on créditait du
   travail au tarif de quelqu'un qui ne fait rien.*

   ⚠️ 3,0 ET PAS PLUS : c'est la famille « marche lente / porter une charge légère » du Compendium
   2024 — au-dessus de debout (1,3-1,5), en dessous d'une série (5,5-8,0). On reste volontairement
   au BAS de cette famille : tout ce temps n'est pas passé à porter des disques, il y a aussi les
   files d'attente et les discussions. *Mieux vaut sous-estimer une transition que la facturer au
   prix d'un squat.*
   ⚠️ ET ON NE DEVINE PAS SA DURÉE : elle n'est ni saisie ni mesurable série par série. C'est le
   RESTE — la durée réelle de la séance moins ce qu'on a modélisé. Ce reste existait déjà, il
   était simplement réparti au prorata sur tout le monde ; il a maintenant son propre tarif. */
const MET_TRANSITION = 3.0;   // Compendium 2024 · marche lente / port de charge légère

/* 🏷️ LA VERSION DU MOTEUR DE CALORIES, STOCKÉE SUR CHAQUE SÉANCE (17/08/2026).
   ⚠️ POURQUOI — deux audits extérieurs ont passé une journée à démontrer que l'historique avait
   « changé sous l'analyse », et ils avaient raison sur le fait : les séances d'avant le 13/08 ont
   été recalculées le 12/08 (bouton « Recaler mes anciennes séances », marqué `calSource:'recale'`).
   Rien n'était FAUX — la valeur d'origine est conservée dans `caloriesAvant`, le geste était
   explicite et réversible — mais **rien ne disait avec quel modèle un chiffre avait été produit**.
   Un chiffre sans version ne peut pas être comparé à un autre chiffre, ni rejoué.
   ⚠️ À N'INCRÉMENTER QUE QUAND LE MODÈLE CHANGE, jamais à chaque release (ce serait `sw.js`).
     1 — avant ft-v874 : durée FABRIQUÉE (n × 30 s + repos réglé), MET_REST 2,0
     2 — ft-v874→885   : durée mesurée (horodatage/chrono), 3 temps, MET_REST 1,5 puis 3,0
     3 — depuis ft-v886 : + facteur de charge par série, MET_REST 3,0, plafond des écarts revu
   ⚠️ Les séances DÉJÀ enregistrées n'en portent pas : on ne réécrit pas l'historique pour poser
   une étiquette (c'est précisément ce qu'on nous reprochait). Leur version se lit autrement —
   `calSource:'recale'` pour les migrées, la présence de `warmupMin` pour les natives de la v2+. */
const CAL_ENGINE = 3;

// ⚠️ L'INTENSITÉ SE DÉDUIT DES MUSCLES, PLUS D'UNE 2ᵉ LISTE DE MOTS-CLÉS (ft-v668).
// Avant : `LOWER_KW`/`UPPER_KW`, une liste de 16 mots-clés **parallèle** à `_MEX` — donc
// condamnée à divergter. Mesuré le 29/07/2026 : **142 exercices sur 249 (57 %)** tombaient
// sur la valeur par défaut « isolation », dont **56 gros mouvements** manifestement faux
// (toutes les fentes, toutes les presses à jambes, kettlebell swing, hyperextensions,
// good morning, pompes, Meadows/Seal row, thruster…). 4.0 au lieu de 6.5 = **38 % de
// calories en moins** sur une séance de fentes. Retour Michel : « le calcul des calories
// est bien respecté avec les anciens et nouveaux exercices ? » — non.
// MAINTENANT : une seule source de vérité, la table des muscles (R2).
//   · polyarticulaire = **3 muscles ou plus** sollicités (le développé couché en a 3,
//     un curl en a 2) — c'est ça qui distingue un gros mouvement d'un exercice d'isolation ;
//   · la région dominante décide ensuite entre bas du corps (6.5) et haut (5.5).
// L'haltérophilie garde sa liste de mots : ce qui la définit est le caractère EXPLOSIF
// du mouvement, pas les muscles qu'il utilise.
const OLYMPIC_KW = ['Arraché','Épaulé','Jeté','Snatch','Clean','Jerk','Thruster','Turkish','Get-Up'];
// ⚠️ LE CARDIO AUSSI garde sa liste, et pour la MÊME raison que l'haltérophilie : ce qui le
// définit n'est pas le nombre de muscles mais le caractère CONTINU et essoufflant.
// Mesuré à l'audit du 02/08 : « Sauts à la Corde » n'active que 2 muscles (mollets, quadriceps)
// → moins de 3 → il tombait sur MET_ISO = 4.0, **la valeur la plus basse du barème**, à égalité
// avec un curl biceps. C'est le même piège qu'en ft-v668, sur une autre famille : la règle
// « 3 muscles ou plus » distingue bien un polyarticulaire d'une isolation, mais elle ne sait
// rien de l'ESSOUFFLEMENT. Un burpee et une corde à sauter coûtent cher avec peu de muscles.
const CARDIO_KW = ['Corde à Sauter','Sauts à la Corde','Air Bike','Assault','Ski Erg','Ergomètre',
  'Burpee','Jumping Jack','Bear Crawl','Marche de l\'Ours','Mountain Climber','Grimpeur',
  'Battle Rope','Box Jump','Wall Ball','Rameur','Tapis','Elliptique'];
// Le CHARIOT (sled) n'est PAS dans cette liste, volontairement : c'est de la force-endurance
// lourde, déjà bien servie par la déduction (6,5 = bas du corps). Le bac « Cardio » du sélecteur
// répond à « où le trouver ? » ; le MET répond à « combien ça coûte ? » — deux questions.
const _MET_REGIONS = {
  bas: ['quads','hamstrings','glutes','calves','soleus','hip-flexors','adductors','tibialis'],
  haut:['pec','front-delt','side-delt','triceps','lats','traps','rear-delt','biceps','forearms','forearm-ext']
};
function getExerciseMET(name) {
  const n = name || '';
  if (OLYMPIC_KW.some(k => n.toLowerCase().includes(k.toLowerCase()))) return MET_OLYMPIC;
  if (CARDIO_KW.some(k => n.toLowerCase().includes(k.toLowerCase()))) return MET_CARDIO;
  // ⚠️ Les PORTÉS (farmer's walk & co) : le MET se déduit de la région des muscles, or on a
  // corrigé le 02/08 le farmer's walk en « avant-bras + trapèzes » (c'est la PRISE qui lâche,
  // pas les jambes). Effet de bord : il serait passé de 6,5 à 5,5 — alors que marcher chargé
  // reste une dépense de tout le corps. On le fixe donc explicitement, au lieu de laisser la
  // correction musculaire déplacer les calories sans qu'on l'ait voulu.
  if (/farmer|fermier|\bcarry\b|porte lourd|suitcase carry/i.test(n)) return MET_LOWER;
  try {
    if (typeof _mscScores === 'function') {
      const sc = (_mscScores([{name:n, sets:[{done:true}]}]) || {}).sc || {};
      const noms = Object.keys(sc);
      // moins de 3 muscles sollicités → exercice d'isolation
      if (noms.length < 3) return MET_ISO;
      // ⚠️ UNE CHARNIÈRE DE HANCHE EST UN MOUVEMENT DU BAS DU CORPS, par définition — soulevés,
      // roumains, good morning, rack pull. Sans cette ligne, la déduction par région se trompe :
      // `lower-back` n'appartient à AUCUNE des deux régions ci-dessous, donc il gonfle le
      // dénominateur sans jamais compter côté « bas » et tire la moyenne vers le haut du corps.
      // Mesuré le 02/08 : en retirant le quadriceps du soulevé ROUMAIN (il n'y travaille pas,
      // les genoux restent tendus), les 6 roumains basculaient de 6,5 à 5,5 — le coût d'un
      // développé couché pour l'exercice de chaîne postérieure le plus lourd du catalogue.
      // Une correction ANATOMIQUE ne doit pas déplacer les calories par effet de bord (même
      // leçon que le farmer's walk, ft-v730). Touche exactement 7 exercices, tous des hinges.
      if (typeof _movPattern === 'function' && _movPattern(n) === 'hip-hinge') return MET_LOWER;
      let bas = 0, tot = 0;
      for (const m of noms) { tot += sc[m]; if (_MET_REGIONS.bas.indexOf(m) >= 0) bas += sc[m]; }
      return (tot > 0 && bas / tot >= 0.5) ? MET_LOWER : MET_UPPER;
    }
  } catch (e) {}
  return MET_ISO;   // exercice inconnu du moteur : on n'invente pas une grosse dépense
}

// ─── TEMPS EFFECTIF D'UNE SÉANCE, lu sur les horodatages de séries (12/08/2026) ─────
// Répond à l'objection de Michel : « si la personne n'arrête pas sa séance les calories
// continuent de monter ; ça m'arrive de prendre plus de temps de récupération ».
//
// ⭐ CE QUI RÈGLE LE « TERMINER » OUBLIÉ : on ne regarde PAS le bouton. La fenêtre va de la
// PREMIÈRE à la DERNIÈRE série validée — si on ferme l'app deux heures plus tard, ça ne change
// rien, parce que l'horloge s'est arrêtée à la dernière série. C'est gratuit et c'est le cas
// le plus grave, celui qui produirait un chiffre absurde.
//
// ⭐ CE QUI RÈGLE LE REPOS RALLONGÉ : chaque écart entre deux séries est PLAFONNÉ. Un repos de
// 3 min compte 3 min ; un appel téléphonique de 20 min compte le plafond. On ne jette pas
// l'écart, on le tronque — la personne était bien là, debout, en train de récupérer.
//
// ⚠️ LE PLAFOND EST UN JUGEMENT, et il est écrit comme tel : `max(5 min, 2× le repos réglé)`.
// Le plancher de 5 minutes protège un vrai repos de série lourde (squat, soulevé) — quelqu'un
// qui règle 90 s de repos par défaut fait quand même 4-5 min entre deux séries maximales, et
// le lui tronquer serait le punir de s'entraîner lourd.
//
// ⚠️ CE QU'ELLE NE MESURE PAS, et il faut le savoir avant de s'en servir : l'exécution de la
// PREMIÈRE série (l'horodatage est posé quand on coche, donc après l'effort) et tout ce qui
// précède (mise en place, échauffement non noté). C'est volontairement conservateur : mieux
// vaut un temps effectif un peu court qu'un temps gonflé par ce qu'on n'a pas vu.
//
// ⚠️ NE CHANGE AUCUN CALCUL AUJOURD'HUI. Elle sert à MESURER, pour départager les 3 approches
// de `docs/CALORIES-SOURCES.md` §13.6 sur 10 séances. Le barème se choisit après, pas avant.
/* ── LE SCHÉMA DE SÉRIES DIT LA PHASE (14/08/2026, consigne de Michel) ─────────────────
   *« l'app doit comprendre quand on est en cycle lourd, 3×3, 5×3 ou 5×5 »*. Ses repos réels :
   lourd 3-5 min · série normale 1 min 15-1 min 45 · abdos 30 s-1 min.
   ⭐ POURQUOI LE SCHÉMA ET NON L'EXERCICE : Michel l'a démontré en une phrase — *« et si on
   fait un squat avec 2 minutes de repos ? »*. C'est alors un squat **3×10**, pas un **5×3**.
   Même exercice, deux séances différentes : le NOM ne peut pas les distinguer, le schéma si. */
function _classeRepos(reps){
  const r=+reps||0;
  if(r>0&&r<=5)  return {k:'lourd',  defaut:300}; // 3×3, 5×3, 5×5 → 3 à 5 min
  if(r>0&&r<=12) return {k:'normal', defaut:180}; // 4×8, 3×10, 3×12 → 1 min 15 à 1 min 45
  return          {k:'court',  defaut:120};       // 15+ et abdos → 30 s à 1 min
}
function _mediane(a){
  if(!a.length)return 0;
  const t=a.slice().sort((x,y)=>x-y), m=t.length>>1;
  return t.length%2 ? t[m] : (t[m-1]+t[m])/2;
}
function _dureeEffective(session){
  try{
    /* ⚠️ ON GARDE LES REPS AVEC L'HEURE : le plafond dépend du type de série qu'on vient de
       terminer, pas d'un réglage global. Sans ça, une séance qui mélange squat 5×3 et abdos
       3×20 recevrait le même plafond partout — trop lâche pour l'un, trop serré pour l'autre. */
    /* ⚠️ ON GARDE AUSSI LE TYPE DE SÉRIE ET L'EXERCICE (16/08/2026, ft-v885) — voir plus bas :
       le plafond se calait sur des repos d'ÉCHAUFFEMENT, et le passage d'un exercice à l'autre
       était traité comme un repos entre séries. */
    const pts=[]; let _ei=0;
    for(const ex of (session&&(session.exs||session.exercises))||[]){
      for(const s of (ex.sets||[]))
        if(s&&s.done&&typeof s.at==='number'&&isFinite(s.at)&&s.at>=0)
          pts.push({at:s.at, reps:+s.reps||0, ei:_ei, ech:(s.type==='É'||s.type==='W')});
      _ei++;
    }
    if(pts.length<2) return null;          // 0 ou 1 série horodatée → on ne sait rien, on le dit
    pts.sort((a,b)=>a.at-b.at);
    const ats=pts.map(p=>p.at);
    /* ── LE PLAFOND S'ADAPTE À CE QUI A ÉTÉ FAIT CE JOUR-LÀ ────────────────────────────
       Objection de Michel : un plafond fixe de 5 min sur le squat, c'est son PIRE jour, pas
       son jour normal — il laisserait passer 5 min de téléphone sur une séance faite à 2 min
       de repos. On se cale donc sur ses écarts RÉELS, par classe de série.
       ⚠️ MÉDIANE, PAS MOYENNE : une seule interruption démolit une moyenne (l'anomalie qu'on
       veut écarter servirait à fixer la règle) ; la médiane ne bouge pas.
       ⚠️ Il faut au moins 3 écarts dans la classe pour que la médiane tienne — en dessous on
       retombe sur les repères métier de Michel. Une règle ne sert qu'à défaut de mesure. */
    /* ⚠️⚠️ LE PLAFOND NE SE CALE PLUS SUR LES ÉCHAUFFEMENTS (16/08/2026, ft-v885).
       Michel, sur sa séance du 16/08 : *« c'est quoi encore cette différence de calories, je
       trouve ça énorme »*. Mesuré : l'app retenait **56,6 min** quand sa montre en relevait
       **63,8**. Le plafond appliqué valait **239 s**, et il a coupé des repos de **284, 316 et
       265 s** ENTRE SES SÉRIES DE SOULEVÉ DE TERRE À 130 kg — c'est-à-dire des repos de 4 à
       5 minutes, parfaitement normaux et même recommandés à cette charge.
       ⭐ LA CAUSE : la médiane qui fixe le plafond était calculée sur TOUS les écarts de la
       classe, et la classe « lourd » (≤ 5 reps) mélange les **paliers d'échauffement** — 56 s,
       68 s, 83 s, expédiés — avec les **vraies séries de travail** — 284 s, 316 s. Les
       échauffements tirent la médiane vers le bas, donc le plafond se referme sur les repos qui
       comptent. *Deux animaux différents dans le même sac, depuis que l'app ajoute elle-même
       des paliers d'échauffement (ft-v858).*
       ⚠️ ON N'ÉLARGIT PAS LE PLAFOND, ON CORRIGE CE QU'IL MESURE : seules les séries de TRAVAIL
       fixent la référence. Les échauffements restent plafonnés comme avant — c'est bien eux qu'on
       veut borner, ils n'ont aucune raison de durer 5 minutes.
       ⚠️ ET LE PASSAGE D'UN EXERCICE À L'AUTRE N'EST PAS UN REPOS (Michel, ft-v876 : *« décharger
       la barre et aller à l'autre exercice, ça peut prendre 5 à 7 minutes, et là ce n'est pas du
       repos »*). Il reçoit donc le plafond MAXIMUM, pas celui d'un repos entre deux séries. */
    const parClasse={};
    for(let i=1;i<pts.length;i++){
      if(pts[i-1].ech) continue;                 // un palier d'échauffement ne fixe pas la règle
      if(pts[i].ei!==pts[i-1].ei) continue;      // ni un changement d'exercice
      const c=_classeRepos(pts[i-1].reps).k;
      (parClasse[c]=parClasse[c]||[]).push(pts[i].at-pts[i-1].at);
    }
    const PLAFOND_MAX=600;   // 10 min : au-delà ce ne sont plus 2 séries, ce sont 2 séances
    const PLAFOND_MIN=60;    // en dessous, on tronquerait des repos parfaitement normaux
    const plafondDe=(reps,transition)=>{
      if(transition) return PLAFOND_MAX;         // décharger, ranger, traverser : autre nature
      const cl=_classeRepos(reps), obs=parClasse[cl.k]||[];
      const base=obs.length>=3 ? 2*_mediane(obs) : cl.defaut;
      return Math.max(PLAFOND_MIN,Math.min(PLAFOND_MAX,Math.round(base)));
    };
    let actif=0, coupe=0, plafond=0;
    for(let i=1;i<pts.length;i++){
      const ecart=pts[i].at-pts[i-1].at, p=plafondDe(pts[i-1].reps, pts[i].ei!==pts[i-1].ei);
      plafond=Math.max(plafond,p);
      actif+=Math.min(ecart,p);
      if(ecart>p) coupe+=ecart-p;
    }
    const span=ats[ats.length-1]-ats[0];
    return {
      n:ats.length,                        // séries horodatées
      spanSec:span,                        // 1ʳᵉ → dernière série, brut
      actifSec:actif,                      // idem, chaque écart plafonné
      coupeSec:coupe,                      // ce que le plafond a retiré
      plafondSec:plafond,
      // densité = séries par minute effective. C'est l'axe qui distingue « repos longs » (< 0,25)
      // d'un circuit (> 0,65), et il se déduit — on ne demande rien à la personne.
      densite: actif>0 ? +(ats.length/(actif/60)).toFixed(3) : null
    };
  }catch(e){ return null; }
}

/* ── L'ESTIMATION « TEMPS RÉEL » — AFFICHÉE, PAS BRANCHÉE (14/08/2026) ─────────────────
   Michel : *« comme ça je peux voir si je me rapproche de ma montre »*. On calcule ce que
   donnerait la séance si on comptait le TEMPS EFFECTIVEMENT PASSÉ, et on l'affiche À CÔTÉ du
   chiffre actuel — sans rien changer à `sess.calories`, ni au suivi nutrition.
   ⚠️ POURQUOI ON NE BRANCHE PAS TOUT DE SUITE : mesuré sur 6 séances, le calcul actuel crédite
   1,2 à 2,1 MET pour de la musculation lourde (1 MET = au repos allongé, 2 = debout immobile),
   et son total ne dépend PAS de la durée — 2 h 20 rendent 231 kcal quand 1 h 30 en rendent 260.
   Le correctif fera monter les calories d'environ 70 % : autant qu'il soit juste du premier coup
   plutôt que rectifié trois fois sur le suivi nutrition de quelqu'un.
   LE MET : 3,5 = « resistance training, moderate effort » du Compendium 2024 — une valeur
   PUBLIÉE et citable, pas un chiffre ajusté sur les 6 séances de Michel (ce serait se noter
   soi-même). Ses relevés Garmin donnent 2,8 à 4,2 : 3,5 tombe au milieu, ce qui est encourageant
   mais ne prouve rien tant qu'on ne l'a pas vérifié sur des séances horodatées.
   ⚠️ Musculation SEULE : le cardio noté a son propre calcul et n'entre pas ici. */
const MET_MUSCU_MODERE=3.5;
function _estimCalTempsReel(session){
  const d=(typeof _dureeEffective==='function')?_dureeEffective(session):null;
  if(!d||!(d.actifSec>60))return null;
  const bw=+S.bw||80;
  return {kcal:Math.round(MET_MUSCU_MODERE*bw*(d.actifSec/3600)), min:Math.round(d.actifSec/60)};
}

/* ⏱️ LA DURÉE D'UNE SÉANCE — MESURÉE D'ABORD, ESTIMÉE ENSUITE, TOUJOURS BORNÉE (16/08/2026)
   Michel : *« fais la durée, par contre toujours un garde-fou sur des durées extrêmes ou très
   courtes, et celles qui n'ont pas d'horodatage on met un max estimé par rapport à ma montre et
   on extrapole pour les autres »*.

   ⭐⭐ LE PROBLÈME, ÉTABLI PAR DEUX ANALYSES INDÉPENDANTES : la durée n'était pas mesurée, elle
   était FABRIQUÉE — `n × 30 s + (n − nb_exercices) × repos_réglé`. Corrélation avec la vraie
   durée : **r = −0,105**. L'app ne sous-estimait pas le temps : elle ne le regardait pas.
   Une séance d'1 h 51 était comptée 28 minutes.
   ⭐ ET LE MET, LUI, ÉTAIT DÉJÀ JUSTE : facteur médian **1,005** entre le MET de séance de l'app
   et celui relevé à la montre sur 27 séances. On ne touche donc PAS au MET — seulement au temps.

   LA CASCADE, du plus fiable au moins fiable :
     ① les HORODATAGES de séries (depuis ft-v835) → durée réelle, ±2 % vérifié
     ② le CHRONO stocké de la séance
     ③ sinon, la RÈGLE GÉNÉRALE `n × (30 s + repos réglé)` — elle n'utilise QUE le réglage de la
        personne, aucune donnée d'une montre, aucune calibration personnelle.
   ⚠️ ET CHACUN DES TROIS PASSE PAR `borne()`, sans exception — c'est le « toujours » de Michel.

   MESURÉ contre 27 séances chronométrées à la montre (le seul juge disponible) :
     formule actuelle ............................. biais **−38,9 %**  ·  2 séances / 27 à ±20 %
     **cascade complète** ......................... biais **−5,1 %**   ·  17 séances / 27

   ⚠️⚠️ ET LE CHRONO DOUTEUX EST ÉCARTÉ PAR **LA MÊME FONCTION QUI MET LE ⚠️ À L'ÉCRAN**
   (`_dureeDouteuse`, setup.js, ft-v868/869). C'est le choix qui compte ici, et il n'est pas fait
   sur le score : *bornER* un chrono aberrant au lieu de l'écarter donnait **18/27** contre 17 —
   un écart d'une séance sur 27, c'est-à-dire rien. Mais l'app aurait alors AFFICHÉ « durée
   douteuse » sur une séance **et** s'en serait servie pour calculer ses calories. Deux sources
   qui se contredisent, la famille de bugs la plus vicieuse du projet (**R2**). La règle tient en
   une ligne vérifiable : *si l'app met un ⚠️ sur une durée, elle ne s'en sert pas.*
   ⚠️ ET UNE DURÉE SAISIE À LA MAIN (ft-v852) EST CRUE SUR PAROLE, hors bornes comprises — c'est
   la personne qui sait, pas l'app. `_dureeDouteuse` le dit déjà ; on hérite du même arbitrage
   plutôt que de le réécrire ici.

   ⚠️ LE GARDE-FOU S'APPLIQUE AUX DEUX BOUTS : entre **1,5 et 10 minutes par série** (au-delà de
   6 séries) et **3 h maximum**.
     · le plancher 1,5 est **PHYSIQUE** — une série plus le repos minimal ne descend pas en dessous.
       Il attrape la séance RESSAISIE après coup (ft-v869/870 : 19 min pour 16 séries).
     · le plafond 10 est une **BORNE DE VRAISEMBLANCE, pas un réglage**. Sur les 27 séances
       chronométrées, le maximum réellement observé est **7,4 min/série** (jambes lourdes) et la
       médiane 3,7. On laisse volontairement de la marge au-dessus : quelqu'un de plus lent que
       Michel existe, et **rogner une durée vraie coûte plus cher que laisser passer une durée
       douteuse** (R29) — la durée douteuse est déjà SIGNALÉE à l'écran (ft-v868/869), et la
       personne peut la corriger à la main (ft-v852).
   ⚠️ SOUS 6 SÉRIES ON NE BORNE PAS PAR SÉRIE : une séance de 2 ou 3 séries expédiée existe.
   ⚠️ ET ON NE TOUCHE À RIEN D'AUTRE : le MET reste celui de l'app, les constantes aussi. */
function _dureeSeanceMin(session, nSets, dureeFormuleMin){
  const MIN_PAR_SERIE=1.5, MAX_PAR_SERIE=10, MAX_MIN=180;
  const borne = m => {
    if(!(m>0)) return 0;
    if(nSets>=6) m = Math.min(Math.max(m, nSets*MIN_PAR_SERIE), nSets*MAX_PAR_SERIE);
    return Math.min(m, MAX_MIN);
  };
  // ⓪ la durée SAISIE À LA MAIN passe avant tout, y compris avant les horodatages : c'est une
  //    correction explicite de la personne, et elle sait ce que l'app ne saura jamais (R29).
  if(session && session.durationDite && +session.duration>0)
    return {min:(+session.duration)/60, src:'saisie'};
  /* ⚠️⚠️ J'AI ESSAYÉ DE PRENDRE LE PLUS GRAND DES DEUX, ET LA MESURE L'A REFUSÉ (16/08/2026).
     Le raisonnement semblait imparable : les horodatages ne voient rien avant la 1ʳᵉ série ni
     après la dernière, alors que le chrono couvre toute la séance — donc le chrono, quand il est
     plus grand, serait « plus complet ». Sur la séance du 16/08 ça marchait (59,0 → 63,1 min,
     montre 63,8). **Sur les 27 séances chronométrées, non** : le 13/08, le chrono dit 103 min
     quand la montre en relève 86,6 et les horodatages 74,6. Résultat global : ±20 % 15/27 → 14/27.
     Un chrono peut déborder sans franchir le seuil du « douteux » ; les horodatages, eux, ne
     débordent jamais — ils ne peuvent que manquer. *Entre une mesure qui sous-estime et une qui
     peut déborder, on garde celle qui sous-estime* (R29). L'idée est écrite ici pour qu'on ne la
     retente pas dans six mois en croyant l'avoir trouvée.
     ① mesuré — les horodatages de séries, la seule vraie mesure dont l'app dispose */
  try{
    const eff = (typeof _dureeEffective==='function') ? _dureeEffective(session) : null;
    if(eff && eff.actifSec > 0) return {min:borne(eff.actifSec/60), src:'horodatage'};
  }catch(e){}
  // ② le chrono de la séance — sauf si l'app le juge douteux (LA MÊME règle qu'à l'écran, R2)
  const ch = (+session.duration||0)/60;
  if(ch > 0){
    const douteuse = (typeof _dureeDouteuse==='function') ? _dureeDouteuse(session) : (nSets>=6 && (ch/nSets<1.5 || ch/nSets>MAX_PAR_SERIE)) || ch>MAX_MIN;
    if(!douteuse) return {min:borne(ch), src:'chrono'};
  }
  // ③ estimation — le réglage de repos de la personne, rien d'autre
  const rest = (typeof S!=='undefined' && S.defRest) ? S.defRest : 120;
  const est = borne(nSets*(30+rest)/60);
  return {min: est || dureeFormuleMin, src: est ? 'estimee' : 'formule'};
}

/* ⏱️➕ LA DURÉE **TOTALE** — LA MUSCU MESURÉE, PLUS LE CARDIO QUI N'Y ÉTAIT PAS (18/08/2026)
   Michel, en pleine séance : *« je viens de commencer la séance mais la séance n'a pas commencé.
   Je n'ai rentré aucune valeur de musculation mais je fais du cardio avant, il faut que ce soit
   pris en compte dans la durée totale »*. Il a raison, et le trou est réel : ses 20 minutes de
   vélo n'apparaissaient **nulle part** dans la durée de sa séance.

   ⚠️⚠️ LE POURQUOI, ET IL EST ENTIÈREMENT DANS UNE DÉCISION ANTÉRIEURE : depuis le 14/08, le
   chrono démarre à la **1ʳᵉ SÉRIE VALIDÉE**, plus à l'ouverture de l'écran (log.js). C'était une
   très bonne décision — elle a corrigé la plus grosse erreur mesurée du projet (254 min stockées
   pour 96 réelles) — mais elle a un effet de bord que personne n'avait suivi jusqu'ici : **tout
   ce qui se passe AVANT la 1ʳᵉ série est désormais hors du chrono**, y compris un vrai cardio.

   👉 ON NE TOUCHE PAS AU CHRONO — c'est la MESURE de la musculation, et le moteur de calories
   s'appuie dessus. On ajoute par-dessus les minutes de cardio **DÉCLARÉES**, et seulement celles
   qui ne sont pas déjà dedans. Une durée, un propriétaire (R2) : `sess.duration` reste la muscu,
   cette fonction est la seule à dire le total, et tout ce qui l'affiche passe par elle.

   ⚠️ CE QUI EST DÉJÀ DEDANS DÉPEND DE LA SOURCE — c'est tout le raisonnement :
     · `saisie`      → la personne a donné SA durée, elle sait ce qu'elle y a mis. On n'ajoute RIEN
                       (R29 : on ne corrige pas quelqu'un qui a saisi son propre chiffre).
     · `horodatage`  → l'écart entre deux séries validées. Ni l'avant ni l'après n'y ont jamais
                       été → on ajoute les deux.
     · `chrono`      → démarre à la 1ʳᵉ série et court jusqu'à « Terminer » : le cardio d'APRÈS
                       est dedans (on le note en revenant du tapis, avant de terminer), celui
                       d'AVANT n'y est pas → on n'ajoute que l'avant.
     · `estimee` / `formule` → déduites des séries seules → on ajoute les deux.
   ⚠️ SI LA RÈGLE DU CHRONO CHANGE (retour à un démarrage à l'ouverture), la ligne `chrono`
   ci-dessous devient FAUSSE et compte le cardio d'avant deux fois. Elle est testée pour ça. */
function _dureeTotaleMin(session, nSets, dureeFormuleMin){
  const base = _dureeSeanceMin(session, nSets, dureeFormuleMin);
  const min0 = +session?.cardioAvant?.duration || 0;
  const min1 = +session?.cardio?.duration || 0;
  let ajout = 0;
  if(base.src==='chrono') ajout = min0;
  else if(base.src!=='saisie') ajout = min0 + min1;
  return {min: base.min + ajout, muscuMin: base.min, cardioMin: ajout, src: base.src};
}

/* ⏱️ LE TEMPS D'UNE SÉRIE — DÉDUIT DES RÉPÉTITIONS, PLUS UN FORFAIT DE 30 s (16/08/2026)
   Michel : *« fais les 30 secondes par série maintenant »*.

   ⭐ LE PROBLÈME : `30 s` était écrit EN DUR pour toutes les séries, depuis toujours. Or une
   série de **3** répétitions lourdes et une série de **20** au curl ne durent évidemment pas
   pareil — et l'app connaît les répétitions, elle les a sous la main. C'était **R8 à l'envers** :
   la donnée était là, le calcul ne la regardait pas.
   ⚠️⚠️ ET CE N'EST PAS QU'UNE QUESTION DE PRÉCISION : depuis ft-v874 le total est mis à l'échelle
   de la durée RÉELLE, donc la part active/repos ne change plus la durée — elle change le **MET de
   séance**, c'est-à-dire l'intensité. Une séance de powerlifting (3 reps, repos longs) et une
   séance d'hypertrophie (12 reps, repos courts) rendaient exactement la même intensité. *Deux
   pratiques différentes, un seul chiffre : c'est ça qu'on corrige.*

   LES DEUX CONSTANTES, et d'où elles viennent :
     · **10 s d'installation** — dégager la barre, se placer, la reposer. Ne dépend pas des reps.
     · **3 s par répétition** — le tempo courant en musculation (~1 s concentrique + ~2 s
       excentrique). C'est la fourchette publiée sur le temps sous tension (20-40 s pour une série
       de 8-12), pas un chiffre ajusté sur les séances de quelqu'un.
   ⚠️ PLAFOND À 3 MIN : une série notée à 100 répétitions (gainage compté en secondes, faute de
   frappe) ne doit pas engloutir la séance.
   ⚠️ SANS RÉPÉTITIONS NOTÉES ON GARDE LES 30 s : on ne devine pas, on retombe sur l'ancien
   comportement — c'est le seul cas où l'app ne sait rien (R29).

   ⛔ CE QUE ÇA NE FAIT PAS, ET IL FAUT LE DIRE : le MET de séance produit reste sous les 3,5
   publiés (Compendium 02054). Le modèle à deux états — effort au MET de l'exercice, repos à 1,5 —
   ne PEUT PAS reproduire une valeur de séance, parce qu'entre deux séries lourdes la
   consommation d'oxygène reste élevée au lieu de retomber à « debout tranquille ». Ce trou-là
   ne se bouche ni en gonflant les secondes par série, ni en remontant `MET_REST` : il demande
   un modèle de récupération, et ça se mesure — ce n'est pas pour ce soir. */
const SEC_INSTALLATION = 10;   // dégager/reposer la barre, se placer
const SEC_PAR_REP      = 3;    // tempo courant ~1 s concentrique + ~2 s excentrique
const SEC_SERIE_MAX    = 180;  // garde-fou : une série ne dure pas 10 min
const SEC_SERIE_DEFAUT = 30;   // aucune répétition notée → l'ancien forfait, inchangé

/* 🐢 LE TEMPO DESCEND JUSQU'À LA DONNÉE (26/08/2026, ft-v1028)
   Vient des 6 programmes écrits par la coach de Michel (2023, `docs/NUTRITION-PROGRAMMES-REELS.md`
   §3bis) : le **tempo y est une COLONNE** — *« 3 sec descente, 2 sec contraction »*, *« monte 3 sec,
   bloque 3 sec, descends 3 sec »*.

   ⚠️ J'AI D'ABORD DIT « le tempo n'existe nulle part » — c'est FAUX, et la mesure le dit : la
   consigne libre par exercice (`ex.note`) existe, s'affiche pendant la séance (`log.js`) et part
   dans le contexte de Milo (`[note: …]`). **On PEUT écrire un tempo depuis longtemps.**
   ⛔⛔ LE TROU EST AILLEURS, ET C'EST R4 DANS SA FORME LA PLUS PURE : le tempo est de la PROSE
   dans une note, et une CONSTANTE (`SEC_PAR_REP = 3`) dans le calcul — dont le commentaire dit
   lui-même *« le tempo courant »*. **Les deux ne se rencontrent jamais.** Une série de 10 reps à
   « 3 s descente + 2 s contraction » dure 50 s de travail, pas 30 : l'app le lisait à l'écran et
   comptait autre chose.

   ⛔ ON N'INVENTE RIEN, ET LE SILENCE EST LA RÈGLE (R29) : sans motif chiffrable → `null`, et
   `_secSerie` retombe **exactement** sur son ancien comportement. *Non-chiffrable n'est pas
   « 3 par défaut », c'est « je ne sais pas »* — même règle que l'extraction du cadre en ft-v1026.

   ⚠️ LE PIÈGE EST LE REPOS, PAS LE TEMPO. `45 sec max` et `repos 90 sec` sont des secondes qui
   n'ont RIEN à voir avec la manière de bouger — et la coach écrit littéralement « 45 sec max »
   dans sa colonne *Repos maximum*. D'où DEUX garde-fous : ① le texte doit parler du MOUVEMENT
   (descente, montée, blocage, contraction, excentrique…), sinon on ne lit rien ; ② les secondes
   annoncées comme du repos sont retirées avant de compter.
   ⚠️ ET LA BORNE RATTRAPE LE RESTE : hors de 1 à 15 s par répétition, on rend `null` plutôt qu'un
   chiffre douteux. Conséquence assumée et écrite : « descente 3 sec, repos 90 sec » (si « repos »
   est écrit autrement) sort de la borne et **on se tait**, ce qui vaut mieux qu'une série comptée
   à 15 minutes.

   ⛔ ET MILO NE REÇOIT RIEN DE PLUS (R2) : il a déjà la note en toutes lettres. Lui envoyer en
   plus « 5 s/rep » serait la même information deux fois, avec deux propriétaires. */
const TEMPO_MIN = 1, TEMPO_MAX = 15;   // secondes par répétition — hors bornes = on ne sait pas
const _TEMPO_MOUVEMENT = /tempo|descen|montée|montee|monte\b|remont|excentri|concentri|bloqu|contract|isom|négati|negati|lente|lentement/i;
const _TEMPO_REPOS     = /(?:repos|récup|recup)[^.;,\n]{0,14}?\d+(?:[.,]\d+)?\s*(?:s|sec|secs|secondes?)\b/gi;
const _TEMPO_SECONDES  = /(\d+(?:[.,]\d+)?)\s*(?:s|sec|secs|secondes?)\b/gi;
function _tempoSec(txt){
  const t = String(txt == null ? '' : txt);
  if(!t || !_TEMPO_MOUVEMENT.test(t)) return null;
  const propre = t.replace(_TEMPO_REPOS, ' ');
  let somme = 0, m;
  _TEMPO_SECONDES.lastIndex = 0;
  while((m = _TEMPO_SECONDES.exec(propre)) !== null) somme += parseFloat(m[1].replace(',', '.')) || 0;
  if(!(somme >= TEMPO_MIN && somme <= TEMPO_MAX)) return null;
  return Math.round(somme * 10) / 10;
}

/* ⚠️ `ex` est OPTIONNEL, exprès : appelée sans lui, la fonction rend ce qu'elle rendait avant.
   C'est ce qui rend le changement sûr — même discipline que `calcRecoveryDetail(refTs)`. */
function _secSerie(set, ex){
  const r = +(set && set.reps) || 0;
  if(!(r > 0)) return SEC_SERIE_DEFAUT;
  const tempo = (ex && ex.note) ? _tempoSec(ex.note) : null;
  return Math.min(SEC_INSTALLATION + r*(tempo || SEC_PAR_REP), SEC_SERIE_MAX);
}
/* 🏋️ LA CHARGE RELATIVE MODULE L'INTENSITÉ (16/08/2026, ft-v879)
   Michel : *« fais le MET qui tient compte du % de la charge max »* — et il ajoute, sur ce que
   je lui avais dit du tonnage : *« je suis moyennement d'accord »*. **Il a raison, et c'est
   mesuré sur ses 27 séances appariées à la montre :**
     tonnage brut ↔ calories .................... r = +0,076   (rien — la durée écrase tout)
     **tonnage par minute ↔ calories par minute ... r = +0,537**  (un vrai signal)
   *Le tonnage ne prédit pas le TOTAL d'une séance, mais sa DENSITÉ prédit son intensité.* Ma
   formulation d'avant (« le tonnage ne compte pas ») était trop catégorique : elle était vraie
   pour le total et fausse pour l'intensité.

   ⚠️ POURQUOI LE % DU MAX ET PAS LE TONNAGE : un tonnage est un chiffre absolu — 3 000 kg ne
   veulent pas dire la même chose chez Michel et chez sa fille. Le **pourcentage de SON maximum**
   est la même échelle pour tout le monde, et c'est celle que la physiologie utilise (recrutement
   des unités motrices, part anaérobie). L'app le connaît déjà : `S.prs[exercice].rm1`.

   ⚠️ L'AMPLEUR EST BORNÉE, ET SA BORNE EST PUBLIÉE : le Compendium 2024 distingue la musculation
   « light or moderate effort » (02052 → 3,5) de « vigorous effort » (02053 → 6,0), soit un
   facteur **1,71**. Notre modulation va de **0,85 à 1,30**, soit 1,53 — volontairement À
   L'INTÉRIEUR de cet écart, jamais au-delà. Le point neutre est à **72 %** du max, l'intensité
   d'une série de travail courante : c'est là que les METs publiés ont été mesurés.
   ⚠️ PAS DE MAXIMUM CONNU = PAS DE MODULATION. On rend 1, on ne devine pas (R29). Un exercice
   jamais chargé, un premier passage, une machine sans repère : le calcul reste celui d'avant.
   ⚠️ ET ÇA MARCHE DANS LES DEUX SENS : les paliers d'échauffement, légers, descendent à 0,85 —
   ils coûtaient jusqu'ici autant qu'une série de travail. */
const CHARGE_NEUTRE = 0.72;   // % du max où les METs publiés ont été mesurés
const CHARGE_PENTE  = 1.07;   // pente, calée pour atteindre 1,30 à 100 % du max
const CHARGE_MIN    = 0.85, CHARGE_MAX = 1.30;
function _facteurCharge(kg, rm1){
  const k=+kg||0, m=+rm1||0;
  if(!(k>0) || !(m>0)) return 1;                       // pas de repère → aucune modulation
  const pct = k/m;
  if(!(pct>0) || pct>2) return 1;                      // donnée aberrante → on ne module pas
  return Math.max(CHARGE_MIN, Math.min(CHARGE_MAX, 1 + CHARGE_PENTE*(pct-CHARGE_NEUTRE)));
}
function calcSessionCalories(session) {
  const bw = S.bw || 80;
  const restSec = S.defRest || 120;
  const exs = session.exs || session.exercises || [];
  
  let totalCals = 0;
  let totalSets = 0;
  let totalActiveMin = 0;
  let totalRestMin = 0;
  const breakdown = {};

  exs.forEach(ex => {
    const doneSets = (ex.sets || []).filter(s => s.done);
    if (!doneSets.length) return;

    const met = getExerciseMET(ex.name);
    const n = doneSets.length;
    totalSets += n;

    // ⏱️ voir `_secSerie` — l'exercice est passé pour que son TEMPO écrit soit lu (ft-v1028)
    const activeSec = doneSets.reduce((a,st)=>a+_secSerie(st, ex), 0);
    const activeHours = activeSec / 3600;
    const restHours = Math.max(0,n-1) * restSec / 3600;

    /* 🏋️ CHAQUE SÉRIE PAYE SON PROPRE TARIF — voir `_facteurCharge`. On ne peut pas appliquer un
       facteur moyen à l'exercice : dans un même exercice, un palier d'échauffement à 40 % et une
       série de travail à 90 % n'ont rien à voir. C'est justement ce que le forfait unique
       masquait. Le repère est le meilleur maximum connu SUR CET EXERCICE. */
    const _rm1 = (S.prs && S.prs[ex.name] && +S.prs[ex.name].rm1) || 0;
    const calsActive = doneSets.reduce((a,st)=>
      a + met * _facteurCharge(st.kg, _rm1) * bw * (_secSerie(st, ex)/3600), 0);
    const calsRest   = MET_REST * bw * restHours;
    const exCals = calsActive + calsRest;

    totalCals += exCals;
    totalActiveMin += activeSec / 60;
    totalRestMin += Math.max(0,n-1) * restSec / 60;
    /* 🔁 ON ADDITIONNE, ON N'ÉCRASE PAS (17/08/2026) — le détail est rangé par NOM d'exercice, et
       un même exercice peut apparaître DEUX FOIS dans une séance (un 2ᵉ bloc plus tard, un ajout
       après coup). Avec une affectation simple, la 2ᵉ occurrence effaçait la 1ʳᵉ : `totalCals`
       restait juste, mais le détail perdait des calories réellement dépensées.
       ⚠️ MESURÉ sur l'historique de Michel, c'est exactement l'écart que deux audits extérieurs
       n'arrivaient pas à expliquer : le 28/06 « Soulevé de Terre » ×2 (7 puis 3 séries) n'affichait
       que 23 kcal — les 3 dernières — d'où +59 kcal manquants ; le 07/07 « Leg Curl Unilatéral
       Debout » ×2 (4 et 4) en affichait 32, d'où +31. Ce sont les 2 seules séances sur 32 dont
       le résidu ne s'expliquait pas par le forfait d'échauffement.
       ⚠️ Ce correctif ne change AUCUN total : `totalCals` accumulait déjà correctement. Il ne
       répare que le détail — donc l'invariant `total = Σdétail + cardio + échauffement`. */
    breakdown[ex.name] = (breakdown[ex.name] || 0) + Math.round(exCals);
  });

  /* ⏱️ LA VRAIE DURÉE, ET CE QU'ON EN FAIT (16/08/2026, revu ft-v876) — voir `_dureeSeanceMin`.
     Le modèle explique deux morceaux de la séance : le temps des SÉRIES et le repos ENTRE les
     séries d'un même exercice. Le RESTE — décharger la barre, ranger les disques, traverser la
     salle, attendre une machine — n'est ni l'un ni l'autre, et il est loin d'être négligeable
     (Michel : *« 5 à 7 minutes après un soulevé de terre à 140 kg »*).
     ⚠️ DEUX CAS, ET ILS NE SE TRAITENT PAS PAREIL :
       · le modèle tient DANS la durée réelle → le reste est du **temps de transition**, crédité
         à `MET_TRANSITION` (voir sa définition). C'est le cas normal.
       · le modèle DÉPASSE la durée réelle → le réglage de repos était plus généreux que la
         réalité ; on ramène tout à l'échelle, comme avant. On ne peut pas inventer du temps.
     ⚠️ ET LE DÉTAIL PAR EXERCICE REÇOIT SA PART DE TRANSITION, au prorata : ces minutes-là sont
     bien CAUSÉES par les exercices (c'est leur matériel qu'on range). Sans ça, la somme du détail
     ne ferait plus le total affiché — deux chiffres à l'écran qui se contredisent (R2). */
  const _dFormule = totalActiveMin + totalRestMin;
  const _d = _dureeSeanceMin(session, totalSets, _dFormule);
  let _dureeSrc = _d.src, _dureeMin = _d.min, _transitionMin = 0;
  if(_dFormule > 0 && _dureeMin > 0){
    if(_dureeMin < _dFormule){
      const f = _dureeMin / _dFormule;
      totalCals *= f;
      Object.keys(breakdown).forEach(k => { breakdown[k] = Math.round(breakdown[k]*f); });
      totalActiveMin *= f; totalRestMin *= f;
    }else{
      _transitionMin = _dureeMin - _dFormule;
      const calsTransit = MET_TRANSITION * bw * (_transitionMin/60);
      const base = totalCals || 1;
      Object.keys(breakdown).forEach(k => {
        breakdown[k] = Math.round(breakdown[k] + calsTransit*(breakdown[k]/base));
      });
      totalCals += calsTransit;
    }
  }

  // ── Échauffement / retour au calme ESTIMÉ (forfait 10 min à 3.5 MET) ──────────────
  // ⚠️⚠️ CE FORFAIT NE S'APPLIQUE QU'AUX MOMENTS QUI N'ONT PAS ÉTÉ MESURÉS (11/08/2026).
  // Le bug : le forfait était ajouté SANS CONDITION, puis `finishWorkout` (log.js) ajoutait
  // par-dessus le cardio réellement noté → **les mêmes minutes étaient payées deux fois**.
  // Mesuré à 84 kg sur une séance de 7 séries avec 10 min de tapis en échauffement :
  // 58 (séries) + 49 (forfait) + 77 (tapis réel) = 184 kcal, dont **126 pour 10 minutes**.
  // Le forfait couvre DEUX moments (avant + après) → on le compte 5 min par moment, et on
  // retire la moitié correspondante dès qu'un cardio réel est enregistré pour ce moment-là.
  // Une mesure chasse toujours une estimation, jamais l'inverse (R1 : une seule source).
  // ⚠️ Une séance sans aucun cardio noté est INCHANGÉE (10 min, comme avant) : on corrige le
  // double comptage, on ne touche pas au modèle de la musculation — ce chantier-là est ouvert
  // et documenté dans `docs/CALORIES-SOURCES.md` §12, il attend les 10 séances de relevé.
  const _duree = m => { const c = session[m]; return (c && +c.duration > 0) ? +c.duration : 0; };
  let warmupMin = 0;
  if (!_duree('cardioAvant')) warmupMin += 5;   // échauffement non mesuré → estimé
  if (!_duree('cardio'))      warmupMin += 5;   // retour au calme non mesuré → estimé
  const warmupCals = 3.5 * bw * (warmupMin/60);
  totalCals += warmupCals;

  // ⚠️ Les minutes de cardio RÉELLES entrent dans la durée (leurs calories, elles, sont ajoutées
  // par `finishWorkout`/`_saveSessEdits` via `calcCardioKcal` — ne PAS les compter ici aussi,
  // c'est exactement le double comptage qu'on vient de supprimer). Sans cette ligne, noter un
  // cardio RACCOURCIRAIT la séance de 5 min, ce qui n'a aucun sens.
  const cardioMin = _duree('cardioAvant') + _duree('cardio');

  return {
    total: Math.round(totalCals),
    totalSets,
    activeMin: Math.round(totalActiveMin),
    restMin: Math.round(totalRestMin),
    totalMin: Math.round(totalActiveMin + totalRestMin + warmupMin + cardioMin),
    warmupMin,
    dureeMin: Math.round(_dureeMin),      // la durée RETENUE pour le calcul
    dureeSrc: _dureeSrc,                  // 'saisie' | 'horodatage' | 'chrono' | 'estimee' | 'formule'
    engineVersion: CAL_ENGINE,            // 🏷️ avec quel modèle ce chiffre a été produit — voir CAL_ENGINE
    transitionMin: Math.round(_transitionMin),  // 🔄 décharger, ranger, traverser la salle
    breakdown
  };
}

function renderCalorieBreakdown(calData) {
  const entries = Object.entries(calData.breakdown);
  if (!entries.length) return '';
  return entries.map(([ex, kcal]) =>
    `<div class="cal-item"><span>${ex}</span><strong>${kcal} kcal</strong></div>`
  ).join('');
}


// ⏸️ MODE JOUR EN PAUSE — décision Michel, 27/07/2026 (ft-v638).
// RIEN n'est supprimé : tout le CSS `.light-mode` reste dans style.css, les fonctions
// ci-dessous restent entières, et le sélecteur Nuit/Jour est seulement MASQUÉ dans
// index.html (#appr-theme). Pour le remettre : passer ce drapeau à false + retirer le
// `display:none` du bloc #appr-theme. Rien d'autre à refaire.
// ⚠️ On n'efface JAMAIS la clé `ft4_theme` : quelqu'un qui était en mode jour retrouvera
// son réglage tel quel le jour où on rouvrira — on force juste l'affichage en nuit.
const LIGHT_MODE_PAUSED = true;

function toggleTheme(btn) {
  if (LIGHT_MODE_PAUSED) return;
  const root = document.getElementById('root');
  const isLight = root.classList.toggle('light-mode');
  document.documentElement.classList.toggle('light-mode', isLight);
  localStorage.setItem('ft4_theme', isLight ? 'light' : 'dark');
  if (btn) btn.innerHTML = isLight ? '🌙 Mode Nuit' : '☀️ Mode Jour';
}

function applyTheme() {
  const saved = localStorage.getItem('ft4_theme');
  const btn = document.getElementById('theme-toggle-btn');
  if (LIGHT_MODE_PAUSED) {
    // Quelqu'un qui était en mode jour repasse en nuit au prochain lancement,
    // sans que son choix soit perdu (la clé reste en place).
    const r = document.getElementById('root');
    if (r) r.classList.remove('light-mode');
    document.documentElement.classList.remove('light-mode');
    return;
  }
  if (saved === 'light') {
    document.getElementById('root').classList.add('light-mode');
    document.documentElement.classList.add('light-mode');
    if (btn) btn.innerHTML = '🌙 Mode Nuit';
  }
}

// -- Apparence : halo (couleur au choix) ou fond uni + theme Jour/Nuit --
function setHalo(mode){        // 'none' = fond uni ; sinon = halo active (garde la couleur courante)
  S.halo = (mode==='none') ? 'none' : 'on';
  try{ localStorage.setItem('ft4_halo', S.halo); }catch(e){}
  persist();
  _applyHalo();
  toast(S.halo==='none' ? 'Apparence : Fond uni' : 'Apparence : Halo active ✨', 'info');
}
function setHaloColor(rgb){    // couleur de la palette -> active le halo avec cette couleur
  S.halo='on'; S.haloColor=rgb;
  try{ localStorage.setItem('ft4_halo','on'); localStorage.setItem('ft4_haloColor',rgb); }catch(e){}
  persist();
  _applyHalo();
}
function setHaloDir(dir){      // 'top' (normal) | 'bottom' (inverse)
  S.haloDir = (dir==='bottom') ? 'bottom' : 'top';
  try{ localStorage.setItem('ft4_haloDir', S.haloDir); }catch(e){}
  persist();
  _applyHalo();
}
function _applyHalo(){
  const root=document.getElementById('root');
  document.documentElement.classList.toggle('no-halo', S.halo==='none');
  if(root){
    root.style.setProperty('--halo-rgb', S.haloColor||'59,130,246');
    if(S.haloDir==='bottom'){
      root.style.setProperty('--halo-y','100%');
      root.style.setProperty('--halo-h','118%');
      root.style.setProperty('--halo-stop','82%');
    }else{
      root.style.setProperty('--halo-y','0%');
      root.style.setProperty('--halo-h','92%');
      root.style.setProperty('--halo-stop','66%');
    }
  }
  const n=document.getElementById('appr-none');
  if(n) n.classList.toggle('active', S.halo==='none');
  const dn=document.getElementById('appr-dir-normal'), di=document.getElementById('appr-dir-invert');
  if(dn) dn.classList.toggle('active', S.haloDir!=='bottom');
  if(di) di.classList.toggle('active', S.haloDir==='bottom');
  document.querySelectorAll('.appr-color').forEach(function(el){
    el.classList.toggle('active', S.halo!=='none' && el.getAttribute('data-rgb')===S.haloColor);
  });
}
function setTheme(mode){
  if (LIGHT_MODE_PAUSED && mode==='light') return;   // mode jour en pause (voir applyTheme)
  const isLight = mode==='light';
  const root=document.getElementById('root');
  root.classList.toggle('light-mode', isLight);
  document.documentElement.classList.toggle('light-mode', isLight);
  try{ localStorage.setItem('ft4_theme', isLight?'light':'dark'); }catch(e){}
  _applyThemeBtns();
  const tb=document.getElementById('theme-toggle-btn'); if(tb) tb.innerHTML = isLight?'🌙 Mode Nuit':'☀️ Mode Jour';
}
// ── Apparence de la carte récup : 'anneau' (défaut) | 'moniteur' (ft-v645) ──
// Deux mises en forme des MÊMES données. Le défaut ne change pour personne :
// il faut venir le choisir dans Menu → Apparence.
function setRingStyle(mode){
  S.ringStyle = (mode==='moniteur') ? 'moniteur' : 'anneau';
  try{ localStorage.setItem('ft4_ringstyle', S.ringStyle); }catch(e){}
  persist();
  _applyRingBtns();
  try{ if(typeof _renderHomeHero==='function') _renderHomeHero(); }catch(e){}
  toast(S.ringStyle==='moniteur' ? 'Récup : style Moniteur 💚' : 'Récup : style Anneau ⭕', 'info');
}
function setEcgStill(v){
  S.ecgStill = !!v;
  try{ localStorage.setItem('ft4_ecgstill', S.ecgStill?'1':'0'); }catch(e){}
  persist();
  _applyRingBtns();
  try{ if(typeof _renderHomeHero==='function') _renderHomeHero(); }catch(e){}
  toast(S.ecgStill ? 'Tracé figé 🩺' : 'Tracé animé 💚', 'info');
}
function _applyRingBtns(){
  const a=document.getElementById('appr-ring-anneau'), m=document.getElementById('appr-ring-moniteur');
  if(a) a.classList.toggle('active', S.ringStyle!=='moniteur');
  if(m) m.classList.toggle('active', S.ringStyle==='moniteur');
  const e=document.getElementById('appr-ecg');
  if(e){ e.classList.toggle('active', !!S.ecgStill);
         e.style.display = (S.ringStyle==='moniteur') ? '' : 'none'; }   // sans objet en style anneau
}
function _applyThemeBtns(){
  const isLight=document.getElementById('root') && document.getElementById('root').classList.contains('light-mode');
  const j=document.getElementById('appr-jour'), n=document.getElementById('appr-nuit');
  if(j) j.classList.toggle('active', !!isLight);
  if(n) n.classList.toggle('active', !isLight);
}



function switchNuTab(tab, btn) {
  ['macros','journal','suppl'].forEach(t => {
    const el = document.getElementById('nu-' + t);
    if (el) el.style.display = t === tab ? 'flex' : 'none';
  });
  document.querySelectorAll('.nu-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'suppl') renderSupplements();
  if (tab === 'journal') renderFoodJournal();
  /* ⚠️ L'ONGLET MACROS SE RE-RENDU AUSSI (18/08/2026) — sinon la carte « Où tu en es » reste
     figée sur l'état qu'elle avait en arrivant. Constaté en jouant le vrai parcours : on appuie
     sur « Noter mon premier repas », on note son shaker, on revient sur Macros… et la carte dit
     toujours « note ton premier repas ». *La donnée avait changé, l'écran ne le savait pas.*
     Les deux autres onglets se re-rendaient déjà ; celui-là avait été oublié parce qu'il ne
     contenait, jusqu'à ft-v909, que des chiffres qui ne bougent pas dans la journée. */
  if (tab === 'macros' && typeof renderNutrition === 'function') { try{ renderNutrition(); }catch(e){} }
}

// ─── JOURNAL ALIMENTAIRE ──────────────────────────────────────
/* 🍎 DEUX COLLATIONS, ET L'ORDRE EST CELUI DE LA JOURNÉE (23/08/2026) — Michel : *« pouvoir
   rajouter une collation aussi, il y en a qui prennent une collation le matin et le soir »*.
   ⭐ L'ORDRE A CHANGÉ EXPRÈS : la liste était `petit-déj · déjeuner · collation · dîner`, elle
   suit maintenant la journée réelle. C'est cet ordre qui range les sections du Journal — une
   collation affichée après le dîner se lirait comme une erreur de tri.
   ⛔ `collation` GARDE SA CLÉ : renommer aurait orphelin toutes les entrées déjà notées, qui
   seraient tombées dans le repas par défaut sans que rien ne le signale.
   ⚠️ ET LES LIBELLÉS RESTENT NEUTRES (« Collation 2 », pas « Collation du soir ») : on ne sait
   pas à quelle heure la personne la prend, et l'étiqueter à sa place serait un faux-précis (R29).
   Michel dit « matin et soir », d'autres prendront un goûter à 16 h — les deux doivent tenir. */
const FOOD_MEALS = [
  {k:'petitdej',  ic:'🌅', lbl:'Petit-déj'},
  {k:'collation', ic:'🍎', lbl:'Collation'},
  {k:'dejeuner',  ic:'🍽️', lbl:'Déjeuner'},
  {k:'collation2',ic:'🥜', lbl:'Collation 2'},
  {k:'diner',     ic:'🌙', lbl:'Dîner'}
];
let _afMeal='dejeuner';
const FOOD_AI_FREE_LIMIT=25; // ~ une semaine de notes IA en gratuit (illimité en Premium)
/* ⚠️ LE REPLI EST NOMMÉ, PAS POSITIONNEL (23/08/2026). Il valait `FOOD_MEALS[1]`, qui DÉSIGNAIT
   le déjeuner — jusqu'à ce que l'ordre passe en ordre de journée : l'index 1 est devenu la
   collation, et une entrée au repas inconnu serait silencieusement devenue une collation.
   *Un index qui dépend de l'ordre d'un tableau devient faux le jour où on trie ce tableau* (R14). */
function _foodMealInfo(k){return FOOD_MEALS.find(m=>m.k===k)||FOOD_MEALS.find(m=>m.k==='dejeuner');}
function _foodAiLeft(){return Math.max(0,FOOD_AI_FREE_LIMIT-(S.foodAiUses||0));}
function showFoodWall(){const el=document.getElementById('ov-food-wall');if(el)el.classList.add('open');}
function closeFoodWall(){const el=document.getElementById('ov-food-wall');if(el)el.classList.remove('open');}

// ─── SCAN CODE-BARRES (ZXing local + Open Food Facts) ─────────
let _bcNutr=null; // {name, kcal100, prot100, carbs100, fat100}

/* ═══ BRIQUE 0 — LA PROVENANCE DE CHAQUE LIGNE DU JOURNAL (18/08/2026) ══════════════════════
   Jusqu'ici une entrée du journal alimentaire s'écrivait :
       { date, meal, name, kcal, prot, carbs, fat, ts }
   — soit un RÉSULTAT sans aucune trace de son origine. Ni la quantité mangée, ni la source du
   chiffre, ni la façon dont il a été saisi, ni l'état de l'aliment (cru/cuit).

   ⚠️⚠️ POURQUOI C'EST LA PREMIÈRE BRIQUE ET PAS UNE AUTRE : c'est la seule qui ne se rattrape
   JAMAIS. Tout le reste (base d'aliments, générateur, niveaux de précision) peut se construire
   dans six mois sur les données existantes. Une entrée écrite sans ces champs, elle, ne les
   retrouvera pas — chaque jour qui passe en fabrique d'autres.

   ⚠️ ET LE CHAMP LE PLUS COÛTEUX N'EST PAS LA SOURCE, C'EST LA QUANTITÉ. Aujourd'hui une ligne
   dit « 380 kcal » sans dire « 250 g de X » : même en connaissant plus tard la bonne valeur au
   100 g, on ne peut RIEN recalculer. Le scan et l'étiquette CONNAISSENT le poids (champ
   `af-bc-grams`) — ils ne l'enregistraient simplement pas.

   ⚠️ DEUX AXES, PAS UN (corrigé par le contre-audit du 18/08) : `saisie` dit COMMENT c'est
   entré, `origine` dit D'OÙ VIENT LE CHIFFRE. Les confondre perd l'information dans les deux
   sens — « manuel » finirait par désigner deux choses différentes selon le contexte.
       code-barres scanné (caméra)  → saisie:'scan'           origine:'off'
       code-barres photographié     → saisie:'photo-code'     origine:'off'
       code-barres lu par l'IA      → saisie:'photo-code-ia'  origine:'off'
       code-barres TAPÉ à la main   → saisie:'code-tape'      origine:'off'
       aliment tapé à la main → saisie:'manuel'  origine:'utilisateur'
       photo d'étiquette    → saisie:'photo-ia'  origine:'etiquette'
       phrase estimée par l'IA → saisie:'ia-texte' origine:'ia'

   ⚠️⚠️ LES QUATRE CHEMINS DE CODE-BARRES ONT ÉTÉ SÉPARÉS LE 23/08/2026 — ils s'enregistraient
   tous en `'scan'`. Michel : *« ce n'était pas un scan, j'ai rentré le code-barre manuellement »*.
   **Il avait raison, et ce commentaire-ci se contredisait lui-même** (« `saisie` dit COMMENT
   c'est entré »). Mesuré : ses « 6 scans » comptaient en réalité des saisies clavier.
   ⭐ Ce n'est pas cosmétique — les quatre n'ont pas la même fiabilité : `scan` et `photo-code`
   sont décodés par ZXing, qui VÉRIFIE la clé de contrôle ; `photo-code-ia` et `code-tape` sont
   des chiffres non vérifiés, d'où `_eanValide()` et le drapeau `codeDouteux`.
   ⚠️ RÉTROCOMPATIBLE : les entrées existantes gardent `'scan'`. On ne réécrit pas le passé —
   on saura seulement que, avant cette date, `'scan'` couvrait les quatre.

   ⚠️ ON N'INVENTE RIEN : ce qu'on ne sait pas reste `null`. Un `etat` (cru/cuit) ne pourra être
   rempli qu'à partir de la base d'aliments (brique 1) — le champ existe dès maintenant pour que
   les entrées de demain puissent le porter, pas pour être deviné aujourd'hui (R29).
   ⚠️ RÉTROCOMPATIBLE : une entrée sans `v` est une entrée d'avant. On ne la réécrit pas et on
   ne lui suppose aucune provenance — on saura simplement qu'on ne sait pas. */
const FOOD_LOG_V=1;
let _afSrc=null;   // provenance de ce qui remplit ACTUELLEMENT le formulaire (null = saisie main)
function _afSetSrc(o){ _afSrc=o||null; }
/* ⚖️ LE PIÈGE DU ×2,7 — UN PAQUET DE PÂTES SCANNÉ PUIS PESÉ CUIT (19/08/2026).
   Open Food Facts donne les valeurs « TELLES QUE VENDUES » : le paquet de pâtes annonce 350
   kcal/100 g, ce sont des pâtes SÈCHES. Quelqu'un qui scanne son paquet puis pèse 200 g de pâtes
   CUITES enregistre 700 kcal au lieu de 260 — un facteur 2,7, tous les jours, dans le même sens.
   ⭐ C'est la même famille que le mélange cru/cuit du plan de repas : un biais SYSTÉMATIQUE, donc
   il survit au moyennage hebdomadaire. C'est la seule classe d'erreur que « cohérence avant
   réactivité » ne peut pas absorber.
   ⛔ ON NE CONVERTIT RIEN, ON PRÉVIENT. Le ratio d'absorption d'eau dépend de la cuisson de
   chacun : le calculer serait inventer un chiffre (R29). Et on ne bloque pas la saisie (R24) —
   une note suffit, la personne sait ce qu'elle a dans son assiette, pas nous.
   ⚠️ LA LISTE EST VOLONTAIREMENT COURTE : uniquement les aliments qui GONFLENT franchement à la
   cuisson et qu'on achète secs. Un aliment dont le poids ne bouge pas (yaourt, fromage, huile)
   n'a rien à faire ici — une note qui s'affiche pour tout n'est plus lue (R24). */
const _SECS_QUI_GONFLENT=/p[âa]tes|spaghetti|macaroni|penne|tagliatelle|coquillettes|riz\b|basmati|quinoa|semoule|couscous|boulgour|lentille|pois cass|pois chiche|haricot sec|flageolet|avoine|floconn/i;
function _afNoteEtat(nom){
  const el=document.getElementById('af-etat-note'); if(!el) return;
  if(nom && _SECS_QUI_GONFLENT.test(String(nom))){
    el.textContent='⚖️ Les valeurs du paquet sont pour le produit SEC. Si tu pèses après cuisson, '
      +'note le poids SEC (une portion cuite pèse 2 à 3 fois plus, et le compte serait faux d\'autant).';
    el.style.display='block';
  } else { el.style.display='none'; }
}
/* Construit le bloc de provenance au moment de l'enregistrement.
   ⚠️ `modifie` compare les macros FINALES à celles que la source avait produites : si la personne
   a retouché les chiffres, la source n'explique plus le résultat, et le dire est plus honnête que
   de laisser croire qu'il vient d'Open Food Facts. Comparaison déterministe, aucun écouteur. */
function _provFood(vals){
  const p={v:FOOD_LOG_V, saisie:'manuel', origine:'utilisateur',
           q:null, u:null, etat:null, sourceId:null, per100:null, modifie:false};
  if(_afSrc){
    p.saisie=_afSrc.saisie||'manuel';
    p.origine=_afSrc.origine||'utilisateur';
    if(_afSrc.sourceId)p.sourceId=String(_afSrc.sourceId).slice(0,32);
    if(_afSrc.per100)p.per100=_afSrc.per100;
    /* ⚖️ L'ÉTAT DESCEND ENFIN JUSQU'À LA DONNÉE (19/08/2026). Le champ existait depuis la
       brique 0 (ft-v907) et valait TOUJOURS `null` : on savait que les valeurs d'Open Food Facts
       sont « telles que vendues », c'était écrit en commentaire — et ça n'atteignait pas
       l'entrée enregistrée. R4, dans le fichier qui documente R4. */
    if(_afSrc.etat)p.etat=_afSrc.etat;
    /* ⚠️⚠️ ET LE MÊME OUBLI A FAILLI SE REFAIRE ICI, LE 23/08/2026 — dans la fonction qui
       porte déjà le commentaire ci-dessus. `_provFood` construit une LISTE BLANCHE : un champ
       posé par `_afSetSrc` et non recopié ici **n'atteint jamais l'entrée enregistrée**, sans
       erreur, sans test rouge. Le drapeau « code-barres douteux » était dans la provenance en
       mémoire et s'arrêtait à cette ligne. *C'est R4 dans le fichier qui documente R4, deux
       fois au même endroit.*
       ⛔ Posé SEULEMENT s'il est vrai : un `false` recopié partout annoncerait une
       vérification qui n'a pas eu lieu sur les chemins décodés par ZXing. */
    if(_afSrc.codeDouteux===true)p.codeDouteux=true;
    const a=_afSrc.attendu;
    if(a&&vals) p.modifie=['kcal','prot','carbs','fat'].some(k=>(+a[k]||0)!==(+vals[k]||0));
  }
  // La quantité n'existe que si le champ grammes est réellement affiché (scan / étiquette).
  const row=document.getElementById('af-bc-row');
  const g=numFR((document.getElementById('af-bc-grams')||{}).value)||0;
  if(row&&row.style.display!=='none'&&g>0){ p.q=g; p.u='g'; }
  /* ⚖️ LE POIDS DÉCLARÉ À LA MAIN DESCEND JUSQU'À LA DONNÉE (ft-v1051) — R4, et c'est LA
     moitié qui manquait : sans ces lignes, la personne voit son poids à l'écran, les 4 valeurs
     se recalculent… et rien n'est enregistré. *L'app aurait su, et n'aurait rien retenu.*
     ⛔ CE QU'ON GARDE EST LE POUR-100 g, PAS LA BOÎTE. Michel : *« tu prends la ratatouille, il
     y a différentes boîtes de différent poids »*. Le pour-100 g est stable et calibre l'aliment
     pour toujours ; `q` n'est qu'un pré-remplissage de confort, qu'on retape à chaque fois.
     ⭐ C'est ce qui rebranche la machinerie de ft-v1042 : à la reprise depuis « Mes aliments »,
     l'aliment aura son `per100` et le champ en grammes s'ouvrira tout seul.
     ⛔ On n'écrase JAMAIS un `per100` déjà connu (scan, CIQUAL) : une déclaration à la main ne
     passe pas devant une valeur mesurée (R32 — mesuré > estimé > déclaré). */
  if(!p.per100 && typeof _afRef==='object' && _afRef && _afRef.u==='g' && _afRef.q>0 && vals){
    /* ⚠️ ON DIVISE PAR LA QUANTITÉ AFFICHÉE, PAS PAR `_afRef.q` — et la nuance coûte cher.
       `_afRef.q` est la quantité de RÉFÉRENCE (celle déclarée au départ) ; `_afRef.base` sont
       les valeurs qui vont avec. Mais si la personne a ensuite tapé 80 après avoir déclaré 40,
       les champs affichent le DOUBLE. Diviser ces valeurs-là par 40 donnerait un pour-100 g
       deux fois trop gros. *Les valeurs affichées et la quantité affichée vont toujours
       ensemble : c'est le seul couple sur lequel on peut diviser sans se tromper.* */
    const q=numFR((document.getElementById('af-prop')||{}).value)||_afRef.q;
    if(q>0){
      const f=100/q;
      p.q=q; p.u='g';
      p.per100={kcal:Math.round((+vals.kcal||0)*f), prot:Math.round((+vals.prot||0)*f),
                carbs:Math.round((+vals.carbs||0)*f), fat:Math.round((+vals.fat||0)*f)};
    }
  }
  return p;
}
function _loadZXing(){
  return new Promise((res,rej)=>{
    if(window.ZXing&&window.ZXing.BrowserMultiFormatReader){res();return;}
    const s=document.createElement('script');
    s.src='./lib/zxing.min.js';
    s.onload=()=>{(window.ZXing&&window.ZXing.BrowserMultiFormatReader)?res():rej(new Error('ZXing indisponible'));};
    s.onerror=()=>rej(new Error('Lecteur code-barres non chargé'));
    document.head.appendChild(s);
  });
}
// Le bouton « Scanner un code-barres » ouvre le scanner EN DIRECT (façon Yuka).
function scanBarcode(){ openBarcodeScanner(); }
// Repli : ancienne méthode photo unique (input file caméra).
function scanBarcodePhoto(){ const inp=document.getElementById('af-bc-input'); if(inp){inp.value='';inp.click();} }
function _bcPhotoFallback(){ closeBarcodeScanner(); scanBarcodePhoto(); }

// ─── SCANNER CODE-BARRES EN DIRECT (caméra live + ZXing continu) ─────────────
let _bcReader=null, _bcScanning=false;
function _bcHints(){
  try{
    const h=new Map();
    h.set(ZXing.DecodeHintType.TRY_HARDER,true);
    h.set(ZXing.DecodeHintType.POSSIBLE_FORMATS,[ZXing.BarcodeFormat.EAN_13,ZXing.BarcodeFormat.EAN_8,ZXing.BarcodeFormat.UPC_A,ZXing.BarcodeFormat.UPC_E]);
    return h;
  }catch(e){ return undefined; }
}
async function openBarcodeScanner(){
  let ov=document.getElementById('ov-bc-scan');
  if(!ov){ov=document.createElement('div');ov.id='ov-bc-scan';ov.className='overlay';ov.style.zIndex='600';document.body.appendChild(ov);}
  ov.innerHTML='<div class="modal" style="max-width:94vw;padding:14px;text-align:center;">'
    +'<div style="font-weight:800;font-size:15px;color:var(--t1);margin-bottom:4px;">📷 Scanne le code-barres</div>'
    +'<div style="font-size:12px;color:var(--t3);margin-bottom:10px;">Cadre le code-barres dans le rectangle rouge, bien net, puis appuie sur « Capturer » (ou attends, ça se lit tout seul).</div>'
    +'<div style="position:relative;width:100%;aspect-ratio:3/4;max-height:56vh;background:#000;border-radius:12px;overflow:hidden;">'
      +'<video id="bc-video" autoplay muted playsinline webkit-playsinline style="width:100%;height:100%;object-fit:cover;"></video>'
      +'<div style="position:absolute;left:6%;right:6%;top:40%;height:20%;border:3px solid rgba(255,45,85,.95);border-radius:8px;pointer-events:none;"></div>'
    +'</div>'
    +'<div id="bc-scan-status" style="font-size:12px;color:var(--t3);margin-top:8px;min-height:16px;">Démarrage de la caméra…</div>'
    +'<button id="bc-capture-btn" class="btn" style="width:100%;margin-top:10px;background:var(--red);color:#fff;font-weight:700;" onclick="_bcCaptureFrame()">📸 Capturer le code</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="_bcPhotoFallback()">🖼️ Prendre une photo à la place</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="closeBarcodeScanner()">Annuler</button>'
    +'</div>';
  ov.classList.add('open');
  try{
    await _loadZXing();
    _bcReader=new ZXing.BrowserMultiFormatReader(_bcHints());
    const video=document.getElementById('bc-video');
    _bcScanning=true;
    // Haute résolution → le code-barres a assez de pixels pour être décodé (sinon « caméra ouverte mais ne lit pas »)
    await _bcReader.decodeFromConstraints({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},advanced:[{focusMode:'continuous'}]}}, video, (result)=>{
      if(result&&_bcScanning){
        const code=result.getText&&result.getText();
        if(code){ _bcScanning=false; closeBarcodeScanner(); _lookupBarcode(code); }
      }
      // erreur "NotFound" entre les frames = normal, on ignore
    });
    try{ const v=document.getElementById('bc-video'); if(v&&v.play)v.play().catch(()=>{}); }catch(e){}
    const st=document.getElementById('bc-scan-status'); if(st)st.textContent='Vise le code-barres… ou appuie sur « Capturer ».';
  }catch(e){
    const st=document.getElementById('bc-scan-status');
    if(st)st.textContent='Caméra indisponible ici — utilise « Prendre une photo » ou saisis à la main.';
    // overlay laissé ouvert avec le bouton photo en repli
  }
}
// Capture manuelle : lit l'image en direct de la caméra (déjà cadrée + focalisée) → décodage ZXing.
async function _bcCaptureFrame(){
  const video=document.getElementById('bc-video');
  const st=document.getElementById('bc-scan-status');
  if(!video||!video.videoWidth){ if(st)st.textContent='Caméra pas encore prête, réessaie dans 1 s…'; return; }
  if(st)st.textContent='Lecture…';
  try{
    const c=document.createElement('canvas');
    c.width=video.videoWidth; c.height=video.videoHeight;
    c.getContext('2d').drawImage(video,0,0,c.width,c.height);
    const url=c.toDataURL('image/jpeg',0.95);
    const reader=new ZXing.BrowserMultiFormatReader(_bcHints());
    let code='';
    try{ const res=await reader.decodeFromImageUrl(url); code=res&&res.getText&&res.getText(); }catch(e){ code=''; }
    try{ reader.reset(); }catch(e){}
    if(code){ _bcScanning=false; closeBarcodeScanner(); _lookupBarcode(code); }
    else if(st){ st.textContent='Pas lu — recule un peu (~15-20 cm), attends la mise au point, remplis le cadre rouge, puis recapture.'; }
  }catch(e){ if(st)st.textContent='Souci de capture — réessaie ou « Prendre une photo ».'; }
}
function closeBarcodeScanner(){
  _bcScanning=false;
  try{ if(_bcReader)_bcReader.reset(); }catch(e){}
  try{ if(_bcReader&&_bcReader.stopStreams)_bcReader.stopStreams(); }catch(e){}
  _bcReader=null;
  const ov=document.getElementById('ov-bc-scan'); if(ov)ov.classList.remove('open');
}
async function onBarcodeFile(input){
  const f=input.files&&input.files[0];if(!f)return;
  const url=URL.createObjectURL(f);
  toast('Lecture du code-barres…','info');
  try{
    await _loadZXing();
    const reader=new ZXing.BrowserMultiFormatReader();
    let code='';
    try{const result=await reader.decodeFromImageUrl(url);code=result&&result.getText&&result.getText();}
    catch(e){code='';}
    try{reader.reset&&reader.reset();}catch(e){}
    URL.revokeObjectURL(url);
    if(!code){toast('Code-barres illisible — rapproche-toi ou saisis à la main','error');return;}
    await _lookupBarcode(code, 'photo-code');   // décodé par ZXing : la clé de contrôle est vérifiée
  }catch(e){URL.revokeObjectURL(url);toast('Erreur scan : '+(e.message||e),'error');}
}
// Récupère un produit Open Food Facts — essaie l'API v2 (champs) PUIS v0 (repli).
// ⚠️ Tolérant sur le champ « status » : v2 ne renvoie pas toujours status===1 pour un produit trouvé
// (ancien bug : le produit existait mais était rejeté « introuvable »). On considère « trouvé » dès que
// l'objet product contient de vraies données (nom, marque ou nutriments).
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
/* 🔢 LA CLÉ DE CONTRÔLE D'UN CODE-BARRES — de l'arithmétique, aucun réseau (23/08/2026).
   Un EAN-8/12/13 porte un dernier chiffre CALCULÉ à partir des autres. Une faute de frappe sur
   un seul chiffre casse la clé ~9 fois sur 10.
   ⭐⭐ POURQUOI ÇA COMPTE ICI, ET SEULEMENT ICI : le seul mode d'échec de ce chemin est
   SILENCIEUX. Un chiffre faux ne donne pas « introuvable » — il donne **le produit de
   quelqu'un d'autre**, avec un vrai nom, de vraies calories, et rien qui cloche à l'écran.
   *Une erreur qui ressemble à un succès ne se voit jamais.*
   ⛔ ON NE BLOQUE PAS (R24) : les codes internes de magasin et certains courts ne respectent
   pas la norme. On prévient, on cherche quand même, et on garde la trace dans la provenance.
   ⚠️ Une longueur non normalisée rend `null` — « je ne sais pas » n'est pas « c'est faux ». */
function _eanValide(code){
  const c=String(code||'').replace(/\D/g,'');
  if(c.length!==8 && c.length!==12 && c.length!==13) return null;
  let s=0;
  for(let i=c.length-2;i>=0;i--) s += (+c[i]) * (((c.length-2-i)%2===0)?3:1);
  return ((10-(s%10))%10) === (+c[c.length-1]);
}
// Saisie manuelle du code-barres (repli quand le scan galère + test facile)
function _manualBarcode(){
  const inp=document.getElementById('af-bc-manual');
  const code=inp?(inp.value||'').replace(/\D/g,''):'';
  if(code.length<8){toast('Tape le code-barres complet (au moins 8 chiffres)','error');return;}
  /* ⚠️ LE MESSAGE REMPLACE LE « Recherche du produit… », il ne s'empile pas dessus — sinon il
     serait écrasé en une demi-seconde et personne ne le lirait. C'est la leçon de ft-v985 :
     un avertissement qu'on ne peut pas voir n'existe pas. */
  const douteux = (_eanValide(code)===false);
  if(douteux) toast('⚠️ Ce code semble mal tapé — je cherche quand même, vérifie bien le nom du produit','info');
  _lookupBarcode(code, 'code-tape', douteux);
}
/* ⚠️ `saisie` DIT COMMENT C'EST ENTRÉ — et jusqu'au 23/08/2026 les QUATRE chemins de code-barres
   s'enregistraient tous en `'scan'`. Michel : *« ce n'était pas un scan, j'ai rentré le code-barre
   manuellement »*. **Il a raison, et c'est le contrat que ce fichier s'était donné lui-même**
   (voir la table de provenance plus haut). Mesuré sur ses 23 entrées : « scan 6 » comptait en
   réalité des saisies clavier — donc la donnée censée servir à trancher les questions produit
   était fausse.
   ⭐ ET CE N'EST PAS DE LA PÉDANTERIE : les quatre chemins n'ont pas la même FIABILITÉ.
     · `scan` / `photo-code`  → décodés par ZXing, qui VÉRIFIE la clé de contrôle → sûrs
     · `photo-code-ia`        → des chiffres lus par un modèle → non vérifiés
     · `code-tape`            → des chiffres tapés par un humain → non vérifiés
   C'est l'échelle des sources de **R33**, appliquée à un seul champ. */
/* ═══ 🔢 UNE SEULE PRÉCISION POUR LE POUR-100 g (ft-v1112, R2) ═══════════════════════════════
   Michel, après le calibrage à la main : « ça va être comme ça sur tous les produits, c'est
   chiant ? ». La réponse est non — mais la vérification a trouvé bien pire que sa question.
   ⛔⛔ SIX ENDROITS construisent `_bcNutr`, et QUATRE arrondissaient à l'entier : le code-barres
   Open Food Facts, la recherche Open Food Facts, la base CIQUAL, et les calories de la photo
   d'étiquette. Seuls le calibrage à la main (ft-v1111) et les macros de la photo gardaient la
   décimale. *Six écritures de la même idée, quatre comportements différents — la seule question
   était quand on s'en apercevrait.*
   ⛔⛔ ET LE PLUS COÛTEUX EST LA BASE EMBARQUÉE, celle qui sert le plus : `data/ciqual.json`
   CONTIENT les décimales, et l'app les jetait à la lecture. Mesuré : **3 298 aliments sur
   3 484** portent au moins une décimale, et **1 159 ont une macro entre 0 et 1 g/100 g** —
   arrondie, elle devient 0 ou 1, soit **100 % d'erreur sur cette macro**.
   ⭐ ET ÇA NE CHANGE RIEN À L'ÉCRAN : `_qtyRescale` arrondit déjà les 4 champs à l'entier au
   moment de les écrire. La décimale ne sert qu'à ce qui est CONSERVÉ et re-multiplié.
   ⚠️ C'est R8 (la jumelle) pour la 5ᵉ fois cette semaine : le correctif de la veille avait été
   posé sur 1 endroit des 6, et pas sur le plus utilisé. */
function _per100d1(x){ const v=+x||0; return Math.round(v*10)/10; }
async function _lookupBarcode(ean, saisie, codeDouteux){
  if(!codeDouteux) toast('Recherche du produit…','info');
  let p=null;
  try{ p=await _offFetchProduct(ean); }
  catch(e){ toast('Réseau indisponible pour la recherche produit','error'); return; }
  if(!p){ toast('Produit introuvable dans la base (code '+ean+') — saisis à la main','error'); return; }
  const n=p.nutriments||{};
  const kcal100=_per100d1(n['energy-kcal_100g']||(n['energy_100g']?n['energy_100g']/4.184:0)||0);
  _bcNutr={
    name:((p.product_name_fr||p.product_name||p.generic_name_fr||p.generic_name||'Produit')+(p.brands?' ('+String(p.brands).split(',')[0].trim()+')':'')).slice(0,60),
    kcal100:kcal100,
    prot100:_per100d1(n['proteins_100g']),
    carbs100:_per100d1(n['carbohydrates_100g']),
    fat100:_per100d1(n['fat_100g'])
  };
  if(!_bcNutr.kcal100&&!_bcNutr.prot100&&!_bcNutr.carbs100&&!_bcNutr.fat100){toast('Produit trouvé mais sans infos nutritionnelles — saisis à la main','error');return;}
  _offRemplirFormulaire(p, ean, saisie||'scan', codeDouteux===true);
  toast('Produit trouvé ✅ — ajuste la quantité','success');
}
/* 🍽️ REMPLIR LE FORMULAIRE À PARTIR D'UN PRODUIT OPEN FOOD FACTS (22/08/2026).
   ⭐ SORTI DE `_lookupBarcode` parce que la RECHERCHE PAR NOM doit suivre EXACTEMENT le même
   chemin : mêmes grammes, même provenance, même avertissement cru/cuit, même score santé.
   Deux chemins séparés finiraient par diverger — et c'est l'avertissement du ×2,7 (le paquet
   de pâtes scanné puis pesé cuit) qui serait perdu d'un côté sans que personne ne le voie (R2). */
/* ⚠️ `origine` EST UN PARAMÈTRE DEPUIS ft-v1110, ET LE DÉFAUT NE CHANGE RIEN : les quatre
   appelants existants n'en passent pas et gardent donc `'off'`, au caractère près. Il existe
   pour le calibrage à la main, qui doit s'enregistrer comme « étiquette » et surtout PAS comme
   une fiche Open Food Facts — *une provenance fausse est pire que pas de provenance* (R33). */
function _offRemplirFormulaire(p, sourceId, saisie, codeDouteux, origine){
  // Quantité par défaut : portion si connue, sinon 100 g
  const serv=parseFloat(p.serving_quantity)||0;
  const g=serv>0?serv:100;
  const gramsEl=document.getElementById('af-bc-grams');if(gramsEl)gramsEl.value=g;
  _bcQsrc(serv, 'la fiche produit');   // ⛔ le nombre garde sa source écrite à côté (ft-v1105)
  /* ⛔ Un scan NEUF n'a pas de « dernière fois » : la pastille d'un aliment précédent doit
     disparaître, sinon elle proposerait le poids de quelqu'un d'autre que le produit affiché. */
  if(typeof _bcProposerDerniere==='function') _bcProposerDerniere(0);
  const nameEl=document.getElementById('af-bc-name');if(nameEl)nameEl.textContent=_bcNutr.name+' · '+_bcNutr.kcal100+' kcal/100g';
  const row=document.getElementById('af-bc-row');if(row)row.style.display='block';
  document.getElementById('af-desc').value=_bcNutr.name;
  _bcApplyGrams();
  // ⚠️ Les valeurs d'Open Food Facts sont « TELLES QUE VENDUES » : un paquet de pâtes scanné
  //    donne les valeurs SÈCHES. On enregistre donc `per100` et l'`origine` — c'est ce qui
  //    permettra, quand la base d'aliments existera, de rattraper l'état sans re-demander.
  /* ⚠️ `codeDouteux` N'EST POSÉ QUE S'IL EST VRAI — on n'écrit pas `false` partout. Un champ
     absent veut dire « rien à signaler » ; le poser à false sur des millions d'entrées
     donnerait l'illusion d'une vérification qui n'a pas eu lieu sur les chemins décodés. */
  _afSetSrc({saisie:saisie||'scan',origine:origine||'off',sourceId:sourceId?String(sourceId).slice(0,32):null,
    etat:'tel-que-vendu',
    ...(codeDouteux?{codeDouteux:true}:{}),
    per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
    attendu:_afLuFormulaire()});
  _afNoteEtat(_bcNutr.name);
  /* Score santé indicatif (Nutri-Score + NOVA + additifs) — module food-health.js.
     ⚠️ Seulement pour un VRAI produit Open Food Facts : un aliment brut CIQUAL n'a ni
     Nutri-Score ni groupe NOVA, et afficher une carte vide laisserait croire à une absence
     de score alors qu'il n'y en a simplement pas pour une banane. */
  const hc=document.getElementById('af-health-card');
  if(p && p.nutriments && Object.keys(p.nutriments).length){
    try{ if(window.FoodHealth)FoodHealth.renderCard(p,'#af-health-card'); }catch(e){}
  } else if(hc){ hc.innerHTML=''; }
}
/* ═══ ⚖️ CALIBRER UN PRODUIT À LA MAIN (ft-v1110) ═══════════════════════════════════════════
   Michel, 4ᵉ passe sur le même pot d'isolat : « il y a toujours le problème avec ma prot…
   comment on peut résoudre ce problème ».
   ⛔⛔ LA CAUSE, MESURÉE : sa ligne porte `per100 = null`, et AUCUN champ de l'app ne permettait
   d'en saisir un à la main — ce chiffre n'arrivait que d'un scan ou de CIQUAL. Un produit dont
   la fiche est incomplète était donc **incalibrable à vie**, et sa vieille ligne fausse revenait
   en tête des propositions : un tap, et l'erreur recommençait.
   👉 *Les trois versions précédentes ont ajouté des ALERTES ; aucune n'a rendu la personne
   capable de RÉPARER le produit.* Un garde-fou dit que c'est faux, il ne corrige pas.
   ⭐⭐ ZÉRO NOUVEAU CALCUL (R13/R2) : on rejoint le chemin de CIQUAL, qui appelle déjà
   `_offRemplirFormulaire` avec un produit vide. Le bloc quantité, le recalcul, l'enregistrement
   du `per100` — tout existe et ne bouge pas. */
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
  _offRemplirFormulaire({serving_quantity:0, nutriments:{}}, null, 'etiquette-main', false, 'etiquette');
  _calOuvrir();   // on referme : le bloc quantité prend le relais juste au-dessus
  toast('Produit calibré ⚖️ — tape ta quantité','success');
}
// Lit les 4 macros telles qu'elles sont dans le formulaire À CET INSTANT (pour détecter, à
// l'enregistrement, si la personne les a retouchées après un remplissage automatique).
function _afLuFormulaire(){
  const g=id=>parseInt((document.getElementById(id)||{}).value)||0;
  return {kcal:g('af-kcal'),prot:g('af-prot'),carbs:g('af-carbs'),fat:g('af-fat')};
}
/* ═══════════ UN SEUL PROPRIÉTAIRE DE « COMBIEN J'EN AI PRIS ? » (ft-v1067) ═══════════
   Michel : *« que ce soit le code-barres, manuel, avec l'IA ou avec l'étiquette, il faut qu'il y
   ait une COHÉRENCE quand on change la dose, peu importe le produit — même s'il faut qu'on crée
   un algorithme exprès »*.

   ⭐⭐ L'ALGORITHME EXISTAIT DÉJÀ — QUATRE FOIS, ET C'EST BIEN LE PROBLÈME.
   `valeurs = base × (saisie / référence)`. **Un pour-100 g n'est pas un autre calcul : c'est CE
   calcul avec une référence de 100.** Quatre écritures de la même formule, sur deux écrans, avec
   des comportements qui ont divergé sans que personne ne le décide.

   ⛔⛔ CE QUI ÉTAIT MESURÉ AVANT CE CORRECTIF — le MÊME geste (vider le champ), 3 résultats :
     · `_bcApplyGrams` (code-barres, étiquette)  → **les 4 valeurs tombent à ZÉRO**
     · `_efApplyGrams` (modifier, pour-100 g)     → **zéro aussi, et le contrôle de cohérence ne
                                                    se rafraîchissait même pas**
     · `_afApplyProp`  (IA, phrase, poids déclaré)→ retour à la référence (corrigé en ft-v1061)
     · `_efApplyProp`  (modifier, proportion)     → **valeurs ORPHELINES** — le défaut de ft-v1061,
                                                    toujours vivant ici : 4ᵉ fois de la journée
                                                    qu'un correctif était posé d'un seul côté (R8).
   *Zéro est un mensonge (personne n'a mangé zéro), et une valeur orpheline en est un autre.*

   👉 **UNE SEULE RÈGLE, QUATRE ROUTES** : le champ vidé ramène à la RÉFÉRENCE — c'est-à-dire au
   seul nombre encore écrit à l'écran. Même arrondi, même lecture de la virgule (`numFR`), même
   rafraîchissement du contrôle de cohérence. R2 : la quantité a **un** propriétaire. */
function _qtyRescale(pre, base, ref, saisie){
  if(!(ref>0)) return null;
  const v=numFR(saisie);
  /* ⛔ Champ vidé ou illisible → facteur 1, donc les valeurs de la RÉFÉRENCE. Jamais 0. */
  const f=(v>0? v : ref)/ref;
  const P=(k,x)=>{const el=document.getElementById(pre+'-'+k); if(el) el.value=Math.round(x);};
  P('kcal',(base.kcal||0)*f); P('prot',(base.prot||0)*f);
  P('carbs',(base.carbs||0)*f); P('fat',(base.fat||0)*f);
  /* ⭐ Le contrôle de cohérence suit TOUJOURS : les macros viennent de changer, donc l'écart
     kcal/macros a pu apparaître ou disparaître. Il ne suivait que sur 2 routes sur 4. */
  const coh=(pre==='af')?_afCoherence:_efCoherence;
  if(typeof coh==='function') coh();
  /* ⛔⛔ ON REND LA QUANTITÉ **TAPÉE**, PAS LE REPLI — et la nuance est tout l'arbitrage de
     ft-v966, qu'un témoin a rattrapé ici. Les 4 VALEURS peuvent revenir à la référence : elles
     doivent bien correspondre à quelque chose, et « 100 g » est écrit juste au-dessus. Mais la
     ligne verte, elle, dit « pour **TES** n g » — annoncer un total pour une quantité que
     personne n'a tapée serait le voisinage muet retourné dans l'autre sens.
     👉 *Les valeurs se replient, la phrase se tait.* */
  return v>0? v : 0;
}
function _bcApplyGrams(){
  if(!_bcNutr)return;
  /* ⭐ UN POUR-100 G EST UNE RÉFÉRENCE DE 100 — même moteur que toutes les autres routes. */
  const g=_qtyRescale('af', {kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
                      100, (document.getElementById('af-bc-grams')||{}).value);
  _bcMontrerTotal(g||0);
}
/* ⭐ CE QUE ÇA FAIT POUR TA QUANTITÉ (ft-v966) — Michel a lu « 88 g de protéines » sur la carte
   produit (titrée « Valeurs pour 100 g ») et a cru que c'était son apport. **L'app avait raison** :
   ses vrais chiffres étaient 117 kcal / 26 g, mais tout en bas de l'écran.
   ⛔ DEUX NOMBRES DE PROTÉINES SUR LE MÊME ÉCRAN, et rien ne disait lequel était le sien. *Aucun
   des deux n'est faux — c'est leur VOISINAGE MUET qui trompe*, ce qui est plus vicieux qu'une
   erreur : il n'y a rien à corriger, donc rien ne se signale.
   ⭐⭐ R2 — CETTE LIGNE NE CALCULE RIEN. Elle RELIT les champs que `_bcApplyGrams` vient d'écrire :
   deux calculs du même nombre finiraient par diverger, et on ne saurait plus lequel croire. */
/* ⚖️ « LA DERNIÈRE FOIS » : PROPOSÉ, JAMAIS IMPOSÉ (ft-v1051) — décision de Michel :
   *« oui c'est mieux comme ça, on donne le choix et pas imposer »*.
   ⛔ UN SEUL ENDROIT POSE LA PASTILLE, pour les DEUX chemins de reprise (« Mes aliments » et
   le journal) : sans ça, l'un des deux garderait le pré-remplissage et on aurait de nouveau
   deux comportements pour la même question (R2/R8 — le correctif posé d'un seul côté est le
   défaut le plus fréquent de ce fichier).
   ⚠️ ET LE CHEMIN DU SCAN NEUF NE CHANGE PAS, exprès : là, le champ à 100 g n'est pas une
   affirmation sur ce qu'on a mangé — les 4 valeurs affichées SONT les valeurs pour 100 g, la
   quantité et les chiffres se correspondent. Ce qui était faux, c'est de re-servir la quantité
   d'un REPAS passé comme si elle décrivait celui d'aujourd'hui (R30 : on ne modifie pas en
   silence une décision qu'on n'a pas prise). */
/* ⚖️⛔⛔ D'OÙ VIENT LE NOMBRE PRÉ-REMPLI DANS « Quantité » (ft-v1105)
   Michel, étiquette du pot à l'appui : « c'est cette prot là, toujours le même souci ».
   ⛔⛔ LE CHAMP SE REMPLIT AVEC LA PORTION DÉCLARÉE PAR LA SOURCE — `serving_quantity` côté
   fiche produit, `serving` côté photo d'étiquette — **pas la dosette qu'on a dans la main**.
   Le commentaire de `_bcProposerDerniere` le dit déjà en toutes lettres (« la portion du
   fabricant ») et **l'écran n'en disait rien**.
   ⭐ MESURÉ : une fiche annonçant une dosette de **40 g** produit **156 kcal et 35 g de
   protéines** sur un pot titré 88 g/100 g — des valeurs *parfaitement justes pour une portion
   que personne n'a mangée*. C'est exactement le couple de chiffres de sa capture.
   👉 ***Un nombre qui a l'air d'un fait alors que c'est l'hypothèse d'un tiers*** (R32/R33 :
   ce qui est repris garde d'où il vient).
   ⛔ ON NE RETIRE PAS LE PRÉ-REMPLISSAGE : sans lui on retombe à 100 g, ce qui est pire, et le
   chemin rapide disparaît. *On ne cache pas le nombre, on lui rend sa source.* C'est la même
   décision qu'en ft-v1051 — « on donne le choix et pas imposer » — prise alors pour la quantité
   de la DERNIÈRE FOIS, et pas pour celle-ci (R8, la jumelle).
   ⛔ UN SEUL PROPRIÉTAIRE (R2), qui AFFICHE et EFFACE : sinon une provenance orpheline resterait
   au-dessus d'un autre aliment — le défaut exact de ft-v1042, deux lignes plus haut. */
function _bcQsrc(serv, source){
  const qs=document.getElementById('af-bc-qsrc'); if(!qs) return;
  if(serv===null){ qs.style.display='none'; qs.innerHTML=''; return; }
  const src=source||'la fiche produit';
  qs.innerHTML = (+serv>0)
    ? '⚖️ <b>'+(+serv)+'&nbsp;g</b> est la portion déclarée par '+src+' — <b>vérifie ta dosette</b>, elle peut être différente.'
    : 'Aucune portion déclarée par '+src+' : <b>100&nbsp;g</b> par défaut. Mets ta quantité réelle.';
  qs.style.display='block';
}
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
function _bcReprendreDerniere(){
  const b=document.getElementById('af-bc-last'); if(!b) return;
  const q=parseFloat(b.dataset.q)||0; if(!(q>0)) return;
  const g=document.getElementById('af-bc-grams'); if(g) g.value=q;
  _bcApplyGrams();                        // R2 : le même calcul que la saisie à la main
  b.style.display='none';                 // proposition consommée — elle ne repropose pas
}
function _bcMontrerTotal(g){
  const el=document.getElementById('af-bc-total'); if(!el) return;
  const lu=id=>parseInt((document.getElementById(id)||{}).value)||0;
  if(!(g>0)){ el.style.display='none'; el.textContent=''; return; }
  el.textContent='→ pour tes '+(Math.round(g*10)/10)+' g : '+lu('af-kcal')+' kcal · '
    +lu('af-prot')+' g de protéines · '+lu('af-carbs')+' g de glucides · '+lu('af-fat')+' g de lipides';
  el.style.display='block';
}
/* ═══ « TES REPAS HABITUELS » — UN APPUI, ZÉRO FORMULAIRE (18/08/2026) ═════════════════════
   Michel, en décrivant sa vraie journée : *« le matin je prends mon shaker de prot, je prends une
   banane ; le midi deux steaks hachés 5 %, 300 g de viande rouge, 200 g de riz et de la
   ratatouille ; le soir à peu près la même chose »*.
   ⭐ Quelqu'un qui mange ça tous les jours n'a pas besoin d'un formulaire à cinq champs, trois
   fois par jour. Il a besoin de **retrouver ce qu'il a déjà noté** et d'appuyer une fois.
   ⚠️ ET ÇA N'INVENTE AUCUNE DONNÉE : un « repas habituel » n'est pas déclaré, il est **observé**
   dans le journal — les aliments notés ensemble, le même jour, sur le même repas. Rien de neuf
   n'est stocké : ni liste à gérer, ni bouton « enregistrer ce repas » de plus.
   ⚠️ **AU MOINS DEUX FOIS** pour être proposé : une fois, c'est un repas ; deux fois, c'est une
   habitude. Proposer dès la première ferait de l'écran une liste de tout ce qu'on a mangé (R24).
   ⚠️ Michel a lui-même posé la limite de cette lecture : *« ça c'est moi qui le fais, les autres
   peut-être pas »*. D'où le repli silencieux — quelqu'un qui mange différemment chaque jour ne
   voit **rien du tout**, pas une section vide. */
function _repasHabituels(){
  const par={}, norm=n=>String(n||'').toLowerCase().trim();
  (S.foodLog||[]).forEach(e=>{
    if(!e||!e.date||!e.name)return;
    const k=e.date+'|'+(e.meal||'');
    (par[k]=par[k]||[]).push(e);
  });
  const sigs={};
  Object.keys(par).forEach(k=>{
    const [date,meal]=k.split('|');
    const items=par[k];
    const sig=meal+'::'+items.map(e=>norm(e.name)).sort().join('+');
    const s=sigs[sig]=sigs[sig]||{sig,meal,n:0,dernier:'',items:null};
    s.n++;
    if(date>s.dernier){ s.dernier=date; s.items=items; }   // la version la plus RÉCENTE fait foi
  });
  const td=today();
  const vivants=Object.values(sigs)
    .filter(s=>s.n>=2 && s.dernier!==td && s.items && s.items.length);
  /* ⛔⛔ ON FUSIONNE LES VARIANTES DU MÊME REPAS (ft-v1062) — Michel, capture à l'appui :
     *« j'ai 2 fois la même prot »*. Son shaker est noté **6 fois en Collation 2** et **2 fois en
     Petit-déj** : deux signatures, donc deux lignes rigoureusement identiques à l'écran.
     ⚠️ **C'est une régression de ft-v1056, la mienne.** Tant que la carte APPLIQUAIT le moment,
     il faisait partie de l'identité de ce qu'on rejoue — deux lignes, deux résultats différents.
     Depuis que le moment **se demande au tap**, les deux lignes font exactement la même chose.
     *Un critère de regroupement qui survit à la disparition de son motif fabrique des doublons.*
     ⛔ ET LE COÛT N'EST PAS QUE VISUEL : la liste est bornée à 3, donc une variante en double
     **chasse une vraie autre habitude** de l'écran.
     ⭐ ON FILTRE AVANT DE FUSIONNER, ET C'EST CE QUI PRÉSERVE SON USAGE RÉEL : il prend ce même
     shaker le matin ET l'après-midi. Fusionner d'abord ferait disparaître l'habitude entière dès
     qu'il l'a noté une fois dans la journée — il perdrait le tap pour son 2ᵉ shaker. En filtrant
     variante par variante, celle de l'après-midi survit à celle du matin. */
  /* ⚠️ LE COMPTE (« noté X fois ») SE FAIT SUR **TOUTES** LES VARIANTES, y compris celles
     écartées parce que notées aujourd'hui — sinon il MENT. Mon propre témoin l'a attrapé :
     shaker noté 6 fois en Collation 2 et 3 fois en Petit-déj dont une ce matin, la variante du
     matin est écartée du choix… et son compte partait avec, affichant « noté 6 fois » pour
     quelque chose qui a été noté 9 fois. *Le filtre décide de ce qu'on PROPOSE, jamais de ce
     qu'on a COMPTÉ.* Idem pour le moment proposé : il décrit l'habitude entière. */
  const total={}, momentTot={};
  Object.values(sigs).forEach(s=>{
    const cle=s.sig.split('::')[1]||s.sig;
    total[cle]=(total[cle]||0)+s.n;
    (momentTot[cle]=momentTot[cle]||{})[s.meal]=((momentTot[cle]||{})[s.meal]||0)+s.n;
  });
  const parRepas={};
  vivants.forEach(s=>{
    const cle=s.sig.split('::')[1]||s.sig;      // la signature SANS le moment
    const g=parRepas[cle]=parRepas[cle]||{sig:cle,meal:'',n:total[cle]||s.n,dernier:'',items:null,_m:momentTot[cle]||{}};
    if(s.dernier>g.dernier){ g.dernier=s.dernier; g.items=s.items; }
  });
  /* ⭐ Le moment PROPOSÉ (celui entouré « d'habitude ») est le plus FRÉQUENT, pas le plus récent :
     c'est ce qui décrit son habitude, pas son dernier écart. Rien n'est appliqué sans son tap. */
  Object.values(parRepas).forEach(g=>{
    g.meal=Object.keys(g._m).sort((x,y)=>(g._m[y]-g._m[x])||x.localeCompare(y))[0]||'';
    delete g._m;
  });
  return Object.values(parRepas)
    .sort((a,b)=>(b.n-a.n)||b.dernier.localeCompare(a.dernier))
    .slice(0,3);
}
/* Rejoue un repas : ses aliments sont ajoutés à AUJOURD'HUI, sur le même moment de la journée.
   ⚠️ La provenance dit « reprise » (brique 0) — ce n'est ni une mesure fraîche ni une saisie
   manuelle, et l'écrire évite qu'un chiffre repris passe un jour pour une mesure. */
/* ⏰ LE MOMENT DE LA JOURNÉE SE DEMANDE, IL NE SE DEVINE PLUS (ft-v1052)
   Michel, capture à l'appui : *« il y a les favoris c'est bien, mais il catégorise direct en
   collation ou dîner ou peu importe. C'est un bon principe, mais on doit donner le choix : on
   clique sur le favori et on demande à quel moment de la journée. »*
   ⛔ CE QUI ÉTAIT FAUX N'EST PAS LA SUGGESTION, C'EST QU'ELLE S'APPLIQUE SANS ÊTRE VALIDÉE.
   Un repas habituel est OBSERVÉ (les mêmes aliments notés ensemble deux fois) — donc le moment
   observé est un bon PARI, pas un fait sur aujourd'hui. Le même shaker peut être un petit-déj
   un jour et une collation le lendemain. *L'app propose ce qu'elle a vu, la personne tranche*
   (R29 — quand l'erreur touche la personne, on demande).
   ⭐ R13 : `meal` est un argument OPTIONNEL, comme `refTs` en ft-v1017. Sans lui, le
   comportement d'origine est intact — donc aucun appelant existant ne change de sens. */
function rejouerRepas(sig, meal){
  const r=_repasHabituels().find(x=>x.sig===sig);
  if(!r){toast('Repas introuvable','error');return;}
  /* ⛔ UN MOMENT INCONNU NE PASSE PAS : on retombe sur celui qu'on a observé plutôt que
     d'écrire n'importe quoi dans le journal (R29). `FOOD_MEALS` est le seul propriétaire
     de la liste des moments (R2) — on ne la recopie nulle part. */
  const ok=(typeof FOOD_MEALS!=='undefined') && FOOD_MEALS.some(m=>m.k===meal);
  const moment=ok?meal:r.meal;
  if(!S.foodLog)S.foodLog=[];
  const av=(typeof _afSrc!=='undefined')?_afSrc:null;
  if(typeof _afSetSrc==='function')_afSetSrc({saisie:'liste',origine:'reprise'});
  r.items.forEach(e=>{
    const vals={kcal:e.kcal||0,prot:e.prot||0,carbs:e.carbs||0,fat:e.fat||0};
    const prov=(typeof _provFood==='function')?_provFood(vals):{};
    S.foodLog.push(Object.assign({date:_journalJourActif(),meal:moment,name:e.name,ts:Date.now()},vals,prov,{q:null,u:null}));
  });
  if(typeof _afSetSrc==='function')_afSetSrc(av);   // on rend le marqueur (R15)
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  renderFoodJournal();
  try{ if(typeof renderNutrition==='function')renderNutrition(); }catch(e){}
  /* ⭐ LE TOAST NOMME LE MOMENT CHOISI : sans ça, on ne peut pas vérifier d'un coup d'œil que
     le tap a bien porté là où on voulait — et c'est justement le sujet de cette version. */
  const mi=(typeof _foodMealInfo==='function')?_foodMealInfo(moment):null;
  toast(r.items.length+' aliment'+(r.items.length>1?'s':'')+' ajouté'+(r.items.length>1?'s':'')
        +(mi&&mi.lbl?' — '+mi.lbl:'')+' 🍽️','success');
}
/* ⏰ LE CHOIX DU MOMENT — un dépliage, pas une pop-up (ft-v1052).
   ⛔ PAS D'OVERLAY, exprès : une modale de plus imposerait un chemin de fermeture à déclarer
   dans `_OVERLAY_CLOSERS` (R15) pour une question à un tap. Le dépliage vit dans la carte,
   se referme en retapant, et n'attrape rien derrière lui (R24 — informer sans bloquer). */
function _habChoisirMoment(id){
  const el=document.getElementById(id); if(!el) return;
  const ouvert=el.style.display!=='none';
  /* ⛔ UN SEUL DÉPLIAGE OUVERT À LA FOIS : deux rangées de moments côte à côte, et on ne sait
     plus laquelle appartient à quel repas — le « voisinage muet » appliqué aux boutons. */
  document.querySelectorAll('.hab-moments').forEach(x=>{x.style.display='none';});
  if(!ouvert) el.style.display='block';
}
function _foodTotals(date){
  const t={kcal:0,prot:0,carbs:0,fat:0};
  (S.foodLog||[]).forEach(e=>{if(e.date===date){t.kcal+=e.kcal||0;t.prot+=e.prot||0;t.carbs+=e.carbs||0;t.fat+=e.fat||0;}});
  return t;
}
/* ═══ L'APP APPREND L'ALIMENTATION — 100 % LOCAL, ZÉRO APPEL API (26/08/2026, ft-v1021) ═══
   Michel : *« il faut que l'application (pas Milo) apprenne du sportif côté nutrition sans que
   ça me coûte un seul appel API »*. Et la veille, le constat qui l'a amené là : *« on connaît
   l'athlète sportivement en lui posant des questions, mais pas du tout en alimentation — alors
   que c'est 80 % au moins de l'évolution physique »*. Mesuré : **6 questions** sur
   l'entraînement, **ZÉRO** sur la nourriture.

   ⭐⭐ TOUT CE QUI SUIT EST DE L'ARITHMÉTIQUE SUR `S.foodLog`. Pas un octet de réseau, pas un
   modèle, pas de cervelet — donc **rien à payer, et ça marche hors ligne** (règle d'or #4).
   *La donnée était déjà là : ce qui manquait, c'est que quelqu'un la regarde.*

   ⛔⛔ CE QUE L'OBSERVATION NE PEUT PAS DONNER, ET QU'ON N'INVENTE PAS (R29). Une absence ne
   prouve RIEN : Michel n'a jamais noté de macadamia — *« j'en mange pas, et en plus c'est
   dégueulasse »* — mais quelqu'un d'autre peut simplement ne pas y avoir pensé. **On mesure ce
   qui EST là, jamais ce qui n'y est pas.** Les dégoûts, le budget, le temps de préparation
   devront être DEMANDÉS ; c'est écrit dans `IDEES-FUTURES.md`, ce n'est pas ce fichier-ci.

   ⛔ ET AUCUN SCORE DE FIABILITÉ INVENTÉ (R32) : des ÉTATS NOMMÉS. « 4 jours notés » n'autorise
   pas la même phrase que « 40 jours », et un « fiabilité 78 % » serait une fausse précision. */

const _PA_MIN_JOURS = 3;          // en dessous, on ne prétend rien observer
const _PA_SOLIDE    = 14;         // à partir de là, on parle d'habitudes
function _profilAlimentaire(){
  const fl = Array.isArray(S.foodLog) ? S.foodLog : [];
  if(!fl.length) return null;
  const cleN = n => (n||'').trim().toLowerCase();

  /* ① Combien de jours sont RÉELLEMENT notés, et sur quelle fenêtre. C'est ce chiffre qui
     décide de ce qu'on a le droit de dire ensuite — il vient donc en premier. */
  const parJour = {};
  fl.forEach(e=>{ if(e && e.date) (parJour[e.date] = parJour[e.date] || []).push(e); });
  const jours = Object.keys(parJour).sort();
  const nbJours = jours.length;
  const etat = nbJours >= _PA_SOLIDE ? 'solide'
             : nbJours >= _PA_MIN_JOURS ? 'partiel'
             : 'insuffisant';
  /* ⚠️ La FENÊTRE compte autant que le nombre : 6 jours étalés sur huit semaines ne disent pas la
     même chose que 6 jours d'affilée. On donne les deux, on ne les mélange pas. */
  let etendue = 0;
  if(nbJours >= 2){
    const a = new Date(jours[0]+'T12:00:00'), b = new Date(jours[nbJours-1]+'T12:00:00');
    etendue = Math.round((b-a)/864e5) + 1;
  }

  /* ② Ses aliments, par MOMENT de la journée. C'est là qu'est l'information utile : « du riz »
     ne dit pas grand-chose, « du riz au déjeuner » se transpose directement dans un plan. */
  const parRepas = {}, global = {};
  fl.forEach(e=>{
    const n = (e && e.name || '').trim(); if(!n) return;
    const k = cleN(n), m = e.meal || 'autre';
    (parRepas[m] = parRepas[m] || {});
    parRepas[m][k] = parRepas[m][k] || {nom:n, n:0};
    parRepas[m][k].n++;
    global[k] = global[k] || {nom:n, n:0, kcal:+e.kcal||0, prot:+e.prot||0, carbs:+e.carbs||0, fat:+e.fat||0};
    global[k].n++;
  });
  const top = (o, max) => Object.keys(o).map(k=>o[k]).sort((a,b)=>b.n-a.n).slice(0, max||3);
  const habitudes = {};
  Object.keys(parRepas).forEach(m=>{ habitudes[m] = top(parRepas[m], 3); });

  /* ③ Ses HORAIRES réels, par repas — la médiane, pas la moyenne : un seul dîner à 2 h du
     matin ne doit pas déplacer l'heure habituelle de tous les autres. */
  const heures = {};
  Object.keys(parRepas).forEach(m=>{
    const hs = fl.filter(e=>e && (e.meal||'autre')===m && e.ts)
                 .map(e=>new Date(e.ts).getHours()).sort((a,b)=>a-b);
    if(hs.length >= 3) heures[m] = hs[Math.floor(hs.length/2)];   // ⛔ 3 points minimum
  });

  /* ④ Ce qu'il mange VRAIMENT en moyenne, sur les jours notés — à comparer à sa cible.
     ⛔ On divise par les jours NOTÉS, pas par les jours écoulés : sinon un oubli de saisie
     ressemblerait à un jour de jeûne, et la moyenne mentirait vers le bas. */
  const somme = {kcal:0, prot:0, carbs:0, fat:0};
  fl.forEach(e=>{ somme.kcal+=+e.kcal||0; somme.prot+=+e.prot||0; somme.carbs+=+e.carbs||0; somme.fat+=+e.fat||0; });
  const moy = {};
  ['kcal','prot','carbs','fat'].forEach(k=> moy[k] = nbJours ? Math.round(somme[k]/nbJours) : 0);

  return { nbJours:nbJours, etendue:etendue, etat:etat,
           habitudes:habitudes, favoris:top(global, 5), heures:heures, moyennes:moy,
           /* ⚠️ Le nombre de repas notés par jour dit s'il note TOUT ou seulement une partie —
              une moyenne de 1,2 entrée par jour ne décrit pas une journée. */
           entreesParJour: nbJours ? Math.round(fl.length/nbJours*10)/10 : 0 };
}

/* ═══ CE QU'IL TE RESTE À MANGER — ET CE QUE ÇA REPRÉSENTE (26/08/2026, ft-v1019) ═══════
   Michel : *« il faut montrer une estimation de ce qu'il nous reste à manger dans la journée
   (à 14h par exemple, il te reste 150 g de prot à manger, tu peux faire 1 shake de prot et
   150 g de poulet, pareil pour les glucides et pareil pour les lipides) »*.
   ⭐⭐ SA PRÉCISION EST TOUT LE SUJET, et elle change la nature de la chose : le chiffre
   « il te reste 150 g de protéines » EXISTE DÉJÀ à l'écran depuis longtemps — et il ne sert
   à rien, parce que personne ne sait à quoi ressemblent 150 g de protéines dans une assiette.
   *Ce qui manquait n'est pas la donnée, c'est sa TRADUCTION.* C'est le trou 3.3 de
   `docs/NUTRITION-MOTEUR.md` (« le Journal et le Plan ne se parlent pas »).

   ⛔⛔ LES ALIMENTS PROPOSÉS SONT LES SIENS, JAMAIS UNE BASE INVENTÉE (R29). On pioche dans ses
   FAVORIS et dans ce qu'il a réellement mangé — donc : des aliments qu'il aime, qu'il a sous la
   main, avec des macros QU'IL A LUI-MÊME enregistrées. ⭐ Et ça évite entièrement le trou 3.2
   (« aucune base d'aliments ») : on n'a pas besoin des 300 aliments `composable` pour ça.

   ⛔ ANTI-TCA — Constitution P21, `docs/NUTRITION-PHILOSOPHIE.md`. Trois garde-fous :
   ① AUJOURD'HUI SEULEMENT — jamais sur un jour passé : un « il te manquait 40 g » d'hier est un
      reproche sur une journée qu'on ne peut plus changer, et ça ne sert à rien.
   ② AUCUN REPROCHE quand la cible est dépassée : on n'affiche pas d'idée, et on ne commente pas.
   ③ C'EST UNE ILLUSTRATION, PAS UNE PRESCRIPTION — le texte dit « ça ressemble à », jamais
      « tu dois ». *La nutrition ne doit jamais devenir une source de stress supérieure au
      bénéfice qu'elle apporte.* */

/* Un seul propriétaire du « reste » (R2) : il lit `_foodTotals` et `calcMacros`, il ne
   recalcule NI l'un NI l'autre. Rend `null` si le profil ne permet pas de cible — on ne
   compare pas à un objectif qu'on n'a pas. */
function _resteDuJour(date){
  const d = date || ((typeof today==='function')?today():'');
  if(!(S.bw && S.age && S.height)) return null;
  const cible = (typeof calcMacros==='function') ? calcMacros(S.nutritionPhase) : null;
  if(!cible || !cible.calories) return null;
  const tot = (typeof _foodTotals==='function') ? _foodTotals(d) : {kcal:0,prot:0,carbs:0,fat:0};
  const r = k => Math.round(k);
  return {
    date:d,
    rien: !(S.foodLog||[]).some(e=>e.date===d),      // ⚠️ « rien noté » ≠ « rien mangé »
    kcal:  r(cible.calories - tot.kcal),
    prot:  r((cible.prot_g||0)  - tot.prot),
    carbs: r((cible.carbs_g||0) - tot.carbs),
    fat:   r((cible.fat_g||0)   - tot.fat),
    cible:cible, tot:tot
  };
}

/* Ses aliments à LUI : les favoris d'abord (il les a choisis), puis les plus récents du
   journal. Dédupliqués par nom, et on ne garde que ce qui porte de vraies macros. */
function _mesAliments(max){
  /* ⚠️⚠️ REMANIÉ LE 26/08 (ft-v1020) — Michel, devant la 1ʳᵉ version : *« il faut rester
     simple, tout le monde ne bouffe pas de flocons d'avoine, moi le premier »*.
     ⭐ Le classement d'origine prenait l'aliment le plus DENSE dans la macro manquante. Sur le
     papier c'est optimal ; en vrai ça sort l'aliment le plus riche, pas celui qu'on mange.
     👉 On classe désormais par **ce qu'il mange VRAIMENT** : un favori (il l'a choisi) passe
     devant, puis la FRÉQUENCE dans son journal. *Un aliment parfait qu'on ne mange jamais est
     un mauvais conseil.* La densité ne sert plus qu'à départager à fréquence égale. */
  const vus = {}, out = [];
  const cle = n => (n||'').trim().toLowerCase();
  /* On compte d'abord combien de fois chaque aliment revient dans le journal. */
  const freq = {};
  (S.foodLog||[]).forEach(e=>{ const k=cle(e&&e.name); if(k) freq[k]=(freq[k]||0)+1; });
  const prendre = (e, fav) => {
    const n = (e && e.name || '').trim(); if(!n) return;
    const k = cle(n); if(vus[k]) return;
    const kcal=+e.kcal||0, prot=+e.prot||0, carbs=+e.carbs||0, fat=+e.fat||0;
    if(!(kcal>0 || prot>0 || carbs>0 || fat>0)) return;    // ⛔ rien à proposer sans macros
    vus[k]=1;
    out.push({name:n, kcal:kcal, prot:prot, carbs:carbs, fat:fat,
              per100:e.per100||null, fav:!!fav, freq:(freq[k]||0)});
  };
  (S.savedFoods||[]).forEach(e=>prendre(e,true));
  (S.foodLog||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(e=>prendre(e,false));
  return out.slice(0, max||40);
}

/* ⚠️⚠️ PREMIÈRE VERSION JETÉE, ET LA MESURE L'A DIT TOUT DE SUITE : elle proposait UN seul
   aliment par macro, et rendait « 5,5 × Blanc de poulet » ou « 3,5 × Huile d'olive ».
   *Ce ne sont pas des idées, ce sont des absurdités* — personne ne mange 3 portions et demie
   d'huile d'olive. ⭐ ET L'EXEMPLE DE MICHEL DISAIT DÉJÀ POURQUOI : *« tu peux faire 1 shake de
   prot ET 150 g de poulet »* — une COMBINAISON, précisément parce qu'un seul aliment ne couvre
   pas un gros manque à dose raisonnable. Le défaut n'était pas dans le calcul, il était dans
   l'idée qu'un aliment suffit.

   ⛔ CE QUI BORNE UNE PORTION RAISONNABLE, et c'est ce qui rend la suggestion crédible :
   au plus 2 portions du même aliment, et au plus 250 g quand on connaît son pour-100 g.
   ⭐ ON DIT CE QUE LA COMBINAISON COUVRE VRAIMENT (« ≈ 160 g sur 167 ») plutôt que de faire
   croire qu'elle tombe juste — une fausse précision serait pire que l'approximation (R29). */

/* Une quantité RAISONNABLE d'un aliment, pour couvrir au plus `manque` de cette macro.
   Rend {texte, apport} ou null. Ne dépasse jamais les bornes ci-dessus. */
const _RESTE_MAX_PORTIONS = 2, _RESTE_MAX_G = 250;

/* ═══ LA BASCULE DU SOIR (27/08/2026, ft-v1029) ══════════════════════════════════════════
   Michel, devant la 1ʳᵉ version : *« alors à 22 h je vais pas bouffer de la ratatouille lol »*.
   ⛔⛔ LE DÉFAUT N'EST PAS LE CHIFFRE, C'EST LE VOLUME PROPOSÉ À UNE HEURE OÙ ON NE MANGE PLUS.
   Les bornes de ft-v1019 (2 portions / 250 g) sont justes à 14 h — il reste deux repas pour
   les caser — et absurdes à 21 h. *Une portion raisonnable ne l'est pas de la même façon
   selon l'heure qu'il est* : c'est la borne qui dépend de l'heure, jamais le calcul.

   ⭐ L'HEURE EST TRANCHÉE PAR MICHEL : **20 h**. Ce n'est pas une moyenne trouvée dans le code,
   c'est sa décision — on ne la déduit pas, on l'écrit (R29).

   ⛔⛔ ET LE VRAI GARDE-FOU EST ANTI-TCA (Constitution P21), pas ergonomique : à 21 h,
   « il te manque 200 g de protéines » n'est plus une information, c'est un **reproche sur une
   journée qu'on ne peut plus changer** — exactement ce que le garde-fou ② interdisait déjà sur
   un dépassement. 👉 Donc quand plus rien de LÉGER ne couvre une part utile du manque,
   **on se tait** : on n'affiche pas le manque tout seul « pour information ».

   ⚠️ L'HEURE EST UN ARGUMENT OPTIONNEL, comme `calcRecoveryDetail(refTs)` en ft-v1017 (R13) :
   sans lui on lit l'horloge, avec lui un témoin peut se placer à 21 h sans toucher au système.
   ⛔ Un SEUL propriétaire de la question « est-ce le soir ? » (R2) : le rendu et le calcul
   doivent répondre pareil, sinon le pied de bloc dirait « il est tard » sous une combinaison
   de 500 g. */
const _RESTE_HEURE_SOIR = 20;
const _RESTE_SOIR_MAX_PORTIONS = 1, _RESTE_SOIR_MAX_G = 150;
/* En dessous de ce quart, une idée légère n'aide plus : elle constate surtout le manque. */
const _RESTE_SOIR_COUV_MIN = 0.25;
function _estLeSoir(heure){
  const h = (heure==null) ? new Date().getHours() : +heure;
  return h >= _RESTE_HEURE_SOIR;
}

const cle = n => (n||'').trim().toLowerCase();
/* « 100 g de Amandes » — l'élision manquait. Ce n'est pas de la coquetterie : c'est du texte
   affiché à quelqu'un, et Michel l'a écrit lui-même (R31) — *plus on se rapproche d'une
   réalité, plus les gens ont confiance dans ce qu'on a fait.* */
/* ⚠️ Le « y » est EXCLU volontairement : on dit « de yaourt », pas « d'yaourt » — et le
   yaourt est bien plus fréquent dans un journal alimentaire que les yeux. Le « h » est
   GARDÉ pour la même raison inverse : « d'huile » est courant, « de homard » est rare. */
const _deNom = n => /^[aeiouàâäéèêëîïôöùûüœæh]/i.test((n||'').trim()) ? ("d'" + n) : ('de ' + n);
function _portionRaisonnable(al, macro, manque, soir){
  const parPortion = +al[macro] || 0;
  if(parPortion <= 0 || manque <= 0) return null;
  const maxG   = soir ? _RESTE_SOIR_MAX_G        : _RESTE_MAX_G;
  const maxPor = soir ? _RESTE_SOIR_MAX_PORTIONS : _RESTE_MAX_PORTIONS;
  const p100 = al.per100 && +al.per100[macro];
  if(p100 > 0){
    let g = manque / p100 * 100;
    g = Math.min(g, maxG);
    g = Math.round(g/5)*5;                                   // pas de fausse précision
    if(g < 10) return null;
    /* ⛔ ESPACE INSÉCABLE entre le nombre et son unité (ft-v1031) : vu à la capture,
       « + 250 / g de Steak haché » — le 250 finissait une ligne et le « g » commençait la
       suivante. *Un nombre séparé de son unité se relit deux fois.* */
    return { texte: g + '\u00A0g ' + _deNom(al.name), apport: g * p100 / 100 };
  }
  let n = manque / parPortion;
  n = Math.min(n, maxPor);
  n = Math.round(n*2)/2;                                     // au demi près
  if(n < 0.5) return null;
  return { texte: _portionLbl(n) + '\u00A0× ' + al.name, apport: n * parPortion };
}

/* ½ UNE PORTION ET DEMIE S'ÉCRIT « 1½ », PAS « 1.5 » (ft-v1098) — trouvé à la CAPTURE.
   ⛔⛔ L'app écrivait les DEUX, à deux écrans d'écart : les boutons de quantité disent
   `½ · 1 · 1½ · 2 · 3`, et « ce qu'il te reste » sortait **« 1.5 × Amandes »** — un point
   décimal anglais, dans un écran qui écrit par ailleurs « 1 492 » et « ≈ 140 g ».
   *Deux écritures pour la même quantité, c'est une de trop* (**R2**), et celle-là se lit
   comme une coquille — exactement le défaut du séparateur de milliers de ft-v1027.
   ⛔ UN SEUL PROPRIÉTAIRE, lu par les trois endroits (ici et les deux rangées de boutons de
   quantité). Au-delà de 3, on retombe sur le nombre nu — avec la VIRGULE française —
   plutôt que d'inventer une notation : les demis s'arrêtent là où les boutons s'arrêtent. */
const _PORTION_LBL={0.5:'½',1:'1',1.5:'1½',2:'2',2.5:'2½',3:'3'};
function _portionLbl(n){ return _PORTION_LBL[n] || String(n).replace('.',','); }

/* Compose une idée pour UNE macro : jusqu'à 2 aliments à lui, à doses raisonnables.
   ⛔ Les aliments déjà employés pour une autre macro sont écartés — sinon la même ligne
   revient trois fois et l'idée n'en est plus une. */
function _ideePourMacro(al, macro, manque, pris, soir){
  /* ⭐ CLASSEMENT : ce qu'il mange, avant ce qui est optimal. Favori d'abord, puis fréquence,
     puis densité pour départager. (Michel, ft-v1020 : « rester simple ».) */
  /* ⛔⛔ D'ABORD LA PERTINENCE, ENSUITE SEULEMENT LES GOÛTS — mesuré, pas supposé.
     Mon 1ᵉʳ jet de ft-v1020 classait le FAVORI en tête, quelle que soit la macro : il a sorti
     « 2 × Shake protéiné » sur la ligne **GLUCIDES**. *Un shake protéiné pour des glucides, ça
     ne veut rien dire.* Le classement par ce qu'on mange était juste ; il manquait la condition
     d'entrée.
     ⭐ LE CRITÈRE EST PHYSIQUE, PAS ARBITRAIRE : la macro doit peser au moins 30 % des calories
     de l'aliment. Le riz est à 88 % de glucides, l'huile à 100 % de lipides, le shake à 83 % de
     protéines — et à 10 % de glucides, donc il ne sort JAMAIS sur cette ligne-là. */
  const KCAL = {prot:4, carbs:4, fat:9};
  const pertinent = a => {
    const k = +a.kcal || 0;
    const part = (+a[macro]||0) * KCAL[macro];
    return k > 0 ? (part / k) >= 0.30 : (+a[macro]||0) > 0;
  };
  const cand = al.filter(a => !pris[cle(a.name)] && (+a[macro]||0) > 0 && pertinent(a))
                 .sort((a,b) => (b.fav?1:0)-(a.fav?1:0)
                             || (b.freq||0)-(a.freq||0)
                             || (+b[macro]||0)-(+a[macro]||0));
  const parts = [];
  let reste = manque, couvert = 0;
  for(const a of cand){
    /* ⛔ UN SEUL ALIMENT PAR DÉFAUT. Un deuxième n'est ajouté QUE si le premier couvre moins
       de la moitié du manque — sinon la ligne devient une recette, et Michel a raison :
       « 250 g de riz + 160 g de flocons » ne se lit pas, ça se subit (R19). */
    if(parts.length >= 1 && couvert >= manque*0.5) break;
    /* ⛔ LE SOIR, JAMAIS DE COMBINAISON (ft-v1029). « 250 g de riz + 160 g de flocons » se
       subissait déjà à 14 h ; à 21 h ça ne se propose pas du tout. Une seule idée, ou rien. */
    if(parts.length >= (soir ? 1 : 2)) break;
    const q = _portionRaisonnable(a, macro, reste, soir);
    if(!q) continue;
    parts.push(q.texte); pris[cle(a.name)] = 1;
    couvert += q.apport; reste -= q.apport;
  }
  if(!parts.length) return null;
  return { texte: parts.join(' + '), couvert: Math.round(couvert) };
}

/* Les idées : une par macro qui manque VRAIMENT, en commençant par celle qui manque le plus.
   ⛔ Au plus 3 — au-delà ce n'est plus une idée, c'est une liste de courses (R19). */
const _RESTE_SEUILS = { prot:15, carbs:25, fat:8 };           // en dessous, ça ne vaut pas un conseil
function _ideesPourLeReste(reste, heure){
  if(!reste) return [];
  const al = _mesAliments(40);
  if(!al.length) return [];
  const soir = _estLeSoir(heure);
  const noms = { prot:'protéines', carbs:'glucides', fat:'lipides' };
  const manques = ['prot','carbs','fat']
    .filter(m => reste[m] >= _RESTE_SEUILS[m])
    .sort((a,b) => (reste[b]/_RESTE_SEUILS[b]) - (reste[a]/_RESTE_SEUILS[a]));
  const out = [], pris = {};
  manques.forEach(m=>{
    if(out.length >= 3) return;
    const idee = _ideePourMacro(al, m, reste[m], pris, soir);
    if(!idee) return;
    /* ⛔⛔ LE SOIR, ON SE TAIT PLUTÔT QUE DE CONSTATER LE MANQUE (anti-TCA, P21). Une idée
       légère qui ne couvre qu'un huitième du manque n'aide plus : ce qu'elle affiche vraiment,
       c'est le manque. *Et un manque qu'on ne peut plus combler ce soir est un reproche, pas
       une information* — même raison que le silence sur une cible dépassée. */
    if(soir && idee.couvert < reste[m]*_RESTE_SOIR_COUV_MIN) return;
    out.push({ macro:m, label:noms[m], manque:reste[m], idee:idee.texte, couvert:idee.couvert, soir:soir });
  });
  return out;
}

/* 🔍 Les raccourcis du Journal (ft-v871) — ils ouvrent la MÊME modale, au bon endroit.
   ⚠️ `readFoodLabel` déclenche un `input.click()` : il doit rester dans la MÊME tâche que le
   geste de l'utilisateur, sinon iOS refuse d'ouvrir la caméra. On l'appelle donc en direct,
   sans `setTimeout`. Les deux autres ne font que poser le curseur : là, un rAF est plus sûr
   (le champ n'est pas encore mesurable pendant l'ouverture de la modale). */
function addFoodVia(mode){
  openAddFood();
  try{
    if(mode==='label'){ if(typeof readFoodLabel==='function')readFoodLabel(); return; }
    const id = (mode==='bc') ? 'af-bc-manual' : 'af-desc';
    requestAnimationFrame(()=>{ const el=document.getElementById(id); if(!el)return;
      try{ el.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
      try{ el.focus(); }catch(e){} });
  }catch(e){}
}
function openAddFood(){
  const h=new Date().getHours();
  _afMeal = h<11?'petitdej' : h<15?'dejeuner' : h<18?'collation' : 'diner';
  ['af-desc','af-kcal','af-prot','af-carbs','af-fat'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  _bcNutr=null;
  /* ⚠️ REMISE À ZÉRO DE LA PROVENANCE À CHAQUE OUVERTURE — sans ça, un scan d'Open Food Facts
     laisserait sa provenance sur la saisie MANUELLE suivante, et le journal affirmerait une
     source qui n'a rien à voir. Une provenance fausse est pire que pas de provenance : elle se
     présente comme un fait vérifiable. */
  _afSetSrc(null);
  _afNoteEtat('');   // R15 : la note se rend comme la provenance, sinon elle survit au produit suivant
  /* R15 encore : les propositions se rendent AUSSI. Sans ça, la liste du produit précédent
     resterait affichée sous un champ vide — et un tap dessus remplirait un formulaire que la
     personne croyait neuf. */
  try{ if(_afSuggTimer) clearTimeout(_afSuggTimer); _afSuggVider(); }catch(e){}
  const bcRow=document.getElementById('af-bc-row');if(bcRow)bcRow.style.display='none';
  _bcQsrc(null);                      // ⛔ pas de provenance orpheline (ft-v1105)
  /* R15 : le poids supposé par l'IA et le bloc « Quantité » se rendent comme la provenance —
     sinon la référence du produit précédent piloterait la saisie suivante, en silence. */
  window._afIaGrammes=0; window._afIaDesc='';
  try{ _afPropCacher(); }catch(e){}
  try{ _bcProposerDerniere(0); }catch(e){}   // ⛔ la pastille ne survit pas à l'aliment précédent
  const coh=document.getElementById('af-coherence');if(coh){coh.style.display='none';coh.innerHTML='';}
  const hc=document.getElementById('af-health-card');if(hc)hc.innerHTML='';
  // Code-barres + score santé : GRATUIT pour tout le monde (client-side, 0 token).
  // Les fonctions IA (📸 étiquette, 🤖 estimation) restent freemium (25 essais puis Premium).
  const bb=document.getElementById('af-barcode-block');
  if(bb)bb.style.display='block';
  const mi=document.getElementById('af-bc-manual');if(mi)mi.value='';
  _renderAfMealChips();
  _renderAfAiNote();
  _renderFoodQuickList();
  document.getElementById('ov-add-food').classList.add('open');
}
function _renderAfAiNote(){
  const el=document.getElementById('af-ai-note');if(!el)return;
  if(S.premium){el.innerHTML='<span style="color:var(--gold);">⭐ Estimations IA illimitées</span>';return;}
  const left=_foodAiLeft();
  el.innerHTML=left>0
    ?`🆓 ${left} estimation${left>1?'s':''} IA restante${left>1?'s':''} · ou saisis à la main (gratuit, illimité)`
    :`Estimations IA gratuites épuisées · ⭐ Premium pour l'illimité · la saisie à la main reste gratuite`;
}
function closeAddFood(){document.getElementById('ov-add-food').classList.remove('open');}
// ─── Aliments récents / favoris — ré-ajout rapide sans re-scanner ────────────
let _afQuickItems=[];
/* ⛔⛔ `per100` (ET la dernière quantité) SURVIVENT JUSQU'ICI — ft-v1042, R4.
   Michel, 2 captures : « il faut absolument que je puisse mettre le poids sur les aliments
   réutilisés ». Cette fonction ne recopiait que `{name,kcal,prot,carbs,fat}` : le pour-100 g,
   pourtant présent dans l'entrée du journal, était **jeté au moment précis où il sert**.
   *L'information existait et n'atteignait pas l'écran* — le défaut n'était pas dans le calcul
   de quantité (qui marche depuis ft-v965), il était dans le transport. */
function _buildFoodQuickItems(){
  const favs=(S.savedFoods||[]).map(f=>({name:f.name,kcal:f.kcal||0,prot:f.prot||0,carbs:f.carbs||0,fat:f.fat||0,
                                         per100:f.per100||null,q:+f.q>0?+f.q:0,u:f.u||null,fav:true}));
  const seen=new Set(favs.map(f=>(f.name||'').toLowerCase()));
  const hidden=new Set((S.hiddenFoods||[]).map(x=>(x||'').toLowerCase()));
  const recent=[];
  (S.foodLog||[]).slice().sort((a,b)=>b.ts-a.ts).forEach(e=>{
    const k=(e.name||'').toLowerCase(); if(!k||seen.has(k)||hidden.has(k))return; seen.add(k);
    recent.push({name:e.name,kcal:e.kcal||0,prot:e.prot||0,carbs:e.carbs||0,fat:e.fat||0,
                 per100:e.per100||null,q:+e.q>0?+e.q:0,u:e.u||null,
                 origine:e.origine||null,sourceId:e.sourceId||null,etat:e.etat||null,fav:false});
  });
  return favs.concat(recent).slice(0,12);
}
function _renderFoodQuickList(){
  const el=document.getElementById('af-quick-list'); if(!el)return;
  _afQuickItems=_buildFoodQuickItems();
  if(!_afQuickItems.length){el.innerHTML='';return;}
  el.innerHTML='<div style="font-size:12px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:8px;">Mes aliments (récents & favoris)</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">'
    +_afQuickItems.map((it,i)=>'<div style="background:var(--bg2);border-radius:12px;padding:9px 12px;display:flex;align-items:center;gap:8px;box-shadow:inset 0 0 0 1px var(--sep);">'
      +'<button onclick="toggleFavFood('+i+')" title="Favori" style="background:none;border:none;font-size:16px;cursor:pointer;flex-shrink:0;padding:0;line-height:1;color:'+(it.fav?'var(--gold)':'var(--t3)')+';">'+(it.fav?'★':'☆')+'</button>'
      +'<div onclick="quickFillFood('+i+')" style="flex:1;min-width:0;cursor:pointer;">'
        +'<div style="font-size:13px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+_escFood(it.name)+'</div>'
        +'<div style="font-size:11px;color:var(--t3);">'+(it.kcal||0)+' kcal · P '+(it.prot||0)+' · G '+(it.carbs||0)+' · L '+(it.fat||0)+'</div>'
      +'</div>'
      +'<button onclick="quickAddFood('+i+')" style="background:var(--bg3);border:none;border-radius:8px;color:var(--red);font-size:12px;font-weight:700;padding:7px 11px;cursor:pointer;flex-shrink:0;">+ Ajouter</button>'
      +'<button onclick="deleteQuickFood('+i+')" title="Supprimer" style="background:none;border:none;color:var(--t3);font-size:15px;cursor:pointer;flex-shrink:0;padding:2px 3px;line-height:1;">✕</button>'
    +'</div>').join('')
    +'</div>';
}
// Supprime un aliment de la liste (avec confirmation) : favori → retiré des favoris ; récent → masqué des suggestions
function deleteQuickFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  const nm=it.name||''; const key=nm.toLowerCase();
  const msg=it.fav?('« '+nm+' » sera retiré de tes favoris.'):('« '+nm+' » n\'apparaîtra plus dans tes aliments récents.');
  const doit=()=>{
    if(it.fav)S.savedFoods=(S.savedFoods||[]).filter(f=>(f.name||'').toLowerCase()!==key);
    if(!S.hiddenFoods)S.hiddenFoods=[];
    if(!S.hiddenFoods.includes(key))S.hiddenFoods.push(key); // masque aussi un ex-favori pour qu'il ne revienne pas en « récent »
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    _renderFoodQuickList(); toast('Supprimé de la liste','info');
  };
  if(typeof showConfirm==='function') showConfirm('Supprimer de la liste ?',msg,doit,'Supprimer');
  else doit();
}
function _unhideFood(nm){ const k=(nm||'').toLowerCase(); if(k&&S.hiddenFoods&&S.hiddenFoods.length)S.hiddenFoods=S.hiddenFoods.filter(x=>x!==k); }
/* ⚖️ LA QUANTITÉ SUR UN ALIMENT REPRIS DE « MES ALIMENTS » (ft-v1042) — Michel, 2 captures :
   « il faut absolument que je puisse mettre le poids sur les aliments réutilisés, qu'ils soient
   rentrés avec le code-barre, ou à la main ou encore avec l'IA ».
   ⛔⛔ 5ᵉ FOIS LE MÊME OUBLI, ET LE CODE LE DIT DÉJÀ DE LUI-MÊME : *« le mécanisme existait,
   posé d'un seul côté »* (ft-v973, v975, v984, v999). La reprise depuis le JOURNAL gère la
   quantité depuis ft-v984/999 ; celle-ci remplissait les 4 champs de macros et s'arrêtait.
   ⭐ R13/R2 — RIEN N'EST RÉINVENTÉ : on emprunte exactement le chemin de la reprise du journal.
   `_bcNutr` + `af-bc-row` quand un pour-100 g existe (scan, recherche, CIQUAL) ; sinon
   `_afMajAncre()` prend le relais avec ses portions (½ · 1 · 1½ · 2 · 3), qui sont vraies
   quelle que soit la portion de départ. Les deux ne s'affichent jamais ensemble.
   ⛔ ET ON NE RECALCULE PAS LES MACROS EN ARRIVANT (même raison qu'en ft-v984) : elles sont
   déjà justes, et la personne a pu les corriger à la main. Le recalcul part au premier
   changement de quantité, quand elle le demande. */
function quickFillFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  set('af-desc',it.name); set('af-kcal',it.kcal||0); set('af-prot',it.prot||0); set('af-carbs',it.carbs||0); set('af-fat',it.fat||0);
  /* La provenance dit ce que c'est : une REPRISE, ni une mesure ni une saisie fraîche. */
  if(typeof _afSetSrc==='function') _afSetSrc({saisie:'liste', origine:it.origine||'reprise',
    sourceId:it.sourceId||null, etat:it.etat||null, per100:it.per100||null,
    attendu:(typeof _afLuFormulaire==='function')?_afLuFormulaire():null});
  const row=document.getElementById('af-bc-row');
  const P=it.per100;
  if(P && (+P.kcal>0 || +P.prot>0 || +P.carbs>0 || +P.fat>0)){
    _bcNutr={ name:(it.name||'').slice(0,60), kcal100:+P.kcal||0,
              prot100:+P.prot||0, carbs100:+P.carbs||0, fat100:+P.fat||0 };
    const g=document.getElementById('af-bc-grams');
    /* ⚖️ ft-v1051 : PROPOSÉE, plus imposée — le champ reste vide, la pastille offre le rappel. */
    if(g) g.value='';
    if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+it.q>0 && (!it.u||it.u==='g')) ? +it.q : 0);
    const nm=document.getElementById('af-bc-name');
    if(nm) nm.textContent=_bcNutr.name+' · '+Math.round(_bcNutr.kcal100)+' kcal/100g (ta dernière saisie)';
    if(row) row.style.display='block';
    /* ⛔⛔ LA LIGNE VERTE DU TOTAL EST REMISE À JOUR — SINON ELLE PARLE DE L'ALIMENT PRÉCÉDENT
       (ft-v1042, vu à la capture). Le champ affichait « 150 » pendant que la ligne disait
       « pour tes 200 g : 700 kcal » : le total d'un aliment repris juste avant. *Aucun des deux
       nombres n'est faux — c'est leur voisinage muet qui trompe*, exactement le défaut que
       ft-v966 avait corrigé un cran plus haut, et qui revenait par un autre chemin.
       ⛔ ON NE L'AFFICHE QUE SI LA QUANTITÉ EST RÉELLEMENT CONNUE (R29) : sans `q`, le champ
       retombe à 100 par défaut, et annoncer « pour tes 100 g » serait inventer une portion. */
    /* ⛔⛔ AUCUN TOTAL TANT QUE LA QUANTITÉ N'EST PAS CHOISIE (ft-v1051). Vu à la mesure : le
       champ était vide et la ligne verte annonçait déjà « → pour tes 250 g : 150 kcal ». Elle
       décrivait la PROPOSITION, pas une décision — c'est-à-dire le « voisinage muet » de
       ft-v966 et ft-v1042, retrouvé une 3ᵉ fois par un chemin neuf. *Un total qui devance le
       choix de la personne se lit comme un fait sur son repas.* Il réapparaît dès qu'elle tape
       un poids ou tape la pastille (`_bcApplyGrams` le rappelle). */
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);
  }else{
    if(row) row.style.display='none';
    _bcQsrc(null);
    _bcNutr=null;
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);   // ⛔ pas de total orphelin
  }
  /* Se tait tout seul si un pour-100 g existe (`if(_bcNutr) → cacher`) : R2, un seul réglage
     de quantité visible à la fois. */
  if(typeof _afMajAncre==='function') _afMajAncre(true);   // reprise d'un aliment : la source change
  if(typeof _afNoteEtat==='function') _afNoteEtat(it.name||'');
  toast('Pré-rempli — ajuste la quantité si besoin, puis « Ajouter au journal » ✅','info');
}
function quickAddFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  if(!S.foodLog)S.foodLog=[];
  /* ⚠️ AJOUT DEPUIS LA LISTE (favori / récent) : la ligne est REPRISE d'une entrée précédente.
     `origine:'reprise'` le dit — ce n'est ni une mesure, ni une saisie fraîche, et surtout ça ne
     ment pas en héritant de la source d'origine, qu'on n'a pas conservée sur les favoris. */
  const _vals={kcal:it.kcal||0,prot:it.prot||0,carbs:it.carbs||0,fat:it.fat||0};
  _afSetSrc({saisie:'liste',origine:'reprise'});
  S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:(it.name||'').slice(0,80),ts:Date.now()},_vals,_provFood(_vals)));
  _afSetSrc(null);
  _unhideFood(it.name);
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeAddFood(); renderFoodJournal();
  try{ if(typeof renderNutrition==='function')renderNutrition(); }catch(e){}
  toast(_afToastAjout(),'success');
}
function toggleFavFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  if(!S.savedFoods)S.savedFoods=[];
  const key=(it.name||'').toLowerCase();
  const idx=S.savedFoods.findIndex(f=>(f.name||'').toLowerCase()===key);
  if(idx>=0){ S.savedFoods.splice(idx,1); toast('Retiré des favoris','info'); }
  /* ⛔ LE FAVORI GARDE SON POUR-100 G (ft-v1042) : sans ça, mettre une étoile FAISAIT PERDRE
     la quantité — l'aliment devenait moins réglable qu'avant d'être mis en favori. */
  else { S.savedFoods.push({name:it.name,kcal:it.kcal||0,prot:it.prot||0,carbs:it.carbs||0,fat:it.fat||0,
                            per100:it.per100||null,q:+it.q>0?+it.q:0,u:it.u||null}); toast('Ajouté aux favoris ⭐','success'); }
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  _renderFoodQuickList();
}
function _renderAfMealChips(){
  const el=document.getElementById('af-meal-chips');if(!el)return;
  el.innerHTML=FOOD_MEALS.map(m=>{
    const sel=m.k===_afMeal;
    /* ⚠️ 64 px ET NON 70 (03/09/2026) — mesuré, pas ajusté à l'œil : sur un écran de 390 px il
       reste 358 px utiles, et 5 puces à 70 px plus leurs écarts en demandent 374. Elles se
       cassaient donc en 4 + 1, ce qui faisait une bande de 114 px au lieu de 56 — supportable
       tant qu'elle défilait, permanent depuis qu'elle est fixe. À 64 px les cinq tiennent sur
       une ligne (344 px). ⛔ Sur les grands iPhone rien ne change : `flex:1` répartit toute la
       largeur, la valeur minimale n'est jamais atteinte. */
    return`<button onclick="setFoodMeal('${m.k}')" style="flex:1;min-width:64px;padding:9px 6px;border-radius:12px;border:1px solid ${sel?'var(--red)':'var(--sep)'};background:${sel?'rgba(255,45,85,.12)':'var(--bg2)'};color:${sel?'var(--red)':'var(--t2)'};font-size:12px;font-weight:${sel?700:500};cursor:pointer;font-family:var(--font);touch-action:manipulation;">${m.ic}<br>${m.lbl}</button>`;
  }).join('');
}
function setFoodMeal(k){_afMeal=k;_renderAfMealChips();}
/* 🍽️⛔⛔ LA CONFIRMATION DIT DANS QUEL REPAS L'ALIMENT EST TOMBÉ (03/09/2026) — c'est la
   seconde moitié de la phrase de Michel : « pareil quand on rentre un aliment, quel est le
   jour de la journée choisi ».
   ⛔ CE N'ÉTAIT PAS UN DÉTAIL D'ÉCRITURE, parce que le repas est le plus souvent DEVINÉ :
   `_afMeal` est pré-réglé sur l'heure (avant 11 h → Petit-déj). L'app annonçait donc
   « Ajouté au journal » sur un rangement qu'elle avait choisi seule, sans jamais le nommer —
   et l'erreur se découvrait plus tard, dans le Journal, sans qu'on sache d'où elle venait.
   *Une supposition qu'on ne montre pas est une décision prise à la place de la personne* (R29).
   ⭐⭐ ET LA RÈGLE EXISTAIT DÉJÀ — POUR UN SEUL DES TROIS CHEMINS (R8, la jumelle). « Tes repas
   habituels » (`rejouerRepas`) nomme le moment depuis ft-v1052, avec ce commentaire : *« sans
   ça, on ne peut pas vérifier d'un coup d'œil que le tap a bien porté là où on voulait »*. Les
   deux autres chemins d'ajout — la reprise d'un favori et le formulaire — disaient toujours
   « Ajouté au journal ». *Une règle écrite pour un chemin et pas pour ses jumeaux est une règle
   à moitié appliquée*, et c'est la 4ᵉ fois cette semaine.
   ⛔ UN SEUL PROPRIÉTAIRE (R2) : on réutilise `_foodMealInfo`, déjà l'unique lecteur de
   `FOOD_MEALS` — on ne refait pas un `find` à côté, sinon « Collation 2 » finirait par
   s'appeler autrement ici que dans les puces et dans le Journal.
   ⚠️ Et la distinction « aujourd'hui / jour consulté » est GARDÉE : elle protège d'un aliment
   noté sur le mauvais JOUR, ce que le nom du repas ne dit pas. */
function _afToastAjout(){
  const mi=(typeof _foodMealInfo==='function')?_foodMealInfo(_afMeal):null;
  const ou=(mi&&mi.lbl)?mi.lbl:'journal';
  return (_journalJourActif()===today()) ? ('Ajouté · '+ou+' 🍽️')
                                         : ('Ajouté · '+ou+', jour consulté 🍽️');
}
// ─── LECTURE ÉTIQUETTE NUTRITIONNELLE PAR PHOTO (IA vision) ──────────────────
// Redimensionne un fichier image en base64 JPEG (sans le préfixe data:) — assez net pour lire les chiffres.
function _resizeToB64(file, maxPx, quality){
  return new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const scale=Math.min(1, (maxPx||1100)/Math.max(img.width,img.height));
          const c=document.createElement('canvas');
          c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          res(c.toDataURL('image/jpeg', quality||0.85).split(',')[1]);
        }catch(err){rej(err);}
      };
      img.onerror=rej; img.src=e.target.result;
    };
    reader.onerror=rej; reader.readAsDataURL(file);
  });
}
function readFoodLabel(){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const inp=document.getElementById('af-label-input'); if(inp){inp.value='';inp.click();}
}
async function onFoodLabelFile(input){
  const f=input.files&&input.files[0]; if(!f)return;
  if(!S.premium&&(S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  toast('Lecture de l\'étiquette…','info');
  try{
    const b64=await _resizeToB64(f, 1100, 0.85);
    const r=await fetch(_aiUrl('foodLabel'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'foodLabel',image:{data:b64,type:'image/jpeg'},email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'){toast('Étiquette illisible — rapproche-toi, éclaire, ou saisis à la main','error');return;}
    _bcNutr={
      name:(d.name||'Produit').slice(0,60),
      /* ⚠️ LES CALORIES ÉTAIENT LE SEUL CHAMP ARRONDI ICI, alors que le serveur demande
         explicitement « garde 1 decimale si presente » : l'information était produite puis
         jetée à l'arrivée (R4, dans sa forme la plus pure). */
      kcal100:_per100d1(d.kcal100),
      prot100:_per100d1(d.prot100),
      carbs100:_per100d1(d.carbs100),
      fat100:_per100d1(d.fat100)
    };
    if(!_bcNutr.kcal100&&!_bcNutr.prot100&&!_bcNutr.carbs100&&!_bcNutr.fat100){toast('Valeurs non lues — réessaie ou saisis à la main','error');return;}
    const g=(parseFloat(d.serving)>0)?parseFloat(d.serving):100;
    const gramsEl=document.getElementById('af-bc-grams');if(gramsEl)gramsEl.value=g;
    _bcQsrc(g, 'l\'étiquette');       // ⛔ le nombre garde sa source écrite à côté (ft-v1105)
    const nameEl=document.getElementById('af-bc-name');if(nameEl)nameEl.textContent=_bcNutr.name+' · '+_bcNutr.kcal100+' kcal/100g (lu sur l\'étiquette)';
    const row=document.getElementById('af-bc-row');if(row)row.style.display='block';
    document.getElementById('af-desc').value=_bcNutr.name;
    _bcApplyGrams();
    _afSetSrc({saisie:'photo-ia',origine:'etiquette',
      per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
      attendu:_afLuFormulaire()});
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();if(typeof _renderAfAiNote==='function')_renderAfAiNote();}
    toast('Étiquette lue ✅ — ajuste la quantité','success');
  }catch(e){toast('Erreur : '+(e.message||e),'error');}
}
// ─── Photo du code-barres → l'IA lit les CHIFFRES → recherche produit (gratuite) ───
// Même logique que la lecture d'étiquette : 1 essai IA pour lire le numéro,
// puis la recherche produit + score santé sont gratuites (Open Food Facts).
function scanBarcodeIA(){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const inp=document.getElementById('af-bc-photo-input'); if(inp){inp.value='';inp.click();}
}
async function onBarcodePhotoIA(input){
  const f=input.files&&input.files[0]; if(!f)return;
  if(!S.premium&&(S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  toast('Lecture du code-barres…','info');
  try{
    const b64=await _resizeToB64(f, 1100, 0.85);
    const r=await fetch(_aiUrl('readBarcode'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'readBarcode',image:{data:b64,type:'image/jpeg'},email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'||!d.barcode){toast('Code-barres illisible — rapproche-toi, éclaire bien, ou tape les chiffres','error');return;}
    // L'IA a lu le numéro → décompte 1 essai (comme l'étiquette), la recherche produit reste gratuite
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();if(typeof _renderAfAiNote==='function')_renderAfAiNote();}
    const mi=document.getElementById('af-bc-manual');if(mi)mi.value=d.barcode;
    /* ⚠️ CE SONT DES CHIFFRES LUS PAR UN MODÈLE, PAS DÉCODÉS : aucune clé de contrôle n'a été
       vérifiée par le lecteur. On applique donc le même contrôle qu'à une saisie clavier —
       un « 8 » pris pour un « 6 » donnerait le produit de quelqu'un d'autre, en silence. */
    const _dout=(_eanValide(d.barcode)===false);
    if(_dout) toast('⚠️ Le numéro lu semble incomplet — vérifie bien le nom du produit trouvé','info');
    await _lookupBarcode(d.barcode, 'photo-code-ia', _dout);
  }catch(e){toast('Erreur : '+(e.message||e),'error');}
}
async function estimateFoodAI(){
  const desc=(document.getElementById('af-desc').value||'').trim();
  if(!desc){toast('Décris d\'abord ce que tu as mangé','error');return;}
  if(!S.url){toast('Connexion requise','error');return;}
  // Limite gratuit : ~1 semaine de notes IA. La saisie manuelle reste illimitée.
  if(!S.premium){
    if(window._premiumPending){toast('Vérification premium en cours…','info');return;}
    if((S.foodAiUses||0)>=FOOD_AI_FREE_LIMIT){showFoodWall();return;}
  }
  const btn=document.getElementById('af-ai-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Estimation…';}
  try{
    const r=await fetch(_aiUrl('estimateFood'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'estimateFood',description:desc,email:S.email||''})});
    const d=await r.json();
    if(!d||d.status!=='ok'){toast('Erreur IA : '+(d&&d.error||d&&d.message||'réessaie'),'error');return;}
    document.getElementById('af-kcal').value=d.kcal||0;
    document.getElementById('af-prot').value=d.prot||0;
    document.getElementById('af-carbs').value=d.carbs||0;
    document.getElementById('af-fat').value=d.fat||0;
    _afCoherence();        // une estimation IA incohérente se voit tout de suite
    if(d.name)document.getElementById('af-desc').value=d.name;
    /* ⚖️ LE POIDS QUE L'IA A SUPPOSÉ (ft-v975) — Michel : « je ne peux pas mettre de poids ».
       ⛔ Jamais inventé : `g` absent laisse `_afIaGrammes` à 0, et le bloc se rabat sur des
       portions plutôt que d'afficher un poids que personne n'a donné (R29). */
    window._afIaGrammes=(d.g>0&&d.g<=5000)?d.g:0;
    window._afIaDesc=(document.getElementById('af-desc')||{}).value||'';
    _afMajAncre(true);   // estimation IA : la source change
    // ⚠️ L'IA ne donne PAS de valeur au 100 g ni de quantité : elle rend un total estimé pour la
    //    phrase. On enregistre donc l'origine et rien d'autre — inventer un `per100` ici ferait
    //    passer une estimation pour une mesure (R29).
    _afSetSrc({saisie:'ia-texte',origine:'ia',attendu:_afLuFormulaire()});
    if(!S.premium){S.foodAiUses=(S.foodAiUses||0)+1;persist();if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();}
    _renderAfAiNote();
    toast('Estimé ✅ — ajuste si besoin','success');
  }catch(e){toast('Erreur réseau : '+e.message,'error');}
  finally{if(btn){btn.disabled=false;btn.textContent='🤖 Estimer les calories avec l\'IA';}}
}
/* ═══ 🔍 UN AUTRE COMPLÉMENT — identification, PAS un conseil (22/08/2026) ═════════════════
   Michel : « si tu veux, j'ai aussi les compléments alimentaires », après avoir fourni le
   registre officiel Compl'Alim (data.gouv.fr, 5 fichiers, 142 928 déclarations).
   ⛔⛔ APPROCHE VOLONTAIREMENT SIMPLIFIÉE, décidée avec Michel : *« je ne demande pas à ce que
   tout soit détaillé, mais peut-être simplifier l'approche »*. On ne garde QUE l'identification
   — nom, marque, catégorie déclarée. AUCUNE dose, AUCUNE mise en garde, AUCUNE composition :
   les afficher rapprocherait l'app du conseil sur des substances (seule la créatine a ce
   traitement aujourd'hui, avec des précautions écrites à la main et sourcées ANSES). C'est une
   fiche D'IDENTIFICATION — « est-ce le bon produit ? » — pas un moteur de recommandation.
   ⚠️ CE N'EST PAS UNE BASE NUTRITIONNELLE : Compl'Alim ne donne aucune valeur kcal/protéines/
   glucides/lipides (vérifié dans le fichier). Pour les valeurs nutritives d'un complément
   (whey, barre…), c'est Open Food Facts qu'il faut chercher — déjà branché (ft-v956).
   ⛔ ET CE N'EST QU'UNE RECHERCHE, PAS UN JOURNAL : rien n'est enregistré nulle part. Construire
   un suivi quotidien pour un complément arbitraire (dose, seuils, historique) est un tout autre
   chantier, non demandé — la créatine et la whey le font déjà pour ce qui est courant.
   ⛔⛔ CHARGÉE À LA DEMANDE, JAMAIS AU DÉMARRAGE — même règle que CIQUAL (règle d'or #4).
   ⚠️ SOURCE : Compl'Alim (déclarations officielles), data.gouv.fr. Licence à confirmer — la
   mention affichée le dit en l'état, sans citer un texte de licence que je n'ai pas pu vérifier
   depuis cette session (réseau bloqué). Conversion : `tools/complalim.py`. */
let _compl=null, _complEnCours=null, _complSuggTimer=null;
async function _complCharger(){
  if(_compl) return _compl;
  if(_complEnCours) return _complEnCours;
  _complEnCours=(async()=>{
    try{
      const r=await fetch('data/complalim.json',{headers:{'Accept':'application/json'}});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const d=await r.json();
      if(!d||!Array.isArray(d.a)) throw new Error('format');
      _compl=d; return d;
    }catch(e){ _complEnCours=null; return null; }   // jamais bloquant
  })();
  return _complEnCours;
}
/* Même logique que `_ciqualChercher` (R13) : tous les mots tapés doivent être présents, dans
   n'importe quel ordre. */
function _complChercher(q, max){
  if(!_compl) return [];
  const mots=_afNorm(q).split(/\s+/).filter(m=>m.length>1);
  if(!mots.length) return [];
  const out=[];
  for(const a of _compl.a){
    const n=_afNorm(a[0]+' '+(a[1]||''));
    // ⭐ R2 : même définition de « correspondre » que CIQUAL et que son journal (ft-v963).
    const r=_afRang(mots, n);
    if(!r) continue;
    out.push([r[0], r[1], a[0].length, a]);
    if(out.length>400) break;
  }
  out.sort((x,y)=> x[0]-y[0] || x[1]-y[1] || x[2]-y[2]);
  return out.slice(0, max||6).map(x=>x[3]);
}
function _complSuggRendu(liste){
  const el=document.getElementById('compl-sugg'); if(!el) return;
  if(!liste || !liste.length){ el.innerHTML=''; return; }
  let h='<div style="border:1px solid var(--sep);border-radius:12px;background:var(--bg2);overflow:hidden;">';
  liste.forEach(a=>{
    const cats=(a[2]||[]).join(' · ');
    h+='<div style="padding:9px 11px;border-bottom:1px solid var(--sep);">'
      +'<div style="font-size:13.5px;color:var(--t1);font-weight:600;">'+a[0]+'</div>'
      +(a[1]?'<div style="font-size:11.5px;color:var(--t3);">'+a[1]+'</div>':'')
      +(cats?'<div style="font-size:11px;color:var(--green);margin-top:2px;">'+cats+'</div>':'')
      +'</div>';
  });
  h+='<div style="font-size:10.5px;color:var(--t3);padding:6px 11px 8px;">Identification : Compl\'Alim — data.gouv.fr</div></div>';
  el.innerHTML=h;
}
function _complSuggInput(){
  const q=(document.getElementById('compl-desc')||{}).value||'';
  if(_afNorm(q).length<_AF_SUGG_MIN){ _complSuggRendu([]); return; }
  _complCharger().then(()=>{
    const enCours=(document.getElementById('compl-desc')||{}).value||'';
    if(_afNorm(enCours)!==_afNorm(q)) return;      // la frappe a continué : résultat périmé
    _complSuggRendu(_complChercher(q,6));
  });
}
/* ═══ 🥗 LA BASE CIQUAL — LES ALIMENTS GÉNÉRIQUES (22/08/2026) ════════════════════════════
   Michel a fourni `Table_Ciqual_2025_complete.xlsx` après ft-v956 : Open Food Facts ne rend que
   des PRODUITS DE MARQUE, jamais « banane » tout court. C'est la brique 1 du dossier nutrition.
   ⚠️ SOURCE : table Ciqual 2025, ANSES — Licence Ouverte / Etalab. La réutilisation est libre
   **à condition de citer la source** : la mention est affichée dans la liste, ce n'est pas
   optionnel. Conversion : `tools/ciqual.py` (les 4 formes de valeur y sont expliquées).
   ⛔⛔ CHARGÉE À LA DEMANDE, JAMAIS AU DÉMARRAGE — 250 Ko (68 Ko gzippés). La règle d'or #4 dit
   que l'app s'ouvre instantanément à la salle : elle n'attend aucune requête. Le fichier n'est
   demandé qu'à la PREMIÈRE frappe dans le champ d'aliment, puis gardé en mémoire.
   ⚠️ ET UN ÉCHEC N'EST JAMAIS BLOQUANT : hors ligne ou fichier absent, on garde les suggestions
   locales et Open Food Facts. La base est un PLUS, pas un pré-requis. */
let _ciqual=null, _ciqualEnCours=null;
async function _ciqualCharger(){
  if(_ciqual) return _ciqual;
  if(_ciqualEnCours) return _ciqualEnCours;           // une seule requête même si on tape vite
  _ciqualEnCours=(async()=>{
    try{
      const r=await fetch('data/ciqual.json',{headers:{'Accept':'application/json'}});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const d=await r.json();
      if(!d||!Array.isArray(d.a)) throw new Error('format');
      _ciqual=d; return d;
    }catch(e){ _ciqualEnCours=null; return null; }     // jamais bloquant
  })();
  return _ciqualEnCours;
}
/* ═══ ⛔⛔ LE PLURIEL — LE PLUS GROS TROU DE LA RECHERCHE (22/08/2026) ══════════════════════
   Michel : *« c'est comme j'ai cherché les pâtes, j'ai pas trouvé — enfin si, mais pas ce que je
   voulais trouver, et je n'ai plus la boîte pour le code-barre »*.
   ⚠️ **ET SA PROPRE EXPLICATION ÉTAIT FAUSSE** — il a ensuite pensé à l'accent (*« ah c'est pâtes
   et pas pates lol »*). **Vérifié : l'accent n'y est pour RIEN** — « pâtes » et « pates » rendent
   exactement la même liste depuis ft-v960 (`NFD` retire les accents). *Le croire aurait fermé le
   sujet sur un faux coupable, et le vrai serait resté* (R28 dans les deux sens).
   ⛔⛔ LE VRAI DÉFAUT, MESURÉ SUR TOUTE LA BASE : **CIQUAL nomme ses aliments au SINGULIER**
   (« Amande, grillée », « Lentille verte, sèche », « Tomate, crue »), et les gens tapent au
   **PLURIEL** — on mange « des amandes », pas « une amande ». Résultat : **97 % des 3 341 aliments
   sont inatteignables si on tape le pluriel**. Et ce n'est pas seulement « rien ne sort » : c'est
   pire, on tombe sur les PLATS composés qui, eux, emploient le pluriel — « amandes » rendait
   *Croissant aux amandes*, « lentilles » rendait *Soupe aux lentilles*. ⚠️ *Une recherche qui rend
   le mauvais aliment est plus coûteuse qu'une recherche vide : on l'enregistre sans se méfier.*
   ⛔ ET LA FORME DES PÂTES EST LE MÊME TROU, EN VOCABULAIRE : CIQUAL ne connaît que « Pâtes
   sèches, standard » — **penne, macaroni, coquillettes, fusilli, farfalle, rigatoni, conchiglie,
   linguine rendaient ZÉRO résultat**, et « spaghetti » rendait… **la courge spaghetti**. C'est
   très probablement ce que Michel a vu. ⚠️ Ce ne sont PAS des aliments différents : ce sont des
   formes de la même semoule de blé dur — on ne fabrique aucune valeur, on ouvre une porte vers
   celles de CIQUAL. La liste reste **courte et explicite** : elle dit une équivalence de forme,
   elle ne juge rien (R29).
   ⭐⭐ L'ORDRE DE PRÉFÉRENCE EST CE QUI ÉVITE LES DÉGÂTS, et il a fallu deux essais pour le
   trouver. Mon 1ᵉʳ jet retirait le « s » sans plus de façons : **« pâtes » rendait alors *Pâté
   breton*** (le « pate » dépluralisé) et **« pois » rendait *Poireau***. Deux régressions
   fabriquées en réparant. 👉 On classe donc : ① le nom **commence** par le mot · ② la forme
   **EXACTE** passe avant celle qu'on a dû déplurialiser ou traduire · ③ le nom le plus court.
   *Mesuré : 0 régression sur 50 requêtes courantes.*
   ⚠️ Le plafond de 400 reste tel quel : mesuré, il ne fausse qu'« eau » (*robinet* au lieu de
   *coco*), et les deux se valent — le relever changerait un résultat correct pour un autre. */
const _AF_FORMES_PATES=['spaghetti','penne','macaroni','coquillette','fusilli','farfalle',
  'rigatoni','conchiglie','linguine','linguini','tagliatelle','tortis'];
/* ⛔⛔ ET CES MOTS-LÀ NE S'ÉCRIVENT PAS (22/08/2026) — Michel, juste après : *« oui j'ai mis ça,
   après je voulais mettre coquilette »*. **Il l'écrit avec UN SEUL L**, et la liste ci-dessus a
   « coquillette » : sa graphie à lui ne trouvait donc RIEN. ⭐ Mesuré : 6 autres graphies
   plausibles échouaient aussi — *spagetti, tagliatele, farfale, fusili, linguini, pene*. Ce sont
   toutes des variantes de **consonne doublée** ou de **h muet**, c'est-à-dire exactement là où
   ces mots italiens se trompent. *Une liste de synonymes qui exige l'orthographe parfaite ne sert
   qu'à ceux qui n'en avaient pas besoin.*
   ⛔ LA TOLÉRANCE NE S'APPLIQUE QU'À CETTE LISTE FERMÉE DE 12 MOTS, jamais à la base : on compare
   la frappe aux 12 formes connues, donc aucun risque de rapprochement hasardeux sur 3 341 aliments.
   ⚠️⚠️ ET DEUX PIÈGES ONT ÉTÉ TROUVÉS EN LE MESURANT, pas en le relisant :
     ① Ma 1ʳᵉ version retirait aussi la **voyelle finale** — et « macaroni » devenait alors « macaron ».
        **La pâtisserie serait partie sur les pâtes.** Le retrait de la voyelle finale a donc sauté ;
        « linguini » (graphie anglaise) est simplement ajouté à la liste, ce qui est plus honnête
        qu'une règle qui rabote au hasard.
     ② **« torsade » est RETIRÉ de la liste** (**R30** — un retrait s'écrit) : CIQUAL l'emploie pour
        un **biscuit apéritif feuilleté**, et c'est un usage au moins aussi courant que la pâte.
        *Entre détourner un vrai aliment et rater une forme rare, on rate la forme rare.*
   ⭐ Vérifié sur les 2 261 mots distincts de CIQUAL : la seule collision restante est « spaghetti »
   (la COURGE), et elle est voulue — la courge garde sa correspondance EXACTE, donc elle reste
   trouvable ; on ajoute une porte, on n'en ferme aucune. */
function _afSqueeze(m){ return m.replace(/h/g,'').replace(/(.)\1+/g,'$1'); }
const _AF_FORMES_CLES=_AF_FORMES_PATES.map(_afSqueeze);
/* Un mot tapé peut atteindre un nom par 3 chemins, du plus sûr au moins sûr. Rend `null` si
   aucun ne marche, sinon le texte réellement trouvé + s'il a fallu approximer. */
function _afMotDansNom(m, n){
  if(n.indexOf(m)>=0) return {t:m, approx:0};
  const fin=m.slice(-1);
  const sg=(m.length>=4 && (fin==='s'||fin==='x')) ? m.slice(0,-1) : null;
  if(sg && n.indexOf(sg)>=0) return {t:sg, approx:1};
  if(n.indexOf('pates')>=0){
    for(const c of [m, sg]){
      if(!c) continue;
      if(_AF_FORMES_PATES.indexOf(c)>=0 || _AF_FORMES_CLES.indexOf(_afSqueeze(c))>=0)
        return {t:'pates', approx:1};
    }
  }
  return null;
}
/* ⭐ R2 — UN SEUL PROPRIÉTAIRE DE « CE QUE VEUT DIRE CHERCHER ». Les trois recherches (CIQUAL,
   les compléments, et son propre journal) avaient le même défaut ; elles le corrigent donc au
   même endroit, sinon la prochaine correction n'en réparerait qu'une et personne ne le verrait.
   Rend `null` si le nom ne correspond pas, sinon [commence-par, a-dû-approximer]. */
function _afRang(mots, n){
  let debut=1, approx=0;
  for(let i=0;i<mots.length;i++){
    const h=_afMotDansNom(mots[i], n);
    if(!h) return null;
    if(h.approx) approx=1;
    if(i===0 && n.indexOf(h.t)===0) debut=0;
  }
  return [debut, approx];
}
/* Recherche par nom. Les mots peuvent être dans le DÉSORDRE : « riz cuit » doit retrouver
   « Riz blanc, cuit, sans sel ajouté ». On exige que TOUS les mots tapés soient présents —
   sinon « riz complet » remonterait tous les riz et tous les pains complets. */
function _ciqualChercher(q, max){
  if(!_ciqual) return [];
  const mots=_afNorm(q).split(/\s+/).filter(m=>m.length>1);
  if(!mots.length) return [];
  const out=[];
  for(const a of _ciqual.a){
    /* ⛔ ON ÉCARTE LES ALIMENTS SANS CALORIES DÉTERMINÉES (143 sur 3 484). Dans CIQUAL, « - »
       veut dire « non déterminé », PAS zéro — et `tools/ciqual.py` le garde exprès à `null`
       plutôt que d'inventer un 0. Mais un aliment dont on ne connaît pas les calories ne peut
       pas servir un journal alimentaire : le proposer serait offrir une ligne qu'on ne peut
       pas enregistrer. C'est un RETRAIT DÉCIDÉ, donc écrit (R30) — la donnée reste dans le
       fichier, c'est l'affichage qui la filtre. */
    if(a[3]===null||a[3]===undefined) continue;
    const n=_afNorm(a[1]);
    const r=_afRang(mots, n);
    if(!r) continue;
    /* Un nom COURT qui commence par ce qu'on a tapé est presque toujours le bon : « Banane »
       avant « Banane plantain, crue, prélevée en Guadeloupe ». */
    out.push([r[0], r[1], n.length, a]);
    if(out.length>400) break;                          // on ne trie pas 3 484 lignes pour rien
  }
  out.sort((x,y)=> x[0]-y[0] || x[1]-y[1] || x[2]-y[2]);
  return out.slice(0, max||6).map(x=>x[3]);
}
/* ⭐ R2 : un aliment CIQUAL remplit le formulaire par le MÊME chemin que le code-barres et la
   recherche Open Food Facts — grammes, provenance, note d'état. Un 3ᵉ chemin de remplissage
   finirait par diverger des deux autres. */
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
/* ═══ 🔎 DES PROPOSITIONS QUAND ON TAPE UN ALIMENT (22/08/2026) ═══════════════════════════
   Michel, après son PREMIER vrai repas noté : *« pour rentrer les aliments il n'y a pas de choix
   de propositions donc je suis obligé de faire fonctionner l'IA »*.
   ⭐⭐ IL A RAISON, ET C'EST LE TROU N°1 DU DOSSIER NUTRITION. Le champ « à la main » était un
   texte VIDE : soit on connaît ses macros par cœur, soit on dépense une estimation IA — pour
   une banane. Le code-barres, lui, ne sert que si on a l'emballage sous la main.
   ⭐ DEUX SOURCES, ET AUCUNE INVENTÉE :
     ① CE QUE LA PERSONNE A DÉJÀ NOTÉ — instantané, hors ligne, ZÉRO invention : ce sont ses
        propres entrées, avec ses propres grammages. Au 3ᵉ jour, son petit-déjeuner se note en
        un tap. C'est aussi ce qui branche enfin la matière de « tes repas habituels ».
     ② LA RECHERCHE OPEN FOOD FACTS — l'app lui parle DÉJÀ pour les codes-barres : même serveur,
        gratuit, sans clé ni quota. De vraies valeurs, avec leur provenance enregistrée.
   ⛔ AUCUN APPEL IA N'EST CONSOMMÉ par ces deux chemins.
   ⛔ ET RIEN AU DÉMARRAGE : tout part d'une frappe, jamais de l'ouverture de l'app (règle d'or
      #4 — l'app doit s'ouvrir à la salle sans attendre le réseau).
   ⚠️ LIMITE ÉCRITE : Open Food Facts est une base de PRODUITS DE MARQUE. « Banane » y rend des
      bananes de marque, pas l'aliment générique — la base CIQUAL (3 484 aliments génériques)
      reste le bon outil pour ça, et elle n'est pas encore là. On ne fait pas semblant du
      contraire, et on n'invente surtout pas de valeurs génériques nous-mêmes (R29). */
let _afSuggTimer=null, _afSuggLoc=[], _afSuggOff=[], _afSuggCiq=[];
const _AF_SUGG_MIN=2;          // en dessous, tout matche : la liste serait du bruit
const _AF_SUGG_DELAI=450;      // on ne part pas au réseau à chaque lettre

// Normalisation légère : accents et casse ne doivent pas empêcher de retrouver « pâtes ».
/* \u26a0\ufe0f LE BUG DU \u00ab BLANC D'\u0152UF \u00bb (22/08/2026) \u2014 Michel tape \u00ab poulet \u00bb et ne trouve rien ; en
   creusant sur un produit d'\u0153uf liquide, le vrai coupable \u00e9tait le \u018e LIGATURE. `normalize('NFD')`
   d\u00e9compose les ACCENTS (\u00e9 \u2192 e + accent), mais PAS les ligatures \u0153/\u00e6 \u2014 ce sont deux lettres
   fusionn\u00e9es en UNE, pas une lettre accentu\u00e9e. Or le clavier iPhone en fran\u00e7ais CORRIGE
   AUTOMATIQUEMENT \u00ab oeuf \u00bb en \u00ab \u0153uf \u00bb pendant la frappe, et CIQUAL \u00e9crit tous ses noms en
   \u00ab oe \u00bb s\u00e9par\u00e9 (\u00ab Oeuf, blanc\u2026 \u00bb). R\u00e9sultat mesur\u00e9 : taper \u00ab \u0153uf \u00bb ou \u00ab b\u0153uf \u00bb \u2014 donc
   quasiment toujours, sur iPhone \u2014 rendait Z\u00c9RO r\u00e9sultat, alors que l'aliment existe. Le
   \u00ab poulet \u00bb de Michel n'avait rien \u00e0 voir (juste une version pas encore rafra\u00eechie), mais ce
   bug-l\u00e0 est r\u00e9el et touche bien plus de monde : \u0153uf, b\u0153uf, s\u0153ur, c\u0153ur, n\u0153ud, v\u0153u\u2026 */
/* \u26a0\ufe0f SUITE DU BUG DE LA LIGATURE (22/08/2026) \u2014 Michel : \u00ab faut aller voir aussi avec les
   accents, le E tr\u00e9ma, tous les caract\u00e8res sp\u00e9ciaux \u00bb. V\u00e9rifi\u00e9 SYST\u00c9MATIQUEMENT sur les deux
   bases (CIQUAL + Compl'Alim, ~132 000 noms) plut\u00f4t que de deviner :
     \u00b7 accents (\u00e9, \u00e8, \u00ea, \u00e0\u2026), TR\u00c9MA (\u00eb, \u00ef, \u00fc) et C\u00c9DILLE (\u00e7) \u2192 d\u00e9j\u00e0 corrects, NFD les d\u00e9compose
       tous en lettre + accent, et la ligne suivante les retire ;
     \u00b7 APOSTROPHE : le clavier iPhone convertit AUTOMATIQUEMENT l'apostrophe droite (') tap\u00e9e
       en apostrophe COURBE (') pendant la frappe. 238 aliments CIQUAL en portent une
       (\u00ab Soupe \u00e0 l'oignon \u00bb, \u00ab Saut\u00e9 d'agneau \u00bb\u2026) \u2014 mesur\u00e9 : \u00ab aujourd'hui \u00bb (droite, tap\u00e9e) et
       \u00ab aujourd'hui \u00bb (courbe, stock\u00e9e) ne se reconnaissaient PAS comme le m\u00eame mot. On la
       retire purement et simplement (elle ne porte aucun sens pour la recherche), avec ses
       variantes \u2018 \u00b4 ` rencontr\u00e9es dans les donn\u00e9es (parfois des coquilles d'origine, ex.
       \u00ab PROBIO\u00b4DIET \u00bb, \u00ab l'acide hyaluronique \u00bb). */
function _afNorm(t){
  return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\u0153/g,'oe').replace(/\u00e6/g,'ae')
    .replace(/['\u2019\u2018`\u00b4\u02bc]/g,'').trim();
}
/* ① CE QU'IL A DÉJÀ NOTÉ. Dédoublonné par nom, le plus RÉCENT gagne : si la quantité a changé,
   c'est la dernière qui reflète ce qu'il mange aujourd'hui. */
function _afSuggLocales(q){
  const n=_afNorm(q); if(n.length<_AF_SUGG_MIN) return [];
  /* ⭐ R2 (ft-v963) : son journal se cherche comme le reste — sinon il serait la SEULE des trois
     recherches à ne pas retrouver « amandes » dans son propre « Amande grillée ». */
  const mots=n.split(/\s+/).filter(m=>m.length>1);
  const vus=new Set(), out=[];
  (S.foodLog||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).forEach(e=>{
    if(!e||!e.name) return;
    const cle=_afNorm(e.name);
    if(vus.has(cle)) return;
    if(!mots.length ? cle.indexOf(n)<0 : !_afRang(mots, cle)) return;
    vus.add(cle);
    if(out.length<5) out.push(e);
  });
  return out;
}
/* ② LA RECHERCHE OPEN FOOD FACTS. Même serveur que le code-barres, gratuit et sans clé.
   ⚠️ On demande explicitement les champs utiles : sans `fields`, la réponse pèse des centaines
   de Ko par produit, sur la 4G de quelqu'un qui est à la salle. */
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
function _afSuggNom(p){
  return ((p.product_name_fr||p.product_name||p.generic_name_fr||p.generic_name||'Produit')
    +(p.brands?' ('+String(p.brands).split(',')[0].trim()+')':'')).slice(0,60);
}
function _afSuggKcal100(p){
  const n=p.nutriments||{};
  return Math.round(n['energy-kcal_100g']||(n['energy_100g']?n['energy_100g']/4.184:0)||0);
}
function _afSuggRendu(){
  const el=document.getElementById('af-sugg'); if(!el) return;
  if(!_afSuggLoc.length && !_afSuggCiq.length && !_afSuggOff.length){ el.innerHTML=''; return; }
  const ligne=(ic,titre,detail,onclick)=>
    '<button onclick="'+onclick+'" style="width:100%;text-align:left;display:flex;gap:9px;align-items:baseline;'
    +'padding:9px 11px;border:none;border-bottom:1px solid var(--sep);background:none;cursor:pointer;'
    +'font-family:var(--font);-webkit-tap-highlight-color:transparent;touch-action:manipulation;">'
    +'<span style="flex:none;font-size:14px;">'+ic+'</span>'
    +'<span style="flex:1;min-width:0;"><span style="display:block;font-size:13.5px;color:var(--t1);font-weight:600;'
    +'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+titre+'</span>'
    +'<span style="display:block;font-size:11.5px;color:var(--t3);">'+detail+'</span></span></button>';
  let h='<div style="border:1px solid var(--sep);border-radius:12px;background:var(--bg2);overflow:hidden;margin-bottom:10px;">';
  if(_afSuggLoc.length){
    h+='<div style="font-size:11px;color:var(--t3);padding:7px 11px 4px;font-weight:700;">DÉJÀ NOTÉ PAR TOI</div>';
    _afSuggLoc.forEach((e,i)=>{ h+=ligne('🕘', e.name,
      (e.kcal||0)+' kcal · P '+(e.prot||0)+' · G '+(e.carbs||0)+' · L '+(e.fat||0),
      '_afSuggPrendreLocale('+i+')'); });
  }
  /* ⭐ CIQUAL AVANT OPEN FOOD FACTS, et c'est un choix : quand on tape « banane », l'aliment
     GÉNÉRIQUE est presque toujours ce qu'on cherche — les bananes de marque viennent après. */
  if(_afSuggCiq.length){
    h+='<div style="font-size:11px;color:var(--t3);padding:7px 11px 4px;font-weight:700;">ALIMENTS (CIQUAL · ANSES)</div>';
    _afSuggCiq.forEach((a,i)=>{ h+=ligne('🥗', a[1],
      (a[3]||0)+' kcal/100 g · P '+(a[4]==null?'?':a[4])+' · G '+(a[5]==null?'?':a[5])+' · L '+(a[6]==null?'?':a[6]),
      '_afSuggPrendreCiqual('+i+')'); });
  }
  if(_afSuggOff.length){
    h+='<div style="font-size:11px;color:var(--t3);padding:7px 11px 4px;font-weight:700;">PRODUITS DE MARQUE (OPEN FOOD FACTS)</div>';
    _afSuggOff.forEach((p,i)=>{ h+=ligne('🔎', _afSuggNom(p),
      _afSuggKcal100(p)+' kcal/100 g', '_afSuggPrendreOff('+i+')'); });
  }
  /* ⚠️ LA MENTION DE LA SOURCE N'EST PAS DÉCORATIVE : la table Ciqual est publiée sous
     Licence Ouverte / Etalab, qui autorise la réutilisation À CONDITION de citer la source. */
  if(_afSuggCiq.length) h+='<div style="font-size:10.5px;color:var(--t3);padding:6px 11px 8px;line-height:1.4;">Données aliments : table Ciqual 2025 — ANSES</div>';
  el.innerHTML=h+'</div>';
}
function _afSuggVider(){ _afSuggLoc=[]; _afSuggOff=[]; _afSuggCiq=[]; _afSuggRendu(); }
/* Déclenché à la frappe. Les LOCALES sortent tout de suite (aucun réseau) ; la recherche
   distante attend une pause de frappe — sinon on interroge Open Food Facts à chaque lettre. */
function _afSuggInput(){
  const q=(document.getElementById('af-desc')||{}).value||'';
  _afSuggLoc=_afSuggLocales(q);
  _afSuggOff=[]; _afSuggCiq=[];
  _afSuggRendu();
  /* CIQUAL est LOCAL une fois chargé — donc pas de délai, mais le tout PREMIER accès doit
     aller chercher le fichier. On le déclenche ici et jamais au démarrage (règle d'or #4). */
  if(_afNorm(q).length>=_AF_SUGG_MIN){
    _ciqualCharger().then(()=>{
      const enCours=(document.getElementById('af-desc')||{}).value||'';
      if(_afNorm(enCours)!==_afNorm(q)) return;    // la frappe a continué : résultat périmé
      _afSuggCiq=_ciqualChercher(q,6); _afSuggRendu();
    });
  }
  if(_afSuggTimer) clearTimeout(_afSuggTimer);
  if(_afNorm(q).length<3) return;
  _afSuggTimer=setTimeout(async()=>{
    const enCours=(document.getElementById('af-desc')||{}).value||'';
    if(_afNorm(enCours)!==_afNorm(q)) return;      // la frappe a continué : ce résultat est périmé
    const res=await _offRechercher(q.trim());
    const apres=(document.getElementById('af-desc')||{}).value||'';
    if(_afNorm(apres)!==_afNorm(q)) return;        // ... et on re-vérifie APRÈS l'appel
    _afSuggOff=res; _afSuggRendu();
  }, _AF_SUGG_DELAI);
}
/* ① On reprend une entrée passée TELLE QUELLE : mêmes macros, même nom, même quantité.
   ⛔ La provenance dit `historique` et NON `utilisateur` : c'est la même personne, mais ce
   n'est pas une saisie neuve — sans ça, on ne pourrait plus distinguer ce qu'elle a tapé de
   ce qu'elle a re-cliqué (la brique 0 sépare exprès « comment c'est entré » et « d'où vient
   le chiffre »). */
function _afSuggPrendreLocale(i){
  const e=_afSuggLoc[i]; if(!e) return;
  document.getElementById('af-desc').value=e.name||'';
  document.getElementById('af-kcal').value=e.kcal||0;
  document.getElementById('af-prot').value=e.prot||0;
  document.getElementById('af-carbs').value=e.carbs||0;
  document.getElementById('af-fat').value=e.fat||0;
  _afCoherence();          // une ancienne entrée fausse se signale au moment où on la reprend
  /* ⚖️ LA QUANTITÉ SUIT L'ALIMENT QUAND ON LE REPREND (ft-v984)
     Michel, capture à l'appui : *« comment ça se fait que je ne peux pas mettre la quantité,
     sérieux c'est relou »*. **Reproduit dans un navigateur, pas déduit** : par le chemin
     CIQUAL, `blocQuantite: true`. Par le chemin de SON PROPRE JOURNAL — celui qu'il emprunte
     dès la 2ᵉ fois — `blocQuantite: false`, **alors que `per100` est bien là dans la source**.

     ⛔⛔ CETTE LIGNE CACHAIT LE BLOC SANS CONDITION, et transmettait `per100` juste en dessous.
     *L'information existait, et n'atteignait pas l'écran* — **R4**, à deux lignes d'écart.
     👉 Conséquence vécue : le mécanisme de ft-v962/965 marchait la PREMIÈRE fois qu'on note un
     aliment, et disparaissait toutes les suivantes. *Un défaut qui ne se voit qu'à la deuxième
     saisie, donc jamais en testant une fois.*

     ⭐ R13/R2 — ON NE RÉINVENTE RIEN : on reconstruit `_bcNutr` depuis le `per100` déjà
     enregistré, et le bloc `af-bc-row` fait le reste, exactement comme après un scan.
     ⛔ ET ON NE RECALCULE PAS LES MACROS EN ARRIVANT : elles sont déjà justes, et la personne a
     pu les corriger à la main après coup. Les réécrire effacerait sa correction sans le dire
     (R29). Le recalcul part au premier changement de quantité, quand elle le demande. */
  const row=document.getElementById('af-bc-row');
  const P=e.per100;
  if(P && (+P.kcal>0 || +P.prot>0 || +P.carbs>0 || +P.fat>0)){
    _bcNutr={ name:(e.name||'').slice(0,60), kcal100:+P.kcal||0,
              prot100:+P.prot||0, carbs100:+P.carbs||0, fat100:+P.fat||0 };
    const g=document.getElementById('af-bc-grams');
    /* ⚖️ ft-v1051 : la JUMELLE (R8) — le même correctif, sur le chemin « reprendre depuis le journal ». */
    if(g) g.value='';
    if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+e.q>0 && (!e.u||e.u==='g')) ? +e.q : 0);
    const nm=document.getElementById('af-bc-name');
    if(nm) nm.textContent=_bcNutr.name+' · '+Math.round(_bcNutr.kcal100)+' kcal/100g (ta dernière saisie)';
    if(row) row.style.display='block';
    /* ⛔⛔ LA LIGNE VERTE DU TOTAL EST REMISE À JOUR — SINON ELLE PARLE DE L'ALIMENT PRÉCÉDENT
       (ft-v1042, vu à la capture). Le champ affichait « 150 » pendant que la ligne disait
       « pour tes 200 g : 700 kcal » : le total d'un aliment repris juste avant. *Aucun des deux
       nombres n'est faux — c'est leur voisinage muet qui trompe*, exactement le défaut que
       ft-v966 avait corrigé un cran plus haut, et qui revenait par un autre chemin.
       ⛔ ON NE L'AFFICHE QUE SI LA QUANTITÉ EST RÉELLEMENT CONNUE (R29) : sans `q`, le champ
       retombe à 100 par défaut, et annoncer « pour tes 100 g » serait inventer une portion. */
    /* ⛔⛔ AUCUN TOTAL TANT QUE LA QUANTITÉ N'EST PAS CHOISIE (ft-v1051). Vu à la mesure : le
       champ était vide et la ligne verte annonçait déjà « → pour tes 250 g : 150 kcal ». Elle
       décrivait la PROPOSITION, pas une décision — c'est-à-dire le « voisinage muet » de
       ft-v966 et ft-v1042, retrouvé une 3ᵉ fois par un chemin neuf. *Un total qui devance le
       choix de la personne se lit comme un fait sur son repas.* Il réapparaît dès qu'elle tape
       un poids ou tape la pastille (`_bcApplyGrams` le rappelle). */
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);
  }else{
    if(row) row.style.display='none';
    _bcQsrc(null);
    _bcNutr=null;
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);   // ⛔ pas de total orphelin
  }
  _afSetSrc({saisie:'historique', origine:e.origine||'utilisateur',
             sourceId:e.sourceId||null, etat:e.etat||null, per100:e.per100||null,
             attendu:_afLuFormulaire()});
  /* ⚖️ SANS POUR-100 G, ON PROPOSE QUAND MÊME DE CHANGER LA QUANTITÉ (ft-v999+)
     Michel, deux captures à l'appui : « il y a toujours le bug sur des aliments que j'ai rentrés
     moi-même et que je veux réutiliser — comme je l'ai rentré avec le code-barre on ne peut plus
     remettre la quantité voulue. Ça fait pareil pour la ratatouille. »
     ⛔⛔ REPRODUIT AVANT DE CODER, et le cas est plus étroit qu'il n'y paraît : ft-v984 marche
     parfaitement quand le scan a rapporté un pour-100 g (mesuré : bloc affiché, « 129 kcal/100g
     (ta dernière saisie) »). Le trou est le cas où **Open Food Facts n'a PAS les valeurs /100 g**
     — fiche incomplète, très fréquent sur les produits de marque (« Steak haché … (U) », « Iso
     zero protein (ASL) »). La personne tape alors ses macros à la main, et l'entrée part avec
     `per100:null` ET `q:null`. À la reprise, la condition de ft-v984 ne peut pas être remplie.
     ⭐ R13/R2 — RIEN N'EST RÉINVENTÉ : `_afMajAncre()` sait DÉJÀ faire exactement ça depuis
     ft-v975 (rescale par PROPORTION, et à défaut d'ancre des portions ½ · 1 · 1½ · 2 · 3). Il
     était branché sur l'estimation IA et sur la saisie libre — pas ici. *Le mécanisme existait,
     posé d'un seul côté* : c'est le même oubli que ft-v973, ft-v975 et ft-v984, la 4ᵉ fois.
     ⛔ IL SE TAIT TOUT SEUL quand un pour-100 g existe (`if(_bcNutr) → cacher`), donc les deux
     mécanismes ne peuvent pas s'afficher ensemble (R2). Et il n'invente aucun poids (R29) :
     sans ancre il n'offre que des multiplicateurs, vrais quelle que soit la portion de départ. */
  /* ⚖️⛔⛔ LA QUANTITÉ DÉJÀ ENREGISTRÉE DOIT ATTEINDRE L'ÉCRAN (ft-v1104) — R4, à trois lignes
     du commentaire qui l'explique. Sans pour-100 g, `e.q` était **simplement laissé de côté** :
     il n'est lu que dans la branche `per100` juste au-dessus. Conséquence mesurée sur le cas de
     Michel — sa ligne « Iso zero protein » reprise depuis son journal revenait **sans aucune
     quantité à l'écran**, alors que l'entrée porte `q:30`.
     ⛔⛔ ET C'EST CE QUI FAISAIT LE « TOUJOURS LE MÊME SOUCI » : une estimation fausse notée une
     fois devient une SUGGESTION, reprise en un tap, et sans quantité affichée le garde-fou de
     masse n'avait rien à quoi comparer. *Une valeur fausse qui se recopie coûte plus cher que
     la valeur fausse d'origine — elle, au moins, ne se reproduit pas.*
     ⭐ R13 : rien n'est réinventé, on emprunte le mécanisme du poids déclaré (`_afPoidsDeclare`),
     et le libellé « que tu as indiqué » reste VRAI — elle l'a indiqué la fois d'avant.
     ⛔ Grammes seulement, et jamais par-dessus un pour-100 g (qui a déjà son propre champ). */
  if(!_bcNutr && +e.q>0 && (!e.u||e.u==='g')){
    _afUnite='g'; _afPoidsDeclare=+e.q;
  }
  if(typeof _afMajAncre==='function') _afMajAncre(true);   // reprise depuis le journal : la source change
  _afNoteEtat(e.name||'');
  _afSuggVider();
  toast('Repris de ton journal 👍','success');
}
/* ② Un résultat de recherche est un produit Open Food Facts comme un autre : il passe par le
   MÊME chemin que le code-barres (grammes, provenance, avertissement cru/cuit, score santé). */
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
function addFoodEntry(){
  const name=(document.getElementById('af-desc').value||'').trim();
  const kcal=parseInt(document.getElementById('af-kcal').value)||0;
  const prot=parseInt(document.getElementById('af-prot').value)||0;
  const carbs=parseInt(document.getElementById('af-carbs').value)||0;
  const fat=parseInt(document.getElementById('af-fat').value)||0;
  if(!name){toast('Donne un nom à l\'aliment','error');return;}
  if(!kcal&&!prot&&!carbs&&!fat){toast('Renseigne au moins les calories','error');return;}
  if(!S.foodLog)S.foodLog=[];
  S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:name.slice(0,80),kcal,prot,carbs,fat,ts:Date.now()},
    _provFood({kcal,prot,carbs,fat})));
  _afSetSrc(null);   // la provenance ne survit pas à l'enregistrement (R15 : le marqueur se pose et se rend)
  _unhideFood(name);
  persist();
  closeAddFood();
  renderFoodJournal();
  try{ if(typeof renderNutrition==='function')renderNutrition(); }catch(e){}   // la carte « Où tu en es » suit
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  toast(_afToastAjout(),'success');
}
function removeFoodEntry(ts){
  if(!S.foodLog)return;
  S.foodLog=S.foodLog.filter(e=>e.ts!==ts);
  persist();
  renderFoodJournal();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
}
// Demande confirmation avant de retirer un aliment du journal
function confirmRemoveFood(ts){
  const e=(S.foodLog||[]).find(x=>x.ts===ts);
  const nm=e?e.name:'cet aliment';
  const doit=()=>{ const ov=document.getElementById('ov-edit-food'); if(ov)ov.classList.remove('open'); removeFoodEntry(ts); toast('Aliment supprimé','info'); };
  if(typeof showConfirm==='function') showConfirm('Supprimer l\'aliment ?','« '+nm+' » sera retiré de ton journal.',doit,'Supprimer');
  else doit();
}
// ─── MODIFIER une entrée du journal (repas + nom + valeurs) ──────────────────
/* 📅 NAVIGUER DANS LE JOURNAL — voir et modifier un AUTRE jour (22/08/2026).
   Michel : « on ne sait pas ce que l'on a mangé dans la journée et on ne peut même pas le
   modifier de ce fait ». ⭐ VÉRIFIÉ AVANT DE CODER : le Journal était câblé en dur sur
   `today()`, sans aucune navigation — on ne pouvait ni VOIR ni MODIFIER un autre jour, ce qui
   est exactement ce qu'il décrit. ⛔ `null` = aujourd'hui (jamais figé en dur : le jour change
   tout seul à minuit). ⛔ ET ON NE VA JAMAIS DANS LE FUTUR : demain n'a encore rien à montrer,
   et y naviguer donnerait l'impression qu'on peut noter un repas à l'avance. */
let _journalJour=null;
/* 📋 L'ÉTAT PLIÉ/DÉPLIÉ DES SECTIONS DU JOURNAL (ft-v968) — il vit ICI et pas dans le DOM, parce
   que `renderFoodJournal()` reconstruit tout son HTML : sans mémoire, ajouter un aliment
   redéplierait tout ce que la personne vient de replier. ⛔ En mémoire seulement, pas dans
   `localStorage` : c'est un confort d'affichage, pas une donnée — le stockage a déjà saturé une
   fois (29/07) et on n'y écrit pas pour ça. */
let _journalReplie={};
function _journalPli(lbl,ouvert){ _journalReplie[lbl]=!ouvert; }
function _journalJourActif(){ return _journalJour || today(); }
/* 📅 UN SEUL POINT D'ENTRÉE POUR CHANGER DE JOUR (ft-v1004, R2). La bande des 7 jours et les
   flèches ‹ › mènent toutes les deux ici : deux façons de poser `_journalJour` finiraient par
   diverger (l'une oublierait la borne du futur, ou le re-rendu). */
function journalAllerA(ymd){
  if(!ymd || ymd>today()) return;                  // ⛔ jamais dans le futur
  _journalJour=(ymd===today())?null:ymd;
  renderFoodJournal();
}
function journalNav(dir){
  /* ⏰ MIDI, jamais minuit : une date lue à minuit bascule d'un jour selon le fuseau — famille
     « fuseaux horaires » de BUGS.md, qui a déjà fait rougir 6 fixtures le 23/08. */
  const d=new Date(_journalJourActif()+'T12:00:00');
  d.setDate(d.getDate()+dir);
  journalAllerA(d.toISOString().slice(0,10));
}
let _editFoodTs=null, _editFoodMeal='dejeuner';
/* ⚖️ MODIFIER LE POIDS D'UNE ENTRÉE (22/08/2026) — Michel, sur un « Oeuf cru » : « on ne peut
   pas modifier le poids ». VRAI : la modale ne montrait que les 4 macros brutes — pour ajuster
   une portion il fallait recalculer les 4 chiffres à la main.
   ⭐ R13 (enrichir l'existant) : `_bcApplyGrams()` fait déjà exactement ça à l'AJOUT (scan/CIQUAL/
   recherche). On ne réinvente rien, on branche la MÊME logique ici, sur `e.per100` — le pour-100g
   que `_provFood` enregistre déjà depuis ft-v907/956/957.
   ⛔ SEULEMENT SI `per100` EXISTE : une entrée tapée à la main (`per100:null`) n'a pas de « pour
   100 g » à partir duquel recalculer — la modale reste identique à avant pour elle (R29 : on ne
   invente pas un pour-100g qui n'existe pas). */
function openEditFood(ts){
  const e=(S.foodLog||[]).find(x=>x.ts===ts); if(!e)return;
  _editFoodTs=ts; _editFoodMeal=e.meal||'dejeuner';
  let ov=document.getElementById('ov-edit-food');
  if(!ov){ov=document.createElement('div');ov.id='ov-edit-food';ov.className='overlay';ov.style.zIndex='500';ov.onclick=ev=>{if(ev.target===ov)ov.classList.remove('open');};document.body.appendChild(ov);}
  const fld=(id,lbl,val)=>'<div><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">'+lbl+'</div><input id="'+id+'" type="number" inputmode="numeric" value="'+(val||0)+'" oninput="_efCoherence()" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);"></div>';
  /* ⚖️ LE CHAMP QUANTITÉ POUR TOUTES LES ENTRÉES (23/08/2026, ft-v972) — Michel, devant une ligne
     « 30g de protéines » : *« en fait on ne peut pas modifier le poids, je modifie le nom ça ne
     change pas la valeur. Il faut rajouter une ligne poids je pense, qui va modifier la valeur des
     calories et des autres lignes »*.
     ⭐ IL A RAISON, ET C'EST MA LIMITE DE ft-v962 QUI MORD : le champ n'apparaissait QUE si
     l'entrée portait un `per100` (scan, CIQUAL, recherche). Une ligne tapée à la main ou estimée
     par l'IA — donc **la sienne** — n'en a pas, et restait 4 chiffres à recalculer soi-même.
     ⭐⭐ LA SOLUTION NE DEMANDE AUCUN `per100` : on ne rescale pas depuis une composition, on
     rescale **par PROPORTION**. Si la ligne vaut X pour une quantité de référence Q, elle vaut
     X × (nouvelle/Q). *Il suffit de connaître Q, pas la composition pour 100 g.*
     👉 TROIS SOURCES POUR Q, DE LA PLUS SÛRE À LA MOINS SÛRE :
       ① `per100` connu → grammes absolus, comme avant (ft-v962, inchangé) ;
       ② `q` enregistré → c'est la quantité réellement saisie ;
       ③ ⭐ LE NOM LUI-MÊME — « 30g de protéines » porte son ancrage. On lit le nombre suivi de
          `g`/`ml`, et on s'en sert comme référence. *C'est là que Michel écrit déjà la quantité :
          on lit ce qu'il a mis au lieu de lui redemander.*
     ⛔ ET S'IL N'Y A AUCUN ANCRAGE, on ne devine pas un poids : on offre des **portions**
     (½ · 1½ · 2 ·…) qui multiplient les 4 macros sans jamais prétendre connaître des grammes.
     *Un « ×2 » est vrai quelle que soit la portion de départ ; un « 60 g » inventé serait faux.* */
  _efUnite='portion'; _efPoidsDeclare=0;   // remis à zéro à chaque ouverture (comme l'écran d'ajout)
  let gramsFld='<div id="ef-qty-row"></div>';
  const _mNom=String(e.name||'').match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  ov.innerHTML='<div class="modal" style="max-width:94vw;width:400px;padding:16px;">'
    +'<div style="font-weight:800;font-size:16px;color:var(--t1);margin-bottom:12px;">Modifier l\'aliment</div>'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Nom</div>'
    +'<input id="ef-name" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);margin-bottom:12px;">'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:6px;">Repas</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'+FOOD_MEALS.map(m=>'<button id="ef-meal-'+m.k+'" onclick="_setEditFoodMeal(\''+m.k+'\')" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;background:var(--bg3);color:var(--t2);">'+m.ic+'<br>'+m.lbl+'</button>').join('')+'</div>'
    +gramsFld
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">'+fld('ef-kcal','Calories (kcal)',e.kcal)+fld('ef-prot','Protéines (g)',e.prot)+fld('ef-carbs','Glucides (g)',e.carbs)+fld('ef-fat','Lipides (g)',e.fat)+'</div>'
    +'<div id="ef-coherence" style="display:none;font-size:12px;line-height:1.45;color:var(--orange);background:var(--bg3);border-radius:10px;padding:10px 11px;margin-bottom:14px;"></div>'
    +'<button class="btn btn-red" onclick="saveEditFood()" style="width:100%;padding:13px;font-size:15px;">✅ Enregistrer</button>'
    +'<button class="btn btn-bg2" onclick="confirmRemoveFood('+ts+')" style="width:100%;margin-top:8px;color:var(--red);">🗑 Supprimer</button>'
    +'<button class="btn btn-bg2" onclick="document.getElementById(\'ov-edit-food\').classList.remove(\'open\')" style="width:100%;margin-top:8px;">Annuler</button>'
    +'</div>';
  document.getElementById('ef-name').value=e.name||''; // évite tout souci d'échappement dans l'attribut
  _efQtyRender();                     // ⚖️ le bloc quantité, re-rendable tout seul (ft-v1064)
  _renderEditFoodMeals();
  /* ⛔⛔ L'ORDRE COMPTE DEPUIS ft-v1104, ET C'EST UNE RÉGRESSION QUE J'AI FABRIQUÉE : le contrôle
     ne lit désormais que des champs VISIBLES (un champ caché porte encore sa valeur), donc
     l'appeler AVANT `.open` revenait à mesurer un écran qui n'est pas encore affiché — la
     quantité tombait à 0 et l'alerte ne partait jamais. *On ne peut pas lire ce qui est à
     l'écran avant qu'il y soit.* On ouvre, PUIS on mesure. */
  ov.classList.add('open');
  _efCoherence();                     // l'incohérence se voit À L'OUVERTURE, sans rien toucher
}
function _setEditFoodMeal(k){_editFoodMeal=k;_renderEditFoodMeals();}
function _renderEditFoodMeals(){FOOD_MEALS.forEach(m=>{const b=document.getElementById('ef-meal-'+m.k);if(!b)return;const sel=m.k===_editFoodMeal;b.style.background=sel?'var(--red)':'var(--bg3)';b.style.color=sel?'#fff':'var(--t2)';});}
/* ⚖️ RESCALER PAR PROPORTION quand on n'a pas de pour-100 g (ft-v972). `_efRef` garde les valeurs
   de DÉPART et la quantité de référence : on multiplie par (nouvelle / référence).
   ⛔ On repart TOUJOURS de `base`, jamais des champs affichés — sinon deux réglages successifs
   s'empileraient (30 → 60 → 90 donnerait ×2 puis ×1,5 = ×3 au lieu de ×3… et l'erreur grandirait
   à chaque frappe, chiffre par chiffre pendant la saisie). */
let _efRef=null;
/* ⚖️ LE CHOIX DE L'UNITÉ DANS « MODIFIER L'ALIMENT » (ft-v1064) — Michel, capture à l'appui :
   *« quand j'ajoute il ne me donne que le choix de la quantité »*. Son écran n'offrait que des
   multiplicateurs (½ · 1 · 1½ · 2 · 3) et un cul-de-sac : *« Cette ligne n'a pas de quantité
   connue — on ne peut pas inventer un poids. Mets la quantité dans le nom. »*
   ⛔⛔ CETTE PHRASE EST, À DEUX MOTS PRÈS, CELLE QUE ft-v1056 A SUPPRIMÉE DE L'ÉCRAN D'AJOUT.
   Le même refus, le même jour, sur l'autre écran — **le correctif avait été posé d'un seul côté**
   (R8, la jumelle). *Demander à quelqu'un de réécrire le NOM de son aliment pour pouvoir en
   changer le poids, c'est lui faire faire le travail de l'app.*
   ⭐ R13 : rien n'est réinventé, c'est le mécanisme de `_afMajAncre` transposé — deux onglets, un
   seul champ actif à la fois, et une fois le poids déclaré on retombe EXACTEMENT sur le champ
   proportionnel qui existait déjà ici depuis ft-v972. */
let _efUnite='portion', _efPoidsDeclare=0;
function _efSetUnite(u){
  if(u===_efUnite) return;
  _efUnite=(u==='g')?'g':'portion';
  /* ⛔ On ne rescale RIEN en changeant d'unité : ça ne change pas ce qu'on a mangé, ça change la
     façon de le compter. (Même décision qu'en ft-v1056.) */
  _efPoidsDeclare=0; _efQtyRender();
}
function _efDeclarePoids(){
  const v=numFR((document.getElementById('ef-poids')||{}).value);
  if(!(v>0)) return;
  _efPoidsDeclare=v; _efQtyRender();
}
function _efQtyRender(){
  const el=document.getElementById('ef-qty-row'); if(!el) return;
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e){el.innerHTML='';return;}
  /* ⛔⛔ `base` VIENT DE L'ENTRÉE ENREGISTRÉE, JAMAIS DE L'ÉCRAN — c'est la leçon de ft-v1061,
     appliquée ici dès l'écriture : relire des champs déjà rescalés ferait de la référence une
     valeur dérivée d'elle-même, et l'erreur se figerait. */
  const base={kcal:e.kcal||0,prot:e.prot||0,carbs:e.carbs||0,fat:e.fat||0};
  const style='width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);';
  const mNom=String(e.name||'').match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  const ancre = e.per100 ? null
    : (e.q>0 ? {v:e.q,u:e.u||'g',src:'quantité enregistrée'}
    : (mNom ? {v:parseFloat(mNom[1].replace(',','.')),u:mNom[2].toLowerCase(),src:'lu dans le nom'} : null));
  if(e.per100){
    let g;
    if(e.q&&e.u==='g') g=Math.round(e.q);
    else if(e.per100.kcal>0) g=Math.round((e.kcal||0)/e.per100.kcal*100);
    else g=100;
    el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité (g) <span style="font-weight:400;">— recalcule les macros ci-dessous</span></div>'
      +'<input id="ef-grams" type="text" inputmode="decimal" step="any" value="'+g+'" oninput="_efApplyGrams()" style="'+style+'"></div>';
    return;
  }
  if(ancre && ancre.v>0){
    _efRef={base:base,q:ancre.v,u:ancre.u};   // ⛔ l'unité VOYAGE (ft-v1103) : 100 ml de miel pèsent ~140 g
    el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité ('+ancre.u+') <span style="font-weight:400;">— recalcule les macros ci-dessous</span></div>'
      +'<input id="ef-prop" type="text" inputmode="decimal" step="any" value="'+ancre.v+'" oninput="_efApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence '+ancre.src+' : '+ancre.v+' '+ancre.u+'. Les 4 valeurs suivent en proportion.</div></div>';
    return;
  }
  /* ⚖️ AUCUN ANCRAGE — on ne devine pas, ON DEMANDE (le correctif de ft-v1064). */
  const onglet=(u,l)=>'<button onclick="_efSetUnite(\''+u+'\')" style="flex:1;padding:7px 4px;border-radius:9px;border:1px solid '
    +(_efUnite===u?'var(--red)':'var(--sep)')+';background:'+(_efUnite===u?'var(--bg3)':'var(--bg2)')
    +';color:'+(_efUnite===u?'var(--t1)':'var(--t3)')+';font-size:12.5px;font-weight:'+(_efUnite===u?'800':'700')
    +';font-family:var(--font);cursor:pointer;touch-action:manipulation;" aria-pressed="'+(_efUnite===u?'true':'false')+'">'+l+'</button>';
  const choix='<div style="display:flex;gap:6px;margin-bottom:7px;">'+onglet('g','⚖️ En grammes')+onglet('portion','🍽️ En portions')+'</div>';
  let corps;
  if(_efUnite==='g'&&_efPoidsDeclare>0){
    _efRef={base:base,q:_efPoidsDeclare,u:'g'};   // l'onglet « ⚖️ En grammes » : c'est des grammes
    corps=choix
      +'<input id="ef-prop" type="text" inputmode="decimal" step="any" value="'+_efPoidsDeclare+'" oninput="_efApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+_efPoidsDeclare+' g (que tu as indiqué). Change ce nombre à chaque fois que la quantité change — les 4 valeurs suivent.</div>';
  }else if(_efUnite==='g'){
    _efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait
    /* ⛔ CHAMP VIDE, PAS PRÉ-REMPLI : un « 100 » proposé s'enregistrerait tel quel chez qui valide
       sans regarder — *un chiffre qu'on n'a pas choisi et qui s'enregistre est un chiffre faux
       présenté comme un fait* (R29). Tant que rien n'est indiqué, les 4 valeurs NE BOUGENT PAS. */
    corps=choix
      +'<input id="ef-poids" type="text" inputmode="decimal" step="any" placeholder="poids de cette portion" onchange="_efDeclarePoids()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Combien pèse ce que tu as noté ? <b>L\'app ne peut pas le deviner, toi si.</b> Indique-le une fois : les 4 valeurs se calent dessus.</div>';
  }else{
    _efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait
    const b=(x,l)=>'<button onclick="_efApplyPortion('+x+')" style="flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--sep);background:var(--bg2);color:var(--t2);font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;touch-action:manipulation;">'+l+'</button>';
    corps=choix+'<div style="display:flex;gap:6px;">'+[0.5,1,1.5,2,3].map(x=>b(x,_portionLbl(x))).join('')+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Les 4 valeurs ci-dessous sont <b>une portion</b>. Tu connais le poids ? Passe en <b>⚖️ grammes</b> et indique-le.</div>';
  }
  el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'+corps+'</div>';
}
function _efProp(f){
  if(!_efRef) return;
  const b=_efRef.base;
  const P=(id,v)=>{const el=document.getElementById(id);if(el)el.value=Math.round(v);};
  P('ef-kcal',b.kcal*f); P('ef-prot',b.prot*f); P('ef-carbs',b.carbs*f); P('ef-fat',b.fat*f);
  _efCoherence();
}
function _efApplyProp(){
  if(!_efRef) return;
  /* ⛔ AVANT ft-v1067 : `if(!(v>0)) return;` — le champ vidé laissait des valeurs ORPHELINES à
     l'écran, exactement le défaut corrigé sur l'écran d'ajout en ft-v1061. La jumelle vivait ici
     depuis ce matin. Elle ne peut plus diverger : les deux passent par `_qtyRescale`. */
  _qtyRescale('ef', _efRef.base, _efRef.q, (document.getElementById('ef-prop')||{}).value);
}
function _efApplyPortion(x){ _efProp(x); }
/* ⛔⛔ LES CALORIES DOIVENT COLLER À LEURS PROPRES MACROS (ft-v972) — Michel, devant une ligne
   « 30g de protéines » à **1117 kcal** pour 26 P · 1 G · 1 L : *« putain je ne l'avais même pas vu,
   j'étais axé sur les calories »*. **4×26 + 4×1 + 9×1 = 117.** Il y a un « 1 » de trop, et cette
   seule ligne gonflait sa journée de **1 000 kcal**.
   ⚠️ ON NE SAIT PAS D'OÙ VIENT LE 1117 — frappe, ou estimation IA. *Et c'est justement pour ça
   que le contrôle doit exister* : il attrape les deux, sans avoir à trancher lequel.
   ⛔ ON NE CORRIGE JAMAIS TOUT SEUL : on montre l'écart et on propose. Réécrire un chiffre que la
   personne a saisi, c'est décider à sa place (**R29**) — et l'app peut se tromper (aliment très
   alcoolisé, fibres, polyols : l'alcool fait 7 kcal/g et n'a pas de champ ici).
   ⚠️ LE SEUIL EST LARGE EXPRÈS (25 % ET 60 kcal d'écart) : un contrôle qui crie pour un arrondi
   finit désactivé (**R19**). Ici l'écart est de 855 %. */
/* ⭐ R2 — UNE SEULE DÉFINITION DE « CES CALORIES SONT IMPOSSIBLES ». Le contrôle sert la modale de
   MODIFICATION (`ef-*`) et le formulaire d'AJOUT (`af-*`) : deux copies finiraient par ne plus
   avoir le même seuil, et on ne saurait plus lequel croire. `pfx` est le seul paramètre. */
/* ⛔⛔ L'ALCOOL FAIT 7 kcal/g ET N'A AUCUN CHAMP ICI (23/08/2026) — trouvé en testant les cas
   limites sur l'étiquette réelle de Michel, pas après coup : une bière (215 kcal pour 1,5 P /
   15 G / 0 L) affiche **69 % d'écart**, un verre de vin **87 %**. Ce sont de VRAIES valeurs, et
   l'alerte serait fausse à chaque fois.
   ⭐ *Un garde-fou qui se trompe sur la bière ne survit pas au premier apéro* (**R19**).
   ⚠️ LA LISTE EST COURTE ET EXPLICITE, et elle ne fait que SE TAIRE : elle n'invente aucune
   valeur, ne corrige rien, et un aliment mal nommé retombe simplement dans le cas général. */
const _KCAL_ALCOOL=/\b(bi[eè]re|vin\b|ros[eé]\b|champagne|cidre|whisky|vodka|rhum|gin\b|t[eé]quila|punch|mojito|ap[eé]ritif|ap[eé]ro|alcool|liqueur|porto|pastis|cocktail|spritz|sangria|kir\b|calvados|cognac|armagnac|hydromel|saké|sake)\b/i;
/* ⚖️⛔⛔ LES MACROS NE PEUVENT PAS PESER PLUS QUE LA PORTION (ft-v1103)
   Michel, capture à l'appui, sur une ligne « Iso zero protein (ASL) » : *« encore le souci avec
   la prot »*. **35 g de protéines + 1 g de glucides + 1 g de lipides = 37 g de matière dans une
   portion de 30 g.** C'est impossible — la masse ne se crée pas.

   ⛔⛔ ET LE CONTRÔLE QUI EXISTAIT NE POUVAIT PAS LE VOIR, sans être en faute : `_coherenceKcal`
   compare les **calories aux macros**, et ici elles collent parfaitement (4×35 + 4×1 + 9×1 = 153
   contre 156 affichées, soit 2 % d'écart). *Une valeur inventée peut être parfaitement cohérente
   avec elle-même* — c'est exactement la famille §34 de `BUGS.md`. Il manquait la **seconde**
   question : est-ce que ça TIENT dans la portion ?

   ⭐ REPRODUIT PAR LE VRAI CHEMIN avant d'écrire une ligne (§12quater — on ne déduit pas une
   cause d'un seul nombre) : la réponse du modèle entre telle quelle dans `S.foodLog`, sans une
   alerte. Une réponse à 150 P / 80 G / 70 L pour 100 g y entrait aussi — **300 g dans 100 g**.

   ⛔ SEULEMENT EN GRAMMES, et ce n'est pas un détail : 100 ml de miel pèsent ~140 g et portent
   ~116 g de glucides. Appliquer la règle aux millilitres ferait hurler l'app sur un sirop, un
   miel ou une huile — *un garde-fou qui se trompe sur le miel ne survit pas au petit-déjeuner*
   (R19, la leçon de la bière du contrôle voisin).

   ⛔ LA TOLÉRANCE EST DÉRIVÉE, PAS INVENTÉE (R29) : les quatre champs sont arrondis à l'entier
   (`Math.round` dans les deux rescalers), donc chacune des 3 macros peut être gonflée de moins
   de 0,5 g et la quantité rabotée d'autant — **2 g au pire**, et rien de plus. Mesuré : une
   huile (10 g pour 10 g de lipides) et du sucre (20 g pour 20 g de glucides) restent muettes,
   alors qu'elles sont à 100 % d'une seule macro. *La limite physique est l'égalité, pas un
   pourcentage qu'il faudrait choisir.*

   ⛔⛔ ET AUCUN BOUTON DE CORRECTION, CONTRAIREMENT AU CONTRÔLE DES CALORIES — c'est une
   décision, pas un oubli. Quand les calories ne collent pas, la valeur juste **se calcule**.
   Ici, l'app sait que l'un des deux est faux et **ne sait pas lequel** : soit la portion, soit
   les macros. Chez Michel c'est la portion qui est JUSTE (un dosette de 30 g d'isolat porte
   ~26 g de protéines) et les macros qui sont fausses — un bouton « mettre 37 g » aurait donc
   aggravé sa ligne au lieu de la réparer. *On montre, la personne tranche* (R29). */
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
/* ⭐ R2 — UNE SEULE DÉFINITION DE « CES MACROS NE TIENNENT PAS DANS CETTE PORTION », lue par
   l'estimation IA, le formulaire d'ajout et la modale de modification. Rend `null` quand il n'y
   a rien à dire : « je ne sais pas » est une réponse valide (R29). */
function _masseImpossible(pfx){
  const q=_qtyGrammesEcran(pfx); if(!(q>0)) return null;
  const lu=id=>numFR((document.getElementById(pfx+'-'+id)||{}).value)||0;
  return _masseImpossibleVals(q, lu('prot'), lu('carbs'), lu('fat'));
}
/* ⛔⛔ LA RÈGLE PHYSIQUE, SUR DES VALEURS ET NON SUR DES CHAMPS (ft-v1110, R2).
   Extraite telle quelle de `_masseImpossible` — pas une ligne de logique n'est changée — parce
   que le calibrage à la main a besoin de la MÊME règle sur des nombres qui ne sont pas encore
   dans les champs du formulaire. *Deux écritures de « ça ne tient pas dans la portion »
   auraient fini avec deux tolérances, et on ne saurait plus laquelle croire.* */
function _masseImpossibleVals(q, prot, carbs, fat){
  if(!(q>0)) return null;
  const somme=(+prot||0)+(+carbs||0)+(+fat||0);
  if(!(somme>0) || somme<=q+2) return null;      // +2 g : l'arrondi des 4 champs, rien de plus
  return {q:q, somme:Math.round(somme*10)/10};
}
function _coherenceKcal(pfx, corrigeur){
  const el=document.getElementById(pfx+'-coherence'); if(!el) return;
  const g=id=>numFR((document.getElementById(pfx+'-'+id)||{}).value)||0;
  const nom=String((document.getElementById(pfx+'-'+(pfx==='af'?'desc':'name'))||{}).value||'');
  const kcal=g('kcal'), theo=4*g('prot')+4*g('carbs')+9*g('fat');
  const ecart=Math.abs(kcal-theo);
  /* ⚖️ LA MASSE D'ABORD (ft-v1103) : quand les macros ne tiennent pas dans la portion, c'est le
     défaut le plus grave des deux — les calories peuvent coller parfaitement à des macros
     impossibles, et c'est précisément ce qui est arrivé (156 kcal pour 153 théoriques). */
  const masse=_masseImpossible(pfx);
  if(masse){
    el.innerHTML='⚠️ <b>'+masse.somme+' g</b> de protéines, glucides et lipides ne tiennent pas dans '
      +'<b>'+masse.q+' g</b>. Un aliment ne peut pas contenir plus de matière qu\'il ne pèse.'
      +'<div style="color:var(--t3);margin-top:6px;">Soit la quantité, soit une des trois valeurs '
      +'est à revoir — <b>l\'app ne peut pas savoir laquelle</b>, elle ne touche à rien.</div>';
    el.style.display='block'; return;
  }
  if(!(kcal>0) || !(theo>0) || ecart<60 || ecart/Math.max(kcal,theo)<0.25
     || (kcal>theo && _KCAL_ALCOOL.test(nom))){   // ⛔ calories « en trop » sur une boisson alcoolisée : normal
    el.style.display='none'; el.innerHTML=''; return;
  }
  el.innerHTML='⚠️ <b>'+Math.round(kcal)+' kcal</b> ne colle pas à ces macros : '
    +g('prot')+' g de protéines, '+g('carbs')+' g de glucides et '+g('fat')+' g de lipides '
    +'donnent <b>'+Math.round(theo)+' kcal</b>. '
    +'<button onclick="'+corrigeur+'('+Math.round(theo)+')" style="margin-top:6px;display:block;padding:7px 12px;border-radius:9px;border:1px solid var(--sep);background:var(--bg3);color:var(--t1);font-size:12.5px;font-weight:700;font-family:var(--font);cursor:pointer;">Mettre '+Math.round(theo)+' kcal</button>';
  el.style.display='block';
}
function _efCoherence(){ _coherenceKcal('ef','_efCorrigerKcal'); }
function _efCorrigerKcal(v){
  const el=document.getElementById('ef-kcal'); if(el)el.value=v;
  if(_efRef)_efRef.base.kcal=v;            // la référence suit, sinon un rescale la ferait revenir
  _efCoherence();
}
/* ⛔⛔ ET EN DIRECT À LA SAISIE (ft-v972) — Michel : *« et en direct, pas au moment de
   l'enregistrer »*. Attraper le chiffre pendant qu'il est encore sous les yeux vaut mieux que de
   le retrouver le lendemain : sa journée était déjà faussée de 1 000 kcal quand il l'a vu. */
function _afCoherence(){ _coherenceKcal('af','_afCorrigerKcal'); }

/* ⚖️ LA QUANTITÉ À L'AJOUT, PAS SEULEMENT À LA MODIFICATION (23/08/2026, ft-v975)
   Michel, devant une huile d'olive estimée par l'IA : *« je ne peux pas mettre de poids »*.

   ⛔⛔ ET C'EST EXACTEMENT LE MOTIF DE ft-v973 : le mécanisme EXISTAIT, posé d'un seul côté.
   ft-v972 a donné le rescale par proportion à la modale « Modifier l'aliment » ; le formulaire
   d'AJOUT, lui, n'a de champ « Quantité » que si un `per100` est connu (scan, CIQUAL, recherche).
   Une phrase estimée par l'IA n'en a pas — donc aucun réglage, et 4 chiffres à recalculer à la
   main. *Une correction faite d'un côté et pas de l'autre est un oubli, pas un arbitrage* (R8).

   👉 TROIS SOURCES POUR LA RÉFÉRENCE, DE LA PLUS SÛRE À LA MOINS SÛRE :
     ① `per100` connu → grammes absolus (`af-bc-row`, ft-v965/966, inchangé) ;
     ② ⭐ LE POIDS QUE L'IA A SUPPOSÉ (`g`, ft-v975) — le modèle choisissait une portion en
        SILENCE ; il l'annonce désormais, et une estimation aveugle devient une estimation
        ANCRÉE. C'est ça qui rend la case « poids » possible sur une phrase libre ;
     ③ le nombre écrit dans la phrase (« 20 g d'huile d'olive »).
   ⛔ ET SANS AUCUN ANCRAGE, on n'invente pas un poids : des **portions** (½ · 1½ · ×2 · ×3),
   vraies quelle que soit la portion de départ. *Un « ×2 » est juste ; un « 60 g » deviné est faux.*

   ⚠️ LE POIDS DE L'IA RESTE UNE ESTIMATION, ET C'EST ÉCRIT À L'ÉCRAN (R32/R29) : on ne le
   présente pas comme une mesure, on dit d'où il vient. La personne le corrige, tout suit. */
let _afRef=null;          // {base:{kcal,prot,carbs,fat}, q, u, src}
function _afPropSetBase(){
  const n=id=>parseInt((document.getElementById(id)||{}).value)||0;
  return {kcal:n('af-kcal'),prot:n('af-prot'),carbs:n('af-carbs'),fat:n('af-fat')};
}
/* ⛔ On repart TOUJOURS de `base`, jamais des champs affichés — sinon deux réglages successifs
   s'empileraient, et l'erreur grandirait à chaque frappe (même piège qu'en ft-v972). */
function _afProp(f){
  if(!_afRef) return;
  const b=_afRef.base;
  const P=(id,v)=>{const el=document.getElementById(id);if(el)el.value=Math.round(v);};
  P('af-kcal',b.kcal*f); P('af-prot',b.prot*f); P('af-carbs',b.carbs*f); P('af-fat',b.fat*f);
  _afCoherence();
}
function _afApplyProp(){
  if(!_afRef) return;
  _qtyRescale('af', _afRef.base, _afRef.q, (document.getElementById('af-prop')||{}).value);
}

function _afApplyPortion(x){ _afProp(x); }
/* ⚖️ LE CHOIX DE L'UNITÉ (ft-v1051) — Michel, capture à l'appui : *« toujours ce problème de
   quantité, il faut que je puisse mettre les grammes »*, puis la précision qui a décidé de la
   forme : *« je ne prends pas toujours le même poids… tu prends la ratatouille, il y a
   différentes boîtes de différent poids »*.

   ⛔⛔ CE QUI BLOQUAIT N'ÉTAIT PAS UN MANQUE DE MÉCANISME, C'ÉTAIT UN REFUS. `_afMajAncre`
   IMPOSAIT l'un ou l'autre : champ en grammes si un poids était connu (phrase ou IA), portions
   sinon, avec un message de cul-de-sac — *« on ne peut pas inventer un poids »*. C'est vrai, et
   c'est à côté de la question : **l'app** ne peut pas l'inventer, **la personne** le connaît.
   *Il fallait le lui DEMANDER, pas refuser* (R29 : quand l'app ne sait pas, elle montre ce
   qu'elle a et laisse trancher).

   ⭐⭐ ET RIEN N'EST RÉINVENTÉ (R13) : le bloc « portion » posait DÉJÀ `_afRef={q:1}`, donc un
   « ×2 » est déjà un rescale de facteur 2/1. Grammes et portions sont **le même calcul avec une
   référence différente** — l'unité n'est qu'une étiquette. Un seul champ, un seul propriétaire
   de la quantité (R2) : on n'affiche jamais deux réglages concurrents.

   ⛔ CE QUI EST RETENU EST LE POUR-100 g, JAMAIS LA QUANTITÉ. 100 g de ratatouille est stable ;
   la boîte, non. Retenir « 250 g » comme si c'était l'aliment ferait re-servir la boîte d'hier. */
let _afUnite='portion';        // 'portion' | 'g' — CHOISI par la personne, jamais imposé
let _afPoidsDeclare=0;         // le poids qu'elle a indiqué pour la portion affichée (g)
function _afResetUnite(){ _afUnite='portion'; _afPoidsDeclare=0; }
function _afSetUnite(u){
  if(u===_afUnite) return;
  _afUnite=(u==='g')?'g':'portion';
  /* ⛔ ON NE RESCALE RIEN EN CHANGEANT D'UNITÉ. Basculer de « portion » à « g » ne change pas
     ce qu'on a mangé — ça change la façon de le COMPTER. Les 4 valeurs affichées deviennent la
     nouvelle référence, quelle qu'elle soit. */
  _afPoidsDeclare=0;
  _afMajAncre();
}
function _afDeclarePoids(){
  const v=numFR((document.getElementById('af-poids')||{}).value);
  if(!(v>0)) return;
  _afPoidsDeclare=v;
  _afMajAncre();               // le bloc bascule dans son état « ancré », comme un poids lu
}
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
/* Décide de la source et (re)construit le bloc. ⚠️ Appelée seulement quand la SOURCE des valeurs
   change — estimation IA, ou sortie d'un champ (`onchange`, donc au blur). Jamais à chaque frappe :
   reconstruire le bloc pendant qu'on tape dedans ferait perdre le curseur. */
function _afMajAncre(srcChange){
  const el=document.getElementById('af-prop-row'); if(!el) return;
  if(_bcNutr){ _afPropCacher(); return; }          // ① un pour-100 g est connu : `af-bc-row` s'en charge
  /* ⛔⛔ ON NE RELIT L'ÉCRAN QUE SI LA SOURCE A CHANGÉ (ft-v1061) — c'est LE correctif.
     L'en-tête juste au-dessus le dit depuis toujours : *« appelée seulement quand la SOURCE des
     valeurs change »*. C'était vrai des intentions, pas du code : la fonction relisait les 4
     champs à CHAQUE appel, y compris quand elle était rappelée pour une simple reconstruction
     (changement d'unité, déclaration de poids). Or après un rescale, ces champs ne portent plus
     `base` — ils portent `base × facteur`. La référence redevenait donc une valeur dérivée
     d'elle-même, et l'erreur se figeait.
     👉 `srcChange` distingue les deux : **vrai** quand les valeurs viennent d'ailleurs (estimation
     IA, reprise d'un aliment, macro corrigée à la main) → on relit ; **faux/absent** quand on ne
     fait que redessiner → `base` est PRÉSERVÉE. */
  const base=(srcChange||!_afRef||!_afRef.base)?_afPropSetBase():_afRef.base;
  /* ⛔ « Y A-T-IL QUELQUE CHOSE À RESCALER ? » SE MESURE SUR LES QUATRE, PAS SUR LES CALORIES.
     Trouvé à la mesure (ft-v1065) : le garde testait `base.kcal>0`, donc mettre les calories à 0
     faisait DISPARAÎTRE tout le bloc quantité — alors que 35 g de protéines restaient à l'écran,
     parfaitement rescalables. Ça touche les cas réels (une boisson zéro, un aliment dont on ne
     connaît que les protéines) et surtout la frappe : on efface les calories pour les retaper,
     et le réglage de quantité s'évapore sous les doigts. *Un proxy commode — les calories pour
     « il y a des valeurs » — devient faux dès qu'une valeur légitime vaut zéro.* */
  if(!(base.kcal>0||base.prot>0||base.carbs>0||base.fat>0)){ _afPropCacher(); return; }   // rien à rescaler tant qu'AUCUNE valeur n'est posée
  /* ⛔⛔ L'INVARIANT DE TOUT CE BLOC (ft-v1061) : `_afRef.base` sont TOUJOURS les valeurs de
     `_afRef.q`. Or `base` vient d'être RELU À L'ÉCRAN — et l'écran, après un rescale, montre les
     valeurs de la quantité TAPÉE, pas celles de l'ancienne référence.
     👉 **La seule quantité à laquelle on a le droit d'appairer ces valeurs est celle AFFICHÉE.**
     Sans ça, `base` et `q` se désappairent, et tout le reste est faux d'un facteur constant —
     silencieusement, avec des nombres parfaitement crédibles. Mesuré sur l'étiquette de Michel :
     référence 30 g, il tape 40 (→ 156 kcal, juste), un geste rappelle `_afMajAncre` (toucher une
     macro, ou un aller-retour d'unité), `base` devient 156 pendant que `q` reste 30 — et 40 g
     affiche alors **208 kcal / 47 g** au lieu de 156 / 35, soit **1,33× son étiquette**.
     ⭐ C'est mot pour mot la leçon déjà écrite dans `_provFood` en ft-v1056 : *les valeurs
     affichées et la quantité affichée vont toujours ensemble — c'est le seul couple sur lequel on
     peut diviser sans se tromper.* Elle était posée d'un seul côté (R8, la jumelle). */
  const qAff=numFR((document.getElementById('af-prop')||{}).value);
  const nom=String((document.getElementById('af-desc')||{}).value||'');
  const m=nom.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  /* ⚠️ LE POIDS DE L'IA PASSE DEVANT LE NOMBRE LU DANS LA PHRASE, ET CE N'EST PAS UN DÉTAIL.
     Sur « 3 œufs et 200 g de riz », le nombre écrit ne désigne QU'UN COMPOSANT — le rescaler
     ferait comme si toute l'assiette pesait 200 g. Le poids de l'IA, lui, porte sur le total.
     ⛔ MAIS IL N'APPARTIENT QU'À LA PHRASE QUI A ÉTÉ ESTIMÉE : si la phrase a changé depuis,
     il est périmé et on ne s'en sert plus. *Une référence qui survit à son sujet est pire que
     pas de référence : elle a l'air d'un fait.* */
  const iaValide = window._afIaGrammes>0 && String(window._afIaDesc||'')===nom;
  const ancre = iaValide ? {v:window._afIaGrammes,u:'g',src:'poids estimé par l\'IA'}
              : (m ? {v:parseFloat(m[1].replace(',','.')),u:m[2].toLowerCase(),src:'lu dans ta phrase'} : null);
  const style='width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);';
  if(ancre && ancre.v>0){
    /* ⛔ La quantité affichée l'emporte sur l'ancre : si la personne l'a corrigée, ce sont SES
       valeurs qui sont à l'écran — et la source change avec, sinon l'écran attribuerait à l'IA
       un poids que la personne a tapé (R32 : on ne présente jamais une déclaration comme une mesure). */
    const qR=(qAff>0)?qAff:ancre.v;
    const sR=(qAff>0&&qAff!==ancre.v)?'que tu as indiqué':ancre.src;
    _afRef={base:base,q:qR,u:ancre.u,src:sR};
    el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité ('+ancre.u+') <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'
      +'<input id="af-prop" type="text" inputmode="decimal" step="any" value="'+qR+'" oninput="_afApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+qR+' '+ancre.u+' ('+sR+'). Corrige-la, les 4 valeurs suivent en proportion.</div>';
  }else{
    /* ⚖️ AUCUN POIDS TROUVÉ — on ne devine pas, ON DEMANDE (ft-v1051). Deux unités au choix,
       un seul champ actif à la fois : la quantité a un seul propriétaire (R2). */
    const onglet=(u,l)=>'<button onclick="_afSetUnite(\''+u+'\')" style="flex:1;padding:7px 4px;border-radius:9px;border:1px solid '
      +(_afUnite===u?'var(--red)':'var(--sep)')+';background:'+(_afUnite===u?'var(--bg3)':'var(--bg2)')
      +';color:'+(_afUnite===u?'var(--t1)':'var(--t3)')+';font-size:12.5px;font-weight:'+(_afUnite===u?'800':'700')
      +';font-family:var(--font);cursor:pointer;touch-action:manipulation;" aria-pressed="'+(_afUnite===u?'true':'false')+'">'+l+'</button>';
    const choix='<div style="display:flex;gap:6px;margin-bottom:7px;">'+onglet('g','⚖️ En grammes')+onglet('portion','🍽️ En portions')+'</div>';
    if(_afUnite==='g'&&_afPoidsDeclare>0){
      /* ⭐ ANCRÉ PAR LA PERSONNE — à partir d'ici c'est EXACTEMENT le bloc « poids connu »
         au-dessus : même champ, même `_afApplyProp`, même calcul. Seule la source diffère, et
         elle est dite à l'écran (R32 : on ne présente jamais une déclaration comme une mesure). */
      /* ⛔ MÊME RÈGLE, ET C'EST LE CHEMIN DE LA CAPTURE DE MICHEL : les valeurs à l'écran sont
         celles de la quantité affichée. La référence la SUIT au lieu de rester sur l'ancienne —
         et comme elle est écrite en toutes lettres dessous, le changement se VOIT. */
      if(qAff>0) _afPoidsDeclare=qAff;
      _afRef={base:base,q:_afPoidsDeclare,u:'g',src:'que tu as indiqué'};
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'
        +choix
        +'<input id="af-prop" type="text" inputmode="decimal" step="any" value="'+_afPoidsDeclare+'" oninput="_afApplyProp()" style="'+style+'">'
        +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+_afPoidsDeclare+' g (que tu as indiqué). Change ce nombre à chaque fois que la quantité change — les 4 valeurs suivent.</div>';
    }else if(_afUnite==='g'){
      /* ⛔ LE CHAMP EST VIDE, PAS PRÉ-REMPLI. Proposer « 100 » ferait enregistrer 100 g à qui
         valide sans regarder — *un chiffre pré-rempli qu'on n'a pas choisi est un chiffre faux
         présenté comme un fait* (R29). Tant que rien n'est indiqué, les 4 valeurs NE BOUGENT PAS. */
      _afRef={base:base,q:1,u:'',src:'portion'};
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'
        +choix
        +'<input id="af-poids" type="text" inputmode="decimal" step="any" placeholder="poids de cette portion" onchange="_afDeclarePoids()" style="'+style+'">'
        +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Combien pèse ce que tu as devant toi ? <b>L\'app ne peut pas le deviner, toi si.</b> Indique-le une fois : les 4 valeurs se calent dessus, et tu pourras ensuite mettre le poids que tu veux (250 g aujourd\'hui, 400 g la prochaine fois).</div>';
    }else{
      _afRef={base:base,q:1,u:'',src:'portion'};
      const b=(x,l)=>'<button onclick="_afApplyPortion('+x+')" style="flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--sep);background:var(--bg2);color:var(--t2);font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;touch-action:manipulation;">'+l+'</button>';
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— multiplie les 4 valeurs</span></div>'
        +choix
        +'<div style="display:flex;gap:6px;">'+[0.5,1,1.5,2,3].map(x=>b(x,_portionLbl(x))).join('')+'</div>'
        +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Les 4 valeurs ci-dessous sont <b>une portion</b>. Tu connais le poids ? Passe en <b>⚖️ grammes</b> et indique-le.</div>';
    }
  }
  el.style.display='block';
  /* ⛔ ET L'ÉCRAN SE REMET D'ACCORD AVEC LA RÉFÉRENCE QU'IL VIENT D'ÉCRIRE (ft-v1061).
     Sans cette ligne, `base` est bien préservée mais les 4 champs gardent les valeurs du rescale
     précédent : on afficherait « Référence : 30 g » au-dessus des chiffres de 40 g. *Le voisinage
     muet une fois de plus* — corriger le calcul sans rafraîchir l'affichage ne corrige rien de ce
     que la personne VOIT. `af-prop` n'existe que dans les deux états ancrés, et il porte
     exactement `_afRef.q` : le facteur vaut donc 1. */
  if(_afRef && _afRef.q>0 && document.getElementById('af-prop')) _afProp(1);
}

function _afCorrigerKcal(v){
  const el=document.getElementById('af-kcal'); if(el)el.value=v;
  if(_afRef)_afRef.base.kcal=v;   // la référence suit, sinon un rescale ferait revenir l'ancien chiffre
  _afCoherence();
}
// Même calcul que `_bcApplyGrams()` (R2) : pour-100g × grammes/100, appliqué aux 4 champs macro.
function _efApplyGrams(){
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e||!e.per100) return;
  _qtyRescale('ef', e.per100, 100, (document.getElementById('ef-grams')||{}).value);
}
function saveEditFood(){
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e){toast('Entrée introuvable','error');return;}
  const name=(document.getElementById('ef-name').value||'').trim();
  e.name=(name||e.name).slice(0,80);
  e.meal=_editFoodMeal;
  e.kcal=parseInt(document.getElementById('ef-kcal').value)||0;
  e.prot=parseInt(document.getElementById('ef-prot').value)||0;
  e.carbs=parseInt(document.getElementById('ef-carbs').value)||0;
  e.fat=parseInt(document.getElementById('ef-fat').value)||0;
  // La quantité ne se met à jour QUE si le champ était affiché (per100 connu) — sinon `q`/`u`
  // ne veulent rien dire et on ne les invente pas (R29).
  const gEl=document.getElementById('ef-grams');
  if(gEl){ e.q=numFR(gEl.value)||0; e.u='g'; }
  /* ⭐ R4 (ft-v1064) — LE POIDS DÉCLARÉ DESCEND JUSQU'À LA DONNÉE. Sans ça la personne le donne,
     les 4 valeurs se recalculent à l'écran… et rien n'est retenu : à la prochaine ouverture
     l'app lui redemande, et le cul-de-sac revient. C'est la moitié qui manquait à ft-v972.
     ⛔ On n'écrit que ce qui est VRAIMENT en grammes : le champ proportionnel sert aussi aux
     ancrages en `ml`, et l'unité d'origine ne se réécrit pas (R29). */
  const pEl=document.getElementById('ef-prop');
  if(pEl && numFR(pEl.value)>0){ e.q=numFR(pEl.value); e.u=e.u||'g'; }
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  const ov=document.getElementById('ov-edit-food'); if(ov)ov.classList.remove('open');
  renderFoodJournal();
  toast('Modifié ✅','success');
}

function renderSupplements() {
  renderCreatine(); renderWhey(); updateProteinBar(); renderSupplCombos();
}

function renderSupplCombos() {
  const el = document.getElementById('suppl-combos');
  if (!el) return;

  const sectionTitle = '<div class="sec" style="margin-top:6px;">Combinaisons Premium</div>';

  if (!S.premium) {
    el.innerHTML = sectionTitle + `
    <div class="combo-gate">
      <div class="combo-gate-blur">
        <div style="display:flex;flex-direction:column;gap:8px;pointer-events:none;">
          <div class="combo-card" style="opacity:.7;"><div class="combo-card-hdr"><span class="combo-card-icon">💪</span><span class="combo-card-title">Prise de muscle</span></div></div>
          <div class="combo-card" style="opacity:.5;"><div class="combo-card-hdr"><span class="combo-card-icon">🏋️</span><span class="combo-card-title">Force maximale</span></div></div>
          <div class="combo-card" style="opacity:.3;"><div class="combo-card-hdr"><span class="combo-card-icon">🏃</span><span class="combo-card-title">Cardio / Endurance</span></div></div>
        </div>
      </div>
      <div style="font-size:28px;margin-bottom:2px;">🔒</div>
      <div style="font-family:var(--font-cond);font-size:18px;font-weight:700;color:var(--t1);">Combinaisons réservées aux membres Premium</div>
      <div style="font-size:13px;color:var(--t2);line-height:1.5;max-width:280px;">Stacks sur-mesure par objectif : dosages précis, timing optimal, synergies et contre-indications.</div>
      <button class="btn" style="background:linear-gradient(135deg,#FFB800,#FF6D00);color:#fff;font-weight:800;font-size:15px;padding:13px 26px;border-radius:14px;margin-top:4px;box-shadow:0 8px 22px -8px rgba(255,109,0,.5);" onclick="openPremiumInfo()">⭐ Débloquer Premium — 6,99 € / mois</button>
    </div>`;
    return;
  }

  const COMBOS = [
    {
      id:'muscle', icon:'💪', title:'Prise de muscle',
      items:[
        {name:'Créatine Monohydrate', dose:'3–5 g / jour', info:'Post-workout avec des glucides. Augmente la force de 5–15 % et le volume musculaire sur la durée. Incontournable.'},
        {name:'Whey Protéine', dose:'25–40 g post-workout', info:'Dans les 60 min après la séance. Comble les besoins protéiques si l\'alimentation est insuffisante. Vise 1,6–2 g de protéines/kg/jour au total.'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'30–45 min avant la séance. Améliore la force, la puissance et la concentration. Effet ergogène prouvé.'},
        {name:'BCAA (ratio 2:1:1)', dose:'5–10 g inter-séance', info:'Utile si séance > 90 min à jeun. Limite le catabolisme musculaire. Superflu si apport protéique total suffisant.'},
        {name:'Magnésium glycinate', dose:'300–400 mg le soir', info:'Favorise la récupération musculaire, réduit les crampes et améliore la qualité du sommeil. Forme glycinate = meilleure absorption.'},
      ],
      /* 🔬 CETTE PHRASE ÉTAIT FAUSSE, ET ELLE IMPOSAIT UNE CONTRAINTE POUR RIEN (18/08/2026).
         Elle disait « la caféine réduit l'absorption de la créatine, espace-les de 2 h ».
         ⛔ L'absorption n'est PAS en cause : la caféine ne modifie ni la captation musculaire de
            créatine ni sa pharmacocinétique (Vandenberghe 1996 · Vanakoski 1998).
         ⚠️ Un antagonisme existe, mais ailleurs — sur le temps de relaxation musculaire (Hespel
            2002), et les travaux sont DISCORDANTS sur la perte de bénéfice (pour : Vandenberghe
            1996, Hespel 2002 ; contre : Doherty 2002, Trexler 2016).
         ⛔ Et l'espacement de 2 h n'a **jamais été testé** : les protocoles portent sur plusieurs
            jours de caféine quotidienne, pas sur un intervalle dans la journée. La demi-vie de la
            caféine est d'environ 5 h — décaler de 2 h ne change rien de toute façon.
         👉 On dit ce qui est mesuré, on dit ce qui est débattu, et on dit ce qui n'a pas été testé.
         *« Personne n'a mesuré ça » est une information* — c'est ce qui distingue l'app de celles
         qui comblent le vide par du plausible. Trouvé par le contre-audit v1.2, sources vérifiées. */
      warn:'☕ Créatine et caféine : l\'absorption n\'est pas en cause — la caféine ne modifie pas la captation musculaire de créatine. Un antagonisme a été mesuré sur la relaxation musculaire, mais les travaux divergent sur la perte de bénéfice. Espacer les prises dans la journée n\'a jamais été testé.'
    },
    {
      id:'force', icon:'🏋️', title:'Force maximale',
      items:[
        {name:'Créatine Monohydrate', dose:'5 g / jour', info:'Phase maintenance quotidienne. Principal complément validé scientifiquement pour augmenter la force maximale sur les lifts lourds.'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'30–45 min avant. Améliore la force maximale de 5–8 % et le seuil de douleur. Particulièrement efficace pour les efforts courts et intenses.'},
        {name:'Bêta-Alanine', dose:'3,2–6,4 g / jour', info:'Fractionné en 4 prises pour limiter les fourmillements (paresthésie). Augmente les niveaux de carnosine musculaire, retarde la fatigue sur les séries longues.'},
        {name:'ZMA (Zinc + Magnésium + Vit B6)', dose:'1 dose le soir à jeun', info:'Alternative au magnésium seul. Soutient la production hormonale, la récupération nerveuse et la qualité du sommeil. Essentiel si déficit alimentaire en zinc.'},
        {name:'Vitamine D3 + K2', dose:'2 000–5 000 UI D3 + 100 µg K2', info:'Soutient la santé osseuse et tendineuse — critique sous charge lourde. Souvent carencé en Europe. La K2 oriente le calcium vers les os, pas les artères.'},
      ],
      warn:'⚠️ La caféine prise après 14h peut perturber ton sommeil et nuire à la récupération. Adapte l\'heure selon ta sensibilité.'
    },
    {
      id:'cardio', icon:'🏃', title:'Cardio / Endurance',
      items:[
        {name:'Caféine', dose:'200–300 mg pré-effort', info:'30–45 min avant. Améliore l\'endurance de 10–15 %, diminue la perception de l\'effort. Particulièrement efficace pour les efforts > 30 min.'},
        {name:'Bêta-Alanine', dose:'3,2 g / jour', info:'Retarde l\'acidose musculaire lors des efforts intenses de durée moyenne (1–4 min). Utile pour le HIIT, le trail et les courses à allure soutenue.'},
        {name:'BCAA', dose:'5–10 g pendant l\'effort', info:'Pour les efforts > 90 min. Préserve la masse musculaire et fournit un carburant d\'appoint en endurance prolongée. Mélange à ta boisson isotonique.'},
        {name:'Électrolytes', dose:'Sodium + Potassium + Magnésium', info:'Indispensable si sueur abondante ou effort > 60 min. Prévient les crampes et maintient la performance. Pertes estimées : 800–1 500 mg sodium/heure.'},
        {name:'Créatine', dose:'3–5 g / jour', info:'Moins efficace pour l\'endurance pure mais très utile si entraînement intermittent (HIIT, trail, natation). Améliore la récupération entre les sprints.'},
      ],
      warn:'⚠️ Ne teste jamais un nouveau complément le jour d\'une compétition ou d\'un test de performance. Introduis chaque nouveau produit séparément pour identifier d\'éventuelles intolérances.'
    },
    {
      id:'poids', icon:'🔥', title:'Perte de poids',
      items:[
        {name:'Whey Protéine', dose:'25–40 g post-workout', info:'Priorité absolue en déficit calorique. Préserve la masse musculaire et augmente la satiété. Un gramme de protéine = 4 kcal, fort effet thermique (25–30 %).'},
        {name:'Créatine', dose:'3–5 g / jour', info:'Maintient la force et la masse musculaire pendant la restriction calorique. Contre l\'effet catabolique du déficit. Peut causer une légère rétention d\'eau initiale (1–2 kg).'},
        {name:'Caféine', dose:'200–400 mg pré-workout', info:'Thermogenèse légère (+3–5 % métabolisme), lipolyse accrue et coupe-faim modéré. Améliore aussi les performances à l\'entraînement sous déficit.'},
        {name:'L-Carnitine', dose:'1–2 g avant cardio', info:'Facilite le transport des acides gras vers les mitochondries pour la production d\'énergie. Effet modeste mais synergique avec le cardio modéré. À jeun = meilleure efficacité.'},
        {name:'Oméga-3 (EPA + DHA)', dose:'2–3 g / jour', info:'Réduit l\'inflammation, améliore la sensibilité à l\'insuline et soutient la lipolyse. Anti-catabolique. 3 g d\'EPA+DHA minimum pour un effet métabolique significatif.'},
      ],
      warn:'⚠️ Aucun complément ne remplace un déficit calorique bien géré. L\'alimentation représente 90 % du résultat en perte de poids. Les compléments sont des alliés, pas des raccourcis.'
    }
  ];

  const cardsHtml = COMBOS.map(c => `
    <div class="combo-card" id="combo-${c.id}">
      <div class="combo-card-hdr" onclick="toggleComboCard('${c.id}')">
        <span class="combo-card-icon">${c.icon}</span>
        <span class="combo-card-title">${c.title}</span>
        <span class="combo-card-chev" id="combo-chev-${c.id}">▾</span>
      </div>
      <div class="combo-card-body" id="combo-body-${c.id}">
        ${c.items.map(it => `<div class="combo-item">
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
            <span class="combo-item-name">${it.name}</span>
            <span class="combo-item-dose">${it.dose}</span>
          </div>
          <div class="combo-item-info">${it.info}</div>
        </div>`).join('')}
        <div class="combo-warn">${c.warn}</div>
      </div>
    </div>`).join('');

  el.innerHTML = sectionTitle + `<div style="display:flex;flex-direction:column;gap:8px;">${cardsHtml}</div>`;
}

function toggleComboCard(id) {
  const body = document.getElementById('combo-body-' + id);
  const chev = document.getElementById('combo-chev-' + id);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.classList.toggle('open', !isOpen);
}

/* 🩺 LES CONTRE-INDICATIONS N'ÉTAIENT AFFICHÉES NULLE PART (18/08/2026, contre-audit v1.2).
   C'est le seul point de tout ce dossier qui relève vraiment de la SÉCURITÉ — et donc le seul
   qui mérite d'être signalé fermement. À distinguer du dépassement des 3 g, qui est
   **réglementaire** et appelle un ton neutre : mélanger les deux registres les affaiblit tous
   les deux (R11 — la hiérarchie compte plus que la présence).
   ⚠️ ON N'INTERDIT PAS, ON RENVOIE AU MÉDECIN : c'est la Constitution (aucun diagnostic, jamais
   de substitution à un professionnel de santé). Et ce n'est pas affiché en rouge : la nutrition
   ne doit jamais devenir une source de stress (P21).
   Sources : ANSES, avis 2023-SA-0216 (pathologies rénales) · avis 2016 sur les compléments pour
   sportifs, renouvelé en 2024 (risque cardiovasculaire, cardiopathie, atteinte hépatique,
   troubles neuropsychiatriques, mineurs, grossesse et allaitement). */
function _creatContreIndic(){
  return '<div class="tip-box txt-just" style="margin-top:6px;border-left:3px solid var(--gold);">'
    + '\u2695\uFE0F <strong>Avant d\'en prendre</strong> — l\'ANSES déconseille la créatine en cas de maladie rénale, '
    + 'de facteurs de risque cardiovasculaire, de cardiopathie, d\'atteinte du foie ou de troubles '
    + 'neuropsychiatriques, ainsi qu\'aux mineurs et aux femmes enceintes ou allaitantes. '
    + 'Elle recommande aussi de <strong>ne pas cumuler plusieurs sources de créatine</strong> et de choisir des '
    + 'produits conformes à la norme NF V 94-001 ou EN 17444:2021 (garantie sans substance dopante). '
    + 'Un doute sur ta situation : parles-en à ton médecin.</div>';
}
function renderCreatine() {
  const el = document.getElementById('creat-content');
  if (!el) return;
  const bw = S.bw || 80;
  if (creatPhase === 'charge') {
    el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--blue);">20g / jour</span></div><div class="dose-row"><span class="dose-label">Prises</span><span class="dose-val">4 × 5g</span></div><div class="dose-row"><span class="dose-label">Durée</span><span class="dose-val">5 à 7 jours</span></div><div class="tip-box">💡 Prends <strong>5g</strong> avec chaque repas principal. Après 5-7j passe en maintenance.</div>'+_creatContreIndic();
  } else {
    /* 💊 LA DOSE EST LIBRE, ET L'AVERTISSEMENT REMPLACE LE PLAFOND (18/08/2026, décision Michel :
       *« pour moi on laisse le champ libre et il n'y a pas de taux légal en France ; mais avec un
       avertissement au-delà de 3-5 grammes »*).
       ⚠️⚠️ ET IL A RAISON SUR LE FOND, J'AVAIS ÉCRIT FAUX : l'arrêté du 26/09/2016 fixe une dose
       journalière maximale de 3 g **pour les compléments alimentaires VENDUS en France** — ça
       engage le FABRICANT (ce qu'il a le droit de commercialiser et d'étiqueter), **pas le
       consommateur**. Personne n'est hors la loi en prenant 5 g. Parler de « maximum légal » pour
       la personne était une erreur de ma part, et elle aurait fait passer un repère de
       commercialisation pour une interdiction.
       👉 Donc : suggestion calculée, **champ modifiable**, et un repère factuel au-delà de 5 g —
       jamais un blocage (Constitution : on adapte, on n'interdit pas · P21 : pas de stress). */
    const _suggere = Math.min(5, Math.max(3, Math.round(bw * 0.05)));
    const dose = (typeof S.creatDose==='number' && S.creatDose>0) ? S.creatDose : _suggere;
    /* ⚠️ CE QUE L'APP AFFICHE DÉPASSE LA DOSE JOURNALIÈRE MAXIMALE FRANÇAISE (18/08/2026).
       La formule `0,05 g/kg plafonnée à 5 g` **n'apparaît dans aucune source** : c'est une
       troisième règle, inventée entre deux référentiels qui existent —
         · **3 000 mg/j** : dose journalière maximale en France (arrêté du 26/09/2016 ; ANSES,
           avis 2023-SA-0216). L'ANSES précise qu'au-delà, faute d'évaluation des risques, elle ne
           peut pas se prononcer : *c'est une évaluation absente, pas un risque démontré.*
         · **3 à 5 g/j** : dosages décrits par l'ISSN (Buford 2007 · Kreider 2017 · Antonio 2021).
       ⛔ LE CHIFFRE AFFICHÉ N'EST PAS CHANGÉ ICI, ET C'EST DÉLIBÉRÉ : baisser la recommandation
       par défaut de tout le monde est une décision produit ET de santé — elle appartient à Michel,
       pas à une correction de nuit (R29 + Constitution : on informe, on ne décide pas à sa place).
       👉 En attendant, on AFFICHE le repère réglementaire au lieu de le taire. Un chiffre sans son
       cadre laisse croire qu'il en est un. */
    /* ⚠️ DEUX SEUILS, DEUX TONS — ne pas les confondre (R11) :
         · au-dessus de 3 g  → simple REPÈRE, ton neutre : c'est une limite de commercialisation.
         · au-dessus de 5 g  → AVERTISSEMENT : on sort de ce que les sociétés savantes décrivent,
                               et les données au long cours y sont limitées. */
    const _reg = dose>5
      ? '<div class="tip-box" style="margin-top:6px;border-left:3px solid var(--orange);">⚠️ Au-delà de <strong>5 g/j</strong>, tu sors de ce que décrivent les sociétés savantes (3 à 5 g/j en entretien — ISSN). Les doses plus élevées documentées portent surtout sur des <strong>phases de charge</strong> ou des périodes définies de 4 à 12 semaines ; en entretien au long cours, les preuves directes sont limitées. Rien n\'indique un danger — c\'est une zone peu étudiée, pas un risque démontré.</div>'
      : (dose>3 ? '<div class="tip-box" style="margin-top:6px;">📋 Repère : les compléments vendus en France sont limités à <strong>3 g/j</strong> (arrêté du 26/09/2016) — c\'est une règle de commercialisation, pas une limite pour toi. Les sociétés savantes décrivent <strong>3 à 5 g/j</strong>.</div>' : '');
    el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose quotidienne</span><span class="dose-val" style="color:var(--green);cursor:pointer;text-decoration:underline dotted;" onclick="openCreatDose()">'+dose+'g / jour</span></div>'
      + (S.creatDose ? '<div class="dose-row"><span class="dose-label" style="font-size:11px;">Tu l\'as réglée toi-même</span><span class="dose-val" style="font-size:11px;color:var(--t3);cursor:pointer;" onclick="setCreatDose(0)">revenir à '+_suggere+' g</span></div>' : '')
      + '<div class="dose-row"><span class="dose-label">Moment idéal</span><span class="dose-val">Post-workout</span></div><div class="tip-box">✅ Prends <strong>'+dose+'g</strong> chaque jour même sans entraînement. Constance = résultats.</div>'+_reg+_creatContreIndic();
  }
}

function renderWhey() {
  const el = document.getElementById('whey-content');
  if (!el) return;
  const dose = Math.round((S.bw || 80) * 0.4);
  const daily = calcMacros ? (calcMacros(S.nutritionPhase || 'charge').prot_g || 0) : 0;
  el.innerHTML = '<div class="dose-row"><span class="dose-label">Dose post-workout</span><span class="dose-val" style="color:var(--orange);">'+dose+'g</span></div><div class="dose-row"><span class="dose-label">Fenêtre</span><span class="dose-val">0-60 min</span></div><div class="tip-box">🥤 <strong>'+dose+'g de whey</strong> dans 300ml eau ou lait, 0-60 min après ta séance.</div>';
}

/* Réglage libre de la dose (décision Michel du 18/08). `0` ou vide = on revient à la suggestion.
   ⚠️ Bornes VOLONTAIREMENT LARGES (0,5 à 30 g) : elles n'existent que pour attraper une faute de
   frappe, pas pour brider un choix. 30 g/j sur 5 ans est une dose documentée comme tolérée chez
   des sujets sains (Kreider 2017) — l'app n'a pas à décider en dessous. */
function openCreatDose(){
  const cur=(typeof S.creatDose==='number'&&S.creatDose>0)?S.creatDose:'';
  const v=prompt('Ta dose quotidienne de créatine, en grammes ?\n\n(laisse vide pour revenir à la suggestion de l\'app)', cur);
  if(v===null)return;                                  // annulé : on ne touche à rien
  const n=parseFloat(String(v).replace(',','.'));
  if(!v.trim()||!(n>0)) return setCreatDose(0);
  setCreatDose(Math.min(30, Math.max(0.5, n)));
}
function setCreatDose(g){
  S.creatDose = (g>0) ? g : null;
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  renderCreatine();
}
function setCreatPhase(phase, btn) {
  creatPhase = phase;
  document.querySelectorAll('.phase-toggle-small .ptbtn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCreatine();
}

function updateProteinBar() {
  const macros = calcMacros ? calcMacros(S.nutritionPhase || 'charge') : {prot_g: 0};
  const target = macros.prot_g || 0;
  /* 🍽️ LA BARRE LIT LE JOURNAL (18/08/2026) — jusqu'ici `prot-eaten` était une saisie
     MANUELLE que RIEN n'alimentait : quelqu'un qui tient son journal devait retaper son total
     ailleurs pour voir la barre bouger. Deux systèmes de suivi protéique dans la même app, dont
     un qui ignorait l'autre — **R2**, et **R4** (la donnée existait, elle n'atteignait pas
     l'écran). Trouvé par le contre-audit v1.2.
     ⚠️ LA SAISIE MANUELLE RESTE PRIORITAIRE quand elle est remplie : quelqu'un qui ne tient pas
     son journal doit pouvoir donner son chiffre, et on ne l'écrase pas (R29 — c'est le même
     arbitrage que `manualKcal`). Le journal ne sert que si le champ est vide. */
  const _saisi = document.getElementById('prot-eaten')?.value;
  const _duJournal = (typeof _foodTotals==='function') ? (_foodTotals(today()).prot||0) : 0;
  const eaten = (_saisi!==''&&_saisi!=null) ? (parseFloat(_saisi)||0) : _duJournal;
  /* ⚠️ LE PLAFOND NE VAUT QUE POUR LA LARGEUR DE LA BARRE (19/08/2026) — relevé par la revue
     UX extérieure. Le nombre affiché, lui, ne doit JAMAIS être plafonné : quelqu'un qui mange
     149 % de sa cible lisait « 100 % » et se croyait exactement dessus. Le cas le pire est le
     kéto, où les protéines sont contraintes et où le dépassement est justement l'information. */
  const pct = target > 0 ? Math.round(eaten / target * 100) : 0;
  const pctBarre = Math.min(100, pct);
  const remaining = Math.max(0, target - eaten);
  const bar = document.getElementById('prot-bar');
  const pctEl = document.getElementById('prot-pct-disp');
  const remEl = document.getElementById('prot-remaining');
  const targEl = document.getElementById('prot-target-disp');
  if (bar) { bar.style.width = pctBarre + '%'; bar.style.background = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)'; }
  if (pctEl) { pctEl.textContent = pct + '%'; pctEl.style.color = pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--red)'; }
  if (remEl) remEl.textContent = remaining + 'g';
  if (targEl) targEl.textContent = target + 'g';
  /* ⭐ ON NOMME LA SOURCE (ft-v969) — Michel : *« sur cette image c'est la portion ou juste le
     nombre de protéine ? »*. **La question montrait le trou** : le champ ne dit pas QUI le
     remplit. Quand le Journal porte des protéines, le champ reste VIDE (placeholder « 0 »)
     pendant que la barre affiche le vrai total — *deux nombres qui se contredisent, et rien ne
     dit lequel commande*. Même famille que le « 88 g » de ft-v966.
     ⛔ CETTE LIGNE NE CALCULE RIEN : elle relit `eaten` et dit d'où il sort (R2). */
  const srcEl = document.getElementById('prot-src');
  if (srcEl) {
    if (_saisi!==''&&_saisi!=null) {
      srcEl.textContent = '✍️ Chiffre que tu as tapé — efface le champ pour reprendre ton Journal.';
      srcEl.style.display = 'block';
    } else if (_duJournal > 0) {
      srcEl.textContent = '🍽️ '+Math.round(_duJournal)+' g lus dans ton Journal du jour — tape un nombre ici pour le remplacer.';
      srcEl.style.display = 'block';
    } else {
      /* ⛔ RIEN NOTÉ : on ne dit pas « 0 g lus dans ton Journal », ce qui se lirait comme un
         constat alors que c'est simplement une journée qui commence (R24). */
      srcEl.textContent = 'Rien de noté aujourd\'hui — ça se remplit tout seul depuis le Journal, ou tape ton total ici. En grammes de protéines, pas en poids d\'aliment.';
      srcEl.style.display = 'block';
    }
  }
}

// ─── ONBOARDING ──────────────────────────────────────────────
/* ⛔ `_obGender` PART VIDE (ft-v1040) : une valeur par défaut rend la question invisible —
   on ne peut plus distinguer une réponse d'un silence. L'étape 3 bloque tant qu'elle n'est
   pas remplie, et les deux écritures vers `S.gender` sont gardées : une chaîne vide
   n'atteint JAMAIS l'état, sinon l'asymétrie de `state.js` deviendrait atteignable. */
let _obStep=1,_obGender='',_obGoal='muscle',_obLevel='',_obDataRestored=false;
let _obPlace='',_obTime='',_obFreq=''; // écran « Ton entraînement » (ft-v604) → écrit dans S.coachQuiz.answers
const _OB_GOALS={muscle:'ob-gm',perte:'ob-gp',recomp:'ob-gr',force:'ob-gf',equilibre:'ob-ge',endurance:'ob-gen'};
const _OB_LEVELS={debutant:'ob-lv-d',intermediaire:'ob-lv-i',confirme:'ob-lv-c'};

function _initOb0(){
  if(_isStandalone())return;
  if(_isIOSInApp())return; // navigateur in-app → géré par le banner
  if(_isFirefoxAndroid())return; // pas de prompt disponible
  const isIOS=_isIOS;
  const ios=document.getElementById('ob0-ios');
  const android=document.getElementById('ob0-android');
  if(ios)ios.style.display=isIOS?'flex':'none';
  if(android)android.style.display=isIOS?'none':'flex';
  const ob1=document.getElementById('ob-1');
  if(ob1)ob1.classList.remove('ob-active');
  const ob0=document.getElementById('ob-0');
  if(ob0)ob0.classList.add('ob-active');
  _obStep=0;
  for(let i=1;i<=7;i++){const d=document.getElementById('od-'+i);if(d)d.classList.remove('ob-active');}
}

function ob0Install(){
  if(window._deferredInstall){
    window._deferredInstall.prompt();
    window._deferredInstall.userChoice.then(r=>{
      window._deferredInstall=null;
      if(r&&r.outcome==='accepted')obGoTo(1);
    });
  } else {
    const fb=document.getElementById('ob0-android-fallback');
    if(fb)fb.style.display='block';
    const btn=document.getElementById('ob0-install-btn');
    if(btn){btn.textContent='Voir les instructions ↑';btn.disabled=true;btn.style.opacity='.5';}
  }
}

function initOnboarding(){
  if(document.documentElement.classList.contains('ob-done'))return;
  // Objectif « Perte de gras + muscle » (recomposition) réservé aux testeurs pour l'instant
  const _obgr=document.getElementById('ob-gr');
  if(_obgr)_obgr.style.display=((typeof _isNutriBeta==='function')&&_isNutriBeta())?'':'none';
  const emailInp=document.getElementById('ob-email');
  if(emailInp){emailInp.setAttribute('enterkeyhint','done');emailInp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();obDoRestore();}});}
  // étape 3 « on se présente » : prénom → Continuer (le reste = collecte paresseuse)
  const nameInp=document.getElementById('ob-name');
  if(nameInp){
    nameInp.setAttribute('enterkeyhint','done');
    nameInp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); obNext(4); } });
  }
  const emailFinal=document.getElementById('ob-email-final');
  if(emailFinal){emailFinal.setAttribute('enterkeyhint','done');emailFinal.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();obCheckEmailAndFinish();}});}
  _initOb0();
}

function obGoTo(step){
  const prev=document.getElementById('ob-'+_obStep);
  if(prev){prev.classList.remove('ob-active');prev.classList.add('ob-prev');}
  setTimeout(()=>{if(prev)prev.classList.remove('ob-prev');},400);
  const next=document.getElementById('ob-'+step);
  if(next){next.classList.add('ob-active');}
  if(step===5){const ef=document.getElementById('ob-email-final');if(ef&&S.email)ef.value=S.email;}
  _obStep=step;
  // ordre : ob-1 (compte) → ob-3 (prénom+sexe) → ob-4 (objectif) → ob-2 (niveau) → ob-6 (blessure) → ob-7 (entraînement) → ob-5 (email)
  const dotMap={1:1,3:2,4:3,2:4,6:5,7:6,5:7};
  const dotNum=dotMap[step]||0;
  for(let i=1;i<=7;i++){const d=document.getElementById('od-'+i);if(d)d.classList.toggle('ob-active',dotNum>0&&i===dotNum);}
}

function obNext(step){
  if(_obStep===3){
    // On se présente : prénom + sexe seulement (âge/taille/poids → collecte paresseuse)
    const name=(document.getElementById('ob-name').value||'').trim();
    if(name){
      S.name=name;
      const cta=document.getElementById('ob-cta-title');
      if(cta)cta.textContent='C\'est parti, '+name+' !';
    }
    /* ⛔⛔ BLOQUANT (décision de Michel) : on ne passe pas sans avoir répondu. Sans ça,
       « ♂ Homme » pré-coché faisait passer un silence pour un choix — et une femme qui ne
       tape rien était calculée en homme, à 257 kcal/jour près. */
    if(!_obGender){
      const hint=document.getElementById('ob-gender-hint');
      if(hint)hint.style.display='';
      const row=document.querySelector('#ob-3 .ob-gbrow');
      if(row&&row.scrollIntoView)try{row.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}
      return;                                   // ⛔ on NE change pas d'étape
    }
    S.gender=_obGender;
  }else if(_obStep===2){
    // étape Niveau (son propre écran) — le niveau est déjà posé par obSetLevel
    if(_obLevel)S.level=_obLevel;
  }else if(_obStep===4){
    _goalSet(_obGoal,'inscription');   // ⛔ 'inscription' = pas un changement, rien n'est journalisé (ft-v1010)
  }else if(_obStep===6){
    // étape Blessure/zone fragile → Profil Santé (le Gardien la lira)
    _obApplyInjuries();
  }else if(_obStep===7){
    // étape « Ton entraînement » → questionnaire (Milo l'a d'emblée, ne redemande plus)
    _obApplyTraining();
  }
  if(step===5){
    const emailSec=document.getElementById('ob-email-section');
    if(emailSec)emailSec.style.display='';
  }
  obGoTo(step);
}
// Blessure à l'inscription (optionnel) : zones stockées dans S.healthProfile.notes → le Gardien les protège
const _OB_INJ_BTN={'épaule':'ob-inj-epaule','trapèze':'ob-inj-trapeze','nuque':'ob-inj-nuque','pectoraux':'ob-inj-pectoraux','coude':'ob-inj-coude','poignet':'ob-inj-poignet','bas du dos':'ob-inj-dos','abdos':'ob-inj-abdos','hanche':'ob-inj-hanche','fessier':'ob-inj-fessier','cuisse':'ob-inj-cuisse','ischio':'ob-inj-ischio','adducteur':'ob-inj-adducteur','genou':'ob-inj-genou','mollet':'ob-inj-mollet','cheville':'ob-inj-cheville'};
// Zones latérales (peuvent avoir un côté gauche/droite/les deux) — les centrales (nuque, bas du dos, abdos) n'en ont pas.
const _OB_INJ_LAT={'épaule':1,'trapèze':1,'pectoraux':1,'coude':1,'poignet':1,'hanche':1,'fessier':1,'cuisse':1,'ischio':1,'adducteur':1,'genou':1,'mollet':1,'cheville':1};
let _obInjuries=[];
let _obInjSide={}; // zone -> 'L'|'R'|'both'
function obToggleInjury(zone){
  let added=false;
  if(zone==='none'){_obInjuries=[];_obInjSide={};}
  else{const i=_obInjuries.indexOf(zone);if(i>=0){_obInjuries.splice(i,1);delete _obInjSide[zone];}else{_obInjuries.push(zone);added=true;if(_OB_INJ_LAT[zone])_obInjSide[zone]='both';}}
  const none=document.getElementById('ob-inj-none');if(none)none.classList.toggle('ob-sel',_obInjuries.length===0);
  Object.keys(_OB_INJ_BTN).forEach(z=>{const el=document.getElementById(_OB_INJ_BTN[z]);if(el)el.classList.toggle('ob-sel',_obInjuries.indexOf(z)>=0);});
  _obRenderInjSide();
  // Quand on sélectionne une zone latérale, amener le sélecteur G/D à l'écran (fini le « il faut descendre »).
  if(added&&_OB_INJ_LAT[zone]){try{setTimeout(()=>{const b=document.getElementById('ob-inj-side');if(b&&b.scrollIntoView)b.scrollIntoView({behavior:'smooth',block:'nearest'});},60);}catch(e){}}
}
function obSetInjSide(zone,side){_obInjSide[zone]=side;_obRenderInjSide();}
function _obRenderInjSide(){
  const box=document.getElementById('ob-inj-side');if(!box)return;
  const lat=_obInjuries.filter(z=>_OB_INJ_LAT[z]);
  if(!lat.length){box.innerHTML='';return;}
  const rows=lat.map(z=>{
    const cur=_obInjSide[z]||'both';
    const b=(val,lbl)=>'<button class="ds-side'+(cur===val?' on':'')+'" onclick="obSetInjSide(\''+z+'\',\''+val+'\')">'+lbl+'</button>';
    return '<div class="ds-siderow"><span class="ds-sidelbl" style="text-transform:capitalize;">'+z+'</span>'+b('L','G')+b('R','D')+b('both','Les 2')+'</div>';
  }).join('');
  box.innerHTML='<div class="ds-sub" style="margin-top:12px;text-align:left;">Un côté en particulier ?</div>'+rows;
}
function _obApplyInjuries(){
  if(!_obInjuries.length)return;
  S.healthProfile=S.healthProfile||{};
  const parts=_obInjuries.map(z=>{const s=_obInjSide[z];return z+(s==='L'?' (côté gauche)':s==='R'?' (côté droit)':'');});
  const txt='Zones fragiles : '+parts.join(', ')+'.';
  S.healthProfile.notes=S.healthProfile.notes?(S.healthProfile.notes+' '+txt):txt;
}

// Écran « Ton entraînement » (ft-v604) — lieu / durée / fréquence, boutons cliquables.
// On réutilise les questions EXISTANTES du questionnaire (place/time/freq) → Milo les lit
// déjà via _coachQuizContext. But : Milo a l'info d'emblée et ne redemande plus (fix structurel).
function _obTrainPick(kind,val,ids){
  if(kind==='place')_obPlace=(_obPlace===val?'':val);
  else if(kind==='time')_obTime=(_obTime===val?'':val);
  else if(kind==='freq')_obFreq=(_obFreq===val?'':val);
  const cur=kind==='place'?_obPlace:kind==='time'?_obTime:_obFreq;
  Object.entries(ids).forEach(([v,id])=>{const el=document.getElementById(id);if(el)el.classList.toggle('ob-sel',v===cur);});
}
function obSetPlace(v){_obTrainPick('place',v,{salle:'ob-pl-salle',basic:'ob-pl-basic',maison:'ob-pl-maison',pdc:'ob-pl-pdc'});}
function obSetTime(v){_obTrainPick('time',v,{'30':'ob-tm-30','45':'ob-tm-45','60':'ob-tm-60','90':'ob-tm-90'});}
function obSetFreq(v){_obTrainPick('freq',v,{'1':'ob-fr-1','3':'ob-fr-3','4':'ob-fr-4','5':'ob-fr-5'});}
function _obApplyTraining(){
  const ans={};
  if(_obPlace)ans.place=_obPlace;
  if(_obTime)ans.time=_obTime;
  if(_obFreq)ans.freq=_obFreq;
  if(!Object.keys(ans).length)return; // rien renseigné → on ne force rien (écran optionnel)
  S.coachQuiz=S.coachQuiz||{answers:{},done:false};
  S.coachQuiz.answers=Object.assign({},S.coachQuiz.answers||{},ans);
  if(!S.coachQuiz.date)S.coachQuiz.date=(typeof today==='function'?today():new Date().toISOString().slice(0,10));
  try{persist();}catch(e){}
}

function obSetGender(g){
  _obGender=g;
  const hint=document.getElementById('ob-gender-hint'); if(hint)hint.style.display='none';
  document.getElementById('ob-gt-h').classList.toggle('ob-sel',g==='H');
  document.getElementById('ob-gt-f').classList.toggle('ob-sel',g==='F');
}

function obSetGoal(g){
  _obGoal=g;
  Object.values(_OB_GOALS).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('ob-sel');});
  const el=document.getElementById(_OB_GOALS[g]);if(el)el.classList.add('ob-sel');
}

function obSetLevel(l){
  _obLevel=l;
  Object.values(_OB_LEVELS).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('ob-sel');});
  const el=document.getElementById(_OB_LEVELS[l]);if(el)el.classList.add('ob-sel');
}

function obShowRestore(){
  document.getElementById('ob-1-choice').style.display='none';
  const r=document.getElementById('ob-1-restore');
  r.style.display='flex';
  setTimeout(()=>{const e=document.getElementById('ob-email');if(e)e.focus();},120);
}

function obHideRestore(){
  document.getElementById('ob-1-restore').style.display='none';
  document.getElementById('ob-1-choice').style.display='flex';
}

async function obDoRestore(){
  const email=(document.getElementById('ob-email').value||'').trim();
  if(!email){toast('Entre ton adresse email','error');return;}
  if(!S.url){toast('URL Google Sheets manquante','error');return;}
  S.email=email;persist();
  toast('Restauration en cours…','info');
  try{
    const data=await _fetchRestoreRaw(email);
    if(data&&data.error==='auth'){ const hadCode=!!_authCode(); if(hadCode)_setAuthCode(''); _obShowCodePrompt(hadCode); return; }
    if(!data||data.error||data.status==='not_found'){toast(data&&data.error?data.error:'Aucun profil trouvé pour cet email. Enregistre d\'abord ton profil depuis l\'appli.','error');return;}
    _obDataRestored=true;
    _applyRestoreData(data);
    const cta=document.getElementById('ob-cta-title');
    if(cta)cta.textContent=S.name?'Content de te revoir, '+S.name+' ! 💪':'Content de te revoir ! 💪';
    const emailSec=document.getElementById('ob-email-section');
    if(emailSec)emailSec.style.display='none';
    obGoTo(5);
    toast('Profil restauré ✅','success');
  }catch(e){toast(e.message,'error');}
}

// Onboarding : compte protégé → demander le code perso et réessayer
function _obShowCodePrompt(wrong){
  const host=document.getElementById('ob-1-restore');if(!host)return;
  let el=document.getElementById('ob-code-wrap');
  if(!el){el=document.createElement('div');el.id='ob-code-wrap';el.style.marginTop='10px';host.appendChild(el);}
  el.innerHTML='<div style="font-size:13px;color:var(--gold);font-weight:700;margin-bottom:6px;line-height:1.4;">'+(wrong?'❌ Code incorrect.':'🔒 Ce compte est protégé.')+' Entre ton code perso&nbsp;:</div>'
    +'<input class="ob-inp" id="ob-code-inp" type="password" inputmode="numeric" autocomplete="off" placeholder="Ton code" style="font-size:16px;">'
    +'<button class="btn btn-red" onclick="_obSubmitCode()" style="width:100%;margin-top:8px;padding:14px;font-size:16px;">Valider le code</button>';
  const c=document.getElementById('ob-code-inp');
  if(c){setTimeout(()=>c.focus(),120);c.addEventListener('keydown',e=>{if(e.key==='Enter')_obSubmitCode();});}
}
function _obSubmitCode(){
  const c=document.getElementById('ob-code-inp');const code=(c?c.value:'').trim();
  if(!code){toast('Entre ton code','error');return;}
  _setAuthCode(code);obDoRestore();
}
async function obCheckEmailAndFinish(){
  const emailFinal=(document.getElementById('ob-email-final')||{}).value.trim();
  if(!emailFinal){finishOnboarding();return;}
  const btn=document.getElementById('ob-start-btn');
  btn.disabled=true;btn.textContent='Vérification…';
  try{
    const data=await _fetchRestoreRaw(emailFinal);
    if(data&&data.status==='ok'){
      // Compte existant → restauration automatique + entrée directe
      S.email=emailFinal;persist();
      _obDataRestored=true;
      _applyRestoreData(data);
      toast('Profil restauré ✅','success');
      finishOnboarding();
    }else{
      finishOnboarding();
    }
  }catch(e){
    finishOnboarding();
  }
}

function finishOnboarding(){
  const btn=document.getElementById('ob-start-btn');
  if(btn){btn.style.display='';btn.disabled=false;btn.textContent='⚡ COMMENCER';}
  /* ⛔ `if(_obGender)` : une chaîne vide n'atteint jamais `S.gender` (ft-v1040). L'étape 3
     bloque déjà, mais un futur chemin qui la contournerait ne doit pas poser une valeur que
     `state.js` interprète différemment selon l'endroit. */
  if(!_obDataRestored){_goalSet(_obGoal,'inscription');if(_obGender)S.gender=_obGender;}
  const emailFinal=(document.getElementById('ob-email-final')||{}).value||'';
  if(emailFinal&&!S.email){S.email=emailFinal.trim();}
  else if(emailFinal){S.email=emailFinal.trim();}
  persist();
  if(S.email&&S.url&&!_obDataRestored){
    // Nouveau profil uniquement — si restauration depuis cloud, on ne réécrit JAMAIS le Sheet
    const p={action:'saveProfile',email:S.email,name:S.name,bw:S.bw,age:S.age,height:S.height,gender:S.gender,goal:S.goal,level:S.level||'',targetWeight:S.targetWeight||0,bday:S.bday||'',activityLevel:S.activityLevel,workType:S.workType,smoker:S.smoker,neck:S.neck,waist:S.waist,hip:S.hip,nutritionPhase:S.nutritionPhase,barW:S.barW,defRest:S.defRest,mensCycleStart:S.mensCycleStart,mensCycleDur:S.mensCycleDur,contraception:S.contraception||'',customExercises:S.customExercises,healthProfile:S.healthProfile,authCode:_authCode(),welcome:true};
    fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).catch(()=>{});
    // Confirmation d'email (soft) : on envoie un code en fond — l'inscription n'est JAMAIS bloquée
    if(!S.emailVerified){ try{ _sendEmailConfirm(true); }catch(e){} }
  }
  localStorage.setItem('ft4_ob2','1');
  try{localStorage.setItem('ft4_whatsnew_v2','1');localStorage.setItem('ft4_wn_seen',String(typeof WHATS_NEW_MAX==='number'?WHATS_NEW_MAX:0));}catch(e){} // nouvel inscrit : pas de « Quoi de neuf » (il a le guide-film)
  document.documentElement.classList.add('ob-done');
  const ob=document.getElementById('onboarding');
  if(ob){ob.style.transition='opacity .4s';ob.style.opacity='0';setTimeout(()=>{ob.style.display='none';ob.style.opacity='';ob.style.transition='';},400);}
  renderHome();renderNutrition();renderSetup();
  // Nouvel inscrit → guide-film de l'application automatiquement (une seule fois),
  // puis on enchaîne le prompt d'installation à la fermeture du guide.
  // (Pas pour une restauration de compte existant : _obDataRestored.)
  if(!_obDataRestored && !localStorage.getItem('ft4_guide_shown') && typeof openAppGuide==='function'){
    try{localStorage.setItem('ft4_guide_shown','1');}catch(e){}
    window._afterAppGuide=function(){setTimeout(showInstallPrompt,800);};
    setTimeout(function(){try{openAppGuide();}catch(e){setTimeout(showInstallPrompt,1400);}},700);
  }else{
    setTimeout(showInstallPrompt,1400);
  }
}

// ── Confirmation d'email (soft) — bonus sécurité, ne bloque JAMAIS l'app ──
function _sendEmailConfirm(silent){
  if(!S.email||!S.url)return;
  fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'sendConfirmCode',email:S.email})})
    .then(r=>r.json()).then(d=>{
      if(silent)return;
      if(d&&d.status==='ok')toast('📧 Code envoyé — regarde ta boîte mail','success');
      else toast('Envoi impossible pour l\'instant, réessaie plus tard','error');
    }).catch(()=>{ if(!silent)toast('Réseau indisponible','error'); });
}
function openEmailConfirm(){
  if(S.emailVerified){ if(typeof toast==='function')toast('Ton email est déjà confirmé ✅','info'); return; }
  if(!S.email){ if(typeof toast==='function')toast('Ajoute d\'abord ton email dans le profil','info'); return; }
  const em=document.getElementById('ec-email'); if(em)em.textContent=S.email;
  const inp=document.getElementById('ec-code'); if(inp)inp.value='';
  const ov=document.getElementById('ov-email-confirm'); if(ov)ov.classList.add('open');
  _sendEmailConfirm(true); // (re)envoie un code à l'ouverture (respecte le cooldown serveur)
}
function closeEmailConfirm(){ const ov=document.getElementById('ov-email-confirm'); if(ov)ov.classList.remove('open'); }
function resendEmailConfirm(){ _sendEmailConfirm(false); }
function verifyEmailCode(){
  const inp=document.getElementById('ec-code'); const code=(inp?inp.value:'').trim();
  if(!/^\d{6}$/.test(code)){ toast('Entre le code à 6 chiffres reçu par email','error'); return; }
  if(!S.url){ toast('Hors ligne — réessaie connecté','error'); return; }
  const btn=document.getElementById('ec-verify-btn'); if(btn){btn.disabled=true;btn.textContent='Vérification…';}
  fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'verifyConfirmCode',email:S.email,code:code})})
    .then(r=>r.json()).then(d=>{
      if(btn){btn.disabled=false;btn.textContent='Vérifier';}
      if(d&&d.status==='ok'){ S.emailVerified=true; persist(); closeEmailConfirm(); _renderEmailVerifyCard(); toast('✅ Email confirmé, merci !','success'); }
      else if(d&&d.status==='expired'){ toast('Code expiré — renvoie-en un nouveau','error'); }
      else if(d&&d.status==='toomany'){ toast('Trop d\'essais — renvoie un nouveau code','error'); }
      else if(d&&d.status==='nocode'){ toast('Aucun code en attente — clique « Renvoyer »','error'); }
      else { toast('Code incorrect, réessaie','error'); }
    }).catch(()=>{ if(btn){btn.disabled=false;btn.textContent='Vérifier';} toast('Réseau indisponible','error'); });
}
/* ⛔⛔ ft-v1091 — UN SEUL PROPRIÉTAIRE DE `#email-verify-card` (R2).
   DEUX fonctions écrivaient dans le même emplacement : celle-ci et
   `_renderAuthRefusCard()`. Or `renderSetup()` appelle celle-ci → **ouvrir
   l'onglet Profil effaçait le bandeau « Sauvegarde en ligne en pause »**,
   c'est-à-dire l'écran même où ce bandeau vit. Mesuré : peint au démarrage,
   puis remplacé par le bouton jaune « confirme ton e-mail » dès la navigation.
   ⚠️ Et le remplaçant est pire que rien : il envoie chercher au MAUVAIS endroit
   (confirmer un e-mail, quand le vrai problème est un code perso absent).
   👉 ft-v788 avait rendu le refus visible ; il redevenait silencieux au 1ᵉʳ
   changement d'écran. *Un avertissement qu'un autre rendu efface n'est pas un
   avertissement.* Le refus PASSE DEVANT : une copie en ligne à l'arrêt compte
   plus qu'un rappel d'e-mail. */
function _refusAuthEnCours(){
  /* ⭐ SE GUÉRIT TOUT SEUL : un appareil qui A le code n'est plus refusé.
     Sans cette garde, un drapeau périmé deviendrait un bandeau rouge PERMANENT —
     exactement le piège que ft-v788 nommait déjà (« enregistrer un code faux
     rendrait le bandeau permanent sans jamais rien débloquer »). */
  try{ if(typeof _authCode==='function' && _authCode()) return false; }catch(e){}
  if(window._ftAuthRefusee) return true;
  /* ⚠️ `ft4_auth_refus` était ÉCRIT depuis ft-v788 et relu par PERSONNE — une donnée
     morte (R5). Il existe pour survivre à un rechargement : au démarrage suivant,
     hors ligne ou avant que le serveur réponde, le refus doit encore se voir. */
  try{ return !!localStorage.getItem('ft4_auth_refus'); }catch(e){ return false; }
}
function _renderEmailVerifyCard(){
  const el=document.getElementById('email-verify-card'); if(!el)return;
  if(_refusAuthEnCours()){ try{ _renderAuthRefusCard(); }catch(e){} return; }
  if(!S.email){ el.innerHTML=''; return; }
  // Compte protégé (code perso) = email déjà vérifié → pas de prompt redondant.
  if(_authCode()){ el.innerHTML=''; return; }
  if(S.emailVerified){
    el.innerHTML='<div style="display:flex;align-items:center;gap:7px;justify-content:center;font-size:13px;color:var(--green);font-weight:700;padding:8px;">✅ Email confirmé</div>';
    return;
  }
  el.innerHTML='<button class="btn" onclick="openEmailConfirm()" style="width:100%;background:rgba(234,179,8,.10);border:1.5px solid rgba(234,179,8,.4);color:var(--gold);font-size:13.5px;font-weight:700;padding:13px;border-radius:14px;touch-action:manipulation;">📧 Confirme ton email — sécurise ta sauvegarde</button>';
}

// ─── LE REFUS D'AUTHENTIFICATION SE VOIT (ft-v788) ───────────────────────────────────────
// Le serveur refuse la lecture/écriture cloud quand le compte porte un code perso et que
// l'appareil ne l'a pas. Avant, ce refus tombait dans un `else` vide : rien à l'écran, synchro
// morte en silence. On réutilise l'emplacement de la carte « vérifier ton e-mail » (R13 :
// enrichir l'existant plutôt que créer un deuxième bandeau qui lui ferait concurrence).
// ⚠️ On ne touche à AUCUNE donnée locale : la séance du jour reste sur le téléphone, toujours
// (règle d'or #3). Ce qui est en pause, c'est la copie en ligne — et on le dit.
function _renderAuthRefusCard(){
  const el=document.getElementById('email-verify-card'); if(!el)return;
  // ⚠️ DEUX MESSAGES, PAS UN (ft-v789). Réclamer « ton code » à quelqu'un qui n'en a jamais posé,
  // c'est le laisser chercher un truc qui n'existe pas — la meilleure façon qu'il abandonne.
  /* ⚠️ ft-v1091 — APRÈS UN RECHARGEMENT, `window._ftAuthNeedsCode` n'existe plus.
     C'est précisément à ça que sert la valeur stockée (`'new'` ou `'1'`), écrite
     depuis ft-v788 et jamais relue : sans elle, on réclamerait « ton code » à
     quelqu'un qui n'en a jamais posé — le défaut que ft-v789 avait corrigé.
     ⚠️⚠️ ET MA 1ʳᵉ VERSION A FAIT ROUGIR UN TÉMOIN DE ft-v789 : j'avais mis `_ftAuthRefusee`
     en garde du choix, alors que ce drapeau dit *« y a-t-il un refus »*, pas *« de quel refus
     s'agit-il »*. Deux questions différentes, une seule variable pour les départager → le
     message « protège ton compte » disparaissait. La mémoire vive gagne dès qu'elle a été
     renseignée ; le stockage n'est le repli QUE lorsqu'il n'y a rien en mémoire. */
  const neuf = (window._ftAuthNeedsCode!==undefined) ? !!window._ftAuthNeedsCode
    : (function(){ try{ return localStorage.getItem('ft4_auth_refus')==='new'; }catch(e){ return false; } })();
  const action = neuf ? 'openProtect()' : '_saisirCodeResync()';
  const texte  = neuf
    ? 'Ta sauvegarde en ligne attend que tu protèges ton compte. Tes données restent sur ce téléphone — appuie pour le faire (2 min).'
    : 'Ce compte est protégé par un code. Tes données restent sur ce téléphone — appuie pour saisir le code.';
  el.innerHTML='<button class="btn" onclick="'+action+'" style="width:100%;background:rgba(239,68,68,.10);'
    +'border:1.5px solid rgba(239,68,68,.45);color:var(--red);font-size:13px;font-weight:700;padding:11px;text-align:left;line-height:1.45;">'
    +'🔒 Sauvegarde en ligne en pause<br><span style="font-weight:500;color:var(--t2);font-size:12px;">'
    +texte+'</span></button>';
}
// Saisie du code sur un appareil qui ne l'a pas. On le VÉRIFIE avant de l'enregistrer :
// enregistrer un code faux rendrait le bandeau permanent sans jamais rien débloquer.
async function _saisirCodeResync(){
  const c=(typeof prompt==='function')?(prompt('Ton code perso (celui qui protège ce compte)')||'').trim():'';
  if(!c)return;
  try{
    const r=await fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'loadProfile',email:S.email,authCode:c})});
    const d=await r.json();
    if(d&&(d.status==='ok'||d.status==='not_found')){
      _setAuthCode(c);
      try{ localStorage.removeItem('ft4_auth_refus'); }catch(e){}
      window._ftAuthRefusee=false;
      toast('🔓 Code accepté — synchronisation rétablie','success');
      try{ _renderEmailVerifyCard(); }catch(e){}
      if(typeof _cloudSync==='function')_cloudSync();
    } else if(d&&d.blocked){ toast('Trop d\'essais — réessaie demain','error'); }
    else { toast('Code refusé — vérifie-le','error'); }
  }catch(e){ toast('Réseau indisponible — réessaie','error'); }
}

// ─── PROTÉGER MON COMPTE (code perso) ────────────────────────
let _protectStatus=null;
function _protectPost(payload){
  return fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(r=>r.json());
}
function _protectErr(d){
  const m={nocode:'Demande d\'abord un code par email',expired:'Code expiré — redemande-en un',toomany:'Trop d\'essais — redemande un code',invalid:'Code email incorrect',court:'Ton code perso : au moins 4 chiffres',params:'Champs manquants'};
  return (d&&m[d.error])||'Une erreur est survenue';
}
// ⚠️ LE BOUTON DISAIT TOUJOURS LA MÊME CHOSE (ft-v790). Michel, capture à l'appui : « je n'ai pas
// retiré mon code perso » — parce que le bouton affichait « Protéger mon compte avec un code »
// alors que son compte ÉTAIT protégé (le serveur l'avait prouvé une heure plus tôt en refusant).
// Le libellé était écrit EN DUR dans index.html et n'était jamais mis à jour : l'état réel ne se
// voyait qu'en ouvrant la fenêtre. *Un écran qui n'affiche pas l'état fait douter de l'état* — et
// sur une protection, douter revient à ne pas s'en servir.
// On se fie au code présent SUR L'APPAREIL, puis à la réponse du serveur si on l'a déjà : aucun
// appel réseau ajouté (règle d'or #4 — l'écran ne doit attendre personne).
function _majBoutonProtect(){
  const b=document.getElementById('btn-protect-account'); if(!b)return;
  const protege = (typeof _protectStatus==='object'&&_protectStatus&&typeof _protectStatus.hasCode==='boolean')
    ? _protectStatus.hasCode : !!(typeof _authCode==='function'&&_authCode());
  b.textContent = protege ? '🔒 Compte protégé — gérer mon code'
                          : '🔒 Protéger mon compte avec un code';
}
function openProtect(){
  if(!S.email){toast('Ajoute d\'abord ton email dans le Profil','info');return;}
  const ov=document.getElementById('ov-protect');if(!ov)return;
  ov.classList.add('open');
  const b=document.getElementById('protect-body');
  if(b)b.innerHTML='<div style="text-align:center;color:var(--t3);padding:24px 0;">Chargement…</div>';
  _protectPost({action:'authStatus',email:S.email})
    .then(d=>{_protectStatus=d&&d.status==='ok'?d:{hasCode:!!_authCode(),emailVerified:!!S.emailVerified};_renderProtect();_majBoutonProtect();})
    .catch(()=>{_protectStatus={hasCode:!!_authCode(),emailVerified:!!S.emailVerified};_renderProtect();_majBoutonProtect();});
}
function closeProtect(){const ov=document.getElementById('ov-protect');if(ov)ov.classList.remove('open');}
function _renderProtect(mode){
  const b=document.getElementById('protect-body');if(!b)return;
  const st=_protectStatus||{};
  const inpS='width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid var(--sep);border-radius:10px;background:var(--bg2);color:var(--t1);font-size:16px;margin-top:8px;';
  const btnR='width:100%;padding:13px;border:none;border-radius:11px;background:var(--red);color:#fff;font-weight:800;font-size:15px;cursor:pointer;margin-top:12px;touch-action:manipulation;';
  const btnG='width:100%;padding:12px;border:1.5px solid var(--sep);border-radius:11px;background:var(--bg3);color:var(--t2);font-weight:700;font-size:14px;cursor:pointer;margin-top:8px;touch-action:manipulation;';
  // Vue "déjà protégé"
  if(st.hasCode && mode!=='change' && mode!=='disable'){
    b.innerHTML='<div style="background:rgba(48,209,88,.08);border:1px solid rgba(48,209,88,.3);border-radius:12px;padding:14px;text-align:center;color:var(--green);font-weight:700;font-size:15px;">✅ Ton compte est protégé par un code perso.</div>'
      +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin-top:12px;">Sur un nouveau téléphone, on te demandera ce code pour récupérer tes données. Personne d\'autre ne peut y accéder.</div>'
      +'<button onclick="_renderProtect(\'change\')" style="'+btnG+'">🔑 Changer mon code</button>'
      +'<button onclick="_renderProtect(\'disable\')" style="'+btnG+'color:var(--red);border-color:rgba(255,45,85,.3);">🔓 Désactiver la protection</button>';
    return;
  }
  const isDisable=(mode==='disable');
  const isChange=(mode==='change');
  const title=isDisable?'Désactiver la protection':(isChange?'Changer ton code':'Activer la protection');
  const intro=isDisable
    ?'Pour désactiver, on vérifie que c\'est bien toi : reçois un code par email, puis confirme.'
    :'Pour '+(isChange?'changer ton code':'protéger ton compte')+', on vérifie d\'abord ton email (pour pouvoir te dépanner si tu oublies ton code un jour).';
  b.innerHTML='<div style="font-weight:800;font-size:15px;color:var(--t1);margin-bottom:6px;">'+title+'</div>'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;">'+intro+'</div>'
    +'<div style="font-size:12px;color:var(--t3);margin-top:10px;">📧 '+(_escNote(S.email||''))+'</div>'
    +'<button id="protect-send-btn" onclick="protectSendEmail()" style="'+btnG+'">📩 Recevoir le code par email</button>'
    +'<div style="font-size:11px;color:var(--t3);margin-top:6px;text-align:center;">💡 Le code est dans l\'<b>objet du mail</b> — tu peux le lire depuis la notification, <b>sans ouvrir ta boîte</b>.<br>Pas reçu ? Regarde tes <b>spams</b> et marque « non-spam ».</div>'
    +'<div style="font-weight:700;font-size:13px;color:var(--t1);margin-top:14px;">1️⃣ Le code reçu par email</div>'
    +'<div style="font-size:11.5px;color:var(--t3);margin-top:1px;">Les 6 chiffres du mail — temporaire, juste pour vérifier que c\'est toi.</div>'
    +'<input id="protect-emailcode" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="Ex : 483920" style="'+inpS+'">'
    +(isDisable?''
      :'<div style="font-weight:700;font-size:13px;color:var(--t1);margin-top:14px;">2️⃣ TON code perso</div>'
       +'<div style="font-size:11.5px;color:var(--t3);margin-top:1px;">Celui que tu inventes et que tu retiendras (min 4 chiffres).</div>'
       +'<input id="protect-newcode" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Choisis ton code" style="'+inpS+'">'
       // ⚠️ « C'est chiant à faire » (Michel, sur le téléphone de Tatiana, 07/08). On ne touche
       // PAS à la vérification par mail — c'est elle qui empêche quelqu'un de prendre le compte
       // d'un autre en tapant juste son adresse. On enlève seulement ce qui fait RÉFLÉCHIR :
       // inventer un code, et retaper 6 chiffres qu'on vient de lire.
       +'<div style="display:flex;gap:8px;margin-top:8px;">'
       +'<button onclick="_protectCollerCode()" style="flex:1;padding:10px;border:1.5px solid var(--sep);border-radius:10px;background:var(--bg3);color:var(--t2);font-weight:700;font-size:12.5px;cursor:pointer;">📋 Coller le code du mail</button>'
       +'<button onclick="_protectProposerCode()" style="flex:1;padding:10px;border:1.5px solid var(--sep);border-radius:10px;background:var(--bg3);color:var(--t2);font-weight:700;font-size:12.5px;cursor:pointer;">🎲 M\'en proposer un</button>'
       +'</div>')
    +'<button id="protect-activate-btn" onclick="'+(isDisable?'protectDisable()':'protectActivate()')+'" style="'+btnR+(isDisable?'background:var(--red);':'')+'">'+(isDisable?'🔓 Désactiver':(isChange?'✅ Changer mon code':'✅ Activer la protection'))+'</button>'
    +(st.hasCode?'<button onclick="_renderProtect()" style="'+btnG+'">‹ Retour</button>':'');
}
// Colle les 6 chiffres du presse-papier dans le champ « code reçu par email ».
// ⚠️ On EXTRAIT les 6 chiffres au lieu de coller tel quel : on copie souvent la ligne entière
// de l'objet du mail (« Force Tracker — ton code de confirmation : 483920 »).
async function _protectCollerCode(){
  try{
    const t=await navigator.clipboard.readText();
    const m=String(t||'').match(/\d{6}/);
    if(!m){ toast('Pas de code à 6 chiffres dans le presse-papier','info'); return; }
    const inp=document.getElementById('protect-emailcode');
    if(inp){ inp.value=m[0]; toast('Code collé ✅','success'); }
  }catch(e){ toast('Copie le code, puis réessaie','info'); }
}
// Propose un code perso au hasard et l'AFFICHE en clair : celui qui doit le retenir doit
// pouvoir le lire. On ne l'impose pas — le champ reste modifiable.
function _protectProposerCode(){
  let c=''; for(let i=0;i<4;i++) c+=Math.floor(Math.random()*10);
  const inp=document.getElementById('protect-newcode');
  if(!inp)return;
  inp.type='text'; inp.value=c;   // en clair : un code qu'on ne voit pas ne se retient pas
  toast('Ton code : '+c+' — note-le','info');
}
function protectSendEmail(){
  const btn=document.getElementById('protect-send-btn');
  if(btn){btn.disabled=true;btn.textContent='Envoi…';}
  _protectPost({action:'sendConfirmCode',email:S.email})
    .then(d=>{
      if(d&&d.cooldown)toast('Patiente 1 min avant un nouvel envoi','info');
      else toast('Code envoyé 📩 (checke tes spams)','success');
      if(btn){btn.disabled=false;btn.textContent='📩 Renvoyer le code';}
    })
    .catch(()=>{toast('Envoi impossible, réessaie','error');if(btn){btn.disabled=false;btn.textContent='📩 1. Recevoir le code par email';}});
}
function protectActivate(){
  const ec=((document.getElementById('protect-emailcode')||{}).value||'').trim();
  const nc=((document.getElementById('protect-newcode')||{}).value||'').trim();
  if(!ec){toast('Entre le code reçu par email','error');return;}
  if(nc.length<4){toast('Ton code perso : au moins 4 chiffres','error');return;}
  const btn=document.getElementById('protect-activate-btn');
  if(btn){btn.disabled=true;btn.textContent='Activation…';}
  _protectPost({action:'setAccessCode',email:S.email,code:ec,newCode:nc})
    .then(d=>{
      if(d&&d.status==='ok'){
        _setAuthCode(nc);S.emailVerified=true;persist();
        try{_renderEmailVerifyCard();}catch(e){}
        _protectStatus={hasCode:true,emailVerified:true};_renderProtect();
        toast('Compte protégé ✅','success');
      }else{toast(_protectErr(d),'error');if(btn){btn.disabled=false;btn.textContent='✅ Activer la protection';}}
    })
    .catch(()=>{toast('Erreur réseau, réessaie','error');if(btn){btn.disabled=false;btn.textContent='✅ Activer la protection';}});
}
function protectDisable(){
  const ec=((document.getElementById('protect-emailcode')||{}).value||'').trim();
  if(!ec){toast('Entre le code reçu par email','error');return;}
  const btn=document.getElementById('protect-activate-btn');
  if(btn){btn.disabled=true;btn.textContent='Désactivation…';}
  _protectPost({action:'setAccessCode',email:S.email,code:ec,remove:true})
    .then(d=>{
      if(d&&d.status==='ok'){
        _setAuthCode('');
        _protectStatus={hasCode:false,emailVerified:true};_renderProtect();
        toast('Protection désactivée','info');
      }else{toast(_protectErr(d),'error');if(btn){btn.disabled=false;btn.textContent='🔓 Désactiver';}}
    })
    .catch(()=>{toast('Erreur réseau, réessaie','error');if(btn){btn.disabled=false;btn.textContent='🔓 Désactiver';}});
}

// ─── PWA INSTALL ─────────────────────────────────────────────
// _isIOS : const booléen déclaré dans log.js (top-level, partagé)
function _isStandalone(){return window.matchMedia('(display-mode:standalone)').matches||!!navigator.standalone;}
function _isIOSInApp(){
  if(!_isIOS) return false;
  const ua = navigator.userAgent;
  // Navigateurs in-app connus sur iOS
  if(/FBAN|FBAV|Instagram|Twitter|Snapchat|TikTok|Musical\.ly|Line\/|LinkedIn|Pinterest|Threads/.test(ua)) return true;
  // Chrome iOS, Firefox iOS, Edge iOS, Google App — ne supportent pas l'install PWA
  if(/CriOS|FxiOS|OPiOS|EdgiOS|GSA/.test(ua)) return true;
  // WebView générique iOS : pas de "Safari" dans le UA
  if(!/Safari/i.test(ua)) return true;
  return false;
}

function _isFirefoxAndroid(){
  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /Firefox/i.test(ua);
}

const APP_URL = 'https://michdu75-commits.github.io/forcetracker/';

function tryOpenSafari(){
  // La seule méthode fiable : Web Share API → feuille de partage iOS → "Ouvrir dans Safari"
  if(navigator.share){
    navigator.share({title:'Force Tracker',url:APP_URL}).catch(()=>{});
  } else {
    // Fallback : copier le lien + instruction
    copyAppLink('safari');
    toast('Lien copié — ouvre Safari et colle dans la barre d\'adresse','info');
  }
}

function tryOpenChrome(){
  if(navigator.share){
    navigator.share({title:'Force Tracker',url:APP_URL}).catch(()=>{});
  } else {
    copyAppLink('chrome');
    toast('Lien copié — ouvre Chrome et colle dans la barre d\'adresse','info');
  }
}

/* ⚠️ LE BOUTON « COPIER » NE DISAIT RIEN QUAND IL ÉCHOUAIT (13/08/2026) ────────────────
   Michel : *« seconde qui ne fonctionne pas d'ailleurs je crois »*. Il avait raison, et le
   défaut est le même que celui du débrief corrigé le matin même : un échec SILENCIEUX.
   ① `writeText()` n'avait **aucun `.catch()`** — sur iOS, l'écriture dans le presse-papier
      est refusée dès que l'appel n'est pas jugé assez proche du geste de l'utilisateur. La
      promesse partait en erreur et il ne se passait **rien** : pas de toast, pas de repli,
      aucun message. De l'autre côté de l'écran, ça s'appelle « le bouton ne marche pas ».
   ② Le repli `execCommand` existait mais était **inatteignable** : il ne servait que si
      `navigator.clipboard` était ABSENT, jamais s'il ÉCHOUAIT. Or sur iOS l'objet existe.
      Du code de secours qui ne peut jamais s'exécuter n'est pas un secours.
   On reprend le motif déjà en place pour la copie d'une réponse de Milo (coach.js) :
   presse-papier → repli → et si les deux tombent, **on le DIT** (R13, R2). */
function copyAppLink(target){
  const msg = target==='safari' ? 'Lien copié — colle-le dans Safari' : target==='chrome' ? 'Lien copié — colle-le dans Chrome' : 'Lien copié !';
  const _secours=()=>{
    try{
      const t=document.createElement('textarea');
      t.value=APP_URL; t.style.position='fixed'; t.style.opacity='0';
      document.body.appendChild(t); t.focus(); t.select();
      const ok=document.execCommand('copy');
      document.body.removeChild(t);
      if(ok){ toast(msg,'success'); return true; }
    }catch(e){}
    return false;
  };
  // Le lien est de toute façon écrit en clair sous le QR code : on renvoie la personne
  // vers quelque chose de FAISABLE plutôt que de la laisser devant un bouton muet.
  const _echec=()=>toast('Copie impossible — le lien est écrit sous le QR code','info');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(APP_URL)
      .then(()=>toast(msg,'success'))
      .catch(()=>{ if(!_secours()) _echec(); });
    return;
  }
  if(!_secours()) _echec();
}

function closeBanner(){
  const b=document.getElementById('install-banner');
  if(b)b.classList.add('hidden');
}

function openShareModal(){
  document.getElementById('mod-share').classList.add('open');
}
function closeShareModal(){
  document.getElementById('mod-share').classList.remove('open');
}
function shareAppNative(){
  if(navigator.share){
    navigator.share({title:'Force Tracker',text:'Suis ta progression en musculation 💪',url:APP_URL}).catch(()=>{});
  } else {
    copyAppLink('share');
  }
}

function _showInstallBanner(title, desc, openAction, copyTarget){
  const b=document.getElementById('install-banner');
  if(!b)return;
  document.getElementById('ib-title').textContent=title;
  document.getElementById('ib-desc').textContent=desc;
  document.getElementById('ib-btn-open').onclick=openAction;
  document.getElementById('ib-btn-copy').onclick=()=>copyAppLink(copyTarget);
  const qr=document.getElementById('ib-qr-img');
  if(qr&&!qr.src.includes('qrserver')){
    qr.src='https://api.qrserver.com/v1/create-qr-code/?size=60x60&data='+encodeURIComponent(APP_URL);
  }
  b.classList.remove('hidden');
}

// Alias maintenu pour compatibilité avec le code de détection précoce
function _showInAppOverlay(icon, title, desc, btnLabel, btnAction, copyTarget){
  const descPlain=desc.replace(/<[^>]+>/g,'');
  _showInstallBanner(title, descPlain, btnAction, copyTarget);
}

function showInstallPrompt(){
  if(_isStandalone())return;
  if(_isIOSInApp()){
    _showInstallBanner(
      'Installer sur iPhone',
      'Ouvre dans Safari → ⬆️ Partager → Sur l\'écran d\'accueil',
      tryOpenSafari, 'safari');
    return;
  }
  if(_isIOS){
    document.getElementById('install-popup').classList.remove('hidden');
    return;
  }
  if(_isFirefoxAndroid()){
    _showInstallBanner(
      'Installer sur Android',
      'Ouvre dans Chrome → ⋮ Menu → Ajouter à l\'écran d\'accueil',
      tryOpenChrome, 'chrome');
    return;
  }
  if(window._deferredInstall){
    window._deferredInstall.prompt();
    window._deferredInstall.userChoice.then(()=>{window._deferredInstall=null;});
  }
}

function closeInstall(){
  const el=document.getElementById('install-popup');
  if(el){el.style.transition='opacity .3s';el.style.opacity='0';setTimeout(()=>{el.classList.add('hidden');el.style.opacity='';el.style.transition='';},300);}
}

// ─── ADMIN MODE ──────────────────────────────────────────────
// _adminMode : initialisé sur window dans <head> de index.html (window._adminMode=false)
var _adminTaps=0,_adminTimer=null;
// L'appareil est-il autorisé à ouvrir l'admin ? (email admin OU déverrouillé une fois par code)
function _isAdminEmail(){
  const e=(S.email||'').trim().toLowerCase();
  return (typeof ADMIN_EMAILS!=='undefined'?ADMIN_EMAILS:['michdu75@gmail.com']).indexOf(e)>=0;
}
function _isAdminUnlocked(){
  try{ if(localStorage.getItem('ft4_admin_ok')==='1')return true; }catch(e){}
  return _isAdminEmail();
}
function onLogoTap(){
  _adminTaps++;
  clearTimeout(_adminTimer);
  if(_adminTaps>=5){
    _adminTaps=0;
    if(!_isAdminUnlocked()){ _promptAdminCode(); return; } // ni email admin ni code → demander le code
    _toggleAdminMode();
    return;
  }
  _adminTimer=setTimeout(()=>{_adminTaps=0;},1500);
}
function _toggleAdminMode(){
  window._adminMode=!window._adminMode;
  const bar=document.getElementById('setup-tabs-bar');
  if(bar)bar.style.display=window._adminMode?'flex':'none';
  if(window._adminMode){
    if(!S.email){S.email='michdu75@gmail.com';persist();}
    const eInp=document.getElementById('email-inp');
    if(eInp)eInp.value=S.email||'michdu75@gmail.com';
    goScreen('setup',document.getElementById('nb-setup'));
    switchSetupTab('connexion',document.getElementById('stab-connexion'));
  }else{
    switchSetupTab('profil',document.getElementById('stab-profil'));
  }
  toast(window._adminMode?'🔧 Mode admin activé':'Mode admin désactivé','info');
}

// ── MODE DÉMO (super admin) ──────────────────────────────────
// Montrer les fonctions à quelqu'un SANS toucher son compte : gèle toute sauvegarde
// (local + cloud). En quittant, on recharge les vraies données depuis localStorage.
function enterDemoMode(){
  if(!_isAdminUnlocked()){toast('Réservé à l\'admin','error');return;}
  if(window._demoMode)return;
  // S'assurer que le localStorage contient bien les vraies données à jour AVANT de geler
  try{persist();}catch(e){}
  window._demoMode=true;
  const rt=document.getElementById('root');if(rt)rt.classList.add('demo-on');
  toast('🎬 Mode démo activé — rien ne sera enregistré','info');
}
function exitDemoMode(){
  if(!window._demoMode)return;
  window._demoMode=false;
  // Recharge les vraies données depuis localStorage → annule tout ce qui a été fait en démo
  try{load();}catch(e){}
  const rt=document.getElementById('root');if(rt)rt.classList.remove('demo-on');
  try{renderHome();}catch(e){}
  try{renderNutrition();}catch(e){}
  try{renderSetup();}catch(e){}
  try{renderLog();}catch(e){}
  try{goScreen('home',document.getElementById('nb-home'));}catch(e){}
  toast('✅ Tes vraies données sont de retour','success');
}
// ── GUIDE DE L'APPLICATION (diaporama, Menu → Outils) ────────
// Guide-film : chaque slide = un vrai écran de l'app (guide/*.jpg) + un doigt animé (tap) + une phrase.
const APP_GUIDE_SLIDES=[
  /* 📉 DIAPO DU GUIDE (règle d'or #11, point 5), et **SANS IMAGE exprès** — pour deux raisons
     distinctes, et les deux comptent :
     ① une capture de la carte du jour montrerait des **grammes qui ne sont pas ceux du
        lecteur**, donc la diapo se lirait comme une recommandation de macros (même raison
        qu'en ft-v1035 et que pour la diapo 🔭 ci-dessous) ;
     ② et surtout, une capture de « Ton évolution » montrerait **UN de ses quatre états** — or
        celui que le lecteur verra dépend de ce qu'il a noté. *Montrer l'état « tu progresses »
        à quelqu'un qui ouvrira l'app sur « pas encore assez de données » fabrique exactement
        l'incompréhension que la diapo devait éviter.*
     ⛔ Elle ne répète pas la pop-up : celle-ci ANNONCE que le chiffre a bougé ; la diapo dit ce
     que la carte FAIT, et pourquoi elle se tait parfois (R25). */
  {icon:'📉', t:'Ta journée d\'abord, ton évolution ensuite', cap:'⛔ <b>« X kcal restantes » n\'a pas été supprimé</b> : le calcul est le même, mais le reste est maintenant traduit en <b>aliments que tu manges déjà</b> (« ≈ 2 × blanc de poulet »). Un nombre de calories ne se mange pas.<br><br>📈 <b>Une carte « Ton évolution »</b> croise ton <b>poids</b>, tes <b>charges</b> et tes <b>repas notés</b> sur <b>14 jours</b>, et te dit si tout va dans le sens de ton objectif.<br><br>⭐ Elle est calculée <b>sur ton téléphone</b> : elle marche <b>hors ligne</b> et ne coûte <b>aucune question à Milo</b>.<br><br>⛔ <b>Et quand elle n\'a pas assez de données, elle le dit et s\'arrête là</b> — pas de flèche, pas de pourcentage. <b>Une flèche est déjà une conclusion.</b>'},
  /* 🔭 DIAPO DU GUIDE (règle d'or #11, point 5), et **SANS IMAGE exprès** : une capture
     montrerait une cible chiffrée — donc des grammes qui ne sont pas ceux du lecteur — et la
     diapo se lirait comme une recommandation de macros. C'est la même raison qu'en ft-v1035.
     ⛔ Elle ne répète aucune pop-up : il n'y en a pas (rien à faire, aucun repère déplacé). */
  {icon:'🔭', t:'Ta cible bouge selon le jour, et c\'est normal', cap:'Les jours o\u00f9 tu <b>t\'entra\u00eenes</b>, l\'app te donne <b>plus de glucides</b> \u2014 le carburant de l\'effort \u2014 et <b>moins de lipides</b>. Les jours de <b>repos</b>, l\'inverse.<br><br>\u2b50 <b>Tes calories ne changent pas</b> : on \u00e9change, on n\'ajoute pas. Et <b>sur la semaine, le total est le m\u00eame</b>.<br><br>\u{1F449} La carte du jour te dit o\u00f9 tu en es (\u00ab \u{1F35A} Jour de s\u00e9ance \u00bb / \u00ab \u{1F634} Jour de repos \u00bb), et <b>les deux chiffres</b> sont dans \u00ab Comment c\'est calcul\u00e9 \u00bb \u2014 tu peux pr\u00e9voir ton jour de repos sans attendre qu\'il arrive.<br><br>\u26d4 <b>Les prot\u00e9ines ne bougent jamais</b> : elles se calculent sur ton poids, pas sur ta s\u00e9ance.'},
  /* 📤 DIAPO DU GUIDE (règle d'or #11, point 5). ⛔ Elle ne répète pas la pop-up — il n'y en
     a pas : ces exports ont un point rouge et de l'aide, pas d'interruption (R25). Elle est ici
     parce que le Guide se lit d'une traite par quelqu'un qui découvre l'app, et « je peux
     ressortir mes données » est une chose qu'on veut savoir AVANT d'y mettre six mois de
     séances, pas le jour où on veut partir. */
  {icon:'📤', t:'Tes données ressortent quand tu veux', cap:'Trois <b>exports en tableur (CSV)</b>, ouvrables dans Excel, Numbers ou Google Sheets :<br><br>🏋️ <b>tes séances</b> — Profil → Exporter<br>⚖️ <b>tes pesées</b> — Progrès → Corps &amp; santé<br>🍽️ <b>ton journal alimentaire</b> — onglet Nutrition<br><br>⭐ Le fichier porte <b>la date du jour</b>, donc deux exports ne s\'écrasent pas. Celui de la nutrition dit même <b>d\'où vient chaque valeur</b> (scannée, tapée, ou estimée).<br><br>⚠️ <b>Rien n\'est envoyé nulle part</b> : le fichier reste sur ton téléphone, et c\'est toi qui choisis quoi en faire.'},
  {icon:'📷', t:'Ton bilan de balance, lu sur ton téléphone', cap:'La <b>photo</b> de ton rapport d\'impédancemètre (<b>Profil → Bilan corporel</b>) est lue <b>directement sur ton téléphone</b> : <b>gratuit</b>, <b>sans réseau</b>, et l\'image ne part nulle part. Et l\'app <b>vérifie ce qu\'elle a lu</b> avant de te le montrer — si les chiffres ne se recoupent pas entre eux, elle préfère <b>ne rien proposer</b>. Relis toujours avant d\'enregistrer.'},
  {icon:'🚶', t:'Tes pas comptent — mais pas deux fois', cap:'Si ta montre envoie tes <b>pas</b> à Santé, une <b>randonnée</b> ou une longue journée debout s\'ajoute à ta dépense du jour.<br><br>⭐ <b>Seulement ce qui dépasse ton habitude</b>, jamais le total : ton niveau d\'activité contient déjà la marche d\'une journée normale. 6 000 pas d\'habitude, 15 000 aujourd\'hui → <b>+290 kcal</b>.<br><br>Un tapis que tu fais chaque semaine est <b>dans</b> ton habitude : rien n\'est compté deux fois.<br><br>📈 <b>Où les voir</b> : <b>Progrès → Corps &amp; santé → « Tes pas »</b>. Le trait vert est ton habitude, les barres vertes sont les journées qui la dépassent.'},
  {icon:'🧭', t:'Tu ne repars jamais de zéro', cap:'Chaque séance, chaque record, chaque sensation s\'inscrit dans <b>ton histoire</b>. Force Tracker s\'en souvient pour toi — et <b>plus tu l\'utilises, plus il t\'aide à progresser</b>. Ce n\'est pas une appli de muscu de plus : c\'est <b>ta mémoire sportive</b>.'},
  {icon:'🤖', t:'Un coach qui te connaît vraiment', cap:'<b>Milo</b> répond à tes questions, te fait des programmes, des conseils — en tenant compte de <b>TOI</b> (ton profil, tes séances, ton ressenti) et de <b>ta vie</b>. Sa règle : <b>t\'aider à continuer, jamais te bloquer</b>. Il protège tes zones fragiles, et plus tu l\'utilises, mieux il te connaît.'},
  {icon:'🔒', t:'Ton histoire t\'appartient', cap:'Force Tracker ne garde pas juste des chiffres : il construit <b>ton histoire sportive</b>. Et elle est <b>à toi</b> — tes séances, tes progrès, tes infos restent <b>privés</b>, utilisés seulement pour t\'aider à progresser. Tu peux même <b>protéger ton compte avec un code perso</b>.'},
  {img:'guide/home.jpg',       tap:[.5,.945],  t:'Ton accueil',            cap:'Tes stats du mois et ta <b>récup du jour</b> d\'un coup d\'œil. Juste en dessous, note ton <b>sommeil</b> (et son <b>historique</b>). Le gros <b>+</b> démarre une séance.'},
  {img:'guide/calendrier.jpg', tap:[.65,.46], t:'Ton mois d\'un coup d\'œil 📅', cap:'Sur l\'Accueil, le calendrier raconte ton mois <b>sans rien ouvrir</b> : plus une case est <b>foncée</b>, plus tu as soulevé lourd ce jour-là. Le <b>trait</b> sous le chiffre dit ce que tu as travaillé (rouge = haut, bleu = dos, violet = bas, orange = tronc, vert = full body) et l\'<b>étoile ⭐</b> marque un record. À gauche, le <b>n° de semaine</b> avec ton tonnage. <b>Tape un jour</b> : son détail s\'ouvre dessous.'},
  {img:'guide/recup-moniteur.jpg', t:'Ta récup, deux styles 💚', cap:'<b>Menu → Apparence → Carte récup</b> : garde l\'<b>anneau</b>, ou passe au <b>moniteur</b> — ton score en gros, une jauge où le <b>rouge</b> est ce qu\'il te reste à récupérer et le <b>vert</b> ce que tu as récupéré, avec un vrai tracé de cœur qui défile. Mêmes données, à toi de choisir.'},
  {img:'guide/etat-du-jour.jpg',tap:[.5,.38],  t:'Comment tu te sens aujourd\'hui ?', cap:'En 1-2 taps sur l\'Accueil : ton <b>énergie</b>, ton <b>moral</b> (😔 → 😄) et une éventuelle <b>gêne/douleur</b> (tape la zone). <b>Milo</b> adapte ses conseils du jour — il protège une zone qui fait mal, et si ton moral est bas il se fait plus <b>doux</b> (jamais un psy). Optionnel, ça repart à zéro chaque jour.'},
  {img:'guide/profil.jpg',     tap:[.5,.60],   t:'Remplis bien ton profil ⭐', cap:'<b>Le plus important !</b> Plus ton profil est complet, plus <b>Milo, ton coach IA</b>, est précis et personnalisé (récup et calories aussi). Un <b>% de remplissage</b> t\'aide à ne rien oublier.'},
  {img:'guide/seance.jpg',     tap:[.875,.305],t:'Ta séance',              cap:'Note tes séries — <b>poids × reps</b> — et coche. Tes <b>records</b> se calculent tout seuls.'},
  {icon:'⏳', t:'Ton repos est un MAXIMUM ⏳', cap:'Le temps de repos n\'est pas un compte à rebours qu\'il faut attendre : c\'est une <b>borne à ne pas dépasser</b>. <b>Tu peux repartir avant, c\'est permis</b> — c\'est ainsi que les coachs écrivent leurs programmes (« repos maximum : 1 à 2 min »). Le chrono ne s\'arrête donc plus à zéro : il continue en <b>+0:12</b>, <b>+0:45</b>… ⚠️ Ce n\'est <b>pas un reproche</b> — un repos plus long est parfois exactement ce qu\'il faut. C\'est simplement une information que tu n\'avais pas : sur de vraies séances, le repos pris vaut <b>2 à 3 fois</b> le repos réglé.'},
  // ⚠️ Diapo SANS image (format `icon:`, comme les 3 premières) : il n'existe pas de capture
  // du bloc cardio, et une diapo utile vaut mieux qu'une diapo repoussée en attendant la photo.
  {icon:'⚡', t:'Quand le temps manque', cap:'Milo connaît ton <b>rythme réel</b> et la <b>durée vraie</b> de tes séances (l\'app les chronomètre). Si ce qu\'il te propose ne rentre pas, il te le <b>dit avec le calcul</b> au lieu de promettre — et il peut <b>grouper deux accessoires en superset</b> pour te rendre des minutes. 🚫 Jamais sur tes mouvements lourds : là, la fatigue coûte des kilos.'},
  {icon:'🔥', t:'Tes calories de séance', cap:'Note ton <b>cardio</b> — 🔥 avant (l\'échauffement) et 🧊 après — et ses calories s\'ajoutent à ta séance. Si tu ne notes rien, l\'app <b>estime</b> 10 min d\'échauffement et de retour au calme ; dès que tu en <b>mesures</b> un, ta mesure remplace l\'estimation, jamais l\'inverse. ⚠️ Le compte de la partie muscu reste <b>approximatif</b> : prends-le comme un ordre de grandeur, pas comme une vérité à la calorie près.'},
  /* 🧠 LES TROIS DIAPOS « MÉTHODE » (15/08/2026) — demande de Michel : *« on sait que perdre du
     poids ou construire de la masse musculaire ne se fait pas pendant la séance de musculation
     mais pendant le repos, la nourriture et le sommeil, comment on pourrait informer
     l'utilisateur sur ça »*.
     ⭐ LE GUIDE ÉTAIT UNE VISITE GUIDÉE : 23 diapos qui disent OÙ sont les choses, et aucune qui
     dise COMMENT ça marche. C'est le manque qu'il désigne aussi en disant que le Guide est
     « trop simpliste ». On le comble là où la question se pose — juste après les calories de
     séance, au moment exact où l'on se demande à quoi tout cet effort sert.
     ⚠️⚠️ ET ON NE DIT PAS QUE LA SÉANCE NE COMPTE PAS. Le raccourci « le muscle se construit au
     repos » est vrai à moitié, et la moitié fausse est dangereuse : sans la tension mécanique de
     la séance, il n'y a **aucun** signal à nourrir, et en déficit on perd du muscle. La séance
     DÉCLENCHE, le reste CONSTRUIT. Écrire l'un sans l'autre pousserait quelqu'un à s'entraîner
     moins en croyant bien faire (R29 : le coût de l'erreur n'est pas symétrique).
     ⚠️ Trois diapos courtes plutôt qu'une longue : la diapo ANNONCE, elle n'est pas un cours
     (R25). Sources : revue narrative hypertrophie (PubMed 42099260) · protéines avant le sommeil
     (Journal of Nutrition / PMC5188418) · compensation énergétique à l'exercice (PMC3696411). */
  {icon:'🌱', t:'Le muscle se construit APRÈS', cap:'Ta séance ne fabrique pas de muscle : elle envoie le <b>signal</b>. La construction, elle, se fait dans les heures et les jours qui suivent — et elle a besoin de <b>matériaux</b> (protéines) et de <b>temps</b>. C\'est pour ça qu\'une séance parfaite suivie de trois nuits de 5 h ne donne rien.<br><br>⚠️ Mais sans la séance, il n\'y a <b>aucun signal à nourrir</b>. Les trois vont ensemble.'},
  {icon:'🍽️', t:'Perdre du gras : l\'assiette décide', cap:'Une séance brûle <b>250 à 450 kcal</b> — l\'équivalent d\'un sandwich. Et le corps <b>compense</b> : après l\'effort on mange un peu plus, on bouge un peu moins sans s\'en rendre compte. C\'est mesuré, et c\'est pour ça que le sport <b>seul</b> fait moins maigrir qu\'on ne l\'espère.<br><br>⚠️ Ça ne veut pas dire qu\'il ne sert à rien : c\'est lui qui te fait perdre du <b>gras</b> et pas du <b>muscle</b>.'},
  {icon:'😴', t:'Le sommeil, le levier oublié', cap:'<b>7 à 9 h</b>. Le sommeil ne fabrique pas le muscle directement, mais il installe les <b>conditions</b> — hormones, récupération nerveuse — sans lesquelles rien ne se répare. C\'est le levier le plus efficace… et le seul qui soit <b>gratuit</b>.<br><br>Note tes nuits dans l\'app : Milo en tient compte quand il juge ta récup.<br><br>⭐ Et si ta <b>montre</b> envoie ton sommeil à Santé, c\'est la <b>durée mesurée</b> qui est utilisée — la saisie à la main <b>lisse les mauvaises semaines</b>, et c\'est justement là que la récup compte. La <b>qualité</b> de la nuit, elle, reste la tienne.'},
  /* 🍽️ L'ONGLET NUTRITION, APRÈS SON RANGEMENT (ft-v1025, 26/08/2026) — règle d'or #11, point 5.
     ⚠️ SANS IMAGE, exprès (format `icon:`) : les captures du Guide dorment dans `guide/*.jpg` et
     celle de la Nutrition montrerait l'ANCIEN ordre. *Une diapo qui montre un écran qui n'existe
     plus est pire qu'une diapo sans image* — on décrit, on ne ment pas.
     ⏭️ À remplacer par `guide/nutrition.jpg` quand la capture sera refaite. */
  {icon:'🍽️', t:'Ta nutrition, de haut en bas', cap:'L\'onglet <b>Macros</b> va du <b>jour</b> vers le <b>durable</b>. En haut, ta journée : ce que tu as mangé, <b>trois anneaux</b> (protéines · glucides · lipides) et <b>« ce qu\'il te reste, en vrai »</b> — traduit en <b>tes</b> aliments, pas en grammes abstraits. Dessous, le bouton pour <b>noter</b>, ta séance du jour, ce que l\'app a appris de ton alimentation, ta semaine. <b>Tout en bas, deux lignes repliées</b> : « Comment c\'est calculé » (BMR, TDEE, répartition, charge/décharge) et « Mes réglages alimentaires » (mode, jeûne, régime, allergies). Un appui les ouvre — leur titre te dit déjà l\'essentiel.'},
  {img:'guide/programmes.jpg', tap:[.5,.42],   t:'Tes programmes',         cap:'Crée, <b>importe</b> (photo/Word/PDF) ou charge un programme en 1 tap. Le bouton <b>✏️</b> modifie un programme enregistré : reps, <b>temps de repos</b> série par série, et un <b>💬 commentaire</b> par exercice (consigne, réglage machine…). Débutant ? Un parcours guidé t\'attend.'},
  {img:'guide/progres.jpg',    tap:[.5,.32],   t:'Tes progrès',            cap:'Tes <b>records</b>, ton poids, ta masse grasse et tes badges — tout en graphiques clairs.'},
  {img:'guide/bilan.jpg',      tap:[.5,.72],   t:'Ton bilan corporel',     cap:'Balance pro (impédance) ? Enregistre tes chiffres — <b>📷 photo</b>, à la main ou code. Poids, graisse, muscle, métabolisme… Tu suis l\'<b>évolution</b> et <b>Milo s\'en sert</b>.'},
  {img:'guide/coach.jpg',      tap:[.5,.86],   t:'Milo, ton coach IA',     cap:'Une <b>question</b> ? Besoin d\'un <b>conseil</b> ou d\'un guide ? Milo répond à tout — il connaît ton profil.'},
  {img:'guide/milo-direct.jpg',                t:'Milo va droit au but',   cap:'Dis-lui ton objectif (« je veux faire de la force ») et Milo t\'<b>aide direct</b> : dès son 1er message il te propose un <b>vrai plan</b> (structure, exercices), adapté à ce qu\'il sait déjà de toi ET à tes <b>zones fragiles</b> — il te montre <b>comment</b> il les protège (« amplitude contrôlée pour ton épaule »). Puis, au plus, <b>UNE</b> question — parfois avec des <b>boutons</b> de réponse rapide. Plus d\'interrogatoire.'},
  /* ⭐ ft-v1053 — CETTE DIAPO EST ENRICHIE, PAS DOUBLÉE (R2/R25). Elle porte déjà exactement ce
     sujet : en écrire une 39ᵉ à côté aurait créé deux diapos qui racontent la même chose et qui
     divergeraient à la première retouche. ⚠️ L'image reste celle d'avant, et c'est assumé : elle
     montre le bouton rouge, qui n'a pas bougé — seule la question au-dessus est nouvelle, et le
     texte la nomme. */
  {img:'guide/milo-seance.jpg',tap:[.5,.45],   t:'Milo démarre ta séance ⚡', cap:'Dis à Milo ta <b>séance du jour</b> (« Développé Couché 4×8, Rowing 4×10… ») ou demande-lui quoi faire maintenant. Il te répond <b>« Cette séance te convient ? »</b> : <b>« Oui, on démarre »</b> l\'ouvre <b>direct dans l\'onglet Séance</b>, poids <b>pré-remplis</b> — et <b>« Non, retravaille »</b> te laisse dire en un tap ce qui cloche (trop lourd, trop long, pas les bons exercices). De la discussion à la barre, en un clic.'},
  {img:'guide/milo-completer.jpg', tap:[.28,.34], t:'Milo te pose de petites questions', cap:'De temps en temps, sur l\'Accueil, Milo te demande <b>une</b> chose pour mieux te conseiller : où tu t\'entraînes, combien de temps, si tu fais <b>un autre sport</b>… Tu réponds <b>en 1 tap</b>, ou tu tapes « Plus tard ». <b>Jamais un questionnaire</b> : une seule question, et au plus une par semaine.'},
  {img:'guide/milo-frequence.jpg', tap:[.28,.53], t:'Il remarque ce que tu fais VRAIMENT', cap:'Milo compare ce que tu as <b>déclaré</b> et ce que tu fais <b>réellement</b> (ta fréquence, ton style d\'entraînement). S\'il voit un écart <b>durable</b>, il te le dit et te <b>propose</b> d\'ajuster — <b>il ne change jamais rien tout seul</b>, c\'est toi qui décides. Et il attend une vraie tendance, jamais une seule séance.'},
  {img:'guide/milo-apprend.jpg', t:'Tu vois tout ce qu\'il a appris', cap:'<b>Menu → « Ce que Milo sait de toi »</b> : une phrase te dit à quel point il peut te conseiller (elle <b>monte</b> et ne redescend jamais), et <b>« 🧠 Milo a appris récemment »</b> liste ses dernières découvertes, la plus récente en haut. Tout est <b>effaçable</b> d\'un tap. 🔒 Privé.'},
  {img:'guide/milo-memoire.jpg',tap:[.26,.63], t:'Milo retient ce que tu lui confies 🧠', cap:'Confie un truc <b>durable</b> à Milo en discutant (« je m\'entraîne le matin », « j\'ai que des haltères »…). Il te propose de le <b>retenir</b> : <b>« 🧠 Je retiens : … ? »</b> → tape <b>Oui, retiens</b> et il s\'en souvient dans toutes vos discussions. Rien sans ton accord ; tu revois tout dans <b>Menu → « Ce que Milo sait de toi »</b>.'},
  {secure:true, t:'Protège ton compte 🔒', cap:'Ajoute un <b>code perso</b> pour que <b>toi seul</b> accèdes à tes données — même depuis un autre téléphone. Va dans <b>Profil → 🔒 Protéger mon compte</b> : on vérifie ton email une fois (pense à tes spams), puis tu choisis ton code. Ça protège tes séances, ton poids et tes infos.'},
  /* ⛔ SANS IMAGE, exprès : une capture montrerait un exercice précis avec une charge précise,
     que le lecteur n'a pas — et la diapo se lirait comme une recommandation de charge. */
  {icon:'📍', t:'Un chiffre qui ne vient de nulle part le dit', cap:'Quand <b>Milo</b> propose une charge sur un exercice que <b>tu n\'as jamais noté dans l\'app</b>, il n\'a <b>aucun repère dans ton historique</b> — même si tu le pratiques depuis des années. L\'app te le dit au lieu de laisser le chiffre passer pour une mesure : <b>c\'est un point de départ à ajuster</b>. Dès ta première série notée, elle a son repère — et le message disparaît.'},
  /* ⛔ SANS IMAGE : une capture montrerait une charge et un exercice précis, que le lecteur
     n'a pas — et la diapo se lirait comme une recommandation d'intensité. */
  {icon:'💪', t:'À quel point tu as forcé', cap:'Après une série, la barre de repos te demande <b>« il t\'en restait combien ? »</b>. Un tap — <b>échec, 1, 2, 3, 4+</b> — et c\'est <b>facultatif</b>. Tu le <b>revois la fois d\'après</b> pour savoir s\'il faut monter, et <b>Milo</b> peut enfin vérifier le cadre de ta discipline au lieu de le supposer.'},
  /* ⛔ SANS IMAGE : la carte n'apparaît que quand il y a un souvenir à relier — une capture
     montrerait un cas qui n'est pas celui du lecteur, et laisserait croire qu'elle est permanente. */
  {icon:'🕰️', t:'Il se souvient de ce que tu as vécu', cap:'Chaque check-in que tu remplis reste. Quand tu notes une douleur que tu avais <b>déjà eue il y a longtemps</b>, l\'Accueil te rappelle <b>quand</b> et <b>combien de temps</b> elle avait duré. Il <b>décrit</b> ce que tu avais noté — il ne prédit rien.'},
  /* ⛔ SANS IMAGE : les constantes dépendent de l'historique du lecteur — une capture
     montrerait des chiffres qui ne sont pas les siens. */
  {icon:'🔭', t:'Ce que ton histoire t\'apprend', cap:'En haut de <b>Progrès</b>, l\'app dégage des <b>constantes</b> de tout ton historique : ton rythme réel, ce qui revient le plus, ce que tes séances travaillent le plus souvent. Des <b>faits</b>, jamais des conseils — <b>à toi d\'en tirer ce que tu veux</b>.'},
  /* ⛔ SANS IMAGE : une capture montrerait une charge et un repos précis, donc elle se lirait
     comme une recommandation d'intensité — or ce qui est vrai ici dépend de la discipline. */
  {icon:'🎽', t:'Ton cadre décide, pas une moyenne', cap:'L\'avertissement « <b>repos trop court pour du lourd</b> » suit désormais <b>ta discipline</b>. En force athlétique on te dira « viser <b>3 à 5 min</b> », parce que c\'est ce que dit ton propre cadre — pas un chiffre unique pour tout le monde. ⚠️ Il ne se <b>relâche</b> jamais : il resserre seulement là où ton cadre est plus exigeant.'},
  /* ⛔ SANS IMAGE : les chiffres dépendent de l'historique du lecteur — une capture montrerait
     des séries qui ne sont pas les siennes, et un « objectif » qu'on refuse justement d'afficher. */
  /* ⛔ SANS IMAGE EXPRÈS : une capture montrerait l'historique de quelqu'un d'autre, et le
     repli se comprend en une phrase. */
  {icon:'🗂️', t:'Le haut de Progrès se replie', cap:'Les trois onglets (<b>Exercices · Poids · Badges</b>) sont <b>tout en haut</b> : tu passes de l\'un à l\'autre sans défiler. Et les deux cartes de résumé sont <b>repliées</b> — un tap sur le titre les ouvre, et <b>l\'app se souvient</b> de ton choix.'},
  {icon:'📊', t:'Ce que tu travailles, par semaine', cap:'En haut de <b>Progrès</b>, tes <b>séries de travail par groupe musculaire</b>, en <b>moyenne par semaine sur 14 jours</b>. ⭐ Deux semaines, parce qu\'une seule est trop courte pour dire quoi que ce soit — mais le chiffre reste <b>par semaine</b>. ⚠️ <b>Sans objectif affiché</b> : en milieu de semaine, être « en dessous » ne veut rien dire. 👉 <b>Milo</b>, lui, reçoit ces chiffres — il connaissait la règle de ta discipline sans jamais savoir combien tu en faisais.'},
  /* ⛔ SANS IMAGE : la capture montrerait UNE des deux échelles, donc elle serait fausse pour
     la moitié des lecteurs — et c'est précisément le sujet de la diapo. */
  {icon:'🎚️', t:'RIR ou RPE, comme tu veux', cap:'Si tu travailles en <b>RPE</b>, dis-le à l\'app : <b>Profil → Échelle d\'effort</b>. La question posée après chaque série, la colonne « précédent » et <b>Milo</b> passent en RPE. ⛔ C\'est la <b>même mesure</b> dite dans l\'autre sens (<i>RPE = 10 − RIR</i>) : rien n\'est converti, rien n\'est perdu, et tu peux revenir.'},
  /* \u26d4 SANS IMAGE, EXPR\u00c8S : une capture montrerait la s\u00e9ance manqu\u00e9e de QUELQU'UN
     D'AUTRE, \u00e0 une date qui n'est pas celle du lecteur \u2014 et la carte est justement celle qui
     ne doit pas ressembler \u00e0 un relev\u00e9 de fautes. */
  {icon:'\U0001F4C5', t:'On te demande, on ne te reproche rien', cap:'Tu avais annonc\u00e9 une s\u00e9ance et elle ne s\'est pas faite ? L\'app te demande simplement <b>ce qui s\'est pass\u00e9</b> \u2014 fatigue, boulot, emp\u00each\u00e9, douleur, flemme \u2014 et un tap suffit. \u26d4 <b>Jamais de rattrapage propos\u00e9, jamais de total affich\u00e9</b> : une s\u00e9ance loup\u00e9e n\'est pas grave \u00e0 l\'\u00e9chelle d\'une semaine. \u2b50 Si la m\u00eame raison revient souvent, Milo peut proposer d\'<b>adapter ton planning</b> \u00e0 ta vraie vie.'},
  /* ⛔ SANS IMAGE : une capture montrerait l'historique de quelqu'un d'autre, avec des
     charges et des dates qui ne sont pas celles du lecteur. */
  {icon:'📤', t:'Ton historique, en tableur ou en PDF', cap:'Dans <b>Progrès</b>, à côté de « Historique séances » : <b>📤 Exporter</b>. <b>CSV</b> pour Excel ou Numbers (une ligne par série), <b>PDF</b> pour un document lisible à montrer à un coach. ⛔ <b>Aucune donnée de santé</b> dedans : ni poids de corps, ni âge, ni sexe.'},
  /* ⛔ SANS IMAGE : une capture montrerait une charge et un repos précis — donc elle se lirait
     comme une recommandation d'intensité, or ce qui est vrai ici dépend de TON maximum. */
  {icon:'🎽', t:'Le repos suit la charge', cap:'Quand une série est <b>lourde</b> (dès 80 % de ton max), elle demande <b>3 min de repos minimum</b> — quel que soit ton objectif. Milo le sait maintenant, et si un repos trop court passe quand même, <b>l\'avertissement s\'affiche sous sa séance dans le chat</b>, avant que tu la lances. ⚠️ Il informe, il ne bloque pas : la charge ne bouge pas, c\'est toi qui décides.'},
  /* 👎 ft-v1059 — DIAPO SANS IMAGE, EXPRÈS. Une capture montrerait une réponse de Milo, donc
     un conseil que le lecteur n'a pas demandé, sous un bouton qui dit « à côté » — l'image
     laisserait croire que c'est CETTE réponse-là qui était mauvaise. Le texte se suffit. */
  {icon:'\u{1F44E}', t:'Dis-le quand Milo répond à côté', cap:'Sous chaque réponse de Milo : <b>« 👎 à côté »</b>. Un tap, quatre motifs — <b>à côté</b>, <b>trop vague</b>, <b>faux</b>, <b>il a oublié</b>. ⛔ <b>Rien de ta conversation n\'est envoyé</b> : le motif est compté sur ton téléphone. Tu peux <b>en plus</b> joindre l\'échange si tu veux que Michel le corrige — la case est <b>décochée par défaut</b>. ⭐ Chaque signalement devient un <b>test permanent</b> : c\'est comme ça que Milo s\'améliore pour de bon.'},
  /* 🔥 ft-v1082 — DIAPO SANS IMAGE, EXPRÈS. Une capture montrerait une montée précise (des kilos,
     un chrono à 2:00) : elle se lirait comme une recommandation de charge, or tout ce qui est
     dit ici est RELATIF au maximum du lecteur. Même raison que la diapo « Le repos suit la
     charge » juste au-dessus. */
  {icon:'🔥', t:'Ton échauffement se dose à ta charge', cap:'Deux choses ont changé dans ta montée en charge.<br><br>⏱️ <b>LE REPOS ENTRE PALIERS SUIT LA CHARGE.</b> Il restait à <b>45 s</b> quel que soit le poids — tu passais donc au palier le plus lourd 45 secondes après le précédent. Maintenant : <b>45 s</b> tant que c\'est léger, <b>90 s</b> à partir de 75 % de ta charge de travail, <b>2 min</b> à partir de 85 %. La barre affiche « <b>palier lourd</b> » pour que tu saches pourquoi.<br><br>⛔ <b>Jamais plus que ton propre repos de travail</b> : si tu l\'as réglé court, un palier lourd le respecte. ⏳ Et c\'est toujours un <b>maximum</b> — tu peux repartir avant.<br><br>📉 <b>MOINS DE PALIERS SUR LES CHARGES LÉGÈRES.</b> L\'app en ajoutait jusqu\'à <b>5 quelle que soit la charge</b> : un squat à 60 kg recevait le protocole d\'un squat à 150. Elle en met désormais autant que la charge le demande.<br><br>⛔ <b>Elle n\'enlève jamais un palier que Milo t\'a écrit</b> — elle arrête seulement d\'en rajouter.'},
  {premium:true, t:'Passe au niveau supérieur ⭐', cap:'Avec <b>Premium</b> : Milo en <b>illimité</b> + les <b>analyses photo</b> (morphologie, étude du corps) pour un vrai coaching perso.'},
];
let _agIdx=0,_agSwipeInit=false;
function openAppGuide(){
  try{if(typeof closeMenuDrawer==='function')closeMenuDrawer();}catch(e){}
  try{if(typeof _markAnchorSeen==='function')_markAnchorSeen('menu-row-appguide');}catch(e){}
  _agIdx=0;_renderAppGuide();
  const ov=document.getElementById('ov-appguide');if(ov)ov.classList.add('open');
  if(!_agSwipeInit){
    const sl=document.getElementById('ag-slide');
    if(sl){
      let x0=null;
      sl.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
      sl.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>45)_agGo(dx<0?1:-1);},{passive:true});
    }
    _agSwipeInit=true;
  }
}
function closeAppGuide(){
  const ov=document.getElementById('ov-appguide');if(ov)ov.classList.remove('open');
  // Callback à la fermeture (ex. nouvel inscrit : enchaîner le prompt d'installation)
  if(window._afterAppGuide){const f=window._afterAppGuide;window._afterAppGuide=null;try{f();}catch(e){}}
}
function _agGo(d){
  const n=_agIdx+d;
  if(n<0)return;
  if(n>=APP_GUIDE_SLIDES.length){closeAppGuide();return;}
  _agIdx=n;_renderAppGuide();
}
function _renderAppGuide(){
  const s=APP_GUIDE_SLIDES[_agIdx];if(!s)return;
  const set=(id,html,prop)=>{const el=document.getElementById(id);if(el)el[prop||'textContent']=html;};
  const phone=document.getElementById('ag-phone'),prem=document.getElementById('ag-premium');
  const img=document.getElementById('ag-img'),tap=document.getElementById('ag-tap');
  if(s.premium||s.secure||s.icon){
    if(phone)phone.style.display='none';
    if(prem){prem.style.display='flex';prem.textContent=s.icon?s.icon:(s.secure?'🔒':'⭐');}
  } else {
    if(prem)prem.style.display='none';
    if(phone)phone.style.display='block';
    if(img&&s.img&&img.getAttribute('src')!==s.img){img.style.opacity='0';img.onload=function(){img.style.opacity='1';};img.src=s.img;}
    if(tap){
      // re-trigger l'animation du doigt à chaque slide
      if(s.tap){tap.style.display='block';tap.style.left=(s.tap[0]*100)+'%';tap.style.top=(s.tap[1]*100)+'%';tap.classList.remove('on');void tap.offsetWidth;tap.classList.add('on');}
      else tap.style.display='none';
    }
  }
  set('ag-title',s.t);set('ag-cap',s.cap,'innerHTML');
  set('ag-count',(_agIdx+1)+' / '+APP_GUIDE_SLIDES.length);
  const dots=document.getElementById('ag-dots');
  if(dots)dots.innerHTML=APP_GUIDE_SLIDES.map((_,i)=>'<span class="ag-dot'+(i===_agIdx?' on':'')+'"></span>').join('');
  const prev=document.getElementById('ag-prev');if(prev)prev.style.visibility=_agIdx===0?'hidden':'visible';
  const next=document.getElementById('ag-next');
  if(next){
    if(s.premium){next.textContent='⭐ Voir le Premium';next.onclick=_agPremiumCta;}
    else if(_agIdx===APP_GUIDE_SLIDES.length-1){next.textContent='Terminer ✓';next.onclick=function(){_agGo(1);};}
    else {next.textContent='Suivant →';next.onclick=function(){_agGo(1);};}
  }
}
// Fin du guide → emmène l'utilisateur vers Milo (Coach IA) où se trouve l'accès Premium.
function _agPremiumCta(){
  closeAppGuide();
  try{goScreen('coach',document.getElementById('nb-coach'));}catch(e){}
}

/* ── OUTILS CLONE DE TEST — ⚠️ LE CLONE A ÉTÉ RETIRÉ LE 23/08/2026 (ft-v976) ───────────────
   Décision de Michel : *« plus besoin des clones, ça permettra de gagner du temps »*.
   MESURÉ avant de couper : sur les 60 dernières versions, `clone/` a changé à chaque fois et
   **zéro fois tout seul** — il ne servait plus de bac à sable, il recopiait la prod. Il coûtait
   8 fichiers à dupliquer par version, et il a failli coûter cher le jour même (91 lignes du shim
   d'isolation effacées par un `cp` trop rapide, restaurées de justesse).

   ⛔⛔ CES GARDES `window.__FT_CLONE__` SONT VOLONTAIREMENT CONSERVÉES, ET CE N'EST PAS UN OUBLI
   (R30 — un retrait s'écrit, sinon le suivant « répare » une décision). Les retirer changerait
   des COMPORTEMENTS, pas seulement du code mort : plusieurs essais vivent derrière ces gardes et
   les débrancher les rendrait soit universels, soit perdus. On a supprimé le clone, pas arbitré
   ses expériences — c'est une décision séparée, listée dans le journal de ft-v976.
   👉 Si un bac à sable redevient nécessaire, il se refabrique depuis la prod : c'est exactement
   comme ça qu'il est né le 04/07/2026. Ces gardes rendent la reconstruction immédiate.
   ────────────────────────────────────────────────────────────────────────────────────────── */
// Affiche les éléments réservés au clone (le clone pose window.__FT_CLONE__=true dans son shim).
function _initCloneTools(){
  if(!window.__FT_CLONE__)return;
  try{document.documentElement.classList.add('is-clone');}catch(e){} // marqueur pour les éléments en test clone-only (ex. .ob-clone-only)
  const c=document.getElementById('admin-clone-reset-card');
  if(c)c.style.display='flex';
  const u=document.getElementById('admin-clone-unlimited-card');
  if(u)u.style.display='flex';
  _syncCloneUnlimBtn();
}
// Bouton admin (clone) : bascule le mode illimité des questions Milo (localStorage 'ftCloneUnlimited', préfixé cl_)
function _syncCloneUnlimBtn(){
  const b=document.getElementById('admin-clone-unlim-btn');if(!b)return;
  let on=false;try{on=localStorage.getItem('ftCloneUnlimited')==='1';}catch(e){}
  b.textContent = on ? '🔒 Repasser en 10 questions (réaliste)' : '♾️ Passer en illimité';
}
function toggleCloneUnlimited(){
  if(!window.__FT_CLONE__){toast('Réservé au clone de test','error');return;}
  let on=false;try{on=localStorage.getItem('ftCloneUnlimited')==='1';}catch(e){}
  try{ if(on) localStorage.removeItem('ftCloneUnlimited'); else localStorage.setItem('ftCloneUnlimited','1'); }catch(e){}
  _syncCloneUnlimBtn();
  if(typeof updateCoachHeader==='function')updateCoachHeader();
  toast(on?'Clone repassé en 10 questions (réaliste)':'Clone en illimité (test long)','success');
}
// Efface les données de CE clone et relance l'inscription depuis zéro (comme un nouvel inscrit, sans email).
function resetOnboardingTest(){
  if(!window.__FT_CLONE__){toast('Réservé au clone de test','error');return;}
  showConfirm('Refaire l\'inscription ?','Les données de ce clone vont être effacées et l\'inscription repartira de zéro (comme un nouvel inscrit).',()=>{
    try{localStorage.clear();}catch(e){}   // dans le clone : n'efface que les clés cl_ (stockage isolé)
    try{document.documentElement.classList.remove('ob-done');}catch(e){}
    location.reload();
  },'Recommencer');
}
// Demande le code de secours (appareil sans email admin) — overlay simple
function _promptAdminCode(){
  let ov=document.getElementById('ov-admin-code');
  if(!ov){
    ov=document.createElement('div');ov.className='overlay';ov.id='ov-admin-code';
    ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};
    document.body.appendChild(ov);
  }
  ov.innerHTML='<div class="modal" style="max-width:340px;padding:22px 18px;">'
    +'<div style="font-size:17px;font-weight:800;color:var(--t1);margin-bottom:6px;">🔒 Accès admin</div>'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:16px;">Réservé au propriétaire. Entre le code d\'accès.</div>'
    +'<input type="password" id="admin-code-inp" inputmode="numeric" autocomplete="off" placeholder="Code" style="width:100%;box-sizing:border-box;margin-bottom:14px;" onkeydown="if(event.key===\'Enter\')_submitAdminCode()">'
    +'<button class="btn btn-red" style="width:100%;" onclick="_submitAdminCode()">Déverrouiller</button>'
    +'<button class="btn btn-bg2" style="width:100%;margin-top:8px;" onclick="document.getElementById(\'ov-admin-code\').classList.remove(\'open\')">Annuler</button>'
    +'</div>';
  ov.classList.add('open');
  setTimeout(()=>{const i=document.getElementById('admin-code-inp');if(i)i.focus();},80);
}
function _submitAdminCode(){
  const inp=document.getElementById('admin-code-inp');
  const val=inp?inp.value:'';
  const code=(typeof ADMIN_CODE!=='undefined')?ADMIN_CODE:'';
  if(val&&code&&val===code){
    try{localStorage.setItem('ft4_admin_ok','1');}catch(e){}
    document.getElementById('ov-admin-code')?.classList.remove('open');
    _toggleAdminMode();
  }else{
    toast('Code incorrect','error');
    if(inp){inp.value='';inp.focus();}
  }
}

function switchSetupTab(tab,btn){
  const cx=document.getElementById('setup-connexion');
  const pr=document.getElementById('setup-profil');
  if(tab==='connexion'){
    if(pr)pr.style.display='none';
    if(cx){cx.style.display='flex';cx.style.flexDirection='column';cx.style.gap='12px';}
    if(typeof _showAdminPremiumStatic==='function')_showAdminPremiumStatic();
    if(typeof renderErrLog==='function')renderErrLog();
  } else {
    if(cx)cx.style.display='none';
    if(pr){pr.style.display='flex';pr.style.flexDirection='column';}
  }
  document.querySelectorAll('.setup-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

// ─── BADGES ──────────────────────────────────────────────────
const BADGES=[
  {id:'first_session',icon:'🏋️',name:'Premier soulevé',desc:'Première séance enregistrée',cat:'evolution'},
  {id:'fire',icon:'🔥',name:'En feu',desc:'3 séances dans la même semaine',cat:'evolution'},
  {id:'regular_10',icon:'💪',name:'Régulier',desc:'10 séances au total',cat:'evolution'},
  {id:'assidu_25',icon:'⚡',name:'Assidu',desc:'25 séances au total',cat:'evolution'},
  {id:'veteran_50',icon:'🏆',name:'Vétéran',desc:'50 séances au total',cat:'evolution'},
  {id:'legend_100',icon:'💎',name:'Légende',desc:'100 séances au total',cat:'evolution'},
  {id:'first_pr',icon:'🎯',name:'Premier PR',desc:'Premier record personnel battu',cat:'perf'},
  /* ⛔⛔ LE LIBELLÉ DISAIT « BATTUS », LE CODE COMPTE AUTRE CHOSE (corrigé ft-v1099).
     `prCount = Object.keys(S.prs).length` = le nombre d'EXERCICES qui ont un record, pas le
     nombre de records BATTUS. Mesuré : **une seule séance** avec 5 exercices différents, zéro
     record amélioré → le badge « 5 PRs battus » tombe quand même.
     ⭐⭐ ON CORRIGE LE TEXTE, PAS LE CODE, ET C'EST UN ARBITRAGE (R29) : durcir la condition
     RETIRERAIT le badge à tous ceux qui l'ont déjà. *Reprendre une récompense obtenue coûte
     plus cher qu'un libellé imprécis* — et le code, lui, mesure quelque chose de vrai et
     d'utile : la variété travaillée. On lui donne son vrai nom. */
  {id:'prog_5',icon:'📈',name:'En progression',desc:'5 exercices avec un record',cat:'perf'},
  {id:'machine_20',icon:'🚀',name:'Machine',desc:'20 exercices avec un record',cat:'perf'},
  {id:'club_100',icon:'💯',name:'Club des 100kg',desc:'Squat ou Développé Couché à 100kg',cat:'perf'},
  {id:'club_140',icon:'🔱',name:'Club des 140kg',desc:'Soulevé de Terre à 140kg',cat:'perf'},
  {id:'streak_7',icon:'📅',name:'Streak 7 jours',desc:'7 jours consécutifs d\'entraînement',cat:'streak'},
  {id:'streak_30',icon:'🌟',name:'Streak 30 jours',desc:'30 jours consécutifs',cat:'streak'},
  {id:'streak_90',icon:'🎖️',name:'Streak 90 jours',desc:'90 jours consécutifs',cat:'streak'},
  {id:'early_bird',icon:'🌅',name:'Lève-tôt',desc:'Séance avant 7h du matin',cat:'special'},
  {id:'night_owl',icon:'🌙',name:'Noctambule',desc:'Séance après 22h',cat:'special'},
  {id:'birthday',icon:'🎂',name:'Bon anniversaire',desc:'Séance le jour de ton anniversaire',cat:'special'},
  {id:'premium_badge',icon:'👑',name:'Premium',desc:'Badge doré pour les utilisateurs Premium',cat:'special'},
  {id:'super_admin',icon:'🦸',name:'Super Admin',desc:'Le boss de Force Tracker 😎',cat:'special'},
];

function _getMaxStreak(){
  if(!S.sessions||!S.sessions.length)return 0;
  const dates=[...new Set(S.sessions.map(s=>s.date).filter(Boolean))].sort();
  if(!dates.length)return 0;
  let max=1,cur=1;
  for(let i=1;i<dates.length;i++){
    const diff=(new Date(dates[i]+'T12:00:00')-new Date(dates[i-1]+'T12:00:00'))/(864e5);
    if(Math.round(diff)===1){cur++;if(cur>max)max=cur;}else if(diff>1)cur=1;
  }
  return max;
}

function _checkBadgeCond(badge){
  const prCount=Object.keys(S.prs||{}).length;
  switch(badge.id){
    case 'first_session':return (S.sessions||[]).length>=1;
    case 'fire':{
      const wk={};
      (S.sessions||[]).forEach(sess=>{
        const d=new Date((sess.date||'')+'T12:00:00');if(isNaN(d))return;
        const m=new Date(d);m.setDate(d.getDate()-((d.getDay()+6)%7));
        const k=m.toISOString().slice(0,10);wk[k]=(wk[k]||0)+1;
      });
      return Object.values(wk).some(c=>c>=3);
    }
    case 'regular_10':return (S.sessions||[]).length>=10;
    case 'assidu_25':return (S.sessions||[]).length>=25;
    case 'veteran_50':return (S.sessions||[]).length>=50;
    case 'legend_100':return (S.sessions||[]).length>=100;
    case 'first_pr':return prCount>=1;
    case 'prog_5':return prCount>=5;
    case 'machine_20':return prCount>=20;
    case 'club_100':{
      const sq=S.prs['Squat à la Barre'],bp=S.prs['Développé Couché'];
      return !!(sq&&sq.kg>=100)||(bp&&bp.kg>=100);
    }
    case 'club_140':{const dl=S.prs['Soulevé de Terre'];return !!(dl&&dl.kg>=140);}
    case 'streak_7':return _getMaxStreak()>=7;
    case 'streak_30':return _getMaxStreak()>=30;
    case 'streak_90':return _getMaxStreak()>=90;
    case 'early_bird':return (S.sessions||[]).some(s=>{const h=typeof s.startHour==='number'?s.startHour:(s.ts||s.id?new Date(s.ts||s.id).getHours():-1);return h>=0&&h<7;});
    case 'night_owl':return (S.sessions||[]).some(s=>{const h=typeof s.startHour==='number'?s.startHour:(s.ts||s.id?new Date(s.ts||s.id).getHours():-1);return h>=22;});
    case 'birthday':{
      if(!S.bday)return false;
      const parts=(S.bday||'').split('/');if(parts.length<2)return false;
      const bd=parseInt(parts[0]),bm=parseInt(parts[1]);
      return (S.sessions||[]).some(sess=>{
        if(!sess.date)return false;
        const dt=new Date(sess.date+'T12:00:00');
        return dt.getDate()===bd&&(dt.getMonth()+1)===bm;
      });
    }
    case 'premium_badge':return !!S.premium;
    case 'super_admin':return typeof _isAdminUnlocked==='function' && _isAdminUnlocked();
    default:return false;
  }
}

// Progression vers un badge verrouillé (compteur + barre). null = badge sans progression (booléen).
function _badgeProgress(badge){
  const nS=(S.sessions||[]).length;
  const prCount=Object.keys(S.prs||{}).length;
  switch(badge.id){
    case 'first_session':return {cur:Math.min(nS,1),target:1};
    case 'regular_10':  return {cur:nS,target:10};
    case 'assidu_25':   return {cur:nS,target:25};
    case 'veteran_50':  return {cur:nS,target:50};
    case 'legend_100':  return {cur:nS,target:100};
    case 'first_pr':    return {cur:Math.min(prCount,1),target:1};
    case 'prog_5':      return {cur:prCount,target:5};
    case 'machine_20':  return {cur:prCount,target:20};
    case 'streak_7':    return {cur:_getMaxStreak(),target:7};
    case 'streak_30':   return {cur:_getMaxStreak(),target:30};
    case 'streak_90':   return {cur:_getMaxStreak(),target:90};
    case 'fire':{
      const wk={};(S.sessions||[]).forEach(sess=>{const d=new Date((sess.date||'')+'T12:00:00');if(isNaN(d))return;const m=new Date(d);m.setDate(d.getDate()-((d.getDay()+6)%7));const k=m.toISOString().slice(0,10);wk[k]=(wk[k]||0)+1;});
      const best=Object.values(wk).reduce((a,c)=>Math.max(a,c),0);
      return {cur:Math.min(best,3),target:3};
    }
    case 'club_100':{
      const sq=S.prs['Squat à la Barre'],bp=S.prs['Développé Couché'];
      return {cur:Math.round(Math.max(sq?sq.kg||0:0, bp?bp.kg||0:0)),target:100,unit:' kg'};
    }
    case 'club_140':{const dl=S.prs['Soulevé de Terre'];return {cur:Math.round(dl?dl.kg||0:0),target:140,unit:' kg'};}
    default:return null; // lève-tôt, noctambule, anniversaire, premium, super admin
  }
}

function checkBadges(silent){
  if(!S.badges)S.badges={};
  const newOnes=[];
  BADGES.forEach(b=>{
    if(S.badges[b.id])return;
    try{if(_checkBadgeCond(b)){S.badges[b.id]={unlockedAt:today()};newOnes.push(b);}}catch(e){}
  });
  if(newOnes.length)persist();
  if(!silent&&newOnes.length){
    newOnes.forEach((b,i)=>setTimeout(()=>toast(`${b.icon} Badge débloqué : ${b.name} !`,'success'),i*1000));
  }
}

function renderBadges(){
  const grid=document.getElementById('badge-grid');
  if(!grid)return;
  if(!S.badges)S.badges={};
  grid.innerHTML=BADGES.map(b=>{
    const unlocked=!!S.badges[b.id];
    const d=unlocked?S.badges[b.id].unlockedAt:'';
    let progHtml='';
    if(!unlocked){
      const p=(typeof _badgeProgress==='function')?_badgeProgress(b):null;
      if(p&&p.target>1){
        const cur=Math.max(0,Math.min(p.cur,p.target));
        const pct=Math.round(cur/p.target*100);
        progHtml=`<div class="badge-prog"><div class="badge-prog-bar"><div class="badge-prog-fill" style="width:${pct}%"></div></div><div class="badge-prog-txt">${cur}/${p.target}${p.unit||''}</div></div>`;
      }
    }
    return `<div class="badge-card ${unlocked?'unlocked':'locked'}">
      ${unlocked?'<div class="badge-glow"></div>':''}
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      ${d?`<div class="badge-date">${fmtD(d)}</div>`:''}
      ${progHtml}
    </div>`;
  }).join('');
}

function showPrCongrats(pr){
  if(!pr||!pr.newRm)return;
  document.getElementById('pr-name-txt').textContent=S.name||'Champion';
  document.getElementById('pr-ex-txt').textContent='Nouveau record sur '+pr.ex+' !';
  document.getElementById('pr-old-txt').textContent=pr.oldRm>0?fmt(pr.oldRm)+'kg':'–';
  document.getElementById('pr-new-txt').textContent=fmt(pr.newRm)+'kg';
  const delta=pr.oldRm>0?' (+'+fmt(pr.newRm-pr.oldRm)+'kg)':'';
  document.getElementById('pr-delta-txt').textContent='1RM estimé'+delta;
  const lvlEl=document.getElementById('pr-lvl-txt');if(lvlEl)lvlEl.style.display='none';
  document.getElementById('ov-pr-congrats').classList.add('open');
}

function fmtBday(el){
  const prev=el.value;
  let digits=prev.replace(/\D/g,'');
  if(digits.length>4)digits=digits.slice(0,4);
  let out=digits;
  if(digits.length>2)out=digits.slice(0,2)+'/'+digits.slice(2);
  if(out!==prev)el.value=out;
  saveBday(out);
}
function saveBday(val){
  S.bday=val;persist();
  checkBadges();
}

let _weekSumText='';
// Badge « ✅ Application mise à jour » : affiché une fois au reboot qui suit une mise à jour du code
// (le flag ft4_just_updated est posé juste avant le reload de MAJ). Pas au tout 1er install (on se
// base sur la présence d'un compte existant pour distinguer install ≠ mise à jour).
function checkJustUpdated(){
  try{
    const isUpdate=localStorage.getItem('ft4_just_updated')==='1';
    const existing=localStorage.getItem('ft4_app_seen')==='1'||!!localStorage.getItem('ft4_name');
    if(isUpdate){
      localStorage.removeItem('ft4_just_updated');
      if(existing)setTimeout(()=>{ if(typeof toast==='function')toast('✅ Application mise à jour','success'); },800);
    }
    localStorage.setItem('ft4_app_seen','1');
  }catch(e){}
}
function checkWeeklySummary(){
  const now=new Date();
  if(now.getDay()!==1)return; // lundi seulement
  const thisMonday=today();
  if(S.lastWeekSummary===thisMonday)return;
  // Semaine précédente : lundi-dimanche
  // fenêtre ancrée sur today() (midi local) : un lundi entre minuit et 2 h, l'ancienne version
  // faisait glisser la semaine résumée d'un jour (dimanche→samedi au lieu de lundi→dimanche)
  const noon=new Date(thisMonday+'T12:00:00');
  const prevMon=new Date(noon);prevMon.setDate(noon.getDate()-7);
  const prevSun=new Date(noon);prevSun.setDate(noon.getDate()-1);
  const ws=prevMon.toISOString().slice(0,10);
  const we=prevSun.toISOString().slice(0,10);
  const lastWeekSess=(S.sessions||[]).filter(s=>s.date&&s.date>=ws&&s.date<=we);
  if(!lastWeekSess.length)return;
  S.lastWeekSummary=thisMonday;persist();
  const sessCount=lastWeekSess.length;
  const totalVol=lastWeekSess.reduce((a,s)=>a+(_workVol(s)||s.volume||0),0);
  const totalCal=lastWeekSess.reduce((a,s)=>a+(s.calories||0),0);
  const newBadges=Object.entries(S.badges||{})
    .filter(([,v])=>v.unlockedAt&&v.unlockedAt>=ws&&v.unlockedAt<=we)
    .map(([id])=>BADGES.find(b=>b.id===id)).filter(Boolean);
  const el=document.getElementById('week-sum-content');if(!el)return;
  el.innerHTML=`
    <div style="font-size:13px;color:var(--t3);font-weight:700;margin-bottom:4px;">Semaine du ${fmtD(ws)} au ${fmtD(we)}</div>
    <div class="week-sum-row"><span class="week-sum-lbl">🏋️ Séances</span><span class="week-sum-val">${sessCount}</span></div>
    <div class="week-sum-row"><span class="week-sum-lbl">📦 Volume total</span><span class="week-sum-val">${Math.round(totalVol)} kg</span></div>
    ${totalCal?`<div class="week-sum-row"><span class="week-sum-lbl">🔥 Calories</span><span class="week-sum-val">${totalCal} kcal</span></div>`:''}
    ${newBadges.length?`<div class="week-badge-pill">🏅 ${newBadges.map(b=>b.icon+' '+b.name).join(' · ')}</div>`:''}
  `;
  _weekSumText=`Force Tracker — Semaine du ${fmtD(ws)}\n🏋️ ${sessCount} séance${sessCount>1?'s':''}\n📦 Volume : ${Math.round(totalVol)} kg\n${totalCal?'🔥 Calories : '+totalCal+' kcal\n':''}${newBadges.length?'🏅 Badges : '+newBadges.map(b=>b.icon+' '+b.name).join(', ')+'\n':''}💪 Force Tracker`;
  setTimeout(()=>document.getElementById('ov-week-summary').classList.add('open'),1500);
}

/* 📅 LE BILAN DE FIN DE MOIS — CALCULÉ À LA VOLÉE, JAMAIS FIGÉ (15/08/2026)
   Michel : *« on a la pop-up en début de semaine pour savoir ce que l'on a fait, j'aimerais celle
   de fin de mois et qui est archivée sur l'application quelque part et être revue »*.

   ⭐⭐ LE CHOIX QUI COMPTE : on n'ARCHIVE PAS un instantané, on RECALCULE depuis les séances.
   Un bilan figé au 1ᵉʳ du mois se serait mis à mentir dès qu'on touche à l'historique — et ça
   vient d'arriver le soir même : le recalage des calories (ft-v867) a changé 29 séances d'un
   coup. Un instantané aurait gardé les anciens chiffres et se serait contredit avec l'écran
   Progrès, sans que rien ne le signale. *Deux sources qui se contredisent, la famille de bugs la
   plus vicieuse du projet* (R1/R2 : une information a UN propriétaire, ici `S.sessions`).
   👉 On ne mémorise donc qu'UNE chose : le dernier mois ANNONCÉ (`S.lastMonthSummary`), pour ne
   pas répéter la pop-up. Tout le reste se relit.
   ⚠️ Et le mois se compare au précédent : c'est ce qu'un bilan mensuel apporte de plus que
   l'hebdo — pas un chiffre de plus, une TENDANCE (R12 : raisonner sur des tendances). */
const _MOIS_FR=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function _moisLisible(ym){
  const [a,m]=String(ym||'').split('-');
  return (_MOIS_FR[(+m||1)-1]||'?')+' '+a;
}
// Le mois précédent d'un 'YYYY-MM'
function _moisAvant(ym){
  let [a,m]=String(ym).split('-').map(Number);
  m--; if(m<1){m=12;a--;}
  return a+'-'+String(m).padStart(2,'0');
}
// Les mois qui contiennent au moins une séance, du plus récent au plus ancien
function _moisAvecSeances(){
  const v={};
  (S.sessions||[]).forEach(s=>{ if(s&&s.date) v[String(s.date).slice(0,7)]=1; });
  return Object.keys(v).sort().reverse();
}
/** Le bilan d'un mois, recalculé depuis les séances. Rend null si le mois est vide. */
function _bilanMois(ym){
  const sess=(S.sessions||[]).filter(s=>s&&s.date&&String(s.date).slice(0,7)===ym);
  if(!sess.length) return null;
  const vol=sess.reduce((a,s)=>a+((typeof _workVol==='function'?_workVol(s):0)||s.volume||0),0);
  const kcal=sess.reduce((a,s)=>a+(s.calories||0),0);
  let series=0; sess.forEach(s=>(s.exs||[]).forEach(e=>(e.sets||[]).forEach(x=>{
    if(x&&x.done&&x.type!=='É'&&x.type!=='W')series++; })));
  const jours=new Set(sess.map(s=>s.date)).size;
  // Records battus DANS le mois (la date du PR fait foi)
  const prs=Object.entries(S.prs||{})
    .filter(([,v])=>v&&v.date&&String(v.date).slice(0,7)===ym)
    .map(([nom,v])=>({nom, kg:v.kg, reps:v.reps}));
  const badges=Object.entries(S.badges||{})
    .filter(([,v])=>v&&v.unlockedAt&&String(v.unlockedAt).slice(0,7)===ym)
    .map(([id])=>(typeof BADGES!=='undefined'?BADGES.find(b=>b.id===id):null)).filter(Boolean);
  // Poids de corps : première et dernière pesée du mois
  const pesees=(S.weightLog||[]).filter(w=>w&&w.date&&String(w.date).slice(0,7)===ym)
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  /* ⛔ LE MÊME `bw` FAUX QU'EN state.js, ET IL N'AVAIT PAS ÉTÉ VU (corrigé ft-v981).
     La ligne « ⚖️ Poids de corps 85 → 84 kg » du bilan mensuel ne s'affichait donc JAMAIS :
     `debut`/`fin` valaient `undefined`, et le test d'affichage plus bas échouait en silence.
     ⚠️ *Une clé fausse ne se trouve jamais toute seule* — quand on en trouve une, il faut
     chercher ses jumelles (R8). Celle-ci était protégée par sa propre fixture fausse. */
  const _pKg = w => (w && w.kg!=null) ? w.kg : (w?w.bw:undefined);
  const bw = pesees.length ? {debut:_pKg(pesees[0]), fin:_pKg(pesees[pesees.length-1])} : null;
  // ⚠️ La comparaison n'a de sens que si le mois précédent existe VRAIMENT dans l'historique.
  // Comparer à un mois où l'app n'était pas encore installée annoncerait « −100 % » à quelqu'un
  // qui n'a rien manqué du tout (R29 : le coût d'un chiffre faux n'est pas nul).
  const av=(S.sessions||[]).filter(s=>s&&s.date&&String(s.date).slice(0,7)===_moisAvant(ym));
  let comp=null;
  if(av.length){
    const volAv=av.reduce((a,s)=>a+((typeof _workVol==='function'?_workVol(s):0)||s.volume||0),0);
    comp={nSess:av.length, vol:volAv,
          dSess:sess.length-av.length,
          dVol:volAv?Math.round((vol-volAv)/volAv*100):null};
  }
  return {ym, label:_moisLisible(ym), nSess:sess.length, vol:Math.round(vol), kcal, series, jours,
          prs, badges, bw, comp};
}
let _moisVu='';
function _renderBilanMois(ym){
  const b=_bilanMois(ym); const el=document.getElementById('month-sum-content');
  if(!el) return;
  _moisVu=ym;
  if(!b){ el.innerHTML='<div style="color:var(--t3);font-size:13px;">Aucune séance ce mois-là.</div>'; return; }
  const fl=(n)=>n>0?('+'+n):String(n);
  const ligne=(l,v)=>`<div class="week-sum-row"><span class="week-sum-lbl">${l}</span><span class="week-sum-val">${v}</span></div>`;
  let h=`<div style="font-size:13px;color:var(--t3);font-weight:700;margin-bottom:4px;text-transform:capitalize;">${b.label}</div>`;
  h+=ligne('🏋️ Séances', b.nSess+(b.comp?` <span style="font-size:11px;color:${b.comp.dSess>=0?'var(--green)':'var(--gold)'};">${fl(b.comp.dSess)}</span>`:''));
  h+=ligne('📅 Jours d\'entraînement', b.jours);
  h+=ligne('🔢 Séries de travail', b.series);
  h+=ligne('📦 Volume', Math.round(b.vol).toLocaleString('fr-FR')+' kg'
      +(b.comp&&b.comp.dVol!==null?` <span style="font-size:11px;color:${b.comp.dVol>=0?'var(--green)':'var(--gold)'};">${fl(b.comp.dVol)} %</span>`:''));
  if(b.kcal) h+=ligne('🔥 Calories', b.kcal.toLocaleString('fr-FR')+' kcal');
  if(b.bw && b.bw.debut!=null && b.bw.fin!=null && b.bw.debut!==b.bw.fin){
    const d=Math.round((b.bw.fin-b.bw.debut)*10)/10;
    h+=ligne('⚖️ Poids de corps', b.bw.debut+' → '+b.bw.fin+' kg <span style="font-size:11px;color:var(--t3);">('+fl(d)+')</span>');
  }
  if(b.prs.length){
    h+=`<div class="week-badge-pill" style="margin-top:8px;">🏆 ${b.prs.length} record${b.prs.length>1?'s':''} — `
      +b.prs.slice(0,3).map(p=>_escNote?_escNote(p.nom):p.nom).join(' · ')
      +(b.prs.length>3?` +${b.prs.length-3}`:'')+`</div>`;
  }
  if(b.badges.length){
    h+=`<div class="week-badge-pill">🏅 ${b.badges.map(x=>x.icon+' '+x.name).join(' · ')}</div>`;
  }
  if(!b.comp) h+=`<div style="font-size:11.5px;color:var(--t3);margin-top:8px;">Pas de mois précédent dans ton historique — rien à comparer pour l\'instant.</div>`;
  el.innerHTML=h;
  // le sélecteur de mois
  const sel=document.getElementById('month-sum-pick');
  if(sel){
    const mois=_moisAvecSeances();
    sel.innerHTML=mois.map(m=>`<button class="btn ${m===ym?'btn-red':'btn-bg2'}" style="width:auto;flex:0 0 auto;padding:7px 12px;font-size:12px;text-transform:capitalize;" onclick="_renderBilanMois('${m}')">${_moisLisible(m)}</button>`).join('');
  }
}
/** Ouvre les bilans mensuels — sur le mois demandé, sinon le plus récent qui a des séances. */
function openMonthReports(ym){
  const mois=_moisAvecSeances();
  if(!mois.length){ if(typeof toast==='function')toast('Aucune séance enregistrée pour l\'instant','info'); return; }
  _renderBilanMois(ym&&mois.indexOf(ym)>=0?ym:mois[0]);
  const ov=document.getElementById('ov-month-summary'); if(ov)ov.classList.add('open');
}
/** Au 1ᵉʳ passage d'un nouveau mois : on annonce le bilan du mois écoulé, UNE fois. */
function checkMonthlySummary(){
  try{
    const t=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
    const moisCourant=t.slice(0,7);
    const moisEcoule=_moisAvant(moisCourant);
    if(S.lastMonthSummary===moisEcoule) return;      // déjà annoncé
    if(!_bilanMois(moisEcoule)) return;              // rien à raconter
    S.lastMonthSummary=moisEcoule; persist();
    setTimeout(()=>openMonthReports(moisEcoule), 2200);   // après le bilan hebdo, pas en même temps
  }catch(e){ console.warn('[bilan mensuel]',e); }
}
function copyMonthSummary(){
  const b=_bilanMois(_moisVu); if(!b) return;
  const txt=`Force Tracker — ${b.label}\n🏋️ ${b.nSess} séance${b.nSess>1?'s':''}\n📦 Volume : ${Math.round(b.vol).toLocaleString('fr-FR')} kg`
    +(b.kcal?`\n🔥 ${b.kcal.toLocaleString('fr-FR')} kcal`:'')
    +(b.prs.length?`\n🏆 ${b.prs.length} record${b.prs.length>1?'s':''}`:'');
  navigator.clipboard.writeText(txt).then(()=>toast('Bilan copié !','success')).catch(()=>toast('Copie impossible','error'));
}
function copyWeekSummary(){
  navigator.clipboard.writeText(_weekSumText).then(()=>toast('Résumé copié !','success')).catch(()=>toast('Copie impossible','error'));
  document.getElementById('ov-week-summary').classList.remove('open');
}

// ─── PLAN DE REPAS IA ────────────────────────────────────────
// ── Régime alimentaire + restrictions (végé, halal, allergies…) ──
function _renderDietCard(){
  const el=document.getElementById('diet-card'); if(!el)return;
  const diet=S.diet||'';
  const dietBtn=(v,l)=>`<button onclick="setDiet('${v}')" class="btn ${diet===v?'btn-red':'btn-bg2'}" style="font-size:13px;padding:10px 6px;letter-spacing:0;">${l}</button>`;
  const restr=S.dietRestrictions||[];
  const rBtn=(k,l)=>`<button onclick="toggleDietRestriction('${k}')" class="btn ${restr.includes(k)?'btn-red':'btn-bg2'}" style="width:auto;flex:0 0 auto;font-size:12px;padding:8px 12px;border-radius:20px;">${l}</button>`;
  el.innerHTML=`<div class="card cp" style="display:flex;flex-direction:column;gap:13px;">
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Type d'alimentation</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">${dietBtn('omnivore','Omnivore')}${dietBtn('vegetarien','Végétarien')}${dietBtn('vegan','Végan')}${dietBtn('pescetarien','Pescétarien')}</div>
    </div>
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Restrictions (plusieurs possibles)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${rBtn('halal','🕌 Halal')}${rBtn('casher','✡️ Casher')}${rBtn('sansporc','Sans porc')}${rBtn('sansboeuf','Sans bœuf')}${rBtn('sansalcool','Sans alcool')}${rBtn('sanslactose','Sans lactose')}${rBtn('sansgluten','Sans gluten')}</div>
    </div>
    <div>
      <div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Allergies / aliments à éviter</div>
      <input id="diet-notes-inp" type="text" value="${(S.dietNotes||'').replace(/"/g,'&quot;')}" oninput="saveDietNotes(this.value)" placeholder="ex. fruits à coque, fruits de mer…" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--sep);background:var(--bg2);color:var(--t1);font-family:var(--font);font-size:13.5px;box-sizing:border-box;">
    </div>
    <div style="font-size:11px;color:var(--t3);line-height:1.45;">🥗 Milo et le plan de repas respectent tout ça — jamais un aliment que tu ne manges pas.</div>
    ${S.foodMode?`<div style="font-size:11.5px;color:var(--green);line-height:1.45;">✅ Ton mode <b>${(typeof FOOD_MODE_LABELS!=='undefined'&&FOOD_MODE_LABELS[S.foodMode])||S.foodMode}</b> est actif — ces réglages s'appliquent <b>en plus</b> : tes repas sont d'abord adaptés au mode, puis à ton type d'alimentation et à tes restrictions.</div>`:''}
    ${diet==='vegan'?'<div style="font-size:11.5px;color:var(--gold);line-height:1.45;">💊 Végan : protéine végétale (pois/riz) au lieu de la whey · pense B12, oméga-3 (algues), vitamine D, fer.</div>':diet==='vegetarien'?'<div style="font-size:11.5px;color:var(--gold);line-height:1.45;">💊 Végétarien : whey/œufs OK · surveille le fer et la B12.</div>':''}
  </div>`;
}
function setDiet(v){ S.diet=(S.diet===v?'':v); if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); _renderDietCard(); }
function toggleDietRestriction(k){
  const a=(S.dietRestrictions||[]).slice(); const i=a.indexOf(k);
  if(i>=0)a.splice(i,1); else a.push(k);
  S.dietRestrictions=a; if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); _renderDietCard();
}
let _dietNotesT=null;
function saveDietNotes(v){ S.dietNotes=v; if(_dietNotesT)clearTimeout(_dietNotesT); _dietNotesT=setTimeout(function(){ if(typeof persist==='function')persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced(); },600); }

async function generateMealPlan(regenDay,regenMeal){
  if(!S.url){toast('Connexion requise','error');return;}
  if(!S.bw||!S.age||!S.height){toast('Complète ton profil d\'abord (âge, taille, poids)','error');return;}
  const isPrem=S.premium,td=today();
  const isRegen=!!(regenDay&&regenMeal);
  if(isRegen&&!isPrem){
    if(S.mealPlan&&S.mealPlan.regenDate===td&&(S.mealPlan.regenCount||0)>=1){
      toast('1 régénération/jour en gratuit · Premium = illimité ⭐','info');return;
    }
  }
  const btn=isRegen?null:document.getElementById('mp-gen-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Génération...';}
  const macros=calcMacros(S.nutritionPhase);
  const cp=getMensCyclePhase();
  const _diet=(typeof dietSummary==='function')?dietSummary():'';
  const ctx=`Profil: ${S.gender==='H'?'Homme':'Femme'}, ${S.age} ans, ${S.bw}kg, objectif: ${GOAL_LABELS[S.goal]||S.goal}, phase: ${S.nutritionPhase}`
    +`\nMacros/jour: ${macros.calories} kcal · P ${macros.prot_g}g · G ${macros.carbs_g}g · L ${macros.fat_g}g`
    +(cp&&cp.phase?`\nCycle: phase ${cp.phase} (jour ${cp.day}/${S.mensCycleDur})`:'')
    +(S.morphotype?` · Morphotype: ${S.morphotype}`:'')
    +(_diet?`\n⚠️ RÉGIME À RESPECTER ABSOLUMENT: ${_diet}. N'inclus AUCUN aliment interdit ni non conforme.`:'');
  try{
    const body={action:'generateMealPlan',context:ctx,scope:isPrem?'week':'day',startDate:td};
    if(isRegen){body.regenDay=regenDay;body.regenMeal=regenMeal;}
    const resp=await fetch(_aiUrl('generateMealPlan'),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
    const data=await resp.json();
    if(!data||data.status!=='ok'||!data.plan){toast('Erreur IA : '+(data&&data.message||'réessaie'),'error');return;}
    if(isRegen){
      if(!S.mealPlan)S.mealPlan={days:[],generatedAt:td,regenDate:null,regenCount:0};
      const newDay=data.plan.days&&data.plan.days[0];
      if(newDay){
        const ex=S.mealPlan.days.find(d=>d.date===regenDay);
        if(ex){const nm=newDay.meals&&newDay.meals[0];if(nm){const idx=ex.meals.findIndex(m=>m.name===regenMeal);if(idx>=0)ex.meals[idx]=nm;else ex.meals.push(nm);}}
      }
      if(!isPrem){if(S.mealPlan.regenDate!==td){S.mealPlan.regenDate=td;S.mealPlan.regenCount=0;}S.mealPlan.regenCount=(S.mealPlan.regenCount||0)+1;}
      toast('Repas régénéré ✅','success');
    }else{
      S.mealPlan={days:data.plan.days||[],generatedAt:td,regenDate:null,regenCount:0};
      toast(isPrem?'Semaine générée ✅':'Repas du jour généré ✅','success');
    }
    persist();renderMealPlanIA();
  }catch(e){toast('Erreur réseau : '+e.message,'error');}
  finally{if(btn){btn.disabled=false;btn.textContent='🍽️ Générer'+(isPrem?' ma semaine':' mon repas du jour');}}
}

// ─── IMPORT PLAN ALIMENTAIRE (photo/PDF d'un diététicien) ──────────────
let _mealImpPhotos=[],_mealImpExtracted=null;
function openImportMeal(){
  _mealImpPhotos=[];_mealImpExtracted=null;
  mealImpGoStep(1);
  document.getElementById('ov-import-meal').classList.add('open');
}
function closeImportMeal(){document.getElementById('ov-import-meal').classList.remove('open');}
function mealImpGoStep(n){
  [1,2,3,4].forEach(i=>{
    const s=document.getElementById('mimp-s'+i);if(s)s.style.display='none';
    const dot=document.getElementById('mimp-dot-'+i);if(dot)dot.classList.toggle('active',i===n);
  });
  const s=document.getElementById('mimp-s'+n);
  if(s)s.style.display=(n===1||n===4)?'block':'flex';
  if(n===1)['mimp-cam-inp','mimp-gal-inp','mimp-file-inp','mimp-more-inp','mimp-more-file-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}
function addMealImportPhoto(input){
  const files=[...input.files];if(!files.length)return;
  const loadFile=f=>new Promise(res=>{
    const img=new Image(),url=URL.createObjectURL(f);
    img.onload=()=>{
      const max=1200,canvas=document.createElement('canvas');
      let w=img.width,h=img.height;
      if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
      canvas.width=w;canvas.height=h;
      const c2d=canvas.getContext('2d');
      if(!c2d){URL.revokeObjectURL(url);res(null);return;}
      c2d.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      res({data:canvas.toDataURL('image/jpeg',0.82).split(',')[1],type:'image/jpeg'});
    };
    img.src=url;
  });
  Promise.all(files.map(loadFile)).then(results=>{
    _mealImpPhotos.push(...results.filter(Boolean));
    _renderMealImpThumbs();mealImpGoStep(2);
  });
}
async function addMealImportFile(input){
  const files=[...input.files];if(!files.length)return;
  const MAX_MB=15,results=[];
  for(const f of files){
    if(f.size>MAX_MB*1024*1024){toast('Fichier trop volumineux (max '+MAX_MB+' MB)','error');continue;}
    const name=(f.name||'').toLowerCase();
    if(f.type==='application/pdf'||name.endsWith('.pdf')){
      try{
        toast('Lecture du PDF…','info');
        const pages=await _pdfToImages(f);
        if(!pages.length){toast('PDF vide ou illisible','error');continue;}
        results.push(...pages);
      }catch(e){toast('Erreur PDF : '+(e.message||e),'error');}
    }
  }
  if(results.length){_mealImpPhotos.push(...results);_renderMealImpThumbs();mealImpGoStep(2);}
}
function _renderMealImpThumbs(){
  const el=document.getElementById('mimp-thumbs');if(!el)return;
  el.innerHTML=_mealImpPhotos.map((p,i)=>{
    const isDoc=p.type==='application/pdf'||p.isText;
    const thumb=isDoc
      ?`<div style="width:72px;height:72px;border-radius:8px;border:2px solid var(--sep);background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;"><span style="font-size:24px;">📄</span><span style="font-size:9px;color:var(--t3);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name||'Page'}</span></div>`
      :`<img src="data:${p.type};base64,${p.data}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--sep);">`;
    return`<div style="position:relative;display:inline-block;">${thumb}<button onclick="removeMealImpPhoto(${i})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:var(--red);color:#fff;border:none;font-size:11px;line-height:1;cursor:pointer;padding:0;font-family:var(--font);">✕</button></div>`;
  }).join('');
}
function removeMealImpPhoto(i){
  _mealImpPhotos.splice(i,1);
  if(!_mealImpPhotos.length){mealImpGoStep(1);return;}
  _renderMealImpThumbs();
}
async function analyzeMealImport(){
  if(!_mealImpPhotos.length){toast('Ajoute au moins une photo','error');return;}
  if(!S.url){toast('Connexion Apps Script requise','error');return;}
  mealImpGoStep(3);
  let raw='';
  try{
    const diet=(typeof dietSummary==='function')?dietSummary():'';
    const r=await fetch(_aiUrl('importMealPlan'),{method:'POST',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'importMealPlan',images:_mealImpPhotos,diet})});
    raw=await r.text();
    console.log('[ImportMeal] Réponse brute :',raw);
    const d=JSON.parse(raw);
    if(d.status!=='ok'||!d.data)throw new Error(d.error||'Extraction échouée');
    _mealImpExtracted=d.data;
    _renderMealImpConfirm();
    mealImpGoStep(4);
  }catch(e){
    console.error('[ImportMeal] Erreur :',e.message,'| Brut :',raw);
    mealImpGoStep(2);
    toast('Erreur analyse : '+e.message,'error');
  }
}
function _renderMealImpConfirm(){
  const d=_mealImpExtracted;if(!d)return;
  const nameEl=document.getElementById('mimp-plan-name');
  if(nameEl)nameEl.textContent=d.planName||'Plan alimentaire importé';
  const el=document.getElementById('mimp-preview');if(!el)return;
  el.innerHTML=(d.days||[]).map((day,di)=>`
    <div style="background:var(--bg3);border-radius:10px;padding:10px 12px;">
      <div style="font-weight:700;font-size:13px;color:var(--red);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">${_escNote(day.label||'Jour '+(di+1))}</div>
      ${(day.meals||[]).map(m=>`
        <div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:5px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:13px;font-weight:600;">${_escNote(m.name)}</div>
            <span style="font-size:12px;font-weight:700;color:var(--red);">${m.kcal||0} kcal</span>
          </div>
          <ul style="margin:4px 0 0;padding:0 0 0 16px;">${(m.foods||[]).map(f=>`<li style="font-size:12px;color:var(--t2);">${_escNote(f)}</li>`).join('')}</ul>
          <div style="font-size:11px;color:var(--t3);margin-top:4px;">P ${m.prot||0}g · G ${m.carbs||0}g · L ${m.fat||0}g</div>
        </div>`).join('')}
    </div>`).join('');
}
function finalImportMeal(){
  const d=_mealImpExtracted;
  if(!d||!(d.days||[]).length){toast('Aucun repas à importer','error');return;}
  const td=today();
  const days=d.days.map((day,i)=>{
    // ancré sur today() (midi local) : à 00 h 30, l'ancien calcul faisait démarrer le plan « hier »
    const dt=new Date(td+'T12:00:00');dt.setDate(dt.getDate()+i);
    const date=dt.toISOString().slice(0,10);
    return{date,label:day.label||'',meals:(day.meals||[]).map(m=>({
      name:m.name||'Repas',foods:m.foods||[],kcal:m.kcal||0,prot:m.prot||0,carbs:m.carbs||0,fat:m.fat||0
    }))};
  });
  S.mealPlan={days,generatedAt:td,regenDate:null,regenCount:0,imported:true,planName:d.planName||''};
  persist();
  closeImportMeal();
  if(typeof renderMealPlanIA==='function')renderMealPlanIA();
  toast('Plan alimentaire importé ! 🍽️','success');
}

// ─── AUTO-RESTAURATION ───────────────────────────────────────
let _lastSavedEmail='';
function _saveEmailRedundant(email){
  if(!email||email===_lastSavedEmail)return;
  _lastSavedEmail=email;
  try{document.cookie='ft_email='+encodeURIComponent(email)+';max-age=31536000;samesite=strict;path=/';}catch(e){}
  if(S.sessions&&S.sessions.length>0){try{document.cookie='ft_had_data=1;max-age=31536000;samesite=strict;path=/';}catch(e){}}
  try{
    var req=indexedDB.open('ft_meta',1);
    req.onupgradeneeded=function(e){e.target.result.createObjectStore('meta',{keyPath:'key'});};
    req.onsuccess=function(e){try{e.target.result.transaction('meta','readwrite').objectStore('meta').put({key:'email',value:email});}catch(e2){}};
  }catch(e){}
}
async function _getEmailFromIDB(){
  return new Promise(function(resolve){
    try{
      var req=indexedDB.open('ft_meta',1);
      req.onupgradeneeded=function(e){e.target.result.createObjectStore('meta',{keyPath:'key'});};
      req.onsuccess=function(e){
        try{var g=e.target.result.transaction('meta','readonly').objectStore('meta').get('email');g.onsuccess=function(r){resolve(r.result?r.result.value:null);};g.onerror=function(){resolve(null);};}catch(e2){resolve(null);}
      };
      req.onerror=function(){resolve(null);};
      setTimeout(function(){resolve(null);},600);
    }catch(e){resolve(null);}
  });
}
async function _silentCloudRestore(email){
  if(!S.url)return false;
  try{
    const ctrl=new AbortController();const tId=setTimeout(()=>ctrl.abort(),5000);
    const r=await fetch(S.url,{method:'POST',redirect:'follow',signal:ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email,authCode:_authCode()})});
    clearTimeout(tId);const d=await r.json();
    if(d.status!=='ok'||!d.sessions||d.sessions.length===0)return false;
    S.email=email;
    try{localStorage.setItem('ft4_email',email);localStorage.setItem('ft4_ob2','1');document.documentElement.classList.add('ob-done');}catch(e){}
    _applyRestoreData(d);
    _saveEmailRedundant(email);
    try{document.getElementById('ov-reconnect')?.classList.remove('open');}catch(e){}
    toast('✅ Données resynchronisées','success');
    try{renderHome();}catch(e){}try{if(typeof renderSetup==='function')renderSetup();}catch(e){}
    return true;
  }catch(e){console.warn('[FT auto-restore]',e.message);return false;}
}
function _showReconnectOverlay(){
  const ov=document.getElementById('ov-reconnect');if(ov)ov.classList.add('open');
}
window.doReconnect=async function(){
  const inp=document.getElementById('reconnect-email-inp');if(!inp)return;
  const email=inp.value.trim().toLowerCase();
  if(!email||!email.includes('@')){toast('Email invalide','error');return;}
  const btn=document.getElementById('reconnect-btn');const st=document.getElementById('reconnect-status');
  if(btn){btn.disabled=true;btn.textContent='🔄 Recherche…';}
  if(st){st.style.display='block';st.textContent='Connexion en cours…';}
  const ok=await _silentCloudRestore(email);
  if(!ok){if(st){st.style.display='block';st.textContent='❌ Aucun compte trouvé pour cet email.';}toast('Aucun compte trouvé','error');}
  if(btn){btn.disabled=false;btn.textContent='🔄 Retrouver mes données';}
};
window.closeReconnect=function(){try{document.getElementById('ov-reconnect')?.classList.remove('open');}catch(e){}};

// ─── INIT ────────────────────────────────────────────────────
load();
// ─ Récupération brouillon après crash de finishWorkout ────────
(function _recoverDraft(){
  try{
    const draftStr=localStorage.getItem('ft4_wkt_draft');
    if(!draftStr||draftStr==='null')return;
    const draft=JSON.parse(draftStr);
    if(!draft||!draft.exs||!draft.exs.length)return;
    // Si S.wkt est null mais que le brouillon existe → finishWorkout a crashé
    // Vérifier que la séance n'est pas déjà enregistrée (même date + volume proche)
    const lastSess=S.sessions&&S.sessions[0];
    const draftDate=draft.date||today();
    const alreadySaved=lastSess&&lastSess.date===draftDate&&lastSess.exs&&lastSess.exs.length>=draft.exs.length;
    if(alreadySaved){localStorage.removeItem('ft4_wkt_draft');return;}
    // Restaurer S.wkt depuis le brouillon si pas déjà actif
    if(!S.wkt||!S.wkt.exs||!S.wkt.exs.length){
      S.wkt=draft;
      try{localStorage.setItem('ft4_wkt',draftStr);}catch(e){}
    }
  }catch(e){}
})();
// Remplit les libellés de version (.app-ver) avec le VRAI build tournant (cache SW ft-vNN) → jamais périmé
function _setAppVersionEls(){
  if(!('caches' in window))return;
  caches.keys().then(keys=>{
    const ft=(keys||[]).find(k=>k&&k.startsWith('ft-v'));
    if(!ft)return;
    document.querySelectorAll('.app-ver').forEach(el=>{el.textContent=ft;});
  }).catch(()=>{});
}
(async()=>{let cv='?';try{const ks=await caches.keys();cv=ks.find(k=>k.startsWith('ft-v'))||'?';}catch(e){}try{_setAppVersionEls();}catch(e){}console.log('[FT] boot',cv,'— _adminMode=',window._adminMode,'_curScreen=',window._curScreen,'_premiumPending=',window._premiumPending,'openRestoreAccount=',typeof openRestoreAccount);})();
// Garantie : le timer de repos ne survit jamais à un redémarrage ni à un retour au premier plan
stopRest();
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&restStartTs&&_restLeft()<=-5)stopRest();
});
// ⚠️ Élément optionnel. ⚠️ CE COMMENTAIRE DISAIT « app.js est aussi chargé par dashboard.html » —
// c'est FAUX depuis que le tableau de bord a retiré ce chargement (voir dashboard.html, qui écrit
// la décision et sa raison). La garde reste utile telle quelle, mais sa justification était
// périmée : un commentaire qu'on ne relit pas fait raisonner de travers celui qui le lit (R23).
// La version ordinateur, elle, n'a pas la barre du haut de l'app. Sans cette garde, la page lève une
// erreur et la fin du fichier ne s'exécute pas. Une brique partagée ne doit jamais supposer
// que TOUS les éléments d'un écran existent (constaté le 04/08).
{ const _tbd=document.getElementById('tb-date');
  if(_tbd)_tbd.textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}); }
applyTheme();
if(typeof _applyHalo==='function')_applyHalo();
if(typeof _applyThemeBtns==='function')_applyThemeBtns();
if(typeof _applyRingBtns==='function')_applyRingBtns();
if(typeof _applyA11y==='function')_applyA11y();
if(typeof _applyColorblind==='function')_applyColorblind();
if(typeof _applyLeftHand==='function')_applyLeftHand();
filterEx();
goScreen('home', document.getElementById('nb-home'));
// Notifier l'utilisateur s'il y a une séance en cours non terminée
if(S.wkt&&S.wkt.exs&&S.wkt.exs.length){
  const nEx=S.wkt.exs.length;
  const nDone=S.wkt.exs.reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s.done).length,0);
  setTimeout(()=>toast('Séance en cours — '+nEx+' exercice'+(nEx>1?'s':'')+(nDone?' · '+nDone+' séries validées':'')+' · Appuie sur Reprendre','info'),1000);
}
_initSwipe();
_blockEdgeBackSwipe(); // iOS : neutralise le geste "retour" bord gauche (page blanche)
_initPullToDismiss();
// Bouton retour Android / navigateur → ferme overlay ou revient à l'écran précédent
history.pushState(null,'',location.href);
window.addEventListener('popstate',()=>{
  // Blur l'input actif avant tout — évite le dialog iOS "annuler la saisie ?"
  if(document.activeElement&&(document.activeElement.tagName==='INPUT'||document.activeElement.tagName==='TEXTAREA'))document.activeElement.blur();
  history.pushState(null,'',location.href);
  /* 🔴🔴 ft-v1092 — LE BOUTON RETOUR ÉTAIT LA 3ᵉ PORTE, ET ELLE N'AVAIT JAMAIS ÉTÉ FERMÉE.
     ft-v1091 a fermé le glissement du doigt en faisant passer les fermetures par
     `_closeOverlayProper` (qui appelle le vrai `close…()` de l'écran : il coupe la caméra,
     pose le marqueur « déjà vu », arrête les minuteurs). Cette ligne-ci, elle, faisait
     `classList.remove('open')` en direct — donc, MESURÉ dans un navigateur :
       ① `closeBarcodeScanner` appelée 0 fois → LA CAMÉRA RESTE ALLUMÉE. Sur Android, le
          bouton/geste retour EST le geste de fermeture : c'est la porte la plus empruntée
          de toutes, et c'était la seule encore ouverte.
       ② `ft4_guide_shown` toujours `null` après fermeture → les 18 écrans à marqueur (pop-ups
          « une seule fois », guides, messages testeurs) reviennent à chaque démarrage — le
          bug de ft-v629, rejoué par une autre porte (R15).
       ③ les 3 écrans `data-no-dismiss` se fermaient quand même — dont « analyse en cours »,
          marqué non-fermable EXPRÈS, dont le minuteur continue ensuite de repeindre un écran
          caché pour le reste de la session.
       ④ et il fermait le MAUVAIS écran (voir `_overlayDuDessus`).
     ⛔ Un écran `data-no-dismiss` ne se ferme PAS au retour, et on ne ferme rien d'autre à sa
     place : l'attribut promet que l'écran bloque, il doit bloquer aussi ce geste-là. */
  const ov=(typeof _overlayDuDessus==='function')?_overlayDuDessus():[...document.querySelectorAll('.overlay.open')].pop();
  if(ov){
    if(ov.hasAttribute('data-no-dismiss'))return;
    if(typeof _closeOverlayProper==='function')_closeOverlayProper(ov); else ov.classList.remove('open');
    return;
  }
  if(window._curScreen!=='home')navBack();
});
// Trick iOS Safari : garde les inputs "propres" → plus de dialog "Voulez-vous annuler la saisie ?"
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.tagName==='INPUT'||el.tagName==='TEXTAREA')el.defaultValue=el.value;
},true);
_updateNewBadges();
checkBadges(true); // check silencieux au démarrage
checkWeeklySummary(); // résumé lundi matin
// Bilan du mois écoulé — annoncé UNE fois, au premier passage du nouveau mois (ft-v872).
if(typeof checkMonthlySummary==='function')checkMonthlySummary();
checkJustUpdated();   // badge « Application mise à jour » après un reboot de mise à jour
checkSuperTesterWelcome(); // message « super testeur » une seule fois (Christophe)
checkEmmaWelcome(); // pop perso Emma : bienvenue Espace Testeur + boîte à idées (une seule fois)
checkTesterGuide(); // guide testeuses (Eline, Emma, Tanna) : tour de l'app + boîte à idées (une seule fois)
checkAnnouncements(); // pop perso Christophe + « Quoi de neuf » pour tous (une seule fois)
checkTesterEq();      // pop testeurs : différenciation des types de matériel (test, une seule fois)
checkTester3B();      // pop testeurs : état du jour (brique 3B) — informer + demander un retour (une seule fois)
// checkBirthdayDedication(); // 🗄️ Anniversaire Eline archivé (passé) — code + overlay #ov-bday conservés, réactiver en décommentant
initCoachInput();
initOnboarding();
_initCloneTools(); // affiche les outils réservés au clone de test (bouton « Refaire l'inscription »)
// ─── ESPACE SUPER TESTEUR (Christophe) — analyse photos + boîte à idées ──
let _testerIdeaFiles=[];
function checkSuperTesterWelcome(){
  try{
    // Le message « Michel te remercie » est réservé aux vrais testeurs récompensés (pas à Michel lui-même).
    if(!_isSuperTester()||!(typeof _isTester==='function'&&_isTester()))return;
    if(_isEmma())return; // Emma a son propre message perso (checkEmmaWelcome)
    if(localStorage.getItem('ft4_super_welcome_v1'))return;
    setTimeout(showSuperWelcome,900);
  }catch(e){}
}
function showSuperWelcome(){const o=document.getElementById('ov-super-welcome');if(o)o.classList.add('open');}
function closeSuperWelcome(){try{localStorage.setItem('ft4_super_welcome_v1','1');}catch(e){}const o=document.getElementById('ov-super-welcome');if(o)o.classList.remove('open');}
// ─── Pop-up perso Emma : bienvenue Espace Testeur + boîte à idées (une seule fois) ──
// ⚠️ Remplacé par le guide testeuses unifié (checkTesterGuide) : Emma est une « guided tester »,
//    donc son ancienne pop perso ne se déclenche plus (le guide la couvre).
function _isEmma(){return (S.email||'').trim().toLowerCase()==='emma.david16@gmail.com';}
function checkEmmaWelcome(){
  try{
    if(_isGuidedTester())return; // le guide testeuses unifié couvre Emma
    if(!_isEmma())return;
    if(localStorage.getItem('ft4_emma_welcome_v1'))return;
    setTimeout(function(){const o=document.getElementById('ov-emma-welcome');if(o)o.classList.add('open');},1000);
  }catch(e){}
}
function closeEmmaWelcome(){try{localStorage.setItem('ft4_emma_welcome_v1','1');}catch(e){}const o=document.getElementById('ov-emma-welcome');if(o)o.classList.remove('open');}
// ─── Guide testeuses (Eline, Emma, Tanna) : bienvenue + tour de l'app + boîte à idées (une seule fois) ──
function _isGuidedTester(){
  var e=(S.email||'').trim().toLowerCase();
  return ['elineazs32@gmail.com','emma.david16@gmail.com','tanna.valery.studio@gmail.com'].indexOf(e)>=0;
}
function checkTesterGuide(){
  try{
    if(!_isGuidedTester())return;
    if(localStorage.getItem('ft4_tester_guide_v1'))return;
    setTimeout(showTesterGuide,1100);
  }catch(e){}
}
function showTesterGuide(){
  // Ne pas s'empiler sur une autre pop-up de démarrage : on réessaie un peu plus tard
  var busy=['ov-whatsnew','ov-super-welcome','ov-emma-welcome','ov-billoute','ov-bday','ov-tester-eq','ov-tester-3b'].some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('open');});
  if(busy){setTimeout(showTesterGuide,2500);return;}
  var span=document.getElementById('tguide-name');
  if(span){var f=((S.name||'').trim().split(/\s+/)[0]||'').replace(/[<>&]/g,'');span.textContent=f?(', '+f):'';}
  var o=document.getElementById('ov-tester-guide');if(o)o.classList.add('open');
}
function closeTesterGuide(){
  try{localStorage.setItem('ft4_tester_guide_v1','1');localStorage.setItem('ft4_emma_welcome_v1','1');}catch(e){}
  var o=document.getElementById('ov-tester-guide');if(o)o.classList.remove('open');
}
// ─── Annonces : pop-up perso Christophe + « Quoi de neuf » pour tous (une seule fois) ──
function _isChristophe(){return (S.email||'').trim().toLowerCase()==='christophe@famillelanglois.fr';}
function checkAnnouncements(){
  try{
    // Testeuses (Eline/Emma/Tanna) : leur guide passe en priorité — pas de « Quoi de neuf » par-dessus tant qu'elles ne l'ont pas vu.
    if(_isGuidedTester()&&!localStorage.getItem('ft4_tester_guide_v1'))return;
    // Christophe : son pop perso « billoute » d'abord ; une fois vu, il reçoit les annonces générales comme tout le monde.
    if(_isChristophe()&&!localStorage.getItem('ft4_billoute_v3')){
      setTimeout(showBilloute,1000);
      return;
    }
    // Christophe : pop perso « supprimer une série photo » (une seule fois, après le billoute)
    if(_isChristophe()&&!localStorage.getItem('ft4_christophe_photodel_v1')){
      setTimeout(showChristophePhotos,1000);
      return;
    }
    // Boîte à idées traitée (31/07, demande Michel : annoncer à Christophe et Eline SEULEMENT) :
    // navigation entre pesées (idée Christophe, ft-v676) + masse maigre (retour Eline, ft-v677)
    if(_isChristophe()&&!localStorage.getItem('ft4_pesee_nav_c_v1')){
      setTimeout(showPeseeNavC,1000);
      return;
    }
    if(_isEline()&&!localStorage.getItem('ft4_pesee_nav_e_v1')){
      setTimeout(showPeseeNavE,1000);
      return;
    }
    // ⚠️ EN DERNIER parmi les pop-ups perso : une annonce déjà en attente passe AVANT la
    // nouvelle (sinon on double la file et l'ancienne est repoussée d'un lancement).
    // Attrapé le 03/08 par le test « Christophe voit SON annonce », qui est passé rouge.
    if(_isChristophe()&&!localStorage.getItem('ft4_memoire_c_v1')){
      setTimeout(showMemoireC,1000);
      return;
    }
    if(_whatsNewUnseen().length) setTimeout(showWhatsNew,1000);
  }catch(e){}
}
function showMemoireC(){const o=document.getElementById('ov-memoire-c');if(o)o.classList.add('open');}
function closeMemoireC(){try{localStorage.setItem('ft4_memoire_c_v1','1');}catch(e){}const o=document.getElementById('ov-memoire-c');if(o)o.classList.remove('open');}
// ── ADMIN : la copie miroir Supabase (04/08) ──────────────────────────────────────
// On ÉCRIT vraiment plutôt que d'afficher un voyant : la sauvegarde nocturne s'était
// arrêtée 36 jours sans que rien ne l'indique. Un indicateur qui ne teste pas ce qu'il
// annonce finit toujours par mentir.
async function loadSbAdmin(){
  const box=document.getElementById('admin-sb');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  if(typeof sbTest!=='function'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">supabase.js non chargé.</div>'; return; }
  box.innerHTML='<div style="font-size:12.5px;color:var(--t2);">Écriture de test en cours…</div>';
  const r=await sbTest();
  let etat=null; try{ etat=sbEtat(); }catch(e){}
  box.innerHTML='<div style="font-size:12.5px;line-height:1.6;color:'+(r.ok?'var(--t1)':'var(--red)')+';white-space:pre-wrap;">'
    +_escIdea(r.texte)+'</div>'
    +(etat?'<div style="font-size:11.5px;color:var(--t2);margin-top:8px;line-height:1.5;">'+_escIdea(etat.texte)+'</div>':'');
}
// ── ADMIN : 🔁 DOUBLONS DANS LE CLASSEUR (31/08/2026) ────────────────────────────
// ⚠️ POURQUOI. Avant ft-v1077, `handleLogSession_` écrivait UNE ligne par série : une
// grosse séance dépassait les 8 s d'attente du téléphone, qui abandonnait — pendant que
// le script Google, lui, finissait d'écrire. Chaque nouvel essai re-collait donc les
// mêmes lignes. *Un délai dépassé n'est pas un échec, c'est une réponse qu'on n'a pas
// attendue.* La cause est corrigée ; ce qui a déjà été écrit, non.
//
// ⛔⛔ ET CETTE CARTE NE SUPPRIME RIEN, C'EST DÉLIBÉRÉ (R29). Le classeur porte les données
// de la personne : on lui MONTRE ce qu'on voit, elle décide ensuite. Nettoyer d'office sur
// la foi d'un algorithme qu'elle n'a pas vu tourner serait exactement le geste qu'on refuse
// — le même que « réparer » sa séance sans lui demander.
//
// ⛔ ET ON DIT CE QU'ON NE PEUT PAS VOIR : les lignes écrites avant ft-v1018 n'ont pas de
// colonne `email`. Elles ne sont attribuables à personne, donc elles ne sont ni comptées ni
// accusées — mais leur nombre est AFFICHÉ, sinon un total qui ne colle pas passerait pour
// une erreur de l'outil.
/* 🩹 LES SÉRIES ABÎMÉES PAR LA VIRGULE, CHEZ TOUT LE MONDE (01/09/2026) — Michel, après avoir
   vu le compte d'Eline : « ce que j'ai eu moi les autres peuvent l'avoir aussi, faut absolument
   qu'on puisse vérifier le compte des autres utilisateurs ».
   ⛔⛔ IL A RAISON, ET LA RAISON EST UNE DATE : le défaut est né le **30/08** (ft-v1057 passe le
   champ en `type="text"` sans changer `+this.value`) et il a duré jusqu'au correctif. Toute
   personne ayant corrigé un poids **avec une virgule** dans le détail d'une séance passée a
   perdu cette valeur. *Personne ne peut le remarquer tout seul : le champ affiche « null », ce
   qui ressemble à un bug d'affichage, pas à une donnée détruite.*
   ⛔ ON REGARDE, ON NE RÉPARE PAS. La valeur d'origine n'existe plus ; seule la personne la
   connaît (**R29**). Et on ne lit ni ses charges ni son profil — un détecteur qui ouvrirait les
   données de tout le monde pour trouver trois séries nulles serait pire que le défaut. */
async function loadSetsCorrompusAdmin(){
  const box=document.getElementById('admin-corrompus');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  if(!S.url){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Pas d\'URL serveur.</div>'; return; }
  box.innerHTML='<div style="font-size:12.5px;color:var(--t2);">Lecture des comptes…</div>';
  try{
    const url=S.url+'?action=setsCorrompus&token='+encodeURIComponent(_adminTok());
    const r=await fetch(url,{method:'GET'});
    const d=await r.json();
    if(_adminTokRefuse(d)){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Jeton refusé — relance, il te sera redemandé.</div>'; return; }
    if(!d||d.status!=='ok'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">'+_escIdea((d&&d.error)||'réponse inattendue')+'</div>'; return; }
    let h='';
    if(!d.totalSeries){
      h='<div style="font-size:13px;color:var(--green);font-weight:700;">✅ Aucune série abîmée — '
        +d.comptesLus+' compte'+(d.comptesLus>1?'s':'')+' lu'+(d.comptesLus>1?'s':'')+'.</div>';
    }else{
      h='<div style="font-size:13px;color:var(--gold);font-weight:700;">🩹 '
        +d.totalSeries+' série'+(d.totalSeries>1?'s':'')+' abîmée'+(d.totalSeries>1?'s':'')
        +', sur '+d.comptes.length+' compte'+(d.comptes.length>1?'s':'')+'.</div>'
        +'<div style="font-size:11.5px;color:var(--t3);margin-top:4px;">Rien n\'a été modifié. La valeur d\'origine est <b>perdue</b> — seule la personne la connaît.</div>';
      h+='<div style="font-size:12px;color:var(--t2);margin-top:8px;line-height:1.8;">';
      d.comptes.slice(0,12).forEach(c=>{
        h+='<div style="margin-top:6px;"><b>'+_escIdea(c.email)+'</b> — '+c.series+' série'+(c.series>1?'s':'')+'</div>';
        (c.lignes||[]).slice(0,6).forEach(l=>{
          h+='<div style="font-size:11.5px;color:var(--t3);font-family:\'SF Mono\',ui-monospace,monospace;">'
            +_escIdea(l.date)+' · '+_escIdea(l.ex)+' · '+l.n+'</div>';
        });
      });
      h+='</div>';
      h+='<div style="font-size:11.5px;color:var(--t2);margin-top:10px;line-height:1.5;">👉 À leur dire : ouvrir la séance, retaper le poids. <b>Le champ marche maintenant</b>, virgule comprise.</div>';
    }
    /* ⛔ ON DIT CE QU'ON N'A PAS PU LIRE : un compte illisible n'est pas un compte sain. */
    if(d.illisibles){
      h+='<div style="font-size:11.5px;color:var(--red);margin-top:8px;line-height:1.5;">⚠️ '
        +d.illisibles+' compte'+(d.illisibles>1?'s':'')+' illisible'+(d.illisibles>1?'s':'')
        +' — non vérifié'+(d.illisibles>1?'s':'')+', donc pas déclaré'+(d.illisibles>1?'s':'')+' sain'+(d.illisibles>1?'s':'')+'.</div>';
    }
    box.innerHTML=h;
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(String(e.message||e))+'</div>';
  }
}

async function loadDoublonsAdmin(){
  const box=document.getElementById('admin-doublons');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  if(!S.url||!S.email){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Pas d\'email ou pas d\'URL.</div>'; return; }
  box.innerHTML='<div style="font-size:12.5px;color:var(--t2);">Lecture du classeur…</div>';
  try{
    const url=S.url+'?action=sessionDoublons&token='+encodeURIComponent(_adminTok())
             +'&email='+encodeURIComponent(S.email);
    const r=await fetch(url,{method:'GET'});
    const d=await r.json();
    if(_adminTokRefuse(d)){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Jeton refusé — relance, il te sera redemandé.</div>'; return; }
    if(!d||d.status!=='ok'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">'+_escIdea((d&&d.error)||'réponse inattendue')+'</div>'; return; }
    let h='';
    if(!d.total){
      h='<div style="font-size:12.5px;color:var(--t2);">Aucune ligne à ton nom dans le classeur.</div>';
    }else if(!d.lignesEnTrop){
      h='<div style="font-size:13px;color:var(--green);font-weight:700;">✅ Aucun doublon — '
        +d.total+' ligne'+(d.total>1?'s':'')+' à ton nom.</div>';
    }else{
      /* ⛔ On annonce le CONSTAT, jamais une action : la personne lit, puis décide. */
      h='<div style="font-size:13px;color:var(--gold);font-weight:700;">🔁 '
        +d.lignesEnTrop+' ligne'+(d.lignesEnTrop>1?'s':'')+' en trop, sur '
        +d.datesAvecDoublons+' séance'+(d.datesAvecDoublons>1?'s':'')+'.</div>'
        +'<div style="font-size:11.5px;color:var(--t3);margin-top:4px;">Rien n\'a été supprimé. Voici ce qu\'on voit :</div>';
      h+='<div style="font-size:12px;color:var(--t2);margin-top:8px;line-height:1.8;font-family:\'SF Mono\',ui-monospace,monospace;">';
      d.dates.filter(x=>x.enTrop>0).slice(0,12).forEach(x=>{
        h+='<div>'+_escIdea(x.date)+' · '+x.lignes+' lignes pour '+x.uniques
          +' série'+(x.uniques>1?'s':'')+' → <b>écrite '+x.exemplaires+' fois</b></div>';
      });
      h+='</div>';
    }
    if(d.sansEmail){
      h+='<div style="font-size:11.5px;color:var(--t3);margin-top:10px;line-height:1.5;">⚠️ '
        +d.sansEmail+' ligne'+(d.sansEmail>1?'s':'')
        +' du classeur n\'ont pas d\'email (écrites avant le 26/08) : elles ne sont attribuables à personne, donc elles ne sont pas comptées ici.</div>';
    }
    box.innerHTML=h;
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(String(e&&e.message||e))+'</div>';
  }
}

// ── ADMIN : 🧹 NETTOYER LES DOUBLONS, EN DEUX TEMPS (31/08/2026) ─────────────────
// ⛔⛔ LE BOUTON QUI SUPPRIME N'EXISTE PAS TANT QU'ON N'A PAS VU CE QUI PARTIRAIT. C'est le
// seul endroit de l'app qui efface des données déjà écrites : il se mérite en deux gestes,
// et le premier ne touche à rien. *On ne détruit pas sur la foi d'un algorithme que
// personne n'a vu tourner* (R29) — Michel a donné son go APRÈS avoir vu le constat.
// ⛔ Et le serveur copie l'onglet AVANT la première suppression : la sauvegarde nocturne
// garde les COMPTES, pas le classeur. Sans cette copie, il n'y aurait aucun retour arrière.
async function apercuNettoyageAdmin(){
  const box=document.getElementById('admin-nettoyage');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  if(!S.url||!S.email){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Pas d\'email ou pas d\'URL.</div>'; return; }
  box.innerHTML='<div style="font-size:12.5px;color:var(--t2);">Calcul de l\'aperçu…</div>';
  try{
    const d=await _nettoyageAppel(false);
    if(!d) return;
    if(!d.aSupprimer){
      box.innerHTML='<div style="font-size:13px;color:var(--green);font-weight:700;">✅ Rien à nettoyer.</div>';
      return;
    }
    let h='<div style="font-size:13px;color:var(--gold);font-weight:700;">🧹 '
      +d.aSupprimer+' ligne'+(d.aSupprimer>1?'s':'')+' partiraient, sur '+d.total+' à ton nom.</div>'
      +'<div style="font-size:11.5px;color:var(--t3);margin-top:4px;line-height:1.5;">On garde <b>un</b> exemplaire de chaque série (le plus ancien). Rien n\'est touché chez les autres testeurs, ni dans les lignes sans email. Une <b>copie de l\'onglet</b> est faite avant.</div>'
      +'<div style="font-size:12px;color:var(--t2);margin-top:8px;line-height:1.8;font-family:\'SF Mono\',ui-monospace,monospace;">';
    (d.apercu||[]).forEach(x=>{
      h+='<div>'+_escIdea(x.date)+' · '+_escIdea(String(x.exercice))+' · série '+x.serie
        +' · '+x.kg+' kg × '+x.reps+'</div>';
    });
    if(d.aSupprimer>(d.apercu||[]).length)
      h+='<div style="color:var(--t3);">… et '+(d.aSupprimer-(d.apercu||[]).length)+' autres</div>';
    h+='</div>'
      +'<button class="btn btn-red" style="width:100%;padding:12px;margin-top:10px;font-size:14px;" onclick="confirmerNettoyageAdmin('+d.aSupprimer+')">🗑️ Supprimer ces '+d.aSupprimer+' lignes</button>';
    box.innerHTML=h;
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(String(e&&e.message||e))+'</div>';
  }
}
function confirmerNettoyageAdmin(n){
  const box=document.getElementById('admin-nettoyage');
  if(!box)return;
  /* ⛔ Une 2ᵉ confirmation EXPLICITE avant d'effacer — et le libellé du bouton dit ce qu'il FAIT
     (la leçon de ft-v1006 : « Supprimer » ne doit jamais s'afficher sur un geste anodin,
     et l'inverse est vrai aussi). */
  /* ⚠️ `showConfirm` prend un CALLBACK, pas une promesse — vérifié dans `log.js`, pas supposé.
     Un `await` dessus aurait rendu `undefined`, donc « annulé » quoi qu'il arrive : le bouton
     n'aurait JAMAIS supprimé, et rien ne l'aurait dit. */
  showConfirm('Supprimer '+n+' ligne'+(n>1?'s':'')+' du classeur ?',
    'Une copie de l\'onglet « Sessions » est faite avant. Un exemplaire de chaque série est gardé.',
    async ()=>{
      box.innerHTML='<div style="font-size:12.5px;color:var(--t2);">Copie de sûreté puis suppression…</div>';
      try{
        const d=await _nettoyageAppel(true);
        if(!d) return;
        box.innerHTML='<div style="font-size:13px;color:var(--green);font-weight:700;">✅ '
          +d.supprimees+' ligne'+(d.supprimees>1?'s':'')+' supprimée'+(d.supprimees>1?'s':'')
          +' en '+d.blocs+' bloc'+(d.blocs>1?'s':'')+'.</div>'
          +'<div style="font-size:11.5px;color:var(--t2);margin-top:6px;line-height:1.5;">Copie de sûreté : <b>'
          +_escIdea(d.copie||'—')+'</b> — un onglet de ton classeur, à supprimer quand tu auras vérifié.</div>';
      }catch(e){
        box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(String(e&&e.message||e))+'</div>';
      }
    }, 'Supprimer');
}
/* ⛔ UN SEUL PROPRIÉTAIRE DE L'APPEL (R2) : l'aperçu et la suppression ne diffèrent QUE par
   `confirme`. Deux fonctions d'appel séparées finiraient par ne plus viser la même chose —
   et ici, « ne plus viser la même chose » voudrait dire supprimer autre chose que ce qui a
   été montré. */
async function _nettoyageAppel(confirme){
  const box=document.getElementById('admin-nettoyage');
  const url=S.url+'?action=sessionNettoyer&token='+encodeURIComponent(_adminTok())
           +'&email='+encodeURIComponent(S.email)+(confirme?'&confirme=1':'');
  const r=await fetch(url,{method:'GET'});
  const d=await r.json();
  if(_adminTokRefuse(d)){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Jeton refusé — relance, il te sera redemandé.</div>'; return null; }
  if(!d||d.status!=='ok'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">'+_escIdea((d&&d.error)||'réponse inattendue')+'</div>'; return null; }
  return d;
}

// ── ADMIN : qui a POSÉ un code d'accès perso (04/08) ──────────────────────────────
// Né de la découverte du 04/08 : `loadProfile` sert un compte ENTIER quand la personne
// n'a pas de code perso (`_authCheck_` renvoie ok:true dans ce cas — invariant de
// rétrocompatibilité). Il fallait donc savoir QUI est protégé, sans avoir à ouvrir les
// Script Properties (qui affichent aussi ANTHROPIC_API_KEY et les autres secrets en clair).
// ⚠️ La route `authStatus` ne renvoie QUE {hasCode, emailVerified} : aucune donnée
// personnelle ne transite ici. C'est ce qui rend cette carte acceptable.
async function loadAuthStatusAdmin(){
  const box=document.getElementById('admin-auth-list');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  const liste=[...new Set([].concat(
    (typeof TESTER_EMAILS!=='undefined'?TESTER_EMAILS:[]),
    (S.email?[S.email]:[])
  ).map(e=>String(e||'').trim().toLowerCase()).filter(Boolean))];
  box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Vérification…</div>';
  const lignes=[];
  for(const em of liste){
    // ⚠️ 2 ESSAIS. Mesuré le 04/08 sur capture : 4 comptes sur 5 en « non vérifié », dont un dont
    // on avait PROUVÉ qu'il était protégé. Cause : `authStatus` charge tout le compte côté serveur
    // (loadUserData_) juste pour lire un booléen dont on ne se sert pas ici — les gros comptes
    // n'aboutissent pas. Le 2ᵉ essai rattrape le transitoire ; le vrai correctif est côté serveur.
    let d=null;
    for(let essai=0; essai<2 && !d; essai++){
      try{ d=await _protectPost({action:'authStatus',email:em,light:true}); }catch(e){ d=null; }
    }
    const ok=!!(d&&d.status==='ok');
    const prot=ok&&d.hasCode;
    // ⚠️ On distingue « pas protégé » de « on n'a pas pu vérifier » : afficher un ✅ ou un ❌
    // à la place d'une panne réseau serait pire que ne rien afficher (on agirait sur du faux).
    lignes.push('<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--sep);font-size:13px;">'
      +'<span style="font-size:15px;">'+(!ok?'⚠️':(prot?'🔒':'🔓'))+'</span>'
      +'<span style="flex:1;color:var(--t1);word-break:break-all;">'+_escIdea(em)+'</span>'
      +'<span style="font-size:11.5px;color:'+(!ok?'var(--t3)':(prot?'var(--green,#2ecc71)':'var(--red)'))+';font-weight:700;">'
      +(!ok?'non vérifié':(prot?'protégé':'OUVERT'))+'</span></div>');
  }
  const nbOuv=lignes.filter(l=>l.includes('OUVERT')).length;
  const nbInc=lignes.filter(l=>l.includes('non vérifié')).length;
  // ⚠️ Le résumé doit dire les DEUX chiffres. « 1 compte sans code » à côté de 4 inconnus laisse
  // croire que le reste est protégé — c'est exactement l'erreur qu'un « je ne sais pas » évite.
  box.innerHTML=lignes.join('')
    +'<div style="font-size:12px;color:var(--t2);margin-top:9px;line-height:1.5;">'
    +(nbOuv?('🔓 <strong>'+nbOuv+' compte'+(nbOuv>1?'s':'')+' sans code</strong> — leurs données sont lisibles côté serveur par qui connaît l\'adresse. Demande-leur : Profil → « protéger mon compte ».')
           :(nbInc?'':'🔒 Tous les comptes ont un code perso.'))
    +(nbInc?('<br>⚠️ <strong>'+nbInc+' non vérifié'+(nbInc>1?'s':'')+'</strong> — le serveur n\'a pas répondu. <b>On ne sait pas</b> s\'ils sont protégés : relance la vérification, ne conclus rien.'):'')
    +'</div>';
}
function showBilloute(){const o=document.getElementById('ov-billoute');if(o)o.classList.add('open');}
function closeBilloute(){try{localStorage.setItem('ft4_billoute_v3','1');}catch(e){}const o=document.getElementById('ov-billoute');if(o)o.classList.remove('open');}
function showChristophePhotos(){const o=document.getElementById('ov-christophe-photos');if(o)o.classList.add('open');}
function closeChristophePhotos(){try{localStorage.setItem('ft4_christophe_photodel_v1','1');}catch(e){}const o=document.getElementById('ov-christophe-photos');if(o)o.classList.remove('open');}
function _isEline(){return (S.email||'').trim().toLowerCase()==='elineazs32@gmail.com';}
function showPeseeNavC(){const o=document.getElementById('ov-pesee-nav-c');if(o)o.classList.add('open');}
function closePeseeNavC(){try{localStorage.setItem('ft4_pesee_nav_c_v1','1');}catch(e){}const o=document.getElementById('ov-pesee-nav-c');if(o)o.classList.remove('open');}
function showPeseeNavE(){const o=document.getElementById('ov-pesee-nav-e');if(o)o.classList.add('open');}
function closePeseeNavE(){try{localStorage.setItem('ft4_pesee_nav_e_v1','1');}catch(e){}const o=document.getElementById('ov-pesee-nav-e');if(o)o.classList.remove('open');}
// ─── « Quoi de neuf » versionné : montre toutes les nouveautés non vues d'un coup ──
function _whatsNewSeen(){
  try{
    var s=localStorage.getItem('ft4_wn_seen');
    if(s!==null&&s!=='') return parseInt(s)||0;
    // Migration : l'ancien flag ft4_whatsnew_v2 = a déjà vu le lot Nutrition (v≤4)
    if(localStorage.getItem('ft4_whatsnew_v2')) return 4;
  }catch(e){}
  return 0;
}
/* 🔒 LES ENTRÉES CONDITIONNELLES SE SUIVENT PAR ID, PAS PAR NUMÉRO (ft-v1072).
   ⚠️⚠️ LE PIÈGE, ET IL EST SUBTIL : `ft4_wn_seen` est un **plafond numérique** — le fermer
   marque vues TOUTES les entrées jusqu'à `WHATS_NEW_MAX`. Une entrée conditionnelle **jamais
   affichée** (parce que la personne n'avait pas encore de montre) serait donc **enterrée pour
   toujours** : le jour où elle branche son raccourci, elle ne verrait jamais l'annonce.
   👉 Les conditionnelles sont donc suivies **une par une**, comme les points rouges de
   `NEW_FEATURES` — le plafond ne les concerne pas. */
function _wnCondVues(){
  try{ var v=JSON.parse(localStorage.getItem('ft4_wn_cond')||'[]'); return Array.isArray(v)?v:[]; }
  catch(e){ return []; }
}
function _whatsNewUnseen(){
  if(typeof WHATS_NEW==='undefined') return [];
  var seen=_whatsNewSeen();
  var cond=_wnCondVues();
  var list=WHATS_NEW.filter(function(f){
    /* ⛔ « cette personne peut-elle s'en servir ? » — même propriétaire que les points rouges */
    if(typeof _featSi==='function' && !_featSi(f)) return false;
    if(f.si) return cond.indexOf(f.v)<0;          // conditionnelle : suivie par son numéro à elle
    return f.v>seen;                              // ordinaire : le plafond, comme avant
  });
  if(typeof WHATS_NEW_SHOW_MAX==='number') list=list.slice(0,WHATS_NEW_SHOW_MAX);
  return list;
}
// ── « Quoi de neuf » en CARROUSEL (ft-v630, idée de Christophe) ────────────────
// Avant : toutes les nouveautés empilées dans une seule pop-up → il fallait scroller
// jusqu'en bas, et personne ne lisait. Maintenant : UNE nouveauté par écran, on
// avance avec « Suivant » (ou en glissant du doigt) jusqu'à « C'est parti 💪 ».
// Même composant que le Guide de l'appli (_agGo/_renderAppGuide) : dots + nav.
var _wnItems=[],_wnIdx=0,_wnSwipeInit=false;
function showWhatsNew(){
  var items=_whatsNewUnseen();
  if(!items.length){_whatsNewMarkSeen();return;}
  _wnHistory=false;
  _wnItems=items;_wnIdx=0;_renderWhatsNew();
  _wnOpen();
}
function _wnOpen(){
  var o=document.getElementById('ov-whatsnew');if(o)o.classList.add('open');
  if(_wnSwipeInit)return;
  var sl=document.getElementById('whatsnew-list');
  if(sl){
    var x0=null;
    sl.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    sl.addEventListener('touchend',function(e){
      if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;
      if(Math.abs(dx)>45)_wnGo(dx<0?1:-1);
    },{passive:true});
  }
  _wnSwipeInit=true;
}
// Menu → « Nouveautés » : l'HISTORIQUE complet, consultable quand on veut (ft-v633).
// C'est ce qui rend « Passer » honnête : on ne perd rien, on lit plus tard.
// _wnHistory=true → aucun marqueur « vu » n'est posé (on ne consulte pas, on relit).
var _wnHistory=false;
function openWhatsNewHistory(){
  if(typeof WHATS_NEW==='undefined'||!WHATS_NEW.length)return;
  try{if(typeof _markAnchorSeen==='function')_markAnchorSeen('menu-row-whatsnew');}catch(e){}
  _wnHistory=true;
  _wnItems=WHATS_NEW.slice().sort(function(a,b){return b.v-a.v;});   // la plus récente d'abord
  _wnIdx=0;_renderWhatsNew();
  _wnOpen();
}
function _wnGo(d){
  var n=_wnIdx+d;
  if(n<0)return;
  if(n>=_wnItems.length){closeWhatsNew();return;}   // dernière diapo → on entre dans l'app
  _wnIdx=n;_renderWhatsNew();
}
function _renderWhatsNew(){
  var f=_wnItems[_wnIdx];if(!f)return;
  var multi=_wnItems.length>1;
  var box=document.getElementById('whatsnew-list');
  // .sw-solo : la carte est seule à l'écran → elle a la place d'expliquer (ft-v631)
  if(box) box.innerHTML='<div class="sw-feat sw-solo"><span>'+f.ic+'</span><div><b>'+f.t+'</b><small>'+f.d+'</small></div></div>';
  var sub=document.getElementById('whatsnew-sub');
  if(sub) sub.textContent=_wnHistory
    ? ('Toutes les nouveautés — '+(_wnIdx+1)+' sur '+_wnItems.length)
    : (multi?('Nouveauté '+(_wnIdx+1)+' sur '+_wnItems.length+' 👇'):'Une nouveauté pour toi 👇');
  var ttl=document.getElementById('whatsnew-title');
  if(ttl) ttl.textContent=_wnHistory?'Nouveautés':'Quoi de neuf ?';
  // « Passer » : seulement à l'annonce, et seulement s'il y a plusieurs cartes
  // (une seule carte = « C'est parti » est déjà un seul tap). Jamais dans l'historique.
  var skip=document.getElementById('wn-skip');
  if(skip) skip.style.display=(!_wnHistory&&multi)?'':'none';
  var dots=document.getElementById('wn-dots');
  if(dots) dots.innerHTML=multi?_wnItems.map(function(_,i){return '<span class="ag-dot'+(i===_wnIdx?' on':'')+'"></span>';}).join(''):'';
  var prev=document.getElementById('wn-prev');
  if(prev){prev.style.display=multi?'':'none';prev.style.visibility=_wnIdx===0?'hidden':'visible';}
  var next=document.getElementById('wn-next');
  if(next) next.textContent=(_wnIdx===_wnItems.length-1)?(_wnHistory?'Fermer':"C'est parti 💪"):'Suivant →';
}
function _whatsNewMarkSeen(){try{
  localStorage.setItem('ft4_wn_seen',String(typeof WHATS_NEW_MAX==='number'?WHATS_NEW_MAX:0));
  localStorage.setItem('ft4_whatsnew_v2','1');
  /* ⛔ ON NE MARQUE QUE LES CONDITIONNELLES RÉELLEMENT MONTRÉES (`_wnItems`), jamais toutes :
     sinon le plafond reviendrait par la fenêtre et enterrerait celles qu'on vient d'épargner. */
  var vues=_wnCondVues();
  (_wnItems||[]).forEach(function(f){ if(f&&f.si&&vues.indexOf(f.v)<0) vues.push(f.v); });
  localStorage.setItem('ft4_wn_cond',JSON.stringify(vues));
}catch(e){}}
function closeWhatsNew(){
  if(!_wnHistory)_whatsNewMarkSeen();   // historique = simple consultation, aucun marqueur
  _wnHistory=false;
  const o=document.getElementById('ov-whatsnew');if(o)o.classList.remove('open');
}
// ─── Pop testeurs : différenciation des types de matériel (test, une seule fois) ──
function checkTesterEq(){
  try{
    if(!(typeof _eqTestOn==='function'&&_eqTestOn()))return;      // testeurs + Michel uniquement
    if(localStorage.getItem('ft4_tester_eq_v1'))return;           // déjà vu
    setTimeout(showTesterEq,1400);
  }catch(e){}
}
function showTesterEq(){
  // Ne pas s'empiler sur une autre pop-up de démarrage : on réessaie un peu plus tard
  const busy=['ov-whatsnew','ov-super-welcome','ov-emma-welcome','ov-tester-guide','ov-billoute','ov-bday','ov-tester-3b'].some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('open');});
  if(busy){setTimeout(showTesterEq,2500);return;}
  const o=document.getElementById('ov-tester-eq');if(o)o.classList.add('open');
}
function closeTesterEq(){try{localStorage.setItem('ft4_tester_eq_v1','1');}catch(e){}const o=document.getElementById('ov-tester-eq');if(o)o.classList.remove('open');}
// ─── Pop testeurs : état du jour (brique 3B) — informer + demander un retour (une seule fois) ──
function checkTester3B(){
  try{
    if(!(typeof _isTester==='function'&&_isTester()))return;       // testeurs récompensés uniquement
    if(localStorage.getItem('ft4_tester_3b_v1'))return;            // déjà vu
    setTimeout(showTester3B,1600);
  }catch(e){}
}
function showTester3B(){
  // Ne pas s'empiler sur une autre pop-up de démarrage : on réessaie un peu plus tard
  const busy=['ov-whatsnew','ov-super-welcome','ov-emma-welcome','ov-tester-guide','ov-tester-eq','ov-billoute','ov-christophe-photos','ov-memoire-c','ov-pesee-nav-c','ov-pesee-nav-e','ov-bday'].some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('open');});
  if(busy){setTimeout(showTester3B,2500);return;}
  const o=document.getElementById('ov-tester-3b');if(o)o.classList.add('open');
}
function closeTester3B(){try{localStorage.setItem('ft4_tester_3b_v1','1');}catch(e){}const o=document.getElementById('ov-tester-3b');if(o)o.classList.remove('open');}
function openTesterSpace(){
  // L'Espace Testeur (dont la boîte à idées) est ouvert à TOUS les testeurs récompensés.
  // Le suivi photos n'est plus ici : il vit dans le menu photos du Profil (super testeurs).
  // Michel a le suivi photos via le panneau Admin.
  const isTester=(typeof _isTester==='function'&&_isTester());
  if(!isTester&&!(typeof _isSuperTester==='function'&&_isSuperTester())){toast('Espace réservé aux testeurs','info');return;}
  _renderTesterSpace();const o=document.getElementById('ov-tester-space');if(o)o.classList.add('open');}
function closeTesterSpace(){const o=document.getElementById('ov-tester-space');if(o)o.classList.remove('open');}
function _renderTesterSpace(){
  const body=document.getElementById('tester-space-body');if(!body)return;
  const esc=(t)=>(typeof _escNote==='function'?_escNote(t):(t||'')).replace(/\n/g,'<br>');
  const ideas=(S.testerIdeas||[]).slice().reverse();
  const ideasHtml=ideas.length?ideas.map(it=>'<div class="tsp-idea">'+esc(it.text)+'<span class="tsp-idea-date">'+(it.date||'')+(it.photos?' · '+it.photos+' photo'+(it.photos>1?'s':''):'')+(it.sent?' · envoyée ✓':'')+'</span></div>').join(''):'';
  // La carte « Analyse approfondie de tes photos » a été RETIRÉE d'ici le 31/07/2026
  // (décision Michel : « ça n'a plus lieu d'être ») : son discours « en avant-première rien
  // que pour toi » datait d'avant l'Étude du corps Premium. Le suivi photos des super
  // testeurs vit maintenant dans le menu photos du Profil (setup.js _renderPhotoMenu).
  body.innerHTML=
    '<div class="tsp-card">'
    +'<h4>💡 Ta boîte à idées</h4>'
    +'<p>Écris ce que tu aimerais, joins des photos ou des captures d’écran. Ça remonte direct à Michel.</p>'
    +'<textarea id="tester-idea-input" placeholder="Ton idée, une remarque, un bug, un truc qui te manque…" style="width:100%;min-height:72px;background:var(--bg2);border:1px solid var(--sep);border-radius:10px;padding:10px;color:var(--t1);font-family:var(--font);font-size:13.5px;resize:vertical;box-sizing:border-box;"></textarea>'
    +'<div id="tester-idea-thumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div>'
    +'<div style="display:flex;gap:8px;margin-top:8px;">'
    +'<button class="btn btn-bg2" onclick="document.getElementById(\'tester-idea-photos\').click()" style="width:auto;flex:none;padding:11px 14px;font-size:14px;">📎 Photo</button>'
    +'<button class="btn btn-red" onclick="sendTesterIdea()" style="width:auto;flex:1;padding:11px;font-size:14px;">📩 Envoyer à Michel</button>'
    +'</div>'
    +'<input type="file" id="tester-idea-photos" accept="image/*" multiple style="display:none;" onchange="onTesterIdeaPhotos(this)">'
    +(ideas.length?'<div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;font-weight:700;">Tes idées envoyées</div>'+ideasHtml:'')
    +'</div>';
  _renderTesterIdeaThumbs();
}
function onTesterIdeaPhotos(input){
  [...(input.files||[])].forEach(f=>{if(f&&f.type&&f.type.indexOf('image')===0)_testerIdeaFiles.push(f);});
  input.value='';
  _renderTesterIdeaThumbs();
}
function _renderTesterIdeaThumbs(){
  const el=document.getElementById('tester-idea-thumbs');if(!el)return;
  const thumbs=_testerIdeaFiles.map((f,i)=>{
    const url=URL.createObjectURL(f);
    return '<div style="position:relative;width:58px;height:58px;border-radius:9px;overflow:hidden;border:1px solid var(--sep);"><img src="'+url+'" style="width:100%;height:100%;object-fit:cover;"><button onclick="removeTesterIdeaPhoto('+i+')" style="position:absolute;top:1px;right:1px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;border:none;font-size:12px;line-height:1;cursor:pointer;padding:0;">×</button></div>';
  }).join('');
  // Plus de bouton de partage séparé : les photos partent AVEC l'idée (bouton « Envoyer »).
  el.innerHTML=thumbs;
}
function removeTesterIdeaPhoto(i){_testerIdeaFiles.splice(i,1);_renderTesterIdeaThumbs();}
let _sendingIdea=false; // 🛡️ anti double-envoi : 2 idées de Christophe sont parties EN DOUBLE (taps à 2 s
// et 18 s d'écart) — pendant le redimensionnement des photos + l'envoi, un 2ᵉ tap relançait tout.
async function sendTesterIdea(){
  const inp=document.getElementById('tester-idea-input');
  const txt=inp?(inp.value||'').trim():'';
  if(!txt&&!_testerIdeaFiles.length){toast('Écris ton idée ou joins une photo 🙂','info');return;}
  if(_sendingIdea){toast('Envoi déjà en cours…','info');return;}
  _sendingIdea=true;
  try{
  const who=(S.name||'Testeur');
  const nPhotos=_testerIdeaFiles.length;
  toast(nPhotos?'Envoi de ton idée + photos…':'Envoi de ton idée…','info');
  // Photos → base64 (comme l'import de programme) pour partir AVEC le texte, en 1 seul envoi
  let images=[];
  try{ images=await Promise.all(_testerIdeaFiles.map(f=>_resizeToB64(f,1100,0.82).then(data=>({data,type:'image/jpeg'})))); }
  catch(e){ images=[]; }
  // Trace locale
  S.testerIdeas=S.testerIdeas||[];
  S.testerIdeas.push({text:txt||'(photos jointes)',date:new Date().toLocaleDateString('fr-FR'),photos:nPhotos,sent:true});
  persist();
  // Envoi serveur en NO-CORS (fiable comme _cloudSync — passe en wifi ET en 4G/5G) : texte + photos
  // ENSEMBLE, en 1 seul envoi. ⚠️ Bug Christophe : avant, un fetch CORS lisait la réponse et
  // échouait sur certains réseaux → repli `mailto` qui NE PEUT PAS joindre de pièce jointe (photos
  // absentes du mail). En no-cors, le backend reçoit bien les images et les met en pièces jointes.
  let sent=false;
  try{
    await fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action:'testerIdea',email:S.email||'',name:who,text:txt||'(photos jointes)',photos:images.length,images,date:new Date().toISOString()})});
    sent=true;
  }catch(e){ sent=false; }
  _testerIdeaFiles=[];
  if(inp)inp.value=''; _renderTesterSpace();
  if(sent){
    toast(nPhotos?('Idée + '+nPhotos+' photo'+(nPhotos>1?'s':'')+' envoyées à Michel ✅'):'Idée envoyée à Michel ✅','success');
  }else{
    // Réseau totalement HS → repli mail TEXTE (le mailto ne peut pas porter les photos).
    _testerIdeaMailto('💡 Idée Force Tracker — '+who,'Idée de '+who+' ('+(S.email||'')+') :\n\n'+(txt||'(voir photos)')+'\n\n— boîte à idées Force Tracker',nPhotos);
    toast('Réseau injoignable — idée envoyée par mail (texte, ajoute la photo à la main)','info');
  }
  }finally{_sendingIdea=false;} // le verrou saute TOUJOURS, même si l'envoi plante (sinon la boîte serait morte)
}
// Partage optionnel des photos/captures (bouton séparé) — l'utilisateur choisit Mail/Messages.
function shareTesterPhotos(){
  if(!_testerIdeaFiles.length){toast('Ajoute d’abord une photo 🙂','info');return;}
  const who=(S.name||'Testeur');
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:_testerIdeaFiles})){
    navigator.share({files:_testerIdeaFiles.slice(),text:'Photos pour Michel (Force Tracker)'})
      .then(()=>{ _testerIdeaFiles=[]; _renderTesterSpace(); toast('Photos partagées ✅','success'); })
      .catch(err=>{ if(!(err&&err.name==='AbortError'))toast('Partage impossible sur cet appareil','error'); });
  } else { toast('Le partage de photos n’est pas dispo sur cet appareil','info'); }
}
function _testerIdeaMailto(subject,bodyM,nPhotos){
  let b=bodyM; if(nPhotos)b+='\n\n('+nPhotos+' photo'+(nPhotos>1?'s':'')+' à joindre depuis ta galerie)';
  const mail='mailto:'+TESTER_FEEDBACK_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(b);
  try{window.location.href=mail;}catch(e){}
}
// ── ADMIN : lecteur d'idées reçues (Michel lit tout le texte SANS ouvrir ses mails) ──
// Les photos NE SONT PAS stockées côté serveur (seulement leur nombre) → elles restent
// dans la boîte forcetracker.app@gmail.com. Le lecteur affiche le texte + « 📎 N photo(s) → mail ».
function _escIdea(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// ─── JETON ADMIN — AUCUN SECRET NE VIT DANS LE FRONTEND (07/08/2026) ──────────────────────
// 🔴 Avant, le jeton l'ancien jeton était écrit EN CLAIR ici, à trois endroits. Or ce fichier
// est servi publiquement par GitHub Pages ET présent dans un dépôt public : le secret était
// donc distribué avec l'application, et `?action=getIdees` livrait le NOM, l'E-MAIL et le
// MESSAGE de chaque testeur à qui prenait la peine de lire `app.js`.
// *Un secret livré avec le client n'est pas un secret* — le hacher côté serveur n'y change rien.
// Le jeton se tape maintenant UNE fois et reste sur l'appareil de Michel. Il n'est plus nulle
// part dans le code, donc plus rien à faire fuiter (un test refuse d'ailleurs son retour).
function _adminTok(){
  let t=''; try{ t=localStorage.getItem('ft4_admin_tok')||''; }catch(e){}
  if(!t && typeof prompt==='function'){
    t=(prompt('Jeton admin (une seule fois sur cet appareil)')||'').trim();
    if(t){ try{ localStorage.setItem('ft4_admin_tok',t); }catch(e){} }
  }
  return t;
}
// ⚠️ Jeton refusé → on l'OUBLIE. Sans ça, une faute de frappe verrouillerait l'admin pour
// toujours sur cet appareil, sans aucun moyen de se rattraper (R29 : on laisse toujours la
// porte de sortie ouverte quand l'erreur est probable).
function _adminTokRefuse(d){
  if(d && d.error==='token'){ try{ localStorage.removeItem('ft4_admin_tok'); }catch(e){} return true; }
  return false;
}
async function loadTesterIdeasAdmin(){
  const box=document.getElementById('admin-ideas-list');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Chargement des idées…</div>';
  try{
    const url=S.url+'?action=getIdees&token='+encodeURIComponent(_adminTok());
    const r=await fetch(url,{method:'GET'});
    const d=await r.json();
    if(_adminTokRefuse(d)){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Jeton refusé — relance, il te sera redemandé.</div>'; return; }
    if(!d||d.status!=='ok'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(d&&d.error||'inconnue')+' — réessaie.</div>'; return; }
    const arr=(d.ideas||[]).slice().reverse(); // plus récentes en haut
    if(!arr.length){ box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Aucune idée reçue pour l\'instant.</div>'; return; }
    let h='<div style="font-size:11.5px;color:var(--t3);margin:2px 0 8px;">'+arr.length+' idée'+(arr.length>1?'s':'')+' — la plus récente en haut</div>';
    arr.forEach(it=>{
      const nph=+(it.photos||0);
      h+='<div style="background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:10px 12px;margin-bottom:8px;">'
        +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">'
        +'<div style="font-weight:700;color:var(--t1);font-size:13px;">'+_escIdea(it.name||'Testeur')+'</div>'
        +'<div style="font-size:11px;color:var(--t3);white-space:nowrap;">'+_escIdea(it.date||'')+'</div>'
        +'</div>'
        +(it.email?'<div style="font-size:11px;color:var(--t3);margin-top:1px;">'+_escIdea(it.email)+'</div>':'')
        +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin-top:6px;white-space:pre-wrap;">'+_escIdea(it.text||'')+'</div>'
        +(nph>0?'<div style="font-size:11.5px;color:var(--gold);margin-top:6px;">📎 '+nph+' photo'+(nph>1?'s':'')+' → voir dans forcetracker.app@gmail.com</div>':'')
        +'</div>';
    });
    box.innerHTML=h;
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réseau injoignable — réessaie (les idées restent lisibles dans ta boîte mail).</div>';
  }
}

// ─── EXERCICES CRÉÉS PAR LES UTILISATEURS (admin) ────────────
// La remontée existe depuis longtemps (`_reportCustomEx` → onglet « Exercices manquants » du
// Sheet), mais Michel (02/08) : « je ne vais jamais dans Google Sheet ». Une donnée rangée où
// personne ne va n'existe pas — c'est le pendant de « une règle noyée dans un fichier qu'on ne
// lit plus n'est plus une règle ». On la ramène DANS l'app, à côté de la boîte à idées (R13).
async function loadCustomExAdmin(){
  const box=document.getElementById('admin-cex-list');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Chargement…</div>';
  try{
    const r=await fetch(S.url+'?action=getCustomEx&token='+encodeURIComponent(_adminTok()),{method:'GET'});
    const d=await r.json();
    if(_adminTokRefuse(d)){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Jeton refusé — relance, il te sera redemandé.</div>'; return; }
    if(!d||d.status!=='ok'){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Erreur : '+_escIdea(d&&d.error||'inconnue')+' — réessaie.</div>'; return; }
    const arr=d.exercices||[];
    if(!arr.length){ box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Personne n\'a encore créé d\'exercice perso.</div>'; return; }
    const nPlus=arr.filter(e=>e.count>1).length;
    let h='<div style="font-size:11.5px;color:var(--t3);margin:2px 0 8px;">'+arr.length+' exercice'+(arr.length>1?'s':'')
      +(nPlus?' — dont <b style="color:var(--gold);">'+nPlus+' demandé'+(nPlus>1?'s':'')+' par plusieurs personnes</b>':'')+'</div>';
    arr.forEach(e=>{
      const plusieurs=e.count>1;
      const mus=[e.musclesP,e.musclesS].filter(Boolean).join(' · ');
      h+='<div style="background:var(--bg2);border:1px solid '+(plusieurs?'var(--gold)':'var(--sep)')+';border-radius:12px;padding:10px 12px;margin-bottom:8px;">'
        +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">'
        +'<div style="font-weight:700;color:var(--t1);font-size:13px;">'+_escIdea(e.name||'')+'</div>'
        +'<div style="font-size:11px;font-weight:700;white-space:nowrap;color:'+(plusieurs?'var(--gold)':'var(--t3)')+';">'
        +e.count+'×</div></div>'
        +'<div style="font-size:11.5px;color:var(--t3);margin-top:2px;">'+_escIdea(e.group||'—')
        +(e.last?' · vu le '+_escIdea(e.last):'')+'</div>'
        // Les muscles cochés par la personne : c'est ce qui permet de l'ajouter DÉJÀ classé.
        +(mus?'<div style="font-size:12px;color:var(--t2);margin-top:5px;">💪 '+_escIdea(mus)+'</div>'
             :'<div style="font-size:11.5px;color:var(--t3);margin-top:5px;font-style:italic;">muscles non renseignés</div>')
        +'</div>';
    });
    box.innerHTML=h;
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réseau injoignable — réessaie.</div>';
  }
}

// ─── SANTÉ DU SYSTÈME (admin) ────────────────────────────────
// Les 4 sondes existaient depuis longtemps côté serveur, mais il fallait taper une URL avec un
// jeton à la main : donc personne ne les consultait. La panne du 29/07 — réservoir de stockage
// plein à 102 %, plus AUCUNE écriture pendant 2 jours (sync figée, boîte à idées muette, mails
// morts) — était lisible par `storeHealth` dès le premier jour. Elle a été vue 2 jours plus tard.
// Même leçon que le Google Sheet : *une donnée rangée où personne ne va n'existe pas.*
function _healthRow(icone,titre,etat,detail){
  const c={ok:'var(--green)',warn:'var(--gold)',ko:'var(--red)'}[etat]||'var(--t3)';
  const pastille={ok:'🟢',warn:'🟠',ko:'🔴'}[etat]||'⚪';
  return '<div style="display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--sep);">'
    +'<div style="font-size:14px;line-height:1.3;">'+pastille+'</div><div style="flex:1;min-width:0;">'
    +'<div style="font-weight:700;color:var(--t1);font-size:13px;">'+icone+' '+titre+'</div>'
    +'<div style="font-size:12px;color:'+c+';margin-top:2px;line-height:1.45;">'+detail+'</div></div></div>';
}
// Les deux déploiements qui font vivre l'app. Un échec ici est TOTALEMENT silencieux — et c'est
// déjà arrivé deux fois : le site bloqué plusieurs versions en arrière (ft-v600, ft-v619) et le
// backend qui ne partait plus depuis mi-juillet (rechute worker.js, vue seulement le 21/07).
const _DEPLOYS=[
  {path:'.github/workflows/deploy-pages.yml',      lbl:'Dernière mise en ligne de l\'app'},
  // ⚠️ Libellés au PASSÉ et explicites : ces lignes disent qu'un déploiement s'est bien
  //    passé, PAS que le service tourne aujourd'hui. La confusion entre les deux a fait
  //    afficher « serveur OK » pendant qu'un appel échouait (13/08). L'état du jour, c'est
  //    la ligne « Le serveur répond » juste au-dessus.
  {path:'.github/workflows/deploy-appsscript.yml', lbl:'Dernière mise en ligne du serveur'}
];
/* ─── LE SERVEUR RÉPOND-IL MAINTENANT ? (13/08/2026) ───────────────────────────────────
   Michel, capture à l'appui : la carte affichait « Le serveur (Milo, sync, premium) : ✅ OK
   — 11/08 16:26 » **à la seconde même** où un appel au backend échouait sous ses yeux
   (« Réseau injoignable » sur les exercices demandés).
   ⚠️ LES DEUX NE DISENT PAS LA MÊME CHOSE, et c'est tout le défaut : `_healthDeploys` lit
   l'historique GitHub — donc « le dernier DÉPLOIEMENT s'est bien passé », avant-hier. Ça ne
   dit rien de l'état du serveur AUJOURD'HUI. *Un indicateur qui rassure sans rien mesurer est
   pire qu'un indicateur absent* : c'est précisément ce que cette carte existe pour éviter.
   On appelle donc `?test=1` — l'adresse prévue pour ça depuis toujours, et que la carte
   n'appelait jamais. Elle porte sur Apps Script (sauvegarde cloud, premium, synchro) ; Milo,
   lui, passe par le Worker Cloudflare : deux chemins, on ne prétend pas que l'un prouve
   l'autre. */
async function _healthServeur(){
  const t0=Date.now();
  try{
    const ctl=('AbortController' in window)?new AbortController():null;
    const to=setTimeout(()=>{try{ctl&&ctl.abort();}catch(e){}},20000);
    const r=await fetch((S.url||DEFAULT_URL)+'?test=1',{method:'GET',redirect:'follow',...(ctl?{signal:ctl.signal}:{})});
    clearTimeout(to);
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    const ms=Date.now()-t0;
    if(d&&d.status==='online'){
      // Lent mais vivant : on le dit sans crier. Au-delà de 8 s, l'app paraît figée à l'usage.
      return _healthRow('📡','Le serveur répond', ms>8000?'warn':'ok',
        '<b>En ligne</b> · version '+_escIdea(String(d.version||'?'))+' · répondu en '+(ms/1000).toFixed(1)+' s'
        +(ms>8000?'<br>⚠️ Très lent — la sauvegarde et le premium peuvent sembler bloqués.':''));
    }
    throw new Error('réponse inattendue');
  }catch(e){
    const q=(e&&e.name==='AbortError')?'trop lent (>20 s)':_escIdea(String(e&&e.message||e));
    return _healthRow('📡','Le serveur répond','ko',
      '<b>INJOIGNABLE</b> ('+q+')<br>⚠️ Tant que c\'est rouge : pas de sauvegarde cloud, pas de vérification premium, pas de synchro des séances. '
      +'Tes séances restent en sécurité <b>sur le téléphone</b>.');
  }
}
async function _healthDeploys(){
  try{
    const r=await fetch('https://api.github.com/repos/michdu75-commits/forcetracker/actions/runs?per_page=30&branch=master');
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    const runs=d.workflow_runs||[];
    let pire='ok', lignes=[];
    _DEPLOYS.forEach(w=>{
      const run=runs.find(x=>x&&x.path===w.path);
      if(!run){ lignes.push('· '+w.lbl+' : <b>aucun déploiement trouvé</b>'); if(pire==='ok')pire='warn'; return; }
      const enCours=run.status!=='completed';
      const ok=run.conclusion==='success';
      if(!ok&&!enCours) pire='ko'; else if(enCours&&pire==='ok') pire='warn';
      const quand=run.created_at?new Date(run.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
      lignes.push('· '+w.lbl+' : '+(enCours?'⏳ en cours':(ok?'✅ OK':'<b>❌ ÉCHEC</b>'))+(quand?' — '+quand:''));
    });
    return _healthRow('🚀','Mises en ligne', pire,
      lignes.join('<br>')
      +(pire==='ko'?'<br>⚠️ Tant que c\'est rouge, <b>tes changements ne partent pas</b> — l\'app reste sur l\'ancienne version.':''));
  }catch(e){
    // Dépôt passé en privé, coupure réseau, ou plafond GitHub atteint : on le dit, on n'invente pas.
    return _healthRow('🚀','Mises en ligne','warn','État non lisible ('+_escIdea(String(e&&e.message||e))+') — à vérifier sur l\'onglet Actions de GitHub.');
  }
}
async function loadHealthAdmin(){
  const box=document.getElementById('admin-health');
  if(!box)return;
  if(!_isAdminUnlocked()){ box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réservé à l\'admin.</div>'; return; }
  box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Vérification…</div>';
  const TOK=_adminTok();
  // ⚠️ EN SÉRIE, pas en parallèle (constaté le 02/08 sur le téléphone de Michel : 3 sondes sur 5
  // en « réseau »). Google Apps Script traite les requêtes d'un MÊME compte une par une : lancer
  // les 4 d'un coup fait attendre les suivantes jusqu'au délai d'expiration. C'est plus lent
  // (quelques secondes) mais ça répond vraiment — et un diagnostic qui ne répond pas ne sert à rien.
  const get=async a=>{
    try{
      const ctl=('AbortController' in window)?new AbortController():null;
      const to=setTimeout(()=>{try{ctl&&ctl.abort();}catch(e){}},25000);
      const r=await fetch(S.url+'?action='+a+'&token='+encodeURIComponent(TOK),{method:'GET',...(ctl?{signal:ctl.signal}:{})});
      clearTimeout(to);
      const d=await r.json();
      _adminTokRefuse(d);   // jeton mauvais → oublié, il sera redemandé au prochain passage
      return d;
    }catch(e){ return {status:'error',error:(e&&e.name==='AbortError')?'trop lent (>25 s)':'réseau'}; }
  };
  try{
    box.innerHTML='<div style="color:var(--t3);font-size:12.5px;padding:6px 0;">Vérification… (4 contrôles, quelques secondes)</div>';
    const st=await get('storeHealth');
    const bk=await get('checkBackup');
    const mf=await get('mailFails');
    const ai=await get('aiUsage');
    let h='';
    // ① Stockage — c'est CE réservoir qui a lâché le 29/07 (512 Ko partagés par tous les comptes)
    if(st&&st.status==='ok'){
      const pct=+st.pourcentPlein||0;
      const et=pct>=90?'ko':(pct>=75?'warn':'ok');
      const ecr=(st.testEcriture==='ok');
      h+=_healthRow('💾','Stockage des comptes',
        (!ecr?'ko':et),
        'Rempli à <b>'+pct+' %</b> ('+Math.round((st.totalOctets||0)/1024)+' Ko sur 500) · '+(st.nbCles||0)+' clés'
        +(ecr?' · écriture OK':' · <b>ÉCRITURE IMPOSSIBLE</b> — plus rien ne se sauvegarde')
        +(pct>=75?'<br>⚠️ Au-delà de 100 %, toutes les sauvegardes s\'arrêtent en silence (c\'est ce qui est arrivé le 29/07).':''));
    } else h+=_healthRow('💾','Stockage des comptes','ko','Sonde injoignable : '+_escIdea((st&&st.error)||'?'));
    // ①bis Historiques protégés — le garde-fou du 02/08. Une alerte qui ne remonte nulle part
    // ne sert à personne : si un appareil envoie un historique amputé, ça doit se VOIR ici.
    if(st&&st.status==='ok'){
      const refus=st.histRefus||[];
      h+=_healthRow('🛡️','Historiques protégés', refus.length?'warn':'ok',
        refus.length
          ? '<b>'+refus.length+' sauvegarde(s) refusée(s)</b> parce qu\'elles auraient réduit un historique :<br>'
            + refus.slice(0,4).map(r=>'· '+_escIdea(String(r.e||'?'))+' — '+r.recues+' séances envoyées contre <b>'+r.enBase+'</b> en base ('+String(r.d||'').slice(0,10)+')').join('<br>')
            + '<br>Rien n\'est perdu : le serveur a gardé la version complète. L\'appareil concerné doit faire « Restaurer ».'
          : 'Aucun rétrécissement d\'historique refusé — les sauvegardes de séances sont cohérentes.');
    }
    // ② Sauvegardes de la nuit
    if(bk&&bk.status==='ok'){
      // ⚠️ LA DATE VIENT DU SERVEUR, PLUS DU NOM DU FICHIER (05/08/2026).
      // Deux bugs se cumulaient : le serveur triait les fichiers par NOM (« backup-MIGRATION-
      // 2026-06-29 » passait après « backup-2026-08-05 », car « m » > « 2 »), et l'app lisait
      // ensuite la date DANS ce nom. Résultat : le fichier de migration du 29 juin était
      // annoncé « le plus récent » pour toujours, et le voyant serait resté ROUGE même avec
      // des sauvegardes parfaites — l'alarme qui crie pour rien, celle qu'on finit par ignorer.
      // `lastDate`/`lastName` sont désormais fournis par le serveur (date Drive réelle) ;
      // le repli sur le nom ne sert qu'aux appareils qui parlent à un backend pas encore à jour.
      const dernier=bk.lastName||((bk.lastFiles&&bk.lastFiles.length)?bk.lastFiles[bk.lastFiles.length-1]:'');
      const m=bk.lastDate?[null,String(bk.lastDate).slice(0,10)]:dernier.match(/(\d{4}-\d{2}-\d{2})/);
      // La date du jour vient de `today()` — celle du TÉLÉPHONE, jamais celle de Greenwich :
      // c'est la règle du projet née du bug ft-v655, et un test permanent la fait respecter.
      // (Le nom du fichier est écrit côté serveur en UTC : dans la fenêtre minuit → 2 h du matin
      // à Paris, l'écart peut donc afficher un jour de plus. Assumé — mieux vaut ce décalage
      // cosmétique qu'une exception à une règle née d'un vrai bug de dates.)
      const jours=m?Math.round((Date.parse(today()+'T00:00:00Z')-Date.parse(m[1]+'T00:00:00Z'))/86400000):null;
      const et=(!bk.triggersInstalled||jours===null||jours>2)?'ko':(jours>1?'warn':'ok');
      h+=_healthRow('🌙','Sauvegardes automatiques', et,
        (bk.triggersInstalled?'Programmée chaque nuit':'<b>AUCUNE programmation</b> — plus de sauvegarde !')
        +' · '+(bk.fileCount||0)+' fichiers'
        +(dernier?'<br>Dernière : <b>'+_escIdea(dernier)+'</b>'+(jours===null?'':(jours<=0?' (aujourd\'hui)':(jours===1?' (hier)':' (il y a '+jours+' j)'))):'<br><b>Aucune sauvegarde trouvée</b>'));
    } else h+=_healthRow('🌙','Sauvegardes automatiques','ko','Sonde injoignable : '+_escIdea((bk&&bk.error)||'?'));
    // ③ Mails — c'est ce qui a fait perdre le message de Christophe
    if(mf&&mf.status==='ok'){
      const n=(mf.fails&&mf.fails.length)||mf.count||0;
      const reste=(mf.quotaRestant!==undefined)?mf.quotaRestant:null;
      h+=_healthRow('✉️','Envoi des mails', n>0?'ko':'ok',
        n>0?('<b>'+n+' échec'+(n>1?'s':'')+'</b> — des messages de testeurs ont pu se perdre')
           :('Aucun échec'+(reste!==null?' · quota restant : '+reste:'')));
    } else h+=_healthRow('✉️','Envoi des mails','warn','Sonde injoignable : '+_escIdea((mf&&mf.error)||'?'));
    // ④ Consommation IA (le coût)
    if(ai&&ai.status==='ok'){
      const u=ai.used!==undefined?ai.used:(ai.count!==undefined?ai.count:null);
      h+=_healthRow('🤖','Consommation IA','ok', u!==null?('<b>'+u+'</b> appels comptés'+(ai.limit?' (plafond '+ai.limit+')':'')):'Compteur lu, rien d\'anormal');
      // 💰 LE COÛT RÉEL (③, 24/08/2026) — les tokens que le compteur ci-dessus ne dit pas.
      // `ai.usage` vient de `_aiUsageLire_()` (Code.js), alimenté par le Worker à CHAQUE
      // appel (`_rapporterUsage`, worker.js) — jamais estimé en caractères, toujours lu sur
      // le vrai champ `usage` que renvoie l'API Anthropic.
      if(ai.usage && ai.usage.totals){
        const t=ai.usage.totals;
        const parAction=Object.keys(ai.usage.byAction||{})
          .sort((a,b)=>(ai.usage.byAction[b].calls||0)-(ai.usage.byAction[a].calls||0))
          .slice(0,6)
          .map(k=>k+' <span style="color:var(--t3)">('+ai.usage.byAction[k].calls+')</span>')
          .join(' · ');
        h+=_healthRow('💰','Coût réel du jour','ok',
          '<b>'+(t.calls||0)+'</b> appel(s) · '+(t.inTok||0).toLocaleString('fr-FR')+' tokens entrée · '
          +(t.outTok||0).toLocaleString('fr-FR')+' sortie · '+(t.cacheR||0).toLocaleString('fr-FR')+' lus en cache'
          +(ai.usage.euroTotal!=null?' · <b>≈ '+ai.usage.euroTotal.toFixed(2).replace('.',',')+' €</b> (estimation)':'')
          +(parAction?'<br><span style="font-size:11.5px;color:var(--t2);">'+parAction+'</span>':''));
      } else if(ai.usage===null){
        h+=_healthRow('💰','Coût réel du jour','warn','Aucun appel enregistré aujourd\'hui pour l\'instant.');
      }
      /* 👥 QUI APPELLE MILO AUJOURD'HUI (ft-v1058) — Michel : *« est-il possible de savoir qui
         utilise Milo ou autre appel API sur l'application ? »*.
         ⭐⭐ IL N'Y AVAIT RIEN À CONSTRUIRE : `ai_quota.byEmail` compte déjà les appels par
         personne — c'est ce qui fait respecter le plafond de 50/jour — et la route `aiUsage`
         renvoyait DÉJÀ `topUsers` trié, `uniqueUsers` et `global`. Mesuré avant d'écrire une
         ligne : **zéro occurrence de `topUsers` dans ce fichier**. *La donnée arrivait dans
         l'app et se perdait à chaque ouverture* — R5, une donnée produite, exploitée pour une
         seule chose, jamais montrée.
         ⛔ CE QU'ON NE PEUT PAS DIRE, ET C'EST ÉCRIT À L'ÉCRAN : `ai_quota` compte des APPELS,
         pas des tokens. L'instrumentation des euros (`ai_usage`) ne porte PAS l'email. On peut
         donc afficher « christophe : 31 appels », **jamais** « christophe : 0,40 € » — le dire
         serait une fausse précision (R29).
         ⛔ ET ON N'AFFICHE QUE LA PARTIE AVANT L'ARROBASE. Michel a besoin de reconnaître ses
         testeurs, pas d'une liste d'adresses complètes recopiable. *Le strict nécessaire pour
         répondre à la question posée* — et sa question était « qui », jamais « quoi ».
         ⚠️ La ligne se tait s'il n'y a eu aucun appel : une liste vide se lirait comme une
         panne, alors que c'est une journée calme. */
      if(ai.topUsers && ai.topUsers.length){
        const _court=e=>String(e||'').split('@')[0].slice(0,18);
        const _liste=ai.topUsers.slice(0,8)
          .map(u=>(typeof _obsEsc==='function'?_obsEsc(_court(u.email)):_court(u.email))+' <b>'+(u.count||0)+'</b>').join(' · ');
        const _n=ai.uniqueUsers||ai.topUsers.length;
        const _plaf=(ai.global!=null&&ai.globalMax)?(' · <span style="color:var(--t3)">'+ai.global+' sur '+ai.globalMax+' pour tout le monde</span>'):'';
        h+=_healthRow('👥','Qui a appelé Milo aujourd\'hui','ok',
          '<b>'+_n+'</b> personne'+(_n>1?'s':'')+_plaf
          +'<br><span style="font-size:11.5px;color:var(--t2);">'+_liste+'</span>'
          +'<br><span style="font-size:11px;color:var(--t3);">Des APPELS, pas des euros — le coût par personne n\'est pas mesuré.</span>');
      } else if(ai.topUsers){
        h+=_healthRow('👥','Qui a appelé Milo aujourd\'hui','ok','Personne pour l\'instant — journée calme.');
      }
      // 🛡️ LE PLAFOND EST-IL ARMÉ ? (11/08/2026) — il ne l'est que si le secret partagé est posé
      // côté Cloudflare. Avant cette ligne, l'information n'était affichée NULLE PART : on posait
      // le secret sans aucun moyen de vérifier qu'il avait pris. *Un garde-fou qu'on ne peut pas
      // voir ne rassure que celui qui l'a écrit* (leçon de la sauvegarde morte 36 jours).
      // ⚠️ On affiche ce qui a été CONSTATÉ au dernier appel réel, avec sa date — pas une
      // intention. Tant qu'aucun appel IA n'a eu lieu depuis, l'état est « pas encore constaté ».
      if(ai.capKnown===false){
        h+=_healthRow('🛡️','Plafond de dépense','warn',
          'État <b>pas encore constaté</b> — pose une question à Milo, puis rouvre cette page.');
      } else {
        const _q=ai.capSeenAt?new Date(ai.capSeenAt):null;
        const _qd=(_q&&!isNaN(_q))?(' · constaté le '+_q.toLocaleDateString('fr-FR')+' à '+_q.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})):'';
        /* ⚠️ UN CONSTAT PÉRIMÉ NE DOIT PAS AVOIR L'AIR ACTUEL (14/08/2026) ─────────────────
           L'état du plafond n'est relevé QUE lorsqu'un appel à Milo passe par le Worker. Sans
           question posée, la carte réaffiche indéfiniment le DERNIER constat connu — Michel a
           lu « DÉSARMÉ » sur une capture, alors que le constat datait de la veille et
           n'incluait pas la clé qu'il venait de poser.
           C'est la famille de défaut corrigée deux fois le 13/08 (la carte qui disait « serveur
           OK » sans interroger le serveur) : *un indicateur qui a l'air actuel alors qu'il ne
           l'est pas*. Au-delà de 6 h, on le DIT et on donne le geste qui rafraîchit. */
        const _vieuxH=_q&&!isNaN(_q)?Math.floor((Date.now()-_q.getTime())/3600000):null;
        const _perime=(_vieuxH!==null&&_vieuxH>=6)
          ? '<br>⏳ Ce constat date de <b>'+(_vieuxH>=24?Math.floor(_vieuxH/24)+' j':_vieuxH+' h')
            +'</b> — il ne se met à jour qu\'en posant une question à Milo. Fais-le, puis relance la vérification.'
          : '';
        h+=_healthRow('🛡️','Plafond de dépense', ai.capArmed?'ok':(_perime?'warn':'ko'),
          ai.capArmed
            ? ('<b>ARMÉ</b> — au-delà du plafond, les appels sont refusés'+_qd+_perime)
            : ('<b>DÉSARMÉ</b> — les appels sont comptés mais <b>jamais bloqués</b>'+_qd
               +'<br>⚠️ Il manque le secret <code>FT_COUNT_TOKEN</code> dans le Worker Cloudflare.'+_perime));
      }
    } else h+=_healthRow('🤖','Consommation IA','warn','Sonde injoignable : '+_escIdea((ai&&ai.error)||'?'));
    // ⑤ Les DÉPLOIEMENTS — le silence le plus coûteux du projet : un déploiement rouge ne
    // prévient personne. En juillet, le backend a échoué à partir depuis MI-JUILLET sans que
    // personne le voie (rechute `worker.js`) : les changements s'accumulaient sans jamais
    // arriver en ligne. Lu via l'API PUBLIQUE de GitHub — le dépôt est public, donc aucun jeton
    // n'est nécessaire (et il ne faut JAMAIS en mettre ici). Plafond : 60 appels/h par IP,
    // largement suffisant pour un bouton qu'on presse de temps en temps.
    // ⑤ LE SERVEUR RÉPOND-IL MAINTENANT — la question que la carte ne posait jamais.
    h+=await _healthServeur();
    h+=await _healthDeploys();
    box.innerHTML=h+'<div style="font-size:11px;color:var(--t3);margin-top:8px;">Vérifié le '+new Date().toLocaleString('fr-FR')+'</div>';
  }catch(e){
    box.innerHTML='<div style="color:var(--red);font-size:12.5px;">Réseau injoignable — réessaie.</div>';
  }
}

// ─── DÉDICACE ANNIVERSAIRE — Eline (2 juillet) ───────────────
let _bdayCandlesLeft=19;
const _bdayCandles=[];

function checkBirthdayDedication(){
  if(!S.email||S.email.toLowerCase()!=='elineazs32@gmail.com')return;
  if(localStorage.getItem('ft4_bday_eline_2026'))return;
  const now=new Date();
  const m=now.getMonth()+1,d=now.getDate();
  // Fenêtre : 2–5 juillet (jour J + 3 jours de rattrapage si app pas ouverte le jour J)
  if(!(m===7&&d>=2&&d<=5))return;
  setTimeout(showBirthdayScreen,600);
}

function showBirthdayScreen(){
  const el=document.getElementById('ov-bday');
  if(!el)return;
  el.style.display='block';
  el.style.opacity='0';
  el.style.transition='opacity .7s ease';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity='1';}));
  _spawnBdayParticles();
  _initBdayCandles();
}

function closeBirthdayScreen(){
  const btn=document.getElementById('bday-btn');
  if(btn&&btn.disabled)return; // bouton verrouillé = bougies pas encore toutes soufflées
  localStorage.setItem('ft4_bday_eline_2026','1');
  const el=document.getElementById('ov-bday');
  if(!el)return;
  el.style.transition='opacity .5s ease';
  el.style.opacity='0';
  setTimeout(()=>{el.style.display='none';},530);
}

function _spawnBdayParticles(){
  const c=document.getElementById('bday-particles');
  if(!c)return;
  c.innerHTML='';
  // Étoiles scintillantes
  for(let i=0;i<55;i++){
    const s=document.createElement('div');
    const sz=1+Math.random()*2.5;
    s.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:#fff;border-radius:50%;'
      +'left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;'
      +'animation:bday-twinkle '+(1.2+Math.random()*2.4)+'s '+(Math.random()*2.5)+'s ease-in-out infinite;';
    c.appendChild(s);
  }
  // Confettis qui tombent
  const cols=['#ffd700','#ff6b9d','#00d4ff','#7bed9f','#ff4757','#a29bfe','#ff9f43','#fff','#fd79a8'];
  for(let i=0;i<65;i++){
    const cf=document.createElement('div');
    const w=5+Math.random()*8,h=w*(0.3+Math.random()*.35);
    cf.style.cssText='position:absolute;width:'+w+'px;height:'+h+'px;'
      +'background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:2px;'
      +'left:'+Math.random()*100+'%;top:-20px;'
      +'animation:bday-fall '+(3.5+Math.random()*4.5)+'s '+(Math.random()*4)+'s linear infinite;'
      +'transform:rotate('+Math.floor(Math.random()*360)+'deg);opacity:'+(0.55+Math.random()*0.45)+';';
    c.appendChild(cf);
  }
  // Ballons qui montent
  const emojis=['🎈','🎈','🎈','🎀','🎊','🎉'];
  for(let i=0;i<6;i++){
    const b=document.createElement('div');
    b.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    b.style.cssText='position:absolute;font-size:'+(18+Math.random()*16)+'px;pointer-events:none;'
      +'left:'+(4+Math.random()*92)+'%;bottom:-60px;'
      +'animation:bday-rise '+(5+Math.random()*6)+'s '+(Math.random()*5)+'s ease-in infinite;';
    c.appendChild(b);
  }
}

function _initBdayCandles(){
  const container=document.getElementById('bday-candles');
  const sparkleZone=document.getElementById('bday-sparkle-zone');
  if(!container)return;
  container.innerHTML='';
  if(sparkleZone)sparkleZone.innerHTML='';
  _bdayCandlesLeft=19;
  _bdayCandles.length=0;
  const colors=['#ff6b6b','#ffd700','#74b9ff','#ff9f43','#7bed9f','#a29bfe','#fd79a8','#fdcb6e','#55efc4','#fd79a8','#ffd700','#6c5ce7','#f9ca24','#00cec9','#e17055','#4bcffa','#f53b57','#0be881','#fd9644'];
  for(let i=0;i<19;i++){
    const wrap=document.createElement('div');
    wrap.className='bday-candle';
    wrap.dataset.idx=String(i);
    wrap.style.cssText='position:relative;flex:1;max-width:14px;display:flex;flex-direction:column;align-items:center;';
    // Flamme
    const flame=document.createElement('div');
    flame.className='bday-flame';
    const dur=(0.28+Math.random()*.32).toFixed(2),del=(Math.random()*.5).toFixed(2);
    flame.style.cssText='width:10px;height:16px;flex-shrink:0;border-radius:50% 50% 35% 35%;'
      +'background:radial-gradient(ellipse at bottom,#fffbe0 0%,#ffe566 28%,#ff9900 65%,rgba(255,60,0,.1) 100%);'
      +'box-shadow:0 0 7px 2px rgba(255,190,0,.55);'
      +'animation:bday-flicker '+dur+'s '+del+'s ease-in-out infinite alternate;';
    // Corps de la bougie
    const body=document.createElement('div');
    const h=38+Math.round(Math.random()*18);
    body.style.cssText='width:8px;height:'+h+'px;flex-shrink:0;border-radius:3px 3px 2px 2px;'
      +'background:linear-gradient(to right,'+colors[i]+'cc,'+colors[i]+','+colors[i]+'cc);';
    // Fumée (cachée tant que la bougie est allumée)
    const smoke=document.createElement('div');
    smoke.className='bday-smoke-el';
    smoke.style.cssText='position:absolute;top:-4px;left:50%;transform:translateX(-50%);'
      +'width:8px;height:24px;opacity:0;pointer-events:none;'
      +'background:radial-gradient(ellipse at bottom,rgba(200,200,200,.65) 0%,transparent 80%);border-radius:50%;';
    wrap.appendChild(flame);
    wrap.appendChild(body);
    wrap.appendChild(smoke);
    container.appendChild(wrap);
    // Étincelle dorée dans la zone au-dessus
    let sparkle=null;
    if(sparkleZone){
      sparkle=document.createElement('div');
      const sz=1.5+Math.random()*2.5;
      const pct=((i+0.5)/19*100).toFixed(1);
      sparkle.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:#ffd700;border-radius:50%;'
        +'left:'+pct+'%;top:'+(8+Math.random()*72)+'%;pointer-events:none;'
        +'animation:bday-sparkle '+(0.4+Math.random()*.7)+'s '+(Math.random()*.5)+'s ease-in-out infinite;';
      sparkleZone.appendChild(sparkle);
    }
    _bdayCandles.push({wrap,flame,smoke,sparkle,lit:true});
  }
}

// Détection du passage du doigt sur les bougies
function _bdayTouch(e){
  e.preventDefault();
  const touches=e.changedTouches||e.touches;
  for(let i=0;i<touches.length;i++){
    const t=touches[i];
    let el=document.elementFromPoint(t.clientX,t.clientY);
    // Remonter jusqu'au conteneur .bday-candle
    while(el&&!el.classList.contains('bday-candle'))el=el.parentElement;
    if(!el||!el.classList.contains('bday-candle'))continue;
    const idx=parseInt(el.dataset.idx);
    if(isNaN(idx)||idx<0||idx>=_bdayCandles.length||!_bdayCandles[idx].lit)continue;
    _blowCandle(idx);
  }
}

function _blowCandle(idx){
  const c=_bdayCandles[idx];
  if(!c||!c.lit)return;
  c.lit=false;
  c.flame.style.display='none';
  if(c.sparkle)c.sparkle.style.display='none';
  c.smoke.style.opacity='1';
  c.smoke.style.animation='bday-smoke 1.4s ease-out forwards';
  _bdayCandlesLeft--;
  if(navigator.vibrate)navigator.vibrate(18);
  const n=document.getElementById('bday-n');
  if(n)n.textContent=_bdayCandlesLeft;
  if(_bdayCandlesLeft===0){
    const instr=document.getElementById('bday-instr-txt');
    if(instr)instr.textContent='✨ Bravo ! Toutes soufflées !';
    const nb=document.getElementById('bday-n');if(nb)nb.style.display='none';
    const wrap=document.getElementById('bday-instr-wrap');if(wrap)wrap.style.color='#7bed9f';
    setTimeout(()=>{
      const btn=document.getElementById('bday-btn');
      if(!btn)return;
      btn.disabled=false;
      btn.style.cssText='width:100%;max-width:270px;padding:16px 20px;border:none;border-radius:50px;'
        +'background:linear-gradient(135deg,#FF2D55,#ff6b8a);color:#fff;font-size:15px;font-weight:800;'
        +'cursor:pointer;font-family:system-ui,sans-serif;touch-action:manipulation;letter-spacing:.02em;'
        +'box-shadow:0 6px 24px rgba(255,45,85,.4);animation:bday-btn-pop .5s cubic-bezier(.25,.46,.45,.94);'
        +'-webkit-tap-highlight-color:transparent;';
      btn.textContent='✨ Bravo ! Entrer dans l\'appli';
    },700);
  }
}

// _premiumPending : initialisé sur window dans <head> de index.html — accessible depuis coach.js sans TDZ
window._premiumPending=!!S.email;
// Ping silencieux — fire-and-forget (no-cors peut bloquer sur iOS Safari PWA)
(async function autoConnect(){
  if(!S.url)return;
  // Ping non-bloquant : n'attend pas la réponse pour continuer
  fetch(S.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'test'})})
    .then(()=>{if(!S.connected){S.connected=true;persist();updatePill();}})
    .catch(()=>{});
  // Vérif premium + sync au démarrage — timeout 3s pour ne pas bloquer sur réseau faible
  if(S.email){
    try{
      const _ctrl=new AbortController();
      const _tId=setTimeout(()=>_ctrl.abort(),3000);
      const r2=await fetch(S.url,{method:'POST',redirect:'follow',signal:_ctrl.signal,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'loadProfile',email:S.email,authCode:_authCode()})});
      clearTimeout(_tId);
      const d2=await r2.json();
      console.log('[FT premium check]',{email:S.email,status:d2.status,premium:d2.premium,expiry:d2.premiumExpiry});
      if(d2.status==='ok'||d2.status==='not_found'){
        /* ⭐ ft-v1091 — LA GUÉRISON, ET ELLE EST AUSSI IMPORTANTE QUE L'ALERTE.
           Le serveur vient d'accepter : il n'y a plus aucun refus à afficher. Sans
           cette ligne, `ft4_auth_refus` — qui devient LU à partir d'aujourd'hui —
           resterait posé et le bandeau rouge deviendrait permanent chez quelqu'un
           dont tout remarche. *Rendre un drapeau visible oblige à écrire comment il
           s'éteint*, sinon on remplace un silence par un cri qui ne s'arrête plus. */
        try{ localStorage.removeItem('ft4_auth_refus'); }catch(e){}
        window._ftAuthRefusee=false;
        const wasPremium=S.premium;
        S.premium=(d2.premium===true)||(typeof _isClientPremium==='function'&&_isClientPremium());
        S.premiumExpiry=d2.premiumExpiry||'';
        if(d2.profile&&d2.profile.emailVerified)S.emailVerified=true; // confirmé côté cloud
        /* ⌚ LA BOÎTE DE RÉCEPTION DE LA MONTRE (ft-v880). Elle arrive avec le profil : aucun
           appel réseau en plus, donc aucun risque pour l'ouverture instantanée (règle d'or #4).
           ⚠️ ON ÉCRASE LA LOCALE SANS ÉTAT D'ÂME, et c'est volontaire : le serveur est la SEULE
           source de cette donnée (c'est le téléphone qui l'y dépose, jamais l'app). Un local plus
           récent n'existe pas — contrairement aux séances, où l'inverse serait une perte. */
        if(Array.isArray(d2.healthInbox)) S.healthInbox=d2.healthInbox;
        if(Array.isArray(d2.healthDaily)) S.healthDaily=d2.healthDaily;
        persist();
        try{if(typeof _renderEmailVerifyCard==='function')_renderEmailVerifyCard();}catch(e){}
        window._premiumPending=false;
        updateCoachHeader();
        if(S.premium&&!wasPremium){
          toast('🎉 Accès Premium activé !','success');
          const wall=document.getElementById('coach-wall');
          if(wall)wall.style.display='none';
        }
        // Mur différé : si non-premium confirmé et quota dépassé, afficher maintenant
        if(!S.premium&&(S.coachFree||0)>=COACH_FREE_LIMIT){
          if(typeof showPremiumWall==='function')showPremiumWall();
        }
        console.log('[FT premium]',S.premium?'activé':'désactivé','(was:',wasPremium,')');
        // Auto-restauration silencieuse — local-first : ne pull que si local VRAIMENT vide
        // (sessions + prs + programmes tous à 0 → purge totale confirmée)
        const _localEmpty=(!S.sessions||S.sessions.length===0)&&(!S.prs||!Object.keys(S.prs).length)&&(!S.programmes||S.programmes.length===0);
        if(d2.status==='ok'&&d2.sessions&&d2.sessions.length>0&&_localEmpty){
          console.log('[FT auto-restore] local vide, cloud a',d2.sessions.length,'séances — restauration');
          _applyRestoreData(d2);_saveEmailRedundant(S.email);
          toast('✅ Données resynchronisées','success');
          try{renderHome();}catch(e){}try{if(typeof renderSetup==='function')renderSetup();}catch(e){}
        }
        // Réseau disponible → tenter la resynchro des séances en attente
        if(typeof _retrySheetQueue==='function')setTimeout(_retrySheetQueue,1500);
      }else if(d2.status==='error'&&d2.error==='auth'){
        // ⚠️ LE REFUS NE DOIT JAMAIS ÊTRE SILENCIEUX (ft-v788). Avant, ce cas tombait dans un
        // `else` vide : le serveur refusait, et l'app n'affichait RIEN. La synchro mourait sans
        // un mot — exactement la famille de pannes qu'on traque depuis le 27/07.
        // ⚠️ ET C'EST LE SEUL ENDROIT QUI PEUT LE VOIR : `_cloudSync` envoie en `no-cors`, donc
        // elle est AVEUGLE par construction et ne verra jamais un refus. Ce contrôle-ci tourne à
        // CHAQUE ouverture : c'est notre unique canari.
        window._premiumPending=false;
        window._ftAuthRefusee=true;
        window._ftAuthNeedsCode=!!d2.needsCode;
        try{ localStorage.setItem('ft4_auth_refus', d2.needsCode?'new':'1'); }catch(e){}
        // ⚠️ LE PREMIUM NE DOIT PAS TOMBER AVEC LA LECTURE (ft-v789) : le serveur ne répond plus,
        // donc on retombe sur la liste client — sinon quelqu'un de premium perdrait son accès
        // Coach juste parce qu'il n'a pas encore posé de code. On ne punit pas deux fois.
        try{ if(typeof _isClientPremium==='function'&&_isClientPremium()){ S.premium=true; persist(); } }catch(e){}
        try{ if(typeof checkPremiumExpiry==='function') checkPremiumExpiry(); }catch(e){}
        try{ if(typeof updateCoachHeader==='function') updateCoachHeader(); }catch(e){}
        // Local d'abord (règle d'or #3) : on ne touche à AUCUNE donnée locale, on prévient.
        // Deux cas RADICALEMENT différents, et les confondre serait absurde :
        //   · needsCode → le compte n'a AUCUN code : lui en réclamer un n'aurait aucun sens.
        //   · sinon     → un code existe, cet appareil ne l'a pas.
        const _msg = d2.blocked ? 'Trop d\'essais — réessaie demain.'
          : (d2.needsCode ? 'Protège ton compte pour réactiver la sauvegarde en ligne'
                          : 'Compte protégé : saisis ton code pour resynchroniser');
        try{ toast('🔒 '+_msg,'error'); }catch(e){}
        try{ if(typeof _renderAuthRefusCard==='function') _renderAuthRefusCard(); }catch(e){}
      }else{window._premiumPending=false;}
    }catch(e){
      console.warn('[FT premium check] échec réseau (timeout ou panne):',e.message);
      window._premiumPending=false;
      checkPremiumExpiry();
      // En cas d'erreur réseau : si l'état local dit non-premium et quota dépassé, afficher le mur
      if(!S.premium&&(S.coachFree||0)>=COACH_FREE_LIMIT){
        if(typeof showPremiumWall==='function')showPremiumWall();
      }
    }
  } else {
    window._premiumPending=false;
    checkPremiumExpiry();
  }
})();
// Fallback IDB — si localStorage ET cookie vidés mais IDB survit (iOS purge complète localstorage/cookie)
(async function _autoRestoreFromIDB(){
  if(window.__FT_CLONE__)return; // clone de test : jamais hériter de l'identité/données de la prod (cookie + IDB partagés par origine)
  if(S.email||(S.sessions&&S.sessions.length>0))return; // email dispo ou données intactes
  const email=await _getEmailFromIDB();
  if(!email){
    // Aucun email nulle part — montrer overlay reconnect si on sait qu'il y avait des données
    const hadData=document.cookie.includes('ft_had_data=1')||localStorage.getItem('ft4_had_data')==='1';
    if(hadData)setTimeout(_showReconnectOverlay,600);
    return;
  }
  console.log('[FT auto-restore] email récupéré depuis IDB:',email);
  localStorage.setItem('ft4_email',email);S.email=email;
  const ok=await _silentCloudRestore(email);
  if(!ok){const hadData=document.cookie.includes('ft_had_data=1');if(hadData)_showReconnectOverlay();}
})();
document.addEventListener('pointerdown',function(e){
  const btn=e.target.closest('button');
  if(!btn||btn.disabled)return;
  const r=btn.getBoundingClientRect();
  const w=document.createElement('span');
  w.className='btn-ripple';
  w.style.left=(e.clientX-r.left)+'px';
  w.style.top=(e.clientY-r.top)+'px';
  btn.appendChild(w);
  setTimeout(()=>w.remove(),520);
});

// ─── ORIENTATION ─────────────────────────────────────────────
if(screen.orientation&&screen.orientation.lock){screen.orientation.lock('portrait').catch(()=>{});}

// ─── GESTIONNAIRE D'ERREURS GLOBAL ───────────────────────────
// ⚠️ On ENREGISTRE les erreurs, on ne se contente pas de les signaler.
// Sans ça, une erreur qui n'arrive que sur le téléphone de quelqu'un est
// impossible à diagnostiquer : le bandeau rouge dit qu'il y a un problème,
// jamais lequel. Les 8 dernières sont lisibles dans Profil → Admin.
function _logErr(o){
  try{
    const l=JSON.parse(localStorage.getItem('ft4_errlog')||'[]');
    // heure LOCALE (ft-v655) : une erreur horodatée à l'heure de Greenwich est illisible
    const _d=new Date(); const _t=new Date(_d.getTime()-_d.getTimezoneOffset()*6e4).toISOString().slice(0,19).replace('T',' ');
    l.unshift(Object.assign({t:_t},o));
    localStorage.setItem('ft4_errlog', JSON.stringify(l.slice(0,8)));
  }catch(e){}
}
window.addEventListener('error',e=>{
  // Ignore les erreurs d'assets externes (images, scripts tiers)
  if(e.filename&&!e.filename.includes(location.hostname))return;
  console.error('[FT] Erreur JS non rattrapée:',e.message,'@',e.filename,e.lineno);
  _logErr({m:String(e.message||'?').slice(0,180),
           f:String(e.filename||'').split('/').pop().slice(0,40), l:e.lineno||0});
  if(typeof toast==='function')toast('Erreur — si l\'appli ne répond plus, rechargez la page','error');
});
window.addEventListener('unhandledrejection',e=>{
  console.error('[FT] Promise rejetée:',e.reason);
  _logErr({m:'[promesse] '+String((e.reason&&e.reason.message)||e.reason||'?').slice(0,180),f:'',l:0});
});
// Affiche le journal dans l'onglet Admin (Profil → 🔧 Admin)
function renderErrLog(){
  const b=document.getElementById('admin-errlog'); if(!b)return;
  let l=[]; try{ l=JSON.parse(localStorage.getItem('ft4_errlog')||'[]'); }catch(e){}
  b.innerHTML = l.length
    ? l.map(x=>'<div style="padding:6px 0;border-bottom:1px solid var(--sep);">'
        +'<span style="color:var(--t3);">'+x.t+'</span><br>'
        +'<span style="color:var(--red);">'+String(x.m).replace(/</g,'&lt;')+'</span>'
        +(x.f?'<br><span style="color:var(--t3);">'+x.f+':'+x.l+'</span>':'')+'</div>').join('')
    : '<span style="color:var(--t3);">Aucune erreur enregistrée ✅</span>';
}
function clearErrLog(){ try{localStorage.removeItem('ft4_errlog');}catch(e){} renderErrLog();
  if(typeof toast==='function')toast('Journal vidé','info'); }

// ─── SERVICE WORKER ──────────────────────────────────────────
// Ne jamais recharger l'appli en pleine séance (perte de saisie / interruption d'un superset).
// Si une séance est en cours, on reporte le rechargement — persist() (state.js) le déclenchera
// dès que S.wkt redevient vide (fin de séance ou annulation).
window._swReloadPending=false;
/* 🛑 UNE MISE À JOUR NE COUPE JAMAIS QUELQU'UN EN PLEIN TRAVAIL (15/08/2026)
   Michel, en rentrant de la salle : *« putain la mise à jour s'est faite au moment où j'ai terminé
   ma séance, donc j'ai pas vu mon récapitulatif »*.
   LA CAUSE : le garde-fou existait — « ne jamais recharger EN PLEINE SÉANCE » — et il se relâchait
   à la milliseconde exacte où `S.wkt` se vide. Or `finishWorkout()` vide la séance **puis** ouvre
   le récapitulatif : records battus, volume, durée, calories, la question du ressenti, et le
   débrief de Milo qui arrive quelques secondes plus tard. Le `persist()` de la fin de séance
   déclenchait donc le rechargement **pile sur cet écran-là**.
   ⚠️ *La séance ne se termine pas quand la donnée est écrite : elle se termine quand la personne
   a vu ce qu'elle a fait.* Le garde-fou protégeait la SAISIE et pas la RESTITUTION — R4, encore.
   ⚠️ Et le même défaut existait ailleurs, en silence : sans séance en cours, `_reloadForUpdate`
   rechargeait **tout de suite**, où qu'on soit — en pleine conversation avec Milo, au milieu d'un
   graphique, dans un formulaire de profil.
   LA RÈGLE, une seule et vérifiable : **on n'applique la mise à jour que sur l'ACCUEIL**, sans
   séance en cours et sans récapitulatif ouvert. L'accueil est le seul endroit où l'on n'est en
   train de rien faire. Le reste du temps elle attend — le nouveau Service Worker est déjà
   installé, rien n'est perdu, et elle s'applique dès le retour à l'accueil ou à la prochaine
   ouverture de l'app. */
/* ⚠️⚠️ « SÉANCE EN COURS » NE SE MESURE PLUS AU NOMBRE D'EXERCICES (18/08/2026).
   Michel : *« faut éviter de faire une mise à jour quand je suis en séance, ça me nique mon bilan
   de fin de séance »* — la 2ᵉ fois qu'il le dit (la 1ʳᵉ, le 15/08, a créé ce garde-fou).
   LE TROU : la condition lisait `S.wkt.exs.length`. Une séance **commencée mais sans exercice
   encore saisi** — typiquement 20 min de vélo AVANT la musculation, exactement sa séance de ce
   matin — ne comptait donc pas comme une séance. Le seul rempart restant était « on n'applique
   que sur l'Accueil » : un aller-retour par l'accueil pendant le cardio, et la mise à jour
   tombait au milieu.
   👉 On lit maintenant `_seanceOuverte()` (log.js), la MÊME définition que le verrou d'écran —
   démarrée, ou avec des exercices, ou avec un cardio noté. Et **pause comprise** : une séance en
   pause n'est pas une séance finie. */
function _majPeutSAppliquer(){
  if(!window._swReloadPending) return false;
  if(typeof _seanceOuverte==='function' ? _seanceOuverte()
     : (S.wkt&&S.wkt.exs&&S.wkt.exs.length)) return false;             // séance non terminée
  const ov=document.getElementById('ov-session-end');
  if(ov&&ov.classList.contains('open')) return false;                  // récapitulatif à l'écran
  /* ⛔⛔ LE BANC D'ESSAI EST LA SEULE CHOSE DE L'APP QUI COÛTE DE L'ARGENT (01/09/2026).
     Trouvé en vérifiant s'il était prudent de déployer pendant que Michel lançait une passe :
     l'écran Admin le protégeait par hasard (`_curScreen !== 'home'`), mais **une passe lancée
     depuis l'Accueil aurait été tuée par une mise à jour**, à mi-parcours et déjà facturée.
     *Un garde-fou qui protège par effet de bord ne protège pas : il se contente de ne pas
     avoir échoué encore.* */
  if(typeof _evRunning!=='undefined' && _evRunning) return false;      // passe payante en cours
  if(window._curScreen&&window._curScreen!=='home') return false;      // la personne fait autre chose
  return true;
}
function _appliquerMaj(){
  if(!_majPeutSAppliquer()) return false;
  window._swReloadPending=false;
  try{localStorage.setItem('ft4_just_updated','1');}catch(e){} // → badge « Application mise à jour » au reboot
  window.location.reload();
  return true;
}
function _reloadForUpdate(){
  window._swReloadPending=true;
  if(_appliquerMaj()) return;
  // Reportée : on ne prévient que pendant une séance (le seul cas où l'attente peut durer).
  // Même définition que ci-dessus — sinon la séance qui commence par du cardio ne dirait rien.
  if((typeof _seanceOuverte==='function'?_seanceOuverte():(S.wkt&&S.wkt.exs&&S.wkt.exs.length))&&typeof toast==='function')
    toast('Mise à jour disponible — appliquée à la fin de la séance','info');
}
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    // updateViaCache:'none' → le navigateur NE met JAMAIS le fichier sw.js en cache HTTP
    // pour les vérifs de mise à jour. Corrige le bug iOS « app collée à l'ancienne version »
    // (GitHub Pages cachait sw.js ~10 min → les updates n'étaient pas détectées tout de suite).
    // ⚠️ CHAQUE appel doit avaler son échec. Une vérification de mise à jour qui n'aboutit pas
    // (réseau faible, 4G dans le métro, Pages momentanément indisponible) n'est PAS une erreur :
    // c'est le fonctionnement normal d'une app local-first, qui continue depuis son cache
    // (règle d'or #4). Sans `catch`, la promesse rejetée remontait dans `unhandledrejection`
    // et s'écrivait dans le journal d'erreurs de l'Admin.
    // Constaté le 04/08 sur la capture de Michel : « Script …/sw.js load failed » répété à
    // 14:22, 15:08, et la veille à 18:06 — soit le rythme des re-vérifications (5 min + retour
    // sur l'app + retour réseau). ⚠️ LE VRAI DÉGÂT N'EST PAS L'ERREUR, C'EST LE BRUIT :
    // un journal de diagnostic rempli d'événements attendus rend les vraies pannes invisibles.
    const _swMaj=reg=>{ try{ const p=reg.update(); if(p&&p.catch)p.catch(()=>{}); }catch(e){} };
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
      if(!reg)return; // garde-fou : certains contextes résolvent sans registration
      _swMaj(reg); // vérification immédiate au démarrage (PWA standalone inclus)
      setInterval(()=>_swMaj(reg), 5*60*1000); // re-vérif toutes les 5 min
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='visible')_swMaj(reg);
      });
      window.addEventListener('online',()=>{
        _swMaj(reg); // vérifie si nouveau SW disponible
        // Retour réseau → retry des séances non synchronisées (délai 1s pour stabilisation)
        setTimeout(()=>{if(typeof _retrySheetQueue==='function')_retrySheetQueue();},1000);
      });
    }).catch(()=>{
      // L'enregistrement lui-même a échoué : l'app fonctionne quand même (elle est déjà en
      // cache, ou elle ira au réseau). On ne pollue pas le journal avec ça.
    });
    navigator.serviceWorker.addEventListener('controllerchange',_reloadForUpdate);
    navigator.serviceWorker.addEventListener('message',e=>{
      if(!e.data)return;
      if(e.data.type==='SW_UPDATED')_reloadForUpdate();
      else if(e.data.type==='PRECACHE_PROGRESS')_showInstallProgress(e.data.done,e.data.total);
      else if(e.data.type==='PRECACHE_DONE')_hideInstallProgress();
    });
    // Auto-réparation : si le cache a été vidé (bouton, vidage navigateur, ou iOS qui purge
    // tout seul sous pression mémoire), on redemande au SW de réinstaller les figurines.
    navigator.serviceWorker.ready.then(reg=>{
      if(reg&&reg.active)reg.active.postMessage({type:'ENSURE_PRECACHE'});
    }).catch(()=>{});
  });
}
// Demande au Service Worker de réinstaller tous les fichiers (figurines incluses)
function _reprecacheSW(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.ready.then(reg=>{
    const sw=reg.active||navigator.serviceWorker.controller;
    if(sw)sw.postMessage({type:'REPRECACHE'});
  }).catch(()=>{});
}
// Affiche la place occupée par l'appli sur le téléphone (dans « À propos »)
function _fillStorageInfo(){
  const el=document.getElementById('_about-storage');if(!el)return;
  if(navigator.storage&&navigator.storage.estimate){
    navigator.storage.estimate().then(est=>{
      const mb=(est.usage||0)/1048576;
      el.textContent=mb>=1?mb.toFixed(0)+' Mo':Math.max(1,Math.round((est.usage||0)/1024))+' Ko';
    }).catch(()=>{el.textContent='—';});
  } else { el.textContent='—'; }
}
// Vide le cache des fichiers de l'appli (PAS les données) puis réinstalle les figurines
function clearAppCache(){
  const go=async()=>{
    try{
      if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); }
    }catch(e){}
    // Relance la réinstallation → la barre de progression réapparaît via les messages SW
    _reprecacheSW();
    if(typeof toast==='function')toast('Cache vidé — réinstallation des figurines…','info');
    setTimeout(_fillStorageInfo,1500);
  };
  if(typeof showConfirm==='function'){
    showConfirm('Vider le cache ?','Ça libère de la place et réinstalle les figurines. Tes séances, records et réglages ne sont PAS touchés.',go,'Vider');
  } else go();
}
// Barre d'installation : se remplit pendant que le Service Worker met les fichiers en cache (1re visite / mise à jour)
function _showInstallProgress(done,total){
  if(!total)return;
  const pct=Math.max(1,Math.round(done/total*100));
  let el=document.getElementById('install-progress');
  if(!el){
    el=document.createElement('div');el.id='install-progress';
    el.innerHTML='<div class="ip-label">📦 Installation de l\'appli… <span id="ip-pct">0%</span></div><div class="ip-track"><div id="ip-bar" class="ip-bar"></div></div>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
  }
  const bar=document.getElementById('ip-bar');if(bar)bar.style.width=pct+'%';
  const p=document.getElementById('ip-pct');if(p)p.textContent=pct+'%';
}
function _hideInstallProgress(){
  const el=document.getElementById('install-progress');if(!el)return;
  const bar=document.getElementById('ip-bar');if(bar)bar.style.width='100%';
  const p=document.getElementById('ip-pct');if(p)p.textContent='100%';
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{if(el.parentNode)el.remove();},400);},600);
}

// ─── ⛔ `_positionFab()` RETIRÉ LE 11/08/2026 (décision de Michel) ──────────────────────
// Elle positionnait un bouton FLOTTANT `#fab-session` au-dessus de la barre, par rapport à
// `#nb-log`, avec 4 écouteurs (DOMContentLoaded, load, load+300 ms, resize).
// **Ce bouton n'existe plus** : il a été redessiné pour être DOCKÉ DANS la barre (voir le
// commentaire de `style.css` : « Bouton central « + » — docké DANS la barre (fini le flottant
// #fab-session) »). La fonction sortait donc immédiatement — elle ne faisait plus rien depuis
// ce redesign, tout comme les 4 écouteurs et l'appel `requestAnimationFrame` de `log.js`.
//
// ⚠️ CE QUI LA REMPLACE, et ce n'est pas rien : le bouton central reste le repère le plus
// sensible de l'écran Séance. La règle d'or #9 le protège toujours — mais **par la MESURE**
// (relever `getBoundingClientRect(#nb-log)` avant/après et exiger l'égalité), avec un témoin
// permanent dans les tests de parcours depuis ft-v825. Vérifié le 11/08 : le bouton est un
// enfant du `<nav>`, en `position:relative`, 3ᵉ de 6, immobile au défilement.
//
// 👉 SI LE BOUTON FLOTTANT REVENAIT UN JOUR, il faudrait réécrire ce positionnement — mais
// alors il faudrait surtout relire `docs/GALERES-ET-LECONS.md` : le flottant recouvrait les
// séries et gênait le swipe. C'est une « fausse bonne idée » documentée, pas un oubli.
window.addEventListener('load',()=>{try{if(typeof _initSheetHandles==='function')_initSheetHandles();}catch(e){}}); // poignée glissable sur les overlays de contenu (reco UX GPT, ft-v550)

