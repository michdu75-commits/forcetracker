#!/usr/bin/env node
/**
 * GÉNÈRE LE GABARIT DE LA FIGURINE — docs/figurine-gabarit.svg
 *
 * POURQUOI. Quand on commande une figurine anatomique, l'illustrateur nomme ses formes
 * comme il veut (« Calque 12 », « forme 47 »). On se retrouve alors devant 80 tracés
 * anonymes à identifier un par un — long, et surtout on se trompe quelque part, ce qui
 * fait s'allumer un muscle à la place d'un autre sans que rien ne le signale.
 *
 * LE GABARIT est un SVG déjà ÉTIQUETÉ : les 80 emplacements portent leur nom définitif
 * et leurs attributs. L'illustrateur dessine dedans au lieu d'inventer des noms.
 *
 * ⭐ ET IL PART DE LA FIGURINE ACTUELLE : là où un tracé existe déjà, il est repris tel
 *    quel avec son nouveau nom. L'illustrateur reçoit donc une vraie figurine à
 *    SUBDIVISER, pas une page blanche — c'est beaucoup plus sûr qu'un dessin repris de zéro.
 *
 * Lancer : node tools/gen_gabarit_figurine.js
 */
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=path.join(ROOT,'docs/figurine-reference-neutre.svg');

// ─── LA TABLE : nouveau nom ← ancien tracé (ou null = à dessiner)
// vue : 'front' | 'back' · code : le code musculaire de l'app qui le lira
const MUSCLES=[
 // muscle                  vue      code app        ancien tracé (null = à créer)
 ['pectoralis_upper',      'front','pec',           'chest-upper'],
 ['pectoralis_middle',     'front','pec',            null],
 ['pectoralis_lower',      'front','pec',           'chest-lower'],
 ['deltoid_anterior',      'front','front-delt',    'shoulder-front'],
 ['deltoid_lateral',       'front','side-delt',     'shoulder-side'],
 ['deltoid_posterior',     'back', 'rear-delt',     'deltoid-rear'],
 ['trapezius_upper',       'back', 'traps',         'traps-upper'],
 ['trapezius_middle',      'back', 'traps',         'traps-mid'],
 ['trapezius_lower',       'back', 'traps',         'traps-lower'],
 ['latissimus_upper',      'back', 'lats',          'lats-upper'],
 ['latissimus_middle',     'back', 'lats',          'lats-mid'],
 ['latissimus_lower',      'back', 'lats',          'lats-lower'],
 ['rhomboid',              'back', 'lats',           null],
 ['teres_major',           'back', 'lats',           null],
 ['serratus_anterior',     'front','obliques',      'serratus-anterior'],
 ['biceps',                'front','biceps',        'biceps'],
 ['brachialis',            'front','biceps',         null],
 ['triceps_long',          'back', 'triceps',       'triceps-long'],
 ['triceps_lateral',       'back', 'triceps',       'triceps-lateral'],
 ['forearm_flexors',       'front','forearms',      'forearm-flexors'],
 ['forearm_extensors',     'back', 'forearms',      'forearm-extensors'],
 ['rectus_upper',          'front','abs',           'abs-upper'],
 ['rectus_middle',         'front','abs',            null],
 ['rectus_lower',          'front','abs',           'abs-lower'],
 ['oblique_external',      'front','obliques',      'obliques'],
 ['oblique_internal',      'front','obliques',       null],
 ['erector_spinae_upper',  'back', 'lower-back',    'lower-back-erectors'],
 ['erector_spinae_lower',  'back', 'lower-back',    'lower-back-ql'],
 ['gluteus_maximus',       'back', 'glutes',        'gluteus-maximus'],
 ['gluteus_medius',        'back', 'glutes',        'gluteus-medius'],
 ['rectus_femoris',        'front','quads',         'quads'],
 ['vastus_lateralis',      'front','quads',          null],
 ['vastus_medialis',       'front','quads',          null],
 ['adductor',              'front','hip-flexors',   'adductors'],
 ['hip_flexor',            'front','hip-flexors',   'hip-flexor'],   // ⚠️ absent de la liste reçue
 ['hamstring_medial',      'back', 'hamstrings',    'hamstrings-medial'],
 ['hamstring_lateral',     'back', 'hamstrings',    'hamstrings-lateral'],
 ['tibialis_anterior',     'front','tibialis',      'tibialis-anterior'],
 ['gastrocnemius_medial',  'back', 'calves',        'calves-gastroc-medial'],
 ['gastrocnemius_lateral', 'back', 'calves',        'calves-gastroc-lateral'],
 ['soleus',                'back', 'calves',        'calves-soleus'],
];

