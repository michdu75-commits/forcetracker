const fs=require('fs'), vm=require('vm');
const src=fs.readFileSync(process.argv[2]||'p1/TestP1.js','utf8');
function monde(t0){ const props={FT_P1_TEST:'1', ft_backup_drive_folder_id:'dossier-test'}; let triggers=[]; let T=t0; const log=[];
  const ctx={ PropertiesService:{getScriptProperties:()=>({getProperty:k=>(k in props?props[k]:null),setProperty:(k,v)=>{props[k]=String(v)},deleteProperty:k=>{delete props[k]}})},
    ScriptApp:{getProjectTriggers:()=>triggers.slice(),deleteTrigger:t=>{triggers=triggers.filter(x=>x!==t)},newTrigger:h=>({timeBased:()=>({everyMinutes:()=>({create:()=>{triggers.push({getHandlerFunction:()=>h})}})})})},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})}, DriveApp:{getFolderById:()=>({getName:()=>'FT-TEST-P1-RECUP-2026-11-04'})}, Logger:{log:m=>log.push(m)},
    Date:class extends Date{ constructor(...a){ if(a.length) super(...a); else super(T);} static now(){return T;} }, JSON, Error, Number, String };
  vm.createContext(ctx); vm.runInContext(src,ctx);
  return {ctx,props,triggers:()=>triggers,avance:(min)=>{T+=min*60000;},t:()=>T,log};
}
let ok=0,ko=0; const t=(n,c,d)=>{c?ok++:ko++; console.log((c?'  OK   ':'  ROUGE ')+n+(d!==undefined?'  >> '+JSON.stringify(d):''));};
const w=monde(Date.UTC(2026,10,6,20,0,0));
const rep=w.ctx.autoriserEtProgrammerEssaiP1();
t('programmation : 1 déclencheur basculeEssaiP1, propriété absente, début +60 min', w.triggers().length===1 && !('NUT_SUSPENDU' in w.props) && Number(w.props.FT_P1_BASC_DEBUT)===w.t()+60*60000, rep);
const etats=[]; for(let m=0;m<=240;m+=5){ w.avance(m===0?0:5); w.ctx.basculeEssaiP1(); etats.push([m, w.props.NUT_SUSPENDU==='1']); }
const susp=etats.filter(e=>e[1]).map(e=>e[0]);
t('rien n\'est suspendu avant +60 min', susp.every(m=>m>=60), susp.slice(0,3));
t('3 créneaux : début à +60, +105, +150 ; durée 10-15 min', [60,105,150].every(d=>susp.includes(d)) && !susp.includes(80) && !susp.includes(120), susp);
const dernier=etats[etats.length-1];
t('après la fin (+195 min) : propriété retirée ET déclencheur supprimé', dernier[1]===false && w.triggers().length===0, {triggers:w.triggers().length});
/* garde : projet non préparé */
const w2=monde(Date.UTC(2026,10,6,20,0,0)); delete w2.props.FT_P1_TEST; let err=''; try{ w2.ctx.autoriserEtProgrammerEssaiP1(); }catch(e){ err=String(e.message); }
t('refuse hors du projet de TEST préparé (rien programmé)', /FT_P1_TEST/.test(err) && w2.triggers().length===0, err.slice(0,60));
/* garde : mauvais dossier */
const w3=monde(Date.UTC(2026,10,6,20,0,0)); w3.ctx.DriveApp.getFolderById=()=>({getName:()=>'ForceTracker-Backups'}); let err3=''; try{ w3.ctx.autoriserEtProgrammerEssaiP1(); }catch(e){ err3=String(e.message); }
t('refuse si le dossier de récupération est celui de la PRODUCTION (ForceTracker-Backups)', /FT-TEST-P1/.test(err3) && w3.triggers().length===0, err3.slice(0,70));
/* garde : pas de dossier de récupération du tout */
const w5=monde(Date.UTC(2026,10,6,20,0,0)); delete w5.props.ft_backup_drive_folder_id; let err5=''; try{ w5.ctx.autoriserEtProgrammerEssaiP1(); }catch(e){ err5=String(e.message); }
t('refuse si aucun dossier de récupération de test (il écrirait dans le dossier de la production, trouvé par son nom)', /FT-TEST-P1/.test(err5) && w5.triggers().length===0, err5.slice(0,60));
/* arrêt d'urgence */
const w4=monde(Date.UTC(2026,10,6,20,0,0)); w4.ctx.autoriserEtProgrammerEssaiP1(); w4.props.NUT_SUSPENDU='1'; w4.ctx.arreterBasculeEssaiP1();
t('arrêt d\'urgence : propriété retirée, déclencheur supprimé', !('NUT_SUSPENDU' in w4.props) && w4.triggers().length===0);
console.log('\n'+ok+' OK / '+ko+' ROUGE'); process.exit(ko?1:0);
