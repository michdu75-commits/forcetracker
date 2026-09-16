/* ══════════════════════════════════════════════════════════════════════════════════════
   TÉMOINS DU MINI-CHANTIER ACCUEIL (16/09/2026) — quatre corrections d'interface.

   ⛔ POURQUOI UN FICHIER À PART, et pas des blocs de plus dans `runner.js` : une mutation
   doit pouvoir être éprouvée en quelques secondes. Gardés dans le banc, les seize témoins de
   source auraient obligé à relancer une passe complète (> 20 min) pour chacune des mutations
   du contrôle négatif. C'est le patron posé par `identite_ligne.js` le même jour.
   ⭐ UN SEUL PROPRIÉTAIRE (R2) : le banc appelle ce module, le contrôle négatif aussi —
   donc il n'existe pas de version « du banc » et de version « des mutations » qui
   pourraient diverger.
   ══════════════════════════════════════════════════════════════════════════════════════ */

module.exports.ecran = async function(t, b, PORT){
  const cx14=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const pg14=await cx14.newPage(); const err14=[]; pg14.on('pageerror',e=>err14.push(e.message));
  await pg14.goto('http://localhost:'+PORT+'/index.html'); await pg14.waitForTimeout(2200);

  console.log('\n-- B-CCCXVIII. Mini-chantier Accueil (rendu réel) --');

  const R14=await pg14.evaluate(async ()=>{
    const o={}; const pause=ms=>new Promise(r=>setTimeout(r,ms));
    const jm=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10);
    /* ⛔ chaque geste rend un résultat : une étape interrompue ne doit pas ressembler à une
       étape verte (BUGS.md §61). */
    const rendre=()=>{ try{ renderHome(); return true; }catch(e){ o.err=String(e&&e.message||e); return false; } };
    const txt=id=>{const e=document.getElementById(id); return ((e&&e.innerText)||'').replace(/\s+/g,' ').trim();};

    /* ── ① LA TUILE POIDS, sur les cinq états demandés ─────────────────────────────── */
    const poids=(bw,wlog)=>{ S.bw=bw; S.weightLog=wlog;
      if(!rendre()) return '(plantage)';
      const e=document.getElementById('h-bw'); return e?e.textContent:'(absent)'; };
    o.pNeuf  = poids(0,  []);
    o.pProfil= poids(84, []);
    o.pPesee = poids(0,  [{date:jm(0),kg:79.4}]);
    o.pMulti = poids(0,  [{date:jm(3),kg:84},{date:jm(0),kg:79.44},{date:jm(1),kg:81}]);
    o.pVirg  = poids(0,  [{date:jm(0),kg:'84,5'}]);
    o.pVide  = poids(0,  []);           // retour à l'état neuf après suppression
    o.pTexte = txt('home-stats');

    /* ── ③ LE SCORE : un compte muet, puis TROIS comptes qui ont parlé ──────────────── */
    const recup=(seed)=>{ S.sleepLog=seed.sleep||[]; S.sessions=seed.sess||[];
      S.healthDaily=seed.health||[];
      if(!rendre()) return {t:'(plantage)'};
      return {t:txt('home-hero'), s:(typeof calcRecoveryScore==='function')?calcRecoveryScore():null}; };
    o.rVide    = recup({});
    o.rSommeil = recup({sleep:[{date:jm(1),hours:7.5,quality:3}]});
    o.rSeance  = recup({sess:[{date:jm(1),ts:Date.now()-20*36e5,exs:[{name:'Squat',
                   sets:[{kg:100,reps:5,done:true,type:'N'},{kg:100,reps:5,done:true,type:'N'}]}],vol:1000}]});
    o.rMontre  = recup({health:[{date:jm(1),sleep:7.2}]});

    /* ── ② L'ORDRE, ET ④ LA ZONE TAPABLE, sur un compte réaliste ────────────────────── */
    S.sleepLog=[{date:jm(1),hours:6.2,quality:2},{date:jm(2),hours:7.1,quality:3}];
    S.weightLog=[{date:jm(1),kg:79.4},{date:jm(8),kg:80.2}];
    S.sessions=[{date:jm(1),ts:Date.now()-20*36e5,exs:[{name:'Squat',
      sets:[{kg:100,reps:5,done:true,type:'N'},{kg:100,reps:5,done:true,type:'N'},
            {kg:100,reps:5,done:true,type:'N'}]}],vol:1500}];
    S.registre={facts:{},observations:[{id:'o1',status:'pending',kind:'entrainement',
      text:'Tu progresses mieux avec 2 jours de repos entre deux séances de jambes.',
      createdAt:jm(1)}],updatedAt:jm(1)};
    if(!rendre()) return o;
    await pause(120);
    const haut=id=>{const e=document.getElementById(id);
      if(!e||!e.offsetHeight) return null; const r=e.getBoundingClientRect();
      return {top:Math.round(r.top+window.scrollY), h:Math.round(r.height)};};
    o.hero=haut('home-hero'); o.milo=haut('home-milo'); o.obs=haut('home-obs');
    o.stats=haut('home-stats'); o.secondary=haut('home-secondary');
    /* l'ordre RÉEL du document, pas celui qu'on croit avoir écrit */
    o.ordre=[...document.getElementById('s-home').children].map(e=>e.id).filter(Boolean).join(',');

    const why=[...document.querySelectorAll('#s-home button')].find(x=>/Pourquoi ce score/.test(x.innerText));
    if(why){ const r=why.getBoundingClientRect();
      o.why={w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top)};
      /* ⛔ LA ZONE NE DOIT PAS MORDRE SUR LA LIGNE DES FACTEURS : un bouton invisible
         par-dessus un texte qui n'en est pas un ouvrirait une fiche sur un tap innocent. */
      const facts=why.parentElement.previousElementSibling;
      o.factBas=facts?Math.round(facts.getBoundingClientRect().bottom):null;
      /* et il doit VRAIMENT appeler l'explication depuis cette nouvelle surface */
      let ouvert=false; const vrai=window.openRecoWhy;
      window.openRecoWhy=()=>{ouvert=true;};
      why.click(); await pause(60); window.openRecoWhy=vrai;
      o.whyClic=ouvert;
    }
    /* 🔴 le bouton central, mesuré */
    const fab=document.getElementById('nb-log');
    if(fab){const r=fab.getBoundingClientRect();
      o.fabHome={x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};}
    /* … puis comparé à LUI-MÊME sur un autre onglet (il vit hors de `#s-home`) */
    try{ goScreen('progress'); }catch(e){}
    await pause(160);
    if(fab){const r=fab.getBoundingClientRect();
      o.fabAilleurs={x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};}
    return o;
  });

  const J=x=>JSON.stringify(x);
  t('B-CCCXVIII ① ⛔ compte NEUF : la tuile poids affiche « — », plus jamais « NaN »',
    R14.pNeuf==='—', 'affiche « '+R14.pNeuf+' »');
  t('B-CCCXVIII ② le poids du PROFIL seul s\'affiche',
    R14.pProfil==='84', 'affiche « '+R14.pProfil+' »');
  t('B-CCCXVIII ③ une PESÉE seule s\'affiche, arrondie',
    R14.pPesee==='79.4', 'affiche « '+R14.pPesee+' »');
  t('B-CCCXVIII ④ plusieurs pesées : la plus RÉCENTE gagne, arrondie au dixième',
    R14.pMulti==='79.4', 'affiche « '+R14.pMulti+' »');
  t('B-CCCXVIII ⑤ ⭐ une valeur non numérique venue d\'un import (« 84,5 ») donne « — », pas NaN',
    R14.pVirg==='—', 'affiche « '+R14.pVirg+' »');
  t('B-CCCXVIII ⑥ après suppression de toutes les pesées : retour à « — »',
    R14.pVide==='—', 'affiche « '+R14.pVide+' »');
  t('B-CCCXVIII ⑦ ⛔ le mot « NaN » n\'apparaît NULLE PART dans la carte du mois',
    !/NaN/.test(R14.pTexte||''), R14.pTexte);

  t('B-CCCXVIII ⑧ ⛔⛔ compte MUET : l\'Accueil n\'affirme plus « Bonne récupération »',
    !/Bonne récupération/.test((R14.rVide||{}).t||'') && /Enregistre ton sommeil/.test((R14.rVide||{}).t||''),
    (R14.rVide||{}).t);
  t('B-CCCXVIII ⑨ ⛔ LE MOTEUR N\'EST PAS TOUCHÉ : il rend toujours son score de base',
    typeof (R14.rVide||{}).s==='number' && (R14.rVide||{}).s>0, 'score moteur = '+J((R14.rVide||{}).s));
  t('B-CCCXVIII ⑩ ⭐ un sommeil NOTÉ : le score reste affiché (aucune régression)',
    /\/100/.test((R14.rSommeil||{}).t||''), (R14.rSommeil||{}).t);
  t('B-CCCXVIII ⑪ ⭐ une SÉANCE seule : le score reste affiché',
    /\/100/.test((R14.rSeance||{}).t||''), (R14.rSeance||{}).t);
  t('B-CCCXVIII ⑫ ⭐⭐ une nuit MESURÉE par la montre suffit : le score reste affiché',
    /\/100/.test((R14.rMontre||{}).t||''), (R14.rMontre||{}).t);

  t('B-CCCXVIII ⑬ ⛔ la carte de récup passe DEVANT les deux sollicitations de Milo',
    !!(R14.hero&&R14.milo&&R14.obs) && R14.hero.top<R14.milo.top && R14.hero.top<R14.obs.top,
    'hero '+J(R14.hero)+' milo '+J(R14.milo)+' obs '+J(R14.obs));
  t('B-CCCXVIII ⑭ ⭐ et elle tient ENTIÈRE dans le premier écran (780 px utiles)',
    !!R14.hero && (R14.hero.top+R14.hero.h)<=780, J(R14.hero));
  t('B-CCCXVIII ⑮ ⛔ RIEN D\'AUTRE N\'A ÉTÉ RÉORDONNÉ — `home-souvenir` reste sous `home-milo`, '+
    'et les blocs du bas gardent leur suite',
    /home-milo,home-souvenir,home-obs,home-daystate,log-sleep,home-stats,home-secondary/.test(R14.ordre||''),
    R14.ordre);
  t('B-CCCXVIII ⑯ ⛔ l\'ordre du document commence bien par l\'en-tête PUIS la récup',
    /^home-tester,home-hdr,home-hero,home-milo/.test(R14.ordre||''), R14.ordre);

  t('B-CCCXVIII ⑰ ⛔ « Pourquoi ce score ? » offre au doigt au moins 40 px de haut',
    !!R14.why && R14.why.h>=40, J(R14.why));
  t('B-CCCXVIII ⑱ ⭐⭐ et sa zone NE MORD PAS sur la ligne des facteurs au-dessus',
    !!R14.why && R14.factBas!=null && R14.why.top>=R14.factBas,
    'haut zone '+((R14.why||{}).top)+' / bas facteurs '+R14.factBas);
  t('B-CCCXVIII ⑲ ⭐ la surface agrandie ouvre bien l\'explication (ce n\'est pas qu\'un pavé vide)',
    R14.whyClic===true, J(R14.whyClic));

  t('B-CCCXVIII ⑳ 🔴 RÈGLE D\'OR #9 — le bouton central ne bouge pas d\'un pixel',
    !!(R14.fabHome&&R14.fabAilleurs) && J(R14.fabHome)===J(R14.fabAilleurs),
    J(R14.fabHome)+' vs '+J(R14.fabAilleurs));
  t('B-CCCXVIII ㉑ aucune erreur JavaScript pendant tout le bloc',
    err14.length===0 && !R14.err, (R14.err||'')+' '+err14.join(' | '));
  await cx14.close();
};

