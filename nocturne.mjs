import {SilkWeb,clamp} from './silk.mjs?v=58';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const canvas=$('#atelier-canvas'),ctx=canvas.getContext('2d'),root=$('.continuous-canvas'),hero=$('.hero'),work=$('#web-workspace'),layer=$('#token-layer');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduce=media.matches,paused=false,modalOpen=false,rootVisible=true,workVisible=false,raf=0,last=0,elapsed=0,accumulator=0,nextSpawn=1.2,sequence=0,luxuryIndex=0,noiseIndex=0,total=0,activeStrand=-1,threadPosition=0,threadVelocity=0;
let width=0,height=0,heroHeight=0,workTop=0,workLeft=0,workHeight=0,pipelineY=0,mobileFadeEdge=0,mobile=false,web,contrastNodeY=0;
let tokens=[],ripples=[],streams=[],litUntil=[0,0,0,0],exitTrail=[];
let inFrame=false;
const tensionReadout=$('#tension-readout');
const tokenSizes=new ResizeObserver(entries=>{for(const entry of entries){const t=tokens.find(t=>t.el===entry.target);if(t){t.w=t.el.offsetWidth;t.h=t.el.offsetHeight;}}});

const anchors=$$('.service-anchor');
const luxury=[['Boutique Heritage Villa Architecture','EST. HIGH-TICKET'],['Turnkey Penthouse Interior Architecture','FULL-SCOPE'],['Bespoke Luxury Residence Design','PRE-QUALIFIED'],['Private Estate & Spatial Planning','VERIFIED LEAD'],['Private Art Gallery & Residence','ARCHITECTURAL'],['Ultra-Luxury Duplex Renovation','PRIORITY INQUIRY']];
const mobileLuxury=['Heritage villa architecture','Turnkey penthouse interiors','Bespoke residence design','Private estate planning','Art gallery & residence','Luxury duplex renovation'];
const mobileNoise=['Single-room consultation','Small kitchen quote','Vendor enquiry'];
const noise=[['Single Room Paint & Decor Consultation','FILTERED: SCOPE'],['Low-Budget Modular Kitchen Quote','FILTERED: BUDGET'],['Unverified Cold Vendor Inquiry','BLOCKED']];
function animate(el,frames,options){if(!reduce&&el?.animate)el.animate(frames,options);}
function clearTokens(){tokens.forEach(t=>{tokenSizes.unobserve(t.el);t.el.remove();});tokens=[];streams=[];ripples=[];}
function layout(){width=document.documentElement.clientWidth;height=innerHeight;mobile=width<=700;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx?.setTransform(dpr,0,0,dpr,0,0);heroHeight=hero.offsetHeight;const contrastNode=$('.arrival-node');contrastNodeY=contrastNode?contrastNode.getBoundingClientRect().top+scrollY+3.5:0;const r=work.getBoundingClientRect();workTop=r.top+scrollY;workLeft=r.left;workHeight=r.height;pipelineY=workTop+workHeight+40;web=new SilkWeb(width,workTop,workHeight,mobile,height);const cards=anchors.map(a=>a.getBoundingClientRect());mobileFadeEdge=Math.min(...cards.map(r=>r.top))+scrollY-12;web.setSupport((mobile?web.cy+web.ry+52:Math.max(...cards.map(r=>r.bottom))+46+scrollY));web.setAnchors(cards,scrollY);buildExitTrail(cards);clearTokens();nextSpawn=elapsed+.8;draw();wake();}
// Cache the mobile connector from a real rim junction, down the outer gutter.
function buildExitTrail(cards){
 exitTrail=[];if(!mobile||!contrastNodeY)return;
 const start=web.point(web.angles[18],web.radii.at(-1));
 const gutter=Math.max(8,width*.035);
 const firstY=Math.max(start.y+24,Math.min(...cards.map(r=>r.top+scrollY))-22);
 const ctaBottom=$('.ecosystem-end').getBoundingClientRect().bottom+scrollY;
 const bendY=Math.min(contrastNodeY-30,Math.max(firstY+30,ctaBottom+8));
 const corner={x:gutter,y:firstY},bend={x:gutter,y:bendY},end={x:width*.5,y:contrastNodeY};
 const curve=(a,b,c,d)=>{for(let i=0;i<=32;i++){const t=i/32,u=1-t;exitTrail.push({x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y});}};
 curve(start,{x:start.x*.6,y:start.y+22},{x:gutter,y:firstY-25},corner);
 curve(corner,{x:gutter,y:firstY+(bendY-firstY)/3},{x:gutter,y:bendY-(bendY-firstY)/3},bend);
 curve(bend,{x:gutter,y:bendY+(end.y-bendY)*.55},{x:end.x,y:end.y-18},end);
}
function diamond(x,y,size,fill=true){ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size,y);ctx.closePath();fill?ctx.fill():ctx.stroke();}
function draw(){if(!ctx||!web)return;ctx.clearRect(0,0,width,height);const sy=scrollY;ctx.save();ctx.translate(0,-sy);
 const end0=heroHeight*.85,p=clamp((sy+height*.72-end0)/(web.entry.y-end0));const load=reduce?1:clamp(elapsed/1.75);const threadX=width*(mobile?.88:.5),tipY=end0*load;
 ctx.beginPath();ctx.moveTo(width*.5,0);ctx.bezierCurveTo(threadX+threadPosition,Math.min(200,tipY*.4),threadX-threadPosition,tipY*.72,threadX,tipY);ctx.strokeStyle='rgba(200,169,110,.68)';ctx.lineWidth=.9;ctx.stroke();
 let tipX=threadX,end=tipY;
 if(p>0){
  const t=p,u=1-t,controlY=end0+(web.entry.y-end0)*.55;
  tipX=u*u*u*threadX+3*u*u*t*threadX+3*u*t*t*web.entry.x+t*t*t*web.entry.x;
  end=u*u*u*end0+3*u*u*t*controlY+3*u*t*t*controlY+t*t*t*web.entry.y;
  ctx.beginPath();ctx.moveTo(threadX,end0);
  // Draw only the reached portion of the same continuous cubic filament.
  for(let i=1;i<=60;i++){const v=p*i/60,w=1-v;ctx.lineTo(w*w*w*threadX+3*w*w*v*threadX+3*w*v*v*web.entry.x+v*v*v*web.entry.x,w*w*w*end0+3*w*w*v*controlY+3*w*v*v*controlY+v*v*v*web.entry.y);}
  ctx.stroke();
 }
 ctx.fillStyle='#e6d2aa';diamond(tipX,end,2.5);
 if(web.bottom-sy>0&&web.top-sy<height){ctx.globalAlpha=.45+.55*p;web.draw(ctx,{time:reduce?0:elapsed,active:activeStrand,ripples,mobile});ctx.globalAlpha=1;}
 for(const stream of streams){const age=(elapsed-stream.time)/1.5;for(let i=0;i<5;i++){const t=clamp(age-i*.045);if(t<=0||t>=1)continue;let x,y;if(t<.52){const v=t/.52;x=stream.x+(web.cx-stream.x)*v;y=stream.y+(web.cy-stream.y)*v;}else{const v=(t-.52)/.48;x=web.cx+(width*.5-web.cx)*v;y=web.cy+(pipelineY-web.cy)*v;}ctx.globalAlpha=Math.sin(t*Math.PI)*.7;ctx.fillStyle='#e6d2aa';diamond(x,y,1.3);}}
 if(contrastNodeY){
  if(mobile){
   const start=exitTrail[0],end=exitTrail.at(-1);
   if(start&&start.y-sy<height&&end.y-sy>0){
    const reach=reduce?end.y:clamp(sy+height*.8,start.y,end.y);
    ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(start.x,start.y);
    for(let i=1;i<exitTrail.length;i++){
     const a=exitTrail[i-1],b=exitTrail[i];
     if(b.y>reach){const t=clamp((reach-a.y)/(b.y-a.y||1));ctx.lineTo(a.x+(b.x-a.x)*t,reach);break;}
     ctx.lineTo(b.x,b.y);
    }
    ctx.strokeStyle='rgba(200,169,110,.45)';ctx.lineWidth=.7;ctx.stroke();
   }
  }else if(web.support){
   const start=web.support.threads[0][0],end={x:width*.5,y:contrastNodeY};
   if(start.y-sy<height&&end.y-sy>0){
    const progress=reduce?1:clamp((sy+height*.8-start.y)/(end.y-start.y));
    ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(start.x,start.y);
    for(let i=1;i<=60;i++){const t=progress*i/60,u=1-t;ctx.lineTo(u*u*u*start.x+3*u*u*t*width*.06+3*u*t*t*end.x+t*t*t*end.x,u*u*u*start.y+3*u*u*t*(start.y+140)+3*u*t*t*(end.y-140)+t*t*t*end.y);}
    ctx.strokeStyle='rgba(200,169,110,.45)';ctx.lineWidth=.7;ctx.stroke();
   }
  }
 }
 ctx.globalAlpha=1;ctx.restore();
}
function spawn(isNoise=false,x,manual=false){if(tokens.length>=(mobile?1:3))return false;const list=isNoise?noise:luxury;const info=list[(isNoise?noiseIndex++:luxuryIndex++)%list.length];sequence++;x=x??web.cx+(Math.random()-.5)*web.rx*.32;const el=document.createElement('div');el.className='inquiry-token'+(isNoise?' noise':'');const dot=document.createElement('i');dot.className='token-dot';const name=document.createElement('span');name.className='token-name';name.textContent=mobile?(isNoise?mobileNoise[(noiseIndex-1)%mobileNoise.length]:mobileLuxury[(luxuryIndex-1)%mobileLuxury.length]):info[0];el.append(dot,name);layer.append(el);const w=el.offsetWidth,h=el.offsetHeight;x=clamp(x,Math.max(w/2+14,web.cx-web.rx*.30),Math.min(width-w/2-14,web.cx+web.rx*.30));const token={el,x,y:web.surface(x)-h/2-(mobile?65:160),w,h,vy:1.3+Math.random()*.25,vx:(Math.random()-.5)*.18,isNoise,info,state:'falling',born:elapsed,manual};tokens.push(token);tokenSizes.observe(el);if(reduce||paused){if(isNoise){token.state='filtered';token.caughtAt=elapsed;}else{token.y=web.surface(x)-h*.5;token.state='static';capture(token);}}place(token);wake();return true;}
function place(t){const y=t.y-workTop-t.h/2;let opacity=t.isNoise?.88:1;let scale=1;if(t.state==='filtered'){const surfaceY=web.surface(t.x);const depth=Math.max(0,t.y-surfaceY);const fadeEnd=mobile?Math.max(1,Math.min(130,mobileFadeEdge-t.h/2-surfaceY)):270;const fadeStart=mobile?Math.min(20,fadeEnd*.2):80;if(depth<=fadeStart){opacity=0.88;scale=1;}else{const fadeProgress=clamp((depth-fadeStart)/(fadeEnd-fadeStart));opacity=0.88*Math.cos(fadeProgress*Math.PI*0.5);scale=1-fadeProgress*.10;}}if(t.state==='dissolve')opacity=clamp(1-(elapsed-t.dissolveAt)/.65);t.el.style.transform=`translate3d(${(t.x-workLeft).toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,0) scale(${scale.toFixed(3)})`;t.el.style.opacity=String(Math.max(0,opacity).toFixed(3));}
function capture(t){if(t.counted)return;t.counted=true;total++;const count=$('#capture-count');if(count)count.textContent=String(total).padStart(2,'0');const latest=$('#latest-inquiry');if(latest)latest.textContent=t.info[0];if(!mobile)litUntil[total%4]=elapsed+1.8;}
function update(){threadVelocity+=-threadPosition*.025;threadVelocity*=.92;threadPosition+=threadVelocity;const dead=[];
 for(const t of tokens){if(t.state==='falling'){t.vy=Math.min(t.vy+.018,2.4);t.y+=t.vy;t.x+=t.vx;t.vx*=.998;const line=web.surface(t.x);if(t.y+t.h/2>=line){if(t.isNoise){t.state='filtered';t.el.classList.add('passing');}else{t.state='caught';t.caughtAt=elapsed;t.el.classList.add('caught');ripples.push({x:t.x,time:elapsed});capture(t);}}}else if(t.state==='caught'){t.y=web.surface(t.x)-t.h/2;if(elapsed-t.caughtAt>(mobile?3.4:2.1)){t.state='dissolve';t.dissolveAt=elapsed;streams.push({x:t.x,y:t.y,time:elapsed});}}else if(t.state==='filtered'){t.y+=t.vy;t.x+=t.vx;t.vx*=.998;if(t.y>(mobile?Math.min(web.surface(t.x)+140,mobileFadeEdge-t.h/2):web.surface(t.x)+280))dead.push(t);}else if(t.state==='dissolve'&&elapsed-t.dissolveAt>.7)dead.push(t);else if(t.state==='static'&&elapsed-t.born>3)dead.push(t);}
 for(const t of dead){tokenSizes.unobserve(t.el);t.el.remove();tokens.splice(tokens.indexOf(t),1);}ripples=ripples.filter(r=>elapsed-r.time<2);streams=streams.filter(r=>elapsed-r.time<2);anchors.forEach((a,i)=>a.classList.toggle('lit',litUntil[i]>elapsed));
}
function running(){const hovering=activeStrand>=0||(web?.hoverLevels&&Math.max(...web.hoverLevels)>0.005);return !document.hidden&&rootVisible&&scrollY<(web?.bottom??heroHeight)&&(!paused||hovering)&&!reduce&&!modalOpen;}
// Keep the original 60 Hz motion without duplicate or high-refresh redraws.
function frame(now){
 raf=0;
 if(!running())return;
 if(last&&now-last<1000/60-.1){raf=requestAnimationFrame(frame);return;}
 const dt=Math.min((now-(last||now))/1000,.05);last=now;
 inFrame=true;try{elapsed+=dt;accumulator+=dt;
 while(accumulator>=1/60){update();accumulator-=1/60;}
 if(workVisible&&elapsed>nextSpawn){spawn(sequence%3===2);nextSpawn=elapsed+(mobile?5.5:5);}
 tokens.forEach(place);
 const label=ripples.length?'A NEW CONNECTION':'EVERY STRAND HAS A PURPOSE';
 if(tensionReadout.textContent!==label)tensionReadout.textContent=label;
 draw();}finally{inFrame=false;}if(!raf&&running())raf=requestAnimationFrame(frame);
}
function wake(){
 // A spawn inside update must not start a second animation chain.
 if(inFrame)return;
 if(running()){if(!raf){last=0;raf=requestAnimationFrame(frame);}}
 else{if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)draw();}
}
function preferences(){reduce=media.matches||document.documentElement.hasAttribute('data-reduced-motion');$('#reduce-motion').setAttribute('aria-pressed',String(reduce));$('#reduce-motion').textContent=reduce?'Motion reduced':'Reduce motion';if(reduce){document.getAnimations().forEach(a=>a.cancel());clearTokens();threadPosition=threadVelocity=0;}wake();}
$('#pause-motion').addEventListener('click',()=>{paused=!paused;$('#pause-motion').setAttribute('aria-pressed',String(paused));$('#pause-motion').setAttribute('aria-label',paused?'Resume animation':'Pause animation');$('#pause-motion svg path').setAttribute('d',paused?'M5 3L12 8 5 13Z':'M5 3V13M11 3V13');wake();});
$('#reduce-motion').addEventListener('click',()=>{document.documentElement.toggleAttribute('data-reduced-motion');preferences();});media.addEventListener('change',preferences);
let manualDropCount=1;
$('#drop-inquiry').addEventListener('click',()=>{if(mobile||reduce||paused)clearTokens();spawn((manualDropCount++)%2===1,undefined,true);});
let pointer={x:0,y:0,seen:false};document.addEventListener('pointermove',e=>{if(reduce||paused||e.pointerType==='touch')return;const x=e.clientX,y=e.clientY+scrollY,dx=pointer.seen?x-pointer.x:0,dy=pointer.seen?y-pointer.y:0;const tx=width*(mobile?.88:.5);if(y<heroHeight&&Math.abs(x-tx)<60)threadVelocity+=clamp(dx,-8,8)*.045;pointer={x,y,seen:true};},{passive:true});
let down=null;work.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});work.addEventListener('click',e=>{if(e.target.closest('button,a')||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;const y=e.clientY+scrollY;if(y>workTop+90&&y<web.cy-30){if(reduce||paused)clearTokens();spawn(sequence%3===2,e.clientX,true);}});
anchors.forEach((a,i)=>{a.addEventListener('pointerenter',()=>{if(!mobile){activeStrand=i;wake();}});a.addEventListener('pointerleave',()=>{if(!mobile){activeStrand=-1;wake();}});a.addEventListener('focus',()=>{if(!mobile){activeStrand=i;wake();}});a.addEventListener('blur',()=>{if(!mobile){activeStrand=-1;wake();}});a.addEventListener('click',()=>{litUntil[i]=elapsed+2.0;if(web?.pluck)web.pluck(i,elapsed);if(!mobile){activeStrand=i;}else{activeStrand=i;setTimeout(()=>{if(activeStrand===i){activeStrand=-1;wake();}},2000);}if(web?.anchorStrands?.[i]){const s=web.anchorStrands[i];streams.push({x:s.pin.x,y:s.pin.y,time:elapsed});ripples.push({x:s.webNode.x,time:elapsed});}else{ripples.push({x:web?.cx??width*.5,time:elapsed});}wake();});});
const dialog=$('#audit-dialog');let opener;
$$('.audit-trigger').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();opener=b;dialog.showModal();dialog.classList.remove('is-closing');modalOpen=true;wake();}));
dialog.addEventListener('close',()=>{modalOpen=false;opener?.focus({preventScroll:true});wake();});
new IntersectionObserver(entries=>{rootVisible=entries[0].isIntersecting;wake();}).observe(root);new IntersectionObserver(entries=>{workVisible=entries[0].isIntersecting;wake();},{threshold:.12}).observe(work);
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,120);});addEventListener('scroll',()=>{$('.site-nav').classList.toggle('scrolled',scrollY>35);if(!running())draw();wake();},{passive:true});document.addEventListener('visibilitychange',wake);
$('#year').textContent=new Date().getFullYear();layout();preferences();document.fonts?.ready.then(layout);animate($('.hero-copy'),[{transform:'translateY(18px)'},{transform:'translateY(0)'}],{duration:1400,easing:'cubic-bezier(.16,1,.3,1)'});
