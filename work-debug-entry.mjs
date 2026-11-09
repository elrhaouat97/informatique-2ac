import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9229','--user-data-dir=/tmp/gl-debug-profile','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9229/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4500);
  console.log('has select:', await ev("!!document.querySelector('select[aria-label=\"Classe\"]')"));
  await ev("(()=>{const s=document.querySelector('select[aria-label=\"Classe\"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'2/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value;})()");
  await sleep(900);
  await ev("(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked)c.click(); return c?String(c.checked):'none';})()");
  console.log('name set:', await ev("(()=>{const inp=document.querySelector('.student-name-input input'); if(!inp) return 'NO INPUT'; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Omar Test'); inp.dispatchEvent(new Event('input',{bubbles:true})); return inp.value;})()"));
  await sleep(600);
  console.log('submit click:', await ev("(()=>{const b=document.querySelector('button.identity-submit'); if(!b) return 'NO BTN'; b.click(); return 'clicked: '+b.textContent.trim().slice(0,30);})()"));
  await sleep(3000);
  console.log('error div:', await ev("document.querySelector('.identity-error')?.textContent || 'none'"));
  console.log('page now:', JSON.stringify(await ev("document.body.innerText.slice(0,140)")));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
