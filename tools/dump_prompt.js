// Sort le prompt RÉEL de Milo dans docs/PROMPT-MILO-REEL.txt, découpé selon les trois
// morceaux de facturation (commun / personnel / instant) définis dans worker.js.
//
// Pourquoi ce script existe : demande de Michel le 08/08/2026 — « tu pourras m'envoyer
// le prompt de Milo, celui qui nous coûte cher ». Un simple copier-coller aurait vieilli
// en une semaine ; le script, lui, relit toujours le code (R27 : ce qui décrit l'état se
// GÉNÈRE, il ne s'écrit pas à la main).
//
// Lancer : node tools/dump_prompt.js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT='/home/user/forcetracker';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{
  // Profil de DÉMONSTRATION, volontairement neutre : ce fichier part dans un dépôt PUBLIC.
  // Ce qu'on veut montrer, c'est la STRUCTURE et le COÛT, jamais les données de quelqu'un.
  // ⚠️ S.gender ne connaît que 'H' et 'F' (défaut 'H') — écrire 'h' en minuscule donnerait
  // « Femme » dans le prompt, parce que le test est `S.gender === 'H' ? 'Homme' : 'Femme'`.
  S.name='Alex'; S.age=35; S.bw=80; S.height=178; S.gender='H'; S.goal='muscle';
  S.premium=true;
  const ctx=buildCoachContext();
  const MARQ="═══ SITUATION DE L'INSTANT ═══";
  const mi=ctx.indexOf(MARQ), pi=ctx.indexOf('PROFIL ATHLÈTE:');
  return {ctx, mi, pi, total:ctx.length};
});
const {ctx,mi,pi,total}=r;
const commun=ctx.slice(0,pi), perso=ctx.slice(pi,mi), instant=ctx.slice(mi);
const pct=n=>((n/total)*100).toFixed(1)+' %';
const ent=
`╔══════════════════════════════════════════════════════════════════════════════╗
║  LE PROMPT DE MILO — le texte envoyé À CHAQUE MESSAGE                        ║
║  Généré depuis le code réel (buildCoachContext) — profil de démo neutre     ║
╚══════════════════════════════════════════════════════════════════════════════╝

⚙️  NE PAS ÉDITER À LA MAIN — régénérer par :  node tools/dump_prompt.js
    (un document d'état écrit à la main redevient faux en trois semaines — R27)
    Généré le ${new Date().toISOString().slice(0,10)}.

TAILLE TOTALE : ${total.toLocaleString('fr-FR')} caractères  (~${Math.round(total/4).toLocaleString('fr-FR')} tokens)

Il est coupé en TROIS morceaux, et c'est là que se joue le prix :

  1. BLOC COMMUN ......... ${commun.length.toLocaleString('fr-FR')} car. (${pct(commun.length)})
     Identique pour TOUT LE MONDE. Mis en cache 1 h depuis le 08/08.
     C'est lui qu'on paie une fois pour tous — s'il est relu, il coûte 10 %.

  2. BLOC PERSONNEL ...... ${perso.length.toLocaleString('fr-FR')} car. (${pct(perso.length)})
     Tes données à toi. Mis en cache 5 min.

  3. L'INSTANT ........... ${instant.length.toLocaleString('fr-FR')} car. (${pct(instant.length)})
     Change à chaque message (heure, état du jour) : JAMAIS mis en cache,
     payé plein tarif à chaque fois.

⚠️ À SAVOIR AVANT DE TE RENSEIGNER — c'est le piège de tous les articles
   qu'on lit sur internet : chez OpenAI, écrire dans le cache est GRATUIT.
   Chez Anthropic, ça coûte 1,25× (cache 5 min) ou 2× (cache 1 h) le tarif
   normal. D'où les conseils du type « active le cache, c'est évident » —
   vrais chez eux, faux chez nous si le texte n'est pas relu assez souvent.
   Une lecture de cache coûte 10 % du tarif.

`;
const sep=n=>'\n\n'+'█'.repeat(78)+'\n█  '+n+'\n'+'█'.repeat(78)+'\n\n';
fs.writeFileSync('/home/user/forcetracker/docs/PROMPT-MILO-REEL.txt',
  ent+sep('1/3 — BLOC COMMUN À TOUS ('+commun.length+' car., cache 1 h)')+commun
     +sep('2/3 — BLOC PERSONNEL ('+perso.length+' car., cache 5 min)')+perso
     +sep("3/3 — L'INSTANT ("+instant.length+' car., JAMAIS caché)')+instant, 'utf-8');
console.log('total',total,'| commun',commun.length,'| perso',perso.length,'| instant',instant.length);
await b.close(); srv.close();
})();
