#!/usr/bin/env node
/**
 * GÉNÈRE docs/EXERCICES-MUSCLES.md — la carte « exercice → figurine → parties du corps ».
 *
 * Demandé par Michel le 30/07/2026 (après le bug de l'écarté buste penché) : la liste de TOUS
 * les exercices du catalogue avec les muscles que la figurine colorie (principaux/secondaires),
 * la région du corps et le schéma de mouvement.
 *
 * ⚠️ GÉNÉRÉ DEPUIS LE CODE, jamais écrit à la main (même principe que tools/inventaire.py :
 * une liste manuelle redevient fausse en trois semaines). Il appelle les VRAIES fonctions de
 * l'app (_mscScores, _calSessRegion, _movPattern) dans un navigateur headless — pas une copie
 * de leur logique (leçon des faux audits : « on mesure en appelant la vraie fonction »).
 *
 * Relancer après toute modif de _MEX / _MOV_PATTERNS / EXLIB :
 *   node tools/exercices-muscles.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block'});
const p=await c.newPage();
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2200);

const data=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e&&e.n).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  const LBL={};Object.keys(_MG).forEach(k=>LBL[k]=_MG[k].label);
  const MOV={};(_MOV_PATTERNS||[]).forEach(m=>MOV[m.id]=m.label);
  const REG={bas:'Bas du corps',haut:'Haut du corps',dos:'Dos',tronc:'Gainage',full:'Full body'};
  const rows=[];
  for(const n of noms){
    const d=_mscScores([{name:n,sets:[{kg:50,reps:8,done:true,type:'N'}]}])||{};
    const sc=d.sc||{};
    const prim=Object.keys(sc).filter(k=>sc[k]>=2).map(k=>LBL[k]||k);
    const sec =Object.keys(sc).filter(k=>sc[k]===1).map(k=>LBL[k]||k);
    const reg=_calSessRegion({date:'2026-07-30',exs:[{name:n,sets:[{kg:50,reps:8,done:true,type:'N'}]}]});
    const mov=_movPattern(n);
    rows.push({n,prim,sec,reg:REG[reg]||'—',mov:MOV[mov]||(mov||'—')});
  }
  return {rows, total:noms.length};
});

const today=new Date().toISOString().slice(0,10);
let out=`# 🗺️ Exercices → figurine → parties du corps

> **⚙️ FICHIER GÉNÉRÉ — ne pas éditer à la main.** Régénérer : \`node tools/exercices-muscles.js\`
> (il interroge les vraies fonctions de l'app : \`_mscScores\` / \`_calSessRegion\` / \`_movPattern\`).
> Dernière génération : ${today} · **${data.total} exercices** du catalogue.
>
> **Comment lire :** les muscles **principaux** sont ceux que la figurine colorie le plus fort,
> les *secondaires* sont coloriés plus doux. La **région** est celle utilisée par la couleur du
> calendrier et la répartition en % de la carte Milo. Un **exercice perso** suit exactement les
> mêmes règles (il est reconnu par son nom).

`;
const groupes={};
for(const r of data.rows){(groupes[r.reg]=groupes[r.reg]||[]).push(r);}
const ordre=['Bas du corps','Haut du corps','Dos','Gainage','Full body','—'];
for(const g of ordre){
  const rows=groupes[g];if(!rows||!rows.length)continue;
  out+=`\n## ${g} (${rows.length} exercices)\n\n| Exercice | Muscles principaux (figurine) | Muscles secondaires | Schéma de mouvement |\n|---|---|---|---|\n`;
  for(const r of rows){
    out+=`| ${r.n} | **${r.prim.join(', ')||'—'}** | ${r.sec.join(', ')||'—'} | ${r.mov} |\n`;
  }
}
out+=`\n---\n*Toute erreur repérée dans cette carte = une règle à corriger dans \`_MEX\` (log.js) — la corriger là-bas puis régénérer ce fichier.*\n`;
fs.writeFileSync(path.join(ROOT,'docs/EXERCICES-MUSCLES.md'),out);
console.log('docs/EXERCICES-MUSCLES.md généré — '+data.total+' exercices.');
await b.close(); srv.close();
})().catch(e=>{console.error(e);process.exit(2);});
