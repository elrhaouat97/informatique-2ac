import { spawn } from 'node:child_process';
const CHROME = process.env.HOME + '/workspace/remotion-test/browser/chrome-headless-shell-linux64/chrome-headless-shell';
const chrome = spawn(CHROME, ['--no-sandbox','--disable-gpu','--remote-debugging-port=9228','about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, idc=0; const pending=new Map(); const events=[];
function send(m,p={}){ return new Promise((res,rej)=>{ const id=++idc; pending.set(id,{res,rej}); ws.send(JSON.stringify({id,method:m,params:p})); }); }
async function ev(x){ const r=await send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) return 'EXC: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text); return r.result?.value; }
try{
  let list=[]; for(let i=0;i<30;i++){ try{ const r=await fetch('http://127.0.0.1:9228/json/list'); list=await r.json(); if(list.length) break;}catch{} await sleep(300); }
  const page=list.find(t=>t.type==='page'); ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ ws.onopen=res; ws.onerror=rej; });
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){ const p=pending.get(m.id); pending.delete(m.id); m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);} else if(m.method) events.push(m); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:8931/'}); await sleep(4000);
  // if a resume screen from an earlier profile appears, switch to a new student
  console.log('Resume handled:', await ev("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('autre élève')); if(b){b.click(); return 'clicked';} return 'no resume screen';})()"));
  await sleep(1200);
  // new student Omar (no submissions yet)
  await ev("(()=>{const s=document.querySelector('select[aria-label=\"Classe\"]'); const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set; set.call(s,'2/2'); s.dispatchEvent(new Event('change',{bubbles:true})); return 1;})()");
  await sleep(700);
  await ev("(()=>{const c=document.querySelector('.pair-check input[type=checkbox]'); if(c&&c.checked)c.click(); return 1;})()");
  await ev("(()=>{const inp=document.querySelector('.student-name-input input'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(inp,'Omar El Fassi'); inp.dispatchEvent(new Event('input',{bubbles:true})); return 1;})()");
  await sleep(400);
  await ev("document.querySelector('button.identity-submit').click()"); await sleep(2500);
  await ev("(()=>{const b=[...document.querySelectorAll('button.session-card')].find(x=>x.querySelector('.session-index')&&x.querySelector('.session-index').textContent.trim()==='01'); if(b)b.click(); return 1;})()");
  await sleep(2500);
  console.log('GATE mission tab (expect none):', await ev("document.querySelectorAll('.next-lesson').length"));
  await ev("(()=>{const b=[...document.querySelectorAll('.tab-nav button')].find(x=>x.textContent.includes('Évaluation')); if(b)b.click(); return 1;})()");
  await sleep(1800);
  console.log('GATE quiz tab hint (expect 1 locked-hint, 0 btn):', await ev("document.querySelectorAll('.next-lesson.locked-hint').length + ' / ' + document.querySelectorAll('.next-lesson-btn').length"));
  const answers = ['les informations','son','un état final','semi-automatique','automatique','double-clique'];
  for(let i=0;i<answers.length;i++){
    const a = answers[i];
    const clicked = await ev("(()=>{const b=[...document.querySelectorAll('.simple-quiz button')].find(x=>x.textContent.includes('" + a.replace(/'/g,"\\'") + "')); if(b){b.click(); return 'choice ok';} return 'choice NOT FOUND';})()");
    console.log('Q'+(i+1), clicked);
    await sleep(500);
    const nav = await ev("(()=>{const b=[...document.querySelectorAll('.simple-quiz button')].find(x=>/suivant|Valider/i.test(x.textContent)); if(b){const t=b.textContent.trim().slice(0,30); b.click(); return t;} return 'nav NOT FOUND';})()");
    console.log('  nav:', nav);
    await sleep(900);
  }
  console.log('Quiz result:', await ev("document.querySelector('.quiz-result') ? document.querySelector('.quiz-result').innerText.replace(/\\s+/g,' ').slice(0,90) : 'no result'"));
  console.log('AFTER PASS footer btn (expect 1):', await ev("document.querySelectorAll('.next-lesson-btn').length + ' text=' + (document.querySelector('.next-lesson-btn')?.textContent.trim()||'')"));
  await ev("document.querySelector('.next-lesson-btn')?.click()"); await sleep(2500);
  console.log('After click hero (expect 02):', await ev("document.querySelector('.session-hero-number strong')?.textContent || '?'"));
  const exc = events.filter(x=>x.method==='Runtime.exceptionThrown').map(x=>x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  console.log('EXCEPTIONS:', JSON.stringify(exc.slice(0,3)));
} finally { try{ws&&ws.close()}catch{} chrome.kill('SIGKILL'); }
