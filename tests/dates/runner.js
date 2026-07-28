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
// on cherche la TRONCATURE en jour calendaire ; un horodatage complet reste légitime
const INTERDIT=/new Date\(\)\.toISOString\(\)\s*\.\s*(slice\(0,\s*10\)|split\('T'\)\[0\])/;
const fautifs=[];
for(const f of FICHIERS){
  const p=path.join(R,f); if(!fs.existsSync(p)) continue;
  fs.readFileSync(p,'utf8').split('\n').forEach((l,i)=>{
    if(l.trim().startsWith('//')) return;                 // les commentaires citent le motif pour l'expliquer
    if(/typeof today\s*===?\s*'function'/.test(l)) return; // repli défensif : today() existe toujours
    if(INTERDIT.test(l)) fautifs.push(f+':'+(i+1));
  });
}
t('aucun fichier de l\'app ne recalcule le jour à l\'heure de Greenwich',
  fautifs.length===0, fautifs.join(' · '));

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
process.exit(ko?1:0);
