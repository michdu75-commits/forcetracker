#!/usr/bin/env node
/**
 * INSTANTANE DES 8 PORTES QUI FABRIQUENT UN POUR-100 g — le critere de reussite de l'etape 1a.
 *
 * Michel, plan d'execution : *« aucune valeur attendue modifiee »*. Une passe verte ne suffit pas
 * a le prouver : elle prouve que ce que les temoins REGARDENT n'a pas bouge. Ce fichier dumpe la
 * SORTIE BRUTE des 8 portes (`_bcNutr` + `_afSrc.per100`) pour qu'on puisse comparer octet pour
 * octet avant / apres l'extraction.
 *
 *   node tools/instantane_ref100.js > /tmp/avant.json     (avant de toucher au code)
 *   node tools/instantane_ref100.js > /tmp/apres.json     (apres)
 *   diff /tmp/avant.json /tmp/apres.json                  -> DOIT etre vide
 *
 * ⛔ LES DEUX PORTES RESEAU SONT BOUCHONNEES AU BON ENDROIT, ET C'EST DIT : on remplace
 *    `_offFetchProduct` et `fetch` (la couche transport), PAS l'analyse. La ligne qui lit
 *    `energy-kcal_100g` puis se rabat sur `energy_100g / 4.184` s'execute donc pour de vrai —
 *    c'est elle qu'on veut mesurer. *Un bouchon pose trop haut mesurerait le bouchon.*
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

const seed=`(()=>{try{
  localStorage.setItem('ft4_name','Testeur');localStorage.setItem('ft4_bw','80');
  localStorage.setItem('ft4_age','30');localStorage.setItem('ft4_ht','178');
  localStorage.setItem('ft4_gender','H');localStorage.setItem('ft4_act','1.55');
  localStorage.setItem('ft4_goal','muscle');window._demoMode=true;
}catch(e){}})();`;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(seed);
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

const snap=await p.evaluate(async()=>{
  const out={};
  // On fige la sortie des DEUX objets que l'extraction touche : la reference d'ecran et la
  // provenance qui descend jusqu'a la ligne enregistree.
  const prendre=()=>({ bcNutr: _bcNutr ? JSON.parse(JSON.stringify(_bcNutr)) : null,
                       per100: (_afSrc && _afSrc.per100) ? JSON.parse(JSON.stringify(_afSrc.per100)) : null,
                       etat  : _afSrc ? (_afSrc.etat||null) : null,
                       saisie: _afSrc ? (_afSrc.saisie||null) : null });

  // ⛔ Des valeurs DECIMALES et non rondes partout : un instantane sur des entiers ne verrait pas
  //    un arrondi qui apparait ou qui disparait. C'est le defaut que l'etape 1a risque d'introduire.
  const FICHE={ product_name_fr:'Lentilles Cuisinees', brands:'Raynal & Roquelaure',
                quantity:'410 g', serving_quantity:205, categories_tags:['en:canned-lentils'],
                code:'3021690201123',
                nutriments:{ 'energy-kcal_100g':48.34, 'proteins_100g':6.13,
                             'carbohydrates_100g':10.07, 'fat_100g':3.17 } };
  // La jumelle SANS energy-kcal_100g : c'est le repli kJ, la ligne exacte qu'on veut proteger.
  const FICHE_KJ={ product_name_fr:'Repli kJ', brands:'', quantity:'', serving_quantity:0,
                   categories_tags:[], code:'0000000000000',
                   nutriments:{ 'energy_100g':202, 'proteins_100g':6.13,
                                'carbohydrates_100g':10.07, 'fat_100g':3.17 } };

  // 1 — scan code-barres (le reseau est bouchonne, l'analyse est la vraie)
  window._offFetchProduct=async()=>FICHE;
  openAddFood(); await _lookupBarcode('3021690201123','scan',false);
  out['1_scan']=prendre();

  // 1bis — le repli kJ, meme porte
  window._offFetchProduct=async()=>FICHE_KJ;
  openAddFood(); await _lookupBarcode('0000000000000','scan',false);
  out['1bis_scan_repli_kJ']=prendre();

  // 2 — etiquette recopiee a la main (_calAppliquer) : passe par les champs de l'ecran
  openAddFood();
  document.getElementById('af-desc').value='Isolat';
  ['kcal','prot','carbs','fat'].forEach((k,i)=>{const e=document.getElementById('af-cal-'+k);
    if(e) e.value=[382.4,78.6,4.2,1.8][i];});
  _calAppliquer();
  out['2_etiquette_main']=prendre();

  // 3 — photo d'etiquette (transport bouchonne, analyse reelle)
  openAddFood();
  window._resizeToB64=async()=>'xxx';
  window.fetch=async()=>({json:async()=>({status:'ok', name:'Skyr', serving:150,
                          kcal100:63.4, prot100:11.2, carbs100:3.9, fat100:0.2})});
  await onFoodLabelFile({files:[{}]});
  out['3_photo_etiquette']=prendre();

  // 4 — recherche Open Food Facts par nom
  openAddFood(); _afSuggOff=[FICHE]; _afSuggPrendreOff(0);
  out['4_recherche_off']=prendre();

  // 5 — CIQUAL  (format tableau : [id, nom, ?, kcal, prot, carbs, fat, ...])
  openAddFood(); _afSuggCiq=[['12345','Riz blanc, cuit, sans sel ajoute','',129.7,2.61,28.03,0.33]];
  _afSuggPrendreCiqual(0);
  out['5_ciqual']=prendre();

  // 6 — marques  (index dans _marques.a ; a[8]=kcal derivee, a[9]=doute)
  openAddFood();
  /* ⛔ PIEGE DE SONDE, ET IL A MENTI EN SILENCE : `_marques` est un `let` de module, donc
     `window._marques = ...` NE L'ATTEINT PAS — la porte sortait `_bcNutr = null` et cet
     instantane ne mesurait RIEN pour elle, sans le dire. *Un instantane qui rend `null` ressemble
     a un instantane.* On assigne la variable lexicale directement. */
  _marques={a:[['MacDo','Big Mac','',503.2,26.1,41.4,25.7,215,0,'']]};
  _afSuggMarq=[0]; _afSuggPrendreMarque(0);
  out['6_marque']=prendre();

  // 7 — reprise depuis le journal  (porte NON normalisee : c'est l'exception a proteger)
  openAddFood();
  _afSuggLoc=[{name:'Steak hache',kcal:250,prot:26,carbs:0,fat:16,
               per100:{kcal:166.67,prot:17.33,carbs:0,fat:10.67},q:150,u:'g',
               origine:'reprise',sourceId:null,etat:null}];
  _afSuggPrendreLocale(0);
  out['7_reprise_journal']=prendre();

  // 8 — Mes aliments  (porte NON normalisee elle aussi)
  openAddFood();
  _afQuickItems=[{name:'Yaourt nature',kcal:60,prot:4,carbs:5,fat:2,
                  per100:{kcal:47.62,prot:3.17,carbs:3.97,fat:1.59},q:126,u:'g',fav:true}];
  quickFillFood(0);
  out['8_mes_aliments']=prendre();

  return out;
});

console.log(JSON.stringify(snap,null,2));
if(errs.length) console.error('ERREURS DE PAGE :\n'+errs.join('\n'));
await b.close(); srv.close();
})();
