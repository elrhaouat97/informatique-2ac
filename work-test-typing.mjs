import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9232','--user-data-dir=/tmp/gl-typing-profile','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9232/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  // local server still up?
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4000);
  console.log('page:', JSON.stringify(await ev("document.body.innerText.slice(0,60)")));
  await ev("(()=>{const s=document.querySelector('select[aria-label=\"Classe\"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'2/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return 1;})()");
  await sleep(700);
  await ev("(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked)c.click(); return 1;})()");
  await ev("(()=>{const inp=document.querySelector('.student-name-input input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Romayssa Alaoui'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()");
  await sleep(400);
  await ev("document.querySelector('button.identity-submit').click()"); await sleep(2500);
  await ev("(()=>{const b=[...document.querySelectorAll('button.session-card')].find(x=>x.querySelector('.session-index')&&x.querySelector('.session-index').textContent.trim()==='01'); if(b)b.click(); return 1;})()");
  await sleep(2200);
  await ev("(()=>{const b=[...document.querySelectorAll('.tab-nav button')].find(x=>x.textContent.includes('Atelier')); if(b)b.click(); return 1;})()");
  await sleep(2000);
  console.log('ATELIER VIEW:', JSON.stringify(await ev("document.body.innerText.slice(0,400)")));
  console.log('ATELIER BUTTONS:', await ev("[...document.querySelectorAll('button')].map(b=>b.textContent.trim().slice(0,32)).filter(Boolean).slice(0,25).join(' | ')"));
  // Exercice 1: click targets 1..5 in order
  for(const n of ['1','2','3','4','5']){ await ev("(()=>{const b=[...document.querySelectorAll('.gesture-board button, .click-board button, button')].find(x=>x.textContent.trim()==='" + n + "'); if(b)b.click(); return 1;})()"); await sleep(350); }
  await sleep(600);
  await ev("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Exercice suivant/.test(x.textContent)); if(b)b.click(); return 1;})()"); await sleep(1500);
  // Exercice 2: double-click the folder
  console.log('EX2 dblclick:', await ev("(()=>{const b=document.querySelector('.double-click-board button'); if(!b) return 'ABSENT'; b.dispatchEvent(new MouseEvent('dblclick',{bubbles:true})); return 'dispatched';})()"));
  await sleep(800);
  await ev("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Exercice suivant/.test(x.textContent)); if(b)b.click(); return 1;})()"); await sleep(1500);
  console.log('HINT element:', await ev("(()=>{const h=document.querySelector('.typing-mobile-hint'); if(!h) return 'ABSENT'; const r=h.getBoundingClientRect(); return 'present, h='+Math.round(r.height)+' text=' + h.textContent.trim().slice(0,60);})()"));
  console.log('typing board present:', await ev("!!document.querySelector('.typing-board')"));
  console.log('enter is a BUTTON:', await ev("(()=>{const e=document.querySelector('.typing-enter'); return e?e.tagName:'ABSENT';})()"));
  await ev("(()=>{const inp=document.querySelector('.typing-board input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Romayssa'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()");
  await sleep(400);
  await ev("document.querySelector('.typing-enter').click()"); await sleep(1200);
  console.log('feedback after TAP:', await ev("document.body.innerText.includes('Tu as utilisé le clavier') ? 'SUCCESS feedback shown' : 'NOT SHOWN: ' + (document.querySelector('.exercise-feedback')?.textContent||'no feedback el')"));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  console.log('EXCEPTIONS:', JSON.stringify(exc.slice(0,3)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
