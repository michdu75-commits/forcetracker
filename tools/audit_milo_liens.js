#!/usr/bin/env node
/**
 * AUDIT DES LIENS DE MILO — qui alimente quoi, et qu'est-ce qui se perd / ne sert à rien / fait doublon.
 *
 * Demande de Michel, 12/09/2026 : *« tu feras l'architecture de Milo aussi, tu marquerais dans le
 * fichier les connexions entre eux et voir s'il y a des informations qui se perdent, ne servent à
 * rien ou bien qui sont en doublons »*.
 *
 * ⚠️⚠️ CE QUE CE SCRIPT PEUT DIRE, ET CE QU'IL NE PEUT PAS.
 *   ✅ il mesure la PRÉSENCE : telle donnée du profil arrive-t-elle dans le texte envoyé à Milo,
 *      une fois, plusieurs fois, ou jamais ?
 *   ⛔ il ne mesure PAS l'UTILITÉ : savoir si une section « sert » demande de faire tourner le
 *      modèle avec et sans (c'est **R34**, le banc d'essai). `docs/AUDIT-CONTEXTE-MILO.md` §9 le
 *      dit déjà, et on ne le contredit pas ici.
 *   👉 *Un doublon mesuré est un fait ; une section « inutile » est une hypothèse.*
 *
 * LA MÉTHODE QUI REND LA MESURE POSSIBLE : on sème le profil avec des valeurs **uniques et
 * improbables** (un poids de 83,7 kg, une taille de 187 cm, un tour de cou de 41,5…). Chaque
 * nombre devient alors une **empreinte** qu'on peut chercher dans le texte. Avec des valeurs
 * rondes (80, 30, 175), on ne saurait jamais si le « 80 » trouvé est le poids ou autre chose.
 *
 *   node tools/audit_milo_liens.js            → le rapport
 *   node tools/audit_milo_liens.js --texte    → + le contexte complet dans /tmp
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

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

const R=await p.evaluate(async()=>{
  const J=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10);};

  /* ── LE PROFIL-EMPREINTE : chaque valeur est unique et improbable ─────────────────── */
  const EMPREINTES={
    bw:83.7, age:41, height:187, neck:41.5, waist:88.3, hip:99.7, targetWeight:78.4,
    mensCycleDur:29, activityLevel:1.62
  };
  Object.assign(S, EMPREINTES);
  S.name='Empreinte'; S.gender='H'; S.goal='muscle'; S.goal2='force';
  S.level='confirme'; S.discipline='powerbuilding'; S.workType='physique'; S.smoker=false;
  S.morpho='ectomorphe'; S.priorities=['Dorsaux','Ischio-jambiers'];
  S.nutritionPhase='charge'; S.foodMode='omnivore'; S.keto=false; S.fasting='';
  S.scaleType='impedance'; S.coachTone='direct'; S.premium=true; S.email='empreinte@test.fr';

  S.sessions=[
    {date:J(2), vol:7431, exs:[{name:'Développé Couché',sets:[
      {kg:92.5,reps:6,done:true,type:'N',rir:2},{kg:92.5,reps:5,done:true,type:'N',rir:1}]}]},
    {date:J(5), vol:6218, exs:[{name:'Squat à la Barre',sets:[
      {kg:137.5,reps:4,done:true,type:'N',rir:1}]}]},
    {date:J(9), vol:5904, exs:[{name:'Soulevé de Terre',sets:[
      {kg:171,reps:3,done:true,type:'N'}]}]}
  ];
  S.prs={'Développé Couché':{kg:92.5,reps:6,rm1:111,date:J(2)},
         'Squat à la Barre':{kg:137.5,reps:4,rm1:153,date:J(5)},
         'Soulevé de Terre':{kg:171,reps:3,rm1:186,date:J(9)}};
  S.weightLog=[{date:J(21),kg:84.9},{date:J(7),kg:84.1},{date:J(1),kg:83.7}];
  S.sleepLog=[{date:J(2),hours:6.4,energy:3},{date:J(1),hours:7.3,energy:4}];
  S.healthProfile='Tendinite épaule droite en 2023, gênant au développé militaire.';
  S.registre={facts:{},observations:[],updatedAt:'',lastObsAt:''};
  S.coachMemory=[{d:J(12), t:'Prépare un déménagement en octobre, moins de temps en salle.'}];
  S.strengthGoals={'Développé Couché':120};
  S.exRestPref={'Squat à la Barre':213};
  S.programmes=[{name:'Powerbuilding 8 semaines',weeks:8,startDate:J(14),
                 days:[{label:'J1 Haut',exs:[{name:'Développé Couché',sets:[{kg:85,reps:8}]}]}]}];
  if(typeof persist==='function') persist();

  /* ── LE TEXTE RÉELLEMENT ENVOYÉ ────────────────────────────────────────────────────── */
  let txt='';
  try{ txt=buildCoachContext(); }catch(e){ return {err:'buildCoachContext a levé : '+e.message}; }

  /* ── DÉCOUPAGE EN SECTIONS (les titres que le prompt se donne à lui-même) ──────────── */
  const lignes=txt.split('\n');
  const sections=[]; let cour={titre:'(avant le premier titre)',debut:0,lignes:[]};
  const estTitre=l=>{
    const s=l.trim();
    if(!s) return false;
    if(/^═+\s+.+\s+═+$/.test(s)) return true;                    // ═══ SITUATION DE L'INSTANT ═══
    if(s.length>90) return false;
    // TITRE EN CAPITALES suivi de « : » ou « (… ) : »
    return /^[A-ZÀ-Ü0-9🧠💪🍽️📊⚠️🎯📅🩺🛡️⭐🔵→\s'’«»&/+-]{6,}.*:$/.test(s)
           && s.replace(/[^A-ZÀ-Ü]/g,'').length >= s.replace(/[^A-Za-zÀ-ÿ]/g,'').length*0.7;
  };
  lignes.forEach((l,i)=>{
    if(estTitre(l)){ sections.push(cour); cour={titre:l.trim(),debut:i,lignes:[]}; }
    cour.lignes.push(l);
  });
  sections.push(cour);

  /* ── OÙ CHAQUE EMPREINTE ATTERRIT ─────────────────────────────────────────────────── */
  const cherche=(val)=>{
    const s=String(val).replace('.',','), s2=String(val);
    const ou=[];
    sections.forEach(sec=>{
      const corps=sec.lignes.join('\n');
      const n=(corps.split(s).length-1)+(s!==s2?(corps.split(s2).length-1):0);
      if(n>0) ou.push({titre:sec.titre,n});
    });
    return ou;
  };
  const champs={
    'poids de corps (S.bw)':83.7, 'âge (S.age)':41, 'taille (S.height)':187,
    'tour de cou (S.neck)':41.5, 'tour de taille (S.waist)':88.3, 'tour de hanches (S.hip)':99.7,
    'poids objectif (S.targetWeight)':78.4, 'niveau d’activité (S.activityLevel)':1.62,
    'record développé (rm1)':111, 'record squat (rm1)':153, 'record soulevé (rm1)':186,
    'charge du développé':92.5, 'charge du squat':137.5, 'charge du soulevé':171,
    'volume de la dernière séance':7431, 'repos réglé sur le squat (S.exRestPref)':213,
    'objectif de force (S.strengthGoals)':120, 'dernière pesée':83.7, 'sommeil de la veille':7.3
  };
  const carte={};
  Object.entries(champs).forEach(([k,v])=>{ carte[k]=cherche(v); });

  /* ── LES MOTS-EMPREINTES (texte, pas nombres) ─────────────────────────────────────── */
  const mots={
    'blessure déclarée (healthProfile)':'Tendinite',
    'mémoire longue (coachMemory)':'déménagement',
    'priorité n°1 (S.priorities)':'Ischio-jambiers',
    'programme en cours (S.programmes)':'Powerbuilding 8 semaines',
    'discipline (S.discipline)':'powerbuilding',
    'morphotype (S.morpho)':'ectomorphe',
    'régime alimentaire (S.foodMode)':'omnivore',
    'type de balance (S.scaleType)':'impedance',
    'prénom (S.name)':'Empreinte'
  };
  const carteMots={};
  Object.entries(mots).forEach(([k,v])=>{
    const ou=[];
    sections.forEach(sec=>{
      const n=sec.lignes.join('\n').split(v).length-1;
      if(n>0) ou.push({titre:sec.titre,n});
    });
    carteMots[k]=ou;
  });

  return {
    taille:txt.length,
    nbSections:sections.length,
    sections:sections.map(s=>({titre:s.titre,car:s.lignes.join('\n').length})),
    carte, carteMots,
    texte:txt
  };
});

