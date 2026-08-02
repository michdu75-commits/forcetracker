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
 'flexion-poignet':['forearms'],'abduction-hanche':['glutes']};
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

t('0 erreur JS', errs.length===0, errs.join(' | '));

console.log('══════════════════════════════════════════════════════════');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
