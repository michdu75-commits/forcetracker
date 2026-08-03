#!/usr/bin/env node
/**
 * VÉRIFIE UNE FIGURINE LIVRÉE — dit en une seconde si le fichier est exploitable.
 *
 * POURQUOI. Sans ce contrôle, on découvre les problèmes en branchant, c'est-à-dire trop
 * tard : le fournisseur est payé et parti. Ici on sait AVANT de valider.
 *
 * Lancer : node tools/verif_figurine.js chemin/vers/figurine.svg
 */
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const cible=process.argv[2];
if(!cible){ console.error('usage : node tools/verif_figurine.js <fichier.svg>'); process.exit(2); }
if(!fs.existsSync(cible)){ console.error('fichier introuvable : '+cible); process.exit(2); }

// la liste attendue vient du GABARIT — une seule source de vérité (R2)
const gab=fs.readFileSync(path.join(ROOT,'docs/figurine-gabarit.svg'),'utf8');
const attendus=[...gab.matchAll(/id="([a-z_0-9]+)"\s+data-muscle/g)].map(m=>m[1]);
// ⚠️ On retire les COMMENTAIRES avant d'analyser : le gabarit contient la phrase
// « pas de <image> » dans sa notice, et mon contrôle la lisait comme une vraie balise —
// il signalait une image dans un fichier qui n'en a aucune. Un contrôle qui lit sa propre
// notice, c'est la famille 12 de BUGS.md.
const brut=fs.readFileSync(cible,'utf8');
const s=brut.replace(/<!--[\s\S]*?-->/g,'');

let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};
console.log('\n═══ VÉRIFICATION : '+path.basename(cible)+' ('+Math.round(fs.statSync(cible).size/1024)+' Ko) ═══');

// ① c'est bien du vectoriel, pas une image déguisée
const img=(s.match(/<image\b/g)||[]).length;
const b64=/base64,/.test(s);
t('① c\'est du VECTORIEL, pas une image emballée dans un SVG',
  img===0 && !b64, img+' balise(s) <image>'+(b64?' · données base64 détectées':'')
  +'\n         → on ne peut pas colorier une zone d\'une photo. C\'est le piège n°1.');

// ② tous les emplacements sont là
const presents=new Set([...s.matchAll(/id="([a-z_0-9]+)"/g)].map(m=>m[1]));
const absents=attendus.filter(a=>!presents.has(a));
t('② les '+attendus.length+' muscles attendus sont tous présents',
  absents.length===0, absents.length+' manquant(s) : '+absents.slice(0,12).join(', ')
  +(absents.length>12?' … et '+(absents.length-12)+' autres':''));

// ③ chaque muscle a bien une FORME (un d= non vide)
const vides=attendus.filter(a=>{
  const m=s.match(new RegExp('<path[^>]*id="'+a+'"[^>]*>'));
  if(!m) return false;                    // déjà signalé en ②
  const d=m[0].match(/\sd="([^"]*)"/);
  return !d || d[1].trim().length<8;
});
t('③ chaque muscle porte une forme réelle (attribut d= rempli)',
  vides.length===0, vides.length+' vide(s) : '+vides.slice(0,12).join(', '));

// ④ les attributs de rattachement sont conservés
const sansAttr=attendus.filter(a=>{
  const m=s.match(new RegExp('<path[^>]*id="'+a+'"[^>]*>'));
  return m && !/data-group=/.test(m[0]);
});
t('④ les attributs data-group / data-muscle sont conservés',
  sansAttr.length===0, sansAttr.length+' sans data-group : '+sansAttr.slice(0,8).join(', '));

// ⑤ la zone de dessin n'a pas bougé (sinon la figurine ne s'aligne plus dans l'app)
const vb=(s.match(/viewBox="([^"]+)"/)||[])[1];
t('⑤ la zone de dessin est conservée (viewBox)',
  vb==='-1 0 72 96', 'reçu : '+(vb||'aucun')+' · attendu : -1 0 72 96'
  +'\n         → une autre zone est acceptable, mais il faudra alors réajuster l\'app.');

// ⑥ pas de doublon d'identifiant (deux formes pour le même muscle = coloriage imprévisible)
const tous=[...s.matchAll(/id="([a-z_0-9]+)"/g)].map(m=>m[1]);
const dbl=[...new Set(tous.filter((x,i)=>tous.indexOf(x)!==i))];
t('⑥ aucun identifiant en double', dbl.length===0, dbl.slice(0,8).join(', '));

// ⑦ la silhouette (peau) est présente
t('⑦ la silhouette est présente (peau, tête, mains, pieds)',
  /silhouette/i.test(s), 'aucun tracé « silhouette » trouvé');

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ '+ko+' problème(s) — le fichier n\'est PAS exploitable tel quel.':'✅ Fichier exploitable : je peux le brancher.'));
process.exit(ko?1:0);
