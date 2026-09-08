# 04 — CODE SOURCE (verbatim)

> ⛔ **Extrait du code réellement servi**, sans reformulation, sans coupe, sans
> commentaire ajouté. Généré par `python3 tools/audit-nutrition.py`.

> ⚠️ Les commentaires du code font partie du code : ils sont conservés tels quels.
> Beaucoup datent d'un bug précis et nomment sa version (`ft-vNNN`).

✅ **Les 16 fonctions demandées existent toutes.** Aucune absence à signaler.

---

## `_provFood`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1163 |
| longueur | 67 lignes |
| appelle directement | `numFR` |
| globales LUES | `_afRef`, `_afSrc` |
| globales MODIFIÉES | — |

```js
function _provFood(vals){
  const p={v:FOOD_LOG_V, saisie:'manuel', origine:'utilisateur',
           q:null, u:null, etat:null, sourceId:null, per100:null, modifie:false};
  if(_afSrc){
    p.saisie=_afSrc.saisie||'manuel';
    p.origine=_afSrc.origine||'utilisateur';
    if(_afSrc.sourceId)p.sourceId=String(_afSrc.sourceId).slice(0,32);
    if(_afSrc.per100)p.per100=_afSrc.per100;
    /* ⚖️ L'ÉTAT DESCEND ENFIN JUSQU'À LA DONNÉE (19/08/2026). Le champ existait depuis la
       brique 0 (ft-v907) et valait TOUJOURS `null` : on savait que les valeurs d'Open Food Facts
       sont « telles que vendues », c'était écrit en commentaire — et ça n'atteignait pas
       l'entrée enregistrée. R4, dans le fichier qui documente R4. */
    if(_afSrc.etat)p.etat=_afSrc.etat;
    /* ⚠️⚠️ ET LE MÊME OUBLI A FAILLI SE REFAIRE ICI, LE 23/08/2026 — dans la fonction qui
       porte déjà le commentaire ci-dessus. `_provFood` construit une LISTE BLANCHE : un champ
       posé par `_afSetSrc` et non recopié ici **n'atteint jamais l'entrée enregistrée**, sans
       erreur, sans test rouge. Le drapeau « code-barres douteux » était dans la provenance en
       mémoire et s'arrêtait à cette ligne. *C'est R4 dans le fichier qui documente R4, deux
       fois au même endroit.*
       ⛔ Posé SEULEMENT s'il est vrai : un `false` recopié partout annoncerait une
       vérification qui n'a pas eu lieu sur les chemins décodés par ZXing. */
    if(_afSrc.codeDouteux===true)p.codeDouteux=true;
    /* ⚠️⚠️ TROISIÈME FOIS AU MÊME ENDROIT (03/09/2026, ft-v1114) — et l'avertissement est écrit
       en majuscules juste au-dessus. J'ai posé `doute` et `kcalDerivee` dans `_afSetSrc`, écrit
       en commentaire « le doute descend jusqu'à la donnée (R4) »… et la ligne enregistrée
       portait `doute: null`, parce que cette liste blanche ne les recopiait pas.
       👉 ***J'ai écrit la règle juste au-dessus de l'endroit où je venais de l'enfreindre.***
       C'est la mesure de l'entrée sauvegardée qui l'a vu, pas la relecture.
       ⛔ Pourquoi ces deux champs comptent : un chiffre signalé comme douteux le jour où on l'a
       pris doit rester signalé dans trois mois, sinon l'avertissement n'a servi qu'une seconde.
       Et une kcal DÉRIVÉE des macros ne doit jamais se relire comme une valeur publiée (R32). */
    if(_afSrc.doute)p.doute=String(_afSrc.doute).slice(0,90);
    if(_afSrc.kcalDerivee===true)p.kcalDerivee=true;
    const a=_afSrc.attendu;
    if(a&&vals) p.modifie=['kcal','prot','carbs','fat'].some(k=>(+a[k]||0)!==(+vals[k]||0));
  }
  // La quantité n'existe que si le champ grammes est réellement affiché (scan / étiquette).
  const row=document.getElementById('af-bc-row');
  const g=numFR((document.getElementById('af-bc-grams')||{}).value)||0;
  if(row&&row.style.display!=='none'&&g>0){ p.q=g; p.u='g'; }
  /* ⚖️ LE POIDS DÉCLARÉ À LA MAIN DESCEND JUSQU'À LA DONNÉE (ft-v1051) — R4, et c'est LA
     moitié qui manquait : sans ces lignes, la personne voit son poids à l'écran, les 4 valeurs
     se recalculent… et rien n'est enregistré. *L'app aurait su, et n'aurait rien retenu.*
     ⛔ CE QU'ON GARDE EST LE POUR-100 g, PAS LA BOÎTE. Michel : *« tu prends la ratatouille, il
     y a différentes boîtes de différent poids »*. Le pour-100 g est stable et calibre l'aliment
     pour toujours ; `q` n'est qu'un pré-remplissage de confort, qu'on retape à chaque fois.
     ⭐ C'est ce qui rebranche la machinerie de ft-v1042 : à la reprise depuis « Mes aliments »,
     l'aliment aura son `per100` et le champ en grammes s'ouvrira tout seul.
     ⛔ On n'écrase JAMAIS un `per100` déjà connu (scan, CIQUAL) : une déclaration à la main ne
     passe pas devant une valeur mesurée (R32 — mesuré > estimé > déclaré). */
  if(!p.per100 && typeof _afRef==='object' && _afRef && _afRef.u==='g' && _afRef.q>0 && vals){
    /* ⚠️ ON DIVISE PAR LA QUANTITÉ AFFICHÉE, PAS PAR `_afRef.q` — et la nuance coûte cher.
       `_afRef.q` est la quantité de RÉFÉRENCE (celle déclarée au départ) ; `_afRef.base` sont
       les valeurs qui vont avec. Mais si la personne a ensuite tapé 80 après avoir déclaré 40,
       les champs affichent le DOUBLE. Diviser ces valeurs-là par 40 donnerait un pour-100 g
       deux fois trop gros. *Les valeurs affichées et la quantité affichée vont toujours
       ensemble : c'est le seul couple sur lequel on peut diviser sans se tromper.* */
    const q=numFR((document.getElementById('af-prop')||{}).value)||_afRef.q;
    if(q>0){
      const f=100/q;
      p.q=q; p.u='g';
      p.per100={kcal:Math.round((+vals.kcal||0)*f), prot:Math.round((+vals.prot||0)*f),
                carbs:Math.round((+vals.carbs||0)*f), fat:Math.round((+vals.fat||0)*f)};
    }
  }
  return p;
}
```

---

## `_offRemplirFormulaire`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1512 |
| longueur | 42 lignes |
| appelle directement | `_bcQsrc`, `_bcProposerDerniere`, `_offPoidsPaquet`, `_bcProposerPaquet`, `_bcApplyGrams`, `_afSetSrc`, `_afLuFormulaire`, `_afNoteEtat` |
| globales LUES | `S`, `_bcNutr` |
| globales MODIFIÉES | `_bcPaquetG` |

