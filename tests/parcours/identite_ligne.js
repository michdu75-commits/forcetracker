/* ══════════════════════════════════════════════════════════════════════════════
   B-CCCXVI — TÉMOINS DE SOURCE : L'IDENTITÉ D'UNE LIGNE DU JOURNAL ALIMENTAIRE
   ⛔⛔ CE FICHIER EST À PART, ET C'EST UNE MESURE QUI L'A DÉCIDÉ. Ces témoins ne lisent
   que du TEXTE — aucun navigateur, aucune page. Les garder dans le banc obligeait à lancer
   une passe complète (plus de 20 minutes) pour éprouver vingt expressions régulières : le
   contrôle négatif de ce chantier serait passé de 35 minutes à NEUF HEURES.
   👉 Un garde qu'on ne peut pas éprouver en un temps raisonnable ne sera jamais éprouvé,
   et un garde qu'on n'éprouve pas est une affirmation, pas une garantie.
   ⭐ UN SEUL propriétaire (R2) : le banc l'appelle, le contrôle négatif l'appelle aussi.
   Usage direct : node tests/parcours/identite_ligne.js   (sortie 1 s'il y a un rouge)
   ══════════════════════════════════════════════════════════════════════════ */

/* ══ BLOC B-CCCXVI — L'IDENTITÉ D'UNE LIGNE DU JOURNAL ALIMENTAIRE (bug T-01) ══════════
   Michel, 16/09/2026, après la mesure `MESURE-T01-TS-REJOUER-REPAS` : `rejouerRepas` écrivait
   ses lignes dans une boucle SYNCHRONE, plusieurs `Date.now()` tombaient dans la même
   milliseconde, et `ts` — la SEULE poignée de l'interface — était partagé. Mesuré par clics
   réels : cliquer « OEUF » modifiait « PAIN » ; cliquer la croix de « JUS » annonçait
   « PAIN sera retiré » et supprimait les TROIS lignes.

   ⭐⭐ CES TÉMOINS-CI PROTÈGENT DES **DÉCISIONS**, PAS DES VALEURS — et c'est pour ça qu'ils
   lisent la SOURCE. Trois d'entre eux sont nés d'un contrôle négatif qui les a trouvés
   manquants : une mutation qui retire l'identité d'un écrivain reste VERTE au comportement,
   parce que le filet du rendu la rattrape. Le filet fait son travail ; mais la ligne part
   alors au cloud sans identité (`rejouerRepas` synchronise AVANT de rendre), et surtout
   *un contrat qu'aucun témoin ne tient finit par être oublié par le prochain écrivain*.

   ⛔ Le comportement, lui, est éprouvé par clics réels dans le bloc B-CCCXVII, juste après. */
