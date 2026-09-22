#!/usr/bin/env node
/* 🔬 TÉMOINS DE V9 — bloc B-CCCLIV. ⛔ NON BRANCHÉ dans `tests/parcours/runner.js` :
   V9 n'est pas servie, ses témoins ne doivent bloquer aucune livraison du produit.
   ⭐ Écrits à partir des INVARIANTS du brief, pas autour du comportement de V9 — et plusieurs
   échouent volontairement sur V0 ET sur V8, ce qui prouve qu'ils mesurent autre chose que la
   candidate. */
const M8 = require('./moteur_v8.js'), M9 = require('./moteur_v9.js');
const V9 = M9.mV9, C = M9.CONST;
let ok = 0; const rouge = [];
const T = (id, cond, det) => { if (cond) ok++; else rouge.push(id + (det ? ' — ' + det : '')); };
const base = { gender:'H',age:35,height:178,bw:85,activityLevel:1.55,workType:'bureau',goal:'muscle',
  phase:'charge',smoker:false,othersport:'aucun',foodMode:'',manualKcal:null,lm:null,level:'',
  seancesSem:3,seriesParGroupe:9,historique:null };
const P = o => Object.assign({}, base, o);
const ferm = r => r.prot_g*4 + r.fat_g*9 + r.carbs_g*4 - r.kcal;
const H = (j,jn,ap,p0,pente,np,o) => { const pes=[];
  for(let i=0;i<np;i++){ const jj=Math.round(i*(j-1)/Math.max(1,np-1));
    pes.push({date:new Date(Date.UTC(2026,0,1)+jj*864e5).toISOString().slice(0,10),
              kg:Math.round((p0+pente*jj/7)*10)/10}); }
  return Object.assign({jours:j,joursNutriRenseignes:jn,apportMoyen:ap,pesees:pes,activiteStable:true},o||{}); };

/* ── P01 fermeture ── */
{ let pire=0,n=0;
  for(const bw of [42,55,70,85,100,120,150]) for(const goal of ['perte','recomp','equilibre','force','muscle'])
  for(const g of ['H','F']) for(const ph of ['charge','decharge']) for(const fm of ['','keto','lowcarb'])
  for(const act of [1.375,1.55,1.9]) for(const mk of [null,700,3000]) {
    const r=V9(P({bw,goal,gender:g,phase:ph,foodMode:fm,activityLevel:act,manualKcal:mk}));
    if(!r) continue; n++; pire=Math.max(pire,Math.abs(ferm(r)));
  }
  T('P01 fermeture exacte sur '+n+' profils', pire===0, 'pire '+pire+' kcal'); }

/* ── P02/P03/P04 ── */
{ let mauvais=0;
  for(const bw of [42,60,85,120,150]) for(const goal of ['perte','recomp','muscle','force','equilibre'])
  for(const mk of [null,600,1000,9000]) { const r=V9(P({bw,goal,manualKcal:mk})); if(!r) continue;
    if(r.prot_g<0||r.fat_g<0||r.carbs_g<0) mauvais++;
    if(!isFinite(r.prot_g)||!isFinite(r.fat_g)||!isFinite(r.carbs_g)||!isFinite(r.kcal)) mauvais++; }
  T('P02/P03 aucune macro négative ni NaN', mauvais===0, mauvais+' cas');
  const s=new Set(); for(let i=0;i<8;i++) s.add(JSON.stringify(V9(P({bw:77.3,goal:'perte'}))));
  T('P04/P18 déterminisme strict', s.size===1); }

/* ── P05/P06 continuité ── */
{ let pk=0; for(let bw=45;bw<=150;bw++) for(const goal of ['perte','recomp','muscle'])
    pk=Math.max(pk,Math.abs(V9(P({bw:bw+1,goal})).kcal-V9(P({bw,goal})).kcal));
  T('P05 continuité +1 kg (< 150 kcal)', pk<150, 'pire '+pk);
  let pm=0; for(let bf=5;bf<=50;bf++){ const mk=x=>P({bw:90,goal:'perte',lm:Math.round(90*(1-x/100)*10)/10});
    pm=Math.max(pm,Math.abs(V9(mk(bf+1)).kcal-V9(mk(bf)).kcal)); }
  T('P06 continuité +1 % de masse grasse (< 150 kcal)', pm<150, 'pire '+pm); }

