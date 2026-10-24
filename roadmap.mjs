const roadmap=document.querySelector('#roadmap');
const stages=[...roadmap.querySelectorAll('.roadmap-stage')];
const thread=roadmap.querySelector('.roadmap-thread');
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.hasAttribute('data-reduced-motion');
let visible=false,frame=0;
function update(){
 frame=0;
 const quiet=reduced();
 roadmap.classList.toggle('is-tracking',!quiet);
 const y=innerHeight*.55;
 const line=thread.getBoundingClientRect();
 roadmap.style.setProperty('--road-progress',`${quiet?line.height:Math.max(0,Math.min(line.height,y-line.top))}px`);
 let nearest=null,distance=Infinity;
 for(const stage of stages){
  const rect=stage.getBoundingClientRect();
  const node=stage.querySelector('.milestone').getBoundingClientRect();
  stage.classList.toggle('is-lit',quiet||node.top<=y);
  const d=Math.abs(rect.top+Math.min(rect.height/2,220)-y);
  if(d<distance){distance=d;nearest=stage;}
 }
 for(const stage of stages)stage.classList.toggle('is-active',quiet||stage===nearest);
}
function schedule(){if(!frame)frame=requestAnimationFrame(update);}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();}).observe(roadmap);
addEventListener('scroll',()=>{if(visible)schedule();},{passive:true});
addEventListener('resize',()=>{if(visible)schedule();},{passive:true});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',schedule);
document.querySelector('#reduce-motion')?.addEventListener('change',schedule);
update();
