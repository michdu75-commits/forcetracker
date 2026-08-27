/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── NAVIGATION ──────────────────────────────────────────────
// _curScreen : initialisé sur window dans <head> de index.html (window._curScreen='home')
function _closeAllPanels(){
  ['menu-drawer','menu-drawer-bd'].forEach(id=>{document.getElementById(id)?.classList.remove('open');});
  if(window._curScreen!=='setup')document.getElementById('nb-setup')?.classList.remove('active');
  document.getElementById('ov-drawer-cnt')?.classList.remove('open');
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-backdrop')?.classList.remove('open');
}
function _markScreenSeen(screen){
  // À l'ouverture d'un écran : on ne marque « vu » QUE les features SANS ancre ni spot.
  // - features ancrées (ex. Profil) : marquées à l'ouverture de leur item précis (menu).
  // - features « spot » (point rouge sur un élément de l'écran) : marquées quand on QUITTE
  //   l'écran (_markSpotSeen) → le point rouge reste visible tout le temps où l'utilisateur
  //   est sur l'écran, puis disparaît à la visite suivante.
  const unseen=NEW_FEATURES.filter(f=>f.screen===screen&&!f.anchor&&!f.spot&&!(S.seenFeatures||[]).includes(f.id));
  if(!unseen.length)return;
  S.seenFeatures=[...(S.seenFeatures||[]),...unseen.map(f=>f.id)];
  localStorage.setItem('ft4_seen_ft',JSON.stringify(S.seenFeatures));
  _updateNewBadges();
}
// Marque « vues » les features « spot » d'un écran qu'on vient de quitter (le point a été montré).
function _markSpotSeen(screen){
  const ids=NEW_FEATURES.filter(f=>f.screen===screen&&f.spot).map(f=>f.id);
  if(ids.length)_markFeatureSeen.apply(null,ids);
}
// Points rouges sur des éléments PRÉCIS d'un écran (onglet Progrès, carte Coach…) →
// montre OÙ est la nouveauté, pas juste sur l'onglet du bas.
function _updateScreenDots(screen){
  const seen=S.seenFeatures||[];
  document.querySelectorAll('.feat-dot').forEach(d=>d.remove());
  const done={};
  NEW_FEATURES.forEach(f=>{
    if(f.screen!==screen||!f.spot||seen.includes(f.id)||done[f.spot])return;
    const el=document.getElementById(f.spot);if(!el)return;
    done[f.spot]=true;
    if(getComputedStyle(el).position==='static')el.style.position='relative';
    const dot=document.createElement('span');dot.className='feat-dot';el.appendChild(dot);
  });
}
// Marque des features précises comme vues (par id) — utilisé quand on ouvre l'item concerné
function _markFeatureSeen(){
  const ids=[].slice.call(arguments);
  const seen=S.seenFeatures||[];
  const add=ids.filter(id=>!seen.includes(id));
  if(!add.length)return;
  S.seenFeatures=[...seen,...add];
  localStorage.setItem('ft4_seen_ft',JSON.stringify(S.seenFeatures));
  _updateNewBadges();
  _updateMenuDots();
}
// Marque vues toutes les features ancrées à un élément (ex. ouvrir la carte Profil)
function _markAnchorSeen(anchorId){
  const ids=NEW_FEATURES.filter(f=>f.anchor===anchorId).map(f=>f.id);
  if(ids.length)_markFeatureSeen.apply(null,ids);
}
function _updateNewBadges(){
  const seen=S.seenFeatures||[];
  const ack=S.menuAck||[];
  ['home','progress','log','nutrition','coach','setup'].forEach(sc=>{
    const btn=document.getElementById('nb-'+sc);if(!btn)return;
    // L'onglet Menu (setup) : le point s'éteint dès que l'utilisateur a OUVERT le Menu
    // (features déjà dans `menuAck`). Les points inline des lignes restent pour montrer OÙ.
    // Les autres onglets gardent le comportement d'origine (point tant qu'une feature de l'écran est non vue).
    const hasNew = sc==='setup'
      ? NEW_FEATURES.some(f=>f.screen==='setup'&&!seen.includes(f.id)&&ack.indexOf(f.id)<0)
      : NEW_FEATURES.some(f=>f.screen===sc&&!seen.includes(f.id));
    let dot=btn.querySelector('.new-dot');
    if(hasNew&&!dot){dot=document.createElement('span');dot.className='new-dot';btn.appendChild(dot);}
    else if(!hasNew&&dot)dot.remove();
  });
}
// Ouvrir le Menu = « j'ai vu qu'il y a du neuf » → éteint le point de l'onglet Menu
// (sans marquer les features « vues » : les points sur les lignes restent pour guider).
function _ackMenu(){
  const seen=S.seenFeatures||[];
  const cur=NEW_FEATURES.filter(f=>f.screen==='setup'&&!seen.includes(f.id)).map(f=>f.id);
  const ack=S.menuAck||[];
  const add=cur.filter(id=>ack.indexOf(id)<0);
  if(add.length){S.menuAck=[...ack,...add];try{localStorage.setItem('ft4_menu_ack',JSON.stringify(S.menuAck));}catch(e){}}
  _updateNewBadges();
}
// Points rouges INLINE dans le menu-drawer : sur chaque ligne (anchor) qui contient une nouveauté non vue.
// Appelé à l'ouverture du menu → l'utilisateur voit OÙ est le neuf (Profil, etc.).
function _updateMenuDots(){
  const seen=S.seenFeatures||[];
  const anchors={};
  NEW_FEATURES.forEach(f=>{if(f.anchor&&!seen.includes(f.id))anchors[f.anchor]=true;});
  // Retire d'abord tous les points existants (reset)
  document.querySelectorAll('.menu-new-dot').forEach(d=>d.remove());
  Object.keys(anchors).forEach(aid=>{
    const el=document.getElementById(aid);if(!el)return;
    const dot=document.createElement('span');
    dot.className='menu-new-dot';
    // Insère juste avant la flèche (dernier <svg> de la ligne) pour un placement propre
    const arrow=el.querySelector(':scope > svg:last-of-type');
    if(arrow)el.insertBefore(dot,arrow);else el.appendChild(dot);
  });
}

function _applyScreen(id,btn){
  const _prevScreen=window._curScreen;
  window._curScreen=id;
  // On quitte un écran → ses points rouges « spot » ont été vus : on les marque.
  if(_prevScreen&&_prevScreen!==id)_markSpotSeen(_prevScreen);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));
  document.getElementById('s-'+id)?.classList.add('active');
  if(btn)btn.classList.add('active');
  document.getElementById('root').classList.toggle('on-home',id==='home');
  document.getElementById('root').classList.toggle('on-log',id==='log');
  document.getElementById('root').classList.toggle('on-setup',id==='setup');
  /* 🔆 On ne relâche plus le verrou d'écran en quittant l'écran Séance : pendant une séance on
     va justement parler à Milo ou regarder ses records (18/08). `_syncWakeLock` (log.js) tient
     l'écran tant qu'une séance TOURNE, et le rend dès qu'elle est finie ou en pause. */
  if(typeof _syncWakeLock==='function')_syncWakeLock(); else if(id!=='log')_releaseWakeLock();
  if(id==='home')renderHome();
  if(id==='log')renderLog();
  if(id==='progress')renderProgress();
  if(id==='nutrition'){renderNutrition();switchNuTab('macros',document.getElementById('ntab-macros'));}
  if(id==='setup'){_resetMenuView();renderSetup();_markAnchorSeen('menu-row-profil');}
  if(id==='cycle')renderCycleScreen();
  if(id==='coach'){const suggs=document.getElementById('coach-suggs');if(suggs&&coachHistory.length>0)suggs.style.display='none';updateCoachHeader();_updateCoachMorphoBtn();try{if(typeof _coachAuBasSiDu==='function')_coachAuBasSiDu();}catch(e){}try{if(typeof _maybeAutoDebrief==='function')_maybeAutoDebrief();}catch(e){}}
  _markScreenSeen(id);
  _updateScreenDots(id);
  // Pill chrono flottante : show hors log, hide sur log
  if(typeof _updPill==='function')_updPill();
  // Retour à l'accueil = le moment neutre où une mise à jour en attente peut s'appliquer.
  if(id==='home'){ try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){} }
}
function goScreen(id,btn){
  _closeAllPanels();
  if(_screenHistory[_screenHistory.length-1]!==id){
    _screenHistory.push(id);
    if(_screenHistory.length>20)_screenHistory.shift();
  }
  _applyScreen(id,btn);
}
function navBack(){
  _closeAllPanels();
  if(_screenHistory.length>1)_screenHistory.pop();
  const prev=_screenHistory[_screenHistory.length-1]||'home';
  _applyScreen(prev,document.getElementById('nb-'+prev));
}