```js
function _offRemplirFormulaire(p, sourceId, saisie, codeDouteux, origine){
  // Quantité par défaut : portion si connue, sinon 100 g
  const serv=parseFloat(p.serving_quantity)||0;
  const g=serv>0?serv:100;
  const gramsEl=document.getElementById('af-bc-grams');if(gramsEl)gramsEl.value=g;
  /* ⛔ LE NOMBRE GARDE SA SOURCE ÉCRITE À CÔTÉ (ft-v1105) — et pour un produit de marque, la
     source est l'ENSEIGNE, pas « la fiche produit » : c'est elle qui publie ce poids. */
  _bcQsrc(serv, (origine==='marque' && _bcNutr && _bcNutr.name && _bcNutr.name.indexOf(' · ')>0)
                  ? _bcNutr.name.split(' · ').pop() : 'la fiche produit');
  /* ⛔ Un scan NEUF n'a pas de « dernière fois » : la pastille d'un aliment précédent doit
     disparaître, sinon elle proposerait le poids de quelqu'un d'autre que le produit affiché. */
  if(typeof _bcProposerDerniere==='function') _bcProposerDerniere(0);
  /* 📦 ft-v1174 — LE PROPRIÉTAIRE UNIQUE DU POIDS DE PAQUET (R2). Tous les remplissages passent
     ici, y compris ceux qui n'ont PAS de produit OFF (CIQUAL, marque, étiquette recopiée) : ils
     posent donc 0, et la pastille du produit précédent ne peut pas survivre. */
  _bcPaquetG = (typeof _offPoidsPaquet==='function') ? _offPoidsPaquet(p&&p.quantity) : 0;
  if(typeof _bcProposerPaquet==='function') _bcProposerPaquet();
  const nameEl=document.getElementById('af-bc-name');if(nameEl)nameEl.textContent=_bcNutr.name+' · '+_bcNutr.kcal100+' kcal/100g';
  const row=document.getElementById('af-bc-row');if(row)row.style.display='block';
  document.getElementById('af-desc').value=_bcNutr.name;
  _bcApplyGrams();
  // ⚠️ Les valeurs d'Open Food Facts sont « TELLES QUE VENDUES » : un paquet de pâtes scanné
  //    donne les valeurs SÈCHES. On enregistre donc `per100` et l'`origine` — c'est ce qui
  //    permettra, quand la base d'aliments existera, de rattraper l'état sans re-demander.
  /* ⚠️ `codeDouteux` N'EST POSÉ QUE S'IL EST VRAI — on n'écrit pas `false` partout. Un champ
     absent veut dire « rien à signaler » ; le poser à false sur des millions d'entrées
     donnerait l'illusion d'une vérification qui n'a pas eu lieu sur les chemins décodés. */
  _afSetSrc({saisie:saisie||'scan',origine:origine||'off',sourceId:sourceId?String(sourceId).slice(0,32):null,
    etat:'tel-que-vendu',
    ...(codeDouteux?{codeDouteux:true}:{}),
    per100:{kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
    attendu:_afLuFormulaire()});
  _afNoteEtat(_bcNutr.name);
  /* Score santé indicatif (Nutri-Score + NOVA + additifs) — module food-health.js.
     ⚠️ Seulement pour un VRAI produit Open Food Facts : un aliment brut CIQUAL n'a ni
     Nutri-Score ni groupe NOVA, et afficher une carte vide laisserait croire à une absence
     de score alors qu'il n'y en a simplement pas pour une banane. */
  const hc=document.getElementById('af-health-card');
  if(p && p.nutriments && Object.keys(p.nutriments).length){
    try{ if(window.FoodHealth)FoodHealth.renderCard(p,'#af-health-card'); }catch(e){}
  } else if(hc){ hc.innerHTML=''; }
}
```

---

## `_qtyRescale`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1658 |
| longueur | 20 lignes |
| appelle directement | `numFR` |
| globales LUES | — |
| globales MODIFIÉES | — |

```js
function _qtyRescale(pre, base, ref, saisie){
  if(!(ref>0)) return null;
  const v=numFR(saisie);
  /* ⛔ Champ vidé ou illisible → facteur 1, donc les valeurs de la RÉFÉRENCE. Jamais 0. */
  const f=(v>0? v : ref)/ref;
  const P=(k,x)=>{const el=document.getElementById(pre+'-'+k); if(el) el.value=Math.round(x);};
  P('kcal',(base.kcal||0)*f); P('prot',(base.prot||0)*f);
  P('carbs',(base.carbs||0)*f); P('fat',(base.fat||0)*f);
  /* ⭐ Le contrôle de cohérence suit TOUJOURS : les macros viennent de changer, donc l'écart
     kcal/macros a pu apparaître ou disparaître. Il ne suivait que sur 2 routes sur 4. */
  const coh=(pre==='af')?_afCoherence:_efCoherence;
  if(typeof coh==='function') coh();
  /* ⛔⛔ ON REND LA QUANTITÉ **TAPÉE**, PAS LE REPLI — et la nuance est tout l'arbitrage de
     ft-v966, qu'un témoin a rattrapé ici. Les 4 VALEURS peuvent revenir à la référence : elles
     doivent bien correspondre à quelque chose, et « 100 g » est écrit juste au-dessus. Mais la
     ligne verte, elle, dit « pour **TES** n g » — annoncer un total pour une quantité que
     personne n'a tapée serait le voisinage muet retourné dans l'autre sens.
     👉 *Les valeurs se replient, la phrase se tait.* */
  return v>0? v : 0;
}
```

---

## `_bcApplyGrams`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 1678 |
| longueur | 7 lignes |
| appelle directement | `_qtyRescale`, `_bcMontrerTotal` |
| globales LUES | `_bcNutr` |
| globales MODIFIÉES | — |

```js
function _bcApplyGrams(){
  if(!_bcNutr)return;
  /* ⭐ UN POUR-100 G EST UNE RÉFÉRENCE DE 100 — même moteur que toutes les autres routes. */
  const g=_qtyRescale('af', {kcal:_bcNutr.kcal100,prot:_bcNutr.prot100,carbs:_bcNutr.carbs100,fat:_bcNutr.fat100},
                      100, (document.getElementById('af-bc-grams')||{}).value);
  _bcMontrerTotal(g||0);
}
```

---

## `quickFillFood`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 2384 |
| longueur | 46 lignes |
| appelle directement | `_afSetSrc`, `_afLuFormulaire`, `_bcProposerDerniere`, `_bcMontrerTotal`, `_bcQsrc`, `_afMajAncre`, `_afNoteEtat`, `toast` |
| globales LUES | `_afQuickItems` |
| globales MODIFIÉES | `_bcNutr` |

```js
function quickFillFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
  set('af-desc',it.name); set('af-kcal',it.kcal||0); set('af-prot',it.prot||0); set('af-carbs',it.carbs||0); set('af-fat',it.fat||0);
  /* La provenance dit ce que c'est : une REPRISE, ni une mesure ni une saisie fraîche. */
  if(typeof _afSetSrc==='function') _afSetSrc({saisie:'liste', origine:it.origine||'reprise',
    sourceId:it.sourceId||null, etat:it.etat||null, per100:it.per100||null,
    attendu:(typeof _afLuFormulaire==='function')?_afLuFormulaire():null});
  const row=document.getElementById('af-bc-row');
  const P=it.per100;
  if(P && (+P.kcal>0 || +P.prot>0 || +P.carbs>0 || +P.fat>0)){
    _bcNutr={ name:(it.name||'').slice(0,60), kcal100:+P.kcal||0,
              prot100:+P.prot||0, carbs100:+P.carbs||0, fat100:+P.fat||0 };
    const g=document.getElementById('af-bc-grams');
    /* ⚖️ ft-v1051 : PROPOSÉE, plus imposée — le champ reste vide, la pastille offre le rappel. */
    if(g) g.value='';
    if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+it.q>0 && (!it.u||it.u==='g')) ? +it.q : 0);
    const nm=document.getElementById('af-bc-name');
    if(nm) nm.textContent=_bcNutr.name+' · '+Math.round(_bcNutr.kcal100)+' kcal/100g (ta dernière saisie)';
    if(row) row.style.display='block';
    /* ⛔⛔ LA LIGNE VERTE DU TOTAL EST REMISE À JOUR — SINON ELLE PARLE DE L'ALIMENT PRÉCÉDENT
       (ft-v1042, vu à la capture). Le champ affichait « 150 » pendant que la ligne disait
       « pour tes 200 g : 700 kcal » : le total d'un aliment repris juste avant. *Aucun des deux
       nombres n'est faux — c'est leur voisinage muet qui trompe*, exactement le défaut que
       ft-v966 avait corrigé un cran plus haut, et qui revenait par un autre chemin.
       ⛔ ON NE L'AFFICHE QUE SI LA QUANTITÉ EST RÉELLEMENT CONNUE (R29) : sans `q`, le champ
       retombe à 100 par défaut, et annoncer « pour tes 100 g » serait inventer une portion. */
    /* ⛔⛔ AUCUN TOTAL TANT QUE LA QUANTITÉ N'EST PAS CHOISIE (ft-v1051). Vu à la mesure : le
       champ était vide et la ligne verte annonçait déjà « → pour tes 250 g : 150 kcal ». Elle
       décrivait la PROPOSITION, pas une décision — c'est-à-dire le « voisinage muet » de
       ft-v966 et ft-v1042, retrouvé une 3ᵉ fois par un chemin neuf. *Un total qui devance le
       choix de la personne se lit comme un fait sur son repas.* Il réapparaît dès qu'elle tape
       un poids ou tape la pastille (`_bcApplyGrams` le rappelle). */
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);
  }else{
    if(row) row.style.display='none';
    _bcQsrc(null);
    _bcNutr=null;
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);   // ⛔ pas de total orphelin
  }
  /* Se tait tout seul si un pour-100 g existe (`if(_bcNutr) → cacher`) : R2, un seul réglage
     de quantité visible à la fois. */
  if(typeof _afMajAncre==='function') _afMajAncre(true);   // reprise d'un aliment : la source change
  if(typeof _afNoteEtat==='function') _afNoteEtat(it.name||'');
  toast('Pré-rempli — ajuste la quantité si besoin, puis « Ajouter au journal » ✅','info');
}
```

