#!/usr/bin/env node
/**
 * LA DATE DU JOUR EST CELLE DU TÉLÉPHONE, JAMAIS CELLE DE GREENWICH (ft-v655).
 *
 * Le bug (trouvé le 28/07/2026 en enquêtant sur la séance annoncée à Milo) :
 * `new Date().toISOString()` renvoie la date **UTC**. En France l'été (UTC+2),
 * entre MINUIT et 2 H du matin il est encore « hier » à Greenwich → une séance
 * finie à 00 h 30 était datée de la VEILLE. Idem check-in, sommeil, badges,
 * expiration du premium. Bug SILENCIEUX : rien ne plante, la date est juste fausse.
 *
 * Ce test fait deux choses :
 *   1. il gèle l'horloge à des instants pièges et vérifie que today() rend le
 *      bon jour — dans un fuseau EN AVANCE (Paris) et EN RETARD (New York) ;
 *   2. il interdit à tout fichier de l'app de retomber dans le motif UTC.
 *
 * Lancer : node tests/dates/runner.js
 */
const fs=require('fs'), path=require('path'), cp=require('child_process');
const R=path.resolve(__dirname,'../..');
let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};

// ── 1. Le comportement, horloge gelée sur les instants pièges ────────────────
// today() est lue DANS state.js : on teste le vrai code livré, pas une copie.
const src=fs.readFileSync(path.join(R,'state.js'),'utf8');
const m=src.match(/^const today=.*$/m);
if(!m){ console.error('❌ today() introuvable dans state.js'); process.exit(1); }
const TODAY_SRC=m[0];

function jourVu(tz, instantISO){
  // sous-processus : le fuseau ne se change proprement qu'au démarrage de Node
  const code=`
    const FIXE=new Date(${JSON.stringify(instantISO)});
    const Vrai=Date;
    global.Date=class extends Vrai{
      constructor(...a){ super(...(a.length?a:[FIXE.getTime()])); }
      static now(){ return FIXE.getTime(); }
    };
    ${TODAY_SRC}
    process.stdout.write(today());`;
  // execFileSync (pas execSync) : on passe le code en ARGUMENT, sans passer par le shell
  // — sinon les retours à la ligne sont ré-échappés et le code devient invalide.
  return cp.execFileSync(process.execPath, ['-e', code],
                         {env:Object.assign({},process.env,{TZ:tz})}).toString();
}

console.log('\n─── LA DATE DU JOUR ──────────────────────────────────────');
// Paris l'été = UTC+2 → c'est la fenêtre minuit-2 h qui posait problème
t('Paris, 00 h 30 (été) → le bon jour, pas la veille',
  jourVu('Europe/Paris','2026-07-29T00:30:00+02:00')==='2026-07-29',
  'reçu ' + jourVu('Europe/Paris','2026-07-29T00:30:00+02:00'));
t('Paris, 01 h 59 (été) → toujours le bon jour',
  jourVu('Europe/Paris','2026-07-29T01:59:00+02:00')==='2026-07-29');
t('Paris, 23 h 30 → le jour en cours (aucune avance)',
  jourVu('Europe/Paris','2026-07-28T23:30:00+02:00')==='2026-07-28');
t('Paris, midi → inchangé (le cas normal ne bouge pas)',
  jourVu('Europe/Paris','2026-07-28T12:00:00+02:00')==='2026-07-28');
// l'hiver l'écart tombe à 1 h : la fenêtre rétrécit mais existe toujours
t('Paris, 00 h 30 (hiver, UTC+1) → le bon jour',
  jourVu('Europe/Paris','2026-01-15T00:30:00+01:00')==='2026-01-15');
// le bug symétrique : un fuseau EN RETARD basculait un jour trop TÔT
t('New York, 23 h 30 → le jour en cours, pas le lendemain',
  jourVu('America/New_York','2026-07-28T23:30:00-04:00')==='2026-07-28',
  'reçu ' + jourVu('America/New_York','2026-07-28T23:30:00-04:00'));

// ── 2. Le motif interdit ne doit revenir dans AUCUN fichier de l'app ─────────
// (Code.js et worker.js tournent sur un serveur, pas dans le téléphone : hors périmètre.)
const FICHIERS=['constants.js','state.js','screens.js','log.js','setup.js',
                'tracking.js','coach.js','food-health.js','app.js','translations.js'];
