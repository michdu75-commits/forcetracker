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
  if(id==='coach'){const suggs=document.getElementById('coach-suggs');if(suggs&&coachHistory.length>0)suggs.style.display='none';updateCoachHeader();_updateCoachMorphoBtn();}
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
      {i:'📅',t:'Le calendrier de ton mois : tes jours de séance sont en rouge, les jours de RECORD cerclés en or 🏆. Les flèches ‹ › changent de mois, et tu peux taper une semaine pour voir le détail jour par jour.'},
      {i:'📊',t:'Les 4 stats du mois (volume, Big3, séances, poids) se calculent depuis tes séances et ton journal de poids.'},
      {i:'😴',t:'Ton sommeil se note directement sur l\'Accueil (juste sous le score de récup) : choisis la qualité + les heures. Oublié un jour ? Change la date (ex. hier) ou tape « ＋ Noter un jour oublié ». Un bon sommeil fait remonter ton score de récupération.'},
      {i:'📊',t:'« Historique du sommeil » (la barre repliable, tape la flèche) : un mini-graphique sur 7 ou 30 jours + la liste nuit par nuit. Tape une barre ou une ligne pour ajouter/corriger cette nuit. Les jours vides affichent « ＋ à renseigner ».'},
      {i:'🧠',t:'Milo apprend à te connaître : de temps en temps, il te pose une petite question sur l\'Accueil (« tu t\'entraînes plutôt le matin, non ? »). Tu réponds « Oui, c\'est vrai » ou « Pas vraiment » — rien n\'est retenu sans ton accord. Tout ce qu\'il a retenu est consultable et effaçable dans Menu → « Ce que Milo sait de toi ».'},
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
      {i:'🎯',t:'L\'objectif (muscle, perte de poids, force, rééquilibrage...) adapte tes macros et les conseils du Coach IA.'},
      {i:'🎽',t:'Discipline : choisis ta pratique (musculation, bodybuilding, force athlétique, haltérophilie) — le Coach IA adapte ses conseils à ta discipline.'},
      {i:'🥉',t:'Ton niveau (Débutant/Intermédiaire/Confirmé, dans la section Discipline) : le Coach s\'adapte, et il évolue tout seul avec tes séances et tes records — l\'app te félicite quand tu passes au niveau supérieur.'},
      {i:'🧬',t:'« Mon ADN sportif » (optionnel) : ce qui te caractérise DURABLEMENT — ta motivation, ton mode de vie (temps/lieu/matériel), tes préférences (exos aimés/détestés, style), ton expérience et tes zones fragiles. Milo s\'en sert pour des conseils vraiment personnels et réalistes. Différent de ton humeur du jour, que tu dis directement à Milo dans le chat. 🔒 Privé.'},
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
      {i:'💪',t:'Le graphique affiche ton 1RM estimé (Brzycki) par exercice — sans avoir besoin de tester à l\'échec.'},
      {i:'⚖️',t:'Log ton poids régulièrement (idéalement le matin à jeun) pour une courbe fiable. Tap sur une entrée pour la corriger.'},
      {i:'🏅',t:'18 badges en 4 catégories : évolution, performance, streak, spécial. Vérifie l\'onglet Badges pour les débloquer.'},
      {i:'📋',t:'Tap sur une séance passée dans l\'historique pour voir et modifier les kg/reps de chaque série. Sur chaque exercice de cette séance, l\'icône 📊 t\'ouvre sa progression (ton poids sur les dernières séances).'},
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
      {i:'🏋️',t:'Pendant une séance, le Coach la voit EN DIRECT : demande-lui un exercice équivalent si une machine est prise, un ajustement de charge, ou l\'ordre des exercices.'},
      {i:'🛡️',t:'Milo veille sur ta sécurité : il tient compte EN PRIORITÉ de tes zones fragiles (Profil → ADN sportif) et de ta santé (Profil → Santé). Sa règle = ADAPTER, pas t\'interdire : il réduit la charge/l\'amplitude ou change d\'exercice plutôt que de te dire « ne fais pas ». Devant une douleur forte, il conseille le repos et un pro (jamais de diagnostic).'},
      {i:'🧠',t:'Mémoire intelligente (Premium) : le Coach résume et retient le fil de vos échanges entre sessions.'},
      {i:'💾',t:'Tes conversations restent sauvegardées : tu retrouves ton fil même après avoir fermé l\'appli. Le bouton « + » en haut démarre une nouvelle discussion.'},
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
      setTimeout(()=>{ov.classList.remove('open');cnt.style.transform='';cnt.style.opacity='';cnt.style.transition='';},260);
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

