const { chromium } = require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const base=process.argv[2]||'http://localhost:3109';
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const events=[], failures=[];
    page.on('pageerror',error=>failures.push(error.message));
    page.on('requestfailed',request=>{if(/spotify/.test(request.url())) failures.push(`${request.failure()?.errorText}: ${request.url()}`);});
    await page.addInitScript(()=>{
      window.spotifyEvidence=[];
      window.addEventListener('message',event=>{
        if(!/^https:\/\/([a-z]+\.)?spotify\.com$/.test(event.origin))return;
        let data=event.data;try{if(typeof data==='string')data=JSON.parse(data);}catch{return;}
        if(data?.type)window.spotifyEvidence.push({origin:event.origin,type:data.type,data:data.data});
      });
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.locator('#sosial-media').scrollIntoViewIfNeeded();
    await page.getByRole('tab',{name:'Instagram',exact:true}).click();
    const music=page.locator('[data-music-state]');await music.waitFor();
    await page.waitForTimeout(12000);
    events.push({phase:'automatic',state:await music.getAttribute('data-music-state'),text:await music.innerText(),frames:page.frames().map(frame=>frame.url())});
    const button=page.getByRole('button',{name:'Putar musik',exact:true});
    if(await button.count() && await button.isEnabled()) {await button.click();await page.waitForTimeout(6000);events.push({phase:'manual',state:await music.getAttribute('data-music-state')});}
    const output=path.resolve(__dirname,'../.impeccable/review/instagram-autoplay');fs.mkdirSync(output,{recursive:true});
    await music.screenshot({path:path.join(output,'real-spotify.png')});
    console.log(JSON.stringify({base,events,failures,messages:await page.evaluate(()=>window.spotifyEvidence)},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