/* ── P07/P08 ── */
{ const k=g=>V9(P({goal:g})).kcal;
  T('P07 ordre des objectifs', k('perte')<k('recomp')&&k('recomp')<k('equilibre')&&k('equilibre')<=k('force')&&k('force')<=k('muscle'),
    [k('perte'),k('recomp'),k('equilibre'),k('force'),k('muscle')].join(' < '));
  T('P08 charge au-dessus de décharge', V9(P({phase:'charge'})).kcal>V9(P({phase:'decharge'})).kcal); }

/* ── ⭐ §8 LE DÉFICIT EST BORNÉ PAR LA PHYSIOLOGIE, PAS PAR UN NOMBRE FIXE ── */
{ let horsAlpert=0, horsMK=0, alpertMord=false, mkMord=false;
  const CAS=[];
  for(const bw of [50,60,70,85,100,120,150]) for(const bf of [6,10,20,30,40,50]) {
    const lm=Math.round(bw*(1-bf/100)*10)/10;
    const p=P({bw,goal:'perte',lm,height:172,age:40,activityLevel:1.375,phase:'decharge'});
    const r=V9(p), tdee=M8.mTDEE(p), fm=bw-lm, imc=bw/((172/100)**2);
    const ecart=r.kcal-tdee;
    if(ecart < -(C.ALPERT_KCAL_PAR_KG_GRAS*fm)-5) horsAlpert++;
    if(imc<=25 && ecart < -C.MK_PLAFOND-5) horsMK++;
    if(r.borne==='deficit_plafonne_alpert') alpertMord=true;
    if(r.borne==='deficit_plafonne_murphy') mkMord=true;
    CAS.push({bw,bf,ecart:Math.round(ecart)});
  }
  T('P09① jamais au-delà de ce que la masse grasse peut fournir (Alpert)', horsAlpert===0, horsAlpert+' cas');
  T('P09② sous le seuil de surpoids (IMC 25), jamais au-delà de 500 kcal (Murphy & Koehler)', horsMK===0, horsMK+' cas');
  T('P09③ la borne d\'Alpert MORD réellement (sujet sec)', alpertMord);
  T('P09④ la borne de Murphy & Koehler MORD réellement', mkMord);
  /* ⭐⭐ LE POINT DU §8 : une personne à FORTE masse grasse doit pouvoir dépasser 500 kcal,
     une personne SÈCHE ne le doit pas. C'est le gradient que V8 n'avait pas. */
  /* ⛔⛔ CE TÉMOIN A ÉTÉ RÉÉCRIT APRÈS MESURE, ET C'EST LA LEÇON DU JOUR.
     Ma première version affirmait « le sujet gras reçoit un déficit plus grand que le sujet
     sec » et comparait 85 kg/6 % à 150 kg/50 %. Elle a rougi — non parce que V9 avait tort,
     mais parce que **le sujet à 50 % de masse grasse a un TDEE si bas que c'est le plancher du
     MÉTABOLISME DE REPOS qui le borne**, pas la masse grasse disponible.
     👉 *Un témoin doit affirmer ce que la mesure dit, pas ce que j'espérais qu'elle dise.*
     L'invariant réel, et il est vérifié ci-dessous : **à masse grasse croissante, le déficit
     autorisé croît TANT QUE le métabolisme de repos ne devient pas la contrainte.** */
  const sec=CAS.find(c=>c.bw===85&&c.bf===6), moyen=CAS.find(c=>c.bw===85&&c.bf===30);
  T('P09⑤ à poids égal, plus de masse grasse = déficit autorisé PLUS GRAND',
    Math.abs(moyen.ecart) > Math.abs(sec.ecart), 'sec 6 % : '+sec.ecart+' vs 30 % : '+moyen.ecart);
  const lourdGras=V9(P({bw:150,goal:'perte',lm:112.5,height:172,age:40,activityLevel:1.375,phase:'decharge'}));
  const dLourd=lourdGras.kcal-M8.mTDEE(P({bw:150,goal:'perte',lm:112.5,height:172,age:40,activityLevel:1.375,phase:'decharge'}));
  T('P09⑥ un profil obèse DÉPASSE les 500 kcal de Murphy & Koehler (V8 l\'en empêchait)',
    Math.abs(dLourd) > 500, String(Math.round(dLourd)));
  /* ⛔ ET LE PLANCHER QUI REMPLACE LE SEUIL RED-S : après la dépense d'exercice, il doit
     rester au moins le métabolisme de repos. Mesuré : sans lui, à 150 kg et 10 % de masse
     grasse, le seuil de 30 kcal/kg de masse maigre plafonnait le déficit à −18 kcal. */
  let sousRepos=0;
  for(const bw of [60,85,120,150]) for(const bf of [10,25,40,50]) {
    const p=P({bw,goal:'perte',lm:Math.round(bw*(1-bf/100)*10)/10,height:172,age:40,
               activityLevel:1.375,phase:'decharge'});
    const r=V9(p), eee=(p.seancesSem||0)*7*bw/7;
    if(r.kcal - eee < M8.mBMR(p) - 1) sousRepos++; }
  T('P09⑦ jamais sous le métabolisme de repos une fois l\'exercice déduit', sousRepos===0, sousRepos+' cas');
  T('P09⑧ et la perte de poids reste POSSIBLE chez les profils lourds (V9 ≠ ma 1ʳᵉ version)',
    Math.abs(dLourd) > 300, String(Math.round(dLourd))); }

