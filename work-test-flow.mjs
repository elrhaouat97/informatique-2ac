import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const URL = process.argv[2], CLS = process.argv[3], NAME = process.argv[4];
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9224','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(method, params={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method,params})); }); }
async function ev(expr){ const r = await send('Runtime.evaluate',{expression:expr, returnByValue:true, awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9224/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:URL}); await sleep(4000);
  console.log('STEP class:', await ev(`(()=>{const s=document.querySelector('select[aria-label="Classe"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'${CLS}'); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value;})()`));
  await sleep(1500);
  console.log('STEP solo:', await ev(`(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked){c.click();} return c? 'pair='+c.checked : 'no checkbox';})()`));
  await sleep(500);
  console.log('STEP name:', await ev(`(()=>{const inp=document.querySelector('.student-name-input input'); if(!inp) return 'no input'; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'${NAME}'); inp.dispatchEvent(new Event('input',{bubbles:true})); return inp.value;})()`));
  await sleep(500);
  console.log('STEP submit:', await ev(`(()=>{const b=document.querySelector('button.identity-submit'); if(!b) return 'no button'; b.click(); return 'clicked';})()`));
  await sleep(3500);
  const state = await ev(`document.body.innerText.slice(0,300)`);
  console.log('FINAL STATE:', JSON.stringify(state));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  console.log('EXCEPTIONS:', JSON.stringify(exc.slice(0,3)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