---

## `quickAddFood`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 2430 |
| longueur | 16 lignes |
| appelle directement | `_afSetSrc`, `_journalJourActif`, `_provFood`, `_unhideFood`, `persist`, `_cloudSyncDebounced`, `closeAddFood`, `renderFoodJournal`, `renderNutrition`, `toast`, `_afToastAjout` |
| globales LUES | `_afMeal`, `_afQuickItems` |
| globales MODIFIÉES | `S` |

```js
function quickAddFood(i){
  const it=_afQuickItems[i]; if(!it)return;
  if(!S.foodLog)S.foodLog=[];
  /* ⚠️ AJOUT DEPUIS LA LISTE (favori / récent) : la ligne est REPRISE d'une entrée précédente.
     `origine:'reprise'` le dit — ce n'est ni une mesure, ni une saisie fraîche, et surtout ça ne
     ment pas en héritant de la source d'origine, qu'on n'a pas conservée sur les favoris. */
  const _vals={kcal:it.kcal||0,prot:it.prot||0,carbs:it.carbs||0,fat:it.fat||0};
  _afSetSrc({saisie:'liste',origine:'reprise'});
  S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:(it.name||'').slice(0,80),ts:Date.now()},_vals,_provFood(_vals)));
  _afSetSrc(null);
  _unhideFood(it.name);
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  closeAddFood(); renderFoodJournal();
  try{ if(typeof renderNutrition==='function')renderNutrition(); }catch(e){}
  toast(_afToastAjout(),'success');
}
```

---

## `_afSuggPrendreLocale`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3392 |
| longueur | 97 lignes |
| appelle directement | `_afCoherence`, `_bcProposerDerniere`, `_bcMontrerTotal`, `_bcQsrc`, `_afSetSrc`, `_afLuFormulaire`, `_afMajAncre`, `_afNoteEtat`, `_afSuggVider`, `toast` |
| globales LUES | `_afSuggLoc` |
| globales MODIFIÉES | `_afPoidsDeclare`, `_afUnite`, `_bcNutr` |