/* ⛔⛔ LES BANCS D'ESSAI AUSSI (05/09/2026) — LE TROU QUE SESSION-A A DÉCLARÉ EN LE LAISSANT.
   Dans la nuit du 04 au 05, **11 témoins du banc de parcours sont passés au rouge d'un coup**,
   sur du code applicatif parfaitement sain. Cause : les fixtures dataient en `toISOString()`
   tronqué — donc en **UTC** — pendant que les contextes de test tournent en `Europe/Paris`.
   Entre 22 h UTC et minuit, la page dit le 5 et la fixture dit le 4 : la « séance
   d'aujourd'hui » est datée d'hier, et tout s'effondre.
   👉 ***Le détecteur qui interdit ce motif ne regardait pas là où il venait de faire 11
   rouges.*** Sa liste ne portait que les 10 fichiers servis ; les runners en étaient absents.
   ⚠️ ET C'EST PIRE QU'UN TEST QUI ÉCHOUE : il n'échouait que **deux heures par jour**. Celui
   qui livre à minuit croit avoir cassé l'app — c'est exactement ce qui m'est arrivé, et j'ai
   dû rejouer un ancien commit dans un worktree pour me prouver le contraire.
   ⛔ La GARANTIE n'est pas la même des deux côtés, et le libellé du témoin le dit : dans
   l'app, un jour calculé à Greenwich donne une **fausse date à l'utilisateur** ; dans un banc,
   il donne un **faux rouge deux heures par nuit**. Même motif, deux dégâts différents. */
/* ⛔⛔ RECETTE-01 (28/09/2026) — LA LISTE ÉCRITE À LA MAIN ÉTAIT ELLE-MÊME LE TROU.
   Elle portait 7 fichiers ; les 36 modules `tests/parcours/*.js` créés depuis le 05/09, les autres
   suites et les bancs `tools/banc_*.js` lui échappaient. Mesuré le 28/09 : **13 lignes** datées en
   UTC dans 7 fichiers, dont une seule était vue. 👉 *Une liste de fichiers à surveiller se périme
   au premier fichier ajouté* : on les prend désormais TOUS, par recherche. Les 7 d'origine restent
   exigés nommément (contrôle ci-dessous), pour qu'un déplacement ne rende pas le détecteur aveugle. */
const FICHIERS_BANCS_HISTORIQUES=['tests/parcours/runner.js','tests/calculs/runner.js',
                      'tests/muscles/runner.js','tests/croises/runner.js',
                      'tests/donnees/runner.js','tests/milo/eval-scenarios.js',
                      'tests/milo/ab-memoire.js'];
const _tousJs=(dir)=>{ const out=[]; const pile=[dir];
  while(pile.length){ const d=pile.pop(); if(!fs.existsSync(path.join(R,d))) continue;
    for(const e of fs.readdirSync(path.join(R,d),{withFileTypes:true})){
      const rel=d+'/'+e.name; if(e.isDirectory()) pile.push(rel); else if(e.name.endsWith('.js')) out.push(rel); } }
  return out; };
const FICHIERS_BANCS=Array.from(new Set(FICHIERS_BANCS_HISTORIQUES.concat(
  _tousJs('tests').filter(f=>f!=='tests/dates/runner.js'),
  fs.readdirSync(path.join(R,'tools')).filter(f=>/^banc_.*\.js$/.test(f)).map(f=>'tools/'+f)))).sort();
/* Exceptions NOMMÉES, ligne par ligne, avec leur raison : jamais un fichier entier. */
const EXCEPTIONS={
  'tests/milo/eval.js': [/const ymd = new Date\(\)\.toISOString\(\)\.slice\(0,10\);/,
    "date du NOM du rapport du banc réel : jamais comparée à la page (et ce fichier part dans un workflow payant)"],
};
// on cherche la TRONCATURE en jour calendaire ; un horodatage complet reste légitime
/* RECETTE-01 : la forme « maintenant ± n jours » (`new Date(Date.now()-n*864e5)…`) est le MÊME
   défaut — c'est elle qui échappait à la ligne voisine de celle qu'on a trouvée. */
