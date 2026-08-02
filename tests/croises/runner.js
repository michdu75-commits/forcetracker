#!/usr/bin/env node
/**
 * ═══ LES CROISEMENTS — la 12ᵉ famille (02/08/2026) ═══
 *
 * POURQUOI ELLE EXISTE. Michel, après un audit où j'avais lu les 69 règles de
 * classement une par une : *« mon intuition me dit qu'il y a un truc qui va pas…
 * il faudrait croiser les données comme on a fait une fois en linéaire et en
 * diagonale… je le sens, y'a un truc qui nous a échappé »*.
 *
 * Il avait raison. La lecture LINÉAIRE (chaque règle isolément) avait trouvé 4
 * erreurs. Le croisement en a trouvé **13 de plus** — dont trois que j'avais
 * créées moi-même deux jours plus tôt.
 *
 * L'IDÉE, et c'est ce qui rend cette famille différente des 11 autres : l'app
 * connaît PLUSIEURS choses indépendantes sur un même exercice — son groupe
 * musculaire (choisi à la main), ses muscles (calculés), son schéma de mouvement,
 * son terme de recherche anglais, le fichier de son animation, son bac de
 * matériel. Chacune est plausible seule. **C'est quand deux se contredisent qu'on
 * tient un bug** — et aucun de ces bugs ne fait planter quoi que ce soit, donc
 * rien ne les signalait.
 *
 * Exemple réel : « Tirage Vertical (Upright Row) » et « Tirage Menton » pointaient
 * le MÊME terme anglais et la même animation → c'était le même exercice sous deux
 * noms, et l'un des deux portait le nom d'un autre mouvement.
 *
 * LES 6 CROISEMENTS :
 *   ① aucune règle de classement ne doit être MORTE (cachée derrière une plus large)
 *   ② deux exercices ne partagent pas la même ANIMATION
 *   ③ deux exercices ne partagent pas le même TERME ANGLAIS
 *   ④ le GROUPE choisi à la main ne contredit pas les MUSCLES calculés
 *   ⑤ le SCHÉMA DE MOUVEMENT ne contredit pas les MUSCLES
 *   ⑥ le MATÉRIEL déduit ne contredit pas le mot écrit dans le NOM
 *
 * Lancer : node tests/croises/runner.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};

// ─── LES EXCEPTIONS ASSUMÉES ────────────────────────────────────────────────
// Une exception SANS raison écrite est refusée : une exception dont on a oublié le
// motif finit toujours par être contournée (R27). Chaque ligne dit pourquoi.
const TOLERE={
  // ① règles volontairement redondantes : elles disent la même chose que celle qui
  //    les précède, donc leur mort ne change aucun résultat. Gardées comme filet.
  reglesMortes:[],
  // ④ groupes où le classement à la main diffère exprès des muscles calculés
  groupe:{
    // le sélecteur range cet exercice là où on le CHERCHE, pas là où ça tire
    'Planche Inversée':'rangée dans Abdominaux parce qu\'on la cherche avec les gainages ; ses muscles moteurs sont bien fessiers + lombaires',
    // ⏭️ EN ATTENTE D'ARBITRAGE (02/08) : la relecture des pectoraux a montré que c'est une
    // machine à TRICEPS (son animation le montre sans ambiguïté), pas un dips de pectoraux.
    // Ses muscles sont corrigés ; son GROUPE ne l'est pas encore, parce que déplacer un
    // exercice change ce que voit l'utilisateur dans le sélecteur — c'est la décision de
    // Michel, pas la mienne (R29). À lever quand le groupe Triceps sera basculé lui aussi.
    'Dips Assis Machine (Seated Dip)':'muscles corrigés en triceps ; groupe encore Pectoraux, déplacement en attente de décision',
  },
  // ⑤ schémas volontairement différents des muscles
  schema:{
    'Planche de Préhension':'un maintien de prise : le SCHÉMA est un gainage (rien ne bouge), les MUSCLES sont les avant-bras. Les deux sont justes.',
    'Sled Pull':'',    // corrigé le 02/08 — ne doit plus apparaître
  },
  // ⑥ matériel : noms contenant deux matériels, ou un mot trompeur
  materiel:{},
};

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);

console.log('\n═══ LES CROISEMENTS — 6 diagonales sur tout le catalogue ═══');

const D=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))];
  const naz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const N=_MEX.length;
  const ex=noms.map(n=>{
    const s=naz(n); let i=-1;
    for(let k=0;k<N;k++){ if(_MEX[k].re.test(s)){i=k;break;} }
    const d=_mscScores([E(n)])||{}, sc=d.sc||{};
    return {nom:n, groupe:(EXLIB.find(e=>e.n===n)||{}).g, regle:i,
      p:Object.keys(sc).filter(k=>sc[k]===2).sort(), s:Object.keys(sc).filter(k=>sc[k]===1).sort(),
      pat:_movPattern(n), eq:_exEquip(n),
      en:(typeof EX_EN!=='undefined'&&EX_EN[n])?naz(EX_EN[n]):null,
      img:(typeof EX_YT!=='undefined'&&EX_YT[n])?EX_YT[n].img:null};
  });
  const used=new Set(ex.map(e=>e.regle));
  const mortes=[]; for(let k=0;k<N;k++) if(!used.has(k)) mortes.push({i:k,re:String(_MEX[k].re).slice(0,90)});
  return {ex, mortes, nbRegles:N};
});
const ex=D.ex;
console.log('     ℹ️  '+ex.length+' exercices · '+D.nbRegles+' règles de classement');

// ── ① AUCUNE RÈGLE MORTE ────────────────────────────────────────────────────
// Une règle précise placée APRÈS une règle plus large ne se déclenche jamais : elle
// est du code mort, et surtout le classement qu'elle portait n'existe pas. C'est
// comme ça qu'on a découvert que les oiseaux recevaient le deltoïde MOYEN en muscle
// principal, alors qu'une règle « deltoïde arrière » existait, inatteignable.
const mortesReelles=D.mortes.filter(m=>!TOLERE.reglesMortes.includes(m.i));
t('⭐ ① aucune règle de classement n\'est MORTE (cachée derrière une plus large)',
  mortesReelles.length===0,
  mortesReelles.map(m=>'#'+m.i+' '+m.re).join('\n         '));

// ── ② PAS DEUX EXERCICES SUR LA MÊME ANIMATION ──────────────────────────────
// Deux fiches qui pointent le même fichier vidéo : soit c'est le même exercice en
// double, soit l'une des deux montre autre chose que son nom.
const parImg={}; ex.forEach(e=>{ if(e.img) (parImg[e.img]=parImg[e.img]||[]).push(e.nom); });
const imgDbl=Object.entries(parImg).filter(([,v])=>v.length>1);
t('⭐ ② deux exercices ne partagent jamais la même ANIMATION',
  imgDbl.length===0, imgDbl.map(([k,v])=>k+' → '+v.join(' = ')).join('\n         '));

// ── ③ PAS DEUX EXERCICES SUR LE MÊME TERME ANGLAIS ──────────────────────────
const parEn={}; ex.forEach(e=>{ if(e.en) (parEn[e.en]=parEn[e.en]||[]).push(e.nom); });
const enDbl=Object.entries(parEn).filter(([,v])=>v.length>1);
t('⭐ ③ deux exercices ne partagent jamais le même TERME ANGLAIS',
  enDbl.length===0, enDbl.map(([k,v])=>'« '+k+' » → '+v.join(' = ')).join('\n         '));

// ── ④ LE GROUPE NE CONTREDIT PAS LES MUSCLES ────────────────────────────────
const ATTENDU={'Pectoraux':['pec'],'Dos':['lats','traps','rear-delt','lower-back','forearms'],
 'Épaules':['front-delt','side-delt','rear-delt'],'Trapèzes':['traps','side-delt'],
 'Biceps':['biceps','forearms'],'Triceps':['triceps'],
 'Jambes':['quads','glutes','hamstrings','calves'],'Fessiers':['glutes','hamstrings'],
 'Lombaires':['lower-back','glutes','abs'],'Abdominaux':['abs','obliques','hip-flexors'],
 'Mollets':['calves'],'Avant-bras':['forearms']};
const grpKo=ex.filter(e=>{
  const a=ATTENDU[e.groupe]; if(!a||!e.p.length) return false;
  if(TOLERE.groupe[e.nom]) return false;
  return !e.p.some(m=>a.indexOf(m)>=0);
});
t('⭐ ④ le GROUPE choisi à la main ne contredit pas les MUSCLES calculés',
  grpKo.length===0, grpKo.map(e=>e.nom+' ['+e.groupe+'] → '+e.p.join(',')).join('\n         '));
// « Full Body » n'a pas de muscle attendu — mais il ne peut pas être une ISOLATION : un
// exercice annoncé comme complet qui ne toucherait qu'un muscle serait mal rangé. Sans ce
// contrôle, les 17 exercices du groupe échappaient entièrement au croisement ④.
const fbKo=ex.filter(e=>e.groupe==='Full Body'&&e.p.length&&(e.p.length+e.s.length)<3);
t('⭐ ④bis un exercice « Full Body » sollicite au moins 3 muscles (jamais une isolation)',
  fbKo.length===0, fbKo.map(e=>e.nom+' → '+e.p.concat(e.s).join(',')).join('\n         '));

// ── ⑤ LE SCHÉMA DE MOUVEMENT NE CONTREDIT PAS LES MUSCLES ───────────────────
// C'est ce croisement qui a attrapé le chariot de puissance : « Poussée » classée en
// TIRAGE horizontal. L'app croyait qu'on avait tiré alors qu'on avait poussé — donc
// l'équilibre de séance était faux, sans que rien ne le signale.
const PAT={'squat':['quads','glutes'],'fente':['quads','glutes'],
 'hip-hinge':['glutes','hamstrings','lower-back'],
 'poussee-horizontale':['pec','triceps','front-delt'],
 'poussee-verticale':['front-delt','side-delt','triceps'],
 'tirage-horizontal':['lats','traps','rear-delt'],'tirage-vertical':['lats','biceps'],
 'gainage-abdos':['abs','obliques','lower-back','hip-flexors'],
 'flexion-coude':['biceps','forearms'],'curl-biceps':['biceps','forearms'],
 'extension-coude':['triceps'],'extension-triceps':['triceps'],
 'extension-genou':['quads'],'flexion-genou':['hamstrings'],
 'mollets':['calves'],'extension-cheville':['calves'],
 'elevation-epaules':['front-delt','side-delt','rear-delt','traps'],
 'flexion-poignet':['forearms'],'abduction-hanche':['glutes'],
 // ── 6 schémas ajoutés à la table le 02/08 : ils existaient dans l'app mais PAS ici, donc
 //    19 exercices échappaient au croisement ⑤ sans que rien ne le dise. Un croisement qui
 //    ne couvre pas tout doit le dire — sinon on croit avoir tout vérifié.
 'porte':['forearms','traps'],'poignet':['forearms'],'hanche-laterale':['glutes'],
 'saut-plyo':['quads','glutes','calves','hamstrings'],
 'halterophilie':['quads','glutes','front-delt','traps','hamstrings','lower-back'],
 'cardio':['quads','glutes','calves','front-delt','lats','abs','hamstrings']};
const patKo=ex.filter(e=>{
  const a=PAT[e.pat]; if(!a||!e.p.length) return false;
  if(TOLERE.schema[e.nom]) return false;
  return !e.p.some(m=>a.indexOf(m)>=0);
});
t('⭐ ⑤ le SCHÉMA DE MOUVEMENT ne contredit pas les MUSCLES',
  patKo.length===0, patKo.map(e=>e.nom+' → schéma '+e.pat+' mais muscles '+e.p.join(',')).join('\n         '));

// ── ⑥ LE MATÉRIEL DÉDUIT NE CONTREDIT PAS LE NOM ────────────────────────────
// Si « haltère » est écrit dans le nom, l'exercice ne peut pas être rangé en machine.
const MOT={'barre':'barre','haltere':'libre','kettlebell':'libre','machine':'guide',
 'poulie':'guide','elastique':'elast','trx':'trx','smith':'guide'};
const eqKo=ex.filter(e=>{
  if(TOLERE.materiel[e.nom]) return false;
  const s=e.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const mots=Object.keys(MOT).filter(m=>s.indexOf(m)>=0);
  if(mots.length!==1) return false;               // deux matériels dans le nom → ambigu, on ne juge pas
  if(['cardio','trx','elast'].indexOf(e.eq)>=0) return false;
  return e.eq!==MOT[mots[0]];
});
t('⭐ ⑥ le MATÉRIEL déduit ne contredit pas le mot écrit dans le NOM',
  eqKo.length===0, eqKo.map(e=>e.nom+' → rangé '+e.eq).join('\n         '));

// ── LES TÉMOINS : les corrections du 02/08, figées une par une ──────────────
console.log('\n─── les corrections du 02/08, figées ─────────────────────');
const fiche=n=>ex.find(e=>e.nom===n);
const F=(n,champ)=>{const e=fiche(n); return e?(Array.isArray(e[champ])?e[champ].join(','):e[champ]):'ABSENT';};

t('le chariot POUSSÉE n\'est plus classé en « tirage »', F('Chariot de Puissance — Poussée','pat')==='squat',
  F('Chariot de Puissance — Poussée','pat'));
t('le chariot TIRAGE ÉPAULES est une élévation d\'épaule',
  F('Chariot de Puissance — Tirage Épaules','pat')==='elevation-epaules', F('Chariot de Puissance — Tirage Épaules','pat'));
t('le « Sled Pull » est un TIRAGE (il était classé en squat)',
  F('Sled Pull','pat')==='tirage-horizontal', F('Sled Pull','pat'));
t('témoin : le chariot TIRAGE DOS reste un tirage horizontal',
  F('Chariot de Puissance — Tirage Dos','pat')==='tirage-horizontal', F('Chariot de Puissance — Tirage Dos','pat'));

t('⭐ l\'OISEAU est du deltoïde ARRIÈRE (il avait le deltoïde moyen en principal)',
  F('Oiseau','p')==='rear-delt', F('Oiseau','p'));
t('⭐ le FACE PULL aussi', F('Tirage Visage (Face Pull)','p')==='rear-delt', F('Tirage Visage (Face Pull)','p'));
t('témoin : l\'élévation LATÉRALE reste du deltoïde MOYEN',
  F('Élévations Latérales (Lateral Raise)','p')==='side-delt', F('Élévations Latérales (Lateral Raise)','p'));

t('⭐ le LEG CURL est des ischios seuls (les fessiers ne font que stabiliser)',
  F('Leg Curl Couché Machine','p')==='hamstrings', F('Leg Curl Couché Machine','p'));
t('témoin : le soulevé de terre ROUMAIN garde bien les fessiers en principal',
  F('Soulevé de Terre Roumain Barre','p').indexOf('glutes')>=0, F('Soulevé de Terre Roumain Barre','p'));

t('⭐ le GLUTE HAM RAISE est un exercice d\'ISCHIOS (il était classé lombaires)',
  F('Glute Ham Raise (GHD)','p').indexOf('hamstrings')>=0, F('Glute Ham Raise (GHD)','p'));
t('témoin : l\'hyperextension reste lombaires + fessiers',
  F('Hyperextension (Back Extension)','p')==='glutes,lower-back', F('Hyperextension (Back Extension)','p'));

t('⭐ la PLANCHE LATÉRALE est un exercice d\'OBLIQUES',
  F('Planche Latérale (Side Plank)','p')==='obliques', F('Planche Latérale (Side Plank)','p'));
t('témoin : le gainage de face reste abdos + lombaires',
  F('Gainage','p')==='abs,lower-back', F('Gainage','p'));

t('⭐ le FARMER\'S WALK est un exercice de PRISE (il était classé cuisses)',
  F("Farmer's Walk",'p')==='forearms,traps', F("Farmer's Walk",'p'));

t('⭐ « Leg Curl Haltère » est rangé en poids LIBRE (il était en Guidé)',
  F('Leg Curl Haltère','eq')==='libre', F('Leg Curl Haltère','eq'));
t('⭐ « Montée sur Box Haltères » aussi (elle était en poids du corps)',
  F('Montée sur Box Haltères','eq')==='libre', F('Montée sur Box Haltères','eq'));

// ── LES DOUBLONS FUSIONNÉS : l'historique doit SUIVRE ───────────────────────
const dispo=new Set(ex.map(e=>e.nom));
['Curl Ischio-jambiers (Leg Curl)',"Haussements d'Épaules (Shrugs)","Farmer's Walk (Grip)",
 'Tirage Vertical (Upright Row)'].forEach(n=>{
  t('le doublon « '+n+' » n\'est plus au catalogue', !dispo.has(n));
});
t('« Tirage Menton Kettlebell » a remplacé le nom trompeur « Tirage Vertical »',
  dispo.has('Tirage Menton Kettlebell'));

const migr=await p.evaluate(()=>{
  localStorage.setItem('ft4_prs',JSON.stringify({
    'Curl Ischio-jambiers (Leg Curl)':{rm1:0,kg:45,reps:12,date:'2026-06-01'},
    'Tirage Vertical (Upright Row)':{rm1:0,kg:30,reps:10,date:'2026-06-02'}}));
  localStorage.setItem('ft4_sessions',JSON.stringify([{date:'2026-06-01',exs:[
    {name:"Farmer's Walk (Grip)",sets:[{kg:40,reps:1,done:true,type:'N'}]},
    {name:"Haussements d'Épaules (Shrugs)",sets:[{kg:80,reps:12,done:true,type:'N'}]}],vol:1000}]));
  load();
  return {prs:Object.keys(S.prs||{}).sort(), sess:(S.sessions[0].exs||[]).map(e=>e.name).sort()};
});
t('⭐ MIGRATION : les records des fiches fusionnées ont REJOINT celle qui reste',
  migr.prs.indexOf('Leg Curl Couché Machine')>=0 && migr.prs.indexOf('Tirage Menton Kettlebell')>=0
  && migr.prs.indexOf('Curl Ischio-jambiers (Leg Curl)')<0,
  migr.prs.join(' · '));
t('⭐ MIGRATION : les séances passées aussi',
  migr.sess.indexOf("Farmer's Walk")>=0 && migr.sess.indexOf("Haussements d'Épaules Barre")>=0,
  migr.sess.join(' · '));


// ═══ ⑦ L'EMPREINTE DU CATALOGUE — la régression silencieuse ═══════════════════════
// Idée venue de la relecture externe : « peut-on détecter automatiquement une régression
// après une modification de règle ? »  Mesuré le 02/08 : **60 exercices sur 337 (18 %)**
// sont classés de façon FRAGILE — plusieurs règles leur correspondent en donnant des
// muscles DIFFÉRENTS. Ils sont justes aujourd'hui uniquement parce que la bonne règle est
// placée avant. Insérer une règle au mauvais endroit les fait basculer EN SILENCE : c'est
// exactement ce qui est arrivé aux oiseaux (10 exercices) et aux élévations latérales.
// L'empreinte fige le classement des 337 ; toute dérive se voit ici, voulue ou non.
// ⚠️ Changement VOULU → relancer `node tools/gen_reference_catalogue.js`, et le diff git
//    montre exactement quels exercices ont bougé. C'est la revue qui manquait.
const REF=require('./catalogue-reference.json');
const emp=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))].sort();
  const naz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const N=_MEX.length;
  const sig=r=>(r.p||[]).slice().sort().join('+')+'|'+(r.s||[]).slice().sort().join('+');
  const ex={}; let fragiles=0;
  noms.forEach(n=>{
    const d=_mscScores([E(n)])||{}, sc=d.sc||{};
    const q=naz(n); const match=[];
    for(let k=0;k<N;k++) if(_MEX[k].re.test(q)) match.push(k);
    if([...new Set(match.map(k=>sig(_MEX[k])))].length>1) fragiles++;
    ex[n]={p:Object.keys(sc).filter(k=>sc[k]===2).sort().join(','),
           s:Object.keys(sc).filter(k=>sc[k]===1).sort().join(','),
           pat:_movPattern(n)||'', eq:_exEquip(n), met:getExerciseMET(n)};
  });
  return {ex, total:noms.length, fragiles};
});
const bouge=[], dispar=[], nouveaux=[];
Object.keys(REF.ex).forEach(n=>{
  const a=REF.ex[n], b2=emp.ex[n];
  if(!b2){ dispar.push(n); return; }
  ['p','s','pat','eq','met'].forEach(k=>{
    if(String(a[k])!==String(b2[k])) bouge.push(n+' · '+k+' : '+a[k]+' → '+b2[k]);
  });
});
Object.keys(emp.ex).forEach(n=>{ if(!REF.ex[n]) nouveaux.push(n); });
t('⭐ ⑦ EMPREINTE : aucun exercice n\'a changé de classement sans qu\'on le veuille',
  bouge.length===0, bouge.slice(0,10).join('\n         ')
  + (bouge.length>10?'\n         … et '+(bouge.length-10)+' autres':'')
  + '\n         → si c\'est VOULU : node tools/gen_reference_catalogue.js');
t('⑦ EMPREINTE : le catalogue n\'a ni perdu ni gagné d\'exercice en douce',
  dispar.length===0&&nouveaux.length===0,
  'disparus : '+dispar.join(', ')+' · nouveaux : '+nouveaux.join(', '));

// ═══ ⑧ L'INDICATEUR DE CONFIANCE ═════════════════════════════════════════════════
// « Fragile » = plusieurs règles correspondent en donnant des muscles différents, donc le
// résultat dépend de l'ORDRE. Ce n'est PAS une erreur : c'est une surface de risque. Elle
// ne doit pas grandir sans qu'on le décide — chaque point de plus, c'est un exercice de
// plus qui basculera au prochain ajout de règle.
const partFrag=Math.round(100*emp.fragiles/emp.total);
console.log('     ℹ️  confiance : '+(emp.total-emp.fragiles)+'/'+emp.total+' classés sans ambiguïté ('
  +(100-partFrag)+' %) · '+emp.fragiles+' dépendent de l\'ordre des règles ('+partFrag+' %)');
t('⭐ ⑧ CONFIANCE : la part d\'exercices dont le classement dépend de l\'ordre ne grandit pas',
  emp.fragiles<=REF.fragiles, emp.fragiles+' aujourd\'hui contre '+REF.fragiles+' à la référence');


// ═══ ⑨ L'IDENTITÉ DES EXERCICES — la clé stable (02/08) ═══════════════════════════
// Le NOM était la clé primaire de tout l'historique. `EX_IDS` donne à chaque exercice un
// identifiant qui, lui, ne changera JAMAIS — et porte la liste de ses anciens noms.
// Ces tests protègent trois promesses : les identifiants ne bougent pas · chaque exercice
// du catalogue en a un · un ancien nom retrouve toujours sa fiche.
const idt=await p.evaluate(()=>{
 // ⚠️ try/catch OBLIGATOIRE : sans lui, une variable absente fait PLANTER le runner au lieu
 // de le faire échouer — et un contrôle négatif affiche alors « 0 rouge », ce qui se lit
 // comme un succès. C'est la famille n°12 de BUGS.md, reproduite en écrivant ce test-ci.
 try{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))];
  const ids=Object.keys(EX_IDS||{});
  const tousNoms=[]; ids.forEach(i=>EX_IDS[i].forEach(n=>tousNoms.push(n)));
  return {
    nbIds:ids.length, nbExercices:noms.length,
    idsUniques:new Set(ids).size===ids.length,
    nomsUniques:new Set(tousNoms).size===tousNoms.length,
    // tout exercice du catalogue a un identifiant, et le nom affiché est bien le PREMIER
    sansId:noms.filter(n=>!exId(n)),
    nomPasEnTete:noms.filter(n=>{const i=exId(n);return i&&EX_IDS[i][0]!==n;}),
    // tout identifiant pointe vers un exercice qui existe vraiment
    idsOrphelins:ids.filter(i=>noms.indexOf(EX_IDS[i][0])<0),
    // les allers-retours
    arDevCouche:exNom(exId('Développé Couché')),
    ancienRowing:exId('Rowing Barre'),                       // ancien nom
    ancienResolu:exNomActuel('Rowing Barre'),
    ancienPompes:exNomActuel('Pompes'),
    fusionLegCurl:exNomActuel('Curl Ischio-jambiers (Leg Curl)'),
    // un exercice PERSO n'a pas d'identifiant, et son nom n'est pas inventé
    persoId:exId('Mon Exercice à Moi'), persoNom:exNomActuel('Mon Exercice à Moi'),
    inconnuNom:exNom('identifiant-qui-nexiste-pas')
  };
 }catch(e){ return {erreur:String(e&&e.message||e), sansId:['(runner en erreur)'], nomPasEnTete:[],
   idsOrphelins:[], nbIds:-1, nbExercices:-1, idsUniques:false, nomsUniques:false}; }
});
if(idt.erreur) console.log('     ⚠️  bloc identité en ERREUR : '+idt.erreur);
t('⭐ ⑨ chaque exercice du catalogue a un identifiant STABLE',
  idt.sansId.length===0&&idt.nbIds===idt.nbExercices,
  idt.nbIds+' identifiants pour '+idt.nbExercices+' exercices · sans id : '+idt.sansId.slice(0,5).join(', '));
t('⑨ les identifiants sont uniques, et les noms ne sont jamais partagés entre deux fiches',
  idt.idsUniques&&idt.nomsUniques, 'ids uniques='+idt.idsUniques+' noms uniques='+idt.nomsUniques);
t('⑨ le nom AFFICHÉ est toujours le premier de la liste (les suivants sont les anciens)',
  idt.nomPasEnTete.length===0, idt.nomPasEnTete.slice(0,5).join(', '));
t('⑨ aucun identifiant ne pointe vers un exercice disparu du catalogue',
  idt.idsOrphelins.length===0, idt.idsOrphelins.slice(0,5).join(', '));
t('⭐ ⑨ un ANCIEN nom retrouve sa fiche actuelle (c\'est ce qui sauve l\'historique)',
  idt.ancienRowing==='rowing-barre-tirage-horizontal'
  && idt.ancienResolu==='Rowing Barre (Tirage Horizontal)'
  && idt.ancienPompes==='Pompes (Push-up)'
  && idt.fusionLegCurl==='Leg Curl Couché Machine',
  [idt.ancienResolu, idt.ancienPompes, idt.fusionLegCurl].join(' · '));
t('⑨ l\'aller-retour nom → identifiant → nom est fidèle',
  idt.arDevCouche==='Développé Couché', String(idt.arDevCouche));
t('⭐ ⑨ un exercice PERSO n\'a pas d\'identifiant, et son nom n\'est pas inventé (R29)',
  idt.persoId===null && idt.persoNom==='Mon Exercice à Moi' && idt.inconnuNom===null,
  'id='+idt.persoId+' nom='+idt.persoNom+' inconnu='+idt.inconnuNom);

// L'EMPREINTE DES IDENTIFIANTS : un identifiant ne doit JAMAIS changer, sinon tout
// l'historique rangé sous l'ancien devient orphelin. On les fige ici.
const REFID=require('./identifiants-reference.json');
const idsActuels=await p.evaluate(()=>{
  try{ const o={}; Object.keys(EX_IDS).forEach(i=>{o[i]=EX_IDS[i][0];}); return o; }catch(e){ return {}; }
});
const idPerdus=Object.keys(REFID.ids).filter(i=>!idsActuels[i]);
const idRenommes=Object.keys(REFID.ids).filter(i=>idsActuels[i]&&idsActuels[i]!==REFID.ids[i]);
t('⭐ ⑨ AUCUN identifiant n\'a disparu (il emporterait tout l\'historique rangé dessous)',
  idPerdus.length===0, idPerdus.slice(0,8).join(', '));
if(idRenommes.length) console.log('     ℹ️  '+idRenommes.length+' exercice(s) renommé(s) depuis la référence — '
  +'normal si c\'est voulu : '+idRenommes.slice(0,3).map(i=>REFID.ids[i]+' → '+idsActuels[i]).join(' · '));


// ═══ ⑩ LES EXERCICES SOCLES — écrits en dur, jamais régénérables ══════════════════
// POURQUOI EN PLUS DE L'EMPREINTE. L'empreinte ⑦ couvre les 337, mais elle se REGÉNÈRE
// (`node tools/gen_reference_catalogue.js`). Quelqu'un de pressé peut donc la régénérer
// sans lire le diff, et un basculement du développé couché passerait inaperçu.
// Ces attentes-ci sont écrites À LA MAIN : les modifier est un acte VOLONTAIRE et visible.
//
// LE CHOIX DES EXERCICES N'EST PAS UNE OPINION. Mesuré le 02/08 : les 60 exercices dont le
// classement dépend de l'ORDRE des règles ne sont pas des cas obscurs — ils se concentrent
// sur les familles les plus courantes (13 « Développé », 10 « Tirage », 5 « Rowing »), et
// **le Développé Couché en fait partie** alors qu'il sert de référence au niveau de force.
// C'est logique : ce sont justement les familles où une règle précise doit battre une règle
// large. Donc la surface de risque est concentrée là où ça coûte le plus cher.
const socles=await p.evaluate(()=>{
 try{
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const f=n=>{const sc=(_mscScores([E(n)])||{}).sc||{};
    return {p:Object.keys(sc).filter(k=>sc[k]===2).sort().join(','), pat:_movPattern(n), eq:_exEquip(n)};};
  const o={};
  ['Développé Couché','Squat à la Barre','Soulevé de Terre','Développé Militaire',
   'Tirage Poulie Haute (Lat Pulldown)','Rowing Barre (Tirage Horizontal)','Curl Barre',
   'Tractions (Pull-up)','Dips','Élévations Latérales (Lateral Raise)'].forEach(n=>{o[n]=f(n);});
  return o;
 }catch(e){ return {erreur:String(e&&e.message||e)}; }
});
// Les attentes, écrites à la main. Toute modification ici doit être un choix assumé.
const ATTENDU_SOCLE={
  'Développé Couché':                   {p:'pec',                    pat:'poussee-horizontale', eq:'barre'},
  'Squat à la Barre':                   {p:'glutes,quads',           pat:'squat',               eq:'barre'},
  'Soulevé de Terre':                   {p:'glutes,hamstrings,lower-back', pat:'hip-hinge',     eq:'barre'},
  'Développé Militaire':                {p:'front-delt,side-delt,triceps', pat:'poussee-verticale', eq:'barre'},
  'Tirage Poulie Haute (Lat Pulldown)': {p:'biceps,lats',            pat:'tirage-vertical',     eq:'guide'},
  'Rowing Barre (Tirage Horizontal)':   {p:'lats,rear-delt,traps',   pat:'tirage-horizontal',   eq:'barre'},
  'Curl Barre':                         {p:'biceps',                 pat:'curl-biceps',         eq:'barre'},
  'Tractions (Pull-up)':                {p:'biceps,lats',            pat:'tirage-vertical',     eq:'corps'},
  'Dips':                               {p:'pec,triceps',            pat:'poussee-horizontale', eq:'corps'},
  'Élévations Latérales (Lateral Raise)':{p:'side-delt',             pat:'elevation-epaules',   eq:'autre'}
};
const soclesKo=[];
Object.keys(ATTENDU_SOCLE).forEach(n=>{
  const a=ATTENDU_SOCLE[n], b2=socles[n];
  if(!b2){ soclesKo.push(n+' : ABSENT du catalogue'); return; }
  ['p','pat','eq'].forEach(k=>{ if(a[k]!==b2[k]) soclesKo.push(n+' · '+k+' : attendu '+a[k]+', reçu '+b2[k]); });
});
t('⭐ ⑩ SOCLES : les 10 exercices de base gardent EXACTEMENT leur classement',
  soclesKo.length===0 && !socles.erreur,
  (socles.erreur?'runner en erreur : '+socles.erreur+'\n         ':'')
  + soclesKo.join('\n         ')
  + '\n         → ces attentes sont écrites À LA MAIN dans le test : les changer doit être un choix.');


// ═══ ⑪ LES INTERDICTIONS — la donnée écrite prime, et rien ne se fige sans relecture ═══
// Demandées par Michel en lançant la bascule : « il va falloir mettre en place des
// interdictions ». Elles ferment les trois portes par lesquelles la migration pourrait
// se retourner contre nous.
const inter=await p.evaluate(()=>{
 try{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))];
  const ids=Object.keys(EX_MUSCLES||{});
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  // ① la donnée écrite doit ÊTRE celle qu'on utilise — pas celle des règles
  const divergents=[];
  ids.forEach(id=>{
    const nom=exNom(id); if(!nom) return;
    const attendu=EX_MUSCLES[id];
    const sc=(_mscScores([E(nom)])||{}).sc||{};
    const p2=Object.keys(sc).filter(k=>sc[k]===2).sort().join(',');
    const s2=Object.keys(sc).filter(k=>sc[k]===1).sort().join(',');
    if(p2!==(attendu.p||[]).slice().sort().join(',') || s2!==(attendu.s||[]).slice().sort().join(','))
      divergents.push(nom+' : écrit ['+attendu.p+'] / obtenu ['+p2+']');
  });
  // ② aucune entrée sans marque de relecture
  const sansVu=ids.filter(i=>!/^\d{4}-\d{2}-\d{2}$/.test(EX_MUSCLES[i].vu||''));
  // ③ aucune donnée orpheline (identifiant qui ne correspond à aucun exercice)
  const orphelins=ids.filter(i=>!exNom(i));
  // ④ un groupe basculé doit l'être EN ENTIER — sinon deux vérités coexistent dedans
  const parGroupe={};
  noms.forEach(n=>{ const g=(EXLIB.find(e=>e.n===n)||{}).g;
    (parGroupe[g]=parGroupe[g]||{tot:0,ecrits:0}); parGroupe[g].tot++;
    if(exMuscles(n)) parGroupe[g].ecrits++; });
  const moities=Object.keys(parGroupe).filter(g=>{
    const x=parGroupe[g]; return x.ecrits>0 && x.ecrits<x.tot;
  }).map(g=>g+' : '+parGroupe[g].ecrits+'/'+parGroupe[g].tot);
  return {divergents, sansVu, orphelins, moities, nbEcrits:ids.length, nbTotal:noms.length,
          groupes:Object.keys(parGroupe).filter(g=>parGroupe[g].ecrits===parGroupe[g].tot&&parGroupe[g].ecrits>0)};
 }catch(e){ return {erreur:String(e&&e.message||e), divergents:['(runner en erreur)'],
   sansVu:[], orphelins:[], moities:[], nbEcrits:-1, nbTotal:-1, groupes:[] }; }
});
if(inter.erreur) console.log('     ⚠️  bloc interdictions en ERREUR : '+inter.erreur);
console.log('     ℹ️  muscles ÉCRITS : '+inter.nbEcrits+'/'+inter.nbTotal
  +' exercices · groupes entièrement basculés : '+(inter.groupes.join(', ')||'aucun'));
t('⭐ ⑪ INTERDIT : un exercice dont les muscles sont ÉCRITS ne passe jamais par les règles',
  inter.divergents.length===0, inter.divergents.slice(0,6).join('\n         '));
t('⭐ ⑪ INTERDIT : figer un classement sans l\'avoir RELU (chaque entrée porte sa date)',
  inter.sansVu.length===0, inter.sansVu.slice(0,8).join(', ')
  +'\n         → une entrée sans `vu` graverait une erreur au lieu de la corriger.');
t('⑪ INTERDIT : une donnée écrite pour un exercice qui n\'existe pas',
  inter.orphelins.length===0, inter.orphelins.slice(0,8).join(', '));
t('⭐ ⑪ INTERDIT : basculer un groupe À MOITIÉ (deux vérités cohabiteraient dedans)',
  inter.moities.length===0, inter.moities.join(' · ')
  +'\n         → un groupe se bascule en entier, ou pas du tout.');

t('0 erreur JS', errs.length===0, errs.join(' | '));

console.log('══════════════════════════════════════════════════════════');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
