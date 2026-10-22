const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const {chromium}=require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const base=process.argv[2]||'http://localhost:3110';
const output=path.resolve(__dirname,'../.impeccable/review/home-collaboration-fkg');
const pixels=bytes=>sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/pengalaman`,{waitUntil:'networkidle'});
    const image=page.getByAltText('Fakultas Kedokteran Gigi Universitas Indonesia',{exact:true}).first();
    await image.scrollIntoViewIfNeeded();await image.evaluate(n=>n.decode());
    const mark=image.locator('xpath=ancestor::*[@data-organization-logo][1]');
    assert.equal(await mark.getAttribute('data-logo-appearance'),'lighten-dark');
    const rendered=await pixels(await mark.screenshot({path:path.join(output,'fkg-white-lettering.png')}));
    const filter=await image.evaluate(n=>{const value=n.style.filter;n.style.filter='none';return value;});
    const original=await pixels(await mark.screenshot());
    await image.evaluate((n,value)=>{n.style.filter=value;},filter);
    let yellow=0,green=0,delta=0,newWhite=0;
    for(let i=0;i<original.data.length;i+=original.info.channels){
      const a=original.data,b=rendered.data;
      const yellowPixel=a[i]>160&&a[i+1]>130&&a[i+2]<90;
      const greenPixel=a[i]<70&&a[i+1]>100&&a[i+2]<120&&a[i+1]>a[i]+50;
      if(yellowPixel||greenPixel){yellow+=+yellowPixel;green+=+greenPixel;delta+=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);}
      if(a[i]<180&&a[i+1]<180&&a[i+2]<180&&b[i]>220&&b[i+1]>220&&b[i+2]>220)newWhite++;
    }
    assert.ok(yellow>50&&green>10,'Both FKG brand colors remain visible');
    assert.ok(delta/(yellow+green)<3,'Yellow/green RGB values retained');
    console.log('PASS FKG UI neutral lettering lifted; yellow/green preserved',{yellow,green,meanDelta:delta/(yellow+green),newWhite});
    assert.ok(newWhite>100,'Black and gray lettering becomes visibly white at the rendered logo size');
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:1000});
      await page.goto(base,{waitUntil:'networkidle'});
      const response=await page.request.get(`${base}/api/content`),data=await response.json(),content=data.content||data;
      const expected=content.collaborations.filter(item=>item&&item.name&&item.logo).map(item=>item.name);
      for(const route of ['', '/proyek']){
        if(route)await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
        const section=page.locator('.collaborations'),track=section.locator('.collaboration-track');
        assert.equal(await section.count(),1,'Exactly one collaboration section per page');
        // Home mounts lower sections on approach; wait for their layout to settle
        // before sending pointer coordinates captured from the logo strip.
        let previousTop=NaN,stable=0;
        for(let attempt=0;attempt<12&&stable<2;attempt++){
          await track.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
          await page.waitForTimeout(250);
          const bounds=await track.boundingBox();
          stable=bounds.y>=160&&bounds.y+bounds.height<=920&&Math.abs(bounds.y-previousTop)<1?stable+1:0;
          previousTop=bounds.y;
        }
        assert.equal(stable,2,'Logo strip is settled within the viewport before real mouse interaction');
        const primary=section.locator('.collaboration-group:not([aria-hidden])');
        assert.deepEqual(await primary.locator('.collaboration-caption').allTextContents(),expected,'Home and Projects use the current CMS list');
        assert.equal(await primary.locator('img').count(),expected.length);
        assert.equal(await primary.locator('.collaboration-example').count(),content.collaborations.filter(item=>item&&item.name&&item.logo&&item.status!=='collaboration').length,'Sample logos retain their labels');
        assert.equal(await section.locator('button').count(),0);
        assert.equal(await track.evaluate(n=>getComputedStyle(n).scrollbarWidth),'none');
        await track.hover();
        const box=await track.boundingBox(),x=box.x+box.width*.7,y=box.y+box.height/2;
        const before=await track.evaluate(n=>n.scrollLeft);
        await page.mouse.move(x,y);await page.mouse.wheel(0,180);await page.waitForTimeout(150);
        const wheel=await track.evaluate(n=>n.scrollLeft);
        if(wheel<=before+100)console.log('Wheel target',await page.evaluate(({x,y})=>({x,y,target:document.elementFromPoint(x,y)?.outerHTML.slice(0,250),track:document.querySelector('.collaboration-track')?.getBoundingClientRect().toJSON()}),{x,y}));
        assert.ok(wheel>before+100,`Mouse wheel scrolls the strip: ${route||'Home'} ${width}px ${before} -> ${wheel}`);
        await page.mouse.down();await page.mouse.move(x-140,y,{steps:10});await page.mouse.up();
        assert.ok(await track.evaluate(n=>n.scrollLeft)>wheel+100,'Mouse drag scrolls the strip');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
        await section.screenshot({path:path.join(output,`${route?'projects':'home'}-${width}.png`)});
        console.log('PASS',route||'Home',width,'CMS logos, sample labels, mouse wheel/drag, hidden scrollbar');
      }
    }
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