// ─── AIDE CONTEXTUELLE ───────────────────────────────────────
const _HELP_DATA={
  home:{
    title:'🏠 Accueil',
    tips:[
      {i:'📅',t:'Le calendrier de ton mois, qui se lit d\'un coup d\'œil : <b>plus une case est foncée, plus tu as soulevé lourd ce jour-là</b>. Le petit trait sous le chiffre dit ce que tu as travaillé (rouge = haut, bleu = dos, violet = bas, orange = tronc, vert = full body), et l\'étoile ⭐ marque un RECORD. À gauche, le n° de semaine avec ton tonnage — tape-le pour voir la semaine entière. <b>Tape un jour</b> et son détail s\'ouvre dessous : tonnage, séries, exercices, et comment tu te sentais (sommeil, énergie, humeur, douleur) si tu l\'as noté. Le calendrier devient ta mémoire.'},
      {i:'💚',t:'Ta carte récup existe en <b>deux styles</b> — Menu → Apparence → Carte récup : l\'anneau (par défaut) ou le moniteur, avec ton score en gros et un tracé cardiaque. Mêmes données, mise en forme différente.'},
      {i:'📊',t:'Les 4 stats du mois (volume, Big3, séances, poids) se calculent depuis tes séances et ton journal de poids.'},
      {i:'🌡️',t:'« Ton check-in du jour » (en haut de l\'Accueil, optionnel, repliable) se lit d\'un coup d\'œil : <b>trois tuiles</b> — un lit violet pour le <b>sommeil</b>, un éclair orange pour l\'<b>énergie</b>, un visage pour le <b>moral</b> (vert content, ambre moyen, rouge bas). Sous chaque icône, quatre petits traits montrent le niveau. Il regroupe tout ce qui te concerne AUJOURD\'HUI : ton sommeil de la nuit, ton énergie, ton moral (😔 → 😄) et une éventuelle gêne/douleur. Replié, tu vois un résumé (😴 7h · 🙂 énergie · 😄 moral) ; tape pour le déplier et renseigner. Milo adapte ses conseils du jour — s\'il y a une douleur, le Gardien PROTÈGE cette zone en priorité ; si ton moral est bas, Milo se fait plus DOUX (dédramatise, valorise, sans jamais te juger — il reste ton coach sportif, jamais un psy). Ça repart à zéro chaque jour ; le ressenti prime toujours.'},
      {i:'😴',t:'Ton sommeil se note dans « Ton check-in du jour » (déplie la carte, en haut de l\'Accueil) : choisis la qualité + les heures. Oublié un jour ? Change la date (ex. hier) ou tape « ＋ Noter un jour oublié ». Un bon sommeil fait remonter ton score de récupération (contrairement au moral/à la douleur, qui n\'y touchent pas).'},
      {i:'📊',t:'« Historique du sommeil » (déplie le check-in, puis la barre repliable) : un mini-graphique sur 7 ou 30 jours + la liste nuit par nuit. Tape une barre ou une ligne pour ajouter/corriger cette nuit. Les jours vides affichent « ＋ à renseigner ».'},
      {i:'🩹',t:'Pour une zone qui fait mal : dans le check-in, tape directement le MUSCLE sur la figurine anatomique (vue de face + de dos) — il devient rouge. Les articulations (nuque, coude, poignet, genou, cheville) sont en boutons juste en dessous. Pour une zone comme le genou ou l\'épaule tu peux préciser le CÔTÉ (gauche/droite/les deux). Le Gardien protège cette zone du jour en priorité dans les conseils de Milo.'},
      {i:'💡',t:'Ton score de récup (sur NN/100) estime à quel point ton corps est prêt à s\'entraîner aujourd\'hui. Tape « Pourquoi ce score ? » juste en dessous pour voir, en clair, D\'OÙ il vient : sommeil, séance récente, âge, jours enchaînés… chaque facteur avec sa raison et son +/−. Il remonte au fil de la journée après une séance, et reste un simple repère — ton ressenti prime toujours.'},
      {i:'🧠',t:'Milo apprend à te connaître : de temps en temps, il te pose une petite question sur l\'Accueil (« tu t\'entraînes plutôt le matin, non ? »). Tu réponds « Oui, c\'est vrai » ou « Pas vraiment » — rien n\'est retenu sans ton accord. Tout ce qu\'il a retenu est consultable et effaçable dans Menu → « Ce que Milo sait de toi ».'},
      {i:'🌱',t:'Milo complète ton profil tout seul : s\'il manque une info de base (où tu t\'entraînes, combien de séances/semaine, la durée), il te propose de la remplir en 1 tap sur l\'Accueil — de vrais boutons, rien à écrire. Ta réponse va direct dans ton profil et ses conseils deviennent plus justes. Pas envie maintenant ? « Plus tard » et il te le redemandera une autre fois. (Utile surtout si tu as sauté ces questions à l\'inscription.)'},
      {i:'🔎',t:'Milo s\'adapte à ce que tu fais vraiment : il compare ce que tu as déclaré à ce qu\'il MESURE dans tes vraies séances. ① Ta FRÉQUENCE : s\'il repère un changement DURABLE (pas juste une semaine chargée), il te fait une petite vérification (« tu t\'entraînes plutôt 5×/sem maintenant, ça a changé ? »). ② Ton STYLE d\'entraînement : s\'il voit que tu t\'entraînes plutôt en FORCE (séries lourdes, peu de reps) alors que ton objectif est « prise de muscle » — ou l\'inverse — il te propose d\'ajuster ton objectif. Dans les deux cas : « Oui, mets à jour » ou « Non, garde comme ça ». Il ne change JAMAIS rien tout seul — il constate et te laisse décider.'},
      {i:'🚴',t:'Milo tient compte de tes autres sports : de temps en temps il te demande sur l\'Accueil si tu pratiques un autre sport (vélo, course, foot, natation…) — un tap pour répondre (« Aucun » est valable). Un autre sport déclaré augmente automatiquement tes besoins caloriques (+150 kcal/j — sauf si ton niveau d\'activité est déjà « Actif » ou « Très actif », où il est déjà compté dedans). Pour la récupération, l\'app ne sait pas QUAND tu pratiques : c\'est Milo qui en tient compte dans ses conseils.'},
      {i:'🌿',t:'Milo garde ton profil à jour : une info peut vieillir (tu as changé de salle, tes séances sont plus courtes…). De temps en temps il te fait une petite vérification sur l\'Accueil (« toujours en salle basique ? »). « Oui, toujours » ne change RIEN — il note juste que c\'est à jour ; « Non, ça a changé » → tu choisis la nouvelle réponse en 1 tap. Au plus une petite question par semaine, et « Plus tard » est toujours possible : jamais de harcèlement.'},
      {i:'🟢',t:'Milo te connaît de mieux en mieux : ouvre Menu → « Ce que Milo sait de toi ». Tout en haut, une phrase te dit — simplement — à quel point Milo peut te conseiller (de « il apprend à te connaître » à « il connaît très bien ton profil — conseils sur-mesure »). Ce n\'est PAS une note ni un score : ça monte au fil de ce que tu lui apportes (tes séances, tes réponses à ses questions, ce que tu lui confies) et ça ne redescend JAMAIS, même si tu effaces une info. Juste en dessous, « 🧠 Milo a appris récemment » liste les dernières choses qu\'il a retenues sur toi (la plus récente en haut). Et tout en bas, la liste complète — tu peux en effacer. 🔒 Privé.'},
      {i:'🏆',t:'Les PRs se mettent à jour automatiquement. Le Big 3 (Squat + DC + SDT) est ton indicateur de force globale.'},
      {i:'🔄',t:'Le cycle de force (Accumulation → Intensification → Peak → Décharge) se configure dans Profil → Cycle de force.'},
      {i:'🏅',t:'Tes badges débloqués récemment apparaissent ici. Consulte l\'onglet Badges dans Progrès pour tout voir.'},
    ],
    female:[
      {i:'🌙',t:'La carte de ton cycle menstruel s\'affiche ici — remplis la date de tes règles dans Profil pour l\'activer.'},
      {i:'💡',t:'Tes performances varient naturellement selon ta phase. C\'est normal, pas un signe de régression.'},
    ]
  },
  setup:{
    title:'👤 Profil',
    tips:[
      {i:'📷',t:'<b>Bilan corporel</b> (Profil → Composition) : la photo de ton rapport de balance est lue <b>sur ton téléphone</b>, gratuitement et sans réseau. L\'app <b>vérifie son propre travail</b> — les lignes du rapport se recoupent — et si le compte n\'y est pas, elle préfère ne rien te proposer plutôt que de te donner un chiffre faux. Vérifie toujours avant d\'enregistrer.'},
      {i:'📂',t:'Le Profil est organisé en sections repliables (Identité · Objectif · Discipline · Composition · Morphologie · Santé · Cycle · Accessibilité) : tape un titre pour l\'ouvrir. Le bouton "Enregistrer" confirme par une notification verte.'},
      {i:'⚖️',t:'Poids, taille et âge sont indispensables pour calculer ton TDEE (besoins caloriques) dans Nutrition.'},
      {i:'🎯',t:'L\'objectif principal (muscle, perte de poids, force, rééquilibrage...) adapte tes macros et les conseils du Coach IA. Tu peux aussi ajouter une « priorité complémentaire » (2e objectif) : elle affine les conseils de Milo et ton entraînement, mais la NUTRITION suit toujours l\'objectif principal (elle ne peut viser qu\'une seule direction de calories). Pour « perdre du gras ET prendre du muscle », prends l\'objectif « Perte de gras + muscle ».'},
      {i:'💪',t:'Muscles prioritaires : dans Profil → Objectif, choisis jusqu\'à 2 muscles que tu veux développer EN PRIORITÉ (ex. pectoraux + épaules). Comme un vrai coach, Milo leur donnera plus de fréquence, de volume et de variantes dans ses conseils et les programmes qu\'il génère, en maintenant le reste. Ça ne touche pas ta nutrition — c\'est juste pour cibler où tu veux progresser.'},
      {i:'🎽',t:'Discipline : choisis ta pratique (musculation, bodybuilding, powerbuilding, force athlétique, haltérophilie) — le Coach IA adapte ses conseils à ta discipline.'},
      {i:'🥉',t:'Ton niveau (Débutant/Intermédiaire/Confirmé, dans la section Discipline) : le Coach s\'adapte, et il évolue tout seul avec tes séances et tes records — l\'app te félicite quand tu passes au niveau supérieur.'},
      {i:'🧬',t:'« Mon ADN sportif » (optionnel) : ce qui te caractérise DURABLEMENT dans ta pratique — ta motivation, ton mode de vie (temps/lieu/matériel), tes préférences (exos aimés/détestés, style), ton expérience. Milo s\'en sert pour des conseils vraiment personnels et réalistes. (Tes zones fragiles/blessures, elles, vont dans la section Santé.) 🔒 Privé.'},
      {i:'🏃',t:'Niveau d\'activité : sois honnête — le sous-estimer te fera manger trop peu, le surestimer trop.'},
      {i:'📏',t:'Tour de cou + taille (+ hanches) → composition corporelle automatique (% graisse, masse maigre, méthode US Navy).'},
      {i:'🧬',t:'Remplis ta morphologie (H/A/V/X/O) et ton morphotype (ecto/méso/endo) pour des conseils Coach IA vraiment personnalisés. Bouton 📸 pour analyse IA sur 3 photos.'},
      {i:'🩺',t:'Section Santé (optionnelle) : coche tes conditions médicales et blessures — le Coach IA les prend en compte pour éviter les mouvements à risque. 🔒 Privé : visible seulement par toi (ton téléphone + ta sauvegarde perso).'},
      {i:'🎂',t:'Renseigne ta date d\'anniversaire (JJ/MM) pour débloquer le badge spécial si tu t\'entraînes le jour J.'},
    ],
    female:[
      {i:'🌸',t:'La date de tes premières règles permet à l\'app d\'adapter tes macros et conseils selon ta phase de cycle.'},
      {i:'💊',t:'Si tu prends une contraception hormonale, coche-le — le suivi de phase est désactivé car les fluctuations naturelles sont masquées.'},
      {i:'📐',t:'Les hanches (en plus du cou et de la taille) sont indispensables au calcul du % de graisse pour les femmes (méthode US Navy). Chez l\'homme, cou + taille suffisent.'},
      {i:'🌷',t:'Endométriose : tu peux la cocher dans la section Santé — le Coach en tient compte (elle peut freiner la perte de poids et jouer sur la fatigue et l\'inflammation).'},
      {i:'🧬',t:'La morphologie féminine (Poire/Sablier/Rectangle/Triangle inv./Ronde) affine les recommandations d\'exercices et de nutrition du Coach IA.'},
    ]
  },
  nutrition:{
    title:'🍽️ Nutrition',
    tips:[
      /* 🍽️ ORDRE DE L'ONGLET MACROS (ft-v1025) — en PREMIER dans l'aide, parce que c'est la
         première question qu'on se pose en arrivant : « où est passé mon TDEE ? ». R25 : la
         pop-up ANNONCE (une fois), l'aide EXPLIQUE (à chaque fois qu'on la rouvre). */
      {i:'🍽️',t:'<b>L\'onglet Macros se lit de haut en bas, du jour vers le durable.</b> En haut, <b>ta journée</b> : ce que tu as mangé en gros, ta cible en petit, trois anneaux (protéines · glucides · lipides) et « ce qu\'il te reste, en vrai » — traduit en <b>tes</b> aliments, pas en grammes abstraits. Puis le bouton pour noter, ta séance du jour, ce que l\'app a appris de ton alimentation, ta semaine. <b>Tout en bas, deux lignes repliées</b> : « Comment c\'est calculé » (BMR, TDEE, répartition en %, charge/décharge, ajuster à la main) et « Mes réglages alimentaires » (mode cétogène/low carb/paléo/méditerranéen, jeûne, régime, restrictions, allergies). ⚠️ <b>Rien n\'a été retiré</b> : ces réglages se touchent deux ou trois fois par an, ils ne sont plus au milieu de ce que tu regardes tous les jours. Le titre de chaque ligne repliée te dit déjà l\'essentiel (ton objectif et ton TDEE, ton régime en cours) — tu n\'as à l\'ouvrir que pour changer quelque chose.'},
      {i:'🍱',t:'Le <b>plan de repas</b> est replié par défaut, et c\'est volontaire : c\'est une liste écrite à l\'avance, <b>la même pour tout le monde</b>, qui ne connaît ni ce que tu manges ni ce que tu détestes. Il te donne un ordre de grandeur, pas un menu à suivre. Le jour où il saura se baser sur tes vrais aliments, il se dépliera tout seul. En attendant, « ce qu\'il te reste, en vrai » (en haut) est bien plus proche de toi : il ne propose que des aliments que <b>tu as déjà notés</b>.'},
      /* ⛔ POURQUOI CETTE ENTREE EXISTE (ft-v1029) : le bloc CHANGE de comportement a 20 h, et un
         changement qu'on n'explique pas se lit comme un bug — on croit que l'app s'est trompee, ou
         qu'elle a « oublie » une macro. La phrase du bloc le dit sur le moment ; celle-ci le dit
         quand on vient chercher pourquoi (R25 : le bloc annonce, l'aide explique). */
      {i:'🌙',t:'<b>Le soir, « ce qu\'il te reste » devient plus léger — c\'est voulu.</b> À partir de <b>20 h</b>, l\'app ne propose plus de combinaisons (« 250 g de riz + 160 g de flocons ») mais <b>une seule idée, en petite quantité</b> : à cette heure-là, une assiette d\'un demi-kilo n\'est pas un conseil. ⚠️ Et si une macro est <b>trop loin du compte</b> pour qu\'une idée légère y change quelque chose, la ligne <b>disparaît</b> au lieu d\'afficher le manque : ce qui manque le soir ne se rattrape pas le soir, et te le mettre sous les yeux ne t\'aiderait pas. Tes chiffres, eux, ne bougent pas — ils restent dans les anneaux juste au-dessus.'},
      {i:'⚠️',t:'Les macros s\'affichent correctement uniquement si le Profil est complet (âge, poids, taille, activité, objectif).'},
      {i:'🔥',t:'<b>D\'où vient ton BMR</b> (métabolisme de base, ce que ton corps brûle au repos) : si tu as renseigné un <b>bilan corporel</b> ou ton <b>% de masse grasse</b>, l\'app le calcule sur ta <b>masse maigre</b> (formule de Katch-McArdle) au lieu de ton seul poids — chez quelqu\'un de musclé ça change souvent de <b>100 à 200 kcal par jour</b>, parce que le muscle consomme au repos et le gras beaucoup moins. Sinon, elle utilise la formule générique (Mifflin-St Jeor). <b>La ligne sous le chiffre dit toujours laquelle</b> : tape-la, le calcul est posé avec tes nombres. ⚠️ Un bilan de plus de 3 mois, ou un poids qui a bougé de plus de 5 % depuis, n\'est pas utilisé : on ne sait pas si les kilos sont du muscle ou du gras. Le métabolisme affiché par ta balance, lui, est enregistré mais pas utilisé dans le calcul — chaque marque a sa formule secrète, invérifiable.'},
      {i:'📈',t:'Phase Charge = surplus calorique pour prendre du muscle. Phase Décharge = déficit pour perdre du gras. Alterne selon tes cycles.'},
      {i:'💊',t:'Suppléments : créatine (phases charge/entretien) et whey dosés selon ton poids. Combinaisons Premium : 4 stacks complets (muscle, force, cardio, perte de poids).'},
      {i:'🔥',t:'Les calories brûlées au cardio (bloc cardio dans ta séance) s\'ajoutent à ton TDEE estimé du jour.'},
      {i:'🍽️',t:'Le plan de repas détaillé (5 repas) est généré depuis tes macros — adapté à ta phase et ton objectif.'},
      {i:'📓',t:'Onglet Journal : note ce que tu manges dans la journée et compare aux objectifs. 3 façons d\'ajouter un aliment : saisie à la main (gratuit, illimité), 🤖 estimation IA (décris ton repas, l\'IA remplit les calories — 25 gratuites, illimité en Premium), ou par code-barres (produit reconnu via une base mondiale, ajuste la quantité en grammes).'},
      {i:'📷',t:'Code-barres : tape les chiffres écrits sous le code (gratuit) OU appuie sur « 📷 Photographier le code-barres » et prends-le en photo — l\'IA lit le numéro pour toi (utile si les chiffres sont petits/abîmés). La lecture photo utilise 1 essai IA ; ensuite la recherche du produit et le score santé restent gratuits.'},
      {i:'🥗',t:'Score santé : au code-barres d\'un produit, tu vois son Nutri-Score (A à E) et son niveau de transformation (brut ou ultra-transformé). Gratuit pour tout le monde, sans crédit IA. Pratique pour repérer d\'un coup d\'œil ce qui est sain.'},
      {i:'📥',t:'Tu as un plan de ta diététicienne ? Bouton « Importer un plan » (Plan de repas IA) : prends-le en photo ou importe le PDF, l\'IA range les repas.'},
      {i:'🎯',t:'Calories trop hautes ou trop basses pour toi ? Sous l\'anneau, bouton « ✎ Ajuster mes calories » : tape ton chiffre à la main. Les protéines et lipides restent calés sur ton profil, les glucides s\'ajustent → équilibre garanti. « Revenir en automatique » à tout moment.'},
      {i:'💪',t:'Objectif « Perte de gras + muscle » (Profil → Objectif) = recomposition : léger déficit + protéines élevées → perdre du gras sans perdre de muscle (muscles toniques, pas « skinny fat »).'},
    ],
    female:[
      {i:'🌙',t:'Tes macros s\'adaptent automatiquement : plus de glucides en folliculaire (énergie haute), légère hausse en lutéale.'},
      {i:'🔥',t:'En phase lutéale, ton métabolisme est naturellement plus élevé (+100 à 200 kcal/j). L\'app en tient compte.'},
      {i:'💧',t:'Envies de sucre et rétention d\'eau en fin de cycle sont normales. Adapte tes portions sans culpabilité.'},
    ]
  },
  progress:{
    title:'📈 Progrès',
    tips:[
      {i:'💪',t:'Le graphique affiche ton 1RM estimé (Brzycki) par exercice — sans avoir besoin de tester à l\'échec. Les boutons 3 mois / 6 mois / 1 an / Tout choisissent la période. Et tape un point de la courbe : tu vois la date + la charge, puis « Voir cette séance » t\'ouvre directement le détail de ce jour-là.'},
      {i:'🎯',t:'« Objectif de force » (sous le graphe d\'un exercice) : fixe le 1RM que tu vises (ex. Squat → 130 kg). Une barre de progression te montre où tu en es (« 87 % · encore 17 kg ») et une ligne verte repère apparaît sur ton graphe. C\'est TON objectif, tu le changes ou le retires quand tu veux (laisse vide + ✓).'},
      {i:'⚖️',t:'Log ton poids régulièrement (idéalement le matin à jeun) pour une courbe fiable. Tap sur une entrée pour la corriger — et dans la fenêtre de pesée, les flèches ‹ › (ou un glissement gauche/droite) passent d\'une pesée à l\'autre sans rouvrir le graphique.'},
      {i:'🏅',t:'18 badges en 4 catégories : évolution, performance, streak, spécial. Vérifie l\'onglet Badges pour les débloquer.'},
      {i:'📋',t:'Tap sur une séance passée dans l\'historique pour voir et modifier les kg/reps de chaque série. Sur chaque exercice de cette séance, l\'icône 📊 t\'ouvre sa progression (ton poids sur les dernières séances). Sur chaque carte, le MUSCLE travaillé (ou le nom de la séance) est en gros titre.'},
      {i:'🔎',t:'Filtre ton historique : sous « Historique séances », tape un groupe musculaire (« Pectoraux », « Quadriceps »…) pour ne voir que ces séances-là. Tape « Tous » pour tout réafficher.'},
      {i:'📉',t:'Un plateau sur plusieurs semaines est normal — le progrès n\'est jamais linéaire. Varie les charges et les volumes.'},
      {i:'🧪',t:'Bilan corporel (balance pro) : sous ta courbe de poids, section « Bilan corporel ». Tu passes sur une balance à impédance ? Enregistre tes chiffres (graisse viscérale, muscle, métabolisme, détail par segment…) par 📷 photo, ✏️ à la main ou 📋 code. Le bilan sert aussi de pesée du jour (poids + masse grasse), tu suis l\'évolution, et Milo s\'en sert.'},
    ],
    female:[
      {i:'⚖️',t:'Variations de poids ±1 à 3 kg en cours de cycle = rétention d\'eau, pas de la graisse. Compare la même phase entre cycles.'},
      {i:'📊',t:'Pour comparer tes performances objectivement, rapproche les séances de la même phase de cycle entre elles.'},
    ]
  },
  log:{
    title:'⚡ Séance',
    tips:[
      {i:'💪',t:'<b>RIR — répétitions en réserve</b> : après une série de travail, la barre de repos demande « il t\'en restait combien ? ». Un tap, c\'est tout, et c\'est facultatif. <b>échec</b> = 0 en réserve — c\'est la même chose que le tag <b>X</b>. Tu le relis la fois d\'après dans « précédent » (<i>8×80·2r</i>), et Milo s\'en sert pour vérifier le cadre de ta discipline. Une série non notée n\'est <b>pas</b> comptée comme un échec.'},
      {i:'📍',t:'<b>Charge sans repère</b> : si Milo propose un poids sur un exercice que tu n\'as <b>jamais noté dans l\'app</b>, un 📍 le signale sous l\'exercice. C\'est un <b>point de départ</b>, pas une mesure — il n\'a rien dans ton historique sur lequel se caler — <b>même si tu le pratiques depuis des années ailleurs</b>. Dès ta première série notée, le message disparaît et le contrôle d\'intensité (⚡) prend le relais.'},
      {i:'🔤',t:'Tags de série : É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Appuie sur la pastille pour changer, le nom complet s\'affiche en toast.'},
      {i:'⏱️',t:'Timer adaptatif : É = 45s · N = 2:10 · X = 4min. Boutons −15s/+15s et presets 1:00/1:30/2:00. <b>C\'est un MAXIMUM, pas un temps à attendre</b> : tu peux repartir avant, c\'est permis. Le chrono ne s\'arrête plus à zéro — il continue en +0:12, +0:45… avec « au-delà de ton repos max ». Ce n\'est pas un reproche, c\'est une information ; au-delà de 15 min il s\'arrête seul.'},
      {i:'⚡',t:'Super-séries : bouton "⚡ Grouper" dès 2 exercices → sélectionne-les → "Lier en supersérie". Enchaînement automatique sans repos. Boutons 📉 Drop / 📈 +10% / 📉 −10% pour pyramides et drop sets.'},
      {i:'🔁',t:'« maxi » : dans l\'éditeur de programme, touche le bouton « max » à côté des reps d\'une série pour viser le maximum de répétitions (au lieu d\'un chiffre exact). En séance, la case affiche « max » et tu notes ce que tu as vraiment fait.'},
      {i:'✋',t:'Superset au doigt : sur un exercice pas encore en superset, attrape la petite poignée (6 points, à côté du ⋯) et glisse-le sur un autre exercice → le superset se crée tout seul. Plus rapide que le bouton "⚡ Grouper". Pour défaire : "↩ Retirer". Marche aussi dans l\'éditeur de programme (✏️) : glisse une carte exercice sur une autre.'},
      {i:'🔀',t:'Exercices « un côté à la fois » : 48 exercices portent une pastille <b>🔀 par bras</b> ou <b>par jambe</b> (rowing haltère, curl haltères, fentes, squat bulgare…). <b>Tu notes le poids qui BOUGE</b> : un seul haltère monte → note son poids à lui (28), pas le double ; les deux bougent → note le total. Tu saisis toujours <b>3 séries, pas 6</b> — l\'app sait qu\'elles se refont de l\'autre côté et double ton tonnage. Ton record reste calculé sur la charge d\'un côté. Tape la pastille pour le détail.'},
      {i:'📊',t:'Bouton 📊 sur chaque exercice → graphique du poids max sur les 5 dernières séances.'},
      {i:'🏋️',t:'Le 1RM (Brzycki) s\'affiche en temps réel sous le type — utilise-le pour calibrer tes charges. Appuie sur ℹ️ pour l\'aide sur les types.'},
      {i:'📸',t:'Bouton 📸 pour importer un programme depuis une photo, un fichier Word ou Excel — l\'IA le convertit en séance automatiquement.'},
      {i:'⭐',t:'Recherche d\'exercices : quand tu cherches un exercice à ajouter, tes FAVORIS (ceux que tu utilises le plus souvent) remontent automatiquement en haut de la liste, avec une petite ★. Plus besoin de scroller pour retrouver tes mouvements habituels.'},
      {i:'🌱',t:'Débutant ? Dans 📋 Mes Programmes, bouton vert « Créer mon parcours débutant » : 2 questions (2 ou 3 séances/sem, style Full Body ou Split) et hop, un programme sur mesure sur machines (sécurité), adapté à ton profil. Étape 1 gratuite sur 3 semaines. +2,5 kg le haut du corps, +5 kg les jambes quand tes séries passent. Les mouvements techniques (squat, couché, soulevé) se débloquent ensuite. Pense au cardio léger en fin de séance.'},
      {i:'📄',t:'Exporter en PDF : dans 📋 Mes Programmes, le bouton 📄 PDF génère un vrai fichier PDF du programme (exercices, séries × reps, colonne « Poids » vide à remplir à la salle). Sur iPhone, le menu Partager s\'ouvre (Enregistrer dans Fichiers, envoyer par message…) ; sur ordi ça se télécharge. Marche même hors-ligne.'},
      {i:'⏸️',t:'Bouton "Pause" en haut : fige le chrono de durée si tu dois t\'interrompre (appel, pause…). Le temps en pause n\'est pas compté dans la durée de la séance. Appuie sur "Reprendre" pour relancer.'},
      {i:'🗑️',t:'Bouton "Vider" : retire tous les exercices d\'un coup si tu as chargé le mauvais programme. La séance reste ouverte et ton historique n\'est pas touché. (Le "✕" à côté annule complètement la séance.)'},
      {i:'📷',t:'Photo sur n\'importe quel exercice : tape le ⋯ sur un exercice (perso OU de la bibliothèque) → "Ajouter/Changer la photo". Pratique pour coller la photo de TA machine sur un exercice existant. Dans la liste de choix, tape la petite photo à gauche pour la voir en grand (ça n\'ajoute pas l\'exercice). Ta photo reste privée à ton compte.'},
      {i:'✏️',t:'Modifier un exercice perso : tape le ⋯ sur l\'exercice → "Modifier l\'exercice" (ou le ✎ dans la liste). Tu peux changer le nom, le groupe et les muscles — sans perdre ton historique ni tes records. Ne marche que sur TES exercices perso (les autres restent intacts).'},
      {i:'⚖️',t:'<b>Quel poids noter ?</b> Pour une <b>barre</b>, note la charge <b>totale</b>, barre comprise (barre de 20 kg + 60 kg de disques = <b>80</b>). Pour une <b>machine</b> (presse, poulie…), note simplement <b>ce que tu charges</b> : le poids du chariot varie d\'une machine à l\'autre et ne se compte pas. L\'important est de faire <b>toujours pareil</b> — c\'est ce qui rend tes progrès comparables dans le temps.'},
      {i:'⏱️',t:'<b>Ton repos est retenu par exercice.</b> Quand tu règles le chronomètre pendant une séance (les boutons −/+ ou en tapant la durée), l\'app <b>garde ta valeur pour CET exercice</b> et la réapplique les fois suivantes. Tu peux donc avoir 4 min sur le squat et 60 s sur les élévations, sans y penser. <b>Milo aussi le sait</b> : il reprend tes réglages dans les séances qu\'il te propose, et il en tient compte pour te dire si ta séance rentre dans ton temps.'},
      {i:'⚡',t:'<b>Les supersets de Milo.</b> Si tu demandes une séance à Milo et qu\'elle ne rentre pas dans ton temps, il peut <b>grouper deux accessoires</b> (curl + triceps, élévations + face pull) : ils arrivent liés dans ta séance, tu les enchaînes sans repos entre les deux et tu ne te reposes qu\'à la fin du bloc. Ça te rend ~1 minute par série groupée. ⚠️ <b>Jamais sur le squat, le soulevé ou les développés</b> — l\'app refuse : sur une barre lourde, la fatigue du premier exercice te fait perdre des kilos et de la technique. Le superset fait gagner du <b>temps</b>, pas du muscle.'},
      {i:'🏃',t:'Le <b>cardio</b> se note en deux temps : 🔥 <b>avant</b> la séance (l\'échauffement) et 🧊 <b>après</b> (le cardio de fin). Tu peux remplir l\'un, l\'autre, ou les deux — leurs calories s\'additionnent, et le résumé te dit lequel est lequel. Un échauffement seul suffit à enregistrer une séance. Tu peux aussi les corriger après coup depuis le détail d\'une séance passée.'},
      {i:'🔥',t:'<b>Comment les calories de la séance sont comptées.</b> Sans rien noter, l\'app ajoute une <b>estimation</b> de 10 min d\'échauffement et de retour au calme — parce que tout le monde en fait un peu, même sans le chronométrer. Dès que tu <b>notes un cardio</b> pour un de ces deux moments, c\'est ta <b>mesure</b> qui compte et l\'estimation de ce moment-là s\'efface : tes minutes ne sont jamais facturées deux fois. Tu notes les deux ? Il ne reste plus aucune estimation. ⚠️ Le reste du calcul (la partie musculation) est encore approximatif, et on y travaille — il vaut mieux le savoir que de croire à un chiffre à la calorie près.'},
      {i:'🎨',t:'La liste des exercices est <b>rangée par matériel</b> : 🏋️ Barre · 💪 Poids libre · ⚙️ Guidé (machines et poulies) · 🤸 Poids du corps · 🎗️ Élastique · 🪢 TRX / Sangles · 🏃 Cardio · 🔀 Polyvalent (ceux qui se font de plusieurs façons, comme les fentes). Tu t\'entraînes <b>à la maison</b> ? Cherche « élastique » ou « TRX » et tout sort d\'un coup. Le rangement se lit dans le nom de l\'exercice — c\'est pour ça que le matériel y est écrit.'},
      {i:'🇫🇷',t:'<b>Les deux noms.</b> Une salle parle moitié français moitié anglais — on dit « rowing » mais « développé couché », « curl » mais « élévations latérales ». Les exercices les plus répandus portent donc <b>les deux</b> : le nom courant, puis l\'autre langue entre parenthèses — « Rowing Barre <b>(Tirage Horizontal)</b> », « Tirage Poulie Haute <b>(Lat Pulldown)</b> », « Pompes <b>(Push-up)</b> ». Tu cherches dans la langue que tu veux, tu tombes dessus. Si un exercice que tu utilises a été renommé, <b>tes records et tes séances passées suivent tout seuls</b> — tu ne perds rien.'},
      {i:'🔍',t:'Tu peux chercher un exercice par son <b>nom</b> (« rowing »), par son nom <b>anglais</b> (« bench press »), par <b>matériel</b> (« élastique », « TRX »)… et aussi par <b>famille de mouvement</b> : tape « <b>tirage horizontal</b> » et tu obtiens tous les rowings, « <b>poussée verticale</b> » tous les développés épaules, « <b>charnière de hanche</b> » les soulevés de terre et hip thrusts. Pratique quand tu sais quel MOUVEMENT tu veux faire sans avoir un exercice précis en tête. Les familles : squat · fente · charnière de hanche · poussée horizontale · poussée verticale · tirage horizontal · tirage vertical · gainage.'},
      {i:'💬',t:'Modifier un programme enregistré : dans 📋 Mes Programmes, le bouton ✏️ ouvre l\'éditeur — reps, TEMPS DE REPOS (colonne « Repos », série par série) et le champ 💬 Commentaire de chaque exercice (consigne, réglage machine, prise…). Le commentaire s\'affiche sous l\'exercice à chaque séance. En séance, le champ 💬 sous un exercice reste une note du JOUR (elle part dans l\'historique, pas dans le programme).'},
    ],
    female:[]
  },
  coach:{
    title:'🤖 Coach IA',
    tips:[
      {i:'📄',t:'<b>Exporter une réponse en PDF</b> : le bouton sous chaque réponse de Milo. Si tu avais reçu « Conseil de Milo » au lieu de ton document, c\'est réparé — c\'était le titre de la feuille de partage, pas ton PDF (qui était complet et l\'est toujours). Ça valait aussi pour le PDF de programme et l\'étude du corps.'},
      {i:'💬',t:'Ton profil complet (poids, objectif, discipline, PRs, morphologie) est injecté automatiquement — pas besoin de te présenter à chaque fois.'},
      {i:'🎯',t:'Milo raisonne comme un vrai coach : il t\'évalue avant de conseiller (il peut te poser des questions), croise tes données (records, morpho, bilan corporel), justifie ses choix, s\'adapte à ta vie (horaires, travail de nuit, temps dispo) et te dit la vérité sans complaisance. Demande-lui « fais-moi un programme » ou « pourquoi je stagne au couché ? ».'},
      {i:'🗣️',t:'Milo t\'AIDE d\'abord, il ne t\'interroge pas : dès ton 1er message il te propose un vrai point de départ concret (structure + exercices), adapté à toi ET à tes zones fragiles (il te montre comment il les protège) — puis, au plus, UNE question pour affiner. Quand une question a quelques réponses simples, des BOUTONS de réponse rapide apparaissent (tu peux toujours écrire, ou ne pas répondre). Répondre à une question de Milo ne coûte jamais de question gratuite.'},
      {i:'⚡',t:'Milo peut DÉMARRER ta séance : dis-lui ta séance du jour (« Développé Couché 4×8, Rowing 4×10… ») ou demande-lui une séance à faire maintenant → un bouton « ⚡ Commencer cette séance » apparaît sous sa réponse et l\'ouvre direct dans l\'onglet Séance (poids pré-remplis avec ta dernière fois).'},
      {i:'🧠',t:'Milo RETIENT ce que tu lui confies : dis-lui un truc durable sur toi (« je m\'entraîne le matin », « j\'ai que des haltères », « une vieille tendinite à l\'épaule »…) → une ligne « 🧠 Je retiens : … ? [Oui, retiens] [Non] » apparaît sous sa réponse. Tu valides → il s\'en souvient pour de bon (rien sans ton accord). Retrouve/efface tout dans Menu → « Ce que Milo sait de toi ».'},
      {i:'🏋️',t:'Pendant une séance, le Coach la voit EN DIRECT : demande-lui un exercice équivalent si une machine est prise, un ajustement de charge, ou l\'ordre des exercices.'},
      {i:'🛡️',t:'Milo veille sur ta sécurité : il tient compte EN PRIORITÉ de ta santé et de tes zones fragiles (Profil → Santé — blessures, arthrose, hernie…). Sa règle = ADAPTER, pas t\'interdire : il réduit la charge/l\'amplitude ou change d\'exercice plutôt que de te dire « ne fais pas ». Devant une douleur forte, il conseille le repos et un pro (jamais de diagnostic).'},
      {i:'🧠',t:'Milo se souvient de l\'essentiel de vos échanges — même en gratuit (c\'est un acquis). Si tu passes Premium un jour, il ne repart pas de zéro.'},
      {i:'💾',t:'Tes discussions sont gardées : le bouton « + » ne les efface plus, il les range dans « Mes discussions » (icône horloge, en haut du Coach). Tape-la pour rouvrir une ancienne discussion, ✕ pour la supprimer.'},
      {i:'🧪',t:'Milo connaît ton Bilan corporel (balance pro) si tu l\'as rempli : il te conseille avec tes vrais chiffres (graisse viscérale, muscle, métabolisme) — sans jamais en inventer ni poser de diagnostic.'},
      {i:'📸',t:'Bouton 📷 pour envoyer une photo (analyse corpo ou morphologie). Bouton 📸 "Analyser ma morphologie" pour l\'analyse 3 angles (Premium).'},
      {i:'📋',t:'Analyse de programme IA (bouton 🤖 dans Programmes) : le Coach évalue ton programme et propose des améliorations.'},
      {i:'🔗',t:'Bouton "Partager" sous chaque réponse : envoie-la (SMS, Notes, WhatsApp…) ou copie-la en un tap. Pratique pour garder un conseil ou l\'envoyer à un pote.'},
      {i:'🔓',t:'10 questions gratuites, puis Premium illimité (6,99 €/mois via Ko-fi — essai 3 jours à 1,99 €).'},
    ],
    female:[
      {i:'🌸',t:'Mentionne ta phase de cycle ("je suis en phase lutéale") pour des conseils nutrition et entraînement adaptés à ton moment.'},
      {i:'🧬',t:'L\'analyse de morphologie 3 photos (Premium) te donne un profil silhouette détaillé avec axes de progression spécifiques.'},
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// « D'OÙ VIENT CE CHIFFRE ? » — l'explication du métabolisme de base (11/08/2026)
// ═══════════════════════════════════════════════════════════════════════════════════
// Elle POSE LE CALCUL avec ses vrais nombres à elle, et nomme les deux formules. C'est
// le standard que Michel a fixé la nuit du 11/08 sur les calories : « il faut des données
// sérieuses et scientifiquement prouvé ET prouvable ». Une explication qu'on ne peut pas
// refaire sur un coin de table demande de faire confiance ; elle ne prouve rien.
function openBmrHelp(){
  const el=document.getElementById('bmr-help-body'); if(!el)return;
  const bd=(typeof bmrDetail==='function')?bmrDetail():null;
  const box=(bg,bd2,h)=>`<div style="background:${bg};border:1px solid ${bd2};border-radius:10px;padding:11px 13px;margin-bottom:12px;font-size:13px;color:var(--t2);line-height:1.55">${h}</div>`;
  // Midi forcé : une date lue à minuit bascule d'un jour selon le fuseau (famille de bugs
  // « fuseaux horaires » de BUGS.md — la sonde `tests/dates` la surveille).
  const jolieDate=iso=>{try{return new Date(iso+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'});}catch(e){return iso;}};
  let h='';
  if(!bd||!bd.kcal){
    h=box('var(--bg3)','var(--sep)','Renseigne ton poids, ta taille et ton âge dans le Profil — sans eux, aucun calcul honnête n\'est possible. L\'app préfère ne rien afficher plutôt qu\'inventer un chiffre.');
  }else if(bd.methode==='katch'){
    h=box('rgba(0,230,118,.07)','rgba(0,230,118,.28)',
      `<b style="color:var(--t1)">✅ Calculé sur TA masse maigre</b><br>`
      +`Formule de <b>Katch-McArdle</b> — publiée, et tu peux la refaire :<br>`
      +`<span style="font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--t1)">370 + 21,6 × ${String(bd.lm.lm).replace('.',',')} kg = ${bd.kcal.toLocaleString('fr-FR')} kcal</span><br>`
      +`<span style="font-size:12px">Ta masse maigre vient de ton ${bd.lm.src} du ${jolieDate(bd.lm.date)}${bd.jours!=null?' (il y a '+bd.jours+' j)':''}.</span>`)
    + box('var(--bg3)','var(--sep)',
      `<b style="color:var(--t1)">Pourquoi pas la formule habituelle ?</b><br>`
      +`Mifflin-St Jeor ne connaît que ton <b>poids total</b> : elle traite 84 kg de muscle comme 84 kg de gras. Sur toi elle donnerait <b>${(bd.mifflin||0).toLocaleString('fr-FR')} kcal</b>, soit <b>${(bd.kcal-(bd.mifflin||0)>0?'+':'')}${(bd.kcal-(bd.mifflin||0)).toLocaleString('fr-FR')} kcal par jour</b> d'écart. Le muscle consomme au repos, le gras beaucoup moins — c'est tout l'intérêt de connaître ta composition.`);
  }else{
    h=box('rgba(255,214,0,.07)','rgba(255,214,0,.28)',
      `<b style="color:var(--t1)">Calculé sur ton poids, ta taille et ton âge</b><br>`
      +`Formule de <b>Mifflin-St Jeor</b> : <span style="font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--t1)">${bd.kcal.toLocaleString('fr-FR')} kcal</span>`
      +(bd.raison?`<br><span style="font-size:12px">Raison : ${bd.raison}.</span>`:''))
    + box('var(--bg3)','var(--sep)',
      `<b style="color:var(--t1)">Comment le rendre plus juste</b><br>`
      +`Note ta <b>masse maigre</b> (ou ton % de masse grasse) dans Progrès → Poids → « Bilan corporel ». L\'app passera alors sur <b>Katch-McArdle</b>, qui tient compte de ton muscle — chez quelqu\'un de musclé, ça change souvent de <b>100 à 200 kcal par jour</b>.<br>`
      +`<span style="font-size:12px">⚠️ Un bilan de plus de 3 mois, ou un poids qui a bougé de plus de 5 % depuis, n\'est plus utilisé : on ne sait pas si les kilos sont du muscle ou du gras, et deviner ici fausserait tout le reste.</span>`);
  }
  h+=box('var(--bg3)','var(--sep)',
    `<b style="color:var(--t1)">⚖️ Et le chiffre affiché par ta balance ?</b><br>`
    +`Il est enregistré et Milo le voit, mais il n\'entre pas dans ce calcul : chaque marque a sa formule secrète, invérifiable. On préfère une formule publiée, appliquée à <b>ta</b> mesure.`);
  el.innerHTML=h;
  document.getElementById('ov-bmr-help').classList.add('open');
}
function closeBmrHelp(){document.getElementById('ov-bmr-help').classList.remove('open');}

function showHelp(){
  const screen=window._curScreen==='cycle'?'home':(window._curScreen||'home');
  const data=_HELP_DATA[screen];
  if(!data)return;
  const isFemale=S&&S.gender==='F';
  document.getElementById('help-title').textContent=data.title;
  let html='';
  if(isFemale&&data.female&&data.female.length){
    html+=`<div class="help-female-block">
      <div class="help-female-hdr">♀ Spécial femmes</div>
      ${data.female.map(t=>`<div class="help-item"><span class="help-item-icon">${t.i}</span><span class="help-item-text">${t.t}</span></div>`).join('')}
    </div>`;
  }
  html+=`<div>${data.tips.map(t=>`<div class="help-item"><span class="help-item-icon">${t.i}</span><span class="help-item-text">${t.t}</span></div>`).join('')}</div>`;
  document.getElementById('help-content').innerHTML=html;
  document.getElementById('ov-help').classList.add('open');
}
function closeHelp(){document.getElementById('ov-help').classList.remove('open');}

// ─── SWIPE ENTRE ONGLETS ─────────────────────────────────────
const _SWIPE_ORDER=['home','progress','log','nutrition','coach'];

function _hScrollParent(el){
  while(el&&el!==document.body){
    if(el.scrollWidth>el.clientWidth+4){
      const ox=getComputedStyle(el).overflowX;
      if(ox==='auto'||ox==='scroll')return true;
    }
    el=el.parentElement;
  }
  return false;
}

function _initSwipe(){
  let _sx=null,_sy=null,_sel=null;
  const root=document.getElementById('root');
  if(!root)return;
  root.addEventListener('touchstart',e=>{
    const t=e.touches[0];_sx=t.clientX;_sy=t.clientY;_sel=e.target;
  },{passive:true});
  root.addEventListener('touchend',e=>{
    if(_sx===null)return;
    const dx=e.changedTouches[0].clientX-_sx;
    const dy=e.changedTouches[0].clientY-_sy;
    const sel=_sel;               // capturer AVANT de réinitialiser (le guard _hScrollParent en dépend)
    _sx=_sy=_sel=null;
    if(document.querySelector('.overlay.open'))return; // overlay ouvert → pas de navigation
    // ZOOMÉ (pinch-zoom) : l'utilisateur déplace la vue pour lire de gauche à droite → ce geste
    // horizontal ne doit PAS changer d'onglet (retour Michel). visualViewport.scale > 1 = zoomé.
    try{ if(window.visualViewport && window.visualViewport.scale > 1.05) return; }catch(e){}
    if(Math.abs(dx)<110)return;                  // geste franc requis (était 55) → moins de changements d'onglet involontaires
    if(Math.abs(dy)>Math.abs(dx)*0.5)return;     // doit être nettement horizontal (était 0.65)
    // Ne pas naviguer si le geste part d'un contrôle (saisie kg/reps, boutons…) — évite les onglets qui sautent en séance
    if(sel&&sel.closest&&sel.closest('input,textarea,select,button,a,.tbtn,.chk'))return;
    if(_hScrollParent(sel))return;
    // La Séance (log) n'est swipable QUE si une séance est active — sinon on tomberait
    // sur l'écran vide (« onglet blanc »). Hors séance, on l'atteint par le bouton +.
    const order=(typeof S!=='undefined'&&S&&S.wkt)?_SWIPE_ORDER:_SWIPE_ORDER.filter(s=>s!=='log');
    const idx=order.indexOf(window._curScreen);
    if(idx<0)return;
    if(dx<0&&idx<order.length-1){
      const next=order[idx+1];
      goScreen(next,document.getElementById('nb-'+next));
    }else if(dx>0&&idx>0){
      const prev=order[idx-1];
      goScreen(prev,document.getElementById('nb-'+prev));
    }
  },{passive:true});
}

// iOS : bloque le geste « retour » natif (swipe depuis le tout premier bord gauche vers
// la droite) qui affichait une page BLANCHE. On n'annule QUE ce cas précis (départ < 24px
// du bord + mouvement nettement horizontal) → aucun impact sur le scroll vertical ni sur
// les listes qui défilent horizontalement. Notre swipe entre onglets continue de marcher.
function _blockEdgeBackSwipe(){
  let sx=null,sy=null,edge=false,tgt=null,locked=false;
  document.addEventListener('touchstart',e=>{
    if(e.touches.length!==1){edge=false;return;}
    const t=e.touches[0];sx=t.clientX;sy=t.clientY;tgt=e.target;locked=false;
    edge=(t.clientX<=30); // zone bord gauche (iOS décide très tôt → zone un peu large)
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!edge||sx===null)return;
    const t=e.touches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(!locked){
      // Décision au TOUT PREMIER mouvement (iOS engage le retour dès le 1er px) :
      if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>5){edge=false;return;} // scroll vertical → on laisse passer
      if(dx>0&&!_hScrollParent(tgt))locked=true;                        // vers la droite depuis le bord → geste retour → on bloque
      else if(dx<0)return;                                              // vers la gauche → pas concerné
    }
    if(locked)e.preventDefault(); // annule le geste retour natif (page blanche) sur tous les mouvements suivants
  },{passive:false});
  const _clr=()=>{sx=sy=null;edge=false;tgt=null;locked=false;};
  document.addEventListener('touchend',_clr,{passive:true});
  document.addEventListener('touchcancel',_clr,{passive:true});
}

// ─── PULL-TO-DISMISS ─────────────────────────────────────────
// 🐛 FIX ft-v629 (retour Christophe) : fermer une pop-up EN LA GLISSANT vers le bas ne la marquait
// pas comme « vue » → elle revenait au lancement suivant. Le glissement se contentait de retirer la
// classe `open`, sans appeler la vraie fonction de fermeture (qui, elle, écrit le marqueur).
// ⚠️ AJOUTER ICI toute nouvelle pop-up « à effet de bord » (marqueur vu, cooldown…), sinon elle
// reviendra en boucle quand on la ferme au doigt.
const _OVERLAY_CLOSERS={
  'ov-whatsnew':'closeWhatsNew',                   // marque les nouveautés comme vues
  'ov-super-welcome':'closeSuperWelcome',
  'ov-emma-welcome':'closeEmmaWelcome',
  'ov-tester-guide':'closeTesterGuide',
  'ov-tester-eq':'closeTesterEq',
  'ov-tester-3b':'closeTester3B',
  'ov-billoute':'closeBilloute',
  'ov-christophe-photos':'closeChristophePhotos',
  'ov-memoire-c':'closeMemoireC',
  'ov-health-lock':'closeHealthLock',
  'ov-pesee-nav-c':'closePeseeNavC',               // annonce boîte à idées traitée (Christophe)
  'ov-pesee-nav-e':'closePeseeNavE',               // annonce boîte à idées traitée (Eline)
  'ov-export-choix':'closeExportChoix',           // fermer au doigt = annuler, jamais exporter
  'ov-ex-swap':'closeExSwap',                      // pas de marqueur à poser, mais la paire en cours doit être oubliée
};
function _closeOverlayProper(ov){
  try{
    const fn=ov&&ov.id?_OVERLAY_CLOSERS[ov.id]:null;
    if(fn&&typeof window[fn]==='function'){window[fn]();return;}   // fermeture propre (pose le marqueur)
  }catch(e){console.warn('[FT dismiss]',e);}
  if(ov)ov.classList.remove('open');                                // sinon, comportement d'origine
}
function _initPullToDismiss(){
  let _p0y=null,_p0x=null,_pOv=null,_pCnt=null,_pLocked=false;

  document.addEventListener('touchstart',e=>{
    const ov=e.target.closest('.overlay.open');
    if(!ov||ov.hasAttribute('data-no-dismiss')){_p0y=null;return;}
    // Annule si le scroll interne est déjà descendu
    let el=e.target;
    while(el&&el!==ov){if(el.scrollTop>4){_p0y=null;return;}el=el.parentElement;}
    _p0y=e.touches[0].clientY;_p0x=e.touches[0].clientX;
    _pOv=ov;_pCnt=ov.firstElementChild;_pLocked=false;
  },{passive:true});

  document.addEventListener('touchmove',e=>{
    if(_p0y===null||!_pCnt)return;
    const dy=e.touches[0].clientY-_p0y;
    const dx=e.touches[0].clientX-_p0x;
    if(!_pLocked){
      if(Math.abs(dy)<8&&Math.abs(dx)<8)return;
      if(dy<=0||Math.abs(dx)>dy*0.8){_p0y=null;return;} // vers le haut ou trop horizontal
      _pLocked=true;
    }
    if(dy<=0)return;
    e.preventDefault();
    const t=Math.pow(dy,0.78);
    _pCnt.style.transform='translateY('+t+'px)';
    _pCnt.style.transition='none';
    _pCnt.style.opacity=Math.max(0.3,1-dy/350).toFixed(2);
  },{passive:false});

  document.addEventListener('touchend',e=>{
    if(_p0y===null||!_pCnt){_p0y=null;return;}
    const dy=e.changedTouches[0].clientY-_p0y;
    const ov=_pOv,cnt=_pCnt;
    _p0y=_p0x=_pOv=_pCnt=null;_pLocked=false;
    cnt.style.transition='transform .25s cubic-bezier(.3,0,.2,1),opacity .25s';
    if(dy>100){
      cnt.style.transform='translateY('+window.innerHeight+'px)';
      cnt.style.opacity='0';
      setTimeout(()=>{_closeOverlayProper(ov);cnt.style.transform='';cnt.style.opacity='';cnt.style.transition='';},260);
    }else{
      cnt.style.transform='';cnt.style.opacity='';
      setTimeout(()=>{cnt.style.transition='';},260);
    }
  },{passive:true});
}

// ─── HOME ────────────────────────────────────────────────────
function _renderHomeHdr(){
  const el=document.getElementById('home-hdr');if(!el)return;
  // « Bonjour + prénom » retiré (demande Michel) — l'écran commence direct sur « CE MOIS »
  el.innerHTML='';
}

// Rejoue l'animation de l'anneau de récup : le chiffre défile de 0 au score
// pendant que l'arc se remplit, sur la MÊME courbe (sinon les deux se décalent).
function ringReplay(){
  // Rejoue le remplissage : le chiffre défile de 0 au score PENDANT que l'arc se remplit,
  // sur la même courbe. --p est piloté ici (et pas par une animation CSS) parce qu'animer
  // une variable CSS demanderait @property, trop récent pour être sûr sur tous les iPhone.
  try{
    const w=document.getElementById('recup-ring')||document.getElementById('rj');
    const n=document.getElementById('rr-num');
    if(!w||!n)return;
    const cible=parseInt(n.textContent,10); if(isNaN(cible))return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    w.classList.remove('ring-go'); void w.offsetWidth; w.classList.add('ring-go');
    // apparence « moniteur » : le tracé d'ECG repart aussi du début
    const ecg=w.classList.contains('rj-fige')?null:w.querySelector('#rj-ecg path');
    if(ecg){ ecg.style.animation='none'; void ecg.offsetWidth; ecg.style.animation=''; }
    const t0=performance.now(), D=1150;
    (function step(t){
      const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3);
      w.style.setProperty('--p',(cible*e).toFixed(2));
      n.textContent=Math.round(cible*e);
      if(k<1)requestAnimationFrame(step);
      else { w.style.setProperty('--p',cible); n.textContent=cible; }
    })(t0);
  }catch(e){}
}

// Échelle de couleur de l'anneau de récup : ROUGE à 0 -> VERT à 100 (demande Michel, ft-v641).
// Le score n'est pas une note binaire : la couleur doit se déplacer PROGRESSIVEMENT sur l'échelle,
// pas sauter d'un palier à l'autre. On interpole en RGB entre 4 repères.
const _RING_SCALE=[[0,255,77,94],[33,255,138,114],[66,234,179,8],[100,52,211,153]];
function _ringScale(v){
  const x=Math.max(0,Math.min(100,+v||0));
  let a=_RING_SCALE[0], b=_RING_SCALE[_RING_SCALE.length-1];
  for(let i=0;i<_RING_SCALE.length-1;i++){
    if(x>=_RING_SCALE[i][0]&&x<=_RING_SCALE[i+1][0]){a=_RING_SCALE[i];b=_RING_SCALE[i+1];break;}
  }
  const k=(b[0]===a[0])?0:(x-a[0])/(b[0]-a[0]);
  const c=i=>Math.round(a[i]+(b[i]-a[i])*k);
  return 'rgb('+c(1)+','+c(2)+','+c(3)+')';
}
function _renderHomeHero(){
  const el=document.getElementById('home-hero');if(!el)return;
  const detail=(typeof calcRecoveryDetail==='function')?calcRecoveryDetail():{score:calcRecoveryScore(),factors:[],tips:[]};
  const score=detail.score;
  const info=getRecoveryInfo(score);
  const ringColor=score!==null?info.color:'var(--t3)';
  // L'arc parcourt l'échelle : il DÉMARRE au rouge et arrive à la couleur du score.
  const arcC=_ringScale(score||0);   // couleur du score : sert au halo et à la pastille
  let accent='52,211,153';
  if(score!==null&&score<40)accent='255,106,115';
  else if(score!==null&&score<60)accent='255,138,114';
  else if(score!==null&&score<80)accent='234,179,8';
  const hasPending=S.wkt&&S.wkt.exs&&S.wkt.exs.length;
  const ctaLabel=hasPending?'↩ Reprendre la séance':'Commencer une séance';
  /* ⏰ RAPPEL « TA SÉANCE EST ENCORE OUVERTE » (14/08/2026, demande de Michel).
     Au-delà de 90 min sans une seule série validée, ce n'est plus une séance en cours :
     c'est une séance qu'on a oublié de terminer. ⚠️ Le seuil est un jugement, pas une
     mesure — 90 min laisse passer une vraie longue pause (repas, appel) sans crier.
     ⚠️ Rien n'est FAUSSÉ par l'oubli : la mesure s'arrête à la dernière série validée
     (ft-v835). Ce rappel sert au confort, pas à la justesse — d'où un ton neutre. */
  let oubliHtml='';
  if(hasPending&&typeof _wktInactifMin==='function'){
    const im=_wktInactifMin();
    if(im!==null&&im>=90){
      const h=Math.floor(im/60), txt=h>=1?(h+' h'+(im%60?' '+(im%60)+' min':'')):(im+' min');
      oubliHtml='<div style="margin-top:9px;display:flex;align-items:center;gap:7px;font-size:11.5px;'
        +'color:var(--gold);line-height:1.4;"><span>⏰</span><span>Aucune série depuis <b>'+txt
        +'</b> — pense à <b>terminer ta séance</b> pour qu\'elle soit enregistrée.</span></div>';
    }
  }
  const heroLabel=score===null?'Enregistre ton sommeil':score>=80?'Prêt à performer':score>=60?'Bonne récupération':score>=40?'Récupération modérée':'Fatigué';
  const heroDesc=score===null?'Renseigne ton sommeil ce soir pour obtenir ton score de récupération.':info.rec.length>90?info.rec.substring(0,90).replace(/\s+\S*$/,'')+'…':info.rec;
  const pillHtml=score!==null?'<div style="display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:50%;background:'+ringColor+';box-shadow:0 0 8px '+ringColor+';"></span><span style="font-size:12px;font-weight:700;color:'+ringColor+';">Récup '+info.label+'</span></div>':'';
  // Restylage maquette : gros chiffre + barre de progression (au lieu de l'anneau). Mêmes données, CTA conservé.
  const barW=score!==null?score:0;
  // Détail « pourquoi » + conseils pour remonter le score
  let detailHtml='';
  if(score!==null&&detail.factors&&detail.factors.length){
    const fx=detail.factors.map(f=>{
      const col=f.base?'var(--t2)':(f.val>0?'#34D399':'#FF8A72');
      const sign=f.base?'':(f.val>0?'+':'');
      return '<span style="white-space:nowrap;">'+f.ic+' '+f.label+' <b style="color:'+col+';">'+sign+f.val+'</b></span>';
    }).join('<span style="color:var(--sep);margin:0 1px;">·</span>');
    const tipsHtml=(detail.tips||[]).map(t=>'<div style="display:flex;gap:6px;"><span>💡</span><span>'+t+'</span></div>').join('');
    /* 📉 LES 7 DERNIERS JOURS, SUR LA LIGNE QUI EXISTE DÉJÀ (ft-v1017). Michel : « j'ai
       l'impression qu'il n'y a pas d'historique ». Il y en a un maintenant — mais on ne
       rajoute PAS une carte : ft-v547 avait replié le check-in parce que « ça prend trop
       de place », et ce serait défaire cette décision (R30). La courbe se glisse À DROITE
       du bouton « Pourquoi ce score ? », dans une rangée déjà là : ~26 px, zéro carte.
       ⛔ Et elle est MUETTE quand elle n'a rien à dire : moins de 2 jours mesurables, on
       n'affiche rien du tout plutôt qu'une barre solitaire qui ressemble à un bug. */
    let sparkHtml='';
    try{
      const pts=(typeof recupHistorique==='function')?recupHistorique(7):[];
      if(pts.filter(x=>x.score!=null).length>=2)
        sparkHtml='<div style="margin-left:auto;display:flex;align-items:center;gap:7px;">'
          +'<span style="font-size:10px;color:var(--t3);font-weight:700;letter-spacing:.06em;">7 J</span>'
          +_recupSparkline(22)+'</div>';
    }catch(e){}
    detailHtml='<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:5px 7px;font-size:11px;color:var(--t3);align-items:center;">'+fx+'</div>'
      +'<div style="margin-top:9px;display:flex;align-items:center;gap:10px;">'
      +'<button onclick="openRecoWhy()" style="background:none;border:none;padding:0;color:var(--blue);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;gap:3px;-webkit-tap-highlight-color:transparent;">Pourquoi ce score ?<span style="font-size:12px;">›</span></button>'
      +sparkHtml+'</div>'
      +(tipsHtml?'<div style="margin-top:9px;background:var(--bg3);border-radius:10px;padding:9px 11px;font-size:12px;color:var(--t2);line-height:1.5;display:flex;flex-direction:column;gap:5px;">'+tipsHtml+'</div>':'');
  }
  // Bandeau contextuel « gêne du jour » (brique 3B) : une douleur ne fait PAS baisser
  // le chiffre (le corps reste récupéré) — elle prévient juste d'adapter. Adapter, pas interdire.
  let warnHtml='';
  if(detail.dayPains&&detail.dayPains.length){
    const z=detail.dayPains;
    const zTxt=z.length===1?z[0]:z.slice(0,-1).join(', ')+' et '+z[z.length-1];
    warnHtml='<div style="margin-top:10px;background:rgba(234,179,8,.12);border:1px solid rgba(234,179,8,.32);border-radius:10px;padding:9px 11px;font-size:12px;color:var(--t2);line-height:1.5;display:flex;gap:8px;align-items:flex-start;">'
      +'<span style="flex:none;">⚠️</span><span>Gêne signalée aujourd\'hui (<b>'+zTxt+'</b>) : ton corps est récupéré, mais <b>échauffe-toi bien</b> et allège les mouvements qui tirent si besoin. Tu peux t\'entraîner.</span></div>';
  }
  el.innerHTML='<div style="padding:20px;border-radius:20px;background:radial-gradient(130% 100% at 0% 0%,rgba('+accent+',.10),transparent 55%),var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);" class="ft-rise">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;">'
    +(S.ringStyle==='moniteur'
      ? '<div class="rj-haut">AUJOURD\'HUI</div>'   // la pastille « Récup … » disparaît :
                                                  // le libellé sous le chiffre dit déjà la même chose
      : '<div style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--t3);">AUJOURD\'HUI</div>'+pillHtml)
    +'</div>'
    // ── VISUEL DE LA RÉCUP — deux apparences au choix (Menu → Apparence) ──
    // 'anneau'   = l'anneau complet (défaut, ft-v636 → 642)
    // 'moniteur' = le chiffre à gauche, jauge ouverte à droite, tracé d'ECG (ft-v645)
    // Les DONNÉES sont les mêmes : seule la mise en forme change.
    +(S.ringStyle==='moniteur'
      ? (score!==null
        ? '<div style="display:flex;align-items:center;gap:14px;margin-top:12px;">'
          +'<div style="flex:1;min-width:0;">'
            +'<div class="rj-num"><span id="rr-num">'+score+'</span><i>/100</i></div>'
            +'<div class="rj-lab">'+heroLabel+'</div>'
          +'</div>'
          // ⚠️ Structure imposée par la technique (voir style.css) : #rj-arcwrap découpe
          // l'arc de 306°, #rj-progwrap le score, chaque enfant creuse le trou.
          +'<div id="rj" onclick="ringReplay()" class="ft-press'+(S.ecgStill?' rj-fige':'')+'" style="--p:'+score+';margin-top:-26px;">'
            +'<div id="rj-arcwrap">'
              +'<div id="rj-creux"></div><div id="rj-piste"></div>'
              +'<div id="rj-progwrap"><div id="rj-prog"></div></div>'
            +'</div>'
            +'<div id="rj-point"></div>'
            +'<div id="rj-ecg"><svg viewBox="0 0 100 40" preserveAspectRatio="none">'
              +'<path pathLength="100" d="M0 20 h4 q2.5 -4 5 0 h4 l2 2.5 l2.5 -15 l2.5 21 l2 -8.5 h4 q3.5 -5.5 7 0 h17'
              +' h4 q2.5 -4 5 0 h4 l2 2.5 l2.5 -15 l2.5 21 l2 -8.5 h4 q3.5 -5.5 7 0 h17"/></svg></div>'
          +'</div></div>'
          +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:10px;">'+heroDesc+'</div>'
        : '<div style="margin-top:12px;"><div class="rj-num"><span id="rr-num">—</span></div>'
          +'<div class="rj-lab">'+heroLabel+'</div>'
          +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:8px;">'+heroDesc+'</div></div>')
      : ''
     )
    +(S.ringStyle==='moniteur' ? '' :
    // ⚠️ PAS de « + » en tête de cette ligne : à l'intérieur d'un ternaire il devient un
    // plus UNAIRE appliqué à une chaîne, ce qui donne NaN et fait disparaître ce bloc.
    // Bug réel arrivé en prod (ft-v646) : « NaN » s'affichait sur l'Accueil.
    '<div style="display:flex;align-items:center;gap:18px;margin-top:14px;">'
    +(score!==null
      ? '<div id="recup-ring" onclick="ringReplay()" class="ft-press" style="--p:'+score+';">'
        // ⚠️ Structure IMPOSÉE par la technique (voir style.css) : #rr-arcwrap porte le masque
        // conique qui découpe la PART, #rr-arc et #rr-shine portent celui qui creuse le TROU.
        // Ne pas aplatir ces niveaux : sans l'imbrication il faudrait mask-composite,
        // que Safari iOS gère mal.
        +'<div id="rr-track"></div><div id="rr-glint"></div>'
        +'<div id="rr-arcwrap">'
          +'<div id="rr-arc"></div><div id="rr-shine"></div>'
        +'</div>'
        +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;">'
        +'<span id="rr-num" style="font-family:var(--font-cond);font-size:32px;font-weight:900;color:var(--t1);line-height:1;text-shadow:0 2px 6px rgba(0,0,0,.5);">'+score+'</span>'
        +'<span style="font-size:10px;color:var(--t3);font-weight:700;">/100</span>'
        +'</div></div>'
      : '<div style="flex:none;width:100px;text-align:center;font-family:var(--font-cond);font-size:30px;font-weight:800;color:var(--t3);">—</div>')
    +'<div style="flex:1;min-width:0;"><div style="font-size:16px;font-weight:700;color:var(--t1);">'+heroLabel+'</div>'
    +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:3px;">'+heroDesc+'</div></div></div>'
     )
    +detailHtml+warnHtml
    +'<button onclick="startWorkout()" class="ft-press" style="margin-top:16px;width:100%;height:54px;border-radius:16px;background:linear-gradient(135deg,var(--red),#EF3E57);box-shadow:0 12px 28px -10px rgba(239,62,87,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg>'
    +'<span style="font-size:16px;font-weight:700;color:#fff;font-family:var(--font);">'+ctaLabel+'</span></button>'
    +oubliHtml+'</div>';
}

/* 🔋 « CE QU'IL TE MANQUE POUR ARRIVER À 100 » (21/08/2026) — l'idée de Michel.
   ⭐ Le score donnait un chiffre sans dire ce qui coûte les points manquants — la seule chose
   sur laquelle on peut agir. On AFFICHE les éléments, on ne décide pas à sa place (R29).
   ⭐⭐ ET ON DIT SON PLAFOND RÉEL quand il est sous 100 : à 48 ans et fumeur, le maximum
   atteignable est 93. *Viser chaque jour un 100 qui n'existe pas, c'est un reproche
   quotidien déguisé en objectif.*
   ⛔ Le ton est FACTUEL et il ne se répète pas : le facteur permanent est nommé une fois, sans
   commentaire et sans conseil de le corriger (Constitution P13). */
function _recoManqueHtml(d){
  if(!d) return '';
  const plaf=(typeof d.plafond==='number')?d.plafond:100;
  const manque=d.manque||[];
  let h='';
  if(plaf<100){
    const noms=(d.plafondFacteurs||[]).map(f=>f.ic+' '+f.label.toLowerCase()).join(' · ');
    /* ⚠️ FORMULATION CORRIGÉE LE 21/08 (le lendemain de ft-v952) : dire « ton maximum est 93 »
       tout court était FAUX. Le bonus de repos (+12 après 4 jours sans séance) peut compenser
       les facteurs permanents, donc 100 reste atteignable — en ne s'entraînant pas. On le dit,
       parce qu'un plafond annoncé trop bas ferait renoncer à un chiffre réellement possible. */
    const abs=(typeof d.plafondAbsolu==='number')?d.plafondAbsolu:plaf;
    h+='<div style="margin-top:14px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:11px 13px;">'
      +'<div style="font-size:13px;color:var(--t2);line-height:1.5;">🔒 <b style="color:var(--t1);">Tant que tu t\'entraînes régulièrement, ton maximum est '+plaf+'</b>'+(noms?' — '+noms:'')+'. '
      +'Ces facteurs-là ne se rattrapent pas d\'un jour à l\'autre : ils ne sont pas un retard, ils déplacent la ligne d\'arrivée. '
      +'<span style="color:var(--t3);">Un '+plaf+' chez toi, c\'est un 100.</span>'
      +(abs>plaf?' <span style="color:var(--t3);">(Le bonus de repos peut te porter jusqu\'à '+abs+', mais il faut 4 jours sans séance.)</span>':'')
      +'</div></div>';
  }
  if(manque.length){
    const tot=manque.reduce((a,m)=>a+m.cout,0);
    h+='<div style="margin-top:10px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:11px 13px;">'
      +'<div style="font-size:12.5px;color:var(--t3);margin-bottom:7px;">Ce qui te sépare de '+plaf+' aujourd\'hui — <b style="color:var(--t2);">'+tot+' point'+(tot>1?'s':'')+'</b>, du plus lourd au plus léger</div>'
      +manque.map(m=>'<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:4px 0;">'
        +'<span style="font-size:13px;color:var(--t2);">'+m.ic+' '+m.label+'</span>'
        +'<b style="font-size:13px;color:#FF8A72;white-space:nowrap;">−'+m.cout+'</b></div>').join('')
      +'</div>';
  }else if(plaf<100){
    h+='<div style="margin-top:10px;font-size:12.5px;color:var(--green);text-align:center;">✅ Rien ne te sépare de ton maximum aujourd\'hui.</div>';
  }
  h+=_recoQuandHtml(d);
  return h;
}
/* ⏳ « QUAND SERAI-JE AU MAX ? » — Michel : « là on ne sait pas quand on aura récupéré au max ».
   ⛔⛔ ON DONNE UN MOMENT, JAMAIS UN CHIFFRE PROJETÉ. Annoncer « tu seras à 93 jeudi »
   supposerait de connaître les nuits qui n'ont pas encore eu lieu — or le sommeil EST la base du
   score. On rend donc ce qui est exact (la fatigue mécanique) et on NOMME ce qui dépendra
   d'elle, sans le chiffrer (R29 · Principe 18 : ne jamais faire semblant de savoir). */
function _recoQuandHtml(d){
  const p=(typeof projectionRecup==='function')?projectionRecup(d):null;
  if(!p) return '';
  if(p.dejaAuMax){
    return '<div style="margin-top:10px;background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.25);border-radius:12px;padding:10px 13px;font-size:12.5px;color:var(--t2);line-height:1.5;">'
      +'⏳ <b style="color:var(--t1);">Ta fatigue d\'entraînement est déjà partie.</b> Ce qui reste dépend de tes nuits et de ta forme du jour.</div>';
  }
  const t=new Date(p.quand);
  const jours=Math.round((new Date(t.toISOString().slice(0,10)+'T12:00:00')-new Date(today()+'T12:00:00'))/864e5);
  const JJ=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const quandTxt = jours===0?'aujourd\'hui' : jours===1?'demain'
                 : (jours>=2&&jours<=6)?JJ[t.getDay()] : 'le '+t.toISOString().slice(8,10)+'/'+t.toISOString().slice(5,7);
  // L'heure n'a de sens que pour la fatigue de séance (connue à la minute) ; l'enchaînement de
  // jours, lui, se vide au changement de date — annoncer « à 0 h 00 » serait un faux précis.
  const heure = p.source==='seance' ? (' vers '+t.getHours()+' h') : '';
  const reste = (p.restant||[]).length ? ' Ensuite, il restera '+p.restant.join(' et ')+'.' : '';
  return '<div style="margin-top:10px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:11px 13px;">'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;">⏳ <b style="color:var(--t1);">Ta fatigue d\'entraînement sera partie '+quandTxt+heure+'</b>'
    +(p.source==='seance'?' — c\'est l\'effet de ta dernière séance, il s\'efface en continu.'
                         :' — le temps que ton enchaînement de jours se vide.')
    +reste+'</div>'
    +'<div style="font-size:11.5px;color:var(--t3);line-height:1.5;margin-top:6px;">On ne te donne pas un score à l\'avance&nbsp;: il dépendrait de nuits qui n\'ont pas encore eu lieu. Ça, c\'est le moment où <b>la partie mécanique</b> sera revenue à zéro.</div></div>';
}
// ─── « Pourquoi ce score ? » — explication claire de la récup (retour GPT, ft-v564) ──
function openRecoWhy(){
  const d=(typeof calcRecoveryDetail==='function')?calcRecoveryDetail():null;
  const body=document.getElementById('reco-why-body');
  if(!d||d.score==null||!body)return;
  const info=getRecoveryInfo(d.score);
  const factorsHtml=(d.factors||[]).map(f=>{
    const col=f.base?'var(--t2)':(f.val>0?'#34D399':'#FF8A72');
    const valTxt=f.base?(f.val+' /100'):((f.val>0?'+':'')+f.val);
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--sep);">'
      +'<span style="font-size:18px;flex:none;line-height:1.3;">'+f.ic+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">'
      +'<b style="font-size:13.5px;color:var(--t1);">'+f.label+'</b>'
      +'<b style="font-size:13.5px;color:'+col+';white-space:nowrap;">'+valTxt+'</b></div>'
      +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:2px;">'+(f.why||'')+'</div></div></div>';
  }).join('');
  body.innerHTML=
    '<div style="text-align:center;margin:4px 0 2px;"><div style="font-family:var(--font-cond);font-size:42px;font-weight:800;color:'+info.color+';line-height:1;">'+d.score+'<span style="font-size:16px;color:var(--t3);font-weight:700;">/100</span></div>'
    +'<div style="font-size:14px;font-weight:700;color:'+info.color+';margin-top:2px;">'+info.label+'</div></div>'
    +'<div style="font-size:13px;color:var(--t2);line-height:1.5;margin:12px 0 8px;">Ce score estime à quel point ton corps est <b>prêt à s\'entraîner</b> aujourd\'hui (100 = parfaitement frais). Voici ce qui l\'a fait bouger :</div>'
    +factorsHtml
    +_recoHistoHtml()
    +_recoManqueHtml(d)
    +'<div style="margin-top:14px;background:var(--bg3);border-radius:12px;padding:11px 13px;font-size:13px;color:var(--t2);line-height:1.5;">'+info.rec+'</div>'
    +'<div style="margin-top:10px;font-size:11.5px;color:var(--t3);line-height:1.5;text-align:center;">Il se recalcule chaque jour et remonte au fil de la journée. Ce n\'est qu\'un repère — <b>ton ressenti prime toujours</b>.</div>';
  document.getElementById('ov-reco-why').classList.add('open');
}
/* 📉 « CE QUE ÇA DONNAIT LES JOURS D'AVANT » (ft-v1017) — le détail va ICI, pas sur
   l'Accueil : la pop-up ANNONCE, l'aide EXPLIQUE (R25), et cette modale est déjà la
   surface qui explique le score.
   ⭐⭐ LA PHRASE QUI COMPTE EST CELLE DE L'HEURE. Sans elle, quelqu'un comparerait un 44
   relevé le matin à un 56 relevé le soir et croirait avoir progressé — alors que c'est la
   même journée. On DIT donc que tous les points sont pris à la même heure, et laquelle.
   ⛔ Aucun jugement sur la tendance (« tu récupères mieux ! ») : 7 points ne font pas une
   tendance, et l'app ne connaît ni le stress, ni la maladie, ni la vie de la personne
   (R12, R29). On montre les chiffres, elle conclut. */
function _recoHistoHtml(){
  try{
    if(typeof recupHistorique!=='function') return '';
    const pts=recupHistorique(7);
    const connus=pts.filter(p=>p.score!=null);
    if(connus.length<2) return '';                 // rien à comparer → on se tait
    const hh=String(new Date().getHours()).padStart(2,'0');
    const J=['dim','lun','mar','mer','jeu','ven','sam'];
    const lignes=pts.map(p=>{
      const dt=new Date(p.date+'T12:00:00');
      const lbl=(p.date===today())?'auj.':J[dt.getDay()];
      if(p.score==null)
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">'
          +'<div style="height:54px;display:flex;align-items:flex-end;"><div style="width:9px;height:4px;border-radius:2px;background:var(--sep);"></div></div>'
          +'<span style="font-size:10px;color:var(--t3);">'+lbl+'</span>'
          +'<span style="font-size:10px;color:var(--t3);">—</span></div>';
      const h=Math.max(6,Math.round((p.score/100)*54));
      const c=(typeof _ringScale==='function')?_ringScale(p.score):'var(--t2)';
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">'
        +'<div style="height:54px;display:flex;align-items:flex-end;"><div style="width:9px;height:'+h+'px;border-radius:3px;background:'+c+';"></div></div>'
        +'<span style="font-size:10px;color:var(--t3);">'+lbl+'</span>'
        +'<span style="font-size:10.5px;color:'+c+';font-weight:700;">'+p.score+'</span></div>';
    }).join('');
    return '<div style="margin-top:16px;background:var(--bg3);border-radius:12px;padding:12px 13px;">'
      +'<div style="font-size:12.5px;font-weight:700;color:var(--t1);margin-bottom:10px;">📉 Tes 7 derniers jours</div>'
      +'<div style="display:flex;align-items:flex-end;gap:4px;">'+lignes+'</div>'
      +'<div style="font-size:11px;color:var(--t3);line-height:1.5;margin-top:10px;">'
      +'Chaque jour est mesuré à <b>'+hh+' h</b>, comme maintenant — ton score monte au fil de la journée, '
      +'donc comparer le matin au soir ne voudrait rien dire. Les jours sans barre sont ceux où l\'app '
      +'n\'avait pas encore de quoi calculer.</div></div>';
  }catch(e){ return ''; }
}
function closeRecoWhy(){const o=document.getElementById('ov-reco-why');if(o)o.classList.remove('open');}

// ─── Coach proactif — petit mot de Milo sur l'Accueil (brique 4) ──────────
// Choisit LE message le plus pertinent du jour à partir des données locales
// (aucun backend). Fermable, jamais 2× le même message le même jour.
// Jour lisible en français pour une date ISO (aujourd'hui / demain / lundi… / le JJ/MM) — ft-v601
function _frDayLabel(dateStr){
  const t=today();
  const diff=Math.round((new Date(dateStr+'T12:00:00')-new Date(t+'T12:00:00'))/864e5);
  if(diff===0)return 'aujourd\'hui';
  if(diff===1)return 'demain';
  const days=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  if(diff>=2&&diff<=6)return days[new Date(dateStr+'T12:00:00').getDay()];
  return 'le '+dateStr.split('-').reverse().slice(0,2).join('/');
}
// ─── MOMENT 2 « Milo se souvient de moi » (docs/PRESENCE-MILO.md — le 2ᵉ moment) ───
// Au RETOUR après une pause, Milo ressort un souvenir tiré de la mémoire existante (source de vérité :
// observations validées + autre sport + objectif) → le retour devient chaleureux au lieu d'un « ça fait X
// jours » froid. 100 % déterministe, LIT le profil, ne stocke rien. Rien en mémoire → message froid (0 régression).
function _miloReturnHints(){
  const out=[];
  ((typeof _validatedObs==='function')?_validatedObs():[]).forEach(o=>{
    // 🛡️ _obsEsc : le fait vient d'un texte écrit par l'IA → échappé car m.txt part dans innerHTML
    const t=_obsEsc((o.fact||o.ask||'').trim()); if(t)out.push('Je me souviens : « '+t+' »');
  });
  const os=S.coachQuiz&&S.coachQuiz.answers&&S.coachQuiz.answers.othersport;
  if(os&&os!=='aucun'){ const lbl=(typeof _OTHERSPORT_LBL!=='undefined'&&_OTHERSPORT_LBL[os])||'un autre sport'; out.push('Je me souviens que tu fais aussi du '+lbl); }
  if(S.goal&&typeof GOAL_LABELS!=='undefined'&&GOAL_LABELS[S.goal]) out.push('Ton objectif « '+GOAL_LABELS[S.goal]+' » est toujours là');
  return out;
}
function _miloReturnHint(){
  const h=_miloReturnHints(); if(!h.length)return null;
  const idx=(new Date(today()+'T12:00:00').getDate())%h.length;   // rotation par jour → on varie l'ouverture
  return h[idx];
}
function _miloMessage(){
  const sess=(S.sessions||[]).filter(s=>s.date);
  const tStr=today();
  const lastDate=sess.length?sess.map(s=>s.date).sort().slice(-1)[0]:null;
  const daysSince=lastDate?Math.floor((new Date(tStr+'T12:00:00')-new Date(lastDate+'T12:00:00'))/864e5):null;
  // Séances de la semaine ISO en cours (lundi → dimanche)
  const now=new Date(tStr+'T12:00:00');
  const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
  const monK=mon.toISOString().slice(0,10);
  const weekCount=[...new Set(sess.map(s=>s.date))].filter(d=>d>=monK).length;
  const rec=(typeof calcRecoveryScore==='function')?calcRecoveryScore():null;
  // Prochaine séance ANNONCÉE à Milo (ft-v601) : cohérence chat ↔ Accueil (« Milo se souvient de moi »).
  // Priorité HAUTE → tant qu'une séance est prévue, Milo ne relance PLUS « ça fait X jours ».
  // ⚠️ La règle « cette annonce tient-elle encore ? » vit dans plannedSession() (state.js) — le chat de
  // Milo lit EXACTEMENT la même (ft-v654). Ne pas la recopier ici : c'est comme ça que l'Accueil et le
  // chat se sont mis à dire deux choses différentes. Ici on ne fait que RENDRE + nettoyer.
  const np=(typeof plannedSession==='function')?plannedSession():null;
  if(np){
    const lab=np.label?(' '+np.label):'';
    // ⚠️ « C'ÉTAIT CELLE-LÀ ? » (ft-v662) — cas réel de Michel : il annonce « bas du corps demain »
    // puis la fait le JOUR MÊME. plannedSession() compare des DATES, pas ce qui a été fait → l'Accueil
    // et Milo continuaient d'annoncer une séance déjà faite. On ne DEVINE pas en rapprochant le libellé
    // des muscles travaillés (ça se tromperait un jour sur deux) : on DEMANDE, en un tap.
    // ⚠️ SEULEMENT « DEMAIN » (ft-v784) — cas réel relevé dans les conversations de Michel :
    // il annonce une séance pour SAMEDI, s'entraîne le MERCREDI, et l'Accueil lui demande
    // « tu avais annoncé une séance Larsen Press pour samedi — c'était celle-là ? ». Non :
    // elle est dans 3 jours. La question n'a de sens que si l'annonce était pour DEMAIN et
    // qu'elle a été avancée d'un jour. Au-delà, on retombe sur « prévue samedi, repose-toi
    // d'ici là », qui est la bonne phrase. Une question absurde ne casse rien — c'est pire :
    // elle démolit le « Milo se souvient de moi » qu'elle était censée servir.
    if(np.days===1&&lastDate===tStr){
      // On MONTRE ce que l'app voit (exercices + région dominante) et la personne tranche —
      // on ne rapproche JAMAIS le libellé tapé (« bas du corps ») des muscles travaillés :
      // ça se tromperait sur les séances mixtes, celles où Michel lui-même hésite (29/07).
      // ⚠️ Tout est FACULTATIF : si l'app ne reconnaît pas les exercices, elle se tait.
      let vu='';
      try{
        const sj=sess.filter(x=>x.date===tStr);
        const noms=[]; sj.forEach(x=>(x.exs||x.exercises||[]).forEach(e=>{
          const n=(e&&e.name||'').trim(); if(n&&noms.indexOf(n)<0)noms.push(n);
        }));
        const mot=(typeof _calSessMixTxt==='function')?_calSessMixTxt(sj[0]):'';
        // le nom d'affichage : on retire le rappel entre parenthèses (« Curl Ischio-jambiers
        // (Leg Curl) ») qui alourdit la phrase sans rien apprendre.
        const court=n=>_obsEsc(n.replace(/\s*\([^)]*\)/g,'').trim()).slice(0,26);
        const liste=noms.slice(0,3).map(court).filter(Boolean).join(', ')+(noms.length>3?'…':'');
        if(liste||mot) vu=[liste,mot].filter(Boolean).join(' — ')+'. ';
      }catch(e){ vu=''; }   // au moindre doute, on n'affiche rien plutôt qu'une bêtise
      return {id:'seance-faite',txt:'Bien joué pour ta séance 💪 '+vu
        +'Tu avais annoncé une séance'+lab+' pour '
        +((typeof _frDayLabel==='function')?_frDayLabel(np.date):np.date)+' — c\'était celle-là ?'};
    }
    if(np.days===0)return {id:'prevu-jour',txt:'C\'est le jour de ta séance'+lab+' 💪 On la prépare ?'};
    const when=(typeof _frDayLabel==='function')?_frDayLabel(np.date):np.date;
    return {id:'prevu',txt:'Séance'+lab+' prévue '+when+' 💪 Je m\'en souviens — repose-toi bien d\'ici là.'};
  }
  if(S.nextPlanned&&S.nextPlanned.date){
    try{S.nextPlanned=null;persist();}catch(e){}  // annonce périmée : on nettoie, on retombe sur la logique normale
  }
  // Priorité : réengagement > relance > récup > lendemain > régularité
  // MOMENT 2 « Milo se souvient de moi » : au retour, un souvenir réchauffe le message (sinon → version froide).
  if(daysSince!==null&&daysSince>=10){
    const hint=_miloReturnHint();
    if(hint)return {id:'retour',txt:'Content de te revoir 👋 '+hint+'. On reprend tranquille — pas de record aujourd\'hui, on remet la machine en route.'};
    return {id:'retour',txt:'Content de te revoir 👋 On reprend tranquille — pas de record aujourd\'hui, on remet la machine en route.'};
  }
  if(daysSince!==null&&daysSince>=4){
    const hint=_miloReturnHint();
    if(hint)return {id:'relance',txt:'Content de te revoir 👋 '+hint+'. On se refait une séance ?'};
    return {id:'relance',txt:'Ça fait '+daysSince+' jours 👀 On se refait une séance aujourd\'hui ?'};
  }
  if(rec!==null&&rec<40&&daysSince!==null&&daysSince>=1)
    return {id:'recup',txt:'Nuit courte ces derniers jours — vise plutôt une séance légère aujourd\'hui, et dors tôt ce soir. 😴'};
  // Relance PROFIL : tant qu'il est incomplet, Milo insiste (c'est ce qui rend ses conseils sur-mesure)
  if(typeof _profileCompletion==='function'){
    const pc=_profileCompletion();
    if(pc.pct<70)
      return {id:'profil',go:'setup',txt:'Prends 2 min pour bien remplir ton profil (rempli à '+pc.pct+'% pour l\'instant) 📋 Plus je te connais — âge, objectif, niveau, morpho… — plus mes conseils sont VRAIMENT faits pour toi. On le complète ?'};
  }
  if(daysSince===1)
    return {id:'lendemain',txt:'Bien joué pour hier 💪 Pense à bien manger et à récupérer aujourd\'hui.'};
  if(weekCount>=3)
    return {id:'regularite',txt:weekCount+' séances cette semaine 🔥 Tu tiens le rythme, continue comme ça !'};
  return null;
}
function _renderMiloCard(){
  const el=document.getElementById('home-milo');if(!el)return;
  const m=_miloMessage();
  if(!m){el.innerHTML='';return;}
  let dism=null;try{dism=JSON.parse(localStorage.getItem('ft4_milo')||'null');}catch(e){}
  if(dism&&dism.date===today()&&dism.id===m.id){el.innerHTML='';return;}
  const name=(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo');
  window._miloGoTarget=m.go||null;
  el.innerHTML='<div class="milo-card ft-press" onclick="_miloCardTap()">'
    +'<div class="milo-av"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>'
    +'<div style="flex:1;min-width:0;"><div class="milo-name">'+name+'</div><div class="milo-txt">'+m.txt+'</div>'
    +((m.id==='relance'||m.id==='retour')?'<button class="milo-plan ft-press" onclick="event.stopPropagation();_planTomorrow()">📅 J\'y vais demain</button>':'')
    +(m.id==='seance-faite'?'<button class="milo-plan ft-press" onclick="event.stopPropagation();_confirmPlannedDone()">✅ Oui, c\'était celle-là</button>':'')
    +'</div>'
    +'<button class="milo-x" onclick="event.stopPropagation();_dismissMilo(\''+m.id+'\')" aria-label="Fermer"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    +'</div>';
}
// Fix déterministe (ft-v616) : « Milo me relance alors que je vais au sport demain ». Le chat→Accueil (ft-v601)
// dépend de Milo qui émet un marqueur caché (pas fiable). Ici un bouton pose directement la séance de demain.
function _planTomorrow(){
  try{
    const d=new Date(today()+'T12:00:00'); d.setDate(d.getDate()+1);
    S.nextPlanned={date:d.toISOString().slice(0,10),label:''};
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderMiloCard==='function')_renderMiloCard();
    if(typeof toast==='function')toast('Noté 💪 Séance prévue demain — je te laisse tranquille d\'ici là.','success');
  }catch(e){}
}
// « Oui, c'était celle-là » : l'annonce est honorée, on la retire (ft-v662).
// C'est la PERSONNE qui tranche — l'app ne déduit rien du libellé. Fermer la carte
// avec la croix vaut « non, elle tient toujours » : l'annonce reste, on ne redemande
// pas aujourd'hui, et la question ne peut revenir qu'un jour où tu t'entraînes.
function _confirmPlannedDone(){
  try{
    S.nextPlanned=null;
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    if(typeof _renderMiloCard==='function')_renderMiloCard();
    if(typeof toast==='function')toast('Noté 👍 Séance faite, je la retire de tes prévisions.','success');
  }catch(e){}
}
function _dismissMilo(id){
  try{localStorage.setItem('ft4_milo',JSON.stringify({date:today(),id}));}catch(e){}
  const el=document.getElementById('home-milo');if(el)el.innerHTML='';
}
// ─── Observation de Milo à valider (Dossier Athlète, brique 5A) ───
function _obsEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function _renderObsCard(){
  const el=document.getElementById('home-obs');if(!el)return;
  const name=(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo');
  const avatar='<div class="milo-av"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>';
  // 1. Une observation DÉJÀ posée (on finit ce qui est commencé).
  let o=(typeof _pendingObs==='function')?_pendingObs():null;
  if(!o){
    // 2. CONTEXTUEL (profil vivant) : écart déclaré/réalisé (ex. fréquence) → PRIORITAIRE, passe outre le plafond hebdo.
    const cx=(typeof _pendingFreqContext==='function')?_pendingFreqContext():null;
    if(cx){
      el.style.padding='14px 14px 0';
      const ask=cx.dir==='up'
        ? "J'ai l'impression que tu t'entraînes plutôt <b>"+_obsEsc(cx.observedLabel)+"</b> par semaine ces temps-ci — j'avais noté <b>"+_obsEsc(cx.declaredLabel)+"</b>. Ça a changé ?"
        : "On dirait que tu t'entraînes plutôt <b>"+_obsEsc(cx.observedLabel)+"</b> par semaine en ce moment — j'avais noté <b>"+_obsEsc(cx.declaredLabel)+"</b>. C'est le nouveau rythme ?";
      el.innerHTML='<div class="obs-card">'
        +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' — petite vérification 😊</div></div>'
        +'<div class="obs-txt">'+ask+'</div>'
        +'<div class="obs-btns">'
        +'<button class="obs-yes ft-press" onclick="applyFreqContext(\''+_obsEsc(cx.observed)+'\')">Oui, mets à jour</button>'
        +'<button class="obs-no ft-press" onclick="dismissFreqContext(\''+_obsEsc(cx.observed)+'\')">Non, garde comme ça</button>'
        +'</div></div>';
      return;
    }
    // 2 bis. CONTEXTUEL : style observé (force/hypertrophie) ≠ objectif déclaré → Milo CONSTATE et DEMANDE
    //         (⚠️ « observé ≠ intention » : jamais de bascule auto de l'objectif — l'utilisateur décide).
    const sx=(typeof _pendingStyleContext==='function')?_pendingStyleContext():null;
    if(sx){
      el.style.padding='14px 14px 0';
      const ask="J'observe que ton entraînement ressemble plutôt à du <b>"+_obsEsc(sx.styleLabel)+"</b>, alors que ton objectif est « <b>"+_obsEsc(sx.goalLabel)+"</b> ». Souhaites-tu passer sur « <b>"+_obsEsc(sx.newGoalLabel)+"</b> » ? (ça n'a rien d'obligatoire)";
      el.innerHTML='<div class="obs-card">'
        +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' — petite observation 😊</div></div>'
        +'<div class="obs-txt">'+ask+'</div>'
        +'<div class="obs-btns">'
        +'<button class="obs-yes ft-press" onclick="applyStyleContext(\''+_obsEsc(sx.newGoal)+'\',\''+_obsEsc(sx.observed)+'\')">Oui, mets à jour</button>'
        +'<button class="obs-no ft-press" onclick="dismissStyleContext(\''+_obsEsc(sx.observed)+'\')">Non, garde comme ça</button>'
        +'</div></div>';
      return;
    }
    // 3. Mode COMPLÉTER (profil vivant) : un champ de base manquant → PRIORITAIRE sur une nouvelle observation.
    const gap=(typeof _pendingGap==='function')?_pendingGap():null;
    if(gap){
      el.style.padding='14px 14px 0';
      const opts=gap.options.map(op=>'<button class="gap-opt ft-press" onclick="fillGap(\''+gap.field+'\',\''+_obsEsc(op[0])+'\')">'+_obsEsc(op[1])+'</button>').join('');
      el.innerHTML='<div class="obs-card">'
        +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' — pour mieux te conseiller</div></div>'
        +'<div class="obs-txt">'+_obsEsc(gap.ask)+'</div>'
        +'<div class="gap-opts">'+opts+'</div>'
        +'<button class="gap-later ft-press" onclick="skipGap(\''+gap.field+'\')">Plus tard</button>'
        +'</div>';
      return;
    }
    // 4. Mode ENRICHIR (profil vivant) : une info non déductible des données (ex. un autre sport) que Milo DEMANDE.
    const enr=(typeof _pendingEnrich==='function')?_pendingEnrich():null;
    if(enr){
      el.style.padding='14px 14px 0';
      const opts=enr.options.map(op=>'<button class="gap-opt ft-press" onclick="fillEnrich(\''+enr.field+'\',\''+_obsEsc(op[0])+'\')">'+_obsEsc(op[1])+'</button>').join('');
      el.innerHTML='<div class="obs-card">'
        +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' — pour mieux te connaître</div></div>'
        +'<div class="obs-txt">'+_obsEsc(enr.ask)+'</div>'
        +'<div class="gap-opts">'+opts+'</div>'
        +'<button class="gap-later ft-press" onclick="skipEnrich(\''+enr.field+'\')">Plus tard</button>'
        +'</div>';
      return;
    }
    // 5. Mode CONFIRMER (profil vivant) : une info ENCORE là mais ANCIENNE → on la re-valide en douceur.
    //    « Oui » ne change RIEN (rafraîchit juste la date) ; « Non » → bascule vers Compléter/Enrichir.
    const cf=(typeof _pendingConfirm==='function')?_pendingConfirm():null;
    if(cf){
      el.style.padding='14px 14px 0';
      const ask=(typeof _confirmPromptOf==='function')?_confirmPromptOf(cf.field,cf.label):("C'est toujours d'actualité : "+cf.label+" ?");
      el.innerHTML='<div class="obs-card">'
        +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' — petite vérification 😊</div></div>'
        +'<div class="obs-txt">'+_obsEsc(ask)+'</div>'
        +'<div class="obs-btns">'
        +'<button class="obs-yes ft-press" onclick="confirmField(\''+cf.field+'\')">Oui, toujours</button>'
        +'<button class="obs-no ft-press" onclick="unconfirmField(\''+cf.field+'\')">Non, ça a changé</button>'
        +'</div>'
        +'<button class="gap-later ft-press" onclick="skipConfirm(\''+cf.field+'\')">Plus tard</button>'
        +'</div>';
      return;
    }
    // 6. Sinon, proposer une observation dérivée des données.
    try{if(typeof maybeProposeObservation==='function')maybeProposeObservation();}catch(e){}
    o=(typeof _pendingObs==='function')?_pendingObs():null;
  }
  if(!o){el.innerHTML='';el.style.padding='0';return;}
  el.style.padding='14px 14px 0';
  el.innerHTML='<div class="obs-card">'
    +'<div class="obs-head">'+avatar+'<div class="obs-lead">'+name+' a une petite question…</div></div>'
    +'<div class="obs-txt">'+_obsEsc(o.ask||o.text||'')+'</div>'
    +'<div class="obs-btns">'
    +'<button class="obs-yes ft-press" onclick="validateObs(\''+o.id+'\')">Oui, c\'est vrai</button>'
    +'<button class="obs-no ft-press" onclick="rejectObs(\''+o.id+'\')">Pas vraiment</button>'
    +'</div></div>';
}
// ─── État du jour (Dossier Athlète, brique 3B) — capture légère & optionnelle ───
// énergie du jour + douleurs du jour (zones). Ponctuel : repart à zéro chaque jour.
// Nourrit Milo (dosage) + le Gardien (protège une douleur DU JOUR en priorité).
// [zone, libellé, latéral?] — latéral = peut avoir un côté (gauche/droite/les deux).
const _DAY_ZONES=[['epaule','Épaule',1],['trapeze','Trapèze',1],['cervicales','Nuque',0],['pectoraux','Pectoraux',1],['dorsaux','Dorsaux',1],['biceps','Biceps',1],['triceps','Triceps',1],['avantbras','Avant-bras',1],['coude','Coude',1],['poignet','Poignet',1],['lombaires','Bas du dos',0],['abdos','Abdos',0],['hanche','Hanche',1],['fessier','Fessier',1],['cuisse','Cuisse',1],['ischio','Ischio',1],['adducteur','Adducteur',1],['genou','Genou',1],['mollet','Mollet',1],['cheville','Cheville',1]];
const _DAY_ENERGY=['😴','😐','🙂','⚡']; // 0=très fatigué → 3=plein d'énergie
const _DAY_MOOD=['😔','😕','🙂','😄'];   // 0=moral bas → 3=excellent moral (accompagnement, PAS un diagnostic — Constitution Principe 17)
function _dayZoneLat(z){const e=_DAY_ZONES.find(x=>x[0]===z);return e?!!e[2]:false;}
function _dayZoneLbl(z){const e=_DAY_ZONES.find(x=>x[0]===z);return e?e[1]:z;}
function _dayState(){
  const t=today();
  if(!S.dayState||S.dayState.date!==t)S.dayState={date:t,energy:null,mood:null,pains:[],note:''};
  return S.dayState;
}
// Historise le check-in du jour : upsert de S.dayState (aujourd'hui) dans S.dayStateLog, pour ne plus l'effacer chaque nuit (brique 7).
function _saveDayStateToLog(){
  const d=S.dayState;if(!d||!d.date)return;
  const empty=(d.energy==null&&d.mood==null&&!(d.pains&&d.pains.length)&&!(d.note&&d.note.trim()));
  S.dayStateLog=S.dayStateLog||[];
  const i=S.dayStateLog.findIndex(e=>e&&e.date===d.date);
  if(empty){ if(i>=0)S.dayStateLog.splice(i,1); return; } // jour vidé → on retire l'entrée
  const entry={date:d.date,energy:d.energy,mood:d.mood,pains:JSON.parse(JSON.stringify(d.pains||[])),note:d.note||''};
  if(i>=0)S.dayStateLog[i]=entry; else S.dayStateLog.push(entry);
  if(S.dayStateLog.length>800)S.dayStateLog=S.dayStateLog.slice(-800); // garde-fou taille (~2 ans)
}
function setDayEnergy(v){const d=_dayState();d.energy=(d.energy===v?null:v);_saveDayStateToLog();persist();_renderDayStateCard();try{_renderHomeHero();}catch(e){}}
function setDayMood(v){const d=_dayState();d.mood=(d.mood===v?null:v);_saveDayStateToLog();persist();_renderDayStateCard();} // moral : nourrit l'accompagnement de Milo, ne touche PAS au score de forme physique
function toggleDayPain(z){const d=_dayState();const i=(d.pains||[]).findIndex(p=>p&&p.zone===z);if(i>=0)d.pains.splice(i,1);else{d.pains=d.pains||[];d.pains.push({zone:z,side:_dayZoneLat(z)?'both':null});}_saveDayStateToLog();persist();_renderDayStateCard();try{_renderHomeHero();}catch(e){}}
function setDayPainSide(z,side){const d=_dayState();const p=(d.pains||[]).find(x=>x&&x.zone===z);if(!p)return;p.side=side;_saveDayStateToLog();persist();_renderDayStateCard();try{_renderHomeHero();}catch(e){}}
// Check-in du jour = sommeil + énergie/moral/douleur regroupés en UNE carte, repliée par défaut (désencombre l'Accueil).
// ⚠️ On regroupe l'AFFICHAGE, pas les logiques : le sommeil nourrit le score de récup, l'énergie/moral/douleur NON (ft-v472/473).
let _checkinOpen=false; // par session (non persisté)
function toggleCheckin(){_checkinOpen=!_checkinOpen;_renderDayStateCard();try{if(typeof renderLogSleep==='function')renderLogSleep();}catch(e){}}
/* ⤴️ REPLIER LE CHECK-IN APRÈS AVOIR ENREGISTRÉ (18/08/2026, retour Michel : « le check-in du
   jour ne se ferme pas quand on a enregistré »). Le bouton « Enregistrer » du sommeil est le
   DERNIER élément de la carte : une fois qu'on l'a touché, on a fini de la remplir. Elle se
   replie donc sur son résumé, comme si on avait tapé le chevron.
   ⚠️ Rien d'autre ne ferme la carte : l'énergie, le moral et les douleurs sont des boutons à
   un appui (aucun « enregistrer »), et on peut vouloir en toucher plusieurs à la suite. */
function closeCheckin(){ if(!_checkinOpen)return; _checkinOpen=false; _renderDayStateCard();
  try{ if(typeof renderLogSleep==='function')renderLogSleep(); }catch(e){} }
function _checkinSummary(){
  const d=_dayState();
  const ts=(S.sleepLog||[]).find(e=>e.date===today());
  const nPain=(d.pains||[]).length;
  if(d.energy==null&&d.mood==null&&!(ts&&ts.hours)&&!nPain)return ''; // rien renseigné → invite complète
  const parts=[(ts&&ts.hours)?('😴 '+ts.hours+'h'):'😴 à noter'];
  if(d.energy!=null)parts.push(_DAY_ENERGY[d.energy]+' énergie');
  if(d.mood!=null)parts.push(_DAY_MOOD[d.mood]+' moral');
  let s=parts.join(' · ');
  if(nPain)s+='  ·  ⚠️ '+nPain+' gêne'+(nPain>1?'s':'');
  return s;
}
// ── Les 3 tuiles du check-in replié (ft-v650, conception Michel) ────────────
// Une icône + 4 traits de niveau, dans la couleur de l'icône. Remplace le résumé
// en texte : on lit son état d'un coup d'œil, sans lire.
// ⚠️ 4 traits et pas 5 : les trois échelles de l'app ont 4 niveaux (sommeil
// Mauvais→Excellent, énergie 😴→⚡, moral 😔→😄). Un 5e trait qui ne se remplit
// jamais donne l'impression qu'il manque toujours quelque chose.
const _CK_LIT='<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="CUR" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 16h20"/><path d="M6 10V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/></svg>';
const _CK_ECL='<svg width="23" height="23" viewBox="0 0 24 24" fill="CUR" stroke="none"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg>';
function _ckVisage(c,niv){
  const bouche = niv==null ? '<path d="M8.4 15h7.2"/>'
    : niv>=2 ? '<path d="M8 14.6a5 5 0 0 0 8 0"/>'
    : niv===1 ? '<path d="M8.4 15h7.2"/>'
    : '<path d="M8 16a5 5 0 0 1 8 0"/>';
  return '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.9" stroke-linecap="round">'
    +'<circle cx="12" cy="12" r="9.2"/><circle cx="8.8" cy="10" r=".9" fill="'+c+'" stroke="none"/>'
    +'<circle cx="15.2" cy="10" r=".9" fill="'+c+'" stroke="none"/>'+bouche+'</svg>';
}
function _ckTuile(ico,coul,niv,val,lgd){
  // niv = 0..3 (ou null si rien noté) -> niv+1 traits allumés.
  // Le relief vit dans style.css (.ck-b / .ck-ico / .ck-tuile) : --ck porte la couleur.
  const n = niv==null ? 0 : Math.max(0,Math.min(4,niv+1));
  let j=''; for(let i=0;i<4;i++) j+='<i class="ck-b'+(i<n?' on':'')+'"></i>';
  return '<div class="ck-tuile" style="--ck:'+coul+';'+(niv==null?'':'--ck-glow:'+coul+';')+'">'
    +'<div class="ck-ico">'+ico+'</div>'
    +'<div style="display:flex;gap:3px;">'+j+'</div>'
    +'<div style="font-size:11px;font-weight:700;color:'+(niv==null?'var(--t3)':coul)+';white-space:nowrap;">'+val+'</div>'
    +'<div style="font-size:9.5px;color:var(--t3);letter-spacing:.06em;text-transform:uppercase;font-weight:700;">'+lgd+'</div>'
    +'</div>';
}
function _ckTuiles(){
  const d=_dayState();
  const ts=(S.sleepLog||[]).find(e=>e.date===today());
  // Sommeil : le NIVEAU vient de la qualité (1-4), la valeur affichée reste les heures.
  const q = (ts&&ts.quality) ? ts.quality-1 : null;
  const vSom = (ts&&ts.hours) ? (String(ts.hours).replace('.',',')+' h') : '—';
  const cSom = q==null ? 'var(--t3)' : 'var(--purp)';
  // Moral : la couleur porte le sens (vert content · ambre moyen · rouge bas).
  const cMor = d.mood==null ? 'var(--t3)' : d.mood>=2 ? 'var(--green)' : d.mood===1 ? 'var(--gold)' : 'var(--red)';
  const lblMor=['Bas','Moyen','Bien','Content'], lblEne=['Faible','Basse','Bonne','Au top'];
  return '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:11px;">'
    + _ckTuile(_CK_LIT.replace(/CUR/g,cSom), 'var(--purp)', q, vSom, 'Sommeil')
    + _ckTuile(_CK_ECL.replace(/CUR/g, d.energy==null?'var(--t3)':'var(--orange)'), 'var(--orange)',
               d.energy, d.energy==null?'—':lblEne[d.energy], 'Énergie')
    + _ckTuile(_ckVisage(cMor,d.mood), cMor, d.mood, d.mood==null?'—':lblMor[d.mood], 'Moral')
    +'</div>';
}
// ── Le check-in DÉPLIÉ parle le MÊME langage que les tuiles (ft-v661) ───────
// ⚠️ Retour Michel : « quand on rentre dedans ça reste avec des petits bonhommes,
// c'est pas en adéquation avec ce qu'on a modifié ». Le replié était passé en tuiles
// (icône + 4 traits + mot) et le déplié était resté sur des emojis avec, en prime, un
// contour ROUGE quel que soit le niveau choisi — donc « au top » s'allumait en rouge.
// On réutilise les MÊMES briques (_ckVisage, .ck-b, --ck) : zéro nouveau vocabulaire.
function _ckBarres(niv){
  let j=''; for(let i=0;i<4;i++) j+='<i class="ck-b'+(i<=niv?' on':'')+'"></i>';
  return '<div class="ck-opt-b">'+j+'</div>';
}
function _ckOpt(niv,sel,coul,visuel,mot,fn){
  return '<button class="ck-opt'+(sel?' on':'')+'" style="--ck:'+coul+';" '
    +'onclick="'+fn+'('+niv+')" aria-pressed="'+(sel?'true':'false')+'">'
    +visuel+'<span class="ck-opt-l">'+mot+'</span></button>';
}
function _renderDayStateCard(){
  const el=document.getElementById('home-daystate');if(!el)return;
  const d=_dayState();
  // La carte sommeil (#log-sleep) est la partie basse du check-in : visible uniquement quand le check-in est déplié.
  const sleepEl=document.getElementById('log-sleep');if(sleepEl)sleepEl.style.display=_checkinOpen?'':'none';
  if(!_checkinOpen){
    const sum=_checkinSummary();
    const nPain=((_dayState().pains)||[]).length;
    const chev='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>';
    el.innerHTML='<div class="ds-card" onclick="toggleCheckin()" style="cursor:pointer;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">'
      +'<div style="min-width:0;"><div class="ds-ttl" style="margin:0;">🌡️ Ton check-in du jour</div>'
      +(sum?'':'<div class="ds-sub" style="margin-top:4px;">Note ton énergie, ton moral et ton sommeil</div>')+'</div>'
      +chev+'</div>'
      +_ckTuiles()
      +(nPain?'<div style="margin-top:9px;font-size:11.5px;color:var(--gold);">⚠️ '+nPain+' gêne'+(nPain>1?'s':'')+' signalée'+(nPain>1?'s':'')+'</div>':'')
      +'</div>';
    return;
  }
  const painSet=new Set((d.pains||[]).map(p=>p&&p.zone));
  // Mêmes mots et mêmes couleurs que les tuiles du replié — une seule source de vérité.
  const _lblEne=['Faible','Basse','Bonne','Au top'], _lblMor=['Bas','Moyen','Bien','Content'];
  const _cMor=n=>n>=2?'var(--green)':n===1?'var(--gold)':'var(--red)';
  // Énergie : le niveau se lit aux TRAITS (l'éclair, lui, est dans le titre de la rangée).
  const enBtns=_lblEne.map((mot,i)=>
    _ckOpt(i, d.energy===i, 'var(--orange)', _ckBarres(i), mot, 'setDayEnergy')).join('');
  // Moral : c'est le VISAGE qui porte le sens, dans sa couleur (vert · ambre · rouge).
  const moBtns=_lblMor.map((mot,i)=>
    _ckOpt(i, d.mood===i, _cMor(i), _ckVisage(_cMor(i),i), mot, 'setDayMood')).join('');
  // Figurine anatomique cliquable (réutilise _mscSVG) : tape un muscle → il devient rouge.
  const bodyFig=(typeof _painFig==='function')?_painFig(painSet):'';
  // Articulations (pas des muscles) → boutons compacts sous la figurine.
  const _DAY_JOINTS=[['cervicales','Nuque'],['coude','Coude'],['poignet','Poignet'],['genou','Genou'],['cheville','Cheville']];
  const jBtns=_DAY_JOINTS.map(j=>'<button class="ds-z'+(painSet.has(j[0])?' on':'')+'" onclick="toggleDayPain(\''+j[0]+'\')">'+j[1]+'</button>').join('');
  // Côté (G/D/Les 2) — n'apparaît que pour les zones latérales sélectionnées.
  const latSel=(d.pains||[]).filter(p=>p&&_dayZoneLat(p.zone));
  let sideHtml='';
  if(latSel.length){
    const rows=latSel.map(p=>{
      const cur=p.side||'both';
      const b=(val,lbl)=>'<button class="ds-side'+(cur===val?' on':'')+'" onclick="setDayPainSide(\''+p.zone+'\',\''+val+'\')">'+lbl+'</button>';
      return '<div class="ds-siderow"><span class="ds-sidelbl">'+_dayZoneLbl(p.zone)+'</span>'+b('L','G')+b('R','D')+b('both','Les 2')+'</div>';
    }).join('');
    sideHtml='<div class="ds-sub" style="margin-top:11px;">Un côté en particulier ?</div>'+rows;
  }
  const chevOpen='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>';
  el.innerHTML='<div class="ds-card">'
    +'<div onclick="toggleCheckin()" style="display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;">'
    +'<div class="ds-ttl" style="margin:0;">🌡️ Ton check-in du jour <span class="ds-opt">(optionnel)</span></div>'
    +chevOpen+'</div>'
    +'<div class="ds-sub ds-sub-ic">'+_CK_ECL.replace(/CUR/g,'var(--orange)').replace('width="23" height="23"','width="15" height="15"')+'Ton énergie</div>'
    +'<div class="ds-row">'+enBtns+'</div>'
    +'<div class="ds-sub ds-sub-ic">'+_ckVisage('var(--t3)',null).replace('width="23" height="23"','width="15" height="15"')+'Ton moral</div>'
    +'<div class="ds-row">'+moBtns+'</div>'
    +'<div class="ds-sub">Une gêne ou douleur ? Tape le muscle sur le corps :</div>'
    +'<div style="max-width:230px;margin:6px auto 2px;">'+bodyFig+'</div>'
    +'<div class="ds-sub" style="margin-top:6px;">…ou une articulation :</div>'
    +'<div class="ds-zrow">'+jBtns+'</div>'
    +sideHtml
    +'<div class="ds-sub" style="margin-top:14px;opacity:.75;">💤 Ton sommeil de cette nuit est juste en dessous ⤵</div>'
    +'</div>';
}
// « Ce que Milo sait de toi » — liste des observations validées (supprimables)
function openMiloKnows(){
  const ov=document.getElementById('ov-milo-knows');if(!ov)return;
  _renderMiloKnows();ov.classList.add('open');
  try{_markAnchorSeen('menu-row-miloknows');}catch(e){} // le point rouge « nouveauté » disparaît une fois la rubrique ouverte
}
function closeMiloKnows(){const ov=document.getElementById('ov-milo-knows');if(ov)ov.classList.remove('open');}
// ─── PROFIL VIVANT — Brique « fiabilité par champ » : la PHRASE-BÉNÉFICE (docs/PROFIL-VIVANT.md) ───
// Choix de Michel : PAS de % ni de score — une phrase orientée BÉNÉFICE (« ce que Milo est capable de
// faire pour toi »), l'utilisateur ne doit JAMAIS se sentir évalué. Le niveau reflète l'ÉTENDUE de ce que
// Milo sait ; il ne fait que MONTER (high-water mark `S.registre.knowPeak`) → jamais punitif si tu effaces
// une info ou dis « ça a changé ». La fiabilité/fraîcheur par champ (qui, elle, décroît) reste INTERNE et
// ne sert qu'à piloter les questions (mode Confirmer) — jamais affichée.
const _MILO_LEVELS=[
  {min:0, phrase:'Milo apprend à te connaître',        sub:'Réponds à ses petites questions sur l\'Accueil — il te connaîtra un peu plus à chaque fois.'},
  {min:2, phrase:'Milo commence à bien te connaître',  sub:'Profil personnalisé.'},
  {min:4, phrase:'Milo te connaît bien',               sub:'Conseils personnalisés.'},
  {min:6, phrase:'Milo connaît très bien ton profil',  sub:'Conseils sur-mesure.'},
];
// Compte l'ÉTENDUE des connaissances (nb de choses importantes que Milo détient) — pas leur fraîcheur.
function _miloKnowledgeCount(){
  let n=0;
  const a=(S.coachQuiz&&S.coachQuiz.answers)||{};
  ['place','freq','time','othersport'].forEach(k=>{const v=a[k];if(v!==undefined&&v!==null&&v!=='')n++;}); // « aucun » (autre sport) = une info connue
  if(S.goal)n++;
  const hp=S.healthProfile||{};
  if((hp.injuries&&hp.injuries.length)||(hp.conditions&&hp.conditions.length)||(hp.notes&&String(hp.notes).trim()))n++;
  const obs=(typeof _validatedObs==='function')?_validatedObs():[];
  n+=obs.length;                                     // chaque chose confiée/confirmée compte
  return n;
}
// Niveau visible = basé sur le MAX jamais atteint (jamais de régression → règle « ça ne redescend jamais »).
function _miloKnowledgeLevel(){
  const n=_miloKnowledgeCount();
  let peak=(S.registre&&S.registre.knowPeak)||0;
  if(n>peak){ if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''}; S.registre.knowPeak=n; peak=n; try{persist();}catch(e){} }
  let lv=_MILO_LEVELS[0];
  for(const L of _MILO_LEVELS){ if(peak>=L.min)lv=L; }
  return lv;
}
function _renderMiloLevel(){
  const el=document.getElementById('milo-knows-level');if(!el)return;
  const lv=_miloKnowledgeLevel();
  el.innerHTML='<div class="mk-level">'
    +'<span class="mk-level-dot"></span>'
    +'<div class="mk-level-txt"><b>'+_obsEsc(lv.phrase)+'</b>'
    +(lv.sub?'<span class="mk-level-sub">'+_obsEsc(lv.sub)+'</span>':'')
    +'</div></div>';
}
// ─── PROFIL VIVANT — Brique 2 : « Milo a appris récemment » (docs/PROFIL-VIVANT.md) ───
// Liste VIVANTE des dernières choses apprises, la + récente en haut. LIT le profil unique (observations
// validées + infos de base réellement apprises via S.registre.learnedAt) — ne stocke RIEN de neuf
// (respecte « le profil vivant = source de vérité »). Dates honnêtes : les vieux champs (lazy-init) n'ont
// pas de learnedAt → n'apparaissent pas avec une fausse date « aujourd'hui ».
function _relLearned(d){
  if(!d)return '';
  const days=Math.round((new Date(today())-new Date(d))/864e5);
  if(isNaN(days))return '';
  if(days<=0)return "aujourd'hui";
  if(days===1)return "hier";
  if(days<7)return "il y a "+days+" j";
  if(days<31)return "il y a "+Math.max(1,Math.round(days/7))+" sem";
  return "il y a "+Math.max(1,Math.round(days/30))+" mois";
}
function _recentLearnedItems(){
  const items=[];
  const a=(S.coachQuiz&&S.coachQuiz.answers)||{};
  const learned=(S.registre&&S.registre.learnedAt)||{};
  const lbl=(f,v)=>(typeof _confirmLabelOf==='function')?_confirmLabelOf(f,v):v;
  const OS=(typeof _OTHERSPORT_LBL!=='undefined')?_OTHERSPORT_LBL:{};
  const freqLbl=v=>(typeof _freqBucketLabel==='function')?_freqBucketLabel(v):(String(lbl('freq',v))+' fois');
  const phrase={
    place: v=>'Tu t\'entraînes plutôt en '+String(lbl('place',v)).toLowerCase(),
    freq:  v=>'Tu t\'entraînes '+freqLbl(v)+' par semaine',
    time:  v=>'Tes séances durent '+String(lbl('time',v)),          // le libellé contient déjà « ~ » (ex. « ~45 min »)
    othersport: v=>(v==='aucun')?'Pas d\'autre sport que la muscu':('Tu fais aussi du '+(OS[v]||'sport')),
  };
  ['place','freq','time','othersport'].forEach(f=>{
    const v=a[f]; if(v===undefined||v===null||v==='')return;
    if(!learned[f])return;                                   // pas de VRAIE date d'apprentissage → on n'invente pas
    items.push({text:phrase[f](v), date:learned[f]});
  });
  ((typeof _validatedObs==='function')?_validatedObs():[]).forEach(o=>{
    const t=(o.fact||o.ask||'').trim(); if(!t)return;
    items.push({text:t, date:o.validatedAt||''});
  });
  items.sort((x,y)=>String(y.date||'').localeCompare(String(x.date||'')));
  return items;
}
function _renderMiloRecent(){
  const el=document.getElementById('milo-knows-recent');if(!el)return;
  const items=_recentLearnedItems().slice(0,3);
  if(!items.length){el.innerHTML='';return;}
  el.innerHTML='<div class="mk-recent"><div class="mk-recent-hd">🧠 Milo a appris récemment</div>'
    +items.map(it=>'<div class="mk-recent-row"><span class="mk-recent-dot"></span>'
      +'<span class="mk-recent-txt">'+_obsEsc(it.text)+'</span>'
      +(it.date?'<span class="mk-recent-when">'+_obsEsc(_relLearned(it.date))+'</span>':'')
      +'</div>').join('')
    +'</div>';
}
function _renderMiloKnows(){
  _renderMiloLevel();
  _renderMiloRecent();
  const box=document.getElementById('milo-knows-list');if(!box)return;
  const list=(typeof _validatedObs==='function')?_validatedObs():[];
  if(!list.length){box.innerHTML='<div class="mk-empty">Milo n\'a encore rien retenu sur toi. Au fil de tes séances, il te posera de petites questions sur l\'Accueil — chaque fois que tu confirmes, il apprend à mieux te connaître. Rien n\'est mémorisé sans ton accord.</div>';return;}
  box.innerHTML=list.map(o=>'<div class="mk-row"><span class="mk-txt">'+_obsEsc(o.fact||o.ask||'')+'</span>'
    +'<button class="mk-del ft-press" onclick="deleteObs(\''+o.id+'\')" aria-label="Oublier"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>').join('');
}
function _openMiloChat(){
  try{goScreen('coach',document.getElementById('nb-coach'));}catch(e){}
}
// Tap sur la carte Milo : si la relance vise un écran précis (ex. Profil), on y va ; sinon → chat
function _miloCardTap(){
  const t=window._miloGoTarget;
  if(t==='setup'){ try{ (typeof openProfil==='function')?openProfil():goScreen('setup'); }catch(e){ try{goScreen('setup');}catch(_){} } return; }
  if(t){ try{goScreen(t);}catch(e){} return; }
  _openMiloChat();
}

// ─── STATUT TESTEUR FONDATEUR (récompense exclusive) ─────────
// Reconnaît les tout premiers testeurs (Christophe, Eline, Emma) via leur email.
function _isTester(){
  const e=(S.email||'').trim().toLowerCase();
  return !!e && typeof TESTER_EMAILS!=='undefined' && TESTER_EMAILS.indexOf(e)>=0;
}
// ─── (ANCIEN VERROU « BÊTA TESTEUR ») — OUVERT À TOUT LE MONDE depuis ft-v623 ───
// Réglage manuel des calories/macros, objectif « Perte de gras + muscle » (recomposition), « maxi » reps
// et pointeur Journal : longtemps réservés aux testeurs, désormais visibles pour TOUS (décision Michel).
// Le verrou reste une fonction (au lieu d'inliner `true`) pour ne pas avoir à rechercher tous les usages.
function _isNutriBeta(){ return true; }
// « Super testeur » (Christophe pour l'instant) : accès à l'Espace Testeur (analyse photos approfondie + boîte à idées).
function _isSuperTester(){
  const e=(S.email||'').trim().toLowerCase();
  return !!e && typeof SUPER_TESTER_EMAILS!=='undefined' && SUPER_TESTER_EMAILS.indexOf(e)>=0;
}
// Carte dorée « Testeur Fondateur » en haut de l'Accueil — visible RIEN QUE pour eux.
function _renderTesterCard(){
  const el=document.getElementById('home-tester');if(!el)return;
  if(!_isTester()){el.innerHTML='';el.style.padding='0';return;}
  el.style.padding='14px 14px 0';
  const first=((S.name||'').trim().split(/\s+/)[0]||'').replace(/[<>&]/g,'');
  const hi=first?first+', ':'';
  // Lien vers l'Espace Testeur (boîte à idées) pour TOUS les testeurs (le suivi photos y reste réservé aux super testeurs).
  const espace='<div class="tc-espace" onclick="openTesterSpace()"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Mon espace testeur privé →</div>';
  el.innerHTML='<div class="tester-card">'
    +'<div class="tc-star"><svg viewBox="0 0 24 24" width="24" height="24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1.2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>'
    +'<div style="flex:1;min-width:0;">'
    +'<div class="tc-ttl">Testeur Fondateur</div>'
    +'<div class="tc-msg">Merci '+hi+'d’avoir cru en Force Tracker dès le premier jour — cette appli existe aussi grâce à toi. <span class="tc-sign">— Michel</span></div>'
    +espace
    +'</div></div>';
}
function renderHome(){try{
  _renderTesterCard();
  _renderHomeHdr();
  _renderMiloCard();
  _renderObsCard();
  _renderDayStateCard();
  _renderHomeHero();
  if(typeof renderLogSleep==='function')renderLogSleep(); // sommeil du jour, juste sous le score de récup (déplacé de Séance → Accueil)
  const now=new Date();
  const mo=S.sessions.filter(s=>{const d=new Date(s.date+'T12:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const vol=mo.reduce((a,s)=>a+(_workVol(s)||s.volume||0),0);
  const b3=BIG3.map(e=>S.prs[e]?S.prs[e].rm1:0).reduce((a,b)=>a+b,0);
  const latestW=S.weightLog&&S.weightLog.length?S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0]:null;
  const bwDisp=latestW?latestW.kg:(S.bw||'—');
  const volDisp=vol>9999?(Math.round(vol/100)/10)+'k':Math.round(vol);
  const statsEl=document.getElementById('home-stats');
  // Restylage maquette : grille 2×2 de cartes (icône + chiffre + label) — mêmes données, mêmes clics
  const _sc=(oc,ic,icBg,icStroke,valHtml,label)=>'<div'+(oc?' onclick="'+oc+'" style="cursor:pointer;':' style="')+'background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px var(--sep);padding:14px;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:space-between;gap:10px;">'
    +'<div style="width:34px;height:34px;border-radius:10px;background:'+icBg+';display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="'+icStroke+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+ic+'</svg></div>'
    +'<div style="text-align:right;min-width:0;">'
    +'<div style="font-family:var(--font-cond);font-size:22px;font-weight:800;line-height:1;">'+valHtml+'</div>'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--t3);margin-top:5px;white-space:nowrap;">'+label+'</div></div></div>';
  const _moName=now.toLocaleDateString('fr-FR',{month:'long'});
  if(statsEl)statsEl.innerHTML='<div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 3px 9px;"><span style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.16em;color:var(--t3);">CE MOIS</span><span style="font-size:12.5px;color:var(--t3);text-transform:capitalize;">'+_moName+'</span></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
    +_sc("goScreen('progress',document.getElementById('nb-progress'))",'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>','rgba(255,106,115,.14)','var(--red)','<span id="h-vol" style="color:var(--t1)">'+volDisp+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Volume')
    +_sc("goScreen('progress',document.getElementById('nb-progress'))",'<path d="M6 12h12M4 9v6M8 8v8M16 8v8M20 9v6"/>','rgba(234,179,8,.14)','var(--gold)','<span id="h-big3" style="color:var(--orange)">'+(b3>0?Math.round(b3):'—')+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Force · Squat+DC+SDT')
    +_sc("goSessionsHistory()",'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','rgba(168,85,247,.14)','var(--purp)','<span id="h-sess" style="color:var(--t1)">'+mo.length+'</span>','Séances ce mois')
    +_sc("goWeightTab()",'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9.5a3 3 0 0 1 6 0"/><line x1="12" y1="9.5" x2="13.8" y2="8"/>','rgba(91,168,255,.14)','#5BA8FF','<span id="h-bw" style="color:var(--t1)">'+fmt(bwDisp)+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Poids de corps')
    +'</div>';
  // Calendrier mensuel (remplace cycle de force / niveau / records sur l'Accueil — chantier feat/accueil-calendrier)
  _renderHomeCalendar();
  updatePill();
}catch(e){console.error('[FT] renderHome:',e);}}

// ─── CALENDRIER MENSUEL (Accueil) ───────────────────────────────────────────
let _calDate=new Date();      // mois affiché (1er du mois)
let _calZoomWeek=null;         // null = vue mois ; sinon index (0-5) de la semaine zoomée
function _calPad(n){return (n<10?'0':'')+n;}
function _calYmd(d){return d.getFullYear()+'-'+_calPad(d.getMonth()+1)+'-'+_calPad(d.getDate());}
function _calSessLabel(s){ if(!s)return 'Séance'; if(s.progLabel)return s.progLabel; return 'Séance'; }
// Jours où au moins une série a battu un record (même règle que le popup PR :
// 1er passage d'un exo OU 1RM > meilleur précédent ; W/É exclus). Rejoue tout
// l'historique dans l'ordre chronologique pour trouver ces jours.
function _calPrDays(){
  const best={}, prDays={};
  const arr=(S.sessions||[]).filter(s=>s&&s.date).slice()
    .sort((a,b)=>((a.ts||Date.parse(a.date)||0)-(b.ts||Date.parse(b.date)||0)));
  arr.forEach(s=>{(s.exs||[]).forEach(ex=>{(ex.sets||[]).forEach(st=>{
    if(!st.done||!st.kg||!st.reps||st.type==='É'||st.type==='W')return;
    const rm=st.rm1||bz(st.kg,st.reps);
    if(best[ex.name]===undefined||rm>best[ex.name]){best[ex.name]=rm;prDays[s.date]=true;}
  });});});
  return prDays;
}
// ─── CALENDRIER v2 : volume, région travaillée, jour sélectionné ──────────
let _calSelDay=null;   // ymd du jour ouvert dans le panneau de détail (null = aucun)

// Volume (kg × reps) d'une séance — mêmes exclusions que les PR : séries non faites, É (échauffement), W
function _calSessVol(s){
  let v=0;
  (s.exs||[]).forEach(ex=>{(ex.sets||[]).forEach(st=>{
    if(!st.done||!st.kg||!st.reps||st.type==='É'||st.type==='W')return;
    v+=st.kg*st.reps;
  });});
  return v;
}
function _calVolByDay(){
  const o={};
  (S.sessions||[]).forEach(s=>{if(s&&s.date)o[s.date]=(o[s.date]||0)+_calSessVol(s);});
  return o;
}
// Régions définies sur les CLÉS de _MG (stables) — surtout PAS sur les libellés français
// ('Grand dorsal' ne contient pas « dos », 'Deltoïdes' ne contient pas « épaule »).
// ⚠️ Les ÉRECTEURS DU RACHIS (lower-back) sont classés en GAINAGE, pas en « dos » (ft-v665).
// C'est le vocabulaire des références du domaine : au squat ils ont un « rôle stabilisateur et
// participent du gainage », ils travaillent en ISOMÉTRIE pour maintenir l'angle du buste — ils ne
// sont pas un muscle « travaillé » comme les dorsaux. Les garder dans « dos » faisait lire
// « 15 % dos » après une séance de jambes, ce qui n'a pas de sens pour le sportif (retour Michel).
// ⚠️ Nuance assumée : au SOULEVÉ DE TERRE les érecteurs sont bien moteurs, pas stabilisateurs —
// notre modèle ne distingue pas le rôle selon l'exercice. Vérifié : la couleur du calendrier ne
// change sur AUCUN des 9 archétypes (le soulevé reste « full body »).
const _CAL_REGIONS={
  haut: ['pec','front-delt','side-delt','triceps'],
  dos:  ['lats','traps','rear-delt','biceps','forearms','forearm-ext'],
  bas:  ['quads','hamstrings','glutes','calves','soleus','hip-flexors','adductors','tibialis'],
  tronc:['abs','obliques','serratus','lower-back']
};
const _CAL_REGION_COLOR={haut:'var(--red)',dos:'var(--blue)',bas:'var(--purp)',tronc:'var(--orange)',full:'var(--green)'};
const _calColorCache={};   // _mscScores est coûteux et le calendrier se redessine à chaque flèche
// ⚠️ SOURCE DE VÉRITÉ UNIQUE de « à quelle région appartient cette séance ? » (ft-v663).
// Le calendrier s'en sert pour la COULEUR, la carte de Milo pour DIRE ce qu'il voit.
// Renvoie 'haut'|'dos'|'bas'|'tronc'|'full' — ou **null quand on ne sait pas**
// (exercice perso ou importé que le moteur ne reconnaît pas : il rend {}).
// Ne JAMAIS remplacer ce null par une valeur par défaut : dire « bas du corps » à tort
// est pire que ne rien dire.
function _calSessMix(s){
  if(!s||!s.date)return null;
  // ⚠️ la clé doit tenir compte de TOUS les exercices : deux séances du même jour avec
  // le même nombre d'exos et le même premier exo partageraient sinon la même couleur
  // (trouvé par CAL-003 : « Squat + DC + Rowing » héritait de la couleur de « Squat + Presse + Leg Curl »).
  const key=s.date+'|'+(s.exs||[]).map(e=>(e&&e.name)||'').join('~');
  if(key in _calColorCache)return _calColorCache[key];
  let mix=null;
  try{
    if(typeof _mscScores==='function'){
      const sc=(_mscScores(s.exs||[])||{}).sc||{};
      const tot={haut:0,dos:0,bas:0,tronc:0}; let grand=0;
      for(const g in sc){
        for(const r in _CAL_REGIONS){
          if(_CAL_REGIONS[r].indexOf(g)>=0){tot[r]+=sc[g];grand+=sc[g];break;}
        }
      }
      if(grand>0){
        // Full body = le HAUT du corps ET le BAS sont tous deux vraiment sollicités.
        // ⚠️ Ne PAS se fier à « aucune région ne domine » : le bas du dos et les avant-bras
        // s'allument à chaque squat ou rowing, ce qui gonfle artificiellement la région « dos ».
        // Le critère haut/bas, lui, sépare proprement les 7 archétypes (voir CAL-003).
        const hautCorps=(tot.haut+tot.dos)/grand, basCorps=tot.bas/grand;
        let reg;
        if(hautCorps>=.25&&basCorps>=.25)reg='full';
        else{
          let best='',bv=0;for(const r in tot){if(tot[r]>bv){bv=tot[r];best=r;}}
          reg=best||null;
        }
        // La RÉPARTITION en % (ft-v664) : Michel trouvait « plutôt bas du corps » flou —
        // « ça fait genre il ne connaît pas l'anatomie ». On a le chiffre exact, autant le dire.
        const pc={}; for(const r in tot) pc[r]=Math.round(tot[r]/grand*100);
        if(reg) mix={reg:reg,pc:pc};
      }
    }
  }catch(e){ mix=null; }
  _calColorCache[key]=mix;
  return mix;
}
function _calSessRegion(s){ const m=_calSessMix(s); return m?m.reg:null; }
function _calSessColor(s){
  // Le calendrier a toujours besoin d'UNE couleur : faute de mieux, le rouge par défaut.
  const r=_calSessRegion(s);
  return (r&&_CAL_REGION_COLOR[r])||'var(--red)';
}
// Répartition lisible : « 86 % bas du corps · 14 % dos ». Rend '' si on ne sait pas.
// ⚠️ On n'affiche pas les régions sous 8 % : à ce niveau c'est du bruit de mesure,
// et une ligne à rallonge se lit moins bien qu'un chiffre net.
// Vocabulaire aligné sur les références du domaine (ft-v665) : « moteurs » vs
// « stabilisateurs ». Le tronc (abdos, obliques, érecteurs) = le GAINAGE.
const _REG_LBL={bas:'bas du corps',haut:'haut du corps',dos:'dos',tronc:'gainage'};
function _calSessMixTxt(s){
  const m=_calSessMix(s); if(!m||!m.pc)return '';
  return Object.keys(m.pc).map(r=>[r,m.pc[r]]).filter(e=>e[1]>=8)
    .sort((a,b)=>b[1]-a[1]).slice(0,3)
    .map(e=>e[1]+' % '+(_REG_LBL[e[0]]||e[0])).join(' · ');
}
function _calFmtT(kg){return (kg/1000).toFixed(1).replace('.',',')+'t';}
// N° de semaine ISO (formule standard, en UTC pour ne pas se faire piéger par l'heure d'été)
function _calIsoWeek(monday){
  const d=new Date(Date.UTC(monday.getFullYear(),monday.getMonth(),monday.getDate()));
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const y0=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d-y0)/864e5)+1)/7);
}
// Fond d'une case. La 1re ligne est le repli si color-mix n'est pas supporté (vieux Safari) :
// la 2e l'écrase quand il l'est. Avec color-mix, le rouge éclaircit en sombre et fonce en clair.
function _calHeatBg(ratio){
  const pct = ratio<.40 ? 20 : ratio<.70 ? 36 : 55;
  return 'background:rgba(255,45,85,'+(pct/260).toFixed(2)+');'
        +'background:color-mix(in srgb, var(--red) '+pct+'%, var(--bg2));';
}
function _calSelect(ymd){
  _calSelDay=(_calSelDay===ymd?null:ymd);
  _renderHomeCalendar();
}
function _renderHomeCalendar(){
  const el=document.getElementById('home-secondary');if(!el)return;
  const sessSet={};(S.sessions||[]).forEach(s=>{if(s&&s.date)sessSet[s.date]=(sessSet[s.date]||0)+1;});
  const prSet=_calPrDays();
  const y=_calDate.getFullYear(), m=_calDate.getMonth();
  const todayY=_calYmd(new Date());
  const moName=_calDate.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const weeks=_calWeeksFor(y,m);
  // Flèches : en vue MOIS → change de mois ; en vue SEMAINE → change de semaine (fix Michel).
  const navBtn=(dir,txt)=>'<button onclick="_calArrow('+dir+')" style="width:34px;height:34px;border-radius:9px;border:none;background:var(--bg3);color:var(--t1);font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">'+txt+'</button>';
  let html='<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px var(--sep);padding:14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
      +navBtn(-1,'‹')
      +'<span style="font-weight:800;font-size:15px;color:var(--t1);text-transform:capitalize;">📅 '+moName+'</span>'
      +navBtn(1,'›')
    +'</div>';
  if(_calZoomWeek===null){
    const volByDay=_calVolByDay();
    let maxVol=0;
    weeks.forEach(wk=>wk.forEach(c=>{if(c.inMonth){const v=volByDay[_calYmd(c.d)]||0;if(v>maxVol)maxVol=v;}}));

    html+='<div style="display:grid;grid-template-columns:26px repeat(7,1fr);gap:3px;">';
    html+='<div></div>'+['L','M','M','J','V','S','D']
      .map(w=>'<div style="text-align:center;font-size:10.5px;color:var(--t3);font-weight:700;letter-spacing:.06em;">'+w+'</div>').join('');

    weeks.forEach((wk,wi)=>{
      const wVol=wk.reduce((a,c)=>a+(volByDay[_calYmd(c.d)]||0),0);
      const wSess=wk.filter(c=>sessSet[_calYmd(c.d)]).length;   // une séance au poids du corps pèse 0 kg : ce n'est PAS du repos
      html+='<div onclick="_calZoom('+wi+')" class="ft-press" style="display:flex;flex-direction:column;justify-content:center;gap:2px;cursor:pointer;">'
        +'<span style="font-family:var(--font-cond);font-size:11.5px;font-weight:700;color:var(--t3);line-height:1;">S'+_calIsoWeek(wk[0].d)+'</span>'
        +'<span style="font-size:8.5px;font-weight:700;line-height:1;color:'+(wSess?'var(--red)':'var(--t3)')+';">'
          +(wSess?(wVol?_calFmtT(wVol):wSess+'×'):'repos')+'</span>'
        +'</div>';

      wk.forEach(c=>{
        const ymd=_calYmd(c.d), num=c.d.getDate();
        const vol=volByDay[ymd]||0, has=!!sessSet[ymd];
        const isPr=has&&prSet[ymd], isToday=ymd===todayY, isSel=ymd===_calSelDay;
        const sess=has?(S.sessions||[]).find(s=>s.date===ymd):null;
        const rat=maxVol?vol/maxVol:0;

        let st='position:relative;min-height:46px;display:flex;flex-direction:column;align-items:center;'
             +'justify-content:center;gap:5px;border-radius:var(--r-sm);';
        if(!c.inMonth)      st+='color:var(--t3);opacity:.35;';
        else if(has)        st+=_calHeatBg(rat)+'cursor:pointer;';
        else                st+='box-shadow:inset 0 0 0 1px var(--sep);';
        if(isToday)         st+='outline:1.5px solid var(--red2);outline-offset:-1.5px;';
        if(isSel)           st+='outline:2px solid var(--t1);outline-offset:2px;';

        html+='<div'+(has?' onclick="_calSelect(\''+ymd+'\')" class="ft-press"':'')+' style="'+st+'">'
          +(isPr?'<span style="position:absolute;top:3px;right:4px;line-height:0;">'
                +'<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg></span>':'')
          +'<span style="font-family:var(--font-cond);font-size:16px;font-weight:800;line-height:1;color:'
            +(c.inMonth?'var(--t1)':'var(--t3)')+';">'+num+'</span>'
          +(has?'<span style="width:'+(10+Math.round(9*rat))+'px;height:3px;border-radius:2px;background:'+_calSessColor(sess)+';"></span>'
               :(isToday?'<span style="font-size:7.5px;font-weight:800;letter-spacing:.06em;line-height:1;color:var(--red);">AUJ</span>':''))
          +'</div>';
      });
    });
    html+='</div>';

    html+='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 11px;margin-top:11px;font-size:9.5px;font-weight:600;color:var(--t3);">'
      +'<span style="display:flex;align-items:center;gap:4px;">Volume'
        +'<span style="width:12px;height:12px;border-radius:4px;background:rgba(255,45,85,.08);background:color-mix(in srgb,var(--red) 20%,var(--bg2));"></span>'
        +'<span style="width:12px;height:12px;border-radius:4px;background:rgba(255,45,85,.14);background:color-mix(in srgb,var(--red) 36%,var(--bg2));"></span>'
        +'<span style="width:12px;height:12px;border-radius:4px;background:rgba(255,45,85,.21);background:color-mix(in srgb,var(--red) 55%,var(--bg2));"></span></span>'
      +[['var(--red)','Haut'],['var(--blue)','Dos'],['var(--purp)','Bas'],['var(--orange)','Tronc'],['var(--green)','Full']]
        .map(g=>'<span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:3px;border-radius:2px;background:'+g[0]+';"></span>'+g[1]+'</span>').join('')
      +'<span style="display:flex;align-items:center;gap:4px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>Record</span>'
      +'</div>';

    html+=_calDayPanel(volByDay,prSet);

    html+='<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:8px;">'
      +(_calSelDay?'Tape le n° de semaine à gauche pour la voir en entier'
                  :'Tape un jour pour voir la séance · le n° de semaine pour la semaine entière')
      +'</div>';
  }else{
    const wk=weeks[_calZoomWeek]||[];
    html+='<button onclick="_calZoom(null)" style="width:100%;padding:8px;margin-bottom:8px;border:none;border-radius:9px;background:var(--bg3);color:var(--blue);font-weight:700;font-size:12px;cursor:pointer;touch-action:manipulation;">‹ Retour au mois</button>';
    wk.forEach(c=>{
      const ymd=_calYmd(c.d), isToday=ymd===todayY, isPr=prSet[ymd];
      const daySess=(S.sessions||[]).filter(s=>s.date===ymd);
      const dow=c.d.toLocaleDateString('fr-FR',{weekday:'short'});
      const ctx=_calDayContext(ymd);
      html+='<div onclick="'+(daySess.length?'goSessionsHistory()':'')+'" style="display:flex;align-items:center;gap:10px;padding:10px 6px;border-bottom:1px solid var(--sep);'+(isToday?'background:rgba(255,45,85,.06);':'')+(daySess.length?'cursor:pointer;':'')+'">'
        +'<div style="width:44px;text-align:center;flex-shrink:0;"><div style="font-size:10px;color:var(--t3);text-transform:capitalize;">'+dow+'</div><div style="font-size:17px;font-weight:800;color:'+(c.inMonth?'var(--t1)':'var(--t3)')+';">'+c.d.getDate()+'</div></div>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="font-size:12.5px;'+(daySess.length?'color:var(--t1);font-weight:600;':'color:var(--t3);')+'">'+(daySess.length?('💪 '+_escFood(daySess.map(_calSessLabel).join(', '))+(isPr?' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--gold);vertical-align:-1px;"></span> <span style="color:var(--gold);font-weight:800;">Record !</span>':'')):'Repos')+'</div>'
          +ctx
        +'</div>'
        +(daySess.length?'<span style="font-size:11px;color:var(--red);font-weight:700;flex-shrink:0;align-self:flex-start;margin-top:2px;">'+daySess.length+'×</span>':'')
        +'</div>';
    });
  }
  html+='</div>';
  el.innerHTML=html;
}
// Détail du jour sélectionné, sous la grille. Réutilise _calDayContext (sommeil/moral/douleur).
function _calDayPanel(volByDay,prSet){
  if(!_calSelDay)return '';
  const sess=(S.sessions||[]).filter(s=>s&&s.date===_calSelDay);
  if(!sess.length)return '';
  const d=new Date(_calSelDay+'T12:00:00');
  const titre=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  const vol=volByDay[_calSelDay]||0;
  let sets=0,exs=0;
  sess.forEach(s=>{(s.exs||[]).forEach(ex=>{exs++;(ex.sets||[]).forEach(st=>{if(st.done&&st.type!=='É'&&st.type!=='W')sets++;});});});
  const isPr=!!(prSet||{})[_calSelDay];
  const cell=(v,l)=>'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">'
    +'<span style="font-family:var(--font-cond);font-size:16px;font-weight:800;color:var(--t1);line-height:1;">'+v+'</span>'
    +'<span style="font-size:8px;font-weight:700;letter-spacing:.08em;color:var(--t3);">'+l+'</span></div>';
  const sep='<div style="width:1px;background:var(--sep);"></div>';
  return '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--sep);">'
    +'<div style="display:flex;align-items:center;gap:9px;margin-bottom:10px;">'
      +'<span style="width:8px;height:8px;border-radius:3px;flex:none;background:'+_calSessColor(sess[0])+';"></span>'
      +'<span style="font-family:var(--font-cond);font-size:16px;font-weight:800;color:var(--t1);line-height:1;text-transform:capitalize;">'+titre+'</span>'
      +'<span style="flex:1;"></span>'
      +(isPr?'<span style="font-size:9.5px;font-weight:800;letter-spacing:.06em;color:var(--bg);background:var(--gold);border-radius:5px;padding:3px 7px;line-height:1;">RECORD</span>':'')
    +'</div>'
    +'<div style="font-size:12.5px;font-weight:600;color:var(--t2);margin-bottom:10px;">'+_escFood(sess.map(s=>_calSessLabel(s)).join(', '))+'</div>'
    +'<div style="display:flex;background:var(--bg3);border-radius:var(--r-sm);padding:9px 0;">'
      +cell(vol?_calFmtT(vol):'—','TONNAGE')+sep+cell(sets,'SÉRIES')+sep+cell(exs,'EXOS')
    +'</div>'
    +_calDayContext(_calSelDay)
    +'<div onclick="goSessionsHistory()" class="ft-press" style="margin-top:11px;height:42px;border-radius:var(--r);background:var(--bg3);display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;">'
      +'<span style="font-size:13px;font-weight:700;color:var(--t1);">Revoir la séance</span>'
      +'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t1)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
    +'</div></div>';
}
// Contexte d'un jour dans le calendrier (brique 7) : sommeil + humeur/énergie + douleur, s'ils ont été notés ce jour-là.
function _calDayContext(ymd){
  const parts=[];
  const sl=(S.sleepLog||[]).find(e=>e&&e.date===ymd);
  if(sl&&sl.hours)parts.push('😴 '+sl.hours+'h');
  const ds=(S.dayStateLog||[]).find(e=>e&&e.date===ymd);
  if(ds){
    if(ds.energy!=null&&_DAY_ENERGY[ds.energy])parts.push(_DAY_ENERGY[ds.energy]);
    if(ds.mood!=null&&_DAY_MOOD[ds.mood])parts.push(_DAY_MOOD[ds.mood]);
    if(ds.pains&&ds.pains.length)parts.push('⚠️'+(ds.pains.length>1?ds.pains.length:''));
  }
  return parts.length?'<div style="font-size:11px;color:var(--t3);margin-top:2px;letter-spacing:.02em;">'+parts.join('&nbsp;&nbsp;')+'</div>':'';
}
// Grille de semaines (lundi→dimanche) d'un mois, avec les jours débordants des mois voisins.
function _calWeeksFor(y,m){
  const first=new Date(y,m,1);
  const startDow=(first.getDay()+6)%7;               // 0 = lundi
  const daysInMonth=new Date(y,m+1,0).getDate();
  const cells=[];
  for(let i=0;i<startDow;i++){cells.push({d:new Date(y,m,1-(startDow-i)),inMonth:false});}
  for(let day=1;day<=daysInMonth;day++){cells.push({d:new Date(y,m,day),inMonth:true});}
  while(cells.length%7!==0){const last=cells[cells.length-1].d;cells.push({d:new Date(last.getFullYear(),last.getMonth(),last.getDate()+1),inMonth:false});}
  const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  return weeks;
}
function _calNav(dir){_calDate=new Date(_calDate.getFullYear(),_calDate.getMonth()+dir,1);_calZoomWeek=null;_calSelDay=null;_renderHomeCalendar();}
// Navigation SEMAINE (vue zoomée) : ±7 jours, en traversant les mois si besoin. Le mois affiché suit le jeudi de la semaine (mois dominant).
function _calNavWeek(dir){
  const weeks=_calWeeksFor(_calDate.getFullYear(),_calDate.getMonth());
  const wk=weeks[_calZoomWeek];
  if(!wk){_calNav(dir);return;}
  const mon=wk[0].d;
  const newMon=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+dir*7);
  const thu=new Date(newMon.getFullYear(),newMon.getMonth(),newMon.getDate()+3); // jeudi = mois dominant (ISO)
  _calDate=new Date(thu.getFullYear(),thu.getMonth(),1);
  const nw=_calWeeksFor(thu.getFullYear(),thu.getMonth());
  let idx=nw.findIndex(w=>w.some(c=>_calYmd(c.d)===_calYmd(newMon)));
  _calZoomWeek=idx<0?0:idx;
  _calSelDay=null;
  _renderHomeCalendar();
}
// Dispatcher des flèches : mois si vue mois, semaine si vue zoomée.
function _calArrow(dir){ if(_calZoomWeek===null)_calNav(dir); else _calNavWeek(dir); }
function _calZoom(wi){_calZoomWeek=wi;_renderHomeCalendar();}

function updatePill(){
  const p=document.getElementById('sync-pill'),d=document.getElementById('sync-dot'),l=document.getElementById('sync-lbl');
  if(p){if(S.connected){p.className='sync-pill ok';if(d)d.style.background='var(--green)';if(l)l.textContent='Sheets ✓';}
  else{p.className='sync-pill';if(d)d.style.background='var(--t3)';if(l)l.textContent='Sheets';}}
  // Inline home pill
  const hp=document.getElementById('home-sheets-pill'),hd=document.getElementById('home-sync-dot'),hl=document.getElementById('home-sync-lbl');
  if(S.connected){
    if(hp){hp.style.background='rgba(52,211,153,.1)';hp.style.boxShadow='inset 0 0 0 1px rgba(52,211,153,.22)';}
    if(hd){hd.style.background='#34d399';hd.style.boxShadow='0 0 8px #34d399';}
    if(hl){hl.textContent='Sheets ✓';hl.style.color='#5be3b4';}
  }else{
    if(hp){hp.style.background='rgba(255,255,255,.06)';hp.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,.08)';}
    if(hd){hd.style.background='var(--t3)';hd.style.boxShadow='none';}
    if(hl){hl.textContent='Sheets';hl.style.color='var(--t2)';}
  }
}

// ─── NUTRITION SCREEN ────────────────────────────────────────
function setNuPhase(phase){
  S.nutritionPhase=phase; persist();
  document.getElementById('pb-charge').classList.toggle('active',phase==='charge');
  document.getElementById('pb-decharge').classList.toggle('active',phase==='decharge');
  renderNutrition();
}
// Régime cétogène (keto, retour Emma) : bascule les macros en 5% glucides / 15% prot / 80% lipides
// Un mode alimentaire à la fois : re-cliquer sur le mode actif le désactive (pas de piège).
// `S.keto` reste synchronisé — plusieurs endroits du code le lisent encore (rétrocompatibilité).
function setFoodMode(v){
  S.foodMode=(S.foodMode===v?'':v);
  S.keto=(S.foodMode==='keto');
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  renderNutrition();
}
function setFasting(v){
  S.fasting=(S.fasting===v?'':v);
  persist();
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  renderNutrition();
}
function toggleKeto(){ setFoodMode('keto'); }  // ancien nom : gardé, des raccourcis peuvent l'appeler


// ─── Réglage manuel des calories/macros (retour testeuse : « pouvoir corriger moi-même ») ──
function openKcalEdit(){
  const m=calcMacros(S.nutritionPhase);
  const inp=document.getElementById('kcal-edit-inp');
  if(inp)inp.value=m.calories;
  const auto=document.getElementById('kcal-edit-auto');
  if(auto)auto.textContent="Calcul auto de l'app : "+m.autoCalories.toLocaleString('fr-FR')+" kcal (d'après ton profil et ton objectif).";
  const reset=document.getElementById('kcal-edit-reset');
  if(reset)reset.style.display=m.isManual?'':'none';
  _kcalPreview();
  const o=document.getElementById('ov-kcal-edit');if(o)o.classList.add('open');
}
function _kcalPreview(){
  const inp=document.getElementById('kcal-edit-inp');
  const v=inp?Math.round(parseFloat(inp.value)||0):0;
  const mm=(typeof macrosForKcal==='function')?macrosForKcal(v):{prot_g:0,carbs_g:0,fat_g:0};
  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val+' g';};
  set('kcal-pv-prot',mm.prot_g);set('kcal-pv-carb',mm.carbs_g);set('kcal-pv-fat',mm.fat_g);
}
function saveKcalEdit(){
  const inp=document.getElementById('kcal-edit-inp');
  let v=inp?Math.round(parseFloat(inp.value)||0):0;
  if(!(v>0)){toast('Entre un nombre de calories valide','info');return;}
  v=Math.max(800,Math.min(6000,v));
  S.manualKcal=v;persist();closeKcalEdit();renderNutrition();
  toast('Objectif réglé sur '+v.toLocaleString('fr-FR')+' kcal ✅','success');
}
function resetKcalAuto(){
  S.manualKcal=0;persist();closeKcalEdit();renderNutrition();
  toast('Calories remises en automatique','info');
}
function closeKcalEdit(){const o=document.getElementById('ov-kcal-edit');if(o)o.classList.remove('open');}
/* ═══ « OÙ TU EN ES » — LA PREMIÈRE CHOSE QU'ON VOIT EN ARRIVANT (18/08/2026) ══════════════
   Michel, en expliquant pourquoi il n'utilise pas la nutrition de sa propre app : *« même moi
   ça me saoule de l'utiliser, c'est assez mal fait »* · *« ce n'est pas intuitif, je veux
   commencer la semaine prochaine pour voir où j'en suis, comment ça fonctionne »*.

   ⭐ LE DIAGNOSTIC N'EST PAS UN BUG, C'EST UNE QUESTION MAL POSÉE. L'écran répondait à
   « combien il te reste à manger aujourd'hui » — une question qui n'a de sens que si on a déjà
   tout noté. La vraie question en ouvrant l'app, c'est **« où j'en suis »**.

   ⚠️⚠️ LA RÈGLE QUI TIENT TOUT : **UNE SEMAINE INCOMPLÈTE PRODUIT UNE MOYENNE HONNÊTE.**
   On divise par le nombre de jours RÉELLEMENT notés, jamais par 7 — et on écrit combien il y en
   a. Diviser par 7 quand 3 jours sont notés affiche une sous-alimentation qui n'existe pas, et
   c'est exactement le genre de chiffre faux qui fait abandonner un suivi (P21 : la nutrition ne
   doit jamais devenir une source de stress).
   ⚠️ ET ON N'AFFICHE RIEN QUAND ON NE SAIT RIEN : zéro jour noté → une invitation, pas un
   « 0 / 2 600 kcal » qui ressemble à un reproche (R29 — on ne fait pas dire à une absence de
   donnée ce qu'elle ne dit pas). */
