#!/usr/bin/env node
/**
 * INSTANTANE DU « RYTHME DES QUESTIONS PROACTIVES » — le critere de reussite du constat A.
 *
 * Constat A de l'audit Accueil/Progres (docs/SUIVI-AUDIT.md) : la regle qui protege la personne
 * de l'INTERROGATOIRE — *au plus une question par semaine, et pas avant 3 seances* — est retapee
 * a la main dans plusieurs fonctions de `tracking.js`. L'extraire ne doit RIEN changer.
 *
 *   node tools/instantane_rythme_questions.js > /tmp/avant_rythme.json   (avant de toucher au code)
 *   node tools/instantane_rythme_questions.js > /tmp/apres_rythme.json   (apres)
 *   diff /tmp/avant_rythme.json /tmp/apres_rythme.json                   -> DOIT etre vide
 *
 * ⭐ CE QU'IL CONDUIT, CE QU'IL OBSERVE, CE QU'IL NE COUVRE PAS (protocole deux sessions) :
 *   - CONDUIT  : les 4 fonctions qui portent la regle — `_pendingGap`, `_pendingEnrich`,
 *                `_pendingConfirm` et `maybeProposeObservation` — sur une matrice d'etats.
 *   - OBSERVE  : ce que chacune REND (le champ propose, ou `null`), et pour la 4e le fait
 *                qu'elle ait POSE ou non une observation (elle ne rend rien : elle ecrit).
 *                ⭐ *Conduire n'est pas observer* : sans la 2e moitie, l'instantane serait
 *                identique quoi qu'on fasse a `maybeProposeObservation`.
 *   - NE COUVRE PAS : le RENDU de la carte (screens.js `_renderObsCard`) — il n'est pas touche ;
 *                ni le contenu des questions (`_profileGapSpecs`/`_enrichSpecs`), hors sujet.
 *
 * ⛔ LES BORDS SONT DANS LA MATRICE EXPRES. Une extraction peut etre juste sur le domaine utile
 *    et fausse au bord : `dl` exactement 0, exactement 7, et une date DANS LE FUTUR (`dl<0`, que
 *    le garde `dl>=0` laisse passer volontairement — un telephone remis a l'heure). C'est au bord
 *    que des copies divergent, donc c'est au bord qu'il faut regarder.
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

const seed=`(()=>{try{
  localStorage.setItem('ft4_name','Testeur');localStorage.setItem('ft4_bw','80');
  localStorage.setItem('ft4_age','30');localStorage.setItem('ft4_ht','178');
  localStorage.setItem('ft4_gender','H');localStorage.setItem('ft4_act','1.55');
  localStorage.setItem('ft4_goal','muscle');
  window._demoMode=true;
}catch(e){}})();`;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(seed);
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

const snap=await p.evaluate(async()=>{
  const out={};
  const sur=f=>{ try{ const v=f(); return v===null?'null':(v===undefined?'undefined':v); }
                 catch(e){ return 'ERREUR: '+e.message; } };
  /* une date a J-n, dans le meme format que `today()` (la date du TELEPHONE, pas UTC) */
  const jMoins=n=>{ const d=new Date(new Date(today()+'T12:00:00').getTime()-n*864e5);
                    return d.toISOString().slice(0,10); };
  const seances=n=>{ const a=[]; for(let i=0;i<n;i++)a.push({date:jMoins(i+1),ts:Date.now()-i*864e5,exs:[]}); return a; };
  /* ⚠️ AJOUTE APRES LE CONTROLE NEGATIF, PARCE QU'IL ETAIT AVEUGLE. Mes séances portaient
     TOUTES `date` ET `ts` — donc la mutation « on ne compte plus que celles qui ont une date »
     ne changeait rien, et l'instantané la validait. Le garde dit `(s.date||s.ts)` : les trois
     formes doivent donc exister dans la matrice, y compris celle qui NE DOIT PAS compter.
     *Une fixture qui ne porte qu'une forme ne mesure pas un `||`.* */
  const formes=n=>{ const a=[]; for(let i=0;i<n;i++){
      const d=jMoins(i+1), t=Date.now()-i*864e5;
      a.push(i%3===0?{date:d,exs:[]} : i%3===1?{ts:t,exs:[]} : {date:d,ts:t,exs:[]});
    } a.push({exs:[]}); return a; };   // ⛔ la dernière n'a NI date NI ts → ne doit pas compter

  /* ══════════ LA MATRICE ══════════
     Les deux gardes de la regle sont croises : le NOMBRE DE SEANCES (le seuil est 3 pour les
     trois premieres fonctions, 4 pour la quatrieme — et cette difference-la n'est PAS une copie,
     sa raison est ecrite dans le code) et l'AGE de la derniere question. */
  const nbSeances=[0,2,3,4,10];
  const ages=['absent',0,3,6,7,10,'futur'];

  out.cas=[];
  for(const n of nbSeances) for(const age of ages){
    /* etat propre a chaque cas : on ne laisse RIEN trainer d'un cas au suivant */
    S.sessions=seances(n);
    S.coachQuiz={answers:{},confirmedAt:{}};
    S.registre={facts:{},observations:[],updatedAt:'',gapSkips:{},confirmSkips:{},gapForce:null,
                lastObsAt: age==='absent' ? '' : (age==='futur' ? jMoins(-3) : jMoins(age))};
    const cle='seances='+n+' age='+age;
    const bloc={cas:cle};
    /* ── ce que chaque fonction REND ── */
    bloc.gap     = sur(()=>{const r=_pendingGap();     return r?r.field:null;});
    bloc.enrich  = sur(()=>{const r=_pendingEnrich();  return r?r.field:null;});
    bloc.confirm = sur(()=>{const r=_pendingConfirm(); return r?r.field:null;});
    /* ── la 4e n'REND rien : elle ECRIT. On observe donc son EFFET ──
       ⛔ et on remet l'etat a zero juste avant, sinon un cas precedent la ferait taire. */
    bloc.observation = sur(()=>{
      S.registre.observations=[]; S.registre.lastObsAt=
        (age==='absent' ? '' : (age==='futur' ? jMoins(-3) : jMoins(age)));
      const avant=S.registre.observations.length;
      maybeProposeObservation();
      return (S.registre.observations.length>avant) ? 'POSEE' : 'rien';
    });
    out.cas.push(bloc);
  }

  /* ══════════ LE SEUIL PROPRE AUX OBSERVATIONS (4, pas 3) ══════════
     ⚠️⚠️ TROISIÈME TROU TROUVÉ PAR LE CONTRÔLE NÉGATIF, ET LE PLUS INSTRUCTIF. La mutation
     « `maybeProposeObservation` est avalée par le propriétaire (4 → 3) » restait VERTE, et ma
     première explication était fausse : je croyais que `_obsCandidates` la masquait avec son
     propre seuil de 4. ⛔ **Muter LES DEUX seuils ne changeait rien non plus** — donc ce n'était
     pas ça. La vraie cause : *aucune de mes fixtures ne produisait un candidat en dessous de 10
     séances*, donc le seuil n'était JAMAIS le facteur limitant.
     👉 Ici les séances tombent en SEMAINE uniquement : le candidat `weekday_only` (part de
     week-end ≤ 12 %) se déclenche, et le seuil redevient la seule chose qui décide.
     ⭐ *Une hypothèse plausible sur la cause d'un témoin aveugle se vérifie par une mutation,
     pas par une relecture — la mienne était fausse.* */
  out.seuilObservation=[];
  {
    const semaine=n=>{ const a=[]; let j=1;
      while(a.length<n){ const d=new Date(new Date(today()+'T12:00:00').getTime()-j*864e5);
        const jour=d.getDay();
        if(jour!==0&&jour!==6) a.push({date:d.toISOString().slice(0,10), ts:d.getTime(), startHour:19, exs:[]});
        j++; }
      return a; };
    for(const n of [2,3,4,5]){
      S.sessions=semaine(n);
      S.coachQuiz={answers:{},confirmedAt:{}};
      S.registre={facts:{},observations:[],updatedAt:'',gapSkips:{},confirmSkips:{},gapForce:null,lastObsAt:''};
      const avant=S.registre.observations.length;
      out.seuilObservation.push({cas:'seances EN SEMAINE n='+n,
        candidats: sur(()=>_obsCandidates().filter(c=>c.confidence>=0.7).map(c=>c.key).join(',')||'aucun'),
        observation: sur(()=>{ maybeProposeObservation();
          return S.registre.observations.length>avant ? 'POSEE' : 'rien'; })});
    }
  }

  /* ══════════ LE CHEMIN PRIORITAIRE (`gapForce`) ══════════
     Il PASSE OUTRE le plafond hebdo, exprès : c'est la suite directe d'une action de la personne
     (« Confirmer → Non »). Un correctif qui deplacerait le garde AVANT ce bypass le casserait —
     et aucune ligne de la matrice ci-dessus ne le verrait. */
  out.priorite=[];
  for(const n of [0,3,10]) for(const age of [0,10]){
    S.sessions=seances(n);
    S.coachQuiz={answers:{},confirmedAt:{}};
    S.registre={facts:{},observations:[],updatedAt:'',gapSkips:{},confirmSkips:{},
                gapForce:'place', lastObsAt: jMoins(age)};
    out.priorite.push({cas:'gapForce=place seances='+n+' age='+age,
      gap:    sur(()=>{const r=_pendingGap();    return r?r.field:null;}),
      enrich: sur(()=>{const r=_pendingEnrich(); return r?r.field:null;})});
  }

  /* ══════════ LA FORME DES SÉANCES, ET LE CONFIRMER AU SEUIL ══════════
     ⚠️ Ces deux blocs sont nés du CONTRÔLE NÉGATIF, pas d'une relecture : sans eux, deux
     mutations plausibles passaient au vert. ⭐ *C'est le contrôle négatif qui a dit que
     l'instrument était borgne — l'instrument fait partie de la mesure.*
     ① la forme des séances (`date` seule · `ts` seul · les deux · NI l'une NI l'autre) ;
     ② le Confirmer AU SEUIL, avec de quoi répondre — sans réponses déclarées il rendait `null`
        quelle que soit la règle, donc il ne mesurait rien. */
  out.formes=[];
  for(const n of [2,3,4]){
    S.sessions=formes(n);
    S.coachQuiz={answers:{},confirmedAt:{}};
    S.registre={facts:{},observations:[],updatedAt:'',gapSkips:{},confirmSkips:{},gapForce:null,lastObsAt:''};
    out.formes.push({cas:'formes melangees n='+n+' (+1 sans date ni ts)',
      gap:    sur(()=>{const r=_pendingGap();    return r?r.field:null;}),
      enrich: sur(()=>{const r=_pendingEnrich(); return r?r.field:null;})});
  }
  out.confirmSeuil=[];
  for(const n of [0,2,3,4,10]) for(const age of ['absent',6,7]){
    S.sessions=seances(n);
    S.coachQuiz={answers:{place:'salle',time:'60',othersport:'aucun autre sport'},
                 confirmedAt:{place:jMoins(400),time:jMoins(400),othersport:jMoins(400)}};
    S.registre={facts:{},observations:[],updatedAt:'',gapSkips:{},confirmSkips:{},gapForce:null,
                lastObsAt: age==='absent' ? '' : jMoins(age)};
    out.confirmSeuil.push({cas:'confirm seances='+n+' age='+age,
      confirm: sur(()=>{const r=_pendingConfirm(); return r?r.field:null;})});
  }

  /* ══════════ LE REPORT « PLUS TARD » ══════════
     Un champ reporte se tait ~7 jours (30 pour le Confirmer). Ce sont des regles VOISINES de
     celle qu'on extrait, ecrites de la meme facon — donc exactement ce qu'un correctif risque
     d'avaler au passage. */
  /* ⚠️ CE BLOC AUSSI VIENT DU CONTRÔLE NÉGATIF. Le bloc `report` ci-dessous remplit les réponses,
     donc `_pendingGap` saute le champ parce qu'il est **déjà rempli** — jamais parce qu'il est
     **reporté**. Résultat : la mutation « le report du Gap est avalé par le plafond hebdo »
     passait au vert. Ici les réponses sont VIDES : le seul motif de silence possible est le
     report. *Deux causes qui produisent le même silence ne se distinguent que si on en éteint une.* */
  out.reportGap=[];
  for(const skip of [0,6,7,10]){
    S.sessions=seances(10);
    S.coachQuiz={answers:{},confirmedAt:{}};
    S.registre={facts:{},observations:[],updatedAt:'',gapForce:null,lastObsAt:jMoins(30),
                gapSkips:{place:jMoins(skip)}, confirmSkips:{}};
    out.reportGap.push({cas:'report du Gap, place skippe J-'+skip,
      gap: sur(()=>{const r=_pendingGap(); return r?r.field:null;})});
  }

  out.report=[];
  for(const skip of [0,6,7,29,30]){
    S.sessions=seances(10);
    S.coachQuiz={answers:{},confirmedAt:{place:jMoins(400),time:jMoins(400),othersport:jMoins(400)}};
    S.coachQuiz.answers={place:'salle',time:'60',othersport:'aucun autre sport'};
    S.registre={facts:{},observations:[],updatedAt:'',gapForce:null,lastObsAt:jMoins(30),
                gapSkips:{place:jMoins(skip)}, confirmSkips:{place:jMoins(skip)}};
    out.report.push({cas:'skip J-'+skip,
      gap:     sur(()=>{const r=_pendingGap();     return r?r.field:null;}),
      confirm: sur(()=>{const r=_pendingConfirm(); return r?r.field:null;})});
  }

  return out;
});

console.log(JSON.stringify({erreurs:errs, ...snap}, null, 1));
await b.close(); srv.close();
})();