function _renderHomeHero(){
  const el=document.getElementById('home-hero');if(!el)return;
  const detail=(typeof calcRecoveryDetail==='function')?calcRecoveryDetail():{score:calcRecoveryScore(),factors:[],tips:[]};
  const score=detail.score;
  const info=getRecoveryInfo(score);
  const circ=188.5;
  const offset=score!==null?+(circ*(1-score/100)).toFixed(1):circ;
  const ringColor=score!==null?info.color:'var(--t3)';
  let accent='52,211,153';
  if(score!==null&&score<40)accent='255,106,115';
  else if(score!==null&&score<60)accent='255,138,114';
  else if(score!==null&&score<80)accent='234,179,8';
  const hasPending=S.wkt&&S.wkt.exs&&S.wkt.exs.length;
  const ctaLabel=hasPending?'↩ Reprendre la séance':'Commencer une séance';
  const heroLabel=score===null?'Enregistre ton sommeil':score>=80?'Prêt à performer':score>=60?'Bonne récupération':score>=40?'Récupération modérée':'Fatigué';
  const heroDesc=score===null?'Renseigne ton sommeil ce soir pour obtenir ton score de récupération.':info.rec.length>90?info.rec.substring(0,90)+'…':info.rec;
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
      +(tipsHtml?'<div style="margin-top:9px;background:var(--bg3);border-radius:10px;padding:9px 11px;font-size:12px;color:var(--t2);line-height:1.5;display:flex;flex-direction:column;gap:5px;">'+tipsHtml+'</div>':'');
  }
  el.innerHTML='<div style="padding:20px;border-radius:20px;background:radial-gradient(130% 100% at 0% 0%,rgba('+accent+',.10),transparent 55%),var(--bg2);box-shadow:inset 0 0 0 1px var(--sep);" class="ft-rise">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;">'
    +'<div style="font-family:var(--font-cond);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--t3);">AUJOURD\'HUI</div>'
    +pillHtml+'</div>'
    +'<div style="display:flex;align-items:flex-start;gap:16px;margin-top:14px;">'
    +'<div style="flex:none;display:flex;align-items:baseline;gap:2px;">'
    +'<span style="font-family:var(--font-cond);font-size:'+(score!==null?42:30)+'px;font-weight:800;color:var(--t1);line-height:.9;">'+(score!==null?score:'—')+'</span>'
    +(score!==null?'<span style="font-size:13px;color:var(--t3);font-weight:700;">/100</span>':'')
    +'</div>'
    +'<div style="flex:1;"><div style="font-size:16px;font-weight:700;color:var(--t1);">'+heroLabel+'</div>'
    +'<div style="font-size:12.5px;color:var(--t2);line-height:1.45;margin-top:3px;">'+heroDesc+'</div></div></div>'
    +'<div style="margin-top:14px;height:7px;border-radius:4px;background:var(--bg3);overflow:hidden;"><div style="height:100%;width:'+barW+'%;background:'+ringColor+';border-radius:4px;transition:width .4s;"></div></div>'
    +detailHtml
    +'<button onclick="startWorkout()" class="ft-press" style="margin-top:16px;width:100%;height:54px;border-radius:16px;background:linear-gradient(135deg,var(--red),#EF3E57);box-shadow:0 12px 28px -10px rgba(239,62,87,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg>'
    +'<span style="font-size:16px;font-weight:700;color:#fff;font-family:var(--font);">'+ctaLabel+'</span></button></div>';
}