/* ⚠️ `sansAujourdhui` : la journée EN COURS n'entre pas dans la moyenne (19/08/2026).
   Trouvé par les deux relectures extérieures, et c'est le même défaut que le « /7 » corrigé la
   veille, simplement déplacé d'un cran : une journée où l'on n'a noté que le petit-déjeuner
   compte comme une journée entière et tire la moyenne vers le bas. Aujourd'hui est, par
   construction, une journée incomplète — la compter garantit un chiffre faux tous les matins. */
function _nutriJoursNotes(n, sansAujourdhui){
  const jours=[], vus={}, td=today();
  (S.foodLog||[]).forEach(e=>{ if(e&&e.date) vus[e.date]=1; });
  const d0=new Date();
  for(let i=0;i<n;i++){
    const d=new Date(d0.getTime()-i*864e5);
    const k=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().split('T')[0];
    if(vus[k] && !(sansAujourdhui && k===td)) jours.push(k);
  }
  return jours;
}
/* 🍽️ LA CARTE DU JOUR (26/08/2026, ft-v1025) — chantier `docs/MACROS-A.md`.
   ⭐ CE QU'ELLE RÈGLE, MESURÉ : il fallait 3,3 écrans pour savoir où on en est, et la cible du
   jour était écrite DEUX FOIS à 200 px d'écart. Elle est maintenant écrite une seule fois, en
   petit, et le gros chiffre est le RÉEL : ce qui a été mangé.
   ⛔⛔ TANT QUE RIEN N'EST NOTÉ, ELLE N'AFFICHE AUCUN CHIFFRE. Un « 0 / 3 144 » à 9 h du matin
   n'est pas une information, c'est un constat d'échec adressé à quelqu'un qui n'a pas encore
   déjeuné — c'est le défaut corrigé le 19/08 sur la carte de la semaine, et un témoin le tient
   depuis (LIII). *Un faux zéro se lit comme un vrai.*
   ⛔ AUCUN ROUGE D'ÉCHEC SUR UN DÉPASSEMENT (Constitution P21, anti-TCA) : les anneaux se
   remplissent jusqu'à 100 % et s'arrêtent, la ligne dit « un jour, pas une tendance ». Le rouge
   est réservé à ce qui est dangereux, jamais à ce qui est simplement au-dessus.
   ⛔ ET L'ÉCHELLE ROUGE→VERT DE L'ANNEAU DE RÉCUP N'EST PAS REPRISE : un anneau de protéines à
   47 % en début d'après-midi s'afficherait rouge alors que la journée n'est pas finie.
   ⚠️ LA TECHNIQUE EST CELLE DE LA BANDE DES 7 JOURS DU JOURNAL (SVG, ft-v1004), pas celle de
   l'anneau de récup — celui-là est en `conic-gradient` + masques (style.css), parce qu'il lui
   faut une couleur qui CHANGE le long de l'arc. Ici la couleur est fixe : le SVG suffit, et il
   se redimensionne sans recette. */