module.exports = function(t, ROOT, fs, path){
  const srcA=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
  const srcS=fs.readFileSync(path.join(ROOT,'state.js'),'utf8');
  const srcC=fs.readFileSync(path.join(ROOT,'screens.js'),'utf8');
  /* le corps SANS ses commentaires — sinon on mesure la documentation (famille ft-v1193/1210) */
  const nu12=(x)=>x.replace(/\/\*[\s\S]*?\*\//g,' ')
    .split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  /* borné aux ACCOLADES, jamais à une distance en caractères (BUGS.md §63) */
  const corps12=(src,n)=>{ const m=src.match(new RegExp('(?:async )?function '+n+'\\s*\\('));
    if(!m) return ''; let i=src.indexOf('{',m.index+m[0].length-1),p=0,j=i;
    while(j<src.length){ if(src[j]==='{')p++; else if(src[j]==='}'){p--; if(!p) return nu12(src.slice(i,j+1));} j++; }
    return ''; };
  const A12=nu12(srcA), S12=nu12(srcS), C12=nu12(srcC);

  console.log('\n-- B-CCCXVI. L\'identité d\'une ligne du journal alimentaire (source) --');

  /* ① UN SEUL PROPRIÉTAIRE POUR FABRIQUER UNE IDENTITÉ (R2).
     🥗 V2 (jalon 4) — les 3 créateurs ne construisent plus leur ligne eux-mêmes : ils passent par les DEUX
     constructeurs d'entrée du pont (`_n2EntreeEcran` pour l'écran d'ajout, `_n2Reajouter` pour une reprise hors
     écran), et ce sont eux qui appellent `_foodLineId()`. Le compte attendu passe de 3 à 2 ; l'invariant ne
     bouge pas : un seul fabricant, appelé à la création, nulle part ailleurs. */
  const V2=nu12(fs.readFileSync(path.join(ROOT,'nutrition-v2.js'),'utf8'));
  t('B-CCCXVI ① `_foodLineId` est le seul fabricant d\'identité, appelé par les 2 constructeurs du pont',
    /function _foodLineId\(\)/.test(S12) &&
    (S12.match(/function _foodLineId/g)||[]).length===1 &&
    (A12.match(/_foodLineId\(\)/g)||[]).length===2 &&
    ['_n2EntreeEcran','_n2Reajouter'].every(fn=>(corps12(srcA,fn).match(/_foodLineId\(\)/g)||[]).length===1),
    'appels dans app.js : '+((A12.match(/_foodLineId\(\)/g)||[]).length)+' (attendu 2 : _n2EntreeEcran, _n2Reajouter)');

  /* ② L'IDENTITÉ EST POSÉE DANS LE LITTÉRAL DE L'ENTRÉE, À LA CRÉATION — ET LES 3 CRÉATEURS Y PASSENT.
     ⛔ Trouvé par contrôle négatif (T-01) : retirer l'identité d'un écrivain ne fait PAS rougir le comportement —
     le filet du rendu la repose. En V2 le moteur la REFUSE (`ID_INVALIDE`) ; ce témoin tient le contrat à la source,
     et vérifie qu'aucun créateur ne contourne le pont (ni littéral à lui, ni `push` direct dans le journal). */
  ['_n2EntreeEcran','_n2Reajouter'].forEach(fn=>{
    const b=corps12(srcA,fn).replace(/\s+/g,'');
    t('B-CCCXVI ② `'+fn+'` pose l\'identité DANS le littéral de l\'entrée',
      /\{id:id,ts:Date\.now\(\)/.test(b), fn);
  });
  [['addFoodEntry','_n2EntreeEcran'],['quickAddFood','_n2Reajouter'],['rejouerRepas','_n2Reajouter']].forEach(([fn,via])=>{
    const b=corps12(srcA,fn);
    t('B-CCCXVI ② `'+fn+'` crée sa ligne par `'+via+'` (jamais un littéral à lui, jamais un `push` direct)',
      b.length>0 && new RegExp(via+'\\(').test(b) && !/foodLog\.push\(/.test(b) && !/_foodLineId\(/.test(b), fn);
  });
  t('B-CCCXVI ②bis ⭐ le moteur recopie l\'identité dans la ligne, REFUSE une entrée sans identité, '+
    'et le seul `push` du journal est celui de l\'écrivain unique',
    /typeof e\.id !== 'string'[^\n]*return ko\('ID_INVALIDE'\)/.test(V2) && /ts: e\.ts, id: e\.id/.test(V2) &&
    (A12.match(/foodLog\.push\(/g)||[]).length===1 && /foodLog\.push\(/.test(corps12(srcA,'_n2Enregistrer')),
    '`push` dans app.js : '+((A12.match(/foodLog\.push\(/g)||[]).length));

  /* ③ ⛔ `saveEditFood` N'EN POSE PAS, ET C'EST VOLONTAIRE (R30).
     Il modifie une ligne EN PLACE. Lui imposer le même geste lui ferait changer d'identité à
     chaque correction — *une ligne qu'on corrige reste la même ligne.* */
  t('B-CCCXVI ③ ⛔ `saveEditFood` ne fabrique AUCUNE identité (il édite en place)',
    corps12(srcA,'saveEditFood').length>0 && !/_foodLineId\(/.test(corps12(srcA,'saveEditFood')), '');

  /* ④ `ts` RESTE UN HORODATAGE : personne ne le gonfle pour le rendre unique. C'est le choix
     d'architecture du chantier — `_profilAlimentaire` en lit l'HEURE, un `ts` gonflé mentirait. */
  t('B-CCCXVI ④ ⛔ aucun écrivain ne fabrique un `ts` artificiellement unique',
    !/ts:\s*Date\.now\(\)\s*\+/.test(A12) && !/\.ts\s*=\s*Date\.now\(\)\s*\+/.test(A12+S12), '');
  t('B-CCCXVI ④bis ⛔ la compatibilité ne RÉÉCRIT jamais un horodatage',
    !/\.ts\s*=[^=]/.test(corps12(srcS,'_foodLogIdentifier')), '');

  /* ⑤ LA COMPATIBILITÉ NE TOUCHE QU'À L'IDENTITÉ MANQUANTE (consigne « MIGRATION » de Michel) */
  {
    const b=corps12(srcS,'_foodLogIdentifier');
    const ecrit=(b.match(/\bl\.[a-zA-Z0-9_]+\s*=[^=]/g)||[]).map(s=>s.replace(/\s*=.$/,'').trim());
    t('B-CCCXVI ⑤ ⭐ la compatibilité n\'écrit QUE `l.id` — aucune donnée métier ne bouge',
      ecrit.length===1 && ecrit[0]==='l.id', 'écrit : '+(ecrit.join(', ')||'rien'));
    /* ⛔ ELLE EXIGE L'UNICITÉ, PAS LA PRÉSENCE : un `id` en double est RÉATTRIBUÉ. Sans ça on
       rejouerait le bug exact qu'on corrige, avec une autre clé. (Trouvé par mutation.) */
    t('B-CCCXVI ⑤bis ⭐ un identifiant en DOUBLE est réattribué (unicité, pas présence)',
      /!vus\[cle\]/.test(b), '');
  }

  /* ⑥ CE N'EST PAS UN DRAPEAU « MIGRATION FAITE » : une restauration peut réinjecter de
     vieilles lignes bien après. Le mécanisme est rejoué au chargement, à la fusion ET au rendu. */
  t('B-CCCXVI ⑥ ⛔ la compatibilité n\'est pas gardée par un drapeau one-time',
    !/ft4_[a-z0-9_]*mig/.test(corps12(srcS,'_foodLogIdentifier')), '');
  t('B-CCCXVI ⑥bis la compatibilité est rejouée au chargement ET à la fusion',
    (S12.match(/_foodLogIdentifier\(S\.foodLog\)/g)||[]).length>=2,
    'appels dans state.js : '+((S12.match(/_foodLogIdentifier\(S\.foodLog\)/g)||[]).length));
  t('B-CCCXVI ⑥ter ⭐ et AVANT chaque rendu du journal — le filet qui couvre la RESTAURATION',
    /_foodLogIdentifier\(S\.foodLog\)/.test(corps12(srcC,'renderFoodJournal')), '');

  /* ⑦ AUCUN `Math.random()` (consigne explicite), ET AUCUN REPLI SUR L'HORLOGE. */
  t('B-CCCXVI ⑦ ⛔ l\'identité ne vient jamais de `Math.random`',
    !/Math\.random/.test(corps12(srcS,'_foodLineId')) &&
    /crypto\.randomUUID/.test(corps12(srcS,'_foodLineId')) &&
    /crypto\.getRandomValues/.test(corps12(srcS,'_foodLineId')), '');
  t('B-CCCXVI ⑦bis ⛔ aucun repli sur l\'horloge : sans source aléatoire, on échoue FERMÉ',
    !/Date\.now/.test(corps12(srcS,'_foodLineId')), '');

  /* ⑧ L'ÉDITION ET LA SUPPRESSION N'EMPLOIENT PLUS `ts` COMME POIGNÉE. */
  ['openEditFood','saveEditFood','confirmRemoveFood','removeFoodEntry','_efQtyRender','_efApplyGrams']
    .forEach(fn=>{
      const b=corps12(srcA,fn);
      t('B-CCCXVI ⑧ `'+fn+'` ne retrouve plus la ligne par `ts`',
        b.length>0 && !/\.ts\s*===/.test(b) && !/\.ts\s*!==/.test(b), fn);
    });

  /* ⑨ ⭐⭐ L'ANNONCE ET L'ACTION EMPLOIENT LA MÊME CLÉ — le fait le plus grave de T-01. */
  t('B-CCCXVI ⑨ ⭐ `confirmRemoveFood` nomme la ligne par son identité',
    /x\.id===id/.test(corps12(srcA,'confirmRemoveFood').replace(/\s+/g,'')), '');
  t('B-CCCXVI ⑨bis ⭐ `removeFoodEntry` retire UN élément par construction (index, pas filtre)',
    /findIndex\(/.test(corps12(srcA,'removeFoodEntry')) &&
    /splice\(i,1\)/.test(corps12(srcA,'removeFoodEntry').replace(/\s+/g,'')) &&
    !/\.filter\(/.test(corps12(srcA,'removeFoodEntry')),
    '⛔ un `filter` sur une clé qu\'on croit unique est exactement ce qui a effacé 3 lignes');

  /* ⑩ LA POIGNÉE DU RENDU EST L'IDENTITÉ, FILTRÉE PAR LISTE BLANCHE. */
  t('B-CCCXVI ⑩ le journal passe l\'identité, plus l\'horodatage',
    C12.indexOf("openEditFood('${_h}')")>=0 && C12.indexOf("confirmRemoveFood('${_h}')")>=0 &&
    /_foodIdAttr\(e\.id\)/.test(C12), '');
  t('B-CCCXVI ⑩bis ⛔ le bouton Supprimer DE LA MODALE emploie la même poignée',
    /_foodIdAttr\(id\)/.test(corps12(srcA,'openEditFood')),
    'la modale d\'édition a sa propre porte de suppression — elle avait été oubliée une fois');
  t('B-CCCXVI ⑩ter l\'identité passe par une LISTE BLANCHE avant d\'entrer dans un attribut',
    /function _foodIdAttr/.test(S12) && /\[\^0-9a-zA-Z-\]/.test(S12), '');

  /* ⑪ ⛔ HORS PÉRIMÈTRE, FIGÉ : la fusion multi-onglets n'emploie PAS l'identité.
     Deux onglets qui notent la même chose produisent deux `id` différents : une signature sur
     l'identité les garderait tous les deux, donc créerait le doublon que la fusion évite. */
  t('B-CCCXVI ⑪ ⛔ la signature de fusion de `foodLog` n\'emploie pas l\'identité',
    /S\.foodLog\s*=\s*_fusionListe\(S\.foodLog,[\s\S]{0,300}?e&&e\.kcal/.test(S12) &&
    !/_fusionListe\(S\.foodLog,[\s\S]{0,300}?e&&e\.id/.test(S12), '');

  /* ⑫ ⛔ HORS PÉRIMÈTRE, FIGÉ : la douane n'a pas bougé. */
  {
    const d=srcA.slice(srcA.indexOf('function _douaneLigne'), srcA.indexOf('function _douaneCompter'));
    const R=d.match(/dit\('[a-z0-9_]+',\s*'(INVALID|WARN)'/g)||[];
    t('B-CCCXVI ⑫ ⛔ la douane garde ses 21 règles, dont 9 INVALID',
      R.length===21 && R.filter(x=>x.indexOf('INVALID')>=0).length===9,
      R.length+' règles / '+R.filter(x=>x.indexOf('INVALID')>=0).length+' INVALID');
    /* 🥗 V2 (jalon 4) — la douane n'est plus appelée par chaque porte : l'écrivain unique `_n2Enregistrer`
       l'appelle UNE fois, sur la ligne qu'il va écrire, sous le nom HISTORIQUE de la porte (gel du 13/09 : même
       carnet, mêmes noms d'écrivains). Le témoin tient les trois moitiés : un seul appel (sinon une ligne serait
       comptée deux fois au carnet), fait par l'écrivain unique, et chacune des 4 portes lui passe son nom. */
    const EN=corps12(srcA,'_n2Enregistrer').replace(/\s+/g,'');
    t('B-CCCXVI ⑫bis ⛔ les 4 écrivains sont toujours observés par la douane (une fois, par l\'écrivain unique, sous leur nom)',
      (A12.match(/(?<!function )_douaneLigne\(/g)||[]).length===1 &&
      /_douaneLigne\(r\.ligne,porte\)/.test(EN) &&
      /return_n2Enregistrer\(e,porte\)/.test(corps12(srcA,'_n2Reajouter').replace(/\s+/g,'')) &&
      [['addFoodEntry',/_n2Enregistrer\([^)]*,\s*'addFoodEntry'\)/],
       ['saveEditFood',/_n2Enregistrer\([^)]*,\s*'saveEditFood'\)/],
       ['quickAddFood',/_n2Reajouter\([^\n]*'quickAddFood'\)/],
       ['rejouerRepas',/_n2Reajouter\([^\n]*'rejouerRepas'\)/]].every(([w,re])=>re.test(corps12(srcA,w))),
      'appels de la douane hors définition : '+((A12.match(/(?<!function )_douaneLigne\(/g)||[]).length));
  }

  /* ⭐⭐ ⑬ LE PIÈGE QUI M'A EU, RENDU MESURABLE. Ce fichier prévient QUARANTE-HUIT FOIS en
     commentaire que tout bloc conduisant un navigateur doit rester AVANT `b.close()` — « posé
     après, il ne rate pas : il PLANTE ». J'ai quand même posé B-CCCXVII après, et la passe est
     morte sur `browser has been closed` au bout de 25 minutes.
     👉 *Un avertissement écrit quarante-huit fois n'a arrêté personne ; un témoin, si.* */
  {
    const R=fs.readFileSync(path.join(ROOT,'tests/parcours/runner.js'),'utf8');
    const iB=R.indexOf("/* \u2550\u2550 BLOC B-CCCXVII \u2014");
    const iC=R.indexOf('await b.close(); srv.close();');
    t('B-CCCXVI \u2462 \u26d4 le bloc qui conduit un navigateur reste AVANT `b.close()`',
      iB>0 && iC>0 && iB<iC,
      iB<0 ? 'bloc B-CCCXVII introuvable' : (iC<0 ? 'b.close() introuvable'
            : 'le bloc est APRES la fermeture du navigateur : la passe PLANTERA'));
  }
};

/* ⛔ APPELÉ DIRECTEMENT : on fabrique notre propre compteur, pour que le contrôle négatif
   puisse éprouver ces témoins sans relancer le banc entier. */
if (require.main === module) {
  const _fs=require('fs'), _path=require('path');
  const _ROOT=_path.resolve(__dirname,'../..');
  let _ok=0, _ko=0;
  const _t=(n,c,x)=>{c?(_ok++,console.log('  \u2705 '+n)):(_ko++,console.log('  \u274C '+n+(x?'\n       -> '+x:'')));};
  module.exports(_t, _ROOT, _fs, _path);
  console.log('\n==== B-CCCXVI : '+_ok+' OK / '+_ko+' rouge(s) ====');
  process.exit(_ko?1:0);
}
