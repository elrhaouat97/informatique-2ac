import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9227','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9227/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4000);
  console.log('STEP0 page:', JSON.stringify(await ev('document.body.innerText.slice(0,120)')));
  await ev("(()=>{const s=document.querySelector('select[aria-label=\"Classe\"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'2/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return 1;})()");
  await sleep(700);
  console.log('STEP1 solo:', await ev("(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked)c.click(); return c?c.checked:'none';})()"));
  await ev("(()=>{const inp=document.querySelector('.student-name-input input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Sara Bennani'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()");
  await sleep(400);
  await ev("document.querySelector('button.identity-submit').click()"); await sleep(2500);
  console.log('STEP2 home?:', JSON.stringify(await ev('document.body.innerText.slice(0,150)')));
  console.log('STEP2 games-link:', await ev("document.querySelector('a.games-link') ? document.querySelector('a.games-link').textContent.trim() : 'ABSENT'"));
  console.log('STEP2 sidebar html has games-link:', await ev("document.querySelector('aside.sidebar') ? document.querySelector('aside.sidebar').innerHTML.includes('games-link') : 'no aside'"));
  await ev("(()=>{const b=[...document.querySelectorAll('button.session-card')].find(x=>x.querySelector('.session-index')&&x.querySelector('.session-index').textContent.trim()==='01'); if(b)b.click(); return b?'clicked':'nf';})()");
  await sleep(2500);
  console.log('IN-LESSON games-link:', await ev("document.querySelector('a.games-link') ? document.querySelector('a.games-link').textContent.trim() : 'ABSENT'"));
  await ev("document.querySelector('a.games-link').click()");
  await sleep(3000);
  console.log('AFTER CLICK:', await ev("location.pathname + ' packs=' + document.querySelectorAll('.jx-pack').length"));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
