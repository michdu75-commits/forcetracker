/* ══════════════════════════════════════════════════════════════════════════════════════
   TÉMOINS DES CORRECTIFS NUTRITION (17/09/2026) — scanner · portions · habitudes.

   ⛔ POURQUOI UN FICHIER À PART : une mutation doit pouvoir être éprouvée en secondes. Gardés
   dans le banc, ces témoins obligeraient à relancer une passe complète (> 20 min) pour chacune
   des mutations du contrôle négatif. C'est le patron posé par `accueil_mini.js`.
   ⭐ UN SEUL PROPRIÉTAIRE (R2) : le banc appelle ce module, le contrôle négatif aussi.
   ══════════════════════════════════════════════════════════════════════════════════════ */

/* ⚠️ Le nettoyeur retire les commentaires JS **et** HTML : la RAISON de chaque décision est
   écrite à côté du code (R30), donc les mots que ces témoins cherchent — `zxing-wasm`, `250`,
   `s.n>=2` — sont cités en toutes lettres dans les commentaires voisins. Un témoin qui lirait
   le fichier brut resterait vert pour toujours. C'est arrivé cinq fois cette semaine. */
const _nuC = x => String(x||'').replace(/<!--[\s\S]*?-->/g,'')
  .replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'])\/\/[^\n]*/gm,'$1');

const _corps = (n, src) => {
  const m = new RegExp('(?:async\\s+)?function\\s+'+n+'\\s*\\([^)]*\\)\\s*\\{').exec(src);
  if(!m) return '';
  let i = m.index + m[0].length - 1, d = 0;
  for(let j=i; j<src.length; j++){
    const c = src[j];
    if(c==='{') d++;
    else if(c==='}'){ d--; if(!d) return src.slice(i, j+1); }
  }
  return '';
};

