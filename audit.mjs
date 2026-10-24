const dialog=document.querySelector('#audit-dialog');
const form=document.querySelector('#audit-form');
const submit=document.querySelector('#submit-audit');
const status=document.querySelector('#audit-error');
const fallback=document.querySelector('#audit-fallback');
let closeTimer=0,busy=false;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.hasAttribute('data-reduced-motion');
function closeDrawer(){
 if(!dialog.open||dialog.classList.contains('is-closing'))return;
 if(reduced()){dialog.close();return;}
 dialog.classList.add('is-closing');document.body.classList.remove('vault-open');closeTimer=setTimeout(()=>dialog.close(),420);
}
document.querySelector('#close-audit').addEventListener('click',closeDrawer);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDrawer();});
dialog.addEventListener('close',()=>{clearTimeout(closeTimer);dialog.classList.remove('is-closing');});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDrawer();});
function whatsapp(data){return 'https://wa.me/918655686355?text='+encodeURIComponent(`Hi Webomancy! I'd like a Studio Audit for ${data.studio_name} (${data.website_or_instagram}) in ${data.city}. We're looking to target ${data.target_budget} projects.`);}
form.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement)e.target.setCustomValidity('');});
form.addEventListener('change',e=>{
 if(e.target&&e.target.name==='target_budget'){
  const warn=document.getElementById('budget-warning');
  if(warn)warn.hidden=!e.target.value.includes('30L');
 }
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 form.querySelectorAll('input[required]:not([type=radio])').forEach(i=>i.setCustomValidity(i.value.trim()?'':'Please enter this detail.'));
 const phone=form.elements.whatsapp_number;
 phone.setCustomValidity(/^[+\d\s().-]+$/.test(phone.value)&&phone.value.replace(/\D/g,'').length>=7&&phone.value.replace(/\D/g,'').length<=15?'':'Enter a valid WhatsApp number with country code.');
 if(!form.reportValidity())return;
 const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,String(v).trim()]));
 if(data._honey)return;
 fallback.href=whatsapp(data);status.hidden=true;fallback.hidden=true;
 busy=true;submit.disabled=true;form.setAttribute('aria-busy','true');submit.querySelector('.submit-label').textContent='Sending your studio brief...';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch('https://formsubmit.co/ajax/webomancy@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({...data,_subject:'New Luxury Studio Audit Request: '+data.studio_name,_template:'table',_captcha:'false'}),signal:controller.signal});
  const result=await response.json();
  if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Not accepted');
  for(const [id,value] of Object.entries({'success-studio':data.studio_name,'summary-studio':data.studio_name,'summary-city':data.city,'summary-budget':data.target_budget}))document.getElementById(id).textContent=value;
  document.querySelector('#send-audit').href=whatsapp(data);
  document.querySelector('#audit-entry').hidden=true;document.querySelector('#audit-success').hidden=false;
  dialog.setAttribute('aria-labelledby','audit-success-title');dialog.scrollTop=0;
  document.querySelector('#audit-success').focus({preventScroll:true});
 }catch{
  status.textContent='We could not confirm delivery. Your details are still here. Try again, or send your brief directly on WhatsApp.';status.hidden=false;fallback.hidden=false;
 }finally{
  clearTimeout(timeout);busy=false;submit.disabled=false;form.removeAttribute('aria-busy');submit.querySelector('.submit-label').textContent='Request Territory Audit';
 }
});

const scene=document.querySelector('#page-scene');
new MutationObserver(()=>{
 const open=dialog.open&&!dialog.classList.contains('is-closing');
 if(open)scene.style.setProperty('--vault-origin',`${scrollY+innerHeight*.5}px`);
 document.body.classList.toggle('vault-open',open);
}).observe(dialog,{attributes:true,attributeFilter:['open']});

if(typeof document.querySelectorAll==='function')document.querySelectorAll('.audit-trigger').forEach(b=>{
 b.addEventListener('click',e=>{
  e.preventDefault();
  if(dialog&&!dialog.open){
   dialog.showModal();
   dialog.classList.remove('is-closing');
   document.body.classList.add('vault-open');
  }
 });
});