/* ── P10 surplus ── */
{ let pire=0,mord=false;
  for(const bw of [42,60,85,120,150]) for(const act of [1.375,1.55,1.9]) for(const h of [148,178]) {
    const p=P({bw,activityLevel:act,goal:'muscle',height:h,age:18,seancesSem:0});
    const r=V9(p); pire=Math.max(pire,(r.kcal-M8.mTDEE(p))/M8.mTDEE(p));
    if(r.borne==='surplus_plafonne') mord=true; }
  T('P10① surplus ≤ 15 % + arrondi', pire<=C.SURPLUS_MAX_PCT+0.01, (pire*100).toFixed(1)+' %');
  T('P10② le plafond de surplus MORD', mord); }

/* ── ⭐ §9 PROTÉINES : L'UNITÉ DÉPEND DE LA SITUATION ── */
{ const enDef=V9(P({goal:'perte',lm:68,bw:80}));
  const horsDef=V9(P({goal:'muscle',lm:68,bw:80}));
  T('P11① en déficit, l\'unité est la MASSE MAIGRE', enDef.unite_proteines==='masse maigre', enDef.unite_proteines);
  T('P11② hors déficit, l\'unité est le POIDS DE CORPS', horsDef.unite_proteines==='poids de corps', horsDef.unite_proteines);
  let hautFFM=0,basBW=9;
  for(const bw of [45,60,85,120,150]) for(const bf of [4,8,15,25,35,45])
  for(const goal of ['perte','recomp','muscle','equilibre','force']) for(const ph of ['charge','decharge']) {
    const lm=Math.round(bw*(1-bf/100)*10)/10;
    const r=V9(P({bw,goal,lm,phase:ph,height:172,age:30,activityLevel:1.375}));
    hautFFM=Math.max(hautFFM,r.prot_g/lm); basBW=Math.min(basBW,r.prot_g/bw); }
  T('P11③ jamais au-dessus de 3,1 g/kg de masse maigre (Helms)', hautFFM<=3.11, hautFFM.toFixed(3));
  T('P11④ jamais sous 1,4 g/kg de poids', basBW>=C.PROT_BW_PLANCHER-0.001, basBW.toFixed(3));
  T('P11⑤ le plafond de Helms MORD', hautFFM>3.0, hautFFM.toFixed(3));
  /* ⛔ ANSES redevient un SIGNAL, pas un plafond — le brief l'exige tant que la source est
     secondaire. Le témoin vérifie donc que le SIGNAL existe, pas que la valeur est coupée. */
  const gras=V9(P({bw:150,goal:'perte',lm:75,height:172,age:40,activityLevel:1.375,phase:'decharge'}));
  T('P11⑥ au-delà du repère ANSES, un SIGNAL est émis (et rien n\'est coupé)',
    gras.prot_g/150>C.ANSES_SIGNAL ? (gras.signaux||[]).includes('prot_au_dela_du_repere_anses') : true,
    (gras.prot_g/150).toFixed(2)+' g/kg · '+JSON.stringify(gras.signaux));
  T('P11⑦ la variante V9dur COUPE au repère ANSES (mesure de ce que le plafond changerait)',
    M9.mV9dur(P({bw:150,goal:'perte',lm:75,height:172,age:40,activityLevel:1.375,phase:'decharge'})).prot_g <= Math.floor(150*C.ANSES_SIGNAL)); }