const INTERDIT=/new Date\((Date\.now\(\)\s*[-+][^()]*(\([^()]*\))?[^()]*)?\)\.toISOString\(\)\s*\.\s*(slice\(0,\s*10\)|split\('T'\)\[0\])/;
const fautifs=[], fautifsBancs=[];
for(const f of FICHIERS.concat(FICHIERS_BANCS)){
  const p=path.join(R,f); if(!fs.existsSync(p)) continue;
  let dansBloc=false;
  fs.readFileSync(p,'utf8').split('\n').forEach((l,i)=>{
    /* ⚠️⚠️ LES BLOCS `/* *​/` SONT SAUTÉS AUSSI (04/09/2026) — l'intention était DÉJÀ écrite
       à la ligne du dessous (« les commentaires citent le motif pour l'expliquer »), elle ne
       couvrait que les `//`. Le détecteur a rougi sur un COMMENTAIRE qui expliquait justement
       pourquoi il ne fallait pas écrire ce motif : *un avertissement devenait une faute*.
       ⛔ Ça n'affaiblit rien — un motif dans un commentaire ne s'exécute pas. La garantie est
       « aucun CODE ne recalcule le jour à Greenwich », jamais « le mot n'apparaît nulle part »
       (famille §31 de `BUGS.md` : un témoin visé sur la FORME et non sur la GARANTIE).
       ⛔ Contrôle négatif fait le jour même : la ligne fautive remise en CODE est bien
       rattrapée — le détecteur n'est pas devenu aveugle. */
    const sansBloc = (()=>{
      let s='', reste=l;
      while(reste.length){
        if(dansBloc){ const fin=reste.indexOf('*/'); if(fin<0) return s; dansBloc=false; reste=reste.slice(fin+2); continue; }
        const deb=reste.indexOf('/*'); if(deb<0){ s+=reste; return s; }
        s+=reste.slice(0,deb); dansBloc=true; reste=reste.slice(deb+2);
      }
      return s;
    })();
    if(sansBloc.trim().startsWith('//')) return;           // les commentaires citent le motif pour l'expliquer
    if(/typeof today\s*===?\s*'function'/.test(sansBloc)) return; // repli défensif : today() existe toujours
    const ex=EXCEPTIONS[f]; if(ex&&ex[0].test(sansBloc)) return;
    if(INTERDIT.test(sansBloc)) ((f.startsWith('tests/')||f.startsWith('tools/'))?fautifsBancs:fautifs).push(f+':'+(i+1));
  });
}
t('aucun fichier de l\'app ne recalcule le jour à l\'heure de Greenwich',
  fautifs.length===0, fautifs.join(' · '));
/* ⛔ CONTRÔLE — la liste des bancs doit pointer des fichiers qui EXISTENT. Un chemin devenu
   faux ferait un témoin vert qui ne scanne rien : le pire des deux mondes. */
t('⛔ CONTRÔLE — les bancs historiques existent tous (sinon on scanne le vide)',
  FICHIERS_BANCS_HISTORIQUES.every(f=>fs.existsSync(path.join(R,f))),
  FICHIERS_BANCS_HISTORIQUES.filter(f=>!fs.existsSync(path.join(R,f))).join(' · '));
t('⛔ CONTRÔLE — la recherche couvre bien les modules de parcours et les bancs (≥ 30 modules, ≥ 20 bancs)',
  FICHIERS_BANCS.filter(f=>f.startsWith('tests/parcours/')).length>=30
  && FICHIERS_BANCS.filter(f=>f.startsWith('tools/banc_')).length>=20,
  FICHIERS_BANCS.length+' fichiers');
t('⭐⭐ aucun BANC D\'ESSAI non plus (une fixture datée en UTC fait 11 faux rouges à minuit)',
  fautifsBancs.length===0, fautifsBancs.join(' · '));


// ── 3. RECETTE-01 — LES FIXTURES DE TEST À LA FRONTIÈRE DU JOUR (horloge gelée) ───────────
/* ⛔ Ces témoins ne dépendent PAS de l'heure à laquelle on les lance : chaque cas gèle l'horloge
   sur un instant piège, dans un processus dont on choisit le fuseau. On exerce le VRAI code :
   `tests/_jour.js` (fixtures côté Node) et `today()` lu dans `state.js` (côté page).
   ⭐ Le cas qui compte : un instant où UTC et Paris ne sont PAS encore le même jour. */
