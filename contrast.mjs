const section=document.querySelector('#contrast');
const comparison=section.querySelector('.comparison');
const balance=section.querySelector('#reality-balance');
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.hasAttribute('data-reduced-motion');
if(balance){
 balance.addEventListener('input',()=>{
  comparison.style.setProperty('--split',`${balance.value}%`);
  balance.setAttribute('aria-valuetext',`${balance.value}% before, ${100-Number(balance.value)}% with Webomancy`);
 });
}
let queued=0,visible=false;
function drawSeam(){
 queued=0;if(!visible)return;
 const rect=comparison.getBoundingClientRect();
 const progress=reduced()?1:Math.max(0,Math.min(1,(innerHeight*.76-rect.top)/rect.height));
 comparison.style.setProperty('--seam-progress',progress.toFixed(4));
 stampPassedCards();
}
function schedule(){if(!queued)queued=requestAnimationFrame(drawSeam);}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();}).observe(comparison);
addEventListener('scroll',()=>{if(visible)schedule();},{passive:true});
addEventListener('resize',schedule,{passive:true});
const image=section.querySelector('.portfolio-window');
let lensFrame=0,lensX=76,lensY=55;
image.addEventListener('pointermove',event=>{
 if(event.pointerType==='touch'||reduced())return;
 const r=image.getBoundingClientRect();lensX=(event.clientX-r.left)/r.width*100;lensY=(event.clientY-r.top)/r.height*100;
 if(!lensFrame)lensFrame=requestAnimationFrame(()=>{lensFrame=0;image.style.setProperty('--lens-x',`${lensX}%`);image.style.setProperty('--lens-y',`${lensY}%`);});
},{passive:true});
// A card must pass through the reading area before a downward scroll stamps it.
// This shares the existing scroll frame; no timers or continuous animation loop.
const stampCards=[...section.querySelectorAll('.before .artifact')].map(card=>{
 const stamp=document.createElement('span');stamp.className='removed-stamp';
 stamp.textContent='REMOVED';stamp.setAttribute('aria-hidden','true');card.append(stamp);
 return {card,seen:false,done:false};
});
let lastStampScroll=scrollY;
function stampPassedCards(){
 const movingDown=scrollY>lastStampScroll;lastStampScroll=scrollY;
 for(const item of stampCards){
  if(item.done)continue;
  const rect=item.card.getBoundingClientRect();if(!rect.width)continue;
  if(item.seen&&movingDown&&rect.top<innerHeight*.22&&rect.bottom>90){
   item.done=true;item.card.classList.add('is-removed');
   if(!reduced())item.card.classList.add('stamp-impact');
  }else if(rect.top>=innerHeight*.22&&rect.top<innerHeight*.75&&rect.bottom>innerHeight*.35){item.seen=true;}
 }
}

const proofDialog=section.querySelector('.proof-dialog');
const proofImage=proofDialog.querySelector('img');
section.querySelectorAll('[data-proof]').forEach(button=>{
 button.addEventListener('click',()=>{
  proofImage.src=button.dataset.proof;
  proofImage.alt=button.dataset.caption;
  proofDialog.querySelector('#proof-title').textContent=button.dataset.caption;
  proofDialog.querySelector('.proof-dialog-note').hidden=!button.dataset.proof.includes('local-rank');
  proofDialog.showModal();
 });
});
proofDialog.querySelector('.proof-close').addEventListener('click',()=>proofDialog.close());
proofDialog.addEventListener('click',event=>{
 const bounds=proofDialog.getBoundingClientRect();
 if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)proofDialog.close();
});

// Per-row view selection (Micro-toggles for mobile Before / With Webomancy)
section.querySelectorAll('.contrast-row').forEach(row=>{
 const buttons=[...row.querySelectorAll('[data-row-select]')];
 if(!buttons.length)return;
 row.dataset.rowView='after';
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const view=button.dataset.rowSelect;
  row.dataset.rowView=view;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  schedule();
 }));
});