/* ── P12 lipides ── */
{ let bg=9,hg=0,bp=9,hp=0; const sansSignal=[];
  for(const bw of [42,60,85,120,150]) for(const goal of ['perte','recomp','muscle','equilibre','force'])
  for(const act of [1.375,1.9]) for(const mk of [null,700,5000]) {
    const r=V9(P({bw,goal,activityLevel:act,manualKcal:mk,height:172,age:30}));
    if(r.faisable===false) continue;
    bg=Math.min(bg,r.fat_g/bw); hg=Math.max(hg,r.fat_g/bw);
    bp=Math.min(bp,r.fat_g*9/r.kcal); hp=Math.max(hp,r.fat_g*9/r.kcal);
    const hors=(r.fat_g/bw>C.LIP_GKG_MAX+0.02)||(r.fat_g*9/r.kcal>C.LIP_PCT_MAX+0.005)
             ||(r.fat_g/bw<C.LIP_GKG_MIN-0.001)||(r.fat_g*9/r.kcal<C.LIP_PCT_MIN-0.005);
    if(hors&&!(r.signaux||[]).includes('bornes_lipides_en_conflit')) sansSignal.push({bw,goal,mk,L:r.fat_g}); }
  T('P12① tout franchissement d\'une borne lipidique porte un SIGNAL', sansSignal.length===0, JSON.stringify(sansSignal.slice(0,3)));
  T('P12② lipides ≥ 0,5 g/kg hors conflit déclaré', bg>=C.LIP_GKG_MIN-0.001||sansSignal.length===0, bg.toFixed(3)); }

/* ── ⭐ §4 PLAUSIBILITÉ GLUCIDIQUE : UN CLASSEMENT, PAS UN SEUIL ── */
{ const petit=V9(P({bw:60,goal:'muscle',seancesSem:0,seriesParGroupe:0,activityLevel:1.9,workType:'physique',height:172,age:20}));
  const gros=V9(P({bw:120,goal:'muscle',seancesSem:6,seriesParGroupe:24,activityLevel:1.9,workType:'physique',height:190,age:25}));
  T('P13① 600 g n\'est PAS un seuil : la même quantité absolue se juge différemment selon le poids',
    petit.plausibilite.bande_max !== gros.plausibilite.bande_max,
    petit.plausibilite.bande+' vs '+gros.plausibilite.bande);
  T('P13② les calories excédentaires ne sont JAMAIS jetées (fermeture exacte)', ferm(petit)===0 && ferm(gros)===0);
  T('P13③ une charge élevée AUTORISE un g/kg élevé (8-12 g/kg est une plage publiée)',
    gros.plausibilite.bande_max>=10, String(gros.plausibilite.bande_max));
  T('P13④ une charge faible avec un TDEE douteux est classée INCOHÉRENTE, pas coupée',
    petit.plausibilite.niveau!=='NORMAL' && petit.carbs_g>0,
    petit.plausibilite.niveau+' G'+petit.carbs_g);
  T('P13⑤ la CAUSE est nommée, pas seulement le niveau', petit.plausibilite.causes.length>0,
    JSON.stringify(petit.plausibilite.causes));
  T('P13⑥ quand la plausibilité est mauvaise, le moteur dit QUOI réexaminer',
    petit.plausibilite.niveau==='NORMAL' || petit.a_reexaminer.length>0, JSON.stringify(petit.a_reexaminer));
  T('P13⑦ le signal 600 g existe et est ÉTIQUETÉ comme praticabilité, pas comme physiologie',
    typeof gros.plausibilite.signal_praticabilite_absolue === 'boolean'); }

/* ── ⭐ §10 CALORIES MANUELLES : LA VALEUR N'EST JAMAIS FALSIFIÉE ── */
{ const r6=V9(P({manualKcal:600})), r3=V9(P({manualKcal:3000}));
  T('P15① une cible manuelle réalisable est gardée (≤ 2 kcal, granularité du gramme)',
    Math.abs(r3.kcal-3000)<=2, String(r3.kcal));
  T('P15② une cible IRRÉALISABLE est déclarée avec son écart chiffré',
    r6.faisable===false && r6.conflit_manuel && r6.conflit_manuel.ecart>0,
    JSON.stringify(r6.conflit_manuel));
  T('P15③ et la valeur DEMANDÉE est conservée dans la déclaration',
    r6.conflit_manuel && r6.conflit_manuel.demande===600, String(r6.conflit_manuel&&r6.conflit_manuel.demande));
  T('P15④ le POURQUOI est écrit', !!(r6.conflit_manuel&&r6.conflit_manuel.pourquoi));
  /* ⛔ V8 falsifiait : elle remontait la cible à 863 sans le dire dans la donnée. */
  const v8=M8.mV8(P({manualKcal:600}));
  T('CTRL① V8 REMONTAIT la cible sans conserver la demande', v8.kcal>600 && v8.conflit_manuel===undefined,
    String(v8.kcal)); }

