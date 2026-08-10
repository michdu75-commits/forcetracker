const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({serviceWorkers:'block'})).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>{
    const syn={};
    try{ for(const k in _EX_EQUIV) syn[k]=_EX_EQUIV[k]; }catch(e){}
    let stop=[]; try{ stop=[..._EX_STOP]; }catch(e){}
    return {syn:syn, nb:Object.keys(syn).length, stop:stop};
  });
  fs.writeFileSync('./export/synonymes.json', JSON.stringify(r,null,1));
  console.log('synonymes', r.nb, '· mots vides', r.stop.length);
  await b.close();
})();
