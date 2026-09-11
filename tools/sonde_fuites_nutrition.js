// Deux mesures demandees par Michel, AVANT tout plan. Rien n'est corrige ici.
//  1) `_bcPaquetG` peut-il survivre d'un aliment au suivant ?
//  2) `S.savedFoods` peut-il etre perdu entre deux onglets ?
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT='/home/user/forcetracker';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

// ⛔ PAS de _demoMode : persist() sort tout de suite en mode demo, donc la mesure 2 ne mesurerait RIEN.
const seed=`(()=>{try{
  localStorage.setItem('ft4_name','Testeur');localStorage.setItem('ft4_bw','80');
  localStorage.setItem('ft4_age','30');localStorage.setItem('ft4_ht','178');
  localStorage.setItem('ft4_gender','H');localStorage.setItem('ft4_act','1.55');
  localStorage.setItem('ft4_goal','muscle');
}catch(e){}})();`;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});

// ───────────────── MESURE 1 : _bcPaquetG survit-il a l'aliment suivant ? ─────────────────
const p=await c.newPage(); p.on('pageerror',e=>console.log('   [pageerror]',e.message));
await p.addInitScript(seed);
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

const m1=await p.evaluate(()=>{
  const o={};
  const vis=id=>{const e=document.getElementById(id);return !!(e && e.style.display!=='none' && e.offsetParent!==null);};
  const txt=id=>{const e=document.getElementById(id);return e?(e.textContent||'').trim():'(absent)';};

  openAddFood();
  o.paquetApresOuverture=_bcPaquetG;

  // --- PRODUIT A : une boite de 410 g, par le HUB (c'est exactement ce que fait _lookupBarcode
  //     une fois la fiche Open Food Facts recue ; seul le reseau est court-circuite).
  _bcNutr={name:'Lentilles cuisinees',kcal100:48.3,prot100:6.1,carbs100:10,fat100:3.2};
  _offRemplirFormulaire({serving_quantity:0, quantity:'410 g', nutriments:{a:1}}, '3021690201123', 'scan', false, 'off');
  o.A_paquetG=_bcPaquetG;
  o.A_pastilleVisible=vis('af-bc-paquet');
  o.A_pastilleTexte=txt('af-bc-paquet');

  // --- PRODUIT B : une reprise « Mes aliments », SANS fermer l'ecran (porte hors hub).
  _afQuickItems=[{name:'Yaourt nature',kcal:60,prot:4,carbs:5,fat:2,
                  per100:{kcal:60,prot:4,carbs:5,fat:2},q:125,u:'g',fav:true}];
  quickFillFood(0);
  o.B_paquetG=_bcPaquetG;                    // <- a-t-il ete remis a zero ?
  o.B_pastilleVisible=vis('af-bc-paquet');   // <- la pastille de A est-elle encore a l'ecran ?
  o.B_pastilleTexte=txt('af-bc-paquet');
  o.B_nomAffiche=(document.getElementById('af-desc')||{}).value||'';
  return o;
});
console.log('\n=== MESURE 1 — _bcPaquetG entre deux aliments ===');
console.log(JSON.stringify(m1,null,2));
console.log(m1.B_pastilleVisible
  ? '>>> FUITE CONFIRMEE : la pastille du paquet de A est encore affichee sur B.'
  : '>>> pas de fuite visible a l ecran (verifier la variable ci-dessus).');
await p.close();

// ───────────────── MESURE 2 : savedFoods entre deux onglets ─────────────────
const A=await c.newPage(); await A.addInitScript(seed);
await A.goto('http://localhost:'+PORT+'/index.html'); await A.waitForTimeout(2000);
const B=await c.newPage(); await B.addInitScript(seed);
await B.goto('http://localhost:'+PORT+'/index.html'); await B.waitForTimeout(2000);
// Les deux onglets ont charge le MEME etat de depart (liste vide).

await A.evaluate(()=>{ S.savedFoods=[{name:'Pain',kcal:250,prot:8,carbs:50,fat:2}]; persist(); });
await A.waitForTimeout(400);
const vuParB=await B.evaluate(()=>({ enMemoire:(S.savedFoods||[]).map(f=>f.name),
                                     surDisque:JSON.parse(localStorage.getItem('ft4_savedfoods')||'[]').map(f=>f.name) }));

await B.evaluate(()=>{ S.savedFoods=(S.savedFoods||[]).concat([{name:'Fromage',kcal:350,prot:25,carbs:1,fat:28}]); persist(); });
await B.waitForTimeout(400);
const final=await B.evaluate(()=>JSON.parse(localStorage.getItem('ft4_savedfoods')||'[]').map(f=>f.name));

// Temoin de controle : une liste QUI EST fusionnee doit, elle, survivre au meme scenario.
const A2=await c.newPage(); await A2.addInitScript(seed);
await A2.goto('http://localhost:'+PORT+'/index.html'); await A2.waitForTimeout(2000);
const B2=await c.newPage(); await B2.addInitScript(seed);
await B2.goto('http://localhost:'+PORT+'/index.html'); await B2.waitForTimeout(2000);
await A2.evaluate(()=>{ S.foodLog=[{date:'2026-09-11',meal:'midi',name:'Pain',kcal:250,ts:1}]; persist(); });
await A2.waitForTimeout(400);
await B2.evaluate(()=>{ S.foodLog=(S.foodLog||[]).concat([{date:'2026-09-11',meal:'soir',name:'Fromage',kcal:350,ts:2}]); persist(); });
await B2.waitForTimeout(400);
const finalLog=await B2.evaluate(()=>JSON.parse(localStorage.getItem('ft4_foodlog')||'[]').map(f=>f.name));

console.log('\n=== MESURE 2 — savedFoods entre deux onglets ===');
console.log('  B voyait, apres l ecriture de A :', JSON.stringify(vuParB));
console.log('  savedFoods sur disque a la fin  :', JSON.stringify(final));
console.log('  TEMOIN foodLog (liste fusionnee):', JSON.stringify(finalLog));
console.log(final.includes('Pain')
  ? '>>> savedFoods survit (rien a signaler).'
  : '>>> PERTE CONFIRMEE : le favori de l onglet A a disparu.');
console.log(finalLog.includes('Pain') && finalLog.includes('Fromage')
  ? '>>> le temoin foodLog garde bien les deux -> la fusion marche, et savedFoods n en beneficie pas.'
  : '>>> ATTENTION : le temoin foodLog ne se comporte pas comme prevu, la mesure est douteuse.');

await b.close(); srv.close();
})();
