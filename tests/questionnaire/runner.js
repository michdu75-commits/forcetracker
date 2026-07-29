#!/usr/bin/env node
/**
 * LE QUESTIONNAIRE NE DOIT PLUS REPOSER LES MÊMES QUESTIONS (ft-v657).
 *
 * Le bug (trouvé par Michel le 29/07/2026 à 00 h 01 — il a tout refait) :
 * `openCoachQuiz('free')` forçait `_cqIdx=0`, donc la série gratuite repartait
 * TOUJOURS de la question 1 et repromenait dans les 13 questions — y compris
 * quand la carte promettait « tape pour revoir ou modifier tes réponses ».
 * Son mot, qui donne le vrai poids : « ça fait pas très sérieux avec des clients ».
 *
 * Lancer : node tests/questionnaire/runner.js
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
// 8 premières questions répondues sur 13 (l'état réel de Michel cette nuit-là)
const HUIT={answers:{xp:'5a',freq:'4',place:'salle',time:'60',bar:'ok',motiv:'fort',weak:'jambes',cardio:'peu'},done:false,date:'2026-07-28'};
console.log('\n─── LE QUESTIONNAIRE NE SE RÉPÈTE PLUS ───────────────────');

// ── 1. Questionnaire commencé : on reprend où on s'était arrêté ──────────────
{
  const q=await page({ft4_coachquiz:JSON.stringify(HUIT)});
  const r=await q.p.evaluate(()=>{
    openCoachQuiz('free');
    return {idx:_cqIdx, titre:(document.getElementById('cq-title')||{}).textContent||'',
            question:(document.querySelector('#cq-step .cq-q')||{}).textContent||'',
            ouvert:!!document.querySelector('#ov-coach-quiz.open')};
  });
  t('⭐ LE FIX : on reprend à la 9ᵉ question, plus à la 1ʳᵉ', r.idx===8, 'reçu index '+r.idx);
  t('… et c\'est bien la bonne question qui s\'affiche', /zones sensibles/i.test(r.question), r.question);
  t('… le compteur affiche 9/13', /9\/13/.test(r.titre), r.titre);
  t('0 erreur JS', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}

// ── 2. Questionnaire TERMINÉ : récapitulatif, pas un nouveau tour de piste ───
{
  const tout={answers:{xp:'5a',freq:'4',place:'salle',time:'60',bar:'ok',motiv:'fort',weak:'jambes',
    cardio:'peu',pain:['epaules'],energy:'ok',goalfeel:'force',diet0:'moyen',tone:'cash'},done:true,date:'2026-07-28'};
  const q=await page({ft4_coachquiz:JSON.stringify(tout)});
  const r=await q.p.evaluate(()=>{
    openCoachQuiz('free');
    const step=document.getElementById('cq-step');
    return {lignes:step.querySelectorAll('.cq-recap').length,
            titre:(document.getElementById('cq-title')||{}).textContent||'',
            aucuneQuestion:!step.querySelector('.cq-q'),
            bouton:(document.getElementById('cq-next')||{}).textContent||'',
            txt:step.textContent};
  });
  t('⭐ tout rempli → RÉCAPITULATIF, pas la question 1', r.aucuneQuestion===true&&r.lignes===13, JSON.stringify({l:r.lignes,q:r.aucuneQuestion}));
  t('… il montre les 13 réponses données', /Salle complète/.test(r.txt)&&/Cash et direct/.test(r.txt), r.txt.slice(0,120));
  t('… le titre dit « Tes réponses »', /Tes réponses/.test(r.titre), r.titre);
  t('… et le bouton principal ferme au lieu d\'enchaîner', /Fermer/.test(r.bouton), r.bouton);
  await q.c.close();
}

// ── 3. Depuis le récap, on corrige UNE réponse et on revient à la liste ──────
{
  const tout={answers:{xp:'5a',freq:'4',place:'salle',time:'60',bar:'ok',motiv:'fort',weak:'jambes',
    cardio:'peu',pain:['epaules'],energy:'ok',goalfeel:'force',diet0:'moyen',tone:'cash'},done:true,date:'2026-07-28'};
  const q=await page({ft4_coachquiz:JSON.stringify(tout)});
  const r=await q.p.evaluate(()=>{
    openCoachQuiz('free');
    _cqEditOne(2);                                   // la question « Où tu t'entraînes ? »
    const seul={titre:(document.getElementById('cq-title')||{}).textContent||'',
                question:(document.querySelector('#cq-step .cq-q')||{}).textContent||''};
    _coachQuizPick('place','maison',false);          // on change la réponse
    _finishCoachQuiz();
    const st=JSON.parse(localStorage.getItem('ft4_coachquiz')||'{}');
    return {seul, apres:st.answers.place, autre:st.answers.tone, done:st.done,
            revenu:document.querySelectorAll('#cq-step .cq-recap').length,
            encoreOuvert:!!document.querySelector('#ov-coach-quiz.open')};
  });
  t('une ligne du récap ouvre CETTE question seule', /Où tu t'entraînes/.test(r.seul.question), r.seul.question);
  t('… sous le titre « Modifier ta réponse »', /Modifier ta réponse/.test(r.seul.titre), r.seul.titre);
  t('… la réponse est bien changée', r.apres==='maison', r.apres);
  t('… les AUTRES réponses ne bougent pas', r.autre==='cash', r.autre);
  t('… le questionnaire reste marqué terminé', r.done===true);
  t('… et on revient au récapitulatif (on peut en corriger une autre)',
    r.revenu===13&&r.encoreOuvert===true, JSON.stringify({l:r.revenu,o:r.encoreOuvert}));
  await q.c.close();
}

// ── 4. Jamais commencé : rien ne change, on démarre bien à la question 1 ─────
{
  const q=await page();
  const r=await q.p.evaluate(()=>{
    openCoachQuiz('free');
    return {idx:_cqIdx, question:(document.querySelector('#cq-step .cq-q')||{}).textContent||'',
            recap:document.querySelectorAll('#cq-step .cq-recap').length};
  });
  t('aucune réponse → on commence à la question 1 (0 régression)', r.idx===0&&r.recap===0, JSON.stringify(r));
  t('… avec la première question', /Depuis combien de temps/.test(r.question), r.question);
  await q.c.close();
}

// ── 5. La série AVANCÉE garde exactement son comportement ───────────────────
{
  const pro={answers:{job:'bureau',stress:'moy'},done:false,lastAsked:'2026-07-01',date:'2026-07-01'};
  const q=await page({ft4_coachquizpro:JSON.stringify(pro)});
  const r=await q.p.evaluate(()=>{
    openCoachQuiz('pro');
    return {idx:_cqIdx, question:(document.querySelector('#cq-step .cq-q')||{}).textContent||''};
  });
  t('série avancée : reprend toujours à la 1ʳᵉ non répondue', r.idx===2, 'reçu '+r.idx);
  t('… soit la question sur le sommeil', /combien d'heures/i.test(r.question), r.question);
  await q.c.close();
}

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
