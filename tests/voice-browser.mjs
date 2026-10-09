import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
const page = await browser.newPage({viewport:{width:390,height:844}});
const errors=[]; const loaded=[];
page.on('pageerror', error=>errors.push(error.message));
await page.addInitScript(() => {
  window.voiceSpoken=[]; window.localPrompts=[];
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text=text; } };
  window.speechSynthesis.getVoices = () => [{localService:true,lang:'en-US',name:'Offline test voice'}];
  window.speechSynthesis.speak = utterance => {window.voiceSpoken.push(utterance.text);setTimeout(()=>utterance.onend?.(),20);};
  window.speechSynthesis.cancel = () => {};
  window.LanguageModel = {
    async availability() { return 'available'; },
    async create(options) {
      return {
        async prompt(history, {signal}) {
          window.localPrompts.push(options.initialPrompts[0].content);
          const question=history.at(-1).content;
          if(question==='Slow response') await new Promise((resolve,reject)=>{setTimeout(resolve,1000);signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')));});
          signal.throwIfAborted();
          if(question==='Explain HungerRush') return 'On it! [EMOJI:thumbsup] I led the HungerRush migration from V B dot NET to Angular.';
          return 'My backend stack includes C-sharp and dot NET Core.';
        }, destroy() {},
      };
    },
  };
});
await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname!=='portfolio.test') return route.fulfill({body:''});
  const pathname=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
  const file=path.join(root,pathname);
  try {
    const body=await readFile(file); const size=(await stat(file)).size;
    loaded.push({path:pathname,size});
    const contentType=pathname.endsWith('.js')?'application/javascript':pathname.endsWith('.css')?'text/css':pathname.endsWith('.html')?'text/html':'application/octet-stream';
    return route.fulfill({body,contentType});
  } catch { return route.fulfill({status:404,body:''}); }
});
await page.goto('https://portfolio.test/');
await page.getByRole('button',{name:'Talk with my AI'}).click();
await page.getByRole('button',{name:'Use browser AI'}).waitFor();
assert.ok(loaded.every(file=>file.size<1000000),'No large runtime/model downloads on page visit');
assert.equal(await page.getByRole('button',{name:'Send',exact:true}).isDisabled(),true);
await page.getByRole('button',{name:'Use browser AI'}).click();
await page.getByRole('status').filter({hasText:'Ready · on-device AI'}).waitFor();
await page.getByPlaceholder('Ask about my work…').fill('What is your backend stack?');
await page.getByRole('button',{name:'Send',exact:true}).click();
await page.getByRole('log').getByText('My backend stack includes C-sharp and dot NET Core.',{exact:false}).waitFor();
assert.equal(await page.locator('.voice-particle').count(),0);
await page.getByPlaceholder('Ask about my work…').fill('Explain HungerRush');
await page.getByRole('button',{name:'Send',exact:true}).click();
await page.locator('.voice-particle').waitFor();
assert.equal(await page.locator('.voice-particle').textContent(),'👍');
assert.equal((await page.evaluate(()=>window.voiceSpoken)).length,2);
assert.ok((await page.evaluate(()=>window.voiceSpoken)).every(text=>!text.includes('[EMOJI:')));
assert.ok((await page.evaluate(()=>window.localPrompts.at(-1))).includes('HungerRush'));
const box=await page.locator('.voice-panel').boundingBox();
assert.ok(box.x>=0&&box.x+box.width<=390);
await page.screenshot({path:process.env.VOICE_SCREENSHOT || '/tmp/portfolio-voice-mobile.png'});
await page.getByPlaceholder('Ask about my work…').fill('Slow response');
await page.getByRole('button',{name:'Send',exact:true}).click();
await page.getByRole('status').filter({hasText:'Thinking'}).waitFor();
const before=await page.locator('.voice-assistant').count();
await page.getByRole('button',{name:'Stop',exact:true}).click();
await page.waitForTimeout(1200);
assert.equal(await page.locator('.voice-assistant').count(),before);
await page.getByRole('button',{name:'Reset',exact:true}).click();
assert.equal(await page.locator('.voice-turn').count(),0);
await page.keyboard.press('Escape');
assert.equal(await page.locator('.voice-panel').count(),0);
assert.equal(await page.getByRole('button',{name:'Talk with my AI'}).evaluate(element=>document.activeElement===element),true);
assert.deepEqual(errors,[]);
assert.equal(await page.getByRole('alert').count(),0);
console.log('Browser checks pass: opt-in local model, no eager model/runtime downloads, local context, sparse cues, clean TTS, mobile, cancellation, reset and focus; no page errors.');
const gpu=await page.evaluate(async()=> {try{return Boolean(navigator.gpu && await navigator.gpu.requestAdapter());}catch{return false;}});
console.log('Real WebGPU adapter in test browser:',gpu);
await browser.close();
