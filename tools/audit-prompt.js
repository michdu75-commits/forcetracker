#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════════════════════
   AUDIT DU PROMPT DE MILO — mesuré, jamais estimé.            node tools/audit-prompt.js

   POURQUOI CET OUTIL EXISTE (nuit du 04 au 05/08/2026).
   Michel a eu l'idée de faire auditer le prompt de Milo PAR MILO — et c'est une bonne idée,
   parce qu'il est le seul lecteur qui voit le prompt RÉEL : la version en ligne, à jour,
   personnalisée. ChatGPT, lui, ne lisait qu'une photo exportée.

   ⚠️ MAIS LES DEUX MODÈLES ONT MONTRÉ LA MÊME LIMITE, ET ELLE EST STRUCTURELLE :
     · ils ESTIMENT les tailles (« ~600 tokens ») — mesuré : leurs comptages étaient faux.
       « une seule question » : ils disaient 5 fois, il y en avait 8. « oriente vers un
       pro » : 3 annoncées, 6 réelles ;
     · à qui on demande de PRODUIRE, produit. ChatGPT a proposé −85 % sur un bloc en faisant
       disparaître, sans les mentionner, des règles nées de vrais bugs. Milo a annoncé
       « 4 blocs réécrits prêts à copier-coller » et a livré 4 intertitres VIDES ;
     · et surtout : ils comptent les RÉPÉTITIONS, jamais les CONTRADICTIONS. Le prompt disait
       « pose 1 ou 2 questions AVANT de trancher » ET « au plus UNE question, APRÈS avoir
       aidé ». Aucun des deux ne l'a vu. C'est pourtant le bug de l'« interrogatoire » qui
       avait résisté à trois durcissements de prompt (ft-v602/603/606).

   D'OÙ CET OUTIL : il ne réécrit rien, il ne propose rien. Il COMPTE, et il signale les
   formulations qui s'opposent. La décision reste humaine — parce que seule une personne
   sait de quel incident est née chaque ligne (R30 : un retrait non expliqué redevient un bug).

   ⚠️ CE QU'IL NE SAIT PAS FAIRE, et c'est écrit exprès : il repère des motifs, pas du sens.
   Une contradiction formulée autrement lui échappera. Il réduit le travail, il ne le remplace pas.
   ════════════════════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
              '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};

// ── Les couples de formulations qui NE PEUVENT PAS être vraies en même temps ───────────
// À compléter à chaque contradiction trouvée : c'est le seul moyen que l'outil apprenne.
const CONTRADICTIONS = [
  // ⚠️ CE MOTIF A ÉTÉ RESSERRÉ APRÈS 2 FAUX POSITIFS SUR 2 (05/08). La 1ʳᵉ version cherchait
  // « deux questions » et « plusieurs questions » n'importe où — elle attrapait une tournure
  // de style (« réponds à DEUX questions : qu'ai-je le droit de supposer ? ») et, pire,
  // L'INTERDICTION ELLE-MÊME (« FORMELLEMENT INTERDIT : ouvrir par une ou plusieurs
  // questions »). Un détecteur qui signale la règle qu'il est censé protéger est pire
  // qu'inutile : *un indicateur qui crie tout le temps ne dit plus rien* (leçon de ft-v760).
  // On n'accepte donc plus qu'une VRAIE consigne de poser : le verbe, puis le nombre.
  { nom: 'nombre de questions',
    a: /\bpos(e|es|er|ez)\b[^.;]{0,30}\b(1 ou 2|deux|2|plusieurs)\s+questions/i,
    b: /AU PLUS UNE question|UNE seule question|UNE question à la fois/i,
    pourquoi: "« pose 1 ou 2 questions » contre « au plus UNE » — le bug de l'interrogatoire (ft-v768)" },
  { nom: 'moment de la question',
    a: /questions? [^.]{0,40}AVANT de trancher/i,
    b: /APRÈS ta proposition|Jamais une question AVANT/i,
    pourquoi: "poser AVANT vs poser APRÈS avoir aidé — opposé sur le moment" },
  { nom: 'hypothèses',
    a: /fais? des hypothèses|tu peux supposer/i,
    b: /aucune hypothèse|ne suppose (jamais|pas)/i,
    pourquoi: "autorisation de supposer contre interdiction — R10 (permissions bornées)" }
];