module.exports.source = function(t, ROOT, fs, path){
  const app = fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
  const idx = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const scr = fs.readFileSync(path.join(ROOT,'screens.js'),'utf8');
  const A = _nuC(app), I = _nuC(idx), S = _nuC(scr);
  const sp = x => String(x||'').replace(/\s/g,'');

  console.log('\n-- B-CCCXXI. Correctifs Nutrition — scanner (source) --');

  /* ── CB10 : LE MOTEUR. C'est le point qui décide du chantier. ───────────────────────── */
  const SCAN = _nuC(_corps('scanBarcode', app));
  t('B-CCCXXI CB10 ⛔⛔ la porte UTILISATEUR demande `zxing-wasm`, PAS `zxing-js` — le banc a '+
    'mesuré 86,2 % contre 77,5 %, et rouvrir la porte sans changer ce mot aurait servi le moins '+
    'bon des quatre sans que personne le voie',
    /_bcMoteurDemande='zxing-wasm'/.test(sp(SCAN)) && !/_bcMoteurDemande='zxing-js'/.test(sp(SCAN)), sp(SCAN).slice(0,90));

  /* ── CB9 : LE LIVE. La voie qui a produit un faux EAN sur iPhone. ───────────────────── */
  t('B-CCCXXI CB9 ⛔⛔ le LIVE est éteint sur la porte utilisateur',
    /_bcLiveActif=false/.test(sp(SCAN)), '');
  const OBS = _nuC(_corps('openBarcodeScanner', app));
  t('B-CCCXXI CB9b ⛔⛔ et le décodage continu ne DÉCIDE plus rien sans ce drapeau : '+
    '`_bcTraiterCode` du live est gardé',
    /if\(_bcLiveActif\)_bcTraiterCode\(c\)/.test(sp(OBS)), '');
  /* ⭐ ET LE BANC, LUI, DOIT POUVOIR MESURER LE LIVE : on éteint la décision, pas l'instrument.
     *On ne désarme pas l'outil qui a trouvé le défaut.* */
  const BANC = _nuC(_corps('ouvrirBancScanner', app));
  t('B-CCCXXI CB9c ⭐ le banc Admin rallume le live (c\'est son métier de le mesurer)',
    /_bcLiveActif=true/.test(sp(BANC)) && /_isAdminUnlocked/.test(BANC), '');

  /* ── CB5-CB7 : LES TROIS USAGES QUI NE DOIVENT PAS DISPARAÎTRE ──────────────────────── */
  t('B-CCCXXI CB5 ⛔ la saisie manuelle des chiffres est intacte',
    /_manualBarcode\(\)/.test(I) && /id="af-bc-manual"/.test(I), '');
  t('B-CCCXXI CB6 ⛔ la lecture IA d\'ÉTIQUETTE nutritionnelle est intacte — ce n\'est PAS le '+
    'même usage que lire 13 chiffres',
    /onclick="readFoodLabel\(\)"/.test(I) && /function readFoodLabel/.test(app), '');
  t('B-CCCXXI CB7 ⛔ l\'estimation IA d\'un repas décrit est intacte',
    /function estimateFoodAI/.test(app) || /estimateFood/.test(A), '');
  t('B-CCCXXI CB4 ⭐ le SECOURS IA existe toujours et reste atteignable',
    /onclick="scanBarcodeIA\(\)"/.test(I) && /function scanBarcodeIA/.test(app), '');

  /* ── L'ORDRE À L'ÉCRAN DIT LA HIÉRARCHIE : le local AVANT le secours ────────────────── */
  t('B-CCCXXI CB1b ⭐⭐ le bouton du scanner LOCAL vient AVANT le secours IA dans l\'écran '+
    'd\'ajout — l\'ordre visuel est la seule chose que la personne lit',
    I.indexOf('onclick="scanBarcode()"') > 0
    && I.indexOf('onclick="scanBarcode()"') < I.indexOf('onclick="scanBarcodeIA()"'), '');

  /* ── CB8 : AUCUN APPEL IA SUR UN SCAN LOCAL RÉUSSI ──────────────────────────────────── */
  const TRAITE = _nuC(_corps('_bcTraiterCode', app));
  t('B-CCCXXI CB8 ⛔⛔ le chemin d\'un code local accepté ne contient AUCUN appel IA',
    !!TRAITE && !/_aiUrl|scanBarcodeIA|readBarcode/.test(TRAITE), '');
  t('B-CCCXXI CB3 ⭐ et il passe toujours par la validation puis la fusion : pas de première '+
    'chaîne numérique venue, pas de recherche avant validation',
    /_bcFusionnerCandidats/.test(TRAITE) && /function _eanValide/.test(app), '');

  /* ── LE PRÉCHARGEMENT : règle d'or #4 ───────────────────────────────────────────────── */
  const sw = _nuC(fs.readFileSync(path.join(ROOT,'sw.js'),'utf8'));
  t('B-CCCXXI CB11 ⛔ les moteurs lourds ne sont PAS préchargés (≈1,1 Mo pour tout le monde à '+
    'chaque mise à jour du cache) — ils se chargent à l\'ouverture du scanner',
    !/zxing_reader\.wasm/.test(sw) && !/quagga\.min\.js/.test(sw), '');

  console.log('\n-- B-CCCXXII. Correctifs Nutrition — portions (source) --');

  const PR = _nuC(_corps('_portionRaisonnable', app));
  t('B-CCCXXII P0 ⭐⭐ la quantité part de la portion OBSERVÉE',
    /_portionObservee\(al\.name\)/.test(sp(PR)), '');
  /* ⛔ LE PLAFOND UNIVERSEL N'EST PLUS LA LOGIQUE PRINCIPALE. Il n'est pas supprimé — il reste
     le garde-fou du cas « on ne sait rien » — mais il ne doit plus décider quand on sait. */
  t('B-CCCXXII P4 ⛔⛔ le plafond universel en grammes ne s\'applique PLUS quand une portion est '+
    'observée : la branche observée rend son résultat AVANT d\'atteindre `Math.min(g,maxG)`',
    sp(PR).indexOf('_portionObservee') < sp(PR).indexOf('Math.min(g,maxG)'), '');
  t('B-CCCXXII P3 ⛔ et le multiple est BORNÉ à 2 portions (1 le soir), jamais un nombre libre',
    /\[0\.5,1,1\.5,2\]\.filter\(x=>x<=\(soir\?1:2\)\)/.test(sp(PR)), '');
  const PO = _nuC(_corps('_portionObservee', app));
  t('B-CCCXXII P2 ⛔⛔ c\'est une MÉDIANE, pas une moyenne — une grosse saisie isolée ne doit '+
    'pas déplacer la référence pour toujours',
    !!PO && /v\.sort\(/.test(sp(PO)) && !/reduce|\/v\.length/.test(sp(PO)), '');
  const PN = _nuC(_corps('_portionsNotees', app));
  t('B-CCCXXII P10 ⛔⛔ une quantité ABSENTE n\'est pas comptée pour zéro',
    /e\.q==null/.test(sp(PN)), '');
  t('B-CCCXXII P11 ⛔ et on ne mélange pas les unités : seules `g` et `ml` entrent dans la médiane',
    /u!=='g'&&u!=='ml'/.test(sp(PN)), '');
  t('B-CCCXXII P6 ⭐⭐ le seuil de personnalisation est EXPLICITE et vaut 3 observations : '+
    'en dessous on s\'en sert, mais on n\'annonce pas « tes habitudes »',
    /const_PORTION_MIN_OBS=3/.test(sp(app)) && /perso:v\.length>=_PORTION_MIN_OBS/.test(sp(PO)), '');
  t('B-CCCXXII P7 ⛔ le repli générique se DÉCLARE comme générique (aucune fausse '+
    'personnalisation)',
    /source:'generique'/.test(sp(PR)) && /perso:false/.test(sp(PR)), '');
  t('B-CCCXXII P9 ⛔⛔ le CALCUL du manque reste exact : `_resteDuJour` n\'est pas touché par '+
    'la logique de suggestion',
    /cible\.calories-tot\.kcal/.test(sp(_nuC(_corps('_resteDuJour', app)))), '');

  /* ── §12 : LE DÉFICIT NON COUVRABLE SE DIT ──────────────────────────────────────────── */
  t('B-CCCXXII P8 ⛔⛔ quand les portions plausibles ne couvrent pas la moitié du reste, '+
    'l\'écran le DIT — et jamais le soir (anti-TCA, P21)',
    /Tes portions habituelles ne couvriraient pas/.test(S) && /!soir&&idees\.length/.test(sp(S)), '');

  console.log('\n-- B-CCCXXIII. Correctifs Nutrition — habitudes, diagnostic seul (source) --');

  /* ⛔⛔ C1 NE CHANGE AUCUNE RÈGLE. Michel : « je préfère un arrêt propre avec une mesure réelle
     à un seuil inventé. » Ces témoins figent donc DEUX choses opposées : que l'outil de mesure
     existe, ET que la règle n'a PAS bougé. */
  const RH = _nuC(_corps('_repasHabituels', app));
  t('B-CCCXXIII H0 ⛔⛔ PÉRIMÈTRE — la règle des habitudes n\'est PAS encore changée : le seuil '+
    'est toujours `s.n >= 2`, et il attend les données réelles de Michel',
    /s\.n>=2/.test(sp(RH)), '');
  const MH = _nuC(_corps('_mesureHabitudes', app));
  t('B-CCCXXIII H1 ⭐ l\'outil de mesure existe et compte les JOURS DISTINCTS',
    !!MH && /joursDistincts/.test(MH) && /s\.jours\[date\]=1/.test(sp(MH)), '');
  t('B-CCCXXIII H2 ⭐ il compte aussi les SEMAINES distinctes et les fenêtres 14 / 28 / 56 j',
    /semainesDistinctes/.test(MH) && /sur14/.test(MH) && /sur28/.test(MH) && /sur56/.test(MH), '');
  t('B-CCCXXIII H8 ⭐⭐ et il fournit le DÉNOMINATEUR : les jours réellement RENSEIGNÉS — sans '+
    'lui, quelqu\'un qui note une semaine sur deux voit ses habitudes diluées par son silence',
    /joursRenseignes/.test(MH) && /joursNotes\[e\.date\]=1/.test(sp(MH)), '');
  t('B-CCCXXIII H10 ⛔⛔ LECTURE SEULE : l\'outil n\'écrit rien, n\'envoie rien, ne montre aucun '+
    'secret',
    !/persist\(|localStorage\.setItem|fetch\(|_cloudSync/.test(MH)
    && !/authCode|token|S\.email/.test(MH), '');
  t('B-CCCXXIII H11 ⭐ il est derrière l\'Admin, comme les 16 autres outils (R13)',
    /onclick="loadHabitudesAdmin\(\)"/.test(I) && /id="admin-habitudes"/.test(I), '');

  /* ── LE PÉRIMÈTRE, NOMMÉMENT ────────────────────────────────────────────────────────── */
  console.log('\n-- B-CCCXXIV. Périmètre du chantier Nutrition (source) --');
  t('B-CCCXXIV ① ⛔⛔ l\'ACCUEIL est GELÉ : `renderHome` et `_renderHomeHero` intacts',
    /(?:^|\n)function renderHome\(/.test(scr) && /(?:^|\n)function _renderHomeHero\(/.test(scr), '');
  t('B-CCCXXIV ② ⛔⛔ la DOUANE est GELÉE : 4 écrivains, aucune règle devenue bloquante',
    (A.match(/_douaneLigne\(/g)||[]).length === 5, '');
  t('B-CCCXXIV ③ ⛔⛔ la CIBLE n\'est pas touchée : `calcTDEE` et `calcMacros` intactes',
    /function calcTDEE\(/.test(fs.readFileSync(path.join(ROOT,'state.js'),'utf8'))
    && /function calcMacros\(/.test(fs.readFileSync(path.join(ROOT,'state.js'),'utf8')), '');
  t('B-CCCXXIV ④ ⛔ les plafonds du soir restent en place (le garde-fou du cas sans historique)',
    /_RESTE_SOIR_MAX_G=150/.test(sp(app)) && /_RESTE_MAX_G=250/.test(sp(app)), '');
};

module.exports.ecran = async function(t, b, PORT){
  const cx = await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const pg = await cx.newPage(); const err=[]; pg.on('pageerror',e=>err.push(e.message));
  await pg.goto('http://localhost:'+PORT+'/index.html'); await pg.waitForTimeout(2200);

  console.log('\n-- B-CCCXXV. Correctifs Nutrition — comportement réel --');

  const R = await pg.evaluate(async () => {
    const o = {};
    const J = new Date().toISOString().slice(0,10);
    const jm = n => new Date(Date.now()-n*864e5).toISOString().slice(0,10);
    const ligne = (d,nom,q,kcal,c,meal) => ({id:'x'+Math.random(),date:d,meal:meal||'midi',ts:Date.now(),
      name:nom,kcal:kcal,prot:0,carbs:c,fat:0,q:q,u:'g',per100:{kcal:kcal/q*100,prot:0,carbs:c/q*100,fat:0}});

    /* ── P1 : portion stable observée → la proposition s'en approche ─────────────────── */
    S.foodLog = [ligne(jm(5),'PATES',140,490,100), ligne(jm(4),'PATES',140,490,100),
                 ligne(jm(3),'PATES',150,525,107), ligne(jm(2),'PATES',140,490,100)];
    o.obsStable = _portionObservee('PATES');
    o.p1 = _portionRaisonnable({name:'PATES',carbs:100,kcal:490,
             per100:{carbs:71.4,kcal:350}}, 'carbs', 300, false);

    /* ── P2 : UNE grosse valeur isolée ne doit pas déplacer la référence ─────────────── */
    S.foodLog = [ligne(jm(5),'PATES',140,490,100), ligne(jm(4),'PATES',140,490,100),
                 ligne(jm(3),'PATES',140,490,100), ligne(jm(2),'PATES',600,2100,428)];
    o.obsOutlier = _portionObservee('PATES');

    /* ── P3 : déficit ÉNORME → au plus 2 portions, jamais une inflation libre ────────── */
    S.foodLog = [ligne(jm(5),'BANANE',120,107,27), ligne(jm(4),'BANANE',120,107,27),
                 ligne(jm(3),'BANANE',115,102,26)];
    o.obsBanane = _portionObservee('BANANE');
    o.p3 = _portionRaisonnable({name:'BANANE',carbs:27,kcal:107,
             per100:{carbs:22.5,kcal:89}}, 'carbs', 900, false);

    /* ── P5 : aucune observation → repli générique, ET il se déclare ─────────────────── */
    S.foodLog = [];
    o.p5 = _portionRaisonnable({name:'RIZ INCONNU',carbs:80,kcal:350,
             per100:{carbs:28,kcal:130}}, 'carbs', 200, false);

    /* ── P6 : 1 seule observation → utilisée, mais `perso` reste FAUX ────────────────── */
    S.foodLog = [ligne(jm(2),'QUINOA',90,340,62)];
    o.obsUne = _portionObservee('QUINOA');

    /* ── P10 : une quantité ABSENTE n'est pas un zéro ────────────────────────────────── */
    S.foodLog = [{id:'z1',date:J,meal:'midi',ts:Date.now(),name:'FLOU',kcal:200,prot:0,carbs:50,fat:0,q:null,u:null},
                 ligne(jm(1),'FLOU',100,200,50), ligne(jm(2),'FLOU',100,200,50)];
    o.obsAbsente = _portionObservee('FLOU');

    /* ── le soir : au plus UNE portion ───────────────────────────────────────────────── */
    S.foodLog = [ligne(jm(3),'PATES',140,490,100), ligne(jm(2),'PATES',140,490,100),
                 ligne(jm(1),'PATES',140,490,100)];
    o.pSoir = _portionRaisonnable({name:'PATES',carbs:100,kcal:490,
                per100:{carbs:71.4,kcal:350}}, 'carbs', 900, true);

    /* ── H : l'outil de mesure, sur un jeu qui reproduit le cas PIZZA ────────────────── */
    S.foodLog = [];
    for(let i=0;i<8;i++) S.foodLog.push(ligne(jm(i*2+1),'ISO',30,110,2));      // 8 jours distincts
    /* ⚠️⚠️ AU DÎNER, ET C'EST UNE CORRECTION À MA FIXTURE. La signature d'un repas porte TOUS
       les aliments du couple (date, repas) : en poussant la pizza au même midi que le shaker,
       j'avais fabriqué « iso + pizza + pizza » — donc ni « iso » ni « pizza » n'existaient comme
       candidats et mes témoins rougissaient sur un outil parfaitement juste. *Ma fixture testait
       ma compréhension de la signature, pas la mesure.* Fait utile pour la règle future : un
       aliment n'est candidat que s'il est SEUL dans son repas. */
    /* ⚠️⚠️ ET CETTE FIXTURE A ÉTÉ REFAITE DEUX FOIS, PARCE QUE LA MESURE M'A APPRIS LA VRAIE
       FORME DES DONNÉES. Deux pizzas dans le MÊME dîner ne font pas « pizza notée 2 fois » :
       elles font un repas DIFFÉRENT, « pizza + pizza », qui n'existe qu'un jour — donc aucun
       candidat, ni pour l'un ni pour l'autre. *Le cas réel de Michel n'est pas celui-là* : ses
       3 pizzas tombent sur des repas distincts. On reproduit donc ça — 3 occurrences réparties
       sur 2 JOURS seulement, ce qui est exactement le cas que la règle actuelle promeut à tort. */
    S.foodLog.push(ligne(jm(3),'PIZZA',400,1345,120,'diner'));
    S.foodLog.push(ligne(jm(3),'PIZZA',400,1345,120,'gouter'));   /* même JOUR, autre repas */
    S.foodLog.push(ligne(jm(2),'PIZZA',400,1345,120,'diner'));
    const m = _mesureHabitudes();
    const par = n => m.candidats.find(c=>c.repas===n) || null;
    o.iso = par('iso'); o.pizza = par('pizza'); o.pizzaX2 = par('pizza + pizza');
    o.toutes = m.candidats.map(c=>c.repas+':'+c.total+'/'+c.joursDistincts);
    o.joursRenseignes = m.joursRenseignes.total;
    o.avantMesure = JSON.stringify(S.foodLog).length;
    _mesureHabitudes();
    o.apresMesure = JSON.stringify(S.foodLog).length;
    return o;
  });

  const J = x => JSON.stringify(x);
  t('B-CCCXXV P1 ⭐⭐ portion stable (140·140·150·140 g) → médiane 140 g, et la proposition est '+
    'un MULTIPLE simple de cette portion (280 = 2x140), jamais le nombre qui annulerait '+
    'le déficit (420 g) — un témoin qui fige une VALEUR mesure mon arithmétique, pas le produit',
    R.obsStable && R.obsStable.grammes === 140 && R.obsStable.perso === true
    && R.p1 && R.p1.source === 'observee'
    && [70,140,210,280].indexOf(+String(R.p1.texte).split(' ')[0]) >= 0,
    J(R.obsStable)+' '+J(R.p1&&R.p1.texte));
  t('B-CCCXXV P2 ⛔⛔ une grosse valeur isolée (600 g parmi trois 140 g) ne déplace PAS la '+
    'référence — la médiane reste 140, là où la moyenne aurait donné 255',
    R.obsOutlier && R.obsOutlier.grammes === 140, J(R.obsOutlier));
  t('B-CCCXXV P3 ⛔⛔ déficit ÉNORME (900 g de glucides) → au plus 2 portions observées, soit '+
    '240 g de banane, et JAMAIS une inflation libre',
    R.p3 && /240 g/.test(R.p3.texte), J(R.p3&&R.p3.texte));
  t('B-CCCXXV P4 ⛔⛔ et ce n\'est plus le plafond 250 g : deux aliments différents ne '+
    'proposent plus le même chiffre',
    R.p1 && R.p3 && R.p1.texte.split(' ')[0] !== R.p3.texte.split(' ')[0],
    J(R.p1&&R.p1.texte)+' vs '+J(R.p3&&R.p3.texte));
  t('B-CCCXXV P5 ⛔ aucune observation → repli GÉNÉRIQUE, et il le déclare',
    R.p5 && R.p5.source === 'generique' && R.p5.perso === false, J(R.p5));
  t('B-CCCXXV P6 ⭐⭐ UNE seule observation : elle sert de référence, mais `perso` reste FAUX — '+
    'on ne dit pas « tes habitudes » sur une seule valeur',
    R.obsUne && R.obsUne.n === 1 && R.obsUne.perso === false, J(R.obsUne));
  t('B-CCCXXV P10 ⛔⛔ une quantité ABSENTE est ÉCARTÉE, pas comptée pour zéro (sinon la '+
    'médiane de 100·100 tomberait à 100→0)',
    R.obsAbsente && R.obsAbsente.n === 2 && R.obsAbsente.grammes === 100, J(R.obsAbsente));
  t('B-CCCXXV P12 ⛔ le soir, au plus UNE portion',
    R.pSoir && /140 g/.test(R.pSoir.texte), J(R.pSoir&&R.pSoir.texte));

  t('B-CCCXXV H1 ⭐ la mesure voit 8 jours distincts pour un aliment vraiment régulier',
    R.iso && R.iso.joursDistincts >= 7 && R.iso.total === R.iso.joursDistincts, J(R.iso));
  t('B-CCCXXV H4 ⛔⛔ et 3 occurrences dont DEUX LE MÊME JOUR ne valent que 2 jours distincts — '+
    '3 occurrences ne valent que 2 JOURS — et c\'est précisément ce que le compteur brut '+
    'de la règle actuelle (`s.n>=2`) confond',
    R.pizza && R.pizza.total === 3 && R.pizza.joursDistincts === 2,
    J(R.pizza)+' | tous='+J(R.toutes));
  t('B-CCCXXV H5 ⭐⭐ la mesure classe donc l\'aliment régulier DEVANT la pizza, alors que le '+
    'compteur brut les met à 8 contre 3 sans rien dire de la répartition',
    R.iso && R.pizza && R.iso.joursDistincts > R.pizza.joursDistincts
    && R.iso.semainesDistinctes > R.pizza.semainesDistinctes, J(R.toutes));
  t('B-CCCXXV H10 ⛔⛔ LECTURE SEULE : la mesure ne modifie pas le journal',
    R.avantMesure === R.apresMesure, R.avantMesure+' vs '+R.apresMesure);
  t('B-CCCXXV ⛔ aucune erreur JavaScript pendant tout le bloc',
    err.length === 0, err.join(' | '));
  await cx.close();
};
