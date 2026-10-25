const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {chromium}=require('C:/Users/jaela/AppData/Local/Programs/REA/cli/node_modules/rea-agents/node_modules/playwright-core');
const {getPayloadFromClientToken}=require('@vercel/blob/client');
const {del}=require('@vercel/blob');
const {validateUpload}=require('../frontend/lib/upload-policy.cjs');
require('@next/env').loadEnvConfig(path.resolve(__dirname,'..'));
const base=process.argv[2]||'http://localhost:3116';
const temporary=[];
const output=path.resolve(__dirname,'../.impeccable/review/upload-fix');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=','base64');
const metadata=(type='image/png',size=png.length,pathname=`cms/${new Date().toISOString().slice(0,10)}/${randomUUID()}.png`)=>({type:'blob.generate-client-token',payload:{pathname,multipart:false,clientPayload:JSON.stringify({type,size})}});
async function publicBytes(url) {
  for(let attempt=0;attempt<2;attempt++){
    try{const response=await fetch(url,{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200);return Buffer.from(await response.arrayBuffer());}
    catch(error){if(attempt===1)throw error;}
  }
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  assert.ok(validateUpload({type:'image/svg+xml',size:10}));
  assert.ok(validateUpload({type:'constructor',size:10}));
  assert.ok(validateUpload(null));
  assert.equal(validateUpload({type:'application/pdf',size:1}),'');
  assert.equal(validateUpload({type:'application/pdf',size:500*1024*1024}),'');
  assert.equal(validateUpload({name:'IMG.HEIC',type:'',size:100}),'');
  assert.equal(validateUpload({name:'IMG.HEIF',type:'application/octet-stream',size:100}),'');
  assert.ok(validateUpload({type:'image/heic',size:0}));
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try{
    const context=await browser.newContext({viewport:{width:484,height:850}});
    const anonymous=await context.request.post(`${base}/api/upload`,{data:metadata()});
    assert.equal(anonymous.status(),401,'Anonymous users cannot obtain upload tokens');
    const login=await context.request.post(`${base}/api/auth/login`,{data:{password:process.env.ADMIN_PASSWORD}});
    assert.equal(login.status(),200,'Configured admin login works');
    const allowed=await context.request.post(`${base}/api/upload`,{data:metadata()});
    assert.equal(allowed.status(),200,`Token request failed: ${JSON.stringify(await allowed.json())}`);
    const token=(await allowed.json()).clientToken;
    const authorization=await allowed.json();
    if(authorization.provider==='supabase'){
      assert.ok(/\/storage\/v1\/object\/upload\/sign\/portfolio-media\/cms\//.test(authorization.uploadUrl),'Signed upload URL is restricted to the CMS bucket/path');
      assert.match(authorization.url,/\/storage\/v1\/object\/public\/portfolio-media\/cms\//);
      const {createClient}=require('@supabase/supabase-js');
      const storage=createClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}).storage;
      const {data:bucket,error}=await storage.getBucket('portfolio-media');assert.equal(error,null);
      assert.equal(bucket.file_size_limit,null,'No custom bucket size cap');assert.ok(bucket.allowed_mime_types.includes('image/heic'));assert.ok(bucket.allowed_mime_types.includes('image/heif'));assert.ok(!bucket.allowed_mime_types.includes('image/svg+xml'));
    }else{
      assert.ok(token,'Only an authenticated admin gets a client token');
      const policy=getPayloadFromClientToken(token);
      assert.equal(policy.maximumSizeInBytes,undefined);
      assert.deepEqual(policy.allowedContentTypes,['image/png']);
      assert.equal(policy.allowOverwrite,false);
      assert.ok(policy.validUntil>Date.now()&&policy.validUntil<Date.now()+301000);
    }
    const bigMetadata=metadata('application/pdf',500*1024*1024,`cms/${new Date().toISOString().slice(0,10)}/${randomUUID()}.pdf`);
    assert.equal((await context.request.post(`${base}/api/upload`,{data:bigMetadata})).status(),200,'CMS imposes no maximum MB (storage limits still apply)');
    for(const body of [metadata('image/svg+xml',10),metadata('image/png',0),metadata('image/png',10,'../../evil.png'),{type:'blob.generate-client-token',payload:{clientPayload:'null'}}]){
      assert.equal((await context.request.post(`${base}/api/upload`,{data:body})).status(),400,'Invalid file/path cannot obtain a token');
    }
    assert.equal((await context.request.post(`${base}/api/upload`,{headers:{Origin:'https://unrelated.invalid'},data:metadata()})).status(),403);
    console.log('PASS admin auth, origin, MIME/path checks; no CMS maximum or nonzero-file minimum');

    const page=await context.newPage();const errors=[];let cmsWrites=0;const tokenSizes=[];
    const storageErrors=[];
    page.on('response',async response=>{if(/blob.vercel-storage.com|vercel.com\/api\/blob/.test(response.url())&&response.status()>=400)storageErrors.push({status:response.status(),body:(await response.text().catch(()=>'' )).slice(0,500)});});
    page.on('requestfailed',request=>{if(request.url().includes('blob.vercel-storage.com'))storageErrors.push({failed:request.failure()?.errorText});});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(new URL(request.url()).pathname==='/api/upload')tokenSizes.push(Buffer.byteLength(request.postData()||''));});
    await page.route('**/api/content',route=>{if(route.request().method()==='POST'){cmsWrites++;return route.abort();}return route.continue();});
    await page.goto(`${base}/admin`,{waitUntil:'networkidle'});
    await page.getByText('Resume / CV PDF',{exact:true}).waitFor();
    const imageInput=page.locator('input[type=file][accept*="image/heic"]').first();
    const imageBox=imageInput.locator('xpath=ancestor::label[1]/..');
    const imageUrlInput=imageBox.locator('input[type=text]');
    const previousImage=await imageUrlInput.inputValue();
    const large=Buffer.concat([png,Buffer.alloc(13*1024*1024-png.length)]);
    await imageInput.setInputFiles({name:`cms-large-proof-${Date.now()}.png`,mimeType:'image/png',buffer:large});
    try{await page.waitForFunction(previous=>{const file=document.querySelector('input[type=file][accept*="image/heic"]');const value=file?.closest('label')?.parentElement.querySelector('input[type=text]')?.value;return value&&value!==previous&&value.includes('/cms/');},previousImage,{timeout:120000});}
    catch(error){console.log('Upload failure evidence:',{alerts:await page.getByRole('alert').allTextContents(),storageErrors});await page.screenshot({path:path.join(output,'upload-failure.png')});throw error;}
    const imageUrl=await imageUrlInput.inputValue();assert.match(imageUrl,authorization.provider==='supabase'?/\/storage\/v1\/object\/public\/portfolio-media\/cms\//:/\.public\.blob\.vercel-storage\.com\/cms\//);temporary.push(imageUrl);
    assert.equal((await publicBytes(imageUrl)).length,large.length);
    console.log('PASS browser 13 MB image -> real storage -> public URL, exceeding the former 10 MB limit');

    const heic=path.resolve(__dirname,'../.impeccable/review/heic-test/example.heic');
    if(!fs.existsSync(heic)){
      const response=await fetch('https://raw.githubusercontent.com/strukturag/libheif/master/examples/example.heic');assert.equal(response.status,200);
      const fixture=Buffer.from(await response.arrayBuffer());assert.ok(fixture.length>0&&fixture.length<5*1024*1024);
      fs.mkdirSync(path.dirname(heic),{recursive:true});fs.writeFileSync(heic,fixture,{flag:'wx'});
    }
    await imageInput.setInputFiles({name:'IPHONE.HEIC',mimeType:'',buffer:fs.readFileSync(heic)});
    await page.waitForFunction(previous=>{const file=document.querySelector('input[type=file][accept*="image/heic"]');const value=file?.closest('label')?.parentElement.querySelector('input[type=text]')?.value;return value&&value!==previous&&value.endsWith('.jpg');},imageUrl,{timeout:120000});
    const jpegUrl=await imageUrlInput.inputValue();temporary.push(jpegUrl);
    const jpegBytes=await publicBytes(jpegUrl);assert.equal(jpegBytes[0],255);assert.equal(jpegBytes[1],216);
    const dimensions=await require('sharp')(jpegBytes).metadata();assert.ok(dimensions.width>100&&dimensions.height>100);
    console.log('PASS HEIC with empty browser MIME -> real JPEG -> public readable image', {width:dimensions.width,height:dimensions.height});
    const uploadsBeforeBroken=tokenSizes.length;
    await imageInput.setInputFiles({name:'broken.heic',mimeType:'image/heic',buffer:Buffer.from('broken')});
    await page.getByRole('alert').filter({hasText:'Foto HEIC/HEIF tidak bisa dibaca.'}).waitFor({timeout:60000});
    assert.equal(tokenSizes.length,uploadsBeforeBroken,'Corrupt HEIC never reaches storage');

    const cvField=page.getByText('Resume / CV PDF',{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    await cvField.locator('input[type=file]').setInputFiles({name:`cms-pdf-proof-${Date.now()}.pdf`,mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n% CMS transport test only\n%%EOF')});
    await cvField.getByText('File masuk ke form. Klik Simpan supaya tampil di halaman utama.',{exact:true}).waitFor({timeout:60000});
    const pdfUrl=await cvField.locator('input:not([type=file])').inputValue();temporary.push(pdfUrl);
    assert.ok((await publicBytes(pdfUrl)).length>0);
    console.log('PASS PDF upload -> URL in CMS form (real storage)');

    const before=tokenSizes.length;
    await cvField.locator('input[type=file]').setInputFiles({name:'empty.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(0)});
    await cvField.getByRole('alert').filter({hasText:'File kosong atau tidak valid.'}).waitFor();
    assert.equal(tokenSizes.length,before,'An empty file is rejected before any network upload');
    assert.ok(tokenSizes.length===3&&tokenSizes.every(size=>size<1024),'Only small JSON authorization requests traverse the Function');
    assert.equal(cmsWrites,0,'Verification never saves or overwrites portfolio content');
    assert.deepEqual(errors,[]);
    await cvField.screenshot({path:path.join(output,'cms-upload-validation.png')});
    console.log('PASS clear inline validation, unchanged CMS content, no browser errors');
  }finally{
    await browser.close();
    for(const url of temporary){
      if(url.includes('/storage/v1/object/public/portfolio-media/')){
        const {createClient}=require('@supabase/supabase-js');
        const storage=createClient(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}).storage;
        const object=decodeURIComponent(new URL(url).pathname.split('/storage/v1/object/public/portfolio-media/')[1]);
        assert.ok(object.startsWith('cms/'));
        const {error}=await storage.from('portfolio-media').remove([object]);if(error)throw error;
      }else await del(url);
      console.log('Temporary verification upload deleted');
    }
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
