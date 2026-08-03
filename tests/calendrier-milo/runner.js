#!/usr/bin/env node
/**
 * MILO NE CALCULE PLUS LES JOURS — ON LES LUI DONNE (ft-v658).
 *
 * Le bug (Michel, mercredi 29/07/2026 à 08 h 11) : il écrit « c'est demain plutôt »,
 * Milo répond « demain MERCREDI alors » — alors qu'on ÉTAIT mercredi et que demain
 * était jeudi. Il avait pourtant la bonne date d'aujourd'hui dans son contexte : ce
 * qu'on lui demandait, c'était de DÉDUIRE le nom du jour de demain. Un modèle de
 * langage se trompe sur ce calcul.
 *
 * C'est la règle R8 en plein : un prompt ne compense jamais une donnée absente.
 * Le fix n'est pas « mieux lui expliquer », c'est LUI DONNER les jours.
 *
 * Lancer : node tests/calendrier-milo/runner.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

// Le contexte est construit avec l'horloge GELÉE sur un instant précis : on peut donc
// vérifier les VRAIS noms de jours, pas « ce que l'ordinateur pense être aujourd'hui ».
async function ctxLe(instantISO,extra){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  await c.addInitScript(([s,fixe])=>{
    for(const k in s)localStorage.setItem(k,s[k]);
    const F=new Date(fixe), R=Date;
    window.Date=class extends R{constructor(...a){super(...(a.length?a:[F.getTime()]));}static now(){return F.getTime();}};
    window.Date.parse=R.parse; window.Date.UTC=R.UTC;
  },[Object.assign({ft4_name:'Michel',ft4_bw:'87',ft4_age:'45',ft4_height:'178',ft4_gender:'h',
      ft4_ok:'1',ft4_premium:'1',ft4_email:'x@y.z'},extra||{}),instantISO]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:'+srv.address().port+'/index.html');
  await p.waitForTimeout(2300);
  const ctx=await p.evaluate(()=>{try{return buildCoachContext()||'';}catch(e){return 'ERREUR: '+e.message;}});
  await c.close();
  return {ctx,errs};
}

console.log('\n─── MILO NE CALCULE PLUS LES JOURS ───────────────────────');

// ── 1. Le cas EXACT de Michel : un mercredi matin ────────────────────────────
{
  const {ctx,errs}=await ctxLe('2026-07-29T08:11:00+02:00');   // mercredi
  t('⭐ LE CAS DE MICHEL : « demain » = JEUDI, pas mercredi',
    /- demain = jeudi 30 juillet \(2026-07-30\)/.test(ctx),
    (ctx.match(/- demain = .*/)||['(absent)'])[0]);
  t('… « aujourd\'hui » est bien mercredi', /- AUJOURD'HUI = mercredi 29 juillet \(2026-07-29\)/.test(ctx));
  t('… « hier » est bien mardi (la séance jambes)', /- hier = mardi 28 juillet \(2026-07-28\)/.test(ctx));
  // ⚠️ on teste le FOND, pas la formulation exacte : le texte a été raccourci une fois
  // (ft-v658) et ces deux tests ont cassé pour rien. Ce qui compte : l'interdiction de
  // calculer, et l'ordre de LIRE la liste.
  t('… et la consigne de ne PAS calculer est présente',
    /ne calcule JAMAIS un jour/i.test(ctx)&&/jamais de tête/i.test(ctx));
  t('le contexte se construit sans erreur', !/^ERREUR:/.test(ctx)&&errs.length===0, errs.join(' | '));
}

// ── 2. Les jours suivants sont donnés, pour « lundi », « dans 3 jours »… ─────
{
  const {ctx}=await ctxLe('2026-07-29T08:11:00+02:00');
  t('après-demain est nommé', /- après-demain = vendredi 31 juillet \(2026-07-31\)/.test(ctx));
  // le nom du jour ET sa date, pour le 3ᵉ et le 14ᵉ jour — c'est ce couple qui compte
  t('les 14 jours à venir sont listés (couvre la règle « au plus 14 jours »)',
    /lundi 2026-08-03/.test(ctx)&&/mercredi 2026-08-12/.test(ctx));
  t('le bloc « séance annoncée » renvoie au calendrier au lieu de faire calculer',
    /recopiée depuis le CALENDRIER/.test(ctx)&&!/calcule le bon jour à venir/.test(ctx));
}