```js
function _afSuggPrendreLocale(i){
  const e=_afSuggLoc[i]; if(!e) return;
  document.getElementById('af-desc').value=e.name||'';
  document.getElementById('af-kcal').value=e.kcal||0;
  document.getElementById('af-prot').value=e.prot||0;
  document.getElementById('af-carbs').value=e.carbs||0;
  document.getElementById('af-fat').value=e.fat||0;
  _afCoherence();          // une ancienne entrée fausse se signale au moment où on la reprend
  /* ⚖️ LA QUANTITÉ SUIT L'ALIMENT QUAND ON LE REPREND (ft-v984)
     Michel, capture à l'appui : *« comment ça se fait que je ne peux pas mettre la quantité,
     sérieux c'est relou »*. **Reproduit dans un navigateur, pas déduit** : par le chemin
     CIQUAL, `blocQuantite: true`. Par le chemin de SON PROPRE JOURNAL — celui qu'il emprunte
     dès la 2ᵉ fois — `blocQuantite: false`, **alors que `per100` est bien là dans la source**.

     ⛔⛔ CETTE LIGNE CACHAIT LE BLOC SANS CONDITION, et transmettait `per100` juste en dessous.
     *L'information existait, et n'atteignait pas l'écran* — **R4**, à deux lignes d'écart.
     👉 Conséquence vécue : le mécanisme de ft-v962/965 marchait la PREMIÈRE fois qu'on note un
     aliment, et disparaissait toutes les suivantes. *Un défaut qui ne se voit qu'à la deuxième
     saisie, donc jamais en testant une fois.*

     ⭐ R13/R2 — ON NE RÉINVENTE RIEN : on reconstruit `_bcNutr` depuis le `per100` déjà
     enregistré, et le bloc `af-bc-row` fait le reste, exactement comme après un scan.
     ⛔ ET ON NE RECALCULE PAS LES MACROS EN ARRIVANT : elles sont déjà justes, et la personne a
     pu les corriger à la main après coup. Les réécrire effacerait sa correction sans le dire
     (R29). Le recalcul part au premier changement de quantité, quand elle le demande. */
  const row=document.getElementById('af-bc-row');
  const P=e.per100;
  if(P && (+P.kcal>0 || +P.prot>0 || +P.carbs>0 || +P.fat>0)){
    _bcNutr={ name:(e.name||'').slice(0,60), kcal100:+P.kcal||0,
              prot100:+P.prot||0, carbs100:+P.carbs||0, fat100:+P.fat||0 };
    const g=document.getElementById('af-bc-grams');
    /* ⚖️ ft-v1051 : la JUMELLE (R8) — le même correctif, sur le chemin « reprendre depuis le journal ». */
    if(g) g.value='';
    if(typeof _bcProposerDerniere==='function') _bcProposerDerniere((+e.q>0 && (!e.u||e.u==='g')) ? +e.q : 0);
    const nm=document.getElementById('af-bc-name');
    if(nm) nm.textContent=_bcNutr.name+' · '+Math.round(_bcNutr.kcal100)+' kcal/100g (ta dernière saisie)';
    if(row) row.style.display='block';
    /* ⛔⛔ LA LIGNE VERTE DU TOTAL EST REMISE À JOUR — SINON ELLE PARLE DE L'ALIMENT PRÉCÉDENT
       (ft-v1042, vu à la capture). Le champ affichait « 150 » pendant que la ligne disait
       « pour tes 200 g : 700 kcal » : le total d'un aliment repris juste avant. *Aucun des deux
       nombres n'est faux — c'est leur voisinage muet qui trompe*, exactement le défaut que
       ft-v966 avait corrigé un cran plus haut, et qui revenait par un autre chemin.
       ⛔ ON NE L'AFFICHE QUE SI LA QUANTITÉ EST RÉELLEMENT CONNUE (R29) : sans `q`, le champ
       retombe à 100 par défaut, et annoncer « pour tes 100 g » serait inventer une portion. */
    /* ⛔⛔ AUCUN TOTAL TANT QUE LA QUANTITÉ N'EST PAS CHOISIE (ft-v1051). Vu à la mesure : le
       champ était vide et la ligne verte annonçait déjà « → pour tes 250 g : 150 kcal ». Elle
       décrivait la PROPOSITION, pas une décision — c'est-à-dire le « voisinage muet » de
       ft-v966 et ft-v1042, retrouvé une 3ᵉ fois par un chemin neuf. *Un total qui devance le
       choix de la personne se lit comme un fait sur son repas.* Il réapparaît dès qu'elle tape
       un poids ou tape la pastille (`_bcApplyGrams` le rappelle). */
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);
  }else{
    if(row) row.style.display='none';
    _bcQsrc(null);
    _bcNutr=null;
    if(typeof _bcMontrerTotal==='function') _bcMontrerTotal(0);   // ⛔ pas de total orphelin
  }
  _afSetSrc({saisie:'historique', origine:e.origine||'utilisateur',
             sourceId:e.sourceId||null, etat:e.etat||null, per100:e.per100||null,
             attendu:_afLuFormulaire()});
  /* ⚖️ SANS POUR-100 G, ON PROPOSE QUAND MÊME DE CHANGER LA QUANTITÉ (ft-v999+)
     Michel, deux captures à l'appui : « il y a toujours le bug sur des aliments que j'ai rentrés
     moi-même et que je veux réutiliser — comme je l'ai rentré avec le code-barre on ne peut plus
     remettre la quantité voulue. Ça fait pareil pour la ratatouille. »
     ⛔⛔ REPRODUIT AVANT DE CODER, et le cas est plus étroit qu'il n'y paraît : ft-v984 marche
     parfaitement quand le scan a rapporté un pour-100 g (mesuré : bloc affiché, « 129 kcal/100g
     (ta dernière saisie) »). Le trou est le cas où **Open Food Facts n'a PAS les valeurs /100 g**
     — fiche incomplète, très fréquent sur les produits de marque (« Steak haché … (U) », « Iso
     zero protein (ASL) »). La personne tape alors ses macros à la main, et l'entrée part avec
     `per100:null` ET `q:null`. À la reprise, la condition de ft-v984 ne peut pas être remplie.
     ⭐ R13/R2 — RIEN N'EST RÉINVENTÉ : `_afMajAncre()` sait DÉJÀ faire exactement ça depuis
     ft-v975 (rescale par PROPORTION, et à défaut d'ancre des portions ½ · 1 · 1½ · 2 · 3). Il
     était branché sur l'estimation IA et sur la saisie libre — pas ici. *Le mécanisme existait,
     posé d'un seul côté* : c'est le même oubli que ft-v973, ft-v975 et ft-v984, la 4ᵉ fois.
     ⛔ IL SE TAIT TOUT SEUL quand un pour-100 g existe (`if(_bcNutr) → cacher`), donc les deux
     mécanismes ne peuvent pas s'afficher ensemble (R2). Et il n'invente aucun poids (R29) :
     sans ancre il n'offre que des multiplicateurs, vrais quelle que soit la portion de départ. */
  /* ⚖️⛔⛔ LA QUANTITÉ DÉJÀ ENREGISTRÉE DOIT ATTEINDRE L'ÉCRAN (ft-v1104) — R4, à trois lignes
     du commentaire qui l'explique. Sans pour-100 g, `e.q` était **simplement laissé de côté** :
     il n'est lu que dans la branche `per100` juste au-dessus. Conséquence mesurée sur le cas de
     Michel — sa ligne « Iso zero protein » reprise depuis son journal revenait **sans aucune
     quantité à l'écran**, alors que l'entrée porte `q:30`.
     ⛔⛔ ET C'EST CE QUI FAISAIT LE « TOUJOURS LE MÊME SOUCI » : une estimation fausse notée une
     fois devient une SUGGESTION, reprise en un tap, et sans quantité affichée le garde-fou de
     masse n'avait rien à quoi comparer. *Une valeur fausse qui se recopie coûte plus cher que
     la valeur fausse d'origine — elle, au moins, ne se reproduit pas.*
     ⭐ R13 : rien n'est réinventé, on emprunte le mécanisme du poids déclaré (`_afPoidsDeclare`),
     et le libellé « que tu as indiqué » reste VRAI — elle l'a indiqué la fois d'avant.
     ⛔ Grammes seulement, et jamais par-dessus un pour-100 g (qui a déjà son propre champ). */
  if(!_bcNutr && +e.q>0 && (!e.u||e.u==='g')){
    _afUnite='g'; _afPoidsDeclare=+e.q;
  }
  if(typeof _afMajAncre==='function') _afMajAncre(true);   // reprise depuis le journal : la source change
  _afNoteEtat(e.name||'');
  _afSuggVider();
  toast('Repris de ton journal 👍','success');
}
```

---

## `addFoodEntry`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3502 |
| longueur | 20 lignes |
| appelle directement | `toast`, `_journalJourActif`, `_provFood`, `_afSetSrc`, `_unhideFood`, `persist`, `closeAddFood`, `renderFoodJournal`, `renderNutrition`, `_cloudSyncDebounced`, `_afToastAjout` |
| globales LUES | `_afMeal` |
| globales MODIFIÉES | `S` |

```js
function addFoodEntry(){
  const name=(document.getElementById('af-desc').value||'').trim();
  const kcal=parseInt(document.getElementById('af-kcal').value)||0;
  const prot=parseInt(document.getElementById('af-prot').value)||0;
  const carbs=parseInt(document.getElementById('af-carbs').value)||0;
  const fat=parseInt(document.getElementById('af-fat').value)||0;
  if(!name){toast('Donne un nom à l\'aliment','error');return;}
  if(!kcal&&!prot&&!carbs&&!fat){toast('Renseigne au moins les calories','error');return;}
  if(!S.foodLog)S.foodLog=[];
  S.foodLog.push(Object.assign({date:_journalJourActif(),meal:_afMeal,name:name.slice(0,80),kcal,prot,carbs,fat,ts:Date.now()},
    _provFood({kcal,prot,carbs,fat})));
  _afSetSrc(null);   // la provenance ne survit pas à l'enregistrement (R15 : le marqueur se pose et se rend)
  _unhideFood(name);
  persist();
  closeAddFood();
  renderFoodJournal();
  try{ if(typeof renderNutrition==='function')renderNutrition(); }catch(e){}   // la carte « Où tu en es » suit
  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  toast(_afToastAjout(),'success');
}
```

---

## `openEditFood`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3579 |
| longueur | 60 lignes |
| appelle directement | `_efQtyRender`, `_renderEditFoodMeals`, `_efCoherence` |
| globales LUES | `S` |
| globales MODIFIÉES | `_editFoodMeal`, `_editFoodTs`, `_efPoidsDeclare`, `_efPoidsPose`, `_efRef`, `_efUnite` |