console.log('\n─── LES FIXTURES DE TEST À LA FRONTIÈRE DU JOUR ─────────────');
const JOUR_JS=path.join(R,'tests','_jour.js');
function gele(tz, instantISO, expr){
  const code=`
    const FIXE=new Date(${JSON.stringify(instantISO)});
    const Vrai=Date;
    global.Date=class extends Vrai{
      constructor(...a){ super(...(a.length?a:[FIXE.getTime()])); }
      static now(){ return FIXE.getTime(); }
    };
    ${TODAY_SRC}
    const { jourParis, jourLocal } = require(${JSON.stringify(JOUR_JS)});
    const utc = new Date().toISOString().slice(0,10);
    process.stdout.write(String(${expr}));`;
  return cp.execFileSync(process.execPath, ['-e', code],
                         {env:Object.assign({},process.env,{TZ:tz})}).toString();
}
// été : 22 h 30 UTC = 00 h 30 à Paris le LENDEMAIN
const ETE='2026-09-28T22:30:00Z', HIVER='2026-01-15T23:30:00Z', FINMOIS='2026-09-30T22:30:00Z', MIDI='2026-09-28T10:00:00Z';
t('frontière ÉTÉ (22 h 30 UTC) : UTC et Paris ne sont PAS le même jour — le cas piège existe',
  gele('UTC',ETE,'utc')==='2026-09-28' && gele('UTC',ETE,'jourParis()')==='2026-09-29',
  gele('UTC',ETE,'utc')+' / '+gele('UTC',ETE,'jourParis()'));
t('frontière HIVER (23 h 30 UTC, Paris UTC+1) : la fixture Node donne le jour de Paris',
  gele('UTC',HIVER,'jourParis()')==='2026-01-16', gele('UTC',HIVER,'jourParis()'));
t('le jour de Paris ne dépend PAS du fuseau du processus (UTC, Paris ou New York)',
  ['UTC','Europe/Paris','America/New_York'].every(tz=>gele(tz,ETE,'jourParis()')==='2026-09-29'),
  ['UTC','Europe/Paris','America/New_York'].map(tz=>tz+'='+gele(tz,ETE,'jourParis()')).join(' '));
t('décalage CALENDAIRE à la fin du mois : −2, 0, +3 depuis 00 h 30 le 1ᵉʳ octobre (Paris)',
  gele('UTC',FINMOIS,'[jourParis(-2),jourParis(),jourParis(3)].join(",")')==='2026-09-29,2026-10-01,2026-10-04',
  gele('UTC',FINMOIS,'[jourParis(-2),jourParis(),jourParis(3)].join(",")'));
t('à midi, rien ne change (le cas normal reste le cas normal)',
  gele('UTC',MIDI,'utc')===gele('UTC',MIDI,'jourParis()'));
t('contexte SANS fuseau : `jourLocal` suit le processus, donc la page (TZ=Europe/Paris → 29, TZ=UTC → 28)',
  gele('Europe/Paris',ETE,'jourLocal()')==='2026-09-29' && gele('UTC',ETE,'jourLocal()')==='2026-09-28');
t('côté PAGE : la forme employée par les parcours (`today()` décalé au calendrier) donne le jour de Paris',
  gele('Europe/Paris',ETE,'(()=>{const x=new Date();x.setDate(x.getDate()-2);return today(x.getTime());})()')==='2026-09-27'
  && gele('Europe/Paris',ETE,'today()')==='2026-09-29',
  gele('Europe/Paris',ETE,'today()'));
{ /* témoin de SOURCE, borné au bloc où le défaut a été trouvé : le journal y est ouvert au jour de la page */
  const run=fs.readFileSync(path.join(R,'tests','parcours','runner.js'),'utf8');
  const i=run.indexOf('BLOC B-CCCXVII'), j=run.indexOf('\n/* ══ BLOC', i+20);
  const blocTxt=i<0?'':run.slice(i, j<0?undefined:j);
  // une LIGNE par appel (le décalage calendaire contient lui-même des `;`) ; une variable est
  // acceptée si elle est elle-même définie par `today(` dans le bloc
  const lignes=blocTxt.split('\n').filter(l=>/journalAllerA\(/.test(l));
  const parToday=v=>new RegExp('const '+v+'\\s*=\\s*today\\(').test(blocTxt);
  const okLigne=l=>!/toISOString/.test(l) && (/journalAllerA\([^)]*today\(/.test(l)
    || /journalAllerA\(\(\(\)=>/.test(l) && /today\(/.test(l)
    || ((l.match(/journalAllerA\((\w+)\)/)||[])[1] && parToday(l.match(/journalAllerA\((\w+)\)/)[1])));
  t('bloc B-CCCXVII : chaque ouverture du journal passe par `today(` (plus aucun jour UTC)',
    lignes.length>=3 && lignes.every(okLigne), lignes.filter(l=>!okLigne(l)).join(' | ').slice(0,200)||(lignes.length+' ligne(s)'));
}
console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
process.exit(ko?1:0);
