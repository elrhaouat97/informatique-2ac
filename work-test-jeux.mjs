import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:8931';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9225','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(method, params={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method,params})); }); }
async function ev(expr){ const r = await send('Runtime.evaluate',{expression:expr, returnByValue:true, awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
const log = (...a)=>console.log(...a);
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9225/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');

  // 1) student entry (3/2)
  await send('Page.navigate',{url:BASE+'/'}); await sleep(4000);
  await ev(`(()=>{const s=document.querySelector('select[aria-label="Classe"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'3/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value;})()`);
  await sleep(800);
  await ev(`(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked)c.click(); return 'ok';})()`);
  await ev(`(()=>{const inp=document.querySelector('.student-name-input input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Sara Bennani'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 'ok';})()`);
  await sleep(400);
  await ev(`document.querySelector('button.identity-submit').click()`);
  await sleep(2500);
  log('HOME has games banner:', await ev(`!!document.querySelector('a.games-banner')`));
  log('Banner text:', await ev(`document.querySelector('a.games-banner')?.innerText.replace(/\\n/g,' | ').slice(0,120)`));
  log('Banner href:', await ev(`document.querySelector('a.games-banner')?.getAttribute('href')`));

  // 2) open session 1, check next-lesson footer, click it
  log('Open S1:', await ev(`(()=>{const b=[...document.querySelectorAll('button.session-card')].find(x=>x.querySelector('.session-index')?.textContent.trim()==='01'); if(!b) return 'not found'; b.click(); return 'clicked';})()`));
  await sleep(2500);
  log('Footer on S1:', await ev(`document.querySelector('.next-lesson')?.innerText.replace(/\\n/g,' | ').slice(0,160)`));
  log('Click next:', await ev(`(()=>{const b=document.querySelector('.next-lesson-btn'); if(!b) return 'no btn'; b.click(); return b.innerText.trim();})()`));
  await sleep(2500);
  log('After next, hero:', await ev(`document.querySelector('.session-hero-number strong')?.textContent || document.querySelector('.tab-nav')?.innerText.replace(/\\n/g,' ').slice(0,60)`));
  log('Footer on S2:', await ev(`document.querySelector('.next-lesson')?.innerText.replace(/\\n/g,' | ').slice(0,120)`));

  // 3) games hub + full playthrough of pack 1
  await send('Page.navigate',{url:BASE+'/jeux/'}); await sleep(3500);
  log('Hub packs:', await ev(`[...document.querySelectorAll('.jx-pack-title .jx-fr')].map(e=>e.textContent).join(' · ')`));
  log('Open pack 1:', await ev(`(()=>{document.querySelectorAll('.jx-pack')[0].click(); return 'ok';})()`));
  await sleep(1200);
  const next = async ()=>{ await ev(`document.querySelector('.jx-btn.next')?.click()`); await sleep(900); };
  const kind = async ()=> await ev(`document.querySelector('.jx-kind-label .jx-fr')?.textContent + ' @ ' + (document.querySelector('.jx-count')?.textContent||'')`);
  log('Q1:', await kind());
  await ev(`document.querySelectorAll('.jx-option')[0].click()`); await sleep(600);
  log('Q1 feedback:', await ev(`document.querySelector('.jx-feedback-head')?.innerText.replace(/\\n/g,' ')`)); await next();
  log('Q2:', await kind());
  await ev(`document.querySelectorAll('.jx-option')[1].click()`); await sleep(500); await next();
  log('Q3 (images):', await kind(), '| options:', await ev(`document.querySelectorAll('.jx-option.img').length`));
  await ev(`document.querySelectorAll('.jx-option.img')[0].click()`); await sleep(500); await next();
  log('Q4:', await kind());
  await ev(`document.querySelector('.jx-flash').click()`); await sleep(900);
  log('Q4 flipped:', await ev(`document.querySelector('.jx-flash')?.className`));
  await ev(`document.querySelector('.jx-know').click()`); await sleep(500); await next();
  log('Q5:', await kind());
  // match: trial-click pairs
  for(let l=0;l<4;l++){
    await ev(`(()=>{const items=[...document.querySelectorAll('.jx-match-item.left')].filter(b=>!b.disabled); if(items.length) items[0].click(); return items.length;})()`);
    await sleep(250);
    for(let r=0;r<4;r++){
      const before = await ev(`document.querySelector('.jx-match-progress')?.textContent`);
      await ev(`(()=>{const items=[...document.querySelectorAll('.jx-match-item.right')].filter(b=>!b.disabled); if(items[${r}]) items[${r}].click(); return 'ok';})()`);
      await sleep(250);
      const after = await ev(`document.querySelector('.jx-match-progress')?.textContent`);
      if(after!==before) break;
    }
  }
  log('Q5 progress:', await ev(`document.querySelector('.jx-match-progress')?.textContent`));
  await sleep(600); await next();
  log('Q6:', await kind());
  await ev(`document.querySelectorAll('.jx-tf')[0].click()`); await sleep(500); await next();
  log('Q7:', await kind());
  for(let k=0;k<3;k++){ await ev(`(()=>{const c=document.querySelector('.jx-chip.pool'); if(c) c.click(); return 'ok';})()`); await sleep(250); }
  await ev(`document.querySelector('.jx-check-btn')?.click()`); await sleep(500); await next();
  log('Q8:', await kind());
  await ev(`document.querySelectorAll('.jx-option')[2].click()`); await sleep(500); await next();
  await sleep(800);
  log('END SCREEN:', await ev(`document.querySelector('.jx-end')?.innerText.replace(/\\n/g,' | ').slice(0,200)`));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  log('EXCEPTIONS:', JSON.stringify(exc.slice(0,4)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