await b.close(); srv.close();
if(R.err){ console.error('⛔ '+R.err); process.exit(1); }
if(errs.length) console.error('⚠️ erreurs de page : '+errs.slice(0,3).join(' | '));

const l=(s='')=>console.log(s);
l('╔══════════════════════════════════════════════════════════════════════════╗');
l('║  AUDIT DES LIENS DE MILO — présence, doublons, pertes                    ║');
l('╚══════════════════════════════════════════════════════════════════════════╝');
l();
l('Contexte réel : '+R.taille.toLocaleString('fr-FR')+' caractères · '+R.nbSections+' sections');
l();
l('── LES 20 PLUS GROSSES SECTIONS ────────────────────────────────────────────');
R.sections.slice().sort((a,b)=>b.car-a.car).slice(0,20).forEach(s=>{
  l('  '+String(s.car).padStart(6)+' car.  '+s.titre.slice(0,72));
});
l();
l('── OÙ CHAQUE DONNÉE ATTERRIT ───────────────────────────────────────────────');
l('   (n = nombre d\'occurrences · plusieurs sections = la même info répétée)');
l();
const tout={...R.carte, ...R.carteMots};
const perdues=[], doublons=[], simples=[];
Object.entries(tout).forEach(([k,ou])=>{
  const total=ou.reduce((a,x)=>a+x.n,0);
  if(!ou.length) perdues.push(k);
  else if(ou.length>=2 || total>=3) doublons.push([k,ou,total]);
  else simples.push([k,ou,total]);
});
l('⛔ ABSENTES DU CONTEXTE ('+perdues.length+') :');
perdues.forEach(k=>l('   · '+k));
l();
l('⚠️ PRÉSENTES PLUSIEURS FOIS ('+doublons.length+') :');
doublons.sort((a,b)=>b[2]-a[2]).forEach(([k,ou,t])=>{
  l('   · '+k+'  → '+t+' fois, dans '+ou.length+' section(s)');
  ou.slice(0,4).forEach(x=>l('        ×'+x.n+'  '+x.titre.slice(0,66)));
});
l();
l('✅ PRÉSENTES UNE SEULE FOIS ('+simples.length+') :');
simples.forEach(([k,ou])=>l('   · '+k+'  → '+ou[0].titre.slice(0,60)));

if(process.argv.includes('--texte')){
  fs.writeFileSync('/tmp/contexte_milo_empreinte.txt', R.texte);
  l('\n(texte complet : /tmp/contexte_milo_empreinte.txt)');
}
})();