```js
function openEditFood(ts){
  const e=(S.foodLog||[]).find(x=>x.ts===ts); if(!e)return;
  _editFoodTs=ts; _editFoodMeal=e.meal||'dejeuner';
  let ov=document.getElementById('ov-edit-food');
  if(!ov){ov=document.createElement('div');ov.id='ov-edit-food';ov.className='overlay';ov.style.zIndex='500';ov.onclick=ev=>{if(ev.target===ov)ov.classList.remove('open');};document.body.appendChild(ov);}
  const fld=(id,lbl,val)=>'<div><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">'+lbl+'</div><input id="'+id+'" type="number" inputmode="numeric" value="'+(val||0)+'" oninput="_efCoherence()" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);"></div>';
  /* ⚖️ LE CHAMP QUANTITÉ POUR TOUTES LES ENTRÉES (23/08/2026, ft-v972) — Michel, devant une ligne
     « 30g de protéines » : *« en fait on ne peut pas modifier le poids, je modifie le nom ça ne
     change pas la valeur. Il faut rajouter une ligne poids je pense, qui va modifier la valeur des
     calories et des autres lignes »*.
     ⭐ IL A RAISON, ET C'EST MA LIMITE DE ft-v962 QUI MORD : le champ n'apparaissait QUE si
     l'entrée portait un `per100` (scan, CIQUAL, recherche). Une ligne tapée à la main ou estimée
     par l'IA — donc **la sienne** — n'en a pas, et restait 4 chiffres à recalculer soi-même.
     ⭐⭐ LA SOLUTION NE DEMANDE AUCUN `per100` : on ne rescale pas depuis une composition, on
     rescale **par PROPORTION**. Si la ligne vaut X pour une quantité de référence Q, elle vaut
     X × (nouvelle/Q). *Il suffit de connaître Q, pas la composition pour 100 g.*
     👉 TROIS SOURCES POUR Q, DE LA PLUS SÛRE À LA MOINS SÛRE :
       ① `per100` connu → grammes absolus, comme avant (ft-v962, inchangé) ;
       ② `q` enregistré → c'est la quantité réellement saisie ;
       ③ ⭐ LE NOM LUI-MÊME — « 30g de protéines » porte son ancrage. On lit le nombre suivi de
          `g`/`ml`, et on s'en sert comme référence. *C'est là que Michel écrit déjà la quantité :
          on lit ce qu'il a mis au lieu de lui redemander.*
     ⛔ ET S'IL N'Y A AUCUN ANCRAGE, on ne devine pas un poids : on offre des **portions**
     (½ · 1½ · 2 ·…) qui multiplient les 4 macros sans jamais prétendre connaître des grammes.
     *Un « ×2 » est vrai quelle que soit la portion de départ ; un « 60 g » inventé serait faux.* */
  _efUnite='portion'; _efPoidsDeclare=0; _efPoidsPose=false;   // remis à zéro à chaque ouverture (comme l'écran d'ajout)
  /* ⛔⛔ ft-v1172 — LA RÉFÉRENCE AUSSI, et elle manquait DÉJÀ. `_efRef` survivait d'un aliment
     au suivant : la branche « pour-100 g » de `_efQtyRender` sort avant de le réécrire, donc
     ouvrir un produit emballé après un aliment saisi à la main laissait pointer sur le
     PRÉCÉDENT (`_efCorrigerKcal` écrivait alors dans la référence du mauvais aliment).
     👉 Inoffensif tant que `base` venait de l'entrée ; **fatal dès que la référence est
     préservée**. *Un réglage qui survit à son sujet est pire qu'un réglage absent : il a l'air
     d'un fait* — c'est mot pour mot ce que dit `_afPropCacher` pour l'unité, une porte plus loin. */
  _efRef=null;
  let gramsFld='<div id="ef-qty-row"></div>';
  const _mNom=String(e.name||'').match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  ov.innerHTML='<div class="modal" style="max-width:94vw;width:400px;padding:16px;">'
    +'<div style="font-weight:800;font-size:16px;color:var(--t1);margin-bottom:12px;">Modifier l\'aliment</div>'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Nom</div>'
    +'<input id="ef-name" style="width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);margin-bottom:12px;">'
    +'<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:6px;">Repas</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'+FOOD_MEALS.map(m=>'<button id="ef-meal-'+m.k+'" onclick="_setEditFoodMeal(\''+m.k+'\')" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:var(--font);cursor:pointer;background:var(--bg3);color:var(--t2);">'+m.ic+'<br>'+m.lbl+'</button>').join('')+'</div>'
    +gramsFld
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">'+fld('ef-kcal','Calories (kcal)',e.kcal)+fld('ef-prot','Protéines (g)',e.prot)+fld('ef-carbs','Glucides (g)',e.carbs)+fld('ef-fat','Lipides (g)',e.fat)+'</div>'
    +'<div id="ef-coherence" style="display:none;font-size:12px;line-height:1.45;color:var(--orange);background:var(--bg3);border-radius:10px;padding:10px 11px;margin-bottom:14px;"></div>'
    +'<button class="btn btn-red" onclick="saveEditFood()" style="width:100%;padding:13px;font-size:15px;">✅ Enregistrer</button>'
    +'<button class="btn btn-bg2" onclick="confirmRemoveFood('+ts+')" style="width:100%;margin-top:8px;color:var(--red);">🗑 Supprimer</button>'
    +'<button class="btn btn-bg2" onclick="document.getElementById(\'ov-edit-food\').classList.remove(\'open\')" style="width:100%;margin-top:8px;">Annuler</button>'
    +'</div>';
  document.getElementById('ef-name').value=e.name||''; // évite tout souci d'échappement dans l'attribut
  _efQtyRender();                     // ⚖️ le bloc quantité, re-rendable tout seul (ft-v1064)
  _renderEditFoodMeals();
  /* ⛔⛔ L'ORDRE COMPTE DEPUIS ft-v1104, ET C'EST UNE RÉGRESSION QUE J'AI FABRIQUÉE : le contrôle
     ne lit désormais que des champs VISIBLES (un champ caché porte encore sa valeur), donc
     l'appeler AVANT `.open` revenait à mesurer un écran qui n'est pas encore affiché — la
     quantité tombait à 0 et l'alerte ne partait jamais. *On ne peut pas lire ce qui est à
     l'écran avant qu'il y soit.* On ouvre, PUIS on mesure. */
  ov.classList.add('open');
  _efCoherence();                     // l'incohérence se voit À L'OUVERTURE, sans rien toucher
}
```

---

## `_efQtyRender`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3707 |
| longueur | 81 lignes |
| appelle directement | `_efPropSetBase`, `_portionLbl` |
| globales LUES | `S`, `_editFoodTs`, `_efPoidsDeclare`, `_efUnite` |
| globales MODIFIÉES | `_efRef` |