function _renderAujourdhui(macros){
  const el=document.getElementById('nu-today-body'); if(!el) return;
  const jour=document.getElementById('nu-today-day');
  if(jour){
    /* ⏰ À MIDI — la famille « fuseaux horaires » de BUGS.md : `new Date('2026-08-26')` est
       interprété en UTC et peut afficher la veille à Paris. */
    const d=new Date(today()+'T12:00:00');
    jour.textContent='Aujourd\'hui · '+d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric'});
  }
  const auj=(typeof _foodTotals==='function')?_foodTotals(today()):{kcal:0,prot:0,carbs:0,fat:0};
  const noteAuj=(S.foodLog||[]).some(e=>e&&e.date===today());
  /* ⛔ AUCUN CHIFFRE TANT QUE RIEN N'EST NOTÉ — mais pas une boîte vide non plus : un cadre sans
     rien dedans se lit comme un chargement qui n'a pas abouti. Une phrase, zéro nombre. */
  if(!noteAuj){
    el.innerHTML='<div style="font-size:12.5px;color:var(--t3);line-height:1.4;margin-top:8px;">Rien de noté pour l\'instant.</div>';
    return;
  }
  const cible=macros.calories||0;
  const mange=Math.round(auj.kcal);
  const reste=cible-mange;
  const pct=cible?Math.min(100,Math.round(mange/cible*100)):0;

  /* ⭕ Un anneau par macro. Circonférence = 2πr avec r=40, soit ≈ 251,3. Le trait part du haut
     (rotation -90°). Le tour de piste est PLUS LARGE que l'arc coloré : c'est ce qui donne la
     profondeur — pas une teinte inventée (leçon de l'anneau de récup, trois retours de Michel
     sur un gris qui ne se voyait pas sur un iPhone). */
  const anneau=(val,cib,lbl,coul)=>{
    const v=Math.round(val||0), c=Math.round(cib||0);
    const p=c?Math.min(100,v/c*100):0;
    const C=251.3, off=(C*(1-p/100)).toFixed(1);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;">'
      +'<div style="position:relative;width:92px;height:92px;">'
        +'<svg width="92" height="92" viewBox="0 0 92 92" style="display:block;transform:rotate(-90deg);">'
          +'<circle cx="46" cy="46" r="40" fill="none" stroke="var(--bg3)" stroke-width="8"/>'
          +(p>0?'<circle cx="46" cy="46" r="40" fill="none" stroke="'+coul+'" stroke-width="6"'
            +' stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'"/>':'')
        +'</svg>'
        +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">'
          +'<span style="font-family:var(--font-cond);font-size:22px;font-weight:900;color:var(--t1);line-height:1;">'+v+'</span>'
          +'<span style="font-size:9.5px;color:var(--t3);font-weight:700;margin-top:1px;">/ '+c+' g</span>'
        +'</div>'
      +'</div>'
      +'<span style="font-size:9.5px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">'+lbl+'</span>'
      +'</div>';
  };

  el.innerHTML=
     '<div style="display:flex;align-items:baseline;gap:7px;margin-top:8px;">'
      +'<span style="font-family:var(--font-cond);font-size:40px;font-weight:900;color:var(--t1);line-height:1;">'+mange.toLocaleString('fr-FR')+'</span>'
      +'<span style="font-size:12.5px;color:var(--t3);font-weight:700;">kcal mangées</span>'
    +'</div>'
    +'<div style="height:4px;border-radius:3px;background:var(--bg3);overflow:hidden;margin:10px 0 7px;">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--red2),var(--red));border-radius:3px;"></div></div>'
    /* ⛔ « Un jour, pas une tendance » n'est pas une politesse : c'est ce qui empêche de lire un
       dépassement comme un échec. La cohérence prime sur la réactivité (R12). */
    +'<div style="font-size:12.5px;color:var(--t2);">'
      +(reste>=0 ? reste.toLocaleString('fr-FR')+' kcal restantes'
                 : 'Cible dépassée de '+Math.abs(reste).toLocaleString('fr-FR')+' kcal. <span style="color:var(--t3);">Un jour, pas une tendance.</span>')
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);justify-items:center;gap:6px;margin-top:14px;padding-top:14px;border-top:1px solid var(--sep);">'
      +anneau(auj.prot ,macros.prot_g ,'Protéines','var(--green)')
      +anneau(auj.carbs,macros.carbs_g,'Glucides' ,'var(--orange)')
      +anneau(auj.fat  ,macros.fat_g  ,'Lipides'  ,'var(--gold)')
    +'</div>'
    /* 🍽️ « Ce qu'il te reste, en vrai » : le MÊME bloc que dans le Journal, un seul code (R2). */
    +(typeof _blocResteHTML==='function'?_blocResteHTML(today()):'');
}