const src=fs.readFileSync(SRC,'utf8');
const trace={};
for(const m of src.matchAll(/<path id="([a-z0-9\-]+)" d="([^"]+)"/g)) trace[m[1]]=m[2];
// les tracés SANS id = silhouette (peau, tête, mains, pieds)
const peau=[...src.matchAll(/<path d="([^"]+)" fill="url\(#g-skin\)"/g)].map(m=>m[1]);

let corps='', manquants=[], repris=0;
corps+='\n  <!-- ═══ SILHOUETTE (peau, tête, mains, pieds) — jamais coloriée ═══ -->\n';
peau.forEach((d,i)=>{ corps+=`  <path id="silhouette_${i+1}" class="silhouette" d="${d}" fill="#E8A888" stroke="#9A5838" stroke-width="0.15"/>\n`; });

['front','back'].forEach(vue=>{
  corps+=`\n  <!-- ═══ VUE ${vue==='front'?'AVANT':'ARRIÈRE'} ═══ -->\n`;
  MUSCLES.filter(m=>m[1]===vue).forEach(([nom,v,code,anc])=>{
    ['left','right'].forEach(cote=>{
      const id=nom+'_'+cote;
      const d=anc?trace[anc+'-'+cote]:null;
      if(d) repris++; else manquants.push(id);
      const att=`id="${id}" data-muscle="${nom}" data-side="${cote}" data-view="${v}" data-group="${code}"`;
      corps += d
        ? `  <path ${att} d="${d}" fill="#B86848" stroke="#5A2818" stroke-width="0.22"/>\n`
        : `  <path ${att} d="" fill="#FF2D55" stroke="#5A2818" stroke-width="0.22"><!-- ⚠️ À DESSINER --></path>\n`;
    });
  });
});

const entete=`<!--
  ══════════════════════════════════════════════════════════════════════════
  GABARIT DE FIGURINE — Force Tracker
  ══════════════════════════════════════════════════════════════════════════

  À LIRE AVANT DE DESSINER.

  Ce fichier n'est pas une image : c'est un FORMULAIRE. Chaque muscle a son
  emplacement, déjà nommé. Il ne faut RIEN renommer.

  CE QU'IL Y A DÉJÀ : ${repris} tracés repris de la figurine actuelle. Ils sont
  justes, ils servent de base — dans la plupart des cas il s'agit de les
  SUBDIVISER (le pectoral en trois, le quadriceps en trois…), pas de repartir
  de zéro.

  CE QU'IL RESTE À DESSINER : ${manquants.length} tracés, reconnaissables à leur
  attribut d="" vide et à leur couleur rouge vif. Ils sont listés en bas.

  LES RÈGLES, il n'y en a que quatre :
   1. Ne jamais changer un id, ni un attribut data-*.
   2. Un muscle = UN tracé <path> avec un attribut d=. Pas de <image>,
      pas de <g> imbriqué, pas de texte.
   3. Gauche et droite sont deux tracés distincts (_left et _right).
   4. Garder la zone de dessin : viewBox="-1 0 72 96", vue avant à gauche,
      vue arrière à droite.

  Les couleurs de ce fichier n'ont aucune importance : l'application les
  remplace. Seuls comptent le découpage et les noms.

  Vérification : le fichier rendu peut être contrôlé automatiquement
  (\`node tools/verif_figurine.js <fichier.svg>\`) — il dira en une seconde
  ce qui manque, AVANT que quoi que ce soit soit validé.
  ══════════════════════════════════════════════════════════════════════════
-->
`;
const pied='\n  <!-- ─── TRACÉS RESTANT À DESSINER ('+manquants.length+') ───\n       '+manquants.join('\n       ')+'\n  -->\n';
const svg=entete+`<svg viewBox="-1 0 72 96" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">`+corps+pied+`</svg>\n`;
fs.writeFileSync(path.join(ROOT,'docs/figurine-gabarit.svg'), svg);
console.log('gabarit écrit : docs/figurine-gabarit.svg');
console.log('  '+(MUSCLES.length*2)+' emplacements · '+repris+' repris de la figurine actuelle · '+manquants.length+' à dessiner');
console.log('  à dessiner : '+manquants.join(', '));
