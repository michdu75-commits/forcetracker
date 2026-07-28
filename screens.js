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
  if(id!=='log')_releaseWakeLock();
  if(id==='home')renderHome();
  if(id==='log')renderLog();
  if(id==='progress')renderProgress();
  if(id==='nutrition'){renderNutrition();switchNuTab('macros',document.getElementById('ntab-macros'));}
  if(id==='setup'){_resetMenuView();renderSetup();_markAnchorSeen('menu-row-profil');}
  if(id==='cycle')renderCycleScreen();
  if(id==='coach'){const suggs=document.getElementById('coach-suggs');if(suggs&&coachHistory.length>0)suggs.style.display='none';updateCoachHeader();_updateCoachMorphoBtn();try{if(typeof _maybeAutoDebrief==='function')_maybeAutoDebrief();}catch(e){}}
  _markScreenSeen(id);
  _updateScreenDots(id);
  // Pill chrono flottante : show hors log, hide sur log
  if(typeof _updPill==='function')_updPill();
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
      {i:'🌡️',t:'« Ton check-in du jour » (en haut de l\'Accueil, optionnel, repliable) regroupe tout ce qui te concerne AUJOURD\'HUI : ton sommeil de la nuit, ton énergie, ton moral (😔 → 😄) et une éventuelle gêne/douleur. Replié, tu vois un résumé (😴 7h · 🙂 énergie · 😄 moral) ; tape pour le déplier et renseigner. Milo adapte ses conseils du jour — s\'il y a une douleur, le Gardien PROTÈGE cette zone en priorité ; si ton moral est bas, Milo se fait plus DOUX (dédramatise, valorise, sans jamais te juger — il reste ton coach sportif, jamais un psy). Ça repart à zéro chaque jour ; le ressenti prime toujours.'},
      {i:'😴',t:'Ton sommeil se note dans « Ton check-in du jour » (déplie la carte, en haut de l\'Accueil) : choisis la qualité + les heures. Oublié un jour ? Change la date (ex. hier) ou tape « ＋ Noter un jour oublié ». Un bon sommeil fait remonter ton score de récupération (contrairement au moral/à la douleur, qui n\'y touchent pas).'},
      {i:'📊',t:'« Historique du sommeil » (déplie le check-in, puis la barre repliable) : un mini-graphique sur 7 ou 30 jours + la liste nuit par nuit. Tape une barre ou une ligne pour ajouter/corriger cette nuit. Les jours vides affichent « ＋ à renseigner ».'},
      {i:'🩹',t:'Pour une zone qui fait mal : dans le check-in, tape directement le MUSCLE sur la figurine anatomique (vue de face + de dos) — il devient rouge. Les articulations (nuque, coude, poignet, genou, cheville) sont en boutons juste en dessous. Pour une zone comme le genou ou l\'épaule tu peux préciser le CÔTÉ (gauche/droite/les deux). Le Gardien protège cette zone du jour en priorité dans les conseils de Milo.'},
      {i:'💡',t:'Ton score de récup (sur NN/100) estime à quel point ton corps est prêt à s\'entraîner aujourd\'hui. Tape « Pourquoi ce score ? » juste en dessous pour voir, en clair, D\'OÙ il vient : sommeil, séance récente, âge, jours enchaînés… chaque facteur avec sa raison et son +/−. Il remonte au fil de la journée après une séance, et reste un simple repère — ton ressenti prime toujours.'},
      {i:'🧠',t:'Milo apprend à te connaître : de temps en temps, il te pose une petite question sur l\'Accueil (« tu t\'entraînes plutôt le matin, non ? »). Tu réponds « Oui, c\'est vrai » ou « Pas vraiment » — rien n\'est retenu sans ton accord. Tout ce qu\'il a retenu est consultable et effaçable dans Menu → « Ce que Milo sait de toi ».'},
      {i:'🌱',t:'Milo complète ton profil tout seul : s\'il manque une info de base (où tu t\'entraînes, combien de séances/semaine, la durée), il te propose de la remplir en 1 tap sur l\'Accueil — de vrais boutons, rien à écrire. Ta réponse va direct dans ton profil et ses conseils deviennent plus justes. Pas envie maintenant ? « Plus tard » et il te le redemandera une autre fois. (Utile surtout si tu as sauté ces questions à l\'inscription.)'},
      {i:'🔎',t:'Milo s\'adapte à ce que tu fais vraiment : il compare ce que tu as déclaré à ce qu\'il MESURE dans tes vraies séances. ① Ta FRÉQUENCE : s\'il repère un changement DURABLE (pas juste une semaine chargée), il te fait une petite vérification (« tu t\'entraînes plutôt 5×/sem maintenant, ça a changé ? »). ② Ton STYLE d\'entraînement : s\'il voit que tu t\'entraînes plutôt en FORCE (séries lourdes, peu de reps) alors que ton objectif est « prise de muscle » — ou l\'inverse — il te propose d\'ajuster ton objectif. Dans les deux cas : « Oui, mets à jour » ou « Non, garde comme ça ». Il ne change JAMAIS rien tout seul — il constate et te laisse décider.'},
      {i:'🚴',t:'Milo tient compte de tes autres sports : de temps en temps il te demande sur l\'Accueil si tu pratiques un autre sport (vélo, course, foot, natation…) — un tap pour répondre (« Aucun » est valable). Un autre sport change ta récupération ET ta dépense d\'énergie (donc tes calories), et Milo en tiendra compte dans ses conseils.'},
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
      {i:'⚠️',t:'Les macros s\'affichent correctement uniquement si le Profil est complet (âge, poids, taille, activité, objectif).'},
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
      {i:'⚖️',t:'Log ton poids régulièrement (idéalement le matin à jeun) pour une courbe fiable. Tap sur une entrée pour la corriger.'},
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
      {i:'🔤',t:'Tags de série : É = Échauffement (exclu du volume et des PRs) · N = Normal, par défaut, non affiché · X = Échec musculaire. Appuie sur la pastille pour changer, le nom complet s\'affiche en toast.'},
      {i:'⏱️',t:'Timer adaptatif : É = 45s · N = 2:10 · X = 4min. Boutons −15s/+15s et presets 1:00/1:30/2:00.'},
      {i:'⚡',t:'Super-séries : bouton "⚡ Grouper" dès 2 exercices → sélectionne-les → "Lier en supersérie". Enchaînement automatique sans repos. Boutons 📉 Drop / 📈 +10% / 📉 −10% pour pyramides et drop sets.'},
      {i:'🔁',t:'« maxi » : dans l\'éditeur de programme, touche le bouton « max » à côté des reps d\'une série pour viser le maximum de répétitions (au lieu d\'un chiffre exact). En séance, la case affiche « max » et tu notes ce que tu as vraiment fait.'},
      {i:'✋',t:'Superset au doigt : sur un exercice pas encore en superset, attrape la petite poignée (6 points, à côté du ⋯) et glisse-le sur un autre exercice → le superset se crée tout seul. Plus rapide que le bouton "⚡ Grouper". Pour défaire : "↩ Retirer". Marche aussi dans l\'éditeur de programme (✏️) : glisse une carte exercice sur une autre.'},
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
    ],
    female:[]
  },
  coach:{
    title:'🤖 Coach IA',
    tips:[
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
      {i:'🔓',t:'10 questions gratuites, puis Premium illimité (4,99 € / 2 mois via Ko-fi).'},
    ],
    female:[
      {i:'🌸',t:'Mentionne ta phase de cycle ("je suis en phase lutéale") pour des conseils nutrition et entraînement adaptés à ton moment.'},
      {i:'🧬',t:'L\'analyse de morphologie 3 photos (Premium) te donne un profil silhouette détaillé avec axes de progression spécifiques.'},
    ]
  }
};

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
    const ecg=w.querySelector('#rj-ecg path');
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
    detailHtml='<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:5px 7px;font-size:11px;color:var(--t3);align-items:center;">'+fx+'</div>'
      +'<button onclick="openRecoWhy()" style="margin-top:9px;background:none;border:none;padding:0;color:var(--blue);font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;gap:3px;-webkit-tap-highlight-color:transparent;">Pourquoi ce score ?<span style="font-size:12px;">›</span></button>'
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
          +'<div id="rj" onclick="ringReplay()" class="ft-press" style="--p:'+score+';margin-top:-26px;">'
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
    +'<span style="font-size:16px;font-weight:700;color:#fff;font-family:var(--font);">'+ctaLabel+'</span></button></div>';
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
    +'<div style="margin-top:14px;background:var(--bg3);border-radius:12px;padding:11px 13px;font-size:13px;color:var(--t2);line-height:1.5;">'+info.rec+'</div>'
    +'<div style="margin-top:10px;font-size:11.5px;color:var(--t3);line-height:1.5;text-align:center;">Il se recalcule chaque jour et remonte au fil de la journée. Ce n\'est qu\'un repère — <b>ton ressenti prime toujours</b>.</div>';
  document.getElementById('ov-reco-why').classList.add('open');
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
  const np=S.nextPlanned;
  if(np&&np.date){
    const pdiff=Math.round((new Date(np.date+'T12:00:00')-new Date(tStr+'T12:00:00'))/864e5);
    const doneSince=lastDate&&lastDate>=np.date; // une séance a été enregistrée le jour prévu ou après → annonce honorée
    if(isNaN(pdiff)||pdiff<0||doneSince){
      try{S.nextPlanned=null;persist();}catch(e){} // annonce périmée : on nettoie, on retombe sur la logique normale
    }else{
      const lab=np.label?(' '+np.label):'';
      if(pdiff===0)return {id:'prevu-jour',txt:'C\'est le jour de ta séance'+lab+' 💪 On la prépare ?'};
      const when=(typeof _frDayLabel==='function')?_frDayLabel(np.date):np.date;
      return {id:'prevu',txt:'Séance'+lab+' prévue '+when+' 💪 Je m\'en souviens — repose-toi bien d\'ici là.'};
    }
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
function _renderDayStateCard(){
  const el=document.getElementById('home-daystate');if(!el)return;
  const d=_dayState();
  // La carte sommeil (#log-sleep) est la partie basse du check-in : visible uniquement quand le check-in est déplié.
  const sleepEl=document.getElementById('log-sleep');if(sleepEl)sleepEl.style.display=_checkinOpen?'':'none';
  if(!_checkinOpen){
    const sum=_checkinSummary();
    const chev='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>';
    el.innerHTML='<div class="ds-card" onclick="toggleCheckin()" style="cursor:pointer;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">'
      +'<div style="min-width:0;"><div class="ds-ttl" style="margin:0;">🌡️ Ton check-in du jour</div>'
      +'<div class="ds-sub" style="margin-top:4px;'+(sum?'color:var(--t1);font-weight:600;':'')+'">'+(sum||'Note ton énergie, ton moral et ton sommeil')+'</div></div>'
      +chev+'</div></div>';
    return;
  }
  const painSet=new Set((d.pains||[]).map(p=>p&&p.zone));
  const enBtns=_DAY_ENERGY.map((e,i)=>'<button class="ds-en'+(d.energy===i?' on':'')+'" onclick="setDayEnergy('+i+')">'+e+'</button>').join('');
  const moBtns=_DAY_MOOD.map((e,i)=>'<button class="ds-en'+(d.mood===i?' on':'')+'" onclick="setDayMood('+i+')">'+e+'</button>').join('');
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
    +'<div class="ds-sub">Ton énergie :</div>'
    +'<div class="ds-row">'+enBtns+'</div>'
    +'<div class="ds-sub">Ton moral :</div>'
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
const _CAL_REGIONS={
  haut: ['pec','front-delt','side-delt','triceps'],
  dos:  ['lats','traps','rear-delt','biceps','forearms','lower-back'],
  bas:  ['quads','hamstrings','glutes','calves','hip-flexors','tibialis'],
  tronc:['abs','obliques']
};
const _CAL_REGION_COLOR={haut:'var(--red)',dos:'var(--blue)',bas:'var(--purp)',tronc:'var(--orange)',full:'var(--green)'};
const _calColorCache={};   // _mscScores est coûteux et le calendrier se redessine à chaque flèche
function _calSessColor(s){
  if(!s||!s.date)return 'var(--red)';
  // ⚠️ la clé doit tenir compte de TOUS les exercices : deux séances du même jour avec
  // le même nombre d'exos et le même premier exo partageraient sinon la même couleur
  // (trouvé par CAL-003 : « Squat + DC + Rowing » héritait de la couleur de « Squat + Presse + Leg Curl »).
  const key=s.date+'|'+(s.exs||[]).map(e=>(e&&e.name)||'').join('~');
  if(_calColorCache[key])return _calColorCache[key];
  let col='var(--red)';
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
        if(hautCorps>=.25&&basCorps>=.25)col=_CAL_REGION_COLOR.full;
        else{
          let best='',bv=0;for(const r in tot){if(tot[r]>bv){bv=tot[r];best=r;}}
          col=_CAL_REGION_COLOR[best]||'var(--red)';
        }
      }
    }
  }catch(e){}
  _calColorCache[key]=col;
  return col;
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
function toggleKeto(){
  S.keto=!S.keto; persist();
  renderNutrition();
  if(typeof toast==='function')toast(S.keto?'🥑 Régime cétogène activé':'Régime cétogène désactivé','info');
}

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
function renderNutrition(){try{
  renderSupplements();
  // Phase buttons
  document.getElementById('pb-charge').classList.toggle('active',S.nutritionPhase==='charge');
  document.getElementById('pb-decharge').classList.toggle('active',S.nutritionPhase==='decharge');
  // Goal banner
  const goal=S.goal||'muscle';
  const goalDelta={muscle:350,perte:-450,recomp:-250,force:200,equilibre:0,endurance:100}[goal]||350;
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

  const bmr=calcBMR(), tdee=calcTDEE();
  const hydra=fmt((S.bw*0.035)+0.5);
  document.getElementById('nu-bmr').textContent=bmr.toLocaleString('fr-FR');
  document.getElementById('nu-tdee').textContent=tdee.toLocaleString('fr-FR');
  const todayStr=today();
  const todaySess=S.sessions.find(s=>s.date===todayStr);
  const sessCals=todaySess&&todaySess.calories?todaySess.calories:0;
  const totalCals=tdee+sessCals;
  document.getElementById('nu-session-cal').textContent=sessCals>0?sessCals.toLocaleString('fr-FR')+' kcal':'— (pas de séance)';
  document.getElementById('nu-total-cal').textContent=(sessCals>0?totalCals:tdee).toLocaleString('fr-FR')+' kcal';
  document.getElementById('nu-hydra').textContent=hydra;

  // Régime cétogène (keto, retour Emma) : bascule visible par tous
  const ketoEl=document.getElementById('nu-keto');
  if(ketoEl){
    const on=!!S.keto;
    ketoEl.innerHTML='<div onclick="toggleKeto()" style="display:flex;align-items:center;gap:10px;cursor:pointer;background:'+(on?'rgba(52,199,89,.1)':'var(--bg2)')+';border:1px solid '+(on?'rgba(52,199,89,.35)':'var(--sep)')+';border-radius:12px;padding:10px 12px;margin-bottom:10px;">'
      +'<span style="font-size:20px;">🥑</span>'
      +'<div style="flex:1;line-height:1.3;"><div style="font-size:13.5px;font-weight:800;color:var(--t1);">Régime cétogène (keto)</div>'
      +'<div style="font-size:11.5px;color:var(--t3);">'+(on?'Actif — 5% glucides · 15% protéines · 80% lipides':'Très peu de glucides, beaucoup de lipides')+'</div></div>'
      +'<div style="width:42px;height:24px;border-radius:12px;background:'+(on?'var(--green)':'var(--sep)')+';position:relative;flex-shrink:0;transition:background .2s;"><div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:'+(on?'20px':'2px')+';transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.3);"></div></div>'
      +'</div>';
  }

  const macros=calcMacros(S.nutritionPhase);
  document.getElementById('m-kcal').textContent=macros.calories.toLocaleString('fr-FR');
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
      adj.innerHTML='<button onclick="openKcalEdit()" class="btn" style="width:100%;padding:11px;font-size:13.5px;background:var(--bg2);color:var(--t2);border:1px solid var(--sep);font-weight:700;">✎ Ajuster mes calories à la main</button>';
    }
  }
  document.getElementById('m-prot').textContent=macros.prot_g;
  document.getElementById('m-carbs').textContent=macros.carbs_g;
  document.getElementById('m-fat').textContent=macros.fat_g;
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
  document.getElementById('meal-plan').innerHTML=meals.map(m=>`
    <div class="meal-row">
      <div style="flex:1;">
        <div class="meal-name">${_escNote(m.name)}</div>
        <div class="meal-detail">${_escNote(m.desc)}</div>
        <div class="meal-detail" style="margin-top:3px;color:var(--t3);">P: ${m.prot}g · G: ${m.carbs}g · L: ${m.fat}g</div>
      </div>
      <div class="meal-kcal">${m.kcal} kcal</div>
    </div>`).join('');
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
      <div style="font-size:12px;color:var(--t2);">Premium : semaine complète + régénérations illimitées — <strong style="color:var(--gold);">4,99€/2 mois</strong></div>
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
function renderFoodJournal(){
  const el=document.getElementById('food-journal');if(!el)return;
  const td=today();
  const hasProfile=S.bw&&S.age&&S.height;
  const target=hasProfile?calcMacros(S.nutritionPhase):null;
  const tot=(typeof _foodTotals==='function')?_foodTotals(td):{kcal:0,prot:0,carbs:0,fat:0};
  const entries=(S.foodLog||[]).filter(e=>e.date===td).sort((a,b)=>b.ts-a.ts);

  let html='';
  // Résumé du jour
  if(target){
    const rem=target.calories-tot.kcal;
    const pct=Math.min(100,Math.round(tot.kcal/Math.max(1,target.calories)*100));
    const remCol=rem<0?'var(--red)':'var(--green)';
    html+=`<div style="background:var(--bg2);border-radius:16px;padding:16px;box-shadow:inset 0 0 0 1px var(--sep);">`
      +`<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">`
        +`<span style="font-size:12px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Aujourd'hui</span>`
        +`<span style="font-size:12px;color:${remCol};font-weight:700;">${rem>=0?rem+' kcal restantes':Math.abs(rem)+' kcal au-dessus'}</span>`
      +`</div>`
      +`<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">`
        +`<span style="font-family:var(--font-cond);font-size:30px;font-weight:900;color:var(--t1);line-height:1;">${tot.kcal}</span>`
        +`<span style="font-size:13px;color:var(--t3);">/ ${target.calories} kcal</span>`
      +`</div>`
      +`<div style="height:8px;border-radius:5px;background:var(--bg3);overflow:hidden;margin-bottom:12px;"><div style="height:100%;width:${pct}%;background:${rem<0?'var(--red)':'var(--red)'};border-radius:5px;"></div></div>`
      +_macroLine('Protéines',tot.prot,target.prot_g,'var(--green)')
      +_macroLine('Glucides',tot.carbs,target.carbs_g,'var(--orange)')
      +_macroLine('Lipides',tot.fat,target.fat_g,'var(--gold)')
      +`</div>`;
  }else{
    html+=`<div style="background:var(--bg2);border-radius:14px;padding:16px;text-align:center;color:var(--t3);font-size:13px;box-shadow:inset 0 0 0 1px var(--sep);">Remplis ton profil (âge, taille, poids) pour comparer à tes objectifs.</div>`;
  }

  // Bouton ajouter
  html+=`<button class="btn btn-red" onclick="openAddFood()" style="width:100%;padding:14px;font-size:15px;margin-top:12px;">➕ Ajouter un aliment</button>`;

  // Liste des entrées du jour
  if(entries.length){
    html+=`<div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">`;
    entries.forEach(e=>{
      const mi=(typeof _foodMealInfo==='function')?_foodMealInfo(e.meal):{ic:'🍽️',lbl:''};
      html+=`<div onclick="openEditFood(${e.ts})" style="background:var(--bg2);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;box-shadow:inset 0 0 0 1px var(--sep);cursor:pointer;">`
        +`<span style="font-size:20px;flex-shrink:0;">${mi.ic}</span>`
        +`<div style="flex:1;min-width:0;">`
          +`<div style="font-size:13px;font-weight:600;color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escFood(e.name)}</div>`
          +`<div style="font-size:11px;color:var(--t3);">${mi.lbl} · P ${e.prot||0} · G ${e.carbs||0} · L ${e.fat||0} · ✎ modifier</div>`
        +`</div>`
        +`<span style="font-size:13px;font-weight:700;color:var(--red);flex-shrink:0;">${e.kcal||0}</span>`
        +`<button onclick="event.stopPropagation();confirmRemoveFood(${e.ts})" style="background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;">✕</button>`
      +`</div>`;
    });
    html+=`</div>`;
  }else{
    html+=`<div style="text-align:center;color:var(--t3);font-size:12px;padding:16px 8px;">Aucun aliment noté aujourd'hui. Ajoute ton premier repas 👆</div>`;
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