/* 🍽️ CE QUE LE RESTE REPRÉSENTE VRAIMENT (26/08/2026, ft-v1019) — demande de Michel :
   *« à 14h, il te reste 150 g de prot à manger, tu peux faire 1 shake de prot et 150 g de
   poulet »*. ⭐⭐ Les chiffres du reste étaient DÉJÀ affichés, ligne par ligne — et ils ne
   servaient à rien : *personne ne sait à quoi ressemblent 150 g de protéines dans une
   assiette.* Ce qui manquait n'était pas la donnée, c'était sa TRADUCTION.
   ⛔ UN SEUL CODE POUR LES DEUX ONGLETS (ft-v1025, R2) : le Journal et la carte du jour
   l'affichent tous les deux, ils ne sont jamais visibles en même temps. Deux copies auraient
   divergé — on aurait corrigé un garde-fou anti-TCA d'un côté seulement.
   ⛔ AUJOURD'HUI SEULEMENT (anti-TCA, P21) : sur un jour passé, « il te manquait 40 g » est un
   reproche sur une journée qu'on ne peut plus changer. */
function _blocResteHTML(td, heure){
  if(td!==today()) return '';
  const reste=(typeof _resteDuJour==='function')?_resteDuJour(td):null;
  const idees=(typeof _ideesPourLeReste==='function')?_ideesPourLeReste(reste,heure):[];
  if(!idees.length) return '';
  /* ⛔ LE SOIR SE LIT SUR LES IDÉES, il ne se recalcule PAS ici (R2, ft-v1029) : deux lectures
     de l'horloge pourraient se contredire à la minute de bascule, et le pied de bloc dirait
     « il est tard » sous une combinaison de 500 g. Un seul propriétaire, `_estLeSoir`. */
  const soir=!!(idees[0]&&idees[0].soir);
  const cols={prot:'var(--green)',carbs:'var(--orange)',fat:'var(--gold)'};
  return '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--sep);">'
    +'<div style="font-size:11.5px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Ce qu\'il te reste, en vrai</div>'
    /* ⛔⛔ DEUX COLONNES FIXES, PLUS TROIS BOÎTES QUI SE POUSSENT (ft-v1031). En flex, la
       largeur de « 429 g » et celle de « 86 g » ne sont pas les mêmes, donc TOUT ce qui suit
       se décalait : mesuré, l'idée démarrait à 125, 147 et 152 px sur trois lignes voisines —
       27 px d'écart. *Un manque et son idée se lisent en colonne : ils doivent commencer au
       même endroit.* Le manque et sa macro tiennent désormais dans une colonne de 120 px
       (mesurée sur « 222 g de protéines », le plus large : 119 px). */
    +idees.map(i=>'<div class="nu-reste-lgn" style="margin-bottom:6px;font-size:13px;line-height:1.45;">'
        +'<span><span style="color:'+cols[i.macro]+';font-weight:800;">'+i.manque+'\u00A0g</span>'
        +'<span style="color:var(--t3);"> de '+i.label+'</span></span>'
        +'<span style="color:var(--t1);font-weight:700;min-width:0;">'+(typeof _escNote==='function'?_escNote(i.idee):i.idee)
        /* ⛔ ON DIT CE QUE ÇA COUVRE VRAIMENT quand la combinaison ne suffit pas : faire croire
           qu'elle tombe juste serait une fausse précision (R29).
           ⚠️ DANS la même cellule (ft-v1031) : en flex c'était une 4ᵉ boîte, donc le « (≈ 65 g) »
           partait se coller au bord droit de la PREMIÈRE ligne pendant que l'idée courait en
           dessous — détaché de ce qu'il qualifie. Il suit maintenant le texte. */
        +((i.couvert && i.couvert < i.manque-5)?' <span style="color:var(--t3);font-weight:400;white-space:nowrap;">(≈ '+i.couvert+'\u00A0g)</span>':'')
      +'</span></div>').join('')
    /* ⛔ « à peu près » n'est pas de la modestie de façade : la portion enregistrée est une
       estimation, et le dire évite qu'on prenne ça pour une prescription au gramme. */
    /* ⛔⛔ LE SOIR, ON NIE LE RATTRAPAGE AU LIEU DE LE SUGGÉRER (anti-TCA, P21). Sans cette
       phrase, une idée qui rétrécit à 20 h se lit comme une consigne de dernière minute —
       *« dépêche-toi, il te reste 40 minutes »* — soit exactement le stress que la nutrition
       ne doit jamais fabriquer. Et elle dit POURQUOI c'est plus léger : sinon le changement
       ressemble à un bug (R30 appliqué à l'écran). */
    +'<div class="txt-just" style="font-size:11px;color:var(--t3);line-height:1.4;margin-top:8px;">'
      +(soir?'Il est tard — <b>une idée légère, pas un rattrapage</b>. Ce qui manque ce soir ne se rattrape pas ce soir. '
            :'')
      +'À peu près — calculé sur <b>tes</b> aliments, pas sur une table générique. Une idée, pas une consigne.</div>'
    +'</div>';
}

