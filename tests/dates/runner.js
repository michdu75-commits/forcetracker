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
const FICHIERS_BANCS=['tests/parcours/runner.js','tests/calculs/runner.js',
                      'tests/muscles/runner.js','tests/croises/runner.js',
                      'tests/donnees/runner.js','tests/milo/eval-scenarios.js',
                      'tests/milo/ab-memoire.js'];
// on cherche la TRONCATURE en jour calendaire ; un horodatage complet reste légitime
const INTERDIT=/new Date\(\)\.toISOString\(\)\s*\.\s*(slice\(0,\s*10\)|split\('T'\)\[0\])/;
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
    if(INTERDIT.test(sansBloc)) (f.startsWith('tests/')?fautifsBancs:fautifs).push(f+':'+(i+1));
  });
}
t('aucun fichier de l\'app ne recalcule le jour à l\'heure de Greenwich',
  fautifs.length===0, fautifs.join(' · '));
/* ⛔ CONTRÔLE — la liste des bancs doit pointer des fichiers qui EXISTENT. Un chemin devenu
   faux ferait un témoin vert qui ne scanne rien : le pire des deux mondes. */
t('⛔ CONTRÔLE — les bancs listés existent tous (sinon on scanne le vide)',
  FICHIERS_BANCS.every(f=>fs.existsSync(path.join(R,f))),
  FICHIERS_BANCS.filter(f=>!fs.existsSync(path.join(R,f))).join(' · '));
t('⭐⭐ aucun BANC D\'ESSAI non plus (une fixture datée en UTC fait 11 faux rouges à minuit)',
  fautifsBancs.length===0, fautifsBancs.join(' · '));

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
process.exit(ko?1:0);