// ─── Coach proactif — petit mot de Milo sur l'Accueil (brique 4) ──────────
// Choisit LE message le plus pertinent du jour à partir des données locales
// (aucun backend). Fermable, jamais 2× le même message le même jour.
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
  // Priorité : réengagement > relance > récup > lendemain > régularité
  if(daysSince!==null&&daysSince>=10)
    return {id:'retour',txt:'Content de te revoir 👋 On reprend tranquille — pas de record aujourd\'hui, on remet la machine en route.'};
  if(daysSince!==null&&daysSince>=4)
    return {id:'relance',txt:'Ça fait '+daysSince+' jours 👀 On se refait une séance aujourd\'hui ?'};
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
    +'<div style="flex:1;min-width:0;"><div class="milo-name">'+name+'</div><div class="milo-txt">'+m.txt+'</div></div>'
    +'<button class="milo-x" onclick="event.stopPropagation();_dismissMilo(\''+m.id+'\')" aria-label="Fermer"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    +'</div>';
}
function _dismissMilo(id){
  try{localStorage.setItem('ft4_milo',JSON.stringify({date:today(),id}));}catch(e){}
  const el=document.getElementById('home-milo');if(el)el.innerHTML='';
}
// ─── Observation de Milo à valider (Dossier Athlète, brique 5A) ───
function _obsEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function _renderObsCard(){
  const el=document.getElementById('home-obs');if(!el)return;
  try{if(typeof maybeProposeObservation==='function')maybeProposeObservation();}catch(e){}
  const o=(typeof _pendingObs==='function')?_pendingObs():null;
  if(!o){el.innerHTML='';el.style.padding='0';return;}
  el.style.padding='14px 14px 0';
  const name=(typeof COACH_NAME!=='undefined'?COACH_NAME:'Milo');
  el.innerHTML='<div class="obs-card">'
    +'<div class="obs-head"><div class="milo-av"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>'
    +'<div class="obs-lead">'+name+' a une petite question…</div></div>'
    +'<div class="obs-txt">'+_obsEsc(o.ask||o.text||'')+'</div>'
    +'<div class="obs-btns">'
    +'<button class="obs-yes ft-press" onclick="validateObs(\''+o.id+'\')">Oui, c\'est vrai</button>'
    +'<button class="obs-no ft-press" onclick="rejectObs(\''+o.id+'\')">Pas vraiment</button>'
    +'</div></div>';
}
// « Ce que Milo sait de toi » — liste des observations validées (supprimables)
function openMiloKnows(){
  const ov=document.getElementById('ov-milo-knows');if(!ov)return;
  _renderMiloKnows();ov.classList.add('open');
  try{_markAnchorSeen('menu-row-miloknows');}catch(e){} // le point rouge « nouveauté » disparaît une fois la rubrique ouverte
}
function closeMiloKnows(){const ov=document.getElementById('ov-milo-knows');if(ov)ov.classList.remove('open');}
function _renderMiloKnows(){
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
// ─── VERROU « BÊTA TESTEUR » pour les features nutrition/séance issues des retours testeuses ───
// Réglage manuel des calories, objectif « Perte de gras + muscle » (recomposition) et « maxi » reps
// sont EN PROD mais visibles UNIQUEMENT pour les testeurs pour l'instant.
// 👉 POUR OUVRIR À TOUT LE MONDE : remplacer le corps par `return true;` (+ réactiver le pop-up
//    « Quoi de neuf » v15/16/17 et les red dots manual-kcal/goal-recomp/reps-maxi dans constants.js).
function _isNutriBeta(){ return (typeof _isTester==='function' && _isTester()); }
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
    +_sc("goScreen('progress',document.getElementById('nb-progress'))",'<path d="M6 12h12M4 9v6M8 8v8M16 8v8M20 9v6"/>','rgba(234,179,8,.14)','var(--gold)','<span id="h-big3" style="color:var(--orange)">'+(b3>0?Math.round(b3):'—')+'</span><span style="font-size:13px;color:var(--t2);font-weight:600;"> kg</span>','Big 3 · 1RM')
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
function _renderHomeCalendar(){
  const el=document.getElementById('home-secondary');if(!el)return;
  const sessSet={};(S.sessions||[]).forEach(s=>{if(s&&s.date)sessSet[s.date]=(sessSet[s.date]||0)+1;});
  const prSet=_calPrDays();
  const y=_calDate.getFullYear(), m=_calDate.getMonth();
  const todayY=_calYmd(new Date());
  const moName=_calDate.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const first=new Date(y,m,1);
  const startDow=(first.getDay()+6)%7;               // 0 = lundi
  const daysInMonth=new Date(y,m+1,0).getDate();
  const cells=[];
  for(let i=0;i<startDow;i++){cells.push({d:new Date(y,m,1-(startDow-i)),inMonth:false});}
  for(let day=1;day<=daysInMonth;day++){cells.push({d:new Date(y,m,day),inMonth:true});}
  while(cells.length%7!==0){const last=cells[cells.length-1].d;cells.push({d:new Date(last.getFullYear(),last.getMonth(),last.getDate()+1),inMonth:false});}
  const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  const navBtn=(dir,txt)=>'<button onclick="_calNav('+dir+')" style="width:34px;height:34px;border-radius:9px;border:none;background:var(--bg3);color:var(--t1);font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">'+txt+'</button>';
  let html='<div style="background:var(--bg2);border-radius:16px;box-shadow:inset 0 0 0 1px var(--sep);padding:14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
      +navBtn(-1,'‹')
      +'<span style="font-weight:800;font-size:15px;color:var(--t1);text-transform:capitalize;">📅 '+moName+'</span>'
      +navBtn(1,'›')
    +'</div>';
  if(_calZoomWeek===null){
    html+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:5px;">'
      +['L','M','M','J','V','S','D'].map(w=>'<div style="text-align:center;font-size:10px;color:var(--t3);font-weight:700;">'+w+'</div>').join('')+'</div>';
    weeks.forEach((wk,wi)=>{
      html+='<div onclick="_calZoom('+wi+')" class="ft-press" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px;cursor:pointer;border-radius:8px;">';
      wk.forEach(c=>{
        const ymd=_calYmd(c.d), has=sessSet[ymd], isPr=has&&prSet[ymd], isToday=ymd===todayY, num=c.d.getDate();
        // anneau : record = doré ; aujourd'hui = rouge ; les deux = doré (extérieur) + rouge (intérieur)
        const ring=(isPr&&isToday)?'box-shadow:inset 0 0 0 2px var(--gold),inset 0 0 0 3.5px var(--red);'
          :isPr?'box-shadow:inset 0 0 0 2px var(--gold);'
          :isToday?'box-shadow:inset 0 0 0 1.5px var(--red);':'';
        html+='<div style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:8px;font-size:12.5px;'
          +(c.inMonth?'color:var(--t1);':'color:var(--t3);opacity:.35;')
          +ring
          +(has?'background:rgba(255,45,85,.16);font-weight:800;':'')
          +'">'+num+((has&&!isPr)?'<span style="width:4px;height:4px;border-radius:50%;background:var(--red);margin-top:2px;"></span>':'')+'</div>';
      });
      html+='</div>';
    });
    html+='<div style="font-size:11px;color:var(--t3);text-align:center;margin-top:8px;">Tape une semaine pour la voir en détail 🔍</div>';
    if(Object.keys(prSet).length)html+='<div style="font-size:10.5px;color:var(--t3);text-align:center;margin-top:3px;"><span style="display:inline-block;width:11px;height:11px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--gold);vertical-align:-2px;"></span> = séance avec un nouveau record</div>';
  }else{
    const wk=weeks[_calZoomWeek]||[];
    html+='<button onclick="_calZoom(null)" style="width:100%;padding:8px;margin-bottom:8px;border:none;border-radius:9px;background:var(--bg3);color:var(--blue);font-weight:700;font-size:12px;cursor:pointer;touch-action:manipulation;">‹ Retour au mois</button>';
    wk.forEach(c=>{
      const ymd=_calYmd(c.d), isToday=ymd===todayY, isPr=prSet[ymd];
      const daySess=(S.sessions||[]).filter(s=>s.date===ymd);
      const dow=c.d.toLocaleDateString('fr-FR',{weekday:'short'});
      html+='<div onclick="'+(daySess.length?'goSessionsHistory()':'')+'" style="display:flex;align-items:center;gap:10px;padding:10px 6px;border-bottom:1px solid var(--sep);'+(isToday?'background:rgba(255,45,85,.06);':'')+(daySess.length?'cursor:pointer;':'')+'">'
        +'<div style="width:44px;text-align:center;flex-shrink:0;"><div style="font-size:10px;color:var(--t3);text-transform:capitalize;">'+dow+'</div><div style="font-size:17px;font-weight:800;color:'+(c.inMonth?'var(--t1)':'var(--t3)')+';">'+c.d.getDate()+'</div></div>'
        +'<div style="flex:1;min-width:0;font-size:12.5px;'+(daySess.length?'color:var(--t1);font-weight:600;':'color:var(--t3);')+'">'+(daySess.length?('💪 '+_escFood(daySess.map(_calSessLabel).join(', '))+(isPr?' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--gold);vertical-align:-1px;"></span> <span style="color:var(--gold);font-weight:800;">Record !</span>':'')):'Repos')+'</div>'
        +(daySess.length?'<span style="font-size:11px;color:var(--red);font-weight:700;flex-shrink:0;">'+daySess.length+'×</span>':'')
        +'</div>';
    });
  }
  html+='</div>';
  el.innerHTML=html;
}
function _calNav(dir){_calDate=new Date(_calDate.getFullYear(),_calDate.getMonth()+dir,1);_calZoomWeek=null;_renderHomeCalendar();}
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