/* 🧠 CE QUE L'APP A APPRIS DE TON ALIMENTATION (26/08/2026, ft-v1021) — 100 % local.
   Michel : *« il faut que l'application (pas Milo) apprenne du sportif côté nutrition sans que
   ça me coûte un seul appel API »*.
   ⭐⭐ POURQUOI ON LE MONTRE, ET PAS SEULEMENT EN INTERNE : un profil qu'on ne voit pas ne peut
   pas être corrigé. C'est la doctrine du profil vivant — *observer → expliquer → proposer →
   décider* : la personne doit pouvoir lire ce que l'app croit savoir d'elle.
   ⛔ ET ON DIT CE QU'ON NE SAIT PAS. En dessous de 3 jours notés, la carte annonce qu'elle n'a
   pas de quoi observer — elle ne se tait PAS, parce qu'un silence laisserait croire qu'il n'y a
   rien à apprendre (R29).
   ⚠️ DÉPLACÉE DU JOURNAL VERS MACROS le 26/08 (ft-v1025), sur décision de Michel — pas
   dupliquée : deux exemplaires auraient divergé (R2), et le Journal ne tenait déjà plus dans un
   écran depuis qu'il avait gagné deux cartes le matin même. */
function _blocApprisHTML(){
  const pa=(typeof _profilAlimentaire==='function')?_profilAlimentaire():null;
  if(!pa) return '';
  const LBL={petitdej:'Petit-déj', collation:'Collation', dejeuner:'Déjeuner',
             collation2:'Collation 2', diner:'Dîner', autre:'Autre'};
  const esc=t=>(typeof _escNote==='function')?_escNote(t):t;
  let corps;
  if(pa.etat==='insuffisant'){
    /* ⛔ Le ton est FACTUEL, jamais une relance : « note ce que tu manges » serait une
       injonction, et la nutrition ne doit jamais devenir une source de pression (P21). */
    corps='<div class="txt-just" style="font-size:12.5px;color:var(--t3);line-height:1.5;">'
      +pa.nbJours+' jour'+(pa.nbJours>1?'s':'')+' noté'+(pa.nbJours>1?'s':'')+' — pas encore de quoi dégager une habitude. '
      +'À partir de 3 jours, l\'app commence à reconnaître ce que tu manges vraiment.</div>';
  } else {
    const lignes=Object.keys(pa.habitudes).filter(m=>LBL[m]).map(m=>{
      const noms=pa.habitudes[m].map(x=>esc(x.nom)).join(' · ');
      const h=pa.heures[m];
      /* ⛔ COLONNE FIXE, PAS `min-width` (ft-v1031) : un minimum laisse la colonne grandir
         avec son texte, donc « Collation 2 ~17h » décalait sa ligne de 18 px par rapport à
         « Dîner ~21h ». Mesuré : 5 départs différents pour 5 lignes lues en colonne. */
      return '<div class="nu-lgn" style="margin-bottom:5px;font-size:12.5px;line-height:1.45;">'
        +'<span style="color:var(--t3);font-weight:700;">'+LBL[m]+((h!==undefined)?' <span style="font-weight:400;">~'+h+'h</span>':'')+'</span>'
        +'<span style="color:var(--t1);min-width:0;">'+noms+'</span></div>';
    }).join('');
    /* ⭐⭐ « SUR TOUT TON JOURNAL » N'EST PAS UNE FORMULE DE POLITESSE (26/08/2026, ft-v1026) —
       c'est ce qui empêche deux chiffres justes de se contredire à l'écran. Vu sur une vraie
       capture de Michel : cette carte annonçait « en moyenne 1920 kcal » et, 40 px plus bas,
       « Ta semaine · 2 495 kcal/j ». Les DEUX sont exacts — celle-ci porte sur l'HISTORIQUE
       ENTIER (7 jours notés étalés sur 50), celle du dessous sur les 7 DERNIERS jours — mais
       rien ne le disait, et personne ne peut le deviner. *Deux sources qui se contredisent sans
       rien pour dire laquelle parle de quoi, c'est la famille la plus vicieuse du projet, et
       elle est pire que l'absence : la personne VOIT les deux.*
       ⚠️ Et « répartis sur 50 » était un nombre NU : 50 quoi ? L'unité était dans ma tête.
       ⚠️ Le millier est séparé comme partout ailleurs — « 1920 » à côté de « 2 495 » se lit
       comme une coquille, pas comme une mesure. */
    corps=lignes
      +'<div class="txt-just" style="font-size:11.5px;color:var(--t3);line-height:1.45;margin-top:8px;">'
      +'Observé sur <b>tout ton journal</b> : '+pa.nbJours+' jour'+(pa.nbJours>1?'s':'')+' noté'+(pa.nbJours>1?'s':'')
      +(pa.etendue>pa.nbJours?', étalés sur '+pa.etendue+' jours':'')
      +' · en moyenne <b>'+(+pa.moyennes.kcal).toLocaleString('fr-FR')+'\u00A0kcal</b> et <b>'+pa.moyennes.prot+'\u00A0g</b> de protéines par jour noté.'
      /* ⚠️ On DIT que c'est partiel plutôt que de laisser croire à une habitude établie (R32). */
      +(pa.etat==='partiel'?' <b>C\'est encore court</b> — l\'app décrit ces jours-là, pas tes habitudes.':'')
      +'</div>';
  }
  return '<div style="background:var(--bg2);border-radius:16px;padding:16px;box-shadow:inset 0 0 0 1px var(--sep);">'
    +'<div style="font-size:12px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">🧠 Ce que l\'app a appris de ton alimentation</div>'
    +corps
    /* ⛔ Le rappel qui compte pour Michel : ça ne coûte rien. */
    +'<div class="txt-just" style="font-size:11px;color:var(--t3);margin-top:8px;opacity:.85;">Calculé sur ton téléphone, sans aucun appel à l\'IA.</div>'
    +'</div>';
}

