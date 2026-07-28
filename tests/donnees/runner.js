#!/usr/bin/env node
/**
 * GARDE-FOU : « l'app sait, Milo ne sait pas » ne doit plus arriver par OUBLI.
 *
 * Pourquoi ce test existe (28/07/2026, demande de Michel) — c'est la famille de
 * bugs la plus fréquente du projet (règle R4). Elle se répète parce que l'oubli
 * est SILENCIEUX : ajouter une donnée sans la donner à Milo ne plante pas, ne
 * lève aucune erreur, ne casse aucun test. Milo répond juste un peu moins bien,
 * et personne ne peut le voir. Cas connus : les charges (ft-v625), les temps de
 * repos (ft-v626), l'ordre des exercices (ft-v627), les consignes (ft-v628),
 * le prénom (ft-v652).
 *
 * Ce que fait ce test : il lit TOUTES les données que l'app charge au démarrage
 * (state.js → load()) et exige que chacune soit CLASSÉE dans
 * tests/donnees/donnees-milo.json :
 *   · transmis  — Milo la reçoit
 *   · exclu     — volontairement pas transmise, AVEC LA RAISON
 *   · manquant  — trou connu, à combler (signalé mais ne bloque pas)
 *
 * Une donnée non classée fait ÉCHOUER la livraison. On ne peut plus oublier :
 * on peut seulement décider.
 *
 * Lancer : node tests/donnees/runner.js
 */
const fs=require('fs'), path=require('path');
const R=path.resolve(__dirname,'../..');

const src=fs.readFileSync(path.join(R,'state.js'),'utf8');
const i=src.indexOf('function load('); const j=src.indexOf('\nfunction ',i+10);
if(i<0||j<0){ console.error('❌ load() introuvable dans state.js'); process.exit(1); }
const champs=[...new Set([...src.slice(i,j).matchAll(/^\s*S\.([A-Za-z_]\w*)\s*=/gm)].map(m=>m[1]))].sort();

const inv=JSON.parse(fs.readFileSync(path.join(__dirname,'donnees-milo.json'),'utf8'));
const transmis=new Set(inv.transmis), exclu=inv.exclu, manquant=inv.manquant;

const nonClasses=champs.filter(c=>!transmis.has(c)&&!exclu[c]&&!manquant[c]);
const sansRaison=Object.entries(exclu).filter(([k,v])=>!v||String(v).trim().length<15).map(([k])=>k);
const fantomes=[...transmis,...Object.keys(exclu),...Object.keys(manquant)].filter(c=>!champs.includes(c));

console.log('\n─── DONNÉES DE L\'APP → MILO ──────────────────────────────');
console.log(`  ${champs.length} données chargées au démarrage`);
console.log(`  ✅ ${champs.filter(c=>transmis.has(c)).length} transmises à Milo`);
console.log(`  ⚪ ${champs.filter(c=>exclu[c]).length} volontairement exclues`);
console.log(`  ⚠️  ${champs.filter(c=>manquant[c]).length} trous connus, à combler :`);
for(const c of champs.filter(c=>manquant[c])) console.log(`       · ${c} — ${manquant[c]}`);

let ko=0;
if(nonClasses.length){ ko++;
  console.log('\n❌ DONNÉES NON CLASSÉES — décide avant de livrer :');
  for(const c of nonClasses) console.log(`     · S.${c}`);
  console.log('   → ajoute-la dans tests/donnees/donnees-milo.json :');
  console.log('     "transmis" si Milo doit la connaître · "exclu" AVEC LA RAISON sinon.');
}
if(sansRaison.length){ ko++;
  console.log('\n❌ EXCLUSIONS SANS RAISON ÉCRITE : '+sansRaison.join(', '));
  console.log('   → une exclusion sans raison finit toujours par être contournée.');
}
if(fantomes.length){ ko++;
  console.log('\n❌ CLASSÉES MAIS ABSENTES DE state.js (données supprimées ?) : '+fantomes.join(', '));
}
console.log('──────────────────────────────────────────────────────────');
console.log(ko?'❌ ÉCHEC':'✅ Toutes les données sont classées.');
process.exit(ko?1:0);
