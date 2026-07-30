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
  const rows=[];const svgs={};
  for(const n of noms){
    const d=_mscScores([{name:n,sets:[{kg:50,reps:8,done:true,type:'N'}]}])||{};
    const sc=d.sc||{};
    const prim=Object.keys(sc).filter(k=>sc[k]>=2).map(k=>LBL[k]||k);
    const sec =Object.keys(sc).filter(k=>sc[k]===1).map(k=>LBL[k]||k);
    const reg=_calSessRegion({date:'2026-07-30',exs:[{name:n,sets:[{kg:50,reps:8,done:true,type:'N'}]}]});
    const mov=_movPattern(n);
    // figurine RÉELLE de l'app, dédupliquée : même combinaison de muscles = même dessin
    const key=Object.keys(sc).sort().map(k=>k+sc[k]).join('|')||'vide';
    if(!svgs[key])svgs[key]={sc:sc,ind:d.ind||{}};
    rows.push({n,prim,sec,reg:REG[reg]||'—',mov:MOV[mov]||(mov||'—'),key});
  }
  return {rows, total:noms.length, combos:Object.keys(svgs), svgSpecs:svgs};
});

// Chaque figurine unique est CAPTURÉE en petite image (le SVG anatomique brut pèse ~160 Ko
// pièce ; 41 dessins = 6,8 Mo — en PNG 96 px, ~6 Ko pièce → page légère).
const pngs={};
await p.evaluate(()=>{const d=document.createElement('div');d.id='figshot';
  d.style.cssText='position:fixed;top:0;left:0;width:96px;background:#0d0f14;z-index:99999;';
  document.body.appendChild(d);});
for(const key of data.combos){
  await p.evaluate(({key,spec})=>{document.getElementById('figshot').innerHTML=_mscSVG(spec);},
                   {key,spec:data.svgSpecs[key]});
  const el=await p.$('#figshot');
  pngs[key]='data:image/png;base64,'+(await el.screenshot({type:'png'})).toString('base64');
}

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

// ── Version HTML avec les VRAIES figurines (demande Michel 30/07 : « sous forme de tableau,
//    avec les figurines associées ») — chaque figurine unique = une classe CSS définie UNE fois
//    (les lignes s'y réfèrent) pour garder le fichier léger.
const figCls={};let figCss='';
data.combos.forEach((k,i)=>{figCls[k]='k'+i;figCss+=`.k${i}{background-image:url(${pngs[k]})}\n`;});
let html=`<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Force Tracker — Exercices, figurines et muscles</title>
<style>
:root{color-scheme:dark}
body{margin:0;padding:14px;background:#0d0f14;color:#e8eaf0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:14px}
h1{font-size:19px;margin:6px 0 2px}
.sub{color:#9aa0ae;font-size:12.5px;margin-bottom:14px;line-height:1.5}
h2{font-size:15px;margin:22px 0 8px;color:#ff5a6e;position:sticky;top:0;background:#0d0f14;padding:8px 0;border-bottom:1px solid #262a33}
table{width:100%;border-collapse:collapse}
th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#9aa0ae;text-align:left;padding:6px 8px;border-bottom:1px solid #262a33}
td{padding:7px 8px;border-bottom:1px solid #1a1e26;vertical-align:middle}
tr:nth-child(even) td{background:#11141b}
.fig{width:52px;min-width:52px}
.fg{width:48px;height:86px;background-size:contain;background-repeat:no-repeat;background-position:center;border-radius:6px}
${figCss}
.nom{font-weight:700;min-width:120px}
.prim{color:#ff5a6e;font-weight:600}
.sec{color:#ffb26b}
.mov{color:#9aa0ae;font-size:12px}
.legende{background:#151922;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#c6cad4;margin-bottom:6px;line-height:1.6}
.dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin:0 4px -1px 0}
</style></head><body>
<h1>🗺️ Exercices → figurine → muscles</h1>
<div class="sub">Généré depuis le code le ${today} · ${data.total} exercices · <i>node tools/exercices-muscles.js</i> pour régénérer.</div>
<div class="legende"><span class="dot" style="background:#FF2D55"></span><b>Rouge</b> = muscles principaux &nbsp;·&nbsp; <span class="dot" style="background:#FF9500"></span><b>Orange</b> = secondaires. La figurine affichée est <b>exactement</b> celle que l'app dessine pour cet exercice (un exercice perso suit les mêmes règles, reconnu par son nom).</div>
`;
for(const g of ordre){
  const rows=groupes[g];if(!rows||!rows.length)continue;
  html+=`<h2>${g} — ${rows.length} exercices</h2>\n<table><tr><th>Figurine</th><th>Exercice</th><th>Muscles principaux</th><th>Secondaires</th><th>Mouvement</th></tr>\n`;
  for(const r of rows){
    html+=`<tr><td class="fig"><div class="fg ${figCls[r.key]||''}"></div></td><td class="nom">${r.n}</td><td class="prim">${r.prim.join(', ')||'—'}</td><td class="sec">${r.sec.join(', ')||'—'}</td><td class="mov">${r.mov}</td></tr>\n`;
  }
  html+=`</table>\n`;
}
html+=`<div class="sub" style="margin-top:16px">Une erreur repérée ici = une règle à corriger dans le moteur (log.js), puis on régénère cette page.</div></body></html>`;
fs.writeFileSync(path.join(ROOT,'docs/EXERCICES-MUSCLES.html'),html);
const ko=Math.round(html.length/1024);
console.log('docs/EXERCICES-MUSCLES.html généré — '+data.combos.length+' figurines uniques, '+ko+' Ko.');
await b.close(); srv.close();
})().catch(e=>{console.error(e);process.exit(2);});