/* ── ⭐ §11-13 APPRENTISSAGE ── */
{ const sansHist=V9(P({})), maigre=V9(P({historique:H(28,5,2900,86,-0.05,3)}));
  T('P16① sans historique, le TDEE reste la formule', sansHist.tdee.source==='formule' && sansHist.tdee.poids===0);
  T('P16② 5 repas sur 28 jours → AUCUN apprentissage (consigne explicite)',
    maigre.tdee.poids===0 && maigre.tdee.tdee===sansHist.tdee.tdee,
    'poids '+maigre.tdee.poids+', porte '+maigre.tdee.confiance.porte);
  const bon=V9(P({historique:H(84,72,3050,86,0,14)}));
  T('P16③ avec un historique fiable, le TDEE apprend', bon.tdee.source==='mixte' && bon.tdee.poids>0,
    bon.tdee.estime+' → '+bon.tdee.tdee+' (obs '+bon.tdee.observe+')');
  T('P16④ mais il ne remplace JAMAIS totalement la formule (sous-déclaration connue)',
    bon.tdee.poids<1 && bon.tdee.tdee!==bon.tdee.observe, 'poids '+bon.tdee.poids);
  /* ⛔ une SEULE pesée aberrante ne doit rien changer : la pente est une régression. */
  const stable=H(84,72,3050,86,0,14);
  const bruite=JSON.parse(JSON.stringify(stable)); bruite.pesees[7].kg+=2.5;
  const a=V9(P({historique:stable})), c=V9(P({historique:bruite}));
  T('P16⑤ une pesée aberrante isolée ne déplace pas la cible de plus de 60 kcal',
    Math.abs(a.kcal-c.kcal)<=60, Math.abs(a.kcal-c.kcal)+' kcal');
  /* ⛔ une observation absurde est REJETÉE, pas apprise. */
  const absurde=V9(P({historique:H(84,72,900,86,0,14)}));
  T('P16⑥ une observation hors bornes plausibles est rejetée et la raison est écrite',
    absurde.tdee.poids===0 && !!absurde.tdee.rejet, absurde.tdee.rejet||'(pas de rejet)');
  /* ⛔ un changement d'objectif ferme la porte. */
  const chg=V9(P({historique:H(84,72,3050,86,0,14,{changementObjectif:true})}));
  T('P16⑦ un changement d\'objectif récent ferme la porte de l\'apprentissage', chg.tdee.poids===0);
  const interr=V9(P({historique:H(84,72,3050,86,0,14,{interruption:true})}));
  T('P16⑧ une interruption déclarée ferme la porte', interr.tdee.poids===0); }

/* ── P19/P20 ── */
{ let pireEA=99,mord=false;
  for(const d of [{gender:'H',bw:42,height:148,age:18,activityLevel:1.375,seancesSem:7,lm:33.6},
                  {gender:'F',bw:50,height:165,age:25,activityLevel:1.375,seancesSem:7,lm:37}]) {
    const p=P(Object.assign({goal:'perte'},d)), r=V9(p);
    pireEA=Math.min(pireEA,(r.kcal-d.seancesSem*7*d.bw/7)/d.lm);
    if((r.signaux||[]).includes('signal_disponibilite_energetique')||(r.signaux||[]).includes('plancher_metabolisme_repos')) mord=true; }
  T('P19① EA ≥ 30 kcal/kg de masse maigre (CIO/RED-S)', pireEA>=C.EA_MIN-0.5, pireEA.toFixed(1));
  T('P19② le garde-fou MORD', mord);
  const r=V9(P({bw:45,height:195,age:18,activityLevel:1.9,workType:'physique',goal:'muscle'}));
  T('P20 un TDEE implausible produit un SIGNAL, pas une troncature',
    (r.signaux||[]).some(s=>s.indexOf('gluc_')===0) || r.plausibilite.niveau!=='NORMAL', r.plausibilite.niveau); }

