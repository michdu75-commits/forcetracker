const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');
const S=(process.env.OUT||'./export/')+'';
(async()=>{
  const uni=JSON.parse(fs.readFileSync((process.env.UNI||'./export/uni.json'),'utf8'));
  const b=await chromium.launch();
  const p=await (await b.newContext({serviceWorkers:'block'})).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  const data=await p.evaluate((uni)=>{
    const U=new Set(uni), out=[];
    for(const e of EXLIB){
      let id=null,pat=null,met=null,mus=null,img=null,yt=null;
      try{ id=exId(e.n); }catch(x){}
      try{ pat=_movPattern(e.n); }catch(x){}
      try{ met=getExerciseMET(e.n); }catch(x){}
      try{ mus=(typeof EX_MUSCLES!=='undefined'&&id)?EX_MUSCLES[id]:null; }catch(x){}
      try{ const y=(typeof EX_YT!=='undefined')?EX_YT[e.n]:null; if(y){img=y.img||null; yt=y.yt||y.id||null;} }catch(x){}
      out.push({id:id,nom:e.n,groupe:e.g,
        muscles_primaires:(mus&&mus.p)||[], muscles_secondaires:(mus&&mus.s)||[],
        pattern:pat, met:met, unilateral:U.has(e.n), image:img, youtube:yt});
    }
    return out;
  },uni);
  fs.writeFileSync(S+'catalogue-exercices.json',JSON.stringify(data,null,1));
  console.log('exercices',data.length,
    '| image',data.filter(x=>x.image).length,
    '| muscles',data.filter(x=>x.muscles_primaires.length).length,
    '| uni',data.filter(x=>x.unilateral).length);
})();
