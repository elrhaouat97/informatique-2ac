import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9233','--user-data-dir=/tmp/gl-journey-profile','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9233/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4000);
  console.log('ENTRY: group select (expect 0):', await ev("document.querySelectorAll('select[aria-label=\"Groupe\"]').length"));
  console.log('ENTRY: chips (expect 9):', await ev("document.querySelectorAll('.class-chips .chip').length"));
  console.log('ENTRY: mode cards (expect 2):', await ev("document.querySelectorAll('.mode-card').length"));
  await ev("(()=>{const b=[...document.querySelectorAll('.class-chips .chip')].find(x=>x.textContent.trim()==='3/2'); if(b)b.click(); return 1;})()");
  await sleep(500);
  await ev("(()=>{const b=[...document.querySelectorAll('.mode-card')].find(x=>x.textContent.includes('وحدي')); if(b)b.click(); return 1;})()");
  await sleep(400);
  console.log('ENTRY: name fields in solo (expect 1):', await ev("document.querySelectorAll('.student-name-input input').length"));
  await ev("(()=>{const inp=document.querySelector('.student-name-input input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Sara Bennani'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()");
  await sleep(400);
  await ev("document.querySelector('button.identity-submit').click()"); await sleep(2800);
  console.log('HOME hero start:', await ev("(()=>{const b=document.querySelector('.hero-start'); return b?b.textContent.trim().slice(0,40):'ABSENT';})()"));
  await ev("document.querySelector('.hero-start')?.click()"); await sleep(2500);
  console.log('S1 open hero (expect 01):', await ev("document.querySelector('.session-hero-number strong')?.textContent || '?'"));
  const tabState = await ev("(()=>{const m={}; document.querySelectorAll('.tab-nav button').forEach(b=>{const k=b.textContent.includes('Mission')?'mission':b.textContent.includes('Atelier')?'atelier':b.textContent.includes('Trace')?'trace':b.textContent.includes('Évaluation')?'quiz':'?'; m[k]=b.disabled?'LOCKED':'open';}); return JSON.stringify(m);})()");
  console.log('TABS at start (mission/atelier open, trace/quiz LOCKED):', tabState);
  await ev("(()=>{const b=[...document.querySelectorAll('.tab-nav button')].find(x=>x.textContent.includes('Atelier')); if(b)b.click(); return 1;})()");
  await sleep(1500);
  const tabState2 = await ev("(()=>{const m={}; document.querySelectorAll('.tab-nav button').forEach(b=>{const k=b.textContent.includes('Trace')?'trace':b.textContent.includes('Évaluation')?'quiz':'?'; if(k!=='?')m[k]=b.disabled?'LOCKED':'open';}); return JSON.stringify(m);})()");
  console.log('TABS after workshop visit (trace open, quiz LOCKED):', tabState2);
  await ev("(()=>{const b=[...document.querySelectorAll('.tab-nav button')].find(x=>x.textContent.includes('Trace')); if(b)b.click(); return 1;})()");
  await sleep(1500);
  console.log('TRACE guide:', await ev("document.querySelector('.trace-guide') ? 'shown' : 'ABSENT'"));
  console.log('TRACE cta:', await ev("document.querySelector('.stage-cta') ? document.querySelector('.stage-cta').textContent.trim().slice(0,45) : 'ABSENT'"));
  await ev("document.querySelector('.stage-cta')?.click()"); await sleep(1800);
  console.log('QUIZ visible after CTA:', await ev("!!document.querySelector('.simple-quiz')"));
  const answers = ['les informations','son','un état final','semi-automatique','automatique','double-clique'];
  for(let i=0;i<answers.length;i++){
    const a = answers[i];
    await ev("(()=>{const b=[...document.querySelectorAll('.simple-quiz button')].find(x=>x.textContent.includes('" + a.replace(/'/g,"\\'") + "')); if(b)b.click(); return 1;})()");
    await sleep(450);
    await ev("(()=>{const b=[...document.querySelectorAll('.simple-quiz button')].find(x=>/suivant|Valider/i.test(x.textContent)); if(b)b.click(); return 1;})()");
    await sleep(850);
  }
  console.log('Score:', await ev("document.querySelector('.quiz-result')?.innerText.replace(/\\s+/g,' ').slice(0,40) || 'none'"));
  console.log('CELEBRATION:', await ev("document.querySelector('.pass-celebration') ? document.querySelector('.pass-celebration').textContent.trim().slice(0,50) : 'ABSENT'"));
  console.log('NEXT BTN:', await ev("document.querySelectorAll('.next-lesson-btn').length"));
  await ev("document.querySelector('.next-lesson-btn')?.click()"); await sleep(2500);
  console.log('S2 open hero (expect 02):', await ev("document.querySelector('.session-hero-number strong')?.textContent || '?'"));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  console.log('EXCEPTIONS:', JSON.stringify(exc.slice(0,3)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