// ── 3. Les pièges de calendrier : changement de mois et d'année ──────────────
{
  const {ctx}=await ctxLe('2026-07-31T10:00:00+02:00');        // vendredi, dernier jour du mois
  t('fin de mois : demain passe bien au 1er août',
    /- demain = samedi 1 août \(2026-08-01\)/.test(ctx), (ctx.match(/- demain = .*/)||[''])[0]);
}
{
  const {ctx}=await ctxLe('2026-12-31T18:00:00+01:00');        // jeudi, dernier jour de l'année
  t('fin d\'année : demain passe bien au 1er janvier 2027',
    /- demain = vendredi 1 janvier \(2027-01-01\)/.test(ctx), (ctx.match(/- demain = .*/)||[''])[0]);
}
// ── 4. Minuit et demi : le jour donné à Milo est celui du TÉLÉPHONE (ft-v655)
{
  const {ctx}=await ctxLe('2026-07-29T00:30:00+02:00');
  t('00 h 30 : « aujourd\'hui » reste le 29, pas la veille',
    /- AUJOURD'HUI = mercredi 29 juillet \(2026-07-29\)/.test(ctx),
    (ctx.match(/- AUJOURD'HUI = .*/)||[''])[0]);
  t('… et les deux façons de dire la date CONCORDENT',
    /- AUJOURD'HUI = mercredi 29 juillet/.test(ctx)&&/On est mercredi 29 juillet/.test(ctx));
}

// ── 5. LE PASSÉ AUSSI : les séances et le record portent leur jour (ft-v660) ──
// 2ᵉ capture de Michel : Milo datait sa séance jambes « lundi » (c'était mardi) et son
// record « dimanche » (c'était lundi). Un jour d'écart — le même bug que « demain ».
{
  const {ctx,errs}=await ctxLe('2026-07-29T09:21:00+02:00',{
    ft4_sessions:JSON.stringify([
      {date:'2026-07-28',exs:[{name:'Squat',sets:[{kg:120,reps:5,done:true,type:'N'}]}],volume:3000},
      {date:'2026-07-27',exs:[{name:'Développé Couché',sets:[{kg:105,reps:2,done:true,type:'N'}]}],volume:2100}]),
    ft4_prs:JSON.stringify({'Développé Couché':{kg:105,reps:2,rm1:111,date:'2026-07-27'}})});
  t('⭐ la séance de la veille est datée MARDI, pas lundi',
    /mardi 2026-07-28 \(hier\)/.test(ctx), (ctx.match(/^.*2026-07-28.*$/m)||['(absent)'])[0]);
  t('⭐ celle d\'avant est datée LUNDI, pas dimanche',
    /lundi 2026-07-27 \(avant-hier\)/.test(ctx), (ctx.match(/^.*2026-07-27.*vol total$/m)||['(absent)'])[0]);
  t('le DERNIER RECORD est nommé, daté et situé dans le temps',
    /Dernier RECORD en date: Développé Couché 105kg×2 — lundi 2026-07-27 \(avant-hier\)/.test(ctx),
    (ctx.match(/Dernier RECORD en date:.*/)||['(absent)'])[0]);
  t('… et la règle « on n\'enchaîne pas deux maximaux » est là',
    /APRÈS UN EFFORT MAXIMAL/.test(ctx)&&/4 à 7 jours/.test(ctx));
  t('aucune erreur JS', errs.length===0, errs.join(' | '));
}
// aucun record enregistré → pas de ligne inventée
{
  const {ctx}=await ctxLe('2026-07-29T09:21:00+02:00');
  t('aucun record → aucune ligne « Dernier RECORD » (0 invention)',
    !/Dernier RECORD en date:/.test(ctx));
  // 30/07 : Milo a appelé « Ta séance d'hier » une séance seulement PRÉPARÉE la veille (jamais
  // faite — hier était un repos). La règle FAITE vs PRÉPARÉE doit accompagner la liste des séances.
  // ⚠️ La formulation a changé en ft-v752 : « ces séances sont les SEULES réellement FAITES »
  // faisait croire à Milo que son historique s'arrêtait à 5 séances. L'INTENTION du test ne
  // change pas (la règle faite/préparée doit accompagner la liste) — seuls les mots visés
  // changent, et on vérifie en plus que la fenêtre ne se fait plus passer pour tout l'historique.
  t('⭐ la règle « séance FAITE ≠ séance PRÉPARÉE » accompagne les dernières séances',
    /bien été FAITE/.test(ctx)&&/PRÉPARÉE/.test(ctx)&&/REPOS/.test(ctx));
  t('⭐ … sans laisser croire que ces séances sont tout son historique (ft-v752)',
    !/sont les seules réellement FAITES/.test(ctx)&&/PAS SON HISTORIQUE/.test(ctx));
}

// ── 💰 CACHE DE PROMPT (31/07) : tout ce qui précède « SITUATION DE L'INSTANT » est STABLE ──
// Le Worker met en cache le préfixe du contexte (facturé ~10× moins cher). La garantie à tenir :
// entre deux questions d'une même conversation, PAS UN OCTET ne doit changer avant le marqueur —
// sinon le cache saute en silence et la facture triple sans que personne ne le voie.
{
  const M="═══ SITUATION DE L'INSTANT ═══";
  const a=await ctxLe('2026-07-29T09:21:00+02:00');
  const b=await ctxLe('2026-07-29T09:29:00+02:00');            // 8 minutes plus tard, même journée
  const ia=a.ctx.indexOf(M), ib=b.ctx.indexOf(M);
  t('le marqueur de cache existe, une seule fois, loin du début', ia>1000&&a.ctx.indexOf(M,ia+1)<0, 'index '+ia);
  t('⭐ AVANT le marqueur : IDENTIQUE à 8 minutes d\'écart (le cache tiendra)',
    ia===ib&&a.ctx.slice(0,ia)===b.ctx.slice(0,ib));
  t('l\'heure et le score de récup vivent APRÈS le marqueur',
    /il est \d+h\d+/.test(a.ctx.slice(ia))&&/Score récupération/.test(a.ctx.slice(ia)));
  t('… et n\'apparaissent PLUS avant (rien de variable dans le bloc caché)',
    !/il est \d+h\d+/.test(a.ctx.slice(0,ia))&&!/Score récupération/.test(a.ctx.slice(0,ia)));
  const w=fs.readFileSync(path.join(ROOT,'worker.js'),'utf8');
  t('le Worker découpe sur ce marqueur EXACT et pose cache_control ephemeral',
    w.indexOf(M)>=0&&/cache_control:\s*\{\s*type:\s*'ephemeral'\s*\}/.test(w));
}

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