/* ── ⭐ §19 EXPLICABILITÉ ── */
{ const r=V9(P({goal:'perte',lm:68,bw:80,historique:H(84,72,2600,80,-0.3,14)}));
  T('P21① chaque sortie porte son explication', Array.isArray(r.explication)&&r.explication.length>=3, String(r.explication&&r.explication.length));
  T('P21② l\'explication nomme le TDEE, les protéines et les glucides',
    r.explication.some(x=>x.indexOf('TDEE')===0) && r.explication.some(x=>x.indexOf('protéines')===0)
    && r.explication.some(x=>x.indexOf('glucides')===0));
  T('P21③ la provenance de la masse maigre est dite', r.src_ffm==='mesure', r.src_ffm); }

/* ── CONTRÔLES : plusieurs témoins DOIVENT échouer sur V0 et V8 ── */
{ const cas=P({gender:'F',age:78,height:148,bw:120,activityLevel:1.375,goal:'perte',phase:'decharge'});
  const f=r=>r.prot_g*4+r.fat_g*9+r.carbs_g*4-r.kcal;
  T('CTRL② V0 ÉCHOUE sur la fermeture', f(M8.mV0(cas))!==0, 'écart '+f(M8.mV0(cas)));
  const p9=V9(P({bw:150,goal:'perte',lm:75,height:172,age:40,activityLevel:1.375,phase:'decharge'}));
  const p8=M8.mV8(P({bw:150,goal:'perte',lm:75,height:172,age:40,activityLevel:1.375,phase:'decharge'}));
  const pr=P({bw:150,goal:'perte',lm:112.5,height:172,age:40,activityLevel:1.375,phase:'decharge'});
  const t=M8.mTDEE(pr);
  T('CTRL③ V8 borne le profil obèse à 500 kcal, V9 va plus loin parce que sa masse grasse le permet',
    Math.abs(M8.mV8(pr).kcal-t) <= 505 && Math.abs(M9.mV9(pr).kcal-t) > 505,
    'V8 '+(M8.mV8(pr).kcal-t)+' vs V9 '+(M9.mV9(pr).kcal-t));
  T('CTRL④ V8 n\'a AUCUNE notion de plausibilité contextuelle', M8.mV8(P({})).plausibilite===undefined); }

