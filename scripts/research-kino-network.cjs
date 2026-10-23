/* Isolated local network measurement; --after preserves the original baseline. */
const {chromium}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const out=path.resolve('qa/kino-performance-research');
const outputName=process.argv.includes('--after')?'network-after.json':'network-baseline.json';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try {
  for(const scenario of [
   {name:'catalog-unplayed',query:'?hub=kino'},
   {name:'sakura-overview-unplayed',query:'?kino=sakura'},
   {name:'sakura-part-unplayed',query:'?kino=sakura&part=1'},
   {name:'sakura-listen-first-sentence',query:'?kino=sakura&part=1',listen:true}
  ]) {
   const context=await browser.newContext({viewport:{width:1365,height:900}});
   const page=await context.newPage();
   await page.addInitScript(()=>{
    localStorage.setItem('vokabelgo_clean_slate_fresh_v2026','true');
    localStorage.setItem('vokabelgo_kino_reset_done_v2026','true');
   });
   const cdp=await context.newCDPSession(page);
   await cdp.send('Network.enable');
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:5_000_000/8,uploadThroughput:1_000_000/8,connectionType:'cellular4g'});
   const requests=new Map();
   cdp.on('Network.requestWillBeSent',e=>{
    if(/\/video\/.*\.mp4(?:\?|$)/.test(e.request.url)) requests.set(e.requestId,{url:e.request.url,range:e.request.headers.Range||e.request.headers.range||'',bytes:0,status:null});
   });
   cdp.on('Network.responseReceived',e=>{if(requests.has(e.requestId))requests.get(e.requestId).status=e.response.status;});
   cdp.on('Network.dataReceived',e=>{if(requests.has(e.requestId))requests.get(e.requestId).bytes+=e.encodedDataLength||0;});
   await page.goto('http://127.0.0.1:3000/'+scenario.query,{waitUntil:'domcontentloaded'});
   if(scenario.listen) await page.locator('#kinoListenSentences').click();
   await page.waitForTimeout(6000);
   const prePlayBytes=[...requests.values()].reduce((s,r)=>s+r.bytes,0);
   let firstFrameMs=null;
   if(scenario.listen) {
    await page.evaluate(()=>{
     const v=document.getElementById('kinoMainVideo');
     window.__kinoResearch={start:performance.now(),firstFrameMs:null};
     v.addEventListener('playing',()=>{
      if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(()=>window.__kinoResearch.firstFrameMs=performance.now()-window.__kinoResearch.start);
      else window.__kinoResearch.firstFrameMs=performance.now()-window.__kinoResearch.start;
     },{once:true});
    });
    await page.locator('#kinoPlayLoopBtn').click();
    await page.waitForFunction(()=>window.__kinoResearch.firstFrameMs!==null,{timeout:12000}).catch(()=>{});
    firstFrameMs=await page.evaluate(()=>window.__kinoResearch.firstFrameMs);
   }
   const players=await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>/kino/i.test(v.id)).map(v=>({id:v.id,preload:v.preload,src:v.getAttribute('src'),visible:!!v.getClientRects().length,currentTime:v.currentTime,readyState:v.readyState,buffered:Array.from({length:v.buffered.length},(_,i)=>[v.buffered.start(i),v.buffered.end(i)])})));
   results.push({scenario:scenario.name,profile:'Simulated 5 Mbps download, 1 Mbps upload, 100 ms latency; fresh isolated desktop Chromium context',additionalWaitAfterUiReadySeconds:6,prePlayBytes,manualReplayFirstFrameMs:firstFrameMs,note:scenario.listen?'Opening listen mode itself plays the first sentence. The subsequent button click measures replay startup, not first-ever playback.':'No play action was performed.',players,requests:[...requests.values()]});
   fs.writeFileSync(path.join(out,outputName),JSON.stringify({limitations:'Localhost with network emulation; one run per scenario, not a Vietnam CDN/mobile benchmark. Video bytes count from navigation through UI readiness plus six additional seconds; this is not a strict six-second transfer test. No user browser data was changed by this measurement.',results},null,2));
   console.log(JSON.stringify({scenario:scenario.name,prePlayMB:Math.round(prePlayBytes/1e4)/100,requests:requests.size,firstFrameMs}));
   await context.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
