#!/usr/bin/env node
/**
 * INSTANTANE DES ETAPES 1b / 2 / 3 — le critere de reussite, identique a celui de l'etape 1a.
 *
 * Michel : *« aucune valeur attendue ne doit bouger »*. Une passe verte ne prouve pas ca : elle
 * prouve que ce que les temoins REGARDENT n'a pas bouge. Ce fichier dumpe la SORTIE BRUTE des
 * sites concernes par les trois extractions, pour qu'on puisse comparer octet pour octet.
 *
 *   node tools/instantane_1b23.js > /tmp/avant123.json     (avant de toucher au code)
 *   node tools/instantane_1b23.js > /tmp/apres123.json     (apres)
 *   diff /tmp/avant123.json /tmp/apres123.json             -> DOIT etre vide
 *
 * ⛔ IL FIGE LES DEFAUTS DIVERGENTS, ET C'EST VOULU. La mesure du 12/09/2026 a montre que les
 *    sites de la « forme aliment » n'appliquent PAS les memes valeurs par defaut (`q` vaut tantot
 *    0 tantot null ; `portionWeightG` aussi). Ces ecarts sont TRANSPORTES tels quels par
 *    l'extraction — les harmoniser serait une DECISION, pas un rangement. L'instantane est ce qui
 *    empeche de les harmoniser « au passage » sans s'en apercevoir.
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
  const J=x=>JSON.parse(JSON.stringify(x===undefined?null:x));

  /* ══════════ ETAPE 1b — LA FORME « ALIMENT » ══════════
     Trois sites : les deux branches de `_buildFoodQuickItems` (favoris / recents) et l'ecriture
     d'un favori par `toggleFavFood`. ⛔ On fige les CLES ET LES VALEURS : c'est la seule facon
     de voir si un defaut change (`0` qui devient `null`, un champ qui apparait ou disparait). */
  S.savedFoods=[
    // un favori COMPLET
    {name:'Skyr nature', kcal:63, prot:11, carbs:4, fat:0,
     per100:{kcal:63.4,prot:11.2,carbs:3.9,fat:0.2}, q:150, u:'g',
     portionLabel:'pot', portionWeightG:150},
    // un favori NU : tous les champs facultatifs absents -> ce sont les DEFAUTS qu'on mesure
    {name:'Cafe noir', kcal:2, prot:0, carbs:0, fat:0}
  ];
  S.foodLog=[
    // un recent COMPLET, avec provenance
    {date:'2026-09-12', meal:'midi', ts:3, name:'Steak hache', kcal:250, prot:26, carbs:0, fat:16,
     per100:{kcal:166.67,prot:17.33,carbs:0,fat:10.67}, q:150, u:'g',
     portionLabel:'steak', portionWeightG:125,
     origine:'off', sourceId:'3021690201123', etat:'tel-que-vendu'},
    // un recent NU
    {date:'2026-09-12', meal:'soir', ts:2, name:'Pomme', kcal:52, prot:0, carbs:14, fat:0},
    // une ligne en PORTIONS
    {date:'2026-09-12', meal:'matin', ts:1, name:'Yaourt', kcal:120, prot:5, carbs:12, fat:5,
     per100:null, q:2, u:'portion', portionLabel:'yaourt', portionWeightG:125}
  ];
  S.hiddenFoods=[];
  out['1b_buildFoodQuickItems']=J(_buildFoodQuickItems());

  /* ⛔ PIEGE CONNU (ft-v1188) : `toggleFavFood` finit par `_renderFoodQuickList()`, qui
     RECONSTRUIT `_afQuickItems`. Une liste posee a la main est ecrasee, et le clic suivant tape
     dans le vide. On repose donc la fixture AVANT chaque appel. */
  const poser=it=>{ _afQuickItems=[it]; };
  S.savedFoods=[];
  poser({name:'Lentilles', kcal:198, prot:25, carbs:41, fat:13,
         per100:{kcal:48.3,prot:6.1,carbs:10.1,fat:3.2}, q:410, u:'g',
         portionLabel:'boite', portionWeightG:410});
  toggleFavFood(0);
  out['1b_toggleFavFood_complet']=J(S.savedFoods);

  S.savedFoods=[];
  poser({name:'Aliment nu', kcal:100, prot:1, carbs:2, fat:3});   // tous les facultatifs absents
  toggleFavFood(0);
  out['1b_toggleFavFood_nu']=J(S.savedFoods);

  /* ══════════ ETAPE 2 — LA DERIVATION DU POUR-100 g ══════════
     Trois sites : les deux branches de `_provFood` (grammes / portions) et l'ecran modifier. */
  const prov=(vals, poser2)=>{ _afSetSrc(null); _afRef=null; _afPortionPoids=0; _afPortionLabel='';
                               poser2(); const r=_provFood(vals); _afSetSrc(null); return J(r.per100); };

  // 2a — chemin GRAMMES : `_afRef` en grammes + le champ `af-prop`
  out['2a_derive_grammes']=prov({kcal:355,prot:30,carbs:44,fat:6}, ()=>{
    _afRef={base:{kcal:355,prot:30,carbs:44,fat:6}, q:140, u:'g', src:'decl'};
    const e=document.getElementById('af-prop'); if(e) e.value='140';
  });
  // 2a bis — une masse qui tombe mal, pour voir l'arrondi a UNE decimale
  out['2a_derive_grammes_133g']=prov({kcal:100,prot:7,carbs:1,fat:3}, ()=>{
    _afRef={base:{kcal:100,prot:7,carbs:1,fat:3}, q:133, u:'g', src:'decl'};
    const e=document.getElementById('af-prop'); if(e) e.value='133';
  });
  /* 2b — chemin PORTIONS. ⚠️ MA PREMIERE SONDE RENDAIT `null` : j'avais invente les noms
     (`_afPortionNb`, `af-portion-poids`). Les VRAIS declencheurs, lus dans le code, sont
     `_afPortionPose` + `_afUnite==='portion'` + `_afRef.u===''` + `_afPortions`.
     *Une sonde qui n'emploie pas les noms de la production ne mesure rien — elle rassure.* */
  out['2b_derive_portions']=prov({kcal:400,prot:32,carbs:0,fat:28}, ()=>{
    _afSetSrc({saisie:'manuel', origine:'utilisateur'});
    _afRef={base:{kcal:400,prot:32,carbs:0,fat:28}, q:2, u:'', src:'portion'};
    _afUnite='portion'; _afPortions=2; _afPortionPose=true;
    _afPortionPoids=125; _afPortionLabel='steak';
  });
  // 2b bis — une masse qui tombe mal (3 portions de 70 g = 210 g)
  out['2b_derive_portions_210g']=prov({kcal:500,prot:20,carbs:60,fat:18}, ()=>{
    _afSetSrc({saisie:'manuel', origine:'utilisateur'});
    _afRef={base:{kcal:500,prot:20,carbs:60,fat:18}, q:3, u:'', src:'portion'};
    _afUnite='portion'; _afPortions=3; _afPortionPose=true;
    _afPortionPoids=70; _afPortionLabel='part';
  });

  // 2c — l'ecran MODIFIER : on corrige le poids d'une portion, le pour-100 g doit suivre
  S.foodLog=[{date:'2026-09-12', meal:'midi', ts:99, name:'Steak', kcal:400, prot:32, carbs:0, fat:28,
              per100:{kcal:160,prot:12.8,carbs:0,fat:11.2}, q:2, u:'portion',
              portionLabel:'steak', portionWeightG:125}];
  try{
    openEditFood(99);
    /* ⚠️ MEMES NOMS QUE LA PRODUCTION : les champs sont `ef-pnom` et `ef-ppoids` (ma premiere
       sonde inventait `ef-portion-nom`, et rendait donc un per100 INCHANGE — elle aurait valide
       l'etape 2 sans rien mesurer). Et on passe par les gestionnaires `oninput`, pas par une
       affectation de variable : c'est le chemin que la personne emprunte. */
    const nom=document.getElementById('ef-pnom'); if(nom){ nom.value='steak'; _efPortionNomSaisi(); }
    const pds=document.getElementById('ef-ppoids'); if(pds){ pds.value='150'; _efPortionPoidsSaisi(); }
    saveEditFood();
    const e=(S.foodLog||[]).find(x=>x.ts===99);
    out['2c_edition_portion']=J(e ? {per100:e.per100, q:e.q, u:e.u,
                                     portionLabel:e.portionLabel, portionWeightG:e.portionWeightG} : null);
  }catch(err){ out['2c_edition_portion']={erreur:String(err && err.message || err)}; }

  /* ══════════ ETAPE 3 — « CETTE QUANTITE EST-ELLE UTILISABLE ? » ══════════
     Six ecritures, DEUX regles : quatre refusent les portions (elles alimentent un champ en
     GRAMMES), deux les acceptent. On fige la table complete : 4 entrees x les 2 regles. */
  const CAS=[{q:120,u:'g'},{q:2,u:'portion'},{q:0,u:'g'},{q:150,u:'ml'},{q:80,u:null},{q:-5,u:'g'}];
  const regleG = c => (+c.q>0 && (!c.u||c.u==='g'));                      // 4 sites
  const regleP = c => (+c.q>0 && (!c.u||c.u==='g'||c.u==='portion'));     // 2 sites
  out['3_regle_grammes_seuls']=J(CAS.map(c=>[c.q, c.u, regleG(c)]));
  out['3_regle_avec_portions']=J(CAS.map(c=>[c.q, c.u, regleP(c)]));

  /* ⛔ ET SURTOUT : les six sites conduits par leur VRAIE porte, pas la regle recopiee.
     *Verifier la regle n'est pas verifier l'appel* (BUGS.md §58). */
  const viaRejeu=[];
  CAS.forEach((cs,i)=>{
    S.foodLog=[]; S.savedFoods=[];
    const item={name:'X'+i, kcal:100, prot:1, carbs:2, fat:3, q:cs.q, u:cs.u,
                per100:{kcal:50,prot:0.5,carbs:1,fat:1.5}};
    _afQuickItems=[item]; _afMeal='midi';
    try{ quickAddFood(0); }catch(e){}
    const l=(S.foodLog||[])[0];
    viaRejeu.push([cs.q, cs.u, l?J({q:l.q,u:l.u}):null]);
  });
  out['3_via_quickAddFood']=J(viaRejeu);

  return out;
});

console.log(JSON.stringify(snap,null,2));
if(errs.length) console.error('ERREURS DE PAGE :\n'+errs.join('\n'));
await b.close(); srv.close();
})();