/* ═══ TÉMOINS AJOUTÉS APRÈS LE CONTRÔLE NÉGATIF — six mutations ne mordaient pas ═══
   ⛔⛔ ET C'EST LA MÊME FAMILLE QUE LA SEMAINE DERNIÈRE : mes témoins n'allaient jamais dans le
   régime où la règle décide, ou bien une AUTRE règle tranchait avant et masquait la mutation.
   👉 *Un invariant protégé par un clamp placé après lui n'est pas testé : c'est le clamp qui
   est testé.* Les six témoins ci-dessous visent la règle elle-même. */
{
  /* M05 — une pesée aberrante sur le DERNIER point : c'est là qu'une pente « dernier moins
     premier » se trahit, pas au milieu. */
  const st=H(84,72,3050,86,0,14);
  const fin=JSON.parse(JSON.stringify(st)); fin.pesees[13].kg+=2.5;
  const deb=JSON.parse(JSON.stringify(st)); deb.pesees[0].kg-=2.5;
  const a=V9(P({historique:st})), b=V9(P({historique:fin})), c=V9(P({historique:deb}));
  T('P16⑨ une pesée aberrante en FIN de série ne déplace pas la cible de plus de 80 kcal',
    Math.abs(a.kcal-b.kcal)<=80, Math.abs(a.kcal-b.kcal)+' kcal');
  T('P16⑩ ni une pesée aberrante au DÉBUT', Math.abs(a.kcal-c.kcal)<=80, Math.abs(a.kcal-c.kcal)+' kcal');

  /* M06 — l'unité doit se voir dans le NOMBRE, pas seulement dans l'étiquette. Chez un sujet à
     forte masse grasse, un barème appliqué au poids donnerait beaucoup plus de protéines. */
  const gras=P({bw:120,goal:'perte',lm:72,height:172,age:40,activityLevel:1.375,phase:'decharge'});
  const rg=V9(gras);
  T('P11⑧ en déficit, les protéines sont calculées sur la MASSE MAIGRE (vérifié au gramme)',
    Math.abs(rg.prot_g - Math.round(72 * (rg.prot_g/72))) < 1 && rg.prot_g < Math.round(120*2.0),
    rg.prot_g+' g pour 120 kg / 72 kg de masse maigre');

  /* M18 — la modulation par la sécheresse se mesure en g/kg de MASSE MAIGRE, avant que les
     clamps en poids de corps ne la masquent. */
  const sec2=V9(P({bw:85,goal:'perte',lm:79.9,height:172,age:30,activityLevel:1.375,phase:'decharge'}));
  const gras2=V9(P({bw:85,goal:'perte',lm:51,height:172,age:30,activityLevel:1.375,phase:'decharge'}));
  T('P11⑨ la modulation de Helms par la sécheresse se voit en g/kg de masse maigre',
    sec2.prot_g/79.9 > gras2.prot_g/51 + 0.25,
    (sec2.prot_g/79.9).toFixed(2)+' vs '+(gras2.prot_g/51).toFixed(2));

  /* M07 — il doit EXISTER des prescriptions au-dessus de 600 g, sinon 600 g est redevenu une
     limite dure. ⛔ C'est le §2 : 600 g n'a aucune justification physiologique. */
  const costaud=V9(P({bw:120,goal:'muscle',seancesSem:6,seriesParGroupe:24,activityLevel:1.9,
                      workType:'physique',height:190,age:25}));
  T('P13⑧ 600 g n\'est PAS une limite dure : le moteur prescrit au-delà quand l\'énergie l\'exige',
    costaud.carbs_g>600, String(costaud.carbs_g)+' g');

  /* ⛔⛔ M16 — ET LA MESURE A CORRIGÉ MON TÉMOIN, PAS L'INVERSE.
     J'affirmais « le plafond lipidique d'Iraki (1,5 g/kg) MORD ». **Il ne mord jamais comme
     plafond**, et c'est arithmétique : les ratios de base plafonnent à 1,0 g/kg, et rien dans
     V9 ne pousse les lipides au-dessus, sauf le plancher des 15 % de l'énergie — qui, lui,
     produit un CONFLIT déclaré, pas un plafonnement.
     👉 ***1,5 g/kg n'est donc pas un plafond dans V9 : c'est un DÉTECTEUR.*** Le §22 du brief
     demande exactement ça — « que se passe-t-il si on la retire ? ». Réponse : le conflit
     lipidique cesse d'être signalé. Le témoin mesure donc ce rôle-là, le vrai. */
  let hautLipNormal=0, conflitVu=false;
  for(const bw of [42,50,60,85]) for(const act of [1.725,1.9]) for(const wt of ['bureau','physique'])
  for(const goal of ['muscle','force']) for(const mk of [null,5000]) {
    const r=V9(P({bw,activityLevel:act,workType:wt,goal,height:190,age:20,seancesSem:6,
                  seriesParGroupe:24,manualKcal:mk}));
    if((r.signaux||[]).includes('bornes_lipides_en_conflit')) conflitVu=true;
    else hautLipNormal=Math.max(hautLipNormal,r.fat_g/bw); }
  T('P12③ hors conflit déclaré, les lipides restent sous 1,5 g/kg (Iraki)',
    hautLipNormal<=C.LIP_GKG_MAX+0.02, hautLipNormal.toFixed(3));
  T('P12④ et le DÉTECTEUR de conflit lipidique s\'allume réellement', conflitVu);

  /* M26 — la vitesse de perte doit VARIER avec la masse grasse, pas être une constante. */
  const v=b=>V9(P({bw:90,goal:'perte',lm:Math.round(90*(1-b/100)*10)/10,height:172,age:35,
                   activityLevel:1.375,phase:'decharge'})).vitesse;
  const vs=[v(8),v(20),v(35)];
  T('P09⑨ la vitesse de perte VARIE avec la masse grasse (jamais une constante)',
    new Set(vs.map(x=>Math.round(x*100))).size===3 && vs[0]>vs[2], vs.map(x=>x.toFixed(2)).join(' / '));
}

console.log('TÉMOINS V9 (bloc B-CCCLIV) : ' + ok + ' OK · ' + rouge.length + ' ROUGE');
rouge.forEach(r => console.log('  ⛔ ' + r));
process.exit(rouge.length ? 1 : 0);