// Formulations dont la REPETITION est un signal (une règle répétée n'est pas plus forte)
const MOTIFS = [
  ['une seule question',     /AU PLUS UNE question|UNE seule question|UNE question à la fois|UNE question suffit|1 ou 2 questions/gi],
  ['ne jamais inventer',     /N'INVENTE JAMAIS|N'AJOUTE JAMAIS|FABRIQUE JAMAIS|ne pas inventer/gi],
  ['orienter vers un pro',   /oriente[^.]{0,25}(pro|médecin|professionnel)|professionnel de santé/gi],
  ['aucun diagnostic',       /aucun diagnostic|ne poses? JAMAIS de diagnostic|pas de diagnostic/gi],
  ['jamais culpabiliser',    /culpabilis/gi],
  ['la personne d\'abord',   /la PERSONNE avant|personne avant le programme/gi],
  ['tendance pas bruit',     /tendances?\b[^.]{0,40}(bruit|pas sur le point)|c'est du BRUIT/gi]
];

function estTitre(l){
  const s=l.trim();
  if(s.length<8 || /^[-•·`{$]/.test(s)) return false;
  const mots=(s.slice(0,60).match(/[A-ZÉÈÀÇÙÊÎÔÂ']{2,}/g)||[]);
  return mots.length>=2;
}

(async () => {
  const srv = http.createServer((q,r)=>{
    let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html';
    const f=path.join(ROOT,p);
    if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
    r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    fs.createReadStream(f).pipe(r);
  });
  await new Promise(r=>srv.listen(0,r));
  const PORT=srv.address().port;

  // Un profil réaliste : un contexte vide ne dirait rien du poids réel.
  const sessions=[];
  for(let i=0;i<40;i++){ const d=new Date(2026,5,20); d.setDate(d.getDate()+i*2);
    sessions.push({date:d.toISOString().slice(0,10),vol:4200,
      exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]}); }

  const b=await chromium.launch();
  const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  await ctx.addInitScript(`(()=>{try{
    localStorage.setItem('ft4_name','Alex'); localStorage.setItem('ft4_bw','80');
    localStorage.setItem('ft4_age','35');    localStorage.setItem('ft4_ht','180');
    localStorage.setItem('ft4_gender','H');  localStorage.setItem('ft4_goal','muscle');
    localStorage.setItem('ft4_sessions',${JSON.stringify(JSON.stringify(sessions))});
    window._demoMode=true;}catch(e){}})();`);
  const p=await ctx.newPage();
  await p.goto('http://localhost:'+PORT+'/index.html');
  await p.waitForTimeout(2500);
  const c = await p.evaluate(()=>{ try{ return buildCoachContext('fais-moi une séance jambes'); }catch(e){ return 'ERREUR '+e; } });
  await b.close(); srv.close();

  if(c.startsWith('ERREUR')){ console.error('❌ '+c); process.exit(1); }

  const lignes=c.split('\n');
  const idx=[0].concat(lignes.map((l,i)=>estTitre(l)?i:-1).filter(i=>i>0)).concat([lignes.length]);
  const blocs=[];
  for(let k=0;k<idx.length-1;k++){
    const t=lignes.slice(idx[k],idx[k+1]).join('\n');
    if(t.length>200) blocs.push([lignes[idx[k]].trim().slice(0,58), t.length]);
  }
  blocs.sort((a,b)=>b[1]-a[1]);

  console.log('\n════ POIDS DU PROMPT ════  total : '+c.length+' caractères  (~'+Math.round(c.length/3.6)+' tokens)\n');
  console.log('  '+'BLOC'.padEnd(60)+'car.'.padStart(7)+'%'.padStart(7));
  console.log('  '+'─'.repeat(74));
  blocs.slice(0,15).forEach(([n,v])=>
    console.log('  '+n.padEnd(60)+String(v).padStart(7)+(100*v/c.length).toFixed(1).padStart(6)+'%'));

  console.log('\n════ RÈGLES RÉPÉTÉES ════  (une règle répétée n\'est pas plus forte — elle dilue les autres)\n');
  MOTIFS.forEach(([nom,re])=>{
    const n=(c.match(re)||[]).length;
    if(n>1) console.log('  '+(n>=5?'🔴':'🟠')+' '+String(n).padStart(2)+'×  '+nom);
  });

  console.log('\n════ CONTRADICTIONS ════  (deux consignes qui ne peuvent pas être vraies ensemble)\n');
  let trouve=0;
  CONTRADICTIONS.forEach(k=>{
    if(k.a.test(c) && k.b.test(c)){ trouve++;
      console.log('  ⚔️  '+k.nom+'\n      → '+k.pourquoi+'\n'); }
  });
  if(!trouve) console.log('  ✅ aucune des contradictions connues n\'est présente.');
  console.log('  ⚠️ L\'outil ne repère que les couples DÉCLARÉS ci-dessus. Une contradiction');
  console.log('     formulée autrement lui échappe — à compléter à chaque nouvelle trouvaille.\n');
})();