function _renderOuTuEnEs(macros){
  const el=document.getElementById('nu-ou-en-es'); if(!el) return;
  const cible=macros.calories||0, cibleP=macros.prot_g||0;
  const joursTous=_nutriJoursNotes(7);          // pour savoir s'il y a quoi que ce soit
  const jours=_nutriJoursNotes(7,true);         // pour la MOYENNE : jours terminés seulement

  // ── Personne n'a rien noté : on invite, on ne juge pas ──────────────────────────────
  if(!joursTous.length){
    el.innerHTML='<div style="background:var(--bg2);border:1px solid var(--sep);border-radius:16px;padding:16px;">'
      +'<div style="font-family:var(--font-cond);font-size:17px;font-weight:800;color:var(--t1);">Ta semaine</div>'
      +'<div style="font-size:13px;color:var(--t2);line-height:1.45;margin-top:6px;">Note un repas et cette carte te dira où tu en es — aujourd\'hui et sur la semaine. Pas besoin de tout peser : ce qui compte, c\'est la tendance.</div>'
      +'<button class="btn btn-red" style="width:100%;margin-top:12px;padding:11px;font-size:14px;border-radius:12px;" onclick="switchNuTab(\'journal\',document.getElementById(\'ntab-journal\'));setTimeout(()=>{if(typeof openAddFood===\'function\')openAddFood();},120)">➕ Noter mon premier repas</button>'
      +'</div>';
    return;
  }

  // ── La semaine : moyenne sur les jours NOTÉS, jamais sur 7 ──────────────────────────
  let sk=0, sp=0;
  jours.forEach(d=>{ const t=_foodTotals(d); sk+=t.kcal; sp+=t.prot; });
  const moyK=Math.round(sk/jours.length), moyP=Math.round(sp/jours.length);
  const ecart=cible?Math.round(moyK-cible):0;
  /* ⚠️ LE POURCENTAGE N'EST PLUS PLAFONNÉ À 100 (19/08) — le plafond a du sens sur une BARRE
     (elle ne peut pas déborder), aucun sur un nombre affiché : quelqu'un qui mange 50 % de trop
     lisait « 100 % » et se croyait pile à sa cible. Le cas le pire est le kéto, précisément le
     régime où les protéines sont contraintes et où le dépassement EST l'information. */
  const pctP=cibleP?Math.round(moyP/cibleP*100):0;

  const barre=(pct,col)=>'<div style="height:7px;border-radius:4px;background:var(--bg3);overflow:hidden;margin-top:5px;">'
    +'<div style="height:100%;width:'+Math.min(100,pct)+'%;background:'+col+';border-radius:4px;"></div></div>';

  /* ⭐⭐ LA MOITIÉ « AUJOURD'HUI » A ÉTÉ RETIRÉE D'ICI (26/08/2026, ft-v1025) — elle n'est pas
     perdue, elle est REMONTÉE dans la carte du jour (`_renderAujourdhui`), 40 px plus haut.
     C'était le doublon d'origine : la cible du jour s'affichait DEUX FOIS dans le même onglet,
     à 200 px d'écart, avec deux mises en forme différentes. *Deux endroits qui disent la même
     chose finissent par ne plus la dire pareil* (R2).
     ⛔ CE QUI RESTE ICI EST LA SEMAINE, et c'est le vrai sujet de la carte : la moyenne des
     jours notés, l'écart, les protéines. Rien d'autre ne le dit.
     ⛔ Y COMPRIS « Rien de noté » : cette mention protège une règle (ne jamais inventer un zéro
     pour la journée en cours) et elle est tenue par un témoin depuis le 19/08 — elle vit
     désormais dans la carte du jour, avec le reste d'aujourd'hui. L'écrire aux deux endroits
     l'aurait dupliquée, et c'est justement ce qu'on corrige ici (R2). */

  /* ⚠️ LE TEXTE DE LA SEMAINE DIT SUR COMBIEN DE JOURS IL PORTE. « Moyenne sur 3 jours notés »
     est une information ; « moyenne de la semaine » calculée sur 3 jours est un mensonge. */
  /* ⚠️ « Moyenne des N jours notés », jamais « en moyenne » tout court : les deux relectures
     extérieures ont pointé la même ambiguïté — « en moyenne » se lit comme « sur la semaine ». */
  const sJours=jours.length+' jour'+(jours.length>1?'s':'')+' noté'+(jours.length>1?'s':'');
  /* ⚠️⚠️ ON NE JUGE PAS UN ÉCART TANT QU'ON N'A PAS DE QUOI (19/08) : avec un seul jour terminé,
     « 2 367 kcal sous ta cible » n'est pas une information, c'est un constat d'échec adressé à
     quelqu'un qui vient de faire son premier geste. C'est exactement le reproche qu'on croyait
     avoir supprimé avec le « 0 / 2 547 » — déplacé sur la moyenne. Il faut AU MOINS 3 jours
     terminés pour qu'un écart veuille dire quelque chose. */
  const sEcart=(!cible||jours.length<3) ? '' : (Math.abs(ecart)<=100
    ? '<span style="color:var(--green);font-weight:700;">dans ta cible</span>'
    : (ecart<0 ? '<span style="color:var(--t2);font-weight:700;">'+Math.abs(ecart)+' kcal sous ta cible</span>'
               : '<span style="color:var(--t2);font-weight:700;">'+ecart+' kcal au-dessus</span>'));

  /* ⭐ « TA SEMAINE », et plus « Où tu en es » (ft-v1025) : le jour est désormais dit en haut de
     l'onglet, dans sa propre carte. Garder le même titre pour les deux aurait laissé croire
     qu'on lit deux fois la même chose. */
  el.innerHTML='<div style="background:var(--bg2);border:1px solid var(--sep);border-radius:16px;padding:16px;">'
    +'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:12px;">'
      +'<div style="font-family:var(--font-cond);font-size:17px;font-weight:800;color:var(--t1);">Ta semaine</div>'
      +'<div style="font-size:11px;color:var(--t3);">'+(jours.length?sJours+' sur 7':'journée en cours')+'</div></div>'
    +'<div style="display:flex;gap:16px;align-items:flex-start;">'
      +(jours.length
        ? '<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--t3);">Moyenne des '+sJours+'</div>'
          +'<div style="font-family:var(--font-cond);font-size:22px;font-weight:900;color:var(--t1);margin-top:2px;">'+moyK.toLocaleString('fr-FR')+' <span style="font-size:12px;font-weight:700;color:var(--t3);">kcal/j</span></div>'
          +(sEcart?'<div style="font-size:11.5px;margin-top:4px;">'+sEcart+'</div>':'')
          +'<div style="font-size:11.5px;color:var(--t2);margin-top:6px;">Protéines '+moyP+' g/j · '+pctP+' % de ta cible</div>'
          +barre(Math.min(100,pctP),'var(--blue)')+'</div>'
        : '<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--t3);">Ta moyenne</div>'
          +'<div style="font-size:13px;color:var(--t2);line-height:1.4;margin-top:4px;">Elle apparaîtra dès qu\'une journée entière sera derrière toi.</div></div>')
    +'</div>'
    +(jours.length<3?'<div style="font-size:11.5px;color:var(--t3);line-height:1.4;margin-top:11px;">Encore quelques jours notés et la moyenne deviendra un vrai repère — c\'est elle qui compte, pas une journée isolée.</div>':'')
    +'</div>';
}

/* 🏋️ « TU T'ENTRAÎNES PLUS QUE CE QUE TON RÉGLAGE SUPPOSE » — observer, expliquer, proposer,
   décider (docs/PROFIL-VIVANT.md). La carte vit sur l'écran NUTRITION, c'est-à-dire là où les
   calories vivent : la personne ne peut pas voir sa cible changer sans avoir lu pourquoi.
   ⛔ ELLE NE S'APPLIQUE JAMAIS TOUTE SEULE, et le bouton annonce le chiffre AVANT (R29). */
function _renderEcartActivite(){
  const el=document.getElementById('nu-act-drift'); if(!el)return;
  const ec=(typeof ecartNiveauActivite==='function')?ecartNiveauActivite():null;
  if(!ec){ el.innerHTML=''; return; }
  const d=(typeof ecartNiveauKcal==='function')?ecartNiveauKcal(ec):0;
  const monte=ec.suggere>ec.actuel;
  const chiffre=(d>0?'+':'')+d.toLocaleString('fr-FR')+' kcal';
  /* ⚠️ SI LA CIBLE EST RÉGLÉE À LA MAIN, ON LE DIT AU LIEU DE PROMETTRE UN CHANGEMENT QUI
     N'AURA PAS LIEU : `manualKcal` gagne sur le calcul, donc l'anneau ne bougera pas d'un
     kcal. Annoncer « +250 » serait faux, et un chiffre faux est pire qu'un silence. */
  const manuel=(typeof S.manualKcal==='number'&&S.manualKcal>0);
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:8px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:11px 12px;margin-top:8px;">'
    +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;">🏋️ Sur les 4 dernières semaines tu t\'entraînes <b style="color:var(--t1);">'+ec.moy.toString().replace('.',',')+' fois par semaine</b> en moyenne. Ton réglage dit <b>'+ec.labelActuel+'</b>.</div>'
    +'<div style="font-size:11.5px;color:var(--t3);line-height:1.45;">Ce réglage est ce qui fixe ta dépense — et donc ta cible. '+(monte?'Il est peut-être sous-évalué&nbsp;: tu manges sans doute un peu moins que ce que tu dépenses.':'Il est peut-être surévalué&nbsp;: ta cible est sans doute un peu haute.')+'</div>'
    +(manuel?'<div style="font-size:11.5px;color:var(--gold);line-height:1.45;">⚠️ Ta cible est réglée à la main, elle ne bougera pas&nbsp;: seul le chiffre de dépense affiché sera corrigé. C\'est toi qui décides de la suivre ou non.</div>':'')
    +'<div style="display:flex;gap:8px;">'
    +'<button onclick="appliquerNiveauActivite('+ec.suggere+')" class="btn" style="flex:1;padding:9px;font-size:12.5px;font-weight:700;">Passer en '+ec.labelSuggere+(manuel?'':' ('+chiffre+')')+'</button>'
    +'<button onclick="garderNiveauActivite('+ec.suggere+')" class="btn" style="flex:0 0 auto;padding:9px 14px;font-size:12.5px;background:var(--bg3);color:var(--t2);border:1px solid var(--sep);font-weight:700;">Garder</button>'
    +'</div></div>';
}
/* ⛔ ET C'EST LE SEUL ENDROIT QUI ÉCRIT `activityLevel` DEPUIS UNE OBSERVATION (R2) — avec la
   même mémoire d'arbitrage que le détecteur de fréquence : on ne redemande pas pour un niveau
   déjà refusé, sinon la carte devient du harcèlement et finit ignorée (R19/R24). */