```js
function _efQtyRender(srcChange){
  const el=document.getElementById('ef-qty-row'); if(!el) return;
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e){el.innerHTML='';return;}
  /* ⛔⛔ `base` NE VIENT PAS DE L'ÉCRAN PAR DÉFAUT — c'est la leçon de ft-v1061 : relire des
     champs déjà rescalés ferait de la référence une valeur dérivée d'elle-même, et l'erreur se
     figerait. Trois cas, et l'ordre compte :
       ① `srcChange` — la SOURCE des valeurs a changé (changement d'unité) : les 4 valeurs
          affichées deviennent la nouvelle référence. *C'est le correctif de ft-v1172, et c'est
          exactement le rôle que `srcChange` joue déjà dans `_afMajAncre`.*
       ② une référence est en cours — on la PRÉSERVE (le blur du champ de poids ne fait que
          redessiner : sans ça, un poids déclaré après un `×2` repartirait de l'entrée du
          journal et jetterait le choix de la personne) ;
       ③ à l'ouverture — l'entrée enregistrée, la seule vérité disponible.
     ⚠️ ② N'EST SÛR QUE PARCE QUE `openEditFood` REMET `_efRef` À NULL : sans ça, l'aliment
     suivant hériterait de la référence du précédent. *Le correctif fabriquait le piège ; il est
     refermé au même endroit, et un témoin le fige.* */
  const base = srcChange ? _efPropSetBase()
             : ((_efRef && _efRef.base) ? _efRef.base
             : {kcal:e.kcal||0,prot:e.prot||0,carbs:e.carbs||0,fat:e.fat||0});
  const style='width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);';
  const mNom=String(e.name||'').match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  const ancre = e.per100 ? null
    : (e.q>0 ? {v:e.q,u:e.u||'g',src:'quantité enregistrée'}
    : (mNom ? {v:parseFloat(mNom[1].replace(',','.')),u:mNom[2].toLowerCase(),src:'lu dans le nom'} : null));
  if(e.per100){
    let g;
    if(e.q&&e.u==='g') g=Math.round(e.q);
    else if(e.per100.kcal>0) g=Math.round((e.kcal||0)/e.per100.kcal*100);
    else g=100;
    el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité (g) <span style="font-weight:400;">— recalcule les macros ci-dessous</span></div>'
      +'<input id="ef-grams" type="text" inputmode="decimal" step="any" value="'+g+'" oninput="_efApplyGrams()" style="'+style+'"></div>';
    return;
  }
  if(ancre && ancre.v>0){
    _efRef={base:base,q:ancre.v,u:ancre.u};   // ⛔ l'unité VOYAGE (ft-v1103) : 100 ml de miel pèsent ~140 g
    el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité ('+ancre.u+') <span style="font-weight:400;">— recalcule les macros ci-dessous</span></div>'
      +'<input id="ef-prop" type="text" inputmode="decimal" step="any" value="'+ancre.v+'" oninput="_efApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence '+ancre.src+' : '+ancre.v+' '+ancre.u+'. Les 4 valeurs suivent en proportion.</div></div>';
    return;
  }
  /* ⚖️ AUCUN ANCRAGE — on ne devine pas, ON DEMANDE (le correctif de ft-v1064). */
  const onglet=(u,l)=>'<button onclick="_efSetUnite(\''+u+'\')" style="flex:1;padding:7px 4px;border-radius:9px;border:1px solid '
    +(_efUnite===u?'var(--red)':'var(--sep)')+';background:'+(_efUnite===u?'var(--bg3)':'var(--bg2)')
    +';color:'+(_efUnite===u?'var(--t1)':'var(--t3)')+';font-size:12.5px;font-weight:'+(_efUnite===u?'800':'700')
    +';font-family:var(--font);cursor:pointer;touch-action:manipulation;" aria-pressed="'+(_efUnite===u?'true':'false')+'">'+l+'</button>';
  const choix='<div style="display:flex;gap:6px;margin-bottom:7px;">'+onglet('g','⚖️ En grammes')+onglet('portion','🍽️ En portions')+'</div>';
  let corps, sousTitre='recalcule les 4 valeurs';
  if(_efUnite==='g'&&_efPoidsDeclare>0){
    _efRef={base:base,q:_efPoidsDeclare,u:'g'};   // l'onglet « ⚖️ En grammes » : c'est des grammes
    corps=choix
      +'<input id="ef-prop" type="text" inputmode="decimal" step="any" value="'+_efPoidsDeclare+'" oninput="_efApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+_efPoidsDeclare+' g (que tu as indiqué). Change ce nombre à chaque fois que la quantité change — les 4 valeurs suivent.</div>';
  }else if(_efUnite==='g'){
    sousTitre='indique d\'abord combien ça pèse';   // ⛔ ce champ CALE, il ne recalcule pas
    _efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait
    /* ⛔ CHAMP VIDE, PAS PRÉ-REMPLI : un « 100 » proposé s'enregistrerait tel quel chez qui valide
       sans regarder — *un chiffre qu'on n'a pas choisi et qui s'enregistre est un chiffre faux
       présenté comme un fait* (R29). Tant que rien n'est indiqué, les 4 valeurs NE BOUGENT PAS. */
    corps=choix
      /* ⌨️ ft-v1159 — `oninput` POUR VOIR, `onblur` POUR RANGER. Le champ répondait à
         `onchange`, c'est-à-dire À LA FERMETURE DU CLAVIER — et le pavé décimal d'iOS n'a
         PAS de touche Entrée : rien n'indiquait qu'il fallait la fermer. On tapait « 50 » et
         il ne se passait RIEN. ⛔ Mais rendre le bloc à chaque frappe serait PIRE (le champ
         serait détruit au premier chiffre) : `_efDeclarePoids` ne redessine donc rien, il
         écrit sous le champ. Le rendu attend le `blur`, exactement quand `onchange` partait. */
      +'<input id="ef-poids" type="text" inputmode="decimal" step="any" placeholder="poids de cette portion" oninput="_efDeclarePoids()" onblur="_efQtyRender()" style="'+style+'">'
      +'<div id="ef-poids-aide" style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">'+_AIDE_POIDS_EF+'</div>';
  }else{
    sousTitre='multiplie les 4 valeurs';
    _efRef={base:base,q:1,u:null};   // ⛔ portions : aucune masse connue, le contrôle se tait
    const b=(x,l)=>'<button onclick="_efApplyPortion('+x+')" style="flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--sep);background:var(--bg2);color:var(--t2);font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;touch-action:manipulation;">'+l+'</button>';
    corps=choix+'<div style="display:flex;gap:6px;">'+[0.5,1,1.5,2,3].map(x=>b(x,_portionLbl(x))).join('')+'</div>'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Les 4 valeurs ci-dessous sont <b>une portion</b>. Tu connais le poids ? Passe en <b>⚖️ grammes</b> et indique-le.</div>';
  }
  /* ⛔⛔ ft-v1159 — LE SOUS-TITRE DISAIT L'INVERSE DE CE QUE LE CHAMP FAIT. Il annonçait
     « recalcule les 4 valeurs » AU-DESSUS du champ de déclaration, qui ne recalcule RIEN : il
     CALE les valeurs existantes sur le poids indiqué. *Michel a tapé 50, attendu que les 156
     kcal bougent, et rien n'a bougé — l'écran le lui avait promis.* Chaque état dit maintenant
     ce qu'il fait vraiment (R24 : informer, pas décorer). */
  el.innerHTML='<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— '+sousTitre+'</span></div>'+corps+'</div>';
}
```

---

## `_efApplyProp`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 3795 |
| longueur | 7 lignes |
| appelle directement | `_qtyRescale` |
| globales LUES | `_efRef` |
| globales MODIFIÉES | — |

```js
function _efApplyProp(){
  if(!_efRef) return;
  /* ⛔ AVANT ft-v1067 : `if(!(v>0)) return;` — le champ vidé laissait des valeurs ORPHELINES à
     l'écran, exactement le défaut corrigé sur l'écran d'ajout en ft-v1061. La jumelle vivait ici
     depuis ce matin. Elle ne peut plus diverger : les deux passent par `_qtyRescale`. */
  _qtyRescale('ef', _efRef.base, _efRef.q, (document.getElementById('ef-prop')||{}).value);
}
```

---

## `_afApplyProp`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4057 |
| longueur | 4 lignes |
| appelle directement | `_qtyRescale` |
| globales LUES | `_afRef` |
| globales MODIFIÉES | — |

```js
function _afApplyProp(){
  if(!_afRef) return;
  _qtyRescale('af', _afRef.base, _afRef.q, (document.getElementById('af-prop')||{}).value);
}
```

---

## `_afSetUnite`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4098 |
| longueur | 27 lignes |
| appelle directement | `_afMajAncre` |
| globales LUES | `_afPoidsPose`, `_afRef` |
| globales MODIFIÉES | `_afPoidsDeclare`, `_afUnite` |

