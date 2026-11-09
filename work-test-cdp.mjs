import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const URL = process.argv[2];
const CLASSVAL = process.argv[3];
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9223','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function targets(){ const r = await fetch('http://127.0.0.1:9223/json/list'); return r.json(); }
let ws, idc=0; const pending = new Map(); const events=[];
function send(method, params={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method,params})); }); }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ list=await targets(); if(list.length) break;}catch{} await sleep(300); }
  const page = list.find(t=>t.type==='page'); if(!page) throw new Error('no page target');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if(m.id && pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result); } else if(m.method){ events.push(m); } };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Page.navigate',{url:URL});
  await sleep(4000);
  const before = await send('Runtime.evaluate',{expression:`document.querySelector('select[aria-label="Classe"]') ? document.querySelector('select[aria-label="Classe"]').innerHTML.slice(0,300) : 'NO SELECT'`, returnByValue:true});
  console.log('SELECT OPTIONS:', before.result?.value);
  const set = await send('Runtime.evaluate',{expression:`(()=>{const s=document.querySelector('select[aria-label="Classe"]'); if(!s) return 'no select'; const setter=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; setter.call(s,'${CLASSVAL}'); s.dispatchEvent(new Event('change',{bubbles:true})); return 'set to '+s.value;})()`, returnByValue:true});
  console.log('SET RESULT:', set.result?.value);
  await sleep(3000);
  const crashed = events.some(e=>e.method==='Inspector.targetCrashed');
  const state = await send('Runtime.evaluate',{expression:`document.body ? document.body.innerText.slice(0,400) : 'NO BODY'`, returnByValue:true}).catch(e=>({err:String(e)}));
  console.log('TARGET CRASHED:', crashed);
  console.log('PAGE STATE:', JSON.stringify(state.result?.value ?? state));
  const errs = events.filter(e=>['Runtime.exceptionThrown','Log.entryAdded','Runtime.consoleAPICalled'].includes(e.method)).map(e=>JSON.stringify(e.params).slice(0,300));
  for(const e of events.filter(x=>x.method==='Runtime.exceptionThrown')){const d=e.params.exceptionDetails;console.log('EXC:',d.exception?.description||d.text);for(const f of (d.stackTrace?.callFrames||[]))console.log('  at',f.functionName||'(anon)',f.url?.split('/').pop(),f.lineNumber,f.columnNumber);}
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
