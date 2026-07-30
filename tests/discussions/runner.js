#!/usr/bin/env node
/**
 * LA CONVERSATION AVEC MILO NE DOIT PLUS SE PERDRE (ft-v656).
 *
 * Le bug (signalé par Michel le 28/07/2026, capture de « Mes discussions » vide) :
 * `coachHistory` était coupé à 20 messages EN DIRECT — dès le 21ᵉ, le plus ancien
 * était JETÉ. Les bulles restaient affichées (elles sont dans la page), donc rien
 * ne se voyait ; mais à la réouverture elles avaient disparu, et elles n'avaient
 * jamais pu être rangées dans « Mes discussions » puisqu'elles étaient déjà parties.
 * Perte SILENCIEUSE — la famille de bugs qu'on traque depuis le 27/07.
 *
 * Lancer : node tests/discussions/runner.js
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
const base={ft4_name:'Michel',ft4_bw:'87',ft4_age:'45',ft4_height:'178',ft4_gender:'h',
            ft4_ok:'1',ft4_premium:'1',ft4_email:'x@y.z'};
async function page(extra){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  await c.addInitScript(s=>{for(const k in s)localStorage.setItem(k,s[k]);},Object.assign({},base,extra||{}));
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:'+srv.address().port+'/index.html');
  await p.waitForTimeout(2300);
  await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(x=>x.classList.remove('open'));});
  return {p,c,errs};
}
console.log('\n─── LA CONVERSATION NE SE PERD PLUS ──────────────────────');

// ── 1. Une longue conversation survit à la fermeture de l'app ────────────────
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    coachHistory=[];
    for(let i=1;i<=60;i++){
      coachHistory.push({role:'user',    content:'question numéro '+i});
      coachHistory.push({role:'assistant',content:'réponse de Milo numéro '+i});
    }
    _trimCoachHistory(); _saveCoachHist();
    const relu=JSON.parse(localStorage.getItem('ft4_coach_hist')||'[]');
    return {enMemoire:coachHistory.length, relu:relu.length,
            premier:(relu[0]||{}).content, dernier:(relu[relu.length-1]||{}).content};
  });
  t('120 messages restent 120 en mémoire (plus de coupe à 20)', r.enMemoire===120, 'reçu '+r.enMemoire);
  t('… et 120 après fermeture/réouverture', r.relu===120, 'reçu '+r.relu);
  t('… le DÉBUT de la conversation est toujours là', r.premier==='question numéro 1', r.premier);
  t('… et la fin aussi', r.dernier==='réponse de Milo numéro 60', r.dernier);
  t('0 erreur JS', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}

// ── 2. Ce qu'on RANGE est bien tout ce qu'on avait ──────────────────────────
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    coachHistory=[];
    for(let i=1;i<=40;i++){
      coachHistory.push({role:'user',    content:'q'+i});
      coachHistory.push({role:'assistant',content:'r'+i});
    }
    newCoachChat();                       // le bouton « + » : range et ouvre un fil neuf
    const convs=JSON.parse(localStorage.getItem('ft4_coach_convs')||'[]');
    return {nb:convs.length, msgs:(convs[0]||{}).messages?convs[0].messages.length:0,
            premier:((convs[0]||{}).messages||[])[0], filNeuf:coachHistory.length};
  });
  t('« + » range la discussion au lieu de l\'effacer', r.nb===1, JSON.stringify(r));
  t('… avec ses 80 messages, pas seulement 40', r.msgs===80, 'reçu '+r.msgs);
  t('… le tout premier message compris', r.premier&&r.premier.content==='q1', JSON.stringify(r.premier));
  t('… et le fil repart à zéro', r.filNeuf===0);
  await q.c.close();
}

// ── 3. « Mes discussions » ne s'ouvre plus sur du vide (le bug vu par Michel)
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    coachHistory=[{role:'user',content:'je veux faire de la force'},
                  {role:'assistant',content:'voilà un plan'}];
    _renderCoachConvs();
    const el=document.getElementById('coach-convs-list');
    // ⚠️ on lit l'EN-TÊTE (titre + pastille), pas le seul titre : la pastille est sa SŒUR,
    // sinon elle disparaîtrait avec les « … » quand le sujet est long.
    return {txt:el.textContent, enCours:!!el.querySelector('.cconv-row.now'),
            titre:(el.querySelector('.cconv-row.now .cconv-hd')||{}).textContent||'',
            coupe:getComputedStyle(el.querySelector('.cconv-row.now .cconv-title')).textOverflow};
  });
  t('la discussion EN COURS apparaît dans la liste', r.enCours===true, r.txt.slice(0,90));
  t('… avec son sujet et la mention « EN COURS »',
    /je veux faire de la force/.test(r.titre)&&/EN COURS/.test(r.titre), r.titre);
  t('… la pastille reste visible même si le sujet est long', r.coupe==='ellipsis', r.coupe);
  t('… on ne lit plus « Aucune discussion enregistrée »',
    !/Aucune discussion enregistrée/.test(r.txt), r.txt.slice(0,90));
  await q.c.close();
}

// ── 4. Aucune conversation du tout → le message d'accueil, pas de fausse ligne
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    coachHistory=[]; _renderCoachConvs();
    const el=document.getElementById('coach-convs-list');
    return {txt:el.textContent, enCours:!!el.querySelector('.cconv-row.now')};
  });
  t('aucune conversation → pas de ligne « en cours » inventée', r.enCours===false);
  t('aucune conversation → le message d\'explication reste', /Aucune discussion enregistrée/.test(r.txt));
  await q.c.close();
}

// ── 5. Le garde-fou de PLACE : une conversation énorme ne casse rien ─────────
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    const pave='x'.repeat(4000);
    coachHistory=[];
    for(let i=0;i<200;i++) coachHistory.push({role:i%2?'assistant':'user',content:pave+i});
    let err=null; try{ _saveCoachHist(); }catch(e){ err=e.message; }
    const relu=JSON.parse(localStorage.getItem('ft4_coach_hist')||'[]');
    const poids=(localStorage.getItem('ft4_coach_hist')||'').length;
    return {err, gardes:relu.length, poids,
            dernier:(relu[relu.length-1]||{}).content.slice(-4)};
  });
  t('une conversation énorme s\'enregistre sans planter', r.err===null, r.err);
  t('… on garde ce qui tient dans la place prévue', r.gardes>0&&r.poids<=160000, JSON.stringify({g:r.gardes,p:r.poids}));
  t('… et ce sont les messages LES PLUS RÉCENTS qu\'on garde', r.dernier==='x199'.slice(-4)||r.dernier.endsWith('199'), r.dernier);
  await q.c.close();
}

// ── 6. Le RENDU d'un message de Milo : l'italique *…* ne laisse plus d'étoiles ─
// (capture 30/07 : « 3×10 *(coudes légèrement devant)* » s'affichait avec ses étoiles brutes —
// le rendu convertissait le gras **…** mais pas l'italique *…*.)
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    renderCoachMsg('coach',"**Développé militaire** — 3×10 *(coudes légèrement devant, pas derrière les oreilles)*\nEt 3 * 5 * 2 = 30 reste tel quel.");
    const bl=document.querySelectorAll('#coach-msgs .msg-coach');
    const el=bl[bl.length-1];
    return {txt:el.textContent, em:/<em>/.test(el.innerHTML), strong:/<strong>/.test(el.innerHTML),
            plain:_coachPlain("3×10 *(coudes devant)* et **gras**")};
  });
  t('les consignes de Milo s\'affichent en italique, sans étoiles brutes',
    r.em && !/\*\(/.test(r.txt), r.txt.slice(0,80));
  t('le gras continue de marcher', r.strong);
  t('une vraie multiplication « 3 * 5 * 2 » n\'est PAS mangée', r.txt.includes('3 * 5 * 2'));
  t('le partage/PDF est nettoyé des étoiles aussi', !/\*/.test(r.plain), r.plain);
  await q.c.close();
}

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