function _stampNiveauActivite(suggere,result){
  try{
    if(!S.registre)S.registre={facts:{},observations:[],updatedAt:''};
    S.registre.ctxAct={niveau:suggere,at:today(),result:result};
    S.registre.lastObsAt=today();
  }catch(e){}
}
function appliquerNiveauActivite(suggere){
  try{
    S.activityLevel=+suggere;
    const sel=document.getElementById('act-sel'); if(sel)sel.value=String(suggere);
    _stampNiveauActivite(+suggere,'updated');
    persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
    renderNutrition();
    if(typeof toast==='function')toast('Mis à jour 👍 Ta dépense est calée sur ton vrai rythme.','success');
  }catch(e){console.warn('[FT act] apply',e);}
}
function garderNiveauActivite(suggere){
  try{
    _stampNiveauActivite(+suggere,'kept');
    persist();
    const el=document.getElementById('nu-act-drift'); if(el)el.innerHTML='';
    if(typeof toast==='function')toast("Ok, je garde ton réglage 👍",'info');
  }catch(e){console.warn('[FT act] keep',e);}
}
function renderNutrition(){try{
  renderSupplements();
  // Phase buttons
  document.getElementById('pb-charge').classList.toggle('active',S.nutritionPhase==='charge');
  document.getElementById('pb-decharge').classList.toggle('active',S.nutritionPhase==='decharge');
  // Goal banner
  const goal=S.goal||'muscle';
  // ⚖️ ft-v981 : la table vivait ici EN DOUBLE, avec le même `||350` qui transformait
  // l'objectif « équilibre » en prise de muscle. Un seul propriétaire désormais (state.js, R2).
  const goalDelta=(typeof goalDeltaKcal==='function')?goalDeltaKcal(goal):0;
  const goalColors={muscle:'rgba(255,45,85,.1)',perte:'rgba(255,149,0,.1)',recomp:'rgba(170,0,255,.1)',force:'rgba(41,121,255,.1)',equilibre:'rgba(52,199,89,.1)',endurance:'rgba(170,0,255,.1)'};
  const goalBorderColors={muscle:'rgba(255,45,85,.3)',perte:'rgba(255,149,0,.3)',recomp:'rgba(170,0,255,.3)',force:'rgba(41,121,255,.3)',equilibre:'rgba(52,199,89,.3)',endurance:'rgba(170,0,255,.3)'};
  const goalIcons={muscle:'💪',perte:'🔥',recomp:'✨',force:'🏋️',equilibre:'⚖️',endurance:'🏃'};
  const nuGoal=document.getElementById('nu-goal-info');
  if(nuGoal)nuGoal.textContent=`${goalIcons[goal]||'💪'} ${GOAL_LABELS[goal]||'Prise de muscle'}`;
  // Dynamic phase labels + delta chip
  const lc=document.getElementById('pb-charge-lbl'),ld=document.getElementById('pb-decharge-lbl');
  const cv=goalDelta+100,dv=goalDelta-100;
  if(lc)lc.textContent=`${cv>=0?'+':''}${cv} kcal`;
  if(ld)ld.textContent=`${dv>=0?'+':''}${dv} kcal`;
  const currentDelta=S.nutritionPhase==='charge'?cv:dv;
  const isPos=currentDelta>=0;
  const dChip=document.getElementById('nu-delta-chip'),dVal=document.getElementById('nu-delta-val'),dLbl=document.getElementById('nu-delta-lbl');
  if(dChip){dChip.style.background=isPos?'rgba(255,106,115,.1)':'rgba(52,211,153,.1)';dChip.style.boxShadow=isPos?'inset 0 0 0 1px rgba(255,106,115,.2)':'inset 0 0 0 1px rgba(52,211,153,.2)';}
  if(dVal){dVal.style.color=isPos?'var(--red)':'var(--green)';dVal.textContent=(isPos?'+':'')+currentDelta;}
  if(dLbl)dLbl.textContent=isPos?'Surplus':'Déficit';

  const bd=(typeof bmrDetail==='function')?bmrDetail():{kcal:calcBMR(),methode:null};
  const bmr=bd.kcal, tdee=calcTDEE();
  const hydra=fmt((S.bw*0.035)+0.5);
  document.getElementById('nu-bmr').textContent=bmr.toLocaleString('fr-FR');
  // La provenance du chiffre, en 2 mots — tapable pour l'explication complète.
  // ⚠️ Sur « mifflin » on n'écrit RIEN quand aucune mesure n'existe : afficher « estimé »
  // à quelqu'un qui n'a jamais entendu parler de masse maigre l'inquiéterait sans lui
  // donner de quoi agir (R24, informer sans encombrer). On ne le dit que si ça a BOUGÉ,
  // ou si un bilan existe mais n'a pas pu servir — là, il y a une action possible.
  const srcEl=document.getElementById('nu-bmr-src');
  if(srcEl){
    srcEl.textContent = bd.methode==='katch' ? '⚖️ selon ta masse maigre'
      : (bd.lm ? '⚖️ bilan non utilisé ▸' : '');
    srcEl.style.color = bd.methode==='katch' ? 'var(--green)' : 'var(--gold)';
  }
  document.getElementById('nu-tdee').textContent=tdee.toLocaleString('fr-FR');
  const todayStr=today();
  const todaySess=S.sessions.find(s=>s.date===todayStr);
  const sessCals=todaySess&&todaySess.calories?todaySess.calories:0;
  /* ⚠️ « aucune » et plus « — (pas de séance) » (ft-v1025) : le libellé long ne tenait pas dans
     la tuile à 390 px et se coupait EN TRAVERS de son propre titre (« — (pas de / Séance
     séance) », vu à la capture). Le défaut existait avant ce chantier ; il devient visible
     maintenant que la tuile remonte dans le premier écran. Même information, deux mots. */
  document.getElementById('nu-session-cal').textContent=sessCals>0?sessCals.toLocaleString('fr-FR')+' kcal':'aucune';
  /* 🏋️ ON N'ADDITIONNE PLUS « dépense + séance » (21/08/2026) — c'était un DOUBLE COMPTE.
     Le niveau d'activité s'appelle « Modéré (3-4j) » : les séances sont déjà dedans, lissées
     sur la semaine. La tuile affichait donc un total plus gros que la réalité, et — pire — il
     CONTREDISAIT l'anneau juste en dessous, qui lui ne l'ajoutait pas. Deux chiffres qui se
     contredisent sur le même écran, sans rien pour dire lequel commande la cible : c'est la
     famille de bugs « deux sources qui se contredisent » (BUGS.md), et elle est plus vicieuse
     que l'absence, parce que la personne VOIT les deux.
     👉 La tuile dit désormais ce qu'on sait vraiment : combien de séances cette semaine, et si
     ça colle au niveau déclaré. La séance du jour reste affichée à côté — c'est une MESURE
     juste, elle n'a simplement rien à faire dans une addition. */
  const _wkEl=document.getElementById('nu-week-sess');
  if(_wkEl){
    const _wk=(typeof _weeklyCounts==='function')?_weeklyCounts(1)[0]:null;
    _wkEl.textContent = _wk===null ? '—' : (_wk+' séance'+(_wk>1?'s':''));
    _wkEl.style.color = 'var(--orange)';
  }
  try{ _renderEcartActivite(); }catch(e){ /* jamais bloquant : la carte est un ajout */ }
  document.getElementById('nu-hydra').textContent=hydra;

  // ── MODE ALIMENTAIRE + JEÛNE (02/08) ────────────────────────────────────────
  // Remplace l'ancien interrupteur kéto seul : les modes sont EXCLUSIFS entre eux (on n'est pas
  // kéto ET low carb), alors que le jeûne est INDÉPENDANT — c'est un horaire, pas des macros.
  const ketoEl=document.getElementById('nu-keto');
  if(ketoEl){
    const mode=S.foodMode||'';
    const DESC={keto:'5 % glucides · 15 % protéines · 80 % lipides',
                lowcarb:'Glucides réduits, sans viser la cétose',
                paleo:'Ni céréales, ni laitages, ni transformé',
                mediterraneen:'Végétaux, poisson, huile d\'olive'};
    const ICO={keto:'🥑',lowcarb:'🥩',paleo:'🍖',mediterraneen:'🫒'};
    const btn=(v,l)=>`<button onclick="setFoodMode('${v}')" style="flex:1 1 46%;padding:9px 6px;border-radius:10px;border:1.5px solid ${mode===v?'var(--green)':'var(--sep)'};background:${mode===v?'rgba(52,199,89,.10)':'var(--bg2)'};color:${mode===v?'var(--t1)':'var(--t2)'};font-family:var(--font);font-size:12.5px;font-weight:${mode===v?'800':'600'};cursor:pointer;">${ICO[v]||''} ${l}</button>`;
    const fBtn=(v,l)=>`<button onclick="setFasting('${v}')" style="flex:0 0 auto;padding:7px 12px;border-radius:18px;border:1.5px solid ${S.fasting===v?'var(--green)':'var(--sep)'};background:${S.fasting===v?'rgba(52,199,89,.10)':'var(--bg2)'};color:${S.fasting===v?'var(--t1)':'var(--t2)'};font-family:var(--font);font-size:12px;font-weight:${S.fasting===v?'800':'600'};cursor:pointer;">${l}</button>`;
    ketoEl.innerHTML=
       '<div style="font-size:12px;color:var(--t3);margin-bottom:6px;">Mode alimentaire (un seul — retape pour désactiver)</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'+btn('keto','Cétogène')+btn('lowcarb','Low carb')+btn('paleo','Paléo')+btn('mediterraneen','Méditerranéen')+'</div>'
      +(mode?'<div style="font-size:11.5px;color:var(--green);margin-top:6px;">'+(ICO[mode]||'')+' '+DESC[mode]+'</div>':'')
      +'<div style="font-size:12px;color:var(--t3);margin:12px 0 6px;">Jeûne intermittent — les calories ne changent pas, elles se concentrent sur la fenêtre</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'+fBtn('16-8','16/8')+fBtn('18-6','18/6')+fBtn('20-4','20/4')+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:10px;line-height:1.45;">Ces réglages changent tes macros et tes repas suggérés. Ils ne remplacent jamais l\'avis de ton médecin ou d\'un diététicien.</div>';
  }

  const macros=calcMacros(S.nutritionPhase);
  try{ _renderOuTuEnEs(macros); }catch(e){ /* jamais bloquant : la carte est un ajout, pas un pré-requis */ }
  /* 🍽️ ft-v1025 — la carte du jour, et la carte « ce que l'app a appris » remontée du Journal.
     ⛔ Chacune dans son `try` : une carte qui plante ne doit pas emporter tout l'onglet. */
  try{ _renderAujourdhui(macros); }catch(e){ /* jamais bloquant */ }
  try{ const _ap=document.getElementById('nu-appris'); if(_ap)_ap.innerHTML=_blocApprisHTML(); }catch(e){}
  document.getElementById('m-kcal').textContent=macros.calories.toLocaleString('fr-FR');
  /* Le même chiffre au centre de l'anneau de répartition, dans l'accordéon « comment c'est
     calculé ». ⚠️ `id` DIFFÉRENT exprès : `m-kcal` a déménagé en tête de l'onglet, et réutiliser
     son `id` ici aurait fait écrire deux éléments par la même ligne — le second aurait gagné en
     silence, sans qu'aucune erreur ne le dise. */
  {const _ck=document.getElementById('nu-calc-kcal'); if(_ck)_ck.textContent=macros.calories.toLocaleString('fr-FR');}
  /* 📋 LES SOUS-TITRES DES DEUX ACCORDÉONS — c'est la seule chose visible sans déplier, donc
     ils disent l'ÉTAT COURANT et évitent d'ouvrir juste pour vérifier (R24). */
  {
    const _sc=document.getElementById('nu-acc-calc-sub');
    if(_sc)_sc.textContent=[(nuGoal&&nuGoal.textContent||'').replace(/^[^\s]+\s/,''),
      (currentDelta>=0?'+':'')+currentDelta+' kcal', 'TDEE '+tdee.toLocaleString('fr-FR')]
      .filter(Boolean).join(' · ');
    const _sd=document.getElementById('nu-acc-diet-sub');
    if(_sd){
      const MODE={keto:'Cétogène',lowcarb:'Low carb',paleo:'Paléo',mediterraneen:'Méditerranéen'};
      const bouts=[];
      if(MODE[S.foodMode||''])bouts.push(MODE[S.foodMode]);
      if(S.fasting)bouts.push('jeûne '+String(S.fasting).replace('-','/'));
      const ds=(typeof dietSummary==='function')?dietSummary():'';
      if(ds)bouts.push(ds);
      /* ⛔ « Rien de particulier » plutôt qu'un sous-titre vide : un blanc se lit comme un
         chargement qui n'a pas abouti, alors que l'absence de réglage est une réponse. */
      _sd.textContent=bouts.length?bouts.join(' · '):'Rien de particulier pour l\'instant';
    }
  }
  // Bloc réglage manuel (sous l'anneau) : état auto vs manuel + bouton d'ajustement — RÉSERVÉ AUX TESTEURS
  const _nutriBeta=(typeof _isNutriBeta==='function')&&_isNutriBeta();
  const _jptr=document.getElementById('nu-journal-ptr'); if(_jptr)_jptr.style.display=_nutriBeta?'':'none';
  const adj=document.getElementById('nu-adjust');
  if(adj&&!_nutriBeta){adj.innerHTML='';}
  else if(adj){
    if(macros.isManual){
      adj.innerHTML='<div style="display:flex;align-items:center;gap:8px;background:rgba(255,45,85,.08);border:1px solid rgba(255,45,85,.25);border-radius:12px;padding:9px 12px;">'
        +'<span style="font-size:12.5px;color:var(--t2);flex:1;line-height:1.35;">🎯 <b style="color:var(--t1);">Objectif manuel</b> — '+macros.calories.toLocaleString('fr-FR')+' kcal <span style="color:var(--t3);white-space:nowrap;">(auto : '+macros.autoCalories.toLocaleString('fr-FR')+')</span></span>'
        +'<button onclick="openKcalEdit()" class="btn" style="width:auto;flex:none;padding:7px 12px;font-size:12.5px;background:var(--bg3);color:var(--t1);border:1px solid var(--sep);">Modifier</button></div>';
    } else {
      /* 🛡️ SI LE PLANCHER A RELEVÉ LA CIBLE, ON LE DIT (18/08/2026) — voir `_plancherKcal`
         (state.js). Une cible qui ne correspond pas au calcul annoncé (« TDEE − 450 ») et qui
         change sans explication est pire que pas de plancher du tout : la personne croit à un
         bug, ou pire, cherche à le contourner. On explique en une phrase, et on ne moralise pas
         (Constitution P21 : la nutrition ne doit jamais devenir une source de stress).
         ⛔⛔ ET LA PHRASE NE DIT PLUS « ON Y PERD DU MUSCLE AVANT DU GRAS » (23/08/2026, ft-v978).
         C'était faux : le corps n'a pas d'interrupteur qui basculerait de la graisse au muscle,
         il utilise plusieurs substrats en permanence. Ce qui est vrai, c'est que le RISQUE de
         perdre de la masse maigre augmente quand le déficit est fort ou prolongé — et que les
         protéines et la musculation le réduisent sans l'annuler.
         ⛔ On ne remplace pas une affirmation fausse par une autre : aucun seuil n'est donné
         (« sous X kcal le muscle part » n'existe pas sous cette forme) — R29. */
      const _pl=(typeof plancherKcalActif==='function')?plancherKcalActif(S.nutritionPhase):null;
      adj.innerHTML=(_pl?'<div style="display:flex;gap:8px;background:var(--bg2);border:1px solid var(--sep);border-radius:12px;padding:9px 12px;margin-bottom:8px;">'
          +'<span style="font-size:12.5px;color:var(--t2);line-height:1.4;">🛡️ Ton calcul donnait <b>'+_pl.brut.toLocaleString('fr-FR')+' kcal</b>. La cible est remontée à <b style="color:var(--t1);">'+_pl.plancher.toLocaleString('fr-FR')+' kcal</b> : plus le déficit est fort et long, plus il devient <b>difficile de garder ton muscle</b> — les protéines et la muscu aident, mais elles ne compensent pas tout. Tu peux la fixer toi-même si tu suis un protocole encadré.</span></div>':'')
        +'<button onclick="openKcalEdit()" class="btn" style="width:100%;padding:11px;font-size:13.5px;background:var(--bg2);color:var(--t2);border:1px solid var(--sep);font-weight:700;">✎ Ajuster mes calories à la main</button>';
    }
  }
  document.getElementById('m-prot').textContent=macros.prot_g;
  document.getElementById('m-carbs').textContent=macros.carbs_g;
  document.getElementById('m-fat').textContent=macros.fat_g;
  /* 🍚 ON DIT POURQUOI LES GLUCIDES NE SONT PAS LES MÊMES QU'HIER (21/08/2026).
     ⛔ Ce n'est pas décoratif : sans cette ligne, la répartition change d'un jour à l'autre
     SANS RAISON VISIBLE — et un chiffre qui bouge tout seul se lit comme un bug, ou pire, se
     contourne. C'est la leçon du plancher calorique de ft-v906, appliquée aux macros.
     ⭐ On annonce aussi que le TOTAL DE LA SEMAINE ne change pas : c'est la seule chose qui
     transforme « on me fait manger plus » en « on répartit autrement ». */
  const _cy=document.getElementById('nu-cycle');
  if(_cy){
    const c=macros.cycle;
    if(!c||!c.dCarbs){ _cy.innerHTML=''; }
    else{
      const seance=c.jour==='seance';
      const signe=(c.dCarbs>0?'+':'')+c.dCarbs;
      _cy.innerHTML='<div style="display:flex;gap:8px;background:var(--bg2);border:1px solid var(--sep);border-radius:10px;padding:9px 11px;margin-top:10px;">'
        +'<span style="font-size:11.5px;color:var(--t2);line-height:1.45;">'
        +(seance?'🍚 <b style="color:var(--t1);">Jour de séance</b> — '
                 :'😴 <b style="color:var(--t1);">Jour de repos</b> — ')
        +'<b>'+signe+' g</b> de glucides, compensés par les lipides. '
        +'<span style="color:var(--t3);">Tes calories du jour ne changent pas, et sur la semaine le total est le même : les glucides vont là où tu t\'entraînes.</span>'
        +'</span></div>';
    }
  }
  // Barres macros = part des calories (prot/glucides 4 kcal/g, lipides 9 kcal/g)
  (function(){
    const kP=(macros.prot_g||0)*4, kC=(macros.carbs_g||0)*4, kF=(macros.fat_g||0)*9;
    const tot=kP+kC+kF||1;
    const set=(barId,pctId,kcal)=>{
      const pct=Math.round(kcal/tot*100);
      const bar=document.getElementById(barId), lbl=document.getElementById(pctId);
      if(bar)bar.style.width=pct+'%';
      if(lbl)lbl.textContent='· '+pct+'%';
    };
    set('m-prot-bar','m-prot-pct',kP);
    set('m-carbs-bar','m-carbs-pct',kC);
    set('m-fat-bar','m-fat-pct',kF);
    const hb=document.getElementById('nu-hydra-bar');
    if(hb)hb.style.width=Math.min(100,Math.round((parseFloat(hydra)||0)/3.5*100))+'%';
    // Anneau hero : arcs = part des calories (prot vert, glucides orange, lipides or)
    const C=2*Math.PI*52; // circonférence r=52
    const arc=(id,kcal,startKcal)=>{
      const el=document.getElementById(id);if(!el)return;
      const len=kcal/tot*C;
      el.style.strokeDasharray=len.toFixed(1)+' '+(C-len).toFixed(1);
      el.style.strokeDashoffset=(-(startKcal/tot*C)).toFixed(1);
    };
    arc('ring-prot',kP,0);
    arc('ring-carb',kC,kP);
    arc('ring-fat',kF,kP+kC);
    const pctP=Math.round(kP/tot*100),pctC=Math.round(kC/tot*100),pctF=Math.round(kF/tot*100);
    const lp=document.getElementById('ring-lg-p'),lcg=document.getElementById('ring-lg-c'),lf=document.getElementById('ring-lg-f');
    if(lp)lp.textContent=pctP+'%';
    if(lcg)lcg.textContent=pctC+'%';
    if(lf)lf.textContent=pctF+'%';
  })();

  // Cycle menstruel banner
  const nuCycleBanner=document.getElementById('nu-cycle-banner');
  if(nuCycleBanner){
    const cp=getMensCyclePhase();
    if(cp){
      nuCycleBanner.style.display='block';
      nuCycleBanner.innerHTML=`<div class="cycle-phase-banner" style="background:rgba(170,0,255,.08);border:1px solid rgba(170,0,255,.2);">
        <span style="font-size:26px;flex-shrink:0;">${cp.icon}</span>
        <div style="flex:1;">
          <div style="font-family:var(--font-cond);font-size:16px;font-weight:900;color:${cp.color};">${cp.phase} — Jour ${cp.day}/${S.mensCycleDur}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:4px;line-height:1.5;"><strong style="color:var(--t1);">Nutrition :</strong> ${cp.nutrition}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:3px;line-height:1.5;"><strong style="color:var(--t1);">Entraînement :</strong> ${cp.training}</div>
        </div>
      </div>`;
    } else { nuCycleBanner.style.display='none'; }
  }

  // Meal plan statique
  const meals=getMeals(macros,S.nutritionPhase);
  document.getElementById('meal-plan').innerHTML=meals.map(m=>{
    // Un aliment déclaré « à éviter » qu'on ne sait pas remplacer sans inventer : on le SIGNALE
    // au lieu de faire comme si de rien n'était (R29 — l'erreur peut être une allergie).
    const al=(typeof mealAlertes==='function')?mealAlertes(m.desc):[];
    return `
    <div class="meal-row">
      <div style="flex:1;">
        <div class="meal-name">${_escNote(m.name)}</div>
        <div class="meal-detail">${_escNote(m.desc)}</div>
        ${al.length?`<div class="meal-detail" style="margin-top:3px;color:var(--gold);">⚠️ contient ${_escNote(al.join(', '))} — tu as indiqué l'éviter, remplace-le</div>`:''}
        <div class="meal-detail" style="margin-top:3px;color:var(--t3);">P: ${m.prot}g · G: ${m.carbs}g · L: ${m.fat}g</div>
      </div>
      <div class="meal-kcal">${m.kcal} kcal</div>
    </div>`;}).join('');
  try{if(typeof _renderDietCard==='function')_renderDietCard();}catch(e){}
  renderMealPlanIA();
}catch(e){console.error('[FT] renderNutrition:',e);}}

// ─── PLAN DE REPAS IA ────────────────────────────────────────
let _mpDay=0;
function setMpDay(i){_mpDay=i;renderMealPlanIA();}
function renderMealPlanIA(){
  const el=document.getElementById('meal-plan-ia');if(!el)return;
  const isPrem=S.premium,plan=S.mealPlan,td=today();
  const DAY=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  if(!plan||!plan.days||!plan.days.length){
    el.innerHTML=`<div style="background:var(--bg2);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="font-size:13px;color:var(--t2);line-height:1.5;text-align:center;">Plan de repas personnalisé par l'IA, adapté à tes macros et ton objectif.</div>`
      +`<button class="btn btn-red" id="mp-gen-btn" onclick="generateMealPlan()" style="padding:14px;font-size:15px;">🍽️ Générer${isPrem?' ma semaine':' mon repas du jour'}</button>`
      +`<button class="btn btn-bg2" onclick="openImportMeal()" style="padding:12px;font-size:14px;">📥 Importer un plan (diététicien)</button>`
      +`<div style="font-size:11px;color:var(--t3);text-align:center;">Photo ou PDF du plan de ta diététicienne → l'IA le range.</div>`
      +(!isPrem?`<div style="font-size:11px;color:var(--t3);text-align:center;">🆓 Gratuit : repas du jour · 1 régénération/j &nbsp;·&nbsp; ⭐ Premium : semaine + illimité</div>`:'')
      +`</div>`;
    return;
  }
  const imp=!!plan.imported;
  const days=(isPrem||imp)?plan.days:plan.days.slice(0,1);
  const canRegen=!imp&&(isPrem||(plan.regenDate!==td||(plan.regenCount||0)<1));
  let html=`<div style="display:flex;flex-direction:column;gap:8px;">`;
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
    <span style="font-size:11px;color:var(--t3);">${plan.imported?(plan.planName?'📥 '+plan.planName:'📥 Plan importé'):'Généré le '+fmtD(plan.generatedAt)}</span>
    <div style="display:flex;gap:6px;flex-shrink:0;">
      <button class="btn-xs" style="color:var(--t2);border-color:var(--sep);" onclick="openImportMeal()">📥 Importer</button>
      <button class="btn-xs" style="color:var(--red);border-color:rgba(255,45,85,.3);" onclick="generateMealPlan()">🔄 IA</button>
    </div>
  </div>`;
  if((isPrem||imp)&&days.length>1){
    if(_mpDay>=days.length)_mpDay=0;
    html+=`<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:2px;">`;
    days.forEach((d,i)=>{
      const wd=new Date(d.date+'T12:00:00').getDay(),isT=d.date===td,sel=i===_mpDay;
      const lbl=imp&&d.label?d.label.slice(0,10):DAY[wd]+(isT?'·':'');
      html+=`<button onclick="setMpDay(${i})" style="flex-shrink:0;padding:5px 10px;border-radius:20px;border:1px solid ${sel?'var(--red)':'var(--sep)'};background:${sel?'rgba(255,45,85,.12)':'var(--bg3)'};color:${sel?'var(--red)':isT?'var(--t1)':'var(--t2)'};font-size:12px;font-weight:${sel||isT?700:500};cursor:pointer;touch-action:manipulation;">${lbl}</button>`;
    });
    html+=`</div>`;
    html+=_renderMealDay(days[_mpDay],isPrem,canRegen);
  }else{
    html+=_renderMealDay(days[0],isPrem,canRegen);
  }
  if(!isPrem&&!imp){
    html+=`<div style="background:rgba(255,214,0,.07);border:1px solid rgba(255,214,0,.15);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">⭐</span>
      <div style="font-size:12px;color:var(--t2);">Premium : semaine complète + régénérations illimitées — <strong style="color:var(--gold);">6,99 €/mois</strong></div>
    </div>`;
  }
  el.innerHTML=html+`</div>`;
}
function _renderMealDay(day,isPrem,canRegen){
  if(!day)return'';
  let h=`<div style="display:flex;flex-direction:column;gap:6px;">`;
  (day.meals||[]).forEach(m=>{
    const enc=_escAttrJs(m.name);
    h+=`<div style="background:var(--bg2);border-radius:12px;padding:12px 14px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">`
      +`<div style="font-weight:700;font-size:13px;color:var(--t1);">${_escNote(m.name)}</div>`
      +`<div style="display:flex;align-items:center;gap:6px;">`
      +`<span style="font-size:12px;font-weight:700;color:var(--red);">${m.kcal||0} kcal</span>`
      +(canRegen?`<button onclick="generateMealPlan('${day.date}','${enc}')" style="background:none;border:none;padding:2px 6px;color:var(--t3);cursor:pointer;font-size:14px;touch-action:manipulation;" title="Régénérer ce repas">🔄</button>`:'')
      +`</div></div>`
      +`<ul style="margin:0;padding:0 0 0 14px;display:flex;flex-direction:column;gap:1px;">`
      +(m.foods||[]).map(f=>`<li style="font-size:12px;color:var(--t2);">${f}</li>`).join('')
      +`</ul>`
      +`<div style="font-size:11px;color:var(--t3);margin-top:5px;">P ${m.prot||0}g · G ${m.carbs||0}g · L ${m.fat||0}g</div>`
      +`</div>`;
  });
  return h+`</div>`;
}

// ─── JOURNAL ALIMENTAIRE (rendu) ──────────────────────────────
/* 📅 NAVIGUER DANS LE JOURNAL — voir et modifier un AUTRE jour (22/08/2026), voir app.js pour
   le pourquoi. ⚠️ UN JOUR PASSÉ EST CLOS : « restantes » n'a plus de sens (on ne va pas manger
   davantage hier) — le libellé passe en simple comparaison à l'objectif du jour, sans laisser
   croire qu'il reste quelque chose à faire. Le TARGET affiché reste celui d'AUJOURD'HUI (on ne
   recalcule pas un objectif historique, on n'a pas ce qu'il fallait pour le faire honnêtement :
   R29) — le libellé le dit pour ne pas laisser croire à une précision qu'on n'a pas. */
function renderFoodJournal(){
  const el=document.getElementById('food-journal');if(!el)return;
  const td=_journalJourActif();
  const estAuj=(td===today());
  const hasProfile=S.bw&&S.age&&S.height;
  const target=hasProfile?calcMacros(S.nutritionPhase):null;
  const tot=(typeof _foodTotals==='function')?_foodTotals(td):{kcal:0,prot:0,carbs:0,fat:0};
  const entries=(S.foodLog||[]).filter(e=>e.date===td).sort((a,b)=>b.ts-a.ts);

  let html='';
  // Navigation jour par jour — même repère visuel que le calendrier de l'Accueil (R13).
  const _navBtn=(dir,txt,actif)=>'<button '+(actif?'onclick="journalNav('+dir+')"':'disabled')
    +' style="width:32px;height:32px;border-radius:9px;border:none;background:var(--bg3);color:'+(actif?'var(--t1)':'var(--t3)')+';font-size:17px;font-weight:700;cursor:'+(actif?'pointer':'default')+';display:flex;align-items:center;justify-content:center;touch-action:manipulation;opacity:'+(actif?'1':'.4')+';">'+txt+'</button>';
  const _jr=new Date(td+'T12:00:00');
  const _hier=new Date(today()+'T12:00:00'); _hier.setDate(_hier.getDate()-1);
  const jourLabel = estAuj?'Aujourd\'hui' : (td===_hier.toISOString().slice(0,10))?'Hier'
    : _jr.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    +_navBtn(-1,'‹',true)
    +'<span style="font-weight:800;font-size:14px;color:var(--t1);text-transform:capitalize;">'+jourLabel+'</span>'
    +_navBtn(1,'›',!estAuj)
    +'</div>';

  /* 📅 LA SEMAINE EN UN COUP D'ŒIL (ft-v1004) — Michel, capture d'une autre app à l'appui :
     « j'aimerais les jours de la semaine en haut, qu'ils soient cliquables, et voir d'un seul
     geste ce que l'on a mangé ce jour-là ».
     ⭐⭐ 7 JOURS GLISSANTS, PAS LA SEMAINE CALENDAIRE — tranché par Michel sur MESURE. Sa
     référence montrait un L M M J V S D fixe, mais l'essayer l'a montré : un MARDI la semaine
     calendaire n'affiche que **2 jours sur 7**, un lundi un seul — le reste est grisé en
     attendant. *Or la demande était « voir d'un seul geste ce qu'on a mangé ».* Ici aujourd'hui
     est à DROITE, les 6 jours précédents à gauche : la bande est TOUJOURS pleine.
     ⛔ LES FLÈCHES RESTENT : la bande ne couvre que 7 jours, elles seules permettent de remonter
     plus loin.
     ⛔ RIEN DE CULPABILISANT (règle du produit, cf. NUTRITION-PHILOSOPHIE / anti-TCA) : l'anneau
     se REMPLIT, il ne juge pas. Un jour sans rien noté est un cercle vide et discret, pas une
     alerte — on ne reproche pas un oubli. Un dépassement se signale en ORANGE, jamais en rouge.
     ⏰ Toutes les dates sont calculées à MIDI (famille « fuseaux horaires » de BUGS.md). */
  {
    const _auj=today();
    /* ⛔ La fenêtre s'ancre sur AUJOURD'HUI, pas sur le jour affiché : sinon reculer d'un jour
       ferait glisser toute la bande, et on perdrait le repère (on ne saurait plus où on est). */
    const _ancre=new Date(_auj+'T12:00:00');
    const L=['D','L','M','M','J','V','S'];        // index = getDay() (0 = dimanche)
    let bande='';
    for(let k=6;k>=0;k--){
      const jd=new Date(_ancre); jd.setDate(_ancre.getDate()-k);
      const ymd=jd.toISOString().slice(0,10);
      const futur=ymd>_auj, actif=(ymd===td), cejour=(ymd===_auj);
      const lettre=L[jd.getDay()];
      const tj=(typeof _foodTotals==='function')?_foodTotals(ymd):{kcal:0};
      const cible=target?target.calories:0;
      const pct=(cible>0)?Math.min(100,Math.round(tj.kcal/cible*100)):(tj.kcal>0?100:0);
      /* ⭕ Anneau SVG (l'app n'utilise pas canvas — 104 <svg>) : circonférence 2πr avec r=11,
         soit ≈ 69,1. Le trait de progression part du haut (rotation -90°). */
      const C=69.1, off=C*(1-pct/100);
      const coul = pct===0 ? 'var(--sep)' : (tj.kcal>cible&&cible>0 ? 'var(--orange)' : 'var(--green)');
      const anneau='<svg width="26" height="26" viewBox="0 0 26 26" style="display:block;">'
        +'<circle cx="13" cy="13" r="11" fill="none" stroke="var(--bg3)" stroke-width="2.5"/>'
        +(pct>0?'<circle cx="13" cy="13" r="11" fill="none" stroke="'+coul+'" stroke-width="2.5"'
          +' stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" stroke-linecap="round"'
          +' transform="rotate(-90 13 13)"/>':'')
        +(cejour?'<circle cx="13" cy="13" r="2.5" fill="var(--red)"/>':'')
        +'</svg>';
      bande+='<button '+(futur?'disabled':'onclick="journalAllerA(\''+ymd+'\')"')
        +' aria-label="'+jd.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'"'
        +' style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 0;'
        +'border:none;border-radius:12px;cursor:'+(futur?'default':'pointer')+';'
        +'background:'+(actif?'var(--bg3)':'transparent')+';opacity:'+(futur?'.32':'1')+';">'
        +'<span style="font-size:11px;font-weight:'+(actif?'900':'700')+';color:'
          +(actif?'var(--t1)':'var(--t3)')+';">'+lettre+'</span>'
        +anneau
        +'</button>';
    }
    html+='<div style="display:flex;gap:2px;margin-bottom:12px;">'+bande+'</div>';
  }
  // Résumé du jour
  if(target){
    const rem=target.calories-tot.kcal;
    const pct=Math.min(100,Math.round(tot.kcal/Math.max(1,target.calories)*100));
    const remCol=rem<0?'var(--red)':'var(--green)';
    html+=`<div style="background:var(--bg2);border-radius:16px;padding:16px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">`
        +`<span style="font-size:12px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">`+(estAuj?'Aujourd\'hui':'Objectif du jour')+`</span>`
        +(estAuj
          ?`<span style="font-size:12px;color:${remCol};font-weight:700;">${rem>=0?rem+' kcal restantes':Math.abs(rem)+' kcal au-dessus'}</span>`
          :`<span style="font-size:12px;color:${remCol};font-weight:700;">${rem>=0?rem+' kcal en dessous':Math.abs(rem)+' kcal au-dessus'}</span>`)
      +`</div>`
      +`<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">`
        +`<span style="font-family:var(--font-cond);font-size:30px;font-weight:900;color:var(--t1);line-height:1;">${tot.kcal}</span>`
        +`<span style="font-size:13px;color:var(--t3);">/ ${target.calories} kcal</span>`
      +`</div>`
      +`<div style="height:8px;border-radius:5px;background:var(--bg3);overflow:hidden;margin-bottom:12px;"><div style="height:100%;width:${pct}%;background:${rem<0?'var(--red)':'var(--red)'};border-radius:5px;"></div></div>`
      +_macroLine('Protéines',tot.prot,target.prot_g,'var(--green)')
      +_macroLine('Glucides',tot.carbs,target.carbs_g,'var(--orange)')
      +_macroLine('Lipides',tot.fat,target.fat_g,'var(--gold)')
      /* 🍽️ « Ce qu'il te reste, en vrai » — le rendu vit dans `_blocResteHTML` (screens.js),
         partagé avec la carte du jour de l'onglet Macros. UN SEUL propriétaire (R2, ft-v1025) :
         deux copies auraient divergé, et l'une porte trois garde-fous anti-TCA. */
      +_blocResteHTML(td)
      +`</div>`;
  }else{
    html+=`<div style="background:var(--bg2);border-radius:14px;padding:16px;text-align:center;color:var(--t3);font-size:13px;box-shadow:inset 0 0 0 1px var(--sep);">Remplis ton profil (âge, taille, poids) pour comparer à tes objectifs.</div>`;
  }

  /* 🧠 LA CARTE « CE QUE L'APP A APPRIS DE TON ALIMENTATION » N'EST PLUS ICI (26/08/2026,
     ft-v1025) — elle est passée dans l'onglet MACROS, sur décision de Michel. La raison est
     écrite pour que personne ne la « remette » en croyant réparer un oubli (R30) :
     ⛔ elle n'est pas DUPLIQUÉE, elle est DÉPLACÉE — deux exemplaires du même bloc auraient
        fini par diverger (R2), et celui-ci porte les états nommés qui disent ce qu'on ne sait
        pas encore ;
     ⛔ et le Journal ne tenait déjà plus dans un écran depuis qu'il avait gagné deux cartes le
        matin même. C'est une carte qu'on lit de temps en temps, pas d'un coup d'œil : sa place
        est dans l'onglet où l'on regarde ses habitudes, pas dans celui où l'on saisit.
     👉 Le rendu vit dans `_blocApprisHTML()`, plus haut dans ce fichier. */

  /* 🔍 LES TROIS FAÇONS D'AJOUTER UN ALIMENT SE VOIENT DEPUIS LE JOURNAL (15/08/2026)
     Michel : *« il faut faire "ajouter un aliment" et je pense que cette étape est en trop,
     personne ne verra ce qui se trouve derrière sauf s'il clique sur le bouton »*.
     ⭐ IL A RAISON, ET C'EST MESURÉ : la modale propose QUATRE méthodes (taper le code-barres ·
     le photographier · lire l'étiquette · estimer à l'IA) et le Journal n'en montrait AUCUNE —
     un seul bouton gris « ➕ Ajouter un aliment ». Quelqu'un qui ne clique pas ne saura jamais
     que l'app lit les codes-barres, c'est-à-dire la fonction la plus rapide ET la seule
     totalement gratuite. *Une fonctionnalité qu'on ne voit pas n'existe pas* — R23, appliqué à
     l'écran cette fois et plus à la doc.
     ⚠️ AUCUNE ÉTAPE N'EST AJOUTÉE : les trois raccourcis ouvrent LA MÊME modale, simplement au
     bon endroit. On ne fait que montrer ce qui existait déjà.
     ⚠️ ET L'ORDRE N'EST PAS ESTHÉTIQUE : le code-barres est en premier et en rouge parce qu'il
     est GRATUIT et illimité ; l'étiquette et l'estimation consomment le quota IA du freemium.
     La porte d'entrée par défaut ne doit pas être celle qui coûte (R24 : informer sans piéger).
     ⚠️ La saisie à la main reste offerte : gratuite, illimitée, et c'est le filet quand le
     produit n'est dans aucune base. */
  /* ⚡ TES REPAS HABITUELS — un appui, avant même les boutons d'ajout (18/08/2026).
     Voir `_repasHabituels` (app.js) : ce sont les aliments déjà notés ENSEMBLE au moins deux
     fois. Rien n'est déclaré ni stocké en plus — c'est de l'observation, pas une liste à gérer.
     ⚠️ Si la personne mange différemment chaque jour, cette section n'apparaît PAS du tout :
     un bloc vide serait un reproche déguisé (R24). */
  try{
    const habitudes=(typeof _repasHabituels==='function')?_repasHabituels():[];
    if(habitudes.length){
      html+=`<div style="margin-top:14px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--t3);margin-bottom:7px;">Tes repas habituels — un appui</div>`
        +`<div style="display:flex;flex-direction:column;gap:6px;">`;
      habitudes.forEach(r=>{
        const mi=(typeof _foodMealInfo==='function')?_foodMealInfo(r.meal):{ic:'🍽️',lbl:''};
        const k=r.items.reduce((a,e)=>a+(e.kcal||0),0);
        const p=r.items.reduce((a,e)=>a+(e.prot||0),0);
        const noms=r.items.map(e=>e.name).join(' + ');
        html+=`<button onclick="rejouerRepas('${String(r.sig).replace(/'/g,"\\'")}')" class="btn btn-bg2" style="display:flex;align-items:center;gap:10px;text-align:left;padding:11px 12px;width:100%;">`
          +`<span style="font-size:18px;flex:none;">${mi.ic}</span>`
          +`<span style="flex:1;min-width:0;"><span style="display:block;font-size:13.5px;font-weight:700;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escNote?_escNote(noms):noms}</span>`
          +`<span style="display:block;font-size:11.5px;color:var(--t3);margin-top:1px;">${mi.lbl||''} · ${k} kcal · ${p} g de protéines · noté ${r.n} fois</span></span>`
          +`<span style="flex:none;color:var(--red);font-size:19px;font-weight:800;">+</span></button>`;
      });
      html+=`</div></div>`;
    }
  }catch(e){ /* jamais bloquant : c'est un raccourci, pas un pré-requis */ }

  /* ✏️ « À LA MAIN » EN PREMIER ET EN ROUGE (23/08/2026) — demande explicite de Michel :
     *« intervertis, à la main en premier et en rouge »*, après *« le code-barres et à la main
     dans nutrition n'ont pas été échangés, il doit y avoir un autre ordre »*.

     ⚠️⚠️ CE CHANGEMENT REMPLACE UNE DÉCISION QUI AVAIT SA RAISON ÉCRITE (R30), et il faut
     que la raison d'avant reste lisible pour qui passera après : le code-barres était premier
     depuis le 15/08 parce qu'il est **gratuit, illimité et pas caché derrière l'IA**.

     ⛔ ET LA DONNÉE MESURÉE VA DANS LE SENS DE L'ANCIEN ORDRE, autant l'écrire. Sur les 23
     entrées réelles du journal de Michel (export du 23/08) : **scan 6 · ciqual 4 · historique
     4 · ia-texte 3 · recherche 1 · manuel 1** (+4 anciennes sans provenance). Le chemin
     code-barres est donc le plus emprunté, et « à la main » le moins.
     👉 On applique quand même : c'est un arbitrage d'USAGE, pas un fait technique, et c'est
     Michel qui décide. La mesure est ici pour qu'on puisse revenir en arrière en connaissance
     de cause — pas pour contredire la consigne.

     ⚠️ ET « À LA MAIN » N'EST PAS GRATUIT : le champ libre part en estimation IA (c'est le
     chemin de son huile d'olive à 135 kcal). Mettre en rouge le bouton qui consomme du quota,
     à la place de celui qui n'en consomme pas, est le vrai coût de ce changement. À surveiller
     dans `origine` : si `ia` grimpe nettement, c'est ce bouton qui l'aura provoqué. */
  html+=`<div style="display:flex;gap:8px;margin-top:12px;">`
    +`<button class="btn btn-red" onclick="addFoodVia('main')" style="flex:1;padding:12px 6px;font-size:13px;line-height:1.25;">✏️<br>À la main</button>`
    +`<button class="btn btn-bg2" onclick="addFoodVia('label')" style="flex:1;padding:12px 6px;font-size:13px;line-height:1.25;">📸<br>Étiquette</button>`
    +`<button class="btn btn-bg2" onclick="addFoodVia('bc')" style="flex:1;padding:12px 6px;font-size:13px;line-height:1.25;">📷<br>Code-barres</button>`
    +`</div>`;

  /* 📋 RANGÉ PAR REPAS, EN SECTIONS DÉROULANTES (23/08/2026) — Michel : *« c'est un peu le
     foutoir là, il faudrait ranger tout ça. Là c'est une liste, il faut les ranger et créer des
     lignes déroulantes pour chaque section »*.
     ⭐ IL A RAISON, ET SA CAPTURE LE MONTRE : dîner, collation, déjeuner et petit-déj se
     suivaient dans le désordre parce que la liste était triée par HEURE DE SAISIE. On note son
     petit-déjeuner à midi, sa collation le soir — l'ordre de saisie n'est pas l'ordre du repas.
     ⭐ R13 — MÊME MOTIF QUE LE MENU ADMIN (ft-v955) : `<details>` natif, donc **zéro JS** ; ça
     tient même si un script tombe, et le clavier/lecteur d'écran le gèrent gratuitement.
     ⛔ UNE SECTION VIDE NE S'AFFICHE PAS : proposer « Collation 2 — 0 aliment » chaque jour
     ferait de l'écran une liste de ce qu'on n'a PAS mangé (R24).
     ⚠️ ET L'ÉTAT PLIÉ/DÉPLIÉ SURVIT AU RE-RENDU (`_journalReplie`) : sans ça, ajouter un aliment
     redéplierait tout ce que la personne vient de replier — le genre de détail qu'on ne voit
     qu'à la deuxième action, donc jamais en testant une fois. */
  if(entries.length){
    const groupes=(typeof FOOD_MEALS!=='undefined'?FOOD_MEALS:[]).map(m=>({
      m:m, items:entries.filter(e=>(e.meal||'dejeuner')===m.k)
    })).filter(g=>g.items.length);
    /* ⚠️ Un repas INCONNU (clé d'une ancienne version, ou donnée abîmée) ne doit pas disparaître
       de l'écran en silence : il est rattaché à un dernier groupe plutôt qu'escamoté. */
    const connues=(typeof FOOD_MEALS!=='undefined'?FOOD_MEALS:[]).map(m=>m.k);
    const orphelins=entries.filter(e=>connues.indexOf(e.meal||'dejeuner')<0);
    if(orphelins.length) groupes.push({m:{ic:'🍽️',lbl:'Autres'}, items:orphelins});

    html+=`<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">`;
    groupes.forEach(g=>{
      const kc=g.items.reduce((a,e)=>a+(e.kcal||0),0);
      const pr=g.items.reduce((a,e)=>a+(e.prot||0),0);
      const ouvert=!(_journalReplie&&_journalReplie[g.m.lbl]);
      html+=`<details class="jr-sec" ${ouvert?'open':''} ontoggle="_journalPli('${_escFood(g.m.lbl)}',this.open)" style="background:var(--bg2);border-radius:14px;box-shadow:inset 0 0 0 1px var(--sep);overflow:hidden;">`
        +`<summary style="list-style:none;cursor:pointer;padding:11px 13px;display:flex;align-items:center;gap:9px;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;">`
          +`<span style="font-size:18px;flex-shrink:0;">${g.m.ic}</span>`
          +`<span style="flex:1;min-width:0;font-size:13.5px;font-weight:700;color:var(--t1);">${g.m.lbl}`
            +`<span style="font-weight:400;color:var(--t3);font-size:11.5px;"> · ${g.items.length} aliment${g.items.length>1?'s':''} · P ${pr}</span></span>`
          +`<span style="font-size:13.5px;font-weight:800;color:var(--red);flex-shrink:0;">${kc}</span>`
        +`</summary>`
        +`<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px 9px;">`;
      g.items.forEach(e=>{
        html+=`<div onclick="openEditFood(${e.ts})" style="background:var(--bg3);border-radius:11px;padding:9px 11px;display:flex;align-items:center;gap:9px;cursor:pointer;">`
          +`<div style="flex:1;min-width:0;">`
            +`<div style="font-size:13px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escFood(e.name)}</div>`
            +`<div style="font-size:11px;color:var(--t3);">P ${e.prot||0} · G ${e.carbs||0} · L ${e.fat||0} · ✎ modifier</div>`
          +`</div>`
          +`<span style="font-size:13px;font-weight:700;color:var(--red);flex-shrink:0;">${e.kcal||0}</span>`
          +`<button onclick="event.stopPropagation();confirmRemoveFood(${e.ts})" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;">✕</button>`
        +`</div>`;
      });
      html+=`</div></details>`;
    });
    html+=`</div>`;
  }else{
    html+=`<div style="text-align:center;color:var(--t3);font-size:12px;padding:16px 8px;">`+(estAuj?`Aucun aliment noté aujourd'hui. Ajoute ton premier repas 👆`:`Rien de noté ce jour-là.`)+`</div>`;
  }
  el.innerHTML=html;
}
function _macroLine(lbl,cur,tgt,col){
  const pct=Math.min(100,Math.round(cur/Math.max(1,tgt)*100));
  return`<div style="margin-bottom:8px;">`
    +`<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="color:var(--t2);font-weight:600;">${lbl}</span><span style="color:var(--t3);">${cur} / ${tgt} g</span></div>`
    +`<div style="height:5px;border-radius:3px;background:var(--bg3);overflow:hidden;"><div style="height:100%;width:${pct}%;background:${col};border-radius:3px;"></div></div>`
    +`</div>`;
}
function _escFood(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