```js
function _afSetUnite(u){
  if(u===_afUnite) return;
  _afUnite=(u==='g')?'g':'portion';
  /* ⛔ ON NE RESCALE RIEN EN CHANGEANT D'UNITÉ. Basculer de « portion » à « g » ne change pas
     ce qu'on a mangé — ça change la façon de le COMPTER. Les 4 valeurs affichées deviennent la
     nouvelle référence, quelle qu'elle soit.

     ⛔⛔ ft-v1172 — ET CETTE DERNIÈRE PHRASE ÉTAIT UNE INTENTION, PAS DU CODE. L'appel partait
     SANS `srcChange`, donc `_afMajAncre` préservait `_afRef.base` : les valeurs affichées étaient
     précisément celles que le commentaire promettait de reprendre, et c'est l'ANCIENNE référence
     qui gagnait. *Le commentaire disait vrai, le code ne le faisait pas.*
     ⭐⭐ MESURÉ SUR L'ENREGISTREMENT D'ÉCRAN DE MICHEL, image par image : un `×2` (312 kcal),
     un passage en grammes, « 100 » tapé — et l'app réaffiche **156**, *juste après avoir écrit
     « ✅ 100 g — les 4 valeurs ci-dessous correspondent à ce poids »*. Son choix de portions
     était jeté, et le nombre à l'écran ne bougeait pas : rien ne disait ce qui venait d'arriver.
     👉 CHANGER D'UNITÉ **EST** UN CHANGEMENT DE SOURCE — il n'avait jamais été classé comme tel.
     Le motif existait déjà à côté : `af-kcal` passe `true` depuis toujours (index.html).

     ⛔⛔ ET LE `!_afPoidsPose` N'EST PAS UNE PRÉCAUTION, C'EST LE BANC D'ESSAI QUI L'A IMPOSÉ.
     Mon premier correctif passait `true` sans condition — et il **rouvrait le bug de ft-v1061** :
     trois témoins de son ancienne capture d'étiquette sont repassés au rouge, dont *« 40 g redonne
     156 / 35, plus jamais les 208 / 47 »*. Voir `_afPoidsPose` pour les deux cas et leur
     départage. *Un correctif qui répare le cas qu'on regarde en cassant celui d'à côté n'est pas
     un correctif : c'est un échange.* */
  _afPoidsDeclare=0;
  _afMajAncre(!_afPoidsPose);
}
```

---

## `_afMajAncre`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4153 |
| longueur | 110 lignes |
| appelle directement | `_afPropCacher`, `_afPropSetBase`, `numFR`, `_portionLbl`, `_afProp` |
| globales LUES | `_afUnite`, `_bcNutr` |
| globales MODIFIÉES | `_afPoidsDeclare`, `_afRef` |

```js
function _afMajAncre(srcChange){
  const el=document.getElementById('af-prop-row'); if(!el) return;
  if(_bcNutr){ _afPropCacher(); return; }          // ① un pour-100 g est connu : `af-bc-row` s'en charge
  /* ⛔⛔ ON NE RELIT L'ÉCRAN QUE SI LA SOURCE A CHANGÉ (ft-v1061) — c'est LE correctif.
     L'en-tête juste au-dessus le dit depuis toujours : *« appelée seulement quand la SOURCE des
     valeurs change »*. C'était vrai des intentions, pas du code : la fonction relisait les 4
     champs à CHAQUE appel, y compris quand elle était rappelée pour une simple reconstruction
     (changement d'unité, déclaration de poids). Or après un rescale, ces champs ne portent plus
     `base` — ils portent `base × facteur`. La référence redevenait donc une valeur dérivée
     d'elle-même, et l'erreur se figeait.
     👉 `srcChange` distingue les deux : **vrai** quand les valeurs viennent d'ailleurs (estimation
     IA, reprise d'un aliment, macro corrigée à la main) → on relit ; **faux/absent** quand on ne
     fait que redessiner → `base` est PRÉSERVÉE. */
  const base=(srcChange||!_afRef||!_afRef.base)?_afPropSetBase():_afRef.base;
  /* ⛔ « Y A-T-IL QUELQUE CHOSE À RESCALER ? » SE MESURE SUR LES QUATRE, PAS SUR LES CALORIES.
     Trouvé à la mesure (ft-v1065) : le garde testait `base.kcal>0`, donc mettre les calories à 0
     faisait DISPARAÎTRE tout le bloc quantité — alors que 35 g de protéines restaient à l'écran,
     parfaitement rescalables. Ça touche les cas réels (une boisson zéro, un aliment dont on ne
     connaît que les protéines) et surtout la frappe : on efface les calories pour les retaper,
     et le réglage de quantité s'évapore sous les doigts. *Un proxy commode — les calories pour
     « il y a des valeurs » — devient faux dès qu'une valeur légitime vaut zéro.* */
  if(!(base.kcal>0||base.prot>0||base.carbs>0||base.fat>0)){ _afPropCacher(); return; }   // rien à rescaler tant qu'AUCUNE valeur n'est posée
  /* ⛔⛔ L'INVARIANT DE TOUT CE BLOC (ft-v1061) : `_afRef.base` sont TOUJOURS les valeurs de
     `_afRef.q`. Or `base` vient d'être RELU À L'ÉCRAN — et l'écran, après un rescale, montre les
     valeurs de la quantité TAPÉE, pas celles de l'ancienne référence.
     👉 **La seule quantité à laquelle on a le droit d'appairer ces valeurs est celle AFFICHÉE.**
     Sans ça, `base` et `q` se désappairent, et tout le reste est faux d'un facteur constant —
     silencieusement, avec des nombres parfaitement crédibles. Mesuré sur l'étiquette de Michel :
     référence 30 g, il tape 40 (→ 156 kcal, juste), un geste rappelle `_afMajAncre` (toucher une
     macro, ou un aller-retour d'unité), `base` devient 156 pendant que `q` reste 30 — et 40 g
     affiche alors **208 kcal / 47 g** au lieu de 156 / 35, soit **1,33× son étiquette**.
     ⭐ C'est mot pour mot la leçon déjà écrite dans `_provFood` en ft-v1056 : *les valeurs
     affichées et la quantité affichée vont toujours ensemble — c'est le seul couple sur lequel on
     peut diviser sans se tromper.* Elle était posée d'un seul côté (R8, la jumelle). */
  const qAff=numFR((document.getElementById('af-prop')||{}).value);
  const nom=String((document.getElementById('af-desc')||{}).value||'');
  const m=nom.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  /* ⚠️ LE POIDS DE L'IA PASSE DEVANT LE NOMBRE LU DANS LA PHRASE, ET CE N'EST PAS UN DÉTAIL.
     Sur « 3 œufs et 200 g de riz », le nombre écrit ne désigne QU'UN COMPOSANT — le rescaler
     ferait comme si toute l'assiette pesait 200 g. Le poids de l'IA, lui, porte sur le total.
     ⛔ MAIS IL N'APPARTIENT QU'À LA PHRASE QUI A ÉTÉ ESTIMÉE : si la phrase a changé depuis,
     il est périmé et on ne s'en sert plus. *Une référence qui survit à son sujet est pire que
     pas de référence : elle a l'air d'un fait.* */
  const iaValide = window._afIaGrammes>0 && String(window._afIaDesc||'')===nom;
  const ancre = iaValide ? {v:window._afIaGrammes,u:'g',src:'poids estimé par l\'IA'}
              : (m ? {v:parseFloat(m[1].replace(',','.')),u:m[2].toLowerCase(),src:'lu dans ta phrase'} : null);
  const style='width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:var(--bg2);border:1px solid var(--sep);color:var(--t1);font-size:15px;font-family:var(--font);';
  if(ancre && ancre.v>0){
    /* ⛔ La quantité affichée l'emporte sur l'ancre : si la personne l'a corrigée, ce sont SES
       valeurs qui sont à l'écran — et la source change avec, sinon l'écran attribuerait à l'IA
       un poids que la personne a tapé (R32 : on ne présente jamais une déclaration comme une mesure). */
    const qR=(qAff>0)?qAff:ancre.v;
    const sR=(qAff>0&&qAff!==ancre.v)?'que tu as indiqué':ancre.src;
    _afRef={base:base,q:qR,u:ancre.u,src:sR};
    el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité ('+ancre.u+') <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'
      +'<input id="af-prop" type="text" inputmode="decimal" step="any" value="'+qR+'" oninput="_afApplyProp()" style="'+style+'">'
      +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+qR+' '+ancre.u+' ('+sR+'). Corrige-la, les 4 valeurs suivent en proportion.</div>';
  }else{
    /* ⚖️ AUCUN POIDS TROUVÉ — on ne devine pas, ON DEMANDE (ft-v1051). Deux unités au choix,
       un seul champ actif à la fois : la quantité a un seul propriétaire (R2). */
    const onglet=(u,l)=>'<button onclick="_afSetUnite(\''+u+'\')" style="flex:1;padding:7px 4px;border-radius:9px;border:1px solid '
      +(_afUnite===u?'var(--red)':'var(--sep)')+';background:'+(_afUnite===u?'var(--bg3)':'var(--bg2)')
      +';color:'+(_afUnite===u?'var(--t1)':'var(--t3)')+';font-size:12.5px;font-weight:'+(_afUnite===u?'800':'700')
      +';font-family:var(--font);cursor:pointer;touch-action:manipulation;" aria-pressed="'+(_afUnite===u?'true':'false')+'">'+l+'</button>';
    const choix='<div style="display:flex;gap:6px;margin-bottom:7px;">'+onglet('g','⚖️ En grammes')+onglet('portion','🍽️ En portions')+'</div>';
    if(_afUnite==='g'&&_afPoidsDeclare>0){
      /* ⭐ ANCRÉ PAR LA PERSONNE — à partir d'ici c'est EXACTEMENT le bloc « poids connu »
         au-dessus : même champ, même `_afApplyProp`, même calcul. Seule la source diffère, et
         elle est dite à l'écran (R32 : on ne présente jamais une déclaration comme une mesure). */
      /* ⛔ MÊME RÈGLE, ET C'EST LE CHEMIN DE LA CAPTURE DE MICHEL : les valeurs à l'écran sont
         celles de la quantité affichée. La référence la SUIT au lieu de rester sur l'ancienne —
         et comme elle est écrite en toutes lettres dessous, le changement se VOIT. */
      if(qAff>0) _afPoidsDeclare=qAff;
      _afRef={base:base,q:_afPoidsDeclare,u:'g',src:'que tu as indiqué'};
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— recalcule les 4 valeurs</span></div>'
        +choix
        +'<input id="af-prop" type="text" inputmode="decimal" step="any" value="'+_afPoidsDeclare+'" oninput="_afApplyProp()" style="'+style+'">'
        +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Référence : '+_afPoidsDeclare+' g (que tu as indiqué). Change ce nombre à chaque fois que la quantité change — les 4 valeurs suivent.</div>';
    }else if(_afUnite==='g'){
      /* ⛔ LE CHAMP EST VIDE, PAS PRÉ-REMPLI. Proposer « 100 » ferait enregistrer 100 g à qui
         valide sans regarder — *un chiffre pré-rempli qu'on n'a pas choisi est un chiffre faux
         présenté comme un fait* (R29). Tant que rien n'est indiqué, les 4 valeurs NE BOUGENT PAS. */
      _afRef={base:base,q:1,u:'',src:'portion'};
      /* ⌨️ ft-v1159 — LA JUMELLE (R8). Exactement le défaut de l'écran d'édition, au même
         endroit : `onchange` ne partait qu'à la fermeture du clavier, que le pavé décimal d'iOS
         ne sait pas déclencher. ⛔ Et le sous-titre promettait « recalcule les 4 valeurs »
         au-dessus d'un champ qui ne recalcule rien — il les CALE. *Un correctif posé d'un seul
         côté est la faute que ce fichier passe son temps à rattraper.* */
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— indique d\'abord combien ça pèse</span></div>'
        +choix
        +'<input id="af-poids" type="text" inputmode="decimal" step="any" placeholder="poids de cette portion" oninput="_afDeclarePoids()" onblur="_afMajAncre()" style="'+style+'">'
        +'<div id="af-poids-aide" style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">'+_AIDE_POIDS_AF+'</div>';
    }else{
      _afRef={base:base,q:1,u:'',src:'portion'};
      const b=(x,l)=>'<button onclick="_afApplyPortion('+x+')" style="flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--sep);background:var(--bg2);color:var(--t2);font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;touch-action:manipulation;">'+l+'</button>';
      el.innerHTML='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:4px;">Quantité <span style="font-weight:400;">— multiplie les 4 valeurs</span></div>'
        +choix
        +'<div style="display:flex;gap:6px;">'+[0.5,1,1.5,2,3].map(x=>b(x,_portionLbl(x))).join('')+'</div>'
        +'<div style="font-size:11px;color:var(--t3);margin-top:5px;line-height:1.4;">Les 4 valeurs ci-dessous sont <b>une portion</b>. Tu connais le poids ? Passe en <b>⚖️ grammes</b> et indique-le.</div>';
    }
  }
  el.style.display='block';
  /* ⛔ ET L'ÉCRAN SE REMET D'ACCORD AVEC LA RÉFÉRENCE QU'IL VIENT D'ÉCRIRE (ft-v1061).
     Sans cette ligne, `base` est bien préservée mais les 4 champs gardent les valeurs du rescale
     précédent : on afficherait « Référence : 30 g » au-dessus des chiffres de 40 g. *Le voisinage
     muet une fois de plus* — corriger le calcul sans rafraîchir l'affichage ne corrige rien de ce
     que la personne VOIT. `af-prop` n'existe que dans les deux états ancrés, et il porte
     exactement `_afRef.q` : le facteur vaut donc 1. */
  if(_afRef && _afRef.q>0 && document.getElementById('af-prop')) _afProp(1);
}
```

