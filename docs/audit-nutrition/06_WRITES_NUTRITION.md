# 06 — TOUTES LES ÉCRITURES VERS LA VÉRITÉ NUTRITIONNELLE

> Demande §5 de l'auditeur : *« tous les endroits où une valeur nutritionnelle peut
> devenir une référence »*. Recherche mécanique sur les noms qu'il a listés.

> ⚠️ **Limite dite** : c'est une recherche textuelle, pas une analyse de flux. Elle
> ramasse donc aussi des écritures anodines (une variable locale nommée `kcal`), et
> elle ne saurait pas voir une écriture faite par un nom calculé. *Un auditeur doit
> savoir ce que l'outil ne peut pas voir.*

**286 écritures trouvées.**

| fichier | ligne | fonction | nom écrit | code |
|---|---|---|---|---|
| `app.js` | 473 | `_estimCalTempsReel` | `kcal` | `return {kcal:Math.round(MET_MUSCU_MODERE*bw*(d.actifSec/3600)), min:Math.round(d.actifSec/60)};` |
| `app.js` | 1026 | `closeFoodWall` | `_bcNutr` | `let _bcNutr=null; // {name, kcal100, prot100, carbs100, fat100}` |
| `app.js` | 1165 | `_provFood` | `per100` | `q:null, u:null, etat:null, sourceId:null, per100:null, modifie:false};` |
| `app.js` | 1170 | `_provFood` | `per100` | `if(_afSrc.per100)p.per100=_afSrc.per100;` |
| `app.js` | 1202 | `_provFood` | `q` | `if(row&&row.style.display!=='none'&&g>0){ p.q=g; p.u='g'; }` |
| `app.js` | 1220 | `_provFood` | `q` | `const q=numFR((document.getElementById('af-prop')\|\|{}).value)\|\|_afRef.q;` |
| `app.js` | 1223 | `_provFood` | `q` | `p.q=q; p.u='g';` |
| `app.js` | 1224 | `_provFood` | `kcal` | `p.per100={kcal:Math.round((+vals.kcal\|\|0)*f), prot:Math.round((+vals.prot\|\|0)*f),` |
| `app.js` | 1225 | `_provFood` | `carbs` | `carbs:Math.round((+vals.carbs\|\|0)*f), fat:Math.round((+vals.fat\|\|0)*f)};` |
| `app.js` | 1434 | `_per100d1` | `per100` | `quantité inconnue → l'entrée part avec `per100:null` ET `q:null` → plus rien ne peut la` |
| `app.js` | 1458 | `_bcSansValeurs` | `_bcNutr` | `_bcNutr=null;` |
| `app.js` | 1490 | `_lookupBarcode` | `_bcNutr` | `_bcNutr={` |
| `app.js` | 1542 | `_offRemplirFormulaire` | `kcal` | `per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},` |
| `app.js` | 1557 | `_offRemplirFormulaire` | `per100` | `⛔⛔ LA CAUSE, MESURÉE : sa ligne porte `per100 = null`, et AUCUN champ de l'app ne permettait` |
| `app.js` | 1577 | `_calOuvrir` | `q` | `const q=_qtyGrammesEcran('af');` |
| `app.js` | 1586 | `_calAppliquer` | `kcal` | `const kcal=lu('kcal'), prot=lu('prot'), carbs=lu('carbs'), fat=lu('fat');` |
| `app.js` | 1615 | `_calAppliquer` | `_bcNutr` | `_bcNutr={name:nom.slice(0,80), kcal100:_per100d1(kcal), prot100:_per100d1(prot),` |
| `app.js` | 1625 | `_calAppliquer` | `quantity` | `_offRemplirFormulaire({serving_quantity:0, quantity:_bcPaquetTxt, nutriments:{}}, null, 'etiquette-main', false, 'etiquette');` |
| `app.js` | 1633 | `_afLuFormulaire` | `kcal` | `return {kcal:g('af-kcal'),prot:g('af-prot'),carbs:g('af-carbs'),fat:g('af-fat')};` |
| `app.js` | 1681 | `_bcApplyGrams` | `kcal` | `const g=_qtyRescale('af', {kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},` |
| `app.js` | 1750 | `_bcProposerDerniere` | `q` | `b.dataset.q=String(+q);` |
| `app.js` | 1763 | `_bcProposerPaquet` | `q` | `b.dataset.q=String(g);` |
| `app.js` | 1769 | `_bcReprendrePaquet` | `q` | `const q=parseFloat(b.dataset.q)\|\|0; if(!(q>0)) return;` |
| `app.js` | 1776 | `_bcReprendreDerniere` | `q` | `const q=parseFloat(b.dataset.q)\|\|0; if(!(q>0)) return;` |
| `app.js` | 1885 | `rejouerRepas` | `foodLog` | `if(!S.foodLog)S.foodLog=[];` |
| `app.js` | 1889 | `rejouerRepas` | `kcal` | `const vals={kcal:e.kcal\|\|0,prot:e.prot\|\|0,carbs:e.carbs\|\|0,fat:e.fat\|\|0};` |
| `app.js` | 1891 | `rejouerRepas` | `foodLog` | `S.foodLog.push(Object.assign({date:_journalJourActif(),meal:moment,name:e.name,ts:Date.now()},vals,prov,{q:null,u:null}));` |
| `app.js` | 1917 | `_foodTotals` | `kcal` | `const t={kcal:0,prot:0,carbs:0,fat:0};` |
| `app.js` | 1944 | `_profilAlimentaire` | `foodLog` | `const fl = Array.isArray(S.foodLog) ? S.foodLog : [];` |
| `app.js` | 1974 | `_profilAlimentaire` | `kcal` | `global[k] = global[k] \|\| {nom:n, n:0, kcal:+e.kcal\|\|0, prot:+e.prot\|\|0, carbs:+e.carbs\|\|0, fat:+e.fat\|\|0};` |
| `app.js` | 1993 | `_profilAlimentaire` | `kcal` | `const somme = {kcal:0, prot:0, carbs:0, fat:0};` |
| `app.js` | 2036 | `_resteDuJour` | `kcal` | `const tot = (typeof _foodTotals==='function') ? _foodTotals(d) : {kcal:0,prot:0,carbs:0,fat:0};` |
| `app.js` | 2041 | `_resteDuJour` | `kcal` | `kcal:  r(cible.calories - tot.kcal),` |
| `app.js` | 2042 | `_resteDuJour` | `prot` | `prot:  r((cible.prot_g\|\|0)  - tot.prot),` |
| `app.js` | 2043 | `_resteDuJour` | `carbs` | `carbs: r((cible.carbs_g\|\|0) - tot.carbs),` |
| `app.js` | 2044 | `_resteDuJour` | `fat` | `fat:   r((cible.fat_g\|\|0)   - tot.fat),` |
| `app.js` | 2067 | `_mesAliments` | `kcal` | `const kcal=+e.kcal\|\|0, prot=+e.prot\|\|0, carbs=+e.carbs\|\|0, fat=+e.fat\|\|0;` |
| `app.js` | 2070 | `_mesAliments` | `kcal` | `out.push({name:n, kcal:kcal, prot:prot, carbs:carbs, fat:fat,` |
| `app.js` | 2071 | `_mesAliments` | `per100` | `per100:e.per100\|\|null, fav:!!fav, freq:(freq[k]\|\|0)});` |
| `app.js` | 2182 | `_ideePourMacro` | `prot` | `const KCAL = {prot:4, carbs:4, fat:9};` |
| `app.js` | 2202 | `_ideePourMacro` | `q` | `const q = _portionRaisonnable(a, macro, reste, soir);` |
| `app.js` | 2213 | `_ideePourMacro` | `prot` | `const _RESTE_SEUILS = { prot:15, carbs:25, fat:8 };           // en dessous, ça ne vaut pas un conseil` |
| `app.js` | 2219 | `_ideesPourLeReste` | `prot` | `const noms = { prot:'protéines', carbs:'glucides', fat:'lipides' };` |
| `app.js` | 2257 | `openAddFood` | `_bcNutr` | `_bcNutr=null;` |
| `app.js` | 2325 | `_buildFoodQuickItems` | `kcal` | `const favs=(S.savedFoods\|\|[]).map(f=>({name:f.name,kcal:f.kcal\|\|0,prot:f.prot\|\|0,carbs:f.carbs\|\|0,fat:f.fat\|\|0,` |
| `app.js` | 2326 | `_buildFoodQuickItems` | `per100` | `per100:f.per100\|\|null,q:+f.q>0?+f.q:0,u:f.u\|\|null,fav:true}));` |
| `app.js` | 2332 | `_buildFoodQuickItems` | `kcal` | `recent.push({name:e.name,kcal:e.kcal\|\|0,prot:e.prot\|\|0,carbs:e.carbs\|\|0,fat:e.fat\|\|0,` |
| `app.js` | 2333 | `_buildFoodQuickItems` | `per100` | `per100:e.per100\|\|null,q:+e.q>0?+e.q:0,u:e.u\|\|null,` |
| `app.js` | 2390 | `quickFillFood` | `per100` | `sourceId:it.sourceId\|\|null, etat:it.etat\|\|null, per100:it.per100\|\|null,` |
| `app.js` | 2395 | `quickFillFood` | `_bcNutr` | `_bcNutr={ name:(it.name\|\|'').slice(0,60), kcal100:+P.kcal\|\|0,` |
| `app.js` | 2400 | `quickFillFood` | `q` | `if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+it.q>0 && (!it.u\|\|it.u==='g')) ? +it.q : 0);` |
| `app.js` | 2421 | `quickFillFood` | `_bcNutr` | `_bcNutr=null;` |
| `app.js` | 2432 | `quickAddFood` | `foodLog` | `if(!S.foodLog)S.foodLog=[];` |
| `app.js` | 2436 | `quickAddFood` | `kcal` | `const _vals={kcal:it.kcal\|\|0,prot:it.prot\|\|0,carbs:it.carbs\|\|0,fat:it.fat\|\|0};` |
| `app.js` | 2438 | `quickAddFood` | `foodLog` | `S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:(it.name\|\|'').slice(0,80),ts:Date.now()},_vals,_provFood(_vals)));` |
| `app.js` | 2454 | `toggleFavFood` | `kcal` | `else { S.savedFoods.push({name:it.name,kcal:it.kcal\|\|0,prot:it.prot\|\|0,carbs:it.carbs\|\|0,fat:it.fat\|\|0,` |
| `app.js` | 2455 | `toggleFavFood` | `per100` | `per100:it.per100\|\|null,q:+it.q>0?+it.q:0,u:it.u\|\|null}); toast('Ajouté aux favoris ⭐','success'); }` |
| `app.js` | 2537 | `onFoodLabelFile` | `_bcNutr` | `_bcNutr={` |
| `app.js` | 2563 | `onFoodLabelFile` | `kcal` | `per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},` |
| `app.js` | 2708 | `_complSuggInput` | `q` | `const q=(document.getElementById('compl-desc')\|\|{}).value\|\|'';` |
| `app.js` | 3096 | `_afSuggPrendreMarque` | `_bcNutr` | `_bcNutr={ name:(a[1]+' · '+a[0]).slice(0,60), kcal100:_per100d1(a[3]),` |
| `app.js` | 3109 | `_afSuggPrendreMarque` | `kcal` | `per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},` |
| `app.js` | 3121 | `_afSuggPrendreCiqual` | `_bcNutr` | `_bcNutr={ name:a[1].slice(0,60), kcal100:_per100d1(a[3]),` |
| `app.js` | 3131 | `_afSuggPrendreCiqual` | `kcal` | `per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},` |
| `app.js` | 3344 | `_afSuggInput` | `q` | `const q=(document.getElementById('af-desc')\|\|{}).value\|\|'';` |
| `app.js` | 3420 | `_afSuggPrendreLocale` | `_bcNutr` | `_bcNutr={ name:(e.name\|\|'').slice(0,60), kcal100:+P.kcal\|\|0,` |
| `app.js` | 3425 | `_afSuggPrendreLocale` | `q` | `if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+e.q>0 && (!e.u\|\|e.u==='g')) ? +e.q : 0);` |
| `app.js` | 3446 | `_afSuggPrendreLocale` | `_bcNutr` | `_bcNutr=null;` |
| `app.js` | 3450 | `_afSuggPrendreLocale` | `per100` | `sourceId:e.sourceId\|\|null, etat:e.etat\|\|null, per100:e.per100\|\|null,` |
| `app.js` | 3461 | `_afSuggPrendreLocale` | `per100` | ``per100:null` ET `q:null`. À la reprise, la condition de ft-v984 ne peut pas être remplie.` |
| `app.js` | 3473 | `_afSuggPrendreLocale` | `q` | `quantité à l'écran**, alors que l'entrée porte `q:30`.` |
| `app.js` | 3494 | `_afSuggPrendreOff` | `_bcNutr` | `_bcNutr={ name:_afSuggNom(p), kcal100:_per100d1(_afSuggKcal100(p)),` |
| `app.js` | 3504 | `addFoodEntry` | `kcal` | `const kcal=parseInt(document.getElementById('af-kcal').value)\|\|0;` |
| `app.js` | 3505 | `addFoodEntry` | `prot` | `const prot=parseInt(document.getElementById('af-prot').value)\|\|0;` |
| `app.js` | 3506 | `addFoodEntry` | `carbs` | `const carbs=parseInt(document.getElementById('af-carbs').value)\|\|0;` |
| `app.js` | 3507 | `addFoodEntry` | `fat` | `const fat=parseInt(document.getElementById('af-fat').value)\|\|0;` |
| `app.js` | 3510 | `addFoodEntry` | `foodLog` | `if(!S.foodLog)S.foodLog=[];` |
| `app.js` | 3511 | `addFoodEntry` | `foodLog` | `S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:name.slice(0,80),kcal,prot,carbs,fat,ts:Date.now()},` |
| `app.js` | 3524 | `removeFoodEntry` | `foodLog` | `S.foodLog=S.foodLog.filter(e=>e.ts!==ts);` |
| `app.js` | 3576 | `journalNav` | `per100` | `⛔ SEULEMENT SI `per100` EXISTE : une entrée tapée à la main (`per100:null`) n'a pas de « pour` |
| `app.js` | 3612 | `openEditFood` | `_efRef` | `_efRef=null;` |
| `app.js` | 3646 | `_renderEditFoodMeals` | `_efRef` | `let _efRef=null;` |
| `app.js` | 3705 | `_efPropSetBase` | `kcal` | `return {kcal:n('ef-kcal'),prot:n('ef-prot'),carbs:n('ef-carbs'),fat:n('ef-fat')};` |
| `app.js` | 3725 | `_efQtyRender` | `kcal` | `: {kcal:e.kcal\|\|0,prot:e.prot\|\|0,carbs:e.carbs\|\|0,fat:e.fat\|\|0});` |
| `app.js` | 3729 | `_efQtyRender` | `u` | `: (e.q>0 ? {v:e.q,u:e.u\|\|'g',src:'quantité enregistrée'}` |
| `app.js` | 3730 | `_efQtyRender` | `u` | `: (mNom ? {v:parseFloat(mNom[1].replace(',','.')),u:mNom[2].toLowerCase(),src:'lu dans le nom'} : null));` |
| `app.js` | 3741 | `_efQtyRender` | `_efRef` | `_efRef={base:base,q:ancre.v,u:ancre.u};   // ⛔ l'unité VOYAGE (ft-v1103) : 100 ml de miel pèsent ~140 g` |
| `app.js` | 3755 | `_efQtyRender` | `_efRef` | `_efRef={base:base,q:_efPoidsDeclare,u:'g'};   // l'onglet « ⚖️ En grammes » : c'est des grammes` |
| `app.js` | 3761 | `_efQtyRender` | `_efRef` | `_efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait` |
| `app.js` | 3776 | `_efQtyRender` | `_efRef` | `_efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait` |
| `app.js` | 3827 | `_efApplyPortion` | `lipides` | `la prot »*. **35 g de protéines + 1 g de glucides + 1 g de lipides = 37 g de matière dans une` |
| `app.js` | 3885 | `_masseImpossible` | `q` | `const q=_qtyGrammesEcran(pfx); if(!(q>0)) return null;` |
| `app.js` | 3898 | `_masseImpossibleVals` | `q` | `return {q:q, somme:Math.round(somme*10)/10};` |
| `app.js` | 3946 | `_kcalImpossibleVals` | `portion` | `/* ⛔ La masse ne tient déjà pas dans la portion : `_masseImpossible` a la parole, pas nous.` |
| `app.js` | 3953 | `_kcalImpossibleVals` | `kcal` | `return {q:q, kcal:Math.round(kcal), plafond:Math.round(plafond),` |
| `app.js` | 3959 | `_kcalImpossible` | `q` | `const q=_qtyGrammesEcran(pfx); if(!(q>0)) return null;` |
| `app.js` | 3967 | `_coherenceKcal` | `kcal` | `const kcal=g('kcal'), theo=4*g('prot')+4*g('carbs')+9*g('fat');` |
| `app.js` | 4015 | `_efCorrigerKcal` | `kcal` | `if(_efRef)_efRef.base.kcal=v;            // la référence suit, sinon un rescale la ferait revenir` |
| `app.js` | 4043 | `_afCoherence` | `_afRef` | `let _afRef=null;          // {base:{kcal,prot,carbs,fat}, q, u, src}` |
| `app.js` | 4046 | `_afPropSetBase` | `kcal` | `return {kcal:n('af-kcal'),prot:n('af-prot'),carbs:n('af-carbs'),fat:n('af-fat')};` |
| `app.js` | 4075 | `_afApplyPortion` | `_afRef` | `⭐⭐ ET RIEN N'EST RÉINVENTÉ (R13) : le bloc « portion » posait DÉJÀ `_afRef={q:1}`, donc un` |
| `app.js` | 4137 | `_afPropCacher` | `_afRef` | `_afRef=null;` |
| `app.js` | 4197 | `_afMajAncre` | `u` | `const ancre = iaValide ? {v:window._afIaGrammes,u:'g',src:'poids estimé par l\'IA'}` |
| `app.js` | 4198 | `_afMajAncre` | `u` | `: (m ? {v:parseFloat(m[1].replace(',','.')),u:m[2].toLowerCase(),src:'lu dans ta phrase'} : null);` |
| `app.js` | 4206 | `_afMajAncre` | `_afRef` | `_afRef={base:base,q:qR,u:ancre.u,src:sR};` |
| `app.js` | 4226 | `_afMajAncre` | `_afRef` | `_afRef={base:base,q:_afPoidsDeclare,u:'g',src:'que tu as indiqué'};` |
| `app.js` | 4235 | `_afMajAncre` | `_afRef` | `_afRef={base:base,q:1,u:'',src:'portion'};` |
| `app.js` | 4246 | `_afMajAncre` | `_afRef` | `_afRef={base:base,q:1,u:'',src:'portion'};` |
| `app.js` | 4266 | `_afCorrigerKcal` | `kcal` | `if(_afRef)_afRef.base.kcal=v;   // la référence suit, sinon un rescale ferait revenir l'ancien chiffre` |
| `app.js` | 4279 | `saveEditFood` | `kcal` | `e.kcal=parseInt(document.getElementById('ef-kcal').value)\|\|0;` |
| `app.js` | 4280 | `saveEditFood` | `prot` | `e.prot=parseInt(document.getElementById('ef-prot').value)\|\|0;` |
| `app.js` | 4281 | `saveEditFood` | `carbs` | `e.carbs=parseInt(document.getElementById('ef-carbs').value)\|\|0;` |
| `app.js` | 4282 | `saveEditFood` | `fat` | `e.fat=parseInt(document.getElementById('ef-fat').value)\|\|0;` |
| `app.js` | 4286 | `saveEditFood` | `q` | `if(gEl){ e.q=numFR(gEl.value)\|\|0; e.u='g'; }` |
| `app.js` | 4293 | `saveEditFood` | `q` | `if(pEl && numFR(pEl.value)>0){ e.q=numFR(pEl.value); e.u=e.u\|\|'g'; }` |
| `app.js` | 5575 | `_initCloneTools` | `u` | `const u=document.getElementById('admin-clone-unlimited-card');` |
| `app.js` | 5920 | `_bilanMois` | `kcal` | `const kcal=sess.reduce((a,s)=>a+(s.calories\|\|0),0);` |
| `app.js` | 6222 | `finalImportMeal` | `kcal` | `name:m.name\|\|'Repas',foods:m.foods\|\|[],kcal:m.kcal\|\|0,prot:m.prot\|\|0,carbs:m.carbs\|\|0,fat:m.fat\|\|0` |
| `app.js` | 6738 | `loadAuthStatusAdmin` | `prot` | `const prot=ok&&d.hasCode;` |
| `app.js` | 7186 | `_healthServeur` | `q` | `const q=(e&&e.name==='AbortError')?'trop lent (>20 s)':_escIdea(String(e&&e.message\|\|e));` |
| `app.js` | 7313 | `loadHealthAdmin` | `u` | `const u=ai.used!==undefined?ai.used:(ai.count!==undefined?ai.count:null);` |
| `app.js` | 7386 | `loadHealthAdmin` | `u` | `.map(u=>(typeof _obsEsc==='function'?_obsEsc(_court(u.email)):_court(u.email))+' <b>'+(u.count\|\|0)+'</b>').join(' · ');` |
| `app.js` | 7399 | `loadHealthAdmin` | `u` | `const _anon=ai.topUsers.filter(u=>String(u.email\|\|'').toLowerCase()==='anon')` |
| `screens.js` | 1765 | `_ckTuiles` | `q` | `const q = (ts&&ts.quality) ? ts.quality-1 : null;` |
| `screens.js` | 2534 | `_renderAujourdhui` | `kcal` | `const auj=(typeof _foodTotals==='function')?_foodTotals(today()):{kcal:0,prot:0,carbs:0,fat:0};` |
| `screens.js` | 2757 | `_evolutionVersMilo` | `q` | `const q='Sur '+T.fenetre+' derniers jours : '+bouts.join(', ')+'. Ces signaux ne vont pas tous dans le sens de mon objectif — qu\'est-ce que tu en penses ?';` |
| `screens.js` | 2783 | `_blocResteHTML` | `prot` | `const cols={prot:'var(--green)',carbs:'var(--orange)',fat:'var(--gold)'};` |
| `screens.js` | 3058 | `renderNutrition` | `kcal` | `const bd=(typeof bmrDetail==='function')?bmrDetail():{kcal:calcBMR(),methode:null};` |
| `screens.js` | 3087 | `renderNutrition` | `calories` | `const sessCals=todaySess&&todaySess.calories?todaySess.calories:0;` |
| `screens.js` | 3401 | `renderFoodJournal` | `kcal` | `const tot=(typeof _foodTotals==='function')?_foodTotals(td):{kcal:0,prot:0,carbs:0,fat:0};` |
| `screens.js` | 3444 | `renderFoodJournal` | `kcal` | `const tj=(typeof _foodTotals==='function')?_foodTotals(ymd):{kcal:0};` |
| `screens.js` | 3445 | `renderFoodJournal` | `calories` | `const cible=target?target.calories:0;` |
| `state.js` | 56 | `_setAuthCode` | `foodLog` | `foodLog:[],` |
| `state.js` | 286 | `load` | `foodLog` | `S.foodLog=JSON.parse(localStorage.getItem('ft4_foodlog')\|\|'[]');` |
| `state.js` | 532 | `_fusionnerAvecLeDisque` | `foodLog` | `S.foodLog    = _fusionListe(S.foodLog,    lire('ft4_foodlog',[]),` |
| `state.js` | 1028 | `bmrDetail` | `kcal` | `if(!S.bw\|\|!S.height\|\|!S.age) return {kcal:0,methode:null,raison:'profil incomplet'};` |
| `state.js` | 1037 | `bmrDetail` | `kcal` | `if(!lm) return {kcal:fin(mifflin),methode:'mifflin',raison:'aucune mesure de composition corporelle',mifflin:fin(mifflin)};` |
| `state.js` | 1040 | `bmrDetail` | `kcal` | `return {kcal:fin(mifflin),methode:'mifflin',raison:'dernier bilan trop ancien ('+(isNaN(jours)?'?':jours)+' j)',mifflin:fin(mifflin),lm:lm};` |
| `state.js` | 1042 | `bmrDetail` | `kcal` | `return {kcal:fin(mifflin),methode:'mifflin',raison:'ton poids a changé de plus de 5 % depuis ce bilan',mifflin:fin(mifflin),lm:lm};` |
| `state.js` | 1044 | `bmrDetail` | `kcal` | `return {kcal:fin(katch),methode:'katch',raison:'',mifflin:fin(mifflin),lm:lm,jours:jours};` |
| `state.js` | 1074 | `calcPasExtra` | `kcal` | `return (e&&e.kcal>0)?e.kcal:0;` |
| `state.js` | 1444 | `plancherKcalActif` | `glucides` | `(`macrosForKcal`). Il n'y a donc rien à « ajouter » aux glucides : pour qu'ils montent à` |
| `state.js` | 1759 | `tendance14j` | `kcal` | `out.alim.kcal={ moy:moy, jours:jc.complets.length, cible:cible,` |
| `state.js` | 1771 | `tendance14j` | `q` | `if(out.poids) signaux.push({ q:'poids', ok: out.poids.dans===true, connu: out.poids.dans!==null });` |
| `state.js` | 1772 | `tendance14j` | `q` | `if(out.force) signaux.push({ q:'force', ok: out.force.pct>=0 \|\| out.force.decharge, connu:true });` |
| `state.js` | 1786 | `calcMacros` | `calories` | `const calories=manual\|\|auto;` |
| `state.js` | 2296 | `getMeals` | `kcal` | `const kcal=Math.round(macros.calories*pct);` |
| `state.js` | 2301 | `getMeals` | `prot` | `const prot=Math.round(macros.prot_g*pct);` |
| `state.js` | 2302 | `getMeals` | `carbs` | `const carbs=Math.round(macros.carbs_g*pct);` |
| `state.js` | 2303 | `getMeals` | `fat` | `const fat=Math.round(macros.fat_g*pct);` |
| `coach.js` | 21 | `_coachFreeLimit` | `q` | `{id:'xp', q:'Depuis combien de temps tu t\'entraînes ?', t:'single', opts:[['debut','Je débute (ou je reprends)'],['6m','Moins de 6 mois'],['2a','6 mois à 2 ans'],['5a','2 à 5 ans'],['5p','Plus de 5 a` |
| `coach.js` | 22 | `_coachFreeLimit` | `q` | `{id:'freq', q:'Combien de séances par semaine tu peux vraiment tenir ?', t:'single', opts:[['1','1 à 2'],['3','3'],['4','4'],['5','5 ou plus']]},` |
| `coach.js` | 23 | `_coachFreeLimit` | `q` | `{id:'place', q:'Où tu t\'entraînes le plus souvent ?', t:'single', opts:[['salle','Salle complète'],['basic','Salle basique / peu de machines'],['maison','Maison avec du matériel'],['pdc','Maison sans` |
| `coach.js` | 24 | `_coachFreeLimit` | `q` | `{id:'time', q:'Combien de temps dure une séance en général ?', t:'single', opts:[['30','~30 min'],['45','~45 min'],['60','~1 h'],['90','1 h 30 ou plus']]},` |
| `coach.js` | 25 | `_coachFreeLimit` | `q` | `{id:'bar', q:'Ton aisance avec les mouvements à la barre (squat, soulevé, développé) ?', t:'single', opts:[['jamais','Jamais essayé'],['debut','Débutant, pas à l\'aise'],['ok','Ça va'],['pro','Très à ` |
| `coach.js` | 26 | `_coachFreeLimit` | `q` | `{id:'motiv', q:'Qu\'est-ce qui te motive le plus ?', t:'single', opts:[['fort','Me sentir plus fort'],['corps','Me sentir mieux dans mon corps'],['sante','La santé, le bien-être'],['esth','L\'esthétiq` |
| `coach.js` | 27 | `_coachFreeLimit` | `q` | `{id:'weak', q:'Quel groupe tu trouves le plus dur à faire progresser ?', t:'single', opts:[['pecs','Pectoraux'],['dos','Dos'],['jambes','Jambes'],['epaules','Épaules'],['bras','Bras'],['abdos','Abdos'` |
| `coach.js` | 28 | `_coachFreeLimit` | `q` | `{id:'cardio', q:'Ta relation avec le cardio ?', t:'single', opts:[['jamais','J\'en fais jamais'],['peu','Un peu à l\'échauffement'],['reg','Régulièrement'],['deteste','Je déteste ça']]},` |
| `coach.js` | 29 | `_coachFreeLimit` | `q` | `{id:'pain', q:'Des zones sensibles / anciennes blessures à ménager ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['aucune','Aucune'],['epaules','Épaules'],['dos','Dos / lombaires'],['genoux'` |
| `coach.js` | 30 | `_coachFreeLimit` | `q` | `{id:'energy', q:'En ce moment, ton énergie et ton sommeil, c\'est plutôt…', t:'single', opts:[['top','Au top'],['ok','Correct'],['fatigue','Souvent fatigué'],['dors_mal','Je dors mal']]},` |
| `coach.js` | 31 | `_coachFreeLimit` | `q` | `{id:'goalfeel', q:'Ton objectif du moment, en une idée ?', t:'single', opts:[['muscle','Prendre du muscle'],['force','Devenir plus fort'],['secher','Perdre du gras / sécher'],['forme','Me remettre en ` |
| `coach.js` | 32 | `_coachFreeLimit` | `q` | `{id:'diet0', q:'Ton alimentation en ce moment ?', t:'single', opts:[['propre','Plutôt propre / je fais attention'],['moyen','Ça dépend des jours'],['relax','Je mange ce que je veux'],['nsp','Je ne sai` |
| `coach.js` | 33 | `_coachFreeLimit` | `q` | `{id:'tone', q:'Comment tu veux que Milo te parle ?', t:'single', opts:[['cash','Cash et direct'],['motiv','Motivant et encourageant'],['tech','Technique et précis'],['fun','Détendu, avec de l\'humour'` |
| `coach.js` | 36 | `_coachFreeLimit` | `q` | `{id:'job', q:'Ton quotidien (hors sport) est plutôt…', t:'single', opts:[['bureau','Sédentaire / bureau'],['debout','Debout, peu de déplacements'],['actif','Actif, en mouvement (serveuse, infirmier…)'` |
| `coach.js` | 37 | `_coachFreeLimit` | `q` | `{id:'stress', q:'Ton niveau de stress général ?', t:'single', opts:[['bas','Faible'],['moy','Modéré'],['haut','Élevé']]},` |
| `coach.js` | 38 | `_coachFreeLimit` | `q` | `{id:'sleep', q:'Tu dors combien d\'heures par nuit en moyenne ?', t:'single', opts:[['5','Moins de 6 h'],['7','6 à 7 h'],['8','7 à 8 h'],['9','Plus de 8 h']]},` |
| `coach.js` | 39 | `_coachFreeLimit` | `q` | `{id:'prot', q:'Tu atteins tes protéines la plupart du temps ?', t:'single', opts:[['oui','Oui, presque toujours'],['souvent','Souvent'],['rare','Rarement'],['nsp','Je ne sais pas']]},` |
| `coach.js` | 40 | `_coachFreeLimit` | `q` | `{id:'split', q:'Ta façon de découper tes séances préférée ?', t:'single', opts:[['full','Full body (tout le corps)'],['hb','Haut / Bas'],['ppl','Push / Pull / Legs'],['split','Un muscle par séance'],[` |
| `coach.js` | 41 | `_coachFreeLimit` | `q` | `{id:'deadline', q:'Tu as une échéance précise ?', t:'single', opts:[['compet','Oui, une compétition'],['event','Oui, un événement (vacances, photo…)'],['non','Non, sur le long terme']]},` |
| `coach.js` | 42 | `_coachFreeLimit` | `q` | `{id:'progr', q:'Tu as déjà suivi un vrai programme structuré ?', t:'single', opts:[['ok','Oui, et ça a marché'],['abandon','Oui, mais abandonné'],['jamais','Jamais vraiment']]},` |
| `coach.js` | 43 | `_coachFreeLimit` | `q` | `{id:'block', q:'Là où tu bloques le plus ?', t:'single', opts:[['regul','La régularité'],['tech','La technique'],['recup','La récup / le sommeil'],['nut','La nutrition'],['plateau','Un plateau de forc` |
| `coach.js` | 44 | `_coachFreeLimit` | `q` | `{id:'supp', q:'Tu prends des compléments ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['aucun','Aucun'],['whey','Protéine / whey'],['crea','Créatine'],['prewk','Pré-workout'],['omega','Omég` |
| `coach.js` | 45 | `_coachFreeLimit` | `q` | `{id:'equip', q:'Matériel dispo (en plus des machines) ?', t:'multi', hint:'Plusieurs choix possibles.', opts:[['barre','Barre olympique'],['halteres','Haltères lourds'],['poulies','Poulies'],['elastiq` |
| `coach.js` | 46 | `_coachFreeLimit` | `q` | `{id:'like', q:'Les exercices que tu ADORES (facultatif)', t:'text', hint:'Dis à Milo ce que tu préfères — il en tiendra compte.'},` |
| `coach.js` | 47 | `_coachFreeLimit` | `q` | `{id:'hate', q:'Les exercices que tu ÉVITES ou détestes (facultatif)', t:'text', hint:'Il évitera de te les imposer.'},` |
| `coach.js` | 51 | `_cqLabel` | `q` | `const q=quiz.find(x=>x.id===qid); if(!q\|\|!q.opts)return val;` |
| `coach.js` | 920 | `_coachQuizContext` | `q` | `quiz.forEach(q=>{` |
| `coach.js` | 954 | `_applyQuizToProfile` | `q` | `quiz.forEach(q=>{` |
| `coach.js` | 975 | `_nextUnanswered` | `q` | `return quiz.find(q=>!Object.prototype.hasOwnProperty.call(a,q.id))\|\|null;` |
| `coach.js` | 982 | `_proAnsweredCount` | `q` | `return COACH_QUIZ_PRO.filter(q=>Object.prototype.hasOwnProperty.call(a,q.id)).length;` |
| `coach.js` | 1077 | `openWeeklyProQuestion` | `q` | `const q=_nextProUnanswered(); if(!q){ _renderCoachQuizCard(); return; }` |
| `coach.js` | 1091 | `_cqPrefillFromProfile` | `q` | `_cqQuiz().forEach(q=>{` |
| `coach.js` | 1101 | `_renderCoachQuizStep` | `q` | `const q=quiz[_cqIdx];` |
| `coach.js` | 1170 | `_finishCoachQuiz` | `q` | `if(_cqSingle){ const q=_cqQuiz()[_cqIdx]; if(q&&_cqAns[q.id]===undefined)_cqAns[q.id]=''; }` |
| `coach.js` | 1174 | `_finishCoachQuiz` | `q` | `done: COACH_QUIZ_PRO.every(q=>Object.prototype.hasOwnProperty.call(_cqAns,q.id)),` |
| `coach.js` | 3066 | `buildCoachContext` | `kcal` | `const bmr = _bd ? _bd.kcal : (calcBMR ? calcBMR() : '—');` |
| `coach.js` | 4185 | `buildCoachContext` | `foodLog` | `const fl = Array.isArray(S.foodLog) ? S.foodLog : [];` |
| `coach.js` | 4190 | `buildCoachContext` | `kcal` | `const j = jours[d] \|\| (jours[d] = {kcal:0,prot:0,carbs:0,fat:0,n:0});` |
| `coach.js` | 4945 | `_gardienStatsRendu` | `u` | `(d.users\|\|[]).forEach(u=>{` |
| `coach.js` | 5028 | `_miloRaterEnvoyer` | `q` | `let q='';` |
| `coach.js` | 5031 | `_miloRaterEnvoyer` | `q` | `if(prec && prec.classList.contains('msg-user')) q=String(prec.innerText\|\|'').slice(0,600);` |
| `coach.js` | 5809 | `_dbfRattraper` | `q` | `const q=Number(s.ts)\|\|Number(s.id)\|\|0;` |
| `coach.js` | 5811 | `_dbfRattraper` | `q` | `if(!cible \|\| q>cible.q) cible={id:sid, q:q};` |
| `coach.js` | 6324 | `_vcApplyPersona` | `foodLog` | `S.foodLog=a.foodLog\|\|[];` |
| `coach.js` | 7935 | `closeDrawer` | `proteins` | `proteins: {` |
| `log.js` | 296 | `_typeSeanceHtml` | `q` | `+(function(){ const r=nb(c.reps), q=nb(c.repos);` |
| `log.js` | 2514 | `_movPattern` | `q` | `function _movPattern(name){ const q=' '+_movNorm(name)+' ';` |
| `log.js` | 2555 | `_movResist` | `q` | `function _movResist(name){ const q=_normEx(name);` |
| `log.js` | 2578 | `_exRole` | `q` | `const q=_normEx(name\|\|'');` |
| `log.js` | 2884 | `_matchExercise` | `q` | `const q=_normEx(name); if(!q)return{match:null,score:0,confidence:0,tier:'new',via:'vide'};` |
| `log.js` | 4239 | `finishWorkout` | `calories` | `sess.calories=calData.total;sess.calData=calData;` |
| `log.js` | 5403 | `_exUsageMap` | `u` | `const u={};` |
| `log.js` | 5418 | `filterEx` | `q` | `const q=(document.getElementById('ex-search').value\|\|'').toLowerCase().trim();` |
| `setup.js` | 396 | `exportHistoCsv` | `q` | `const q=v=>{ const t=String(v==null?'':v);` |
| `setup.js` | 446 | `exportNutritionCsv` | `quantite` | `quantite: (e && e.q != null) ? e.q : '', unite: e && e.u \|\| '',` |
| `setup.js` | 447 | `exportNutritionCsv` | `kcal` | `kcal: (e && e.kcal != null) ? e.kcal : '',` |
| `setup.js` | 448 | `exportNutritionCsv` | `prot` | `proteines_g: (e && e.prot != null) ? e.prot : '',` |
| `setup.js` | 449 | `exportNutritionCsv` | `carbs` | `glucides_g: (e && e.carbs != null) ? e.carbs : '',` |
| `setup.js` | 450 | `exportNutritionCsv` | `fat` | `lipides_g: (e && e.fat != null) ? e.fat : '',` |
| `setup.js` | 971 | `_cloudSync` | `foodLog` | `foodLog:(S.foodLog\|\|[]).slice(-8000), // ~journal nutrition sur plusieurs annees (entrees minuscules)` |
| `setup.js` | 1044 | `openSessDetail` | `calories` | `n'apparaissait nulle part dans l'historique. Michel, en relevant ses calories : *« pas` |
| `setup.js` | 1156 | `_renderHealthInbox` | `kcal` | `const kcal=a.kcal?` · ${a.kcal} kcal`:'';` |
| `setup.js` | 1458 | `saveSessEdits` | `calories` | `_sessEdits.calories=calData.total;` |
| `setup.js` | 1676 | `setHandedness` | `prot` | `prot:'Protanopie — cécité au rouge (1% des hommes). Rouge → orange-brun, vert → bleu.',` |
| `setup.js` | 1697 | `setColorblind` | `prot` | `const label={deut:'Deutéranopie',prot:'Protanopie',trit:'Tritanopie'}[type];` |
| `setup.js` | 3265 | `_applyRestoreData` | `foodLog` | `try{if(Array.isArray(d.foodLog)&&d.foodLog.length>=(S.foodLog\|\|[]).length)S.foodLog=d.foodLog;}catch(e){console.warn('[FT restore] foodLog',e);}` |
| `setup.js` | 3879 | `_recalerAnciennesSeances` | `calories` | `s.calories=neuf; s.calSource='recale';` |
| `setup.js` | 3904 | `_annulerRecalageCalories` | `calories` | `if(s.caloriesAvant===null) delete s.calories; else s.calories=s.caloriesAvant;` |
| `tracking.js` | 991 | `deleteWeighEntry` | `u` | `{k:'weight',l:'Poids',u:'kg',good:'down',req:true},` |
| `tracking.js` | 992 | `deleteWeighEntry` | `u` | `{k:'bf',l:'Graisse',u:'%',good:'down'},` |
| `tracking.js` | 993 | `deleteWeighEntry` | `u` | `{k:'fatMass',l:'Masse grasse',u:'kg',good:'down'},` |
| `tracking.js` | 994 | `deleteWeighEntry` | `u` | `{k:'muscle',l:'Muscle',u:'kg',good:'up'},` |
| `tracking.js` | 995 | `deleteWeighEntry` | `u` | `{k:'skMuscle',l:'Muscle squel.',u:'kg',good:'up'},` |
| `tracking.js` | 996 | `deleteWeighEntry` | `u` | `{k:'bone',l:'Masse osseuse',u:'kg',good:'up'},` |
| `tracking.js` | 997 | `deleteWeighEntry` | `u` | `{k:'water',l:'Eau',u:'kg',good:'up'},` |
| `tracking.js` | 998 | `deleteWeighEntry` | `u` | `{k:'protein',l:'Protéine',u:'kg',good:'up'},` |
| `tracking.js` | 999 | `deleteWeighEntry` | `u` | `{k:'visceral',l:'Graisse viscérale',u:'',good:'down'},` |
| `tracking.js` | 1000 | `deleteWeighEntry` | `u` | `{k:'bmr',l:'Métabolisme base',u:'kcal',good:'up'},` |
| `tracking.js` | 1001 | `deleteWeighEntry` | `u` | `{k:'metaAge',l:'Âge corporel',u:'ans',good:'down'},` |
| `tracking.js` | 1002 | `deleteWeighEntry` | `u` | `{k:'imc',l:'IMC',u:'',good:'down'},` |
| `tracking.js` | 1003 | `deleteWeighEntry` | `u` | `{k:'bodyScore',l:'Score corporel',u:'/100',good:'up'},` |
| `tracking.js` | 1004 | `deleteWeighEntry` | `u` | `{k:'leanMass',l:'Masse maigre',u:'kg',good:'up'},` |
| `tracking.js` | 1005 | `deleteWeighEntry` | `u` | `{k:'subFat',l:'Graisse sous-cutanée',u:'%',good:'down'},` |
| `tracking.js` | 1006 | `deleteWeighEntry` | `u` | `{k:'smi',l:'Indice muscle squel.',u:'kg/m²',good:'up'}` |
| `tracking.js` | 1010 | `deleteWeighEntry` | `u` | `{k:'armMuscleL',l:'Muscle bras G',u:'kg'},{k:'armMuscleR',l:'Muscle bras D',u:'kg'},` |
| `tracking.js` | 1011 | `deleteWeighEntry` | `u` | `{k:'trunkMuscle',l:'Muscle tronc',u:'kg'},` |
| `tracking.js` | 1012 | `deleteWeighEntry` | `u` | `{k:'legMuscleL',l:'Muscle jambe G',u:'kg'},{k:'legMuscleR',l:'Muscle jambe D',u:'kg'},` |
| `tracking.js` | 1013 | `deleteWeighEntry` | `u` | `{k:'armFatL',l:'Graisse bras G',u:'kg'},{k:'armFatR',l:'Graisse bras D',u:'kg'},` |
| `tracking.js` | 1014 | `deleteWeighEntry` | `u` | `{k:'trunkFat',l:'Graisse tronc',u:'kg'},` |
| `tracking.js` | 1015 | `deleteWeighEntry` | `u` | `{k:'legFatL',l:'Graisse jambe G',u:'kg'},{k:'legFatR',l:'Graisse jambe D',u:'kg'}` |
| `tracking.js` | 1056 | `renderBodyScanCard` | `u` | `<div style="font-size:15px;font-weight:800;color:var(--t1);white-space:nowrap;">${v}<span style="font-size:9px;color:var(--t3);font-weight:600;">${f.u?' '+f.u:''}</span>${ev}</div>` |
| `tracking.js` | 1118 | `_csvSplit` | `q` | `const out=[]; let cur='', q=false;` |
| `tracking.js` | 1121 | `_csvSplit` | `q` | `if(q){ if(c==='"'){ if(line[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }` |
| `tracking.js` | 1122 | `_csvSplit` | `q` | `else { if(c==='"')q=true; else if(c===','){out.push(cur);cur='';} else cur+=c; }` |
| `tracking.js` | 1380 | `_resizeReport` | `protein` | `bone:[0.3,8], water:[10,120], protein:[1,40], visceral:[1,60], bmr:[600,4500],` |
| `tracking.js` | 2248 | `_profileGapSpecs` | `q` | `const q=(typeof COACH_QUIZ!=='undefined')?COACH_QUIZ:[];` |
| `tracking.js` | 2251 | `_profileGapSpecs` | `q` | `{field:'place', ask:"Pour mieux te conseiller — où t'entraînes-tu le plus souvent ?", q:byId('place')},` |
| `tracking.js` | 2252 | `_profileGapSpecs` | `q` | `{field:'freq',  ask:"Combien de séances par semaine tu tiens, en général ?",          q:byId('freq')},` |
| `tracking.js` | 2253 | `_profileGapSpecs` | `q` | `{field:'time',  ask:"Et une séance, ça dure combien de temps chez toi ?",              q:byId('time')},` |
| `tracking.js` | 3283 | `renderLogFinish` | `kcal` | `const kcal=(typeof calcCardioKcalTotal==='function')?calcCardioKcalTotal():0;` |
| `tracking.js` | 3424 | `_nuitsRecentes` | `kcal` | `⛔ BORNÉ À 500 kcal : un GPS qui déraille, un trajet en voiture compté en pas, une journée de` |
| `tracking.js` | 3460 | `_pasEcart` | `kcal` | `kcal: surplus>=PAS_SEUIL` |
| `tracking.js` | 4108 | `updateSleepQualBtns` | `q` | `[1,2,3,4].forEach(q=>{const el=document.getElementById('sq-'+q);if(el)el.classList.toggle('active',q===_sleepQual);});` |
| `Code.js` | 620 | `doGet` | `q` | `var q = {};` |
| `Code.js` | 621 | `doGet` | `q` | `try { q = JSON.parse(sp.getProperty('ai_quota') \|\| '{}'); } catch(e2) { q = {}; }` |
| `Code.js` | 1018 | `_aiQuotaBlock_` | `q` | `var q = raw ? JSON.parse(raw) : null;` |
| `Code.js` | 1019 | `_aiQuotaBlock_` | `q` | `if (!q \|\| q.date !== today) q = { date: today, global: 0, byEmail: {} };` |
| `Code.js` | 1094 | `_aiUsageLire_` | `u` | `var u = JSON.parse(raw);` |
| `Code.js` | 1124 | `_aiUsageAdd_` | `u` | `var u = raw ? JSON.parse(raw) : null;` |
| `Code.js` | 1125 | `_aiUsageAdd_` | `u` | `if (!u \|\| u.date !== today) u = { date: today, totals: {inTok:0,outTok:0,cacheW:0,cacheR:0,calls:0}, byAction: {}, byModel: {} };` |
| `Code.js` | 1148 | `_dailyCounterBlock_` | `q` | `var q = raw ? JSON.parse(raw) : null;` |
| `Code.js` | 1149 | `_dailyCounterBlock_` | `q` | `if (!q \|\| q.date !== today) q = { date: today, count: 0 };` |
| `Code.js` | 1524 | `handleSaveProfile_` | `foodLog` | `if (body.foodLog       !== undefined) profile.foodLog       = _pa_(body.foodLog,       profile.foodLog);` |
| `Code.js` | 2010 | `handlePushHealth_` | `kcal` | `kcal:  Math.round(_q(r.kcal != null ? r.kcal : r.activeEnergyBurned) \|\| 0) \|\| null,` |
| `Code.js` | 2580 | `handleImportMealPlan_` | `kcal` | `m.kcal  = parseInt(m.kcal)  \|\| 0;` |
| `Code.js` | 2581 | `handleImportMealPlan_` | `prot` | `m.prot  = parseInt(m.prot)  \|\| 0;` |
| `Code.js` | 2582 | `handleImportMealPlan_` | `carbs` | `m.carbs = parseInt(m.carbs) \|\| 0;` |
| `Code.js` | 2583 | `handleImportMealPlan_` | `fat` | `m.fat   = parseInt(m.fat)   \|\| 0;` |
| `Code.js` | 2611 | `handleEstimateFood_` | `kcal` | `+ '- kcal = calories totales (nombre entier).\n'` |
| `Code.js` | 2612 | `handleEstimateFood_` | `fat` | `+ '- prot, carbs, fat = grammes totaux de protéines, glucides, lipides (nombres entiers).\n'` |
| `Code.js` | 2649 | `handleEstimateFood_` | `kcal` | `kcal:  Math.max(0, parseInt(d.kcal)  \|\| 0),` |
| `Code.js` | 2650 | `handleEstimateFood_` | `prot` | `prot:  Math.max(0, parseInt(d.prot)  \|\| 0),` |
| `Code.js` | 2651 | `handleEstimateFood_` | `carbs` | `carbs: Math.max(0, parseInt(d.carbs) \|\| 0),` |
| `Code.js` | 2652 | `handleEstimateFood_` | `fat` | `fat:   Math.max(0, parseInt(d.fat)   \|\| 0)` |
| `Code.js` | 2675 | `handleFoodLabel_` | `serving` | `+ '- serving = taille d\'une portion en grammes si indiquee, sinon 0.\n'` |
| `Code.js` | 2704 | `handleFoodLabel_` | `serving` | `serving: Math.max(0, parseFloat(d.serving)\|\|0)` |
| `Code.js` | 2910 | `handleImportBodyScan_` | `protein` | `+ '- protein = protéines, en kg (⚠️ jamais un %)\n'` |
| `worker.js` | 260 | `bodyScan` | `protein` | `+ '- protein = protéines, en kg (jamais un %)\n'` |
| `worker.js` | 296 | `foodLabel` | `serving` | `+ '- serving = taille d\'une portion en grammes si indiquee, sinon 0.\n'` |
| `worker.js` | 312 | `foodLabel` | `serving` | `serving: Math.max(0, parseFloat(d.serving) \|\| 0) };` |
| `worker.js` | 800 | `estimateFood` | `kcal` | `+ 'Règles :\n- kcal = calories totales (nombre entier).\n- prot, carbs, fat = grammes totaux de protéines, glucides, lipides (nombres entiers).\n'` |
| `worker.js` | 817 | `estimateFood` | `kcal` | `kcal: Math.max(0, parseInt(d.kcal) \|\| 0),` |
| `worker.js` | 818 | `estimateFood` | `prot` | `prot: Math.max(0, parseInt(d.prot) \|\| 0),` |
| `worker.js` | 819 | `estimateFood` | `carbs` | `carbs: Math.max(0, parseInt(d.carbs) \|\| 0),` |
| `worker.js` | 820 | `estimateFood` | `fat` | `fat: Math.max(0, parseInt(d.fat) \|\| 0),` |
| `worker.js` | 855 | `importMealPlan` | `kcal` | `m.kcal = parseInt(m.kcal) \|\| 0; m.prot = parseInt(m.prot) \|\| 0; m.carbs = parseInt(m.carbs) \|\| 0; m.fat = parseInt(m.fat) \|\| 0;` |