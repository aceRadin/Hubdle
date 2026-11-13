const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const vm=require('node:vm');
const {chromium}=require(process.env.HUBA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
test('cópia local contém exatamente as mesmas listas dos JSON',async()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(await fs.readFile(path.join(root,'dados/wording-listas.js'),'utf8'),context);
 for(const name of ['palavra.json','words.json'])assert.equal(JSON.stringify(context.window.HUBA_WORD_LISTS[name]),JSON.stringify(JSON.parse(await fs.readFile(path.join(root,'dados',name),'utf8'))));
});
test('Wording funciona abrindo index.html diretamente, sem fetch nem upload',async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.HUBA_CHROME?{executablePath:process.env.HUBA_CHROME}:{})});
 try{
  const page=await browser.newPage(),errors=[],jsonRequests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\.json(?:\?|$)/.test(r.url()))jsonRequests.push(r.url())});
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto(pathToFileURL(path.join(root,'jogos/wording/index.html')).href); await page.locator('#huba-tutorial .primary').click();
  await page.waitForFunction(()=>document.querySelectorAll('#wTilesDaily button').length===3&&!document.querySelector('#wTilesDaily button').disabled);
  assert.equal(await page.locator('#wLoadJson,#wResetJson,input[type=file]').count(),0);
  for(const lang of ['pt','en']){
   await page.locator('.huba-locale>summary').click();
   await page.locator('[data-site-lang="'+lang+'"]').click();
   for(let i=0;i<3;i++){
    await page.locator('#wTilesDaily button').nth(i).click();assert.equal(await page.locator('.w-board').count(),[1,2,4][i]);
    await page.locator('#wTitle').click();await page.keyboard.type('ab');await page.keyboard.press('Space');await page.keyboard.press('Backspace');
    await page.locator('#wBack').click();
   }
  }
  await page.evaluate(()=>HUBA.setMode('training'));await page.locator('#wTilesDaily button').first().click();
  const words=JSON.parse(await fs.readFile(path.join(root,'dados/words.json'),'utf8'));const word=Array.isArray(words)?words[0]:words.en.words[0];
  await page.locator('#wTitle').click();for(let i=0;i<6&&!(await page.locator('#wResult').isVisible());i++){await page.keyboard.type(word);await page.keyboard.press('Enter')}
  assert.equal(await page.locator('#wResult').isVisible(),true);
  await page.getByRole('button',{name:'How to play'}).click();
  await page.getByRole('button',{name:'Got it'}).press('Escape');
  assert.equal(await page.locator('#wResult').isVisible(),true);
  assert.equal(await page.locator('#wNext').textContent(),'Next game');
  await page.locator('#wNext').press('Enter');
  assert.equal(await page.locator('.w-board').count(),2);
  assert.equal(await page.locator('#wResult').isVisible(),false);
  assert.equal(await page.evaluate(()=>HUBA.mode),'training');

  await page.evaluate(target=>{
   HUBA.setMode('daily');
   const list=window.HUBA_WORD_LISTS['words.json'];
   const size=(Array.isArray(list)?list:list.en.words).length;
   for(const [mode,count,tries] of [['termo',1,6],['dueto',2,7],['quarteto',4,9]]){
    localStorage.setItem('word2:'+HUBA.dayKey()+':en:'+mode+':'+size,JSON.stringify({
     g:Array(tries).fill(target),targets:Array.from({length:count},()=>({n:'zzzzz',d:'zzzzz'}))
    }));
   }
  },word);
  await page.locator('#wTilesDaily button').first().click();
  for(const count of [1,2,4]){
   assert.equal(await page.locator('.w-board').count(),count);
   assert.equal(await page.locator('#wResult').isVisible(),true);
   if(count<4)await page.locator('#wNext').click();
  }
  assert.deepEqual(await page.locator('#wResult button:visible').evaluateAll(buttons=>buttons.map(button=>button.id)),['wBack2']);
  assert.equal(await page.locator('#wSrc').textContent(),'');assert.deepEqual(jsonRequests,[]);assert.deepEqual(errors,[]);
 }finally{await browser.close()}
});