---

## `_efApplyGrams`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4270 |
| longueur | 4 lignes |
| appelle directement | `_qtyRescale` |
| globales LUES | `S`, `_editFoodTs` |
| globales MODIFIÉES | — |

```js
function _efApplyGrams(){
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e||!e.per100) return;
  _qtyRescale('ef', e.per100, 100, (document.getElementById('ef-grams')||{}).value);
}
```

---

## `saveEditFood`

| | |
|---|---|
| fichier | `app.js` |
| ligne | 4274 |
| longueur | 25 lignes |
| appelle directement | `toast`, `numFR`, `persist`, `_cloudSyncDebounced`, `renderFoodJournal` |
| globales LUES | `S`, `_editFoodMeal`, `_editFoodTs` |
| globales MODIFIÉES | — |

```js
function saveEditFood(){
  const e=(S.foodLog||[]).find(x=>x.ts===_editFoodTs); if(!e){toast('Entrée introuvable','error');return;}
  const name=(document.getElementById('ef-name').value||'').trim();
  e.name=(name||e.name).slice(0,80);
  e.meal=_editFoodMeal;
  e.kcal=parseInt(document.getElementById('ef-kcal').value)||0;
  e.prot=parseInt(document.getElementById('ef-prot').value)||0;
  e.carbs=parseInt(document.getElementById('ef-carbs').value)||0;
  e.fat=parseInt(document.getElementById('ef-fat').value)||0;
  // La quantité ne se met à jour QUE si le champ était affiché (per100 connu) — sinon `q`/`u`
  // ne veulent rien dire et on ne les invente pas (R29).
  const gEl=document.getElementById('ef-grams');
  if(gEl){ e.q=numFR(gEl.value)||0; e.u='g'; }
  /* ⭐ R4 (ft-v1064) — LE POIDS DÉCLARÉ DESCEND JUSQU'À LA DONNÉE. Sans ça la personne le donne,
     les 4 valeurs se recalculent à l'écran… et rien n'est retenu : à la prochaine ouverture
     l'app lui redemande, et le cul-de-sac revient. C'est la moitié qui manquait à ft-v972.
     ⛔ On n'écrit que ce qui est VRAIMENT en grammes : le champ proportionnel sert aussi aux
     ancrages en `ml`, et l'unité d'origine ne se réécrit pas (R29). */
  const pEl=document.getElementById('ef-prop');
  if(pEl && numFR(pEl.value)>0){ e.q=numFR(pEl.value); e.u=e.u||'g'; }
  persist(); if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();
  const ov=document.getElementById('ov-edit-food'); if(ov)ov.classList.remove('open');
  renderFoodJournal();
  toast('Modifié ✅','success');
}
```
