import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9226','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9226/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4000);
  await ev(`(()=>{const s=document.querySelector('select[aria-label="Classe"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'2/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return 1;})()`);
  await sleep(700);
  await ev(`(()=>{const inp=document.querySelectorAll('.student-name-input input')[0]; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Sara Bennani'); inp.dispatchEvent(new Event('input',{bubbles:true})); const inp2=document.querySelectorAll('.student-name-input input')[1]; if(inp2){ set.call(inp2,'Omar Test'); inp2.dispatchEvent(new Event('input',{bubbles:true})); } return 1;})()`);
  await sleep(400);
  await ev(`document.querySelector('button.identity-submit').click()`); await sleep(2500);
  console.log('STATE after submit:', await ev(`document.body.innerText.slice(0,180).replace(/\n/g,' ')`));
  console.log('Games link on home sidebar:', await ev(`document.querySelector('a.games-link')?.innerText.replace(/\\n/g,' ')`));
  await ev(`(()=>{const b=[...document.querySelectorAll('button.session-card')].find(x=>x.querySelector('.session-index')?.textContent.trim()==='01'); b&&b.click(); return 1;})()`);
  await sleep(2500);
  console.log('Games link inside lesson:', await ev(`document.querySelector('a.games-link')?.innerText.replace(/\\n/g,' ')`));
  await ev(`document.querySelector('a.games-link').click()`); await sleep(3000);
  console.log('After click URL + hub:', await ev(`location.pathname + ' | packs=' + document.querySelectorAll('.jx-pack').length`));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  console.log('EXCEPTIONS:', JSON.stringify(exc.slice(0,3)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