module.exports.source = function(t, ROOT, fs, path){
  const srcScr=fs.readFileSync(path.join(ROOT,'screens.js'),'utf8');
  const srcTrk=fs.readFileSync(path.join(ROOT,'tracking.js'),'utf8');
  const srcSta=fs.readFileSync(path.join(ROOT,'state.js'),'utf8');
  const srcIdx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  /* ⚠️ On retire les COMMENTAIRES seulement : ces témoins parlent de code, et les
     commentaires de cette passe CITENT abondamment `fmt`, `NaN` et `70` pour expliquer les
     décisions. Un garde qui ne distingue pas le CODE de ce qui en PARLE mesure la
     documentation — c'est arrivé quatre fois dans ce projet (ft-v1193/1203/1205/1210). */
  const nuC=x=>String(x||'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:"'])\/\/[^\n]*/gm,'$1');
  const corps=(n,src)=>{ const m=new RegExp('(?:async\\s+)?function\\s+'+n+'\\s*\\([^)]*\\)\\s*\\{').exec(src);
    if(!m) return ''; let i=m.index+m[0].length-1,d=0,j=i;
    for(;j<src.length;j++){ const c=src[j]; if(c==='{')d++; else if(c==='}'){d--; if(!d)return src.slice(i,j+1);} }
    return ''; };
  const HERO=nuC(corps('_renderHomeHero',srcScr));
  const HOME=nuC(corps('renderHome',srcScr));
  const DET =nuC(corps('calcRecoveryDetail',srcTrk));
  const IDX =nuC(srcIdx);

  console.log('\n-- B-CCCXIX. Mini-chantier Accueil (décisions, lues dans la source) --');

  /* ── ① LA CORRECTION DU NaN EST LOCALE, ET `fmt()` EST INTACTE ──────────────────────── */
  t('B-CCCXIX ① ⛔⛔ `fmt()` N\'EST PAS TOUCHÉE — elle arrondit un nombre, rien de plus',
    /const\s+fmt\s*=\s*n\s*=>\s*Math\.round\(n\*10\)\/10\s*;/.test(nuC(srcSta)), '');
  t('B-CCCXIX ② ⛔ le garde vit chez L\'APPELANT : la tuile poids ne passe plus « — » à `fmt`',
    /isFinite\(_bwN\)\s*\?\s*fmt\(_bwN\)\s*:\s*'—'/.test(HOME) && !/fmt\(bwDisp\)/.test(HOME), '');
  t('B-CCCXIX ③ ⭐ et la tuile lit bien la valeur gardée, pas la brute',
    /id="h-bw"[^']*'\+bwTxt\+'/.test(HOME), '');

  /* ── ③ LE MOTEUR DE RÉCUPÉRATION N'A PAS BOUGÉ ──────────────────────────────────────── */
  t('B-CCCXIX ④ ⛔⛔ PÉRIMÈTRE — la base neutre 70 reste une décision du MOTEUR, intacte',
    /wScore\s*=\s*70\s*;/.test(DET), '');
  t('B-CCCXIX ⑤ ⛔ PÉRIMÈTRE — le moteur rend toujours son score, ses facteurs et ses conseils',
    /return\s*\{score,base,factors,tips:tips\.slice\(0,2\),dayPains,/.test(DET), '');
  t('B-CCCXIX ⑥ ⭐⭐ le silence est décidé AU RENDU, et il exige les DEUX absences',
    /_sansDonnee\s*=/.test(HERO) && /_nuitsRecentes\(today\(\),3\)\.length===0/.test(HERO)
    && /!\(\(S\.sessions\|\|\[\]\)\.length\)/.test(HERO), '');
  t('B-CCCXIX ⑦ ⭐ il lit `_nuitsRecentes`, propriétaire unique des nuits (R2) — donc il voit '+
    'aussi les nuits MESURÉES par la montre',
    /_nuitsRecentes/.test(HERO) && /S\.healthDaily/.test(nuC(corps('_nuitsRecentes',srcTrk))), '');
  t('B-CCCXIX ⑧ ⭐ le bandeau « gêne du jour » SURVIT au silence : un fait déclaré n\'est pas '+
    'un score deviné',
    /dayPains:_detail\.dayPains/.test(HERO), '');

  /* ── ② L'ORDRE, DANS LE DOCUMENT ────────────────────────────────────────────────────── */
  t('B-CCCXIX ⑨ ⛔ `home-hero` est déclaré AVANT `home-milo` dans l\'Accueil',
    IDX.indexOf('id="home-hero"')>0 && IDX.indexOf('id="home-hero"')<IDX.indexOf('id="home-milo"'), '');
  t('B-CCCXIX ⑩ ⛔ il n\'existe QU\'UN SEUL `home-hero` (le déplacement n\'a pas dupliqué le bloc)',
    (IDX.match(/id="home-hero"/g)||[]).length===1, '');
  t('B-CCCXIX ⑪ ⛔ `home-souvenir` reste juste APRÈS `home-milo` (sa propre décision, R30)',
    IDX.indexOf('id="home-milo"')<IDX.indexOf('id="home-souvenir"')
    && IDX.indexOf('id="home-souvenir"')<IDX.indexOf('id="home-obs"'), '');

  /* ── ④ LA ZONE TAPABLE EST COMPENSÉE, PAS AJOUTÉE ───────────────────────────────────── */
  t('B-CCCXIX ⑫ ⭐⭐ la zone de « Pourquoi ce score ? » est agrandie par `padding` ET annulée '+
    'par une `margin` négative : l\'écran ne bouge pas',
    /openRecoWhy\(\)[^>]*padding:13px 10px;margin:-9px -10px -9px;/.test(HERO), '');

  /* ── PÉRIMÈTRE GÉNÉRAL : aucune fonctionnalité nouvelle ─────────────────────────────── */
  /* ⚠️⚠️ CE TÉMOIN ÉTAIT AVEUGLE, ET C'EST LA QUATRIÈME FOIS DE CE PROJET (familles
     `presentsX`, `needsCode2`, `BLOC CCCX`). Il cherchait `im>=90` : la mutation qui porte le
     seuil à `im>=9000` — c'est-à-dire qui ÉTEINT le rappel — le laissait parfaitement VERT,
     puisque « im>=90 » est contenu dans « im>=9000 ».
     👉 *Un motif qui cherche une PRÉSENCE ne mesure pas une VALEUR : il faut le fermer.* La
     parenthèse fermante est ce qui borne le nombre. */
  t('B-CCCXIX ⑬ ⛔ AUCUNE FONCTIONNALITÉ NOUVELLE — le bouton « Reprendre la séance » garde '+
    'sa condition, et le rappel des 90 min garde son SEUIL',
    /const ctaLabel='↩ Reprendre la séance';/.test(HERO) && /im>=90\)/.test(HERO), '');
  t('B-CCCXIX ⑭ ⛔ PÉRIMÈTRE — Nutrition, douane et journal alimentaire : 0 ligne',
    /function _douaneLigne\(/.test(fs.readFileSync(path.join(ROOT,'app.js'),'utf8'))
    && /_foodLogIdentifier\(S\.foodLog\)/.test(nuC(srcScr)), '');
  t('B-CCCXIX ⑮ ⛔ PÉRIMÈTRE — le calendrier de l\'Accueil et la tuile « Séances » sont intacts',
    /_renderHomeCalendar\(\);\s*\n\s*updatePill\(\);/.test(HOME) && /goSessionsHistory\(\)/.test(HOME), '');
  /* ⛔ R30 — LA DETTE « DERNIÈRE PESÉE » EST LAISSÉE OUVERTE EXPRÈS. Ce témoin fige le fait
     qu'elle est ÉCRITE : si quelqu'un centralise un jour, il retirera la note en même temps
     que les copies, et ce témoin le lui rappellera. Une dette qu'on ne sait plus retrouver
     n'est pas une dette, c'est un piège. */
  t('B-CCCXIX ⑯ ⛔ R30 — la dette R2 de « la dernière pesée » est écrite à côté du code',
    /DETTE R2 CONFIRMÉE, LAISSÉE OUVERTE/.test(srcScr), '');
};

